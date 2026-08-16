#!/usr/bin/env python3
"""Prepares both logo files for the long-form video.

The long-form video uses BOTH logos deliberately and repeatedly (the companion
reel deliberately uses neither). Two problems with the supplied files have to
be fixed first:

1. WHITE PLATE. Both files ship with an opaque white rounded-rectangle card
   baked in behind the mark. The spec requires each logo to appear "directly
   on screen as a plain image -- not enclosed in a white box, card, or plate",
   so that plate is keyed to transparency here. Only white regions CONNECTED
   TO THE BORDER are removed, so white enclosed inside the artwork (the
   Neumann diamond's interior, counters inside letterforms) survives intact.

NOTHING IS CROPPED. Both marks are used in full, exactly as supplied --
globe device, wordmark and the "Eastern India's Premier Audio Destination"
tagline all intact. The keying above is the only processing applied, and it
touches no pixel of the artwork itself.

Both outputs are written as RGBA PNGs that composite cleanly straight onto the
light paper ground with no visible edge.

Run:  python3 scripts/prep_logos.py
"""
import os
import sys

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "logo")
os.makedirs(OUT, exist_ok=True)

SOURCES = [
    # (source file, output slug, fraction of height to KEEP from the top)
    #
    # BOTH logos are used COMPLETE — keep = 1.0, no cropping of any kind.
    #
    # An earlier revision cropped the Shivansh lockup to 0.70 of its height to
    # strip the "Eastern India's Premier Audio Destination" tagline. That was
    # wrong twice over: it removed a permanent part of the registered mark, and
    # the cut line ran straight through the globe device, chopping off its
    # lower third and the script "Shivansh Electronics" curving inside it. The
    # result read as a damaged logo. The full supplied artwork is now used
    # verbatim, tagline and globe intact.
    ("NEUMANN BERLIN LOGO.png", "neumann", 1.0),
    ("SHIVANSH ELECTRONICS LOGO FOR VIDEO.png", "shivansh", 1.0),
]


def key_plate(im: Image.Image, thresh: int = 238, sat_max: int = 22, feather: float = 0.9):
    """Key the border-connected white plate to transparency.

    Returns RGBA. Only bright, near-neutral pixels that form a region touching
    the image border are removed -- white *inside* the artwork is preserved.
    """
    rgb = np.asarray(im.convert("RGB")).astype(np.int16)
    alpha0 = np.asarray(im.convert("RGBA"))[:, :, 3]

    mx = rgb.max(axis=2)
    mn = rgb.min(axis=2)
    # already-transparent pixels count as plate too
    cand = ((mx > thresh) & ((mx - mn) < sat_max)) | (alpha0 < 12)

    lab, n = ndimage.label(cand)
    if n == 0:
        return im.convert("RGBA"), 0.0

    edge = set(lab[0, :]) | set(lab[-1, :]) | set(lab[:, 0]) | set(lab[:, -1])
    edge.discard(0)
    if not edge:
        return im.convert("RGBA"), 0.0

    plate = np.isin(lab, list(edge))
    alpha = np.where(plate, 0, 255).astype(np.uint8)
    al = Image.fromarray(alpha, "L").filter(ImageFilter.GaussianBlur(feather))

    out = im.convert("RGBA")
    out.putalpha(al)
    return out, float(plate.mean())


def trim(im: Image.Image, pad: int = 6) -> Image.Image:
    """Crop to the artwork's actual bounding box so sizing is predictable."""
    a = np.asarray(im)[:, :, 3]
    ys, xs = np.where(a > 12)
    if len(ys) == 0:
        return im
    y0, y1 = max(0, ys.min() - pad), min(im.height, ys.max() + pad + 1)
    x0, x1 = max(0, xs.min() - pad), min(im.width, xs.max() + pad + 1)
    return im.crop((x0, y0, x1, y1))


def main() -> int:
    os.chdir(ROOT)
    print(f"{'logo':<12}{'source':>14}{'cropped':>14}{'final':>14}{'plate%':>9}")
    print("-" * 66)
    for src, slug, keep in SOURCES:
        if not os.path.exists(src):
            print(f"MISSING: {src}")
            return 1
        im = Image.open(src)
        s0 = im.size

        if keep < 1.0:
            im = im.crop((0, 0, im.width, int(im.height * keep)))
        s1 = im.size

        keyed, plate_frac = key_plate(im)
        keyed = trim(keyed)

        path = os.path.join(OUT, slug + ".png")
        keyed.save(path, "PNG", optimize=True)
        print(
            f"{slug:<12}{f'{s0[0]}x{s0[1]}':>14}{f'{s1[0]}x{s1[1]}':>14}"
            f"{f'{keyed.size[0]}x{keyed.size[1]}':>14}{plate_frac*100:>8.1f}%"
        )

    print("\nBoth logos keyed to transparency -- no white plate, no tagline.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
