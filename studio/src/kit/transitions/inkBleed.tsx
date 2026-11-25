import React from "react";
import { AbsoluteFill } from "remotion";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { InkMask } from "../effects/overlay/InkBleed";
import type { Pt } from "../lib/types";

type InkBleedProps = { origin?: Pt; rim?: string; seed?: string };

const InkBleedPresentation: React.FC<TransitionPresentationComponentProps<InkBleedProps>> = ({
  children,
  presentationDirection,
  presentationProgress,
  passedProps,
}) => {
  if (presentationDirection === "exiting" || presentationProgress >= 1) return <AbsoluteFill>{children}</AbsoluteFill>;
  return (
    <InkMask progress={presentationProgress} {...passedProps}>
      {children}
    </InkMask>
  );
};

/** Next scene bleeds in as a spreading ink blot. Use 25–40 frame timings. */
export const inkBleed = (props: InkBleedProps = {}): TransitionPresentation<InkBleedProps> => ({
  component: InkBleedPresentation,
  props,
});
