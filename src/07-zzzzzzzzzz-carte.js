// ============================================================================
//  MODÈLES DES LIEUX PERDUS (agent C1) : croix de pierre, oratoires, tombes,
//  lanterne des morts, fourches du gibet, menhirs, cupules, pierre branlante,
//  bornes, billot, chevalet, boîtes, cloche fêlée, seau, ailes de moulin,
//  meule, ex-voto, arbre aux offrandes, ruches de paille, cadran solaire, nid,
//  pierres à sel, rocher aux marques, le dormeur de glace, la Dame de bois,
//  pieux, branchages ; bougies et lueurs qui ne paraissent qu'à leur heure.
//  Les deux peuples : chandelles sur l'eau, roseaux, chaudron sur trépied,
//  sonnailles, étagère à tommes, écriteaux.
//  (même manière que 07-models.js : des boîtes et les tuiles du jeu)
// ============================================================================
const PC7 = {
  stone: rgbf('#9a968c'), moss: rgbf('#7e8a6e'), dark: rgbf('#2a2826'), wood: rgbf('#8a6a44'), dwood: rgbf('#5a4028'), iron: rgbf('#4a4a50'),
  rust: rgbf('#7a4a30'), bronze: rgbf('#7a6a3a'), bone: rgbf('#d8d0bc'), straw: rgbf('#c8a860'), salt: [1.05, 1.05, 1.02], ice: [0.82, 0.92, 1.05],
  cloth: ['#b03a2a', '#d8c060', '#3a5a9a', '#e8e4d8', '#4a7a3a', '#8a3a6a', '#6a4a2a'].map(rgbf),
};
Object.assign(PROP_MODELS, {
  // croix de pierre : v 0 (croix de peste, sur son socle de blocs), 2 (croix de l'avalanche, petit socle et noms gravés)
  c2_croix_pierre(E, o) {
    const v = (o.data && o.data.v) || 0;
    if (v === 2) { E.bx(0, 0, 0, 0.9, 0.5, 0.7, PC7.moss, mt(M_MOSSY)); for (let k = 0; k < 4; k++) E.bx(-0.25 + (k % 2) * 0.3, 0.12 + ((k / 2) | 0) * 0.16, 0.352, 0.22, 0.03, 0.01, PC7.dark, TL.plain); }
    const y0 = v === 2 ? 0.5 : 0;
    E.bx(0, y0, 0, 0.26, 2.1, 0.22, PC7.stone, TL.stone);
    E.bx(0, y0 + 1.45, 0, 0.95, 0.24, 0.22, PC7.stone, TL.stone);
    E.bx(0, y0 + 2.1, 0, 0.32, 0.1, 0.26, PC7.stone, TL.stone);
    if (v === 0) E.bx(0, y0 + 0.5, 0.115, 0.14, 0.14, 0.01, PC7.dark, TL.plain);
  },
  // bougies au pied d'une croix ou sur un autel : allumées à leur heure seulement (data.lit)
  c2_bougies(E, o, t) {
    const lit = o.data && o.data.lit;
    for (let k = 0; k < 4; k++) {
      const x = -0.25 + k * 0.17, z = (k % 2) * 0.12, h = 0.08 + (k % 3) * 0.04;
      E.bx(x, 0, z, 0.045, h, 0.045, [0.92, 0.9, 0.82], TL.plain);
      if (lit) { E.fl = FX_EMIT; E.bx(x, h, z, 0.025, 0.045 + (t ? Math.sin(t.t * 13 + k * 2.1) * 0.01 : 0), 0.025, [1.5, 1.1, 0.5], TL.flame); E.fl = 0; }
    }
  },
  c2_cloche_fendue(E) {
    E.box(0, 0.36, 0, 0.9, 0.7, 0.9, PC7.bronze, TL.gold, 0.2, 0, 1.25);
    E.box(-0.3, 0.72, 0.05, 0.4, 0.2, 0.4, PC7.bronze, TL.gold, 0.2, 0, 1.25);
    E.box(0.12, 0.2, 0.46, 0.03, 0.45, 0.02, PC7.dark, TL.plain, 0, 0, 0.4);
  },
  // oratoire : pilier, niche, petite statue, toit de lauzes (v : 0 saint, 1 vierge noire, 2 gerbe)
  c2_oratoire(E, o) {
    const v = (o.data && o.data.v) || 0;
    E.bx(0, 0, 0, 0.8, 0.35, 0.8, PC7.moss, mt(M_MOSSY));
    E.bx(0, 0.35, 0, 0.55, 1.15, 0.55, PC7.stone, mt(M_STONE));
    E.bx(0, 1.5, 0, 0.7, 0.7, 0.62, PC7.stone, mt(M_STONE));
    E.bx(0, 1.58, 0.14, 0.46, 0.52, 0.36, PC7.dark, mt(M_DARK));
    const c = v === 1 ? [0.22, 0.2, 0.2] : v === 2 ? rgbf('#c8a860') : [0.88, 0.86, 0.8];
    E.bx(0, 1.6, 0.18, 0.14, 0.3, 0.1, c, v === 2 ? TL.wheat : TL.stone); E.bx(0, 1.9, 0.18, 0.09, 0.09, 0.08, c, TL.stone);
    E.box(0, 2.3, 0, 0.9, 0.22, 0.85, rgbf('#6a6a70'), mt(M_SLATE), 0, 0, 0);
    E.box(0, 2.46, 0, 0.5, 0.14, 0.6, rgbf('#6a6a70'), mt(M_SLATE));
    E.bx(0.18, 1.52, 0.3, 0.1, 0.1, 0.08, rgbf('#c04040'), TL.flowers);
  },
  // tombe isolée : v 0 dalle et stèle, 1 croix de fer et grille, 2 croix de bois et tertre ; fleurs fraîches certains jours
  c2_tombe(E, o) {
    const v = (o.data && o.data.v) || 0;
    E.bx(0, 0, 0.1, 0.9, 0.16, 1.9, PC7.moss, v === 2 ? TL.soil : mt(M_MOSSY));
    if (v === 0) { E.bx(0, 0, -0.9, 0.8, 1.0, 0.18, PC7.stone, TL.stone); E.bx(0, 1.0, -0.9, 0.6, 0.12, 0.18, PC7.stone, TL.stone); for (let k = 0; k < 3; k++) E.bx(0, 0.45 + k * 0.14, -0.805, 0.46 - k * 0.1, 0.03, 0.01, PC7.dark, TL.plain); }
    else if (v === 1) {
      E.bx(0, 0, -0.85, 0.06, 1.3, 0.06, PC7.iron, TL.iron); E.bx(0, 0.95, -0.85, 0.5, 0.06, 0.06, PC7.iron, TL.iron);
      for (const [x, z, sx, sz] of [[0, -1.05, 1.2, 0.04], [0, 1.25, 1.2, 0.04], [-0.6, 0.1, 0.04, 2.3], [0.6, 0.1, 0.04, 2.3]]) { E.bx(x, 0.5, z, sx, 0.04, sz, PC7.rust, TL.iron); for (let k = -2; k <= 2; k++) E.bx(sx > 0.1 ? x + k * 0.25 : x, 0, sz > 0.1 ? z + k * 0.5 : z, 0.03, 0.6, 0.03, PC7.rust, TL.iron); }
    } else { E.bx(0, 0, -0.85, 0.08, 1.1, 0.08, PC7.dwood, TL.darkwood); E.bx(0, 0.75, -0.85, 0.55, 0.08, 0.08, PC7.dwood, TL.darkwood); E.bx(0, 0.16, 0.1, 0.8, 0.14, 1.6, rgbf('#5a4a36'), TL.soil); }
    if (o.data && o.data.fleurs) { E.bx(0.15, 0.16, 0.2, 0.34, 0.12, 0.3, rgbf('#e8e0f0'), TL.flowers); E.bx(-0.2, 0.16, -0.3, 0.2, 0.1, 0.2, rgbf('#d84040'), TL.flowers); }
  },
  // lanterne des morts : fût creux, lanterne ajourée en haut, allumée d'une bougie (data.lit)
  c2_lanterne_morts(E, o, t) {
    E.bx(0, 0, 0, 1.0, 3.4, 1.0, PC7.stone, mt(M_STONE));
    E.bx(0, 3.4, 0, 1.2, 0.18, 1.2, PC7.stone, mt(M_STONE));
    for (const [x, z] of [[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]]) E.bx(x, 3.58, z, 0.18, 0.9, 0.18, PC7.stone, mt(M_STONE));
    const lit = o.data && o.data.lit;
    if (lit) { E.fl = FX_EMIT; E.bx(0, 3.62, 0, 0.18, 0.35 + (t ? Math.sin(t.t * 9) * 0.03 : 0), 0.18, [1.5, 1.05, 0.5], TL.flame); E.fl = 0; }
    else E.bx(0, 3.58, 0, 0.5, 0.05, 0.5, PC7.dark, TL.plain);
    E.bx(0, 4.48, 0, 1.2, 0.16, 1.2, PC7.stone, mt(M_STONE));
    E.bx(0, 4.64, 0, 0.7, 0.5, 0.7, PC7.stone, mt(M_STONE), Math.PI / 4);
    E.bx(0, 5.14, 0, 0.12, 0.45, 0.12, PC7.stone, TL.stone); E.bx(0, 5.36, 0, 0.36, 0.1, 0.1, PC7.stone, TL.stone);
    E.bx(0, 0.6, 0.51, 0.34, 0.5, 0.01, PC7.dark, TL.plain);
  },
  // fourches du gibet : deux piliers, la traverse, une corde qui bouge toute seule
  c2_gibet(E, o, t) { // (les piliers sont des blocs, posés par le lieu)
    E.bx(0, 3.66, 0, 3.9, 0.26, 0.26, PC7.dwood, TL.darkwood);
    const a = t ? Math.sin(t.t * 0.9 + o.x) * 0.12 + Math.sin(t.t * 2.3) * 0.03 : 0;
    E.box(-0.4, 3.66 - 0.75, 0, 0.04, 1.5, 0.04, rgbf('#8a7a5a'), TL.rope, 0, a, a * 0.5);
    E.box(-0.4 + Math.sin(a * 0.5) * 1.5, 3.66 - 1.55, Math.sin(a) * 1.5, 0.22, 0.05, 0.22, PC7.rust, TL.iron, 0, a, 0);
    E.box(0.9, 3.66 - 0.45, 0, 0.04, 0.9, 0.04, rgbf('#8a7a5a'), TL.rope, 0, -a * 0.6, 0);
  },
  // menhir : v 0 simple (cercles), 1 cupules gravées, 2 croix gravée par-dessus des cupules effacées
  c2_menhir(E, o) {
    const v = (o.data && o.data.v) || 0, k = hash2i(Math.floor(o.x), Math.floor(o.z), 7);
    E.bx(0, -0.3, 0, 0.95, 1.4, 0.6, PC7.moss, mt(M_MOSSY), k * 0.3);
    E.bx(0.05, 1.1, 0.02, 0.8, 1.3, 0.5, PC7.stone, mt(M_ROCK), k * 0.5 - 0.1);
    E.box(0.08, 2.7, 0.03, 0.55, 0.7, 0.4, PC7.stone, mt(M_ROCK), k, 0.08, 0.1);
    if (v === 1) for (let j = 0; j < 7; j++) E.bx(-0.25 + (j % 3) * 0.24, 0.6 + ((j / 3) | 0) * 0.35, 0.31, 0.09, 0.09, 0.01, PC7.dark, TL.plain);
    if (v === 2) { E.bx(0, 1.0, 0.27, 0.07, 0.8, 0.01, PC7.dark, TL.plain); E.bx(0, 1.55, 0.27, 0.45, 0.07, 0.01, PC7.dark, TL.plain); }
  },
  // lueurs d'un cercle de pierres (certaines nuits) : des points pâles au ras de l'herbe
  c2_lueur(E, o, t) {
    if (!(o.data && o.data.lit)) return;
    const R = (o.data && o.data.R) || 5, n = 16;
    E.fl = FX_EMIT;
    for (let k = 0; k < n; k++) { const a = k / n * TAU + (t ? t.t * 0.05 : 0), h = 0.15 + (t ? (Math.sin(t.t * 1.3 + k) + 1) * 0.12 : 0); E.bx(Math.cos(a) * R * 0.78, h, Math.sin(a) * R * 0.78, 0.06, 0.06, 0.06, [0.7, 1.2, 1.1], TL.plain); }
    E.fl = 0;
  },
  // cupules : des creux dans la pierre, de l'eau de pluie dans certains
  c2_cupules(E, o) {
    const n = (o.data && o.data.n) || 6;
    for (let k = 0; k < n; k++) { const a = k * 2.4, r = 0.2 + (k % 3) * 0.28; E.bx(Math.cos(a) * r, -0.01, Math.sin(a) * r * 0.7, 0.13, 0.02, 0.13, k % 3 ? PC7.dark : rgbf('#4a6a7a'), k % 3 ? TL.plain : mt(M_WATERB)); }
    E.bx(0, -0.01, 0, 0.7, 0.012, 0.03, PC7.dark, TL.plain, 0.6);
  },
  // pierre branlante : un gros rocher arrondi, en équilibre (data.a : l'inclinaison quand on pousse)
  c2_branlante(E, o, t) {
    const a = (o.data && o.data.a) || 0, w = o.data && o.data.t0 && t ? Math.max(0, 1 - (t.t - o.data.t0) / 3) : 0;
    const bal = a + (t ? Math.sin(t.t * 7) * 0.06 * w : 0);
    E.box(0, 0.95, 0, 1.9, 1.5, 1.6, PC7.stone, mt(M_ROCK), 0.3, bal, bal * 0.4);
    E.box(0.1, 1.75, 0.05, 1.3, 0.6, 1.1, PC7.stone, mt(M_ROCK), 0.9, bal, bal * 0.4);
    E.box(0, 0.25, 0, 0.9, 0.3, 0.8, PC7.stone, mt(M_ROCK), 0.2);
  },
  // borne gravée (v : lettres, fleur de lys, crosse d'abbé, croix)
  c2_borne(E, o) {
    const v = (o.data && o.data.v) || 0;
    E.bx(0, 0, 0, 0.44, 0.95, 0.32, PC7.stone, mt(M_STONE));
    E.box(0, 1.0, 0, 0.44, 0.12, 0.32, PC7.stone, mt(M_STONE), 0, 0, 0);
    const g = (x, y, sx, sy) => E.bx(x, y, 0.162, sx, sy, 0.01, PC7.dark, TL.plain);
    if (v === 0) { g(-0.1, 0.6, 0.04, 0.2); g(0.02, 0.6, 0.04, 0.2); g(0.12, 0.6, 0.04, 0.2); }
    else if (v === 1) { g(0, 0.5, 0.04, 0.3); g(-0.08, 0.62, 0.1, 0.04); g(0.08, 0.62, 0.1, 0.04); g(0, 0.46, 0.18, 0.04); }
    else if (v === 2) { g(0, 0.4, 0.04, 0.35); g(0.04, 0.72, 0.1, 0.04); g(0.08, 0.66, 0.04, 0.08); }
    else { g(0, 0.45, 0.04, 0.32); g(0, 0.62, 0.18, 0.04); }
    E.bx(-0.05, 0.25, 0.162, 0.2, 0.03, 0.01, PC7.dark, TL.plain);
  },
  c2_billot(E) {
    E.bx(0, 0, 0, 0.55, 0.55, 0.55, rgbf('#9a7a52'), TL.bark); E.bx(0, 0.55, 0, 0.5, 0.02, 0.5, rgbf('#c8a878'), TL.wood);
    E.box(0.05, 0.75, 0.05, 0.05, 0.5, 0.05, PC7.dwood, TL.darkwood, 0, 0.3, 0.1); E.box(0.05, 0.58, 0.0, 0.2, 0.1, 0.03, PC7.iron, TL.iron, 0, 0.3, 0.1);
  },
  c2_chevalet(E) {
    for (const z of [-0.45, 0.45]) { E.box(-0.2, 0.4, z, 0.07, 0.95, 0.07, PC7.wood, TL.wood, 0, 0, -0.45); E.box(0.2, 0.4, z, 0.07, 0.95, 0.07, PC7.wood, TL.wood, 0, 0, 0.45); }
    E.box(0, 0.86, 0, 0.26, 0.26, 1.7, rgbf('#9a7a52'), TL.bark, 0, 0, 0);
  },
  // boîte : v 0 coffret de bois, 1 boîte en fer-blanc peinte, 2 boîte de fer du cairn
  c2_boite(E, o) {
    const v = (o.data && o.data.v) || 0;
    if (v === 0) { E.bx(0, 0, 0, 0.5, 0.26, 0.34, PC7.wood, TL.wood); E.bx(0, 0.26, 0, 0.52, 0.05, 0.36, PC7.dwood, TL.darkwood); }
    else if (v === 1) { E.bx(0, 0, 0, 0.36, 0.14, 0.24, rgbf('#a83a2a'), TL.metal); E.bx(0, 0.14, 0, 0.37, 0.03, 0.25, rgbf('#d8b040'), TL.metal); }
    else { E.bx(0, 0, 0, 0.32, 0.2, 0.22, PC7.iron, TL.iron); E.bx(0, 0.2, 0, 0.33, 0.03, 0.23, PC7.rust, TL.iron); }
  },
  c2_porte_bois(E) { E.bx(0, 0, 0, 0.95, 1.5, 0.08, PC7.wood, TL.wood); E.bx(0, 0.3, 0.05, 0.95, 0.1, 0.02, PC7.iron, TL.iron); E.bx(0, 1.1, 0.05, 0.95, 0.1, 0.02, PC7.iron, TL.iron); },
  c2_seau(E) { E.bx(0, 0, 0, 0.32, 0.34, 0.32, PC7.wood, TL.barrel); E.box(0, 0.42, 0, 0.34, 0.03, 0.03, PC7.iron, TL.iron); E.bx(0, 0.34, 0, 0.26, 0.02, 0.26, [0.2, 0.3, 0.35], TL.plain); },
  c2_ailes_brisees(E) {
    E.box(0, 0.12, 0, 0.26, 0.24, 5.2, PC7.dwood, TL.darkwood, 0, 0, 0);
    E.box(0.4, 0.14, 1.2, 0.8, 0.04, 2.2, rgbf('#b8ac90'), TL.cloth2, 0.05, 0, 0.1);
    for (let k = 0; k < 6; k++) E.box(0.4, 0.1, -0.2 - k * 0.35, 0.9, 0.05, 0.06, PC7.wood, TL.wood);
    E.box(-1.2, 0.1, -0.8, 0.2, 0.2, 2.4, PC7.dwood, TL.darkwood, 1.1);
  },
  c2_meule_pierre(E) { E.box(0, 0.62, 0, 1.3, 1.3, 0.34, PC7.stone, mt(M_ROCK), 0, -0.25, 0); E.box(0, 0.62, 0.05, 0.3, 0.3, 0.36, PC7.dark, TL.plain, 0, -0.25, 0); },
  // ex-voto : petites plaques, une béquille, un cœur de fer-blanc
  c2_exvoto(E) {
    for (let k = 0; k < 5; k++) E.bx(-0.4 + k * 0.2, 0.5 + (k % 2) * 0.25, 0, 0.16, 0.12, 0.02, k % 2 ? [0.9, 0.88, 0.82] : rgbf('#c8b070'), TL.plain);
    E.box(0.55, 0.45, 0.02, 0.05, 0.9, 0.05, PC7.wood, TL.wood, 0, 0, 0.1); E.bx(0.5, 0.88, 0.02, 0.24, 0.05, 0.05, PC7.wood, TL.wood);
    E.bx(-0.55, 0.3, 0.01, 0.14, 0.14, 0.02, rgbf('#d8c880'), TL.gold, 0.8);
  },
  // l'arbre aux offrandes : chiffons, rubans, clous, petites choses pendues autour du tronc
  c2_offrandes(E, o) {
    const n = (o.data && o.data.n) || 12;
    for (let k = 0; k < n; k++) {
      const a = k * 2.39, r = 0.45 + (k % 3) * 0.05, y = 1.1 + (k % 5) * 0.32, c = PC7.cloth[k % PC7.cloth.length];
      if (k % 4 === 3) { E.box(Math.cos(a) * r, y, Math.sin(a) * r, 0.1, 0.14, 0.1, rgbf('#a88a5a'), TL.doll, -a); continue; }
      E.box(Math.cos(a) * r, y - 0.15, Math.sin(a) * r, 0.07, 0.35 + (k % 3) * 0.1, 0.01, c, TL.cloth, -a + Math.PI / 2);
    }
    for (let k = 0; k < 8; k++) { const a = k * 1.7; E.box(Math.cos(a) * 0.42, 0.9 + k * 0.1, Math.sin(a) * 0.42, 0.02, 0.02, 0.14, PC7.iron, TL.iron, -a); }
    E.bx(0, 0, 0.75, 0.5, 0.04, 0.3, rgbf('#6a5a3a'), TL.plain);
  },
  c2_ruche_paille(E) { E.bx(0, 0, 0, 0.56, 0.3, 0.56, PC7.straw, TL.straw); E.bx(0, 0.3, 0, 0.46, 0.2, 0.46, PC7.straw, TL.straw); E.bx(0, 0.5, 0, 0.3, 0.14, 0.3, PC7.straw, TL.straw); E.bx(0, 0.02, 0.28, 0.1, 0.06, 0.02, [0.08, 0.06, 0.04], TL.plain); },
  // cadran solaire : colonne, table gravée, style de fer
  c2_cadran(E) {
    E.bx(0, 0, 0, 0.62, 0.2, 0.62, PC7.moss, mt(M_MOSSY)); E.bx(0, 0.2, 0, 0.34, 0.75, 0.34, PC7.stone, mt(M_STONE));
    E.bx(0, 0.95, 0, 0.72, 0.08, 0.72, PC7.stone, TL.stone);
    for (let k = 0; k < 12; k++) { const a = -Math.PI / 2 + (k - 5.5) / 11 * Math.PI; E.box(Math.cos(a) * 0.28, 1.035, Math.sin(a) * 0.28, 0.1, 0.005, 0.015, PC7.dark, TL.plain, -a); }
    E.box(0, 1.1, 0.06, 0.02, 0.2, 0.3, PC7.iron, TL.iron, 0, -0.6, 0);
  },
  c2_nid(E) { for (let k = 0; k < 9; k++) { const a = k * 0.7; E.box(Math.cos(a) * 0.35, 0.08 + (k % 2) * 0.05, Math.sin(a) * 0.35, 0.05, 0.05, 0.5, rgbf('#6a5a3a'), TL.bark, a); } E.bx(0, 0, 0, 0.6, 0.08, 0.6, rgbf('#5a4a32'), TL.hay); E.bx(0.1, 0.08, 0.05, 0.06, 0.02, 0.06, [1.1, 1.0, 0.7], TL.gold); },
  c2_pierre_sel(E) { E.bx(0, 0, 0, 1.2, 0.3, 0.9, PC7.moss, mt(M_ROCK), 0.2); for (let k = 0; k < 5; k++) E.bx(-0.35 + k * 0.17, 0.3, (k % 2) * 0.2 - 0.1, 0.16, 0.03, 0.16, PC7.salt, TL.plain, k); },
  // rocher aux marques des familles d'estive (v : la marque la plus grande)
  c2_marques(E, o) {
    const v = (o.data && o.data.v) || 0;
    E.bx(0, -0.2, 0, 1.8, 1.5, 1.3, PC7.stone, mt(M_ROCK), 0.1); E.box(0.1, 1.45, 0, 1.4, 0.4, 1.0, PC7.stone, mt(M_ROCK), 0.4);
    const g = (x, y, sx, sy, r) => E.box(x, y, 0.66, sx, sy, 0.01, PC7.dark, TL.plain, 0, 0, r || 0);
    const M = [
      () => { g(-0.5, 0.9, 0.05, 0.4); g(-0.5, 0.9, 0.3, 0.05); },
      () => { g(-0.5, 0.9, 0.05, 0.4, 0.5); g(-0.5, 0.9, 0.05, 0.4, -0.5); },
      () => { g(-0.5, 0.9, 0.3, 0.05); g(-0.5, 1.02, 0.3, 0.05); g(-0.5, 0.78, 0.3, 0.05); },
      () => { g(-0.5, 0.9, 0.05, 0.36); g(-0.42, 1.04, 0.2, 0.05, 0.7); g(-0.58, 1.04, 0.2, 0.05, -0.7); },
      () => { for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; g(-0.5 + Math.cos(a) * 0.14, 0.9 + Math.sin(a) * 0.14, 0.06, 0.06); } },
      () => { g(-0.5, 0.9, 0.05, 0.4); g(-0.5, 1.1, 0.24, 0.05, 0.3); g(-0.5, 0.7, 0.24, 0.05, -0.3); },
    ];
    M[v % M.length]();
    for (let k = 0; k < 5; k++) g(0.05 + (k % 3) * 0.22, 0.55 + ((k / 3) | 0) * 0.45, 0.12, 0.12, k * 0.9);
    for (let k = 0; k < 9; k++) g(-0.2 + k * 0.08, 0.28, 0.02, 0.1);
  },
  // le dormeur de glace : un homme assis contre le rocher, la tête sur les genoux, couvert de givre
  c2_gele(E) {
    const c = [0.62, 0.66, 0.74], g = PC7.ice;
    E.bx(0, 0, -0.1, 0.55, 0.62, 0.42, c, TL.coat); E.box(0, 0.78, -0.05, 0.5, 0.36, 0.4, c, TL.coat, 0, 0.5);
    E.box(0, 0.78, 0.2, 0.26, 0.26, 0.26, [0.8, 0.8, 0.82], TL.skin, 0, 0.9);
    for (const s of [-0.14, 0.14]) { E.bx(s, 0, 0.2, 0.17, 0.2, 0.62, c, TL.cloth); E.bx(s, 0.2, 0.45, 0.16, 0.36, 0.16, c, TL.cloth); }
    E.box(0, 0.6, 0.28, 0.5, 0.14, 0.26, c, TL.coat, 0, 0.3);
    E.bx(0, 0.95, -0.1, 0.56, 0.04, 0.44, g, TL.plain); E.bx(0, 0.62, 0.3, 0.46, 0.03, 0.4, g, TL.plain);
    E.bx(0.35, 0, 0.3, 0.3, 0.2, 0.2, rgbf('#6a5a4a'), TL.leather);
  },
  // la Dame de bois : un poteau sculpté, une femme aux mains ouvertes, des rubans (au bord de l'eau)
  c2_dame_bois(E) {
    const c = rgbf('#7a6a52');
    E.bx(0, 0, 0, 0.36, 1.9, 0.32, c, TL.bark);
    E.bx(0, 1.9, 0, 0.3, 0.34, 0.28, c, TL.wood); E.bx(0, 2.24, 0, 0.4, 0.1, 0.34, c, TL.wood);
    E.bx(0, 1.98, 0.145, 0.06, 0.04, 0.01, [0.15, 0.12, 0.1], TL.plain);
    for (const s of [-1, 1]) E.box(s * 0.28, 1.2, 0.12, 0.1, 0.5, 0.1, c, TL.wood, 0, -0.4, s * 0.5);
    for (let k = 0; k < 4; k++) E.box(-0.15 + k * 0.1, 1.55, 0.17, 0.05, 0.5, 0.01, PC7.cloth[k + 2], TL.cloth);
  },
  // signal géodésique : un trépied de poutres, une mire en haut, une plaque de fonte
  c2_signal(E) {
    for (let k = 0; k < 3; k++) { const a = k / 3 * TAU; E.box(Math.sin(a) * 0.75, 1.6, Math.cos(a) * 0.75, 0.14, 3.4, 0.14, PC7.dwood, TL.darkwood, 0, -Math.cos(a) * 0.22, Math.sin(a) * 0.22); }
    E.bx(0, 3.1, 0, 0.12, 1.4, 0.12, PC7.dwood, TL.darkwood);
    E.bx(0, 3.9, 0, 0.7, 0.5, 0.06, [0.9, 0.9, 0.86], TL.plain); E.bx(0, 3.9, 0.04, 0.35, 0.5, 0.02, PC7.dark, TL.plain);
    E.bx(0, 0, 0, 0.5, 0.35, 0.5, PC7.stone, mt(M_STONE)); E.bx(0, 0.2, 0.26, 0.3, 0.14, 0.02, PC7.iron, TL.iron);
  },
  c2_pieu(E) { E.bx(0, 0, 0, 0.1, 0.8, 0.1, PC7.dwood, TL.darkwood); E.box(0, 0.86, 0, 0.07, 0.14, 0.07, PC7.wood, TL.wood, 0.78); },
  // ------------------------------------------------ les deux peuples
  // chandelles sur l'eau, les nuits du Vorndi (data.lit) : des ronds de liège, une flamme chacun ; elles dérivent
  c2_cierges_eau(E, o, t) {
    const D = o.data || {};
    if (!D.lit) return;
    const R = D.R ?? 6, n = D.n || 12, tt = t ? t.t : 0;
    for (let k = 0; k < n; k++) {
      const a = k * 2.399 + tt * 0.011 * (k % 2 ? 1 : -1), r = n > 1 ? R * Math.sqrt((k + 0.5) / n) : 0;
      const x = Math.cos(a) * r, z = Math.sin(a) * r, b = t ? Math.sin(tt * 1.3 + k) * 0.012 : 0;
      E.bx(x, b, z, 0.2, 0.04, 0.2, rgbf('#b89a6a'), TL.wood, k);
      E.bx(x, b + 0.04, z, 0.06, 0.1, 0.06, [0.95, 0.92, 0.84], TL.plain);
      E.fl = FX_EMIT;
      E.bx(x, b + 0.13, z, 0.07, 0.12 + (t ? Math.sin(tt * 11 + k * 1.7) * 0.02 : 0), 0.07, [1.6, 1.15, 0.5], TL.flame, tt * 2 + k);
      E.bx(x, -0.01, z, 0.5, 0.01, 0.5, [0.55, 0.36, 0.14], TL.plain, k * 0.7);
      E.fl = 0;
    }
  },
  // roseaux : v 0 une touffe (dans l'eau peu profonde), 1 une botte coupée, liée, debout
  c2_roseaux(E, o) {
    const v = (o.data && o.data.v) || 0, h = hash2i(Math.floor(o.x * 2), Math.floor(o.z * 2), 3);
    if (v === 1) {
      for (let k = 0; k < 9; k++) E.box(-0.24 + k * 0.06, 0.95, (k % 3) * 0.04 - 0.04, 0.035, 1.9, 0.035, rgbf(k % 2 ? '#c8b070' : '#b09a5a'), TL.straw, 0, 0.14, (k - 4) * 0.025);
      E.box(0, 0.75, 0.06, 0.56, 0.06, 0.16, rgbf('#6a5a3a'), TL.rope, 0, 0.14);
      return;
    }
    for (let k = 0; k < 16; k++) {
      const a = k * 2.2 + h * 6, r = 0.1 + (k % 4) * 0.2, H = 1.7 + ((k * 7) % 5) * 0.2, th = 0.09, ca = Math.cos(a), sa = Math.sin(a);
      const lx = ca * r, lz = sa * r, rx = th * sa, rz = -th * ca;
      E.box(lx, H / 2, lz, 0.035, H, 0.035, rgbf(k % 3 ? '#5a6e32' : '#7a8440'), TL.leaves, 0, rx, rz);
      if (k % 3 === 0) E.box(lx + ca * th * H * 0.5, H + 0.08, lz + sa * th * H * 0.5, 0.07, 0.26, 0.07, rgbf('#5a3a22'), TL.fur, 0, rx, rz);
    }
  },
  // chaudron de cuivre sur son trépied, le lait dedans ; un petit feu dessous quand on fait la tomme (data.lit)
  c2_chaudron(E, o, t) {
    for (let k = 0; k < 3; k++) { const a = k / 3 * TAU + 0.3, th = 0.42; E.box(Math.sin(a) * 0.58, 0.8, Math.cos(a) * 0.58, 0.06, 1.72, 0.06, PC7.dwood, TL.darkwood, 0, -Math.cos(a) * th, Math.sin(a) * th); }
    E.box(0, 1.3, 0, 0.02, 0.56, 0.02, PC7.iron, TL.iron);
    E.bx(0, 0.52, 0, 0.64, 0.46, 0.64, rgbf('#a8643a'), TL.metal); E.bx(0, 0.58, 0, 0.72, 0.32, 0.72, rgbf('#b87444'), TL.metal, Math.PI / 4);
    E.bx(0, 0.97, 0, 0.52, 0.02, 0.52, [0.92, 0.9, 0.82], TL.plain);
    for (let k = 0; k < 7; k++) { const a = k / 7 * TAU; E.bx(Math.cos(a) * 0.46, 0, Math.sin(a) * 0.46, 0.2, 0.15, 0.2, PC7.stone, TL.stone, a); }
    E.box(0, 0.08, 0, 0.6, 0.1, 0.1, rgbf('#5a4a3a'), TL.bark, 0.5); E.box(0, 0.08, 0, 0.6, 0.1, 0.1, rgbf('#5a4a3a'), TL.bark, -0.7);
    if (o.data && o.data.lit) { const f = t ? 1 + Math.sin(t.t * 12 + o.x) * 0.12 : 1; E.fl = FX_EMIT; E.bx(0, 0.1, 0, 0.26, 0.34 * f, 0.26, [1.3, 0.75, 0.3], TL.flame, t ? t.t * 2 : 0); E.fl = 0; }
  },
  // sonnailles : v 0 un râtelier de cloches de bêtes, 1 une seule pendue à un bâton (sur le cairn), 2 deux posées, 3 une cabossée dans l'herbe
  c2_sonnailles(E, o) {
    const v = (o.data && o.data.v) || 0;
    const cl = (x, y, z, s, ry, rx, rz, c) => { E.box(x, y, z, 0.16 * s, 0.2 * s, 0.11 * s, c || rgbf('#8a7a5a'), TL.metal, ry || 0, rx || 0, rz || 0); E.box(x, y + 0.12 * s, z, 0.1 * s, 0.03 * s, 0.035 * s, rgbf('#5a4a30'), TL.leather, ry || 0, rx || 0, rz || 0); };
    if (v === 0) {
      for (const s of [-0.8, 0.8]) E.bx(s, 0, 0, 0.08, 1.5, 0.08, PC7.dwood, TL.darkwood);
      E.bx(0, 1.42, 0, 1.8, 0.07, 0.07, PC7.wood, TL.wood);
      for (let k = 0; k < 6; k++) { const x = -0.62 + k * 0.25; E.box(x, 1.31, 0, 0.02, 0.2, 0.02, rgbf('#5a4a30'), TL.leather); cl(x, 1.1, 0, 1 + (k % 3) * 0.2, 0, (k % 2 ? 0.06 : -0.05), 0); }
      return;
    }
    if (v === 1) { E.box(0, 0.42, 0, 0.045, 0.84, 0.045, PC7.dwood, TL.darkwood, 0, 0.1); E.box(0.1, 0.8, 0.04, 0.34, 0.035, 0.035, PC7.dwood, TL.darkwood, 0.35); cl(0.2, 0.56, 0.08, 1.3, 0.35, 0, 0, rgbf('#6a5a3a')); return; }
    if (v === 2) { cl(0, 0.1, 0, 1.2, 0.3); cl(0.25, 0.1, 0.12, 1.0, 1.4); return; }
    cl(0, 0.07, 0, 1.3, 0.7, 1.4, 0.3, rgbf('#5a4a30'));
  },
  // étagère à tommes : trois planches, trois tommes sur chacune
  c2_fromages(E) {
    for (const s of [-0.52, 0.52]) for (const z of [-0.17, 0.17]) E.bx(s, 0, z, 0.05, 1.5, 0.05, PC7.dwood, TL.darkwood);
    for (const y of [0.3, 0.75, 1.2]) {
      E.bx(0, y, 0, 1.1, 0.04, 0.42, PC7.wood, TL.wood);
      for (let k = 0; k < 3; k++) { const c = rgbf(k % 2 ? '#c8b070' : '#b89a5a'); E.bx(-0.34 + k * 0.34, y + 0.04, 0, 0.26, 0.12, 0.26, c, TL.bread, k * 0.3); E.bx(-0.34 + k * 0.34, y + 0.04, 0, 0.26, 0.12, 0.26, c, TL.bread, k * 0.3 + Math.PI / 4); }
    }
  },
  // écriteau : v 0 une planche aux lettres gravées, 1 une planche taillée en flèche, une marque dessous
  c2_ecriteau(E, o) {
    const v = (o.data && o.data.v) || 0, ink = [0.2, 0.16, 0.12];
    E.bx(0, 0, 0, 0.12, 1.75, 0.12, PC7.dwood, TL.darkwood);
    if (v === 0) {
      E.bx(0, 1.1, 0.07, 1.1, 0.34, 0.04, rgbf('#a88a5a'), TL.wood);
      for (let k = 0; k < 10; k++) E.bx(-0.44 + k * 0.098, 1.2, 0.092, 0.05, 0.14, 0.005, ink, TL.plain);
      E.bx(0.28, 1.14, 0.092, 0.3, 0.02, 0.005, ink, TL.plain);
      return;
    }
    E.bx(0.2, 1.3, 0.07, 0.9, 0.22, 0.04, rgbf('#9a7a4a'), TL.wood);
    E.box(0.66, 1.41, 0.07, 0.2, 0.2, 0.04, rgbf('#9a7a4a'), TL.wood, 0, 0, Math.PI / 4);
    for (let k = 0; k < 6; k++) E.bx(-0.05 + k * 0.1, 1.36, 0.092, 0.05, 0.1, 0.005, ink, TL.plain);
    E.bx(-0.25, 0.72, 0.062, 0.04, 0.2, 0.005, ink, TL.plain); E.bx(-0.2, 0.8, 0.062, 0.14, 0.035, 0.005, ink, TL.plain);
  },
  c2_branches(E, o) { const a = hash2i(Math.floor(o.x * 3), Math.floor(o.z * 3), 5); E.box(0, 0.05, 0, 0.06, 0.06, 1.6, rgbf('#6a5438'), TL.bark, 0, 0, a * 0.2); E.box(0.1, 0.07, 0.3, 0.04, 0.04, 0.7, rgbf('#6a5438'), TL.bark, 0.7); E.box(-0.1, 0.06, -0.3, 0.04, 0.04, 0.6, rgbf('#5a6a3a'), TL.leaves, -0.6); },
});
Object.assign(PROP_COLL, {
  c2_croix_pierre: [0.18, 0.15, 2.4], c2_cloche_fendue: [0.5, 0.5, 0.9], c2_oratoire: [0.4, 0.4, 2.5], c2_tombe: [0.45, 0.95, 0.4], c2_lanterne_morts: [0.55, 0.55, 5.5],
  c2_gibet: null, c2_menhir: [0.45, 0.3, 3.2], c2_branlante: [0.95, 0.8, 2.0], c2_borne: [0.22, 0.16, 1.0], c2_billot: [0.28, 0.28, 0.6], c2_meule_pierre: [0.65, 0.2, 1.3],
  c2_cadran: [0.3, 0.3, 1.1], c2_pierre_sel: [0.6, 0.45, 0.35], c2_marques: [0.9, 0.65, 1.7], c2_dame_bois: [0.2, 0.18, 2.3],
  c2_cierges_eau: null, c2_roseaux: null, c2_chaudron: [0.45, 0.45, 1.1], c2_sonnailles: null, c2_fromages: [0.55, 0.22, 1.5], c2_ecriteau: [0.1, 0.1, 1.8],
});
Object.assign(PROP_LIGHTS, {
  c2_bougies: { c: [1.0, 0.72, 0.36], r: 5, y: 0.2, flicker: true, lit: true },
  c2_lanterne_morts: { c: [1.0, 0.7, 0.34], r: 11, y: 3.8, flicker: true, lit: true },
  c2_cierges_eau: { c: [1.0, 0.74, 0.38], r: 9, y: 0.25, flicker: true, lit: true },
  c2_chaudron: { c: [1.0, 0.55, 0.22], r: 6, y: 0.3, flicker: true, lit: true },
});
