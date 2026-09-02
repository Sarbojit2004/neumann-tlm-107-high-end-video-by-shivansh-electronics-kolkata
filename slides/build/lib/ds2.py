"""
NEUMANN TLM 107 x SHIVANSH ELECTRONICS — light-ground campaign system.

A spec-sheet aesthetic: warm beige stock ruled with a fine spreadsheet grid,
ink typography, and the product mounted on it as photographic plates. The grid
is the organising idea — every plate, rule and text block snaps to it, so the
page reads as a precision document rather than a poster.

TYPE is the MOTU M-Series repository's own system, ported unchanged in spirit
from its longform/src/fonts.ts:
  ARCHIVO  — technical grotesque; uppercase tracked headlines, spec callouts
             with tabular numerals, micro labels. Carries the weight.
  FRAUNCES — editorial serif; held back for genuinely editorial moments.

COLOUR is measured, not guessed. Every text tone below was contrast-checked
against the beige ground (see CONTRAST table). The two accents are lifted from
the real brand marks: the orange from the Neumann logo's chevrons, the red from
the microphone's own badge.
"""
import os, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

S        = 2160
MARGIN   = 132
CONTENT  = S - 2*MARGIN            # 1896
CELL     = 54                      # spreadsheet cell — 40 x 40 across the page
MAJOR    = 6                       # heavier rule every 6 cells
FOOT_TOP = 1640

FONTS  = "/home/user/slides-v2/fonts"
ASSETS = "/home/user/slides-v2/assets"

# ---------------------------------------------------------------- palette
PAPER    = (239, 232, 220)         # warm beige stock
PAPER_HI = (245, 240, 231)         # raised plate
PAPER_LO = (231, 223, 209)         # recessed band
GRID_MIN = (225, 216, 201)         # cell rule
GRID_MAJ = (213, 202, 184)         # every 6th
HAIR     = (198, 186, 166)         # structural hairline
INK      = (26, 24, 21)            # primary type      14.55:1 on PAPER
INK2     = (74, 68, 59)            # secondary          7.91:1
MUTED    = (110, 102, 89)          # small labels       4.65:1
RED      = (166, 39, 44)           # accent type        5.85:1  (badge red)
ORANGE   = (230, 139, 12)          # graphic accent only 2.01:1 — never text
PLATE_BG = (22, 21, 19)            # dark photographic plate
PLATE_IN = (242, 238, 230)         # type on a dark plate

CONTRAST = {'INK': 14.55, 'INK2': 7.91, 'MUTED': 4.65, 'RED': 5.85, 'ORANGE': 2.01}

_fc = {}
def F(fam, size):
    k = (fam, size)
    if k not in _fc:
        _fc[k] = ImageFont.truetype(f"{FONTS}/{fam}.ttf", size)
    return _fc[k]

# ---------------------------------------------------------------- type
def tw(text, font, track=0.0):
    if not text: return 0
    return sum(font.getlength(c) for c in text) + track*(len(text)-1)

def text(img, xy, s, font, fill, track=0.0, anchor="ls"):
    """Letter-spaced text. anchor: l/m/r + s(baseline)/t/m."""
    if not s: return 0
    x, y = xy
    W = tw(s, font, track)
    ha, va = anchor[0], anchor[1]
    if ha == 'm': x -= W/2
    elif ha == 'r': x -= W
    asc, desc = font.getmetrics()
    if va == 't': y += asc
    elif va == 'm': y += asc/2 - desc/4
    d = ImageDraw.Draw(img)
    cx = x
    for c in s:
        d.text((cx, y), c, font=font, fill=fill, anchor="ls")
        cx += font.getlength(c) + track
    return W

def para(img, xy, lines, font, fill, leading, track=0.0, anchor="ls"):
    for i, ln in enumerate(lines):
        text(img, (xy[0], xy[1] + i*leading), ln, font, fill, track, anchor)
    return len(lines)*leading

