import { SEQUENCE_ORDER, type SequenceStage, type TacticId } from './prototypes';
import type { SpanMatch } from './rules';

export type RiskLevel = 'green' | 'amber' | 'red';

export interface TacticOccurrence {
  tactic: TacticId;
  messageId: string;
  timestamp: string;
}

export interface SequenceTransition {
  from: TacticId;
  to: TacticId;
  bonus: number;
}

export interface ConversationRiskState {
  score: number;
  riskLevel: RiskLevel;
  detectedTactics: TacticId[];
  activeStages: Record<SequenceStage, boolean>;
  stageOrder: SequenceStage[];
  occurrences: TacticOccurrence[];
  transitions: SequenceTransition[];
  hardSignalReasons: string[];
  learnedScamBoost: number;
}

export interface MessageEvaluationInput {
  messageId: string;
  timestamp: string;
  sender: 'them' | 'me' | 'system' | 'caller';
  tactics: TacticId[];
  spans: SpanMatch[];
  hardSignals?: {
    lookalikeDomain: boolean;
    knownScamDomain: boolean;
    knownScamNumber: boolean;
    suspiciousUpi: boolean;
    matchedIndicators: string[];
  };
  learnedScamMatch?: boolean;
  learnedSafeMatch?: boolean;
}

const STAGE_WEIGHTS: Record<TacticId, number> = {
  authority: 15,
  reward: 15,
  urgency: 15,
  fear: 18,
  isolation: 20,
  payment: 18,
  remote_access: 24,
};

function getEffectiveStageIndex(tactic: TacticId): number {
  if (tactic === 'reward') return 0; // Entry lure parallel to authority
  if (tactic === 'remote_access') return 4; // Takeover end-stage parallel to payment
  return SEQUENCE_ORDER.indexOf(tactic as SequenceStage);
}

export function createEmptyRiskState(): ConversationRiskState {
  return {
    score: 0,
    riskLevel: 'green',
    detectedTactics: [],
    activeStages: {
      authority: false,
      urgency: false,
      fear: false,
      isolation: false,
      payment: false,
    },
    stageOrder: [],
    occurrences: [],
    transitions: [],
    hardSignalReasons: [],
    learnedScamBoost: 0,
  };
}

export function scoreRiskLevel(score: number): RiskLevel {
  if (score >= 80) return 'red';
  if (score >= 35) return 'amber';
  return 'green';
}

