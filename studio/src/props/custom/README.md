# Custom props (one folder per episode)

Rule (AGENTS.md section 1): never reuse a built-in prop for an object the narration does not name. When a line names a physical thing
that nothing in `src/props/` draws, code a new prop here: `src/props/custom/epNNN/<slug>.tsx` + `index.ts` (`register({...})`).

- Reference implementation: `_example/Tanker.tsx` (`npx remotion still src/index.ts Example-CustomProp out/x.png --frame=75`).
- Helpers: `kit.ts` (`drawOn`, `overshoot`, `prog`, `bob`, `groundShadowProps`, `SFX_KINDS`).
- Registry: `registry.ts` validates the id (`epNNN.slug`), the `evidence` regex and the sound kinds (no riser) at import time.
- Load: add `import './epNNN';` to `index.ts` above the `<<EPISODES>>` marker.
- Use: compose item `{p: 'epNNN.slug', x, y, at: '<narrated word>'}`.
- Checked by `tools/director.py --strict`: R-REUSE, R-NOCUSTOM, R-CUSTOM-MISSING, R-CUSTOM-QUALITY.
