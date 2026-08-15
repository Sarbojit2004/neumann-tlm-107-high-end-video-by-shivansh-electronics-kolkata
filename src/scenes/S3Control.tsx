import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {BAND as L, C, SAFE} from '../lib/theme';
import {gimbal, holdFade, pop, ramp, stag, OVERLAP, segFade} from '../lib/anim';
import {AmbientBands, Band, Grid, Ground} from '../components/Stage';
import {GimbalShot, RevealShot, Shot} from '../components/Media';
import {SpecPill} from '../components/Diagram';
import {Body, CountUp, Display, Kicker, Micro, Rule, Spec} from '../components/Type';
import {SPECS} from '../lib/copy';

/**
 * S3 — CONTROL & BUILD QUALITY. 450 frames (15 s), 0:30–0:45.
 *
 * Brief Section 12: fast, tactile cuts on the rear navigation toggle, the pad
 * and filter selections, paired with the acoustic-duality proof points.
 *
 * Movements:
 *   A (0–170)   the factory-labelled navigation switch
 *   B (170–300) pad and low-cut values stepping, on the black rear
 *   C (300–450) the duality: 141 dB against 10 dB-A
 *
 * Every figure shown is marked VERIFIED in the brief's Section 4 table.
 *
 * Images: nav-labelled, macro-xlr, rear-black-ang, nickel-swivel.
 * Ambient: amb-c02 top, amb-c11 bottom.
 */
export const S3Control: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const A = 170;
  const B = 130;
  const Cn = dur - A - B;

  return (
    <AbsoluteFill>
      <Ground />
      <AmbientBands top={["amb-c07", "amb-c08"]} bottom={["amb-c11", "amb-c09"]} dur={dur} intensity={0.8} drift={90} />
      <Grid opacity={0.3} />

      <Band y={L.kicker.y} h={L.kicker.h} opacity={1}>
        <Kicker color={C.accent}>One control. Every setting.</Kicker>
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

/** The navigation switch with its factory callouts. */
const MovementA: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const op = segFade(f, dur, 0, OVERLAP);
  const W = SAFE.w;
  const H = Math.round((W * 807) / 1500);

  return (
    <div style={{opacity: op}}>
      <Shot
        src="nav-labelled"
        x={SAFE.x}
        y={L.media.y + (L.media.h - H) / 2}
        w={W}
        h={H}
        cam={gimbal(f, dur, 0.9)}
        fit="cover"
        radius={20}
      />

      <Band y={L.head.y} h={L.head.h}>
        <Display size={74} weight={800} color={C.ink} lh={0.90}>
          {'A SINGLE REAR\nNAVIGATION TOGGLE'}
        </Display>
        <div style={{height: 12}} />
        <Body size={27} color={C.inkSoft}>
          Pattern, pad and filter all under one micro-joystick.
        </Body>
      </Band>

      <Band y={L.foot.y} h={L.foot.h}>
        <div style={{display: 'flex', gap: 14, flexWrap: 'wrap'}}>
          {[
            {k: SPECS.patterns.k, v: SPECS.patterns.v, u: SPECS.patterns.u},
            {k: SPECS.pad.k, v: SPECS.pad.v, u: SPECS.pad.u},
            {k: SPECS.filter.k, v: SPECS.filter.v, u: SPECS.filter.u},
          ].map((s, i) => (
            <SpecPill key={s.k} k={s.k} v={s.v} u={s.u} p={pop(f, stag(i, 7, 46))} accent={C.steel} />
          ))}
        </div>
      </Band>
    </div>
  );
};

/** Pad and low-cut selections stepping on the black rear. */
const MovementB: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const op = segFade(f, dur, OVERLAP, OVERLAP);
  const W = SAFE.w;
  const H = Math.round((W * 998) / 1500);

  const padStep = Math.min(2, Math.floor(ramp(f, [14, 74], [0, 3])));
  const filStep = Math.min(2, Math.floor(ramp(f, [76, 126], [0, 3])));

  const PAD = ['0 dB', '−6 dB', '−12 dB'];
  const FIL = ['Linear', '40 Hz', '100 Hz'];

  return (
    <div style={{opacity: op}}>
      <Shot
        src="rear-black-ang"
        x={SAFE.x}
        y={L.media.y + (L.media.h - H) / 2}
        w={W}
        h={H}
        cam={gimbal(f, dur, 1.0)}
        fit="cover"
        radius={20}
      />

      <Band y={L.head.y} h={L.head.h}>
        <Display size={74} weight={800} color={C.ink} lh={0.90}>
          {'PAD AND FILTER,\nSTEPPED IN PLACE'}
        </Display>
      </Band>

      <Band y={L.foot.y} h={L.foot.h}>
        <div style={{display: 'flex', gap: 56}}>
          <SelectorColumn label="Pre-attenuation" items={PAD} active={padStep} on={f > 12} />
          <SelectorColumn label="Low-cut filter" items={FIL} active={filStep} on={f > 74} />
        </div>
      </Band>
    </div>
  );
};

