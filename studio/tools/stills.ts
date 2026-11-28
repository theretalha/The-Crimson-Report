// Renders KEYFRAME STILLS for owner approval (AGENTS.md stage 3). One bundle, one browser, many stills.
//   npx remotion bundle src/index.ts --out-dir=out/_bundle
//   npx tsx tools/stills.ts EP004 out/ep004-cues.json out/ep004/stills [--all]
// Default set: every scene that uses a CUSTOM prop, the first scene of each chapter, and every 6th scene. --all = every scene.
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';

const [id, cuesPath, outDir, flag] = process.argv.slice(2);
if (!id || !cuesPath || !outDir) { console.error('usage: npx tsx tools/stills.ts <comp-id> <cues.json> <outDir> [--all]'); process.exit(2); }
const cues: any[] = JSON.parse(readFileSync(cuesPath, 'utf8')).cues;
mkdirSync(outDir, {recursive: true});
let lastChapter = '';
const pick = cues.filter((c, i) => { const first = c.chapter !== lastChapter; lastChapter = c.chapter; return flag === '--all' || c.hasCustom || first || i % 6 === 0; });
(async () => {
  const browser = await openBrowser('chrome', {browserExecutable: process.env.CRIMSON_BROWSER ?? null, chromiumOptions: {}});
  const composition = await selectComposition({serveUrl: 'out/_bundle', id, puppeteerInstance: browser});
  const rows: string[] = ['# Keyframe stills for approval', '', '| file | scene | line | chapter | custom props | caption |', '|---|---|---|---|---|---|'];
  for (const c of pick) {
    const name = `s${String(c.i).padStart(3, '0')}${c.hasCustom ? '-custom' : ''}.png`;
    await renderStill({composition, serveUrl: 'out/_bundle', output: `${outDir}/${name}`, frame: Math.min(c.keyframe, composition.durationInFrames - 1), puppeteerInstance: browser});
    rows.push(`| ${name} | ${c.i} | ${c.line} | ${c.chapter} | ${(c.items ?? []).filter((x: any) => x.custom).map((x: any) => x.p).join(', ') || '-'} | ${String(c.caption).slice(0, 60)} |`);
    console.log(`still ${name}`);
  }
  writeFileSync(`${outDir}/INDEX.md`, rows.join('\n') + '\n');
  await browser.close({silent: true});
  console.log(`${pick.length} stills in ${outDir} (see INDEX.md)`);
})();
