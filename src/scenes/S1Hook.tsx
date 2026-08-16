import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BAND_TALL as L, C, SAFE} from '../lib/theme';
import {ease, holdFade, macroReveal, ramp} from '../lib/anim';
import {AmbientBands, Band, Grid, Ground} from '../components/Stage';
import {Shot} from '../components/Media';
import {Display, Kicker, Micro, Rule} from '../components/Type';

/**
 * S1 — HOOK. 240 frames (8 s), 0:00–0:08.
 *
 * Brief Section 12: an extreme macro-to-reveal of the headgrille that
 * establishes the prestige of the badge immediately.
 *
 * The reel's first and cleanest statement of the Macro-to-Full-Reveal
 * primitive: it opens hard on the woven grille and the badge at ~3x with
 * shallow depth of field, glides back as focus expands, and resolves into the
 * complete nickel Studio Set, which then holds on a slow drift. The 35/65
 * macro-to-reveal split from Section 6 is the primitive's default.
 *
 * Images: macro-grille (macro phase), nickel-front (full reveal).
 * Ambient: amb-c01 top, amb-b1 bottom.
 */
export const S1Hook: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();

  const HANDOFF = Math.round(dur * 0.42);
  const macroCam = macroReveal(f, dur, {x: 0.44, y: 0.46}, 3.15, 0.35);

  const macroOp = ramp(f, [HANDOFF - 16, HANDOFF + 4], [1, 0]);
  const fullOp = ramp(f, [HANDOFF - 16, HANDOFF + 6], [0, 1]);

  const settle = ease(f, [HANDOFF - 10, dur - 40], [1.16, 1.0]);
  const settleY = ease(f, [HANDOFF - 10, dur - 40], [34, 0]);

  return (
    <AbsoluteFill>
      <Ground tone="cool" />
      <AmbientBands top={["amb-c01", "amb-c02"]} bottom={["amb-b1", "amb-c03"]} dur={dur} intensity={0.9} />
      <Grid opacity={0.28} />

      {/* MEDIA BAND — the macro phase fills it, then hands to the product */}
      <div style={{position: 'absolute', inset: 0, opacity: macroOp}}>
        <Shot
          src="macro-grille"
          x={SAFE.x - 40}
          y={L.media.y}
          w={SAFE.w + 80}
          h={L.media.h}
          cam={macroCam}
          fit="cover"
          radius={22}
          shadow={false}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: fullOp,
          transform: `translateY(${settleY}px) scale(${settle})`,
          transformOrigin: `50% ${L.media.y + L.media.h / 2}px`,
        }}
      >
        <Shot
          src="nickel-front"
          x={SAFE.x + 180}
          y={L.media.y}
          w={SAFE.w - 360}
          h={L.media.h}
          fit="contain"
        />
      </div>

      {/* KICKER BAND */}
      <Band y={L.kicker.y} h={L.kicker.h} opacity={1}>
        <Kicker color={C.accent}>Neumann · Made in Germany</Kicker>
      </Band>

      {/* FOOT BAND — nothing here can reach the media band */}
      <Band
        y={L.foot.y}
        h={L.foot.h}
        opacity={ramp(f, [HANDOFF - 4, HANDOFF + 22], [0, 1])}
      >
        <Rule w={ease(f, [HANDOFF, HANDOFF + 30], [0, 118])} color={C.accent} thickness={5} />
        <div style={{height: 16}} />
        <Display size={96} weight={800} color={C.ink} lh={0.88}>
          {'TLM 107 STUDIO SET'}
        </Display>
        <div style={{height: 12}} />
        <Micro size={19} color={C.inkDim} tracking={3.0}>
          Large-diaphragm condenser · Five polar patterns
        </Micro>
      </Band>
    </AbsoluteFill>
  );
};
