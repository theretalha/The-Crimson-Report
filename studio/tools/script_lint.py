#!/usr/bin/env python3
"""Retention linter for a Crimson Forecast narration script (AGENTS.md stage 1; skill: .claude/skills/crimson-retention).

  python3 tools/script_lint.py ../episodes/004-slug [--timing src/data/ep004-timing.json] [--strict-warn]

Reads <episode>/narration-tts.txt and <episode>/retention-map.md. Exit 1 on any ERROR.
Checks: sentence length (8-15 avg, hard cap 22), contractions, banned abstract phrases, picture-word coverage (every line drawable),
TTS tags (only those in TTS-TAGS.md, none of the laughing/shouting ones, density), no dot-tricks, hedged allegations, and the OPEN/CLOSE
loop map (an open loop at least every 90 s, every loop paid off).

retention-map.md format, one per line (L = narration line number, 0-based, as in the shot list):
  L2  | OPEN  | Why were the boxes still sealed?
  L9  | CLOSE L2 | They were never meant to stay there.
  L9  | OPEN  | Who signed the order?
"""
import os as _os, sys as _sys
if _os.name == 'nt' and not _sys.flags.utf8_mode and __name__ == '__main__':   # Windows: default encoding is cp1252, our files are UTF-8
    _sys.exit(__import__('subprocess').call([_sys.executable, '-X', 'utf8', *_sys.argv]))
import argparse, collections, json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
GOOD_TAGS = {'short pause', 'long pause', 'breath', 'heavy breath', 'exhales', 'gasp', 'pant', 'sigh', 'sighs', 'whispers', 'whispering', 'tsk', 'tut', 'throat-clearing', 'cough', 'hiss', 'groan', 'grunt', 'growl', 'grr', 'argh', 'sob', 'whimper', 'cry', 'yawn', 'sneeze', 'snort', 'snicker', 'giggle', 'laugh', 'laughter', 'cackle', 'guffaw', 'cheer', 'applause', 'shout', 'scream', 'shriek', 'yell'}
TONE_BREAKERS = {'laugh', 'laughter', 'cackle', 'guffaw', 'giggle', 'snicker', 'snort', 'cheer', 'applause', 'shout', 'scream', 'shriek', 'yell', 'cry', 'sob', 'whimper', 'yawn', 'sneeze'}
ABSTRACT = re.compile(r"\b(tensions? (?:escalat\w+|rose|mounted|grew)|situation (?:escalated|worsened|deteriorated)|pressure (?:mounted|grew|built)|concerns? (?:grew|mounted)|raised questions|sparked (?:outrage|concerns?|debate)|in the wake of|amid (?:growing|rising|mounting)|geopolitical landscape|unprecedented|pivotal|testament|underscor\w+|delve\w*|multifaceted|navigat\w+ (?:the|a) (?:complex|landscape)|it'?s worth noting|key players?|a complex web)\b", re.I)
CONTRACTION = re.compile(r"\b\w+(?:n't|'s|'re|'ll|'d|'ve|'m)\b", re.I)
EXPANDED = re.compile(r"\b(do not|does not|did not|cannot|can not|it is|they are|we are|that is|there is|would not|could not|have not|will not|he is|she is)\b", re.I)
WPS = 2.4   # spoken words per second (calm documentary voice)


def lines_of(path):
    chapter, out, started = '', [], False
    for raw in pathlib.Path(path).read_text(encoding='utf-8').splitlines():
        s = raw.strip()
        m = re.match(r'\[CHAPTER\s+(\d+)\s*[—-]\s*(.*)\]', s)
        if m: chapter, started = m.group(2), True; continue
        if started and s: out.append({'chapter': chapter, 'text': s})
    return out


