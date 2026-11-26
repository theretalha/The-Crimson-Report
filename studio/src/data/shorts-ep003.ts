import type {Scene} from '../types';
import TIMING from './ep003-timing.json';

// Crimson Shorts for EP 003: a NATIVE vertical format (1080x1920), not cut from the long video.
// Voice = the approved narration lines (re-used, nothing re-recorded). Every scene shows what is being said (director rules apply).
// Safe zone: nothing important in the top 200 px, the right 120 px or below y ~1500 (YouTube's buttons and captions sit there).
const T: {start: number; speechEnd: number; text: string}[] = TIMING as any;
const speech = (line: number) => T[line].speechEnd - T[line].start;
const GAP = 0.28;

type It = Record<string, any>;
type Def = {line?: number; a?: number; b?: number; title: string; sub?: string; mood?: 'context' | 'danger' | 'facts'; items: It[]; fixed?: number; caption?: string};
export type ShortSpec = {id: string; name: string; scenes: Scene[]; voice: {line: number; at: number}[]; total: number};

const build = (id: string, name: string, defs: Def[]): ShortSpec => {
  let t = 0; const scenes: Scene[] = []; const voice: {line: number; at: number}[] = [];
  defs.forEach((d, i) => {
    const mood = d.mood ?? 'context';
    if (d.line === undefined) {
      scenes.push({template: 'recipe', recipe: 'compose', items: d.items, mood, chapter: name, title: d.title, sub: d.sub, caption: d.caption ?? '', seconds: d.fixed ?? 3, speak: 0.01, line: -1, part: 0} as any);
      t += d.fixed ?? 3; return;
    }
    const a = d.a ?? 0, b = d.b ?? 1, words = T[d.line].text.split(' ');
    const w0 = Math.floor(a * words.length + 0.0001), w1 = Math.max(w0 + 1, Math.round(b * words.length));
    const sp = speech(d.line) * (b - a);
    const seconds = sp + (b >= 0.999 ? GAP : 0.05);
    if (a === 0) voice.push({line: d.line, at: t});
    scenes.push({template: 'recipe', recipe: 'compose', items: d.items, mood, chapter: name, title: d.title, sub: d.sub, caption: words.slice(w0, w1).join(' '), seconds, speak: sp, line: d.line, part: i} as any);
    t += seconds;
  });
  return {id, name, scenes, voice, total: t};
};

