import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Heart, Handshake, MapPin, Calendar, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoleGate } from "@/components/RoleGate";
import { useUserRank } from "@/hooks/useUserRank";
import { PathConvergence } from "@/components/animations/PathConvergence";
import { cn } from "@/lib/utils";

type SocialMode = "friendship" | "dating";

const mockUsers = [
  {
    id: "1", name: "Maya Chen", avatar: "MC", city: "Lisbon",
    bio: "Full-stack dev & surf enthusiast",
    teaches: ["React", "TypeScript"], learns: ["Surfing", "Portuguese"],
    travelDates: "Mar 1 – Apr 15", overlap: 12, score: 87,
  },
  {
    id: "2", name: "Jake Morrison", avatar: "JM", city: "Lisbon",
    bio: "Digital marketer exploring Europe",
    teaches: ["SEO", "Content Strategy"], learns: ["Coding", "Photography"],
    travelDates: "Feb 20 – Mar 30", overlap: 22, score: 74,
  },
  {
    id: "3", name: "Aisha Patel", avatar: "AP", city: "Lisbon",
    bio: "UX designer & yoga teacher",
    teaches: ["Yoga", "Figma"], learns: ["Guitar", "Spanish"],
    travelDates: "Mar 5 – May 1", overlap: 30, score: 92,
  },
];

function SocialContent() {
  const [mode, setMode] = useState<SocialMode>("friendship");
  const { isSteward } = useUserRank();
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);

  return (
    <div className="p-6 max-w-lg mx-auto pb-24">
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-display font-bold">Discover</h1>
        </div>
      </motion.div>

      {/* Mode Toggle */}
      <motion.div
        className="glass-card rounded-xl p-4 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Handshake className={cn("h-5 w-5 transition-colors", mode === "friendship" ? "text-primary" : "text-muted-foreground")} />
            <span className={cn("text-sm font-medium transition-colors", mode === "friendship" ? "text-foreground" : "text-muted-foreground")}>
              Skill-Swap
            </span>
          </div>
          <Switch
            checked={mode === "dating"}
            onCheckedChange={(checked) => {
              if (checked && !isSteward) return;
              setMode(checked ? "dating" : "friendship");
            }}
            disabled={!isSteward && mode === "friendship"}
          />
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-medium transition-colors", mode === "dating" ? "text-foreground" : "text-muted-foreground")}>
              {!isSteward ? "🔒 " : ""}Itinerary
            </span>
            <Heart className={cn("h-5 w-5 transition-colors", mode === "dating" ? "text-primary" : "text-muted-foreground")} />
          </div>
        </div>
        {!isSteward && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Pass the Integrity Quiz to unlock Dating mode
          </p>
        )}
      </motion.div>

      {/* User Cards with spring physics */}
      <div className="space-y-4">
        <AnimatePresence>
          {mockUsers.map((user, i) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.12, type: "spring", stiffness: 150, damping: 18 }}
              whileHover={{ y: -2 }}
              className="glass-card rounded-xl p-5"
            >
              <div className="flex items-start gap-4">
                <motion.div
                  className="h-14 w-14 rounded-full gradient-gold flex items-center justify-center text-primary-foreground font-display font-bold text-lg shrink-0"
                  whileTap={{ scale: 0.9 }}
                >
                  {user.avatar}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-display font-semibold text-lg">{user.name}</h3>
                    <div className="flex items-center gap-1 text-primary">
                      <Sparkles className="h-4 w-4" />
                      <span className="text-sm font-bold">{user.score}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{user.bio}</p>
                  <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {user.city}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {user.overlap}d overlap</span>
                  </div>
                  {mode === "friendship" ? (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-xs text-muted-foreground mr-1">Teaches:</span>
                        {user.teaches.map((s) => (
                          <Badge key={s} variant="secondary" className="text-xs bg-secondary/50">{s}</Badge>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-xs text-muted-foreground mr-1">Learns:</span>
                        {user.learns.map((s) => (
                          <Badge key={s} variant="outline" className="text-xs border-primary/30 text-primary">{s}</Badge>
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

              {/* Path Convergence on connect */}
              <AnimatePresence>
                {expandedMatch === user.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-4"
                  >
                    <PathConvergence
                      userA="You"
                      userB={user.name}
                      city={user.city}
                      overlapDays={user.overlap}
                      sharedTags={user.teaches.slice(0, 2)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  className="flex-1 gradient-gold text-primary-foreground hover:opacity-90 min-h-[44px]"
                  onClick={() => setExpandedMatch(expandedMatch === user.id ? null : user.id)}
                >
                  {expandedMatch === user.id ? "Hide Path" : "Connect"}
                </Button>
                <Button size="sm" variant="outline" className="flex-1 min-h-[44px]">
                  View Profile
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Social() {
  return (
    <RoleGate minRank={1}>
      <SocialContent />
    </RoleGate>
  );
}
