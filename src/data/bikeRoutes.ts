import { BicycleRoute, BikeAmenity } from '../types';

export const DAEGU_BIKE_ROUTES: BicycleRoute[] = [
  {
    id: 'sincheon-river-bike-path',
    nameEn: 'Sincheon River Dedicated Bike Highway',
    nameKo: '신천 자전거 전용도로 (신천 둔치)',
    city: 'Daegu',
    lengthKm: 18.5,
    estimatedMinutes: 65,
    difficulty: 'Easy',
    pathType: 'Car-Free River Path',
    surface: 'Smooth asphalt with solar night LED lighting',
    color: '#10B981', // Emerald green
    description:
      'Daegu premier north-south bicycle arterial. Completely car-free, perfectly flat, running along the lush willow banks of the Sincheon stream through the heart of the city. Equipped with drinking fountains, automated tire pumps, and public restrooms every 2 km.',
    safetyTips:
      'Keep to the right lane. Pedestrians walk on the separate parallel rubber track. Slow down near bridges and underpasses.',
    rentals: 'Free Daegu municipal bike loan booths at Daebong Bridge & Chilseong Market.',
    highlights: [
      'Daebong-gyo Bridge fountain show',
      'Kim Gwang-seok Mural Street connection',
      'Chilseong Night Market river bank',
      'Geumho River junction wetland'
    ],
    waypoints: [
      [35.8080, 128.6180],
      [35.8170, 128.6120],
      [35.8270, 128.6075],
      [35.8390, 128.6050],
      [35.8510, 128.6042],
      [35.8610, 128.6045],
      [35.8710, 128.6052],
      [35.8820, 128.6030],
      [35.8940, 128.5990],
      [35.9080, 128.5940]
    ],
    isBikeAccessibleRoad: true,
    roadCategory: 'car_free_expressway'
  },
  {
    id: 'geumho-river-bike-highway',
    nameEn: 'Geumho River Scenic Bike Expressway',
    nameKo: '금호강 자전거길 (국토종주 자전거길)',
    city: 'Daegu',
    lengthKm: 32.0,
    estimatedMinutes: 110,
    difficulty: 'Scenic',
    pathType: 'Car-Free River Path',
    surface: 'Wide dual-lane paved asphalt',
    color: '#06B6D4', // Cyan
    description:
      'Part of South Korea National Cross-Country River Bike Trail Network. Sweeping riverside vistas, reeds, migratory bird watching decks, connecting Gangjeongbo / The ARC to Dongchon Sunrise Park and Ayang Bridge.',
    safetyTips:
      'Watch out for sudden river headwinds in late afternoon. Bring plenty of water as convenience stores are spaced 3-5 km apart.',
    rentals: 'Abundant rental shops at The ARC (Gangjeongbo) and Dongchon Resort.',
    highlights: [
      'The ARC futuristic pavilion & water plaza',
      'Paldal Bridge river view',
      'Dongchon Resort Ferris wheel & riverside cafes',
      'Ayang Railroad Bridge'
    ],
    waypoints: [
      [35.8535, 128.4680],
      [35.8660, 128.4790],
      [35.8810, 128.5020],
      [35.8950, 128.5330],
      [35.9060, 128.5670],
      [35.9080, 128.5940],
      [35.8950, 128.6250],
      [35.8850, 128.6470],
      [35.8750, 128.6810],
      [35.8640, 128.7180]
    ],
    isBikeAccessibleRoad: true,
    roadCategory: 'car_free_expressway'
  },
  {
    id: 'the-arc-gangjeong-loop',
    nameEn: 'The ARC & Gangjeong Goryeongbo Promenade',
    nameKo: '디아크 & 강정고령보 수변 자전거길',
    city: 'Daegu',
    lengthKm: 5.2,
    estimatedMinutes: 20,
    difficulty: 'Easy',
    pathType: 'Lake Promenade',
    surface: 'Paved plaza and smooth riverside track',
    color: '#8B5CF6', // Purple
    description:
      'Korea most famous recreational cycling & e-scooter spot. Ride over the colossal Gangjeong Goryeongbo dam bridge crossing the Nakdong River, encircling the silver spaceship-shaped ARC cultural center. Unmatched sunset reflections.',
    safetyTips:
      'High pedestrian and children density on weekend afternoons. Ring your bell gently and maintain a safe speed under 15 km/h.',
    rentals: 'Over 10 private rental shops along Gangjeong-gil: cruiser bikes, tandem bikes, electric fat-tire bikes, and family carts.',
    highlights: [
      'The ARC architectural reflection pool',
      'Gangjeong Goryeongbo Dam lock crossing',
      'Nakdong-Geumho confluence wetland',
      'Sunset picnic lawns'
    ],
    waypoints: [
      [35.8540, 128.4670],
      [35.8575, 128.4715],
      [35.8620, 128.4690],
      [35.8590, 128.4620],
      [35.8530, 128.4645],
      [35.8540, 128.4670]
    ],
    isBikeAccessibleRoad: true,
    roadCategory: 'shared_paved_sidewalk'
  },
  {
    id: 'suseong-lake-loop',
    nameEn: 'Suseong Lake Leisure Circuit',
    nameKo: '수성못 둘레 자전거 산책로',
    city: 'Daegu',
    lengthKm: 2.8,
    estimatedMinutes: 12,
    difficulty: 'Easy',
    pathType: 'Lake Promenade',
    surface: 'Rubberized track & paved perimeter road',
    color: '#F59E0B', // Amber
    description:
      'Scenic perimeter trail hugging Daegu most beloved lake. Framed by weeping willow trees, lakeside cafes, open-air busking stages, and views of Hotel Susung and the Sky Rail monorail.',
    safetyTips:
      'Dismount on wooden deck footbridges where bicycles are prohibited. Keep to the outer paved bike lane.',
    rentals: 'Kakao T Bike electric rental zones around Suseongmot Station Exit 1.',
    highlights: [
      'Suseong Lake Musical Fountain (night water show)',
      'Waterfront cafe terrace boulevard',
      'Line 3 Sky Rail monorail reflection',
      'Duck paddle boat harbor'
    ],
    waypoints: [
      [35.8260, 128.6160],
      [35.8285, 128.6168],
      [35.8300, 128.6205],
      [35.8280, 128.6225],
      [35.8252, 128.6190],
      [35.8260, 128.6160]
    ],
    isBikeAccessibleRoad: true,
    roadCategory: 'shared_paved_sidewalk'
  },
  {
    id: 'dalgubeol-daero-commuter',
    nameEn: 'Dalgubeol-daero Arterial Urban Bike Lane',
    nameKo: '달구벌대로 도심 자전거 전용/겸용도로',
    city: 'Daegu',
    lengthKm: 14.2,
    estimatedMinutes: 50,
    difficulty: 'Moderate',
    pathType: 'City Bike Lane',
    surface: 'Green-painted sidewalk bike lane & curb-separated roadway lane',
    color: '#3B82F6', // Blue
    description:
      'Daegu main east-west transit spine running parallel to Metro Line 2. Direct commuter connection from Seongseo & Keimyung University through Duryu, Banwoldang downtown, Beomeo, and Suseong-gu.',
    safetyTips:
      'Yield to bus stops and subway exit pedestrians. Obey bicycle traffic lights at major crosswalks.',
    rentals: 'Shared Kakao T e-bikes found at all Subway Line 2 station exits.',
    highlights: [
      'Keimyung University Seongseo campus gate',
      'E-World & 83 Tower entrance',
      'Banwoldang downtown metro hub',
      'Beomeo intersection financial district'
    ],
    waypoints: [
      [35.8550, 128.4880],
      [35.8565, 128.5150],
      [35.8575, 128.5420],
      [35.8585, 128.5630],
      [35.8655, 128.5910],
      [35.8620, 128.6140],
      [35.8590, 128.6320],
      [35.8510, 128.6550],
      [35.8450, 128.6750]
    ],
    isBikeAccessibleRoad: true,
    roadCategory: 'road_bike_lane'
  },
  {
    id: 'pyeongni-ro-naedang-bike-lane',
    nameEn: 'Pyeongni-ro & Naedang Church Bike Accessible Road',
    nameKo: '평리로 & 내당성당 자전거 겸용/접근도로',
    city: 'Daegu',
    lengthKm: 3.8,
    estimatedMinutes: 15,
    difficulty: 'Easy',
    pathType: 'City Bike Lane',
    surface: 'Wide colored bike-designated sidewalk & protected curb road lane',
    color: '#0D9488', // Teal
    description:
      'Direct bicycle-accessible street arterial in Seo-gu connecting Duryu Station, E-World, and Bangogae directly to Naedang Catholic Church. Features wide continuous pavement with dropped pedestrian curbs and bike racks at the parish grounds.',
    safetyTips:
      'Yield to pedestrians exiting bus stops along Pyeongni-ro. Ring bell when approaching church courtyard gates.',
    rentals: 'Kakao T e-bikes parked at Naedang Station Exit 2 and Duryu Station Exit 17.',
    highlights: [
      'Naedang Catholic Church (Red-brick Bell Tower & Parish Hall)',
      'Naedang Subway Station Line 2 Link',
      'Bangogae Spicy Seasoned Squid (Muchimhoe) Street',
      'Pyeongni Community Green Walkway'
    ],
    waypoints: [
      [35.8525, 128.5560], // Duryu Station
      [35.8570, 128.5615], // Naedang Station
      [35.8642, 128.5668], // Naedang Catholic Church!
      [35.8690, 128.5700], // Bangogae / Pyeongni-ro
      [35.8745, 128.5735]  // Dalseong Park link
    ],
    isBikeAccessibleRoad: true,
    roadCategory: 'road_bike_lane'
  },
  {
    id: 'dongchon-ayang-loop',
    nameEn: 'Dongchon Sunrise Park & Ayang Glass Bridge Loop',
    nameKo: '동촌유원지 & 아양기찻길 자전거 순환길',
    city: 'Daegu',
    lengthKm: 6.8,
    estimatedMinutes: 25,
    difficulty: 'Easy',
    pathType: 'Car-Free River Path',
    surface: 'Smooth riverbank asphalt and wooden bridge deck',
    color: '#EC4899', // Pink
    description:
      'Romantic cycling loop crossing the converted old railway bridge with glass observation floor over Geumho River. Cherry blossom avenue in spring and illuminated bridges at dusk.',
    safetyTips:
      'Walk your bicycle across the indoor cafe section of Ayang Bridge.',
    rentals: 'Dongchon Resort bicycle & quad-cycle rental centers.',
    highlights: [
      'Ayang Railroad Bridge cafe & gallery',
      'Dongchon Sunrise Park pavilion',
      'Riverside duck boats & cherry trees',
      'Mangwoo Park patriot memorial connection'
    ],
    waypoints: [
      [35.8820, 128.6480],
      [35.8853, 128.6366],
      [35.8890, 128.6420],
      [35.8905, 128.6520],
      [35.8850, 128.6580],
      [35.8820, 128.6480]
    ],
    isBikeAccessibleRoad: true,
    roadCategory: 'car_free_expressway'
  },
  {
    id: 'apsan-mountain-ring',
    nameEn: 'Apsan Mountain Foothill & Cafe Street Trail',
    nameKo: '앞산 순환로 & 카페거리 자전거길',
    city: 'Daegu',
    lengthKm: 8.5,
    estimatedMinutes: 40,
    difficulty: 'Moderate',
    pathType: 'Mountain Ring Road',
    surface: 'Paved roadside bike trail with gentle elevation changes',
    color: '#E11D48', // Rose
    description:
      'Elevated road hugging the base of Mount Apsan. Refreshing mountain breeze, panoramic glimpses of Daegu city skyline, passing Apsan Cafe Street, Gondeulbawi Rock, and Apsan Park entrance.',
    safetyTips:
      'Includes mild uphill segments (3-6% grade). Check your brakes before descending.',
    rentals: 'Shared e-bikes recommended for the gentle climbs.',
    highlights: [
      'Apsan Cafe Street boutique bakeries',
      'Anjirang Gopchang Street intersection',
      'Apsan Observatory cable car trailhead',
      'Dinosaur Park fossil site'
    ],
    waypoints: [
      [35.8370, 128.5620],
      [35.8360, 128.5778],
      [35.8340, 128.5910],
      [35.8320, 128.6040],
      [35.8280, 128.6140]
    ],
    isBikeAccessibleRoad: true,
    roadCategory: 'road_bike_lane'
  }
];

