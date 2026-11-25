import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT_BODY, FONT_HEAD, FONT_MONO} from '../theme';
import type {Scene} from '../types';
import nvda from '../data/nvda.json';

// Real NVDA daily closes. The line draws left to right; the live counter shows the drop from the running peak;
// event pins pop when the line reaches them; an optional "slam" lands when the line reaches a date.
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const md = (d: string) => `${MONTHS[+d.slice(5, 7) - 1]} ${+d.slice(8, 10)}`;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export const ChartT: React.FC<{scene: Extract<Scene, {template: 'chart'}>}> = ({scene}) => {
  const f = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const rows = (nvda.closes as [string, number][]).filter(([d]) => d >= scene.from && d <= scene.to);
  const n = rows.length;
  const vals = rows.map((r) => r[1]);
  const X0 = 170, X1 = 1770, Y0 = 390, Y1 = 800;
  const lo = Math.min(...vals), hi = Math.max(...vals), pad = (hi - lo) * 0.12;
  const yMin = lo - pad, yMax = hi + pad;
  const xs = (i: number) => X0 + (i / (n - 1)) * (X1 - X0);
  const ys = (v: number) => Y1 - ((v - yMin) / (yMax - yMin)) * (Y1 - Y0);

  const drawF = Math.min(durationInFrames * 0.66, 3.0 * fps);
  const t = Easing.inOut(Easing.quad)(clamp01((f - 5) / drawF));
  const head = t * (n - 1);
  const i0 = Math.floor(head), i1 = Math.min(n - 1, i0 + 1), fr = head - i0;
  const hv = vals[i0] + (vals[i1] - vals[i0]) * fr;
  const hx = xs(head), hy = ys(hv);
  const path = vals.map((v, i) => `${i ? 'L' : 'M'}${xs(i).toFixed(1)},${ys(v).toFixed(1)}`).join(' ');
  const area = `${path} L${xs(n - 1)},${Y1} L${xs(0)},${Y1} Z`;

  // palette follows the scene mood (set by the Frame background)
  const dark = scene.mood !== 'facts';
  const line = scene.mood === 'danger' ? C.paper : scene.mood === 'context' ? '#FF3B3B' : C.ink;
  const text = dark ? C.paper : C.ink;
  const grid = dark ? 'rgba(242,238,230,0.12)' : 'rgba(14,14,14,0.12)';
  const areaTop = scene.mood === 'danger' ? 'rgba(10,10,10,0.55)' : 'rgba(200,20,30,0.5)';

  // running peak and live drop
  let peak = vals[0];
  for (let i = 0; i <= i0; i++) peak = Math.max(peak, vals[i]);
  peak = Math.max(peak, hv);
  const drop = (hv / peak - 1) * 100;

  // y gridlines
  const step = hi - lo > 90 ? 50 : 25;
  const ticks: number[] = [];
  for (let v = Math.ceil(yMin / step) * step; v <= yMax; v += step) ticks.push(v);
  // x ticks (about 6)
  const xt = Array.from({length: 6}, (_, k) => Math.round((k / 5) * (n - 1)));

  // pins
  const pins = scene.pins.map((p, k) => {
    const idx = rows.findIndex(([d]) => d >= p.date);
    if (idx < 0) return null;
    const px = xs(idx), py = ys(vals[idx]);
    return {...p, idx, px, py, k, passed: head >= idx - 0.01};
  }).filter(Boolean) as {date: string; label: string; idx: number; px: number; py: number; k: number; passed: boolean}[];

  // slam
  const slamIdx = scene.slam ? rows.findIndex(([d]) => d >= scene.slam!.date) : -1;
  const slamOn = slamIdx >= 0 && head >= slamIdx - 0.01;
  // frame at which the head reaches slamIdx (invert the ease numerically)
  let slamF = 0;
  if (slamIdx >= 0) {
    const target = slamIdx / (n - 1);
    let a = 0, b = 1;
    for (let k = 0; k < 24; k++) { const mid = (a + b) / 2; if (Easing.inOut(Easing.quad)(mid) < target) a = mid; else b = mid; }
    slamF = 5 + a * drawF;
  }
  const sf = f - slamF;
  const sp = spring({frame: sf, fps, config: {damping: 9, mass: 0.7}});
  const shake = slamOn ? Math.exp(-Math.max(0, sf) / 5) * 12 : 0;
  const flash = slamOn ? interpolate(sf, [0, 7], [0.65, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;

  const countCol = drop < -0.5 ? '#FF4D4D' : text;
  return (
    <AbsoluteFill style={{transform: `translate(${Math.sin(f * 8.3) * shake}px, ${Math.cos(f * 6.7) * shake}px)`}}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="ar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={areaTop} />
            <stop offset="1" stopColor="rgba(200,20,30,0)" />
          </linearGradient>
          <filter id="gl" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="7" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <clipPath id="rv"><rect x={X0 - 4} y={Y0 - 80} width={Math.max(0, hx - X0 + 4)} height={Y1 - Y0 + 120} /></clipPath>
        </defs>
        {/* grid + axes */}
        {ticks.map((v) => (
          <g key={v}>
            <line x1={X0} x2={X1} y1={ys(v)} y2={ys(v)} stroke={grid} strokeWidth={2} />
            <text x={X0 - 18} y={ys(v) + 8} textAnchor="end" fontFamily={FONT_MONO} fontWeight={700} fontSize={22} fill={dark ? 'rgba(242,238,230,0.6)' : 'rgba(14,14,14,0.6)'}>${v}</text>
          </g>
        ))}
        <line x1={X0} x2={X1} y1={Y1} y2={Y1} stroke={text} strokeOpacity={0.5} strokeWidth={3} />
        {xt.map((i) => (
          <text key={i} x={xs(i)} y={Y1 + 38} textAnchor="middle" fontFamily={FONT_MONO} fontWeight={700} fontSize={21} fill={dark ? 'rgba(242,238,230,0.6)' : 'rgba(14,14,14,0.6)'}>{md(rows[i][0])}</text>
        ))}
        <text x={X0} y={Y0 - 26} fontFamily={FONT_MONO} fontWeight={700} fontSize={22} fill={C.crimson} opacity={dark && scene.mood === 'danger' ? 0 : 1}>NVDA · DAILY CLOSE</text>

        {/* area + line, revealed left to right */}
        <g clipPath="url(#rv)">
          <path d={area} fill="url(#ar)" />
          <path d={path} fill="none" stroke={line} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" filter="url(#gl)" />
        </g>

        {/* pins: labels sit in a lane above the chart, a dashed line drops to the price point */}
        {pins.map((p) => {
          if (!p.passed) return null;
          const ly = Y0 - 100 + (p.k % 2) * 48;
          const w = p.label.length * 13.6 + 38;
          const lx = Math.min(p.px, X1 + 20 - w);
          return (
            <g key={p.k}>
              <line x1={p.px} x2={p.px} y1={ly + 40} y2={p.py} stroke={C.paper} strokeOpacity={0.7} strokeWidth={2.5} strokeDasharray="7 7" />
              <circle cx={p.px} cy={p.py} r={9} fill={C.crimson} stroke={C.paper} strokeWidth={3.5} />
              <rect x={lx} y={ly} width={w} height={40} fill={C.ink} />
              <rect x={lx} y={ly} width={6} height={40} fill={C.crimson} />
              <text x={lx + 20} y={ly + 28} fontFamily={FONT_MONO} fontWeight={700} fontSize={22} fill={C.paper}>{p.label}</text>
            </g>
          );
        })}

        {/* live head marker + price tag */}
        {head > 0.02 && (
          <g>
            <circle cx={hx} cy={hy} r={20 + 8 * Math.sin(f / 4)} fill="none" stroke={line} strokeWidth={3} opacity={0.5} />
            <circle cx={hx} cy={hy} r={11} fill={line} filter="url(#gl)" />
            <g transform={`translate(${Math.min(hx + 22, X1 - 150)} ${Math.max(Y0 - 10, hy - 56)})`}>
              <rect width={150} height={42} fill={line} />
              <text x={75} y={30} textAnchor="middle" fontFamily={FONT_MONO} fontWeight={700} fontSize={26} fill={scene.mood === 'facts' ? C.paper : C.ink}>${hv.toFixed(2)}</text>
            </g>
          </g>
        )}
      </svg>

      {/* live drop counter */}
      {scene.counter && (
        <div style={{position: 'absolute', left: X0 + 40, top: Y1 - 250, fontFamily: FONT_HEAD, lineHeight: 1}}>
          <div style={{fontSize: 140, color: countCol, textShadow: dark ? '0 0 40px rgba(255,60,60,0.55)' : 'none'}}>{drop < -0.05 ? '−' : ''}{Math.abs(drop).toFixed(1)}%</div>
          <div style={{fontFamily: FONT_MONO, fontWeight: 700, fontSize: 22, letterSpacing: 3, color: dark ? 'rgba(242,238,230,0.7)' : 'rgba(14,14,14,0.7)', marginTop: 4}}>FROM THE PEAK</div>
        </div>
      )}

      {/* record slam */}
      {scene.slam && slamOn && (
        <div style={{position: 'absolute', right: 150, top: Y0 + 4, textAlign: 'right', transform: `scale(${interpolate(sp, [0, 1], [2.4, 1])}) rotate(${interpolate(sp, [0, 1], [-5, -2])}deg)`, transformOrigin: '100% 0', opacity: Math.min(1, sp * 2.5), display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
          <div style={{fontFamily: FONT_HEAD, fontSize: 175, lineHeight: 0.95, color: C.paper, WebkitTextStroke: `3px ${C.ink}`, textShadow: '0 0 50px rgba(255,255,255,0.5), 6px 6px 0 #C8141E'}}>{scene.slam.big}</div>
          <div style={{fontFamily: FONT_HEAD, fontSize: 56, color: C.paper, background: C.crimson, padding: '2px 16px', marginTop: 6}}>{scene.slam.sub}</div>
          <div style={{fontFamily: FONT_MONO, fontWeight: 700, fontSize: 21, letterSpacing: 2, color: C.ink, background: C.paper, padding: '5px 12px', marginTop: 8}}>{scene.slam.tag}</div>
        </div>
      )}
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
