import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, SAFE} from '../lib/theme';
import {ease, holdFade, macroReveal, pop, ramp, stag} from '../lib/anim';
import {AmbientBands, Band, Grid, Ground} from '../components/Stage';
import {GimbalShot, Shot} from '../components/Media';
import {Body, Display, Kicker, Micro, Rule, Spec} from '../components/Type';
import {
  ADDRESS,
  LINKTREE,
  PARTNER,
  PRICE,
  PRICE_LABEL,
  PRICE_NOTE,
  PRODUCT_PAGE,
  SELLER,
  SITE,
  SOCIAL,
  WHATSAPP,
} from '../lib/copy';

/**
 * S6 — BEAUTY SHOT, PRICE & CTA. 390 frames (13 s), 1:15–1:28.
 *
 * Brief Section 12: a full product beauty shot with ample time to state the
 * Market Operating Price and the Authorized Partner call-to-action.
 *
 * The CTA shape here is specific to this project. The product has fixed,
 * visible pricing, so the price is stated plainly and confidently —
 * Rs. 1,44,900 inclusive of GST, exactly as the brief's Section 4 fixes it,
 * with no rounding, no "starting from" and no second figure anywhere — paired
 * with an invitation to the website for the best available price. No discount
 * pressure and no urgency language.
 *
 * www.shivanshelectronics.in is the primary marketed URL and the largest,
 * most repeated contact element on screen; the specific product page appears
 * only as a supporting line, because a long URL is not something a viewer can
 * retain from a fast-moving reel.
 *
 * Shivansh Electronics is named as Neumann's Authorized Partner. The words
 * distributor, dealer and reseller appear nowhere in this reel.
 *
 * This scene uses its own band geometry: the commercial block is the subject,
 * so the product sits in a compact upper band and the type takes the rest.
 *
 * Images: macro-badge-lo2 (macro open), black-front, nickel-front.
 * Ambient: amb-c03 top, amb-b5 bottom.
 */

const MEDIA_Y = 262;
const MEDIA_H = 400;
const PRICE_Y = 700;
const URL_Y = 1030;
const CONTACT_Y = 1260;

