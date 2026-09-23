import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { addOfflineBasemap } from '../utils/offlineBasemap';
import {
  Coordinates,
  Landmark,
  TransitStop,
  ResidencyInfo,
  CityName,
  BicycleRoute,
  BikeAmenity
} from '../types';
import { LANDMARKS } from '../data/landmarks';
import { TRANSIT_STOPS, SUBWAY_LINES } from '../data/transit';
import { DAEGU_BIKE_ROUTES, BIKE_AMENITIES } from '../data/bikeRoutes';
import { BikeGuideModal } from './BikeGuideModal';
import {
  calculateDistanceMeters,
  formatDistance,
  calculateBearing,
  getCardinalDirection,
  estimateWalkMinutes
} from '../utils/geo';
import {
  searchKoreaPlaces,
  reverseGeocodeKorea,
  KoreaSearchResult
} from '../utils/geoSearch';
import { MultiModalDistanceCard } from './MultiModalDistanceCard';
import {
  MapPin,
  Navigation,
  Train,
  Home,
  Compass,
  Search,
  Layers,
  Copy,
  Check,
  Crosshair,
  ExternalLink,
  Sparkles,
  Phone,
  Footprints,
  Languages,
  Loader2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Bike,
  Star,
  Bookmark,
  Trash2
} from 'lucide-react';

interface MapTabProps {
  userLocation: Coordinates | null;
  residency: ResidencyInfo | null;
  onSetResidencyLocation: (coords: Coordinates, name?: string, nameKo?: string) => void;
  onOpenDriverCard?: (name: string, nameKo: string, addressEn: string, addressKo: string, phone?: string) => void;
  darkMode: boolean;
  batterySaver?: boolean;
  onRefreshGps: () => void;
}

// South Korea geographic boundary (covers Jeju Island to DMZ, West Sea to Dokdo)
const SOUTH_KOREA_BOUNDS = L.latLngBounds(
  [33.0, 124.5], // Southwest [Lat, Lng]
  [38.7, 131.2]  // Northeast [Lat, Lng]
);

interface SearchResultItem extends Partial<Omit<KoreaSearchResult, 'type' | 'confidence'>> {
  id: string;
  type: 'landmark' | 'transit' | 'hotel' | 'district' | 'address' | 'coordinates' | 'coords' | 'geocoded';
  nameEn: string;
  nameKo: string;
  subtitle?: string;
  addressEn?: string;
  addressKo?: string;
  city?: string;
  lat: number;
  lng: number;
  confidence?: 'exact' | 'high' | 'approximate' | 'medium' | 'low';
  rawItem?: any;
}

const CITY_CENTERS: Record<CityName, { coords: [number, number]; zoom: number }> = {
  'All Korea': { coords: [36.25, 127.8], zoom: 7 },
  Seoul: { coords: [37.5665, 126.9780], zoom: 13 },
  Busan: { coords: [35.1587, 129.0604], zoom: 13 },
  Daegu: { coords: [35.8714, 128.6014], zoom: 13 },
  Jeju: { coords: [33.38, 126.55], zoom: 11 },
  Incheon: { coords: [37.4563, 126.7052], zoom: 13 },
  Gyeongju: { coords: [35.8347, 129.2190], zoom: 14 },
  Gyeonggi: { coords: [37.33, 127.08], zoom: 11 },
  Daejeon: { coords: [36.3504, 127.3845], zoom: 13 },
  Ulsan: { coords: [35.5384, 129.3114], zoom: 13 },
  Gwangju: { coords: [35.1595, 126.8526], zoom: 13 },
  Jeonju: { coords: [35.8242, 127.1480], zoom: 14 },
  Pohang: { coords: [36.0190, 129.3435], zoom: 13 }
};

// Strips raw Korean Hangul from station names and subtitles for pure English presentation
const formatEnglishStation = (station?: string): string => {
  if (!station) return '';
  return station
    .replace(/\s*\([\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F\s,/-]+\)/g, '')
    .trim();
};

