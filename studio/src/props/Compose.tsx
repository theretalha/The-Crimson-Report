import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C as KC, F as KF} from '../kit/theme';
import {RubberStamp} from '../kit/effects/text/Stamp';
import {HandArrow} from '../kit/effects/text/HandDrawn';
import {ProIcon} from '../pro/ProIcon';
import {BuildingArt, NameTape, PersonArt, Sign, type BuildingKind} from './art';
import type {Ev} from '../templates/Recipes';

// The scene composer: a scene is a list of items placed on the 1920x1080 stage; each item appears on the narrated word `at`.
// This is what the director's shot list compiles to. Items: board, card, building, person, string, calendar, tag, stamp, icon, arrow, chair, text.
export type Item = {
  id?: string; p: string; x: number; y: number; at?: string | number; lead?: number; r?: number; s?: number; hold?: boolean;
  // card
  kind?: string; src?: string; name?: string; role?: string; text?: string; label?: string; tie?: boolean; badge?: string; hat?: boolean; dim?: boolean;
  // string / arrow
  from?: string; to?: string; x2?: number; y2?: number; color?: string;
  // calendar
  flips?: number; sub?: string;
  // generic
  w?: number; h?: number; size?: number; lit?: boolean; icon?: string; away?: number;
};
type S = {caption: string; speak?: number; seconds: number; items: Item[]};
const FPS = 30;
const fr = (sec: number) => Math.round(sec * FPS);
const at = (s: S, word: string | number | undefined, lead = 0) => {
  if (word === undefined) return 0;
  if (typeof word === 'number') return word;
  const i = s.caption.toLowerCase().indexOf(word.toLowerCase());
  const frac = i < 0 ? 0 : i / s.caption.length;
  return Math.max(0, frac * (s.speak ?? s.seconds * 0.9) + lead);
};
const tOf = (s: S, it: Item) => at(s, it.at, it.lead ?? 0);
const INK = KC.black;
const CARD_W = 250;
const find = (s: S, id?: string) => s.items.find((i) => i.id === id);
const pinPoint = (it: Item) => ({x: it.x, y: it.y + (it.p === 'card' ? -(it.h ?? 320) / 2 + 16 : -(it.h ?? 120))});

const Card: React.FC<{it: Item}> = ({it}) => {
  const w = it.w ?? CARD_W, h = it.h ?? 320, pw = w - 28, ph = h - 130;
  const id = `clip-${it.id ?? Math.round(it.x * 7 + it.y)}`;
  return (
    <g>
      <rect x={-w / 2 + 8} y={-h / 2 + 10} width={w} height={h} fill={INK} opacity={0.22} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={KC.cream} stroke={INK} strokeWidth={5} />
      <clipPath id={id}><rect x={-pw / 2} y={-h / 2 + 18} width={pw} height={ph} /></clipPath>
      <rect x={-pw / 2} y={-h / 2 + 18} width={pw} height={ph} fill={it.kind === 'person' ? KC.black2 : KC.cream2} />
      {it.kind === 'photo' && it.src && <image href={staticFile(it.src)} x={-pw / 2} y={-h / 2 + 18} width={pw} height={ph} preserveAspectRatio="xMidYMid slice" clipPath={`url(#${id})`} style={{filter: 'contrast(1.05) saturate(0.9)'}} />}
      {it.kind === 'person' && <g clipPath={`url(#${id})`}><g transform={`translate(0 ${-h / 2 + 18 + ph - 6}) scale(${ph / 290})`}><PersonArt tie={it.tie} badge={it.badge} hat={it.hat} /></g></g>}
      {it.kind === 'building' && <g clipPath={`url(#${id})`}><g transform={`translate(0 ${-h / 2 + 18 + ph - 8}) scale(${Math.min(pw / 480, ph / 330)})`}><BuildingArt kind={(it.text as BuildingKind) ?? 'office'} /></g></g>}
      {it.kind === 'text' && <text x={0} y={-h / 2 + 18 + ph / 2 + 22} textAnchor="middle" fontFamily={KF.head} fontWeight={700} fontSize={Math.min(96, pw / 1.2)} fill={KC.crimson}>{it.text}</text>}
      <NameTape name={it.name ?? ''} role={it.role} w={pw} y={h / 2 - (it.role ? 92 : 72)} />
      <circle cx={0} cy={-h / 2 + 4} r={12} fill={KC.crimson} stroke={INK} strokeWidth={4} />
      {it.dim && <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={KC.black} opacity={0.5} />}
    </g>
  );
};

