import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Heart, Handshake, MapPin, Calendar, Sparkles, MessageCircle, Send, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoleGate } from "@/components/RoleGate";
import { useUserRank } from "@/hooks/useUserRank";
import { useItineraryMatches, type ItineraryMatch } from "@/hooks/useItineraryMatches";
import { PathConvergence } from "@/components/animations/PathConvergence";
import { MeetSync } from "@/components/MeetSync";
import { GoldCardSkeleton } from "@/components/animations/GoldSkeleton";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";

type SocialMode = "friendship" | "dating";

// Fallback mock data when user has no itineraries
const mockUsers = [
  {
    userId: "mock-1", displayName: "Maya Chen", avatar: "MC", city: "Lisbon",
    bio: "Full-stack dev & surf enthusiast",
    teaches: ["React", "TypeScript"], learns: ["Surfing", "Portuguese"],
    arrivalDate: "2026-03-01", departureDate: "2026-04-15",
    overlapDays: 12, visionScore: 87, stardustPoints: 340,
  },
  {
    userId: "mock-2", displayName: "Jake Morrison", avatar: "JM", city: "Lisbon",
    bio: "Digital marketer exploring Europe",
    teaches: ["SEO", "Content Strategy"], learns: ["Coding", "Photography"],
    arrivalDate: "2026-02-20", departureDate: "2026-03-30",
    overlapDays: 22, visionScore: 74, stardustPoints: 180,
  },
  {
    userId: "mock-3", displayName: "Aisha Patel", avatar: "AP", city: "Lisbon",
    bio: "UX designer & yoga teacher",
    teaches: ["Yoga", "Figma"], learns: ["Guitar", "Spanish"],
    arrivalDate: "2026-03-05", departureDate: "2026-05-01",
    overlapDays: 30, visionScore: 92, stardustPoints: 520,
  },
];

function SocialContent() {
  const [mode, setMode] = useState<SocialMode>("friendship");
  const { isSteward } = useUserRank();
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [meetSyncUser, setMeetSyncUser] = useState<ItineraryMatch | null>(null);
  const { data: realMatches, isLoading } = useItineraryMatches();
  const navigate = useNavigate();

  const matches: ItineraryMatch[] = (realMatches && realMatches.length > 0)
    ? realMatches
    : mockUsers;

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
              haptic("tap");
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

      {/* No itinerary hint */}
      {realMatches && realMatches.length === 0 && (
        <motion.div
          className="glass-card rounded-xl p-4 mb-4 border-l-4 border-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">No itinerary yet.</strong> Add your travel dates in your profile to find real matches. Showing sample profiles below.
          </p>
        </motion.div>
      )}

      {/* Loading skeletons */}
      {isLoading ? (
        <div className="space-y-4">
          <GoldCardSkeleton />
          <GoldCardSkeleton />
          <GoldCardSkeleton />
        </div>
      ) : (
        /* User Cards */
        <div className="space-y-4">
          <AnimatePresence>
            {matches.map((user, i) => (
              <motion.div
                key={user.userId}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.12, type: "spring", stiffness: 150, damping: 18 }}
                whileHover={{ y: -2 }}
                className="glass-card rounded-xl p-5"
              >
                <div className="flex items-start gap-4">
                  <motion.div
                    className="h-14 w-14 rounded-full gradient-gold flex items-center justify-center text-primary-foreground font-display font-bold text-lg shrink-0 cursor-pointer"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      navigate(`/profile/${user.userId}`);
                      haptic("tap");
                    }}
                  >
                    {user.avatar}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3
                        className="font-display font-semibold text-lg cursor-pointer hover:text-primary transition-colors"
                        onClick={() => {
                          navigate(`/profile/${user.userId}`);
                          haptic("tap");
                        }}
                      >{user.displayName}</h3>
                      <div className="flex items-center gap-1 text-primary">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-sm font-bold">{user.visionScore}%</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{user.bio || "Fellow traveler"}</p>
                    <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {user.city}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {user.overlapDays}d overlap</span>
                      <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" /> {user.stardustPoints} ✦</span>
                    </div>
                    {mode === "friendship" ? (
                      <div className="space-y-2">
                        {user.teaches.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            <span className="text-xs text-muted-foreground mr-1">Teaches:</span>
                            {user.teaches.map((s) => (
                              <Badge key={s} variant="secondary" className="text-xs bg-secondary/50">{s}</Badge>
                            ))}
                          </div>
                        )}
                        {user.learns.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            <span className="text-xs text-muted-foreground mr-1">Learns:</span>
                            {user.learns.map((s) => (
                              <Badge key={s} variant="outline" className="text-xs border-primary/30 text-primary">{s}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {user.arrivalDate} → {user.departureDate}
                      </div>
                    )}
                  </div>
                </div>

                {/* Path Convergence */}
                <AnimatePresence>
                  {expandedMatch === user.userId && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-4"
                    >
                      <PathConvergence
                        userA="You"
                        userB={user.displayName}
                        city={user.city}
                        overlapDays={user.overlapDays}
                        sharedTags={user.teaches.slice(0, 2)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Meet-Sync panel */}
                <AnimatePresence>
                  {meetSyncUser?.userId === user.userId && (
                    <motion.div className="mt-4">
                      <MeetSync
                        recipientId={user.userId}
                        recipientName={user.displayName}
                        city={user.city}
                        onClose={() => setMeetSyncUser(null)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    className="flex-1 gradient-gold text-primary-foreground hover:opacity-90 min-h-[44px]"
                    onClick={() => {
                      setExpandedMatch(expandedMatch === user.userId ? null : user.userId);
                      haptic("tap");
                    }}
                  >
                    {expandedMatch === user.userId ? "Hide Path" : "Connect"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="min-h-[44px]"
                    onClick={() => {
                      setMeetSyncUser(meetSyncUser?.userId === user.userId ? null : user);
                      haptic("tap");
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Meet
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="min-h-[44px]"
                    onClick={() => {
                      navigate(`/messages?to=${user.userId}&name=${encodeURIComponent(user.displayName)}`);
                      haptic("tap");
                    }}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Chat
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
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