// ---- vertical building blocks (1080x1920 stage; hero zone y 480-1180, captions sit near y 1280-1400)
const X = 480;
const photo = (src: string, name: string, role: string, y: number, s: number, extra: It = {}) => ({p: 'card', kind: 'photo', src, name, role, x: X, y, s, ...extra});
const JENS = (y: number, s: number, extra: It = {}) => photo('photos/jensen-huang.jpg', 'JENSEN HUANG', 'NVIDIA CEO', y, s, extra);
const ALICE = (y: number, s: number, extra: It = {}) => photo('photos/alice-huang.jpg', 'ALICE HUANG', 'NAMED IN REPORTS', y, s, extra);
const TRUMP = (y: number, s: number, extra: It = {}) => photo('photos/donald-trump.jpg', 'DONALD TRUMP', 'PRESIDENT', y, s, extra);
const H100 = (y: number, s: number, extra: It = {}) => ({p: 'card', kind: 'photo', src: 'photos/h100-014.jpg', fit: 'meet', w: 380, h: 300, name: 'NVIDIA H100', role: 'AI CHIP', x: X, y, s, ...extra});
const CRATES = (y: number, s: number, extra: It = {}) => ({p: 'crates', n: 6, x: X, y, s, ...extra});
const CHAIR = (y: number, s: number, extra: It = {}) => ({p: 'chair', x: X, y, s, name: 'CEO · NVIDIA', at: 0, ...extra});
const TAG = (text: string, y: number, at: any = 0, extra: It = {}) => ({p: 'tag', text, x: X, y, at, ...extra});
const STAMP = (text: string, y: number, at: any, size = 110, extra: It = {}) => ({p: 'stamp', text, x: X + 40, y, r: -8, size, at, ...extra});
const BOARD = {p: 'board', x: X, y: 870, w: 940, h: 780};
const cork = (n: number, dim = false, at: any[] = [0, 0, 0, 0]) => [
  {id: 'c1', p: 'card', kind: 'person', name: 'COMMERCE OFFICIAL', role: 'US DEPT.', badge: 'US', tie: true, x: 290, y: 650, r: -3, s: 0.95, at: at[0], dim},
  {id: 'c2', p: 'card', kind: 'person', name: 'BUSINESSWOMAN', role: 'IDENTITY UNCONFIRMED', x: 680, y: 700, r: 2, s: 0.95, at: at[1], dim},
  {id: 'c3', p: 'card', kind: 'building', text: 'whitehouse', name: 'THE WHITE HOUSE', x: 290, y: 1070, r: -2, s: 0.95, at: at[2], dim},
  {id: 'c4', p: 'card', kind: 'photo', src: 'photos/jensen-huang.jpg', name: 'JENSEN HUANG', role: 'NVIDIA CEO', x: 680, y: 1110, r: 3, s: 0.95, at: at[3], dim},
].slice(0, n);
const CTA = (y = 800): It[] => [{p: 'icon', icon: 'megaphone', x: X, y, size: 360, at: 0}, TAG('FULL VIDEO ON THE CHANNEL', y + 330, 0.3), TAG('THE CRIMSON FORECAST', y + 410, 0.6, {color: '#0A0A0A'})];

// ---------------------------------------------------------------- S0: TEASER (publish before the long video)
export const S0 = build('s0-teaser', 'TEASER', [
  {line: 3, title: 'STILL SEALED.', mood: 'danger', items: [CRATES(1050, 1.25, {sealed: true, at: 0}), STAMP('SEALED', 700, 0.3, 120)]},
  {line: 5, title: 'NEVER MEANT TO STAY?', mood: 'danger', items: [{p: 'rack', x: X, y: 1180, slots: 5, missing: [2], s: 0.88, at: 0, label: 'ONE SLOT EMPTY'}, {p: 'route', x: 250, y: 560, x2: 730, y2: 560, a: 'MALAYSIA', b: '?', n: 4, s: 0.9, at: 'meant'}]},
  {line: 7, title: 'THE MAN.', items: [JENS(820, 1.7, {at: 0})]},
  {line: 8, title: 'TWO YEARS.', mood: 'danger', items: [CHAIR(1110, 1.7), JENS(690, 1.35, {away: 'lose', at: 0}), TAG('JOB LOST', 520, 'lose his job', {color: '#0A0A0A'})]},
  {line: 9, title: 'TEN DAYS LATER.', mood: 'danger', items: [{p: 'calendar', x: 300, y: 740, flips: 10, label: 'DAYS', sub: 'LATER', s: 1.45, at: 'ten days'}, CHAIR(1110, 1.35, {x: 700}), JENS(690, 1.0, {x: 700, at: 'get it back'})]},
  {line: 10, a: 0, b: 0.45, title: 'THE STORY.', items: [{p: 'letter', x: X, y: 830, header: 'CASE FILE · EP 003', lines: ['WHAT HAPPENED?', 'WHAT IS PROVEN?', 'NOBODY CAN SAY.'], hl: [2], w: 540, s: 1.2, at: 0}]},
  {line: 10, a: 0.45, b: 1, title: 'THE TRUTH?', items: [{p: 'letter', x: X, y: 830, header: 'CASE FILE · EP 003', lines: ['WHAT HAPPENED?', 'WHAT IS PROVEN?', 'NOBODY CAN SAY.'], hl: [2], w: 540, s: 1.2, at: 0}, STAMP('UNCONFIRMED', 1110, 0.4, 90)]},
  {title: 'FULL STORY TONIGHT.', mood: 'facts', fixed: 3.4, items: [{p: 'icon', icon: 'megaphone', x: X, y: 780, size: 360, at: 0}, TAG('EP 003 · 3 PM ET', 1090, 0.3), TAG('THE CRIMSON FORECAST', 1170, 0.6, {color: '#0A0A0A'})]},
]);

