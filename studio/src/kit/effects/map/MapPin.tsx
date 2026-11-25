import React from "react";
import { useCurrentFrame } from "remotion";
import { C, F } from "../../theme";
import { pop, prog } from "../../lib/anim";
import type { Pt } from "../../lib/types";
import { project, useMap } from "./WorldMap";

export type MapPinProps = {
  /** [lon, lat] */
  at: Pt;
  /** frame the pin drops */
  delay?: number;
  /** label next to the pin (uppercase) */
  label?: string;
  /** small secondary line under the label */
  sublabel?: string;
  /** frames between pulse rings */
  pulseEvery?: number;
  color?: string;
  /** label side */
  side?: "right" | "left";
};

/** Pin drops with a bounce, then emits pulsing crimson rings. Place inside <WorldMap>. */
export const MapPin: React.FC<MapPinProps> = ({
  at,
  delay = 0,
  label,
  sublabel,
  pulseEvery = 30,
  color = C.crimson,
  side = "right",
}) => {
  const frame = useCurrentFrame();
  const { zoom } = useMap();
  const [x, y] = project(at);
  const drop = pop(frame, delay, 9, 180);
  const local = frame - delay;
  if (local < 0) return null;
  const fall = (1 - Math.min(1, drop)) * -260 + (drop > 1 ? (drop - 1) * -40 : 0);
  const labelIn = prog(frame, delay + 12, 16);
  const dir = side === "right" ? 1 : -1;

  return (
    <g transform={`translate(${x} ${y}) scale(${1 / zoom})`}>
      {/* rings */}
      {[0, 1, 2].map((i) => {
        const t = ((local - 10 - i * (pulseEvery / 3)) % pulseEvery) / pulseEvery;
        if (local - 10 - i * (pulseEvery / 3) < 0) return null;
        return (
          <circle
            key={i}
            r={10 + t * 90}
            fill="none"
            stroke={color}
            strokeWidth={4 * (1 - t)}
            opacity={1 - t}
          />
        );
      })}
      {/* shadow */}
      <ellipse rx={14 * Math.min(1, drop)} ry={5 * Math.min(1, drop)} fill="#000" opacity={0.45} />
      {/* pin */}
      <g transform={`translate(0 ${fall})`}>
        <path d="M0,0 C-6,-18 -24,-30 -24,-50 A24,24 0 1 1 24,-50 C24,-30 6,-18 0,0Z" fill={color} stroke={C.cream} strokeWidth={3} />
        <circle cy={-50} r={9} fill={C.cream} />
      </g>
      {label ? (
        <g opacity={labelIn} transform={`translate(${dir * (40 + (1 - labelIn) * 20)} -62)`}>
          {/* dark plate so the label reads over cream land too */}
          <rect
            x={side === "right" ? -14 : -Math.max(label.length * 22, (sublabel?.length ?? 0) * 12.5) - 14}
            y={-40}
            width={Math.max(label.length * 22, (sublabel?.length ?? 0) * 12.5) + 28}
            height={sublabel ? 92 : 56}
            fill={C.black}
            opacity={0.88}
          />
          <rect x={side === "right" ? -14 : -4} y={-40} width={4} height={sublabel ? 92 : 56} fill={C.crimson} />
          <text
            textAnchor={side === "right" ? "start" : "end"}
            fontFamily={F.head}
            fontWeight={700}
            fontSize={34}
            letterSpacing={3}
            fill={C.cream}
            style={{ textTransform: "uppercase" }}
          >
            {label}
          </text>
          {sublabel ? (
            <text
              y={36}
              textAnchor={side === "right" ? "start" : "end"}
              fontFamily={F.mono}
              fontSize={20}
              fill={C.ash}
            >
              {sublabel}
            </text>
          ) : null}
        </g>
      ) : null}
    </g>
  );
};
