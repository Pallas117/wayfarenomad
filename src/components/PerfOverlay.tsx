import { useEffect, useRef, useState } from "react";
import { Activity, X } from "lucide-react";

interface PerfStats {
  fps: number;
  memory: number | null;
  pinCount: number;
}

export function PerfOverlay({ pinCount }: { pinCount: number }) {
  const [stats, setStats] = useState<PerfStats>({ fps: 0, memory: null, pinCount: 0 });
  const [isVisible, setIsVisible] = useState(() => {
    const stored = localStorage.getItem("perf-overlay-visible");
    return stored === null ? true : stored === "true";
  });

  const toggleVisible = () => {
    setIsVisible((prev) => {
      localStorage.setItem("perf-overlay-visible", String(!prev));
      return !prev;
    });
  };
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
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 4,
        pointerEvents: "auto",
      }}
    >
      <button
        onClick={() => setIsVisible(!isVisible)}
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          background: "hsl(225 50% 10% / 0.9)",
          backdropFilter: "blur(8px)",
          border: "1px solid hsl(225 25% 18% / 0.6)",
          color: "hsl(40 10% 96%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
        title={isVisible ? "Hide performance stats" : "Show performance stats"}
      >
        {isVisible ? <X size={14} /> : <Activity size={14} />}
      </button>

      {isVisible && (
        <div
          style={{
            background: "hsl(225 50% 10% / 0.9)",
            backdropFilter: "blur(8px)",
            border: "1px solid hsl(225 25% 18% / 0.6)",
            borderRadius: 8,
            padding: "6px 10px",
            fontFamily: "'IBM Plex Sans', monospace",
            fontSize: 11,
            lineHeight: 1.6,
            color: "hsl(40 10% 96%)",
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
      )}
    </div>
  );
}
