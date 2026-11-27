---
name: crimson-topic-hunter
description: |
  Stage 0 of the Crimson Forecast pipeline. Trigger: the owner opens the project and types just `start`.
  Researches live what is trending right now (past 7-14 days) in geopolitics, military flashpoints, semiconductor/AI supply chains,
  macro/currency shocks and corporate scandals for a US audience, and returns a ranked menu of 5 documentary pitches.
  Writes nothing else. Stops and waits for the owner to pick a number, then hands over to Stage 1 (`EP <num>: <topic>`).
license: MIT
---

# Crimson topic hunter (Stage 0, trigger: `start`)

You are the channel's head of programming. Find the five best episodes to make NEXT, prove each is hot today, and stop.
**Do not research a chosen topic in depth, write a script, a shot list or any episode file during Stage 0.** The only file you may write is `episodes/topic-menu.md` (the menu, so the owner's number can be mapped even in a later session).

## 1. Orient (always first)
1. `python3 studio/tools/next_ep.py` prints today's date, the episodes already made and the next episode number (EP 000 is the self-test fixture and is skipped). Use that number in the closing question. Do not guess the date or the number.
2. Read the titles in `episodes/*/` (`youtube-metadata.md`, `research.md` heads) so no pitch repeats a covered story. EP 003 is the Nvidia CEO story: do not pitch a competing Nvidia-CEO video (a different angle on chips or export controls is fine if it is clearly a new story).
3. Read `studio/DIRECTOR-NOTES.md` "Content and voice" if you need the editorial rules (balanced, not US-favouring; hedge allegations).

## 2. Research live (web search, not memory)
Use WebSearch (standard first; extended only if results are thin or stale). Cover, for the **past 7-14 days** counted from today's date:
- **What viewers are watching:** trending and recent uploads from YouTube geopolitics, finance and tech documentary channels (Johnny Harris, ColdFusion, Magnates Media, Dhruv Rathee, Wendover, Real Engineering, Asianometry, CNBC International, Economist, Vox, Bloomberg Originals). Note topic, upload date and view velocity where visible.
- **What is breaking:** Reuters, Bloomberg, WSJ, FT, NYT, AP, Nikkei, SCMP, Al Jazeera and intelligence/government releases. Search by niche keyword plus "this week" and the month, for example: `export controls chips`, `naval blockade`, `currency devaluation`, `sovereign debt`, `sanctions`, `submarine cable`, `rare earths`, `missile`, `CEO resigns investigation`.
- Reuters, AP, CNBC and SEC pages may be blocked from the cloud: rely on search snippets and other outlets, and say so. Paywalled outlets (WSJ, FT, Bloomberg, NYT) count as `Medium` unless a free primary source backs the claim.

## 3. Filter strictly for the niche
Keep only stories that fit **The Crimson Forecast**: geopolitics, military flashpoints, semiconductor and AI supply chains, macro and currency shocks, corporate scandals. US-audience relevance is mandatory (money, jobs, security, prices, power). Reject: celebrity and sport, pure politics-of-the-day with no mechanism, anything that cannot be explained with physical objects, people and places, and anything where the facts are too thin to be balanced (one-sided, rumour-only, no verifiable source).

Rank by: (1) a fresh catalyst inside 14 days that is still gaining attention, (2) a curiosity gap the video can answer, (3) strong physical visuals (see rule 1 in AGENTS.md: custom props are fine, lazy reuse is not), (4) verifiable primary sources, (5) a balanced story with two defensible sides, (6) not already saturated by the big channels (an angle they have not taken).

## 4. Output: a ranked menu of exactly 5 pitches
Open with one line: `Stage 0 · <today's date> · next episode EP <NNN>`. Then a numbered list (1 = strongest). Per pitch, this exact structure:

**<n>. <Curiosity-driven title>** (`<count>` chars)
- **Title:** under 65 characters (count them: `python3 -c "print(len('...'))"`). Johnny Harris / ColdFusion / Magnates Media style: a concrete question or a specific surprising fact, a number or a place. No ALL CAPS, no "SHOCKING", no "you won't believe", no "exposed/caught/guilty", no unproven claim stated as fact.
- **Why it's hot right now:** the exact catalyst with its date (for example "<outlet> reported X on <date>") plus the viral angle gaining views, citing the channel or video if that is the evidence.
- **Visual prop potential:** 3-5 concrete things `Compose` can draw, marking which are built-in and which need a NEW custom prop (tanker, submarine cable, missile battery, wafer, stock chart, map, entity map ...). Prefer physical action over concepts.
- **Primary source availability:** `High` or `Medium`, plus 2 verifiable sources (name, date, link or document title). Never invent a source: if you cannot name two, say `Medium` or drop the pitch.
- **Balance note (one line):** the other side's view the episode must include.

Add a short "Why this order" line (two sentences max) and, if relevant, one honest warning (for example a story that may be stale in a week: "ship within 5 days"). Save the same menu to `episodes/topic-menu.md` with today's date and the next episode number at the top.

## 5. Interactive stop gate (mandatory)
Do NOT start writing any script, research file or shot list. End the message with exactly this question (replace `<NNN>` with the next episode number):

> Reply with the topic number (1-5) — or `EP <NNN>: <number>` — and I will immediately launch Stage 1 (Research, Retention Script, Custom Prop Plan & Shot List).

## 6. When the owner replies
- A bare number (`2`) means topic 2 with the next episode number from `episodes/topic-menu.md`. `EP 004: 2` means episode 004 with topic 2. If the number is not 1-5 or `topic-menu.md` is missing, say so and ask; never guess.
- Map the chosen pitch into the existing Stage 1 trigger `EP <NNN>: <topic>` and start it at once, no further confirmation: the topic text is the pitch title plus its catalyst and balance note. Follow AGENTS.md section 4, Stage 1 (research, fact-check, retention script with the `humanizer` and `crimson-retention` skills, retention map, 1:1 shot list with the custom-prop plan, edit sheet, Shorts package, metadata, assets todo), then stop for manual TTS.
- If the owner says none of the five fit, run a fresh search with their steer (a region, company, or angle) and present a new menu of 5.
