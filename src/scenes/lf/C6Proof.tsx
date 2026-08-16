import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {C, SAFE} from '../../lib/lf-theme';
import {pop, ramp, stag} from '../../lib/anim';
import {LFAmbient, LFBlock, LFGrid, LFGround} from '../../components/lf/LFStage';
import {beatFade, SplitBeat, StatBeat, TrioBeat, OVERLAP} from '../../components/lf/LFLayouts';
import {Body, Display, Kicker, Micro, Rule, Spec} from '../../components/Type';
import {SpecPill} from '../../components/Diagram';

/**
 * C6 — TRANSFORMATION AND PROOF. 1500 frames (50 s), 3:30–4:20.
 *
 * Brief Section 12: how the buyer's workflow fundamentally changes, with key
 * verified specifications restated as hard proof points.
 *
 * The brief's supporting research documents eleven professional workflows.
 * Covering all eleven would turn this into a manual, so this chapter takes the
 * three that actually speak to the buyer profile the brief identifies —
 * project-studio owner, voiceover artist, podcaster — and lets those carry
 * real specificity instead of skimming everything.
 *
 *   b1  300  the week that changes
 *   b2  420  three sessions, three patterns, one microphone
 *   b3  360  the verified figures, restated as proof
 *   b4  420  the full specification, laid out
 *
 * Images: nickel-swivel, black-ea4-sm, room-real, nickel-patchbay,
 *         rear-black, macro-badge-lo (reuses where the point is comparative).
 * Ambient: amb-c17, amb-c18, amb-c19, amb-b2.
 */
export const C6Proof: React.FC<{dur: number}> = ({dur}) => {
  const b1 = 300;
  const b2 = 420;
  const b3 = 360;
  const b4 = dur - b1 - b2 - b3; // 420

  return (
    <AbsoluteFill>
      <LFGround tone="cool" />
      <LFAmbient
        plates={['amb-c17', 'amb-c18', 'amb-c19', 'amb-b2']}
        dur={dur}
        intensity={0.76}
        drift={300}
      />
      <LFGrid opacity={0.3} />

      <Sequence from={0} durationInFrames={b1 + OVERLAP} layout="none">
        <SplitBeat
          dur={b1}
          side="right"
          kicker="What actually changes"
          headline={'THE MICROPHONE\nSTOPS BEING\nA DECISION'}
          body={
            'You stop planning sessions around which microphone you own, and start ' +
            'planning them around the source in front of you. The setup time that ' +
            'used to go into choosing and re-rigging goes back into takes.'
          }
          src="nickel-swivel"
          headSize={60}
        />
      </Sequence>

      <Sequence from={b1} durationInFrames={b2 + OVERLAP} layout="none">
        <TrioBeat
          dur={b2}
          headline={'THREE SESSIONS. ONE MICROPHONE.'}
          sub={'Morning, afternoon, evening — the same instrument, three different settings.'}
          srcs={['room-real', 'nickel-patchbay', 'black-ea4-sm']}
          captions={[
            'Narration · cardioid, 100 Hz cut',
            'Acoustic source · wide cardioid',
            'Two voices · figure-8',
          ]}
        />
      </Sequence>

      <Sequence from={b1 + b2} durationInFrames={b3 + OVERLAP} layout="none">
        <StatBeat
          dur={b3}
          headline={'THE PROOF, IN NUMBERS'}
          sub={'Every figure here is drawn from Neumann’s own published specification.'}
          stats={[
            {k: 'Polar patterns', v: '5', accent: C.steel},
            {k: 'Maximum SPL', v: '141', u: 'dB', accent: C.accent},
            {k: 'Self-noise', v: '10', u: 'dB-A', accent: C.steel},
            {k: 'Frequency range', v: '20 Hz – 20 kHz'},
          ]}
          src="rear-black"
        />
      </Sequence>

      <Sequence from={b1 + b2 + b3} durationInFrames={b4} layout="none">
        <SpecSheet dur={b4} />
      </Sequence>
    </AbsoluteFill>
  );
};

/** The full verified specification, laid out as a reference card. */
const SpecSheet: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const p = beatFade(f, dur);

  const SPECS: {k: string; v: string; u?: string}[] = [
    {k: 'Acoustical principle', v: 'Pressure gradient'},
    {k: 'Capsule', v: 'Dual-diaphragm, edge-terminated'},
    {k: 'Polar patterns', v: '5 selectable'},
    {k: 'Frequency range', v: '20 Hz – 20 kHz'},
    {k: 'Maximum SPL', v: '141', u: 'dB'},
    {k: 'With −12 dB pad', v: '153', u: 'dB'},
    {k: 'Self-noise', v: '10', u: 'dB-A'},
    {k: 'Self-noise (CCIR)', v: '22', u: 'dB'},
    {k: 'Sensitivity', v: '11', u: 'mV/Pa'},
    {k: 'Rated impedance', v: '50', u: 'ohms'},
    {k: 'Phantom power', v: '48', u: 'V'},
    {k: 'Current consumption', v: '3.2', u: 'mA'},
    {k: 'Dimensions', v: '64 × 145', u: 'mm'},
    {k: 'Weight', v: '445', u: 'g'},
    {k: 'Connector', v: 'XLR 3 F'},
    {k: 'Studio Set includes', v: 'TLM 107 + EA 4 shockmount'},
  ];

  const cols = 2;
  const perCol = Math.ceil(SPECS.length / cols);
  const colW = (SAFE.w - 80) / cols;

  return (
    <div style={{opacity: p}}>
      <LFBlock x={0} y={0} w={SAFE.w} h={140} justify="center" style={{alignItems: 'center'}}>
        <Display size={62} weight={800} color={C.ink} lh={0.92} align="center">
          {'THE FULL SPECIFICATION'}
        </Display>
        <div style={{marginTop: 12}}>
          <Micro size={19} color={C.inkDim} tracking={2.6}>
            Verified against the manufacturer’s published data
          </Micro>
        </div>
      </LFBlock>

      {Array.from({length: cols}).map((_, c) => (
        <div
          key={c}
          style={{
            position: 'absolute',
            left: SAFE.x + c * (colW + 80),
            top: SAFE.y + 170,
            width: colW,
          }}
        >
          {SPECS.slice(c * perCol, (c + 1) * perCol).map((s, i) => {
            const idx = c * perCol + i;
            return (
              <div
                key={s.k}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 24,
                  paddingBottom: 11,
                  marginBottom: 11,
                  borderBottom: `1px solid ${C.lineSoft}`,
                  opacity: pop(f, stag(idx, 2.6, 14)),
                }}
              >
                <Micro size={19} color={C.inkDim} tracking={2.0}>
                  {s.k}
                </Micro>
                <div style={{display: 'flex', alignItems: 'baseline', gap: 7}}>
                  <Spec size={26} weight={700} color={C.ink} tracking={0.4}>
                    {s.v}
                  </Spec>
                  {s.u ? (
                    <Spec size={19} color={C.inkSoft} weight={400}>
                      {s.u}
                    </Spec>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
