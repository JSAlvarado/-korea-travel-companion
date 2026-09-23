import React, { useState, useEffect, useRef } from 'react';
import { TravelMode, Coordinates } from '../types';
import { calculateDistanceMeters, formatDistance } from '../utils/geo';
import {
  Footprints,
  Bike,
  Train,
  Car,
  Play,
  Pause,
  RotateCcw,
  Flag,
  ChevronDown,
  ChevronUp,
  Activity,
  Flame,
  Gauge,
  Timer,
  CheckCircle2,
  X
} from 'lucide-react';

interface TripTrackerHUDProps {
  userLocation: Coordinates | null;
  darkMode: boolean;
  onPathUpdate: (path: Coordinates[]) => void;
  onTrackerStateChange?: (isTracking: boolean) => void;
}

interface CompletedTripSummary {
  mode: TravelMode;
  distanceMeters: number;
  durationSeconds: number;
  avgSpeedKmh: number;
  calories: number;
  steps?: number;
  estimatedFareKrw?: number;
  timestamp: string;
}

export const TripTrackerHUD: React.FC<TripTrackerHUDProps> = ({
  userLocation,
  darkMode,
  onPathUpdate,
  onTrackerStateChange
}) => {
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [mode, setMode] = useState<TravelMode>('walking');
  const [distanceMeters, setDistanceMeters] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState<number>(0);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [tripSummary, setTripSummary] = useState<CompletedTripSummary | null>(null);

  const pathRef = useRef<Coordinates[]>([]);
  const lastLocationRef = useRef<Coordinates | null>(null);
  const timerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);

  // Timer tick with smart background battery conservation
  useEffect(() => {
    let lastTick = Date.now();

    const startTimer = () => {
      if (!timerRef.current && isTracking && !isPaused) {
        lastTick = Date.now();
        timerRef.current = setInterval(() => {
          const now = Date.now();
          const delta = Math.round((now - lastTick) / 1000);
          if (delta >= 1) {
            setElapsedSeconds((prev) => prev + delta);
            lastTick = now;
          }
        }, 1000);
      }
    };

    const stopTimer = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    if (isTracking && !isPaused) {
      startTimer();
    } else {
      stopTimer();
    }

    const handleVisibility = () => {
      if (document.hidden) {
        stopTimer();
      } else if (isTracking && !isPaused) {
        startTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stopTimer();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isTracking, isPaused]);

  // Watch GPS for live distance accumulation
  useEffect(() => {
    if (isTracking && !isPaused && 'geolocation' in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const newCoord: Coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          // Calculate speed
          if (position.coords.speed !== null && position.coords.speed >= 0) {
            setCurrentSpeedKmh(Math.round(position.coords.speed * 3.6 * 10) / 10);
          }

          if (lastLocationRef.current) {
            const stepDistance = calculateDistanceMeters(lastLocationRef.current, newCoord);
            // Threshold filter: ignore GPS jitter under 3 meters or unrealistically large jumps (>150m in 1s)
            if (stepDistance >= 3 && stepDistance < 150) {
              setDistanceMeters((prev) => {
                const total = prev + stepDistance;
                return total;
              });
              pathRef.current = [...pathRef.current, newCoord];
              onPathUpdate(pathRef.current);
            }
          } else {
            pathRef.current = [newCoord];
            onPathUpdate(pathRef.current);
          }
          lastLocationRef.current = newCoord;
        },
        (err) => {
          console.warn('Trip tracker GPS error:', err.message);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 1000,
          timeout: 10000
        }
      );
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isTracking, isPaused, onPathUpdate]);

  // Fallback: If user moves and userLocation prop updates
  useEffect(() => {
    if (isTracking && !isPaused && userLocation && !lastLocationRef.current) {
      lastLocationRef.current = userLocation;
      pathRef.current = [userLocation];
      onPathUpdate(pathRef.current);
    }
  }, [userLocation, isTracking, isPaused, onPathUpdate]);

  const handleStart = () => {
    setIsTracking(true);
    setIsPaused(false);
    onTrackerStateChange?.(true);
    if (userLocation) {
      lastLocationRef.current = userLocation;
      pathRef.current = [userLocation];
      onPathUpdate(pathRef.current);
    }
  };

  const handlePauseResume = () => {
    setIsPaused((prev) => !prev);
  };

  const handleReset = () => {
    setIsTracking(false);
    setIsPaused(false);
    setDistanceMeters(0);
    setElapsedSeconds(0);
    setCurrentSpeedKmh(0);
    pathRef.current = [];
    lastLocationRef.current = null;
    onPathUpdate([]);
    onTrackerStateChange?.(false);
  };

  const handleFinish = () => {
    const hours = elapsedSeconds / 3600;
    const avgSpeed = hours > 0 ? Math.round((distanceMeters / 1000 / hours) * 10) / 10 : 0;
    const km = distanceMeters / 1000;

    let calories = 0;
    let steps: number | undefined;
    let estimatedFareKrw: number | undefined;

    if (mode === 'walking') {
      calories = Math.round(km * 62);
      steps = Math.round(distanceMeters * 1.31);
    } else if (mode === 'cycling') {
      calories = Math.round(km * 38);
    } else if (mode === 'transit') {
      estimatedFareKrw = distanceMeters > 10000 ? 1400 + Math.ceil((distanceMeters - 10000) / 5000) * 100 : 1400;
    } else if (mode === 'driving') {
      const extraKm = Math.max(0, (distanceMeters - 1600) / 1000);
      estimatedFareKrw = Math.round(4800 + extraKm * 1100);
    }

    setTripSummary({
      mode,
      distanceMeters,
      durationSeconds: elapsedSeconds,
      avgSpeedKmh: avgSpeed,
      calories,
      steps,
      estimatedFareKrw,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    handleReset();
  };

  // Format elapsed time 00:00:00
  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 62);
    const remainderSecs = secs % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${remainderSecs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${remainderSecs.toString().padStart(2, '0')}`;
  };

  // Calculate stats based on travel mode
  const km = distanceMeters / 1000;
  const stepsCount = Math.round(distanceMeters * 1.31);
  const caloriesBurned =
    mode === 'walking' ? Math.round(km * 62) : mode === 'cycling' ? Math.round(km * 38) : 0;

  return (
    <>
      {/* Trip Tracker Floating Container */}
      <div
        id="trip-tracker-hud"
        className={`absolute bottom-4 right-4 z-40 rounded-2xl border shadow-2xl transition-all max-w-[340px] w-[calc(100%-2rem)] sm:w-80 backdrop-blur-xl ${
          darkMode
            ? 'bg-neutral-950/92 border-neutral-800 text-neutral-100 shadow-black/80'
            : 'bg-white/95 border-neutral-200 text-neutral-900 shadow-neutral-500/20'
        }`}
      >
        {/* Header bar */}
        <div className="p-3 pb-2 flex items-center justify-between border-b border-neutral-700/20">
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                isTracking
                  ? isPaused
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-emerald-500 animate-ping'
                  : 'bg-neutral-500'
              }`}
            />
            <span className="font-bold text-xs tracking-tight flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              Live Distance Tracker
            </span>
          </div>

          <div className="flex items-center gap-1">
            {isTracking && (
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                  isPaused ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {isPaused ? 'PAUSED' : 'TRACKING'}
              </span>
            )}
            <button
              onClick={() => setIsMinimized((prev) => !prev)}
              className="p-1 text-neutral-400 hover:text-white rounded"
              title={isMinimized ? 'Expand tracker' : 'Minimize tracker'}
            >
              {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Minimized Quick Preview */}
        {isMinimized ? (
          <div className="p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-mono">
              <span className="text-base font-bold text-blue-400">
                {formatDistance(distanceMeters)}
              </span>
              <span className="text-neutral-400">• {formatTime(elapsedSeconds)}</span>
            </div>
            {isTracking && (
              <button
                onClick={handlePauseResume}
                className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white"
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            )}
          </div>
        ) : (
          /* Full Controls & Stats */
          <div className="p-3.5 space-y-3">
            {/* Travel Mode Selector */}
            <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <button
                onClick={() => setMode('walking')}
                className={`flex flex-col items-center py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all ${
                  mode === 'walking'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Footprints className="w-3.5 h-3.5 mb-0.5" />
                <span>Walk</span>
              </button>
              <button
                onClick={() => setMode('cycling')}
                className={`flex flex-col items-center py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all ${
                  mode === 'cycling'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Bike className="w-3.5 h-3.5 mb-0.5" />
                <span>Cycle</span>
              </button>
              <button
                onClick={() => setMode('transit')}
                className={`flex flex-col items-center py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all ${
                  mode === 'transit'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Train className="w-3.5 h-3.5 mb-0.5" />
                <span>Transit</span>
              </button>
              <button
                onClick={() => setMode('driving')}
                className={`flex flex-col items-center py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all ${
                  mode === 'driving'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Car className="w-3.5 h-3.5 mb-0.5" />
                <span>Ride / Taxi</span>
              </button>
            </div>

            {/* Metrics Display Grid */}
            <div className="grid grid-cols-2 gap-2">
              {/* Main Distance */}
              <div className="p-2.5 rounded-xl bg-neutral-900/50 border border-neutral-800">
                <span className="text-[10px] uppercase font-mono text-neutral-400 block mb-0.5">
                  Distance Traveled
                </span>
                <span className="text-xl font-extrabold text-blue-400 font-mono tracking-tight">
                  {formatDistance(distanceMeters)}
                </span>
              </div>

              {/* Time */}
              <div className="p-2.5 rounded-xl bg-neutral-900/50 border border-neutral-800">
                <span className="text-[10px] uppercase font-mono text-neutral-400 block mb-0.5 flex items-center gap-1">
                  <Timer className="w-3 h-3 text-neutral-400" />
                  Elapsed Time
                </span>
                <span className="text-xl font-extrabold text-neutral-100 font-mono tracking-tight">
                  {formatTime(elapsedSeconds)}
                </span>
              </div>

              {/* Mode-Specific Sub-Stat 1 */}
              <div className="p-2 rounded-xl bg-neutral-900/30 border border-neutral-800/80">
                <span className="text-[10px] text-neutral-400 block flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-cyan-400" />
                  {mode === 'walking' || mode === 'cycling' ? 'Live Speed' : 'Transit Speed'}
                </span>
                <span className="text-sm font-bold text-neutral-200 font-mono">
                  {currentSpeedKmh > 0 ? `${currentSpeedKmh} km/h` : '-- km/h'}
                </span>
              </div>

              {/* Mode-Specific Sub-Stat 2 */}
              <div className="p-2 rounded-xl bg-neutral-900/30 border border-neutral-800/80">
                {mode === 'walking' ? (
                  <>
                    <span className="text-[10px] text-neutral-400 block flex items-center gap-1">
                      <Footprints className="w-3 h-3 text-emerald-400" />
                      Pedometer Steps
                    </span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">
                      {stepsCount.toLocaleString()} steps
                    </span>
                  </>
                ) : mode === 'cycling' ? (
                  <>
                    <span className="text-[10px] text-neutral-400 block flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-400" />
                      Calories Burned
                    </span>
                    <span className="text-sm font-bold text-orange-400 font-mono">
                      {caloriesBurned} kcal
                    </span>
                  </>
                ) : mode === 'transit' ? (
                  <>
                    <span className="text-[10px] text-neutral-400 block">T-Money Fare</span>
                    <span className="text-sm font-bold text-purple-400 font-mono">
                      ₩{distanceMeters > 10000 ? (1400 + Math.ceil((distanceMeters - 10000) / 5000) * 100).toLocaleString() : '1,400'}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] text-neutral-400 block">Estimated Taxi</span>
                    <span className="text-sm font-bold text-amber-400 font-mono">
                      ~₩{Math.round(4800 + Math.max(0, (distanceMeters - 1600) / 1000) * 1100).toLocaleString()}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              {!isTracking ? (
                <button
                  id="start-trip-tracker-btn"
                  onClick={handleStart}
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Start Distance Tracking</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handlePauseResume}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      isPaused
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    {isPaused ? <Play className="w-3.5 h-3.5 fill-white" /> : <Pause className="w-3.5 h-3.5 fill-white" />}
                    <span>{isPaused ? 'Resume' : 'Pause'}</span>
                  </button>

                  <button
                    onClick={handleFinish}
                    className="flex-1 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Flag className="w-3.5 h-3.5 text-blue-400" />
                    <span>Finish Trip</span>
                  </button>

                  <button
                    onClick={handleReset}
                    title="Reset tracking"
                    className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Trip Completed Summary Dialog */}
      {tripSummary && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-sm rounded-2xl border p-5 shadow-2xl relative animate-in fade-in zoom-in-95 ${
              darkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900'
            }`}
          >
            <button
              onClick={() => setTripSummary(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Trip Distance Summary</h3>
                <span className="text-[11px] text-neutral-400">Recorded at {tripSummary.timestamp}</span>
              </div>
            </div>

            <div className="space-y-2 py-2">
              <div className="p-3 rounded-xl bg-neutral-950/40 border border-neutral-800 flex items-center justify-between">
                <span className="text-xs text-neutral-400">Total Distance</span>
                <span className="text-base font-extrabold text-blue-400 font-mono">
                  {formatDistance(tripSummary.distanceMeters)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-neutral-950/40 border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block">Travel Mode</span>
                  <span className="text-xs font-bold capitalize text-white">{tripSummary.mode}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-950/40 border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block">Duration</span>
                  <span className="text-xs font-bold font-mono text-white">
                    {formatTime(tripSummary.durationSeconds)}
                  </span>
                </div>
              </div>

              {tripSummary.steps && (
                <div className="p-2.5 rounded-xl bg-neutral-950/40 border border-neutral-800 flex items-center justify-between">
                  <span className="text-xs text-neutral-400">Steps Walked</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    {tripSummary.steps.toLocaleString()} steps
                  </span>
                </div>
              )}

              {tripSummary.calories > 0 && (
                <div className="p-2.5 rounded-xl bg-neutral-950/40 border border-neutral-800 flex items-center justify-between">
                  <span className="text-xs text-neutral-400">Estimated Burn</span>
                  <span className="text-xs font-bold text-orange-400 font-mono">
                    {tripSummary.calories} kcal
                  </span>
                </div>
              )}

              {tripSummary.estimatedFareKrw && (
                <div className="p-2.5 rounded-xl bg-neutral-950/40 border border-neutral-800 flex items-center justify-between">
                  <span className="text-xs text-neutral-400">Estimated Cost</span>
                  <span className="text-xs font-bold text-amber-400 font-mono">
                    ₩{tripSummary.estimatedFareKrw.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => setTripSummary(null)}
              className="w-full mt-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};
