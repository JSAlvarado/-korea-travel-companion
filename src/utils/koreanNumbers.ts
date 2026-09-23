/**
 * Korean Number & Currency Conversion Utility
 * Converts any numeric Won amount to authentic Sino-Korean & Native Korean words with Romanization.
 */

const SINO_DIGITS = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
const SINO_DIGITS_ROMAN = ['', 'il', 'i', 'sam', 'sa', 'o', 'yuk', 'chil', 'pal', 'gu'];

const NATIVE_DIGITS = ['', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];
const NATIVE_DIGITS_ROMAN = ['', 'hana', 'dul', 'set', 'net', 'daseot', 'yeoseot', 'ilgop', 'yeodeol', 'ahop', 'yeol'];

export interface KoreanNumberResult {
  amount: number;
  hangul: string;
  roman: string;
  breakdown: string;
  tips: string;
}

/**
 * Converts a number to Sino-Korean Won currency text (used for all prices, money, minutes, phone numbers)
 */
export function convertWonToKorean(amount: number): KoreanNumberResult {
  if (amount === 0) {
    return {
      amount: 0,
      hangul: '영 원',
      roman: 'yeong won',
      breakdown: '0 KRW',
      tips: 'Zero'
    };
  }

  const num = Math.floor(Math.abs(amount));
  if (num > 999999999) {
    return {
      amount: num,
      hangul: `${num.toLocaleString()} 원`,
      roman: `${num.toLocaleString()} won`,
      breakdown: 'Very large amount',
      tips: 'Over 1 billion KRW'
    };
  }

  // Korean large units: 만 (10,000), 억 (100,000,000)
  const eok = Math.floor(num / 100000000);
  const man = Math.floor((num % 100000000) / 10000);
  const remainder = num % 10000;

  function convertSub4(val: number): { hangul: string; roman: string } {
    if (val === 0) return { hangul: '', roman: '' };
    const thousands = Math.floor(val / 1000);
    const hundreds = Math.floor((val % 1000) / 100);
    const tens = Math.floor((val % 100) / 10);
    const ones = val % 10;

    const partsH: string[] = [];
    const partsR: string[] = [];

    if (thousands > 0) {
      if (thousands === 1) {
        partsH.push('천');
        partsR.push('cheon');
      } else {
        partsH.push(`${SINO_DIGITS[thousands]}천`);
        partsR.push(`${SINO_DIGITS_ROMAN[thousands]}-cheon`);
      }
    }

    if (hundreds > 0) {
      if (hundreds === 1) {
        partsH.push('백');
        partsR.push('baek');
      } else {
        partsH.push(`${SINO_DIGITS[hundreds]}백`);
        partsR.push(`${SINO_DIGITS_ROMAN[hundreds]}-baek`);
      }
    }

    if (tens > 0) {
      if (tens === 1) {
        partsH.push('십');
        partsR.push('sip');
      } else {
        partsH.push(`${SINO_DIGITS[tens]}십`);
        partsR.push(`${SINO_DIGITS_ROMAN[tens]}-sip`);
      }
    }

    if (ones > 0) {
      partsH.push(SINO_DIGITS[ones]);
      partsR.push(SINO_DIGITS_ROMAN[ones]);
    }

    return {
      hangul: partsH.join(' '),
      roman: partsR.join(' ')
    };
  }

  const chunksH: string[] = [];
  const chunksR: string[] = [];
  const breakdownParts: string[] = [];

  if (eok > 0) {
    const eokPart = convertSub4(eok);
    chunksH.push(`${eokPart.hangul || '일'}억`);
    chunksR.push(`${eokPart.roman || 'il'}-eok`);
    breakdownParts.push(`${eok}억 (×100M)`);
  }

  if (man > 0) {
    const manPart = convertSub4(man);
    if (man === 1 && chunksH.length === 0) {
      chunksH.push('만');
      chunksR.push('man');
    } else {
      chunksH.push(`${manPart.hangul}만`);
      chunksR.push(`${manPart.roman}-man`);
    }
    breakdownParts.push(`${man}만 (×10,000)`);
  }

  if (remainder > 0) {
    const remPart = convertSub4(remainder);
    chunksH.push(remPart.hangul);
    chunksR.push(remPart.roman);
    breakdownParts.push(`${remainder}`);
  }

  const finalHangul = `${chunksH.filter(Boolean).join(' ')} 원`;
  const finalRoman = `${chunksR.filter(Boolean).join(' ')} won`;

  let tip = 'Used for cash, card payments, food & taxi fares.';
  if (num >= 10000) {
    tip = `Korean currency is counted in units of 10,000 (만 / Man). ${num.toLocaleString()} KRW = ${man} Man ${remainder > 0 ? remainder.toLocaleString() : ''} Won.`;
  }

  return {
    amount: num,
    hangul: finalHangul.replace(/\s+/g, ' ').trim(),
    roman: finalRoman.replace(/\s+/g, ' ').trim(),
    breakdown: breakdownParts.join(' + ') + ' 원',
    tips: tip
  };
}

/**
 * Native Korean counters reference (e.g. for ordering beers, people, bottles)
 */
export const KOREAN_COUNTERS = [
  { item: 'People / Person', counter: '명 (Myeong)', example: '두 명 (Du myeong = 2 people)' },
  { item: 'Bottles (Beer, Soju, Water)', counter: '병 (Byeong)', example: '맥주 한 병 (Maekju han byeong = 1 beer bottle)' },
  { item: 'Cups / Glasses', counter: '잔 (Jan)', example: '아메리카노 두 잔 (Americano du jan = 2 cups of coffee)' },
  { item: 'Servings of Meat / Food', counter: '인분 (Inbun - Sino)', example: '삼겹살 2인분 (Samgyeopsal i-inbun = 2 portions)' },
  { item: 'Pieces / General Items', counter: '개 (Gae)', example: '이거 세 개 (Igeo se gae = 3 of this)' }
];
