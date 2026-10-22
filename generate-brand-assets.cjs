const fs = require('fs');
const path = require('path');
const sharp = require('./node_modules/sharp');

const publicDir = path.resolve(__dirname, 'public');

// --- 1. Pure SVG Symbol (Standard Light Variant) ---
// Note: Left Papal Yellow semicircle, white priest interior, navy linework, red liturgical crosses
const getSymbolSvg = ({ size = 512, background = 'transparent' } = {}) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">
  ${background !== 'transparent' ? `<rect width="100" height="100" fill="${background}" rx="22"/>` : ''}
  <defs>
    <!-- Left Semicircle Clip -->
    <clipPath id="semicircle-left">
      <rect x="0" y="0" width="50" height="100" />
    </clipPath>
  </defs>

  <!-- Papal Gold Left Disc (Flat, no outer stroke) -->
  <circle cx="50" cy="50" r="41" fill="#F7B918" clip-path="url(#semicircle-left)" />

  <!-- Priest Silhouette Group -->
  <!-- Priestly Body / Hood White Fill (masks the gold behind the head and stole) -->
  <!-- Head & Pin Contour -->
  <path 
    d="M 50 13 C 35 13 31 27 31 39 C 31 49 39 57 44 61 L 30 67 C 26 69 24 74 24 81 L 26.5 88.5 C 27 90 28.5 90.5 30.5 89.5 L 38 85.5 C 39.5 84.5 40 82.5 39.5 81 L 36.5 71 C 41 67.5 45.5 66 50 66 C 54.5 66 59 67.5 63.5 71 L 60.5 81 C 60 82.5 60.5 84.5 62 85.5 L 69.5 89.5 C 71.5 90.5 73 90 73.5 88.5 L 76 81 C 76 74 74 69 70 67 L 56 61 C 61 57 69 49 69 39 C 69 27 65 13 50 13 Z" 
    fill="#FFFFFF"
    stroke="#1A2238" 
    stroke-width="5" 
    stroke-linecap="round" 
    stroke-linejoin="round"
  />

  <!-- Central Latin Cross -->
  <line x1="50" y1="21" x2="50" y2="47" stroke="#1A2238" stroke-width="5.5" stroke-linecap="round" />
  <line x1="39" y1="29" x2="61" y2="29" stroke="#1A2238" stroke-width="5.5" stroke-linecap="round" />

  <!-- Inner Collar / Stole Clasp Curve -->
  <path 
    d="M 40 52 C 45 58 55 58 60 52" 
    fill="none" 
    stroke="#1A2238" 
    stroke-width="4.5" 
    stroke-linecap="round" 
  />

  <!-- Left Stole Red Liturgical Cross -->
  <line x1="32" y1="76" x2="32" y2="83" stroke="#C22E28" stroke-width="3" stroke-linecap="round" />
  <line x1="28.5" y1="79.5" x2="35.5" y2="79.5" stroke="#C22E28" stroke-width="3" stroke-linecap="round" />

  <!-- Right Stole Red Liturgical Cross -->
  <line x1="68" y1="76" x2="68" y2="83" stroke="#C22E28" stroke-width="3" stroke-linecap="round" />
  <line x1="64.5" y1="79.5" x2="71.5" y2="79.5" stroke="#C22E28" stroke-width="3" stroke-linecap="round" />
