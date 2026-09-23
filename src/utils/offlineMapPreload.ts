// Offline Map Tile Preloader for South Korea regions
// Caches essential zoom levels into Service Worker tile cache for offline use

export interface PreloadProgress {
  total: number;
  completed: number;
  percent: number;
  city: string;
  isDone: boolean;
}

export const PRELOAD_REGIONS: Record<string, { name: string; lat: number; lng: number }> = {
  daegu: { name: 'Daegu Metropolitan Hub (대구)', lat: 35.8714, lng: 128.6014 },
  seoul: { name: 'Seoul & Incheon (Capital Area)', lat: 37.5665, lng: 126.9780 },
  busan: { name: 'Busan & Coastal Area', lat: 35.1796, lng: 129.0756 },
  jeju: { name: 'Jeju Island', lat: 33.4996, lng: 126.5312 },
  gyeongju: { name: 'Gyeongju (Historic Capital)', lat: 35.8562, lng: 129.2247 }
};

function latLngToTile(lat: number, lng: number, zoom: number): { x: number; y: number } {
  const x = Math.floor(((lng + 180) / 360) * Math.pow(2, zoom));
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * Math.pow(2, zoom)
  );
  return { x, y };
}

export function generateCityTileUrls(lat: number, lng: number): string[] {
  const urls: string[] = [];
  const zoomLevels = [11, 12, 13];

  for (const z of zoomLevels) {
    const center = latLngToTile(lat, lng, z);
    // 3x3 radius around center
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const x = center.x + dx;
        const y = center.y + dy;
        const s = ['mt0', 'mt1', 'mt2', 'mt3'][(x + y) % 4];
        urls.push(`https://${s}.google.com/vt/lyrs=m&hl=en&gl=US&x=${x}&y=${y}&z=${z}`);
      }
    }
  }

  return urls;
}

/**
 * Preloads map tiles for a specified Korean region into the service worker cache
 */
export async function preloadRegionTiles(
  regionKey: string = 'daegu',
  onProgress?: (p: PreloadProgress) => void
): Promise<boolean> {
  const region = PRELOAD_REGIONS[regionKey] || PRELOAD_REGIONS.daegu || PRELOAD_REGIONS.seoul;
  const tileUrls = generateCityTileUrls(region.lat, region.lng);
  const total = tileUrls.length;
  let completed = 0;

  // Check if Service Worker is active and message-able
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_URLS',
      urls: tileUrls
    });
  }

  // Also fetch directly through browser cache
  for (const url of tileUrls) {
    try {
      await fetch(url, { mode: 'no-cors' });
    } catch {}
    completed++;
    if (onProgress) {
      onProgress({
        total,
        completed,
        percent: Math.round((completed / total) * 100),
        city: region.name,
        isDone: completed === total
      });
    }
  }

  try {
    const cachedRegions = JSON.parse(localStorage.getItem('kr_travel_cached_map_regions') || '[]');
    if (!cachedRegions.includes(regionKey)) {
      cachedRegions.push(regionKey);
      localStorage.setItem('kr_travel_cached_map_regions', JSON.stringify(cachedRegions));
    }
  } catch {}

  return true;
}

export function getCachedRegions(): string[] {
  try {
    return JSON.parse(localStorage.getItem('kr_travel_cached_map_regions') || '["daegu"]');
  } catch {
    return ['daegu'];
  }
}
