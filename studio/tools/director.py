#!/usr/bin/env python3
"""Director brain, part 1: ANALYZE + VALIDATE.  (rules: DIRECTOR-BRAIN.md)

  python3 tools/director.py --narration ../episodes/003-nvidia-ceo-scandal/narration-tts.txt \
      --timing src/data/ep003-timing.json --cues out/ep003-cues.json \
      --out out/ep003-director.json --md ../episodes/003-nvidia-ceo-scandal/director-analysis.md

1. Reads the narration line by line with its timing.
2. Finds the words that carry a picture (objects, actions, documents, people, places, money, dates) using director/lexicon.json.
3. Splits each line into beats and proposes WHAT YOU WOULD SEE for each, from the props in director/props.json (built / partial / missing).
4. Checks the CURRENT scene list (cues) against the rulebook and reports violations.
No AI is called here: the thinking part (choosing the final shot list) is done by the producer session using this analysis; this script keeps it honest.
"""
import argparse, json, re, sys, collections, pathlib

# ---- thresholds (keep in sync with DIRECTOR-BRAIN.md) ----
REPEAT_WINDOW = 5          # same template twice inside this many scenes = repetition
MAX_TEXTISH_RUN_S = 12.0   # continuous seconds of title/cards/split/stat/icon-only scenes
MAX_TITLE_SHARE = 0.10     # title cards as share of runtime (punchlines only)
MAX_STATIC_TITLE_S = 3.0   # a title card longer than this is a dry screen
MAX_FIRST_REVEAL_S = 0.7   # a scene must show its first real picture within this many seconds (no empty starts)
MAX_SAME_TEMPLATE_RUN = 2  # consecutive scenes of the same template
CONTINUOUS = {'recipe', 'entities', 'chart'}   # one idea built across several scenes (same place on screen), allowed to repeat
TEXTISH = {'title', 'cards', 'split', 'stat', 'icon'}     # no real objects / action on screen
PRIORITY = {'action': 0, 'object': 1, 'document': 2, 'person': 3, 'place': 4, 'money': 5, 'org': 6, 'concept': 7, 'date': 8}
VISUAL_CATS = {'action', 'object', 'document'}            # these MUST be drawn, never only written

def load_lines(narr_path):
    chapter, out, started = '', [], False
    for raw in pathlib.Path(narr_path).read_text(encoding='utf-8').splitlines():
        s = raw.strip()
        m = re.match(r'\[CHAPTER\s+(\d+)\s+[—-]\s+(.*)\]', s)
        if m:
            chapter, started = f'{int(m.group(1)):02d} / {m.group(2)}', True
            continue
        if started and s:
            out.append({'chapter': chapter, 'text': s})
    return out

def find_hits(text, lex):
    hits = []
    for e in lex['entries']:
        for m in re.finditer(e['re'], text, re.I):
            hits.append({'id': e['id'], 'cat': e['cat'], 'prop': e['prop'], 'see': e['see'], 'word': m.group(0), 'a': m.start(), 'b': m.end()})
    for m in re.finditer(lex['date_re'], text, re.I):
        hits.append({'id': 'date', 'cat': 'date', 'prop': 'timeline', 'see': 'date goes on the slim timeline ribbon', 'word': m.group(0), 'a': m.start(), 'b': m.end()})
    # drop hits swallowed by a longer hit; keep different ids that merely touch
    hits.sort(key=lambda h: (h['a'], -(h['b'] - h['a'])))
    kept = []
    for h in hits:
        if any(k['a'] <= h['a'] and h['b'] <= k['b'] and (k['b'] - k['a']) > (h['b'] - h['a']) for k in kept):
            continue
        if any(k['id'] == h['id'] and k['a'] == h['a'] for k in kept):
            continue
        kept.append(h)
    return kept

def beats_of(text):
    # clause spans: split after . , ; : and before "and then / but / unless"
    cuts = [m.end() for m in re.finditer(r'[.,;:!?…]+\s+|\s+(?=(?:and then|but|unless|while|because)\b)', text)]
    spans, last = [], 0
    for c in cuts + [len(text)]:
        if c > last: spans.append([last, c]); last = c
    merged = []
    for a, b in spans:  # merge tiny beats into the previous one
        if merged and len(text[a:b].split()) < 3: merged[-1][1] = b
        else: merged.append([a, b])
    if len(merged) > 1 and len(text[merged[0][0]:merged[0][1]].split()) < 3:
        merged[1][0] = merged[0][0]; merged.pop(0)
    return merged

