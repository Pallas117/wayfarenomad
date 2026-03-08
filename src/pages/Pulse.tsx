import { useState, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Radio, MapPin, Calendar, ExternalLink, Music, Code, PartyPopper, CheckCircle, Loader2, RefreshCw, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CulturalEar } from "@/components/CulturalEar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const categories = [
  { id: "all", label: "All", icon: Radio },
  { id: "music", label: "Music", icon: Music },
  { id: "tech", label: "Tech", icon: Code },
  { id: "festival", label: "Festival", icon: PartyPopper },
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
}

export default function Pulse() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeCity, setActiveCity] = useState("all");
  const [focusedEvent, setFocusedEvent] = useState<string | null>(null);
  const [events, setEvents] = useState<PulseEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    let query = supabase.from("events").select("*").order("created_at", { ascending: false }).limit(50);
    const { data, error } = await query;
    if (!error && data) {
      setEvents(data as PulseEvent[]);
    }
    setLoading(false);
  };

  const handleScrape = async () => {
    setScraping(true);
    try {
      const { data, error } = await supabase.functions.invoke("scrape-events", {
        body: activeCity !== "all" ? { city: activeCity } : {},
      });
      if (error) throw error;
      toast({ title: "Scrape Complete", description: `Found ${data?.scraped || 0} events from ${(data?.cities || []).join(", ")}` });
      await loadEvents();
    } catch (err) {
      toast({ title: "Scrape Failed", description: String(err), variant: "destructive" });
    }
    setScraping(false);
  };

  const handleVerify = async (eventId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("events")
      .update({ verified: true, verified_by: user.id })
      .eq("id", eventId);
    if (!error) {
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, verified: true } : e));
      toast({ title: "Event Verified ✓", description: "Thank you for verifying this event." });
    }
  };

  const filtered = events.filter(e => {
    const catMatch = activeCategory === "all" || e.category === activeCategory;
    const cityMatch = activeCity === "all" || e.city === activeCity;
    return catMatch && cityMatch;
  });

  return (
    <div className="p-6 max-w-lg mx-auto pb-24">
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <Radio className="h-6 w-6 text-primary animate-pulse-glow" />
          <h1 className="text-2xl font-display font-bold">Community Pulse</h1>
        </div>
        <div className="flex items-center gap-2">
          <CulturalEar />
          <Button
            variant="outline"
            size="icon"
            onClick={handleScrape}
            disabled={scraping}
            className="h-9 w-9"
          >
            {scraping ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </motion.div>

      {/* City selector */}
      <Tabs value={activeCity} onValueChange={setActiveCity} className="mb-4">
        <TabsList className="w-full bg-secondary/50">
          <TabsTrigger value="all" className="flex-1 text-xs">
            <Globe className="h-3 w-3 mr-1" /> All
          </TabsTrigger>
          {CITIES.map(city => (
            <TabsTrigger key={city} value={city} className="flex-1 text-xs">
              {city === "Kuala Lumpur" ? "KL" : city}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Map placeholder */}
      <motion.div
        className="glass-card rounded-xl h-48 mb-6 relative overflow-hidden cursor-pointer"
        layoutId="pulse-map"
        onClick={() => setFocusedEvent(null)}
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-background/50" />
        <div className="relative flex items-center justify-center h-full">
          <div className="text-center">
            <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {activeCity === "all" ? "Southeast Asia Hub" : activeCity}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{filtered.length} events</p>
          </div>
        </div>

        {/* Animated pins */}
        <LayoutGroup>
          {filtered.slice(0, 6).map((event, i) => {
            const positions = [
              { top: "20%", left: "15%" },
              { top: "35%", right: "20%" },
              { bottom: "25%", left: "33%" },
              { top: "50%", right: "30%" },
              { top: "30%", left: "55%" },
              { bottom: "35%", right: "15%" },
            ];
            const pos = positions[i % positions.length];
            const isFocused = focusedEvent === event.id;

            return (
              <motion.div key={event.id} className="absolute" style={pos} layoutId={`pin-${event.id}`}>
                <motion.button
                  className="relative"
                  onClick={(e) => { e.stopPropagation(); setFocusedEvent(isFocused ? null : event.id); }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.div
                    className={`h-3 w-3 rounded-full ${event.verified ? "bg-primary" : "bg-primary/50"}`}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                  />
                  {event.verified && (
                    <CheckCircle className="absolute -top-1 -right-1 h-2.5 w-2.5 text-primary" />
                  )}
                  <AnimatePresence>
                    {isFocused && (
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0, y: 5 }}
                        animate={{ scale: 1, opacity: 1, y: -8 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 glass-card rounded-lg px-3 py-1.5 whitespace-nowrap z-10 border border-primary/20"
                      >
                        <p className="text-xs font-medium">{event.title}</p>
                        <p className="text-[10px] text-muted-foreground">{event.city}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>
            );
          })}
        </LayoutGroup>

        <AnimatePresence>
          {focusedEvent && (
            <motion.div
              className="absolute inset-0 bg-background/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ pointerEvents: "none" }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Category Filter */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-6">
        <TabsList className="w-full bg-secondary/50">
          {categories.map((c) => (
            <TabsTrigger key={c.id} value={c.id} className="flex-1 text-xs">
              {c.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Event Cards */}
      <LayoutGroup>
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="glass-card rounded-xl p-5 animate-pulse h-32" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              className="text-center py-12 text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Radio className="h-8 w-8 mx-auto mb-3 text-primary/40" />
              <p className="text-sm">No events found. Tap refresh to scrape live events.</p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filtered.map((event) => {
                const CatIcon = categoryIcon[event.category] || Radio;
                return (
                  <motion.div
                    key={event.id}
                    layout
                    layoutId={`event-${event.id}`}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="glass-card rounded-xl p-5"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CatIcon className="h-4 w-4 text-primary" />
                        <Badge variant="secondary" className="text-xs capitalize">
                          {event.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {event.city === "Kuala Lumpur" ? "KL" : event.city}
                        </Badge>
                        {event.scraped_from && (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            {event.scraped_from}
                          </Badge>
                        )}
                        {event.verified ? (
                          <Badge className="text-xs bg-primary/20 text-primary border-primary/30">
                            <CheckCircle className="h-3 w-3 mr-1" /> Verified
                          </Badge>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-primary"
                            onClick={() => handleVerify(event.id)}
                          >
                            Verify
                          </Button>
                        )}
                      </div>
                      {event.source_url && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild>
                          <a href={event.source_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>

                    <h3 className="font-display font-semibold text-lg mb-1">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{event.description}</p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {event.venue && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {event.venue}
                        </span>
                      )}
                      {event.event_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {event.event_date}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </LayoutGroup>
    </div>
  );
}
