import { useEffect, useRef, useCallback, useState } from 'react';

/* ── Seeded PRNG (unchanged — deterministic layout) ── */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ── Types ── */
interface BokehParticle {
  baseX: number; baseY: number;
  size: number; speed: number; phase: number;
  driftX: number; driftY: number;
  opacity: number; warm: boolean;
}

interface ApertureRing {
  cx: number; cy: number;
  radius: number; rotSpeed: number; phase: number; baseOpacity: number;
}

interface SceneData {
  bokeh: BokehParticle[];
  rings: ApertureRing[];
}

/* ── Generate photography-themed scene ── */
function generateScene(w: number, h: number): SceneData {
  const rng = seededRandom(42);
  const short = Math.min(w, h);

  // Bokeh circles — spread across viewport
  const count = Math.max(14, Math.floor((w * h) / 28000));
  const bokeh: BokehParticle[] = [];
  for (let i = 0; i < count; i++) {
    bokeh.push({
      baseX: rng() * w,
      baseY: rng() * h,
      size: 20 + rng() * 50,
      speed: 0.03 + rng() * 0.06,
      phase: rng() * Math.PI * 2,
      driftX: 12 + rng() * 22,
      driftY: 8 + rng() * 18,
      opacity: 0.03 + rng() * 0.055,
      warm: rng() > 0.38, // ~62% warm, ~38% cool
    });
  }

  // Aperture hexagon rings — positioned near corners/edges
  const rings: ApertureRing[] = [
    { cx: w * 0.10, cy: h * 0.16, radius: short * 0.11, rotSpeed:  0.018, phase: 0.0, baseOpacity: 0.030 },
    { cx: w * 0.89, cy: h * 0.74, radius: short * 0.16, rotSpeed: -0.012, phase: 1.8, baseOpacity: 0.025 },
    { cx: w * 0.54, cy: h * 0.89, radius: short * 0.07, rotSpeed:  0.025, phase: 3.2, baseOpacity: 0.035 },
    { cx: w * 0.80, cy: h * 0.12, radius: short * 0.09, rotSpeed: -0.020, phase: 0.9, baseOpacity: 0.028 },
  ];

  return { bokeh, rings };
}

/* ── Theme-aware colors — warm cream / deep charcoal palette ── */
function getThemeColors(dark: boolean) {
  return {
    bg:             dark ? '#0d0d0d'               : '#faf9f7',
    warmBokeh:      dark ? ([210, 185, 150] as const) : ([210, 190, 160] as const),
    coolBokeh:      dark ? ([140, 165, 215] as const) : ([170, 160, 190] as const),
    ringStroke:     dark ? ([200, 195, 215] as const) : ([140, 130, 120] as const),
    leakColor:      dark ? 'rgba(200,160,100,0.015)' : 'rgba(240,210,150,0.025)',
    vignetteStop:   dark ? 'rgba(0,0,0,0.50)'        : 'rgba(0,0,0,0.06)',
    bracketStroke:  dark ? '#ccc8dc'                 : '#a09585',
    bracketOpacity: dark ? 0.22                      : 0.10,
  };
}

