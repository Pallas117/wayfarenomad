import { useEffect, useRef, useState } from "react";

interface PerfStats {
  fps: number;
  memory: number | null; // MB
  pinCount: number;
}

export function PerfOverlay({ pinCount }: { pinCount: number }) {
  const [stats, setStats] = useState<PerfStats>({ fps: 0, memory: null, pinCount: 0 });
  const frameRef = useRef(0);
  const lastRef = useRef(performance.now());
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (import.meta.env.PROD) return;

    let mounted = true;
    const tick = () => {
      if (!mounted) return;
      frameRef.current++;
      const now = performance.now();
      if (now - lastRef.current >= 1000) {
        const fps = Math.round((frameRef.current * 1000) / (now - lastRef.current));
        const mem = (performance as any).memory
          ? Math.round((performance as any).memory.usedJSHeapSize / 1048576)
          : null;
        setStats({ fps, memory: mem, pinCount });
        frameRef.current = 0;
        lastRef.current = now;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { mounted = false; cancelAnimationFrame(rafRef.current); };
  }, [pinCount]);

  if (import.meta.env.PROD) return null;

  const fpsColor = stats.fps >= 50 ? "hsl(145,60%,50%)" : stats.fps >= 30 ? "hsl(43,72%,52%)" : "hsl(0,84%,60%)";

  return (
    <div
      style={{
        position: "fixed",
        bottom: 72,
        right: 12,
        zIndex: 9999,
        background: "hsl(225 50% 10% / 0.9)",
        backdropFilter: "blur(8px)",
        border: "1px solid hsl(225 25% 18% / 0.6)",
        borderRadius: 8,
        padding: "6px 10px",
        fontFamily: "'IBM Plex Sans', monospace",
        fontSize: 11,
        lineHeight: 1.6,
        color: "hsl(40 10% 96%)",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <div style={{ color: fpsColor, fontWeight: 600 }}>
        {stats.fps} FPS
      </div>
      <div style={{ opacity: 0.7 }}>
        📍 {stats.pinCount} pins
      </div>
      {stats.memory !== null && (
        <div style={{ opacity: 0.7 }}>
          🧠 {stats.memory} MB
        </div>
      )}
    </div>
  );
}
