// Genereert favicons uit src/assets/logo.svg.
// De vos is wit, dus hij staat op een zwart vierkant met afgeronde hoeken
// (zelfde vorm als in de menubalk). Uitvoer in public/: favicon.svg,
// favicon.ico (32 px), favicon-16x16.png, favicon-32x32.png,
// apple-touch-icon.png (180 px) en icon-512.png.
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const INK = '#111111';
const SIZES = [
  { size: 16, file: 'public/favicon-16x16.png' },
  { size: 32, file: 'public/favicon-32x32.png' },
  { size: 180, file: 'public/apple-touch-icon.png' },
  { size: 512, file: 'public/icon-512.png' },
];

const logo = await readFile('src/assets/logo.svg', 'utf8');
// Alleen de tekening (zonder de <svg>-wrapper) hergebruiken.
const inner = logo.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

// Vos op 72% van het vlak, gecentreerd; hoekradius 25% (zoals 12 px op 48 px).
const wrapped = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <rect width="120" height="120" rx="30" fill="${INK}"/>
  <g transform="translate(16.8 16.8) scale(0.72)">${inner}</g>
</svg>`;

await writeFile('public/favicon.svg', wrapped);

for (const { size, file } of SIZES) {
  await sharp(Buffer.from(wrapped), { density: 384 }).resize(size, size).png().toFile(file);
}

// favicon.ico: ICO-container met één PNG van 32 px erin (wordt door alle
// moderne browsers en crawlers begrepen; scheelt een extra afhankelijkheid).
const png32 = await sharp(Buffer.from(wrapped), { density: 384 }).resize(32, 32).png().toBuffer();
const header = Buffer.alloc(6 + 16);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // aantal beelden
header.writeUInt8(32, 6); // breedte
header.writeUInt8(32, 7); // hoogte
header.writeUInt8(0, 8); // kleuren in palet
header.writeUInt8(0, 9); // reserved
header.writeUInt16LE(1, 10); // kleurvlakken
header.writeUInt16LE(32, 12); // bits per pixel
header.writeUInt32LE(png32.length, 14); // grootte van het beeld
header.writeUInt32LE(22, 18); // offset van het beeld
await writeFile('public/favicon.ico', Buffer.concat([header, png32]));

console.warn(`favicons: ${SIZES.length + 2} bestanden geschreven in public/`);
