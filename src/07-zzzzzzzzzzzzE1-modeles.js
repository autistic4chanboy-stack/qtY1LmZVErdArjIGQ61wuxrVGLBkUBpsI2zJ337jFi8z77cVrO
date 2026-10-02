// ============================================================================
//  LES BÊTES DES PRÉS, DE LA FERME ET DE LA VILLE (agent E1) : les modèles
//  En boîtes, comme les autres (l'avant regarde +z). Des familles à réglages :
//  e1_oiseau (rapaces, chouettes, corvidés, passereaux, oiseaux des prés :
//  ailes repliées au repos, déployées en vol), e1_quad (belette, putois,
//  fouine, campagnol, lérot, rats), e1_serpent (couleuvre d'Esculape),
//  e1_crapaud (alyte), e1_insecte (hanneton, sauterelle, frelon, grillon),
//  e1_papillon (machaon, grand paon de nuit), e1_epeire, e1_escargot.
//  Chaque rig garde ses réglages (r.e1o) ; sa pose est e1Pose (voir la fin :
//  poseBird, poseQuad, poseSnake sont emballées pour les rigs « e1 »).
//  Et les LIEUX (nid de frelons, toile, nid d'hirondelle, nid de freux) :
//  E1_LIEUX_MODELES, dessinés par 11-zzzzE1-betes.js avec PE.
// ============================================================================
const E1C = (h) => rgbf(h);

// ---------------------------------------------------------------- les oiseaux
// o : body [l, h, L], bodyY, dos, ventre (couleur ou rien), ventreS (taille relative), head, headCol, face, beak, beakCol,
//     crochet (bec crochu), cire (couleur de la cire), tail, tailCol, tailUp, bande (barre de la queue), fourche (filets),
//     wing [envergure d'une aile, épaisseur, largeur], wingCol, wingTip, dessous (le dessous des ailes), pliCol, pliL,
//     leg [l, h], legCol, neck, neckCol, neckR, droit (le corps se redresse au repos), plus : parties en plus
function e1Oiseau(o) {
  const { P, add } = rigParts();
  const [bw, bh, bl] = o.body, dos = o.dos;
  add('body', null, [0, o.bodyY, 0], o.body, [0, 0, 0], dos, o.bodyTex ?? TL.fur);
  if (o.ventre) { const k = o.ventreS || 0.62; add('ventre', 'body', [0, -bh * (1 - k) / 2 - 0.002, bl * 0.07], [bw * 1.06, bh * k, bl * 0.9], [0, 0, 0], o.ventre, o.ventreTex ?? TL.fur); }
  if (o.neck) add('neckB', 'body', [0, bh * 0.3, bl * 0.4], o.neck, [0, o.neck[1] / 2, 0], o.neckCol || dos, TL.fur, { r0: o.neckR || [0, 0, 0] });
  add('neck', o.neck ? 'neckB' : 'body', o.neck ? [0, o.neck[1], 0] : [0, bh * 0.34, bl * 0.44], null);
  const hd = o.head;
  add('head', 'neck', [0, 0, 0], hd, [0, hd[1] / 2, hd[2] * 0.2], o.headCol || dos, tx(o.headTex ?? TL.fur, o.face ?? TL.henF));
  const bk = o.beak;
  add('beak', 'head', [0, hd[1] * (o.beakY ?? 0.42), hd[2] * 0.68], bk, [0, 0, bk[2] / 2], o.beakCol, TL.plain);
  if (o.crochet) add('crochet', 'beak', [0, 0, bk[2]], [bk[0] * 0.8, bk[1] * 1.2, bk[1] * 0.7], [0, -bk[1] * 0.4, 0], o.beakCol, TL.plain);
  if (o.cire) add('cire', 'beak', [0, bk[1] * 0.2, 0.002], [bk[0] * 1.15, bk[1] * 0.6, bk[2] * 0.3], [0, 0, 0], o.cire, TL.plain);
  const tl = o.tail;
  add('tail', 'body', [0, bh * 0.1, -bl / 2], tl, [0, 0, -tl[2] / 2], o.tailCol || dos, TL.fur, { r0: [o.tailUp || 0, 0, 0] });
  if (o.bande) add('bande', 'tail', [0, 0, -tl[2] * 0.82], [tl[0] * 1.04, tl[1] * 1.4, tl[2] * 0.15], [0, 0, 0], o.bande, TL.plain);
  if (o.fourche) for (const s of [-1, 1]) add('filet' + s, 'tail', [s * tl[0] * 0.38, 0, -tl[2] * 0.9], [tl[0] * 0.22, tl[1], o.fourche], [0, 0, -o.fourche / 2], o.tailCol || dos, TL.fur, { r0: [0, -s * 0.14, 0] });
  // ailes repliées (au repos) : deux planches le long des flancs
  const pl = o.pliL || 0.95, pc = o.pliCol || o.wingCol || dos;
  for (const s of [-1, 1]) add(s < 0 ? 'pliL' : 'pliR', 'body', [s * (bw / 2 + 0.003), bh * 0.12, bl * 0.12], [Math.max(0.006, bw * 0.12), bh * 0.66, bl * pl], [0, 0, -bl * pl * 0.32], pc, TL.fur);
  if (o.pliTip) for (const s of [-1, 1]) add(s < 0 ? 'pliLb' : 'pliRb', s < 0 ? 'pliL' : 'pliR', [0, 0, -bl * pl * 0.8], [Math.max(0.006, bw * 0.12) * 1.04, bh * 0.4, bl * pl * 0.3], [0, 0.004, 0], o.pliTip, TL.fur);
  // ailes déployées (en vol), pivot à l'épaule ; le bout et le dessous à part
  const [sp, th, ch] = o.wing;
  const W = [], R = ['pliL', 'pliR'].concat(o.pliTip ? ['pliLb', 'pliRb'] : []);
  for (const s of [-1, 1]) {
    const n = s < 0 ? 'wingL' : 'wingR';
    add(n, 'body', [s * bw * 0.45, bh * 0.22, bl * 0.12], [sp, th, ch], [s * sp / 2, 0, -ch * 0.18], o.wingCol || dos, TL.fur, { hide: true }); W.push(n);
    if (o.wingTip) { add(n + 'b', n, [s * sp * 0.66, 0.0015, 0], [sp * 0.36, th * 1.15, ch * 0.82], [s * sp * 0.17, 0, -ch * 0.24], o.wingTip, TL.fur, { hide: true }); W.push(n + 'b'); }
    if (o.dessous) { add(n + 'd', n, [0, -th * 0.6, 0], [sp * 0.94, th * 0.5, ch * 0.9], [s * sp * 0.47, 0, -ch * 0.18], o.dessous, TL.fur, { hide: true }); W.push(n + 'd'); }
    if (o.miroir) { add(n + 'm', n, [s * sp * 0.25, 0.002, 0], [sp * 0.3, th * 1.1, ch * 0.5], [s * sp * 0.1, 0, -ch * 0.3], o.miroir, TL.fur, { hide: true }); W.push(n + 'm'); }
  }
  const lg = o.leg || [0.01, 0.04];
  for (const s of [-1, 1]) add(s < 0 ? 'legFL' : 'legFR', 'body', [s * bw * 0.2, -bh / 2 + 0.004, bl * 0.04], [lg[0], lg[1], lg[0] * 1.2], [0, -lg[1] / 2, 0], o.legCol || E1C('#8a7a60'), TL.plain);
  if (o.cuisses) for (const s of [-1, 1]) add('cuisse' + s, 'body', [s * bw * 0.22, -bh * 0.42, bl * 0.02], [bw * 0.32, bh * 0.36, bw * 0.4], [0, -bh * 0.1, 0], o.cuisses, TL.fur);
  for (const x of o.plus || []) add(x.name, x.parent, x.p, x.s, x.o || [0, 0, 0], x.col, x.tex ?? TL.fur, x.extra);
  const r = new Rig(P); r.kind = 'bird'; r.e1P = 'oiseau'; r.e1o = o; r.e1W = W; r.e1R = R;
  return r;
}
// des yeux (une boîte claire et une pupille), sur la tête
const e1Yeux = (hd, col, k, y, z, sx) => {
  const u = [];
  void z;
  for (const s of [-1, 1]) {
    u.push({ name: 'oeil' + s, parent: 'head', p: [s * (sx ?? hd[0] * 0.3), hd[1] * (y ?? 0.55), hd[2] * 0.7 + 0.002], s: [hd[0] * 0.22 * (k || 1), hd[1] * 0.24 * (k || 1), 0.004], col, tex: TL.plain });
    u.push({ name: 'pupille' + s, parent: 'oeil' + s, p: [0, 0, 0.0025], s: [hd[0] * 0.1 * (k || 1), hd[1] * 0.12 * (k || 1), 0.003], col: [0.04, 0.03, 0.03], tex: TL.plain });
  }
  return u;
};
// quelques taches claires ou sombres posées sur une partie
const e1Taches = (parent, n, w, h, l, col, seed, y) => {
  const u = [], rnd = mulberry32(seed);
  for (let k = 0; k < n; k++) u.push({ name: parent + 't' + k, parent, p: [(rnd() - 0.5) * w * 0.8, (y ?? h / 2) + 0.001, (rnd() - 0.5) * l * 0.8], s: [w * 0.12, 0.003, l * 0.08], col, tex: TL.plain });
  return u;
};

