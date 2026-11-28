import type {Scene} from '../types';

// Reference scene for the CUSTOM prop system (src/props/custom). Render a still to see it:
//   npx remotion still src/index.ts Example-CustomProp out/example-tanker.png --frame=75
// A real episode's data file (src/data/epNNN.ts) passes items like this: {p: 'epNNN.<slug>', x, y, at: '<narrated word>'}.
export const EXAMPLE_CUSTOM: Scene[] = [{
  template: 'recipe', recipe: 'compose', mood: 'context', chapter: 'EXAMPLE / CUSTOM PROP',
  title: 'ONE TANKER, ONE STRAIT', sub: 'Reference scene for src/props/custom', source: 'Illustration',
  caption: 'A tanker sat anchored near the shore, engines off.', seconds: 4, speak: 3.4, line: 0, part: 0,
  items: [
    {p: 'example.tanker', x: 960, y: 640, at: 'tanker', label: 'ILLUSTRATION', s: 1.5},
    {p: 'tag', x: 960, y: 770, text: 'ENGINES OFF', at: 'engines'},
  ],
} as any];
