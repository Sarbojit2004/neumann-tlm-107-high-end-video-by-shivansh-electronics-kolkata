import React from 'react';
import {AbsoluteFill, Audio, Sequence, useCurrentFrame} from 'remotion';
import {C, CH, TOTAL_FRAMES} from './lib/lf-theme';
import {bedLongform, voLongform} from './lib/sfx';
import {loadFonts} from './lib/fonts';
import {LFBranding, LFProgress} from './components/lf/LFStage';
import {Cue, CueSteps} from './components/Cue';

import {C1Problem} from './scenes/lf/C1Problem';
import {C2Patterns} from './scenes/lf/C2Patterns';
import {C3Engineering} from './scenes/lf/C3Engineering';
import {C4StudioSet} from './scenes/lf/C4StudioSet';
import {C5Heritage} from './scenes/lf/C5Heritage';
import {C6Proof} from './scenes/lf/C6Proof';
import {C7Cta} from './scenes/lf/C7Cta';

loadFonts();

/**
 * THE LONG-FORM AUDIO BED.
 *
 * Layer 1 is the fixed supplied texture, looped to 298 s with a 3 s
 * equal-power crossfade by scripts/gen_audio.py and never touched further
 * here. Layer 2 cues are placed at absolute frames against the beats they
 * belong to.
 *
 * The palette is larger than the reel's: 22 cues instead of 13. At three and
 * a half times the runtime, the reel's thirteen alone would have become
 * audibly repetitive, so the extra nine add variation inside the same physical
 * vocabulary — damped mechanical clicks, thin metallic grille resonances,
 * rubber elasticity — and obey the same rule that nothing large or
 * low-frequency is allowed to muddy Layer 1.
 */
