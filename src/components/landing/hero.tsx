'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

const RINGS = [
  { color: [130, 100, 255], radius: 120, speed: 0.2, subtle: true },
  { color: [0, 0, 0], radius: 180, speed: 0, subtle: true },
  { color: [80, 200, 170], radius: 240, speed: -0.12, subtle: true },
  { color: [0, 0, 0], radius: 300, speed: 0, subtle: true },
  { color: [255, 140, 80], radius: 360, speed: 0.09 },
  { color: [0, 0, 0], radius: 420, speed: 0 },
  { color: [160, 120, 220], radius: 480, speed: -0.07 },
  { color: [0, 0, 0], radius: 540, speed: 0 },
  { color: [100, 180, 255], radius: 600, speed: 0.06 },
  { color: [0, 0, 0], radius: 660, speed: 0 },
  { color: [200, 100, 150], radius: 720, speed: -0.05 },
  { color: [0, 0, 0], radius: 780, speed: 0 },
];

const ICONS = [
  { angle: -0.3, emoji: '📅', ring: 5 },
  { angle: 2.5, emoji: '👥', ring: 5 },
  { angle: 0.8, emoji: '🎨', ring: 6 },
  { angle: 3.9, emoji: '📊', ring: 6 },
  { angle: -1.0, emoji: '🌐', ring: 7 },
  { angle: 2.0, emoji: '🔗', ring: 7 },
  { angle: 0.4, emoji: '⏱️', ring: 8 },
  { angle: 3.3, emoji: '📋', ring: 8 },
  { angle: Math.PI, emoji: '🎯', ring: 5 },
  { angle: Math.PI * 0.5, emoji: '✨', ring: 7 },
  { angle: 0.15, emoji: '🎤', ring: 6 },
  { angle: -0.3, emoji: '🗓️', ring: 9 },
  { angle: Math.PI - 0.3, emoji: '🎙️', ring: 9 },
];

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseTarget = useRef({ x: 0.5, y: 0.5 });
  const mouseSmooth = useRef({ x: 0.5, y: 0.5 });
  const animRef = useRef<number>(0);
  const startTime = useRef(0);
  const cometOffsets = useRef<number[]>([]);

  useEffect(() => {
    if (cometOffsets.current.length === 0) {
      cometOffsets.current = RINGS.map(() => Math.random() * Math.PI * 2);
    }
    function draw(now: number) {
      if (!startTime.current) {
        startTime.current = now;
      }
      const elapsed = (now - startTime.current) / 1000;

      const canvas = canvasRef.current;
      if (!canvas) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      mouseSmooth.current.x += (mouseTarget.current.x - mouseSmooth.current.x) * 0.03;
      mouseSmooth.current.y += (mouseTarget.current.y - mouseSmooth.current.y) * 0.03;

      const cx = w / 2;
      const cy = h / 2;
      const mx = (mouseSmooth.current.x - 0.5) * 6;
      const my = (mouseSmooth.current.y - 0.5) * 6;

      const isDark = document.documentElement.classList.contains('dark');
      const ringBase = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
      const dotBg = isDark ? 'rgba(30,30,35,0.95)' : 'rgba(255,255,255,0.95)';
      const dotBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
      const shadowColor = isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.06)';

      const subtleRing = isDark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.015)';

      // Draw static rings with animated comet streaks
      RINGS.forEach((ring) => {
        // Static ring
        ctx.beginPath();
        ctx.arc(cx, cy, ring.radius, 0, Math.PI * 2);
        ctx.strokeStyle = ring.subtle ? subtleRing : ringBase;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Comet streak (only for rings with speed)
        if (ring.speed !== 0) {
          const ringIdx = RINGS.indexOf(ring);
          const cometAngle = cometOffsets.current[ringIdx] + elapsed * ring.speed;
          const arcLength = Math.PI * 0.2;
          const [r, g, b] = ring.color;
          const baseOpacity = isDark ? 0.4 : 0.25;
          const opacity = ring.subtle ? baseOpacity * 0.2 : baseOpacity;

          const tailDir = ring.speed > 0 ? -1 : 1;
          for (let i = 0; i < 20; i++) {
            const t = i / 20;
            const a1 = cometAngle + tailDir * arcLength * t;
            const a2 = cometAngle + tailDir * arcLength * (t + 1 / 20);
            const alpha = opacity * (1 - t);

            ctx.beginPath();
            ctx.arc(cx, cy, ring.radius, Math.min(a1, a2), Math.max(a1, a2));
            ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
            ctx.lineWidth = 2;
            ctx.stroke();
          }

          const headX = cx + Math.cos(cometAngle) * ring.radius;
          const headY = cy + Math.sin(cometAngle) * ring.radius;
          ctx.beginPath();
          ctx.arc(headX, headY, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${opacity + 0.2})`;
          ctx.fill();
        }
      });

      // Draw static icons positioned on rings (shift gently with mouse)
      ICONS.forEach((icon, i) => {
        const ring = RINGS[icon.ring];
        const depth = 0.5 + icon.ring * 0.3;
        const x = cx + Math.cos(icon.angle) * ring.radius + mx * depth;
        const y = cy + Math.sin(icon.angle) * ring.radius + my * depth;
        const radius = 24;

        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = 16;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = dotBg;
        ctx.fill();
        ctx.strokeStyle = dotBorder;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon.emoji, x, y + 1);
      });

      // Top and bottom vignette
      const bgColor = isDark ? '10,10,15' : '255,255,255';
      const vignetteHeight = h * 0.25;

      const topGrad = ctx.createLinearGradient(0, 0, 0, vignetteHeight);
      topGrad.addColorStop(0, `rgba(${bgColor},1)`);
      topGrad.addColorStop(1, `rgba(${bgColor},0)`);
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, w, vignetteHeight);

      const bottomGrad = ctx.createLinearGradient(0, h - vignetteHeight, 0, h);
      bottomGrad.addColorStop(0, `rgba(${bgColor},0)`);
      bottomGrad.addColorStop(1, `rgba(${bgColor},1)`);
      ctx.fillStyle = bottomGrad;
      ctx.fillRect(0, h - vignetteHeight, w, vignetteHeight);

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      const rect = canvas.getBoundingClientRect();
      mouseTarget.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    }

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative flex h-[80vh] max-h-[800px] min-h-[600px] flex-col items-center justify-center overflow-hidden px-6 py-24">
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          Event schedules,
          <br />
          <span className="text-primary">built visually.</span>
        </h1>
        <p className="text-muted-foreground mx-auto mt-6 max-w-xl text-lg">
          Slate is the schedule management tool for event organizers. Plan your conference,
          workshop, or summit with a drag-and-drop calendar editor — then share it with attendees in
          one click.
        </p>
        <div className="mt-10">
          <Link
            href="/signup"
            className="animate-gradient-shift inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 bg-[length:200%_100%] px-8 text-base font-medium text-white opacity-75 shadow-lg transition-all duration-700 ease-in-out hover:opacity-100 hover:shadow-xl"
          >
            Get Started →
          </Link>
        </div>
      </div>
    </section>
  );
}
