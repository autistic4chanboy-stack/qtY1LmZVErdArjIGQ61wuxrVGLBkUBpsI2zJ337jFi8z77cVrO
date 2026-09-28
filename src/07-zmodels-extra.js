// ============================================================================
//  MODÈLES 3D EN PLUS : nouvelles cultures, machines, arrosage, décor,
//  contenants à fouiller, points de fouille
// ============================================================================

Object.assign(CROP_MODELS, {
  radis(E, k, ripe) { for (let i = 0; i < 3; i++) { const a = i * 2.1, x = Math.sin(a) * 0.2, z = Math.cos(a) * 0.2, b = ripe ? 0.13 : 0; if (ripe) E.bx(x, -0.03, z, 0.16, 0.16, 0.16, rgbf('#d83050'), TL.plain, a); E.bx(x, b - 0.02, z, 0.08 + k * 0.08, 0.08 + k * 0.16, 0.08 + k * 0.08, WHITE, TL.carrotTop, a); } },
  lin(E, k, ripe) { const h = 0.15 + k * 0.7; for (let i = 0; i < 7; i++) { const x = ((i * 37) % 7 - 3) * 0.1, z = ((i * 53) % 5 - 2) * 0.12; E.bx(x, 0, z, 0.025, h, 0.025, [0.55, 0.85, 0.45], TL.carrotTop); if (k > 0.6) E.bx(x, h, z, 0.07, 0.04, 0.07, ripe ? rgbf('#b8a060') : rgbf('#6a8ae0'), TL.plain); } },
  betterave(E, k, ripe) { const b = ripe ? 0.2 : 0.08 * k; if (b > 0.02) E.bx(0, -0.03, 0, b * 1.4, b, b * 1.4, rgbf('#7a1a40'), TL.plain); E.bx(0, b - 0.03, 0, 0.14 + k * 0.18, 0.1 + k * 0.28, 0.14 + k * 0.18, [0.6, 0.9, 0.55], TL.carrotTop); E.box(0.1, b + 0.1 + k * 0.2, 0, 0.3 * k, 0.03, 0.12, rgbf('#8a2050'), TL.leaves, 0.4, 0, 0.5); },
  haricot(E, k, ripe) { for (const s of [-0.2, 0.2]) { E.bx(s, 0, 0, 0.035, 1.2, 0.035, WHITE, TL.wood); E.bx(s, 0, 0, 0.14 + k * 0.1, 0.2 + k * 0.8, 0.14 + k * 0.1, WHITE, TL.leaves, s * 3); if (ripe) for (let j = 0; j < 3; j++) E.bx(s + 0.1, 0.3 + j * 0.25, 0.06, 0.03, 0.14, 0.03, rgbf('#6ab040'), TL.plain); } },
  melon(E, k, ripe) { E.bx(0, 0, 0, 0.7, 0.08, 0.7, WHITE, TL.leaves); if (k > 0.4) { const s = 0.12 + k * 0.3; E.bx(-0.05, 0, -0.05, s * 1.1, s * 0.8, s, ripe ? rgbf('#9ac060') : rgbf('#6a9a40'), TL.stripes); } },
});

