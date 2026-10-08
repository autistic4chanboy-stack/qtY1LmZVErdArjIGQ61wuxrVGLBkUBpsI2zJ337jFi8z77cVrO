// ============================================================================
//  DES BÊTES À QUI L'ON PEUT PARLER (agent P) : leurs modèles en boîtes
//  (squelettes « p_… », l'avant regarde +z). Des bêtes du XIXᵉ siècle, à leur
//  taille ; chacune se reconnaît à un détail, sans qu'on le dise :
//  - Tibert, le chat : gros matou gris tigré, plastron blanc, les yeux vairons
//    (un bleu, un d'or), l'oreille gauche entaillée ;
//  - la hulotte : brune, ronde, l'œil gauche fermé par une cicatrice claire, une
//    mèche blanche au front ; perchée sur un chicot (dessiné à part : il reste) ;
//  - le crapaud : énorme, verruqueux, les yeux d'or, une pierre verte au front ;
//  - Tiécelin, le grand corbeau : une rémige blanche dans l'aile gauche, un bout
//    de lanière de cuir (un jet de fauconnier) à la patte droite ;
//  - Hermeline, la renarde : le museau gris, l'oreille droite fendue, la patte de
//    devant gauche tenue en l'air (il y manque deux doigts) ;
//  - l'Écornée, la chèvre : noire, les raies blanches de la face, le poil long,
//    une corne cassée, une grosse sonnaille au collier de cuir rouge ;
//  - la Vieille, la carpe : bronze et or, le dos couvert de mousse, un anneau
//    d'or à la lèvre, des barbillons, un œil blanchi ;
//  - Bayard, le cheval de trait : gris pommelé devenu presque blanc, les fanons
//    épais, et toujours son collier de trait au cou.
// ============================================================================
const pB = (name, parent, p, s, col, tex, extra) => Object.assign({ name, parent, p, s, o: [0, 0, 0], col: typeof col === 'string' ? rgbf(col) : col, tex: tex ?? TL.fur }, extra || {});
// les yeux sur la face avant d'une tête de quadRig (tête : [l, h, p] ; la face avant est à z = p)
const pYeux = (head, cG, cD, k, dy) => {
  const [W, H, D] = head, ex = W * 0.22, ey = H * (dy ?? 0.03), s = (k || 0.16) * W;
  return [
    pB('oeilG', 'head', [-ex, ey, D + 0.004], [s, s * 0.85, 0.008], cG, TL.plain),
    pB('oeilD', 'head', [ex, ey, D + 0.004], [s, s * 0.85, 0.008], cD, TL.plain),
  ];
};

