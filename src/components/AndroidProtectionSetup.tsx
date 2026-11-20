import { useEffect, useState } from 'react';
import { CheckCircle2, ExternalLink, Shield, X } from 'lucide-react';
import type { AppLanguage } from '../i18n';
import {
  getNativeProtectionStatus,
  isNativeAndroid,
  openNativeNotificationAccessSettings,
  openNativeScreenAccessSettings,
  type NativeProtectionStatus,
} from '../engine/nativeIntegration';

interface AndroidProtectionSetupProps {
  language: AppLanguage;
}

const COPY: Record<
  AppLanguage,
  {
    button: string;
    title: string;
    intro: string;
    notifications: string;
    visibleText: string;
    enabled: string;
    notEnabled: string;
    openSettings: string;
    privacy: string;
    calls: string;
    close: string;
    error: string;
  }
> = {
  en: {
    button: 'Protect apps',
    title: 'Check messages in other apps',
    intro: 'Turn on only the access you want. When ScamShield is open, it checks new content with the same on-device detector.',
    notifications: 'Message notifications',
    visibleText: 'Visible text (Accessibility)',
    enabled: 'Enabled',
    notEnabled: 'Not enabled',
    openSettings: 'Open Android settings',
    privacy: 'Captured text is checked on this device, kept only in temporary app memory, and cleared by Wipe session.',
    calls: 'Calls: Android does not provide other apps with cellular call audio. Use speakerphone with ScamShield Call Mode on another nearby device.',
    close: 'Close',
    error: 'Could not open Android settings. Please open Settings and enable access for ScamShield.',
  },
  hi: {
    button: 'ऐप सुरक्षित करें',
    title: 'दूसरे ऐप के संदेश जाँचें',
    intro: 'सिर्फ़ वही अनुमति चालू करें जो आप चाहते हैं। ScamShield खुला होने पर नए संदेश इसी फ़ोन पर जाँचे जाते हैं।',
    notifications: 'संदेश नोटिफ़िकेशन',
    visibleText: 'स्क्रीन पर दिखने वाला टेक्स्ट (Accessibility)',
    enabled: 'चालू',
    notEnabled: 'चालू नहीं',
    openSettings: 'Android सेटिंग खोलें',
    privacy: 'टेक्स्ट इसी फ़ोन पर जाँचा जाता है, अस्थायी मेमोरी में रहता है और सत्र मिटाने पर हट जाता है।',
    calls: 'कॉल: Android दूसरे ऐप को मोबाइल कॉल का अंदरूनी ऑडियो नहीं देता। स्पीकरफ़ोन पर कॉल करके दूसरे पास के फ़ोन पर ScamShield Call Mode चलाएँ।',
    close: 'बंद करें',
    error: 'Android सेटिंग नहीं खुली। सेटिंग में जाकर ScamShield को अनुमति दें।',
  },
  hinglish: {
    button: 'Apps protect karein',
    title: 'Doosre apps ke messages check karein',
    intro: 'Sirf wahi access on karein jo aap chahte hain. ScamShield khula ho tab naye messages isi device par check hote hain.',
    notifications: 'Message notifications',
    visibleText: 'Screen par dikhne wala text (Accessibility)',
    enabled: 'On hai',
    notEnabled: 'On nahi hai',
    openSettings: 'Android Settings kholein',
    privacy: 'Text isi device par check hota hai, temporary memory mein rehta hai, aur Wipe session se clear hota hai.',
    calls: 'Calls: Android doosre apps ko cellular call ka internal audio nahi deta. Speakerphone aur paas ke doosre device par ScamShield Call Mode use karein.',
    close: 'Band karein',
    error: 'Android Settings nahi khuli. Settings mein jaakar ScamShield ko access dein.',
  },
  te: {
    button: 'యాప్‌లను రక్షించండి',
    title: 'ఇతర యాప్‌ల సందేశాలను తనిఖీ చేయండి',
    intro: 'మీకు కావలసిన అనుమతులనే ఆన్ చేయండి. ScamShield తెరిచి ఉన్నప్పుడు కొత్త సందేశాలు ఈ పరికరంలోనే తనిఖీ అవుతాయి.',
    notifications: 'సందేశ నోటిఫికేషన్‌లు',
    visibleText: 'స్క్రీన్‌పై కనిపించే టెక్స్ట్ (Accessibility)',
    enabled: 'ఆన్‌లో ఉంది',
    notEnabled: 'ఆన్‌లో లేదు',
    openSettings: 'Android సెట్టింగ్‌లు తెరవండి',
    privacy: 'టెక్స్ట్ ఈ పరికరంలోనే తనిఖీ చేయబడుతుంది, తాత్కాలిక మెమరీలో ఉంటుంది, సెషన్ తొలగిస్తే క్లియర్ అవుతుంది.',
    calls: 'కాల్‌లు: ఇతర యాప్‌లకు సెల్యులార్ కాల్ ఆడియోను Android ఇవ్వదు. స్పీకర్‌ఫోన్‌తో సమీపంలోని మరో పరికరంలో ScamShield Call Mode ఉపయోగించండి.',
    close: 'మూసివేయండి',
    error: 'Android సెట్టింగ్‌లు తెరవలేదు. సెట్టింగ్‌లలో ScamShield అనుమతిని ఆన్ చేయండి.',
  },
  mr: {
    button: 'अॅप्स सुरक्षित करा',
    title: 'इतर अॅपमधील संदेश तपासा',
    intro: 'तुम्हाला हव्या त्या परवानग्याच सुरू करा. ScamShield उघडे असताना नवीन संदेश याच डिव्हाइसवर तपासले जातात.',
    notifications: 'संदेश सूचना',
    visibleText: 'स्क्रीनवर दिसणारा मजकूर (Accessibility)',
    enabled: 'सुरू आहे',
    notEnabled: 'सुरू नाही',
    openSettings: 'Android सेटिंग्ज उघडा',
    privacy: 'मजकूर याच डिव्हाइसवर तपासला जातो, तात्पुरत्या मेमरीत राहतो आणि सत्र पुसल्यावर हटतो.',
    calls: 'कॉल: Android इतर अॅपना मोबाइल कॉलचा अंतर्गत ऑडिओ देत नाही. स्पीकरफोन आणि जवळच्या दुसऱ्या डिव्हाइसवर ScamShield Call Mode वापरा.',
    close: 'बंद करा',
    error: 'Android सेटिंग्ज उघडता आल्या नाहीत. सेटिंग्जमध्ये ScamShield ला परवानगी द्या.',
  },
};

