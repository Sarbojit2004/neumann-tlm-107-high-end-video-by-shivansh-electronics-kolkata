"""Colour asset preparation for the light-ground rebuild.

Logos and icons keep their real artwork colour. Only the white carrier plate
(logos) or the painted checkerboard (website icon) is keyed away, so what
lands on the page is the actual mark, not a recolour of it.
"""
import os, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
Image.MAX_IMAGE_PIXELS = None

NEU  = "/home/user/neumann-tlm-107-high-end-video-by-shivansh-electronics-kolkata"
OUT  = "/home/user/slides-v2/assets"
os.makedirs(OUT, exist_ok=True)

def _trim(im, thr=6):
    a = np.asarray(im)[:, :, 3]
    ys, xs = np.where(a > thr)
    return im.crop((xs.min(), ys.min(), xs.max()+1, ys.max()+1))

def logo_colour(src, dst, ss=2):
    """Drop the white plate, keep every original pixel colour.

    Alpha is derived from how far each pixel departs from white, so the grey
    diamond, the orange chevrons and the black wordmark all survive at their
    true values with soft anti-aliased edges.
    """
    im = Image.open(os.path.join(NEU, src)).convert('RGBA')
    im = im.resize((im.width*ss, im.height*ss), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32)/255.
    rgb, al = a[..., :3], a[..., 3]
    # distance from white drives coverage
    cov = np.clip((1.0 - rgb.min(-1)) * 1.35, 0, 1)
    sat = rgb.max(-1) - rgb.min(-1)
    cov = np.clip(np.maximum(cov, sat*2.2), 0, 1)
    cov = np.clip((cov - 0.04)/0.80, 0, 1) * al
    # un-premultiply against white so colours stay true where coverage is partial
    safe = np.maximum(cov, 1e-3)[..., None]
    true = np.clip((rgb - (1.0 - safe)) / safe, 0, 1)
    out = Image.fromarray((np.dstack([true, cov])*255).astype(np.uint8), 'RGBA')
    _trim(out).save(os.path.join(OUT, dst))
    return Image.open(os.path.join(OUT, dst)).size

def icon_colour(src, dst, mode='alpha', ss=2):
    """Brand icons at full colour. `checker` keys the painted transparency
    grid off the website icon, which ships with no real alpha channel."""
    im = Image.open(os.path.join(NEU, 'all-icons', src)).convert('RGBA')
    im = im.resize((im.width*ss, im.height*ss), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32)/255.
    rgb, al = a[..., :3], a[..., 3]
    if mode == 'checker':
        lum = rgb @ np.array([0.2126, 0.7152, 0.0722], np.float32)
        cov = np.clip((0.62 - lum)/0.34, 0, 1)
        rgb = np.zeros_like(rgb)                     # the mark is solid black art
        out = np.dstack([rgb, cov])
    else:
        out = np.dstack([rgb, al])
    im2 = Image.fromarray((out*255).astype(np.uint8), 'RGBA')
    im2 = im2.filter(ImageFilter.GaussianBlur(0.4))
    _trim(im2).save(os.path.join(OUT, dst))
    return Image.open(os.path.join(OUT, dst)).size

if __name__ == '__main__':
    print("logos:")
    print("  neumann ", logo_colour("NEUMANN BERLIN LOGO.png", "logoc_neumann.png"))
    print("  shivansh", logo_colour("SHIVANSH ELECTRONICS LOGO FOR VIDEO.png", "logoc_shivansh.png"))
    print("icons:")
    for n, f, m in (('facebook','FACEBOOK ICON.png','alpha'),
                    ('instagram','INSTAGRAM ICON.webp','alpha'),
                    ('linkedin','LINKEDIN ICON.png','alpha'),
                    ('youtube','YOUTUBE ICON.png','alpha'),
                    ('whatsapp','WHATSAPP ICON.png','alpha'),
                    ('website','WEBSITE ICON.png','checker')):
        print(f"  {n:<10}", icon_colour(f, f"iconc_{n}.png", m))
