import React from "react";
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE, prog } from "../../lib/anim";

/**
 * Ken Burns: slow cinematic zoom + pan toward a focal point.
 * Pass an image `src` OR `children`.
 */
export const KenBurns: React.FC<{
  src?: string;
  children?: React.ReactNode;
  delay?: number;
  /** frames; default = Sequence duration */
  duration?: number;
  zoomFrom?: number;
  zoomTo?: number;
  /** focal point in % of frame [x, y] — zoom gravitates toward it */
  focal?: [number, number];
  /** pan distance in % of frame [x, y] over the move */
  pan?: [number, number];
}> = ({ src, children, delay = 0, duration, zoomFrom = 1.05, zoomTo = 1.22, focal = [50, 50], pan = [-3, 0] }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = prog(frame, delay, duration ?? durationInFrames - delay, EASE.cinematic);
  const s = zoomFrom + (zoomTo - zoomFrom) * p;
  const tx = pan[0] * (p - 0.5);
  const ty = pan[1] * (p - 0.5);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `translate(${tx}%, ${ty}%) scale(${s})`,
          transformOrigin: `${focal[0]}% ${focal[1]}%`,
        }}
      >
        {src ? <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
