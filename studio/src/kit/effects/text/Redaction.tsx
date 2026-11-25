import React from "react";
import { useCurrentFrame } from "remotion";
import { C, F } from "../../theme";
import { EASE, pop, prog } from "../../lib/anim";
import { Sfx } from "../../lib/sfx";

export type RedactionPart = { text: string; redact?: boolean };

export type RedactedLineProps = {
  parts: RedactionPart[];
  /** frames before the first bar slams on */
  delay?: number;
  /** frames between successive bars */
  stagger?: number;
  /** "slam": bars cover text and stay. "reveal": bars start on and lift away at `revealAt` */
  mode?: "slam" | "reveal";
  /** frame the bars lift (reveal mode) */
  revealAt?: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  barColor?: string;
};

/** A line of text where chosen parts are covered by black redaction bars. */
export const RedactedLine: React.FC<RedactedLineProps> = ({
  parts,
  delay = 0,
  stagger = 6,
  mode = "slam",
  revealAt = 40,
  fontSize = 40,
  fontFamily = F.type,
  color = C.black,
  barColor = C.black,
}) => {
  const frame = useCurrentFrame();
  let barIndex = -1;
  return (
    <div style={{ fontFamily, fontSize, color, lineHeight: 1.6, whiteSpace: "pre" }}>
      {parts.map((part, i) => {
        if (!part.redact) return <span key={i}>{part.text}</span>;
        barIndex++;
        const start = delay + barIndex * stagger;
        let scaleX: number;
        let lift = 0;
        let barOpacity = 1;
        if (mode === "slam") {
          scaleX = Math.min(1.04, pop(frame, start, 14, 320));
        } else {
          scaleX = 1;
          const r = prog(frame, revealAt + barIndex * stagger, 14, EASE.in);
          lift = r;
          barOpacity = 1 - r;
        }
        return (
          <span key={i} style={{ position: "relative", display: "inline-block" }}>
            <span style={{ opacity: mode === "slam" && scaleX > 0.95 ? 0 : 1 }}>{part.text}</span>
            <span
              style={{
                position: "absolute",
                left: -4,
                right: -4,
                top: "14%",
                bottom: "10%",
                backgroundColor: barColor,
                transformOrigin: "left center",
                transform: `scaleX(${scaleX}) translateY(${-lift * 30}px) rotate(${-lift * 3}deg)`,
                opacity: barOpacity,
                boxShadow: "0 2px 0 rgba(0,0,0,0.25)",
              }}
            />
          </span>
        );
      })}
    </div>
  );
};

/** A standalone bar (for laying over images / arbitrary positions). */
export const RedactionBar: React.FC<{
  x: number;
  y: number;
  width: number;
  height?: number;
  delay?: number;
  mode?: "slam" | "reveal";
  revealAt?: number;
  color?: string;
  /** optional tiny label on the bar, e.g. "REDACTED" */
  label?: string;
  /** label colour (default crimson) and px size (default height*0.36) */
  labelColor?: string;
  labelSize?: number;
}> = ({ x, y, width, height = 44, delay = 0, mode = "slam", revealAt = 40, color = C.black, label, labelColor = C.crimson, labelSize }) => {
  const frame = useCurrentFrame();
  const s = mode === "slam" ? Math.min(1.04, pop(frame, delay, 14, 320)) : 1;
  const r = mode === "reveal" ? prog(frame, revealAt, 14, EASE.in) : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        backgroundColor: color,
        transformOrigin: "left center",
        transform: `scaleX(${s}) translateY(${-r * 40}px)`,
        opacity: 1 - r,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        paddingRight: 10,
        boxSizing: "border-box",
      }}
    >
      {label ? (
        <span style={{ fontFamily: F.mono, fontSize: labelSize ?? height * 0.36, color: labelColor, letterSpacing: 3, fontWeight: 700 }}>{label}</span>
      ) : null}
      {/* silent unless <Documentary sfx /> */}
      <Sfx name={mode === "slam" ? "redact" : "paper"} at={mode === "slam" ? delay : revealAt} />
    </div>
  );
};
