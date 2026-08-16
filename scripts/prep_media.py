#!/usr/bin/env python3
"""Prepares every repository image for the reel.

The repo holds 55 images (the brief says 57 -- see ASSET_LEDGER.md). Opening
and inspecting each one shows it is not 55 TLM 107 photos but a mixed Neumann
catalogue set, so they are prepared in two very different ways:

TIER A (31) -- genuine TLM 107 / EA 4 Studio Set material. Prepared as real
    product content: background-keyed to transparency where the source has a
    uniform light backdrop, so the product floats directly on the reel's paper
    ground with no visible photo edge; upscaled with Lanczos where the source
    allows. Written to public/img/.

TIER B (5) + TIER C (19) -- images that cannot be shown as identified product
    content without breaking the reel's own rules: five contain a wooden
    presentation box (the Studio Set has no wooden box -- brief Section 4
    marks it UNVERIFIED and it must never be shown), and nineteen are simply
    not a TLM 107 (TLM 103, U 87, M 149, U 67, NDH headphones, KH monitors,
    MCM clip mic, MA 1). Showing those would manufacture the false ecosystem /
    catalogue comparison the brief explicitly rejects.

    They are therefore reduced to AMBIENT TEXTURE PLATES: any wooden-box region
    is cropped away first, then the frame is heavily defocused, desaturated and
    tinted to the paper palette until no product is identifiable. These are
    only ever composited into the non-critical top (0-250px) and bottom
    (1580-1920px) safe-zone bands. Written to public/ambient/.

Run:  python3 scripts/prep_media.py
"""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageFilter, ImageEnhance
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG_OUT = os.path.join(ROOT, "public", "img")
AMB_OUT = os.path.join(ROOT, "public", "ambient")
for d in (IMG_OUT, AMB_OUT):
    os.makedirs(d, exist_ok=True)

# Reel paper ground -- keep in sync with src/lib/theme.ts C.paper
PAPER = (241, 244, 248)

