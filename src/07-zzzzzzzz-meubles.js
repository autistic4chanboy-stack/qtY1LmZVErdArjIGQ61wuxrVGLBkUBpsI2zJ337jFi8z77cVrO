// ============================================================================
//  MEUBLES (modèles) : les meubles qu'on pose chez soi (11-zzzz4-meubles.js).
//  Nouveaux : lit clos (à volets coulissants), horloge comtoise (balancier et
//  aiguilles animés), chandelier de fer à trois bougies, guéridon et sa lampe à
//  huile, tableau à accrocher (quatre toiles), fauteuil tapissé. Les autres
//  (lit, armoire, commode, buffet, malle, étagère, table, chaise, banc, coffre,
//  tapis, pot de fleurs) reprennent les modèles existants.
//  L'avant de chaque modèle regarde +z ; l'origine est au sol, au centre (le
//  tableau : au mur, au milieu du bas du cadre).
//  Tuiles peintes de l'atlas des peaux : 170 à 177 (toiles, cadran, bois
//  sculpté, velours, fuseaux).
// ============================================================================
Object.assign(TL, { meuToile0: 170, meuToile1: 171, meuToile2: 172, meuToile3: 173, meuCadran: 174, meuSculpte: 175, meuVelours: 176, meuFuseaux: 177 });
const MEU_TOILES = [TL.meuToile0, TL.meuToile1, TL.meuToile2, TL.meuToile3];