Object.assign(ANIMAL_RIGS, {
  // ---- les rapaces : crécerelle (mâle, femelle), buse (trois robes), pèlerin
  e1_crecerelle: (v) => {
    const male = (v | 0) % 2 === 0, roux = E1C('#b0603a'), gris = E1C('#7e8696');
    const body = [0.085, 0.09, 0.16], head = [0.052, 0.052, 0.058];
    return e1Oiseau({
      body, bodyY: 0.125, dos: roux, ventre: E1C('#e4cca4'), ventreTex: TL.stripes, head, headCol: male ? gris : E1C('#a8643e'), beak: [0.014, 0.014, 0.018], beakCol: E1C('#4a5060'), crochet: true, cire: E1C('#e8c040'),
      tail: [0.05, 0.012, 0.15], tailCol: male ? gris : E1C('#a86a44'), bande: [0.1, 0.09, 0.1], wing: [0.3, 0.012, 0.095], wingCol: roux, wingTip: E1C('#2a2420'), dessous: E1C('#e8dcc4'),
      pliTip: E1C('#2a2420'), leg: [0.011, 0.05], legCol: E1C('#e8c040'), droit: -0.9, batF: 15, batA: 0.75,
      plus: [...e1Taches('body', 7, body[0], body[1], body[2], [0.15, 0.1, 0.08], 31), ...e1Yeux(head, [0.06, 0.05, 0.05], 1.3, 0.56, 0.6),
        { name: 'moustL', parent: 'head', p: [-head[0] * 0.5 - 0.001, head[1] * 0.32, head[2] * 0.42], s: [0.003, head[1] * 0.42, head[2] * 0.16], col: E1C('#2e2a2a'), tex: TL.plain },
        { name: 'moustR', parent: 'head', p: [head[0] * 0.5 + 0.001, head[1] * 0.32, head[2] * 0.42], s: [0.003, head[1] * 0.42, head[2] * 0.16], col: E1C('#2e2a2a'), tex: TL.plain }],
    });
  },
  e1_buse: (v) => {
    const robes = [['#5a4232', '#c8b498'], ['#3e2e24', '#8a7058'], ['#8a6a4a', '#ece0cc']], [cd, cv] = robes[(v | 0) % 3];
    const body = [0.15, 0.15, 0.26], head = [0.1, 0.095, 0.1];
    return e1Oiseau({
      body, bodyY: 0.2, dos: E1C(cd), ventre: E1C(cv), ventreTex: TL.stripes, ventreS: 0.7, head, headCol: E1C(cd), beak: [0.022, 0.022, 0.026], beakCol: E1C('#3a3a3e'), crochet: true, cire: E1C('#e8c860'),
      tail: [0.1, 0.014, 0.17], tailCol: v3.scale(E1C(cd), 1.25), bande: v3.scale(E1C(cd), 0.6), wing: [0.5, 0.016, 0.21], wingCol: E1C(cd), wingTip: E1C('#1e1a18'), dessous: E1C(cv),
      leg: [0.016, 0.07], legCol: E1C('#e8c860'), droit: -0.85, dievre: -0.14, batF: 9, batA: 0.55,
      plus: [...e1Yeux(head, [0.5, 0.36, 0.16], 1.2, 0.58, 0.6), { name: 'plastron', parent: 'body', p: [0, -0.01, body[2] * 0.36], s: [body[0] * 0.9, body[1] * 0.3, 0.02], col: E1C(cv), tex: TL.fur }],
    });
  },
  e1_pelerin: () => {
    const body = [0.13, 0.13, 0.22], head = [0.085, 0.08, 0.085], ardoise = E1C('#4a5262');
    return e1Oiseau({
      body, bodyY: 0.18, dos: ardoise, ventre: E1C('#e6e0d2'), ventreTex: TL.stripes, ventreS: 0.7, head, headCol: E1C('#22262e'), beak: [0.018, 0.018, 0.02], beakCol: E1C('#5a6070'), crochet: true, cire: E1C('#e8c040'),
      tail: [0.08, 0.014, 0.12], tailCol: ardoise, bande: E1C('#2a2e36'), wing: [0.42, 0.014, 0.14], wingCol: ardoise, wingTip: E1C('#2a2e36'), dessous: E1C('#c8c4bc'),
      pliTip: E1C('#2a2e36'), leg: [0.014, 0.06], legCol: E1C('#e8c040'), droit: -0.9, batF: 13, batA: 0.7,
      plus: [...e1Yeux(head, [0.08, 0.06, 0.05], 1.4, 0.56, 0.62),
        { name: 'joueL', parent: 'head', p: [-head[0] * 0.5 - 0.001, head[1] * 0.3, head[2] * 0.25], s: [0.004, head[1] * 0.42, head[2] * 0.38], col: E1C('#f2eee6'), tex: TL.plain },
        { name: 'joueR', parent: 'head', p: [head[0] * 0.5 + 0.001, head[1] * 0.3, head[2] * 0.25], s: [0.004, head[1] * 0.42, head[2] * 0.38], col: E1C('#f2eee6'), tex: TL.plain },
        { name: 'gorge', parent: 'body', p: [0, body[1] * 0.1, body[2] * 0.47], s: [body[0] * 0.7, body[1] * 0.45, 0.012], col: E1C('#f2eee6'), tex: TL.fur }],
    });
  },
  // ---- les chouettes : chevêche, petit-duc (le corps debout)
  e1_cheveche: () => {
    const body = [0.12, 0.15, 0.11], head = [0.11, 0.085, 0.09], brun = E1C('#7a5a40');
    return e1Oiseau({
      body, bodyY: 0.115, dos: brun, ventre: E1C('#d8c8a8'), ventreTex: TL.stripes, ventreS: 0.75, head, headCol: brun, face: TL.catF, beak: [0.016, 0.016, 0.012], beakCol: E1C('#d8d0a0'), beakY: 0.3,
      tail: [0.06, 0.012, 0.04], tailUp: 0.4, wing: [0.24, 0.012, 0.1], wingCol: brun, dessous: E1C('#d8c8a8'), leg: [0.014, 0.05], legCol: E1C('#e0d6c0'), chouette: true, batF: 12, batA: 0.8,
      plus: [...e1Taches('body', 8, body[0], body[1], body[2], [0.92, 0.88, 0.8], 41), ...e1Taches('head', 6, head[0], head[1], head[2], [0.92, 0.88, 0.8], 42),
        { name: 'disque', parent: 'head', p: [0, head[1] * 0.42, head[2] * 0.7 + 0.001], s: [head[0] * 0.92, head[1] * 0.66, 0.003], col: E1C('#b09a7c'), tex: TL.fur },
        ...e1Yeux(head, [0.95, 0.82, 0.2], 1.6, 0.48, 0.55, head[0] * 0.24),
        { name: 'sourcils', parent: 'head', p: [0, head[1] * 0.72, head[2] * 0.7 + 0.004], s: [head[0] * 0.86, head[1] * 0.12, 0.006], col: E1C('#f0ece0'), tex: TL.plain },
        { name: 'menton', parent: 'head', p: [0, head[1] * 0.12, head[2] * 0.7 + 0.004], s: [head[0] * 0.5, head[1] * 0.1, 0.006], col: E1C('#f0ece0'), tex: TL.plain }],
    });
  },
  e1_petit_duc: () => {
    const body = [0.085, 0.13, 0.08], head = [0.075, 0.07, 0.07], gris = E1C('#7a7266');
    return e1Oiseau({
      body, bodyY: 0.1, dos: gris, bodyTex: TL.bark, ventre: E1C('#9a9286'), ventreTex: TL.bark, ventreS: 0.8, head, headCol: gris, headTex: TL.bark, face: TL.catF, beak: [0.01, 0.012, 0.008], beakCol: E1C('#3a3634'), beakY: 0.32,
      tail: [0.045, 0.01, 0.035], tailUp: 0.3, wing: [0.2, 0.01, 0.075], wingCol: gris, dessous: E1C('#b0a898'), leg: [0.01, 0.03], legCol: E1C('#8a8070'), chouette: true, batF: 13, batA: 0.8,
      plus: [{ name: 'disque', parent: 'head', p: [0, head[1] * 0.45, head[2] * 0.7 + 0.001], s: [head[0] * 0.9, head[1] * 0.7, 0.003], col: E1C('#9a9082'), tex: TL.bark },
        ...e1Yeux(head, [0.95, 0.78, 0.15], 1.5, 0.5, 0.55, head[0] * 0.24),
        { name: 'aigretteL', parent: 'head', p: [-head[0] * 0.32, head[1], -0.005], s: [0.012, 0.028, 0.012], o: [0, 0.012, 0], col: gris, tex: TL.bark, r0: [0.2, 0, 0.25] },
        { name: 'aigretteR', parent: 'head', p: [head[0] * 0.32, head[1], -0.005], s: [0.012, 0.028, 0.012], o: [0, 0.012, 0], col: gris, tex: TL.bark, r0: [0.2, 0, -0.25] }],
    });
  },
  // ---- les corvidés : choucas, freux
  e1_choucas: () => {
    const body = [0.1, 0.1, 0.19], head = [0.078, 0.078, 0.082], noir = E1C('#18181c');
    return e1Oiseau({
      body, bodyY: 0.12, dos: noir, head, headCol: noir, face: TL.crowF, beak: [0.018, 0.016, 0.03], beakCol: E1C('#121214'),
      tail: [0.07, 0.014, 0.11], wing: [0.25, 0.014, 0.11], wingCol: noir, leg: [0.012, 0.05], legCol: E1C('#121214'), batF: 11,
      plus: [{ name: 'nuque', parent: 'head', p: [0, head[1] * 0.5, -head[2] * 0.02], s: [head[0] * 1.08, head[1] * 0.8, head[2] * 0.62], col: E1C('#8a8c94'), tex: TL.fur },
        ...e1Yeux(head, [0.92, 0.92, 0.88], 1.1, 0.6, 0.6)],
    });
  },
  e1_freux: () => {
    const body = [0.13, 0.13, 0.26], head = [0.098, 0.098, 0.11], noir = E1C('#1c1822');
    return e1Oiseau({
      body, bodyY: 0.17, dos: noir, head, headCol: noir, face: TL.crowF, beak: [0.026, 0.024, 0.07], beakCol: E1C('#8a8682'), tail: [0.09, 0.016, 0.15],
      wing: [0.36, 0.016, 0.16], wingCol: E1C('#221c2a'), wingTip: E1C('#141018'), leg: [0.016, 0.07], legCol: E1C('#141214'), cuisses: E1C('#1c1822'), batF: 8, batA: 0.65,
      plus: [{ name: 'face', parent: 'head', p: [0, head[1] * 0.38, head[2] * 0.7 + 0.004], s: [head[0] * 0.78, head[1] * 0.42, 0.01], col: E1C('#c8c2b8'), tex: TL.skin },
        { name: 'faceL', parent: 'head', p: [-head[0] * 0.5 - 0.001, head[1] * 0.38, head[2] * 0.56], s: [0.004, head[1] * 0.36, head[2] * 0.26], col: E1C('#c8c2b8'), tex: TL.skin },
        { name: 'faceR', parent: 'head', p: [head[0] * 0.5 + 0.001, head[1] * 0.38, head[2] * 0.56], s: [0.004, head[1] * 0.36, head[2] * 0.26], col: E1C('#c8c2b8'), tex: TL.skin }],
    });
  },
  // ---- les passereaux : bergeronnette, étourneau, hirondelle de fenêtre
  e1_bergeronnette: () => {
    const body = [0.052, 0.052, 0.095], head = [0.044, 0.044, 0.048];
    return e1Oiseau({
      body, bodyY: 0.06, dos: E1C('#8a8e94'), ventre: E1C('#f2f2ee'), head, headCol: E1C('#f2f2ee'), beak: [0.007, 0.007, 0.016], beakCol: E1C('#1a1a1a'),
      tail: [0.026, 0.006, 0.105], tailCol: E1C('#1a1a1c'), wing: [0.12, 0.006, 0.05], wingCol: E1C('#2a2a2e'), pliCol: E1C('#3a3a3e'), leg: [0.006, 0.035], legCol: E1C('#1a1a1a'), batF: 18,
      plus: [{ name: 'calotte', parent: 'head', p: [0, head[1] * 0.92, -head[2] * 0.05], s: [head[0] * 1.04, head[1] * 0.25, head[2] * 0.8], col: E1C('#1a1a1c'), tex: TL.fur },
        { name: 'bavette', parent: 'body', p: [0, body[1] * 0.2, body[2] * 0.47], s: [body[0] * 0.8, body[1] * 0.5, 0.008], col: E1C('#1a1a1c'), tex: TL.fur },
        { name: 'bordL', parent: 'tail', p: [-0.0135, 0.001, 0], s: [0.005, 0.007, 0.1], o: [0, 0, -0.05], col: E1C('#f2f2ee'), tex: TL.plain },
        { name: 'bordR', parent: 'tail', p: [0.0135, 0.001, 0], s: [0.005, 0.007, 0.1], o: [0, 0, -0.05], col: E1C('#f2f2ee'), tex: TL.plain }],
    });
  },
  e1_etourneau: (v) => {
    const body = [0.07, 0.07, 0.115], head = [0.05, 0.05, 0.055], noir = E1C('#1e2422');
    return e1Oiseau({
      body, bodyY: 0.075, dos: noir, bodyTex: TL.scales, head, headCol: E1C('#22281e'), headTex: TL.scales, beak: [0.011, 0.01, 0.034], beakCol: (v | 0) % 3 ? E1C('#e8c030') : E1C('#4a4440'),
      tail: [0.04, 0.01, 0.045], wing: [0.15, 0.01, 0.065], wingCol: E1C('#2a2a26'), leg: [0.008, 0.035], legCol: E1C('#9a6a5a'), batF: 20,
      plus: e1Taches('body', 9, body[0], body[1], body[2], [0.85, 0.85, 0.78], 51 + (v | 0)),
    });
  },
  e1_hirondelle_f: () => {
    const body = [0.042, 0.042, 0.085], head = [0.038, 0.036, 0.038], bleu = E1C('#1a2242');
    return e1Oiseau({
      body, bodyY: 0.04, dos: bleu, ventre: E1C('#f4f4f0'), ventreS: 0.7, head, headCol: bleu, beak: [0.006, 0.005, 0.008], beakCol: E1C('#121212'),
      tail: [0.034, 0.005, 0.035], tailCol: bleu, fourche: 0.025, wing: [0.14, 0.006, 0.042], wingCol: E1C('#141a32'), pliL: 1.25, leg: [0.006, 0.012], legCol: E1C('#f2f2ee'), batF: 22, batA: 0.7,
      plus: [{ name: 'croupion', parent: 'body', p: [0, body[1] * 0.5, -body[2] * 0.36], s: [body[0] * 0.9, 0.006, body[2] * 0.3], col: E1C('#f4f4f0'), tex: TL.plain }],
    });
  },
  // ---- les oiseaux des prés : caille, vanneau, outarde
  e1_caille: () => {
    const body = [0.075, 0.068, 0.11], head = [0.042, 0.042, 0.048];
    return e1Oiseau({
      body, bodyY: 0.05, dos: E1C('#8a6a44'), ventre: E1C('#d8c098'), head, headCol: E1C('#6a5034'), beak: [0.008, 0.008, 0.012], beakCol: E1C('#6a6258'),
      tail: [0.035, 0.01, 0.025], wing: [0.12, 0.01, 0.06], wingCol: E1C('#8a6a44'), leg: [0.007, 0.022], legCol: E1C('#d8a888'), batF: 22, batA: 0.9,
      plus: [...e1Taches('body', 10, body[0], body[1], body[2], [0.3, 0.22, 0.14], 61), ...e1Taches('body', 6, body[0], body[1], body[2], [0.86, 0.78, 0.6], 62),
        { name: 'raie', parent: 'head', p: [0, head[1], 0], s: [head[0] * 0.25, 0.004, head[2] * 0.95], col: E1C('#e8d8b0'), tex: TL.plain },
        { name: 'sourcilL', parent: 'head', p: [-head[0] * 0.5, head[1] * 0.62, head[2] * 0.1], s: [0.003, head[1] * 0.14, head[2] * 0.8], col: E1C('#e8d8b0'), tex: TL.plain },
        { name: 'sourcilR', parent: 'head', p: [head[0] * 0.5, head[1] * 0.62, head[2] * 0.1], s: [0.003, head[1] * 0.14, head[2] * 0.8], col: E1C('#e8d8b0'), tex: TL.plain }],
    });
  },
  e1_vanneau: () => {
    const body = [0.105, 0.1, 0.17], head = [0.058, 0.058, 0.066];
    return e1Oiseau({
      body, bodyY: 0.165, dos: E1C('#2a4a3c'), ventre: E1C('#f2f2ec'), ventreS: 0.55, head, headCol: E1C('#f2f2ec'), beak: [0.01, 0.01, 0.022], beakCol: E1C('#1a1a1a'),
      tail: [0.06, 0.012, 0.06], tailCol: E1C('#f2f2ec'), bande: E1C('#141414'), wing: [0.3, 0.012, 0.14], wingCol: E1C('#1e2a26'), wingTip: E1C('#f2f2ec'), dessous: E1C('#f2f2ec'),
      pliCol: E1C('#2a4a3c'), leg: [0.01, 0.11], legCol: E1C('#c88a7a'), batF: 7, batA: 0.95,
      plus: [{ name: 'calotte', parent: 'head', p: [0, head[1] * 0.85, 0], s: [head[0] * 1.05, head[1] * 0.36, head[2] * 1.02], col: E1C('#141414'), tex: TL.fur },
        { name: 'huppe', parent: 'head', p: [0, head[1] * 1.0, -head[2] * 0.3], s: [0.006, 0.006, 0.075], o: [0, 0, -0.035], col: E1C('#141414'), tex: TL.plain, r0: [-0.55, 0, 0] },
        { name: 'plastron', parent: 'body', p: [0, body[1] * 0.18, body[2] * 0.45], s: [body[0] * 0.95, body[1] * 0.5, 0.02], col: E1C('#141414'), tex: TL.fur },
        { name: 'gorge', parent: 'head', p: [0, head[1] * 0.16, head[2] * 0.22], s: [head[0] * 1.04, head[1] * 0.3, head[2] * 0.98], col: E1C('#141414'), tex: TL.fur }],
    });
  },
  e1_outarde: (v) => {
    const male = (v | 0) % 2 === 0, body = [0.16, 0.16, 0.3], head = [0.06, 0.06, 0.08], chaume = E1C('#b0905a');
    const plus = [];
    if (male) for (const [y, c] of [[0.02, '#f2f2ec'], [0.075, '#141414'], [0.1, '#f2f2ec']]) plus.push({ name: 'col' + y, parent: 'neckB', p: [0, y, 0], s: [0.058, 0.016, 0.058], col: E1C(c), tex: TL.plain });
    return e1Oiseau({
      body, bodyY: 0.33, dos: chaume, ventre: E1C('#f2f0e8'), ventreS: 0.5, head, headCol: male ? E1C('#7a7c80') : chaume, beak: [0.014, 0.012, 0.024], beakCol: E1C('#6a6258'),
      neck: [0.05, 0.14, 0.05], neckCol: male ? E1C('#1e1e1e') : chaume, neckR: [0.25, 0, 0],
      tail: [0.08, 0.014, 0.08], tailCol: chaume, wing: [0.38, 0.014, 0.17], wingCol: E1C('#f2f0e8'), wingTip: E1C('#1a1a1a'), dessous: E1C('#f2f0e8'),
      pliCol: chaume, leg: [0.016, 0.2], legCol: E1C('#c8b890'), batF: 9, batA: 0.6, plus,
    });
  },
});

