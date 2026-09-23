import React, { useEffect, useState } from 'react';
import { Moon, Sun, PhoneCall, Globe, Clock, ShieldCheck, Download, Smartphone } from 'lucide-react';
import { AppIconModal } from './AppIconModal';
import { TimeDetailsModal } from './TimeDetailsModal';
import { OfflineAppModal } from './OfflineAppModal';
import { getKSTDetails, KSTTimeDetails } from '../utils/timeSync';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenSos: () => void;
  onOpenGuide: () => void;
  batterySaver?: boolean;
  setBatterySaver?: (val: boolean) => void;
  gpsActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  onOpenSos,
  onOpenGuide,
  batterySaver = false,
  setBatterySaver
}) => {
  const [kstDetails, setKstDetails] = useState<KSTTimeDetails>(getKSTDetails());
  const [showIconModal, setShowIconModal] = useState<boolean>(false);
  const [showTimeModal, setShowTimeModal] = useState<boolean>(false);
  const [showOfflineModal, setShowOfflineModal] = useState<boolean>(false);
  const { canInstall, isInstalled, promptInstall } = useInstallPrompt();

  // Update Korea Standard Time (KST = UTC+9)
  // Smart Battery Preservation: stops timer when app is in the background or phone screen is off!
  useEffect(() => {
    let timer: any = null;

    const tick = () => {
      setKstDetails(getKSTDetails());
    };
    tick();

    const startTimer = () => {
      if (!timer) {
        tick();
        timer = setInterval(tick, 1000);
      }
    };

    const stopTimer = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    startTimer();

    const handleVisibility = () => {
      if (document.hidden) {
        stopTimer(); // Zero CPU usage while running in phone background!
      } else {
        startTimer(); // Immediately catches up upon returning
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('time-synced', tick);

    const onOpenOffline = () => setShowOfflineModal(true);
    window.addEventListener('open-offline-modal', onOpenOffline);

    return () => {
      stopTimer();
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('time-synced', tick);
      window.removeEventListener('open-offline-modal', onOpenOffline);
    };
  }, []);

  return (
    <header
      id="app-header"
      className={`sticky top-0 z-40 w-full transition-colors border-b ${
        darkMode ? 'bg-neutral-950/95 border-neutral-800 text-neutral-100' : 'bg-white/95 border-neutral-200 text-neutral-900'
      } backdrop-blur-md px-3 sm:px-5 py-2.5 shadow-sm`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* App Title & Identity */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            id="header-app-icon-btn"
            onClick={() => setShowIconModal(true)}
            title="App Branding"
            className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shadow-xs shrink-0 border border-neutral-700 hover:scale-105 transition-all cursor-pointer bg-neutral-900"
          >
            <img src={`${import.meta.env.BASE_URL}pwa-192x192.png`} alt="Korea Travel Icon" className="w-full h-full object-cover" />
          </button>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-sm sm:text-base tracking-tight truncate">
                South Korea Travel Companion
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                한국
              </span>
              <button
                onClick={() => setShowOfflineModal(true)}
                title="Click to inspect Offline Application Datasets & Phone Storage"
                className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 shrink-0 cursor-pointer flex items-center gap-1 transition-colors"
              >
                <ShieldCheck className="w-3 h-3" />
                <span className="hidden sm:inline">Offline</span> App
              </button>
            </div>

            {/* Accurate Clickable KST Clock & Date with Daegu Hub marker */}
            <button
              onClick={() => setShowTimeModal(true)}
              title="Click to inspect Korea Standard Time & calibrate with internet"
              className="flex items-center gap-1.5 text-[11px] font-mono hover:opacity-100 transition-opacity cursor-pointer group"
            >
              <span className="text-emerald-500 font-semibold flex items-center gap-1 group-hover:underline">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Daegu KST {kstDetails.time12 || 'KST'}
              </span>
              <span className="text-neutral-400 text-[10px] hidden xs:inline">
                • {kstDetails.dateString}
              </span>
            </button>
          </div>
        </div>

        {/* Action Controls: Install (if available), Offline, Clock, Tips, Theme, SOS */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Install / Add to Phone Home Screen Button */}
          {!isInstalled && (
            <button
              id="install-phone-btn"
              onClick={async () => {
                if (canInstall) {
                  try {
                    const success = await promptInstall();
                    if (!success) {
                      setShowOfflineModal(true);
                    }
                  } catch {
                    setShowOfflineModal(true);
                  }
                } else {
                  setShowOfflineModal(true);
                }
              }}
              title="Install this app onto your phone home screen or view instructions"
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer animate-pulse"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">Install</span>
            </button>
          )}

          {/* Offline Data & Battery Manager */}
          <button
            id="offline-manager-btn"
            onClick={() => setShowOfflineModal(true)}
            title="Offline Datasets, Storage & Smart Battery Policy"
            className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1 border transition-colors cursor-pointer ${
              darkMode
                ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-emerald-400'
                : 'bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-emerald-600'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          {/* Quick Clock Calibration / Time Button */}
          <button
            id="quick-clock-btn"
            onClick={() => setShowTimeModal(true)}
            title="Korea Standard Time & Sync Details"
            className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1 border transition-colors ${
              darkMode
                ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-emerald-400'
                : 'bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-emerald-600'
            }`}
          >
            <Clock className="w-4 h-4" />
          </button>

          {/* Korea Travel Tips */}
          <button
            id="guide-btn"
            onClick={onOpenGuide}
            title="Traveler Tips & Customs"
            className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1 border transition-colors ${
              darkMode
                ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300'
                : 'bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-700'
            }`}
          >
            <Globe className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline text-xs font-semibold">Tips</span>
          </button>

          {/* Dark / Night Mode Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className={`p-2 rounded-lg border transition-colors ${
              darkMode
                ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-amber-400'
                : 'bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-700'
            }`}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Emergency SOS Hotline */}
          <button
            id="quick-sos-header-btn"
            onClick={onOpenSos}
            title="Emergency SOS / Police 112 / Medical 119"
            className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="tracking-wider text-xs">SOS</span>
          </button>
        </div>
      </div>

      {/* App Icon Assets Modal */}
      <AppIconModal
        isOpen={showIconModal}
        onClose={() => setShowIconModal(false)}
        darkMode={darkMode}
      />

      {/* Accurate Korea Time & Synchronization Modal */}
      <TimeDetailsModal
        isOpen={showTimeModal}
        onClose={() => setShowTimeModal(false)}
        darkMode={darkMode}
      />

      {/* Standalone Offline Application & Smart Battery Modal */}
      <OfflineAppModal
        isOpen={showOfflineModal}
        onClose={() => setShowOfflineModal(false)}
        darkMode={darkMode}
        batterySaver={batterySaver}
        onToggleBatterySaver={() => setBatterySaver && setBatterySaver(!batterySaver)}
      />
    </header>
  );
};
