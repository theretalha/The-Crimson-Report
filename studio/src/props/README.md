# Scene composer (the director's shot list compiles to this)

A scene is `{template: 'recipe', recipe: 'compose', items: [...]}` (helper `CP(items, title, sub, mood, source)` in `src/data/ep003.ts`).
Each item sits on the 1920x1080 stage at `x,y` and appears on the narrated word `at` (a word from the caption, or seconds as a number, `0` = at once).
Keep drawings above y ~ 830 (captions sit at 890+). The mood decides ink colour: `facts` = cream page, others = dark page.

| item `p` | what | main fields |
|---|---|---|
| `building` | flat building with sign | `kind` datacenter, tower, office, bank, doj, commerce, treasury, whitehouse, capitol · `label` · `lit` |
| `person` | silhouette with name tape | `name`, `role`, `tie`, `badge`, `hat` |
| `card` | pinned photo card | `kind` photo (`src`, `fit:'meet'` for wide photos), person, building (`text` = building kind), text (`text`) · `name`, `role`, `dim`, `away` |
| `board`, `string` | corkboard + red string | `string` needs `from`/`to` card `id`s |
| `calendar` | flipping calendar | `flips`, `label`, `sub` |
| `chair` | empty executive chair | `name` |
| `crates`, `rack` | AI-chip crates; server rack with missing slots | `n`, `sealed` · `slots`, `missing:[i]`, `label` |
| `money`, `stack` | coins travelling between two points; growing coin stack | `x2,y2`, `text` · `n`, `label` |
| `route` | dotted route with moving crates | `x2,y2`, `a`, `b`, `blocked` |
| `letter` | memo / letter with typed lines | `header`, `lines`, `hl:[i]`, `strike:[i]` |
| `phone` | scrolling feed | `header`, `imgsrc` |
| `scales` | balance beam | `left`, `right`, `tilt` -1..1 |
| `door` | closing door, crate bounces | `label` |
| `table` | `kind:'board'` (boardroom, `hands`) or `'dinner'` | `n`, `hands` |
| `crowd` | counter + people dots | `total`, `label` |
| `tag`, `stamp`, `icon`, `arrow`, `text` | labels, rubber stamp, ProIcon, hand arrow, big text | `text`, `size`, `color`, `icon` |

Every item also declares its sound events (see `Compose.tsx` `COMPOSE.events`), so the mix follows the picture. Add a prop = add it to `art*.tsx`, the switch in `Compose.tsx`, its events, then flip its status in `director/props.json`.
Check: `python3 tools/director.py ... --strict` (rules) and `npx tsx tools/probe.ts` (text clipping; regenerate `out/probe-frames.txt` and run `export-cues.ts` with no argument first).

**Custom props:** anything this table cannot draw is NOT forced into one of these items. Code a new prop in `custom/epNNN/` (see `custom/README.md` and AGENTS.md section 1). Compose items reach it with `p: 'epNNN.slug'`.
