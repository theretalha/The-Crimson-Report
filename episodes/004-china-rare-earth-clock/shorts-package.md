# EP 004: Shorts package (5 Shorts, each with its OWN script and its own TTS)

Rule (from the EP 003 rejection): a Short is never chopped from the long video. Each one is a 25 to 30 second story with its own hook, build and payoff, recorded separately in Google AI Studio (same Charon voice and style box as the long video), and rendered native vertical 1080x1920.
Format: headline at the top, one drawn hero visual from the custom props (`custom-props.md`), large word-timed captions, end card "Full video on the channel". Everything stays in YouTube's safe zone. Sound: clean impacts, no risers, no constant hum.
Listing file for the pipeline: `studio/out/ep004/shorts.json` (Stage 3).

## Schedule (suggested; the owner can move it)
Long video proposed to go live **Thu Dec 3, 1:00 am PKT = Wed Dec 2, 3:00 pm ET**. Pakistan = Eastern + 10 h in December. Spread the Shorts so they do not compete with each other. Set each one with Schedule in Studio and check the time zone says GMT+5. Link each Short to the long video with "Related video" once it is public (the teaser cannot link yet).

| # | Short | Length | Publish (PKT) | Eastern | Why |
|---|---|---|---|---|---|
| 0 | Teaser | about 27 s | Wed Dec 2, 10:00 pm | Wed 12:00 pm | 3 hours before the long video |
| 1 | The magnet that stopped a Ford factory | about 26 s | Thu Dec 3, 4:00 am | Wed 6:00 pm | 3 hours after the long video, evening commute and dinner |
| 2 | China mines 61%. It refines 91%. | about 30 s | Thu Dec 3, 10:00 pm | Thu 12:00 pm | Thursday midday |
| 3 | Two deadlines, nine days apart | about 30 s | Fri Dec 4, 5:00 am | Thu 7:00 pm | Thursday evening |
| 4 | Same metal, sixteen times the price | about 30 s | Fri Dec 4, 10:00 pm | Fri 12:00 pm | Friday midday |

## Scripts (paste one per generation; tags per `studio/TTS-TAGS.md`)

### Short 0: Teaser (hook, build, payoff)
Hook: a stopped car factory. Build: China controls the supply and moved the deadline. Payoff: two deadlines, nine days apart, full story tonight.
```
In May 2025, a Ford car factory in Chicago stopped, because of one small magnet. <short pause>
China controls the supply of that magnet. And on the ninth of November, it moved a deadline to the tenth of January.
Nine days earlier, America has a deadline of its own.
Why do both land in the same two weeks? The full story goes live tonight.
```
Visuals: car-factory belt stops, magnet slams on, nine-square calendar with two flags.

### Short 1: The magnet that stopped a Ford factory
Hook: one magnet, a week of lost production. Build: the April 2025 licence rule and Farley's quote. Payoff: the dysprosium chokepoint.
```
One small magnet stopped a Ford factory for a week. <short pause>
In May 2025, the Chicago plant stopped building the Explorer. China had started requiring licences for rare earth magnets, and every shipment needed approval from Beijing.
Ford's chief executive said approvals came one at a time.
The magnet relies on dysprosium. One industry estimate says China separates almost all of it.
```
Visuals: car-factory, licence-form WAITING, silhouette JIM FARLEY, magnet with a Dy chip. Sources on screen: CBS News, Mining.com, Rare Earth Exchanges.

### Short 2: China mines 61%. It refines 91%.
Hook: two numbers that do not match. Build: the separation plant. Payoff: eight tonnes against fourteen tonnes a month.
```
China mines about sixty percent of the world's rare earths. But it refines about ninety-one percent. <short pause>
The ore can be dug in many countries. The bottleneck is the separation plant, where mixed powder is split apart one metal at a time.
Lynas, in Malaysia, made about eight tonnes of dysprosium and terbium in early 2026.
In 2024, China exported about fourteen tonnes of those two to Japan. Every single month.
```
Visuals: two rings (61, 91), tanks and jars, eight jars against fourteen boxes. Sources on screen: IEA 2024 (via S&P Global), Fastmarkets.

