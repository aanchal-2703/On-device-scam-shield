import { TACTIC_META, type TacticId } from './prototypes';

export interface SpanMatch {
  start: number;
  end: number;
  tactic: TacticId;
  severity: 'caution' | 'danger';
  reason: string;
  source: 'rule' | 'semantic';
  matchedText: string;
  indicator?: {
    kind: 'known_domain' | 'shortener' | 'lookalike' | 'upi' | 'scam_number' | 'learned' | 'semantic';
    value: string;
    pct?: number;
  };
}

export interface RuleAnalysisResult {
  tactics: TacticId[];
  spans: SpanMatch[];
  hardSignals: {
    lookalikeDomain: boolean;
    knownScamDomain: boolean;
    knownScamNumber: boolean;
    suspiciousUpi: boolean;
    matchedIndicators: string[];
  };
}

export const KNOWN_SCAM_DOMAINS: readonly string[] = [
  'sbi-kyc-update.xyz',
  'hdfc-kyc-verify.top',
  'yono-sbi-alert.click',
  'paytm-kyc-help.online',
  'kbc-winner-claim.vip',
  'rbi-escrow-verify.info',
  'trai-sim-kyc.site',
  'customs-parcel-fee.xyz',
  'icici-pan-update.xyz',
  'aadhaar-verify-now.top',
];

export const KNOWN_SCAM_NUMBERS: readonly string[] = [
  '+919800112233',
  '9800112233',
  '+918000991122',
  '8000991122',
  '+917000445566',
  '7000445566',
  '+18005550199',
  '1400998877',
];

const OFFICIAL_SAFE_DOMAINS: readonly string[] = [
  'hdfcbank.com',
  'sbi.co.in',
  'onlinesbi.sbi',
  'icicibank.com',
  'axisbank.com',
  'kotak.com',
  'rbi.org.in',
  'cybercrime.gov.in',
  'bluedart.com',
  'amazon.in',
  'flipkart.com',
  'npci.org.in',
  'uidai.gov.in',
  'incometax.gov.in',
];

const BRAND_LURE_TOKENS = [
  'sbi',
  'yono',
  'hdfc',
  'icici',
  'axis',
  'kotak',
  'paytm',
  'phonepe',
  'gpay',
  'rbi',
  'kyc',
  'aadhaar',
  'pan',
  'trai',
  'epfo',
  'kbc',
  'jio',
  'customs',
  'fedex',
  'bluedart',
  'upi',
  'refund',
  'claim',
  'verify',
];

const SUSPICIOUS_TLDS = new Set([
  'xyz',
  'top',
  'tk',
  'ml',
  'ga',
  'cf',
  'gq',
  'click',
  'link',
  'buzz',
  'club',
  'online',
  'site',
  'info',
  'vip',
  'cc',
  'ws',
]);

const URL_SHORTENERS = new Set(['bit.ly', 'tinyurl.com', 't.co', 'rb.gy', 'is.gd', 'cutt.ly']);

function isOfficialDomain(hostname: string): boolean {
  const clean = hostname.toLowerCase().replace(/^www\./, '');
  return OFFICIAL_SAFE_DOMAINS.some((safe) => clean === safe || clean.endsWith(`.${safe}`));
}

function isProtectiveDeliveryOrBankNotice(text: string): boolean {
  const lower = text.toLowerCase();
  const hasDoorstepDelivery =
    /(delivery partner|delivery executive|at your doorstep|handing over|parcel.*out for delivery)/i.test(lower) &&
    /only with the delivery/i.test(lower);
  const hasAntiFraudDisclaimer =
    /(do not share over phone|never share.*otp|not you\? call|if you did not (make|initiate))/i.test(lower);
  return hasDoorstepDelivery || (hasAntiFraudDisclaimer && !/(kyc|blocked|suspended|arrest|within \d+ hour|verify.*http)/i.test(lower));
}

interface PatternRule {
  tactic: TacticId;
  regex: RegExp;
  severity?: 'caution' | 'danger';
  customReason?: string;
  skipIfProtective?: boolean;
}

