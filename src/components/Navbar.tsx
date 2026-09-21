import React from 'react';
import { Receipt, Key, Download, Wallet, ShoppingBag, Globe } from 'lucide-react';
import { ReceiptData, Language } from '../types';
import { translations } from '../translations';

interface NavbarProps {
  receipts: ReceiptData[];
  onOpenApiKeyModal: () => void;
  onOpenExportModal: () => void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
}

export function Navbar({
  receipts,
  onOpenApiKeyModal,
  onOpenExportModal,
  lang,
  onLanguageChange,
}: NavbarProps) {
  const t = translations[lang];
  const totalSpent = receipts.reduce((sum, r) => sum + r.totalAmount, 0);

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 backdrop-blur-md bg-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 shrink-0">
            <Receipt className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 text-base sm:text-lg md:text-xl tracking-tight flex items-center gap-2">
              <span>{t.appTitleFull}</span>
              <span className="hidden lg:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                {t.badgeAi}
              </span>
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Stats, Language & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language selector toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => onLanguageChange('es')}
              aria-label="Español"
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                lang === 'es'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>🇪🇸</span>
              <span>ES</span>
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              aria-label="English"
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                lang === 'en'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>🇺🇸</span>
              <span>EN</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-xl text-xs">
            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span>{receipts.length} {t.receiptsCount}</span>
            </div>
            <div className="w-px h-4 bg-slate-300"></div>
            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>{t.totalSpent}: <strong className="text-slate-900">${totalSpent.toFixed(2)}</strong></span>
            </div>
          </div>

          <button
            onClick={onOpenApiKeyModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 border border-slate-200 transition-colors shrink-0"
            title="Google API Key Settings"
          >
            <Key className="w-4 h-4 text-slate-500" />
            <span className="hidden md:inline">{t.apiKeyBtn}</span>
          </button>

          {receipts.length > 0 && (
            <button
              onClick={onOpenExportModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all shrink-0"
            >
              <Download className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">{t.exportAllBtn}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