# ---------------------------------------------------------------------------
# THE LEDGER. Every one of the 55 files, classified by inspection.
#   slug         -> stable name used by src/lib/images.ts
#   tier         -> 'A' product content | 'B' wooden box | 'C' not a TLM 107
#   key          -> attempt light-background keying to transparency
#   crop         -> (l, t, r, b) fractional pre-crop, applied before anything
#   note         -> what the image actually shows
# ---------------------------------------------------------------------------
L = [
    # ---- TIER A : TLM 107 / EA 4 Studio Set -------------------------------
    ("00b283988aadf5be2c1cb31919d1b80c.jpg", "ea4-black",        "A", True,  None, "EA 4 bk shockmount alone"),
    ("1008b9dd90dd07439c6f2be5eccbad97.jpg", "ea4-nickel",       "A", True,  None, "EA 4 nickel shockmount alone"),
    ("1e26fff23b3ee3cbf204a7abf6ca6f9b.jpg", "studio-sepia",     "A", False, None, "sepia studio context, mics on stands"),
    ("2518c9e88e2cc5eeb29585277472f010.jpg", "nickel-stand",     "A", True,  None, "nickel TLM 107 in EA 4 on stand"),
    ("2d32ea0fb60e3f053fd48e5738d08be5.jpg", "nickel-front",     "A", True,  None, "nickel TLM 107 front -- FINISH SPLIT pair"),
    ("341e0e7b583e3f30b11ed0d2e9acca9a.jpg", "macro-grille",     "A", True,  None, "MACRO nickel headgrille + Neumann badge"),
    ("3a0c40981d3f3bbb170bf0681da01f4a.jpg", "black-dark",       "A", False, None, "black TLM 107 in mount, dark plate"),
    ("4e364760ab308f5df484a0e760f17c48.jpg", "nav-labelled",     "A", False, None, "rear nav switch, factory callout labels"),
    ("612422292819227d896edac5df6275ed.jpg", "ea4-exploded",     "A", True,  None, "EA 4 nickel + thread adapters"),
    ("61b723914db7e35bad5b1561489e7331.jpg", "black-front",      "A", True,  None, "black TLM 107 front -- FINISH SPLIT pair"),
    ("7ae5839f3cd12c1c9c46f9edeb237174.jpg", "nickel-swivel",    "A", True,  None, "nickel TLM 107 on SG 2 swivel, side"),
    ("8d0d8b89c4bd4eb0c14b4f763c1ea185.jpg", "nickel-patchbay",  "A", False, None, "nickel TLM 107 against patchbay"),
    ("NEUMANN TLM 107 IMAGE-1 (1).png",      "black-ea4-a",      "A", True,  None, "black TLM 107 in EA 4 bk on stand"),
    ("NEUMANN TLM 107 IMAGE-1 (10).jpg",     "rear-nickel",      "A", True,  None, "REAR INTERFACE nickel -- pad/filter/pattern"),
    ("NEUMANN TLM 107 IMAGE-1 (19).jpg",     "rear-black",       "A", True,  None, "REAR INTERFACE black -- omni lit"),
    ("NEUMANN TLM 107 IMAGE-1 (2).jpg",      "nickel-tall",      "A", True,  None, "nickel TLM 107 front, tall crop"),
    ("NEUMANN TLM 107 IMAGE-1 (2).png",      "polar-diagram",    "A", False, None, "polar frequency-response plot"),
    ("NEUMANN TLM 107 IMAGE-1 (22).jpg",     "macro-badge-blk",  "A", True,  None, "MACRO black body + badge"),
    ("NEUMANN TLM 107 IMAGE-1 (23).jpg",     "macro-badge-ang",  "A", False, None, "MACRO black body + badge, angled"),
    ("NEUMANN TLM 107 IMAGE-1 (24).jpg",     "rear-black-ang",   "A", True,  None, "REAR INTERFACE black, angled"),
    ("NEUMANN TLM 107 IMAGE-1 (31).png",     "black-ea4-b",      "A", True,  None, "black TLM 107 in EA 4 bk, stand"),
    ("NEUMANN TLM 107 IMAGE-1 (4).jpg",      "macro-badge-lo",   "A", True,  None, "MACRO black badge (low-res twin of macro-badge-blk)"),
    ("NEUMANN TLM 107 IMAGE-1 (5).jpg",      "macro-badge-lo2",  "A", False, None, "MACRO black badge angled (low-res twin)"),
    ("NEUMANN TLM 107 IMAGE-1 (6).jpg",      "rear-black-lo",    "A", True,  None, "REAR INTERFACE black (low-res twin)"),
    ("NEUMANN TLM 107 IMAGE-1 (14).jpg",     "mesh-abstract",    "A", False, None, "abstract mesh texture macro"),
    ("NEUMANN TLM 107 IMAGE-1.jpg",          "black-tall",       "A", True,  None, "black TLM 107 front, tall crop"),
    ("a3dd24a959546ae37f72d0c908a1cd09.jpg", "macro-xlr",        "A", True,  None, "MACRO nickel body, XLR + badge"),
    ("e66d46f7393c33cb08afc98a06fa358f.jpg", "nickel-angled",    "A", True,  None, "nickel TLM 107 on stand, angled"),
    ("image_5szcJVlpZ.jpg",                  "room-real",        "A", False, None, "real room, black TLM 107 in use"),
    ("image_5vbhB2Q.jpg",                    "rear-black-sm",    "A", True,  None, "REAR INTERFACE black, small"),
    ("image_6tzICIiDZ.jpg",                  "black-ea4-sm",     "A", True,  None, "black TLM 107 in EA 4 bk, small"),

    # ---- TIER B : wooden box present -> crop box away, then ambient -------
    # crop keeps only the microphone third of the frame; the box and the
    # separate Neumann diamond graphic are removed before any use.
    ("1d1485b8b4deb0946d3c5b6fe2596167.jpg", "amb-b1", "B", False, (0.00, 0.00, 0.26, 1.00), "mic + WOODEN BOX + logo -> mic only"),
    ("NEUMANN TLM 107 IMAGE-1 (12).jpg",     "amb-b2", "B", False, (0.00, 0.00, 1.00, 0.34), "WOODEN BOX open -> lid strip only"),
    ("bdd213873e23660d8aac9d7f36b5430c.jpg", "amb-b3", "B", False, (0.30, 0.00, 0.78, 0.42), "WOODEN BOX + mic -> mic region only"),
    ("c83d63e9753ba6cef6686ee4bacd3f26.jpg", "amb-b4", "B", False, (0.00, 0.00, 1.00, 0.22), "CLOSED WOODEN BOX, no mic -> grain wash"),
    ("image_4p3AAAABZ.jpg",                  "amb-b5", "B", False, (0.22, 0.00, 0.62, 0.70), "WOODEN BOX + mic -> mic region only"),

    # ---- TIER C : not a TLM 107 -> ambient texture only -------------------
    ("67aed9abac0f6c330c04b3dc775bd988.jpg", "amb-c01", "C", False, None, "U 87 Ai black"),
    ("8299ad54bcf6fe9de88267d1cdd7ea28.jpg", "amb-c02", "C", False, None, "TLM 102/103 macro, XLR base"),
    ("8996d3000b18ffc8d358db19cc42e892.jpg", "amb-c03", "C", False, None, "pale mic in nickel mount, unidentified"),
    ("9493dccf8113453552622360f6c04135.jpg", "amb-c04", "C", False, None, "TLM 103 on fabric"),
    ("NEUMANN TLM 107 IMAGE-1 (17).png",     "amb-c05", "C", False, None, "U 87 Ai nickel"),
    ("NEUMANN TLM 107 IMAGE-1 (21).png",     "amb-c06", "C", False, None, "M 149 nickel"),
    ("NEUMANN TLM 107 IMAGE-1 (26).png",     "amb-c07", "C", False, None, "U 67 + power supply"),
    ("NEUMANN TLM 107 IMAGE-1 (29).png",     "amb-c08", "C", False, None, "NDH headphones"),
    ("NEUMANN TLM 107 IMAGE-1 (30).png",     "amb-c09", "C", False, None, "MA 1 alignment kit"),
    ("NEUMANN TLM 107 IMAGE-1 (33).png",     "amb-c10", "C", False, None, "M 149 nickel, alt"),
    ("NEUMANN TLM 107 IMAGE-1 (34).png",     "amb-c11", "C", False, None, "MCM clip mic system"),
    ("NEUMANN TLM 107 IMAGE-1 (35).png",     "amb-c12", "C", False, None, "KH monitor speaker"),
    ("NEUMANN TLM 107 IMAGE-1 (36).png",     "amb-c13", "C", False, None, "KH monitor speaker, alt"),
    ("NEUMANN TLM 107 IMAGE-1 (37).png",     "amb-c14", "C", False, None, "NDH headphones, alt"),
    ("NEUMANN TLM 107 IMAGE-1 (39).png",     "amb-c15", "C", False, None, "KH subwoofer"),
    ("NEUMANN TLM 107 IMAGE-1 (4).png",      "amb-c16", "C", False, None, "KH monitor speaker, alt 2"),
    ("NEUMANN TLM 107 IMAGE-1 (9).jpg",      "amb-c17", "C", False, None, "miniature hanging mic"),
    ("c9cf8966e9e0a7d1e662aa2af8a775bd.jpg", "amb-c18", "C", False, None, "TLM 103 (body-labelled)"),
    ("ec666c0acbe1505260317821cea77c52.jpg", "amb-c19", "C", False, None, "cream elastic shockmount, non-EA 4"),
]


