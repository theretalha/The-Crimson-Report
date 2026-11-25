import React from 'react';
import {Composition} from 'remotion';
import {Episode, totalFrames} from './Episode';
import {EP002_HOOK} from './data/ep002-hook';
import {FPS, H, W} from './theme';

export const Root: React.FC = () => (
  <>
    {/* Clean version: what goes on YouTube */}
    <Composition id="EP002-Hook" component={Episode} durationInFrames={totalFrames(EP002_HOOK)}
      fps={FPS} width={W} height={H} defaultProps={{scenes: EP002_HOOK, annotate: false}} />
    {/* Teaching version: yellow notes explain each retention trick */}
    <Composition id="EP002-Hook-Annotated" component={Episode} durationInFrames={totalFrames(EP002_HOOK)}
      fps={FPS} width={W} height={H} defaultProps={{scenes: EP002_HOOK, annotate: true}} />
  </>
);