// ---------------------------------------------------------------- les quadrupèdes (sur quadRig)
// o : réglages de quadRig, et : ventre (couleur), masque, bavette, bout (touffe de la queue), plus
function e1Quad(o) {
  const r = quadRig(o), u = [];
  const [bw, bh, bl] = o.body;
  if (o.ventre) u.push({ name: 'ventre', parent: 'body', p: [0, -bh * 0.32, 0.01], s: [bw * 0.9, bh * 0.4, bl * 0.82], col: o.ventre, tex: TL.fur });
  if (o.bavette) u.push({ name: 'bavette', parent: 'body', p: [0, -bh * 0.05, bl * 0.47], s: [bw * 0.62, bh * 0.62, 0.012], col: o.bavette, tex: TL.fur });
  if (o.masque) u.push({ name: 'masque', parent: 'head', p: [0, o.head[1] * 0.12, o.head[2] * 0.56], s: [o.head[0] * 1.04, o.head[1] * 0.34, o.head[2] * 0.4], col: o.masque, tex: TL.fur });
  if (o.museau) u.push({ name: 'museau', parent: 'head', p: [0, -o.head[1] * 0.25, o.head[2] * 0.9], s: [o.head[0] * 0.62, o.head[1] * 0.4, o.head[2] * 0.3], col: o.museau, tex: TL.skin });
  if (o.bout && o.tail) u.push({ name: 'bout', parent: 'tail', p: [0, -o.tail[1] / 2, -o.tail[2] * 0.85], s: [o.tail[0] * 2.1, o.tail[1] * 2.1, o.tail[2] * 0.3], col: o.bout, tex: TL.fur });
  if (o.bout2 && o.tail) u.push({ name: 'bout2', parent: 'tail', p: [0, -o.tail[1] / 2, -o.tail[2] * 1.02], s: [o.tail[0] * 1.8, o.tail[1] * 1.8, o.tail[2] * 0.12], col: o.bout2, tex: TL.fur });
  if (o.yeux) for (const s of [-1, 1]) u.push({ name: 'oeil' + s, parent: 'head', p: [s * o.head[0] * 0.36, o.head[1] * 0.18, o.head[2] * 0.82], s: [o.head[0] * 0.16, o.head[1] * 0.16, 0.004], col: o.yeux, tex: TL.plain });
  for (const x of o.plus || []) u.push(x);
  const rr = rigPlus(r, u); rr.e1P = 'quad'; rr.e1o = o;
  return rr;
}
Object.assign(ANIMAL_RIGS, {
  e1_belette: () => e1Quad({ col: E1C('#8a5228'), body: [0.04, 0.04, 0.15], bodyY: 0.042, leg: [0.013, 0.028], legIn: 0.012, neck: [0, 0.012], neckS: [0.026, 0.03, 0.04], neckO: [0, 0.01, 0.01], headP: [0, 0.022, 0.03],
    head: [0.034, 0.028, 0.042], face: TL.foxF, ears: [0.012, 0.012, 0.005], tail: [0.011, 0.011, 0.045], ventre: E1C('#f2ece0'), yeux: [0.04, 0.03, 0.03] }),
  e1_putois: () => e1Quad({ col: E1C('#2a2018'), body: [0.075, 0.075, 0.3], bodyY: 0.075, leg: [0.026, 0.055], legIn: 0.02, legCol: E1C('#181210'), neck: [0, 0.02], head: [0.06, 0.052, 0.07], face: TL.foxF,
    headCol: E1C('#2a2018'), ears: [0.018, 0.016, 0.006], earCol: E1C('#e8e2d4'), tail: [0.032, 0.032, 0.14], tailCol: E1C('#181210'), masque: E1C('#1a1410'), museau: E1C('#ece6d8'), yeux: [0.05, 0.04, 0.04],
    plus: [{ name: 'flanc', parent: 'body', p: [0, 0.005, -0.02], s: [0.078, 0.05, 0.2], col: E1C('#7a6038'), tex: TL.fur }, { name: 'front', parent: 'head', p: [0, 0.032, 0.03], s: [0.05, 0.012, 0.014], col: E1C('#e8e2d4'), tex: TL.plain }] }),
  e1_fouine: () => e1Quad({ col: E1C('#5a4232'), body: [0.08, 0.085, 0.3], bodyY: 0.09, leg: [0.028, 0.07], legIn: 0.02, legCol: E1C('#3a2a20'), neck: [0, 0.025], head: [0.064, 0.058, 0.07], face: TL.foxF,
    ears: [0.02, 0.022, 0.008], earCol: E1C('#d8ccc0'), tail: [0.05, 0.05, 0.24], tailCol: E1C('#3e2e24'), museau: E1C('#b8a898'), yeux: [0.03, 0.02, 0.02],
    plus: [{ name: 'bavL', parent: 'body', p: [-0.016, -0.008, 0.15], s: [0.03, 0.06, 0.012], col: E1C('#f2ece4'), tex: TL.fur, r0: [0, 0, 0.3] }, { name: 'bavR', parent: 'body', p: [0.016, -0.008, 0.15], s: [0.03, 0.06, 0.012], col: E1C('#f2ece4'), tex: TL.fur, r0: [0, 0, -0.3] }] }),
  e1_campagnol_champs: () => e1Quad({ col: E1C('#7a6a50'), body: [0.034, 0.032, 0.07], bodyY: 0.028, leg: [0.01, 0.014], legIn: 0.01, neck: [0, 0.006], head: [0.03, 0.026, 0.03], face: TL.rabbitF,
    ears: [0.01, 0.008, 0.004], tail: [0.005, 0.005, 0.026], ventre: E1C('#a89880') }),
  e1_lerot: () => e1Quad({ col: E1C('#8a7a6c'), body: [0.048, 0.046, 0.11], bodyY: 0.04, leg: [0.012, 0.022], legIn: 0.012, neck: [0, 0.01], head: [0.044, 0.04, 0.05], face: TL.rabbitF,
    ears: [0.02, 0.024, 0.006], earCol: E1C('#c8a8a0'), tail: [0.008, 0.008, 0.11], tailCol: E1C('#8a7a6c'), ventre: E1C('#f2eee6'), masque: E1C('#141210'), bout: E1C('#141210'), bout2: E1C('#f2eee6') }),
  e1_rat_noir: () => e1Quad({ col: E1C('#38383e'), body: [0.05, 0.048, 0.14], bodyY: 0.04, leg: [0.012, 0.024], legIn: 0.014, legCol: E1C('#9a8a8a'), neck: [0, 0.01], head: [0.038, 0.034, 0.056], face: TL.rabbitF,
    ears: [0.022, 0.026, 0.004], earCol: E1C('#8a7a7a'), tail: [0.006, 0.006, 0.19], tailCol: E1C('#6a5c5c'), museau: E1C('#7a6a6a') }),
  e1_surmulot: () => e1Quad({ col: E1C('#6a5a48'), body: [0.064, 0.058, 0.18], bodyY: 0.05, leg: [0.015, 0.028], legIn: 0.016, legCol: E1C('#b8a090'), neck: [0, 0.012], head: [0.05, 0.044, 0.06], face: TL.rabbitF,
    ears: [0.014, 0.014, 0.005], earCol: E1C('#a89080'), tail: [0.011, 0.011, 0.16], tailCol: E1C('#9a8070'), ventre: E1C('#a89a88'), museau: E1C('#8a7868') }),
});

