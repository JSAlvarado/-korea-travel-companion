export interface Coordinates {
  lat: number;
  lng: number;
}

export type LandmarkCategory =
  | 'palace'
  | 'market'
  | 'kculture'
  | 'park'
  | 'landmark'
  | 'food'
  | 'temple'
  | 'company'
  | 'hospital'
  | 'church'
  | 'store'
  | 'mart'
  | 'school'
  | 'bike_station';
export type CityName = 'All Korea' | 'Daegu' | 'Busan' | 'Seoul' | 'Incheon' | 'Gyeonggi' | 'Gyeongju' | 'Jeju' | 'Daejeon' | 'Ulsan' | 'Gwangju' | 'Jeonju' | 'Pohang';

export type TravelMode = 'walking' | 'cycling' | 'transit' | 'driving';

export interface TripTrackerState {
  isTracking: boolean;
  mode: TravelMode;
  distanceMeters: number;
  elapsedSeconds: number;
  currentSpeedKmh: number;
  path: Coordinates[];
  startTime: number | null;
}

export interface MultiModalEstimate {
  directDistanceMeters: number;
  walking: {
    distanceMeters: number;
    minutes: number;
    steps: number;
    calories: number;
  };
  cycling: {
    distanceMeters: number;
    minutes: number;
    calories: number;
  };
  transit: {
    distanceMeters: number;
    minutes: number;
    estimatedFareKrw: number;
    note: string;
  };
  driving: {
    distanceMeters: number;
    minutes: number;
    estimatedTaxiFareKrw: number;
  };
}

export interface Landmark {
  id: string;
  nameEn: string;
  nameKo: string;
  romanization: string;
  category: LandmarkCategory;
  city: CityName;
  lat: number;
  lng: number;
  description: string;
  nearestStation: string;
  subwayLine: string;
  stationExit?: string;
  tips: string;
  operatingHours?: string;
  admission?: string;
  phone?: string;
  isFeatured?: boolean;
  massSchedule?: string;
}

export type TransitType = 'subway' | 'airport_rail' | 'train_station' | 'bus_terminal';

export interface TransitStop {
  id: string;
  nameEn: string;
  nameKo: string;
  romanization: string;
  type: TransitType;
  city: CityName;
  lat: number;
  lng: number;
  lines: string[];
  transferLines?: string[];
  keyExits?: string;
  notes?: string;
}

export interface SubwayLineInfo {
  id: string;
  name: string;
  color: string;
  textColor: string;
  operator: string;
}

export interface ResidencyInfo {
  id: string;
  name: string;
  nameKo?: string;
  addressEn: string;
  addressKo?: string;
  phone?: string;
  roomNumber?: string;
  notes?: string;
  lat: number;
  lng: number;
  isConfigured: boolean;
  updatedAt?: string;
}

export type PhraseCategory =
  | 'transit'
  | 'hotel'
  | 'food'
  | 'shopping'
  | 'emergency'
  | 'basic'
  | 'medical'
  | 'daegu_busan';

export interface Phrase {
  id: string;
  category: PhraseCategory;
  en: string;
  ko: string;
  roman: string;
  literal?: string;
  tips?: string;
}

export interface EmergencyContact {
  id: string;
  titleEn: string;
  titleKo: string;
  number: string;
  description: string;
  isPrimary?: boolean;
  category: 'national' | 'tourist' | 'medical' | 'embassy';
  badge?: string;
}

export interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  rateToKrw: number; // 1 unit of foreign currency = X KRW
}

export interface UserEmergencyProfile {
  fullName: string;
  passportNumber?: string;
  bloodType: string;
  allergies: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export interface BicycleRoute {
  id: string;
  nameEn: string;
  nameKo: string;
  city: CityName;
  lengthKm: number;
  estimatedMinutes: number;
  difficulty: 'Easy' | 'Moderate' | 'Scenic' | 'Challenging';
  pathType: 'Car-Free River Path' | 'Lake Promenade' | 'City Bike Lane' | 'Mountain Ring Road' | 'Eco Boardwalk' | 'Accessible Roadway' | string;
  surface: string;
  color: string;
  description: string;
  safetyTips: string;
  rentals: string;
  highlights: string[];
  waypoints: [number, number][]; // [lat, lng] array
  isBikeAccessibleRoad?: boolean;
  roadCategory?: 'car_free_expressway' | 'road_bike_lane' | 'shared_paved_sidewalk';
}

export interface BikeAmenity {
  id: string;
  nameEn: string;
  nameKo: string;
  type: 'rental_station' | 'repair_pump' | 'parking' | 'bridge';
  city: CityName;
  lat: number;
  lng: number;
  notes: string;
  hours?: string;
  fee?: string;
}
