#!/usr/bin/env python3
"""Self-test for the anti-reuse rules in director.py (no Remotion, no audio needed). Run from studio/:  python3 tools/test_director_rules.py"""
import os as _os, sys as _sys
if _os.name == 'nt' and not _sys.flags.utf8_mode and __name__ == '__main__':   # Windows: default encoding is cp1252, our files are UTF-8
    _sys.exit(__import__('subprocess').call([_sys.executable, '-X', 'utf8', *_sys.argv]))
import importlib.util, json, pathlib, sys, tempfile, collections

ROOT = pathlib.Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('director', ROOT / 'tools' / 'director.py'); D = importlib.util.module_from_spec(spec); spec.loader.exec_module(D)

lex = json.load(open(ROOT / 'director/lexicon.json')); props = json.load(open(ROOT / 'director/props.json')); rules = json.load(open(ROOT / 'director/reuse-rules.json'))
custom = D.load_custom(str(ROOT / 'src/props/custom'), '_example')
assert 'example.tanker' in custom, custom.keys()

NARR = """[CHAPTER 0 - TEST]
Three destroyers entered the strait at dawn.
A tanker sat anchored near the shore, engines off.
Inside the Commerce office, an inspector opened a box.
Reportedly, the captain sold the cargo to a Chinese firm.
He was a spy.
"""
tmp = pathlib.Path(tempfile.mkdtemp())
(tmp / 'n.txt').write_text(NARR, encoding='utf-8')
lines = D.load_lines(str(tmp / 'n.txt')); assert len(lines) == 5
analysis = D.analyze(lines, [], lex, props, custom)

# the lexicon must see the physical things no built-in prop can draw
need = {slug for l in analysis for b in l['beats'] for slug, _ in b['custom_needed']}
assert {'warship', 'strait-map', 'oil-tanker'} <= need, need

T = custom['example.tanker']; CU = {'id': 'example.tanker', 'evidence': T['evidence'], 'describes': T['describes']}
def cue(i, line, items, caption='x'):
    return {'i': i, 'start': i * 4.0, 'dur': 4.0, 'template': 'recipe', 'line': line, 'caption': caption, 'items': items, 'firstReveal': 0.2}
cues = [
    cue(0, 0, [{'p': 'crates'}]),                                              # lazy reuse: crates on a destroyer line
    cue(1, 1, [{'p': 'example.tanker', 'custom': CU}]),                        # correct: tanker line, tanker prop
    cue(2, 2, [{'p': 'building', 'kind': 'commerce'}, {'p': 'crates'}, {'p': 'stamp'}]),  # all justified (commerce, box); stamp is neutral
    cue(3, 3, [{'p': 'example.tanker', 'custom': CU}]),                        # custom prop on a line that never says tanker
]
issues, stats = D.validate(cues, analysis, rules, custom)
by = collections.Counter(i['rule'] for i in issues)
rr = [i for i in issues if i['rule'] == 'R-REUSE']
assert any(i['line'] == 0 and "'crates'" in i['msg'] for i in rr), rr
assert any(i['line'] == 3 and 'custom prop' in i['msg'] for i in rr), rr
assert not any(i['line'] in (1, 2) for i in rr), rr                           # no false alarms on the correct scenes
assert any(i['rule'] == 'R-NOCUSTOM' and i['line'] == 0 for i in issues), by  # destroyers/strait have no custom prop
assert not any(i['rule'] == 'R-NOCUSTOM' and i['line'] == 1 for i in issues), by
assert not any(i['rule'] == 'R-CUSTOM-QUALITY' for i in issues), [i for i in issues if i['rule'] == 'R-CUSTOM-QUALITY']

# legacy cues without items must not crash and are reported as skipped
_, st2 = D.validate([{k: v for k, v in c.items() if k != 'items'} for c in cues], analysis, rules, custom); assert st2.get('legacy_cues')

# shot list
SL = """### L0 · 0.0 s
SEE: three warships steam in line across a strait
PROP: crates [built]
### L1 · 4.0 s
SEE: tanker at anchor
PROP: oil-tanker [CUSTOM example.tanker]
### L2 · 8.0 s
SEE: inspector at the office door opens a box
PROP: building:commerce [built], crates [built], person [built]
### L4 · 16.0 s
SEE: a man
PROP: person [built]
"""
(tmp / 's.md').write_text(SL, encoding='utf-8')
sl = D.check_shotlist(str(tmp / 's.md'), lines, lex, props, rules, custom)
sb = collections.Counter(i['rule'] for i in sl)
assert any(i['rule'] == 'R-REUSE' and i['line'] == 0 for i in sl), sl            # crates planned for a destroyer line
assert any(i['rule'] == 'R-NOCUSTOM' and i['line'] == 0 for i in sl), sl
assert any(i['rule'] == 'R-SHOT-MISSING' and i['line'] == 3 for i in sl), sl     # line 3 has no entry
assert any(i['rule'] == 'R-HEDGE-LINE' and i['line'] == 4 for i in sl), sl        # 'spy' with no hedge in the line
assert any(i['rule'] == 'R-HEDGE-SCREEN' and i['line'] == 4 for i in sl), sl
assert not any(i['line'] in (1, 2) for i in sl), [i for i in sl if i['line'] in (1, 2)]

# a [NEW] custom prop that is not coded yet blocks the render stage
(tmp / 's2.md').write_text("### L1\nSEE: tanker\nPROP: oil-tanker [CUSTOM ep999.oil-tanker]\n", encoding='utf-8')
sl2 = D.check_shotlist(str(tmp / 's2.md'), lines[:2], lex, props, rules, custom)
assert any(i['rule'] == 'R-CUSTOM-MISSING' for i in sl2), sl2

print('director anti-reuse self-test: OK', dict(by), dict(sb))
