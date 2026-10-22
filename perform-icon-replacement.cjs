const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const archiveDir = path.join(rootDir, 'archive', 'branding-v3-backup');
const publicDir = path.join(rootDir, 'public');
const assetsDir = path.join(rootDir, 'src', 'assets');
const iconPackDir = path.join(rootDir, 'icon-pack');

// 1. Ensure Archive directory exists
if (!fs.existsSync(archiveDir)) {
  fs.mkdirSync(archiveDir, { recursive: true });
}

// 2. Files to archive from public and src/assets
const filesToArchiveFromPublic = [
  'book-a-priest-symbol.svg',
  'book-a-priest-symbol-monochrome.svg',
  'book-a-priest-symbol-dark.svg',
  'bookapriest-logo.png',
  'bookapriest-logo-monochrome.png',
  'app-icon.svg',
  'favicon.svg',
  'favicon.ico',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'apple-touch-icon.png',
  'apple-touch-icon-180.png',
  'pwa-192x192.png',
  'pwa-512x512.png',
  'icon-192.png',
  'icon-512.png',
  'maskable-512.png',
  'site.webmanifest'
];

const filesToArchiveFromAssets = [
  'logo.png',
  'logo.svg',
  'logo-monochrome.png',
  'logo-monochrome.svg'
];

let archivedCount = 0;
for (const file of filesToArchiveFromPublic) {
  const src = path.join(publicDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(archiveDir, `public_${file}`));
    archivedCount++;
  }
}

for (const file of filesToArchiveFromAssets) {
  const src = path.join(assetsDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(archiveDir, `assets_${file}`));
    archivedCount++;
  }
}

const archiveReadme = `# Branding & Icon Backup (v3)
Created: ${new Date().toISOString()}

This folder contains a safe, full backup of the previous logo and icon assets prior to importing the official book-a-priest-icon-pack (v4 navy background master icon set).

To restore any file, copy it back to public/ or src/assets/ without the prefix.
`;
fs.writeFileSync(path.join(archiveDir, 'README.md'), archiveReadme);
console.log(`Successfully backed up ${archivedCount} assets to archive/branding-v3-backup/`);

// 3. Replace all existing web assets from icon-pack/web and icon-pack/
const webDir = path.join(iconPackDir, 'web');

const copies = [
  // Web icons
  { from: path.join(webDir, 'favicon.ico'), to: path.join(publicDir, 'favicon.ico') },
  { from: path.join(webDir, 'favicon-16.png'), to: path.join(publicDir, 'favicon-16.png') },
  { from: path.join(webDir, 'favicon-16.png'), to: path.join(publicDir, 'favicon-16x16.png') },
  { from: path.join(webDir, 'favicon-32.png'), to: path.join(publicDir, 'favicon-32.png') },
  { from: path.join(webDir, 'favicon-32.png'), to: path.join(publicDir, 'favicon-32x32.png') },
  { from: path.join(webDir, 'favicon-48.png'), to: path.join(publicDir, 'favicon-48.png') },
  { from: path.join(webDir, 'apple-touch-icon-180.png'), to: path.join(publicDir, 'apple-touch-icon-180.png') },
  { from: path.join(webDir, 'apple-touch-icon-180.png'), to: path.join(publicDir, 'apple-touch-icon.png') },
  { from: path.join(webDir, 'icon-192.png'), to: path.join(publicDir, 'icon-192.png') },
  { from: path.join(webDir, 'icon-192.png'), to: path.join(publicDir, 'pwa-192x192.png') },
  { from: path.join(webDir, 'icon-512.png'), to: path.join(publicDir, 'icon-512.png') },
  { from: path.join(webDir, 'icon-512.png'), to: path.join(publicDir, 'pwa-512x512.png') },
  { from: path.join(webDir, 'maskable-512.png'), to: path.join(publicDir, 'maskable-512.png') },

  // Master icon
  { from: path.join(iconPackDir, 'master-icon-1024.png'), to: path.join(publicDir, 'master-icon-1024.png') },
  { from: path.join(iconPackDir, 'master-icon-1024.png'), to: path.join(publicDir, 'bookapriest-logo.png') },
  { from: path.join(iconPackDir, 'master-icon-1024.png'), to: path.join(assetsDir, 'logo.png') },
];

let replacedCount = 0;
for (const item of copies) {
  if (fs.existsSync(item.from)) {
    fs.copyFileSync(item.from, item.to);
    replacedCount++;
  } else {
    console.warn(`Source file not found: ${item.from}`);
  }
}
console.log(`Replaced and updated ${replacedCount} web assets with the new icon pack!`);

// 4. Update favicon.svg to match master icon (Navy background #131E3C + Yellow pin with priest)
const navyFaviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <!-- Solid Navy #131E3C Background (Matching master-icon-1024) -->
  <rect width="120" height="120" rx="26" fill="#131E3C" />

  <!-- Map Pin Body (Papal Gold fill + Midnight Navy outer contour) -->
  <g transform="translate(10, 2)">
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

    <!-- Priest Silhouette Group (Midnight Navy #131E3C) -->
    <g fill="#131E3C">
      <!-- Priest Head -->
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

    <!-- Roman Clerical Collar Tab -->
    <rect x="47" y="53.5" width="6" height="5.5" fill="#FFFFFF" rx="0.5" />

    <!-- White Latin Cross on Pectoral Vestment -->
    <rect x="46.5" y="63.5" width="7" height="22" fill="#FFFFFF" rx="0.5" />
    <rect x="38.5" y="69.5" width="23" height="7" fill="#FFFFFF" rx="0.5" />
  </g>
</svg>
`;
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), navyFaviconSvg.trim());
console.log('Updated public/favicon.svg to match master navy colorway.');
