import React from 'react';
import {Img, useCurrentFrame} from 'remotion';
import {C} from '../lib/theme';
import {DARK_PLATE, img, Product, SIZE} from '../lib/images';
import {Cam, camStyle, gimbal, macroReveal, suspensionFlex} from '../lib/anim';

/**
 * A product image on the reel's light ground.
 *
 * Two presentations, chosen by the source's own backdrop:
 *
 *   FLOAT — the source was shot on a uniform light sweep, so prep_media.py
 *   keyed that backdrop to transparency. The product floats directly on the
 *   paper with a soft contact shadow beneath it and no visible photo edge.
 *
 *   PLATE — the source has a dark or busy backdrop. It is contained in a
 *   rounded plate with a hairline and a soft drop shadow. The scene
 *   background stays light; the photograph keeps its deep blacks, which is
 *   what lets the black finish and its LEDs stay punchy (brief Section 6).
 *
 * `cam` carries whichever camera primitive the beat is using. Because every
 * primitive resolves through scale 1.0, the complete product is always shown
 * fully and legibly at some point in the image's screen time.
 */
export const Shot: React.FC<{
  src: Product;
  w: number;
  h: number;
  x?: number;
  y?: number;
  cam?: Cam;
  rot?: number;
  opacity?: number;
  fit?: 'contain' | 'cover';
  shadow?: boolean;
  radius?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({
  src,
  w,
  h,
  x = 0,
  y = 0,
  cam,
  rot = 0,
  opacity = 1,
  fit = 'contain',
  shadow = true,
  radius = 20,
  style,
  children,
}) => {
  const plate = DARK_PLATE.has(src);
  const c: Cam = cam ?? {scale: 1, x: 0, y: 0, blur: 0};

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        opacity,
        transform: rot ? `rotate(${rot}deg)` : undefined,
        transformOrigin: '50% 76%', // pivots around the mic's mount point
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          borderRadius: plate ? radius : 0,
          backgroundColor: plate ? C.screen : 'transparent',
          border: plate ? `1px solid ${C.line}` : undefined,
          boxShadow: plate && shadow
            ? '0 26px 60px rgba(11,16,22,0.20), 0 4px 14px rgba(11,16,22,0.10)'
            : undefined,
        }}
      >
        <Img
          src={img(src)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: fit,
            ...camStyle(c),
            // a floated product gets its own contact shadow; a plated one
            // gets the plate's shadow instead
            filter: [
              c.blur > 0.01 ? `blur(${c.blur}px)` : '',
              !plate && shadow ? 'drop-shadow(0 22px 30px rgba(11,16,22,0.22))' : '',
            ].filter(Boolean).join(' ') || undefined,
          }}
        />
        {children}
      </div>
    </div>
  );
};

/** Convenience: a Shot driven by the gimbal micro-movement primitive. */
export const GimbalShot: React.FC<
  Omit<React.ComponentProps<typeof Shot>, 'cam'> & {dur: number; amt?: number; from?: number}
> = ({dur, amt = 1, from = 1.0, ...rest}) => {
  const f = useCurrentFrame();
  return <Shot {...rest} cam={gimbal(f, dur, amt, from)} />;
};

/** Convenience: a Shot driven by the full macro-to-full-reveal sequence. */
export const RevealShot: React.FC<
  Omit<React.ComponentProps<typeof Shot>, 'cam'> & {
    dur: number;
    focus?: {x: number; y: number};
    zoom?: number;
  }
> = ({dur, focus, zoom, ...rest}) => {
  const f = useCurrentFrame();
  return <Shot {...rest} cam={macroReveal(f, dur, focus, zoom)} />;
};

/** Convenience: a Shot driven by the suspension-flex pivot. */
export const FlexShot: React.FC<
  Omit<React.ComponentProps<typeof Shot>, 'cam' | 'rot'> & {dur: number; amp?: number}
> = ({dur, amp = 2.5, ...rest}) => {
  const f = useCurrentFrame();
  const s = suspensionFlex(f, dur, amp);
  return (
    <Shot
      {...rest}
      rot={s.rot}
      cam={{scale: s.scale, x: 0, y: s.y, blur: 0}}
    />
  );
};
