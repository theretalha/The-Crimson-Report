import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C as KC, F as KF} from '../kit/theme';
import type {Ev} from './Recipes';

// Everyday-action recipes: the narration describes a normal physical action, so we draw the action itself
// (parcel arrives -> tape cut -> lid off -> chip lifted out -> chip slides into a server -> it runs),
// one step per narrated phrase. Words are only small labels. (Director note 9c)

type S = {caption: string; speak?: number; seconds: number; stage?: string};
const FPS = 30;
const fr = (sec: number) => Math.round(sec * FPS);
const at = (s: S, word: string, lead = 0) => {
  const i = s.caption.toLowerCase().indexOf(word.toLowerCase());
  const frac = i < 0 ? 0.5 : i / s.caption.length;
  return Math.max(0, frac * (s.speak ?? s.seconds * 0.9) + lead);
};
const out = Easing.bezier(0.16, 0.9, 0.2, 1);
const ramp = (f: number, start: number, dur: number) => interpolate(f, [start, start + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: out});
const KRAFT = '#CDB48A', KRAFT_D = '#A98F63', KRAFT_L = '#DCC79F';
const INK = KC.black;

const Chip: React.FC<{x: number; y: number; s?: number; glow?: number}> = ({x, y, s = 1, glow = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {glow > 0 && <rect x={-96} y={-96} width={192} height={192} rx={22} fill={KC.crimson} opacity={0.35 * glow} style={{filter: 'blur(18px)'}} />}
    {Array.from({length: 7}).map((_, i) => (
      <g key={i}>
        <rect x={-62 + i * 20} y={-92} width={8} height={16} fill={KC.cream3} />
        <rect x={-62 + i * 20} y={76} width={8} height={16} fill={KC.cream3} />
        <rect x={-92} y={-62 + i * 20} width={16} height={8} fill={KC.cream3} />
        <rect x={76} y={-62 + i * 20} width={16} height={8} fill={KC.cream3} />
      </g>
    ))}
    <rect x={-80} y={-80} width={160} height={160} rx={12} fill={KC.black2} stroke={INK} strokeWidth={5} />
    <rect x={-46} y={-52} width={92} height={70} rx={4} fill={KC.crimson} stroke={KC.cream} strokeWidth={4} />
    <text x={0} y={-4} textAnchor="middle" fontFamily={KF.head} fontWeight={700} fontSize={44} fill={KC.cream}>AI</text>
    <text x={0} y={52} textAnchor="middle" fontFamily={KF.mono} fontWeight={700} fontSize={17} letterSpacing={3} fill={KC.cream}>AI CHIP</text>
  </g>
);

const Pill: React.FC<{x: number; y: number; n: number; text: string; on: boolean; k: number}> = ({x, y, n, text, on, k}) => (
  <g transform={`translate(${x} ${y + (1 - k) * 18})`} opacity={k}>
    <rect x={-96} y={-26} width={192} height={52} rx={26} fill={on ? KC.crimson : KC.black} />
    <circle cx={-66} cy={0} r={15} fill={KC.cream} />
    <text x={-66} y={7} textAnchor="middle" fontFamily={KF.head} fontWeight={700} fontSize={21} fill={INK}>{n}</text>
    <text x={-38} y={9} fontFamily={KF.head} fontWeight={700} fontSize={26} letterSpacing={3} fill={KC.cream}>{text}</text>
  </g>
);

// ------------------------------------------------------------------ BUY -> OPEN
// stage 'buy': the parcel arrives and stays sealed. stage 'open': the parcel is already there, it gets cut open on the word "open".
const ut = (s: S) => (s.stage === 'open' ? {buy: -9, open: Math.max(0.1, at(s, 'open', -0.12))} : {buy: at(s, 'buy', -0.1), open: 99});
const unbox = {
  events: (s: S): Ev[] => {
    const t = ut(s);
    return s.stage === 'open'
      ? [{t: t.open, kind: 'tick', db: -11}, {t: t.open + 0.2, kind: 'whoosh', db: -20}, {t: t.open + 0.5, kind: 'ping', db: -14}]
      : [{t: t.buy + 0.2, kind: 'slam', db: -16}];
  },
  Comp: ({scene}: {scene: S}) => {
    const f = useCurrentFrame();
    const {fps} = useVideoConfig();
    const t = ut(scene);
    const arrive = t.buy < 0 ? 1 : spring({frame: f - fr(t.buy), fps, config: {damping: 13, stiffness: 120, mass: 0.9}});
    const dx = (1 - arrive) * 1100;
    const tape = ramp(f, fr(t.open), 8);
    const lid = ramp(f, fr(t.open) + 4, 12);
    const rise = spring({frame: f - fr(t.open) - 6, fps, config: {damping: 14, stiffness: 160}});
    const bob = f > fr(t.open) + 40 ? Math.sin((f - fr(t.open)) / 9) * 4 : 0;
    const tag = t.buy < 0 ? 1 : ramp(f, fr(t.buy) + 12, 14);
    const cx = 960, top = 570, bot = 810;
    const chipY = interpolate(rise, [0, 1], [690, 400]) + bob;
    const lidDX = lid * 260, lidDY = -lid * 190, lidR = lid * 34;
    return (
      <AbsoluteFill>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <Pill x={1430} y={310} n={1} text="BUY" on={f < fr(t.open)} k={t.buy < 0 ? 1 : ramp(f, fr(t.buy), 10)} />
          <Pill x={1660} y={310} n={2} text="OPEN" on={f >= fr(t.open)} k={ramp(f, fr(t.open) - 2, 10)} />
          <g transform={`translate(${dx} 0)`}>
            <ellipse cx={cx + 30} cy={bot + 14} rx={260} ry={22} fill={INK} opacity={0.18} />
            {/* inside of the box (dark) */}
            <polygon points={`${cx - 190},${top} ${cx + 190},${top} ${cx + 250},${top - 32} ${cx - 130},${top - 32}`} fill={KC.black} />
            {/* the chip, rising out of the box */}
            <g opacity={rise > 0.01 ? 1 : 0}><Chip x={cx + 10} y={chipY} glow={rise} /></g>
            {/* front + side faces drawn over the chip so it comes OUT of the box */}
            <rect x={cx - 190} y={top} width={380} height={bot - top} fill={KRAFT} stroke={INK} strokeWidth={6} />
            <polygon points={`${cx + 190},${top} ${cx + 250},${top - 32} ${cx + 250},${bot - 32} ${cx + 190},${bot}`} fill={KRAFT_D} stroke={INK} strokeWidth={6} />
            <rect x={cx - 150} y={top + 70} width={150} height={78} fill={KC.cream} stroke={INK} strokeWidth={4} />
            <text x={cx - 75} y={top + 105} textAnchor="middle" fontFamily={KF.mono} fontWeight={700} fontSize={19} fill={INK}>H100 · AI</text>
            <text x={cx - 75} y={top + 132} textAnchor="middle" fontFamily={KF.mono} fontSize={15} fill={INK}>FRAGILE</text>
            {/* lid (top face + front lip) lifts off and flies away */}
            <g transform={`translate(${lidDX} ${lidDY}) rotate(${lidR} ${cx - 190} ${top})`} opacity={1 - Math.max(0, lid - 0.7) / 0.3}>
              <polygon points={`${cx - 190},${top} ${cx + 190},${top} ${cx + 250},${top - 32} ${cx - 130},${top - 32}`} fill={KRAFT_L} stroke={INK} strokeWidth={6} />
              <rect x={cx - 190} y={top} width={380} height={40} fill={KRAFT_L} stroke={INK} strokeWidth={6} />
              {/* tape: slides away when cut */}
              <rect x={cx - 190 + tape * 380} y={top - 32} width={Math.max(0, 380 - tape * 380)} height={72} fill={KC.crimson} />
              {tape < 1 && <text x={cx} y={top + 28} textAnchor="middle" fontFamily={KF.head} fontWeight={700} fontSize={24} letterSpacing={6} fill={KC.cream} opacity={1 - tape}>SEALED</text>}
            </g>
            {/* price tag */}
            <g transform={`translate(${cx - 205} ${top - 20}) rotate(-8)`} opacity={tag}>
              <line x1={0} y1={0} x2={-30} y2={-46} stroke={INK} strokeWidth={4} />
              <rect x={-96} y={-110} width={132} height={64} rx={6} fill={KC.crimson} stroke={INK} strokeWidth={4} />
              <text x={-30} y={-64} textAnchor="middle" fontFamily={KF.head} fontWeight={700} fontSize={34} letterSpacing={3} fill={KC.cream}>BUY</text>
            </g>
          </g>
        </svg>
      </AbsoluteFill>
    );
  },
};

// ------------------------------------------------------------------ PLUG IN -> USE
const pt = (s: S) => ({plug: at(s, 'plug', -0.15), use: at(s, 'use', -0.05)});
const plugin = {
  events: (s: S): Ev[] => {
    const t = pt(s);
    return [{t: t.plug, kind: 'whoosh', db: -20}, {t: t.plug + 0.38, kind: 'tick', db: -10}, {t: t.plug + 0.42, kind: 'ping', db: -14}, {t: t.use, kind: 'ping', db: -14}, {t: t.use + 0.3, kind: 'tick', db: -18}];
  },
  Comp: ({scene}: {scene: S}) => {
    const f = useCurrentFrame();
    const {fps} = useVideoConfig();
    const t = pt(scene);
    const slide = ramp(f, fr(t.plug), 12);
    const click = f - (fr(t.plug) + 12);
    const rackIn = ramp(f, 0, 14);
    const on = ramp(f, fr(t.plug) + 12, 6);
    const run = ramp(f, fr(t.use), 14);
    const RX = 700, RW = 440, RY = 350, SH = 96, GAP = 16;
    const slots = [0, 1, 2, 3];
    const target = 1;
    const sy = (i: number) => RY + 34 + i * (SH + GAP);
    const chipX = interpolate(slide, [0, 1], [250, RX + 40]);
    const pulse = (i: number) => 0.55 + 0.45 * Math.sin(f / 5 + i * 1.7);
    const ring = click >= 0 ? ramp(f, fr(t.plug) + 12, 14) : 0;
    return (
      <AbsoluteFill>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <Pill x={1430} y={310} n={1} text="PLUG IN" on={f < fr(t.use)} k={ramp(f, fr(t.plug) - 2, 10)} />
          <Pill x={1660} y={310} n={2} text="USE" on={f >= fr(t.use)} k={ramp(f, fr(t.use) - 2, 10)} />
          <g opacity={rackIn} transform={`translate(0 ${(1 - rackIn) * 40})`}>
            <rect x={RX + 14} y={RY + 14} width={RW} height={4 * (SH + GAP) + 52} fill={INK} opacity={0.16} />
            <rect x={RX} y={RY} width={RW} height={4 * (SH + GAP) + 52} fill={KC.black3} stroke={INK} strokeWidth={6} />
            <rect x={RX} y={RY} width={RW} height={30} fill={KC.black} />
            <text x={RX + 16} y={RY + 22} fontFamily={KF.mono} fontWeight={700} fontSize={15} letterSpacing={4} fill={KC.ash}>DATA CENTER RACK</text>
            {slots.map((i) => (
              <g key={i}>
                <rect x={RX + 14} y={sy(i)} width={RW - 28} height={SH} fill={i === target ? KC.black : KC.black2} stroke={KC.ash} strokeWidth={2} opacity={i === target ? 1 : 0.9} />
                {Array.from({length: 9}).map((_, v) => <rect key={v} x={RX + 240 + v * 16} y={sy(i) + 22} width={6} height={SH - 44} fill={KC.black3} />)}
                <circle cx={RX + 36} cy={sy(i) + SH / 2} r={8} fill={i === target ? KC.cream3 : KC.cream} opacity={i === target ? 0.25 + 0.75 * on : pulse(i) * 0.8} />
              </g>
            ))}
            {/* chip card sliding into the empty slot */}
            <g transform={`translate(${chipX} ${sy(target) + SH / 2})`}>
              <rect x={0} y={-40} width={250} height={80} rx={6} fill={KC.black2} stroke={KC.cream} strokeWidth={3} />
              <rect x={14} y={-26} width={86} height={52} fill={KC.crimson} stroke={KC.cream} strokeWidth={3} />
              <text x={57} y={11} textAnchor="middle" fontFamily={KF.head} fontWeight={700} fontSize={30} fill={KC.cream}>AI</text>
              <text x={168} y={9} textAnchor="middle" fontFamily={KF.mono} fontWeight={700} fontSize={16} letterSpacing={2} fill={KC.cream}>AI CHIP</text>
              <rect x={250} y={-30} width={10} height={60} fill={KC.cream3} />
            </g>
            {/* click: ring burst at the slot mouth */}
            {ring > 0 && ring < 1 && <circle cx={RX + 14} cy={sy(target) + SH / 2} r={20 + ring * 80} fill="none" stroke={KC.crimson} strokeWidth={8 * (1 - ring)} opacity={1 - ring} />}
            {/* LEDs light on the chip slot, then the whole rack runs */}
            {on > 0 && <circle cx={RX + 36} cy={sy(target) + SH / 2} r={22} fill={KC.crimson} opacity={0.4 * on} style={{filter: 'blur(8px)'}} />}
            {on > 0 && <circle cx={RX + 36} cy={sy(target) + SH / 2} r={8} fill={KC.cream} />}
          </g>
          {/* power cable draws from the rack when plugged in */}
          <path d={`M ${RX + RW} ${sy(target) + SH / 2} C ${RX + RW + 90} ${sy(target) + SH / 2}, ${RX + RW + 90} ${RY + 40}, ${RX + RW + 190} ${RY + 40}`} fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" strokeDasharray={420} strokeDashoffset={420 * (1 - on)} />
          {/* the running panel: bars growing */}
          <g opacity={run} transform={`translate(${1390} ${RY + 30 + (1 - run) * 24})`}>
            <rect x={0} y={0} width={330} height={290} fill={KC.cream} stroke={INK} strokeWidth={6} />
            <rect x={0} y={0} width={330} height={42} fill={INK} />
            <text x={16} y={29} fontFamily={KF.mono} fontWeight={700} fontSize={19} letterSpacing={4} fill={KC.cream}>RUNNING</text>
            <circle cx={302} cy={21} r={8} fill={KC.crimson} opacity={pulse(0)} />
            {[0, 1, 2, 3, 4].map((i) => {
              const h = (60 + 120 * (0.5 + 0.5 * Math.sin(f / 7 + i * 1.3))) * run;
              return <rect key={i} x={26 + i * 58} y={262 - h} width={38} height={h} fill={i === 4 ? KC.crimson : INK} />;
            })}
            <text x={16} y={80} fontFamily={KF.head} fontWeight={700} fontSize={24} letterSpacing={3} fill={INK}>AI MODELS TRAINING</text>
          </g>
        </svg>
      </AbsoluteFill>
    );
  },
};

export const EVERYDAY = {unbox, plugin};
