import type { AppLanguage } from '../i18n';

const TTS_LOCALE_MAP: Record<AppLanguage, string[]> = {
  en: ['en-IN', 'en-US', 'en-GB', 'en'],
  hi: ['hi-IN', 'hi', 'en-IN'],
  hinglish: ['en-IN', 'hi-IN', 'en-US'],
  te: ['te-IN', 'te', 'en-IN'],
  mr: ['mr-IN', 'mr', 'hi-IN', 'en-IN'],
};

export function isSpeechSynthesisSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof window.SpeechSynthesisUtterance !== 'undefined'
  );
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore browser synthesis cancellation errors
    }
  }
}

export function speakExplanation(
  text: string,
  language: AppLanguage,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
  }
): boolean {
  const clean = text.trim();
  if (!clean || !isSpeechSynthesisSupported()) {
    callbacks?.onError?.();
    return false;
  }

  try {
    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new window.SpeechSynthesisUtterance(clean);
    const preferredLocales = TTS_LOCALE_MAP[language] ?? ['en-IN', 'en-US'];
    utterance.lang = preferredLocales[0];
    utterance.rate = 0.94;
    utterance.pitch = 1.0;

    const voices = synth.getVoices();
    if (voices && voices.length > 0) {
      let matchedVoice: SpeechSynthesisVoice | undefined;
      for (const locale of preferredLocales) {
        const lower = locale.toLowerCase();
        matchedVoice =
          voices.find((v) => v.lang.toLowerCase() === lower) ??
          voices.find((v) => v.lang.toLowerCase().startsWith(lower.split('-')[0]));
        if (matchedVoice) break;
      }
      if (matchedVoice) {
        utterance.voice = matchedVoice;
        utterance.lang = matchedVoice.lang;
      }
    }

    utterance.onstart = () => callbacks?.onStart?.();
    utterance.onend = () => callbacks?.onEnd?.();
    utterance.onerror = () => callbacks?.onError?.();

    synth.speak(utterance);
    return true;
  } catch {
    callbacks?.onError?.();
    return false;
  }
}
