export type TacticId =
  | 'authority'
  | 'urgency'
  | 'fear'
  | 'isolation'
  | 'reward'
  | 'payment'
  | 'remote_access';

export type SequenceStage = 'authority' | 'urgency' | 'fear' | 'isolation' | 'payment';

export const SEQUENCE_ORDER: readonly SequenceStage[] = [
  'authority',
  'urgency',
  'fear',
  'isolation',
  'payment',
] as const;

export interface TacticMeta {
  id: TacticId;
  label: string;
  shortLabel: string;
  severity: 'caution' | 'danger';
  weight: number;
  reason: string;
}

export const TACTIC_META: Record<TacticId, TacticMeta> = {
  authority: {
    id: 'authority',
    label: 'Authority Impersonation',
    shortLabel: 'Authority',
    severity: 'caution',
    weight: 16,
    reason: 'Authority: claims to be your bank, police, or a government agency to establish instant trust.',
  },
  urgency: {
    id: 'urgency',
    label: 'Urgency Pressure',
    shortLabel: 'Urgency',
    severity: 'caution',
    weight: 16,
    reason: 'Urgency: pressures you with a tight deadline so you act before verifying.',
  },
  fear: {
    id: 'fear',
    label: 'Fear & Threat',
    shortLabel: 'Fear',
    severity: 'danger',
    weight: 20,
    reason: 'Fear / Threat: threatens account freeze, arrest, or legal penalties to trigger panic.',
  },
  isolation: {
    id: 'isolation',
    label: 'Isolation & Secrecy',
    shortLabel: 'Isolation',
    severity: 'danger',
    weight: 22,
    reason: 'Isolation: tells you not to hang up or talk to family so nobody can warn you.',
  },
  reward: {
    id: 'reward',
    label: 'Reward / Lottery Lure',
    shortLabel: 'Reward',
    severity: 'caution',
    weight: 15,
    reason: 'Reward / Lottery: dangles an unexpected prize or cash bonus to lower your guard.',
  },
  payment: {
    id: 'payment',
    label: 'Payment or Credential Ask',
    shortLabel: 'Payment / OTP',
    severity: 'danger',
    weight: 24,
    reason: 'Payment / Credential Ask: asks for your OTP, PIN, KYC verification, or money transfer.',
  },
  remote_access: {
    id: 'remote_access',
    label: 'Remote-Access Takeover',
    shortLabel: 'Remote Access',
    severity: 'danger',
    weight: 26,
    reason: 'Remote Access: asks you to install screen-sharing or APK apps that give attackers full device control.',
  },
};

export interface PrototypeEntry {
  tactic: TacticId;
  text: string;
  lang: 'en' | 'hi' | 'te' | 'mr' | 'hinglish';
}

