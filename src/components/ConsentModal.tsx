import React from 'react';
import { Shield, Lock, Mic } from 'lucide-react';
import { TRANSLATIONS, type AppLanguage } from '../i18n';

interface ConsentModalProps {
  language: AppLanguage;
  open: boolean;
  onAccept: () => void;
  onCancel: () => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({
  language,
  open,
  onAccept,
  onCancel,
}) => {
  if (!open) return null;
  const tr = TRANSLATIONS[language].consent;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 sm:p-4 backdrop-blur-xs"
    >
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-xl border-t sm:border border-slate-200 bg-white p-5 pb-safe sm:p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div
          aria-hidden="true"
          className="sm:hidden mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-300 dark:bg-slate-700"
        />
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
            <Mic className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2
              id="consent-modal-title"
              className="text-base font-semibold text-slate-900 dark:text-slate-100"
            >
              {tr.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {tr.subtitle}
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          {tr.question}
        </p>

        <div className="mt-4 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{tr.bullet1}</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{tr.bullet2}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 pb-2 sm:pb-0">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 sm:py-2 text-sm sm:text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          >
            {tr.cancel}
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center rounded-lg bg-blue-700 px-4 py-2.5 sm:py-2 text-sm sm:text-xs font-semibold text-white hover:bg-blue-800 transition-colors cursor-pointer"
          >
            {tr.accept}
          </button>
        </div>
      </div>
    </div>
  );
};
