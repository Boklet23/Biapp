const sharp = require('sharp');
const path = require('path');

const SIZE = 1024;
const ASSETS = path.join(__dirname, '..', 'assets');

// Flat-top hexagon points centered at 512,512 with radius 400
function hexPoints(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i); // flat-top: 0° = right
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return pts.join(' ');
}

// Mini hexagon points for honeycomb cells
function miniHex(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i);
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="#1A1A2E" opacity="0.4"/>`;
}

// 7-cell honeycomb grid (1 center + 6 around)
function honeycombGrid(cx, cy) {
  const r = 72; // mini hex radius
  const spacing = r * 1.75;
  const cells = [];

  // Center cell
  cells.push(miniHex(cx, cy, r));

  // 6 surrounding cells
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i);
    const x = cx + spacing * Math.cos(angle);
    const y = cy + spacing * Math.sin(angle);
    cells.push(miniHex(x, y, r));
  }
  return cells.join('\n    ');
}

function buildSVG(withBackground) {
  const cx = 512, cy = 512;
  const bg = withBackground
    ? `<rect width="1024" height="1024" fill="#1A1A2E"/>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="honeyGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F5A623"/>
      <stop offset="100%" stop-color="#D4890A"/>
    </linearGradient>
    <clipPath id="hexClip">
      <polygon points="${hexPoints(cx, cy, 400)}"/>
    </clipPath>
  </defs>

  ${bg}

  <!-- Outer hexagon -->
  <polygon points="${hexPoints(cx, cy, 400)}" fill="url(#honeyGrad)"/>

  <!-- Honeycomb inner grid -->
  <g clip-path="url(#hexClip)">
    ${honeycombGrid(cx, cy)}
  </g>

  <!-- Bee silhouette — body -->
  <ellipse cx="512" cy="498" rx="52" ry="72" fill="#FFF3DC"/>
  <!-- Bee stripes -->
  <rect x="462" y="490" width="100" height="18" fill="#D4890A" rx="4"/>
  <rect x="462" y="516" width="100" height="18" fill="#D4890A" rx="4"/>
  <!-- Bee wings -->
  <ellipse cx="448" cy="455" rx="52" ry="28" fill="#FFF3DC" opacity="0.75" transform="rotate(-20 448 455)"/>
  <ellipse cx="576" cy="455" rx="52" ry="28" fill="#FFF3DC" opacity="0.75" transform="rotate(20 576 455)"/>
  <!-- Bee head -->
  <circle cx="512" cy="424" r="28" fill="#FFF3DC"/>
  <!-- Antennae -->
  <line x1="504" y1="398" x2="488" y2="372" stroke="#FFF3DC" stroke-width="4" stroke-linecap="round"/>
  <circle cx="486" cy="370" r="5" fill="#FFF3DC"/>
  <line x1="520" y1="398" x2="536" y2="372" stroke="#FFF3DC" stroke-width="4" stroke-linecap="round"/>
  <circle cx="538" cy="370" r="5" fill="#FFF3DC"/>
</svg>`;
}

async function generate() {
  console.log('Generating BiVokter assets...');

  const svgWithBg = Buffer.from(buildSVG(true));
  const svgTransparent = Buffer.from(buildSVG(false));

  await sharp(svgWithBg)
    .png()
    .toFile(path.join(ASSETS, 'icon.png'));
  console.log('✓ icon.png (1024×1024, dark bg)');

  await sharp(svgTransparent)
    .png()
    .toFile(path.join(ASSETS, 'splash-icon.png'));
  console.log('✓ splash-icon.png (1024×1024, transparent)');

  await sharp(svgTransparent)
    .png()
    .toFile(path.join(ASSETS, 'android-icon-foreground.png'));
  console.log('✓ android-icon-foreground.png (1024×1024, transparent)');

  console.log('Done.');
}

generate().catch(err => { console.error(err); process.exit(1); });
