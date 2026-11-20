import React, { useState } from 'react';
import {
  ShieldCheck,
  Cpu,
  WifiOff,
  HardDrive,
  ArrowRight,
  Trash2,
  Mic,
  MessageSquare,
  Play,
  Activity,
} from 'lucide-react';
import { buildExplanation } from '../engine/explain';
import type { SemanticEngineMode } from '../engine/tagger';
import type { LocalEngineStats, ModelStatus, SelfTestOutput } from '../store';
import { TRANSLATIONS, type AppLanguage } from '../i18n';

interface PrivacyPanelProps {
  language: AppLanguage;
  taggerStatus: ModelStatus;
  whisperStatus: ModelStatus;
  learnedCount: number;
  isOnline: boolean;
  engineMode: SemanticEngineMode;
  localStats: LocalEngineStats;
  onRunSelfTest: (text: string) => Promise<SelfTestOutput>;
  onWipe: () => void;
}

const DEFAULT_UNSEEN_SAMPLE =
  'Hello, your apartment electricity meter shows pending arrears and power will be disconnected tonight unless you send the temporary settlement to our field engineer right away.';

export const PrivacyPanel: React.FC<PrivacyPanelProps> = ({
  language,
  taggerStatus,
  whisperStatus,
  learnedCount,
  isOnline,
  engineMode,
  localStats,
  onRunSelfTest,
  onWipe,
}) => {
  const fullTr = TRANSLATIONS[language];
  const tr = fullTr.privacyPanel;
  const [selfTestText, setSelfTestText] = useState(DEFAULT_UNSEEN_SAMPLE);
  const [isTesting, setIsTesting] = useState(false);
  const [selfTestResult, setSelfTestResult] = useState<SelfTestOutput | null>(null);

  // Live runtime proof readings directly from browser APIs
  const localStorageKeys = typeof window !== 'undefined' ? window.localStorage.length : 0;
  const sessionStorageKeys = typeof window !== 'undefined' ? window.sessionStorage.length : 0;
  const cookieCount =
    typeof document !== 'undefined' && document.cookie.trim().length > 0
      ? document.cookie.split(';').length
      : 0;

  const activeEngineLabel =
    engineMode === 'minilm'
      ? tr.engineMiniLM
      : engineMode === 'local-vector'
        ? tr.engineLocal
        : tr.engineRules;

  const handleRunTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selfTestText.trim() || isTesting) return;
    setIsTesting(true);
    try {
      const output = await onRunSelfTest(selfTestText);
      setSelfTestResult(output);
    } finally {
      setIsTesting(false);
    }
  };

  const selfTestExplanation = selfTestResult
    ? buildExplanation(selfTestResult.risk, language)
    : null;

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 pb-8 space-y-6 sm:space-y-8 overflow-y-auto h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 sm:pb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {tr.title}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {tr.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={onWipe}
          className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm sm:text-xs font-semibold text-white hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Trash2 className="w-4 h-4" />
          {tr.wipeNow}
        </button>
      </div>

      {/* Provable Invariants Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Cpu className="w-4 h-4 text-blue-700 dark:text-blue-400" />
            <span>{tr.processingLabel}</span>
          </div>
          <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {tr.processingVal}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {tr.processingDesc}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <WifiOff className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{tr.networkLabel}</span>
          </div>
          <p className="mt-2 font-mono text-lg font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
            {tr.networkVal}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {tr.networkDesc}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <HardDrive className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <span>{tr.storageLabel}</span>
          </div>
          <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {tr.storageVal}
          </p>
          <p className="mt-1 font-mono text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
            localStorage: {localStorageKeys} · sessionStorage: {sessionStorageKeys} · cookies: {cookieCount}
          </p>
        </div>
      </div>

      {/* Live Local Worker Telemetry */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {tr.engineLabel}
          </p>
          <p className="mt-1.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
            {activeEngineLabel}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {tr.analyzedLabel}
          </p>
          <p className="mt-1.5 font-mono text-base font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {localStats.messagesAnalyzed}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {tr.aiVsRuleLabel}
          </p>
          <p className="mt-1.5 font-mono text-base font-bold tabular-nums text-blue-700 dark:text-blue-400">
            {localStats.aiDetections} / {localStats.ruleDetections}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {tr.latencyLabel}
          </p>
          <p className="mt-1.5 font-mono text-base font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
            {localStats.lastLatencyMs} ms · {localStats.outboundUserBytes} B
          </p>
        </div>
      </section>

      {/* Live Offline & Unseen Scam Self-Test */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <Activity className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0" />
              <span>{tr.selfTestTitle}</span>
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {tr.selfTestDesc}
            </p>
          </div>
          <span className="font-mono text-[11px] tabular-nums text-emerald-700 dark:text-emerald-400 shrink-0">
            {tr.zeroBytesProof}
          </span>
        </div>

        <form onSubmit={handleRunTest} className="space-y-3">
          <textarea
            rows={2}
            value={selfTestText}
            onChange={(e) => setSelfTestText(e.target.value)}
            placeholder={tr.selfTestPlaceholder}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-base sm:text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <button
            type="submit"
            disabled={!selfTestText.trim() || isTesting}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-40 dark:bg-blue-600 dark:hover:bg-blue-700 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current shrink-0" />
            {isTesting ? tr.selfTestRunning : tr.selfTestBtn}
          </button>
        </form>

        {selfTestResult && selfTestExplanation && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span
                className={`font-bold uppercase ${
                  selfTestResult.risk.riskLevel === 'red'
                    ? 'text-red-600 dark:text-red-400'
                    : selfTestResult.risk.riskLevel === 'amber'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {selfTestResult.risk.riskLevel} ·{' '}
                <span className="font-mono tabular-nums">{selfTestResult.risk.score}/100</span>
              </span>
              <span className="font-mono text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
                {selfTestResult.result.engineMode === 'minilm'
                  ? 'MiniLM AI'
                  : selfTestResult.result.engineMode === 'local-vector'
                    ? 'Offline Vector AI'
                    : 'Rule'}{' '}
                {selfTestResult.result.semanticConfidence > 0
                  ? `· ${selfTestResult.result.semanticConfidence}%`
                  : ''}{' '}
                · {selfTestResult.latencyMs} ms · 0 B sent
              </span>
            </div>

            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
              {selfTestExplanation.headline}
            </p>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {selfTestExplanation.narrative}
            </p>
            {selfTestResult.result.tactics.length > 0 && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {fullTr.risk.tacticsSeen}{' '}
                </span>
                {selfTestResult.result.tactics
                  .map((t) => fullTr.tactics[t].shortLabel)
                  .join(' · ')}
              </p>
            )}
          </div>
        )}
      </section>

      {/* Architecture Diagram: Input -> On-Device Models -> Result -> Wipe */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Data Flow & Ephemeral Lifecycle
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Messages and audio never cross your browser tab boundary.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-stretch">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
              <MessageSquare className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              <span>1. Input</span>
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              SMS, WhatsApp paste, uploaded call file, or consented mic PCM chunks.
            </p>
            <div className="mt-3 hidden md:flex items-center justify-end text-slate-400">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
              <Cpu className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              <span>2. On-Device Models</span>
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Offline Vector AI + MiniLM neural worker + Whisper-tiny speech worker + domain rules.
            </p>
            <div className="mt-3 hidden md:flex items-center justify-end text-slate-400">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>3. Sequence Result</span>
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Inline tactic underlines, 5-stage Manipulation Timeline, and 0–100 risk score.
            </p>
            <div className="mt-3 hidden md:flex items-center justify-end text-slate-400">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span>4. Wipe</span>
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Clears RAM store, transcripts, audio buffers, and learned prototypes instantly.
            </p>
            <div className="mt-3 text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
              {learnedCount} learned in RAM
            </div>
          </div>
        </div>
      </section>

      {/* Model & Offline Airplane Mode Proof */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Offline PWA & Model Cache Verification
          </h2>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Network: {isOnline ? 'Online' : 'Offline (Airplane Mode)'}
          </span>
        </div>

        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          The PWA Service Worker precaches the application shell and offline 512-dim semantic vector engine instantaneously, and caches public ONNX weights separately from user state. Model weights are public read-only artifacts — never user data — so ScamShield continues analyzing messages and calls even with Wi-Fi and mobile data turned off.
        </p>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 px-4 py-3 text-xs">
            <div className="min-w-0">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Offline Subword Vector AI (Zero-Download)
              </span>
              <span className="mx-2 text-slate-300 dark:text-slate-700">·</span>
              <span className="font-mono text-slate-500 dark:text-slate-400">
                512-dim Multilingual L2 Embeddings
              </span>
            </div>
            <span className="font-mono tabular-nums text-emerald-700 dark:text-emerald-400 shrink-0">
              Always Ready (0ms)
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 px-4 py-3 text-xs">
            <div className="min-w-0">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Neural Embedding Worker
              </span>
              <span className="mx-2 text-slate-300 dark:text-slate-700">·</span>
              <span className="font-mono text-slate-500 dark:text-slate-400 break-all">
                Xenova/paraphrase-multilingual-MiniLM-L12-v2
              </span>
            </div>
            <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300 shrink-0">
              {taggerStatus.state === 'ready'
                ? 'Cached & Ready'
                : taggerStatus.state === 'error'
                  ? 'Fallback to Offline Vector AI'
                  : `${taggerStatus.progress}%`}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 px-4 py-3 text-xs">
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              <Mic className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Speech Worker
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="font-mono text-slate-500 dark:text-slate-400 break-all">
                Xenova/whisper-tiny (multilingual)
              </span>
            </div>
            <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300 shrink-0">
              {whisperStatus.state === 'ready'
                ? 'Cached & Ready'
                : whisperStatus.state === 'loading'
                  ? `${whisperStatus.progress}%`
                  : 'Loads on Call Mode'}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
