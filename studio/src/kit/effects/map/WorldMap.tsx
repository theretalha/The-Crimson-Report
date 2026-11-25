import React, { createContext, useContext, useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { geoMercator, geoPath, GeoProjection } from "d3-geo";
import { feature, mesh } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import world from "world-atlas/countries-110m.json";
import { C } from "../../theme";
import { clamp, EASE } from "../../lib/anim";
import type { Pt } from "../../lib/types";

/** Base (zoom = 1) projection — every map-space overlay uses these coords. */
const BASE_SCALE = 300;
const baseProjection: GeoProjection = geoMercator()
  .scale(BASE_SCALE)
  .translate([960, 540])
  .center([0, 0]);

type CountryProps = { name: string };
export type CountryFeature = Feature<Geometry, CountryProps> & { id?: string | number };

const topo = world as unknown as Topology<{ countries: GeometryCollection<CountryProps> }>;
const COUNTRIES = (feature(topo, topo.objects.countries) as unknown as FeatureCollection<Geometry, CountryProps>)
  .features as CountryFeature[];
const pathGen = geoPath(baseProjection);

/** Pre-computed land paths (map space) — built once per process */
const LAND = COUNTRIES.map((f) => ({
  id: String(f.id ?? ""),
  name: f.properties.name,
  d: pathGen(f) ?? "",
}));
const BORDERS = pathGen(mesh(topo, topo.objects.countries, (a, b) => a !== b)) ?? "";

/** Find a country by ISO numeric id ("364") or name ("Iran", case-insensitive) */
export const findCountry = (key: string) => {
  const k = key.toLowerCase();
  return LAND.find((c) => c.id === key || c.name.toLowerCase() === k);
};

/** Project [lon, lat] into map space (zoom = 1 coords) */
export const project = (p: Pt): Pt => (baseProjection(p) as Pt) ?? [960, 540];

export type MapView = {
  /** [lon, lat] placed at the centre of the frame */
  center: Pt;
  /** 1 = whole world, 6 ≈ region, 20+ ≈ a strait */
  zoom: number;
};

type MapCtx = { zoom: number; project: (p: Pt) => Pt };
const Ctx = createContext<MapCtx>({ zoom: 1, project });
/** Inside <WorldMap>: current zoom (to counter-scale strokes/labels) + projector */
export const useMap = () => useContext(Ctx);

export type WorldMapProps = {
  /** camera at the start */
  from: MapView;
  /** camera at the end (defaults to `from` = static) */
  to?: MapView;
  /** frame the camera move starts */
  delay?: number;
  /** frames the camera move takes */
  duration?: number;
  /** countries (name or ISO id) tinted crimson from the start */
  highlight?: string[];
  /** ocean colour */
  ocean?: string;
  /** land colour */
  land?: string;
  /** show faint lat/lon grid */
  graticule?: boolean;
  /** overlays rendered in map space (RouteLine, MapPin, TerritoryHighlight…) */
  children?: React.ReactNode;
};

/**
 * Netflix-doc world map: black ocean, cream hatched land, crimson highlights,
 * with an eased camera move (pan + log-zoom) between two views.
 */
export const WorldMap: React.FC<WorldMapProps> = ({
  from,
  to,
  delay = 0,
  duration = 90,
  highlight = [],
  ocean = C.black,
  land = C.cream2,
  graticule = true,
  children,
}) => {
  const frame = useCurrentFrame();
  const end = to ?? from;
  const t = interpolate(frame, [delay, delay + duration], [0, 1], { ...clamp, easing: EASE.inOut });

  const a = project(from.center);
  const b = project(end.center);
  const zoom = Math.exp(interpolate(t, [0, 1], [Math.log(from.zoom), Math.log(end.zoom)]));
  // pan in map space, weighted so the move feels like a camera (zoom-aware)
  const px = interpolate(t, [0, 1], [a[0], b[0]]);
  const py = interpolate(t, [0, 1], [a[1], b[1]]);

  const hl = useMemo(() => new Set(highlight.map((h) => findCountry(h)?.id).filter(Boolean)), [highlight]);
  const ctx = useMemo(() => ({ zoom, project }), [zoom]);

  return (
    <AbsoluteFill style={{ backgroundColor: ocean, overflow: "hidden" }}>
      <svg viewBox="0 0 1920 1080" width="100%" height="100%">
        <defs>
          <pattern id="wm-hatch" width={6} height={6} patternUnits="userSpaceOnUse" patternTransform={`scale(${1 / zoom}) rotate(45)`}>
            <line x1={0} y1={0} x2={0} y2={6} stroke={C.black} strokeWidth={0.9} />
          </pattern>
          <radialGradient id="wm-vig" cx="50%" cy="50%" r="70%">
            <stop offset="55%" stopColor="#000" stopOpacity={0} />
            <stop offset="100%" stopColor="#000" stopOpacity={0.7} />
          </radialGradient>
        </defs>
        <g transform={`translate(960 540) scale(${zoom}) translate(${-px} ${-py})`}>
          {graticule ? (
            <g stroke={C.cream} strokeOpacity={0.07} strokeWidth={1 / zoom}>
              {Array.from({ length: 37 }, (_, i) => {
                const x = project([-180 + i * 10, 0])[0];
                return <line key={`m${i}`} x1={x} y1={-2000} x2={x} y2={3000} />;
              })}
              {Array.from({ length: 17 }, (_, i) => {
                const y = project([0, -80 + i * 10])[1];
                return <line key={`p${i}`} x1={-2000} y1={y} x2={4000} y2={y} />;
              })}
            </g>
          ) : null}
          <g>
            {LAND.map((c) => (
              <path key={c.id + c.name} d={c.d} fill={hl.has(c.id) ? C.crimson : land} />
            ))}
          </g>
          <g opacity={0.16}>
            {LAND.map((c) => (
              <path key={c.id + c.name} d={c.d} fill="url(#wm-hatch)" />
            ))}
          </g>
          <path d={BORDERS} fill="none" stroke={C.black} strokeWidth={1.2 / zoom} strokeOpacity={0.6} />
          <Ctx.Provider value={ctx}>{children}</Ctx.Provider>
        </g>
        <rect width={1920} height={1080} fill="url(#wm-vig)" />
      </svg>
    </AbsoluteFill>
  );
};
