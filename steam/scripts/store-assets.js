// Les visuels de la page Steam (capsules, fond, logo) : node scripts/store-assets.js
// À partir des captures du vrai jeu (store/screenshots/, store/captures/hero_raw.jpg, faites par
// scripts/captures.js) et de la vitrine (../vitrine/img/, captures HD déjà faites), composées en HTML
// (police IM Fell French Canon, store/fonts/, licence OFL) et photographiées par Playwright à la taille exacte.
// → store/capsules/*.png|jpg (PNG si < 2 Mo, sinon JPEG de bonne qualité ; le logo toujours en PNG transparent).
'use strict';
const fs = require('fs');
const path = require('path');
const pw = require(process.env.PLAYWRIGHT || 'playwright');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'store', 'capsules');
const SHOTS = path.join(ROOT, 'store', 'screenshots');
const VITRINE = path.join(ROOT, '..', 'vitrine', 'img');
const FONTS = path.join(ROOT, 'store', 'fonts');
const MAX_PNG = 2 * 1024 * 1024 - 64 * 1024;

const b64 = (f) => fs.readFileSync(f).toString('base64');
const img = (f) => {
  for (const d of [SHOTS, path.join(ROOT, 'store', 'captures'), VITRINE]) { const p = path.join(d, f); if (fs.existsSync(p)) return 'data:image/jpeg;base64,' + b64(p); }
  // la capture du héros n'est pas gardée dans le dépôt : à défaut, le héros déjà composé
  if (f === 'hero_raw.jpg' && fs.existsSync(path.join(OUT, 'library_hero.jpg'))) return 'data:image/jpeg;base64,' + b64(path.join(OUT, 'library_hero.jpg'));
  throw new Error('image introuvable : ' + f);
};
const police = (f, style) => `@font-face { font-family: 'Fell'; font-style: ${style}; font-weight: 400; src: url(data:font/woff2;base64,${b64(path.join(FONTS, f))}) format('woff2'); }`;
const CSS = police('IMFellFrenchCanon-normal-400.woff2', 'normal') + police('IMFellFrenchCanon-italic-400.woff2', 'italic') + `
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; overflow: hidden; background: transparent; }
.fond { position: absolute; inset: 0; background-size: cover; background-position: var(--pos, center); }
.voile { position: absolute; inset: 0; }
.titre { position: absolute; color: #ffc93c; font-family: 'Fell', Georgia, serif; text-align: center; line-height: 1;
  text-shadow: 0 0 0.35em rgba(255, 201, 60, .35), 0 0.04em 0.12em rgba(0, 0, 0, .9); }
.titre .n { letter-spacing: .14em; margin-right: -.14em; display: block; }
.titre .s { display: block; font-style: italic; color: #eee4cc; letter-spacing: .03em; margin-top: .12em; font-size: .36em;
  text-shadow: 0 0.04em 0.14em rgba(0, 0, 0, .95); }
`;
// [nom, largeur, hauteur, html du corps, options]
const titre = (taille, style = '') => `<div class="titre" style="font-size:${taille}px;${style}"><span class="n">NEWY</span><span class="s">and the Dark Forest</span></div>`;
const ASSETS = [
  ['header_capsule', 920, 430, `<div class="fond" style="background-image:url(${img('04_ferme_nuit.jpg')});filter:brightness(1.9) saturate(1.15);background-size:150%;--pos:12% 66%"></div>
    <div class="voile" style="background:linear-gradient(90deg, rgba(8,7,10,.86) 0%, rgba(8,7,10,.55) 45%, rgba(8,7,10,0) 75%)"></div>
    ${titre(118, 'left:46px;top:110px')}`],
  ['small_capsule', 462, 174, `<div class="fond" style="background-image:url(${img('04_ferme_nuit.jpg')});filter:brightness(1.9) saturate(1.15);background-size:150%;--pos:8% 66%"></div>
    <div class="voile" style="background:linear-gradient(90deg, rgba(8,7,10,.9) 0%, rgba(8,7,10,.6) 55%, rgba(8,7,10,.1) 100%)"></div>
    ${titre(70, 'left:22px;top:30px')}`],
  ['main_capsule', 1232, 706, `<div class="fond" style="background-image:url(${img('03_foret_brume.jpg')});--pos:50% 50%"></div>
    <div class="voile" style="background:radial-gradient(ellipse at 50% 42%, rgba(8,7,10,.15) 0%, rgba(8,7,10,.55) 60%, rgba(8,7,10,.85) 100%)"></div>
    ${titre(176, 'left:0;right:0;top:200px')}`],
  ['vertical_capsule', 748, 896, `<div class="fond" style="background-image:url(${img('02_valbrume_soir.jpg')});--pos:46% 50%"></div>
    <div class="voile" style="background:linear-gradient(180deg, rgba(8,7,10,.88) 0%, rgba(8,7,10,.35) 38%, rgba(8,7,10,.1) 60%, rgba(8,7,10,.6) 100%)"></div>
    ${titre(150, 'left:0;right:0;top:70px')}`],
  ['library_capsule', 600, 900, `<div class="fond" style="background-image:url(${img('04_ferme_nuit.jpg')});filter:brightness(1.9) saturate(1.15);--pos:42% 50%"></div>
    <div class="voile" style="background:linear-gradient(180deg, rgba(8,7,10,.9) 0%, rgba(8,7,10,.4) 35%, rgba(8,7,10,.05) 60%, rgba(8,7,10,.55) 100%)"></div>
    ${titre(128, 'left:0;right:0;top:80px')}`],
  ['library_hero', 3840, 1240, `<div class="fond" style="background-image:url(${img('hero_raw.jpg')})"></div>`],
  ['library_logo', 1280, 720, `${titre(330, 'left:0;right:0;top:150px')}`, { transparent: true }],
  ['page_background', 1438, 810, `<div class="fond" style="background-image:url(${img('03_foret_brume.jpg')});filter:saturate(.45) brightness(.42) blur(2px)"></div>
    <div class="voile" style="background:radial-gradient(ellipse at 50% 30%, rgba(13,12,16,0) 0%, rgba(13,12,16,.75) 70%, #0d0c10 100%)"></div>`],
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await pw.chromium.launch();
  for (const [nom, W, H, corps, o = {}] of ASSETS) {
    const p = await b.newPage({ viewport: { width: W, height: H } });
    await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${corps}</body></html>`);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(200);
    for (const ext of ['png', 'jpg']) { try { fs.unlinkSync(path.join(OUT, nom + '.' + ext)); } catch (e) { /* rien */ } }
    let data = await p.screenshot({ type: 'png', omitBackground: !!o.transparent });
    let ext = 'png';
    if (!o.transparent && data.length > MAX_PNG) { data = await p.screenshot({ type: 'jpeg', quality: 92 }); ext = 'jpg'; }
    fs.writeFileSync(path.join(OUT, nom + '.' + ext), data);
    console.log(`${nom}.${ext}  ${W}×${H}  ${(data.length / 1024).toFixed(0)} Ko`);
    await p.close();
  }
  await b.close();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
