# Assets to fetch from the laptop (EP 003)

Why: the cloud session has a shared IP. Wikimedia rate-limits it, Reuters/AP/CNBC/SEC block it, and stock footage needs a key.
The laptop has a normal home connection, so it can fetch these in minutes. Cloud and laptop share this repo through git.

**Rule:** only free-licence or public-domain material. Keep the credit line for every photo (the video shows it in the source line).
Save each file at the path shown, then `git add`, `git commit`, `git push` on branch `claude/brave-goodall-iikjfo`.

## 1. Photos (Wikimedia Commons) -> `studio/public/photos/`
| Save as | Wikimedia file title (search it on commons.wikimedia.org) | Licence |
|---|---|---|
| `commerce-seal.svg` (-> `studio/public/flags/`) | File:Seal of the United States Department of Commerce.svg | Public domain |
| `h100-002.jpg`, `h100-011.jpg`, `h100-021.jpg` | File:NVIDIA H100 (极客湾Geekerwan) 002 / 011 / 021.png (resize to 1600 px wide) | CC BY 3.0 (credit: Geekerwan) |
| `white-house.jpg` | File:North Façade White House.JPG | Public domain |
| `capitol.jpg` | File:United States Capitol - west front.jpg | Public domain |
| `commerce-hq.jpg` | search "Herbert C. Hoover Building" | check licence |
| `flag-malaysia.svg`, `flag-singapore.svg`, `flag-taiwan.svg` (-> `public/flags/`) | File:Flag of Malaysia.svg / Singapore / Taiwan | Public domain |

## 2. Footage (Pexels, free commercial licence) -> `studio/public/footage/` (MP4, 1080p, 5-10 s each, no audio needed)
Search terms: `data center server racks corridor`, `stacked cardboard boxes warehouse dark`, `stock market red screen`,
`Washington DC Capitol aerial`, `Kuala Lumpur skyline night`, `Singapore skyline`, `circuit board close up`, `container port aerial`.
Save as `<short-name>.mp4` and note the Pexels page URL in `studio/public/footage/CREDITS.md`.

## 3. AI hero images (your Flux script, 1-2 per minute at most) -> `studio/public/images/gen/`
Use `node scripts/flux.mjs "<prompt>" --name <name>` in E:\Remotion, then copy the `-wide.jpg` files here.
- `sealed-boxes`: "stacked sealed cardboard crates in a dark data center aisle, one flashlight beam cutting through"
- `empty-chair`: "a black leather jacket hanging on an empty executive chair in a dark boardroom"
- `evidence-board`: "a hand pinning photographs to a board and stretching red string between them"
- `board-vote`: "twelve people around a long boardroom table, one phone glowing in the centre"
- `smuggle-route`: "shipping containers on a dark port at night, a single crate lit red"
- `chip-macro`: "extreme close-up of a silicon chip die with fine circuit lines, one red highlight"

## 4. Not possible from either machine
Paywalled articles (NYT, WSJ, The Information): paste the text or screenshots if a number must be checked.