export const BIKE_AMENITIES: BikeAmenity[] = [
  {
    id: 'gangjeong-rentals',
    nameEn: 'The ARC Gangjeongbo Bike Rental Plaza',
    nameKo: '디아크 강정보 자전거/전동 대여단지',
    type: 'rental_station',
    city: 'Daegu',
    lat: 35.8552,
    lng: 128.4682,
    notes: 'Large cluster of rental shops offering cruisers, tandems, child trailers, and e-bikes. ID or passport required for deposit.',
    hours: '09:00 - 22:00',
    fee: '₩5,000/hr (Single), ₩10,000/hr (Tandem)'
  },
  {
    id: 'suseongmot-kakao-hub',
    nameEn: 'Suseongmot Station Shared Bike & Air Station',
    nameKo: '수성못역 자전거 거치대 & 공기주입기',
    type: 'rental_station',
    city: 'Daegu',
    lat: 35.8288,
    lng: 128.6180,
    notes: 'Subway Line 3 Exit 1. High density of Kakao T e-bikes, free automatic solar electric tire pump.',
    hours: '24 Hours',
    fee: 'Free air pump; Shared bike per app rates'
  },
  {
    id: 'sincheon-daebong-pump',
    nameEn: 'Sincheon River Daebong Bridge Free Air & Repair Station',
    nameKo: '신천 대봉교 무료 자전거 공기주입기 & 수리대',
    type: 'repair_pump',
    city: 'Daegu',
    lat: 35.8560,
    lng: 128.6042,
    notes: 'Municipal bike service station right on the riverside trail. Free air inflator, hex wrenches, tire levers, and water dispenser.',
    hours: '06:00 - 22:00',
    fee: 'Free'
  },
  {
    id: 'dongdaegu-bike-parking',
    nameEn: 'Dongdaegu KTX Station Covered Bike Terminal',
    nameKo: '동대구역 복합환승센터 자전거 주차타워',
    type: 'parking',
    city: 'Daegu',
    lat: 35.8778,
    lng: 128.6284,
    notes: 'Secured multi-tier indoor bike racks next to Exit 2, CCTV surveillance, electric tire inflator.',
    hours: '24 Hours',
    fee: 'Free'
  },
  {
    id: 'banwoldang-metro-pump',
    nameEn: 'Banwoldang Metro Hub Bike Pump & Rack',
    nameKo: '반월당역 자전거 보관소 & 공기주입기',
    type: 'repair_pump',
    city: 'Daegu',
    lat: 35.8671,
    lng: 128.5913,
    notes: 'Located at Banwoldang Exit 14 and Exit 18 (The Hyundai Daegu). Automatic tire inflator.',
    hours: '24 Hours',
    fee: 'Free'
  },
  {
    id: 'duryu-bike-rental',
    nameEn: 'Duryu Park Kolon Concert Hall Bike Center',
    nameKo: '두류공원 야외음악당 자전거 대여소',
    type: 'rental_station',
    city: 'Daegu',
    lat: 35.8520,
    lng: 128.5560,
    notes: 'Public bicycle rental booth near E-World and Duryu outdoor green lawns. Helmets provided.',
    hours: '10:00 - 19:00 (Weekends until 20:00)',
    fee: '₩4,000 - ₩6,000 / hour'
  },
  {
    id: 'ayang-bridge-crossing',
    nameEn: 'Ayang Railroad Scenic Bridge Crossing',
    nameKo: '아양기찻길 보행·자전거 전망대',
    type: 'bridge',
    city: 'Daegu',
    lat: 35.8853,
    lng: 128.6366,
    notes: 'Historic former Daegu Line railway bridge converted into an aerial pedestrian and bicycle corridor with cafes.',
    hours: '24 Hours',
    fee: 'Free'
  }
];

