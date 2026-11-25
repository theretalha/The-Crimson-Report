import React from "react";
import { AbsoluteFill } from "remotion";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { useSafeId } from "../effects/camera/util";

export type WhipDirection = "left" | "right" | "up" | "down";

export type WhipPanProps = {
  direction?: WhipDirection;
  /** peak directional blur in px */
  blur?: number;
};

/** One-axis motion-blur SVG filter (referenced via CSS filter: url(#id)) */
export const DirectionalBlur: React.FC<{ id: string; amount: number; axis: "x" | "y" }> = ({ id, amount, axis }) => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation={axis === "x" ? `${amount} 0` : `0 ${amount}`} edgeMode="duplicate" />
    </filter>
  </svg>
);

const WhipPanPresentation: React.FC<TransitionPresentationComponentProps<WhipPanProps>> = ({
  children,
  presentationProgress: p,
  presentationDirection,
  passedProps,
}) => {
  const id = useSafeId("whip");
  const dir = passedProps.direction ?? "left";
  const axis = dir === "left" || dir === "right" ? "x" : "y";
  const sign = dir === "left" || dir === "up" ? -1 : 1;
  // slow-fast-slow: the "whip"
  const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
  const off = presentationDirection === "exiting" ? sign * e * 100 : -sign * (1 - e) * 100;
  const blur = Math.sin(Math.PI * p) * (passedProps.blur ?? 70);
  const t = axis === "x" ? `translateX(${off}%)` : `translateY(${off}%)`;
  return (
    <AbsoluteFill style={{ transform: t, filter: blur > 0.5 ? `url(#${id})` : undefined }}>
      <DirectionalBlur id={id} amount={blur} axis={axis} />
      {children}
    </AbsoluteFill>
  );
};

/** Whip pan for <TransitionSeries.Transition presentation={whipPan()} /> */
export const whipPan = (props: WhipPanProps = {}): TransitionPresentation<WhipPanProps> => ({
  component: WhipPanPresentation,
  props,
});

export type ZoomBlurProps = {
  /** scale the outgoing shot reaches */
  scaleOut?: number;
  /** peak blur in px */
  blur?: number;
};

const ZoomBlurPresentation: React.FC<TransitionPresentationComponentProps<ZoomBlurProps>> = ({
  children,
  presentationProgress: p,
  presentationDirection,
  passedProps,
}) => {
  const sOut = passedProps.scaleOut ?? 2.6;
  const maxBlur = passedProps.blur ?? 26;
  const exiting = presentationDirection === "exiting";
  const e = p * p * (3 - 2 * p);
  const scale = exiting ? 1 + (sOut - 1) * e : 1 + (1 - e) * 0.6;
  const blur = exiting ? maxBlur * e : maxBlur * (1 - e);
  const opacity = exiting ? 1 - Math.max(0, (p - 0.45) / 0.55) : Math.min(1, p / 0.55);
  // ghost copies fake a radial zoom smear
  const ghosts = exiting ? [1.06, 1.14] : [0.94];
  return (
    <AbsoluteFill style={{ opacity }}>
      {ghosts.map((g, i) => (
        <AbsoluteFill
          key={i}
          style={{
            transform: `scale(${scale * (1 + (g - 1) * Math.sin(Math.PI * p))})`,
            filter: `blur(${blur * 1.4}px)`,
            opacity: 0.35,
          }}
        >
          {children}
        </AbsoluteFill>
      ))}
      <AbsoluteFill style={{ transform: `scale(${scale})`, filter: `blur(${blur}px)` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Fast zoom-blur punch for <TransitionSeries.Transition presentation={zoomBlur()} /> */
export const zoomBlur = (props: ZoomBlurProps = {}): TransitionPresentation<ZoomBlurProps> => ({
  component: ZoomBlurPresentation,
  props,
});
