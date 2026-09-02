"""
NEUMANN TLM 107 x SHIVANSH ELECTRONICS — campaign design system.

One system, ten slides. Everything below is defined once and reused so the set
reads as a single campaign rather than ten posters.

PALETTE is sampled from the product photography itself, not invented: the
accent is the TLM 107's own gold capsule (#A59277 measured, lifted for
legibility on dark), the warm off-white echoes the nickel body (#C5AEA6), and
the ground is the studio black measured off the cinematic macro (#141012).

TYPE is two families, per brief: Inter (variable, instanced 200-900) carries
every headline and reading text; JetBrains Mono (400-800) carries every
technical label, figure and index — the engineering-grade register.
"""
import os, math, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops

S        = 2160                 # square canvas
MARGIN   = 130
CONTENT  = S - 2*MARGIN         # 1900
FOOT_TOP = 1666                 # top hairline of the branding band (== brandblock.TOP)

FONTS = "/tmp/claude-0/-home-user/cde6911f-6a07-503e-9735-d69ba31abd65/scratchpad/fonts"
ASSETS = "/home/user/slides-build/assets"
REPO   = "/home/user/neumann-tlm-107-high-end-video-by-shivansh-electronics-kolkata"

# ------------------------------------------------------------------ palette
INK      = (11, 10, 12)         # base ground
INK2     = (18, 17, 20)         # raised panel
INK3     = (26, 25, 29)
LINE     = (44, 42, 48)         # hairline
LINE_HI  = (63, 60, 68)
PAPER    = (243, 239, 233)      # primary type — warm off-white, nickel-derived
SOFT     = (196, 190, 182)
DIM      = (140, 134, 128)
FAINT    = (99, 95, 92)
BRASS    = (198, 168, 124)      # the one accent — the capsule's own gold
BRASS_D  = (124, 104, 74)

_fc = {}
def F(fam, size):
    k = (fam, size)
    if k not in _fc:
        _fc[k] = ImageFont.truetype(f"{FONTS}/{fam}.ttf", size)
    return _fc[k]

# ------------------------------------------------------------------ type
def tw(text, font, track=0.0):
    """Width of `text` with letter-spacing applied."""
    if not text: return 0
    w = sum(font.getlength(c) for c in text)
    return w + track*(len(text)-1)

def text(img, xy, s, font, fill, track=0.0, anchor="ls", opacity=1.0):
    """Draw text with real letter-spacing. anchor: l/m/r + s(baseline)/t/m."""
    if not s: return 0
    x, y = xy
    W = tw(s, font, track)
    ha, va = anchor[0], anchor[1]
    if ha == 'm': x -= W/2
    elif ha == 'r': x -= W
    asc, desc = font.getmetrics()
    if va == 't': y += asc
    elif va == 'm': y += asc/2 - desc/4
    if opacity < 1.0:
        lay = Image.new('RGBA', img.size, (0,0,0,0)); d = ImageDraw.Draw(lay)
    else:
        d = ImageDraw.Draw(img)
    cx = x
    for c in s:
        d.text((cx, y), c, font=font, fill=fill, anchor="ls")
        cx += font.getlength(c) + track
    if opacity < 1.0:
        img.alpha_composite(Image.blend(Image.new('RGBA', img.size,(0,0,0,0)), lay, opacity))
    return W

def para(img, xy, lines, font, fill, leading, track=0.0, anchor="ls"):
    x, y = xy
    for i, ln in enumerate(lines):
        text(img, (x, y + i*leading), ln, font, fill, track, anchor)
    return len(lines)*leading

def rule(img, x0, y, x1, color=LINE, w=2, opacity=1.0):
    lay = Image.new('RGBA', img.size, (0,0,0,0))
    ImageDraw.Draw(lay).rectangle([x0, y, x1, y+w-1], fill=color+(int(255*opacity),))
    img.alpha_composite(lay)

