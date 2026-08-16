import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {C, SAFE} from '../../lib/lf-theme';
import {ease, finishWipe, gimbal, ramp} from '../../lib/anim';
import {LFAmbient, LFBlock, LFGrid, LFGround} from '../../components/lf/LFStage';
import {beatFade, SplitBeat, TrioBeat, OVERLAP} from '../../components/lf/LFLayouts';
import {GimbalShot, Shot} from '../../components/Media';
import {HeritageMotif} from '../../components/Diagram';
import {Body, Display, Kicker, Micro, Rule} from '../../components/Type';

/**
 * C5 — HERITAGE AND FINISH. 1500 frames (50 s), 2:40–3:30.
 *
 * Brief Section 12: the design lineage tracing back to the M 49, and the
 * nickel-versus-black exploration via the Finish Split technique.
 *
 * The lineage is stated exactly as the manufacturer documentation does — the
 * tapered headgrille echoes the styling of the historic M 49. That is a claim
 * about this instrument's own ancestry, not a comparison against anything a
 * viewer could buy instead.
 *
 *   b1  330  the silhouette morph, historic profile into TLM 107
 *   b2  300  the badge and the build, up close
 *   b3  420  FINISH SPLIT — nickel and black as equal peers
 *   b4  450  the finishes in context
 *
 * Images: studio-sepia, macro-badge-blk, macro-badge-ang, macro-badge-lo,
 *         macro-badge-lo2, nickel-tall, black-tall, nickel-angled, black-dark.
 * Ambient: amb-c13, amb-c14, amb-c15, amb-c16.
 */
