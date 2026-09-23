// High-precision Korea Standard Time (KST = UTC+9) & Network Clock Synchronization

let clockOffsetMs: number = (() => {
  try {
    const saved = localStorage.getItem('kst_clock_offset');
    if (saved) return parseInt(saved, 10) || 0;
  } catch {}
  return 0;
})();

let isNetworkCalibrated: boolean = false;
let lastSyncTimestamp: number | null = null;

export interface KSTTimeDetails {
  time12: string;        // "02:25:30 PM"
  time24: string;        // "14:25:30"
  seconds: string;       // "30"
  dateString: string;    // "Sun, Sep 20"
  fullDate: string;      // "September 20, 2026"
  isNetworkSynced: boolean;
  lastSyncLabel: string;
  localTimeDiffLabel: string;
  localTime12: string;
}

/**
 * Returns a Date object adjusted for network time drift
 */
export function getAccurateNow(): Date {
  return new Date(Date.now() + clockOffsetMs);
}

/**
 * Synchronize device clock with atomic network time
 */
export async function syncNetworkTime(): Promise<{ success: boolean; offsetMs: number }> {
  try {
    const startTime = performance.now();
    // Use fast lightweight endpoint to read standard HTTP Date header
    const response = await fetch('https://open.er-api.com/v6/latest/USD', {
      method: 'GET',
      cache: 'no-store'
    });

    const dateHeader = response.headers.get('date');
    if (dateHeader) {
      const serverDateMs = new Date(dateHeader).getTime();
      const roundTripMs = performance.now() - startTime;
      const adjustedServerMs = serverDateMs + Math.round(roundTripMs / 2);
      clockOffsetMs = adjustedServerMs - Date.now();

      try {
        localStorage.setItem('kst_clock_offset', String(clockOffsetMs));
        localStorage.setItem('kst_last_sync', String(Date.now()));
      } catch {}

      isNetworkCalibrated = true;
      lastSyncTimestamp = Date.now();

      window.dispatchEvent(new CustomEvent('time-synced', { detail: { offset: clockOffsetMs } }));
      return { success: true, offsetMs: clockOffsetMs };
    }
  } catch {
    // Fallback: Check if WorldTime API is reachable
    try {
      const wtRes = await fetch('https://worldtimeapi.org/api/timezone/Asia/Seoul', { cache: 'no-store' });
      if (wtRes.ok) {
        const wtData = await wtRes.json();
        if (wtData.unixtime) {
          const serverDateMs = wtData.unixtime * 1000;
          clockOffsetMs = serverDateMs - Date.now();
          isNetworkCalibrated = true;
          lastSyncTimestamp = Date.now();
          return { success: true, offsetMs: clockOffsetMs };
        }
      }
    } catch {}
  }

  return { success: false, offsetMs: clockOffsetMs };
}

/**
 * Get comprehensive formatted KST time details
 */
export function getKSTDetails(): KSTTimeDetails {
  const accurateDate = getAccurateNow();

  // Format Korea Standard Time (Asia/Seoul = UTC+9)
  let time12 = '';
  let time24 = '';
  let seconds = '';
  let dateString = '';
  let fullDate = '';

  try {
    const kstFormatter12 = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Seoul',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    time12 = kstFormatter12.format(accurateDate);

    const kstFormatter24 = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Seoul',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    time24 = kstFormatter24.format(accurateDate);

    const secFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Seoul',
      second: '2-digit'
    });
    seconds = secFormatter.format(accurateDate);

    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Seoul',
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    dateString = dateFormatter.format(accurateDate);

    const fullDateFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Seoul',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    fullDate = fullDateFormatter.format(accurateDate);
  } catch {
    // Mathematical fallback to UTC+9
    const utcMs = accurateDate.getTime() + (accurateDate.getTimezoneOffset() * 60000);
    const kst = new Date(utcMs + (3600000 * 9));
    time12 = kst.toLocaleTimeString('en-US', { hour12: true });
    time24 = kst.toLocaleTimeString('en-US', { hour12: false });
    seconds = String(kst.getSeconds()).padStart(2, '0');
    dateString = kst.toDateString().slice(0, 10);
    fullDate = kst.toDateString();
  }

  // Format user device local time for comparison
  const localTime12 = accurateDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  // Calculate difference between KST and device local timezone
  const deviceTzOffsetMinutes = -accurateDate.getTimezoneOffset(); // e.g. UTC+8 = +480 min
  const kstTzOffsetMinutes = 9 * 60; // UTC+9 = +540 min
  const diffHours = (kstTzOffsetMinutes - deviceTzOffsetMinutes) / 60;

  let localTimeDiffLabel = 'Same as your device timezone';
  if (diffHours > 0) {
    localTimeDiffLabel = `Seoul is ${diffHours}h ahead of your device`;
  } else if (diffHours < 0) {
    localTimeDiffLabel = `Seoul is ${Math.abs(diffHours)}h behind your device`;
  }

  let lastSyncLabel = 'Device Clock (Offline)';
  if (isNetworkCalibrated && lastSyncTimestamp) {
    const minsAgo = Math.round((Date.now() - lastSyncTimestamp) / 60000);
    lastSyncLabel = minsAgo <= 1 ? 'Calibrated via Internet (Exact)' : `Calibrated ${minsAgo}m ago`;
  }

  return {
    time12,
    time24,
    seconds,
    dateString,
    fullDate,
    isNetworkSynced: isNetworkCalibrated,
    lastSyncLabel,
    localTimeDiffLabel,
    localTime12
  };
}
