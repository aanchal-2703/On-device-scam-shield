import type { ConversationRiskState } from './sequence';
import { extractPaymentDestinations, type PaymentDetailMessage } from './paymentDetails';

export const HIGH_RISK_THRESHOLD = 80;

export function isHighRiskScore(score: number): boolean {
  return score >= HIGH_RISK_THRESHOLD;
}

export function shouldTriggerHighRiskPopup(
  previousScore: number,
  currentScore: number,
  alreadyTriggered: boolean
): boolean {
  return (
    isHighRiskScore(currentScore) &&
    !alreadyTriggered &&
    (previousScore < HIGH_RISK_THRESHOLD || isHighRiskScore(previousScore))
  );
}

export function buildComplaintSummary(
  risk: ConversationRiskState,
  conversationTitle: string,
  channel: string,
  messages: PaymentDetailMessage[] = []
): string {
  const categories =
    risk.detectedTactics.length > 0
      ? risk.detectedTactics.join(', ')
      : 'Possible cyber fraud';
  const reasons =
    risk.hardSignalReasons.length > 0
      ? risk.hardSignalReasons.join('; ')
      : 'The detected conversation used suspicious scam patterns.';
  const destinations = extractPaymentDestinations(messages);

  return [
    'Cyber Fraud Complaint Summary',
    `Incident: ${conversationTitle}`,
    `Channel: ${channel}`,
    `Risk score: ${risk.score}/100`,
    `Detected category: ${categories}`,
    `Payment destination details found: ${
      destinations.length > 0
        ? destinations.map(({ type, value }) => `${type}: ${value}`).join('; ')
        : 'No account or payment destination details detected in analyzed content'
    }`,
    `Why it was flagged: ${reasons}`,
    'Please review and update this summary before filing the complaint.',
  ].join('\n');
}
