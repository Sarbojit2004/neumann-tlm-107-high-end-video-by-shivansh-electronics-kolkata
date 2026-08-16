import React from 'react';
import {AbsoluteFill, Img, useCurrentFrame} from 'remotion';
import {C, CANVAS, SAFE, ZONE} from '../lib/theme';
import {amb, Ambient} from '../lib/images';
import {ramp} from '../lib/anim';

/**
 * The light ground every scene sits on.
 *
 * A cool high-key sweep: a soft radial lift behind the product zone and a
 * gentle darkening toward the extreme top and bottom, so the frame reads as a
 * lit photographic environment rather than a flat fill. This is what gives the
 * matte nickel its edge separation (brief Section 6) without ever going dark.
 */
export const Ground: React.FC<{tone?: 'neutral' | 'warm' | 'cool'}> = ({tone = 'neutral'}) => {
  const tint =
    tone === 'warm' ? 'rgba(255,247,238,0.62)'
      : tone === 'cool' ? 'rgba(232,240,250,0.70)'
        : 'rgba(255,255,255,0.66)';
  return (
    <AbsoluteFill style={{backgroundColor: C.paper}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 78% at 50% 40%, ${tint} 0%, rgba(255,255,255,0) 62%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            `linear-gradient(180deg, ${C.paperEdge} 0%, rgba(226,231,238,0) 15%, ` +
            `rgba(226,231,238,0) 84%, ${C.paperEdge} 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * AMBIENT BANDS — the non-critical top (0–250px) and bottom (1580–1920px)
 * zones, filled per the format spec with genuinely non-critical content.
 *
 * These carry the 24 dissolved texture plates. They are scaled far past the
 * band, blurred again on top of the blur baked into the plate, held at low
 * opacity and masked to fade into the paper — so they read as depth and
 * lighting, never as a product. Nothing legible ever enters these bands.
 */
const TOP_MASK = 'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.72) 58%, rgba(0,0,0,0) 100%)';
const BOT_MASK = 'linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.72) 58%, rgba(0,0,0,0) 100%)';

/**
 * One band's worth of plates, cross-faded across the scene.
 *
 * Each band takes a LIST rather than a single plate so the 24 texture plates
 * all reach the screen: with one plate per band there were only ~13 slots in
 * the whole reel and half the plates were never placed. Cross-fading also
 * makes the ambient zones evolve instead of sitting static for 15 seconds.
 */
const PlateBand: React.FC<{
  plates: readonly Ambient[];
  dur: number;
  side: 'top' | 'bottom';
  intensity: number;
  dx: number;
  dy: number;
}> = ({plates, dur, side, intensity, dx, dy}) => {
  const f = useCurrentFrame();
  const n = plates.length;
  const seg = dur / n;
  const raw = f / seg;
  const i = Math.min(n - 1, Math.max(0, Math.floor(raw)));
  const local = raw - i;
  const FADE = 0.18;
  const nextOp = local > 1 - FADE && i < n - 1 ? (local - (1 - FADE)) / FADE : 0;

  const box: React.CSSProperties =
    side === 'top'
      ? {
          top: 0,
          height: ZONE.topAmbientEnd + 90,
          maskImage: TOP_MASK,
          WebkitMaskImage: TOP_MASK,
        }
      : {
          top: ZONE.bottomAmbientStart - 90,
          height: CANVAS.h - ZONE.bottomAmbientStart + 90,
          maskImage: BOT_MASK,
          WebkitMaskImage: BOT_MASK,
        };

  const imgStyle = (): React.CSSProperties =>
    side === 'top'
      ? {top: -180 + dy, left: -CANVAS.w * 0.35 + dx}
      : {bottom: -200 - dy, left: -CANVAS.w * 0.35 - dx};

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        width: CANVAS.w,
        overflow: 'hidden',
        opacity: 0.92 * intensity,
        ...box,
      }}
    >
      <Img
        src={amb(plates[i])}
        style={{
          position: 'absolute',
          width: CANVAS.w * 1.7,
          filter: 'blur(18px) saturate(0.6)',
          opacity: 1 - nextOp,
          ...imgStyle(),
        }}
      />
      {nextOp > 0 ? (
        <Img
          src={amb(plates[i + 1])}
          style={{
            position: 'absolute',
            width: CANVAS.w * 1.7,
            filter: 'blur(18px) saturate(0.6)',
            opacity: nextOp,
            ...imgStyle(),
          }}
        />
      ) : null}
    </div>
  );
};

export const AmbientBands: React.FC<{
  top?: readonly Ambient[];
  bottom?: readonly Ambient[];
  dur: number;
  intensity?: number;
  drift?: number;
}> = ({top, bottom, dur, intensity = 1, drift = 0}) => {
  const f = useCurrentFrame();
  const dx = Math.sin((f + drift) / 150) * 16;
  const dy = Math.cos((f + drift) / 190) * 10;

  return (
    <>
      {top?.length ? (
        <PlateBand plates={top} dur={dur} side="top" intensity={intensity} dx={dx} dy={dy} />
      ) : null}
      {bottom?.length ? (
        <PlateBand plates={bottom} dur={dur} side="bottom" intensity={intensity} dx={dx} dy={dy} />
      ) : null}
    </>
  );
};

/** The primary safe content rect — 936 x 1330 at (72, 250). */
export const Safe: React.FC<{
  children: React.ReactNode;
  pad?: number;
  justify?: React.CSSProperties['justifyContent'];
  align?: React.CSSProperties['alignItems'];
  style?: React.CSSProperties;
}> = ({children, pad = 0, justify = 'flex-start', align = 'stretch', style}) => (
  <div
    style={{
      position: 'absolute',
      left: SAFE.x,
      top: SAFE.y,
      width: SAFE.w,
      height: SAFE.h,
      padding: pad,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: justify,
      alignItems: align,
      ...style,
    }}
  >
    {children}
  </div>
);

/**
 * A layout band — canvas-absolute vertical placement, horizontally inset to
 * the side margins. Scenes compose entirely out of these, so a text band and a
 * media band can never overlap.
 *
 * This exists because the first layout pass positioned headlines relative to
 * the BOTTOM of the safe area while placing media relative to its TOP, which
 * let dark type land on dark photographs in three scenes. Declaring the bands
 * once, in canvas-absolute coordinates, makes that collision impossible.
 */
export const Band: React.FC<{
  y: number;
  h?: number;
  children: React.ReactNode;
  justify?: React.CSSProperties['justifyContent'];
  align?: React.CSSProperties['alignItems'];
  center?: boolean;
  opacity?: number;
  style?: React.CSSProperties;
}> = ({y, h, children, justify = 'flex-start', align, center = false, opacity = 1, style}) => (
  <div
    style={{
      position: 'absolute',
      left: SAFE.x,
      top: y,
      width: SAFE.w,
      height: h,
      opacity,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: justify,
      alignItems: align ?? (center ? 'center' : 'stretch'),
      textAlign: center ? 'center' : undefined,
      ...style,
    }}
  >
    {children}
  </div>
);

/**
 * Fine engineering grid, drawn only inside the safe area. Gives the light
 * ground a measured, instrument-like structure at very low contrast.
 */
export const Grid: React.FC<{opacity?: number; step?: number}> = ({opacity = 0.4, step = 78}) => (
  <div
    style={{
      position: 'absolute',
      left: SAFE.x,
      top: SAFE.y,
      width: SAFE.w,
      height: SAFE.h,
      opacity,
      backgroundImage:
        `linear-gradient(to right, ${C.lineSoft} 1px, transparent 1px),` +
        `linear-gradient(to bottom, ${C.lineSoft} 1px, transparent 1px)`,
      backgroundSize: `${step}px ${step}px`,
      maskImage: 'radial-gradient(72% 62% at 50% 46%, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 78%)',
      WebkitMaskImage:
        'radial-gradient(72% 62% at 50% 46%, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 78%)',
    }}
  />
);

/** Progress hairline pinned inside the safe area's lower edge. */
export const Progress: React.FC<{frame: number; total: number}> = ({frame, total}) => {
  const p = ramp(frame, [0, total], [0, 1]);
  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE.x,
        top: SAFE.y + SAFE.h - 3,
        width: SAFE.w,
        height: 3,
        backgroundColor: C.lineSoft,
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${p * 100}%`,
          height: '100%',
          backgroundColor: C.ink,
          opacity: 0.5,
        }}
      />
    </div>
  );
};
