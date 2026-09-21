import React, { useState } from 'react';
import { X, FileCode, FileSpreadsheet, Download, Copy, Check } from 'lucide-react';
import { ReceiptData, Language } from '../types';
import { translations } from '../translations';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipts: ReceiptData[];
  lang: Language;
}

export function ExportModal({ isOpen, onClose, receipts, lang }: ExportModalProps) {
  const t = translations[lang];
  const [copied, setCopied] = useState(false);
  const [exportType, setExportType] = useState<'json' | 'csv'>('json');

  if (!isOpen) return null;

  // Generate JSON string
  const getJsonString = () => {
    return JSON.stringify(receipts, null, 2);
  };

  // Generate CSV string for spreadsheet import (Excel, Google Sheets, etc.)
  const getCsvString = () => {
    const headers = ['ReceiptID', 'StoreName', 'ReceiptDate', 'TotalAmount', 'TaxAmount', 'Currency', 'PaymentMethod', 'ItemName', 'Quantity', 'ItemPrice', 'ItemCategory'];
    const rows: string[] = [headers.join(',')];

    receipts.forEach((r) => {
      if (r.items.length === 0) {
        rows.push([
          `"${r.id}"`,
          `"${r.storeName.replace(/"/g, '""')}"`,
          `"${r.receiptDate}"`,
          r.totalAmount,
          r.taxAmount || 0,
          `"${r.currency}"`,
          `"${(r.paymentMethod || '').replace(/"/g, '""')}"`,
          '""',
          0,
          0,
          '""',
        ].join(','));
      } else {
        r.items.forEach((item) => {
          rows.push([
            `"${r.id}"`,
            `"${r.storeName.replace(/"/g, '""')}"`,
            `"${r.receiptDate}"`,
            r.totalAmount,
            r.taxAmount || 0,
            `"${r.currency}"`,
            `"${(r.paymentMethod || '').replace(/"/g, '""')}"`,
            `"${item.name.replace(/"/g, '""')}"`,
            item.quantity,
            item.price,
            `"${(item.category || '').replace(/"/g, '""')}"`,
          ].join(','));
        });
      }
    });

    return rows.join('\n');
  };

  const handleDownload = () => {
    const content = exportType === 'json' ? getJsonString() : getCsvString();
    const mimeType = exportType === 'json' ? 'application/json' : 'text/csv';
    const extension = exportType === 'json' ? 'json' : 'csv';

    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `supermarket_receipts_${new Date().toISOString().split('T')[0]}.${extension}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = () => {
    const content = exportType === 'json' ? getJsonString() : getCsvString();
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const previewText = exportType === 'json' ? getJsonString() : getCsvString();

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            <h3 className="font-semibold text-lg">{t.exportModalTitle} ({receipts.length})</h3>
          </div>
          <button onClick={onClose} className="text-emerald-100 hover:text-white p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setExportType('json')}
              className={`flex-1 py-2.5 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                exportType === 'json'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <FileCode className="w-4 h-4 text-emerald-600" />
              <span>{t.saveJsonTab}</span>
            </button>
            <button
              onClick={() => setExportType('csv')}
              className={`flex-1 py-2.5 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                exportType === 'csv'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>{t.saveCsvTab}</span>
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t.previewLabel} ({exportType.toUpperCase()})
              </span>
              <button
                onClick={handleCopy}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t.copiedClipboard : t.copyClipboard}</span>
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-64 leading-relaxed">
              {previewText}
            </pre>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            {t.btnCancel}
          </button>
          <button
            onClick={handleDownload}
            className="px-5 py-2.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{t.downloadFileBtn} ({exportType.toUpperCase()})</span>
          </button>
        </div>
      </div>
    </div>
  );
}

