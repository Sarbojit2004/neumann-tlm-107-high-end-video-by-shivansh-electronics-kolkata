import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {C, SAFE, SPLIT} from '../../lib/lf-theme';
import {gimbal, ramp} from '../../lib/anim';
import {LFAmbient, LFBlock, LFGrid, LFGround} from '../../components/lf/LFStage';
import {beatFade, SplitBeat, StatBeat, TrioBeat, OVERLAP} from '../../components/lf/LFLayouts';
import {Shot} from '../../components/Media';
import {Body, Display, Kicker, Micro, Rule, Spec} from '../../components/Type';

/**
 * C3 — ENGINEERING AND THE UNIFIED INTERFACE. 1350 frames (45 s), 1:15–2:00.
 *
 * Brief Section 12: the transformerless circuit, the acoustic-duality story
 * (141 dB against 10 dB-A), the unified navigation toggle, and the 15-second
 * LED auto-dimming detail — which is a genuinely user-centric piece of design
 * worth calling out on its own rather than burying in a spec list.
 *
 *   b1  270  transformerless circuitry
 *   b2  330  the acoustic duality, as verified figures
 *   b3  300  the single navigation toggle
 *   b4  240  pad and filter, and what each setting is actually for
 *   b5  210  the LEDs that dim themselves after 15 seconds
 *
 * Images: macro-xlr, black-front, nav-labelled, rear-black-ang, rear-black-lo,
 *         rear-black-sm.
 * Ambient: amb-c07, amb-c08, amb-c09.
 */
export const C3Engineering: React.FC<{dur: number}> = ({dur}) => {
  const b1 = 270;
  const b2 = 330;
  const b3 = 300;
  const b4 = 240;
  const b5 = dur - b1 - b2 - b3 - b4; // 210

  return (
    <AbsoluteFill>
      <LFGround />
      <LFAmbient plates={['amb-c07', 'amb-c08', 'amb-c09']} dur={dur} intensity={0.76} drift={120} />
      <LFGrid opacity={0.3} />

      <Sequence from={0} durationInFrames={b1 + OVERLAP} layout="none">
        <SplitBeat
          dur={b1}
          side="right"
          kicker="The circuit behind the capsule"
          headline={'TRANSFORMERLESS,\nBY DESIGN'}
          body={
            'An electronic circuit replaces the output transformer entirely. That is ' +
            'what buys the exceptionally large dynamic range, the linearity across ' +
            'the whole span, and the interference rejection a balanced output needs.'
          }
          spec={[
            {k: 'Sensitivity', v: '11', u: 'mV/Pa'},
            {k: 'Phantom power', v: '48', u: 'V'},
          ]}
          src="macro-xlr"
          cam="reveal"
          focus={{x: 0.34, y: 0.60}}
          zoom={2.6}
          headSize={66}
        />
      </Sequence>

      <Sequence from={b1} durationInFrames={b2 + OVERLAP} layout="none">
        <StatBeat
          dur={b2}
          headline={'BUILT FOR BOTH\nEXTREMES AT ONCE'}
          sub={
            'A whispered take and a snare at full force are the same microphone’s ' +
            'problem here — and it solves both without changing anything but a setting.'
          }
          stats={[
            {k: 'Maximum SPL', v: '141', u: 'dB', accent: C.accent},
            {k: 'With −12 dB pad', v: '153', u: 'dB', accent: C.accent},
            {k: 'Self-noise', v: '10', u: 'dB-A', accent: C.steel},
          ]}
          src="black-front"
        />
      </Sequence>

      <Sequence from={b1 + b2} durationInFrames={b3 + OVERLAP} layout="none">
        <SplitBeat
          dur={b3}
          side="left"
          kicker="One control, not a row of switches"
          headline={'A SINGLE REAR\nNAVIGATION TOGGLE'}
          body={
            'Pattern, pre-attenuation and low-cut all live under one micro-joystick, ' +
            'with an illuminated chrome ring showing the current state. Nothing is ' +
            'scattered across the body where a hand can knock it mid-take.'
          }
          src="nav-labelled"
          fit="cover"
          headSize={66}
        />
      </Sequence>

      <Sequence from={b1 + b2 + b3} durationInFrames={b4 + OVERLAP} layout="none">
        <PadFilterBeat dur={b4} />
      </Sequence>

      <Sequence from={b1 + b2 + b3 + b4} durationInFrames={b5} layout="none">
        <LedDimBeat dur={b5} />
      </Sequence>
    </AbsoluteFill>
  );
};

