import React, { memo, useCallback, useMemo, useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  PhoneOff,
  PhoneCall,
  ExternalLink,
  Cpu,
  Volume2,
  Square,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { buildExplanation } from '../engine/explain';
import type { TacticId } from '../engine/prototypes';
import {
  evaluateConversationProgression,
  type MessageEvaluationInput,
  type RiskLevel,
} from '../engine/sequence';
import { isSpeechSynthesisSupported, speakExplanation, stopSpeaking } from '../engine/speechTts';
import type { LearnedPrototype } from '../engine/tagger';
import type { Conversation } from '../store';
import { TRANSLATIONS, type AppLanguage } from '../i18n';
import { Timeline } from './Timeline';

interface RiskPanelProps {
  language?: AppLanguage;
  conversation: Conversation | undefined;
  learnedCount: number;
  learnedPrototypes?: LearnedPrototype[];
  onTeachPattern?: (text: string, kind: 'scam' | 'safe', tactic?: TacticId) => void | Promise<void>;
}

interface ChartPoint {
  turn: number;
  label: string;
  axisLabel: string;
  timestamp: string;
  score: number;
  riskLevel: RiskLevel;
  snippet: string;
  tactics: TacticId[];
  tacticsLabel: string;
}

function formatShortTime(ts: string): string {
  return ts.replace(/\s*(AM|PM)$/i, '');
}

const RISK_HEX: Record<RiskLevel, string> = {
  green: '#16A34A',
  amber: '#D97706',
  red: '#DC2626',
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: ChartPoint }>;
  turnWord: string;
  tacticReasons: Record<TacticId, { label: string; shortLabel: string; reason: string }>;
  hearLabel: string;
}

const ProgressionTooltip: React.FC<CustomTooltipProps> = memo(({
  active,
  payload,
  turnWord,
  tacticReasons,
  hearLabel,
}) => {
  const pt = payload?.[0]?.payload;
  if (!active || !pt) return null;
  const badgeColor =
    pt.riskLevel === 'red'
      ? 'text-red-600 dark:text-red-400'
      : pt.riskLevel === 'amber'
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-emerald-600 dark:text-emerald-400';

  const firstTacticReason = pt.tactics.length > 0 ? tacticReasons[pt.tactics[0]]?.reason : '';

  return (
    <div className="max-w-[240px] rounded-lg border border-slate-200 bg-white p-2.5 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-900 space-y-1">
      <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
        <span className="font-mono font-semibold text-slate-800 dark:text-slate-100">
          {turnWord} {pt.label} · {pt.timestamp}
        </span>
        <span className={`font-mono font-bold tabular-nums ${badgeColor}`}>
          {pt.score}/100
        </span>
      </div>
      {pt.tacticsLabel && (
        <p className="font-semibold text-[11px] text-slate-800 dark:text-slate-100">
          {pt.tacticsLabel}
        </p>
      )}
      {firstTacticReason && (
        <p className="text-[11px] leading-snug text-slate-600 dark:text-slate-300">
          {firstTacticReason}
        </p>
      )}
      <p className="line-clamp-2 text-[11px] text-slate-500 dark:text-slate-400">
        “{pt.snippet}”
      </p>
      {pt.tactics.length > 0 && (
        <p className="flex items-center gap-1 pt-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-400">
          <Volume2 className="w-3 h-3 shrink-0" />
          <span>{hearLabel}</span>
        </p>
      )}
    </div>
  );
});

