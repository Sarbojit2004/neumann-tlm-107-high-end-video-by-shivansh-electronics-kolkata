import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, F} from '../lib/theme';
import {ramp, ease, interfaceStep} from '../lib/anim';

/**
 * Vector assets the brief's Section 11 requires the production system to
 * generate. All are native SVG drawn here — no external library, and nothing
 * imported from motion-canvas (which is a separate, unrelated runtime).
 */

// ---------------------------------------------------------------------------
// Five-polar-pattern morphing diagram
// ---------------------------------------------------------------------------

/**
 * Every first-order pattern is r(θ) = A + B·cos θ. Morphing the pair (A, B)
 * walks continuously through the whole family, which is exactly the physical
 * story: one capsule pair, continuously re-balanced. Negative r is kept rather
 * than taken absolute, so the rear lobe of hypercardioid and figure-8 renders
 * correctly.
 */
const AB: Record<string, [number, number]> = {
  omni: [1.0, 0.0],
  wide: [0.75, 0.25],
  card: [0.5, 0.5],
  hyper: [0.25, 0.75],
  fig8: [0.0, 1.0],
};
const ORDER = ['omni', 'wide', 'card', 'hyper', 'fig8'] as const;

const polarPath = (A: number, B: number, R: number, steps = 240): string => {
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const th = (i / steps) * Math.PI * 2;
    // MAGNITUDE, not signed radius. A signed radius makes r = cos θ trace a
    // single circle twice rather than the two lobes of a figure-8, which is
    // how microphone polar plots are actually drawn: the rear lobe is a
    // magnitude in the rear direction, with its phase inversion implied.
    const r = Math.abs(A + B * Math.cos(th)) * R;
    const x = r * Math.sin(th);
    const y = -r * Math.cos(th); // 0° points up, toward the source
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return pts.join(' ') + ' Z';
};

/**
 * The animated diagram. `t` is a position along the pattern sequence in
 * [0, 4] — integers land exactly on a named pattern, fractions morph between
 * neighbours.
 */
export const PolarDiagram: React.FC<{
  t: number;
  size?: number;
  color?: string;
  fill?: string;
  rings?: boolean;
  strokeWidth?: number;
}> = ({t, size = 300, color = C.steel, fill = C.steelSoft, rings = true, strokeWidth = 4}) => {
  const R = size * 0.40;
  const i0 = Math.max(0, Math.min(ORDER.length - 1, Math.floor(t)));
  const i1 = Math.min(ORDER.length - 1, i0 + 1);
  const k = t - i0;
  const [a0, b0] = AB[ORDER[i0]];
  const [a1, b1] = AB[ORDER[i1]];
  const A = a0 + (a1 - a0) * k;
  const B = b0 + (b1 - b0) * k;

  return (
    <svg width={size} height={size} viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`}>
      {rings ? (
        <g stroke={C.line} strokeWidth={1.4} fill="none" opacity={0.85}>
          {[0.25, 0.5, 0.75, 1].map((r) => (
            <circle key={r} cx={0} cy={0} r={R * r} />
          ))}
          <line x1={-R} y1={0} x2={R} y2={0} />
          <line x1={0} y1={-R} x2={0} y2={R} />
        </g>
      ) : null}
      <path d={polarPath(A, B, R)} fill={fill} fillOpacity={0.66} stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
      {/* the capsule at origin */}
      <circle cx={0} cy={0} r={strokeWidth * 1.5} fill={color} />
    </svg>
  );
};

// ---------------------------------------------------------------------------
// LED glow overlay for the rear-interface photographs
// ---------------------------------------------------------------------------

/**
 * INTERFACE SEQUENCE overlay.
 *
 * The rear-interface photographs already carry the five polar-pattern icons
 * printed on the chrome ring. Rather than draw a synthetic ring on top, this
 * lights the microphone's OWN icons in sequence — measured positions, so each
 * glow lands exactly on its printed symbol. That is what makes the simulated
 * LED stepping read as the real illuminated display.
 *
 * Positions are fractions of the prepared 1500x1126 rear-interface frames;
 * both the nickel and black frames share identical geometry.
 */
const ICON_X = [0.260, 0.380, 0.510, 0.643, 0.760];
const ICON_Y = 0.784;

export const PatternRingGlow: React.FC<{
  glow: number[];
  w: number;
  h: number;
  color?: string;
  size?: number;
}> = ({glow, w, h, color = '#EAF4FF', size = 0.062}) => {
  const d = w * size;
  return (
    <>
      {ICON_X.map((fx, i) => {
        const g = glow[i] ?? 0;
        if (g <= 0.001) return null;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: fx * w - d / 2,
              top: ICON_Y * h - d / 2,
              width: d,
              height: d,
              borderRadius: '50%',
              opacity: g,
              background:
                `radial-gradient(circle, rgba(255,255,255,${0.92 * g}) 0%, ` +
                `rgba(226,242,255,${0.55 * g}) 42%, rgba(190,225,255,0) 74%)`,
              boxShadow: `0 0 ${d * 0.7}px ${d * 0.16}px rgba(214,238,255,${0.72 * g})`,
              mixBlendMode: 'screen',
              pointerEvents: 'none',
            }}
          />
        );
      })}
    </>
  );
};

/** Drives PatternRingGlow from the interfaceStep primitive. */
export const InterfaceOverlay: React.FC<{dur: number; w: number; h: number}> = ({dur, w, h}) => {
  const f = useCurrentFrame();
  const {glow} = interfaceStep(f, dur, 5);
  return <PatternRingGlow glow={glow} w={w} h={h} />;
};

// ---------------------------------------------------------------------------
// Navigation toggle interface graphic
// ---------------------------------------------------------------------------

/**
 * Minimal overlay standing in for the rear micro-joystick and its illuminated
 * ring. Required for beats where the rear of the microphone is not visible,
 * so the single-toggle control philosophy can still be explained graphically
 * regardless of the physical camera angle.
 */
export const NavToggle: React.FC<{
  size?: number;
  active?: number; // 0..4, which pattern position is lit
  press?: number; // 0..1, joystick depression
  color?: string;
}> = ({size = 240, active = 2, press = 0, color = C.steel}) => {
  const R = size * 0.36;
  const knob = size * 0.115;
  return (
    <svg width={size} height={size} viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`}>
      <circle cx={0} cy={0} r={R} fill="none" stroke={C.line} strokeWidth={size * 0.055} />
      <circle cx={0} cy={0} r={R} fill="none" stroke={color} strokeWidth={size * 0.012} opacity={0.5} />
      {ORDER.map((_, i) => {
        const th = (-Math.PI * 0.62) + (i / (ORDER.length - 1)) * Math.PI * 1.24;
        const x = Math.sin(th) * R;
        const y = -Math.cos(th) * R;
        const on = i === active;
        return (
          <g key={i}>
            {on ? <circle cx={x} cy={y} r={size * 0.052} fill="#EAF4FF" opacity={0.55} /> : null}
            <circle
              cx={x}
              cy={y}
              r={size * 0.026}
              fill={on ? color : C.line}
              stroke={on ? '#FFFFFF' : 'none'}
              strokeWidth={on ? size * 0.008 : 0}
            />
          </g>
        );
      })}
      {/* the micro-joystick itself */}
      <circle cx={0} cy={0} r={knob * (1 - press * 0.10)} fill={C.paperHi} stroke={C.inkDim} strokeWidth={size * 0.010} />
      <circle cx={0} cy={-knob * 0.22} r={knob * 0.42} fill={C.line} opacity={0.75} />
    </svg>
  );
};

