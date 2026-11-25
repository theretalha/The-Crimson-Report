import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig} from 'remotion';
import {Frame} from './components/Frame';
import {Probe} from './components/Probe';
import {Bed, SceneSfx} from './components/Sfx';
import {CardsT, IconT, MapT, QuoteT, SplitT, StatT, TimelineT, TitleT} from './templates/Templates';
import {DocumentT, HeadlineT, NewspaperT, PhotosT, TweetT} from './templates/Clips';
import {ChartT} from './templates/StockChart';
import {RecipeT} from './templates/Recipes';
import {EntityMapT} from './templates/EntityMap';
import {IconPlusT, StatPlusT, TimelineCardsT, TitlePlusT} from './templates/Upgraded';
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
  const {width, height} = useVideoConfig();
  const land = width > height; // the upgraded templates are for 16:9; Shorts keep the older ones
  switch (scene.template) {
    case 'title': return land ? <TitlePlusT scene={scene} /> : <TitleT scene={scene} />;
    case 'icon': return land ? <IconPlusT scene={scene} /> : <IconT scene={scene} />;
    case 'quote': return <QuoteT scene={scene} />;
    case 'stat': return land ? <StatPlusT scene={scene} /> : <StatT scene={scene} />;
    case 'split': return <SplitT scene={scene} />;
    case 'cards': return <CardsT scene={scene} />;
    case 'map': return <MapT scene={scene} />;
    case 'timeline': return land ? <TimelineCardsT scene={scene} /> : <TimelineT scene={scene} />;
    case 'chart': return <ChartT scene={scene} />;
    case 'recipe': return <RecipeT scene={scene} />;
    case 'entities': return <EntityMapT scene={scene as any} />;
    case 'headline': return <HeadlineT scene={scene} />;
    case 'document': return <DocumentT scene={scene} />;
    case 'tweet': return <TweetT scene={scene} />;
    case 'photos': return <PhotosT scene={scene} />;
    case 'newspaper': return <NewspaperT scene={scene} />;
  }
};

export type EpisodeProps = {scenes: Scene[]; annotate?: boolean; audio?: string; sfx?: boolean; probe?: boolean};

// Plays scenes back to back. Drop the TTS file in /public and pass its name as `audio`.
export const Episode: React.FC<EpisodeProps> = ({scenes, annotate, audio, sfx = true, probe}) => {
  const starts = startFrames(scenes);
  const total = starts[scenes.length];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {probe && <Probe />}
      {audio && <Audio src={staticFile(audio)} />}
      {sfx && audio && <Bed />}
      {scenes.map((s, i) => {
        const from = starts[i];
        const dur = starts[i + 1] - starts[i];
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <Frame scene={s} index={i} startFrame={from} totalFrames={total} prevMood={scenes[i - 1]?.mood} chapterStart={i > 0 && scenes[i - 1].chapter !== s.chapter} annotate={annotate}>
              <Body scene={s} />
            </Frame>
            {sfx && <SceneSfx scene={s} index={i} prevMood={scenes[i - 1]?.mood} />}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
