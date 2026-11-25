import type {IconName, Pin, Scene} from '../types';
import type {Mood} from '../theme';
import TIMING from './ep003-timing.json';

// EP 003 — "The Nvidia Spy Scandal: What Really Happened"
// One entry per narration line (same order as narration-tts.txt).
// An array = the line is split into several visuals; `cap` is that part's words.
// Timing comes from tools/align.py (ep003-timing.json), so scenes follow the voice.

type Spec = Partial<Scene> & {template: Scene['template']; cap?: string; [k: string]: any};

const JENSEN = {image: 'photos/jensen-huang.jpg', name: 'JENSEN HUANG', role: 'CEO, NVIDIA', credit: 'Photo: Anderseidesvik · CC BY 4.0'};
const MUSK = {image: 'photos/elon-musk.jpg', name: 'ELON MUSK', role: 'CEO, TESLA · xAI', credit: 'Photo: US Air Force / T. Cokley · Public domain'};
const TRUMP = {image: 'photos/donald-trump.jpg', name: 'DONALD TRUMP', role: 'PRESIDENT OF THE UNITED STATES', credit: 'Official portrait · White House · Public domain'};

const T = (big: string, mood?: Mood, glitch = false): Spec => ({template: 'title', big, mood, glitch});
const I = (icon: IconName, title?: string, sub?: string, mood?: Mood): Spec => ({template: 'icon', icon, title, sub, mood});
const P = (photos: any[], title?: string, mood?: Mood): Spec => ({template: 'photos', photos, title, mood});
const ST = (parts: string[], title?: string, sub?: string, source?: string, mood?: Mood): Spec => ({template: 'stat', parts, title, sub, source, mood});
const SP = (left: string, sign: string, right: string, title?: string, mood?: Mood): Spec => ({template: 'split', left, sign, right, title, mood});
const CA = (cards: string[], title?: string, mood?: Mood): Spec => ({template: 'cards', cards, title, mood});
const TL = (points: {label: string; sub?: string}[], title?: string, mood?: Mood): Spec => ({template: 'timeline', points, title, mood});
const MP = (o: {center: [number, number]; zoom: number; pins?: Pin[]; highlight?: string[]; title?: string; sub?: string; mood?: Mood}): Spec => ({template: 'map', arrow: false, ...o});
const H = (id: string | undefined, outlet: string, date: string, headline: string, mark: string, url: string, mood?: Mood): Spec =>
  ({template: 'headline', image: id ? `clips/${id}.jpg` : undefined, outlet, date, headline, mark, url, mood, source: `${outlet} via YouTube`});
const src = (s: Spec, source: string): Spec => ({...s, source});
const cap = (s: Spec, c: string): Spec => ({...s, cap: c});

const KL: Pin = {lon: 101.7, lat: 3.1, label: 'MALAYSIA'};