// ---------------------------------------------------------------- S1: THE SEALED BOXES
export const S1 = build('s1-boxes', 'THE BOXES', [
  {line: 2, a: 0, b: 0.5, title: 'THE BOXES.', items: [CRATES(1140, 1.25, {sealed: false, at: 0}), TAG('BRAND-NEW NVIDIA AI CHIPS', 430, 'Nvidia')]},
  {line: 2, a: 0.5, b: 1, title: 'MOST WANTED.', items: [H100(800, 1.7, {at: 0}), TAG('MOST WANTED CHIPS', 520, 0.4)]},
  {line: 3, title: 'STILL SEALED.', mood: 'danger', items: [CRATES(1140, 1.25, {sealed: true, at: 0}), STAMP('STILL SEALED', 760, 0.3, 100)]},
  {line: 4, a: 0, b: 0.55, title: 'NORMAL LOGIC.', mood: 'facts', items: [CRATES(1140, 1.3, {n: 3, sealed: true, at: 0}), TAG('1 · BUY', 440, 0), TAG('2 · OPEN', 540, 'open')]},
  {line: 4, a: 0.55, b: 1, title: 'PLUG IN. USE.', mood: 'facts', items: [{p: 'rack', x: X, y: 1160, slots: 5, s: 1.0, at: 0}, TAG('3 · PLUG IN. USE.', 440, 'plug')]},
  {line: 5, title: 'UNLESS…', mood: 'danger', items: [{p: 'rack', x: X, y: 1180, slots: 5, missing: [2], s: 0.88, at: 0, label: 'ONE SLOT EMPTY'}, {p: 'route', x: 250, y: 560, x2: 730, y2: 560, a: 'MALAYSIA', b: '?', n: 4, s: 0.9, at: 'meant'}]},
  {line: 6, a: 0, b: 0.34, title: 'THE INVESTIGATION.', items: [BOARD, ...cork(1, false, [0]), TAG('ACCORDING TO REPORTS', 420, 'According', {color: '#0A0A0A'})]},
  {line: 6, a: 0.34, b: 0.67, title: 'WHERE IT LED.', items: [BOARD, ...cork(3, false, [0, 0.2, 0.9]), {p: 'string', from: 'c1', to: 'c2', at: 0.3}, {p: 'string', from: 'c2', to: 'c3', at: 1.4}]},
  {line: 6, a: 0.67, b: 1, title: 'THE MAN.', items: [BOARD, ...cork(4, false, [0, 0, 0, 0.3]), {p: 'string', from: 'c1', to: 'c2', at: 0}, {p: 'string', from: 'c2', to: 'c3', at: 0}, {p: 'string', from: 'c3', to: 'c4', at: 0.6}]},
  {title: 'FULL STORY ON THE CHANNEL.', mood: 'facts', fixed: 3.2, items: CTA(800)},
]);

