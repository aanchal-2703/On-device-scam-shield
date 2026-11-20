import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import type { AppLanguage } from '../i18n';
import { speakExplanation, stopSpeaking } from '../engine/speechTts';
import {
  parseVoiceNavigationCommand,
  type NavigableView,
} from '../engine/voiceNavigation';

interface VoiceNavigationProps {
  language: AppLanguage;
  activeView: NavigableView;
  onNavigate: (view: NavigableView) => void;
  onOpenCallConsent: () => void;
  onWipe?: () => void;
}

interface SpeechRecognitionEventLike {
  results: {
    [index: number]: {
      [index: number]: { transcript: string };
      isFinal: boolean;
    };
  };
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

const LOCALE: Record<AppLanguage, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  hinglish: 'en-IN',
  te: 'te-IN',
  mr: 'mr-IN',
};

const VOICE_COPY: Record<
  AppLanguage,
  {
    help: string;
    clarify: string;
    unavailable: string;
    unknown: string;
    ready: string;
    unsupported: string;
    retry: string;
    listening: string;
    noSpeech: string;
    permission: string;
    microphone: string;
    network: string;
    stopped: string;
    heard: string;
    hint: string;
    voice: string;
    start: string;
    stop: string;
  }
> = {
  en: {
    help: 'Say: Go to Home, Open Messages, or Open Call mode. Ask “Where am I?” to hear the current page.',
    clarify: 'Which page would you like? Say Home, Messages, or Call mode.',
    unavailable: 'The Privacy Proof page has been removed. You can go to Home, Messages, or Call mode.',
    unknown: 'I did not understand. Say Help to hear the available page commands.',
    ready: 'Voice navigation is ready. Say Help to hear page commands.',
    unsupported: 'Voice navigation is not supported in this browser. Please use Chrome or Edge.',
    retry: 'Voice listening stopped. Tap the microphone and try again.',
    listening: 'Listening. Say one command, such as “Open Messages”.',
    noSpeech: 'I did not hear anything. Tap the microphone and try again.',
    permission: 'Microphone access is blocked. Allow it in your browser settings, then try again.',
    microphone: 'No microphone was found. Connect or enable a microphone, then try again.',
    network: 'The browser voice service is unavailable. Check your connection and try again.',
    stopped: 'Voice listening stopped.',
    heard: 'Heard',
    hint: 'Tap the microphone, then say: “Go to Home”, “Open Messages”, or “Call mode”.',
    voice: 'Voice',
    start: 'Start voice navigation',
    stop: 'Stop voice navigation',
  },
  hi: {
    help: 'कहें: घर खोलो, संदेश खोलो, या कॉल मोड खोलो। वर्तमान पृष्ठ जानने के लिए कहें, मैं कहाँ हूँ।',
    clarify: 'आप कौन सा पृष्ठ खोलना चाहते हैं? घर, संदेश, या कॉल मोड कहें।',
    unavailable: 'गोपनीयता प्रमाण पृष्ठ हटा दिया गया है। आप घर, संदेश, या कॉल मोड खोल सकते हैं।',
    unknown: 'मैं समझ नहीं पाया। पृष्ठ के आदेश सुनने के लिए मदद कहें।',
    ready: 'आवाज़ से नेविगेशन तैयार है। पृष्ठ के आदेश सुनने के लिए मदद कहें।',
    unsupported: 'इस ब्राउज़र में आवाज़ से नेविगेशन उपलब्ध नहीं है। Chrome या Edge इस्तेमाल करें।',
    retry: 'आवाज़ सुनना रुक गया। माइक्रोफ़ोन दबाकर फिर कोशिश करें।',
    listening: 'सुन रहा हूँ। एक आदेश कहें, जैसे “संदेश खोलो”।',
    noSpeech: 'आवाज़ सुनाई नहीं दी। माइक्रोफ़ोन दबाकर फिर कोशिश करें।',
    permission: 'माइक्रोफ़ोन की अनुमति बंद है। ब्राउज़र सेटिंग में अनुमति दें और फिर कोशिश करें।',
    microphone: 'माइक्रोफ़ोन नहीं मिला। माइक्रोफ़ोन चालू करके फिर कोशिश करें।',
    network: 'ब्राउज़र की आवाज़ सेवा उपलब्ध नहीं है। इंटरनेट जाँचकर फिर कोशिश करें।',
    stopped: 'आवाज़ सुनना बंद है।',
    heard: 'आपने कहा',
    hint: 'माइक्रोफ़ोन दबाएँ और कहें: “घर खोलो”, “संदेश खोलो”, या “कॉल मोड”.',
    voice: 'आवाज़',
    start: 'आवाज़ से नेविगेशन शुरू करें',
    stop: 'आवाज़ से नेविगेशन रोकें',
  },
  hinglish: {
    help: 'Boliye: Home kholo, Messages kholo, ya Call mode kholo. Current page jaanne ke liye bolo, main kahan hoon.',
    clarify: 'Kaunsa page kholna hai? Home, Messages, ya Call mode boliye.',
    unavailable: 'Privacy Proof page hata diya gaya hai. Aap Home, Messages, ya Call mode khol sakte hain.',
    unknown: 'Samajh nahi aaya. Page commands sunne ke liye Help boliye.',
    ready: 'Voice navigation ready hai. Page commands sunne ke liye Help boliye.',
    unsupported: 'Is browser mein voice navigation nahi chalta. Chrome ya Edge use karein.',
    retry: 'Voice sunna ruk gaya. Microphone dabakar phir koshish karein.',
    listening: 'Sun raha hoon. Ek command boliye, jaise “Messages kholo”.',
    noSpeech: 'Awaaz sunai nahi di. Microphone dabakar phir koshish karein.',
    permission: 'Microphone permission band hai. Browser settings mein allow karke phir try karein.',
    microphone: 'Microphone nahi mila. Microphone connect ya on karke phir try karein.',
    network: 'Browser ki voice service available nahi hai. Internet check karke phir try karein.',
    stopped: 'Voice sunna band hai.',
    heard: 'Aapne kaha',
    hint: 'Microphone dabayein, phir bolein: “Home kholo”, “Messages kholo”, ya “Call mode”.',
    voice: 'Voice',
    start: 'Voice navigation shuru karein',
    stop: 'Voice navigation rokein',
  },
  te: {
    help: 'ఇలా చెప్పండి: హోమ్ తెరువు, సందేశాలు తెరువు, లేదా కాల్ మోడ్ తెరువు. ప్రస్తుత పేజీ తెలుసుకోవడానికి నేను ఎక్కడ ఉన్నాను అని అడగండి.',
    clarify: 'ఏ పేజీ కావాలి? హోమ్, సందేశాలు, లేదా కాల్ మోడ్ అని చెప్పండి.',
    unavailable: 'గోప్యత పేజీ తీసివేయబడింది. హోమ్, సందేశాలు, లేదా కాల్ మోడ్ తెరవండి.',
    unknown: 'మీ మాట అర్థం కాలేదు. పేజీ ఆదేశాల కోసం సహాయం అని చెప్పండి.',
    ready: 'వాయిస్ నావిగేషన్ సిద్ధంగా ఉంది. పేజీ ఆదేశాల కోసం సహాయం అని చెప్పండి.',
    unsupported: 'ఈ బ్రౌజర్‌లో వాయిస్ నావిగేషన్ లేదు. Chrome లేదా Edge ఉపయోగించండి.',
    retry: 'వాయిస్ వినడం ఆగింది. మైక్రోఫోన్ నొక్కి మళ్లీ ప్రయత్నించండి.',
    listening: 'వింటున్నాను. “సందేశాలు తెరువు” వంటి ఒక ఆదేశం చెప్పండి.',
    noSpeech: 'ఏమీ వినిపించలేదు. మైక్రోఫోన్ నొక్కి మళ్లీ ప్రయత్నించండి.',
    permission: 'మైక్రోఫోన్ అనుమతి లేదు. బ్రౌజర్ సెట్టింగ్‌లలో అనుమతించి మళ్లీ ప్రయత్నించండి.',
    microphone: 'మైక్రోఫోన్ కనబడలేదు. మైక్రోఫోన్‌ను కనెక్ట్ చేసి లేదా ఆన్ చేసి మళ్లీ ప్రయత్నించండి.',
    network: 'బ్రౌజర్ వాయిస్ సేవ అందుబాటులో లేదు. ఇంటర్నెట్ తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.',
    stopped: 'వాయిస్ వినడం ఆగింది.',
    heard: 'మీరు చెప్పింది',
    hint: 'మైక్రోఫోన్ నొక్కి ఇలా చెప్పండి: “హోమ్ తెరువు”, “సందేశాలు తెరువు”, లేదా “కాల్ మోడ్”.',
    voice: 'వాయిస్',
    start: 'వాయిస్ నావిగేషన్ ప్రారంభించండి',
    stop: 'వాయిస్ నావిగేషన్ ఆపండి',
  },
  mr: {
    help: 'असे म्हणा: मुख्यपृष्ठ उघडा, संदेश उघडा किंवा कॉल मोड उघडा. सध्याचे पान जाणून घेण्यासाठी, मी कुठे आहे असे विचारा.',
    clarify: 'कोणते पान उघडायचे? मुख्यपृष्ठ, संदेश किंवा कॉल मोड म्हणा.',
    unavailable: 'गोपनीयता पुरावा पृष्ठ काढून टाकले आहे. मुख्यपृष्ठ, संदेश किंवा कॉल मोड उघडा.',
    unknown: 'मला समजले नाही. पानांची आज्ञा ऐकण्यासाठी मदत म्हणा.',
    ready: 'आवाजाद्वारे नेव्हिगेशन तयार आहे. पानांची आज्ञा ऐकण्यासाठी मदत म्हणा.',
    unsupported: 'या ब्राउझरमध्ये आवाजाद्वारे नेव्हिगेशन उपलब्ध नाही. Chrome किंवा Edge वापरा.',
    retry: 'आवाज ऐकणे थांबले. मायक्रोफोन दाबून पुन्हा प्रयत्न करा.',
    listening: 'ऐकत आहे. “संदेश उघडा” यांसारखी एक आज्ञा सांगा.',
    noSpeech: 'काही ऐकू आले नाही. मायक्रोफोन दाबून पुन्हा प्रयत्न करा.',
    permission: 'मायक्रोफोनची परवानगी बंद आहे. ब्राउझर सेटिंग्जमध्ये परवानगी द्या आणि पुन्हा प्रयत्न करा.',
    microphone: 'मायक्रोफोन सापडला नाही. मायक्रोफोन सुरू करून पुन्हा प्रयत्न करा.',
    network: 'ब्राउझरची आवाज सेवा उपलब्ध नाही. इंटरनेट तपासून पुन्हा प्रयत्न करा.',
    stopped: 'आवाज ऐकणे बंद आहे.',
    heard: 'तुम्ही म्हणालात',
    hint: 'मायक्रोफोन दाबा आणि म्हणा: “मुख्यपृष्ठ उघडा”, “संदेश उघडा” किंवा “कॉल मोड”.',
    voice: 'आवाज',
    start: 'आवाजाद्वारे नेव्हिगेशन सुरू करा',
    stop: 'आवाजाद्वारे नेव्हिगेशन थांबवा',
  },
};

