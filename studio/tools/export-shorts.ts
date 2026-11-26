// Dumps each Short's voice plan and sound events for the mixer: npx tsx tools/export-shorts.ts out/shorts.json
import {writeFileSync} from 'node:fs';
import {SHORTS_EP003} from '../src/data/shorts-ep003';
import {COMPOSE} from '../src/props/Compose';

const out = SHORTS_EP003.map((s) => {
  let t = 0; const events: any[] = []; const scenes: any[] = [];
  s.scenes.forEach((sc: any, i: number) => {
    scenes.push({start: +t.toFixed(3), seconds: +sc.seconds.toFixed(3), title: sc.title});
    for (const e of COMPOSE.events(sc)) events.push({...e, t: +(t + e.t).toFixed(3)});
    if (i > 0) events.push({t: +(t + 0.02).toFixed(3), kind: 'whoosh', db: -24, v: i});
    t += sc.seconds;
  });
  events.push({t: 0.12, kind: 'impact', db: -9, v: 1});
  return {id: s.id, total: +t.toFixed(3), voice: s.voice, events, scenes};
});
writeFileSync(process.argv[2] ?? 'out/shorts.json', JSON.stringify(out, null, 1));
console.log(out.map((o) => `${o.id}: ${o.total.toFixed(1)} s, ${o.events.length} events`).join('\n'));
