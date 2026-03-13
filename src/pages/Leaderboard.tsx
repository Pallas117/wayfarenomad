import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Star, MapPin, EyeOff } from "lucide-react";
import { TrainIcon } from "@/components/animations/TravelIcons";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StardustParticles } from "@/components/animations/StardustParticles";
import { supabase } from "@/integrations/supabase/client";

interface LeaderEntry {
  rank: number;
  name: string;
  city: string;
  points: number;
  avatar: string;
  isAnonymous: boolean;
}

export default function Leaderboard() {
  const profileRef = useRef<HTMLDivElement>(null);
  const [stardustTrigger, setStardustTrigger] = useState(false);
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      const { data, error } = await supabase
        .from("public_profiles" as any)
        .select("display_name, current_city, stardust_points, avatar_url, leaderboard_anonymous")
        .order("stardust_points", { ascending: false })
        .limit(25);

      if (!error && data) {
        setLeaders(
          data.map((p: any, i: number) => {
            const isAnon = !!p.leaderboard_anonymous;
            const name = isAnon ? "Anonymous Nomad" : (p.display_name || "Traveler");
            const initials = isAnon
              ? "??"
              : name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
            return {
              rank: i + 1,
              name,
              city: isAnon ? "" : (p.current_city || ""),
              points: p.stardust_points || 0,
              avatar: initials,
              isAnonymous: isAnon,
            };
          })
        );
      }
      setLoading(false);
    };
    fetchLeaders();
  }, []);

  return (
    <div className="p-6 max-w-lg mx-auto pb-24">
      <motion.div
        className="flex items-center gap-3 mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <TrainIcon className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-display font-bold">Stellar Canopy</h1>
        <div ref={profileRef} className="ml-auto h-8 w-8 rounded-full bg-secondary/50 flex items-center justify-center">
          <Star className="h-4 w-4 text-primary" />
        </div>
      </motion.div>

      <Tabs defaultValue="europe" className="mb-6">
        <TabsList className="w-full bg-secondary/50">
          <TabsTrigger value="uk" className="flex-1 text-xs">UK</TabsTrigger>
          <TabsTrigger value="europe" className="flex-1 text-xs">Europe</TabsTrigger>
          <TabsTrigger value="asia" className="flex-1 text-xs">Asia</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-[72px] rounded-xl bg-secondary/30 animate-pulse" />
          ))}
        </div>
      ) : leaders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Trophy className="h-10 w-10 mx-auto mb-3 text-primary/40" />
          <p className="text-sm">No karma scores yet — be the first!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaders.map((user, i) => {
            const isTop = user.rank === 1;
            const isTopThree = user.rank <= 3;

            return (
              <motion.div
                key={user.rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 150 }}
                whileHover={{ scale: 1.01, x: 4 }}
                className={`glass-card rounded-xl p-4 flex items-center gap-4 ${isTop ? "glow-gold border border-primary/30" : ""}`}
                onClick={() => {
                  if (isTop) {
                    setStardustTrigger(true);
                    setTimeout(() => setStardustTrigger(false), 1500);
                  }
                }}
              >
                <motion.div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isTop ? "gradient-gold text-primary-foreground" :
                    isTopThree ? "bg-secondary text-foreground" :
                    "bg-muted text-muted-foreground"
                  }`}
                  animate={isTop ? { scale: [1, 1.05, 1] } : {}}
                  transition={isTop ? { duration: 2, repeat: Infinity } : {}}
                >
                  {user.rank}
                </motion.div>

                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-display font-semibold text-sm ${
                  user.isAnonymous
                    ? "bg-muted text-muted-foreground"
                    : isTop
                      ? "gradient-gold-subtle border border-primary/30 text-primary"
                      : "bg-secondary"
                }`}>
                  {user.isAnonymous ? <EyeOff className="h-4 w-4" /> : user.avatar}
                </div>

                <div className="flex-1">
                  <p className={`font-medium text-sm ${user.isAnonymous ? "italic text-muted-foreground" : ""}`}>
                    {user.name}
                  </p>
                  {user.city && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {user.city}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 text-primary">
                  <Star className="h-4 w-4" />
                  <span className="font-display font-bold text-sm">{user.points.toLocaleString()}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="mt-6">
        <div className="constellation-line mx-8" />
      </div>

      <StardustParticles
        active={stardustTrigger}
        targetRef={profileRef as React.RefObject<HTMLElement>}
        count={10}
      />
    </div>
  );
}