// ---------------------------------------------------------------- S2: FIRED. REHIRED.
export const S2 = build('s2-fired', 'FIRED REHIRED', [
  {line: 58, a: 0, b: 0.5, title: 'NOV 12.', mood: 'danger', items: [CHAIR(1110, 1.7), JENS(690, 1.35, {away: 'resigned', at: 0}), TAG('RESIGNED', 520, 'resigned', {color: '#0A0A0A'})]},
  {line: 58, a: 0.5, b: 1, title: 'ALL OF IT.', mood: 'danger', items: [CHAIR(1110, 1.7), TAG('CEO', 600, 'CEO'), TAG('PRESIDENT', 700, 'President'), TAG('THE BOARD', 800, 'board')]},
  {line: 61, title: 'NOT COMING BACK.', mood: 'danger', items: [{p: 'table', kind: 'board', x: X, y: 720, n: 6, s: 1.25, at: 0}, {p: 'door', x: X + 20, y: 1230, s: 0.55, at: 'not coming'}, TAG('NOV 17 · NOT COMING BACK', 430, 0.2, {w: 560})]},
  {line: 62, a: 0, b: 0.55, title: 'THE VOTE.', mood: 'facts', items: [{p: 'table', kind: 'board', x: X, y: 640, n: 6, hands: 6, s: 1.25, at: 0}, {p: 'calendar', x: X, y: 1170, flips: 5, label: 'DAYS', sub: 'LATER', s: 0.75, at: 'Five days'}, TAG('UNANIMOUS', 430, 'unanimously')]},
  {line: 62, a: 0.55, b: 1, title: 'BACK.', mood: 'facts', items: [CHAIR(1170, 1.3), JENS(790, 1.2, {at: 0}), TAG('VOTE NOV 22 · ANNOUNCED NOV 23', 410, 0.4, {w: 700})]},
  {line: 65, title: 'FIRED. REHIRED.', mood: 'danger', items: [CHAIR(1170, 1.3), TAG('NOV 12 · OUT', 440, 'Fired'), TAG('NOV 22 · BACK', 540, 'Back', {color: '#0A0A0A'})]},
  {line: 66, title: 'TEN DAYS.', mood: 'danger', items: [{p: 'calendar', x: X, y: 820, flips: 10, label: 'DAYS', s: 2.0, at: 0}]},
  {title: 'FULL STORY ON THE CHANNEL.', mood: 'facts', fixed: 3.2, items: CTA(800)},
]);

// ---------------------------------------------------------------- S3: SPY OR WEAPON?
const UPDATE = {p: 'letter', x: X, y: 800, s: 1.0, w: 520, header: 'UPDATE SINCE RECORDING', lines: ['NYT/ABC/WSJ, Nov 22-23:', 'contact with a Chinese', 'intelligence officer reported.', 'Not proven she passed secrets.'], hl: [], at: 0};
export const S3 = build('s3-spy', 'SPY OR WEAPON', [
  {line: 67, title: 'THE MISSING PIECE.', items: [BOARD, ...cork(4, true, [0, 0, 0, 0]), ALICE(860, 1.5, {at: 'missing', r: -2})]},
  {line: 68, title: 'IS SHE A SPY?', items: [ALICE(840, 1.7, {at: 0, r: -2}), STAMP('SPY?', 560, 'spy', 110)]},
  {line: 69, title: 'UNPROVEN.', mood: 'facts', items: [ALICE(840, 1.7, {at: 0, r: -2}), STAMP('UNPROVEN', 560, 'proven', 100)]},
  {line: 77, title: 'THE MEMO.', mood: 'danger', items: [{p: 'letter', x: X, y: 830, header: "RUBIO'S MEMO", lines: ['SUBJECT: ALICE HUANG', 'LABEL: CHINESE SPY'], hl: [1], w: 540, s: 1.0, at: 0}, TAG('ACCORDING TO REPORTS', 520, 'According', {color: '#0A0A0A'})]},
  {line: 78, a: 0, b: 0.2, title: 'THE TWIST.', mood: 'danger', items: [{p: 'letter', x: X, y: 640, header: 'CIA REPORT', lines: ['ASSESSMENT ON', 'ALICE HUANG:', 'NO SPY FINDING'], hl: [], w: 520, s: 1.0, at: 0}, {p: 'letter', x: X, y: 1010, header: "RUBIO'S MEMO", lines: ['SUBJECT:', 'ALICE HUANG', 'LABEL: SPY'], hl: [2], w: 520, s: 1.0, at: 0.4}]},
  {line: 78, a: 0.2, b: 1, title: "RUBIO'S OWN CALL.", mood: 'danger', items: [{p: 'letter', x: X, y: 640, header: 'CIA REPORT', lines: ['ASSESSMENT ON', 'ALICE HUANG:', 'NO SPY FINDING'], hl: [], w: 520, s: 1.0, at: 0}, {p: 'letter', x: X, y: 1010, header: "RUBIO'S MEMO", lines: ['SUBJECT:', 'ALICE HUANG', 'LABEL: SPY'], hl: [2], w: 520, s: 1.0, at: 0}, STAMP("RUBIO'S OWN CALL", 1215, 'own', 70)]},
  {line: 79, title: 'REAL SPY CASE?', items: [{p: 'scales', x: X, y: 820, left: 'SPY CASE', right: 'POLITICAL WEAPON', tilt: 0, s: 0.85, at: 0}]},
  {line: 80, title: 'OR A WEAPON?', mood: 'danger', items: [{p: 'scales', x: X, y: 820, left: 'SPY CASE', right: 'POLITICAL WEAPON', tilt: 0, s: 0.85, at: 0}, TAG('YOU DECIDE', 480, 'weapon')]},
  {title: 'UPDATE.', mood: 'facts', fixed: 4.2, items: [UPDATE]},
  {title: 'FULL STORY ON THE CHANNEL.', mood: 'facts', fixed: 3.2, items: CTA(800)},
]);

