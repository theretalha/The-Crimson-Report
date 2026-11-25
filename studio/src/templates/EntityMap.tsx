import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {FONT_HEAD, FONT_MONO} from '../theme';
import type {Scene} from '../types';
import {NodeCard} from '../pro/NodeCard';
import {pal} from '../pro/palette';
import {fr, wordAt} from './timing';

// The connected hierarchy: people -> companies -> products -> money. One fixed layout for the whole story,
// so the same entity is always in the same place; each scene reveals (or dims) the part being narrated.
const CX = [255, 705, 1155, 1605];
const RY = [420, 730];
const W = 340, H = 180;
export const NODES: Record<string, {title: string; sub?: string; photo?: string; icon?: string; col: number; row: number}> = {
  kang: {title: 'KANG WEI', sub: 'Reported husband', icon: 'user', col: 0, row: 0},
  alice: {title: 'ALICE HUANG', sub: 'Named in reports', photo: 'photos/alice-huang.jpg', col: 1, row: 0},
  jensen: {title: 'JENSEN HUANG', sub: 'CEO, Nvidia', photo: 'photos/jensen-huang.jpg', col: 2, row: 0},
  sister: {title: 'SISTER COMPANY', sub: 'Malaysia', icon: 'server', col: 3, row: 0},
  shell: {title: 'SHELL COMPANY', sub: 'New owner', icon: 'briefcase', col: 0, row: 1},
  megaspeed: {title: 'MEGASPEED', sub: 'Singapore data centres', icon: 'building-2', col: 1, row: 1},
  nvidia: {title: 'NVIDIA', sub: 'Cloud partner', icon: 'cpu', col: 2, row: 1},
  china: {title: 'CHINESE BUYERS', sub: 'Reported', photo: 'flags/flag-china.svg', col: 3, row: 1},
};
const pos = (id: string) => ({x: CX[NODES[id].col], y: RY[NODES[id].row]});
// where a line from card A toward B leaves A's border (with a small gap)
const edge = (a: {x: number; y: number}, b: {x: number; y: number}, gap = 10) => {
  const dx = b.x - a.x, dy = b.y - a.y;
  const t = Math.min(dx ? (W / 2 + gap) / Math.abs(dx) : 9e9, dy ? (H / 2 + gap) / Math.abs(dy) : 9e9);
  return {x: a.x + dx * t, y: a.y + dy * t};
};

type EScene = Extract<Scene, {template: 'entities'}> & {caption: string; speak?: number; seconds: number};
const times = (s: EScene) => ({
  nodes: s.nodes.map((n) => (n.dim ? 0 : n.at ? fr(wordAt(s, n.at)) : 0)),
  links: s.links.map((l) => fr(wordAt(s, l.at, 0))),
});
export const entityEvents = (s: EScene) => {
  const t = times(s);
  const ev: {t: number; kind: string; db?: number; f?: number}[] = [];
  s.nodes.forEach((n, i) => { if (!n.dim && t.nodes[i] > 0) ev.push({t: t.nodes[i] / 30 + 0.04, kind: 'paper', db: -17}); });
  s.links.forEach((l, i) => { if (!l.dim) ev.push({t: t.links[i] / 30, kind: 'marker', db: -22}, {t: t.links[i] / 30 + 0.45, kind: 'tick', db: -19, f: 880}); });
  if (s.badge) ev.push({t: wordAt(s, s.badge.at) + 0.5, kind: 'impact', db: -11});
  if (s.callout) ev.push({t: wordAt(s, s.callout.at, 0.2) + 0.03, kind: 'paper', db: -16});
  return ev;
};

