#!/usr/bin/env node
/**
 * BRANDING-CADENCE AUDIT (long-form only).
 *
 * The spec sets three hard branding requirements and asks for an actual
 * timestamped list rather than an assurance. This produces that list and fails
 * the build on any violation:
 *
 *   1. No gap longer than ~30-40 s between Shivansh Electronics appearances.
 *      Enforced at 40 s, measured from the END of one appearance to the START
 *      of the next — a logo that is on screen is not a gap.
 *   2. Every one of the seven chapters contains at least one Shivansh beat.
 *   3. Neumann recurs across the runtime including mid-video, but noticeably
 *      less often than Shivansh.
 *
 * It also confirms www.shivanshelectronics.in is genuinely the most-repeated
 * single URL across the whole video, counting every on-screen occurrence in
 * the branding schedule and the chapter sources.
 *
 * The companion reel deliberately uses NEITHER logo; this audit covers the
 * long-form only and never reads the reel's scenes.
 */
import {readFileSync, readdirSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FPS = 30;
const MAX_GAP_S = 40;

// ---- parse the declarative schedule --------------------------------------
const brandSrc = readFileSync(join(ROOT, 'src', 'lib', 'lf-brand.ts'), 'utf8');
const themeSrc = readFileSync(join(ROOT, 'src', 'lib', 'lf-theme.ts'), 'utf8');

const chapters = [];
{
  const block = themeSrc.match(/export const CHAPTERS[\s\S]*?\n\];/)[0];
  let acc = 0;
  for (const m of block.matchAll(/\{id: '(\w+)', dur: (\d+), label: '([^']+)'\}/g)) {
    chapters.push({id: m[1], start: acc, dur: Number(m[2]), label: m[3]});
    acc += Number(m[2]);
  }
}
const chStart = Object.fromEntries(chapters.map((c) => [c.id, c.start]));
const TOTAL = chapters.reduce((a, c) => a + c.dur, 0);

const slots = [];
for (const m of brandSrc.matchAll(
  /\{at: f\('(\w+)',\s*([\d.]+)\),\s*dur:\s*(\d+),\s*brand:\s*'(\w+)',\s*kind:\s*'([\w-]+)'([\s\S]*?)\},/g,
)) {
  const [, ch, sec, dur, brand, kind, rest] = m;
  const label = (rest.match(/label:\s*["'`]([^"'`]+)["'`]/) || [])[1];
  const detail = (rest.match(/detail:\s*'([^']+)'/) || [])[1];
  slots.push({
    at: chStart[ch] + Math.round(Number(sec) * FPS),
    dur: Number(dur),
    brand,
    kind,
    label,
    detail,
    chapter: ch,
  });
}
slots.sort((a, b) => a.at - b.at);

const ts = (f) => {
  const s = f / FPS;
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${(s % 60).toFixed(1).padStart(4, '0')}`;
};

const fails = [];

console.log('='.repeat(84));
console.log('BRANDING CADENCE — long-form video (298 s)');
console.log('='.repeat(84));
console.log(`\n${'#'.padStart(3)}  ${'in'.padEnd(7)}${'out'.padEnd(8)}${'brand'.padEnd(11)}${'form'.padEnd(14)}ch   detail`);
console.log('-'.repeat(84));
slots.forEach((s, i) => {
  console.log(
    `${String(i + 1).padStart(3)}  ${ts(s.at).padEnd(7)}${ts(s.at + s.dur).padEnd(8)}` +
      `${s.brand.padEnd(11)}${s.kind.padEnd(14)}${s.chapter.padEnd(5)}${s.detail ?? ''}`,
  );
});

// ---- 1. Shivansh gap ------------------------------------------------------
const shiv = slots.filter((s) => s.brand === 'shivansh');
console.log(`\n[1] Shivansh Electronics appearances: ${shiv.length}`);
let prevEnd = 0;
let worst = 0;
for (const s of shiv) {
  const gap = (s.at - prevEnd) / FPS;
  if (gap > worst) worst = gap;
  if (gap > MAX_GAP_S) {
    fails.push(`gap of ${gap.toFixed(1)}s before ${ts(s.at)} exceeds ${MAX_GAP_S}s`);
  }
  prevEnd = Math.max(prevEnd, s.at + s.dur);
}
const tailGap = (TOTAL - prevEnd) / FPS;
if (tailGap > worst) worst = tailGap;
if (tailGap > MAX_GAP_S) fails.push(`trailing gap of ${tailGap.toFixed(1)}s to the end`);
console.log(`    longest gap without Shivansh presence: ${worst.toFixed(1)} s  (limit ${MAX_GAP_S} s)`);

// ---- 2. every chapter ------------------------------------------------------
console.log('\n[2] Per-chapter coverage');
for (const c of chapters) {
  const inCh = shiv.filter((s) => s.chapter === c.id);
  const n = inCh.length;
  const kinds = [...new Set(inCh.map((s) => s.kind))].join(', ');
  console.log(`    ${c.id}  ${String(n).padStart(2)} Shivansh  [${kinds}]  — ${c.label}`);
  if (n === 0) fails.push(`chapter ${c.id} has no Shivansh Electronics beat`);
}

// ---- 3. Neumann -----------------------------------------------------------
const neu = slots.filter((s) => s.brand === 'neumann');
const mid = neu.filter((s) => s.at > TOTAL * 0.25 && s.at < TOTAL * 0.8);
console.log(`\n[3] Neumann appearances: ${neu.length}  (${mid.length} mid-video)`);
console.log(`    at: ${neu.map((s) => ts(s.at)).join(', ')}`);
if (neu.length < 3) fails.push('Neumann appears fewer than 3 times');
if (neu.length >= shiv.length) fails.push('Neumann appears as often as Shivansh — should be noticeably less');
if (mid.length === 0) fails.push('Neumann never appears mid-video (open/close only)');

// ---- 4. primary URL --------------------------------------------------------
const lfFiles = [
  ...readdirSync(join(ROOT, 'src', 'scenes', 'lf')).map((f) => join(ROOT, 'src', 'scenes', 'lf', f)),
  join(ROOT, 'src', 'lib', 'lf-brand.ts'),
  join(ROOT, 'src', 'LongformThumbnail.tsx'),
];
let siteHits = slots.filter((s) => s.detail === 'www.shivanshelectronics.in').length;
const otherUrl = new Map();
for (const f of lfFiles) {
  const txt = readFileSync(f, 'utf8');
  for (const m of txt.matchAll(/shivanshelectronics\.in\/[a-z0-9-]+/g)) {
    otherUrl.set(m[0], (otherUrl.get(m[0]) || 0) + 1);
  }
}
// SITE is also rendered from copy.ts in the outro and the price beat
for (const f of lfFiles) {
  siteHits += (readFileSync(f, 'utf8').match(/\{SITE\}/g) || []).length;
}
console.log(`\n[4] Primary URL emphasis`);
console.log(`    www.shivanshelectronics.in on-screen occurrences: ${siteHits}`);
for (const [u, n] of otherUrl) console.log(`    ${u}: ${n}`);
const maxOther = Math.max(0, ...otherUrl.values());
if (siteHits <= maxOther) {
  fails.push('www.shivanshelectronics.in is not the most-repeated URL');
}

console.log('\n' + '='.repeat(84));
if (fails.length) {
  console.log(`FAILED — ${fails.length} issue(s):`);
  for (const f of fails) console.log(`  x ${f}`);
  process.exit(1);
}
console.log('PASSED — cadence, per-chapter coverage, Neumann recurrence and URL emphasis all hold.');