// ---------------------------------------------------------------- la couleuvre d'Esculape (une chaîne d'anneaux)
ANIMAL_RIGS.e1_esculape = (v) => {
  const { P, add } = rigParts();
  const c = E1C('#857a50'), c2 = E1C('#766c46'), ventre = E1C('#d8c890'), N = 12, L = 0.13;
  add('body', null, [0, 0.022, 0], [0.034, 0.028, L], [0, 0, 0], c, TL.scales);
  add('head', 'body', [0, 0.003, L / 2], [0.034, 0.022, 0.05], [0, 0, 0.022], E1C('#5a5434'), TL.scales);
  if ((v | 0) % 3 === 0) for (const s of [-1, 1]) add('tache' + s, 'head', [s * 0.016, 0.002, -0.004], [0.004, 0.012, 0.016], [0, 0, 0], E1C('#e8d060'), TL.plain); // (les jeunes ont deux taches jaunes à la nuque)
  let par = 'body';
  for (let k = 0; k < N; k++) {
    const n = 'seg' + k, w = 0.034 - k * 0.0022;
    add(n, par, [0, 0, k ? -L : -L / 2], [w, 0.026 - k * 0.0015, L], [0, 0, -L / 2], k % 2 ? c : c2, TL.scales);
    add('v' + k, n, [0, -0.011 + k * 0.0005, 0], [w * 0.9, 0.004, L * 0.96], [0, 0, -L / 2], ventre, TL.plain);
    par = n;
  }
  const r = new Rig(P); r.kind = 'snake'; r.e1P = 'serpent'; r.e1o = { N, L };
  return r;
};

