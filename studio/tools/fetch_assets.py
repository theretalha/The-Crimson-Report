#!/usr/bin/env python3
"""Local asset fetcher: reads an ASSETS-TODO.md and downloads the real, free-licence assets for an episode.

  python3 tools/fetch_assets.py --ep 004 [--todo ASSETS-TODO.md] [--dry-run] [--force]
  python3 tools/fetch_assets.py --selftest          # offline test (mocked network)

Run it on the LOCAL machine (the cloud IP is rate-limited by Wikimedia). Needs only Python 3.9+ (no pip packages).
  * Wikimedia Commons (photos, maps, flags, government seals): MediaWiki API, free licences only (public domain, CC0, CC BY, CC BY-SA, GFDL...).
  * Pexels clips: set PEXELS_API_KEY in YOUR terminal (never paste it in a chat). Footage is optional: no key = clips are skipped and listed.
  * Output: studio/public/assets/epNNN/{photos,flags,maps,footage}/  + manifest.json + CREDITS.md (the credit line for every file).
  * Anything that cannot be fetched gets a clean placeholder AT THE SAME PATH (SVG for .svg, an "ASSET PENDING" card for photos),
    so a render and probe.ts never fail on a missing file. The manifest marks it `placeholder`; the render stage refuses to ship those silently.

ASSETS-TODO.md format (tables whose first cell has the save-as name(s) in backticks, second cell a Commons title or a search):
  ## 1. Photos (Wikimedia Commons) -> `studio/public/photos/`
  | Save as | Wikimedia file title | Licence |
  | `commerce-seal.svg` (-> `studio/public/flags/`) | File:Seal of the United States Department of Commerce.svg | Public domain |
  | `flag-malaysia.svg`, `flag-singapore.svg` | File:Flag of Malaysia.svg / Singapore | Public domain |
  | `commerce-hq.jpg` | search "Herbert C. Hoover Building" | check licence |
  ## 2. Footage (Pexels) -> `studio/public/footage/`
  Search terms: `data center server racks`, `container port aerial`
"""
import argparse, html, json, os, pathlib, re, shutil, sys, time, urllib.error, urllib.parse, urllib.request

HERE = pathlib.Path(__file__).resolve().parent
STUDIO = HERE.parent
UA = 'CrimsonStudioAssetFetcher/1.0 (local script for a video studio; free-licence assets only)'
COMMONS = 'https://commons.wikimedia.org/w/api.php'
FREE = re.compile(r'public domain|\bpd\b|cc0|cc[- ]by|gfdl|free art|no restrictions|attribution|\bcc\b|copyrighted free use|usgov|work of the u', re.I)
NONFREE = re.compile(r'fair use|non-?free|all rights reserved|\bnc\b|\bnd\b|no derivatives|noncommercial', re.I)
RASTER = ('.jpg', '.jpeg', '.png', '.webp', '.gif', '.tif', '.tiff')
SUBDIRS = ('photos', 'flags', 'maps', 'footage', 'images')


# ---------------------------------------------------------------- network (replaced in --selftest)
def http_get(url, headers=None, binary=False, tries=4):
    for k in range(tries):
        req = urllib.request.Request(url, headers={'User-Agent': UA, **(headers or {})})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                data = r.read()
                return data if binary else json.loads(data.decode('utf-8'))
        except urllib.error.HTTPError as e:
            if e.code in (429, 503) and k < tries - 1: time.sleep(2 ** (k + 1)); continue
            raise
        except urllib.error.URLError:
            if k < tries - 1: time.sleep(2 ** k); continue
            raise


def commons_info(title, width=1600):
    q = {'action': 'query', 'format': 'json', 'titles': title, 'prop': 'imageinfo', 'iiprop': 'url|extmetadata|mime|size', 'iiurlwidth': width}
    pages = http_get(COMMONS + '?' + urllib.parse.urlencode(q)).get('query', {}).get('pages', {})
    for p in pages.values():
        ii = (p.get('imageinfo') or [None])[0]
        if ii: return ii
    return None


