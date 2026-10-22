const fs = require('fs');
const path = require('path');
const sharp = require('./node_modules/sharp');

const publicDir = path.resolve(__dirname, 'public');
const assetsDir = path.resolve(__dirname, 'src/assets');

// Coordinates for the 100 x 120 viewBox with updated larger head and bolder cross:
// Center X = 50.
// Pin circle top center = (50, 48), radius = 42.
// Tangent down to point (50, 114).
// Priest head: cx=50, cy=38, r=15.5.
// Clerical collar: rect x=47, y=53.5, width=6, height=5.5.
// Priest bust: arched shoulders down to y=88, bottom curve.
// Latin cross: vertical beam from y=63.5 to 85.5 (w=7), horizontal bar at y=69.5 from x=38.5 to 61.5 (w=23, h=7).

const getColorSvg = (size = 120) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="${size}" height="${size * 1.2}">
  <defs>
    <filter id="pin-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#131E3C" flood-opacity="0.15" />
    </filter>
  </defs>

  <!-- Map Pin Body (Papal Gold fill + Midnight Navy outer contour) -->
  <path
    d="M 50 6
       C 73.196 6 92 24.804 92 48
       C 92 61.2 86.4 72.8 77.2 82.8
       L 50 114
       L 22.8 82.8
       C 13.6 72.8 8 61.2 8 48
       C 8 24.804 26.804 6 50 6 Z"
    fill="#FCD116"
    stroke="#131E3C"
    stroke-width="7.5"
    stroke-linejoin="round"
    stroke-linecap="round"
  />

  <!-- Priest Silhouette Group (Midnight Navy #131E3C) -->
  <g fill="#131E3C">
    <!-- Priest Head (Updated: Larger, more prominent) -->
    <circle cx="50" cy="38" r="15.5" />

    <!-- Neck Base -->
    <rect x="45" y="50" width="10" height="11" />

    <!-- Priest Shoulders / Bust -->
    <path
      d="M 45 59
         C 34 60 28 69 28 82
         C 34 91 66 91 72 82
         C 72 69 66 60 55 59
         Z"
    />
  </g>

  <!-- Roman Clerical Collar Tab (Updated: wider white tab) -->
  <rect x="47" y="53.5" width="6" height="5.5" fill="#FFFFFF" rx="0.5" />

  <!-- White Latin Cross on Pectoral Vestment (Updated: Bolder, wider arms) -->
  <!-- Vertical Beam -->
  <rect x="46.5" y="63.5" width="7" height="22" fill="#FFFFFF" rx="0.5" />
  <!-- Horizontal Crossbar -->
  <rect x="38.5" y="69.5" width="23" height="7" fill="#FFFFFF" rx="0.5" />
</svg>
`;

const getMonochromeSvg = (size = 120) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="${size}" height="${size * 1.2}">
  <path
    d="M 50 6
       C 73.196 6 92 24.804 92 48
       C 92 61.2 86.4 72.8 77.2 82.8
       L 50 114
       L 22.8 82.8
       C 13.6 72.8 8 61.2 8 48
       C 8 24.804 26.804 6 50 6 Z"
    fill="#FFFFFF"
    stroke="#131E3C"
    stroke-width="7.5"
    stroke-linejoin="round"
    stroke-linecap="round"
  />

  <g fill="#131E3C">
    <circle cx="50" cy="38" r="15.5" />
    <rect x="45" y="50" width="10" height="11" />
    <path
      d="M 45 59
         C 34 60 28 69 28 82
         C 34 91 66 91 72 82
         C 72 69 66 60 55 59
         Z"
    />
  </g>

  <rect x="47" y="53.5" width="6" height="5.5" fill="#FFFFFF" rx="0.5" />
  <rect x="46.5" y="63.5" width="7" height="22" fill="#FFFFFF" rx="0.5" />
  <rect x="38.5" y="69.5" width="23" height="7" fill="#FFFFFF" rx="0.5" />
</svg>
`;

const getAppIconSvg = (size = 512, bg = '#131E3C') => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">
  <rect width="100" height="100" rx="22" fill="${bg}" />
  <g transform="translate(14, 4) scale(0.72)">
    <path
      d="M 50 6
         C 73.196 6 92 24.804 92 48
         C 92 61.2 86.4 72.8 77.2 82.8
         L 50 114
         L 22.8 82.8
         C 13.6 72.8 8 61.2 8 48
         C 8 24.804 26.804 6 50 6 Z"
      fill="#FCD116"
      stroke="#FFFFFF"
      stroke-width="5"
      stroke-linejoin="round"
      stroke-linecap="round"
    />
    <g fill="#131E3C">
      <circle cx="50" cy="38" r="15.5" />
      <rect x="45" y="50" width="10" height="11" />
      <path
        d="M 45 59
           C 34 60 28 69 28 82
           C 34 91 66 91 72 82
           C 72 69 66 60 55 59
           Z"
      />
    </g>
    <rect x="47" y="53.5" width="6" height="5.5" fill="#FFFFFF" rx="0.5" />
    <rect x="46.5" y="63.5" width="7" height="22" fill="#FFFFFF" rx="0.5" />
    <rect x="38.5" y="69.5" width="23" height="7" fill="#FFFFFF" rx="0.5" />
  </g>
</svg>
`;

async function run() {
  const colorSvg = getColorSvg();
  const monoSvg = getMonochromeSvg();
  const appIconSvg = getAppIconSvg(512);

  // Write SVGs to public
  fs.writeFileSync(path.join(publicDir, 'book-a-priest-symbol.svg'), colorSvg.trim());
  fs.writeFileSync(path.join(publicDir, 'book-a-priest-symbol-monochrome.svg'), monoSvg.trim());
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), colorSvg.trim());
  fs.writeFileSync(path.join(publicDir, 'app-icon.svg'), appIconSvg.trim());

  // Also write to src/assets
  fs.writeFileSync(path.join(assetsDir, 'logo.svg'), colorSvg.trim());
  fs.writeFileSync(path.join(assetsDir, 'logo-monochrome.svg'), monoSvg.trim());

  // Generate PNG favicons and app icons
  console.log('Generating updated PNG favicons & app icons with Sharp...');
  
  await sharp(Buffer.from(colorSvg)).resize(32, 38).extend({
    top: 0, bottom: 0, left: 3, right: 3, background: { r: 0, g: 0, b: 0, alpha: 0 }
  }).resize(32, 32).png().toFile(path.join(publicDir, 'favicon-32x32.png'));

  await sharp(Buffer.from(colorSvg)).resize(16, 19).extend({
    top: 0, bottom: 0, left: 1, right: 1, background: { r: 0, g: 0, b: 0, alpha: 0 }
  }).resize(16, 16).png().toFile(path.join(publicDir, 'favicon-16x16.png'));

  await sharp(Buffer.from(appIconSvg)).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  await sharp(Buffer.from(appIconSvg)).resize(192, 192).png().toFile(path.join(publicDir, 'pwa-192x192.png'));
  await sharp(Buffer.from(appIconSvg)).resize(512, 512).png().toFile(path.join(publicDir, 'pwa-512x512.png'));

  console.log('Updated brand vectors and raster icons built successfully!');
}

run().catch(console.error);
