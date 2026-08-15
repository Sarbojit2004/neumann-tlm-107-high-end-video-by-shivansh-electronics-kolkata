import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, SAFE} from './lib/theme';
import {AmbientBands, Band, Grid, Ground} from './components/Stage';
import {Shot} from './components/Media';
import {Body, Display, Kicker, Micro, Rule, Spec} from './components/Type';
import {PARTNER, PRICE, PRICE_LABEL, PRICE_NOTE, SELLER, SITE} from './lib/copy';
import {loadFonts} from './lib/fonts';

loadFonts();

/**
 * Portrait thumbnail, 1080x1920 — the same canvas, palette and type system as
 * the reel.
 *
 * Rules it observes, matching the reel:
 *   - light ground throughout
 *   - a full, uncropped view of the complete product is present (the nickel
 *     Studio Set), with a macro detail used compositionally alongside it
 *   - no Neumann logo file and no Shivansh Electronics logo file anywhere; the
 *     badge visible on the microphone body is part of the physical product in
 *     the photograph and is left untouched
 *   - no wooden box
 *   - one price only: Rs. 1,44,900, inclusive of GST
 *   - www.shivanshelectronics.in as the primary marketed URL
 *   - all critical content inside the 250–1580px safe band, 72px side margins
 *
 * Laid out on explicit, non-overlapping canvas-absolute bands. The first
 * version positioned blocks independently and the price block collided with
 * both the subtitle above it and the URL panel below, which hid the price
 * almost entirely — the one element that must be unmissable.
 */
const MEDIA_Y = 318;
const MEDIA_H = 570;
const HEAD_Y = 906;
const PRICE_Y = 1198;
const URL_Y = 1382;

export const Thumbnail: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: C.paper}}>
    <Ground tone="cool" />
    <AmbientBands top={['amb-c01']} bottom={['amb-c19']} dur={1} intensity={0.75} />
    <Grid opacity={0.32} />

    {/* macro detail, used compositionally beside the hero */}
    <Shot
      src="macro-grille"
      x={SAFE.x + 470}
      y={MEDIA_Y}
      w={466}
      h={300}
      fit="cover"
      radius={18}
      opacity={0.97}
    />

    {/* the black peer variant — equals, never a ladder */}
    <Shot
      src="black-front"
      x={SAFE.x + 560}
      y={MEDIA_Y + 318}
      w={290}
      h={252}
      fit="contain"
      opacity={0.97}
    />

    {/* the complete product, full and uncropped */}
    <Shot src="nickel-front" x={SAFE.x - 24} y={MEDIA_Y} w={520} h={MEDIA_H} fit="contain" />

    <Band y={262} h={40}>
      <Kicker color={C.accent} size={23} tracking={3.6}>
        Neumann · Made in Germany
      </Kicker>
    </Band>

    <Band y={HEAD_Y} h={272}>
      <Rule w={132} color={C.accent} thickness={6} />
      <div style={{height: 18}} />
      <Display size={116} weight={800} color={C.ink} lh={0.85}>
        {'TLM 107\nSTUDIO SET'}
      </Display>
      <div style={{height: 16}} />
      <Body size={29} color={C.inkSoft}>
        Five polar patterns · 141 dB max SPL · 10 dB-A self-noise
      </Body>
      <div style={{height: 7}} />
      <Micro size={18} color={C.inkDim} tracking={2.6}>
        Includes the EA 4 elastic shockmount
      </Micro>
    </Band>

    <Band y={PRICE_Y} h={168}>
      <Micro size={17} color={C.inkDim} tracking={3.0}>
        {PRICE_LABEL}
      </Micro>
      <div style={{height: 6}} />
      <div style={{display: 'flex', alignItems: 'baseline', gap: 14}}>
        <Display size={92} weight={800} color={C.ink} lh={0.88} caps={false}>
          {PRICE}
        </Display>
        <Spec size={24} color={C.inkSoft} weight={500} tracking={0.7}>
          {PRICE_NOTE}
        </Spec>
      </div>
    </Band>

    <Band y={URL_Y} h={190}>
      <div
        style={{
          backgroundColor: C.ink,
          borderRadius: 18,
          padding: '24px 30px 22px',
          boxShadow: '0 20px 46px rgba(11,16,22,0.20)',
        }}
      >
        <Micro size={16} color="#9FB0C4" tracking={3.0}>
          {SELLER} — {PARTNER}
        </Micro>
        <div style={{height: 10}} />
        <Display size={58} weight={800} color={C.paperHi} lh={0.94} caps={false} tracking={-0.4}>
          {SITE}
        </Display>
      </div>
    </Band>
  </AbsoluteFill>
);
