import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { EASE, prog } from "../../lib/anim";

/** Blur → sharp "lens finding focus" with a tiny breathing scale. */
export const FocusPull: React.FC<{
  children: React.ReactNode;
  delay?: number;
  /** frames */
  duration?: number;
  /** starting blur in px */
  blurFrom?: number;
  /** ending blur in px */
  blurTo?: number;
}> = ({ children, delay = 0, duration = 30, blurFrom = 18, blurTo = 0 }) => {
  const f = useCurrentFrame();
  const p = prog(f, delay, duration, EASE.inOut);
  const b = blurFrom + (blurTo - blurFrom) * p;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ filter: `blur(${b}px)`, transform: `scale(${1.04 - 0.04 * p})` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Rack focus between two layers: `back` starts soft and `front` sharp; at `at`
 * focus shifts (front blurs, back sharpens). `front` should be a cut-out layer.
 */
export const RackFocus: React.FC<{
  back: React.ReactNode;
  front: React.ReactNode;
  /** frame when the rack starts */
  at?: number;
  /** frames */
  duration?: number;
  /** max blur in px */
  blur?: number;
}> = ({ back, front, at = 30, duration = 24, blur = 14 }) => {
  const f = useCurrentFrame();
  const p = prog(f, at, duration, EASE.inOut);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ filter: `blur(${blur * (1 - p)}px)` }}>{back}</AbsoluteFill>
      <AbsoluteFill style={{ filter: `blur(${blur * p}px)`, transform: `scale(${1 + 0.03 * p})` }}>{front}</AbsoluteFill>
    </AbsoluteFill>
  );
};
