import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { prog, wobble } from "../../lib/anim";
import { C } from "../../theme";

/** Radial vignette overlay. */
export const Vignette: React.FC<{
  /** 0..1 darkness at the corners */
  strength?: number;
  /** 0..1 radius where darkening begins */
  inner?: number;
  color?: string;
  /** slow breathing of the vignette (cinematic tension) */
  breathe?: boolean;
}> = ({ strength = 0.6, inner = 0.45, color = C.black, breathe = false }) => {
  const frame = useCurrentFrame();
  const s = breathe ? strength * (1 + 0.12 * wobble("vig", frame, 0.03)) : strength;
  const rgb = parseInt(color.slice(1), 16);
  const r = (rgb >> 16) & 255;
  const g = (rgb >> 8) & 255;
  const b = rgb & 255;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        background: `radial-gradient(ellipse at center, rgba(${r},${g},${b},0) ${inner * 100}%, rgba(${r},${g},${b},${Math.min(1, s)}) 100%)`,
      }}
    />
  );
};

/**
 * Lifts its children off the page with a soft drop shadow; animates the lift
 * (shadow grows, card rises) from `delay` over `duration` frames.
 */
export const DropShadowCard: React.FC<{
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  /** final lift in px */
  depth?: number;
  rotate?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, duration = 18, depth = 30, rotate = 0, style }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, duration);
  const d = depth * p;
  return (
    <div
      style={{
        display: "inline-block",
        transform: `translateY(${-d * 0.4}px) rotate(${rotate}deg) scale(${1 + p * 0.02})`,
        filter: `drop-shadow(0 ${d * 0.6}px ${d}px rgba(0,0,0,${0.25 + 0.3 * p}))`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
