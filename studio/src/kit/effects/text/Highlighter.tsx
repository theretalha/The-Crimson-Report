import React from "react";
import { useCurrentFrame } from "remotion";
import { C, F } from "../../theme";
import { EASE, prog } from "../../lib/anim";
import { RoughEdgeFilter } from "../../lib/textures";

export type HighlighterProps = {
  /** one entry per line; each line gets its own sweep */
  lines: string[];
  /** frames before the first sweep starts */
  delay?: number;
  /** frames each line takes to sweep left→right */
  duration?: number;
  /** frames between line starts */
  stagger?: number;
  /** marker colour ("yellow" | "crimson" | any css colour) */
  color?: "yellow" | "crimson" | string;
  fontSize?: number;
  fontFamily?: string;
  /** text colour before/without highlight */
  textColor?: string;
  /** text colour once the marker has passed (defaults to textColor) */
  highlightTextColor?: string;
  /** unique id for the rough-edge filter */
  uid?: string;
  style?: React.CSSProperties;
};

const resolve = (c: string) => (c === "yellow" ? C.highlight : c === "crimson" ? C.crimson : c);

/** Rough-edged marker that sweeps behind each line of text, left → right. */
export const Highlighter: React.FC<HighlighterProps> = ({
  lines,
  delay = 0,
  duration = 18,
  stagger = 14,
  color = "yellow",
  fontSize = 56,
  fontFamily = F.serif,
  textColor = C.black,
  highlightTextColor,
  uid = "hl",
  style,
}) => {
  const frame = useCurrentFrame();
  const marker = resolve(color);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: fontSize * 0.25, ...style }}>
      <RoughEdgeFilter uid={uid} scale={7} freq={0.06} />
      {lines.map((line, i) => {
        const p = prog(frame, delay + i * stagger, duration, EASE.inOut);
        return (
          <div key={i} style={{ position: "relative", alignSelf: "flex-start" }}>
            <div
              style={{
                position: "absolute",
                left: -fontSize * 0.18,
                right: -fontSize * 0.18,
                top: "18%",
                bottom: "8%",
                backgroundColor: marker,
                opacity: 0.92,
                transform: `rotate(${i % 2 ? 0.6 : -0.8}deg) skewX(-6deg)`,
                clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`,
                filter: `url(#rough-edge-${uid})`,
              }}
            />
            <div
              style={{
                position: "relative",
                fontFamily,
                fontSize,
                lineHeight: 1.15,
                whiteSpace: "pre",
                color: p > 0.5 && highlightTextColor ? highlightTextColor : textColor,
              }}
            >
              {line}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Inline wrapper: sweeps a marker behind any children (single line). */
export const HighlightSpan: React.FC<{
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  color?: "yellow" | "crimson" | string;
  uid?: string;
}> = ({ children, delay = 0, duration = 16, color = "yellow", uid = "hls" }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, duration, EASE.inOut);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <RoughEdgeFilter uid={uid} scale={6} freq={0.06} />
      <span
        style={{
          position: "absolute",
          left: "-0.12em",
          right: "-0.12em",
          top: "15%",
          bottom: "5%",
          backgroundColor: resolve(color),
          transform: "skewX(-6deg)",
          clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`,
          filter: `url(#rough-edge-${uid})`,
        }}
      />
      <span style={{ position: "relative" }}>{children}</span>
    </span>
  );
};
