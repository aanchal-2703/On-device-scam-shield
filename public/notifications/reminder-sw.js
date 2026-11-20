const DB_NAME = 'scamshield-notifications';
const STORE_NAME = 'settings';
const SETTINGS_KEY = 'reminders';
const REMINDER_TAG = 'scamshield-two-hour-safety-tip';
const REMINDER_INTERVAL_MS = 2 * 60 * 60 * 1000;

const TIPS = {
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

function openSettingsDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open reminder settings'));
  });
}

async function readSettings() {
  const db = await openSettingsDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(SETTINGS_KEY);
    request.onsuccess = () => {
      db.close();
      resolve(request.result || null);
    };
    request.onerror = () => {
      db.close();
      reject(request.error || new Error('Could not read reminder settings'));
    };
  });
}

async function writeSettings(settings) {
  const db = await openSettingsDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(settings, SETTINGS_KEY);
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error || new Error('Could not save reminder settings'));
    };
  });
}

async function showSafetyTip() {
  const settings = await readSettings();
  if (!settings || !settings.enabled) return;

  const now = Date.now();
  if (now - settings.lastReminderAt < REMINDER_INTERVAL_MS) return;

  const language = TIPS[settings.language] ? settings.language : 'en';
  const tips = TIPS[language];
  const tipIndex = settings.nextTip % tips.length;
  await self.registration.showNotification('ScamShield safety reminder', {
    body: tips[tipIndex],
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: REMINDER_TAG,
    renotify: false,
    data: { url: '/' },
  });
  await writeSettings({ ...settings, lastReminderAt: now, nextTip: tipIndex + 1 });
}

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  const message = event.data;
  if (!message || (message.type !== 'configure' && message.type !== 'disable')) return;
  event.waitUntil(writeSettings(message.settings));
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'scamshield-safety-reminder') {
    event.waitUntil(showSafetyTip());
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((client) => 'focus' in client);
      if (existing) return existing.focus();
      return self.clients.openWindow('/');
    })
  );
});
