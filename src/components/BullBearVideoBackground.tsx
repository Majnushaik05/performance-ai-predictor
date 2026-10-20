import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Eye } from 'lucide-react';

interface BullBearVideoBackgroundProps {
  className?: string;
  showControls?: boolean;
}

export const BullBearVideoBackground: React.FC<BullBearVideoBackgroundProps> = ({
  className = '',
  showControls = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'clean' | 'cinema'>('clean');
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle system for the clash impact
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      life: number;
      maxLife: number;
    }

    const particles: Particle[] = [];

    // Financial Candlesticks in background
    interface Candle {
      x: number;
      y: number;
      width: number;
      height: number;
      wickTop: number;
      wickBottom: number;
      isBullish: boolean;
      speed: number;
    }

    const candles: Candle[] = [];
    const candleCount = 28;
    for (let i = 0; i < candleCount; i++) {
      candles.push({
        x: (width / candleCount) * i + Math.random() * 20,
        y: height * 0.35 + Math.random() * (height * 0.3),
        width: 14 + Math.random() * 12,
        height: 20 + Math.random() * 60,
        wickTop: 10 + Math.random() * 25,
        wickBottom: 10 + Math.random() * 25,
        isBullish: Math.random() > 0.45,
        speed: 0.3 + Math.random() * 0.4,
      });
    }

    // Animation state for Bull and Bear dashing towards each other
    let time = 0;
    let shockwaveRadius = 0;
    let shockwaveAlpha = 0;
    let clashFlash = 0;

    const render = () => {
      if (!isPlaying) {
        animFrameId.current = requestAnimationFrame(render);
        return;
      }

      time += 0.022;
      ctx.clearRect(0, 0, width, height);

      // 1. Subtle Radial Gradient Glow Behind the Duel
      const centerGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.48,
        50,
        width * 0.5,
        height * 0.48,
        width * 0.6
      );
      centerGrad.addColorStop(0, 'rgba(16, 185, 129, 0.06)'); // Emerald
      centerGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.05)'); // Ruby
      centerGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = centerGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Animated Financial Grid & Candlesticks
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.4)';
      ctx.lineWidth = 1;
      const gridSize = 80;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw drifting translucent market candles
      candles.forEach((c) => {
        c.y += Math.sin(time + c.x * 0.01) * 0.3;
        const color = c.isBullish ? 'rgba(16, 185, 129, 0.16)' : 'rgba(239, 68, 68, 0.14)';
        const wickColor = c.isBullish ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.22)';

        // Wick
        ctx.strokeStyle = wickColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(c.x + c.width / 2, c.y - c.wickTop);
        ctx.lineTo(c.x + c.width / 2, c.y + c.height + c.wickBottom);
        ctx.stroke();

        // Body
        ctx.fillStyle = color;
        ctx.fillRect(c.x, c.y, c.width, c.height);
      });

      // 3. BULL & BEAR DASHING CYCLE
      // Cycle: 0 to 2*PI
      // We map the dashing motion:
      // - Phase 0 to 0.4: Retreat & charge up
      // - Phase 0.4 to 0.7: High-velocity DASH towards center
      // - Phase 0.7: IMPACT / DASH CLASH!
      // - Phase 0.7 to 1.0: Recoil from impact
      const cycle = (time % 5.5) / 5.5; // 0 to 1 loop

      const centerY = height * 0.48;
      const centerX = width * 0.5;
      const maxDistance = Math.min(width * 0.36, 420);

      let bullOffset = 0;
      let bearOffset = 0;

      if (cycle < 0.35) {
        // Charging back
        const t = cycle / 0.35;
        const retreat = Math.sin(t * Math.PI * 0.5);
        bullOffset = -maxDistance * (0.8 + retreat * 0.2);
        bearOffset = maxDistance * (0.8 + retreat * 0.2);
      } else if (cycle < 0.68) {
        // High Speed Dash Collision Rush!
        const t = (cycle - 0.35) / 0.33;
        const easeIn = Math.pow(t, 2.5); // Accelerate
        bullOffset = -maxDistance * (1 - easeIn * 0.92);
        bearOffset = maxDistance * (1 - easeIn * 0.92);
      } else if (cycle < 0.78) {
        // The Clash Moment!
        bullOffset = -maxDistance * 0.08 + Math.sin(time * 30) * 6;
        bearOffset = maxDistance * 0.08 - Math.sin(time * 30) * 6;

        if (clashFlash <= 0.1) {
          clashFlash = 1.0;
          shockwaveRadius = 10;
          shockwaveAlpha = 0.9;

          // Spawn burst particles
          for (let p = 0; p < 45; p++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 8;
            particles.push({
              x: centerX,
              y: centerY,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 1.5,
              size: 2 + Math.random() * 4,
              color: Math.random() > 0.5 ? '#10b981' : Math.random() > 0.5 ? '#ef4444' : '#f59e0b',
              alpha: 1,
              life: 0,
              maxLife: 35 + Math.random() * 25,
            });
          }
        }
      } else {
        // Recoil
        const t = (cycle - 0.78) / 0.22;
        bullOffset = -maxDistance * (0.08 + t * 0.72);
        bearOffset = maxDistance * (0.08 + t * 0.72);
        clashFlash = Math.max(0, clashFlash - 0.05);
      }

      // Update shockwave
      if (shockwaveAlpha > 0.01) {
        shockwaveRadius += 6;
        shockwaveAlpha *= 0.94;

        ctx.strokeStyle = `rgba(245, 158, 11, ${shockwaveAlpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, shockwaveRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(16, 185, 129, ${shockwaveAlpha * 0.7})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, shockwaveRadius * 0.75, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 4. DRAW BULL (EMERALD FORCE - DASHING FROM LEFT)
      const bullX = centerX + bullOffset;
      const bullY = centerY + Math.sin(time * 8) * 4;

      ctx.save();
      ctx.translate(bullX, bullY);

      // Bull Speed Lines / Energy Trail
      const speedAlpha = cycle >= 0.4 && cycle < 0.7 ? 0.4 : 0.15;
      for (let s = 1; s <= 4; s++) {
        ctx.strokeStyle = `rgba(16, 185, 129, ${speedAlpha / s})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-160 - s * 30, -20 + s * 12);
        ctx.lineTo(-40 - s * 15, -20 + s * 12);
        ctx.stroke();
      }

      // Bull Silhouette & Glowing Horns
      const bullGrad = ctx.createLinearGradient(-120, -50, 40, 40);
      bullGrad.addColorStop(0, 'rgba(16, 185, 129, 0.45)');
      bullGrad.addColorStop(1, 'rgba(5, 150, 105, 0.85)');

      ctx.fillStyle = bullGrad;
      ctx.beginPath();
      // Muscular charging bull silhouette
      ctx.moveTo(-120, 20); // Back leg
      ctx.lineTo(-100, -20); // Back
      ctx.quadraticCurveTo(-60, -50, -20, -40); // Muscular Hump
      ctx.lineTo(10, -35); // Neck
      ctx.lineTo(30, -55); // Horn base
      ctx.quadraticCurveTo(55, -70, 75, -55); // Sharp Charging Horn Tip
      ctx.lineTo(40, -35); // Head
      ctx.lineTo(45, -10); // Snout
      ctx.lineTo(25, 5); // Jaw
      ctx.lineTo(15, 25); // Front charging leg
      ctx.lineTo(-10, 10); // Belly
      ctx.lineTo(-45, 15); // Flank
      ctx.lineTo(-80, 28); // Rear stance
      ctx.closePath();
      ctx.fill();

      // Glowing Emerald Horns Energy Spike
      ctx.fillStyle = '#34d399';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(25, -40);
      ctx.quadraticCurveTo(58, -75, 82, -58);
      ctx.quadraticCurveTo(52, -50, 32, -32);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0; // Reset

      // Bull Eye Glow
      ctx.fillStyle = '#6ee7b7';
      ctx.beginPath();
      ctx.arc(20, -28, 3, 0, Math.PI * 2);
      ctx.fill();

      // Bull Label
      ctx.font = 'bold 12px "Inter", sans-serif';
      ctx.fillStyle = 'rgba(5, 150, 105, 0.7)';
      ctx.fillText('BULLISH MOMENTUM', -110, -60);

      ctx.restore();

      // 5. DRAW BEAR (CRIMSON FORCE - DASHING FROM RIGHT)
      const bearX = centerX + bearOffset;
      const bearY = centerY - Math.sin(time * 8) * 4;

      ctx.save();
      ctx.translate(bearX, bearY);

      // Bear Speed Lines / Slash Trail
      for (let s = 1; s <= 4; s++) {
        ctx.strokeStyle = `rgba(239, 68, 68, ${speedAlpha / s})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(160 + s * 30, -20 + s * 12);
        ctx.lineTo(40 + s * 15, -20 + s * 12);
        ctx.stroke();
      }

      // Bear Silhouette & Raised Heavy Claws
      const bearGrad = ctx.createLinearGradient(120, -50, -40, 40);
      bearGrad.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
      bearGrad.addColorStop(1, 'rgba(220, 38, 38, 0.85)');

      ctx.fillStyle = bearGrad;
      ctx.beginPath();
      // Massive rearing charging bear silhouette
      ctx.moveTo(120, 25); // Back hind leg
      ctx.lineTo(95, -15); // Back
      ctx.quadraticCurveTo(60, -45, 20, -40); // Massive Bear Back Shoulder
      ctx.lineTo(-10, -50); // Heavy neck
      ctx.lineTo(-30, -55); // Snout base
      ctx.lineTo(-45, -40); // Teeth & Maw
      ctx.lineTo(-25, -20); // Chest
      ctx.lineTo(-65, -35); // Raised Slashing Front Claw Paw 1
      ctx.lineTo(-75, -20); // Razor Claws
      ctx.lineTo(-35, 5); // Arm
      ctx.lineTo(-45, 25); // Heavy front foot
      ctx.lineTo(20, 15); // Belly
      ctx.lineTo(75, 25); // Stance
      ctx.closePath();
      ctx.fill();

      // Glowing Crimson Slash Claws
      ctx.fillStyle = '#f87171';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      // 3 Razor Sharp Claws
      ctx.moveTo(-60, -38);
      ctx.lineTo(-82, -26);
      ctx.lineTo(-68, -20);
      ctx.lineTo(-84, -14);
      ctx.lineTo(-62, -10);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0; // Reset

      // Bear Eye Glow
      ctx.fillStyle = '#fca5a5';
      ctx.beginPath();
      ctx.arc(-22, -38, 3, 0, Math.PI * 2);
      ctx.fill();

      // Bear Label
      ctx.font = 'bold 12px "Inter", sans-serif';
      ctx.fillStyle = 'rgba(220, 38, 38, 0.7)';
      ctx.fillText('BEARISH PRESSURE', 20, -60);

      ctx.restore();

      // 6. Impact Center Flare when Clashing
      if (clashFlash > 0.05) {
        ctx.save();
        const flashGrad = ctx.createRadialGradient(
          centerX,
          centerY,
          2,
          centerX,
          centerY,
          70 * clashFlash
        );
        flashGrad.addColorStop(0, `rgba(255, 255, 255, ${clashFlash * 0.95})`);
        flashGrad.addColorStop(0.3, `rgba(245, 158, 11, ${clashFlash * 0.8})`);
        flashGrad.addColorStop(0.7, `rgba(16, 185, 129, ${clashFlash * 0.5})`);
        flashGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = flashGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 80 * clashFlash, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 7. Update & Draw Sparks Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // Gravity
        p.life++;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
        }
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isPlaying]);

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-all duration-500 ${className}`}
      aria-hidden="true"
    >
      {/* 1. Underlying Dynamic HTML5 60fps Video & Canvas Simulation */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover opacity-85"
      />

      {/* 2. Glassmorphism Screen Overlay based on View Mode */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          viewMode === 'clean'
            ? 'bg-white/80 backdrop-blur-[2px]'
            : 'bg-slate-950/40 backdrop-blur-none'
        }`}
      />

      {/* 3. Floating Video Playing Indicator & Controls */}
      {showControls && (
        <div className="absolute bottom-4 right-4 z-20 pointer-events-auto flex items-center gap-2 bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-md rounded-full px-3 py-1.5 text-[11px] font-bold text-slate-700">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span className="hidden sm:inline">
              Bull vs Bear Arena Video: {isPlaying ? 'Playing' : 'Paused'}
            </span>
          </div>

          <div className="h-3 w-px bg-slate-200 mx-0.5" />

          {/* Pause / Play button */}
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
            title={isPlaying ? 'Pause Video Background' : 'Resume Video Background'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          {/* Clean / Cinema mode toggle */}
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'clean' ? 'cinema' : 'clean')}
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              viewMode === 'cinema'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title="Toggle Cinematic Background Opacity"
          >
            <Eye className="w-3 h-3" />
            <span>{viewMode === 'cinema' ? 'Cinematic' : 'Clean UI'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
