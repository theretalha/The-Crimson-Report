// Exports the scene timeline for the audio mixer: npx tsx tools/export-cues.ts out/ep003-cues.json
import {writeFileSync} from 'node:fs';
import {buildEp003} from '../src/data/ep003';

const scenes = buildEp003();
let t = 0;
const cues = scenes.map((s: any, i: number) => {
  const n = s.photos?.length ?? s.points?.length ?? s.cards?.length ?? s.parts?.length ?? s.pins?.length ?? 0;
  const cue = {i, start: +t.toFixed(3), dur: +s.seconds.toFixed(3), template: s.template, mood: s.mood, chapter: s.chapter, fx: s.fx ?? null, line: s.line, part: s.part, n, glitch: !!s.glitch};
  t += s.seconds;
  return cue;
});
writeFileSync(process.argv[2] ?? 'out/cues.json', JSON.stringify({total: +t.toFixed(3), cues}, null, 1));
console.log(`${cues.length} cues, ${t.toFixed(2)} s -> ${process.argv[2] ?? 'out/cues.json'}`);
