import { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Radio, MapPin, Calendar, ExternalLink, Music, Code, PartyPopper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CulturalEar } from "@/components/CulturalEar";

const categories = [
  { id: "all", label: "All", icon: Radio },
  { id: "music", label: "Music", icon: Music },
  { id: "tech", label: "Tech", icon: Code },
  { id: "festival", label: "Festival", icon: PartyPopper },
];

const mockEvents = [
  {
    id: "1",
    title: "Web Summit 2026",
    category: "tech",
    venue: "FIL, Lisbon",
    date: "Mar 15–17",
    description: "Europe's largest tech conference with 70,000+ attendees.",
    source: "https://websummit.com",
  },
  {
    id: "2",
    title: "NOS Alive Festival",
    category: "music",
    venue: "Algés, Lisbon",
    date: "Mar 22",
    description: "Indie rock and electronic music festival by the river.",
    source: "https://nosalive.com",
  },
  {
    id: "3",
    title: "Lisbon Street Art Festival",
    category: "festival",
    venue: "LX Factory",
    date: "Mar 10–12",
    description: "Urban art, live murals, and workshops in the creative district.",
    source: "#",
  },
  {
    id: "4",
    title: "React Lisbon Meetup",
    category: "tech",
    venue: "Startup Lisboa",
    date: "Mar 20",
    description: "Monthly React/TypeScript community meetup with lightning talks.",
    source: "#",
  },
];

const categoryIcon: Record<string, React.ElementType> = {
  tech: Code,
  music: Music,
  festival: PartyPopper,
};

export default function Pulse() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [focusedEvent, setFocusedEvent] = useState<string | null>(null);

  const filtered = activeCategory === "all"
    ? mockEvents
    : mockEvents.filter((e) => e.category === activeCategory);

  return (
    <div className="p-6 max-w-lg mx-auto pb-24">
      <motion.div
        className="flex items-center gap-3 mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Radio className="h-6 w-6 text-primary animate-pulse-glow" />
        <h1 className="text-2xl font-display font-bold">Community Pulse</h1>
      </motion.div>

      {/* Map with satellite zoom feel */}
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
            <p className="text-sm text-muted-foreground">Lisbon, Portugal</p>
          </div>
        </div>

        {/* Twinkling pins that bloom on tap */}
        <LayoutGroup>
          {mockEvents.map((event, i) => {
            const positions = [
              { top: "20%", left: "15%" },
              { top: "35%", right: "20%" },
              { bottom: "25%", left: "33%" },
              { top: "50%", right: "30%" },
            ];
            const pos = positions[i % positions.length];
            const isFocused = focusedEvent === event.id;

            return (
              <motion.div
                key={event.id}
                className="absolute"
                style={pos}
                layoutId={`pin-${event.id}`}
              >
                <motion.button
                  className="relative"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFocusedEvent(isFocused ? null : event.id);
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.div
                    className="h-3 w-3 rounded-full bg-primary"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.5,
                    }}
                  />
                  {/* Bloom tooltip */}
                  <AnimatePresence>
                    {isFocused && (
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0, y: 5 }}
                        animate={{ scale: 1, opacity: 1, y: -8 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 glass-card rounded-lg px-3 py-1.5 whitespace-nowrap z-10 border border-primary/20"
                      >
                        <p className="text-xs font-medium">{event.title}</p>
                        <p className="text-[10px] text-muted-foreground">{event.date}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>
            );
          })}
        </LayoutGroup>

        {/* Constellation lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <motion.line
            x1="60" y1="35" x2="200" y2="67"
            stroke="hsl(43 72% 52% / 0.15)" strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          />
          <motion.line
            x1="200" y1="67" x2="140" y2="140"
            stroke="hsl(43 72% 52% / 0.15)" strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 1 }}
          />
        </svg>

        {/* Focus mode dim overlay */}
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

      {/* Event Cards with layout animation */}
      <LayoutGroup>
        <div className="space-y-4">
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
                    <div className="flex items-center gap-2">
                      <CatIcon className="h-4 w-4 text-primary" />
                      <Badge variant="secondary" className="text-xs capitalize">
                        {event.category}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a href={event.source} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>

                  <h3 className="font-display font-semibold text-lg mb-1">{event.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{event.description}</p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {event.venue}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {event.date}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </div>
  );
}