function meublesTuiles(cv) {
  const ctx = cv.getContext('2d');
  const T = (idx, fn) => {
    const img = ctx.createImageData(16, 16), D = img.data;
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      let c = fn(x, y); if (typeof c === 'number') c = [c, c, c];
      const k = (y * 16 + x) * 4;
      D[k] = clamp(Math.round(c[0]), 0, 255); D[k + 1] = clamp(Math.round(c[1]), 0, 255); D[k + 2] = clamp(Math.round(c[2]), 0, 255); D[k + 3] = 255;
    }
    ctx.putImageData(img, (idx % 16) * 16, Math.floor(idx / 16) * 16);
  };
  const N = (x, y, s) => hash2i(x, y, s);
  const mix = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  const grain = (c, x, y, s, k) => { const v = 1 + (N(x, y, s) - 0.5) * (k || 0.12); return [c[0] * v, c[1] * v, c[2] * v]; };
  // toile 0 : la vallée au soir, le clocher, un chemin
  T(TL.meuToile0, (x, y) => {
    if (y <= 8) {
      let c = mix([58, 66, 104], [214, 162, 104], y / 8);
      if (x === 11 && y >= 2) c = [38, 34, 40];
      if ((x === 10 || x === 12) && y >= 5) c = [46, 40, 44];
      if (y === 8 && (x < 3 || x > 13)) c = [70, 84, 72];
      return grain(c, x, y, 961, 0.06);
    }
    const colline = 9 + Math.round(Math.sin(x * 0.55 + 1) * 0.9);
    if (y <= colline) return grain([62, 82, 70], x, y, 962);
    const chemin = Math.abs(x - (4 + (y - 9) * 1.1)) < 0.9;
    return grain(chemin ? [196, 172, 124] : mix([86, 118, 66], [120, 108, 58], (y - 10) / 5), x, y, 963, 0.16);
  });
  // toile 1 : un portrait d'aïeul (on ne sait pas qui)
  T(TL.meuToile1, (x, y) => {
    const dx = x - 7.5, fond = mix([74, 56, 40], [40, 30, 24], Math.min(1, Math.hypot(dx, y - 6) / 9));
    let c = fond;
    const tete = Math.hypot(dx / 2.2, (y - 5.2) / 2.8) < 1;
    if (y >= 10 || (y === 9 && Math.abs(dx) < 4)) c = [34, 30, 34];            // l'habit noir
    if ((y === 9 || y === 10) && Math.abs(dx) < 1.6) c = [226, 218, 200];        // le col blanc
    if (tete) c = [206, 168, 138];
    if (tete && y <= 3) c = [52, 40, 32];                                        // les cheveux
    if (y === 5 && (x === 6 || x === 9)) c = [34, 24, 22];                       // les yeux
    if (y === 7 && (x === 7 || x === 8)) c = [150, 96, 86];                      // la bouche
    return grain(c, x, y, 964, 0.08);
  });
  // toile 2 : nature morte (pichet d'étain, pomme, poire, raisin)
  T(TL.meuToile2, (x, y) => {
    let c = mix([52, 44, 34], [30, 26, 22], y / 15);
    if (y >= 11) c = y === 11 ? [150, 108, 66] : [104, 72, 44];
    if (x >= 2 && x <= 4 && y >= 4 && y <= 10) c = x === 2 ? [150, 150, 156] : [118, 118, 126];   // le pichet
    if (x === 5 && (y === 5 || y === 6)) c = [110, 110, 118];
    if (Math.hypot(x - 7, y - 9) < 1.8) c = y < 9 ? [210, 70, 48] : [168, 40, 30];                // la pomme
    if (Math.hypot(x - 10.5, y - 8.5) < 1.6 || (x === 10 && y === 6)) c = [206, 178, 70];          // la poire
    if (x >= 12 && x <= 14 && y >= 8 && y <= 10 && (x + y) % 2 === 0) c = [96, 54, 104];           // le raisin
    return grain(c, x, y, 965, 0.08);
  });
  // toile 3 : le lac, la nuit ; sur la rive, quelqu'un
  T(TL.meuToile3, (x, y) => {
    let c = mix([18, 22, 40], [34, 42, 66], y / 8);
    if (y <= 7 && N(x, y, 966) > 0.93) c = [206, 206, 224];                      // étoiles
    if (Math.hypot(x - 11, y - 2.6) < 1.6) c = [232, 230, 206];                  // la lune
    if (y === 8 || (y === 7 && (x < 2 || x > 13))) c = [10, 12, 16];            // la rive d'en face
    if (y >= 9) { c = [24, 32, 50]; if (Math.abs(x - 11) < 1 && y % 2 === 1) c = [140, 140, 132]; }
    if (x === 4 && y >= 6 && y <= 8) c = [214, 214, 218];                        // une silhouette pâle
    return c;
  });
  // cadran : disque d'émail, douze heures, coins de laiton
  T(TL.meuCadran, (x, y) => {
    const d = Math.hypot(x - 7.5, y - 7.5);
    if (d > 7.6) return [176, 142, 70];
    if (d > 6.9) return [70, 56, 36];
    const a = Math.atan2(y - 7.5, x - 7.5), h = Math.round(a / (Math.PI / 6));
    if (d > 5 && d < 6.3 && Math.abs(a - h * Math.PI / 6) < 0.12) return [36, 30, 26];
    return 238 - d * 2;
  });
  // bois sculpté : une rosace dans un panneau (lit clos)
  T(TL.meuSculpte, (x, y) => {
    const base = [92, 62, 40], d = Math.hypot(x - 7.5, y - 7.5), a = Math.atan2(y - 7.5, x - 7.5);
    let k = 0.82 + N(x >> 2, y, 967) * 0.14;
    if (x === 0 || y === 0) k = 1.08; else if (x === 15 || y === 15) k = 0.55;
    else if (d < 5.6 && d > 4.6) k = 0.58;
    else if (d < 4.4 && Math.cos(a * 6) > 0.35) k = 1.05;
    else if (d < 1.2) k = 0.6;
    return [base[0] * k, base[1] * k, base[2] * k];
  });
  // velours : fond sombre, damas plus clair (se teinte avec la couleur de l'étoffe)
  T(TL.meuVelours, (x, y) => {
    const u = ((x + 4) % 8) - 3.5, v = ((y + 4) % 8) - 3.5, los = Math.abs(u) + Math.abs(v);
    let g = 196 + N(x, y, 968) * 14;
    if (los < 2.2) g += 34; else if (los < 3) g -= 22;
    if (y === 15) g -= 30;
    return g;
  });
  // fuseaux tournés, entre deux traverses (le haut du lit clos)
  T(TL.meuFuseaux, (x, y) => {
    const b = [118, 82, 52];
    if (y <= 1 || y >= 14) return [b[0] * 0.9, b[1] * 0.9, b[2] * 0.9];
    const k = x & 3;
    if (k === 0) return [26, 18, 12];
    const renfl = (y === 5 || y === 10) ? 1.18 : (y === 7 || y === 8) ? 0.8 : 1;
    const e = k === 2 ? 1.12 : k === 3 ? 0.78 : 1;
    return [b[0] * renfl * e, b[1] * renfl * e, b[2] * renfl * e];
  });
}
{
  const _bsa = buildSkinAtlas;
  buildSkinAtlas = function () {
    _bsa();
    try { meublesTuiles(SKIN.canvas); } catch (e) { console.warn('meubles : tuiles', e); }
  };
}

