import { createContext, useContext, type ReactNode } from "react";
import { usePowerManager, type PowerMode } from "@/hooks/usePowerManager";

interface PowerContextValue {
  mode: PowerMode;
  batteryLevel: number | null;
  isCharging: boolean | null;
  allowAnimations: boolean;
  allowCanvasEffects: boolean;
  allowParticles: boolean;
  allow3D: boolean;
  reduceMotion: boolean;
  particleMultiplier: number;
  pollingMultiplier: number;
}

const PowerContext = createContext<PowerContextValue>({
  mode: "full",
  batteryLevel: null,
  isCharging: null,
  allowAnimations: true,
  allowCanvasEffects: true,
  allowParticles: true,
  allow3D: true,
  reduceMotion: false,
  particleMultiplier: 1,
  pollingMultiplier: 1,
});

export function PowerProvider({ children }: { children: ReactNode }) {
  const power = usePowerManager();
  return <PowerContext.Provider value={power}>{children}</PowerContext.Provider>;
}

export function usePower() {
  return useContext(PowerContext);
}