// ---------------------------------------------------------------- l'alyte accoucheur (le mâle porte ses œufs)
ANIMAL_RIGS.e1_alyte = (v) => {
  const { P, add } = rigParts();
  const c = E1C('#7a7a64'), d = E1C('#5e5e4c');
  add('body', null, [0, 0.016, 0], [0.034, 0.02, 0.04], [0, 0, 0], c, TL.scales);
  add('neck', 'body', [0, 0.004, 0.018], null);
  add('head', 'neck', [0, 0, 0], [0.03, 0.016, 0.02], [0, 0, 0.01], c, tx(TL.scales, TL.henF));
  for (const s of [-1, 1]) {
    add('oeil' + s, 'head', [s * 0.009, 0.009, 0.012], [0.008, 0.007, 0.008], [0, 0, 0], E1C('#d8a030'), TL.plain);
    add('pup' + s, 'oeil' + s, [0, 0, 0.004], [0.005, 0.002, 0.002], [0, 0, 0], [0.05, 0.04, 0.03], TL.plain);
  }
  add('legFL', 'body', [-0.016, -0.006, 0.014], [0.006, 0.012, 0.006], [0, -0.006, 0], d, TL.scales);
  add('legFR', 'body', [0.016, -0.006, 0.014], [0.006, 0.012, 0.006], [0, -0.006, 0], d, TL.scales);
  add('legBL', 'body', [-0.018, -0.004, -0.014], [0.012, 0.008, 0.022], [0, -0.003, 0], d, TL.scales);
  add('legBR', 'body', [0.018, -0.004, -0.014], [0.012, 0.008, 0.022], [0, -0.003, 0], d, TL.scales);
  for (const [x, y, z] of [[-0.009, 0.011, 0.004], [0.008, 0.011, -0.006], [-0.002, 0.011, -0.012], [0.01, 0.011, 0.01]]) add('verrue' + x, 'body', [x, y, z], [0.005, 0.003, 0.005], [0, 0, 0], E1C('#b07a3a'), TL.plain);
  if ((v | 0) % 2 === 0) { // les œufs : un chapelet jaune autour des pattes de derrière
    for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 1.6 - 0.5; add('oeuf' + k, 'body', [Math.cos(a) * 0.02, -0.004, -0.018 + Math.sin(a) * 0.01], [0.0055, 0.0055, 0.0055], [0, 0, 0], E1C('#e8c840'), TL.plain); }
  }
  const r = new Rig(P); r.kind = 'quad'; r.cfg = {}; r.e1P = 'crapaud'; r.e1o = {};
  return r;
};

