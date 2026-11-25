import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { getLength } from "@remotion/paths";
import { C } from "../../theme";
import { prog, EASE } from "../../lib/anim";
import { findCountry, useMap } from "./WorldMap";

export type TerritoryHighlightProps = {
  /** country name ("Taiwan", "Iran") or ISO numeric id ("158") */
  country: string;
  /** frame the border starts drawing */
  delay?: number;
  /** frames for the border draw; the fill floods in during its second half */
  duration?: number;
  color?: string;
  /** border width in screen px */
  width?: number;
  /** keep pulsing glow after reveal */
  pulse?: boolean;
};

/**
 * Border stroke draws around a country, then the territory floods crimson
 * with a soft glow. Place inside <WorldMap>.
 */
export const TerritoryHighlight: React.FC<TerritoryHighlightProps> = ({
  country,
  delay = 0,
  duration = 40,
  color = C.crimson,
  width = 4,
  pulse = true,
}) => {
  const frame = useCurrentFrame();
  const { zoom } = useMap();
  const c = findCountry(country);
  const d = c?.d ?? "";
  const len = useMemo(() => (d ? getLength(d) : 0), [d]);
  if (!c) return null;

  const draw = prog(frame, delay, duration, EASE.inOut);
  const fill = prog(frame, delay + duration * 0.5, duration * 0.7);
  const glow = pulse ? 0.5 + 0.5 * Math.sin((frame - delay) / 8) : 1;

  return (
    <g>
      <path d={d} fill={color} opacity={fill * 0.92} />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={(width * 5) / zoom}
        strokeOpacity={fill * 0.25 * glow}
        strokeLinejoin="round"
      />
      <path
        d={d}
        fill="none"
        stroke={C.cream}
        strokeWidth={width / zoom}
        strokeLinejoin="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - draw)}
      />
    </g>
  );
};
