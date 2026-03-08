import { ReactNode } from "react";
import { useUserRank, type UserRank, RANK_LABELS } from "@/hooks/useUserRank";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Lock, Sparkles, Swords, Star, Crown, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Rank-specific icons & colors
const RANK_ICONS: Record<number, { icon: React.ElementType; gradient: string }> = {
  0: { icon: Star, gradient: "from-muted to-muted-foreground/30" },
  1: { icon: Shield, gradient: "from-primary/80 to-primary" },
  2: { icon: Swords, gradient: "from-primary to-accent" },
  3: { icon: Crown, gradient: "from-primary via-accent to-primary" },
};

interface RoleGateProps {
  minRank: UserRank;
  children: ReactNode;
  fallbackMessage?: string;
}

export function RankBadge({ rank }: { rank: number }) {
  const config = RANK_ICONS[rank] || RANK_ICONS[0];
  const Icon = config.icon;
  return (
    <motion.div
      className={`h-10 w-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center`}
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
    >
      <Icon className="h-5 w-5 text-primary-foreground" />
    </motion.div>
  );
}

export function RoleGate({ minRank, children, fallbackMessage }: RoleGateProps) {
  const { user, loading: authLoading } = useAuth();
  const { rank, loading: rankLoading } = useUserRank();
  const navigate = useNavigate();

  if (authLoading || rankLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <motion.div
          className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" }}
        >
          <Lock className="h-8 w-8 text-muted-foreground" />
        </motion.div>
        <h2 className="font-display text-xl font-bold">Sign In Required</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Join the Nomad community to access this feature.
        </p>
        <Button onClick={() => navigate("/auth")} className="gradient-gold text-primary-foreground min-h-[44px]">
          Sign In
        </Button>
      </div>
    );
  }

  if (rank < minRank) {
    const requiredLabel = RANK_LABELS[minRank];
    const currentLabel = RANK_LABELS[rank];
    const RequiredIcon = RANK_ICONS[minRank]?.icon || Shield;

    const unlockSteps: Record<number, string> = {
      1: "Complete the Vision Quest (200-word statement) and pass the Integrity Quiz to become a Steward.",
      2: "Lead 3 successful Expeditions and earn 500+ Stardust points to become a Captain.",
      3: "Admin access is granted by existing Admins.",
    };

    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <motion.div
          className="h-16 w-16 rounded-2xl gradient-gold-subtle border border-primary/20 flex items-center justify-center"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring" }}
        >
          <RequiredIcon className="h-8 w-8 text-primary" />
        </motion.div>
        <h2 className="font-display text-xl font-bold">
          {requiredLabel} Access Required
        </h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          {fallbackMessage || unlockSteps[minRank] || "You need a higher rank to access this feature."}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <RankBadge rank={rank} />
          <span>Current rank: <strong className="text-foreground">{currentLabel}</strong></span>
        </div>
        {minRank === 1 && (
          <Button onClick={() => navigate("/vision-quest")} className="gradient-gold text-primary-foreground min-h-[44px]">
            <Gem className="h-4 w-4 mr-2" />
            Start Vision Quest
          </Button>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
