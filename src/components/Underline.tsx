import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, Volume2, Square, X } from 'lucide-react';
import type { SpanMatch } from '../engine/rules';
import { isSpeechSynthesisSupported, speakExplanation, stopSpeaking } from '../engine/speechTts';
import { TRANSLATIONS, type AppLanguage } from '../i18n';

interface UnderlineProps {
  text: string;
  spans: SpanMatch[];
  language?: AppLanguage;
}

interface Segment {
  text: string;
  span?: SpanMatch;
  key: string;
}

export const Underline: React.FC<UnderlineProps> = ({ text, spans, language = 'en' }) => {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [speakingKey, setSpeakingKey] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tr = TRANSLATIONS[language];
  const ttsSupported = isSpeechSynthesisSupported();

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveKey(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      stopSpeaking();
    };
  }, []);

  if (!spans || spans.length === 0) {
    return <span>{text}</span>;
  }

  const sorted = [...spans].sort((a, b) => a.start - b.start);
  const segments: Segment[] = [];
  let cursor = 0;

  for (let i = 0; i < sorted.length; i++) {
    const span = sorted[i];
    const start = Math.max(cursor, Math.min(text.length, span.start));
    const end = Math.max(start, Math.min(text.length, span.end));
    if (start > cursor) {
      segments.push({
        text: text.slice(cursor, start),
        key: `plain-${cursor}`,
      });
    }
    if (end > start) {
      segments.push({
        text: text.slice(start, end),
        span,
        key: `span-${i}-${start}`,
      });
    }
    cursor = end;
  }

  if (cursor < text.length) {
    segments.push({
      text: text.slice(cursor),
      key: `plain-tail-${cursor}`,
    });
  }

  return (
    <span ref={containerRef} className="relative inline leading-relaxed">
      {segments.map((seg) => {
        if (!seg.span) {
          return <React.Fragment key={seg.key}>{seg.text}</React.Fragment>;
        }

        const isDanger = seg.span.severity === 'danger';
        const isOpen = activeKey === seg.key;
        const localizedTactic = tr.tactics[seg.span.tactic];
        const localizedReason =
          seg.span.indicator && seg.span.indicator.kind !== 'semantic'
            ? `${localizedTactic.reason} (${seg.span.indicator.value})`
            : localizedTactic.reason;

        const sourceBadge =
          seg.span.source === 'rule'
            ? 'Rule'
            : seg.span.indicator?.kind === 'learned'
              ? `Adapted${seg.span.indicator.pct ? ` · ${seg.span.indicator.pct}%` : ''}`
              : seg.span.indicator?.kind === 'semantic'
                ? `${seg.span.indicator.value === 'minilm' ? 'MiniLM AI' : 'Offline AI'}${
                    seg.span.indicator.pct ? ` · ${seg.span.indicator.pct}%` : ''
                  }`
                : 'AI';

        return (
          <span
            key={seg.key}
            className="relative inline-block"
            onMouseEnter={() => setActiveKey(seg.key)}
            onMouseLeave={() => setActiveKey((prev) => (prev === seg.key ? null : prev))}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveKey((prev) => (prev === seg.key ? null : seg.key));
              }}
              aria-expanded={isOpen}
              className={`inline text-left cursor-pointer rounded-xs px-0.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 underline decoration-wavy decoration-2 underline-offset-4 ${
                isDanger
                  ? 'decoration-red-600 dark:decoration-red-400 bg-red-500/10 hover:bg-red-500/20'
                  : 'decoration-amber-500 dark:decoration-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
              }`}
            >
              {seg.text}
            </button>

            {isOpen && (
              <span
                role="tooltip"
                className="fixed left-4 right-4 bottom-20 z-50 sm:absolute sm:left-0 sm:right-auto sm:bottom-full sm:mb-2 sm:w-72 rounded-xl sm:rounded-lg border border-slate-200 bg-white p-3.5 sm:p-3 text-left text-xs shadow-xl dark:border-slate-700 dark:bg-slate-900"
              >
                <span className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span
                    className={`flex items-center gap-1.5 font-semibold ${
                      isDanger
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    {isDanger ? (
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    )}
                    {localizedTactic.label}
                  </span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {isDanger ? tr.chat.dangerLegend : tr.chat.cautionLegend}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveKey(null);
                      }}
                      aria-label="Close explanation"
                      className="sm:hidden inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                </span>
                <span className="mt-1.5 block text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                  {localizedReason}
                </span>
                <span className="mt-2 flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono tabular-nums">
                    {sourceBadge} · {localizedTactic.shortLabel}
                  </span>
                  {ttsSupported && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (speakingKey === seg.key) {
                          stopSpeaking();
                          setSpeakingKey(null);
                          return;
                        }
                        const ok = speakExplanation(
                          `${localizedTactic.label}. ${localizedReason}`,
                          language,
                          {
                            onStart: () => setSpeakingKey(seg.key),
                            onEnd: () => setSpeakingKey(null),
                            onError: () => setSpeakingKey(null),
                          }
                        );
                        if (ok) setSpeakingKey(seg.key);
                      }}
                      className={`min-h-[32px] inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer shrink-0 ${
                        speakingKey === seg.key
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-blue-700 text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700'
                      }`}
                    >
                      {speakingKey === seg.key ? (
                        <>
                          <Square className="w-2.5 h-2.5 fill-current shrink-0" />
                          <span>{tr.risk.stopAudio}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 shrink-0" />
                          <span>{tr.risk.hearExplanation}</span>
                        </>
                      )}
                    </button>
                  )}
                </span>
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
};
