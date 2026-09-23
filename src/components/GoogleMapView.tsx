/// <reference types="@types/google.maps" />
// Source: Google Maps Platform Code Assist
import React, { useEffect, useRef } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap
} from '@vis.gl/react-google-maps';
import { Coordinates, Landmark, TransitStop, ResidencyInfo } from '../types';

interface GoogleMapViewProps {
  apiKey: string;
  center: { lat: number; lng: number };
  zoom: number;
  userLocation: Coordinates | null;
  residency: ResidencyInfo;
  landmarks: Landmark[];
  transitStops: TransitStop[];
  selectedPlace: {
    type: 'landmark' | 'transit' | 'residency';
    item: any;
  } | null;
  onSelectPlace: (place: { type: 'landmark' | 'transit' | 'residency'; item: any }) => void;
  mapStyle: 'streets' | 'satellite';
  showPlaceLabels: boolean;
  trackerPath: Coordinates[];
  darkMode: boolean;
  onMapClick?: (coords: Coordinates) => void;
}

// Camera pan controller
const CameraController: React.FC<{
  center: { lat: number; lng: number };
  zoom: number;
}> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    map.panTo(center);
    map.setZoom(zoom);
  }, [map, center.lat, center.lng, zoom]);
  return null;
};

// Polylines for Direct Route and Trip Tracking Path
const PolylinesLayer: React.FC<{
  userLocation: Coordinates | null;
  selectedCoords: { lat: number; lng: number } | null;
  trackerPath: Coordinates[];
}> = ({ userLocation, selectedCoords, trackerPath }) => {
  const map = useMap();
  const routePolylineRef = useRef<google.maps.Polyline | null>(null);
  const trackerPolylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map) return;
    if (userLocation && selectedCoords) {
      const path = [
        { lat: userLocation.lat, lng: userLocation.lng },
        { lat: selectedCoords.lat, lng: selectedCoords.lng }
      ];
      if (!routePolylineRef.current) {
        routePolylineRef.current = new google.maps.Polyline({
          path,
          strokeColor: '#2563eb',
          strokeOpacity: 0.85,
          strokeWeight: 3,
          map
        });
      } else {
        routePolylineRef.current.setPath(path);
        routePolylineRef.current.setMap(map);
      }
    } else if (routePolylineRef.current) {
      routePolylineRef.current.setMap(null);
      routePolylineRef.current = null;
    }

    return () => {
      if (routePolylineRef.current) {
        routePolylineRef.current.setMap(null);
        routePolylineRef.current = null;
      }
    };
  }, [map, userLocation, selectedCoords]);

  useEffect(() => {
    if (!map) return;
    if (trackerPath.length > 1) {
      const path = trackerPath.map((p) => ({ lat: p.lat, lng: p.lng }));
      if (!trackerPolylineRef.current) {
        trackerPolylineRef.current = new google.maps.Polyline({
          path,
          strokeColor: '#059669',
          strokeOpacity: 0.9,
          strokeWeight: 4,
          map
        });
      } else {
        trackerPolylineRef.current.setPath(path);
        trackerPolylineRef.current.setMap(map);
      }
    } else if (trackerPolylineRef.current) {
      trackerPolylineRef.current.setMap(null);
      trackerPolylineRef.current = null;
    }

    return () => {
      if (trackerPolylineRef.current) {
        trackerPolylineRef.current.setMap(null);
        trackerPolylineRef.current = null;
      }
    };
  }, [map, trackerPath]);

  return null;
};

