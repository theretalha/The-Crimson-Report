import React from "react";
import { AbsoluteFill } from "remotion";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { BurnLayers } from "../effects/paper/PaperBurn";
import { Pt } from "../lib/types";

export type PaperBurnTransitionProps = {
  /** where the fire starts, px */
  origin?: Pt;
  width?: number;
  height?: number;
  seed?: number;
};

const PaperBurnPresentation: React.FC<TransitionPresentationComponentProps<PaperBurnTransitionProps>> = ({
  children,
  presentationDirection,
  presentationProgress,
  passedProps,
}) => {
  const { origin = [1500, 820], width = 1920, height = 1080, seed = 4 } = passedProps;
  // The exiting scene stays put; the entering scene (rendered on top) is
  // revealed through a growing burn hole with char + ember edges.
  if (presentationDirection === "exiting" || presentationProgress >= 1) return <AbsoluteFill>{children}</AbsoluteFill>;
  return (
    <BurnLayers progress={presentationProgress} mode="reveal" origin={origin} width={width} height={height} seed={seed}>
      {children}
    </BurnLayers>
  );
};

/** Paper-burn transition for <TransitionSeries>. Pair with linearTiming({durationInFrames: 30–50}). */
export const paperBurn = (props: PaperBurnTransitionProps = {}): TransitionPresentation<PaperBurnTransitionProps> => ({
  component: PaperBurnPresentation,
  props,
});