// ---------------------------------------------------------------- couleurs
const PC6 = {
  bois: rgbf('#9a7048'), chene: rgbf('#6a4a30'), laiton: rgbf('#c89a48'), fer: rgbf('#3e3e44'), cire: [0.95, 0.92, 0.85],
  flamme: [1.5, 1.1, 0.5], email: [0.94, 0.92, 0.86], dore: rgbf('#c8a050'), ombre: [0.1, 0.08, 0.07], verre: [0.78, 0.84, 0.88],
};

// ---------------------------------------------------------------- les modèles
Object.assign(PROP_MODELS, {
  // lit clos : une armoire où l'on dort ; deux volets coulissants sur la longueur, l'un ouvert
  lit_clos(E, o) {
    const col = o.data && o.data.col ? rgbf(o.data.col) : rgbf('#6a3a3a'), sc = tx(TL.darkwood, TL.meuSculpte);
    E.bx(0, 0, -0.47, 2.0, 1.72, 0.06, WHITE, TL.darkwood);                          // le fond
    for (const s of [-1, 1]) {
      E.bx(s * 0.97, 0, 0, 0.06, 1.72, 1.0, WHITE, TL.darkwood);                      // les côtés
      E.bx(s * 1.003, 0.85, 0, 0.01, 0.62, 0.74, WHITE, TL.meuSculpte);               // et leurs panneaux sculptés
    }
    E.bx(0, 1.66, 0, 2.08, 0.1, 1.06, WHITE, TL.darkwood);                            // la corniche
    E.bx(0, 1.62, 0.02, 1.96, 0.04, 1.0, WHITE, TL.darkwood);
    E.bx(0, 0, 0.02, 2.0, 0.36, 0.96, WHITE, TL.darkwood);                            // le coffre du bas
    for (const x of [-0.6, 0, 0.6]) E.bx(x, 0.07, 0.505, 0.3, 0.22, 0.01, WHITE, TL.meuSculpte);
    E.bx(0, 0.36, -0.02, 1.86, 0.14, 0.88, WHITE, TL.pillow);                         // la paillasse
    E.bx(0.14, 0.5, 0.0, 1.5, 0.06, 0.84, col, TL.blanket);                           // la courtepointe
    E.bx(-0.74, 0.5, -0.04, 0.34, 0.12, 0.58, WHITE, TL.pillow);                      // l'oreiller
    E.bx(0, 0.36, 0.475, 2.0, 0.28, 0.05, WHITE, TL.darkwood);                        // la traverse basse
    for (let i = 0; i < 6; i++) E.bx(-0.825 + i * 0.33, 1.3, 0.475, 0.33, 0.34, 0.05, WHITE, tx(TL.darkwood, TL.meuFuseaux)); // la frise de fuseaux
    E.bx(0, 0.64, 0.49, 0.06, 0.66, 0.04, WHITE, TL.darkwood);                        // le montant du milieu
    E.bx(0.48, 0.64, 0.46, 0.9, 0.66, 0.04, WHITE, sc);                               // le volet fermé
    E.bx(0.14, 0.94, 0.485, 0.04, 0.08, 0.02, PC6.laiton, TL.gold);                   // sa poignée
    E.bx(0.3, 0.64, 0.425, 0.9, 0.66, 0.03, WHITE, sc);                               // l'autre, glissé derrière
  },
  // horloge comtoise : caisse, cadran d'émail, balancier de laiton (dessinée à chaque image)
  horloge_comtoise(E, o, t) {
    const tt = t ? t.t : 0, h = t && t.hour !== undefined ? t.hour : 12;
    E.bx(0, 0, 0, 0.58, 0.34, 0.38, WHITE, TL.darkwood);
    E.bx(0, 0.34, 0, 0.46, 1.2, 0.32, WHITE, TL.wood);
    E.bx(0, 0.5, 0.162, 0.28, 0.86, 0.01, PC6.ombre, TL.plain);                        // la fenêtre du balancier
    for (const s of [-1, 1]) E.bx(s * 0.15, 0.5, 0.168, 0.02, 0.86, 0.02, PC6.laiton, TL.gold);
    E.bx(0, 1.54, 0, 0.54, 0.54, 0.36, WHITE, TL.wood);                                // la tête
    E.bx(0, 1.58, 0.182, 0.44, 0.46, 0.01, WHITE, TL.meuCadran);                      // le cadran
    E.bx(0, 2.08, 0, 0.6, 0.07, 0.4, WHITE, TL.darkwood);                             // le fronton
    E.bx(0, 2.15, 0.02, 0.34, 0.1, 0.3, WHITE, TL.darkwood);
    E.bx(0, 2.25, 0.02, 0.1, 0.1, 0.1, PC6.laiton, TL.gold);
    // les aiguilles
    const cy = 1.81, a1 = (h % 12) / 12 * TAU, a2 = (h % 1) * TAU;
    E.box(Math.sin(a1) * 0.05, cy + Math.cos(a1) * 0.05, 0.19, 0.022, 0.11, 0.008, PC6.ombre, TL.plain, 0, 0, -a1);
    E.box(Math.sin(a2) * 0.075, cy + Math.cos(a2) * 0.075, 0.194, 0.016, 0.16, 0.008, PC6.ombre, TL.plain, 0, 0, -a2);
    // le balancier : une seconde par battement
    const a = Math.sin(tt * Math.PI) * 0.16, L = 0.68, py = 1.36;
    E.box(Math.sin(a) * L / 2, py - Math.cos(a) * L / 2, 0.174, 0.018, L, 0.008, PC6.laiton, TL.gold, 0, 0, a);
    E.box(Math.sin(a) * L, py - Math.cos(a) * L, 0.176, 0.13, 0.13, 0.012, PC6.laiton, TL.gold, 0, 0, a);
  },
  // chandelier de fer forgé, à trois bougies (allumé : data.lit)
  chandelier(E, o, t) {
    const lit = !!(o.data && o.data.lit), tt = t ? t.t : 0;
    for (let k = 0; k < 3; k++) { const a = k / 3 * TAU; E.box(Math.cos(a) * 0.11, 0.025, Math.sin(a) * 0.11, 0.24, 0.04, 0.045, PC6.fer, TL.iron, -a); }
    E.bx(0, 0, 0, 0.09, 0.1, 0.09, PC6.fer, TL.iron);
    E.bx(0, 0.1, 0, 0.04, 1.22, 0.04, PC6.fer, TL.iron);
    E.bx(0, 0.62, 0, 0.07, 0.06, 0.07, PC6.fer, TL.iron);
    E.bx(0, 1.3, 0, 0.5, 0.03, 0.04, PC6.fer, TL.iron);
    for (const s of [-1, 1]) E.bx(s * 0.23, 1.2, 0, 0.03, 0.12, 0.03, PC6.fer, TL.iron);
    const bras = [[-0.22, 1.33], [0, 1.43], [0.22, 1.33]];
    E.bx(0, 1.33, 0, 0.03, 0.1, 0.03, PC6.fer, TL.iron);
    for (const [x, y] of bras) {
      E.bx(x, y - 0.02, 0, 0.09, 0.025, 0.09, PC6.fer, TL.iron);
      E.bx(x, y, 0, 0.042, 0.15, 0.042, PC6.cire, TL.plain);
      if (lit) { E.fl = FX_EMIT; E.bx(x, y + 0.15, 0, 0.028, 0.05 + Math.sin(tt * 17 + x * 9 + o.x) * 0.012, 0.028, PC6.flamme, TL.flame); E.fl = 0; }
    }
  },
  // guéridon et sa lampe à huile (allumée : data.lit)
  gueridon(E, o) {
    const lit = !!(o.data && o.data.lit);
    E.bx(0, 0.68, 0, 0.6, 0.04, 0.6, WHITE, TL.wood); E.box(0, 0.7, 0, 0.6, 0.04, 0.6, WHITE, TL.wood, Math.PI / 4);
    E.bx(0, 0.1, 0, 0.07, 0.58, 0.07, WHITE, TL.darkwood);
    E.bx(0, 0.36, 0, 0.1, 0.08, 0.1, WHITE, TL.darkwood);
    for (let k = 0; k < 3; k++) { const a = k / 3 * TAU + 0.5; E.box(Math.cos(a) * 0.16, 0.03, Math.sin(a) * 0.16, 0.32, 0.05, 0.05, WHITE, TL.darkwood, -a); }
    // la lampe : pied de laiton, réservoir, verre, globe d'opaline
    E.bx(0, 0.72, 0, 0.14, 0.04, 0.14, PC6.laiton, TL.gold);
    E.bx(0, 0.76, 0, 0.05, 0.08, 0.05, PC6.laiton, TL.gold);
    E.bx(0, 0.84, 0, 0.13, 0.08, 0.13, PC6.laiton, TL.gold);
    E.fl = lit ? FX_EMIT : 0;
    E.bx(0, 0.92, 0, 0.06, 0.12, 0.06, lit ? [1.45, 1.2, 0.75] : PC6.verre, TL.plain);
    E.bx(0, 0.98, 0, 0.19, 0.13, 0.19, lit ? [1.25, 1.12, 0.9] : [0.9, 0.88, 0.82], TL.plain);
    E.fl = 0;
  },
  // tableau : cadre doré, une des quatre toiles (data.v) ; l'origine est au mur
  tableau(E, o) {
    const v = ((o.data && o.data.v) | 0) % MEU_TOILES.length;
    E.bx(0, 0, 0.025, 0.74, 0.6, 0.05, PC6.dore, TL.gold);
    E.bx(0, 0.06, 0.051, 0.6, 0.48, 0.006, WHITE, MEU_TOILES[v]);
    E.bx(0, 0.58, 0.01, 0.08, 0.06, 0.02, PC6.fer, TL.iron);
  },
  // fauteuil tapissé (data.col : l'étoffe)
  fauteuil(E, o) {
    const c = o.data && o.data.col ? rgbf(o.data.col) : rgbf('#6a3434'), vel = TL.meuVelours;
    for (const [x, z] of [[-0.29, -0.24], [0.29, -0.24], [-0.29, 0.24], [0.29, 0.24]]) E.bx(x, 0, z, 0.06, 0.2, 0.06, WHITE, TL.darkwood);
    E.bx(0, 0.2, 0.02, 0.66, 0.2, 0.58, c, vel);
    E.bx(0, 0.4, 0.05, 0.5, 0.06, 0.48, c, vel);
    E.box(0, 0.74, -0.25, 0.64, 0.66, 0.12, c, vel, 0, -0.1);
    E.box(0, 1.08, -0.29, 0.68, 0.05, 0.12, WHITE, TL.darkwood, 0, -0.1);
    for (const s of [-1, 1]) { E.bx(s * 0.33, 0.2, 0.0, 0.1, 0.38, 0.58, c, vel); E.bx(s * 0.33, 0.58, 0.02, 0.12, 0.04, 0.6, WHITE, TL.wood); }
  },
});
Object.assign(PROP_COLL, {
  lit_clos: [1.0, 0.5, 1.72], horloge_comtoise: [0.28, 0.18, 2.2], chandelier: [0.14, 0.14, 1.5], gueridon: [0.32, 0.32, 0.75], tableau: null, fauteuil: [0.37, 0.32, 1.0],
});
Object.assign(PROP_LIGHTS, {
  chandelier: { c: [1.0, 0.7, 0.38], r: 7, y: 1.5, flicker: true, lit: true },
  gueridon: { c: [1.0, 0.82, 0.55], r: 6.5, y: 1.0, lit: true },
});
