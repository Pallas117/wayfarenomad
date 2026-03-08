import { useState, useEffect, useMemo, lazy, Suspense, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, MapPin, Calendar, ExternalLink, Music, Code, PartyPopper, CheckCircle, Loader2, RefreshCw, Globe, Mountain, Droplets, ShoppingCart, Shield } from "lucide-react";
import { WeatherSunIcon } from "@/components/animations/TravelIcons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { CulturalEar } from "@/components/CulturalEar";
import { AddResourceForm } from "@/components/AddResourceForm";
import type { MapPin as MapPinType } from "@/components/MapView.types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRank } from "@/hooks/useUserRank";
import { useToast } from "@/hooks/use-toast";
import { useHangouts } from "@/hooks/useHangouts";
import { format } from "date-fns";

const LazyMapView = lazy(() => import("@/components/MapView").then(m => ({ default: m.MapView })));

const categories = [
  { id: "all", label: "All", icon: Radio },
  { id: "music", label: "Music", icon: Music },
  { id: "tech", label: "Tech", icon: Code },
  { id: "festival", label: "Festival", icon: PartyPopper },
];

const resourceFilters = [
  { id: "wet_market", label: "Markets", icon: ShoppingCart },
  { id: "water", label: "Water", icon: Droplets },
  { id: "secure_nook", label: "Nooks", icon: Shield },
];

const CITIES = ["Kuala Lumpur", "Singapore", "Krabi"];

const categoryIcon: Record<string, React.ElementType> = {
  tech: Code,
  music: Music,
  festival: PartyPopper,
};

interface PulseEvent {
  id: string;
  title: string;
  category: string;
  venue: string | null;
  event_date: string | null;
  description: string | null;
  source_url: string | null;
  city: string;
  verified: boolean | null;
  scraped_from: string | null;
  lat: number | null;
  lng: number | null;
}

interface FunctionalPoint {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  city: string;
  description: string | null;
  verified: boolean;
}

