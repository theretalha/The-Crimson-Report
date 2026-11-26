import type {IconName, Pin, Scene} from '../types';
import type {Mood} from '../theme';
import TIMING from './ep003-timing.json';

// EP 003 — "The Nvidia Spy Scandal: What Really Happened"
// One entry per narration line (same order as narration-tts.txt).
// An array = the line is split into several visuals; `cap` is that part's words.
// Timing comes from tools/align.py (ep003-timing.json), so scenes follow the voice.

type Spec = Partial<Scene> & {template: Scene['template']; cap?: string; [k: string]: any};

const JENSEN = {image: 'photos/jensen-huang.jpg', name: 'JENSEN HUANG', role: 'CEO, NVIDIA', credit: 'Photo: Anderseidesvik · CC BY 4.0'};
const MUSK = {image: 'photos/elon-musk.jpg', name: 'ELON MUSK', role: 'CEO, TESLA · xAI', credit: 'Photo: US Air Force / T. Cokley · Public domain'};
const ALICE = {image: 'photos/alice-huang.jpg', name: 'ALICE HUANG', role: 'NAMED IN REPORTS', credit: 'Image: Reuters (via Instagram)'};
const RUBIO = {image: 'photos/marco-rubio.jpg', name: 'MARCO RUBIO', role: 'US SECRETARY OF STATE', credit: 'Image: US Department of State'};
const TRUMP = {image: 'photos/donald-trump.jpg', name: 'DONALD TRUMP', role: 'PRESIDENT OF THE UNITED STATES', credit: 'Official portrait · White House · Public domain'};

const T = (big: string, mood?: Mood, glitch = false): Spec => ({template: 'title', big, mood, glitch});
const I = (icon: IconName, title?: string, sub?: string, mood?: Mood): Spec => ({template: 'icon', icon, title, sub, mood});
const P = (photos: any[], title?: string, mood?: Mood): Spec => ({template: 'photos', photos, title, mood});
const ST = (parts: string[], title?: string, sub?: string, source?: string, mood?: Mood): Spec => ({template: 'stat', parts, title, sub, source, mood});
const SP = (left: string, sign: string, right: string, title?: string, mood?: Mood): Spec => ({template: 'split', left, sign, right, title, mood});
const CA = (cards: string[], title?: string, mood?: Mood): Spec => ({template: 'cards', cards, title, mood});
const TL = (points: {label: string; sub?: string}[], title?: string, mood?: Mood): Spec => ({template: 'timeline', points, title, mood});
const MP = (o: {center: [number, number]; zoom: number; pins?: Pin[]; highlight?: string[]; title?: string; sub?: string; mood?: Mood}): Spec => ({template: 'map', arrow: false, ...o});
const H = (id: string | undefined, outlet: string, date: string, headline: string, mark: string, url: string, mood?: Mood): Spec =>
  ({template: 'headline', image: id ? `clips/${id}.jpg` : undefined, outlet, date, headline, mark, url, mood, source: `${outlet} via YouTube`});
const src = (s: Spec, source: string): Spec => ({...s, source});
const EM = (o: any): Spec => ({template: 'entities', ...o});
const CHART = (o: {from: string; to: string; pins: {date: string; label: string}[]; counter?: boolean; slam?: {date: string; big: string; sub: string; tag: string}; title?: string; sub?: string; mood?: Mood}): Spec =>
  ({template: 'chart', source: 'NVDA closing prices: Yahoo Finance, checked vs Nasdaq.com · $952B record: Wikipedia, citing news reports', ...o});
const cap = (s: Spec, c: string): Spec => ({...s, cap: c});

const KL: Pin = {lon: 101.7, lat: 3.1, label: 'MALAYSIA'};


// Director shot-list scenes (compose recipe): items appear on the narrated word `at`. See DIRECTOR-BRAIN.md and shot-list.md.
const CP = (items: any[], title?: string, sub?: string, mood?: Mood, source?: string): Spec => ({template: 'recipe', recipe: 'compose', items, title, sub, mood, source});
const JP = (x: number, y: number, at?: string | number, extra: any = {}) => ({p: 'card', kind: 'photo', src: 'photos/jensen-huang.jpg', name: 'JENSEN HUANG', role: 'NVIDIA CEO', x, y, at, ...extra});
const AP = (x: number, y: number, at?: string | number, extra: any = {}) => ({p: 'card', kind: 'photo', src: 'photos/alice-huang.jpg', name: 'ALICE HUANG', role: 'NAMED IN REPORTS', x, y, at, ...extra});
const BOARD = {p: 'board', x: 960, y: 570, w: 1580, h: 520};
const CORK = (extra: any = {}) => [
  BOARD,
  {id: 'c1', p: 'card', kind: 'person', name: 'COMMERCE OFFICIAL', role: 'US DEPT.', badge: 'US', tie: true, x: 340, y: 580, r: -3, s: 1.12, ...extra.c1},
  {id: 'c2', p: 'card', kind: 'person', name: 'BUSINESSWOMAN', role: 'IDENTITY UNCONFIRMED', x: 730, y: 590, r: 2, s: 1.12, ...extra.c2},
  {id: 'c3', p: 'card', kind: 'building', text: 'whitehouse', name: 'THE WHITE HOUSE', x: 1120, y: 580, r: -2, s: 1.12, ...extra.c3},
  {id: 'c4', p: 'card', kind: 'photo', src: 'photos/jensen-huang.jpg', name: 'JENSEN HUANG', role: 'NVIDIA CEO', x: 1510, y: 590, r: 3, s: 1.12, ...extra.c4},
];

