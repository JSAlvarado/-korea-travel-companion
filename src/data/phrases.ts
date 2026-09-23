import { Phrase } from '../types';

export const PHRASES: Phrase[] = [
  // 👋 Politeness & Daily Basics
  {
    id: 'b-1',
    category: 'basic',
    en: 'Hello / Good day.',
    ko: '안녕하세요.',
    roman: 'Annyeonghaseyo.',
    tips: 'Slight bow of the head is customary when greeting someone.'
  },
  {
    id: 'b-2',
    category: 'basic',
    en: 'Thank you very much.',
    ko: '감사합니다.',
    roman: 'Gamsahamnida.',
    tips: 'Use both hands or support your right forearm with your left hand when accepting items.'
  },
  {
    id: 'b-3',
    category: 'basic',
    en: 'I am sorry / Excuse me.',
    ko: '죄송합니다.',
    roman: 'Joesonghamnida.',
    tips: 'Use when bumping into someone or apologizing.'
  },
  {
    id: 'b-4',
    category: 'basic',
    en: 'Excuse me! (To get attention of waiter or clerk)',
    ko: '저기요!',
    roman: 'Jeogiyo!',
    tips: 'Shout this clearly in restaurants to call staff to your table.'
  },
  {
    id: 'b-5',
    category: 'basic',
    en: 'Yes / No.',
    ko: '네 / 아니요.',
    roman: 'Ne / Aniyo.',
    tips: '"Ne" can also mean "I understand" or "go on".'
  },
  {
    id: 'b-6',
    category: 'basic',
    en: 'Goodbye (When you are leaving).',
    ko: '안녕히 계세요.',
    roman: 'Annyeonghi gyeseyo.',
    tips: 'Literally: "Please stay peacefully."'
  },
  {
    id: 'b-7',
    category: 'basic',
    en: 'Goodbye (When the other person is leaving).',
    ko: '안녕히 가세요.',
    roman: 'Annyeonghi gaseyo.',
    tips: 'Literally: "Please go peacefully."'
  },
  {
    id: 'b-8',
    category: 'basic',
    en: 'I cannot speak Korean well.',
    ko: '한국말을 잘 못해요.',
    roman: 'Hangukmar-eul jal mothaeyo.',
    tips: 'Locals will appreciate the effort and speak slower or use a phone translator.'
  },
  {
    id: 'b-9',
    category: 'basic',
    en: 'Do you speak English?',
    ko: '영어 하실 수 있나요?',
    roman: 'Yeongeo hasil su innayo?',
    tips: 'Many younger Koreans understand basic English.'
  },
  {
    id: 'b-10',
    category: 'basic',
    en: 'Please write it down here.',
    ko: '여기에 적어주실 수 있나요?',
    roman: 'Yeogie jeogeojusil su innayo?',
    tips: 'Useful for prices, train numbers, or addresses.'
  },

  // 🚇 Transit & Navigation
  {
    id: 't-1',
    category: 'transit',
    en: 'Please take me to this address.',
    ko: '이 주소로 가주세요.',
    roman: 'I juso-ro gajuseyo.',
    tips: 'Show this to a taxi driver along with the Korean address in your app.'
  },
  {
    id: 't-2',
    category: 'transit',
    en: 'Where is the subway station?',
    ko: '지하철역이 어디에 있어요?',
    roman: 'Jihacheol-yeogi eodie isseoyo?',
    tips: 'Subway signs are marked with circled station numbers.'
  },
  {
    id: 't-3',
    category: 'transit',
    en: 'Please drop me off right here.',
    ko: '여기서 내려주세요.',
    roman: 'Yeogiseo naeryeojuseyo.',
    tips: 'Use in taxis when arriving at your corner.'
  },
  {
    id: 't-4',
    category: 'transit',
    en: 'Please turn on the meter.',
    ko: '미터기 켜주세요.',
    roman: 'Miteogi kyeojuseyo.',
    tips: 'All regular Korean taxis operate by meter; flat rates are rare.'
  },
  {
    id: 't-5',
    category: 'transit',
    en: 'Can I pay with T-Money?',
    ko: '티머니로 계산할 수 있나요?',
    roman: 'T-money-ro gyesanhal su innayo?',
    tips: 'Taxis, subways, buses, and convenience stores accept T-Money cards.'
  },
  {
    id: 't-6',
    category: 'transit',
    en: 'Does this train go to Daegu Station / Dongdaegu?',
    ko: '이 기차가 동대구역 가나요?',
    roman: 'I gichaga Dongdaegu-yeok ganayo?',
    tips: 'KTX trains stop at Dongdaegu (동대구), the primary high-speed hub.'
  },
  {
    id: 't-7',
    category: 'transit',
    en: 'Does this train go to Busan Station?',
    ko: '이 기차가 부산역 가나요?',
    roman: 'I gichaga Busan-yeok ganayo?',
    tips: 'KTX to Busan is the Gyeongbu line.'
  },
  {
    id: 't-8',
    category: 'transit',
    en: 'Which exit is this?',
    ko: '이게 몇 번 출구예요?',
    roman: 'Ige myeot beon chulgu-yeyo?',
    tips: 'Korean subway exits are clearly numbered (Exit 1, Exit 2, etc.).'
  },
  {
    id: 't-9',
    category: 'transit',
    en: 'Where can I recharge my T-Money card?',
    ko: '티머니 충전 어디서 해요?',
    roman: 'T-money chungjeon eodiseo haeyo?',
    tips: 'Recharge using cash at convenience stores (CU, GS25) or subway ticket machines.'
  },
  {
    id: 't-10',
    category: 'transit',
    en: 'Is this the platform for the opposite direction?',
    ko: '반대 방향 플랫폼인가요?',
    roman: 'Bandae banghyang peullaetpom-ingayo?',
    tips: 'Some older subway stations require going upstairs to switch directions.'
  },

  // 🏨 Hotel & 1-Month Residency Living
  {
    id: 'h-1',
    category: 'hotel',
    en: 'I have a reservation under this name.',
    ko: '이 이름으로 예약했습니다.',
    roman: 'I ireum-euro yeyakhaesseumnida.',
    tips: 'Show your passport and booking confirmation voucher.'
  },
  {
    id: 'h-2',
    category: 'hotel',
    en: 'Can I leave my luggage here for a few hours?',
    ko: '짐을 잠시 맡길 수 있을까요?',
    roman: 'Jimeul jamsi matgil su isseulkkayo?',
    tips: 'Hotels store luggage free of charge before check-in or after check-out.'
  },
  {
    id: 'h-3',
    category: 'hotel',
    en: 'What is the Wi-Fi password?',
    ko: '와이파이 비밀번호가 뭐예요?',
    roman: 'Waipai bimilbeonhoga mwoyeyo?',
    tips: 'Often printed on your room key envelope.'
  },
  {
    id: 'h-4',
    category: 'hotel',
    en: 'Where is the nearest coin laundromat?',
    ko: '가장 가까운 코인 빨래방이 어디예요?',
    roman: 'Gajang gakkaun koin ppallaebang-i eodiyeyo?',
    tips: 'Search "Coin Wash" or "Koin Ppallaebang" for 24-hour self-laundromats.'
  },
  {
    id: 'h-5',
    category: 'hotel',
    en: 'Where is the trash disposal area?',
    ko: '쓰레기 분리수거장이 어디예요?',
    roman: 'Sseuregi bunrisugeojang-i eodiyeyo?',
    tips: 'Korea has strict recycling rules: plastics, cans, paper, and food waste are separate.'
  },
  {
    id: 'h-6',
    category: 'hotel',
    en: 'Could you please call a taxi for me?',
    ko: '택시 한 대만 불러주시겠어요?',
    roman: 'Taeksi han daeman bulleo-jusigesseoyo?',
    tips: 'Front desks can call KakaoT for you.'
  },
  {
    id: 'h-7',
    category: 'hotel',
    en: 'Can I receive an online delivery/parcel here?',
    ko: '여기서 택배 받을 수 있나요?',
    roman: 'Yeogiseo taekbae badeul su innayo?',
    tips: 'Coupang or food delivery can often be dropped off at the lobby.'
  },
  {
    id: 'h-8',
    category: 'hotel',
    en: 'Could I get more towels, please?',
    ko: '수건 좀 더 주실 수 있나요?',
    roman: 'Su-geon jom deo jusil su innayo?',
    tips: 'Standard request at guesthouses and hotels.'
  },
  {
    id: 'h-9',
    category: 'hotel',
    en: 'How do I turn on the floor heating (Ondol)?',
    ko: '보일러 / 난방 어떻게 켜요?',
    roman: 'Boilleo / nanbang eotteoke kyeoyo?',
    tips: 'Korean homes have cozy radiant heated floors (Ondol).'
  },

  // 🍲 Food, Dining & Dietary
  {
    id: 'f-1',
    category: 'food',
    en: 'Water please.',
    ko: '물 좀 주세요.',
    roman: 'Mul jom juseyo.',
    tips: 'Water is almost always free and self-service in Korean restaurants.'
  },
  {
    id: 'f-2',
    category: 'food',
    en: 'Is this spicy?',
    ko: '이거 매워요?',
    roman: 'Igeo maewoyo?',
    tips: 'Ask this if you are sensitive to red pepper paste (Gochujang).'
  },
  {
    id: 'f-3',
    category: 'food',
    en: 'Please make it not spicy.',
    ko: '안 맵게 해주세요.',
    roman: 'An maepge haejuseyo.',
    tips: 'Essential phrase to tone down chili powder (Gochugaru).'
  },
  {
    id: 'f-4',
    category: 'food',
    en: 'Please remove all pork. (I do not eat pork)',
    ko: '돼지고기 빼주세요. (돼지고기 못 먹어요)',
    roman: 'Dwaejigogi bbaejuseyo. (Dwaejigogi mot meogeoyo)',
    tips: 'Crucial for halal, kosher, or pork allergy diets.'
  },
  {
    id: 'f-5',
    category: 'food',
    en: 'I am vegetarian. Does this contain meat or fish sauce?',
    ko: '채식주의자입니다. 고기나 액젓 들어가나요?',
    roman: 'Chaesikjuuija-imnida. Gogina aekjeot deureoganayo?',
    tips: 'Note: Many Korean kimchis use fish sauce (aekjeot).'
  },
  {
    id: 'f-6',
    category: 'food',
    en: 'I have a severe peanut / nut allergy.',
    ko: '견과류 / 땅콩 알레르기가 있어요.',
    roman: 'Gyeongwaryu / ttangkong allereugi-ga isseoyo.',
    tips: 'Show this card to the chef before ordering.'
  },
  {
    id: 'f-7',
    category: 'food',
    en: 'What is the most popular dish here?',
    ko: '여기서 제일 잘 나가는 메뉴가 뭐예요?',
    roman: 'Yeogiseo jeil jal naganeun menyuga mwoyeyo?',
    tips: 'Great when entering local alleyway restaurants.'
  },
  {
    id: 'f-8',
    category: 'food',
    en: 'Two servings of this, please.',
    ko: '이거 2인분 주세요.',
    roman: 'Igeo i-inbun juseyo.',
    tips: 'Korean BBQ and hotpot usually require at least a 2-person order.'
  },
  {
    id: 'f-9',
    category: 'food',
    en: 'Can we get a refill of the side dishes (Banchan)?',
    ko: '반찬 더 주실 수 있나요?',
    roman: 'Banchan deo jusil su innayo?',
    tips: 'Kimchi and side dishes are complimentary and refilled for free!'
  },
  {
    id: 'f-10',
    category: 'food',
    en: 'Delicious! Thank you for the food.',
    ko: '정말 맛있어요! 잘 먹었습니다.',
    roman: 'Jeongmal masisseoyo! Jal meogeosseumnida.',
    tips: 'Say this to the owner as you exit.'
  },
  {
    id: 'f-11',
    category: 'food',
    en: 'Check / Bill please. (We are ready to pay)',
    ko: '계산서 주세요 / 계산할게요.',
    roman: 'Gyesanseo juseyo / Gyesan-halgeyo.',
    tips: 'Pay at the front cash register near the door, not at the table.'
  },
  {
    id: 'f-12',
    category: 'food',
    en: 'Can I have an English menu, please?',
    ko: '영어 메뉴판 있나요?',
    roman: 'Yeongeo menyupan innayo?',
    tips: 'Many modern restaurants have tablet menus with an English button.'
  },

  // 🛍️ Shopping & Convenience Stores
  {
    id: 's-1',
    category: 'shopping',
    en: 'How much is this?',
    ko: '이거 얼마예요?',
    roman: 'Igeo eolmayeyo?',
    tips: 'Point at the item while asking.'
  },
  {
    id: 's-2',
    category: 'shopping',
    en: 'Can I pay with credit card?',
    ko: '카드 결제 돼요?',
    roman: 'Kadeu gyeolje dwaeyo?',
    tips: 'Over 99% of Korean stores accept foreign credit cards.'
  },
  {
    id: 's-3',
    category: 'shopping',
    en: 'Do I need a plastic bag? Yes, please give me one.',
    ko: '봉투 필요하세요? 네, 봉투 하나 주세요.',
    roman: 'Bongtu pillyohaseyo? Ne, bongtu hana juseyo.',
    tips: 'Plastic shopping bags cost ₩50 to ₩100 by law.'
  },
  {
    id: 's-4',
    category: 'shopping',
    en: 'Can I get an immediate Tax Refund?',
    ko: '즉시 택스 리펀 받을 수 있나요?',
    roman: 'Jeuksi taekseu ripeon badeul su innayo?',
    tips: 'Show your passport for immediate tax deduction on purchases over ₩15,000.'
  },
  {
    id: 's-5',
    category: 'shopping',
    en: 'Can I try this on in the fitting room?',
    ko: '입어봐도 돼요?',
    roman: 'Ibeobwado dwaeyo?',
    tips: 'Remove your shoes before entering fitting rooms in some boutiques.'
  },
  {
    id: 's-6',
    category: 'shopping',
    en: 'Receipt please.',
    ko: '영수증 주세요.',
    roman: 'Yeongsujeung juseyo.',
    tips: 'Cashiers often ask "Yeongsujeung beoryeodeurilkkayo?" (Should I throw away the receipt?). Say "Juseyo" if you want it.'
  },
  {
    id: 's-7',
    category: 'shopping',
    en: 'Can you give a little discount?',
    ko: '조금만 깎아주세요~',
    roman: 'Jogeumman kkakka-juseyo~',
    tips: 'Acceptable in traditional street markets (Namdaemun, Jagalchi, Seomun).'
  },

  // 🏥 Medical, Health & Pharmacy
  {
    id: 'm-1',
    category: 'medical',
    en: 'Where is the nearest pharmacy?',
    ko: '가장 가까운 약국이 어디예요?',
    roman: 'Gajang gakkaun yakguk-i eodiyeyo?',
    tips: 'Pharmacies are marked with a big red "약" (Yak) sign.'
  },
  {
    id: 'm-2',
    category: 'medical',
    en: 'I have a headache. Please give me painkillers.',
    ko: '머리가 아파요. 진통제 주세요.',
    roman: 'Meoriga apayo. Jintongje juseyo.',
    tips: 'Tylenol or ibuprofen is sold over the counter at pharmacies and CU/GS25.'
  },
  {
    id: 'm-3',
    category: 'medical',
    en: 'I have a stomachache and indigestion.',
    ko: '배가 아프고 소화가 안 돼요. 소화제 주세요.',
    roman: 'Baega apeugo sohwaga an dwaeyo. Sohwaje juseyo.',
    tips: 'Korean digestive drinks (like Whal Myung Su) work remarkably well.'
  },
  {
    id: 'm-4',
    category: 'medical',
    en: 'I have a cold and fever.',
    ko: '감기 기운이 있고 열이 나요.',
    roman: 'Gamgi gi-un-i itgo yeor-i nayo.',
    tips: 'Pharmacists will give you a 2-day packet of cold pills.'
  },
  {
    id: 'm-5',
    category: 'medical',
    en: 'Please give me adhesive bandages and antiseptic ointment.',
    ko: '대일밴드와 후시딘 연고 주세요.',
    roman: 'Dae-il baendeu-wa Fucidin yeongo juseyo.',
    tips: 'Fucidin is the most famous antibacterial ointment in South Korea.'
  },
  {
    id: 'm-6',
    category: 'medical',
    en: 'Is there a doctor who speaks English?',
    ko: '영어 가능한 의사 선생님 계신가요?',
    roman: 'Yeongeo ganeunghan uisa seonsaengnim gyesingayo?',
    tips: 'University hospitals (KNUH Daegu, PNUH Busan, Asan Seoul) have dedicated international clinics.'
  },
  {
    id: 'm-7',
    category: 'medical',
    en: 'I have motion sickness. Can I get motion sickness pills?',
    ko: '멀미약 주세요.',
    roman: 'Meolmiyak juseyo.',
    tips: 'Essential before taking the ferry to Jeju or coastal boats in Busan.'
  },

  // 🚨 Emergency & Security
  {
    id: 'e-1',
    category: 'emergency',
    en: 'Please help me! (Urgent)',
    ko: '도와주세요!',
    roman: 'Dowajuseyo!',
    tips: 'Use in real distress or emergencies.'
  },
  {
    id: 'e-2',
    category: 'emergency',
    en: 'Please call an ambulance (119)!',
    ko: '구급차를 불러주세요 (119)!',
    roman: 'Gugeupchareul bulleojuseyo (Il-il-gu)!',
    tips: 'Dial 119 in South Korea for Fire & Emergency Medical.'
  },
  {
    id: 'e-3',
    category: 'emergency',
    en: 'Please call the police (112)!',
    ko: '경찰을 불러주세요 (112)!',
    roman: 'Gyeongchar-eul bulleojuseyo (Il-il-i)!',
    tips: 'Dial 112 for Police dispatch.'
  },
  {
    id: 'e-4',
    category: 'emergency',
    en: 'I lost my passport.',
    ko: '여권을 잃어버렸어요.',
    roman: 'Yeogwon-eul ireobeoryeosseoyo.',
    tips: 'Report immediately to the nearest police substation (Chigulso).'
  },
  {
    id: 'e-5',
    category: 'emergency',
    en: 'I left my phone in the taxi!',
    ko: '택시에 핸드폰을 두고 내렸어요!',
    roman: 'Taeksie haendeupon-eul dugo naeryeosseoyo!',
    tips: 'If you paid by credit card or T-Money, the receipt has the taxi license and phone number.'
  },

  // 🏯 Daegu & Busan Special Dialect & Regional Expressions
  {
    id: 'db-1',
    category: 'daegu_busan',
    en: 'It is so delicious! (Gyeongsang-do Daegu dialect)',
    ko: '억수로 맛남데이! / 참 맛있네요.',
    roman: 'Eoksu-ro matnamdei! / Cham masin-neyeo.',
    tips: 'Daegu locals love hearing "Eoksu-ro" (억수로 = extremely/very).'
  },
  {
    id: 'db-2',
    category: 'daegu_busan',
    en: 'Busan Jagalchi Market slogan: "Come, Look, and Buy!"',
    ko: '오이소! 보이소! 사이소!',
    roman: 'O-iso! Bo-iso! Sa-iso!',
    tips: 'The famous greeting heard from vendors across Busan seafood markets.'
  },
  {
    id: 'db-3',
    category: 'daegu_busan',
    en: 'Where is the Daegu Makchang (Grilled Intestines) Street?',
    ko: '안지랑 곱창/막창 골목이 어디예요?',
    roman: 'Anjirang gopchang/makchang golmok-i eodiyeyo?',
    tips: 'Anjirang in Daegu is nationally famous for sizzling tender makchang.'
  },
  {
    id: 'db-4',
    category: 'daegu_busan',
    en: 'Please give us Dwaeji Gukbap (Busan Pork Soup Rice).',
    ko: '돼지국밥 한 그릇 주세요.',
    roman: 'Dwaeji gukbap han geureut juseyo.',
    tips: 'Busan iconic comfort food. Add chives (Buchu) and salted shrimp (Saeujeot).'
  },
  {
    id: 'db-5',
    category: 'daegu_busan',
    en: 'Does this subway line connect Dongdaegu and Banwoldang?',
    ko: '이 지하철이 반월당역 가나요?',
    roman: 'I jihacheol-i Banwoldang-yeok ganayo?',
    tips: 'Banwoldang Station is Daegu sole central transfer station between Line 1 and Line 2.'
  },
  {
    id: 'db-6',
    category: 'daegu_busan',
    en: 'Is Seomyeon or Haeundae faster by subway from here?',
    ko: '여기서 서면역이나 해운대역 지하철로 얼마나 걸려요?',
    roman: 'Yeogiseo Seomyeon-yeok-ina Haeundae-yeok jihacheol-ro eolmana geollyeoyo?',
    tips: 'Busan subway Line 2 connects Seomyeon (downtown) to Haeundae Beach in ~35 mins.'
  }
];
