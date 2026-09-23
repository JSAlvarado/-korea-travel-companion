import React, { useEffect, useState } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, Wifi, RefreshCw, CheckCircle } from 'lucide-react';
import { triggerInstantSync, SyncSummary } from '../utils/onlineSync';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [showSyncBanner, setShowSyncBanner] = useState<boolean>(false);
  const [syncDetails, setSyncDetails] = useState<SyncSummary | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    const onSyncCompleted = (e: any) => {
      setSyncDetails(e.detail);
      setShowSyncBanner(true);
      const timer = setTimeout(() => {
        setShowSyncBanner(false);
      }, 4500);
      return () => clearTimeout(timer);
    };

    const onSyncStarted = () => {
      setIsSyncing(true);
    };

    window.addEventListener('sync-completed', onSyncCompleted);
    window.addEventListener('sync-started', onSyncStarted);

    return () => {
      window.removeEventListener('sync-completed', onSyncCompleted);
      window.removeEventListener('sync-started', onSyncStarted);
    };
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await triggerInstantSync();
    setIsSyncing(false);
  };

  // If offline, display offline active status
  if (!isOnline) {
    return (
      <div
        id="offline-banner"
        onClick={() => window.dispatchEvent(new CustomEvent('open-offline-modal'))}
        title="Tap to inspect offline datasets and phone storage"
        className="fixed top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-amber-600/95 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-white shadow-xl animate-fade-in border border-amber-400/30 cursor-pointer hover:bg-amber-500 transition-colors"
      >
        <WifiOff className="w-3.5 h-3.5 animate-pulse shrink-0" />
        <span>Offline Mode — All datasets loaded on phone</span>
      </div>
    );
  }

  // If reconnected and sync completed, display confirmation pill
  if (showSyncBanner) {
    return (
      <div
        id="online-sync-banner"
        className="fixed top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-emerald-600/95 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-white shadow-xl animate-fade-in border border-emerald-400/30 cursor-pointer"
        onClick={() => setShowSyncBanner(false)}
        title="Tap to dismiss"
      >
        <Wifi className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
        <span>
          ⚡ Connected • Live KRW rates, Seoul weather & clock calibrated
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleManualSync();
          }}
          disabled={isSyncing}
          className="ml-1 p-0.5 hover:bg-emerald-700/60 rounded text-emerald-100"
          title="Force refresh"
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
        </button>
      </div>
    );
  }

  return null;
};
