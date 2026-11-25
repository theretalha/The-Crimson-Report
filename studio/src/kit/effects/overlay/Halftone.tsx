import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { lerp } from "../../lib/anim";
import { C } from "../../theme";
import { useSafeId } from "./shared";

/** Dot-matrix pattern laid over a shot (print/newspaper feel). */
export const HalftoneOverlay: React.FC<{
  color?: string;
  /** dot cell size in px */
  size?: number;
  opacity?: number;
  /** "multiply" for dark dots on light art, "screen" for light dots on dark */
  blend?: React.CSSProperties["mixBlendMode"];
  /** fade the dots in over N frames (0 = static) */
  fadeIn?: number;
}> = ({ color = C.black, size = 10, opacity = 0.35, blend = "multiply", fadeIn = 0 }) => {
  const frame = useCurrentFrame();
  const a = fadeIn > 0 ? lerp(frame, [0, fadeIn], [0, 1]) : 1;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        backgroundImage: `radial-gradient(circle, ${color} 32%, transparent 36%)`,
        backgroundSize: `${size}px ${size}px`,
        mixBlendMode: blend,
        opacity: opacity * a,
      }}
    />
  );
};

const hex = (h: string) => {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

/**
 * Converts children into a true two-colour halftone: dark areas become big
 * `ink` dots on `paper`. `mix` (0..1) blends from original to halftone
 * (animate it with `from`/`duration`).
 */
export const Halftone: React.FC<{
  children: React.ReactNode;
  ink?: string;
  paper?: string;
  /** dot cell size in px */
  size?: number;
  /** frame at which the conversion starts (default: fully halftone from frame 0) */
  from?: number;
  /** frames to blend from original to halftone */
  duration?: number;
}> = ({ children, ink = C.black, paper = C.cream, size = 12, from = 0, duration = 0 }) => {
  const frame = useCurrentFrame();
  const id = useSafeId("ht");
  const mix = duration > 0 ? lerp(frame, [from, from + duration], [0, 1]) : 1;
  const [ir, ig, ib] = hex(ink);
  const [pr, pg, pb] = hex(paper);
  const tile = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'><defs><radialGradient id='g'><stop offset='0' stop-color='black'/><stop offset='1' stop-color='white'/></radialGradient></defs><rect width='${size}' height='${size}' fill='white'/><circle cx='${size / 2}' cy='${size / 2}' r='${size * 0.72}' fill='url(#g)'/></svg>`,
  )}`;
  return (
    <AbsoluteFill>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 0 1"
            result="lum"
          />
          <feImage href={tile} x={0} y={0} width={size} height={size} result="dot" />
          <feTile in="dot" result="dots" />
          <feComposite in="lum" in2="dots" operator="arithmetic" k2={1} k3={1} k4={-0.5} result="sum" />
          <feComponentTransfer in="sum" result="bw">
            <feFuncR type="discrete" tableValues="0 1" />
            <feFuncG type="discrete" tableValues="0 1" />
            <feFuncB type="discrete" tableValues="0 1" />
          </feComponentTransfer>
          <feComponentTransfer in="bw">
            <feFuncR type="table" tableValues={`${ir} ${pr}`} />
            <feFuncG type="table" tableValues={`${ig} ${pg}`} />
            <feFuncB type="table" tableValues={`${ib} ${pb}`} />
            <feFuncA type="linear" slope={0} intercept={1} />
          </feComponentTransfer>
        </filter>
      </svg>
      {mix < 1 ? <AbsoluteFill>{children}</AbsoluteFill> : null}
      {mix > 0 ? <AbsoluteFill style={{ filter: `url(#${id})`, opacity: mix }}>{children}</AbsoluteFill> : null}
    </AbsoluteFill>
  );
};
