// Les succès pour Steamworks : node scripts/achievements.js
//  - store/achievements/256/<API>.png et <API>_locked.png (256 × 256, l'icône
//    « débloquée » et la grise), et store/achievements/64/… (64 × 64) ;
//  - store/achievements/achievements.csv : la liste à saisir dans Steamworks
//    (App Admin › Stats & Achievements) ;
//  - store/achievements/achievements_listing.vdf : la même chose, en VDF lisible ;
//  - store/achievements/loc_french.vdf, loc_english.vdf : modèles de fichiers de
//    traduction (onglet « Localization » des succès) — les jetons NEW_ACHIEVEMENT_x_y
//    sont ceux que Steamworks attribue : à vérifier contre son export.
// Vérifie aussi que la liste est la même que celle du jeu (src/13-zzzzzzS17-succes.js).
'use strict';
const fs = require('fs');
const path = require('path');
const { encodePNG, image } = require('./png');
const { G, PAL } = require('./glyphs');

const ROOT = path.join(__dirname, '..');
const DEF = JSON.parse(fs.readFileSync(path.join(ROOT, 'achievements.json'), 'utf8'));
const OUT = path.join(ROOT, 'store', 'achievements');

// ---------------------------------------------------------------- la liste du jeu, la même ?
const srcJeu = fs.readFileSync(path.join(ROOT, '..', 'src', '13-zzzzzzS17-succes.js'), 'utf8');
const debut = srcJeu.indexOf('const LISTE = ['), fin = srcJeu.indexOf('];', debut);
const jeu = [...srcJeu.slice(debut, fin).matchAll(/\['(NEWY_[A-Z0-9_]+)'/g)].map((m) => m[1]);
const def = DEF.achievements.map((a) => a.api);
if (jeu.join() !== def.join()) {
  console.error('Les succès du jeu et de achievements.json diffèrent :\n jeu : ' + jeu.join(',') + '\n json: ' + def.join(','));
  process.exit(1);
}
for (const a of DEF.achievements) {
  if (!/^[A-Z0-9_]+$/.test(a.api)) throw new Error('nom d’API invalide : ' + a.api);
  if (!G[a.icon]) throw new Error('icône inconnue : ' + a.icon + ' (' + a.api + ')');
  for (const l of ['fr', 'en']) if (!a.name[l] || !a.desc[l]) throw new Error('texte manquant ' + l + ' : ' + a.api);
}

// ---------------------------------------------------------------- les icônes
function icone(nom, S, verrou) {
  const img = image(S, S), d = img.data;
  const { bg, p } = PAL[nom];
  const k = S / 16 * 0.75 | 0;           // taille d'un pixel du dessin (12 à 256, 3 à 64)
  const off = (S - 16 * k) >> 1;
  const bord = Math.max(2, S / 32 | 0);
  const gris = (c) => { const l = c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11; return [l * 0.55, l * 0.55, l * 0.6]; };
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const i = (y * S + x) * 4;
    const dx = (x + 0.5) / S - 0.5, dy = (y + 0.5) / S - 0.42;
    const r = Math.min(1, Math.hypot(dx, dy) * 1.6);
    let c = [bg[0] * (1.25 - r * 0.85), bg[1] * (1.25 - r * 0.85), bg[2] * (1.25 - r * 0.85)];
    // le cadre : bois sombre, liseré clair
    const e = Math.min(x, y, S - 1 - x, S - 1 - y);
    if (e < bord) c = [46, 32, 20];
    else if (e < bord + Math.max(1, bord >> 1)) c = [150, 116, 70];
    if (verrou) c = gris(c);
    d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255;
  }
  const L = G[nom];
  const ombre = Math.max(1, k >> 2);
  for (const pass of [0, 1]) for (let gy = 0; gy < 16; gy++) for (let gx = 0; gx < 16; gx++) {
    const ch = L[gy][gx];
    if (ch === '.') continue;
    let c = ch === '#' ? [26, 18, 12] : p[ch];
    if (pass === 0) c = [0, 0, 0];
    if (verrou && pass === 1) c = gris(c);
    const o = pass === 0 ? ombre : 0;
    for (let yy = 0; yy < k; yy++) for (let xx = 0; xx < k; xx++) {
      const X = off + gx * k + xx + o, Y = off + gy * k + yy + o;
      if (X >= S || Y >= S) continue;
      const i = (Y * S + X) * 4;
      if (pass === 0) { d[i] *= 0.5; d[i + 1] *= 0.5; d[i + 2] *= 0.5; } else { d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; }
    }
  }
  return encodePNG(img);
}

