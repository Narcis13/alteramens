#!/usr/bin/env node
'use strict';

const { chromium } = require('playwright');
const { execSync, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// ── CLI parsing ────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = argv.slice(2);
  const opts = {
    htmlPath: null,
    duration: 5,
    transition: 'fade',
    transitionDur: 0.5,
    fps: 30,
    output: 'presentation.mp4',
    crf: 18,
    width: 1920,
    height: 1080,
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--duration')       { opts.duration      = parseFloat(args[++i]); }
    else if (a === '--transition')     { opts.transition    = args[++i]; }
    else if (a === '--transition-dur') { opts.transitionDur = parseFloat(args[++i]); }
    else if (a === '--fps')            { opts.fps           = parseInt(args[++i], 10); }
    else if (a === '--output')         { opts.output        = args[++i]; }
    else if (a === '--crf')            { opts.crf           = parseInt(args[++i], 10); }
    else if (a === '--width')          { opts.width         = parseInt(args[++i], 10); }
    else if (a === '--height')         { opts.height        = parseInt(args[++i], 10); }
    else if (!a.startsWith('--'))      { opts.htmlPath      = a; }
  }

  if (!opts.htmlPath) {
    console.error('Usage: node slides-to-mp4.js <html-path> [options]');
    console.error('  --duration N         Seconds per slide (default: 5)');
    console.error('  --transition NAME    xfade transition (default: fade)');
    console.error('  --transition-dur N   Transition seconds (default: 0.5)');
    console.error('  --fps N              Frames per second (default: 30)');
    console.error('  --output FILE        Output filename (default: presentation.mp4)');
    console.error('  --crf N              H.264 quality 0-51 (default: 18)');
    console.error('  --width N            Viewport width (default: 1920)');
    console.error('  --height N           Viewport height (default: 1080)');
    process.exit(1);
  }

  opts.htmlPath = path.resolve(opts.htmlPath);
  if (!fs.existsSync(opts.htmlPath)) {
    console.error(`File not found: ${opts.htmlPath}`);
    process.exit(1);
  }

  return opts;
}

// ── Phase A: Browser capture ───────────────────────────────────────────────────

async function captureSlides(opts, tmpDir) {
  console.log('Launching headless Chromium…');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setViewportSize({ width: opts.width, height: opts.height });

  const fileUrl = `file://${opts.htmlPath}`;
  await page.goto(fileUrl);
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);

  // Hide UI chrome and cursor
  await page.addStyleTag({
    content: `
      .progress-bar, .nav-dots,
      button[title*="annotation"], button[title*="Toggle"] {
        display: none !important;
      }
      * { cursor: none !important; }
    `,
  });

  // Disable smooth scrolling so scrollIntoView snaps immediately
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'instant';
  });

  const slideCount = await page.evaluate(
    () => document.querySelectorAll('.slide').length
  );

  if (slideCount === 0) {
    await browser.close();
    console.error('No elements matching ".slide" found in the HTML.');
    process.exit(1);
  }

  console.log(`Found ${slideCount} slides. Capturing screenshots…`);

  const pngPaths = [];

  for (let i = 0; i < slideCount; i++) {
    await page.evaluate((idx) => {
      const slide = document.querySelectorAll('.slide')[idx];
      slide.scrollIntoView({ behavior: 'instant', block: 'start' });
      slide.classList.add('visible');
    }, i);

    // Wait for CSS animations to complete (0.7s) + buffer (0.5s)
    await page.waitForTimeout(1200);

    const pngPath = path.join(tmpDir, `slide-${String(i).padStart(3, '0')}.png`);
    await page.screenshot({ path: pngPath, fullPage: false });
    pngPaths.push(pngPath);
    console.log(`  [${i + 1}/${slideCount}] ${path.basename(pngPath)}`);
  }

  await browser.close();
  return pngPaths;
}

// ── Phase B: FFmpeg assembly ───────────────────────────────────────────────────

function buildFfmpegCmd(pngPaths, opts) {
  const n = pngPaths.length;
  const d = opts.duration;
  const t = opts.transitionDur;

  // Input flags: each PNG is a still image looped for `duration` seconds
  const inputs = pngPaths.flatMap((p) => ['-loop', '1', '-t', String(d), '-i', p]);

  if (n === 1) {
    // Single slide — no xfade needed
    return [
      'ffmpeg', '-y',
      ...inputs,
      '-vf', `fps=${opts.fps},format=yuv420p`,
      '-c:v', 'libx264',
      '-crf', String(opts.crf),
      '-preset', 'slow',
      '-movflags', '+faststart',
      opts.output,
    ];
  }

  // Build xfade filter chain
  // offset[i] = (i+1) * (d - t)  for i = 0-indexed xfade step
  const filterParts = [];
  let prevLabel = '[0:v]';

  for (let i = 0; i < n - 1; i++) {
    const nextInput = `[${i + 1}:v]`;
    const outLabel  = i < n - 2 ? `[x${i}]` : '[xout]';
    const offset    = ((i + 1) * (d - t)).toFixed(3);

    filterParts.push(
      `${prevLabel}${nextInput}xfade=transition=${opts.transition}:duration=${t}:offset=${offset}${outLabel}`
    );
    prevLabel = outLabel;
  }

  filterParts.push(`[xout]fps=${opts.fps},format=yuv420p[vout]`);

  const filterComplex = filterParts.join(';');

  return [
    'ffmpeg', '-y',
    ...inputs,
    '-filter_complex', filterComplex,
    '-map', '[vout]',
    '-c:v', 'libx264',
    '-crf', String(opts.crf),
    '-preset', 'slow',
    '-movflags', '+faststart',
    opts.output,
  ];
}

function runFfmpeg(cmdArgs) {
  console.log('\nRunning FFmpeg…');
  const [bin, ...args] = cmdArgs;
  const result = spawnSync(bin, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    console.error('FFmpeg failed.');
    process.exit(result.status || 1);
  }
}

// ── Entrypoint ─────────────────────────────────────────────────────────────────

(async () => {
  const opts = parseArgs(process.argv);

  // Verify ffmpeg is available
  const ffmpegCheck = spawnSync('ffmpeg', ['-version'], { stdio: 'pipe' });
  if (ffmpegCheck.status !== 0) {
    console.error('ffmpeg not found. Install it with: brew install ffmpeg');
    process.exit(1);
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'slides-to-mp4-'));
  console.log(`Temp dir: ${tmpDir}`);

  try {
    const pngPaths = await captureSlides(opts, tmpDir);

    const cmdArgs = buildFfmpegCmd(pngPaths, opts);
    runFfmpeg(cmdArgs);

    const stat = fs.statSync(opts.output);
    const mb = (stat.size / 1024 / 1024).toFixed(1);
    console.log(`\nDone! ${opts.output} (${mb} MB)`);
    console.log(`  Slides: ${pngPaths.length} | Duration: ${(pngPaths.length * opts.duration).toFixed(1)}s | ${opts.width}x${opts.height} @ ${opts.fps}fps`);
  } finally {
    // Clean up temp PNGs
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
})();