export default function Pulse() {
  const { user } = useAuth();
  const { isSteward } = useUserRank();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeCity, setActiveCity] = useState("all");
  const [activeResources, setActiveResources] = useState<string[]>([]);
  const [events, setEvents] = useState<PulseEvent[]>([]);
  const [resources, setResources] = useState<FunctionalPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [intrepidMode, setIntrepidMode] = useState(() => localStorage.getItem("intrepid") === "1");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: hangouts } = useHangouts();

  useEffect(() => { loadEvents(); loadResources(); }, []);

  const loadEvents = async () => {
    setLoading(true);
    const { data } = await supabase.from("events").select("*").order("created_at", { ascending: false }).limit(50);
    if (data) setEvents(data as PulseEvent[]);
    setLoading(false);
  };

  const loadResources = async () => {
    const { data } = await supabase.from("functional_points").select("*");
    if (data) setResources(data as FunctionalPoint[]);
  };

  const handleScrape = async () => {
    setScraping(true);
    try {
      const { data, error } = await supabase.functions.invoke("scrape-events", {
        body: activeCity !== "all" ? { city: activeCity } : {},
      });
      if (error) throw error;
      toast({ title: "Scrape Complete", description: `Found ${data?.scraped || 0} events` });
      await loadEvents();
    } catch (err) {
      toast({ title: "Scrape Failed", description: String(err), variant: "destructive" });
    }
    setScraping(false);
  };

  const handleVerify = async (eventId: string) => {
    if (!user) return;
    const { error } = await supabase.from("events").update({ verified: true, verified_by: user.id }).eq("id", eventId);
    if (!error) {
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, verified: true } : e));
      toast({ title: "Event Verified ✓" });
    }
  };

  const toggleIntrepid = useCallback(() => {
    setIntrepidMode(prev => {
      const next = !prev;
      localStorage.setItem("intrepid", next ? "1" : "0");
      return next;
    });
  }, []);

  const toggleResource = (id: string) => {
    setActiveResources(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const filtered = events.filter(e => {
    const catMatch = activeCategory === "all" || e.category === activeCategory;
    const cityMatch = activeCity === "all" || e.city === activeCity;
    return catMatch && cityMatch;
  });

  const mapPins: MapPinType[] = useMemo(() => {
    const pins: MapPinType[] = [];
    filtered.forEach((e) => {
      if (e.lat && e.lng) {
        pins.push({ id: e.id, lat: e.lat, lng: e.lng, title: e.title, subtitle: e.venue || e.city, type: "event", category: e.category });
      }
    });
    hangouts?.forEach((h) => {
      if (h.lat && h.lng) {
        pins.push({ id: h.id, lat: h.lat, lng: h.lng, title: h.title, subtitle: format(new Date(h.hangout_time), "MMM d, h:mm a"), type: "hangout" });
      }
    });
    // Resource pins
    if (activeResources.length > 0) {
      resources.filter(r => activeResources.includes(r.category)).forEach(r => {
        pins.push({ id: r.id, lat: r.lat, lng: r.lng, title: r.name, subtitle: r.description || r.category, type: "resource", category: r.category });
      });
    }
    return pins;
  }, [filtered, hangouts, resources, activeResources]);

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* Full-screen map */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<div className="h-full w-full bg-background animate-pulse" />}>
          <LazyMapView pins={mapPins} intrepidMode={intrepidMode} className="!rounded-none" />
        </Suspense>
      </div>

      {/* Floating top controls */}
      <div className="absolute top-0 left-0 right-0 z-[1000] p-3 space-y-2">
        {/* Header bar */}
        <div className="flex items-center justify-between glass-card rounded-xl px-3 py-2">
          <div className="flex items-center gap-2">
            <WeatherSunIcon className="h-5 w-5 text-primary" />
            <h1 className="text-sm font-display font-bold">Pulse</h1>
          </div>
          <div className="flex items-center gap-1.5">
            <CulturalEar />
            <Button
              variant={intrepidMode ? "default" : "outline"}
              size="sm"
              onClick={toggleIntrepid}
              className="h-8 text-[10px] gap-1"
            >
              <Mountain className="h-3.5 w-3.5" />
              {intrepidMode ? "Intrepid" : "Standard"}
            </Button>
            <Button variant="outline" size="icon" onClick={handleScrape} disabled={scraping} className="h-8 w-8">
              {scraping ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>

        {/* City tabs */}
        <Tabs value={activeCity} onValueChange={setActiveCity}>
          <TabsList className="w-full bg-background/80 backdrop-blur-md h-8">
            <TabsTrigger value="all" className="flex-1 text-[10px] h-7"><Globe className="h-3 w-3 mr-0.5" />All</TabsTrigger>
            {CITIES.map(city => (
              <TabsTrigger key={city} value={city} className="flex-1 text-[10px] h-7">
                {city === "Kuala Lumpur" ? "KL" : city}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Category + Resource filters */}
        <div className="flex gap-1.5 flex-wrap">
          {categories.map((c) => (
            <Button
              key={c.id}
              variant={activeCategory === c.id ? "default" : "outline"}
              size="sm"
              className="h-7 text-[10px] px-2 bg-background/80 backdrop-blur-md"
              onClick={() => setActiveCategory(c.id)}
            >
              <c.icon className="h-3 w-3 mr-0.5" />{c.label}
            </Button>
          ))}
          <div className="w-px h-7 bg-border" />
          {resourceFilters.map((r) => (
            <Button
              key={r.id}
              variant={activeResources.includes(r.id) ? "default" : "outline"}
              size="sm"
              className="h-7 text-[10px] px-2 bg-background/80 backdrop-blur-md"
              onClick={() => toggleResource(r.id)}
            >
              <r.icon className="h-3 w-3 mr-0.5" />{r.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Floating action buttons */}
      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
        {isSteward && <AddResourceForm onAdded={loadResources} />}
      </div>

      {/* Bottom drawer trigger */}
      <Button
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] gradient-gold text-primary-foreground shadow-lg rounded-full px-5 h-10 text-xs font-display"
        onClick={() => setDrawerOpen(true)}
      >
        <Radio className="h-3.5 w-3.5 mr-1.5" />
        {filtered.length} Events
      </Button>

      {/* Bottom drawer for event list */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-h-[70vh]">
          <DrawerHeader>
            <DrawerTitle className="font-display text-sm">Community Events</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 space-y-3 overflow-y-auto max-h-[55vh]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <Radio className="h-6 w-6 mx-auto mb-2 text-primary/40" />
                No events found. Tap refresh to scrape.
              </div>
            ) : (
              filtered.map((event) => {
                const CatIcon = categoryIcon[event.category] || Radio;
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <CatIcon className="h-3.5 w-3.5 text-primary" />
                        <Badge variant="secondary" className="text-[10px] capitalize">{event.category}</Badge>
                        <Badge variant="outline" className="text-[10px]">{event.city === "Kuala Lumpur" ? "KL" : event.city}</Badge>
                        {event.verified ? (
                          <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30"><CheckCircle className="h-2.5 w-2.5 mr-0.5" />Verified</Badge>
                        ) : (
                          <Button variant="ghost" size="sm" className="h-5 text-[10px] text-primary px-1" onClick={() => handleVerify(event.id)}>Verify</Button>
                        )}
                      </div>
                      {event.source_url && (
                        <a href={event.source_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                    <h3 className="font-display font-semibold text-sm mb-0.5">{event.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{event.description}</p>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      {event.venue && <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{event.venue}</span>}
                      {event.event_date && <span className="flex items-center gap-0.5"><Calendar className="h-2.5 w-2.5" />{event.event_date}</span>}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
