import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { EASE, prog, rnd } from "../../lib/anim";
import { C } from "../../theme";
import type { Pt } from "../../lib/types";

/** SVG-as-image mask: displaced blob + splatter drops, white = visible. */
const inkMaskUrl = (p: number, origin: Pt, seed: string, grow: number) => {
  const maxR = 2300 * grow;
  const r = Math.max(0.01, p * maxR);
  const drops = Array.from({ length: 26 }, (_, i) => {
    const a = rnd(`${seed}a${i}`) * Math.PI * 2;
    const dist = (0.5 + rnd(`${seed}d${i}`) * 0.9) * r;
    const dr = (6 + rnd(`${seed}r${i}`) * 34) * Math.min(1, p * 3);
    return `<circle cx='${origin[0] + Math.cos(a) * dist}' cy='${origin[1] + Math.sin(a) * dist}' r='${dr}'/>`;
  }).join("");
  const sNum = Math.floor(rnd(seed) * 100);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080' viewBox='0 0 1920 1080'><filter id='f' x='-20%' y='-20%' width='140%' height='140%'><feTurbulence type='fractalNoise' baseFrequency='0.012' numOctaves='4' seed='${sNum}'/><feDisplacementMap in='SourceGraphic' scale='${120 + 60 * p}' xChannelSelector='R' yChannelSelector='G'/></filter><g fill='white' filter='url(#f)'><circle cx='${origin[0]}' cy='${origin[1]}' r='${r}'/>${drops}</g></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
};

/** Low-level mask driven by an explicit progress (0..1). */
export const InkMask: React.FC<{
  children: React.ReactNode;
  progress: number;
  origin?: Pt;
  /** colour of the wet ink rim around the reveal ("none" to disable) */
  rim?: string;
  seed?: string;
}> = ({ children, progress, origin = [960, 540], rim = C.crimson, seed = "ink" }) => {
  if (progress <= 0) return null;
  if (progress >= 1) return <AbsoluteFill>{children}</AbsoluteFill>;
  const m = inkMaskUrl(progress, origin, seed, 1);
  const rimMask = inkMaskUrl(Math.min(1, progress * 1.06 + 0.01), origin, seed, 1);
  const maskStyle = (url: string): React.CSSProperties => ({
    WebkitMaskImage: url,
    maskImage: url,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
  });
  return (
    <AbsoluteFill>
      {rim !== "none" ? <AbsoluteFill style={{ backgroundColor: rim, ...maskStyle(rimMask) }} /> : null}
      <AbsoluteFill style={maskStyle(m)}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Ink bleed / paint splatter reveal: children spread out from `origin`
 * as an organic ink blot over `duration` frames after `delay`.
 */
export const InkBleedReveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  origin?: Pt;
  rim?: string;
  seed?: string;
}> = ({ children, delay = 0, duration = 40, origin, rim, seed }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, duration, EASE.inOut);
  return (
    <InkMask progress={p} origin={origin} rim={rim} seed={seed}>
      {children}
    </InkMask>
  );
};
