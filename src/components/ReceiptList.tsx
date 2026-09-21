import React, { useState } from 'react';
import { Search, Filter, Calendar, Store, Trash2, Eye, FileSpreadsheet, FileCode, ShoppingCart, ArrowUpDown } from 'lucide-react';
import { ReceiptData, Language } from '../types';
import { translations } from '../translations';

interface ReceiptListProps {
  receipts: ReceiptData[];
  onSelectReceipt: (receipt: ReceiptData) => void;
  onRequestDelete: (receipt: ReceiptData) => void;
  onExportSingleJson: (receipt: ReceiptData) => void;
  onExportSingleCsv: (receipt: ReceiptData) => void;
  lang: Language;
}

export function ReceiptList({
  receipts,
  onSelectReceipt,
  onRequestDelete,
  onExportSingleJson,
  onExportSingleCsv,
  lang,
}: ReceiptListProps) {
  const t = translations[lang];
  const [searchQuery, setSearchQuery] = useState('');
  const [storeFilter, setStoreFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'total-desc' | 'store'>('date-desc');

  // Unique stores for filter
  const stores = Array.from(new Set(receipts.map((r) => r.storeName)));

  // Filter and sort receipts
  const filteredReceipts = receipts.filter((r) => {
    const matchesSearch =
      r.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.receiptDate.includes(searchQuery) ||
      r.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStore = storeFilter === 'all' || r.storeName === storeFilter;

    return matchesSearch && matchesStore;
  }).sort((a, b) => {
    if (sortBy === 'date-desc') {
      return new Date(b.receiptDate).getTime() - new Date(a.receiptDate).getTime();
    } else if (sortBy === 'date-asc') {
      return new Date(a.receiptDate).getTime() - new Date(b.receiptDate).getTime();
    } else if (sortBy === 'total-desc') {
      return b.totalAmount - a.totalAmount;
    } else {
      return a.storeName.localeCompare(b.storeName);
    }
  });

  if (receipts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-2xs">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">{t.emptyTitle}</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          {t.emptyDesc}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
              className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">{t.allStores} ({receipts.length})</option>
              {stores.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="date-desc">{t.sortNewest}</option>
              <option value="date-asc">{t.sortOldest}</option>
              <option value="total-desc">{t.sortHighest}</option>
              <option value="store">{t.sortStore}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Receipts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReceipts.map((receipt) => (
          <div
            key={receipt.id}
            className="bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
          >
            {/* Header info matching requirement: Date as name, total, store */}
            <div className="p-5 border-b border-slate-100 flex-1">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    {receipt.receiptDate}
                  </span>
                  <h3 className="font-bold text-slate-900 text-lg group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{receipt.storeName}</span>
                  </h3>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xl font-extrabold text-slate-950">
                    {receipt.currency}{receipt.totalAmount.toFixed(2)}
                  </span>
                  <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">{t.totalLabel}</p>
                </div>
              </div>

              {/* Items summary */}
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
                  <span>{receipt.items.length} {t.itemsParsed}</span>
                  {receipt.paymentMethod && <span className="truncate max-w-[150px]">{receipt.paymentMethod}</span>}
                </div>
                <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                  {receipt.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs text-slate-700">
                      <span className="truncate max-w-[180px]">{item.quantity}x {item.name}</span>
                      <span className="font-mono text-slate-900">{receipt.currency}{item.price.toFixed(2)}</span>
                    </div>
                  ))}
                  {receipt.items.length > 3 && (
                    <p className="text-[11px] text-slate-400 italic pt-0.5">
                      + {receipt.items.length - 3} {t.moreItems}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onSelectReceipt(receipt)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800 bg-white hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors shadow-2xs cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{t.viewDetails}</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onExportSingleJson(receipt)}
                  title={t.exportJsonTooltip}
                  aria-label={t.exportJsonTooltip}
                  className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
                >
                  <FileCode className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onExportSingleCsv(receipt)}
                  title={t.exportCsvTooltip}
                  aria-label={t.exportCsvTooltip}
                  className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestDelete(receipt);
                  }}
                  title={t.deleteTooltip}
                  aria-label={t.deleteTooltip}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