const VIEW_LABELS: Record<NavigableView, Record<AppLanguage, string>> = {
  overview: { en: 'Home', hi: 'मुख्य पृष्ठ', hinglish: 'Home', te: 'హోమ్', mr: 'मुख्यपृष्ठ' },
  inbox: { en: 'Messages', hi: 'संदेश', hinglish: 'Messages', te: 'సందేశాలు', mr: 'संदेश' },
  call: { en: 'Call mode', hi: 'कॉल मोड', hinglish: 'Call mode', te: 'కాల్ మోడ్', mr: 'कॉल मोड' },
};

export function VoiceNavigation({
  language,
  activeView,
  onNavigate,
  onOpenCallConsent,
}: VoiceNavigationProps) {
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState('');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const recognitionActiveRef = useRef(false);
  const pendingCommandRef = useRef('');
  const recognitionFailedRef = useRef(false);
  const manualStopRef = useRef(false);
  const copy = VOICE_COPY[language];
  const pageName = VIEW_LABELS[activeView][language];

  const announce = (text: string) => {
    setStatus(text);
    speakExplanation(text, language);
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      stopSpeaking();
    };
  }, []);

  const getRecognition = (): SpeechRecognitionLike | null => {
    if (recognitionRef.current) return recognitionRef.current;
    const SpeechRecognitionCtor = (
      window as unknown as {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
      }
    ).SpeechRecognition ??
      (
        window as unknown as {
          webkitSpeechRecognition?: SpeechRecognitionConstructor;
        }
      ).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) return null;
    recognitionRef.current = new SpeechRecognitionCtor();
    return recognitionRef.current;
  };

  const runCommand = (command: string) => {
    const intent = parseVoiceNavigationCommand(command);
    if (intent.type === 'navigate') {
      if (intent.view === 'call') {
        onOpenCallConsent();
      } else {
        onNavigate(intent.view);
      }
      const labels: Record<NavigableView, Record<AppLanguage, string>> = {
        overview: {
          en: 'Opening Home.',
          hi: 'मुख्य पृष्ठ खोल रहा हूँ।',
          hinglish: 'Home khol raha hoon.',
          te: 'హోమ్ పేజీ తెరుస్తున్నాను.',
          mr: 'मुख्यपृष्ठ उघडत आहे.',
        },
        inbox: {
          en: 'Opening Messages.',
          hi: 'संदेश पृष्ठ खोल रहा हूँ।',
          hinglish: 'Messages khol raha hoon.',
          te: 'సందేశాలు తెరుస్తున్నాను.',
          mr: 'संदेश उघडत आहे.',
        },
        call: {
          en: 'Opening Call mode. Please allow microphone access if you want to check a live call.',
          hi: 'कॉल मोड खोल रहा हूँ। लाइव कॉल जाँचने के लिए माइक्रोफ़ोन की अनुमति दें।',
          hinglish: 'Call mode khol raha hoon. Live call check karne ke liye microphone allow karein.',
          te: 'కాల్ మోడ్ తెరుస్తున్నాను. లైవ్ కాల్ కోసం మైక్రోఫోన్ అనుమతించండి.',
          mr: 'कॉल मोड उघडत आहे. लाईव्ह कॉलसाठी मायक्रोफोनची परवानगी द्या.',
        },
      };
      announce(labels[intent.view][language]);
    } else if (intent.type === 'help') {
      announce(copy.help);
    } else if (intent.type === 'where') {
      announce(
        language === 'hi'
          ? `आप ${pageName} पृष्ठ पर हैं।`
          : language === 'te'
            ? `మీరు ${pageName} పేజీలో ఉన్నారు.`
            : language === 'mr'
              ? `तुम्ही ${pageName} पृष्ठावर आहात.`
              : language === 'hinglish'
                ? `Aap ${pageName} page par hain.`
                : `You are on ${pageName}.`
      );
    } else if (intent.type === 'stop') {
      setStatus(copy.stopped);
    } else if (intent.type === 'clarify') {
      announce(copy.clarify);
    } else if (intent.type === 'unavailable') {
      announce(copy.unavailable);
    } else {
      announce(copy.unknown);
    }
  };

  const startListening = () => {
    if (recognitionActiveRef.current) return;
    const recognition = getRecognition();
    if (!recognition) {
      announce(copy.unsupported);
      return;
    }

    stopSpeaking();
    pendingCommandRef.current = '';
    recognitionFailedRef.current = false;
    manualStopRef.current = false;
    recognition.lang = LOCALE[language];
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const result = event.results[0]?.[0]?.transcript;
      if (result) {
        pendingCommandRef.current = result;
        setStatus(`${copy.heard}: ${result}`);
        recognition.stop();
      }
    };
    recognition.onerror = (event) => {
      setListening(false);
      recognitionFailedRef.current = true;
      if (event.error === 'aborted') {
        if (!manualStopRef.current && !pendingCommandRef.current) {
          setStatus(copy.retry);
        }
      } else {
        const message =
          event.error === 'no-speech'
            ? copy.noSpeech
            : event.error === 'not-allowed' || event.error === 'service-not-allowed'
              ? copy.permission
              : event.error === 'audio-capture'
                ? copy.microphone
                : event.error === 'network'
                  ? copy.network
                  : copy.retry;
        setStatus(message);
      }
    };
    recognition.onend = () => {
      recognitionActiveRef.current = false;
      setListening(false);
      const command = pendingCommandRef.current;
      pendingCommandRef.current = '';
      if (command) {
        runCommand(command);
      } else if (!recognitionFailedRef.current && !manualStopRef.current) {
        setStatus(copy.noSpeech);
      }
      recognitionFailedRef.current = false;
      manualStopRef.current = false;
    };

    try {
      recognitionActiveRef.current = true;
      recognition.start();
      setListening(true);
      setStatus(copy.listening);
    } catch {
      recognitionActiveRef.current = false;
      setListening(false);
      setStatus(copy.retry);
    }
  };

  const toggleListening = () => {
    if (listening || recognitionActiveRef.current) {
      manualStopRef.current = true;
      pendingCommandRef.current = '';
      recognitionRef.current?.stop();
      setListening(false);
      setStatus(copy.stopped);
      return;
    }
    startListening();
  };

  return (
    <div className="fixed bottom-4 right-4 z-[90] flex flex-col items-end gap-2">
      {status && (
        <button
          type="button"
          onClick={() => announce(status)}
          disabled={listening}
          aria-live="polite"
          className="max-w-[260px] rounded-xl border border-blue-200 bg-white px-3 py-2 text-right text-xs font-medium text-slate-700 shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <span className="flex items-center gap-1.5">
            <Volume2 className="h-3.5 w-3.5 shrink-0" />
            <span>{status}</span>
          </span>
        </button>
      )}
      <p className="max-w-[260px] rounded-lg bg-white/95 px-3 py-2 text-right text-xs font-semibold text-slate-700 shadow-md dark:bg-slate-900/95 dark:text-slate-200">
        {copy.hint}
      </p>
      <button
        type="button"
        onClick={toggleListening}
        aria-label={listening ? copy.stop : copy.start}
        aria-pressed={listening}
        className={`inline-flex min-h-14 items-center justify-center gap-2 rounded-full border-4 border-white px-4 shadow-xl transition-all dark:border-slate-900 ${
          listening
            ? 'animate-pulse bg-red-600 text-white'
            : 'bg-blue-700 text-white hover:bg-blue-800'
        }`}
      >
        {listening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        <span className="text-sm font-bold">{copy.voice}</span>
      </button>
    </div>
  );
}
