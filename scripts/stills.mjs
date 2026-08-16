#!/usr/bin/env node
/**
 * Renders one still per checkpoint frame so every scene can be reviewed at
 * native 1080x1920 before the full render is attempted.
 *
 * Usage:  node scripts/stills.mjs [frame ...]
 * With no arguments it renders the standard checkpoint set — the key beat of
 * every movement in all six scenes.
 */
import {execFileSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'stills');
mkdirSync(OUT, {recursive: true});

// scene starts: S1 0, S2 240, S3 900, S4 1350, S5 1800, S6 2250
const DEFAULT = [
  40, 130, 200,            // S1 hook: macro, handoff, resolved
  300, 380, 460,           // S2 A: interface stepping
  520, 640, 700,           // S2 B: polar morph
  760, 840,                // S2 C: black rear, both finishes
  940, 1020,               // S3 A: nav labelled
  1090, 1160,              // S3 B: pad/filter
  1230, 1300,              // S3 C: duality figures
  1400, 1490,              // S4 A: EA 4 flex
  1560, 1640,              // S4 B/C
  1730,                    // S4 C late
  1850, 1930,              // S5 A: heritage morph
  1990, 2060,              // S5 B: capsule
  2130, 2200,              // S5 C: finish split
  2290, 2360, 2430, 2500,  // S6: macro, price, url, outro
  2620,                    // final frame region
];

const frames = process.argv.slice(2).length
  ? process.argv.slice(2).map(Number)
  : DEFAULT;

console.log(`Rendering ${frames.length} stills at 1080x1920 ...`);
for (const f of frames) {
  const out = resolve(OUT, `f${String(f).padStart(4, '0')}.png`);
  execFileSync(
    'npx',
    ['remotion', 'still', 'Reel', out, '--frame', String(f), '--image-format=png'],
    {cwd: ROOT, stdio: ['ignore', 'ignore', 'pipe']},
  );
  console.log(`  frame ${String(f).padStart(4)}  ->  stills/f${String(f).padStart(4, '0')}.png`);
}
console.log('Done.');
