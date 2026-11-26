import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {getLength, getPointAtLength, getTangentAtLength} from '@remotion/paths';
import {Curio, walkPose, AMBER, INK, BONE, type Pose} from './Curio';
import {F} from '../kit/theme';

// Creative test: (1) the Curiosity Line as the animation engine, (2) a landscape that draws itself (ink -> wash -> hatching),
// (3) a cutaway diorama with tiny Curios doing their hour. Everything is drawn in code; no external images.
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const pr = (f: number, a: number, b: number, e = Easing.out(Easing.cubic)) => interpolate(f, [a, b], [0, 1], {...clamp, easing: e});
const WASH = {snow: '#F6F2E8', hill: '#DCE3E4', stone: '#B7B2A3', sky: '#CBD5DA', wood: '#8A6B45', warm: '#E9C987', cloth: '#7A7A4C', floor: '#CDB88F'};
const ROAD = 'M 220 1010 C 520 900, 640 980, 900 880 S 1300 800, 1480 700';
const roadLen = getLength(ROAD);

const Draw: React.FC<{d: string; f: number; a: number; len?: number; fill?: string; fa?: number; w?: number; hatch?: boolean}> = ({d, f, a, len = 30, fill, fa, w = 6, hatch}) => {
  const p = pr(f, a, a + len), fp = pr(f, fa ?? a + len * 0.6, (fa ?? a + len * 0.6) + 30);
  return (
    <g>
      {fill && <path d={d} fill={fill} opacity={fp} />}
      {hatch && <path d={d} fill="url(#hatch)" opacity={pr(f, (fa ?? a) + 30, (fa ?? a) + 60) * 0.5} />}
      <path d={d} fill="none" stroke={INK} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} opacity={p > 0.001 ? 1 : 0} />
    </g>
  );
};

const Snow: React.FC<{f: number; n?: number; dark?: boolean}> = ({f, n = 90, dark}) => (
  <g>{Array.from({length: n}).map((_, i) => {
    const sx = (i * 197) % 1920, sp = 2.2 + (i % 5) * 0.9, x = (sx + f * (1.6 + (i % 3) * 0.5)) % 1960 - 20, y = ((i * 83) % 1100 + f * sp) % 1100 - 10;
    return <line key={i} x1={x} y1={y} x2={x - 7} y2={y + 12} stroke={dark ? INK : '#fff'} strokeWidth={2.4} strokeLinecap="round" opacity={0.5 + (i % 3) * 0.15} />;
  })}</g>
);

const SceneA: React.FC<{f: number}> = ({f}) => {
  const prog = pr(f, 36, 138, Easing.inOut(Easing.quad));
  const L = roadLen * (0.02 + 0.9 * prog);
  const pt = getPointAtLength(ROAD, L)!, tg = getTangentAtLength(ROAD, L)!;
  const sc = interpolate(prog, [0, 1], [0.46, 0.2]);
  const reveal = pr(f, 36, 118);
  const cam = 1 + 0.1 * pr(f, 0, 150, Easing.inOut(Easing.cubic));
  return (
    <g transform={`translate(960 600) scale(${cam}) translate(${-960 - 60 * pr(f, 0, 150)} -600)`}>
      <defs>
        <filter id="wob" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed={Math.floor(f / 6) % 5} /><feDisplacementMap in="SourceGraphic" scale="6" /></filter>
        <pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="14" stroke={INK} strokeWidth="2" /></pattern>
        <mask id="reveal"><path d={ROAD} stroke="#fff" strokeWidth={30} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - reveal} /></mask>
      </defs>
      <g filter="url(#wob)">
        <Draw d="M -20 0 L 1940 0 L 1940 420 Q 1500 470 1100 430 T -20 450 Z" f={f} a={4} len={26} fill={WASH.sky} fa={10} w={0.01} />
        <Draw d="M -20 640 Q 300 540 620 610 T 1200 590 T 1940 560 L 1940 1100 L -20 1100 Z" f={f} a={6} len={40} fill={WASH.hill} fa={20} hatch />
        {/* castle */}
        <g>
          <Draw d="M 1300 700 L 1300 560 L 1660 560 L 1660 700 Z" f={f} a={14} fill={WASH.stone} fa={34} hatch />
          <Draw d="M 1280 700 L 1280 470 L 1350 470 L 1350 700 M 1610 700 L 1610 470 L 1680 470 L 1680 700" f={f} a={18} fill={WASH.stone} fa={38} hatch />
          <Draw d="M 1390 560 L 1390 440 L 1570 440 L 1570 560" f={f} a={22} fill={WASH.stone} fa={40} hatch />
          <Draw d="M 1440 700 L 1440 640 Q 1480 590 1520 640 L 1520 700" f={f} a={26} fill="#2B2118" fa={44} />
          <Draw d="M 1278 470 L 1315 425 L 1352 470 M 1608 470 L 1645 425 L 1682 470" f={f} a={28} len={20} w={5} />
        </g>
        {/* bare trees */}
        {[[260, 640, 1], [470, 660, 0.8], [760, 650, 0.9], [1050, 640, 0.7]].map(([x, y, s], i) => (
          <Draw key={i} d={`M ${x} ${y} L ${x} ${y - 150 * s} M ${x} ${y - 70 * s} L ${x - 50 * s} ${y - 130 * s} M ${x} ${y - 100 * s} L ${x + 55 * s} ${y - 160 * s} M ${x} ${y - 130 * s} L ${x - 25 * s} ${y - 190 * s}`} f={f} a={20 + i * 6} len={34} w={6} />
        ))}
        {/* road: a pale band with ink edges */}
        <path d={ROAD} fill="none" stroke={INK} strokeWidth={102} strokeLinecap="round" opacity={pr(f, 30, 44)} />
        <path d={ROAD} fill="none" stroke={WASH.snow} strokeWidth={94} strokeLinecap="round" opacity={pr(f, 30, 44)} />
      </g>
      {/* the Curiosity Line */}
      <g mask="url(#reveal)"><path d={ROAD} fill="none" stroke={AMBER} strokeWidth={11} strokeLinecap="round" strokeDasharray="1 24" /></g>
      <circle cx={pt.x} cy={pt.y} r={0} fill={AMBER} />
      <Curio id="w" x={pt.x} y={pt.y - 232 * sc} pose={{...walkPose(f / 17), wind: 0.7}} look={{costume: 'tunic', hair: 'messy', scale: sc, flip: tg.x < 0}} t={f / 30} />
      <Snow f={f} />
    </g>
  );
};

