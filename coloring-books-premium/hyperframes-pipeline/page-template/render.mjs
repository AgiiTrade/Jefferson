import puppeteer from 'puppeteer';
import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const imgIdx = args.indexOf('--image');
const outIdx = args.indexOf('--out');
if (imgIdx === -1 || outIdx === -1) {
  console.error('Usage: node render.mjs --image <path> --out <path>');
  process.exit(1);
}

const imagePath = resolve(args[imgIdx + 1]);
const outPath = resolve(args[outIdx + 1]);

const template = readFileSync(resolve(__dirname, 'index.html'), 'utf8');
const html = template.replace('__IMAGE_PATH__', `file://${imagePath}`);

const tmpFile = resolve(tmpdir(), `coloring-page-${randomBytes(6).toString('hex')}.html`);
writeFileSync(tmpFile, html);

// Check for system Chrome if Puppeteer bundled Chromium isn't available
let executablePath = undefined;
const systemChromePaths = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
];
for (const p of systemChromePaths) {
  try {
    const { statSync } = await import('fs');
    statSync(p);
    executablePath = p;
    break;
  } catch {}
}

const browser = await puppeteer.launch({
  headless: true,
  executablePath,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 2550, height: 3300, deviceScaleFactor: 1 });
  await page.goto(`file://${tmpFile}`, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: outPath, fullPage: false, type: 'png' });
  console.log(`[ok] rendered to ${outPath}`);
} finally {
  await browser.close();
  try { unlinkSync(tmpFile); } catch {}
}
