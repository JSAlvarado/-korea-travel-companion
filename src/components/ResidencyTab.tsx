import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Coordinates, ResidencyInfo } from '../types';
import {
  calculateDistanceMeters,
  formatDistance,
  calculateBearing,
  getCardinalDirection,
  estimateWalkMinutes,
  estimateDriveMinutes
} from '../utils/geo';
import { searchKoreaPlaces, KoreaSearchResult } from '../utils/geoSearch';
import { PinpointPickerMap } from './PinpointPickerMap';
import {
  Home,
  Navigation,
  MapPin,
  Train,
  Footprints,
  Copy,
  Check,
  Plus,
  Trash2,
  Sparkles,
  Compass,
  ExternalLink,
  ShieldCheck,
  Building,
  CheckCircle2,
  Loader2,
  X,
  Crosshair,
  Sliders,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ResidencyTabProps {
  userLocation: Coordinates | null;
  residency: ResidencyInfo | null;
  residencies?: ResidencyInfo[];
  onAddResidency: (name: string, address: string, coords?: Coordinates) => Promise<void> | void;
  onDeleteResidency: (id: string) => void;
  onSetActiveResidency: (id: string) => void;
  onUpdateResidency: (info: ResidencyInfo) => void;
  onNavigateToMap: () => void;
  darkMode: boolean;
  onUseCurrentLocationAsResidency: () => void;
}

// Quick traveler accommodation presets in South Korea (Prioritizing Daegu Hub)
const POPULAR_HOTEL_PRESETS = [
  {
    name: 'Daegu Marriott Hotel (Dongdaegu Hub)',
    address: '6 Dongdaegu-ro, Dong-gu, Daegu',
    lat: 35.8745,
    lng: 128.6258
  },
  {
    name: 'Hotel Susung (Suseong Lake Luxury)',
    address: '106-7 Yonghak-ro, Suseong-gu, Daegu',
    lat: 35.8272,
    lng: 128.6180
  },
  {
    name: 'Eldis Regent Hotel (Dongseongno & Modern Alleys)',
    address: '2033 Dalgubeol-daero, Jung-gu, Daegu',
    lat: 35.8654,
    lng: 128.5885
  },
  {
    name: 'Hotel Inter-Burgo Daegu (Mangwoo Park)',
    address: '212 Palhyeon-gil, Suseong-gu, Daegu',
    lat: 35.8741,
    lng: 128.6631
  },
  {
    name: 'Toyoko Inn Daegu Dongseongno',
    address: '15 Dongseong-ro 1-gil, Jung-gu, Daegu',
    lat: 35.8682,
    lng: 128.5956
  },
  {
    name: 'Lotte Hotel Seoul (Myeongdong)',
    address: '30 Eulji-ro, Jung-gu, Seoul',
    lat: 37.5658,
    lng: 126.9816
  },
  {
    name: 'Grand Josun Busan (Haeundae Beach)',
    address: '292 Haeundaehaebyeon-ro, Haeundae-gu, Busan',
    lat: 35.1601,
    lng: 129.1624
  }
];

export const ResidencyTab: React.FC<ResidencyTabProps> = ({
  userLocation,
  residency,
  residencies = [],
  onAddResidency,
  onDeleteResidency,
  onSetActiveResidency,
  onUpdateResidency,
  onNavigateToMap,
  darkMode,
  onUseCurrentLocationAsResidency
}) => {
  // Show Add Staycation form toggle
  const [showAddForm, setShowAddForm] = useState<boolean>(!residency && residencies.length === 0);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Simplified Add Form State: ONLY Name and Address!
  const [nameInput, setNameInput] = useState<string>('');
  const [addressInput, setAddressInput] = useState<string>('');
  const [customCoords, setCustomCoords] = useState<Coordinates | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGpsLoading, setIsGpsLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Live address autocomplete & search state
  const [addressSuggestions, setAddressSuggestions] = useState<KoreaSearchResult[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState<boolean>(false);
  const [showAddressDropdown, setShowAddressDropdown] = useState<boolean>(false);
  const addressContainerRef = useRef<HTMLDivElement>(null);

  // Active stay pinpoint adjustment state
  const [isAdjustingActivePin, setIsAdjustingActivePin] = useState<boolean>(false);
  const [adjustedCoords, setAdjustedCoords] = useState<Coordinates | null>(null);
  const [adjustedAddress, setAdjustedAddress] = useState<string>('');
  const [isSavingAdjustment, setIsSavingAdjustment] = useState<boolean>(false);

  // Close address suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addressContainerRef.current && !addressContainerRef.current.contains(e.target as Node)) {
        setShowAddressDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced address search for Google Maps-level accuracy in suggestions
  useEffect(() => {
    const q = addressInput.trim();
    if (q.length < 2) {
      setAddressSuggestions([]);
      setIsSearchingAddress(false);
      return;
    }

    setIsSearchingAddress(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchKoreaPlaces(q, userLocation, 5);
        setAddressSuggestions(results);
      } catch {
        setAddressSuggestions([]);
      } finally {
        setIsSearchingAddress(false);
      }
    }, 240);

    return () => clearTimeout(timer);
  }, [addressInput, userLocation]);

  // Calculate live navigation to current residency
  const navStats = useMemo(() => {
    if (!userLocation || !residency || !residency.isConfigured || !residency.lat || !residency.lng) {
      return null;
    }
    const distanceMeters = calculateDistanceMeters(userLocation, {
      lat: residency.lat,
      lng: residency.lng
    });
    const bearing = calculateBearing(userLocation, {
      lat: residency.lat,
      lng: residency.lng
    });
    const cardinal = getCardinalDirection(bearing);
    const walkMin = estimateWalkMinutes(distanceMeters);
    const driveMin = estimateDriveMinutes(distanceMeters);

    return {
      distanceMeters,
      formattedDistance: formatDistance(distanceMeters),
      bearing,
      cardinal,
      walkMin,
      driveMin
    };
  }, [userLocation, residency]);

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Helper: auto-fill address using current GPS location
  const handleUseCurrentGpsForForm = async () => {
    if (!userLocation) {
      onUseCurrentLocationAsResidency();
      return;
    }
    setIsGpsLoading(true);
    setFormError(null);
    setCustomCoords(userLocation);

    if (!nameInput.trim()) {
      setNameInput('My Current Stay');
    }

    try {
      // Reverse geocode in English
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation.lat}&lon=${userLocation.lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        const fullAddress = data.display_name || `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`;
        setAddressInput(fullAddress);
      } else {
        setAddressInput(`Current GPS Location (${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)})`);
      }
    } catch {
      setAddressInput(`Current GPS Location (${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)})`);
    } finally {
      setIsGpsLoading(false);
    }
  };

  // Handle simple form submit (only name & address)
  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      setFormError('Please enter a name for your staycation or residence.');
      return;
    }
    if (!addressInput.trim()) {
      setFormError('Please enter an address for your staycation or residence.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await onAddResidency(nameInput.trim(), addressInput.trim(), customCoords || undefined);
      // Reset form
      setNameInput('');
      setAddressInput('');
      setCustomCoords(null);
      setShowAddForm(false);
    } catch {
      setFormError('Failed to save staycation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1-tap quick add popular preset
  const handleAddPreset = async (preset: typeof POPULAR_HOTEL_PRESETS[0]) => {
    setIsSubmitting(true);
    try {
      await onAddResidency(preset.name, preset.address, { lat: preset.lat, lng: preset.lng });
      setShowAddForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Request deletion with confirmation
  const handleDeleteClick = (id: string) => {
    if (confirmDeleteId === id) {
      onDeleteResidency(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => {
        setConfirmDeleteId((prev) => (prev === id ? null : prev));
      }, 4000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-5 space-y-4 pb-20">
      {/* Top Header Banner */}
      <div
        className={`p-4 rounded-2xl border transition-colors ${
          darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
        } shadow-sm`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                My Staycation & Residence
              </h2>
              <p className="text-xs text-neutral-400">
                Save and manage your stay in South Korea with just a name and address.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="toggle-add-staycation-btn"
              onClick={() => {
                setShowAddForm(!showAddForm);
                setFormError(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                showAddForm
                  ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold'
              }`}
            >
              {showAddForm ? (
                <>
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Add Staycation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Streamlined Add Form: ONLY Name & Address required */}
      {showAddForm && (
        <div
          id="add-staycation-form-card"
          className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            darkMode ? 'bg-neutral-900 border-amber-500/30' : 'bg-white border-amber-300'
          } shadow-lg space-y-3.5 animate-in fade-in duration-200`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm">Add New Staycation or Residence</h3>
            </div>
            <span className="text-[11px] text-amber-400 font-medium">
              Only Name & Address Needed
            </span>
          </div>

          {formError && (
            <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-400">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmitAdd} className="space-y-3">
            {/* Field 1: Name */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Staycation / Residence Name <span className="text-amber-400">*</span>
              </label>
              <input
                id="residence-name-input"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Myeongdong Airbnb, Lotte Hotel, Seoul Staycation"
                required
                className={`w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border outline-none transition-colors ${
                  darkMode
                    ? 'bg-neutral-950 border-neutral-700 focus:border-amber-500 text-white placeholder-neutral-500'
                    : 'bg-neutral-50 border-neutral-300 focus:border-amber-500 text-neutral-900 placeholder-neutral-400'
                }`}
              />
            </div>

            {/* Field 2: Address */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-neutral-300">
                  Address <span className="text-amber-400">*</span>
                </label>
                <button
                  type="button"
                  id="autofill-gps-address-btn"
                  onClick={handleUseCurrentGpsForForm}
                  disabled={isGpsLoading}
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
                >
                  {isGpsLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <MapPin className="w-3 h-3" />
                  )}
                  <span>Use My Current Location as Address</span>
                </button>
              </div>

              <div ref={addressContainerRef} className="relative">
                <input
                  id="residence-address-input"
                  type="text"
                  value={addressInput}
                  onFocus={() => {
                    if (addressSuggestions.length > 0) setShowAddressDropdown(true);
                  }}
                  onChange={(e) => {
                    setAddressInput(e.target.value);
                    setShowAddressDropdown(true);
                  }}
                  placeholder="e.g. 30 Eulji-ro, Jung-gu, Seoul or Haeundae Beach, Busan"
                  required
                  className={`w-full px-3.5 py-2 pr-9 rounded-xl text-xs sm:text-sm border outline-none transition-colors ${
                    darkMode
                      ? 'bg-neutral-950 border-neutral-700 focus:border-amber-500 text-white placeholder-neutral-500'
                      : 'bg-neutral-50 border-neutral-300 focus:border-amber-500 text-neutral-900 placeholder-neutral-400'
                  }`}
                />
                {isSearchingAddress && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  </div>
                )}

                {/* Suggestions Dropdown */}
                {showAddressDropdown && addressSuggestions.length > 0 && (
                  <div
                    id="address-suggestions-dropdown"
                    className={`absolute top-full left-0 right-0 mt-1.5 rounded-xl shadow-2xl border z-50 overflow-hidden backdrop-blur-xl max-h-56 overflow-y-auto ${
                      darkMode
                        ? 'bg-neutral-950/95 border-neutral-700 divide-y divide-neutral-800 text-neutral-100'
                        : 'bg-white/95 border-neutral-200 divide-y divide-neutral-100 text-neutral-900'
                    }`}
                  >
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 bg-neutral-900/30 flex items-center justify-between">
                      <span>Address Matches ({addressSuggestions.length})</span>
                      <span className="text-[9px] text-amber-400">Tap to select & pin</span>
                    </div>
                    {addressSuggestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (!nameInput.trim() || nameInput === 'My Current Stay') {
                            setNameInput(item.nameEn);
                          }
                          setAddressInput(item.addressEn || item.nameEn);
                          setCustomCoords({ lat: item.lat, lng: item.lng });
                          setShowAddressDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2.5 flex items-start gap-2.5 hover:bg-amber-500/15 active:bg-amber-500/25 transition-colors cursor-pointer group"
                      >
                        <div className="w-6 h-6 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5 text-xs">
                          {item.type === 'hotel' ? '🏨' : item.type === 'transit' ? '🚇' : item.type === 'district' ? '📍' : '🏠'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold group-hover:text-amber-400 transition-colors truncate">
                            {item.nameEn}
                          </div>
                          <div className="text-[11px] text-neutral-400 truncate mt-0.5">
                            {item.addressEn || item.subtitle || item.nameKo}
                          </div>
                        </div>
                        {item.confidence && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono shrink-0 self-center">
                            {item.confidence === 'high' ? 'Verified' : 'OSM'}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-[11px] text-neutral-500 mt-1">
                Type any street, hotel, district, or landmark in Korea, or tap below to pinpoint on the map.
              </p>

              {/* Pinpoint Picker Mini-Map: Drag pin to fine-tune building entrance */}
              <div className="mt-2.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-amber-400" />
                    <span>Exact Entrance Pinpoint</span>
                  </label>
                  <span className="text-[10px] text-amber-400 font-mono">
                    {customCoords
                      ? `${customCoords.lat.toFixed(5)}, ${customCoords.lng.toFixed(5)}`
                      : userLocation
                      ? `${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}`
                      : '37.5665, 126.9780'}
                  </span>
                </div>

                <PinpointPickerMap
                  coords={customCoords || userLocation || { lat: 37.5665, lng: 126.9780 }}
                  onChangeCoords={(coords, revEn) => {
                    setCustomCoords(coords);
                    if (revEn && (!addressInput.trim() || addressInput.startsWith('Current GPS Location'))) {
                      setAddressInput(revEn);
                    }
                  }}
                  darkMode={darkMode}
                  height="210px"
                  pinLabel={nameInput.trim() || 'My Stay Pin'}
                />
                <p className="text-[10px] text-neutral-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>Tip: You can drag the 🏠 pin or click anywhere on the street map to pinpoint your exact entrance.</span>
                </p>
              </div>
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormError(null);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="save-residence-btn"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Save Staycation</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Current Active Staycard & Live Return Compass */}
      {residency && residency.isConfigured ? (
        <div
          id="current-residency-card"
          className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            darkMode
              ? 'bg-gradient-to-b from-neutral-900 to-neutral-950 border-amber-500/40'
              : 'bg-gradient-to-b from-amber-50/70 to-white border-amber-300'
          } shadow-md space-y-4`}
        >
          {/* Header Row: Badge & Delete Button */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                Active Staycation / Residence
              </span>
            </div>

            {/* Delete Button for Current Residence */}
            <button
              id="delete-current-staycation-btn"
              onClick={() => handleDeleteClick(residency.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                confirmDeleteId === residency.id
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30'
              }`}
              title="Delete this staycation"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>
                {confirmDeleteId === residency.id ? 'Confirm Delete?' : 'Delete Staycation'}
              </span>
            </button>
          </div>

          {/* Staycation Info: Name & Address */}
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-neutral-100">
              {residency.name}
            </h3>
            <div className="flex items-center justify-between gap-2 mt-1 flex-wrap">
              <p className="text-xs sm:text-sm text-neutral-300">
                {residency.addressEn || residency.addressKo || 'Address not specified'}
              </p>
              <button
                onClick={() => handleCopy(residency.addressEn || residency.addressKo || '', 'address')}
                className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer shrink-0"
              >
                {copiedField === 'address' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>Copy Address</span>
              </button>
            </div>
          </div>

          {/* Live Return Compass & Distance stats */}
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex items-center justify-center shrink-0">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-amber-500/40 flex items-center justify-center">
                  <div
                    className="w-11 h-11 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shadow-lg transition-transform duration-500"
                    style={{
                      transform: navStats ? `rotate(${navStats.bearing}deg)` : 'rotate(0deg)'
                    }}
                  >
                    <Navigation className="w-5 h-5 fill-neutral-950" />
                  </div>
                </div>
                <span className="absolute -top-1 text-[8px] font-mono font-bold text-neutral-400">N</span>
              </div>

              <div>
                <div className="text-[11px] text-neutral-400 font-medium">Distance from you</div>
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-amber-400">
                  {navStats ? navStats.formattedDistance : 'Acquiring GPS...'}
                </div>
                <div className="flex items-center gap-2.5 text-xs text-neutral-400 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Footprints className="w-3.5 h-3.5 text-blue-400" />
                    ~{navStats ? navStats.walkMin : '--'} min walk
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Train className="w-3.5 h-3.5 text-purple-400" />
                    ~{navStats ? Math.max(2, Math.round(navStats.walkMin / 3.2)) : '--'} min subway
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
              <button
                id="toggle-adjust-active-pin-btn"
                onClick={() => {
                  const nextState = !isAdjustingActivePin;
                  setIsAdjustingActivePin(nextState);
                  if (nextState) {
                    setAdjustedCoords({ lat: residency.lat, lng: residency.lng });
                    setAdjustedAddress(residency.addressEn || residency.addressKo || '');
                  }
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isAdjustingActivePin
                    ? 'bg-amber-500 text-neutral-950 shadow-md font-extrabold'
                    : 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/30'
                }`}
                title="Adjust your exact door or entrance pin on the map"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>{isAdjustingActivePin ? 'Close Pin Tool' : 'Adjust Pinpoint'}</span>
              </button>

              <button
                id="view-residency-map-btn"
                onClick={onNavigateToMap}
                className="flex-1 md:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Show On Map</span>
              </button>

              <a
                href={`https://map.naver.com/v5/search/${encodeURIComponent(residency.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Naver Map</span>
              </a>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(residency.name)}+${residency.lat},${residency.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Google</span>
              </a>
            </div>
          </div>

          {/* Expandable Fine-Tune Pinpoint Editor for Active Stay */}
          {isAdjustingActivePin && (
            <div
              id="active-stay-pinpoint-panel"
              className="p-3.5 sm:p-4 rounded-xl bg-neutral-950/90 border border-amber-500/40 space-y-3 animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                    <Crosshair className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-100">
                      Fine-Tune Exact Entrance Pinpoint
                    </h4>
                    <p className="text-[11px] text-neutral-400">
                      Drag the 🏠 pin to your exact building door, gate, or alleyway.
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {adjustedCoords
                    ? `${adjustedCoords.lat.toFixed(5)}, ${adjustedCoords.lng.toFixed(5)}`
                    : `${residency.lat.toFixed(5)}, ${residency.lng.toFixed(5)}`}
                </span>
              </div>

              <PinpointPickerMap
                coords={adjustedCoords || { lat: residency.lat, lng: residency.lng }}
                onChangeCoords={(coords, revEn) => {
                  setAdjustedCoords(coords);
                  if (revEn) setAdjustedAddress(revEn);
                }}
                darkMode={darkMode}
                height="220px"
                pinLabel={residency.name}
              />

              <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
                <div className="text-[11px] text-neutral-400 truncate max-w-sm">
                  {adjustedAddress ? `Updated: ${adjustedAddress}` : residency.addressEn}
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsAdjustingActivePin(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSavingAdjustment}
                    onClick={async () => {
                      if (adjustedCoords) {
                        setIsSavingAdjustment(true);
                        try {
                          await onUpdateResidency({
                            ...residency,
                            lat: adjustedCoords.lat,
                            lng: adjustedCoords.lng,
                            addressEn: adjustedAddress || residency.addressEn,
                            updatedAt: new Date().toISOString()
                          });
                          setIsAdjustingActivePin(false);
                        } finally {
                          setIsSavingAdjustment(false);
                        }
                      }
                    }}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                  >
                    {isSavingAdjustment ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Save Pinpoint</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State when no staycation is configured / all deleted */
        <div
          id="no-residency-empty-state"
          className={`p-6 sm:p-8 rounded-2xl border text-center transition-colors ${
            darkMode ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'
          } shadow-sm space-y-3`}
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 mx-auto flex items-center justify-center text-2xl">
            🏠
          </div>
          <h3 className="text-base sm:text-lg font-bold">No Current Staycation or Residence</h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
            You don't have an active staycation or residence right now. Add your hotel, Airbnb, or residence with just a name and address so you can track your route back anytime.
          </p>
          <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add Staycation</span>
            </button>
            <button
              onClick={onUseCurrentLocationAsResidency}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>Use Current GPS Location</span>
            </button>
          </div>
        </div>
      )}

      {/* Saved Staycations List (if user has saved multiple stays) */}
      {residencies.length > 0 && (
        <div
          className={`p-4 sm:p-5 rounded-2xl border transition-colors ${
            darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
          } shadow-sm space-y-3`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-sm">Saved Staycations & Residences ({residencies.length})</h4>
            </div>
            <span className="text-[11px] text-neutral-500">Available offline</span>
          </div>

          <div className="space-y-2">
            {residencies.map((stay) => {
              const isActive = residency?.id === stay.id;
              const distance = userLocation
                ? formatDistance(calculateDistanceMeters(userLocation, { lat: stay.lat, lng: stay.lng }))
                : null;

              return (
                <div
                  key={stay.id}
                  className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isActive
                      ? darkMode
                        ? 'bg-amber-500/10 border-amber-500/40 text-neutral-100'
                        : 'bg-amber-50 border-amber-300 text-neutral-900'
                      : darkMode
                      ? 'bg-neutral-950/40 border-neutral-800 hover:bg-neutral-800/40'
                      : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100/60'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm truncate">{stay.name}</span>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                          Active Stay
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-neutral-400 truncate mt-0.5">
                      {stay.addressEn || stay.addressKo}
                      {distance && <span className="ml-1 text-amber-400/90 font-mono">• {distance} away</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {!isActive && (
                      <button
                        onClick={() => onSetActiveResidency(stay.id)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-colors cursor-pointer shadow-xs"
                      >
                        Set as Active
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onSetActiveResidency(stay.id);
                        onNavigateToMap();
                      }}
                      className="p-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
                      title="Show on map"
                    >
                      <Compass className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(stay.id)}
                      className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        confirmDeleteId === stay.id
                          ? 'bg-red-600 text-white animate-pulse'
                          : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                      }`}
                      title="Delete staycation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Tourist Hotel Presets (For 1-tap testing) */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-colors ${
          darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
        } shadow-sm`}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h4 className="font-bold text-sm">Quick Add Popular Tourist Stays</h4>
        </div>
        <p className="text-xs text-neutral-400 mb-3">
          Traveling in Seoul or Busan? Tap any stay below to add it instantly with its verified address.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {POPULAR_HOTEL_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleAddPreset(preset)}
              disabled={isSubmitting}
              className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer group ${
                darkMode
                  ? 'bg-neutral-950/60 hover:bg-neutral-800 border-neutral-800 hover:border-amber-500/30'
                  : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 hover:border-amber-400'
              }`}
            >
              <div className="font-bold text-xs truncate group-hover:text-amber-400 transition-colors text-neutral-100">
                + {preset.name}
              </div>
              <div className="text-[11px] text-neutral-400 truncate mt-0.5">
                {preset.address}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
