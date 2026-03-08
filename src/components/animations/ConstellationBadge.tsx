import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";

interface ConstellationBadgeProps {
  seed: string;
  size?: number;
  className?: string;
  animate?: boolean;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function ConstellationBadge({ seed, size = 80, className = "", animate = true }: ConstellationBadgeProps) {
  const [show, setShow] = useState(!animate);

  useEffect(() => {
    if (animate) {
      const t = setTimeout(() => setShow(true), 100);
      return () => clearTimeout(t);
    }
  }, [animate]);

  const { stars, lines } = useMemo(() => {
    const h = hashCode(seed);
    const count = 5 + (h % 4);
    const pad = size * 0.15;
    const range = size - pad * 2;

    const stars = Array.from({ length: count }, (_, i) => {
      const angle = ((h * (i + 1) * 137) % 360) * (Math.PI / 180);
      const dist = pad + ((h * (i + 7) * 53) % 100) / 100 * range;
      return {
        x: size / 2 + Math.cos(angle) * dist * 0.4,
        y: size / 2 + Math.sin(angle) * dist * 0.4,
        r: 1.5 + ((h * (i + 3)) % 3),
      };
    });

    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i < stars.length - 1; i++) {
      if ((h * (i + 11)) % 3 !== 0) {
        lines.push({ x1: stars[i].x, y1: stars[i].y, x2: stars[i + 1].x, y2: stars[i + 1].y });
      }
    }
    // Close loop occasionally
    if ((h % 2) === 0 && stars.length > 2) {
      lines.push({ x1: stars[stars.length - 1].x, y1: stars[stars.length - 1].y, x2: stars[0].x, y2: stars[0].y });
    }

    return { stars, lines };
  }, [seed, size]);

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      initial={animate ? { scale: 0, rotate: -180, opacity: 0 } : {}}
      animate={show ? { scale: 1, rotate: 0, opacity: 1 } : {}}
      transition={{ type: "spring", stiffness: 100, damping: 12, duration: 1.2 }}
    >
      {/* Lines */}
      {lines.map((l, i) => (
        <motion.line
          key={`l${i}`}
          x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke="hsl(43 72% 52% / 0.4)"
          strokeWidth={1}
          initial={animate ? { pathLength: 0, opacity: 0 } : {}}
          animate={show ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ delay: 0.5 + i * 0.15, duration: 0.6 }}
        />
      ))}
      {/* Stars */}
      {stars.map((s, i) => (
        <motion.circle
          key={`s${i}`}
          cx={s.x} cy={s.y} r={s.r}
          fill="hsl(43 72% 52%)"
          initial={animate ? { scale: 0, opacity: 0 } : {}}
          animate={show ? { scale: 1, opacity: 1 } : {}}
          transition={{ delay: 0.3 + i * 0.1, type: "spring", stiffness: 200 }}
        />
      ))}
      {/* Glow filter */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </motion.svg>
  );
}
