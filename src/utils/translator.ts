/**
 * Bilingual Korean ⇄ English Travel Translation Engine
 * Works completely offline for hundreds of travel expressions,
 * with optional real-time online auto-translation fallback (zero API key needed).
 */

export interface TranslationResult {
  sourceText: string;
  translatedText: string;
  romanization: string;
  isOffline: boolean;
  notes?: string;
}

// Built-in offline travel dictionary (English -> Korean + Romanization)
export const OFFLINE_DICTIONARY: Record<string, { ko: string; roman: string; notes?: string }> = {
  // Greetings & Basics
  'hello': { ko: '안녕하세요', roman: 'Annyeonghaseyo', notes: 'Standard polite greeting' },
  'hi': { ko: '안녕하세요', roman: 'Annyeonghaseyo' },
  'good morning': { ko: '좋은 아침입니다 / 안녕하세요', roman: 'Joeun achimimnida / Annyeonghaseyo' },
  'thank you': { ko: '감사합니다', roman: 'Gamsahamnida', notes: 'Most polite thank you' },
  'thanks': { ko: '고마워요 / 감사합니다', roman: 'Gomawoyo / Gamsahamnida' },
  'excuse me': { ko: '저기요 / 실례합니다', roman: 'Jeogiyo / Sillyehamnida', notes: 'Use "Jeogiyo" to call a waiter' },
  'sorry': { ko: '죄송합니다', roman: 'Joesonghamnida' },
  'yes': { ko: '네', roman: 'Ne' },
  'no': { ko: '아니요', roman: 'Aniyo' },
  'please': { ko: '부탁합니다 / 주세요', roman: 'Butakhamnida / Juseyo' },
  'goodbye': { ko: '안녕히 계세요', roman: 'Annyeonghi gyeseyo', notes: 'When you are leaving' },
  'bye': { ko: '안녕히 가세요', roman: 'Annyeonghi gaseyo', notes: 'When the other person is leaving' },

  // Directions & Where is
  'where is': { ko: '어디에 있어요?', roman: 'Eodie isseoyo?' },
  'where is the bathroom': { ko: '화장실이 어디에 있어요?', roman: 'Hwajangsil-i eodie isseoyo?' },
  'bathroom': { ko: '화장실', roman: 'Hwajangsil' },
  'restroom': { ko: '화장실', roman: 'Hwajangsil' },
  'toilet': { ko: '화장실', roman: 'Hwajangsil' },
  'where is the subway station': { ko: '지하철역이 어디에 있어요?', roman: 'Jihacheol-yeogi eodie isseoyo?' },
  'subway station': { ko: '지하철역', roman: 'Jihacheol-yeok' },
  'bus stop': { ko: '버스 정류장', roman: 'Beoseu jeongryujang' },
  'train station': { ko: '기차역', roman: 'Gichayeok' },
  'airport': { ko: '공항', roman: 'Gonghang' },
  'exit': { ko: '출구', roman: 'Chulgu' },
  'entrance': { ko: '입구', roman: 'Ipgu' },
  'straight': { ko: '직진', roman: 'Jikjin' },
  'left': { ko: '왼쪽', roman: 'Oenjjok' },
  'right': { ko: '오른쪽', roman: 'Oreunjjok' },
  'here': { ko: '여기', roman: 'Yeogi' },
  'there': { ko: '거기', roman: 'Geogi' },

  // Transport & Taxi
  'please take me here': { ko: '여기로 가주세요.', roman: 'Yeogiro gajuseyo.' },
  'please take me to this address': { ko: '이 주소로 가주세요.', roman: 'I jusoro gajuseyo.' },
  'taxi': { ko: '택시', roman: 'Taeksi' },
  'please drop me off here': { ko: '여기서 내려주세요.', roman: 'Yeogiseo naeryeojuseyo.' },
  'stop here': { ko: '여기서 세워주세요.', roman: 'Yeogiseo sewojuseyo.' },
  'meter': { ko: '미터기', roman: 'Miteogi' },
  'turn on the meter': { ko: '미터기 켜주세요.', roman: 'Miteogi kyeojuseyo.' },
  't-money': { ko: '티머니 카드', roman: 'T-money kadeu' },
  'ktx': { ko: 'KTX 고속철도', roman: 'KTX gosokcheoldo' },
  'seoul station': { ko: '서울역', roman: 'Seoul-yeok' },
  'daegu': { ko: '대구', roman: 'Daegu' },
  'busan': { ko: '부산', roman: 'Busan' },
  'dongseongno': { ko: '동성로', roman: 'Dongseongno' },
  'haeundae': { ko: '해운대', roman: 'Haeundae' },

  // Food & Dining
  'water': { ko: '물', roman: 'Mul' },
  'water please': { ko: '물 좀 주세요.', roman: 'Mul jom juseyo.' },
  'not spicy': { ko: '안 맵게', roman: 'An maepge' },
  'please make it not spicy': { ko: '안 맵게 해주세요.', roman: 'An maepge haejuseyo.' },
  'is this spicy': { ko: '이거 매워요?', roman: 'Igeo maewoyo?' },
  'delicious': { ko: '맛있어요', roman: 'Masisseoyo' },
  'check please': { ko: '계산서 주세요.', roman: 'Gyesanseo juseyo.' },
  'bill please': { ko: '계산서 주세요 / 계산할게요.', roman: 'Gyesanseo juseyo / Gyesanhalgeyo' },
  'menu': { ko: '메뉴판', roman: 'Menyupan' },
  'english menu': { ko: '영어 메뉴판 있어요?', roman: 'Yeongeo menyupan isseoyo?' },
  'no pork': { ko: '돼지고기 빼주세요.', roman: 'Dwaejigogi bbaejuseyo.', notes: 'Crucial for halal/vegetarian' },
  'i cannot eat pork': { ko: '돼지고기 못 먹어요.', roman: 'Dwaejigogi mot meogeoyo.' },
  'i have a peanut allergy': { ko: '땅콩 알레르기가 있어요.', roman: 'Ttankong allereugi-ga isseoyo.' },
  'vegetarian': { ko: '채식주의자입니다 / 고기 빼주세요.', roman: 'Chaesikjuuija-imnida / Gogi bbaejuseyo.' },
  'halal': { ko: '할랄 음식 있어요?', roman: 'Hallal eumsik isseoyo?' },
  'rice': { ko: '밥 / 공깃밥', roman: 'Bap / Gong-gitbap' },
  'chicken': { ko: '치킨 / 닭고기', roman: 'Chikin / Dakgogi' },
  'beef': { ko: '소고기', roman: 'Sogogi' },
  'pork': { ko: '돼지고기', roman: 'Dwaejigogi' },
  'coffee': { ko: '커피', roman: 'Keopi' },
  'beer': { ko: '맥주', roman: 'Maekju' },
  'soju': { ko: '소주', roman: 'Soju' },
  'napkin': { ko: '휴지 / 냅킨 주세요.', roman: 'Hyuji / Naepkin juseyo.' },
  'spoon': { ko: '숟가락', roman: 'Sutgarak' },
  'chopsticks': { ko: '젓가락', roman: 'Jeotgarak' },

  // Shopping & Money
  'how much': { ko: '얼마예요?', roman: 'Eolmayeyo?' },
  'how much is this': { ko: '이거 얼마예요?', roman: 'Igeo eolmayeyo?' },
  'credit card': { ko: '카드 결제 돼요?', roman: 'Kadeu gyeolje dwaeyo?' },
  'cash': { ko: '현금', roman: 'Hyeongeum' },
  'receipt': { ko: '영수증 주세요.', roman: 'Yeongsujeung juseyo.' },
  'tax refund': { ko: '택스 리펀 되나요?', roman: 'Taekseu ripeon doenayo?' },
  'discount': { ko: '할인 되나요?', roman: 'Harin doenayo?' },
  'bag': { ko: '봉투 필요하세요? / 봉투 주세요.', roman: 'Bongtu pillyohaseyo? / Bongtu juseyo.' },
  'plastic bag': { ko: '비닐봉투 주세요.', roman: 'Binilbongtu juseyo.' },

  // Hotel & 1-Month Stay
  'hotel': { ko: '호텔', roman: 'Hotel' },
  'check in': { ko: '체크인 할게요.', roman: 'Chekeu-in halgeyo.' },
  'check out': { ko: '체크아웃 할게요.', roman: 'Chekeu-aut halgeyo.' },
  'luggage': { ko: '짐 맡길 수 있을까요?', roman: 'Jim matgil su isseulkkayo?' },
  'wifi password': { ko: '와이파이 비밀번호가 뭐예요?', roman: 'Waipai bimilbeonhoga mwoyeyo?' },
  'convenience store': { ko: '편의점이 어디예요?', roman: 'Pyeon-uijeomi eodiyeyo?' },
  'laundromat': { ko: '코인 빨래방이 어디예요?', roman: 'Koin ppallaebang-i eodiyeyo?' },
  'laundry': { ko: '세탁 / 빨래', roman: 'Setak / Ppallae' },
  'trash bag': { ko: '종량제 쓰레기 봉투', roman: 'Jongryangje sseuregi bongtu', notes: 'Required government trash bags' },
  'towel': { ko: '수건 더 주세요.', roman: 'Su-geon deo juseyo.' },
  'air conditioner': { ko: '에어컨', roman: 'Eeokeon' },
  'heater': { ko: '난방 / 온돌', roman: 'Nanbang / Ondol' },

  // Medical & Emergency
  'help': { ko: '도와주세요!', roman: 'Dowajuseyo!' },
  'police': { ko: '경찰서 / 경찰관', roman: 'Gyeongchalseo / Gyeongchalgwan' },
  'hospital': { ko: '병원', roman: 'Byeong-won' },
  'pharmacy': { ko: '약국', roman: 'Yakguk' },
  'emergency': { ko: '응급실 / 도와주세요', roman: 'Eunggeupsil / Dowajuseyo' },
  'headache': { ko: '머리가 아파요 (두통약)', roman: 'Meoriga apayo (Dutongyak)' },
  'stomachache': { ko: '배가 아파요 (소화제)', roman: 'Baega apayo (Sohwaje)' },
  'bandaid': { ko: '대일밴드 / 반창고', roman: 'Dae-il baendeu / Banchanggo' },
  'painkiller': { ko: '진통제 주세요.', roman: 'Jintongje juseyo.' },
  'fever': { ko: '열이 나요.', roman: 'Yeor-i nayo.' },
  'english speaking doctor': { ko: '영어 가능한 의사 선생님 계신가요?', roman: 'Yeongeo ganeunghan uisa seonsaengnim gyesingayo?' },
  'i lost my passport': { ko: '여권을 잃어버렸어요.', roman: 'Yeogwoneul ireobeoryeosseoyo.' },
  'i lost my phone': { ko: '핸드폰을 잃어버렸어요.', roman: 'Haendeuponeul ireobeoryeosseoyo.' }
};