def load(path):
    im = Image.open(path)
    if im.mode == "RGBA":
        bg = Image.new("RGB", im.size, (255, 255, 255))
        bg.paste(im, mask=im.split()[3])
        return bg
    return im.convert("RGB")


def apply_crop(im, crop):
    if not crop:
        return im
    l, t, r, b = crop
    w, h = im.size
    return im.crop((int(l * w), int(t * h), int(r * w), int(b * h)))


def key_background(im, thresh=232, sat_max=26, feather=1.4):
    """Key a uniform light backdrop to alpha.

    A pixel is a background candidate if it is bright and near-neutral. Only
    candidate regions CONNECTED TO THE BORDER become transparent, so a bright
    neutral highlight inside the microphone body is never punched out.
    Returns None when the source has no such backdrop.
    """
    a = np.asarray(im).astype(np.int16)
    mx = a.max(axis=2)
    mn = a.min(axis=2)
    cand = (mx > thresh) & ((mx - mn) < sat_max)

    # need a genuinely light border to be worth keying
    border = np.concatenate([cand[0, :], cand[-1, :], cand[:, 0], cand[:, -1]])
    if border.mean() < 0.72:
        return None

    lab, n = ndimage.label(cand)
    if n == 0:
        return None
    edge_labels = set(lab[0, :]) | set(lab[-1, :]) | set(lab[:, 0]) | set(lab[:, -1])
    edge_labels.discard(0)
    if not edge_labels:
        return None

    bgmask = np.isin(lab, list(edge_labels))
    if bgmask.mean() > 0.94:      # essentially nothing left -- bad key
        return None

    alpha = np.where(bgmask, 0, 255).astype(np.uint8)
    al = Image.fromarray(alpha, "L").filter(ImageFilter.GaussianBlur(feather))
    out = im.convert("RGBA")
    out.putalpha(al)
    return out


