import React from "react";
import { useCurrentFrame } from "remotion";
import { C, F } from "../../theme";
import { prog, EASE } from "../../lib/anim";

export type NumberCounterProps = {
  /** final value */
  value: number;
  /** starting value */
  from?: number;
  /** decimals shown */
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** frame the roll starts */
  delay?: number;
  /** frames to roll from → value */
  duration?: number;
  fontSize?: number;
  color?: string;
  /** colour of prefix/suffix */
  accent?: string;
  /** thousands separators */
  separators?: boolean;
};

/**
 * Odometer counter: each digit is a rolling column; low digits spin fast,
 * higher digits click over only on carry (like a mechanical counter).
 */
export const NumberCounter: React.FC<NumberCounterProps> = ({
  value,
  from = 0,
  decimals = 0,
  prefix = "",
  suffix = "",
  delay = 0,
  duration = 60,
  fontSize = 200,
  color = C.cream,
  accent = C.crimson,
  separators = true,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, duration, EASE.cinematic);
  const v = (from + (value - from) * p) * Math.pow(10, decimals);
  const maxInt = Math.round(Math.max(Math.abs(value), Math.abs(from)) * Math.pow(10, decimals));
  const places = Math.max(decimals + 1, String(maxInt).length);
  const h = fontSize * 1.05;

  const cols: React.ReactNode[] = [];
  for (let k = places - 1; k >= 0; k--) {
    const rolled = Math.abs(v) / Math.pow(10, k);
    const base = Math.floor(rolled);
    const frac = rolled - base;
    // the lowest place rolls continuously; higher places only during carry
    const lowerFrac = k === 0 ? frac : Math.max(0, (Math.abs(v) / Math.pow(10, k - 1)) % 10 - 9);
    const pos = (base % 10) + (k === 0 ? frac : lowerFrac);
    // leading zeros stay dimmed until the number grows into that place
    const show = k <= decimals || Math.abs(v) >= Math.pow(10, k) - 1;
    cols.push(
      <span
        key={`d${k}`}
        style={{
          display: "inline-block",
          height: h,
          overflow: "hidden",
          width: fontSize * 0.5,
          opacity: show ? 1 : 0.18,
          position: "relative",
        }}
      >
        <span style={{ display: "block", transform: `translateY(${-pos * h}px)` }}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n, i) => (
            <span key={i} style={{ display: "block", height: h, lineHeight: `${h}px`, textAlign: "center" }}>
              {n}
            </span>
          ))}
        </span>
      </span>,
    );
    if (k === decimals && decimals > 0) {
      cols.push(<span key="dot">.</span>);
    } else if (separators && k > decimals && (k - decimals) % 3 === 0) {
      cols.push(
        <span key={`s${k}`} style={{ width: fontSize * 0.22, display: "inline-block", textAlign: "center" }}>
          ,
        </span>,
      );
    }
  }

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontFamily: F.display,
        fontSize,
        lineHeight: 1,
        color,
        fontVariantNumeric: "tabular-nums",
        // soft roll blur mask at top/bottom of the digit window
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 14%, #000 86%, transparent 100%)",
      }}
    >
      {value < 0 ? <span>−</span> : null}
      {prefix ? <span style={{ color: accent, marginRight: fontSize * 0.05 }}>{prefix}</span> : null}
      {cols}
      {suffix ? (
        <span style={{ color: accent, fontSize: fontSize * 0.42, marginLeft: fontSize * 0.08, alignSelf: "flex-end", marginBottom: fontSize * 0.12 }}>
          {suffix}
        </span>
      ) : null}
    </div>
  );
};