for (const S of [256, 64]) fs.mkdirSync(path.join(OUT, String(S)), { recursive: true });
let octets = 0;
for (const a of DEF.achievements) {
  for (const S of [256, 64]) {
    for (const v of [false, true]) {
      const b = icone(a.icon, S, v);
      octets += b.length;
      fs.writeFileSync(path.join(OUT, String(S), a.api + (v ? '_locked' : '') + '.png'), b);
    }
  }
}

// ---------------------------------------------------------------- la liste (CSV, VDF)
const q = (s) => '"' + String(s).replace(/"/g, '""') + '"';
const csv = ['api_name,display_name_fr,description_fr,display_name_en,description_en,hidden,icon_achieved,icon_unachieved,rule']
  .concat(DEF.achievements.map((a) => [a.api, a.name.fr, a.desc.fr, a.name.en, a.desc.en, a.hidden ? 1 : 0, '256/' + a.api + '.png', '256/' + a.api + '_locked.png', a.rule].map(q).join(',')));
fs.writeFileSync(path.join(OUT, 'achievements.csv'), '﻿' + csv.join('\r\n') + '\r\n');

const v = (s) => '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
let vdf = '// Newy and the Dark Forest — liste des succès (à saisir dans Steamworks ; ce fichier n\'est pas importable tel quel)\n"achievements"\n{\n';
DEF.achievements.forEach((a, i) => {
  vdf += `\t"${i + 1}"\n\t{\n\t\t"apiname"\t${v(a.api)}\n\t\t"hidden"\t"${a.hidden ? 1 : 0}"\n\t\t"icon"\t${v('256/' + a.api + '.png')}\n\t\t"icon_gray"\t${v('256/' + a.api + '_locked.png')}\n`;
  vdf += `\t\t"display"\n\t\t{\n\t\t\t"name"\n\t\t\t{\n\t\t\t\t"english"\t${v(a.name.en)}\n\t\t\t\t"french"\t${v(a.name.fr)}\n\t\t\t}\n\t\t\t"desc"\n\t\t\t{\n\t\t\t\t"english"\t${v(a.desc.en)}\n\t\t\t\t"french"\t${v(a.desc.fr)}\n\t\t\t}\n\t\t}\n\t}\n`;
});
vdf += '}\n';
if (DEF.stats) {
  vdf += '"stats"\n{\n';
  for (const s of DEF.stats) vdf += `\t${v(s.api)}\t{ "type" "${s.type}" "incrementonly" "${s.increment_only ? 1 : 0}" "displayname" ${v(s.name.en)} }\n`;
  vdf += '}\n';
}
fs.writeFileSync(path.join(OUT, 'achievements_listing.vdf'), vdf);

// modèles de traduction (onglet Localization) : jetons supposés NEW_ACHIEVEMENT_1_<i> (à vérifier)
for (const [lang, l] of [['french', 'fr'], ['english', 'en']]) {
  let t = `"lang"\n{\n\t"Language"\t"${lang}"\n\t"Tokens"\n\t{\n`;
  DEF.achievements.forEach((a, i) => {
    t += `\t\t"NEW_ACHIEVEMENT_1_${i}_NAME"\t${v(a.name[l])}\n\t\t"NEW_ACHIEVEMENT_1_${i}_DESC"\t${v(a.desc[l])}\n`;
  });
  t += '\t}\n}\n';
  fs.writeFileSync(path.join(OUT, 'loc_' + lang + '.vdf'), t);
}
console.log(`${DEF.achievements.length} succès, ${DEF.achievements.length * 4} icônes (${(octets / 1024).toFixed(0)} Ko) → store/achievements/`);