export function evaluateConversationSequence(
  messages: MessageEvaluationInput[]
): ConversationRiskState {
  const seenTactics: TacticId[] = [];
  const occurrences: TacticOccurrence[] = [];
  const activeStages: Record<SequenceStage, boolean> = {
    authority: false,
    urgency: false,
    fear: false,
    isolation: false,
    payment: false,
  };
  const stageOrder: SequenceStage[] = [];
  const hardSignalReasons: string[] = [];

  let hardSignalBonus = 0;
  let learnedScamBoost = 0;
  let hasLearnedSafeSuppression = false;
  let hasHardDomainOrNumber = false;

  for (const msg of messages) {
    // Only incoming/caller messages drive scam risk; outgoing user replies don't penalize
    if (msg.sender === 'me') continue;

    // Order tactics within a single message according to SEQUENCE_ORDER
    const orderedMsgTactics = [...new Set(msg.tactics)].sort(
      (a, b) => getEffectiveStageIndex(a) - getEffectiveStageIndex(b)
    );

    for (const tactic of orderedMsgTactics) {
      if (!seenTactics.includes(tactic)) {
        seenTactics.push(tactic);
        occurrences.push({
          tactic,
          messageId: msg.messageId,
          timestamp: msg.timestamp,
        });
      }

      if (SEQUENCE_ORDER.includes(tactic as SequenceStage)) {
        const stage = tactic as SequenceStage;
        if (!activeStages[stage]) {
          activeStages[stage] = true;
          stageOrder.push(stage);
        }
      } else if (tactic === 'remote_access') {
        if (!activeStages.payment) {
          activeStages.payment = true;
          stageOrder.push('payment');
        }
      }
    }

    if (msg.hardSignals) {
      if (msg.hardSignals.knownScamDomain) {
        hasHardDomainOrNumber = true;
        hardSignalBonus += 35;
        hardSignalReasons.push(
          `Known scam domain detected (${msg.hardSignals.matchedIndicators.join(', ')})`
        );
      } else if (msg.hardSignals.lookalikeDomain) {
        hasHardDomainOrNumber = true;
        hardSignalBonus += 28;
        hardSignalReasons.push(
          `Lookalike / suspicious domain detected (${msg.hardSignals.matchedIndicators.join(', ')})`
        );
      }
      if (msg.hardSignals.knownScamNumber) {
        hasHardDomainOrNumber = true;
        hardSignalBonus += 28;
        hardSignalReasons.push('Known scam phone number matched local blocklist');
      }
      if (msg.hardSignals.suspiciousUpi && seenTactics.length >= 2) {
        hardSignalBonus += 8;
      }
    }

    if (msg.learnedScamMatch) {
      learnedScamBoost = Math.max(learnedScamBoost, 32);
    }
    if (msg.learnedSafeMatch) {
      hasLearnedSafeSuppression = true;
    }
  }

  // 1. Sum of unique tactic weights
  let baseWeightSum = 0;
  for (const tactic of seenTactics) {
    baseWeightSum += STAGE_WEIGHTS[tactic];
  }

  // 2. Sequence progression bonuses:
  // Every tactic that appears AFTER an earlier stage in SEQUENCE_ORDER adds a bonus.
  const transitions: SequenceTransition[] = [];
  let sequenceBonus = 0;

  for (let i = 0; i < seenTactics.length; i++) {
    const later = seenTactics[i];
    const laterIdx = getEffectiveStageIndex(later);
    if (laterIdx <= 0) continue;

    for (let j = 0; j < i; j++) {
      const earlier = seenTactics[j];
      const earlierIdx = getEffectiveStageIndex(earlier);
      if (earlierIdx >= 0 && earlierIdx < laterIdx) {
        // Payment / remote_access after authority/urgency/fear/isolation carries a sharp escalation jump
        const bonus = later === 'payment' || later === 'remote_access' ? 12 : 9;
        sequenceBonus += bonus;
        transitions.push({ from: earlier, to: later, bonus });
      }
    }
  }

  // Extra escalation check: payment or remote_access appearing after authority + urgency
  const hasAuthorityOrReward = seenTactics.includes('authority') || seenTactics.includes('reward');
  const hasPressure = seenTactics.includes('urgency') || seenTactics.includes('fear');
  const hasTakeoverAsk = seenTactics.includes('payment') || seenTactics.includes('remote_access');
  let comboEscalation = 0;
  if (hasAuthorityOrReward && hasPressure && hasTakeoverAsk) {
    // Guarantees jump to red (>= 80) when authority + urgency/fear + payment/OTP appear together
    comboEscalation = 10;
  }

  let rawScore = baseWeightSum + sequenceBonus + comboEscalation + hardSignalBonus + learnedScamBoost;

  // Single tactic alone (with no hard domain/number/learned-scam signal) must stay low (GREEN)
  if (seenTactics.length <= 1 && !hasHardDomainOrNumber && learnedScamBoost === 0) {
    rawScore = Math.min(rawScore, 26);
  }

  if (hasLearnedSafeSuppression && !hasHardDomainOrNumber) {
    rawScore = Math.round(rawScore * 0.25);
  }

  const score = Math.max(0, Math.min(100, Math.round(rawScore)));
  const riskLevel = scoreRiskLevel(score);

  return {
    score,
    riskLevel,
    detectedTactics: seenTactics,
    activeStages,
    stageOrder,
    occurrences,
    transitions,
    hardSignalReasons: Array.from(new Set(hardSignalReasons)),
    learnedScamBoost,
  };
}

export interface RiskProgressionPoint {
  turn: number;
  label: string;
  messageId: string;
  timestamp: string;
  score: number;
  riskLevel: RiskLevel;
  tactics: TacticId[];
}

export function evaluateConversationProgression(
  messages: MessageEvaluationInput[]
): RiskProgressionPoint[] {
  const points: RiskProgressionPoint[] = [];
  for (let i = 0; i < messages.length; i++) {
    const sliceState = evaluateConversationSequence(messages.slice(0, i + 1));
    const msg = messages[i];
    points.push({
      turn: i + 1,
      label: `#${i + 1}`,
      messageId: msg.messageId,
      timestamp: msg.timestamp,
      score: sliceState.score,
      riskLevel: sliceState.riskLevel,
      tactics: msg.sender === 'me' ? [] : msg.tactics,
    });
  }
  return points;
}

