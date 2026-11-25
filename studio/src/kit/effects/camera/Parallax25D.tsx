import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE, prog, wobble } from "../../lib/anim";

export type ParallaxLayer = {
  node: React.ReactNode;
  /** 0 = far background (barely moves) … 1 = nearest foreground (moves most) */
  depth: number;
};

/**
 * 2.5D parallax: separated layers push-in and drift at different rates so a
 * flat illustration gains depth. Animates over `duration` (default: whole Sequence).
 */
export const Parallax25D: React.FC<{
  layers: ParallaxLayer[];
  delay?: number;
  /** frames; default = Sequence duration */
  duration?: number;
  /** extra scale added to the nearest layer by the end (0.25 = +25%) */
  push?: number;
  /** horizontal drift of the nearest layer in px (negative = left) */
  driftX?: number;
  /** vertical drift of the nearest layer in px */
  driftY?: number;
  /** subtle handheld float in px (0 = locked off) */
  float?: number;
}> = ({ layers, delay = 0, duration, push = 0.18, driftX = -60, driftY = 0, float = 4 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = prog(frame, delay, duration ?? durationInFrames - delay, EASE.cinematic);
  const fx = wobble("plx-x", frame, 0.02) * float;
  const fy = wobble("plx-y", frame, 0.02) * float;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {layers.map((l, i) => {
        const s = 1.04 + push * l.depth * p + 0.02 * l.depth;
        const x = driftX * l.depth * (p - 0.5) + fx * l.depth;
        const y = driftY * l.depth * (p - 0.5) + fy * l.depth;
        return (
          <AbsoluteFill
            key={i}
            style={{ transform: `translate(${x}px, ${y}px) scale(${s})`, transformOrigin: "50% 55%" }}
          >
            {l.node}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
