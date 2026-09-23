import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { addOfflineBasemap } from '../utils/offlineBasemap';
import { Coordinates } from '../types';
import { reverseGeocodeKorea } from '../utils/geoSearch';
import { Crosshair, MapPin, ZoomIn, ZoomOut, Check, Loader2 } from 'lucide-react';

interface PinpointPickerMapProps {
  coords: Coordinates;
  onChangeCoords: (coords: Coordinates, addressEn?: string, addressKo?: string) => void;
  darkMode: boolean;
  height?: string;
  pinLabel?: string;
  allowReverseGeocode?: boolean;
}

export const PinpointPickerMap: React.FC<PinpointPickerMapProps> = ({
  coords,
  onChangeCoords,
  darkMode,
  height = '220px',
  pinLabel = 'My Home Pin',
  allowReverseGeocode = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<Coordinates>(coords);

  // Synchronize internal coords with props
  useEffect(() => {
    setCurrentCoords(coords);
    if (markerRef.current) {
      markerRef.current.setLatLng([coords.lat, coords.lng]);
    }
    if (mapRef.current) {
      mapRef.current.panTo([coords.lat, coords.lng], { animate: true });
    }
  }, [coords.lat, coords.lng]);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(containerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 16,
        minZoom: 10,
        maxZoom: 19,
        zoomControl: false,
        attributionControl: false
      });

      // Bundled offline basemap (shows through when online tiles are unavailable)
      addOfflineBasemap(map).catch(() => {});

      // Add English-labeled Google Maps street tiles
      L.tileLayer('https://{s}.google.com/vt/lyrs=m&hl=en&gl=US&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
      }).addTo(map);

      // Custom Home Pin marker
      const pinIcon = L.divIcon({
        className: 'custom-pinpoint-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: grab;">
            <div style="width: 38px; height: 38px; border-radius: 9999px; background: #f59e0b; border: 3px solid #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; font-size: 18px; transform: translateY(-4px);">
              🏠
            </div>
            <div style="width: 8px; height: 8px; border-radius: 9999px; background: #f59e0b; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.4); margin-top: -2px;"></div>
            <div style="padding: 2px 8px; border-radius: 6px; background: #171717; color: #fbbf24; font-size: 10px; font-weight: 700; border: 1px solid #78350f; white-space: nowrap; margin-top: 2px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
              ${pinLabel}
            </div>
          </div>
        `,
        iconSize: [80, 64],
        iconAnchor: [40, 42]
      });

      const marker = L.marker([coords.lat, coords.lng], {
        icon: pinIcon,
        draggable: true,
        zIndexOffset: 1000
      }).addTo(map);

      // Handle marker drag
      marker.on('dragend', async () => {
        const latLng = marker.getLatLng();
        const newCoords: Coordinates = { lat: latLng.lat, lng: latLng.lng };
        setCurrentCoords(newCoords);

        if (allowReverseGeocode) {
          setIsReverseGeocoding(true);
          try {
            const rev = await reverseGeocodeKorea(newCoords);
            onChangeCoords(newCoords, rev.addressEn, rev.addressKo);
          } catch {
            onChangeCoords(newCoords);
          } finally {
            setIsReverseGeocoding(false);
          }
        } else {
          onChangeCoords(newCoords);
        }
      });

      // Handle map click to reposition pin
      map.on('click', async (e: L.LeafletMouseEvent) => {
        const newCoords: Coordinates = { lat: e.latlng.lat, lng: e.latlng.lng };
        marker.setLatLng([newCoords.lat, newCoords.lng]);
        setCurrentCoords(newCoords);

        if (allowReverseGeocode) {
          setIsReverseGeocoding(true);
          try {
            const rev = await reverseGeocodeKorea(newCoords);
            onChangeCoords(newCoords, rev.addressEn, rev.addressKo);
          } catch {
            onChangeCoords(newCoords);
          } finally {
            setIsReverseGeocoding(false);
          }
        } else {
          onChangeCoords(newCoords);
        }
      });

      markerRef.current = marker;
      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  const handleCenterOnPin = () => {
    if (mapRef.current && markerRef.current) {
      mapRef.current.setView([currentCoords.lat, currentCoords.lng], 17, { animate: true });
    }
  };

  const handleZoomIn = () => {
    if (mapRef.current) mapRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapRef.current) mapRef.current.zoomOut();
  };

  return (
    <div className="relative rounded-xl overflow-hidden border border-neutral-700/60 shadow-inner group">
      {/* Map Canvas */}
      <div
        ref={containerRef}
        style={{ height, width: '100%' }}
        className="z-0 bg-neutral-900"
      />

      {/* Top Banner Guide */}
      <div className="absolute top-2 left-2 right-2 z-10 pointer-events-none flex items-center justify-between">
        <div className="px-2.5 py-1 rounded-lg bg-neutral-950/85 backdrop-blur-md border border-amber-500/40 text-[11px] font-semibold text-amber-300 shadow-md flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Tap or drag pin to your exact building entrance</span>
        </div>

        {isReverseGeocoding && (
          <div className="px-2 py-1 rounded-lg bg-neutral-950/85 backdrop-blur-md border border-blue-500/40 text-[10px] font-medium text-blue-300 shadow-md flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
            <span>Updating road address...</span>
          </div>
        )}
      </div>

      {/* Floating Map Controls */}
      <div className="absolute bottom-2 right-2 z-10 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={handleCenterOnPin}
          title="Center on Pin"
          className="w-8 h-8 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 text-amber-400 border border-neutral-700 flex items-center justify-center shadow-lg transition-all cursor-pointer"
        >
          <Crosshair className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In"
          className="w-8 h-8 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 flex items-center justify-center shadow-lg transition-all cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out"
          className="w-8 h-8 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 flex items-center justify-center shadow-lg transition-all cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Coordinates Indicator */}
      <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
        <div className="px-2 py-0.5 rounded bg-neutral-950/80 backdrop-blur-xs border border-neutral-800 text-[10px] font-mono text-neutral-400">
          Lat: {currentCoords.lat.toFixed(5)}, Lng: {currentCoords.lng.toFixed(5)}
        </div>
      </div>
    </div>
  );
};