const EMPTY_STATUS: NativeProtectionStatus = {
  notificationAccess: false,
  screenAccess: false,
};

export function AndroidProtectionSetup({ language }: AndroidProtectionSetupProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(EMPTY_STATUS);
  const [error, setError] = useState('');
  const copy = COPY[language];

  useEffect(() => {
    if (!isNativeAndroid || !open) return;
    let active = true;
    const refresh = () => {
      void getNativeProtectionStatus()
        .then((nextStatus) => {
          if (active) setStatus(nextStatus);
        })
        .catch(() => {
          if (active) setError(copy.error);
        });
    };
    refresh();
    window.addEventListener('focus', refresh);
    window.addEventListener('visibilitychange', refresh);
    return () => {
      active = false;
      window.removeEventListener('focus', refresh);
      window.removeEventListener('visibilitychange', refresh);
    };
  }, [copy.error, open]);

  useEffect(() => {
    const showNativeError = (event: Event) => {
      const detail = (event as CustomEvent<unknown>).detail;
      setError(typeof detail === 'string' ? detail : copy.error);
    };
    window.addEventListener('scamshield-native-error', showNativeError);
    return () => window.removeEventListener('scamshield-native-error', showNativeError);
  }, [copy.error]);

  if (!isNativeAndroid) return null;

  const openSettings = async (target: 'notifications' | 'screen') => {
    setError('');
    try {
      if (target === 'notifications') {
        await openNativeNotificationAccessSettings();
      } else {
        await openNativeScreenAccessSettings();
      }
    } catch {
      setError(copy.error);
    }
  };

  return (
    <div className="fixed bottom-20 left-3 z-40">
      {open && (
        <section
          aria-labelledby="android-protection-title"
          className="mb-3 w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          role="dialog"
          aria-modal="false"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="android-protection-title" className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {copy.title}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {copy.intro}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={copy.close}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {([
              ['notifications', copy.notifications, status.notificationAccess],
              ['screen', copy.visibleText, status.screenAccess],
            ] as const).map(([target, label, enabled]) => (
              <div
                key={target}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2.5 dark:border-slate-700"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{label}</p>
                  <p className={`mt-0.5 text-[11px] font-medium ${enabled ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {enabled ? copy.enabled : copy.notEnabled}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void openSettings(target)}
                  className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-lg bg-blue-700 px-3 text-[11px] font-bold text-white hover:bg-blue-800"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {copy.openSettings}
                </button>
              </div>
            ))}
          </div>

          <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
            {copy.privacy}
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
            {copy.calls}
          </p>
          {error && <p role="alert" className="mt-2 text-xs font-medium text-red-700 dark:text-red-300">{error}</p>}
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={copy.button}
        className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-white bg-slate-900 px-4 text-sm font-bold text-white shadow-xl dark:border-slate-950 dark:bg-blue-700"
      >
        <Shield className="h-5 w-5" />
        <span>{copy.button}</span>
      </button>
    </div>
  );
}
