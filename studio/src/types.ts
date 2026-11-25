import type {Mood} from './theme';

export type IconName = 'pentagon' | 'shelf' | 'crash' | 'phoneChip' | 'folder' | 'admiral' | 'cia';

export type Scene =
  | (Base & {template: 'title'; big: string; glitch?: boolean})
  | (Base & {template: 'icon'; icon: IconName})
  | (Base & {template: 'quote'; quote: string; speaker: string; role: string; icon: IconName})
  | (Base & {template: 'stat'; parts: string[]}) // e.g. ['2021', '+ 6', '= 2027'], last part is highlighted
  | (Base & {template: 'split'; left: string; right: string; sign: string})
  | (Base & {template: 'cards'; cards: string[]})
  | (Base & {template: 'map'; label: string});

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
