import {C, F} from './theme';

/**
 * Geometry and chapter table for the 298-second LONG-FORM video.
 *
 * The palette (C) and type system (F) are imported wholesale from the reel's
 * theme rather than redefined, so the two deliverables read as one series —
 * same paper ground, same ink ramp, same crimson and steel accents, same
 * Barlow Condensed / Inter / JetBrains Mono stack. Only the geometry differs.
 *
 * FORMAT DIFFERENCES FROM THE REEL
 *
 *   canvas    1920x1080 landscape, not 1080x1920 portrait
 *   zones     none. There is no reserved caption box and no top/bottom
 *             exclusion band — content may use the full frame.
 *   padding   a deliberate 48px inset on the left and right edges for any
 *             critical text or callout, so nothing important is lost to a
 *             downstream crop or re-encode. Background and ambient imagery
 *             may still run to the true edge.
 */

export {C, F};

export const FPS = 30;
export const CANVAS = {w: 1920, h: 1080} as const;

/** 298.000 s at 30 fps. */
export const TOTAL_FRAMES = 8940;

/** Critical-content inset from the left and right edges. */
export const PAD = 48;

/** Vertical breathing room; not an exclusion zone, just a default margin. */
export const VPAD = 56;

/**
 * Height reserved along the bottom of the frame for the branding cadence.
 *
 * The branding overlays are mounted once at composition level so their timing
 * cannot drift, which means they render on top of whatever chapter is playing.
 * Without a reserved band the lower-thirds landed on chapter body copy and the
 * trio captions — a real collision seen in the first still pass. Reserving the
 * band and composing every beat inside SAFE.h makes that impossible.
 */
export const BRAND_BAND = 156;

/** The rect critical CONTENT composes against — excludes the branding band. */
export const SAFE = {
  x: PAD,
  y: VPAD,
  w: CANVAS.w - PAD * 2, // 1824
  h: CANVAS.h - VPAD * 2 - BRAND_BAND, // 812
} as const;

/** Full-height rect, for background and branding only. */
export const FULL = {
  x: PAD,
  y: VPAD,
  w: CANVAS.w - PAD * 2,
  h: CANVAS.h - VPAD * 2,
} as const;

/**
 * Standard landscape split: a text column on one side, media on the other.
 * Used by most explanatory chapters so the video has a consistent spine.
 */
export const SPLIT = {
  textW: 700,
  gap: 56,
  get mediaW() {
    return SAFE.w - this.textW - this.gap; // 1068
  },
} as const;

// ---------------------------------------------------------------------------
// CHAPTER TABLE — the single source of truth for long-form timing.
//
// Follows the creative brief's Section 12 allocation for the 298 s video
// exactly:
//   0:00-0:25   25s   750f  hook + the problem
//   0:25-1:15   50s  1500f  capsule + five-pattern deep dive
//   1:15-2:00   45s  1350f  engineering + interface
//   2:00-2:40   40s  1200f  the Studio Set difference (EA 4)
//   2:40-3:30   50s  1500f  heritage + finish
//   3:30-4:20   50s  1500f  transformation + proof
//   4:20-4:58   38s  1140f  outro, MOP and CTA
// Sums to 8940.
// ---------------------------------------------------------------------------
export type Chapter = {id: string; dur: number; label: string};

export const CHAPTERS: Chapter[] = [
  {id: 'C1', dur: 750, label: 'The versatility problem'},
  {id: 'C2', dur: 1500, label: 'The capsule and the five patterns'},
  {id: 'C3', dur: 1350, label: 'Engineering and the unified interface'},
  {id: 'C4', dur: 1200, label: 'The Studio Set difference — EA 4'},
  {id: 'C5', dur: 1500, label: 'Heritage and finish'},
  {id: 'C6', dur: 1500, label: 'Transformation and proof'},
  {id: 'C7', dur: 1140, label: 'Price, Authorized Partner and CTA'},
];

export const chapterStart = (id: string): number => {
  let f = 0;
  for (const c of CHAPTERS) {
    if (c.id === id) return f;
    f += c.dur;
  }
  return f;
};

export const totalDuration = (): number => CHAPTERS.reduce((a, c) => a + c.dur, 0);

/** Absolute start frame of every chapter, keyed by id. */
export const CH: Record<string, {start: number; dur: number}> = Object.fromEntries(
  CHAPTERS.map((c) => [c.id, {start: chapterStart(c.id), dur: c.dur}]),
);
