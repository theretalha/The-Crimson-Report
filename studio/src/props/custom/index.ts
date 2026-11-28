// Entry point Compose.tsx imports. It loads every episode's custom props (each calls register() from ./registry on import).
// To add an episode: create src/props/custom/epNNN/index.ts that calls register(...) per prop, then add ONE import line below.
export {CUSTOM, isCustom, register} from './registry';
import './_example';
// <<EPISODES>>
