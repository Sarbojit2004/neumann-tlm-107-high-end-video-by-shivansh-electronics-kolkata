import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {C} from '../../lib/lf-theme';
import {LFAmbient, LFGrid, LFGround} from '../../components/lf/LFStage';
import {HeroBeat, SplitBeat, TitleBeat, TrioBeat, OVERLAP} from '../../components/lf/LFLayouts';

/**
 * C1 — THE VERSATILITY PROBLEM. 750 frames (25 s), 0:00–0:25.
 *
 * Brief Section 12: open on the frustration and the financial and spatial
 * drain of needing multiple single-purpose microphones — establish why
 * versatility is the whole story before the product is introduced at all.
 *
 * Four beats, none holding longer than ~8 s, so nothing overstays:
 *   b1  180  the macro hook — grille and badge, macro-to-full-reveal
 *   b2  180  the problem stated
 *   b3  195  what the compromise actually costs, in real rooms
 *   b4  195  the turn — one instrument instead
 *
 * Images: macro-grille (hero reveal), room-real, nickel-patchbay, nickel-front.
 * Ambient: amb-c01, amb-c02, amb-b1.
 */
export const C1Problem: React.FC<{dur: number}> = ({dur}) => {
  const b1 = 180;
  const b2 = 180;
  const b3 = 195;
  const b4 = dur - b1 - b2 - b3; // 195

  return (
    <AbsoluteFill>
      <LFGround tone="cool" />
      <LFAmbient plates={['amb-c01', 'amb-c02', 'amb-b1']} dur={dur} intensity={0.8} />
      <LFGrid opacity={0.3} />

      <Sequence from={0} durationInFrames={b1 + OVERLAP} layout="none">
        <HeroBeat
          dur={b1}
          src="macro-grille"
          cam="reveal"
          focus={{x: 0.44, y: 0.46}}
          zoom={3.2}
          fit="cover"
          mediaW={1240}
          headline={'ONE MICROPHONE\nFOR EVERY SOURCE'}
          textAt="bottom"
        />
      </Sequence>

      <Sequence from={b1} durationInFrames={b2 + OVERLAP} layout="none">
        <TitleBeat
          dur={b2}
          kicker="The problem every studio knows"
          headline={'DIFFERENT SOURCES DEMAND\nDIFFERENT POLAR RESPONSES'}
          sub={
            'So the usual answer is a locker full of single-pattern microphones — ' +
            'each one excellent at exactly one job, and idle the rest of the week.'
          }
          size={68}
        />
      </Sequence>

      <Sequence from={b1 + b2} durationInFrames={b3 + OVERLAP} layout="none">
        <SplitBeat
          dur={b3}
          side="right"
          kicker="What the compromise costs"
          headline={'A FIXED PATTERN\nMAKES THE CHOICE\nFOR YOU'}
          body={
            'Too much room on an intimate take. Too much bleed when two players ' +
            'face each other. Too much proximity effect up close — and no way to ' +
            'tune any of it without changing hardware.'
          }
          src="room-real"
          fit="cover"
          headSize={64}
        />
      </Sequence>

      <Sequence from={b1 + b2 + b3} durationInFrames={b4} layout="none">
        <SplitBeat
          dur={b4}
          side="left"
          kickerColor={C.steel}
          kicker="The alternative"
          headline={'ONE STUDIO-GRADE\nINSTRUMENT INSTEAD'}
          body={
            'The Neumann TLM 107 Studio Set puts five polar patterns, a full pad ' +
            'and filter set, and professional isolation into a single microphone — ' +
            'so the room adapts to the session, not the other way round.'
          }
          src="nickel-front"
          headSize={64}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
