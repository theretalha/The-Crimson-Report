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


const Servers: React.FC<P> = ({main, accent}) => {
  const f = useCurrentFrame();
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%">
      {[0, 1, 2].map((c) => (
        <g key={c}>
          <rect x={40 + c * 115} y="50" width="95" height="300" fill={main} />
          {[...Array(8)].map((_, r) => (
            <g key={r}>
              <rect x={50 + c * 115} y={62 + r * 35} width="75" height="24" fill="#1d1d1d" />
              <circle cx={115 + c * 115} cy={74 + r * 35} r="4" fill={accent} opacity={(Math.floor(f / 4) + r + c) % 3 === 0 ? 1 : 0.25} />
            </g>
          ))}
        </g>
      ))}
      <ellipse cx={interpolate(f % 90, [0, 90], [40, 360])} cy="200" rx="60" ry="170" fill="#FFF6C8" opacity="0.12" />
    </svg>
  );
};

const Boxes: React.FC<P> = ({main, accent}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const box = (x: number, y: number, i: number) => {
    const s = spring({frame: f - i * 4, fps, config: {damping: 12}});
    return (
      <g key={i} transform={`translate(${x} ${y - (1 - s) * 80})`} opacity={s}>
        <rect width="150" height="100" fill="#C9A26B" stroke="#8A6A3F" strokeWidth="4" />
        <rect x="0" y="42" width="150" height="16" fill={accent} />
        <text x="75" y="35" textAnchor="middle" fontFamily="monospace" fontWeight="700" fontSize="18" fill="#3a2a14">NVIDIA</text>
        <text x="75" y="56" textAnchor="middle" fontFamily="monospace" fontWeight="700" fontSize="13" fill="#fff">SEALED</text>
      </g>
    );
  };
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%">
      {box(40, 260, 0)}{box(210, 260, 1)}{box(125, 160, 2)}{box(40, 60, 4)}{box(210, 60, 3)}
      <rect x="20" y="362" width="360" height="10" fill={main} />
    </svg>
  );
};

const IdCard: React.FC<P> = ({main, accent}) => {
  const f = useCurrentFrame();
  const q = 0.5 + 0.5 * Math.sin(f / 6);
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%">
      <rect x="30" y="90" width="340" height="220" rx="14" fill="#F2EEE6" />
      <rect x="30" y="90" width="340" height="44" rx="14" fill={accent} />
      <rect x="55" y="155" width="110" height="130" fill="#bbb" />
      <text x="110" y="248" textAnchor="middle" fontFamily="sans-serif" fontWeight="900" fontSize="96" fill={accent} opacity={0.6 + 0.4 * q}>?</text>
      {[0, 1, 2, 3].map((i) => <rect key={i} x="190" y={165 + i * 30} width={150 - i * 20} height="12" fill={main} opacity="0.35" />)}
      <g transform="translate(250 270) rotate(-14)">
        <rect x="-90" y="-26" width="180" height="52" fill="none" stroke={accent} strokeWidth="6" />
        <text x="0" y="12" textAnchor="middle" fontFamily="monospace" fontWeight="700" fontSize="28" fill={accent}>UNVERIFIED</text>
      </g>
    </svg>
  );
};

const WhiteHouse: React.FC<P> = ({main, accent}) => (
  <svg viewBox="0 0 400 400" width="100%" height="100%">
    <rect x="30" y="200" width="340" height="130" fill={main} />
    <polygon points="140,200 200,150 260,200" fill={main} />
    <rect x="130" y="200" width="140" height="130" fill={main} stroke="#000" strokeOpacity="0.25" strokeWidth="4" />
    {[...Array(6)].map((_, i) => <rect key={i} x={145 + i * 22} y="210" width="8" height="120" fill="#000" opacity="0.25" />)}
    {[50, 90, 290, 330].map((x) => <rect key={x} x={x} y="230" width="22" height="34" fill="#000" opacity="0.3" />)}
    <rect x="196" y="100" width="4" height="52" fill={main} />
    <rect x="200" y="100" width="44" height="26" fill={accent} />
    <rect x="20" y="330" width="360" height="12" fill={main} />
  </svg>
);

const Capitol: React.FC<P> = ({main, accent}) => (
  <svg viewBox="0 0 400 400" width="100%" height="100%">
    <path d="M140 210 Q140 120 200 110 Q260 120 260 210z" fill={main} />
    <rect x="196" y="70" width="8" height="42" fill={main} />
    <circle cx="200" cy="66" r="10" fill={accent} />
    <rect x="120" y="205" width="160" height="22" fill={main} />
    <rect x="30" y="227" width="340" height="100" fill={main} />
    {[...Array(9)].map((_, i) => <rect key={i} x={50 + i * 36} y="240" width="10" height="80" fill="#000" opacity="0.25" />)}
    <rect x="20" y="327" width="360" height="12" fill={main} />
  </svg>
);

