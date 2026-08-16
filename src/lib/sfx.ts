import {staticFile} from 'remotion';

/**
 * SOUND DESIGN -- the brief's Section 10 two-layer structure.
 *
 * LAYER 1 is the fixed, pre-supplied background texture that runs constantly
 * beneath the whole 88 s. It is `sound-effects/ES_Moment - Christoffer Moe
 * Ditlevsen.mp3`, a finished creative input. scripts/gen_audio.py only trims
 * it to length and applies one constant gain plus end fades -- its
 * composition is never edited, layered over, or substituted, and because the
 * source runs 252 s it is never looped either. scripts/audit_audio.py
 * re-verifies that integrity numerically on every run.
 *
 * LAYER 2 is the palette below. Every cue is synthesised from scratch by
 * scripts/gen_audio.py with numpy/scipy. No ElevenLabs, no external audio
 * service, and nothing from the video toolkit's bundled SFX tooling.
 *
 * The palette is deliberately narrow and HIGH-FREQUENCY. Section 10 rules out
 * large cinematic low-frequency whooshes outright -- they would muddy Layer 1
 * -- so every cue here is a precise physical sound and the audit fails any
 * cue putting more than 8% of its energy below 300 Hz.
 */
export const CUE = {
  // -- the rear navigation micro-joystick: soft, damped mechanical clicks
  'toggle-click': 'audio/sfx/toggle-click.mp3',
  'toggle-click-soft': 'audio/sfx/toggle-click-soft.mp3',
  'led-step': 'audio/sfx/led-step.mp3',

  // -- scene transitions: gentle finger-tap on a rigid woven mesh grille
  'grille-tap': 'audio/sfx/grille-tap.mp3',
  'grille-tap-hi': 'audio/sfx/grille-tap-hi.mp3',
  'grille-tap-lo': 'audio/sfx/grille-tap-lo.mp3',
  'grille-shimmer': 'audio/sfx/grille-shimmer.mp3',

  // -- the EA 4 suspension: tight, faint thick-rubber elasticity
  'rubber-stretch': 'audio/sfx/rubber-stretch.mp3',
  'rubber-settle': 'audio/sfx/rubber-settle.mp3',

  // -- optical / editorial marks
  'focus-settle': 'audio/sfx/focus-settle.mp3',
  'finish-wipe': 'audio/sfx/finish-wipe.mp3',
  'spec-mark': 'audio/sfx/spec-mark.mp3',
  'outro-chime': 'audio/sfx/outro-chime.mp3',
} as const;

export type CueName = keyof typeof CUE;

export const cue = (n: CueName): string => staticFile(CUE[n]);

/** Layer 1 -- the fixed supplied bed. */
export const BED = 'audio/bed-layer1.mp3';
export const bed = (): string => staticFile(BED);

/** Silent placeholder; the real narration is recorded separately. */
export const VO = 'vo/voiceover-reel.mp3';
export const vo = (): string => staticFile(VO);
