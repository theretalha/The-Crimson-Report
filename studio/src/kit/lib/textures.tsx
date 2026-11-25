import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../theme";

/**
 * Shared SVG filters / textures. Every id is namespaced with `uid` so several
 * instances can live on screen at once.
 */

/** Rough paper fibre texture as a full-frame layer (static, cheap) */
export const PaperTexture: React.FC<{
  color?: string;
  opacity?: number;
  seed?: number;
}> = ({ color = C.cream, opacity = 1, seed = 3 }) => {
  const id = `paper-${seed}`;
  return (
    <AbsoluteFill style={{ backgroundColor: color, opacity }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={3} seed={seed} />
          <feColorMatrix
            values="0 0 0 0 0.35  0 0 0 0 0.3  0 0 0 0 0.25  0 0 0 0.22 0"
          />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${id})`} />
        <filter id={`${id}-blot`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves={2} seed={seed + 1} />
          <feColorMatrix values="0 0 0 0 0.4  0 0 0 0 0.32  0 0 0 0 0.2  0 0 0 0.18 0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${id}-blot)`} />
      </svg>
    </AbsoluteFill>
  );
};

/** Black linocut background with subtle ink grain */
export const InkBackground: React.FC<{ grid?: boolean; seed?: number }> = ({
  grid = false,
  seed = 9,
}) => {
  const id = `ink-${seed}`;
  return (
    <AbsoluteFill style={{ backgroundColor: C.black }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves={2} seed={seed} />
          <feColorMatrix values="0 0 0 0 0.95  0 0 0 0 0.93  0 0 0 0 0.9  0 0 0 0.05 0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${id})`} />
        {grid ? (
          <g stroke={C.crimson} strokeOpacity={0.14} strokeWidth={1}>
            {Array.from({ length: 33 }, (_, i) => (
              <line key={`v${i}`} x1={i * 60} y1={0} x2={i * 60} y2={1080} />
            ))}
            {Array.from({ length: 19 }, (_, i) => (
              <line key={`h${i}`} x1={0} y1={i * 60} x2={1920} y2={i * 60} />
            ))}
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};

/** `filter: url(#rough-edge-<uid>)` — displaces edges like torn/printed paper */
export const RoughEdgeFilter: React.FC<{ uid: string; scale?: number; freq?: number; seed?: number }> = ({
  uid,
  scale = 8,
  freq = 0.04,
  seed = 2,
}) => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <filter id={`rough-edge-${uid}`}>
      <feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves={3} seed={seed} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={scale} xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </svg>
);
