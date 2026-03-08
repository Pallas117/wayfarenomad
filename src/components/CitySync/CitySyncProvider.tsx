import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { haptic } from "@/lib/haptics";

// ─── Regional Hub Definitions ───
export interface RegionalTheme {
  id: string;
  name: string;
  emoji: string;
  // HSL values for CSS variables
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  card: string;
  cardForeground: string;
  // Custom theme tokens
  gold: string;
  goldGlow: string;
  goldDim: string;
  navy: string;
  navyLight: string;
  navyLighter: string;
}

export const REGIONAL_THEMES: Record<string, RegionalTheme> = {
  default: {
    id: "default",
    name: "Global — Midnight Navy",
    emoji: "🌍",
    background: "225 60% 7%",
    foreground: "40 10% 96%",
    primary: "43 72% 52%",
    primaryForeground: "225 60% 7%",
    secondary: "225 35% 15%",
    secondaryForeground: "40 10% 96%",
    muted: "225 25% 14%",
    mutedForeground: "225 15% 55%",
    accent: "43 72% 52%",
    accentForeground: "225 60% 7%",
    border: "225 25% 18%",
    card: "225 50% 10%",
    cardForeground: "40 10% 96%",
    gold: "43 72% 52%",
    goldGlow: "43 80% 60%",
    goldDim: "43 50% 35%",
    navy: "225 60% 7%",
    navyLight: "225 50% 10%",
    navyLighter: "225 35% 15%",
  },
  london: {
    id: "london",
    name: "London — Misty Slate",
    emoji: "🇬🇧",
    background: "215 30% 9%",
    foreground: "210 15% 95%",
    primary: "210 15% 72%",
    primaryForeground: "215 30% 9%",
    secondary: "215 20% 16%",
    secondaryForeground: "210 15% 95%",
    muted: "215 18% 15%",
    mutedForeground: "215 12% 50%",
    accent: "210 15% 72%",
    accentForeground: "215 30% 9%",
    border: "215 18% 20%",
    card: "215 25% 12%",
    cardForeground: "210 15% 95%",
    gold: "210 15% 72%",
    goldGlow: "210 20% 80%",
    goldDim: "210 10% 50%",
    navy: "215 30% 9%",
    navyLight: "215 25% 12%",
    navyLighter: "215 20% 16%",
  },
  dubai: {
    id: "dubai",
    name: "West Asia — Desert Gold",
    emoji: "🕌",
    background: "30 40% 6%",
    foreground: "38 20% 95%",
    primary: "38 85% 50%",
    primaryForeground: "30 40% 6%",
    secondary: "30 30% 14%",
    secondaryForeground: "38 20% 95%",
    muted: "30 22% 13%",
    mutedForeground: "30 15% 50%",
    accent: "25 80% 45%",
    accentForeground: "30 40% 6%",
    border: "30 25% 18%",
    card: "30 35% 9%",
    cardForeground: "38 20% 95%",
    gold: "38 85% 50%",
    goldGlow: "38 90% 58%",
    goldDim: "38 60% 35%",
    navy: "30 40% 6%",
    navyLight: "30 35% 9%",
    navyLighter: "30 30% 14%",
  },
  scandinavia: {
    id: "scandinavia",
    name: "Scandinavia — Aurora Teal",
    emoji: "🌌",
    background: "200 45% 6%",
    foreground: "185 20% 96%",
    primary: "175 65% 50%",
    primaryForeground: "200 45% 6%",
    secondary: "200 30% 14%",
    secondaryForeground: "185 20% 96%",
    muted: "200 22% 13%",
    mutedForeground: "200 15% 48%",
    accent: "175 65% 50%",
    accentForeground: "200 45% 6%",
    border: "200 22% 18%",
    card: "200 38% 9%",
    cardForeground: "185 20% 96%",
    gold: "175 65% 50%",
    goldGlow: "175 70% 58%",
    goldDim: "175 45% 35%",
    navy: "200 45% 6%",
    navyLight: "200 38% 9%",
    navyLighter: "200 30% 14%",
  },
};

// ─── City → Hub Mapping ───
const CITY_TO_HUB: Record<string, string> = {
  london: "london",
  manchester: "london",
  birmingham: "london",
  edinburgh: "london",
  bristol: "london",
  oxford: "london",
  cambridge: "london",
  dubai: "dubai",
  "abu dhabi": "dubai",
  doha: "dubai",
  riyadh: "dubai",
  jeddah: "dubai",
  muscat: "dubai",
  kuwait: "dubai",
  bahrain: "dubai",
  amman: "dubai",
  beirut: "dubai",
  istanbul: "dubai",
  stockholm: "scandinavia",
  oslo: "scandinavia",
  copenhagen: "scandinavia",
  helsinki: "scandinavia",
  reykjavik: "scandinavia",
  bergen: "scandinavia",
  gothenburg: "scandinavia",
  malmö: "scandinavia",
  tampere: "scandinavia",
};

function resolveHub(cityName: string): string {
  const lower = cityName.toLowerCase().trim();
  return CITY_TO_HUB[lower] || "default";
}

