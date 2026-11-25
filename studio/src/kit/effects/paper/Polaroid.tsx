import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, F } from "../../theme";
import { clamp, EASE, pop, prog } from "../../lib/anim";

export type PolaroidProps = {
  /** the photo content (any node; it is cropped to the photo window) */
  children: React.ReactNode;
  caption?: string;
  /** centre position in px */
  x?: number;
  y?: number;
  /** photo window width in px (frame is ~1.2×) */
  width?: number;
  rotate?: number;
  delay?: number;
  /** frames for the fall */
  dropDuration?: number;
  /** frames for the chemical develop after landing */
  developDuration?: number;
};

/**
 * Polaroid drops in from above with a spin, lands with a bounce + shadow,
 * then the image develops from murky dark to full contrast.
 */
export const Polaroid: React.FC<PolaroidProps> = ({
  children,
  caption,
  x = 960,
  y = 540,
  width = 560,
  rotate = -5,
  delay = 0,
  dropDuration = 16,
  developDuration = 75,
}) => {
  const frame = useCurrentFrame();
  if (frame < delay) return null;
  const fall = prog(frame, delay, dropDuration, EASE.in);
  const bounce = pop(frame, delay + dropDuration, 8, 260);
  const develop = prog(frame, delay + dropDuration + 4, developDuration, EASE.inOut);
  const pad = width * 0.06;
  const W = width + pad * 2;
  const H = width + pad + width * 0.26;
  const z = 1 - fall;
  const squash = fall >= 1 ? 1 + (1 - bounce) * 0.04 : 1;
  const ty = -z * 900;
  const spin = rotate + z * 35;
  const scale = (1 + z * 0.35) * squash;
  return (
    <div
      style={{
        position: "absolute",
        left: x - W / 2,
        top: y - H / 2,
        width: W,
        height: H,
        transform: `translateY(${ty}px) rotate(${spin}deg) scale(${scale})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#F8F6F0",
          boxShadow: `${6 + z * 40}px ${10 + z * 60}px ${12 + z * 40}px rgba(0,0,0,${0.5 - z * 0.3})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: pad,
          top: pad,
          width,
          height: width,
          overflow: "hidden",
          backgroundColor: C.black3,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            filter: `brightness(${interpolate(develop, [0, 1], [0.12, 1])}) contrast(${interpolate(develop, [0, 1], [0.5, 1.08])}) sepia(${interpolate(develop, [0, 0.7, 1], [1, 0.5, 0.15])}) saturate(${interpolate(develop, [0, 1], [0.2, 1])}) blur(${interpolate(develop, [0, 0.6], [3, 0], clamp)}px)`,
          }}
        >
          {children}
        </div>
        {/* chemical haze that lifts from the edges */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at 50% 50%, rgba(40,48,40,${0.6 * (1 - develop)}) 0%, rgba(20,24,22,${0.95 * (1 - develop)}) 100%)`,
          }}
        />
        {/* glossy sheen */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(120deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 40%)",
          }}
        />
      </div>
      {caption ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: width * 0.06,
            textAlign: "center",
            fontFamily: F.hand,
            fontSize: width * 0.08,
            color: C.black,
            opacity: interpolate(develop, [0.3, 0.8], [0, 1], clamp),
          }}
        >
          {caption}
        </div>
      ) : null}
    </div>
  );
};
