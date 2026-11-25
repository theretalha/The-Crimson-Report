import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { wobble } from "../../lib/anim";

/**
 * Handheld drift + optional impact burst (e.g. on a "braam" or vault slam).
 * Noise-driven and deterministic.
 */
export const CameraShake: React.FC<{
  children: React.ReactNode;
  /** handheld amplitude in px */
  intensity?: number;
  /** handheld rotation amplitude in degrees */
  rotation?: number;
  /** noise speed (higher = more nervous) */
  speed?: number;
  /** frame of an impact jolt (relative to Sequence) */
  impactAt?: number;
  /** impact amplitude in px */
  impactStrength?: number;
  /** frames for the impact to decay */
  impactDecay?: number;
  seed?: string;
}> = ({ children, intensity = 6, rotation = 0.35, speed = 0.06, impactAt, impactStrength = 40, impactDecay = 14, seed = "shake" }) => {
  const f = useCurrentFrame();
  let x = wobble(`${seed}x`, f, speed) * intensity;
  let y = wobble(`${seed}y`, f, speed) * intensity;
  let r = wobble(`${seed}r`, f, speed * 0.7) * rotation;
  let s = 1 + (intensity / 1920) * 4;
  if (impactAt !== undefined && f >= impactAt) {
    const t = f - impactAt;
    const k = Math.exp(-t / (impactDecay / 3)) * (t < impactDecay * 2 ? 1 : 0);
    x += wobble(`${seed}ix`, f, 0.9) * impactStrength * k;
    y += wobble(`${seed}iy`, f, 0.9) * impactStrength * k;
    r += wobble(`${seed}ir`, f, 0.9) * 1.6 * k;
    s += 0.04 * k;
  }
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(${s})` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
