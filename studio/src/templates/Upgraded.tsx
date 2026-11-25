import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT_BODY, FONT_HEAD, FONT_MONO} from '../theme';
import type {Scene} from '../types';
import {ProIcon} from '../pro/ProIcon';
import {pickIcon, pickIcons} from '../pro/iconMap';
import {pal} from '../pro/palette';
import {fr, wordAt} from './timing';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const ease = (f: number, a: number, len: number) => interpolate(f, [a, a + len], [0, 1], {...clamp, easing: OUT});
type Ev = {t: number; kind: string; db?: number; f?: number};

// ====================================================================== TITLE: masked type + icon plate
export const TitlePlusT: React.FC<{scene: Extract<Scene, {template: 'title'}>}> = ({scene}) => {
  const f = useCurrentFrame();
  const c = pal(scene.mood);
  const text = scene.big;
  const len = text.length;
  const size = len <= 7 ? 210 : len <= 12 ? 162 : len <= 18 ? 126 : 100;
  const maxChars = Math.max(6, Math.floor(1010 / (size * 0.47)));
  const lines: string[] = [];
  let cur = '';
  text.split(' ').forEach((w) => { if ((cur + ' ' + w).trim().length > maxChars && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); });
  if (cur) lines.push(cur);
  const kicker = (scene.chapter.split('/')[1] ?? '').trim();
  const g = scene.glitch ? Math.max(0, 1 - f / 18) : 0;
  const jit = (n: number) => (scene.glitch ? Math.sin(f * 7.3 + n) * 14 * g : 0);
  const icon = pickIcon(text);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 110, top: 300, width: 1040, height: 500, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        <div style={{fontFamily: FONT_MONO, fontWeight: 700, fontSize: 22, letterSpacing: 5, color: c.hot, opacity: ease(f, 2, 12), marginBottom: 14}}>■ {kicker}</div>
        {lines.map((ln, i) => (
          <div key={i} style={{overflow: 'hidden', lineHeight: 0.98, paddingBottom: 6}}>
            <div style={{fontFamily: FONT_HEAD, fontSize: size, color: c.fg, transform: `translateY(${(1 - ease(f, 3 + i * 4, 16)) * 105}%)`, letterSpacing: 1,
              textShadow: scene.glitch ? `${jit(1)}px ${jit(2)}px 0 ${c.hot}, ${-jit(3)}px ${jit(4)}px 0 #2AD4FF55` : 'none'}}>{ln}</div>
          </div>
        ))}
        <div style={{height: 10, width: 380 * ease(f, 12, 16), background: c.hot, marginTop: 20, boxShadow: `0 0 22px ${c.hot}88`}} />
      </div>
      <div style={{position: 'absolute', left: 1280, top: 330, width: 420, height: 420}}>
        <ProIcon name={icon} size={420} delay={4} main={c.iconMain} accent={c.iconAccent} light={c.light} seed={len} />
      </div>
    </AbsoluteFill>
  );
};

