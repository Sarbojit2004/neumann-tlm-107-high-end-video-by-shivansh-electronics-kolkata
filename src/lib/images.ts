import {staticFile} from 'remotion';

/**
 * The reel's image registry.
 *
 * The repository holds 55 images. The brief's Section 11 says 57 — that
 * discrepancy is real and is documented in ASSET_LEDGER.md; 55 is what the
 * git index actually contains.
 *
 * Inspecting every file (rather than trusting the two filename conventions)
 * shows the set is a mixed Neumann catalogue, not 55 TLM 107 photographs. It
 * is therefore split in two:
 *
 *   PRODUCT (31) — genuine TLM 107 / EA 4 Studio Set material. Shown as real
 *   content in the primary safe area, with the full camera language applied.
 *
 *   AMBIENT (24) — 5 images containing a wooden presentation box (which the
 *   Studio Set does not include, and which must never appear) and 19 images
 *   of other Neumann products entirely (TLM 103, U 87, M 149, U 67, NDH
 *   headphones, KH monitors, MCM clip mic, MA 1). Wooden-box regions are
 *   cropped away and every frame is dissolved to unidentifiable paper-toned
 *   texture by scripts/prep_media.py. They appear ONLY as defocused fill in
 *   the non-critical top (0–250px) and bottom (1580–1920px) bands, are never
 *   identified, never narrated, and never carry a product claim — so the reel
 *   covers all 55 files without implying a catalogue or an ecosystem.
 */

export const PRODUCT = [
  'ea4-black',
  'ea4-nickel',
  'studio-sepia',
  'nickel-stand',
  'nickel-front',
  'macro-grille',
  'black-dark',
  'nav-labelled',
  'ea4-exploded',
  'black-front',
  'nickel-swivel',
  'nickel-patchbay',
  'black-ea4-a',
  'rear-nickel',
  'rear-black',
  'nickel-tall',
  'polar-diagram',
  'macro-badge-blk',
  'macro-badge-ang',
  'rear-black-ang',
  'black-ea4-b',
  'macro-badge-lo',
  'macro-badge-lo2',
  'rear-black-lo',
  'mesh-abstract',
  'black-tall',
  'macro-xlr',
  'nickel-angled',
  'room-real',
  'rear-black-sm',
  'black-ea4-sm',
] as const;

export type Product = (typeof PRODUCT)[number];

export const AMBIENT = [
  'amb-b1', 'amb-b2', 'amb-b3', 'amb-b4', 'amb-b5',
  'amb-c01', 'amb-c02', 'amb-c03', 'amb-c04', 'amb-c05', 'amb-c06', 'amb-c07',
  'amb-c08', 'amb-c09', 'amb-c10', 'amb-c11', 'amb-c12', 'amb-c13', 'amb-c14',
  'amb-c15', 'amb-c16', 'amb-c17', 'amb-c18', 'amb-c19',
] as const;

export type Ambient = (typeof AMBIENT)[number];

export const img = (s: Product): string => staticFile(`img/${s}.png`);
export const amb = (s: Ambient): string => staticFile(`ambient/${s}.jpg`);

/**
 * Images whose source has a dark backdrop. They are composited inside a
 * contained plate rather than floated on the paper ground, so the reel's
 * background stays light everywhere while these keep their deep blacks —
 * which is exactly what the brief's Section 6 asks for on the black finish.
 */
export const DARK_PLATE: ReadonlySet<string> = new Set<string>([
  'black-dark',
  'nav-labelled',
  'macro-badge-ang',
  'macro-badge-lo2',
  'mesh-abstract',
  'nickel-patchbay',
  'studio-sepia',
  'polar-diagram',
  'room-real',
  'macro-badge-blk',
  'rear-nickel',
  'rear-black',
  'rear-black-ang',
  'rear-black-lo',
  'macro-badge-lo',
]);

/** Native pixel size of each prepared product image, for correct fitting. */
export const SIZE: Record<Product, {w: number; h: number}> = {
  'ea4-black': {w: 1500, h: 1500},
  'ea4-nickel': {w: 1500, h: 1500},
  'studio-sepia': {w: 951, h: 1500},
  'nickel-stand': {w: 1200, h: 1600},
  'nickel-front': {w: 1500, h: 1500},
  'macro-grille': {w: 1499, h: 1345},
  'black-dark': {w: 1500, h: 1125},
  'nav-labelled': {w: 1500, h: 807},
  'ea4-exploded': {w: 1500, h: 1500},
  'black-front': {w: 1500, h: 1500},
  'nickel-swivel': {w: 1160, h: 1500},
  'nickel-patchbay': {w: 1200, h: 1500},
  'black-ea4-a': {w: 1500, h: 1500},
  'rear-nickel': {w: 1500, h: 1126},
  'rear-black': {w: 1500, h: 1126},
  'nickel-tall': {w: 888, h: 1500},
  'polar-diagram': {w: 1475, h: 1500},
  'macro-badge-blk': {w: 1500, h: 998},
  'macro-badge-ang': {w: 1500, h: 998},
  'rear-black-ang': {w: 1500, h: 998},
  'black-ea4-b': {w: 1500, h: 1500},
  'macro-badge-lo': {w: 1350, h: 900},
  'macro-badge-lo2': {w: 1350, h: 900},
  'rear-black-lo': {w: 1350, h: 900},
  'mesh-abstract': {w: 1600, h: 770},
  'black-tall': {w: 941, h: 1500},
  'macro-xlr': {w: 1499, h: 1382},
  'nickel-angled': {w: 915, h: 1500},
  'room-real': {w: 738, h: 555},
  'rear-black-sm': {w: 675, h: 675},
  'black-ea4-sm': {w: 669, h: 678},
};
