// Instant Background & Reconnect Sync Manager for South Korea Travel Companion
import { CURRENCY_RATES } from '../data/currency';
import { CurrencyRate } from '../types';
import { syncNetworkTime } from './timeSync';

export interface WeatherData {
  tempC: number;
  tempF: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  cityName: string;
  updatedAt: string;
}

export interface SyncSummary {
  success: boolean;
  timeSynced: boolean;
  ratesUpdated: boolean;
  weatherUpdated: boolean;
  ratesCount: number;
  seoulTemp?: number;
  timestamp: number;
}

let isSyncing = false;
let lastSyncSummary: SyncSummary | null = null;

/**
 * Fetch and update live market currency rates against South Korean Won (KRW)
 */
export async function syncLiveCurrencyRates(): Promise<boolean> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', { cache: 'no-store' });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.result !== 'success' || !data.rates || !data.rates.KRW) return false;

    const usdToKrw = data.rates.KRW;

    // Recalculate KRW rate for each currency: 1 [Foreign] = (USD/KRW) / (USD/[Foreign]) KRW
    const updatedRates: CurrencyRate[] = CURRENCY_RATES.map((curr) => {
      const code = curr.code;
      let newRate = curr.rateToKrw;

      if (code === 'USD') {
        newRate = Math.round(usdToKrw);
      } else if (code === 'JPY') {
        // Japanese Yen per 100 JPY
        const usdToJpy = data.rates.JPY;
        if (usdToJpy) newRate = parseFloat(((usdToKrw / usdToJpy) * 100).toFixed(2));
      } else if (code === 'VND') {
        // Vietnamese Dong per 1,000 VND
        const usdToVnd = data.rates.VND;
        if (usdToVnd) newRate = parseFloat(((usdToKrw / usdToVnd) * 1000).toFixed(2));
      } else if (data.rates[code]) {
        const usdToForeign = data.rates[code];
        newRate = parseFloat((usdToKrw / usdToForeign).toFixed(2));
      }

      return {
        ...curr,
        rateToKrw: newRate
      };
    });

    try {
      localStorage.setItem('kr_travel_currency_rates', JSON.stringify(updatedRates));
      localStorage.setItem('kr_travel_currency_last_update', new Date().toISOString());
    } catch {}

    window.dispatchEvent(
      new CustomEvent('currency-rates-updated', {
        detail: { rates: updatedRates, timestamp: Date.now() }
      })
    );

    return true;
  } catch (err) {
    console.warn('Currency rates live update error:', err);
    return false;
  }
}

/**
 * Fetch current Daegu weather to keep cached conditions fresh
 */
export async function syncLiveWeather(): Promise<WeatherData | null> {
  try {
    // Daegu coordinates: Lat 35.8714, Lng 128.6014
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=35.8714&longitude=128.6014&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const curr = data.current;
    if (!curr) return null;

    const tempC = Math.round(curr.temperature_2m);
    const tempF = Math.round((tempC * 9) / 5 + 32);

    const weatherCode = curr.weather_code || 0;
    let condition = 'Clear Sky';
    if (weatherCode >= 1 && weatherCode <= 3) condition = 'Partly Cloudy';
    else if (weatherCode >= 45 && weatherCode <= 48) condition = 'Foggy / Hazy';
    else if (weatherCode >= 51 && weatherCode <= 67) condition = 'Rain / Showers';
    else if (weatherCode >= 71 && weatherCode <= 77) condition = 'Snow';
    else if (weatherCode >= 80 && weatherCode <= 82) condition = 'Rain Showers';
    else if (weatherCode >= 95) condition = 'Thunderstorm';

    const weatherData: WeatherData = {
      tempC,
      tempF,
      condition,
      humidity: curr.relative_humidity_2m || 60,
      windSpeed: Math.round(curr.wind_speed_10m || 8),
      cityName: 'Daegu (대구)',
      updatedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem('kr_travel_weather_cache', JSON.stringify(weatherData));
    } catch {}

    window.dispatchEvent(
      new CustomEvent('weather-updated', {
        detail: weatherData
      })
    );

    return weatherData;
  } catch (err) {
    console.warn('Weather live update error:', err);
    return null;
  }
}

/**
 * Master sync execution: called when internet is detected or user manually taps sync
 */
export async function triggerInstantSync(): Promise<SyncSummary> {
  if (isSyncing) {
    return (
      lastSyncSummary || {
        success: false,
        timeSynced: false,
        ratesUpdated: false,
        weatherUpdated: false,
        ratesCount: 0,
        timestamp: Date.now()
      }
    );
  }

  isSyncing = true;
  window.dispatchEvent(new CustomEvent('sync-started'));

  try {
    // 1. Sync clock / time offset
    const timeResult = await syncNetworkTime();

    // 2. Sync currency rates in parallel with weather
    const [ratesOk, weatherData] = await Promise.all([
      syncLiveCurrencyRates(),
      syncLiveWeather()
    ]);

    // 3. Trigger Service Worker cache verification in background
    if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready
        .then((registration) => {
          registration.update().catch(() => {});
        })
        .catch(() => {});
    }

    const summary: SyncSummary = {
      success: true,
      timeSynced: timeResult.success,
      ratesUpdated: ratesOk,
      weatherUpdated: !!weatherData,
      ratesCount: CURRENCY_RATES.length,
      seoulTemp: weatherData?.tempC,
      timestamp: Date.now()
    };

    lastSyncSummary = summary;
    window.dispatchEvent(new CustomEvent('sync-completed', { detail: summary }));
    return summary;
  } finally {
    isSyncing = false;
  }
}

/**
 * Set up automatic reconnection listeners.
 * Whenever device transitions from offline to online, immediately update all data!
 */
export function initializeAutoSync(): () => void {
  const onOnline = () => {
    // Small delay to allow full socket handshake
    setTimeout(() => {
      triggerInstantSync();
    }, 400);
  };

  window.addEventListener('online', onOnline);

  // If already online at startup, perform background sync once
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    setTimeout(() => {
      triggerInstantSync();
    }, 1000);
  }

  return () => {
    window.removeEventListener('online', onOnline);
  };
}
