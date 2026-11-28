// Generic exporter for NEW episodes (EP003 keeps its own export-cues.ts / export-scenes.ts, untouched).
//   npx tsx tools/export-ep.ts 004 out/ep004-cues.json out/ep004-scenes.json
// Reads src/data/ep004.ts, which must export `build(): Scene[]` (see AGENTS.md, stage 3). Writes:
//   cues   = same format as export-cues.ts PLUS per-scene `items` (compose items incl. custom props) and a `keyframe` frame for the stills gate
//   scenes = full scene data, so render_segments.py can hash it
import {writeFileSync, mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {RECIPES} from '../src/templates/Recipes';
import {chartEvents} from '../src/templates/StockChart';
import {entityEvents} from '../src/templates/EntityMap';
import {statEvents, timelineEvents} from '../src/templates/Upgraded';
import {CUSTOM} from '../src/props/custom';

const FPS = 30;
const [num, cuesOut = `out/ep${process.argv[2]}-cues.json`, scenesOut = `out/ep${process.argv[2]}-scenes.json`] = process.argv.slice(2);
if (!num || !/^\d{3}$/.test(num)) { console.error('usage: npx tsx tools/export-ep.ts NNN [cues.json] [scenes.json]'); process.exit(2); }

(async () => {
  const mod: any = await import(`../src/data/ep${num}`);
  const build = mod.build ?? mod[`buildEp${num}`];
  if (typeof build !== 'function') throw new Error(`src/data/ep${num}.ts must export build(): Scene[]`);
  const scenes: any[] = build();
  let t = 0;
  const cues = scenes.map((s: any, i: number) => {
    const n = s.photos?.length ?? s.points?.length ?? s.cards?.length ?? s.parts?.length ?? s.pins?.length ?? 0;
    const R: any = s.template === 'recipe' ? RECIPES[s.recipe] : null;
    const first = R?.firstReveal ? +R.firstReveal(s).toFixed(2) : null;
    const items = s.template === 'recipe' && s.recipe === 'compose'
      ? (s.items ?? []).map((it: any) => ({
          p: it.p, kind: it.kind ?? null, name: it.name ?? null, text: it.text ?? null, label: it.label ?? null, at: it.at ?? null,
          custom: CUSTOM[it.p] ? {id: it.p, evidence: CUSTOM[it.p].evidence, describes: CUSTOM[it.p].describes} : null,
        }))
      : [];
    // keyframe for the approval stills: 1.4 s after the scene's last custom prop appears, else 60 % through the scene
    const startF = Math.round(t * FPS);
    const durF = Math.max(1, Math.round(s.seconds * FPS));
    const hasCustom = items.some((x: any) => x.custom);
    const keyframe = startF + Math.min(durF - 1, hasCustom ? Math.round((first ?? 0.25) * FPS + 1.4 * FPS) : Math.round(durF * 0.6));
    const cue = {
      i, firstReveal: first, start: +t.toFixed(3), dur: +s.seconds.toFixed(3), template: s.template, mood: s.mood, chapter: s.chapter,
      fx: s.fx ?? null, line: s.line, part: s.part, n, glitch: !!s.glitch, caption: s.caption ?? '', source: s.source ?? null, title: s.title ?? null, items, keyframe, hasCustom,
      events: s.template === 'recipe' ? R.events(s) : s.template === 'chart' ? chartEvents(s, Math.round(s.seconds * FPS))
        : s.template === 'stat' ? statEvents(s) : s.template === 'timeline' ? timelineEvents(s) : s.template === 'entities' ? entityEvents(s) : [],
    };
    t += s.seconds;
    return cue;
  });
  mkdirSync(dirname(cuesOut), {recursive: true});
  writeFileSync(cuesOut, JSON.stringify({total: +t.toFixed(3), cues}, null, 1));
  writeFileSync(scenesOut, JSON.stringify(scenes));
  console.log(`${cues.length} cues, ${t.toFixed(2)} s -> ${cuesOut}`);
})();
