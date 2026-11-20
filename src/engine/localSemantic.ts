/**
 * Pure on-device, zero-network multilingual subword & concept semantic vectorizer.
 *
 * Provides instant 512-dimensional L2-normalized semantic embeddings inside the
 * Web Worker so AI similarity matching and adaptive few-shot learning work at
 * 0ms network dependency—even completely offline before ONNX weights download.
 * When MiniLM-L12-v2 finishes loading, the worker upgrades to 384-dim neural embeddings.
 */

export const LOCAL_VECTOR_DIM = 512;
export const LOCAL_SIMILARITY_THRESHOLD = 0.28;
export const LOCAL_SAFE_THRESHOLD = 0.65;

const FUNCTION_STOPWORDS = new Set([
  'the', 'is', 'are', 'was', 'were', 'am', 'be', 'been', 'being',
  'a', 'an', 'and', 'or', 'but', 'if', 'then', 'else', 'when',
  'to', 'of', 'in', 'on', 'at', 'by', 'for', 'with', 'from', 'as',
  'this', 'that', 'these', 'those', 'it', 'its', 'we', 'us', 'our',
  'you', 'your', 'my', 'me', 'he', 'she', 'they', 'their', 'them',
  'will', 'would', 'can', 'could', 'have', 'has', 'had', 'do', 'does',
  'hello', 'dear', 'please', 'kindly', 'today', 'tomorrow',
  'ki', 'ka', 'ke', 'ko', 'se', 'mein', 'me', 'hai', 'hain', 'ho', 'hoga',
  'ahe', 'aahe', 'te', 'la', 'lo', 'ni', 'nu',
]);

// Cross-lingual semantic concept groups so paraphrased unseen scams align across EN/HI/Hinglish/TE/MR
const CONCEPT_GROUPS: Array<[string, RegExp]> = [
  ['c_utility_auth', /\b(?:electricity|power|meter|board|treasury|pension|officer|inspector|engineer|department|desk|customs|police|cyber|authority|trai|rbi|bank)\b|(अधिकारी|पुलिस|पोलीस|विभाग|बैंक|बँक|పోలీస్|అధికారి|బ్యాంక్)/gi],
  ['c_urgency', /\b(?:tonight|immediately|straightaway|right\s+away|within|hours?|minutes?|deadline|expires?|urgent|fast|now|turant|abhi|jaldi|lagech|tatkal)\b|(तुरंत|अभी|जल्दी|तात्काळ|लगेच|వెంటనే)/gi],
  ['c_threat_loss', /\b(?:disconnected|disconnect|cut|arrears|unpaid|overdue|suspended|frozen|blocked|arrest|warrant|seized|penalty|legal|hospital|accident|trouble)\b|(गिरफ्तारी|अटक|बंद|वारंट|जुर्माना|ఖాతా|అరెస్ట్|కేసు)/gi],
  ['c_secrecy', /\b(?:secret|private|confidential|nobody|anyone|neighbors|family|disconnect|hang\s+up|without\s+telling|do\s+not\s+tell|mat\s+batana|konalahi)\b|(किसी\s*को\s*मत|गोपनीय|कोणालाही\s*सांगू\s*नका|ఎవరికీ\s*చెప్పకండి)/gi],
  ['c_reward_task', /\b(?:won|winner|jackpot|prize|lottery|bonus|reward|cashback|rating\s+.*hotels|earn\s+.*daily|work\s+from\s+home|task|jeeta|inaam)\b|(लॉटरी|इनाम|बक्षीस|బహుమతి|లాటరీ)/gi],
  ['c_payment_cred', /\b(?:settlement|deposit|fee|transfer|send|pay|remit|upi|otp|pin|cvv|kyc|aadhaar|pan|credentials|card\s+details|bataiye|bhejein|pathva|pampandi)\b|(ओटीपी|केवाईसी|पैसे|ओटीपी\s*सांगा|डబ్బు)/gi],
  ['c_remote_ctrl', /\b(?:remote|screen|share\s+display|anydesk|teamviewer|quicksupport|rustdesk|apk|download|install)\b|(एनीडेस्क|स्क्रीन|ఎనీడెస్క్)/gi],
];

function fnv1aHash(str: string, seed = 2166136261): number {
  let h = seed >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function addWeightedFeature(vec: Float32Array, feature: string, weight: number) {
  const h = fnv1aHash(feature, 2166136261);
  const idx = h % LOCAL_VECTOR_DIM;
  const sign = (h & 1) === 0 ? 1 : -1;
  vec[idx] += sign * weight;
}

export function computeLocalSemanticEmbedding(text: string): number[] {
  const vec = new Float32Array(LOCAL_VECTOR_DIM);
  const cleaned = text
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, ' __url__ ')
    .replace(/\b\d{4,8}\b/g, ' __num__ ')
    .replace(/[^\p{L}\p{N}\s_]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) {
    return Array.from(vec);
  }

  // Project cross-lingual semantic intent concepts
  for (const [conceptKey, regex] of CONCEPT_GROUPS) {
    regex.lastIndex = 0;
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
      addWeightedFeature(vec, `concept:${conceptKey}`, Math.min(2.6, 1.5 + matches.length * 0.45));
    }
  }

  const allWords = cleaned.split(' ').filter((w) => w.length >= 2);
  const contentWords = allWords.filter((w) => !FUNCTION_STOPWORDS.has(w));
  const tokens = contentWords.length > 0 ? contentWords : allWords;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    addWeightedFeature(vec, `w:${token}`, 1.4);

    if (i + 1 < tokens.length) {
      addWeightedFeature(vec, `b:${token}_${tokens[i + 1]}`, 1.6);
    }

    if (token.length >= 5 && !token.startsWith('__')) {
      const padded = `^${token}$`;
      for (let j = 0; j <= padded.length - 4; j++) {
        addWeightedFeature(vec, `c4:${padded.slice(j, j + 4)}`, 0.28);
      }
    }
  }

  // L2 normalization
  let normSq = 0;
  for (let i = 0; i < LOCAL_VECTOR_DIM; i++) {
    normSq += vec[i] * vec[i];
  }
  const norm = Math.sqrt(normSq);
  if (norm > 0) {
    for (let i = 0; i < LOCAL_VECTOR_DIM; i++) {
      vec[i] /= norm;
    }
  }

  return Array.from(vec);
}
