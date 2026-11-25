import {ICONS} from './iconData';

// Picks a fitting icon for a piece of narration or a title. Order matters: first match wins.
const RULES: [RegExp, string][] = [
  [/seal|crate|boxes|box\b|package/i, 'package'],
  [/chip|gpu|nvidia|semiconductor|h100/i, 'cpu'],
  [/server|data ?cent|cloud|rack/i, 'server'],
  [/spy|intelligence|cia\b|mss|surveil/i, 'eye'],
  [/white house|government|congress|capitol|doj|justice|senate|board/i, 'landmark'],
  [/bank|money|billion|million|dollar|asset|\$|cut|%/i, 'banknote'],
  [/ship|route|smuggl|port|container|freight/i, 'ship'],
  [/china|chinese|beijing/i, 'globe'],
  [/stock|market|crash|shares/i, 'trending-down'],
  [/court|law|legal|charge|invest|probe|accus/i, 'gavel'],
  [/trade|balance|standard|conflict|ethic|conduct/i, 'scale'],
  [/lock|secret|classified|confirm|proof|prove/i, 'lock'],
  [/memo|letter|statement|document|report|file/i, 'file-text'],
  [/petition|signature|support|vote/i, 'users'],
  [/husband|wife|partner|introduc|friend|link|connect/i, 'link'],
  [/resign|fired|out\b|quit/i, 'siren'],
  [/warning|danger|risk|alert|threat/i, 'shield-alert'],
  [/time|day|month|year|date|later|then/i, 'hourglass'],
  [/question|who|why|how|\?/i, 'search'],
  [/identity|id\b|name|alice|woman|legend|fake/i, 'fingerprint'],
  [/jensen|huang|ceo|man\b/i, 'user'],
];
export const pickIcon = (text: string, fallback = 'search'): string => {
  for (const [re, name] of RULES) if (re.test(text) && ICONS[name]) return name;
  return ICONS[fallback] ? fallback : 'search';
};
// up to n different icons for the keywords found in `text`
export const pickIcons = (text: string, n: number, skip: string[] = []): string[] => {
  const out: string[] = [];
  for (const [re, name] of RULES) {
    if (re.test(text) && ICONS[name] && !skip.includes(name) && !out.includes(name)) out.push(name);
    if (out.length >= n) break;
  }
  return out;
};
