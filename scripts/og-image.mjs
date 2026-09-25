// Genereert public/og-image.png (1200 × 630) in huisstijl: logo, hoofdbelofte
// en de sticker. Rendert HTML met het echte lettertype in Playwright's
// Chromium, zodat de typografie gelijk is aan de site.
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const logo = await readFile('src/assets/logo.svg', 'utf8');
const fontUrl = pathToFileURL(
  'node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2',
).href;

const html = `<!doctype html>
<html lang="nl"><head><meta charset="utf-8">
<style>
  @font-face { font-family: 'Space Grotesk'; src: url('${fontUrl}') format('woff2-variations'); font-weight: 300 700; }
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body { font-family: 'Space Grotesk', sans-serif; color: #111; background: #fff; padding: 64px 72px; position: relative; }
  .top { display: flex; align-items: center; gap: 20px; }
  .box { width: 84px; height: 84px; border-radius: 20px; background: #111; display: flex; align-items: center; justify-content: center; }
  .box svg { width: 60px; height: 60px; }
  .word { font-size: 40px; font-weight: 700; letter-spacing: -0.02em; }
  h1 { margin-top: 56px; font-size: 118px; font-weight: 700; letter-spacing: -0.045em; line-height: 0.95; }
  .mark { background: #C6F432; padding: 0 16px; border-radius: 10px; }
  .sub { margin-top: 36px; font-size: 30px; max-width: 900px; line-height: 1.3; }
  .sticker { position: absolute; right: 72px; top: 64px; transform: rotate(-4deg); border: 4px solid #111; border-radius: 999px; padding: 12px 26px; font-size: 26px; font-weight: 700; background: #FF7AB6; box-shadow: 5px 5px 0 #111; }
  .band { position: absolute; left: -40px; right: -40px; bottom: -22px; height: 64px; background: #111; transform: rotate(-1.2deg); color: #C6F432; font-size: 28px; font-weight: 700; display: flex; align-items: center; gap: 28px; padding-left: 80px; white-space: nowrap; }
  .band span:nth-child(even) { color: #FF7AB6; }
</style></head>
<body>
  <div class="top"><div class="box">${logo}</div><div class="word">Polar Fox</div></div>
  <div class="sticker">Intake bij jou op locatie</div>
  <h1>Maatwerk software.<br><span class="mark">Vast bedrag.</span></h1>
  <p class="sub">Apps en websites die precies passen bij hoe jij werkt. Gebouwd, gehost en onderhouden door één vaste partner.</p>
  <div class="band"><span>Klantportalen</span><span>✦</span><span>Boekingssystemen</span><span>✦</span><span>Dashboards</span><span>✦</span><span>Websites</span><span>✦</span><span>Ledenomgevingen</span><span>✦</span><span>Beheer</span></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'public/og-image.png', type: 'png' });
await browser.close();
console.warn('og-image: public/og-image.png geschreven (1200 × 630)');