const SelectorColumn: React.FC<{
  label: string;
  items: string[];
  active: number;
  on: boolean;
}> = ({label, items, active, on}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
    <Micro size={17} color={C.inkDim} tracking={2.8}>
      {label}
    </Micro>
    {items.map((it, i) => {
      const lit = on && i === active;
      return (
        <div key={it} style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              backgroundColor: lit ? C.accent : C.line,
              boxShadow: lit ? '0 0 15px 3px rgba(156,18,24,0.45)' : undefined,
            }}
          />
          <Spec size={29} weight={lit ? 700 : 400} color={lit ? C.ink : C.inkDim} tracking={0.8}>
            {it}
          </Spec>
        </div>
      );
    })}
  </div>
);

/** The acoustic duality — the loudest and the quietest, side by side. */
const MovementC: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const op = segFade(f, dur, OVERLAP, 0);

  return (
    <div style={{opacity: op}}>
      {/* full Macro-to-Full-Reveal: opens on the machined XLR collar and the
          badge, pulls back to the whole body. 35/65 macro-to-reveal split. */}
      <RevealShot
        src="macro-xlr"
        dur={dur}
        focus={{x: 0.34, y: 0.62}}
        zoom={2.7}
        x={SAFE.x}
        y={L.media.y + 30}
        w={470}
        h={430}
      />
      <GimbalShot
        src="nickel-swivel"
        dur={dur}
        amt={0.6}
        from={0.99}
        x={SAFE.x + 520}
        y={L.media.y}
        w={416}
        h={410}
      />
      <GimbalShot
        src="nickel-patchbay"
        dur={dur}
        amt={0.5}
        x={SAFE.x + 520}
        y={L.media.y + 430}
        w={416}
        h={230}
        radius={12}
        fit="cover"
        opacity={ramp(f, [30, 62], [0, 0.96])}
      />

      <Band y={L.head.y} h={L.head.h}>
        <Display size={78} weight={800} color={C.ink} lh={0.90}>
          {'BUILT FOR BOTH\nEXTREMES'}
        </Display>
      </Band>

      <Band y={L.foot.y} h={L.foot.h}>
        <div style={{display: 'flex', alignItems: 'flex-start', gap: 36}}>
          <div style={{opacity: ramp(f, [16, 40], [0, 1])}}>
            <Micro size={17} color={C.inkDim} tracking={2.8}>
              Maximum SPL
            </Micro>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 8}}>
              <CountUp to={141} dur={44} delay={18} size={92} color={C.accent} />
              <Spec size={28} color={C.inkSoft} weight={500}>
                dB
              </Spec>
            </div>
            <Spec size={18} color={C.inkDim} tracking={1.2}>
              153 dB with −12 dB pad
            </Spec>
          </div>

          <div
            style={{
              width: 1,
              height: 138,
              backgroundColor: C.line,
              marginTop: 18,
              opacity: ramp(f, [30, 50], [0, 1]),
            }}
          />

          <div style={{opacity: ramp(f, [46, 70], [0, 1])}}>
            <Micro size={17} color={C.inkDim} tracking={2.8}>
              Self-noise
            </Micro>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 8}}>
              <CountUp to={10} dur={38} delay={50} size={92} color={C.steel} />
              <Spec size={28} color={C.inkSoft} weight={500}>
                dB-A
              </Spec>
            </div>
            <Spec size={18} color={C.inkDim} tracking={1.2}>
              Transformerless circuitry
            </Spec>
          </div>
        </div>

        <div style={{height: 20}} />
        <Rule w={96} color={C.ink} thickness={4} />
        <div style={{height: 12}} />
        <Body size={26} color={C.inkSoft}>
          A whispered take, or a snare at full force.
        </Body>
      </Band>
    </div>
  );
};
