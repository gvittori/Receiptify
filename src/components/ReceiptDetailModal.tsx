import React, { useState } from 'react';
import { X, Calendar, Store, Tag, FileCode, FileSpreadsheet, Edit3, Check, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import { ReceiptData, ReceiptItem, Language } from '../types';
import { translations } from '../translations';

interface ReceiptDetailModalProps {
  receipt: ReceiptData | null;
  onClose: () => void;
  onUpdateReceipt: (updated: ReceiptData) => void;
  onExportJson: (receipt: ReceiptData) => void;
  onExportCsv: (receipt: ReceiptData) => void;
  onRequestDelete?: (receipt: ReceiptData) => void;
  lang: Language;
}

export function ReceiptDetailModal({
  receipt,
  onClose,
  onUpdateReceipt,
  onExportJson,
  onExportCsv,
  onRequestDelete,
  lang,
}: ReceiptDetailModalProps) {
  if (!receipt) return null;

  const t = translations[lang];
  const [isEditing, setIsEditing] = useState(false);
  const [storeName, setStoreName] = useState(receipt.storeName);
  const [receiptDate, setReceiptDate] = useState(receipt.receiptDate);
  const [totalAmount, setTotalAmount] = useState(receipt.totalAmount.toString());
  const [taxAmount, setTaxAmount] = useState((receipt.taxAmount || 0).toString());
  const [items, setItems] = useState<ReceiptItem[]>(JSON.parse(JSON.stringify(receipt.items)));
  const [showImageModal, setShowImageModal] = useState(false);

  const handleAddItem = () => {
    setItems([...items, { name: lang === 'es' ? 'Nuevo Producto' : 'New Item', quantity: 1, price: 0.00, category: lang === 'es' ? 'General' : 'Other' }]);
  };

  const handleItemChange = (index: number, field: keyof ReceiptItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleDeleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const receiptsTotal = (itemList: ReceiptItem[]) => {
    return itemList.reduce((acc, curr) => acc + (curr.price || 0), 0);
  };

  const handleSave = () => {
    const parsedTotal = parseFloat(totalAmount) || receiptsTotal(items);
    const parsedTax = parseFloat(taxAmount) || 0;

    const updatedReceipt: ReceiptData = {
      ...receipt,
      storeName: storeName.trim() || (lang === 'es' ? 'Supermercado' : 'Unknown Store'),
      receiptDate: receiptDate || new Date().toISOString().split('T')[0],
      totalAmount: parsedTotal,
      taxAmount: parsedTax,
      items: items,
    };

    onUpdateReceipt(updatedReceipt);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-lg">
              {isEditing ? t.editReceipt : receipt.storeName}
            </h3>
            <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-mono">
              {receipt.receiptDate}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top metadata summary or edit fields */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                {t.storeNameLabel}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              ) : (
                <p className="text-sm font-bold text-slate-900">{receipt.storeName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                {t.receiptDateLabel}
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={receiptDate}
                  onChange={(e) => setReceiptDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              ) : (
                <p className="text-sm font-bold text-slate-900 font-mono">{receipt.receiptDate}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                {t.totalAmountLabel} ({receipt.currency})
              </label>
              {isEditing ? (
                <input
                  type="number"
                  step="0.01"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              ) : (
                <p className="text-sm font-extrabold text-emerald-600">
                  {receipt.currency}{receipt.totalAmount.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          {/* Payment & Tax extra info */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 px-1 gap-2">
            {receipt.paymentMethod && <span>{t.paymentLabel}: <strong className="text-slate-700">{receipt.paymentMethod}</strong></span>}
            {receipt.taxAmount !== undefined && receipt.taxAmount !== null && receipt.taxAmount > 0 && (
              <span>{t.taxLabel}: <strong className="text-slate-700">{receipt.currency}{Number(receipt.taxAmount).toFixed(2)}</strong></span>
            )}
            {receipt.rawImage && (
              <button
                onClick={() => setShowImageModal(true)}
                className="text-emerald-700 hover:text-emerald-800 font-medium inline-flex items-center gap-1 underline cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" /> {t.viewImageLabel}
              </button>
            )}
          </div>

          {/* Items Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                {t.itemsTitle} ({items.length})
              </h4>
              {isEditing && (
                <button
                  onClick={handleAddItem}
                  className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-xl font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> {t.addItem}
                </button>
              )}
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                    <th className="py-2.5 px-3">{t.colItemName}</th>
                    <th className="py-2.5 px-3 w-20">{t.colQty}</th>
                    <th className="py-2.5 px-3 w-28 text-right">{t.colPrice}</th>
                    <th className="py-2.5 px-3 w-32">{t.colCategory}</th>
                    {isEditing && <th className="py-2.5 px-2 w-10"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg"
                          />
                        ) : (
                          <span className="font-medium text-slate-900">{item.name}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {isEditing ? (
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 1)}
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg"
                          />
                        ) : (
                          <span className="text-slate-600">{item.quantity}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={item.price}
                            onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg text-right"
                          />
                        ) : (
                          <span className="font-semibold text-slate-900">
                            {receipt.currency}{item.price.toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={item.category || 'Other'}
                            onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg"
                          />
                        ) : (
                          <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[11px] font-medium">
                            {item.category || 'General'}
                          </span>
                        )}
                      </td>
                      {isEditing && (
                        <td className="py-2.5 px-2 text-center">
                          <button
                            onClick={() => handleDeleteItem(index)}
                            className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onExportJson(receipt)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl transition-colors cursor-pointer"
            >
              <FileCode className="w-4 h-4 text-emerald-600" /> {t.btnExportJson}
            </button>
            <button
              onClick={() => onExportCsv(receipt)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> {t.btnExportCsv}
            </button>
            {onRequestDelete && (
              <button
                onClick={() => {
                  onRequestDelete(receipt);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-xl transition-colors cursor-pointer"
                title={t.btnDeleteReceipt}
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">{t.btnDeleteReceipt}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  {t.btnCancel}
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> {t.btnSaveChanges}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-xs font-medium bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> {t.btnEditDetails}
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors cursor-pointer"
                >
                  {t.btnClose}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {showImageModal && receipt.rawImage && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full max-h-[90vh] bg-white rounded-2xl p-4 overflow-auto">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-slate-900">{t.imageModalTitle}: {receipt.storeName} ({receipt.receiptDate})</h4>
              <button onClick={() => setShowImageModal(false)} className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <img src={receipt.rawImage} alt="Receipt" className="w-full object-contain rounded-xl border border-slate-200" />
          </div>
        </div>
      )}
    </div>
  );
}

