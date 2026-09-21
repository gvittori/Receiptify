export interface ReceiptItem {
  id?: string;
  name: string;
  quantity: number;
  price: number;
  category?: string;
}

export interface ReceiptData {
  id: string;
  storeName: string;
  receiptDate: string; // YYYY-MM-DD
  totalAmount: number;
  subtotal?: number | null;
  taxAmount?: number | null;
  currency: string;
  paymentMethod?: string | null;
  items: ReceiptItem[];
  rawImage?: string; // base64 thumbnail
  createdAt: string; // ISO string
}

export type ExportFormat = 'json' | 'csv' | 'spreadsheet';

export type Language = 'es' | 'en';
