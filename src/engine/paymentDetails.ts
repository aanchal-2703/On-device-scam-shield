import type { SpanMatch } from './rules';

export interface PaymentDetailMessage {
  sender: 'them' | 'me' | 'caller';
  text: string;
  spans: SpanMatch[];
}

export interface PaymentDestination {
  type: 'UPI ID' | 'Bank account' | 'IFSC code';
  value: string;
}

const ACCOUNT_NUMBER_REGEX =
  /\b(?:bank\s+)?(?:account|a\/c)(?:\s*(?:number|no\.?))?\s*(?:(?:is|:|#|=)\s*)?([0-9][0-9 -]{6,20}[0-9])\b/gi;
const IFSC_REGEX = /\b[A-Z]{4}0[A-Z0-9]{6}\b/gi;

export function extractPaymentDestinations(
  messages: PaymentDetailMessage[]
): PaymentDestination[] {
  const destinations = new Map<string, PaymentDestination>();

  for (const message of messages) {
    if (message.sender === 'me') continue;

    for (const span of message.spans) {
      if (span.indicator?.kind === 'upi') {
        const value = span.indicator.value.trim();
        destinations.set(`upi:${value.toLowerCase()}`, { type: 'UPI ID', value });
      }
    }

    ACCOUNT_NUMBER_REGEX.lastIndex = 0;
    let accountMatch: RegExpExecArray | null;
    while ((accountMatch = ACCOUNT_NUMBER_REGEX.exec(message.text)) !== null) {
      const value = accountMatch[1].replace(/\D/g, '');
      if (value.length >= 8 && value.length <= 18) {
        destinations.set(`account:${value}`, { type: 'Bank account', value });
      }
    }

    IFSC_REGEX.lastIndex = 0;
    let ifscMatch: RegExpExecArray | null;
    while ((ifscMatch = IFSC_REGEX.exec(message.text)) !== null) {
      const value = ifscMatch[0].toUpperCase();
      destinations.set(`ifsc:${value}`, { type: 'IFSC code', value });
    }
  }

  return Array.from(destinations.values());
}