const NEW: Record<number, Spec | Spec[]> = {
  1: CP([{p: 'building', kind: 'datacenter', label: 'DATA CENTER', x: 1260, y: 750, s: 1.4}, {p: 'person', name: 'US COMMERCE OFFICIAL', role: 'REPORTEDLY', badge: 'US', tie: true, x: 520, y: 740, s: 1.4, at: 0, fromX: 520, dur: 60}, {p: 'tag', text: 'SOMETHING STRANGE', x: 900, y: 400, at: 'strange'}], 'THE VISIT.', 'Malaysia · according to reports', 'context'),
  6: CP([...CORK({c1: {at: 'investigation'}, c2: {at: 'businesswoman'}, c3: {at: 'White House'}, c4: {at: 0.6, hideUntil: 'man running', s: 1.3}}),
    {p: 'string', from: 'c1', to: 'c2', at: 'businesswoman'}, {p: 'string', from: 'c2', to: 'c3', at: 'White House'}, {p: 'string', from: 'c3', to: 'c4', at: 'man running'},
    {p: 'tag', text: 'ACCORDING TO REPORTS', x: 1380, y: 262, at: 'According'}], 'THE INVESTIGATION.', undefined, 'context'),
  7: CP([BOARD, JP(960, 580, undefined, {s: 1.5, r: -2})], 'THE MAN.', undefined, 'context'),
  8: CP([{p: 'chair', x: 960, y: 760, s: 1.4, name: 'CEO · NVIDIA', at: 0}, JP(960, 520, undefined, {away: 'lose'}), {p: 'tag', text: 'JOB LOST', x: 1380, y: 520, at: 'lose his job', color: '#0A0A0A'}], 'TWO YEARS.', undefined, 'danger'),
  26: CP([{p: 'person', name: 'DENNIS WILDER', role: 'FORMER CIA CHINA ANALYST', x: 520, y: 780, s: 1.4, tie: true, at: 'Wilder'}, {p: 'tag', text: '"A LEGEND"', x: 560, y: 440, at: 'legend', color: '#0A0A0A'}, {p: 'card', kind: 'person', name: 'FAKE IDENTITY?', role: 'BUILT TO LOOK REAL', x: 1350, y: 560, r: 3, s: 1.2, at: 'fake identity'}], 'THE ANALYST.', 'Dennis Wilder, former CIA China analyst', 'context'),
  33: CP([AP(520, 560, undefined, {s: 1.25}), {p: 'building', kind: 'office', x: 1250, y: 790, s: 1.25, at: 'company', lit: true}, {p: 'tag', text: 'QUIETLY GROWING', x: 1250, y: 330, at: 'quietly'}], 'MEANWHILE…', undefined, 'facts'),
  34: CP([{p: 'building', kind: 'tower', label: 'MEGASPEED', x: 960, y: 790, s: 1.2, at: 0, lit: true}], 'MEGASPEED.', 'Singapore-registered', 'facts'),
  49: CP([{p: 'card', kind: 'person', name: 'US INTELLIGENCE', role: 'OFFICIALS', badge: 'US', x: 400, y: 570, r: -3, s: 1.15, at: 'intelligence'}, {p: 'building', kind: 'whitehouse', x: 960, y: 800, s: 0.95, at: 0}, {p: 'card', kind: 'photo', src: 'photos/donald-trump.jpg', name: 'DONALD TRUMP', role: 'PRESIDENT', x: 1540, y: 570, r: 3, s: 1.15, at: 'Trump'}, {p: 'tag', text: 'OCT 2025', x: 960, y: 330, at: 'October'}, {p: 'arrow', x: 580, y: 480, x2: 1340, y2: 480, at: 'briefed', color: '#C4151C'}], 'THE BRIEFING.', 'According to reports', 'context'),
  56: CP([{p: 'card', kind: 'person', name: 'A THIRD WOMAN', role: 'REPORTED BY REUTERS', x: 960, y: 570, at: 0, s: 1.4}, {p: 'tag', text: 'NEXT DAY', x: 960, y: 270, at: 'next day'}], 'ANOTHER REPORT.', undefined, 'danger'),
  67: CP([...CORK({c1: {dim: true}, c2: {dim: true}, c3: {dim: true}, c4: {dim: true}}), AP(960, 590, 'missing', {s: 1.4, r: -2})], 'THE MISSING PIECE.', undefined, 'context'),
  68: CP([...CORK({c1: {dim: true}, c2: {dim: true}, c3: {dim: true}, c4: {dim: true}}), AP(960, 590, undefined, {s: 1.4, r: -2}), {p: 'stamp', text: 'SPY?', x: 1250, y: 430, r: -10, size: 84, at: 'spy'}], 'IS SHE A SPY?', undefined, 'context'),
  69: CP([...CORK({c1: {dim: true}, c2: {dim: true}, c3: {dim: true}, c4: {dim: true}}), AP(960, 590, undefined, {s: 1.4, r: -2}), {p: 'stamp', text: 'UNPROVEN', x: 1290, y: 420, r: -10, size: 78, at: 'proven'}], 'THE HONEST ANSWER.', undefined, 'facts'),
  70: CP([{p: 'building', kind: 'doj', label: 'JUSTICE DEPT.', x: 540, y: 790, s: 1.3, at: 0}, {p: 'person', name: 'TODD BLANCHE', role: 'US ATTORNEY GENERAL', tie: true, x: 1330, y: 790, s: 1.4, at: 'Blanche'}, {p: 'tag', text: '"NO CONCLUSION"', x: 1330, y: 360, at: 'conclusion', color: '#0A0A0A'}], 'THE JUSTICE DEPARTMENT.', undefined, 'facts', 'Attorney General Todd Blanche, as reported'),
  79: CP([...CORK({c1: {dim: true}, c2: {dim: true}, c3: {dim: true}, c4: {dim: true}}), AP(960, 590, undefined, {s: 1.4, r: -2}), {p: 'icon', icon: 'search', x: 1230, y: 640, size: 240, at: 'real'}, {p: 'stamp', text: 'REAL?', x: 1290, y: 430, r: -8, size: 84, at: 'spy case'}], 'A REAL SPY CASE?', undefined, 'context'),
  // ---- stage 2 scenes
  2: [cap(CP([{p: 'crates', n: 6, x: 960, y: 780, s: 1.1, at: 'Stacks', sealed: false}, {p: 'tag', text: 'BRAND-NEW NVIDIA AI CHIPS', x: 960, y: 290, at: 'Nvidia'}], 'THE BOXES.', 'Malaysia · according to reports', 'context'), 'Stacks of boxes. Brand-new Nvidia AI chips.'),
      cap(CP([{p: 'crates', n: 6, x: 560, y: 780, s: 0.9, at: 0, sealed: false}, {p: 'card', kind: 'photo', src: 'photos/h100-014.jpg', fit: 'meet', w: 380, h: 300, name: 'NVIDIA H100', role: 'AI CHIP', x: 1330, y: 560, r: 3, s: 1.25, at: 'chips'}, {p: 'tag', text: 'MOST WANTED', x: 1330, y: 300, at: 'most wanted'}], 'THE MOST WANTED.', 'Photo: Geekerwan, CC BY 3.0', 'context'), 'Some of the most wanted computer chips on the planet.')],
  3: CP([{p: 'crates', n: 6, x: 960, y: 780, s: 1.1, at: 0, sealed: true}, {p: 'stamp', text: 'STILL SEALED', x: 960, y: 520, r: -8, size: 120, at: 'sealed'}], 'STILL SEALED.', undefined, 'danger'),
  9: CP([{p: 'calendar', x: 600, y: 520, flips: 10, label: 'DAYS', sub: 'LATER', at: 'ten days', s: 1.45}, {p: 'chair', x: 1300, y: 760, s: 1.4, name: 'CEO · NVIDIA', at: 0}, JP(1300, 500, 'get it back', {s: 1.1})], 'TEN DAYS LATER.', undefined, 'danger'),
  31: CP([{p: 'phone', x: 700, y: 570, at: 'Photos', header: 'POSTED ONLINE', imgsrc: 'photos/alice-huang.jpg'}, {p: 'tag', text: 'NOT HIDING', x: 1280, y: 430, at: 'hiding', color: '#0A0A0A'}, {p: 'card', kind: 'text', text: '📷', name: 'PUBLIC PHOTOS', role: 'OF THEM TOGETHER', x: 1280, y: 620, s: 1.1, r: 3, at: 'Photos'}], 'NOT EXACTLY HIDING.', undefined, 'context'),
  37: [cap(EM({title: 'FOUR DAYS LATER.', sub: 'An Nvidia cloud partner', mood: 'facts', nodes: [{id: 'shell', dim: true}, {id: 'megaspeed'}, {id: 'nvidia', at: 'Nvidia', focus: true}], links: [{from: 'megaspeed', to: 'shell', label: 'SHELL OWNER', dim: true}, {from: 'nvidia', to: 'megaspeed', label: 'CLOUD PARTNER · +4 DAYS', at: 'cloud partner'}]}), 'And just four days after that, MegaSpeed became an official Nvidia cloud partner,'), cap(CP([{p: 'building', kind: 'tower', x: 1300, y: 780, s: 1.1, label: 'MEGASPEED', at: 0}, {p: 'crates', n: 3, x: 620, y: 780, s: 1, at: 'priority', sealed: false}, {p: 'money', x: 820, y: 540, x2: 1100, y2: 540, text: 'PRIORITY', at: 'priority'}], 'FIRST IN LINE.', 'Priority access to Nvidia chips', 'facts'), "which meant priority access to Nvidia's chips.")],
  39: CP([{p: 'building', kind: 'office', x: 600, y: 780, s: 1.1, label: 'MEGASPEED · 2023', at: 0}, {p: 'stack', n: 2, x: 1300, y: 760, s: 1.5, label: '$33M', at: 'million'}], '2023 ASSETS.', 'Reportedly', 'facts'),
  40: CP([{p: 'building', kind: 'tower', x: 600, y: 780, s: 1.15, label: 'MEGASPEED · 2024', at: 0}, {p: 'stack', n: 12, x: 1300, y: 800, s: 1.1, label: '$3B', at: 'billion'}], 'ONE YEAR LATER.', 'Reportedly', 'facts'),
  42: [cap(CP([{p: 'route', x: 560, y: 560, x2: 1360, y2: 560, a: 'NVIDIA', b: 'MALAYSIA', at: 'sister', n: 5}], 'SISTER COMPANY.', 'Malaysia', 'facts'), 'A sister company in Malaysia reportedly bought'),
       cap(CP([{p: 'building', kind: 'datacenter', x: 1380, y: 760, s: 1.1, label: 'SISTER COMPANY', at: 0}, {p: 'money', x: 420, y: 560, x2: 1050, y2: 560, text: '$4.8B', at: 'billion', n: 8}, {p: 'tag', text: 'ALMOST ALL FROM NVIDIA', x: 900, y: 330, at: 'almost all'}], 'AI EQUIPMENT.', undefined, 'facts'), 'at least 4.8 billion dollars of advanced AI equipment, almost all of it from Nvidia.')],
  44: [cap(H(undefined, 'BLOOMBERG', 'DEC 2025', 'Nvidia Buyer Megaspeed Faces Smuggling Probe', 'Smuggling Probe', 'https://www.youtube.com/watch?v=vfrQtabNYYE', 'danger'), 'And according to Bloomberg,'),
       cap(CP([{p: 'rack', x: 960, y: 760, slots: 6, missing: [1, 3, 4], label: '500+ CHIPS NOT FOUND', at: 0}], 'MISSING.', 'Not found in its data centers', 'danger', 'Bloomberg'), 'at least 500 chips that MegaSpeed imported could not be found in its data centers at all.')],
  45: CP([{p: 'crates', n: 6, x: 960, y: 780, s: 1.1, at: 0, sealed: true}, {p: 'stamp', text: 'SEALED', x: 1260, y: 470, r: -8, size: 100, at: 'sealed'}, {p: 'tag', text: 'MALAYSIA', x: 560, y: 340, at: 'Malaysia'}], 'BACK TO THE BOXES.', undefined, 'context'),
  50: [cap(CP([{p: 'card', kind: 'photo', src: 'photos/marco-rubio.jpg', name: 'MARCO RUBIO', role: 'SECRETARY OF STATE', x: 960, y: 560, s: 1.3, r: -2, at: 0}, {p: 'tag', text: 'MAY 2026', x: 960, y: 270, at: 'May'}], 'SECOND WARNING.', undefined, 'context'), 'In May 2026, Secretary of State Marco Rubio'),
       cap(CP([{p: 'card', kind: 'photo', src: 'photos/marco-rubio.jpg', name: 'MARCO RUBIO', role: 'SECRETARY OF STATE', x: 380, y: 560, s: 1.05, r: -2, at: 0}, {p: 'letter', x: 960, y: 570, header: 'MEMO · TO THE PRESIDENT', lines: ['A WARNING ABOUT', 'THE RELATIONSHIP', 'AND ALICE HUANG'], hl: [], at: 'memo', w: 480}, {p: 'card', kind: 'photo', src: 'photos/donald-trump.jpg', name: 'DONALD TRUMP', role: 'PRESIDENT', x: 1540, y: 560, s: 1.05, r: 3, at: 'Trump'}], 'THE MEMO.', 'Reportedly', 'context'), 'reportedly warned Trump again, in a memo.')],
  53: [cap(CP([{p: 'letter', x: 960, y: 560, header: 'TO: ALL EMPLOYEES', lines: ['I WANT TO BE CLEAR.', 'I WAS UNFAITHFUL', 'TO MY WIFE.', 'I HAVE NO EXCUSE.'], hl: [], at: 'letter', w: 640}], 'THE LETTER.', 'Jensen Huang to employees', 'danger'), 'A few days later, Jensen sent a letter to his employees.'),
       cap(CP([{p: 'letter', x: 960, y: 560, header: 'TO: ALL EMPLOYEES', lines: ['I WANT TO BE CLEAR.', 'I WAS UNFAITHFUL', 'TO MY WIFE.', 'I HAVE NO EXCUSE.'], hl: [1, 3], at: 0, w: 640}, {p: 'stamp', text: 'ADMITTED', x: 1500, y: 470, r: -8, size: 100, at: 'admitted'}], 'ADMITTED.', undefined, 'danger'), 'He admitted he had been unfaithful to his wife. He said he had no excuse.')],
  54: CP([{p: 'letter', x: 960, y: 560, header: 'TO: ALL EMPLOYEES', lines: ['I WANT TO BE CLEAR.', 'ALICE HUANG: —', 'SPYING: —', 'I HAVE NO EXCUSE.'], strike: [1, 2], at: 0, w: 640}, {p: 'tag', text: 'NOT MENTIONED', x: 1560, y: 500, at: 'Alice', color: '#C4151C'}, {p: 'tag', text: 'NOT MENTIONED', x: 1560, y: 620, at: 'spying', color: '#C4151C'}], 'WHAT IT LEFT OUT.', undefined, 'context'),
  60: [cap(CP([{p: 'crowd', x: 960, y: 640, total: 18800, label: 'SIGNATURES', at: 'petition'}], 'THE PETITION.', 'To bring him back', 'context', 'As reported'), 'A petition to bring him back collected more than 18,800 signatures.'),
       cap(P([MUSK], 'PUBLIC SUPPORT.'), 'Big names, including Elon Musk, publicly backed him.')],
  61: CP([{p: 'table', kind: 'board', x: 700, y: 560, n: 6, at: 0}, {p: 'door', x: 1420, y: 800, label: 'NOT COMING BACK', at: 'not coming back'}, {p: 'tag', text: 'NOV 17', x: 960, y: 290, at: 'November'}], 'THE BOARD SAYS NO.', undefined, 'danger'),
  62: CP([{p: 'table', kind: 'board', x: 700, y: 560, n: 6, hands: 6, at: 0}, {p: 'calendar', x: 1400, y: 700, flips: 5, label: 'DAYS', sub: 'LATER', at: 'Five days', s: 1.0}, {p: 'tag', text: 'NOV 22 · UNANIMOUS', x: 960, y: 290, at: 'unanimously'}], 'THE BOARD VOTES.', undefined, 'facts'),
  71: CP([{p: 'scales', x: 960, y: 570, left: 'SPY', right: 'NOT A SPY', tilt: 0, at: 0}, {p: 'tag', text: 'CIA · AS OF NOV 19', x: 960, y: 250, at: 'CIA'}, {p: 'stamp', text: 'CAN\'T SAY', x: 1380, y: 800, r: -6, size: 84, at: 'either way'}], 'NOBODY KNOWS.', 'As reported', 'facts'),
  80: CP([{p: 'scales', x: 960, y: 570, left: 'SPY CASE', right: 'POLITICAL WEAPON', tilt: 0, at: 0}, {p: 'tag', text: 'YOU DECIDE', x: 960, y: 250, at: 'weapon'}], 'REAL SPY CASE… OR A WEAPON?', undefined, 'danger'),
  87: CP([{p: 'scales', x: 960, y: 570, left: 'OTHERS: OPEN UP', right: 'US CHIPS: CLOSED', tilt: 1, at: 'double standard'}], 'DOUBLE STANDARD.', undefined, 'context'),
  88: [cap(CP([{p: 'route', x: 520, y: 560, x2: 1400, y2: 560, a: 'USA', b: 'INDIA', at: 'open', n: 5}, {p: 'tag', text: '"OPEN YOUR MARKETS"', x: 960, y: 330, at: 'open'}], 'OPEN YOUR MARKETS.', undefined, 'context'), 'The US constantly tells other countries to open their markets and remove trade barriers.'),
       cap(CP([{p: 'route', x: 520, y: 560, x2: 1400, y2: 560, a: 'USA', b: 'INDIA', at: 0, n: 5}, {p: 'tag', text: '"CUT YOUR TARIFFS"', x: 960, y: 330, at: 'tariffs'}], 'CUT YOUR TARIFFS.', undefined, 'context'), 'It pressures countries like India to cut tariffs on American goods.')],
  89: CP([{p: 'door', x: 1280, y: 800, label: 'CLOSED TO CHINA', at: 'shuts'}, {p: 'tag', text: 'US CHIPS', x: 620, y: 600, at: 0, color: '#0A0A0A'}], 'BUT NOT FOR CHINA.', undefined, 'danger'),
  90: CP([{p: 'route', x: 520, y: 560, x2: 1400, y2: 560, a: 'USA', b: 'CHINA', blocked: true, at: 0, n: 5}, {p: 'stamp', text: 'ONE WAY?', x: 1000, y: 380, r: -8, size: 100, at: 'one way'}], 'FREE TRADE: ONE WAY?', undefined, 'danger'),
  91: CP([{p: 'phone', x: 960, y: 570, at: 0, header: 'THE THEORY'}, {p: 'tag', text: 'EXPLODING ONLINE', x: 1420, y: 440, at: 'exploding'}], 'THE THEORY.', undefined, 'danger'),
  96: CP([{p: 'letter', x: 960, y: 560, header: 'THE LEAK', lines: ['FROM: ???', 'TO: THE PRESS', 'WHEN: ???'], strike: [], hl: [0, 2], at: 'leaked', w: 560}, {p: 'stamp', text: 'UNKNOWN', x: 1420, y: 480, r: -8, size: 100, at: 'not fully public'}], 'WHO LEAKED IT?', undefined, 'context'),
  98: CP([{p: 'chair', x: 960, y: 760, s: 1.4, name: 'CEO · NVIDIA', at: 0}, JP(960, 530, undefined, {s: 1.1}), {p: 'tag', text: 'THROUGH 2027', x: 1440, y: 500, at: '2027'}, {p: 'tag', text: 'BOARD · WASHINGTON · INVESTORS', x: 960, y: 250, at: 'board'}], 'OUR FORECAST.', undefined, 'facts'),
  99: CP([{p: 'route', x: 520, y: 560, x2: 1400, y2: 560, a: 'NVIDIA', b: 'CHINA', blocked: true, at: 0, n: 5}, {p: 'tag', text: 'THE FIGHT GETS LOUDER', x: 960, y: 330, at: 'louder'}], 'CHIPS TO CHINA.', undefined, 'facts'),
  // ---- stage 3 scenes
  5: CP([{p: 'rack', x: 560, y: 780, slots: 5, missing: [2], s: 1.15, at: 0, label: 'ONE SLOT EMPTY'}, {p: 'route', x: 960, y: 520, x2: 1560, y2: 520, a: 'MALAYSIA', b: '?', n: 4, at: 'never meant'}, {p: 'tag', text: 'NEVER MEANT TO STAY?', x: 1260, y: 330, at: 'meant to'}], 'UNLESS…', undefined, 'danger'),
  11: CP([{p: 'letter', x: 960, y: 560, header: 'FORECAST FILE 003', lines: ['NVIDIA', 'SPY CLAIMS', 'POWER'], hl: [1], at: 'open', w: 520}], 'THE FILE.', undefined, 'context'),
  14: CP([{p: 'card', kind: 'photo', src: 'photos/h100-014.jpg', fit: 'meet', w: 380, h: 300, name: 'NVIDIA H100', role: 'AI CHIP', x: 640, y: 570, s: 1.3, r: -2, at: 0}, {p: 'crates', n: 6, x: 1330, y: 790, s: 1.0, sealed: false, at: 'most'}, {p: 'tag', text: 'MAKES MOST OF THEM', x: 1330, y: 330, at: 'most'}], 'THE COMPANY.', 'Photo: Geekerwan, CC BY 3.0', 'facts'),
  15: CP([{p: 'tag', text: 'IF AI IS A WAR…', x: 960, y: 290, at: 0}, {p: 'card', kind: 'photo', src: 'photos/h100-014.jpg', fit: 'meet', w: 380, h: 300, name: 'NVIDIA H100', role: 'AI CHIP', x: 820, y: 590, s: 1.3, r: -2, at: 'Nvidia'}, {p: 'stamp', text: 'THE WEAPON', x: 1260, y: 470, r: -8, size: 100, at: 'weapons'}, {p: 'tag', text: 'FOR BOTH SIDES', x: 1500, y: 720, at: 'both sides', color: '#0A0A0A'}], 'THE WEAPONS MAKER.', undefined, 'context'),
  47: CP([{p: 'table', kind: 'dinner', x: 700, y: 700, s: 1.4, at: 0}, {p: 'icon', icon: 'camera', x: 1420, y: 540, size: 300, at: 'surveillance'}, {p: 'tag', text: 'CLOSE TO AN AMERICAN CITIZEN', x: 960, y: 300, at: 'American'}], 'SURVEILLANCE.', 'According to reports', 'danger'),
  73: CP([...CORK({c1: {dim: true}, c2: {dim: true}, c3: {dim: true}, c4: {dim: true}}), {p: 'card', kind: 'text', text: '?', name: 'THE SPY STORY', role: 'WHERE FROM?', x: 960, y: 590, s: 1.35, r: -2, at: 'spy story'}], 'WHERE DID IT COME FROM?', undefined, 'context'),
  74: CP([{p: 'building', kind: 'capitol', x: 960, y: 790, s: 1.1, at: 0}, {p: 'card', kind: 'person', name: 'SELL TO CHINA', role: 'ONE SIDE', x: 330, y: 560, r: -3, s: 1.1, at: 'fight'}, {p: 'card', kind: 'person', name: 'BLOCK CHINA', role: 'THE OTHER SIDE', x: 1590, y: 560, r: 3, s: 1.1, at: 'American government'}], 'A FIGHT INSIDE.', 'The US government', 'context'),
  76: CP([{p: 'card', kind: 'photo', src: 'photos/marco-rubio.jpg', name: 'MARCO RUBIO', role: 'CHINA HAWK', x: 520, y: 570, s: 1.2, r: -2, at: 'Rubio'}, {p: 'card', kind: 'person', name: 'CHINA HAWKS', role: 'OPPOSE CHIP SALES', x: 960, y: 570, s: 1.0, at: 'hawks'}, {p: 'stamp', text: 'STOP', x: 1440, y: 540, r: -8, size: 150, at: 'oppose'}, {p: 'crates', n: 3, x: 1470, y: 790, s: 0.9, sealed: false, at: 'selling'}], 'SIDE 2: THE HAWKS.', undefined, 'danger'),
  77: CP([{p: 'letter', x: 960, y: 560, header: "RUBIO'S MEMO", lines: ['SUBJECT: ALICE HUANG', 'LABEL: CHINESE SPY'], hl: [1], at: 'memo', w: 560}, {p: 'tag', text: 'ACCORDING TO REPORTS', x: 1480, y: 330, at: 'According'}], 'THE MEMO.', undefined, 'danger'),
  81: CP([{p: 'card', kind: 'text', text: '1', name: 'CONDUCT', x: 480, y: 570, s: 1.1, r: -2, at: 0.5}, {p: 'card', kind: 'text', text: '2', name: 'CONFLICT OF INTEREST', x: 960, y: 570, s: 1.1, at: 1.4}, {p: 'card', kind: 'text', text: '3', name: 'TRADE WAR', x: 1440, y: 570, s: 1.1, r: 2, at: 2.3}], 'THREE ISSUES.', undefined, 'facts'),
  82: CP([JP(960, 570, 0, {s: 1.3, r: -2}), {p: 'tag', text: '1 · CONDUCT', x: 1400, y: 460, at: 'conduct'}], 'ISSUE 1.', undefined, 'facts'),
  84: CP([{p: 'scales', x: 960, y: 570, left: 'LINKED COMPANY', right: 'NVIDIA DEAL', tilt: 1, at: 'conflict'}, {p: 'tag', text: '2 · CONFLICT OF INTEREST', x: 960, y: 250, at: 'two'}], 'ISSUE 2.', undefined, 'facts'),
  86: CP([{p: 'icon', icon: 'globe', x: 960, y: 560, size: 420, at: 0}, {p: 'tag', text: '3 · THE TRADE WAR', x: 960, y: 290, at: 'three'}], 'ISSUE 3.', undefined, 'facts'),
  92: CP([{p: 'icon', icon: 'trending-down', x: 560, y: 560, size: 300, at: 'Nvidia'}, {p: 'icon', icon: 'trending-up', x: 1360, y: 560, size: 300, at: 'stock'}, {p: 'tag', text: 'A WAY TO MOVE THE STOCK?', x: 960, y: 300, at: 'move'}], 'STOCK MANIPULATION?', undefined, 'danger'),
  94: CP([{p: 'card', kind: 'person', name: 'REGULATOR', role: 'NO ACCUSATION', x: 480, y: 570, s: 1.15, r: -2, at: 'regulator'}, {p: 'card', kind: 'person', name: 'COURT', role: 'NO ACCUSATION', x: 960, y: 570, s: 1.15, at: 'court'}, {p: 'card', kind: 'person', name: 'MAJOR OUTLET', role: 'NO ACCUSATION', x: 1440, y: 570, s: 1.15, r: 2, at: 'outlet'}, {p: 'stamp', text: 'NONE', x: 520, y: 500, r: -8, size: 70, at: 'regulator', lead: 0.5}, {p: 'stamp', text: 'NONE', x: 1000, y: 500, r: 6, size: 70, at: 'court', lead: 0.5}, {p: 'stamp', text: 'NONE', x: 1480, y: 500, r: -6, size: 70, at: 'outlet', lead: 0.5}], 'NO ONE HAS BEEN ACCUSED.', undefined, 'facts'),
  101: CP([{p: 'card', kind: 'building', text: 'doj', name: 'CIA / DOJ', role: 'FINAL VERDICT?', x: 700, y: 570, s: 1.25, r: -2, at: 0}, {p: 'tag', text: 'SIGNAL 1', x: 1300, y: 500, at: 'One'}], 'SIGNAL 1.', undefined, 'facts'),
  102: CP([{p: 'card', kind: 'building', text: 'doj', name: 'CIA / DOJ', role: 'FINAL VERDICT?', x: 520, y: 570, s: 1.15, r: -2, at: 0}, {p: 'card', kind: 'building', text: 'tower', name: 'MEGASPEED', role: 'CHARGES? MISSING CHIPS', x: 1000, y: 570, s: 1.15, r: 2, at: 'MegaSpeed'}, {p: 'tag', text: 'SIGNAL 2', x: 1500, y: 500, at: 'Two'}], 'SIGNAL 2.', undefined, 'facts'),
  105: CP([{p: 'scales', x: 960, y: 570, left: 'SPY CASE', right: 'POLITICAL WEAPON', tilt: 0, at: 0}, {p: 'tag', text: 'YOUR FORECAST?', x: 960, y: 250, at: 'weapon'}], 'REAL OR WEAPON?', undefined, 'context'),
  12: CP([{p: 'card', kind: 'text', text: '1', name: 'ONE THING TO KNOW', x: 960, y: 570, s: 1.35, r: -2, at: 0}, {p: 'tag', text: 'TO UNDERSTAND THIS STORY', x: 960, y: 290, at: 'understand'}], 'ONE THING.', undefined, 'context'),
  20: CP([{p: 'card', kind: 'text', text: 'US', name: 'UNITED STATES', x: 380, y: 570, s: 1.15, r: -3, at: 'fight'}, JP(960, 570, 'one man', {s: 1.25}), {p: 'card', kind: 'text', text: 'CN', name: 'CHINA', x: 1540, y: 570, s: 1.15, r: 3, at: 'fight'}, {p: 'arrow', x: 580, y: 560, x2: 760, y2: 560, at: 'middle'}, {p: 'arrow', x: 1340, y: 560, x2: 1160, y2: 560, at: 'middle'}], 'CAUGHT IN THE MIDDLE.', undefined, 'context'),
  27: CP([AP(520, 570, 0, {id: 'a', s: 1.2, r: -2}), JP(1400, 570, 'richest', {id: 'j', s: 1.2, r: 2}), {p: 'string', from: 'a', to: 'j', at: 'close'}, {p: 'tag', text: 'ONE OF THE RICHEST MEN', x: 1400, y: 290, at: 'richest'}], 'HOW DID SHE GET SO CLOSE?', undefined, 'context'),
  29: CP([{p: 'table', kind: 'dinner', x: 960, y: 740, s: 1.5, at: 'dinner'}, {p: 'tag', text: 'SINGAPORE', x: 620, y: 330, at: 'Singapore'}, {p: 'tag', text: 'DEC 2023', x: 1300, y: 330, at: 'December'}, {p: 'tag', text: 'FIRST PUBLIC MEETING ON RECORD', x: 960, y: 250, at: 0, color: '#0A0A0A'}], 'FIRST PUBLIC MEETING.', undefined, 'context'),
  32: CP([{p: 'phone', x: 700, y: 570, at: 0, header: 'POSTED ONLINE', imgsrc: 'photos/alice-huang.jpg'}, {p: 'stamp', text: 'REMEMBER THIS', x: 1340, y: 500, r: -8, size: 100, at: 'Keep'}, {p: 'tag', text: 'IT WILL MATTER LATER', x: 1340, y: 700, at: 'matter'}], 'KEEP THAT IN MIND.', undefined, 'context'),
  52: CP([JP(640, 570, 0, {s: 1.2, r: -2}), {p: 'card', kind: 'text', text: 'N', name: 'NVIDIA · STATEMENT', x: 1280, y: 570, s: 1.2, r: 2, at: 'Nvidia'}, {p: 'stamp', text: 'DENIED', x: 960, y: 500, r: -8, size: 150, at: 'denied'}], 'FIRST: DENIED.', undefined, 'danger'),
  104: CP([{p: 'phone', x: 960, y: 570, at: 0, header: 'COMMENTS'}, {p: 'tag', text: 'NOW I WANT TO HEAR FROM YOU', x: 1440, y: 440, at: 'hear'}], 'YOUR TURN.', undefined, 'context'),
  106: CP([{p: 'phone', x: 960, y: 570, at: 0, header: 'COMMENTS'}, {p: 'tag', text: 'YOUR FORECAST?', x: 1440, y: 440, at: 'forecast'}], 'COMMENT YOUR FORECAST.', undefined, 'context'),
  107: CP([{p: 'icon', icon: 'megaphone', x: 960, y: 560, size: 380, at: 0}, {p: 'tag', text: 'SUBSCRIBE · THE CRIMSON FORECAST', x: 960, y: 300, at: 'subscribe'}], 'SUBSCRIBE.', 'See what’s coming before the headlines', 'facts'),
  108: CP([{p: 'letter', x: 960, y: 560, header: 'FORECAST FILE 003', lines: ['NVIDIA · SPY CLAIMS · POWER', 'STATUS: CLOSED'], hl: [1], at: 0, w: 640}, {p: 'stamp', text: 'FILE CLOSED', x: 1400, y: 470, r: -8, size: 110, at: 'closed'}], 'FILE CLOSED.', undefined, 'facts'),
};
const NEWF: Record<number, (b: Spec[]) => Spec[]> = {
  13: (b) => [cap(CP([{p: 'icon', icon: 'phone', x: 520, y: 570, size: 300, at: 'chatbots'}, {p: 'icon', icon: 'truck', x: 960, y: 570, size: 300, at: 'self-driving'}, {p: 'icon', icon: 'plane', x: 1400, y: 570, size: 300, at: 'military'}, {p: 'tag', text: 'CHATBOTS', x: 520, y: 760, at: 'chatbots'}, {p: 'tag', text: 'SELF-DRIVING CARS', x: 960, y: 760, at: 'self-driving'}, {p: 'tag', text: 'MILITARY SOFTWARE', x: 1400, y: 760, at: 'military'}], 'EVERY AI SYSTEM…', undefined, 'context'), b[0].cap as string),
    cap(CP([{p: 'icon', icon: 'phone', x: 420, y: 560, size: 200, at: 0}, {p: 'icon', icon: 'plane', x: 1500, y: 450, size: 200, at: 0}, {p: 'icon', icon: 'truck', x: 1500, y: 700, size: 200, at: 0}, {p: 'card', kind: 'photo', src: 'photos/h100-014.jpg', fit: 'meet', w: 380, h: 300, name: 'NVIDIA H100', role: 'AI CHIP', x: 960, y: 570, s: 1.25, r: -2, at: 'special chips'}, {p: 'tag', text: 'NEEDS SPECIAL CHIPS', x: 960, y: 290, at: 'needs'}], '…NEEDS THESE.', undefined, 'context'), b[1].cap as string)],
  25: (b) => [cap(CP([AP(960, 570, 0, {s: 1.3, r: -2}), {p: 'stamp', text: 'NOT CONFIRMED', x: 1280, y: 470, r: -8, size: 90, at: 'confirmed'}], 'NOT CONFIRMED.', undefined, 'danger'), b[0].cap as string),
    cap(CP([{p: 'card', kind: 'person', name: 'STATE TV JOB', role: 'NO PUBLIC RECORD', x: 640, y: 570, s: 1.2, r: -2, at: 'TV'}, {p: 'card', kind: 'person', name: 'THE MARRIAGE', role: 'NO PROOF', x: 1280, y: 570, s: 1.2, r: 2, at: 'marriage'}, {p: 'stamp', text: 'NO RECORD', x: 700, y: 470, r: -8, size: 66, at: 'record'}, {p: 'stamp', text: 'NO PROOF', x: 1340, y: 470, r: 6, size: 66, at: 'proof'}], 'NOTHING CHECKS OUT.', undefined, 'danger'), b[1].cap as string)],
  63: (b) => [cap(CP([{p: 'building', kind: 'whitehouse', x: 560, y: 790, s: 1.05, at: 'officials', label: 'US OFFICIALS'}, {p: 'table', kind: 'board', x: 1360, y: 560, n: 6, s: 1.2, at: 0}, {p: 'arrow', x: 1000, y: 520, x2: 1180, y2: 520, at: 'spoken'}, {p: 'tag', text: 'THE BOARD SAYS', x: 1360, y: 300, at: 'board'}], 'THE BOARD SAYS.', 'Consulted senior US officials', 'facts'), b[0].cap as string),
    cap(CP([JP(640, 570, 0, {s: 1.2, r: -2}), {p: 'stamp', text: 'NO THREAT', x: 1280, y: 480, r: -6, size: 120, at: 'no threat', color: '#0A0A0A'}, {p: 'tag', text: 'NATIONAL SECURITY · THE BOARD’S CLAIM', x: 1280, y: 680, at: 'national security'}], 'HIS RETURN.', undefined, 'facts'), b[1].cap as string)],
  75: (b) => [cap(CP([JP(420, 570, 0, {s: 1.15, r: -2}), {p: 'route', x: 760, y: 560, x2: 1560, y2: 560, a: 'NVIDIA', b: 'CHINA', n: 4, at: 'sell'}, {p: 'tag', text: 'SELL MORE CHIPS TO CHINA', x: 1160, y: 330, at: 'sell'}], 'SIDE 1: SELL TO CHINA.', undefined, 'facts'), b[0].cap as string),
    cap(CP([JP(480, 570, 0, {s: 1.0, r: -2}), {p: 'building', kind: 'whitehouse', x: 960, y: 790, s: 1.0, at: 0}, {p: 'card', kind: 'photo', src: 'photos/donald-trump.jpg', name: 'DONALD TRUMP', role: 'PRESIDENT', x: 1440, y: 570, s: 1.0, r: 3, at: 'Trump'}, {p: 'tag', text: 'RESTRICTIONS LOOSENED', x: 960, y: 290, at: 'loosened'}], 'RULES LOOSENED.', undefined, 'facts'), b[1].cap as string), b[2]],
  78: (b) => [b[0], cap(CP([{p: 'letter', x: 560, y: 570, header: 'CIA REPORT', lines: ['ASSESSMENT ON', 'ALICE HUANG:', 'NO SPY FINDING'], hl: [], at: 'CIA', w: 520}, {p: 'letter', x: 1360, y: 570, header: "RUBIO'S MEMO", lines: ['SUBJECT:', 'ALICE HUANG', 'LABEL: SPY'], hl: [2], at: 'memo', w: 520}], 'NEVER SAID IT.', undefined, 'facts'), b[1].cap as string),
    cap(CP([{p: 'letter', x: 560, y: 570, header: 'CIA REPORT', lines: ['ASSESSMENT ON', 'ALICE HUANG:', 'NO SPY FINDING'], hl: [], at: 0, w: 520}, {p: 'letter', x: 1360, y: 570, header: "RUBIO'S MEMO", lines: ['SUBJECT:', 'ALICE HUANG', 'LABEL: SPY'], hl: [2], at: 0, w: 520}, {p: 'stamp', text: "RUBIO'S OWN CALL", x: 1340, y: 330, r: -6, size: 78, at: 'own assessment'}], "RUBIO'S OWN CALL.", undefined, 'facts'), b[2].cap as string)],
  83: (b) => [cap(CP([{p: 'letter', x: 960, y: 560, header: 'TO: ALL EMPLOYEES', lines: ['I WAS UNFAITHFUL', 'TO MY WIFE.', 'I HAVE NO EXCUSE.'], hl: [0], at: 'admitted', w: 600}], 'ADMITTED.', undefined, 'facts'), b[0].cap as string),
    cap(CP([{p: 'scales', x: 960, y: 570, left: 'CEO', right: 'HIS OWN STAFF', tilt: 1, at: 'employees'}, {p: 'tag', text: 'WORKPLACE ETHICS', x: 960, y: 250, at: 'ethics'}], 'WORKPLACE ETHICS.', undefined, 'facts'), b[1].cap as string), b[2]],
  85: (b) => [cap(CP([AP(480, 570, 0, {s: 1.1, r: -2}), {p: 'money', x: 800, y: 560, x2: 1200, y2: 560, text: 'PARTNER STATUS', at: 'partner'}, {p: 'building', kind: 'tower', x: 1470, y: 790, s: 1.0, label: 'MEGASPEED', at: 'company'}], 'SPY OR NOT…', undefined, 'facts'), b[0].cap as string),
    cap(CP([{p: 'scales', x: 640, y: 520, left: 'LINKED COMPANY', right: 'NVIDIA CHIPS', tilt: 1, at: 'conflict'}, {p: 'icon', icon: 'search', x: 1440, y: 560, size: 300, at: 'investigation'}, {p: 'tag', text: 'NEEDS A FULL INVESTIGATION', x: 1440, y: 780, at: 'investigation'}], 'CONFLICT OF INTEREST.', undefined, 'facts'), b[1].cap as string)],
  95: (b) => [cap(CP([{p: 'icon', icon: 'search', x: 960, y: 570, size: 400, at: 'regulators'}, {p: 'tag', text: 'UNUSUAL TRADES', x: 960, y: 290, at: 'unusual'}], 'REGULATORS WATCH.', undefined, 'facts'), b[0].cap as string),
    cap(CP([{p: 'stack', n: 12, x: 960, y: 760, s: 1.6, at: 'find'}, {p: 'tag', text: 'A MUCH BIGGER STORY', x: 960, y: 290, at: 'bigger'}], 'IF THEY FIND SOMETHING…', undefined, 'facts'), b[1].cap as string)],
  103: (b) => [cap(CP([{p: 'card', kind: 'building', text: 'doj', name: 'CIA / DOJ', role: 'FINAL VERDICT?', x: 400, y: 570, s: 1.0, r: -2, at: 0}, {p: 'card', kind: 'building', text: 'tower', name: 'MEGASPEED', role: 'CHARGES?', x: 960, y: 570, s: 1.0, at: 0}, {p: 'card', kind: 'text', text: '3', name: 'NEXT CHINA CHIP DECISION', x: 1520, y: 570, s: 1.0, r: 2, at: 'Three'}], 'SIGNAL 3.', undefined, 'facts'), b[0].cap as string),
    cap(CP([JP(480, 570, 0, {s: 1.15, r: -2}), {p: 'door', x: 960, y: 800, s: 1.0, at: 'win'}, {p: 'card', kind: 'photo', src: 'photos/marco-rubio.jpg', name: 'MARCO RUBIO', role: 'THE HAWKS', x: 1440, y: 570, s: 1.15, r: 3, at: 'hawks'}, {p: 'tag', text: 'WHO REALLY WON?', x: 960, y: 290, at: 'won'}], 'WHO REALLY WON?', undefined, 'facts'), b[1].cap as string)],
  10: (b) => [b[0], cap(CP([{p: 'letter', x: 960, y: 560, header: 'CASE FILE · EP 003', lines: ['WHAT HAPPENED?', 'WHAT IS PROVEN?', 'NOBODY CAN SAY.'], hl: [2], at: 'nobody', w: 600}], 'NOBODY CAN SAY FOR SURE.', undefined, 'context'), b[1].cap as string)],
  23: (b) => [b[0], cap(CP([{p: 'person', name: 'KANG WEI', role: 'OWNER OF THE FIRM', tie: true, x: 560, y: 750, s: 1.3, at: 'owner'}, AP(1360, 560, 0, {s: 1.1, r: 2}), {p: 'tag', text: 'LATER DESCRIBED AS HER HUSBAND', x: 960, y: 290, at: 'husband'}], 'THE HUSBAND?', 'Per the Washington Post', 'danger', 'Washington Post'), b[1].cap as string)],
  43: (b) => [cap(CP([{p: 'letter', x: 960, y: 560, header: 'THE INFORMATION · INVESTIGATION', lines: ['ALICE USED HER COMPANIES', 'AND HER LINK TO JENSEN', 'TO MOVE CHIPS'], hl: [], at: 'investigation', w: 620}], 'THE INFORMATION.', undefined, 'danger', 'The Information, investigation'), b[0].cap as string), b[1]],
  72: (b) => [b[0], cap(CP([{p: 'phone', x: 560, y: 570, at: 0, header: 'ALL OVER SOCIAL MEDIA', imgsrc: 'photos/alice-huang.jpg'}, {p: 'person', name: 'A TRAINED SPY?', role: 'WOULD SHE POST THIS?', hat: true, x: 1360, y: 750, s: 1.3, at: 'trained spy'}, {p: 'tag', text: 'WHY BE SO PUBLIC?', x: 1360, y: 400, at: 'why'}], 'A SPY… ON SOCIAL MEDIA?', undefined, 'context'), b[1].cap as string)],
  93: (b) => [b[0], ...b.slice(1).map((x) => (x.template === 'title' ? cap(CP([{p: 'person', name: 'BOUGHT AT THE BOTTOM', role: 'A FORTUNE IN DAYS', x: 560, y: 750, s: 1.3, at: 0}, {p: 'stack', n: 12, x: 1300, y: 760, s: 1.7, at: 'fortune'}], 'A FORTUNE IN DAYS.', undefined, 'danger'), x.cap as string) : x))],
};

