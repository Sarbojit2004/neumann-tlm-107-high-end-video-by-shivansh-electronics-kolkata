import {interpolate, spring} from 'remotion';
import {FPS} from './theme';

/** Clamped linear map. */
export const ramp = (f: number, input: [number, number], out: [number, number]) =>
  interpolate(f, input, out, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

/** Clamped map with a soft ease at both ends. */
export const ease = (f: number, input: [number, number], out: [number, number]) =>
  interpolate(f, input, out, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  });

/** Clamped map with a decelerating ease-out — camera moves settling. */
export const easeOut = (f: number, input: [number, number], out: [number, number]) =>
  interpolate(f, input, out, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });

/** Spring pop used for staggered text entrances. */
export const pop = (f: number, delay = 0, damping = 14) =>
  spring({frame: f - delay, fps: FPS, config: {damping, mass: 0.55, stiffness: 118}});

/** Stagger helper: nth item's delay. */
export const stag = (i: number, per = 3.2, base = 0) => base + i * per;

/** Fade in, hold, fade out across a scene of `dur` frames. */
export const holdFade = (f: number, dur: number, inF = 14, outF = 14) =>
  Math.min(ramp(f, [0, inF], [0, 1]), ramp(f, [dur - outF, dur], [1, 0]));

/** Overlap, in frames, between consecutive movements inside a scene. */
export const OVERLAP = 14;

/**
 * Segment opacity for a movement that CROSSFADES into the next one.
 *
 * `holdFade` fades out across the segment's own last frames, so where two
 * back-to-back Sequences met, the outgoing was already at zero exactly as the
 * incoming started from zero — every seam rendered as a blank frame. A full
 * render blinked at all twelve boundaries.
 *
 * This instead holds full opacity for the whole nominal duration and fades out
 * only across a TAIL that runs past it. Pair it with a Sequence whose
 * durationInFrames is `dur + tail` and the outgoing segment is still on screen,
 * fading, while the incoming one fades up underneath it.
 *
 * `inF = 0` gives a hard cut in, which is what the first movement of a scene
 * wants: each scene paints its own opaque ground, so an incoming scene can
 * never crossfade with the outgoing one — it can only cut. The transition
 * foley lands on those cuts and carries them.
 */
export const segFade = (f: number, dur: number, inF = OVERLAP, tail = OVERLAP) =>
  Math.min(
    inF <= 0 ? 1 : ramp(f, [0, inF], [0, 1]),
    tail <= 0 ? 1 : ramp(f, [dur, dur + tail], [1, 0]),
  );

// ---------------------------------------------------------------------------
// CAMERA LANGUAGE — the brief's Section 7 motion primitives.
//
// A constraint runs through every one of these: whatever treatment an image
// receives, the COMPLETE product must be shown fully and legibly at some point
// during that image's screen time. No image is ever left permanently cropped.
// Each primitive below therefore resolves to (or passes through) scale 1.0
// with zero offset, which is the fully-visible state.
// ---------------------------------------------------------------------------

export type Cam = {scale: number; x: number; y: number; blur: number};

/**
 * GIMBAL MICRO-MOVEMENT.
 *
 * A very subtle continuous scale increase paired with sub-pixel positional
 * drift on X/Y. Simulates a human operator on a stabilised gimbal so static
 * photography feels physically alive rather than artificially rigid. The
 * drift uses two incommensurate sine periods per axis so it never visibly
 * loops back on itself.
 */
export const gimbal = (f: number, dur: number, amt = 1, from = 1.0): Cam => {
  const p = dur > 0 ? f / dur : 0;
  return {
    scale: from + 0.052 * p * amt,
    x: (Math.sin(f / 47) * 2.1 + Math.sin(f / 19.5) * 0.9) * amt,
    y: (Math.cos(f / 53) * 1.8 + Math.cos(f / 23.5) * 0.7) * amt,
    blur: 0,
  };
};

/**
 * MACRO-TO-FULL-REVEAL.
 *
 * Opens on an extreme macro of a specific coordinate detail with simulated
 * shallow depth of field, executes a smooth dolly-style glide backward while
 * focus expands, resolves into the full uncropped product, then continues a
 * slow interactive-feeling zoom-out to hold attention.
 *
 * Section 6 pacing: ~35% of the sequence is macro exploration, ~65% is the
 * reveal and hold. `split` defaults to that ratio.
 *
 * @param focus  fractional point of interest in the image, 0..1 on each axis
 * @param zoom   macro magnification at the start
 */
