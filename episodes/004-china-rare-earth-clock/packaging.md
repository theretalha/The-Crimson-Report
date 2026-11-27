# EP 004: Packaging: thumbnails and titles (v1)

Thumbnails (1280x720 PNG, under 2 MB, in `thumbnails/`; built in Stage 3 from `studio/src/Thumbs.tsx`; the props come from `custom-props.md`).

| | Thumbnail | What it does | Best title pair |
|---|---|---|---|
| **A** | Two calendar sheets, US flag on 1 JAN and China flag on 10 JAN, nine small squares between, text "9 DAYS" | The curiosity gap: why nine days? No face, no accusation. | T3 |
| **B** | A grey magnet slamming onto a car factory belt that has stopped, text "10 JAN?" | An object and a date. Fast to read at phone size, ties to the cold open. | T1 or T2 |
| **C** | The two rings "61%" and "91%" with a question mark between a mine and a row of tanks | The puzzle in one picture: how can one country control more than it mines? | T5 |

## Titles (YouTube shows about 60 characters)
| # | Title | Chars | Why |
|---|---|---|---|
| T1 | China Paused Its Rare Earth Ban. What Happens Jan 10? | 53 | The pitch title: a plain question with a date. Good for search ("rare earth", "China", "Jan 10"). |
| T2 | The Magnet That Stopped a Ford Factory, and What Comes Next | 59 | A concrete story first, then the clock. Matches thumbnail B. |
| T3 | Two Deadlines, Nine Days Apart: The Rare Earth Clock | 52 | Curiosity and structure. Matches thumbnail A. |
| T4 | China Controls the Magnets America Needs. For How Long? | 55 | Direct and broad; US audience. Carries a slight framing risk, so it must stay balanced in the video. |
| T5 | Who Really Controls Rare Earths? Not the Miners | 47 | The puzzle at the centre of chapters 1 and 2. Matches thumbnail C. |

**Recommendation:** upload with **B + T1** (a clear question, a date, and an object). Use YouTube's "Test & compare" to run **A + T3** and **C + T5** against it and keep the winner.

## Rules we followed
- Max 4 big words per thumbnail, one idea, readable at phone size.
- No face of a living person is needed: the story is objects and dates.
- Titles avoid "exposed", "caught" and "guilty". "Ban" in T1 refers to China's own controls that the video explains are a suspended expansion; the video states clearly that the April 2025 licences are still in force.
- Balanced framing: the video gives Beijing's view (national security, non-proliferation) next to Washington's and Tokyo's.

## Open points for the owner
1. T1 uses the word "Ban" because that is how the pitch was approved. The accurate phrase is "export controls"; if you prefer exactness, use "China Paused Its Rare Earth Controls. What Happens Jan 10?" (58 chars).
2. Thumbnail A shows two flags: both are public-domain SVGs (Wikimedia) already in `public/flags/`.
3. YouTube may not show the full title on mobile; the first 40 characters carry the meaning in every option.
