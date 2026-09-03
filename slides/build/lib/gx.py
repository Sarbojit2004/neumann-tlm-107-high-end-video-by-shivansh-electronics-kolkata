"""
Ultra-premium poster engine — gradient grounds, gradient-filled display type,
rim-lit product cutouts, and a rich colour contact bar.

Built for maximum graphic energy while keeping every contrast ratio measured:
display type is champagne-on-obsidian, contact text is near-white on a dark
bar, and the brand marks sit on their own white cards.
"""
import os, math, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops

S = 2160
FONTS  = "/home/user/slides-v3/fonts"
ASSETS = "/home/user/slides-v3/assets"

# ---------------------------------------------------------------- palette
OBSIDIAN = (8, 8, 10)
COAL     = (16, 16, 20)
GOLD     = (214, 168, 92)
GOLD_HI  = (247, 226, 176)
GOLD_DP  = (150, 108, 44)
CHAMP    = (238, 224, 198)
WHITE    = (255, 255, 255)
PAPER    = (245, 242, 236)
SOFT     = (196, 190, 180)
DIMTX    = (150, 144, 136)
RED      = (198, 42, 46)
COOL     = (54, 74, 108)

_fc = {}
def F(fam, size):
    k = (fam, size)
    if k not in _fc: _fc[k] = ImageFont.truetype(f"{FONTS}/{fam}.ttf", size)
    return _fc[k]

def load(n): return Image.open(f"{ASSETS}/{n}").convert('RGBA')

def fit(im, w=None, h=None):
    if w and not h: h = round(im.height*w/im.width)
    if h and not w: w = round(im.width*h/im.height)
    return im.resize((max(1,int(w)), max(1,int(h))), Image.LANCZOS)

# ---------------------------------------------------------------- text
def tw(s, font, track=0.0):
    if not s: return 0
    return sum(font.getlength(c) for c in s) + track*(len(s)-1)

def _draw_chars(d, xy, s, font, fill, track):
    x, y = xy
    for c in s:
        d.text((x, y), c, font=font, fill=fill, anchor="ls")
        x += font.getlength(c) + track

def text(img, xy, s, font, fill, track=0.0, anchor="ls"):
    if not s: return 0
    x, y = xy; W = tw(s, font, track)
    if anchor[0] == 'm': x -= W/2
    elif anchor[0] == 'r': x -= W
    asc, desc = font.getmetrics()
    if anchor[1] == 't': y += asc
    elif anchor[1] == 'm': y += asc/2 - desc/4
    _draw_chars(ImageDraw.Draw(img), (x, y), s, font, tuple(fill), track)
    return W

def text_mask(size, xy, s, font, track=0.0, anchor="ls", stroke=0):
    """Render text to an L mask so a gradient can be poured through it."""
    m = Image.new('L', size, 0); d = ImageDraw.Draw(m)
    x, y = xy; W = tw(s, font, track)
    if anchor[0] == 'm': x -= W/2
    elif anchor[0] == 'r': x -= W
    asc, desc = font.getmetrics()
    if anchor[1] == 't': y += asc
    elif anchor[1] == 'm': y += asc/2 - desc/4
    for c in s:
        if stroke:
            d.text((x, y), c, font=font, fill=255, anchor="ls",
                   stroke_width=stroke, stroke_fill=255)
        else:
            d.text((x, y), c, font=font, fill=255, anchor="ls")
        x += font.getlength(c) + track
    return m, W

def linear_grad(size, c0, c1, angle=90):
    """Linear gradient image; angle 90 = top->bottom, 0 = left->right."""
    w, h = size
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    a = math.radians(angle)
    t = (xx*math.cos(a) + yy*math.sin(a))
    t = (t - t.min())/max(1e-6, (t.max()-t.min()))
    out = np.zeros((h, w, 3), np.float32)
    for i in range(3):
        out[..., i] = c0[i] + (c1[i]-c0[i])*t
    return Image.fromarray(out.astype(np.uint8), 'RGB')

def grad_text(img, xy, s, font, c0, c1, track=0.0, anchor="ls", angle=90,
              stroke=0, shadow=None):
    """Display type with a gradient poured through it — the campaign's
    signature treatment."""
    m, W = text_mask(img.size, xy, s, font, track, anchor, stroke)
    if shadow:
        sc, sblur, sdy, sop = shadow
        sm = m.filter(ImageFilter.GaussianBlur(sblur))
        lay = Image.new('RGBA', img.size, tuple(sc)+(0,))
        lay.putalpha(sm.point(lambda v: int(v*sop)))
        img.alpha_composite(ImageChops.offset(lay, 0, sdy))
    g = linear_grad(img.size, c0, c1, angle).convert('RGBA')
    g.putalpha(m)
    img.alpha_composite(g)
    return W

