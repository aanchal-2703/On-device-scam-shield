import type { SequenceStage, TacticId } from './engine/prototypes';

export type AppLanguage = 'en' | 'hi' | 'hinglish' | 'te' | 'mr';

export const LANGUAGE_OPTIONS: { id: AppLanguage; nativeLabel: string; shortLabel: string }[] = [
  { id: 'en', nativeLabel: 'English', shortLabel: 'EN' },
  { id: 'hi', nativeLabel: 'हिन्दी (Hindi)', shortLabel: 'हिन्दी' },
  { id: 'hinglish', nativeLabel: 'Hinglish', shortLabel: 'Hinglish' },
  { id: 'te', nativeLabel: 'తెలుగు (Telugu)', shortLabel: 'తెలుగు' },
  { id: 'mr', nativeLabel: 'मराठी (Marathi)', shortLabel: 'मराठी' },
];

export interface TranslationBundle {
  nav: {
    overview: string;
    inbox: string;
    callMode: string;
    privacy: string;
    wipe: string;
    wipeShort: string;
    wipedToast: string;
    offlineToast: string;
  };
  overview: {
    kicker: string;
    heroTitle: string;
    heroBody: string;
    voiceGuideTitle: string;
    voiceGuideBody: string;
    ctaInbox: string;
    ctaCall: string;
    greenLegend: string;
    amberLegend: string;
    redLegend: string;
    guideKicker: string;
    guideTitle: string;
    guideSubtitle: string;
    step1Tag: string;
    step1Title: string;
    step1Body: string;
    step2Tag: string;
    step2Title: string;
    step2Body: string;
    step3Tag: string;
    step3Title: string;
    step3Body: string;
    scenariosTitle: string;
    scenariosSubtitle: string;
    openAll: string;
    watchExample: string;
    dangerLabel: string;
    safeLabel: string;
    stopHangUp: string;
    normalMsg: string;
    callKicker: string;
    callTitle: string;
    callBody: string;
    openCallMode: string;
    callNote: string;
    privacyKicker: string;
    privacyTitle: string;
    privacyBody: string;
    runsOn: string;
    yourDevice: string;
    dataSent: string;
    savedHistory: string;
    noneLabel: string;
    inspectPrivacy: string;
    helplineFooter: string;
    openSpottingGuide: string;
    spottingOverlay: {
      title: string;
      subtitle: string;
      hearCard: string;
      stopCard: string;
      closeBtn: string;
      checkNowBtn: string;
      tricks: {
        id: 'authority' | 'urgency' | 'fear' | 'isolation' | 'payment';
        title: string;
        trick: string;
        action: string;
      }[];
    };
  };
  inbox: {
    title: string;
    newCheck: string;
    checkCall: string;
    searchPlaceholder: string;
    filterAll: string;
    filterRed: string;
    filterAmber: string;
    filterGreen: string;
    noMatches: string;
    senderPlaceholder: string;
    startBtn: string;
  };
  chat: {
    playDemo: string;
    stopDemo: string;
    hintText: string;
    cautionLegend: string;
    dangerLegend: string;
    noMessages: string;
    waitingNext: string;
    emptyHint: string;
    incomingTab: string;
    replyTab: string;
    quickTestLabel: string;
    inputPlaceholderIncoming: string;
    inputPlaceholderReply: string;
    analyzeBtn: string;
    markScam: string;
    markSafe: string;
    unseenTestChip: string;
  };
  risk: {
    safetyCheck: string;
    greenVerdict: string;
    greenHint: string;
    amberVerdict: string;
    amberHint: string;
    redVerdict: string;
    redHint: string;
    timelineTitle: string;
    stagesCount: string;
    progressionTitle: string;
    messagesUnit: string;
    messageUnit: string;
    escalationBegan: string;
    turnWord: string;
    whatHappening: string;
    tacticsSeen: string;
    recommendedActions: string;
    stopVerify: string;
    helplineLabel: string;
    callHelplineCta: string;
    signalsTitle: string;
    aiSpansLabel: string;
    sequenceShiftsLabel: string;
    hardAlertsLabel: string;
    adaptTitle: string;
    adaptSubtitle: string;
    adaptEmpty: string;
    adaptPlaceholder: string;
    teachScamBtn: string;
    teachSafeBtn: string;
    hearExplanation: string;
    stopAudio: string;
    ttsUnsupported: string;
    stages: Record<SequenceStage, string>;
  };
  tactics: Record<TacticId, { label: string; shortLabel: string; reason: string }>;
  explain: {
    noScamHeadline: string;
    noScamBody: string;
    noScamAction: string;
    lowRiskHeadline: string;
    lowRiskSingle: string;
    lowRiskAction1: string;
    lowRiskAction2: string;
    amberHeadline: string;
    amberActions: string[];
    redHeadline: string;
    redActions: string[];
    remoteAccessAction: string;
    phishingLinkAction: string;
    upiCollectAction: string;
    clauses: Record<TacticId, string>;
    storyPrefix: string;
    storyThen: string;
    storyAndThen: string;
    warningPrefix: string;
  };
  consent: {
    title: string;
    subtitle: string;
    question: string;
    bullet1: string;
    bullet2: string;
    cancel: string;
    accept: string;
  };
  callMode: {
    title: string;
    subtitle: string;
    uploadTab: string;
    micTab: string;
    chooseFile: string;
    transcribing: string;
    startLive: string;
    stopListening: string;
    guideTitle: string;
    guideStep1: string;
    guideStep2: string;
    guideStep3: string;
  };
  privacyPanel: {
    title: string;
    subtitle: string;
    wipeNow: string;
    processingLabel: string;
    processingVal: string;
    processingDesc: string;
    networkLabel: string;
    networkVal: string;
    networkDesc: string;
    storageLabel: string;
    storageVal: string;
    engineLabel: string;
    engineMiniLM: string;
    engineLocal: string;
    engineRules: string;
    analyzedLabel: string;
    aiVsRuleLabel: string;
    latencyLabel: string;
    zeroBytesProof: string;
    selfTestTitle: string;
    selfTestDesc: string;
    selfTestBtn: string;
    selfTestRunning: string;
    selfTestPlaceholder: string;
  };
}

