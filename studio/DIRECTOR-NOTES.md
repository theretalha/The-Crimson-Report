# Director notes (the owner's recommendations, saved as they arrive)

Every session (cloud or laptop) reads this before building or changing a scene. Add new notes at the bottom with the date.
Same list is also saved in Claude memory (feedback notes for this repo).

## Scene density and hierarchy (Nov 25, 2026, from reviewing EP 003 screenshots)
1. Scenes were too minimal: a huge number alone on screen ($4.8B), a bare timeline with dates, date-only scenes with no objects.
   - Never show a number or date alone for long. Pair it with the objects it belongs to and a small context label.
   - Dates go on a slim timeline ribbon, not a full-screen card, and not every time.
2. Show how the parts connect. When the story moves from a person to her company, her husband, who introduced whom, where the money went:
   build ONE connected structure (people -> companies -> products -> money) with typed links
   (married to, introduced, owns, supplies chips, funded by) that grows as each part is spoken.
   Keep the same entity in the same place across scenes. Give it a clear hierarchy (who is above, who is under).
3. Elements appear on the word that names them and stay until the scene ends (word-timed).
4. Do not cram: about 3-4 elements at once, about 40% empty space, one hero element.
5. BUG seen: timeline labels were clipped at the screen edges ("MAR 2023" on the left, "+8 MONTHS / Her name removed" on the right). Keep all text inside the safe margins.

## Visuals (earlier)
6. Realism: the graph was a plain line, buildings and chips looked fake. Use real photos, real data, proper charts.
7. 2D is fine (3D not needed) but must look professionally designed: draw-on strokes, depth, print shadow, masked type, easing with overshoot.
8. "Spicy": punchy reveals (slams, counters, stamps, shake). Facts found after recording go in as on-screen callouts.
9. Use the Remotion kit effects (E:\Remotion) as the pattern, but do not fill the whole screen.

## No AI-image shortcut (Nov 25, 2026)
9b. Do NOT replace designed animation with AI (Flux) images. An earlier session in the owner's own repo filled the video with Flux stills instead of doing the animation work.
    Flux is optional and rare: hero moments only (max 1-2 per minute, 4-5 s each, never back-to-back), always with motion and an "illustrative" label.
    Animation, real photos and real data come first. Do not ask for the owner's Cloudflare token unless they ask for Flux.

## Show the action, not the words (Nov 25, 2026)
9c. When the narration describes an everyday physical action, ANIMATE THE ACTION. Do not write it as text boxes.
    Example (EP 003, "NORMAL LOGIC"): "you buy chips, you open them, you plug them in" must show a parcel arriving, a hand/lid opening it, the chip lifted out and plugged into a server, a light turning on. It was shown as the words BUY -> OPEN. Wrong.
    Rule: for every scene ask "what would a person SEE doing this in real life?" and draw that sequence in steps (object -> action -> result), one step per narrated phrase.
    Words are only small labels beside the drawing. Obvious things must look obvious. Before finishing a scene, check it with a viewer who has not read the script: could they tell what is happening without the caption?
    Self-check for every scene: if it is only text, boxes and an arrow, redraw it as the real-world scene.

## Content and voice
10. Keep the approved Google TTS narration. Do not re-record.
11. Authentic and balanced, not US-favouring. Verify facts, hedge allegations, never present unproven claims as fact, no sexual detail.
12. Reference videos (Dhruv Rathee, ScalableBuddy) are style and structure references only. Never copy their sounds, wording or look.

## Audio
13. Sound effects must attract the audience and be audible on phone speakers.
14. No constant hum, fan or machine noise: bed must be evolving, quiet, never static or rhythmic.
15. No risers (rising whoosh/sweep builds) before hits: owner found them irritating when repeated (heard from 18 s on). Keep clean impacts only.

## Workflow
16. Cloud studio builds and renders. Laptop fetches assets the cloud cannot (see ASSETS-TODO.md). Do not publish two competing Nvidia videos.
17. TTS expression (Nov 26, 2026): in narration scripts use the Google AI Studio tags listed in TTS-TAGS.md (e.g. <short pause>, <long pause>, <breath>) instead of dots or punctuation tricks. Use sparingly and keep the calm documentary tone.
18. RENDER BUDGET (Nov 26, 2026): a full render takes ~35 min and the owner must upload on time. NEVER re-render the whole video for each small change.
    - Batch ALL visual changes first, check them with stills (tools/probe.ts + director.py --strict + contact sheets), then render ONCE.
    - Audio-only changes (SFX, mix, loudness) never need a video render: remix, master, re-mux (about 2 minutes).
    - Use `python3 tools/render_segments.py`: it renders per chapter and caches; a data-only change re-renders only the touched chapters. Use --force after editing prop code.
    - Do not start a render without telling the owner why it is needed and how long it will take; ask for all pending feedback first.

