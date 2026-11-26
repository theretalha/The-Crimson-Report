// Dumps the full scene data (every visual field) so the segment renderer can hash it: npx tsx tools/export-scenes.ts out/ep003-scenes.json
import {writeFileSync} from 'node:fs';
import {buildEp003} from '../src/data/ep003';
writeFileSync(process.argv[2] ?? 'out/ep003-scenes.json', JSON.stringify(buildEp003()));
