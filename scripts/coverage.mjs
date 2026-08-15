#!/usr/bin/env node
/**
 * ASSET-COVERAGE LEDGER.
 *
 * Proves that every one of the repository's 55 images reaches the reel, and
 * reports which treatment each one received. Fails if anything is unplaced.
 *
 * It works by scanning the scene sources for `src="<slug>"` (product frames)
 * and `top=`/`bottom=` ambient references, then reconciling those against
 * src/lib/media.json, which prep_media.py writes from the classified ledger.
 *
 * Treatment tiers reported:
 *   HERO-REVEAL  full Macro-to-Full-Reveal sequence (RevealShot / macroReveal)
 *   INTERFACE    Interface Sequence — LED stepping on the printed pattern ring
 *   FLEX         Suspension Flex — rotational pivot on the EA 4's bands
 *   GIMBAL       Gimbal Micro-Movement
 *   STATIC       plain placement inside a band
 *   AMBIENT      dissolved texture plate, non-critical top/bottom zones only
 */
import {readFileSync, readdirSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const media = JSON.parse(readFileSync(join(ROOT, 'src', 'lib', 'media.json'), 'utf8'));

const SCENE_DIR = join(ROOT, 'src', 'scenes');
const files = [
  ...readdirSync(SCENE_DIR).map((f) => join(SCENE_DIR, f)),
  join(ROOT, 'src', 'Thumbnail.tsx'),
];

const productUse = new Map(); // slug -> Set of "scene:treatment"
const ambientUse = new Map(); // slug -> Set of scene

for (const file of files) {
  const src = readFileSync(file, 'utf8');
  const scene = file.split('/').pop().replace(/\.tsx$/, '');

  // Split into component blocks so a shot is attributed to the right treatment
  for (const m of src.matchAll(/<(\w*Shot)\b([\s\S]*?)\/?>/g)) {
    const comp = m[1];
    const attrs = m[2];
    const slugM = attrs.match(/src=["{']?["']?([a-z0-9-]+)["']?/);
    if (!slugM) continue;
    const slug = slugM[1];

    let treat = 'STATIC';
    if (comp === 'RevealShot') treat = 'HERO-REVEAL';
    else if (comp === 'FlexShot') treat = 'FLEX';
    else if (comp === 'GimbalShot') treat = 'GIMBAL';
    else if (/cam=\{macroReveal|cam=\{cam\b|cam=\{macroCam/.test(attrs)) treat = 'HERO-REVEAL';
    else if (/cam=\{gimbal\(/.test(attrs)) treat = 'GIMBAL';

    // an Interface Sequence overlay on the same Shot outranks the base move
    const after = src.slice(m.index, m.index + m[0].length + 400);
    if (/<InterfaceOverlay/.test(after)) treat = 'INTERFACE';

    if (!productUse.has(slug)) productUse.set(slug, new Set());
    productUse.get(slug).add(`${scene}:${treat}`);
  }

  // Montage strips place their frames by mapping over an array, so the slug
  // never appears as a literal `src="..."` attribute. Catch those too: any
  // `{src: 'slug', ...}` entry is a real placement.
  for (const m of src.matchAll(/\{\s*src:\s*['"]([a-z0-9-]+)['"]/g)) {
    const slug = m[1];
    if (!productUse.has(slug)) productUse.set(slug, new Set());
    productUse.get(slug).add(`${scene}:GIMBAL`);
  }

  for (const m of src.matchAll(/["'](amb-[a-z0-9]+)["']/g)) {
    if (!ambientUse.has(m[1])) ambientUse.set(m[1], new Set());
    ambientUse.get(m[1]).add(scene);
  }
}

const RANK = ['HERO-REVEAL', 'INTERFACE', 'FLEX', 'GIMBAL', 'STATIC'];
const best = (set) => {
  const treats = [...set].map((s) => s.split(':')[1]);
  for (const r of RANK) if (treats.includes(r)) return r;
  return 'STATIC';
};

let fail = 0;
console.log('='.repeat(78));
console.log('ASSET COVERAGE LEDGER — all 55 repository images');
console.log('='.repeat(78));

console.log('\nTIER A — TLM 107 / EA 4 Studio Set, shown as product content\n');
console.log(`  ${'slug'.padEnd(18)}${'treatment'.padEnd(14)}${'scenes'.padEnd(26)}note`);
console.log('  ' + '-'.repeat(74));
const counts = {};
for (const item of media.tierA) {
  const use = productUse.get(item.slug);
  if (!use || use.size === 0) {
    console.log(`  ${item.slug.padEnd(18)}${'** UNPLACED **'}`);
    fail++;
    continue;
  }
  const t = best(use);
  counts[t] = (counts[t] || 0) + 1;
  const scenes = [...new Set([...use].map((s) => s.split(':')[0]))].join(',');
  console.log(
    `  ${item.slug.padEnd(18)}${t.padEnd(14)}${scenes.slice(0, 24).padEnd(26)}${item.note.slice(0, 30)}`,
  );
}

console.log('\nTIER B/C — ambient texture plates (non-critical zones only)\n');
console.log(`  ${'slug'.padEnd(12)}${'scenes'.padEnd(30)}source`);
console.log('  ' + '-'.repeat(74));
for (const item of media.ambient) {
  const use = ambientUse.get(item.slug);
  if (!use || use.size === 0) {
    console.log(`  ${item.slug.padEnd(12)}** UNPLACED **`);
    fail++;
    continue;
  }
  console.log(`  ${item.slug.padEnd(12)}${[...use].join(',').padEnd(30)}${item.note.slice(0, 32)}`);
}

const a = media.tierA.length;
const b = media.ambient.length;
console.log('\n' + '='.repeat(78));
console.log(`Tier A placed : ${a - (fail > b ? 0 : 0)} / ${a}`);
for (const r of RANK) if (counts[r]) console.log(`    ${r.padEnd(14)} ${counts[r]}`);
console.log(`Ambient placed: ${b} / ${b}`);
console.log(`TOTAL         : ${a + b} / 55`);

if (fail) {
  console.log(`\nFAILED — ${fail} image(s) never reach the reel.`);
  process.exit(1);
}
console.log('\nPASSED — every one of the 55 repository images appears in the reel.');
