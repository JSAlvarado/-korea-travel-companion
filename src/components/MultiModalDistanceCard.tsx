import React, { useState } from 'react';
import { Coordinates, MultiModalEstimate } from '../types';
import { calculateDistanceMeters, calculateMultiModalEstimate, formatDistance } from '../utils/geo';
import {
  Footprints,
  Bike,
  Train,
  Clock,
  Flame,
  CreditCard,
  ChevronRight,
  Info
} from 'lucide-react';

interface MultiModalDistanceCardProps {
  userLocation: Coordinates | null;
  targetCoords: Coordinates;
  targetName: string;
  darkMode: boolean;
}

export const MultiModalDistanceCard: React.FC<MultiModalDistanceCardProps> = ({
  userLocation,
  targetCoords,
  targetName,
  darkMode
}) => {
  const [activeModeTab, setActiveModeTab] = useState<'walking' | 'transit' | 'cycling'>('walking');

  if (!userLocation) {
    return (
      <div className="p-3 rounded-xl bg-neutral-900/40 border border-neutral-800 text-xs text-neutral-400 flex items-center gap-2">
        <Info className="w-4 h-4 text-blue-400 shrink-0" />
        <span>Enable GPS to view live travel distances & time estimates to {targetName}.</span>
      </div>
    );
  }

  const directDistance = calculateDistanceMeters(userLocation, targetCoords);
  const estimate: MultiModalEstimate = calculateMultiModalEstimate(directDistance);

  return (
    <div
      className={`rounded-xl border p-3 transition-colors ${
        darkMode ? 'bg-neutral-900/60 border-neutral-800 text-neutral-100' : 'bg-neutral-50 border-neutral-200 text-neutral-900'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 font-semibold">
          Distance & Travel Estimates
        </span>
        <span className="text-xs font-mono font-bold text-blue-400">
          Direct: {formatDistance(directDistance)}
        </span>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-neutral-950/60 border border-neutral-800 mb-2.5">
        <button
          onClick={() => setActiveModeTab('walking')}
          className={`py-1 rounded-md text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
            activeModeTab === 'walking'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Footprints className="w-3 h-3" />
          <span>Walk</span>
        </button>

        <button
          onClick={() => setActiveModeTab('transit')}
          className={`py-1 rounded-md text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
            activeModeTab === 'transit'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Train className="w-3 h-3" />
          <span>Transit</span>
        </button>

        <button
          onClick={() => setActiveModeTab('cycling')}
          className={`py-1 rounded-md text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
            activeModeTab === 'cycling'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Bike className="w-3 h-3" />
          <span>Cycle</span>
        </button>
      </div>

      {/* Active Tab Content Breakdown */}
      {activeModeTab === 'walking' && (
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-400" /> Walking Time
            </span>
            <span className="font-bold font-mono text-blue-400">
              ~{estimate.walking.minutes} min ({formatDistance(estimate.walking.distanceMeters)})
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-neutral-400 flex items-center gap-1">
              <Footprints className="w-3 h-3 text-emerald-400" /> Approx. Steps
            </span>
            <span className="font-mono text-emerald-400">
              ~{estimate.walking.steps.toLocaleString()} steps
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-neutral-400 flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-400" /> Energy Burn
            </span>
            <span className="font-mono text-orange-400">
              ~{estimate.walking.calories} kcal
            </span>
          </div>
        </div>
      )}

      {activeModeTab === 'cycling' && (
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-400" /> Cycling Time
            </span>
            <span className="font-bold font-mono text-emerald-400">
              ~{estimate.cycling.minutes} min ({formatDistance(estimate.cycling.distanceMeters)})
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-neutral-400 flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-400" /> Energy Burn
            </span>
            <span className="font-mono text-orange-400">
              ~{estimate.cycling.calories} kcal
            </span>
          </div>
        </div>
      )}

      {activeModeTab === 'transit' && (
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-purple-400" /> Subway / Bus Ride
            </span>
            <span className="font-bold font-mono text-purple-400">
              ~{estimate.transit.minutes} min ({formatDistance(estimate.transit.distanceMeters)})
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-neutral-400 flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-neutral-300" /> T-Money Card Fare
            </span>
            <span className="font-bold font-mono text-emerald-400">
              ₩{estimate.transit.estimatedFareKrw.toLocaleString()}
            </span>
          </div>
          <div className="text-[10px] text-neutral-400 pt-0.5">
            Tip: Free transfer within 30 mins between subway lines and city buses.
          </div>
        </div>
      )}
    </div>
  );
};
