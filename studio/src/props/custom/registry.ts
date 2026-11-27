import {SFX_KINDS, type CustomProp} from './kit';

// Registry of CUSTOM props (src/props/custom/epNNN/). Compose.tsx looks a compose item's `p` up here when it is not a built-in.
// To add an episode: create src/props/custom/epNNN/index.ts that calls register(...) for each prop, then add ONE import line below.
export const CUSTOM: Record<string, CustomProp> = {};

export const register = (p: CustomProp) => {
  if (!/^(ep\d{3}|example)\.[a-z0-9-]+$/.test(p.id)) throw new Error(`custom prop id must look like ep004.oil-tanker, got "${p.id}"`);
  if (CUSTOM[p.id]) throw new Error(`custom prop "${p.id}" registered twice`);
  if (!p.evidence) throw new Error(`custom prop "${p.id}" needs an evidence regex (the narration words that justify it)`);
  // dry-run the events once so a bad sound kind fails at import time, not at mix time
  for (const e of p.events(0, {})) if (!(SFX_KINDS as readonly string[]).includes(e.kind) || e.kind === 'riser') throw new Error(`custom prop "${p.id}" uses unsupported sound kind "${e.kind}"`);
  CUSTOM[p.id] = p;
};

export const isCustom = (id: string) => id in CUSTOM;
