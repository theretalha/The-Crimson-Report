import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C as KC, F as KF} from '../kit/theme';
import {RubberStamp} from '../kit/effects/text/Stamp';
import {HandArrow} from '../kit/effects/text/HandDrawn';
import {ProIcon} from '../pro/ProIcon';
import {BuildingArt, NameTape, PersonArt, Sign, type BuildingKind} from './art';
import {Money, CoinStack, Route, Letter, Phone, Scales, Door, Table, Crowd, Rack, Crates} from './art2';
import type {Ev} from '../templates/Recipes';
import {CUSTOM, isCustom} from './custom';

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
  fit?: string; fromX?: number; dur?: number; hideUntil?: string | number;
  // generic
  w?: number; h?: number; size?: number; lit?: boolean; icon?: string; away?: string | number;
  // stage-2 props
  n?: number; lines?: string[]; hl?: number[]; strike?: number[]; header?: string; a?: string; b?: string; blocked?: boolean; left?: string; right?: string; tilt?: number; hands?: number; total?: number; slots?: number; missing?: number[]; sealed?: boolean; imgsrc?: string;
};
type S = {caption: string; speak?: number; seconds: number; items: Item[]; mood?: string};
const DEFAULT_S: Record<string, number> = {letter: 1.3, stack: 1.9, rack: 1.4, crates: 1.25, table: 1.5, door: 1.2, crowd: 1.35, phone: 1.1, scales: 1.15, route: 1.1, money: 1};
const FPS = 30;
const fr = (sec: number) => Math.round(sec * FPS);
const at = (s: S, word: string | number | undefined, lead = 0) => {
  if (word === undefined) return 0;
  if (typeof word === 'number') return word;
  const i = s.caption.toLowerCase().indexOf(word.toLowerCase());
  const frac = i < 0 ? 0 : i / s.caption.length;
  return Math.max(0, frac * (s.speak ?? s.seconds * 0.9) + lead);
};
const HERO = ['card', 'building', 'person', 'chair', 'calendar', 'crates', 'rack', 'phone', 'letter', 'scales', 'route', 'door', 'table', 'crowd', 'stack', 'money', 'icon'];
const isHero = (p: string) => HERO.includes(p) || !!CUSTOM[p]?.hero; // custom props (src/props/custom/epNNN) can be hero pictures too
// Director rule R-EMPTY: the FIRST real picture of every scene is on screen within 0.25 s; later items keep their word timing.
const tOf = (s: S, it: Item) => {
  const t = at(s, it.at, it.lead ?? 0);
  return it === s.items.find((i) => isHero(i.p)) ? Math.min(t, 0.25) : t;
};
const INK = KC.black;
const CARD_W = 250;
const prog1 = (f: number, t0: number, d: number) => interpolate(f, [t0, t0 + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
const find = (s: S, id?: string) => s.items.find((i) => i.id === id);
const pinPoint = (it: Item) => ({x: it.x, y: it.y + (it.p === 'card' ? -(it.h ?? 320) / 2 + 16 : -(it.h ?? 120))});

const Card: React.FC<{it: Item; hidden?: boolean}> = ({it, hidden}) => {
  const w = it.w ?? CARD_W, h = it.h ?? 320, pw = w - 28, ph = h - 130;
  const id = `clip-${it.id ?? Math.round(it.x * 7 + it.y)}`;
  return (
    <g>
      <rect x={-w / 2 + 8} y={-h / 2 + 10} width={w} height={h} fill={INK} opacity={0.22} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={KC.cream} stroke={INK} strokeWidth={5} />
      <clipPath id={id}><rect x={-pw / 2} y={-h / 2 + 18} width={pw} height={ph} /></clipPath>
      <rect x={-pw / 2} y={-h / 2 + 18} width={pw} height={ph} fill={it.kind === 'person' || it.fit === 'meet' ? KC.black : KC.cream2} />
      {it.kind === 'photo' && it.src && <image href={staticFile(it.src)} x={-pw / 2} y={-h / 2 + 18} width={pw} height={ph} preserveAspectRatio={it.fit === 'meet' ? 'xMidYMid meet' : 'xMidYMid slice'} clipPath={`url(#${id})`} style={{filter: 'contrast(1.05) saturate(0.9)'}} />}
      {it.kind === 'person' && <g clipPath={`url(#${id})`}><g transform={`translate(0 ${-h / 2 + 18 + ph - 6}) scale(${ph / 290})`}><PersonArt tie={it.tie} badge={it.badge} hat={it.hat} /></g></g>}
      {it.kind === 'building' && <g clipPath={`url(#${id})`}><g transform={`translate(0 ${-h / 2 + 18 + ph - 8}) scale(${Math.min(pw / 480, ph / 330)})`}><BuildingArt kind={(it.text as BuildingKind) ?? 'office'} /></g></g>}
      {it.kind === 'text' && <text x={0} y={-h / 2 + 18 + ph / 2 + 22} textAnchor="middle" fontFamily={KF.head} fontWeight={700} fontSize={Math.min(96, pw / 1.2)} fill={KC.crimson}>{it.text}</text>}
      <NameTape name={it.name ?? ''} role={it.role} w={pw} y={h / 2 - (it.role ? 92 : 72)} />
      <circle cx={0} cy={-h / 2 + 4} r={12} fill={KC.crimson} stroke={INK} strokeWidth={4} />
      {hidden && <g><rect x={-pw / 2} y={-h / 2 + 18} width={pw} height={ph} fill={KC.black} /><text x={0} y={-h / 2 + 18 + ph / 2 + 40} textAnchor="middle" fontFamily={KF.display} fontSize={150} fill={KC.crimson}>?</text></g>}
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
  // seconds until the first real picture is on screen (the director's rule: no scene starts empty)
  firstReveal: (s: S): number => Math.min(99, ...s.items.filter((i) => isHero(i.p)).map((i) => tOf(s, i))),
  events: (s: S): Ev[] => {
    const ev: Ev[] = [];
    s.items.forEach((it) => {
      const t = tOf(s, it);
      if (it.p === 'card') ev.push({t: t + 0.04, kind: 'paper', db: -15});
      else if (it.p === 'building') ev.push({t: t + 0.05, kind: 'paper', db: -13}, {t: t + 0.12, kind: 'tick', db: -19, f: 988});
      else if (it.p === 'person' || it.p === 'chair') { ev.push({t: t + 0.05, kind: 'tick', db: -17, f: 880}); if (it.fromX) for (let k = 1; k < 4; k++) ev.push({t: t + k * 0.22, kind: 'tick', db: -22, f: 330}); }
      else if (it.p === 'ribbon') ev.push({t, kind: 'whoosh', db: -22, v: 1});
      else if (it.p === 'string') ev.push({t, kind: 'marker', db: -22});
      else if (it.p === 'stamp') ev.push({t: t + 0.1, kind: 'stamp', db: -7});
      else if (it.p === 'tag') ev.push({t: t + 0.03, kind: 'tick', db: -18, f: 1568});
      else if (it.p === 'calendar') {
        const n = Math.min(it.flips ?? 1, 12), per = Math.max(3, Math.round(24 / Math.max(1, it.flips ?? 1) + 2));
        for (let k = 0; k < n; k++) ev.push({t: t + (k * per) / FPS, kind: 'tick', db: -22, f: 1318.5});
      } else if (it.p === 'board') ev.push({t, kind: 'paper', db: -20});
      else if (it.p === 'money') ev.push({t, kind: 'whoosh', db: -21, v: 1}, {t: t + 0.5, kind: 'tick', db: -20, f: 1568});
      else if (it.p === 'stack') ev.push({t, kind: 'tick', db: -17, f: 1046.5}, {t: t + 0.25, kind: 'tick', db: -18, f: 1318.5});
      else if (it.p === 'route') ev.push({t, kind: 'whoosh', db: -20, v: 2});
      else if (it.p === 'letter') ev.push({t, kind: 'paper', db: -14}, {t: t + 0.35, kind: 'keys', db: -24, count: 5});
      else if (it.p === 'phone') ev.push({t, kind: 'whoosh', db: -22}, {t: t + 0.5, kind: 'ping', db: -15, f: 1760});
      else if (it.p === 'scales') ev.push({t: t + 0.25, kind: 'whoosh', db: -22, v: 2}, {t: t + 0.7, kind: 'tick', db: -16, f: 659.3});
      else if (it.p === 'door') ev.push({t: t + 0.8, kind: 'slam', db: -11});
      else if (it.p === 'table') ev.push({t, kind: 'paper', db: -17});
      else if (it.p === 'crowd') for (let k = 0; k < 6; k++) ev.push({t: t + k * 0.2, kind: 'tick', db: -22, f: 880 * Math.pow(1.122, k)});
      else if (it.p === 'rack') ev.push({t, kind: 'paper', db: -16}, {t: t + 0.7, kind: 'ping', db: -16, f: 523.3});
      else if (it.p === 'crates') ev.push({t, kind: 'paper', db: -15}, {t: t + 0.25, kind: 'paper', db: -17, v: 1});
      else if (CUSTOM[it.p]) ev.push(...CUSTOM[it.p].events(t, it));
    });
    return ev;
  },
  Comp: ({scene}: {scene: S}) => {
    const f = useCurrentFrame();
    const {fps, width: VW, height: VH} = useVideoConfig();
    const svgItems = scene.items.filter((i) => ['board', 'card', 'building', 'person', 'string', 'calendar', 'tag', 'chair', 'text', 'money', 'stack', 'route', 'letter', 'phone', 'scales', 'door', 'table', 'crowd', 'rack', 'crates', 'ribbon'].includes(i.p) || isCustom(i.p));
    const htmlItems = scene.items.filter((i) => ['stamp', 'icon', 'arrow'].includes(i.p));
    return (
      <AbsoluteFill style={{transform: `scale(${scene.seconds >= 4 ? 1 + 0.055 * Math.min(1, f / Math.max(1, scene.seconds * FPS)) : 1})`, transformOrigin: '50% 58%'}}>
        <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{position: 'absolute', inset: 0}}>
          {svgItems.map((it, k) => {
            const t0 = fr(tOf(scene, it));
            const pop = spring({frame: f - t0, fps, config: {damping: 12, stiffness: 150, mass: 0.75}});
            const vis = interpolate(f, [t0, t0 + 3], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            const vzoom = VH > VW && (CUSTOM[it.p]?.hero || ['card', 'building', 'person', 'chair', 'calendar', 'crates', 'rack', 'phone', 'letter', 'scales', 'door', 'icon', 'stack'].includes(it.p)) ? 1.3 : VH > VW && it.p === 'tag' ? 1.3 : 1;
            const s = (it.s ?? DEFAULT_S[it.p] ?? CUSTOM[it.p]?.scale ?? 1) * vzoom * (0.7 + 0.3 * Math.min(1.15, pop));
            const fg = scene.mood === 'facts' ? INK : KC.cream;
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
              <g key={k} transform={`translate(${it.x + away * 900 - (it.fromX ? it.fromX * (1 - interpolate(f, [t0, t0 + (it.dur ?? 24)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)})) : 0)} ${it.y + (it.fromX ? 0 : (1 - Math.min(1, pop)) * 40)}) rotate(${(it.r ?? 0) + (1 - Math.min(1, pop)) * 6}) scale(${s})`} opacity={vis * (1 - away)}>
                {it.p === 'card' && <Card it={it} hidden={it.hideUntil !== undefined && f < fr(at(scene, it.hideUntil))} />}
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
                {it.p === 'money' && <Money f={f} t0={t0} fg={fg} dx={(it.x2 ?? it.x) - it.x} dy={(it.y2 ?? it.y) - it.y} text={it.text} n={it.n} />}
                {it.p === 'stack' && <CoinStack f={f} t0={t0} fg={fg} n={it.n ?? 3} label={it.label} />}
                {it.p === 'route' && <Route f={f} t0={t0} fg={fg} dx={(it.x2 ?? it.x) - it.x} dy={(it.y2 ?? it.y) - it.y} a={it.a ?? ''} b={it.b ?? ''} blocked={it.blocked} n={it.n} />}
                {it.p === 'letter' && <Letter f={f} t0={t0} lines={it.lines ?? []} hl={it.hl} strike={it.strike} header={it.header} w={it.w} />}
                {it.p === 'phone' && <Phone f={f} t0={t0} header={it.header} src={it.imgsrc ? staticFile(it.imgsrc) : undefined} />}
                {it.p === 'scales' && <Scales f={f} t0={t0} fg={fg} left={it.left ?? ''} right={it.right ?? ''} tilt={it.tilt} />}
                {it.p === 'door' && <Door f={f} t0={t0} label={it.label} />}
                {it.p === 'table' && <Table f={f} t0={t0} kind={it.kind} hands={it.hands} n={it.n} />}
                {it.p === 'crowd' && <Crowd f={f} t0={t0} fg={fg} to={it.total ?? 1000} label={it.label} />}
                {it.p === 'rack' && <Rack f={f} t0={t0} slots={it.slots} missing={it.missing} label={it.label} />}
                {it.p === 'crates' && <Crates f={f} t0={t0} n={it.n} sealed={it.sealed} />}
                {CUSTOM[it.p] && React.createElement(CUSTOM[it.p].Comp, {f, t0, fg, it})}
                {it.p === 'ribbon' && (
                  <g transform={`translate(${(1 - prog1(f, t0, 14)) * 700} 0)`}>
                    <rect x={-((it.text ?? '').length * 14.5 + 56)} y={-25} width={(it.text ?? '').length * 14.5 + 56} height={50} fill={KC.crimson} stroke={INK} strokeWidth={4} />
                    <text x={-24} y={9} textAnchor="end" fontFamily={KF.head} fontWeight={700} fontSize={25} letterSpacing={3} fill={KC.cream}>{it.text}</text>
                  </g>
                )}
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
          if (it.p === 'stamp') return <RubberStamp key={k} text={it.text ?? ''} x={VH > VW ? it.x * (1920 / VW) : it.x} y={VH > VW ? (it.y - (VH - (VW * 1080) / 1920) / 2) * (1920 / VW) : it.y} rotate={it.r ?? -8} delay={d} size={(it.size ?? 120) * (VH > VW ? 1.1 * (1920 / VW) : 1)} color={it.color ?? KC.crimson} clean />;
          if (it.p === 'icon') return <div key={k} style={{position: 'absolute', left: it.x - (it.size ?? 220) / 2, top: it.y - (it.size ?? 220) / 2}}><ProIcon name={it.icon ?? 'search'} size={it.size ?? 220} delay={d} light={scene.mood === 'facts'} plate={false} /></div>;
          return <HandArrow key={k} from={[it.x, it.y]} to={[it.x2 ?? it.x, it.y2 ?? it.y]} delay={d} duration={14} color={it.color ?? KC.crimson} strokeWidth={9} />;
        })}
      </AbsoluteFill>
    );
  },
};
