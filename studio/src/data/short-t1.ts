import type {Scene} from '../types';
import TIMING from './short-t1-timing.json';

// SHORT T1: the TEASER, written as its own 30 s script (hook -> build -> payoff), not cut from the long video.
// Timing comes from tools/align_short.py (pauses in the new TTS audio). Safe zone: nothing important in the top 200 px, right 120 px, below y ~1480.
const P: {start: number; speechEnd: number; next: number; text: string}[] = TIMING as any;
const X = 480;
type It = Record<string, any>;
const TAG = (text: string, y: number, at: any = 0, extra: It = {}) => ({p: 'tag', text, x: X, y, at, ...extra});
const STAMP = (text: string, y: number, at: any, size = 110, extra: It = {}) => ({p: 'stamp', text, x: X + 40, y, r: -8, size, at, ...extra});
const JENS = (y: number, s: number, extra: It = {}) => ({p: 'card', kind: 'photo', src: 'photos/jensen-huang.jpg', name: 'JENSEN HUANG', role: 'NVIDIA CEO', x: X, y, s, ...extra});
const CHAIR = (y: number, s: number, extra: It = {}) => ({p: 'chair', x: X, y, s, name: 'CEO · NVIDIA', at: 0, ...extra});

type Def = {ph: number; a?: number; b?: number; title: string; mood?: 'context' | 'danger' | 'facts'; items: It[]; fixed?: number};
const defs: Def[] = [
  {ph: 0, a: 0, b: 0.5, title: 'MALAYSIA.', items: [{p: 'building', kind: 'datacenter', x: X, y: 1060, s: 1.1, label: 'DATA CENTER', at: 0}, TAG('ACCORDING TO REPORTS', 450, 0.1, {color: '#0A0A0A'})]},
  {ph: 0, a: 0.5, b: 1, title: 'THE VISIT.', items: [{p: 'building', kind: 'datacenter', x: 650, y: 1060, s: 1.0, label: 'DATA CENTER', at: 0}, {p: 'person', name: 'US OFFICIAL', role: 'REPORTEDLY', badge: 'US', tie: true, x: 280, y: 1060, s: 1.2, at: 0, fromX: 260, dur: 40}]},
  {ph: 1, title: 'STILL SEALED.', mood: 'danger', items: [{p: 'crates', n: 6, x: X, y: 1140, s: 1.25, sealed: true, at: 0}, STAMP('STILL SEALED', 760, 'sealed', 74)]},
  {ph: 2, title: 'THE INVESTIGATION.', items: [{p: 'board', x: X, y: 850, w: 940, h: 760},
    {id: 'c1', p: 'card', kind: 'person', name: 'US OFFICIAL', role: 'COMMERCE DEPT.', badge: 'US', tie: true, x: 290, y: 760, r: -3, s: 1.0, at: 0},
    {id: 'c3', p: 'card', kind: 'building', text: 'whitehouse', name: 'THE WHITE HOUSE', x: 670, y: 1020, r: 2, s: 1.0, at: 'White'},
    {p: 'string', from: 'c1', to: 'c3', at: 'reached'}]},
  {ph: 3, title: 'LOST HIS JOB.', mood: 'danger', items: [CHAIR(1090, 1.7), JENS(690, 1.35, {away: 'lost', at: 0}), TAG('WITHIN TWO YEARS', 470, 0.1, {color: '#0A0A0A'})]},
  {ph: 4, title: 'TEN DAYS LATER.', mood: 'danger', items: [{p: 'calendar', x: 300, y: 740, flips: 10, label: 'DAYS', sub: 'LATER', s: 1.45, at: 'ten'}, CHAIR(1090, 1.35, {x: 700}), JENS(690, 1.0, {x: 700, at: 'back'})]},
  {ph: 5, a: 0, b: 0.5, title: 'SPY… OR WEAPON?', items: [{p: 'scales', x: X, y: 820, left: 'SPY CASE', right: 'POLITICAL WEAPON', tilt: 0, s: 0.85, at: 0}]},
  {ph: 5, a: 0.5, b: 1, title: 'NOBODY CAN SAY.', items: [{p: 'scales', x: X, y: 820, left: 'SPY CASE', right: 'POLITICAL WEAPON', tilt: 0, s: 0.85, at: 0}, STAMP('UNCONFIRMED', 520, 'sure', 90)]},
  {ph: 6, title: 'FULL STORY TONIGHT.', mood: 'facts', items: [{p: 'icon', icon: 'megaphone', x: X, y: 780, size: 360, at: 0}, TAG('EP 003 · 3 PM ET', 1090, 0.3), TAG('THE CRIMSON FORECAST', 1170, 0.6, {color: '#0A0A0A'})]},
];

const t0 = P[0].start;   // the timeline starts at the first spoken word
let t = 0; const scenes: Scene[] = [];
defs.forEach((d, i) => {
  const p = P[d.ph], a = d.a ?? 0, b = d.b ?? 1, words = p.text.split(' ');
  const w0 = Math.floor(a * words.length + 0.0001), w1 = Math.max(w0 + 1, Math.round(b * words.length));
  const sp = (p.speechEnd - p.start) * (b - a);
  const last = i === defs.length - 1;
  const seconds = b >= 0.999 ? (last ? sp + 0.9 : p.next - p.start - (p.speechEnd - p.start) * a * 0 - (a > 0 ? (p.speechEnd - p.start) * a : 0)) : sp;
  scenes.push({template: 'recipe', recipe: 'compose', items: d.items, mood: d.mood ?? 'context', chapter: 'TEASER', title: d.title, caption: words.slice(w0, w1).join(' '), seconds, speak: sp, line: d.ph, part: i} as any);
  t += seconds;
});
export const SHORT_T1 = {id: 'st1-teaser', name: 'TEASER', scenes, total: t, voiceFile: 'public/audio/short-t1.wav', voiceOffset: -t0};
