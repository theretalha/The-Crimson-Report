import React from 'react';
import {C as KC, F as KF} from '../kit/theme';

// Flat linocut-style drawings used by the scene composer. All drawn around an origin: buildings/people stand on y=0 (up is negative).
const INK = KC.black;
const W = 5;

export type BuildingKind = 'datacenter' | 'tower' | 'bank' | 'whitehouse' | 'capitol' | 'office' | 'doj' | 'commerce' | 'treasury';

const Cols: React.FC<{x0: number; x1: number; n: number; top: number; bot: number}> = ({x0, x1, n, top, bot}) => (
  <>{Array.from({length: n}).map((_, i) => {
    const x = x0 + ((x1 - x0) * i) / (n - 1);
    return <rect key={i} x={x - 9} y={top} width={18} height={bot - top} fill={KC.cream} stroke={INK} strokeWidth={4} />;
  })}</>
);
const Windows: React.FC<{x0: number; y0: number; cols: number; rows: number; dx: number; dy: number; w?: number; h?: number; lit?: number[]}> = ({x0, y0, cols, rows, dx, dy, w = 20, h = 26, lit = []}) => (
  <>{Array.from({length: rows * cols}).map((_, i) => {
    const c = i % cols, r = Math.floor(i / cols);
    return <rect key={i} x={x0 + c * dx} y={y0 + r * dy} width={w} height={h} fill={lit.includes(i) ? KC.crimson : INK} />;
  })}</>
);

export const BuildingArt: React.FC<{kind: BuildingKind; lit?: boolean}> = ({kind, lit}) => {
  const wall = KC.cream3;
  if (kind === 'datacenter')
    return (
      <g>
        <rect x={-190} y={-160} width={380} height={160} fill={wall} stroke={INK} strokeWidth={W} />
        <rect x={-190} y={-178} width={380} height={22} fill={KC.black2} stroke={INK} strokeWidth={W} />
        {[0, 1, 2].map((r) => <g key={r}>{Array.from({length: 11}).map((_, c) => <rect key={c} x={-165 + c * 30} y={-136 + r * 30} width={18} height={9} fill={INK} />)}</g>)}
        <rect x={-30} y={-64} width={60} height={64} fill={INK} />
        <line x1={-150} y1={-178} x2={-150} y2={-240} stroke={INK} strokeWidth={W} />
        <circle cx={-150} cy={-244} r={9} fill={KC.crimson} stroke={INK} strokeWidth={3} />
        <rect x={110} y={-212} width={50} height={34} fill={wall} stroke={INK} strokeWidth={4} /><circle cx={135} cy={-195} r={11} fill="none" stroke={INK} strokeWidth={4} />
      </g>
    );
  if (kind === 'tower')
    return (
      <g>
        <rect x={-80} y={-400} width={160} height={400} fill={wall} stroke={INK} strokeWidth={W} />
        <Windows x0={-58} y0={-374} cols={4} rows={9} dx={38} dy={42} lit={lit ? [2, 9, 14, 21, 27, 30] : []} />
        <rect x={-30} y={-64} width={60} height={64} fill={INK} />
        <line x1={0} y1={-400} x2={0} y2={-470} stroke={INK} strokeWidth={W} />
        <circle cx={0} cy={-474} r={9} fill={KC.crimson} stroke={INK} strokeWidth={3} />
      </g>
    );
  if (kind === 'office')
    return (
      <g>
        <rect x={-120} y={-270} width={240} height={270} fill={wall} stroke={INK} strokeWidth={W} />
        <Windows x0={-94} y0={-244} cols={5} rows={5} dx={45} dy={48} lit={lit ? [3, 7, 12, 18] : []} />
        <rect x={-30} y={-64} width={60} height={64} fill={INK} />
      </g>
    );
  if (kind === 'bank' || kind === 'doj' || kind === 'commerce' || kind === 'treasury')
    return (
      <g>
        <polygon points="-210,-200 0,-290 210,-200" fill={wall} stroke={INK} strokeWidth={W} strokeLinejoin="round" />
        <rect x={-210} y={-200} width={420} height={26} fill={KC.cream} stroke={INK} strokeWidth={W} />
        <Cols x0={-170} x1={170} n={6} top={-174} bot={-28} />
        <rect x={-230} y={-28} width={460} height={28} fill={wall} stroke={INK} strokeWidth={W} />
        <rect x={-30} y={-52} width={60} height={24} fill={INK} />
      </g>
    );
  if (kind === 'whitehouse')
    return (
      <g>
        <rect x={-300} y={-110} width={150} height={110} fill={KC.cream} stroke={INK} strokeWidth={W} />
        <rect x={150} y={-110} width={150} height={110} fill={KC.cream} stroke={INK} strokeWidth={W} />
        <Windows x0={-280} y0={-84} cols={4} rows={1} dx={34} dy={0} w={18} h={32} />
        <Windows x0={170} y0={-84} cols={4} rows={1} dx={34} dy={0} w={18} h={32} />
        <rect x={-150} y={-160} width={300} height={160} fill={KC.cream} stroke={INK} strokeWidth={W} />
        <polygon points="-120,-160 0,-235 120,-160" fill={KC.cream} stroke={INK} strokeWidth={W} strokeLinejoin="round" />
        <Cols x0={-95} x1={95} n={6} top={-150} bot={-10} />
        <line x1={0} y1={-235} x2={0} y2={-300} stroke={INK} strokeWidth={4} />
        <rect x={2} y={-300} width={46} height={30} fill={KC.crimson} stroke={INK} strokeWidth={3} />
      </g>
    );
  // capitol
  return (
    <g>
      <rect x={-280} y={-90} width={560} height={90} fill={KC.cream} stroke={INK} strokeWidth={W} />
      <Cols x0={-250} x1={250} n={12} top={-80} bot={-8} />
      <rect x={-120} y={-150} width={240} height={60} fill={KC.cream} stroke={INK} strokeWidth={W} />
      <rect x={-80} y={-200} width={160} height={50} fill={KC.cream3} stroke={INK} strokeWidth={W} />
      <path d="M -85 -200 A 85 85 0 0 1 85 -200 Z" fill={KC.cream} stroke={INK} strokeWidth={W} />
      <line x1={0} y1={-285} x2={0} y2={-330} stroke={INK} strokeWidth={W} />
      <circle cx={0} cy={-334} r={8} fill={KC.crimson} stroke={INK} strokeWidth={3} />
    </g>
  );
};

