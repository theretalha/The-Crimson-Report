import type {Scene} from '../types';

// SHORT 001 — "China's 2027 Deadline" (vertical, ~40s)
// Every headline and quote below is real. The url field is the proof: keep it.
const CH = 'SHORT · TAIWAN 2027';

export const SHORT_001: Scene[] = [
  {
    template: 'title', mood: 'context', chapter: CH, big: '2027.', glitch: true,
    caption: 'The Pentagon has a date circled for a possible war.',
    highlight: ['Pentagon', 'war.'], seconds: 3.2,
  },
  {
    template: 'document', mood: 'context', chapter: CH,
    docTitle: 'Senate Armed Services Committee', docMeta: 'Hearing: US Indo-Pacific Command · Mar 9, 2021',
    quote: '“I think the threat is manifest during this decade, in fact, in the next six years.”',
    mark: 'in the next six years',
    url: 'https://www.armed-services.senate.gov/hearings/21-03-09-united-states-indo-pacific-command',
    caption: "In 2021, America's top admiral in the Pacific warned Congress",
    highlight: ['admiral', 'Congress'], source: 'Adm. Philip Davidson · Senate testimony · Mar 9, 2021', seconds: 4.4,
  },
  {
    template: 'headline', mood: 'context', chapter: CH,
    outlet: 'WION', date: '2021', image: 'clips/1lova3nVdyU.jpg',
    headline: 'Top US Commander fears Chinese invasion in Taiwan in next 6 years', mark: 'next 6 years',
    url: 'https://www.youtube.com/watch?v=1lova3nVdyU',
    caption: 'that China could move on Taiwan within six years.',
    highlight: ['Taiwan', 'six', 'years.'], source: 'WION via YouTube', seconds: 3.8,
  },
  {
    template: 'map', mood: 'context', chapter: CH, label: 'TAIWAN',
    title: '100 MILES.', sub: 'That’s all that separates them.',
    caption: "Taiwan sits just one hundred miles off China's coast.",
    highlight: ['hundred', 'miles'], seconds: 3.4,
  },
  {
    template: 'headline', mood: 'danger', chapter: CH,
    outlet: 'ABC NEWS (AUSTRALIA)', date: 'VIA YOUTUBE', image: 'clips/-sXI4bHxTxo.jpg',
    headline: "Xi Jinping wants China to be 'prepared' for invasion of Taiwan by 2027", mark: 'invasion of Taiwan by 2027',
    url: 'https://www.youtube.com/watch?v=-sXI4bHxTxo',
    caption: 'Then the CIA director said Xi wants his military ready to invade by 2027.',
    highlight: ['CIA', 'invade', '2027.'], source: 'ABC News (Australia) via YouTube · CIA Dir. Burns, Feb 2023', seconds: 4.8,
  },
  {
    template: 'stat', mood: 'facts', chapter: CH, parts: ['~90%'],
    title: 'WHY TAIWAN?', sub: 'Share of the world’s most advanced chips.',
    caption: "Why Taiwan? It makes about ninety percent of the world's most advanced chips.",
    highlight: ['ninety', 'percent', 'chips.'], source: 'Industry estimates (TrendForce, BCG/SIA)', seconds: 4.6,
  },
  {
    template: 'icon', mood: 'danger', chapter: CH, icon: 'phoneChip',
    title: 'INCLUDING YOURS.',
    caption: 'Including the one in your phone.',
    highlight: ['your', 'phone.'], seconds: 2.6,
  },
  {
    template: 'headline', mood: 'danger', chapter: CH,
    outlet: 'NTD · CHINA IN FOCUS', date: 'VIA YOUTUBE', image: 'clips/NVm3gmqLg0o.jpg',
    headline: 'Report: War on Taiwan Could Cost the Globe $10 Trillion', mark: '$10 Trillion',
    url: 'https://www.youtube.com/watch?v=NVm3gmqLg0o',
    caption: 'One estimate says a war could cost the world ten trillion dollars.',
    highlight: ['ten', 'trillion', 'dollars.'], source: 'Estimate: Bloomberg Economics, Jan 2024', seconds: 4.4,
  },
  {
    template: 'split', mood: 'facts', chapter: CH, left: 'READY', right: 'WILL', sign: '≠',
    title: 'BUT…',
    caption: "But ready doesn't mean they will.",
    highlight: ['ready', 'will.'], seconds: 2.8,
  },
  {
    template: 'cards', mood: 'context', chapter: CH, cards: ['YES. AMERICA STEPS IN.', 'NO. STAY OUT.'],
    title: 'YOUR FORECAST?',
    caption: 'So if China moves, should America step in? Comment your forecast.',
    highlight: ['America', 'Comment'], seconds: 5,
  },
  {
    template: 'icon', mood: 'context', chapter: CH, icon: 'folder',
    title: 'FOLLOW FOR FILE 003.',
    caption: 'Follow for the full file.',
    highlight: ['Follow', 'file.'], seconds: 2.4,
  },
];
