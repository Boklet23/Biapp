const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ASSETS = path.join(__dirname, '..', 'assets');
const SHOTS = path.join(ASSETS, 'screenshots');

// ─── helpers ────────────────────────────────────────────────────────────────

function hexPts(cx, cy, r) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(' ');
}

function miniHex(cx, cy, r, fill = '#F5A623', opacity = 1) {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(' ');
  return `<polygon points="${pts}" fill="${fill}" opacity="${opacity}"/>`;
}

// Small BiVokter logo (hexagon+bee) scaled to given size, centered at cx,cy
function logo(cx, cy, size) {
  const r = size / 2;
  const s = size / 256; // scale factor (base design = 256px)
  return `
<g transform="translate(${cx - r}, ${cy - r}) scale(${s})">
  <defs>
    <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F5A623"/>
      <stop offset="100%" stop-color="#D4890A"/>
    </linearGradient>
    <clipPath id="hc"><polygon points="${hexPts(128, 128, 100)}"/></clipPath>
  </defs>
  <polygon points="${hexPts(128, 128, 100)}" fill="url(#lg)"/>
  <g clip-path="url(#hc)">
    ${miniHex(128, 128, 18, '#1A1A2E', 0.4)}
    ${[0,1,2,3,4,5].map(i => {
      const a = (Math.PI / 3) * i;
      return miniHex(128 + 44 * Math.cos(a), 128 + 44 * Math.sin(a), 18, '#1A1A2E', 0.4);
    }).join('')}
  </g>
  <ellipse cx="128" cy="124" rx="13" ry="18" fill="#FFF3DC"/>
  <rect x="116" y="122" width="24" height="4" fill="#D4890A" rx="1"/>
  <rect x="116" y="129" width="24" height="4" fill="#D4890A" rx="1"/>
  <ellipse cx="112" cy="113" rx="13" ry="7" fill="#FFF3DC" opacity="0.75" transform="rotate(-20 112 113)"/>
  <ellipse cx="144" cy="113" rx="13" ry="7" fill="#FFF3DC" opacity="0.75" transform="rotate(20 144 113)"/>
  <circle cx="128" cy="106" r="7" fill="#FFF3DC"/>
</g>`;
}

// Rounded rectangle
function roundRect(x, y, w, h, r, fill, opacity = 1) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="${fill}" opacity="${opacity}"/>`;
}

// ─── Feature Graphic 1024×500 ───────────────────────────────────────────────

async function featureGraphic() {
  const W = 1024, H = 500;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1A1A2E"/>
      <stop offset="100%" stop-color="#2D2D4E"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bgGrad)"/>

  <!-- Decorative hexagons background -->
  <polygon points="${hexPts(880, 60, 120)}" fill="#F5A623" opacity="0.06"/>
  <polygon points="${hexPts(960, 180, 80)}" fill="#F5A623" opacity="0.04"/>
  <polygon points="${hexPts(80, 440, 90)}" fill="#F5A623" opacity="0.05"/>

  <!-- Logo -->
  ${logo(180, 250, 160)}

  <!-- App name -->
  <text x="310" y="220" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="700" fill="#FFFFFF" letter-spacing="-1">BiVokter</text>

  <!-- Tagline -->
  <text x="312" y="272" font-family="system-ui, -apple-system, sans-serif" font-size="28" fill="#F5A623" letter-spacing="1">Norsk birøkterapp</text>

  <!-- Divider line -->
  <rect x="312" y="295" width="460" height="2" fill="#F5A623" opacity="0.3" rx="1"/>

  <!-- Feature pills -->
  ${roundRect(312, 316, 130, 36, 18, '#F5A623', 0.15)}
  <text x="377" y="339" font-family="system-ui, sans-serif" font-size="16" fill="#F5A623" text-anchor="middle">Kubeoversikt</text>

  ${roundRect(456, 316, 110, 36, 18, '#F5A623', 0.15)}
  <text x="511" y="339" font-family="system-ui, sans-serif" font-size="16" fill="#F5A623" text-anchor="middle">Inspeksjon</text>

  ${roundRect(580, 316, 100, 36, 18, '#F5A623', 0.15)}
  <text x="630" y="339" font-family="system-ui, sans-serif" font-size="16" fill="#F5A623" text-anchor="middle">Kalender</text>

  ${roundRect(694, 316, 110, 36, 18, '#F5A623', 0.15)}
  <text x="749" y="339" font-family="system-ui, sans-serif" font-size="16" fill="#F5A623" text-anchor="middle">Statistikk</text>

  <!-- Subtitle -->
  <text x="312" y="408" font-family="system-ui, sans-serif" font-size="22" fill="#FFFFFF" opacity="0.6">Hold oversikt over alle kubene dine</text>
</svg>`;

  await sharp(Buffer.from(svg)).png().toFile(path.join(ASSETS, 'feature-graphic.png'));
  console.log('✓ feature-graphic.png (1024×500)');
}

