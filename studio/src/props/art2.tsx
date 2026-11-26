import React from 'react';
import {Easing, interpolate} from 'remotion';
import {C as KC, F as KF} from '../kit/theme';
import {PersonArt} from './art';

// Stage-2 props for the scene composer. Each takes the current frame `f` and its start frame `t0` and draws around its own origin.
const INK = KC.black;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const prog = (f: number, t0: number, d: number, e: (n: number) => number = Easing.out(Easing.cubic)) => interpolate(f, [t0, t0 + d], [0, 1], {...clamp, easing: e});
const GOLD = '#F2D03B';

const Coin: React.FC<{x: number; y: number; r?: number}> = ({x, y, r = 16}) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill={GOLD} stroke={INK} strokeWidth={3.5} />
    <text y={r * 0.36} textAnchor="middle" fontFamily={KF.head} fontWeight={700} fontSize={r * 1.15} fill={INK}>$</text>
  </g>
);

export const Money: React.FC<{f: number; t0: number; dx: number; dy: number; text?: string; n?: number; fg?: string}> = ({f, t0, dx, dy, text, n = 7, fg = INK}) => {
  const mx = dx / 2, my = dy / 2 - 90;
  const pos = (u: number) => ({x: (1 - u) * (1 - u) * 0 + 2 * (1 - u) * u * mx + u * u * dx, y: 2 * (1 - u) * u * my + u * u * dy});
  const on = prog(f, t0, 8);
  return (
    <g opacity={on}>
      <path d={`M 0 0 Q ${mx} ${my} ${dx} ${dy}`} fill="none" stroke={fg} strokeWidth={4} strokeDasharray="3 13" strokeLinecap="round" opacity={0.6} />
      {Array.from({length: n}).map((_, k) => {
        const u = (((f - t0) / 70 + k / n) % 1 + 1) % 1; const p = pos(u);
        return <Coin key={k} x={p.x} y={p.y} />;
      })}
      {text && (
        <g transform={`translate(${mx} ${my - 40})`}>
          <rect x={-Math.max(80, text.length * 15 + 30)} y={-30} width={Math.max(160, text.length * 30 + 60)} height={60} rx={30} fill={KC.crimson} stroke={INK} strokeWidth={4} />
          <text y={12} textAnchor="middle" fontFamily={KF.head} fontWeight={700} fontSize={36} letterSpacing={2} fill={KC.cream}>{text}</text>
        </g>
      )}
    </g>
  );
};

export const CoinStack: React.FC<{f: number; t0: number; n: number; label?: string; fg?: string}> = ({f, t0, n, label, fg = INK}) => (
  <g>
    <ellipse cx={0} cy={6} rx={70} ry={10} fill={INK} opacity={0.16} />
    {Array.from({length: n}).map((_, i) => {
      const a = prog(f, t0 + i * 4, 8);
      return <g key={i} opacity={a} transform={`translate(0 ${-i * 17 - (1 - a) * 30})`}><ellipse cx={0} cy={0} rx={58} ry={14} fill={GOLD} stroke={INK} strokeWidth={4} /></g>;
    })}
    {label && <text x={0} y={52} textAnchor="middle" fontFamily={KF.head} fontWeight={700} fontSize={34} letterSpacing={2} fill={fg}>{label}</text>}
  </g>
);

