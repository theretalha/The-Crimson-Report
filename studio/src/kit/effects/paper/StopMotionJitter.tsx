import React from "react";
import { AbsoluteFill, Freeze, useCurrentFrame } from "remotion";
import { rnd, stepped } from "../../lib/anim";
import { useUid } from "./shared";

export type StopMotionJitterProps = {
  children: React.ReactNode;
  /** hold each pose for N frames (2 = 15fps, 3 = 10fps feel) */
  every?: number;
  /** max positional jitter in px */
  amount?: number;
  /** max rotation jitter in degrees */
  rotate?: number;
  /** max scale jitter (0.01 = ±1%) */
  scale?: number;
  /** "boil" the edges like hand-cut paper re-shot each frame */
  boil?: boolean;
  /** also freeze the children's own animation to the stepped frame (true stop-motion) */
  freezeChildren?: boolean;
  seed?: string;
};

/**
 * Stop-motion paper feel: time is quantised to `every` frames and each held
 * pose gets a tiny random offset / tilt (and optional boiling edges).
 */
export const StopMotionJitter: React.FC<StopMotionJitterProps> = ({
  children,
  every = 3,
  amount = 4,
  rotate = 0.8,
  scale = 0.006,
  boil = true,
  freezeChildren = true,
  seed = "smj",
}) => {
  const uid = useUid("smj");
  const frame = useCurrentFrame();
  const step = stepped(frame, every);
  const k = `${seed}-${step}`;
  const dx = (rnd(`${k}x`) - 0.5) * 2 * amount;
  const dy = (rnd(`${k}y`) - 0.5) * 2 * amount;
  const dr = (rnd(`${k}r`) - 0.5) * 2 * rotate;
  const ds = 1 + (rnd(`${k}s`) - 0.5) * 2 * scale;
  const boilSeed = Math.floor(rnd(`${k}b`) * 100);
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${dx}px, ${dy}px) rotate(${dr}deg) scale(${ds})`,
        filter: boil ? `url(#${uid})` : undefined,
      }}
    >
      {boil ? (
        <svg width={0} height={0} style={{ position: "absolute" }}>
          <filter id={uid}>
            <feTurbulence type="fractalNoise" baseFrequency={0.03} numOctaves={2} seed={boilSeed} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={3.5} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
      ) : null}
      {freezeChildren ? <Freeze frame={step}>{children}</Freeze> : children}
    </AbsoluteFill>
  );
};
