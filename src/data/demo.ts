export interface DemoMessage {
  id: string;
  sender: 'them' | 'me' | 'caller';
  text: string;
  timestamp: string;
}

export interface DemoConversation {
  id: string;
  title: string;
  handle: string;
  channel: 'SMS' | 'WhatsApp' | 'Voice Call';
  category: 'legitimate' | 'scam';
  summary: string;
  messages: DemoMessage[];
}

export const DEMO_CONVERSATIONS: DemoConversation[] = [
  {
    id: 'demo-bank-alert',
    title: 'HDFC Bank Alerts',
    handle: 'VM-HDFCBK',
    channel: 'SMS',
    category: 'legitimate',
    summary: 'Real bank debit alert with official domain',
    messages: [
      {
        id: 'ba-1',
        sender: 'them',
        timestamp: '10:14 AM',
        text: 'HDFC Bank: Rs 1,450.00 debited from a/c **4821 on 20-11-26 to Zomato via UPI (Ref 632418902114). Not you? Call 1800-202-6161 or visit hdfcbank.com.',
      },
      {
        id: 'ba-2',
        sender: 'them',
        timestamp: '10:14 AM',
        text: 'Available balance in a/c **4821 is Rs 24,812.50. Thank you for banking with us.',
      },
    ],
  },
  {
    id: 'demo-delivery-otp',
    title: 'BlueDart Express',
    handle: 'AX-BLUDRT',
    channel: 'SMS',
    category: 'legitimate',
    summary: 'Legitimate doorstep delivery OTP notice',
    messages: [
      {
        id: 'do-1',
        sender: 'them',
        timestamp: '11:05 AM',
        text: 'Your BlueDart parcel AWB #774920184 is out for delivery today with rider Ramesh.',
      },
      {
        id: 'do-2',
        sender: 'them',
        timestamp: '11:06 AM',
        text: 'Share OTP 4918 ONLY with the delivery partner at your doorstep when handing over your parcel. Do not share over phone.',
      },
    ],
  },
  {
    id: 'demo-friend-chat',
    title: 'Aarav Menon',
    handle: '+91 98450 11209',
    channel: 'WhatsApp',
    category: 'legitimate',
    summary: 'Casual lunch plans with UPI split mention',
    messages: [
      {
        id: 'fc-1',
        sender: 'them',
        timestamp: '12:42 PM',
        text: 'Hey! Are we still on for lunch at 1:30 near Indiranagar?',
      },
      {
        id: 'fc-2',
        sender: 'me',
        timestamp: '12:43 PM',
        text: 'Yes! Leaving office in 10 mins.',
      },
      {
        id: 'fc-3',
        sender: 'them',
        timestamp: '12:44 PM',
        text: "Nice, I'll grab a table first and we can split the bill on UPI after.",
      },
    ],
  },
  {
    id: 'demo-kyc-sms',
    title: 'SBI-YONO Alert',
    handle: '+91 98001 12233',
    channel: 'SMS',
    category: 'scam',
    summary: 'Fake KYC-expiry SMS with lookalike phishing domain',
    messages: [
      {
        id: 'kyc-1',
        sender: 'them',
        timestamp: '02:10 PM',
        text: 'Dear SBI Customer, your YONO KYC has expired today. Your bank account will be blocked within 2 hours.',
      },
      {
        id: 'kyc-2',
        sender: 'them',
        timestamp: '02:11 PM',
        text: 'Update your PAN & Aadhaar immediately at https://sbi-kyc-update.xyz/verify and enter the 6-digit OTP to restore access.',
      },
    ],
  },
  {
    id: 'demo-digital-arrest',
    title: 'Inspector Verma (Cyber Cell)',
    handle: '+91 80009 91122',
    channel: 'Voice Call',
    category: 'scam',
    summary: 'Fake police "digital arrest" extortion call',
    messages: [
      {
        id: 'da-1',
        sender: 'caller',
        timestamp: '03:15 PM',
        text: 'This is Inspector Rajesh Verma from Mumbai Cyber Crime Cell. A parcel in your name with illegal passports was seized by Customs.',
      },
      {
        id: 'da-2',
        sender: 'caller',
        timestamp: '03:16 PM',
        text: 'You are under digital arrest under CBI supervision. Do not disconnect this call or inform your family or anyone, as this is a confidential investigation.',
      },
      {
        id: 'da-3',
        sender: 'caller',
        timestamp: '03:17 PM',
        text: 'To clear your name and avoid an immediate arrest warrant, transfer Rs 45,000 verification deposit to RBI escrow UPI cyberverify@okaxis right now.',
      },
    ],
  },
  {
    id: 'demo-lottery',
    title: 'KBC Official Desk',
    handle: '+91 70004 45566',
    channel: 'WhatsApp',
    category: 'scam',
    summary: 'Lottery prize lure with secrecy & processing fee',
    messages: [
      {
        id: 'lot-1',
        sender: 'them',
        timestamp: '04:02 PM',
        text: 'CONGRATULATIONS! Your mobile number won Rs 25,00,000 in the KBC Jio Lucky Draw! Official Winner ID: KBC-9921.',
      },
      {
        id: 'lot-2',
        sender: 'them',
        timestamp: '04:03 PM',
        text: 'Offer valid for next 30 minutes only. Keep your prize code secret from others until the claim completes.',
      },
      {
        id: 'lot-3',
        sender: 'them',
        timestamp: '04:04 PM',
        text: 'Pay Rs 2,500 processing & GST fee via UPI to kbc.claimdesk@ybl or share your bank details to release Rs 25 Lakh immediately.',
      },
    ],
  },
  {
    id: 'demo-hinglish-bank',
    title: 'Rahul (HDFC Fraud Desk)',
    handle: '+91 98001 12233',
    channel: 'Voice Call',
    category: 'scam',
    summary: 'Hinglish bank-officer impersonation + OTP / AnyDesk',
    messages: [
      {
        id: 'hb-1',
        sender: 'caller',
        timestamp: '05:20 PM',
        text: 'Namaste sir, main HDFC Fraud Department se Rahul bol raha hoon. Aapke credit card pe Rs 48,000 ka suspicious transaction try hua hai.',
      },
      {
        id: 'hb-2',
        sender: 'caller',
        timestamp: '05:21 PM',
        text: 'Agar aapne yeh nahi kiya toh turant card block karwana hoga, warna paise kat jayenge. Kisi ko call pe mat batayein jab tak verification chal raha hai.',
      },
      {
        id: 'hb-3',
        sender: 'caller',
        timestamp: '05:22 PM',
        text: 'Abhi aapke phone pe ek 6-digit OTP aaya hoga, jaldi bataiye ya AnyDesk app install kijiye refund cancel karne ke liye.',
      },
    ],
  },
  {
    id: 'demo-slow-burn',
    title: 'Telecom Care (Slow-Burn)',
    handle: '+91 80009 91122',
    channel: 'Voice Call',
    category: 'scam',
    summary: 'Starts polite & harmless, escalates over 6 turns',
    messages: [
      {
        id: 'sb-1',
        sender: 'caller',
        timestamp: '06:01 PM',
        text: "Hello, am I speaking with Ananya? Hi, this is Vikram calling from your telecom provider's customer care desk.",
      },
      {
        id: 'sb-2',
        sender: 'caller',
        timestamp: '06:02 PM',
        text: "I just wanted to check if your mobile signal has been clear in your area after yesterday's tower maintenance.",
      },
      {
        id: 'sb-3',
        sender: 'caller',
        timestamp: '06:03 PM',
        text: 'Actually, our compliance system flagged that your Aadhaar-linked SIM has a duplicate registration notice from TRAI.',
      },
      {
        id: 'sb-4',
        sender: 'caller',
        timestamp: '06:04 PM',
        text: 'Because of the new directive, your primary number and linked bank UPI will be suspended at 6 PM today if not verified.',
      },
      {
        id: 'sb-5',
        sender: 'caller',
        timestamp: '06:05 PM',
        text: "Please stay on the line and don't mention this verification to family members while the TRAI officer joins the call.",
      },
      {
        id: 'sb-6',
        sender: 'caller',
        timestamp: '06:06 PM',
        text: 'To stop the disconnection right now, install QuickSupport and read out the 6-digit OTP you just received.',
      },
    ],
  },
];