export const EntityMapT: React.FC<{scene: EScene}> = ({scene}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const c = pal(scene.mood);
  const t = times(scene);
  const shown = new Set(scene.nodes.map((n) => n.id));
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        {scene.links.filter((l) => shown.has(l.from) && shown.has(l.to)).map((l, i) => {
          const A = pos(l.from), B = pos(l.to);
          const arc = l.arc ?? 0;
          let p0, p1, d: string, mid: {x: number; y: number}, tan: {x: number; y: number};
          if (arc) {
            p0 = {x: A.x, y: A.y - H / 2 - 10}; p1 = {x: B.x, y: B.y - H / 2 - 12};
            const cy = Math.min(p0.y, p1.y) - arc;
            d = `M${p0.x},${p0.y} Q${(p0.x + p1.x) / 2},${cy} ${p1.x},${p1.y}`;
            mid = {x: (p0.x + p1.x) / 2, y: (p0.y + 2 * cy + p1.y) / 4}; tan = {x: p1.x - (p0.x + p1.x) / 2, y: p1.y - cy};
          } else {
            p0 = edge(A, B); p1 = edge(B, A);
            d = `M${p0.x},${p0.y} L${p1.x},${p1.y}`; mid = {x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2}; tan = {x: p1.x - p0.x, y: p1.y - p0.y};
          }
          const prog = interpolate(f, [t.links[i], t.links[i] + 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1)});
          const ang = (Math.atan2(tan.y, tan.x) * 180) / Math.PI;
          const op = l.dim ? 0.35 : 1;
          return (
            <g key={i} opacity={op}>
              <path d={d} fill="none" stroke={c.line} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - prog} style={{filter: `drop-shadow(0 0 8px ${c.line}88)`}} />
              {prog > 0.95 && <polygon points="0,-11 22,0 0,11" fill={c.line} transform={`translate(${p1.x} ${p1.y}) rotate(${ang}) translate(-18 0)`} />}
            </g>
          );
        })}
      </svg>
      {scene.nodes.map((n, i) => (
        <NodeCard key={n.id} {...pos(n.id)} {...NODES[n.id]} delay={t.nodes[i]} dim={n.dim} focus={n.focus} mood={scene.mood} />
      ))}
      {scene.links.filter((l) => shown.has(l.from) && shown.has(l.to)).map((l, i) => {
        const A = pos(l.from), B = pos(l.to);
        const arc = l.arc ?? 0;
        const horiz = Math.abs(A.y - B.y) < 5;
        // labels on a horizontal link sit just outside the cards (row 1: below, row 2: above) so they never cover a card
        const mid = arc ? {x: (A.x + B.x) / 2, y: Math.min(A.y, B.y) - H / 2 - 12 - arc / 2 + 6}
          : horiz ? {x: (A.x + B.x) / 2, y: A.y + (A.y < 500 ? H / 2 + 34 : -H / 2 - 34)} : {x: (A.x + B.x) / 2, y: (A.y + B.y) / 2};
        const s = spring({frame: f - (t.links[i] + 9), fps, config: {damping: 11, mass: 0.7}});
        if (f < t.links[i] + 9) return null;
        return (
          <div key={'l' + i} style={{position: 'absolute', left: mid.x, top: mid.y, transform: `translate(-50%, -50%) scale(${interpolate(s, [0, 1], [0.6, 1])})`, opacity: Math.min(1, s * 2) * (l.dim ? 0.5 : 1),
            background: '#0E0E0E', color: '#F4F1EA', borderLeft: `6px solid #C8141E`, padding: '7px 16px 7px 12px', whiteSpace: 'nowrap',
            fontFamily: FONT_MONO, fontWeight: 700, fontSize: 21, letterSpacing: 1.5, boxShadow: '0 8px 22px rgba(0,0,0,0.4)'}}>{l.label}</div>
        );
      })}
      {scene.badge && <Badge scene={scene} />}
      {scene.callout && <Callout scene={scene} />}
    </AbsoluteFill>
  );
};

const Badge: React.FC<{scene: EScene}> = ({scene}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const b = scene.badge!;
  const c = pal(scene.mood);
  const start = fr(wordAt(scene, b.at)) ;
  const s = spring({frame: f - start, fps, config: {damping: 10, mass: 0.8}});
  const v = b.value * Easing.out(Easing.cubic)(Math.min(1, Math.max(0, (f - start) / 28)));
  if (f < start) return null;
  return (
    <div style={{position: 'absolute', left: 120, top: 400, transform: `scale(${interpolate(s, [0, 1], [1.7, 1])})`, transformOrigin: '0 50%', opacity: Math.min(1, s * 2.5)}}>
      <div style={{fontFamily: FONT_HEAD, fontSize: 230, lineHeight: 0.95, color: c.fg, textShadow: `0 0 50px ${c.hot}66, 6px 6px 0 ${c.hot}`}}>{b.prefix ?? ''}{v.toFixed(b.value % 1 ? 1 : 0)}{b.suffix ?? ''}</div>
      {b.sub && <div style={{fontFamily: FONT_MONO, fontWeight: 700, fontSize: 24, letterSpacing: 3, color: '#F4F1EA', background: '#0E0E0E', display: 'inline-block', padding: '6px 14px', marginTop: 8}}>{b.sub}</div>}
    </div>
  );
};

// A fact the narrator does not say, added on screen while the story continues (source always shown).
const Callout: React.FC<{scene: EScene}> = ({scene}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = scene.callout!;
  const c = pal(scene.mood);
  const start = fr(wordAt(scene, k.at, 0.2));
  const s = spring({frame: f - start, fps, config: {damping: 14, mass: 0.8}});
  if (f < start) return null;
  return (
    <div style={{position: 'absolute', left: 1605 - 190, top: k.top ?? 330, width: 380, background: '#0E0E0E', borderLeft: '8px solid #C8141E', padding: '18px 22px 18px 22px',
      opacity: Math.min(1, s * 2), transform: `translateX(${(1 - s) * 60}px) rotate(${1.2 * s}deg)`, boxShadow: '0 18px 40px rgba(0,0,0,0.45)'}}>
      <div style={{fontFamily: FONT_MONO, fontWeight: 700, fontSize: 18, letterSpacing: 3, color: '#E5232B'}}>{k.kicker}</div>
      <div style={{fontFamily: FONT_HEAD, fontSize: 36, lineHeight: 1.08, color: '#F4F1EA', marginTop: 8}}>{k.text}</div>
      {k.source && <div style={{fontFamily: FONT_MONO, fontSize: 16, color: '#8F8A84', marginTop: 10}}>{k.source}</div>}
    </div>
  );
};
