import React from "react";

// The original kit plays sounds from inside its effects. Here the audio is mixed offline (tools/mix_audio.py),
// so these are silent stand-ins that keep the kit's code unchanged.
export const SFX_NAMES = ["whoosh", "riser", "braam", "impact", "stamp", "redact", "typewriter", "paper", "blip"] as const;
export type SfxName = (typeof SFX_NAMES)[number];
export const Sfx: React.FC<{ name?: SfxName; at?: number; volume?: number; duration?: number; force?: boolean }> = () => null;