/* ── Draw a single aperture hexagon on the canvas ── */
function drawHex(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  r: number, angle: number,
  rgb: readonly [number, number, number],
  alpha: number,
  lineW: number,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
  ctx.lineWidth = lineW;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = angle + (Math.PI / 3) * i;
    i === 0
      ? ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
      : ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

/* ── Corner viewfinder bracket config ── */
const CORNER_BRACKETS = [
  // Each entry: CSS position classes, vertical line [x1,y1,x2,y2], horizontal line, dot [cx,cy]
  { pos: 'top-4 left-4',     vl: [4, 4, 4, 18] as const, hl: [4,  4, 18,  4] as const, dot: [4,  4] as const },
  { pos: 'top-4 right-4',    vl: [20,4,20, 18] as const, hl: [20, 4,  6,  4] as const, dot: [20, 4] as const },
  { pos: 'bottom-4 left-4',  vl: [4,20, 4,  6] as const, hl: [4, 20, 18, 20] as const, dot: [4, 20] as const },
  { pos: 'bottom-4 right-4', vl: [20,20,20,  6] as const, hl: [20,20,  6, 20] as const, dot: [20,20] as const },
];

/* ── COMPONENT ── */
export function AnimatedBackground() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const frameRef    = useRef(0);
  const mouseRef    = useRef({ x: -9999, y: -9999 }); // cursor pos for spotlight
  const sceneRef    = useRef<SceneData>(
    generateScene(
      typeof window !== 'undefined' ? window.innerWidth  : 1440,
      typeof window !== 'undefined' ? window.innerHeight : 900,
    )
  );
  const [tick, setTick] = useState(0);  // forces SVG/div re-render on theme or resize

  /* ── Animation loop ── */
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const w    = canvas.clientWidth;
    const h    = canvas.clientHeight;
    const time = Date.now() * 0.001;
    const dark = document.documentElement.classList.contains('dark');
    const c    = getThemeColors(dark);
    const { bokeh, rings } = sceneRef.current;

    ctx.clearRect(0, 0, w, h);

    // 1 — Light leak: warm diagonal gradient from top-left (vintage film effect)
    const leak = ctx.createLinearGradient(0, 0, w * 0.4, h * 0.3);
    leak.addColorStop(0,    c.leakColor);
    leak.addColorStop(0.55, c.leakColor);
    leak.addColorStop(1,    'rgba(0,0,0,0)');
    ctx.fillStyle = leak;
    ctx.fillRect(0, 0, w, h);

    // 2 — Bokeh circles: soft radial-gradient blobs drifting on sine/cosine paths
    //     Particles near the cursor get a brightness boost (spotlight effect)
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;
    const SPOTLIGHT_RADIUS = 180; // px — range of cursor influence

    for (const p of bokeh) {
      const x   = p.baseX + Math.sin(time * p.speed + p.phase) * p.driftX;
      const y   = p.baseY + Math.cos(time * p.speed * 0.65 + p.phase + 0.8) * p.driftY;
      const rgb = p.warm ? c.warmBokeh : c.coolBokeh;

      // Cursor proximity boost: 0 (far) → 1 (on top)
      const dx = x - mx;
      const dy = y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const proximity = Math.max(0, 1 - dist / SPOTLIGHT_RADIUS);
      const boost = proximity * proximity; // quadratic falloff for smooth glow

      // Enhanced opacity & size near cursor
      const op   = p.opacity + boost * 0.22;
      const size = p.size    + boost * 14;

      const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
      grad.addColorStop(0,    `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${(op * 1.6).toFixed(3)})`);
      grad.addColorStop(0.45, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${op.toFixed(3)})`);
      grad.addColorStop(1,    `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // 3 — Aperture hexagon rings: double-ring, slowly rotating + opacity pulse
    for (const ring of rings) {
      const rot   = time * ring.rotSpeed + ring.phase;
      const pulse = ring.baseOpacity * (0.6 + 0.4 * Math.sin(time * 0.4 + ring.phase));
      // Outer ring
      drawHex(ctx, ring.cx, ring.cy, ring.radius,        rot,              c.ringStroke, pulse,        0.7);
      // Inner ring — offset rotation by 30° (π/6) for aperture blade effect
      drawHex(ctx, ring.cx, ring.cy, ring.radius * 0.70, rot + Math.PI / 6, c.ringStroke, pulse * 0.55, 0.5);
    }

    frameRef.current = requestAnimationFrame(animate);
  }, []);

  /* ── Setup: canvas sizing + resize handler ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width        = w * dpr;
      canvas.height       = h * dpr;
      canvas.style.width  = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sceneRef.current = generateScene(w, h);
      setTick(t => t + 1);
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

    // Track cursor for spotlight effect (uses ref — no re-renders)
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    const onMouseLeave = () => {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(frameRef.current);
    };
  }, [animate]);

  /* ── Theme observer: re-render SVG/div when dark class toggles ── */
  useEffect(() => {
    const obs = new MutationObserver(() => setTick(t => t + 1));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  // Read theme at render time (tick ensures freshness after theme toggle)
  const dark = typeof document !== 'undefined'
    ? document.documentElement.classList.contains('dark')
    : false;
  const c = getThemeColors(dark);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0, backgroundColor: c.bg }}
    >
      {/* Canvas layer: bokeh blobs + aperture rings + light leak */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Subtle dot grid pattern — adds tactile depth */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: dark
            ? 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)'
            : 'radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
        aria-hidden="true"
      />

      {/* Fine diagonal crosshatch — subtle texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: dark
            ? `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 40px,
                rgba(255,255,255,0.015) 40px,
                rgba(255,255,255,0.015) 41px
              ),
              repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 40px,
                rgba(255,255,255,0.015) 40px,
                rgba(255,255,255,0.015) 41px
              )`
            : `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 40px,
                rgba(0,0,0,0.018) 40px,
                rgba(0,0,0,0.018) 41px
              ),
              repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 40px,
                rgba(0,0,0,0.018) 40px,
                rgba(0,0,0,0.018) 41px
              )`,
        }}
        aria-hidden="true"
      />

      {/* Film grain noise — ultra-subtle photography texture */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <filter id="photobg-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <rect
          x="0" y="0" width="100%" height="100%"
          filter="url(#photobg-grain)"
          opacity={dark ? '0.04' : '0.025'}
        />
      </svg>

      {/* SVG layer: radial vignette (classic photography edge darkening) */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="photobg-vignette" cx="50%" cy="50%" r="70%">
            <stop offset="52%" stopColor="transparent" />
            <stop offset="100%" stopColor={c.vignetteStop} />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#photobg-vignette)" />
      </svg>

      {/* Corner viewfinder brackets — camera / rangefinder aesthetic */}
      {CORNER_BRACKETS.map(({ pos, vl, hl, dot }, i) => (
        <svg
          key={i}
          className={`absolute ${pos} w-6 h-6`}
          viewBox="0 0 24 24"
          fill="none"
          stroke={c.bracketStroke}
          strokeWidth="1"
          opacity={c.bracketOpacity}
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <line x1={vl[0]} y1={vl[1]} x2={vl[2]} y2={vl[3]} />
          <line x1={hl[0]} y1={hl[1]} x2={hl[2]} y2={hl[3]} />
          <circle cx={dot[0]} cy={dot[1]} r="1.5" stroke="none" fill={c.bracketStroke} opacity="0.7" />
        </svg>
      ))}
    </div>
  );
}