export const PersonArt: React.FC<{tie?: boolean; badge?: string; hat?: boolean; fill?: string; accent?: string}> = ({tie, badge, hat, fill = KC.black3, accent = KC.crimson}) => (
  <g>
    <path d="M -74 0 C -74 -74, -48 -156, 0 -156 C 48 -156, 74 -74, 74 0 Z" fill={fill} stroke={KC.cream} strokeWidth={4} />
    <circle cx={0} cy={-206} r={36} fill={fill} stroke={KC.cream} strokeWidth={4} />
    {tie && <polygon points="-10,-152 10,-152 6,-100 0,-90 -6,-100" fill={accent} />}
    {hat && <path d="M -48 -226 L 48 -226 L 30 -262 L -30 -262 Z" fill={INK} stroke={KC.cream} strokeWidth={4} />}
    {badge && (
      <g transform="translate(26 -118)">
        <rect x={-6} y={-12} width={50} height={26} fill={KC.cream} stroke={INK} strokeWidth={3} />
        <text x={19} y={7} textAnchor="middle" fontFamily={KF.mono} fontWeight={700} fontSize={Math.min(13, 44 / (badge.length * 0.62))} fill={INK}>{badge}</text>
      </g>
    )}
  </g>
);

export const NameTape: React.FC<{name: string; role?: string; w?: number; y?: number}> = ({name, role, w = 230, y = 0}) => {
  const fs = Math.min(27, (w - 24) / (name.length * 0.56));
  return (
    <g transform={`translate(0 ${y})`}>
      <rect x={-w / 2} y={0} width={w} height={role ? 62 : 42} fill={KC.black} />
      <text x={0} y={role ? 28 : 29} textAnchor="middle" fontFamily={KF.head} fontWeight={700} fontSize={fs} letterSpacing={1.5} fill={KC.cream}>{name}</text>
      {role && <text x={0} y={50} textAnchor="middle" fontFamily={KF.mono} fontSize={Math.min(17, (w - 20) / (role.length * 0.6))} fill={KC.cream3}>{role}</text>}
    </g>
  );
};

export const Sign: React.FC<{text: string; w?: number}> = ({text, w = 250}) => {
  const fs = Math.min(30, (w - 28) / (text.length * 0.58));
  return (
    <g>
      <rect x={-w / 2} y={0} width={w} height={46} fill={KC.crimson} stroke={INK} strokeWidth={4} />
      <text x={0} y={32} textAnchor="middle" fontFamily={KF.head} fontWeight={700} fontSize={fs} letterSpacing={2} fill={KC.cream}>{text}</text>
    </g>
  );
};
