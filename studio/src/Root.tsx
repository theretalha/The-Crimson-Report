import React from 'react';
import {Composition} from 'remotion';
import {Episode, totalFrames} from './Episode';
import {EP002_HOOK} from './data/ep002-hook';
import {SHORT_001} from './data/short-001-taiwan';
import {PREVIEW} from './data/preview';
import {buildEp003} from './data/ep003';
import {StyleTest} from './pro/StyleTest';
import {ProbeSelfTest} from './components/ProbeSelfTest';
import {ThumbA, ThumbB, ThumbB2, ThumbC} from './Thumbs';
import {CurioTest, CurioTest2} from './stickman/CurioTest';
import {CurioFilm} from './stickman/CurioFilm';

const EP003 = buildEp003();
import {FPS, H, W} from './theme';

export const Root: React.FC = () => (
  <>
    {/* Shorts: vertical 1080x1920 */}
    <Composition id="Short-001-Taiwan" component={Episode} durationInFrames={totalFrames(SHORT_001)}
      fps={FPS} width={H} height={W} defaultProps={{scenes: SHORT_001}} />
    {/* EP 003: full long video, synced to the TTS audio */}
    <Composition id="EP003-Nvidia" component={Episode} durationInFrames={totalFrames(EP003)}
      fps={FPS} width={W} height={H} defaultProps={{scenes: EP003, audio: 'audio/ep003-mix.wav', sfx: false}} />
    <Composition id="Thumb-A" component={ThumbA} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="Thumb-B" component={ThumbB} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="Thumb-B2" component={ThumbB2} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="CurioTest" component={CurioTest} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="CurioTest2" component={CurioTest2} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="CurioFilm" component={CurioFilm} durationInFrames={300} fps={FPS} width={W} height={H} />
    <Composition id="Thumb-C" component={ThumbC} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="ProbeSelfTest" component={ProbeSelfTest} durationInFrames={10} fps={FPS} width={W} height={H} />
    <Composition id="StyleTest" component={StyleTest} durationInFrames={120} fps={FPS} width={W} height={H} />
    {/* Long video: 1920x1080 */}
    <Composition id="EP002-Hook" component={Episode} durationInFrames={totalFrames(EP002_HOOK)}
      fps={FPS} width={W} height={H} defaultProps={{scenes: EP002_HOOK}} />
    <Composition id="Preview" component={Episode} durationInFrames={totalFrames(PREVIEW)}
      fps={FPS} width={H} height={W} defaultProps={{scenes: PREVIEW}} />
  </>
);
