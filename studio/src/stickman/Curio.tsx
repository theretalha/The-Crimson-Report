import React from 'react';

// Curio: a code-drawn, rigged stickman that matches the Curious Lines character sheet (round bone-white head, dot eyes, no nose,
// mitten hands/feet, ~4 head-heights, amber scarf). Same skeleton in every scene = the character can never drift.
// Angles are in degrees; 0 = limb hangs straight down, + = swings forward (to the right when facing right).
export type Mouth = 'smile' | 'open' | 'o' | 'flat' | 'frown' | 'grin';
export type Eyes = 'dot' | 'wide' | 'closed' | 'squint' | 'tired';
export type Brows = 'none' | 'up' | 'worried' | 'angry' | 'sad';
export type Pose = {
  lean?: number; head?: number; bob?: number;
  lArm?: number; lElbow?: number; rArm?: number; rElbow?: number;
  lLeg?: number; lKnee?: number; rLeg?: number; rKnee?: number;
  mouth?: Mouth; eyes?: Eyes; brows?: Brows; wind?: number;
};
export type Look = {costume?: 'none' | 'tunic' | 'cloak'; hair?: 'none' | 'messy'; dirt?: boolean; tunic?: string; scale?: number; flip?: boolean};

export const INK = '#17130F', BONE = '#F3EEE0', AMBER = '#F2A81D', AMBER_D = '#C97F0B', OLIVE = '#6E7440', BROWN = '#4A3320', CLAY = '#A5532F';
const L = {torso: 128, arm1: 78, arm2: 74, leg1: 118, leg2: 116, head: 62};
const rad = (d: number) => (d * Math.PI) / 180;
const step = (o: [number, number], a: number, len: number): [number, number] => [o[0] + Math.sin(rad(a)) * len, o[1] + Math.cos(rad(a)) * len];

const Mouths: React.FC<{m: Mouth}> = ({m}) => {
  const s = {fill: 'none', stroke: INK, strokeWidth: 5, strokeLinecap: 'round' as const};
  if (m === 'open') return <ellipse cx={0} cy={26} rx={10} ry={13} fill={INK} />;
  if (m === 'o') return <circle cx={0} cy={26} r={8} fill={INK} />;
  if (m === 'flat') return <path d="M -13 26 L 13 26" {...s} />;
  if (m === 'frown') return <path d="M -15 33 Q 0 20 15 33" {...s} />;
  if (m === 'grin') return <path d="M -20 20 Q 0 44 20 20 Z" fill={INK} stroke={INK} strokeWidth={3} strokeLinejoin="round" />;
  return <path d="M -16 22 Q 0 36 16 22" {...s} />;
};
const EyesEl: React.FC<{e: Eyes}> = ({e}) => {
  const s = {fill: 'none', stroke: INK, strokeWidth: 4.5, strokeLinecap: 'round' as const};
  if (e === 'wide') return <>{[-21, 21].map((x) => <g key={x}><circle cx={x} cy={-2} r={13} fill="#fff" stroke={INK} strokeWidth={4} /><circle cx={x} cy={-2} r={5} fill={INK} /></g>)}</>;
  if (e === 'closed') return <>{[-21, 21].map((x) => <path key={x} d={`M ${x - 9} -2 Q ${x} 7 ${x + 9} -2`} {...s} />)}</>;
  if (e === 'squint') return <>{[-21, 21].map((x) => <path key={x} d={`M ${x - 9} 1 L ${x + 9} -3`} {...s} />)}</>;
  if (e === 'tired') return <>{[-21, 21].map((x) => <g key={x}><circle cx={x} cy={-1} r={6} fill={INK} /><path d={`M ${x - 10} 11 Q ${x} 16 ${x + 10} 11`} {...s} strokeWidth={3} opacity={0.7} /></g>)}</>;
  return <>{[-21, 21].map((x) => <circle key={x} cx={x} cy={-2} r={6.5} fill={INK} />)}</>;
};
const BrowsEl: React.FC<{b: Brows}> = ({b}) => {
  const s = {stroke: INK, strokeWidth: 4, strokeLinecap: 'round' as const};
  if (b === 'up') return <><path d="M -33 -24 Q -21 -32 -9 -24" fill="none" {...s} /><path d="M 9 -24 Q 21 -32 33 -24" fill="none" {...s} /></>;
  if (b === 'worried') return <><path d="M -33 -22 L -9 -30" {...s} /><path d="M 9 -30 L 33 -22" {...s} /></>;
  if (b === 'sad') return <><path d="M -33 -24 L -9 -30" {...s} /><path d="M 9 -30 L 33 -24" {...s} /></>;
  if (b === 'angry') return <><path d="M -33 -30 L -9 -20" {...s} /><path d="M 9 -20 L 33 -30" {...s} /></>;
  return null;
};

