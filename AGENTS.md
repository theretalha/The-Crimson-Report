# AGENTS.md: The Crimson Forecast studio (read this first, every session)

The Crimson Forecast is a faceless YouTube documentary channel (geopolitics, macro, AI) for a US audience. The studio is `studio/` (Remotion + Python tools).
Episode documents live in `episodes/NNN-slug/`. This file is the contract for every future episode.

## 0. Hard boundaries
- **Never touch EP 003 or Curio.** Do not edit `episodes/003-*/`, `studio/src/data/ep003*`, or `studio/src/stickman/`. Reading them is fine.
- Shared tools (`director.py`, `mix_audio.py`, `render_segments.py`, `Compose.tsx`) may only be changed in ways that leave EP 003 behaving the same.
- Where work runs: the cloud session plans, writes and codes; the owner's laptop (Windows, 8 GB RAM) fetches assets, previews and renders. Git (`claude/...` branch) carries work between them, or the Remote Control link when it is connected.
- Read `studio/DIRECTOR-BRAIN.md`, `studio/DIRECTOR-NOTES.md`, `studio/TTS-TAGS.md` before building. The owner's feedback there outranks your taste.
- Owner rules that stay: authentic and balanced (not US-favouring), hedge every allegation, no sexual detail, never invent documents or photos, 2D done professionally, no AI-image shortcut, no risers, no constant hum, **never re-render the whole video for a small change**.

## 1. Zero irrelevant prop reuse + mandatory custom props
**Banned ("kaam chori"):** forcing a scene into an existing prop (`crates`, `rack`, `building`, a generic card, an icon) when that object is NOT physically named in the narration line. A prop on screen must be something the line says.

**Mandatory:** when a line names a specific physical object, mechanism or action that no built-in prop draws (naval blockade, destroyer, oil tanker, submarine cable, missile battery, semiconductor wafer, pipeline ...), you MUST code a new custom prop for that scene.

How to build one (`studio/src/props/custom/epNNN/`):
1. Copy the pattern from `studio/src/props/custom/_example/Tanker.tsx` (a working reference; render it with `npx remotion still src/index.ts Example-CustomProp out/x.png --frame=75`).
2. One file per prop, drawn around its own origin (ground at y = 0, about 500 px wide), using `src/props/custom/kit.ts`:
   - **draw-on strokes** (`drawOn`), **depth** (`groundShadowProps`, layered fills), **overshoot** (`overshoot`), an idle motion (`bob`) so a held prop is never frozen;
   - **sound events**: `events: (t) => [{t, kind: 'whoosh'|'tick'|'ping'|'paper'|'slam'|'impact'|..., db, f}]` using only kinds `tools/mix_audio.py` can play (`kit.ts` `SFX_KINDS`; **never `riser`**). New sounds go in `tools/sfx_kit.py`.
3. `epNNN/index.ts` calls `register({id: 'epNNN.slug', describes, evidence, hero: true, Comp, events})`. `evidence` is a regex source of the narration words that justify the prop (`'tankers?|oil ship'`); director.py refuses the prop on any line that lacks them.
4. Add ONE import line `import './epNNN';` to `src/props/custom/index.ts` (above the `<<EPISODES>>` marker).
5. Use it in `src/data/epNNN.ts` as an item `{p: 'epNNN.slug', x, y, at: '<narrated word>'}` inside a `recipe: 'compose'` scene.
6. Flat linocut look: palette `C` from `src/kit/theme.ts` (black, crimson, cream), thick ink strokes, no gradients. Keep text inside the safe margins and drawings above y ≈ 830.

Enforced by `tools/director.py --strict` (rules in `director/reuse-rules.json`, custom-demand words in `director/lexicon.json` `custom_entries`):
`R-REUSE` generic or custom prop without evidence words in its line · `R-NOCUSTOM` line names a thing no built-in prop draws and no custom prop covers it · `R-CUSTOM-MISSING` shot list plans a custom prop that is not coded · `R-CUSTOM-QUALITY` custom prop lacks draw-on / overshoot / depth / sound events · plus the old rules (`R-TITLE`, `R-DRY`, `R-9C` ...). Self-test: `bash studio/tools/test_all.sh`.

## 2. High-retention, human narration
Skills: `.claude/skills/humanizer` (installed from blader/humanizer) and `.claude/skills/crimson-retention` (mirrored in `.agent/skills/`). Load both before writing any script. Summary:
- **Open loops:** plant an unanswered mystery or contradiction every 60-90 s, the first inside 25 s, and pay each off later. Record them in `episodes/NNN-slug/retention-map.md` (`L<n> | OPEN | question`, `L<n> | CLOSE L<m> | answer`).
- **Physical action only:** every line names a concrete object or human action `Compose` can draw. "Tensions escalated" becomes "three destroyers entered the strait".
- **Spoken rhythm:** 8-15 words per sentence (cap 22), natural contractions, `<short pause>` / `<long pause>` / `<whispers>` from `TTS-TAGS.md` for the Charon voice (about one tag per 2-3 sentences, never dots), no laughing or shouting tags.
- **Accuracy:** every allegation is hedged in the line and shown on screen with `ACCORDING TO REPORTS` plus the source line.
- Gate: `python3 studio/tools/script_lint.py episodes/NNN-slug` must print no ERROR.

