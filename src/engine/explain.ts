import { TRANSLATIONS, type AppLanguage } from '../i18n';
import type { ConversationRiskState } from './sequence';

export interface ExplanationResult {
  headline: string;
  narrative: string;
  actions: string[];
}

function joinClauses(clauses: string[], language: AppLanguage): string {
  const tr = TRANSLATIONS[language].explain;
  if (clauses.length === 0) return '';
  if (clauses.length === 1) return `${tr.storyPrefix} ${clauses[0]}.`;
  if (clauses.length === 2) return `${tr.storyPrefix} ${clauses[0]}${tr.storyThen}${clauses[1]}.`;
  const head = clauses.slice(0, -1).join(tr.storyThen);
  const tail = clauses[clauses.length - 1];
  return `${tr.storyPrefix} ${head}${tr.storyAndThen}${tail}.`;
}

export function buildExplanation(
  risk: ConversationRiskState,
  language: AppLanguage = 'en'
): ExplanationResult {
  const { detectedTactics, riskLevel, hardSignalReasons } = risk;
  const tr = TRANSLATIONS[language].explain;

  if (detectedTactics.length === 0 && hardSignalReasons.length === 0) {
    return {
      headline: tr.noScamHeadline,
      narrative: tr.noScamBody,
      actions: [tr.noScamAction],
    };
  }

  const clauses = detectedTactics.map((t) => tr.clauses[t]);
  let narrative = joinClauses(clauses, language);

  if (hardSignalReasons.length > 0) {
    narrative = `${narrative} ${tr.warningPrefix} ${hardSignalReasons[0]}.`.trim();
  }

  if (riskLevel === 'green') {
    return {
      headline: tr.lowRiskHeadline,
      narrative:
        detectedTactics.length === 1
          ? `${tr.storyPrefix} ${tr.clauses[detectedTactics[0]]}. ${tr.lowRiskSingle}`
          : narrative,
      actions: [tr.lowRiskAction1, tr.lowRiskAction2],
    };
  }

  const hasPhishingLink = hardSignalReasons.some((r) => /domain|lookalike/i.test(r));

  if (riskLevel === 'amber') {
    const amberActions = [...tr.amberActions];
    if (hasPhishingLink) {
      amberActions.unshift(tr.phishingLinkAction);
    }
    return {
      headline: tr.amberHeadline,
      narrative,
      actions: amberActions,
    };
  }

  // Red
  const redActions = [...tr.redActions];
  if (detectedTactics.includes('payment')) {
    redActions.unshift(tr.upiCollectAction);
  }
  if (hasPhishingLink) {
    redActions.unshift(tr.phishingLinkAction);
  }
  if (detectedTactics.includes('remote_access')) {
    redActions.unshift(tr.remoteAccessAction);
  }

  return {
    headline: tr.redHeadline,
    narrative,
    actions: redActions,
  };
}
