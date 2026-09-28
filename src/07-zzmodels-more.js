// ============================================================================
//  MODÈLES 3D EN PLUS : panneaux, calvaires, pierres des Anciens, dolmen,
//  éboulis et grottes, trous de pelle, alambic, objets de piété… et les bêtes
// ============================================================================
const PC3 = { wood: rgbf('#9a7650'), dwood: rgbf('#5a4028'), stone: rgbf('#a8a498'), moss: rgbf('#8a9478'), iron: rgbf('#50535a'), paper: rgbf('#e2d4ac'),
  copper: rgbf('#c8743a'), dirt: rgbf('#6a4a30'), dark: [0.05, 0.04, 0.04], bone: rgbf('#e8e0cc'), red: rgbf('#a8322a') };

Object.assign(PROP_MODELS, {
  // poteau indicateur (généré) : une flèche par destination, dans la bonne direction
  poteau_dir(E, o) {
    E.bx(0, 0, 0, 0.12, 2.5, 0.12, PC3.dwood, TL.darkwood);
    E.bx(0, 2.5, 0, 0.18, 0.08, 0.18, PC3.dwood, TL.darkwood);
    const dirs = (o.data && o.data.dirs) || [0.4, 2.2];
    dirs.forEach((a, i) => {
      const ry = a - o.r, y = 2.2 - i * 0.3;
      const cx = Math.sin(ry) * 0.48, cz = Math.cos(ry) * 0.48;
      E.box(cx, y, cz, 0.05, 0.2, 0.86, [0.95, 0.9, 0.8], TL.sign, ry);
      E.box(Math.sin(ry) * 0.95, y, Math.cos(ry) * 0.95, 0.05, 0.13, 0.13, [0.95, 0.9, 0.8], TL.sign, ry + Math.PI / 4, 0, 0);
    });
  },
  // panneau-carte : deux poteaux, un petit toit, une carte peinte
  panneau_carte(E, o) {
    const old = o.data && o.data.old;
    for (const s of [-0.85, 0.85]) E.bx(s, 0, 0, 0.12, 2.1, 0.12, PC3.dwood, TL.darkwood);
    E.bx(0, 0.75, 0, 1.9, 1.25, 0.08, PC3.dwood, TL.darkwood);
    E.bx(0, 0.82, 0.045, 1.72, 1.1, 0.02, old ? [0.78, 0.72, 0.58] : [0.96, 0.9, 0.74], TL.paper);
    // la carte, peinte grossièrement : lac, forêts, chemins, la ville
    E.bx(-0.45, 1.25, 0.06, 0.42, 0.26, 0.012, rgbf('#5a7ea8'), TL.plain);
    for (const [x, y] of [[0.35, 1.45], [0.55, 1.28], [0.15, 1.1], [-0.6, 0.95]]) E.bx(x, y, 0.06, 0.18, 0.14, 0.012, rgbf('#4a7a3a'), TL.plain);
    E.bx(0.2, 1.0, 0.062, 0.9, 0.025, 0.01, rgbf('#8a5a2a'), TL.plain, 0, 0, 0.35);
    E.box(-0.1, 1.2, 0.062, 0.7, 0.025, 0.01, rgbf('#8a5a2a'), TL.plain, 0, 0, -0.6);
    E.bx(0.5, 1.55, 0.062, 0.16, 0.16, 0.012, rgbf('#7a6a5a'), TL.plain);
    E.bx(-0.15, 1.02, 0.064, 0.05, 0.05, 0.01, [0.8, 0.12, 0.08], TL.plain);
    E.box(0, 2.18, 0, 2.2, 0.08, 0.55, PC3.dwood, TL.darkwood, 0, 0.25);
  },
  // calvaire : socle de pierre, croix (bois ou fer selon la variante)
  calvaire(E, o) {
    const v = (o.data && o.data.v) || 0;
    E.bx(0, 0, 0, 1.3, 0.3, 1.3, PC3.stone, mt(M_STONE));
    E.bx(0, 0.3, 0, 0.9, 0.35, 0.9, PC3.stone, mt(M_STONE));
    E.bx(0, 0.65, 0, 0.45, 0.7, 0.45, PC3.stone, mt(M_STONE));
    const c = v % 2 ? PC3.iron : PC3.dwood, tex = v % 2 ? TL.iron : TL.darkwood;
    E.bx(0, 1.35, 0, 0.14, 2.3, 0.14, c, tex);
    E.bx(0, 2.85, 0, 0.9, 0.14, 0.14, c, tex);
    if (o.data && o.data.fleurs) { E.bx(0.3, 0.65, 0.3, 0.14, 0.1, 0.14, rgbf('#c04040'), TL.flowers); E.bx(-0.25, 0.65, 0.32, 0.12, 0.08, 0.12, rgbf('#e0d040'), TL.flowers); }
  },
  // pierre plate aux offrandes (Mère des Moissons) : ce qu'on y a déposé reste visible
  pierre_offrandes(E, o) {
    E.bx(-0.45, 0, 0, 0.35, 0.45, 0.5, PC3.moss, mt(M_MOSSY)); E.bx(0.45, 0, 0, 0.35, 0.45, 0.5, PC3.moss, mt(M_MOSSY));
    E.bx(0, 0.45, 0, 1.5, 0.16, 0.8, PC3.stone, mt(M_ROCK));
    E.bx(0, 0.61, 0, 0.3, 0.02, 0.3, rgbf('#6a5a3a'), TL.plain, 0.4);
    const off = o.data && o.data.offer;
    if (off) { E.bx(0.35, 0.61, 0.1, 0.22, 0.14, 0.18, [1, 1, 1], ITEMS[off] && ITEMS[off].cat === 'culture' ? TL.cabbage : TL.flowers); E.bx(-0.3, 0.61, -0.1, 0.16, 0.1, 0.16, rgbf('#d8b860'), TL.straw); }
  },
  // pierre de la Dame : rocher, silhouette voilée sculptée
  pierre_dame(E, o) {
    E.bx(0, 0, 0, 1.4, 0.7, 1.1, PC3.moss, mt(M_MOSSY));
    E.bx(0, 0.7, 0, 0.5, 1.1, 0.34, [0.86, 0.87, 0.84], TL.stone);
    E.bx(0, 1.8, 0, 0.3, 0.34, 0.28, [0.88, 0.89, 0.86], TL.stone);
    E.bx(0, 1.72, -0.02, 0.42, 0.5, 0.36, [0.8, 0.82, 0.8], TL.stone);
    E.bx(0, 1.2, 0.18, 0.3, 0.12, 0.06, [0.86, 0.87, 0.84], TL.stone);
    if (o.data && o.data.offer) E.bx(0.35, 0.7, 0.35, 0.2, 0.08, 0.2, rgbf('#e0e0f0'), TL.flowers);
  },
  // pierre du Cerf : menhir blanc, bois de cerf gravés en relief
  pierre_cerf(E) {
    E.bx(0, -0.2, 0, 0.9, 2.6, 0.55, [1.15, 1.15, 1.1], TL.stone);
    E.bx(0, 1.25, 0.29, 0.3, 0.34, 0.04, [0.75, 0.74, 0.7], TL.stone);
    for (const s of [-1, 1]) { E.box(s * 0.16, 1.7, 0.29, 0.05, 0.5, 0.04, [0.75, 0.74, 0.7], TL.stone, 0, 0, s * 0.45); E.box(s * 0.3, 1.9, 0.29, 0.04, 0.26, 0.04, [0.75, 0.74, 0.7], TL.stone, 0, 0, -s * 0.3); }
  },
  // borne gravée de Valmont : la flèche du dessus montre le trésor
  borne(E, o) {
    E.bx(0, 0, 0, 0.42, 0.85, 0.3, PC3.stone, mt(M_STONE));
    E.bx(0, 0.85, 0, 0.42, 0.12, 0.3, PC3.stone, mt(M_STONE), 0, 0, 0);
    const a = ((o.data && o.data.dir) || 0) - o.r;
    E.box(Math.sin(a) * 0.03, 0.98, Math.cos(a) * 0.03, 0.05, 0.02, 0.24, [0.3, 0.28, 0.26], TL.plain, a);
    E.box(Math.sin(a) * 0.12, 0.98, Math.cos(a) * 0.12, 0.1, 0.02, 0.1, [0.3, 0.28, 0.26], TL.plain, a + Math.PI / 4);
  },
  // dolmen : deux orthostats et une table
  dolmen(E) {
    E.bx(-1.1, -0.2, 0, 0.5, 1.6, 1.7, PC3.moss, mt(M_MOSSY), 0.05);
    E.bx(1.1, -0.2, 0.1, 0.55, 1.5, 1.6, PC3.moss, mt(M_MOSSY), -0.08);
    E.bx(0, -0.2, -0.75, 1.6, 1.3, 0.4, PC3.moss, mt(M_MOSSY));
    E.box(0.05, 1.5, 0, 3.4, 0.45, 2.3, PC3.stone, mt(M_ROCK), 0.1, 0.04, 0.03);
    E.bx(0, 0, 0.4, 0.9, 0.08, 0.6, [0.3, 0.1, 0.08], TL.plain);
  },
  // éboulis qui bouche une grotte (rétrécit à mesure qu'on creuse)
  eboulis(E, o) {
    const p = Math.min(5, (o.data && o.data.p) || 0), k = 1 - p * 0.16;
    const R = [[0, 0, 0, 1.6, 1.3, 1.2], [-0.9, 0, 0.3, 1.0, 0.9, 0.9], [0.9, 0, 0.2, 1.1, 1.0, 1.0], [0.2, 1.1, -0.1, 1.0, 0.8, 0.8], [-0.4, 0, 0.9, 0.7, 0.5, 0.6], [0.6, 0, 0.9, 0.6, 0.45, 0.5]];
    R.forEach(([x, y, z, sx, sy, sz], i) => { if (i > 5 - p) return; E.box(x * k, (y + sy / 2) * k, z, sx * k, sy * k, sz * k, PC3.stone, mt(M_ROCK), i * 0.7, (i % 2) * 0.2); });
    E.bx(0, 0, 0.3, 2.2 * k, 0.18, 1.4, PC3.dirt, TL.soil);
  },
  // entrée de grotte dégagée : un trou noir encadré de rochers
  entree_grotte(E) {
    E.bx(0, 0, -0.3, 1.5, 1.9, 0.2, PC3.dark, mt(M_DARK));
    E.bx(-1.0, 0, 0, 0.6, 2.2, 0.9, PC3.stone, mt(M_ROCK), 0.2); E.bx(1.0, 0, 0, 0.6, 2.1, 0.9, PC3.stone, mt(M_ROCK), -0.2);
    E.box(0, 2.1, 0, 2.6, 0.6, 1.0, PC3.stone, mt(M_ROCK), 0.05, 0.1);
    E.bx(0, 0, 0.4, 1.4, 0.06, 1.2, PC3.dirt, TL.soil);
  },
  // trou creusé à la pelle
  trou(E, o) {
    E.bx(0, -0.02, 0, 0.8, 0.05, 0.8, [0.12, 0.08, 0.05], TL.soil);
    for (let k = 0; k < 5; k++) { const a = k / 5 * TAU + (o.x % 1); E.box(Math.cos(a) * 0.55, 0.06, Math.sin(a) * 0.55, 0.28, 0.14, 0.22, PC3.dirt, TL.soil, a); }
  },
  // alambic : chaudron de cuivre, col de cygne, serpentin, fiole
  alambic(E, o, T) {
    E.bx(0, 0, 0, 0.7, 0.3, 0.7, PC3.stone, mt(M_STONE));
    E.bx(0, 0.3, 0, 0.62, 0.42, 0.62, PC3.copper, TL.gold);
    E.bx(0, 0.72, 0, 0.44, 0.14, 0.44, PC3.copper, TL.gold);
    E.bx(0, 0.86, 0, 0.14, 0.3, 0.14, PC3.copper, TL.gold);
    E.box(0.28, 1.12, 0, 0.64, 0.07, 0.07, PC3.copper, TL.gold, 0, 0, -0.5);
    E.bx(0.62, 0.3, 0, 0.26, 0.5, 0.26, rgbf('#8a6a44'), TL.barrel);
    E.bx(0.62, 0.15, 0.3, 0.1, 0.16, 0.1, [0.75, 0.9, 1.0], TL.glass);
    if (o.data && o.data.brew) { E.fl = FX_EMIT; E.bx(0, 0.02, 0.36, 0.3, 0.12, 0.05, [1.4, 0.7, 0.3], TL.flame); E.fl = 0; }
  },
  // coin de prière : petite étagère, croix, bougies, fleurs
  autel_maison(E, o, T) {
    E.bx(0, 0, 0, 0.9, 0.75, 0.45, PC3.wood, TL.wood);
    E.bx(0, 0.75, 0, 1.0, 0.06, 0.52, PC3.dwood, TL.darkwood);
    E.bx(0, 0.81, -0.12, 0.06, 0.5, 0.06, rgbf('#c8a040'), TL.gold); E.bx(0, 1.08, -0.12, 0.26, 0.06, 0.06, rgbf('#c8a040'), TL.gold);
    for (const s of [-0.3, 0.3]) { E.bx(s, 0.81, 0.08, 0.05, 0.14, 0.05, [0.95, 0.92, 0.85], TL.plain); E.fl = FX_EMIT; E.bx(s, 0.95, 0.08, 0.03, 0.05, 0.03, [1.5, 1.1, 0.5], TL.flame); E.fl = 0; }
    E.bx(0.15, 0.81, 0.12, 0.12, 0.14, 0.12, rgbf('#d85050'), TL.flowers);
  },
  croix_bois(E) { E.bx(0, 0, 0, 0.12, 1.7, 0.12, PC3.dwood, TL.darkwood); E.bx(0, 1.15, 0, 0.8, 0.12, 0.12, PC3.dwood, TL.darkwood); E.bx(0, 0, 0, 0.5, 0.12, 0.5, PC3.stone, TL.stone); },
  statue_saint(E) {
    E.bx(0, 0, 0, 0.7, 0.5, 0.7, PC3.stone, mt(M_STONE));
    E.bx(0, 0.5, 0, 0.44, 1.2, 0.3, [0.86, 0.85, 0.8], TL.stone);
    E.bx(0, 1.7, 0, 0.24, 0.28, 0.24, [0.88, 0.87, 0.82], TL.stone);
    E.bx(-0.28, 1.05, 0.05, 0.12, 0.5, 0.12, [0.86, 0.85, 0.8], TL.stone, 0, 0.4); E.bx(0.28, 1.05, 0.05, 0.12, 0.5, 0.12, [0.86, 0.85, 0.8], TL.stone, 0, 0.4);
    E.bx(0, 1.98, 0, 0.36, 0.03, 0.36, rgbf('#d0b050'), TL.gold);
  },
  pierre_gravee(E) { E.bx(0, -0.1, 0, 0.7, 1.4, 0.4, PC3.moss, mt(M_MOSSY)); for (const [y, s] of [[0.5, 0.3], [0.8, 0.2], [1.05, 0.35]]) E.bx(0, y, 0.2, s, 0.03, 0.03, [0.3, 0.3, 0.28], TL.plain); E.bx(0, 0, 0.35, 0.5, 0.04, 0.3, rgbf('#6a5a3a'), TL.plain); },
  clapier(E) {
    E.bx(0, 0, 0, 1.1, 0.45, 0.6, PC3.dwood, TL.darkwood);
    E.bx(0, 0.45, 0, 1.1, 0.5, 0.6, PC3.wood, TL.wood); E.bx(0, 0.5, 0.31, 0.9, 0.38, 0.02, [0.5, 0.5, 0.52], TL.iron);
    E.box(0, 1.0, 0, 1.3, 0.06, 0.8, PC3.dwood, TL.darkwood, 0, 0.12);
  },
  mare(E) { E.bx(0, -0.05, 0, 2.6, 0.12, 2.0, rgbf('#3a6a8a'), mt(M_WATERB)); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; E.box(Math.cos(a) * 1.4, 0.05, Math.sin(a) * 1.1, 0.5, 0.2, 0.35, PC3.stone, mt(M_ROCK), a); } },
  // bénitier de l'église
  benitier(E) { E.bx(0, 0, 0, 0.3, 0.8, 0.3, PC3.stone, mt(M_STONE)); E.bx(0, 0.8, 0, 0.6, 0.16, 0.5, PC3.stone, mt(M_STONE)); E.bx(0, 0.93, 0, 0.44, 0.04, 0.34, rgbf('#9ab8d0'), mt(M_WATERB)); },
  // niche des Frappeurs, au fond de la mine
  niche_frappeurs(E, o) {
    E.bx(0, 0, 0, 1.0, 1.2, 0.4, [0.3, 0.28, 0.26], mt(M_ROCK));
    E.bx(0, 0.35, 0.1, 0.6, 0.5, 0.3, PC3.dark, mt(M_DARK));
    E.bx(0, 0.35, 0.12, 0.5, 0.04, 0.2, PC3.dwood, TL.darkwood);
    if (o.data && o.data.offer) { E.bx(-0.12, 0.39, 0.14, 0.18, 0.1, 0.12, rgbf('#c8a060'), TL.bread); E.bx(0.14, 0.39, 0.14, 0.08, 0.16, 0.08, [0.95, 0.95, 0.92], TL.plain); }
  },
  squelette(E, o) {
    E.box(0, 0.05, 0, 0.3, 0.08, 0.5, PC3.bone, TL.bone); E.bx(0, 0.02, 0.38, 0.2, 0.18, 0.2, PC3.bone, TL.bone);
    for (const s of [-1, 1]) { E.box(s * 0.12, 0.04, -0.45, 0.07, 0.06, 0.62, PC3.bone, TL.bone, s * 0.15); E.box(s * 0.3, 0.04, 0.12, 0.06, 0.05, 0.5, PC3.bone, TL.bone, s * 0.6); }
    if (o.data && o.data.arme) E.box(0.45, 0.04, 0.1, 0.05, 0.05, 1.2, PC3.dwood, TL.darkwood, 0.8);
  },
  // peinture pariétale : un panneau sur la paroi, motif selon la variante
  peinture(E, o) {
    const v = (o.data && o.data.v) || 0, red = [0.62, 0.18, 0.1], blk = [0.1, 0.08, 0.07], wht = [0.92, 0.9, 0.84];
    E.bx(0, 0, 0, 2.2, 1.5, 0.05, rgbf('#b8a888'), TL.stone);
    const d = (x, y, sx, sy, c, r) => E.box(x, 0.2 + y, 0.035, sx, sy, 0.01, c, TL.plain, 0, 0, r || 0);
    if (v === 0) { for (let k = 0; k < 13; k++) { const a = k / 13 * TAU; d(Math.cos(a) * 0.6, 0.55 + Math.sin(a) * 0.4, 0.07, 0.18, k === 12 ? red : blk); } }
    else if (v === 1) { d(0, 0.5, 0.6, 0.22, wht); d(0.32, 0.72, 0.16, 0.16, wht); for (const x of [-0.22, -0.1, 0.12, 0.24]) d(x, 0.3, 0.05, 0.25, wht); d(0.28, 0.95, 0.04, 0.3, wht, 0.5); d(0.42, 0.95, 0.04, 0.3, wht, -0.5); }
    else if (v === 2) { d(0.2, 0.55, 0.14, 0.8, wht); d(0.2, 1.02, 0.12, 0.14, wht); for (let k = 0; k < 4; k++) d(-0.5 + k * 0.18, 0.35, 0.06, 0.22, blk); }
    else { d(0, 0.3, 0.8, 0.12, blk); for (let k = 0; k < 5; k++) d(-0.3 + k * 0.15, 0.55 - k * 0.07, 0.06, 0.2, red); }
  },
  stalagmite(E, o) { const h = 0.8 + (o.x * 7 % 1) * 1.2; E.bx(0, 0, 0, 0.5, h * 0.5, 0.5, [0.55, 0.52, 0.5], mt(M_ROCK)); E.bx(0, h * 0.5, 0, 0.3, h * 0.35, 0.3, [0.58, 0.55, 0.52], mt(M_ROCK)); E.bx(0, h * 0.85, 0, 0.14, h * 0.25, 0.14, [0.6, 0.58, 0.55], mt(M_ROCK)); },
  // fleur de lune : ne s'ouvre que la nuit
  fleur_lune(E, o, T) {
    const h = T && T.hour !== undefined ? T.hour : 0, open = h > 20 || h < 5;
    E.bx(0, 0, 0, 0.03, 0.35, 0.03, rgbf('#6a8a6a'), TL.plain);
    if (!open) { E.bx(0, 0.35, 0, 0.07, 0.1, 0.07, rgbf('#8aa08a'), TL.plain); return; }
    E.fl = FX_EMIT;
    for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; E.box(Math.cos(a) * 0.08, 0.38, Math.sin(a) * 0.08, 0.1, 0.02, 0.06, [0.85, 0.95, 1.3], TL.plain, -a); }
    E.bx(0, 0.37, 0, 0.05, 0.04, 0.05, [1.3, 1.25, 0.8], TL.plain);
    E.fl = 0;
  },
  // rubans noués (source aux rubans)
  rubans(E) {
    E.bx(0, 0, 0, 0.1, 2.2, 0.1, PC3.dwood, TL.darkwood); E.bx(0, 2.0, 0, 1.4, 0.07, 0.07, PC3.dwood, TL.darkwood);
    const C = ['#c03030', '#e0c040', '#3a6ac0', '#f0f0f0', '#3a9a4a', '#c060a0'];
    for (let k = 0; k < 8; k++) E.bx(-0.6 + k * 0.17, 1.55 - (k % 3) * 0.12, 0, 0.05, 0.45 + (k % 2) * 0.2, 0.01, rgbf(C[k % C.length]), TL.cloth);
  },
  // champignons en rond (luisent la nuit)
  champi_fees(E, o, T) {
    const h = T && T.hour !== undefined ? T.hour : 12, n = h > 20 || h < 5;
    if (n) E.fl = FX_EMIT;
    for (let k = 0; k < 14; k++) { const a = k / 14 * TAU; E.bx(Math.cos(a) * 2.4, 0, Math.sin(a) * 2.4, 0.05, 0.12, 0.05, [0.9, 0.88, 0.8], TL.plain); E.bx(Math.cos(a) * 2.4, 0.12, Math.sin(a) * 2.4, 0.16, 0.06, 0.16, n ? [0.6, 1.3, 1.1] : rgbf('#c8b8a0'), TL.plain); }
    E.fl = 0;
  },
  // charbonnière : meule de terre fumante
  charbonniere(E) {
    E.bx(0, 0, 0, 2.6, 0.6, 2.6, [0.3, 0.22, 0.16], TL.soil); E.bx(0, 0.6, 0, 1.9, 0.5, 1.9, [0.28, 0.2, 0.14], TL.soil); E.bx(0, 1.1, 0, 1.0, 0.35, 1.0, [0.25, 0.18, 0.12], TL.soil);
    for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; E.box(Math.cos(a) * 1.8, 0.1, Math.sin(a) * 1.8, 0.16, 0.16, 1.1, PC3.dwood, TL.bark, a); }
  },
  // petite tombe de Lise : une croix de bois, une pierre, des fleurs si l'on en a mis
  tombe_lise(E, o) {
    E.bx(0, 0, 0, 0.07, 0.8, 0.07, PC3.dwood, TL.darkwood); E.bx(0, 0.5, 0, 0.4, 0.07, 0.07, PC3.dwood, TL.darkwood);
    E.bx(0, 0, 0.45, 0.4, 0.04, 0.7, PC3.dirt, TL.soil);
    E.bx(0.25, 0, -0.1, 0.22, 0.16, 0.18, PC3.moss, mt(M_MOSSY));
    if (o.data && o.data.fleurs) { E.bx(-0.05, 0.04, 0.45, 0.3, 0.1, 0.3, rgbf('#e8e0f8'), TL.flowers); E.fl = FX_EMIT; E.bx(0.15, 0.04, 0.2, 0.04, 0.1, 0.04, [1.4, 1.1, 0.6], TL.flame); E.fl = 0; }
  },
  // cloche noyée, au fond du lac
  cloche_noyee(E) { E.box(0, 0.5, 0, 1.3, 1.1, 1.3, rgbf('#6a7a5a'), TL.gold, 0.3, 0.4); E.box(0, 1.2, 0.2, 0.7, 0.3, 0.7, rgbf('#6a7a5a'), TL.gold, 0.3, 0.4); },
  // coffre au trésor déterré
  coffre_tresor(E, o) {
    const vide = o.data && o.data.vide;
    E.bx(0, 0, 0, 0.8, 0.45, 0.5, [0.8, 0.72, 0.6], tx(TL.darkwood, TL.chest));
    if (vide) E.box(0, 0.62, -0.25, 0.82, 0.08, 0.52, [0.8, 0.72, 0.6], TL.darkwood, 0, -1.1);
    else { E.bx(0, 0.45, 0, 0.84, 0.12, 0.54, [0.8, 0.72, 0.6], TL.darkwood); E.bx(0, 0.35, 0.26, 0.12, 0.14, 0.03, rgbf('#d0b040'), TL.gold); }
    if (!vide) { E.fl = FX_EMIT; E.bx(0, 0.47, 0, 0.5, 0.02, 0.3, [1.3, 1.1, 0.5], TL.gold); E.fl = 0; }
  },
  // relique posée (à ramasser)
  relique_sol(E, o, T) { const t = T ? T.t : 0; E.fl = FX_EMIT; E.box(0, 0.35 + Math.sin(t * 2) * 0.05, 0, 0.22, 0.22, 0.22, [1.2, 1.1, 0.7], TL.gold, t * 0.8, 0.6); E.fl = 0; E.bx(0, 0, 0, 0.5, 0.12, 0.5, PC3.stone, mt(M_STONE)); },
  // mur de mine fendu (galerie des Frappeurs)
  paroi_fendue(E, o) { if (o.data && o.data.ouvert) return; E.bx(0, 0, 0, 2.4, 2.6, 0.5, [0.35, 0.32, 0.3], mt(M_ROCK)); E.box(0.1, 1.3, 0.26, 0.06, 2.2, 0.02, [0.05, 0.04, 0.04], TL.plain, 0, 0, 0.2); E.box(-0.3, 1.0, 0.26, 0.05, 1.0, 0.02, [0.05, 0.04, 0.04], TL.plain, 0, 0, -0.5); },
});
PROP_COLL.poteau_dir = [0.08, 0.08, 2.5];
PROP_COLL.panneau_carte = [0.95, 0.1, 2.1];
PROP_COLL.calvaire = [0.65, 0.65, 1.3];
PROP_COLL.pierre_offrandes = [0.75, 0.4, 0.6];
PROP_COLL.pierre_dame = [0.7, 0.55, 2.0];
PROP_COLL.pierre_cerf = [0.45, 0.3, 2.4];
PROP_COLL.borne = [0.21, 0.15, 0.9];
PROP_COLL.dolmen = [1.5, 1.0, 1.8];
PROP_COLL.eboulis = [1.3, 0.8, 1.6];
PROP_COLL.alambic = [0.45, 0.4, 1.1];
PROP_COLL.autel_maison = [0.5, 0.25, 0.8];
PROP_COLL.croix_bois = [0.1, 0.1, 1.7];
PROP_COLL.statue_saint = [0.35, 0.35, 2.0];
PROP_COLL.pierre_gravee = [0.35, 0.2, 1.3];
PROP_COLL.clapier = [0.55, 0.3, 1.0];
PROP_COLL.benitier = [0.3, 0.25, 0.95];
PROP_COLL.charbonniere = [1.3, 1.3, 1.2];
PROP_COLL.stalagmite = [0.25, 0.25, 1.5];
PROP_COLL.paroi_fendue = [1.2, 0.25, 2.6];
PROP_LIGHTS.autel_maison = { c: [1.0, 0.72, 0.4], r: 5, y: 1.0, flicker: true };
PROP_LIGHTS.champi_fees = { c: [0.4, 0.95, 0.85], r: 7, y: 0.3, night: true };
PROP_LIGHTS.relique_sol = { c: [1.0, 0.85, 0.5], r: 5, y: 0.4 };

