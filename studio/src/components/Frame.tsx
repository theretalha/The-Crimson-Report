import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT_BODY, FONT_HEAD, FONT_MONO, MOODS} from '../theme';
import type {Scene} from '../types';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

type Props = {
  scene: Scene;
  index: number; // scene number in the episode (for FORECAST FILE · 0NN)
  startFrame: number; // where this scene starts in the whole video
  totalFrames: number;
  prevMood?: Scene['mood'];
  annotate?: boolean;
  children: React.ReactNode;
};

// The shell every scene sits in: background, top bar, headline, captions, source, progress bar.
export const Frame: React.FC<Props> = ({scene, index, startFrame, totalFrames, prevMood, annotate, children}) => {
  const f = useCurrentFrame();
  const {fps, durationInFrames, width, height} = useVideoConfig();
  const v = height > width; // vertical = Shorts
  const m = MOODS[scene.mood];

  // slow camera push-in: the screen is never fully still
  const push = interpolate(f, [0, durationInFrames], [1, 1.045]);
  // quick punch-in on every cut
  const punch = spring({frame: f, fps, config: {damping: 18, mass: 0.5}});
  const flash = prevMood && prevMood !== scene.mood ? interpolate(f, [0, 4], [0.85, 0], clamp) : 0;
  const progress = (startFrame + f) / totalFrames;

  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 60% 55%, ${m.bg} 0%, ${m.bg2} 100%)`, overflow: 'hidden'}}>
      {/* faint grid */}
      <AbsoluteFill style={{
        backgroundImage: `linear-gradient(${m.line} 2px, transparent 2px), linear-gradient(90deg, ${m.line} 2px, transparent 2px)`,
        backgroundSize: '80px 80px', transform: `scale(${push})`,
      }} />

      {/* main visual */}
      <AbsoluteFill style={{transform: `scale(${push * interpolate(punch, [0, 1], [1.08, 1])})`, opacity: interpolate(f, [0, 3], [0, 1], clamp)}}>
        {children}
      </AbsoluteFill>

      {/* top bar */}
      <div style={{position: 'absolute', top: v ? 90 : 36, left: 64, right: 64, display: 'flex', justifyContent: 'space-between',
        fontFamily: FONT_MONO, fontWeight: 700, fontSize: v ? 24 : 20, letterSpacing: 3, color: m.muted,
        borderBottom: `2px solid ${m.line}`, paddingBottom: 14}}>
        <span><span style={{color: scene.mood === 'danger' ? C.paper : C.crimson}}>■</span> THE CRIMSON FORECAST</span>
        {!v && <span>{scene.chapter}</span>}
        <span>FORECAST FILE · {String(index + 1).padStart(3, '0')}</span>
      </div>

      {/* headline */}
      {scene.title && <Headline text={scene.title} sub={scene.sub} fg={m.fg} muted={m.muted} v={v} />}

      {/* source line */}
      {scene.source && (
        <div style={{position: 'absolute', left: 64, right: 64, bottom: v ? 450 : 64, fontFamily: FONT_MONO, fontSize: v ? 22 : 18, color: m.muted,
          opacity: interpolate(f, [8, 16], [0, 1], clamp), borderLeft: `4px solid ${C.crimson}`, paddingLeft: 12}}>
          SOURCE · {scene.source}
        </div>
      )}

      <Captions scene={scene} v={v} />

      {/* progress bar */}
      <div style={{position: 'absolute', left: 64, right: 64, ...(v ? {top: 140} : {bottom: 36}), height: 4, background: m.line}}>
        <div style={{width: `${progress * 100}%`, height: '100%', background: scene.mood === 'danger' ? C.paper : C.crimson}} />
      </div>

      {annotate && scene.note && <Note text={scene.note} />}

      <AbsoluteFill style={{background: C.white, opacity: flash, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};

const Headline: React.FC<{text: string; sub?: string; fg: string; muted: string; v: boolean}> = ({text, sub, fg, muted, v}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = text.split(' ');
  return (
    <div style={{position: 'absolute', top: v ? 190 : 100, left: 64, maxWidth: v ? 950 : 1200}}>
      <div style={{fontFamily: FONT_HEAD, fontSize: v ? 112 : 104, lineHeight: 1.02, color: fg, display: 'flex', flexWrap: 'wrap', gap: '0 26px'}}>
        {words.map((w, i) => {
          const s = spring({frame: f - 2 - i * 3, fps, config: {damping: 16}});
          return (
            <span key={i} style={{overflow: 'hidden', display: 'inline-block'}}>
              <span style={{display: 'inline-block', transform: `translateY(${(1 - s) * 110}%)`}}>{w}</span>
            </span>
          );
        })}
      </div>
      {sub && (
        <div style={{fontFamily: FONT_BODY, fontSize: v ? 40 : 34, color: muted, marginTop: 10,
          opacity: interpolate(f, [10, 18], [0, 1], clamp), transform: `translateY(${interpolate(f, [10, 18], [12, 0], clamp)}px)`}}>
          {sub}
        </div>
      )}
    </div>
  );
};

// Karaoke captions: phrase shown in chunks, the spoken word sits in a crimson box.
const Captions: React.FC<{scene: Scene; v: boolean}> = ({scene, v}) => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const words = scene.caption.split(' ');
  const speakFrames = durationInFrames * 0.9;
  const active = Math.min(words.length - 1, Math.floor((f / speakFrames) * words.length));
  const CHUNK = v ? 3 : 6;
  const chunkStart = Math.floor(active / CHUNK) * CHUNK;
  const chunk = words.slice(chunkStart, chunkStart + CHUNK);
  const hl = new Set((scene.highlight ?? []).map((w) => w.toLowerCase()));
  const boxColor = scene.mood === 'danger' ? C.ink : C.crimson;

  return (
    <div style={{position: 'absolute', bottom: v ? 560 : 110, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <div style={{background: 'rgba(10,10,10,0.82)', padding: '12px 22px', borderRadius: 8, display: 'flex', gap: 12,
        fontFamily: FONT_BODY, fontWeight: 800, fontSize: v ? 64 : 46, color: C.paper}}>
        {chunk.map((w, i) => {
          const idx = chunkStart + i;
          const isActive = idx === active;
          const isKey = hl.has(w.toLowerCase());
          return (
            <span key={idx} style={{
              padding: '0 8px', borderRadius: 4,
              background: isActive ? boxColor : 'transparent',
              color: isActive ? C.white : isKey ? '#FF5A5F' : C.paper,
              opacity: idx > active ? 0.35 : 1,
            }}>{w}</span>
          );
        })}
      </div>
    </div>
  );
};

const Note: React.FC<{text: string}> = ({text}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', top: 100, right: 64, width: 470, background: '#FFE14D', color: C.ink,
      fontFamily: FONT_BODY, fontWeight: 600, fontSize: 24, lineHeight: 1.3, padding: '16px 20px', borderRadius: 6,
      boxShadow: '0 8px 30px rgba(0,0,0,0.35)', opacity: interpolate(f, [4, 10], [0, 1], clamp), transform: 'rotate(1.5deg)'}}>
      <div style={{fontFamily: FONT_MONO, fontWeight: 700, fontSize: 16, letterSpacing: 2, marginBottom: 6}}>RETENTION TRICK</div>
      {text}
    </div>
  );
};
