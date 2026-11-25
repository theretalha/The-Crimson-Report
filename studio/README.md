# Crimson Studio (Remotion)

Turns a scene list into a finished video in The Crimson Forecast style.

## Run on your PC (Windows)
1. Install Node.js 20+ (nodejs.org)
2. In this folder: `npm install`
3. Preview and edit live: `npm run studio`
4. Render: `npx remotion render src/index.ts EP002-Hook out/EP002-Hook.mp4`

8 GB RAM tip: add `--concurrency=2` to the render command.

## Make a new video
1. Copy `src/data/ep002-hook.ts`, then edit the scenes (template, mood, title, caption, source, seconds)
2. Put the TTS audio in `public/` and pass `audio: "ep003.wav"` in `src/Root.tsx`
3. Match each scene's `seconds` to the audio

## Templates
title · icon · quote · stat · split · cards · map
Moods: context (black) · danger (crimson) · facts (off-white)