// Korean to English dictionary (Reverse Lookup)
const KO_TO_EN_DICT: Record<string, string> = {
  '안녕하세요': 'Hello / Good day',
  '감사합니다': 'Thank you very much',
  '고맙습니다': 'Thank you',
  '죄송합니다': 'I am sorry / Excuse me',
  '네': 'Yes',
  '아니요': 'No',
  '얼마예요': 'How much is it?',
  '어디예요': 'Where is it?',
  '화장실': 'Restroom / Bathroom',
  '물': 'Water',
  '계산서': 'Bill / Receipt',
  '영수증': 'Receipt',
  '카드': 'Card (Credit/Debit)',
  '현금': 'Cash',
  '봉투 필요하세요': 'Do you need a shopping bag? (say "Ne" for yes or "Aniyo" for no)',
  '포장': 'Takeout / To go',
  '드시고 가세요': 'For here / Dine in',
  '출구': 'Exit',
  '입구': 'Entrance',
  '지하철': 'Subway',
  '병원': 'Hospital / Clinic',
  '약국': 'Pharmacy',
  '편의점': 'Convenience store',
  '도와주세요': 'Please help me!'
};

/**
 * Basic automatic romanization helper for Hangul
 */
export function approximateRomanization(hangul: string): string {
  // Common vocabulary romanization map
  const commonMap: Record<string, string> = {
    '안녕하세요': 'Annyeonghaseyo',
    '감사합니다': 'Gamsahamnida',
    '죄송합니다': 'Joesonghamnida',
    '화장실': 'Hwajangsil',
    '어디에 있어요': 'Eodie isseoyo',
    '얼마예요': 'Eolmayeyo',
    '물 좀 주세요': 'Mul jom juseyo',
    '안 맵게 해주세요': 'An maepge haejuseyo',
    '여기로 가주세요': 'Yeogiro gajuseyo',
    '대구': 'Daegu',
    '부산': 'Busan',
    '서울': 'Seoul'
  };

  for (const [k, v] of Object.entries(commonMap)) {
    if (hangul.includes(k)) return v;
  }
  return 'Hangul text';
}

