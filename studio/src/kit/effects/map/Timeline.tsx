import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, F } from "../../theme";
import { clamp, EASE, pop, prog } from "../../lib/anim";

export type Milestone = {
  /** fractional years allowed, e.g. 2026.5 */
  year: number;
  label: string;
  /** crimson emphasis (e.g. the 2027 deadline) */
  highlight?: boolean;
  /** label above (default alternates) */
  above?: boolean;
};

export type TimelineProps = {
  startYear?: number;
  endYear?: number;
  milestones: Milestone[];
  /** frame the scroll starts */
  delay?: number;
  /** frames for the playhead to travel start → end */
  duration?: number;
  /** px per year on the track */
  yearWidth?: number;
};

/**
 * Horizontal timeline that scrolls under a fixed centre playhead; milestones
 * pop as the playhead reaches them. Highlighted years go crimson.
 */
export const Timeline: React.FC<TimelineProps> = ({
  startYear = 2024,
  endYear = 2030,
  milestones,
  delay = 0,
  duration = 120,
  yearWidth = 520,
}) => {
  const frame = useCurrentFrame();
  const cur = interpolate(frame, [delay, delay + duration], [startYear, endYear], {
    ...clamp,
    easing: EASE.inOut,
  });
  const cy = 560;
  const xOf = (y: number) => 960 + (y - cur) * yearWidth;
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  const intro = prog(frame, delay - 10, 20);
  // frame at which the playhead reaches a given year (inverse of easing is approximated by search)
  const reachFrame = (y: number) => {
    for (let f = delay; f <= delay + duration; f++) {
      const c = interpolate(f, [delay, delay + duration], [startYear, endYear], { ...clamp, easing: EASE.inOut });
      if (c >= y) return f;
    }
    return delay + duration;
  };

  return (
    <AbsoluteFill style={{ opacity: intro }}>
      <svg viewBox="0 0 1920 1080" width="100%" height="100%">
        <defs>
          <linearGradient id="tl-fade" x1="0" x2="1">
            <stop offset="0" stopColor={C.black} stopOpacity={1} />
            <stop offset="0.18" stopColor={C.black} stopOpacity={0} />
            <stop offset="0.82" stopColor={C.black} stopOpacity={0} />
            <stop offset="1" stopColor={C.black} stopOpacity={1} />
          </linearGradient>
        </defs>
        {/* track */}
        <line x1={xOf(startYear - 1)} x2={xOf(endYear + 1)} y1={cy} y2={cy} stroke={C.cream} strokeOpacity={0.35} strokeWidth={4} />
        <line x1={xOf(startYear)} x2={960} y1={cy} y2={cy} stroke={C.crimson} strokeWidth={6} />
        {/* quarter ticks + years */}
        {years.map((y) => (
          <g key={y}>
            {[0.25, 0.5, 0.75].map((q) =>
              y + q <= endYear ? (
                <line key={q} x1={xOf(y + q)} x2={xOf(y + q)} y1={cy - 10} y2={cy + 10} stroke={C.cream} strokeOpacity={0.3} strokeWidth={2} />
              ) : null,
            )}
            <line x1={xOf(y)} x2={xOf(y)} y1={cy - 26} y2={cy + 26} stroke={C.cream} strokeWidth={3} />
            <text
              x={xOf(y)}
              y={cy + 92}
              textAnchor="middle"
              fontFamily={F.display}
              fontSize={Math.abs(y - cur) < 0.5 ? 92 : 64}
              fill={milestones.some((m) => m.highlight && Math.floor(m.year) === y) ? C.crimson : C.cream}
              opacity={interpolate(Math.abs(y - cur), [0, 2.5], [1, 0.35], clamp)}
            >
              {y}
            </text>
          </g>
        ))}
        {/* milestones */}
        {milestones.map((m, i) => {
          const s = pop(frame, reachFrame(m.year) - 4, 11, 170);
          const above = m.above ?? i % 2 === 0;
          const x = xOf(m.year);
          const dir = above ? -1 : 1;
          const col = m.highlight ? C.crimson : C.cream;
          return (
            <g key={m.label} transform={`translate(${x} ${cy})`}>
              <line x1={0} y1={0} x2={0} y2={dir * 150 * Math.min(1, s)} stroke={col} strokeWidth={3} />
              <circle r={14 * Math.min(1.2, s)} fill={col} stroke={C.black} strokeWidth={4} />
              {m.highlight ? <circle r={34 * s} fill="none" stroke={C.crimson} strokeWidth={3} opacity={0.6} /> : null}
              <g opacity={Math.min(1, s)} transform={`translate(0 ${dir * (170 + (1 - Math.min(1, s)) * 20)})`}>
                <text
                  textAnchor="middle"
                  y={above ? 0 : 30}
                  fontFamily={F.head}
                  fontWeight={700}
                  fontSize={34}
                  letterSpacing={2}
                  fill={col}
                  style={{ textTransform: "uppercase" }}
                >
                  {m.label}
                </text>
              </g>
            </g>
          );
        })}
        {/* fixed playhead */}
        <line x1={960} x2={960} y1={cy - 260} y2={cy + 40} stroke={C.crimson} strokeWidth={2} strokeDasharray="6 8" />
        <polygon points={`948,${cy - 270} 972,${cy - 270} 960,${cy - 250}`} fill={C.crimson} />
        <rect width={1920} height={1080} fill="url(#tl-fade)" />
      </svg>
    </AbsoluteFill>
  );
};
