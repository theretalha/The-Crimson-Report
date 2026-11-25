import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {Frame} from './components/Frame';
import {CardsT, IconT, MapT, QuoteT, SplitT, StatT, TitleT} from './templates/Templates';
import {DocumentT, HeadlineT, TweetT} from './templates/Clips';
import {FPS} from './theme';
import type {Scene} from './types';

export const sceneFrames = (s: Scene) => Math.round(s.seconds * FPS);
export const totalFrames = (scenes: Scene[]) => scenes.reduce((a, s) => a + sceneFrames(s), 0);

const Body: React.FC<{scene: Scene}> = ({scene}) => {
  switch (scene.template) {
    case 'title': return <TitleT scene={scene} />;
    case 'icon': return <IconT scene={scene} />;
    case 'quote': return <QuoteT scene={scene} />;
    case 'stat': return <StatT scene={scene} />;
    case 'split': return <SplitT scene={scene} />;
    case 'cards': return <CardsT scene={scene} />;
    case 'map': return <MapT scene={scene} />;
    case 'headline': return <HeadlineT scene={scene} />;
    case 'document': return <DocumentT scene={scene} />;
    case 'tweet': return <TweetT scene={scene} />;
  }
};

export type EpisodeProps = {scenes: Scene[]; annotate?: boolean; audio?: string};

// Plays scenes back to back. Drop the TTS file in /public and pass its name as `audio`.
export const Episode: React.FC<EpisodeProps> = ({scenes, annotate, audio}) => {
  const total = totalFrames(scenes);
  let start = 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {audio && <Audio src={staticFile(audio)} />}
      {scenes.map((s, i) => {
        const from = start;
        const dur = sceneFrames(s);
        start += dur;
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <Frame scene={s} index={i} startFrame={from} totalFrames={total} prevMood={scenes[i - 1]?.mood} annotate={annotate}>
              <Body scene={s} />
            </Frame>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
