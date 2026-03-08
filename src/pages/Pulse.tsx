import { useState, useEffect, useMemo, lazy, Suspense, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, MapPin, Calendar, ExternalLink, CheckCircle, Loader2, RefreshCw, Globe, Mountain, Droplets, ShoppingCart, Shield, Flag, AlertTriangle, Heart, Landmark, Clapperboard, ShoppingBag, TreePine, CalendarDays, PartyPopper, Moon, Dumbbell, Compass, Palette, HeartHandshake, Skull, Star, TrendingUp, Clock, Flame, Users, ShieldCheck, Sparkles, EyeOff, Zap } from "lucide-react";
import { WeatherSunIcon } from "@/components/animations/TravelIcons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { CulturalEar } from "@/components/CulturalEar";
import { AddResourceForm } from "@/components/AddResourceForm";
import { SubmitEventForm } from "@/components/SubmitEventForm";
import type { MapPin as MapPinType } from "@/components/MapView.types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRank } from "@/hooks/useUserRank";
import { useToast } from "@/hooks/use-toast";
import { useHangouts } from "@/hooks/useHangouts";
import { format, formatDistanceToNow } from "date-fns";
import { useEventReactions } from "@/hooks/useEventReactions";
import { catStyle, catIconStyle } from "@/lib/categoryColors";

const LazyMapView = lazy(() => import("@/components/MapView").then(m => ({ default: m.MapView })));

const categories = [
  { id: "all", label: "All", icon: Radio },
  { id: "wellbeing", label: "Wellbeing", icon: Heart },
  { id: "culture", label: "Culture", icon: Landmark },
  { id: "entertainment", label: "Entertainment", icon: Clapperboard },
  { id: "shopping", label: "Shopping", icon: ShoppingBag },
  { id: "nature", label: "Nature", icon: TreePine },
  { id: "event", label: "Event", icon: CalendarDays },
  { id: "festival", label: "Festival", icon: PartyPopper },
  { id: "nightlife", label: "Nightlife", icon: Moon },
  { id: "fitness", label: "Fitness", icon: Dumbbell },
  { id: "adventure", label: "Adventure", icon: Compass },
  { id: "creative", label: "Creative", icon: Palette },
  { id: "singles", label: "Singles", icon: HeartHandshake },
  { id: "alien", label: "Alien", icon: Skull },
];

const resourceFilters = [
  { id: "wet_market", label: "Markets", icon: ShoppingCart },
  { id: "water", label: "Water", icon: Droplets },
  { id: "secure_nook", label: "Nooks", icon: Shield },
];

const CITIES = ["Kuala Lumpur", "Singapore", "Krabi"];