// ---------------------------------------------------------------------------
// Heritage motif
// ---------------------------------------------------------------------------

/**
 * Wireframe silhouette that morphs from the tapered, shouldered profile of the
 * historic M 49 into the TLM 107's own outline — the visual shorthand for the
 * design lineage the manufacturer documentation states the headgrille echoes.
 * Both are drawn as generic outlines, not as any logo or badge.
 */
export const HeritageMotif: React.FC<{
  p: number; // 0 = historic M 49 profile, 1 = TLM 107 profile
  w?: number;
  h?: number;
  color?: string;
}> = ({p, w = 300, h = 460, color = C.inkDim}) => {
  const mix = (a: number, b: number) => a + (b - a) * p;

  // Half-width as a smooth function of normalised height. Sampling a curve
  // rather than joining seven straight segments is what makes this read as a
  // microphone instead of a polygon: the historic profile is rounder and more
  // bulbous through the grille, the TLM 107 squarer with a flatter shoulder.
  const halfWidth = (u: number): number => {
    const gW = mix(0.330, 0.370); // grille half-width
    const bW = mix(0.250, 0.280); // body half-width
    const GRILLE_END = 0.470;
    const RING_END = 0.560;
    const BODY_END = 0.880;

    if (u < GRILLE_END) {
      // Grille: full width for most of its height, rounding off only across
      // the top. Rounding the WHOLE section (the first attempt) pinched the
      // profile to nothing at the shoulder and read as a blob on a funnel.
      const roundTop = mix(0.20, 0.14); // historic crown is rounder
      if (u < roundTop) {
        const k = u / roundTop; // 0 at the crown, 1 where it goes straight
        const n = mix(2.0, 2.9); // superellipse exponent: round vs squarer
        return gW * Math.pow(Math.max(0, 1 - Math.pow(1 - k, n)), 1 / n);
      }
      return gW;
    }
    if (u < RING_END) {
      // the chrome ring band, stepped in from the grille
      return bW * 1.06;
    }
    if (u < BODY_END) {
      // body — the historic profile tapers, the modern one stays cylindrical
      const k = (u - RING_END) / (BODY_END - RING_END);
      return mix(bW - 0.045 * k, bW - 0.008 * k);
    }
    // XLR base
    const k = (u - BODY_END) / (1 - BODY_END);
    return mix(0.135, 0.128) * (1 - k * 0.18);
  };

  const N = 90;
  const left: string[] = [];
  const right: string[] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const hw = halfWidth(u) * w;
    const y = (0.035 + u * 0.945) * h;
    left.push(`${i === 0 ? 'M' : 'L'}${(w / 2 - hw).toFixed(1)},${y.toFixed(1)}`);
    right.unshift(`L${(w / 2 + hw).toFixed(1)},${y.toFixed(1)}`);
  }
  const d = `${left.join(' ')} ${right.join(' ')} Z`;

  const rows = 9;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path
        d={d}
        fill={color}
        fillOpacity={0.05}
        stroke={color}
        strokeWidth={2.4}
        strokeLinejoin="round"
        opacity={0.92}
      />
      {/* grille mesh hatch, clipped to the grille section */}
      <g stroke={color} strokeWidth={1.1} opacity={0.38}>
        {Array.from({length: rows}).map((_, i) => {
          const u = 0.06 + (i / rows) * 0.40;
          const hw = halfWidth(u) * w * 0.93;
          const y = (0.035 + u * 0.945) * h;
          return <line key={i} x1={w / 2 - hw} y1={y} x2={w / 2 + hw} y2={y} />;
        })}
      </g>
      {/* the ring band that separates grille from body */}
      <line
        x1={w / 2 - halfWidth(0.53) * w}
        y1={(0.035 + 0.53 * 0.945) * h}
        x2={w / 2 + halfWidth(0.53) * w}
        y2={(0.035 + 0.53 * 0.945) * h}
        stroke={color}
        strokeWidth={3}
        opacity={0.8}
      />
    </svg>
  );
};