export const MapTab: React.FC<MapTabProps> = ({
  userLocation,
  residency,
  onSetResidencyLocation,
  darkMode,
  batterySaver = false,
  onRefreshGps
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const bikeRoutesLayerRef = useRef<L.LayerGroup | null>(null);
  const bikeAmenitiesLayerRef = useRef<L.LayerGroup | null>(null);
  const lineLayerRef = useRef<L.Polyline | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const residencyMarkerRef = useRef<L.Marker | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Persist user selected city across app sessions in phone memory
  const [selectedCity, setSelectedCity] = useState<CityName>(() => {
    try {
      const saved = localStorage.getItem('kr_travel_selected_city');
      if (saved) return saved as CityName;
    } catch {}
    return 'Daegu';
  });
  const [activeDaeguDistrict, setActiveDaeguDistrict] = useState<string>('all');
  
  // Persist active category filter in phone memory
  const [activeCategory, setActiveCategory] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('kr_travel_active_category');
      if (saved) return saved;
    } catch {}
    return 'all';
  });

  // Persist starred/favorite landmarks in phone memory (Default includes Naedang Catholic Church)
  const [favoritePlaceIds, setFavoritePlaceIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kr_travel_favorite_places');
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['naedang-catholic-church'];
  });

  // Persist custom user-pinned locations on the map in phone memory
  const [customPins, setCustomPins] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('kr_travel_custom_pins');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Persist bike accessible roads highlight toggle in phone memory
  const [highlightBikeRoads, setHighlightBikeRoads] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('kr_travel_highlight_bike_roads');
      return saved !== null ? saved === 'true' : true;
    } catch {}
    return true;
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState<boolean>(false);
  const [geocodedResults, setGeocodedResults] = useState<SearchResultItem[]>([]);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');
  // Map Language: defaults to 'en' (English translated), toggleable to 'ko' (Korean)
  const [mapLanguage, setMapLanguage] = useState<'en' | 'ko'>('en');
  const [selectedPlace, setSelectedPlace] = useState<{
    type: 'landmark' | 'transit' | 'residency';
    item: any;
  } | null>(null);
  // Panel minimize toggle to prevent blocking the map
  const [isPlaceCardMinimized, setIsPlaceCardMinimized] = useState<boolean>(false);
  const [showRadar, setShowRadar] = useState<boolean>(true);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Bicycle state
  const [showBikeLayer, setShowBikeLayer] = useState<boolean>(true);
  const [isBikeGuideOpen, setIsBikeGuideOpen] = useState<boolean>(false);
  const [selectedBikeRoute, setSelectedBikeRoute] = useState<BicycleRoute | null>(null);

  // Sync state changes to phone storage (localStorage)
  useEffect(() => {
    try {
      localStorage.setItem('kr_travel_selected_city', selectedCity);
    } catch {}
  }, [selectedCity]);

  useEffect(() => {
    try {
      localStorage.setItem('kr_travel_active_category', activeCategory);
    } catch {}
  }, [activeCategory]);

  useEffect(() => {
    try {
      localStorage.setItem('kr_travel_favorite_places', JSON.stringify(favoritePlaceIds));
    } catch {}
  }, [favoritePlaceIds]);

  useEffect(() => {
    try {
      localStorage.setItem('kr_travel_custom_pins', JSON.stringify(customPins));
    } catch {}
  }, [customPins]);

  useEffect(() => {
    try {
      localStorage.setItem('kr_travel_highlight_bike_roads', String(highlightBikeRoads));
    } catch {}
  }, [highlightBikeRoads]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Instant local search across ALL South Korea (bypasses city filters so you can search anything)
  const localSearchResults = useMemo<SearchResultItem[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const matchedLandmarks: SearchResultItem[] = LANDMARKS.filter((l) => {
      return (
        l.nameEn.toLowerCase().includes(q) ||
        l.nameKo.includes(searchQuery.trim()) ||
        l.romanization.toLowerCase().includes(q) ||
        l.nearestStation.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q)
      );
    })
      .slice(0, 5)
      .map((l) => ({
        id: l.id,
        type: 'landmark',
        nameEn: l.nameEn,
        nameKo: l.nameKo,
        subtitle: `${l.city} • 🚇 ${formatEnglishStation(l.nearestStation)}`,
        city: l.city,
        lat: l.lat,
        lng: l.lng,
        rawItem: l
      }));

    const matchedTransit: SearchResultItem[] = TRANSIT_STOPS.filter((t) => {
      return (
        t.nameEn.toLowerCase().includes(q) ||
        t.nameKo.includes(searchQuery.trim()) ||
        t.lines.some((line) => line.toLowerCase().includes(q)) ||
        t.city.toLowerCase().includes(q)
      );
    })
      .slice(0, 4)
      .map((t) => ({
        id: t.id,
        type: 'transit',
        nameEn: t.nameEn,
        nameKo: t.nameKo,
        subtitle: `${t.city} • Subway Line ${t.lines.join(', ')}`,
        city: t.city,
        lat: t.lat,
        lng: t.lng,
        rawItem: t
      }));

    return [...matchedLandmarks, ...matchedTransit];
  }, [searchQuery]);

  // Live South Korea online geocoding & multi-tiered search (Coordinates, Curated POIs, Photon, Nominatim)
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setGeocodedResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchKoreaPlaces(q, userLocation, 8);
        const mappedResults: SearchResultItem[] = results.map((item) => {
          return {
            id: item.id,
            type: item.type === 'coordinates' ? 'geocoded' : item.type === 'hotel' ? 'hotel' : 'geocoded',
            nameEn: item.nameEn,
            nameKo: item.nameKo,
            subtitle: item.addressEn || item.city,
            city: item.city || 'South Korea',
            lat: item.lat,
            lng: item.lng,
            rawItem: item
          };
        });
        setGeocodedResults(mappedResults);
      } catch {
        setGeocodedResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, userLocation]);

  // Combined search results (local landmarks prioritized, geocoded duplicates removed)
  const combinedSearchResults = useMemo(() => {
    const local = localSearchResults;
    const geocodedFiltered = geocodedResults.filter((g) => {
      return !local.some(
        (l) => Math.abs(l.lat - g.lat) < 0.005 && Math.abs(l.lng - g.lng) < 0.005
      );
    });
    return [...local, ...geocodedFiltered].slice(0, 8);
  }, [localSearchResults, geocodedResults]);

  // Handle clicking or entering a search result
  const handleSelectSearchResult = (result: SearchResultItem) => {
    setSearchDropdownOpen(false);
    setSearchQuery(result.nameEn);
    setIsPlaceCardMinimized(false);

    if (result.type === 'landmark') {
      setSelectedPlace({ type: 'landmark', item: result.rawItem });
    } else if (result.type === 'transit') {
      setSelectedPlace({ type: 'transit', item: result.rawItem });
    } else {
      setSelectedPlace({
        type: 'landmark',
        item: {
          id: result.id,
          nameEn: result.nameEn,
          nameKo: result.nameKo,
          lat: result.lat,
          lng: result.lng,
          category: 'landmark',
          city: result.city || 'South Korea',
          description: result.subtitle || 'Custom searched location in South Korea.',
          nearestStation: result.city || 'South Korea'
        }
      });
    }

    if (result.city && CITY_CENTERS[result.city as CityName]) {
      setSelectedCity(result.city as CityName);
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([result.lat, result.lng], 16, {
        duration: batterySaver ? 0.3 : 1
      });
    }
  };

  // Filtered landmarks (when typing search, search across all South Korea)
  const filteredLandmarks = useMemo(() => {
    const hasSearch = searchQuery.trim().length > 0;
    const allItems: Landmark[] = [...LANDMARKS, ...customPins];

    return allItems.filter((l) => {
      const isCustom = customPins.some((p) => p.id === l.id);
      const matchCity = hasSearch || selectedCity === 'All Korea' || l.city === selectedCity || isCustom;
      const matchCategory =
        activeCategory === 'all' ||
        (activeCategory === 'favorites' && (favoritePlaceIds.includes(l.id) || isCustom)) ||
        (activeCategory === 'attractions' && (l.category === 'landmark' || l.category === 'palace' || l.category === 'kculture')) ||
        (activeCategory === 'market' && (l.category === 'market' || l.category === 'food')) ||
        (activeCategory === 'store' && (l.category === 'store' || l.category === 'mart')) ||
        (activeCategory === 'school' && l.category === 'school') ||
        (activeCategory === 'church' && (l.category === 'church' || l.category === 'temple')) ||
        (activeCategory === 'park' && l.category === 'park') ||
        (activeCategory === 'hospital' && l.category === 'hospital') ||
        (activeCategory === 'company' && l.category === 'company') ||
        (activeCategory === 'bike' && l.category === 'bike_station') ||
        (activeCategory === 'culture' && (l.category === 'church' || l.category === 'temple'));

      const q = searchQuery.toLowerCase();
      const matchQuery =
        !searchQuery ||
        l.nameEn.toLowerCase().includes(q) ||
        l.nameKo.includes(searchQuery) ||
        l.nearestStation.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q);

      return matchCity && matchCategory && matchQuery;
    });
  }, [selectedCity, activeCategory, searchQuery, favoritePlaceIds, customPins]);

  // Filtered transit stops
  const filteredTransit = useMemo(() => {
    if (activeCategory !== 'all' && activeCategory !== 'transit') {
      return [];
    }
    const hasSearch = searchQuery.trim().length > 0;
    const q = searchQuery.toLowerCase();
    return TRANSIT_STOPS.filter((t) => {
      const matchCity = hasSearch || selectedCity === 'All Korea' || t.city === selectedCity;
      const matchQuery =
        !searchQuery ||
        t.nameEn.toLowerCase().includes(q) ||
        t.nameKo.includes(searchQuery) ||
        t.lines.some((line) => line.toLowerCase().includes(q));
      return matchCity && matchQuery;
    });
  }, [selectedCity, activeCategory, searchQuery]);

  // Update map tile layer with English translation support (ZERO watermark, fast CDN)
  const setTileLayer = (map: L.Map, style: 'streets' | 'satellite', lang: 'en' | 'ko') => {
    if (tileLayerRef.current && map.hasLayer(tileLayerRef.current)) {
      map.removeLayer(tileLayerRef.current);
    }

    const glParam = lang === 'en' ? '&gl=US' : '';

    if (style === 'satellite') {
      // High-res satellite imagery with translated road overlays and place labels
      tileLayerRef.current = L.tileLayer(
        `https://{s}.google.com/vt/lyrs=y&hl=${lang}${glParam}&x={x}&y={y}&z={z}`,
        {
          maxZoom: 20,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
          errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
          attribution: '&copy; Google'
        }
      ).addTo(map);
    } else {
      // Street Map translated directly to English (Roads, subways, districts, attractions)
      tileLayerRef.current = L.tileLayer(
        `https://{s}.google.com/vt/lyrs=m&hl=${lang}${glParam}&x={x}&y={y}&z={z}`,
        {
          maxZoom: 20,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
          errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
          attribution: '&copy; Google'
        }
      ).addTo(map);
    }
  };

  // Initialize Map strictly constrained to South Korea
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const defaultCenter = userLocation
        ? [userLocation.lat, userLocation.lng] as [number, number]
        : CITY_CENTERS[selectedCity]?.coords || [35.8714, 128.6014];
      const defaultZoom = userLocation ? 14 : 13;

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: defaultZoom,
        minZoom: 7, // Restrict zoom out beyond South Korea
        maxZoom: 18,
        maxBounds: SOUTH_KOREA_BOUNDS,
        maxBoundsViscosity: 1.0, // Hard bounce back at South Korea border
        zoomControl: false,
        attributionControl: false
      });

      // Add compact zoom control to top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Bundled offline basemap (visible whenever online tiles are unavailable)
      addOfflineBasemap(map).catch(() => {});

      // Set English-translated base tiles
      setTileLayer(map, mapStyle, mapLanguage);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;

      const bikeRoutesGroup = L.layerGroup().addTo(map);
      bikeRoutesLayerRef.current = bikeRoutesGroup;

      const bikeAmenitiesGroup = L.layerGroup().addTo(map);
      bikeAmenitiesLayerRef.current = bikeAmenitiesGroup;

      mapInstanceRef.current = map;

      // Tap on map to inspect a location or drop pin (with automatic English reverse-geocoding)
      map.on('click', async (e) => {
        const coords: Coordinates = { lat: e.latlng.lat, lng: e.latlng.lng };
        setIsPlaceCardMinimized(false);
        setSelectedPlace({
          type: 'residency',
          item: {
            id: `pin-${Date.now()}`,
            nameEn: 'Pinned Location',
            nameKo: 'Pinned Location',
            lat: coords.lat,
            lng: coords.lng,
            category: 'landmark',
            city: selectedCity !== 'All Korea' ? selectedCity : 'South Korea',
            description: `Coordinates (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}) in South Korea. Identifying English name...`,
            nearestStation: 'South Korea'
          }
        });

        // Concurrently fetch real English place/street name via OpenStreetMap Nominatim reverse geocoding
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json&accept-language=en`
          );
          if (res.ok) {
            const data = await res.json();
            const displayName = data.display_name || '';
            const parts = displayName.split(',').map((p: string) => p.trim());
            const englishTitle = data.name || parts[0] || 'Pinned Location';
            const englishAddress = parts.slice(1, 4).join(', ') || displayName;

            setSelectedPlace((prev) => {
              if (!prev || Math.abs(prev.item.lat - coords.lat) > 0.0001 || Math.abs(prev.item.lng - coords.lng) > 0.0001) {
                return prev;
              }
              return {
                ...prev,
                item: {
                  ...prev.item,
                  nameEn: englishTitle,
                  nameKo: data.address?.amenity || data.name || parts[0] || 'Pinned Location',
                  city: parts.find((p: string) => ['Seoul', 'Busan', 'Daegu', 'Incheon', 'Jeju', 'Gyeongju'].includes(p)) || prev.item.city,
                  description: `${englishAddress} • Coordinates (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`,
                  nearestStation: parts[1] || 'South Korea'
                }
              };
            });
          }
        } catch {
          // Keep English fallback
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update tiles when mapStyle or mapLanguage changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTileLayer(mapInstanceRef.current, mapStyle, mapLanguage);
    }
  }, [mapStyle, mapLanguage]);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // 1. User GPS marker (Pulsing blue radar pin)
    if (userLocation) {
      const userHtml = `
        <div class="relative flex items-center justify-center">
          <span class="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping pointer-events-none"></span>
          <span class="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center">
            <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
          </span>
        </div>
      `;
      const userIcon = L.divIcon({
        className: 'user-gps-marker',
        html: userHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(markersGroup);
      userMarker.bindTooltip('<div style="font-weight:700;font-size:12px;color:#fff;">Your Location (GPS)</div>', {
        direction: 'top',
        className: 'google-map-tooltip'
      });
      userMarkerRef.current = userMarker;
    }

    // 2. Hotel / Residency Marker
    if (residency && residency.isConfigured && residency.lat && residency.lng) {
      const hotelHtml = `
        <div class="relative flex flex-col items-center cursor-pointer transition-transform hover:scale-110">
          <div class="w-8 h-8 rounded-full bg-amber-500 border-2 border-white shadow-xl flex items-center justify-center text-sm text-neutral-950 font-bold">
            🏨
          </div>
          <div class="px-1.5 py-0.5 rounded bg-amber-500 text-neutral-950 text-[10px] font-bold shadow-md whitespace-nowrap mt-0.5 border border-white">
            My Hotel
          </div>
        </div>
      `;
      const hotelIcon = L.divIcon({
        className: 'hotel-pin',
        html: hotelHtml,
        iconSize: [60, 48],
        iconAnchor: [30, 24]
      });

      const hotelMarker = L.marker([residency.lat, residency.lng], { icon: hotelIcon, zIndexOffset: 900 }).addTo(markersGroup);
      hotelMarker.bindTooltip(`<div style="font-weight:700;">${residency.name}</div><div style="font-size:11px;color:#fcd34d;">My Hotel / Residence</div>`, {
        direction: 'top',
        className: 'google-map-tooltip'
      });
      hotelMarker.on('click', () => {
        setIsPlaceCardMinimized(false);
        setSelectedPlace({
          type: 'residency',
          item: {
            ...residency,
            nameEn: residency.name,
            nearestStation: residency.nearestSubway || residency.addressEn
          }
        });
      });
      residencyMarkerRef.current = hotelMarker;
    }

    // 3. Landmark & POI markers (Clean, crisp circular pins with no overlapping noisy boxes)
    filteredLandmarks.forEach((landmark) => {
      let iconColor = 'bg-rose-700';
      let iconEmoji = '🏛️';

      if (landmark.category === 'market' || landmark.category === 'food') {
        iconColor = 'bg-amber-500';
        iconEmoji = landmark.category === 'food' ? '🍜' : '🛍️';
      } else if (landmark.category === 'store' || landmark.category === 'mart') {
        iconColor = 'bg-orange-500';
        iconEmoji = landmark.category === 'mart' ? '🛒' : '🏪';
      } else if (landmark.category === 'school') {
        iconColor = 'bg-blue-600';
        iconEmoji = '🎓';
      } else if (landmark.category === 'park') {
        iconColor = 'bg-emerald-600';
        iconEmoji = '🌳';
      } else if (landmark.category === 'hospital') {
        iconColor = 'bg-rose-600';
        iconEmoji = '🏥';
      } else if (landmark.category === 'company') {
        iconColor = 'bg-indigo-600';
        iconEmoji = '🏢';
      } else if (landmark.category === 'church' || landmark.category === 'temple') {
        iconColor = 'bg-violet-600';
        iconEmoji = landmark.category === 'temple' ? '🛕' : '⛪';
      } else if (landmark.category === 'kculture') {
        iconColor = 'bg-purple-600';
        iconEmoji = '✨';
      } else if (landmark.category === 'bike_station') {
        iconColor = 'bg-teal-500';
        iconEmoji = '🚲';
      }

      const isNaedang = landmark.id === 'naedang-catholic-church';
      const isFeaturedLandmark = isNaedang || landmark.isFeatured;

      const landmarkHtml = isNaedang
        ? `
        <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-125" style="z-index: 1000;">
          <div class="absolute -inset-2.5 rounded-full bg-amber-400/40 animate-ping pointer-events-none"></div>
          <div class="absolute -inset-1.5 rounded-full bg-amber-500/60 border-2 border-amber-300"></div>
          <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 border-2 border-white shadow-2xl flex items-center justify-center text-[16px] text-white relative z-10 font-bold">
            ⛪
          </div>
          <div class="absolute -bottom-5.5 whitespace-nowrap px-1.5 py-0.5 rounded-md bg-neutral-950/95 text-amber-300 border border-amber-500/60 text-[10px] font-extrabold shadow-lg flex items-center gap-1">
            <span>⭐ Naedang Catholic Church</span>
          </div>
        </div>
      `
        : `
        <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-125">
          <div class="w-7 h-7 rounded-full ${iconColor} border-2 border-white shadow-md flex items-center justify-center text-[12px] text-white">
            ${iconEmoji}
          </div>
        </div>
      `;

      const markerIcon = L.divIcon({
        className: isNaedang ? 'featured-naedang-pin' : 'landmark-pin',
        html: landmarkHtml,
        iconSize: isNaedang ? [40, 40] : [28, 28],
        iconAnchor: isNaedang ? [20, 20] : [14, 14]
      });

      const marker = L.marker([landmark.lat, landmark.lng], {
        icon: markerIcon,
        zIndexOffset: isNaedang ? 1100 : isFeaturedLandmark ? 800 : 400
      }).addTo(markersGroup);

      marker.bindTooltip(
        isNaedang
          ? `<div style="font-weight:800;font-size:13px;color:#fef08a;">⭐ Naedang Catholic Church (내당성당)</div>` +
            `<div style="font-size:11px;color:#fde047;">Seo-gu, Daegu • FEATURED CATHOLIC LANDMARK</div>` +
            `<div style="font-size:10px;color:#e2e8f0;margin-top:2px;">Holy Mass: Sun 06:30, 10:00 (Main), 19:30</div>` +
            `<div style="font-size:10px;color:#34d399;margin-top:2px;">🚴 Accessible via Pyeongni-ro & Dalgubeol-daero bike lane</div>`
          : `<div style="font-weight:700;font-size:12px;color:#fff;">${landmark.nameEn}</div><div style="font-size:11px;color:#93c5fd;">${landmark.city} • ${(landmark.category || 'Sight').toUpperCase()}</div>`,
        { direction: 'top', offset: isNaedang ? [0, -22] : [0, -14], className: 'google-map-tooltip' }
      );
      marker.on('click', () => {
        setIsPlaceCardMinimized(false);
        setSelectedPlace({ type: 'landmark', item: landmark });
      });
    });

    // 3b. Render Custom Saved Pins from Phone Storage
    customPins.forEach((pin) => {
      const pinHtml = `
        <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-125">
          <div class="w-7 h-7 rounded-full bg-rose-600 border-2 border-white shadow-md flex items-center justify-center text-[12px] text-white font-bold">
            📍
          </div>
          <div class="absolute -bottom-4.5 whitespace-nowrap px-1 py-0.5 rounded bg-neutral-900/90 text-rose-300 text-[9px] font-semibold border border-rose-500/40">
            ${pin.nameEn.slice(0, 16)}
          </div>
        </div>
      `;
      const customPinIcon = L.divIcon({
        className: 'custom-saved-pin',
        html: pinHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });
      const marker = L.marker([pin.lat, pin.lng], { icon: customPinIcon, zIndexOffset: 700 }).addTo(markersGroup);
      marker.bindTooltip(
        `<div style="font-weight:700;font-size:12px;color:#fca5a5;">📌 Saved Location</div><div style="font-size:11px;color:#fff;">${pin.nameEn}</div>`,
        { direction: 'top', offset: [0, -14], className: 'google-map-tooltip' }
      );
      marker.on('click', () => {
        setIsPlaceCardMinimized(false);
        setSelectedPlace({ type: 'landmark', item: pin });
      });
    });

    // 4. Transit stop markers
    filteredTransit.forEach((stop) => {
      const primaryLine = stop.lines[0] || '1';
      const lineObj = SUBWAY_LINES.find((l) => primaryLine.includes(l.name.split(' ')[0]) || primaryLine.includes(l.id));
      const bgColor = lineObj ? lineObj.color : '#0032A0';

      const transitHtml = `
        <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-125">
          <div class="w-6 h-6 rounded-full text-white border-2 border-white shadow-md flex items-center justify-center text-[10px]" style="background-color: ${bgColor}">
            🚇
          </div>
        </div>
      `;

      const markerIcon = L.divIcon({
        className: 'transit-pin',
        html: transitHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([stop.lat, stop.lng], { icon: markerIcon }).addTo(markersGroup);
      marker.bindTooltip(
        `<div style="font-weight:700;font-size:12px;color:#fff;">${stop.nameEn} Station</div><div style="font-size:11px;color:#93c5fd;">${stop.city} Subway • ${stop.lines.join(', ')}</div>`,
        { direction: 'top', offset: [0, -12], className: 'google-map-tooltip' }
      );
      marker.on('click', () => {
        setIsPlaceCardMinimized(false);
        setSelectedPlace({ type: 'transit', item: stop });
      });
    });

    // 5. Highlighted marker for selected place (e.g. from search, geocoding or custom tap)
    if (selectedPlace) {
      const isAlreadyRendered =
        filteredLandmarks.some((l) => l.lat === selectedPlace.item.lat && l.lng === selectedPlace.item.lng) ||
        filteredTransit.some((t) => t.lat === selectedPlace.item.lat && t.lng === selectedPlace.item.lng) ||
        (residency && residency.isConfigured && residency.lat === selectedPlace.item.lat && residency.lng === selectedPlace.item.lng);

      if (!isAlreadyRendered) {
        const customHtml = `
          <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-125">
            <span class="absolute w-8 h-8 rounded-full bg-blue-500/40 animate-ping pointer-events-none"></span>
            <div class="w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-bold">
              📍
            </div>
          </div>
        `;
        const customIcon = L.divIcon({
          className: 'custom-search-pin',
          html: customHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        const customMarker = L.marker([selectedPlace.item.lat, selectedPlace.item.lng], {
          icon: customIcon,
          zIndexOffset: 1200
        }).addTo(markersGroup);

        customMarker.bindTooltip(
          `<div style="font-weight:700;font-size:12px;color:#fff;">${selectedPlace.item.nameEn}</div><div style="font-size:11px;color:#93c5fd;">Pinned Location</div>`,
          { direction: 'top', offset: [0, -16], className: 'google-map-tooltip' }
        );
      }
    }

    // 6. Line connecting user to selected place
    if (lineLayerRef.current) {
      map.removeLayer(lineLayerRef.current);
      lineLayerRef.current = null;
    }

    if (userLocation && selectedPlace) {
      const targetCoords: [number, number] = [selectedPlace.item.lat, selectedPlace.item.lng];
      const polyline = L.polyline([[userLocation.lat, userLocation.lng], targetCoords], {
        color: '#3B82F6',
        weight: 3,
        dashArray: '6, 8',
        opacity: 0.85
      }).addTo(map);
      lineLayerRef.current = polyline;
    }
  }, [filteredLandmarks, filteredTransit, userLocation, residency, selectedPlace]);

  // Update Bike Routes & Bike Amenities Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    const routesGroup = bikeRoutesLayerRef.current;
    const amenitiesGroup = bikeAmenitiesLayerRef.current;
    if (!map || !routesGroup || !amenitiesGroup) return;

    routesGroup.clearLayers();
    amenitiesGroup.clearLayers();

    // Show bike layer if toggled on, or if bike category active
    if (!showBikeLayer && activeCategory !== 'bike') return;

    // 1. Render all Daegu Designated Bike Routes & Bike-Accessible Roads
    DAEGU_BIKE_ROUTES.forEach((route) => {
      const isSelected = selectedBikeRoute?.id === route.id;
      const isBikeRoad = route.isBikeAccessibleRoad ?? true;

      // When highlightBikeRoads is enabled, render an illuminated glowing halo casing
      if (highlightBikeRoads && isBikeRoad) {
        const glowColor =
          route.roadCategory === 'car_free_expressway'
            ? '#10B981' // Vibrant emerald green for 100% car-free
            : route.roadCategory === 'road_bike_lane'
            ? '#06B6D4' // Vivid cyan for protected city road lanes
            : '#8B5CF6'; // Purple for shared road ways

        L.polyline(route.waypoints, {
          color: glowColor,
          weight: isSelected ? 16 : 12,
          opacity: 0.45,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(routesGroup);
      }

      // Dark background casing for high contrast readability
      L.polyline(route.waypoints, {
        color: '#090d16',
        weight: isSelected ? 8 : 6,
        opacity: 0.8,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(routesGroup);

      // Main colored route line
      const polyline = L.polyline(route.waypoints, {
        color: route.color,
        weight: isSelected ? 6 : 4,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: route.pathType.includes('Car-Free') ? undefined : '6, 8'
      }).addTo(routesGroup);

      const accessibilityLabel =
        route.roadCategory === 'car_free_expressway'
          ? '🟢 100% Car-Free Bike Expressway'
          : route.roadCategory === 'road_bike_lane'
          ? '🔵 City Road Dedicated Bike Lane'
          : '🟣 Bicycle-Allowed Road / Shared Sidewalk';

      polyline.bindTooltip(
        `<div style="font-weight:800;font-size:12px;color:#fff;">🚴 ${route.nameEn}</div>` +
        `<div style="font-size:11px;color:#34d399;font-weight:600;">${route.nameKo} • ${route.lengthKm} km (~${route.estimatedMinutes}m)</div>` +
        `<div style="display:inline-block;margin-top:3px;font-size:10px;padding:2px 6px;border-radius:4px;background:#065f46;color:#a7f3d0;font-weight:700;">` +
        `${accessibilityLabel}` +
        `</div>` +
        `<div style="font-size:10px;color:#93c5fd;margin-top:3px;">${route.pathType} • ${route.surface}</div>` +
        `<div style="font-size:9px;color:#cbd5e1;margin-top:1px;">💡 ${route.safetyTips || 'Bikes allowed under Korean Road Traffic Act'}</div>`,
        { sticky: true, className: 'google-map-tooltip' }
      );

      polyline.on('click', () => {
        setSelectedBikeRoute(route);
        map.fitBounds(polyline.getBounds(), { padding: [50, 50], maxZoom: 15 });
      });
    });

    // 2. Render Bike Amenities (Free air inflators, rental kiosks, hubs)
    BIKE_AMENITIES.forEach((amenity) => {
      const isPump = amenity.type === 'repair_pump';
      const amenityHtml = `
        <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-125">
          <div class="w-6 h-6 rounded-full ${isPump ? 'bg-cyan-600' : 'bg-emerald-600'} border-2 border-white shadow-md flex items-center justify-center text-[11px] text-white">
            ${isPump ? '💨' : '🚲'}
          </div>
        </div>
      `;
      const amenityIcon = L.divIcon({
        className: 'bike-amenity-pin',
        html: amenityHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([amenity.lat, amenity.lng], { icon: amenityIcon }).addTo(amenitiesGroup);
      marker.bindTooltip(
        `<div style="font-weight:700;font-size:12px;color:#fff;">${amenity.nameEn}</div>` +
        `<div style="font-size:11px;color:#34d399;">${amenity.nameKo} • ${amenity.type.replace('_', ' ').toUpperCase()}</div>` +
        `<div style="font-size:10px;color:#e2e8f0;">${amenity.notes}</div>`,
        { direction: 'top', offset: [0, -12], className: 'google-map-tooltip' }
      );

      marker.on('click', () => {
        setIsPlaceCardMinimized(false);
        setSelectedPlace({
          type: 'landmark',
          item: {
            id: amenity.id,
            nameEn: amenity.nameEn,
            nameKo: amenity.nameKo,
            category: 'bike_station',
            city: 'Daegu',
            lat: amenity.lat,
            lng: amenity.lng,
            description: `${amenity.notes} • Hours: ${amenity.hours || '24/7'} • Fee: ${amenity.fee || 'Free'}`,
            nearestStation: 'Daegu, South Korea',
            operatingHours: amenity.hours,
            admission: amenity.fee
          }
        });
      });
    });
  }, [showBikeLayer, activeCategory, selectedBikeRoute, highlightBikeRoads]);

  // Spotlight Naedang Catholic Church with instant fly-to and card presentation
  const handleSpotlightNaedangChurch = () => {
    const church = LANDMARKS.find((l) => l.id === 'naedang-catholic-church');
    if (church && mapInstanceRef.current) {
      setSelectedCity('Daegu');
      setActiveCategory('all');
      setSelectedPlace({ type: 'landmark', item: church });
      setIsPlaceCardMinimized(false);
      mapInstanceRef.current.flyTo([church.lat, church.lng], 16, { duration: 1 });
      setFeedbackToast('⭐ Spotlighted Naedang Catholic Church (내당성당)');
      setTimeout(() => setFeedbackToast(null), 2500);
    }
  };

  // Toggle favorite place retained in phone memory
  const handleToggleFavorite = (id: string) => {
    const next = favoritePlaceIds.includes(id)
      ? favoritePlaceIds.filter((fav) => fav !== id)
      : [...favoritePlaceIds, id];
    setFavoritePlaceIds(next);
    setFeedbackToast(
      favoritePlaceIds.includes(id)
        ? 'Removed from phone favorites'
        : '⭐ Saved to phone favorites (retained permanently)'
    );
    setTimeout(() => setFeedbackToast(null), 2500);
  };

  // Save custom pinned location to phone storage
  const handleSaveCustomPin = (item: any) => {
    const newPin = {
      id: item.id && !item.id.startsWith('search-') ? item.id : `custom-pin-${Date.now()}`,
      nameEn: item.nameEn || 'Pinned Spot',
      nameKo: item.nameKo || '저장된 장소',
      lat: item.lat,
      lng: item.lng,
      category: 'landmark',
      city: item.city || selectedCity || 'Daegu',
      description: item.description || `Custom pinned location saved in phone storage.`,
      nearestStation: item.nearestStation || 'South Korea',
      createdAt: new Date().toISOString()
    };
    const updated = [newPin, ...customPins.filter((p) => p.id !== newPin.id)];
    setCustomPins(updated);
    setFeedbackToast('📌 Location permanently saved in phone storage!');
    setTimeout(() => setFeedbackToast(null), 2500);
  };

  // Delete custom pin from phone storage
  const handleDeleteCustomPin = (pinId: string) => {
    const updated = customPins.filter((p) => p.id !== pinId);
    setCustomPins(updated);
    if (selectedPlace?.item?.id === pinId) {
      setSelectedPlace(null);
    }
    setFeedbackToast('Pinned spot removed');
    setTimeout(() => setFeedbackToast(null), 2000);
  };

  // Center on user GPS
  const handleCenterUser = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 15, {
        duration: batterySaver ? 0.3 : 1
      });
    } else {
      onRefreshGps();
    }
  };

  // Center on residency
  const handleCenterResidency = () => {
    if (residency && residency.isConfigured && residency.lat && residency.lng && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([residency.lat, residency.lng], 15, {
        duration: batterySaver ? 0.3 : 1
      });
    }
  };

  // Center on selected city
  const handleSelectCity = (city: CityName) => {
    setSelectedCity(city);
    setActiveDaeguDistrict('all');
    const target = CITY_CENTERS[city];
    if (target && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(target.coords, target.zoom, { duration: 1 });
    }
  };

  // Fly directly to Daegu District and focus
  const handleSelectDaeguDistrict = (districtId: string, coords: [number, number], zoom: number = 14) => {
    setActiveDaeguDistrict(districtId);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(coords, zoom, { duration: 0.8 });
    }
  };

  // Copy text helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Compute live navigation info
  const navigationInfo = useMemo(() => {
    if (!userLocation || !selectedPlace) return null;
    const distanceMeters = calculateDistanceMeters(userLocation, {
      lat: selectedPlace.item.lat,
      lng: selectedPlace.item.lng
    });
    const bearing = calculateBearing(userLocation, {
      lat: selectedPlace.item.lat,
      lng: selectedPlace.item.lng
    });
    const cardinal = getCardinalDirection(bearing);
    const walkMin = estimateWalkMinutes(distanceMeters);

    return {
      distanceMeters,
      formattedDistance: formatDistance(distanceMeters),
      bearing,
      cardinal,
      walkMin
    };
  }, [userLocation, selectedPlace]);

  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)] relative overflow-hidden select-none">
      {/* Top Mobile Search & Filter Bar */}
      <div
        className={`px-3 py-2 border-b flex flex-col gap-1.5 z-20 ${
          darkMode ? 'bg-neutral-950/95 border-neutral-800' : 'bg-white/95 border-neutral-200'
        } backdrop-blur-md`}
      >
        {/* Search Row & Autocomplete Dropdown */}
        <div ref={searchContainerRef} className="relative w-full">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (combinedSearchResults.length > 0) {
                handleSelectSearchResult(combinedSearchResults[0]);
              }
            }}
            className="relative w-full"
          >
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              id="map-search-input"
              type="text"
              value={searchQuery}
              onFocus={() => setSearchDropdownOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchDropdownOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setSearchDropdownOpen(false);
              }}
              placeholder="Search in English: places, subways, hotels, food..."
              className={`w-full pl-9 pr-14 py-2 rounded-xl text-xs outline-none border transition-colors ${
                darkMode
                  ? 'bg-neutral-900 border-neutral-800 text-neutral-100 focus:border-blue-500'
                  : 'bg-neutral-100 border-neutral-300 text-neutral-900 focus:border-blue-500'
              }`}
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {isSearching && (
                <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
              )}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchDropdownOpen(false);
                  }}
                  className="w-5 h-5 rounded-full hover:bg-neutral-700/50 text-neutral-400 hover:text-white text-xs flex items-center justify-center transition-colors cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </form>

          {/* Autocomplete Dropdown List */}
          {searchDropdownOpen && (
            <div
              id="search-results-dropdown"
              className={`absolute top-full left-0 right-0 mt-1.5 rounded-2xl shadow-2xl border z-50 overflow-hidden backdrop-blur-xl max-h-[52vh] overflow-y-auto ${
                darkMode
                  ? 'bg-neutral-950/95 border-neutral-800 divide-y divide-neutral-800/70 text-neutral-100'
                  : 'bg-white/95 border-neutral-200 divide-y divide-neutral-100 text-neutral-900'
              }`}
            >
              {searchQuery.trim().length > 0 ? (
                <>
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center justify-between bg-neutral-900/30">
                    <span>Places in South Korea ({combinedSearchResults.length})</span>
                    {isSearching && (
                      <span className="text-blue-400 lowercase font-normal flex items-center gap-1 text-[10px]">
                        <Loader2 className="w-2.5 h-2.5 animate-spin" /> searching Korea...
                      </span>
                    )}
                  </div>

                  {combinedSearchResults.length > 0 ? (
                    combinedSearchResults.map((result) => (
                      <button
                        key={result.id}
                        type="button"
                        onClick={() => handleSelectSearchResult(result)}
                        className={`w-full text-left px-3 py-2.5 flex items-start gap-2.5 hover:bg-blue-600/15 active:bg-blue-600/25 transition-colors cursor-pointer group`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                          {result.type === 'transit' ? '🚇' : result.type === 'landmark' ? '🏛️' : '📍'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs group-hover:text-blue-400 transition-colors truncate">
                            {result.nameEn}
                          </div>
                          <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 truncate mt-0.5">
                            <span className="font-semibold text-blue-400 shrink-0">{result.city || 'South Korea'}</span>
                            {result.subtitle && (
                              <>
                                <span className="text-neutral-600">•</span>
                                <span className="truncate">{formatEnglishStation(result.subtitle)}</span>
                              </>
                            )}
                          </div>
                        </div>
                        {userLocation && (
                          <div className="text-[10px] font-mono text-neutral-400 shrink-0 self-center">
                            {formatDistance(calculateDistanceMeters(userLocation, { lat: result.lat, lng: result.lng }))}
                          </div>
                        )}
                      </button>
                    ))
                  ) : !isSearching ? (
                    <div className="p-4 text-center text-xs text-neutral-400">
                      No matching places found for <span className="font-bold text-neutral-200">"{searchQuery}"</span>.<br />
                      <span className="text-[11px] text-neutral-500 mt-1 block">
                        Try searching English or Korean (e.g. Myeongdong, Gangnam, Lotte World, Haeundae, Seoul Station).
                      </span>
                    </div>
                  ) : null}
                </>
              ) : (
                <>
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 bg-neutral-900/30">
                    Daegu & Korea Popular Spots
                  </div>
                  {[
                    {
                      id: 'quick-83tower',
                      type: 'landmark' as const,
                      nameEn: '83 Tower & E-World',
                      nameKo: '이월드 83타워',
                      subtitle: 'Daegu • Landmark Observatory',
                      city: 'Daegu',
                      lat: 35.8532,
                      lng: 128.5638,
                      rawItem: LANDMARKS.find((l) => l.id === 'eworld-83tower') || { lat: 35.8532, lng: 128.5638, nameEn: '83 Tower', nameKo: '83타워' }
                    },
                    {
                      id: 'quick-dongseongro',
                      type: 'landmark' as const,
                      nameEn: 'Dongseong-ro & Spark Mall',
                      nameKo: '동성로 & 스파크랜드',
                      subtitle: 'Daegu • Shopping & Rooftop Ferris Wheel',
                      city: 'Daegu',
                      lat: 35.8692,
                      lng: 128.5960,
                      rawItem: LANDMARKS.find((l) => l.id === 'dongseongro-daegu') || { lat: 35.8692, lng: 128.5960, nameEn: 'Dongseong-ro', nameKo: '동성로' }
                    },
                    {
                      id: 'quick-suseongmot',
                      type: 'landmark' as const,
                      nameEn: 'Suseongmot Lake & Musical Fountain',
                      nameKo: '수성못 유원지 & 분수',
                      subtitle: 'Daegu • Waterfront Cafes & Evening Lights',
                      city: 'Daegu',
                      lat: 35.8272,
                      lng: 128.6186,
                      rawItem: LANDMARKS.find((l) => l.id === 'suseongmot-lake') || { lat: 35.8272, lng: 128.6186, nameEn: 'Suseongmot Lake', nameKo: '수성못' }
                    },
                    {
                      id: 'quick-seomun',
                      type: 'landmark' as const,
                      nameEn: 'Seomun Market & Night Market',
                      nameKo: '서문시장 & 서문야시장',
                      subtitle: 'Daegu • Flat Dumplings & Street Food',
                      city: 'Daegu',
                      lat: 35.8690,
                      lng: 128.5815,
                      rawItem: LANDMARKS.find((l) => l.id === 'seomun-market') || { lat: 35.8690, lng: 128.5815, nameEn: 'Seomun Market', nameKo: '서문시장' }
                    },
                    {
                      id: 'quick-anjirang',
                      type: 'landmark' as const,
                      nameEn: 'Anjirang Gopchang Street',
                      nameKo: '안지랑 곱창골목',
                      subtitle: 'Daegu • Iconic Grilled Makchang Alley',
                      city: 'Daegu',
                      lat: 35.8362,
                      lng: 128.5778,
                      rawItem: LANDMARKS.find((l) => l.id === 'anjirang-gopchang-alley') || { lat: 35.8362, lng: 128.5778, nameEn: 'Anjirang Gopchang Street', nameKo: '안지랑 곱창골목' }
                    },
                    {
                      id: 'quick-gyeongbokgung',
                      type: 'landmark' as const,
                      nameEn: 'Gyeongbokgung Palace',
                      nameKo: '경복궁',
                      subtitle: 'Seoul • Main Royal Palace',
                      city: 'Seoul',
                      lat: 37.5796,
                      lng: 126.9770,
                      rawItem: LANDMARKS.find((l) => l.id === 'gyeongbokgung') || { lat: 37.5796, lng: 126.9770, nameEn: 'Gyeongbokgung Palace', nameKo: '경복궁' }
                    },
                    {
                      id: 'quick-haeundae',
                      type: 'landmark' as const,
                      nameEn: 'Haeundae Beach',
                      nameKo: '해운대해수욕장',
                      subtitle: 'Busan • Iconic Coastal Beach',
                      city: 'Busan',
                      lat: 35.1587,
                      lng: 129.1604,
                      rawItem: LANDMARKS.find((l) => l.id === 'haeundae-beach') || { lat: 35.1587, lng: 129.1604, nameEn: 'Haeundae Beach', nameKo: '해운대' }
                    }
                  ].map((spot) => (
                    <button
                      key={spot.id}
                      type="button"
                      onClick={() => handleSelectSearchResult(spot)}
                      className="w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-blue-600/10 transition-colors cursor-pointer group"
                    >
                      <span className="text-xs">✨</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold group-hover:text-blue-400 truncate">
                          {spot.nameEn}
                        </div>
                        <div className="text-[10px] text-neutral-400 truncate">
                          {spot.subtitle}
                        </div>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* City Filter Chips (Daegu Front & Center) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {(
            [
              'Daegu',
              'All Korea',
              'Seoul',
              'Busan',
              'Jeju',
              'Incheon',
              'Gyeongju'
            ] as CityName[]
          ).map((city) => (
            <button
              key={city}
              id={`city-btn-${city.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => handleSelectCity(city)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                selectedCity === city
                  ? 'bg-blue-600 text-white shadow-xs'
                  : darkMode
                  ? 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-200'
              }`}
            >
              {city === 'Daegu' ? '🍎 Daegu (대구)' : city === 'All Korea' ? '🇰🇷 Whole Korea' : city}
            </button>
          ))}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'all', label: `All (${filteredLandmarks.length + filteredTransit.length})` },
            { id: 'favorites', label: `⭐ Saved (${favoritePlaceIds.length + customPins.length})` },
            { id: 'attractions', label: '🏛️ Sights & Towers' },
            { id: 'bike', label: `🚲 Bike Routes (${DAEGU_BIKE_ROUTES.length})` },
            { id: 'store', label: '🛒 Marts & Stores' },
            { id: 'school', label: '🎓 Schools & Unis' },
            { id: 'church', label: '⛪ Churches & Temples' },
            { id: 'transit', label: '🚇 Subway & KTX' },
            { id: 'market', label: '🛍️ Food & Markets' },
            { id: 'park', label: '🌳 Parks & Lakes' },
            { id: 'hospital', label: '🏥 Medical' }
          ].map((cat) => (
            <button
              key={cat.id}
              id={`filter-${cat.id}`}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors shrink-0 cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-neutral-800 text-white font-bold border border-neutral-700 shadow-xs'
                  : darkMode
                  ? 'text-neutral-400 hover:text-white'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Daegu District & Hotspot Quick Strip (Only shown when Daegu is active) */}
        {selectedCity === 'Daegu' && (
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1 border-t border-neutral-800/40 text-[10px]">
            <span className="text-neutral-400 font-semibold shrink-0 pr-1 flex items-center gap-0.5">
              <span>📍 Hubs:</span>
            </span>

            {/* Featured Naedang Catholic Church Direct Quick Spotlight */}
            <button
              id="daegu-district-naedang-spotlight"
              onClick={handleSpotlightNaedangChurch}
              className={`px-2.5 py-0.5 rounded-md whitespace-nowrap transition-all shrink-0 cursor-pointer text-[10px] font-extrabold flex items-center gap-1 shadow-xs ${
                selectedPlace?.item?.id === 'naedang-catholic-church'
                  ? 'bg-amber-400 text-neutral-950 ring-2 ring-amber-300 font-black'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30'
              }`}
            >
              <span>⭐ ⛪ Naedang Catholic Church</span>
            </button>

            {/* Toggle Highlight Bicycle Accessible Roads */}
            <button
              id="toggle-highlight-bike-roads-quick-btn"
              onClick={() => {
                const next = !highlightBikeRoads;
                setHighlightBikeRoads(next);
                if (next) setShowBikeLayer(true);
                setFeedbackToast(next ? '🚴 Bike-accessible roads highlighted' : 'Bike roads highlight disabled');
                setTimeout(() => setFeedbackToast(null), 2000);
              }}
              className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                highlightBikeRoads
                  ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 ring-1 ring-cyan-400/40 shadow-xs'
                  : darkMode
                  ? 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                  : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 border border-neutral-200'
              }`}
            >
              <Bike className="w-3 h-3 text-cyan-400" />
              <span>{highlightBikeRoads ? '🚴 Bike Roads: Highlighted' : '🚴 Highlight Bike Roads'}</span>
            </button>

            {[
              { id: 'all', label: 'Whole Daegu', coords: [35.8714, 128.6014] as [number, number], zoom: 13 },
              { id: 'dongseongro', label: '🛍️ Dongseongno / Downtown', coords: [35.8692, 128.5960] as [number, number], zoom: 15 },
              { id: 'suseong', label: '🌊 Suseong Lake', coords: [35.8272, 128.6186] as [number, number], zoom: 15 },
              { id: 'dongdaegu', label: '🚄 Dongdaegu KTX', coords: [35.8778, 128.6284] as [number, number], zoom: 15 },
              { id: 'eworld', label: '🎡 E-World & 83 Tower', coords: [35.8532, 128.5638] as [number, number], zoom: 15 },
              { id: 'apsan', label: '⛰️ Apsan & Anjirang', coords: [35.8362, 128.5778] as [number, number], zoom: 14 },
              { id: 'seomun', label: '🥟 Seomun Market', coords: [35.8690, 128.5815] as [number, number], zoom: 15 },
              { id: 'palgong', label: '🛕 Palgongsan & Gatbawi', coords: [35.9818, 128.7408] as [number, number], zoom: 13 }
            ].map((district) => (
              <button
                key={district.id}
                id={`daegu-district-${district.id}`}
                onClick={() => handleSelectDaeguDistrict(district.id, district.coords, district.zoom)}
                className={`px-2 py-0.5 rounded-md whitespace-nowrap transition-colors shrink-0 cursor-pointer font-medium ${
                  activeDaeguDistrict === district.id
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                    : darkMode
                    ? 'bg-neutral-900/80 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 border border-neutral-200'
                }`}
              >
                {district.label}
              </button>
            ))}

            {/* Daegu Cycling Guide Quick Button */}
            <button
              id="open-bike-guide-quick-btn"
              onClick={() => setIsBikeGuideOpen(true)}
              className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold whitespace-nowrap flex items-center gap-1 transition-colors cursor-pointer shrink-0"
            >
              <Bike className="w-3 h-3 text-emerald-400" />
              <span>🚲 Cycling Guide & Rules</span>
            </button>
          </div>
        )}
      </div>

      {/* Map Canvas Container */}
      <div className={`relative flex-1 w-full bg-neutral-950 overflow-hidden ${darkMode && mapStyle === 'streets' ? 'leaflet-dark-streets' : ''}`}>
        <div id="map-container" ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Toast Notification */}
        {feedbackToast && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 px-3.5 py-1.5 rounded-full bg-neutral-900/95 border border-amber-500/50 text-amber-300 text-xs font-bold shadow-2xl backdrop-blur-md flex items-center gap-2 pointer-events-none transition-all">
            <span>{feedbackToast}</span>
          </div>
        )}

        {/* Floating Mobile Controls (Right side for easy thumb access) */}
        <div className="absolute top-3 right-3 z-30 flex flex-col gap-2">
          {/* Map Language Toggle: English (EN) vs Korean (KO) */}
          <button
            id="toggle-map-language-btn"
            onClick={() => setMapLanguage((prev) => (prev === 'en' ? 'ko' : 'en'))}
            title={`Current map language: ${mapLanguage === 'en' ? 'English (Translated)' : 'Korean (Local)'}. Tap to switch.`}
            className={`w-10 h-10 rounded-xl shadow-lg flex flex-col items-center justify-center border transition-all active:scale-95 ${
              mapLanguage === 'en'
                ? 'bg-blue-600 text-white border-blue-400 font-bold'
                : darkMode
                ? 'bg-neutral-900/90 text-neutral-200 border-neutral-700 hover:bg-neutral-800 font-bold'
                : 'bg-white/95 text-neutral-800 border-neutral-200 hover:bg-neutral-100 font-bold'
            }`}
          >
            <Languages className="w-4 h-4" />
            <span className="text-[9px] leading-tight font-extrabold mt-0.5">
              {mapLanguage.toUpperCase()}
            </span>
          </button>

          {/* Style Toggle: Street vs Satellite */}
          <button
            id="toggle-map-style-btn"
            onClick={() => setMapStyle((prev) => (prev === 'streets' ? 'satellite' : 'streets'))}
            title="Toggle Satellite View"
            className={`w-10 h-10 rounded-xl shadow-lg flex items-center justify-center border transition-all ${
              mapStyle === 'satellite'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : darkMode
                ? 'bg-neutral-900/90 text-neutral-200 border-neutral-700 hover:bg-neutral-800'
                : 'bg-white/95 text-neutral-800 border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            <Layers className="w-5 h-5" />
          </button>

          {/* Daegu Bike Routes & Paths Toggle */}
          <button
            id="toggle-bike-layer-btn"
            onClick={() => setShowBikeLayer((prev) => !prev)}
            title={showBikeLayer ? 'Hide Bike Paths & Amenities' : 'Show Daegu Bike Paths & Amenities'}
            className={`w-10 h-10 rounded-xl shadow-lg flex flex-col items-center justify-center border transition-all active:scale-95 ${
              showBikeLayer
                ? 'bg-emerald-600 text-white border-emerald-400 font-bold shadow-emerald-500/20'
                : darkMode
                ? 'bg-neutral-900/90 text-neutral-400 border-neutral-700 hover:bg-neutral-800'
                : 'bg-white/95 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span className="text-[8px] font-extrabold mt-0.5">BIKE</span>
          </button>

          {/* Center GPS on User */}
          <button
            id="center-user-btn"
            onClick={handleCenterUser}
            title="Pinpoint My GPS Location"
            className="w-10 h-10 rounded-xl shadow-lg bg-blue-600 text-white hover:bg-blue-500 active:scale-95 flex items-center justify-center border border-blue-400 transition-all cursor-pointer"
          >
            <Crosshair className="w-5 h-5" />
          </button>

          {/* Quick Jump to Hotel */}
          {residency && residency.isConfigured && (
            <button
              id="center-residency-btn"
              onClick={handleCenterResidency}
              title="Fly to My Hotel"
              className="w-10 h-10 rounded-xl shadow-lg bg-amber-500 text-neutral-950 hover:bg-amber-400 active:scale-95 flex items-center justify-center border border-amber-300 transition-all cursor-pointer"
            >
              <Home className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Floating Direction Radar (Top Left) - Closable */}
        {showRadar && navigationInfo && selectedPlace && (
          <div
            className={`absolute top-3 left-3 z-30 p-2 rounded-xl border shadow-lg backdrop-blur-md max-w-[200px] sm:max-w-xs transition-all ${
              darkMode ? 'bg-neutral-950/90 border-neutral-800 text-neutral-100' : 'bg-white/95 border-neutral-200 text-neutral-900'
            }`}
          >
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-500 border border-blue-500/40 flex items-center justify-center shrink-0"
                  style={{ transform: `rotate(${navigationInfo.bearing}deg)` }}
                >
                  <Navigation className="w-3.5 h-3.5 fill-blue-500" />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] uppercase font-mono tracking-wider text-blue-500 font-bold">
                    {navigationInfo.cardinal} • {navigationInfo.formattedDistance}
                  </div>
                  <div className="font-bold text-xs truncate">
                    {selectedPlace.item.nameEn}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowRadar(false)}
                className="w-5 h-5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center text-[10px] shrink-0 transition-colors cursor-pointer"
                title="Hide Radar"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Closable & Collapsible Place & Distance Information Panel */}
      {selectedPlace && (
        isPlaceCardMinimized ? (
          /* Minimized Compact Bar - Leaves 95%+ of the Map Completely Open */
          <div
            id="minimized-place-bar"
            className={`px-3 py-2 border-t z-30 shadow-2xl transition-all flex items-center justify-between gap-2.5 backdrop-blur-md ${
              darkMode ? 'bg-neutral-950/95 border-neutral-800 text-neutral-100' : 'bg-white/95 border-neutral-200 text-neutral-900'
            }`}
          >
            <button
              type="button"
              onClick={() => setIsPlaceCardMinimized(false)}
              className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-xs shrink-0 group-hover:scale-105 transition-transform">
                📍
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold truncate group-hover:text-blue-400 transition-colors">
                  {selectedPlace.item.nameEn}
                </div>
                {navigationInfo ? (
                  <div className="text-[11px] text-emerald-400 font-mono font-medium flex items-center gap-1.5 truncate">
                    <span>~{navigationInfo.walkMin} min walk ({navigationInfo.formattedDistance})</span>
                    <span className="text-neutral-500">•</span>
                    <span className="text-blue-400">{navigationInfo.cardinal}</span>
                  </div>
                ) : (
                  <div className="text-[10px] text-neutral-400 truncate">
                    Tap to view travel details & distances
                  </div>
                )}
              </div>
            </button>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                id="expand-place-card-btn"
                onClick={() => setIsPlaceCardMinimized(false)}
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-xs"
                title="Expand details"
              >
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Details</span>
              </button>
              <button
                type="button"
                id="unpin-place-btn"
                onClick={() => {
                  setSelectedPlace(null);
                  setIsPlaceCardMinimized(false);
                }}
                className="w-7 h-7 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
                title="Unpin location"
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          /* Full Expanded Details Panel */
          <div
            id="selected-place-card"
            className={`p-4 border-t z-30 shadow-2xl transition-all max-h-[48vh] overflow-y-auto ${
              darkMode ? 'bg-neutral-950 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900'
            }`}
          >
            <div className="max-w-3xl mx-auto space-y-3">
              {/* Header row: Category & Controls (Minimize + Close) */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {selectedPlace.type === 'residency'
                      ? '🏨 Hotel / My Stay'
                      : selectedPlace.type === 'transit'
                      ? '🚇 Subway Station'
                      : (selectedPlace.item.category || 'Sight').toUpperCase()}
                  </span>
                  {navigationInfo && (
                    <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                      <Footprints className="w-3 h-3" />
                      ~{navigationInfo.walkMin} min ({navigationInfo.formattedDistance})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Minimize Button - leaves the map open */}
                  <button
                    id="minimize-place-card-btn"
                    onClick={() => setIsPlaceCardMinimized(true)}
                    className="px-2.5 py-1 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Minimize panel to view full map"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                    <span>Minimize</span>
                  </button>

                  {/* Close / Unpin Button */}
                  <button
                    id="close-place-card-btn"
                    onClick={() => {
                      setSelectedPlace(null);
                      setIsPlaceCardMinimized(false);
                    }}
                    className="w-7 h-7 rounded-full bg-neutral-800/80 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white text-xs transition-colors cursor-pointer"
                    title="Close and unpin"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Names: English prominently displayed */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5">
                <div>
                  <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                    {selectedPlace.item.nameEn}
                  </h2>
                  <div className="text-xs text-neutral-400 mt-0.5">
                    {selectedPlace.item.nearestStation && (
                      <span>🚇 {formatEnglishStation(selectedPlace.item.nearestStation)} {selectedPlace.item.stationExit && `• ${selectedPlace.item.stationExit}`}</span>
                    )}
                  </div>
                </div>

                {/* Local Korean Name with Copy (designated for Taxi / Local navigation) */}
                {selectedPlace.item.nameKo && (
                  <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-lg self-start">
                    <span className="text-[10px] text-neutral-400 uppercase font-semibold">Local (Taxi):</span>
                    <span className="text-xs font-bold text-amber-400">{selectedPlace.item.nameKo}</span>
                    <button
                      onClick={() => handleCopy(selectedPlace.item.nameKo, 'korean-name')}
                      title="Copy Korean name for taxi or local map"
                      className="p-1 hover:text-white transition-colors cursor-pointer text-neutral-400"
                    >
                      {copiedText === 'korean-name' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* English Description */}
              {selectedPlace.item.description && (
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {selectedPlace.item.description}
                </p>
              )}

              {/* Special Featured Landmark Spotlight: Naedang Catholic Church */}
              {selectedPlace.item.id === 'naedang-catholic-church' && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-600/20 border border-amber-500/40 text-amber-200 space-y-2 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black flex items-center gap-1.5 text-amber-300">
                      <span>⭐ Featured Landmark: Catholic Parish of Daegu (Estd. 1965)</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/40 font-bold">
                      천주교 대구대교구 내당성당
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-100 flex items-start gap-1.5">
                    <span className="font-bold shrink-0">📅 Mass Schedule:</span>
                    <span>Sun 06:30, 10:00 (Main Solemn Mass), 19:30 | Sat 19:30 (Vigil) | Weekdays 06:30, 19:30</span>
                  </div>
                  <div className="text-[11px] text-emerald-300 flex items-start gap-1.5">
                    <span className="font-bold shrink-0">🚴 Bike Accessible Road:</span>
                    <span>Directly connected via Pyeongni-ro & Dalgubeol-daero bicycle lanes (300m North of Naedang Station Exit 2)</span>
                  </div>
                  <div className="text-[10px] text-neutral-300 italic">
                    Visitors & foreigners are warmly welcomed to attend Holy Mass or explore the historic bell tower.
                  </div>
                </div>
              )}

              {/* Practical Traveler Tips */}
              {selectedPlace.item.tips && (
                <div className="text-[11px] text-amber-400/90 flex items-start gap-1.5 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                  <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                  <span>{selectedPlace.item.tips}</span>
                </div>
              )}

              {/* Action Buttons Row */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {/* Save to Phone Favorites (retained permanently) */}
                <button
                  type="button"
                  id="toggle-favorite-place-btn"
                  onClick={() => handleToggleFavorite(selectedPlace.item.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                    favoritePlaceIds.includes(selectedPlace.item.id)
                      ? 'bg-amber-400 text-neutral-950 hover:bg-amber-300 font-extrabold ring-1 ring-amber-300'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${favoritePlaceIds.includes(selectedPlace.item.id) ? 'fill-current' : ''}`} />
                  <span>{favoritePlaceIds.includes(selectedPlace.item.id) ? 'Saved in Phone' : 'Save to Phone'}</span>
                </button>

                {/* Save or Remove Custom Pinned Location in Phone Storage */}
                {customPins.some((p) => p.id === selectedPlace.item.id) ? (
                  <button
                    type="button"
                    id="delete-custom-pin-btn"
                    onClick={() => handleDeleteCustomPin(selectedPlace.item.id)}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-600/20 text-rose-300 border border-rose-500/40 hover:bg-rose-600/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Pin</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    id="save-custom-pin-btn"
                    onClick={() => handleSaveCustomPin(selectedPlace.item)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30 hover:bg-blue-500/25 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Pin Spot to Phone</span>
                  </button>
                )}

                {/* Bike Route Connector */}
                <button
                  type="button"
                  id="view-bike-route-btn"
                  onClick={() => {
                    setShowBikeLayer(true);
                    setHighlightBikeRoads(true);
                    const isNaedang = selectedPlace.item.id === 'naedang-catholic-church';
                    const targetRoute = isNaedang
                      ? DAEGU_BIKE_ROUTES.find((r) => r.id === 'pyeongni-ro-naedang-bike-lane') || DAEGU_BIKE_ROUTES[0]
                      : DAEGU_BIKE_ROUTES[0];
                    setSelectedBikeRoute(targetRoute);
                    setFeedbackToast(`🚴 Activated ${targetRoute.nameEn}`);
                    setTimeout(() => setFeedbackToast(null), 2500);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Bike className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Bike Route</span>
                </button>

                {/* Naver Map (Essential in South Korea) */}
                <a
                  id="open-in-naver-map-btn"
                  href={`https://map.naver.com/v5/search/${encodeURIComponent(selectedPlace.item.nameKo || selectedPlace.item.nameEn)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[110px] px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 shadow-xs transition-colors text-center cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Naver Map</span>
                </a>

                {/* Google Maps */}
                <a
                  id="open-in-google-maps-btn"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedPlace.item.nameEn)}+${selectedPlace.item.lat},${selectedPlace.item.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[110px] px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-1.5 shadow-xs transition-colors text-center cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Google Maps</span>
                </a>

                {/* Pin as Hotel */}
                {selectedPlace.type !== 'residency' && (
                  <button
                    id="set-as-residency-btn"
                    onClick={() => {
                      onSetResidencyLocation(
                        { lat: selectedPlace.item.lat, lng: selectedPlace.item.lng },
                        selectedPlace.item.nameEn,
                        selectedPlace.item.nameKo
                      );
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>Pin as Hotel</span>
                  </button>
                )}

                {/* Call if phone available */}
                {selectedPlace.item.phone && (
                  <a
                    href={`tel:${selectedPlace.item.phone}`}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                )}
              </div>

              {/* Travel Estimate Breakdown */}
              <MultiModalDistanceCard
                userLocation={userLocation}
                targetCoords={{ lat: selectedPlace.item.lat, lng: selectedPlace.item.lng }}
                targetName={selectedPlace.item.nameEn}
                darkMode={darkMode}
              />
            </div>
          </div>
        )
      )}

      {/* Selected Bike Route Spotlight Card (when clicking a bike polyline) */}
      {selectedBikeRoute && !selectedPlace && (
        <div
          id="selected-bike-route-card"
          className={`p-4 border-t z-30 shadow-2xl transition-all ${
            darkMode ? 'bg-neutral-950 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900'
          }`}
        >
          <div className="max-w-3xl mx-auto space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: selectedBikeRoute.color }}
                />
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  🚴 {selectedBikeRoute.pathType}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {selectedBikeRoute.difficulty}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBikeGuideOpen(true)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Full Guide</span>
                </button>
                <button
                  onClick={() => setSelectedBikeRoute(null)}
                  className="w-6 h-6 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-100">
                  {selectedBikeRoute.nameEn}
                </h3>
                <div className="text-xs text-emerald-400 font-medium">
                  {selectedBikeRoute.nameKo}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-lg font-black font-mono text-emerald-400">
                  {selectedBikeRoute.lengthKm} <span className="text-xs font-normal">km</span>
                </div>
                <div className="text-[11px] text-neutral-400 font-mono">
                  ~{selectedBikeRoute.estimatedMinutes} mins
                </div>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              {selectedBikeRoute.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2 rounded-lg bg-neutral-900/60 border border-neutral-800">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                  Surface & Path
                </span>
                <span className="text-neutral-200">{selectedBikeRoute.surface}</span>
              </div>
              <div className="p-2 rounded-lg bg-neutral-900/60 border border-neutral-800">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                  Rental Hubs
                </span>
                <span className="text-neutral-200">{selectedBikeRoute.rentals}</span>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-center gap-1.5">
              <span>⚠️</span>
              <span><strong>Safety: </strong>{selectedBikeRoute.safetyTips}</span>
            </div>
          </div>
        </div>
      )}

      {/* Daegu Cycling Guide & Route Modal */}
      <BikeGuideModal
        isOpen={isBikeGuideOpen}
        onClose={() => setIsBikeGuideOpen(false)}
        darkMode={darkMode}
        onSelectRoute={(route) => {
          setSelectedBikeRoute(route);
          setShowBikeLayer(true);
          if (mapInstanceRef.current) {
            const bounds = L.latLngBounds(route.waypoints);
            mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
          }
        }}
        onFlyToAmenity={(amenity) => {
          setShowBikeLayer(true);
          setIsPlaceCardMinimized(false);
          setSelectedPlace({
            type: 'landmark',
            item: {
              id: amenity.id,
              nameEn: amenity.nameEn,
              nameKo: amenity.nameKo,
              category: 'bike_station',
              city: 'Daegu',
              lat: amenity.lat,
              lng: amenity.lng,
              description: `${amenity.notes} • Hours: ${amenity.hours || '24/7'} • Fee: ${amenity.fee || 'Free'}`,
              nearestStation: 'Daegu, South Korea',
              operatingHours: amenity.hours,
              admission: amenity.fee
            }
          });
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([amenity.lat, amenity.lng], 16, { duration: 1 });
          }
        }}
      />
    </div>
  );
};
