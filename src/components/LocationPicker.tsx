import { useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const pinIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,hsl(43,72%,52%),hsl(43,80%,60%));border:2px solid hsl(225,60%,7%);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.4);">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(225,60%,7%)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

interface LocationPickerProps {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function LocationPicker({ lat, lng, onChange }: LocationPickerProps) {
  const [open, setOpen] = useState(false);
  const [locating, setLocating] = useState(false);

  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [onChange]);

  const hasPin = lat !== null && lng !== null;

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={open ? "default" : "outline"}
          size="sm"
          className="flex-1 text-xs"
          onClick={() => setOpen(!open)}
        >
          <MapPin className="h-3.5 w-3.5 mr-1.5" />
          {hasPin ? `📍 ${lat!.toFixed(4)}, ${lng!.toFixed(4)}` : "Pin on Map"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={handleGeolocate}
          disabled={locating}
        >
          <Navigation className="h-3.5 w-3.5 mr-1.5" />
          {locating ? "Locating…" : "Use My Location"}
        </Button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 200, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="rounded-xl overflow-hidden border border-border"
          >
            <MapContainer
              center={hasPin ? [lat!, lng!] : [3.139, 101.6869]}
              zoom={hasPin ? 14 : 10}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              <ClickHandler onClick={onChange} />
              {hasPin && <Marker position={[lat!, lng!]} icon={pinIcon} />}
            </MapContainer>
          </motion.div>
        )}
      </AnimatePresence>

      {open && (
        <p className="text-[10px] text-muted-foreground text-center">
          Tap the map to place your pin
        </p>
      )}
    </div>
  );
}
