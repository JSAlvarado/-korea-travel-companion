import React, { useEffect, useState } from 'react';
import { getKSTDetails, syncNetworkTime, KSTTimeDetails } from '../utils/timeSync';
import { triggerInstantSync } from '../utils/onlineSync';
import { Clock, RefreshCw, CheckCircle2, Globe2, X, Zap } from 'lucide-react';

interface TimeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export const TimeDetailsModal: React.FC<TimeDetailsModalProps> = ({
  isOpen,
  onClose,
  darkMode
}) => {
  const [details, setDetails] = useState<KSTTimeDetails>(getKSTDetails());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let timer: any = null;
    const tick = () => setDetails(getKSTDetails());
    tick();

    const startTimer = () => {
      if (!timer) timer = setInterval(tick, 1000);
    };
    const stopTimer = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    startTimer();

    const handleVisibility = () => {
      if (document.hidden) stopTimer();
      else startTimer();
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stopTimer();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isOpen]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);
    try {
      const result = await triggerInstantSync();
      setDetails(getKSTDetails());
      if (result.timeSynced) {
        setSyncStatusMsg('Successfully calibrated with atomic network time!');
      } else {
        setSyncStatusMsg('Updated using cached internet offset.');
      }
    } catch {
      setSyncStatusMsg('Network unreachable. Keeping high-precision device clock.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatusMsg(null), 3500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className={`w-full max-w-sm rounded-2xl p-5 shadow-2xl border transition-colors ${
          darkMode
            ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
            : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-700/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Korea Standard Time (KST)</h3>
              <p className="text-[11px] text-neutral-400">Seoul, South Korea (UTC+9)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-neutral-800/60 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Time Cards */}
        <div className="py-4 space-y-3">
          {/* Seoul KST Big Card */}
          <div
            className={`p-4 rounded-xl border text-center ${
              darkMode ? 'bg-neutral-950/70 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
            }`}
          >
            <div className="text-xs font-semibold text-emerald-500 tracking-wider uppercase mb-1">
              🇰🇷 Seoul, South Korea
            </div>
            <div className="text-3xl font-mono font-bold tracking-tight text-emerald-400">
              {details.time12}
            </div>
            <div className="text-xs text-neutral-400 mt-1 font-medium">
              {details.fullDate} (24h: {details.time24})
            </div>
          </div>

          {/* Device Local Time Comparison */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
              darkMode ? 'bg-neutral-950/50 border-neutral-800/80' : 'bg-neutral-100/70 border-neutral-200'
            }`}
          >
            <div>
              <div className="font-semibold text-neutral-300 flex items-center gap-1">
                <Globe2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Your Device Clock</span>
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">
                {details.localTimeDiffLabel}
              </div>
            </div>
            <div className="font-mono font-bold text-neutral-200 text-sm">
              {details.localTime12}
            </div>
          </div>

          {/* Sync Status Pill */}
          <div className="flex items-center justify-between text-[11px] px-1 text-neutral-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {details.lastSyncLabel}
            </span>
            <span className="text-[10px] text-neutral-500">Atomic UTC+9</span>
          </div>

          {syncStatusMsg && (
            <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs text-center flex items-center justify-center gap-1.5 animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{syncStatusMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Time & Data Now'}</span>
          </button>
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl border border-neutral-700 hover:bg-neutral-800 text-neutral-300 font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