const PATTERN_RULES: PatternRule[] = [
  // Authority
  {
    tactic: 'authority',
    regex: /\b(cyber\s*crime\s*cell|mumbai\s*police|delhi\s*police|crime\s*branch|cbi|enforcement\s*directorate|narcotics|customs\s*department|trai|telecom\s*regulatory|reserve\s*bank|rbi\s*escrow|income\s*tax\s*department|fraud\s*department|inspector\s+[a-z]+|customer\s*care\s*desk)\b/gi,
  },
  {
    tactic: 'authority',
    regex: /(साइबर\s*क्राइम|मुंबई\s*पुलिस|सीबीआई|बैंक\s*अधिकारी|पुलिस\s*विभाग|सायबर\s*क्राईम|मुंबई\s*पोलीस|बँक\s*अधिकारी|पोलीस\s*विभाग|సైబర్\s*క్రైమ్|పోలీస్|బ్యాంక్\s*అధికారి|ట్రాయ్)/gi,
  },
  {
    tactic: 'authority',
    regex: /\b(dear\s+(?:sbi|hdfc|icici|axis|paytm)\s+customer|yono\s+kyc|fraud\s+department\s+se)\b/gi,
  },

  // Urgency
  {
    tactic: 'urgency',
    regex: /\b(within\s+\d+\s*(?:minutes?|mins?|hours?|hrs?)|expires?\s+today|valid\s+for\s+(?:next\s+)?\d+\s*(?:minutes?|mins?|hours?)|immediately|right\s+now|act\s+fast|urgent(?:ly)?|last\s+warning|final\s+notice|(?:before|at)\s+\d+\s*(?:am|pm)(?:\s+today)?|today\s+only)\b/gi,
  },
  {
    tactic: 'urgency',
    regex: /\b(turant|abhi\s+ke\s+abhi|jaldi\s+(?:bataiye|karein|kijiye)|aaj\s+hi|lagech|tatkal)\b/gi,
  },
  {
    tactic: 'urgency',
    regex: /(तुरंत|अभी|जल्दी|आज\s*ही|तात्काळ|लगेच|आजच्या\s*आज|వెంటనే|ఈ\s*రోజే|ఆలస్యం\s*చేయకండి)/gi,
  },

  // Fear / Threat
  {
    tactic: 'fear',
    regex: /\b(digital\s*arrest|arrest\s*warrant|non-bailable\s*warrant|illegal\s*passports?|seized\s*by\s*customs|money\s*laundering|(?:account|number|sim|upi|card)(?:\s+and\s+[\w\s]+)?\s*(?:will\s*be\s*)?(?:blocked|frozen|suspended|deactivated)|disconnection|legal\s*action|police\s*case|fir\s+registered|duplicate\s+registration\s+notice|suspicious\s+transaction)\b/gi,
    skipIfProtective: true,
  },
  {
    tactic: 'fear',
    regex: /\b(paise\s+kat\s+jayenge|card\s+block|account\s+band\s+ho\s+jayega|khate\s+band\s+hoil)\b/gi,
  },
  {
    tactic: 'fear',
    regex: /(डिजिटल\s*अरेस्ट|खाता\s*बंद|गिरफ्तारी|वारंट|जुर्माना|डिजिटल\s*अटक|खाते\s*बंद|अटक\s*वॉरंट|कायदेशीर\s*कारवाई|దండన|ఖాతా\s*బ్లాక్|అరెస్ట్|కేసు\s*నమోదు)/gi,
  },

  // Isolation
  {
    tactic: 'isolation',
    regex: /\b(do\s*not\s*(?:tell|inform|share\s+with)\s*(?:anyone|your\s*family|family\s*members|friends|others)|don't\s*(?:tell|inform)\s*anyone|keep\s*(?:this|it|your\s*prize\s*code)\s*(?:strictly\s*)?(?:secret|confidential)|do\s*not\s*(?:disconnect|hang\s*up)|don't\s*(?:disconnect|hang\s*up|mention)|stay\s*on\s*(?:the\s*)?(?:call|line))\b/gi,
  },
  {
    tactic: 'isolation',
    regex: /\b(kisi\s*ko\s*(?:call\s*pe\s*)?mat\s*bat(?:ayein|ana)|family\s*ko\s*mat\s*batana|call\s*mat\s*kaatna|konalahi\s*sangu\s*naka)\b/gi,
  },
  {
    tactic: 'isolation',
    regex: /(किसी\s*को\s*मत\s*बताना|कॉल\s*मत\s*काटना|गोपनीय|कोणालाही\s*सांगू\s*नका|घरच्यांना\s*सांगू\s*नका|कॉल\s*कट\s*करू\s*नका|ఎవరికీ\s*చెప్పకండి|కాల్\s*కట్\s*చేయకండి)/gi,
  },

  // Reward / Lottery
  {
    tactic: 'reward',
    regex: /\b(congratulations!?|lucky\s*draw|lottery\s*winner|official\s*winner\s*id|won\s*(?:rs\.?|inr|₹)?\s*[\d,]+(?:\s*lakh)?|prize\s*(?:money|code)|jackpot|kbc\s*jio|claim\s*(?:your\s*)?(?:prize|bonus|reward)|cashback\s*reward)\b/gi,
  },
  {
    tactic: 'reward',
    regex: /\b(jeet\s*gaye|inaam\s*jeeta)\b/gi,
  },
  {
    tactic: 'reward',
    regex: /(लॉटरी|इनाम|जीता\s*है|बक्षीस|जिंकले\s*आहे|బహుమతి|లాటరీ|గెలుచుకున్నారు)/gi,
  },

  // Payment / Credential Request
  {
    tactic: 'payment',
    regex: /\b(enter\s*(?:the\s*)?(?:\d+-digit\s*)?otp|read\s*out\s*(?:the\s*)?(?:\d+-digit\s*)?otp|share\s*(?:your\s*)?(?:\d+-digit\s*)?otp|tell\s*(?:me\s*)?(?:the\s*)?otp|(?:\d+-digit\s*)?otp\s+(?:aaya\s+hoga[^,.]*\s*)?(?:jaldi\s+)?bata(?:iye|o)|update\s*(?:your\s*)?(?:pan|aadhaar|kyc)|kyc\s*(?:has\s*)?expired|kyc\s*update|verification\s*deposit|processing\s*(?:&|and)?\s*gst\s*fee|transfer\s*(?:rs\.?|inr|₹)?\s*[\d,]+|escrow\s*upi|share\s*(?:your\s*)?(?:bank\s*details|cvv|atm\s*pin|card\s*details))\b/gi,
    skipIfProtective: true,
  },
  {
    tactic: 'payment',
    regex: /(ओटीपी\s*बताएं|केवाईसी\s*अपडेट|पैसे\s*भेजें|ओटीपी\s*सांगा|केवायसी\s*अपडेट|पैसे\s*पाठवा|ఓటీపీ\s*చెప్పండి|డబ్బు\s*పంపండి|కేవైసీ\s*అప్డేట్)/gi,
  },

  // Remote access
  {
    tactic: 'remote_access',
    regex: /\b(anydesk|teamviewer|quicksupport|rustdesk|install\s*(?:anydesk|quicksupport|teamviewer|\.apk)|download\s*(?:this\s*)?apk|share\s*(?:your\s*)?(?:phone\s*)?screen|remote\s*access)\b/gi,
    severity: 'danger',
  },
  {
    tactic: 'remote_access',
    regex: /(एनीडेस्क|स्क्रीन\s*शेयर|एनीडेस्क\s*अ‍ॅप|स्क्रीन\s*शेअर|ఎనీడెస్క్|స్క్రీన్\s*షేర్)/gi,
    severity: 'danger',
  },
];

