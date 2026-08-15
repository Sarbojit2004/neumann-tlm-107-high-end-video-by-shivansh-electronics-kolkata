import React from 'react';
import {AbsoluteFill, Audio, Sequence, useCurrentFrame} from 'remotion';
import {C, SCENES, TOTAL_FRAMES, sceneStart} from './lib/theme';
import {bed, vo} from './lib/sfx';
import {loadFonts} from './lib/fonts';
import {Progress} from './components/Stage';
import {Cue, CueSteps} from './components/Cue';

import {S1Hook} from './scenes/S1Hook';
import {S2Patterns} from './scenes/S2Patterns';
import {S3Control} from './scenes/S3Control';
import {S4StudioSet} from './scenes/S4StudioSet';
import {S5Heritage} from './scenes/S5Heritage';
import {S6Cta} from './scenes/S6Cta';

loadFonts();

const S = Object.fromEntries(SCENES.map((s) => [s.id, {start: sceneStart(s.id), dur: s.dur}])) as Record<
  string,
  {start: number; dur: number}
>;

/**
 * THE AUDIO BED.
 *
 * Layer 1 is one continuous Audio spanning the whole composition — the fixed
 * supplied texture, already trimmed and levelled by scripts/gen_audio.py and
 * never touched further here. Layer 2 cues are placed at absolute frames
 * against the beats they belong to.
 *
 * Cue placement follows the brief's Section 10 mapping: damped mechanical
 * clicks on the navigation toggle, metallic grille resonances on scene
 * transitions, rubber elasticity on the EA 4 suspension.
 */
const AudioBed: React.FC = () => (
  <>
    {/* LAYER 1 — constant, unmodified, under everything */}
    <Audio src={bed()} volume={1} />

    {/* Silent placeholder; real narration is recorded separately */}
    <Audio src={vo()} volume={1} />

    {/* ---- LAYER 2 ---------------------------------------------------- */}

    {/* S1 — the macro pulls back and focus arrives */}
    <Cue name="grille-tap" at={S.S1.start + 2} volume={0.5} />
    <Cue name="focus-settle" at={S.S1.start + 92} volume={0.46} />
    <Cue name="grille-tap-hi" at={S.S1.start + 108} volume={0.34} />

    {/* S2 — the interface stepping, five LED advances per movement */}
    <Cue name="grille-shimmer" at={S.S2.start - 6} volume={0.34} />
    <CueSteps name="toggle-click" from={S.S2.start + 4} step={40} count={5} volume={0.46} />
    <CueSteps name="led-step" from={S.S2.start + 10} step={40} count={5} volume={0.30} />
    <Cue name="grille-tap-lo" at={S.S2.start + 200} volume={0.38} />
    <CueSteps name="led-step" from={S.S2.start + 226} step={62} count={5} volume={0.26} />
    <Cue name="grille-tap" at={S.S2.start + 470} volume={0.36} />
    <CueSteps name="toggle-click-soft" from={S.S2.start + 482} step={30} count={4} volume={0.40} />
    <Cue name="finish-wipe" at={S.S2.start + 568} volume={0.34} />

    {/* S3 — tactile control: pad and filter selections, then the figures */}
    <Cue name="grille-shimmer" at={S.S3.start - 6} volume={0.32} />
    <Cue name="toggle-click" at={S.S3.start + 20} volume={0.52} />
    <CueSteps name="toggle-click-soft" from={S.S3.start + 128} step={26} count={3} volume={0.44} />
    <CueSteps name="toggle-click-soft" from={S.S3.start + 232} step={26} count={3} volume={0.44} />
    <Cue name="spec-mark" at={S.S3.start + 318} volume={0.42} />
    <Cue name="spec-mark" at={S.S3.start + 356} volume={0.42} />
    <Cue name="grille-tap-hi" at={S.S3.start + 404} volume={0.30} />

    {/* S4 — the EA 4 suspension flexes */}
    <Cue name="grille-shimmer" at={S.S4.start - 6} volume={0.32} />
    <Cue name="rubber-stretch" at={S.S4.start + 26} volume={0.50} />
    <Cue name="rubber-settle" at={S.S4.start + 108} volume={0.40} />
    <Cue name="rubber-stretch" at={S.S4.start + 210} volume={0.42} />
    <Cue name="rubber-settle" at={S.S4.start + 286} volume={0.36} />
    <Cue name="focus-settle" at={S.S4.start + 350} volume={0.34} />

    {/* S5 — heritage, slower and airier */}
    <Cue name="grille-tap-lo" at={S.S5.start - 4} volume={0.34} />
    <Cue name="focus-settle" at={S.S5.start + 60} volume={0.36} />
    <Cue name="grille-tap" at={S.S5.start + 196} volume={0.30} />
    <Cue name="finish-wipe" at={S.S5.start + 268} volume={0.40} />
    <Cue name="grille-tap-hi" at={S.S5.start + 380} volume={0.28} />

    {/* S6 — the close */}
    <Cue name="grille-shimmer" at={S.S6.start - 8} volume={0.36} />
    <Cue name="focus-settle" at={S.S6.start + 40} volume={0.38} />
    <Cue name="spec-mark" at={S.S6.start + 150} volume={0.44} />
    <Cue name="outro-chime" at={S.S6.start + 236} volume={0.44} />
  </>
);

export const Reel: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{backgroundColor: C.paper}}>
      <AudioBed />

      <Sequence from={S.S1.start} durationInFrames={S.S1.dur} layout="none">
        <S1Hook dur={S.S1.dur} />
      </Sequence>
      <Sequence from={S.S2.start} durationInFrames={S.S2.dur} layout="none">
        <S2Patterns dur={S.S2.dur} />
      </Sequence>
      <Sequence from={S.S3.start} durationInFrames={S.S3.dur} layout="none">
        <S3Control dur={S.S3.dur} />
      </Sequence>
      <Sequence from={S.S4.start} durationInFrames={S.S4.dur} layout="none">
        <S4StudioSet dur={S.S4.dur} />
      </Sequence>
      <Sequence from={S.S5.start} durationInFrames={S.S5.dur} layout="none">
        <S5Heritage dur={S.S5.dur} />
      </Sequence>
      <Sequence from={S.S6.start} durationInFrames={S.S6.dur} layout="none">
        <S6Cta dur={S.S6.dur} />
      </Sequence>

      <Progress frame={f} total={TOTAL_FRAMES} />
    </AbsoluteFill>
  );
};
