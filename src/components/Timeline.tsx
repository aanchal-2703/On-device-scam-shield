import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, Volume2, Square, X } from 'lucide-react';
import { SEQUENCE_ORDER, type TacticId } from '../engine/prototypes';
import type { ConversationRiskState } from '../engine/sequence';
import { isSpeechSynthesisSupported, speakExplanation, stopSpeaking } from '../engine/speechTts';
import { TRANSLATIONS, type AppLanguage } from '../i18n';

interface TimelineProps {
  risk: ConversationRiskState;
  language?: AppLanguage;
}

export const Timeline: React.FC<TimelineProps> = ({ risk, language = 'en' }) => {
  const tr = TRANSLATIONS[language];
  const [activeTactic, setActiveTactic] = useState<TacticId | null>(null);
  const [speakingTactic, setSpeakingTactic] = useState<TacticId | null>(null);
  const ttsSupported = isSpeechSynthesisSupported();

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const extraTactics = risk.detectedTactics.filter(
    (t) => t === 'reward' || t === 'remote_access'
  );

  const handleToggleTactic = (tactic: TacticId) => {
    setActiveTactic((prev) => {
      const next = prev === tactic ? null : tactic;
      if (next === null && speakingTactic) {
        stopSpeaking();
        setSpeakingTactic(null);
      }
      return next;
    });
  };

  const handleSpeakTactic = (tactic: TacticId) => {
    if (speakingTactic === tactic) {
      stopSpeaking();
      setSpeakingTactic(null);
      return;
    }
    const info = tr.tactics[tactic];
    const ok = speakExplanation(`${info.label}. ${info.reason}`, language, {
      onStart: () => setSpeakingTactic(tactic),
      onEnd: () => setSpeakingTactic(null),
      onError: () => setSpeakingTactic(null),
    });
    if (ok) {
      setSpeakingTactic(tactic);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          {tr.risk.timelineTitle}
        </h3>
        <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
          {Object.values(risk.activeStages).filter(Boolean).length} / {SEQUENCE_ORDER.length} {tr.risk.stagesCount}
        </span>
      </div>

      <div
        className="grid grid-cols-5 gap-1"
        role="list"
        aria-label={tr.risk.timelineTitle}
      >
        {SEQUENCE_ORDER.map((stage, idx) => {
          const active = risk.activeStages[stage];
          const orderNum = risk.stageOrder.indexOf(stage) + 1;
          const isDangerStage = stage === 'fear' || stage === 'isolation' || stage === 'payment';
          const isInspected = activeTactic === stage;

          return (
            <button
              key={stage}
              type="button"
              role="listitem"
              onClick={() => handleToggleTactic(stage)}
              aria-expanded={isInspected}
              title={tr.tactics[stage].label}
              className={`flex flex-col items-center text-center gap-1.5 rounded-lg p-1 min-h-[44px] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-600 ${
                isInspected
                  ? 'bg-blue-50/90 ring-1 ring-blue-300 dark:bg-blue-950/40 dark:ring-blue-800'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/70'
              }`}
            >
              <div className="relative flex items-center justify-center w-full">
                {idx > 0 && (
                  <div
                    aria-hidden="true"
                    className={`absolute right-1/2 top-1/2 -translate-y-1/2 w-full h-0.5 -z-0 ${
                      active && risk.activeStages[SEQUENCE_ORDER[idx - 1]]
                        ? 'bg-red-500/70 dark:bg-red-400/70'
                        : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  />
                )}
                <div
                  className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border text-xs font-mono tabular-nums font-semibold transition-colors ${
                    active
                      ? isDangerStage || risk.riskLevel === 'red'
                        ? 'border-red-600 bg-red-600 text-white dark:border-red-500 dark:bg-red-500'
                        : 'border-amber-500 bg-amber-500 text-white'
                      : 'border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500'
                  }`}
                >
                  {active ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : idx + 1}
                </div>
              </div>

              <span
                className={`text-[10px] sm:text-[11px] leading-tight font-medium truncate max-w-full px-0.5 ${
                  active
                    ? 'text-slate-900 dark:text-slate-100 font-semibold'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {tr.risk.stages[stage]}
              </span>
              {active && orderNum > 0 && (
                <span className="text-[10px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                  #{orderNum}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Interactive Stage / Tactic Explanation Tooltip with Hear Explanation TTS */}
      {activeTactic && (
        <div
          role="tooltip"
          className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-950 space-y-2"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {tr.tactics[activeTactic].label}
            </span>
            <button
              type="button"
              onClick={() => {
                setActiveTactic(null);
                if (speakingTactic === activeTactic) {
                  stopSpeaking();
                  setSpeakingTactic(null);
                }
              }}
              aria-label="Close tactic explanation"
              className="inline-flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {tr.tactics[activeTactic].reason}
          </p>
          {ttsSupported && (
            <button
              type="button"
              onClick={() => handleSpeakTactic(activeTactic)}
              className={`min-h-[36px] inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                speakingTactic === activeTactic
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-blue-700 text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700'
              }`}
            >
              {speakingTactic === activeTactic ? (
                <>
                  <Square className="w-3 h-3 fill-current shrink-0" />
                  <span>{tr.risk.stopAudio}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{tr.risk.hearExplanation}</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {(risk.transitions.length > 0 || extraTactics.length > 0) && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
          {risk.transitions.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              {risk.transitions.slice(0, 3).map((t, i) => (
                <span key={`${t.from}-${t.to}-${i}`} className="inline-flex items-center gap-1">
                  {i > 0 && <span aria-hidden="true">·</span>}
                  <span>{tr.tactics[t.from].shortLabel}</span>
                  <ArrowRight className="w-3 h-3" />
                  <span>{tr.tactics[t.to].shortLabel}</span>
                  <span className="font-mono tabular-nums text-red-600 dark:text-red-400">
                    +{t.bonus}
                  </span>
                </span>
              ))}
            </div>
          )}

          {extraTactics.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              {extraTactics.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleToggleTactic(t)}
                  className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  {tr.tactics[t].label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
