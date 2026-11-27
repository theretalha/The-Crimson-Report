#!/usr/bin/env python3
"""Director brain, part 1: ANALYZE + VALIDATE.  (rules: DIRECTOR-BRAIN.md)

  python3 tools/director.py --narration ../episodes/003-nvidia-ceo-scandal/narration-tts.txt \
      --timing src/data/ep003-timing.json --cues out/ep003-cues.json \
      --out out/ep003-director.json --md ../episodes/003-nvidia-ceo-scandal/director-analysis.md

1. Reads the narration line by line with its timing.
2. Finds the words that carry a picture (objects, actions, documents, people, places, money, dates) using director/lexicon.json.
3. Splits each line into beats and proposes WHAT YOU WOULD SEE for each, from the props in director/props.json (built / partial / missing).
4. Checks the CURRENT scene list (cues) against the rulebook and reports violations.
5. ANTI-REUSE (AGENTS.md rule 1, new): a generic prop (crates, rack, building, ...) may only be on screen if the narration line contains
   one of its evidence words (director/reuse-rules.json); a physical thing no built-in prop draws (tanker, submarine cable, missile battery,
   wafer ... = lexicon `custom_entries`) needs a CUSTOM prop from src/props/custom/epNNN/ (R-REUSE, R-NOCUSTOM, R-CUSTOM-MISSING, R-CUSTOM-QUALITY).
6. --shotlist <shot-list.md>: checks the 1:1 shot list BEFORE anything is built (R-SHOT-MISSING, R-SHOT-INCOMPLETE, R-REUSE, R-NOCUSTOM,
   R-CUSTOM-MISSING, R-HEDGE-LINE, R-HEDGE-SCREEN). Works with --narration alone (no audio yet).
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
            s = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', s)).strip()   # TTS tags (<short pause>) are not words
            if s: out.append({'chapter': chapter, 'text': s})
    return out

def find_hits(text, lex):
    hits = []
    for e in lex['entries'] + lex.get('custom_entries', []):
        for m in re.finditer(e['re'], text, re.I):
            hits.append({'id': e['id'], 'cat': e['cat'], 'prop': e.get('prop') or 'custom:' + e['custom'], 'custom': e.get('custom'), 'see': e['see'], 'word': m.group(0), 'a': m.start(), 'b': m.end()})
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

def prop_status(prop, hits, P, custom):
    if prop.startswith('custom:'):
        words = [h['word'] for h in hits if h.get('custom')]
        built = any(words and any(ev_match(c['evidence'], w) for w in words) for c in custom.values())
        return 'built (custom)' if built else 'NEEDS CUSTOM'
    return P.get(prop, {}).get('status')

def ev_match(evidence, text):
    """True if the evidence regex (alternation of words) matches `text` as whole words."""
    try: return re.search(r'(?<![\w])(?:' + evidence + r')(?![\w])', text or '', re.I) is not None
    except re.error: return False

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

def analyze(lines, timing, lex, props, custom=None):
    custom = custom or {}
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
                          'custom_needed': sorted({(h['custom'], h['word']) for h in bh if h.get('custom')}),
                          'prop_status': (prop_status(prop, bh, P, custom) if prop else None)})
        res.append({'line': i, 'chapter': ln['chapter'], 'text': text, 'start': t0, 'end': t1, 'beats': beats})
    return res

def validate(cues, analysis, rules=None, custom=None):
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
    if rules is not None:
        if any('items' in c for c in cues): issues += check_items(cues, analysis, rules, custom or {})
        else: stats['legacy_cues'] = True   # cues exported by the old ep003 exporter carry no item list: anti-reuse checks skipped
    return issues, stats

# ---------------------------------------------------------------------------------------------------------------------
# ANTI-REUSE (AGENTS.md rule 1). Compose items per scene come from tools/export-ep.ts (cue['items']).
# ---------------------------------------------------------------------------------------------------------------------
def load_custom(custom_dir, folder):
    """Reads src/props/custom/<folder>/*.ts(x): returns {id: {evidence, describes, src, files}} by parsing each register({...}) block."""
    d = pathlib.Path(custom_dir) / folder
    out = {}
    if not d.is_dir(): return out
    texts = {f.name: f.read_text(encoding='utf-8') for f in sorted(d.glob('*.ts*'))}
    blob = '\n'.join(texts.values())
    for chunk in blob.split('register(')[1:]:
        m = re.search(r"id:\s*['\"]([a-z0-9]+\.[a-z0-9-]+)['\"]", chunk)
        if not m: continue
        ev = re.search(r"evidence:\s*'((?:[^'\\]|\\.)*)'", chunk) or re.search(r'evidence:\s*"((?:[^"\\]|\\.)*)"', chunk)
        ds = re.search(r"describes:\s*['\"]([^'\"]*)['\"]", chunk)
        out[m.group(1)] = {'evidence': (ev.group(1).replace('\\\\', '\\') if ev else ''), 'describes': ds.group(1) if ds else '', 'src': blob}
    return out

def custom_quality(cid, c):
    """Static check that a custom prop really has draw-on strokes, depth, overshoot and sound events (rule 1)."""
    src = c['src']; miss = []
    if not re.search(r'drawOn\(|strokeDashoffset', src): miss.append('draw-on strokes (drawOn)')
    if not re.search(r'overshoot\(|spring\(', src): miss.append('overshoot (overshoot/spring)')
    if not re.search(r'groundShadowProps\(|shadow', src, re.I): miss.append('depth (ground shadow / layered fills)')
    if not re.search(r"kind:\s*'(?:impact|braam|whoosh|tick|ping|shutter|paper|marker|stamp|slam|keys|glitch)'", src): miss.append('sound events (events: [{kind: ...}])')
    if re.search(r"kind:\s*'riser'", src): miss.append('NO risers allowed')
    return miss

def line_text(analysis, cue):
    ln = cue.get('line')
    base = next((a['text'] for a in analysis if a['line'] == ln), '') if ln is not None and ln >= 0 else ''
    return f"{base} {cue.get('caption', '')}".strip()

def item_evidence(it, rules):
    """Returns (name, evidence regex or None, kind_note). evidence None = always allowed (neutral/unknown handled by caller)."""
    R = rules['compose'].get(it['p'])
    if it.get('custom'): return it['p'], it['custom'].get('evidence'), 'custom'
    if not R or R['role'] == 'neutral': return it['p'], None, 'neutral'
    if it['p'] == 'building':
        k = it.get('kind') or 'office'
        return f"building:{k}", R['by_kind'].get(k, R['by_kind']['office']), 'generic'
    if it['p'] == 'card':
        if it.get('kind') in ('photo', 'person'):
            toks = [t for t in re.findall(r"[A-Za-z]{3,}", it.get('name') or '')]
            return f"card:{it.get('name')}", ('|'.join(re.escape(t) for t in toks) if toks else None), 'name'
        if it.get('kind') == 'building':
            k = it.get('text') or 'office'
            return f"card:building:{k}", R_by_kind(rules, k), 'generic'
        return 'card', None, 'neutral'
    return it['p'], R.get('evidence'), 'generic'

def R_by_kind(rules, k):
    bk = rules['compose']['building']['by_kind']
    return bk.get(k, bk['office'])

def check_items(cues, analysis, rules, custom):
    issues = []
    for c in cues:
        items = c.get('items') or []
        if not items: continue
        text = line_text(analysis, c)
        for it in items:
            name, ev, role = item_evidence(it, rules)
            if ev and not ev_match(ev, text):
                what = 'custom prop' if role == 'custom' else 'name card' if role == 'name' else 'generic prop'
                issues.append({'rule': 'R-REUSE', 'at': round(c['start'], 1), 'line': c.get('line'),
                               'msg': f"{what} '{name}' is on screen but the narration never says {ev.split('|')[:5]}. Build a custom prop for what the line really names, or remove it"})
        # custom-demand words in this line must be drawn by a custom prop (checked once per line, on its first scene)
    seen = set()
    by_line = collections.defaultdict(list)
    for c in cues: by_line[c.get('line')].append(c)
    for a in analysis:
        need = sorted({(slug, w.lower()) for b in a['beats'] for slug, w in b.get('custom_needed', [])})
        if not need: continue
        scenes = by_line.get(a['line'], [])
        if not scenes or not any('items' in c for c in scenes): continue
        have = [it['custom'] for c in scenes for it in (c.get('items') or []) if it.get('custom')]
        for slug, word in need:
            if not any(ev_match(h['evidence'], word) for h in have) and (slug, a['line']) not in seen:
                seen.add((slug, a['line']))
                issues.append({'rule': 'R-NOCUSTOM', 'at': round(scenes[0]['start'], 1), 'line': a['line'],
                               'msg': f"narration names '{word}' ({slug}); no built-in prop draws it. Code a custom prop (src/props/custom/epNNN/) and use it in this scene"})
    for cid, c in custom.items():
        for m in custom_quality(cid, c):
            issues.append({'rule': 'R-CUSTOM-QUALITY', 'msg': f"custom prop {cid} lacks {m}"})
    return issues

# ---------------------------------------------------------------------------------------------------------------------
# SHOT LIST (1:1 with the narration lines) -- checked BEFORE building. Format: see AGENTS.md "shot-list.md".
# ---------------------------------------------------------------------------------------------------------------------
def parse_shotlist(path):
    blocks, cur, key = {}, None, None
    for raw in pathlib.Path(path).read_text(encoding='utf-8').splitlines():
        m = re.match(r'^#{2,4}\s*L(\d+)\b', raw.strip())
        if m: cur = blocks.setdefault(int(m.group(1)), {}); key = None; continue
        if cur is None: continue
        m = re.match(r'^\s*(SEE|PROP|TIMING|SRC|HEDGE|SOUND|CALLOUT)\s*:\s*(.*)$', raw, re.I)
        if m: key = m.group(1).upper(); cur[key] = m.group(2).strip(); continue
        if key and raw.startswith('  ') and raw.strip(): cur[key] += ' ' + raw.strip()
    return blocks

PROP_TOKEN = re.compile(r'([A-Za-z0-9._:-]+)\s*\[\s*(built|partial|missing|new|custom)\b\s*([A-Za-z0-9._-]+)?\s*\]', re.I)

def check_shotlist(path, lines, lex, props, rules, custom):
    issues = []; blocks = parse_shotlist(path)
    P = props['props']; compose = rules['compose']
    allege = re.compile(rules['allegation_re'], re.I); hedge = re.compile(rules['hedge_re'], re.I); onscreen = re.compile(rules['on_screen_hedge_re'])
    for i, ln in enumerate(lines):
        text = ln['text']; b = blocks.get(i)
        if b is None:
            issues.append({'rule': 'R-SHOT-MISSING', 'line': i, 'msg': f'no shot-list entry for line {i}: "{text[:60]}"'}); continue
        if not b.get('SEE') or not b.get('PROP'):
            issues.append({'rule': 'R-SHOT-INCOMPLETE', 'line': i, 'msg': 'entry needs SEE: and PROP:'}); continue
        used_custom = []
        for name, status, cid in PROP_TOKEN.findall(b['PROP']):
            status = status.lower(); base = name.split(':')[0]
            if status in ('custom', 'new'):
                if status == 'new' and not cid: cid = None
                if not cid or cid not in custom:
                    issues.append({'rule': 'R-CUSTOM-MISSING', 'line': i, 'msg': f"PROP '{name}' is a custom prop ('{cid}') but it is not coded in src/props/custom/ yet (render stage must build it)"})
                else:
                    used_custom.append(cid)
                    if custom[cid]['evidence'] and not ev_match(custom[cid]['evidence'], text):
                        issues.append({'rule': 'R-REUSE', 'line': i, 'msg': f"custom prop {cid} is planned but the line never says {custom[cid]['evidence'].split('|')[:5]}"})
                continue
            R = compose.get(base)
            if R and R['role'] == 'generic':
                ev = R.get('evidence')
                if base == 'building':
                    k = name.split(':')[1] if ':' in name else 'office'; ev = R_by_kind(rules, k)
                if ev and not ev_match(ev, text):
                    issues.append({'rule': 'R-REUSE', 'line': i, 'msg': f"PROP '{name}' is lazy reuse: the line never says {ev.split('|')[:5]}. Build a custom prop for what it really names"})
            elif not R and base not in P and base not in {'map', 'timeline', 'chart', 'photos', 'headline', 'document', 'tweet', 'newspaper', 'entity-map', 'entities'}:
                issues.append({'rule': 'R-SHOT-INCOMPLETE', 'line': i, 'msg': f"PROP '{name}' is unknown (not in props.json, reuse-rules.json or templates)"})
        for h in find_hits(text, lex):
            if h.get('custom') and not any(ev_match(custom[c]['evidence'], h['word']) for c in used_custom):
                issues.append({'rule': 'R-NOCUSTOM', 'line': i, 'msg': f"line names '{h['word']}' ({h['custom']}): PROP must include a [CUSTOM epNNN.{h['custom']}] prop that draws it"})
        if allege.search(text):
            if not hedge.search(text):
                issues.append({'rule': 'R-HEDGE-LINE', 'line': i, 'msg': f"allegation word '{allege.search(text).group(0)}' with no hedge in the line (reportedly / according to ...)"})
            if not b.get('SRC') or not onscreen.search(b.get('HEDGE', '')):
                issues.append({'rule': 'R-HEDGE-SCREEN', 'line': i, 'msg': 'allegation line needs SRC: <outlet, date> and HEDGE: ACCORDING TO REPORTS (or UNCONFIRMED/ALLEGED) shown on screen'})
    for n in sorted(set(blocks) - set(range(len(lines)))):
        issues.append({'rule': 'R-SHOT-MISSING', 'line': n, 'msg': f'shot-list entry L{n} has no narration line (script has {len(lines)} lines)'})
    return issues

def prop_demand(analysis, props):
    d = collections.Counter(); P = props['props']
    for a in analysis:
        for b in a['beats']:
            if b['prop']: d[b['prop']] += 1
    return [(p, n, 'custom' if p.startswith('custom:') else P.get(p, {}).get('status', 'unknown')) for p, n in d.most_common()]

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
    for p, n, s in demand: L.append(f'| {p} | {n} | {"**NEEDS BUILD**" if s == "missing" else "**NEEDS CUSTOM PROP**" if s == "custom" else s} |')
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
    ap.add_argument('--narration', required=True); ap.add_argument('--timing'); ap.add_argument('--cues')
    ap.add_argument('--lexicon', default='director/lexicon.json'); ap.add_argument('--props', default='director/props.json')
    ap.add_argument('--rules', default='director/reuse-rules.json', help='anti-reuse rules (generic props need evidence words in the line)')
    ap.add_argument('--custom-dir', default='src/props/custom'); ap.add_argument('--custom-folder', help='folder under --custom-dir (default ep<NNN> from --ep)')
    ap.add_argument('--ep', help='episode number, e.g. 004 (selects src/props/custom/ep004)')
    ap.add_argument('--shotlist', help='shot-list.md to check 1:1 against the narration (works before audio exists)')
    ap.add_argument('--out', default='out/director.json'); ap.add_argument('--md')
    ap.add_argument('--strict', action='store_true', help='exit 1 if any rule is violated')
    ap.add_argument('--allow', default='', help='comma list of rules that are listed but do not fail --strict (stage 1 allows R-CUSTOM-MISSING: the custom props are coded in stage 3)')
    a = ap.parse_args()
    lines = load_lines(a.narration); lex = json.load(open(a.lexicon)); props = json.load(open(a.props)); rules = json.load(open(a.rules))
    timing = json.load(open(a.timing)) if a.timing else []
    folder = a.custom_folder or (f'ep{a.ep}' if a.ep else None)
    custom = load_custom(a.custom_dir, folder) if folder else {}
    if lines and timing and len(lines) != len(timing): print(f'WARN: {len(lines)} narration lines vs {len(timing)} timing lines', file=sys.stderr)
    analysis = analyze(lines, timing, lex, props, custom)
    issues, stats = [], {'scenes': 0, 'seconds': 0, 'by_template': {}, 'title_share': 0, 'textish_share': 0}
    cues = []
    if a.cues:
        cues = json.load(open(a.cues))['cues']
        issues, stats = validate(cues, analysis, rules, custom)
    if a.shotlist:
        issues += check_shotlist(a.shotlist, lines, lex, props, rules, custom)
    demand = prop_demand(analysis, props)
    pathlib.Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    json.dump({'stats': stats, 'issues': issues, 'prop_demand': demand, 'custom_props': {k: {'evidence': v['evidence'], 'describes': v['describes']} for k, v in custom.items()}, 'lines': analysis}, open(a.out, 'w'), indent=1)
    if a.md: write_md(a.md, analysis, issues, stats, demand, cues)
    cnt = collections.Counter(i['rule'] for i in issues)
    print(f"lines {len(lines)} | scenes {stats['scenes']} | violations {len(issues)} {dict(cnt)}")
    if a.cues: print('title share', stats['title_share'], '| text/icon-only share', stats['textish_share'])
    if stats.get('legacy_cues'): print('NOTE: cues have no item list (old exporter): R-REUSE / R-NOCUSTOM were skipped. Use tools/export-ep.ts for new episodes.')
    for i in issues[:40]: print(f"  {i['rule']} line {i.get('line', '-')}: {i['msg']}")
    if len(issues) > 40: print(f'  ... {len(issues) - 40} more in {a.out}')
    miss = [(p, n) for p, n, s in demand if s == 'missing']
    need = sorted({slug for l in analysis for b in l['beats'] for slug, _ in b.get('custom_needed', [])})
    print('props NEEDING BUILD (beats):', miss)
    print('CUSTOM props this script needs (build in src/props/custom/):', need or 'none')
    allowed = {r.strip() for r in a.allow.split(',') if r.strip()}
    if a.strict and any(i['rule'] not in allowed for i in issues): sys.exit(1)

if __name__ == '__main__':
    main()