// ---------------------------------------------------------------- les insectes (agrandis d'un tiers : on doit les voir)
// hanneton, frelon, grillon, sauterelle : corps, tête, antennes, pattes ; élytres et ailes (montrées en vol)
function e1Insecte(o) {
  const { P, add } = rigParts();
  const k = o.k || 1, S = (a) => a.map((x) => x * k);
  add('body', null, [0, o.y * k, 0], S(o.corps), [0, 0, 0], o.col, o.tex ?? TL.scales);
  if (o.bandes) for (let i = 0; i < o.bandes; i++) add('bande' + i, 'body', [0, 0, S(o.corps)[2] * (-0.35 + i * 0.25)], S([o.corps[0] * 1.06, o.corps[1] * 1.06, o.corps[2] * 0.09]), [0, 0, 0], o.bandeCol, TL.plain);
  add('thorax', 'body', [0, S(o.corps)[1] * 0.1, S(o.corps)[2] * 0.5], S(o.thorax), [0, 0, S(o.thorax)[2] * 0.45], o.thoraxCol || o.col, TL.scales);
  add('neck', 'thorax', [0, 0, S(o.thorax)[2] * 0.9], null);
  add('head', 'neck', [0, 0, 0], S(o.tete), [0, 0, S(o.tete)[2] * 0.4], o.teteCol || o.thoraxCol || o.col, TL.plain);
  for (const s of [-1, 1]) add('antenne' + s, 'head', [s * S(o.tete)[0] * 0.25, S(o.tete)[1] * 0.3, S(o.tete)[2] * 0.6], S([0.0016, 0.0016, o.antenne]), [0, 0, S([o.antenne])[0] / 2], o.antenneCol || [0.12, 0.1, 0.08], TL.plain, { r0: [o.antenneR ?? -0.5, s * 0.35, 0] });
  if (o.eventail) for (const s of [-1, 1]) add('eventail' + s, 'antenne' + s, [0, 0, S([o.antenne])[0]], S([0.006, 0.002, 0.006]), [0, 0, 0], o.antenneCol || [0.3, 0.2, 0.1], TL.plain);
  const L = o.patte || 0.012;
  for (const [n, sx, sz] of [['legFL', -1, 0.35], ['legFR', 1, 0.35], ['legML', -1, 0.1], ['legMR', 1, 0.1], ['legBL', -1, -0.2], ['legBR', 1, -0.2]]) add(n, 'body', [sx * S(o.corps)[0] * 0.4, -S(o.corps)[1] * 0.3, S(o.corps)[2] * sz], S([L, 0.0016, 0.0016]), [sx * S([L])[0] * 0.5, -0.001, 0], o.patteCol || [0.12, 0.1, 0.08], TL.plain, { r0: [0, 0, sx * -0.5] });
  if (o.saut) for (const s of [-1, 1]) { // les grandes pattes sauteuses (sauterelle, grillon)
    add('cuisse' + s, 'body', [s * S(o.corps)[0] * 0.5, 0, -S(o.corps)[2] * 0.1], S([0.0035, 0.006, o.saut]), [0, 0, -S([o.saut])[0] * 0.5], o.col, TL.scales, { r0: [-0.45, 0, 0] });
    add('tibia' + s, 'cuisse' + s, [0, 0, -S([o.saut])[0]], S([0.002, 0.002, o.saut * 0.95]), [0, 0, S([o.saut])[0] * 0.47], o.patteCol || o.col, TL.plain, { r0: [0.95, 0, 0] });
  }
  if (o.elytres) for (const s of [-1, 1]) add('elytre' + s, 'body', [s * S(o.corps)[0] * 0.25, S(o.corps)[1] * 0.5, S(o.corps)[2] * 0.42], S([o.corps[0] * 0.52, 0.002, o.corps[2] * 0.92]), [0, 0.001, -S(o.corps)[2] * 0.46], o.elytres, TL.plain);
  if (o.ailes) for (const s of [-1, 1]) add(s < 0 ? 'wingL' : 'wingR', 'thorax', [s * S(o.thorax)[0] * 0.4, S(o.thorax)[1] * 0.5, 0], S([o.ailes[0], 0.0015, o.ailes[1]]), [s * S([o.ailes[0]])[0] / 2, 0, -S([o.ailes[1]])[0] * 0.3], o.aileCol || [0.85, 0.82, 0.74], TL.plain, { hide: !o.ailesVues });
  if (o.dard) add('dard', 'body', [0, 0, -S(o.corps)[2] * 0.5], S(o.dard), [0, 0, -S(o.dard)[2] * 0.5], o.dardCol || [0.2, 0.2, 0.18], TL.plain, { r0: [o.dardR || 0, 0, 0] });
  for (const x of o.plus || []) add(x.name, x.parent, x.p, x.s, x.o || [0, 0, 0], x.col, x.tex ?? TL.plain, x.extra);
  const r = new Rig(P); r.kind = 'bird'; r.e1P = 'insecte'; r.e1o = o;
  return r;
}
Object.assign(ANIMAL_RIGS, {
  e1_hanneton: () => e1Insecte({ k: 1.35, y: 0.008, corps: [0.014, 0.01, 0.022], col: E1C('#2a2018'), thorax: [0.012, 0.009, 0.008], thoraxCol: E1C('#1e1814'), tete: [0.008, 0.006, 0.005],
    antenne: 0.007, eventail: true, antenneCol: E1C('#6a4020'), elytres: E1C('#9a5a2a'), ailes: [0.024, 0.014], aileCol: E1C('#b8a080'), patte: 0.01,
    plus: [{ name: 'tri1', parent: 'body', p: [-0.0098, -0.0005, -0.004], s: [0.001, 0.005, 0.016], col: E1C('#f0ece0') }, { name: 'tri2', parent: 'body', p: [0.0098, -0.0005, -0.004], s: [0.001, 0.005, 0.016], col: E1C('#f0ece0') },
      { name: 'pointe', parent: 'body', p: [0, 0, -0.016], s: [0.004, 0.003, 0.008], col: E1C('#3a2a1e') }] }),
  e1_frelon: () => e1Insecte({ k: 1.7, y: 0.006, corps: [0.011, 0.011, 0.02], col: E1C('#d8b030'), bandes: 3, bandeCol: E1C('#4a2a14'), thorax: [0.011, 0.01, 0.011], thoraxCol: E1C('#8a3a1a'), tete: [0.01, 0.009, 0.007],
    teteCol: E1C('#d89a30'), antenne: 0.008, antenneR: -0.9, ailes: [0.022, 0.009], aileCol: E1C('#c8bca0'), ailesVues: true, dard: [0.002, 0.002, 0.004], patte: 0.009, patteCol: E1C('#8a4a1a') }),
  e1_grillon_foyer: () => e1Insecte({ k: 1.5, y: 0.004, corps: [0.008, 0.006, 0.016], col: E1C('#b89860'), thorax: [0.008, 0.006, 0.005], tete: [0.007, 0.006, 0.004], teteCol: E1C('#9a7a48'),
    antenne: 0.026, antenneR: -0.15, saut: 0.01, patte: 0.007, elytres: E1C('#a88a54'), dard: [0.0012, 0.0012, 0.008], dardR: -0.2,
    plus: [{ name: 'cerqueL', parent: 'body', p: [-0.003, 0.001, -0.012], s: [0.001, 0.001, 0.008], o: [0, 0, -0.004], col: E1C('#8a6a40'), extra: { r0: [0, -0.4, 0] } }, { name: 'cerqueR', parent: 'body', p: [0.003, 0.001, -0.012], s: [0.001, 0.001, 0.008], o: [0, 0, -0.004], col: E1C('#8a6a40'), extra: { r0: [0, 0.4, 0] } }] }),
  e1_sauterelle: (v) => e1Insecte({ k: 1.25, y: 0.012, corps: [0.011, 0.011, 0.04], col: E1C('#5a9a3a'), tex: TL.fur, thorax: [0.01, 0.011, 0.01], tete: [0.009, 0.012, 0.008], teteCol: E1C('#6aa848'),
    antenne: 0.07, antenneR: -0.35, antenneCol: E1C('#7a9a4a'), saut: 0.03, patte: 0.012, patteCol: E1C('#5a8a34'), elytres: E1C('#4a8a30'),
    dard: (v | 0) % 2 ? [0.0025, 0.004, 0.022] : null, dardR: 0.35, dardCol: E1C('#4a7a2a') }),
});

// ---------------------------------------------------------------- les papillons : machaon, grand paon de nuit
function e1Papillon(o) {
  const { P, add } = rigParts();
  const k = o.k || 1, S = (a) => a.map((x) => x * k);
  add('body', null, [0, 0, 0], S([0.01, 0.01, 0.042]), [0, 0, 0], o.corps, TL.fur);
  add('neck', 'body', [0, 0, S([0.02])[0]], null);
  add('head', 'neck', [0, 0, 0], S([0.01, 0.01, 0.01]), [0, 0, S([0.004])[0]], o.corps, TL.fur);
  for (const s of [-1, 1]) add('antenne' + s, 'head', [s * 0.003 * k, 0.004 * k, 0.005 * k], S([o.plumeuse ? 0.006 : 0.0018, 0.0018, 0.026]), [0, 0, S([0.013])[0]], o.antenneCol || [0.08, 0.06, 0.05], TL.plain, { r0: [-0.6, s * 0.35, 0] });
  const [fw, fl] = o.avant, [hw, hl] = o.arriere;
  add('wingL', 'body', [-0.005 * k, 0.002 * k, 0.004 * k], S([fw, 0.0025, fl]), [-S([fw])[0] / 2, 0, 0.004 * k], o.aile, TL.plain);
  add('wingR', 'body', [0.005 * k, 0.002 * k, 0.004 * k], S([fw, 0.0025, fl]), [S([fw])[0] / 2, 0, 0.004 * k], o.aile, TL.plain);
  add('basL', 'body', [-0.005 * k, 0.001 * k, -0.01 * k], S([hw, 0.0025, hl]), [-S([hw])[0] / 2, 0, -S([hl])[0] * 0.28], o.aile2 || o.aile, TL.plain);
  add('basR', 'body', [0.005 * k, 0.001 * k, -0.01 * k], S([hw, 0.0025, hl]), [S([hw])[0] / 2, 0, -S([hl])[0] * 0.28], o.aile2 || o.aile, TL.plain);
  for (const [nom, par, x, z, sx, sz, col] of o.motifs || []) add(nom, par, [x * k, 0.0014 * k, z * k], S([sx, 0.002, sz]), [0, 0, 0], col, TL.plain);
  const r = new Rig(P); r.kind = 'bird'; r.e1P = 'papillon'; r.e1o = o;
  return r;
}
ANIMAL_RIGS.e1_machaon = () => {
  const J = E1C('#f0d848'), N = E1C('#1a1814'), B = E1C('#3a5ac8'), Ro = E1C('#d83a20');
  return e1Papillon({ k: 1.1, corps: E1C('#2a2418'), aile: J, avant: [0.06, 0.042], arriere: [0.042, 0.04], motifs: [
    // les nervures et la bordure noire des ailes de devant, puis celles de derrière (bleu, l'œil rouge, la queue)
    ['nL1', 'wingL', -0.012, 0.008, 0.004, 0.036, N], ['nL2', 'wingL', -0.032, 0.006, 0.004, 0.034, N], ['bL', 'wingL', -0.054, 0.004, 0.012, 0.042, N],
    ['nR1', 'wingR', 0.012, 0.008, 0.004, 0.036, N], ['nR2', 'wingR', 0.032, 0.006, 0.004, 0.034, N], ['bR', 'wingR', 0.054, 0.004, 0.012, 0.042, N],
    ['hbL', 'basL', -0.03, -0.014, 0.022, 0.012, N], ['hbluL', 'basL', -0.03, -0.014, 0.018, 0.005, B], ['oeilL', 'basL', -0.008, -0.022, 0.008, 0.008, Ro],
    ['hbR', 'basR', 0.03, -0.014, 0.022, 0.012, N], ['hbluR', 'basR', 0.03, -0.014, 0.018, 0.005, B], ['oeilR', 'basR', 0.008, -0.022, 0.008, 0.008, Ro],
    ['queueL', 'basL', -0.028, -0.034, 0.004, 0.018, N], ['queueR', 'basR', 0.028, -0.034, 0.004, 0.018, N]] });
};
ANIMAL_RIGS.e1_grand_paon = () => {
  const G = E1C('#857464'), G2 = E1C('#6a5a4c'), N = E1C('#141210'), Bl = E1C('#ece6dc'), Ro = E1C('#a84a2a'), Cl = E1C('#c8b8a8');
  const oeil = (n, par, x, z) => [[n + 'r', par, x, z, 0.022, 0.022, Ro], [n + 'n', par, x, z, 0.015, 0.015, N], [n + 'b', par, x + 0.002, z + 0.003, 0.005, 0.006, Bl]];
  return e1Papillon({ k: 1.25, corps: E1C('#5a4a3e'), plumeuse: true, aile: G, aile2: G2, avant: [0.072, 0.05], arriere: [0.058, 0.046], motifs: [
    ...oeil('oL', 'wingL', -0.04, 0.006), ...oeil('oR', 'wingR', 0.04, 0.006), ...oeil('pL', 'basL', -0.03, -0.012), ...oeil('pR', 'basR', 0.03, -0.012),
    ['lL', 'wingL', -0.066, 0.004, 0.008, 0.048, Cl], ['lR', 'wingR', 0.066, 0.004, 0.008, 0.048, Cl], ['mL', 'basL', -0.052, -0.012, 0.008, 0.04, Cl], ['mR', 'basR', 0.052, -0.012, 0.008, 0.04, Cl]] });
};

