"""
Shared campaign furniture — the top brand row and the contact bar.

Both are drawn AFTER grain and vignette so the white logo cards stay pure
white: the vignette dims up to 40% at the corners, which is exactly where the
two marks sit.
"""
import sys
sys.path.insert(0, "/home/user/slides-v3/lib")
from PIL import Image, ImageDraw
import gx
from gx import (S, F, text, load, fit, rounded, logo_card,
                GOLD, GOLD_HI, WHITE, PAPER, SOFT)

M, BAR_TOP = 118, 1690
WEB = "www.shivanshelectronics.in"
SOCIAL = [('youtube','youtube.com/@shivanshelectronics-in'),
          ('instagram','instagram.com/@shivanshelectronics.in'),
          ('facebook','facebook.com/@shivanshelectronics.in'),
          ('linkedin','linkedin.com/@shivanshelectronics-in')]
WA = ["+91 98316 62458", "+91 91477 00677", "+91 89818 07755"]

_ic = {}
def icon(n, h):
    if (n, h) not in _ic: _ic[(n, h)] = fit(load(f"iconc_{n}.png"), h=h)
    return _ic[(n, h)]

def top_row(img, pill="AUTHORIZED PARTNER"):
    lw, lh = logo_card(img, "logo_neumann_plate.png", 64, (M, 112), pad=20)
    if pill:
        w = 452
        rounded(img, [M+lw+32, 112, M+lw+32+w, 112+lh], lh//2,
                fill=(214,168,92,40), outline=(214,168,92,165), ow=3)
        text(img, (M+lw+32+w//2, 112+lh/2+2), pill, F("Archivo-800", 26),
             GOLD_HI, 5.4, "mm")

def contact_bar(img, marks=True):
    """marks=False leaves the two logo areas empty for artwork added later."""
    bar = Image.new('RGBA', (S, S-BAR_TOP), (0,0,0,0))
    ImageDraw.Draw(bar).rectangle([0,0,S,S-BAR_TOP], fill=(5,5,7,246))
    img.alpha_composite(bar, (0, BAR_TOP))
    ImageDraw.Draw(img).rectangle([0, BAR_TOP, S, BAR_TOP+6], fill=(214,168,92,255))

    # The logo column stays reserved whether or not a mark is drawn in it, so
    # the contact block sits at the same x on every slide.
    wx = 558
    if marks:
        sw, sh = logo_card(img, "logo_shivansh_plate.png", 88, (M, BAR_TOP+56), pad=18)
        text(img, (M, BAR_TOP+56+sh+38), "KOLKATA, INDIA", F("Archivo-800", 25), GOLD, 5.4)

    # Sizes are the largest that keep every line unwrapped inside its column:
    # website 58, handles 46, numbers 42 — measured, not guessed.
    gi = fit(load('iconw_website.png'), h=56)   # white globe; the mono glyph
    img.alpha_composite(gi, (wx, BAR_TOP+50))   # would vanish on the dark bar
    text(img, (wx+gi.width+22, BAR_TOP+50+28), WEB, F("Archivo-800", 58), WHITE, 0.4, "lm")
    for i, (k, s) in enumerate(SOCIAL):
        cy = BAR_TOP + 172 + i*62
        ic = icon(k, 44)
        img.alpha_composite(ic, (wx, int(cy-ic.height/2)))
        text(img, (wx+ic.width+18, cy), s, F("Archivo-700", 46), WHITE, 0.1, "lm")

    xc = 1600
    ImageDraw.Draw(img).rectangle([xc-58, BAR_TOP+56, xc-55, S-88], fill=(255,255,255,46))
    wi = icon('whatsapp', 56)
    img.alpha_composite(wi, (xc, BAR_TOP+170 - wi.height//2))
    for i, n in enumerate(WA):
        text(img, (xc+wi.width+22, BAR_TOP+100+i*70), n, F("Archivo-800", 42),
             WHITE, 0.0, "lm")

def finish(img, name, pill="AUTHORIZED PARTNER", marks=True):
    """Photographic treatment first, then the brand furniture on top."""
    gx.grain(img, 3.0); gx.vignette(img, 0.40, 2.0)
    if marks: top_row(img, pill)
    contact_bar(img, marks)
    img.convert('RGB').save(f"/home/user/slides-v3/out/{name}.png",
                            dpi=(300,300), optimize=True)
    print(f"  ✓ {name}.png")
