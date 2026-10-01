// ============================================================================
//  LES GARDES ET LEURS CABANES — les modèles (11-zzzzC-gardes.js)
//  Les objets des postes de garde : le brasero de la nuit (il ne brûle que
//  quand on veille), le poêle de fonte et son tuyau, les lits de camp, le
//  tableau des avis, la guérite du pont, la cuirasse et le casque du chevalier
//  sur leur chevalet, le tambour du garde champêtre, les seaux à incendie.
//  Et ce que portent les gardes : le képi, le casque à crinière, le bicorne, la
//  cuirasse, les buffleteries, la plaque, le sabre au fourreau (tiré quand on
//  se bat), la lanterne de ronde, le fusil en bandoulière.
//  L'avant de chaque modèle regarde +z ; l'origine est au sol, au centre.
// ============================================================================
const G1C = {
  fer: rgbf('#3a3b40'), fonte: rgbf('#2c2d31'), laiton: rgbf('#b8933e'), acier: rgbf('#b9bec8'), acierSombre: rgbf('#7c818a'),
  toile: rgbf('#8a8470'), couverture: rgbf('#5a5e4e'), drapBleu: rgbf('#2c3450'), cuir: rgbf('#4a3020'), cuirNoir: rgbf('#1c1814'),
  crin: rgbf('#14110f'), garance: rgbf('#9a2a22'), braise: [1.6, 0.62, 0.18], flamme: [1.9, 1.05, 0.32], papier: rgbf('#ece4cc'),
};

