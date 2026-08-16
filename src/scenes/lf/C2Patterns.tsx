import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {C, F, SAFE, SPLIT} from '../../lib/lf-theme';
import {ease, gimbal, interfaceStep, ramp} from '../../lib/anim';
import {LFAmbient, LFBlock, LFGrid, LFGround} from '../../components/lf/LFStage';
import {beatFade, HeroBeat, SplitBeat, TitleBeat, OVERLAP} from '../../components/lf/LFLayouts';
import {Shot} from '../../components/Media';
import {InterfaceOverlay, PolarDiagram} from '../../components/Diagram';
import {Body, Display, Kicker, Micro, Rule, Spec} from '../../components/Type';
import {PATTERNS} from '../../lib/copy';

/**
 * C2 — THE CAPSULE AND THE FIVE PATTERNS. 1500 frames (50 s), 0:25–1:15.
 *
 * The longest chapter, matching the brief's own priority ranking: five-pattern
 * versatility is the primary engine of the product's value.
 *
 * Where the reel had to cycle the five patterns quickly, this chapter gives
 * each one its own beat with a genuine use case, which is exactly what the
 * long-form format earns.
 *
 *   b1  210  the capsule itself
 *   b2  240  the rear interface, LEDs stepping — Interface Sequence
 *   b3  700  the five patterns, one at a time, each with its own use
 *   b4  350  what the versatility actually buys you
 *
 * Images: mesh-abstract, rear-nickel, polar-diagram, rear-black, nickel-tall.
 * Ambient: amb-c03, amb-c04, amb-c05, amb-c06.
 */