const Flame: React.FC<{x: number; y: number; f: number; s?: number}> = ({x, y, f, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx={0} cy={-30} r={70 + Math.sin(f / 3) * 6} fill={AMBER} opacity={0.22} />
    <path d={`M 0 0 Q -26 -20 -14 -48 Q -8 -30 -2 -64 Q 14 -40 18 -26 Q 28 -10 0 0 Z`} transform={`scale(${1 + Math.sin(f / 2.2) * 0.06} ${1 + Math.sin(f / 1.7) * 0.1})`} fill={AMBER} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M 0 0 Q -12 -10 -4 -26 Q 4 -12 10 -16 Q 14 -4 0 0 Z" fill="#FFE29A" />
  </g>
);

const SceneB: React.FC<{f: number}> = ({f}) => {
  const t = f / 30, pan = interpolate(f, [0, 150], [260, -520], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const sc = 0.62;
  const rooms = [{x: 0, name: 'KITCHEN'}, {x: 520, name: 'GREAT HALL'}, {x: 1040, name: 'BED CHAMBER'}];
  const stir: Pose = {lean: 8, rArm: 50 + Math.sin(t * 6) * 26, rElbow: 35, lArm: 14, lElbow: 20, mouth: 'flat', eyes: 'dot'};
  const shiver: Pose = {lArm: 32, lElbow: 112, rArm: -32, rElbow: -112, mouth: 'frown', eyes: 'tired', brows: 'worried', lean: 4};
  const wp = pr(f, 8, 140);
  const path = 'M 120 780 L 640 780 L 1160 780 L 1700 780';
  const pt = getPointAtLength(path, getLength(path) * wp)!;
  return (
    <g transform={`translate(960 560) scale(1.5) translate(-960 -560) translate(${pan} 30)`}>
      <defs><filter id="wob2" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="2" seed={Math.floor(f / 6) % 5} /><feDisplacementMap in="SourceGraphic" scale="5" /></filter></defs>
      <g filter="url(#wob2)">
        {rooms.map((r, i) => {
          const a = 2 + i * 6;
          return (
            <g key={r.name} transform={`translate(${200 + r.x} 0)`}>
              <Draw d="M 0 280 L 520 280 L 520 800 L 0 800 Z" f={f} a={a} len={24} fill={['#E4D5B0', '#E0CBA0', '#D6D0C2'][i]} fa={a + 8} w={7} hatch />
              <Draw d="M 0 280 L 260 210 L 520 280" f={f} a={a + 4} len={20} w={7} />
              <Draw d="M 0 800 L 520 800" f={f} a={a + 6} len={16} fill={WASH.floor} w={9} />
              <Draw d="M 360 340 L 360 470 L 450 470 L 450 340 Z" f={f} a={a + 10} len={16} fill={WASH.sky} w={5} />
              <text x={30} y={324} fontFamily={F.mono.toString()} fontWeight={700} fontSize={22} letterSpacing={4} fill={INK} opacity={pr(f, a + 14, a + 24)}>{r.name}</text>
            </g>
          );
        })}
        {/* kitchen: cauldron over fire + cook */}
        <g transform="translate(200 0)" opacity={pr(f, 14, 26)}>
          <Flame x={150} y={790} f={f} s={1.2} />
          <path d="M 100 700 Q 150 640 200 700 Q 200 760 150 768 Q 100 760 100 700 Z" fill="#3A3128" stroke={INK} strokeWidth={5} />
          <Curio id="k" x={300} y={800 - 232 * sc} pose={stir} look={{costume: 'tunic', hair: 'messy', scale: sc, flip: true}} t={t} />
        </g>
        {/* hall: hearth, table, shivering Curio and two cloaked neighbours */}
        <g transform="translate(720 0)" opacity={pr(f, 20, 32)}>
          <Flame x={400} y={790} f={f} s={1.5} />
          <path d="M 60 700 L 300 700 L 300 740 L 60 740 Z M 90 740 L 90 800 M 270 740 L 270 800" fill={WASH.wood} stroke={INK} strokeWidth={6} />
          <g transform={`translate(${Math.sin(f * 2.1) * 2} 0)`}><Curio id="h" x={170} y={800 - 232 * sc} pose={shiver} look={{costume: 'cloak', hair: 'messy', tunic: '#6B5A3A', scale: sc}} t={t} /></g>
          <circle cx={300} cy={690} r={22} fill={BONE} stroke={INK} strokeWidth={5} /><path d="M 270 800 Q 270 720 300 715 Q 330 720 330 800 Z" fill="#7A5A3C" stroke={INK} strokeWidth={5} />
        </g>
        {/* bed chamber: sleeping Curio, rising Zs */}
        <g transform="translate(1240 0)" opacity={pr(f, 26, 38)}>
          <path d="M 40 770 L 440 770 L 440 800 L 40 800 Z M 40 720 L 40 800" fill={WASH.wood} stroke={INK} strokeWidth={6} />
          <path d="M 70 720 L 430 720 L 430 770 L 70 770 Z" fill="#9AA27A" stroke={INK} strokeWidth={5} />
          <g transform="translate(130 740) rotate(-88)"><Curio id="s" x={0} y={0} pose={{mouth: 'flat', eyes: 'closed', lArm: 4, rArm: -4, bob: 0}} look={{costume: 'none', hair: 'messy', scale: sc}} t={t} /></g>
          {[0, 1, 2].map((i) => <text key={i} x={190 + i * 26} y={690 - ((t * 40 + i * 30) % 90)} fontFamily={F.hand.toString()} fontSize={34 + i * 8} fill={INK} opacity={0.8 - ((t * 40 + i * 30) % 90) / 120}>z</text>)}
        </g>
      </g>
      {/* the line carries us through every room */}
      <path d={path} fill="none" stroke={AMBER} strokeWidth={10} strokeLinecap="round" strokeDasharray="1 24" opacity={pr(f, 0, 20)} />
      <circle cx={pt.x} cy={pt.y} r={16} fill={AMBER} stroke={INK} strokeWidth={4} /><circle cx={pt.x} cy={pt.y} r={34} fill={AMBER} opacity={0.25} />
    </g>
  );
};

export const CurioFilm: React.FC = () => {
  const f = useCurrentFrame();
  const inA = f < 156, xf = pr(f, 144, 160, Easing.inOut(Easing.cubic));
  return (
    <AbsoluteFill style={{background: '#EFE6D0'}}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        {inA && <g opacity={1 - xf}><SceneA f={f} /></g>}
        {f >= 144 && <g opacity={xf}><rect width={1920} height={1080} fill="#EFE6D0" /><SceneB f={f - 150 < 0 ? 0 : f - 150} /><Snow f={f} n={0} /></g>}
      </svg>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity: 0.35, pointerEvents: 'none'}}>
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={Math.floor(f / 4) % 6} /><feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0 0.25  0 0 0 0.9 -0.15" /></filter>
        <rect width={1920} height={1080} filter="url(#grain)" />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center', fontFamily: F.hand, fontSize: 54, color: INK, opacity: pr(f, 118, 134) * (1 - pr(f, 150, 160))}}>Follow the line.</div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center', fontFamily: F.hand, fontSize: 54, color: INK, opacity: pr(f, 262, 276)}}>Every room, every hour.</div>
    </AbsoluteFill>
  );
};