// ====================================================================== ICON scene: main icon + supporting icons, linked
const OLD_TO_NEW: Record<string, string> = {
  pentagon: 'landmark', shelf: 'package', crash: 'trending-down', phoneChip: 'cpu', folder: 'file-lock', admiral: 'user', cia: 'eye', servers: 'server', boxes: 'package',
  idcard: 'fingerprint', whitehouse: 'landmark', capitol: 'landmark', chip: 'cpu', chartV: 'chart-line', radar: 'radar', magnifier: 'scan-search', photos: 'camera',
  petition: 'users', scales: 'scale', letter: 'file-text', doorShut: 'lock',
};
export const IconPlusT: React.FC<{scene: Extract<Scene, {template: 'icon'}>}> = ({scene}) => {
  const f = useCurrentFrame();
  const c = pal(scene.mood);
  const main = OLD_TO_NEW[scene.icon] ?? pickIcon(scene.title ?? scene.caption);
  const sats = pickIcons(scene.caption + ' ' + (scene.title ?? ''), 2, [main]);
  const spots = [{x: 900, y: 690, s: 160}, {x: 1000, y: 330, s: 140}];
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        {sats.map((_, i) => {
          const p = ease(f, 16 + i * 8, 14);
          return <line key={i} x1={spots[i].x + spots[i].s / 2} y1={spots[i].y + spots[i].s / 2} x2={1450} y2={560} stroke={c.line} strokeWidth={3} strokeDasharray="10 10" strokeOpacity={0.7 * p}
            style={{strokeDashoffset: -f * 0.6}} pathLength={1} />;
        })}
      </svg>
      <div style={{position: 'absolute', left: 1240, top: 340, width: 420, height: 440}}>
        <ProIcon name={main} size={420} delay={3} main={c.iconMain} accent={c.iconAccent} light={c.light} seed={scene.caption.length} />
      </div>
      {sats.map((n, i) => (
        <div key={n} style={{position: 'absolute', left: spots[i].x, top: spots[i].y}}>
          <ProIcon name={n} size={spots[i].s} delay={14 + i * 8} draw={18} main={c.iconMain} accent={c.iconAccent} light={c.light} seed={i + 3} />
        </div>
      ))}
    </AbsoluteFill>
  );
};

// ====================================================================== TIMELINE as cards on a ribbon (never clipped)
export const timelineEvents = (s: Extract<Scene, {template: 'timeline'}>): Ev[] =>
  s.points.map((_, i) => ({t: (8 + i * 16) / 30, kind: i === 0 ? 'paper' : 'tick', db: -17, f: [587.33, 698.46, 880][i % 3]}));