</svg>
`;

// --- 2. Dark Mode SVG Symbol ---
const getDarkSymbolSvg = ({ size = 512, background = '#1A2238' } = {}) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">
  ${background !== 'transparent' ? `<rect width="100" height="100" fill="${background}" rx="22"/>` : ''}
  
  <!-- Head & Pin Contour in Papal Gold -->
  <path 
    d="M 50 13 C 35 13 31 27 31 39 C 31 49 39 57 44 61 L 30 67 C 26 69 24 74 24 81 L 26.5 88.5 C 27 90 28.5 90.5 30.5 89.5 L 38 85.5 C 39.5 84.5 40 82.5 39.5 81 L 36.5 71 C 41 67.5 45.5 66 50 66 C 54.5 66 59 67.5 63.5 71 L 60.5 81 C 60 82.5 60.5 84.5 62 85.5 L 69.5 89.5 C 71.5 90.5 73 90 73.5 88.5 L 76 81 C 76 74 74 69 70 67 L 56 61 C 61 57 69 49 69 39 C 69 27 65 13 50 13 Z" 
    fill="#1A2238"
    stroke="#F7B918" 
    stroke-width="5" 
    stroke-linecap="round" 
    stroke-linejoin="round"
  />

  <!-- Central Latin Cross in Papal Gold -->
  <line x1="50" y1="21" x2="50" y2="47" stroke="#F7B918" stroke-width="5.5" stroke-linecap="round" />
  <line x1="39" y1="29" x2="61" y2="29" stroke="#F7B918" stroke-width="5.5" stroke-linecap="round" />

  <!-- Inner Collar / Stole Clasp Curve in Papal Gold -->
  <path 
    d="M 40 52 C 45 58 55 58 60 52" 
    fill="none" 
    stroke="#F7B918" 
    stroke-width="4.5" 
    stroke-linecap="round" 
  />

  <!-- Left Stole Red/Gold Liturgical Cross -->
  <line x1="32" y1="76" x2="32" y2="83" stroke="#F7B918" stroke-width="3" stroke-linecap="round" />
  <line x1="28.5" y1="79.5" x2="35.5" y2="79.5" stroke="#F7B918" stroke-width="3" stroke-linecap="round" />

  <!-- Right Stole Red/Gold Liturgical Cross -->
  <line x1="68" y1="76" x2="68" y2="83" stroke="#F7B918" stroke-width="3" stroke-linecap="round" />
  <line x1="64.5" y1="79.5" x2="71.5" y2="79.5" stroke="#F7B918" stroke-width="3" stroke-linecap="round" />
</svg>
`;