export const Curio: React.FC<{pose?: Pose; look?: Look; t?: number; x?: number; y?: number; id?: string}> = ({pose = {}, look = {}, t = 0, x = 0, y = 0, id = 'c'}) => {
  const p = {lean: 0, head: 0, bob: 0, lArm: 8, lElbow: 8, rArm: -8, rElbow: 8, lLeg: 4, lKnee: 0, rLeg: -4, rKnee: 0, mouth: 'smile' as Mouth, eyes: 'dot' as Eyes, brows: 'none' as Brows, wind: 0.25, ...pose};
  const k = {costume: 'none', hair: 'none', dirt: false, tunic: OLIVE, scale: 1, flip: false, ...look};
  const hip: [number, number] = [0, p.bob];
  const sh = step(hip, 180 - p.lean * -1, L.torso).map((v, i) => (i ? hip[1] - (hip[1] - v) : v)) as [number, number];
  // torso goes up: use lean from vertical
  const S: [number, number] = [hip[0] + Math.sin(rad(p.lean)) * L.torso, hip[1] - Math.cos(rad(p.lean)) * L.torso];
  const H: [number, number] = [S[0] + Math.sin(rad(p.lean + p.head)) * (L.head + 6), S[1] - Math.cos(rad(p.lean + p.head)) * (L.head + 6)];
  const limb = (o: [number, number], a1: number, b1: number, l1: number, l2: number) => {
    const m = step(o, a1, l1), e = step(m, a1 + b1, l2); return {m, e};
  };
  const lA = limb([S[0] - 4, S[1] + 4], p.lArm, p.lElbow, L.arm1, L.arm2), rA = limb([S[0] + 4, S[1] + 4], p.rArm, p.rElbow, L.arm1, L.arm2);
  const lL = limb([hip[0] - 5, hip[1]], p.lLeg, p.lKnee, L.leg1, L.leg2), rL = limb([hip[0] + 5, hip[1]], p.rLeg, p.rKnee, L.leg1, L.leg2);
  const line = (a: [number, number], m: [number, number], b: [number, number], w = 7) => <path d={`M ${a[0]} ${a[1]} L ${m[0]} ${m[1]} L ${b[0]} ${b[1]}`} fill="none" stroke={INK} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />;
  const mitten = (e: [number, number], a: number) => <ellipse cx={e[0]} cy={e[1] + 10} rx={11} ry={15} fill={BONE} stroke={INK} strokeWidth={5} transform={`rotate(${-a} ${e[0]} ${e[1]})`} />;
  const foot = (e: [number, number]) => <ellipse cx={e[0] + 12} cy={e[1] + 6} rx={24} ry={11} fill={BONE} stroke={INK} strokeWidth={5} />;
  // scarf tail
  const N = 11, tail: [number, number][] = Array.from({length: N}, (_, i) => [H[0] - 14 - i * 15 * (0.6 + p.wind), S[1] - 4 + i * 3 + Math.sin(t * 3 + i * 0.7) * (4 + i * 2.2) * (0.5 + p.wind * 2)]);
  const poly = [...tail.map((q, i) => [q[0], q[1] - (11 - i * 0.7)]), ...tail.slice().reverse().map((q, i) => [q[0], q[1] + (11 - (N - 1 - i) * 0.7)])].map((q) => q.join(',')).join(' ');
  const tunic = k.costume !== 'none';
  const hemL: [number, number] = [hip[0] - 34, hip[1] + 96], hemR: [number, number] = [hip[0] + 34, hip[1] + 96];
  return (
    <g transform={`translate(${x} ${y}) scale(${(k.flip ? -1 : 1) * k.scale} ${k.scale})`} filter={`url(#ink-${id})`}>
      <defs>
        <filter id={`ink-${id}`} x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed={Math.floor(t * 6) % 7} /><feDisplacementMap in="SourceGraphic" scale="5" /></filter>
      </defs>
      <ellipse cx={0} cy={L.leg1 + L.leg2 + 14} rx={70} ry={10} fill={INK} opacity={0.14} />
      {line(rL.m && [hip[0] + 5, hip[1]], rL.m, rL.e)}{foot(rL.e)}
      {line([hip[0] - 5, hip[1]], lL.m, lL.e)}{foot(lL.e)}
      {line(S, S, S, 0)}
      <path d={`M ${hip[0]} ${hip[1]} L ${S[0]} ${S[1]}`} stroke={INK} strokeWidth={8} strokeLinecap="round" />
      {tunic && <g>
        <polygon points={`${S[0] - 30},${S[1] + 4} ${S[0] + 30},${S[1] + 4} ${hemR[0]},${hemR[1]} ${hemL[0]},${hemL[1]}`} fill={k.tunic} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d={`M ${hip[0] - 26} ${hip[1] - 22} Q ${hip[0]} ${hip[1] - 14} ${hip[0] + 26} ${hip[1] - 22}`} fill="none" stroke={BROWN} strokeWidth={7} strokeLinecap="round" />
        <path d={`M ${hemL[0] + 4} ${hemL[1]} l 6 12 l 8 -10 l 8 12 l 8 -12 l 8 12 l 8 -10 l 8 10 l 8 -12`} fill="none" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      </g>}
      {line(S, lA.m, lA.e)}{mitten(lA.e, p.lArm + p.lElbow)}
      {line(S, rA.m, rA.e)}{mitten(rA.e, p.rArm + p.rElbow)}
      <polygon points={poly} fill={AMBER} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <g transform={`translate(${H[0]} ${H[1]}) rotate(${p.lean + p.head})`}>
        <circle r={L.head} fill={BONE} stroke={INK} strokeWidth={7} />
        {k.hair === 'messy' && <path d={`M -58 -22 L -50 -52 L -38 -34 L -28 -64 L -14 -44 L 0 -70 L 14 -44 L 28 -64 L 38 -34 L 52 -52 L 58 -22 Q 40 -50 0 -52 Q -40 -50 -58 -22 Z`} fill={BROWN} stroke={INK} strokeWidth={4} strokeLinejoin="round" />}
        {k.dirt && <ellipse cx={34} cy={14} rx={12} ry={8} fill="#B9AE98" opacity={0.7} />}
        <g transform="translate(0 4)"><BrowsEl b={p.brows} /><EyesEl e={p.eyes} /><Mouths m={p.mouth} /></g>
      </g>
      <ellipse cx={S[0]} cy={S[1] - 6} rx={34} ry={14} fill={AMBER} stroke={INK} strokeWidth={4} />
      <ellipse cx={S[0] + 6} cy={S[1] - 14} rx={26} ry={10} fill={AMBER} stroke={INK} strokeWidth={3} />
    </g>
  );
};

// ---- motion library (functions of time) ----
export const walkPose = (phase: number, speed = 1): Pose => {
  const s = Math.sin(phase * Math.PI * 2), c = Math.cos(phase * Math.PI * 2);
  return {lean: 6, bob: -Math.abs(c) * 7, lLeg: s * 34, lKnee: Math.max(0, -s) * 40, rLeg: -s * 34, rKnee: Math.max(0, s) * 40, lArm: -s * 26, lElbow: 14, rArm: s * 26, rElbow: 14, wind: 0.4 * speed};
};
export const talkPose = (t: number): Pose => ({mouth: Math.sin(t * 14) > 0.1 ? 'open' : 'smile', head: Math.sin(t * 3) * 3, rArm: -20 + Math.sin(t * 2.2) * 14, rElbow: -50 + Math.sin(t * 4) * 18});