export const TimelineCardsT: React.FC<{scene: Extract<Scene, {template: 'timeline'}>}> = ({scene}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const c = pal(scene.mood);
  const n = scene.points.length;
  const gap = 90;
  const w = Math.min(640, Math.floor((1660 - (n - 1) * gap) / n));
  const total = n * w + (n - 1) * gap;
  const x0 = 960 - total / 2;
  const cy = 500, ribbonY = 770;
  const line = ease(f, 4, 26);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: x0, top: ribbonY - 3, width: total * line, height: 6, background: c.line, boxShadow: `0 0 18px ${c.line}88`}} />
      {scene.points.map((p, i) => {
        const x = x0 + i * (w + gap);
        const d = 8 + i * 16;
        const s = spring({frame: f - d, fps, config: {damping: 13, mass: 0.8}});
        if (f < d) return null;
        const icon = pickIcon(p.label + ' ' + (p.sub ?? ''), 'calendar');
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: x, top: cy - 130, width: w, height: 260, boxSizing: 'border-box', borderRadius: 14, background: c.glass, border: `2px solid ${c.border}`, padding: '20px 22px',
              display: 'flex', alignItems: 'center', gap: 20, overflow: 'hidden', boxShadow: '0 16px 34px rgba(0,0,0,0.32)', opacity: Math.min(1, s * 2), transform: `translateY(${(1 - s) * 40}px) scale(${interpolate(s, [0, 1], [0.9, 1])})`}}>
              <div style={{position: 'absolute', left: 0, top: 0, right: 0, height: 6, background: c.accent}} />
              <div style={{flex: '0 0 150px'}}><ProIcon name={icon} size={150} plate={false} delay={d + 3} draw={20} main={c.iconMain} accent={c.iconAccent} light={c.light} seed={i} /></div>
              <div style={{minWidth: 0}}>
                <div style={{fontFamily: FONT_HEAD, fontSize: p.label.length > 9 ? 66 : 84, lineHeight: 1, color: c.fg, overflowWrap: 'anywhere'}}>{p.label}</div>
                {p.sub && <div style={{fontFamily: FONT_BODY, fontWeight: 600, fontSize: 30, lineHeight: 1.15, color: c.muted, marginTop: 10}}>{p.sub}</div>}
              </div>
            </div>
            <div style={{position: 'absolute', left: x + w / 2 - 14, top: ribbonY - 14, width: 28, height: 28, borderRadius: '50%', background: c.accent, border: `5px solid ${c.fg}`, transform: `scale(${s})`}} />
            <div style={{position: 'absolute', left: x + w / 2 - 2, top: cy + 130, width: 4, height: ribbonY - cy - 130 - 14, background: c.line, opacity: 0.6 * s}} />
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

// ====================================================================== STAT: number with the picture it belongs to
type StatScene = Extract<Scene, {template: 'stat'}>;
const parseNum = (s: string) => {
  const m = s.match(/^([^0-9]*)([0-9]+(?:\.[0-9]+)?)(.*)$/);
  if (!m || /–/.test(s)) return null;
  return {prefix: m[1], value: parseFloat(m[2]), suffix: m[3], dec: m[2].includes('.') ? 1 : 0};
};
const VIZ: Record<string, {viz: 'bars' | 'servers' | 'dots' | 'ring' | 'plain'; stage?: number; chip: string}> = {
  '2023 ASSETS.': {viz: 'bars', stage: 1, chip: 'MEGASPEED · TOTAL ASSETS · 2023'},
  'ONE YEAR LATER.': {viz: 'bars', stage: 2, chip: 'MEGASPEED · TOTAL ASSETS · 2024'},
  'IN ONE YEAR.': {viz: 'bars', stage: 3, chip: 'GROWTH IN A SINGLE YEAR'},
  'AI EQUIPMENT.': {viz: 'servers', chip: 'SISTER COMPANY · MALAYSIA'},
  'CHIPS MISSING.': {viz: 'dots', chip: 'IMPORTED CHIPS NOT FOUND'},
  'THE CUT.': {viz: 'ring', chip: 'PAID TO THE US GOVERNMENT'},
};
export const statEvents = (s: StatScene): Ev[] => {
  const v = VIZ[s.title ?? '']?.viz ?? 'plain';
  const ev: Ev[] = [{t: 0.2, kind: 'tick', db: -18, f: 880}, {t: 0.36, kind: 'paper', db: -17}];
  if (v === 'bars' && VIZ[s.title ?? ''].stage === 3) ev.push({t: 0.95, kind: 'impact', db: -9}, {t: 1.0, kind: 'stamp', db: -12});
  else ev.push({t: 1.15, kind: 'impact', db: -13});
  return ev;
};
export const StatPlusT: React.FC<{scene: StatScene}> = ({scene}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const c = pal(scene.mood);
  const meta = VIZ[scene.title ?? ''] ?? {viz: 'plain' as const, chip: scene.sub ?? ''};
  const parts = scene.parts;
  const target = parts[parts.length - 1];
  const num = parseNum(target);
  const prev = parts.length > 1 ? parts[0] : null;
  const cnt = ease(f, 8, 34);
  const shown = num ? `${num.prefix}${(num.value * cnt).toFixed(num.dec)}${num.suffix}` : target;
  const pop = spring({frame: f - 4, fps, config: {damping: 11, mass: 0.8}});
  const numSize = shown.length > 6 ? 200 : 250;
  return (
    <AbsoluteFill>
      {/* the number, with a context chip and what it means */}
      <div style={{position: 'absolute', left: 110, top: 330, transform: `scale(${interpolate(pop, [0, 1], [0.85, 1])})`, transformOrigin: '0 50%', opacity: Math.min(1, pop * 2)}}>
        {prev && <div style={{fontFamily: FONT_HEAD, fontSize: 70, color: c.muted, marginBottom: -8}}>{prev} <span style={{color: c.hot}}>→</span></div>}
        <div style={{fontFamily: FONT_HEAD, fontSize: numSize, lineHeight: 0.95, color: c.hot, textShadow: scene.mood === 'danger' ? '6px 6px 0 #0E0E0E' : `0 0 40px ${c.hot}44`}}>{shown}</div>
        <div style={{display: 'inline-block', marginTop: 16, background: '#0E0E0E', color: '#F4F1EA', borderLeft: '7px solid #C8141E', padding: '8px 18px 8px 14px', fontFamily: FONT_MONO, fontWeight: 700, fontSize: 22, letterSpacing: 2.5}}>{meta.chip}</div>
      </div>
      {meta.viz === 'bars' && <Bars stage={meta.stage ?? 1} mood={scene.mood} />}
      {meta.viz === 'servers' && <Servers mood={scene.mood} />}
      {meta.viz === 'dots' && <Dots mood={scene.mood} />}
      {meta.viz === 'ring' && <Ring mood={scene.mood} />}
      {meta.viz === 'plain' && <div style={{position: 'absolute', left: 1280, top: 340, width: 420, height: 420}}><ProIcon name={pickIcon(scene.title ?? '', 'banknote')} size={400} delay={6} main={c.iconMain} accent={c.iconAccent} light={c.light} /></div>}
    </AbsoluteFill>
  );
};

type M = {mood: Scene['mood']};
const Bars: React.FC<M & {stage: number}> = ({mood, stage}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const c = pal(mood);
  const base = 800, H = 430;
  const a = Math.max(14, (H * 33) / 3000);
  const grow = stage >= 2 ? ease(f, 12, 30) : 0;
  const bA = ease(f, 10, 14);
  const slam = spring({frame: f - 30, fps, config: {damping: 9, mass: 0.7}});
  return (
    <div style={{position: 'absolute', left: 980, top: 300, width: 800, height: 560}}>
      {[0.25, 0.5, 0.75, 1].map((q) => <div key={q} style={{position: 'absolute', left: 60, right: 20, top: 500 - q * H, height: 2, background: c.border, opacity: 0.6}} />)}
      <div style={{position: 'absolute', left: 60, right: 20, top: 500, height: 4, background: c.fg, opacity: 0.55}} />
      <div style={{position: 'absolute', left: 150, top: 500 - a * bA, width: 170, height: a * bA, background: c.fg, opacity: 0.85}} />
      <div style={{position: 'absolute', left: 150, top: 500 - a * bA - 46, width: 170, textAlign: 'center', fontFamily: FONT_HEAD, fontSize: 40, color: c.fg, opacity: bA}}>$33M</div>
      <div style={{position: 'absolute', left: 150, top: 516, width: 170, textAlign: 'center', fontFamily: FONT_MONO, fontWeight: 700, fontSize: 22, color: c.muted}}>2023</div>
      {stage >= 2 && <>
        <div style={{position: 'absolute', left: 470, top: 500 - H * grow, width: 170, height: H * grow, background: `linear-gradient(180deg, ${c.accent}, ${c.accent}cc)`, boxShadow: `0 0 40px ${c.accent}77`}} />
        <div style={{position: 'absolute', left: 470, top: 500 - H * grow - 52, width: 170, textAlign: 'center', fontFamily: FONT_HEAD, fontSize: 46, color: c.hot, opacity: grow}}>$3B</div>
        <div style={{position: 'absolute', left: 470, top: 516, width: 170, textAlign: 'center', fontFamily: FONT_MONO, fontWeight: 700, fontSize: 22, color: c.muted}}>2024</div>
      </>}
      {stage >= 3 && (
        <div style={{position: 'absolute', left: 250, top: 110, transform: `scale(${interpolate(slam, [0, 1], [2.4, 1])}) rotate(-5deg)`, opacity: Math.min(1, slam * 2.5)}}>
          <div style={{fontFamily: FONT_HEAD, fontSize: 150, color: '#F4F1EA', background: '#C8141E', padding: '0 26px', boxShadow: '8px 8px 0 #0E0E0E'}}>×90</div>
        </div>
      )}
    </div>
  );
};

const Servers: React.FC<M> = ({mood}) => {
  const f = useCurrentFrame();
  const c = pal(mood);
  const fill = ease(f, 20, 28) * 0.9;
  return (
    <div style={{position: 'absolute', left: 1010, top: 330, width: 760}}>
      <div style={{display: 'flex', gap: 34, alignItems: 'flex-end'}}>
        {[0, 1, 2].map((i) => <ProIcon key={i} name="server" size={200} delay={10 + i * 6} draw={20} plate={false} main={c.iconMain} accent={c.iconAccent} light={c.light} seed={i} />)}
        <div style={{fontFamily: FONT_HEAD, fontSize: 70, color: c.muted, paddingBottom: 60}}>+</div>
        <ProIcon name="cpu" size={200} delay={30} draw={20} plate={false} main={c.iconMain} accent={c.iconAccent} light={c.light} seed={5} />
      </div>
      <div style={{marginTop: 50, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 22, letterSpacing: 3, color: c.muted}}>WHERE THE EQUIPMENT CAME FROM</div>
      <div style={{marginTop: 12, height: 54, background: c.border, position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${fill * 100}%`, background: c.accent, display: 'flex', alignItems: 'center', paddingLeft: 18, fontFamily: FONT_HEAD, fontSize: 34, color: '#F4F1EA'}}>NVIDIA · ALMOST ALL</div>
      </div>
    </div>
  );
};

const Dots: React.FC<M> = ({mood}) => {
  const f = useCurrentFrame();
  const c = pal(mood);
  const cols = 25, rows = 20, step = 24;
  return (
    <div style={{position: 'absolute', left: 1000, top: 330}}>
      <div style={{position: 'relative', width: cols * step, height: rows * step}}>
        {Array.from({length: cols * rows}, (_, i) => {
          const x = (i % cols) * step, y = Math.floor(i / cols) * step;
          const appear = ease(f, 8 + (i % cols + Math.floor(i / cols)) * 0.5, 8);
          const vanish = interpolate(f, [34 + random(i) * 34, 44 + random(i) * 34], [0, 1], clamp);
          return <div key={i} style={{position: 'absolute', left: x, top: y, width: 16, height: 16, borderRadius: 3, background: vanish > 0 ? c.accent : c.fg, opacity: appear * (1 - vanish) * 0.9,
            transform: `scale(${1 - vanish * 0.6}) translateY(${-vanish * 14}px)`, boxShadow: vanish > 0 ? `0 0 14px ${c.accent}` : 'none'}} />;
        })}
      </div>
      <div style={{position: 'absolute', left: 0, top: rows * step + 18, whiteSpace: 'nowrap', fontFamily: FONT_MONO, fontWeight: 700, fontSize: 20, letterSpacing: 2, color: c.fg, opacity: ease(f, 40, 12)}}>EACH SQUARE = ONE CHIP · NOT FOUND</div>
    </div>
  );
};

const Ring: React.FC<M> = ({mood}) => {
  const f = useCurrentFrame();
  const c = pal(mood);
  const R = 175, C0 = 2 * Math.PI * R;
  const a = ease(f, 10, 26) * 0.15, b = ease(f, 24, 26) * 0.1;
  return (
    <div style={{position: 'absolute', left: 1130, top: 330, width: 480, height: 480}}>
      <svg viewBox="0 0 480 480" width={480} height={480} style={{transform: 'rotate(-90deg)'}}>
        <circle cx={240} cy={240} r={R} fill="none" stroke={c.border} strokeWidth={46} />
        <circle cx={240} cy={240} r={R} fill="none" stroke={c.accent} strokeWidth={46} strokeDasharray={`${C0 * a} ${C0}`} style={{filter: `drop-shadow(0 0 14px ${c.accent}88)`}} />
        <circle cx={240} cy={240} r={R} fill="none" stroke={c.hot} strokeWidth={46} strokeDasharray={`${C0 * b} ${C0}`} strokeDashoffset={-C0 * 0.15} opacity={0.55} />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <ProIcon name="banknote" size={150} plate={false} delay={12} main={c.iconMain} accent={c.iconAccent} light={c.light} />
        <div style={{fontFamily: FONT_MONO, fontWeight: 700, fontSize: 20, letterSpacing: 3, color: c.muted, marginTop: 10}}>OF EACH SALE</div>
      </div>
    </div>
  );
};