// --- 3. App Icon (With rounded squircle background & gentle padding) ---
const getAppIconSvg = ({ size = 512, mode = 'light' } = {}) => {
  if (mode === 'dark') {
    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">
  <rect width="100" height="100" rx="22" fill="#1A2238" />
  
  <defs>
    <clipPath id="semicircle-left-dark-app">
      <rect x="0" y="0" width="50" height="100" />
    </clipPath>
  </defs>

  <g transform="translate(5, 5) scale(0.9)">
    <!-- Yellow Semicircle -->
    <circle cx="50" cy="50" r="41" fill="#F7B918" clip-path="url(#semicircle-left-dark-app)" />
    <!-- White Semicircle for contrast on dark -->
    <circle cx="50" cy="50" r="41" fill="#FFFFFF" clip-path="url(#semicircle-left-dark-app)" opacity="0" />

    <!-- Priest Contour -->
    <path 
      d="M 50 13 C 35 13 31 27 31 39 C 31 49 39 57 44 61 L 30 67 C 26 69 24 74 24 81 L 26.5 88.5 C 27 90 28.5 90.5 30.5 89.5 L 38 85.5 C 39.5 84.5 40 82.5 39.5 81 L 36.5 71 C 41 67.5 45.5 66 50 66 C 54.5 66 59 67.5 63.5 71 L 60.5 81 C 60 82.5 60.5 84.5 62 85.5 L 69.5 89.5 C 71.5 90.5 73 90 73.5 88.5 L 76 81 C 76 74 74 69 70 67 L 56 61 C 61 57 69 49 69 39 C 69 27 65 13 50 13 Z" 
      fill="#FFFFFF"
      stroke="#1A2238" 
      stroke-width="5" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    />

    <line x1="50" y1="21" x2="50" y2="47" stroke="#1A2238" stroke-width="5.5" stroke-linecap="round" />
    <line x1="39" y1="29" x2="61" y2="29" stroke="#1A2238" stroke-width="5.5" stroke-linecap="round" />

    <path 
      d="M 40 52 C 45 58 55 58 60 52" 
      fill="none" 
      stroke="#1A2238" 
      stroke-width="4.5" 
      stroke-linecap="round" 
    />

    <line x1="32" y1="76" x2="32" y2="83" stroke="#C22E28" stroke-width="3" stroke-linecap="round" />
    <line x1="28.5" y1="79.5" x2="35.5" y2="79.5" stroke="#C22E28" stroke-width="3" stroke-linecap="round" />

    <line x1="68" y1="76" x2="68" y2="83" stroke="#C22E28" stroke-width="3" stroke-linecap="round" />
    <line x1="64.5" y1="79.5" x2="71.5" y2="79.5" stroke="#C22E28" stroke-width="3" stroke-linecap="round" />
  </g>
</svg>
`;
  }

  // Light App Icon
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">
  <rect width="100" height="100" rx="22" fill="#FFFFFF" />
  <rect width="98" height="98" x="1" y="1" rx="21" fill="none" stroke="#E5E7EB" stroke-width="2" />
  
  <defs>
    <clipPath id="semicircle-left-light-app">
      <rect x="0" y="0" width="50" height="100" />
    </clipPath>
  </defs>

  <g transform="translate(5, 5) scale(0.9)">
    <circle cx="50" cy="50" r="41" fill="#F7B918" clip-path="url(#semicircle-left-light-app)" />

    <path 
      d="M 50 13 C 35 13 31 27 31 39 C 31 49 39 57 44 61 L 30 67 C 26 69 24 74 24 81 L 26.5 88.5 C 27 90 28.5 90.5 30.5 89.5 L 38 85.5 C 39.5 84.5 40 82.5 39.5 81 L 36.5 71 C 41 67.5 45.5 66 50 66 C 54.5 66 59 67.5 63.5 71 L 60.5 81 C 60 82.5 60.5 84.5 62 85.5 L 69.5 89.5 C 71.5 90.5 73 90 73.5 88.5 L 76 81 C 76 74 74 69 70 67 L 56 61 C 61 57 69 49 69 39 C 69 27 65 13 50 13 Z" 
      fill="#FFFFFF"
      stroke="#1A2238" 
      stroke-width="5" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    />

    <line x1="50" y1="21" x2="50" y2="47" stroke="#1A2238" stroke-width="5.5" stroke-linecap="round" />
    <line x1="39" y1="29" x2="61" y2="29" stroke="#1A2238" stroke-width="5.5" stroke-linecap="round" />

    <path 
      d="M 40 52 C 45 58 55 58 60 52" 
      fill="none" 
      stroke="#1A2238" 
      stroke-width="4.5" 
      stroke-linecap="round" 
    />

    <line x1="32" y1="76" x2="32" y2="83" stroke="#C22E28" stroke-width="3" stroke-linecap="round" />
    <line x1="28.5" y1="79.5" x2="35.5" y2="79.5" stroke="#C22E28" stroke-width="3" stroke-linecap="round" />

    <line x1="68" y1="76" x2="68" y2="83" stroke="#C22E28" stroke-width="3" stroke-linecap="round" />
    <line x1="64.5" y1="79.5" x2="71.5" y2="79.5" stroke="#C22E28" stroke-width="3" stroke-linecap="round" />
  </g>
</svg>
`;
};

async function generateAll() {
  console.log('Writing vector SVGs...');
  const lightSvg = getSymbolSvg();
  const darkSvg = getDarkSymbolSvg();
  const lightAppIconSvg = getAppIconSvg({ size: 512, mode: 'light' });
  const darkAppIconSvg = getAppIconSvg({ size: 512, mode: 'dark' });

  // 1. Save SVGs to public
  fs.writeFileSync(path.join(publicDir, 'book-a-priest-symbol.svg'), lightSvg.trim());
  fs.writeFileSync(path.join(publicDir, 'book-a-priest-symbol-dark.svg'), darkSvg.trim());
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), lightSvg.trim());
  fs.writeFileSync(path.join(publicDir, 'app-icon.svg'), darkAppIconSvg.trim());

  // 2. Generate PNGs using Sharp
  console.log('Generating PNG favicons & app icons...');
  
  // favicon 32x32
  await sharp(Buffer.from(lightSvg))
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));

  // favicon 16x16
  await sharp(Buffer.from(lightSvg))
    .resize(16, 16)
    .png()
    .toFile(path.join(publicDir, 'favicon-16x16.png'));

  // apple-touch-icon 180x180
  await sharp(Buffer.from(darkAppIconSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // pwa 192x192
  await sharp(Buffer.from(darkAppIconSvg))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // pwa 512x512
  await sharp(Buffer.from(darkAppIconSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // 3. Web manifest
  const manifest = {
    name: "Book a Priest",
    short_name: "BookaPriest",
    description: "Connecting Priests, Parishes & Religious Communities across India.",
    start_url: "/",
    display: "standalone",
    background_color: "#1A2238",
    theme_color: "#F7B918",
    icons: [
      {
        src: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png"
      },
      {
        src: "/pwa-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/pwa-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ]
  };

  fs.writeFileSync(path.join(publicDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2));
  console.log('All branding assets generated successfully!');
}

generateAll().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