### Short 3: Two deadlines, nine days apart
Hook: two deadlines. Build: the Pentagon rule on Jan 1 and China's pause ending Jan 10. Payoff: the US ban starts before its own supply exists.
```
Two deadlines. Nine days apart. <short pause>
On the first of January 2027, a Pentagon rule bars defense contractors from using certain magnets made with Chinese material. Contractors have reportedly asked for a delay.
Nine days later, on the tenth of January, China's pause on new export controls ends.
America's ban starts before its own supply exists. The big new magnet plant at MP Materials is due in 2028.
```
Visuals: nine-square calendar, Pentagon, rule page, ministry banner, empty chain outline. HEDGE on screen: ACCORDING TO REPORTS (delay request). Sources: Federal Register (DFARS), Adamas Intelligence, MP Materials.

### Short 4: Same metal, sixteen times the price
Hook: one metal, two prices. Build: the three price points. Payoff: two reasons analysts give.
```
Same metal. Sixteen times the price. <short pause>
Benchmark Minerals says dysprosium oxide in Europe now costs about sixteen times the Chinese price. S&P put the European average at thirty-five hundred dollars a kilogram in September.
Platts assessed forty-one hundred in North America on the thirtieth of October.
Analysts point to two reasons. Chinese supply is tightly licensed, and new magnet makers outside China are bidding for every kilogram left.
```
Visuals: price bars on jars, 16x tall bar, licence gate, magnet makers grabbing blocks. Sources: Benchmark Minerals Q3 2026 review, S&P Global, Platts.

## Titles, descriptions, tags
**0 Teaser**
- Title: One Magnet Stopped a Ford Factory. Full Story Tonight (53 chars)
- Description: A car factory in Chicago stopped because of one small magnet. China controls the supply, and a deadline falls on Jan 10. America has one nine days earlier. The full video goes live tonight on The Crimson Forecast. Reported claims are sourced in the full video.
- Hashtags: #RareEarths #China #Geopolitics #Shorts

**1 The magnet that stopped a Ford factory**
- Title: The Magnet That Stopped a Ford Factory (38 chars)
- Description: In May 2025 a Ford plant in Chicago stopped building the Explorer, and China's new licence rule for rare earth magnets was the reported cause. Sources: CBS News, Mining.com. Full story on the channel.
- Hashtags: #Ford #RareEarths #Supplychain #Shorts

**2 China mines 61%. It refines 91%.**
- Title: China Mines 61% of Rare Earths. It Refines 91%. (47 chars)
- Description: Why does one country control more than it digs up? The answer is a plant most people never see. Sources: IEA 2024 data via S&P Global; Fastmarkets. Full story on the channel.
- Hashtags: #RareEarths #China #Explained #Shorts

**3 Two deadlines, nine days apart**
- Title: Two Deadlines, Nine Days Apart: Magnets and Jan 10 (50 chars)
- Description: On Jan 1, 2027 a Pentagon rule limits certain magnets made with Chinese material. On Jan 10, China's pause on new export controls ends. Contractors reportedly asked for a delay. Sources: Federal Register, Adamas Intelligence. Full story on the channel.
- Hashtags: #RareEarths #Pentagon #China #Shorts

**4 Same metal, sixteen times the price**
- Title: Why This Metal Costs 16 Times More Outside China (48 chars)
- Description: Dysprosium oxide prices outside China have soared, according to Benchmark Minerals, S&P Global and Platts. Analysts point to licensing and new buyers. Full story on the channel.
- Hashtags: #Dysprosium #RareEarths #Commodities #Shorts

## Open points for the owner
1. Record each Short as its own generation (do not cut from the long video's audio).
2. If the long video is published on a different day, shift the whole table by the same offset.
3. Jan 10, 2027 is a Sunday and Jan 1 is a Friday: a good detail for a pinned comment, not needed in the scripts.