/** Pad and low-cut, with what each setting is genuinely for. */
const PadFilterBeat: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const p = beatFade(f, dur);
  const W = SPLIT.mediaW;
  const H = Math.round((W * 998) / 1500);

  const rows = [
    {k: 'Linear', v: 'Nothing removed'},
    {k: '40 Hz', v: 'Floor rumble, stand vibration'},
    {k: '100 Hz', v: 'Proximity effect on close speech'},
  ];
  const pads = [
    {k: '0 dB', v: 'Normal sources'},
    {k: '−6 dB', v: 'Loud sources'},
    {k: '−12 dB', v: 'Up to 153 dB SPL'},
  ];

  return (
    <div style={{opacity: p}}>
      <Shot
        src="rear-black-ang"
        x={SAFE.x + SPLIT.textW + SPLIT.gap}
        y={SAFE.y + (SAFE.h - H) / 2}
        w={W}
        h={H}
        fit="cover"
        radius={22}
        cam={gimbal(f, dur, 0.9)}
      />

      <LFBlock x={0} y={0} w={SPLIT.textW} h={SAFE.h} justify="center">
        <Kicker color={C.accent} size={22} tracking={3.4}>
          Two more decisions, same toggle
        </Kicker>
        <div style={{height: 18}} />
        <Display size={62} weight={800} color={C.ink} lh={0.92}>
          {'PAD AND FILTER'}
        </Display>
        <div style={{height: 26}} />

        {[
          {title: 'Pre-attenuation', items: pads, at: 14},
          {title: 'Low-cut filter', items: rows, at: 46},
        ].map((grp) => (
          <div key={grp.title} style={{marginBottom: 24}}>
            <Micro size={17} color={C.inkDim} tracking={2.6}>
              {grp.title}
            </Micro>
            <div style={{height: 10}} />
            {grp.items.map((it, i) => (
              <div
                key={it.k}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 16,
                  marginBottom: 6,
                  opacity: ramp(f, [grp.at + i * 9, grp.at + 26 + i * 9], [0, 1]),
                }}
              >
                <Spec size={27} weight={700} color={C.ink} tracking={0.6} style={{width: 108}}>
                  {it.k}
                </Spec>
                <Body size={24} color={C.inkSoft}>
                  {it.v}
                </Body>
              </div>
            ))}
          </div>
        ))}
      </LFBlock>
    </div>
  );
};

/** The 15-second auto-dim — a small, genuinely thoughtful piece of design. */
const LedDimBeat: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const p = beatFade(f, dur);
  // the LEDs visibly dim partway through the beat, mirroring the behaviour
  const lit = ramp(f, [dur * 0.42, dur * 0.72], [1, 0.12]);

  const gap = 30;
  const cw = Math.floor((SAFE.w - 700 - gap) / 2);

  return (
    <div style={{opacity: p}}>
      <LFBlock x={0} y={0} w={660} h={SAFE.h} justify="center">
        <Kicker color={C.steel} size={22} tracking={3.4}>
          A detail you only notice at 2am
        </Kicker>
        <div style={{height: 18}} />
        <Display size={62} weight={800} color={C.ink} lh={0.92}>
          {'THE DISPLAY DIMS\nITSELF AFTER\n15 SECONDS'}
        </Display>
        <div style={{height: 24}} />
        <Rule w={100} color={C.steel} thickness={5} />
        <div style={{height: 24}} />
        <Body size={28} color={C.inkSoft} lh={1.44}>
          Set the microphone, and the illumination fades out on its own — so
          nothing glows at a performer in a darkened room while they work.
        </Body>
      </LFBlock>

      {[
        {src: 'rear-black-lo' as const, i: 0},
        {src: 'rear-black-sm' as const, i: 1},
      ].map(({src, i}) => (
        <div
          key={src}
          style={{
            position: 'absolute',
            left: SAFE.x + 700 + i * (cw + gap),
            top: SAFE.y + (SAFE.h - cw * 0.66) / 2,
            width: cw,
            height: cw * 0.66,
            // the second frame carries the dimmed state
            opacity: i === 1 ? 1 : 1,
          }}
        >
          <Shot
            src={src}
            x={0}
            y={0}
            w={cw}
            h={cw * 0.66}
            fit="cover"
            radius={18}
            cam={gimbal(f, dur, 0.5)}
            opacity={ramp(f, [10 + i * 12, 36 + i * 12], [0, 1])}
          />
          {/* a soft wash that fades the second frame down, reading as the dim */}
          {i === 1 ? (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 18,
                backgroundColor: C.paper,
                opacity: (1 - lit) * 0.5,
              }}
            />
          ) : null}
          <Micro
            size={17}
            color={C.inkDim}
            tracking={2.4}
            style={{position: 'absolute', left: 0, top: cw * 0.66 + 14}}
          >
            {i === 0 ? 'On adjustment' : 'After 15 seconds'}
          </Micro>
        </div>
      ))}
    </div>
  );
};
