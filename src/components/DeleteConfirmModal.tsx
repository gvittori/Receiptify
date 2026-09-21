import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { ReceiptData } from '../types';
import { translations } from '../translations';

interface DeleteConfirmModalProps {
  receipt: ReceiptData | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
  lang: 'es' | 'en';
}

export function DeleteConfirmModal({
  receipt,
  isOpen,
  onClose,
  onConfirmDelete,
  lang,
}: DeleteConfirmModalProps) {
  if (!isOpen || !receipt) return null;

  const t = translations[lang];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 id="delete-dialog-title" className="text-lg font-bold text-slate-900">
                  {t.deleteModalTitle}
                </h3>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-slate-600 mt-2">
                {t.deleteModalDesc}
              </p>

              {/* Receipt preview info */}
              <div className="mt-3 bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">{t.deleteModalStore}:</span>
                  <span className="text-slate-900 font-semibold truncate max-w-[180px]">{receipt.storeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">{t.deleteModalDate}:</span>
                  <span className="text-slate-900 font-mono font-medium">{receipt.receiptDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">{t.deleteModalTotal}:</span>
                  <span className="text-emerald-700 font-bold">{receipt.currency}{receipt.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <p className="text-xs text-red-600 font-medium mt-3 flex items-center gap-1.5">
                <span>⚠️</span> {t.deleteModalWarning}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            {t.deleteModalCancel}
          </button>
          <button
            type="button"
            onClick={onConfirmDelete}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl shadow-xs transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t.deleteModalConfirm}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
