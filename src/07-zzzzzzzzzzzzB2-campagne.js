// ============================================================================
//  MODÈLES DE LA CAMPAGNE (agent B2, dixième vague) : ce qu'il y a dedans
//  - le vieux moulin : les meules dans leur archure, la trémie, le gros fer ;
//    le rouet sur l'arbre des ailes, la lanterne, le frein (ils tournent avec
//    les ailes) ; la bluterie, la goulotte, la farine répandue, des traces de
//    pas dans la farine, les marteaux à rhabiller, les habits du meunier ;
//  - le phare : l'optique autour de la lampe, le poêle, les bidons d'huile, la
//    longue-vue, le ciré pendu, le baromètre, le registre ouvert ;
//  - les pigeonniers : les boulins, l'échelle tournante, les pigeons ;
//  - la loge des charbonniers : perches et mottes, la couche de fougères, la
//    marmite, les outils ;
//  - le clocher englouti : le mouton, la corde, les abat-sons, la vase, les
//    marches qui s'enfoncent, et la cloche (on ne la voit pas toujours) ;
//  - la bergerie des Combes : la houlette du berger.
//  (même manière que 07-models.js : des boîtes et les tuiles du jeu ; l'avant regarde +z)
// ============================================================================
const PB2 = {
  wood: rgbf('#8a6a44'), dwood: rgbf('#5a4028'), oak: rgbf('#6e5236'), iron: rgbf('#4a4a50'), rust: rgbf('#7a4a30'), stone: rgbf('#a8a498'),
  meule: rgbf('#b8b0a0'), flour: [1.08, 1.06, 1.0], sack: rgbf('#c8b088'), rope: rgbf('#b89a6a'), brass: rgbf('#b8963a'), copper: rgbf('#a8643a'),
  plaster: rgbf('#d8d0c0'), dark: [0.07, 0.06, 0.05], moss: rgbf('#5a6e3a'), turf: rgbf('#6a6a3a'), earth: rgbf('#5a4632'), fern: rgbf('#5a7a32'),
  fernDry: rgbf('#8a7a3a'), bronze: rgbf('#6a6a42'), oil: rgbf('#2a4a3a'), coat: rgbf('#3a4a3a'), pigeon: rgbf('#8a8a92'), pigeonD: rgbf('#5a5a66'),
  silt: rgbf('#4a5040'), weed: rgbf('#3a5a2a'),
};
// l'angle des ailes du moulin (le même que moulin_ailes : elles tournent dans les versions 1 et 3 du monde, pas dans l'Envers)
function b2AngleAiles(t) {
  const w = typeof game !== 'undefined' && game.world;
  const tourne = !!(w && (w.curVer & 0x5) && !(w.curVer & VER_ENVERS));
  return tourne && t ? t.t * 0.4 : 0.4;
}
Object.assign(PROP_MODELS, {
  // ---------------------------------------------------------------- le moulin
  // les meules dans leur archure (coffre rond de planches), la trémie sur son chevalet, l'auget, l'anille, le fer qui monte
  b2_meules(E, o) {
    const fresh = !(o.data && o.data.vieux);
    for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; E.bx(Math.cos(a) * 0.6, 0, Math.sin(a) * 0.6, 0.18, 0.5, 0.18, PB2.dwood, TL.darkwood, a); }
    E.bx(0, 0.5, 0, 1.36, 0.04, 1.36, PB2.wood, TL.wood);
    // archure : huit planches debout autour des meules
    for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + TAU / 16; E.bx(Math.cos(a) * 0.62, 0.54, Math.sin(a) * 0.62, 0.52, 0.38, 0.06, PB2.wood, TL.wood, -a + Math.PI / 2); }
    E.bx(0, 0.92, 0, 1.3, 0.04, 1.3, PB2.dwood, TL.darkwood); E.bx(0, 0.92, 0, 1.3, 0.04, 1.3, PB2.dwood, TL.darkwood, Math.PI / 4);
    // chevalet et trémie (une pyramide renversée de planches)
    for (const s of [-0.42, 0.42]) { E.bx(s, 0.96, -0.3, 0.07, 0.62, 0.07, PB2.dwood, TL.darkwood); E.bx(s, 0.96, 0.3, 0.07, 0.62, 0.07, PB2.dwood, TL.darkwood); }
    E.bx(0, 1.55, 0, 0.92, 0.06, 0.7, PB2.dwood, TL.darkwood);
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; E.box(Math.sin(a) * 0.24, 1.82, Math.cos(a) * 0.24, 0.62, 0.5, 0.04, PB2.wood, TL.wood, a, 0.55); }
    if (fresh) E.bx(0, 1.95, 0, 0.5, 0.04, 0.5, PB2.flour, TL.plain);
    E.box(0.05, 1.42, 0.38, 0.16, 0.06, 0.5, PB2.wood, TL.wood, 0, -0.35);
    // le fer de meule et l'arbre qui monte au plafond (vers la lanterne)
    E.bx(0, 0.96, 0, 0.1, 2.4, 0.1, PB2.iron, TL.iron);
    // la goulotte de l'archure (vers l'étage du dessous)
    E.box(0.66, 0.42, 0.1, 0.18, 0.12, 0.36, PB2.wood, TL.wood, 0.4, 0.5);
    E.bx(0.48, 0.92, -0.42, 0.2, 0.03, 0.14, PB2.flour, TL.plain);
  },
  // l'arbre des ailes, le rouet (la grande roue dentée), la lanterne (le pignon de l'arbre vertical), le frein ; tourne avec les ailes
  b2_rouet(E, o, t) {
    const a = b2AngleAiles(t), H = 1.95;
    // l'arbre : de la tête des ailes (dehors, z −2,15) jusqu'au palier de queue
    E.box(0, H, -0.55, 0.34, 0.34, 4.0, PB2.oak, TL.darkwood, 0, 0, a); E.box(0, H, -0.55, 0.34, 0.34, 4.0, PB2.oak, TL.darkwood, 0, 0, a + Math.PI / 4);
    E.bx(0, 0, 1.15, 0.3, H - 0.18, 0.3, PB2.dwood, TL.darkwood); E.bx(0, H - 0.22, 1.15, 0.5, 0.12, 0.4, PB2.iron, TL.iron);
    // le rouet : jante de huit segments, quatre bras, les alluchons (dents) sur la face arrière
    const R = 0.95;
    for (let k = 0; k < 8; k++) { const b = a + k / 8 * TAU; E.box(Math.sin(b) * R, H + Math.cos(b) * R, 0, 0.78, 0.2, 0.22, PB2.oak, TL.wood, 0, 0, -b); }
    for (let k = 0; k < 2; k++) { const b = a + k * Math.PI / 2; E.box(0, H, 0, 0.14, 2 * R, 0.14, PB2.dwood, TL.darkwood, 0, 0, -b); }
    for (let k = 0; k < 16; k++) { const b = a + k / 16 * TAU; E.box(Math.sin(b) * (R - 0.04), H + Math.cos(b) * (R - 0.04), 0.16, 0.07, 0.07, 0.12, PB2.wood, TL.wood, 0, 0, -b); }
    // la lanterne : deux plateaux et des fuseaux, sur l'arbre vertical (derrière la roue)
    const b = -a * 3.2;
    E.box(0, H - R + 0.2, 0.42, 0.5, 0.05, 0.5, PB2.dwood, TL.darkwood, b); E.box(0, H - R - 0.06, 0.42, 0.5, 0.05, 0.5, PB2.dwood, TL.darkwood, b);
    for (let k = 0; k < 6; k++) { const c = b + k / 6 * TAU; E.box(Math.sin(c) * 0.2, H - R + 0.07, 0.42 + Math.cos(c) * 0.2, 0.04, 0.26, 0.04, PB2.wood, TL.wood); }
    E.bx(0, -0.1, 0.42, 0.13, H - R + 0.4, 0.13, PB2.oak, TL.darkwood, b);
    // le frein : la bande de bois autour de la jante, le levier, la corde qui pend
    E.box(0.98, H + 0.7, 0, 0.1, 0.9, 0.24, PB2.dwood, TL.darkwood, 0, 0, 0.6);
    E.box(1.2, H + 0.95, 0, 0.1, 0.1, 0.1, PB2.iron, TL.iron);
    E.box(1.2, H - 0.25, 0.05, 0.025, 2.3, 0.025, PB2.rope, TL.rope);
  },
  // la bluterie : un long coffre de planches, le blutoir incliné dedans, la manivelle
  b2_bluterie(E) {
    E.bx(0, 0, 0, 0.75, 1.0, 1.6, PB2.wood, TL.wood); E.bx(0, 1.0, 0, 0.8, 0.05, 1.66, PB2.dwood, TL.darkwood);
    E.box(0.39, 0.62, -0.1, 0.02, 0.42, 1.2, PB2.dark, TL.plain);
    E.box(0.405, 0.64, -0.1, 0.02, 0.32, 1.1, rgbf('#e8e0cc'), TL.cloth, 0, 0.12);
    E.box(0.44, 0.7, 0.86, 0.05, 0.05, 0.3, PB2.iron, TL.iron); E.box(0.44, 0.58, 1.0, 0.05, 0.28, 0.05, PB2.iron, TL.iron);
    E.box(0, 1.05, -0.65, 0.24, 0.5, 0.24, PB2.wood, TL.wood, 0, 0.3);
    E.bx(0.1, 1.05, 0.5, 0.42, 0.02, 0.5, PB2.flour, TL.plain);
  },
  // la goulotte qui descend du plafond (des meules) dans un sac pendu à son crochet
  b2_goulotte(E) {
    E.box(0, 2.35, 0, 0.18, 1.2, 0.18, PB2.wood, TL.wood, 0, 0.25);
    E.bx(0, 1.62, -0.12, 0.14, 0.1, 0.14, PB2.dwood, TL.darkwood);
    E.bx(0, 0, -0.18, 0.5, 0.95, 0.4, PB2.dwood, TL.darkwood); E.bx(0, 0.95, -0.18, 0.46, 0.55, 0.36, PB2.sack, TL.sack);
    E.bx(0, 1.5, -0.18, 0.3, 0.06, 0.24, PB2.flour, TL.plain);
  },
  // de la farine répandue (data.n taches, data.s graine)
  b2_poussiere(E, o) {
    const n = (o.data && o.data.n) || 5, g = (o.data && o.data.s) || 1;
    for (let k = 0; k < n; k++) { const h = hash2i(k, g, 41), h2 = hash2i(g, k, 43); E.bx((h - 0.5) * 1.4, 0.005 + k * 0.001, (h2 - 0.5) * 1.4, 0.2 + h * 0.5, 0.012, 0.18 + h2 * 0.45, PB2.flour, TL.plain, h * 3); }
  },
  // des traces de pas dans la farine : n pas le long de l'axe +z, puis plus rien
  b2_traces(E, o) {
    const n = (o.data && o.data.n) || 6;
    E.bx(0, 0.002, (n - 1) * 0.18, 0.75, 0.006, n * 0.36 + 0.35, PB2.flour, TL.plain);
    for (let k = 0; k < n; k++) { const s = k % 2 ? 0.13 : -0.13; E.bx(s, 0.004, k * 0.36, 0.11, 0.008, 0.26, rgbf('#8a7a62'), TL.plain, (k % 2 ? 0.05 : -0.05)); }
  },
  // les marteaux à rhabiller les meules, pendus à une planche clouée au mur
  b2_marteaux(E) {
    E.bx(0, 1.2, 0, 1.0, 0.12, 0.04, PB2.dwood, TL.darkwood);
    for (let k = 0; k < 4; k++) { const x = -0.36 + k * 0.24; E.bx(x, 0.85, 0.04, 0.035, 0.38, 0.035, PB2.wood, TL.wood); E.bx(x, 0.8, 0.04, 0.16, 0.06, 0.05, PB2.iron, TL.iron); }
    E.bx(0.45, 0, 0.05, 0.3, 0.3, 0.3, PB2.stone, TL.stone);
  },
  // les habits du meunier : une blouse et un chapeau pendus à un clou, des sabots dessous
  b2_habits(E) {
    E.bx(0, 1.62, 0, 0.06, 0.06, 0.08, PB2.iron, TL.iron);
    E.box(0, 1.2, 0.07, 0.5, 0.8, 0.1, rgbf('#5a6a7a'), TL.cloth, 0, 0.06); E.box(0, 1.5, 0.08, 0.56, 0.16, 0.14, rgbf('#5a6a7a'), TL.cloth);
    E.box(0, 1.7, 0.12, 0.42, 0.04, 0.42, rgbf('#3a3026'), TL.wool, 0, 0.3); E.box(0, 1.76, 0.13, 0.24, 0.1, 0.24, rgbf('#3a3026'), TL.wool, 0, 0.3);
    for (const s of [-0.1, 0.1]) E.bx(s, 0, 0.2, 0.13, 0.12, 0.3, PB2.oak, TL.wood);
  },
  // ---------------------------------------------------------------- le phare
  // l'optique : un tambour de laiton et de verre autour de la lampe ; elle tourne la nuit
  b2_optique(E, o, t) {
    const nuit = t && t.night, a = nuit && t ? t.t * 0.35 : 0.2;
    E.bx(0, 0, 0, 0.56, 0.12, 0.56, PB2.brass, TL.metal); E.bx(0, 0, 0, 0.56, 0.12, 0.56, PB2.brass, TL.metal, Math.PI / 4);
    for (let k = 0; k < 8; k++) {
      const b = a + k / 8 * TAU, x = Math.sin(b) * 0.25, z = Math.cos(b) * 0.25;
      E.fl = nuit && k % 2 === 0 ? FX_EMIT : 0;
      E.box(x, 0.66, z, 0.19, 0.9, 0.04, nuit ? [1.1, 0.98, 0.7] : [0.62, 0.74, 0.76], TL.glass, b);
      E.fl = 0;
      E.box(x * 1.08, 0.66, z * 1.08, 0.03, 0.92, 0.03, PB2.brass, TL.metal, b);
    }
    E.bx(0, 1.12, 0, 0.54, 0.06, 0.54, PB2.brass, TL.metal); E.bx(0, 1.18, 0, 0.26, 0.22, 0.26, PB2.brass, TL.metal, Math.PI / 4);
    E.bx(0, 1.4, 0, 0.06, 0.6, 0.06, PB2.iron, TL.iron);
  },
  // le poêle de fonte et son tuyau qui monte au plafond
  b2_poele(E, o) {
    const h = (o.data && o.data.h) || 2.6;
    for (const [x, z] of [[-0.2, -0.16], [0.2, -0.16], [-0.2, 0.16], [0.2, 0.16]]) E.bx(x, 0, z, 0.05, 0.14, 0.05, PB2.iron, TL.iron);
    E.bx(0, 0.14, 0, 0.5, 0.56, 0.4, rgbf('#2e2e32'), TL.iron); E.bx(0, 0.7, 0, 0.56, 0.05, 0.46, rgbf('#3a3a40'), TL.metal);
    E.bx(0, 0.26, 0.205, 0.22, 0.16, 0.02, PB2.dark, TL.plain); E.bx(0.08, 0.42, 0.21, 0.05, 0.03, 0.02, PB2.brass, TL.metal);
    E.bx(0, 0.75, -0.1, 0.14, h - 0.75, 0.14, rgbf('#2e2e32'), TL.iron);
    E.bx(-0.12, 0.75, 0.08, 0.2, 0.14, 0.2, rgbf('#5a4a3a'), TL.metal);
  },
  // bidons d'huile et une caisse de mèches
  b2_bidons(E) {
    for (const [x, z, s] of [[-0.2, 0, 1], [0.15, 0.08, 0.9], [0.0, -0.25, 0.8]]) { E.bx(x, 0, z, 0.26 * s, 0.5 * s, 0.26 * s, PB2.oil, TL.metal); E.bx(x + 0.05 * s, 0.5 * s, z, 0.06, 0.08, 0.06, PB2.brass, TL.metal); }
    E.bx(0.4, 0, -0.15, 0.36, 0.22, 0.26, PB2.wood, TL.wood); E.bx(0.4, 0.22, -0.15, 0.3, 0.02, 0.2, rgbf('#e8e0cc'), TL.rope);
  },
  // la longue-vue sur son trépied, tournée vers la fenêtre (+z)
  b2_longue_vue(E) {
    for (let k = 0; k < 3; k++) { const a = k / 3 * TAU; E.box(Math.sin(a) * 0.2, 0.55, Math.cos(a) * 0.2, 0.04, 1.15, 0.04, PB2.dwood, TL.darkwood, 0, -Math.cos(a) * 0.32, Math.sin(a) * 0.32); }
    E.box(0, 1.16, 0.1, 0.09, 0.09, 0.8, PB2.brass, TL.metal, 0, -0.08); E.box(0, 1.19, 0.5, 0.11, 0.11, 0.06, PB2.brass, TL.metal, 0, -0.08);
  },
  // le ciré du gardien, pendu, et ses bottes
  b2_cire(E) {
    E.bx(0, 1.62, 0, 0.06, 0.06, 0.08, PB2.iron, TL.iron);
    E.box(0, 1.15, 0.08, 0.55, 0.95, 0.12, rgbf('#c8a030'), TL.leather, 0, 0.05); E.box(0, 1.55, 0.09, 0.3, 0.2, 0.18, rgbf('#c8a030'), TL.leather);
    for (const s of [-0.11, 0.11]) { E.bx(s, 0, 0.22, 0.13, 0.42, 0.14, rgbf('#2a2a2a'), TL.leather); E.bx(s, 0, 0.3, 0.13, 0.1, 0.2, rgbf('#2a2a2a'), TL.leather); }
  },
  // le baromètre au mur
  b2_barometre(E) {
    E.bx(0, 1.15, 0, 0.26, 0.62, 0.05, PB2.oak, TL.darkwood); E.box(0, 1.6, 0.03, 0.24, 0.24, 0.03, rgbf('#e8e0cc'), TL.plain); E.box(0.02, 1.6, 0.05, 0.02, 0.1, 0.01, PB2.dark, TL.plain, 0, 0, 0.6);
    E.bx(0, 1.2, 0.03, 0.03, 0.32, 0.02, rgbf('#c8c8d0'), TL.glass);
  },
  // le registre ouvert sur la table, une plume, un encrier
  b2_registre(E) {
    E.box(-0.12, 0.012, 0, 0.24, 0.025, 0.32, PB2.dwood, TL.leather, 0.06); E.box(0.12, 0.012, 0, 0.24, 0.025, 0.32, PB2.dwood, TL.leather, -0.06);
    E.box(-0.11, 0.03, 0, 0.21, 0.01, 0.29, rgbf('#e8dcb8'), TL.paper, 0.06); E.box(0.11, 0.03, 0, 0.21, 0.01, 0.29, rgbf('#e8dcb8'), TL.paper, -0.06);
    E.bx(0.32, 0, 0.1, 0.07, 0.07, 0.07, rgbf('#1a1a26'), TL.glass); E.box(0.3, 0.1, 0.06, 0.01, 0.01, 0.24, rgbf('#e8e4dc'), TL.plain, 0.6, 0.6);
  },
  // ---------------------------------------------------------------- les pigeonniers
  // un pan de boulins (niches à pigeons) contre le mur intérieur : l (largeur), h (hauteur)
  b2_boulins(E, o) {
    const L = (o.data && o.data.l) || 1.0, H = (o.data && o.data.h) || 3.6, g = (o.data && o.data.s) || 1;
    const nc = Math.max(1, Math.floor(L / 0.32)), nr = Math.floor(H / 0.36), dx = L / nc;
    for (let r = 0; r < nr; r++) {
      const y = 0.45 + r * 0.36;
      E.bx(0, y - 0.04, 0.06, L, 0.04, 0.12, PB2.plaster, TL.plain);
      for (let c = 0; c < nc; c++) {
        const x = -L / 2 + dx * (c + 0.5), h = hash2i(r * 7 + c, g, 13);
        E.bx(x, y + 0.02, 0.005, 0.2, 0.2, 0.012, PB2.dark, TL.plain);
        if (h < 0.12) E.bx(x, y, 0.07, 0.16, 0.02, 0.06, rgbf('#e0dcd0'), TL.plain);
        else if (h > 0.9) { E.bx(x, y + 0.02, 0.03, 0.1, 0.1, 0.12, PB2.pigeon, TL.wool); E.bx(x, y + 0.11, 0.08, 0.05, 0.05, 0.05, PB2.pigeonD, TL.plain); }
      }
    }
  },
  // un pigeon (il hoche la tête, se gonfle, se lisse)
  b2_pigeon(E, o, t) {
    const g = (o.data && o.data.s) || 0, tt = t ? t.t + g * 3.1 : 0, b = Math.sin(tt * 2.1) > 0.6 ? Math.sin(tt * 9) * 0.03 : 0, gonfle = Math.sin(tt * 0.31 + g) > 0.85 ? 0.03 : 0;
    E.bx(0, 0, 0, 0.04, 0.05, 0.04, rgbf('#c87a6a'), TL.plain);
    E.box(0, 0.11, 0, 0.13 + gonfle, 0.12 + gonfle, 0.22, PB2.pigeon, TL.wool, 0, 0.15);
    E.box(0, 0.12, -0.15, 0.08, 0.03, 0.12, PB2.pigeonD, TL.wool, 0, 0.3);
    E.box(0, 0.2 + b, 0.1 + b, 0.07, 0.08, 0.08, PB2.pigeonD, TL.wool);
    E.box(0, 0.19 + b, 0.15 + b, 0.025, 0.02, 0.04, rgbf('#d8c8b0'), TL.plain);
    E.box(0, 0.16, 0.08, 0.09, 0.05, 0.05, rgbf('#5a8a7a'), TL.plain);
  },
  // l'échelle tournante : un poteau au milieu, deux bras, l'échelle au bout (data.a : l'angle)
  b2_echelle_tournante(E, o, t) {
    const H = (o.data && o.data.h) || 4.2, a = (o.data && o.data.a) || 0, R = 0.95;
    E.bx(0, 0, 0, 0.16, H, 0.16, PB2.oak, TL.darkwood); E.bx(0, 0, 0, 0.3, 0.08, 0.3, PB2.iron, TL.iron);
    for (const y of [0.9, H - 0.5]) E.box(Math.sin(a) * R / 2, y, Math.cos(a) * R / 2, 0.08, 0.08, R, PB2.dwood, TL.darkwood, a);
    const x = Math.sin(a) * R, z = Math.cos(a) * R;
    for (const s of [-0.22, 0.22]) E.box(x + Math.cos(a) * s, (H - 0.2) / 2, z - Math.sin(a) * s, 0.06, H - 0.2, 0.06, PB2.wood, TL.wood, a);
    for (let y = 0.35; y < H - 0.3; y += 0.36) E.box(x, y, z, 0.44, 0.045, 0.045, PB2.dwood, TL.darkwood, a);
  },
  // ---------------------------------------------------------------- la loge des charbonniers
  // perches et mottes : une pyramide de perches couverte de mottes de gazon, le bas en terre ; la porte à l'avant (+z) ;
  // data : B (demi-base), H (hauteur des pans, sous le chapeau), C (hauteur totale), pw (demi-largeur de la porte), ph (hauteur de la porte)
  b2_loge(E, o) {
    const d = o.data || {}, B = d.B || 2.25, H = d.H || 1.95, C = d.C || 4.4, pw = d.pw || 0.55, ph = d.ph || 1.95;
    const half = (y) => B * (1 - y / C), pente = Math.atan2(B, C), Lp = Math.hypot(B, C);
    const bande = (face, y0, y1, u0, u1, col, tex) => {
      // une bande de mottes sur un pan (face 0..3 ; u0..u1 le long du pan, y0..y1 en hauteur)
      const ym = (y0 + y1) / 2, r = half(ym), len = (y1 - y0) / Math.cos(pente), w = u1 - u0, um = (u0 + u1) / 2;
      const a = face * Math.PI / 2, ca = Math.cos(a), sa = Math.sin(a);
      // centre : à la distance r du milieu, sur la normale du pan ; décalé de um le long du pan
      const cx = Math.sin(a) * r + ca * um, cz = Math.cos(a) * r - sa * um;
      E.box(cx, ym, cz, w, len, 0.2, col, tex, a, -pente);
    };
    const rangs = 6;
    for (let face = 0; face < 4; face++) {
      for (let i = 0; i < rangs; i++) {
        const y0 = H * i / rangs, y1 = H * (i + 1) / rangs, w0 = half(y1) * 2 + 0.12, col = i < 2 ? PB2.earth : i % 2 ? PB2.turf : PB2.moss, tex = i < 2 ? TL.soil : TL.leaves;
        if (face === 0 && y0 < ph) { bande(face, y0, y1, -w0 / 2, -pw, col, tex); bande(face, y0, y1, pw, w0 / 2, col, tex); }
        else bande(face, y0, y1, -w0 / 2, w0 / 2, col, tex);
      }
      // les perches d'arête
      const a = face * Math.PI / 2 + Math.PI / 4, rr = B * Math.SQRT2;
      E.box(Math.sin(a) * rr / 2, C / 2 - 0.1, Math.cos(a) * rr / 2, 0.12, Math.hypot(rr, C) + 0.3, 0.12, PB2.dwood, TL.bark, a, -Math.atan2(rr, C));
    }
    // la porte : deux poteaux, le linteau, un petit auvent de planches au-dessus
    const zf = half(ph) + 0.02;
    for (const s of [-1, 1]) {
      E.bx(s * (pw + 0.06), 0, zf, 0.14, ph + 0.12, 0.14, PB2.oak, TL.bark);
      // joues de mottes entre le poteau et le pan (le passage sous l'auvent)
      E.bx(s * (pw + 0.16), 0, (zf + B) / 2, 0.14, ph * 0.55, B - zf, PB2.earth, TL.soil);
    }
    E.bx(0, ph, zf, 2 * pw + 0.4, 0.14, 0.16, PB2.oak, TL.bark);
    E.box(0, ph + 0.18, (zf + B) / 2 + 0.05, 2 * pw + 0.5, 0.06, B - zf + 0.35, PB2.wood, TL.wood, 0, 0.32);
    // la fumée sort par le haut : un trou de perches noircies
    E.bx(0, C - 0.15, 0, 0.3, 0.25, 0.3, PB2.dark, TL.coal);
  },
  // la couche : des fougères sur des branchages, une couverture roulée
  b2_fougeres(E) {
    E.bx(0, 0, 0, 0.9, 0.08, 1.9, PB2.dwood, TL.bark);
    for (let k = 0; k < 9; k++) { const h = hash2i(k, 3, 7); E.box((h - 0.5) * 0.6, 0.12, -0.8 + k * 0.2, 0.5 + h * 0.3, 0.06, 0.32, k % 3 ? PB2.fern : PB2.fernDry, TL.leaves, (h - 0.5) * 0.8); }
    E.box(0, 0.2, -0.75, 0.6, 0.16, 0.24, rgbf('#6a5040'), TL.blanket, 0, 0, 0.1);
  },
  // la marmite noire sur trois pierres, son couvercle, la louche
  b2_marmite(E) {
    for (let k = 0; k < 3; k++) { const a = k / 3 * TAU; E.bx(Math.sin(a) * 0.24, 0, Math.cos(a) * 0.24, 0.18, 0.14, 0.18, PB2.stone, TL.stone, a); }
    E.bx(0, 0.06, 0, 0.12, 0.04, 0.12, PB2.dark, TL.coal);
    E.bx(0, 0.14, 0, 0.42, 0.3, 0.42, rgbf('#26262a'), TL.iron); E.bx(0, 0.18, 0, 0.46, 0.2, 0.46, rgbf('#26262a'), TL.iron, Math.PI / 4);
    E.bx(0, 0.44, 0, 0.38, 0.03, 0.38, rgbf('#303034'), TL.metal);
    E.box(0, 0.62, 0, 0.5, 0.03, 0.03, PB2.iron, TL.iron); for (const s of [-0.24, 0.24]) E.box(s, 0.52, 0, 0.03, 0.22, 0.03, PB2.iron, TL.iron);
    E.box(0.32, 0.12, 0.2, 0.05, 0.03, 0.4, PB2.wood, TL.wood, 0.5, 0.2);
  },
  // les outils du charbonnier contre la paroi : le râble, la pelle, le crible
  b2_outils_charbon(E) {
    E.box(-0.3, 0.9, 0, 0.05, 1.9, 0.05, PB2.wood, TL.wood, 0, 0.18); E.box(-0.3, 0.06, -0.18, 0.4, 0.12, 0.04, PB2.iron, TL.iron, 0, 0.18);
    E.box(0, 0.85, 0, 0.05, 1.7, 0.05, PB2.wood, TL.wood, 0, 0.16); E.box(0, 0.12, -0.14, 0.24, 0.3, 0.03, PB2.iron, TL.iron, 0, 0.16);
    E.box(0.4, 0.4, 0.05, 0.62, 0.62, 0.08, PB2.wood, TL.wood, 0, 0.2); E.box(0.4, 0.4, 0.07, 0.5, 0.5, 0.02, PB2.dark, TL.plain, 0, 0.2);
  },
  // ---------------------------------------------------------------- la bergerie des Combes
  // la houlette du berger, appuyée au mur (du côté +z) : le bâton, la crosse en haut, la petite pelle de fer en bas
  b2_houlette(E) {
    E.box(0, 0.8, 0, 0.045, 1.62, 0.045, PB2.wood, TL.wood, 0, 0.14);
    E.box(0, 1.63, 0.05, 0.04, 0.04, 0.15, PB2.dwood, TL.darkwood);
    E.box(0, 1.57, -0.02, 0.04, 0.13, 0.04, PB2.dwood, TL.darkwood);
    E.box(0, 0.04, -0.12, 0.09, 0.08, 0.02, PB2.iron, TL.iron, 0, 0.14);
  },
  // ---------------------------------------------------------------- le clocher englouti
  // le mouton (la poutre de la cloche) d'un mur à l'autre, ses ferrures, la corde qui pend jusqu'au fond (data.l : portée)
  b2_mouton(E, o) {
    const L = (o.data && o.data.l) || 2.6, h = (o.data && o.data.h) || 2.4;
    E.bx(0, 0, 0, L, 0.3, 0.32, PB2.oak, TL.darkwood); E.bx(0, -0.12, 0, 0.5, 0.12, 0.36, PB2.oak, TL.darkwood);
    for (const s of [-0.18, 0.18]) E.bx(s, -0.4, 0, 0.06, 0.4, 0.38, PB2.rust, TL.iron);
    E.box(0, -0.42, 0, 0.12, 0.12, 0.12, PB2.rust, TL.iron, 0, 0.785);
    E.box(0.32, -h / 2 + 0.1, 0.05, 0.035, h - 0.2, 0.035, rgbf('#6a6248'), TL.rope, 0, 0.02);
    for (let k = 0; k < 3; k++) E.box(0.32 + (k - 1) * 0.04, -h * (0.3 + k * 0.2), 0.08, 0.1, 0.18, 0.02, PB2.weed, TL.leaves, k);
  },
  // la cloche : on ne la voit que les nuits d'orage (data.la) ; elle se balance
  b2_cloche_pendue(E, o, t) {
    if (!(o.data && o.data.la)) return;
    const b = t ? Math.sin(t.t * 0.9) * 0.35 : 0;
    const at = (d) => [Math.sin(b) * d, -Math.cos(b) * d];
    let [x, y] = at(0.45); E.box(x, y, 0, 0.62, 0.72, 0.62, PB2.bronze, TL.gold, 0, 0, b);
    [x, y] = at(0.16); E.box(x, y, 0, 0.36, 0.2, 0.36, PB2.bronze, TL.gold, 0, 0, b);
    [x, y] = at(0.8); E.box(x, y, 0, 0.76, 0.08, 0.76, PB2.bronze, TL.gold, 0, 0, b);
    [x, y] = at(0.92); E.box(x, y, 0, 0.1, 0.16, 0.1, PB2.rust, TL.iron, 0, 0, b * 1.3);
  },
  // la vase au fond : des bosses molles, des herbes qui ondulent
  b2_vase(E, o, t) {
    const g = (o.data && o.data.s) || 1;
    for (let k = 0; k < 6; k++) { const h = hash2i(k, g, 5), h2 = hash2i(g, k, 9); E.bx((h - 0.5) * 2.0, -0.05, (h2 - 0.5) * 2.0, 0.5 + h * 0.6, 0.12 + h2 * 0.12, 0.4 + h2 * 0.6, PB2.silt, TL.soil, h * 3); }
    for (let k = 0; k < 7; k++) { const h = hash2i(k, g, 17), h2 = hash2i(g, k, 19); E.box((h - 0.5) * 2.0, 0.3 + h2 * 0.3, (h2 - 0.5) * 2.0, 0.05, 0.6 + h2 * 0.6, 0.02, PB2.weed, TL.leaves, h * 6, 0.15, (h - 0.5) * 0.4); }
  },
  // des marches de pierre qui descendent dans la vase (l'escalier du clocher, sous le fond)
  b2_marches(E) {
    for (let k = 0; k < 4; k++) E.bx(0, -0.18 * k, k * 0.32, 0.9, 0.18, 0.32, PB2.stone, mt(M_MOSSY));
    E.bx(0, -0.05, 0.9, 0.95, 0.08, 0.6, PB2.silt, TL.soil);
  },
  // les abat-sons : des lames de bois inclinées dans une baie (l : largeur, h : hauteur)
  b2_abat_sons(E, o) {
    const L = (o.data && o.data.l) || 1.1, H = (o.data && o.data.h) || 0.9;
    for (let y = 0.1; y < H; y += 0.2) E.box(0, y, 0, L, 0.03, 0.26, PB2.dwood, TL.darkwood, 0, 0.6);
  },
});
// (les modèles animés : DYN_PROPS, dans 11-zzzzB2-campagne.js — DYN_PROPS n'existe pas encore ici)
// collisions (demi-largeur x, demi-profondeur z, hauteur)
Object.assign(PROP_COLL, {
  b2_meules: [0.72, 0.72, 2.0], b2_rouet: [1.05, 0.25, 3.0], b2_bluterie: [0.4, 0.82, 1.05], b2_goulotte: [0.26, 0.22, 1.5],
  b2_optique: [0.27, 0.27, 1.4], b2_poele: [0.3, 0.24, 0.75], b2_bidons: [0.45, 0.3, 0.5], b2_longue_vue: [0.25, 0.25, 1.2],
  b2_echelle_tournante: [0.09, 0.09, 4.2], b2_marmite: [0.3, 0.3, 0.5],
});
