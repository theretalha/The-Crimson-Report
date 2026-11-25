import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { lerp, prog, EASE } from "../../lib/anim";

export type MapTiltProps = {
  /** frame the tilt begins */
  delay?: number;
  /** frames to reach full tilt/zoom */
  duration?: number;
  /** final rotateX in degrees (0 = flat, 55 = strong war-room tilt) */
  tilt?: number;
  /** final scale */
  zoom?: number;
  /** slow yaw (rotateZ degrees) applied over the move */
  spin?: number;
  /** perspective distance in px */
  perspective?: number;
  /** vertical focus point of the tilt in % */
  originY?: number;
  children: React.ReactNode;
};

/**
 * 3D Map Tilt & Zoom — wraps a <WorldMap> (or any plate) and tilts it into
 * perspective like a war-room table, with a horizon fade.
 */
export const MapTilt: React.FC<MapTiltProps> = ({
  delay = 0,
  duration = 90,
  tilt = 50,
  zoom = 1.6,
  spin = -8,
  perspective = 1400,
  originY = 60,
  children,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, duration, EASE.inOut);
  const rx = lerp(p, [0, 1], [0, tilt]);
  const s = lerp(p, [0, 1], [1, zoom]);
  const rz = lerp(p, [0, 1], [0, spin]);
  return (
    <AbsoluteFill style={{ perspective, overflow: "hidden", backgroundColor: "#000" }}>
      <AbsoluteFill
        style={{
          transformOrigin: `50% ${originY}%`,
          transform: `rotateX(${rx}deg) rotateZ(${rz}deg) scale(${s})`,
        }}
      >
        {children}
      </AbsoluteFill>
      {/* horizon haze */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(to bottom, rgba(0,0,0,${0.95 * p}) 0%, rgba(0,0,0,0) 38%)`,
        }}
      />
    </AbsoluteFill>
  );
};
