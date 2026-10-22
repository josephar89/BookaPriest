const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const whitePackSrc = 'C:/Users/josep/Downloads/book-a-priest-icon-pack-white/icon-pack-white';
const iconPackDest = path.join(rootDir, 'icon-pack');
const archiveDir = path.join(rootDir, 'archive');
const navyPackArchive = path.join(archiveDir, 'icon-pack-navy');
const navyWebArchive = path.join(archiveDir, 'branding-navy-web-backup');
const publicDir = path.join(rootDir, 'public');
const assetsDir = path.join(rootDir, 'src', 'assets');

// 1. Archive existing icon-pack (navy)
if (fs.existsSync(iconPackDest)) {
  if (fs.existsSync(navyPackArchive)) {
    fs.rmSync(navyPackArchive, { recursive: true, force: true });
  }
  fs.cpSync(iconPackDest, navyPackArchive, { recursive: true });
  console.log('Archived icon-pack (navy) to archive/icon-pack-navy/');
}

// 2. Archive current public web icons
if (!fs.existsSync(navyWebArchive)) {
  fs.mkdirSync(navyWebArchive, { recursive: true });
}
const publicFilesToArchive = [
  'favicon.ico', 'favicon-16.png', 'favicon-16x16.png',
  'favicon-32.png', 'favicon-32x32.png', 'favicon-48.png',
  'apple-touch-icon.png', 'apple-touch-icon-180.png',
  'icon-192.png', 'icon-512.png', 'maskable-512.png',
  'master-icon-1024.png', 'pwa-192x192.png', 'pwa-512x512.png',
  'favicon.svg', 'site.webmanifest'
];
for (const file of publicFilesToArchive) {
  const p = path.join(publicDir, file);
  if (fs.existsSync(p)) {
    fs.copyFileSync(p, path.join(navyWebArchive, file));
  }
}
console.log('Archived navy web icons to archive/branding-navy-web-backup/');

// 3. Copy white icon pack into icon-pack/
if (fs.existsSync(iconPackDest)) {
  fs.rmSync(iconPackDest, { recursive: true, force: true });
}
fs.cpSync(whitePackSrc, iconPackDest, { recursive: true });
console.log('Copied white icon-pack into icon-pack/');

// 4. Copy white web icons into public/
const webSrc = path.join(iconPackDest, 'web');
const webCopies = [
  { from: path.join(webSrc, 'favicon.ico'), to: path.join(publicDir, 'favicon.ico') },
  { from: path.join(webSrc, 'favicon-16.png'), to: path.join(publicDir, 'favicon-16.png') },
  { from: path.join(webSrc, 'favicon-32.png'), to: path.join(publicDir, 'favicon-32.png') },
  { from: path.join(webSrc, 'favicon-48.png'), to: path.join(publicDir, 'favicon-48.png') },
  { from: path.join(webSrc, 'apple-touch-icon-180.png'), to: path.join(publicDir, 'apple-touch-icon-180.png') },
  { from: path.join(webSrc, 'icon-192.png'), to: path.join(publicDir, 'icon-192.png') },
  { from: path.join(webSrc, 'icon-512.png'), to: path.join(publicDir, 'icon-512.png') },
  { from: path.join(webSrc, 'maskable-512.png'), to: path.join(publicDir, 'maskable-512.png') },
  { from: path.join(iconPackDest, 'master-icon-1024.png'), to: path.join(publicDir, 'master-icon-1024.png') },
  { from: path.join(iconPackDest, 'master-icon-1024.png'), to: path.join(publicDir, 'bookapriest-logo.png') },
  { from: path.join(iconPackDest, 'master-icon-1024.png'), to: path.join(assetsDir, 'logo.png') },
];

for (const c of webCopies) {
  if (fs.existsSync(c.from)) {
    fs.copyFileSync(c.from, c.to);
  }
}
console.log('Copied white web icons into public/ and src/assets/');

// 5. Update public/favicon.svg to White background
const whiteFaviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <!-- Clean Pure White Background (Matching white icon-pack) -->
  <rect width="120" height="120" rx="26" fill="#FFFFFF" />

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
      stroke="#131E3C"
      stroke-width="7.5"
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
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), whiteFaviconSvg.trim());

// 6. Delete duplicate icon files in public/
const duplicatesToDelete = [
  'favicon-16x16.png',
  'favicon-32x32.png',
  'apple-touch-icon.png',
  'pwa-192x192.png',
  'pwa-512x512.png'
];
for (const dup of duplicatesToDelete) {
  const p = path.join(publicDir, dup);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    console.log(`Deleted duplicate: public/${dup}`);
  }
}

// 7. Move legacy helper scripts to archive/scripts
const scriptsArchive = path.join(archiveDir, 'scripts');
if (!fs.existsSync(scriptsArchive)) {
  fs.mkdirSync(scriptsArchive, { recursive: true });
}
const scriptsToArchive = [
  'build-final-brand.cjs',
  'generate-brand-assets.cjs',
  'perform-icon-replacement.cjs',
  'process-final-logo.cjs'
];
for (const s of scriptsToArchive) {
  const sp = path.join(rootDir, s);
  if (fs.existsSync(sp)) {
    fs.renameSync(sp, path.join(scriptsArchive, s));
    console.log(`Archived script: ${s}`);
  }
}

console.log('Replacement and cleanup completed successfully!');
