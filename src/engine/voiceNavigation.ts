export type NavigableView = 'overview' | 'inbox' | 'call';

export type VoiceNavigationIntent =
  | { type: 'navigate'; view: NavigableView }
  | { type: 'help' | 'where' | 'stop' | 'clarify' | 'unavailable' | 'unknown' };

export function parseVoiceNavigationCommand(command: string): VoiceNavigationIntent {
  const text = command
    .toLowerCase()
    .replace(/[.,!?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (/(help|commands|madad|madad karo|sahayata|मदद|सहायता|निर्देश|సహాయం|సూచనలు|మదద్|madat|sahayya|सूचना|मदत|मदत करा)/.test(text)) {
    return { type: 'help' };
  }
  if (/(where am i|current page|main kaha|mai kaha|abhi kaha|कौन सा पृष्ठ|मैं कहाँ|నేను ఎక్కడ|నేను ఎక్కడ ఉన్నాను|mi kuthe|sadhya konte page|मी कुठे|सध्या कोणते पान)/.test(text)) {
    return { type: 'where' };
  }
  if (/(stop listening|stop voice|sunna band|sunna roko|ruko|रुक|रोकिए|सुनना बंद|ఆపు|వినడం ఆపు|వినడం ఆపండి|thamba|thambva|ऐकणे थांबवा|थांबा)/.test(text)) {
    return { type: 'stop' };
  }

  if (/(inbox|messages?|sms|whatsapp|sandesh|sandesha|संदेश|मैसेज|మెసేజ్|సందేశాలు|ఇన్‌బాక్స్|इनबॉक्स|निरोप)/.test(text)) {
    return { type: 'navigate', view: 'inbox' };
  }
  if (/(call mode|phone call|voice call|calls?|phone|फोन|कॉल|కాల్|ఫోన్|ఫోన్ కాల్|फोन मोड|दूरध्वनी)/.test(text)) {
    return { type: 'navigate', view: 'call' };
  }
  if (/(privacy|privacy proof|safety|suraksha|gopniyata|सुरक्षा|गोपनीयता|భద్రత|గోప్యత|ప్రైవసీ|सुरक्षित|खाजगीपणा)/.test(text)) {
    return { type: 'unavailable' };
  }
  if (/(overview|home|homepage|dashboard|main page|go back|back to home|ghar|mukhya|mukhya prushtha|मुख्य पृष्ठ|होम|घर|मुख्यपृष्ठ|హోమ్|ప్రధాన పేజీ|ముఖ్య పేజీ|mukhyapana|मुख्यपान|मुख्य पान)/.test(text)) {
    return { type: 'navigate', view: 'overview' };
  }

  if (/(go|open|show|take me|navigate|switch|into|page|jao|kholo|dikhao|ja|खोल|दिखाओ|जाओ|पृष्ठ|వెళ్ళు|తెరువు|చూపించు|తీసుకెళ్ళు|उघड|दाखव|जा|पान)/.test(text)) {
    return { type: 'clarify' };
  }
  return { type: 'unknown' };
}
