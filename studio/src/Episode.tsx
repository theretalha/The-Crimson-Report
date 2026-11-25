import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {Frame} from './components/Frame';
import {Bed, SceneSfx} from './components/Sfx';
import {CardsT, IconT, MapT, QuoteT, SplitT, StatT, TimelineT, TitleT} from './templates/Templates';
import {DocumentT, HeadlineT, NewspaperT, PhotosT, TweetT} from './templates/Clips';
import {FPS} from './theme';
import type {Scene} from './types';

// Frame positions come from cumulative seconds, so rounding never drifts away from the audio.
const startFrames = (scenes: Scene[]) => {
  const out: number[] = [];
  let t = 0;
  for (const s of scenes) { out.push(Math.round(t * FPS)); t += s.seconds; }
  out.push(Math.round(t * FPS));
  return out;
};
export const totalFrames = (scenes: Scene[]) => startFrames(scenes)[scenes.length];

const Body: React.FC<{scene: Scene}> = ({scene}) => {
  switch (scene.template) {
    case 'title': return <TitleT scene={scene} />;
    case 'icon': return <IconT scene={scene} />;
    case 'quote': return <QuoteT scene={scene} />;
    case 'stat': return <StatT scene={scene} />;
    case 'split': return <SplitT scene={scene} />;
    case 'cards': return <CardsT scene={scene} />;
    case 'map': return <MapT scene={scene} />;
    case 'timeline': return <TimelineT scene={scene} />;
    case 'headline': return <HeadlineT scene={scene} />;
    case 'document': return <DocumentT scene={scene} />;
    case 'tweet': return <TweetT scene={scene} />;
    case 'photos': return <PhotosT scene={scene} />;
    case 'newspaper': return <NewspaperT scene={scene} />;
  }
};

export type EpisodeProps = {scenes: Scene[]; annotate?: boolean; audio?: string; sfx?: boolean};

// Plays scenes back to back. Drop the TTS file in /public and pass its name as `audio`.
export const Episode: React.FC<EpisodeProps> = ({scenes, annotate, audio, sfx = true}) => {
  const starts = startFrames(scenes);
  const total = starts[scenes.length];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {audio && <Audio src={staticFile(audio)} />}
      {sfx && audio && <Bed />}
      {scenes.map((s, i) => {
        const from = starts[i];
        const dur = starts[i + 1] - starts[i];
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <Frame scene={s} index={i} startFrame={from} totalFrames={total} prevMood={scenes[i - 1]?.mood} annotate={annotate}>
              <Body scene={s} />
            </Frame>
            {sfx && <SceneSfx scene={s} index={i} prevMood={scenes[i - 1]?.mood} />}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