def commons_search(text, limit=6):
    q = {'action': 'query', 'format': 'json', 'list': 'search', 'srnamespace': 6, 'srsearch': text, 'srlimit': limit}
    return [h['title'] for h in http_get(COMMONS + '?' + urllib.parse.urlencode(q)).get('query', {}).get('search', [])]


# ---------------------------------------------------------------- parsing ASSETS-TODO.md
def parse_todo(text):
    """-> list of tasks {kind: commons|search|pexels, save_as, query, dest, note}"""
    tasks, dest, section, terms_mode = [], 'photos', '', False
    for raw in text.splitlines():
        line = raw.strip()
        m = re.match(r'^#{1,4}\s+(.*)$', line)
        if m:
            section = m.group(1)
            d = re.search(r'->\s*`([^`]+)`', section)
            dest = last_dir(d.group(1)) if d else ('footage' if re.search(r'footage|pexels|clip', section, re.I) else 'photos')
            continue
        if re.match(r'^search terms\s*:', line, re.I) or (terms_mode and line and not re.match(r'^(save|note|\|)', line, re.I) and '`' in line):
            terms_mode = True   # the list may continue on the next lines
            for term in re.findall(r'`([^`]+)`', line):
                tasks.append({'kind': 'pexels', 'save_as': slug(term) + '.mp4', 'query': term, 'dest': 'footage', 'note': section})
            continue
        terms_mode = False
        if not line.startswith('|') or re.match(r'^\|[\s:|-]+\|?$', line): continue
        cells = [c.strip() for c in line.strip('|').split('|')]
        if len(cells) < 2 or re.match(r'save as|save_as|file', cells[0], re.I): continue
        names = re.findall(r'`([^`]+\.[A-Za-z0-9]{2,4})`', cells[0].split('(->')[0])
        if not names: continue
        ov = re.search(r'\(->\s*`([^`]+)`\)', cells[0])
        d = last_dir(ov.group(1)) if ov else dest
        spec = re.sub(r'\s*\((?:resize|check|search|credit)[^)]*\)\s*$', '', cells[1]).strip()
        if re.match(r'^search\b', spec, re.I):
            q = re.sub(r'^search\s*', '', spec, flags=re.I).strip(' "\'')
            tasks += [{'kind': 'search', 'save_as': n, 'query': q, 'dest': d, 'note': cells[-1]} for n in names]
        elif re.search(r'\bFile:', spec):
            titles = expand_titles(spec[spec.index('File:'):], len(names))
            if titles:
                tasks += [{'kind': 'commons', 'save_as': n, 'query': t, 'dest': d, 'note': cells[-1]} for n, t in zip(names, titles)]
            else:
                tasks += [{'kind': 'search', 'save_as': n, 'query': re.sub(r'^File:|\.\w+$', '', spec.split(' / ')[0]), 'dest': d, 'note': 'ambiguous title: searched'} for n in names]
        elif d == 'footage' or re.search(r'pexels', cells[1], re.I):
            tasks += [{'kind': 'pexels', 'save_as': n, 'query': spec, 'dest': 'footage', 'note': cells[-1]} for n in names]
    return tasks


def last_dir(p):
    p = p.strip('/').split('/')[-1]
    return p if p in SUBDIRS else 'photos'


def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')[:48]


