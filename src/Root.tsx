import React from 'react';
import {Composition} from 'remotion';
import {CANVAS, FPS, TOTAL_FRAMES} from './lib/theme';
import {Reel} from './Reel';
import {Thumbnail} from './Thumbnail';

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
  </>
);