export const Route: React.FC<{f: number; t0: number; dx: number; dy: number; a: string; b: string; blocked?: boolean; n?: number; oneway?: boolean; fg?: string}> = ({f, t0, dx, dy, a, b, blocked, n = 5, oneway, fg = INK}) => {
  const mx = dx / 2, my = dy / 2 - 70;
  const P = (u: number) => ({x: 2 * (1 - u) * u * mx + u * u * dx, y: 2 * (1 - u) * u * my + u * u * dy});
  const d = prog(f, t0, 16);
  const node = (x: number, y: number, label: string) => (
    <g transform={`translate(${x} ${y})`}>
      <circle r={74} fill={KC.cream} stroke={INK} strokeWidth={5} />
      <text y={8} textAnchor="middle" fontFamily={KF.head} fontWeight={700} fontSize={Math.min(28, 126 / (label.length * 0.62))} letterSpacing={1} fill={INK}>{label}</text>
    </g>
  );
  const bl = P(0.52);
  return (
    <g>
      <path d={`M 0 0 Q ${mx} ${my} ${dx} ${dy}`} fill="none" stroke={fg} strokeWidth={5} strokeDasharray="4 14" strokeLinecap="round" pathLength={1} strokeDashoffset={1 - d} opacity={d > 0 ? 0.85 : 0} />
      {node(0, 0, a)}{node(dx, dy, b)}
      {Array.from({length: n}).map((_, k) => {
        const raw = (((f - t0 - 12) / 80 + k / n) % 1 + 1) % 1;
        const u0 = blocked ? Math.min(raw, 0.44 - k * 0.012) : raw; const p = P(0.14 + 0.72 * Math.max(0, u0) / (blocked ? 0.52 : 1) * (blocked ? 0.52 : 1));
        return <g key={k} transform={`translate(${p.x} ${p.y})`} opacity={f > t0 + 12 ? 1 : 0}><rect x={-15} y={-15} width={30} height={30} fill="#CDB48A" stroke={INK} strokeWidth={4} /><rect x={-15} y={-3} width={30} height={7} fill={KC.crimson} /></g>;
      })}
      {blocked && (
        <g transform={`translate(${bl.x} ${bl.y})`} opacity={prog(f, t0 + 20, 8)}>
          <rect x={-8} y={-70} width={16} height={140} fill={KC.crimson} stroke={INK} strokeWidth={4} />
        </g>
      )}
      {oneway && <polygon points={`${dx * 0.5 + 20},${dy * 0.5 - 70} ${dx * 0.5 + 56},${dy * 0.5 - 52} ${dx * 0.5 + 20},${dy * 0.5 - 34}`} fill={INK} opacity={0.0} />}
    </g>
  );
};

export const Letter: React.FC<{f: number; t0: number; lines: string[]; hl?: number[]; strike?: number[]; header?: string; w?: number}> = ({f, t0, lines, hl = [], strike = [], header, w = 560}) => {
  const rowH = 46, H = 86 + lines.length * rowH + 28;
  const slide = prog(f, t0, 14);
  return (
    <g transform={`translate(0 ${(1 - slide) * 60})`} opacity={slide}>
      <rect x={-w / 2 + 10} y={-H / 2 + 12} width={w} height={H} fill={INK} opacity={0.2} />
      <rect x={-w / 2} y={-H / 2} width={w} height={H} fill={KC.cream} stroke={INK} strokeWidth={5} />
      <rect x={-w / 2} y={-H / 2} width={w} height={56} fill={INK} />
      <text x={-w / 2 + 22} y={-H / 2 + 37} fontFamily={KF.mono} fontWeight={700} fontSize={22} letterSpacing={3} fill={KC.cream}>{header ?? 'LETTER'}</text>
      {lines.map((ln, i) => {
        const a = prog(f, t0 + 10 + i * 9, 8);
        const y = -H / 2 + 56 + 44 + i * rowH;
        const fs = Math.min(26, (w - 60) / (ln.length * 0.6));
        return (
          <g key={i} opacity={a}>
            {hl.includes(i) && <rect x={-w / 2 + 18} y={y - 30} width={w - 36} height={40} fill={GOLD} opacity={0.9} />}
            <text x={-w / 2 + 28} y={y} fontFamily={KF.type} fontSize={fs} fill={INK}>{ln}</text>
            {strike.includes(i) && <line x1={-w / 2 + 24} y1={y - 9} x2={-w / 2 + 24 + (w - 48) * prog(f, t0 + 20 + i * 9, 10)} y2={y - 9} stroke={KC.crimson} strokeWidth={6} />}
          </g>
        );
      })}
    </g>
  );
};

