"""
THE BRANDING BLOCK — light ground, real brand colour.

Every mark here is the client's actual artwork at its true colour: the logos
with only their white carrier plate keyed away, and all six social icons in
full brand colour. Nothing is recoloured or redrawn.

Three zones under a hairline: the two logos and the partner line on top; then
the primary URL, the four social handles, and all three WhatsApp numbers
grouped as one cluster under a single glyph.
"""
from PIL import Image
import ds2
from ds2 import (S, MARGIN, CONTENT, PAPER_LO, HAIR, INK, INK2, MUTED, RED,
                 ORANGE, F, text, tw, rule, vrule, load, fit, micro)

WEB  = "www.shivanshelectronics.in"
FB   = "facebook.com/@shivanshelectronics.in"
IG   = "instagram.com/@shivanshelectronics.in"
LI   = "linkedin.com/@shivanshelectronics-in"
YT   = "youtube.com/@shivanshelectronics-in"
WA   = ["+91 98316 62458", "+91 91477 00677", "+91 89818 07755"]
PARTNER = "NEUMANN'S AUTHORIZED PARTNER"
CITY    = "KOLKATA, INDIA"

TOP    = ds2.FOOT_TOP
LOGO_Y = 1676
DIV_Y  = 1838
ROW_Y  = 1884
LEAD   = 46

# optical normalisation — bounding boxes differ, perceived weight must not
_OPT = {'website': 1.00, 'facebook': 0.98, 'instagram': 0.94,
        'linkedin': 0.94, 'youtube': 0.80, 'whatsapp': 1.00}
_ic = {}

def icon(name, h):
    k = (name, h)
    if k not in _ic:
        _ic[k] = fit(load(f"iconc_{name}.png"), h=h*_OPT[name])
    return _ic[k]

def _line(img, x, y, ic, s, font, colour, track=0.0, gap=18, ih=34):
    g = icon(ic, ih)
    img.alpha_composite(g, (int(x), int(y - g.height/2)))
    text(img, (x + g.width + gap, y), s, font, colour, track, "lm")

def draw(img):
    """The mandatory block. Identical on all ten slides."""
    rule(img, MARGIN, TOP, S-MARGIN, HAIR, 2, 0.95)
    rule(img, MARGIN, TOP, MARGIN+132, ORANGE, 4, 1.0)   # brand tick, graphic only

    # --- logos, in their real colours -------------------------------------
    sh = fit(load("logoc_shivansh.png"), h=92)
    img.alpha_composite(sh, (MARGIN, LOGO_Y))
    nm = fit(load("logoc_neumann.png"), h=76)
    img.alpha_composite(nm, (S-MARGIN-nm.width, LOGO_Y+12))

    y2 = LOGO_Y + 92 + 38
    x = micro(img, (MARGIN, y2), PARTNER, 26, RED, 700, 0.16)
    text(img, (MARGIN + x + 28, y2), "·", F("Archivo-700", 26), MUTED, 0, "ls")
    micro(img, (MARGIN + x + 54, y2), CITY, 26, MUTED, 600, 0.16)

    rule(img, MARGIN, DIV_Y, S-MARGIN, HAIR, 2, 0.55)

    # --- zone A: the primary URL ------------------------------------------
    _line(img, MARGIN, ROW_Y + LEAD*1.5, 'website', WEB,
          F("Archivo-600", 36), INK, 0.2, gap=22, ih=46)

    # --- zone B: the four social handles ----------------------------------
    xb = MARGIN + 700
    vrule(img, xb - 62, ROW_Y - 20, ROW_Y + LEAD*3 + 24, HAIR, 2, 0.65)
    # order fixed by the client: YouTube, Instagram, Facebook, LinkedIn
    for i, (ic, s) in enumerate((('youtube', YT), ('instagram', IG),
                                 ('facebook', FB), ('linkedin', LI))):
        _line(img, xb, ROW_Y + i*LEAD, ic, s, F("Archivo-450", 27), INK2, 0.1,
              gap=18, ih=33)

    # --- zone C: all three WhatsApp numbers, one glyph, one cluster -------
    xc = S - MARGIN - 400
    vrule(img, xc - 62, ROW_Y - 20, ROW_Y + LEAD*3 + 24, HAIR, 2, 0.65)
    g = icon('whatsapp', 46)
    img.alpha_composite(g, (int(xc), int(ROW_Y + LEAD*1.5 - g.height/2)))
    tx = xc + g.width + 22
    for i, n in enumerate(WA):
        text(img, (tx, ROW_Y + LEAD*0.5 + i*LEAD), n, F("Archivo-600", 29),
             INK if i == 0 else INK2, 1.2, "lm")