const SPECS_BASE: (Spec | Spec[])[] = [
  // 00 — THE SEALED BOXES
  /*0*/ [cap(CP([{p: 'crates', n: 6, x: 960, y: 800, s: 1.4, at: 0, sealed: true}, {p: 'tag', text: 'SEALED BOXES · MALAYSIA', x: 960, y: 300, at: 0.3}], 'LATE 2024.', undefined, 'context'), 'Late 2024.'), cap(MP({center: [104, 4], zoom: 0.9, pins: [KL], highlight: ['458']}), 'A data center in Malaysia.')],
  /*1*/ src(I('servers', 'A DATA CENTER.', 'Malaysia'), 'According to reports'),
  /*2*/ [cap(I('boxes', 'NVIDIA AI CHIPS.', 'Brand new.'), 'Stacks of boxes. Brand-new Nvidia AI chips.'), cap(I('chip', 'THE MOST WANTED CHIPS.'), 'Some of the most wanted computer chips on the planet.')],
  /*3*/ T('STILL SEALED.', 'danger'),
  /*4*/ [cap({template: 'recipe', recipe: 'unbox', stage: 'buy', mood: 'facts', title: 'NORMAL LOGIC.', sub: 'You buy it.'}, "If you buy chips this powerful for your own data center,"), cap({template: 'recipe', recipe: 'unbox', stage: 'open', mood: 'facts', title: 'NORMAL LOGIC.', sub: 'You open it.'}, 'you open them.'), cap({template: 'recipe', recipe: 'plugin', mood: 'facts', title: 'NORMAL LOGIC.', sub: 'You plug it in. You use it.'}, 'You plug them in. You use them.')],
  /*5*/ T('UNLESS…', 'danger'),
  /*6*/ [cap(I('magnifier', 'AN INVESTIGATION.'), 'According to reports, that one moment helped start an investigation'), cap(CA(['A MYSTERY WOMAN', 'THE WHITE HOUSE', "NVIDIA'S CEO"], 'WHERE IT LED.'), 'that would reach a mysterious Chinese businesswoman, the White House, and the man running the most important tech company in the world.')],
  /*7*/ P([JENSEN]),
  /*8*/ H('CU1I2a-FF7E', 'REUTERS', 'NOV 12, 2026', 'Nvidia CEO Jensen Huang resigns', 'resigns', 'https://www.youtube.com/watch?v=CU1I2a-FF7E', 'danger'),
  /*9*/ H('5mNCHODJ_HA', 'NBC NEWS', 'NOV 2026', 'Jensen Huang reinstated as NVIDIA CEO', 'reinstated', 'https://www.youtube.com/watch?v=5mNCHODJ_HA'),
  /*10*/ [cap(TL([{label: 'NOV 12', sub: 'OUT'}, {label: 'NOV 22', sub: 'BACK'}], 'TEN DAYS.'), 'This is the story of how it happened.'), cap(T('NOBODY CAN SAY FOR SURE.', 'context'), 'And why, even now, nobody can say for sure what the truth is.')],
  /*11*/ I('folder', 'FORECAST FILE 003.', 'Nvidia · Spy claims · Power'),

  // 01 — WHY THESE CHIPS MATTER
  /*12*/ T('ONE THING TO KNOW.'),
  /*13*/ [cap(CA(['CHATBOTS', 'SELF-DRIVING CARS', 'MILITARY SOFTWARE'], 'EVERY AI SYSTEM…'), 'Every powerful AI system in the world, from chatbots to self-driving cars to military software,'), cap(I('chip', '…NEEDS THESE.'), 'needs special chips to train and run.')],
  /*14*/ I('chip', 'NVIDIA.', 'Makes most of them.', 'facts'),
  /*15*/ SP('AI WAR', '=', 'NVIDIA', 'THE WEAPONS MAKER.'),
  /*16*/ {template: 'recipe', recipe: 'ban', mood: 'context', title: 'THE BAN.', sub: 'Oct 2022 · US export controls', source: 'Photo: Geekerwan, CC BY 3.0 (Wikimedia Commons) · Federal Register doc. 2022-21658, Oct 13, 2022'},
  /*17*/ [cap(MP({center: [-98, 39], zoom: 0.12, highlight: ['840'], title: "WASHINGTON'S FEAR."}), "Washington's fear is simple."), cap(I('radar', 'MILITARY + SURVEILLANCE.'), 'If China gets ahead in AI, its military and surveillance power could grow enormously.')],
  /*18*/ [cap(MP({center: [104, 35], zoom: 0.25, highlight: ['156'], title: "BEIJING'S VIEW."}), 'Beijing sees it very differently.'), cap(SP('BANS', '=', 'HOLD US BACK', 'CHINA SAYS.'), 'To China, these bans are an attempt to hold back its economy and keep America on top.')],
  /*19*/ src(P([TRUMP], '"WHOEVER WINS AI, WINS."'), 'Donald Trump, public remarks'),
  /*20*/ P([JENSEN], 'CAUGHT IN THE MIDDLE.'),

  // 02 — THE WOMAN WITH NO PAST
  /*21*/ P([ALICE], 'ALICE HUANG.', 'danger'),
  /*22*/ I('idcard', 'CHINESE CITIZEN.', 'An impressive résumé… on paper.', 'danger'),
  /*23*/ [cap(src(TL([{label: 'STATE TV', sub: 'journalist'}, {label: 'BANKS', sub: 'finance'}, {label: '~2015', sub: 'Shanghai PE firm'}], 'HER CAREER.'), 'Washington Post'), 'According to the Washington Post, she worked as a journalist at Chinese state TV, then at major banks,'), cap(src(I('idcard', 'THE HUSBAND?', 'Owner of the firm: Kang Wei'), 'Washington Post'), 'and by around 2015, she was a senior manager at a Shanghai private equity firm. The owner of that firm, Kang Wei, was later described as her husband.')],
  /*24*/ T("BUT HERE'S THE PROBLEM.", 'danger'),
  /*25*/ [cap(T('NOT CONFIRMED.', 'danger'), 'Almost none of it can be independently confirmed.'), cap(CA(['NO TV RECORD', 'NO MARRIAGE PROOF'], 'NOTHING CHECKS OUT.', 'danger'), 'No public record of the TV work. No proof of the marriage.')],
  /*26*/ [cap(src(T('"A LEGEND."', 'context'), 'Dennis Wilder, former top CIA China analyst'), 'A former top CIA China analyst, Dennis Wilder, said her background looked like a "legend."'), cap(I('idcard', 'A FAKE IDENTITY.', 'Built to look real.'), 'In spy language, that means a fake identity, built to look real.')],
  /*27*/ T('HOW DID SHE GET SO CLOSE?'),
  /*28*/ [cap(src(EM({title: 'HER OWN HUSBAND.', sub: 'Per the Wall Street Journal', mood: 'danger', nodes: [{id: 'alice'}, {id: 'kang', at: 'husband'}, {id: 'jensen', at: 'introduced'}], links: [{from: 'kang', to: 'alice', label: 'HUSBAND', at: 'husband'}, {from: 'kang', to: 'jensen', label: 'INTRODUCED THEM', at: 'introduced', arc: 150}], callout: {kicker: 'WSJ · ALSO REPORTED', text: 'Kang had known Jensen for about ten years.', at: 'introduced', top: 560}}), 'Wall Street Journal'), 'According to the Wall Street Journal, it was her own husband who introduced them.'), cap(src(TL([{label: 'GAMING ERA', sub: 'Kang Wei knew Jensen'}, {label: 'YEARS LATER', sub: 'Introduced Alice'}], 'OLD FRIENDS.'), 'Wall Street Journal'), 'He had known Jensen for years, back when his firm invested in video games and Nvidia was mostly a gaming chip company.')],
  /*29*/ MP({center: [104, 2], zoom: 1.2, pins: [{lon: 103.8, lat: 1.35, label: 'SINGAPORE · DEC 2023'}], title: 'FIRST PUBLIC MEETING.'}),
  /*30*/ [cap(MP({center: [112, 18], zoom: 0.28, pins: [{lon: 121.5, lat: 25.0, label: 'TAIPEI'}, {lon: 121.5, lat: 31.2, label: 'SHANGHAI'}, {lon: 103.8, lat: 1.35, label: 'SINGAPORE'}], title: 'SEEN TOGETHER.'}), 'Over the next few years, they were reportedly seen together in Taipei, in Shanghai,'), cap(MP({center: [-119, 37], zoom: 0.5, pins: [{lon: -121.95, lat: 37.37, label: 'NVIDIA HQ'}, {lon: -121.9, lat: 36.57, label: 'GOLF RESORTS'}], title: 'AND IN AMERICA.'}), 'at Nvidia offices in America, and at golf resorts in California.')],
  /*31*/ H('HFEpZyWsBDY', 'THE STAR', 'NOV 2026', 'Photo, video show Nvidia CEO Huang with woman at centre of spy probe', 'Photo, video', 'https://www.youtube.com/watch?v=HFEpZyWsBDY'),
  /*32*/ T('REMEMBER THIS.'),

  // 03 — FOLLOW THE CHIPS
  /*33*/ I('chartV', 'MEANWHILE…', undefined, 'facts'),
  /*34*/ T('MEGASPEED.', 'facts'),
  /*35*/ EM({title: 'THE COMPANY.', sub: 'Renamed MegaSpeed', mood: 'facts', nodes: [{id: 'alice'}, {id: 'megaspeed', at: 'MegaSpeed', focus: true}], links: [{from: 'alice', to: 'megaspeed', label: 'BOUGHT · MAR 2023', at: 'bought'}], callout: {kicker: 'BEFORE THE RENAME', text: 'Founded 2015 as 7Road International, tied to a Chinese video-game holding company.', source: 'Wikipedia, citing news reports', at: 'MegaSpeed'}}),
  /*36*/ EM({title: 'THEN…', sub: '+8 months', mood: 'facts', nodes: [{id: 'alice', dim: true}, {id: 'megaspeed'}, {id: 'shell', at: 'Ownership', focus: true}], links: [{from: 'alice', to: 'megaspeed', label: 'NAME REMOVED', dim: true}, {from: 'megaspeed', to: 'shell', label: 'OWNERSHIP MOVED', at: 'Ownership'}], callout: {kicker: 'THE BUYER', text: 'Sold in Oct 2023 to a Singapore company owned by Tan Yong Pong.', source: 'Wikipedia, citing news reports', at: 'Ownership'}}),
  /*37*/ [cap(EM({title: 'FOUR DAYS LATER.', sub: 'An Nvidia cloud partner', mood: 'facts', nodes: [{id: 'shell', dim: true}, {id: 'megaspeed'}, {id: 'nvidia', at: 'Nvidia', focus: true}], links: [{from: 'megaspeed', to: 'shell', label: 'SHELL OWNER', dim: true}, {from: 'nvidia', to: 'megaspeed', label: 'CLOUD PARTNER · +4 DAYS', at: 'cloud'}], callout: {kicker: 'LATER', text: 'Nvidia put Megaspeed on its "no sell" list only in June 2025.', source: 'NYT, via Wikipedia', at: 'priority'}}), 'And just four days after that, MegaSpeed became an official Nvidia cloud partner,'), cap(I('chip', 'PRIORITY ACCESS.', undefined, 'facts'), "which meant priority access to Nvidia's chips.")],
  /*38*/ T('THE NUMBERS.', 'facts'),
  /*39*/ ST(['$33M'], '2023 ASSETS.', 'MegaSpeed, reportedly', undefined, 'facts'),
  /*40*/ ST(['$33M', '→', '$3B'], 'ONE YEAR LATER.', undefined, undefined, 'facts'),
  /*41*/ ST(['×90'], 'IN ONE YEAR.', undefined, undefined, 'facts'),
  /*42*/ [cap(MP({center: [104, 4], zoom: 0.9, pins: [KL], highlight: ['458'], title: 'SISTER COMPANY.'}), 'A sister company in Malaysia reportedly bought'), cap(ST(['$4.8B'], 'AI EQUIPMENT.', 'Almost all from Nvidia', undefined, 'facts'), 'at least 4.8 billion dollars of advanced AI equipment, almost all of it from Nvidia.')],
  /*43*/ [cap(src(T('THE INFORMATION.', 'danger'), 'The Information, investigation'), 'According to an investigation by The Information, Alice used her companies, and her connection to Jensen,'), cap(src(EM({title: 'CHIPS TO CHINA.', sub: 'Reported', mood: 'danger', nodes: [{id: 'nvidia', at: 'Nvidia'}, {id: 'sister', dim: true}, {id: 'china', at: 'Chinese'}], links: [{from: 'nvidia', to: 'sister', label: 'CHIPS', at: 'billion'}, {from: 'sister', to: 'china', label: 'AT LEAST $5B', at: 'Chinese'}], badge: {value: 5, prefix: '$', suffix: 'B+', sub: 'WORTH OF NVIDIA CHIPS', at: '5 billion'}}), 'The Information, investigation'), "to help move at least 5 billion dollars' worth of Nvidia chips to Chinese companies.")],
  /*44*/ [cap(H(undefined, 'BLOOMBERG', 'DEC 2025', 'Nvidia Buyer Megaspeed Faces Smuggling Probe', 'Smuggling Probe', 'https://www.youtube.com/watch?v=vfrQtabNYYE', 'danger'), 'And according to Bloomberg,'), cap(src(ST(['500'], 'CHIPS MISSING.', 'Not found in its data centers', undefined, 'danger'), 'Bloomberg'), 'at least 500 chips that MegaSpeed imported could not be found in its data centers at all.')],
  /*45*/ I('boxes', 'THE SEALED BOXES.', 'Malaysia', 'context'),

  // 04 — THE FALL
  /*46*/ I('radar', 'ON THE RADAR.', 'MegaSpeed. Then Alice.'),
  /*47*/ I('radar', 'SURVEILLANCE.', 'Close to an American citizen…'),
  /*48*/ P([JENSEN], 'THE AMERICAN.', 'danger'),
  /*49*/ [cap(TL([{label: 'OCT 2025', sub: 'Trump briefed'}], 'THE WARNINGS.'), 'In October 2025, US intelligence officials reportedly briefed President Trump'), cap(I('whitehouse', 'THE WHITE HOUSE KNEW.'), 'about the relationship.')],
  /*50*/ [cap(P([RUBIO], 'SECOND WARNING.'), 'In May 2026, Secretary of State Marco Rubio'), cap(TL([{label: 'OCT 2025', sub: 'Trump briefed'}, {label: 'MAY 2026', sub: 'Rubio memo'}], 'THE MEMO.'), 'reportedly warned Trump again, in a memo.')],
  /*51*/ TL([{label: 'OCT 2025', sub: 'Trump briefed'}, {label: 'MAY 2026', sub: 'Rubio memo'}, {label: 'OCT 29, 2026', sub: 'NYT story'}], 'THE STORY BREAKS.', 'danger'),
  /*52*/ T('DENIED.', 'danger'),
  /*53*/ [cap(I('letter', 'THE LETTER.', 'To all employees'), 'A few days later, Jensen sent a letter to his employees.'), cap(T('ADMITTED.', 'danger'), 'He admitted he had been unfaithful to his wife. He said he had no excuse.')],
  /*54*/ CA(['NO MENTION OF ALICE', 'NO MENTION OF SPYING'], 'WHAT IT LEFT OUT.'),
  /*55*/ H('tp7qrTAT33k', 'NBC NEWS', 'NOV 2026', 'New report alleges that Jensen Huang had relationship with an Nvidia executive', 'Nvidia executive', 'https://www.youtube.com/watch?v=tp7qrTAT33k', 'danger'),
  /*56*/ T('A THIRD WOMAN.', 'danger'),
  /*57*/ CHART({from: '2026-10-06', to: '2026-11-12', counter: true, title: 'FALLING FAST.', sub: 'NVDA from its Oct 6 peak', mood: 'danger', pins: [{date: '2026-10-06', label: 'OCT 6 · CLOSE $239'}, {date: '2026-10-29', label: 'OCT 29 · NYT STORY'}, {date: '2026-11-12', label: 'NOV 12 · RESIGNS'}]}),
  /*58*/ [cap(H('CU1I2a-FF7E', 'REUTERS', 'NOV 12, 2026', 'Nvidia CEO Jensen Huang resigns', 'resigns', 'https://www.youtube.com/watch?v=CU1I2a-FF7E', 'danger'), 'And on the morning of November 12th, Jensen Huang resigned from everything.'), cap(CA(['CEO', 'PRESIDENT', 'BOARD'], 'ALL OF IT.', 'danger'), 'CEO. President. The board.')],

  // 05 — THE COMEBACK
  /*59*/ T('NOT THE END.'),
  /*60*/ [cap(I('petition', 'THE PETITION.'), 'A petition to bring him back collected more than 18,800 signatures.'), cap(P([MUSK], 'PUBLIC SUPPORT.'), 'Big names, including Elon Musk, publicly backed him.')],
  /*61*/ H('H9WkFiY7Shk', 'REUTERS', 'NOV 2026', "Nvidia board shuts door on Jensen Huang's return as CEO", 'shuts door', 'https://www.youtube.com/watch?v=H9WkFiY7Shk'),
  /*62*/ H('GDMYaHcEPyc', 'BLOOMBERG', 'NOV 2026', 'Nvidia Reinstates Jensen Huang as CEO', 'Reinstates', 'https://www.youtube.com/watch?v=GDMYaHcEPyc', 'facts'),
  /*63*/ [cap(I('whitehouse', 'SENIOR US OFFICIALS.', 'Consulted by the board', 'facts'), 'The board said it had spoken with senior officials in the US government,'), cap(SP('RETURN', '≠', 'THREAT', 'THE BOARD SAYS.', 'facts'), 'and was confident his return posed no threat to national security.')],
  /*64*/ [cap(P([JENSEN], '"I HAD NO IDEA."'), 'Earlier, according to reports, Jensen had told Trump he had no idea Alice might be a spy.'), cap(P([TRUMP], '"STAY ON."'), 'And Trump allegedly told him he should stay on as CEO.')],
  /*65*/ TL([{label: 'NOV 12', sub: 'OUT'}, {label: 'NOV 22', sub: 'BACK'}], 'FIRED. REHIRED.'),
  /*66*/ T('TEN DAYS.', 'danger', true),

  // 06 — THE TWIST
  /*67*/ T('THE PART MOST PEOPLE MISS.'),
  /*68*/ P([ALICE], 'IS SHE EVEN A SPY?'),
  /*69*/ T('NOBODY HAS PROVEN IT.', 'facts'),
  /*70*/ [cap(src(I('capitol', 'JUSTICE DEPT: NO CONCLUSION.', undefined, 'facts'), 'Attorney General Todd Blanche'), 'The US Attorney General, Todd Blanche, has said the Justice Department'), cap(src(T('NO CONCLUSION.', 'facts'), 'Attorney General Todd Blanche'), 'has not reached a conclusion on whether she is a spy.')],
  /*71*/ src(SP('CIA', '≠', 'PROOF', 'AS OF NOV 19.', 'facts'), 'CIA, as reported'),
  /*72*/ [cap(H('s9Zvkl_cYX4', 'REUTERS', 'NOV 2026', "Images that trace Jensen Huang's relationship with Alice Huang", 'Images', 'https://www.youtube.com/watch?v=s9Zvkl_cYX4'), 'Remember those public photos?'), cap(T('A SPY… ON SOCIAL MEDIA?', 'context'), 'Some people ask: if she were a trained spy, why would her relationship with the most watched CEO in tech be all over social media?')],
  /*73*/ T('WHERE DID THE SPY STORY COME FROM?'),
  /*74*/ I('capitol', 'A FIGHT INSIDE.', 'The US government'),
  /*75*/ [cap(P([JENSEN], 'SIDE 1: SELL TO CHINA.'), 'On one side: Jensen Huang. He has said publicly, many times, that he wants to sell more chips to China.'), cap(I('whitehouse', 'RULES LOOSENED.'), 'And with his access to Trump, some restrictions were loosened.'), cap(ST(['15–25%'], 'THE CUT.', 'Paid to the US government on some China sales', undefined, 'facts'), 'Trump even allowed certain chip sales to China, if Nvidia paid the US government a cut of 15 to 25 percent.')],
  /*76*/ P([JENSEN, RUBIO], 'SIDE 2: THE HAWKS.', 'danger'),
  /*77*/ I('letter', "RUBIO'S MEMO.", 'First to say "spy," reportedly', 'danger'),
  /*78*/ [cap(T("HERE'S THE TWIST.", 'danger'), "But here's the twist."), cap(SP('CIA REPORT', '≠', '"SPY"', 'NEVER SAID IT.', 'facts'), 'The CIA report behind that memo reportedly never said she was a spy.'), cap(T("RUBIO'S OWN CALL.", 'facts'), "That conclusion was Rubio's own assessment.")],
  /*79*/ T('A REAL SPY CASE?'),
  /*80*/ SP('SPY CASE', 'OR', 'WEAPON', 'YOU DECIDE.', 'danger'),

  // 07 — THREE SEPARATE ISSUES
  /*81*/ CA(['CONDUCT', 'CONFLICT OF INTEREST', 'TRADE WAR'], 'THREE ISSUES.', 'facts'),
  /*82*/ T('1. CONDUCT.', 'facts'),
  /*83*/ [cap(I('letter', 'ADMITTED.', undefined, 'facts'), 'Jensen admitted he cheated on his wife.'), cap(SP('CEO', '+', 'STAFF', 'WORKPLACE ETHICS.', 'facts'), "But two of the reported relationships were with Nvidia employees. When a CEO has relationships with his own staff, that's a serious question of workplace ethics."), cap(T('NOT A THEORY.', 'facts'), 'That part is not a theory.')],
  /*84*/ T('2. CONFLICT OF INTEREST.', 'facts'),
  /*85*/ [cap(SP('MEGASPEED', '+', 'NVIDIA', 'SPY OR NOT…', 'facts'), 'Spy or not, a company linked to the woman he was involved with got Nvidia partner status and billions of dollars in chips.'), cap(I('scales', 'NEEDS A FULL INVESTIGATION.', undefined, 'facts'), 'That is a clear conflict of interest, and it deserves a full investigation.')],
  /*86*/ T('3. THE TRADE WAR.', 'facts'),
  /*87*/ I('scales', 'DOUBLE STANDARD.'),
  /*88*/ [cap(T('"OPEN YOUR MARKETS."'), 'The US constantly tells other countries to open their markets and remove trade barriers.'), cap(MP({center: [79, 22], zoom: 0.4, highlight: ['356'], title: '"CUT YOUR TARIFFS."'}), 'It pressures countries like India to cut tariffs on American goods.')],
  /*89*/ I('doorShut', 'BUT NOT FOR CHINA.', undefined, 'danger'),
  /*90*/ T('FREE TRADE: ONE WAY?', 'danger'),

  // 08 — WHO PROFITED?
  /*91*/ T('THE THEORY.', 'danger'),
  /*92*/ I('chartV', 'STOCK MANIPULATION?', undefined, 'danger'),
  /*93*/ [cap(CHART({from: '2026-10-06', to: '2026-11-24', counter: true, title: 'DOWN. THEN UP.', mood: 'danger', pins: [{date: '2026-10-06', label: 'PEAK CLOSE $239'}, {date: '2026-11-12', label: 'RESIGNS'}, {date: '2026-11-20', label: 'LOW CLOSE $125'}], slam: {date: '2026-11-23', big: '+31.5%', sub: '+$952B IN ONE DAY', tag: 'LARGEST ONE-DAY GAIN ON RECORD'}}), 'The stock fell hard during the scandal, and jumped sharply when Jensen came back.'), cap(T('BUY THE BOTTOM?', 'facts'), 'Anyone who bought at the bottom could have made a fortune in days.')],
  /*94*/ T('NO ONE HAS BEEN ACCUSED.', 'facts'),
  /*95*/ [cap(I('magnifier', 'REGULATORS WATCH.', undefined, 'facts'), 'Big swings like this usually get regulators looking for unusual trades.'), cap(T('IF THEY FIND SOMETHING…', 'facts'), 'If they find something, it will be a much bigger story.')],
  /*96*/ T('WHO LEAKED IT? UNKNOWN.', 'context'),

  // 09 — THE FORECAST
  /*97*/ T('OUR FORECAST.', 'facts'),
  /*98*/ P([JENSEN], 'STAYS CEO THROUGH 2027.', 'facts'),
  /*99*/ SP('CHIPS', '→', 'CHINA', 'THE FIGHT GETS LOUDER.', 'facts'),
  /*100*/ T('3 SIGNALS.', 'facts'),
  /*101*/ CA(['CIA / DOJ VERDICT'], 'SIGNAL 1.', 'facts'),
  /*102*/ CA(['CIA / DOJ VERDICT', 'MEGASPEED CHARGES?'], 'SIGNAL 2.', 'facts'),
  /*103*/ [cap(CA(['CIA / DOJ VERDICT', 'MEGASPEED CHARGES?', 'NEXT CHINA CHIP DECISION'], 'SIGNAL 3.', 'facts'), 'Three: the next decision on chip sales to China.'), cap(P([JENSEN, RUBIO], 'WHO REALLY WON?', 'facts'), "Because whoever wins that fight, Jensen's camp or the hawks, will tell you who really won this scandal.")],
  /*104*/ T('YOUR TURN.'),
  /*105*/ SP('SPY CASE', 'OR', 'WEAPON', 'WHAT DO YOU THINK?', 'danger'),
  /*106*/ T('COMMENT YOUR FORECAST.'),
  /*107*/ I('folder', 'SUBSCRIBE.', 'See what\'s coming before the headlines'),
  /*108*/ I('folder', 'FILE CLOSED.'),
];

