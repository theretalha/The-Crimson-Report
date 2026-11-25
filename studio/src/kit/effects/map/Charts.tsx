import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { getLength, getPointAtLength } from "@remotion/paths";
import { C, F } from "../../theme";
import { prog, EASE } from "../../lib/anim";

type Frame = { x: number; y: number; w: number; h: number };
const DEFAULT_BOX: Frame = { x: 220, y: 230, w: 1480, h: 640 };

const fmt = (n: number, decimals: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

const ChartChrome: React.FC<{
  box: Frame;
  max: number;
  ticks: number;
  title?: string;
  source?: string;
  unit?: string;
  delay: number;
}> = ({ box, max, ticks, title, source, unit, delay }) => {
  const frame = useCurrentFrame();
  const axis = prog(frame, delay, 20);
  return (
    <g>
      {title ? (
        <g opacity={prog(frame, delay, 15)}>
          <rect x={box.x} y={box.y - 150} width={70} height={10} fill={C.crimson} />
          <text x={box.x} y={box.y - 80} fontFamily={F.head} fontWeight={700} fontSize={52} fill={C.cream} letterSpacing={1}>
            {title}
          </text>
          {unit ? (
            <text x={box.x} y={box.y - 36} fontFamily={F.serif} fontSize={28} fill={C.ash}>
              {unit}
            </text>
          ) : null}
        </g>
      ) : null}
      {Array.from({ length: ticks + 1 }, (_, i) => {
        const y = box.y + box.h - (box.h * i) / ticks;
        return (
          <g key={i} opacity={axis}>
            <line
              x1={box.x}
              x2={box.x + box.w * axis}
              y1={y}
              y2={y}
              stroke={i === 0 ? C.cream : C.cream}
              strokeOpacity={i === 0 ? 0.9 : 0.14}
              strokeWidth={i === 0 ? 3 : 1.5}
            />
            <text x={box.x + box.w + 18} y={y + 9} fontFamily={F.mono} fontSize={24} fill={C.ash}>
              {fmt((max * i) / ticks, 0)}
            </text>
          </g>
        );
      })}
      {source ? (
        <text x={box.x} y={box.y + box.h + 120} fontFamily={F.serif} fontSize={22} fill={C.ash} opacity={axis}>
          {source}
        </text>
      ) : null}
    </g>
  );
};

export type BarDatum = { label: string; value: number; highlight?: boolean };

export type BarChartProps = {
  data: BarDatum[];
  /** axis max (defaults to 1.15 × biggest value) */
  max?: number;
  title?: string;
  /** subtitle / unit line */
  unit?: string;
  source?: string;
  /** frame the chart starts */
  delay?: number;
  /** frames between bars starting */
  stagger?: number;
  /** frames each bar takes to grow */
  grow?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
};

/** Animated bar chart — bars grow staggered, values count up, highlighted bar in crimson. */
export const BarChart: React.FC<BarChartProps> = ({
  data,
  max,
  title,
  unit,
  source,
  delay = 0,
  stagger = 6,
  grow = 30,
  decimals = 0,
  prefix = "",
  suffix = "",
}) => {
  const frame = useCurrentFrame();
  const box = DEFAULT_BOX;
  const top = max ?? Math.max(...data.map((d) => d.value)) * 1.15;
  const slot = box.w / data.length;
  const bw = slot * 0.58;
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1920 1080" width="100%" height="100%">
        <ChartChrome box={box} max={top} ticks={4} title={title} unit={unit} source={source} delay={delay} />
        {data.map((d, i) => {
          const p = prog(frame, delay + 15 + i * stagger, grow, EASE.out);
          const h = (d.value / top) * box.h * p;
          const x = box.x + slot * i + (slot - bw) / 2;
          const y = box.y + box.h - h;
          const fill = d.highlight ? C.crimson : C.cream2;
          return (
            <g key={d.label}>
              <rect x={x} y={y} width={bw} height={h} fill={fill} />
              <text
                x={x + bw / 2}
                y={y - 18}
                textAnchor="middle"
                fontFamily={F.display}
                fontSize={52}
                fill={d.highlight ? C.crimson : C.cream}
                opacity={p}
              >
                {prefix}
                {fmt(d.value * p, decimals)}
                {suffix}
              </text>
              <text
                x={x + bw / 2}
                y={box.y + box.h + 48}
                textAnchor="middle"
                fontFamily={F.head}
                fontSize={28}
                letterSpacing={2}
                fill={C.cream}
                opacity={prog(frame, delay + 10 + i * stagger, 12)}
                style={{ textTransform: "uppercase" }}
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

export type LineChartProps = {
  /** y values, evenly spaced on x */
  values: number[];
  /** x-axis labels (same length as values, or fewer to sparsify) */
  labels?: string[];
  max?: number;
  min?: number;
  title?: string;
  unit?: string;
  source?: string;
  delay?: number;
  /** frames to draw the line */
  duration?: number;
  /** index of a point to flag with a callout after the draw */
  calloutIndex?: number;
  calloutText?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
};

/** Animated line chart — line draws on with a dot head + running value, area fill, optional callout. */
export const LineChart: React.FC<LineChartProps> = ({
  values,
  labels = [],
  max,
  min = 0,
  title,
  unit,
  source,
  delay = 0,
  duration = 60,
  calloutIndex,
  calloutText,
  decimals = 0,
  prefix = "",
  suffix = "",
}) => {
  const frame = useCurrentFrame();
  const box = DEFAULT_BOX;
  const top = max ?? Math.max(...values) * 1.15;
  const pts = values.map((v, i) => [
    box.x + (box.w * i) / Math.max(1, values.length - 1),
    box.y + box.h - ((v - min) / (top - min)) * box.h,
  ]);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  const len = useMemo(() => getLength(d), [d]);
  const p = prog(frame, delay + 15, duration, EASE.inOut);
  const head = getPointAtLength(d, Math.max(0.01, len * p)) ?? { x: 0, y: 0 };
  const valueAtHead = (() => {
    const fi = p * (values.length - 1);
    const i = Math.min(values.length - 2, Math.floor(fi));
    const t = fi - i;
    return values[i] + (values[i + 1] - values[i]) * t;
  })();
  const area = `${d} L${pts[pts.length - 1][0]},${box.y + box.h} L${pts[0][0]},${box.y + box.h} Z`;
  const callIn = calloutIndex !== undefined ? prog(frame, delay + 15 + duration, 18) : 0;

  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1920 1080" width="100%" height="100%">
        <defs>
          <linearGradient id="lc-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.crimson} stopOpacity={0.45} />
            <stop offset="1" stopColor={C.crimson} stopOpacity={0} />
          </linearGradient>
          <clipPath id="lc-clip">
            <rect x={box.x} y={0} width={(head.x - box.x) + 1} height={1080} />
          </clipPath>
        </defs>
        <ChartChrome box={box} max={top} ticks={4} title={title} unit={unit} source={source} delay={delay} />
        {labels.map((l, i) => {
          const x = box.x + (box.w * i) / Math.max(1, labels.length - 1);
          return (
            <text
              key={l + i}
              x={x}
              y={box.y + box.h + 48}
              textAnchor="middle"
              fontFamily={F.head}
              fontSize={26}
              letterSpacing={2}
              fill={C.cream}
              opacity={prog(frame, delay + 8, 15)}
            >
              {l}
            </text>
          );
        })}
        <path d={area} fill="url(#lc-area)" clipPath="url(#lc-clip)" />
        <path d={d} fill="none" stroke={C.crimson} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)} />
        {p > 0 ? (
          <g transform={`translate(${head.x} ${head.y})`}>
            <circle r={22} fill={C.crimson} opacity={0.3} />
            <circle r={11} fill={C.cream} stroke={C.crimson} strokeWidth={5} />
            <text x={0} y={-36} textAnchor="middle" fontFamily={F.display} fontSize={56} fill={C.cream}>
              {prefix}
              {fmt(valueAtHead, decimals)}
              {suffix}
            </text>
          </g>
        ) : null}
        {calloutIndex !== undefined && callIn > 0 ? (
          <g opacity={callIn} transform={`translate(${pts[calloutIndex][0]} ${pts[calloutIndex][1]})`}>
            <circle r={40 + (1 - callIn) * 40} fill="none" stroke={C.cream} strokeWidth={4} />
            <line x1={-28} y1={28} x2={-150} y2={150} stroke={C.cream} strokeWidth={3} />
            <text x={-160} y={190} textAnchor="end" fontFamily={F.hand} fontSize={40} fill={C.cream}>
              {calloutText}
            </text>
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};