def vrule(img, x, y0, y1, color=LINE, w=2, opacity=1.0):
    lay = Image.new('RGBA', img.size, (0,0,0,0))
    ImageDraw.Draw(lay).rectangle([x, y0, x+w-1, y1], fill=color+(int(255*opacity),))
    img.alpha_composite(lay)

def eyebrow(img, xy, s, color=BRASS, size=27, track=7.0, anchor="ls"):
    """The campaign's recurring small-caps index label."""
    return text(img, xy, s.upper(), F("JBM-600", size), color, track, anchor)

# ------------------------------------------------------------------ ground
def _grain(size, amount=5.0, seed=7):
    rng = np.random.default_rng(seed)
    n = rng.normal(0, amount, (size, size, 1))
    return n

def ground(seed=7, glow=None, glow_r=1.0, vignette=0.86, base=INK):
    """Base plate: deep graphite, an optional soft studio glow, vignette, grain.

    This is what stops the set reading as flat black rectangles — every slide
    sits on a lit ground, the way a product sits in a lit studio.
    """
    yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
    nx, ny = xx/S, yy/S
    img = np.zeros((S, S, 3), np.float32)
    img[:] = np.array(base, np.float32)
    # broad diagonal lift, top-left toward centre
    lift = np.clip(1.0 - np.hypot(nx-0.34, ny-0.30)/1.05, 0, 1)**2.2
    img += lift[..., None]*np.array([20, 19, 22], np.float32)
    if glow:
        gx, gy, gi = glow
        d = np.hypot(nx-gx, ny-gy)/glow_r
        g = np.exp(-(d**2)*3.4)
        img += (g*gi)[..., None]*np.array([46, 40, 33], np.float32)
    # vignette
    d = np.hypot(nx-0.5, ny-0.5)*1.414
    img *= (1.0 - (1.0-vignette)*np.clip(d, 0, 1)**1.7)[..., None]
    img += _grain(S, 4.2, seed)
    return Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).convert('RGBA')

def hairgrid(img, opacity=0.30):
    """Barely-there engineering grid — structure you feel more than see."""
    lay = Image.new('RGBA', img.size, (0,0,0,0)); d = ImageDraw.Draw(lay)
    a = int(255*opacity*0.16)
    for i in range(1, 12):
        x = MARGIN + CONTENT*i/12
        d.rectangle([x, MARGIN, x+0.9, S-MARGIN], fill=LINE+(a,))
    img.alpha_composite(lay)

# ------------------------------------------------------------------ imagery
def load(name, alpha=True):
    p = f"{ASSETS}/{name}"
    return Image.open(p).convert('RGBA' if alpha else 'L')

def fit(im, w=None, h=None):
    if w and not h: h = round(im.height*w/im.width)
    if h and not w: w = round(im.width*h/im.height)
    return im.resize((max(1,int(w)), max(1,int(h))), Image.LANCZOS)

def sharpen(im, amount=0.55, radius=2.0):
    """Mild unsharp — these source files are web-resolution and get upscaled."""
    return im.filter(ImageFilter.UnsharpMask(radius=radius, percent=int(amount*100), threshold=3))

def shadow(img, sprite, xy, blur=70, spread=1.02, opacity=0.72, dy=34, tint=(0,0,0)):
    """Ground a cutout with a soft contact shadow so it sits in the frame."""
    a = sprite.split()[-1]
    w, h = int(a.width*spread), int(a.height*spread)
    a = a.resize((w, h), Image.LANCZOS).filter(ImageFilter.GaussianBlur(blur))
    lay = Image.new('RGBA', img.size, (0,0,0,0))
    sh = Image.new('RGBA', (w, h), tint+(0,))
    sh.putalpha(a.point(lambda v: int(v*opacity)))
    lay.paste(sh, (int(xy[0]-(w-sprite.width)/2), int(xy[1]-(h-sprite.height)/2+dy)), sh)
    img.alpha_composite(lay)

def place(img, sprite, xy, with_shadow=True, **kw):
    if with_shadow: shadow(img, sprite, xy, **kw)
    img.alpha_composite(sprite, (int(xy[0]), int(xy[1])))

