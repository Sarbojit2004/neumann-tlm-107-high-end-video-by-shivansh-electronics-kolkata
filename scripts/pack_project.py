#!/usr/bin/env python3
"""Builds the self-contained project zip.

The archive is the safety net: unzip it anywhere, run `npm install` then
`npm run bootstrap && npm run render`, and the 88-second reel reproduces
independently of this repository.

It therefore carries the SOURCE of truth, not the generated intermediates:

  included  the 55 repository images, both logo files (unused by the reel but
            part of the project), the supplied audio, all source, all scripts,
            the vendored fonts, the VO placeholder, the docs, the thumbnail and
            the final render
  excluded  node_modules, public/img, public/ambient, public/audio and
            src/lib/media.json -- every one of which `npm run bootstrap`
            regenerates deterministically

Run:  python3 scripts/pack_project.py
"""
import os
import sys
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "neumann-tlm107-reel-project.zip")

SKIP_DIRS = {
    ".git", "node_modules", "stills", ".remotion",
    os.path.join("public", "img"),
    os.path.join("public", "ambient"),
    os.path.join("public", "audio"),
}
SKIP_FILES = {
    "neumann-tlm107-reel-project.zip",
    os.path.join("src", "lib", "media.json"),
    os.path.join("out", "range-test.mp4"),
}
SKIP_EXT = {".log", ".pyc"}


def included(rel: str) -> bool:
    parts = rel.replace("\\", "/").split("/")
    for i in range(1, len(parts)):
        if "/".join(parts[:i]) in {d.replace("\\", "/") for d in SKIP_DIRS}:
            return False
    if parts[0] in SKIP_DIRS:
        return False
    if rel in SKIP_FILES or rel.replace("\\", "/") in {s.replace("\\", "/") for s in SKIP_FILES}:
        return False
    if os.path.splitext(rel)[1] in SKIP_EXT:
        return False
    if "__pycache__" in parts:
        return False
    return True


def main() -> int:
    n = 0
    total = 0
    if os.path.exists(OUT):
        os.remove(OUT)
    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        for dirpath, dirnames, filenames in os.walk(ROOT):
            rel_dir = os.path.relpath(dirpath, ROOT)
            if rel_dir == ".":
                rel_dir = ""
            dirnames[:] = [
                d for d in dirnames
                if included(os.path.join(rel_dir, d) if rel_dir else d)
            ]
            for fn in filenames:
                rel = os.path.join(rel_dir, fn) if rel_dir else fn
                if not included(rel):
                    continue
                full = os.path.join(dirpath, fn)
                z.write(full, rel)
                n += 1
                total += os.path.getsize(full)

    size = os.path.getsize(OUT)
    print(f"{os.path.basename(OUT)}")
    print(f"  files      : {n}")
    print(f"  raw        : {total / 1024 / 1024:.1f} MB")
    print(f"  compressed : {size / 1024 / 1024:.1f} MB")
    print("\nReproduce with:  npm install && npm run bootstrap && npm run render")
    return 0


if __name__ == "__main__":
    sys.exit(main())