// ---------------------------------------------------------------- l'épeire (pendue dans sa toile, tête en bas : voir la pose)
ANIMAL_RIGS.e1_epeire = () => {
  const { P, add } = rigParts();
  const k = 1.4, b = E1C('#8a6a40'), d = E1C('#5a4228');
  add('body', null, [0, 0, 0], [0.012 * k, 0.011 * k, 0.014 * k], [0, 0, -0.004 * k], b, TL.fur);
  add('croix1', 'body', [0, 0.0057 * k, -0.004 * k], [0.0022 * k, 0.001, 0.011 * k], [0, 0, 0], E1C('#f2ece0'), TL.plain);
  add('croix2', 'body', [0, 0.0057 * k, -0.001 * k], [0.008 * k, 0.001, 0.0022 * k], [0, 0, 0], E1C('#f2ece0'), TL.plain);
  add('neck', 'body', [0, 0, 0.004 * k], null);
  add('head', 'neck', [0, 0, 0], [0.007 * k, 0.005 * k, 0.007 * k], [0, 0, 0.003 * k], d, TL.plain);
  for (let i = 0; i < 4; i++) for (const s of [-1, 1]) {
    const a = (i - 1.5) * 0.45;
    add('patte' + s + i, 'head', [s * 0.003 * k, 0, 0.002 * k], [0.013 * k, 0.0014, 0.0014], [s * 0.0065 * k, 0, 0], d, TL.plain, { r0: [0, s * a, s * -0.35] });
  }
  const r = new Rig(P); r.kind = 'bird'; r.e1P = 'epeire'; r.e1o = {};
  return r;
};

// ---------------------------------------------------------------- l'escargot (coquille en spirale de trois boîtes)
ANIMAL_RIGS.e1_escargot = (v) => {
  const { P, add } = rigParts();
  const blond = E1C(['#c8a060', '#b89058', '#d0aa70'][(v | 0) % 3]), pied = E1C('#a89880');
  add('body', null, [0, 0.008, 0], [0.018, 0.012, 0.05], [0, 0, 0.004], pied, TL.skin);
  add('coquille', 'body', [0, 0.012, -0.006], [0.024, 0.03, 0.03], [0, 0.012, 0], blond, TL.stripes, { r0: [0.5, 0, 0] });
  add('spire1', 'coquille', [0, 0.024, 0.004], [0.026, 0.018, 0.02], [0, 0, 0], v3.scale(blond, 0.88), TL.stripes, { r0: [0.6, 0, 0] });
  add('spire2', 'spire1', [0, 0.008, 0.006], [0.02, 0.01, 0.012], [0, 0, 0], v3.scale(blond, 0.78), TL.stripes, { r0: [0.6, 0, 0] });
  add('neck', 'body', [0, 0.004, 0.026], null);
  add('head', 'neck', [0, 0, 0], [0.012, 0.01, 0.012], [0, 0, 0.004], pied, TL.skin);
  for (const s of [-1, 1]) {
    add('corne' + s, 'head', [s * 0.004, 0.004, 0.006], [0.0022, 0.0022, 0.02], [0, 0, 0.01], pied, TL.skin, { r0: [-0.9, s * 0.25, 0] });
    add('oeil' + s, 'corne' + s, [0, 0, 0.02], [0.0035, 0.0035, 0.0035], [0, 0, 0], E1C('#3a3028'), TL.plain);
    add('petite' + s, 'head', [s * 0.004, -0.002, 0.009], [0.0016, 0.0016, 0.006], [0, 0, 0.003], pied, TL.skin, { r0: [0.3, s * 0.4, 0] });
  }
  const r = new Rig(P); r.kind = 'quad'; r.cfg = {}; r.e1P = 'escargot'; r.e1o = {};
  return r;
};