const categoryIcon: Record<string, React.ElementType> = {
  wellbeing: Heart,
  culture: Landmark,
  entertainment: Clapperboard,
  shopping: ShoppingBag,
  nature: TreePine,
  event: CalendarDays,
  festival: PartyPopper,
  nightlife: Moon,
  fitness: Dumbbell,
  adventure: Compass,
  creative: Palette,
  singles: HeartHandshake,
  alien: Skull,
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
  star_count?: number;
  like_count?: number;
  flag_count?: number;
  is_user_submitted?: boolean;
  submitted_by?: string | null;
  verification_status?: string;
  community_verify_count?: number;
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

interface KarmaPulse {
  id: string;
  action: string;
  icon: React.ElementType;
  displayName: string;
  isAnonymous: boolean;
  points: number;
  timeAgo: string;
  color: string;
}

function useKarmaPulses() {
  const [pulses, setPulses] = useState<KarmaPulse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPulses = async () => {
      // Fetch recent community verifications
      const [verRes, sosRes, safeRes] = await Promise.all([
        supabase
          .from("community_verifications")
          .select("id, created_at, user_id")
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("sos_responses")
          .select("id, created_at, responder_id")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("safe_spaces")
          .select("id, created_at, created_by, name")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      // Collect all user IDs
      const userIds = new Set<string>();
      verRes.data?.forEach(v => userIds.add(v.user_id));
      sosRes.data?.forEach(s => userIds.add(s.responder_id));
      safeRes.data?.forEach(s => userIds.add(s.created_by));

      // Fetch profiles for all users
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, leaderboard_anonymous")
        .in("user_id", Array.from(userIds));

      const profileMap = new Map<string, { display_name: string | null; leaderboard_anonymous: boolean }>();
      profiles?.forEach((p: any) => profileMap.set(p.user_id, p));

      const getName = (userId: string) => {
        const p = profileMap.get(userId);
        const isAnon = !!(p as any)?.leaderboard_anonymous;
        return {
          displayName: isAnon ? "Anonymous Nomad" : (p?.display_name || "A Traveler"),
          isAnonymous: isAnon,
        };
      };

      const allPulses: KarmaPulse[] = [];

      verRes.data?.forEach(v => {
        const { displayName, isAnonymous } = getName(v.user_id);
        allPulses.push({
          id: `ver-${v.id}`,
          action: "verified an event",
          icon: CheckCircle,
          displayName,
          isAnonymous,
          points: 5,
          timeAgo: formatDistanceToNow(new Date(v.created_at), { addSuffix: true }),
          color: "hsl(var(--cat-wellbeing))",
        });
      });

      sosRes.data?.forEach(s => {
        const { displayName, isAnonymous } = getName(s.responder_id);
        allPulses.push({
          id: `sos-${s.id}`,
          action: "responded to an SOS",
          icon: Shield,
          displayName,
          isAnonymous,
          points: 10,
          timeAgo: formatDistanceToNow(new Date(s.created_at), { addSuffix: true }),
          color: "hsl(var(--destructive))",
        });
      });

      safeRes.data?.forEach(s => {
        const { displayName, isAnonymous } = getName(s.created_by);
        allPulses.push({
          id: `safe-${s.id}`,
          action: `added safe space "${s.name}"`,
          icon: Heart,
          displayName,
          isAnonymous,
          points: 8,
          timeAgo: formatDistanceToNow(new Date(s.created_at), { addSuffix: true }),
          color: "hsl(var(--primary))",
        });
      });

      // Sort by most recent
      allPulses.sort((a, b) => {
        // Simple sort by the raw id order since they're already fetched newest first
        return 0;
      });

      setPulses(allPulses.slice(0, 15));
      setLoading(false);
    };

    fetchPulses();
  }, []);

  return { pulses, loading };
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
  const [sortMode, setSortMode] = useState<"trending" | "newest">("trending");
  const { data: hangouts } = useHangouts();
  const filteredIds = useMemo(() => events.map(e => e.id), [events]);
  const { toggleReaction, hasReaction } = useEventReactions(filteredIds);
  const { pulses: karmaPulses, loading: karmaPulsesLoading } = useKarmaPulses();

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

  const handleCommunityVerify = async (eventId: string) => {
    if (!user) return;
    const { error } = await supabase.from("community_verifications" as any).insert({ event_id: eventId, user_id: user.id, is_accurate: true });
    if (!error) {
      setEvents(prev => prev.map(e => {
        if (e.id !== eventId) return e;
        const newCount = (e.community_verify_count ?? 0) + 1;
        return {
          ...e,
          community_verify_count: newCount,
          verification_status: newCount >= 3 ? "community_verified" : e.verification_status,
        };
      }));
      toast({ title: "Verified! +5 ✨", description: "Thanks for keeping Pulse accurate." });
    } else if (error.code === "23505") {
      toast({ title: "Already Verified", description: "You've already verified this event.", variant: "destructive" });
    }
  };

  const handleAdminVerify = async (eventId: string) => {
    if (!user) return;
    const { error } = await supabase.from("events").update({ verified: true, verified_by: user.id, verification_status: "admin_verified" } as any).eq("id", eventId);
    if (!error) {
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, verified: true, verification_status: "admin_verified" } : e));
      toast({ title: "Admin Verified ✓" });
    }
  };

  const handleFlag = async (eventId: string) => {
    if (!user) return;
    const { error } = await supabase.from("event_flags" as any).insert({ event_id: eventId, user_id: user.id });
    if (!error) {
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, flag_count: (e.flag_count ?? 0) + 1 } : e));
      toast({ title: "Event Flagged", description: "Thanks for helping keep Pulse accurate." });
    } else if (error.code === "23505") {
      toast({ title: "Already Flagged", description: "You've already flagged this event.", variant: "destructive" });
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

  const filtered = useMemo(() => {
    const f = events.filter(e => {
      const catMatch = activeCategory === "all" || e.category === activeCategory;
      const cityMatch = activeCity === "all" || e.city === activeCity;
      const notHidden = (e.flag_count ?? 0) < 3;
      return catMatch && cityMatch && notHidden;
    });
    if (sortMode === "trending") {
      f.sort((a, b) => (b.star_count ?? 0) - (a.star_count ?? 0));
    }
    return f;
  }, [events, activeCategory, activeCity, sortMode]);

  // Hot Right Now — top 3 starred events
  const hotEvents = useMemo(() => {
    return [...events]
      .filter(e => (e.flag_count ?? 0) < 3)
      .sort((a, b) => (b.star_count ?? 0) - (a.star_count ?? 0))
      .slice(0, 3);
  }, [events]);

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

        {/* Category + Resource filters with category colors */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {categories.map((c) => {
            const isActive = activeCategory === c.id;
            const style = c.id !== "all" && isActive ? catStyle(c.id) : undefined;
            return (
              <Button
                key={c.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={`h-7 text-[10px] px-2.5 backdrop-blur-md shrink-0 transition-all ${isActive ? "border shadow-sm" : "bg-background/80"}`}
                style={style}
                onClick={() => setActiveCategory(c.id)}
              >
                <c.icon className="h-3 w-3 mr-0.5" />{c.label}
              </Button>
            );
          })}
          <div className="w-px h-7 bg-border shrink-0" />
          {resourceFilters.map((r) => (
            <Button
              key={r.id}
              variant={activeResources.includes(r.id) ? "default" : "outline"}
              size="sm"
              className="h-7 text-[10px] px-2 bg-background/80 backdrop-blur-md shrink-0"
              onClick={() => toggleResource(r.id)}
            >
              <r.icon className="h-3 w-3 mr-0.5" />{r.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Floating action buttons */}
      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
        <SubmitEventForm onSubmitted={loadEvents} />
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
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader className="flex flex-row items-center justify-between pb-2">
            <DrawerTitle className="font-display text-sm">Community Events</DrawerTitle>
            <div className="flex items-center gap-1">
              <Button
                variant={sortMode === "trending" ? "default" : "outline"}
                size="sm"
                className="h-7 text-[10px] px-2"
                onClick={() => setSortMode("trending")}
              >
                <TrendingUp className="h-3 w-3 mr-0.5" />Trending
              </Button>
              <Button
                variant={sortMode === "newest" ? "default" : "outline"}
                size="sm"
                className="h-7 text-[10px] px-2"
                onClick={() => setSortMode("newest")}
              >
                <Clock className="h-3 w-3 mr-0.5" />Newest
              </Button>
            </div>
          </DrawerHeader>

          {/* 🔥 Hot Right Now */}
          {hotEvents.length > 0 && (
            <div className="px-4 pb-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-xs font-display font-bold uppercase tracking-wider" style={{ color: "hsl(25 90% 55%)" }}>Hot Right Now</span>
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {hotEvents.map((event, i) => {
                  const CatIcon = categoryIcon[event.category] || Radio;
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="shrink-0 w-48 rounded-xl p-3 border relative overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, hsl(${catStyle(event.category).color?.replace('hsl(', '').replace(')', '')} / 0.15), hsl(var(--card)))`,
                        borderColor: `hsl(${catStyle(event.category).color?.replace('hsl(', '').replace(')', '')} / 0.3)`,
                      }}
                    >
                      <div className="absolute top-2 right-2 text-xs font-bold" style={{ color: "hsl(25 90% 55%)" }}>
                        #{i + 1}
                      </div>
                      <div className="flex items-center gap-1 mb-1">
                        <CatIcon className="h-3 w-3" style={catIconStyle(event.category)} />
                        <span className="text-[10px] font-medium capitalize" style={catIconStyle(event.category)}>{event.category}</span>
                      </div>
                      <h4 className="font-display font-semibold text-xs leading-tight line-clamp-2 mb-1.5">{event.title}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <Star className="h-2.5 w-2.5 fill-yellow-500 text-yellow-500" />{event.star_count ?? 0}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Heart className="h-2.5 w-2.5 fill-red-400 text-red-400" />{event.like_count ?? 0}
                        </span>
                        <span className="text-[9px]">{event.city === "Kuala Lumpur" ? "KL" : event.city}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ✨ Karma Pulses */}
          {karmaPulses.length > 0 && (
            <div className="px-4 pb-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-display font-bold uppercase tracking-wider text-primary">Karma Pulses</span>
              </div>
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto no-scrollbar">
                {karmaPulses.map((pulse, i) => (
                  <motion.div
                    key={pulse.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30 text-xs"
                  >
                    <div
                      className="h-6 w-6 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${pulse.color}20`, color: pulse.color }}
                    >
                      {pulse.isAnonymous ? <EyeOff className="h-3 w-3" /> : <pulse.icon className="h-3 w-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`font-medium ${pulse.isAnonymous ? "italic text-muted-foreground" : ""}`}>
                        {pulse.displayName}
                      </span>
                      <span className="text-muted-foreground"> {pulse.action}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Zap className="h-3 w-3 text-primary" />
                      <span className="font-display font-bold text-primary">+{pulse.points}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">{pulse.timeAgo}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

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
                const cStyle = catStyle(event.category);
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-xl p-4 border-l-[3px]"
                    style={{ borderLeftColor: cStyle.color }}
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <CatIcon className="h-3.5 w-3.5" style={catIconStyle(event.category)} />
                        <Badge className="text-[10px] capitalize border" style={cStyle}>{event.category}</Badge>
                        <Badge variant="outline" className="text-[10px]">{event.city === "Kuala Lumpur" ? "KL" : event.city}</Badge>
                        {event.is_user_submitted ? (
                          <Badge className="text-[10px]" style={{ backgroundColor: "hsl(var(--cat-alien) / 0.15)", color: "hsl(var(--cat-alien))", borderColor: "hsl(var(--cat-alien) / 0.3)" }}>👽 Community Pick</Badge>
                        ) : event.verification_status === "admin_verified" ? (
                          <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30"><ShieldCheck className="h-2.5 w-2.5 mr-0.5" />Admin Verified</Badge>
                        ) : event.verification_status === "community_verified" ? (
                          <Badge className="text-[10px]" style={{ backgroundColor: "hsl(var(--cat-wellbeing) / 0.15)", color: "hsl(var(--cat-wellbeing))", borderColor: "hsl(var(--cat-wellbeing) / 0.3)" }}>
                            <Users className="h-2.5 w-2.5 mr-0.5" />Community Verified
                          </Badge>
                        ) : (
                          <>
                            <Badge variant="outline" className="text-[10px] text-muted-foreground border-muted">
                              <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />Auto-scraped
                              {(event.community_verify_count ?? 0) > 0 && (
                                <span className="ml-1 text-primary">({event.community_verify_count}/3)</span>
                              )}
                            </Badge>
                            {isSteward && (
                              <Button variant="ghost" size="sm" className="h-5 text-[10px] text-primary px-1" onClick={() => handleCommunityVerify(event.id)}>
                                <CheckCircle className="h-2.5 w-2.5 mr-0.5" />Verify +5✨
                              </Button>
                            )}
                          </>
                        )}
                        <Button variant="ghost" size="sm" className="h-5 text-[10px] text-destructive/70 px-1" onClick={() => handleFlag(event.id)}>
                          <Flag className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                      {event.source_url && (
                        <a href={event.source_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                    <h3 className="font-display font-semibold text-sm mb-0.5">{event.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{event.description}</p>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        {event.venue && <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{event.venue}</span>}
                        {event.event_date && <span className="flex items-center gap-0.5"><Calendar className="h-2.5 w-2.5" />{event.event_date}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleReaction(event.id, "star")}
                          className={`flex items-center gap-0.5 text-[10px] transition-all ${hasReaction(event.id, "star") ? "text-yellow-500 scale-110" : "text-muted-foreground hover:text-yellow-500"}`}
                        >
                          <Star className={`h-3.5 w-3.5 transition-all ${hasReaction(event.id, "star") ? "fill-yellow-500" : ""}`} />
                          {event.star_count ?? 0}
                        </button>
                        <button
                          onClick={() => toggleReaction(event.id, "like")}
                          className={`flex items-center gap-0.5 text-[10px] transition-all ${hasReaction(event.id, "like") ? "text-red-500 scale-110" : "text-muted-foreground hover:text-red-500"}`}
                        >
                          <Heart className={`h-3.5 w-3.5 transition-all ${hasReaction(event.id, "like") ? "fill-red-500" : ""}`} />
                          {event.like_count ?? 0}
                        </button>
                      </div>
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
