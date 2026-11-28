import type React from 'react';
import {Easing, interpolate, spring} from 'remotion';

// Helpers + types for CUSTOM props (one folder per episode: src/props/custom/epNNN/).
// A custom prop is drawn around its own origin (0,0) like the built-in art: ground at y=0, up is negative. 1920x1080 stage.
// Rules (AGENTS.md rule 1): draw-on strokes, depth (shadow + layering), overshoot (spring), and declared sound events.

export type Ev = {t: number; kind: string; db?: number; f?: number; v?: number; count?: number};

/** Sound kinds the offline mixer (tools/mix_audio.py) can play. NO risers (owner rule, DIRECTOR-NOTES 15). */
export const SFX_KINDS = ['impact', 'braam', 'whoosh', 'tick', 'ping', 'shutter', 'paper', 'marker', 'stamp', 'slam', 'keys', 'glitch'] as const;

export type CustomCompProps = {
  f: number;        // current frame of the scene
  t0: number;       // frame at which the narrated word fires (the prop appears here)
  fg: string;       // ink colour that is readable on this scene's mood (cream on dark, black on facts)
  it: Record<string, any>; // the compose item (it.label, it.text, it.n, it.props ... whatever the shot list passes)
};

export type CustomProp = {
  /** the `p` value used in the shot list / compose items, always `epNNN.name` */
  id: string;
  /** the physical thing this draws, in the narration's own words (director.py checks the narration contains one of `evidence`) */
  describes: string;
  /** regex SOURCE (no slashes) of the narration words that justify this prop, e.g. 'tankers?|oil ship' */
  evidence: string;
  /** counts as a real picture for rule R-EMPTY (almost always true) */
  hero?: boolean;
  /** default scale of the whole prop */
  scale?: number;
  Comp: React.FC<CustomCompProps>;
  /** sound events relative to the scene start; `t` is when the prop appears, in seconds */
  events: (t: number, it: Record<string, any>) => Ev[];
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const FPS = 30;

/** 0..1 progress between frame a and a+len, eased */
export const prog = (f: number, a: number, len: number, easing: (n: number) => number = Easing.out(Easing.cubic)) =>
  interpolate(f, [a, a + Math.max(1, len)], [0, 1], {...clamp, easing});

/** spring with overshoot (0 -> ~1.1 -> 1) starting at frame a */
export const overshoot = (f: number, a: number, fps = FPS) =>
  spring({frame: f - a, fps, config: {damping: 11, stiffness: 150, mass: 0.7}});

/** SVG attributes that make a path DRAW ON over `len` frames starting at frame a (needs pathLength={1} on the element) */
export const drawOn = (f: number, a: number, len = 18) => ({
  pathLength: 1,
  strokeDasharray: '1 1',
  strokeDashoffset: 1 - prog(f, a, len, Easing.inOut(Easing.cubic)),
});

/** soft ground shadow under a thing that stands on y=0 */
export const groundShadowProps = (rx: number, ry = 12) => ({cx: 0, cy: 8, rx, ry, opacity: 0.18});

/** gentle idle bob (px) so a held prop never looks frozen */
export const bob = (f: number, amp = 4, period = 60, phase = 0) => Math.sin(((f + phase) / period) * Math.PI * 2) * amp;