Object.assign(PROP_MODELS, {
  // le brasero : un panier de fer sur trois pieds ; la nuit, des braises et de petites flammes (data.lit)
  brasero(E, o, t) {
    for (let k = 0; k < 3; k++) { const a = k * TAU / 3; E.box(Math.sin(a) * 0.22, 0.32, Math.cos(a) * 0.22, 0.04, 0.68, 0.04, G1C.fer, TL.iron, Math.cos(a) * 0.22, 0, -Math.sin(a) * 0.22); }
    E.bx(0, 0.6, 0, 0.56, 0.05, 0.56, G1C.fer, TL.iron);
    for (const [x, z, sx, sz] of [[0, 0.27, 0.56, 0.03], [0, -0.27, 0.56, 0.03], [0.27, 0, 0.03, 0.56], [-0.27, 0, 0.03, 0.56]]) E.bx(x, 0.65, z, sx, 0.3, sz, G1C.fer, TL.iron);
    const lit = !!(o.data && o.data.lit), tt = t ? t.t || 0 : 0;
    if (lit) {
      E.fl = FX_EMIT;
      E.bx(0, 0.65, 0, 0.48, 0.12, 0.48, G1C.braise, TL.ember);
      for (let k = 0; k < 4; k++) {
        const h = 0.16 + 0.12 * (0.5 + 0.5 * Math.sin(tt * (5 + k) + k * 1.9 + o.x));
        E.box(Math.sin(k * 1.7) * 0.11, 0.8 + h / 2, Math.cos(k * 2.3) * 0.11, 0.1, h, 0.1, G1C.flamme, TL.flame, 0, tt * 0.7 + k);
      }
      E.fl = 0;
    } else E.bx(0, 0.65, 0, 0.48, 0.08, 0.48, rgbf('#3a3634'), TL.coal);
  },
  // le poêle de fonte : sa porte rougeoie quand il chauffe (data.lit) ; le tuyau monte de data.h mètres
  g1_poele(E, o, t) {
    const h = (o.data && o.data.h) || 1.8, lit = !!(o.data && o.data.lit);
    for (const [x, z] of [[-0.2, -0.17], [0.2, -0.17], [-0.2, 0.17], [0.2, 0.17]]) E.bx(x, 0, z, 0.06, 0.16, 0.06, G1C.fonte, TL.iron);
    E.bx(0, 0.16, 0, 0.5, 0.56, 0.44, G1C.fonte, TL.iron);
    E.bx(0, 0.72, 0, 0.56, 0.05, 0.5, G1C.fonte, TL.iron);
    E.bx(0, 0.77, 0, 0.2, 0.04, 0.2, G1C.fer, TL.iron);
    E.bx(0.12, 0.77, 0.1, 0.13, h - 0.77, 0.13, G1C.fonte, TL.iron);
    E.bx(-0.1, 0.77, -0.08, 0.2, 0.16, 0.18, rgbf('#5c5e64'), TL.metal); // la bouilloire
    E.fl = lit ? FX_EMIT : 0;
    E.bx(0, 0.26, 0.225, 0.24, 0.18, 0.02, lit ? [1.4, 0.5, 0.15] : [0.06, 0.05, 0.05], lit ? TL.ember : TL.plain);
    E.fl = 0;
  },
  // le lit de camp : deux croisillons, la toile tendue, une couverture grise (data.col), un traversin ; au pied, une capote pliée
  g1_lit_camp(E, o) {
    const c = rgbf((o.data && o.data.col) || '#5a5e4e');
    for (const z of [-0.8, 0.8]) for (const s of [-1, 1]) E.box(0, 0.2, z, 0.72, 0.035, 0.035, WHITE, TL.wood, 0, 0, s * 0.5);
    for (const x of [-0.36, 0.36]) E.bx(x, 0.36, 0, 0.04, 0.04, 1.86, WHITE, TL.wood);
    E.bx(0, 0.39, 0, 0.7, 0.03, 1.8, G1C.toile, TL.cloth);
    E.bx(0, 0.42, 0.1, 0.72, 0.06, 1.3, c, TL.blanket);
    E.bx(0, 0.42, -0.72, 0.56, 0.1, 0.24, rgbf('#d8d0bc'), TL.pillow);
    if (!(o.data && o.data.nu)) E.bx(0.04, 0.48, 0.66, 0.5, 0.08, 0.32, G1C.drapBleu, TL.coat);
  },
  // le tableau des avis, cloué au mur (+z regarde la rue) : des feuilles, un arrêté, et, quand on vous cherche, votre affiche
  g1_tableau(E, o) {
    E.bx(0, 0, 0, 1.2, 0.85, 0.05, WHITE, TL.darkwood);
    E.bx(0, 0.05, 0.025, 1.1, 0.75, 0.02, rgbf('#9a7a52'), TL.wood);
    E.box(0, 0.92, 0.04, 1.3, 0.06, 0.16, WHITE, TL.darkwood, -0.2);
    const F = [[-0.36, 0.52, 0.3, 0.38, G1C.papier], [0.02, 0.56, 0.28, 0.3, rgbf('#e8d8a8')], [0.36, 0.5, 0.26, 0.4, rgbf('#f0e8d8')], [-0.2, 0.18, 0.4, 0.26, rgbf('#ddd0b4')], [0.28, 0.16, 0.3, 0.24, G1C.papier]];
    for (const [x, y, w, h, c] of F) { E.box(x, y, 0.04, w, h, 0.01, c, TL.paper); E.box(x, y + h / 2 - 0.03, 0.046, 0.025, 0.025, 0.01, rgbf('#7a1a10'), TL.plain); }
    E.box(-0.2, 0.22, 0.047, 0.3, 0.02, 0.006, rgbf('#3a2a1a'), TL.plain); E.box(-0.2, 0.17, 0.047, 0.26, 0.012, 0.006, rgbf('#3a2a1a'), TL.plain);
  },
  // la guérite du pont : planches peintes à chevrons, un petit toit de tôle, ouverte devant (+z : on s'y abrite debout)
  g1_guerite(E) {
    const v = rgbf('#3e4a3a'), b = rgbf('#e4dccb');
    E.bx(0, 0, -0.42, 1.0, 2.25, 0.06, v, TL.wood);
    for (const s of [-1, 1]) { E.bx(s * 0.47, 0, 0, 0.06, 2.25, 0.9, v, TL.wood); E.bx(s * 0.47, 0.9, 0.43, 0.08, 0.14, 0.06, b, TL.wood); }
    for (const y of [0.3, 1.2]) for (const s of [-1, 1]) for (let k = 0; k < 3; k++) E.box(s * 0.502, y + 0.18 + k * 0.22, 0, 0.012, 0.08, 0.86, k % 2 ? v : b, TL.plain, 0.5, 0, 0);
    E.bx(0, 0, 0, 0.94, 0.06, 0.86, WHITE, TL.darkwood);
    E.box(0, 2.38, -0.04, 1.24, 0.08, 1.12, rgbf('#4a4c52'), TL.iron, -0.18);
    E.box(0, 2.3, -0.04, 1.1, 0.1, 1.0, v, TL.wood);
    E.bx(0, 1.0, -0.36, 0.42, 0.04, 0.12, WHITE, TL.darkwood); // la tablette
  },
  // la cuirasse et le casque du chevalier, sur leur chevalet (la tenue de rechange, astiquée)
  g1_cuirasse_pose(E) {
    E.bx(0, 0, 0, 0.36, 0.05, 0.36, WHITE, TL.darkwood);
    E.bx(0, 0.05, 0, 0.06, 1.25, 0.06, WHITE, TL.darkwood);
    E.bx(0, 1.15, 0, 0.5, 0.05, 0.06, WHITE, TL.darkwood);
    E.box(0, 1.0, 0.06, 0.44, 0.5, 0.12, G1C.acier, TL.metal);
    E.box(0, 1.0, -0.05, 0.42, 0.48, 0.08, G1C.acierSombre, TL.metal);
    for (const s of [-1, 1]) E.bx(s * 0.17, 1.2, 0, 0.08, 0.025, 0.2, G1C.laiton, TL.gold);
    E.bx(0, 1.3, 0, 0.26, 0.17, 0.28, G1C.acier, TL.metal);
    E.bx(0, 1.47, 0, 0.05, 0.08, 0.26, G1C.laiton, TL.gold);
    E.box(0, 1.33, -0.2, 0.06, 0.38, 0.06, G1C.crin, TL.hair, 0.35);
  },
  // le tambour du garde champêtre et ses baguettes (pour les avis à la population)
  g1_tambour(E) {
    E.bx(0, 0, 0, 0.42, 0.3, 0.42, rgbf('#2a3a6a'), TL.wood);
    E.bx(0, 0.3, 0, 0.44, 0.02, 0.44, rgbf('#e0d8c0'), TL.paper);
    E.bx(0, 0, 0, 0.44, 0.03, 0.44, G1C.garance, TL.wood);
    for (let k = 0; k < 6; k++) E.box(Math.sin(k) * 0.21, 0.15, Math.cos(k) * 0.21, 0.01, 0.3, 0.01, rgbf('#e8e0c8'), TL.rope, 0, 0, 0.4);
    E.box(0.05, 0.33, 0.04, 0.34, 0.025, 0.025, WHITE, TL.wood, 0, 0.4); E.box(-0.02, 0.34, -0.06, 0.34, 0.025, 0.025, WHITE, TL.wood, 0, -0.3);
  },
  // les seaux de cuir à incendie, pendus au mur (+z regarde la pièce)
  g1_seaux(E) {
    E.bx(0, 1.6, -0.03, 1.0, 0.06, 0.05, WHITE, TL.darkwood);
    for (const x of [-0.32, 0, 0.32]) { E.bx(x, 1.12, 0.06, 0.2, 0.3, 0.2, G1C.cuir, TL.leather); E.bx(x, 1.42, 0.06, 0.18, 0.18, 0.012, G1C.cuirNoir, TL.leather); E.bx(x, 1.44, 0.06, 0.06, 0.16, 0.02, G1C.fer, TL.iron); }
  },
  // le registre (un grand livre ouvert, l'encrier, la plume)
  g1_registre(E) {
    E.box(0, 0.02, 0, 0.5, 0.03, 0.36, rgbf('#3a2420'), TL.leather);
    E.box(-0.12, 0.04, 0, 0.23, 0.02, 0.33, G1C.papier, TL.paper, 0, 0, 0.04); E.box(0.12, 0.04, 0, 0.23, 0.02, 0.33, G1C.papier, TL.paper, 0, 0, -0.04);
    for (let k = 0; k < 5; k++) E.box(-0.12, 0.052, -0.11 + k * 0.05, 0.18, 0.004, 0.008, rgbf('#4a3a2a'), TL.plain);
    E.bx(0.32, 0, 0.08, 0.07, 0.07, 0.07, rgbf('#1c1a20'), TL.glass);
    E.box(0.33, 0.12, 0.08, 0.015, 0.2, 0.015, rgbf('#e8e2d6'), TL.plain, 0.3);
  },
  // une selle sur son chevalet, la bride pendue (l'écurie du gendarme)
  g1_selle(E) {
    for (const z of [-0.3, 0.3]) for (const s of [-1, 1]) E.box(s * 0.16, 0.4, z, 0.05, 0.85, 0.05, WHITE, TL.wood, 0, 0, s * 0.35);
    E.bx(0, 0.78, 0, 0.1, 0.08, 0.74, WHITE, TL.wood);
    E.box(0, 0.9, 0, 0.5, 0.14, 0.58, rgbf('#5a3420'), TL.leather);
    E.box(0, 1.0, -0.22, 0.2, 0.14, 0.12, rgbf('#4a2a18'), TL.leather);
    E.box(0, 0.86, 0.04, 0.6, 0.06, 0.66, rgbf('#2a3a6a'), TL.cloth);
    for (const s of [-1, 1]) { E.bx(s * 0.3, 0.45, 0.02, 0.02, 0.4, 0.02, G1C.cuir, TL.leather); E.bx(s * 0.3, 0.42, 0.02, 0.08, 0.05, 0.06, G1C.fer, TL.iron); }
  },
});
Object.assign(PROP_COLL, {
  brasero: [0.3, 0.3, 0.9], g1_poele: [0.3, 0.26, 0.9], g1_lit_camp: [0.4, 0.95, 0.5], g1_tableau: null, g1_guerite: [0.52, 0.48, 2.3],
  g1_cuirasse_pose: [0.25, 0.22, 1.5], g1_tambour: [0.22, 0.22, 0.34], g1_seaux: null, g1_registre: null, g1_selle: [0.3, 0.4, 1.0],
});
Object.assign(PROP_LIGHTS, {
  brasero: { c: [1.0, 0.56, 0.24], r: 9, y: 0.95, flicker: true, lit: true },
  g1_poele: { c: [1.0, 0.5, 0.2], r: 4.5, y: 0.35, flicker: true, lit: true },
});

