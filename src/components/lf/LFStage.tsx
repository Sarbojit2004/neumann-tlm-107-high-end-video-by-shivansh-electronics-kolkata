import React from 'react';
import {AbsoluteFill, Img, Sequence, useCurrentFrame} from 'remotion';
import {BRAND_BAND, C, CANVAS, F, PAD, SAFE} from '../../lib/lf-theme';
import {Ambient} from '../../lib/images';
import {staticFile} from 'remotion';
import {ramp, ease} from '../../lib/anim';
import {BRAND_SLOTS, logo} from '../../lib/lf-brand';
import {Micro} from '../Type';

/** 16:9 ambient plate, for the long-form's full-bleed background wash. */
export const ambWide = (s: Ambient): string => staticFile(`ambient-wide/${s}.jpg`);

/**
 * The light ground, landscape edition.
 *
 * Same cool high-key paper as the reel so the two deliverables match, but lit
 * for a 16:9 frame: a broad radial lift behind the centre of action and a
 * gentle vignette into the corners, which is what gives the matte nickel its
 * edge separation without ever going dark.
 */
export const LFGround: React.FC<{tone?: 'neutral' | 'warm' | 'cool'}> = ({tone = 'neutral'}) => {
  const tint =
    tone === 'warm' ? 'rgba(255,248,240,0.66)'
      : tone === 'cool' ? 'rgba(233,241,250,0.72)'
        : 'rgba(255,255,255,0.68)';
  return (
    <AbsoluteFill style={{backgroundColor: C.paper}}>
      <AbsoluteFill
        style={{background: `radial-gradient(95% 105% at 50% 44%, ${tint} 0%, rgba(255,255,255,0) 66%)`}}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(120% 120% at 50% 50%, rgba(210,217,226,0) 58%, rgba(210,217,226,0.55) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * AMBIENT WASH — how the long-form carries its 24 texture plates.
 *
 * The reel had to hide these in narrow top/bottom bands because its safe-zone
 * geometry forbade content there. Landscape has no such exclusion zone, so
 * here they work as a full-bleed background wash instead: scaled past the
 * frame, blurred again on top of the blur already baked in, held at low
 * opacity and slowly drifting. They read as depth and lighting behind the
 * product, never as a product themselves — which is the whole point, since
 * these are the wooden-box and wrong-model frames.
 */
export const LFAmbient: React.FC<{
  plates: readonly Ambient[];
  dur: number;
  intensity?: number;
  drift?: number;
}> = ({plates, dur, intensity = 1, drift = 0}) => {
  const f = useCurrentFrame();
  const n = plates.length;
  const seg = dur / Math.max(1, n);
  const raw = f / seg;
  const i = Math.min(n - 1, Math.max(0, Math.floor(raw)));
  const local = raw - i;
  const FADE = 0.22;
  const nextOp = local > 1 - FADE && i < n - 1 ? (local - (1 - FADE)) / FADE : 0;

  const dx = Math.sin((f + drift) / 220) * 26;
  const dy = Math.cos((f + drift) / 280) * 14;

  const plate = (slug: Ambient, op: number, key: string) => (
    <Img
      key={key}
      src={ambWide(slug)}
      style={{
        position: 'absolute',
        width: CANVAS.w * 1.35,
        height: 'auto',
        left: -CANVAS.w * 0.175 + dx,
        top: -CANVAS.h * 0.16 + dy,
        opacity: op,
        filter: 'blur(22px) saturate(0.55)',
      }}
    />
  );

  return (
    <AbsoluteFill style={{overflow: 'hidden', opacity: 0.9 * intensity}}>
      {plate(plates[i], 1 - nextOp, 'a')}
      {nextOp > 0 ? plate(plates[i + 1], nextOp, 'b') : null}
    </AbsoluteFill>
  );
};

/** Fine engineering grid at very low contrast, matching the reel's texture. */
export const LFGrid: React.FC<{opacity?: number; step?: number}> = ({
  opacity = 0.34,
  step = 96,
}) => (
  <AbsoluteFill
    style={{
      opacity,
      backgroundImage:
        `linear-gradient(to right, ${C.lineSoft} 1px, transparent 1px),` +
        `linear-gradient(to bottom, ${C.lineSoft} 1px, transparent 1px)`,
      backgroundSize: `${step}px ${step}px`,
      maskImage: 'radial-gradient(70% 70% at 50% 48%, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 82%)',
      WebkitMaskImage:
        'radial-gradient(70% 70% at 50% 48%, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 82%)',
    }}
  />
);

/** Absolutely-positioned block inside the padded safe rect. */
export const LFBlock: React.FC<{
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  children: React.ReactNode;
  opacity?: number;
  justify?: React.CSSProperties['justifyContent'];
  style?: React.CSSProperties;
}> = ({x = 0, y = 0, w, h, children, opacity = 1, justify = 'flex-start', style}) => (
  <div
    style={{
      position: 'absolute',
      left: SAFE.x + x,
      top: SAFE.y + y,
      width: w,
      height: h,
      opacity,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: justify,
      ...style,
    }}
  >
    {children}
  </div>
);

// ---------------------------------------------------------------------------
// BRANDING
//
// Every logo renders DIRECTLY on the ground — no white box, card or plate
// behind it. Both supplied files ship with a baked white rounded-rect plate;
// scripts/prep_logos.py keys that away so these composite cleanly.
//
// Both marks are used COMPLETE. The Shivansh lockup is globe + wordmark +
// the "Eastern India's Premier Audio Destination" tagline; nothing is cropped.
//
// SIZING. Restoring the tagline changed the Shivansh aspect ratio from 4.86 to
// 3.45, and the tagline band is only 9.6% of the artwork's height. Every width
// below is therefore set from the TAGLINE's rendered cap height rather than
// from the lockup's overall size — at 1920x1080 the tagline needs ~11px to
// stay crisp, which is width x 0.0278. Sizing by eye off the wordmark alone
// would have left it an illegible grey smear.
// ---------------------------------------------------------------------------

/** Rendered tagline cap height for a given Shivansh logo width, in px. */
const taglinePx = (w: number) => w * 0.0278;

/**
 * Corner mark — a logo alone, sized to read without dominating.
 *
 * It lives at the BOTTOM-RIGHT, inside the reserved branding band.
 *
 * It used to sit top-right, which worked only while the Shivansh logo was
 * being cropped to a squat 4.86:1. Restoring the full lockup made it 87%
 * taller at the same width, and the top-right corner is not reserved — the
 * taller mark landed on the black macro plate in C2, the transformerless hero
 * in C3 and the grille macro in C7, printing a black logo over black
 * photography. The bottom band is the one region guaranteed free of chapter
 * content, and no two branding slots are ever on screen at once (verified: 23
 * slots, zero temporal overlap, minimum gap 70 frames), so all three forms can
 * share it. The three stay visually distinct by position and weight: mark
 * right, lower-third left, beat full-width centred.
 */
const CornerMark: React.FC<{brand: 'shivansh' | 'neumann'; p: number}> = ({brand, p}) => {
  // 400 -> 116px tall, tagline 11.1px. The Neumann mark keeps its old width;
  // its aspect ratio did not change.
  const w = brand === 'shivansh' ? 400 : 280;
  return (
    <div
      style={{
        position: 'absolute',
        right: PAD + 8,
        bottom: 0,
        height: BRAND_BAND,
        display: 'flex',
        alignItems: 'center',
        opacity: p * 0.95,
        transform: `translateY(${(1 - p) * 12}px)`,
      }}
    >
      {/*
        No wash behind this one. A gradient clipped to the mark's own box would
        have a hard left edge and read as precisely the white plate the spec
        forbids; the band is verified clear of media at every corner-mark
        frame, so the mark composites straight onto the ground.
      */}
      <Img src={logo(brand)} style={{width: w, height: 'auto', display: 'block'}} />
    </div>
  );
};

/** Lower third — logo plus one rotating contact detail, no plate. */
const LowerThird: React.FC<{
  brand: 'shivansh' | 'neumann';
  p: number;
  detail?: string;
  label?: string;
}> = ({brand, p, detail, label}) => (
  <div
    style={{
      // inside the reserved branding band, so it can never land on content
      position: 'absolute',
      left: PAD + 8,
      bottom: 20,
      height: BRAND_BAND - 32,
      display: 'flex',
      alignItems: 'center',
      gap: 26,
      opacity: p,
      transform: `translateX(${(1 - p) * -26}px)`,
    }}
  >
    {/* 400 -> 116px tall, tagline 11.1px; fits the 124px container */}
    <Img
      src={logo(brand)}
      style={{width: brand === 'shivansh' ? 400 : 300, height: 'auto', display: 'block'}}
    />
    <div style={{width: 2, height: 62, backgroundColor: C.line, opacity: 0.9}} />
    <div>
      {label ? (
        <Micro size={19} color={C.inkDim} tracking={2.6}>
          {label}
        </Micro>
      ) : null}
      {detail ? (
        <div
          style={{
            fontFamily: F.display,
            fontWeight: 800,
            fontSize: 40,
            letterSpacing: -0.3,
            color: C.ink,
            lineHeight: 1.02,
            marginTop: 5,
          }}
        >
          {detail}
        </div>
      ) : null}
    </div>
  </div>
);

/**
 * Full branding beat — the most prominent of the three forms.
 *
 * It spans the full width of the reserved band with a larger logo, the
 * Authorized Partner designation and the primary URL, so it reads as a
 * deliberate branding moment rather than a passing corner mark.
 *
 * It was originally a centred full-frame overlay, which landed on top of the
 * spec sheet and the pattern walk. Living in the reserved band gives it real
 * prominence without ever occluding a chapter.
 */
const BrandBeat: React.FC<{
  brand: 'shivansh' | 'neumann';
  p: number;
  detail?: string;
  label?: string;
}> = ({brand, p, detail, label}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      bottom: 0,
      width: CANVAS.w,
      height: BRAND_BAND,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      // lifts the row clear of the 4px progress bar that runs along the very
      // bottom edge; without it the taller lockup cleared it by only 3px
      paddingBottom: 12,
      boxSizing: 'border-box',
      gap: 40,
      opacity: p,
    }}
  >
    {/*
      A soft lift so the band reads as its own moment, with no hard edge.
      It extends 90px ABOVE the band and reaches solid paper by 32% (y≈913),
      which is above the restored logo's top edge (y≈932) — so the taller
      Shivansh lockup sits on clean ground rather than half-over a chapter.
    */}
    <div
      style={{
        position: 'absolute',
        top: -90,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(180deg, rgba(242,244,247,0) 0%, ${C.paper} 32%, ${C.paper} 100%)`,
      }}
    />
    {/* 450 -> 131px tall inside the 156px band; tagline 12.5px */}
    <Img
      src={logo(brand)}
      style={{
        width: brand === 'shivansh' ? 450 : 380,
        height: 'auto',
        display: 'block',
        position: 'relative',
        transform: `translateY(${(1 - p) * 14}px)`,
      }}
    />
    <div style={{width: 2, height: 66, backgroundColor: C.line, position: 'relative'}} />
    <div style={{position: 'relative'}}>
      {label ? (
        <Micro size={19} color={C.inkDim} tracking={3.0}>
          {label}
        </Micro>
      ) : null}
      {detail ? (
        <div
          style={{
            fontFamily: F.display,
            fontWeight: 800,
            fontSize: 52,
            letterSpacing: -0.4,
            color: C.ink,
            lineHeight: 1.02,
            marginTop: 6,
          }}
        >
          {detail}
        </div>
      ) : null}
    </div>
  </div>
);

/**
 * Renders the whole branding cadence declared in lf-brand.ts.
 *
 * Mounted once at the top of the composition rather than inside chapters, so
 * the cadence is guaranteed by the schedule and cannot drift as scenes are
 * edited.
 */
export const LFBranding: React.FC = () => (
  <>
    {BRAND_SLOTS.map((s, i) => (
      <Sequence key={i} from={s.at} durationInFrames={s.dur} layout="none">
        <BrandSlotRender slot={s} />
      </Sequence>
    ))}
  </>
);

const BrandSlotRender: React.FC<{slot: (typeof BRAND_SLOTS)[number]}> = ({slot}) => {
  const f = useCurrentFrame();
  const IN = 16;
  const OUT = 18;
  const p = Math.min(
    ease(f, [0, IN], [0, 1]),
    ease(f, [slot.dur - OUT, slot.dur], [1, 0]),
  );
  if (slot.kind === 'corner') return <CornerMark brand={slot.brand} p={p} />;
  if (slot.kind === 'lower-third') {
    return <LowerThird brand={slot.brand} p={p} detail={slot.detail} label={slot.label} />;
  }
  return <BrandBeat brand={slot.brand} p={p} detail={slot.detail} label={slot.label} />;
};

/** Thin chapter-progress hairline across the very bottom of the frame. */
export const LFProgress: React.FC<{frame: number; total: number}> = ({frame, total}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      bottom: 0,
      width: CANVAS.w,
      height: 4,
      backgroundColor: C.lineSoft,
    }}
  >
    <div
      style={{
        width: `${ramp(frame, [0, total], [0, 1]) * 100}%`,
        height: '100%',
        backgroundColor: C.ink,
        opacity: 0.42,
      }}
    />
  </div>
);
