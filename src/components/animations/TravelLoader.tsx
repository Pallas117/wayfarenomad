import { motion } from "framer-motion";

/**
 * Travel-themed loading animation featuring a sailing boat on waves,
 * a plane flying overhead, a train chugging below, and weather elements.
 */
export function TravelLoader({ message = "Charting the course…" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      {/* Scene container */}
      <div className="relative w-64 h-40 overflow-hidden">
        {/* Drifting clouds */}
        <Cloud x={10} y={4} delay={0} size={1} />
        <Cloud x={55} y={8} delay={3} size={0.7} />
        <Cloud x={-10} y={14} delay={6} size={0.5} />

        {/* Sun with rotating rays */}
        <motion.div
          className="absolute right-4 top-2"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-primary">
            <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity={0.3} stroke="currentColor" strokeWidth="1.5" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <motion.line
                key={angle}
                x1="12"
                y1="1"
                x2="12"
                y2="4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                transform={`rotate(${angle} 12 12)`}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: angle / 360 }}
              />
            ))}
          </svg>
        </motion.div>

        {/* Rain drops (subtle, right side) */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={`rain-${i}`}
            className="absolute w-0.5 bg-primary/20 rounded-full"
            style={{ left: `${70 + i * 8}%`, top: 0, height: 6 }}
            animate={{ y: [0, 160], opacity: [0.4, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3, ease: "easeIn" }}
          />
        ))}

        {/* Plane flying across the sky */}
        <motion.div
          className="absolute top-6"
          animate={{ x: [-30, 280] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
        >
          <motion.svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="text-foreground/60"
            animate={{ y: [0, -3, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <path
              d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
          {/* Contrail */}
          <motion.div
            className="absolute top-3 -left-16 h-px w-16 bg-gradient-to-l from-foreground/20 to-transparent"
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>

        {/* Ocean waves */}
        <div className="absolute bottom-8 left-0 right-0">
          <motion.svg
            viewBox="0 0 400 24"
            className="w-full h-6 text-primary/25"
            animate={{ x: [0, -50, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <path
              d="M0 12 Q25 4 50 12 T100 12 T150 12 T200 12 T250 12 T300 12 T350 12 T400 12 T450 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M0 18 Q25 10 50 18 T100 18 T150 18 T200 18 T250 18 T300 18 T350 18 T400 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.5"
            />
          </motion.svg>
        </div>

        {/* Sailboat bobbing on waves */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{
            y: [0, -4, 0, -2, 0],
            rotate: [0, 4, -3, 2, 0],
            x: [0, 6, 0, -4, 0],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-primary">
            <path d="M2 20 L6 16 H18 L22 20 Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity={0.1} />
            <line x1="12" y1="16" x2="12" y2="4" stroke="currentColor" strokeWidth="1.5" />
            <motion.path
              d="M12 4 L19 14 H12 Z"
              fill="currentColor"
              fillOpacity={0.2}
              stroke="currentColor"
              strokeWidth="1"
              animate={{ d: ["M12 4 L19 14 H12 Z", "M12 4 L18 13 H12 Z", "M12 4 L19 14 H12 Z"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <path d="M12 6 L7 14 H12 Z" fill="currentColor" fillOpacity={0.15} stroke="currentColor" strokeWidth="1" />
            {/* Flag at top */}
            <motion.path
              d="M12 4 L15 3 L12 2"
              stroke="currentColor"
              strokeWidth="1"
              fill="currentColor"
              fillOpacity={0.3}
              animate={{ d: ["M12 4 L15 3 L12 2", "M12 4 L14.5 2.8 L12 2", "M12 4 L15 3 L12 2"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
        </motion.div>

        {/* Train track at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-6">
          {/* Track lines */}
          <div className="absolute bottom-1 left-0 right-0 h-px bg-foreground/10" />
          <div className="absolute bottom-3 left-0 right-0 h-px bg-foreground/10" />
          {/* Track sleepers */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute bottom-0.5 w-1 h-3 bg-foreground/10 rounded-sm"
              style={{ left: `${i * 5.5}%` }}
              animate={{ x: [-10, 10] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          ))}
          {/* Train */}
          <motion.div
            className="absolute bottom-0"
            animate={{ x: [-40, 280] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <svg width="32" height="20" viewBox="0 0 24 20" fill="none" className="text-foreground/40">
              <rect x="2" y="2" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M2 9h16" stroke="currentColor" strokeWidth="1" opacity="0.5" />
              <path d="M10 2v7" stroke="currentColor" strokeWidth="1" opacity="0.5" />
              <circle cx="6" cy="17" r="1.5" fill="currentColor" />
              <circle cx="14" cy="17" r="1.5" fill="currentColor" />
              {/* Smokestack */}
              <rect x="4" y="0" width="3" height="3" rx="0.5" fill="currentColor" fillOpacity={0.3} />
              {/* Steam puffs */}
              <motion.circle
                cx="5.5"
                cy="-2"
                r="1.5"
                fill="currentColor"
                fillOpacity={0.2}
                animate={{ cy: [-2, -8], r: [1.5, 3], opacity: [0.3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </svg>
          </motion.div>
        </div>
      </div>

      {/* Loading text */}
      <motion.p
        className="text-sm text-muted-foreground font-display"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {message}
      </motion.p>

      {/* Progress dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-primary"
            animate={{ scale: [0.5, 1.2, 0.5], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}

/** Reusable drifting cloud */
function Cloud({ x, y, delay, size }: { x: number; y: number; delay: number; size: number }) {
  return (
    <motion.svg
      viewBox="0 0 64 28"
      fill="none"
      className="absolute text-foreground/5"
      style={{ left: `${x}%`, top: y, width: 48 * size, height: 24 * size }}
      animate={{ x: [0, 30, 0], opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <path
        d="M48 22H10a7 7 0 01-.5-14A9 9 0 0128 5a11 11 0 0118 10 5 5 0 012 22z"
        fill="currentColor"
      />
    </motion.svg>
  );
}

/** Compact inline travel loader for smaller spaces */
export function TravelLoaderInline({ message }: { message?: string }) {
  return (
    <div className="flex items-center gap-3 py-4 justify-center">
      <motion.div
        animate={{ y: [0, -3, 0], rotate: [0, 5, -3, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-primary">
          <path d="M2 20 L6 16 H18 L22 20 Z" stroke="currentColor" strokeWidth="1.8" />
          <line x1="12" y1="16" x2="12" y2="4" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 4 L19 14 H12 Z" fill="currentColor" fillOpacity={0.2} stroke="currentColor" strokeWidth="1" />
        </svg>
      </motion.div>
      <motion.span
        className="text-sm text-muted-foreground"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {message || "Loading…"}
      </motion.span>
    </div>
  );
}
