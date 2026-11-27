# Assets to fetch from the laptop (EP 004)

Why: the cloud session has a shared IP. Wikimedia rate-limits it and stock footage needs a key. The laptop has a normal home connection, so it can fetch these in minutes.
Run (on the laptop, from the repo root): `python3 studio/tools/fetch_assets.py --ep 004 --todo episodes/004-china-rare-earth-clock/assets-todo.md`
Output: `studio/public/assets/ep004/{photos,flags,maps,footage}/` plus `manifest.json` and `CREDITS.md`. Anything it cannot fetch gets a placeholder at the same path, and the stage-3 gate reports the placeholders. Only free-licence or public-domain material. `PEXELS_API_KEY` goes in your own terminal, never in chat.
Already in the repo (do not fetch again): `public/flags/flag-us.svg`, `public/flags/flag-china.svg`, `public/photos/donald-trump.jpg`, `public/photos/xi-jinping-2019.jpg`.

## 1. Photos (Wikimedia Commons) -> `studio/public/photos/`
| Save as | Wikimedia file title (or a search) | Licence |
|---|---|---|
| `pentagon.jpg` | search "Pentagon aerial view Arlington" | public domain (US government), check |
| `mountain-pass-mine.jpg` | search "Mountain Pass rare earth mine California" | check licence |
| `lynas-kuantan.jpg` | search "Lynas Kuantan Malaysia" | check licence |
| `f35a.jpg` | search "F-35A Lightning II in flight" | public domain (US Air Force), check |
| `ford-chicago-assembly.jpg` | search "Ford Chicago Assembly Plant" | check licence |
| `white-house.jpg` | File:North Façade White House.JPG | public domain |
| `china-commerce-ministry.jpg` | search "Ministry of Commerce of the People's Republic of China building Beijing" | check licence |
| `dysprosium-oxide.jpg` | search "dysprosium oxide powder" | check licence |
| `rare-earth-oxides.jpg` | search "rare earth oxides samples" | check licence |
| `ndfeb-magnet.jpg` | search "neodymium magnet" | check licence |

## 2. Flags and maps -> `studio/public/flags/`
| Save as | Wikimedia file title | Licence |
|---|---|---|
| `flag-japan.svg` (-> `studio/public/flags/`) | File:Flag of Japan.svg | public domain |
| `flag-malaysia.svg` (-> `studio/public/flags/`) | File:Flag of Malaysia.svg | public domain |
| `flag-australia.svg` (-> `studio/public/flags/`) | File:Flag of Australia.svg | public domain |
| `flag-europe.svg` (-> `studio/public/flags/`) | File:Flag of Europe.svg | public domain |
| `world-map.svg` (-> `studio/public/maps/`) | File:BlankMap-World.svg | public domain |

## 3. Footage (Pexels, free commercial licence) -> `studio/public/footage/`
Search terms: `open pit mine aerial`, `container ship port aerial`, `car assembly line robots`, `chemical plant tanks pipes`, `electric car motor`, `magnet close up`
Save as `<short-name>.mp4` and the fetcher notes the Pexels page URL in `CREDITS.md`.

## 4. Not possible from either machine
Paywalled articles (NYT, WSJ, FT, Bloomberg) and CNBC/Reuters/AP pages (bot-blocked). The headline clips in the video are drawn cards that type the headline and the source line; no screenshots of those sites are used. Paste text or screenshots into the chat if a figure must be checked.