// Facts found AFTER the voice was recorded go on screen as sourced, hedged callouts (director note 8). See episodes/003-nvidia-ceo-scandal/fact-check.md.
const UPDATES: Record<number, {part?: number; lines: string[]}> = {
  40: {lines: ['NUMBERS NOT VERIFIED.', 'NYT (Nov 18): Megaspeed bought', '$4B+ of Nvidia chips.']},
  50: {part: 1, lines: ['LATER REPORTS: memo dated', 'Mar 30. Trump briefed in May.']},
  60: {part: 0, lines: ['LATER REPORTS: 178,000+', 'signatures by Nov 16.']},
  62: {lines: ['Vote Nov 22 (SEC filing),', 'announced Nov 23.', 'Some outlets count 11 days.']},
  71: {lines: ['NYT/ABC/WSJ, Nov 22-23:', 'contact with a Chinese', 'intelligence officer reported.', 'Not proven she passed secrets.']},
};
const withUpdates = (x: Spec | Spec[], i: number): Spec | Spec[] => {
  const u = UPDATES[i]; if (!u) return x;
  const add = (sp: Spec): Spec => (sp.template === 'recipe' && (sp as any).recipe === 'compose'
    ? ({...sp, items: [...(sp as any).items, {p: 'letter', x: 1500, y: 130 + ((114 + 46 * u.lines.length) * 1.3) / 2, s: 1.3, w: 520, header: 'UPDATE SINCE RECORDING', lines: u.lines, hl: [], at: 1.0}]} as Spec) : sp);
  return Array.isArray(x) ? x.map((sp, k) => (u.part === undefined || u.part === k ? add(sp) : sp)) : add(x);
};

