import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { lerp } from "../lib/anim";
import { LeakLayer } from "../effects/overlay/LightLeak";

type FilmBurnProps = { seed?: string };

const FilmBurnPresentation: React.FC<TransitionPresentationComponentProps<FilmBurnProps>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
  passedProps,
}) => {
  const frame = useCurrentFrame();
  if (presentationDirection === "exiting") {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }
  const s = Math.sin(Math.PI * p);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: lerp(p, [0.42, 0.58], [0, 1]) }}>{children}</AbsoluteFill>
      <LeakLayer strength={s * 1.3} burn={Math.pow(s, 2)} seed={passedProps.seed ?? "fb"} frame={frame} />
    </AbsoluteFill>
  );
};

/** Warm film-burn whiteout between two scenes. Use 18–30 frame timings. */
export const filmBurn = (props: FilmBurnProps = {}): TransitionPresentation<FilmBurnProps> => ({
  component: FilmBurnPresentation,
  props,
});
