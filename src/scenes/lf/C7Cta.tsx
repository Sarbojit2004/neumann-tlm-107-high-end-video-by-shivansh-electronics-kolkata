import React from 'react';
import {AbsoluteFill, Img, Sequence, useCurrentFrame} from 'remotion';
import {C, F, FULL, SAFE} from '../../lib/lf-theme';
import {ease, gimbal, macroReveal, pop, ramp, stag} from '../../lib/anim';
import {LFAmbient, LFBlock, LFGrid, LFGround} from '../../components/lf/LFStage';
import {beatFade, OVERLAP} from '../../components/lf/LFLayouts';
import {Shot} from '../../components/Media';
import {logo} from '../../lib/lf-brand';
import {Body, Display, Kicker, Micro, Rule, Spec} from '../../components/Type';
import {
  ADDRESS,
  LINKTREE,
  PARTNER,
  PRICE,
  PRICE_LABEL,
  PRICE_NOTE,
  SELLER,
  SITE,
  SOCIAL,
  WHATSAPP,
} from '../../lib/copy';

/** The full product-page URL. Long-form has room to show this properly once. */
const PRODUCT_PAGE_FULL =
  'shivanshelectronics.in/microphones-neumann-tlm-107-studio-set-shivansh-electronics-kolkata';

/**
 * C7 — PRICE, AUTHORIZED PARTNER AND CTA. 1140 frames (38 s), 4:20–4:58.
 *
 * Brief Section 12: an extended, luxurious Macro-to-Full-Reveal while the
 * voiceover delivers the commercial directives.
 *
 * This is where the long-form format genuinely pays off over the reel. The
 * reel had 13 seconds and could only flash the price and one URL. Here the
 * macro-to-reveal runs a full 12 seconds at the brief's own 35/65 ratio, the
 * price gets its own beat, and there is finally room to show the complete
 * product-page URL long enough for a viewer to actually read it — while
 * www.shivanshelectronics.in stays the primary marketed address throughout.
 *
 * One price only: Rs. 1,44,900, inclusive of GST. No rounding, no "starting
 * from", no second figure, no urgency framing. Shivansh Electronics is named
 * as Neumann's Authorized Partner; distributor, dealer and reseller appear
 * nowhere.
 *
 *   b1  360  the extended macro-to-full-reveal
 *   b2  330  the price, stated plainly
 *   b3  450  the full outro — both logos, every contact detail
 */
export const C7Cta: React.FC<{dur: number}> = ({dur}) => {
  const b1 = 360;
  const b2 = 330;
  const b3 = dur - b1 - b2; // 450

  return (
    <AbsoluteFill>
      <LFGround tone="cool" />
      <LFAmbient plates={['amb-b4', 'amb-b5']} dur={dur} intensity={0.8} drift={360} />
      <LFGrid opacity={0.3} />

      <Sequence from={0} durationInFrames={b1 + OVERLAP} layout="none">
        <RevealBeat dur={b1} />
      </Sequence>
      <Sequence from={b1} durationInFrames={b2 + OVERLAP} layout="none">
        <PriceBeat dur={b2} />
      </Sequence>
      <Sequence from={b1 + b2} durationInFrames={b3} layout="none">
        <OutroBeat dur={b3} />
      </Sequence>
    </AbsoluteFill>
  );
};

/**
 * The extended reveal: 12 seconds, opening on the grille at 3.2x with
 * simulated shallow depth of field and gliding back to the complete Studio
 * Set. At this length the brief's 35/65 macro-to-reveal split produces the
 * genuinely unhurried sequence it asks for, rather than a token gesture.
 */
const RevealBeat: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const p = beatFade(f, dur);
  const cam = macroReveal(f, dur, {x: 0.44, y: 0.46}, 3.2, 0.35);

  return (
    <div style={{opacity: p}}>
      <Shot
        src="macro-grille"
        x={SAFE.x + 340}
        y={SAFE.y}
        w={1144}
        h={SAFE.h}
        fit="cover"
        radius={24}
        cam={cam}
      />
      <LFBlock x={0} y={0} w={320} h={SAFE.h} justify="center" opacity={ramp(f, [40, 80], [0, 1])}>
        <Kicker color={C.accent} size={21} tracking={3.4}>
          Neumann
        </Kicker>
        <div style={{height: 14}} />
        <Display size={58} weight={800} color={C.ink} lh={0.90}>
          {'TLM 107\nSTUDIO SET'}
        </Display>
      </LFBlock>
    </div>
  );
};

