import { continueRender, delayRender, staticFile } from "remotion";

// Fonts are bundled in public/fonts so rendering works offline (the render browser cannot reach Google Fonts here).
const FONTS: [string, string, string][] = [
  ["Bebas Neue", "bebas", "400"],
  ["Oswald", "oswald-400", "400"], ["Oswald", "oswald-500", "500"], ["Oswald", "oswald-700", "700"],
  ["Source Serif 4", "serif-400", "400"], ["Source Serif 4", "serif-600", "600"],
  ["Special Elite", "elite", "400"], ["Permanent Marker", "marker", "400"], ["Black Ops One", "blackops", "400"],
  ["IBM Plex Mono", "plexmono-400", "400"], ["IBM Plex Mono", "plexmono-500", "500"],
];
if (typeof document !== "undefined") {
  const handle = delayRender("Loading kit fonts");
  Promise.all(FONTS.map(([family, file, weight]) => {
    const face = new FontFace(family, `url(${staticFile(`fonts/${file}.woff2`)}) format('woff2')`, { weight });
    document.fonts.add(face);
    return face.load();
  })).then(() => continueRender(handle)).catch((e) => { console.error(e); continueRender(handle); });
}
const bebas = { fontFamily: '"Bebas Neue", Impact, sans-serif' };
const oswald = { fontFamily: '"Oswald", "Arial Narrow", sans-serif' };
const serif = { fontFamily: '"Source Serif 4", Georgia, serif' };
const type = { fontFamily: '"Special Elite", "Courier New", monospace' };
const marker = { fontFamily: '"Permanent Marker", cursive' };
const stamp = { fontFamily: '"Black Ops One", Impact, sans-serif' };
const mono = { fontFamily: '"IBM Plex Mono", monospace' };

/** The Crimson Forecast — strict 3-colour linocut palette (+ helpers) */
export const C = {
  black: "#0A0A0A",
  black2: "#121214",
  black3: "#1C1C1F",
  crimson: "#C4151C",
  crimson2: "#D32F2F",
  crimsonDeep: "#7A0C10",
  cream: "#F4F1EA",
  cream2: "#E8E4DA",
  cream3: "#CFC9BB",
  /** muted cream for secondary text on black */
  ash: "#8F8A80",
  /** highlighter yellow — only used for document highlights */
  highlight: "#F2D03B",
} as const;

export const F = {
  /** Netflix-style tall titles */
  display: bebas.fontFamily,
  /** condensed sans for labels / kickers / lower thirds */
  head: oswald.fontFamily,
  /** editorial serif body */
  serif: serif.fontFamily,
  /** typewriter / declassified docs */
  type: type.fontFamily,
  /** hand-drawn annotations */
  hand: marker.fontFamily,
  /** rubber stamps */
  stamp: stamp.fontFamily,
  /** data / timecodes / CCTV */
  mono: mono.fontFamily,
} as const;

export const VIDEO = { width: 1920, height: 1080, fps: 30 } as const;