## 3. Local asset fetcher
`python3 tools/fetch_assets.py --ep NNN [--todo episodes/NNN-slug/assets-todo.md]` (run on the **laptop**; the cloud IP is rate-limited by Wikimedia). Reads the todo tables (format in the script header and `studio/ASSETS-TODO.md`), downloads free-licence Wikimedia Commons photos, maps, flags and government seals (licence-checked) and Pexels clips (`PEXELS_API_KEY` in the owner's own terminal; never ask for it in chat) into `studio/public/assets/epNNN/{photos,flags,maps,footage}/`, plus `manifest.json` and `CREDITS.md`. Anything it cannot fetch gets a placeholder at the same path (SVG for `.svg`, an "ASSET PENDING" card for photos), so renders and `probe.ts` never fail; the stage-3 gate reports remaining placeholders. Scenes reference `assets/epNNN/photos/x.jpg`.

## 4. The 3-stage autonomous pipeline
`NNN` = three digits (EP 004 -> `004`). Conventions: `episodes/NNN-slug/` (docs) · `studio/src/data/epNNN.ts` exporting `build(): Scene[]` · composition id `EPNNN` registered in `src/Root.tsx` · `studio/src/props/custom/epNNN/` · `studio/public/assets/epNNN/` · `studio/audio-in/epNNN/ch00.wav...` (one WAV per `[CHAPTER]`). Driver: `studio/tools/stage.py` (`--dry-run` prints commands).

### Stage 1: owner says `EP <num>: <topic>`
Research, then write everything, then **stop for manual Google AI Studio TTS**.
1. `episodes/NNN-slug/research.md` and `fact-check.md` (every number sourced or marked UNVERIFIED).
2. `narration-tts.txt`: style-instructions box (calm investigative narrator, Charon), `[CHAPTER n - NAME]` markers, tags per `TTS-TAGS.md`; humanizer + retention skills; ~11 min (~1,650 words); one line per breath.
3. `retention-map.md`; run `script_lint.py` until no ERROR.
4. `shot-list.md`, **1:1 with the narration lines** (line N = entry `### L<N>`), format:
   ```
   ### L12 · 62.3 s
   SEE: what a camera sees, in order, each step on its narrated word
   PROP: oil-tanker [CUSTOM epNNN.oil-tanker], person [built], building:datacenter [built]
   TIMING: tanker@63.1 engines@64.0
   SOUND: whoosh, tick
   SRC: Reuters, Nov 12          (required on allegation lines)
   HEDGE: ACCORDING TO REPORTS   (required on allegation lines)
   ```
   Every picture-word gets a prop that is really that thing; things no built-in prop draws get `[CUSTOM epNNN.slug]`. No `[NEW]`.
5. `edit-sheet.md` (chapters, planned timecodes, moods), `shorts-package.md` (each Short has its OWN 25-30 s script: hook, build, payoff, own TTS; titles, descriptions, Pakistan-time schedule), `youtube-metadata.md` (title options, description, chapters, tags, corrections section), `assets-todo.md` (parseable tables), thumbnails/titles in `packaging.md`.
6. Gate: `python3 tools/director.py --narration ../episodes/NNN-slug/narration-tts.txt --shotlist ../episodes/NNN-slug/shot-list.md --ep NNN --strict --allow R-CUSTOM-MISSING` must show no other violation.
7. **Stop.** Tell the owner: generate TTS per chapter (and per Short), save WAVs in `studio/audio-in/epNNN/` (`ch00.wav`, `ch01.wav`...), then say `audio ready`.

### Stage 2: owner says `audio ready`
Needs on the machine that runs it: Python 3.9+ with `pip install -r studio/requirements.txt` (numpy, scipy), `ffmpeg` on PATH, Node 20+ (`npm install`).
`python3 tools/stage.py audio NNN` runs `align_ep.py` (word timing -> `src/data/epNNN-timing.json`, joined `public/audio/epNNN.wav`), `fetch_assets.py` (on the laptop; elsewhere placeholders are made) and `mix_audio.py` (evolving chord-pad bed, no pulse, no hum, no risers; master two-pass to **-14 LUFS**, TP -1.5). Then update the timecodes in `shot-list.md` from the timing file, report counts (lines, minutes, assets fetched vs placeholders) and wait for `render`.

### Stage 3: owner says `render`
1. Code every custom prop the shot list names, in `studio/src/props/custom/epNNN/` (section 1), register the import, and write `src/data/epNNN.ts` + the `EPNNN` composition in `src/Root.tsx` (from the shot list; never reuse a prop whose evidence words the line lacks).
2. `python3 tools/stage.py remix NNN` (audio only, now with the real scene cues, about 2 minutes).
3. `python3 tools/stage.py stills NNN`: runs the gates (custom props coded, `director.py --strict`, `probe.ts`, no placeholders, no risers), then renders **keyframe stills** to `studio/out/epNNN/stills/` (`INDEX.md`) and **stops**.
4. Show the owner the stills (use `SendUserFile` / the app) and **wait for approval**. Do NOT run `render_segments.py`, `render_shorts.sh` or `stage.py ship` before it. Fix anything the owner flags, re-run `stills`.
5. Only after the owner says "approved": `stage.py approve NNN`, then `stage.py ship NNN` (cached per-chapter render, then the Shorts listed in `out/epNNN/shorts.json`). Tell the owner how long it will take first.

## 5. Quick commands (run from `studio/`)
| | |
|---|---|
| all offline self-tests | `bash tools/test_all.sh` |
| script lint | `python3 tools/script_lint.py ../episodes/NNN-slug` |
| shot list vs narration | `python3 tools/director.py --narration ... --shotlist ... --ep NNN --strict` |
| pipeline self-test (fixture EP 000) | `python3 tools/stage.py stills 000` |
| preview | `npm run studio` |
