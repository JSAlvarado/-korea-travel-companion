import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Coordinates, ResidencyInfo } from './types';
import { Header } from './components/Header';
import { MapTab } from './components/MapTab';
import { ResidencyTab } from './components/ResidencyTab';
import { EmergencyTab } from './components/EmergencyTab';
import { CurrencyTab } from './components/CurrencyTab';
import { PhrasebookTab } from './components/PhrasebookTab';
import { TravelTipsModal } from './components/TravelTipsModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { searchKoreaPlaces } from './utils/geoSearch';
import { initializeAutoSync } from './utils/onlineSync';
import {
  MapPin,
  Home,
  AlertTriangle,
  Coins,
  Languages,
  CheckCircle2
} from 'lucide-react';

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<'map' | 'residency' | 'emergency' | 'currency' | 'phrases'>('map');

  // Dark mode (default to true for eye comfort and battery saving)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('kr_travel_dark_mode');
    return saved !== null ? saved === 'true' : true;
  });

  // Battery saver mode (reduces polling & heavy animations)
  const [batterySaver, setBatterySaver] = useState<boolean>(() => {
    const saved = localStorage.getItem('kr_travel_battery_saver');
    return saved === 'true';
  });

  // Default to central Seoul (Myeongdong / City Hall) so user can explore seamlessly pre-trip
  const [userLocation, setUserLocation] = useState<Coordinates>({ lat: 37.5665, lng: 126.9780 });
  const [gpsActive, setGpsActive] = useState<boolean>(false);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Residency hotel configurations (saved in localStorage)
  const [residencies, setResidencies] = useState<ResidencyInfo[]>(() => {
    try {
      const savedList = localStorage.getItem('kr_travel_residencies_list');
      if (savedList) {
        const parsed = JSON.parse(savedList);
        if (Array.isArray(parsed)) return parsed;
      }
      const single = localStorage.getItem('kr_travel_residency');
      if (single) {
        const parsedSingle = JSON.parse(single);
        if (parsedSingle && parsedSingle.name) {
          return [
            {
              ...parsedSingle,
              id: parsedSingle.id || 'stay_default_lotte',
              isConfigured: parsedSingle.isConfigured !== false
            }
          ];
        }
      }
    } catch {}
    return [
      {
        id: 'stay_default_daegu_marriott',
        name: 'Daegu Marriott Hotel (Dongdaegu Hub)',
        nameKo: '대구 메리어트 호텔 (동대구역)',
        addressEn: '6 Dongdaegu-ro, Dong-gu, Daegu (Near KTX Station)',
        addressKo: '대구광역시 동구 동대구로 6 (동대구역 복합환승센터 부근)',
        phone: '053-327-7000',
        roomNumber: '802',
        notes: 'Near Dongdaegu Station (KTX / Subway Line 1) Exit 2',
        lat: 35.8745,
        lng: 128.6258,
        isConfigured: true,
        updatedAt: new Date().toISOString()
      },
      {
        id: 'stay_default_hotel_susung',
        name: 'Hotel Susung (Suseong Lake Resort)',
        nameKo: '호텔수성 (수성못)',
        addressEn: '106-7 Yonghak-ro, Suseong-gu, Daegu',
        addressKo: '대구광역시 수성구 용학로 106-7',
        phone: '1899-1001',
        roomNumber: '512',
        notes: 'Overlooking Suseong Lake & Line 3 Sky Rail Suseongmot Station',
        lat: 35.8272,
        lng: 128.6180,
        isConfigured: true,
        updatedAt: new Date().toISOString()
      }
    ];
  });

  const [activeResidencyId, setActiveResidencyId] = useState<string | null>(() => {
    try {
      const savedId = localStorage.getItem('kr_travel_active_residency_id');
      if (savedId) return savedId;
    } catch {}
    return residencies[0]?.id || null;
  });

  // Currently active residence / staycation (or null if none exists)
  const activeResidency = useMemo(() => {
    if (!activeResidencyId) return residencies[0] || null;
    return residencies.find((r) => r.id === activeResidencyId) || residencies[0] || null;
  }, [residencies, activeResidencyId]);

  // Travel tips guide modal
  const [isTipsOpen, setIsTipsOpen] = useState(false);

  // Map tab fills the screen exactly; stop the 2-3px page overflow from showing a scrollbar
  useEffect(() => {
    document.documentElement.classList.toggle('no-page-scroll', activeTab === 'map');
  }, [activeTab]);

  // Save dark mode & battery saver
  useEffect(() => {
    localStorage.setItem('kr_travel_dark_mode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('kr_travel_battery_saver', String(batterySaver));
  }, [batterySaver]);

  // Automatically update all data (KRW exchange rates, Seoul weather, clock sync) whenever connected to internet even for an instant
  useEffect(() => {
    const cleanup = initializeAutoSync();
    return cleanup;
  }, []);

  // Add a new staycation/residence (only name and address required)
  const handleAddResidency = useCallback(
    async (name: string, address: string, coords?: Coordinates) => {
      let finalLat = coords?.lat;
      let finalLng = coords?.lng;

      // If coordinates not provided, use high-accuracy multi-tier search engine
      if (!finalLat || !finalLng) {
        try {
          const resolvedPlaces = await searchKoreaPlaces(address, userLocation, 1);
          if (resolvedPlaces.length > 0 && resolvedPlaces[0].lat && resolvedPlaces[0].lng) {
            finalLat = resolvedPlaces[0].lat;
            finalLng = resolvedPlaces[0].lng;
          }
        } catch {
          // Keep fallbacks below
        }
      }

      // Safe fallback if offline or geocoding misses (defaults to Daegu hub)
      if (!finalLat || !finalLng) {
        finalLat = userLocation?.lat || 35.8714;
        finalLng = userLocation?.lng || 128.6014;
      }

      const newStay: ResidencyInfo = {
        id: `stay_${Date.now()}`,
        name: name.trim() || 'My Staycation',
        nameKo: name.trim(),
        addressEn: address.trim() || 'Daegu, South Korea',
        addressKo: address.trim(),
        lat: finalLat,
        lng: finalLng,
        isConfigured: true,
        updatedAt: new Date().toISOString()
      };

      setResidencies((prev) => {
        const updated = [newStay, ...prev];
        try {
          localStorage.setItem('kr_travel_residencies_list', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      setActiveResidencyId(newStay.id);
      try {
        localStorage.setItem('kr_travel_active_residency_id', newStay.id);
        localStorage.setItem('kr_travel_residency', JSON.stringify(newStay));
      } catch {}

      showToast(`🏠 Added: ${newStay.name}`);
    },
    [userLocation]
  );

  // Delete a staycation/residence
  const handleDeleteResidency = useCallback(
    (id: string) => {
      setResidencies((prev) => {
        const target = prev.find((r) => r.id === id);
        const updated = prev.filter((r) => r.id !== id);
        try {
          localStorage.setItem('kr_travel_residencies_list', JSON.stringify(updated));
        } catch {}

        if (activeResidencyId === id) {
          const nextId = updated[0]?.id || null;
          setActiveResidencyId(nextId);
          try {
            if (nextId) {
              localStorage.setItem('kr_travel_active_residency_id', nextId);
              localStorage.setItem('kr_travel_residency', JSON.stringify(updated[0]));
            } else {
              localStorage.removeItem('kr_travel_active_residency_id');
              localStorage.removeItem('kr_travel_residency');
            }
          } catch {}
        }

        showToast(`🗑️ Deleted: ${target?.name || 'Staycation'}`);
        return updated;
      });
    },
    [activeResidencyId]
  );

  // Switch active staycation
  const handleSetActiveResidency = useCallback(
    (id: string) => {
      setActiveResidencyId(id);
      try {
        localStorage.setItem('kr_travel_active_residency_id', id);
        const target = residencies.find((r) => r.id === id);
        if (target) {
          localStorage.setItem('kr_travel_residency', JSON.stringify(target));
          showToast(`📍 Active stay: ${target.name}`);
        }
      } catch {}
    },
    [residencies]
  );

  // Save/update residency
  const handleUpdateResidency = useCallback((newInfo: ResidencyInfo) => {
    setResidencies((prev) => {
      const exists = prev.some((r) => r.id === newInfo.id);
      const updated = exists
        ? prev.map((r) => (r.id === newInfo.id ? newInfo : r))
        : [newInfo, ...prev];
      try {
        localStorage.setItem('kr_travel_residencies_list', JSON.stringify(updated));
        localStorage.setItem('kr_travel_residency', JSON.stringify(newInfo));
      } catch {}
      return updated;
    });
    setActiveResidencyId(newInfo.id);
    try {
      localStorage.setItem('kr_travel_active_residency_id', newInfo.id);
    } catch {}
    showToast(`🏨 Hotel saved: ${newInfo.name}`);
  }, []);

  // Update residency coordinate directly from map
  const handleSetResidencyLocation = useCallback(
    (coords: Coordinates, name?: string, nameKo?: string) => {
      if (activeResidency) {
        const updated: ResidencyInfo = {
          ...activeResidency,
          lat: coords.lat,
          lng: coords.lng,
          name: name || activeResidency.name,
          nameKo: nameKo || activeResidency.nameKo || activeResidency.name,
          isConfigured: true,
          updatedAt: new Date().toISOString()
        };
        handleUpdateResidency(updated);
      } else {
        handleAddResidency(name || 'My Hotel in Korea', 'Pinned on Map', coords);
      }
      showToast(`📍 Hotel pinned: ${name || 'Selected Location'}`);
    },
    [activeResidency, handleUpdateResidency, handleAddResidency]
  );

  // Geolocation handling (Detects if in Korea or keeps Seoul Explorer position)
  const refreshGps = useCallback(() => {
    if (!('geolocation' in navigator)) {
      showToast('Using Seoul center navigation');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // Check if inside South Korea (Lat 33.0 to 38.9, Lng 124.0 to 132.0)
        const isInKorea = latitude >= 33.0 && latitude <= 38.9 && longitude >= 124.0 && longitude <= 132.0;

        if (isInKorea) {
          setUserLocation({ lat: latitude, lng: longitude });
          setGpsActive(true);
          showToast('📍 Live GPS position locked in Korea');
        } else {
          // If user is overseas testing before trip, keep user in Seoul Center
          setUserLocation({ lat: 37.5665, lng: 126.9780 });
          setGpsActive(true);
          showToast('📍 Showing Seoul Center (Pre-trip navigation)');
        }
      },
      () => {
        // Fallback to Seoul
        setUserLocation({ lat: 37.5665, lng: 126.9780 });
        setGpsActive(false);
      },
      {
        enableHighAccuracy: !batterySaver,
        timeout: 10000,
        maximumAge: batterySaver ? 60000 : 15000
      }
    );
  }, [batterySaver]);

  // Set current GPS as residency
  const handleUseCurrentLocationAsResidency = useCallback(() => {
    if (userLocation) {
      handleSetResidencyLocation(userLocation, 'My Hotel Location', '내 숙소');
    } else {
      refreshGps();
    }
  }, [userLocation, handleSetResidencyLocation, refreshGps]);

  // Initial GPS check on mount
  useEffect(() => {
    refreshGps();
  }, [refreshGps]);

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors ${
        darkMode ? 'bg-neutral-950 text-neutral-100' : 'bg-neutral-100 text-neutral-900'
      }`}
    >
      {/* Top Application Bar */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        batterySaver={batterySaver}
        setBatterySaver={setBatterySaver}
        onOpenSos={() => setActiveTab('emergency')}
        onOpenGuide={() => setIsTipsOpen(true)}
        gpsActive={gpsActive}
      />

      {/* Offline Status Alert */}
      <OfflineIndicator />

      {/* Main Tab Content */}
      <main className="flex-1 w-full relative pb-16">
        {activeTab === 'map' && (
          <MapTab
            userLocation={userLocation}
            residency={activeResidency}
            onSetResidencyLocation={handleSetResidencyLocation}
            darkMode={darkMode}
            batterySaver={batterySaver}
            onRefreshGps={refreshGps}
          />
        )}

        {activeTab === 'residency' && (
          <ResidencyTab
            userLocation={userLocation}
            residency={activeResidency}
            residencies={residencies}
            onAddResidency={handleAddResidency}
            onDeleteResidency={handleDeleteResidency}
            onSetActiveResidency={handleSetActiveResidency}
            onUpdateResidency={handleUpdateResidency}
            onNavigateToMap={() => setActiveTab('map')}
            darkMode={darkMode}
            onUseCurrentLocationAsResidency={handleUseCurrentLocationAsResidency}
          />
        )}

        {activeTab === 'emergency' && (
          <EmergencyTab
            userLocation={userLocation}
            darkMode={darkMode}
          />
        )}

        {activeTab === 'currency' && (
          <CurrencyTab
            darkMode={darkMode}
          />
        )}

        {activeTab === 'phrases' && (
          <PhrasebookTab
            darkMode={darkMode}
          />
        )}
      </main>

      {/* Mobile-First Bottom Navigation Bar */}
      <nav
        id="bottom-navigation-bar"
        className={`fixed bottom-0 left-0 right-0 z-40 border-t transition-colors ${
          darkMode ? 'bg-neutral-950/95 border-neutral-800' : 'bg-white/95 border-neutral-200'
        } backdrop-blur-md px-2 py-1 shadow-lg`}
      >
        <div className="max-w-md mx-auto flex items-center justify-around">
          {/* 1. Map */}
          <button
            id="tab-map-btn"
            onClick={() => setActiveTab('map')}
            className={`flex-1 py-1.5 px-2 rounded-xl flex flex-col items-center justify-center transition-all ${
              activeTab === 'map'
                ? 'text-blue-500 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <MapPin className={`w-5 h-5 ${activeTab === 'map' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5 font-medium">Map</span>
          </button>

          {/* 2. Home / Stay */}
          <button
            id="tab-residency-btn"
            onClick={() => setActiveTab('residency')}
            className={`flex-1 py-1.5 px-2 rounded-xl flex flex-col items-center justify-center transition-all ${
              activeTab === 'residency'
                ? 'text-amber-500 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Home className={`w-5 h-5 ${activeTab === 'residency' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5 font-medium">Home / Stay</span>
          </button>

          {/* 3. Emergency SOS */}
          <button
            id="tab-emergency-btn"
            onClick={() => setActiveTab('emergency')}
            className={`flex-1 py-1.5 px-2 rounded-xl flex flex-col items-center justify-center transition-all ${
              activeTab === 'emergency'
                ? 'text-red-500 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <AlertTriangle className={`w-5 h-5 ${activeTab === 'emergency' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5 font-medium">SOS</span>
          </button>

          {/* 4. Won Currency */}
          <button
            id="tab-currency-btn"
            onClick={() => setActiveTab('currency')}
            className={`flex-1 py-1.5 px-2 rounded-xl flex flex-col items-center justify-center transition-all ${
              activeTab === 'currency'
                ? 'text-emerald-500 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Coins className={`w-5 h-5 ${activeTab === 'currency' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5 font-medium">Won (₩)</span>
          </button>

          {/* 5. Korean Phrasebook */}
          <button
            id="tab-phrases-btn"
            onClick={() => setActiveTab('phrases')}
            className={`flex-1 py-1.5 px-2 rounded-xl flex flex-col items-center justify-center transition-all ${
              activeTab === 'phrases'
                ? 'text-purple-500 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Languages className={`w-5 h-5 ${activeTab === 'phrases' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5 font-medium">Phrases</span>
          </button>
        </div>
      </nav>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          id="app-toast-notification"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-medium text-xs shadow-2xl flex items-center gap-2 animate-fade-in"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* South Korea Travel Tips & Customs Modal */}
      <TravelTipsModal
        isOpen={isTipsOpen}
        onClose={() => setIsTipsOpen(false)}
        darkMode={darkMode}
      />
    </div>
  );
}
