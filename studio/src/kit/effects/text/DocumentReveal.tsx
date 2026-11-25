import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, F } from "../../theme";
import { clamp, EASE, prog } from "../../lib/anim";
// Placeholder text lines (pass your own `lines`)
export const DOC_LINES = [
  "1. Maritime chokepoints remain the single",
  "   largest risk to global energy supply.",
  "2. A sustained closure would push crude",
  "   above $130 per barrel within weeks.",
  "3. Semiconductor supply is concentrated in",
  "   one island; disruption is systemic.",
  "4. Automation will reprice white-collar",
  "   labour faster than policy can respond.",
  "5. Contingency planning is advised.",
];
import { HighlightSpan } from "./Highlighter";
import { RedactedLine } from "./Redaction";
import { RubberStamp, useStampShake } from "./Stamp";

export type DocumentRevealProps = {
  title?: string;
  lines?: string[];
  /** line indices to highlight (marker sweep), in order */
  highlight?: number[];
  /** line indices to redact (black bars) */
  redact?: number[];
  /** stamp text, or null for none */
  stamp?: string | null;
  /** frame the page lands */
  delay?: number;
  /** frame the first highlight starts (relative) */
  highlightAt?: number;
  /** frame redactions start */
  redactAt?: number;
  /** frame of the stamp impact */
  stampAt?: number;
};

/**
 * Declassified-document shot: page slides up & tilts in on black, camera
 * drifts toward the highlighted lines, bars slam on, stamp hits.
 */
export const DocumentReveal: React.FC<DocumentRevealProps> = ({
  title = "STRATEGIC ASSESSMENT 2027",
  lines = DOC_LINES,
  highlight = [2, 3],
  redact = [6, 7],
  stamp = "TOP SECRET",
  delay = 0,
  highlightAt = 26,
  redactAt = 60,
  stampAt = 84,
}) => {
  const frame = useCurrentFrame();
  const land = prog(frame, delay, 26, EASE.out);
  const drift = interpolate(frame, [delay, delay + 240], [0, 1], clamp);
  const shake = useStampShake(delay + stampAt, 12);
  return (
    <AbsoluteFill style={{ backgroundColor: C.black, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: shake }}>
        <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center" }}>
          <div
            style={{
              marginTop: 60,
              transform: `translateY(${(1 - land) * 900}px) rotate(${(1 - land) * 8 - 1.5}deg) scale(${0.78 + drift * 0.1})`,
              transformOrigin: "50% 30%",
            }}
          >
            <div
              style={{
                width: 1150,
                backgroundColor: C.cream,
                boxShadow: "0 40px 90px rgba(0,0,0,0.6)",
                padding: "80px 100px 110px",
                boxSizing: "border-box",
                fontFamily: F.type,
                color: C.black,
              }}
            >
              <div style={{ fontSize: 26, letterSpacing: 6, color: C.crimson }}>CLASSIFICATION: RESTRICTED</div>
              <div style={{ fontSize: 58, marginTop: 20, lineHeight: 1.1 }}>{title}</div>
              <div style={{ height: 4, background: C.black, margin: "26px 0 30px" }} />
              {lines.map((l, i) => {
                const hi = highlight.indexOf(i);
                const re = redact.indexOf(i);
                if (re >= 0) {
                  const lead = l.match(/^\s*\d*\.?\s*/)?.[0] ?? "";
                  return (
                    <RedactedLine
                      key={i}
                      parts={[{ text: lead }, { text: l.slice(lead.length), redact: true }]}
                      delay={delay + redactAt + re * 6}
                      fontSize={34}
                    />
                  );
                }
                return (
                  <div key={i} style={{ fontSize: 34, lineHeight: 1.6, whiteSpace: "pre" }}>
                    {hi >= 0 ? (
                      <HighlightSpan delay={delay + highlightAt + hi * 14} duration={16} uid={`dr${i}`}>
                        {l}
                      </HighlightSpan>
                    ) : (
                      l
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
      {stamp ? <RubberStamp text={stamp} x={1130} y={720} rotate={-12} delay={delay + stampAt} size={80} /> : null}
    </AbsoluteFill>
  );
};
