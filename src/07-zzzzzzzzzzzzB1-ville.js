// ============================================================================
//  LA VILLE, ET TOUT CE QUI A UN ÉTAGE — les modèles (11-zzzzB1-ville.js)
//  La trémie (le cadre d'une trappe ouverte dans un plancher, son battant
//  relevé), le râtelier d'armes des tours, le métier à tisser, les meubles sous
//  leurs draps (le garde-meuble de la commune), la plaque d'une chambre
//  d'auberge (son numéro peint), le bocal de l'alchimiste, la lampe à huile (elle
//  ne brille que la nuit), la patère et son manteau, un bol, un globe, une carte
//  au mur, un lutrin et son registre, des rouleaux de drap, un rouet, un petit
//  poêle et sa bouilloire, un vase de lilas secs, une paire de souliers, des
//  jouets, un berceau.
//  L'avant de chaque modèle regarde +z ; l'origine est au sol, au centre.
// ============================================================================
const B1C = {
  fer: rgbf('#3e3f45'), laiton: rgbf('#b8933e'), drap: rgbf('#ddd8cc'), drapOmbre: rgbf('#c4beb0'), noir: [0.05, 0.045, 0.04],
  verre: rgbf('#9ab8b0'), lait: rgbf('#f2efe6'), soupe: rgbf('#a8783a'), lilas: rgbf('#9a80b0'), lilasSec: rgbf('#8a7a7a'),
};
// chiffres de 3 × 5 pixels (la plaque d'une chambre)
const B1_CHIFFRES = {
  0: ['111', '101', '101', '101', '111'], 1: ['010', '110', '010', '010', '111'], 2: ['111', '001', '111', '100', '111'], 3: ['111', '001', '011', '001', '111'],
  4: ['101', '101', '111', '001', '001'], 5: ['111', '100', '111', '001', '111'], 6: ['111', '100', '111', '101', '111'], 7: ['111', '001', '010', '010', '010'],
  8: ['111', '101', '111', '101', '111'], 9: ['111', '101', '111', '001', '111'],
};
Object.assign(PROP_MODELS, {
  // la trémie : le cadre de la trappe (au ras du plancher, et sa bordure vue d'en dessous), les gonds, l'anneau ;
  // le battant relevé est un bloc (il arrête le pas) : ici, ses ferrures seulement. data : { w (x), d (z), ep (plancher) }
  b1_tremie(E, o) {
    const D = o.data || {}, w = D.w || 1.0, d = D.d || 1.15, ep = D.ep || 0.16, b = 0.08;
    for (const s of [-1, 1]) {
      E.bx(s * (w / 2 + b / 2), -0.012, 0, b, 0.03, d + 2 * b, WHITE, TL.darkwood);
      E.bx(0, -0.012, s * (d / 2 + b / 2), w, 0.03, b, WHITE, TL.darkwood);
      // en dessous : la bordure du trou dans le plafond
      E.bx(s * (w / 2 + 0.03), -ep - 0.06, 0, 0.06, 0.06, d + 0.12, WHITE, TL.darkwood);
      E.bx(0, -ep - 0.06, s * (d / 2 + 0.03), w + 0.12, 0.06, 0.06, WHITE, TL.darkwood);
    }
    // le battant (bloc) est relevé contre le bord -x : deux gonds de fer, un anneau qui pend
    for (const z of [-d * 0.3, d * 0.3]) E.bx(-w / 2 - 0.05, 0.0, z, 0.06, 0.32, 0.07, B1C.fer, TL.iron);
    E.box(-w / 2 + 0.02, 0.62, 0, 0.02, 0.12, 0.12, B1C.fer, TL.iron);
  },
  // râtelier d'armes : piques et hallebardes debout, un baudrier pendu
  b1_ratelier(E) {
    E.bx(0, 0, -0.08, 1.4, 0.12, 0.3, WHITE, TL.darkwood);
    E.bx(0, 1.25, -0.12, 1.4, 0.08, 0.16, WHITE, TL.darkwood);
    for (const s of [-0.68, 0.68]) E.bx(s, 0, -0.12, 0.08, 1.4, 0.12, WHITE, TL.darkwood);
    for (let i = 0; i < 5; i++) {
      const x = -0.5 + i * 0.25, h = 2.2 + (i % 2) * 0.25;
      E.bx(x, 0.1, -0.08, 0.04, h, 0.04, WHITE, TL.wood);
      if (i % 2) { E.bx(x, 0.1 + h, -0.08, 0.025, 0.28, 0.025, B1C.fer, TL.iron); E.box(x + 0.07, h - 0.02, -0.08, 0.14, 0.18, 0.015, B1C.fer, TL.iron); }
      else E.box(x, 0.1 + h + 0.1, -0.08, 0.05, 0.22, 0.02, B1C.fer, TL.iron, 0, 0, 0);
    }
    E.box(0.45, 0.8, 0.0, 0.08, 0.7, 0.03, rgbf('#5a3a22'), TL.leather, 0, 0, 0.25);
  },
  // métier à tisser : le bâti, l'ensouple, la chaîne tendue, le battant ; sur le rouleau, un drap où court une bande
  // d'une couleur que personne n'a teinte (o.data.bande)
  b1_metier(E, o) {
    const band = (o.data && o.data.bande) || '#5a1a24';
    for (const [x, z] of [[-0.75, -0.55], [0.75, -0.55], [-0.75, 0.55], [0.75, 0.55]]) E.bx(x, 0, z, 0.1, 1.5, 0.1, WHITE, TL.darkwood);
    for (const z of [-0.55, 0.55]) E.bx(0, 1.45, z, 1.6, 0.1, 0.1, WHITE, TL.darkwood);
    E.box(0, 0.75, 0.62, 1.5, 0.14, 0.14, WHITE, TL.wood);                 // l'ensouple de devant (le drap s'enroule)
    E.box(0, 0.75, 0.62, 1.42, 0.2, 0.2, rgbf('#d8ccb4'), TL.cloth);
    E.box(0, 0.76, 0.62, 1.43, 0.21, 0.06, rgbf(band), TL.cloth);
    E.box(0, 0.9, -0.62, 1.5, 0.14, 0.14, WHITE, TL.wood);                 // l'ensouple de derrière
    for (let i = 0; i < 14; i++) E.box(-0.65 + i * 0.1, 0.84, 0, 0.012, 0.012, 1.22, rgbf('#e8e0cc'), TL.plain, 0, -0.06);
    E.box(0, 1.1, 0.25, 1.5, 0.5, 0.05, WHITE, TL.wood);                    // le battant
    E.box(0, 0.8, 0.4, 1.45, 0.05, 0.3, rgbf('#d8ccb4'), TL.cloth);
    E.bx(0, 0, -0.95, 0.9, 0.45, 0.32, WHITE, TL.darkwood);                // le banc du tisserand
  },
  // un rouet
  b1_rouet(E) {
    E.bx(0, 0, 0, 0.8, 0.08, 0.26, WHITE, TL.darkwood);
    for (const [x, z] of [[-0.32, -0.08], [0.32, -0.08], [0, 0.1]]) E.bx(x, -0.0, z, 0.05, 0.4, 0.05, WHITE, TL.darkwood);
    E.box(-0.12, 0.72, 0, 0.6, 0.6, 0.04, WHITE, TL.wood); E.box(-0.12, 0.72, 0, 0.6, 0.6, 0.04, WHITE, TL.wood, 0, 0, Math.PI / 4);
    E.box(-0.12, 0.72, 0, 0.1, 0.1, 0.08, WHITE, TL.darkwood);
    for (const s of [-0.03, 0.03]) E.bx(-0.12 + s * 0, 0.08, s, 0.04, 0.35, 0.03, WHITE, TL.darkwood);
    E.bx(0.3, 0.4, 0, 0.06, 0.3, 0.06, WHITE, TL.darkwood); E.box(0.3, 0.75, 0, 0.12, 0.1, 0.1, rgbf('#e8e0cc'), TL.wool);
  },
  // un meuble sous son drap (le garde-meuble) : o.data.f = armoire | horloge | fauteuil | commode | lit | tableau | chaises
  b1_toile(E, o) {
    const f = (o.data && o.data.f) || 'commode', c = B1C.drap, c2 = B1C.drapOmbre, T = TL.cloth;
    if (f === 'armoire') { E.bx(0, 0, 0, 1.24, 1.98, 0.6, c, T); E.bx(0, 1.98, 0, 1.3, 0.05, 0.64, c2, T); E.box(0.3, 0.06, 0.32, 0.5, 0.12, 0.08, c2, T, 0.3); }
    else if (f === 'horloge') { E.bx(0, 0, 0, 0.5, 2.1, 0.34, c, T); E.bx(0, 1.55, 0, 0.6, 0.5, 0.4, c2, T); E.bx(0, 2.05, 0, 0.42, 0.14, 0.3, c, T); }
    else if (f === 'fauteuil') { E.bx(0, 0, 0, 0.78, 0.48, 0.74, c, T); E.bx(0, 0.4, -0.3, 0.8, 0.62, 0.2, c2, T, 0, -0.1); for (const s of [-0.38, 0.38]) E.bx(s, 0.4, 0.02, 0.14, 0.24, 0.68, c, T); }
    else if (f === 'lit') { E.bx(0, 0, 0, 1.15, 0.5, 2.1, c, T); E.bx(0, 0, -1.05, 1.2, 1.05, 0.1, c2, T); E.box(0.45, 0.25, 0.6, 0.3, 0.5, 0.9, c2, T, 0.2); }
    else if (f === 'tableau') { E.box(0, 0.62, 0, 0.9, 1.2, 0.12, c, T, 0, -0.18); E.box(0, 0.05, 0.12, 0.92, 0.1, 0.18, c2, T); }
    else if (f === 'chaises') { for (let i = 0; i < 3; i++) { E.bx(0, i * 0.47, 0, 0.5, 0.45, 0.5, i % 2 ? c2 : c, T, i * 0.3); } E.bx(0, 1.38, -0.22, 0.5, 0.5, 0.08, c, T, 0.6); }
    else { E.bx(0, 0, 0, 1.1, 0.98, 0.55, c, T); E.bx(0, 0.98, 0, 1.14, 0.05, 0.58, c2, T); E.box(-0.4, 0.06, 0.29, 0.3, 0.12, 0.06, c2, T, -0.2); }
  },
  // la plaque d'une chambre : émail clair, numéro peint (o.data.n)
  b1_plaque(E, o) {
    const n = String((o.data && o.data.n) || 0);
    E.bx(0, 0, 0, 0.22, 0.17, 0.015, rgbf('#e8e2d0'), TL.plain);
    E.bx(0, -0.008, -0.004, 0.24, 0.186, 0.01, rgbf('#2a3a5a'), TL.plain);
    const px = 0.024, W0 = n.length * 4 - 1;
    for (let k = 0; k < n.length; k++) {
      const G = B1_CHIFFRES[n[k]] || B1_CHIFFRES[0];
      for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) if (G[r][c] === '1') E.bx((k * 4 + c - (W0 - 1) / 2) * px, 0.025 + (4 - r) * px, 0.009, px, px, 0.004, rgbf('#22304e'), TL.plain);
    }
  },
  // le bocal (verre épais, bouchon de cire ; dedans, une forme pâle qui flotte)
  b1_bocal(E) {
    E.bx(0, 0, 0, 0.3, 0.02, 0.3, rgbf('#6a6a5a'), TL.glass);
    E.bx(0, 0.06, 0, 0.12, 0.2, 0.1, rgbf('#d8d0c0'), TL.skin);
    E.bx(0.02, 0.24, 0.01, 0.08, 0.08, 0.08, rgbf('#cfc6b4'), TL.skin);
    E.bx(0, 0.02, 0, 0.3, 0.4, 0.3, rgbf('#8ab0a0'), TL.glass);
    E.bx(0, 0.42, 0, 0.22, 0.06, 0.22, rgbf('#8a2a20'), TL.plain);
  },
  // lampe à huile (o.data.lit : allumée — la nuit seulement, voir PROP_LIGHTS)
  b1_lampe(E, o, t) {
    E.bx(0, 0, 0, 0.16, 0.04, 0.16, B1C.laiton, TL.gold);
    E.bx(0, 0.04, 0, 0.12, 0.12, 0.12, B1C.laiton, TL.metal);
    const nuit = t && t.night;
    E.fl = nuit ? FX_EMIT : 0;
    E.bx(0, 0.16, 0, 0.09, 0.2, 0.09, nuit ? [1.25, 1.0, 0.68] : [0.75, 0.72, 0.66], TL.glass);
    E.fl = 0;
    E.bx(0, 0.36, 0, 0.05, 0.02, 0.05, B1C.fer, TL.iron);
  },
  // patère et manteau pendu (o.data.col)
  b1_patere(E, o) {
    const c = rgbf((o.data && o.data.col) || '#3a3430');
    E.bx(0, 1.62, -0.03, 0.5, 0.06, 0.04, WHITE, TL.darkwood);
    E.bx(-0.1, 1.58, 0.0, 0.03, 0.06, 0.06, B1C.fer, TL.iron);
    E.box(-0.1, 1.12, 0.06, 0.42, 0.92, 0.12, c, TL.coat);
    E.box(-0.1, 1.54, 0.05, 0.2, 0.1, 0.1, c, TL.coat);
    if (o.data && o.data.chapeau) { E.bx(0.14, 1.62, 0.05, 0.26, 0.03, 0.26, rgbf('#2a2622'), TL.cloth); E.bx(0.14, 1.65, 0.05, 0.16, 0.12, 0.16, rgbf('#2a2622'), TL.cloth); }
  },
  // un bol (o.data.c : lait, soupe, vide)
  b1_bol(E, o) {
    const c = o.data && o.data.c;
    E.bx(0, 0, 0, 0.16, 0.06, 0.16, rgbf('#e8e0cc'), TL.plain);
    if (c && c !== 'vide') E.bx(0, 0.045, 0, 0.13, 0.015, 0.13, c === 'lait' ? B1C.lait : B1C.soupe, TL.plain);
    if (c === 'soupe') E.box(0.1, 0.07, 0.02, 0.16, 0.012, 0.025, rgbf('#a8a8b0'), TL.metal, 0.3);
  },
  // un globe sur son pied
  b1_globe(E) {
    E.bx(0, 0, 0, 0.3, 0.05, 0.3, WHITE, TL.darkwood);
    E.bx(0, 0.05, 0, 0.05, 0.75, 0.05, WHITE, TL.darkwood);
    E.box(0, 1.02, 0, 0.44, 0.44, 0.44, rgbf('#c8b888'), TL.paper, 0.4, 0.4);
    E.box(0, 1.02, 0, 0.46, 0.05, 0.46, rgbf('#8a6a3a'), TL.wood, 0.4, 0.4);
    E.box(0.04, 1.1, 0.05, 0.2, 0.14, 0.4, rgbf('#7a8a5a'), TL.plain, 0.4, 0.4);
  },
  // une carte pendue au mur (vue de face : +z) — des rivages, des routes, un blanc au milieu
  b1_carte_murale(E) {
    E.box(0, 0, 0, 1.0, 0.75, 0.02, rgbf('#e0d4b0'), TL.paper);
    E.box(0, 0.4, 0.01, 1.08, 0.05, 0.03, WHITE, TL.darkwood); E.box(0, -0.4, 0.01, 1.08, 0.05, 0.03, WHITE, TL.darkwood);
    for (const [x, y, sx, sy, r] of [[-0.25, 0.1, 0.4, 0.015, 0.4], [0.1, -0.12, 0.5, 0.015, -0.2], [0.3, 0.15, 0.3, 0.015, 1.1], [-0.3, -0.2, 0.25, 0.015, -0.8]]) E.box(x, y, 0.014, sx, sy, 0.004, rgbf('#7a5a3a'), TL.plain, 0, 0, r);
    E.box(0.22, -0.05, 0.014, 0.22, 0.16, 0.004, rgbf('#7a9ab0'), TL.plain, 0, 0, 0.3);
    E.box(-0.05, 0.02, 0.016, 0.18, 0.14, 0.004, rgbf('#f2ead2'), TL.plain);
  },
  // lutrin, un registre ouvert
  b1_lutrin(E) {
    E.bx(0, 0, 0, 0.4, 0.06, 0.4, WHITE, TL.darkwood);
    E.bx(0, 0.06, 0, 0.08, 1.0, 0.08, WHITE, TL.darkwood);
    E.box(0, 1.1, 0.02, 0.6, 0.04, 0.42, WHITE, TL.wood, 0, -0.45);
    E.box(-0.13, 1.14, 0.03, 0.26, 0.02, 0.36, rgbf('#ece4cc'), TL.paper, 0, -0.45, 0.06);
    E.box(0.13, 1.14, 0.03, 0.26, 0.02, 0.36, rgbf('#ece4cc'), TL.paper, 0, -0.45, -0.06);
    E.box(0, 1.12, 0.03, 0.56, 0.02, 0.4, rgbf('#3a2420'), TL.leather, 0, -0.45);
  },
  // rouleaux de drap sur une table basse (o.data.c : leurs couleurs)
  b1_rouleaux(E, o) {
    const C = (o.data && o.data.c) || ['#c8b898', '#6a7a9a', '#9a4a3a', '#e0dac8'];
    E.bx(0, 0, 0, 1.2, 0.5, 0.6, WHITE, TL.darkwood);
    C.forEach((h, i) => E.box(-0.4 + i * 0.27, 0.62, 0, 0.24, 0.24, 0.58, rgbf(h), TL.cloth, 0, 0, 0));
    E.box(0.1, 0.86, 0.02, 0.24, 0.24, 0.56, rgbf(C[0]), TL.cloth);
  },
  // petit poêle de fonte, sa bouilloire (la postière ouvre les enveloppes à la vapeur)
  b1_poele(E) {
    E.bx(0, 0, 0, 0.5, 0.6, 0.5, B1C.fer, TL.iron);
    E.bx(0, 0.6, 0, 0.54, 0.05, 0.54, B1C.fer, TL.iron);
    E.bx(0.1, 0.65, -0.12, 0.12, 1.6, 0.12, B1C.fer, TL.iron);
    E.bx(-0.08, 0.65, 0.08, 0.22, 0.18, 0.2, rgbf('#6a6a72'), TL.metal); E.box(0.06, 0.8, 0.12, 0.12, 0.03, 0.03, rgbf('#6a6a72'), TL.metal, -0.5);
    E.bx(0, 0.2, 0.25, 0.26, 0.16, 0.02, [0.06, 0.05, 0.05], TL.plain);
  },
  // vase de lilas séchés
  b1_lilas(E) {
    E.bx(0, 0, 0, 0.16, 0.26, 0.16, rgbf('#5a6a7a'), TL.glass);
    for (const [x, z, h] of [[0, 0, 0.5], [0.06, 0.04, 0.42], [-0.06, 0.02, 0.46], [0.02, -0.06, 0.38]]) { E.bx(x, 0.24, z, 0.015, h, 0.015, rgbf('#5a5a3a'), TL.plain); E.bx(x, 0.18 + h, z, 0.1, 0.12, 0.1, B1C.lilasSec, TL.flowers); }
  },
  // une paire de souliers (o.data.col), pointes devant
  b1_souliers(E, o) {
    const c = rgbf((o.data && o.data.col) || '#2a2420');
    for (const s of [-0.08, 0.08]) { E.bx(s, 0, 0.03, 0.09, 0.08, 0.26, c, TL.leather); E.bx(s, 0, -0.08, 0.09, 0.14, 0.09, c, TL.leather); }
  },
  // des jouets : un cheval de bois, des cubes, une toupie
  b1_jouets(E) {
    E.bx(-0.2, 0, 0, 0.3, 0.02, 0.1, WHITE, TL.wood);
    E.bx(-0.2, 0.02, 0, 0.26, 0.1, 0.08, rgbf('#a86a3a'), TL.wood); E.bx(-0.06, 0.1, 0, 0.08, 0.14, 0.07, rgbf('#a86a3a'), TL.wood);
    for (const [x, z, c] of [[0.12, 0.08, '#c83a30'], [0.2, -0.04, '#3a6ab0'], [0.15, 0.02, '#e0c040']]) E.bx(x, 0, z, 0.07, 0.07, 0.07, rgbf(c), TL.wood, x * 3);
    E.bx(0.16, 0.07, 0.04, 0.06, 0.06, 0.06, rgbf('#40a060'), TL.wood, 0.5);
    E.box(0.32, 0.04, 0.12, 0.08, 0.06, 0.08, rgbf('#8a4aa0'), TL.wood, 0.3);
  },
  // un bougeoir de fer et sa chandelle (o.data.lit : allumée)
  b1_chandelle(E, o, t) {
    E.bx(0, 0, 0, 0.14, 0.02, 0.14, B1C.fer, TL.iron); E.bx(0, 0.02, 0, 0.03, 0.12, 0.03, B1C.fer, TL.iron); E.bx(0, 0.13, 0, 0.07, 0.02, 0.07, B1C.fer, TL.iron);
    E.bx(0, 0.15, 0, 0.045, 0.16, 0.045, [0.95, 0.92, 0.85], TL.plain);
    if (o.data && o.data.lit) { E.fl = FX_EMIT; E.bx(0, 0.31, 0, 0.028, 0.05 + (t ? Math.sin(t.t * 17 + o.x) * 0.008 : 0), 0.028, [1.5, 1.1, 0.5], TL.flame); E.fl = 0; }
  },
  // la table de toilette : un broc, une cuvette, une serviette
  b1_toilette(E) {
    for (const [x, z] of [[-0.3, -0.18], [0.3, -0.18], [-0.3, 0.18], [0.3, 0.18]]) E.bx(x, 0, z, 0.05, 0.75, 0.05, WHITE, TL.darkwood);
    E.bx(0, 0.75, 0, 0.7, 0.05, 0.44, WHITE, TL.wood);
    E.bx(0, 0.8, 0, 0.36, 0.08, 0.3, rgbf('#e8e4dc'), TL.plain); E.bx(0, 0.82, 0, 0.3, 0.05, 0.24, rgbf('#9ab0b8'), TL.plain);
    E.bx(0.24, 0.8, -0.08, 0.1, 0.24, 0.1, rgbf('#e8e4dc'), TL.plain);
    E.bx(-0.36, 0.45, 0, 0.02, 0.32, 0.3, rgbf('#e8e0d0'), TL.cloth);
  },
  // un dessin d'enfant punaisé au mur (vu de face : +z) ; o.data.v : 0 un monsieur bleu derrière une fenêtre, 1 une maison
  // et quelqu'un sous la terre, 2 deux fillettes près d'un puits
  b1_dessin(E, o) {
    const v = (o.data && o.data.v) | 0, P = (x, y, sx, sy, c, r) => E.box(x, y, 0.012, sx, sy, 0.004, rgbf(c), TL.plain, 0, 0, r || 0);
    E.box(0, 0, 0, 0.42, 0.32, 0.01, rgbf('#ece4cc'), TL.paper);
    E.box(0, 0.15, 0.008, 0.02, 0.02, 0.01, rgbf('#8a8a92'), TL.iron);
    if (v === 0) { P(-0.08, 0, 0.16, 0.2, '#6a5a3a'); P(-0.08, 0, 0.13, 0.17, '#e8e0c8'); P(-0.08, 0.02, 0.05, 0.11, '#2a4ab0'); P(-0.08, 0.09, 0.04, 0.04, '#2a4ab0'); P(0.12, -0.05, 0.03, 0.09, '#c83a30'); P(0.12, 0.01, 0.03, 0.03, '#e8b890'); }
    else if (v === 1) { P(-0.06, 0.04, 0.16, 0.12, '#a85a3a'); P(-0.06, 0.12, 0.18, 0.04, '#6a3a2a', 0.0); P(0, -0.06, 0.38, 0.012, '#3a2a1a'); P(0.02, -0.11, 0.12, 0.03, '#5a4a3a'); P(0.12, -0.04, 0.02, 0.05, '#2a2a2a', 0.5); P(0.15, 0.0, 0.02, 0.04, '#2a2a2a', 0.3); }
    else { P(0, -0.06, 0.12, 0.06, '#8a8a8a'); P(-0.11, 0.0, 0.04, 0.12, '#e070a0'); P(-0.11, 0.08, 0.04, 0.04, '#f0d040'); P(0.11, 0.0, 0.04, 0.12, '#3a7ad0'); P(0.11, 0.08, 0.04, 0.04, '#3a7ad0'); }
  },
  // un berceau à bascule (vide)
  b1_berceau(E) {
    for (const s of [-0.42, 0.42]) E.box(0, 0.06, s * 0.7, 0.62, 0.06, 0.06, WHITE, TL.darkwood, 0, 0, 0);
    for (const s of [-0.3, 0.3]) E.bx(0, 0.06, s, 0.1, 0.12, 0.06, WHITE, TL.darkwood);
    E.bx(0, 0.18, 0, 0.5, 0.36, 0.86, WHITE, TL.wood);
    E.bx(0, 0.3, 0, 0.44, 0.22, 0.8, rgbf('#e8e0d0'), TL.blanket);
    E.bx(0, 0.18, -0.42, 0.54, 0.62, 0.05, WHITE, TL.darkwood);
  },
});
Object.assign(PROP_COLL, {
  b1_tremie: null, b1_ratelier: [0.7, 0.18, 1.6], b1_metier: [0.82, 0.62, 1.5], b1_rouet: [0.42, 0.18, 1.0], b1_plaque: null, b1_bocal: null, b1_lampe: null,
  b1_patere: null, b1_bol: null, b1_globe: [0.25, 0.25, 1.3], b1_carte_murale: null, b1_lutrin: [0.25, 0.25, 1.2], b1_rouleaux: [0.62, 0.32, 0.9],
  b1_poele: [0.27, 0.27, 0.9], b1_lilas: null, b1_souliers: null, b1_jouets: null, b1_berceau: [0.3, 0.46, 0.6], b1_chandelle: null, b1_toilette: [0.36, 0.23, 0.85], b1_dessin: null,
});
Object.assign(PROP_LIGHTS, { b1_lampe: { c: [1.0, 0.74, 0.42], r: 5.5, y: 0.3, night: true }, b1_chandelle: { c: [1.0, 0.7, 0.35], r: 4.5, y: 0.33, flicker: true, lit: true } });
// (la chandelle vacille : elle est redessinée à chaque image, voir DYN_PROPS dans 11-zzzzB1-ville.js)
// (un meuble sous son drap : la place qu'il prend, selon sa forme)
const B1_TOILE_COLL = { armoire: [0.62, 0.3, 2.0], horloge: [0.3, 0.2, 2.1], fauteuil: [0.4, 0.37, 1.0], commode: [0.56, 0.28, 1.0], lit: [0.58, 1.05, 1.0], tableau: [0.46, 0.15, 1.2], chaises: [0.26, 0.26, 1.8] };
