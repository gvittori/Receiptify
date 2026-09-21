import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, Loader2, FileText } from 'lucide-react';
import { ReceiptData, Language } from '../types';
import { translations } from '../translations';

interface ReceiptScannerProps {
  onReceiptScanned: (receipt: ReceiptData) => void;
  apiKey: string;
  lang: Language;
}

export function ReceiptScanner({ onReceiptScanned, apiKey, lang }: ReceiptScannerProps) {
  const t = translations[lang];
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError(t.errorInvalidImage);
      return;
    }

    setError(null);
    setIsScanning(true);
    setScanStatus(t.processingStep1);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        
        setScanStatus(t.processingStep2);
        const res = await fetch('/api/parse-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64Data,
            mimeType: file.type || 'image/jpeg',
            customApiKey: apiKey,
          }),
        });

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || t.errorFailedParse);
        }

        const parsed = data.receipt;
        const newReceipt: ReceiptData = {
          id: 'rcpt_' + Math.random().toString(36).substr(2, 9),
          storeName: parsed.storeName || (lang === 'es' ? 'Supermercado' : 'Supermarket'),
          receiptDate: parsed.receiptDate || new Date().toISOString().split('T')[0],
          totalAmount: typeof parsed.totalAmount === 'number' ? parsed.totalAmount : 0,
          subtotal: parsed.subtotal || null,
          taxAmount: parsed.taxAmount || 0,
          currency: parsed.currency || (lang === 'es' ? '€' : '$'),
          paymentMethod: parsed.paymentMethod || null,
          items: parsed.items || [],
          rawImage: base64Data,
          createdAt: new Date().toISOString(),
        };

        onReceiptScanned(newReceipt);
      } catch (err: any) {
        console.error(err);
        setError(err.message || t.errorFailedParse);
      } finally {
        setIsScanning(false);
        setScanStatus('');
      }
    };
    reader.onerror = () => {
      setError(t.errorFailedRead);
      setIsScanning(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    // reset input
    e.target.value = '';
  };

  const loadSampleReceipt = () => {
    // Generate a realistic sample receipt based on current language
    const sample: ReceiptData = lang === 'es' ? {
      id: 'rcpt_' + Math.random().toString(36).substr(2, 9),
      storeName: 'Mercadona Supermercados',
      receiptDate: new Date().toISOString().split('T')[0],
      totalAmount: 34.85,
      subtotal: 31.68,
      taxAmount: 3.17,
      currency: '€',
      paymentMethod: 'Tarjeta Visa débito ****1092',
      items: [
        { name: 'Aguacates Hass Malla 1kg', quantity: 1, price: 3.45, category: 'Frutas y Verduras' },
        { name: 'Leche Entera Calcio 6x1L', quantity: 1, price: 5.70, category: 'Lácteos' },
        { name: 'Pan de Masa Madre Hogaza', quantity: 1, price: 2.10, category: 'Panadería' },
        { name: 'Huevos Camperos Docena', quantity: 1, price: 2.95, category: 'Lácteos y Huevos' },
        { name: 'Aceite de Oliva Virgen Extra 1L', quantity: 1, price: 8.90, category: 'Despensa' },
        { name: 'Pechuga de Pollo Fileteada 500g', quantity: 1, price: 4.80, category: 'Carnicería' },
        { name: 'Tomates En Rama 1kg', quantity: 1, price: 2.45, category: 'Frutas y Verduras' },
        { name: 'Yogur Griego Natural 4x125g', quantity: 1, price: 1.50, category: 'Lácteos' },
        { name: 'Café Molido Tueste Natural', quantity: 1, price: 3.00, category: 'Bebidas' },
      ],
      createdAt: new Date().toISOString(),
    } : {
      id: 'rcpt_' + Math.random().toString(36).substr(2, 9),
      storeName: 'Whole Foods Market',
      receiptDate: new Date().toISOString().split('T')[0],
      totalAmount: 38.45,
      subtotal: 35.50,
      taxAmount: 2.95,
      currency: '$',
      paymentMethod: 'Visa ending in 4821',
      items: [
        { name: 'Organic Hass Avocados', quantity: 2, price: 4.98, category: 'Produce' },
        { name: 'Almond Milk Unsweetened', quantity: 1, price: 3.99, category: 'Dairy' },
        { name: 'Sourdough Artisan Bread', quantity: 1, price: 5.49, category: 'Bakery' },
        { name: 'Free Range Organic Eggs', quantity: 1, price: 6.99, category: 'Dairy' },
        { name: 'Organic Baby Spinach', quantity: 1, price: 4.29, category: 'Produce' },
        { name: 'Fair Trade Coffee Beans', quantity: 1, price: 9.76, category: 'Beverages' },
      ],
      createdAt: new Date().toISOString(),
    };
    onReceiptScanned(sample);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 mb-8 transition-all">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span>{t.scannerTitle}</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            {t.scannerDesc}
          </p>
        </div>
        <button
          onClick={loadSampleReceipt}
          className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl transition-colors border border-emerald-200/70 flex items-center gap-1.5 shrink-0 shadow-2xs"
        >
          <FileText className="w-4 h-4" />
          <span>{t.loadSampleBtn}</span>
        </button>
      </div>

      {isScanning ? (
        <div className="border-2 border-dashed border-emerald-300 bg-emerald-50/50 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center animate-pulse">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
            <Sparkles className="w-5 h-5 text-amber-500 absolute -top-1 -right-1 animate-bounce" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">{t.processingTitle}</h3>
            <p className="text-sm text-slate-600 mt-1 max-w-sm mx-auto">{scanStatus}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Camera Capture (Mobile friendly) */}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={cameraInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="group relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white p-6 rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[140px]"
          >
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <span className="font-semibold text-base">{t.takePhoto}</span>
            <span className="text-xs text-emerald-100 mt-0.5">{t.takePhotoDesc}</span>
          </button>

          {/* File Upload */}
          <input
            type="file"
            accept="image/*,application/pdf"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="group relative overflow-hidden bg-slate-50 hover:bg-slate-100 text-slate-800 border-2 border-dashed border-slate-300 hover:border-slate-400 p-6 rounded-2xl transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[140px]"
          >
            <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-slate-700">
              <Upload className="w-6 h-6" />
            </div>
            <span className="font-semibold text-base">{t.uploadFile}</span>
            <span className="text-xs text-slate-500 mt-0.5">{t.uploadFileDesc}</span>
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold ml-2">×</button>
        </div>
      )}
    </div>
  );
}