export const Phone: React.FC<{f: number; t0: number; header?: string; src?: string}> = ({f, t0, header = 'NEWS ALERT', src}) => {
  const W = 330, H = 600, rowH = 150, scroll = ((f - t0) * 2.4) % rowH;
  const on = prog(f, t0, 12);
  return (
    <g transform={`translate(0 ${(1 - on) * 50})`} opacity={on}>
      <rect x={-W / 2 + 12} y={-H / 2 + 14} width={W} height={H} rx={44} fill={INK} opacity={0.22} />
      <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={44} fill={KC.black2} stroke={INK} strokeWidth={6} />
      <clipPath id="ph-clip"><rect x={-W / 2 + 14} y={-H / 2 + 58} width={W - 28} height={H - 88} rx={10} /></clipPath>
      <rect x={-W / 2 + 14} y={-H / 2 + 58} width={W - 28} height={H - 88} fill={KC.cream} />
      <g clipPath="url(#ph-clip)">
        <g transform={`translate(0 ${-scroll})`}>
          {Array.from({length: 6}).map((_, i) => (
            <g key={i} transform={`translate(${-W / 2 + 28} ${-H / 2 + 76 + i * rowH})`}>
              <rect width={W - 56} height={rowH - 20} fill={KC.cream2} stroke={INK} strokeWidth={3} />
              {i % 2 === 0 && src ? <image href={src} x={8} y={8} width={96} height={rowH - 36} preserveAspectRatio="xMidYMid slice" /> : <rect x={8} y={8} width={96} height={rowH - 36} fill={KC.black2} />}
              <rect x={116} y={14} width={140} height={12} fill={INK} /><rect x={116} y={38} width={110} height={10} fill={KC.cream3} /><rect x={116} y={58} width={130} height={10} fill={KC.cream3} />
              <circle cx={130} cy={rowH - 38} r={8} fill={KC.crimson} />
            </g>
          ))}
        </g>
      </g>
      <rect x={-W / 2 + 14} y={-H / 2 + 14} width={W - 28} height={40} rx={8} fill={KC.crimson} />
      <text x={0} y={-H / 2 + 42} textAnchor="middle" fontFamily={KF.head} fontWeight={700} fontSize={24} letterSpacing={4} fill={KC.cream}>{header}</text>
    </g>
  );
};

export const Scales: React.FC<{f: number; t0: number; left: string; right: string; tilt?: number; fg?: string}> = ({f, t0, left, right, tilt = 0, fg = INK}) => {
  const a = prog(f, t0 + 6, 22, Easing.out(Easing.back(1.6))) * tilt * 12;
  const arm = 240, pan = (side: number, label: string) => {
    const ang = (a * Math.PI) / 180, x = side * arm * Math.cos(ang), y = side * arm * Math.sin(ang) * -1;
    return (
      <g transform={`translate(${x} ${y})`}>
        <line x1={0} y1={0} x2={-70} y2={120} stroke={fg} strokeWidth={4} /><line x1={0} y1={0} x2={70} y2={120} stroke={fg} strokeWidth={4} />
        <path d="M -90 120 L 90 120 L 70 150 L -70 150 Z" fill={KC.cream} stroke={INK} strokeWidth={5} />
        <text x={0} y={206} textAnchor="middle" fontFamily={KF.head} fontWeight={700} fontSize={Math.min(32, 260 / (label.length * 0.58))} letterSpacing={2} fill={fg}>{label}</text>
      </g>
    );
  };
  const on = prog(f, t0, 10);
  return (
    <g opacity={on}>
      <rect x={-14} y={-150} width={28} height={300} fill={fg} /><rect x={-120} y={144} width={240} height={26} fill={fg} />
      <circle cx={0} cy={-150} r={16} fill={KC.crimson} stroke={INK} strokeWidth={4} />
      <g transform={`translate(0 -150)`}>
        <line x1={-arm * Math.cos((a * Math.PI) / 180)} y1={arm * Math.sin((a * Math.PI) / 180)} x2={arm * Math.cos((a * Math.PI) / 180)} y2={-arm * Math.sin((a * Math.PI) / 180)} stroke={fg} strokeWidth={10} strokeLinecap="round" />
        {pan(-1, left)}{pan(1, right)}
      </g>
    </g>
  );
};

