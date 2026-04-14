import { useEffect, useRef, useCallback, useMemo, useState } from 'react';

/* ── Seeded PRNG ── */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ── Types ── */
interface Dot { x: number; y: number }
interface Particle { baseX: number; baseY: number; speed: number; amp: number; phase: number; size: number }
interface SceneData { paths: string; dots: Dot[]; particles: Particle[] }

/* ── Generate branching curves ── */
function generateScene(w: number, h: number): SceneData {
  const rng = seededRandom(42);
  const curves: { pathD: string; dots: Dot[] }[] = [];
  const allDots: Dot[] = [];
  const MIN_DOT_DIST = Math.min(w, h) * 0.18; // minimum distance between dots

  // Even grid placement — exactly one curve per cell, spread across viewport
  const cols = 5;
  const rows = 4;
  const cellW = w / cols;
  const cellH = h / rows;

  function tooClose(nx: number, ny: number): boolean {
    for (const d of allDots) {
      const dx = d.x - nx;
      const dy = d.y - ny;
      if (Math.sqrt(dx * dx + dy * dy) < MIN_DOT_DIST) return true;
    }
    return false;
  }

  // Shuffle cell order for natural look
  const cells: { col: number; row: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({ col: c, row: r });
    }
  }
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }

  for (const cell of cells) {
    const sx = cellW * cell.col + cellW * 0.15 + rng() * cellW * 0.7;
    const sy = cellH * cell.row + cellH * 0.15 + rng() * cellH * 0.7;

    // Skip if starting point is too close to existing dots
    if (tooClose(sx, sy)) continue;

    const cpx = sx + (rng() - 0.5) * cellW * 0.6;
    const cpy = sy + rng() * cellH * 0.5 + cellH * 0.15;
    const ex = sx + (rng() - 0.5) * cellW * 0.4;
    const ey = sy + rng() * cellH * 0.6 + cellH * 0.1;

    if (tooClose(ex, ey)) continue;

    let d = `M${sx.toFixed(0)} ${sy.toFixed(0)}C${cpx.toFixed(0)} ${cpy.toFixed(0)} ${cpx.toFixed(0)} ${(cpy + 8).toFixed(0)} ${ex.toFixed(0)} ${ey.toFixed(0)}`;
    const dots: Dot[] = [{ x: ex, y: ey }];

    // Sub-branch 1 from endpoint
    if (rng() > 0.4) {
      const bx = ex + (rng() - 0.3) * cellW * 0.5;
      const by = ey + rng() * cellH * 0.3 + cellH * 0.05;
      const bex = bx + (rng() - 0.3) * cellW * 0.4;
      const bey = by + rng() * cellH * 0.25 + cellH * 0.05;
      if (!tooClose(bex, bey)) {
        d += ` M${ex.toFixed(0)} ${ey.toFixed(0)}C${bx.toFixed(0)} ${by.toFixed(0)} ${(bx + 3).toFixed(0)} ${(by + 3).toFixed(0)} ${bex.toFixed(0)} ${bey.toFixed(0)}`;
        dots.push({ x: bex, y: bey });
      }
    }

    // Sub-branch 2 from control point
    if (rng() > 0.45) {
      const bx = cpx + (rng() - 0.7) * cellW * 0.5;
      const by = cpy + rng() * cellH * 0.3 + cellH * 0.05;
      const bex = bx + (rng() - 0.7) * cellW * 0.4;
      const bey = by + rng() * cellH * 0.25 + cellH * 0.05;
      if (!tooClose(bex, bey)) {
        d += ` M${cpx.toFixed(0)} ${cpy.toFixed(0)}C${bx.toFixed(0)} ${by.toFixed(0)} ${(bx - 3).toFixed(0)} ${(by + 3).toFixed(0)} ${bex.toFixed(0)} ${bey.toFixed(0)}`;
        dots.push({ x: bex, y: bey });
      }
    }

    curves.push({ pathD: d, dots });
    allDots.push(...dots);
  }

  let allPaths = '';
  for (const c of curves) {
    allPaths += c.pathD + ' ';
  }

  const ps: Particle[] = [];
  const n = Math.max(5, Math.floor((w * h) / 350000));
  for (let i = 0; i < n; i++) {
    ps.push({
      baseX: rng() * w,
      baseY: rng() * h,
      speed: 0.15 + rng() * 0.35,
      amp: 10 + rng() * 16,
      phase: rng() * Math.PI * 2,
      size: 1.2 + rng() * 1.5,
    });
  }

  return { paths: allPaths.trim(), dots: allDots, particles: ps };
}

/* ── Theme-aware colors ── */
function getThemeColors() {
  const dark = document.documentElement.classList.contains('dark');
  return {
    bg: dark ? '#1a1a1a' : '#f9f9f9',
    stroke: dark ? 'rgba(160,160,200,0.07)' : 'rgba(60,60,90,0.06)',
    dotFill: dark ? 'rgba(180,180,220,0.15)' : 'rgba(35,35,60,0.10)',
    particleFill: dark ? 'rgba(170,170,210,0.08)' : 'rgba(50,50,80,0.06)',
  };
}

/* ── COMPONENT ── */
export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const [, setTick] = useState(0);

  const scene = useMemo(() => {
    const data = generateScene(window.innerWidth, window.innerHeight);
    particlesRef.current = data.particles;
    return data;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const time = Date.now() * 0.001;
    const c = getThemeColors();

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = c.particleFill;

    for (const p of particlesRef.current) {
      const x = p.baseX + Math.sin(time * p.speed + p.phase) * p.amp;
      const y = p.baseY + Math.cos(time * p.speed * 0.7 + p.phase) * p.amp * 0.6;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    frameRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const data = generateScene(w, h);
      particlesRef.current = data.particles;
      // Update scene for SVG re-render via tick
      setTick((t) => t + 1);
    };

    resize();
    frameRef.current = requestAnimationFrame(animate);

    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        cancelAnimationFrame(frameRef.current);
        resize();
        frameRef.current = requestAnimationFrame(animate);
      }, 200);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(frameRef.current);
    };
  }, [animate]);

  // Theme change observer
  useEffect(() => {
    const obs = new MutationObserver(() => {
      const c = getThemeColors();
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.fillStyle = c.particleFill;
      }
      setTick((t) => t + 1);
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const c = getThemeColors();

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0, backgroundColor: c.bg }}
    >
      {/* SVG branching curves + dots */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <path
          d={scene.paths}
          fill="none"
          stroke={c.stroke}
          strokeWidth={1.2}
          strokeLinecap="round"
        />
        <g fill={c.dotFill}>
          {scene.dots.map((dot, i) => (
            <circle key={i} cx={dot.x} cy={dot.y} r={4} />
          ))}
        </g>
      </svg>

      {/* Animated floating particles */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />      
    </div>
  );
}
