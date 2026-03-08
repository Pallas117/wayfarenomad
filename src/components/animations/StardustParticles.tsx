import { useEffect, useRef } from "react";
import { usePower } from "@/components/PowerProvider";

interface StardustParticlesProps {
  targetRef?: React.RefObject<HTMLElement>;
  active?: boolean;
  count?: number;
  originRef?: React.RefObject<HTMLElement>;
}

interface Particle {
  x: number; y: number; tx: number; ty: number;
  progress: number; speed: number; size: number;
  offsetX: number; offsetY: number;
}

export function StardustParticles({ targetRef, active = false, count = 12, originRef }: StardustParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const power = usePower();

  const shouldRender = active && power.allowParticles;

  useEffect(() => {
    if (!shouldRender) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const targetRect = targetRef?.current?.getBoundingClientRect();
    const originRect = originRef?.current?.getBoundingClientRect();
    const tx = targetRect ? targetRect.left + targetRect.width / 2 : canvas.width / 2;
    const ty = targetRect ? targetRect.top + targetRect.height / 2 : 40;
    const ox = originRect ? originRect.left + originRect.width / 2 : canvas.width / 2;
    const oy = originRect ? originRect.top + originRect.height / 2 : canvas.height / 2;

    const adjustedCount = Math.floor(count * power.particleMultiplier);
    particlesRef.current = Array.from({ length: adjustedCount }, () => ({
      x: ox + (Math.random() - 0.5) * 60,
      y: oy + (Math.random() - 0.5) * 60,
      tx, ty,
      progress: 0,
      speed: 0.008 + Math.random() * 0.012,
      size: 2 + Math.random() * 3,
      offsetX: (Math.random() - 0.5) * 80,
      offsetY: (Math.random() - 0.5) * 80,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particlesRef.current.forEach((p) => {
        if (p.progress >= 1) return;
        alive = true;
        p.progress = Math.min(p.progress + p.speed, 1);
        const t = p.progress;
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

        const cx = (p.x + p.tx) / 2 + p.offsetX;
        const cy = (p.y + p.ty) / 2 + p.offsetY;
        const bx = (1 - ease) * (1 - ease) * p.x + 2 * (1 - ease) * ease * cx + ease * ease * p.tx;
        const by = (1 - ease) * (1 - ease) * p.y + 2 * (1 - ease) * ease * cy + ease * ease * p.ty;

        const alpha = t < 0.8 ? 1 : 1 - (t - 0.8) / 0.2;
        ctx.beginPath();
        ctx.arc(bx, by, p.size * (1 - t * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(43, 72%, 52%, ${alpha})`;
        ctx.shadowColor = `hsla(43, 80%, 60%, ${alpha * 0.6})`;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      if (alive) raf = requestAnimationFrame(draw);
    };
    draw();

    return () => cancelAnimationFrame(raf);
  }, [shouldRender, count, targetRef, originRef, power.particleMultiplier]);

  if (!shouldRender) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
}