// ============================================================================
//  LES POSES (rigs « e1 » seulement ; les autres passent à la pose d'avant)
// ============================================================================
// ce que la bête fait passe par son rig (r.ent : la bête ; voir 11-zzzzE1-betes.js) : ent.volM (bat, plane, surplace,
// pique, glisse), ent.dresse, ent.hoche, ent.fige, ent.rentre, ent.mince, ent.grimpe, ent.pend…
function e1Pose(rig, st) {
  const e = rig.ent || {}, o = rig.e1o || {}, t = st.t || 0, sd = st.seed || 0;
  switch (rig.e1P) {
    case 'oiseau': {
      const vol = st.fly > 0, M = e.volM || 'bat';
      for (const n of rig.e1W) rig.parts[rig.idx[n]].hide = !vol;
      for (const n of rig.e1R) rig.parts[rig.idx[n]].hide = vol;
      let a = 0, corps = 0;
      if (vol) {
        if (M === 'plane') a = (o.dievre || -0.06) + Math.sin(t * 0.9 + sd) * 0.03;
        else if (M === 'surplace') { a = Math.sin(t * (o.batF || 14) * 1.3 + sd) * 0.45 - 0.1; corps = -0.4; }
        else if (M === 'pique') a = 0.95;
        else if (M === 'glisse') a = Math.sin(t * 2 + sd) * 0.05 - 0.02;
        else a = Math.sin(t * (o.batF || 14) + sd) * (o.batA || 0.8);
        if (M === 'pique') corps = 0.7;
        rig.set('wingL', 0, M === 'pique' ? -0.7 : 0, a); rig.set('wingR', 0, M === 'pique' ? 0.7 : 0, -a);
        for (const s of ['wingLb', 'wingRb']) if (rig.has(s)) rig.set(s, 0, 0, s === 'wingLb' ? -Math.abs(a) * 0.4 : Math.abs(a) * 0.4);
        rig.set('tail', M === 'surplace' ? 0.45 : 0.05, 0, 0);
        rig.set('legFL', 1.3, 0, 0); rig.set('legFR', 1.3, 0, 0);
      } else {
        corps = e.mince ? -1.25 : (o.droit && !st.move) ? o.droit : 0;
        if (o.chouette) corps = e.mince ? -0.3 : -0.08;
        const s = Math.sin(st.phase || 0) * 0.6 * (st.move || 0);
        rig.set('legFL', -corps + s, 0, 0); rig.set('legFR', -corps - s, 0, 0);
        const remue = e.remue ? Math.sin(t * 16 + sd) * 0.45 : 0; // la bergeronnette hoche la queue
        rig.set('tail', (o.tailUp || 0) - corps * 0.6 + remue, 0, 0);
      }
      rig.set('body', corps, 0, 0);
      const peck = st.peck ? Math.max(0, Math.sin(t * 9 + sd)) * 0.9 : 0;
      const hoche = e.hoche ? Math.sin(t * 7) * 0.25 : 0;
      rig.set('neck', (vol ? -corps : -corps * 0.85) + peck + hoche, clamp(st.lookY || 0, -1.5, 1.5), 0);
      if (rig.has('neckB')) rig.set('neckB', (o.neckR ? o.neckR[0] : 0) + (vol ? -0.6 : 0), 0, 0);
      if (e.hoche && rig.has('head')) rig.set('head', 0, 0, Math.sin(t * 3.5) * 0.12);
      return true;
    }
    case 'quad': {
      poseQuad0(rig, st);
      const d = e.dresse || 0, B = rig.parts[rig.idx.body], hl = o.body[2] / 2;
      B.p = d ? [0, o.bodyY + hl * Math.sin(d) * 0.8, -hl * (1 - Math.cos(d))] : B.p0 || (B.p0 = B.p.slice());
      if (!B.p0) B.p0 = [0, o.bodyY, 0];
      if (d) { rig.set('body', -d, 0, 0); rig.set('legBL', d, 0, 0); rig.set('legBR', d, 0, 0); rig.set('legFL', d * 0.6, 0, 0); rig.set('legFR', d * 0.6, 0, 0); rig.set('neck', d * 0.8, clamp(st.lookY || 0, -0.9, 0.9), 0); }
      else rig.set('body', e.grimpe ? -1.2 : 0, 0, 0);
      if (e.nage) { rig.set('body', -0.08, 0, 0); }
      return true;
    }
    case 'serpent': {
      const m = st.move || 0, ph = st.phase || 0, N = o.N;
      const leve = e.grimpe ? -1.3 : 0;
      rig.set('body', leve, 0, 0);
      for (let k = 0; k < N; k++) rig.set('seg' + k, k === 0 ? -leve * 0.8 : 0, Math.sin(ph * 1.4 + k * 0.8) * (0.18 + 0.25 * m) * (e.grimpe ? 0.4 : 1), 0);
      rig.set('head', st.raise ? -0.45 : 0, Math.sin(t * 0.6 + sd) * 0.18, 0);
      return true;
    }
    case 'crapaud': {
      const saut = e.saut > 0 ? Math.sin(Math.PI * clamp(e.saut, 0, 1)) : 0;
      rig.set('legBL', saut * 0.9, 0, 0); rig.set('legBR', saut * 0.9, 0, 0);
      rig.set('body', -0.15 - saut * 0.3 + (e.chante ? Math.sin(t * 20) * 0.04 : 0), 0, 0);
      rig.set('neck', 0, clamp(st.lookY || 0, -0.6, 0.6), 0);
      return true;
    }
    case 'insecte': {
      const vol = st.fly > 0;
      for (const n of ['wingL', 'wingR']) if (rig.has(n)) rig.parts[rig.idx[n]].hide = !vol && !o.ailesVues;
      for (const n of ['elytre-1', 'elytre1']) if (rig.has(n)) rig.set(n, 0, 0, vol ? (n === 'elytre-1' ? -0.9 : 0.9) : 0);
      if (vol) { const f = Math.sin(t * 90 + sd) * 0.7; rig.set('wingL', 0, 0, f); rig.set('wingR', 0, 0, -f); }
      const m = st.move || 0;
      for (const [n, ph] of [['legFL', 0], ['legFR', 3.1], ['legML', 3.1], ['legMR', 0], ['legBL', 0], ['legBR', 3.1]]) if (rig.has(n)) rig.set(n, 0, Math.sin((st.phase || 0) * 3 + ph) * 0.4 * m, n.endsWith('L') ? 0.5 : -0.5);
      const ant = Math.sin(t * 2.3 + sd) * 0.15;
      if (rig.has('antenne-1')) { rig.set('antenne-1', (o.antenneR ?? -0.5) + ant, -0.35, 0); rig.set('antenne1', (o.antenneR ?? -0.5) - ant, 0.35, 0); }
      rig.set('body', vol ? -0.25 : e.saut > 0 ? -0.35 : 0, 0, 0);
      if (rig.has('cuisse-1')) { const s = e.saut > 0 ? 0.6 : 0; rig.set('cuisse-1', -0.45 + s, 0, 0); rig.set('cuisse1', -0.45 + s, 0, 0); }
      return true;
    }
    case 'papillon': {
      const vol = st.fly > 0, M = e.volM;
      let bat = vol ? (M === 'plane' ? -0.15 + Math.sin(t * 3 + sd) * 0.1 : Math.sin(t * (o.batF || 16) + sd) * 0.95) : -0.55 - Math.sin(t * 2 + sd) * 0.3;
      if (!vol && e.repos !== undefined && e.repos !== null) bat = e.repos;
      rig.set('wingL', 0, 0, bat); rig.set('wingR', 0, 0, -bat);
      rig.set('basL', 0, 0, bat * 0.85); rig.set('basR', 0, 0, -bat * 0.85);
      rig.set('body', e.pend ? -1.4 : 0, 0, 0);
      return true;
    }
    case 'epeire': {
      rig.set('body', e.pend === false ? 0 : -Math.PI / 2, 0, 0);
      const f = e.bouge ? Math.sin(t * 14) * 0.12 : 0;
      for (let i = 0; i < 4; i++) for (const s of [-1, 1]) rig.set('patte' + s + i, 0, s * ((i - 1.5) * 0.45) + f * s, s * -0.35);
      return true;
    }
    case 'escargot': {
      const r = e.rentre > 0;
      for (const n of ['head', 'corne-1', 'corne1', 'oeil-1', 'oeil1', 'petite-1', 'petite1']) rig.parts[rig.idx[n]].hide = r;
      const b = rig.parts[rig.idx.body];
      b.s[2] = r ? 0.02 : 0.05;
      const ond = Math.sin(t * 1.4 + sd) * 0.15;
      rig.set('corne-1', -0.9 + ond, -0.25, 0); rig.set('corne1', -0.9 - ond, 0.25, 0);
      rig.set('body', e.grimpe ? -Math.PI / 2 : 0, 0, 0);
      return true;
    }
  }
  return false;
}
// les poses d'avant (gardées pour les autres bêtes ; poseQuad0 sert aussi aux quadrupèdes « e1 »)
const poseQuad0 = poseQuad;
{
  const _pb = poseBird, _pq = poseQuad, _ps = poseSnake;
  poseBird = function (rig, st) { if (rig.e1P && e1Pose(rig, st)) return; _pb(rig, st); };
  poseQuad = function (rig, st) { if (rig.e1P && rig.e1P !== 'quad' && e1Pose(rig, st)) return; if (rig.e1P === 'quad') { e1Pose(rig, st); return; } _pq(rig, st); };
  poseSnake = function (rig, st) { if (rig.e1P && e1Pose(rig, st)) return; _ps(rig, st); };
}

// ============================================================================
//  LES LIEUX : modèles dessinés avec PE (repère : x, y, z, rotation r)
// ============================================================================
const E1_LIEUX_MODELES = {
  // un nid de frelons : une boule de papier gris-beige, en couches, pendue par le haut ; l'entrée en dessous
  guepier(E, o) {
    const C1 = E1C('#c8b898'), C2 = E1C('#a8987c'), C3 = E1C('#d8ccb0');
    E.box(0, 0.06, 0, 0.05, 0.12, 0.05, E1C('#6a5a44'), TL.bark);
    for (let k = 0; k < 6; k++) { const y = -0.06 - k * 0.07, w = 0.22 + Math.sin(k / 5 * Math.PI) * 0.16 - k * 0.012; E.box(0, y, 0, w, 0.075, w * 0.92, k % 2 ? C1 : C2, TL.paper, k * 0.5); }
    for (let k = 0; k < 5; k++) E.box(Math.sin(k * 2.1) * 0.12, -0.1 - k * 0.07, Math.cos(k * 2.1) * 0.12, 0.08, 0.02, 0.06, C3, TL.paper, k);
    if (o && o.vide) return;
    E.box(0, -0.47, 0, 0.06, 0.02, 0.06, [0.08, 0.06, 0.04], TL.plain);
  },
  // une toile d'épeire, verticale : les rayons et la spirale, en fils de 4 mm ; plus claire au matin (la rosée)
  toile(E, o) {
    const R = o.R || 0.32, col = o.rosee ? [1.25, 1.25, 1.2] : [0.92, 0.92, 0.88], f = 0.0035;
    for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; E.box(Math.cos(a) * R / 2, Math.sin(a) * R / 2, 0, R, f, f, col, TL.plain, 0, 0, a); }
    for (let tour = 1; tour <= 5; tour++) {
      const r = R * tour / 5.4;
      for (let k = 0; k < 12; k++) {
        const a0 = k / 12 * TAU, a1 = (k + 1) / 12 * TAU, x0 = Math.cos(a0) * r, y0 = Math.sin(a0) * r, x1 = Math.cos(a1) * r, y1 = Math.sin(a1) * r;
        E.box((x0 + x1) / 2, (y0 + y1) / 2, 0, Math.hypot(x1 - x0, y1 - y0), f, f, col, TL.plain, 0, 0, Math.atan2(y1 - y0, x1 - x0));
      }
    }
    // les amarres
    for (const [a, l] of [[0.6, 0.35], [2.5, 0.3], [4.4, 0.4]]) E.box(Math.cos(a) * (R + l / 2), Math.sin(a) * (R + l / 2), 0, l, f, f, col, TL.plain, 0, 0, a);
  },
  // un nid d'hirondelle de fenêtre : une coupe de boue collée sous l'avant-toit, l'entrée en haut
  nid_hirondelle(E) {
    const B = E1C('#8a7458'), B2 = E1C('#a08a6a');
    E.box(0, 0, 0, 0.14, 0.09, 0.09, B, TL.soil);
    E.box(0, -0.06, -0.005, 0.1, 0.05, 0.07, B2, TL.soil);
    E.box(0, 0.035, 0.046, 0.06, 0.02, 0.005, [0.06, 0.05, 0.04], TL.plain);
  },
  // un nid de freux : des branches entassées dans la couronne
  nid_freux(E) {
    const B = E1C('#3a2e24'), B2 = E1C('#5a4632');
    E.box(0, 0, 0, 0.6, 0.22, 0.55, B, TL.bark);
    for (let k = 0; k < 5; k++) E.box(Math.cos(k * 1.3) * 0.2, 0.08, Math.sin(k * 1.3) * 0.2, 0.5, 0.04, 0.04, B2, TL.bark, k * 1.3, 0, 0.2);
  },
};