/**
 * Performs English ⇄ Korean translation with instant offline dictionary
 * and fallback to free public translation service (no API keys required).
 */
export async function translateTravelText(
  inputText: string,
  direction: 'en-ko' | 'ko-en' = 'en-ko'
): Promise<TranslationResult> {
  const cleanInput = inputText.trim();
  if (!cleanInput) {
    return {
      sourceText: '',
      translatedText: '',
      romanization: '',
      isOffline: true
    };
  }

  const lowerInput = cleanInput.toLowerCase().replace(/[?!.,]/g, '').trim();

  // 1. Direct match from offline dictionary
  if (direction === 'en-ko') {
    if (OFFLINE_DICTIONARY[lowerInput]) {
      const match = OFFLINE_DICTIONARY[lowerInput];
      return {
        sourceText: cleanInput,
        translatedText: match.ko,
        romanization: match.roman,
        isOffline: true,
        notes: match.notes
      };
    }

    // Partial key check
    for (const [key, val] of Object.entries(OFFLINE_DICTIONARY)) {
      if (lowerInput.includes(key) && key.length > 3) {
        return {
          sourceText: cleanInput,
          translatedText: val.ko,
          romanization: val.roman,
          isOffline: true,
          notes: val.notes
        };
      }
    }
  } else {
    // ko-en lookup
    for (const [k, v] of Object.entries(KO_TO_EN_DICT)) {
      if (cleanInput.includes(k)) {
        return {
          sourceText: cleanInput,
          translatedText: v,
          romanization: approximateRomanization(cleanInput),
          isOffline: true
        };
      }
    }
  }

  // 2. Online translation fallback via free public translation service
  try {
    const langpair = direction === 'en-ko' ? 'en|ko' : 'ko|en';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanInput)}&langpair=${langpair}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.responseData && data.responseData.translatedText) {
        const translated = data.responseData.translatedText;
        return {
          sourceText: cleanInput,
          translatedText: translated,
          romanization: direction === 'en-ko' ? approximateRomanization(translated) : '',
          isOffline: false
        };
      }
    }
  } catch (err) {
    // Network offline or timeout, fall back gracefully
  }

  // 3. Fallback if network unavailable and no match
  if (direction === 'en-ko') {
    return {
      sourceText: cleanInput,
      translatedText: `[한국어] ${cleanInput}`,
      romanization: 'English phrase',
      isOffline: true,
      notes: 'Offline: Select a preset phrase below or speak closer to mic.'
    };
  } else {
    return {
      sourceText: cleanInput,
      translatedText: cleanInput,
      romanization: '',
      isOffline: true
    };
  }
}