def analyze(lines, timing, lex, props):
    P = props['props']; connect = re.compile(lex['connect_re'], re.I)
    res = []
    for i, ln in enumerate(lines):
        tm = timing[i] if i < len(timing) else None
        t0 = tm['start'] if tm else 0.0
        t1 = tm['speechEnd'] if tm else t0
        text = ln['text']; L = max(1, len(text))
        hits = find_hits(text, lex)
        for h in hits: h['t'] = round(t0 + h['a'] / L * (t1 - t0), 2)
        beats = []
        for a, b in beats_of(text):
            bh = [h for h in hits if a <= h['a'] < b]
            bh.sort(key=lambda h: (PRIORITY[h['cat']], h['a']))
            top = bh[0] if bh else None
            vis = [h for h in bh if h['cat'] in VISUAL_CATS]
            people = {h['id'] for h in bh if h['cat'] == 'person'}; orgs = {h['id'] for h in bh if h['cat'] == 'org'}
            link = bool(connect.search(text[a:b])) and (len(people | orgs) >= 1)
            words = len(text[a:b].split())
            if link: prop, see = 'entity-map', 'connected structure: ' + ', '.join(sorted(people | orgs)) + ' with typed links'
            elif top: prop, see = top['prop'], top['see']
            else: prop, see = None, None
            kind = 'punchline' if (words <= 4 and not top) or text.rstrip().endswith('...') else ('no-picture-word' if not top else 'picture')
            beats.append({'text': text[a:b].strip(), 't': round(t0 + a / L * (t1 - t0), 2), 'dur': round((b - a) / L * (t1 - t0), 2), 'kind': kind,
                          'keywords': [{'w': h['word'], 'id': h['id'], 'cat': h['cat'], 't': h['t']} for h in bh],
                          'must_draw': [h['word'] for h in vis], 'prop': prop, 'see': see,
                          'prop_status': (P.get(prop, {}).get('status') if prop else None)})
        res.append({'line': i, 'chapter': ln['chapter'], 'text': text, 'start': t0, 'end': t1, 'beats': beats})
    return res

def validate(cues, analysis):
    """Checks the CURRENT scene list. Returns (issues, stats)."""
    issues = []; total = sum(c['dur'] for c in cues) or 1
    by_tpl = collections.Counter(c['template'] for c in cues)
    title_s = sum(c['dur'] for c in cues if c['template'] == 'title')
    textish_s = sum(c['dur'] for c in cues if c['template'] in TEXTISH)
    stats = {'scenes': len(cues), 'seconds': round(total), 'by_template': dict(by_tpl), 'title_share': round(title_s / total, 3), 'textish_share': round(textish_s / total, 3)}
    if title_s / total > MAX_TITLE_SHARE:
        issues.append({'rule': 'R-TITLE', 'msg': f'title cards are {title_s/total:.0%} of runtime (max {MAX_TITLE_SHARE:.0%}): {by_tpl["title"]} scenes'})
    # repetition
    for i, c in enumerate(cues):
        win = cues[max(0, i - REPEAT_WINDOW + 1):i]
        if c['template'] in ('title', 'icon') and sum(1 for w in win if w['template'] == c['template']) >= 2:
            issues.append({'rule': 'R-REPEAT', 'at': round(c['start'], 1), 'line': c['line'], 'msg': f"'{c['template']}' used 3x inside {REPEAT_WINDOW} scenes"})
    run = 1
    for i in range(1, len(cues)):
        run = run + 1 if cues[i]['template'] == cues[i - 1]['template'] else 1
        if run > MAX_SAME_TEMPLATE_RUN and cues[i]['template'] not in CONTINUOUS:
            issues.append({'rule': 'R-RUN', 'at': round(cues[i]['start'], 1), 'line': cues[i]['line'], 'msg': f"{run} '{cues[i]['template']}' scenes in a row"})
    for c in cues:
        fr = c.get('firstReveal')
        if fr is not None and fr > MAX_FIRST_REVEAL_S and c['dur'] > 1.5:
            issues.append({'rule': 'R-EMPTY', 'at': round(c['start'], 1), 'line': c['line'], 'msg': f"scene shows nothing for {fr:.1f} s before its first picture"})
    # dry stretches
    acc, t_start = 0.0, 0.0
    for c in cues:
        if c['template'] in TEXTISH:
            if acc == 0: t_start = c['start']
            acc += c['dur']
        else:
            if acc > MAX_TEXTISH_RUN_S: issues.append({'rule': 'R-DRY', 'at': round(t_start, 1), 'msg': f'{acc:.0f} s of text/icon-only scenes in a row'})
            acc = 0.0
        if c['template'] == 'title' and c['dur'] > MAX_STATIC_TITLE_S:
            issues.append({'rule': 'R-STATIC', 'at': round(c['start'], 1), 'line': c['line'], 'msg': f"title card on screen {c['dur']:.1f} s (max {MAX_STATIC_TITLE_S})"})
    if acc > MAX_TEXTISH_RUN_S: issues.append({'rule': 'R-DRY', 'at': round(t_start, 1), 'msg': f'{acc:.0f} s of text/icon-only scenes in a row'})
    # 9c: a line that names a thing/action but is shown only as text/icon
    scenes_of = collections.defaultdict(list)
    for c in cues: scenes_of[c['line']].append(c)
    for a in analysis:
        sc = scenes_of.get(a['line'], [])
        if not sc: continue
        need = [w for b in a['beats'] for w in b['must_draw']]
        if need and all(s['template'] in TEXTISH for s in sc):
            issues.append({'rule': 'R-9C', 'at': round(sc[0]['start'], 1), 'line': a['line'],
                           'msg': f"narration names {sorted(set(w.lower() for w in need))[:4]} but the scene is only {sorted({s['template'] for s in sc})}"})
    return issues, stats

