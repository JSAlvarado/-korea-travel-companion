/**
 * Helper to safely extract Google Maps API Key from environment variable,
 * handling both raw API keys (e.g. AIzaSy...) and full script URLs (e.g. https://maps.googleapis.com/...key=AIzaSy...).
 */
export function extractGoogleMapsApiKey(raw?: string): string {
  if (!raw) return '';
  const trimmed = raw.trim().replace(/^["']|["']$/g, '');
  if (trimmed.includes('key=')) {
    const match = trimmed.match(/[?&]key=([^&"'\s]+)/);
    if (match && match[1]) {
      return match[1];
    }
  }
  return trimmed;
}

export function getGoogleMapsApiKey(): string {
  const envKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';
  return extractGoogleMapsApiKey(envKey);
}

export function isValidGoogleMapsKey(key: string): boolean {
  if (!key) return false;
  const clean = key.trim();
  if (clean === 'INSERT_YOUR_API_KEY' || clean.length < 10) return false;
  return true;
}
