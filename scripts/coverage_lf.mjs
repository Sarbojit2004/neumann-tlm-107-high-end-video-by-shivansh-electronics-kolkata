#!/usr/bin/env node
/**
 * LONG-FORM ASSET-COVERAGE LEDGER.
 *
 * The long-form video's coverage requirement is INDEPENDENT of the reel's, not
 * shared with it: a viewer who watches only the long-form must see all 55
 * repository images, and so must a viewer who watches only the reel. This
 * script therefore scans src/scenes/lf/ and the long-form roots ONLY, and
 * fails if any image never reaches this deliverable.
 */
import {readFileSync, readdirSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const media = JSON.parse(readFileSync(join(ROOT, 'src', 'lib', 'media.json'), 'utf8'));

const LF_DIR = join(ROOT, 'src', 'scenes', 'lf');
const files = [
  ...readdirSync(LF_DIR).map((f) => join(LF_DIR, f)),
  join(ROOT, 'src', 'Longform.tsx'),
  join(ROOT, 'src', 'LongformThumbnail.tsx'),
  join(ROOT, 'src', 'components', 'lf', 'LFLayouts.tsx'),
];

const productUse = new Map();
const ambientUse = new Map();

const RANK = ['HERO-REVEAL', 'INTERFACE', 'FLEX', 'GIMBAL', 'STATIC'];

for (const file of files) {
  const src = readFileSync(file, 'utf8');
  const scene = file.split('/').pop().replace(/\.tsx$/, '');

  // <Shot src="slug" ...> and <GimbalShot src="slug" ...>
  for (const m of src.matchAll(/<(\w*Shot)\b([\s\S]*?)\/?>/g)) {
    const attrs = m[1] === 'Shot' || m[1].endsWith('Shot') ? m[2] : '';
    const slugM = attrs.match(/src=["{']?["']?([a-z0-9-]+)["']?/);
    if (!slugM) continue;
    const slug = slugM[1];
    let treat = 'STATIC';
    if (/cam=\{macroReveal|cam=\{cam\b/.test(attrs)) treat = 'HERO-REVEAL';
    else if (/cam=\{gimbal\(/.test(attrs)) treat = 'GIMBAL';
    else if (/cam=\{flex|rot=\{flex/.test(attrs)) treat = 'FLEX';
    const after = src.slice(m.index, m.index + m[0].length + 400);
    if (/<InterfaceOverlay/.test(after)) treat = 'INTERFACE';
    if (!productUse.has(slug)) productUse.set(slug, new Set());
    productUse.get(slug).add(`${scene}:${treat}`);
  }

  // layout-component props: src="slug" / srcs={['a','b','c']}
  for (const m of src.matchAll(/\bsrc=["']([a-z0-9-]+)["']/g)) {
    const slug = m[1];
    const ctx = src.slice(Math.max(0, m.index - 400), m.index + 200);
    let treat = 'STATIC';
    if (/cam=["']reveal["']/.test(ctx)) treat = 'HERO-REVEAL';
    else if (/cam=["']flex["']/.test(ctx)) treat = 'FLEX';
    else if (/cam=["']gimbal["']|SplitBeat|HeroBeat|StatBeat/.test(ctx)) treat = 'GIMBAL';
    if (!productUse.has(slug)) productUse.set(slug, new Set());
    productUse.get(slug).add(`${scene}:${treat}`);
  }
  for (const m of src.matchAll(/srcs=\{\[([^\]]+)\]\}/g)) {
    for (const s of m[1].matchAll(/['"]([a-z0-9-]+)['"]/g)) {
      if (!productUse.has(s[1])) productUse.set(s[1], new Set());
      productUse.get(s[1]).add(`${scene}:GIMBAL`);
    }
  }

  // Beats that map over an inline list place real images too, but the slug
  // never appears as a `src="..."` attribute. Both spellings are used:
  //   (['macro-badge-lo', 'macro-badge-lo2'] as const).map(...)
  //   [{src: 'rear-black-lo', i: 0}, ...].map(...)
  // Missing these reported four genuinely-placed images as unplaced.
  const known = new Set(media.tierA.map((x) => x.slug));
  for (const m of src.matchAll(/\{\s*src:\s*['"]([a-z0-9-]+)['"]/g)) {
    if (!productUse.has(m[1])) productUse.set(m[1], new Set());
    productUse.get(m[1]).add(`${scene}:GIMBAL`);
  }
  for (const m of src.matchAll(/\(\s*\[([^\]]*?)\]\s*as const\s*\)/g)) {
    for (const s of m[1].matchAll(/['"]([a-z0-9-]+)['"]/g)) {
      if (!known.has(s[1])) continue;
      if (!productUse.has(s[1])) productUse.set(s[1], new Set());
      productUse.get(s[1]).add(`${scene}:GIMBAL`);
    }
  }

  for (const m of src.matchAll(/["'](amb-[a-z0-9]+)["']/g)) {
    if (!ambientUse.has(m[1])) ambientUse.set(m[1], new Set());
    ambientUse.get(m[1]).add(scene);
  }
}

const best = (set) => {
  const treats = [...set].map((s) => s.split(':')[1]);
  for (const r of RANK) if (treats.includes(r)) return r;
  return 'STATIC';
};

let fail = 0;
console.log('='.repeat(80));
console.log('LONG-FORM ASSET COVERAGE — independent of the reel');
console.log('='.repeat(80));

console.log('\nTIER A — TLM 107 / EA 4 Studio Set, shown as product content\n');
console.log(`  ${'slug'.padEnd(18)}${'treatment'.padEnd(14)}${'chapters'.padEnd(30)}`);
console.log('  ' + '-'.repeat(72));
const counts = {};
for (const item of media.tierA) {
  const use = productUse.get(item.slug);
  if (!use || use.size === 0) {
    console.log(`  ${item.slug.padEnd(18)}** UNPLACED **`);
    fail++;
    continue;
  }
  const t = best(use);
  counts[t] = (counts[t] || 0) + 1;
  const chapters = [...new Set([...use].map((s) => s.split(':')[0]))].join(',');
  console.log(`  ${item.slug.padEnd(18)}${t.padEnd(14)}${chapters.slice(0, 28).padEnd(30)}`);
}

console.log('\nTIER B/C — ambient texture plates (background wash only)\n');
for (const item of media.ambient) {
  const use = ambientUse.get(item.slug);
  if (!use || use.size === 0) {
    console.log(`  ${item.slug.padEnd(12)}** UNPLACED **`);
    fail++;
    continue;
  }
  console.log(`  ${item.slug.padEnd(12)}${[...use].join(',')}`);
}

const a = media.tierA.length;
const b = media.ambient.length;
console.log('\n' + '='.repeat(80));
console.log(`Tier A  : ${a} images`);
for (const r of RANK) if (counts[r]) console.log(`    ${r.padEnd(14)} ${counts[r]}`);
console.log(`Ambient : ${b} plates`);
console.log(`TOTAL   : ${a + b} / 55`);

if (fail) {
  console.log(`\nFAILED — ${fail} image(s) never reach the long-form video.`);
  process.exit(1);
}
console.log('\nPASSED — every one of the 55 repository images appears in the long-form video.');
