import { useState } from "react";
import { Users, Heart, Handshake, MapPin, Calendar, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SocialMode = "friendship" | "dating";

const mockUsers = [
  {
    id: "1",
    name: "Maya Chen",
    avatar: "MC",
    city: "Lisbon",
    bio: "Full-stack dev & surf enthusiast",
    teaches: ["React", "TypeScript"],
    learns: ["Surfing", "Portuguese"],
    travelDates: "Mar 1 – Apr 15",
    overlap: 12,
    score: 87,
  },
  {
    id: "2",
    name: "Jake Morrison",
    avatar: "JM",
    city: "Lisbon",
    bio: "Digital marketer exploring Europe",
    teaches: ["SEO", "Content Strategy"],
    learns: ["Coding", "Photography"],
    travelDates: "Feb 20 – Mar 30",
    overlap: 22,
    score: 74,
  },
  {
    id: "3",
    name: "Aisha Patel",
    avatar: "AP",
    city: "Lisbon",
    bio: "UX designer & yoga teacher",
    teaches: ["Yoga", "Figma"],
    learns: ["Guitar", "Spanish"],
    travelDates: "Mar 5 – May 1",
    overlap: 30,
    score: 92,
  },
];

export default function Social() {
  const [mode, setMode] = useState<SocialMode>("friendship");

  return (
    <div className="p-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-display font-bold">Discover</h1>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="glass-card rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Handshake className={cn("h-5 w-5 transition-colors", mode === "friendship" ? "text-primary" : "text-muted-foreground")} />
            <span className={cn("text-sm font-medium transition-colors", mode === "friendship" ? "text-foreground" : "text-muted-foreground")}>
              Skill-Swap
            </span>
          </div>
          <Switch
            checked={mode === "dating"}
            onCheckedChange={(checked) => setMode(checked ? "dating" : "friendship")}
          />
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-medium transition-colors", mode === "dating" ? "text-foreground" : "text-muted-foreground")}>
              Itinerary
            </span>
            <Heart className={cn("h-5 w-5 transition-colors", mode === "dating" ? "text-primary" : "text-muted-foreground")} />
          </div>
        </div>
      </div>

      {/* User Cards */}
      <div className="space-y-4">
        {mockUsers.map((user, i) => (
          <div
            key={user.id}
            className="glass-card rounded-xl p-5 animate-slide-up"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="h-14 w-14 rounded-full gradient-coral flex items-center justify-center text-primary-foreground font-display font-bold text-lg shrink-0">
                {user.avatar}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-display font-semibold text-lg">{user.name}</h3>
                  <div className="flex items-center gap-1 text-primary">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm font-bold">{user.score}%</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3">{user.bio}</p>

                {/* Location & overlap */}
                <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {user.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {user.overlap}d overlap
                  </span>
                </div>

                {/* Skills */}
                {mode === "friendship" ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-xs text-muted-foreground mr-1">Teaches:</span>
                      {user.teaches.map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs bg-secondary/50">
                          {s}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-xs text-muted-foreground mr-1">Learns:</span>
                      {user.learns.map((s) => (
                        <Badge key={s} variant="outline" className="text-xs border-primary/30 text-primary">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    {user.travelDates}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <Button size="sm" className="flex-1 gradient-coral text-primary-foreground hover:opacity-90">
                Connect
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                View Profile
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
