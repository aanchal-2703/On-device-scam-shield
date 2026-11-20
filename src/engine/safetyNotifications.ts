import type { AppLanguage } from '../i18n';

export const SAFETY_REMINDER_INTERVAL_MS = 2 * 60 * 60 * 1000;

const SETTINGS_KEY = 'scamshield-safety-notifications';
const PERIODIC_SYNC_TAG = 'scamshield-safety-reminder';
const REMINDER_TAG = 'scamshield-two-hour-safety-tip';

export interface SafetyNotificationSettings {
  enabled: boolean;
  language: AppLanguage;
  lastReminderAt: number;
  nextTip: number;
  background: boolean;
}

interface PeriodicSyncManagerLike {
  register: (tag: string, options: { minInterval: number }) => Promise<void>;
  unregister: (tag: string) => Promise<void>;
}

interface RegistrationWithPeriodicSync extends ServiceWorkerRegistration {
  periodicSync?: PeriodicSyncManagerLike;
}

const SAFETY_TIPS: Record<AppLanguage, string[]> = {
  en: [
    'Pause before paying. Never share an OTP or PIN.',
    'A real bank will not ask you to share an OTP or install a remote-access app.',
    'If someone rushes or threatens you, hang up and verify using an official number.',
    'Do not pay a fee to claim an unexpected prize.',
    'If you lose money to a scam, call India’s cyber helpline 1930 quickly.',
  ],
  hi: [
    'पैसे भेजने से पहले रुकें। OTP या PIN किसी को न बताएं।',
    'बैंक आपसे OTP बताने या रिमोट एक्सेस ऐप लगाने को नहीं कहेगा।',
    'कोई डराए या जल्दी कराए तो फोन काटें और आधिकारिक नंबर से जाँचें।',
    'अचानक मिले इनाम के लिए पैसे न दें।',
    'ठगी में पैसे चले जाएँ तो भारत में तुरंत 1930 पर कॉल करें।',
  ],
  hinglish: [
    'Paise bhejne se pehle rukein. OTP ya PIN kisi ko na batayein.',
    'Bank aapse OTP batane ya remote-access app install karne ko nahi kahega.',
    'Koi daraaye ya jaldi kare to call kaat kar official number se check karein.',
    'Achanak mile prize ke liye paise na dein.',
    'Scam mein paise chale gaye hon to India mein jaldi 1930 par call karein.',
  ],
  te: [
    'డబ్బు పంపే ముందు ఆగండి. OTP లేదా PIN ఎవరికీ చెప్పకండి.',
    'బ్యాంక్ మీ OTP అడగదు లేదా రిమోట్ యాక్సెస్ యాప్ ఇన్‌స్టాల్ చేయమని చెప్పదు.',
    'ఎవరైనా బెదిరిస్తే లేదా తొందరపెడితే కాల్ కట్ చేసి అధికారిక నంబర్‌తో తనిఖీ చేయండి.',
    'అనుకోని బహుమతి కోసం డబ్బు చెల్లించకండి.',
    'మోసంలో డబ్బు పోతే భారతదేశంలో వెంటనే 1930కు కాల్ చేయండి.',
  ],
  mr: [
    'पैसे पाठवण्यापूर्वी थांबा. OTP किंवा PIN कोणालाही सांगू नका.',
    'बँक तुमचा OTP मागणार नाही किंवा रिमोट-अॅक्सेस अॅप बसवायला सांगणार नाही.',
    'कोणी धमकावत असेल किंवा घाई करत असेल तर फोन ठेवा आणि अधिकृत नंबरवर तपासा.',
    'अनपेक्षित बक्षिसासाठी पैसे भरू नका.',
    'फसवणुकीत पैसे गेले असतील तर भारतात त्वरित १९३० वर कॉल करा.',
  ],
};

function isAppLanguage(value: unknown): value is AppLanguage {
  return value === 'en' || value === 'hi' || value === 'hinglish' || value === 'te' || value === 'mr';
}

export function getSafetyNotificationSettings(): SafetyNotificationSettings | null {
  const serialized = localStorage.getItem(SETTINGS_KEY);
  if (!serialized) return null;

  const value: unknown = JSON.parse(serialized);
  if (!value || typeof value !== 'object') return null;
  const settings = value as Partial<SafetyNotificationSettings>;
  if (
    typeof settings.enabled !== 'boolean' ||
    !isAppLanguage(settings.language) ||
    typeof settings.lastReminderAt !== 'number' ||
    typeof settings.nextTip !== 'number'
  ) {
    return null;
  }
  return {
    enabled: settings.enabled,
    language: settings.language,
    lastReminderAt: settings.lastReminderAt,
    nextTip: settings.nextTip,
    background: settings.background === true,
  };
}

