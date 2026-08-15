import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {BAND as L, C, SAFE} from '../lib/theme';
import {ease, holdFade, pop, ramp, stag, OVERLAP, segFade} from '../lib/anim';
import {AmbientBands, Band, Grid, Ground} from '../components/Stage';
import {FlexShot, GimbalShot} from '../components/Media';
import {SpecPill} from '../components/Diagram';
import {Body, Display, Kicker, Rule} from '../components/Type';

/**
 * S4 — THE STUDIO SET DIFFERENCE. 450 frames (15 s), 0:45–1:00.
 *
 * Brief Section 12: suspension-flex animations explaining the out-of-the-box
 * professional isolation of the EA 4 shockmount.
 *
 * NOTE ON PACKAGING. The brief's Section 4 marks the Studio Set enclosure
 * UNVERIFIED and states it must not be highlighted as an included feature.
 * Neumann's own order information lists the Studio Set as the microphone plus
 * the EA 4 (EA 4 bk on the black model). This scene therefore speaks only to
 * those two confirmed contents — no packaging of any kind is shown, implied or
 * narrated anywhere in this reel.
 *
 * Movements:
 *   A (0–180)   the EA 4 alone, flexing on its elastic bands
 *   B (180–310) the mount's construction, exploded
 *   C (310–450) the microphone suspended in it, isolated and ready
 *
 * Images: ea4-nickel, ea4-black, ea4-exploded, black-ea4-a, black-ea4-b,
 *         black-ea4-sm, nickel-stand.
 * Ambient: amb-c19 top, amb-b3 bottom.
 */
export const S4StudioSet: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const A = 180;
  const B = 130;
  const Cn = dur - A - B;

  return (
    <AbsoluteFill>
      <Ground tone="warm" />
      <AmbientBands top={["amb-c19", "amb-c12"]} bottom={["amb-b3", "amb-c13"]} dur={dur} intensity={0.8} drift={140} />
      <Grid opacity={0.28} />

      <Band y={L.kicker.y} h={L.kicker.h} opacity={1}>
        <Kicker color={C.accent}>What makes it the Studio Set</Kicker>
      </Band>

      <Sequence from={0} durationInFrames={A + OVERLAP} layout="none">
        <MovementA dur={A} />
      </Sequence>
      <Sequence from={A} durationInFrames={B + OVERLAP} layout="none">
        <MovementB dur={B} />
      </Sequence>
      <Sequence from={A + B} durationInFrames={Cn} layout="none">
        <MovementC dur={Cn} />
      </Sequence>
    </AbsoluteFill>
  );
};

/** The EA 4 alone, pivoting on its suspension. */
const MovementA: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const op = segFade(f, dur, 0, OVERLAP);
  const SWAP = Math.round(dur * 0.55);

  return (
    <div style={{opacity: op}}>
      <div style={{opacity: ramp(f, [SWAP - 14, SWAP + 2], [1, 0])}}>
        <FlexShot
          src="ea4-nickel"
          dur={dur}
          amp={3.0}
          x={SAFE.x + 60}
          y={L.media.y}
          w={SAFE.w - 120}
          h={L.media.h}
        />
      </div>
      <div style={{opacity: ramp(f, [SWAP - 12, SWAP + 6], [0, 1])}}>
        <FlexShot
          src="ea4-black"
          dur={dur - SWAP}
          amp={2.6}
          x={SAFE.x + 60}
          y={L.media.y}
          w={SAFE.w - 120}
          h={L.media.h}
        />
      </div>

      <Band y={L.head.y} h={L.head.h}>
        <Display size={80} weight={800} color={C.ink} lh={0.90}>
          {'THE EA 4 ELASTIC\nSUSPENSION'}
        </Display>
        <div style={{height: 12}} />
        <Body size={28} color={C.inkSoft}>
          Included with the Studio Set — nickel, or EA 4 bk in black.
        </Body>
      </Band>

      <Band y={L.foot.y} h={L.foot.h}>
        <Rule w={ease(f, [20, 56], [0, 110])} color={C.accent} thickness={5} />
        <div style={{height: 16}} />
        <Display size={54} weight={700} color={C.ink} lh={0.94}>
          {'MECHANICAL DECOUPLING,\nSTRAIGHT AWAY'}
        </Display>
      </Band>
    </div>
  );
};