def rule(img, x0, y, x1, color=HAIR, w=2, opacity=1.0):
    lay = Image.new('RGBA', img.size, (0,0,0,0))
    ImageDraw.Draw(lay).rectangle([x0, y, x1, y+w-1], fill=tuple(color)+(int(255*opacity),))
    img.alpha_composite(lay)

def vrule(img, x, y0, y1, color=HAIR, w=2, opacity=1.0):
    lay = Image.new('RGBA', img.size, (0,0,0,0))
    ImageDraw.Draw(lay).rectangle([x, y0, x+w-1, y1], fill=tuple(color)+(int(255*opacity),))
    img.alpha_composite(lay)

# --- the MOTU hierarchy, ported -------------------------------------------
def headline(img, xy, s, size, fill=INK, weight=800, anchor="ls"):
    """Archivo, uppercase, tight — projects authority."""
    return text(img, xy, s.upper(), F(f"Archivo-{weight}", size), fill,
                -size*0.015, anchor)

def subhead(img, xy, s, size, fill=INK2, weight=500, anchor="ls"):
    return text(img, xy, s, F(f"Archivo-{weight}", size), fill, size*0.002, anchor)

def spec(img, xy, s, size, fill=INK, weight=700, track=0.10, anchor="ls"):
    return text(img, xy, s, F(f"Archivo-{weight}", size), fill, size*track, anchor)

def micro(img, xy, s, size=26, fill=MUTED, weight=600, track=0.16, anchor="ls"):
    return text(img, xy, s.upper(), F(f"Archivo-{weight}", size), fill,
                size*track, anchor)

def editorial(img, xy, s, size, fill=INK, weight=600, anchor="ls"):
    """Fraunces — held back for the genuinely editorial beats."""
    return text(img, xy, s, F(f"Fraunces-{weight}", size), fill, -size*0.02, anchor)

# ---------------------------------------------------------------- ground
def ground(seed=5, tint=0.0):
    """Beige stock ruled as a spreadsheet, with paper tooth and a soft
    corner falloff so it reads as stock rather than a flat fill."""
    yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
    base = np.zeros((S, S, 3), np.float32)
    base[:] = np.array(PAPER, np.float32)
    # gentle warmth toward the top-left, as if lit
    lift = np.clip(1.0 - np.hypot(xx/S-0.30, yy/S-0.24)/1.25, 0, 1)**2.0
    base += lift[..., None]*np.array([7, 6, 4], np.float32)
    # corner falloff
    d = np.hypot(xx/S-0.5, yy/S-0.5)*1.414
    base -= (np.clip(d,0,1)**2.4)[..., None]*np.array([8, 9, 11], np.float32)
    img = Image.fromarray(np.clip(base,0,255).astype(np.uint8)).convert('RGBA')

    # --- the spreadsheet rule ---------------------------------------------
    grid = Image.new('RGBA', (S, S), (0,0,0,0))
    g = ImageDraw.Draw(grid)
    n = S // CELL + 1
    for i in range(n+1):
        p = i*CELL
        major = (i % MAJOR == 0)
        col = tuple(GRID_MAJ if major else GRID_MIN)
        a = 210 if major else 150
        w = 2 if major else 1
        g.rectangle([p, 0, p+w-1, S], fill=col+(a,))
        g.rectangle([0, p, S, p+w-1], fill=col+(a,))
    img.alpha_composite(grid)

    # paper tooth
    rng = np.random.default_rng(seed)
    a = np.asarray(img).astype(np.float32)
    a[..., :3] += rng.normal(0, 2.6, (S, S, 1))
    return Image.fromarray(np.clip(a,0,255).astype(np.uint8), 'RGBA')

def snap(v):
    """Snap a coordinate to the cell grid."""
    return int(round(v/CELL)*CELL)

# ---------------------------------------------------------------- imagery
def load(name): return Image.open(f"{ASSETS}/{name}").convert('RGBA')