const AudioBed: React.FC = () => (
  <>
    {/* LAYER 1 — constant, unmodified, crossfade-looped to 298 s */}
    <Audio src={bedLongform()} volume={1} />

    {/* Silent placeholder; real narration is recorded separately */}
    <Audio src={voLongform()} volume={1} />

    {/* ---- C1  the problem ------------------------------------------- */}
    <Cue name="grille-tap" at={CH.C1.start + 3} volume={0.50} />
    <Cue name="focus-settle" at={CH.C1.start + 118} volume={0.44} />
    <Cue name="chapter-mark" at={CH.C1.start + 180} volume={0.34} />
    <Cue name="grille-tap-soft" at={CH.C1.start + 360} volume={0.40} />
    <Cue name="panel-slide" at={CH.C1.start + 372} volume={0.36} />
    <Cue name="grille-tap-mid" at={CH.C1.start + 555} volume={0.38} />
    <Cue name="air-lift" at={CH.C1.start + 566} volume={0.32} />

    {/* ---- C2  capsule and the five patterns -------------------------- */}
    <Cue name="chapter-mark" at={CH.C2.start - 6} volume={0.40} />
    <Cue name="grille-tap" at={CH.C2.start + 4} volume={0.36} />
    <Cue name="grille-shimmer" at={CH.C2.start + 200} volume={0.32} />
    <CueSteps name="toggle-click" from={CH.C2.start + 214} step={46} count={5} volume={0.46} />
    <CueSteps name="led-step" from={CH.C2.start + 222} step={46} count={5} volume={0.28} />
    <Cue name="pattern-morph" at={CH.C2.start + 452} volume={0.30} />
    {/* one soft click per pattern as the walk advances */}
    <CueSteps name="toggle-click-soft" from={CH.C2.start + 456} step={140} count={5} volume={0.42} />
    <CueSteps name="spec-tick" from={CH.C2.start + 470} step={140} count={5} volume={0.26} />
    <Cue name="grille-tap-lo" at={CH.C2.start + 1150} volume={0.36} />
    <Cue name="air-lift" at={CH.C2.start + 1160} volume={0.30} />

    {/* ---- C3  engineering and interface ------------------------------ */}
    <Cue name="chapter-mark" at={CH.C3.start - 6} volume={0.40} />
    <Cue name="focus-settle" at={CH.C3.start + 140} volume={0.36} />
    <Cue name="grille-tap-mid" at={CH.C3.start + 270} volume={0.36} />
    <CueSteps name="spec-mark" from={CH.C3.start + 292} step={40} count={3} volume={0.40} />
    <Cue name="grille-tap" at={CH.C3.start + 600} volume={0.34} />
    <Cue name="toggle-click-hard" at={CH.C3.start + 620} volume={0.50} />
    <Cue name="panel-slide" at={CH.C3.start + 900} volume={0.34} />
    <CueSteps name="toggle-click-soft" from={CH.C3.start + 916} step={28} count={3} volume={0.42} />
    <CueSteps name="toggle-click-soft" from={CH.C3.start + 948} step={28} count={3} volume={0.42} />
    <Cue name="grille-tap-soft" at={CH.C3.start + 1140} volume={0.36} />
    <Cue name="led-step" at={CH.C3.start + 1250} volume={0.30} />

    {/* ---- C4  the Studio Set / EA 4 ---------------------------------- */}
    <Cue name="chapter-mark" at={CH.C4.start - 6} volume={0.40} />
    <Cue name="rubber-stretch" at={CH.C4.start + 30} volume={0.50} />
    <Cue name="rubber-settle" at={CH.C4.start + 150} volume={0.38} />
    <Cue name="grille-tap-mid" at={CH.C4.start + 270} volume={0.34} />
    <Cue name="rubber-stretch" at={CH.C4.start + 300} volume={0.46} />
    <Cue name="rubber-short" at={CH.C4.start + 430} volume={0.38} />
    <Cue name="rubber-settle" at={CH.C4.start + 520} volume={0.34} />
    <Cue name="grille-tap-soft" at={CH.C4.start + 570} volume={0.34} />
    <Cue name="rubber-short" at={CH.C4.start + 700} volume={0.36} />
    <Cue name="panel-slide" at={CH.C4.start + 840} volume={0.34} />
    <CueSteps name="spec-tick" from={CH.C4.start + 856} step={26} count={3} volume={0.28} />

    {/* ---- C5  heritage and finish ------------------------------------ */}
    <Cue name="chapter-mark" at={CH.C5.start - 6} volume={0.40} />
    <Cue name="air-lift" at={CH.C5.start + 40} volume={0.32} />
    <Cue name="grille-tap-lo" at={CH.C5.start + 330} volume={0.34} />
    <Cue name="focus-settle" at={CH.C5.start + 360} volume={0.34} />
    <Cue name="grille-tap" at={CH.C5.start + 630} volume={0.34} />
    <Cue name="finish-wipe" at={CH.C5.start + 716} volume={0.44} />
    <Cue name="grille-tap-hi" at={CH.C5.start + 856} volume={0.30} />
    <Cue name="panel-slide" at={CH.C5.start + 1050} volume={0.32} />
    <Cue name="grille-tap-soft" at={CH.C5.start + 1064} volume={0.34} />

    {/* ---- C6  transformation and proof ------------------------------- */}
    <Cue name="chapter-mark" at={CH.C6.start - 6} volume={0.40} />
    <Cue name="grille-tap-mid" at={CH.C6.start + 8} volume={0.34} />
    <Cue name="panel-slide" at={CH.C6.start + 300} volume={0.34} />
    <CueSteps name="grille-tap-soft" from={CH.C6.start + 316} step={62} count={3} volume={0.32} />
    <Cue name="grille-tap" at={CH.C6.start + 720} volume={0.34} />
    <CueSteps name="spec-mark" from={CH.C6.start + 742} step={36} count={4} volume={0.38} />
    <Cue name="air-lift" at={CH.C6.start + 1078} volume={0.30} />
    <CueSteps name="spec-tick" from={CH.C6.start + 1096} step={13} count={12} volume={0.20} />

    {/* ---- C7  price and CTA ------------------------------------------ */}
    <Cue name="chapter-mark" at={CH.C7.start - 8} volume={0.42} />
    <Cue name="grille-tap" at={CH.C7.start + 6} volume={0.36} />
    <Cue name="focus-settle" at={CH.C7.start + 230} volume={0.40} />
    <Cue name="grille-tap-hi" at={CH.C7.start + 250} volume={0.30} />
    <Cue name="panel-slide" at={CH.C7.start + 366} volume={0.36} />
    <Cue name="spec-mark" at={CH.C7.start + 400} volume={0.44} />
    <Cue name="air-lift" at={CH.C7.start + 686} volume={0.32} />
    <Cue name="outro-chime" at={CH.C7.start + 706} volume={0.46} />
  </>
);

export const Longform: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{backgroundColor: C.paper}}>
      <AudioBed />

      <Sequence from={CH.C1.start} durationInFrames={CH.C1.dur} layout="none">
        <C1Problem dur={CH.C1.dur} />
      </Sequence>
      <Sequence from={CH.C2.start} durationInFrames={CH.C2.dur} layout="none">
        <C2Patterns dur={CH.C2.dur} />
      </Sequence>
      <Sequence from={CH.C3.start} durationInFrames={CH.C3.dur} layout="none">
        <C3Engineering dur={CH.C3.dur} />
      </Sequence>
      <Sequence from={CH.C4.start} durationInFrames={CH.C4.dur} layout="none">
        <C4StudioSet dur={CH.C4.dur} />
      </Sequence>
      <Sequence from={CH.C5.start} durationInFrames={CH.C5.dur} layout="none">
        <C5Heritage dur={CH.C5.dur} />
      </Sequence>
      <Sequence from={CH.C6.start} durationInFrames={CH.C6.dur} layout="none">
        <C6Proof dur={CH.C6.dur} />
      </Sequence>
      <Sequence from={CH.C7.start} durationInFrames={CH.C7.dur} layout="none">
        <C7Cta dur={CH.C7.dur} />
      </Sequence>

      {/* the branding cadence, mounted once so it cannot drift as scenes change */}
      <LFBranding />

      <LFProgress frame={f} total={TOTAL_FRAMES} />
    </AbsoluteFill>
  );
};