export const KOREA_CYCLING_GUIDE = {
  titleEn: 'South Korea & Daegu Cycling Rules & Tips',
  titleKo: '대한민국 & 대구 자전거 이용 수칙 및 안전 가이드',
  rules: [
    {
      topicEn: 'Where to Ride (Roads vs. Sidewalks)',
      topicKo: '주행 가능 도로 및 인도 통행 규정',
      descEn:
        'Bicycles are considered vehicles under Korean Road Traffic Law. Always use dedicated bicycle paths (marked with blue bike signs or green pavement). On roads without bike paths, ride on the right-most edge of the roadway. Riding on pedestrian sidewalks is prohibited unless there is a split pedestrian/bicycle lane sign.',
      badge: 'Legal Requirement'
    },
    {
      topicEn: 'Helmets & Night Lights',
      topicKo: '안전모(헬멧) 및 야간 전조등/후미등',
      descEn:
        'Wearing a certified safety helmet is legally required on all roads and paths. At dusk or night, front white lights and rear red reflectors/lights must be switched on for visibility.',
      badge: 'Safety Priority'
    },
    {
      topicEn: 'Subway Boarding with Bicycles (Daegu Metro)',
      topicKo: '대구 도시철도 자전거 휴대 탑승 안내',
      descEn:
        'Daegu Subway Lines 1 & 2: Regular bicycles are permitted ONLY on Saturdays, Sundays, and public holidays, and ONLY in the first and last train cars. Folding bicycles that are fully folded are allowed ANY day at ANY time. Line 3 Sky Rail monorail allows compact folding bikes only.',
      badge: 'Transit Rule'
    },
    {
      topicEn: 'Zero Alcohol Tolerance',
      topicKo: '자전거 음주운전 절대 금지',
      descEn:
        'Riding a bicycle while intoxicated (Blood Alcohol Content 0.03% or above) carries a strict fine up to ₩200,000 or license penalties. Police conduct spot breathalyzer checks along river bike paths.',
      badge: 'Strict Law'
    },
    {
      topicEn: 'Shared Electric Bikes (Kakao T Bike / D-Bike)',
      topicKo: '공유 전기자전거 (카카오 T 바이크 등)',
      descEn:
        'Dockless yellow Kakao T Bikes are parked across Daegu. Download the Kakao T app, scan the QR code to unlock, and park responsibly in designated bike racks without blocking building entrances or curb ramps.',
      badge: 'App Tip'
    }
  ]
};