function saveSettings(settings: SafetyNotificationSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

async function getActiveReminderWorker(): Promise<{
  registration: RegistrationWithPeriodicSync;
  worker: ServiceWorker;
} | null> {
  if (!('serviceWorker' in navigator)) return null;
  const registration = (await navigator.serviceWorker.register(
    '/notifications/reminder-sw.js',
    { scope: '/notifications/' }
  )) as RegistrationWithPeriodicSync;

  if (registration.active) return { registration, worker: registration.active };
  const installingWorker = registration.installing ?? registration.waiting;
  if (!installingWorker) {
    throw new Error('The reminder service worker did not start.');
  }

  await new Promise<void>((resolve, reject) => {
    const handleStateChange = () => {
      if (installingWorker.state === 'activated') {
        installingWorker.removeEventListener('statechange', handleStateChange);
        resolve();
      } else if (installingWorker.state === 'redundant') {
        installingWorker.removeEventListener('statechange', handleStateChange);
        reject(new Error('The reminder service worker could not be activated.'));
      }
    };
    installingWorker.addEventListener('statechange', handleStateChange);
    handleStateChange();
  });

  const activeWorker = registration.active;
  if (!activeWorker) {
    throw new Error('The reminder service worker is not active.');
  }
  return { registration, worker: activeWorker };
}

export async function enableSafetyNotifications(
  language: AppLanguage
): Promise<{ settings: SafetyNotificationSettings; message: string }> {
  if (!('Notification' in window)) {
    throw new Error('This browser does not support notifications.');
  }

  let permission = Notification.permission;
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }
  if (permission !== 'granted') {
    throw new Error('Notification permission was not granted. Enable it in browser settings to receive alerts.');
  }

  const previous = getSafetyNotificationSettings();
  const settings: SafetyNotificationSettings = {
    enabled: true,
    language,
    lastReminderAt: previous?.enabled ? previous.lastReminderAt : Date.now(),
    nextTip: previous?.nextTip ?? 0,
    background: false,
  };

  let message = 'Safety reminders will appear every 2 hours while ScamShield is open.';
  try {
    const worker = await getActiveReminderWorker();
    if (worker) {
      worker.worker.postMessage({ type: 'configure', settings });
      if (worker.registration.periodicSync) {
        try {
          await worker.registration.periodicSync.register(PERIODIC_SYNC_TAG, {
            minInterval: SAFETY_REMINDER_INTERVAL_MS,
          });
          settings.background = true;
          message = 'Two-hour reminders are enabled. Background delivery depends on browser scheduling.';
        } catch (error) {
          const reason = error instanceof Error ? error.message : 'background scheduling is unavailable';
          message = `Background reminders are unavailable (${reason}). Reminders will appear while ScamShield is open.`;
        }
      } else {
        message = 'This browser cannot schedule closed-app reminders. Two-hour reminders will appear while ScamShield is open.';
      }
      worker.worker.postMessage({ type: 'configure', settings });
    } else {
      message = 'Background reminders are not supported here. Alerts will appear while ScamShield is open.';
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'service worker setup failed';
    message = `Background reminders could not be set up (${reason}). Alerts will appear while ScamShield is open.`;
  }

  saveSettings(settings);
  return { settings, message };
}

export async function disableSafetyNotifications(): Promise<void> {
  const current = getSafetyNotificationSettings();
  if (!current) return;
  const settings = { ...current, enabled: false };
  saveSettings(settings);
  if ('serviceWorker' in navigator) {
    const registration = (await navigator.serviceWorker.getRegistration(
      '/notifications/'
    )) as RegistrationWithPeriodicSync | undefined;
    if (registration) {
      if (registration.periodicSync) {
        await registration.periodicSync.unregister(PERIODIC_SYNC_TAG);
      }
      const worker = registration.active ?? registration.waiting ?? registration.installing;
      worker?.postMessage({ type: 'disable', settings });
    }
  }
}

export async function sendDueSafetyReminder(): Promise<boolean> {
  const settings = getSafetyNotificationSettings();
  if (!settings?.enabled || !('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }
  if (Date.now() - settings.lastReminderAt < SAFETY_REMINDER_INTERVAL_MS) return false;

  const tips = SAFETY_TIPS[settings.language];
  const tipIndex = settings.nextTip % tips.length;
  const worker = await getActiveReminderWorker();
  if (worker) {
    await worker.registration.showNotification('ScamShield safety reminder', {
      body: tips[tipIndex],
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: REMINDER_TAG,
      data: { url: '/' },
    });
    const updated = {
      ...settings,
      lastReminderAt: Date.now(),
      nextTip: tipIndex + 1,
    };
    saveSettings(updated);
    worker.worker.postMessage({ type: 'configure', settings: updated });
    return true;
  }

  new Notification('ScamShield safety reminder', {
    body: tips[tipIndex],
    tag: REMINDER_TAG,
  });
  saveSettings({ ...settings, lastReminderAt: Date.now(), nextTip: tipIndex + 1 });
  return true;
}

export async function notifyHighRiskIncident(conversationId: string): Promise<void> {
  const settings = getSafetyNotificationSettings();
  if (
    !settings?.enabled ||
    !('Notification' in window) ||
    Notification.permission !== 'granted'
  ) {
    return;
  }

  const worker = await getActiveReminderWorker();
  const options: NotificationOptions = {
    body: 'ScamShield detected a high-risk message or call. Open the app and check it now.',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: `scamshield-high-risk-${conversationId}`,
    data: { url: '/' },
  };
  if (worker) {
    await worker.registration.showNotification('Possible scam detected', options);
  } else {
    new Notification('Possible scam detected', options);
  }
}
