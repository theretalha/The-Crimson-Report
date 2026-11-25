import type {Scene} from '../types';

// EP 002 — "Why China Wants Taiwan by 2027" — Chapter 00 (the hook)
// Timings are estimates for ~150 words/min. Once the TTS audio exists,
// set each `seconds` to match the audio for that line.
const CH = '00 / THE 2027 PROBLEM';

export const EP002_HOOK: Scene[] = [
  {
    template: 'title', mood: 'context', chapter: CH, big: '2027.', glitch: true,
    caption: 'There is one year that keeps showing up',
    highlight: ['one', 'year'], seconds: 2.6,
    note: 'Hook in 0–3s: one big, mysterious thing. No logo, no intro.',
  },
  {
    template: 'icon', mood: 'context', chapter: CH, icon: 'pentagon',
    title: 'PENTAGON BRIEFINGS.', sub: 'Intelligence reports. War games.',
    caption: 'in Pentagon briefings, intelligence reports, and military war games.',
    highlight: ['Pentagon', 'war', 'games.'], seconds: 3.6,
    note: 'Authority signal: serious sources = viewer trusts the video.',
  },
  {
    template: 'quote', mood: 'context', chapter: CH, icon: 'admiral',
    quote: '"Within the next six years."', speaker: 'ADM. PHILIP DAVIDSON', role: 'Commander, US Indo-Pacific Command',
    title: 'THE WARNING.', sub: 'Told to Congress, 2021.',
    caption: 'In 2021, the top American admiral in the Pacific told Congress',
    highlight: ['2021,', 'admiral'],
    source: 'Senate Armed Services Committee testimony · Mar 9, 2021', seconds: 4,
    note: 'Real quote + source on screen = credibility (and fair use).',
  },
  {
    template: 'map', mood: 'context', chapter: CH, label: 'TAIWAN',
    title: 'CHINA → TAIWAN.', sub: 'About 100 miles of water.',
    caption: 'that China could try to take Taiwan within the next six years.',
    highlight: ['Taiwan', 'six', 'years.'], seconds: 3.8,
    note: 'Map = instant context. Viewers never feel lost.',
  },
  {
    template: 'stat', mood: 'facts', chapter: CH, parts: ['2021', '+ 6', '= 2027'],
    title: 'DO THE MATH.',
    caption: "Do the math. That's 2027.",
    highlight: ['2027.'], seconds: 3,
    note: 'Mood switch (dark → light) = pattern interrupt. Resets attention.',
  },
  {
    template: 'quote', mood: 'context', chapter: CH, icon: 'cia',
    quote: '"Ready by 2027."', speaker: 'WILLIAM BURNS', role: 'Director, CIA',
    title: 'THE ORDER.', sub: 'Two years later.',
    caption: 'Two years later, the director of the CIA said Xi Jinping had ordered his military to be ready to invade by 2027.',
    highlight: ['CIA', 'ready', 'invade', '2027.'],
    source: 'CIA Director William Burns · public remarks, Feb 2023', seconds: 5.6,
    note: 'Second authority stacks the stakes. Escalation keeps people watching.',
  },
  {
    template: 'split', mood: 'facts', chapter: CH, left: 'READY', right: 'WILL', sign: '≠',
    title: 'NOT THE SAME THING.',
    caption: "Now, being ready doesn't mean they will do it.",
    highlight: ['ready', 'will'], seconds: 2.8,
    note: 'Balance: we don’t fear-monger. Builds trust with US viewers.',
  },
  {
    template: 'title', mood: 'danger', chapter: CH, big: "BUT HERE'S THE THING…",
    caption: "But here's the thing.",
    highlight: ['thing.'], seconds: 2,
    note: 'Turn: “But here’s the thing” + crimson flash. Use every 60–90s.',
  },
  {
    template: 'icon', mood: 'danger', chapter: CH, icon: 'shelf',
    title: 'EMPTY SHELVES.', sub: 'In your local store.',
    caption: 'If it happens, it could empty shelves in your local store,',
    highlight: ['empty', 'shelves'], seconds: 3.2,
    note: 'Make it personal: “your” store. Far war → your life.',
  },
  {
    template: 'icon', mood: 'danger', chapter: CH, icon: 'crash',
    title: 'YOUR 401(K).', sub: 'Your retirement account.',
    caption: 'crash your retirement account,',
    highlight: ['crash'], seconds: 2.2,
    note: 'Fast cut (2s) = rhythm change. Short scenes feel urgent.',
  },
  {
    template: 'icon', mood: 'danger', chapter: CH, icon: 'phoneChip',
    title: 'THE CHIP IN YOUR HAND.', sub: 'Made in Taiwan.',
    caption: "and shut down the factory that made the chip inside the phone you're holding right now.",
    highlight: ['chip', 'phone', 'right', 'now.'], seconds: 4.4,
    note: '“The phone you’re holding right now” = direct address. Peak stakes.',
  },
  {
    template: 'cards', mood: 'context', chapter: CH, cards: ['WHY TAIWAN?', 'WHY 2027?', 'WHAT HAPPENS TO AMERICA?'],
    title: 'THREE QUESTIONS.',
    caption: 'So why does China want this island so badly? Why 2027? And what happens to America if it actually happens?',
    highlight: ['Why', '2027?', 'America'], seconds: 6,
    note: 'Open loops: 3 promised answers = reason to stay till the end.',
  },
  {
    template: 'icon', mood: 'context', chapter: CH, icon: 'folder',
    title: 'FORECAST FILE 002.', sub: 'China · Taiwan · 2027',
    caption: "Let's open the file.",
    highlight: ['open', 'file.'], seconds: 2.8,
    note: 'Series branding (“file”) = binge feeling across videos.',
  },
];