const Chip: React.FC<P> = ({main, accent}) => {
  const f = useCurrentFrame();
  const pulse = 0.5 + 0.5 * Math.sin(f / 5);
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%">
      {[...Array(7)].map((_, i) => (
        <g key={i} fill={main}>
          <rect x={115 + i * 28} y="60" width="10" height="40" /><rect x={115 + i * 28} y="300" width="10" height="40" />
          <rect x="60" y={115 + i * 28} width="40" height="10" /><rect x="300" y={115 + i * 28} width="40" height="10" />
        </g>
      ))}
      <rect x="100" y="100" width="200" height="200" rx="10" fill={main} />
      <rect x="135" y="135" width="130" height="130" fill={accent} opacity={0.75 + 0.25 * pulse} />
      <rect x="135" y="135" width="130" height="130" fill="none" stroke={accent} strokeWidth="5" opacity={pulse}
        transform="translate(200 200) scale(1.3) translate(-200 -200)" />
      <text x="200" y="210" textAnchor="middle" fontFamily="monospace" fontWeight="700" fontSize="26" fill="#F2EEE6">AI GPU</text>
    </svg>
  );
};

const ChartV: React.FC<P> = ({main, accent}) => {
  const f = useCurrentFrame();
  const draw = interpolate(f, [4, 50], [0, 1], clamp);
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%">
      {[80, 160, 240, 320].map((y) => <line key={y} x1="30" x2="370" y1={y} y2={y} stroke={main} strokeOpacity="0.2" strokeWidth="3" />)}
      <polyline points="30,110 80,120 120,100 160,200 200,300 230,320 260,230 300,130 340,80 370,70" fill="none" stroke={accent}
        strokeWidth="14" strokeLinejoin="round" strokeLinecap="round" pathLength={1} style={{strokeDasharray: `${draw} 1`}} />
      <text x="30" y="50" fontFamily="monospace" fontWeight="700" fontSize="30" fill={main}>NVDA</text>
      <text x="200" y="370" textAnchor="middle" fontFamily="monospace" fontWeight="700" fontSize="20" fill={main} opacity={draw > 0.5 ? 1 : 0}>RESIGNS</text>
      <text x="340" y="50" textAnchor="end" fontFamily="monospace" fontWeight="700" fontSize="20" fill={accent} opacity={draw > 0.95 ? 1 : 0}>RETURNS</text>
    </svg>
  );
};

const Radar: React.FC<P> = ({main, accent}) => {
  const f = useCurrentFrame();
  const a = (f * 6) % 360;
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%">
      {[160, 110, 60].map((r) => <circle key={r} cx="200" cy="200" r={r} fill="none" stroke={main} strokeOpacity="0.4" strokeWidth="3" />)}
      <line x1="40" x2="360" y1="200" y2="200" stroke={main} strokeOpacity="0.3" strokeWidth="2" />
      <line x1="200" x2="200" y1="40" y2="360" stroke={main} strokeOpacity="0.3" strokeWidth="2" />
      <path d={`M200 200 L${200 + 160 * Math.cos((a * Math.PI) / 180)} ${200 + 160 * Math.sin((a * Math.PI) / 180)} A160 160 0 0 0 ${200 + 160 * Math.cos(((a - 40) * Math.PI) / 180)} ${200 + 160 * Math.sin(((a - 40) * Math.PI) / 180)} Z`} fill={accent} opacity="0.35" />
      <circle cx="270" cy="140" r="12" fill={accent} opacity={0.5 + 0.5 * Math.sin(f / 4)} />
      <circle cx="140" cy="250" r="9" fill={accent} opacity={0.5 + 0.5 * Math.cos(f / 4)} />
    </svg>
  );
};

const Magnifier: React.FC<P> = ({main, accent}) => {
  const f = useCurrentFrame();
  const x = 170 + Math.sin(f / 12) * 50;
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%">
      <rect x="40" y="70" width="320" height="220" fill={main} opacity="0.9" />
      <polyline points="60,250 110,200 150,230 200,140 250,170 300,110 340,130" fill="none" stroke={accent} strokeWidth="6" />
      <g transform={`translate(${x} 170)`}>
        <circle r="70" fill="none" stroke="#F2EEE6" strokeWidth="14" />
        <circle r="64" fill="#F2EEE6" opacity="0.15" />
        <rect x="45" y="45" width="24" height="90" rx="10" fill="#F2EEE6" transform="rotate(-45 45 45)" />
      </g>
    </svg>
  );
};

