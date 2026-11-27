---
name: crimson-retention
description: |
  Write or rewrite a Crimson Forecast narration script so a viewer stays for the whole ~11 minutes.
  Use for any new episode script (stage 1 of the pipeline in AGENTS.md), any Short script, and any request
  to make narration less dry. Combines the `humanizer` skill with the channel's Audience Retention Rules:
  open loops, physical-action-only lines, spoken rhythm, Charon TTS tags, and on-screen hedging.
license: MIT
---

# Crimson retention writing

You write for the ear, for one voice (Google AI Studio, "Charon"), and for a drawing engine (`Compose`).
Every line must be something a person can say aloud in one breath AND something the studio can draw.
Run the `humanizer` skill on the draft, then check every rule below, then run the linter.

## The four rules

### 1. Physical action only (the line must be drawable)
Every line names a concrete object, person, place or action that `Compose` can draw. No abstract summaries.

| Abstract (banned) | Physical (required) |
|---|---|
| Tensions escalated in the strait. | Three destroyers entered the strait at dawn. |
| The supply chain was disrupted. | Forty tankers sat anchored outside the port, engines off. |
| The company faced scrutiny. | Two agents walked into the Singapore office and took the servers. |
| Pressure mounted on the board. | Twelve board members sat at one table. One phone kept buzzing. |

Before keeping a line, ask: "what would a camera see?" If the answer is "nothing", rewrite it or merge it into the line next to it.
A line that names a new physical thing (tanker, cable, missile battery, wafer) is a **custom prop demand**: the render stage must code a new prop for it (see AGENTS.md rule 1). Never plan to reuse a prop that does not match the object.

### 2. Open loops every 60-90 seconds
Plant an unanswered mystery or contradiction at least every 60-90 seconds, and pay each one off later, so there is always one thing the viewer is waiting to learn.
- Cold open (0-20 s): plant loop 1 inside the first three lines.
- Pay one loop off right when you plant the next ("That answers the boxes. It doesn't answer who signed the order.").
- Never leave a loop open with no payoff, except the last one, which is the "nobody can say for sure" closer.
- Write the loops into `episodes/<NNN-slug>/retention-map.md` (format in AGENTS.md). `tools/script_lint.py` checks the gaps.

### 3. Spoken rhythm
- 8-15 words per sentence on average. One short punch line (3-6 words) after a long one is fine. Hard cap: 22 words.
- Contractions everywhere they sound natural (don't, it's, they'd). Read each line aloud; if you would not say it to a friend, change it.
- No stacked clauses, no lists of three for rhythm, no em-dash chains (TTS reads them as nothing). Use full stops.
- Numbers and dates are said the way people say them ("forty tankers", "the twelfth of November").
- Tags from `studio/TTS-TAGS.md` instead of dots or punctuation tricks: `<short pause>` after a key number or date, `<long pause>` before a reveal or twist, `<whispers>` for "nobody can say for sure". Max about one tag per 2-3 sentences. Calm documentary voice: no laughter, no shouting.

### 4. Accuracy on the page
- Every allegation is hedged **in the line** ("reportedly", "according to the New York Times") AND shown on screen with `ACCORDING TO REPORTS` plus the source line. The shot list carries `SRC:` and `HEDGE:` for that line.
- Allegation words (spy, affair, bribe, smuggled, fraud, secret deal, illegal, accused...) never appear in a line without a hedge.
- Balanced: give the other side's view in one line. Verify numbers against a primary source; unverified numbers are listed in `fact-check.md`, never stated as fact.
- No sexual detail. No invented documents, quotes or photos.

## How to work (stage 1)
1. Research -> `research.md`, `fact-check.md` (every number has a source or is marked UNVERIFIED).
2. Draft the narration chapter by chapter: one idea per line, one line per breath, the line count is the shot count.
3. Run the `humanizer` skill on the draft (file mode on `narration-tts.txt`). Keep intact: `[CHAPTER n - NAME]` lines, the style-instructions box, the `<tags>`, numbers, names, dates, quotes. Humanizer must not turn contractions back into full forms or add dashes.
4. Apply rules 1-4 above and write `retention-map.md`.
5. Run `python3 studio/tools/script_lint.py episodes/<NNN-slug>` and fix every `ERROR`. Fix `WARN` where it makes the line better.
6. Only then write `shot-list.md` (1:1 with the lines), `edit-sheet.md`, `shorts-package.md`, `youtube-metadata.md`.

## Self-check before you hand over
- Could a viewer with the sound off follow the story from the pictures alone?
- Is there an open loop in every 90-second window?
- Is any line only an opinion or a summary? Delete it or give it an object.
- Did anything sound like a press release? Rewrite it as something a person said at a table.