/** The price, alone and confident. */
const PriceBeat: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const p = beatFade(f, dur);

  return (
    <div style={{opacity: p}}>
      <Shot
        src="nickel-front"
        x={SAFE.x + SAFE.w - 620}
        y={SAFE.y + 20}
        w={600}
        h={SAFE.h - 40}
        fit="contain"
        cam={gimbal(f, dur, 0.5)}
      />

      <LFBlock x={0} y={0} w={SAFE.w - 680} h={SAFE.h} justify="center">
        <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
          <Img src={logo('shivansh')} style={{width: 320, height: 'auto', display: 'block'}} />
        </div>
        <div style={{height: 24}} />
        <Micro size={20} color={C.inkDim} tracking={3.2}>
          {PARTNER}
        </Micro>
        <div style={{height: 26}} />
        <Micro size={20} color={C.inkDim} tracking={3.2}>
          {PRICE_LABEL}
        </Micro>
        <div style={{height: 10}} />
        <div style={{display: 'flex', alignItems: 'baseline', gap: 20, flexWrap: 'wrap'}}>
          <Display size={128} weight={800} color={C.ink} lh={0.86} caps={false}>
            {PRICE}
          </Display>
          <Spec size={30} color={C.inkSoft} weight={500} tracking={0.8}>
            {PRICE_NOTE}
          </Spec>
        </div>
        <div style={{height: 18}} />
        <Rule w={ease(f, [24, 60], [0, 220])} color={C.accent} thickness={6} />
        <div style={{height: 22}} />
        <Body size={30} color={C.inkSoft} lh={1.42}>
          {`${SELLER}, as ${PARTNER}, offers the TLM 107 Studio Set at this price — with the best available price on the website.`}
        </Body>
      </LFBlock>
    </div>
  );
};

/** The full outro: both logos, the primary URL, and every contact detail. */
const OutroBeat: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const p = beatFade(f, dur, 0, 0);
  // The outro is itself the branding moment, so unlike every other beat it
  // composes against the FULL frame height rather than leaving the reserved
  // branding band clear.
  const S = FULL;

  return (
    <div style={{opacity: p}}>
      {/* both logos, side by side, directly on the ground -- never boxed */}
      <div
        style={{
          position: 'absolute',
          left: S.x,
          top: S.y + 10,
          width: SAFE.w,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 66,
          opacity: ramp(f, [6, 34], [0, 1]),
        }}
      >
        <Img src={logo('neumann')} style={{width: 420, height: 'auto', display: 'block'}} />
        <div style={{width: 2, height: 92, backgroundColor: C.line}} />
        <Img src={logo('shivansh')} style={{width: 400, height: 'auto', display: 'block'}} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: S.x,
          top: S.y + 196,
          width: S.w,
          textAlign: 'center',
          opacity: ramp(f, [20, 48], [0, 1]),
        }}
      >
        <Micro size={21} color={C.inkDim} tracking={3.6}>
          {PARTNER}
        </Micro>
      </div>

      {/* the primary marketed URL -- the largest single element here */}
      <div
        style={{
          position: 'absolute',
          left: S.x,
          top: S.y + 258,
          width: S.w,
          textAlign: 'center',
          opacity: ramp(f, [28, 58], [0, 1]),
        }}
      >
        <div
          style={{
            fontFamily: F.display,
            fontWeight: 800,
            fontSize: 104,
            letterSpacing: -1,
            color: C.ink,
            lineHeight: 1,
          }}
        >
          {SITE}
        </div>
        <div style={{marginTop: 18}}>
          <Spec size={24} color={C.inkSoft} tracking={0.6}>
            {PRICE} · {PRICE_NOTE}
          </Spec>
        </div>
      </div>

      {/* the full product-page URL -- shown once, long enough to read */}
      <div
        style={{
          position: 'absolute',
          left: S.x,
          top: S.y + 486,
          width: S.w,
          textAlign: 'center',
          opacity: ramp(f, [50, 84], [0, 1]),
        }}
      >
        <Micro size={17} color={C.inkDim} tracking={2.4}>
          Product page
        </Micro>
        <div style={{height: 8}} />
        <Spec size={23} color={C.inkSoft} tracking={0.3}>
          {PRODUCT_PAGE_FULL}
        </Spec>
      </div>

      {/* contact detail */}
      <div
        style={{
          position: 'absolute',
          left: S.x,
          top: S.y + 596,
          width: S.w,
          display: 'flex',
          justifyContent: 'center',
          gap: 74,
          opacity: ramp(f, [64, 98], [0, 1]),
        }}
      >
        <div>
          <Micro size={17} color={C.inkDim} tracking={2.6}>
            WhatsApp
          </Micro>
          <div style={{height: 8}} />
          {WHATSAPP.map((w, i) => (
            <Spec
              key={w}
              size={22}
              color={C.inkSoft}
              tracking={0.6}
              style={{opacity: pop(f, stag(i, 3, 70)), marginBottom: 3}}
            >
              {w}
            </Spec>
          ))}
        </div>
        <div style={{width: 1, backgroundColor: C.line}} />
        <div>
          <Micro size={17} color={C.inkDim} tracking={2.6}>
            Also at
          </Micro>
          <div style={{height: 8}} />
          <Spec size={20} color={C.inkSoft} tracking={0.4}>
            {LINKTREE}
          </Spec>
          <div style={{height: 4}} />
          {SOCIAL.map((s, i) => (
            <Spec
              key={s.k}
              size={19}
              color={C.inkDim}
              tracking={0.3}
              style={{opacity: pop(f, stag(i, 2.6, 78)), marginBottom: 2}}
            >
              {s.v}
            </Spec>
          ))}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: S.x,
          top: S.y + S.h - 40,
          width: S.w,
          textAlign: 'center',
          opacity: ramp(f, [86, 118], [0, 1]),
        }}
      >
        <Micro size={16} color={C.inkDim} tracking={1.4} style={{textTransform: 'none'}}>
          {ADDRESS.replace('\n', ' ')}
        </Micro>
      </div>
    </div>
  );
};
