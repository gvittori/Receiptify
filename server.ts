import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// API endpoint to parse supermarket receipt image using Gemini
app.post("/api/parse-receipt", async (req, res) => {
  try {
    const { image, mimeType = "image/jpeg", customApiKey } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: "No image data provided" });
    }

    const apiKey = customApiKey?.trim() || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ 
        error: "Gemini API key is missing. Please provide a key in the settings textbox or configure GEMINI_API_KEY." 
      });
    }

    // Clean base64 string if it contains data URI prefix
    let base64Data = image;
    let detectedMime = mimeType;
    if (image.startsWith("data:")) {
      const matches = image.match(/^data:(.+?);base64,(.+)$/);
      if (matches) {
        detectedMime = matches[1];
        base64Data = matches[2];
      }
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const imagePart = {
      inlineData: {
        mimeType: detectedMime,
        data: base64Data,
      },
    };

    const promptText = `Analyze this supermarket receipt image and extract all details into the specified JSON format. 
Extract:
- storeName: The name of the supermarket/store (e.g., Whole Foods, Walmart, Trader Joe's, Kroger).
- receiptDate: The date printed on the receipt in YYYY-MM-DD format (if year is missing or unclear, infer current year 2026 or latest plausible date).
- totalAmount: The final total amount paid as a number (e.g. 45.99).
- subtotal: Subtotal amount before tax if listed, otherwise null.
- taxAmount: Tax amount if listed, otherwise 0 or null.
- currency: Currency symbol or code (e.g., "$", "USD", "EUR", "GBP").
- paymentMethod: Payment method if listed (e.g., "Visa ending in 1234", "Cash", "Mastercard"), otherwise null.
- items: Array of purchased items. Each item must have:
  - name: Name of the product
  - quantity: Quantity purchased (default 1 if not specified)
  - price: Total price for that item line (unit price * quantity or final line price)
  - category: Suggested grocery category (e.g., "Produce", "Dairy", "Bakery", "Meat", "Beverages", "Snacks", "Household", "Other").`;

    // Retry logic for API calls
    const callGemini = async (retries = 5, delay = 1000) => {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: { parts: [imagePart, { text: promptText }] },
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  storeName: { type: Type.STRING, description: "Supermarket store name" },
                  receiptDate: { type: Type.STRING, description: "Date in YYYY-MM-DD format" },
                  totalAmount: { type: Type.NUMBER, description: "Total amount paid" },
                  subtotal: { type: Type.NUMBER, description: "Subtotal before tax" },
                  taxAmount: { type: Type.NUMBER, description: "Tax amount" },
                  currency: { type: Type.STRING, description: "Currency symbol like $, €, £" },
                  paymentMethod: { type: Type.STRING, description: "Payment method used" },
                  items: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING, description: "Item name" },
                        quantity: { type: Type.NUMBER, description: "Quantity" },
                        price: { type: Type.NUMBER, description: "Line price" },
                        category: { type: Type.STRING, description: "Category of item" }
                      },
                      required: ["name", "price"]
                    },
                    description: "List of items on receipt"
                  }
                },
                required: ["storeName", "receiptDate", "totalAmount", "items"]
              }
            }
          });
          return response;
        } catch (err: any) {
          const isRetryable = 
            err.message?.includes("503") || 
            err.message?.includes("high demand") || 
            err.status === 503 ||
            err.code === 503;
            
          if (isRetryable && i < retries - 1) {
            console.warn(`Gemini API busy (503), retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
            continue;
          }
          throw err;
        }
      }
    };

    const response = await callGemini() as any;

    const rawText = response.text;
    if (!rawText) {
      throw new Error("Failed to generate response from Gemini OCR");
    }

    const parsedData = JSON.parse(rawText);
    res.json({ success: true, receipt: parsedData });

  } catch (error: any) {
    console.error("Receipt parsing error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to parse receipt image. Please ensure the image is clear and try again." 
    });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