const Calendar: React.FC<{it: Item; f0: number; f: number}> = ({it, f0, f}) => {
  const flips = it.flips ?? 1, per = Math.max(3, Math.round(24 / Math.max(1, flips) + 2));
  const n = Math.min(flips, Math.max(0, Math.floor((f - f0) / per) + 1));
  const ph = ((f - f0) % per) / per;
  const flipping = f >= f0 && n < flips ? ph : 1;
  const fold = flipping < 0.5 ? 1 - flipping * 2 : (flipping - 0.5) * 2;
  return (
    <g>
      <rect x={-120 + 8} y={-120 + 10} width={240} height={250} fill={INK} opacity={0.2} />
      <rect x={-120} y={-120} width={240} height={250} fill={KC.cream} stroke={INK} strokeWidth={5} />
      <rect x={-120} y={-120} width={240} height={52} fill={KC.crimson} stroke={INK} strokeWidth={5} />
      {[-70, 0, 70].map((rx) => <circle key={rx} cx={rx} cy={-122} r={9} fill={INK} />)}
      <text x={0} y={-82} textAnchor="middle" fontFamily={KF.head} fontWeight={700} fontSize={30} letterSpacing={6} fill={KC.cream}>{(it.label ?? 'DAY').toUpperCase()}</text>
      <g transform={`translate(0 -68) scale(1 ${Math.max(0.02, fold)})`}>
        <text x={0} y={116} textAnchor="middle" fontFamily={KF.display} fontSize={150} fill={INK}>{Math.max(1, n)}</text>
      </g>
      {it.sub && <text x={0} y={118} textAnchor="middle" fontFamily={KF.mono} fontWeight={700} fontSize={19} letterSpacing={3} fill={KC.crimsonDeep}>{it.sub}</text>}
    </g>
  );
};

const Chair: React.FC<{it: Item}> = ({it}) => (
  <g>
    <rect x={-60} y={-250} width={120} height={150} rx={14} fill={KC.black3} stroke={KC.cream} strokeWidth={4} />
    <rect x={-72} y={-110} width={144} height={34} rx={8} fill={KC.black3} stroke={KC.cream} strokeWidth={4} />
    <line x1={0} y1={-76} x2={0} y2={-20} stroke={KC.cream} strokeWidth={6} />
    <line x1={-52} y1={-14} x2={52} y2={-14} stroke={KC.cream} strokeWidth={6} strokeLinecap="round" />
    <circle cx={-52} cy={-6} r={7} fill={KC.cream} /><circle cx={52} cy={-6} r={7} fill={KC.cream} />
    {it.name && <g transform="translate(0 24)"><NameTape name={it.name} w={210} /></g>}
  </g>
);

