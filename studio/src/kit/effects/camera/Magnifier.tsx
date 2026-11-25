import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, F } from "../../theme";
import type { Pt } from "../../lib/types";
import { clamp, EASE, pop, prog } from "../../lib/anim";

const along = (pts: Pt[], t: number): Pt => {
  if (pts.length === 1) return pts[0];
  const seg = Math.min(pts.length - 2, Math.floor(t * (pts.length - 1)));
  const local = t * (pts.length - 1) - seg;
  const a = pts[seg];
  const b = pts[seg + 1];
  return [a[0] + (b[0] - a[0]) * local, a[1] + (b[1] - a[1]) * local];
};

/**
 * Magnifying glass that travels over `children` along `path` and shows a
 * zoomed copy inside the lens — the "unseen detail" callout.
 */
export const Magnifier: React.FC<{
  children: React.ReactNode;
  /** lens-centre waypoints in px (1920x1080); the last point is where it rests */
  path?: Pt[];
  delay?: number;
  /** frames to travel the path */
  travel?: number;
  /** lens radius px */
  radius?: number;
  /** magnification inside the lens */
  zoom?: number;
  /** darkens the frame outside the lens once settled (0-1) */
  dim?: number;
  /** hand-written label that pops after arriving */
  label?: string;
}> = ({
  children,
  path = [
    [500, 300],
    [1180, 470],
  ],
  delay = 0,
  travel = 45,
  radius = 190,
  zoom = 2.4,
  dim = 0.5,
  label,
}) => {
  const f = useCurrentFrame();
  const appear = Math.min(1, pop(f, delay, 14, 140));
  const t = prog(f, delay + 6, travel, EASE.inOut);
  const [cx, cy] = along(path, t);
  const settled = prog(f, delay + 6 + travel, 14);
  const r = Math.max(1, radius * appear);
  const z = 1 + (zoom - 1) * appear;
  const ang = (40 * Math.PI) / 180;
  const hx = cx + Math.cos(ang) * r;
  const hy = cy + Math.sin(ang) * r;
  const labelP = interpolate(f, [delay + 10 + travel, delay + 22 + travel], [0, 1], clamp);
  return (
    <AbsoluteFill>
      {children}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${cx}px ${cy}px, transparent ${r}px, rgba(10,10,10,${dim * settled}) ${r + 2}px)`,
        }}
      />
      <AbsoluteFill style={{ clipPath: `circle(${r}px at ${cx}px ${cy}px)` }}>
        <AbsoluteFill
          style={{
            transform: `translate(${cx}px, ${cy}px) scale(${z}) translate(${-cx}px, ${-cy}px)`,
            transformOrigin: "0 0",
          }}
        >
          {children}
        </AbsoluteFill>
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at ${cx - r * 0.35}px ${cy - r * 0.4}px, rgba(255,255,255,0.22), transparent ${r * 0.7}px)`,
          }}
        />
      </AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <line x1={hx} y1={hy} x2={hx + r * 0.9} y2={hy + r * 0.75} stroke={C.black} strokeWidth={r * 0.2} strokeLinecap="round" />
        <line x1={hx} y1={hy} x2={hx + r * 0.9} y2={hy + r * 0.75} stroke={C.crimson} strokeWidth={r * 0.12} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.black} strokeWidth={r * 0.13} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.crimson} strokeWidth={r * 0.07} />
      </svg>
      {label ? (
        <div
          style={{
            position: "absolute",
            left: cx - radius - 40,
            top: cy - radius - 110,
            fontFamily: F.hand,
            fontSize: 64,
            color: C.crimson,
            transform: `rotate(-6deg) scale(${labelP})`,
            transformOrigin: "left bottom",
            textShadow: `3px 3px 0 ${C.black}`,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
