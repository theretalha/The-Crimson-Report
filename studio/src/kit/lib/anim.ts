import { Easing, interpolate, random, spring } from "remotion";
import { noise2D } from "@remotion/noise";
import { VIDEO } from "../theme";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  cinematic: Easing.bezier(0.33, 0, 0.2, 1),
} as const;

/** 0→1 progress of `frame` between start and start+length (clamped, eased) */
export const prog = (
  frame: number,
  start: number,
  length: number,
  easing: (t: number) => number = EASE.out,
) => interpolate(frame, [start, start + Math.max(1, length)], [0, 1], { ...clamp, easing });

/** linear map with clamp */
export const lerp = (frame: number, input: number[], output: number[]) =>
  interpolate(frame, input, output, clamp);

/** springy pop 0→~1 starting at delay */
export const pop = (frame: number, delay = 0, damping = 12, stiffness = 160) =>
  spring({ frame: frame - delay, fps: VIDEO.fps, config: { damping, stiffness, mass: 0.7 } });

/** smooth spring 0→1, no overshoot */
export const smooth = (frame: number, delay = 0, durationInFrames?: number) =>
  spring({ frame: frame - delay, fps: VIDEO.fps, config: { damping: 200 }, durationInFrames });

/** deterministic organic wobble (-1..1) */
export const wobble = (seed: string, frame: number, speed = 0.05, y = 0) =>
  noise2D(seed, frame * speed, y);

/** deterministic random 0..1 */
export const rnd = (seed: string | number) => random(seed);

/** stop-motion style: hold values for `every` frames (e.g. 12fps feel at every=3) */
export const stepped = (frame: number, every = 3) => Math.floor(frame / every) * every;

export const sec = (s: number) => Math.round(s * VIDEO.fps);
