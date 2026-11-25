import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, F } from "../../theme";
import { clamp, EASE, prog } from "../../lib/anim";
import { PaperTexture, RoughEdgeFilter } from "../../lib/textures";
import { halfPolygon, tearLine, useUid } from "./shared";

export type TearDirection = "vertical" | "horizontal";

/**
 * Renders `content` split along a jagged tear into two halves that rip apart
 * (hinged at the far end first, then flung off-frame). progress 0..1.
 */
export const TornHalves: React.FC<{
  content: React.ReactNode;
  progress: number;
  direction?: TearDirection;
  width?: number;
  height?: number;
  seed?: string;
  /** colour of the exposed paper fibre along the tear */
  fibre?: string;
}> = ({ content, progress, direction = "vertical", width = 1920, height = 1080, seed = "tear", fibre = "#FBF8F1" }) => {
  const uid = useUid("torn");
  const vertical = direction === "vertical";
  const line = tearLine(width, height, vertical, seed, 0.5, 34);
  const end = line[line.length - 1];
  const rip = interpolate(progress, [0, 0.35], [0, 1], { ...clamp, easing: EASE.out });
  const fling = interpolate(progress, [0.25, 1], [0, 1], { ...clamp, easing: EASE.in });

  const half = (side: 0 | 1) => {
    const sign = side === 0 ? -1 : 1;
    const angle = sign * (rip * 5 + fling * 16) * (vertical ? 1 : -1);
    const dist = fling * (vertical ? width : height) * 0.75;
    const tx = vertical ? sign * dist : fling * sign * 60;
    const ty = vertical ? fling * 120 : sign * dist;
    const origin = `${end[0]}px ${end[1]}px`;
    return (
      <AbsoluteFill
        key={side}
        style={{
          transformOrigin: origin,
          transform: `translate(${tx}px, ${ty}px) rotate(${angle}deg)`,
          filter: `drop-shadow(0 18px 26px rgba(0,0,0,${0.25 + 0.35 * rip}))`,
        }}
      >
        {/* exposed fibre strip */}
        <AbsoluteFill style={{ filter: `url(#rough-edge-${uid})` }}>
          <AbsoluteFill
            style={{ backgroundColor: fibre, clipPath: halfPolygon(line, width, height, vertical, side, 9) }}
          />
        </AbsoluteFill>
        <AbsoluteFill style={{ clipPath: halfPolygon(line, width, height, vertical, side, 0) }}>
          {content}
        </AbsoluteFill>
      </AbsoluteFill>
    );
  };

  if (progress >= 1) return null;
  return (
    <AbsoluteFill>
      <RoughEdgeFilter uid={uid} scale={7} freq={0.09} />
      {half(0)}
      {half(1)}
    </AbsoluteFill>
  );
};

/** Default cover: cream paper with an optional stamped label */
const DefaultCover: React.FC<{ label?: string }> = ({ label }) => (
  <AbsoluteFill>
    <PaperTexture />
    {label ? (
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            fontFamily: F.stamp,
            fontSize: 150,
            color: C.crimson,
            border: `12px solid ${C.crimson}`,
            padding: "10px 50px",
            transform: "rotate(-6deg)",
            opacity: 0.9,
          }}
        >
          {label}
        </div>
      </AbsoluteFill>
    ) : null}
  </AbsoluteFill>
);

export type TornRevealProps = {
  /** what is revealed underneath */
  children: React.ReactNode;
  /** the paper being torn (defaults to cream paper with `label`) */
  cover?: React.ReactNode;
  /** text stamped on the default cover */
  label?: string;
  delay?: number;
  duration?: number;
  direction?: TearDirection;
  seed?: string;
};

/** A paper cover rips in two and flies off, revealing `children`. */
export const TornReveal: React.FC<TornRevealProps> = ({
  children,
  cover,
  label,
  delay = 0,
  duration = 40,
  direction = "vertical",
  seed = "torn-reveal",
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, duration, (t) => t);
  return (
    <AbsoluteFill>
      <AbsoluteFill>{children}</AbsoluteFill>
      <TornHalves content={cover ?? <DefaultCover label={label} />} progress={p} direction={direction} seed={seed} />
    </AbsoluteFill>
  );
};