/** The mount's construction. */
const MovementB: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const op = segFade(f, dur, OVERLAP, OVERLAP);

  return (
    <div style={{opacity: op}}>
      <GimbalShot
        src="ea4-exploded"
        dur={dur}
        amt={1.0}
        x={SAFE.x + 60}
        y={L.media.y}
        w={SAFE.w - 120}
        h={L.media.h}
      />

      <Band y={L.head.y} h={L.head.h}>
        <Display size={74} weight={800} color={C.ink} lh={0.90}>
          {'STRUCTURE-BORNE\nNOISE, STOPPED'}
        </Display>
        <div style={{height: 12}} />
        <Body size={27} color={C.inkSoft}>
          Floor vibration and low-frequency rumble never reach the capsule.
        </Body>
      </Band>

      <Band y={L.foot.y} h={L.foot.h}>
        <div style={{display: 'flex', gap: 14, flexWrap: 'wrap'}}>
          {[
            {k: 'Weight', v: '445', u: 'g'},
            {k: 'Diameter × length', v: '64 × 145', u: 'mm'},
            {k: 'Phantom power', v: '48', u: 'V'},
          ].map((s, i) => (
            <SpecPill key={s.k} k={s.k} v={s.v} u={s.u} p={pop(f, stag(i, 8, 30))} accent={C.steel} />
          ))}
        </div>
      </Band>
    </div>
  );
};

/** The instrument suspended and ready to work. */
const MovementC: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const op = segFade(f, dur, OVERLAP, 0);
  const SWAP = Math.round(dur * 0.50);

  return (
    <div style={{opacity: op}}>
      <div style={{opacity: ramp(f, [SWAP - 14, SWAP + 2], [1, 0])}}>
        <FlexShot
          src="black-ea4-a"
          dur={dur}
          amp={2.0}
          x={SAFE.x + 150}
          y={L.media.y}
          w={SAFE.w - 300}
          h={L.media.h}
        />
      </div>
      <div style={{opacity: ramp(f, [SWAP - 12, SWAP + 6], [0, 1])}}>
        <GimbalShot
          src="nickel-stand"
          dur={dur - SWAP}
          amt={0.8}
          x={SAFE.x + 180}
          y={L.media.y}
          w={SAFE.w - 360}
          h={L.media.h}
        />
      </div>

      {/* the two remaining EA 4 frames, held small and clear of the type */}
      <GimbalShot
        src="black-ea4-b"
        dur={dur}
        amt={0.5}
        x={SAFE.x}
        y={L.media.y + 210}
        w={200}
        h={200}
        opacity={ramp(f, [40, 66], [0, 0.94])}
      />
      <GimbalShot
        src="black-ea4-sm"
        dur={dur}
        amt={0.5}
        from={0.99}
        x={SAFE.x + SAFE.w - 200}
        y={L.media.y + 210}
        w={200}
        h={200}
        opacity={ramp(f, [52, 78], [0, 0.94])}
      />

      <Band y={L.head.y} h={L.head.h}>
        <Display size={78} weight={800} color={C.ink} lh={0.90}>
          {'ISOLATED FROM\nTHE FIRST TAKE'}
        </Display>
      </Band>

      <Band y={L.foot.y} h={L.foot.h}>
        <Rule w={90} color={C.accent} thickness={4} />
        <div style={{height: 14}} />
        {/* deliberately avoids the idiom "in the box" — no packaging language
            of any kind appears in this reel */}
        <Body size={27} color={C.inkSoft}>
          Professional vibration isolation, included as standard.
        </Body>
      </Band>
    </div>
  );
};
