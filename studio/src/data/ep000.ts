import type {Scene} from '../types';

// EP 000: pipeline self-test fixture (never published). Shows the shape every epNNN.ts must have: export const build = (): Scene[].
// One compose scene per narration line; items appear on the narrated word `at`. Custom props use their id as `p`.
const LINES = [
  'A tanker sat anchored near the shore, and its engines were off.',
  'The captain stood alone on deck, and nobody answered the radio.',
  'A man in a grey coat walked down the pier with a sealed envelope.',
  'Reportedly, the captain had sold the cargo to a Chinese firm, according to Reuters.',
];
const S = (line: number, title: string, items: any[], source?: string): Scene => ({
  template: 'recipe', recipe: 'compose', mood: 'context', chapter: '00 / THE PIER', title, caption: LINES[line], source,
  seconds: 4, speak: 3.4, line, part: 0, items,
} as any);

export const build = (): Scene[] => [
  S(0, 'THE TANKER', [{p: 'example.tanker', x: 960, y: 640, at: 'tanker', label: 'ILLUSTRATION', s: 1.4}, {p: 'tag', x: 960, y: 770, text: 'ENGINES OFF', at: 'engines'}], 'Illustration'),
  S(1, 'THE CAPTAIN', [{p: 'person', x: 960, y: 700, at: 'captain', name: 'CAPTAIN', role: 'ILLUSTRATION', s: 1.5}]),
  S(2, 'THE ENVELOPE', [{p: 'person', x: 620, y: 700, at: 'man', fromX: 400, s: 1.4}, {p: 'letter', x: 1250, y: 520, at: 'envelope', header: 'SEALED ENVELOPE', lines: ['ONE PAGE', 'A NAME', 'A PORT']}]),
  S(3, 'THE SALE', [{p: 'person', x: 560, y: 700, at: 'captain', name: 'CAPTAIN', s: 1.3}, {p: 'money', x: 760, y: 560, x2: 1360, y2: 560, at: 'sold', text: 'CARGO'},
    {p: 'ribbon', x: 1860, y: 250, text: 'ACCORDING TO REPORTS', at: 'Reportedly'}], 'Reuters (fixture)'),
];
