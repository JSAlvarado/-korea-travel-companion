import { EmergencyContact } from '../types';

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'sos-112',
    titleEn: 'Police Emergency',
    titleKo: '경찰청 긴급신고 (112)',
    number: '112',
    description: 'Crime, theft, assault, lost items, traffic accidents. Free English translation service connected automatically.',
    isPrimary: true,
    category: 'national',
    badge: 'National Police'
  },
  {
    id: 'sos-119',
    titleEn: 'Fire & Medical Ambulance',
    titleKo: '소방 및 응급의료 (119)',
    number: '119',
    description: 'Fire, medical emergency, sudden illness, ambulance dispatch. 24/7 multilingual interpretation support available.',
    isPrimary: true,
    category: 'medical',
    badge: 'Ambulance & Fire'
  },
  {
    id: 'sos-1330',
    titleEn: 'Korea Travel Hotline (24/7)',
    titleKo: '한국관광공사 통역·안내 (1330)',
    number: '1330',
    description: 'Toll-free 24/7 tourist assistance, three-way live interpretation between you and taxi drivers, tour guides, or police in English.',
    isPrimary: true,
    category: 'tourist',
    badge: 'Tourist Assistance'
  },
  {
    id: 'sos-1339',
    titleEn: 'Korea Disease Control & Medical Info',
    titleKo: '질병관리청 콜센터 (1339)',
    number: '1339',
    description: 'Emergency health guidance, foreign patient hospital coordination, infectious diseases, and prescription assistance.',
    category: 'medical',
    badge: 'Medical Guidance'
  },
  // Major Embassies in Seoul
  {
    id: 'embassy-us',
    titleEn: 'U.S. Embassy in Seoul',
    titleKo: '주한미국대사관',
    number: '02-397-4114',
    description: 'Gwanghwamun, Jongno-gu, Seoul. 24-hour emergency assistance for American citizens.',
    category: 'embassy',
    badge: 'Embassy'
  },
  {
    id: 'embassy-ph',
    titleEn: 'Philippine Embassy in Seoul',
    titleKo: '주한필리핀대사관',
    number: '02-796-7387',
    description: 'Yongsan-gu, Seoul. 24/7 Assistance to Nationals (ATN) Emergency Hotline: 010-9263-7387.',
    category: 'embassy',
    badge: 'Embassy'
  },
  {
    id: 'embassy-uk',
    titleEn: 'British Embassy Seoul',
    titleKo: '주한영국대사관',
    number: '02-3210-5500',
    description: 'Jeong-dong, Jung-gu, Seoul. 24/7 consular emergency support for British nationals.',
    category: 'embassy',
    badge: 'Embassy'
  },
  {
    id: 'embassy-au',
    titleEn: 'Australian Embassy Seoul',
    titleKo: '주한호주대사관',
    number: '02-2003-0100',
    description: 'Jongno-gu, Seoul. 24-hour Consular Emergency Centre support.',
    category: 'embassy',
    badge: 'Embassy'
  },
  {
    id: 'embassy-ca',
    titleEn: 'Canadian Embassy Seoul',
    titleKo: '주한캐나다대사관',
    number: '02-3783-6000',
    description: 'Jung-gu, Seoul. Emergency consular assistance for Canadian citizens.',
    category: 'embassy',
    badge: 'Embassy'
  }
];

export const KOREAN_MEDICAL_TERMS = [
  { en: 'Hospital', ko: '병원', roman: 'Byeong-won' },
  { en: 'Emergency Room (ER)', ko: '응급실', roman: 'Eung-geup-sil' },
  { en: 'Pharmacy', ko: '약국', roman: 'Yak-guk' },
  { en: 'Headache / Fever Medicine', ko: '두통약 / 해열제', roman: 'Dutong-yak / Haeyeol-je' },
  { en: 'Stomach Pain / Digestive Pill', ko: '소화제 / 위장약', roman: 'Sohwa-je / Wijang-yak' },
  { en: 'Band-aid / Ointment', ko: '대일밴드 / 연고', roman: 'Dae-il baendeu / Yeon-go' },
  { en: 'Motion Sickness Pill', ko: '멀미약', roman: 'Meolmi-yak' },
  { en: 'Peanut Allergy', ko: '땅콩 알레르기', roman: 'Ttang-kong alle-reugi' },
  { en: 'Seafood Allergy', ko: '해산물 알레르기', roman: 'Haesan-mul alle-reugi' },
];
