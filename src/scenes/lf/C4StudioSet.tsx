import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {C} from '../../lib/lf-theme';
import {LFAmbient, LFGrid, LFGround} from '../../components/lf/LFStage';
import {HeroBeat, SplitBeat, TrioBeat, OVERLAP} from '../../components/lf/LFLayouts';

/**
 * C4 — THE STUDIO SET DIFFERENCE. 1200 frames (40 s), 2:00–2:40.
 *
 * Brief Section 12: why the EA 4 shockmount matters specifically for project
 * and broadcast studios dealing with structural rumble.
 *
 * NOTE ON PACKAGING. The brief's Section 4 marks the Studio Set enclosure
 * UNVERIFIED and states it must not be highlighted as an included feature.
 * Neumann's own order information lists the Studio Set as the microphone plus
 * the EA 4 (EA 4 bk on the black model). This chapter speaks only to those two
 * confirmed contents — no packaging of any kind is shown, implied or narrated
 * anywhere in this video, and the word "box" appears nowhere.
 *
 *   b1  270  what the Studio Set actually is
 *   b2  300  the mount, flexing on its bands — Suspension Flex
 *   b3  270  what structure-borne noise actually does to a take
 *   b4  360  the instrument suspended and ready, both finishes
 *
 * Images: ea4-nickel, ea4-black, ea4-exploded, black-ea4-a, black-ea4-b,
 *         black-ea4-sm, nickel-stand.
 * Ambient: amb-c10, amb-c11, amb-c12, amb-b3.
 */
export const C4StudioSet: React.FC<{dur: number}> = ({dur}) => {
  const b1 = 270;
  const b2 = 300;
  const b3 = 270;
  const b4 = dur - b1 - b2 - b3; // 360

  return (
    <AbsoluteFill>
      <LFGround tone="warm" />
      <LFAmbient
        plates={['amb-c10', 'amb-c11', 'amb-c12', 'amb-b3']}
        dur={dur}
        intensity={0.76}
        drift={180}
      />
      <LFGrid opacity={0.28} />

      <Sequence from={0} durationInFrames={b1 + OVERLAP} layout="none">
        <SplitBeat
          dur={b1}
          side="right"
          kicker="What makes it the Studio Set"
          headline={'THE EA 4 ELASTIC\nSUSPENSION,\nINCLUDED'}
          body={
            'The Studio Set pairs the microphone with Neumann’s own EA 4 elastic ' +
            'shockmount — EA 4 bk on the black model. It is the difference between ' +
            'a microphone you can use professionally today and one you still have ' +
            'to finish buying.'
          }
          src="ea4-nickel"
          cam="flex"
          headSize={62}
        />
      </Sequence>

      <Sequence from={b1} durationInFrames={b2 + OVERLAP} layout="none">
        <HeroBeat
          dur={b2}
          src="ea4-black"
          cam="flex"
          mediaW={820}
          headline={'SUSPENDED, NOT BOLTED'}
          sub={'The microphone rides on elastic bands, mechanically decoupled from the stand it sits on.'}
          textAt="bottom"
        />
      </Sequence>

      <Sequence from={b1 + b2} durationInFrames={b3 + OVERLAP} layout="none">
        <SplitBeat
          dur={b3}
          side="left"
          kickerColor={C.steel}
          kicker="The noise you cannot EQ out afterwards"
          headline={'FOOTSTEPS. TRAFFIC.\nTHE BUILDING ITSELF.'}
          body={
            'Structure-borne vibration travels up the stand and straight into the ' +
            'capsule, where it lands under the take as low-frequency rumble. The ' +
            'EA 4 stops it mechanically, before it is ever recorded.'
          }
          spec={[
            {k: 'Weight', v: '445', u: 'g'},
            {k: 'Diameter × length', v: '64 × 145', u: 'mm'},
          ]}
          src="ea4-exploded"
          headSize={60}
        />
      </Sequence>

      <Sequence from={b1 + b2 + b3} durationInFrames={b4} layout="none">
        <TrioBeat
          dur={b4}
          headline={'READY FROM THE FIRST TAKE'}
          sub={'Nickel or black — the same instrument, the same isolation, nothing else to buy.'}
          srcs={['nickel-stand', 'black-ea4-a', 'black-ea4-b']}
          captions={['Matte nickel, EA 4', 'Black, EA 4 bk', 'On the stand']}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
