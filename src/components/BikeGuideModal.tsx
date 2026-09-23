import React, { useState } from 'react';
import { BicycleRoute, BikeAmenity } from '../types';
import { DAEGU_BIKE_ROUTES, BIKE_AMENITIES, KOREA_CYCLING_GUIDE } from '../data/bikeRoutes';
import {
  Bike,
  X,
  MapPin,
  Clock,
  Gauge,
  ShieldCheck,
  Navigation,
  Wrench,
  AlertTriangle,
  Compass,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface BikeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onSelectRoute: (route: BicycleRoute) => void;
  onFlyToAmenity: (amenity: BikeAmenity) => void;
  onStartCyclingTrack?: (route: BicycleRoute) => void;
}

export const BikeGuideModal: React.FC<BikeGuideModalProps> = ({
  isOpen,
  onClose,
  darkMode,
  onSelectRoute,
  onFlyToAmenity,
  onStartCyclingTrack
}) => {
  const [activeTab, setActiveTab] = useState<'routes' | 'amenities' | 'rules'>('routes');
  const [selectedRouteId, setSelectedRouteId] = useState<string>(DAEGU_BIKE_ROUTES[0].id);

  if (!isOpen) return null;

  const currentRoute = DAEGU_BIKE_ROUTES.find((r) => r.id === selectedRouteId) || DAEGU_BIKE_ROUTES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="bike-guide-modal"
        className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden ${
          darkMode ? 'bg-neutral-950 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-neutral-800/60 flex items-center justify-between bg-gradient-to-r from-emerald-950/40 via-neutral-900/30 to-neutral-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-xs">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">Daegu Cycling & Bike Routes</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  자전거 지도
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Car-free river paths, lake promenades, rental stations & subway rules
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 pt-2.5 pb-2 border-b border-neutral-800/50 flex gap-2">
          {[
            { id: 'routes', label: `🚴 Designated Routes (${DAEGU_BIKE_ROUTES.length})` },
            { id: 'amenities', label: `🔧 Rentals & Air Pumps (${BIKE_AMENITIES.length})` },
            { id: 'rules', label: '📜 Safety & Subway Rules' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : darkMode
                  ? 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                  : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 border border-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'routes' && (
            <div className="space-y-4">
              {/* Route Selector Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {DAEGU_BIKE_ROUTES.map((route) => (
                  <button
                    key={route.id}
                    onClick={() => setSelectedRouteId(route.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      selectedRouteId === route.id
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-bold'
                        : darkMode
                        ? 'bg-neutral-900/80 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                        : 'bg-neutral-100 text-neutral-700 hover:text-neutral-900 border border-neutral-200'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: route.color }}
                    />
                    <span>{route.nameEn.split(' ')[0]} {route.nameEn.split(' ')[1]}</span>
                    <span className="text-[10px] opacity-70">({route.lengthKm} km)</span>
                  </button>
                ))}
              </div>

              {/* Selected Route Spotlight Card */}
              <div
                className={`p-4 rounded-xl border relative overflow-hidden ${
                  darkMode ? 'bg-neutral-900/70 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                }`}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: currentRoute.color }}
                />

                <div className="flex items-start justify-between gap-3 pt-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {currentRoute.pathType}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {currentRoute.difficulty}
                      </span>
                    </div>
                    <h3 className="text-base font-bold mt-1.5 text-neutral-100">
                      {currentRoute.nameEn}
                    </h3>
                    <div className="text-xs text-emerald-400 font-medium">
                      {currentRoute.nameKo}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xl font-black font-mono text-emerald-400">
                      {currentRoute.lengthKm} <span className="text-xs font-normal">km</span>
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono">
                      ~{currentRoute.estimatedMinutes} mins
                    </div>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-neutral-300 mt-2.5">
                  {currentRoute.description}
                </p>

                {/* Specs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs">
                  <div className="p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-0.5">
                      🛣️ Surface & Infrastructure
                    </span>
                    <span className="text-neutral-200">{currentRoute.surface}</span>
                  </div>

                  <div className="p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-0.5">
                      🚲 Rentals & Shared Hubs
                    </span>
                    <span className="text-neutral-200">{currentRoute.rentals}</span>
                  </div>
                </div>

                {/* Safety Tips */}
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 mt-3 text-xs text-amber-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300">Safety Tip: </span>
                    {currentRoute.safetyTips}
                  </div>
                </div>

                {/* Highlights */}
                <div className="mt-3">
                  <span className="text-[11px] font-bold text-neutral-400 block mb-1.5">
                    ✨ Key Scenic Highlights along the route:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentRoute.highlights.map((h, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md text-[11px] bg-neutral-800 text-neutral-200 border border-neutral-700"
                      >
                        • {h}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-neutral-800/80">
                  <button
                    onClick={() => {
                      onSelectRoute(currentRoute);
                      onClose();
                    }}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Show Route on Map</span>
                  </button>

                  {onStartCyclingTrack && (
                    <button
                      onClick={() => {
                        onStartCyclingTrack(currentRoute);
                        onClose();
                      }}
                      className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Bike className="w-3.5 h-3.5" />
                      <span>Start Tracker</span>
                    </button>
                  )}
                </div>
              </div>

              {/* All Routes Scannable List */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  All 7 Daegu Bicycle Corridors
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DAEGU_BIKE_ROUTES.map((route) => (
                    <div
                      key={route.id}
                      onClick={() => setSelectedRouteId(route.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        selectedRouteId === route.id
                          ? 'border-emerald-500/60 bg-emerald-500/10'
                          : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/40'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-neutral-200">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: route.color }}
                          />
                          <span>{route.nameEn}</span>
                        </div>
                        <span className="font-mono text-emerald-400">{route.lengthKm}km</span>
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-1 line-clamp-1">
                        {route.nameKo}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'amenities' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-800 text-xs text-neutral-300">
                <p className="leading-relaxed">
                  Daegu operates automated free solar tire inflators along the Sincheon River, public bike
                  terminals at high-speed railway stations, and high-capacity rental plazas at scenic spots.
                </p>
              </div>

              <div className="space-y-2">
                {BIKE_AMENITIES.map((amenity) => (
                  <div
                    key={amenity.id}
                    className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-emerald-500/40 transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">
                          {amenity.type === 'repair_pump' ? '💨' : amenity.type === 'rental_station' ? '🚲' : '🅿️'}
                        </span>
                        <h4 className="text-xs font-bold text-neutral-100">{amenity.nameEn}</h4>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400">
                          {amenity.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-400 font-medium pl-6">
                        {amenity.nameKo}
                      </div>
                      <p className="text-[11px] text-neutral-300 pl-6 leading-relaxed">
                        {amenity.notes}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-neutral-400 pl-6 pt-1">
                        {amenity.hours && <span>🕒 {amenity.hours}</span>}
                        {amenity.fee && <span className="text-emerald-300 font-semibold">💳 {amenity.fee}</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onFlyToAmenity(amenity);
                        onClose();
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-[11px] font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Locate</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40 text-xs text-blue-200 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <span className="font-bold">Korean Road Traffic Law for Bicycles:</span> Korea designates bicycles as vehicles. Follow standard traffic signals and designated lanes.
                </div>
              </div>

              <div className="space-y-2.5">
                {KOREA_CYCLING_GUIDE.rules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-neutral-100 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{rule.topicEn}</span>
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-300">
                        {rule.badge}
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-400 font-medium pl-5">
                      {rule.topicKo}
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed pl-5">
                      {rule.descEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info banner */}
        <div className="px-4 py-2.5 bg-neutral-950 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
          <span>💡 Tip: Sincheon River path connects directly to Geumho River cross-country expressway.</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