// ─── Apply theme to document ───
function applyTheme(theme: RegionalTheme) {
  const root = document.documentElement;
  root.style.setProperty("--background", theme.background);
  root.style.setProperty("--foreground", theme.foreground);
  root.style.setProperty("--primary", theme.primary);
  root.style.setProperty("--primary-foreground", theme.primaryForeground);
  root.style.setProperty("--secondary", theme.secondary);
  root.style.setProperty("--secondary-foreground", theme.secondaryForeground);
  root.style.setProperty("--muted", theme.muted);
  root.style.setProperty("--muted-foreground", theme.mutedForeground);
  root.style.setProperty("--accent", theme.accent);
  root.style.setProperty("--accent-foreground", theme.accentForeground);
  root.style.setProperty("--border", theme.border);
  root.style.setProperty("--input", theme.border);
  root.style.setProperty("--ring", theme.primary);
  root.style.setProperty("--card", theme.card);
  root.style.setProperty("--card-foreground", theme.cardForeground);
  root.style.setProperty("--popover", theme.card);
  root.style.setProperty("--popover-foreground", theme.cardForeground);
  root.style.setProperty("--gold", theme.gold);
  root.style.setProperty("--gold-glow", theme.goldGlow);
  root.style.setProperty("--gold-dim", theme.goldDim);
  root.style.setProperty("--navy", theme.navy);
  root.style.setProperty("--navy-light", theme.navyLight);
  root.style.setProperty("--navy-lighter", theme.navyLighter);
  root.style.setProperty("--sidebar-background", theme.navyLight);
  root.style.setProperty("--sidebar-foreground", theme.foreground);
  root.style.setProperty("--sidebar-primary", theme.primary);
  root.style.setProperty("--sidebar-primary-foreground", theme.primaryForeground);
  root.style.setProperty("--sidebar-accent", theme.secondary);
  root.style.setProperty("--sidebar-accent-foreground", theme.secondaryForeground);
  root.style.setProperty("--sidebar-border", theme.border);
  root.style.setProperty("--sidebar-ring", theme.primary);
}

// ─── Context ───
interface CitySyncContextValue {
  currentHub: string;
  currentCity: string;
  theme: RegionalTheme;
  isScanning: boolean;
  scanComplete: boolean;
  nodesFound: string[];
  setHubManually: (hubId: string) => void;
  rescan: () => void;
}

const CitySyncContext = createContext<CitySyncContextValue>({
  currentHub: "default",
  currentCity: "",
  theme: REGIONAL_THEMES.default,
  isScanning: false,
  scanComplete: false,
  nodesFound: [],
  setHubManually: () => {},
  rescan: () => {},
});

export function useCitySync() {
  return useContext(CitySyncContext);
}

// ─── Reverse Geocoding (free — BigDataCloud) ───
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    const data = await res.json();
    return data.city || data.locality || data.principalSubdivision || "";
  } catch {
    return "";
  }
}

// ─── Provider ───
export function CitySyncProvider({ children }: { children: ReactNode }) {
  const [currentHub, setCurrentHub] = useState("default");
  const [currentCity, setCurrentCity] = useState("");
  const [isScanning, setIsScanning] = useState(true);
  const [scanComplete, setScanComplete] = useState(false);
  const [nodesFound, setNodesFound] = useState<string[]>([]);

  const theme = REGIONAL_THEMES[currentHub] || REGIONAL_THEMES.default;

  const performScan = useCallback(async () => {
    setIsScanning(true);
    setScanComplete(false);
    setNodesFound([]);

    // Simulate node discovery with haptic ticks
    const nodes = ["Local Pulse", "Transit Links", "Nearby Stewards", "Safe Spaces"];
    
    // Try geolocation
    let detectedCity = "";
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
          enableHighAccuracy: false,
        });
      });

      detectedCity = await reverseGeocode(position.coords.latitude, position.coords.longitude);
    } catch {
      // Geolocation denied or unavailable — use default
    }

    // Simulate progressive node discovery
    for (let i = 0; i < nodes.length; i++) {
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
      setNodesFound((prev) => [...prev, nodes[i]]);
      haptic("typewriterTick");
    }

    // Final city resolution
    await new Promise((r) => setTimeout(r, 400));

    if (detectedCity) {
      setCurrentCity(detectedCity);
      const hub = resolveHub(detectedCity);
      setCurrentHub(hub);
      applyTheme(REGIONAL_THEMES[hub] || REGIONAL_THEMES.default);
    } else {
      // Check localStorage for previously set hub
      const stored = localStorage.getItem("nomad-hub");
      if (stored && REGIONAL_THEMES[stored]) {
        setCurrentHub(stored);
        applyTheme(REGIONAL_THEMES[stored]);
      } else {
        applyTheme(REGIONAL_THEMES.default);
      }
    }

    haptic("success");
    setScanComplete(true);

    // Keep scanning screen for a moment, then hide
    await new Promise((r) => setTimeout(r, 1200));
    setIsScanning(false);
  }, []);

  useEffect(() => {
    performScan();
  }, [performScan]);

  const setHubManually = useCallback((hubId: string) => {
    if (REGIONAL_THEMES[hubId]) {
      setCurrentHub(hubId);
      applyTheme(REGIONAL_THEMES[hubId]);
      localStorage.setItem("nomad-hub", hubId);
      haptic("success");
    }
  }, []);

  return (
    <CitySyncContext.Provider
      value={{
        currentHub,
        currentCity,
        theme,
        isScanning,
        scanComplete,
        nodesFound,
        setHubManually,
        rescan: performScan,
      }}
    >
      {children}
    </CitySyncContext.Provider>
  );
}