export const C5Heritage: React.FC<{dur: number}> = ({dur}) => {
  const b1 = 330;
  const b2 = 300;
  const b3 = 420;
  const b4 = dur - b1 - b2 - b3; // 450

  return (
    <AbsoluteFill>
      <LFGround tone="warm" />
      <LFAmbient
        plates={['amb-c13', 'amb-c14', 'amb-c15', 'amb-c16']}
        dur={dur}
        intensity={0.74}
        drift={240}
      />
      <LFGrid opacity={0.26} />

      <Sequence from={0} durationInFrames={b1 + OVERLAP} layout="none">
        <HeritageBeat dur={b1} />
      </Sequence>

      <Sequence from={b1} durationInFrames={b2 + OVERLAP} layout="none">
        <SplitBeat
          dur={b2}
          side="right"
          kicker="Made in Germany"
          headline={'THE BADGE IS\nTHE LAST STEP,\nNOT THE FIRST'}
          body={
            'Machined body, woven steel grille, a chrome ring that indexes cleanly ' +
            'through its detents. The build is the reason the acoustics hold up — ' +
            'and the reason a microphone like this stays in service for decades.'
          }
          src="macro-badge-blk"
          fit="cover"
          cam="reveal"
          focus={{x: 0.55, y: 0.48}}
          zoom={2.4}
          headSize={62}
        />
      </Sequence>

      <Sequence from={b1 + b2} durationInFrames={b3 + OVERLAP} layout="none">
        <FinishSplitBeat dur={b3} />
      </Sequence>

      <Sequence from={b1 + b2 + b3} durationInFrames={b4} layout="none">
        <TrioBeat
          dur={b4}
          headline={'THE SAME INSTRUMENT, EITHER WAY'}
          sub={'Finish is the only choice you are making here — the acoustics are identical.'}
          srcs={['nickel-angled', 'black-dark', 'macro-badge-ang']}
          captions={['Matte nickel', 'Black', 'Machined detail']}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

/** The wireframe profile morph, beside the archival plate. */
const HeritageBeat: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const p = beatFade(f, dur);
  const morph = ease(f, [40, dur - 60], [0, 1]);

  return (
    <div style={{opacity: p}}>
      <LFBlock x={0} y={0} w={620} h={SAFE.h} justify="center">
        <Kicker color={C.accent} size={22} tracking={3.4}>
          A silhouette with a lineage
        </Kicker>
        <div style={{height: 18}} />
        <Display size={64} weight={800} color={C.ink} lh={0.92}>
          {'THE HEADGRILLE\nECHOES THE M 49'}
        </Display>
        <div style={{height: 24}} />
        <Rule w={ease(f, [20, 56], [0, 104])} color={C.accent} thickness={5} />
        <div style={{height: 24}} />
        <Body size={28} color={C.inkSoft} lh={1.44}>
          The large, tapered grille is a deliberate reference to a microphone
          from another era — a shorthand that tells an engineer what standards
          this instrument was built to, before they have heard it.
        </Body>
        <div style={{height: 20}} />
        <Micro size={19} color={C.inkDim} tracking={2.6}>
          {morph < 0.5 ? 'Historic profile' : 'TLM 107 profile'}
        </Micro>
      </LFBlock>

      <div
        style={{
          position: 'absolute',
          left: SAFE.x + 700,
          top: SAFE.y + (SAFE.h - 720) / 2,
        }}
      >
        <HeritageMotif p={morph} w={420} h={720} color={C.inkDim} />
      </div>

      <Shot
        src="studio-sepia"
        x={SAFE.x + 1180}
        y={SAFE.y + 40}
        w={644}
        h={SAFE.h - 80}
        fit="cover"
        radius={20}
        cam={gimbal(f, dur, 0.6)}
      />
    </div>
  );
};

/**
 * FINISH SPLIT — a hard vertical edge sweeping across, turning one instrument
 * from nickel to black. Both frames share the same pose, which is what makes
 * the two read as peer variants rather than a value ladder.
 */
const FinishSplitBeat: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const p = beatFade(f, dur);

  const heroW = 520;
  const heroH = SAFE.h - 200;
  const heroX = SAFE.x + (SAFE.w - heroW) / 2;
  const heroY = SAFE.y;

  const {pct} = finishWipe(f, 90, 140);

  return (
    <div style={{opacity: p}}>
      <GimbalShot src="nickel-tall" dur={dur} amt={0.5} x={heroX} y={heroY} w={heroW} h={heroH} />
      <div
        style={{
          position: 'absolute',
          left: heroX,
          top: heroY,
          width: heroW,
          height: heroH,
          // reveal from the left: these are background-keyed frames whose
          // product sits mid-box, so a right-edge reveal would spend its first
          // third uncovering empty ground
          clipPath: `inset(0 ${100 - pct}% 0 0)`,
        }}
      >
        <GimbalShot src="black-tall" dur={dur} amt={0.5} x={0} y={0} w={heroW} h={heroH} />
      </div>
      {pct > 1 && pct < 99 ? (
        <div
          style={{
            position: 'absolute',
            left: heroX + (heroW * pct) / 100,
            top: heroY,
            width: 3,
            height: heroH,
            backgroundColor: C.accent,
            opacity: 0.8,
          }}
        />
      ) : null}

      <LFBlock x={0} y={0} w={560} h={SAFE.h} justify="center">
        <Kicker color={C.accent} size={22} tracking={3.4}>
          Two finishes, one instrument
        </Kicker>
        <div style={{height: 18}} />
        <Display size={72} weight={800} color={C.ink} lh={0.92}>
          {'MATTE NICKEL.\nBLACK.'}
        </Display>
        <div style={{height: 22}} />
        <Body size={28} color={C.inkSoft} lh={1.44}>
          Neither is the upgrade. Pick the one that disappears into your room —
          or the one that does not.
        </Body>
      </LFBlock>

      {/* the low-resolution twins, held small as supporting detail */}
      {(['macro-badge-lo', 'macro-badge-lo2'] as const).map((s, i) => (
        <GimbalShot
          key={s}
          src={s}
          dur={dur}
          amt={0.45}
          x={SAFE.x + SAFE.w - 400}
          y={SAFE.y + 90 + i * 300}
          w={380}
          h={250}
          fit="cover"
          radius={16}
          opacity={ramp(f, [40 + i * 22, 76 + i * 22], [0, 0.96])}
        />
      ))}
    </div>
  );
};
