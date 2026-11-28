#!/usr/bin/env bash
# Offline self-tests for the studio tooling (no render, no network). Run from studio/:  bash tools/test_all.sh
set -e
python3 tools/test_director_rules.py
python3 tools/fetch_assets.py --selftest
python3 tools/script_lint.py tools/fixtures/lint_good
if python3 tools/script_lint.py tools/fixtures/lint_bad >/dev/null; then echo "lint_bad should FAIL"; exit 1; else echo "script_lint rejects the bad fixture: OK"; fi
npx tsc --noEmit -p .
echo "ALL SELF-TESTS PASSED"