export const S6Cta: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();

  // Shortened from 96: three-plus seconds of macro left the frame near-empty
  // at the top of the scene, and the brief asks this block to give the price
  // ample room rather than the opening flourish.
  const HANDOFF = 68;
  const cam = macroReveal(f, HANDOFF + 40, {x: 0.52, y: 0.40}, 2.5, 0.38);
  const macroOp = ramp(f, [HANDOFF - 16, HANDOFF], [1, 0]);
  const heroOp = ramp(f, [HANDOFF - 16, HANDOFF + 6], [0, 1]);
  const panel = ramp(f, [HANDOFF + 2, HANDOFF + 30], [0, 1]);

  // A closing statement that carries the macro phase, so no part of the scene
  // is a mostly-blank frame, then hands over to the price block.
  const leadIn = Math.min(ramp(f, [8, 28], [0, 1]), ramp(f, [HANDOFF - 14, HANDOFF + 2], [1, 0]));

  return (
    <AbsoluteFill>
      <Ground tone="cool" />
      <AmbientBands top={["amb-b5", "amb-c17"]} bottom={["amb-b2", "amb-b4"]} dur={dur} intensity={0.85} drift={260} />
      <Grid opacity={0.3} />

      {/* macro opening */}
      <div style={{position: 'absolute', inset: 0, opacity: macroOp}}>
        <Shot
          src="macro-badge-lo2"
          x={SAFE.x}
          y={MEDIA_Y}
          w={SAFE.w}
          h={MEDIA_H}
          cam={cam}
          fit="cover"
          radius={20}
        />
      </div>

      {/* the complete product, uncropped, both finishes as peers */}
      <div style={{position: 'absolute', inset: 0, opacity: heroOp}}>
        <GimbalShot
          src="nickel-front"
          dur={dur}
          amt={0.55}
          x={SAFE.x + 130}
          y={MEDIA_Y}
          w={300}
          h={MEDIA_H}
        />
        <GimbalShot
          src="black-front"
          dur={dur}
          amt={0.55}
          from={0.99}
          x={SAFE.x + 450}
          y={MEDIA_Y}
          w={300}
          h={MEDIA_H}
        />
        <GimbalShot
          src="nickel-angled"
          dur={dur}
          amt={0.5}
          x={SAFE.x + 726}
          y={MEDIA_Y + 40}
          w={210}
          h={MEDIA_H - 80}
          opacity={ramp(f, [HANDOFF + 10, HANDOFF + 44], [0, 0.95])}
        />
      </div>

      {/* ---- lead-in, live only during the macro phase --------------- */}
      <Band y={PRICE_Y} h={300} opacity={leadIn}>
        <Rule w={110} color={C.accent} thickness={5} />
        <div style={{height: 18}} />
        <Display size={86} weight={800} color={C.ink} lh={0.90}>
          {'ONE INSTRUMENT.\nEVERY SESSION.'}
        </Display>
        <div style={{height: 14}} />
        <Body size={28} color={C.inkSoft}>
          The Neumann TLM 107 Studio Set.
        </Body>
      </Band>

      {/* ---- the price block ---------------------------------------- */}
      <Band
        y={PRICE_Y}
        h={300}
        opacity={panel}
        style={{transform: `translateY(${(1 - panel) * 16}px)`}}
      >
        <Kicker color={C.inkDim} size={19} tracking={3.2}>
          {PRICE_LABEL}
        </Kicker>
        <div style={{height: 8}} />
        <div style={{display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap'}}>
          <Display size={112} weight={800} color={C.ink} lh={0.86} caps={false}>
            {PRICE}
          </Display>
          <Spec size={26} color={C.inkSoft} weight={500} tracking={0.8}>
            {PRICE_NOTE}
          </Spec>
        </div>
        <div style={{height: 12}} />
        <Rule w={ease(f, [HANDOFF + 20, HANDOFF + 54], [0, 190])} color={C.accent} thickness={5} />
        <div style={{height: 16}} />
        <Body size={27} color={C.inkSoft}>
          {`${SELLER}, as ${PARTNER},\noffers the TLM 107 Studio Set at this price — with the\nbest available price on the website.`}
        </Body>
      </Band>

      {/* ---- the primary marketed URL -------------------------------- */}
      <Band y={URL_Y} h={200} opacity={ramp(f, [HANDOFF + 30, HANDOFF + 60], [0, 1])}>
        <div
          style={{
            backgroundColor: C.ink,
            borderRadius: 16,
            padding: '24px 30px 22px',
            boxShadow: '0 20px 46px rgba(11,16,22,0.22)',
          }}
        >
          <Micro size={17} color="#9FB0C4" tracking={3.0}>
            Visit
          </Micro>
          <div style={{height: 8}} />
          <Display size={56} weight={800} color={C.paperHi} lh={0.94} caps={false} tracking={-0.4}>
            {SITE}
          </Display>
          <div style={{height: 10}} />
          <Spec size={19} color="#B6C4D4" tracking={0.9}>
            {PRODUCT_PAGE}
          </Spec>
        </div>
      </Band>

      {/* ---- supporting contact detail ------------------------------- */}
      <Band y={CONTACT_Y} h={312} opacity={ramp(f, [HANDOFF + 54, HANDOFF + 86], [0, 1])}>
        <div style={{display: 'flex', gap: 30, alignItems: 'flex-start'}}>
          <div style={{flex: '0 0 auto'}}>
            <Micro size={16} color={C.inkDim} tracking={2.6}>
              WhatsApp
            </Micro>
            <div style={{height: 6}} />
            {WHATSAPP.map((w, i) => (
              <Spec
                key={w}
                size={21}
                color={C.inkSoft}
                tracking={0.7}
                style={{opacity: pop(f, stag(i, 3, HANDOFF + 58)), marginBottom: 2}}
              >
                {w}
              </Spec>
            ))}
          </div>
          <div style={{width: 1, alignSelf: 'stretch', backgroundColor: C.line}} />
          <div style={{flex: 1}}>
            <Micro size={16} color={C.inkDim} tracking={2.6}>
              Also at
            </Micro>
            <div style={{height: 6}} />
            <Spec size={19} color={C.inkSoft} tracking={0.5}>
              {LINKTREE}
            </Spec>
            <div style={{height: 5}} />
            {SOCIAL.map((s, i) => (
              <Spec
                key={s.k}
                size={17}
                color={C.inkDim}
                tracking={0.4}
                style={{opacity: pop(f, stag(i, 2.6, HANDOFF + 64)), marginBottom: 1}}
              >
                {s.v}
              </Spec>
            ))}
          </div>
        </div>

        <div style={{height: 12}} />
        <div style={{height: 1, backgroundColor: C.lineSoft}} />
        <div style={{height: 10}} />
        <Micro size={15} color={C.inkDim} tracking={1.5} style={{textTransform: 'none'}}>
          {ADDRESS}
        </Micro>
      </Band>
    </AbsoluteFill>
  );
};
