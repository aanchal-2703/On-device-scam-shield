import React, { useEffect, useRef, useState } from 'react';
import {
  BadgeAlert,
  Clock,
  AlertTriangle,
  EyeOff,
  KeyRound,
  Volume2,
  Square,
  X,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { isSpeechSynthesisSupported, speakExplanation, stopSpeaking } from '../engine/speechTts';
import { TRANSLATIONS, type AppLanguage } from '../i18n';

interface ScamSpottingOverlayProps {
  open: boolean;
  language: AppLanguage;
  onClose: () => void;
  onCheckMessages: () => void;
}

const TRICK_ICON_META = {
  authority: {
    Icon: BadgeAlert,
    badgeBg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300',
    accentBorder: 'border-amber-200 dark:border-amber-900/60',
  },
  urgency: {
    Icon: Clock,
    badgeBg: 'bg-orange-100 text-orange-700 dark:bg-orange-950/70 dark:text-orange-300',
    accentBorder: 'border-orange-200 dark:border-orange-900/60',
  },
  fear: {
    Icon: AlertTriangle,
    badgeBg: 'bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300',
    accentBorder: 'border-red-200 dark:border-red-900/60',
  },
  isolation: {
    Icon: EyeOff,
    badgeBg: 'bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300',
    accentBorder: 'border-purple-200 dark:border-purple-900/60',
  },
  payment: {
    Icon: KeyRound,
    badgeBg: 'bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300',
    accentBorder: 'border-red-200 dark:border-red-900/60',
  },
} as const;

export const ScamSpottingOverlay: React.FC<ScamSpottingOverlayProps> = ({
  open,
  language,
  onClose,
  onCheckMessages,
}) => {
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const wasOpenRef = useRef(false);

  const tr = TRANSLATIONS[language].overview.spottingOverlay;
  const ttsSupported = isSpeechSynthesisSupported();

  useEffect(() => {
    if (!open) {
      if (wasOpenRef.current) {
        wasOpenRef.current = false;
        stopSpeaking();
        setSpeakingId((prev) => (prev === null ? prev : null));
      }
      return;
    }

    wasOpenRef.current = true;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopSpeaking();
        setSpeakingId(null);
        onCloseRef.current();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      stopSpeaking();
    };
  }, [open]);

  if (!open) return null;

  const handleSpeak = (id: string, title: string, trick: string, action: string) => {
    if (speakingId === id) {
      stopSpeaking();
      setSpeakingId(null);
      return;
    }
    const ok = speakExplanation(`${title}. ${trick} ${action}`, language, {
      onStart: () => setSpeakingId(id),
      onEnd: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
    if (ok) {
      setSpeakingId(id);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="scam-spotting-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 sm:p-4 backdrop-blur-xs"
      onClick={() => {
        stopSpeaking();
        setSpeakingId(null);
        onClose();
      }}
    >
      <div
        className="flex max-h-[90dvh] w-full sm:max-w-2xl flex-col rounded-t-2xl sm:rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Overlay Header */}
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800 shrink-0">
          <div className="space-y-1">
            <h2
              id="scam-spotting-title"
              className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100"
            >
              {tr.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {tr.subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              setSpeakingId(null);
              onClose();
            }}
            aria-label={tr.closeBtn}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Simple Large-Icon Cards */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-slate-50 dark:bg-slate-950">
          {tr.tricks.map((item, index) => {
            const meta = TRICK_ICON_META[item.id];
            const Icon = meta.Icon;
            const isSpeaking = speakingId === item.id;

            return (
              <div
                key={item.id}
                className={`flex items-center gap-4 rounded-2xl border bg-white p-4 shadow-2xs dark:bg-slate-900 ${meta.accentBorder}`}
              >
                <div
                  aria-hidden="true"
                  className={`flex h-16 w-16 sm:h-18 sm:w-18 shrink-0 items-center justify-center rounded-2xl ${meta.badgeBg}`}
                >
                  <Icon className="w-9 h-9 stroke-[2.2]" />
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      <span className="font-mono text-xs text-slate-400 dark:text-slate-500 mr-1.5">
                        0{index + 1}
                      </span>
                      {item.title}
                    </h3>

                    {ttsSupported && (
                      <button
                        type="button"
                        onClick={() => handleSpeak(item.id, item.title, item.trick, item.action)}
                        className={`min-h-[38px] inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                          isSpeaking
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-blue-700 text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700'
                        }`}
                      >
                        {isSpeaking ? (
                          <>
                            <Square className="w-3 h-3 fill-current shrink-0" />
                            <span>{tr.stopCard}</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-4 h-4 shrink-0" />
                            <span>{tr.hearCard}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-snug">
                    {item.trick}
                  </p>

                  <p className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>{item.action}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <footer className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5 border-t border-slate-200 bg-white px-5 py-3.5 pb-safe dark:border-slate-800 dark:bg-slate-900 shrink-0">
          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              setSpeakingId(null);
              onClose();
            }}
            className="w-full sm:w-auto min-h-[44px] rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          >
            {tr.closeBtn}
          </button>

          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              setSpeakingId(null);
              onClose();
              onCheckMessages();
            }}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 cursor-pointer"
          >
            <span>{tr.checkNowBtn}</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </footer>
      </div>
    </div>
  );
};