def expand_titles(spec, n):
    """'File:Flag of Malaysia.svg / Singapore / Taiwan' -> 3 titles; 'File:X 002 / 011 / 021.png' -> 3 titles; single title -> [title]."""
    parts = [p.strip() for p in spec.split(' / ')]
    if n == 1 and len(parts) == 1: return parts
    if len(parts) != n: return [] if n != 1 else [parts[0]]
    ext = (re.search(r'(\.[A-Za-z0-9]{2,4})\s*$', parts[-1]) or re.search(r'(\.[A-Za-z0-9]{2,4})\s*$', parts[0]))
    ext = ext.group(1) if ext else ''
    base = re.sub(r'\.[A-Za-z0-9]{2,4}\s*$', '', parts[0]); tok = base.split(' ')[-1]
    out = [parts[0] if parts[0].lower().endswith(ext.lower()) else parts[0] + ext]
    for p in parts[1:]:
        out.append(base[:len(base) - len(tok)] + re.sub(r'\.[A-Za-z0-9]{2,4}\s*$', '', p) + ext)
    return out


# ---------------------------------------------------------------- fetching
def strip_html(s):
    return html.unescape(re.sub(r'<[^>]+>', '', s or '')).strip()


def usable(ii):
    meta = ii.get('extmetadata') or {}
    lic = strip_html((meta.get('LicenseShortName') or {}).get('value', ''))
    if NONFREE.search(lic) or not (FREE.search(lic) or lic == ''): return None
    if lic == '' and strip_html((meta.get('Copyrighted') or {}).get('value', '')).lower() == 'true': return None
    artist = strip_html((meta.get('Artist') or {}).get('value', '')) or 'Wikimedia Commons'
    return {'license': lic or 'public domain (no licence string)', 'credit': f"{artist} · {lic or 'PD'} · Wikimedia Commons"}


def fetch_commons(title, save_path):
    ii = commons_info(title)
    if not ii: return None, 'not found on Commons'
    lic = usable(ii)
    if not lic: return None, 'licence is not free'
    ext = save_path.suffix.lower()
    url = ii['url'] if (ext == '.svg' or ii.get('mime') == 'image/svg+xml' or ii.get('width', 0) <= 1600) else (ii.get('thumburl') or ii['url'])
    data = http_get(url, binary=True)
    save_path.write_bytes(data)
    return {**lic, 'url': ii.get('descriptionurl') or url, 'title': title}, None


def fetch_pexels(query, save_path, key):
    q = urllib.parse.urlencode({'query': query, 'per_page': 8, 'orientation': 'landscape', 'size': 'medium'})
    vids = http_get('https://api.pexels.com/videos/search?' + q, headers={'Authorization': key}).get('videos', [])
    for v in sorted(vids, key=lambda v: abs((v.get('duration') or 10) - 8)):
        files = [f for f in v.get('video_files', []) if f.get('file_type') == 'video/mp4' and (f.get('width') or 0) >= 1280]
        if not files: continue
        f = min(files, key=lambda f: abs((f.get('width') or 1920) - 1920))
        save_path.write_bytes(http_get(f['link'], binary=True))
        return {'license': 'Pexels License (free, commercial use)', 'credit': f"Pexels · {v.get('user', {}).get('name', '')}", 'url': v.get('url'), 'title': query}, None
    return None, 'no suitable clip'


def placeholder(save_path, label):
    ext = save_path.suffix.lower()
    if ext == '.svg':
        txt = html.escape(label)[:46]
        save_path.write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="320" height="180"><rect width="320" height="180" fill="#18181b"/>'
                             '<rect x="8" y="8" width="304" height="164" fill="none" stroke="#C4151C" stroke-width="3"/>'
                             f'<text x="160" y="86" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#F4F1EA">ASSET PENDING</text>'
                             f'<text x="160" y="110" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#8F8A80">{txt}</text></svg>', encoding='utf-8')
        return True
    if ext in RASTER:
        shutil.copyfile(HERE / 'assets' / 'placeholder.jpg', save_path); return True
    return False   # video: no placeholder; the director uses a drawn prop instead


