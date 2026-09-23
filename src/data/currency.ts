import { CurrencyRate } from '../types';

export const CURRENCY_RATES: CurrencyRate[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', rateToKrw: 1350 },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', rateToKrw: 1470 },
  { code: 'JPY', name: 'Japanese Yen (100¥)', symbol: '¥', flag: '🇯🇵', rateToKrw: 9.15 }, // 100 JPY ≈ 915 KRW
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭', rateToKrw: 23.8 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳', rateToKrw: 188 },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', rateToKrw: 1750 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', rateToKrw: 890 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦', rateToKrw: 990 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬', rateToKrw: 1040 },
  { code: 'TWD', name: 'New Taiwan Dollar', symbol: 'NT$', flag: '🇹🇼', rateToKrw: 42 },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰', rateToKrw: 173 },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭', rateToKrw: 39 },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾', rateToKrw: 305 },
  { code: 'VND', name: 'Vietnamese Dong (1,000₫)', symbol: '₫', flag: '🇻🇳', rateToKrw: 0.054 }
];

export const KOREA_PRICE_GUIDE = [
  {
    category: 'Transit & Basics',
    items: [
      { name: 'Subway / City Bus Single Base Fare', krw: 1400, note: 'With T-Money card (₩1,500 with cash single ticket)' },
      { name: 'T-Money Card Empty Purchase', krw: 4000, note: 'Available at all convenience stores, non-refundable card price' },
      { name: 'AREX All-Stop Train (Incheon T1 to Seoul Station)', krw: 4750, note: 'Runs every 10 mins, takes ~59 mins' },
      { name: 'AREX Express Non-Stop Train', krw: 11000, note: 'Reserved seats, free Wi-Fi, takes 43 mins' },
      { name: 'Base Taxi Fare (Seoul Standard)', krw: 4800, note: 'First 1.6km, +20% late night surcharge (22:00 - 04:00)' }
    ]
  },
  {
    category: 'Daily Food & Street Snacks',
    items: [
      { name: 'Convenience Store Triangular Kimbap (Samgak)', krw: 1300, note: 'Tuna Mayo, Jeonju Bibimbap flavors popular' },
      { name: 'Street Food: Tteokbokki + Odeng Cup', krw: 4500, note: 'Warm spicy rice cakes & fishcake soup' },
      { name: 'Iced Americano at Cafe (Mega/Mega/Ediya)', krw: 2000, note: 'Standard Korean grab-and-go drink' },
      { name: 'Convenience Store Dosirak (Bento Lunchbox)', krw: 5200, note: 'Hearty meal with pork, rice, banchan side dishes' },
      { name: 'Casual Korean Restaurant (Kimbap Cheonguk)', krw: 8500, note: 'Bibimbap, Pork Cutlet (Donkatsu), Sundubu Jjigae' },
      { name: 'Korean BBQ Pork Belly (Samgyeopsal, per person)', krw: 16000, note: 'Usually 2-order minimum required per table' },
      { name: 'Korean Fried Chicken + Draft Beer (Chimaek)', krw: 24000, note: 'Whole chicken serving for 2 people' }
    ]
  },
  {
    category: 'Tourism & Culture',
    items: [
      { name: 'Royal Palace Admission (Gyeongbokgung)', krw: 3000, note: 'Free admission if you wear traditional Hanbok!' },
      { name: 'Hanbok 2-Hour Rental + Hair Styling', krw: 20000, note: 'Shops next to Gyeongbokgung and Bukchon' },
      { name: 'N Seoul Tower Observatory Ticket', krw: 21000, note: 'Mount Namsan park grounds around tower are free' },
      { name: 'Lotte World Theme Park Full Day Pass', krw: 62000, note: 'Discounted if booked online in advance' }
    ]
  }
];

export const TAX_REFUND_INFO = {
  minPurchaseKrw: 15000,
  maxImmediateKrw: 1000000,
  estimatedVatRate: 0.07, // Approx 6-8% effective cash back after administration fee
  requirements: [
    'Bring your physical passport when shopping.',
    'Look for stores displaying "Tax Free", "Global Blue", or "Tax Refund" signs.',
    'Immediate Tax Refund: The tax is deducted on the spot at checkout for purchases between ₩15,000 and ₩1,000,000.',
    'Airport Refund: Keep receipts and scan at Airport Kiosks (Incheon T1 Gate 28 / T2 Gate 249) before departure.'
  ]
};
