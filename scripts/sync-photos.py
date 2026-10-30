#!/usr/bin/env python3
"""Sync a public Google Photos shared album into /photos/ + photos/photos.json.

Usage:  python3 scripts/sync-photos.py <album-url> [<album-url> ...] [--prune]

- Scrapes the shared-album page (no API key) for lh3.googleusercontent.com base URLs.
- Videos are skipped except for their poster frame (Google serves a still for =w).
- Applies EXIF orientation, resizes to max 1280px on the long side, saves JPEG q~78
  (steps quality down until < 250 KB), and writes NO EXIF/GPS/metadata at all.
- Re-running is incremental: files are named by a hash of the Google media key, so
  existing photos are kept and new ones are added. --prune removes photos that are
  no longer in any of the given albums.
Requires: python3, Pillow, curl-free (uses urllib).
"""
import hashlib, io, json, os, re, sys, urllib.request
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'photos')
MAN = os.path.join(OUT, 'photos.json')
MAX, Q, LIMIT = 1280, 78, 250 * 1024
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'

def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()

ITEM = re.compile(r'\["(AF1Qip[A-Za-z0-9_-]+)",\["(https://lh3\.googleusercontent\.com/pw/[A-Za-z0-9_-]+)",(\d+),(\d+),')
TS = re.compile(r'\]+,(\d{13}),"')

def scrape(album):
    html = get(album).decode('utf-8', 'replace')
    items, seen = [], set()
    for m in ITEM.finditer(html):
        key, base, w, h = m.group(1), m.group(2), int(m.group(3)), int(m.group(4))
        t = TS.search(html, m.end(), m.end() + 400)
        ts = int(t.group(1)) if t else 0
        if key in seen:
            continue
        seen.add(key)
        tail = html[m.end():m.end() + 1200]
        tail = tail[:tail.find(']],') + 1] if ']],' in tail else tail
        video = '76647426' in tail  # Google's video-metadata marker
        items.append(dict(key=key, base=base, w=w, h=h, t=ts, video=video))
    if not items:
        sys.exit('No photos found on %s (page layout may have changed, or album is not public).' % album)
    return items

def process(raw):
    im = Image.open(io.BytesIO(raw))
    im = ImageOps.exif_transpose(im)
    if im.mode != 'RGB':
        im = im.convert('RGB')
    im.thumbnail((MAX, MAX), Image.LANCZOS)
    clean = Image.new('RGB', im.size)  # fresh image = no EXIF/ICC/XMP carried over
    clean.paste(im)
    q = Q
    while True:
        buf = io.BytesIO()
        clean.save(buf, 'JPEG', quality=q, optimize=True, progressive=True)
        if buf.tell() <= LIMIT or q <= 55:
            return buf.getvalue(), clean.size
        q -= 5

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    prune = '--prune' in sys.argv
    if not args:
        sys.exit(__doc__)
    os.makedirs(OUT, exist_ok=True)
    try:
        man = {p['id']: p for p in json.load(open(MAN))['photos']}
    except Exception:
        man = {}
    live = set()
    for album in args:
        items = scrape(album)
        print('%s: %d items (%d videos -> poster only)' % (album, len(items), sum(i['video'] for i in items)))
        for it in items:
            pid = hashlib.sha1(it['key'].encode()).hexdigest()[:12]
            live.add(pid)
            fn = pid + '.jpg'
            path = os.path.join(OUT, fn)
            if pid in man and os.path.exists(path):
                continue
            # request a bit larger than final so the resize is clean; Google returns an oriented JPEG
            data, (w, h) = process(get(it['base'] + '=w2048-h2048'))
            open(path, 'wb').write(data)
            man[pid] = dict(id=pid, src='photos/' + fn, w=w, h=h, t=it['t'], video=it['video'])
            print('  + %s %dx%d %d KB%s' % (fn, w, h, len(data) // 1024, ' (video poster)' if it['video'] else ''))
    if prune:
        for pid in list(man):
            if pid not in live:
                f = os.path.join(ROOT, man.pop(pid)['src'])
                if os.path.exists(f):
                    os.remove(f)
                print('  - pruned', pid)
    photos = sorted(man.values(), key=lambda p: p['t'])
    json.dump({'count': len(photos), 'photos': photos}, open(MAN, 'w'), indent=1)
    print('photos.json: %d photos' % len(photos))

if __name__ == '__main__':
    main()
