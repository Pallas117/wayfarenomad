import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface PathConvergenceProps {
  userA: string;
  userB: string;
  city: string;
  overlapDays: number;
  sharedTags: string[];
}

export function PathConvergence({ userA, userB, city, overlapDays, sharedTags }: PathConvergenceProps) {
  return (
    <div className="glass-card rounded-xl p-5 overflow-hidden relative">
      <svg viewBox="0 0 300 100" className="w-full h-24 mb-4">
        {/* Path A */}
        <motion.path
          d="M 10 80 Q 80 80, 150 50"
          fill="none"
          stroke="hsl(43 72% 52%)"
          strokeWidth={2}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
        {/* Path B */}
        <motion.path
          d="M 10 20 Q 80 20, 150 50"
          fill="none"
          stroke="hsl(43 80% 60%)"
          strokeWidth={2}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut", delay: 0.3 }}
        />
        {/* Continue after intersection */}
        <motion.path
          d="M 150 50 Q 220 50, 290 30"
          fill="none"
          stroke="hsl(43 72% 52% / 0.4)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        />
        <motion.path
          d="M 150 50 Q 220 50, 290 70"
          fill="none"
          stroke="hsl(43 80% 60% / 0.4)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        />
        {/* Intersection pulse */}
        <motion.circle
          cx={150} cy={50} r={4}
          fill="hsl(43 72% 52%)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.2, type: "spring" }}
        />
        {[12, 20, 28].map((r, i) => (
          <motion.circle
            key={i}
            cx={150} cy={50} r={r}
            fill="none"
            stroke="hsl(43 72% 52% / 0.2)"
            strokeWidth={1}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: [0, 0.5, 0] }}
            transition={{ delay: 1.4 + i * 0.2, duration: 1, repeat: Infinity, repeatDelay: 2 }}
          />
        ))}
        {/* Labels */}
        <text x={12} y={75} fill="hsl(43 72% 52%)" fontSize={9} fontFamily="Space Grotesk">{userA}</text>
        <text x={12} y={18} fill="hsl(43 80% 60%)" fontSize={9} fontFamily="Space Grotesk">{userB}</text>
        <motion.text
          x={150} y={42} textAnchor="middle"
          fill="hsl(40 10% 96%)" fontSize={8} fontFamily="Space Grotesk"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {city}
        </motion.text>
      </svg>

      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8 }}
      >
        <p className="text-sm text-muted-foreground">
          <span className="text-primary font-semibold">{overlapDays}</span> days overlap
        </p>
        <div className="flex gap-1.5">
          {sharedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
