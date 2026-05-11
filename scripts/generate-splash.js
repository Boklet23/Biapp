#!/usr/bin/env node
const sharp = require('sharp');
const path = require('path');

const W = 1284;
const H = 2778;
const LOGO_SIZE = 400;
const BG = '#1A1A2E';

const svgLogo = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="${LOGO_SIZE}" height="${LOGO_SIZE}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F5A623"/>
      <stop offset="100%" stop-color="#D4890A"/>
    </linearGradient>
  </defs>
  <polygon points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5" fill="url(#g)"/>
  <ellipse cx="50" cy="48" rx="10" ry="14" fill="#FFF3DC"/>
  <rect x="41" y="46" width="18" height="3" fill="#D4890A" rx="1"/>
  <rect x="41" y="51" width="18" height="3" fill="#D4890A" rx="1"/>
  <ellipse cx="36" cy="39" rx="10" ry="5" fill="#FFF3DC" opacity="0.8" transform="rotate(-20 36 39)"/>
  <ellipse cx="64" cy="39" rx="10" ry="5" fill="#FFF3DC" opacity="0.8" transform="rotate(20 64 39)"/>
  <circle cx="50" cy="34" r="6" fill="#FFF3DC"/>
</svg>`;

const outPath = path.resolve(__dirname, '..', 'assets', 'splash-icon.png');

async function main() {
  const logoBuffer = Buffer.from(svgLogo);

  const bg = await sharp({
    create: {
      width: W,
      height: H,
      channels: 4,
      background: { r: 26, g: 26, b: 46, alpha: 1 },
    },
  })
    .composite([
      {
        input: await sharp(logoBuffer).png().toBuffer(),
        left: Math.round((W - LOGO_SIZE) / 2),
        top: Math.round((H - LOGO_SIZE) / 2),
      },
    ])
    .png()
    .toFile(outPath);

  console.log(`Splash screen lagret: ${outPath} (${bg.width}x${bg.height})`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
