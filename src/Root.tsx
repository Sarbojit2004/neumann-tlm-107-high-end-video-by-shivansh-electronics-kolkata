import React from 'react';
import {Composition} from 'remotion';
import {CANVAS, FPS, TOTAL_FRAMES} from './lib/theme';
import {CANVAS as LF_CANVAS, TOTAL_FRAMES as LF_FRAMES} from './lib/lf-theme';
import {Reel} from './Reel';
import {Thumbnail} from './Thumbnail';
import {Longform} from './Longform';
import {LongformThumbnail} from './LongformThumbnail';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Reel"
      component={Reel}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={CANVAS.w}
      height={CANVAS.h}
    />
    <Composition
      id="Thumbnail"
      component={Thumbnail}
      durationInFrames={1}
      fps={FPS}
      width={CANVAS.w}
      height={CANVAS.h}
    />
    <Composition
      id="Longform"
      component={Longform}
      durationInFrames={LF_FRAMES}
      fps={FPS}
      width={LF_CANVAS.w}
      height={LF_CANVAS.h}
    />
    <Composition
      id="LongformThumbnail"
      component={LongformThumbnail}
      durationInFrames={1}
      fps={FPS}
      width={LF_CANVAS.w}
      height={LF_CANVAS.h}
    />
  </>
);