export const Door: React.FC<{f: number; t0: number; label?: string}> = ({f, t0, label}) => {
  const close = prog(f, t0 + 14, 10, Easing.in(Easing.cubic));
  const crate = prog(f, t0, 16);
  const bounce = f > t0 + 26 ? Math.max(0, 1 - (f - t0 - 26) / 10) * 8 : 0;
  return (
    <g>
      <rect x={-150} y={-440} width={300} height={440} fill={KC.black2} stroke={INK} strokeWidth={8} />
      <g transform={`translate(-135 0) scale(${0.12 + 0.88 * close} 1)`}>
        <rect x={0} y={-425} width={270} height={425} fill={KC.crimson} stroke={INK} strokeWidth={6} />
        <rect x={20} y={-390} width={230} height={150} fill="none" stroke={INK} strokeWidth={4} /><rect x={20} y={-220} width={230} height={190} fill="none" stroke={INK} strokeWidth={4} />
        <circle cx={235} cy={-210} r={12} fill={KC.cream} stroke={INK} strokeWidth={4} />
      </g>
      <g transform={`translate(${-340 + crate * 120 - bounce} -26)`}>
        <rect x={-34} y={-34} width={68} height={68} fill="#CDB48A" stroke={INK} strokeWidth={5} /><rect x={-34} y={-6} width={68} height={12} fill={KC.crimson} />
      </g>
      {label && <g transform="translate(0 30)"><rect x={-130} y={0} width={260} height={46} fill={INK} /><text y={32} textAnchor="middle" fontFamily={KF.head} fontWeight={700} fontSize={26} letterSpacing={3} fill={KC.cream}>{label}</text></g>}
    </g>
  );
};

export const Table: React.FC<{f: number; t0: number; kind?: string; hands?: number; n?: number}> = ({f, t0, kind = 'board', hands = 0, n = 6}) => {
  const on = prog(f, t0, 10);
  if (kind === 'dinner')
    return (
      <g opacity={on}>
        <g transform="translate(-150 -10) scale(0.9)"><PersonArt tie /></g><g transform="translate(150 -10) scale(0.9)"><PersonArt fill={KC.black2} accent={KC.cream3} /></g>
        <rect x={-210} y={-10} width={420} height={36} fill={KC.crimsonDeep} stroke={INK} strokeWidth={5} />
        <rect x={-6} y={-70} width={12} height={62} fill={KC.cream} stroke={INK} strokeWidth={3} />
        <ellipse cx={0} cy={-86 + Math.sin((f - t0) / 3) * 2} rx={8} ry={14} fill={GOLD} stroke={INK} strokeWidth={2} />
      </g>
    );
  const per = Math.ceil(n / 2);
  return (
    <g opacity={on}>
      <rect x={-300} y={-8} width={600} height={46} rx={10} fill={KC.crimsonDeep} stroke={INK} strokeWidth={5} />
      {Array.from({length: n}).map((_, i) => {
        const top = i < per, k = top ? i : i - per, x = -240 + (480 * (k + 0.5)) / per - 0;
        const raised = i < hands && f > t0 + 12 + i * 8;
        return (
          <g key={i} transform={`translate(${x} ${top ? -20 : 150}) scale(${top ? 0.62 : 0.62})`}>
            <PersonArt fill={KC.black3} />
            {raised && <g><line x1={70} y1={-120} x2={96} y2={-190} stroke={KC.cream} strokeWidth={9} strokeLinecap="round" /><circle cx={98} cy={-196} r={12} fill={KC.cream} /></g>}
          </g>
        );
      })}
    </g>
  );
};