export const C2Patterns: React.FC<{dur: number}> = ({dur}) => {
  const b1 = 210;
  const b2 = 240;
  const b3 = 700;
  const b4 = dur - b1 - b2 - b3; // 350

  return (
    <AbsoluteFill>
      <LFGround tone="cool" />
      <LFAmbient
        plates={['amb-c03', 'amb-c04', 'amb-c05', 'amb-c06']}
        dur={dur}
        intensity={0.78}
        drift={60}
      />
      <LFGrid opacity={0.3} />

      <Sequence from={0} durationInFrames={b1 + OVERLAP} layout="none">
        <SplitBeat
          dur={b1}
          side="right"
          kicker="Inside the instrument"
          headline={'AN EDGE-TERMINATED\nDUAL-DIAPHRAGM\nCAPSULE'}
          body={
            'Two diaphragms, both resting at ground voltage. Balancing them against ' +
            'each other is what produces every pattern the microphone offers — one ' +
            'transducer, continuously re-weighted.'
          }
          spec={[{k: 'Frequency range', v: '20 Hz – 20 kHz'}]}
          src="mesh-abstract"
          fit="cover"
          headSize={62}
        />
      </Sequence>

      <Sequence from={b1} durationInFrames={b2 + OVERLAP} layout="none">
        <InterfaceBeat dur={b2} />
      </Sequence>

      <Sequence from={b1 + b2} durationInFrames={b3 + OVERLAP} layout="none">
        <PatternWalk dur={b3} />
      </Sequence>

      <Sequence from={b1 + b2 + b3} durationInFrames={b4} layout="none">
        <SplitBeat
          dur={b4}
          side="left"
          kickerColor={C.steel}
          kicker="What that adds up to"
          headline={'TUNE THE ROOM OUT.\nKEEP THE CHARACTER.'}
          body={
            'The response stays balanced across all five patterns, so changing how ' +
            'much room you capture never changes how the source itself sounds. That ' +
            'is the part a locker of separate microphones cannot give you.'
          }
          src="nickel-tall"
          headSize={62}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

/** The rear ring, with the microphone's own printed icons lighting in turn. */
const InterfaceBeat: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const p = beatFade(f, dur);
  const {idx, push} = interfaceStep(f, dur, 5);

  const W = SPLIT.mediaW;
  const H = Math.round((W * 1126) / 1500);

  return (
    <div style={{opacity: p}}>
      <Shot
        src="rear-nickel"
        x={SAFE.x + SPLIT.textW + SPLIT.gap}
        y={SAFE.y + (SAFE.h - H) / 2}
        w={W}
        h={H}
        fit="cover"
        radius={22}
        cam={{scale: push, x: 0, y: 0, blur: 0}}
      >
        <InterfaceOverlay dur={dur} w={W} h={H} />
      </Shot>

      <LFBlock x={0} y={0} w={SPLIT.textW} h={SAFE.h} justify="center">
        <Kicker color={C.steel} size={22} tracking={3.4}>
          Selected from the rear
        </Kicker>
        <div style={{height: 18}} />
        <Display size={68} weight={800} color={C.ink} lh={0.92}>
          {'FIVE PATTERNS,\nONE TOGGLE'}
        </Display>
        <div style={{height: 24}} />
        <Rule w={104} color={C.steel} thickness={5} />
        <div style={{height: 24}} />
        <Display size={50} weight={700} color={C.steel} lh={0.96}>
          {PATTERNS[idx].name}
        </Display>
        <div style={{height: 10}} />
        <Micro size={20} color={C.inkDim} tracking={2.6}>
          {PATTERNS[idx].use}
        </Micro>
      </LFBlock>
    </div>
  );
};

/**
 * The five patterns walked one at a time — the beat the reel had no room for.
 *
 * Each gets the generated vector diagram morphing to its own shape, its name,
 * and a genuine working use drawn from the brief's Section 3 research rather
 * than a generic label.
 */
const USES: {title: string; body: string}[] = [
  {
    title: 'THE ROOM, INCLUDED',
    body: 'No proximity effect at all, and the flattest low end of the five. The pattern for a room that deserves to be heard — or a performer who moves.',
  },
  {
    title: 'A SOURCE WITH AIR',
    body: 'Cardioid rejection loosened slightly. Useful when a single voice needs to sit in its space rather than in front of it.',
  },
  {
    title: 'THE EVERYDAY WORKHORSE',
    body: 'Rejects what is behind it. The default for close vocals, spoken word and any source you want isolated from the rest of the room.',
  },
  {
    title: 'MAXIMUM SEPARATION',
    body: 'The tightest forward lobe. Where two sources are close together and the bleed between them has to go.',
  },
  {
    title: 'TWO SOURCES, ONE MIC',
    body: 'Equal front and rear, dead to the sides. An interview across a table, or the side channel of a Mid/Side pair.',
  },
];

const PatternWalk: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const p = beatFade(f, dur);
  const per = dur / 5;
  const i = Math.min(4, Math.floor(f / per));
  const local = f - i * per;
  const t = ease(f, [8, dur - 20], [0, 4]);

  // each pattern's card fades in and out inside its own slot
  const cardP = Math.min(
    ramp(local, [0, 14], [0, 1]),
    ramp(local, [per - 16, per], [1, 0]),
  );

  const size = 520;

  return (
    <div style={{opacity: p}}>
      {/* the generated morphing diagram, left */}
      <div
        style={{
          position: 'absolute',
          left: SAFE.x + 40,
          top: SAFE.y + (SAFE.h - size) / 2,
          width: size,
          height: size,
        }}
      >
        <PolarDiagram t={t} size={size} />
      </div>

      {/* the manufacturer's own measured plot, small, as evidence */}
      <Shot
        src="polar-diagram"
        x={SAFE.x + 40 + size + 30}
        y={SAFE.y + (SAFE.h - 300) / 2}
        w={300}
        h={300}
        fit="contain"
        radius={12}
        cam={gimbal(f, dur, 0.4)}
        opacity={ramp(f, [30, 70], [0, 0.95])}
      />
      <Micro
        size={16}
        color={C.inkDim}
        tracking={2.2}
        style={{
          position: 'absolute',
          left: SAFE.x + 40 + size + 30,
          top: SAFE.y + (SAFE.h - 300) / 2 + 310,
          width: 300,
          textAlign: 'center',
          opacity: ramp(f, [44, 84], [0, 1]),
        }}
      >
        Measured response
      </Micro>

      {/* the per-pattern card, right */}
      <LFBlock
        x={size + 400}
        y={0}
        w={SAFE.w - size - 400}
        h={SAFE.h}
        justify="center"
        opacity={cardP}
      >
        <div style={{display: 'flex', alignItems: 'baseline', gap: 16}}>
          <span
            style={{
              fontFamily: F.mono,
              fontSize: 26,
              fontWeight: 700,
              color: C.steel,
              letterSpacing: 1,
            }}
          >
            {String(i + 1).padStart(2, '0')}
          </span>
          <Display size={54} weight={800} color={C.steel} lh={0.96}>
            {PATTERNS[i].name}
          </Display>
        </div>
        <div style={{height: 20}} />
        <Display size={58} weight={800} color={C.ink} lh={0.94}>
          {USES[i].title}
        </Display>
        <div style={{height: 22}} />
        <Rule w={92} color={C.accent} thickness={5} />
        <div style={{height: 22}} />
        <Body size={29} color={C.inkSoft} lh={1.44} style={{maxWidth: 720}}>
          {USES[i].body}
        </Body>
      </LFBlock>

      {/* progress pips, so the walk reads as a set of five */}
      <div
        style={{
          position: 'absolute',
          left: SAFE.x + size + 400,
          top: SAFE.y + SAFE.h - 24,
          display: 'flex',
          gap: 12,
        }}
      >
        {PATTERNS.map((_, k) => (
          <div
            key={k}
            style={{
              width: k === i ? 46 : 18,
              height: 6,
              borderRadius: 3,
              backgroundColor: k === i ? C.steel : C.line,
            }}
          />
        ))}
      </div>
    </div>
  );
};
