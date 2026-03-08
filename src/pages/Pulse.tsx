import { useState } from "react";
import { Radio, MapPin, Calendar, ExternalLink, Music, Code, PartyPopper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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

  const filtered = activeCategory === "all"
    ? mockEvents
    : mockEvents.filter((e) => e.category === activeCategory);

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Radio className="h-6 w-6 text-primary animate-pulse-glow" />
        <h1 className="text-2xl font-display font-bold">Community Pulse</h1>
      </div>

      {/* Map placeholder */}
      <div className="glass-card rounded-xl h-48 mb-6 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-background/50" />
        <div className="relative text-center">
          <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Google Maps integration coming soon</p>
          <p className="text-xs text-muted-foreground mt-1">Lisbon, Portugal</p>
        </div>
        {/* Pulse pins preview */}
        <div className="absolute top-8 left-12 h-3 w-3 rounded-full bg-primary animate-pulse-glow" />
        <div className="absolute top-16 right-20 h-3 w-3 rounded-full bg-primary animate-pulse-glow" style={{ animationDelay: "0.5s" }} />
        <div className="absolute bottom-12 left-1/3 h-3 w-3 rounded-full bg-primary animate-pulse-glow" style={{ animationDelay: "1s" }} />
      </div>

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
      <div className="space-y-4">
        {filtered.map((event, i) => {
          const CatIcon = categoryIcon[event.category] || Radio;
          return (
            <div
              key={event.id}
              className="glass-card rounded-xl p-5 animate-slide-up"
              style={{ animationDelay: `${i * 80}ms` }}
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
