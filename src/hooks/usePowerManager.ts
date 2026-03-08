import { useState, useEffect, useCallback } from "react";

/**
 * Power management levels:
 * - "full"     → All animations, effects, real-time features enabled
 * - "balanced" → Reduce particle counts, lower animation FPS, reduce polling
 * - "saver"    → Disable canvas animations, 3D, particles; minimal motion only
 * - "critical" → Lock non-essential features, static UI only
 */
export type PowerMode = "full" | "balanced" | "saver" | "critical";

interface PowerState {
  mode: PowerMode;
  batteryLevel: number | null;    // 0–1 or null if unavailable
  isCharging: boolean | null;
  /** Whether animations should run */
  allowAnimations: boolean;
  /** Whether canvas/WebGL effects should run */
  allowCanvasEffects: boolean;
  /** Whether particles/stardust should render */
  allowParticles: boolean;
  /** Whether 3D (Three.js) scenes should render */
  allow3D: boolean;
  /** Whether framer-motion should use reduced animations */
  reduceMotion: boolean;
  /** Max star/particle count multiplier (0–1) */
  particleMultiplier: number;
  /** Polling interval multiplier (1 = normal, higher = less frequent) */
  pollingMultiplier: number;
}

// Battery API type (not in all TS libs)
interface BatteryManager extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  onchargingchange: ((this: BatteryManager, ev: Event) => void) | null;
  onlevelchange: ((this: BatteryManager, ev: Event) => void) | null;
}

function determinePowerMode(level: number | null, charging: boolean | null, prefersReduced: boolean): PowerMode {
  // Respect OS-level reduced motion preference
  if (prefersReduced) return "saver";

  // If we can't detect battery, assume full but check reduced motion
  if (level === null) return "full";

  // Charging = always full
  if (charging) return "full";

  if (level > 0.5) return "full";
  if (level > 0.25) return "balanced";
  if (level > 0.1) return "saver";
  return "critical";
}

function modeToState(mode: PowerMode, batteryLevel: number | null, isCharging: boolean | null): PowerState {
  switch (mode) {
    case "full":
      return {
        mode, batteryLevel, isCharging,
        allowAnimations: true,
        allowCanvasEffects: true,
        allowParticles: true,
        allow3D: true,
        reduceMotion: false,
        particleMultiplier: 1,
        pollingMultiplier: 1,
      };
    case "balanced":
      return {
        mode, batteryLevel, isCharging,
        allowAnimations: true,
        allowCanvasEffects: true,
        allowParticles: true,
        allow3D: true,
        reduceMotion: false,
        particleMultiplier: 0.5,
        pollingMultiplier: 1.5,
      };
    case "saver":
      return {
        mode, batteryLevel, isCharging,
        allowAnimations: true,
        allowCanvasEffects: false,
        allowParticles: false,
        allow3D: false,
        reduceMotion: true,
        particleMultiplier: 0,
        pollingMultiplier: 3,
      };
    case "critical":
      return {
        mode, batteryLevel, isCharging,
        allowAnimations: false,
        allowCanvasEffects: false,
        allowParticles: false,
        allow3D: false,
        reduceMotion: true,
        particleMultiplier: 0,
        pollingMultiplier: 5,
      };
  }
}

export function usePowerManager(): PowerState {
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState<boolean | null>(null);
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    // Check OS-level reduced motion preference
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);

    // Battery Status API
    const nav = navigator as any;
    if (nav.getBattery) {
      nav.getBattery().then((battery: BatteryManager) => {
        setBatteryLevel(battery.level);
        setIsCharging(battery.charging);

        battery.onlevelchange = () => setBatteryLevel(battery.level);
        battery.onchargingchange = () => setIsCharging(battery.charging);
      });
    }

    return () => mq.removeEventListener("change", handler);
  }, []);

  const mode = determinePowerMode(batteryLevel, isCharging, prefersReduced);
  return modeToState(mode, batteryLevel, isCharging);
}

/**
 * Lightweight check — use in components that don't need the full hook.
 * Returns current power mode without subscribing to updates.
 */
export function getPowerModeSync(): PowerMode {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (mq.matches) return "saver";
  return "full"; // Can't synchronously check battery
}
