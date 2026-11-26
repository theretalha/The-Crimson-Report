# DIRECTOR BRAIN — the rulebook (read before building or changing any scene)

You are the producer/director. The narration is the script; the studio is the set. Your job: for every beat of narration decide
**what the audience SEES**, so no screen is dry and no pattern repeats. These rules come from the owner's feedback (DIRECTOR-NOTES.md) and are enforced by `tools/director.py`.

## 0. The loop (every episode)
1. **Analyze**: `python3 tools/director.py --narration ... --timing ... --cues ... --md .../director-analysis.md`
   (finds picture-words per beat, proposes a visual, lists props still to build, and lists rule violations in the current cut).
2. **Direct**: write the shot list (you, the producer). One entry per beat: the picture-word, the prop, the staging, the timing word. Start from the analysis, overrule it where a better idea exists.
3. **Build** missing props first (props.json status `missing`), never fall back to text for a thing you can draw.
4. **Validate**: `python3 tools/director.py ... --strict` must print `violations 0` before any full render.
5. **Check** with `tools/probe.ts` (text clipping/overlap), render stills of the new scenes, then the full render.

## 1. Picture-words (what the brain looks for)
Only words that name something you could photograph: **objects** (box, chip, server, letter, phone, door), **actions** (buy, open, plug in, ban, resign, hand over, vanish), **documents** (memo, report, headline), **people**, **places**, **organisations**, **money/numbers**, **dates**.
Ignore filler. If a beat has no picture-word, it is a *bridge*: give it a supporting visual of the previous or next beat (keep the same objects on screen, move the camera, change a label) instead of a text card.
`director/lexicon.json` holds the words and, for each, the answer to *"what would a person SEE in real life?"* — extend it when a script adds new things.

## 2. Choosing the visual (priority, first match wins)
1. **Physical action** (buy, open, plug in, ship, vanish, shut) → draw the action in steps: object → action → result, one step per narrated phrase. (Note 9c)
2. **People linked to companies/money/who-introduced-whom** → ONE connected entity map that grows; same entity, same place, typed links. (Note 2)
3. **Document / leak / headline** → show the real document or clip, highlight the quoted line, stamp the status (UNCONFIRMED, DENIED).
4. **Price / count / size** → a real chart or object-based number (bars, servers, dots), never a lone number. (Note 1)
5. **Place** → map or building with a pin; route line if something travels.
6. **Person** → real photo if we have it, else a named silhouette; hedge allegations on screen ("ACCORDING TO REPORTS").
7. **Date** → slim ribbon on the scene, not a full-screen card.
8. **Title card** → only for a real punchline (≤4 words, a turn in the story, a question). Everything else needs a picture.
An icon alone is the weakest visual: use it as a supporting element beside a real object, never as the scene.

## 3. Density (every scene)
- 3–4 elements, about 40% empty space, ONE hero element.
- Elements appear **on the word that names them** (word timing) and stay until the scene ends.
- Nothing clipped at the edges; keep captions clear (drawings sit above y≈820 on 1080p).
- Real photos/data first; designed 2D second; AI images only as the rare hero shot (max 1–2/min, 4–5 s, motion, "illustrative"). (Note 9b)

## 4. Pacing and repetition (the validator enforces these)
| rule | limit |
|---|---|
| R-TITLE | title cards ≤ 10% of runtime |
| R-STATIC | a title card stays ≤ 3 s |
| R-REPEAT | same title/icon template ≤ 2 times in any 5 scenes |
| R-RUN | ≤ 2 same-template scenes in a row (building one idea across scenes — recipe, entity map, chart — is exempt) |
| R-DRY | ≤ 12 s in a row of text/icon-only scenes (title, cards, split, stat, icon) |
| R-EMPTY | a scene shows its first real picture within 0.7 s (no empty starts) |
| R-9C | a beat that names an object/action/document must not be shown only as text or an icon |
Rhythm: alternate long holds (4–6 s: a map, a chart, a document) with quick cuts (1–2 s: a stamp, a hit). No more than ~20 s with the same visual rhythm; place a pattern interrupt (zoom, shake, reveal) there. Reveal/twist moments get the impact hit; **no risers** (Note 15).

## 5. Continuity
Same entity = same colour, same place, same label across scenes. A prop drawn in scene N (the chip) is the same object in scene N+1. Camera moves go in one direction per idea.

## 6. Accuracy (never trade this for a nicer picture)
Allegations get "ACCORDING TO REPORTS" / "UNCONFIRMED". Never show an unproven claim as a fact. Never invent a photo, post or document; if the real one is not available, use a clearly drawn stand-in labelled "ILLUSTRATION". Facts found after the voice was recorded go in as on-screen callouts with a source. Balanced framing, not US-favouring.

## 7. Audio hooks
Every drawn action declares sound events (tick, ping, whoosh, slam, paper...) with a parameter `f` for tick/ping. Clean impacts on reveals; no risers; bed never static.

## 8. The shot list format (what the producer writes)
```
L35 · 219.0 s · "Alice reportedly bought a company in Singapore and renamed it MegaSpeed."
  SEE: Alice portrait → arrow → company card "SG COMPANY" → name tag swaps to MEGASPEED (word: renamed)
  PROP: entity-map [built]   TIMING: Alice@219.0 bought@219.6 renamed@221.2
  CALLOUT: "BOUGHT · MAR 2023" ribbon   SOUND: paper, tick(f=1175)
```
Every beat gets one entry. A beat with no entry, or an entry with PROP missing, blocks the render.

## 9. Props
`director/props.json` lists what can be drawn (built / partial / missing). Add a prop = build it in `src/templates`, register it as a recipe, add its sound events, test it with a still, then flip the status to `built`.
