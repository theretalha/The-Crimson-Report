import React, { useId } from "react";
import { rnd } from "../../lib/anim";
import { Pt } from "../../lib/types";

/** React.useId() made safe for use inside url(#…) references */
export const useUid = (prefix: string) => `${prefix}-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

/**
 * Deterministic jagged tear line across a box.
 * vertical=true → line runs top→bottom near x = w*pos (returns points top→bottom)
 */
export const tearLine = (
  w: number,
  h: number,
  vertical: boolean,
  seed: string,
  pos = 0.5,
  roughness = 36,
  steps = 34,
): Pt[] => {
  const len = vertical ? h : w;
  const across = vertical ? w : h;
  const pts: Pt[] = [];
  let drift = 0;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    drift += (rnd(`${seed}-d${i}`) - 0.5) * roughness * 0.7;
    drift *= 0.82;
    const jag = (rnd(`${seed}-j${i}`) - 0.5) * roughness;
    const a = across * pos + drift + jag + Math.sin(t * Math.PI * 2.3) * roughness * 0.6;
    const l = t * len;
    pts.push(vertical ? [a, l] : [l, a]);
  }
  return pts;
};

/** CSS polygon() for one side of a tear line. side 0 = left/top, 1 = right/bottom */
export const halfPolygon = (line: Pt[], w: number, h: number, vertical: boolean, side: 0 | 1, offset = 0) => {
  const shifted: Pt[] = line.map(([x, y]) =>
    vertical ? [x + (side === 0 ? offset : -offset), y] : [x, y + (side === 0 ? offset : -offset)],
  );
  let poly: Pt[];
  if (vertical) {
    // extend line ends beyond the box so edges are not clipped
    poly = side === 0 ? [[-50, -50], [shifted[0][0], -50], ...shifted, [shifted[shifted.length - 1][0], h + 50], [-50, h + 50]]
      : [[w + 50, -50], [shifted[0][0], -50], ...shifted, [shifted[shifted.length - 1][0], h + 50], [w + 50, h + 50]];
  } else {
    poly = side === 0
      ? [[-50, -50], [-50, shifted[0][1]], ...shifted, [w + 50, shifted[shifted.length - 1][1]], [w + 50, -50]]
      : [[-50, h + 50], [-50, shifted[0][1]], ...shifted, [w + 50, shifted[shifted.length - 1][1]], [w + 50, h + 50]];
  }
  return `polygon(${poly.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(",")})`;
};

/**
 * Burn mask filter. Applied as CSS `filter:url(#id)` to an HTML layer it keeps
 * the layer only where the burn value v is above (invert=false) or below
 * (invert=true) `threshold`. v = radial distance from `origin` + fractal noise,
 * roughly in the range 0..0.9. Fully synchronous (no feImage).
 */
export const BurnFilter: React.FC<{
  id: string;
  threshold: number;
  invert?: boolean;
  origin: Pt;
  width: number;
  height: number;
  seed?: number;
  /** edge hardness — higher = crisper */
  slope?: number;
}> = ({ id, threshold, invert = false, origin, width, height, seed = 4, slope = 32 }) => {
  const s = invert ? -slope : slope;
  const i = invert ? slope * threshold : -slope * threshold;
  const z = Math.max(width, height) * 0.32;
  return (
    <svg width={0} height={0} style={{ position: "absolute" }}>
      <filter
        id={id}
        x={0}
        y={0}
        width={width}
        height={height}
        filterUnits="userSpaceOnUse"
        primitiveUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feTurbulence type="fractalNoise" baseFrequency={0.0065} numOctaves={5} seed={seed} result="n" />
        <feColorMatrix in="n" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" result="n2" />
        <feFlood floodColor="#000" floodOpacity={1} result="flat" />
        <feDiffuseLighting in="flat" lightingColor="#fff" diffuseConstant={1} surfaceScale={1} result="light">
          <fePointLight x={origin[0]} y={origin[1]} z={z} />
        </feDiffuseLighting>
        <feComposite in="light" in2="n2" operator="arithmetic" k1={0} k2={-1} k3={0.45} k4={0.78} result="v" />
        <feColorMatrix in="v" values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${s} 0 0 0 ${i}`} result="m" />
        <feComposite in="SourceGraphic" in2="m" operator="in" />
      </filter>
    </svg>
  );
};

export const EMBER_GRADIENT = (hot: string, mid: string, deep: string) =>
  `radial-gradient(circle at 50% 50%, ${hot} 0%, ${mid} 45%, ${deep} 100%)`;
