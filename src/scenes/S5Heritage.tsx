import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {BAND as L, C, SAFE} from '../lib/theme';
import {ease, finishWipe, gimbal, holdFade, ramp, OVERLAP, segFade} from '../lib/anim';
import {AmbientBands, Band, Grid, Ground} from '../components/Stage';
import {GimbalShot, Shot} from '../components/Media';
import {HeritageMotif} from '../components/Diagram';
import {Body, Display, Kicker, Micro, Rule, Spec} from '../components/Type';

/**
 * S5 — HERITAGE. 450 frames (15 s), 1:00–1:15.
 *
 * Brief Section 12: slower dolly-glide moves carrying the M 49 design-lineage
 * story and the edge-terminated dual-diaphragm capsule.
 *
 * The lineage is stated exactly as the manufacturer documentation does — the
 * tapered headgrille echoes the styling of the historic M 49. That is a
 * statement about this instrument's own ancestry, not a comparison against
 * anything a viewer could buy instead.
 *
 * Movements:
 *   A (0–170)   the silhouette morph, historic profile into TLM 107
 *   B (170–300) macro on the badge and grille texture, slow glide
 *   C (300–450) FINISH SPLIT — nickel and black as equal peers, plus the
 *               remaining context frames
 *
 * Images: studio-sepia, macro-badge-blk, mesh-abstract, black-tall,
 *         nickel-tall, nickel-angled, nickel-patchbay, room-real,
 *         black-dark, macro-badge-ang, macro-badge-lo, macro-badge-lo2,
 *         rear-black-lo, rear-black-sm.
 * Ambient: amb-c06 top, amb-c10 bottom.
 */
export const S5Heritage: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const A = 170;
  const B = 130;
  const Cn = dur - A - B;

  return (
    <AbsoluteFill>
      <Ground tone="warm" />
      <AmbientBands top={["amb-c10", "amb-c14"]} bottom={["amb-c15", "amb-c16"]} dur={dur} intensity={0.78} drift={200} />
      <Grid opacity={0.26} />

      <Band y={L.kicker.y} h={L.kicker.h} opacity={1}>
        <Kicker color={C.accent}>A silhouette with a lineage</Kicker>
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

/** The wireframe profile morph, beside the archival studio plate. */
const MovementA: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const op = segFade(f, dur, 0, OVERLAP);
  const p = ease(f, [26, dur - 40], [0, 1]);

  return (
    <div style={{opacity: op}}>
      {/* the archival plate, with two contemporary context frames beneath */}
      <Shot
        src="studio-sepia"
        x={SAFE.x + 486}
        y={L.media.y}
        w={450}
        h={430}
        cam={gimbal(f, dur, 0.7)}
        fit="cover"
        radius={18}
      />
      <Shot
        src="black-dark"
        x={SAFE.x + 486}
        y={L.media.y + 444}
        w={218}
        h={216}
        cam={gimbal(f, dur, 0.5)}
        fit="cover"
        radius={12}
        opacity={ramp(f, [34, 62], [0, 0.96])}
      />
      <Shot
        src="room-real"
        x={SAFE.x + 718}
        y={L.media.y + 444}
        w={218}
        h={216}
        cam={gimbal(f, dur, 0.5)}
        fit="cover"
        radius={12}
        opacity={ramp(f, [46, 74], [0, 0.96])}
      />

      <div
        style={{
          position: 'absolute',
          left: SAFE.x + 60,
          top: L.media.y + (L.media.h - 600) / 2,
        }}
      >
        <HeritageMotif p={p} w={340} h={600} color={C.inkDim} />
      </div>

      <Band y={L.head.y} h={L.head.h}>
        <Display size={76} weight={800} color={C.ink} lh={0.90}>
          {'THE HEADGRILLE\nECHOES THE M 49'}
        </Display>
      </Band>

      <Band y={L.foot.y} h={L.foot.h}>
        <Micro size={18} color={C.inkDim} tracking={2.8}>
          {p < 0.5 ? 'Historic profile' : 'TLM 107 profile'}
        </Micro>
        <div style={{height: 12}} />
        <Body size={27} color={C.inkSoft}>
          Meticulous acoustic standards, in an entirely modern instrument.
        </Body>
      </Band>
    </div>
  );
};