def outline_text(img, xy, s, font, colour, width=3, track=0.0, anchor="ls",
                 opacity=1.0):
    """Ghost/outlined display type — used for the oversized watermark words."""
    full, W = text_mask(img.size, xy, s, font, track, anchor, stroke=width)
    inner, _ = text_mask(img.size, xy, s, font, track, anchor, stroke=0)
    ring = ImageChops.subtract(full, inner)
    lay = Image.new('RGBA', img.size, tuple(colour)+(0,))
    lay.putalpha(ring.point(lambda v: int(v*opacity)))
    img.alpha_composite(lay)
    return W

def vertical_text(img, xy, s, font, colour, track=0.0, opacity=1.0,
                  outline=0, up=True):
    """Sideways running text down the edge of the poster."""
    W = int(tw(s, font, track)) + 40
    H = font.size*2
    strip = Image.new('RGBA', (W, H), (0,0,0,0))
    if outline:
        outline_text(strip, (0, H*0.62), s, font, colour, outline, track, "ls", opacity)
    else:
        text(strip, (0, H*0.62), s, font, tuple(colour)+(int(255*opacity),), track)
    strip = strip.rotate(90 if up else -90, expand=True)
    img.alpha_composite(strip, (int(xy[0]), int(xy[1])))
    return strip.size

# ---------------------------------------------------------------- light
def ground(base=OBSIDIAN, seed=3):
    a = np.zeros((S, S, 3), np.float32); a[:] = np.array(base, np.float32)
    return Image.fromarray(a.astype(np.uint8)).convert('RGBA')

def radial(img, cx, cy, r, colour, intensity=1.0, falloff=2.0):
    """Soft radial light pool — the main depth device."""
    yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
    d = np.hypot(xx - cx*S, yy - cy*S) / (r*S)
    g = np.clip(1.0 - d, 0, 1)**falloff * intensity
    base = np.asarray(img.convert('RGB'), np.float32)
    out = base + g[..., None]*np.array(colour, np.float32)
    img.paste(Image.fromarray(np.clip(out,0,255).astype(np.uint8)), (0,0))

def beam(img, x0, y0, x1, y1, width, colour, intensity=0.5, blur=140):
    lay = Image.new('L', (S, S), 0)
    ImageDraw.Draw(lay).line([(x0*S,y0*S),(x1*S,y1*S)], fill=255, width=int(width*S))
    lay = lay.filter(ImageFilter.GaussianBlur(blur))
    base = np.asarray(img.convert('RGB'), np.float32)
    g = np.asarray(lay, np.float32)/255.*intensity
    out = base + g[..., None]*np.array(colour, np.float32)
    img.paste(Image.fromarray(np.clip(out,0,255).astype(np.uint8)), (0,0))

def grain(img, amount=3.2, seed=7):
    rng = np.random.default_rng(seed)
    a = np.asarray(img.convert('RGB'), np.float32)
    a += rng.normal(0, amount, (S, S, 1))
    img.paste(Image.fromarray(np.clip(a,0,255).astype(np.uint8)), (0,0))

def vignette(img, strength=0.55, power=1.9):
    yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
    d = np.hypot(xx/S-0.5, yy/S-0.5)*1.414
    a = np.asarray(img.convert('RGB'), np.float32)
    a *= (1.0 - strength*np.clip(d,0,1)**power)[..., None]
    img.paste(Image.fromarray(np.clip(a,0,255).astype(np.uint8)), (0,0))

# ---------------------------------------------------------------- product
def rim_light(sprite, colour=GOLD_HI, width=7, opacity=0.85, blur=5):
    """Edge glow on a cutout so it separates from the ground and reads
    lit rather than pasted."""
    a = sprite.split()[-1]
    grown = a.filter(ImageFilter.MaxFilter(width*2+1))
    ring = ImageChops.subtract(grown, a).filter(ImageFilter.GaussianBlur(blur))
    lay = Image.new('RGBA', sprite.size, tuple(colour)+(0,))
    lay.putalpha(ring.point(lambda v: int(v*opacity)))
    out = Image.new('RGBA', sprite.size, (0,0,0,0))
    out.alpha_composite(lay); out.alpha_composite(sprite)
    return out

