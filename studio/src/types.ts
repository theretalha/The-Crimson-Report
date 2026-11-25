import type {Mood} from './theme';

export type IconName = 'pentagon' | 'shelf' | 'crash' | 'phoneChip' | 'folder' | 'admiral' | 'cia';

export type Scene =
  | (Base & {template: 'title'; big: string; glitch?: boolean})
  | (Base & {template: 'icon'; icon: IconName})
  | (Base & {template: 'quote'; quote: string; speaker: string; role: string; icon: IconName})
  | (Base & {template: 'stat'; parts: string[]}) // e.g. ['2021', '+ 6', '= 2027'], last part is highlighted
  | (Base & {template: 'split'; left: string; right: string; sign: string})
  | (Base & {template: 'cards'; cards: string[]})
  | (Base & {template: 'map'; label: string})
  // Real news clip: screenshot/thumbnail + outlet + real headline. Keep the URL as proof.
  | (Base & {template: 'headline'; outlet: string; date: string; headline: string; mark: string; image: string; url: string})
  // Real document/transcript line, e.g. congressional testimony
  | (Base & {template: 'document'; docTitle: string; docMeta: string; quote: string; mark: string; url: string})
  // Real post from X. Fill it in from the actual post only, never invent one.
  // Photo cards on a dark board with typewriter name tags. Use only real, free-to-use photos.
  | (Base & {template: 'photos'; photos: {image: string; name: string; role: string; credit: string}[]})
  // Old newspaper scan (public domain / archive). underline = red pen lines, in % of the image.
  | (Base & {template: 'newspaper'; image: string; paper: string; date: string; underline: {x: number; y: number; w: number}[]; credit: string; url: string})
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
  note?: string; // retention technique (only shown in the annotated version)
};