// ---------------------------------------------------------------- bêtes en plus (squelettes en boîtes)
function scaleRig(r, k) { for (const q of r.parts) { q.p = q.p.map((v) => v * k); if (q.s) q.s = q.s.map((v) => v * k); q.o = q.o.map((v) => v * k); } return r; }
function birdParts(o) {
  const { P, add } = rigParts();
  const c = o.col;
  add('body', null, [0, o.bodyY, 0], o.body, [0, 0, 0], c, TL.fur);
  if (o.neck) add('neckB', 'body', [0, o.body[1] * 0.3, o.body[2] * 0.4], o.neck, [0, o.neck[1] / 2, 0], o.neckCol || c, TL.fur, { r0: o.neckR || [0, 0, 0] });
  add('neck', o.neck ? 'neckB' : 'body', o.neck ? [0, o.neck[1], 0] : [0, o.body[1] * 0.4, o.body[2] * 0.45], null);
  add('head', 'neck', [0, 0, 0], o.head, [0, o.head[1] / 2, o.head[2] * 0.2], o.headCol || c, tx(TL.fur, o.face ?? TL.henF));
  add('beak', 'head', [0, o.head[1] * 0.45, o.head[2] / 2 + o.beak[2] / 2], o.beak, [0, 0, 0], o.beakCol || rgbf('#e0a030'), TL.plain);
  add('tail', 'body', [0, o.body[1] * 0.1, -o.body[2] / 2], o.tail, [0, 0, -o.tail[2] / 2], o.tailCol || c, TL.fur, { r0: [o.tailUp || 0, 0, 0] });
  const ww = o.wing || [0.02, o.body[1] * 0.6, o.body[2] * 0.7];
  add('wingL', 'body', [-o.body[0] / 2 - 0.01, o.body[1] * 0.15, 0], ww, [ww[0] > 0.1 ? -ww[0] / 2 : 0, 0, 0], o.wingCol || v3.scale(c, 0.85), TL.fur);
  add('wingR', 'body', [o.body[0] / 2 + 0.01, o.body[1] * 0.15, 0], ww, [ww[0] > 0.1 ? ww[0] / 2 : 0, 0, 0], o.wingCol || v3.scale(c, 0.85), TL.fur);
  const lg = o.leg || [0.025, 0.1];
  add('legFL', 'body', [-o.body[0] * 0.2, -o.body[1] / 2, 0], [lg[0], lg[1], lg[0]], [0, -lg[1] / 2, 0], o.legCol || rgbf('#e0a030'), TL.plain);
  add('legFR', 'body', [o.body[0] * 0.2, -o.body[1] / 2, 0], [lg[0], lg[1], lg[0]], [0, -lg[1] / 2, 0], o.legCol || rgbf('#e0a030'), TL.plain);
  const r = new Rig(P); r.kind = 'bird'; return r;
}
Object.assign(ANIMAL_RIGS, {
  goat: (v) => {
    const c = rgbf(['#d8d0c0', '#6a5a4a', '#e8e4dc', '#9a7a5a'][(v || 0) % 4]);
    const r = quadRig({ col: c, body: [0.34, 0.4, 0.78], bodyY: 0.72, leg: [0.08, 0.52], hoof: true, dark: [0.15, 0.12, 0.1],
      neck: [0, 0.14], neckS: [0.15, 0.36, 0.18], neckO: [0, 0.16, 0.04], headP: [0, 0.32, 0.04], head: [0.17, 0.2, 0.3], face: TL.deerF,
      ears: [0.09, 0.04, 0.05], tail: [0.06, 0.12, 0.05] });
    return rigPlus(r, [
      { name: 'hornL', parent: 'head', p: [-0.05, 0.12, 0.05], s: [0.035, 0.24, 0.035], o: [0, 0.1, -0.03], col: rgbf('#8a7a60'), tex: TL.bone, r0: [-0.7, 0, -0.15] },
      { name: 'hornR', parent: 'head', p: [0.05, 0.12, 0.05], s: [0.035, 0.24, 0.035], o: [0, 0.1, -0.03], col: rgbf('#8a7a60'), tex: TL.bone, r0: [-0.7, 0, 0.15] },
      { name: 'barbe', parent: 'head', p: [0, -0.05, 0.26], s: [0.05, 0.12, 0.04], o: [0, -0.05, 0], col: v3.scale(c, 0.8), tex: TL.hair },
    ]);
  },
  ibex: () => {
    const c = rgbf('#8a7458');
    const r = quadRig({ col: c, body: [0.4, 0.48, 0.95], bodyY: 0.85, leg: [0.1, 0.6], hoof: true, dark: [0.15, 0.12, 0.1],
      neck: [0, 0.16], neckS: [0.18, 0.4, 0.2], neckO: [0, 0.18, 0.04], headP: [0, 0.36, 0.04], head: [0.19, 0.22, 0.32], face: TL.deerF, ears: [0.08, 0.04, 0.05], tail: [0.06, 0.1, 0.05] });
    const u = [];
    for (const s of [-1, 1]) for (let k = 0; k < 4; k++) u.push({ name: 'corne' + s + k, parent: k ? 'corne' + s + (k - 1) : 'head', p: k ? [0, 0.14, 0] : [s * 0.06, 0.13, 0.04], s: [0.055 - k * 0.008, 0.16, 0.06 - k * 0.008], o: [0, 0.07, 0], col: rgbf('#6a5a44'), tex: TL.bone, r0: [k ? -0.45 : -0.5, 0, s * 0.12] });
    return rigPlus(r, u);
  },
  donkey: () => {
    const c = rgbf('#7a7068');
    const r = quadRig({ col: c, body: [0.5, 0.56, 1.2], bodyY: 1.02, leg: [0.12, 0.76], hoof: true, dark: [0.12, 0.1, 0.08],
      neck: [0, 0.16], neckS: [0.22, 0.6, 0.28], neckO: [0, 0.28, 0.05], headP: [0, 0.58, 0.08], head: [0.24, 0.26, 0.5], face: TL.horseF,
      ears: [0.07, 0.3, 0.05], tail: [0.08, 0.6, 0.08], tailCol: rgbf('#3a3430'), snout: [0.2, 0.18, 0.08, -0.06], snoutCol: rgbf('#d8d0c8') });
    return rigPlus(r, [
      { name: 'mane', parent: 'neck', p: [0, 0.3, -0.1], s: [0.06, 0.6, 0.08], col: rgbf('#3a3430'), tex: TL.hair },
      { name: 'saddle', parent: 'body', p: [0, 0.3, 0.08], s: [0.54, 0.08, 0.5], col: rgbf('#5a3a24'), tex: TL.leather, hide: true },
      { name: 'blanketS', parent: 'body', p: [0, 0.24, 0.08], s: [0.56, 0.1, 0.6], col: rgbf('#2a4a7a'), tex: TL.cloth, hide: true },
    ]);
  },
  goose: () => birdParts({ col: rgbf('#f0f0ea'), body: [0.26, 0.24, 0.42], bodyY: 0.28, neck: [0.07, 0.3, 0.07], neckR: [0.15, 0, 0], head: [0.1, 0.1, 0.13], beak: [0.06, 0.04, 0.09], beakCol: rgbf('#e89030'), tail: [0.14, 0.06, 0.1], legCol: rgbf('#e89030'), leg: [0.035, 0.16] }),
  farmduck: () => { const r = ANIMAL_RIGS.duck(); for (const q of r.parts) if (q.s && q.name !== 'beak') q.col = q.name === 'head' ? rgbf('#f4f2ea') : rgbf('#f0ece0'); return r; },
  farmrabbit: (v) => { const r = ANIMAL_RIGS.rabbit(); const c = rgbf(['#f0ece6', '#6a5a4e', '#b0a898', '#2a2624'][(v || 0) % 4]); for (const q of r.parts) if (q.s && q.name !== 'tail') q.col = c; return r; },
  squirrel: () => quadRig({ col: rgbf('#b0582a'), body: [0.1, 0.1, 0.18], bodyY: 0.12, leg: [0.03, 0.08], neck: [0, 0.05], head: [0.08, 0.08, 0.09], face: TL.rabbitF,
    ears: [0.025, 0.05, 0.02], tail: [0.1, 0.24, 0.1], tailCol: rgbf('#c0683a') }),
  hedgehog: () => {
    const r = quadRig({ col: rgbf('#5a4a3a'), body: [0.2, 0.14, 0.26], bodyY: 0.1, bodyTex: TL.hair, leg: [0.03, 0.05], neck: [0, 0.0], head: [0.08, 0.07, 0.1], headCol: rgbf('#b09878'), face: TL.rabbitF,
      snout: [0.04, 0.03, 0.05, -0.01], snoutCol: [0.1, 0.08, 0.07], ears: [0.02, 0.02, 0.02] });
    return rigPlus(r, [{ name: 'epines', parent: 'body', p: [0, 0.07, -0.02], s: [0.22, 0.06, 0.26], col: rgbf('#3a3026'), tex: TL.hair }]);
  },
  badger: () => {
    const r = quadRig({ col: rgbf('#8a8680'), body: [0.3, 0.24, 0.6], bodyY: 0.26, leg: [0.08, 0.17], legCol: rgbf('#2a2826'), neck: [0, 0.04], head: [0.16, 0.14, 0.2], headCol: rgbf('#f0ece4'), face: TL.foxF,
      snout: [0.08, 0.07, 0.08, -0.03], snoutCol: rgbf('#2a2826'), ears: [0.04, 0.04, 0.02], tail: [0.08, 0.05, 0.1] });
    return rigPlus(r, [{ name: 'raie', parent: 'head', p: [-0.045, 0.071, 0.02], s: [0.035, 0.012, 0.21], col: [0.1, 0.1, 0.1], tex: TL.fur }, { name: 'raie2', parent: 'head', p: [0.045, 0.071, 0.02], s: [0.035, 0.012, 0.21], col: [0.1, 0.1, 0.1], tex: TL.fur }]);
  },
  roe: (v) => scaleRig(ANIMAL_RIGS.deer((v | 0) * 2 + 1), 0.72),
  marmot: () => quadRig({ col: rgbf('#8a6a44'), body: [0.2, 0.2, 0.34], bodyY: 0.17, leg: [0.06, 0.08], neck: [0, 0.06], head: [0.14, 0.12, 0.14], face: TL.rabbitF, ears: [0.03, 0.03, 0.02], tail: [0.06, 0.06, 0.12] }),
  bear: () => quadRig({ col: rgbf('#4a3424'), body: [0.8, 0.82, 1.5], bodyY: 0.95, leg: [0.24, 0.6], neck: [0, 0.24], head: [0.44, 0.4, 0.44], face: TL.dogF,
    snout: [0.22, 0.18, 0.2, -0.06], snoutCol: rgbf('#6a5040'), ears: [0.1, 0.1, 0.06], tail: [0.1, 0.1, 0.08] }),
  lynx: () => quadRig({ col: rgbf('#b8905a'), body: [0.3, 0.3, 0.72], bodyY: 0.44, bodyTex: TL.spots, leg: [0.08, 0.4], legTex: TL.fur, neck: [0, 0.1], head: [0.22, 0.2, 0.2], face: TL.catF,
    ears: [0.05, 0.15, 0.03], tail: [0.06, 0.14, 0.06] }),
  otter: () => quadRig({ col: rgbf('#5a4230'), body: [0.18, 0.16, 0.62], bodyY: 0.13, leg: [0.05, 0.08], neck: [0, 0.03], head: [0.14, 0.12, 0.14], face: TL.dogF,
    snout: [0.08, 0.06, 0.05, -0.03], snoutCol: rgbf('#9a8a70'), ears: [0.02, 0.02, 0.02], tail: [0.08, 0.06, 0.42] }),
  frog: () => {
    const { P, add } = rigParts();
    const c = rgbf('#5a8a3a');
    add('body', null, [0, 0.05, 0], [0.1, 0.06, 0.12], [0, 0, 0], c, TL.fur);
    add('neck', 'body', [0, 0.02, 0.06], null);
    add('head', 'neck', [0, 0, 0], [0.1, 0.05, 0.07], [0, 0, 0.03], c, tx(TL.fur, TL.henF));
    for (const s of [-1, 1]) add(s < 0 ? 'oeilL' : 'oeilR', 'head', [s * 0.03, 0.03, 0.03], [0.025, 0.025, 0.025], [0, 0, 0], [0.9, 0.8, 0.3], TL.plain);
    add('legFL', 'body', [-0.05, -0.02, 0.05], [0.02, 0.04, 0.02], [0, -0.02, 0], c, TL.fur);
    add('legFR', 'body', [0.05, -0.02, 0.05], [0.02, 0.04, 0.02], [0, -0.02, 0], c, TL.fur);
    add('legBL', 'body', [-0.06, -0.01, -0.05], [0.04, 0.03, 0.08], [0, -0.01, 0], c, TL.fur);
    add('legBR', 'body', [0.06, -0.01, -0.05], [0.04, 0.03, 0.08], [0, -0.01, 0], c, TL.fur);
    const r = new Rig(P); r.kind = 'quad'; r.cfg = {}; return r;
  },
  // vipère : anneaux en chaîne (voir poseSnake)
  snake: () => {
    const { P, add } = rigParts();
    const c = rgbf('#6a5a3a'), c2 = rgbf('#3a3024');
    add('body', null, [0, 0.03, 0], [0.05, 0.04, 0.1], [0, 0, 0], c, TL.scales);
    add('head', 'body', [0, 0.005, 0.07], [0.06, 0.035, 0.08], [0, 0, 0.03], c2, TL.scales);
    let par = 'body';
    for (let k = 0; k < 7; k++) { const n = 'seg' + k; add(n, par, [0, 0, -0.1], [0.05 - k * 0.004, 0.036 - k * 0.002, 0.1], [0, 0, -0.05], k % 2 ? c : c2, TL.scales); par = n; }
    const r = new Rig(P); r.kind = 'snake'; return r;
  },
  heron: () => birdParts({ col: rgbf('#9aa0a8'), body: [0.2, 0.22, 0.4], bodyY: 0.72, neck: [0.05, 0.36, 0.05], neckR: [0.35, 0, 0], neckCol: rgbf('#d8dce0'), head: [0.08, 0.08, 0.12], headCol: rgbf('#e8ecf0'),
    beak: [0.03, 0.03, 0.2], beakCol: rgbf('#d8b030'), tail: [0.12, 0.05, 0.1], leg: [0.025, 0.6], legCol: rgbf('#7a6a40') }),
  stork: () => birdParts({ col: rgbf('#f2f2ee'), body: [0.22, 0.24, 0.42], bodyY: 0.75, neck: [0.06, 0.3, 0.06], neckR: [0.2, 0, 0], head: [0.09, 0.09, 0.12], beak: [0.035, 0.035, 0.22], beakCol: rgbf('#d04020'),
    tail: [0.14, 0.05, 0.1], wingCol: [0.12, 0.12, 0.12], leg: [0.03, 0.62], legCol: rgbf('#d04020') }),
  swan: () => birdParts({ col: rgbf('#f6f6f2'), body: [0.32, 0.26, 0.62], bodyY: 0.14, neck: [0.07, 0.42, 0.07], neckR: [-0.1, 0, 0], head: [0.09, 0.09, 0.13], beak: [0.05, 0.035, 0.1], beakCol: rgbf('#e87a20'), tail: [0.16, 0.08, 0.12], tailUp: -0.4, leg: [0.02, 0.02] }),
  pheasant: () => birdParts({ col: rgbf('#9a4a24'), body: [0.16, 0.16, 0.3], bodyY: 0.24, head: [0.08, 0.09, 0.1], headCol: rgbf('#2a5a3a'), face: TL.henF, beak: [0.03, 0.025, 0.04], beakCol: rgbf('#d8c8a0'), tail: [0.04, 0.03, 0.44], tailUp: 0.25, tailCol: rgbf('#8a6a44'), leg: [0.02, 0.12], legCol: rgbf('#8a8a80') }),
  partridge: () => birdParts({ col: rgbf('#8a7a66'), body: [0.14, 0.13, 0.2], bodyY: 0.14, head: [0.07, 0.07, 0.08], headCol: rgbf('#b8683a'), beak: [0.025, 0.02, 0.03], beakCol: rgbf('#6a6a60'), tail: [0.08, 0.04, 0.06], leg: [0.018, 0.07], legCol: rgbf('#c89070') }),
  owl: () => birdParts({ col: rgbf('#8a6a48'), body: [0.2, 0.3, 0.2], bodyY: 0.22, head: [0.18, 0.16, 0.16], face: TL.catF, headCol: rgbf('#a08060'), beak: [0.03, 0.03, 0.03], beakCol: rgbf('#3a3024'), tail: [0.1, 0.1, 0.05], leg: [0.03, 0.06], legCol: rgbf('#6a5a40') }),
  bat: () => birdParts({ col: rgbf('#3a2e2a'), body: [0.07, 0.08, 0.12], bodyY: 0.1, head: [0.06, 0.06, 0.06], face: TL.catF, beak: [0.02, 0.015, 0.02], beakCol: [0.1, 0.08, 0.08], tail: [0.04, 0.01, 0.04], wing: [0.28, 0.01, 0.12], wingCol: rgbf('#2a2020'), leg: [0.01, 0.03], legCol: [0.1, 0.08, 0.08] }),
  magpie: () => birdParts({ col: [0.08, 0.08, 0.1], body: [0.12, 0.13, 0.24], bodyY: 0.16, head: [0.09, 0.09, 0.1], beak: [0.03, 0.025, 0.06], beakCol: [0.1, 0.1, 0.1], tail: [0.05, 0.02, 0.3], tailUp: 0.2, wingCol: [0.9, 0.9, 0.92], leg: [0.015, 0.08], legCol: [0.1, 0.1, 0.1] }),
  // la Bête des Combes : un loup gigantesque, noir, aux yeux rouges
  bete: () => { const r = scaleRig(ANIMAL_RIGS.wolf(), 2.1); for (const q of r.parts) if (q.s) q.col = q.name === 'head' ? [0.16, 0.14, 0.14] : [0.12, 0.11, 0.11]; return r; },
});
// pose de la vipère : ondulation
function poseSnake(rig, st) {
  const t = st.t || 0, m = st.move || 0, ph = st.phase || 0;
  for (let k = 0; k < 7; k++) rig.set('seg' + k, 0, Math.sin(ph * 1.5 + k * 0.9) * (0.25 + 0.3 * m), 0);
  rig.set('head', st.raise ? -0.5 : 0, Math.sin(t * 0.7) * 0.2, 0);
}
