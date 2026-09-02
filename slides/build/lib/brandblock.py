"""
THE BRANDING BLOCK — the one contact system every slide carries.

Designed once and reused at a fixed position so the ten slides read as one
campaign. Three zones divided by hairlines: the two logos and the partner
line on top; below, the primary URL, then the social handles, then the three
WhatsApp numbers grouped as a single cluster under one glyph (never three
repeated icon/number pairs).

Every icon is the client's own supplied asset, reduced to a single-tone glyph
in the palette's off-white rather than its multicolour brand version, so the
strip reads as typography rather than as a sticker bar.
"""
from PIL import Image
import ds
from ds import (S, MARGIN, CONTENT, PAPER, SOFT, DIM, FAINT, BRASS, LINE,
                LINE_HI, F, text, tw, rule, vrule, load, fit, tint_mask, eyebrow)

WEB   = "www.shivanshelectronics.in"
FB    = "facebook.com/@shivanshelectronics.in"
IG    = "instagram.com/@shivanshelectronics.in"
YT    = "youtube.com/@shivanshelectronics-in"
WA    = ["+91 98316 62458", "+91 91477 00677", "+91 89818 07755"]
PARTNER = "NEUMANN'S AUTHORIZED PARTNER"
CITY    = "KOLKATA, INDIA"

TOP      = ds.FOOT_TOP   # main hairline — single source of truth
LOGO_Y   = 1700
DIV_Y    = 1858
ROW_Y    = 1906
LEAD     = 50

# optical normalisation — bounding boxes differ, perceived weight must not
_OPT = {'website': 1.00, 'facebook': 0.96, 'instagram': 0.94,
        'youtube': 0.82, 'whatsapp': 1.00}

_ic = {}
def icon(name, h, color=SOFT, opacity=1.0):
    key = (name, h, color, opacity)
    if key not in _ic:
        m = load(f"icon_{name}.png", alpha=False)
        hh = h*_OPT[name]
        m = fit(m, h=hh)
        _ic[key] = tint_mask(m, color, opacity)
    return _ic[key]

def _line(img, x, y, ic, s, font, color, track=0.0, gap=16, ih=34, icol=None):
    g = icon(ic, ih, icol or color)
    img.alpha_composite(g, (int(x), int(y - g.height/2)))
    text(img, (x + g.width + gap, y), s, font, color, track, "lm")
    return x + g.width + gap + tw(s, font, track)

def draw(img, accent=BRASS):
    """Render the full mandatory block. Identical on all ten slides."""
    # --- top hairline, with a short brass tick marking the campaign ---------
    rule(img, MARGIN, TOP, S-MARGIN, LINE_HI, 2, 0.80)
    rule(img, MARGIN, TOP, MARGIN+128, accent, 2, 0.92)

    # --- row 1: the two logos + the authority line -------------------------
    sh = fit(load("logo_shivansh.png", alpha=False), h=88)
    img.alpha_composite(tint_mask(sh, PAPER, 1.0), (MARGIN, LOGO_Y))
    nm = fit(load("logo_neumann.png", alpha=False), h=74)
    img.alpha_composite(tint_mask(nm, PAPER, 0.94), (S-MARGIN-nm.width, LOGO_Y+9))

    y2 = LOGO_Y + 88 + 36
    x = text(img, (MARGIN, y2), PARTNER, F("JBM-600", 25), accent, 6.2, "ls")
    text(img, (MARGIN + x + 26, y2), "·", F("JBM-600", 25), FAINT, 0, "ls")
    text(img, (MARGIN + x + 56, y2), CITY, F("JBM-500", 25), DIM, 6.2, "ls")

    # --- divider -----------------------------------------------------------
    rule(img, MARGIN, DIV_Y, S-MARGIN, LINE, 2, 0.75)

    # --- row 2, zone A: the primary URL ------------------------------------
    _line(img, MARGIN, ROW_Y + LEAD*0.5, 'website', WEB,
          F("Inter-500", 37), PAPER, 0.2, gap=22, ih=47)

    # --- zone B: the social handles ----------------------------------------
    xb = MARGIN + 725
    vrule(img, xb - 60, ROW_Y - 18, ROW_Y + LEAD*2 + 22, LINE, 2, 0.85)
    for i, (ic, s) in enumerate((('facebook', FB), ('instagram', IG), ('youtube', YT))):
        _line(img, xb, ROW_Y + i*LEAD, ic, s, F("Inter-450", 29), SOFT, 0.1, gap=18, ih=35)

    # --- zone C: all three WhatsApp numbers, one glyph, one cluster --------
    xc = S - MARGIN - 405
    vrule(img, xc - 60, ROW_Y - 18, ROW_Y + LEAD*2 + 22, LINE, 2, 0.85)
    g = icon('whatsapp', 45, PAPER)
    img.alpha_composite(g, (int(xc), int(ROW_Y + LEAD - g.height/2)))
    tx = xc + g.width + 20
    for i, n in enumerate(WA):
        text(img, (tx, ROW_Y + i*LEAD), n, F("JBM-500", 29),
             PAPER if i == 0 else SOFT, 0.4, "lm")
