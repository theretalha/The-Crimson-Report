import { useId } from "react";

/** SVG-safe unique id (React useId contains characters invalid in url(#…)) */
export const useSafeId = (prefix: string) =>
  `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