export const TACTIC_PROTOTYPES: PrototypeEntry[] = [
  // Authority (English, Hindi, Telugu, Marathi, Hinglish)
  { tactic: 'authority', lang: 'en', text: 'I am calling from the bank fraud prevention department regarding your account.' },
  { tactic: 'authority', lang: 'en', text: 'This is Inspector Sharma from Mumbai Cyber Crime Cell and CBI supervision.' },
  { tactic: 'authority', lang: 'en', text: 'Notice from TRAI Telecom Regulatory Authority regarding your Aadhaar SIM.' },
  { tactic: 'authority', lang: 'en', text: 'Speaking from the regional electricity board billing desk regarding your home meter.' },
  { tactic: 'authority', lang: 'en', text: 'This is the treasury compliance officer calling about your pending pension and tax file.' },
  { tactic: 'authority', lang: 'hi', text: 'मैं मुंबई साइबर क्राइम पुलिस और सीबीआई विभाग से अधिकारी बोल रहा हूँ।' },
  { tactic: 'authority', lang: 'hi', text: 'मैं बिजली विभाग और टैक्स ऑफिस से वरिष्ठ अधिकारी बात कर रहा हूँ।' },
  { tactic: 'authority', lang: 'te', text: 'నేను సైబర్ క్రైమ్ పోలీస్ మరియు బ్యాంక్ అధికారిని మాట్లాడుతున్నాను.' },
  { tactic: 'authority', lang: 'mr', text: 'मी मुंबई सायबर क्राईम पोलीस आणि बँक अधिकारी बोलत आहे.' },
  { tactic: 'authority', lang: 'hinglish', text: 'Main HDFC bank fraud department se senior officer Rahul bol raha hoon.' },

  // Urgency
  { tactic: 'urgency', lang: 'en', text: 'You must complete verification within 2 hours or action will be taken immediately.' },
  { tactic: 'urgency', lang: 'en', text: 'Offer expires in 30 minutes, act right now without delay.' },
  { tactic: 'urgency', lang: 'en', text: 'Final warning: update your KYC today before 6 PM.' },
  { tactic: 'urgency', lang: 'en', text: 'Handle this settlement before tonight otherwise the deadline closes automatically.' },
  { tactic: 'urgency', lang: 'en', text: 'Please respond straightaway within the next few minutes before our desk closes.' },
  { tactic: 'urgency', lang: 'hi', text: 'यह काम अभी तुरंत दो घंटे के अंदर करना होगा, वरना समय समाप्त हो जाएगा।' },
  { tactic: 'urgency', lang: 'hi', text: 'आज रात से पहले इसे पूरा करें वरना समय सीमा खत्म हो जाएगी।' },
  { tactic: 'urgency', lang: 'te', text: 'వెంటనే ఈ రోజే రెండు గంటల్లోపు పూర్తి చేయండి, లేకపోతే గడువు ముగుస్తుంది.' },
  { tactic: 'urgency', lang: 'mr', text: 'तात्काळ आजच्या आज दोन तासांत पूर्ण करा, वेळ निघून जात आहे.' },
  { tactic: 'urgency', lang: 'hinglish', text: 'Abhi turant jaldi verify kijiye aaj hi last warning hai.' },

  // Fear / Threat
  { tactic: 'fear', lang: 'en', text: 'Your bank account will be blocked and all funds frozen permanently.' },
  { tactic: 'fear', lang: 'en', text: 'You are under digital arrest and an arrest warrant has been issued in your name.' },
  { tactic: 'fear', lang: 'en', text: 'An illegal parcel with your Aadhaar was seized by customs for money laundering.' },
  { tactic: 'fear', lang: 'en', text: 'Your home power supply will be disconnected tonight due to unpaid arrears.' },
  { tactic: 'fear', lang: 'en', text: 'Your family member is in hospital trouble and needs immediate bail clearance.' },
  { tactic: 'fear', lang: 'hi', text: 'आपका बैंक खाता बंद कर दिया जाएगा और आपके खिलाफ गिरफ्तारी वारंट जारी होगा।' },
  { tactic: 'fear', lang: 'hi', text: 'आज रात आपके घर की बिजली काट दी जाएगी और भारी जुर्माना लगेगा।' },
  { tactic: 'fear', lang: 'te', text: 'మీ బ్యాంక్ ఖాతా బ్లాక్ అవుతుంది మరియు మీపై అరెస్ట్ వారెంట్ జారీ చేస్తారు.' },
  { tactic: 'fear', lang: 'mr', text: 'तुमचे बँक खाते बंद केले जाईल आणि तुमच्याविरुद्ध अटक वॉरंट निघेल.' },
  { tactic: 'fear', lang: 'hinglish', text: 'Aapka card block ho jayega aur account se saare paise kat jayenge.' },

  // Isolation
  { tactic: 'isolation', lang: 'en', text: 'Do not tell anyone or inform your family members about this investigation.' },
  { tactic: 'isolation', lang: 'en', text: 'Do not disconnect the call and keep this matter strictly confidential.' },
  { tactic: 'isolation', lang: 'en', text: 'Keep your prize claim secret from others until verification finishes.' },
  { tactic: 'isolation', lang: 'en', text: 'Keep this private and do not mention it to your spouse, boss, or relatives.' },
  { tactic: 'isolation', lang: 'en', text: 'Please handle this quietly alone without discussing it with friends.' },
  { tactic: 'isolation', lang: 'hi', text: 'यह गोपनीय जांच है, परिवार या किसी को मत बताना और कॉल मत काटना।' },
  { tactic: 'isolation', lang: 'te', text: 'ఈ విషయం ఎవరికీ చెప్పకండి, కుటుంబ సభ్యులకు తెలియజేయకండి, కాల్ కట్ చేయకండి.' },
  { tactic: 'isolation', lang: 'mr', text: 'ही गोष्ट कोणालाही सांगू नका, घरच्यांना सांगू नका आणि कॉल कट करू नका.' },
  { tactic: 'isolation', lang: 'hinglish', text: 'Kisi ko call pe mat batayein aur family ko bilkul mat batana.' },

  // Reward / Lottery
  { tactic: 'reward', lang: 'en', text: 'Congratulations! Your mobile number won 25 lakh rupees in the lucky draw.' },
  { tactic: 'reward', lang: 'en', text: 'You have been selected as the official jackpot winner, claim your cash prize.' },
  { tactic: 'reward', lang: 'en', text: 'Special cashback reward credited to your wallet, claim bonus now.' },
  { tactic: 'reward', lang: 'en', text: 'Earn 5000 daily from home by rating travel listings and hotel tasks.' },
  { tactic: 'reward', lang: 'en', text: 'Guaranteed VIP trading returns and daily profit payout when you join our group.' },
  { tactic: 'reward', lang: 'hi', text: 'बधाई हो! आपके नंबर ने पच्चीस लाख रुपये की लॉटरी और इनाम जीता है।' },
  { tactic: 'reward', lang: 'hi', text: 'घर बैठे रोज़ तीन हजार रुपये कमाएं आसान टास्क और रेटिंग पूरे करके।' },
  { tactic: 'reward', lang: 'te', text: 'అభినందనలు! మీరు లక్కీ డ్రాలో 25 లక్షల రూపాయల బహుమతి గెలుచుకున్నారు.' },
  { tactic: 'reward', lang: 'mr', text: 'अभिनंदन! तुम्ही लकी ड्रॉमध्ये २५ लाख रुपयांची लॉटरी आणि बक्षीस जिंकले आहे.' },
  { tactic: 'reward', lang: 'hinglish', text: 'Congratulations aap KBC lucky draw mein 25 lakh rupaye jeet gaye hain.' },

  // Payment / Credential Request
  { tactic: 'payment', lang: 'en', text: 'Please read out the 6-digit OTP sent to your mobile phone to verify.' },
  { tactic: 'payment', lang: 'en', text: 'Transfer the verification deposit to our escrow UPI ID right away.' },
  { tactic: 'payment', lang: 'en', text: 'Click the KYC link and enter your PAN, Aadhaar, and debit card CVV details.' },
  { tactic: 'payment', lang: 'en', text: 'Send a small refundable security deposit or starter fee to unlock your payout.' },
  { tactic: 'payment', lang: 'en', text: 'Share the confirmation digits you received or pay the pending clearance charge.' },
  { tactic: 'payment', lang: 'hi', text: 'सत्यापन के लिए अपने फोन पर आया छह अंकों का ओटीपी बताएं और पैसे भेजें।' },
  { tactic: 'payment', lang: 'hi', text: 'पैसे निकालने से पहले छोटा सुरक्षा शुल्क और अपनी बैंक जानकारी जमा करें।' },
  { tactic: 'payment', lang: 'te', text: 'ధృవీకరణ కోసం మీ ఫోన్‌కు వచ్చిన ఓటీపీ చెప్పండి మరియు యూపీఐ ద్వారా డబ్బు పంపండి.' },
  { tactic: 'payment', lang: 'mr', text: 'पडताळणीसाठी तुमच्या फोनवर आलेला ६ अंकी ओटीपी सांगा आणि पैसे पाठवा.' },
  { tactic: 'payment', lang: 'hinglish', text: 'Phone pe jo 6-digit OTP aaya hai woh jaldi bataiye ya UPI pe transfer kijiye.' },

  // Remote Access
  { tactic: 'remote_access', lang: 'en', text: 'Install AnyDesk or TeamViewer QuickSupport app so our technician can fix it.' },
  { tactic: 'remote_access', lang: 'en', text: 'Share your phone screen and download this APK file to complete verification.' },
  { tactic: 'remote_access', lang: 'en', text: 'Give remote access code to our support executive to cancel the transaction.' },
  { tactic: 'remote_access', lang: 'en', text: 'Let our support agent view your display remotely to process the refund.' },
  { tactic: 'remote_access', lang: 'hi', text: 'अपने फोन में एनीडेस्क ऐप डाउनलोड करें और अपनी स्क्रीन शेयर करें।' },
  { tactic: 'remote_access', lang: 'te', text: 'మీ ఫోన్‌లో ఎనీడెస్క్ యాప్ ఇన్‌స్టాల్ చేసి స్క్రీన్ షేర్ చేయండి.' },
  { tactic: 'remote_access', lang: 'mr', text: 'तुमच्या फोनवर एनीडेस्क अ‍ॅप इन्स्टॉल करा आणि स्क्रीन शेअर करा.' },
  { tactic: 'remote_access', lang: 'hinglish', text: 'Play Store se AnyDesk ya QuickSupport app install kijiye aur screen share karein.' },
];
