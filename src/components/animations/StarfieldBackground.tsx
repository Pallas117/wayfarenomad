import { useEffect, useRef } from "react";
import { usePower } from "@/components/PowerProvider";

interface StarfieldBackgroundProps {
  intensity?: number; // 0–1, controls star count
}

export function StarfieldBackground({ intensity = 0 }: StarfieldBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<{ x: number; y: number; r: number; speed: number; opacity: number }[]>([]);
  const power = usePower();

  useEffect(() => {
    // Don't render canvas effects in saver/critical mode
    if (!power.allowCanvasEffects) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Reduce star count based on power mode
    const baseCount = Math.floor(80 + intensity * 200);
    const count = Math.floor(baseCount * power.particleMultiplier);
    starsRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.3,
      speed: Math.random() * 0.3 + 0.05,
      opacity: Math.random() * 0.6 + 0.2,
    }));

    let raf: number;
    let lastFrame = 0;
    // In balanced mode, cap at ~30fps instead of 60
    const frameInterval = power.mode === "balanced" ? 33 : 0;

    const draw = (timestamp: number) => {
      if (frameInterval && timestamp - lastFrame < frameInterval) {
        raf = requestAnimationFrame(draw);
        return;
      }
      lastFrame = timestamp;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const goldH = 43, goldS = 72, goldL = 52;
      const time = Date.now() * 0.001;

      starsRef.current.forEach((star) => {
        const twinkle = Math.sin(time * star.speed * 4 + star.x) * 0.3 + 0.7;
        const alpha = star.opacity * twinkle * Math.min(intensity * 2, 1);
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${goldH}, ${goldS}%, ${goldL}%, ${alpha})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [intensity, power.allowCanvasEffects, power.particleMultiplier, power.mode]);

  if (!power.allowCanvasEffects) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000"
      style={{ opacity: Math.min(intensity * 1.5, 1) }}
    />
  );
}