Object.assign(ANIMAL_RIGS, {
  // ------------------------------------------------------------------ Tibert
  p_chat: () => {
    const c = rgbf('#8c8a86'), blanc = rgbf('#ece8e0');
    const head = [0.2, 0.18, 0.17];
    const r = quadRig({ col: c, body: [0.23, 0.22, 0.52], bodyY: 0.33, bodyTex: TL.stripes, leg: [0.075, 0.24], legCol: blanc, legTex: TL.fur,
      neck: [0, 0.09], head, face: TL.catF, headTex: TL.stripes, ears: [0.055, 0.085, 0.03], tail: [0.045, 0.42, 0.045], tailCol: v3.scale(c, 0.9) });
    const rr = rigPlus(r, [
      pB('plastron', 'body', [0, -0.04, 0.24], [0.2, 0.16, 0.05], blanc),
      pB('museau', 'head', [0, -0.045, 0.172], [0.085, 0.05, 0.012], blanc),
      pB('bout', 'tail', [0, -0.41, 0], [0.05, 0.07, 0.05], v3.scale(c, 0.55)),
      ...pYeux(head, '#5aa0e0', '#e0a830', 0.18),
    ]);
    // l'oreille gauche entaillée : plus courte, un peu de travers
    const eg = rr.part('earL');
    eg.s = [0.055, 0.05, 0.03]; eg.o = [0, 0.025, 0]; eg.r0 = [0, 0, 0.25]; eg.r = eg.r0.slice();
    rr.bp = 'chat';
    return rr;
  },

  // ------------------------------------------------------------------ la hulotte
  p_hulotte: () => {
    const c = rgbf('#7a5a3a'), aile = rgbf('#6a4a2e');
    // (tête : centre à y 0,105, avant à z 0,14 du pivot)
    const r = birdParts({ col: c, body: [0.26, 0.34, 0.24], bodyY: 0.2, head: [0.24, 0.21, 0.2], headCol: rgbf('#86643f'), face: TL.blankF,
      beak: [0.02, 0.02, 0.02], beakCol: rgbf('#d8c890'), tail: [0.14, 0.12, 0.05], wingCol: aile, leg: [0.035, 0.05], legCol: rgbf('#c8b088') });
    const rr = rigPlus(r, [
      pB('disque', 'head', [0, 0.1, 0.146], [0.2, 0.17, 0.012], '#b8966a'),
      // l'œil droit, grand et noir ; le gauche, fermé, barré d'une cicatrice claire
      pB('oeilD', 'head', [0.05, 0.118, 0.154], [0.06, 0.06, 0.008], [0.05, 0.04, 0.04], TL.plain),
      pB('pupD', 'head', [0.05, 0.12, 0.159], [0.022, 0.022, 0.004], [0.5, 0.36, 0.16], TL.plain),
      pB('oeilG', 'head', [-0.05, 0.114, 0.154], [0.062, 0.012, 0.008], rgbf('#3a2818'), TL.plain),
      pB('balafre', 'head', [-0.05, 0.118, 0.157], [0.012, 0.085, 0.004], rgbf('#ece2c8'), TL.plain, { r0: [0, 0, 0.5] }),
      pB('bec', 'head', [0, 0.075, 0.158], [0.035, 0.045, 0.03], rgbf('#d8c890'), TL.plain),
      pB('meche', 'head', [0, 0.214, 0.08], [0.05, 0.022, 0.09], rgbf('#f0ece4'), TL.fur),
      pB('poitrail', 'body', [0, -0.02, 0.122], [0.2, 0.26, 0.012], rgbf('#c8a878'), TL.stripes),
      pB('plieL', 'body', [-0.136, 0.02, -0.02], [0.02, 0.26, 0.22], aile),
      pB('plieR', 'body', [0.136, 0.02, -0.02], [0.02, 0.26, 0.22], aile),
    ]);
    rr.part('beak').hide = true;
    for (const n of ['wingL', 'wingR']) { const q = rr.part(n); q.s = [0.42, 0.02, 0.2]; q.o = [n === 'wingL' ? -0.21 : 0.21, 0, 0]; q.hide = true; }
    rr.bp = 'hulotte';
    return rr;
  },

  // ------------------------------------------------------------------ le crapaud
  p_crapaud: () => {
    const { P, add } = rigParts();
    const k = 2.6, c = rgbf('#6e5a3a'), v = rgbf('#c8b490'), d = rgbf('#5a4a30');
    add('body', null, [0, 0.055 * k, 0], [0.11 * k, 0.06 * k, 0.12 * k], [0, 0, 0], c, TL.scales);
    add('ventre', 'body', [0, -0.026 * k, 0.004 * k], [0.104 * k, 0.014 * k, 0.11 * k], [0, 0, 0], v, TL.plain);
    add('dos', 'body', [0, 0.03 * k, -0.005 * k], [0.08 * k, 0.012 * k, 0.09 * k], [0, 0, 0], v3.scale(c, 0.8), TL.scales);
    add('neck', 'body', [0, 0.02 * k, 0.06 * k], null);
    add('head', 'neck', [0, 0, 0], [0.1 * k, 0.05 * k, 0.07 * k], [0, 0, 0.03 * k], c, tx(TL.scales, TL.henF));
    for (const s of [-1, 1]) {
      add(s < 0 ? 'oeilL' : 'oeilR', 'head', [s * 0.032 * k, 0.03 * k, 0.034 * k], [0.026 * k, 0.024 * k, 0.026 * k], [0, 0, 0], rgbf('#c8902a'), TL.plain);
      add(s < 0 ? 'fenteL' : 'fenteR', 'head', [s * 0.032 * k, 0.03 * k, 0.0475 * k], [0.018 * k, 0.004 * k, 0.002 * k], [0, 0, 0], [0.04, 0.03, 0.02], TL.plain);
      add(s < 0 ? 'glandeL' : 'glandeR', 'head', [s * 0.045 * k, 0.026 * k, 0.012 * k], [0.018 * k, 0.014 * k, 0.03 * k], [0, 0, 0], d, TL.scales);
    }
    // la pierre du front
    add('pierre', 'head', [0, 0.028 * k, 0.05 * k], [0.022 * k, 0.012 * k, 0.02 * k], [0, 0, 0], rgbf('#4f7a5e'), TL.stone);
    add('legFL', 'body', [-0.05 * k, -0.02 * k, 0.05 * k], [0.022 * k, 0.045 * k, 0.022 * k], [0, -0.02 * k, 0], d, TL.scales);
    add('legFR', 'body', [0.05 * k, -0.02 * k, 0.05 * k], [0.022 * k, 0.045 * k, 0.022 * k], [0, -0.02 * k, 0], d, TL.scales);
    add('legBL', 'body', [-0.062 * k, -0.01 * k, -0.045 * k], [0.045 * k, 0.034 * k, 0.085 * k], [0, -0.012 * k, 0], d, TL.scales);
    add('legBR', 'body', [0.062 * k, -0.01 * k, -0.045 * k], [0.045 * k, 0.034 * k, 0.085 * k], [0, -0.012 * k, 0], d, TL.scales);
    const r = new Rig(P); r.kind = 'quad'; r.cfg = {}; r.bp = 'crapaud';
    return r;
  },

  // ------------------------------------------------------------------ Tiécelin
  p_corbeau: () => {
    const c = [0.07, 0.07, 0.09], reflet = [0.1, 0.11, 0.16], blanc = [0.92, 0.92, 0.9];
    const r = birdParts({ col: c, body: [0.2, 0.2, 0.42], bodyY: 0.22, head: [0.15, 0.15, 0.17], headCol: c, face: TL.crowF,
      beak: [0.055, 0.06, 0.14], beakCol: [0.12, 0.12, 0.13], tail: [0.13, 0.03, 0.22], wingCol: reflet, leg: [0.03, 0.12], legCol: [0.15, 0.15, 0.16] });
    const rr = rigPlus(r, [
      pB('gorge', 'head', [0, 0.025, 0.065], [0.11, 0.07, 0.1], c, TL.hair),
      pB('plieL', 'body', [-0.105, 0.02, -0.03], [0.022, 0.15, 0.4], reflet),
      pB('plieR', 'body', [0.105, 0.02, -0.03], [0.022, 0.15, 0.4], reflet),
      // la rémige blanche, dans l'aile gauche (repliée, et ouverte en vol)
      pB('blancheP', 'plieL', [-0.006, -0.045, -0.06], [0.016, 0.05, 0.3], blanc, TL.plain),
      pB('blancheV', 'wingL', [-0.5, 0.006, -0.05], [0.08, 0.008, 0.24], blanc, TL.plain),
      // le jet de cuir, à la patte droite
      pB('jetN', 'legFR', [0, -0.085, 0], [0.042, 0.02, 0.042], rgbf('#7a5030'), TL.leather),
      pB('jet', 'legFR', [0.014, -0.09, 0.012], [0.012, 0.1, 0.012], rgbf('#7a5030'), TL.leather, { o: [0, -0.05, 0], r0: [0.4, 0, 0.25] }),
    ]);
    for (const n of ['wingL', 'wingR']) { const q = rr.part(n); q.s = [0.56, 0.025, 0.28]; q.o = [n === 'wingL' ? -0.28 : 0.28, 0, 0]; q.hide = true; }
    rr.part('blancheV').hide = true;
    rr.bp = 'corbeau';
    return rr;
  },

  // ------------------------------------------------------------------ Hermeline
  p_renarde: () => {
    const c = rgbf('#b8622c'), sombre = rgbf('#2a1e18'), gris = rgbf('#a09890'), blanc = rgbf('#ece4d8');
    const head = [0.2, 0.18, 0.2];
    const r = quadRig({ col: c, body: [0.25, 0.25, 0.62], bodyY: 0.4, leg: [0.07, 0.3], legCol: sombre,
      neck: [0, 0.1], head, face: TL.foxF, snout: [0.1, 0.08, 0.13, -0.04], snoutCol: gris, ears: [0.065, 0.11, 0.03], tail: [0.13, 0.13, 0.48], tailCol: c });
    const rr = rigPlus(r, [
      pB('gorgeB', 'body', [0, -0.05, 0.3], [0.2, 0.16, 0.04], blanc),
      pB('bout', 'tail', [0, -0.065, -0.47], [0.135, 0.135, 0.06], blanc),
      // la patte blessée : le bout pâle, sans doigts
      pB('moignon', 'legFL', [0, -0.27, 0.004], [0.076, 0.06, 0.076], rgbf('#c8a898'), TL.skin),
      // l'oreille droite fendue : une seconde pointe, de travers
      pB('earR2', 'earR', [0.028, 0, 0], [0.026, 0.075, 0.03], c, TL.fur, { o: [0, 0.035, 0], r0: [0, 0, -0.45] }),
    ]);
    const ed = rr.part('earR'); ed.s = [0.034, 0.11, 0.03]; ed.o = [-0.012, 0.055, 0];
    rr.bp = 'renarde';
    return rr;
  },

  // ------------------------------------------------------------------ l'Écornée
  p_chevre: () => {
    const c = rgbf('#2e2a26'), blanc = rgbf('#e8e2d6'), corne = rgbf('#8a7a5a');
    // (tête : de z 0 à 0,31, de y −0,105 à 0,105, x ±0,09)
    const r = quadRig({ col: c, body: [0.38, 0.42, 0.82], bodyY: 0.76, bodyTex: TL.hair, leg: [0.085, 0.54], hoof: true, dark: [0.12, 0.1, 0.08], legCol: blanc,
      neck: [0, 0.15], neckS: [0.16, 0.38, 0.19], neckO: [0, 0.17, 0.04], headP: [0, 0.34, 0.04], head: [0.18, 0.21, 0.31], face: TL.deerF, headCol: c,
      ears: [0.1, 0.04, 0.05], tail: [0.06, 0.12, 0.05] });
    const rr = rigPlus(r, [
      // le poil long qui pend sous le ventre
      pB('jupe', 'body', [0, -0.22, 0], [0.4, 0.12, 0.72], v3.scale(c, 0.85), TL.hair),
      pB('raieG', 'head', [-0.045, 0.01, 0.313], [0.035, 0.19, 0.008], blanc, TL.fur),
      pB('raieD', 'head', [0.045, 0.01, 0.313], [0.035, 0.19, 0.008], blanc, TL.fur),
      pB('barbe', 'head', [0, -0.08, 0.27], [0.06, 0.18, 0.05], blanc, TL.hair, { o: [0, -0.06, 0] }),
      // la corne cassée (gauche) et l'autre, longue et recourbée
      pB('corneG', 'head', [-0.05, 0.11, 0.06], [0.04, 0.08, 0.04], corne, TL.bone, { o: [0, 0.03, 0], r0: [-0.5, 0, -0.15] }),
      pB('corneD', 'head', [0.05, 0.11, 0.06], [0.04, 0.22, 0.04], corne, TL.bone, { o: [0, 0.1, 0], r0: [-0.75, 0, 0.15] }),
      pB('corneD2', 'corneD', [0, 0.21, 0], [0.032, 0.16, 0.032], corne, TL.bone, { o: [0, 0.07, 0], r0: [-0.6, 0, 0] }),
      // le collier de cuir rouge, la sonnaille
      pB('collier', 'neck', [0, 0.06, 0.04], [0.2, 0.05, 0.23], rgbf('#8a2a20'), TL.leather),
      pB('sonnaille', 'neck', [0, 0.03, 0.16], [0.09, 0.12, 0.07], rgbf('#9a7a3a'), TL.gold, { o: [0, -0.05, 0] }),
    ]);
    rr.bp = 'chevre';
    return rr;
  },

  // ------------------------------------------------------------------ la Vieille
  p_carpe: () => {
    const { P, add } = rigParts();
    const or = rgbf('#b8862e'), bronze = rgbf('#8a6a2a'), mousse = rgbf('#4e6a2c'), ventre = rgbf('#e0c890');
    add('body', null, [0, 0, 0], [0.26, 0.34, 0.62], [0, 0, 0], or, TL.scales);
    add('ventre', 'body', [0, -0.13, 0.04], [0.22, 0.08, 0.5], [0, 0, 0], ventre, TL.scales);
    add('mousse', 'body', [0, 0.17, -0.02], [0.17, 0.035, 0.52], [0, 0, 0], mousse, TL.leaves);
    add('dorsale', 'body', [0, 0.2, -0.08], [0.025, 0.12, 0.34], [0, 0.04, 0], bronze, TL.scales);
    add('neck', 'body', [0, 0, 0.31], null);
    add('head', 'neck', [0, 0, 0], [0.22, 0.26, 0.22], [0, -0.01, 0.1], or, TL.scales);
    add('bouche', 'head', [0, -0.07, 0.215], [0.08, 0.06, 0.04], rgbf('#c89a5a'), TL.skin);
    add('anneau', 'head', [0, -0.11, 0.23], [0.06, 0.045, 0.014], rgbf('#f0c040'), TL.gold);
    for (const s of [-1, 1]) {
      add(s < 0 ? 'barbL' : 'barbR', 'head', [s * 0.04, -0.08, 0.22], [0.01, 0.01, 0.1], bronze, TL.plain, { o: [0, 0, 0.04], r0: [0.4, s * 0.4, 0] });
      add(s < 0 ? 'oeilL' : 'oeilR', 'head', [s * 0.112, 0.04, 0.12], [0.008, 0.045, 0.045], s < 0 ? [0.08, 0.06, 0.04] : rgbf('#c8c4b0'), TL.plain);
      add(s < 0 ? 'pectL' : 'pectR', 'body', [s * 0.13, -0.08, 0.2], [0.012, 0.08, 0.12], bronze, TL.scales, { r0: [0, s * 0.5, s * 0.5] });
    }
    add('tail', 'body', [0, 0.02, -0.31], [0.05, 0.12, 0.12], [0, 0, -0.06], or, TL.scales);
    add('nageoire', 'tail', [0, 0, -0.14], [0.02, 0.3, 0.12], [0, 0, -0.04], bronze, TL.scales);
    const r = new Rig(P); r.kind = 'fish'; r.cfg = {}; r.bp = 'carpe';
    return r;
  },

  // ------------------------------------------------------------------ Bayard
  p_cheval: () => {
    const c = rgbf('#d6d2ca'), crin = rgbf('#9a948a'), bois = rgbf('#8a6a40');
    const r = quadRig({ col: c, body: [0.74, 0.82, 1.72], bodyY: 1.38, bodyTex: TL.wool, leg: [0.21, 1.0], hoof: true, dark: [0.18, 0.16, 0.14], legTex: TL.fur,
      neck: [0, 0.24], neckS: [0.36, 0.84, 0.44], neckO: [0, 0.36, 0.06], headP: [0, 0.76, 0.12], head: [0.32, 0.34, 0.66], face: TL.horseF,
      ears: [0.08, 0.13, 0.06], tail: [0.14, 0.86, 0.14], tailCol: crin, snout: [0.28, 0.24, 0.1, -0.06], snoutCol: rgbf('#c8a8a0') });
    const u = [
      pB('mane', 'neck', [0, 0.4, -0.16], [0.1, 0.86, 0.16], crin, TL.hair),
      // le collier de trait : le bourrelet de cuir et les deux attelles de bois, au pied de l'encolure
      pB('collier', 'neck', [0, 0.1, 0.06], [0.44, 0.16, 0.52], rgbf('#4a3020'), TL.leather),
      pB('attelleG', 'neck', [-0.235, 0.16, 0.12], [0.05, 0.46, 0.08], bois, TL.wood, { o: [0, 0.12, 0] }),
      pB('attelleD', 'neck', [0.235, 0.16, 0.12], [0.05, 0.46, 0.08], bois, TL.wood, { o: [0, 0.12, 0] }),
      pB('anneauG', 'neck', [-0.26, 0.2, 0.18], [0.04, 0.06, 0.06], rgbf('#5a5a5a'), TL.iron),
      pB('anneauD', 'neck', [0.26, 0.2, 0.18], [0.04, 0.06, 0.06], rgbf('#5a5a5a'), TL.iron),
    ];
    // les fanons : de longs poils blancs sur les sabots
    for (const n of ['legFL', 'legFR', 'legBL', 'legBR']) u.push(pB('fanon' + n, n, [0, -0.86, 0], [0.27, 0.2, 0.27], rgbf('#eeeae2'), TL.hair));
    const rr = rigPlus(r, u);
    rr.bp = 'cheval';
    return rr;
  },
});
// le chicot où se perche la hulotte, au pied du chêne (dessiné à part : il reste quand elle s'en va) ; h : sa hauteur
function bpChicot(E, h) {
  E.bx(0, 0, 0, 0.26, h, 0.26, rgbf('#5a4a3a'), TL.bark);
  E.bx(0.02, h - 0.04, 0, 0.22, 0.1, 0.24, rgbf('#4a3a2c'), TL.bark, 0.3);
  E.box(0.2, h - 0.03, 0.02, 0.4, 0.07, 0.07, rgbf('#5a4a3a'), TL.bark, 0, 0, 0.35);
  E.box(-0.08, h * 0.55, -0.05, 0.05, 0.32, 0.05, rgbf('#4a3a2c'), TL.bark, 0.6, 0, -0.7);
}
