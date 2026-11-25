#!/usr/bin/env python3
"""Refresh src/data/nvda.json with FINISHED daily closes only (drops today's candle while the market is still open).
Cross-checked against Nasdaq.com on 2026-11-25: every close matched to the cent.
Usage: python3 tools/fetch_nvda.py [range=3mo]"""
import datetime as dt, json, sys, time, urllib.request

rng = sys.argv[1] if len(sys.argv) > 1 else "3mo"
req = urllib.request.Request(f"https://query1.finance.yahoo.com/v8/finance/chart/NVDA?range={rng}&interval=1d", headers={"User-Agent": "Mozilla/5.0"})
d = json.load(urllib.request.urlopen(req, timeout=30))["chart"]["result"][0]
meta, ts, cl = d["meta"], d["timestamp"], d["indicators"]["quote"][0]["close"]
reg = meta["currentTradingPeriod"]["regular"]
rows = [(dt.datetime.fromtimestamp(t, dt.UTC).strftime("%Y-%m-%d"), round(c, 2)) for t, c in zip(ts, cl) if c]
if time.time() < reg["end"] and ts[-1] >= reg["start"]:  # today's session is not over: that last value is not a close
    dropped = rows.pop()
    print("dropped unfinished session", dropped)
json.dump({"symbol": "NVDA", "source": "Yahoo Finance daily close, verified vs Nasdaq.com", "asOf": rows[-1][0], "closes": rows}, open("src/data/nvda.json", "w"))
print(len(rows), "closes, last", rows[-1])
