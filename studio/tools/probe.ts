// QA: render one frame per scene and report text that is clipped by its card or cut off at the screen edge.
// Usage: npx remotion bundle src/index.ts --out-dir=out/_bundle && npx tsx tools/probe.ts out/probe-frames.txt [comp]
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import {readFileSync, writeFileSync} from 'node:fs';

const frames = readFileSync(process.argv[2] ?? 'out/probe-frames.txt', 'utf8').split('\n').filter(Boolean).map(Number);
const id = process.argv[3] ?? 'EP003-Nvidia';
const serveUrl = 'out/_bundle';
const browserExecutable = process.env.CRIMSON_BROWSER;
(async () => {
  const browser = await openBrowser('chrome', {browserExecutable: browserExecutable ?? null, chromiumOptions: {}});
  const inputProps = {probe: true};
  const composition = await selectComposition({serveUrl, id, inputProps, puppeteerInstance: browser});
  const bad: {scene: number; frame: number; issues: string[]}[] = [];
  for (let i = 0; i < frames.length; i++) {
    let got: any = null;
    await renderStill({composition, serveUrl, output: 'out/_probe.png', frame: frames[i], inputProps, puppeteerInstance: browser,
      onBrowserLog: (l: any) => { if (String(l.text).startsWith('PROBE_RESULT')) got = JSON.parse(String(l.text).slice(13)); }});
    if (got?.issues?.length) bad.push({scene: i, frame: frames[i], issues: got.issues});
    if (i % 20 === 0) console.log(`checked ${i}/${frames.length}`);
  }
  writeFileSync('out/probe-report.json', JSON.stringify(bad, null, 1));
  console.log(`\n${bad.length} scenes with text problems of ${frames.length}`);
  for (const b of bad) console.log(`scene ${b.scene} (frame ${b.frame}):\n   ` + b.issues.join('\n   '));
  await browser.close({silent: true});
})();