def plain(t): return re.sub(r'<[^>]+>', ' ', t)
def words(t): return re.findall(r"[A-Za-z0-9$%'’-]+", plain(t))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('episode'); ap.add_argument('--timing'); ap.add_argument('--strict-warn', action='store_true')
    a = ap.parse_args()
    ep = pathlib.Path(a.episode)
    narr = ep / 'narration-tts.txt'
    if not narr.exists(): print(f'ERROR: {narr} not found'); sys.exit(1)
    lines = lines_of(narr)
    rules = json.load(open(ROOT / 'director/reuse-rules.json')); lex = json.load(open(ROOT / 'director/lexicon.json'))
    allege = re.compile(rules['allegation_re'], re.I); hedge = re.compile(rules['hedge_re'], re.I)
    E, W = [], []
    if not lines: print('ERROR: no narration lines (need [CHAPTER n - NAME] markers)'); sys.exit(1)

    # time of each line start (real timing if given, else words / 2.4 per second + 0.5 s pause)
    if a.timing: T = [t['start'] for t in json.load(open(a.timing))]
    else:
        T, t = [], 0.0
        for ln in lines: T.append(t); t += len(words(ln['text'])) / WPS + 0.5
    total = T[-1] + len(words(lines[-1]['text'])) / WPS

    sent_lens, tags_n, sents_n, contr_lines, expanded, pictureless, short = [], 0, 0, 0, 0, [], 0
    for i, ln in enumerate(lines):
        txt = ln['text']; pt = plain(txt)
        sents = [s for s in re.split(r'(?<=[.!?])\s+', pt.strip()) if words(s)]
        for s in sents:
            n = len(words(s)); sent_lens.append(n); sents_n += 1
            if n > 22: E.append(f'L{i}: sentence has {n} words (hard cap 22): "{s[:70]}..."')
            if n <= 3: short += 1
        if ABSTRACT.search(pt): E.append(f'L{i}: abstract phrase "{ABSTRACT.search(pt).group(0)}": say what a camera would see (rule: physical action only)')
        if re.search(r'\.{3,}|…', txt): E.append(f'L{i}: dots used for a pause: use <short pause>/<long pause> from TTS-TAGS.md')
        if '—' in txt or ' - ' in txt: W.append(f'L{i}: dash in a spoken line (TTS reads it as nothing): use a full stop')
        for tg in re.findall(r'<([^>]+)>', txt):
            tags_n += 1
            if tg not in GOOD_TAGS: E.append(f'L{i}: unknown TTS tag <{tg}> (list: TTS-TAGS.md)')
            elif tg in TONE_BREAKERS: E.append(f'L{i}: <{tg}> breaks the serious documentary tone')
        if CONTRACTION.search(pt): contr_lines += 1
        if EXPANDED.search(pt): expanded += 1
        if allege.search(pt) and not hedge.search(pt): E.append(f'L{i}: allegation word "{allege.search(pt).group(0)}" without a hedge (reportedly / according to ...)')
        hits = [e for e in lex['entries'] + lex.get('custom_entries', []) if re.search(e['re'], pt, re.I)]
        if not hits and len(words(pt)) > 4 and not re.search(r'\b(he|she|they|nobody|officials?|agents?|board|company|president|minister)\b', pt, re.I): pictureless.append(i)
    avg = sum(sent_lens) / max(1, len(sent_lens))
    if not 8 <= avg <= 15: W.append(f'average sentence is {avg:.1f} words (target 8-15)')
    if short / max(1, sents_n) > 0.25: W.append(f'{short} of {sents_n} sentences are 3 words or fewer: keep punch lines rare')
    if contr_lines / len(lines) < 0.3: W.append(f'only {contr_lines}/{len(lines)} lines use contractions (target 30%+): read it aloud, it sounds stiff')
    if expanded / len(lines) > 0.25: W.append(f'{expanded} lines use expanded forms (do not / it is): contract them')
    if tags_n / max(1, sents_n) > 0.5: W.append(f'{tags_n} tags for {sents_n} sentences: use about one tag per 2-3 sentences')
    if pictureless and len(pictureless) / len(lines) > 0.15: E.append(f'{len(pictureless)}/{len(lines)} lines name nothing a camera could see (lines {pictureless[:12]}): rewrite with a physical object or action')
    elif pictureless: W.append(f'lines with no picture-word: {pictureless[:12]}')

    # retention map: open loops
    rm = ep / 'retention-map.md'
    opens, closes = [], {}
    if not rm.exists(): E.append('retention-map.md is missing (L<n> | OPEN | question  /  L<n> | CLOSE L<m> | answer)')
    else:
        for raw in rm.read_text(encoding='utf-8').splitlines():
            m = re.match(r'^\s*L(\d+)\s*\|\s*(OPEN|CLOSE)(?:\s+L(\d+))?\s*\|', raw, re.I)
            if not m: continue
            n, kind, ref = int(m.group(1)), m.group(2).upper(), m.group(3)
            if n >= len(lines): E.append(f'retention-map: L{n} does not exist ({len(lines)} lines)'); continue
            if kind == 'OPEN': opens.append(n)
            elif ref is not None: closes[int(ref)] = n
        opens.sort()
        if not opens: E.append('retention-map.md has no OPEN loops')
        else:
            if T[opens[0]] > 25: E.append(f'first open loop at {T[opens[0]]:.0f} s (must be inside the first 25 s)')
            for x, y in zip(opens, opens[1:]):
                if T[y] - T[x] > 90: E.append(f'no new open loop between {T[x]:.0f} s and {T[y]:.0f} s ({T[y] - T[x]:.0f} s gap, max 90)')
            if total - T[opens[-1]] > 90: W.append(f'last open loop at {T[opens[-1]]:.0f} s, video ends {total:.0f} s: plant one more near the end')
            for o in opens[:-1]:
                if o not in closes: E.append(f'loop opened at L{o} is never paid off (add L<n> | CLOSE L{o} | ...)')
                elif closes[o] <= o: E.append(f'loop L{o} closes at L{closes[o]} (must be later)')

    print(f'{ep.name}: {len(lines)} lines, ~{total / 60:.1f} min, avg {avg:.1f} words/sentence, contractions {contr_lines}/{len(lines)}, tags {tags_n}, open loops {len(opens)}')
    for m in E: print('ERROR', m)
    for m in W: print('WARN ', m)
    if not E and not W: print('clean')
    sys.exit(1 if E or (W and a.strict_warn) else 0)


if __name__ == '__main__':
    main()
