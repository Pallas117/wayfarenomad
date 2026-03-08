import { motion } from "framer-motion";

/** Animated sailboat that bobs gently */
export function SailboatIcon({ className = "h-6 w-6", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      animate={{ y: [0, -2, 0], rotate: [0, 3, -2, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Hull */}
      <path d="M2 20 L6 16 H18 L22 20 Z" />
      {/* Mast */}
      <line x1="12" y1="16" x2="12" y2="4" />
      {/* Sail */}
      <path d="M12 4 L19 14 H12 Z" fill={color} fillOpacity={0.15} />
      <path d="M12 6 L7 14 H12 Z" fill={color} fillOpacity={0.1} />
    </motion.svg>
  );
}

/** Animated plane that tilts subtly */
export function PlaneIcon({ className = "h-6 w-6", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      animate={{ x: [0, 2, 0], y: [0, -1, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
    </motion.svg>
  );
}

/** Animated train that chugs along */
export function TrainIcon({ className = "h-6 w-6", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      animate={{ x: [0, 1, -1, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <rect x="4" y="3" width="16" height="16" rx="2" />
      <path d="M4 11h16" />
      <path d="M12 3v8" />
      <circle cx="8" cy="21" r="1" fill={color} />
      <circle cx="16" cy="21" r="1" fill={color} />
      <path d="m8 19-2 3" />
      <path d="m16 19 2 3" />
      <path d="M9 7h0" />
      <path d="M15 7h0" />
    </motion.svg>
  );
}

/** Animated sun/weather icon with rays */
export function WeatherSunIcon({ className = "h-6 w-6", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
    >
      <circle cx="12" cy="12" r="4" fill={color} fillOpacity={0.15} />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </motion.svg>
  );
}

/** Small cloud that drifts */
export function DriftingCloud({ className = "" }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 64 32"
      fill="none"
      className={`${className} text-foreground/5`}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: [0, 40, 0], opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
    >
      <path
        d="M48 24H12a8 8 0 01-1.2-15.9A10 10 0 0130.3 5 12 12 0 0150 16h0a6 6 0 01-2 24z"
        fill="currentColor"
      />
    </motion.svg>
  );
}

/** Compass rose that slowly rotates */
export function CompassRose({ className = "h-6 w-6", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      animate={{ rotate: [0, 10, -10, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill={color} fillOpacity={0.2} />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
    </motion.svg>
  );
}

/** Wave animation for bottom borders or section dividers */
export function WavesDivider({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`overflow-hidden h-4 ${className}`}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 4, repeat: Infinity }}
    >
      <motion.svg
        viewBox="0 0 400 20"
        className="w-full h-full text-primary/20"
        animate={{ x: [0, -100, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M0 10 Q25 0 50 10 T100 10 T150 10 T200 10 T250 10 T300 10 T350 10 T400 10 T450 10 T500 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </motion.svg>
    </motion.div>
  );
}

/** Floating travel badges that drift around a page header */
export function FloatingTravelBadges() {
  const icons = ["✈️", "⛵", "🚂", "🌤️", "🧭", "🗺️"];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {icons.map((emoji, i) => (
        <motion.span
          key={i}
          className="absolute text-lg opacity-10"
          style={{
            left: `${15 + i * 14}%`,
            top: `${10 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -8, 0],
            x: [0, (i % 2 === 0 ? 5 : -5), 0],
            opacity: [0.06, 0.12, 0.06],
          }}
          transition={{
            duration: 5 + i * 0.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
        >
          {emoji}
        </motion.span>
      ))}
    </div>
  );
}
