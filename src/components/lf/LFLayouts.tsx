import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, F, SAFE, SPLIT} from '../../lib/lf-theme';
import {Product} from '../../lib/images';
import {ease, gimbal, macroReveal, pop, ramp, stag, suspensionFlex} from '../../lib/anim';
import {Shot} from '../Media';
import {Body, Display, Kicker, Micro, Rule, Spec} from '../Type';
import {LFBlock} from './LFStage';

/**
 * The long-form's beat vocabulary.
 *
 * Landscape gives room for layouts the portrait reel could not hold — a text
 * column beside a large hero, three frames abreast, a wide stat row. Declaring
 * them once here keeps the seven chapters readable and, more importantly,
 * keeps text and media in separate columns by construction, so the collision
 * class that had to be fixed in the reel cannot recur.
 *
 * Every beat fades itself in and out through `p`, so chapters can butt beats
 * together without a blank frame at the seam.
 */

export type BeatProps = {dur: number};

/** Overlap, in frames, between consecutive beats inside a chapter. */
export const OVERLAP = 16;

/**
 * Beat opacity.
 *
 * Holds FULL opacity for the whole nominal duration, then dissolves out across
 * a tail that runs past it. Pair it with a Sequence of `dur + OVERLAP` and the
 * outgoing beat dissolves away to reveal the incoming one, which is already at
 * full underneath.
 *
 * The first version faded within the beat's own last frames, so where two
 * beats met the outgoing had already reached zero exactly as the incoming
 * started from zero — every seam rendered blank. The chapter's final beat gets
 * a Sequence of exactly `dur`, so it never enters the tail and stays solid
 * right up to the chapter cut.
 */
export const beatFade = (f: number, dur: number, inF = 0, tail = OVERLAP) =>
  Math.min(
    inF <= 0 ? 1 : ramp(f, [0, inF], [0, 1]),
    tail <= 0 ? 1 : ramp(f, [dur, dur + tail], [1, 0]),
  );

// ---------------------------------------------------------------------------

/**
 * SPLIT BEAT — a text column beside a single large hero image.
 *
 * The workhorse of the video. `side` puts the media right (default) or left,
 * alternating across chapters so the eye keeps moving.
 */