// ---------------------------------------------------------------- S4: THE CHIP BAN
export const S4 = build('s4-ban', 'THE CHIP BAN', [
  {line: 16, a: 0, b: 0.5, title: 'OCT 2022.', items: [{p: 'card', kind: 'text', text: 'US', name: 'US GOVERNMENT', x: X, y: 700, s: 0.9, r: -2, at: 0}, H100(1080, 0.9, {at: 'Nvidia'}), STAMP('BANNED', 890, 'banned', 100)]},
  {line: 16, a: 0.5, b: 1, title: 'TO CHINA.', mood: 'danger', items: [{p: 'route', x: 170, y: 800, x2: 810, y2: 800, a: 'NVIDIA', b: 'CHINA', blocked: true, n: 5, s: 1.0, at: 0}, STAMP('BANNED', 560, 0.5, 110)]},
  {line: 17, a: 0, b: 0.25, title: 'WASHINGTON.', items: [{p: 'card', kind: 'building', text: 'whitehouse', name: "WASHINGTON'S FEAR", x: X, y: 820, s: 1.7, at: 0}]},
  {line: 17, a: 0.25, b: 1, title: 'THE FEAR.', mood: 'danger', items: [{p: 'icon', icon: 'radar', x: 280, y: 820, size: 340, at: 'military'}, {p: 'icon', icon: 'camera', x: 700, y: 820, size: 340, at: 'surveillance'}, TAG('MILITARY + SURVEILLANCE POWER', 520, 'military', {w: 640})]},
  {line: 18, a: 0, b: 0.25, title: 'BEIJING.', items: [{p: 'card', kind: 'text', text: 'CN', name: "BEIJING'S VIEW", x: X, y: 820, s: 1.7, at: 0}]},
  {line: 18, a: 0.25, b: 1, title: 'A BAN TO HOLD US BACK?', mood: 'danger', items: [{p: 'route', x: 170, y: 820, x2: 810, y2: 820, a: 'NVIDIA', b: 'CHINA', blocked: true, n: 5, s: 1.0, at: 0}, TAG('"HOLD BACK ITS ECONOMY"', 540, 'hold', {w: 640})]},
  {line: 19, title: '“WHOEVER WINS AI, WINS.”', mood: 'facts', items: [TRUMP(930, 1.4, {at: 0}), TAG('DONALD TRUMP · PUBLIC REMARKS', 600, 0.4, {w: 640})]},
  {title: 'FULL STORY ON THE CHANNEL.', mood: 'facts', fixed: 3.2, items: CTA(800)},
]);

export const SHORTS_EP003 = [S0, S1, S2, S3, S4];
