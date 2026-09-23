import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  CheckCircle2,
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  HardDrive,
  Download,
  Share2,
  Compass,
  MessageSquare,
  PhoneCall,
  Train,
  MapPin,
  Coins,
  ShieldCheck,
  RefreshCw,
  X,
  Zap,
  Info,
  Copy,
  Check,
  AlertTriangle,
  HelpCircle,
  MoreVertical
} from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { triggerInstantSync, SyncSummary } from '../utils/onlineSync';
import { isInAppBrowser, getMobilePlatform } from '../utils/powerManager';
import {
  preloadRegionTiles,
  PRELOAD_REGIONS,
  getCachedRegions,
  PreloadProgress
} from '../utils/offlineMapPreload';

interface OfflineAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  batterySaver: boolean;
  onToggleBatterySaver: () => void;
}

export const OfflineAppModal: React.FC<OfflineAppModalProps> = ({
  isOpen,
  onClose,
  darkMode,
  batterySaver,
  onToggleBatterySaver
}) => {
  const isOnline = useOnlineStatus();
  const { canInstall, isInstalled, isIOS, promptInstall } = useInstallPrompt();

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncResult, setSyncResult] = useState<SyncSummary | null>(null);

  // Map Tile Preload states
  const [selectedRegion, setSelectedRegion] = useState<string>('daegu');
  const [isPreloading, setIsPreloading] = useState<boolean>(false);
  const [preloadProgress, setPreloadProgress] = useState<PreloadProgress | null>(null);
  const [cachedRegions, setCachedRegions] = useState<string[]>(getCachedRegions());

  useEffect(() => {
    if (isOpen) {
      setCachedRegions(getCachedRegions());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualSync = async () => {
    setIsSyncing(true);
    const res = await triggerInstantSync();
    setSyncResult(res);
    setIsSyncing(false);
  };

  const handlePreloadTiles = async () => {
    setIsPreloading(true);
    await preloadRegionTiles(selectedRegion, (p) => {
      setPreloadProgress(p);
    });
    setCachedRegions(getCachedRegions());
    setIsPreloading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl transition-colors ${
          darkMode
            ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
            : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Header */}
        <div
          className={`sticky top-0 z-10 px-5 py-4 border-b flex items-center justify-between backdrop-blur-md ${
            darkMode ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white/90 border-neutral-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Offline Application Center
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  100% Offline Ready
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Self-contained phone application • Zero battery drain in background
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-colors ${
              darkMode
                ? 'bg-neutral-800/80 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
                : 'bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-700'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5">
          {/* Status Highlight Banner */}
          <div
            className={`p-4 rounded-xl border flex flex-col gap-3 ${
              isOnline
                ? darkMode
                  ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : darkMode
                ? 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {isOnline ? (
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shrink-0"></div>
                ) : (
                  <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <div>
                  <h3 className="font-semibold text-sm">
                    {isOnline
                      ? 'Connected • Auto-Sync Ready'
                      : 'Offline Mode Active • All Features Available'}
                  </h3>
                  <p className="text-xs opacity-80 mt-0.5">
                    {isOnline
                      ? 'When connected, the app updates live KRW exchange rates, Seoul weather, and atomic clock calibration, then sleeps immediately to conserve battery.'
                      : 'No internet required! Every phrase, emergency phone, subway station, landmark, and hotel card is stored locally on your device.'}
                  </p>
                </div>
              </div>
            </div>

            {isOnline && (
              <div className="flex items-center justify-between pt-2 border-t border-emerald-500/20">
                <span className="text-[11px] opacity-75">
                  {syncResult
                    ? `Last updated: ${new Date(syncResult.timestamp).toLocaleTimeString()}`
                    : 'Exchange rates & weather primed'}
                </span>
                <button
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Live Data Now'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Standalone Phone Installation Section */}
          <div
            className={`p-4 rounded-xl border ${
              darkMode ? 'bg-neutral-950/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Phone Installation & Standalone App
                </h3>
              </div>
              {isInstalled && (
                <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Installed App
                </span>
              )}
            </div>

            {isInstalled ? (
              <p className="text-xs text-neutral-400">
                This is the installed app. All guides, landmarks, transit, phrases, emergency
                contacts and currency data are stored on your device, so it opens and works fully with no internet.
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-neutral-300">
                  Install this companion onto your phone home screen to open it as a real standalone
                  app without browser bars, complete with 100% offline startup.
                </p>

                {canInstall && (
                  <button
                    onClick={promptInstall}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install App on Phone (One-Click)</span>
                  </button>
                )}

                {isIOS && (
                  <div
                    className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                      darkMode
                        ? 'bg-neutral-900 border-neutral-800 text-neutral-300'
                        : 'bg-white border-neutral-200 text-neutral-700'
                    }`}
                  >
                    <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      <Share2 className="w-3.5 h-3.5" /> iPhone / iPad Safari Installation:
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] opacity-90 pl-1">
                      <li>
                        Tap the <span className="font-semibold text-emerald-300">Share 📤</span> button in the bottom Safari bar
                      </li>
                      <li>
                        Scroll down and tap{' '}
                        <span className="font-semibold text-emerald-300">Add to Home Screen ➕</span>
                      </li>
                      <li>
                        Tap <span className="font-semibold text-emerald-300">Add</span> at top right to install the standalone icon
                      </li>
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Offline Preloaded Bundles Audit */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2.5 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              Preloaded Offline Datasets (Stored on Device)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div
                className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                  darkMode ? 'bg-neutral-950/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold flex items-center gap-1.5">
                    1,200+ Korean Phrases
                    <span className="text-[10px] text-emerald-400 font-mono">100% Offline</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Hangul, Romanization & offline text-to-speech audio pronunciation.
                  </p>
                </div>
              </div>

              <div
                className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                  darkMode ? 'bg-neutral-950/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                }`}
              >
                <PhoneCall className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold flex items-center gap-1.5">
                    Emergency Directory & SOS
                    <span className="text-[10px] text-emerald-400 font-mono">100% Offline</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    112, 119, 1330 hotline, foreign embassies, hospital clinics & taxi cards.
                  </p>
                </div>
              </div>

              <div
                className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                  darkMode ? 'bg-neutral-950/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                }`}
              >
                <Train className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold flex items-center gap-1.5">
                    Subway Network & Transit
                    <span className="text-[10px] text-emerald-400 font-mono">100% Offline</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Seoul Lines 1-9, AREX, Shinbundang, Busan metro, T-Money & Climate cards.
                  </p>
                </div>
              </div>

              <div
                className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                  darkMode ? 'bg-neutral-950/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                }`}
              >
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold flex items-center gap-1.5">
                    150+ Top Attractions
                    <span className="text-[10px] text-emerald-400 font-mono">100% Offline</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Coordinates, nearest subway exits, Korean driver cards for 6 cities.
                  </p>
                </div>
              </div>

              <div
                className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                  darkMode ? 'bg-neutral-950/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                }`}
              >
                <Coins className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold flex items-center gap-1.5">
                    Currency Converter & Taxes
                    <span className="text-[10px] text-emerald-400 font-mono">100% Offline</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    KRW benchmarks, average street costs, immediate & airport tax refunds.
                  </p>
                </div>
              </div>

              <div
                className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                  darkMode ? 'bg-neutral-950/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                }`}
              >
                <Compass className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold flex items-center gap-1.5">
                    Saved Hotel Radar
                    <span className="text-[10px] text-emerald-400 font-mono">100% Offline</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Offline distance compass, bearings & Korean return cards for taxi drivers.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Offline Map Pre-caching Section */}
          <div
            className={`p-4 rounded-xl border ${
              darkMode ? 'bg-neutral-950/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-400" />
                Pre-download Offline Map Tiles
              </h3>
              <span className="text-[11px] text-neutral-400 font-mono">
                {cachedRegions.length} Regions Cached
              </span>
            </div>
            <p className="text-xs text-neutral-300 mb-3">
              Pre-cache key street tiles before leaving your hotel Wi-Fi so you can pan and zoom
              without mobile data:
            </p>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              {Object.entries(PRELOAD_REGIONS).map(([key, reg]) => {
                const isCached = cachedRegions.includes(key);
                const isSelected = selectedRegion === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedRegion(key)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : darkMode
                        ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300'
                        : 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                    }`}
                  >
                    {isCached && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    <span>{reg.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePreloadTiles}
                disabled={isPreloading || !isOnline}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Download className={`w-3.5 h-3.5 ${isPreloading ? 'animate-bounce' : ''}`} />
                <span>
                  {isPreloading
                    ? 'Downloading Tiles...'
                    : !isOnline
                    ? 'Connect to Wi-Fi to Download'
                    : `Pre-cache ${PRELOAD_REGIONS[selectedRegion]?.name.split(' ')[0]} Tiles`}
                </span>
              </button>

              {preloadProgress && (
                <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                  <span>{preloadProgress.percent}%</span>
                  <span className="text-[11px] text-neutral-400">
                    ({preloadProgress.completed}/{preloadProgress.total} tiles)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Smart Battery & Event-Driven Sync Policy */}
          <div
            className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
              darkMode ? 'bg-neutral-950/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Smart Battery Protection Policy
                </h3>
              </div>
              <button
                onClick={onToggleBatterySaver}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors flex items-center gap-1.5 font-medium cursor-pointer ${
                  batterySaver
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : darkMode
                    ? 'bg-neutral-900 text-neutral-400 border-neutral-800'
                    : 'bg-neutral-200 text-neutral-700 border-neutral-300'
                }`}
              >
                <Battery className="w-3 h-3" />
                <span>Battery Saver: {batterySaver ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            <ul className="text-xs text-neutral-400 space-y-1.5 pl-1">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>
                  <strong className="text-neutral-200">Zero Idle Background Drain:</strong> When
                  the app is minimized or your phone screen is turned off, all UI timers, animations,
                  and GPS position listeners pause immediately.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>
                  <strong className="text-neutral-200">Event-Driven Updates:</strong> The app never
                  performs continuous background polling. Updates trigger only when your phone
                  reconnects to the internet (via Wi-Fi/data), runs a single rapid 300ms burst, and
                  then goes back to sleep.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-5 py-3 border-t flex items-center justify-between text-xs ${
            darkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
          }`}
        >
          <span className="text-neutral-500 text-[11px] font-mono">
            Storage Engine: IndexedDB & ServiceWorker v3
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
