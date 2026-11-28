#!/usr/bin/env python3
"""Cross-platform offline self-tests (Windows, macOS, Linux). Run from studio/:  python tools/test_all.py
Same as tools/test_all.sh, plus the EP 000 pipeline self-test (--pipeline: needs Node deps and a browser; ~2 min)."""
import os, subprocess, sys
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
env = dict(os.environ, PYTHONUTF8='1'); PY = sys.executable; NPX = 'npx.cmd' if os.name == 'nt' else 'npx'
def run(*cmd, expect=0):
    print('$', ' '.join(cmd), flush=True)
    r = subprocess.run(cmd, env=env)
    if (r.returncode == 0) != (expect == 0): sys.exit(f'FAILED (exit {r.returncode}): {" ".join(cmd)}')
run(PY, 'tools/test_director_rules.py')
run(PY, 'tools/fetch_assets.py', '--selftest')
run(PY, 'tools/script_lint.py', 'tools/fixtures/lint_good')
run(PY, 'tools/script_lint.py', 'tools/fixtures/lint_bad', expect=1)
run(NPX, 'tsc', '--noEmit', '-p', '.')
if '--pipeline' in sys.argv:
    run(PY, 'tools/stage.py', 'stills', '000')   # EP 000 fixture: gates + keyframe stills, then STOP
    print('stills in out/ep000/stills (see INDEX.md)')
print('ALL SELF-TESTS PASSED')
