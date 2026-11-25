import {continueRender, delayRender, staticFile} from 'remotion';

// Fonts are bundled in public/fonts so rendering works offline.
const FONTS: [string, string, string][] = [
  ['Anton', 'anton', '400'],
  ['Inter', 'inter-400', '400'], ['Inter', 'inter-600', '600'], ['Inter', 'inter-800', '800'],
  ['JetBrains Mono', 'mono-500', '500'], ['JetBrains Mono', 'mono-700', '700'],
];
if (typeof document !== 'undefined') {
  const handle = delayRender('Loading fonts');
  Promise.all(FONTS.map(([family, file, weight]) => {
    const face = new FontFace(family, `url(${staticFile(`fonts/${file}.woff2`)}) format('woff2')`, {weight});
    document.fonts.add(face);
    return face.load();
  })).then(() => continueRender(handle)).catch((e) => { console.error(e); continueRender(handle); });
}

export const FONT_HEAD = 'Anton, Impact, sans-serif';
export const FONT_BODY = 'Inter, Arial, sans-serif';
export const FONT_MONO = '"JetBrains Mono", monospace';

export const C = {
  crimson: '#C8141E',
  crimsonDeep: '#7A0A10',
  ink: '#0E0E0E',
  paper: '#F2EEE6',
  white: '#FFFFFF',
  grey: '#8A8580',
};

export type Mood = 'context' | 'danger' | 'facts';

// Background, main text colour, muted text colour, accent for each mood
export const MOODS: Record<Mood, {bg: string; bg2: string; fg: string; muted: string; accent: string; line: string}> = {
  context: {bg: '#151515', bg2: '#050505', fg: C.paper, muted: '#8F8A84', accent: C.crimson, line: 'rgba(242,238,230,0.08)'},
  danger: {bg: '#B3121B', bg2: '#5E070C', fg: C.paper, muted: 'rgba(242,238,230,0.7)', accent: C.ink, line: 'rgba(0,0,0,0.12)'},
  facts: {bg: '#F4F0E8', bg2: '#E2DCD0', fg: C.ink, muted: '#6E6860', accent: C.crimson, line: 'rgba(14,14,14,0.07)'},
};

export const FPS = 30;
export const W = 1920;
export const H = 1080;