export const COMPOSE = {
  events: (s: S): Ev[] => {
    const ev: Ev[] = [];
    s.items.forEach((it) => {
      const t = tOf(s, it);
      if (it.p === 'card') ev.push({t: t + 0.04, kind: 'paper', db: -15});
      else if (it.p === 'building') ev.push({t: t + 0.05, kind: 'paper', db: -13}, {t: t + 0.12, kind: 'tick', db: -19, f: 988});
      else if (it.p === 'person' || it.p === 'chair') ev.push({t: t + 0.05, kind: 'tick', db: -17, f: 880});
      else if (it.p === 'string') ev.push({t, kind: 'marker', db: -22});
      else if (it.p === 'stamp') ev.push({t: t + 0.1, kind: 'stamp', db: -7});
      else if (it.p === 'tag') ev.push({t: t + 0.03, kind: 'tick', db: -18, f: 1568});
      else if (it.p === 'calendar') {
        const n = Math.min(it.flips ?? 1, 12), per = Math.max(3, Math.round(24 / Math.max(1, it.flips ?? 1) + 2));
        for (let k = 0; k < n; k++) ev.push({t: t + (k * per) / FPS, kind: 'tick', db: -22, f: 1318.5});
      } else if (it.p === 'board') ev.push({t, kind: 'paper', db: -20});
    });
    return ev;
  },
  Comp: ({scene}: {scene: S}) => {
    const f = useCurrentFrame();
    const {fps} = useVideoConfig();
    const svgItems = scene.items.filter((i) => ['board', 'card', 'building', 'person', 'string', 'calendar', 'tag', 'chair', 'text'].includes(i.p));
    const htmlItems = scene.items.filter((i) => ['stamp', 'icon', 'arrow'].includes(i.p));
    return (
      <AbsoluteFill>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          {svgItems.map((it, k) => {
            const t0 = fr(tOf(scene, it));
            const pop = spring({frame: f - t0, fps, config: {damping: 12, stiffness: 150, mass: 0.75}});
            const vis = interpolate(f, [t0, t0 + 3], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            const s = (it.s ?? 1) * (0.7 + 0.3 * Math.min(1.15, pop));
            if (it.p === 'string') {
              const a = find(scene, it.from), b = find(scene, it.to);
              if (!a || !b) return null;
              const A = pinPoint(a), B = pinPoint(b);
              const prog = interpolate(f, [t0, t0 + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
              const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2 + 26;
              const d = `M ${A.x} ${A.y} Q ${mx} ${my} ${B.x} ${B.y}`;
              return <path key={k} d={d} fill="none" stroke={it.color ?? KC.crimson} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - prog} opacity={prog > 0 ? 1 : 0} />;
            }
            if (it.p === 'board') {
              const w = it.w ?? 1560, h = it.h ?? 560;
              const dots = Array.from({length: 120}).map((_, i) => ({x: ((i * 97) % 1000) / 1000 * (w - 40) - w / 2 + 20, y: ((i * 61 + 13) % 1000) / 1000 * (h - 40) - h / 2 + 20, r: 2 + (i % 4)}));
              return (
                <g key={k} transform={`translate(${it.x} ${it.y})`} opacity={vis}>
                  <rect x={-w / 2 + 10} y={-h / 2 + 12} width={w} height={h} fill={INK} opacity={0.2} />
                  <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#B98C5B" stroke={INK} strokeWidth={8} />
                  {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={i % 3 ? '#9A7144' : '#CBA374'} opacity={0.55} />)}
                </g>
              );
            }
            const away = it.away !== undefined && f >= fr(at(scene, it.away)) ? interpolate(f, [fr(at(scene, it.away)), fr(at(scene, it.away)) + 14], [0, 1], {extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)}) : 0;
            return (
              <g key={k} transform={`translate(${it.x + away * 900} ${it.y + (1 - Math.min(1, pop)) * 40}) rotate(${(it.r ?? 0) + (1 - Math.min(1, pop)) * 6}) scale(${s})`} opacity={vis * (1 - away)}>
                {it.p === 'card' && <Card it={it} />}
                {it.p === 'building' && (
                  <g>
                    <ellipse cx={0} cy={10} rx={230} ry={14} fill={INK} opacity={0.16} />
                    <BuildingArt kind={(it.kind as BuildingKind) ?? 'office'} lit={it.lit} />
                    {it.label && <g transform="translate(0 22)"><Sign text={it.label} w={Math.max(210, it.label.length * 20 + 40)} /></g>}
                  </g>
                )}
                {it.p === 'person' && (
                  <g>
                    <ellipse cx={0} cy={8} rx={90} ry={10} fill={INK} opacity={0.16} />
                    <PersonArt tie={it.tie} badge={it.badge} hat={it.hat} />
                    {it.name && <NameTape name={it.name} role={it.role} w={Math.max(230, it.name.length * 17 + 40)} y={20} />}
                  </g>
                )}
                {it.p === 'calendar' && <Calendar it={it} f0={t0} f={f} />}
                {it.p === 'chair' && <Chair it={it} />}
                {it.p === 'tag' && (
                  <g>
                    <rect x={-(it.w ?? Math.max(120, (it.text ?? '').length * 17 + 44)) / 2} y={-26} width={it.w ?? Math.max(120, (it.text ?? '').length * 17 + 44)} height={52} rx={26} fill={it.color ?? KC.crimson} stroke={INK} strokeWidth={4} />
                    <text x={0} y={9} textAnchor="middle" fontFamily={KF.head} fontWeight={700} fontSize={26} letterSpacing={3} fill={KC.cream}>{it.text}</text>
                  </g>
                )}
                {it.p === 'text' && <text x={0} y={0} textAnchor="middle" fontFamily={KF.display} fontSize={it.size ?? 110} fill={it.color ?? INK}>{it.text}</text>}
              </g>
            );
          })}
        </svg>
        {htmlItems.map((it, k) => {
          const d = fr(tOf(scene, it));
          if (it.p === 'stamp') return <RubberStamp key={k} text={it.text ?? ''} x={it.x} y={it.y} rotate={it.r ?? -8} delay={d} size={it.size ?? 120} color={it.color ?? KC.crimson} clean />;
          if (it.p === 'icon') return <div key={k} style={{position: 'absolute', left: it.x - (it.size ?? 220) / 2, top: it.y - (it.size ?? 220) / 2}}><ProIcon name={it.icon ?? 'search'} size={it.size ?? 220} delay={d} light plate={false} /></div>;
          return <HandArrow key={k} from={[it.x, it.y]} to={[it.x2 ?? it.x, it.y2 ?? it.y]} delay={d} duration={14} color={it.color ?? KC.crimson} strokeWidth={9} />;
        })}
      </AbsoluteFill>
    );
  },
};