export const macroReveal = (
  f: number,
  dur: number,
  focus: {x: number; y: number} = {x: 0.5, y: 0.42},
  zoom = 3.05,
  split = 0.35,
): Cam => {
  const m = Math.max(1, Math.round(dur * split)); // macro phase length
  // Offset that puts `focus` in the centre of frame at magnification s.
  const off = (s: number) => ({
    x: (0.5 - focus.x) * 100 * (s - 1) * 0.62,
    y: (0.5 - focus.y) * 100 * (s - 1) * 0.62,
  });

  if (f < m) {
    // macro exploration — slow creep in, shallow DOF, gentle gimbal drift
    const s = zoom + 0.10 * (f / m);
    const o = off(s);
    return {
      scale: s,
      x: o.x + Math.sin(f / 41) * 2.4,
      y: o.y + Math.cos(f / 47) * 2.0,
      blur: ramp(f, [0, m * 0.55], [3.0, 1.6]),
    };
  }

  // reveal — dolly back, focus expands, resolve to the complete product
  const rp = (f - m) / Math.max(1, dur - m);
  const revealEnd = 0.58; // reveal completes within the back 65%, then holds
  if (rp < revealEnd) {
    const t = rp / revealEnd;
    const eased = 1 - Math.pow(1 - t, 2.6); // decelerating dolly
    const s = zoom + 0.10 - (zoom + 0.10 - 1.0) * eased;
    const o = off(s);
    return {
      scale: s,
      x: o.x * (1 - eased * 0.06),
      y: o.y * (1 - eased * 0.06),
      blur: ramp(t, [0, 0.55], [1.6, 0]),
    };
  }

  // hold — continuous, very slow interactive-feeling drift out
  const hp = (rp - revealEnd) / (1 - revealEnd);
  return {
    scale: 1.0 - 0.030 * hp,
    x: Math.sin((f - m) / 61) * 1.5,
    y: Math.cos((f - m) / 67) * 1.2,
    blur: 0,
  };
};

/**
 * SUSPENSION FLEX.
 *
 * A rotational pivot around the microphone's central axis, drawing attention
 * to the EA 4's elastic bands and communicating mechanical isolation. The
 * rotation is damped like a real suspended mass settling, and always resolves
 * to level with the whole product visible.
 */
export const suspensionFlex = (f: number, dur: number, amp = 2.5) => {
  const p = dur > 0 ? f / dur : 0;
  const decay = Math.exp(-p * 2.3);
  const rot = Math.sin(p * Math.PI * 3.1) * amp * decay;
  return {
    rot,
    // the mass rides slightly against the rotation, as a suspended body does
    y: -Math.sin(p * Math.PI * 3.1) * amp * 1.7 * decay,
    scale: 1.0 + 0.030 * p,
  };
};

/**
 * INTERFACE SEQUENCE.
 *
 * A slow dolly-push toward the chrome pattern ring while glowing highlights
 * step sequentially across the five polar-pattern icons — simulating the
 * illuminated LED advancing Omni -> Wide Cardioid -> Cardioid ->
 * Hypercardioid -> Figure-8 without needing native video footage.
 *
 * Returns the active index plus a 0..1 glow for each of the five positions,
 * so a caller can light the photograph's own printed icons.
 */
export const interfaceStep = (f: number, dur: number, count = 5) => {
  const per = dur / count;
  const idx = Math.min(count - 1, Math.floor(f / per));
  const local = (f - idx * per) / per;
  const glow: number[] = [];
  for (let i = 0; i < count; i++) {
    if (i === idx) {
      // rise fast on arrival, hold, ease down just before handing over
      glow.push(Math.min(ramp(local, [0, 0.16], [0, 1]), ramp(local, [0.80, 1], [1, 0.34])));
    } else if (i === idx - 1) {
      glow.push(ramp(local, [0, 0.22], [0.34, 0]));
    } else {
      glow.push(0);
    }
  }
  // dolly push toward the ring, easing out so it never feels mechanical
  const push = easeOut(f, [0, dur], [1.0, 1.16]);
  return {idx, glow, push, local};
};

/**
 * FINISH SPLIT.
 *
 * Hard horizontal linear wipe between the matte nickel and black variants.
 * The two source frames are shot in the same pose, so a straight vertical
 * edge sweeping across reads as one instrument changing finish — establishing
 * them as equal peers, never as an upgrade path.
 *
 * Returns the wipe position as a percentage for a clip-path inset.
 */
export const finishWipe = (f: number, start: number, dur: number) => {
  const p = ease(f, [start, start + dur], [0, 1]);
  return {pct: p * 100, active: f >= start && f <= start + dur, p};
};

/** CSS transform string for a Cam. */
export const camStyle = (c: Cam): React.CSSProperties => ({
  transform: `translate3d(${c.x}px, ${c.y}px, 0) scale(${c.scale})`,
  filter: c.blur > 0.01 ? `blur(${c.blur}px)` : undefined,
});
