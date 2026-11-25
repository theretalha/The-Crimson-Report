import type {Mood} from './theme';

export type IconName = 'pentagon' | 'shelf' | 'crash' | 'phoneChip' | 'folder' | 'admiral' | 'cia'
  | 'servers' | 'boxes' | 'idcard' | 'whitehouse' | 'capitol' | 'chip' | 'chartV' | 'radar' | 'magnifier'
  | 'photos' | 'petition' | 'scales' | 'letter' | 'doorShut';

export type Pin = {lon: number; lat: number; label: string};

export type Scene =
  | (Base & {template: 'title'; big: string; glitch?: boolean})
  | (Base & {template: 'icon'; icon: IconName})
  | (Base & {template: 'quote'; quote: string; speaker: string; role: string; icon: IconName})
  | (Base & {template: 'stat'; parts: string[]}) // e.g. ['2021', '+ 6', '= 2027'], last part is highlighted
  | (Base & {template: 'split'; left: string; right: string; sign: string})
  | (Base & {template: 'cards'; cards: string[]})
  | (Base & {template: 'map'; label?: string; center?: [number, number]; zoom?: number; pins?: Pin[]; highlight?: string[]; arrow?: boolean})
  | (Base & {template: 'timeline'; points: {label: string; sub?: string}[]})
  // Real NVDA price chart (src/data/nvda.json). Draws left to right with a live drop counter, event pins and an optional record slam.
  | (Base & {template: 'chart'; from: string; to: string; pins: {date: string; label: string}[]; counter?: boolean; slam?: {date: string; big: string; sub: string; tag: string}})
  // Real news clip: screenshot/thumbnail + outlet + real headline. Keep the URL as proof.
  | (Base & {template: 'headline'; outlet: string; date: string; headline: string; mark: string; image?: string; url: string})
  // Real document/transcript line, e.g. congressional testimony
  | (Base & {template: 'document'; docTitle: string; docMeta: string; quote: string; mark: string; url: string})
  // Real post from X. Fill it in from the actual post only, never invent one.
  // Photo cards on a dark board with typewriter name tags. Use only real, free-to-use photos.
  | (Base & {template: 'photos'; photos: {image: string; name: string; role: string; credit: string}[]})
  // Old newspaper scan (public domain / archive). underline = red pen lines, in % of the image.
  | (Base & {template: 'newspaper'; image: string; paper: string; date: string; underline: {x: number; y: number; w: number}[]; credit: string; url: string})
  // Hand-composed scene built from the Remotion kit effects (see templates/Recipes.tsx)
  | (Base & {template: 'recipe'; recipe: string})
  | (Base & {template: 'tweet'; name: string; handle: string; date: string; text: string; mark: string; url: string});

type Base = {
  mood: Mood;
  chapter: string; // e.g. "00 / THE 2027 PROBLEM"
  title?: string; // big headline top-left
  sub?: string; // small line under the headline
  caption: string; // narration line, shown as karaoke captions
  highlight?: string[]; // words to put in the crimson box
  source?: string; // source line bottom-left
  seconds: number; // how long the scene stays on screen
  speak?: number; // seconds of actual speech (captions finish by then)
  fx?: 'reveal' | 'twist'; // sound design: riser → drop-out → big hit exactly on this scene
  line?: number; // narration line this scene belongs to (used to find the pause before it)
  part?: number; // which visual of that line (0 = first)
  note?: string; // retention technique (only shown in the annotated version)
};