const SPECS: (Spec | Spec[])[] = [
  // 00 — THE SEALED BOXES
  /*0*/ [cap(T('LATE 2024.', 'context', true), 'Late 2024.'), cap(MP({center: [104, 4], zoom: 0.9, pins: [KL], highlight: ['458']}), 'A data center in Malaysia.')],
  /*1*/ src(I('servers', 'A DATA CENTER.', 'Malaysia'), 'According to reports'),
  /*2*/ [cap(I('boxes', 'NVIDIA AI CHIPS.', 'Brand new.'), 'Stacks of boxes. Brand-new Nvidia AI chips.'), cap(I('chip', 'THE MOST WANTED CHIPS.'), 'Some of the most wanted computer chips on the planet.')],
  /*3*/ T('STILL SEALED.', 'danger'),
  /*4*/ [cap(SP('BUY', '→', 'OPEN', 'NORMAL LOGIC.', 'facts'), "If you buy chips this powerful for your own data center, you open them."), cap(I('servers', 'PLUG IN. USE.', undefined, 'facts'), 'You plug them in. You use them.')],
  /*5*/ T('UNLESS…', 'danger'),
  /*6*/ [cap(I('magnifier', 'AN INVESTIGATION.'), 'According to reports, that one moment helped start an investigation'), cap(CA(['A MYSTERY WOMAN', 'THE WHITE HOUSE', "NVIDIA'S CEO"], 'WHERE IT LED.'), 'that would reach a mysterious Chinese businesswoman, the White House, and the man running the most important tech company in the world.')],
  /*7*/ P([JENSEN]),
  /*8*/ H('CU1I2a-FF7E', 'REUTERS', 'NOV 12, 2026', 'Nvidia CEO Jensen Huang resigns', 'resigns', 'https://www.youtube.com/watch?v=CU1I2a-FF7E', 'danger'),
  /*9*/ H('5mNCHODJ_HA', 'NBC NEWS', 'NOV 2026', 'Jensen Huang reinstated as NVIDIA CEO', 'reinstated', 'https://www.youtube.com/watch?v=5mNCHODJ_HA'),
  /*10*/ [cap(TL([{label: 'NOV 12', sub: 'OUT'}, {label: 'NOV 22', sub: 'BACK'}], 'TEN DAYS.'), 'This is the story of how it happened.'), cap(T('NOBODY CAN SAY FOR SURE.', 'context'), 'And why, even now, nobody can say for sure what the truth is.')],
  /*11*/ I('folder', 'FORECAST FILE 003.', 'Nvidia · Spy claims · Power'),

  // 01 — WHY THESE CHIPS MATTER
  /*12*/ T('ONE THING TO KNOW.'),
  /*13*/ [cap(CA(['CHATBOTS', 'SELF-DRIVING CARS', 'MILITARY SOFTWARE'], 'EVERY AI SYSTEM…'), 'Every powerful AI system in the world, from chatbots to self-driving cars to military software,'), cap(I('chip', '…NEEDS THESE.'), 'needs special chips to train and run.')],
  /*14*/ I('chip', 'NVIDIA.', 'Makes most of them.', 'facts'),
  /*15*/ SP('AI WAR', '=', 'NVIDIA', 'THE WEAPONS MAKER.'),
  /*16*/ src(TL([{label: 'OCT 2022', sub: 'US bans top chips to China'}], 'THE BAN.', 'facts'), 'US Commerce Department export controls, Oct 2022'),
  /*17*/ [cap(MP({center: [-98, 39], zoom: 0.12, highlight: ['840'], title: "WASHINGTON'S FEAR."}), "Washington's fear is simple."), cap(I('radar', 'MILITARY + SURVEILLANCE.'), 'If China gets ahead in AI, its military and surveillance power could grow enormously.')],
  /*18*/ [cap(MP({center: [104, 35], zoom: 0.25, highlight: ['156'], title: "BEIJING'S VIEW."}), 'Beijing sees it very differently.'), cap(SP('BANS', '=', 'HOLD US BACK', 'CHINA SAYS.'), 'To China, these bans are an attempt to hold back its economy and keep America on top.')],
  /*19*/ src(P([TRUMP], '"WHOEVER WINS AI, WINS."'), 'Donald Trump, public remarks'),
  /*20*/ P([JENSEN], 'CAUGHT IN THE MIDDLE.'),

  // 02 — THE WOMAN WITH NO PAST
  /*21*/ I('idcard', 'ALICE HUANG.', 'Name, according to reports', 'danger'),
  /*22*/ I('idcard', 'CHINESE CITIZEN.', 'An impressive résumé… on paper.', 'danger'),
  /*23*/ [cap(src(TL([{label: 'STATE TV', sub: 'journalist'}, {label: 'BANKS', sub: 'finance'}, {label: '~2015', sub: 'Shanghai PE firm'}], 'HER CAREER.'), 'Washington Post'), 'According to the Washington Post, she worked as a journalist at Chinese state TV, then at major banks,'), cap(src(I('idcard', 'THE HUSBAND?', 'Owner of the firm: Kang Wei'), 'Washington Post'), 'and by around 2015, she was a senior manager at a Shanghai private equity firm. The owner of that firm, Kang Wei, was later described as her husband.')],
  /*24*/ T("BUT HERE'S THE PROBLEM.", 'danger'),
  /*25*/ [cap(T('NOT CONFIRMED.', 'danger'), 'Almost none of it can be independently confirmed.'), cap(CA(['NO TV RECORD', 'NO MARRIAGE PROOF'], 'NOTHING CHECKS OUT.', 'danger'), 'No public record of the TV work. No proof of the marriage.')],
  /*26*/ [cap(src(T('"A LEGEND."', 'context'), 'Dennis Wilder, former top CIA China analyst'), 'A former top CIA China analyst, Dennis Wilder, said her background looked like a "legend."'), cap(I('idcard', 'A FAKE IDENTITY.', 'Built to look real.'), 'In spy language, that means a fake identity, built to look real.')],
  /*27*/ T('HOW DID SHE GET SO CLOSE?'),
  /*28*/ [cap(src(T('HER OWN HUSBAND.', 'danger'), 'Wall Street Journal'), 'According to the Wall Street Journal, it was her own husband who introduced them.'), cap(src(TL([{label: 'GAMING ERA', sub: 'Kang Wei knew Jensen'}, {label: 'YEARS LATER', sub: 'Introduced Alice'}], 'OLD FRIENDS.'), 'Wall Street Journal'), 'He had known Jensen for years, back when his firm invested in video games and Nvidia was mostly a gaming chip company.')],
  /*29*/ MP({center: [104, 2], zoom: 1.2, pins: [{lon: 103.8, lat: 1.35, label: 'SINGAPORE · DEC 2023'}], title: 'FIRST PUBLIC MEETING.'}),
  /*30*/ [cap(MP({center: [112, 18], zoom: 0.28, pins: [{lon: 121.5, lat: 25.0, label: 'TAIPEI'}, {lon: 121.5, lat: 31.2, label: 'SHANGHAI'}, {lon: 103.8, lat: 1.35, label: 'SINGAPORE'}], title: 'SEEN TOGETHER.'}), 'Over the next few years, they were reportedly seen together in Taipei, in Shanghai,'), cap(MP({center: [-119, 37], zoom: 0.5, pins: [{lon: -121.95, lat: 37.37, label: 'NVIDIA HQ'}, {lon: -121.9, lat: 36.57, label: 'GOLF RESORTS'}], title: 'AND IN AMERICA.'}), 'at Nvidia offices in America, and at golf resorts in California.')],
  /*31*/ I('photos', 'NOT HIDING.', 'Photos posted online.'),
  /*32*/ T('REMEMBER THIS.'),

  // 03 — FOLLOW THE CHIPS
  /*33*/ I('chartV', 'MEANWHILE…', undefined, 'facts'),
  /*34*/ T('MEGASPEED.', 'facts'),
  /*35*/ TL([{label: 'MAR 2023', sub: 'Singapore firm bought, renamed'}], 'THE COMPANY.', 'facts'),
  /*36*/ TL([{label: 'MAR 2023', sub: 'Bought'}, {label: '+8 MONTHS', sub: 'Her name removed'}], 'THEN…', 'facts'),
  /*37*/ [cap(TL([{label: 'MAR 2023', sub: 'Bought'}, {label: '+8 MONTHS', sub: 'Name removed'}, {label: '+4 DAYS', sub: 'Nvidia partner'}], 'FOUR DAYS LATER.', 'facts'), 'And just four days after that, MegaSpeed became an official Nvidia cloud partner,'), cap(I('chip', 'PRIORITY ACCESS.', undefined, 'facts'), "which meant priority access to Nvidia's chips.")],
  /*38*/ T('THE NUMBERS.', 'facts'),
  /*39*/ ST(['$33M'], '2023 ASSETS.', 'MegaSpeed, reportedly', undefined, 'facts'),
  /*40*/ ST(['$33M', '→', '$3B'], 'ONE YEAR LATER.', undefined, undefined, 'facts'),
  /*41*/ ST(['×90'], 'IN ONE YEAR.', undefined, undefined, 'facts'),
  /*42*/ [cap(MP({center: [104, 4], zoom: 0.9, pins: [KL], highlight: ['458'], title: 'SISTER COMPANY.'}), 'A sister company in Malaysia reportedly bought'), cap(ST(['$4.8B'], 'AI EQUIPMENT.', 'Almost all from Nvidia', undefined, 'facts'), 'at least 4.8 billion dollars of advanced AI equipment, almost all of it from Nvidia.')],
  /*43*/ [cap(src(T('THE INFORMATION.', 'danger'), 'The Information, investigation'), 'According to an investigation by The Information, Alice used her companies, and her connection to Jensen,'), cap(src(ST(['$5B+'], 'CHIPS TO CHINA.', 'Reported', undefined, 'danger'), 'The Information, investigation'), "to help move at least 5 billion dollars' worth of Nvidia chips to Chinese companies.")],
  /*44*/ [cap(H(undefined, 'BLOOMBERG', 'DEC 2025', 'Nvidia Buyer Megaspeed Faces Smuggling Probe', 'Smuggling Probe', 'https://www.youtube.com/watch?v=vfrQtabNYYE', 'danger'), 'And according to Bloomberg,'), cap(src(ST(['500'], 'CHIPS MISSING.', 'Not found in its data centers', undefined, 'danger'), 'Bloomberg'), 'at least 500 chips that MegaSpeed imported could not be found in its data centers at all.')],
  /*45*/ I('boxes', 'THE SEALED BOXES.', 'Malaysia', 'context'),

  // 04 — THE FALL
  /*46*/ I('radar', 'ON THE RADAR.', 'MegaSpeed. Then Alice.'),
  /*47*/ I('radar', 'SURVEILLANCE.', 'Close to an American citizen…'),
  /*48*/ P([JENSEN], 'THE AMERICAN.', 'danger'),
  /*49*/ [cap(TL([{label: 'OCT 2025', sub: 'Trump briefed'}], 'THE WARNINGS.'), 'In October 2025, US intelligence officials reportedly briefed President Trump'), cap(I('whitehouse', 'THE WHITE HOUSE KNEW.'), 'about the relationship.')],
  /*50*/ TL([{label: 'OCT 2025', sub: 'Trump briefed'}, {label: 'MAY 2026', sub: 'Rubio memo'}], 'SECOND WARNING.'),
  /*51*/ TL([{label: 'OCT 2025', sub: 'Trump briefed'}, {label: 'MAY 2026', sub: 'Rubio memo'}, {label: 'OCT 29, 2026', sub: 'NYT story'}], 'THE STORY BREAKS.', 'danger'),
  /*52*/ T('DENIED.', 'danger'),
  /*53*/ [cap(I('letter', 'THE LETTER.', 'To all employees'), 'A few days later, Jensen sent a letter to his employees.'), cap(T('ADMITTED.', 'danger'), 'He admitted he had been unfaithful to his wife. He said he had no excuse.')],
  /*54*/ CA(['NO MENTION OF ALICE', 'NO MENTION OF SPYING'], 'WHAT IT LEFT OUT.'),
  /*55*/ H('tp7qrTAT33k', 'NBC NEWS', 'NOV 2026', 'New report alleges that Jensen Huang had relationship with an Nvidia executive', 'Nvidia executive', 'https://www.youtube.com/watch?v=tp7qrTAT33k', 'danger'),
  /*56*/ T('A THIRD WOMAN.', 'danger'),
  /*57*/ H('gCwpCPZeIGQ', 'CNN', 'NOV 2026', 'Nvidia CEO Jensen Huang resigns, Nvidia stock plunges', 'stock plunges', 'https://www.youtube.com/watch?v=gCwpCPZeIGQ', 'danger'),
  /*58*/ [cap(H('CU1I2a-FF7E', 'REUTERS', 'NOV 12, 2026', 'Nvidia CEO Jensen Huang resigns', 'resigns', 'https://www.youtube.com/watch?v=CU1I2a-FF7E', 'danger'), 'And on the morning of November 12th, Jensen Huang resigned from everything.'), cap(CA(['CEO', 'PRESIDENT', 'BOARD'], 'ALL OF IT.', 'danger'), 'CEO. President. The board.')],

  // 05 — THE COMEBACK
  /*59*/ T('NOT THE END.'),
  /*60*/ [cap(I('petition', 'THE PETITION.'), 'A petition to bring him back collected more than 18,800 signatures.'), cap(P([MUSK], 'PUBLIC SUPPORT.'), 'Big names, including Elon Musk, publicly backed him.')],
  /*61*/ H('H9WkFiY7Shk', 'REUTERS', 'NOV 2026', "Nvidia board shuts door on Jensen Huang's return as CEO", 'shuts door', 'https://www.youtube.com/watch?v=H9WkFiY7Shk'),
  /*62*/ H('GDMYaHcEPyc', 'BLOOMBERG', 'NOV 2026', 'Nvidia Reinstates Jensen Huang as CEO', 'Reinstates', 'https://www.youtube.com/watch?v=GDMYaHcEPyc', 'facts'),
  /*63*/ [cap(I('whitehouse', 'SENIOR US OFFICIALS.', 'Consulted by the board', 'facts'), 'The board said it had spoken with senior officials in the US government,'), cap(SP('RETURN', '≠', 'THREAT', 'THE BOARD SAYS.', 'facts'), 'and was confident his return posed no threat to national security.')],
  /*64*/ [cap(P([JENSEN], '"I HAD NO IDEA."'), 'Earlier, according to reports, Jensen had told Trump he had no idea Alice might be a spy.'), cap(P([TRUMP], '"STAY ON."'), 'And Trump allegedly told him he should stay on as CEO.')],
  /*65*/ TL([{label: 'NOV 12', sub: 'OUT'}, {label: 'NOV 22', sub: 'BACK'}], 'FIRED. REHIRED.'),
  /*66*/ T('TEN DAYS.', 'danger', true),

  // 06 — THE TWIST
  /*67*/ T('THE PART MOST PEOPLE MISS.'),
  /*68*/ I('idcard', 'IS SHE EVEN A SPY?'),
  /*69*/ T('NOBODY HAS PROVEN IT.', 'facts'),
  /*70*/ [cap(src(I('capitol', 'JUSTICE DEPT: NO CONCLUSION.', undefined, 'facts'), 'Attorney General Todd Blanche'), 'The US Attorney General, Todd Blanche, has said the Justice Department'), cap(src(T('NO CONCLUSION.', 'facts'), 'Attorney General Todd Blanche'), 'has not reached a conclusion on whether she is a spy.')],
  /*71*/ src(SP('CIA', '≠', 'PROOF', 'AS OF NOV 19.', 'facts'), 'CIA, as reported'),
  /*72*/ [cap(I('photos', 'REMEMBER THE PHOTOS?'), 'Remember those public photos?'), cap(T('A SPY… ON SOCIAL MEDIA?', 'context'), 'Some people ask: if she were a trained spy, why would her relationship with the most watched CEO in tech be all over social media?')],
  /*73*/ T('WHERE DID THE SPY STORY COME FROM?'),
  /*74*/ I('capitol', 'A FIGHT INSIDE.', 'The US government'),
  /*75*/ [cap(P([JENSEN], 'SIDE 1: SELL TO CHINA.'), 'On one side: Jensen Huang. He has said publicly, many times, that he wants to sell more chips to China.'), cap(I('whitehouse', 'RULES LOOSENED.'), 'And with his access to Trump, some restrictions were loosened.'), cap(ST(['15–25%'], 'THE CUT.', 'Paid to the US government on some China sales', undefined, 'facts'), 'Trump even allowed certain chip sales to China, if Nvidia paid the US government a cut of 15 to 25 percent.')],
  /*76*/ SP('HUANG', 'VS', 'HAWKS', 'SIDE 2: MARCO RUBIO.', 'danger'),
  /*77*/ I('letter', "RUBIO'S MEMO.", 'First to say "spy," reportedly', 'danger'),
  /*78*/ [cap(T("HERE'S THE TWIST.", 'danger'), "But here's the twist."), cap(SP('CIA REPORT', '≠', '"SPY"', 'NEVER SAID IT.', 'facts'), 'The CIA report behind that memo reportedly never said she was a spy.'), cap(T("RUBIO'S OWN CALL.", 'facts'), "That conclusion was Rubio's own assessment.")],
  /*79*/ T('A REAL SPY CASE?'),
  /*80*/ SP('SPY CASE', 'OR', 'WEAPON', 'YOU DECIDE.', 'danger'),

  // 07 — THREE SEPARATE ISSUES
  /*81*/ CA(['CONDUCT', 'CONFLICT OF INTEREST', 'TRADE WAR'], 'THREE ISSUES.', 'facts'),
  /*82*/ T('1. CONDUCT.', 'facts'),
  /*83*/ [cap(I('letter', 'ADMITTED.', undefined, 'facts'), 'Jensen admitted he cheated on his wife.'), cap(SP('CEO', '+', 'STAFF', 'WORKPLACE ETHICS.', 'facts'), "But two of the reported relationships were with Nvidia employees. When a CEO has relationships with his own staff, that's a serious question of workplace ethics."), cap(T('NOT A THEORY.', 'facts'), 'That part is not a theory.')],
  /*84*/ T('2. CONFLICT OF INTEREST.', 'facts'),
  /*85*/ [cap(SP('MEGASPEED', '+', 'NVIDIA', 'SPY OR NOT…', 'facts'), 'Spy or not, a company linked to the woman he was involved with got Nvidia partner status and billions of dollars in chips.'), cap(I('scales', 'NEEDS A FULL INVESTIGATION.', undefined, 'facts'), 'That is a clear conflict of interest, and it deserves a full investigation.')],
  /*86*/ T('3. THE TRADE WAR.', 'facts'),
  /*87*/ I('scales', 'DOUBLE STANDARD.'),
  /*88*/ [cap(T('"OPEN YOUR MARKETS."'), 'The US constantly tells other countries to open their markets and remove trade barriers.'), cap(MP({center: [79, 22], zoom: 0.4, highlight: ['356'], title: '"CUT YOUR TARIFFS."'}), 'It pressures countries like India to cut tariffs on American goods.')],
  /*89*/ I('doorShut', 'BUT NOT FOR CHINA.', undefined, 'danger'),
  /*90*/ T('FREE TRADE: ONE WAY?', 'danger'),

  // 08 — WHO PROFITED?
  /*91*/ T('THE THEORY.', 'danger'),
  /*92*/ I('chartV', 'STOCK MANIPULATION?', undefined, 'danger'),
  /*93*/ [cap(I('chartV', 'DOWN. THEN UP.', undefined, 'facts'), 'The stock fell hard during the scandal, and jumped sharply when Jensen came back.'), cap(T('BUY THE BOTTOM?', 'facts'), 'Anyone who bought at the bottom could have made a fortune in days.')],
  /*94*/ T('NO ONE HAS BEEN ACCUSED.', 'facts'),
  /*95*/ [cap(I('magnifier', 'REGULATORS WATCH.', undefined, 'facts'), 'Big swings like this usually get regulators looking for unusual trades.'), cap(T('IF THEY FIND SOMETHING…', 'facts'), 'If they find something, it will be a much bigger story.')],
  /*96*/ T('WHO LEAKED IT? UNKNOWN.', 'context'),

  // 09 — THE FORECAST
  /*97*/ T('OUR FORECAST.', 'facts'),
  /*98*/ P([JENSEN], 'STAYS CEO THROUGH 2027.', 'facts'),
  /*99*/ SP('CHIPS', '→', 'CHINA', 'THE FIGHT GETS LOUDER.', 'facts'),
  /*100*/ T('3 SIGNALS.', 'facts'),
  /*101*/ CA(['CIA / DOJ VERDICT'], 'SIGNAL 1.', 'facts'),
  /*102*/ CA(['CIA / DOJ VERDICT', 'MEGASPEED CHARGES?'], 'SIGNAL 2.', 'facts'),
  /*103*/ [cap(CA(['CIA / DOJ VERDICT', 'MEGASPEED CHARGES?', 'NEXT CHINA CHIP DECISION'], 'SIGNAL 3.', 'facts'), 'Three: the next decision on chip sales to China.'), cap(SP('HUANG', 'VS', 'HAWKS', 'WHO REALLY WON?', 'facts'), "Because whoever wins that fight, Jensen's camp or the hawks, will tell you who really won this scandal.")],
  /*104*/ T('YOUR TURN.'),
  /*105*/ SP('SPY CASE', 'OR', 'WEAPON', 'WHAT DO YOU THINK?', 'danger'),
  /*106*/ T('COMMENT YOUR FORECAST.'),
  /*107*/ I('folder', 'SUBSCRIBE.', 'See what\'s coming before the headlines'),
  /*108*/ I('folder', 'FILE CLOSED.'),
];