def _blurred_alpha(sprite, blur, spread):
    """Blur a cutout's alpha with room to fall off.

    Cutouts are trimmed to their alpha bounding box, so opaque pixels touch
    every edge. Blurring inside a sprite-sized layer makes PIL edge-extend and
    then CLIPS the falloff dead at the layer boundary — which paints a hard
    rectangle the width of the sprite. Padding by 3x the blur radius lets the
    falloff complete inside the layer.
    """
    a = sprite.split()[-1]
    w, h = max(1,int(a.width*spread)), max(1,int(a.height*spread))
    a = a.resize((w, h), Image.LANCZOS)
    pad = int(blur*3) + 8
    canvas = Image.new('L', (w+pad*2, h+pad*2), 0)
    canvas.paste(a, (pad, pad))
    return canvas.filter(ImageFilter.GaussianBlur(blur)), w, h, pad

def glow_behind(img, sprite, xy, colour=GOLD, blur=110, opacity=0.55, spread=1.18):
    a, w, h, pad = _blurred_alpha(sprite, blur, spread)
    lay = Image.new('RGBA', a.size, tuple(colour)+(0,))
    lay.putalpha(a.point(lambda v: int(v*opacity)))
    img.alpha_composite(lay, (int(xy[0]-(w-sprite.width)/2)-pad,
                              int(xy[1]-(h-sprite.height)/2)-pad))

def drop(img, sprite, xy, blur=70, opacity=0.75, dy=40, spread=1.0):
    a, w, h, pad = _blurred_alpha(sprite, blur, spread)
    lay = Image.new('RGBA', a.size, (0,0,0,0))
    lay.putalpha(a.point(lambda v: int(v*opacity)))
    img.alpha_composite(lay, (int(xy[0]-(w-sprite.width)/2)-pad,
                              int(xy[1]-(h-sprite.height)/2+dy)-pad))

# ---------------------------------------------------------------- chrome
def rounded(img, box, radius, fill, outline=None, ow=2):
    lay = Image.new('RGBA', img.size, (0,0,0,0))
    ImageDraw.Draw(lay).rounded_rectangle(box, radius, fill=fill,
                                          outline=outline, width=ow)
    img.alpha_composite(lay)

def logo_card(img, path, box_h, xy, pad=18, radius=14, bg=(255,255,255,255)):
    """The brand marks sit on their own white card — the client asked for the
    logos exactly as supplied, plate and all."""
    lg = fit(load(path), h=box_h)
    w, h = lg.width + pad*2, lg.height + pad*2
    card = Image.new('RGBA', (w, h), (0,0,0,0))
    ImageDraw.Draw(card).rounded_rectangle([0,0,w-1,h-1], radius, fill=bg)
    card.alpha_composite(lg, (pad, pad))
    sh = Image.new('RGBA', (w+40, h+40), (0,0,0,0))
    ImageDraw.Draw(sh).rounded_rectangle([20,20,w+19,h+19], radius, fill=(0,0,0,140))
    sh = sh.filter(ImageFilter.GaussianBlur(16))
    img.alpha_composite(sh, (int(xy[0])-20, int(xy[1])-14))
    img.alpha_composite(card, (int(xy[0]), int(xy[1])))
    return w, h

def ellipse_pool(img, cx, cy, rx, ry, colour, intensity=1.0, falloff=2.2, rot=0.0):
    """An elliptical light pool. Used instead of a silhouette-derived glow —
    a blurred cutout silhouette reads as a pasted panel at small sizes, an
    ellipse reads as light."""
    yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
    x = (xx - cx*S); y = (yy - cy*S)
    if rot:
        a = math.radians(rot)
        x, y = x*math.cos(a)+y*math.sin(a), -x*math.sin(a)+y*math.cos(a)
    d = np.sqrt((x/(rx*S))**2 + (y/(ry*S))**2)
    g = np.clip(1.0-d, 0, 1)**falloff * intensity
    base = np.asarray(img.convert('RGB'), np.float32)
    out = base + g[..., None]*np.array(colour, np.float32)
    img.paste(Image.fromarray(np.clip(out,0,255).astype(np.uint8)), (0,0))

def floor_reflection(img, sprite, xy, height=0.42, opacity=0.20, blur=14):
    """Mirror the product into a soft floor reflection — reads expensive."""
    h = int(sprite.height*height)
    ref = sprite.transpose(Image.FLIP_TOP_BOTTOM).crop((0,0,sprite.width,h))
    a = np.asarray(ref.split()[-1], np.float32)/255.
    fade = np.linspace(1.0, 0.0, h, dtype=np.float32)[:, None]**1.6
    a = (a*fade*opacity*255).astype(np.uint8)
    ref.putalpha(Image.fromarray(a, 'L'))
    ref = ref.filter(ImageFilter.GaussianBlur(blur))
    img.alpha_composite(ref, (int(xy[0]), int(xy[1]+sprite.height)))
