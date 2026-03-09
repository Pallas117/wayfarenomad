import { useEffect, useCallback } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MarkerClusterLayer } from "./MarkerClusterLayer";

// Fix default marker icons in Leaflet + bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DARK_TILES = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TOPO_TILES = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";

// SVG paths for category icons (stroke-based, 24x24 viewBox)
const pinSvgs: Record<string, string> = {
  music: `<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>`,
  tech: `<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>`,
  festival: `<path d="M5.8 11.3 2 22l10.7-3.79"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"/><path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17"/><path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7"/><path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"/>`,
  // Resource categories
  wet_market: `<path d="M2 12h20"/><path d="M12 2v20"/><circle cx="12" cy="12" r="4"/>`,
  water: `<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>`,
  secure_nook: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`,
};

const categoryColors: Record<string, { bg: string; border: string }> = {
  music: { bg: "hsl(280,60%,50%)", border: "hsl(280,70%,65%)" },
  tech: { bg: "hsl(200,80%,50%)", border: "hsl(200,90%,65%)" },
  festival: { bg: "hsl(340,75%,55%)", border: "hsl(340,85%,70%)" },
  wet_market: { bg: "hsl(25,80%,50%)", border: "hsl(25,90%,65%)" },
  water: { bg: "hsl(195,85%,45%)", border: "hsl(195,90%,60%)" },
  secure_nook: { bg: "hsl(145,60%,40%)", border: "hsl(145,70%,55%)" },
};

function makeCategoryIcon(category?: string) {
  const color = categoryColors[category || ""] || { bg: "hsl(43,72%,52%)", border: "hsl(225,60%,7%)" };
  const svg = pinSvgs[category || ""];
  const innerSvg = svg
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svg}</svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;

  return new L.DivIcon({
    className: "",
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${color.bg};border:2px solid ${color.border};display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.4);">${innerSvg}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

const beaconIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:24px;height:24px;border-radius:50%;background:hsl(43,72%,52%);opacity:0.6;border:2px solid hsl(43,80%,60%);animation:pulse 2s infinite;"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export type { MapPin } from "./MapView.types";
import type { MapPin } from "./MapView.types";

interface MapViewProps {
  pins: MapPin[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  tileUrl?: string;
  intrepidMode?: boolean;
  onPinClick?: (pin: MapPin) => void;
}

function FitBounds({ pins }: { pins: MapPin[] }) {
  const map = useMap();

  useEffect(() => {
    if (pins.length === 0) return;
    const bounds = L.latLngBounds(pins.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [pins, map]);

  return null;
}

function makePinIcon(pin: MapPin): L.DivIcon {
  return pin.type === "beacon" ? beaconIcon : makeCategoryIcon(pin.category);
}

export function MapView({ pins, center = [3.139, 101.6869], zoom = 10, className = "", tileUrl, intrepidMode, onPinClick }: MapViewProps) {
  const url = tileUrl || (intrepidMode ? TOPO_TILES : DARK_TILES);

  const stableMakeIcon = useCallback((pin: MapPin) => makePinIcon(pin), []);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={false}
      className={className}
      style={{
        height: "100%",
        width: "100%",
        borderRadius: "var(--radius)",
        ...(intrepidMode ? { filter: "sepia(0.3) saturate(1.4) brightness(0.85) hue-rotate(15deg)" } : {}),
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url={url}
      />
      {pins.length > 0 && <FitBounds pins={pins} />}
      <MarkerClusterLayer
        pins={pins}
        makeIcon={stableMakeIcon}
        onPinClick={onPinClick}
      />
    </MapContainer>
  );
}
