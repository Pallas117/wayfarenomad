/**
 * Haptic Identity — Tactile Language for the Nomad Platform
 * Uses the Web Vibration API to create distinct haptic patterns.
 */

type HapticPattern = number | number[];

const HAPTIC_PATTERNS: Record<string, HapticPattern> = {
  // Success / Verification — Two crisp, light pulses
  success: [40, 80, 40],

  // Roaming Beacon Match — Slow, rhythmic heartbeat
  beaconMatch: [100, 200, 60, 200, 100, 200, 60],

  // Emergency SOS Alert — Long, heavy, rapid vibrations
  sosAlert: [200, 50, 200, 50, 200, 50, 200, 50, 200],

  // Message Received — Single thud
  messageReceived: [80],

  // Music Identified — 3 ascending pulses (short-medium-long)
  musicIdentified: [30, 60, 60, 60, 120],

  // Vision Quest Complete — Shimmer (micro-vibrations)
  shimmer: [15, 20, 15, 20, 15, 20, 15, 20, 15, 20, 15, 20, 15],

  // Stardust earned — Sparkle
  stardust: [20, 30, 20, 30, 40, 30, 60],

  // Typewriter tick — Single micro pulse
  typewriterTick: [8],

  // Button press — Light tap
  tap: [15],
};

// Global vibration intensity (0–1), persisted in localStorage
let vibrationIntensity = 1;

export function getVibrationIntensity(): number {
  if (typeof window === "undefined") return 1;
  const stored = localStorage.getItem("nomad-vibration-intensity");
  if (stored !== null) {
    vibrationIntensity = parseFloat(stored);
  }
  return vibrationIntensity;
}

export function setVibrationIntensity(intensity: number): void {
  vibrationIntensity = Math.max(0, Math.min(1, intensity));
  if (typeof window !== "undefined") {
    localStorage.setItem("nomad-vibration-intensity", String(vibrationIntensity));
  }
}

function isHapticsSupported(): boolean {
  return typeof navigator !== "undefined" && "vibrate" in navigator;
}

function scalePattern(pattern: HapticPattern, intensity: number): number[] {
  if (intensity <= 0) return [];
  const arr = Array.isArray(pattern) ? pattern : [pattern];
  // Scale durations by intensity (minimum 5ms for each vibration segment)
  return arr.map((dur, i) => {
    // Even indices are vibrations, odd are pauses
    if (i % 2 === 0) {
      return Math.max(5, Math.round(dur * intensity));
    }
    return dur; // Keep pauses the same
  });
}

/**
 * Trigger a named haptic pattern
 */
export function haptic(patternName: keyof typeof HAPTIC_PATTERNS): void {
  if (!isHapticsSupported()) return;
  const intensity = getVibrationIntensity();
  if (intensity <= 0) return;

  const pattern = HAPTIC_PATTERNS[patternName];
  if (!pattern) return;

  const scaled = scalePattern(pattern, intensity);
  try {
    navigator.vibrate(scaled);
  } catch {
    // Silently fail on unsupported devices
  }
}

/**
 * Stop all vibration
 */
export function hapticCancel(): void {
  if (!isHapticsSupported()) return;
  try {
    navigator.vibrate(0);
  } catch {
    // noop
  }
}

/**
 * Check if haptics are available
 */
export function isHapticsAvailable(): boolean {
  return isHapticsSupported();
}

export { HAPTIC_PATTERNS };
