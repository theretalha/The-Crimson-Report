# EP 004 custom prop plan (coded in Stage 3, `studio/src/props/custom/ep004/`)

Rule (AGENTS.md section 1): every physical thing the narration names that no built-in prop draws gets its own prop. Each prop is drawn in the flat linocut look (palette `C` from `kit/theme.ts`: black, crimson, cream), around its own origin (ground at y = 0, about 500 px wide), with draw-on strokes (`drawOn`), depth (`groundShadowProps`, layered fills), overshoot, an idle `bob`, and sound `events` (kinds: `whoosh tick ping paper slam impact stamp`; never `riser`).
`director.py` reads this table in Stage 1 to check the evidence words before the props are coded. When a prop is coded, its `register({... evidence ...})` must use the same regex.

| id | evidence (regex of narration words) | what it draws |
|---|---|---|
| `ep004.magnet` | `magnets?\|neodymium\|praseodymium\|dysprosium\|terbium\|rare earths?\|rare earth material` | a grey rare-earth magnet block with field lines that curl on, labelled chips (Nd, Pr, Dy) that pop in one by one; a hot-motor glow for dysprosium; slams onto a scale when weighed |
| `ep004.rare-earth-mine` | `mines?\|mining\|mined\|ore\|rock\|Mountain Pass\|rare earths?` | an open-pit mine in terraces, a dump truck climbing, rock piles that grow; a sign reads the site name when given (MOUNTAIN PASS) |
| `ep004.oxide-jars` | `oxides?\|powders?\|jars?\|dysprosium\|terbium\|rare earths?` | a shelf of labelled jars of single-metal powder (Nd, Pr, Dy, Tb); one jar lifts onto a pan; paper price tags swing onto the jars (used for the price scenes) |
| `ep004.separation-plant` | `separation plants?\|processing\|refining\|mixing tanks\|tanks\|chemistry\|separating\|rare earths?` | a row of mixing tanks joined by pipes; rock goes in on the left, a stream splits into coloured jars on the right; bubbles idle in the tanks |
| `ep004.ev-motor` | `electric cars?\|motors?\|rotors?\|carmakers?\|cars` | a cut-away electric motor: a spinning rotor with a magnet ring around it, a heat shimmer; a small car body slides over it when the car is named |
| `ep004.fighter-jet` | `fighter jets?\|jets?\|F-35` | a stealth-style jet in side view banking in, contrail drawing on, a label tag F-35; magnet pieces light up inside the fuselage on cue |
| `ep004.licence-form` | `licen[cs]es?\|licen[cs]ing\|approval\|approved\|applications?` | an export licence form with lines that type on; a rubber stamp hovers, then lands APPROVED, WAITING or SLOWER; forms stack and a queue builds |
| `ep004.car-factory` | `car factor(?:y\|ies)\|factor(?:y\|ies)\|Explorer\|assembly\|line\|plants?\|carmakers?` | a car assembly line with robot arms and a half-built SUV on a belt; the belt stops and the lights go from green to red |
| `ep004.container-ship` | `shipments?\|shipped\|ships?\|exports?\|cargo\|container ships?` | a container ship stacked with boxes crossing a map line; a crane lifts one box; boxes can be tagged with a destination flag colour |
| `ep004.ministry-building` | `commerce ministry\|ministry\|Beijing` | a flat Chinese government building with a flagpole and a red banner sign (MINISTRY OF COMMERCE); a stamp lands on the door |
| `ep004.pentagon` | `Pentagon` | the five-sided Pentagon from above, drawn on stroke by stroke, a small flag on top; a rule page drops onto it |
| `ep004.summit-readout` | `readouts?\|summary\|summit\|page` | two paper readouts side by side (US WHITE HOUSE FACT SHEET, CHINA COMMERCE MINISTRY SUMMARY); a highlighter moves down each; a line item RARE EARTHS gets a tick on one page and an empty space on the other |