// ---------------------------------------------------------------- ce que portent les gardes
// look.casque : 'kepi' | 'crin' (casque à crinière) | 'bicorne' ; look.cuirasse ; look.buffle (buffleteries blanches) ;
// look.plaque (plaque de garde champêtre et son baudrier) ; look.epaulettes (couleur) ; look.sabre (fourreau à la hanche) ;
// look.held === 'sabre' : la lame et la garde dans la main droite (it0, it1 : montrées quand on se bat) ;
// look.ronde : une lanterne dans la main gauche (g1lant, montrée la nuit, de veille) ; look.fusil : en bandoulière (g1fusD*),
// aux mains pour tirer (g1fusM*). rig.g1 = { sabre, lant, fusil } : réglé par 11-zzzzC1-gardes-jeu.js, appliqué au dessin.
{
  const _hr = humanRig;
  humanRig = function (look) {
    const r = _hr(look);
    if (!look || !(look.casque || look.cuirasse || look.sabre || look.held === 'sabre' || look.ronde || look.fusil || look.plaque || look.buffle)) return r;
    const P = [], hd = r.part('head'), to = r.part('torso');
    if (!hd || !to) return r;
    const H = hd.s[0], yTop = hd.o[1] + hd.s[1] / 2, zf = H / 2;
    const tw = to.s[0], tH = to.s[1] + 0.02, td = to.s[2];
    const add = (name, parent, p, s, col, tex, o, extra) => P.push(Object.assign({ name, parent, p, s, o: o || [0, 0, 0], col, tex }, extra || {}));
    // ---- coiffures
    if (look.casque === 'kepi') {
      const c = rgbf(look.casqueCol || '#232c46'), bande = rgbf(look.bandeCol || '#1a1d28');
      add('g1kepi', 'head', [0, yTop + 0.055, -0.012], [H + 0.012, 0.15, H + 0.01], c, TL.cloth, [0, 0, 0], { r0: [0.13, 0, 0], shp: TF.calotteH });
      add('g1kepiB', 'head', [0, yTop - 0.004, -0.006], [H + 0.03, 0.045, H + 0.03], bande, TL.cloth);
      add('g1kepiV', 'head', [0, yTop - 0.03, zf + 0.05], [H * 0.82, 0.015, 0.11], G1C.cuirNoir, TL.leather, [0, 0, 0], { r0: [0.28, 0, 0] });
      add('g1kepiI', 'head', [0, yTop + 0.06, zf + 0.012], [0.05, 0.05, 0.012], G1C.laiton, TL.gold, [0, 0, 0], { r0: [0.13, 0, 0] });
    } else if (look.casque === 'crin') {
      add('g1bombe', 'head', [0, yTop + 0.055, -0.01], [H + 0.05, 0.16, H + 0.06], G1C.acier, TL.metal, [0, 0, 0], { shp: TF.calotte });
      add('g1bandeau', 'head', [0, yTop - 0.012, -0.01], [H + 0.065, 0.05, H + 0.075], G1C.laiton, TL.gold);
      add('g1cimier', 'head', [0, yTop + 0.16, -0.01], [0.045, 0.09, H * 0.98], G1C.laiton, TL.gold);
      add('g1crin', 'head', [0, yTop + 0.17, -H / 2 - 0.01], [0.075, 0.5, 0.07], G1C.crin, TL.hair, [0, -0.24, -0.02], { r0: [0.22, 0, 0] });
      add('g1visiere', 'head', [0, yTop - 0.03, zf + 0.04], [H * 0.86, 0.018, 0.09], G1C.acier, TL.metal, [0, 0, 0], { r0: [0.3, 0, 0] });
      add('g1plumet', 'head', [-(H / 2 + 0.035), yTop + 0.1, 0.0], [0.04, 0.2, 0.04], G1C.garance, TL.wool);
      for (const s of [-1, 1]) add(s < 0 ? 'g1jugL' : 'g1jugR', 'head', [s * (H / 2 + 0.014), yTop - 0.1, 0.02], [0.022, 0.15, 0.04], G1C.laiton, TL.gold);
    } else if (look.casque === 'bicorne') {
      const c = rgbf(look.casqueCol || '#141216'), g = rgbf('#c8c8c4');
      for (const s of [-1, 1]) {
        add(s < 0 ? 'g1bicL' : 'g1bicR', 'head', [s * 0.12, yTop + 0.07, -0.015], [0.27, 0.14, 0.13], c, TL.cloth, [0, 0, 0], { r0: [0, 0, -s * 0.24] });
        add(s < 0 ? 'g1bicGL' : 'g1bicGR', 'head', [s * 0.12, yTop + 0.135, -0.015], [0.27, 0.02, 0.135], g, TL.metal, [0, 0, 0], { r0: [0, 0, -s * 0.24] });
      }
      add('g1bicC', 'head', [0, yTop + 0.01, -0.015], [H + 0.02, 0.06, H + 0.01], c, TL.cloth);
      add('g1cocarde', 'head', [-0.06, yTop + 0.08, 0.06], [0.06, 0.06, 0.012], rgbf('#2a3c8a'), TL.plain);
      add('g1cocarde2', 'head', [-0.06, yTop + 0.08, 0.067], [0.036, 0.036, 0.008], rgbf('#e8e4dc'), TL.plain);
      add('g1cocarde3', 'head', [-0.06, yTop + 0.08, 0.072], [0.016, 0.016, 0.006], rgbf('#b02020'), TL.plain);
    }
    // ---- cuirasse (plastron d'acier, épaulières de laiton), buffleteries, plaque, épaulettes
    if (look.cuirasse) {
      add('g1cuir', 'torso', [0, 0, 0], [tw + 0.04, tH * 0.78, td + 0.06], G1C.acier, TL.metal, [0, tH * 0.56, 0.004], { shp: to.shp });
      for (const s of [-1, 1]) add(s < 0 ? 'g1epL' : 'g1epR', 'torso', [s * (tw / 2 - 0.06), tH - 0.005, 0], [0.09, 0.025, td * 0.75], G1C.laiton, TL.gold);
      add('g1clous', 'torso', [0, tH * 0.2, td / 2 + 0.035], [tw * 0.7, 0.02, 0.01], G1C.laiton, TL.gold);
    }
    if (look.buffle) {
      const bl = rgbf('#e8e4d8');
      add('g1bufA', 'torso', [0, tH * 0.52, td / 2 + 0.018], [0.05, tH * 1.05, 0.012], bl, TL.leather, [0, 0, 0], { r0: [0, 0, 0.55] });
      add('g1bufB', 'torso', [0, tH * 0.52, -td / 2 - 0.018], [0.05, tH * 1.05, 0.012], bl, TL.leather, [0, 0, 0], { r0: [0, 0, -0.55] });
      add('g1bufC', 'torso', [0, 0.06, 0], [tw + 0.04, 0.055, td + 0.04], bl, TL.leather);
      add('g1bufP', 'torso', [0, 0.06, td / 2 + 0.024], [0.07, 0.06, 0.01], G1C.laiton, TL.gold);
    }
    if (look.plaque) {
      const cu = rgbf('#5a3a22');
      add('g1bau', 'torso', [0, tH * 0.52, td / 2 + 0.016], [0.06, tH * 1.05, 0.012], cu, TL.leather, [0, 0, 0], { r0: [0, 0, -0.55] });
      add('g1bauD', 'torso', [0, tH * 0.52, -td / 2 - 0.016], [0.06, tH * 1.05, 0.012], cu, TL.leather, [0, 0, 0], { r0: [0, 0, 0.55] });
      add('g1plaque', 'torso', [-0.07, tH * 0.66, td / 2 + 0.026], [0.085, 0.1, 0.012], G1C.laiton, TL.gold, [0, 0, 0], { r0: [0, 0, -0.55] });
    }
    if (look.epaulettes) {
      const ec = rgbf(look.epaulettes);
      for (const s of [-1, 1]) add(s < 0 ? 'g1epaL' : 'g1epaR', 'torso', [s * (tw / 2 - 0.02), tH + 0.004, 0], [0.13, 0.03, 0.15], ec, TL.gold, [0, 0, 0], { r0: [0, 0, s * 0.2] });
    }
    // ---- le sabre au fourreau, à la hanche gauche (la garde disparaît quand la lame est tirée)
    if (look.sabre) {
      add('g1fourreau', 'hips', [-0.22, -0.02, 0.02], [0.035, 0.86, 0.065], G1C.fer, TL.iron, [0, -0.42, 0], { r0: [0.42, 0, 0.1] });
      add('g1garde', 'hips', [-0.22, -0.02, 0.02], [0.05, 0.15, 0.1], G1C.laiton, TL.gold, [0, 0.07, 0], { r0: [0.42, 0, 0.1] });
    }
    // ---- la lame tirée (main droite) : it0 la garde, it1 la lame
    if (look.held === 'sabre') {
      add('it0', 'handR', [0, -0.03, 0.02], [0.05, 0.13, 0.1], G1C.laiton, TL.gold, [0, 0.02, 0], { hide: true });
      add('it1', 'handR', [0, 0.05, 0.03], [0.022, 0.88, 0.05], rgbf('#d8dce4'), TL.metal, [0, 0.46, 0], { r0: [0.25, 0, 0], hide: true });
    }
    // ---- la lanterne de ronde (main gauche)
    if (look.ronde) {
      add('g1lant', 'handL', [0, -0.16, 0.02], [0.13, 0.17, 0.13], [1.25, 1.0, 0.68], TL.glass, [0, 0, 0], { fl: FX_EMIT, hide: true });
      add('g1lant2', 'handL', [0, -0.06, 0.02], [0.15, 0.03, 0.15], G1C.fer, TL.iron, [0, 0, 0], { hide: true });
    }
    // ---- le fusil : dans le dos, ou aux mains pour tirer
    if (look.fusil) {
      const bois = rgbf('#5a3a22'), acier = rgbf('#34363c');
      add('g1fusD0', 'torso', [0.04, 0.3, -0.16], [0.05, 0.72, 0.035], acier, TL.iron, [0, 0.14, 0], { r0: [0.12, 0, 0.5] });
      add('g1fusD1', 'torso', [0.04, 0.3, -0.16], [0.07, 0.34, 0.09], bois, TL.darkwood, [0, -0.34, 0], { r0: [0.12, 0, 0.5] });
      add('g1fusM0', 'handR', [0, -0.03, 0.04], [0.035, 0.035, 0.72], acier, TL.iron, [0, 0, 0.36], { r0: [0.9, 0, 0], hide: true });
      add('g1fusM1', 'handR', [0, -0.03, 0.04], [0.07, 0.1, 0.36], bois, TL.darkwood, [0, -0.02, -0.16], { r0: [0.9, 0, 0], hide: true });
    }
    if (!P.length) return r;
    const rr = rigPlus(r, P);
    rr.g1 = { sabre: false, lant: false, fusil: false };
    return rr;
  };
}
// au dessin, ce que le garde tient (npcs.draw cache it0/it1 de ceux qui ne sont pas « le garde » : on les remontre ici)
{
  const _dr = drawRig;
  drawRig = function (buf, rig, x, y, z, heading, s, flags) {
    const G = rig && rig.g1;
    if (G) {
      const I = rig.idx, P = rig.parts, set = (n, h) => { const i = I[n]; if (i !== undefined) P[i].hide = h; };
      set('it0', !G.sabre); set('it1', !G.sabre); set('g1garde', !!G.sabre);
      set('g1lant', !G.lant); set('g1lant2', !G.lant);
      set('g1fusD0', !!G.fusil); set('g1fusD1', !!G.fusil); set('g1fusM0', !G.fusil); set('g1fusM1', !G.fusil);
    }
    return _dr(buf, rig, x, y, z, heading, s, flags);
  };
}
