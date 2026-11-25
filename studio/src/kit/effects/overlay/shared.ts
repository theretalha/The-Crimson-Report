import { useId } from "react";

/** Monochrome fractal-noise tile, rendered once by the browser and cached. */
export const grainTile = (freq = 0.85, size = 320) =>
  `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`,
  )}")`;

/** CSS-safe unique id for SVG filter / mask references */
export const useSafeId = (prefix: string) => `${prefix}-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

/** repeating scanline gradient */
export const scanlines = (gap = 4, alpha = 0.22) =>
  `repeating-linear-gradient(0deg, rgba(0,0,0,${alpha}) 0px, rgba(0,0,0,${alpha}) 1px, transparent 1px, transparent ${gap}px)`;
