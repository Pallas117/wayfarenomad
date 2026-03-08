import { useState, useCallback, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, Search, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

const pinIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,hsl(43,72%,52%),hsl(43,80%,60%));border:2px solid hsl(225,60%,7%);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.4);">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(225,60%,7%)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

interface LocationPickerProps {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number, name?: string) => void;
}

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 15, { duration: 0.8 });
  }, [lat, lng, map]);
  return null;
}

export function LocationPicker({ lat, lng, onChange }: LocationPickerProps) {
  const [open, setOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [reversing, setReversing] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const reverseGeocode = useCallback(async (rlat: number, rlng: number) => {
    setReversing(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${rlat}&lon=${rlng}&zoom=18&addressdetails=0`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (data?.display_name) {
        const shortName = data.display_name.split(",").slice(0, 2).join(",").trim();
        onChange(rlat, rlng, shortName);
        setQuery(shortName);
      }
    } catch { /* silent */ }
    setReversing(false);
  }, [onChange]);

  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(pos.coords.latitude, pos.coords.longitude);
        reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
        setOpen(true);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [onChange, reverseGeocode]);

  const searchNominatim = useCallback(async (q: string) => {
    if (q.length < 3) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=0`,
        { headers: { "Accept-Language": "en" } }
      );
      const data: NominatimResult[] = await res.json();
      setResults(data);
      setShowResults(true);
    } catch {
      setResults([]);
    }
    setSearching(false);
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchNominatim(value), 400);
  };

  const selectResult = (result: NominatimResult) => {
    const resultLat = parseFloat(result.lat);
    const resultLng = parseFloat(result.lon);
    // Use a shorter display name (first 2 parts)
    const shortName = result.display_name.split(",").slice(0, 2).join(",").trim();
    onChange(resultLat, resultLng, shortName);
    setQuery(shortName);
    setShowResults(false);
    setOpen(true);
  };

  const hasPin = lat !== null && lng !== null;

  return (
    <div className="space-y-2">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search for a place…"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          className="pl-8 pr-8 h-9 text-xs"
        />
        {searching && (
          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />
        )}

        {/* Autocomplete dropdown */}
        <AnimatePresence>
          {showResults && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute z-50 top-full mt-1 w-full rounded-lg border border-border bg-background shadow-lg overflow-hidden"
            >
              {results.map((r, i) => (
                <button
                  key={`${r.lat}-${r.lon}-${i}`}
                  type="button"
                  onClick={() => selectResult(r)}
                  className="w-full text-left px-3 py-2.5 text-xs hover:bg-secondary/50 transition-colors flex items-start gap-2 border-b border-border/50 last:border-b-0"
                >
                  <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <span className="line-clamp-2 text-foreground/80">{r.display_name}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={open ? "default" : "outline"}
          size="sm"
          className="flex-1 text-xs"
          onClick={() => setOpen(!open)}
        >
          {reversing ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <MapPin className="h-3.5 w-3.5 mr-1.5" />}
          {reversing ? "Resolving…" : hasPin ? `📍 ${lat!.toFixed(4)}, ${lng!.toFixed(4)}` : "Pin on Map"}
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
          {locating ? "Locating…" : "My Location"}
        </Button>
      </div>

      {/* Map */}
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
              <ClickHandler onClick={(clickLat, clickLng) => { onChange(clickLat, clickLng); reverseGeocode(clickLat, clickLng); }} />
              {hasPin && (
                <>
                  <Marker position={[lat!, lng!]} icon={pinIcon} />
                  <FlyTo lat={lat!} lng={lng!} />
                </>
              )}
            </MapContainer>
          </motion.div>
        )}
      </AnimatePresence>

      {open && (
        <p className="text-[10px] text-muted-foreground text-center">
          Tap the map to place your pin, or search above
        </p>
      )}
    </div>
  );
}
