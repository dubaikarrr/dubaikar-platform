"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const COLORS = ["#FF6B35", "#1A1D3E", "#00B4A6", "#F5A623", "#9B5DE5"];

interface Confetto {
  x: number; y: number; vx: number; vy: number; size: number; color: string; rot: number; vr: number;
}

export function CelebrateScreen({ name }: { name: string }) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [autoAdvance, setAutoAdvance] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const fit = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    window.addEventListener("resize", fit);

    const pieces: Confetto[] = [];
    for (let i = 0; i < 180; i++) {
      pieces.push({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 14,
        vy: Math.random() * -16 - 4,
        size: 4 + Math.random() * 8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.3,
      });
    }
    let raf = 0;
    let stopAt = Date.now() + 3500;
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pieces) {
        p.vy += 0.35;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
      if (Date.now() < stopAt) raf = requestAnimationFrame(loop);
    };
    loop();

    const t = setTimeout(() => {
      if (autoAdvance) router.push("/app/profile/complete");
    }, 3500);

    return () => {
      window.removeEventListener("resize", fit);
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [router, autoAdvance]);

  return (
    <>
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" aria-hidden />
      <div className="relative z-10 text-center">
        <div className="text-6xl">🎉</div>
        <h1 className="mt-6 text-3xl font-medium text-text sm:text-4xl">
          Welcome to Dubaikar, {name}!
        </h1>
        <p className="mt-3 text-sm text-text-muted">
          Your Dubai roadmap is ready. One last quick step to unlock everything.
        </p>
        <div className="mt-8">
          <Button
            onClick={() => {
              setAutoAdvance(false);
              router.push("/app/profile/complete");
            }}
          >
            Continue
          </Button>
        </div>
      </div>
    </>
  );
}
