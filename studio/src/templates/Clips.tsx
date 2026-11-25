import React from 'react';
import {Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT_BODY, FONT_HEAD, FONT_MONO} from '../theme';
import type {Scene} from '../types';

// Reference clips: real headlines, documents and posts, rebuilt in our style.
// Rule: everything shown must be real. Keep `url` filled in as proof.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
type S<T extends Scene['template']> = {scene: Extract<Scene, {template: T}>};

const useCardIn = () => {
  const f = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const s = spring({frame: f - 2, fps, config: {damping: 14, mass: 0.8}});
  return {f, s, v: height > width};
};

// Text with a marker-pen highlight that sweeps across the key phrase
const Marked: React.FC<{text: string; mark: string; start: number; color?: string}> = ({text, mark, start, color = C.crimson}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [start, start + 14], [0, 100], clamp);
  const i = mark ? text.toLowerCase().indexOf(mark.toLowerCase()) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span style={{
        backgroundImage: `linear-gradient(${color}, ${color})`, backgroundRepeat: 'no-repeat',
        backgroundSize: `${p}% 100%`, color: p > 40 ? C.white : 'inherit', padding: '0 6px', margin: '0 -6px',
        boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone',
      }}>{text.slice(i, i + mark.length)}</span>
      {text.slice(i + mark.length)}
    </>
  );
};

// ---------- HEADLINE: real news clip (thumbnail/screenshot + outlet + headline) ----------
export const HeadlineT: React.FC<S<'headline'>> = ({scene}) => {
  const {f, s, v} = useCardIn();
  const {durationInFrames} = useVideoConfig();
  const w = v ? 960 : 1100;
  const zoom = interpolate(f, [0, durationInFrames], [1.0, 1.12]);
  return (
    <div style={{position: 'absolute', left: '50%', top: v ? 300 : 210, width: w, marginLeft: -w / 2,
      transform: `translateY(${(1 - s) * 500}px) rotate(${interpolate(s, [0, 1], [6, -1.5])}deg)`,
      background: C.paper, boxShadow: '0 30px 80px rgba(0,0,0,0.6)', borderRadius: 6, overflow: 'hidden'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: C.ink,
        fontFamily: FONT_MONO, fontWeight: 700, fontSize: v ? 24 : 20, letterSpacing: 2, color: C.paper}}>
        <span><span style={{color: C.crimson}}>●</span> {scene.outlet}</span>
        <span style={{color: '#9A958F'}}>{scene.date}</span>
      </div>
      <div style={{position: 'relative', width: w, height: w * 9 / 16, overflow: 'hidden', background: '#000'}}>
        <Img src={staticFile(scene.image)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`}} />
        <div style={{position: 'absolute', left: 18, top: 18, background: C.crimson, color: C.white, fontFamily: FONT_MONO,
          fontWeight: 700, fontSize: v ? 22 : 18, padding: '6px 12px', letterSpacing: 2}}>NEWS CLIP</div>
      </div>
      <div style={{padding: v ? '26px 30px 34px' : '22px 28px 28px', fontFamily: FONT_BODY, fontWeight: 800,
        fontSize: v ? 54 : 44, lineHeight: 1.18, color: C.ink}}>
        <Marked text={scene.headline} mark={scene.mark} start={18} />
      </div>
    </div>
  );
};

// ---------- DOCUMENT: transcript / report page with the key line marked ----------
export const DocumentT: React.FC<S<'document'>> = ({scene}) => {
  const {f, s, v} = useCardIn();
  const {durationInFrames} = useVideoConfig();
  const w = v ? 940 : 1000;
  const zoom = interpolate(f, [0, durationInFrames], [1, 1.1]);
  const bars = (n: number, key: string) => Array.from({length: n}, (_, i) => (
    <div key={key + i} style={{height: 14, margin: '14px 0', background: '#CFC8BB', width: `${70 + ((i * 37) % 30)}%`, borderRadius: 3}} />
  ));
  return (
    <div style={{position: 'absolute', left: '50%', top: v ? 300 : 200, width: w, marginLeft: -w / 2,
      transform: `translateY(${(1 - s) * 500}px) rotate(${interpolate(s, [0, 1], [-5, 1])}deg) scale(${zoom})`, transformOrigin: '50% 60%',
      background: '#FBF8F1', padding: v ? '44px 50px' : '36px 44px', boxShadow: '0 30px 80px rgba(0,0,0,0.6)', boxSizing: 'border-box'}}>
      <div style={{fontFamily: FONT_MONO, fontWeight: 700, fontSize: v ? 22 : 18, letterSpacing: 3, color: C.crimson}}>OFFICIAL TRANSCRIPT</div>
      <div style={{fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: v ? 44 : 36, color: C.ink, marginTop: 8}}>{scene.docTitle}</div>
      <div style={{fontFamily: FONT_MONO, fontSize: v ? 22 : 18, color: '#7A746C', marginTop: 6, paddingBottom: 18, borderBottom: '3px solid #0E0E0E'}}>{scene.docMeta}</div>
      {bars(3, 'a')}
      <div style={{fontFamily: 'Georgia, serif', fontSize: v ? 50 : 40, lineHeight: 1.35, color: C.ink, margin: '22px 0'}}>
        <Marked text={scene.quote} mark={scene.mark} start={22} />
      </div>
      {bars(3, 'b')}
    </div>
  );
};

// ---------- TWEET: real post from X, rebuilt as a clean card ----------
export const TweetT: React.FC<S<'tweet'>> = ({scene}) => {
  const {s, v} = useCardIn();
  const w = v ? 940 : 900;
  const initials = scene.name.split(' ').map((p) => p[0]).join('').slice(0, 2);
  return (
    <div style={{position: 'absolute', left: '50%', top: v ? 420 : 260, width: w, marginLeft: -w / 2,
      transform: `translateY(${(1 - s) * 500}px) rotate(${interpolate(s, [0, 1], [4, -1])}deg)`,
      background: '#16181C', borderRadius: 24, padding: 40, boxSizing: 'border-box', boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
      border: '1px solid #2F3336', color: '#E7E9EA', fontFamily: FONT_BODY}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
        <div style={{width: 90, height: 90, borderRadius: '50%', background: C.crimson, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontFamily: FONT_HEAD, fontSize: 40}}>{initials}</div>
        <div>
          <div style={{fontWeight: 800, fontSize: 38}}>{scene.name}</div>
          <div style={{fontSize: 30, color: '#71767B'}}>{scene.handle}</div>
        </div>
      </div>
      <div style={{fontSize: v ? 50 : 42, lineHeight: 1.3, margin: '28px 0'}}>
        <Marked text={scene.text} mark={scene.mark} start={18} />
      </div>
      <div style={{fontSize: 28, color: '#71767B'}}>{scene.date}</div>
    </div>
  );
};
