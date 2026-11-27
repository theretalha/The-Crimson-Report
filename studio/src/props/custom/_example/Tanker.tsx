import React from 'react';
import {C as KC, F as KF} from '../../../kit/theme';
import {bob, drawOn, groundShadowProps, overshoot, prog, type CustomProp} from '../kit';

// REFERENCE custom prop: an oil tanker on the water. Copy this file as the pattern for a new prop:
//   1. strokes DRAW ON (drawOn), 2. depth (shadow, layered fills), 3. overshoot (overshoot()), 4. sound events, 5. idle motion (bob).
// Drawn around (0,0): the waterline is y=0, up is negative, about 520 px wide.
const INK = KC.black;
const W = 5;

const HULL = 'M -250 -40 L 250 -40 L 215 0 L -225 0 Z';

export const Tanker: CustomProp['Comp'] = ({f, t0, fg, it}) => {
  const pop = Math.min(1.12, overshoot(f, t0 + 10));
  const fill = prog(f, t0 + 16, 10);
  const y = bob(f, 4, 70);
  const hatches = [-170, -90, -10, 70, 150];
  return (
    <g>
      <ellipse {...groundShadowProps(270, 10)} fill={INK} />
      <g transform={`translate(0 ${y})`}>
        {/* hull: outline draws on, then the fill arrives */}
        <path d={HULL} fill={KC.crimsonDeep} opacity={fill} />
        <path d={HULL} fill="none" stroke={INK} strokeWidth={W} strokeLinejoin="round" {...drawOn(f, t0, 22)} />
        <path d="M -246 -40 L 246 -40" stroke={KC.crimson} strokeWidth={9} opacity={fill} />
        {/* deck tank hatches + pipe run: pop in one by one with overshoot */}
        <line x1={-190} y1={-52} x2={170} y2={-52} stroke={INK} strokeWidth={6} opacity={fill} />
        {hatches.map((x, i) => {
          const s = Math.min(1.15, overshoot(f, t0 + 18 + i * 4));
          return <g key={i} transform={`translate(${x} -44) scale(${s})`}><rect x={-22} y={-18} width={44} height={18} fill={KC.cream3} stroke={INK} strokeWidth={4} /><circle cx={0} cy={-9} r={4} fill={INK} /></g>;
        })}
        {/* bridge + funnel at the stern (right) */}
        <g transform={`translate(0 ${(1 - pop) * -30})`} opacity={Math.min(1, pop)}>
          <rect x={150} y={-104} width={70} height={64} fill={KC.cream} stroke={INK} strokeWidth={W} />
          {[0, 1, 2].map((k) => <rect key={k} x={158 + k * 20} y={-92} width={12} height={12} fill={INK} />)}
          <rect x={186} y={-132} width={34} height={28} fill={KC.cream3} stroke={INK} strokeWidth={W} />
          <rect x={120} y={-120} width={26} height={80} fill={KC.black3} stroke={INK} strokeWidth={W} />
          <rect x={120} y={-120} width={26} height={14} fill={KC.crimson} stroke={INK} strokeWidth={W} />
        </g>
        {/* smoke puffs from the funnel */}
        {[0, 1, 2].map((k) => {
          const u = (((f - t0) / 60 + k / 3) % 1 + 1) % 1;
          return <circle key={k} cx={133 - u * 70} cy={-128 - u * 70} r={10 + u * 18} fill={fg} opacity={0.35 * (1 - u) * Math.min(1, pop)} />;
        })}
        {it.label && (
          <g transform="translate(0 26)" opacity={prog(f, t0 + 26, 8)}>
            <rect x={-(it.label.length * 11 + 28)} y={-16} width={it.label.length * 22 + 56} height={32} fill={KC.cream} stroke={INK} strokeWidth={4} />
            <text y={7} textAnchor="middle" fontFamily={KF.head} fontWeight={700} fontSize={22} letterSpacing={3} fill={INK}>{it.label}</text>
          </g>
        )}
      </g>
      {/* water line, drawn on in front of the hull for depth */}
      <path d="M -300 6 Q -270 -4 -240 6 T -180 6 T -120 6 T -60 6 T 0 6 T 60 6 T 120 6 T 180 6 T 240 6 T 300 6" fill="none" stroke={fg} strokeWidth={4} strokeLinecap="round" opacity={0.7} {...drawOn(f, t0 + 4, 20)} />
    </g>
  );
};

export const tankerEvents: CustomProp['events'] = (t) => [
  {t, kind: 'whoosh', db: -22, v: 1},
  {t: t + 0.55, kind: 'tick', db: -19, f: 523.3},
  {t: t + 0.7, kind: 'tick', db: -19, f: 659.3},
  {t: t + 0.85, kind: 'tick', db: -19, f: 784},
  {t: t + 1.0, kind: 'ping', db: -17, f: 392},
];