// ─── Screenshot helper ───────────────────────────────────────────────────────

function statusBar() {
  return `
  <text x="44" y="58" font-family="system-ui, sans-serif" font-size="24" font-weight="600" fill="white">9:41</text>
  <text x="990" y="58" font-family="system-ui, sans-serif" font-size="22" fill="white" text-anchor="end">●●●</text>`;
}

function phoneFrame(content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920">
  <!-- Background -->
  <rect width="1080" height="1920" fill="#1A1A2E"/>
  ${statusBar()}
  ${content}
</svg>`;
}

function hiveCard(x, y, name, status, health, color) {
  const statusColor = color;
  return `
  ${roundRect(x, y, 960, 130, 20, '#2D2D4E')}
  <!-- hex icon -->
  <polygon points="${hexPts(x + 65, y + 65, 38)}" fill="${statusColor}" opacity="0.9"/>
  <!-- name -->
  <text x="${x + 120}" y="${y + 48}" font-family="system-ui, sans-serif" font-size="32" font-weight="600" fill="white">${name}</text>
  <!-- status -->
  <text x="${x + 120}" y="${y + 88}" font-family="system-ui, sans-serif" font-size="24" fill="${statusColor}">${status}</text>
  <!-- health bar bg -->
  ${roundRect(x + 120, y + 100, 500, 12, 6, '#1A1A2E')}
  <!-- health bar fill -->
  ${roundRect(x + 120, y + 100, Math.round(500 * health), 12, 6, statusColor)}`;
}

// ─── Screenshot 1: Hjem / Dashboard ─────────────────────────────────────────

async function screen1() {
  const content = `
  <!-- Header -->
  <text x="60" y="130" font-family="system-ui, sans-serif" font-size="44" font-weight="700" fill="white">Hjem</text>
  <text x="60" y="180" font-family="system-ui, sans-serif" font-size="26" fill="#F5A623">God morgen, André</text>

  <!-- Summary cards row -->
  ${roundRect(60, 210, 290, 150, 20, '#2D2D4E')}
  <text x="205" y="270" font-family="system-ui, sans-serif" font-size="52" font-weight="700" fill="#F5A623" text-anchor="middle">4</text>
  <text x="205" y="310" font-family="system-ui, sans-serif" font-size="22" fill="white" text-anchor="middle" opacity="0.7">Kuber</text>

  ${roundRect(370, 210, 290, 150, 20, '#2D2D4E')}
  <text x="515" y="270" font-family="system-ui, sans-serif" font-size="52" font-weight="700" fill="#2ECC71" text-anchor="middle">3</text>
  <text x="515" y="310" font-family="system-ui, sans-serif" font-size="22" fill="white" text-anchor="middle" opacity="0.7">God helse</text>

  ${roundRect(680, 210, 290, 150, 20, '#2D2D4E')}
  <text x="825" y="270" font-family="system-ui, sans-serif" font-size="52" font-weight="700" fill="#E74C3C" text-anchor="middle">1</text>
  <text x="825" y="310" font-family="system-ui, sans-serif" font-size="22" fill="white" text-anchor="middle" opacity="0.7">Trenger tilsyn</text>

  <!-- Section title -->
  <text x="60" y="420" font-family="system-ui, sans-serif" font-size="32" font-weight="600" fill="white">Siste inspeksjoner</text>

  ${hiveCard(60, 450, 'Nordhagen #1', 'Sist inspisert: i dag', 0.85, '#2ECC71')}
  ${hiveCard(60, 600, 'Sørhagen #2', 'Sist inspisert: 3 dager', 0.65, '#F5A623')}
  ${hiveCard(60, 750, 'Bakgården #3', 'Trenger tilsyn snart', 0.35, '#E74C3C')}
  ${hiveCard(60, 900, 'Skogen #4', 'Sist inspisert: i dag', 0.90, '#2ECC71')}

  <!-- Weather widget -->
  ${roundRect(60, 1060, 960, 130, 20, '#2D2D4E')}
  <text x="140" y="1110" font-family="system-ui, sans-serif" font-size="28" fill="white">☀️  Godt flyvær i dag · 18°C</text>
  <text x="140" y="1150" font-family="system-ui, sans-serif" font-size="22" fill="#F5A623" opacity="0.8">Vindstille · Perfekt for tilsyn</text>

  <!-- Bottom tab bar -->
  ${roundRect(0, 1780, 1080, 140, 0, '#2D2D4E')}
  <text x="108" y="1860" font-family="system-ui, sans-serif" font-size="20" fill="#F5A623" text-anchor="middle">Hjem</text>
  <text x="324" y="1860" font-family="system-ui, sans-serif" font-size="20" fill="white" text-anchor="middle" opacity="0.5">Kuber</text>
  <text x="540" y="1860" font-family="system-ui, sans-serif" font-size="20" fill="white" text-anchor="middle" opacity="0.5">Kalender</text>
  <text x="756" y="1860" font-family="system-ui, sans-serif" font-size="20" fill="white" text-anchor="middle" opacity="0.5">Lær</text>
  <text x="972" y="1860" font-family="system-ui, sans-serif" font-size="20" fill="white" text-anchor="middle" opacity="0.5">Samfunn</text>`;

  await sharp(Buffer.from(phoneFrame(content))).png().toFile(path.join(SHOTS, 'screen-1.png'));
  console.log('✓ screenshots/screen-1.png (Hjem)');
}

// ─── Screenshot 2: Mine Kuber ────────────────────────────────────────────────

async function screen2() {
  const content = `
  <text x="60" y="130" font-family="system-ui, sans-serif" font-size="44" font-weight="700" fill="white">Mine Kuber</text>

  <!-- Add button -->
  ${roundRect(860, 90, 160, 70, 35, '#F5A623')}
  <text x="940" y="133" font-family="system-ui, sans-serif" font-size="28" font-weight="600" fill="#1A1A2E" text-anchor="middle">+ Ny</text>

  <!-- Hive cards -->
  ${roundRect(60, 190, 960, 200, 24, '#2D2D4E')}
  ${logo(150, 290, 80)}
  <text x="230" y="260" font-family="system-ui, sans-serif" font-size="36" font-weight="600" fill="white">Nordhagen #1</text>
  <text x="230" y="308" font-family="system-ui, sans-serif" font-size="24" fill="#2ECC71">God helse · 4 rammer</text>
  <text x="230" y="352" font-family="system-ui, sans-serif" font-size="22" fill="white" opacity="0.5">Inspisert 17. april 2026</text>
  ${roundRect(820, 230, 150, 50, 25, '#2ECC71', 0.2)}
  <text x="895" y="262" font-family="system-ui, sans-serif" font-size="22" fill="#2ECC71" text-anchor="middle">Aktiv</text>

  ${roundRect(60, 410, 960, 200, 24, '#2D2D4E')}
  ${logo(150, 510, 80)}
  <text x="230" y="478" font-family="system-ui, sans-serif" font-size="36" font-weight="600" fill="white">Sørhagen #2</text>
  <text x="230" y="526" font-family="system-ui, sans-serif" font-size="24" fill="#F5A623">Middels helse · 3 rammer</text>
  <text x="230" y="570" font-family="system-ui, sans-serif" font-size="22" fill="white" opacity="0.5">Inspisert 14. april 2026</text>
  ${roundRect(820, 448, 150, 50, 25, '#F5A623', 0.2)}
  <text x="895" y="480" font-family="system-ui, sans-serif" font-size="22" fill="#F5A623" text-anchor="middle">Tilsyn</text>

  ${roundRect(60, 630, 960, 200, 24, '#2D2D4E')}
  ${logo(150, 730, 80)}
  <text x="230" y="698" font-family="system-ui, sans-serif" font-size="36" font-weight="600" fill="white">Bakgården #3</text>
  <text x="230" y="746" font-family="system-ui, sans-serif" font-size="24" fill="#E74C3C">Lav helse · Varroa påvist</text>
  <text x="230" y="790" font-family="system-ui, sans-serif" font-size="22" fill="white" opacity="0.5">Inspisert 10. april 2026</text>
  ${roundRect(820, 668, 150, 50, 25, '#E74C3C', 0.2)}
  <text x="895" y="700" font-family="system-ui, sans-serif" font-size="22" fill="#E74C3C" text-anchor="middle">Kritisk</text>

  ${roundRect(60, 850, 960, 200, 24, '#2D2D4E')}
  ${logo(150, 950, 80)}
  <text x="230" y="918" font-family="system-ui, sans-serif" font-size="36" font-weight="600" fill="white">Skogen #4</text>
  <text x="230" y="966" font-family="system-ui, sans-serif" font-size="24" fill="#2ECC71">God helse · 5 rammer</text>
  <text x="230" y="1010" font-family="system-ui, sans-serif" font-size="22" fill="white" opacity="0.5">Inspisert 17. april 2026</text>
  ${roundRect(820, 888, 150, 50, 25, '#2ECC71', 0.2)}
  <text x="895" y="920" font-family="system-ui, sans-serif" font-size="22" fill="#2ECC71" text-anchor="middle">Aktiv</text>

  <!-- Bottom tab bar -->
  ${roundRect(0, 1780, 1080, 140, 0, '#2D2D4E')}
  <text x="108" y="1860" font-family="system-ui, sans-serif" font-size="20" fill="white" text-anchor="middle" opacity="0.5">Hjem</text>
  <text x="324" y="1860" font-family="system-ui, sans-serif" font-size="20" fill="#F5A623" text-anchor="middle">Kuber</text>
  <text x="540" y="1860" font-family="system-ui, sans-serif" font-size="20" fill="white" text-anchor="middle" opacity="0.5">Kalender</text>
  <text x="756" y="1860" font-family="system-ui, sans-serif" font-size="20" fill="white" text-anchor="middle" opacity="0.5">Lær</text>
  <text x="972" y="1860" font-family="system-ui, sans-serif" font-size="20" fill="white" text-anchor="middle" opacity="0.5">Samfunn</text>`;

  await sharp(Buffer.from(phoneFrame(content))).png().toFile(path.join(SHOTS, 'screen-2.png'));
  console.log('✓ screenshots/screen-2.png (Mine Kuber)');
}

// ─── Screenshot 3: Inspeksjon ────────────────────────────────────────────────

async function screen3() {
  function scoreBar(label, value, color, y) {
    return `
    <text x="60" y="${y}" font-family="system-ui, sans-serif" font-size="24" fill="white" opacity="0.7">${label}</text>
    ${roundRect(60, y + 10, 800, 16, 8, '#1A1A2E')}
    ${roundRect(60, y + 10, Math.round(800 * value), 16, 8, color)}
    <text x="880" y="${y + 22}" font-family="system-ui, sans-serif" font-size="22" fill="${color}" text-anchor="middle">${Math.round(value * 10)}/10</text>`;
  }

  const content = `
  <!-- Back + title -->
  <text x="60" y="120" font-family="system-ui, sans-serif" font-size="28" fill="#F5A623">← Nordhagen #1</text>
  <text x="60" y="170" font-family="system-ui, sans-serif" font-size="44" font-weight="700" fill="white">Inspeksjon</text>
  <text x="60" y="214" font-family="system-ui, sans-serif" font-size="24" fill="white" opacity="0.5">17. april 2026</text>

  <!-- Health overview -->
  ${roundRect(60, 240, 960, 160, 20, '#2D2D4E')}
  <text x="540" y="300" font-family="system-ui, sans-serif" font-size="72" font-weight="700" fill="#2ECC71" text-anchor="middle">85</text>
  <text x="540" y="360" font-family="system-ui, sans-serif" font-size="26" fill="white" text-anchor="middle" opacity="0.7">Helsepoeng</text>

  <!-- Observations -->
  <text x="60" y="450" font-family="system-ui, sans-serif" font-size="32" font-weight="600" fill="white">Observasjoner</text>

  ${scoreBar('Dronning sett', 1.0, '#2ECC71', 490)}
  ${scoreBar('Egglegging', 0.9, '#2ECC71', 540)}
  ${scoreBar('Voksenatferd', 0.8, '#F5A623', 590)}
  ${scoreBar('Varroa-nivå', 0.2, '#2ECC71', 640)}
  ${scoreBar('Matbeholdning', 0.75, '#F5A623', 690)}

  <!-- Notes -->
  <text x="60" y="780" font-family="system-ui, sans-serif" font-size="32" font-weight="600" fill="white">Notater</text>
  ${roundRect(60, 800, 960, 160, 16, '#2D2D4E')}
  <text x="90" y="850" font-family="system-ui, sans-serif" font-size="24" fill="white" opacity="0.8">Kuben ser fin ut. Dronning observert</text>
  <text x="90" y="890" font-family="system-ui, sans-serif" font-size="24" fill="white" opacity="0.8">i sektor 3. Litt lav honningbeholdning.</text>
  <text x="90" y="930" font-family="system-ui, sans-serif" font-size="24" fill="white" opacity="0.5">Vurder tilleggsfôring neste uke.</text>

  <!-- Recommendation chip -->
  ${roundRect(60, 990, 500, 60, 30, '#F5A623', 0.15)}
  <text x="80" y="1030" font-family="system-ui, sans-serif" font-size="24" fill="#F5A623">⚠ Vurder tilleggsfôring</text>

  <!-- Bottom tab bar -->
  ${roundRect(0, 1780, 1080, 140, 0, '#2D2D4E')}
  <text x="108" y="1860" font-family="system-ui, sans-serif" font-size="20" fill="white" text-anchor="middle" opacity="0.5">Hjem</text>
  <text x="324" y="1860" font-family="system-ui, sans-serif" font-size="20" fill="#F5A623" text-anchor="middle">Kuber</text>
  <text x="540" y="1860" font-family="system-ui, sans-serif" font-size="20" fill="white" text-anchor="middle" opacity="0.5">Kalender</text>
  <text x="756" y="1860" font-family="system-ui, sans-serif" font-size="20" fill="white" text-anchor="middle" opacity="0.5">Lær</text>
  <text x="972" y="1860" font-family="system-ui, sans-serif" font-size="20" fill="white" text-anchor="middle" opacity="0.5">Samfunn</text>`;

  await sharp(Buffer.from(phoneFrame(content))).png().toFile(path.join(SHOTS, 'screen-3.png'));
  console.log('✓ screenshots/screen-3.png (Inspeksjon)');
}

// ─── Screenshot 4: Kalender ──────────────────────────────────────────────────

async function screen4() {
  const days = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
  const dates = [14, 15, 16, 17, 18, 19, 20];
  const today = 17;

  const calHeader = days.map((d, i) => {
    const x = 60 + i * 138 + 69;
    const isToday = dates[i] === today;
    return `
    <text x="${x}" y="260" font-family="system-ui, sans-serif" font-size="22" fill="white" opacity="0.5" text-anchor="middle">${d}</text>
    ${isToday ? `<circle cx="${x}" cy="310" r="30" fill="#F5A623"/>` : ''}
    <text x="${x}" y="318" font-family="system-ui, sans-serif" font-size="28" font-weight="${isToday ? '700' : '400'}" fill="${isToday ? '#1A1A2E' : 'white'}" text-anchor="middle">${dates[i]}</text>`;
  }).join('');

  function eventCard(y, time, title, hive, color) {
    return `
    ${roundRect(60, y, 960, 120, 16, '#2D2D4E')}
    <rect x="60" y="${y}" width="6" height="120" rx="3" fill="${color}"/>
    <text x="90" y="${y + 42}" font-family="system-ui, sans-serif" font-size="22" fill="${color}">${time}</text>
    <text x="90" y="${y + 82}" font-family="system-ui, sans-serif" font-size="30" font-weight="600" fill="white">${title}</text>
    <text x="90" y="${y + 112}" font-family="system-ui, sans-serif" font-size="22" fill="white" opacity="0.5">${hive}</text>`;
  }

  const content = `
  <text x="60" y="130" font-family="system-ui, sans-serif" font-size="44" font-weight="700" fill="white">Kalender</text>
  <text x="60" y="180" font-family="system-ui, sans-serif" font-size="28" fill="white" opacity="0.5">April 2026</text>

  <!-- Week row -->
  ${roundRect(60, 222, 960, 120, 16, '#2D2D4E')}
  ${calHeader}

  <!-- Events title -->
  <text x="60" y="400" font-family="system-ui, sans-serif" font-size="32" font-weight="600" fill="white">I dag · 17. april</text>

  ${eventCard(424, '10:00', 'Inspeksjon planlagt', 'Nordhagen #1', '#F5A623')}
  ${eventCard(564, '14:00', 'Varroa-behandling', 'Bakgården #3', '#E74C3C')}
  ${eventCard(704, '16:30', 'Tilleggsfôring', 'Sørhagen #2', '#3498DB')}

  <!-- Upcoming -->
  <text x="60" y="880" font-family="system-ui, sans-serif" font-size="32" font-weight="600" fill="white">Kommende</text>
  ${eventCard(904, '18. apr', 'Honningslynging', 'Skogen #4', '#2ECC71')}
  ${eventCard(1044, '22. apr', 'Dronningkontroll', 'Alle kuber', '#F5A623')}

  <!-- Bottom tab bar -->
  ${roundRect(0, 1780, 1080, 140, 0, '#2D2D4E')}
  <text x="108" y="1860" font-family="system-ui, sans-serif" font-size="20" fill="white" text-anchor="middle" opacity="0.5">Hjem</text>
  <text x="324" y="1860" font-family="system-ui, sans-serif" font-size="20" fill="white" text-anchor="middle" opacity="0.5">Kuber</text>
  <text x="540" y="1860" font-family="system-ui, sans-serif" font-size="20" fill="#F5A623" text-anchor="middle">Kalender</text>
  <text x="756" y="1860" font-family="system-ui, sans-serif" font-size="20" fill="white" text-anchor="middle" opacity="0.5">Lær</text>
  <text x="972" y="1860" font-family="system-ui, sans-serif" font-size="20" fill="white" text-anchor="middle" opacity="0.5">Samfunn</text>`;

  await sharp(Buffer.from(phoneFrame(content))).png().toFile(path.join(SHOTS, 'screen-4.png'));
  console.log('✓ screenshots/screen-4.png (Kalender)');
}

// ─── Run all ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('Generating store assets...');
  await Promise.all([featureGraphic(), screen1(), screen2(), screen3(), screen4()]);
  console.log('All done.');
}

main().catch(err => { console.error(err); process.exit(1); });
