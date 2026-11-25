import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ICONS} from './iconData';

// Professional 2D icon: strokes draw on one by one, a crimson copy sits slightly off-register (screen-print look),
// the fill breathes in, a light sweep crosses the lines, and the whole thing floats gently on a HUD plate.
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);

type Props = {
  name: string;
  size?: number;
  delay?: number;
  draw?: number; // frames for the whole draw-on
  main?: string;
  accent?: string;
  plate?: boolean;
  light?: boolean; // for cream backgrounds
  seed?: number;
};

const El: React.FC<{el: {t: string; a: Record<string, string>}; p: number; stroke: string; fill?: string; fillO?: number; sw: number}> = ({el, p, stroke, fill, fillO = 0, sw}) => {
  const Tag = el.t as any;
  const a: any = {...el.a};
  return (
    <Tag {...a} pathLength={1} fill={fill ?? 'none'} fillOpacity={fillO} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      strokeDasharray="1 1" strokeDashoffset={1 - p} strokeOpacity={p > 0.002 ? 1 : 0} />
  );
};

export const ProIcon: React.FC<Props> = ({name, size = 420, delay = 0, draw = 26, main = '#F4F1EA', accent = '#C8141E', plate = true, light = false, seed = 0}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const els = ICONS[name] ?? [];
  const n = els.length;
  const stagger = Math.max(1, Math.round(draw / (n + 2)));
  const pr = (i: number, extra = 0) => interpolate(f, [delay + i * stagger + extra, delay + i * stagger + extra + draw * 0.6], [0, 1], {...clamp, easing: OUT});
  const pop = spring({frame: f - delay, fps, config: {damping: 11, mass: 0.8}});
  const t = (f - delay) / fps;
  const floatY = Math.sin(t * 1.5 + seed) * 0.35;
  const rot = Math.sin(t * 0.9 + seed) * 0.9 + (1 - pop) * -5;
  const fillIn = interpolate(f, [delay + draw, delay + draw + 14], [0, 1], clamp);
  // the light sweep repeats every 4 s once the icon is drawn
  const sweep = interpolate(Math.max(0, f - (delay + draw + 6)) % 120, [0, 40], [-0.6, 1.6], {...clamp, easing: Easing.inOut(Easing.quad)});
  const gid = `g${name}${seed}`;
  const S = size;
  return (
    <div style={{position: 'relative', width: S, height: S, transform: `scale(${0.82 + 0.18 * pop}) rotate(${rot}deg)`, opacity: Math.min(1, pop * 2)}}>
      {plate && (
        <div style={{position: 'absolute', inset: 0, borderRadius: S * 0.09, background: light ? 'linear-gradient(150deg, rgba(14,14,14,0.07), rgba(14,14,14,0.02) 60%)' : 'linear-gradient(150deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02) 60%)',
          border: light ? '2px solid rgba(14,14,14,0.2)' : '2px solid rgba(255,255,255,0.16)', boxShadow: light ? `inset 0 0 ${S * 0.1}px rgba(0,0,0,0.12), 0 ${S * 0.05}px ${S * 0.1}px rgba(0,0,0,0.18)` : `inset 0 0 ${S * 0.12}px rgba(0,0,0,0.55), 0 ${S * 0.06}px ${S * 0.12}px rgba(0,0,0,0.5)`, overflow: 'hidden'}}>
          <div style={{position: 'absolute', inset: 0, backgroundImage: light ? 'radial-gradient(rgba(14,14,14,0.22) 1.4px, transparent 1.6px)' : 'radial-gradient(rgba(255,255,255,0.20) 1.4px, transparent 1.6px)', backgroundSize: `${S * 0.045}px ${S * 0.045}px`,
            WebkitMaskImage: 'linear-gradient(135deg, transparent 35%, black 100%)', maskImage: 'linear-gradient(135deg, transparent 35%, black 100%)'}} />
        </div>
      )}
      {plate && [[0, 0], [1, 0], [1, 1], [0, 1]].map(([x, y], i) => (
        <div key={i} style={{position: 'absolute', left: x ? undefined : S * 0.035, right: x ? S * 0.035 : undefined, top: y ? undefined : S * 0.035, bottom: y ? S * 0.035 : undefined,
          width: S * 0.07, height: S * 0.07, borderTop: !y ? `3px solid ${accent}` : undefined, borderBottom: y ? `3px solid ${accent}` : undefined,
          borderLeft: !x ? `3px solid ${accent}` : undefined, borderRight: x ? `3px solid ${accent}` : undefined, opacity: interpolate(pop, [0.3, 1], [0, 1], clamp)}} />
      ))}
      <svg viewBox="-3.5 -3.5 31 31" width={S} height={S} style={{position: 'absolute', inset: 0, overflow: 'visible', transform: `translateY(${floatY}px)`, filter: 'drop-shadow(0 0 0.5px rgba(255,255,255,0.35))'}}>
        <defs>
          <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1={sweep * 24 - 6} y1="0" x2={sweep * 24 + 2} y2="24" gradientTransform="rotate(18 12 12)">
            <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.5" stopColor="#fff" stopOpacity="0.9" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id={`m${gid}`} maskUnits="userSpaceOnUse" x="-3.5" y="-3.5" width="31" height="31"><g>{els.map((el, i) => <El key={i} el={el} p={1} stroke="#fff" sw={1.2} />)}</g></mask>
        </defs>
        {/* off-register crimson copy */}
        <g transform="translate(0.45 0.45)" opacity={0.95}>{els.map((el, i) => <El key={i} el={el} p={pr(i, 4)} stroke={accent} sw={1.1} fill={accent} fillO={0.0} />)}</g>
        {/* main line work, with a soft crimson fill coming in behind */}
        <g>{els.map((el, i) => <El key={i} el={el} p={pr(i)} stroke={main} sw={0.95} fill={['rect', 'circle', 'ellipse', 'polygon'].includes(el.t) ? accent : undefined} fillO={0.16 * fillIn} />)}</g>
        {/* light sweep, only where there are lines */}
        <rect x="-3.5" y="-3.5" width="31" height="31" fill={`url(#${gid})`} mask={`url(#m${gid})`} opacity={0.9} />
      </svg>
    </div>
  );
};
