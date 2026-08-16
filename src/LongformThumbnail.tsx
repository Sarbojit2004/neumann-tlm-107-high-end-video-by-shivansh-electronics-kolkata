import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {C, F, FULL as SAFE} from './lib/lf-theme';
import {LFAmbient, LFGrid, LFGround} from './components/lf/LFStage';
import {Shot} from './components/Media';
import {logo} from './lib/lf-brand';
import {Body, Display, Kicker, Micro, Rule, Spec} from './components/Type';
import {PARTNER, PRICE, PRICE_LABEL, PRICE_NOTE, SITE} from './lib/copy';
import {loadFonts} from './lib/fonts';

loadFonts();

/**
 * Landscape thumbnail, 1920x1080 — the same palette and type system as the
 * long-form video it fronts.
 *
 * Rules it observes:
 *   - light ground throughout
 *   - a full, uncropped view of the complete Studio Set, with a macro detail
 *     and the black peer variant used compositionally alongside it
 *   - BOTH logos present and legibly sized, shown DIRECTLY on the ground with
 *     no white box, card or plate behind them (the supplied files' baked
 *     plates are keyed away by scripts/prep_logos.py)
 *   - no wooden box
 *   - one price only: Rs. 1,44,900, inclusive of GST
 *   - www.shivanshelectronics.in as the primary marketed URL
 *   - all critical content inset 48px from the left and right edges
 *
 * Laid out on explicit, non-overlapping bands so nothing can collide.
 */
const LEFT_W = 1000;

export const LongformThumbnail: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: C.paper}}>
    <LFGround tone="cool" />
    <LFAmbient plates={['amb-c01']} dur={1} intensity={0.7} />
    <LFGrid opacity={0.3} />

    {/* macro detail, upper right, used compositionally */}
    <Shot
      src="macro-grille"
      x={SAFE.x + LEFT_W + 40}
      y={SAFE.y}
      w={480}
      h={300}
      fit="cover"
      radius={18}
      opacity={0.97}
    />

    {/* the black peer variant -- equals, never a ladder */}
    <Shot
      src="black-front"
      x={SAFE.x + LEFT_W + 540}
      y={SAFE.y + 20}
      w={250}
      h={280}
      fit="contain"
      opacity={0.97}
    />

    {/* the complete product, full and uncropped */}
    <Shot
      src="nickel-front"
      x={SAFE.x + LEFT_W + 130}
      y={SAFE.y + 320}
      w={620}
      h={620}
      fit="contain"
    />

    {/* ---- left column: the whole message ---------------------------- */}
    <div style={{position: 'absolute', left: SAFE.x, top: SAFE.y + 4, width: LEFT_W}}>
      <Kicker color={C.accent} size={24} tracking={3.8}>
        Neumann · Made in Germany
      </Kicker>
    </div>

    <div style={{position: 'absolute', left: SAFE.x, top: SAFE.y + 62, width: LEFT_W}}>
      <Rule w={148} color={C.accent} thickness={7} />
      <div style={{height: 22}} />
      <Display size={132} weight={800} color={C.ink} lh={0.85}>
        {'TLM 107\nSTUDIO SET'}
      </Display>
      <div style={{height: 20}} />
      <Body size={31} color={C.inkSoft}>
        Five polar patterns · 141 dB max SPL · 10 dB-A self-noise
      </Body>
      <div style={{height: 8}} />
      <Micro size={20} color={C.inkDim} tracking={2.6}>
        Includes the EA 4 elastic shockmount
      </Micro>
    </div>

    <div style={{position: 'absolute', left: SAFE.x, top: SAFE.y + 540, width: LEFT_W}}>
      <Micro size={18} color={C.inkDim} tracking={3.0}>
        {PRICE_LABEL}
      </Micro>
      <div style={{height: 8}} />
      <div style={{display: 'flex', alignItems: 'baseline', gap: 16}}>
        <Display size={98} weight={800} color={C.ink} lh={0.88} caps={false}>
          {PRICE}
        </Display>
        <Spec size={25} color={C.inkSoft} weight={500} tracking={0.7}>
          {PRICE_NOTE}
        </Spec>
      </div>
    </div>

    {/* ---- both logos, directly on the ground, no plate --------------- */}
    <div
      style={{
        position: 'absolute',
        left: SAFE.x,
        top: SAFE.y + 726,
        display: 'flex',
        alignItems: 'center',
        gap: 34,
      }}
    >
      <Img src={logo('neumann')} style={{width: 250, height: 'auto', display: 'block'}} />
      <div style={{width: 2, height: 62, backgroundColor: C.line}} />
      <Img src={logo('shivansh')} style={{width: 262, height: 'auto', display: 'block'}} />
    </div>

    <div style={{position: 'absolute', left: SAFE.x, top: SAFE.y + 830, width: LEFT_W}}>
      <Micro size={18} color={C.inkDim} tracking={3.0}>
        {PARTNER}
      </Micro>
      <div style={{height: 8}} />
      <div
        style={{
          fontFamily: F.display,
          fontWeight: 800,
          fontSize: 62,
          letterSpacing: -0.5,
          color: C.ink,
          lineHeight: 1,
        }}
      >
        {SITE}
      </div>
    </div>
  </AbsoluteFill>
);
