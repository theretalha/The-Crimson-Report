import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { geoInterpolate } from "d3-geo";
import { getLength, getPointAtLength } from "@remotion/paths";
import { C, F } from "../../theme";
import { prog, EASE } from "../../lib/anim";
import type { Pt } from "../../lib/types";
import { project, useMap } from "./WorldMap";

export type RouteLineProps = {
  /** waypoints as [lon, lat]; segments follow great circles */
  points: Pt[];
  /** frame the draw starts */
  delay?: number;
  /** frames to draw the full route */
  duration?: number;
  color?: string;
  /** stroke width in screen px */
  width?: number;
  /** show the faint dashed full route underneath */
  trail?: boolean;
  /** optional label that follows the moving head */
  label?: string;
};

/** Build a smooth map-space path through great-circle samples */
const buildPath = (points: Pt[]) => {
  const pts: Pt[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const interp = geoInterpolate(points[i], points[i + 1]);
    for (let s = 0; s < 24; s++) pts.push(project(interp(s / 24) as Pt));
  }
  pts.push(project(points[points.length - 1]));
  // Catmull-Rom → cubic bezier for a hand-plotted smoothness
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return d;
};

/**
 * Animated route (shipping lane / missile arc / supply line): draws on with a
 * glowing head and a dashed ghost of the full route. Place inside <WorldMap>.
 */
export const RouteLine: React.FC<RouteLineProps> = ({
  points,
  delay = 0,
  duration = 75,
  color = C.crimson,
  width = 5,
  trail = true,
  label,
}) => {
  const frame = useCurrentFrame();
  const { zoom } = useMap();
  const d = useMemo(() => buildPath(points), [points]);
  const len = useMemo(() => getLength(d), [d]);
  const p = prog(frame, delay, duration, EASE.inOut);
  const head = getPointAtLength(d, Math.max(0.01, len * p)) ?? { x: 0, y: 0 };
  const w = width / zoom;
  const pulse = 1 + 0.25 * Math.sin(frame / 4);

  return (
    <g>
      {trail ? (
        <path
          d={d}
          fill="none"
          stroke={C.cream}
          strokeOpacity={0.35}
          strokeWidth={w * 0.5}
          strokeDasharray={`${8 / zoom} ${10 / zoom}`}
        />
      ) : null}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={w * 3}
        strokeOpacity={0.25}
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - p)}
      />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={w}
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - p)}
      />
      {p > 0 ? (
        <g transform={`translate(${head.x} ${head.y}) scale(${1 / zoom})`}>
          <circle r={18 * pulse} fill={color} opacity={0.25} />
          <circle r={9} fill={color} stroke={C.cream} strokeWidth={3} />
          {label ? (
            <text
              x={22}
              y={-18}
              fontFamily={F.head}
              fontWeight={700}
              fontSize={26}
              letterSpacing={2}
              fill={C.cream}
              style={{ textTransform: "uppercase" }}
            >
              {label}
            </text>
          ) : null}
        </g>
      ) : null}
    </g>
  );
};
