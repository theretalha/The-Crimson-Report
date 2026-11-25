import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, F } from "../../theme";
import { clamp, EASE, prog } from "../../lib/anim";

export type KineticTitleProps = {
  /** lines of words; wrap a word in *asterisks* to make it a crimson accent */
  lines: string[];
  /** frames before the first word lands */
  delay?: number;
  /** frames between words */
  stagger?: number;
  /** "slam": words drop in from big & blurred. "rise": words rise from a mask */
  mode?: "slam" | "rise";
  fontSize?: number;
  color?: string;
  accentColor?: string;
  align?: "left" | "center";
  /** slow push-in of the whole block over the sequence, as a scale delta */
  drift?: number;
  style?: React.CSSProperties;
};

/** Word-by-word Netflix-style title: big Bebas words slam/stack in. */
export const KineticTitle: React.FC<KineticTitleProps> = ({
  lines,
  delay = 0,
  stagger = 5,
  mode = "slam",
  fontSize = 170,
  color = C.cream,
  accentColor = C.crimson,
  align = "center",
  drift = 0.06,
  style,
}) => {
  const frame = useCurrentFrame();
  let idx = 0;
  const push = 1 + interpolate(frame, [0, 300], [0, drift], clamp);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : "flex-start",
        transform: `scale(${push})`,
        ...style,
      }}
    >
      {lines.map((line, li) => (
        <div key={li} style={{ display: "flex", gap: fontSize * 0.22, lineHeight: 0.92, overflow: mode === "rise" ? "hidden" : "visible" }}>
          {line.split(" ").map((raw, wi, arr) => {
            // *word*, *several words* and *word*. (trailing punctuation) all take the accent colour
            let open = false;
            let isAccent = false;
            for (let k = 0; k <= wi; k++) {
              if (arr[k].startsWith("*")) open = true;
              isAccent = open;
              if (/\*[.,?!:]*$/.test(arr[k])) open = false;
            }
            const accent = isAccent;
            const word = raw.replace(/\*/g, "");
            const start = delay + idx++ * stagger;
            const p = prog(frame, start, mode === "slam" ? 7 : 14, mode === "slam" ? EASE.in : EASE.out);
            const settle = prog(frame, start + 7, 8);
            const t =
              mode === "slam"
                ? `scale(${interpolate(p, [0, 1], [1.9, 1]) * (1 + (1 - settle) * 0.03 * (p >= 1 ? 1 : 0))})`
                : `translateY(${(1 - p) * 105}%)`;
            return (
              <span
                key={wi}
                style={{
                  fontFamily: F.display,
                  fontSize,
                  color: accent ? accentColor : color,
                  display: "inline-block",
                  opacity: mode === "slam" ? interpolate(p, [0, 0.4], [0, 1], clamp) : 1,
                  filter: mode === "slam" ? `blur(${(1 - p) * 10}px)` : undefined,
                  transform: t,
                  letterSpacing: 2,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};
