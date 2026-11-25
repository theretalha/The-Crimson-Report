import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {IconName} from '../types';

// Flat silhouette icons in the cover style: one main colour + one accent.
// Every icon has a small built-in motion so the screen is never static.
type P = {main: string; accent: string; size?: number};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const Pentagon: React.FC<P> = ({main, accent}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const file = (i: number) => spring({frame: f - 10 - i * 6, fps, config: {damping: 14}});
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%">
      <polygon points="200,40 352,150 294,330 106,330 48,150" fill={main} />
      <polygon points="200,105 290,170 256,276 144,276 110,170" fill="none" stroke={accent} strokeWidth="10" />
      <polygon points="200,160 238,188 224,232 176,232 162,188" fill={accent} />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${250 + i * 18}, ${interpolate(file(i), [0, 1], [420, 250 - i * 16])}) rotate(${-8 + i * 6})`}>
          <rect x="0" y="0" width="120" height="150" fill="#F2EEE6" stroke={main} strokeWidth="6" />
          <rect x="16" y="22" width="70" height="10" fill={accent} />
          <rect x="16" y="46" width="88" height="7" fill={main} opacity="0.5" />
          <rect x="16" y="64" width="80" height="7" fill={main} opacity="0.5" />
          <rect x="16" y="82" width="88" height="7" fill={main} opacity="0.5" />
          <text x="60" y="130" textAnchor="middle" fontFamily="monospace" fontWeight="700" fontSize="18" fill={accent}>SECRET</text>
        </g>
      ))}
    </svg>
  );
};

const Shelf: React.FC<P> = ({main, accent}) => {
  const f = useCurrentFrame();
  // items vanish one by one
  const items = Array.from({length: 12}, (_, i) => i);
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%">
      <rect x="50" y="40" width="14" height="330" fill={main} />
      <rect x="336" y="40" width="14" height="330" fill={main} />
      {[130, 230, 330].map((y) => (
        <rect key={y} x="50" y={y} width="300" height="12" fill={main} />
      ))}
      {items.map((i) => {
        const row = Math.floor(i / 4);
        const col = i % 4;
        const gone = interpolate(f, [8 + i * 4, 14 + i * 4], [1, 0], clamp);
        const h = 50 + ((i * 37) % 30);
        return (
          <rect key={i} x={82 + col * 66} y={130 + row * 100 - h} width="46" height={h} rx="4"
            fill={i % 3 === 0 ? accent : main} opacity={gone} transform={`translate(0, ${(1 - gone) * -30})`} />
        );
      })}
      <text x="200" y="395" textAnchor="middle" fontFamily="monospace" fontWeight="700" fontSize="26" fill={accent}
        opacity={interpolate(f, [60, 70], [0, 1], clamp)}>SOLD OUT</text>
    </svg>
  );
};

const Crash: React.FC<P> = ({main, accent}) => {
  const f = useCurrentFrame();
  const draw = interpolate(f, [4, 40], [0, 1], clamp);
  const len = 900;
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%">
      {[80, 160, 240, 320].map((y) => (
        <line key={y} x1="30" x2="370" y1={y} y2={y} stroke={main} strokeOpacity="0.2" strokeWidth="3" />
      ))}
      <polyline points="30,300 90,250 140,270 200,170 240,190 270,110 300,330 340,350"
        fill="none" stroke={accent} strokeWidth="16" strokeLinejoin="round" strokeLinecap="round"
        strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
      <polygon points="320,330 360,365 310,375" fill={accent} opacity={draw > 0.97 ? 1 : 0} />
      <text x="30" y="60" fontFamily="monospace" fontWeight="700" fontSize="34" fill={main}>401(K)</text>
      <text x="370" y="60" textAnchor="end" fontFamily="monospace" fontWeight="700" fontSize="34" fill={accent}
        opacity={draw > 0.9 ? 1 : 0}>-38%</text>
    </svg>
  );
};

const PhoneChip: React.FC<P> = ({main, accent}) => {
  const f = useCurrentFrame();
  const pulse = 0.5 + 0.5 * Math.sin(f / 5);
  const off = interpolate(f, [90, 100], [1, 0.15], clamp); // chip "goes dark" at the end
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%">
      <rect x="110" y="20" width="180" height="360" rx="30" fill={main} />
      <rect x="124" y="50" width="152" height="300" rx="8" fill="#1d1d1d" />
      {[...Array(6)].map((_, i) => (
        <line key={i} x1={150 + i * 20} x2={150 + i * 20} y1="70" y2="330" stroke={accent} strokeOpacity={0.25 * off} strokeWidth="3" />
      ))}
      <rect x="160" y="150" width="80" height="80" fill={accent} opacity={off} />
      <rect x="160" y="150" width="80" height="80" fill="none" stroke={accent} strokeWidth="4"
        opacity={pulse * off} transform="translate(200 190) scale(1.35) translate(-200 -190)" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} opacity={off}>
          <rect x={168 + i * 18} y="138" width="8" height="12" fill={accent} />
          <rect x={168 + i * 18} y="230" width="8" height="12" fill={accent} />
          <rect x="148" y={158 + i * 18} width="12" height="8" fill={accent} />
          <rect x="240" y={158 + i * 18} width="12" height="8" fill={accent} />
        </g>
      ))}
      <text x="200" y="198" textAnchor="middle" fontFamily="monospace" fontWeight="700" fontSize="16" fill="#F2EEE6" opacity={off}>3nm</text>
    </svg>
  );
};

const Folder: React.FC<P> = ({main, accent}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const open = spring({frame: f - 20, fps, config: {damping: 12}});
  const stamp = spring({frame: f - 8, fps, config: {damping: 9, mass: 0.6}});
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%">
      <path d="M40 110 h110 l25 25 h185 v215 h-320z" fill={accent} />
      <rect x="70" y={150 - open * 60} width="260" height="190" fill="#F2EEE6" />
      <rect x="95" y={175 - open * 60} width="150" height="12" fill={accent} />
      <rect x="95" y={200 - open * 60} width="200" height="8" fill="#0E0E0E" opacity="0.4" />
      <rect x="95" y={220 - open * 60} width="180" height="8" fill="#0E0E0E" opacity="0.4" />
      <path d={`M40 ${170 + open * 30} h320 v180 h-320z`} fill={accent} filter="brightness(0.8)" />
      <g transform={`translate(200 ${270 + open * 15}) rotate(-10) scale(${interpolate(stamp, [0, 1], [2.4, 1])})`} opacity={Math.min(1, stamp * 1.5)}>
        <rect x="-110" y="-34" width="220" height="68" fill="#F2EEE6" stroke="#0E0E0E" strokeWidth="8" />
        <text x="0" y="16" textAnchor="middle" fontFamily="monospace" fontWeight="700" fontSize="40" fill="#0E0E0E">FILE 002</text>
      </g>
    </svg>
  );
};

// Generic silhouettes for quote cards (no real photos needed)
const Admiral: React.FC<P> = ({main, accent}) => (
  <svg viewBox="0 0 400 400" width="100%" height="100%">
    <path d="M60 400 C60 300 120 270 200 270 C280 270 340 300 340 400z" fill={main} />
    <path d="M170 270 l30 60 l30 -60z" fill="#F2EEE6" />
    <circle cx="200" cy="190" r="70" fill={main} />
    <path d="M118 150 C130 95 270 95 282 150 L290 160 L110 160z" fill={main} />
    <rect x="108" y="152" width="184" height="16" rx="6" fill={accent} />
    <circle cx="200" cy="128" r="12" fill={accent} />
    {[0, 1, 2].map((i) => <rect key={i} x={100 + i * 26} y="320" width="18" height="10" fill={accent} />)}
  </svg>
);

const Official: React.FC<P> = ({main, accent}) => (
  <svg viewBox="0 0 400 400" width="100%" height="100%">
    <path d="M60 400 C60 300 120 270 200 270 C280 270 340 300 340 400z" fill={main} />
    <path d="M172 270 l28 40 l28 -40z" fill="#F2EEE6" />
    <path d="M192 300 l8 -6 l8 6 l-6 70 l-4 6 l-4 -6z" fill={accent} />
    <circle cx="200" cy="185" r="72" fill={main} />
    <path d="M134 160 C140 100 260 100 266 160 C250 130 150 130 134 160z" fill={main} />
  </svg>
);

const MAP: Record<IconName, React.FC<P>> = {
  pentagon: Pentagon, shelf: Shelf, crash: Crash, phoneChip: PhoneChip, folder: Folder, admiral: Admiral, cia: Official,
};

export const Icon: React.FC<P & {name: IconName}> = ({name, ...p}) => {
  const Cmp = MAP[name];
  return <Cmp {...p} />;
};
