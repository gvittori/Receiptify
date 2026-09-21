import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ReceiptScanner } from './components/ReceiptScanner';
import { ReceiptList } from './components/ReceiptList';
import { ReceiptDetailModal } from './components/ReceiptDetailModal';
import { ExportModal } from './components/ExportModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ReceiptData, Language } from './types';
import { translations } from './translations';

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('preferred_language');
      if (saved === 'en' || saved === 'es') return saved;
    } catch (e) {
      console.error(e);
    }
    return 'es'; // Default to Spanish as requested
  });

  const [receipts, setReceipts] = useState<ReceiptData[]>(() => {
    try {
      const saved = localStorage.getItem('supermarket_receipts_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('custom_gemini_api_key') || '';
  });

  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [receiptToDelete, setReceiptToDelete] = useState<ReceiptData | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    try {
      localStorage.setItem('preferred_language', lang);
    } catch (e) {
      console.error(e);
    }
  }, [lang]);

  useEffect(() => {
    try {
      localStorage.setItem('supermarket_receipts_v1', JSON.stringify(receipts));
    } catch (e) {
      console.error(e);
    }
  }, [receipts]);

  const handleReceiptScanned = (newReceipt: ReceiptData) => {
    setReceipts((prev) => [newReceipt, ...prev]);
  };

  const handleUpdateReceipt = (updated: ReceiptData) => {
    setReceipts((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setSelectedReceipt(updated);
  };

  const handleConfirmDelete = () => {
    if (!receiptToDelete) return;
    const id = receiptToDelete.id;
    setReceipts((prev) => prev.filter((r) => r.id !== id));
    if (selectedReceipt?.id === id) {
      setSelectedReceipt(null);
    }
    setReceiptToDelete(null);
  };

  const handleExportSingleJson = (receipt: ReceiptData) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(receipt, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `receipt_${receipt.storeName.replace(/\s+/g, '_')}_${receipt.receiptDate}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  const handleExportSingleCsv = (receipt: ReceiptData) => {
    const headers = ['ReceiptID', 'StoreName', 'ReceiptDate', 'TotalAmount', 'TaxAmount', 'Currency', 'PaymentMethod', 'ItemName', 'Quantity', 'ItemPrice', 'ItemCategory'];
    const rows = [headers.join(',')];

    if (receipt.items.length === 0) {
      rows.push([
        `"${receipt.id}"`,
        `"${receipt.storeName.replace(/"/g, '""')}"`,
        `"${receipt.receiptDate}"`,
        receipt.totalAmount,
        receipt.taxAmount || 0,
        `"${receipt.currency}"`,
        `"${(receipt.paymentMethod || '').replace(/"/g, '""')}"`,
        '""', 0, 0, '""'
      ].join(','));
    } else {
      receipt.items.forEach((item) => {
        rows.push([
          `"${receipt.id}"`,
          `"${receipt.storeName.replace(/"/g, '""')}"`,
          `"${receipt.receiptDate}"`,
          receipt.totalAmount,
          receipt.taxAmount || 0,
          `"${receipt.currency}"`,
          `"${(receipt.paymentMethod || '').replace(/"/g, '""')}"`,
          `"${item.name.replace(/"/g, '""')}"`,
          item.quantity,
          item.price,
          `"${(item.category || '').replace(/"/g, '""')}"`
        ].join(','));
      });
    }

    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute("download", `receipt_${receipt.storeName.replace(/\s+/g, '_')}_${receipt.receiptDate}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      <Navbar
        receipts={receipts}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        lang={lang}
        onLanguageChange={setLang}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ReceiptScanner onReceiptScanned={handleReceiptScanned} apiKey={apiKey} lang={lang} />

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{t.sectionTitle}</h2>
            <p className="text-sm text-slate-500">
              {t.sectionSubtitle}
            </p>
          </div>
        </div>

        <ReceiptList
          receipts={receipts}
          onSelectReceipt={(receipt) => setSelectedReceipt(receipt)}
          onRequestDelete={(receipt) => setReceiptToDelete(receipt)}
          onExportSingleJson={handleExportSingleJson}
          onExportSingleCsv={handleExportSingleCsv}
          lang={lang}
        />
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>{t.footerText}</p>
      </footer>

      {/* Modals */}
      <ReceiptDetailModal
        receipt={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        onUpdateReceipt={handleUpdateReceipt}
        onExportJson={handleExportSingleJson}
        onExportCsv={handleExportSingleCsv}
        onRequestDelete={(receipt) => setReceiptToDelete(receipt)}
        lang={lang}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        receipts={receipts}
        lang={lang}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
        lang={lang}
      />

      <DeleteConfirmModal
        receipt={receiptToDelete}
        isOpen={!!receiptToDelete}
        onClose={() => setReceiptToDelete(null)}
        onConfirmDelete={handleConfirmDelete}
        lang={lang}
      />
    </div>
  );
}