// Map click listener component
const MapEventsListener: React.FC<{
  onMapClick?: (coords: Coordinates) => void;
}> = ({ onMapClick }) => {
  const map = useMap();
  useEffect(() => {
    if (!map || !onMapClick) return;
    const listener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      }
    });
    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map, onMapClick]);
  return null;
};

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  apiKey,
  center,
  zoom,
  userLocation,
  residency,
  landmarks,
  transitStops,
  selectedPlace,
  onSelectPlace,
  mapStyle,
  showPlaceLabels,
  trackerPath,
  onMapClick
}) => {
  const selectedCoords = selectedPlace?.item?.lat && selectedPlace?.item?.lng
    ? { lat: selectedPlace.item.lat, lng: selectedPlace.item.lng }
    : null;

  return (
    <APIProvider apiKey={apiKey} language="en" region="KR">
      <div className="w-full h-full relative" style={{ minHeight: '400px' }}>
        <Map
          id="korea-google-map"
          mapId="DEMO_MAP_ID"
          style={{ width: '100%', height: '100%' }}
          defaultCenter={center}
          defaultZoom={zoom}
          mapTypeId={mapStyle === 'satellite' ? 'hybrid' : 'roadmap'}
          gestureHandling="greedy"
          disableDefaultUI={false}
          fullscreenControl={false}
          streetViewControl={true}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        >
          <CameraController center={center} zoom={zoom} />
          <PolylinesLayer
            userLocation={userLocation}
            selectedCoords={selectedCoords}
            trackerPath={trackerPath}
          />
          <MapEventsListener onMapClick={onMapClick} />

          {/* User Location Marker */}
          {userLocation && (
            <AdvancedMarker
              position={{ lat: userLocation.lat, lng: userLocation.lng }}
              title="My Current GPS Location"
              onClick={() =>
                onSelectPlace({
                  type: 'landmark',
                  item: {
                    id: 'current-user-pos',
                    nameEn: 'My Current Location',
                    nameKo: '내 현재 위치',
                    lat: userLocation.lat,
                    lng: userLocation.lng,
                    description: `Active GPS location in South Korea. Precise coordinates: ${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}`,
                    nearestStation: 'Current Position',
                    subwayLine: 'GPS Tracking'
                  }
                })
              }
            >
              <div className="relative flex flex-col items-center cursor-pointer">
                <div className="w-7 h-7 rounded-full bg-blue-500/30 animate-ping absolute" />
                <div className="w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-[9px] font-black">
                  YOU
                </div>
                <div className="mt-0.5 px-1.5 py-0.5 rounded bg-blue-900/90 text-white font-bold text-[9px] border border-blue-400 shadow-xs whitespace-nowrap">
                  Current Location
                </div>
              </div>
            </AdvancedMarker>
          )}

          {/* Residency Hotel Marker */}
          {residency.isConfigured && residency.lat && residency.lng && (
            <AdvancedMarker
              position={{ lat: residency.lat, lng: residency.lng }}
              title={residency.name}
              onClick={() =>
                onSelectPlace({
                  type: 'residency',
                  item: {
                    id: 'my-residency',
                    nameEn: residency.name,
                    nameKo: residency.nameKo || '숙소',
                    lat: residency.lat,
                    lng: residency.lng,
                    description: residency.addressEn,
                    notes: residency.notes,
                    nearestStation: 'Your Pinned Stay',
                    subwayLine: 'Residency Base'
                  }
                })
              }
            >
              <div className="relative flex flex-col items-center cursor-pointer">
                <div className="px-1.5 py-0.5 bg-amber-500 text-neutral-950 font-bold text-[9px] rounded shadow-md border border-white whitespace-nowrap mb-0.5">
                  🏨 {residency.name.slice(0, 16)}
                </div>
                <div className="w-7 h-7 rounded-full bg-amber-500 border-2 border-white text-neutral-950 flex items-center justify-center shadow-lg font-black text-xs">
                  ★
                </div>
              </div>
            </AdvancedMarker>
          )}

          {/* Landmarks with English Pins */}
          {landmarks.map((l) => {
            let color = 'bg-blue-600';
            let emoji = '⭐';
            if (l.category === 'company') {
              color = 'bg-indigo-600';
              emoji = '🏢';
            } else if (l.category === 'hospital') {
              color = 'bg-rose-600';
              emoji = '🏥';
            } else if (l.category === 'church') {
              color = 'bg-violet-600';
              emoji = '⛪';
            } else if (l.category === 'temple') {
              color = 'bg-amber-600';
              emoji = '🛕';
            } else if (l.category === 'park') {
              color = 'bg-emerald-600';
              emoji = '🌳';
            } else if (l.category === 'palace') {
              color = 'bg-rose-700';
              emoji = '🏯';
            } else if (l.category === 'market') {
              color = 'bg-orange-600';
              emoji = '🛍️';
            } else if (l.category === 'food') {
              color = 'bg-amber-600';
              emoji = '🍲';
            } else if (l.category === 'kculture') {
              color = 'bg-pink-600';
              emoji = '✨';
            }

            const cleanName = l.nameEn
              .split('(')[0]
              .replace('Headquarters', 'HQ')
              .replace('Hospital', 'Hosp')
              .replace('Cathedral', 'Cath')
              .replace('National', 'Natl')
              .replace('University', 'Univ')
              .trim();

            return (
              <AdvancedMarker
                key={l.id}
                position={{ lat: l.lat, lng: l.lng }}
                title={`${l.nameEn} - ${l.nearestStation}`}
                onClick={() => onSelectPlace({ type: 'landmark', item: l })}
              >
                <div className="group relative flex flex-col items-center cursor-pointer transition-transform hover:scale-125">
                  <div
                    className={`w-7 h-7 rounded-full ${color} border-2 border-white shadow-md flex items-center justify-center text-[12px] text-white`}
                  >
                    {emoji}
                  </div>
                  {showPlaceLabels && (
                    <div className="px-1.5 py-0.5 mt-0.5 rounded bg-neutral-900/90 text-white font-medium text-[9px] border border-neutral-700/80 shadow-xs whitespace-nowrap pointer-events-none">
                      {cleanName.slice(0, 16)}
                    </div>
                  )}
                </div>
              </AdvancedMarker>
            );
          })}

          {/* Transit Stops */}
          {transitStops.map((t) => (
            <AdvancedMarker
              key={t.id}
              position={{ lat: t.lat, lng: t.lng }}
              title={`${t.nameEn} (${t.city})`}
              onClick={() => onSelectPlace({ type: 'transit', item: t })}
            >
              <div className="group relative flex flex-col items-center cursor-pointer transition-transform hover:scale-125">
                <div className="w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-md flex items-center justify-center text-[11px] text-white">
                  🚇
                </div>
                {showPlaceLabels && (
                  <div className="px-1.5 py-0.5 mt-0.5 rounded bg-blue-950/90 text-blue-200 font-semibold text-[9px] border border-blue-700/80 shadow-xs whitespace-nowrap pointer-events-none">
                    {t.nameEn.replace(' Station', '').slice(0, 14)}
                  </div>
                )}
              </div>
            </AdvancedMarker>
          ))}
        </Map>
      </div>
    </APIProvider>
  );
};