const PC2 = { iron: rgbf('#50535a'), copper: rgbf('#b8683a'), white: rgbf('#ece8dc'), water: rgbf('#3a6a8a') };
Object.assign(PROP_MODELS, {
  // arrosage automatique : une tige, une tête qui tourne (arrosée toutes les heures)
  arroseur(E, o, t) { E.bx(0, 0, 0, 0.28, 0.08, 0.28, PC2.copper, TL.metal); E.bx(0, 0.08, 0, 0.06, 0.35, 0.06, PC2.copper, TL.metal); const a = t ? t.t * 2 : 0; E.box(0, 0.45, 0, 0.36, 0.05, 0.05, PC2.copper, TL.metal, a); },
  arroseur_fer(E, o, t) { E.bx(0, 0, 0, 0.32, 0.1, 0.32, PC2.iron, TL.iron); E.bx(0, 0.1, 0, 0.07, 0.5, 0.07, PC2.iron, TL.iron); const a = t ? t.t * 2.4 : 0; E.box(0, 0.62, 0, 0.5, 0.05, 0.05, PC2.iron, TL.iron, a); E.box(0, 0.62, 0, 0.05, 0.05, 0.5, PC2.iron, TL.iron, a); },
  // machines de transformation
  composteur(E) { E.bx(0, 0, 0, 1.1, 0.8, 1.1, WHITE, TL.wood); E.bx(0, 0.02, 0, 1.0, 0.76, 1.0, WHITE, TL.soil); for (const s of [-0.5, 0.5]) E.bx(s, 0, s, 0.12, 0.9, 0.12, WHITE, TL.darkwood); },
  baratte(E) { E.bx(0, 0, 0, 0.5, 0.9, 0.5, WHITE, TL.barrel); E.bx(0, 0.9, 0, 0.55, 0.06, 0.55, WHITE, TL.darkwood); E.bx(0, 0.96, 0, 0.05, 0.5, 0.05, WHITE, TL.wood); E.bx(0, 1.42, 0, 0.26, 0.05, 0.05, WHITE, TL.wood); },
  fumoir(E) { E.bx(0, 0, 0, 1.2, 1.6, 1.0, WHITE, TL.stone); E.bx(0, 1.6, 0, 1.3, 0.12, 1.1, WHITE, TL.stone); E.bx(0.35, 1.72, -0.2, 0.3, 0.8, 0.3, WHITE, TL.brick); E.bx(0, 0.3, 0.51, 0.7, 0.8, 0.03, [0.9, 0.9, 0.9], TL.darkwood); E.bx(0.28, 0.65, 0.54, 0.06, 0.06, 0.04, PC2.iron, TL.iron); },
  presse(E) { E.bx(0, 0, 0, 1.0, 0.5, 0.8, WHITE, TL.darkwood); E.bx(0, 0.5, 0, 0.7, 0.5, 0.6, WHITE, TL.barrel); for (const s of [-0.45, 0.45]) E.bx(s, 0.5, 0, 0.1, 1.2, 0.1, WHITE, TL.darkwood); E.bx(0, 1.62, 0, 1.0, 0.12, 0.12, WHITE, TL.darkwood); E.bx(0, 1.1, 0, 0.08, 0.55, 0.08, PC2.iron, TL.iron); },
  moulin_a_bras(E, o, t) { E.bx(0, 0, 0, 0.9, 0.5, 0.9, WHITE, TL.stone); const a = t ? t.t * 0.5 : 0; E.box(0, 0.62, 0, 0.8, 0.22, 0.8, WHITE, TL.stone, a); E.box(Math.sin(a) * 0.3, 0.9, Math.cos(a) * 0.3, 0.06, 0.35, 0.06, WHITE, TL.wood); },
  // décor
  horloge(E, o, t) {
    E.bx(0, 0, 0, 0.16, 2.2, 0.16, PC2.iron, TL.iron); E.bx(0, 2.1, 0, 0.7, 0.7, 0.14, rgbf('#6a4a30'), TL.darkwood);
    E.fl = t && t.night ? FX_EMIT : 0; E.bx(0, 2.15, 0.075, 0.58, 0.58, 0.02, t && t.night ? [1.1, 1.0, 0.8] : PC2.white, TL.plain); E.fl = 0;
    const h = (t ? t.hour : 12), a1 = (h % 12) / 12 * TAU, a2 = (h % 1) * TAU;
    E.box(Math.sin(a1) * 0.1, 2.44 + Math.cos(a1) * 0.1, 0.1, 0.035, 0.2, 0.02, [0.1, 0.1, 0.1], 0, 0, 0, -a1);
    E.box(Math.sin(a2) * 0.13, 2.44 + Math.cos(a2) * 0.13, 0.11, 0.025, 0.27, 0.02, [0.1, 0.1, 0.1], 0, 0, 0, -a2);
  },
  nain_jardin(E) { E.bx(0, 0, 0, 0.22, 0.25, 0.18, rgbf('#3a6aa0'), TL.cloth); E.bx(0, 0.25, 0, 0.18, 0.16, 0.16, rgbf('#e8b890'), tx(TL.skin, TL.faceMan)); E.bx(0, 0.25, 0.08, 0.14, 0.1, 0.04, WHITE, TL.wool); E.box(0, 0.47, 0, 0.18, 0.2, 0.18, rgbf('#c02a20'), TL.cloth, 0.78); },
  bassin(E) { for (const [x, z, sx, sz] of [[0, -0.95, 2.2, 0.3], [0, 0.95, 2.2, 0.3], [-0.95, 0, 0.3, 1.6], [0.95, 0, 0.3, 1.6]]) E.bx(x, 0, z, sx, 0.4, sz, WHITE, TL.stone); E.bx(0, 0.02, 0, 1.6, 0.3, 1.6, PC2.water, TL.plain); E.bx(0.3, 0.32, 0.2, 0.4, 0.02, 0.3, WHITE, TL.leaves); },
  fontaine_jardin(E, o, t) {
    for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; E.bx(Math.cos(a) * 1.1, 0, Math.sin(a) * 1.1, 0.9, 0.5, 0.3, WHITE, TL.stone, -a + Math.PI / 2); }
    E.bx(0, 0.02, 0, 2.0, 0.42, 2.0, PC2.water, TL.plain); E.bx(0, 0, 0, 0.35, 1.3, 0.35, WHITE, TL.stone); E.bx(0, 1.3, 0, 0.9, 0.12, 0.9, WHITE, TL.stone);
    const f = t ? Math.sin(t.t * 8) * 0.05 : 0; E.bx(0, 1.42, 0, 0.12, 0.4 + f, 0.12, [0.7, 0.85, 1.0], TL.plain);
  },
  tapis(E) { E.bx(0, -0.01, 0, 1.6, 0.03, 1.0, rgbf('#9a3a30'), TL.plaid); E.bx(0, 0.0, 0, 1.3, 0.03, 0.7, rgbf('#c8a060'), TL.blanket); },
  banc_pierre(E) { E.bx(-0.6, 0, 0, 0.25, 0.42, 0.4, WHITE, TL.stone); E.bx(0.6, 0, 0, 0.25, 0.42, 0.4, WHITE, TL.stone); E.bx(0, 0.42, 0, 1.6, 0.1, 0.45, WHITE, TL.stone); },
  pergola(E) { for (const [x, z] of [[-1.2, -1], [1.2, -1], [-1.2, 1], [1.2, 1]]) { E.bx(x, 0, z, 0.14, 2.4, 0.14, WHITE, TL.wood); E.bx(x, 0.4, z, 0.3, 1.6, 0.3, WHITE, TL.leaves); } for (let k = -1; k <= 1; k += 0.5) E.bx(0, 2.4, k, 2.7, 0.08, 0.1, WHITE, TL.wood); E.bx(0, 2.5, 0, 2.6, 0.12, 2.2, WHITE, TL.flowers); },
  jardiniere(E) { E.bx(0, 0, 0, 1.2, 0.4, 0.45, WHITE, TL.wood); E.bx(0, 0.4, 0, 1.1, 0.2, 0.36, WHITE, TL.flowers); },
  cloture_blanche(E) { for (const s of [-1, 1]) E.bx(s, 0, 0, 0.1, 1.0, 0.1, PC2.white, TL.plain); for (let x = -0.8; x <= 0.8; x += 0.2) E.bx(x, 0, 0, 0.08, 0.9, 0.04, PC2.white, TL.plain); E.bx(0, 0.35, 0, 2.0, 0.07, 0.05, PC2.white, TL.plain); E.bx(0, 0.72, 0, 2.0, 0.07, 0.05, PC2.white, TL.plain); },
  poteau_indicateur(E) { E.bx(0, 0, 0, 0.1, 2.0, 0.1, WHITE, TL.darkwood); E.box(0.35, 1.7, 0, 0.8, 0.22, 0.05, WHITE, TL.sign, 0.2); E.box(-0.35, 1.35, 0.05, 0.8, 0.22, 0.05, WHITE, TL.sign, 2.4); },
  statue_cerf(E) {
    E.bx(0, 0, 0, 1.0, 0.6, 1.4, WHITE, TL.stone); E.bx(0, 0.6, 0, 0.45, 0.5, 1.0, WHITE, TL.stone);
    for (const [x, z] of [[-0.15, -0.35], [0.15, -0.35], [-0.15, 0.35], [0.15, 0.35]]) E.bx(x, 0.6, z, 0.1, 0.6, 0.1, WHITE, TL.stone);
    E.box(0, 1.35, 0.55, 0.16, 0.5, 0.18, WHITE, TL.stone, 0, -0.4); E.bx(0, 1.55, 0.72, 0.18, 0.2, 0.34, WHITE, TL.stone);
    for (const s of [-1, 1]) E.box(s * 0.12, 1.95, 0.65, 0.04, 0.4, 0.04, WHITE, TL.stone, 0, 0, s * 0.4);
  },
  epouvantail_fer(E) {
    E.bx(0, 0, 0, 0.1, 2.3, 0.1, PC2.iron, TL.iron); E.bx(0, 1.7, 0, 1.4, 0.08, 0.08, PC2.iron, TL.iron);
    E.bx(0, 1.25, 0, 0.5, 0.6, 0.24, rgbf('#5a4a3a'), TL.coat); E.bx(0, 1.95, 0, 0.32, 0.36, 0.32, PC2.iron, tx(TL.iron, TL.mask));
    for (const s of [-0.55, 0.55]) E.bx(s, 1.45, 0, 0.3, 0.3, 0.05, [0.85, 0.85, 0.8], TL.metal);
  },
  lanterne_suspendue(E, o, t) {
    E.bx(0, 0, 0, 0.1, 2.3, 0.1, WHITE, TL.darkwood); E.bx(0.3, 2.2, 0, 0.7, 0.08, 0.08, WHITE, TL.darkwood);
    const lit = t && t.night; E.fl = lit ? FX_EMIT : 0; E.bx(0.55, 1.7, 0, 0.2, 0.3, 0.2, lit ? [1.2, 1.0, 0.7] : [0.5, 0.45, 0.4], TL.glass); E.fl = 0;
    E.bx(0.55, 2.0, 0, 0.24, 0.05, 0.24, PC2.iron, TL.iron);
  },
  tente(E) { E.box(-0.55, 0.62, 0, 0.08, 1.45, 2.0, rgbf('#c8b890'), TL.cloth2, 0, 0, 0.72); E.box(0.55, 0.62, 0, 0.08, 1.45, 2.0, rgbf('#c8b890'), TL.cloth2, 0, 0, -0.72); E.bx(0, 1.2, 0, 0.06, 0.08, 2.1, WHITE, TL.wood); E.bx(0, 0, -1.0, 0.06, 1.3, 0.06, WHITE, TL.wood); E.bx(0, 0, 1.0, 0.06, 1.3, 0.06, WHITE, TL.wood); },
  // contenants à fouiller, épaves
  coffre_vieux(E, o) { const vide = o.data && o.data.vide; E.bx(0, 0, 0, 0.8, 0.45, 0.5, [0.75, 0.7, 0.62], tx(TL.darkwood, TL.chest)); if (vide) E.box(0, 0.62, -0.25, 0.82, 0.08, 0.52, [0.75, 0.7, 0.62], TL.darkwood, 0, -1.1); else E.bx(0, 0.45, 0, 0.84, 0.12, 0.54, [0.75, 0.7, 0.62], TL.darkwood); },
  tonneau_vieux(E) { E.bx(0, 0, 0, 0.55, 0.85, 0.55, [0.8, 0.75, 0.68], TL.barrel); E.bx(0, 0.02, 0, 0.55, 0.8, 0.55, [0.8, 0.75, 0.68], TL.barrel, Math.PI / 4); },
  charrette_renversee(E) {
    E.box(0, 0.55, 0, 1.4, 0.6, 2.4, WHITE, TL.wood, 0, 0, 1.2); E.box(0.9, 0.6, 0.7, 0.1, 1.1, 1.1, WHITE, TL.darkwood, Math.PI / 2, 0, 0.3); E.box(-0.4, 0.3, -1.4, 0.12, 0.12, 1.4, WHITE, TL.darkwood, 0.3);
    E.bx(-1.1, 0, 0.4, 0.5, 0.35, 0.5, WHITE, mt(M_CRATE)); E.bx(-0.9, 0, -0.6, 0.45, 0.6, 0.3, rgbf('#c8b088'), TL.cloth);
  },
  fouille(E) { E.box(0, 0.02, 0, 0.7, 0.1, 0.5, [0.5, 0.36, 0.24], TL.soil, 0.4); E.box(0.1, 0.08, -0.05, 0.03, 0.18, 0.03, [0.7, 0.55, 0.4], TL.plain, 0.3, 0.5); E.box(-0.12, 0.08, 0.08, 0.03, 0.14, 0.03, [0.7, 0.55, 0.4], TL.plain, -0.4, -0.4); },
});
Object.assign(PROP_COLL, {
  arroseur: null, arroseur_fer: null, composteur: [0.55, 0.55, 0.85], baratte: [0.28, 0.28, 1.0], fumoir: [0.6, 0.5, 1.6], presse: [0.5, 0.4, 1.7], moulin_a_bras: [0.45, 0.45, 0.8],
  horloge: [0.1, 0.1, 2.5], nain_jardin: null, bassin: [1.1, 1.0, 0.4], fontaine_jardin: [1.2, 1.2, 0.5], tapis: null, banc_pierre: [0.8, 0.22, 0.5], pergola: null, jardiniere: [0.6, 0.22, 0.6],
  cloture_blanche: [1.0, 0.08, 1.0], poteau_indicateur: [0.08, 0.08, 2], statue_cerf: [0.5, 0.7, 2], epouvantail_fer: [0.08, 0.08, 2.3], lanterne_suspendue: [0.08, 0.08, 2.3], tente: [0.9, 1.0, 1.3],
  coffre_vieux: [0.4, 0.25, 0.6], tonneau_vieux: [0.28, 0.28, 0.85], charrette_renversee: [0.9, 1.2, 1.0], fouille: null,
});
Object.assign(PROP_LIGHTS, { lanterne_suspendue: { c: [1.0, 0.76, 0.44], r: 10, y: 1.8, night: true } });