const STAKES = {p: 'ribbon', x: 1820, y: 152, text: 'NVIDIA CEO · OUT NOV 12 · BACK NOV 22', at: 0};
const withStakes = (x: Spec | Spec[], i: number): Spec | Spec[] => {
  if (i > 9) return x;
  const f = (sp: Spec): Spec => (sp.template === 'recipe' && (sp as any).recipe === 'compose' ? ({...sp, items: [...(sp as any).items, STAKES]} as Spec) : sp);
  return Array.isArray(x) ? x.map(f) : f(x);
};
const SPECS: (Spec | Spec[])[] = SPECS_BASE.map((sp, i) => withUpdates(withStakes(i === 37 ? [(sp as Spec[])[0], (NEW[37] as Spec[])[1]] : NEWF[i] ? NEWF[i](sp as Spec[]) : NEW[i] ?? sp, i), i));


const CHAPTERS: [number, string, Mood][] = [
  [0, '00 / THE SEALED BOXES', 'context'], [12, '01 / WHY THESE CHIPS MATTER', 'context'], [21, '02 / THE WOMAN WITH NO PAST', 'context'],
  [33, '03 / FOLLOW THE CHIPS', 'facts'], [46, '04 / THE FALL', 'danger'], [59, '05 / THE COMEBACK', 'context'], [67, '06 / THE TWIST', 'context'],
  [81, '07 / THREE ISSUES', 'facts'], [91, '08 / WHO PROFITED?', 'danger'], [97, '09 / THE FORECAST', 'facts'],
];

