import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {geoMercator, geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
import world from 'world-atlas/countries-50m.json';
import {C, FONT_BODY, FONT_HEAD, FONT_MONO, MOODS} from '../theme';
import type {Scene} from '../types';
import {Icon} from '../components/Icons';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
type S<T extends Scene['template']> = {scene: Extract<Scene, {template: T}>};

const useV = () => {
  const {width, height} = useVideoConfig();
  return height > width;
};

const usePop = (delay = 0) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - delay, fps, config: {damping: 11, mass: 0.7}});
};

// ---------- TITLE: one huge statement ----------
export const TitleT: React.FC<S<'title'>> = ({scene}) => {
  const f = useCurrentFrame();
  const m = MOODS[scene.mood];
  const s = usePop(0);
  const g = scene.glitch ? Math.max(0, 1 - f / 18) : 0;
  const jitter = (n: number) => (scene.glitch ? Math.sin(f * 7.3 + n) * 14 * g : 0);
  const size = scene.big.length > 8 ? 150 : 340;
  const base: React.CSSProperties = {position: 'absolute', fontFamily: FONT_HEAD, fontSize: size, lineHeight: 1, letterSpacing: 2, textAlign: 'center', width: '100%'};
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <div style={{position: 'relative', width: '100%', height: size, transform: `scale(${interpolate(s, [0, 1], [0.7, 1])})`}}>
        {scene.glitch && <div style={{...base, color: C.crimson, transform: `translate(${jitter(1)}px, ${jitter(2)}px)`, opacity: 0.9}}>{scene.big}</div>}
        {scene.glitch && <div style={{...base, color: '#2AD4FF', transform: `translate(${-jitter(3)}px, ${jitter(4)}px)`, opacity: 0.6 * g, mixBlendMode: 'screen'}}>{scene.big}</div>}
        <div style={{...base, color: m.fg}}>{scene.big}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- ICON: one animated object, right side ----------
export const IconT: React.FC<S<'icon'>> = ({scene}) => {
  const m = MOODS[scene.mood];
  const s = usePop(4);
  const main = scene.mood === 'facts' ? C.ink : scene.mood === 'danger' ? C.ink : C.paper;
  const accent = scene.mood === 'danger' ? C.paper : C.crimson;
  const v = useV();
  return (
    <div style={{position: 'absolute', ...(v ? {left: 190, top: 560, width: 700, height: 700} : {left: 1080, top: 260, width: 600, height: 600}),
      transform: `scale(${s}) rotate(${interpolate(s, [0, 1], [-6, 0])}deg)`}}>
      <div style={{position: 'absolute', inset: 40, borderRadius: '50%', background: m.line, filter: 'blur(2px)'}} />
      <Icon name={scene.icon} main={main} accent={accent} />
    </div>
  );
};

// ---------- QUOTE: silhouette + quote card + source ----------
export const QuoteT: React.FC<S<'quote'>> = ({scene}) => {
  const m = MOODS[scene.mood];
  const s = usePop(6);
  const q = usePop(12);
  return (
    <>
      <div style={{position: 'absolute', right: 90, bottom: 190, width: 460, height: 460, transform: `translateY(${(1 - s) * 200}px)`, opacity: s}}>
        <Icon name={scene.icon} main={scene.mood === 'facts' ? C.ink : '#2A2A2A'} accent={C.crimson} />
      </div>
      <div style={{position: 'absolute', left: 64, top: 400, width: 1050, transform: `translateX(${(1 - q) * -80}px)`, opacity: q}}>
        <div style={{fontFamily: FONT_HEAD, fontSize: 92, lineHeight: 1.05, color: m.fg, borderLeft: `10px solid ${C.crimson}`, paddingLeft: 32}}>
          {scene.quote}
        </div>
        <div style={{marginTop: 22, paddingLeft: 42, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 26, color: C.crimson, letterSpacing: 2}}>
          — {scene.speaker}
        </div>
        <div style={{paddingLeft: 42, fontFamily: FONT_BODY, fontSize: 24, color: m.muted}}>{scene.role}</div>
      </div>
    </>
  );
};

// ---------- STAT: parts pop in one after another, last one is the punchline ----------
export const StatT: React.FC<S<'stat'>> = ({scene}) => {
  const m = MOODS[scene.mood];
  const v = useV();
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: v ? 'column' : 'row', gap: v ? 0 : 50, paddingTop: v ? 0 : 60, paddingBottom: v ? 200 : 0}}>
      {scene.parts.map((p, i) => {
        const last = i === scene.parts.length - 1;
        return <StatPart key={i} text={p} delay={6 + i * 14} color={last ? C.crimson : m.fg} size={(last ? 230 : 170) * (v && scene.parts.length === 1 ? 1.6 : 1)} />;
      })}
    </AbsoluteFill>
  );
};
const StatPart: React.FC<{text: string; delay: number; color: string; size: number}> = ({text, delay, color, size}) => {
  const s = usePop(delay);
  return <div style={{fontFamily: FONT_HEAD, fontSize: size, color, transform: `scale(${s}) translateY(${(1 - s) * 60}px)`, opacity: Math.min(1, s * 2)}}>{text}</div>;
};

