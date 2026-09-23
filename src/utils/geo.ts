import { Coordinates, MultiModalEstimate } from '../types';

/**
 * Calculates distance between two GPS coordinates using Haversine formula (meters)
 */
export function calculateDistanceMeters(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (coord1.lat * Math.PI) / 180;
  const phi2 = (coord2.lat * Math.PI) / 180;
  const deltaPhi = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const deltaLambda = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Formats distance into readable string (e.g., "450 m" or "3.2 km")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Calculates initial bearing from point A to point B in degrees (0 - 360)
 */
export function calculateBearing(start: Coordinates, end: Coordinates): number {
  const lat1 = (start.lat * Math.PI) / 180;
  const lat2 = (end.lat * Math.PI) / 180;
  const diffLng = ((end.lng - start.lng) * Math.PI) / 180;

  const y = Math.sin(diffLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(diffLng);

  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

/**
 * Cardinal direction string from bearing
 */
export function getCardinalDirection(bearing: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
}

/**
 * Estimate walking time in minutes (~4.5 km/h)
 */
export function estimateWalkMinutes(meters: number): number {
  const speedMetersPerMin = 75; // ~4.5 km/h
  return Math.max(1, Math.round(meters / speedMetersPerMin));
}

/**
 * Estimate transit/taxi time in minutes
 */
export function estimateDriveMinutes(meters: number): number {
  if (meters < 1000) return 3;
  const speedMetersPerMin = 400; // ~24 km/h urban traffic
  return Math.max(4, Math.round(meters / speedMetersPerMin) + 2);
}

/**
 * Calculates comprehensive multi-modal travel distance & times:
 * Walking, Cycling, Transit, and Riding/Taxi with Korean Won fare estimates
 */
export function calculateMultiModalEstimate(directDistanceMeters: number): MultiModalEstimate {
  // Urban routing winding factor: ~1.25x for walking, ~1.2x for cycling, ~1.35x for driving
  const walkDist = Math.round(directDistanceMeters * 1.25);
  const cycleDist = Math.round(directDistanceMeters * 1.2);
  const transitDist = Math.round(directDistanceMeters * 1.3);
  const driveDist = Math.round(directDistanceMeters * 1.35);

  // Walking: ~4.5 km/h (75 m/min)
  const walkMinutes = Math.max(1, Math.round(walkDist / 75));
  const walkSteps = Math.round(walkDist * 1.31);
  const walkCalories = Math.round((walkDist / 1000) * 62);

  // Cycling: ~15 km/h (250 m/min)
  const cycleMinutes = Math.max(1, Math.round(cycleDist / 250));
  const cycleCalories = Math.round((cycleDist / 1000) * 38);

  // Public Transit (Subway & City Bus): ~30 km/h + 5 min wait/transfer
  const transitMinutes = Math.max(4, Math.round(transitDist / 500) + 4);
  const baseTransitFare = 1400; // Standard Adult T-Money fare
  const extraTransitFare = transitDist > 10000 ? Math.ceil((transitDist - 10000) / 5000) * 100 : 0;
  const estimatedFareKrw = baseTransitFare + extraTransitFare;

  // Taxi / Driving: ~35 km/h urban + traffic lights
  const driveMinutes = Math.max(3, Math.round(driveDist / 580) + 2);
  // Korean standard taxi base fare (₩4,800 for first 1.6km, then ~₩1,100 per km)
  const extraDriveKm = Math.max(0, (driveDist - 1600) / 1000);
  const estimatedTaxiFareKrw = Math.round(4800 + extraDriveKm * 1100);

  return {
    directDistanceMeters,
    walking: {
      distanceMeters: walkDist,
      minutes: walkMinutes,
      steps: walkSteps,
      calories: walkCalories
    },
    cycling: {
      distanceMeters: cycleDist,
      minutes: cycleMinutes,
      calories: cycleCalories
    },
    transit: {
      distanceMeters: transitDist,
      minutes: transitMinutes,
      estimatedFareKrw,
      note: 'Subway / Bus with T-Money Card (Free transfer within 30 min)'
    },
    driving: {
      distanceMeters: driveDist,
      minutes: driveMinutes,
      estimatedTaxiFareKrw
    }
  };
}

/**
 * Text to speech for Korean words using browser Web Speech API
 */
export function speakKoreanText(text: string): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.85; // Slightly slower for clear pronunciation learning
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('Speech synthesis error:', err);
    return false;
  }
}

/**
 * Plays emergency SOS alarm sound using Web Audio API
 */
let audioCtx: AudioContext | null = null;
let sirenOscillator: OscillatorNode | null = null;
let sirenGain: GainNode | null = null;
let sirenInterval: any = null;

export function startEmergencySiren(): void {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    stopEmergencySiren();

    sirenOscillator = audioCtx.createOscillator();
    sirenGain = audioCtx.createGain();

    sirenOscillator.type = 'sawtooth';
    sirenGain.gain.setValueAtTime(0.2, audioCtx.currentTime);

    sirenOscillator.connect(sirenGain);
    sirenGain.connect(audioCtx.destination);

    sirenOscillator.start();

    // Alternate between 700Hz and 950Hz (police/ambulance siren style)
    let high = false;
    sirenInterval = setInterval(() => {
      if (!sirenOscillator || !audioCtx) return;
      const targetFreq = high ? 700 : 960;
      sirenOscillator.frequency.setTargetAtTime(targetFreq, audioCtx.currentTime, 0.1);
      high = !high;
    }, 450);
  } catch (e) {
    console.warn('Audio siren not supported or blocked:', e);
  }
}

export function stopEmergencySiren(): void {
  if (sirenInterval) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }
  if (sirenOscillator) {
    try {
      sirenOscillator.stop();
      sirenOscillator.disconnect();
    } catch {}
    sirenOscillator = null;
  }
  if (sirenGain) {
    try {
      sirenGain.disconnect();
    } catch {}
    sirenGain = null;
  }
}
