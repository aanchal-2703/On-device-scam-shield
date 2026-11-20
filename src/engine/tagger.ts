import { TACTIC_META, type TacticId } from './prototypes';
import { analyzeRules, resolveOverlappingSpans, type RuleAnalysisResult, type SpanMatch } from './rules';

/**
 * Minimum cosine similarity for semantic prototype matching.
 * Easy to tune: lower increases recall, higher increases precision.
 */
export const SIMILARITY_THRESHOLD = 0.55;

/**
 * Similarity threshold for user-marked "safe" overrides.
 */
export const SAFE_SIMILARITY_THRESHOLD = 0.72;

export interface ClauseSpan {
  text: string;
  start: number;
  end: number;
}

export interface EmbeddedPrototype {
  tactic: TacticId;
  text: string;
  embedding: number[];
}

export type SemanticEngineMode = 'minilm' | 'local-vector' | 'rules';

export interface LearnedPrototype {
  id: string;
  kind: 'scam' | 'safe';
  tactic?: TacticId;
  text: string;
  embedding: number[];
  space?: 'minilm' | 'local-vector';
}

export interface TaggerResult {
  tactics: TacticId[];
  spans: SpanMatch[];
  hardSignals: RuleAnalysisResult['hardSignals'];
  embedding: number[] | null;
  learnedScamMatch: boolean;
  learnedSafeMatch: boolean;
  engineMode: SemanticEngineMode;
  semanticConfidence: number;
}