def prop_demand(analysis, props):
    d = collections.Counter(); P = props['props']
    for a in analysis:
        for b in a['beats']:
            if b['prop']: d[b['prop']] += 1
    return [(p, n, P.get(p, {}).get('status', 'unknown')) for p, n in d.most_common()]

def write_md(path, analysis, issues, stats, demand, cues):
    scenes_of = collections.defaultdict(list)
    for c in cues: scenes_of[c['line']].append(c['template'])
    L = ['# Director analysis (auto-generated by tools/director.py)', '',
         f"Scenes now: **{stats['scenes']}** in {stats['seconds']} s. Title cards: {stats['title_share']:.0%} of runtime. Text/icon-only scenes: {stats['textish_share']:.0%} of runtime.", '',
         '## Rule violations in the current cut', '']
    cnt = collections.Counter(i['rule'] for i in issues)
    L.append(', '.join(f'{k}: {v}' for k, v in sorted(cnt.items())) or 'none'); L.append('')
    for i in issues[:60]: L.append(f"- `{i['rule']}` @ {i.get('at', '-')} s (line {i.get('line', '-')}): {i['msg']}")
    if len(issues) > 60: L.append(f'- ... {len(issues) - 60} more in out/ep003-director.json')
    L += ['', '## Props the script needs (count of beats) and whether we can draw them', '', '| prop | beats | status |', '|---|---|---|']
    for p, n, s in demand: L.append(f'| {p} | {n} | {"**NEEDS BUILD**" if s == "missing" else s} |')
    L += ['', '## Beat by beat: what you would SEE', '']
    ch = None
    for a in analysis:
        if a['chapter'] != ch: ch = a['chapter']; L += [f'### {ch}', '']
        now = ', '.join(scenes_of.get(a['line'], [])) or '-'
        L.append(f"**L{a['line']}** `{a['start']:.1f}s` {a['text']}  \n_now:_ {now}")
        for b in a['beats']:
            kw = ', '.join(f"{k['w']}({k['cat'][:3]})" for k in b['keywords']) or '-'
            show = f"{b['see']} → **{b['prop']}** [{b['prop_status']}]" if b['prop'] else ('punchline: a title card is allowed' if b['kind'] == 'punchline' else 'NO PICTURE WORD: ask the producer for a visual idea')
            L.append(f"- `{b['t']:.1f}s` “{b['text']}” — keys: {kw}  \n  SEE: {show}")
        L.append('')
    pathlib.Path(path).write_text('\n'.join(L), encoding='utf-8')

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--narration', required=True); ap.add_argument('--timing', required=True); ap.add_argument('--cues', required=True)
    ap.add_argument('--lexicon', default='director/lexicon.json'); ap.add_argument('--props', default='director/props.json')
    ap.add_argument('--out', default='out/director.json'); ap.add_argument('--md')
    ap.add_argument('--strict', action='store_true', help='exit 1 if any rule is violated')
    a = ap.parse_args()
    lines = load_lines(a.narration); timing = json.load(open(a.timing)); lex = json.load(open(a.lexicon)); props = json.load(open(a.props))
    cues = json.load(open(a.cues))['cues']
    if len(lines) != len(timing): print(f'WARN: {len(lines)} narration lines vs {len(timing)} timing lines', file=sys.stderr)
    analysis = analyze(lines, timing, lex, props)
    issues, stats = validate(cues, analysis)
    demand = prop_demand(analysis, props)
    json.dump({'stats': stats, 'issues': issues, 'prop_demand': demand, 'lines': analysis}, open(a.out, 'w'), indent=1)
    if a.md: write_md(a.md, analysis, issues, stats, demand, cues)
    cnt = collections.Counter(i['rule'] for i in issues)
    print(f"lines {len(lines)} | scenes {stats['scenes']} | violations {len(issues)} {dict(cnt)}")
    print('title share', stats['title_share'], '| text/icon-only share', stats['textish_share'])
    miss = [(p, n) for p, n, s in demand if s == 'missing']
    print('props NEEDING BUILD (beats):', miss)
    if a.strict and issues: sys.exit(1)

if __name__ == '__main__':
    main()
