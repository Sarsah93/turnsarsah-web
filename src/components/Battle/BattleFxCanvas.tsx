import React, { useEffect, useRef } from 'react';

type Particle = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
};

type BurstPreset = {
  count: number;
  speed: number;
  spread: number;
  size: [number, number];
  life: [number, number];
};

const PRESETS: Record<string, BurstPreset> = {
  light: { count: 40, speed: 1.4, spread: 1.2, size: [0.06, 0.12], life: [0.35, 0.55] },
  medium: { count: 70, speed: 1.8, spread: 1.4, size: [0.06, 0.16], life: [0.45, 0.7] },
  strong: { count: 110, speed: 2.3, spread: 1.6, size: [0.08, 0.2], life: [0.55, 0.85] },
  critical: { count: 160, speed: 2.8, spread: 1.9, size: [0.1, 0.24], life: [0.7, 1.05] },
};

const FX_COLORS = ['#ffd76a', '#ffb13b', '#ff7a3a', '#fff4d2'];

export const BattleFxCanvas: React.FC<{ fxClass?: string }> = ({ fxClass = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const lastFxRef = useRef<string>('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement as Element);

    const cam = {
      x: 0,
      y: 2.2,
      z: -6,
      pitch: 0.35,
      fov: 600,
      depthScale: 40,
    };

    const project = (p: { x: number; y: number; z: number }, w: number, h: number) => {
      const x = p.x - cam.x;
      const y = p.y - cam.y;
      const z = p.z - cam.z;
      const cos = Math.cos(cam.pitch);
      const sin = Math.sin(cam.pitch);
      const y1 = y * cos - z * sin;
      const z1 = y * sin + z * cos;
      if (z1 <= 0.2) return null;
      const scale = cam.fov / (cam.fov + z1 * cam.depthScale);
      const base = Math.min(w, h) * 0.32;
      return {
        x: x * scale * base + w / 2,
        y: y1 * scale * base + h * 0.62,
        scale,
      };
    };

    const drawGrid = (time: number, w: number, h: number) => {
      const depth = 42;
      const spacing = 2.2;
      const maxX = 10;
      const zShift = (time * 0.002) % spacing;

      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;

      for (let z = 4; z <= depth; z += spacing) {
        const zPos = z - zShift;
        const p1 = project({ x: -maxX, y: 0, z: zPos }, w, h);
        const p2 = project({ x: maxX, y: 0, z: zPos }, w, h);
        if (!p1 || !p2) continue;
        ctx.globalAlpha = Math.min(0.25, 0.05 + (1 - zPos / depth) * 0.2);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      for (let x = -maxX; x <= maxX; x += 1.6) {
        const p1 = project({ x, y: 0, z: 4 }, w, h);
        const p2 = project({ x, y: 0, z: depth }, w, h);
        if (!p1 || !p2) continue;
        ctx.globalAlpha = 0.08;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawParticles = (dt: number, w: number, h: number) => {
      const gravity = -0.6;
      const drag = 0.98;
      const alive: Particle[] = [];

      for (const p of particlesRef.current) {
        p.life -= dt;
        if (p.life <= 0) continue;
        p.vx *= drag;
        p.vy = p.vy * drag + gravity * dt;
        p.vz *= drag;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.z += p.vz * dt;
        alive.push(p);

        const proj = project(p, w, h);
        if (!proj) continue;
        const alpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        const size = p.size * (proj.scale * 130);
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      particlesRef.current = alive;
    };

    const loop = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = Math.min(0.033, (time - lastTimeRef.current) / 1000);
      lastTimeRef.current = time;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      drawGrid(time, w, h);
      drawParticles(dt, w, h);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!fxClass || fxClass === lastFxRef.current) return;
    lastFxRef.current = fxClass;

    const level =
      fxClass.includes('critical')
        ? 'critical'
        : fxClass.includes('strong')
          ? 'strong'
          : fxClass.includes('medium')
            ? 'medium'
            : 'light';
    const kind = fxClass.startsWith('player-hit') ? 'player' : 'boss';
    if (['light', 'medium', 'strong', 'critical'].includes(level)) {
      spawnFx(kind as 'boss' | 'player', level as keyof typeof PRESETS);
    }
  }, [fxClass]);

  const spawnFx = (kind: 'boss' | 'player', level: keyof typeof PRESETS) => {
    const preset = PRESETS[level];
    const center =
      kind === 'boss'
        ? { x: 0, y: 1.4, z: 22 }
        : { x: -2.4, y: 0.8, z: 10 };

    for (let i = 0; i < preset.count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() * 0.6 + 0.2) * Math.PI;
      const speed = preset.speed * (0.5 + Math.random());
      const vx = Math.cos(theta) * Math.sin(phi) * speed * preset.spread;
      const vy = Math.cos(phi) * speed * 0.65;
      const vz = Math.sin(theta) * Math.sin(phi) * speed * preset.spread;
      const size = preset.size[0] + Math.random() * (preset.size[1] - preset.size[0]);
      const life = preset.life[0] + Math.random() * (preset.life[1] - preset.life[0]);
      particlesRef.current.push({
        x: center.x + (Math.random() - 0.5) * 0.6,
        y: center.y + (Math.random() - 0.5) * 0.3,
        z: center.z + (Math.random() - 0.5) * 0.8,
        vx,
        vy,
        vz,
        life,
        maxLife: life,
        size,
        color: FX_COLORS[i % FX_COLORS.length],
      });
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="battle-fx-canvas"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 40,
      }}
    />
  );
};

export default BattleFxCanvas;