def run(a):
    todo = pathlib.Path(a.todo)
    tasks = parse_todo(todo.read_text(encoding='utf-8'))
    out_root = STUDIO / 'public' / 'assets' / f'ep{a.ep}'
    man_path = out_root / 'manifest.json'
    manifest = {m['save_as'] + '|' + m['dest']: m for m in (json.loads(man_path.read_text()) if man_path.exists() else [])}
    key = os.environ.get('PEXELS_API_KEY')
    print(f'{len(tasks)} assets in {todo.name} -> {out_root}')
    for t in tasks:
        mk = t['save_as'] + '|' + t['dest']
        path = out_root / t['dest'] / t['save_as']
        old = manifest.get(mk)
        if old and old['status'] == 'ok' and path.exists() and not a.force:
            print(f"  ok       {t['dest']}/{t['save_as']} (already fetched)"); continue
        if a.dry_run:
            print(f"  would    {t['kind']:7} {t['dest']}/{t['save_as']}  <- {t['query']}"); continue
        path.parent.mkdir(parents=True, exist_ok=True)
        rec, err = None, None
        try:
            if t['kind'] == 'commons': rec, err = fetch_commons(t['query'], path)
            elif t['kind'] == 'search':
                err = 'no free result'
                for title in commons_search(t['query']):
                    if not title.lower().endswith(RASTER + ('.svg',)): continue
                    rec, e = fetch_commons(title, path)
                    if rec: err = None; break
                    time.sleep(0.4)
            elif t['kind'] == 'pexels':
                if not key: err = 'PEXELS_API_KEY not set (footage is optional)'
                else: rec, err = fetch_pexels(t['query'], path, key)
        except Exception as e:   # network, rate limit, bad json: never crash the whole run
            err = f'{type(e).__name__}: {e}'
        if rec:
            manifest[mk] = {'save_as': t['save_as'], 'dest': t['dest'], 'status': 'ok', **rec}
            print(f"  fetched  {t['dest']}/{t['save_as']}  ({rec['license']})")
        else:
            made = placeholder(path, t['save_as'])
            manifest[mk] = {'save_as': t['save_as'], 'dest': t['dest'], 'status': 'placeholder' if made else 'missing', 'reason': err, 'wanted': t['query']}
            print(f"  {'PLACEHOLDER' if made else 'MISSING    '} {t['dest']}/{t['save_as']}  ({err})")
        time.sleep(0.6)   # be polite to Wikimedia
    if a.dry_run: return 0
    out_root.mkdir(parents=True, exist_ok=True)
    recs = list(manifest.values())
    man_path.write_text(json.dumps(recs, indent=1, ensure_ascii=False), encoding='utf-8')
    L = [f'# EP {a.ep} asset credits (generated by tools/fetch_assets.py)', '', 'Put these credit lines in the video description and in the on-screen source line.', '']
    for m in recs:
        if m['status'] == 'ok': L.append(f"- `{m['dest']}/{m['save_as']}`: {m['credit']} · {m.get('url', '')}")
    pend = [m for m in recs if m['status'] != 'ok']
    if pend:
        L += ['', '## NOT FETCHED (placeholders in the render until fixed)', '']
        L += [f"- `{m['dest']}/{m['save_as']}` [{m['status']}] wanted: {m.get('wanted')} · reason: {m.get('reason')}" for m in pend]
    (out_root / 'CREDITS.md').write_text('\n'.join(L) + '\n', encoding='utf-8')
    ok = sum(m['status'] == 'ok' for m in recs)
    print(f'\n{ok} fetched, {len(pend)} not fetched. See {out_root}/CREDITS.md')
    return 0


