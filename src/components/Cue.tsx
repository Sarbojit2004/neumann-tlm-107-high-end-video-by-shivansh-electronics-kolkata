import React from 'react';
import {Audio, Sequence} from 'remotion';
import {cue, CueName} from '../lib/sfx';

/**
 * Places one LAYER 2 cue at an absolute frame within the composition.
 *
 * Levels are deliberately modest. Layer 1 runs constantly underneath and its
 * composition is fixed, so these are mixed to cut through as precise physical
 * detail rather than to sit on top of the bed.
 */
export const Cue: React.FC<{
  name: CueName;
  at: number;
  volume?: number;
}> = ({name, at, volume = 0.5}) => (
  <Sequence from={at} durationInFrames={90} layout="none">
    <Audio src={cue(name)} volume={volume} />
  </Sequence>
);

/** Several cues of one kind on a regular step — used for LED stepping. */
export const CueSteps: React.FC<{
  name: CueName;
  from: number;
  step: number;
  count: number;
  volume?: number;
}> = ({name, from, step, count, volume = 0.42}) => (
  <>
    {Array.from({length: count}).map((_, i) => (
      <Cue key={i} name={name} at={Math.round(from + i * step)} volume={volume} />
    ))}
  </>
);