export function cosineSimilarity(a: ArrayLike<number>, b: ArrayLike<number>): number {
  const len = Math.min(a.length, b.length);
  if (len === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < len; i++) {
    const va = a[i];
    const vb = b[i];
    dot += va * vb;
    normA += va * va;
    normB += vb * vb;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export function splitIntoClauses(text: string): ClauseSpan[] {
  const clauses: ClauseSpan[] = [];
  // Split on sentence boundaries, commas, semicolons, or newlines while tracking exact offsets
  const regex = /[^.!?\n,;]+(?:[.!?,;\n]+|$)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const raw = match[0];
    const trimmedStartOffset = raw.search(/\S/);
    if (trimmedStartOffset === -1) continue;
    const trimmed = raw.trim().replace(/[.!?,;]+$/, '').trim();
    if (trimmed.length < 4) continue;
    const baseStart = match.index + trimmedStartOffset;

    if (trimmed.length > 55) {
      const subParts: ClauseSpan[] = [];
      const subRegex = /\s+(?=unless\b|otherwise\b|without\s+telling\b|so\s+that\b)/gi;
      let lastIdx = 0;
      let subMatch: RegExpExecArray | null;
      while ((subMatch = subRegex.exec(trimmed)) !== null) {
        const piece = trimmed.slice(lastIdx, subMatch.index).trim();
        if (piece.length >= 4) {
          const offsetInSlice = trimmed.slice(lastIdx).search(/\S/);
          const pStart = baseStart + lastIdx + Math.max(0, offsetInSlice);
          subParts.push({ text: piece, start: pStart, end: pStart + piece.length });
        }
        lastIdx = subMatch.index + subMatch[0].length;
      }
      const tail = trimmed.slice(lastIdx).trim();
      if (tail.length >= 4) {
        const offsetInTail = trimmed.slice(lastIdx).search(/\S/);
        const pStart = baseStart + lastIdx + Math.max(0, offsetInTail);
        subParts.push({ text: tail, start: pStart, end: pStart + tail.length });
      }
      if (subParts.length > 1) {
        clauses.push(...subParts);
        continue;
      }
    }

    clauses.push({ text: trimmed, start: baseStart, end: baseStart + trimmed.length });
  }
  if (clauses.length === 0 && text.trim().length > 0) {
    const start = text.search(/\S/);
    const trimmed = text.trim();
    clauses.push({ text: trimmed, start: Math.max(0, start), end: Math.max(0, start) + trimmed.length });
  }
  return clauses;
}

export function matchSemanticTactics(
  text: string,
  fullEmbedding: number[] | null,
  clauseEmbeddings: { clause: ClauseSpan; embedding: number[] }[],
  builtInPrototypes: EmbeddedPrototype[],
  learnedPrototypes: LearnedPrototype[],
  threshold: number = SIMILARITY_THRESHOLD,
  engineMode: 'minilm' | 'local-vector' = 'minilm',
  safeThreshold: number = SAFE_SIMILARITY_THRESHOLD
): TaggerResult {
  const ruleResult = analyzeRules(text);
  const tacticSet = new Set<TacticId>(ruleResult.tactics);
  const spans: SpanMatch[] = [...ruleResult.spans];

  let learnedScamMatch = false;
  let learnedSafeMatch = false;
  let maxSemanticScore = 0;

  if (!fullEmbedding || builtInPrototypes.length === 0) {
    return {
      tactics: Array.from(tacticSet),
      spans: resolveOverlappingSpans(spans),
      hardSignals: ruleResult.hardSignals,
      embedding: fullEmbedding,
      learnedScamMatch,
      learnedSafeMatch,
      engineMode: 'rules',
      semanticConfidence: 0,
    };
  }

  // Check learned user prototypes first (matching the active embedding space/dimensions)
  for (const lp of learnedPrototypes) {
    if (lp.space && lp.space !== engineMode) continue;
    if (lp.embedding.length !== fullEmbedding.length) continue;

    const sim = cosineSimilarity(fullEmbedding, lp.embedding);
    if (lp.kind === 'safe' && sim >= safeThreshold) {
      learnedSafeMatch = true;
    } else if (lp.kind === 'scam' && sim >= threshold) {
      learnedScamMatch = true;
      maxSemanticScore = Math.max(maxSemanticScore, sim);
      const tactic: TacticId = lp.tactic ?? 'payment';
      tacticSet.add(tactic);
      const firstClause = clauseEmbeddings[0]?.clause ?? { start: 0, end: text.length, text };
      spans.push({
        start: firstClause.start,
        end: firstClause.end,
        tactic,
        severity: 'danger',
        reason: `Matched a pattern you previously marked as scam (${Math.round(sim * 100)}% similarity).`,
        source: 'semantic',
        matchedText: text.slice(firstClause.start, firstClause.end),
        indicator: {
          kind: 'learned',
          value: lp.text,
          pct: Math.round(sim * 100),
        },
      });
    }
  }

  // If user explicitly taught us messages like this are safe and there are no hard domain/number alerts,
  // suppress fuzzy semantic prototype matches.
  if (
    learnedSafeMatch &&
    !ruleResult.hardSignals.knownScamDomain &&
    !ruleResult.hardSignals.lookalikeDomain &&
    !ruleResult.hardSignals.knownScamNumber
  ) {
    return {
      tactics: [],
      spans: [],
      hardSignals: ruleResult.hardSignals,
      embedding: fullEmbedding,
      learnedScamMatch: false,
      learnedSafeMatch: true,
      engineMode,
      semanticConfidence: 0,
    };
  }

  // Score each clause against built-in multilingual prototypes
  const bestPerTactic = new Map<TacticId, { score: number; clause: ClauseSpan }>();

  for (const { clause, embedding } of clauseEmbeddings) {
    for (const proto of builtInPrototypes) {
      const sim = cosineSimilarity(embedding, proto.embedding);
      if (sim >= threshold) {
        const current = bestPerTactic.get(proto.tactic);
        if (!current || sim > current.score) {
          bestPerTactic.set(proto.tactic, { score: sim, clause });
        }
      }
    }
  }

  // Also check full-message embedding for tactics spanning multiple short clauses
  for (const proto of builtInPrototypes) {
    const sim = cosineSimilarity(fullEmbedding, proto.embedding);
    if (sim >= threshold + 0.03) {
      const current = bestPerTactic.get(proto.tactic);
      if (!current || sim > current.score) {
        const fallbackClause = clauseEmbeddings[0]?.clause ?? {
          start: 0,
          end: text.length,
          text,
        };
        bestPerTactic.set(proto.tactic, { score: sim, clause: fallbackClause });
      }
    }
  }

  // Avoid spurious semantic tagging on protective notices ("Share OTP ONLY with delivery partner...")
  const lower = text.toLowerCase();
  const isProtectiveNotice =
    /(only with the delivery partner|do not share over phone|not you\? call)/i.test(lower) &&
    !ruleResult.hardSignals.lookalikeDomain &&
    !ruleResult.hardSignals.knownScamDomain;

  if (!isProtectiveNotice) {
    for (const [tactic, matchInfo] of bestPerTactic.entries()) {
      tacticSet.add(tactic);
      maxSemanticScore = Math.max(maxSemanticScore, matchInfo.score);
      const meta = TACTIC_META[tactic];
      // Add semantic span if no rule span already covers this tactic in that region
      const alreadyCovered = spans.some(
        (s) =>
          s.tactic === tactic &&
          Math.max(s.start, matchInfo.clause.start) < Math.min(s.end, matchInfo.clause.end)
      );
      if (!alreadyCovered) {
        spans.push({
          start: matchInfo.clause.start,
          end: matchInfo.clause.end,
          tactic,
          severity: meta.severity,
          reason: meta.reason,
          source: 'semantic',
          matchedText: text.slice(matchInfo.clause.start, matchInfo.clause.end),
          indicator: {
            kind: 'semantic',
            value: engineMode,
            pct: Math.round(matchInfo.score * 100),
          },
        });
      }
    }
  }

  return {
    tactics: Array.from(tacticSet),
    spans: resolveOverlappingSpans(spans),
    hardSignals: ruleResult.hardSignals,
    embedding: fullEmbedding,
    learnedScamMatch,
    learnedSafeMatch,
    engineMode,
    semanticConfidence: Math.round(maxSemanticScore * 100),
  };
}
