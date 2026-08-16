import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {BAND as L, C, SAFE} from '../lib/theme';
import {ease, gimbal, holdFade, interfaceStep, ramp, OVERLAP, segFade} from '../lib/anim';
import {AmbientBands, Band, Grid, Ground} from '../components/Stage';
import {GimbalShot, Shot} from '../components/Media';
import {InterfaceOverlay, PolarDiagram} from '../components/Diagram';
import {Body, Display, Kicker, Micro, Rule, Spec} from '../components/Type';
import {PATTERNS} from '../lib/copy';

/**
 * S2 — PATTERN VERSATILITY. 660 frames (22 s), 0:08–0:30.
 *
 * The largest single allocation in the reel, matching the brief's Section 3
 * priority ranking: five-pattern versatility is the primary engine of the
 * product's value. Section 12 asks this block to cycle the five patterns using
 * the interface UI sequence and cement "one microphone adapts to any source".
 *
 * Three movements:
 *   A (0–200)   the rear interface itself, LED stepping across the printed
 *               pattern icons on the chrome ring — the Interface Sequence
 *   B (200–470) the generated polar diagram, morphing through the family
 *   C (470–660) the black finish's interface, then both finishes together
 *
 * Images: rear-nickel, polar-diagram, rear-black, nickel-tall, black-front.
 * Ambient: amb-c05 top, amb-c18 bottom.
 */
export const S2Patterns: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const A = 200;
  const B = 270;
  const Cn = dur - A - B;

  return (
    <AbsoluteFill>
      <Ground tone="cool" />
      <AmbientBands top={["amb-c05", "amb-c06"]} bottom={["amb-c18", "amb-c04"]} dur={dur} intensity={0.85} drift={40} />
      <Grid opacity={0.3} />

      <Band y={L.kicker.y} h={L.kicker.h} opacity={1}>
        <Kicker color={C.steel}>One capsule pair · Five acoustic answers</Kicker>
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

/** The rear chrome ring, with the microphone's own printed icons lighting. */
const MovementA: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const {idx, push} = interfaceStep(f, dur, 5);
  const op = segFade(f, dur, 0, OVERLAP);

  // fit the 1500x1126 rear frame inside the media band without cropping the
  // chrome ring, which is the whole point of this beat
  const H = L.media.h - 40;
  const W = Math.round((H * 1500) / 1126);

  return (
    <div style={{opacity: op}}>
      <Shot
        src="rear-nickel"
        x={(1080 - W) / 2}
        y={L.media.y + 20}
        w={W}
        h={H}
        cam={{scale: push, x: 0, y: 0, blur: 0}}
        fit="cover"
        radius={22}
      >
        <InterfaceOverlay dur={dur} w={W} h={H} />
      </Shot>

      <Band y={L.head.y} h={L.head.h}>
        <Display size={82} weight={800} color={C.ink} lh={0.90}>
          {'FIVE POLAR\nPATTERNS'}
        </Display>
        <div style={{height: 12}} />
        <Body size={28} color={C.inkSoft}>
          One rear navigation toggle steps the whole set.
        </Body>
      </Band>

      {/* the pattern name tracks the lit icon */}
      <Band y={L.foot.y} h={L.foot.h}>
        <Rule w={70} color={C.steel} thickness={4} />
        <div style={{height: 14}} />
        <Display size={58} weight={700} color={C.steel} lh={0.94}>
          {PATTERNS[idx].name}
        </Display>
        <div style={{height: 8}} />
        <Micro size={19} color={C.inkDim} tracking={2.8}>
          {PATTERNS[idx].use}
        </Micro>
      </Band>
    </div>
  );
};

/** The generated vector diagram morphing continuously through the family. */
const MovementB: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const op = segFade(f, dur, OVERLAP, OVERLAP);
  const t = ease(f, [10, dur - 24], [0, 4]);
  const idx = Math.max(0, Math.min(4, Math.round(t)));
  const size = 560;

  return (
    <div style={{opacity: op}}>
      <Band y={L.head.y} h={L.head.h}>
        <Display size={76} weight={800} color={C.ink} lh={0.90}>
          {'TUNE THE ROOM OUT —\nNOT THE CHARACTER'}
        </Display>
      </Band>

      {/* the generated vector diagram, morphing */}
      <div
        style={{
          position: 'absolute',
          left: SAFE.x - 20,
          top: L.media.y + 10,
          width: size,
          height: size,
        }}
      >
        <PolarDiagram t={t} size={size} />
      </div>

      {/* the manufacturer's own measured polar response, alongside it —
          the vector morph explains the idea, this is the evidence */}
      <Shot
        src="polar-diagram"
        x={SAFE.x + size + 4}
        y={L.media.y + 40}
        w={SAFE.w - size - 4}
        h={SAFE.w - size - 4}
        cam={gimbal(f, dur, 0.5)}
        fit="contain"
        radius={12}
        opacity={ramp(f, [26, 58], [0, 1])}
      />
      <Micro
        size={15}
        color={C.inkDim}
        tracking={2.2}
        style={{
          position: 'absolute',
          left: SAFE.x + size + 8,
          top: L.media.y + 48 + (SAFE.w - size - 4),
          opacity: ramp(f, [40, 70], [0, 1]),
        }}
      >
        Measured response
      </Micro>

      <Band y={L.foot.y} h={L.foot.h}>
        <Display size={56} weight={700} color={C.steel} lh={0.94}>
          {PATTERNS[idx].name}
        </Display>
        <div style={{height: 10}} />
        <Spec size={22} color={C.inkSoft} tracking={1.4}>
          Balanced frequency response across all five
        </Spec>
      </Band>
    </div>
  );
};

/** The black finish's interface, resolving to both finishes together. */
const MovementC: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const op = segFade(f, dur, OVERLAP, 0);
  const SWAP = Math.round(dur * 0.52);

  const H = L.media.h - 60;
  const W = Math.round((H * 1500) / 1126);

  const aOp = ramp(f, [SWAP - 14, SWAP + 4], [1, 0]);
  const bOp = ramp(f, [SWAP - 12, SWAP + 8], [0, 1]);

  return (
    <div style={{opacity: op}}>
      <div style={{opacity: aOp}}>
        <Shot
          src="rear-black"
          x={(1080 - W) / 2}
          y={L.media.y + 30}
          w={W}
          h={H}
          cam={gimbal(f, dur, 0.85)}
          fit="cover"
          radius={22}
        >
          <InterfaceOverlay dur={SWAP} w={W} h={H} />
        </Shot>
      </div>

      <div style={{opacity: bOp}}>
        <GimbalShot
          src="nickel-tall"
          dur={dur}
          amt={0.7}
          x={SAFE.x + 30}
          y={L.media.y}
          w={400}
          h={L.media.h}
        />
        <GimbalShot
          src="black-front"
          dur={dur}
          amt={0.7}
          from={0.98}
          x={SAFE.x + 500}
          y={L.media.y + 30}
          w={400}
          h={L.media.h - 60}
        />
      </div>

      <Band y={L.head.y} h={L.head.h}>
        <Display size={78} weight={800} color={C.ink} lh={0.90}>
          {'ONE MICROPHONE.\nANY SOURCE.'}
        </Display>
      </Band>

      <Band y={L.foot.y} h={L.foot.h} opacity={bOp}>
        <Rule w={80} color={C.steel} thickness={4} />
        <div style={{height: 14}} />
        <Body size={27} color={C.inkSoft}>
          Room ambience, a close vocal, or two players facing each other.
        </Body>
      </Band>
    </div>
  );
};