def crop_cover(im, w, h, fx=0.5, fy=0.5):
    """Cover-crop to an exact box, focal point fx/fy in 0..1."""
    s = max(w/im.width, h/im.height)
    im = im.resize((max(w,int(im.width*s)), max(h,int(im.height*s))), Image.LANCZOS)
    x = int((im.width-w)*fx); y = int((im.height-h)*fy)
    return im.crop((x, y, x+w, y+h))

def scrim(img, box, direction='b', strength=0.94, extent=0.62, color=(6,5,7)):
    """Gradient scrim so type stays legible over photography."""
    x0,y0,x1,y1 = box; w,h = x1-x0, y1-y0
    g = np.zeros((h, w), np.float32)
    t = np.linspace(0,1,h if direction in 'tb' else w, dtype=np.float32)
    ramp = np.clip((t-(1-extent))/extent, 0, 1)**1.55 * strength
    if direction=='b': g = np.repeat(ramp[:,None], w, 1)
    elif direction=='t': g = np.repeat(ramp[::-1][:,None], w, 1)
    elif direction=='r': g = np.repeat(ramp[None,:], h, 0)
    else: g = np.repeat(ramp[::-1][None,:], h, 0)
    lay = Image.fromarray(np.dstack([
        np.full((h,w), color[0], np.uint8), np.full((h,w), color[1], np.uint8),
        np.full((h,w), color[2], np.uint8), (g*255).astype(np.uint8)]), 'RGBA')
    img.alpha_composite(lay, (x0,y0))

def framed(img, im, box, radius=0, border=True, feather=0):
    """Drop a photographic crop into an exact box with an optional hairline."""
    x0,y0,x1,y1 = box
    c = crop_cover(im.convert('RGBA'), x1-x0, y1-y0)
    img.alpha_composite(c, (x0,y0))
    if border:
        d = ImageDraw.Draw(img)
        d.rectangle([x0,y0,x1-1,y1-1], outline=LINE_HI+(150,), width=2)

def duotone(im, dark=(10,9,11), light=PAPER, mix=1.0):
    """Map a photo into the palette — used for supporting/texture imagery."""
    g = np.asarray(im.convert('L'), np.float32)/255.
    out = np.zeros(g.shape+(3,), np.float32)
    for i in range(3):
        out[...,i] = dark[i] + (light[i]-dark[i])*g
    if mix < 1.0:
        src = np.asarray(im.convert('RGB'), np.float32)
        out = src*(1-mix) + out*mix
    return Image.fromarray(np.clip(out,0,255).astype(np.uint8)).convert('RGBA')

def tint_mask(mask, color, opacity=1.0):
    """Colourise a single-channel glyph/logo mask."""
    if isinstance(mask, Image.Image) and mask.mode != 'L': mask = mask.convert('L')
    im = Image.new('RGBA', mask.size, tuple(color)+(0,))
    im.putalpha(mask.point(lambda v: int(v*opacity)))
    return im

def product_crop(im, inset=0.03, thresh=0.90):
    """Crop a white-sweep product photo down to the product itself.

    The source photography is shot on white; dropped straight into a dark
    layout the sweep reads as a pasted screenshot. This finds the product's
    own bounding box so a crop can be filled edge-to-edge with product.
    """
    a = np.asarray(im.convert('RGB'), np.float32)/255.
    lum = a @ np.array([0.2126,0.7152,0.0722], np.float32)
    sat = a.max(-1)-a.min(-1)
    prod = ~((lum > thresh) & (sat < 0.10))
    ys, xs = np.where(prod)
    if not len(ys): return im
    y0,y1,x0,x1 = ys.min(), ys.max()+1, xs.min(), xs.max()+1
    iy, ix = int((y1-y0)*inset), int((x1-x0)*inset)
    return im.crop((max(0,x0+ix), max(0,y0+iy),
                    min(im.width,x1-ix), min(im.height,y1-iy)))
