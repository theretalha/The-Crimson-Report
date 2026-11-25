import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { DirectionalBlur, WhipDirection } from "../../transitions/whipPan";
import { EASE, prog } from "../../lib/anim";
import { useSafeId } from "./util";

/**
 * Standalone whip pan between two shots inside one Sequence
 * (use the `whipPan()` presentation when working with TransitionSeries).
 */
export const WhipPan: React.FC<{
  from: React.ReactNode;
  to: React.ReactNode;
  /** frame the whip starts */
  at?: number;
  /** frames */
  duration?: number;
  direction?: WhipDirection;
  /** peak blur px */
  blur?: number;
}> = ({ from, to, at = 45, duration = 14, direction = "left", blur = 70 }) => {
  const f = useCurrentFrame();
  const id = useSafeId("whipc");
  const p = prog(f, at, duration, EASE.inOut);
  const axis = direction === "left" || direction === "right" ? "x" : "y";
  const sign = direction === "left" || direction === "up" ? -1 : 1;
  const b = Math.sin(Math.PI * p) * blur;
  const tr = (o: number) => (axis === "x" ? `translateX(${o}%)` : `translateY(${o}%)`);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <DirectionalBlur id={id} amount={b} axis={axis} />
      <AbsoluteFill style={{ filter: b > 0.5 ? `url(#${id})` : undefined }}>
        <AbsoluteFill style={{ transform: tr(sign * p * 100) }}>{from}</AbsoluteFill>
        <AbsoluteFill style={{ transform: tr(-sign * (1 - p) * 100) }}>{to}</AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Fast zoom-blur punch-in to a point of `children` (single shot) */
export const ZoomPunch: React.FC<{
  children: React.ReactNode;
  /** frame the punch starts */
  at?: number;
  /** frames */
  duration?: number;
  /** final scale */
  scale?: number;
  /** focal point in % */
  focal?: [number, number];
  /** peak blur px */
  blur?: number;
}> = ({ children, at = 20, duration = 10, scale = 2.2, focal = [50, 50], blur = 16 }) => {
  const f = useCurrentFrame();
  const p = prog(f, at, duration, EASE.in);
  const b = Math.sin(Math.PI * Math.min(1, p * 1.2)) * blur;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${1 + (scale - 1) * p})`,
          transformOrigin: `${focal[0]}% ${focal[1]}%`,
          filter: `blur(${b}px)`,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