def fit(im, w=None, h=None):
    if w and not h: h = round(im.height*w/im.width)
    if h and not w: w = round(im.width*h/im.height)
    return im.resize((max(1,int(w)), max(1,int(h))), Image.LANCZOS)

def crop_cover(im, w, h, fx=0.5, fy=0.5):
    s = max(w/im.width, h/im.height)
    im = im.resize((max(w,int(im.width*s)), max(h,int(im.height*s))), Image.LANCZOS)
    x = int((im.width-w)*fx); y = int((im.height-h)*fy)
    return im.crop((x, y, x+w, y+h))

def soft_shadow(img, sprite, xy, blur=54, spread=1.01, opacity=0.30, dy=26):
    """Light-ground shadow: warm grey, low opacity, close to the object."""
    a = sprite.split()[-1]
    w, h = int(a.width*spread), int(a.height*spread)
    a = a.resize((w, h), Image.LANCZOS).filter(ImageFilter.GaussianBlur(blur))
    sh = Image.new('RGBA', (w, h), (108, 96, 78, 0))
    sh.putalpha(a.point(lambda v: int(v*opacity)))
    lay = Image.new('RGBA', img.size, (0,0,0,0))
    lay.paste(sh, (int(xy[0]-(w-sprite.width)/2), int(xy[1]-(h-sprite.height)/2+dy)), sh)
    img.alpha_composite(lay)

def place(img, sprite, xy, shadow=True, **kw):
    if shadow: soft_shadow(img, sprite, xy, **kw)
    img.alpha_composite(sprite, (int(xy[0]), int(xy[1])))

def plate(img, box, photo=None, fx=0.5, fy=0.5, dark=True, pad=0):
    """A photographic plate mounted on the sheet — the core device of this
    system. Dark plates give the beige page its contrast."""
    x0, y0, x1, y1 = box
    w, h = x1-x0, y1-y0
    lay = Image.new('RGBA', (w, h), tuple(PLATE_BG)+(255,) if dark
                    else tuple(PAPER_HI)+(255,))
    if photo is not None:
        c = crop_cover(photo.convert('RGBA'), w-2*pad, h-2*pad, fx, fy)
        lay.alpha_composite(c.convert('RGBA'), (pad, pad))
    drop = Image.new('RGBA', img.size, (0,0,0,0))
    sh = Image.new('RGBA', (w+40, h+40), (0,0,0,0))
    ImageDraw.Draw(sh).rectangle([20, 20, w+19, h+19], fill=(104, 92, 74, 92))
    drop.paste(sh.filter(ImageFilter.GaussianBlur(22)), (x0-20, y0-8), sh.filter(ImageFilter.GaussianBlur(22)))
    img.alpha_composite(drop)
    img.alpha_composite(lay, (x0, y0))
    ImageDraw.Draw(img).rectangle([x0, y0, x1-1, y1-1],
                                 outline=tuple(HAIR)+(190,), width=2)

def scrim(img, box, direction='b', strength=0.90, extent=0.60, color=(14,13,12)):
    x0,y0,x1,y1 = box; w,h = x1-x0, y1-y0
    t = np.linspace(0,1,h if direction in 'tb' else w, dtype=np.float32)
    ramp = np.clip((t-(1-extent))/extent, 0, 1)**1.5 * strength
    if direction=='b':   g = np.repeat(ramp[:,None], w, 1)
    elif direction=='t': g = np.repeat(ramp[::-1][:,None], w, 1)
    elif direction=='r': g = np.repeat(ramp[None,:], h, 0)
    else:                g = np.repeat(ramp[::-1][None,:], h, 0)
    lay = Image.fromarray(np.dstack([
        np.full((h,w), color[0], np.uint8), np.full((h,w), color[1], np.uint8),
        np.full((h,w), color[2], np.uint8), (g*255).astype(np.uint8)]), 'RGBA')
    img.alpha_composite(lay, (x0,y0))
