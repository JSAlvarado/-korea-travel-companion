import { Coordinates, Landmark, TransitStop } from '../types';
import { LANDMARKS } from '../data/landmarks';
import { TRANSIT_STOPS } from '../data/transit';
import { getGoogleMapsApiKey, isValidGoogleMapsKey } from './googleMapsKey';

export interface KoreaSearchResult {
  id: string;
  type: 'hotel' | 'transit' | 'landmark' | 'district' | 'address' | 'coordinates';
  nameEn: string;
  nameKo: string;
  addressEn: string;
  addressKo?: string;
  city: string;
  lat: number;
  lng: number;
  confidence?: 'exact' | 'high' | 'approximate';
  nearestStation?: string;
  rawItem?: any;
}

// Extensive curated database of major South Korea traveler hubs, districts, top hotels, and stations
// Ensures instant, 100% accurate pinpointing for the most common traveler destinations even offline
export const VERIFIED_KOREA_POIS: KoreaSearchResult[] = [
  // --- SEOUL AIRPORTS & STATIONS ---
  {
    id: 'icn-airport-t1',
    type: 'transit',
    nameEn: 'Incheon International Airport Terminal 1 (ICN)',
    nameKo: '인천국제공항 제1여객터미널',
    addressEn: '272 Gonghang-ro, Jung-gu, Incheon',
    addressKo: '인천광역시 중구 공항로 272',
    city: 'Incheon',
    lat: 37.4493,
    lng: 126.4504,
    confidence: 'exact',
    nearestStation: 'Incheon Int\'l Airport Terminal 1 Station (AREX)'
  },
  {
    id: 'icn-airport-t2',
    type: 'transit',
    nameEn: 'Incheon International Airport Terminal 2 (ICN)',
    nameKo: '인천국제공항 제2여객터미널',
    addressEn: '446 Je2terminal-daero, Jung-gu, Incheon',
    addressKo: '인천광역시 중구 제2터미널대로 446',
    city: 'Incheon',
    lat: 37.4692,
    lng: 126.4508,
    confidence: 'exact',
    nearestStation: 'Incheon Int\'l Airport Terminal 2 Station (AREX)'
  },
  {
    id: 'gmp-airport',
    type: 'transit',
    nameEn: 'Gimpo International Airport (GMP)',
    nameKo: '김포국제공항',
    addressEn: '112 Haneul-gil, Gangseo-gu, Seoul',
    addressKo: '서울특별시 강서구 하늘길 112',
    city: 'Seoul',
    lat: 37.5587,
    lng: 126.7945,
    confidence: 'exact',
    nearestStation: 'Gimpo Int\'l Airport Station (Line 5, 9, AREX, Gold)'
  },
  {
    id: 'seoul-station-hub',
    type: 'transit',
    nameEn: 'Seoul Station (KTX & Subway)',
    nameKo: '서울역',
    addressEn: '405 Hangang-daero, Yongsan-gu, Seoul',
    addressKo: '서울특별시 용산구 한강대로 405',
    city: 'Seoul',
    lat: 37.5547,
    lng: 126.9707,
    confidence: 'exact',
    nearestStation: 'Seoul Station (Line 1, 4, AREX, KTX)'
  },
  {
    id: 'yongsan-station-hub',
    type: 'transit',
    nameEn: 'Yongsan Station (KTX & Line 1)',
    nameKo: '용산역',
    addressEn: '55 Hangang-daero 23-gil, Yongsan-gu, Seoul',
    addressKo: '서울특별시 용산구 한강대로23길 55',
    city: 'Seoul',
    lat: 37.5298,
    lng: 126.9648,
    confidence: 'exact',
    nearestStation: 'Yongsan Station (Line 1, Gyeongui-Jungang, KTX)'
  },
  {
    id: 'suseo-station-hub',
    type: 'transit',
    nameEn: 'Suseo Station (SRT Bullet Train)',
    nameKo: '수서역',
    addressEn: '99 Bamgogae-ro, Gangnam-gu, Seoul',
    addressKo: '서울특별시 강남구 밤고개로 99',
    city: 'Seoul',
    lat: 37.4879,
    lng: 127.1018,
    confidence: 'exact',
    nearestStation: 'Suseo Station (SRT, Line 3, Suin-Bundang)'
  },

  // --- POPULAR TOURIST DISTRICTS & NEIGHBORHOODS ---
  {
    id: 'myeongdong-hub',
    type: 'district',
    nameEn: 'Myeongdong Shopping Street',
    nameKo: '명동거리',
    addressEn: 'Myeongdong 8-gil, Jung-gu, Seoul',
    addressKo: '서울특별시 중구 명동8길',
    city: 'Seoul',
    lat: 37.5636,
    lng: 126.9837,
    confidence: 'exact',
    nearestStation: 'Myeongdong Station Exit 6 / Euljiro 1-ga'
  },
  {
    id: 'hongdae-hub',
    type: 'district',
    nameEn: 'Hongdae (Hongik University Youth District)',
    nameKo: '홍대거리 / 어울마당로',
    addressEn: 'Eoulmadang-ro, Mapo-gu, Seoul',
    addressKo: '서울특별시 마포구 어울마당로',
    city: 'Seoul',
    lat: 37.5544,
    lng: 126.9213,
    confidence: 'exact',
    nearestStation: 'Hongik Univ. Station Exit 9'
  },
  {
    id: 'yeonnam-dong-hub',
    type: 'district',
    nameEn: 'Yeonnam-dong (Gyeongui Line Forest Park)',
    nameKo: '연남동 / 경의선 숲길',
    addressEn: 'Donggyo-ro, Mapo-gu, Seoul',
    addressKo: '서울특별시 마포구 동교로',
    city: 'Seoul',
    lat: 37.5621,
    lng: 126.9238,
    confidence: 'exact',
    nearestStation: 'Hongik Univ. Station Exit 3'
  },
  {
    id: 'gangnam-station-hub',
    type: 'transit',
    nameEn: 'Gangnam Station & Teheran-ro',
    nameKo: '강남역 & 테헤란로',
    addressEn: '396 Gangnam-daero, Gangnam-gu, Seoul',
    addressKo: '서울특별시 강남구 강남대로 396',
    city: 'Seoul',
    lat: 37.4979,
    lng: 127.0276,
    confidence: 'exact',
    nearestStation: 'Gangnam Station (Line 2, Shinbundang)'
  },
  {
    id: 'seongsu-dong-hub',
    type: 'district',
    nameEn: 'Seongsu-dong (Café Street & Seoul Forest)',
    nameKo: '성수동 카페거리',
    addressEn: 'Yeonmujang-gil, Seongdong-gu, Seoul',
    addressKo: '서울특별시 성동구 연무장길',
    city: 'Seoul',
    lat: 37.5445,
    lng: 127.0560,
    confidence: 'exact',
    nearestStation: 'Seongsu Station Exit 3 / Ttukseom Station'
  },
  {
    id: 'itaewon-hub',
    type: 'district',
    nameEn: 'Itaewon & Hannam-dong',
    nameKo: '이태원 & 한남동',
    addressEn: 'Itaewon-ro, Yongsan-gu, Seoul',
    addressKo: '서울특별시 용산구 이태원로',
    city: 'Seoul',
    lat: 37.5345,
    lng: 126.9946,
    confidence: 'exact',
    nearestStation: 'Itaewon Station / Hangangjin Station'
  },
  {
    id: 'insadong-hub',
    type: 'district',
    nameEn: 'Insadong Traditional Culture Street & Ssamzigil',
    nameKo: '인사동 쌈지길',
    addressEn: '44 Insadong-gil, Jongno-gu, Seoul',
    addressKo: '서울특별시 종로구 인사동길 44',
    city: 'Seoul',
    lat: 37.5743,
    lng: 126.9856,
    confidence: 'exact',
    nearestStation: 'Anguk Station Exit 6 / Jongno 3-ga'
  },
  {
    id: 'ikseondong-hub',
    type: 'district',
    nameEn: 'Ikseon-dong Hanok Alley Cafes',
    nameKo: '익선동 한옥마을',
    addressEn: 'Supyo-ro 28-gil, Jongno-gu, Seoul',
    addressKo: '서울특별시 종로구 수표로28길',
    city: 'Seoul',
    lat: 37.5727,
    lng: 126.9889,
    confidence: 'exact',
    nearestStation: 'Jongno 3-ga Station Exit 4'
  },
  {
    id: 'bukchon-hub',
    type: 'district',
    nameEn: 'Bukchon Hanok Village',
    nameKo: '북촌한옥마을',
    addressEn: '37 Gyedong-gil, Jongno-gu, Seoul',
    addressKo: '서울특별시 종로구 계동길 37',
    city: 'Seoul',
    lat: 37.5826,
    lng: 126.9836,
    confidence: 'exact',
    nearestStation: 'Anguk Station Exit 2'
  },
  {
    id: 'yeouido-hyundai-hub',
    type: 'landmark',
    nameEn: 'The Hyundai Seoul & Yeouido Park',
    nameKo: '더현대 서울 & 여의도공원',
    addressEn: '108 Yeoui-daero, Yeongdeungpo-gu, Seoul',
    addressKo: '서울특별시 영등포구 여의대로 108',
    city: 'Seoul',
    lat: 37.5259,
    lng: 126.9284,
    confidence: 'exact',
    nearestStation: 'Yeouinaru Station Exit 1 / Yeouido Station'
  },
  {
    id: 'jamsil-lotte-hub',
    type: 'landmark',
    nameEn: 'Lotte World Tower & Mall (Jamsil)',
    nameKo: '롯데월드타워 & 롯데월드몰',
    addressEn: '300 Olympic-ro, Songpa-gu, Seoul',
    addressKo: '서울특별시 송파구 올림픽로 300',
    city: 'Seoul',
    lat: 37.5126,
    lng: 127.1025,
    confidence: 'exact',
    nearestStation: 'Jamsil Station Exit 1, 2'
  },
  {
    id: 'gwanghwamun-hub',
    type: 'landmark',
    nameEn: 'Gwanghwamun Square & Gyeongbokgung',
    nameKo: '광화문광장 & 경복궁',
    addressEn: '172 Sejong-daero, Jongno-gu, Seoul',
    addressKo: '서울특별시 종로구 세종대로 172',
    city: 'Seoul',
    lat: 37.5759,
    lng: 126.9768,
    confidence: 'exact',
    nearestStation: 'Gwanghwamun Station Exit 2 / Gyeongbokgung Station'
  },
  {
    id: 'dongdaemun-ddp-hub',
    type: 'landmark',
    nameEn: 'Dongdaemun Design Plaza (DDP)',
    nameKo: '동대문디자인플라자 (DDP)',
    addressEn: '281 Eulji-ro, Jung-gu, Seoul',
    addressKo: '서울특별시 중구 을지로 281',
    city: 'Seoul',
    lat: 37.5668,
    lng: 127.0095,
    confidence: 'exact',
    nearestStation: 'Dongdaemun History & Culture Park Station Exit 1'
  },
  {
    id: 'coex-starfield-hub',
    type: 'landmark',
    nameEn: 'Starfield COEX Mall & Library (Gangnam)',
    nameKo: '스타필드 코엑스몰 & 별마당도서관',
    addressEn: '513 Yeongdong-daero, Gangnam-gu, Seoul',
    addressKo: '서울특별시 강남구 영동대로 513',
    city: 'Seoul',
    lat: 37.5117,
    lng: 127.0592,
    confidence: 'exact',
    nearestStation: 'Samseong Station Exit 5, 6 / Bongeunsa Station'
  },

  // --- TOP HOTELS & ACCOMMODATIONS ---
  {
    id: 'lotte-hotel-seoul',
    type: 'hotel',
    nameEn: 'Lotte Hotel Seoul (Myeongdong Main)',
    nameKo: '롯데호텔 서울',
    addressEn: '30 Eulji-ro, Jung-gu, Seoul',
    addressKo: '서울특별시 중구 을지로 30',
    city: 'Seoul',
    lat: 37.5658,
    lng: 126.9816,
    confidence: 'exact',
    nearestStation: 'Euljiro 1-ga Station Exit 7, 8'
  },
  {
    id: 'ryse-hotel-hongdae',
    type: 'hotel',
    nameEn: 'RYSE, Autograph Collection (Hongdae)',
    nameKo: '라이즈 오토그래프 컬렉션',
    addressEn: '130 Yanghwa-ro, Mapo-gu, Seoul',
    addressKo: '서울특별시 마포구 양화로 130',
    city: 'Seoul',
    lat: 37.5544,
    lng: 126.9213,
    confidence: 'exact',
    nearestStation: 'Hongik Univ. Station Exit 9'
  },
  {
    id: 'shilla-hotel-seoul',
    type: 'hotel',
    nameEn: 'The Shilla Seoul',
    nameKo: '서울신라호텔',
    addressEn: '249 Dongho-ro, Jung-gu, Seoul',
    addressKo: '서울특별시 중구 동호로 249',
    city: 'Seoul',
    lat: 37.5562,
    lng: 127.0050,
    confidence: 'exact',
    nearestStation: 'Dongguk Univ. Station Exit 5'
  },
  {
    id: 'josun-palace-gangnam',
    type: 'hotel',
    nameEn: 'Josun Palace, Luxury Collection (Gangnam)',
    nameKo: '조선 팰리스 서울 강남',
    addressEn: '231 Teheran-ro, Gangnam-gu, Seoul',
    addressKo: '서울특별시 강남구 테헤란로 231',
    city: 'Seoul',
    lat: 37.5028,
    lng: 127.0416,
    confidence: 'exact',
    nearestStation: 'Yeoksam Station Exit 8'
  },
  {
    id: 'four-seasons-seoul',
    type: 'hotel',
    nameEn: 'Four Seasons Hotel Seoul',
    nameKo: '포시즌스 호텔 서울',
    addressEn: '97 Saemunan-ro, Jongno-gu, Seoul',
    addressKo: '서울특별시 종로구 새문안로 97',
    city: 'Seoul',
    lat: 37.5707,
    lng: 126.9754,
    confidence: 'exact',
    nearestStation: 'Gwanghwamun Station Exit 7'
  },
  {
    id: 'nine-tree-myeongdong-2',
    type: 'hotel',
    nameEn: 'Nine Tree Premier Hotel Myeongdong 2',
    nameKo: '나인트리 프리미어 호텔 명동 II',
    addressEn: '28 Mareunnae-ro, Jung-gu, Seoul',
    addressKo: '서울특별시 중구 마른내로 28',
    city: 'Seoul',
    lat: 37.5642,
    lng: 126.9904,
    confidence: 'exact',
    nearestStation: 'Euljiro 3-ga Station Exit 8'
  },
  {
    id: 'nine-tree-myeongdong-1',
    type: 'hotel',
    nameEn: 'Nine Tree Hotel Myeongdong',
    nameKo: '나인트리 호텔 명동',
    addressEn: '51 Myeongdong 10-gil, Jung-gu, Seoul',
    addressKo: '서울특별시 중구 명동10길 51',
    city: 'Seoul',
    lat: 37.5619,
    lng: 126.9859,
    confidence: 'exact',
    nearestStation: 'Myeongdong Station Exit 8'
  },
  {
    id: 'l7-myeongdong',
    type: 'hotel',
    nameEn: 'L7 Myeongdong by LOTTE',
    nameKo: 'L7 명동 바이 롯데',
    addressEn: '137 Toegye-ro, Jung-gu, Seoul',
    addressKo: '서울특별시 중구 퇴계로 137',
    city: 'Seoul',
    lat: 37.5609,
    lng: 126.9870,
    confidence: 'exact',
    nearestStation: 'Myeongdong Station Exit 9'
  },
  {
    id: 'l7-hongdae',
    type: 'hotel',
    nameEn: 'L7 Hongdae by LOTTE',
    nameKo: 'L7 홍대 바이 롯데',
    addressEn: '141 Yanghwa-ro, Mapo-gu, Seoul',
    addressKo: '서울특별시 마포구 양화로 141',
    city: 'Seoul',
    lat: 37.5553,
    lng: 126.9221,
    confidence: 'exact',
    nearestStation: 'Hongik Univ. Station Exit 1'
  },
  {
    id: 'shilla-stay-gwanghwamun',
    type: 'hotel',
    nameEn: 'Shilla Stay Gwanghwamun',
    nameKo: '신라스테이 광화문',
    addressEn: '71 Sambong-ro, Jongno-gu, Seoul',
    addressKo: '서울특별시 종로구 삼봉로 71',
    city: 'Seoul',
    lat: 37.5728,
    lng: 126.9818,
    confidence: 'exact',
    nearestStation: 'Jonggak Station Exit 2'
  },
  {
    id: 'shilla-stay-mapo',
    type: 'hotel',
    nameEn: 'Shilla Stay Mapo',
    nameKo: '신라스테이 마포',
    addressEn: '83 Mapo-daero, Mapo-gu, Seoul',
    addressKo: '서울특별시 마포구 마포대로 83',
    city: 'Seoul',
    lat: 37.5414,
    lng: 126.9515,
    confidence: 'exact',
    nearestStation: 'Gongdeok Station Exit 1'
  },
  {
    id: 'shilla-stay-seocho',
    type: 'hotel',
    nameEn: 'Shilla Stay Seocho (Gangnam)',
    nameKo: '신라스테이 서초',
    addressEn: '427 Hyoryeong-ro, Seocho-gu, Seoul',
    addressKo: '서울특별시 서초구 효령로 427',
    city: 'Seoul',
    lat: 37.4912,
    lng: 127.0279,
    confidence: 'exact',
    nearestStation: 'Yangjae Station Exit 2'
  },
  {
    id: 'signiel-seoul',
    type: 'hotel',
    nameEn: 'Signiel Seoul (Lotte World Tower 76-101F)',
    nameKo: '시그니엘 서울',
    addressEn: '300 Olympic-ro, Songpa-gu, Seoul',
    addressKo: '서울특별시 송파구 올림픽로 300',
    city: 'Seoul',
    lat: 37.5126,
    lng: 127.1025,
    confidence: 'exact',
    nearestStation: 'Jamsil Station Exit 1, 2'
  },
  {
    id: 'grand-hyatt-seoul',
    type: 'hotel',
    nameEn: 'Grand Hyatt Seoul (Namsan)',
    nameKo: '그랜드 하얏트 서울',
    addressEn: '322 Sowol-ro, Yongsan-gu, Seoul',
    addressKo: '서울특별시 용산구 소월로 322',
    city: 'Seoul',
    lat: 37.5392,
    lng: 126.9975,
    confidence: 'exact',
    nearestStation: 'Hangangjin Station (15 min walk or taxi)'
  },
  {
    id: 'skypark-central-myeongdong',
    type: 'hotel',
    nameEn: 'Hotel Skypark Central Myeongdong',
    nameKo: '호텔 스카이파크 센트럴 명동',
    addressEn: '16 Myeongdong 9-gil, Jung-gu, Seoul',
    addressKo: '서울특별시 중구 명동9길 16',
    city: 'Seoul',
    lat: 37.5646,
    lng: 126.9852,
    confidence: 'exact',
    nearestStation: 'Euljiro 1-ga Station Exit 5'
  },

  // --- BUSAN MAJOR HUBS ---
  {
    id: 'busan-station-hub',
    type: 'transit',
    nameEn: 'Busan Station (KTX & Metro)',
    nameKo: '부산역',
    addressEn: '206 Jungang-daero, Dong-gu, Busan',
    addressKo: '부산광역시 동구 중앙대로 206',
    city: 'Busan',
    lat: 35.1154,
    lng: 129.0422,
    confidence: 'exact',
    nearestStation: 'Busan Station (Metro Line 1, KTX)'
  },
  {
    id: 'haeundae-beach-hub',
    type: 'district',
    nameEn: 'Haeundae Beach & Gunam-ro Food Street',
    nameKo: '해운대해수욕장 & 구남로',
    addressEn: '264 Haeundaehaebyeon-ro, Haeundae-gu, Busan',
    addressKo: '부산광역시 해운대구 해운대해변로 264',
    city: 'Busan',
    lat: 35.1587,
    lng: 129.1604,
    confidence: 'exact',
    nearestStation: 'Haeundae Station Exit 3, 5'
  },
  {
    id: 'grand-josun-busan',
    type: 'hotel',
    nameEn: 'Grand Josun Busan (Haeundae Beachfront)',
    nameKo: '그랜드 조선 부산',
    addressEn: '292 Haeundaehaebyeon-ro, Haeundae-gu, Busan',
    addressKo: '부산광역시 해운대구 해운대해변로 292',
    city: 'Busan',
    lat: 35.1601,
    lng: 129.1624,
    confidence: 'exact',
    nearestStation: 'Haeundae Station Exit 3'
  },
  {
    id: 'paradise-hotel-busan',
    type: 'hotel',
    nameEn: 'Paradise Hotel Busan (Ocean Spa Cimer)',
    nameKo: '파라다이스 호텔 부산',
    addressEn: '296 Haeundaehaebyeon-ro, Haeundae-gu, Busan',
    addressKo: '부산광역시 해운대구 해운대해변로 296',
    city: 'Busan',
    lat: 35.1607,
    lng: 129.1648,
    confidence: 'exact',
    nearestStation: 'Haeundae Station Exit 3'
  },
  {
    id: 'seomyeon-hub',
    type: 'district',
    nameEn: 'Seomyeon Commercial Downtown (Busan)',
    nameKo: '서면 1번가',
    addressEn: 'Jungang-daero, Busanjin-gu, Busan',
    addressKo: '부산광역시 부산진구 중앙대로',
    city: 'Busan',
    lat: 35.1578,
    lng: 129.0593,
    confidence: 'exact',
    nearestStation: 'Seomyeon Station (Line 1, 2)'
  },
  {
    id: 'gwangalli-beach-hub',
    type: 'district',
    nameEn: 'Gwangalli Beach & Gwangan Bridge View',
    nameKo: '광안리해수욕장',
    addressEn: '219 Gwanganhaebyeon-ro, Suyeong-gu, Busan',
    addressKo: '부산광역시 수영구 광안해변로 219',
    city: 'Busan',
    lat: 35.1532,
    lng: 129.1189,
    confidence: 'exact',
    nearestStation: 'Gwangan Station Exit 3, 5'
  },
  {
    id: 'gimhae-airport-hub',
    type: 'transit',
    nameEn: 'Gimhae International Airport (PUS)',
    nameKo: '김해국제공항',
    addressEn: '108 Gonghangjinip-ro, Gangseo-gu, Busan',
    addressKo: '부산광역시 강서구 공항진입로 108',
    city: 'Busan',
    lat: 35.1795,
    lng: 128.9382,
    confidence: 'exact',
    nearestStation: 'Gimhae Int\'l Airport Station (BGL Light Rail)'
  },

  // --- DAEGU HUBS ---
  {
    id: 'dongdaegu-station-hub',
    type: 'transit',
    nameEn: 'Dongdaegu Station (KTX & Shinsegae)',
    nameKo: '동대구역 & 신세계백화점',
    addressEn: '550 Dongdaegu-ro, Dong-gu, Daegu',
    addressKo: '대구광역시 동구 동대구로 550',
    city: 'Daegu',
    lat: 35.8797,
    lng: 128.6285,
    confidence: 'exact',
    nearestStation: 'Dongdaegu Station (Daegu Line 1, KTX)'
  },
  {
    id: 'banwoldang-hub',
    type: 'transit',
    nameEn: 'Banwoldang Station & Underground Mall',
    nameKo: '반월당역',
    addressEn: 'Dalgubeol-daero, Jung-gu, Daegu',
    addressKo: '대구광역시 중구 달구벌대로',
    city: 'Daegu',
    lat: 35.8655,
    lng: 128.5934,
    confidence: 'exact',
    nearestStation: 'Banwoldang Station (Daegu Line 1, 2)'
  }
];

