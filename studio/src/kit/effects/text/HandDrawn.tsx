import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { evolvePath } from "@remotion/paths";
import { C } from "../../theme";
import { EASE, prog, rnd } from "../../lib/anim";
import { Pt } from "../../lib/types";

type Common = {
  /** frames before drawing starts */
  delay?: number;
  /** frames to fully draw the stroke */
  duration?: number;
  color?: string;
  strokeWidth?: number;
  /** seed for the hand wobble */
  seed?: string;
};

const pathToD = (pts: Pt[]) => {
  if (pts.length < 2) return "";
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2;
    const my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += ` Q${pts[i][0].toFixed(1)},${pts[i][1].toFixed(1)} ${mx.toFixed(1)},${my.toFixed(1)}`;
  }
  const l = pts[pts.length - 1];
  d += ` L${l[0].toFixed(1)},${l[1].toFixed(1)}`;
  return d;
};

const Stroke: React.FC<{ d: string; p: number; color: string; width: number }> = ({ d, p, color, width }) => {
  if (p <= 0) return null;
  const evo = evolvePath(p, d);
  return (
    <>
      {/* double pass = marker texture */}
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={evo.strokeDasharray} strokeDashoffset={evo.strokeDashoffset} opacity={0.9} />
      <path d={d} fill="none" stroke={color} strokeWidth={width * 0.45} strokeLinecap="round" strokeDasharray={evo.strokeDasharray} strokeDashoffset={evo.strokeDashoffset} transform="translate(1.5,-1.5)" opacity={0.6} />
    </>
  );
};

/** Wobbly marker circle/ellipse drawn around a point (full-frame SVG overlay). */
export const HandCircle: React.FC<Common & { cx: number; cy: number; rx: number; ry?: number; /** turns >1 overlaps like a real hand */ turns?: number }> = ({
  cx,
  cy,
  rx,
  ry,
  turns = 1.15,
  delay = 0,
  duration = 20,
  color = C.crimson,
  strokeWidth = 9,
  seed = "hc",
}) => {
  const frame = useCurrentFrame();
  const r2 = ry ?? rx;
  const n = 48;
  const start = -Math.PI * 0.75 + rnd(seed) * 0.6;
  const pts: Pt[] = Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const a = start + t * turns * Math.PI * 2;
    const k = 1 + (rnd(`${seed}${i}`) - 0.5) * 0.06 + t * 0.07;
    return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * r2 * k];
  });
  const p = prog(frame, delay, duration, EASE.inOut);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg viewBox="0 0 1920 1080" width="100%" height="100%">
        <Stroke d={pathToD(pts)} p={p} color={color} width={strokeWidth} />
      </svg>
    </AbsoluteFill>
  );
};

/** Hand underline (slightly wavy, optional double stroke). */
export const HandUnderline: React.FC<Common & { x: number; y: number; width: number; double?: boolean }> = ({
  x,
  y,
  width,
  double = false,
  delay = 0,
  duration = 12,
  color = C.crimson,
  strokeWidth = 8,
  seed = "hu",
}) => {
  const frame = useCurrentFrame();
  const line = (s: string, off: number) => {
    const pts: Pt[] = Array.from({ length: 9 }, (_, i) => [x + (width * i) / 8, y + off + (rnd(`${s}${i}`) - 0.5) * 6 + (i / 8) * -4]);
    return pathToD(pts);
  };
  const p1 = prog(frame, delay, duration, EASE.inOut);
  const p2 = prog(frame, delay + duration * 0.7, duration, EASE.inOut);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg viewBox="0 0 1920 1080" width="100%" height="100%">
        <Stroke d={line(seed, 0)} p={p1} color={color} width={strokeWidth} />
        {double ? <Stroke d={line(seed + "b", strokeWidth * 2)} p={p2} color={color} width={strokeWidth * 0.8} /> : null}
      </svg>
    </AbsoluteFill>
  );
};

/** Curved hand-drawn arrow; the head flicks on when the shaft finishes. */
export const HandArrow: React.FC<Common & { from: Pt; to: Pt; /** bow of the curve, px (negative = up) */ curve?: number; headSize?: number }> = ({
  from,
  to,
  curve = -120,
  headSize = 34,
  delay = 0,
  duration = 16,
  color = C.crimson,
  strokeWidth = 9,
  seed = "ha",
}) => {
  const frame = useCurrentFrame();
  const mx = (from[0] + to[0]) / 2 + (rnd(seed) - 0.5) * 20;
  const my = (from[1] + to[1]) / 2 + curve;
  const shaft = `M${from[0]},${from[1]} Q${mx},${my} ${to[0]},${to[1]}`;
  const ang = Math.atan2(to[1] - my, to[0] - mx);
  const h1: Pt = [to[0] - headSize * Math.cos(ang - 0.45), to[1] - headSize * Math.sin(ang - 0.45)];
  const h2: Pt = [to[0] - headSize * Math.cos(ang + 0.5), to[1] - headSize * Math.sin(ang + 0.5)];
  const head = `M${h1[0]},${h1[1]} L${to[0]},${to[1]} L${h2[0]},${h2[1]}`;
  const p = prog(frame, delay, duration, EASE.inOut);
  const ph = prog(frame, delay + duration, 6);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg viewBox="0 0 1920 1080" width="100%" height="100%">
        <Stroke d={shaft} p={p} color={color} width={strokeWidth} />
        <Stroke d={head} p={ph} color={color} width={strokeWidth} />
      </svg>
    </AbsoluteFill>
  );
};