export const Crowd: React.FC<{f: number; t0: number; to: number; label?: string; fg?: string}> = ({f, t0, to, label, fg = INK}) => {
  const p = prog(f, t0, 40, Easing.out(Easing.quad));
  const val = Math.round(to * p), cols = 14, rows = 5;
  return (
    <g>
      <text y={-150} textAnchor="middle" fontFamily={KF.display} fontSize={170} fill={fg}>{val.toLocaleString('en-US')}</text>
      {label && <text y={-96} textAnchor="middle" fontFamily={KF.head} fontWeight={700} fontSize={32} letterSpacing={6} fill={fg === INK ? KC.crimsonDeep : KC.cream3}>{label}</text>}
      {Array.from({length: cols * rows}).map((_, i) => {
        const c = i % cols, r = Math.floor(i / cols), lit = i < p * cols * rows;
        return <g key={i} transform={`translate(${(c - (cols - 1) / 2) * 52} ${r * 62 - 40}) scale(0.16)`}><PersonArt fill={lit ? KC.crimson : KC.cream3} /></g>;
      })}
    </g>
  );
};

export const Rack: React.FC<{f: number; t0: number; slots?: number; missing?: number[]; label?: string}> = ({f, t0, slots = 7, missing = [], label}) => {
  const on = prog(f, t0, 10), H = 64, W = 440;
  return (
    <g opacity={on}>
      <rect x={-W / 2} y={-slots * (H + 8) - 20} width={W} height={slots * (H + 8) + 30} fill={KC.black3} stroke={INK} strokeWidth={6} />
      {Array.from({length: slots}).map((_, i) => {
        const miss = missing.indexOf(i), gone = miss >= 0 && f > t0 + 18 + miss * 10;
        return (
          <g key={i} transform={`translate(0 ${-(slots - i) * (H + 8)})`}>
            <rect x={-W / 2 + 12} y={0} width={W - 24} height={H} fill={KC.black} stroke={KC.ash} strokeWidth={2} />
            {gone ? <text x={0} y={H / 2 + 12} textAnchor="middle" fontFamily={KF.mono} fontWeight={700} fontSize={30} fill={KC.crimson}>?</text>
              : <g><rect x={-W / 2 + 28} y={12} width={190} height={H - 24} fill={KC.cream} /><rect x={-W / 2 + 40} y={22} width={50} height={H - 44} fill={KC.crimson} /><circle cx={W / 2 - 40} cy={H / 2} r={8} fill={KC.cream} /></g>}
          </g>
        );
      })}
      {label && <g transform="translate(0 26)"><rect x={-170} y={0} width={340} height={48} fill={KC.crimson} stroke={INK} strokeWidth={4} /><text y={34} textAnchor="middle" fontFamily={KF.head} fontWeight={700} fontSize={30} letterSpacing={3} fill={KC.cream}>{label}</text></g>}
    </g>
  );
};

export const Crates: React.FC<{f: number; t0: number; n?: number; sealed?: boolean}> = ({f, t0, n = 6, sealed = true}) => {
  const rows = [[-80, 0], [80, 0], [0, -150]];
  const pos = n >= 6 ? [[-160, 0], [0, 0], [160, 0], [-80, -150], [80, -150], [0, -300]] : rows;
  return (
    <g>
      <ellipse cx={0} cy={8} rx={280} ry={16} fill={INK} opacity={0.16} />
      {pos.slice(0, n).map(([x, y], i) => {
        const a = prog(f, t0 + i * 6, 10);
        return (
          <g key={i} opacity={a} transform={`translate(${x} ${y - (1 - a) * 60})`}>
            <rect x={-72} y={-140} width={144} height={140} fill="#CDB48A" stroke={INK} strokeWidth={6} />
            {sealed && <rect x={-72} y={-92} width={144} height={22} fill={KC.crimson} />}
            <rect x={-44} y={-50} width={88} height={36} fill={KC.cream} stroke={INK} strokeWidth={3} /><text y={-25} textAnchor="middle" fontFamily={KF.mono} fontWeight={700} fontSize={15} fill={INK}>AI CHIP</text>
          </g>
        );
      })}
    </g>
  );
};