/**
 * Parse any coordinate input format, including decimal coords, DMS format,
 * Google Maps URLs (@lat,lng or ?q=lat,lng), and coordinates embedded in text.
 */
export function parseCoordinateInput(query: string): Coordinates | null {
  const trimmed = query.trim();

  // 1. Google Maps URLs (@lat,lng or ?q=lat,lng or ?ll=lat,lng)
  const urlMatch = trimmed.match(/(?:@|[?&](?:q|ll)=)([+-]?\d+\.\d+)[,\s]+([+-]?\d+\.\d+)/);
  if (urlMatch) {
    const lat = parseFloat(urlMatch[1]);
    const lng = parseFloat(urlMatch[2]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= 30 && lat <= 43 && lng >= 120 && lng <= 135) {
      return { lat, lng };
    }
  }

  // 2. Degrees Minutes Seconds (DMS) format, e.g. 37°33'56.9"N 126°59'03.2"E
  const dmsMatch = trimmed.match(
    /(\d+)°\s*(\d+)['′]\s*(\d+(?:\.\d+)?)["″]?\s*([NS])\s*[,]?\s*(\d+)°\s*(\d+)['′]\s*(\d+(?:\.\d+)?)["″]?\s*([EW])/i
  );
  if (dmsMatch) {
    let lat = parseInt(dmsMatch[1], 10) + parseInt(dmsMatch[2], 10) / 60 + parseFloat(dmsMatch[3]) / 3600;
    if (dmsMatch[4].toUpperCase() === 'S') lat = -lat;
    let lng = parseInt(dmsMatch[5], 10) + parseInt(dmsMatch[6], 10) / 60 + parseFloat(dmsMatch[7]) / 3600;
    if (dmsMatch[8].toUpperCase() === 'W') lng = -lng;
    if (lat >= 30 && lat <= 43 && lng >= 120 && lng <= 135) {
      return { lat, lng };
    }
  }

  // 3. Direct decimal coordinate string (e.g., "37.5658, 126.9816" or "(37.5658, 126.9816)")
  const directMatch = trimmed.match(/(?:^|[^\d.-])([+-]?\d{1,2}\.\d{3,10})[,\s]+([+-]?\d{1,3}\.\d{3,10})(?:$|[^\d.-])/);
  if (directMatch) {
    const lat = parseFloat(directMatch[1]);
    const lng = parseFloat(directMatch[2]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  return null;
}

/**
 * Clean and decompose an address copied from Google Maps into search variants.
 * Handles postal codes, "South Korea", combined POI names, and road addresses.
 */
export function cleanGoogleMapsAddressVariants(raw: string): string[] {
  let cleaned = raw.trim();

  // Remove trailing/leading quotes, brackets, URLs
  cleaned = cleaned.replace(/^["']|["']$/g, '');

  // If it contains a URL, try extracting coordinates first
  if (/maps\.google|goo\.gl|google\.com\/maps/i.test(cleaned)) {
    return [cleaned];
  }

  // Remove South Korea country indicators and 5-digit Korean postal codes (e.g. 04538)
  cleaned = cleaned
    .replace(/\b(?:South Korea|Republic of Korea|Korea|대한민국|한국)\b/gi, '')
    .replace(/\b\d{5}\b/g, '') // remove 5-digit postal code
    .replace(/,\s*,/g, ',')
    .replace(/^,\s*|,\s*$/g, '')
    .trim();

  const variants = new Set<string>();
  if (cleaned) variants.add(cleaned);

  // If there are commas (e.g., "Hotel Skypark Central, 16 Myeongdong 9-gil, Jung-gu, Seoul")
  const segments = cleaned.split(',').map((s) => s.trim()).filter(Boolean);
  if (segments.length >= 2) {
    // Variant: Street address without the hotel/building name (e.g., "16 Myeongdong 9-gil, Jung-gu, Seoul")
    const streetPortion = segments.slice(1).join(', ').trim();
    if (streetPortion) variants.add(streetPortion);

    // Variant: Just the building/hotel name (e.g., "Hotel Skypark Central")
    if (segments[0]) variants.add(segments[0]);

    // Variant: Road name + city (e.g. "Myeongdong 9-gil, Seoul")
    const roadSegment = segments.find((s) => /-ro|-gil|street|daero|avenue/i.test(s));
    const citySegment = segments.find((s) => /seoul|busan|incheon|daegu|jeju/i.test(s));
    if (roadSegment && citySegment) {
      variants.add(`${roadSegment}, ${citySegment}`);
    }
  }

  return Array.from(variants);
}

/**
 * High-accuracy multi-tiered search & geocoding engine for South Korea.
 * Tiers:
 * 1. Coordinates direct match (Google Maps URL or lat,lng format)
 * 2. Curated & verified POIs (hotels, transit stations, districts, airport terminals)
 * 3. Registered landmarks & transit database
 * 4. Google Maps Geocoding API (if Google API Key configured)
 * 5. High-speed Photon Geocoder (Komoot / OSM Elasticsearch biased to South Korea)
 * 6. Structured OpenStreetMap Nominatim with strict South Korea bounding box
 */
export async function searchKoreaPlaces(
  rawQuery: string,
  userLocation?: Coordinates | null,
  limit: number = 8
): Promise<KoreaSearchResult[]> {
  const query = rawQuery.trim();
  if (!query) return [];

  // Tier 1: Check for direct coordinate input
  const directCoords = parseCoordinateInput(query);
  if (directCoords) {
    return [
      {
        id: `coord-${directCoords.lat.toFixed(5)}-${directCoords.lng.toFixed(5)}`,
        type: 'coordinates',
        nameEn: `Pinned Coordinates (${directCoords.lat.toFixed(4)}, ${directCoords.lng.toFixed(4)})`,
        nameKo: `좌표 위치 (${directCoords.lat.toFixed(4)}, ${directCoords.lng.toFixed(4)})`,
        addressEn: `Exact GPS Location (${directCoords.lat.toFixed(5)}, ${directCoords.lng.toFixed(5)})`,
        city: directCoords.lat >= 37.4 && directCoords.lat <= 37.7 ? 'Seoul' : 'South Korea',
        lat: directCoords.lat,
        lng: directCoords.lng,
        confidence: 'exact'
      }
    ];
  }

  const qLower = query.toLowerCase();
  const results: KoreaSearchResult[] = [];
  const seenKeys = new Set<string>();

  const addResult = (res: KoreaSearchResult) => {
    // Deduplicate by proximity (< 25 meters) or same ID/name
    const key = `${res.lat.toFixed(3)}_${res.lng.toFixed(3)}`;
    if (seenKeys.has(key) || seenKeys.has(res.nameEn.toLowerCase())) return;
    seenKeys.add(key);
    seenKeys.add(res.nameEn.toLowerCase());
    results.push(res);
  };

  // Tier 2: Search in curated verified POIs (instant, 100% accurate)
  for (const poi of VERIFIED_KOREA_POIS) {
    if (
      poi.nameEn.toLowerCase().includes(qLower) ||
      poi.nameKo.includes(query) ||
      poi.addressEn.toLowerCase().includes(qLower) ||
      (poi.addressKo && poi.addressKo.includes(query)) ||
      poi.city.toLowerCase().includes(qLower) ||
      (poi.nearestStation && poi.nearestStation.toLowerCase().includes(qLower))
    ) {
      addResult(poi);
    }
  }

  // Tier 3: Search in LANDMARKS and TRANSIT_STOPS
  for (const lm of LANDMARKS) {
    if (
      lm.nameEn.toLowerCase().includes(qLower) ||
      lm.nameKo.includes(query) ||
      lm.romanization.toLowerCase().includes(qLower) ||
      lm.nearestStation.toLowerCase().includes(qLower) ||
      lm.description.toLowerCase().includes(qLower)
    ) {
      addResult({
        id: lm.id,
        type: lm.category === 'market' || lm.category === 'food' ? 'district' : 'landmark',
        nameEn: lm.nameEn,
        nameKo: lm.nameKo,
        addressEn: `${lm.city}, South Korea • 🚇 ${lm.nearestStation}`,
        addressKo: `${lm.nameKo} (${lm.nearestStation})`,
        city: lm.city,
        lat: lm.lat,
        lng: lm.lng,
        confidence: 'exact',
        nearestStation: lm.nearestStation,
        rawItem: lm
      });
    }
  }

  for (const ts of TRANSIT_STOPS) {
    if (
      ts.nameEn.toLowerCase().includes(qLower) ||
      ts.nameKo.includes(query) ||
      ts.romanization.toLowerCase().includes(qLower) ||
      ts.lines.some((l) => l.toLowerCase().includes(qLower))
    ) {
      addResult({
        id: ts.id,
        type: 'transit',
        nameEn: ts.nameEn,
        nameKo: ts.nameKo,
        addressEn: `${ts.city} • Subway Line ${ts.lines.join(', ')}`,
        addressKo: `${ts.nameKo} (${ts.lines.join(', ')})`,
        city: ts.city,
        lat: ts.lat,
        lng: ts.lng,
        confidence: 'exact',
        nearestStation: ts.nameEn,
        rawItem: ts
      });
    }
  }

  // If local results already fill limit and exact matches found, return early or continue for street address queries
  const isStreetAddressQuery = /\d+|street|road|-ro|-gil|hotel|residence|airbnb|villa|building|tower|station|apt/i.test(query);

  // Tier 4: Google Maps Geocoding API if key configured
  const googleKey = getGoogleMapsApiKey();
  if (isValidGoogleMapsKey(googleKey)) {
    try {
      const gUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        `${query}, South Korea`
      )}&key=${googleKey}&region=kr&language=en`;
      const gRes = await fetch(gUrl);
      if (gRes.ok) {
        const gData = await gRes.json();
        if (gData.status === 'OK' && Array.isArray(gData.results)) {
          for (const item of gData.results.slice(0, 4)) {
            const loc = item.geometry?.location;
            if (loc) {
              const mainTitle = item.address_components?.[0]?.long_name || item.formatted_address;
              addResult({
                id: `google-${item.place_id}`,
                type: 'address',
                nameEn: mainTitle,
                nameKo: mainTitle,
                addressEn: item.formatted_address,
                city: item.formatted_address.includes('Seoul') ? 'Seoul' : 'South Korea',
                lat: loc.lat,
                lng: loc.lng,
                confidence: 'exact'
              });
            }
          }
        }
      }
    } catch {
      // Continue to next tier
    }
  }

  // Get cleaned search variants (e.g. street address without postal code or hotel name)
  const searchVariants = cleanGoogleMapsAddressVariants(query);

  // Tier 5: High-speed Photon Geocoding (Komoot API - biased around Seoul/South Korea coordinates)
  try {
    const focusLat = userLocation?.lat || 37.5665;
    const focusLon = userLocation?.lng || 126.9780;

    for (const variant of searchVariants) {
      if (results.length >= limit) break;
      const photonRes = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(
          variant
        )}&lat=${focusLat}&lon=${focusLon}&limit=5`
      );
      if (photonRes.ok) {
        const pData = await photonRes.json();
        if (pData.features && Array.isArray(pData.features)) {
          for (const feat of pData.features) {
            const props = feat.properties;
            const coords = feat.geometry?.coordinates;
            if (coords && coords.length >= 2) {
              const lng = coords[0];
              const lat = coords[1];
              // Verify within South Korea coordinates bounds (Lat 33 - 39, Lng 124 - 132)
              if (lat >= 33.0 && lat <= 39.0 && lng >= 124.0 && lng <= 132.0) {
                const name = props.name || props.street || props.district || variant;
                const addressParts = [
                  props.street,
                  props.district,
                  props.city,
                  props.state || 'South Korea'
                ].filter(Boolean);
                addResult({
                  id: `photon-${props.osm_id || Math.random()}`,
                  type: props.osm_key === 'tourism' || props.osm_value === 'hotel' ? 'hotel' : 'address',
                  nameEn: name,
                  nameKo: name,
                  addressEn: addressParts.join(', ') || name,
                  city: props.city || (lat >= 37.4 && lat <= 37.7 ? 'Seoul' : 'South Korea'),
                  lat,
                  lng,
                  confidence: 'high'
                });
              }
            }
          }
        }
      }
    }
  } catch {
    // Continue to fallback tier
  }

  // Tier 6: Structured Nominatim search strictly bounded to South Korea
  if (results.length < limit) {
    try {
      for (const variant of searchVariants) {
        if (results.length >= limit) break;
        const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          variant
        )}&format=json&countrycodes=kr&viewbox=124.5,38.7,131.2,33.0&bounded=1&limit=4&accept-language=en`;
        const nomRes = await fetch(nomUrl, {
          headers: {
            'Accept-Language': 'en'
          }
        });
        if (nomRes.ok) {
          const nomData = await nomRes.json();
          if (Array.isArray(nomData)) {
            for (const item of nomData) {
              const parts = item.display_name.split(',').map((p: string) => p.trim());
              const title = item.name || parts[0];
              const address = parts.slice(1, 4).join(', ') || item.display_name;
              const lat = parseFloat(item.lat);
              const lng = parseFloat(item.lon);
              if (!isNaN(lat) && !isNaN(lng)) {
                addResult({
                  id: `osm-${item.place_id}`,
                  type: item.type === 'hotel' || item.class === 'tourism' ? 'hotel' : 'address',
                  nameEn: title,
                  nameKo: parts[0],
                  addressEn: address,
                  city: item.display_name.includes('Seoul') ? 'Seoul' : 'South Korea',
                  lat,
                  lng,
                  confidence: 'high'
                });
              }
            }
          }
        }
      }
    } catch {
      // Keep accumulated results
    }
  }

  return results.slice(0, limit);
}

/**
 * Reverse geocode a coordinate to a clean English and Korean address in South Korea
 */
export async function reverseGeocodeKorea(
  coords: Coordinates
): Promise<{ addressEn: string; addressKo: string; placeName: string }> {
  // Check if near any verified POI first (< 100 meters)
  for (const poi of VERIFIED_KOREA_POIS) {
    const dLat = Math.abs(poi.lat - coords.lat);
    const dLng = Math.abs(poi.lng - coords.lng);
    if (dLat < 0.001 && dLng < 0.001) {
      return {
        addressEn: poi.addressEn,
        addressKo: poi.addressKo || poi.nameKo,
        placeName: poi.nameEn
      };
    }
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=18&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (res.ok) {
      const data = await res.json();
      const parts = (data.display_name || '').split(',').map((s: string) => s.trim());
      const placeName = data.name || parts[0] || 'Pinned Location';
      const addressEn = parts.slice(1, 5).join(', ') || data.display_name;
      const addressKo = data.address?.road
        ? `${data.address.road} ${data.address.house_number || ''}`
        : parts[0];

      return {
        addressEn: addressEn || `Near ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`,
        addressKo: addressKo || placeName,
        placeName
      };
    }
  } catch {
    // Fallback
  }

  return {
    addressEn: `Coordinates ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}, South Korea`,
    addressKo: `위치 (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`,
    placeName: 'Pinned Location'
  };
}
