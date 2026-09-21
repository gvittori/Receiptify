import React, { useState } from 'react';
import { Key, X, Check, ShieldCheck } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  lang: Language;
}

export function ApiKeyModal({ isOpen, onClose, apiKey, setApiKey, lang }: ApiKeyModalProps) {
  const t = translations[lang];
  const [tempKey, setTempKey] = useState(apiKey);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(tempKey.trim());
    localStorage.setItem('custom_gemini_api_key', tempKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setTempKey('');
    setApiKey('');
    localStorage.removeItem('custom_gemini_api_key');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            <h3 className="font-semibold text-lg">{t.apiKeyModalTitle}</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-emerald-100 hover:text-white p-1 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            {t.apiKeyModalDesc}
          </p>

          <div>
            <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1">
              {t.apiKeyInputLabel}
            </label>
            <input
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
            />
          </div>

          <div className="bg-emerald-50 rounded-xl p-3 flex items-start gap-2.5 text-xs text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              {t.apiKeySecurityNote}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2">
            {tempKey && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 cursor-pointer"
              >
                {t.apiKeyClearBtn}
              </button>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                {t.apiKeyCancelBtn}
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {saved ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{t.apiKeySavedBtn}</span>
                  </>
                ) : (
                  <span>{t.apiKeySaveBtn}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

