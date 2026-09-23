// Smart Power & Battery Conservation Manager for South Korea Travel Companion
// Ensures ZERO CPU cycles or background network polling when the app is in the background

export interface PowerState {
  isVisible: boolean;
  batterySaver: boolean;
  batteryLevel?: number;
  isCharging?: boolean;
}

let isVisible = typeof document !== 'undefined' ? document.visibilityState === 'visible' : true;
const visibilityListeners = new Set<(visible: boolean) => void>();

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    isVisible = document.visibilityState === 'visible';
    visibilityListeners.forEach((fn) => {
      try {
        fn(isVisible);
      } catch (err) {
        console.error('Visibility listener error:', err);
      }
    });
  });
}

export function isAppVisible(): boolean {
  return isVisible;
}

export function onVisibilityChange(listener: (visible: boolean) => void): () => void {
  visibilityListeners.add(listener);
  return () => {
    visibilityListeners.delete(listener);
  };
}

/**
 * Check if the device is currently running in standalone PWA mode (installed on home screen)
 */
export function isNativeApp(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as any;
  return !!(
    w.Capacitor?.isNativePlatform?.() ||
    w.electronApp ||
    window.location.protocol === 'app:' ||
    window.location.protocol === 'file:'
  );
}

export function isStandaloneApp(): boolean {
  if (typeof window === 'undefined') return false;
  if (isNativeApp()) return true;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

/**
 * Detect if running inside an in-app browser (WebView), such as Facebook, Instagram, Gmail, KakaoTalk, LINE
 * In-app WebViews block PWA installation and cause 'Cannot install app' errors.
 */
export function isInAppBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = (window.navigator.userAgent || window.navigator.vendor || '').toLowerCase();
  return /fban|fbav|instagram|line\/|kakaotalk|snapchat|micromessenger|gsa|bytedance|wv|webview/i.test(ua);
}

/**
 * Detect mobile platform
 */
export function getMobilePlatform(): 'ios' | 'android' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  const ua = (window.navigator.userAgent || '').toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  return 'desktop';
}

