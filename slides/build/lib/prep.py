"""Asset preparation: icon glyph masks, reversed logos, matted product cutouts."""
import os, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
Image.MAX_IMAGE_PIXELS = None

REPO = "/home/user/neumann-tlm-107-high-end-video-by-shivansh-electronics-kolkata"
OUT  = "/home/user/slides-build/assets"
os.makedirs(OUT, exist_ok=True)

def _save_mask(mask, path, trim=True, pad=0.0):
    """mask: float 0..1 -> save as L-channel PNG, tightly trimmed."""
    m = np.clip(mask, 0, 1)
    if trim:
        ys, xs = np.where(m > 0.06)
        if len(ys):
            y0, y1, x0, x1 = ys.min(), ys.max()+1, xs.min(), xs.max()+1
            if pad:
                py = int((y1-y0)*pad); px = int((x1-x0)*pad)
                y0 = max(0, y0-py); x0 = max(0, x0-px)
                y1 = min(m.shape[0], y1+py); x1 = min(m.shape[1], x1+px)
            m = m[y0:y1, x0:x1]
    Image.fromarray((m*255).astype(np.uint8), 'L').save(path)
    return m.shape

# ---------------------------------------------------------------- ICONS
def prep_icons():
    """Each brand icon -> a single-tone glyph mask.

    The colour-on-shape icons (Facebook, Instagram, YouTube, WhatsApp) are
    reduced to their solid silhouette with the white interior mark knocked
    OUT, which is the standard monochrome lockup for these marks. The website
    icon ships as black art on a *painted* checkerboard (no real alpha), so it
    is keyed on luminance instead.
    """
    specs = {
        'whatsapp':  ('WHATSAPP ICON.png',  'alpha_minus_white'),
        'facebook':  ('FACEBOOK ICON.png',  'alpha_minus_white'),
        'instagram': ('INSTAGRAM ICON.webp','alpha_minus_white'),
        'youtube':   ('YOUTUBE ICON.png',   'alpha_minus_white'),
        'website':   ('WEBSITE ICON.png',   'dark_on_checker'),
    }
    for name, (fn, mode) in specs.items():
        im = Image.open(os.path.join(REPO, 'all-icons', fn)).convert('RGBA')
        # supersample for clean edges
        im = im.resize((im.width*2, im.height*2), Image.LANCZOS)
        a = np.asarray(im).astype(np.float32)/255.0
        rgb, al = a[..., :3], a[..., 3]
        lum = rgb @ np.array([0.2126, 0.7152, 0.0722], np.float32)
        if mode == 'alpha_minus_white':
            sat = rgb.max(-1) - rgb.min(-1)
            white = np.clip((lum-0.72)/0.20, 0, 1) * np.clip(1-(sat/0.16), 0, 1)
            mask = al * (1.0 - white)
        else:
            mask = np.clip((0.55-lum)/0.35, 0, 1)
        mask = np.asarray(Image.fromarray((mask*255).astype(np.uint8),'L')
                          .filter(ImageFilter.GaussianBlur(1.0)), np.float32)/255.0
        sh = _save_mask(mask, f"{OUT}/icon_{name}.png")
        print(f"  icon {name:<10} {sh[1]}x{sh[0]}")

# ---------------------------------------------------------------- LOGOS
def prep_logos():
    """Both logos are dark artwork on an opaque white plate. Produce a reversed
    (knockout) mask so the mark can be laid straight onto the dark ground with
    its internal tonal hierarchy intact."""
    for name, fn in (('shivansh','SHIVANSH ELECTRONICS LOGO FOR VIDEO.png'),
                     ('neumann','NEUMANN BERLIN LOGO.png')):
        im = Image.open(os.path.join(REPO, fn)).convert('RGBA')
        im = im.resize((im.width*2, im.height*2), Image.LANCZOS)
        a = np.asarray(im).astype(np.float32)/255.0
        rgb, al = a[..., :3], a[..., 3]
        lum = rgb @ np.array([0.2126, 0.7152, 0.0722], np.float32)
        mask = (1.0 - lum) * al           # dark ink -> opaque, white plate -> nil
        mask = np.clip((mask - 0.05)/0.80, 0, 1)
        sh = _save_mask(mask, f"{OUT}/logo_{name}.png")
        print(f"  logo {name:<10} {sh[1]}x{sh[0]}")

# ---------------------------------------------------------------- MATTING
def matte_white_bg(path, out, thresh=0.90, feather=1.6, supersample=2):
    """Key a product shot off its white studio sweep.

    Flood-fills the near-white region inward from the border so white detail
    *inside* the product (the brushed ring, printed text) is never eaten.
    """
    im = Image.open(os.path.join(REPO, path)).convert('RGB')
    if supersample > 1:
        im = im.resize((im.width*supersample, im.height*supersample), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32)/255.0
    lum = a @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    sat = a.max(-1) - a.min(-1)
    near_white = (lum > thresh) & (sat < 0.10)
    # keep only the near-white blobs touching the frame border
    lab, n = ndimage.label(near_white)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:,0], lab[:,-1]])))
    border.discard(0)
    bg = np.isin(lab, list(border)) if border else np.zeros_like(near_white)
    alpha = (~bg).astype(np.float32)
    # soft edge: blend using how white each pixel is, only near the boundary
    edge = ndimage.binary_dilation(bg, iterations=2) & ~bg
    soft = np.clip((lum - (thresh-0.10)) / 0.12, 0, 1)
    alpha[edge] = np.minimum(alpha[edge], 1.0 - soft[edge])
    alpha = np.asarray(Image.fromarray((alpha*255).astype(np.uint8),'L')
                       .filter(ImageFilter.GaussianBlur(feather)), np.float32)/255.0
    alpha = np.clip((alpha-0.30)/0.55, 0, 1)
    rgba = np.dstack([a, alpha])
    ys, xs = np.where(alpha > 0.05)
    y0,y1,x0,x1 = ys.min(), ys.max()+1, xs.min(), xs.max()+1
    res = Image.fromarray((rgba[y0:y1, x0:x1]*255).astype(np.uint8), 'RGBA')
    res.save(out)
    return res.size

if __name__ == '__main__':
    print("icons:");  prep_icons()
    print("logos:");  prep_logos()
