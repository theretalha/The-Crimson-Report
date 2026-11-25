import React from "react";
import { AbsoluteFill } from "remotion";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { TearDirection, TornHalves } from "../effects/paper/TornReveal";

export type TornPaperTransitionProps = {
  direction?: TearDirection;
  seed?: string;
  width?: number;
  height?: number;
};

const TornPaperPresentation: React.FC<TransitionPresentationComponentProps<TornPaperTransitionProps>> = ({
  children,
  presentationDirection,
  presentationProgress,
  passedProps,
}) => {
  const { direction = "vertical", seed = "torn-transition", width = 1920, height = 1080 } = passedProps;
  // outside the transition window progress is 0 → render the shot untouched (no hairline tear)
  if (presentationDirection === "entering" || presentationProgress <= 0) return <AbsoluteFill>{children}</AbsoluteFill>;
  // exiting scene is torn in two and flung off, above the entering scene
  return (
    <AbsoluteFill style={{ zIndex: 1 }}>
      <TornHalves
        content={children}
        progress={presentationProgress}
        direction={direction}
        seed={seed}
        width={width}
        height={height}
      />
    </AbsoluteFill>
  );
};

/** Torn-paper wipe for <TransitionSeries>: the outgoing shot rips apart. 25–40 frames works well. */
export const tornPaper = (props: TornPaperTransitionProps = {}): TransitionPresentation<TornPaperTransitionProps> => ({
  component: TornPaperPresentation,
  props,
});