const URL_REGEX =
  /(https?:\/\/[^\s<>"{}|\\^`[\]]+|(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:xyz|top|tk|ml|ga|cf|gq|click|link|buzz|club|online|site|info|vip|cc|ws|com|in|co\.in|org|net)(?:\/[^\s<>"{}|\\^`[\]]*)?)/gi;

const UPI_REGEX =
  /\b[a-zA-Z0-9._-]{2,40}@(?:okaxis|okhdfcbank|okicici|oksbi|ybl|ibl|axl|paytm|upi|apl|fbl|icici|sbi|hdfcbank|waaxis|wahdfcbank)\b/gi;

const PHONE_REGEX = /(?:\+?\d{1,3}[-\s]?)?\b\d{10}\b|\b1400\d{6}\b/g;

export function analyzeRules(text: string): RuleAnalysisResult {
  const spans: SpanMatch[] = [];
  const tacticSet = new Set<TacticId>();
  const matchedIndicators: string[] = [];

  let lookalikeDomain = false;
  let knownScamDomain = false;
  let knownScamNumber = false;
  let suspiciousUpi = false;

  const protective = isProtectiveDeliveryOrBankNotice(text);

  // 1. URLs & lookalike domains
  URL_REGEX.lastIndex = 0;
  let urlMatch: RegExpExecArray | null;
  while ((urlMatch = URL_REGEX.exec(text)) !== null) {
    const rawUrl = urlMatch[0].replace(/[.,!?;:)]+$/, '');
    const start = urlMatch.index;
    const end = start + rawUrl.length;

    let hostname = rawUrl.toLowerCase();
    hostname = hostname.replace(/^https?:\/\//, '').split('/')[0].split(':')[0];
    const tld = hostname.split('.').pop() ?? '';

    if (isOfficialDomain(hostname)) {
      continue;
    }

    const isKnown = KNOWN_SCAM_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`));
    const hasBrandLure = BRAND_LURE_TOKENS.some((tok) => hostname.includes(tok));
    const hasSuspiciousTld = SUSPICIOUS_TLDS.has(tld);
    const isShortener = URL_SHORTENERS.has(hostname);

    if (isKnown || (hasBrandLure && !isOfficialDomain(hostname)) || hasSuspiciousTld || isShortener) {
      if (isKnown) knownScamDomain = true;
      if (hasBrandLure || hasSuspiciousTld) lookalikeDomain = true;
      matchedIndicators.push(hostname);
      tacticSet.add('payment');
      spans.push({
        start,
        end,
        tactic: 'payment',
        severity: 'danger',
        reason: isKnown
          ? `Known scam domain (${hostname}): mimics an official service to steal credentials or money.`
          : isShortener
            ? `Shortened link (${hostname}): hides the real destination domain.`
            : `Lookalike domain (${hostname}): imitates a trusted brand or uses a high-risk domain extension.`,
        source: 'rule',
        matchedText: rawUrl,
        indicator: {
          kind: isKnown ? 'known_domain' : isShortener ? 'shortener' : 'lookalike',
          value: hostname,
        },
      });
    }
  }

  // 2. UPI IDs
  UPI_REGEX.lastIndex = 0;
  let upiMatch: RegExpExecArray | null;
  while ((upiMatch = UPI_REGEX.exec(text)) !== null) {
    suspiciousUpi = true;
    const upiId = upiMatch[0];
    matchedIndicators.push(upiId);
    tacticSet.add('payment');
    spans.push({
      start: upiMatch.index,
      end: upiMatch.index + upiId.length,
      tactic: 'payment',
      severity: 'caution',
      reason: `UPI handle (${upiId}): verify recipient identity independently before sending money.`,
      source: 'rule',
      matchedText: upiId,
      indicator: { kind: 'upi', value: upiId },
    });
  }

  // 3. Known scam phone numbers
  PHONE_REGEX.lastIndex = 0;
  let phoneMatch: RegExpExecArray | null;
  while ((phoneMatch = PHONE_REGEX.exec(text)) !== null) {
    const normalized = phoneMatch[0].replace(/[\s-]/g, '');
    if (KNOWN_SCAM_NUMBERS.includes(normalized)) {
      knownScamNumber = true;
      matchedIndicators.push(phoneMatch[0]);
      tacticSet.add('authority');
      spans.push({
        start: phoneMatch.index,
        end: phoneMatch.index + phoneMatch[0].length,
        tactic: 'authority',
        severity: 'danger',
        reason: `Known scam number (${phoneMatch[0]}): flagged in local scam-number blocklist.`,
        source: 'rule',
        matchedText: phoneMatch[0],
        indicator: { kind: 'scam_number', value: phoneMatch[0] },
      });
    }
  }

  // 4. Pattern rules
  for (const rule of PATTERN_RULES) {
    if (rule.skipIfProtective && protective) {
      continue;
    }
    rule.regex.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = rule.regex.exec(text)) !== null) {
      const matchedText = m[0];
      const meta = TACTIC_META[rule.tactic];
      tacticSet.add(rule.tactic);
      spans.push({
        start: m.index,
        end: m.index + matchedText.length,
        tactic: rule.tactic,
        severity: rule.severity ?? meta.severity,
        reason: rule.customReason ?? meta.reason,
        source: 'rule',
        matchedText,
      });
    }
  }

  // Deduplicate / resolve overlapping spans cleanly (prefer longer / danger spans)
  const mergedSpans = resolveOverlappingSpans(spans);

  return {
    tactics: Array.from(tacticSet),
    spans: mergedSpans,
    hardSignals: {
      lookalikeDomain,
      knownScamDomain,
      knownScamNumber,
      suspiciousUpi,
      matchedIndicators,
    },
  };
}

export function resolveOverlappingSpans(rawSpans: SpanMatch[]): SpanMatch[] {
  if (rawSpans.length === 0) return [];
  const sorted = [...rawSpans].sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    const sevDiff = (b.severity === 'danger' ? 1 : 0) - (a.severity === 'danger' ? 1 : 0);
    if (sevDiff !== 0) return sevDiff;
    return b.end - b.start - (a.end - a.start);
  });

  const result: SpanMatch[] = [];
  for (const span of sorted) {
    const prev = result[result.length - 1];
    if (!prev || span.start >= prev.end) {
      result.push(span);
      continue;
    }
    // Overlapping: keep whichever is danger or longer (and prefers rule over semantic)
    const prevPriority =
      (prev.severity === 'danger' ? 100 : 0) +
      (prev.source === 'rule' ? 50 : 0) +
      (prev.end - prev.start);
    const curPriority =
      (span.severity === 'danger' ? 100 : 0) +
      (span.source === 'rule' ? 50 : 0) +
      (span.end - span.start);

    if (curPriority > prevPriority) {
      result[result.length - 1] = span;
    }
  }
  return result;
}
