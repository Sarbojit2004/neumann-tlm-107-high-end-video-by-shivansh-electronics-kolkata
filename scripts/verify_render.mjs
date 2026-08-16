#!/usr/bin/env node
/**
 * Verifies the rendered MP4 directly on disk — not the render log.
 *
 * Checks container, duration, resolution, frame rate, frame count, and that
 * BOTH a video and an audio stream are present and non-trivial.
 */
import {execFileSync} from 'node:child_process';
import {existsSync, statSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const target = process.argv[2] ?? resolve(ROOT, 'out', 'neumann-tlm107-reel.mp4');

// Two deliverables with different geometry, so the expected shape is derived
// from which file is being probed rather than hardcoded to the reel.
const isLongform = /longform/i.test(target);
const EXPECT = isLongform
  ? {w: 1920, h: 1080, frames: 8940, seconds: 298.0, name: 'Longform'}
  : {w: 1080, h: 1920, frames: 2640, seconds: 88.0, name: 'Reel'};

const SCRATCH = '/tmp/claude-0/-home-user/b7c7b719-b725-5bcc-ae76-95b988bf89e8/scratchpad';
const ffprobe = [
  process.env.FFPROBE_BIN,
  `${SCRATCH}/node_modules/ffprobe-static/bin/linux/x64/ffprobe`,
  '/usr/bin/ffprobe',
].find((p) => p && existsSync(p)) ?? 'ffprobe';

if (!existsSync(target)) {
  console.log(`FAILED — no such file: ${target}`);
  process.exit(1);
}

const probe = (args) => execFileSync(ffprobe, ['-v', 'error', ...args, target], {encoding: 'utf8'}).trim();

const j = JSON.parse(probe(['-show_streams', '-show_format', '-of', 'json']));
const v = j.streams.find((s) => s.codec_type === 'video');
const a = j.streams.find((s) => s.codec_type === 'audio');
const dur = parseFloat(j.format.duration);
const size = statSync(target).size;

const fails = [];
console.log('='.repeat(70));
console.log('RENDER VERIFICATION');
console.log('='.repeat(70));
console.log(`  file        : ${target.replace(ROOT + '/', '')}`);
console.log(`  size        : ${(size / 1024 / 1024).toFixed(1)} MB`);
console.log(`  container   : ${j.format.format_name}`);
console.log(`  duration    : ${dur.toFixed(3)} s`);

if (!v) fails.push('no video stream');
else {
  const fps = eval(v.r_frame_rate);
  const frames = parseInt(v.nb_frames ?? '0', 10) || Math.round(dur * fps);
  console.log(`  video       : ${v.codec_name} ${v.width}x${v.height} @ ${fps}fps, ${frames} frames`);
  console.log(`  pix_fmt     : ${v.pix_fmt}`);
  if (v.width !== EXPECT.w || v.height !== EXPECT.h) {
    fails.push(`resolution ${v.width}x${v.height}, expected ${EXPECT.w}x${EXPECT.h}`);
  }
  if (fps !== 30) fails.push(`frame rate ${fps}, expected 30`);
  if (Math.abs(frames - EXPECT.frames) > 2) {
    fails.push(`${frames} frames, expected ${EXPECT.frames} (±2)`);
  }
  if (v.pix_fmt !== 'yuv420p') fails.push(`pix_fmt ${v.pix_fmt}, expected yuv420p`);
}

if (!a) fails.push('NO AUDIO STREAM — the two-layer bed is missing');
else {
  console.log(`  audio       : ${a.codec_name} ${a.sample_rate} Hz, ${a.channels} ch`);
  if (parseInt(a.channels, 10) < 2) fails.push('audio is not stereo');
}

if (Math.abs(dur - EXPECT.seconds) > 0.15) {
  fails.push(`duration ${dur.toFixed(3)} s, expected ${EXPECT.seconds.toFixed(3)} s (±0.15)`);
}
if (size < 1_000_000) fails.push('file suspiciously small');

console.log('='.repeat(70));
if (fails.length) {
  console.log(`FAILED — ${fails.length} problem(s):`);
  for (const f of fails) console.log(`  x ${f}`);
  process.exit(1);
}
console.log(
  `PASSED — ${EXPECT.name}: ${EXPECT.w}x${EXPECT.h}, 30 fps, ${EXPECT.frames} frames, ` +
    `${EXPECT.seconds.toFixed(3)} s, video + audio present.`,
);
