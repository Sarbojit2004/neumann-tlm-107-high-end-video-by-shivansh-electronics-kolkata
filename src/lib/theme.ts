// Design tokens for the Neumann TLM 107 Studio Set reel.
//
// LIGHT BACKGROUND, FULL-FRAME SAFE-ZONE LAYOUT.
//
// The canvas is 1080x1920 and content is composed across the WHOLE frame --
// there is no reserved dead central square. An Instagram-style safe zone
// governs where critical content may live:
//
//     0    .. 250   ambient only (no text, no key detail)
//     250  .. 1580  PRIMARY SAFE AREA -- headline, hero, spec callouts, CTA
//     1580 .. 1920  ambient only
//     72px side margins on both edges
//
// The 1080x1330 inner box (y 250..1580, inset 72px) must survive cropping on
// any device, so real content biases slightly upward inside it.
//
// PALETTE. The brief's Section 6 asks for a light-colour environment with
// high-contrast edge lighting: sharp, distinct metallic reflections so the
// matte nickel reads premium against light, and deep rich blacks retained so
// the black finish and its status LEDs stay punchy. The ground is therefore a
// cool, sterile high-key paper -- close to a photographic sweep -- and all
// type is dark-on-light. Contrast ratios against `paper` are noted per token
// and were computed, not estimated (WCAG AA floor 4.5:1; every text token
// clears it and most clear AAA 7:1).

export const FPS = 30;
export const CANVAS = {w: 1080, h: 1920} as const;

/** 88.000 s at 30 fps. */
export const TOTAL_FRAMES = 2640;

/** Instagram / social safe-zone geometry. */
export const ZONE = {
  topAmbientEnd: 250,
  bottomAmbientStart: 1580,
  margin: 72,
} as const;

/** The primary safe content rect. Nothing critical may leave it. */
export const SAFE = {
  x: ZONE.margin,
  y: ZONE.topAmbientEnd,
  w: CANVAS.w - ZONE.margin * 2, // 936
  h: ZONE.bottomAmbientStart - ZONE.topAmbientEnd, // 1330
} as const;

export const C = {
  // -- light ground ------------------------------------------------------
  paper: '#F2F4F7', // base canvas -- cool, sterile, not pure white
  paperHi: '#FAFBFC', // raised plate / card
  paperDeep: '#E2E7EE', // recessed, ambient zones
  paperEdge: '#D2D9E2', // ambient zone falloff
  line: '#C3CCD8', // hairline rules
  lineSoft: '#DDE3EA',

  // -- ink (all verified on `paper`) -------------------------------------
  ink: '#0B1016', // 17.33:1  headlines
  inkSoft: '#2C3947', // 10.69:1  body
  inkDim: '#4E5C6E', //  6.19:1  micro callouts

  // -- accents -----------------------------------------------------------
  // Deep studio crimson. It echoes the red badge already physically present
  // on the microphone in the photography -- it is a palette colour only, not
  // a reproduction of any logo mark.
  accent: '#9C1218', //  7.58:1
  accentSoft: '#F6E3E4',
  // Cool instrument blue, used for the interface / pattern graphics.
  steel: '#0D4A72', //  8.51:1
  steelSoft: '#DCE9F3',

  // For the rare places type sits on the dark ink plate. The light-ground
  // accents above are unreadable there; these clear 7.9:1 or better.
  accentOnDark: '#F08A8E', //  7.94:1 on ink
  steelOnDark: '#86B9E8', //  9.20:1 on ink

  ok: '#0B6B37', //  6.01:1
  screen: '#0B1016', // dark plate that dark-background photos sit on
} as const;

/**
 * Type system ported structurally from the completed TASCAM Sonicview reel
 * project (src/lib/fonts.ts + src/components/Type.tsx), which in turn
 * inherited it from the MOTU UltraLite-mk5 / 828 reel: Barlow Condensed
 * 600/700/800 for display, Inter variable for UI/body, JetBrains Mono
 * variable for technical figures. The woff2 files are copied verbatim and
 * vendored under public/fonts. Only the colour values are re-derived here for
 * this project's light ground.
 *
 * Mapped onto the brief's Section 8 hierarchy:
 *   Display -> headline claims  (product name + defining feature)
 *   Sub     -> subheadline      (why it matters to the workflow)
 *   Spec    -> spec callouts    (monospaced, VERIFIED figures only)
 *   Micro   -> micro callouts   (line-called labels on physical features)
 */
export const F = {
  display: '"BarlowCondensed", "Arial Narrow", sans-serif',
  ui: '"Inter", system-ui, sans-serif',
  mono: '"JetBrainsMono", ui-monospace, monospace',
} as const;

/**
 * LAYOUT BANDS — canvas-absolute y positions, all inside the 250..1580 safe
 * area, that every scene composes against.
 *
 * Bands exist because the first layout pass positioned headlines relative to
 * the bottom of the safe area and media relative to the top, which let dark
 * type land on dark photographs in three scenes. Declaring the bands once and
 * never overlapping them makes that class of collision impossible: text lives
 * in `kicker`, `head` and `foot`, imagery lives in `media`, and nothing
 * crosses a boundary.
 *
 * Two variants, both ending clear of 1580:
 *   standard — a full headline block over a 660px media band
 *   tall     — a shorter headline over an 830px media band, for scenes whose
 *              subject is the photograph itself
 */
export const BAND = {
  kicker: {y: 262, h: 34},
  head: {y: 312, h: 250},
  media: {y: 592, h: 660},
  foot: {y: 1278, h: 294}, // ends 1572
} as const;

export const BAND_TALL = {
  kicker: {y: 262, h: 34},
  head: {y: 312, h: 168},
  media: {y: 506, h: 830},
  foot: {y: 1360, h: 212}, // ends 1572
} as const;

// ---------------------------------------------------------------------------
// SCENE TABLE -- the single source of truth for timing.
// Follows the brief's Section 12 allocation for the 88 s reel exactly:
//   0:00-0:08  hook            8s   240f
//   0:08-0:30  pattern         22s  660f   <- largest, the #1 priority feature
//   0:30-0:45  control/build   15s  450f
//   0:45-1:00  Studio Set      15s  450f
//   1:00-1:15  heritage        15s  450f
//   1:15-1:28  beauty + CTA    13s  390f
// Sums to 2640.
// ---------------------------------------------------------------------------
export type Scene = {id: string; dur: number; label: string};

export const SCENES: Scene[] = [
  {id: 'S1', dur: 240, label: 'Hook — macro-to-reveal of the headgrille'},
  {id: 'S2', dur: 660, label: 'Five polar patterns — interface sequence'},
  {id: 'S3', dur: 450, label: 'Control & build — toggle, pad, filter, SPL'},
  {id: 'S4', dur: 450, label: 'The Studio Set difference — EA 4'},
  {id: 'S5', dur: 450, label: 'Heritage — M 49 lineage, capsule'},
  {id: 'S6', dur: 390, label: 'Beauty shot, MOP & Authorized Partner CTA'},
];

export const sceneStart = (id: string): number => {
  let f = 0;
  for (const s of SCENES) {
    if (s.id === id) return f;
    f += s.dur;
  }
  return f;
};

export const totalDuration = (): number => SCENES.reduce((a, s) => a + s.dur, 0);