export const TRANSLATIONS: Record<AppLanguage, TranslationBundle> = {
  en: {
    nav: {
      overview: 'Overview',
      inbox: 'Inbox',
      callMode: 'Call Mode',
      privacy: 'Privacy Proof',
      wipe: 'Wipe session',
      wipeShort: 'Wipe',
      wipedToast: 'Session wiped — transcripts, audio buffers, and learned prototypes cleared.',
      offlineToast: 'Offline Mode — Running locally from cached app & weights',
    },
    overview: {
      kicker: 'Private On-Device Scam Detector · Works Offline',
      heroTitle: 'Spot a scam story before you tap, pay, or share an OTP.',
      heroBody:
        'Real bank alerts and delivery messages stay green. ScamShield watches for the trick step by step—fake officials, sudden rush, secrecy, and money or OTP requests—with simple colors and clear actions on your own device.',
      voiceGuideTitle: 'Use your voice to move around',
      voiceGuideBody:
        'Tap the Voice button at the bottom, then say: “Go to Home”, “Open Messages”, or “Call mode”.',
      ctaInbox: 'Check Messages Now',
      ctaCall: 'Check a Phone Call',
      greenLegend: 'Green: Safe to read',
      amberLegend: 'Amber: Wait & check',
      redLegend: 'Red: Hang up & stop',
      guideKicker: 'Visual Safety Guide',
      guideTitle: '3 simple steps to stay safe',
      guideSubtitle: 'Watch for these 3 warning signs. If unsure, stop and check.',
      step1Tag: '1. Someone contacts you',
      step1Title: 'They pretend to be someone you trust',
      step1Body:
        'They may say they are from your bank, the police, or the government.',
      step2Tag: '2. They pressure you',
      step2Title: 'They scare you or rush you',
      step2Body:
        'They may threaten you or say you must act now. Stop and check with someone you trust.',
      step3Tag: '3. Stop and check',
      step3Title: 'Do not share OTPs or send money',
      step3Body:
        'Hang up. Call your bank using its official number. If you lost money, call 1930.',
      scenariosTitle: 'Try Real & Scam Examples Live',
      scenariosSubtitle:
        'Tap Watch example on any card to see messages arrive one by one and watch the color gauge react.',
      openAll: 'Open all 8 examples →',
      watchExample: 'Watch example',
      dangerLabel: 'Danger',
      safeLabel: 'Safe',
      stopHangUp: 'Stop & hang up',
      normalMsg: 'Normal message',
      callKicker: 'Speakerphone & Recording Check',
      callTitle: 'Unsure about a live phone call? Let ScamShield listen locally.',
      callBody:
        'Upload a saved call recording or put your phone on speaker mode. ScamShield writes down what the caller says right on your device and warns you immediately if they threaten you or ask for money.',
      openCallMode: 'Open Call Mode',
      callNote: 'Asks permission first · Audio never leaves your device',
      privacyKicker: '100% Private by Design',
      privacyTitle: 'Nothing you type, paste, or say ever leaves your device.',
      privacyBody:
        'Everything runs inside your browser with zero accounts, zero servers, and zero saved history. Press Wipe session anytime to clear everything from memory instantly.',
      runsOn: 'Runs on',
      yourDevice: 'Your Device',
      dataSent: 'Data Sent Out',
      savedHistory: 'Saved History',
      noneLabel: 'None',
      inspectPrivacy: 'Inspect Privacy Proof',
      helplineFooter: 'India Cyber Helpline: 1930 · cybercrime.gov.in',
      openSpottingGuide: 'Scam Spotting Guide',
      spottingOverlay: {
        title: 'How to Spot a Scam',
        subtitle: 'Look for these 5 simple tricks. Tap Hear to listen.',
        hearCard: 'Hear',
        stopCard: 'Stop',
        closeBtn: 'Got it',
        checkNowBtn: 'Check a message now',
        tricks: [
          {
            id: 'authority',
            title: 'The Fake Authority',
            trick: 'They say: I am from your Bank or Police.',
            action: 'Hang up. Real banks never scare you.',
          },
          {
            id: 'urgency',
            title: 'The Urgency Trap',
            trick: 'They shout: Pay right now or lose your account!',
            action: 'Stop and wait. Never act in a rush.',
          },
          {
            id: 'fear',
            title: 'The Scare Trick',
            trick: 'They threaten arrest, fines, or blocked cards.',
            action: 'Do not panic. It is fake fear.',
          },
          {
            id: 'isolation',
            title: 'The Secret Rule',
            trick: 'They say: Stay on the call. Tell nobody.',
            action: 'Tell your family right away.',
          },
          {
            id: 'payment',
            title: 'The OTP & Money Trap',
            trick: 'They ask for your OTP, PIN, or small fee.',
            action: 'Never share OTP or send any money.',
          },
        ],
      },
    },
    inbox: {
      title: 'Inbox & Call Log',
      newCheck: 'New check',
      checkCall: 'Check this call',
      searchPlaceholder: 'Search messages or senders...',
      filterAll: 'All',
      filterRed: 'Scam',
      filterAmber: 'Caution',
      filterGreen: 'Safe',
      noMatches: 'No conversations match your filter.',
      senderPlaceholder: 'Sender or caller name...',
      startBtn: 'Start',
    },
    chat: {
      playDemo: 'Play demo',
      stopDemo: 'Stop',
      hintText: 'Hover or tap underlined phrases to inspect why a tactic was flagged.',
      cautionLegend: 'Caution',
      dangerLegend: 'Danger',
      noMessages: 'No messages yet',
      waitingNext: 'Waiting for next message...',
      emptyHint:
        'Paste or type an SMS, WhatsApp text, or call snippet below (English, Hindi, Hinglish, Telugu, or Marathi) to analyze it locally.',
      incomingTab: 'Incoming message (analyze)',
      replyTab: 'My reply',
      quickTestLabel: 'Quick test:',
      inputPlaceholderIncoming: 'Paste a suspicious SMS, WhatsApp message, or call line...',
      inputPlaceholderReply: 'Type your reply...',
      analyzeBtn: 'Analyze',
      markScam: 'Mark as scam',
      markSafe: 'Mark as safe',
      unseenTestChip: 'Unseen Scam',
    },
    risk: {
      safetyCheck: 'Safety Check',
      greenVerdict: 'Safe · No Scam Found',
      greenHint: 'Looks normal. Still, never share an OTP unless you expected it.',
      amberVerdict: 'Wait · Be Careful',
      amberHint: 'Pressure is building. Pause and ask a trusted family member.',
      redVerdict: 'STOP · Hang Up Now',
      redHint: 'Do NOT pay or share your OTP. Call 1930 or your bank card number.',
      timelineTitle: 'Manipulation Timeline',
      stagesCount: 'stages',
      progressionTitle: 'Risk Progression Over Time',
      messagesUnit: 'messages',
      messageUnit: 'message',
      escalationBegan: 'Escalation began at',
      turnWord: 'Turn',
      whatHappening: 'What is happening',
      tacticsSeen: 'Tactics seen:',
      recommendedActions: 'Recommended actions',
      stopVerify: 'Stop & verify',
      helplineLabel: 'Helpline: 1930',
      callHelplineCta: 'Call 1930',
      signalsTitle: 'Detection Signals',
      aiSpansLabel: 'AI semantic',
      sequenceShiftsLabel: 'Stage shifts',
      hardAlertsLabel: 'Domain/ID flags',
      adaptTitle: 'Adaptability (In-RAM Learning)',
      adaptSubtitle: 'Teach an unseen scam or safe pattern in memory — zero server writes.',
      adaptEmpty: 'No custom patterns yet. Mark any message or teach a new phrasing below.',
      adaptPlaceholder: 'Type an unseen scam or safe phrasing...',
      teachScamBtn: 'Teach Scam',
      teachSafeBtn: 'Teach Safe',
      hearExplanation: 'Hear Explanation',
      stopAudio: 'Stop',
      ttsUnsupported: 'Voice playback is unavailable in this browser.',
      stages: {
        authority: 'Authority',
        urgency: 'Urgency',
        fear: 'Fear',
        isolation: 'Isolation',
        payment: 'Payment',
      },
    },
    tactics: {
      authority: {
        label: 'Authority Impersonation',
        shortLabel: 'Authority',
        reason: 'Authority: claims to be your bank, police, or a government agency to establish instant trust.',
      },
      urgency: {
        label: 'Urgency Pressure',
        shortLabel: 'Urgency',
        reason: 'Urgency: pressures you with a tight deadline so you act before verifying.',
      },
      fear: {
        label: 'Fear & Threat',
        shortLabel: 'Fear',
        reason: 'Fear / Threat: threatens account freeze, arrest, or legal penalties to trigger panic.',
      },
      isolation: {
        label: 'Isolation & Secrecy',
        shortLabel: 'Isolation',
        reason: 'Isolation: tells you not to hang up or talk to family so nobody can warn you.',
      },
      reward: {
        label: 'Reward / Lottery Lure',
        shortLabel: 'Reward',
        reason: 'Reward / Lottery: dangles an unexpected prize or cash bonus to lower your guard.',
      },
      payment: {
        label: 'Payment or Credential Ask',
        shortLabel: 'Payment / OTP',
        reason: 'Payment / Credential Ask: asks for your OTP, PIN, KYC verification, or money transfer.',
      },
      remote_access: {
        label: 'Remote-Access Takeover',
        shortLabel: 'Remote Access',
        reason: 'Remote Access: asks for screen-sharing or APK apps that give attackers device control.',
      },
    },
    explain: {
      noScamHeadline: 'No manipulation sequence detected',
      noScamBody:
        'This conversation shows normal everyday communication with no authority pressure, secrecy, or credential harvesting pattern.',
      noScamAction: 'Continue normally, and verify any unexpected payment request independently.',
      lowRiskHeadline: 'Low risk — isolated signal only',
      lowRiskSingle: 'Real alerts often mention one detail alone without threats, rush, or secrecy.',
      lowRiskAction1: 'No multi-stage manipulation story detected yet.',
      lowRiskAction2: 'If they later ask for an OTP, money transfer, or secrecy, stop and verify independently.',
      amberHeadline: 'Caution — early manipulation pattern forming',
      amberActions: [
        'Pause and do not rush — legitimate agencies never force instant compliance.',
        'Do not share your OTP, PIN, or KYC details over chat or phone.',
        'Call your bank or service directly using the number printed on your card or official app.',
      ],
      redHeadline: 'High-risk scam sequence detected',
      redActions: [
        "Don't pay or transfer any verification deposit or processing fee.",
        "Don't share your OTP, CVV, PIN, or Aadhaar/PAN details.",
        'Hang up or stop replying immediately — police and banks never conduct "digital arrests" or demand secrecy.',
        'Call your bank directly on the toll-free number printed on the back of your debit/credit card.',
        'Report the attempt right away at helpline 1930 or cybercrime.gov.in.',
      ],
      remoteAccessAction:
        'Do not install AnyDesk, TeamViewer, QuickSupport, or any APK link sent in this chat.',
      phishingLinkAction:
        'Do not tap lookalike links or type bank card, PIN, or Aadhaar details on unverified web pages.',
      upiCollectAction:
        'Never approve a UPI Collect request or pay a fee to receive a refund, prize, or job payout.',
      clauses: {
        authority: 'claimed to be your bank, police, or a government authority',
        reward: 'dangled an unexpected lottery or cash reward',
        urgency: 'created artificial urgency to rush your decision',
        fear: 'used arrest, account-freeze, or legal threats to cause panic',
        isolation: 'told you to stay on the line or keep it secret from family',
        payment: 'asked you to share an OTP, KYC details, or transfer money',
        remote_access: 'asked you to install a remote-access or screen-sharing app',
      },
      storyPrefix: 'They',
      storyThen: ', then ',
      storyAndThen: ', and then ',
      warningPrefix: 'Warning sign:',
    },
    consent: {
      title: 'On-device call check consent',
      subtitle: '100% local speech transcription',
      question:
        'Share live audio so ScamShield can check this call? Audio is processed on your device and never saved or uploaded.',
      bullet1: 'Runs locally with Whisper-tiny inside a Web Worker',
      bullet2: 'Zero Web Speech API calls · Zero cloud uploads · No disk writes',
      cancel: 'Cancel',
      accept: 'Yes, check on device',
    },
    callMode: {
      title: 'Call Mode — On-Device Speech Monitor',
      subtitle: '5-second chunks transcribed locally with Whisper-tiny and analyzed in real time.',
      uploadTab: 'Upload a call recording',
      micTab: 'Live speaker mic',
      chooseFile: 'Choose audio file',
      transcribing: 'Transcribing 5s chunks...',
      startLive: 'Start live call check',
      stopListening: 'Stop listening',
      guideTitle: 'How to check a suspicious call safely',
      guideStep1:
        'For a call on this phone, turn on speaker and open ScamShield on another nearby device. Or upload a saved call recording.',
      guideStep2: 'Every 5 seconds of speech is written down right on your device.',
      guideStep3: 'If the meter turns Red, hang up right away and call 1930 or your bank card number.',
    },
    privacyPanel: {
      title: 'Privacy Proof & On-Device Architecture',
      subtitle:
        'Zero servers, zero telemetry, and zero persistence for anything you type, receive, or say.',
      wipeNow: 'Wipe session now',
      processingLabel: 'Processing',
      processingVal: '100% On-Device',
      processingDesc: 'MiniLM & Whisper-tiny execute inside local browser Web Workers.',
      networkLabel: 'User-data network requests',
      networkVal: '0 requests',
      networkDesc: 'No cloud AI APIs, no Web Speech API, no analytics endpoints.',
      storageLabel: 'User data storage',
      storageVal: 'None (RAM only)',
      engineLabel: 'Active AI Engine',
      engineMiniLM: 'MiniLM-L12-v2 Neural AI',
      engineLocal: 'Offline 512-dim Vector AI',
      engineRules: 'Deterministic Rule Engine',
      analyzedLabel: 'Analyzed locally',
      aiVsRuleLabel: 'AI semantic vs rule hits',
      latencyLabel: 'Last worker latency',
      zeroBytesProof: '0 bytes transmitted to external servers',
      selfTestTitle: 'Live Offline & Unseen Scam Self-Test',
      selfTestDesc:
        'Run our local Web Worker on a paraphrased, keyword-free scam message with zero outbound traffic.',
      selfTestBtn: 'Run On-Device AI Check',
      selfTestRunning: 'Analyzing in Web Worker...',
      selfTestPlaceholder: 'Paste or edit a novel unseen message to test offline AI detection...',
    },
  },

  hi: {
    nav: {
      overview: 'मुख्य पृष्ठ',
      inbox: 'इनबॉक्स',
      callMode: 'कॉल जांच',
      privacy: 'गोपनीयता प्रमाण',
      wipe: 'सत्र मिटाएं',
      wipeShort: 'मिटाएं',
      wipedToast: 'सत्र साफ हो गया — चैट, ऑडियो बफर और सीखे गए डेटा मेमोरी से हट गए।',
      offlineToast: 'ऑफ़लाइन मोड — बिना इंटरनेट के आपके फ़ोन पर चल रहा है',
    },
    overview: {
      kicker: 'निजी ऑन-डिवाइस स्कैम डिटेक्टर · बिना इंटरनेट भी काम करे',
      heroTitle: 'पैसे भेजने या OTP बताने से पहले ही धोखाधड़ी पहचानें।',
      heroBody:
        'असली बैंक अलर्ट और डिलीवरी मैसेज हरे रहते हैं। ScamShield आपके ही फ़ोन पर नकली अधिकारी, जल्दबाज़ी, गोपनीयता और पैसे/OTP की मांग को चरण-दर-चरण पहचानता है।',
      voiceGuideTitle: 'आवाज़ से पेज खोलें',
      voiceGuideBody:
        'नीचे दिए गए “आवाज़” बटन को दबाएँ और कहें: “घर खोलो”, “संदेश खोलो” या “कॉल मोड”.',
      ctaInbox: 'मैसेज अभी जांचें',
      ctaCall: 'फ़ोन कॉल जांचें',
      greenLegend: 'हरा: सुरक्षित है',
      amberLegend: 'पीला: रुकें और जांचें',
      redLegend: 'लाल: कॉल काटें, खतरा है',
      guideKicker: 'सरल सुरक्षा गाइड',
      guideTitle: 'सुरक्षित रहने के 3 आसान तरीके',
      guideSubtitle: 'इन 3 संकेतों को देखें। शक हो तो रुकें और जाँचें।',
      step1Tag: '1. कोई अनजान व्यक्ति संपर्क करे',
      step1Title: 'वह भरोसेमंद बनकर बात करता है',
      step1Body:
        'वह बैंक, पुलिस या सरकारी अधिकारी होने का दावा कर सकता है।',
      step2Tag: '2. वह दबाव डालता है',
      step2Title: 'वह डराता है या जल्दी कराता है',
      step2Body:
        'वह धमकी दे सकता है या तुरंत काम करने को कह सकता है। रुकें और भरोसेमंद व्यक्ति से पूछें।',
      step3Tag: '3. रुकें और जाँचें',
      step3Title: 'OTP न बताएं। पैसे न भेजें।',
      step3Body:
        'कॉल काटें। बैंक के आधिकारिक नंबर पर फोन करें। पैसे चले गए हों तो 1930 पर कॉल करें।',
      scenariosTitle: 'असली और नकली उदाहरण लाइव देखें',
      scenariosSubtitle:
        'किसी भी कार्ड पर "उदाहरण देखें" दबाएं और देखें कि रंग मीटर कैसे बदलता है।',
      openAll: 'सभी 8 उदाहरण खोलें →',
      watchExample: 'उदाहरण देखें',
      dangerLabel: 'खतरा',
      safeLabel: 'सुरक्षित',
      stopHangUp: 'रुकें और कॉल काटें',
      normalMsg: 'सामान्य संदेश',
      callKicker: 'स्पीकरफ़ोन और रिकॉर्डिंग जांच',
      callTitle: 'कॉल पर शक है? ScamShield को अपने फ़ोन पर सुनने दें।',
      callBody:
        'सेव की गई कॉल रिकॉर्डिंग अपलोड करें या फ़ोन स्पीकर पर रखें। ScamShield आपके ही डिवाइस पर कॉल लिखकर तुरंत चेतावनी देता है।',
      openCallMode: 'कॉल जांच खोलें',
      callNote: 'पहले अनुमति मांगता है · ऑडियो कभी बाहर नहीं जाता',
      privacyKicker: '100% निजी सुरक्षा',
      privacyTitle: 'आप जो लिखते या बोलते हैं, वह कभी फ़ोन से बाहर नहीं जाता।',
      privacyBody:
        'सब कुछ आपके ब्राउज़र में चलता है — न कोई खाता, न सर्वर, न सेव की गई हिस्ट्री। "सत्र मिटाएं" दबाते ही सब साफ हो जाता है।',
      runsOn: 'कहां चलता है',
      yourDevice: 'आपका फ़ोन',
      dataSent: 'बाहर भेजा गया डेटा',
      savedHistory: 'सेव की गई हिस्ट्री',
      noneLabel: 'कुछ नहीं',
      inspectPrivacy: 'गोपनीयता प्रमाण देखें',
      helplineFooter: 'भारत साइबर हेल्पलाइन: 1930 · cybercrime.gov.in',
      openSpottingGuide: 'स्कैम पहचानने की गाइड',
      spottingOverlay: {
        title: 'ठगी को आसानी से पहचानें',
        subtitle: 'ये 5 आसान संकेत देखें। सुनने के लिए "सुनें" दबाएं।',
        hearCard: 'सुनें',
        stopCard: 'रोकें',
        closeBtn: 'समझ गया',
        checkNowBtn: 'अभी मैसेज जांचें',
        tricks: [
          {
            id: 'authority',
            title: 'नकली अधिकारी',
            trick: 'कहते हैं: मैं बैंक या पुलिस से बोल रहा हूँ।',
            action: 'कॉल काटें। असली बैंक कभी नहीं डराता।',
          },
          {
            id: 'urgency',
            title: 'जल्दबाज़ी का जाल',
            trick: 'कहते हैं: अभी पैसे दें वरना खाता बंद होगा!',
            action: 'रुकें और सोचें। कभी जल्दी न करें।',
          },
          {
            id: 'fear',
            title: 'डराने की चाल',
            trick: 'गिरफ्तारी, केस या कार्ड बंद होने की धमकी देते हैं।',
            action: 'डरें नहीं। यह नकली डर है।',
          },
          {
            id: 'isolation',
            title: 'छुपाने की शर्त',
            trick: 'कहते हैं: किसी को मत बताना, फोन मत काटना।',
            action: 'तुरंत घरवालों को बताएं।',
          },
          {
            id: 'payment',
            title: 'OTP और पैसे का जाल',
            trick: 'वे OTP, पिन या थोड़ी फीस मांगते हैं।',
            action: 'कभी OTP न बताएं और पैसे न भेजें।',
          },
        ],
      },
    },
    inbox: {
      title: 'इनबॉक्स और कॉल लॉग',
      newCheck: 'नई जांच',
      checkCall: 'यह कॉल जांचें',
      searchPlaceholder: 'मैसेज या नाम खोजें...',
      filterAll: 'सभी',
      filterRed: 'खतरा',
      filterAmber: 'सावधान',
      filterGreen: 'सुरक्षित',
      noMatches: 'कोई चैट नहीं मिली।',
      senderPlaceholder: 'भेजने वाले का नाम...',
      startBtn: 'शुरू करें',
    },
    chat: {
      playDemo: 'डेमो चलाएं',
      stopDemo: 'रोकें',
      hintText: 'कारण जानने के लिए रंगीन रेखांकित शब्दों को छुएं या माउस ले जाएं।',
      cautionLegend: 'सावधान',
      dangerLegend: 'खतरा',
      noMessages: 'अभी कोई संदेश नहीं',
      waitingNext: 'अगले संदेश की प्रतीक्षा...',
      emptyHint:
        'नीचे कोई SMS, WhatsApp मैसेज या कॉल लाइन पेस्ट करें (हिंदी, अंग्रेज़ी, हिंग्लिश, तेलुगु, मराठी)।',
      incomingTab: 'आया हुआ संदेश (जांचें)',
      replyTab: 'मेरा जवाब',
      quickTestLabel: 'त्वरित जांच:',
      inputPlaceholderIncoming: 'संदिग्ध SMS या WhatsApp संदेश यहां लिखें...',
      inputPlaceholderReply: 'अपना जवाब लिखें...',
      analyzeBtn: 'जांचें',
      markScam: 'स्कैम बताएं',
      markSafe: 'सुरक्षित बताएं',
      unseenTestChip: 'नया अज्ञात टेस्ट',
    },
    risk: {
      safetyCheck: 'सुरक्षा जांच',
      greenVerdict: 'सुरक्षित · कोई धोखा नहीं',
      greenHint: 'सामान्य संदेश लगता है। फिर भी बिना कारण OTP साझा न करें।',
      amberVerdict: 'रुकें · सावधान रहें',
      amberHint: 'दबाव बनाया जा रहा है। परिवार के किसी सदस्य से सलाह लें।',
      redVerdict: 'रुकें · तुरंत कॉल काटें',
      redHint: 'OTP या पैसे न भेजें। 1930 या बैंक कार्ड के नंबर पर कॉल करें।',
      timelineTitle: 'चाल की समयरेखा',
      stagesCount: 'चरण',
      progressionTitle: 'समय के साथ जोखिम का ग्राफ़',
      messagesUnit: 'संदेश',
      messageUnit: 'संदेश',
      escalationBegan: 'खतरा शुरू हुआ:',
      turnWord: 'मोड़',
      whatHappening: 'यहां क्या हो रहा है',
      tacticsSeen: 'पकड़ी गई चालें:',
      recommendedActions: 'अब क्या करें',
      stopVerify: 'रुकें और जांचें',
      helplineLabel: 'हेल्पलाइन: 1930',
      callHelplineCta: '1930 पर कॉल करें',
      signalsTitle: 'पकड़े गए संकेत',
      aiSpansLabel: 'AI अर्थ पहचान',
      sequenceShiftsLabel: 'क्रमिक दबाव',
      hardAlertsLabel: 'लिंक / नंबर अलर्ट',
      adaptTitle: 'नए पैटर्न सीखना (RAM में)',
      adaptSubtitle: 'बिना सर्वर के फ़ोन की मेमोरी में नया स्कैम या सुरक्षित उदाहरण सिखाएं।',
      adaptEmpty: 'अभी कोई कस्टम पैटर्न नहीं सिखाया गया है। नीचे नया वाक्य जोड़ें।',
      adaptPlaceholder: 'कोई नया स्कैम या सुरक्षित वाक्य लिखें...',
      teachScamBtn: 'स्कैम सिखाएं',
      teachSafeBtn: 'सुरक्षित सिखाएं',
      hearExplanation: 'व्याख्या सुनें',
      stopAudio: 'रोकें',
      ttsUnsupported: 'इस ब्राउज़र में आवाज़ सुविधा उपलब्ध नहीं है।',
      stages: {
        authority: 'अधिकारी',
        urgency: 'जल्दबाज़ी',
        fear: 'डर/धमकी',
        isolation: 'अलगाव',
        payment: 'पैसे/OTP',
      },
    },
    tactics: {
      authority: {
        label: 'नकली अधिकारी बनना',
        shortLabel: 'अधिकारी',
        reason: 'अधिकारी: भरोसा जीतने के लिए बैंक, पुलिस या सरकारी विभाग का नाम ले रहा है।',
      },
      urgency: {
        label: 'जल्दबाज़ी का दबाव',
        shortLabel: 'जल्दबाज़ी',
        reason: 'जल्दबाज़ी: बिना सोचे-समझे कदम उठवाने के लिए कम समय का दबाव बना रहा है।',
      },
      fear: {
        label: 'डर और धमकी',
        shortLabel: 'डर/धमकी',
        reason: 'डर/धमकी: खाता बंद होने, गिरफ्तारी या जुर्माने का डर दिखा रहा है।',
      },
      isolation: {
        label: 'अकेला करना और छुपाना',
        shortLabel: 'अलगाव',
        reason: 'अलगाव: परिवार या किसी को बताने से मना कर रहा है ताकि कोई मदद न कर सके।',
      },
      reward: {
        label: 'इनाम / लॉटरी का लालच',
        shortLabel: 'इनाम',
        reason: 'इनाम: बिना वजह बड़े नकद इनाम या कैशबैक का लालच दे रहा है।',
      },
      payment: {
        label: 'पैसे या OTP की मांग',
        shortLabel: 'पैसे/OTP',
        reason: 'पैसे/OTP: आपसे OTP, PIN, KYC जानकारी या पैसे भेजने को कह रहा है।',
      },
      remote_access: {
        label: 'स्क्रीन शेयर / रिमोट कंट्रोल',
        shortLabel: 'रिमोट ऐप',
        reason: 'रिमोट ऐप: AnyDesk या स्क्रीन शेयर ऐप से आपके फ़ोन पर कब्ज़ा करने की कोशिश।',
      },
    },
    explain: {
      noScamHeadline: 'कोई धोखाधड़ी पैटर्न नहीं मिला',
      noScamBody: 'यह बातचीत सामान्य है। इसमें किसी अधिकारी का दबाव, धमकी या OTP मांगने की चाल नहीं है।',
      noScamAction: 'सामान्य रूप से बात करें, और किसी भी अनजान भुगतान से पहले खुद जांचें।',
      lowRiskHeadline: 'कम जोखिम — केवल एक संकेत मिला',
      lowRiskSingle: 'असली बैंक या डिलीवरी अलर्ट में अक्सर बिना धमकी या दबाव के एक सामान्य शब्द होता है।',
      lowRiskAction1: 'अभी तक कोई बहु-चरणीय स्कैम कहानी नहीं मिली।',
      lowRiskAction2: 'यदि आगे OTP, पैसे या गोपनीयता मांगी जाए तो तुरंत रुकें।',
      amberHeadline: 'सावधान — शुरुआती धोखाधड़ी के संकेत बन रहे हैं',
      amberActions: [
        'रुकें और जल्दबाज़ी न करें — असली संस्थाएं तुरंत दबाव नहीं डालतीं।',
        'चैट या फ़ोन पर अपना OTP, PIN या KYC न बताएं।',
        'अपने बैंक कार्ड के पीछे छपे नंबर पर खुद कॉल करके पुष्टि करें।',
      ],
      redHeadline: 'उच्च जोखिम — स्कैम की पूरी चाल पकड़ी गई',
      redActions: [
        'कोई भी वेरिफिकेशन फीस या सुरक्षा जमा राशि बिल्कुल न भेजें।',
        'अपना OTP, CVV, PIN या आधार/पैन नंबर साझा न करें।',
        'तुरंत कॉल काट दें — पुलिस या बैंक कभी "डिजिटल अरेस्ट" या गोपनीयता नहीं मांगते।',
        'अपने डेबिट/क्रेडिट कार्ड के पीछे लिखे टोल-फ्री नंबर पर बैंक को कॉल करें।',
        'तुरंत 1930 हेल्पलाइन या cybercrime.gov.in पर रिपोर्ट करें।',
      ],
      remoteAccessAction: 'इस चैट में भेजे गए AnyDesk, TeamViewer या किसी APK लिंक को इंस्टॉल न करें।',
      phishingLinkAction: 'किसी भी संदिग्ध या नकली वेबसाइट लिंक पर कार्ड, पिन या आधार नंबर न डालें।',
      upiCollectAction: 'पैसे पाने, रिफंड या नौकरी के नाम पर कोई UPI कलेक्ट रिक्वेस्ट मंजूर न करें।',
      clauses: {
        authority: 'बैंक, पुलिस या सरकारी अधिकारी होने का दावा किया',
        reward: 'अचानक लॉटरी या बड़े इनाम का लालच दिया',
        urgency: 'सोचने का समय दिए बिना जल्दबाज़ी का दबाव बनाया',
        fear: 'गिरफ्तारी, खाता बंद होने या कानूनी कार्रवाई का डर दिखाया',
        isolation: 'फ़ोन न काटने और परिवार से बात छुपाने को कहा',
        payment: 'OTP, KYC या पैसे भेजने की मांग की',
        remote_access: 'स्क्रीन शेयर या रिमोट-एक्सेस ऐप डाउनलोड करने को कहा',
      },
      storyPrefix: 'उन्होंने',
      storyThen: ', फिर ',
      storyAndThen: ', और उसके बाद ',
      warningPrefix: 'चेतावनी संकेत:',
    },
    consent: {
      title: 'फ़ोन पर कॉल जांच की अनुमति',
      subtitle: '100% आपके डिवाइस पर आवाज़ से लिखावट',
      question:
        'क्या ScamShield आपकी कॉल का ऑडियो आपके ही डिवाइस पर जांचे? ऑडियो कभी सेव या अपलोड नहीं होता।',
      bullet1: 'वेब वर्कर में Whisper-tiny आपके फ़ोन पर ही चलता है',
      bullet2: 'कोई क्लाउड अपलोड नहीं · कोई Google स्पीच API नहीं · कोई डिस्क सेव नहीं',
      cancel: 'रद्द करें',
      accept: 'हां, डिवाइस पर जांचें',
    },
    callMode: {
      title: 'कॉल जांच — ऑन-डिवाइस स्पीच मॉनिटर',
      subtitle: 'हर 5 सेकंड का ऑडियो आपके डिवाइस पर लिखकर तुरंत जांचा जाता है।',
      uploadTab: 'कॉल रिकॉर्डिंग अपलोड करें',
      micTab: 'लाइव स्पीकर माइक',
      chooseFile: 'ऑडियो फ़ाइल चुनें',
      transcribing: '5 सेकंड हिस्से लिखे जा रहे हैं...',
      startLive: 'लाइव कॉल जांच शुरू करें',
      stopListening: 'सुनना बंद करें',
      guideTitle: 'संदिग्ध कॉल को सुरक्षित कैसे जांचें',
      guideStep1: 'अगर कॉल इसी फ़ोन पर है, तो स्पीकर चालू करें और पास के दूसरे डिवाइस पर ScamShield खोलें। या रिकॉर्ड की गई कॉल फ़ाइल चुनें।',
      guideStep2: 'हर 5 सेकंड की बात आपके फ़ोन पर ही हिंदी या अंग्रेज़ी में लिखी जाती है।',
      guideStep3: 'यदि मीटर लाल हो जाए, तो तुरंत कॉल काटें और 1930 या बैंक कार्ड नंबर पर कॉल करें।',
    },
    privacyPanel: {
      title: 'गोपनीयता प्रमाण और ऑन-डिवाइस संरचना',
      subtitle: 'आप जो लिखते, प्राप्त करते या बोलते हैं, उसके लिए न कोई सर्वर है न कोई स्टोरेज।',
      wipeNow: 'सत्र अभी मिटाएं',
      processingLabel: 'प्रोसेसिंग',
      processingVal: '100% ऑन-डिवाइस',
      processingDesc: 'MiniLM और Whisper-tiny आपके ब्राउज़र के अंदर ही चलते हैं।',
      networkLabel: 'यूज़र डेटा नेटवर्क रिक्वेस्ट',
      networkVal: '0 रिक्वेस्ट',
      networkDesc: 'कोई क्लाउड AI API नहीं, कोई Web Speech API नहीं, कोई ट्रैकिंग नहीं।',
      storageLabel: 'यूज़र डेटा स्टोरेज',
      storageVal: 'कुछ नहीं (केवल RAM)',
      engineLabel: 'सक्रिय AI इंजन',
      engineMiniLM: 'MiniLM-L12-v2 न्यूरल AI',
      engineLocal: 'ऑफ़लाइन 512-dim वेक्टर AI',
      engineRules: 'नियम आधारित इंजन',
      analyzedLabel: 'स्थानीय जांच',
      aiVsRuleLabel: 'AI बनाम नियम पहचान',
      latencyLabel: 'अंतिम वर्कर गति',
      zeroBytesProof: 'बाहरी सर्वर पर 0 बाइट भेजा गया',
      selfTestTitle: 'लाइव ऑफ़लाइन और अज्ञात स्कैम जांच',
      selfTestDesc: 'बिना किसी कीवर्ड वाले नए स्कैम वाक्य को लोकल वेब वर्कर पर तुरंत टेस्ट करें।',
      selfTestBtn: 'ऑन-डिवाइस AI जांच चलाएं',
      selfTestRunning: 'लोकल जांच जारी है...',
      selfTestPlaceholder: 'ऑफ़लाइन AI जांच के लिए कोई नया संदेश लिखें या बदलें...',
    },
  },

  hinglish: {
    nav: {
      overview: 'Overview',
      inbox: 'Inbox',
      callMode: 'Call Check',
      privacy: 'Privacy Proof',
      wipe: 'Wipe session',
      wipeShort: 'Wipe',
      wipedToast: 'Session clean ho gaya — saare transcripts, audio buffers aur learned data memory se hat gaye.',
      offlineToast: 'Offline Mode — Bina internet aapke device par chal raha hai',
    },
    overview: {
      kicker: 'Private On-Device Scam Detector · Bina Internet Bhi Chale',
      heroTitle: 'Paise bhejne ya OTP batane se pehle hi scam pakdein.',
      heroBody:
        'Asli bank alerts aur delivery OTP green rehte hain. ScamShield step-by-step dekhta hai ki koi nakli officer bankar dara raha hai, jaldi karwa raha hai, ya secret rakhne ko bol kar OTP maang raha hai.',
      voiceGuideTitle: 'Awaaz se page kholein',
      voiceGuideBody:
        'Neeche diye Voice button ko dabayein, phir bolein: “Home kholo”, “Messages kholo”, ya “Call mode”.',
      ctaInbox: 'Messages Abhi Check Karein',
      ctaCall: 'Phone Call Check Karein',
      greenLegend: 'Green: Safe hai',
      amberLegend: 'Amber: Rukein & sochein',
      redLegend: 'Red: Call kaatein, khatra hai',
      guideKicker: 'Asaan Safety Guide',
      guideTitle: 'Safe rehne ke 3 simple steps',
      guideSubtitle: 'Yeh 3 warning signs dekhein. Shak ho to ruk kar check karein.',
      step1Tag: '1. Koi anjaan contact kare',
      step1Title: 'Woh bharosemand bankar baat karte hain',
      step1Body:
        'Woh bank, police, ya sarkari adhikari hone ka daava kar sakte hain.',
      step2Tag: '2. Woh pressure daalte hain',
      step2Title: 'Woh daraate hain ya jaldi karte hain',
      step2Body:
        'Woh dhamki de sakte hain ya abhi karne ko keh sakte hain. Rukein aur kisi bharosemand se poochhein.',
      step3Tag: '3. Rukein aur check karein',
      step3Title: 'OTP na batayein. Paise na bhejein.',
      step3Body:
        'Call kaat dein. Bank ke official number par call karein. Paise chale gaye hon to 1930 par call karein.',
      scenariosTitle: 'Asli aur Scam Examples Live Dekhein',
      scenariosSubtitle:
        'Kisi bhi card par Watch example dabayein aur dekhein ki color meter kaise badalta hai.',
      openAll: 'Saare 8 examples dekhein →',
      watchExample: 'Watch example',
      dangerLabel: 'Danger',
      safeLabel: 'Safe',
      stopHangUp: 'Rukein & call kaatein',
      normalMsg: 'Normal message',
      callKicker: 'Speakerphone & Recording Check',
      callTitle: 'Live call pe doubt hai? ScamShield ko device par sunne dein.',
      callBody:
        'Saved call recording upload karein ya phone speaker par rakhein. ScamShield aapke hi device par baatein likhkar turant alert deta hai.',
      openCallMode: 'Call Mode Kholein',
      callNote: 'Pehle permission leta hai · Audio kabhi upload nahi hota',
      privacyKicker: '100% Private by Design',
      privacyTitle: 'Aap jo likhte, paste karte ya bolte hain kabhi bahar nahi jaata.',
      privacyBody:
        'Sab kuch aapke browser mein chalta hai — koi server nahi, koi saved history nahi. Wipe session dabate hi sab clean ho jaata hai.',
      runsOn: 'Chalta hai',
      yourDevice: 'Aapke Device Par',
      dataSent: 'Bahar Bheja Data',
      savedHistory: 'Saved History',
      noneLabel: 'Zero (None)',
      inspectPrivacy: 'Privacy Proof Dekhein',
      helplineFooter: 'India Cyber Helpline: 1930 · cybercrime.gov.in',
      openSpottingGuide: 'Scam Spotting Guide',
      spottingOverlay: {
        title: 'Scam Kaise Pehchanein',
        subtitle: 'Yeh 5 aasaan tricks dekhein. Sunne ke liye Hear dabayein.',
        hearCard: 'Sunein',
        stopCard: 'Rokein',
        closeBtn: 'Samajh gaya',
        checkNowBtn: 'Message abhi check karein',
        tricks: [
          {
            id: 'authority',
            title: 'Nakli Authority (Officer)',
            trick: 'Kehte hain: Main Bank ya Police se bol raha hoon.',
            action: 'Call kaatein. Asli bank kabhi nahi daraata.',
          },
          {
            id: 'urgency',
            title: 'Urgency Trap (Jaldbaazi)',
            trick: 'Kehte hain: Abhi pay karein warna account band!',
            action: 'Rukein aur sochein. Jaldi mein kuch na karein.',
          },
          {
            id: 'fear',
            title: 'Darr ki Trick',
            trick: 'Arrest, fine ya card block karne ki dhamki dete hain.',
            action: 'Ghabrayein nahi. Yeh nakli darr hai.',
          },
          {
            id: 'isolation',
            title: 'Secret Rakhne ki Shart',
            trick: 'Kehte hain: Call pe raho, ghar pe mat batana.',
            action: 'Turant family ko batayein.',
          },
          {
            id: 'payment',
            title: 'OTP aur Paise ka Jaal',
            trick: 'Woh aapka OTP, PIN ya chhoti fee maangte hain.',
            action: 'Kabhi OTP ya paisa mat bhejein.',
          },
        ],
      },
    },
    inbox: {
      title: 'Inbox & Call Log',
      newCheck: 'New check',
      checkCall: 'Yeh call check karein',
      searchPlaceholder: 'Messages ya naam search karein...',
      filterAll: 'All',
      filterRed: 'Scam',
      filterAmber: 'Caution',
      filterGreen: 'Safe',
      noMatches: 'Koi matching chat nahi mili.',
      senderPlaceholder: 'Sender ya caller ka naam...',
      startBtn: 'Start',
    },
    chat: {
      playDemo: 'Play demo',
      stopDemo: 'Stop',
      hintText: 'Reason dekhne ke liye underlined words par hover ya tap karein.',
      cautionLegend: 'Caution',
      dangerLegend: 'Danger',
      noMessages: 'Abhi koi message nahi',
      waitingNext: 'Agla message aa raha hai...',
      emptyHint:
        'Neeche koi SMS, WhatsApp text ya call line paste karein (English, Hindi, Hinglish, Telugu, Marathi).',
      incomingTab: 'Aaya hua message (check karein)',
      replyTab: 'Mera reply',
      quickTestLabel: 'Quick test:',
      inputPlaceholderIncoming: 'Suspicious SMS ya WhatsApp message yahan likhein...',
      inputPlaceholderReply: 'Apna reply likhein...',
      analyzeBtn: 'Check Karein',
      markScam: 'Scam mark karein',
      markSafe: 'Safe mark karein',
      unseenTestChip: 'Unseen Test',
    },
    risk: {
      safetyCheck: 'Safety Check',
      greenVerdict: 'Safe · Koi Scam Nahi',
      greenHint: 'Normal lag raha hai. Bina kaam kisi ko OTP mat dein.',
      amberVerdict: 'Rukein · Dhyan Dein',
      amberHint: 'Pressure banaya ja raha hai. Family se baat karke check karein.',
      redVerdict: 'STOP · Call Kaat Dein',
      redHint: 'Paise ya OTP bilkul mat dein. 1930 ya bank card number par call karein.',
      timelineTitle: 'Manipulation Timeline',
      stagesCount: 'stages',
      progressionTitle: 'Time ke Saath Risk Graph',
      messagesUnit: 'messages',
      messageUnit: 'message',
      escalationBegan: 'Khatra shuru hua:',
      turnWord: 'Turn',
      whatHappening: 'Yahan kya ho raha hai',
      tacticsSeen: 'Pakdi gayi tricks:',
      recommendedActions: 'Ab kya karein',
      stopVerify: 'Rukein & verify karein',
      helplineLabel: 'Helpline: 1930',
      callHelplineCta: '1930 pe call karein',
      signalsTitle: 'Detection Signals',
      aiSpansLabel: 'AI semantic',
      sequenceShiftsLabel: 'Stage shifts',
      hardAlertsLabel: 'Link / number flags',
      adaptTitle: 'Adaptability (In-RAM Learning)',
      adaptSubtitle: 'Bina server ke RAM mein naya scam ya safe pattern sikhayein.',
      adaptEmpty: 'Abhi koi custom pattern nahi sikhaaya gaya. Neeche naya phrase add karein.',
      adaptPlaceholder: 'Koi naya scam ya safe sentence likhein...',
      teachScamBtn: 'Scam Sikhayein',
      teachSafeBtn: 'Safe Sikhayein',
      hearExplanation: 'Hear Explanation',
      stopAudio: 'Stop',
      ttsUnsupported: 'Is browser mein voice playback available nahi hai.',
      stages: {
        authority: 'Authority',
        urgency: 'Jaldi',
        fear: 'Darr',
        isolation: 'Chhupana',
        payment: 'Paise/OTP',
      },
    },
    tactics: {
      authority: {
        label: 'Nakli Authority / Officer',
        shortLabel: 'Authority',
        reason: 'Authority: trust jeetne ke liye bank, police ya govt officer hone ka daava kar raha hai.',
      },
      urgency: {
        label: 'Jaldbaazi ka Pressure',
        shortLabel: 'Jaldi',
        reason: 'Urgency: aapko sochne ka mauka diye bina turant action lene ka pressure daal raha hai.',
      },
      fear: {
        label: 'Darr aur Dhamki',
        shortLabel: 'Darr',
        reason: 'Fear: account block, arrest ya legal case ka darr dikha raha hai.',
      },
      isolation: {
        label: 'Akele Karna & Secret Rakhna',
        shortLabel: 'Chhupana',
        reason: 'Isolation: family ya doston ko batane se mana kar raha hai taaki koi alert na kar sake.',
      },
      reward: {
        label: 'Lottery / Inaam ka Laalach',
        shortLabel: 'Inaam',
        reason: 'Reward: bina khele cash prize ya lottery jeetne ka laalach de raha hai.',
      },
      payment: {
        label: 'Paise ya OTP Maangna',
        shortLabel: 'Paise / OTP',
        reason: 'Payment / OTP: aapse OTP, PIN, KYC update ya paisa transfer karne ko keh raha hai.',
      },
      remote_access: {
        label: 'Remote-Access / Screen Share',
        shortLabel: 'Remote App',
        reason: 'Remote Access: AnyDesk ya screen-share app install karwa ke phone control maang raha hai.',
      },
    },
    explain: {
      noScamHeadline: 'Koi scam pattern nahi mila',
      noScamBody: 'Yeh normal baat-cheet lagti hai — ismein koi pressure, dhamki ya OTP maangne ki trick nahi hai.',
      noScamAction: 'Normal tarah baat karein, aur kisi bhi payment se pehle khud verify karein.',
      lowRiskHeadline: 'Low risk — sirf ek chota signal mila',
      lowRiskSingle: 'Asli bank ya delivery alerts mein bina dhamki ya jaldi ke ek word aa sakta hai.',
      lowRiskAction1: 'Abhi tak koi multi-stage scam story nahi mili.',
      lowRiskAction2: 'Agar baad mein OTP, paisa ya secret rakhne ko kahein toh turant ruk jayein.',
      amberHeadline: 'Caution — shuruati scam pattern ban raha hai',
      amberActions: [
        'Rukein aur jaldi na karein — asli bank ya police kabhi turant force nahi karte.',
        'Chat ya call par apna OTP, PIN ya KYC bilkul share na karein.',
        'Apne bank card ke peeche likhe number par khud call karke check karein.',
      ],
      redHeadline: 'High-risk scam sequence pakda gaya',
      redActions: [
        'Koi bhi verification deposit ya processing fee transfer mat karein.',
        'Apna OTP, CVV, PIN ya Aadhaar/PAN details mat batayein.',
        'Turant call kaatein — police ya bank kabhi "digital arrest" ya secrecy nahi maangte.',
        'Apne debit/credit card ke peeche chhape toll-free number par bank ko call karein.',
        'Turant helpline 1930 ya cybercrime.gov.in par report karein.',
      ],
      remoteAccessAction: 'Is chat mein bheja gaya AnyDesk, TeamViewer, QuickSupport ya APK install na karein.',
      phishingLinkAction: 'Kisi bhi nakli ya suspicious link par bank card, PIN ya Aadhaar details enter na karein.',
      upiCollectAction: 'Paise paane ya refund ke liye kabhi bhi UPI Collect request approve na karein.',
      clauses: {
        authority: 'bank, police ya govt officer hone ka daava kiya',
        reward: 'achanak lottery ya cash prize ka laalach diya',
        urgency: 'jaldi faisla lene ke liye artificial deadline banayi',
        fear: 'arrest, account block ya legal action ki dhamki di',
        isolation: 'call na kaatne aur family se baat chhupane ko kaha',
        payment: 'OTP, KYC details ya paisa bhejne ko kaha',
        remote_access: 'remote-access ya screen-sharing app install karne ko kaha',
      },
      storyPrefix: 'Unhone',
      storyThen: ', phir ',
      storyAndThen: ', aur uske baad ',
      warningPrefix: 'Warning sign:',
    },
    consent: {
      title: 'On-device call check permission',
      subtitle: '100% local speech transcription',
      question:
        'Kya ScamShield is call ka audio aapke device par check kare? Audio device par hi process hota hai — kabhi save ya upload nahi hota.',
      bullet1: 'Whisper-tiny aapke browser ke Web Worker mein locally chalta hai',
      bullet2: 'Zero Web Speech API · Zero cloud upload · No disk storage',
      cancel: 'Cancel',
      accept: 'Haan, device par check karein',
    },
    callMode: {
      title: 'Call Mode — On-Device Speech Monitor',
      subtitle: 'Har 5-second audio chunk device par likhkar live analyze hota hai.',
      uploadTab: 'Call recording upload karein',
      micTab: 'Live speaker mic',
      chooseFile: 'Audio file chunein',
      transcribing: '5s chunks likh rahe hain...',
      startLive: 'Live call check shuru karein',
      stopListening: 'Sunna band karein',
      guideTitle: 'Suspicious call ko safely kaise check karein',
      guideStep1: 'Agar call isi phone par hai, speaker on karein aur paas ke doosre device par ScamShield kholein. Ya saved call recording upload karein.',
      guideStep2: 'Har 5 second ki baat aapke hi device par English ya Hindi mein likhi jaati hai.',
      guideStep3: 'Agar meter Red ho jaye, toh turant call kaatein aur 1930 ya bank card number par call karein.',
    },
    privacyPanel: {
      title: 'Privacy Proof & On-Device Architecture',
      subtitle: 'Aap jo likhte, paate ya bolte hain uske liye koi server ya storage nahi hai.',
      wipeNow: 'Wipe session now',
      processingLabel: 'Processing',
      processingVal: '100% On-Device',
      processingDesc: 'MiniLM aur Whisper-tiny aapke browser Web Workers mein chalte hain.',
      networkLabel: 'User-data network requests',
      networkVal: '0 requests',
      networkDesc: 'Koi cloud AI API nahi, koi Web Speech API nahi, koi tracking nahi.',
      storageLabel: 'User data storage',
      storageVal: 'None (RAM only)',
      engineLabel: 'Active AI Engine',
      engineMiniLM: 'MiniLM-L12-v2 Neural AI',
      engineLocal: 'Offline 512-dim Vector AI',
      engineRules: 'Deterministic Rule Engine',
      analyzedLabel: 'Local messages checked',
      aiVsRuleLabel: 'AI semantic vs rule hits',
      latencyLabel: 'Last worker latency',
      zeroBytesProof: '0 bytes kisi server ko bheje gaye',
      selfTestTitle: 'Live Offline & Unseen Scam Self-Test',
      selfTestDesc: 'Bina keyword wale naye scam sentence ko bina network ke local Web Worker par test karein.',
      selfTestBtn: 'On-Device AI Check Chalayein',
      selfTestRunning: 'Local worker analyze kar raha hai...',
      selfTestPlaceholder: 'Offline AI detection test karne ke liye naya message likhein...',
    },
  },

  te: {
    nav: {
      overview: 'ముఖ్యాంశం',
      inbox: 'ఇన్‌బాక్స్',
      callMode: 'కాల్ తనిఖీ',
      privacy: 'గోప్యత రుజువు',
      wipe: 'సెషన్ తొలగించు',
      wipeShort: 'తొలగించు',
      wipedToast: 'సెషన్ క్లియర్ అయింది — సందేశాలు, ఆడియో మరియు నేర్చుకున్న డేటా తొలగించబడ్డాయి.',
      offlineToast: 'ఆఫ్‌లైన్ మోడ్ — ఇంటర్నెట్ లేకుండా మీ ఫోన్‌లోనే పనిచేస్తోంది',
    },
    overview: {
      kicker: 'మీ పరికరంలోనే స్కామ్ గుర్తింపు · ఆఫ్‌లైన్‌లోనూ పనిచేస్తుంది',
      heroTitle: 'డబ్బు పంపే ముందు లేదా OTP చెప్పే ముందే మోసాన్ని గుర్తించండి.',
      heroBody:
        'నిజమైన బ్యాంక్ మరియు డెలివరీ సందేశాలు ఆకుపచ్చగా ఉంటాయి. నకిలీ అధికారులు, అత్యవసర ఒత్తిడి, రహస్యంగా ఉంచమని చెప్పడం మరియు డబ్బు/OTP అడగడాన్ని ScamShield మీ ఫోన్‌లోనే గుర్తిస్తుంది.',
      voiceGuideTitle: 'వాయిస్‌తో పేజీకి వెళ్లండి',
      voiceGuideBody:
        'కింద ఉన్న వాయిస్ బటన్‌ను నొక్కి ఇలా చెప్పండి: “హోమ్ తెరువు”, “సందేశాలు తెరువు” లేదా “కాల్ మోడ్”.',
      ctaInbox: 'సందేశాలు తనిఖీ చేయండి',
      ctaCall: 'ఫోన్ కాల్ తనిఖీ చేయండి',
      greenLegend: 'ఆకుపచ్చ: సురక్షితం',
      amberLegend: 'పసుపు: ఆగండి & ఆలోచించండి',
      redLegend: 'ఎరుపు: కాల్ కట్ చేయండి',
      guideKicker: 'సులభ భద్రతా మార్గదర్శి',
      guideTitle: 'సురక్షితంగా ఉండటానికి 3 సులభమైన మార్గాలు',
      guideSubtitle: 'ఈ 3 హెచ్చరిక సంకేతాలను గుర్తించండి. అనుమానం ఉంటే ఆగి తనిఖీ చేయండి.',
      step1Tag: '1. అపరిచితులు మిమ్మల్ని సంప్రదిస్తారు',
      step1Title: 'నమ్మకమైన వ్యక్తిలా నటిస్తారు',
      step1Body:
        'వారు బ్యాంక్, పోలీస్ లేదా ప్రభుత్వ అధికారి అని చెప్పవచ్చు.',
      step2Tag: '2. ఒత్తిడి చేస్తారు',
      step2Title: 'భయపెడతారు లేదా తొందరపెడతారు',
      step2Body:
        'వెంటనే చేయాలని బెదిరించవచ్చు. ఆగి, నమ్మకమైన వ్యక్తిని అడగండి.',
      step3Tag: '3. ఆగి తనిఖీ చేయండి',
      step3Title: 'OTP చెప్పకండి. డబ్బు పంపకండి.',
      step3Body:
        'కాల్ కట్ చేయండి. బ్యాంక్ అధికారిక నంబర్‌కు కాల్ చేయండి. డబ్బు పోతే 1930కు కాల్ చేయండి.',
      scenariosTitle: 'నిజమైన & మోసపూరిత ఉదాహరణలను ప్రత్యక్షంగా చూడండి',
      scenariosSubtitle:
        'ఏదైనా కార్డ్‌పై "ఉదాహరణ చూడండి" నొక్కి రంగు మీటర్ ఎలా మారుతుందో గమనించండి.',
      openAll: 'మొత్తం 8 ఉదాహరణలు తెరవండి →',
      watchExample: 'ఉదాహరణ చూడండి',
      dangerLabel: 'ప్రమాదం',
      safeLabel: 'సురక్షితం',
      stopHangUp: 'ఆగండి & కాల్ కట్ చేయండి',
      normalMsg: 'సాధారణ సందేశం',
      callKicker: 'స్పీకర్‌ఫోన్ & రికార్డింగ్ తనిఖీ',
      callTitle: 'కాల్ పై అనుమానం ఉందా? మీ ఫోన్‌లోనే ScamShield విననివ్వండి.',
      callBody:
        'సేవ్ చేసిన కాల్ రికార్డింగ్ అప్‌లోడ్ చేయండి లేదా స్పీకర్ మోడ్‌లో ఉంచండి. మాటలను మీ ఫోన్‌లోనే రాసి వెంటనే హెచ్చరిస్తుంది.',
      openCallMode: 'కాల్ మోడ్ తెరవండి',
      callNote: 'ముందుగా అనుమతి అడుగుతుంది · ఆడియో బయటకు వెళ్లదు',
      privacyKicker: '100% గోప్యతతో రూపొందించబడింది',
      privacyTitle: 'మీరు టైప్ చేసినది లేదా మాట్లాడినది ఎప్పటికీ మీ పరికరం దాటి వెళ్లదు.',
      privacyBody:
        'అంతా మీ బ్రౌజర్‌లోనే నడుస్తుంది — సర్వర్ లేదు, సేవ్ చేసిన చరిత్ర లేదు. ఎప్పుడైనా సెషన్ తొలగించు నొక్కవచ్చు.',
      runsOn: 'నడిచేది',
      yourDevice: 'మీ పరికరం',
      dataSent: 'బయటకు పంపిన డేటా',
      savedHistory: 'సేవ్ చేసిన చరిత్ర',
      noneLabel: 'ఏదీ లేదు',
      inspectPrivacy: 'గోప్యత రుజువు చూడండి',
      helplineFooter: 'భారత సైబర్ హెల్ప్‌లైన్: 1930 · cybercrime.gov.in',
      openSpottingGuide: 'స్కామ్ గుర్తింపు గైడ్',
      spottingOverlay: {
        title: 'మోసాన్ని సులభంగా గుర్తించండి',
        subtitle: 'ఈ 5 సులభమైన ఎత్తుగడలు చూడండి. వినడానికి "వినండి" నొక్కండి.',
        hearCard: 'వినండి',
        stopCard: 'ఆపు',
        closeBtn: 'అర్థమైంది',
        checkNowBtn: 'ఇప్పుడే సందేశం తనిఖీ చేయండి',
        tricks: [
          {
            id: 'authority',
            title: 'నకిలీ అధికారి',
            trick: 'అంటారు: నేను బ్యాంక్ లేదా పోలీసుల నుండి మాట్లాడుతున్నాను.',
            action: 'కాల్ కట్ చేయండి. నిజమైన బ్యాంక్ భయపెట్టదు.',
          },
          {
            id: 'urgency',
            title: 'తొందరపెట్టే ఉచ్చు',
            trick: 'అంటారు: ఇప్పుడే డబ్బు పంపండి లేకుంటే ఖాతా బ్లాక్!',
            action: 'ఆగండి. తొందరలో ఏమీ చేయకండి.',
          },
          {
            id: 'fear',
            title: 'భయపెట్టే ఎత్తుగడ',
            trick: 'అరెస్ట్, జరిమానా లేదా కార్డ్ బ్లాక్ అని బెదిరిస్తారు.',
            action: 'భయపడకండి. ఇది నకిలీ భయం.',
          },
          {
            id: 'isolation',
            title: 'రహస్యంగా ఉంచమనడం',
            trick: 'అంటారు: ఫోన్ కట్ చేయకండి, ఎవరికీ చెప్పకండి.',
            action: 'వెంటనే కుటుంబానికి చెప్పండి.',
          },
          {
            id: 'payment',
            title: 'OTP & డబ్బు ఉచ్చు',
            trick: 'మీ OTP, PIN లేదా చిన్న ఫీజు అడుగుతారు.',
            action: 'ఎప్పుడూ OTP చెప్పకండి, డబ్బు పంపకండి.',
          },
        ],
      },
    },
    inbox: {
      title: 'ఇన్‌బాక్స్ & కాల్ జాబితా',
      newCheck: 'కొత్త తనిఖీ',
      checkCall: 'ఈ కాల్ తనిఖీ చేయి',
      searchPlaceholder: 'సందేశాలు లేదా పేర్లు వెతకండి...',
      filterAll: 'అన్నీ',
      filterRed: 'ప్రమాదం',
      filterAmber: 'జాగ్రత్త',
      filterGreen: 'సురక్షితం',
      noMatches: 'సరిపోయే సంభాషణలు లేవు.',
      senderPlaceholder: 'పంపినవారి పేరు...',
      startBtn: 'ప్రారంభించు',
    },
    chat: {
      playDemo: 'డెమో చూడు',
      stopDemo: 'ఆపు',
      hintText: 'కారణం తెలుసుకోవడానికి కింద గీత ఉన్న పదాలపై తాకండి.',
      cautionLegend: 'జాగ్రత్త',
      dangerLegend: 'ప్రమాదం',
      noMessages: 'ఇంకా సందేశాలు లేవు',
      waitingNext: 'తదుపరి సందేశం కోసం వేచి ఉంది...',
      emptyHint:
        'క్రింద SMS, WhatsApp లేదా కాల్ వాక్యాన్ని నమోదు చేయండి (తెలుగు, ఇంగ్లీష్, హిందీ, హింగ్లీష్, మరాఠీ).',
      incomingTab: 'వచ్చిన సందేశం (తనిఖీ)',
      replyTab: 'నా సమాధానం',
      quickTestLabel: 'త్వరిత పరీక్ష:',
      inputPlaceholderIncoming: 'అనుమానాస్పద SMS లేదా WhatsApp సందేశాన్ని ఇక్కడ రాయండి...',
      inputPlaceholderReply: 'మీ సమాధానం రాయండి...',
      analyzeBtn: 'తనిఖీ చేయి',
      markScam: 'స్కామ్ అని గుర్తించు',
      markSafe: 'సురక్షితం అని గుర్తించు',
      unseenTestChip: 'కొత్త స్కామ్ పరీక్ష',
    },
    risk: {
      safetyCheck: 'భద్రతా తనిఖీ',
      greenVerdict: 'సురక్షితం · మోసం లేదు',
      greenHint: 'సాధారణంగా కనిపిస్తోంది. అయినా అవసరం లేకుండా OTP చెప్పకండి.',
      amberVerdict: 'ఆగండి · జాగ్రత్తగా ఉండండి',
      amberHint: 'ఒత్తిడి పెరుగుతోంది. కుటుంబ సభ్యులను అడిగి నిర్ధారించుకోండి.',
      redVerdict: 'ఆపండి · వెంటనే కాల్ కట్ చేయండి',
      redHint: 'డబ్బు పంపకండి, OTP చెప్పకండి. 1930 లేదా బ్యాంక్ కార్డ్ నంబర్‌కు కాల్ చేయండి.',
      timelineTitle: 'మోసం దశల వరుస',
      stagesCount: 'దశలు',
      progressionTitle: 'సమయంతో పాటు ప్రమాద పెరుగుదల',
      messagesUnit: 'సందేశాలు',
      messageUnit: 'సందేశం',
      escalationBegan: 'ప్రమాదం మొదలైన దశ:',
      turnWord: 'వరుస',
      whatHappening: 'ఇక్కడ ఏమి జరుగుతోంది',
      tacticsSeen: 'గుర్తించిన పద్ధతులు:',
      recommendedActions: 'మీరు చేయాల్సినవి',
      stopVerify: 'ఆపి నిర్ధారించండి',
      helplineLabel: 'హెల్ప్‌లైన్: 1930',
      callHelplineCta: '1930 కు కాల్ చేయండి',
      signalsTitle: 'గుర్తించిన సంకేతాలు',
      aiSpansLabel: 'AI అర్థ గుర్తింపు',
      sequenceShiftsLabel: 'వరుస ఒత్తిడి',
      hardAlertsLabel: 'లింక్ / నంబర్ హెచ్చరిక',
      adaptTitle: 'కొత్త మోసాలు నేర్చుకోవడం (RAM లో)',
      adaptSubtitle: 'సర్వర్ లేకుండా ఫోన్ మెమరీలోనే కొత్త స్కామ్ లేదా సురక్షిత వాక్యాన్ని నేర్పండి.',
      adaptEmpty: 'ఇంకా కస్టమ్ వాక్యాలు లేవు. కింద కొత్త వాక్యాన్ని జోడించండి.',
      adaptPlaceholder: 'కొత్త స్కామ్ లేదా సురక్షిత వాక్యం రాయండి...',
      teachScamBtn: 'స్కామ్ నేర్పు',
      teachSafeBtn: 'సురక్షితం నేర్పు',
      hearExplanation: 'వివరణ వినండి',
      stopAudio: 'ఆపు',
      ttsUnsupported: 'ఈ బ్రౌజర్‌లో వాయిస్ ప్లేబ్యాక్ అందుబాటులో లేదు.',
      stages: {
        authority: 'అధికారి',
        urgency: 'తొందర',
        fear: 'భయం',
        isolation: 'రహస్యం',
        payment: 'డబ్బు/OTP',
      },
    },
    tactics: {
      authority: {
        label: 'నకిలీ అధికారి వేషం',
        shortLabel: 'అధికారి',
        reason: 'అధికారి: నమ్మకం కలిగించడానికి బ్యాంక్, పోలీస్ లేదా ప్రభుత్వ అధికారిగా నటిస్తున్నారు.',
      },
      urgency: {
        label: 'అత్యవసర ఒత్తిడి',
        shortLabel: 'తొందర',
        reason: 'తొందర: ఆలోచించే సమయం ఇవ్వకుండా వెంటనే చేయాలని ఒత్తిడి చేస్తున్నారు.',
      },
      fear: {
        label: 'భయం మరియు బెదిరింపు',
        shortLabel: 'భయం',
        reason: 'భయం: ఖాతా బ్లాక్, అరెస్ట్ లేదా కేసు పెడతామని భయపెడుతున్నారు.',
      },
      isolation: {
        label: 'ఎవరికీ చెప్పనివ్వకపోవడం',
        shortLabel: 'రహస్యం',
        reason: 'రహస్యం: కుటుంబ సభ్యులకు చెప్పవద్దని, కాల్ కట్ చేయవద్దని ఒత్తిడి చేస్తున్నారు.',
      },
      reward: {
        label: 'లాటరీ / బహుమతి ఆశ',
        shortLabel: 'బహుమతి',
        reason: 'బహుమతి: ఊహించని లాటరీ లేదా నగదు బహుమతి ఆశ చూపుతున్నారు.',
      },
      payment: {
        label: 'డబ్బు లేదా OTP అడగడం',
        shortLabel: 'డబ్బు/OTP',
        reason: 'డబ్బు/OTP: మీ OTP, PIN, KYC వివరాలు లేదా డబ్బు పంపమని అడుగుతున్నారు.',
      },
      remote_access: {
        label: 'రిమోట్ యాక్సెస్ / స్క్రీన్ షేర్',
        shortLabel: 'రిమోట్ యాప్',
        reason: 'రిమోట్ యాప్: AnyDesk లేదా స్క్రీన్ షేర్ యాప్ ద్వారా మీ ఫోన్ నియంత్రణ అడుగుతున్నారు.',
      },
    },
    explain: {
      noScamHeadline: 'ఎటువంటి మోసం క్రమం కనిపించలేదు',
      noScamBody: 'ఈ సంభాషణ సాధారణంగా ఉంది. ఇందులో అధికారుల బెదిరింపు, రహస్యం లేదా OTP అడగడం లేదు.',
      noScamAction: 'సాధారణంగా కొనసాగండి, కానీ అనుకోని చెల్లింపులను స్వయంగా నిర్ధారించుకోండి.',
      lowRiskHeadline: 'తక్కువ ప్రమాదం — ఒకే సాధారణ సంకేతం',
      lowRiskSingle: 'నిజమైన బ్యాంక్ లేదా డెలివరీ సందేశాల్లో భయం లేదా తొందర లేకుండా ఒక పదం ఉండవచ్చు.',
      lowRiskAction1: 'ఇప్పటివరకు మోసపూరిత క్రమం కనిపించలేదు.',
      lowRiskAction2: 'తర్వాత OTP, డబ్బు లేదా రహస్యం అడిగితే వెంటనే ఆపండి.',
      amberHeadline: 'జాగ్రత్త — మోసపూరిత ధోరణి మొదలవుతోంది',
      amberActions: [
        'ఆగండి, తొందరపడకండి — నిజమైన సంస్థలు తక్షణ ఒత్తిడి చేయవు.',
        'చాట్ లేదా కాల్‌లో మీ OTP, PIN లేదా KYC వివరాలు చెప్పకండి.',
        'మీ బ్యాంక్ కార్డ్ వెనుక ఉన్న నంబర్‌కు మీరే కాల్ చేసి నిర్ధారించుకోండి.',
      ],
      redHeadline: 'అధిక ప్రమాదం — మోసపూరిత క్రమం గుర్తించబడింది',
      redActions: [
        'ఎటువంటి వెరిఫికేషన్ ఫీజు లేదా డిపాజిట్ పంపకండి.',
        'మీ OTP, CVV, PIN లేదా ఆధార్/పాన్ వివరాలు చెప్పకండి.',
        'వెంటనే కాల్ కట్ చేయండి — పోలీసులు లేదా బ్యాంకులు ఎప్పుడూ "డిజిటల్ అరెస్ట్" చేయవు.',
        'మీ డెబిట్/క్రెడిట్ కార్డ్ వెనుక ముద్రించిన నంబర్‌కు బ్యాంకుకు కాల్ చేయండి.',
        'వెంటనే 1930 హెల్ప్‌లైన్ లేదా cybercrime.gov.in లో ఫిర్యాదు చేయండి.',
      ],
      remoteAccessAction: 'ఈ చాట్‌లో పంపిన AnyDesk, TeamViewer, QuickSupport లేదా APK లింక్‌ను ఇన్‌స్టాల్ చేయకండి.',
      phishingLinkAction: 'నకిలీ లేదా అనుమానాస్పద లింక్‌లలో బ్యాంక్ కార్డ్, పిన్ లేదా ఆధార్ వివరాలు నమోదు చేయకండి.',
      upiCollectAction: 'డబ్బు లేదా రిఫండ్ అందుకోవడానికి ఎప్పుడూ UPI Collect అభ్యర్థనను ఆమోదించకండి.',
      clauses: {
        authority: 'బ్యాంక్, పోలీస్ లేదా ప్రభుత్వ అధికారిగా నటించారు',
        reward: 'అకస్మాత్తుగా లాటరీ లేదా నగదు బహుమతి ఆశ చూపారు',
        urgency: 'ఆలోచించకుండా వెంటనే చేయాలని ఒత్తిడి చేశారు',
        fear: 'అరెస్ట్, ఖాతా బ్లాక్ లేదా చట్టపరమైన చర్యలని భయపెట్టారు',
        isolation: 'కాల్ కట్ చేయవద్దని, కుటుంబానికి చెప్పవద్దని కోరారు',
        payment: 'OTP, KYC వివరాలు లేదా డబ్బు పంపమని అడిగారు',
        remote_access: 'స్క్రీన్ షేరింగ్ లేదా రిమోట్-యాక్సెస్ యాప్ వేసుకోమన్నారు',
      },
      storyPrefix: 'వారు ముందుగా',
      storyThen: ', ఆ తర్వాత ',
      storyAndThen: ', చివరిగా ',
      warningPrefix: 'హెచ్చరిక:',
    },
    consent: {
      title: 'పరికరంలో కాల్ తనిఖీ అనుమతి',
      subtitle: '100% మీ ఫోన్‌లోనే మాటల మార్పిడి',
      question:
        'ఈ కాల్‌ను తనిఖీ చేయడానికి ScamShield ఆడియో వినవచ్చా? ఆడియో మీ పరికరంలోనే ప్రాసెస్ అవుతుంది, ఎక్కడా సేవ్ లేదా అప్‌లోడ్ కాదు.',
      bullet1: 'Whisper-tiny మీ బ్రౌజర్ Web Worker లోనే నడుస్తుంది',
      bullet2: 'క్లౌడ్ అప్‌లోడ్ లేదు · Google స్పీచ్ API లేదు · డిస్క్ సేవ్ లేదు',
      cancel: 'రద్దు చేయి',
      accept: 'అవును, పరికరంలో తనిఖీ చేయి',
    },
    callMode: {
      title: 'కాల్ మోడ్ — ఆన్-డివైస్ స్పీచ్ మానిటర్',
      subtitle: 'ప్రతి 5 సెకన్ల ఆడియో మీ పరికరంలోనే టెక్స్ట్‌గా మారి తనిఖీ అవుతుంది.',
      uploadTab: 'కాల్ రికార్డింగ్ అప్‌లోడ్ చేయి',
      micTab: 'లైవ్ స్పీకర్ మైక్',
      chooseFile: 'ఆడియో ఫైల్ ఎంచుకోండి',
      transcribing: '5 సెకన్ల భాగాలు రాయబడుతున్నాయి...',
      startLive: 'లైవ్ కాల్ తనిఖీ ప్రారంభించు',
      stopListening: 'వినడం ఆపు',
      guideTitle: 'అనుమానాస్పద కాల్‌ను సురక్షితంగా తనిఖీ చేసే విధానం',
      guideStep1: 'ఈ ఫోన్‌లోనే కాల్ వస్తే, స్పీకర్ ఆన్ చేసి దగ్గరలోని మరో పరికరంలో ScamShield తెరవండి. లేదా సేవ్ చేసిన కాల్ ఫైల్‌ను అప్‌లోడ్ చేయండి.',
      guideStep2: 'ప్రతి 5 సెకన్ల మాట మీ పరికరంలోనే తెలుగు, హిందీ లేదా ఇంగ్లీష్‌లో రాయబడుతుంది.',
      guideStep3: 'మీటర్ ఎరుపు రంగులోకి మారితే వెంటనే కాల్ కట్ చేసి 1930 కు కాల్ చేయండి.',
    },
    privacyPanel: {
      title: 'గోప్యత రుజువు & ఆన్-డివైస్ నిర్మాణం',
      subtitle: 'మీరు టైప్ చేసినా, అందుకున్నా లేదా మాట్లాడినా సర్వర్లు లేవు, నిల్వ లేదు.',
      wipeNow: 'ఇప్పుడే సెషన్ తొలగించు',
      processingLabel: 'ప్రాసెసింగ్',
      processingVal: '100% మీ పరికరంలోనే',
      processingDesc: 'MiniLM మరియు Whisper-tiny మీ బ్రౌజర్ Web Workers లోనే పనిచేస్తాయి.',
      networkLabel: 'వినియోగదారు డేటా నెట్‌వర్క్ అభ్యర్థనలు',
      networkVal: '0 అభ్యర్థనలు',
      networkDesc: 'క్లౌడ్ AI API లేదు, Web Speech API లేదు, ట్రాకింగ్ లేదు.',
      storageLabel: 'డేటా నిల్వ',
      storageVal: 'ఏదీ లేదు (RAM మాత్రమే)',
      engineLabel: 'సక్రియ AI ఇంజిన్',
      engineMiniLM: 'MiniLM-L12-v2 న్యూరల్ AI',
      engineLocal: 'ఆఫ్‌లైన్ 512-dim వెక్టర్ AI',
      engineRules: 'నియమాల ఇంజిన్',
      analyzedLabel: 'పరికరంలో తనిఖీలు',
      aiVsRuleLabel: 'AI vs నియమ గుర్తింపులు',
      latencyLabel: 'చివరి వర్కర్ వేగం',
      zeroBytesProof: 'బయటి సర్వర్‌లకు 0 బైట్లు పంపబడింది',
      selfTestTitle: 'లైవ్ ఆఫ్‌లైన్ & కొత్త స్కామ్ పరీక్ష',
      selfTestDesc: 'కీవర్డ్‌లు లేని కొత్త మోసపూరిత వాక్యాన్ని నెట్‌వర్క్ లేకుండా ఫోన్ Web Worker లోనే పరీక్షించండి.',
      selfTestBtn: 'ఆన్-డివైస్ AI పరీక్ష నడుపు',
      selfTestRunning: 'పరికరంలో తనిఖీ జరుగుతోంది...',
      selfTestPlaceholder: 'ఆఫ్‌లైన్ AI పరీక్ష కోసం కొత్త సందేశం రాయండి లేదా మార్చండి...',
    },
  },

  mr: {
    nav: {
      overview: 'मुख्य पान',
      inbox: 'इनबॉक्स',
      callMode: 'कॉल तपासणी',
      privacy: 'गोपनीयता पुरावा',
      wipe: 'सत्र पुसा',
      wipeShort: 'पुसा',
      wipedToast: 'सत्र साफ झाले — सर्व संदेश, ऑडिओ आणि शिकलेला डेटा मेमरीतून काढला.',
      offlineToast: 'ऑफलाइन मोड — इंटरनेटशिवाय तुमच्या डिव्हाइसवर चालू आहे',
    },
    overview: {
      kicker: 'खाजगी ऑन-डिव्हाइस स्कॅम डिटेक्टर · ऑफलाइनही चालते',
      heroTitle: 'पैसे पाठवण्यापूर्वी किंवा OTP सांगण्यापूर्वीच फसवणूक ओळखा.',
      heroBody:
        'खरे बँक अलर्ट आणि डिलिव्हरी मेसेज हिरवे राहतात. खोटे अधिकारी, घाई, गुपित ठेवण्याची अट आणि पैसे/OTP मागण्याचा डाव ScamShield तुमच्याच फोनवर टप्प्याटप्प्याने ओळखतो.',
      voiceGuideTitle: 'आवाजाने पान उघडा',
      voiceGuideBody:
        'खालील आवाज बटण दाबा आणि म्हणा: “मुख्यपृष्ठ उघडा”, “संदेश उघडा” किंवा “कॉल मोड”.',
      ctaInbox: 'मेसेज आता तपासा',
      ctaCall: 'फोन कॉल तपासा',
      greenLegend: 'हिरवा: सुरक्षित आहे',
      amberLegend: 'पिवळा: थांबा आणि तपासा',
      redLegend: 'लाल: कॉल कट करा, धोका आहे',
      guideKicker: 'सोपी सुरक्षा मार्गदर्शिका',
      guideTitle: 'सुरक्षित राहण्याचे ३ सोपे मार्ग',
      guideSubtitle: 'या ३ धोक्याच्या खुणा ओळखा. शंका असल्यास थांबा आणि तपासा.',
      step1Tag: '१. अनोळखी व्यक्ती संपर्क करते',
      step1Title: 'ती विश्वासू व्यक्ती असल्याचे भासवते',
      step1Body:
        'ती बँक, पोलीस किंवा सरकारी अधिकारी असल्याचे सांगू शकते.',
      step2Tag: '२. ती दबाव आणते',
      step2Title: 'ती घाबरवते किंवा घाई करायला लावते',
      step2Body:
        'ती धमकी देऊ शकते किंवा लगेच कृती करायला सांगू शकते. थांबा आणि विश्वासू व्यक्तीला विचारा.',
      step3Tag: '३. थांबा आणि तपासा',
      step3Title: 'OTP सांगू नका. पैसे पाठवू नका.',
      step3Body:
        'फोन ठेवा. बँकेच्या अधिकृत नंबरवर कॉल करा. पैसे गेले असतील तर १९३० वर कॉल करा.',
      scenariosTitle: 'खरे आणि खोटे उदाहरणे थेट तपासा',
      scenariosSubtitle:
        'कोणत्याही कार्डवर "उदाहरण पहा" दाबा आणि रंग मीटर कसा बदलतो ते पहा.',
      openAll: 'सर्व ८ उदाहरणे पहा →',
      watchExample: 'उदाहरण पहा',
      dangerLabel: 'धोका',
      safeLabel: 'सुरक्षित',
      stopHangUp: 'थांबा आणि फोन ठेवा',
      normalMsg: 'सामान्य मेसेज',
      callKicker: 'स्पीकरफोन आणि रेकॉर्डिंग तपासणी',
      callTitle: 'कॉलवर शंका आहे? ScamShield ला तुमच्या फोनवर ऐकू द्या.',
      callBody:
        'सेव्ह केलेली कॉल रेकॉर्डिंग अपलोड करा किंवा फोन स्पीकरवर ठेवा. ScamShield तुमच्याच डिव्हाइसवर संभाषण लिहून तात्काळ इशारा देतो.',
      openCallMode: 'कॉल तपासणी उघडा',
      callNote: 'आधी परवानगी मागतो · ऑडिओ कधीही बाहेर जात नाही',
      privacyKicker: '१००% खाजगी सुरक्षा',
      privacyTitle: 'तुम्ही जे टाइप करता किंवा बोलता ते कधीही फोनबाहेर जात नाही.',
      privacyBody:
        'सर्व काही तुमच्या ब्राउझरमध्ये चालते — कोणताही सर्व्हर नाही, कोणताही सेव्ह केलेला इतिहास नाही. सत्र पुसा दाबताच सर्व साफ होते.',
      runsOn: 'कुठे चालते',
      yourDevice: 'तुमचे डिव्हाइस',
      dataSent: 'बाहेर पाठवलेला डेटा',
      savedHistory: 'सेव्ह केलेला इतिहास',
      noneLabel: 'काहीही नाही',
      inspectPrivacy: 'गोपनीयता पुरावा पहा',
      helplineFooter: 'भारत सायबर हेल्पलाइन: १९३० · cybercrime.gov.in',
      openSpottingGuide: 'स्कॅम ओळखण्याची मार्गदर्शिका',
      spottingOverlay: {
        title: 'फसवणूक सोप्या पद्धतीने ओळखा',
        subtitle: 'हे ५ सोपे डाव पहा. ऐकण्यासाठी "ऐका" दाबा.',
        hearCard: 'ऐका',
        stopCard: 'थांबवा',
        closeBtn: 'समजले',
        checkNowBtn: 'आता मेसेज तपासा',
        tricks: [
          {
            id: 'authority',
            title: 'खोटा अधिकारी',
            trick: 'ते म्हणतात: मी बँक किंवा पोलिसांतून बोलत आहे.',
            action: 'फोन ठेवा. खरी बँक कधीच घाबरवत नाही.',
          },
          {
            id: 'urgency',
            title: 'घाईचा सापळा',
            trick: 'ते ओरडतात: आत्ताच पैसे द्या नाहीतर खाते बंद होईल!',
            action: 'थांबा आणि विचार करा. घाई करू नका.',
          },
          {
            id: 'fear',
            title: 'भीती दाखवण्याची युक्ती',
            trick: 'अटक, दंड किंवा कार्ड बंद करण्याची धमकी देतात.',
            action: 'घाबरू नका. ही खोटी भीती आहे.',
          },
          {
            id: 'isolation',
            title: 'गुपित ठेवण्याची अट',
            trick: 'ते म्हणतात: कोणालाही सांगू नका, फोन ठेवू नका.',
            action: 'लगेच घरच्यांना सांगा.',
          },
          {
            id: 'payment',
            title: 'OTP आणि पैशाचा सापळा',
            trick: 'ते तुमचा OTP, पिन किंवा छोटी फी मागतात.',
            action: 'कधीही OTP देऊ नका आणि पैसे पाठवू नका.',
          },
        ],
      },
    },
    inbox: {
      title: 'इनबॉक्स आणि कॉल लॉग',
      newCheck: 'नवीन तपासणी',
      checkCall: 'हा कॉल तपासा',
      searchPlaceholder: 'मेसेज किंवा नाव शोधा...',
      filterAll: 'सर्व',
      filterRed: 'धोका',
      filterAmber: 'सावधान',
      filterGreen: 'सुरक्षित',
      noMatches: 'कोणताही मेसेज सापडला नाही.',
      senderPlaceholder: 'पाठवणाऱ्याचे नाव...',
      startBtn: 'सुरू करा',
    },
    chat: {
      playDemo: 'डेमो चालवा',
      stopDemo: 'थांबवा',
      hintText: 'कारण पाहण्यासाठी अधोरेखित शब्दांवर क्लिक करा किंवा माउस न्या.',
      cautionLegend: 'सावधान',
      dangerLegend: 'धोका',
      noMessages: 'अजून कोणतेही मेसेज नाहीत',
      waitingNext: 'पुढच्या मेसेजची प्रतीक्षा...',
      emptyHint:
        'खाली कोणताही SMS, WhatsApp मेसेज किंवा कॉल वाक्य पेस्ट करा (मराठी, हिंदी, हिंग्लिश, तेलुगू, इंग्रजी).',
      incomingTab: 'आलेला मेसेज (तपासा)',
      replyTab: 'माझे उत्तर',
      quickTestLabel: 'झटपट चाचणी:',
      inputPlaceholderIncoming: 'संशयास्पद SMS किंवा WhatsApp मेसेज येथे लिहा...',
      inputPlaceholderReply: 'तुमचे उत्तर लिहा...',
      analyzeBtn: 'तपासा',
      markScam: 'स्कॅम म्हणून नोंदवा',
      markSafe: 'सुरक्षित म्हणून नोंदवा',
      unseenTestChip: 'नवीन अज्ञात चाचणी',
    },
    risk: {
      safetyCheck: 'सुरक्षा तपासणी',
      greenVerdict: 'सुरक्षित · फसवणूक नाही',
      greenHint: 'सामान्य मेसेज वाटतो. तरीही कारणाशिवाय OTP देऊ नका.',
      amberVerdict: 'थांबा · सावध राहा',
      amberHint: 'दबाव वाढवला जात आहे. कुटुंबातील कोणाचा तरी सल्ला घ्या.',
      redVerdict: 'थांबा · लगेच फोन ठेवा',
      redHint: 'पैसे किंवा OTP देऊ नका. १९३० किंवा बँक कार्डवरील नंबरवर कॉल करा.',
      timelineTitle: 'डावाची टाइमलाइन',
      stagesCount: 'टप्पे',
      progressionTitle: 'वेळेनुसार धोक्याचा आलेख',
      messagesUnit: 'मेसेज',
      messageUnit: 'मेसेज',
      escalationBegan: 'धोका सुरू झाला:',
      turnWord: 'टप्पा',
      whatHappening: 'येथे काय घडत आहे',
      tacticsSeen: 'सापडलेले डाव:',
      recommendedActions: 'आता काय करावे',
      stopVerify: 'थांबा आणि खात्री करा',
      helplineLabel: 'हेल्पलाइन: १९३०',
      callHelplineCta: '१९३० वर कॉल करा',
      signalsTitle: 'सापडलेले संकेत',
      aiSpansLabel: 'AI अर्थ ओळख',
      sequenceShiftsLabel: 'क्रमवार दबाव',
      hardAlertsLabel: 'लिंक / नंबर इशारा',
      adaptTitle: 'नवीन डाव शिकणे (RAM मध्ये)',
      adaptSubtitle: 'सर्व्हरशिवाय फोनच्या मेमरीमध्ये नवीन स्कॅम किंवा सुरक्षित वाक्य शिकवा.',
      adaptEmpty: 'अजून कोणतेही कस्टम वाक्य शिकवले नाही. खाली नवीन वाक्य जोडा.',
      adaptPlaceholder: 'नवीन स्कॅम किंवा सुरक्षित वाक्य टाइप करा...',
      teachScamBtn: 'स्कॅम शिकवा',
      teachSafeBtn: 'सुरक्षित शिकवा',
      hearExplanation: 'स्पष्टीकरण ऐका',
      stopAudio: 'थांबवा',
      ttsUnsupported: 'या ब्राउझरमध्ये आवाज सुविधा उपलब्ध नाही.',
      stages: {
        authority: 'अधिकारी',
        urgency: 'घाई',
        fear: 'भीती',
        isolation: 'गुपित',
        payment: 'पैसे/OTP',
      },
    },
    tactics: {
      authority: {
        label: 'खोटा अधिकारी बनणे',
        shortLabel: 'अधिकारी',
        reason: 'अधिकारी: विश्वास जिंकण्यासाठी बँक, पोलीस किंवा सरकारी अधिकारी असल्याचा दावा करत आहे.',
      },
      urgency: {
        label: 'तात्काळ घाईचा दबाव',
        shortLabel: 'घाई',
        reason: 'घाई: विचार करायला वेळ न देता लगेच पाऊल उचलण्याचा दबाव टाकत आहे.',
      },
      fear: {
        label: 'भीती आणि धमकी',
        shortLabel: 'भीती',
        reason: 'भीती: खाते बंद करणे, अटक किंवा कायदेशीर कारवाईची भीती दाखवत आहे.',
      },
      isolation: {
        label: 'एकटे पाडणे आणि गुपित ठेवणे',
        shortLabel: 'गुपित',
        reason: 'गुपित: कुटुंबाला किंवा कोणालाही सांगू नका आणि कॉल कट करू नका असे सांगत आहे.',
      },
      reward: {
        label: 'लॉटरी / बक्षिसाचे आमिष',
        shortLabel: 'बक्षीस',
        reason: 'बक्षीस: अनपेक्षित रोख बक्षीस किंवा लॉटरी जिंकल्याचे आमिष दाखवत आहे.',
      },
      payment: {
        label: 'पैसे किंवा OTP ची मागणी',
        shortLabel: 'पैसे/OTP',
        reason: 'पैसे/OTP: तुमचा OTP, PIN, KYC माहिती किंवा पैसे पाठवायला सांगत आहे.',
      },
      remote_access: {
        label: 'रिमोट-अ‍ॅक्सेस / स्क्रीन शेअर',
        shortLabel: 'रिमोट अ‍ॅप',
        reason: 'रिमोट अ‍ॅप: AnyDesk किंवा स्क्रीन-शेअर अ‍ॅपद्वारे तुमच्या फोनचा ताबा मागत आहे.',
      },
    },
    explain: {
      noScamHeadline: 'फसवणुकीचा कोणताही क्रम आढळला नाही',
      noScamBody: 'हे संभाषण सामान्य आहे. यात खोट्या अधिकाऱ्याचा दबाव, धमकी किंवा OTP मागणी नाही.',
      noScamAction: 'नेहमीप्रमाणे संवाद सुरू ठेवा आणि कोणत्याही अनपेक्षित पेमेंटची खात्री करा.',
      lowRiskHeadline: 'कमी धोका — फक्त एक सामान्य खूण',
      lowRiskSingle: 'खऱ्या बँक किंवा डिलिव्हरी संदेशात भीती किंवा घाईशिवाय एक सामान्य शब्द असू शकतो.',
      lowRiskAction1: 'अजूनपर्यंत फसवणुकीची मालिका आढळली नाही.',
      lowRiskAction2: 'पुढे OTP, पैसे किंवा गुपित ठेवण्यास सांगितले तर लगेच थांबा.',
      amberHeadline: 'सावधान — फसवणुकीची सुरुवात दिसत आहे',
      amberActions: [
        'थांबा आणि घाई करू नका — खऱ्या संस्था कधीही तात्काळ दबाव आणत नाहीत.',
        'चॅट किंवा फोनवर तुमचा OTP, PIN किंवा KYC देऊ नका.',
        'तुमच्या बँक कार्डच्या मागे असलेल्या नंबरवर स्वतः कॉल करून खात्री करा.',
      ],
      redHeadline: 'अति उच्च धोका — फसवणुकीचा संपूर्ण डाव पकडला',
      redActions: [
        'कोणतीही व्हेरिफिकेशन फी किंवा रक्कम पाठवू नका.',
        'तुमचा OTP, CVV, PIN किंवा आधार/पॅन तपशील सांगू नका.',
        'लगेच कॉल कट करा — पोलीस किंवा बँक कधीही "डिजिटल अटक" करत नाहीत.',
        'तुमच्या डेबिट/क्रेडिट कार्डच्या मागे असलेल्या टोल-फ्री नंबरवर बँकेला कॉल करा.',
        'लगेच १९३० हेल्पलाइन किंवा cybercrime.gov.in वर तक्रार नोंदवा.',
      ],
      remoteAccessAction: 'या चॅटमधील AnyDesk, TeamViewer, QuickSupport किंवा APK लिंक इन्स्टॉल करू नका.',
      phishingLinkAction: 'बनावट किंवा संशयास्पद लिंकवर बँक कार्ड, पिन किंवा आधार तपशील भरू नका.',
      upiCollectAction: 'पैसे मिळवण्यासाठी किंवा रिफंडसाठी कधीही UPI Collect विनंती मंजूर करू नका.',
      clauses: {
        authority: 'बँक, पोलीस किंवा सरकारी अधिकारी असल्याचा दावा केला',
        reward: 'अचानक लॉटरी किंवा मोठ्या बक्षिसाचे आमिष दाखवले',
        urgency: 'विचार करण्यापूर्वीच तात्काळ निर्णय घेण्यासाठी घाई केली',
        fear: 'अटक, खाते बंद होणे किंवा कारवाईची भीती घातली',
        isolation: 'कॉल कट करू नका आणि घरच्यांना सांगू नका असे बजावले',
        payment: 'OTP, KYC माहिती किंवा पैसे पाठवण्याची मागणी केली',
        remote_access: 'स्क्रीन-शेअरिंग किंवा रिमोट-अ‍ॅक्सेस अ‍ॅप टाकायला सांगितले',
      },
      storyPrefix: 'त्यांनी',
      storyThen: ', नंतर ',
      storyAndThen: ', आणि शेवटी ',
      warningPrefix: 'धोक्याची खूण:',
    },
    consent: {
      title: 'डिव्हाइसवर कॉल तपासणी परवानगी',
      subtitle: '१००% तुमच्याच फोनवर आवाजाचे लेखन',
      question:
        'हा कॉल तपासण्यासाठी ScamShield ने ऑडिओ ऐकावा का? ऑडिओ फक्त तुमच्याच डिव्हाइसवर तपासला जातो, कधीही सेव्ह किंवा अपलोड होत नाही.',
      bullet1: 'Whisper-tiny तुमच्या ब्राउझरच्या Web Worker मध्ये चालतो',
      bullet2: 'क्लाउड अपलोड नाही · Google स्पीच API नाही · डिस्कवर सेव्ह नाही',
      cancel: 'रद्द करा',
      accept: 'होय, डिव्हाइसवर तपासा',
    },
    callMode: {
      title: 'कॉल मोड — ऑन-डिव्हाइस स्पीच मॉनिटर',
      subtitle: 'प्रत्येक ५ सेकंदांचा ऑडिओ तुमच्या फोनवर लिहून तात्काळ तपासला जातो.',
      uploadTab: 'कॉल रेकॉर्डिंग अपलोड करा',
      micTab: 'लाइव्ह स्पीकर माइक',
      chooseFile: 'ऑडिओ फाइल निवडा',
      transcribing: '५ सेकंदांचे भाग लिहिले जात आहेत...',
      startLive: 'लाइव्ह कॉल तपासणी सुरू करा',
      stopListening: 'ऐकणे थांबवा',
      guideTitle: 'संशयास्पद कॉल सुरक्षितपणे कसा तपासावा',
      guideStep1: 'कॉल याच फोनवर असल्यास स्पीकर सुरू करा आणि जवळच्या दुसऱ्या डिव्हाइसवर ScamShield उघडा. किंवा सेव्ह केलेली कॉल फाइल निवडा.',
      guideStep2: 'प्रत्येक ५ सेकंदांचे बोलणे तुमच्याच डिव्हाइसवर लिहिले जाते.',
      guideStep3: 'मीटर लाल झाल्यास लगेच फोन ठेवा आणि १९३० किंवा बँक कार्डवरील नंबरवर कॉल करा.',
    },
    privacyPanel: {
      title: 'गोपनीयता पुरावा आणि ऑन-डिव्हाइस रचना',
      subtitle: 'तुम्ही जे टाइप करता, मिळवता किंवा बोलता त्यासाठी कोणताही सर्व्हर किंवा स्टोरेज नाही.',
      wipeNow: 'आत्ताच सत्र पुसा',
      processingLabel: 'प्रोसेसिंग',
      processingVal: '१००% ऑन-डिव्हाइस',
      processingDesc: 'MiniLM आणि Whisper-tiny तुमच्या ब्राउझर Web Workers मध्ये चालतात.',
      networkLabel: 'वापरकर्ता डेटा नेटवर्क विनंत्या',
      networkVal: '० विनंत्या',
      networkDesc: 'क्लाउड AI API नाही, Web Speech API नाही, ट्रॅकिंग नाही.',
      storageLabel: 'डेटा साठवणूक',
      storageVal: 'काहीही नाही (फक्त RAM)',
      engineLabel: 'सक्रिय AI इंजिन',
      engineMiniLM: 'MiniLM-L12-v2 न्यूरल AI',
      engineLocal: 'ऑफलाइन 256-dim वेक्टर AI',
      engineRules: 'नियम आधारित इंजिन',
      analyzedLabel: 'स्थानिक तपासण्या',
      aiVsRuleLabel: 'AI बनाम नियम ओळख',
      latencyLabel: 'शेवटचा वर्कर वेग',
      zeroBytesProof: 'बाहेरच्या सर्व्हरवर ० बाइट्स पाठवले',
      selfTestTitle: 'लाइव्ह ऑफलाइन आणि अज्ञात स्कॅम चाचणी',
      selfTestDesc: 'कीवर्ड नसलेल्या नवीन फसवणूक वाक्याची इंटरनेटशिवाय लोकल Web Worker वर चाचणी घ्या.',
      selfTestBtn: 'ऑन-डिव्हाइस AI चाचणी चालवा',
      selfTestRunning: 'लोकल तपासणी सुरू आहे...',
      selfTestPlaceholder: 'ऑफलाइन AI ओळख तपासण्यासाठी नवीन मेसेज लिहा किंवा बदला...',
    },
  },
};
