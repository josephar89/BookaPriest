const fs = require('fs');
const path = require('path');
const sharp = require('./node_modules/sharp');

const colorUpload = 'C:/Users/josep/.gemini/antigravity/brain/b04374e6-81b5-4c96-843d-644384f74a74/.user_uploaded/media_1792695175269_ca288aa1.png';
const monoUpload = 'C:/Users/josep/.gemini/antigravity/brain/b04374e6-81b5-4c96-843d-644384f74a74/.user_uploaded/media_1792695175270_4457dc9d.png';

const publicDir = path.resolve(__dirname, 'public');
const assetsDir = path.resolve(__dirname, 'src/assets');

// Ensure assetsDir exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// 1. Copy original master PNGs
fs.copyFileSync(colorUpload, path.join(publicDir, 'bookapriest-logo.png'));
fs.copyFileSync(monoUpload, path.join(publicDir, 'bookapriest-logo-monochrome.png'));
fs.copyFileSync(colorUpload, path.join(assetsDir, 'logo.png'));
fs.copyFileSync(monoUpload, path.join(assetsDir, 'logo-monochrome.png'));

console.log('Copied master logo PNG files to public/ and src/assets/');