export const RiskPanel: React.FC<RiskPanelProps> = ({
  language = 'en',
  conversation,
  learnedCount,
  learnedPrototypes = [],
  onTeachPattern,
}) => {
  const tr = TRANSLATIONS[language];
  const [adaptDraft, setAdaptDraft] = useState('');
  const [adaptTactic, setAdaptTactic] = useState<TacticId>('payment');
  const [isTeaching, setIsTeaching] = useState(false);
  const [speakingKey, setSpeakingKey] = useState<string | null>(null);
  const [activeTacticTooltip, setActiveTacticTooltip] = useState<TacticId | null>(null);
  const [selectedTurnNumber, setSelectedTurnNumber] = useState<number | null>(null);
  const ttsSupported = isSpeechSynthesisSupported();

  useEffect(() => {
    setSpeakingKey(null);
    setActiveTacticTooltip(null);
    setSelectedTurnNumber(null);
    stopSpeaking();
    return () => {
      stopSpeaking();
    };
  }, [conversation?.id]);

  const handleToggleSpeech = (key: string, textToSpeak: string) => {
    if (speakingKey === key) {
      stopSpeaking();
      setSpeakingKey(null);
      return;
    }
    const started = speakExplanation(textToSpeak, language, {
      onStart: () => setSpeakingKey(key),
      onEnd: () => setSpeakingKey(null),
      onError: () => setSpeakingKey(null),
    });
    if (started) {
      setSpeakingKey(key);
    }
  };

  const progressionData = useMemo<ChartPoint[]>(() => {
    if (!conversation) return [];
    const inputs: MessageEvaluationInput[] = conversation.messages.map((m) => {
      const explicitSafe = m.userFeedback === 'safe' || m.learnedSafeMatch;
      const explicitScam = m.userFeedback === 'scam' || m.learnedScamMatch;
      return {
        messageId: m.id,
        timestamp: m.timestamp,
        sender: m.sender,
        tactics:
          explicitSafe && !m.hardSignals.knownScamDomain && !m.hardSignals.lookalikeDomain
            ? []
            : m.tactics,
        spans: m.spans,
        hardSignals: m.hardSignals,
        learnedScamMatch: explicitScam,
        learnedSafeMatch: explicitSafe,
      };
    });

    const rawPoints = evaluateConversationProgression(inputs);
    return rawPoints.map((pt, idx) => {
      const msg = conversation.messages[idx];
      const snippet = msg ? msg.text : '';
      return {
        turn: pt.turn,
        label: pt.label,
        axisLabel: `${pt.label} ${formatShortTime(pt.timestamp)}`,
        timestamp: pt.timestamp,
        score: pt.score,
        riskLevel: pt.riskLevel,
        snippet,
        tactics: pt.tactics,
        tacticsLabel: pt.tactics.map((t) => tr.tactics[t].shortLabel).join(', '),
      };
    });
  }, [conversation, tr]);

  const renderTooltipContent = useCallback(
    (tooltipProps: { active?: boolean; payload?: ReadonlyArray<{ payload?: ChartPoint }> }) => (
      <ProgressionTooltip
        active={tooltipProps.active}
        payload={tooltipProps.payload}
        turnWord={tr.risk.turnWord}
        tacticReasons={tr.tactics}
        hearLabel={tr.risk.hearExplanation}
      />
    ),
    [tr.risk.turnWord, tr.tactics, tr.risk.hearExplanation]
  );

  const renderLineDot = useCallback(
    (props: {
      cx?: number;
      cy?: number;
      payload?: ChartPoint;
      index?: number;
    }) => {
      const { cx, cy, payload, index } = props;
      if (typeof cx !== 'number' || typeof cy !== 'number' || !payload) {
        return <g key={`empty-${index ?? 0}`} />;
      }
      const isSelected = selectedTurnNumber === payload.turn;
      return (
        <circle
          key={`dot-${payload.turn}`}
          cx={cx}
          cy={cy}
          r={isSelected ? 5.5 : 4}
          fill={RISK_HEX[payload.riskLevel]}
          stroke="#FFFFFF"
          strokeWidth={isSelected ? 2 : 1.5}
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedTurnNumber((prev) =>
              prev === payload.turn ? null : payload.turn
            );
          }}
        />
      );
    },
    [selectedTurnNumber]
  );

  if (!conversation) {
    return (
      <aside className="flex h-full items-center justify-center p-6 text-sm text-slate-500 dark:text-slate-400">
        {tr.chat.emptyHint}
      </aside>
    );
  }

  const { risk } = conversation;
  const explanation = buildExplanation(risk, language);

  const levelConfig = {
    green: {
      label: tr.risk.greenVerdict,
      simpleHint: tr.risk.greenHint,
      textClass: 'text-emerald-700 dark:text-emerald-400',
      barClass: 'bg-emerald-600 dark:bg-emerald-500',
      surfaceClass: 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60',
      Icon: ShieldCheck,
    },
    amber: {
      label: tr.risk.amberVerdict,
      simpleHint: tr.risk.amberHint,
      textClass: 'text-amber-700 dark:text-amber-400',
      barClass: 'bg-amber-500 dark:bg-amber-400',
      surfaceClass: 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60',
      Icon: AlertTriangle,
    },
    red: {
      label: tr.risk.redVerdict,
      simpleHint: tr.risk.redHint,
      textClass: 'text-red-700 dark:text-red-400',
      barClass: 'bg-red-600 dark:bg-red-500',
      surfaceClass: 'bg-red-50/70 dark:bg-red-950/30 border-red-200 dark:border-red-900/60',
      Icon: ShieldAlert,
    },
  }[risk.riskLevel];

  const StatusIcon = levelConfig.Icon;
  const arcRadius = 26;
  const arcCircumference = Math.PI * arcRadius;
  const arcOffset = arcCircumference * (1 - risk.score / 100);
  const strokeColor = RISK_HEX[risk.riskLevel];

  const firstMaliciousTurn = progressionData.find(
    (p) => p.riskLevel === 'amber' || p.riskLevel === 'red'
  );

  return (
    <aside
      aria-label={tr.risk.safetyCheck}
      className="flex h-full flex-col overflow-y-auto bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800 pb-6"
    >
      {/* 0-100 Risk Meter */}
      <div className="p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {tr.risk.safetyCheck}
            </p>
            <div className={`mt-1 flex items-center gap-1.5 text-sm font-bold ${levelConfig.textClass}`}>
              <StatusIcon className="w-4 h-4 shrink-0" />
              <span>{levelConfig.label}</span>
            </div>
            <p className="mt-1 text-xs leading-snug text-slate-600 dark:text-slate-300">
              {levelConfig.simpleHint}
            </p>
          </div>

          {/* Crisp SVG Radial Gauge */}
          <div className="relative flex flex-col items-center shrink-0">
            <svg width="72" height="44" viewBox="0 0 72 44" aria-hidden="true">
              <path
                d="M 10 38 A 26 26 0 0 1 62 38"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                className="text-slate-100 dark:text-slate-800"
              />
              <path
                d="M 10 38 A 26 26 0 0 1 62 38"
                fill="none"
                stroke={strokeColor}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={arcCircumference}
                strokeDashoffset={arcOffset}
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute bottom-0 flex items-baseline gap-0.5">
              <span
                className={`font-mono text-xl font-bold tabular-nums tracking-tight ${levelConfig.textClass}`}
              >
                {risk.score}
              </span>
              <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">/100</span>
            </div>
          </div>
        </div>

        {/* Progress Track */}
        <div className="space-y-1.5">
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
            role="progressbar"
            aria-valuenow={risk.score}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={tr.risk.safetyCheck}
          >
            <div
              className={`h-full rounded-full transition-all duration-300 ${levelConfig.barClass}`}
              style={{ width: `${Math.max(4, risk.score)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono tabular-nums text-slate-400 dark:text-slate-500">
            <span>0 {tr.inbox.filterGreen}</span>
            <span>35 {tr.inbox.filterAmber}</span>
            <span>80+ {tr.inbox.filterRed}</span>
          </div>
        </div>
      </div>

      {/* Live Manipulation Timeline */}
      <div className="p-4 sm:p-5">
        <Timeline risk={risk} language={language} />
      </div>

      {/* Risk Progression Over Conversation Duration (Recharts) */}
      <div className="p-4 sm:p-5 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            {tr.risk.progressionTitle}
          </h3>
          <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
            {progressionData.length}{' '}
            {progressionData.length === 1 ? tr.risk.messageUnit : tr.risk.messagesUnit}
          </span>
        </div>

        {progressionData.length === 0 ? (
          <div className="flex h-[132px] items-center justify-center rounded-lg border border-dashed border-slate-200 text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
            {tr.chat.waitingNext}
          </div>
        ) : (
          <div className="h-[152px] w-full text-slate-400 dark:text-slate-500">
            <ResponsiveContainer width="100%" height={152} minWidth={100}>
              <LineChart
                data={progressionData}
                margin={{ top: 10, right: 12, left: -24, bottom: 0 }}
                onClick={(state) => {
                  const pt = (state as unknown as { activePayload?: Array<{ payload: ChartPoint }> })
                    ?.activePayload?.[0]?.payload;
                  if (pt) {
                    setSelectedTurnNumber((prev) => (prev === pt.turn ? null : pt.turn));
                  }
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="currentColor"
                  strokeOpacity={0.18}
                />
                <XAxis
                  dataKey="axisLabel"
                  tick={{ fontSize: 9.5, fill: 'currentColor' }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 35, 80, 100]}
                  tick={{ fontSize: 10, fill: 'currentColor' }}
                  axisLine={false}
                  tickLine={false}
                />
                <ReferenceLine
                  y={35}
                  stroke="#D97706"
                  strokeDasharray="3 3"
                  strokeOpacity={0.55}
                />
                <ReferenceLine
                  y={80}
                  stroke="#DC2626"
                  strokeDasharray="3 3"
                  strokeOpacity={0.65}
                />
                <Tooltip content={renderTooltipContent} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={strokeColor}
                  strokeWidth={2.5}
                  isAnimationActive={false}
                  dot={renderLineDot}
                  activeDot={{ r: 5.5, strokeWidth: 2, stroke: '#FFFFFF' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Interactive pinned turn tooltip for Risk Progression chart (touch & TTS accessible) */}
        {(() => {
          const activeTurn = progressionData.find((p) => p.turn === selectedTurnNumber);
          if (!activeTurn) return null;
          const turnSpeechKey = `chart-turn-${activeTurn.turn}`;
          const turnSpeechBody =
            activeTurn.tactics.length > 0
              ? activeTurn.tactics.map((t) => `${tr.tactics[t].label}. ${tr.tactics[t].reason}`).join(' ')
              : `${tr.risk.turnWord} ${activeTurn.label}. ${activeTurn.score} / 100.`;

          return (
            <div
              role="tooltip"
              className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-950 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-100">
                  {tr.risk.turnWord} {activeTurn.label} · {activeTurn.score}/100
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedTurnNumber(null)}
                  aria-label="Close turn explanation"
                  className="inline-flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {activeTurn.tactics.length > 0 ? (
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeTurn.tactics.map((t) => tr.tactics[t].reason).join(' ')}
                </p>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  “{activeTurn.snippet}”
                </p>
              )}
              {ttsSupported && (
                <button
                  type="button"
                  onClick={() => handleToggleSpeech(turnSpeechKey, turnSpeechBody)}
                  className={`min-h-[36px] inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                    speakingKey === turnSpeechKey
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-blue-700 text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700'
                  }`}
                >
                  {speakingKey === turnSpeechKey ? (
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
          );
        })()}

        {firstMaliciousTurn && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {tr.risk.escalationBegan}{' '}
            <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
              {tr.risk.turnWord} {firstMaliciousTurn.label}
            </span>{' '}
            ({firstMaliciousTurn.timestamp},{' '}
            <span className="font-mono tabular-nums">{firstMaliciousTurn.score}/100</span>).
          </p>
        )}
      </div>

      {/* Stage 3: Plain-language Attack Story */}
      <div className="p-4 sm:p-5 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            {tr.risk.whatHappening}
          </h3>
          {ttsSupported && (
            <button
              type="button"
              onClick={() =>
                handleToggleSpeech(
                  'story-summary',
                  `${explanation.headline}. ${explanation.narrative}. ${explanation.actions[0] ?? ''}`
                )
              }
              className={`min-h-[36px] inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                speakingKey === 'story-summary'
                  ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-900/70 dark:bg-red-950/50 dark:text-red-300'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {speakingKey === 'story-summary' ? (
                <>
                  <Square className="w-3 h-3 fill-current shrink-0" />
                  <span>{tr.risk.stopAudio}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400 shrink-0" />
                  <span>{tr.risk.hearExplanation}</span>
                </>
              )}
            </button>
          )}
        </div>

        <div className={`rounded-lg border p-3.5 text-sm leading-relaxed ${levelConfig.surfaceClass}`}>
          <p className={`font-semibold text-xs mb-1 ${levelConfig.textClass}`}>
            {explanation.headline}
          </p>
          <p className="text-slate-800 dark:text-slate-100 text-[13px] leading-relaxed">
            {explanation.narrative}
          </p>
        </div>

        {risk.detectedTactics.length > 0 && (
          <div className="pt-1 space-y-2">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300 mr-0.5">
                {tr.risk.tacticsSeen}
              </span>
              {risk.detectedTactics.map((t) => {
                const isOpen = activeTacticTooltip === t;
                return (
                  <button
                    key={t}
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setActiveTacticTooltip((prev) => (prev === t ? null : t))}
                    className={`min-h-[32px] inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer ${
                      isOpen
                        ? 'border-blue-400 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-950/60 dark:text-blue-200'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{tr.tactics[t].shortLabel}</span>
                  </button>
                );
              })}
            </div>

            {activeTacticTooltip && (
              <div
                role="tooltip"
                className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-950 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {tr.tactics[activeTacticTooltip].label}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTacticTooltip(null)}
                    aria-label="Close tactic explanation"
                    className="inline-flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {tr.tactics[activeTacticTooltip].reason}
                </p>
                {ttsSupported && (
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleSpeech(
                        `tactic-${activeTacticTooltip}`,
                        `${tr.tactics[activeTacticTooltip].label}. ${tr.tactics[activeTacticTooltip].reason}`
                      )
                    }
                    className={`min-h-[36px] inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                      speakingKey === `tactic-${activeTacticTooltip}`
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-blue-700 text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700'
                    }`}
                  >
                    {speakingKey === `tactic-${activeTacticTooltip}` ? (
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
          </div>
        )}

        {conversation.messages.length > 0 && (() => {
          const incomingMsgs = conversation.messages.filter((m) => m.sender !== 'me');
          const aiSpanCount = incomingMsgs.reduce(
            (sum, m) => sum + m.spans.filter((s) => s.source === 'semantic').length,
            0
          );
          const maxAiConfidence = incomingMsgs.reduce(
            (mx, m) => Math.max(mx, m.semanticConfidence || 0),
            0
          );
          return (
            <div className="pt-2 space-y-1.5">
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {tr.risk.signalsTitle}
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 dark:border-slate-800 dark:bg-slate-950">
                  <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                    {tr.risk.aiSpansLabel}
                  </p>
                  <p className="mt-0.5 font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                    {aiSpanCount}
                    {maxAiConfidence > 0 ? ` · ${maxAiConfidence}%` : ''}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 dark:border-slate-800 dark:bg-slate-950">
                  <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                    {tr.risk.sequenceShiftsLabel}
                  </p>
                  <p className="mt-0.5 font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                    {risk.transitions.length}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 dark:border-slate-800 dark:bg-slate-950">
                  <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                    {tr.risk.hardAlertsLabel}
                  </p>
                  <p className="mt-0.5 font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                    {risk.hardSignalReasons.length}
                  </p>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Recommended Actions */}
      <div className="p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            {tr.risk.recommendedActions}
          </h3>
          {risk.riskLevel === 'red' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 dark:text-red-400">
              <PhoneOff className="w-3 h-3" />
              {tr.risk.stopVerify}
            </span>
          )}
        </div>

        <ul className="space-y-2 text-[13px] text-slate-700 dark:text-slate-300">
          {explanation.actions.map((action, idx) => (
            <li key={idx} className="flex items-start gap-2.5 leading-snug">
              <span className="mt-1 font-mono text-[11px] font-semibold tabular-nums text-slate-400 dark:text-slate-500">
                0{idx + 1}
              </span>
              <span>{action}</span>
            </li>
          ))}
        </ul>

        {risk.riskLevel === 'red' && (
          <div className="pt-2 flex flex-wrap items-center gap-2.5 text-xs">
            <a
              href="tel:1930"
              className="min-h-[40px] inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 font-semibold text-white hover:bg-red-700 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 shrink-0" />
              {tr.risk.callHelplineCta}
            </a>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noreferrer"
              className="min-h-[40px] inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-medium text-blue-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-slate-700"
            >
              cybercrime.gov.in
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Adaptability (In-RAM Learning) */}
      <div className="p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Cpu className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400 shrink-0" />
            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
              {tr.risk.adaptTitle}
            </h3>
          </div>
          <span className="text-[11px] font-mono tabular-nums font-semibold text-slate-500 dark:text-slate-400 shrink-0">
            +{learnedCount} RAM
          </span>
        </div>

        <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
          {tr.risk.adaptSubtitle}
        </p>

        {learnedPrototypes.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 px-3 py-2.5 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
            {tr.risk.adaptEmpty}
          </p>
        ) : (
          <ul className="space-y-1.5 max-h-32 overflow-y-auto">
            {learnedPrototypes.map((lp) => (
              <li
                key={lp.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] dark:border-slate-800 dark:bg-slate-950"
              >
                <span className="truncate text-slate-700 dark:text-slate-200">
                  “{lp.text}”
                </span>
                <span
                  className={`shrink-0 font-mono font-semibold uppercase ${
                    lp.kind === 'scam'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {lp.kind}
                </span>
              </li>
            ))}
          </ul>
        )}

        {onTeachPattern && (
          <div className="space-y-2 pt-1">
            <input
              type="text"
              value={adaptDraft}
              onChange={(e) => setAdaptDraft(e.target.value)}
              placeholder={tr.risk.adaptPlaceholder}
              className="w-full min-h-[44px] sm:min-h-[38px] rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-base sm:text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Scam tactic category"
                value={adaptTactic}
                onChange={(e) => setAdaptTactic(e.target.value as TacticId)}
                className="min-h-[40px] sm:min-h-[34px] rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {(['authority', 'urgency', 'fear', 'isolation', 'reward', 'payment', 'remote_access'] as TacticId[]).map(
                  (tid) => (
                    <option key={tid} value={tid}>
                      {tr.tactics[tid].shortLabel}
                    </option>
                  )
                )}
              </select>
              <button
                type="button"
                disabled={!adaptDraft.trim() || isTeaching}
                onClick={async () => {
                  if (!adaptDraft.trim()) return;
                  setIsTeaching(true);
                  await onTeachPattern(adaptDraft, 'scam', adaptTactic);
                  setAdaptDraft('');
                  setIsTeaching(false);
                }}
                className="min-h-[40px] sm:min-h-[34px] rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-40 cursor-pointer"
              >
                {tr.risk.teachScamBtn}
              </button>
              <button
                type="button"
                disabled={!adaptDraft.trim() || isTeaching}
                onClick={async () => {
                  if (!adaptDraft.trim()) return;
                  setIsTeaching(true);
                  await onTeachPattern(adaptDraft, 'safe', adaptTactic);
                  setAdaptDraft('');
                  setIsTeaching(false);
                }}
                className="min-h-[40px] sm:min-h-[34px] rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 cursor-pointer"
              >
                {tr.risk.teachSafeBtn}
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