def upscale(im, target_long=1500):
    w, h = im.size
    lo = max(w, h)
    if lo >= target_long:
        return im
    s = min(target_long / lo, 3.0)      # never invent more than 3x
    return im.resize((max(1, int(w * s)), max(1, int(h * s))), Image.LANCZOS)


def make_ambient(im, size=(760, 760)):
    """Reduce a frame to unidentifiable paper-tinted texture.

    Heavy defocus, then desaturation, then a strong blend toward the paper
    ground. Nothing recognisable as a product survives, which is the point:
    these only ever fill the non-critical top/bottom bands.
    """
    im = im.convert("RGB")
    w, h = im.size
    side = min(w, h)
    im = im.crop(((w - side) // 2, (h - side) // 2, (w + side) // 2, (h + side) // 2))
    im = im.resize(size, Image.LANCZOS)
    # Two blur passes at this radius fully dissolve hard silhouettes -- a
    # single pass still left the NDH headphone outline and the KH speaker
    # rectangles legible, which would read as a competing product.
    im = im.filter(ImageFilter.GaussianBlur(size[0] * 0.090))
    im = im.filter(ImageFilter.GaussianBlur(size[0] * 0.045))
    im = ImageEnhance.Color(im).enhance(0.10)
    im = ImageEnhance.Contrast(im).enhance(0.42)
    im = ImageEnhance.Brightness(im).enhance(1.20)
    a = np.asarray(im).astype(np.float32)
    paper = np.array(PAPER, dtype=np.float32)
    a = a * 0.22 + paper * 0.78            # dissolve toward the paper ground
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "RGB")


def main():
    os.chdir(ROOT)
    manifest = {"tierA": [], "ambient": []}
    seen_slugs = set()
    missing = []

    print(f"{'slug':<18}{'tier':>5}{'src px':>13}{'out px':>13}  {'keyed':<6} note")
    print("-" * 108)

    for fname, slug, tier, want_key, crop, note in L:
        if not os.path.exists(fname):
            missing.append(fname)
            continue
        assert slug not in seen_slugs, f"duplicate slug {slug}"
        seen_slugs.add(slug)

        im = load(fname)
        src_px = f"{im.size[0]}x{im.size[1]}"
        im = apply_crop(im, crop)

        if tier == "A":
            keyed = False
            im = upscale(im)
            if want_key:
                k = key_background(im)
                if k is not None:
                    im = k
                    keyed = True
            out = os.path.join(IMG_OUT, slug + ".png")
            im.save(out, "PNG", optimize=True)
            manifest["tierA"].append(
                {"slug": slug, "src": fname, "w": im.size[0], "h": im.size[1],
                 "keyed": keyed, "note": note})
            print(f"{slug:<18}{tier:>5}{src_px:>13}{im.size[0]}x{im.size[1]:<8}  "
                  f"{'yes' if keyed else '-':<6} {note}")
        else:
            im = make_ambient(im)
            out = os.path.join(AMB_OUT, slug + ".jpg")
            im.save(out, "JPEG", quality=88, optimize=True)
            manifest["ambient"].append(
                {"slug": slug, "src": fname, "tier": tier,
                 "cropped": bool(crop), "note": note})
            print(f"{slug:<18}{tier:>5}{src_px:>13}{im.size[0]}x{im.size[1]:<8}  "
                  f"{'-':<6} {note}")

    if missing:
        print("\nMISSING SOURCE FILES:")
        for m in missing:
            print("  x", m)
        return 1

    with open(os.path.join(ROOT, "src", "lib", "media.json"), "w") as f:
        json.dump(manifest, f, indent=1)

    a, b = len(manifest["tierA"]), len(manifest["ambient"])
    keyed = sum(1 for x in manifest["tierA"] if x["keyed"])
    print("-" * 108)
    print(f"Tier A product images : {a:>3}   ({keyed} background-keyed)")
    print(f"Ambient texture plates: {b:>3}")
    print(f"TOTAL                 : {a + b:>3}  (must be 55)")
    return 0 if a + b == 55 else 1


if __name__ == "__main__":
    sys.exit(main())