const KEY = /^(nvidia|nvidia's|china|china's|chinese|jensen|jensen's|alice|megaspeed|megaspeed's|cia|trump|rubio|rubio's|spy|spy\?|chips|chip|sealed|billion|million|weapons|ai|white|house|board|resigned|back|petition|twist|legend|confirmed|proven|conflict|manipulation|forecast|comments)[.,?!"]*$/i;

// Big moments that get riser → drop-out → hit in the audio mix: [kind, part of the line (default 0)]
const FX: Record<number, ['reveal' | 'twist', number?]> = {
  3: ['reveal'],      // "STILL SEALED."
  9: ['reveal'],      // "…get it back."
  41: ['reveal'],     // ×90
  43: ['reveal', 1],  // $5B+
  44: ['reveal', 1],  // 500 chips missing
  48: ['reveal'],     // "That American was Jensen Huang."
  66: ['reveal'],     // "TEN DAYS."
  69: ['twist'],      // "NOBODY HAS PROVEN IT."
  78: ['twist'],      // "HERE'S THE TWIST."
  94: ['twist'],      // "NO ONE HAS BEEN ACCUSED."
};

type Line = {text: string; start: number; speechEnd: number; next: number};

export const buildEp003 = (): Scene[] => {
  const t = TIMING as Line[];
  if (t.length !== SPECS.length) throw new Error(`timing has ${t.length} lines, specs ${SPECS.length}`);
  const out: Scene[] = [];
  t.forEach((line, i) => {
    const ch = [...CHAPTERS].reverse().find(([s]) => i >= s)!;
    const end = i + 1 < t.length ? t[i + 1].start : line.next;
    const start = i === 0 ? 0 : line.start;
    const speech = line.speechEnd - line.start;
    const parts = Array.isArray(SPECS[i]) ? (SPECS[i] as Spec[]) : [{...(SPECS[i] as Spec), cap: line.text}];
    const joined = parts.map((p) => p.cap ?? line.text).join(' ');
    if (joined !== line.text) throw new Error(`Line ${i}: split captions don't match the narration.\n  got:  ${joined}\n  want: ${line.text}`);
    const lens = parts.map((p) => (p.cap ?? line.text).length);
    const total = lens.reduce((a, b) => a + b, 0);
    let cursor = line.start;
    parts.forEach((p, k) => {
      const share = speech * (lens[k] / total);
      const pStart = k === 0 ? start : cursor;
      const pEnd = k === parts.length - 1 ? end : cursor + share;
      const words = (p.cap ?? line.text).split(' ');
      const {cap: _c, ...rest} = p;
      out.push({
        ...(rest as any),
        mood: p.mood ?? ch[2],
        chapter: ch[1],
        caption: p.cap ?? line.text,
        highlight: p.highlight ?? words.filter((w) => KEY.test(w) || /\d/.test(w)),
        seconds: pEnd - pStart,
        speak: share + (k === 0 ? line.start - start : 0),
        line: i,
        part: k,
        fx: FX[i] && (FX[i][1] ?? 0) === k ? FX[i][0] : undefined,
      } as Scene);
      cursor += share;
    });
  });
  return out;
};