/** Slow glide across the capsule story. */
const MovementB: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const op = segFade(f, dur, OVERLAP, OVERLAP);
  const W = SAFE.w;
  const Hb = Math.round((W * 998) / 1500);
  const Hm = L.media.h - Hb - 22;

  return (
    <div style={{opacity: op}}>
      <Shot
        src="macro-badge-blk"
        x={SAFE.x}
        y={L.media.y}
        w={W}
        h={Hb}
        cam={gimbal(f, dur, 1.1)}
        fit="cover"
        radius={20}
      />
      <Shot
        src="mesh-abstract"
        x={SAFE.x}
        y={L.media.y + Hb + 22}
        w={W}
        h={Hm}
        cam={gimbal(f, dur, 0.9, 1.02)}
        fit="cover"
        radius={20}
        opacity={ramp(f, [20, 48], [0, 1])}
      />

      <Band y={L.head.y} h={L.head.h}>
        <Display size={66} weight={800} color={C.ink} lh={0.90}>
          {'AN EDGE-TERMINATED\nDUAL-DIAPHRAGM CAPSULE'}
        </Display>
      </Band>

      <Band y={L.foot.y} h={L.foot.h}>
        <Rule w={90} color={C.accent} thickness={4} />
        <div style={{height: 14}} />
        <Spec size={23} color={C.inkSoft} tracking={1.2}>
          20 Hz – 20 kHz · Pressure gradient transducer
        </Spec>
        <div style={{height: 10}} />
        <Body size={26} color={C.inkSoft}>
          Both diaphragms at ground voltage, for outstanding impulse fidelity.
        </Body>
      </Band>
    </div>
  );
};

/**
 * FINISH SPLIT — the two finishes as equals, never as a ladder.
 *
 * The nickel and black frames share the same pose, so a hard vertical edge
 * sweeping across reads as one instrument changing finish. The remaining
 * context frames sit in a tidy strip beneath, inside the media band.
 */
const MovementC: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const op = segFade(f, dur, OVERLAP, 0);

  const {pct} = finishWipe(f, 34, 60);

  const heroW = 400;
  const heroH = 470;
  const heroX = (1080 - heroW) / 2;
  const heroY = L.media.y;

  // A montage strip for the four low-resolution twins of frames already shown
  // in full elsewhere. Montage tier is the honest place for them: they carry
  // no detail the higher-resolution copies have not already delivered.
  const stripY = L.media.y + heroH + 22;
  const stripH = L.media.h - heroH - 22;
  const gap = 14;
  const cols = 4;
  const cw = Math.floor((SAFE.w - gap * (cols - 1)) / cols);

  const strip = [
    {src: 'macro-badge-ang', at: 46},
    {src: 'macro-badge-lo', at: 56},
    {src: 'rear-black-lo', at: 66},
    {src: 'rear-black-sm', at: 76},
  ] as const;

  return (
    <div style={{opacity: op}}>
      {/*
        Nickel underneath, black revealed by a hard vertical edge sweeping
        across. The clip is applied to a box sized exactly to the hero — a
        full-canvas clip put the edge outside the image entirely and the wipe
        never became visible.
      */}
      <GimbalShot src="nickel-tall" dur={dur} amt={0.55} x={heroX} y={heroY} w={heroW} h={heroH} />
      <div
        style={{
          position: 'absolute',
          left: heroX,
          top: heroY,
          width: heroW,
          height: heroH,
          // reveal FROM THE LEFT: these are background-keyed frames whose
          // product sits in the middle of the box, so a right-edge reveal
          // spent its first third uncovering empty background and the finish
          // change never became visible
          clipPath: `inset(0 ${100 - pct}% 0 0)`,
        }}
      >
        <GimbalShot src="black-tall" dur={dur} amt={0.55} x={0} y={0} w={heroW} h={heroH} />
      </div>
      {/* the travelling edge itself */}
      {pct > 1 && pct < 99 ? (
        <div
          style={{
            position: 'absolute',
            left: heroX + (heroW * pct) / 100,
            top: heroY,
            width: 3,
            height: heroH,
            backgroundColor: C.accent,
            opacity: 0.75,
          }}
        />
      ) : null}

      {strip.map((s, i) => (
        <GimbalShot
          key={s.src}
          src={s.src}
          dur={dur}
          amt={0.45}
          from={0.99}
          x={SAFE.x + i * (cw + gap)}
          y={stripY}
          w={cw}
          h={stripH}
          radius={12}
          fit="cover"
          opacity={ramp(f, [s.at, s.at + 26], [0, 0.96])}
        />
      ))}

      <Band y={L.head.y} h={L.head.h}>
        <Display size={72} weight={800} color={C.ink} lh={0.90}>
          {'MATTE NICKEL.\nBLACK.'}
        </Display>
      </Band>

      <Band y={L.foot.y} h={L.foot.h}>
        <Rule w={84} color={C.ink} thickness={4} />
        <div style={{height: 14}} />
        <Display size={50} weight={700} color={C.ink} lh={0.94}>
          {'THE SAME INSTRUMENT,\nEITHER WAY'}
        </Display>
      </Band>
    </div>
  );
};