const Photos: React.FC<P> = ({main, accent}) => (
  <svg viewBox="0 0 400 400" width="100%" height="100%">
    <rect x="110" y="20" width="180" height="360" rx="26" fill={main} />
    <rect x="122" y="48" width="156" height="306" rx="6" fill="#1d1d1d" />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <rect key={i} x={128 + (i % 2) * 76} y={56 + Math.floor(i / 2) * 98} width="70" height="90" fill={i === 2 ? accent : '#4a4a4a'} />
    ))}
    <path d="M150 172 l12 -12 l12 12 l-12 14z" fill="#F2EEE6" />
  </svg>
);

const Petition: React.FC<P> = ({main, accent}) => {
  const f = useCurrentFrame();
  const n = Math.floor(interpolate(f, [0, 60], [0, 18800], clamp));
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%">
      <rect x="80" y="40" width="240" height="320" fill="#F2EEE6" />
      <rect x="100" y="64" width="200" height="16" fill={accent} />
      {[...Array(9)].map((_, i) => <path key={i} d={`M105 ${110 + i * 24} q20 -14 40 0 t40 0 t40 0`} fill="none" stroke={main === '#F2EEE6' ? '#555' : main} strokeWidth="3" opacity="0.6" />)}
      <text x="200" y="345" textAnchor="middle" fontFamily="monospace" fontWeight="700" fontSize="30" fill={accent}>{n.toLocaleString('en-US')}</text>
    </svg>
  );
};

const Scales: React.FC<P> = ({main, accent}) => {
  const f = useCurrentFrame();
  const tilt = Math.sin(f / 15) * 8;
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%">
      <rect x="194" y="80" width="12" height="260" fill={main} />
      <rect x="130" y="340" width="140" height="16" fill={main} />
      <g transform={`rotate(${tilt} 200 100)`}>
        <rect x="70" y="94" width="260" height="10" fill={main} />
        <path d="M80 104 l-40 90 h80z" fill="none" stroke={main} strokeWidth="3" />
        <path d="M320 104 l-40 90 h80z" fill="none" stroke={main} strokeWidth="3" />
        <path d="M40 194 a40 16 0 0 0 80 0z" fill={accent} />
        <path d="M280 194 a40 16 0 0 0 80 0z" fill={main} />
      </g>
    </svg>
  );
};

const Letter: React.FC<P> = ({main, accent}) => (
  <svg viewBox="0 0 400 400" width="100%" height="100%">
    <rect x="70" y="40" width="260" height="330" fill="#F2EEE6" />
    <text x="95" y="85" fontFamily="monospace" fontWeight="700" fontSize="20" fill="#0E0E0E">To all employees,</text>
    {[...Array(8)].map((_, i) => <rect key={i} x="95" y={110 + i * 26} width={200 - (i % 3) * 30} height="10" fill="#0E0E0E" opacity="0.35" />)}
    <rect x="95" y="190" width="210" height="14" fill={accent} opacity="0.85" />
    <text x="95" y="345" fontFamily="cursive" fontSize="26" fill="#0E0E0E">— Jensen</text>
  </svg>
);

const DoorShut: React.FC<P> = ({main, accent}) => (
  <svg viewBox="0 0 400 400" width="100%" height="100%">
    <rect x="110" y="40" width="180" height="320" fill={main} />
    <rect x="130" y="60" width="140" height="130" fill="#000" opacity="0.2" />
    <rect x="130" y="210" width="140" height="130" fill="#000" opacity="0.2" />
    <circle cx="260" cy="210" r="10" fill={accent} />
    <rect x="70" y="170" width="260" height="60" fill={accent} transform="rotate(-12 200 200)" />
    <text x="200" y="212" textAnchor="middle" fontFamily="monospace" fontWeight="700" fontSize="30" fill="#F2EEE6" transform="rotate(-12 200 200)">CLOSED</text>
  </svg>
);

const MAP: Record<IconName, React.FC<P>> = {
  pentagon: Pentagon, shelf: Shelf, crash: Crash, phoneChip: PhoneChip, folder: Folder, admiral: Admiral, cia: Official,
  servers: Servers, boxes: Boxes, idcard: IdCard, whitehouse: WhiteHouse, capitol: Capitol, chip: Chip, chartV: ChartV,
  radar: Radar, magnifier: Magnifier, photos: Photos, petition: Petition, scales: Scales, letter: Letter, doorShut: DoorShut,
};

export const Icon: React.FC<P & {name: IconName}> = ({name, ...p}) => {
  const Cmp = MAP[name];
  return <Cmp {...p} />;
};