// ---------- SPLIT: A ≠ B ----------
export const SplitT: React.FC<S<'split'>> = ({scene}) => {
  const m = MOODS[scene.mood];
  const a = usePop(4);
  const b = usePop(12);
  const sign = usePop(22);
  const v = useV();
  const box = (txt: string, s: number, crimson: boolean, dir: number): React.ReactNode => (
    <div style={{width: v ? 760 : 560, height: v ? 260 : 300, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: crimson ? C.crimson : C.ink, color: C.paper, fontFamily: FONT_HEAD, fontSize: 150,
      transform: `translateX(${(1 - s) * 300 * dir}px)`, opacity: s}}>{txt}</div>
  );
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: v ? 'column' : 'row', gap: v ? 0 : 40, paddingTop: v ? 0 : 90, paddingBottom: v ? 260 : 0}}>
      {box(scene.left, a, false, -1)}
      <div style={{fontFamily: FONT_HEAD, fontSize: 200, color: m.fg, transform: `scale(${sign})`}}>{scene.sign}</div>
      {box(scene.right, b, true, 1)}
    </AbsoluteFill>
  );
};

// ---------- CARDS: numbered cards revealed as the narrator reaches them ----------
export const CardsT: React.FC<S<'cards'>> = ({scene}) => {
  const {durationInFrames} = useVideoConfig();
  const n = scene.cards.length;
  const v = useV();
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: v ? 'column' : 'row', gap: v ? 26 : 44, paddingTop: v ? 0 : 120, paddingBottom: v ? 300 : 0}}>
      {scene.cards.map((c, i) => (
        <Card key={i} n={i + 1} text={c} v={v} delay={Math.round((i / n) * durationInFrames * 0.8) + 4} />
      ))}
    </AbsoluteFill>
  );
};
const Card: React.FC<{n: number; text: string; delay: number; v?: boolean}> = ({n, text, delay, v}) => {
  const s = usePop(delay);
  return (
    <div style={{width: v ? 860 : 480, height: v ? 230 : 400, background: C.paper, color: C.ink, padding: 36, boxSizing: 'border-box',
      borderTop: `14px solid ${C.crimson}`, boxShadow: '0 20px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between', transform: `translateY(${(1 - s) * 260}px) rotate(${(n - 2) * 2.5 * s}deg)`, opacity: Math.min(1, s * 2)}}>
      <div style={{fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: C.crimson}}>Q.0{n}</div>
      <div style={{fontFamily: FONT_HEAD, fontSize: 70, lineHeight: 1.05}}>{text}</div>
    </div>
  );
};

// ---------- MAP: real geography with D3 ----------
const countries = feature(world as any, (world as any).objects.countries) as any;

export const MapT: React.FC<S<'map'>> = ({scene}) => {
  const f = useCurrentFrame();
  const m = MOODS[scene.mood];
  const v = useV();
  const Wm = v ? 1000 : 1300, Hm = v ? 760 : 620;
  const {path, proj} = useMemo(() => {
    const proj = geoMercator().center(v ? [119.6, 24.6] : [120, 25]).scale(v ? 4200 : 3600).translate([Wm / 2, Hm / 2]);
    return {path: geoPath(proj), proj};
  }, [v, Wm, Hm]);
  const zoom = interpolate(f, [0, 110], [1.0, 1.18], clamp);
  const pulse = 0.55 + 0.45 * Math.sin(f / 4);
  const from = proj([118.1, 24.5])!; // Xiamen, Fujian
  const to = proj([120.6, 24.0])!; // Taiwan
  const draw = interpolate(f, [18, 50], [0, 1], clamp);
  const mid = [(from[0] + to[0]) / 2, Math.min(from[1], to[1]) - 90];
  const arrow = `M${from[0]},${from[1]} Q${mid[0]},${mid[1]} ${to[0]},${to[1]}`;

  return (
    <div style={{position: 'absolute', left: v ? 40 : 560, top: v ? 520 : 230, width: Wm, height: Hm, overflow: 'hidden', borderRadius: 12,
      border: `2px solid ${m.line}`, background: '#0A0C10'}}>
      <svg width={Wm} height={Hm} style={{transform: `scale(${zoom})`, transformOrigin: `${to[0]}px ${to[1]}px`}}>
        {countries.features.map((c: any) => {
          const isTW = c.id === '158';
          const isCN = c.id === '156';
          return (
            <path key={c.id + (c.properties?.name ?? '')} d={path(c) ?? ''}
              fill={isTW ? C.crimson : isCN ? '#3A3A3A' : '#232323'}
              stroke={isTW ? '#FF8A8F' : '#555'} strokeWidth={isTW ? 2 : 1}
              opacity={isTW ? 0.75 + 0.25 * pulse : 1} />
          );
        })}
        <path d={arrow} fill="none" stroke={C.paper} strokeWidth="5" strokeDasharray="14 10"
          pathLength={1} style={{strokeDasharray: `${draw} 1`}} />
        <circle cx={to[0]} cy={to[1]} r={30 + pulse * 30} fill="none" stroke={C.crimson} strokeWidth="4" opacity={1 - pulse * 0.6} />
        <text x={from[0] - (v ? 300 : 270)} y={from[1] - (v ? 60 : 140)} fontFamily={FONT_HEAD} fontSize="64" fill="#9A9A9A">CHINA</text>
        <text x={to[0] + (v ? -60 : 70)} y={to[1] + (v ? 230 : 20)} fontFamily={FONT_HEAD} fontSize="56" fill={C.paper}>{scene.label}</text>
        <text x={mid[0] - 70} y={mid[1] + 10} fontFamily={FONT_MONO} fontWeight="700" fontSize="26" fill={C.paper}
          opacity={draw}>~100 MI</text>
      </svg>
      <div style={{position: 'absolute', left: 16, bottom: 12, fontFamily: FONT_MONO, fontSize: 14, color: '#666'}}>Map: Natural Earth</div>
    </div>
  );
};