export const SplitBeat: React.FC<{
  dur: number;
  kicker?: string;
  kickerColor?: string;
  headline: string;
  body?: string;
  spec?: {k: string; v: string; u?: string}[];
  src: Product;
  side?: 'left' | 'right';
  fit?: 'contain' | 'cover';
  cam?: 'gimbal' | 'reveal' | 'flex' | 'none';
  focus?: {x: number; y: number};
  zoom?: number;
  headSize?: number;
}> = ({
  dur,
  kicker,
  kickerColor = C.accent,
  headline,
  body,
  spec = [],
  src,
  side = 'right',
  fit = 'contain',
  cam = 'gimbal',
  focus,
  zoom,
  headSize = 76,
}) => {
  const f = useCurrentFrame();
  const p = beatFade(f, dur);

  const mediaX = side === 'right' ? SPLIT.textW + SPLIT.gap : 0;
  const textX = side === 'right' ? 0 : SPLIT.mediaW + SPLIT.gap;

  const camObj =
    cam === 'reveal'
      ? macroReveal(f, dur, focus ?? {x: 0.5, y: 0.44}, zoom ?? 2.8)
      : cam === 'gimbal'
        ? gimbal(f, dur, 0.85)
        : undefined;
  const flex = cam === 'flex' ? suspensionFlex(f, dur, 2.4) : null;

  return (
    <div style={{opacity: p}}>
      <Shot
        src={src}
        x={SAFE.x + mediaX}
        y={SAFE.y}
        w={SPLIT.mediaW}
        h={SAFE.h}
        fit={fit}
        radius={22}
        cam={flex ? {scale: flex.scale, x: 0, y: flex.y, blur: 0} : camObj}
        rot={flex ? flex.rot : 0}
      />

      <LFBlock x={textX} y={0} w={SPLIT.textW} h={SAFE.h} justify="center">
        {kicker ? (
          <div style={{marginBottom: 18, opacity: ramp(f, [6, 24], [0, 1])}}>
            <Kicker color={kickerColor} size={22} tracking={3.4}>
              {kicker}
            </Kicker>
          </div>
        ) : null}

        <Display size={headSize} weight={800} color={C.ink} lh={0.92}>
          {headline}
        </Display>

        {body ? (
          <>
            <div style={{height: 22}} />
            <Rule w={ease(f, [12, 44], [0, 104])} color={kickerColor} thickness={5} />
            <div style={{height: 22}} />
            <Body size={29} color={C.inkSoft} lh={1.42}>
              {body}
            </Body>
          </>
        ) : null}

        {spec.length ? (
          <>
            <div style={{height: 30}} />
            <div style={{display: 'flex', gap: 40, flexWrap: 'wrap'}}>
              {spec.map((s, i) => (
                <div key={s.k} style={{opacity: pop(f, stag(i, 6, 26))}}>
                  <Micro size={17} color={C.inkDim} tracking={2.6}>
                    {s.k}
                  </Micro>
                  <div style={{display: 'flex', alignItems: 'baseline', gap: 7, marginTop: 4}}>
                    <span
                      style={{
                        fontFamily: F.mono,
                        fontWeight: 700,
                        fontSize: 42,
                        color: C.ink,
                        letterSpacing: 0.2,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {s.v}
                    </span>
                    {s.u ? (
                      <span style={{fontFamily: F.mono, fontSize: 24, color: C.inkSoft}}>{s.u}</span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </LFBlock>
    </div>
  );
};

/**
 * HERO BEAT — one image large and centred, with the headline above or below.
 * Used where the photograph itself is the argument.
 */
export const HeroBeat: React.FC<{
  dur: number;
  headline?: string;
  sub?: string;
  src: Product;
  cam?: 'gimbal' | 'reveal' | 'flex';
  focus?: {x: number; y: number};
  zoom?: number;
  textAt?: 'top' | 'bottom';
  fit?: 'contain' | 'cover';
  mediaW?: number;
}> = ({
  dur,
  headline,
  sub,
  src,
  cam = 'gimbal',
  focus,
  zoom,
  textAt = 'bottom',
  fit = 'contain',
  mediaW = 980,
}) => {
  const f = useCurrentFrame();
  const p = beatFade(f, dur);
  const textH = 210;
  const mediaH = SAFE.h - textH - 24;
  const mediaY = textAt === 'bottom' ? 0 : textH + 24;
  const textY = textAt === 'bottom' ? mediaH + 24 : 0;

  const camObj =
    cam === 'reveal'
      ? macroReveal(f, dur, focus ?? {x: 0.5, y: 0.44}, zoom ?? 3.0)
      : gimbal(f, dur, 0.8);
  const flex = cam === 'flex' ? suspensionFlex(f, dur, 2.6) : null;

  return (
    <div style={{opacity: p}}>
      <Shot
        src={src}
        x={SAFE.x + (SAFE.w - mediaW) / 2}
        y={SAFE.y + mediaY}
        w={mediaW}
        h={mediaH}
        fit={fit}
        radius={22}
        cam={flex ? {scale: flex.scale, x: 0, y: flex.y, blur: 0} : camObj}
        rot={flex ? flex.rot : 0}
      />
      {headline ? (
        <LFBlock x={0} y={textY} w={SAFE.w} h={textH} justify="center" style={{alignItems: 'center'}}>
          <Display size={72} weight={800} color={C.ink} lh={0.92} align="center">
            {headline}
          </Display>
          {sub ? (
            <div style={{marginTop: 16, textAlign: 'center'}}>
              <Body size={28} color={C.inkSoft} align="center">
                {sub}
              </Body>
            </div>
          ) : null}
        </LFBlock>
      ) : null}
    </div>
  );
};

/**
 * TRIO BEAT — three frames abreast under a shared headline.
 * The long-form's montage tier, for supporting frames that do not warrant a
 * hero of their own.
 */
export const TrioBeat: React.FC<{
  dur: number;
  headline: string;
  sub?: string;
  srcs: [Product, Product, Product];
  captions?: [string, string, string];
}> = ({dur, headline, sub, srcs, captions}) => {
  const f = useCurrentFrame();
  const p = beatFade(f, dur);
  const gap = 30;
  const cw = Math.floor((SAFE.w - gap * 2) / 3);
  const headH = 220;
  const ch = SAFE.h - headH - (captions ? 62 : 0) - 20;

  return (
    <div style={{opacity: p}}>
      <LFBlock x={0} y={0} w={SAFE.w} h={headH} justify="center" style={{alignItems: 'center'}}>
        <Display size={66} weight={800} color={C.ink} lh={0.92} align="center">
          {headline}
        </Display>
        {sub ? (
          <div style={{marginTop: 14}}>
            <Body size={27} color={C.inkSoft} align="center">
              {sub}
            </Body>
          </div>
        ) : null}
      </LFBlock>

      {srcs.map((s, i) => (
        <React.Fragment key={s}>
          <Shot
            src={s}
            x={SAFE.x + i * (cw + gap)}
            y={SAFE.y + headH}
            w={cw}
            h={ch}
            fit="contain"
            radius={18}
            cam={gimbal(f, dur, 0.6 + i * 0.08)}
            opacity={ramp(f, [10 + i * 9, 34 + i * 9], [0, 1])}
          />
          {captions ? (
            <div
              style={{
                position: 'absolute',
                left: SAFE.x + i * (cw + gap),
                top: SAFE.y + headH + ch + 14,
                width: cw,
                textAlign: 'center',
                opacity: ramp(f, [20 + i * 9, 44 + i * 9], [0, 1]),
              }}
            >
              <Micro size={19} color={C.inkDim} tracking={2.4}>
                {captions[i]}
              </Micro>
            </div>
          ) : null}
        </React.Fragment>
      ))}
    </div>
  );
};

/**
 * STAT BEAT — a wide row of verified figures over a quiet backdrop image.
 * Only ever carries values marked VERIFIED in the brief's Section 4 table.
 */
export const StatBeat: React.FC<{
  dur: number;
  headline: string;
  sub?: string;
  stats: {k: string; v: string; u?: string; accent?: string}[];
  src?: Product;
}> = ({dur, headline, sub, stats, src}) => {
  const f = useCurrentFrame();
  const p = beatFade(f, dur);

  return (
    <div style={{opacity: p}}>
      {src ? (
        <Shot
          src={src}
          x={SAFE.x + SAFE.w - 620}
          y={SAFE.y + 40}
          w={600}
          h={SAFE.h - 80}
          fit="contain"
          radius={20}
          cam={gimbal(f, dur, 0.7)}
          opacity={0.98}
        />
      ) : null}

      <LFBlock x={0} y={0} w={src ? SAFE.w - 660 : SAFE.w} h={SAFE.h} justify="center">
        <Display size={70} weight={800} color={C.ink} lh={0.92}>
          {headline}
        </Display>
        {sub ? (
          <>
            <div style={{height: 18}} />
            <Body size={28} color={C.inkSoft}>
              {sub}
            </Body>
          </>
        ) : null}
        <div style={{height: 40}} />
        <div style={{display: 'flex', gap: 54, flexWrap: 'wrap'}}>
          {stats.map((s, i) => (
            <div key={s.k} style={{opacity: pop(f, stag(i, 7, 22))}}>
              <Micro size={18} color={C.inkDim} tracking={2.6}>
                {s.k}
              </Micro>
              <div style={{display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6}}>
                <span
                  style={{
                    fontFamily: F.mono,
                    fontWeight: 700,
                    fontSize: 62,
                    color: s.accent ?? C.ink,
                    letterSpacing: 0.2,
                    fontVariantNumeric: 'tabular-nums',
                    lineHeight: 1,
                  }}
                >
                  {s.v}
                </span>
                {s.u ? (
                  <span style={{fontFamily: F.mono, fontSize: 28, color: C.inkSoft}}>{s.u}</span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </LFBlock>
    </div>
  );
};

/** TITLE BEAT — type only, for chapter openings and statements. */
export const TitleBeat: React.FC<{
  dur: number;
  kicker?: string;
  headline: string;
  sub?: string;
  align?: 'left' | 'center';
  size?: number;
}> = ({dur, kicker, headline, sub, align = 'center', size = 92}) => {
  const f = useCurrentFrame();
  const p = beatFade(f, dur);
  return (
    <LFBlock
      x={0}
      y={0}
      w={SAFE.w}
      h={SAFE.h}
      justify="center"
      opacity={p}
      style={{alignItems: align === 'center' ? 'center' : 'flex-start'}}
    >
      {kicker ? (
        <div style={{marginBottom: 22}}>
          <Kicker color={C.accent} size={24} tracking={3.8}>
            {kicker}
          </Kicker>
        </div>
      ) : null}
      <Display size={size} weight={800} color={C.ink} lh={0.90} align={align}>
        {headline}
      </Display>
      {sub ? (
        <div style={{marginTop: 26, maxWidth: 1300}}>
          <Body size={31} color={C.inkSoft} align={align} lh={1.42}>
            {sub}
          </Body>
        </div>
      ) : null}
    </LFBlock>
  );
};