const CHAPTERS: [number, string, Mood][] = [
  [0, '00 / THE SEALED BOXES', 'context'], [12, '01 / WHY THESE CHIPS MATTER', 'context'], [21, '02 / THE WOMAN WITH NO PAST', 'context'],
  [33, '03 / FOLLOW THE CHIPS', 'facts'], [46, '04 / THE FALL', 'danger'], [59, '05 / THE COMEBACK', 'context'], [67, '06 / THE TWIST', 'context'],
  [81, '07 / THREE ISSUES', 'facts'], [91, '08 / WHO PROFITED?', 'danger'], [97, '09 / THE FORECAST', 'facts'],
];

const KEY = /^(nvidia|nvidia's|china|china's|chinese|jensen|jensen's|alice|megaspeed|megaspeed's|cia|trump|rubio|rubio's|spy|spy\?|chips|chip|sealed|billion|million|weapons|ai|white|house|board|resigned|back|petition|twist|legend|confirmed|proven|conflict|manipulation|forecast|comments)[.,?!"]*$/i;

type Line = {text: string; start: number; speechEnd: number; next: number};

export const buildEp003 = (): Scene[] => {
  const t = TIMING as Line[];
  if (t.length !== SPECS.length) throw new Error(`timing has ${t.length} lines, specs ${SPECS.length}`);
  const out: Scene[] = [];
  t.forEach((line, i) => {
    const ch = [...CHAPTERS].reverse().find(([s]) => i >= s)!;
    const end = i + 1 < t.length ? t[i + 1].start : line.next;
    const start = i === 0 ? 0 : line.start;
    const speech = line.speechEnd - line.start;
    const parts = Array.isArray(SPECS[i]) ? (SPECS[i] as Spec[]) : [{...(SPECS[i] as Spec), cap: line.text}];
    const joined = parts.map((p) => p.cap ?? line.text).join(' ');
    if (joined !== line.text) throw new Error(`Line ${i}: split captions don't match the narration.\n  got:  ${joined}\n  want: ${line.text}`);
    const lens = parts.map((p) => (p.cap ?? line.text).length);
    const total = lens.reduce((a, b) => a + b, 0);
    let cursor = line.start;
    parts.forEach((p, k) => {
      const share = speech * (lens[k] / total);
      const pStart = k === 0 ? start : cursor;
      const pEnd = k === parts.length - 1 ? end : cursor + share;
      const words = (p.cap ?? line.text).split(' ');
      const {cap: _c, ...rest} = p;
      out.push({
        ...(rest as any),
        mood: p.mood ?? ch[2],
        chapter: ch[1],
        caption: p.cap ?? line.text,
        highlight: p.highlight ?? words.filter((w) => KEY.test(w) || /\d/.test(w)),
        seconds: pEnd - pStart,
        speak: share + (k === 0 ? line.start - start : 0),
      } as Scene);
      cursor += share;
    });
  });
  return out;
};