// ---------------------------------------------------------------------------
// Micro callout — a label attached to a physical feature by a drawn line
// ---------------------------------------------------------------------------

export const LineCall: React.FC<{
  x: number;
  y: number;
  toX: number;
  toY: number;
  label: string;
  value?: string;
  p: number; // 0..1 draw-on progress
  align?: 'left' | 'right';
  color?: string;
}> = ({x, y, toX, toY, label, value, p, align = 'left', color = C.ink}) => {
  const dx = (toX - x) * Math.min(1, p * 1.5);
  const dy = (toY - y) * Math.min(1, p * 1.5);
  const textOp = ramp(p, [0.45, 0.85], [0, 1]);
  return (
    <>
      <svg
        style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}
        width={1}
        height={1}
      >
        <line x1={x} y1={y} x2={x + dx} y2={y + dy} stroke={color} strokeWidth={2} opacity={0.8} />
        <circle cx={x} cy={y} r={4.5} fill={color} opacity={ramp(p, [0, 0.2], [0, 1])} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: align === 'left' ? toX + 12 : undefined,
          right: align === 'right' ? 1080 - toX + 12 : undefined,
          top: toY - 22,
          opacity: textOp,
          textAlign: align,
        }}
      >
        <div
          style={{
            fontFamily: F.mono,
            fontWeight: 600,
            fontSize: 20,
            letterSpacing: 2.2,
            textTransform: 'uppercase',
            color: C.inkDim,
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </div>
        {value ? (
          <div
            style={{
              fontFamily: F.mono,
              fontWeight: 700,
              fontSize: 27,
              letterSpacing: 0.6,
              color,
              whiteSpace: 'nowrap',
              marginTop: 2,
            }}
          >
            {value}
          </div>
        ) : null}
      </div>
    </>
  );
};

/** Small pill listing a verified spec. */
export const SpecPill: React.FC<{
  k: string;
  v: string;
  u?: string;
  p?: number;
  accent?: string;
}> = ({k, v, u, p = 1, accent = C.ink}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      padding: '14px 20px 13px',
      backgroundColor: C.paperHi,
      border: `1px solid ${C.line}`,
      borderRadius: 12,
      boxShadow: '0 6px 18px rgba(11,16,22,0.06)',
      opacity: p,
      transform: `translateY(${(1 - p) * 14}px)`,
    }}
  >
    <div
      style={{
        fontFamily: F.mono,
        fontSize: 16,
        letterSpacing: 2.4,
        textTransform: 'uppercase',
        color: C.inkDim,
        fontWeight: 600,
      }}
    >
      {k}
    </div>
    <div style={{display: 'flex', alignItems: 'baseline', gap: 6}}>
      <span
        style={{
          fontFamily: F.mono,
          fontSize: 34,
          fontWeight: 700,
          color: accent,
          letterSpacing: 0.4,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {v}
      </span>
      {u ? (
        <span style={{fontFamily: F.mono, fontSize: 20, fontWeight: 500, color: C.inkSoft}}>{u}</span>
      ) : null}
    </div>
  </div>
);