# ---------------------------------------------------------------- selftest (no network)
def selftest():
    global http_get, STUDIO
    import tempfile
    todo = (STUDIO / 'ASSETS-TODO.md').read_text(encoding='utf-8')
    tasks = parse_todo(todo)
    by = {t['save_as']: t for t in tasks}
    assert by['commerce-seal.svg']['dest'] == 'flags' and by['commerce-seal.svg']['kind'] == 'commons', by.get('commerce-seal.svg')
    assert by['flag-singapore.svg']['query'] == 'File:Flag of Singapore.svg', by['flag-singapore.svg']
    assert by['flag-taiwan.svg']['dest'] == 'flags'
    assert by['h100-011.jpg']['query'].endswith('011.png') and by['h100-011.jpg']['dest'] == 'photos', by['h100-011.jpg']
    assert by['commerce-hq.jpg']['kind'] == 'search' and 'Hoover' in by['commerce-hq.jpg']['query']
    assert by['white-house.jpg']['query'] == 'File:North Façade White House.JPG'
    assert any(t['kind'] == 'pexels' and t['save_as'] == 'data-center-server-racks-corridor.mp4' for t in tasks), [t['save_as'] for t in tasks if t['kind'] == 'pexels']
    assert expand_titles('File:Flag of Malaysia.svg / Singapore / Taiwan', 3)[2] == 'File:Flag of Taiwan.svg'
    # mocked network: one free file, one non-free, one missing
    meta = lambda lic: {'url': 'https://x/f.svg', 'mime': 'image/svg+xml', 'width': 10, 'descriptionurl': 'https://c/File', 'extmetadata': {'LicenseShortName': {'value': lic}, 'Artist': {'value': '<a>Jane</a>'}}}
    def fake(url, headers=None, binary=False, tries=4):
        if binary: return b'<svg xmlns="http://www.w3.org/2000/svg"/>'
        q = urllib.parse.parse_qs(urllib.parse.urlparse(url).query)
        t = (q.get('titles') or [''])[0]
        pages = {'1': {'imageinfo': [meta('Public domain')]}} if 'Commerce' in t else {'1': {'imageinfo': [meta('Fair use')]}} if 'Malaysia' in t else {'-1': {}}
        return {'query': {'pages': pages, 'search': []}}
    http_get = fake
    tmp = pathlib.Path(tempfile.mkdtemp()); small = tmp / 'todo.md'
    small.write_text("## 1. Photos -> `studio/public/photos/`\n| Save as | t | l |\n|---|---|---|\n| `commerce-seal.svg` (-> `studio/public/flags/`) | File:Seal of the United States Department of Commerce.svg | pd |\n| `flag-malaysia.svg` | File:Flag of Malaysia.svg | pd |\n| `ghost.jpg` | File:Nope.jpg | ? |\n", encoding='utf-8')
    real = STUDIO; STUDIO = tmp
    try:
        class A: ep = '999'; todo = str(small); dry_run = False; force = False
        run(A)
        man = {m['save_as']: m for m in json.loads((tmp / 'public/assets/ep999/manifest.json').read_text())}
        assert man['commerce-seal.svg']['status'] == 'ok' and 'Jane' in man['commerce-seal.svg']['credit'], man
        assert man['flag-malaysia.svg']['status'] == 'placeholder' and 'not free' in man['flag-malaysia.svg']['reason'], man
        assert (tmp / 'public/assets/ep999/photos/flag-malaysia.svg').read_text().startswith('<svg')
        g = tmp / 'public/assets/ep999/photos/ghost.jpg'
        assert man['ghost.jpg']['status'] == 'placeholder' and g.stat().st_size > 1000   # real JPEG card, not an empty file
        assert 'NOT FETCHED' in (tmp / 'public/assets/ep999/CREDITS.md').read_text()
    finally:
        STUDIO = real
    print('fetch_assets selftest: OK')


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--ep', help='episode number, e.g. 004'); ap.add_argument('--todo', default=str(STUDIO / 'ASSETS-TODO.md'))
    ap.add_argument('--dry-run', action='store_true'); ap.add_argument('--force', action='store_true', help='re-download files already fetched')
    ap.add_argument('--selftest', action='store_true')
    a = ap.parse_args()
    if a.selftest: selftest(); sys.exit(0)
    if not a.ep or not re.fullmatch(r'\d{3}', a.ep): ap.error('--ep NNN is required (three digits, e.g. 004)')
    sys.exit(run(a))
