// ============================================================================
//  LES BÊTES DE LA LANDE, DES HAUTEURS ET DU LAC (agent E2) : les modèles, en
//  boîtes, dans le style des bêtes d'avant (l'avant regarde +z). Des familles
//  à réglages : les rapaces (busard, vautour, gypaète, balbuzard), les perdrix
//  (rouge, bartavelle), les campagnols (des neiges, amphibie), les serpents
//  (péliade, vipérine), les oiseaux nageurs (foulque, harle, cormoran).
//  Les poses propres (ailes repliées, ailes séchées, parade…) : 10-zzzzE2-betes.js.
// ============================================================================
const E2_NOIR = [0.07, 0.07, 0.08];
// ---------------------------------------------------------------- les rapaces (ailes longues ; repliées au sol)
// o : { col, ventre, tete, aile, bout (bout des ailes), queue, bec, patte, corps, ailes [envergure d'une aile, épaisseur,
//       largeur], queueS, cou, extra[] }
function e2Rapace(o) {
  const c = rgbf(o.col), C2 = o.aile ? rgbf(o.aile) : c;
  const B = o.corps, W = o.ailes;
  const patte = o.patte || [B[0] * 0.15, B[1] * 0.6];
  const r = birdParts({ col: c, body: B, bodyY: B[1] * 0.5 + patte[1], neck: o.cou || null, neckR: o.couR || [0, 0, 0], neckCol: o.couCol ? rgbf(o.couCol) : null,
    head: o.tete || [B[0] * 0.55, B[0] * 0.55, B[0] * 0.65], headCol: o.teteCol ? rgbf(o.teteCol) : null, face: TL.crowF,
    beak: o.bec || [B[0] * 0.18, B[0] * 0.2, B[0] * 0.25], beakCol: rgbf(o.becCol || '#3a3632'), tail: o.queueS || [B[0] * 0.7, 0.02, B[2] * 0.55],
    tailCol: o.queue ? rgbf(o.queue) : c, wing: W, wingCol: C2, leg: patte, legCol: rgbf(o.patteCol || '#d8b040') });
  const u = [];
  // le bout des ailes (rémiges) : une autre couleur
  if (o.bout) for (const [n, s] of [['wingL', -1], ['wingR', 1]]) u.push({ name: 'bout' + s, parent: n, p: [s * W[0] * 0.8, 0.001, -0.01], s: [W[0] * 0.38, W[1] * 1.05, W[2] * 0.92], o: [0, 0, 0], col: rgbf(o.bout), tex: TL.fur });
  // le ventre, plus clair
  if (o.ventre) u.push({ name: 'ventre', parent: 'body', p: [0, -B[1] * 0.18, B[2] * 0.06], s: [B[0] * 0.94, B[1] * 0.7, B[2] * 0.8], col: rgbf(o.ventre), tex: TL.stripes });
  // les ailes repliées le long des flancs (le sol) : cachées en vol
  for (const s of [-1, 1]) u.push({ name: 'replie' + s, parent: 'body', p: [s * (B[0] / 2 + 0.012), B[1] * 0.12, -B[2] * 0.12], s: [0.03, B[1] * 0.7, B[2] * 1.05], o: [0, 0, -B[2] * 0.08], col: C2, tex: TL.fur, hide: true });
  for (const x of o.extra || []) u.push(Object.assign({ tex: TL.fur }, x, { col: typeof x.col === 'string' ? rgbf(x.col) : x.col }));
  const rr = rigPlus(r, u);
  rr.e2lent = o.lent || [7, 0.5]; rr.e2Replie = true;
  return rr;
}
// ---------------------------------------------------------------- les perdrix (rouge, bartavelle)
function e2Perdrix(o) {
  const r = birdParts({ col: rgbf(o.dos), body: [0.13, 0.12, 0.2], bodyY: 0.13, head: [0.065, 0.065, 0.075], headCol: rgbf(o.tete), face: TL.henF,
    beak: [0.022, 0.02, 0.028], beakCol: rgbf('#c82a1e'), tail: [0.08, 0.025, 0.06], tailCol: rgbf(o.queue), leg: [0.016, 0.07], legCol: rgbf('#c83a2a') });
  return rigPlus(r, [
    { name: 'gorge', parent: 'head', p: [0, -0.012, 0.03], s: [0.068, 0.035, 0.03], col: rgbf('#f2efe6'), tex: TL.fur },
    { name: 'collier', parent: 'head', p: [0, -0.03, 0.02], s: [0.072, 0.018, 0.045], col: E2_NOIR, tex: o.grive ? TL.spots : TL.fur },
    { name: 'oeil', parent: 'head', p: [0, 0.042, 0.02], s: [0.068, 0.008, 0.016], col: rgbf('#f2efe6'), tex: TL.plain },
    { name: 'poitrine', parent: 'body', p: [0, 0.01, 0.07], s: [0.12, 0.08, 0.06], col: rgbf(o.poitrine), tex: TL.fur },
    { name: 'flancL', parent: 'body', p: [-0.064, -0.01, -0.005], s: [0.012, 0.07, 0.12], col: rgbf(o.flanc), tex: TL.stripes },
    { name: 'flancR', parent: 'body', p: [0.064, -0.01, -0.005], s: [0.012, 0.07, 0.12], col: rgbf(o.flanc), tex: TL.stripes },
  ]);
}
// ---------------------------------------------------------------- les campagnols
function e2Campagnol(o) {
  const r = quadRig({ col: rgbf(o.col), body: o.corps, bodyY: o.corps[1] * 0.85, leg: [o.corps[0] * 0.3, o.corps[1] * 0.45], neck: [0, o.corps[1] * 0.25],
    head: o.tete, face: TL.rabbitF, ears: [o.tete[0] * 0.35, o.tete[1] * 0.3, 0.008], earCol: rgbf(o.oreille || o.col) });
  const u = [{ name: 'ventre', parent: 'body', p: [0, -o.corps[1] * 0.3, 0.005], s: [o.corps[0] * 0.9, o.corps[1] * 0.4, o.corps[2] * 0.85], col: rgbf(o.ventre), tex: TL.fur },
    { name: 'tail', parent: 'body', p: [0, -o.corps[1] * 0.15, -o.corps[2] / 2], s: [0.012, 0.012, o.queue], o: [0, 0, -o.queue / 2], col: v3.scale(rgbf(o.col), 0.85), tex: TL.fur, r0: [0.25, 0, 0] }];
  if (o.moustaches) for (const s of [-1, 1]) u.push({ name: 'moust' + s, parent: 'head', p: [s * o.tete[0] * 0.45, -0.004, o.tete[2] * 0.9], s: [0.05, 0.002, 0.002], o: [s * 0.022, 0, 0], col: [0.92, 0.92, 0.9], tex: TL.plain, r0: [0, s * -0.4, 0] });
  return rigPlus(r, u);
}
// ---------------------------------------------------------------- les serpents (anneaux en chaîne : poseSnake)
function e2Serpent(o) {
  const r = scaleRig(ANIMAL_RIGS.snake(), o.k);
  const a = rgbf(o.clair), b = rgbf(o.sombre), t = rgbf(o.tete);
  for (const q of r.parts) if (q.s) q.col = q.name === 'head' ? t : (/[02468]$/.test(q.name) ? a : v3.scale(a, 0.92));
  const u = [];
  // le zigzag (ou les taches) : une petite boîte sombre, à gauche puis à droite, sur chaque anneau
  for (let k = 0; k < 7; k++) {
    const s = k % 2 ? 1 : -1, n = 'seg' + k, seg = r.part(n);
    u.push({ name: 'zz' + k, parent: n, p: [s * seg.s[0] * 0.18, seg.s[1] * 0.42, -seg.s[2] * 0.5], s: [seg.s[0] * 0.55, seg.s[1] * 0.25, seg.s[2] * 0.55], col: b, tex: TL.scales, r0: [0, s * 0.5, 0] });
  }
  const bd = r.part('body');
  u.push({ name: 'zzb', parent: 'body', p: [0, bd.s[1] * 0.42, 0], s: [bd.s[0] * 0.5, bd.s[1] * 0.25, bd.s[2] * 0.6], col: b, tex: TL.scales, r0: [0, 0.5, 0] });
  if (o.ventre) u.push({ name: 'ventre', parent: 'body', p: [0, -bd.s[1] * 0.42, 0], s: [bd.s[0] * 0.9, bd.s[1] * 0.2, bd.s[2] * 0.9], col: rgbf(o.ventre), tex: TL.plain });
  return rigPlus(r, u);
}
// ---------------------------------------------------------------- les oiseaux nageurs (le corps bas sur l'eau)
function e2Nageur(o) {
  const r = birdParts({ col: rgbf(o.col), body: o.corps, bodyY: o.corps[1] * 0.55, neck: o.cou || null, neckR: o.couR || [0, 0, 0], neckCol: o.couCol ? rgbf(o.couCol) : null,
    head: o.tete, headCol: rgbf(o.teteCol || o.col), face: TL.henF, beak: o.bec, beakCol: rgbf(o.becCol), tail: o.queueS || [o.corps[0] * 0.5, 0.03, 0.06], tailCol: rgbf(o.queue || o.col),
    wing: o.ailes || null, wingCol: rgbf(o.aile || o.col), leg: o.patte || [0.02, 0.04], legCol: rgbf(o.patteCol || '#4a4a40') });
  const u = [];
  for (const x of o.extra || []) u.push(Object.assign({ tex: TL.fur }, x, { col: typeof x.col === 'string' ? rgbf(x.col) : x.col }));
  if (o.ailes) for (const s of [-1, 1]) u.push({ name: 'replie' + s, parent: 'body', p: [s * (o.corps[0] / 2 + 0.008), o.corps[1] * 0.18, -o.corps[2] * 0.05], s: [0.025, o.corps[1] * 0.62, o.corps[2] * 0.9], o: [0, 0, -0.02], col: rgbf(o.aile || o.col), tex: TL.fur, hide: true });
  const rr = rigPlus(r, u);
  if (o.ailes) rr.e2Replie = true;
  if (o.lent) rr.e2lent = o.lent;
  return rr;
}

Object.assign(ANIMAL_RIGS, {
  // ================================================================ la lande
  // le lézard vert : la gorge bleue du mâle (v pair)
  e2_lezard: (v) => {
    const { P, add } = rigParts();
    const c = rgbf('#5aa02a'), c2 = rgbf('#3e7a1e'), male = (v | 0) % 2 === 0;
    add('body', null, [0, 0.02, 0], [0.042, 0.024, 0.12], [0, 0, 0], c, TL.scales);
    add('dos', 'body', [0, 0.012, 0], [0.03, 0.004, 0.11], [0, 0, 0], c2, TL.spots);
    add('neck', 'body', [0, 0.003, 0.06], null);
    add('head', 'neck', [0, 0, 0], [0.032, 0.022, 0.046], [0, 0, 0.022], c, TL.scales);
    add('gorge', 'head', [0, -0.011, 0.02], [0.033, 0.006, 0.03], [0, 0, 0], male ? rgbf('#3a6ad0') : rgbf('#c8d080'), TL.plain);
    for (const [n, sx, sz] of [['legFL', -1, 1], ['legFR', 1, 1], ['legBL', -1, -1], ['legBR', 1, -1]]) add(n, 'body', [sx * 0.022, -0.004, sz * 0.042], [0.03, 0.009, 0.01], [sx * 0.015, -0.005, 0], c2, TL.scales);
    add('tail', 'body', [0, -0.002, -0.06], [0.024, 0.016, 0.12], [0, 0, -0.06], c, TL.scales);
    add('queue2', 'tail', [0, 0, -0.12], [0.014, 0.01, 0.12], [0, 0, -0.06], rgbf('#6a8a3a'), TL.scales);
    const r = new Rig(P); r.kind = 'quad'; r.cfg = {}; return r;
  },
  // le crapaud calamite : la raie jaune ; pattes courtes (il court)
  e2_crapaud: () => {
    const { P, add } = rigParts();
    const c = rgbf('#7a7a4a'), raie = rgbf('#e0d040');
    add('body', null, [0, 0.03, 0], [0.056, 0.03, 0.066], [0, 0, 0], c, TL.spots);
    add('raie', 'body', [0, 0.016, 0], [0.011, 0.003, 0.064], [0, 0, 0], raie, TL.plain);
    add('neck', 'body', [0, 0.004, 0.033], null);
    add('head', 'neck', [0, 0, 0], [0.05, 0.022, 0.032], [0, 0, 0.014], c, TL.spots);
    for (const s of [-1, 1]) add('oeil' + s, 'head', [s * 0.016, 0.012, 0.012], [0.012, 0.01, 0.012], [0, 0, 0], rgbf('#b8c050'), TL.plain);
    for (const [n, sx, sz] of [['legFL', -1, 1], ['legFR', 1, 1], ['legBL', -1, -1], ['legBR', 1, -1]]) add(n, 'body', [sx * 0.026, -0.008, sz * 0.024], [0.014, 0.024, 0.014], [0, -0.01, 0], v3.scale(c, 0.85), TL.spots);
    const r = new Rig(P); r.kind = 'quad'; r.cfg = {}; return r;
  },
  e2_perdrix: () => e2Perdrix({ dos: '#8a7660', tete: '#9a8a76', queue: '#a86a40', poitrine: '#8a96a0', flanc: '#d8c8b0' }),
  // la pie-grièche : le masque noir, la tête grise, le dos roux
  e2_piegrieche: () => rigPlus(birdParts({ col: rgbf('#a0603a'), body: [0.06, 0.06, 0.1], bodyY: 0.075, head: [0.048, 0.046, 0.05], headCol: rgbf('#9aa0a8'), face: TL.henF,
    beak: [0.01, 0.012, 0.016], beakCol: E2_NOIR, tail: [0.026, 0.01, 0.075], tailCol: rgbf('#2a2624'), leg: [0.009, 0.028], legCol: rgbf('#2a2624') }), [
    { name: 'masque', parent: 'head', p: [0, 0.026, 0.02], s: [0.05, 0.01, 0.032], col: E2_NOIR, tex: TL.plain },
    { name: 'poitrine', parent: 'body', p: [0, -0.012, 0.018], s: [0.058, 0.035, 0.07], col: rgbf('#e8c8c0'), tex: TL.fur },
  ]),
  // la huppe : bec long et courbe, huppe orange au bout noir, ailes barrées
  e2_huppe: () => {
    const r = birdParts({ col: rgbf('#d89a60'), body: [0.08, 0.08, 0.15], bodyY: 0.1, head: [0.05, 0.05, 0.058], face: TL.henF, beak: [0.008, 0.008, 0.035], beakCol: rgbf('#2a2420'),
      tail: [0.04, 0.012, 0.09], tailCol: E2_NOIR, wingCol: E2_NOIR, leg: [0.01, 0.04], legCol: rgbf('#4a4440') });
    const W = r.part('wingL');
    return rigPlus(r, [
      { name: 'bec2', parent: 'beak', p: [0, -0.002, 0.017], s: [0.006, 0.006, 0.03], o: [0, 0, 0.014], col: rgbf('#2a2420'), tex: TL.plain, r0: [0.35, 0, 0] },
      { name: 'huppe', parent: 'head', p: [0, 0.05, -0.008], s: [0.012, 0.045, 0.07], o: [0, 0.018, -0.01], col: rgbf('#e8a050'), tex: TL.fur, r0: [-0.5, 0, 0] },
      { name: 'huppeB', parent: 'huppe', p: [0, 0.042, -0.012], s: [0.013, 0.012, 0.07], o: [0, 0, 0], col: E2_NOIR, tex: TL.plain },
      { name: 'barreL', parent: 'wingL', p: [0, 0.005, -0.01], s: [W.s[0] + 0.004, W.s[1] * 0.25, W.s[2] * 0.9], col: [0.95, 0.94, 0.9], tex: TL.stripes },
      { name: 'barreR', parent: 'wingR', p: [0, 0.005, -0.01], s: [W.s[0] + 0.004, W.s[1] * 0.25, W.s[2] * 0.9], col: [0.95, 0.94, 0.9], tex: TL.stripes },
    ]);
  },
  // l'œdicnème : haut sur pattes jaunes, gros yeux jaunes, couleur de sable rayée
  e2_oedicneme: () => {
    const r = birdParts({ col: rgbf('#b0956a'), body: [0.11, 0.11, 0.24], bodyY: 0.24, head: [0.075, 0.07, 0.08], face: TL.henF, beak: [0.016, 0.016, 0.035], beakCol: rgbf('#e0c030'),
      tail: [0.05, 0.015, 0.08], tailCol: rgbf('#8a7050'), wingCol: rgbf('#9a8058'), leg: [0.016, 0.17], legCol: rgbf('#e0c840') });
    for (const q of r.parts) if (q.name === 'body') q.tex = TL.stripes;
    return rigPlus(r, [
      { name: 'oeilL', parent: 'head', p: [-0.032, 0.045, 0.03], s: [0.016, 0.024, 0.024], col: rgbf('#f0d020'), tex: TL.plain },
      { name: 'oeilR', parent: 'head', p: [0.032, 0.045, 0.03], s: [0.016, 0.024, 0.024], col: rgbf('#f0d020'), tex: TL.plain },
      { name: 'pupL', parent: 'oeilL', p: [-0.004, 0, 0.004], s: [0.01, 0.01, 0.012], col: E2_NOIR, tex: TL.plain },
      { name: 'pupR', parent: 'oeilR', p: [0.004, 0, 0.004], s: [0.01, 0.01, 0.012], col: E2_NOIR, tex: TL.plain },
      { name: 'ventre', parent: 'body', p: [0, -0.03, 0.02], s: [0.1, 0.05, 0.16], col: rgbf('#ece4d0'), tex: TL.fur },
      { name: 'barre', parent: 'wingL', p: [0, 0.02, 0.02], s: [0.024, 0.012, 0.1], col: [0.95, 0.94, 0.9], tex: TL.plain },
      { name: 'barre2', parent: 'wingR', p: [0, 0.02, 0.02], s: [0.024, 0.012, 0.1], col: [0.95, 0.94, 0.9], tex: TL.plain },
    ]);
  },
  // le busard Saint-Martin : le mâle gris pâle aux ailes trempées dans l'encre (v pair), la femelle brune au croupion blanc
  e2_busard: (v) => (v | 0) % 2 === 0
    ? e2Rapace({ col: '#c8ccd0', aile: '#b8bec4', bout: '#1a1a1e', ventre: '#f0f0ec', queue: '#a8aeb4', corps: [0.12, 0.1, 0.3], ailes: [0.5, 0.02, 0.17], patteCol: '#e8c030', becCol: '#2a2a2a', lent: [6, 0.4] })
    : e2Rapace({ col: '#8a6a48', aile: '#7a5a3a', bout: '#4a3626', ventre: '#d8c098', queue: '#8a6a48', corps: [0.13, 0.11, 0.32], ailes: [0.52, 0.02, 0.18], patteCol: '#e8c030', becCol: '#2a2a2a', lent: [6, 0.4],
      extra: [{ name: 'croupion', parent: 'body', p: [0, 0.05, -0.15], s: [0.1, 0.02, 0.05], col: '#f4f2ec' }] }),
  // le minotaure : un bousier noir à trois cornes
  e2_minotaure: () => {
    const { P, add } = rigParts();
    const c = rgbf('#18181c'), c2 = rgbf('#2a2a32');
    add('body', null, [0, 0.012, 0], [0.024, 0.014, 0.03], [0, 0, 0], c, TL.metal);
    add('neck', 'body', [0, 0.002, 0.016], null);
    add('head', 'neck', [0, 0, 0], [0.02, 0.012, 0.012], [0, 0, 0.006], c2, TL.metal);
    for (const s of [-1, 1]) add('corne' + s, 'head', [s * 0.007, 0.004, 0.008], [0.003, 0.003, 0.022], [0, 0, 0.011], c2, TL.plain, { r0: [-0.25, s * -0.2, 0] });
    add('corne0', 'head', [0, 0.005, 0.004], [0.003, 0.003, 0.009], [0, 0, 0.004], c2, TL.plain, { r0: [-0.5, 0, 0] });
    for (const [n, sx, sz] of [['legFL', -1, 1], ['legFR', 1, 1], ['legBL', -1, -1], ['legBR', 1, -1]]) add(n, 'body', [sx * 0.012, -0.004, sz * 0.009], [0.016, 0.003, 0.003], [sx * 0.008, -0.004, 0], c, TL.plain);
    const r = new Rig(P); r.kind = 'quad'; r.cfg = {}; return r;
  },
  // la genette : longue et basse, tachée de noir, la queue annelée, les yeux qui luisent
  e2_genette: () => {
    const r = quadRig({ col: rgbf('#b8ae98'), body: [0.12, 0.12, 0.42], bodyY: 0.16, bodyTex: TL.spots, leg: [0.035, 0.12], legCol: rgbf('#5a5248'), legTex: TL.fur, neck: [0, 0.04],
      head: [0.08, 0.075, 0.1], face: TL.foxF, snout: [0.04, 0.035, 0.05, -0.015], snoutCol: rgbf('#d8d0c0'), ears: [0.035, 0.045, 0.012] });
    const u = [];
    let par = 'body';
    for (let k = 0; k < 5; k++) { const n = 'anneau' + k; u.push({ name: n, parent: par, p: k ? [0, 0, -0.085] : [0, 0.03, -0.21], s: [0.04 - k * 0.003, 0.04 - k * 0.003, 0.085], o: [0, 0, -0.042], col: k % 2 ? rgbf('#1e1a18') : rgbf('#c8bea8'), tex: TL.fur, r0: [k ? 0.08 : 0.25, 0, 0] }); par = n; }
    for (const s of [-1, 1]) u.push({ name: 'oeil' + s, parent: 'head', p: [s * 0.022, 0.018, 0.1], s: [0.014, 0.009, 0.006], col: [0.85, 0.9, 0.5], tex: TL.plain, fl: FX_EMIT });
    return rigPlus(r, u);
  },
  // le sphinx tête-de-mort : ailes brunes, ailes de derrière et abdomen jaunes, la tête de mort sur le thorax
  e2_sphinx: () => {
    const { P, add } = rigParts();
    const brun = rgbf('#5a4430'), jaune = rgbf('#e0b030');
    add('body', null, [0, 0, 0], [0.018, 0.016, 0.05], [0, 0, 0], brun, TL.fur);
    add('anneaux', 'body', [0, 0, -0.018], [0.019, 0.017, 0.03], [0, 0, 0], jaune, TL.stripes);
    add('crane', 'body', [0, 0.0085, 0.012], [0.012, 0.002, 0.012], [0, 0, 0], rgbf('#e8dcb0'), TL.plain);
    add('orbites', 'crane', [0, 0.0012, 0.002], [0.009, 0.001, 0.003], [0, 0, 0], E2_NOIR, TL.plain);
    add('neck', 'body', [0, 0, 0.025], null);
    add('head', 'neck', [0, 0, 0], [0.014, 0.012, 0.01], [0, 0, 0.004], brun, TL.fur);
    add('wingL', 'body', [-0.007, 0.004, 0.012], [0.06, 0.003, 0.026], [-0.03, 0, -0.006], brun, TL.stripes);
    add('wingR', 'body', [0.007, 0.004, 0.012], [0.06, 0.003, 0.026], [0.03, 0, -0.006], brun, TL.stripes);
    add('basL', 'body', [-0.006, 0.002, -0.004], [0.036, 0.003, 0.022], [-0.018, 0, -0.008], jaune, TL.stripes);
    add('basR', 'body', [0.006, 0.002, -0.004], [0.036, 0.003, 0.022], [0.018, 0, -0.008], jaune, TL.stripes);
    const r = new Rig(P); r.kind = 'bird'; r.e2Sphinx = true; return r;
  },
  // ================================================================ les hauteurs
  e2_campagnol_neiges: () => e2Campagnol({ col: '#8a8a88', ventre: '#c8c4bc', corps: [0.045, 0.04, 0.09], tete: [0.036, 0.034, 0.04], queue: 0.06, moustaches: true }),
  e2_bartavelle: () => e2Perdrix({ dos: '#8a8a8e', tete: '#9a9a9e', queue: '#b07a50', poitrine: '#a0a4ac', flanc: '#e0d4c0', grive: true }),
  // le tétras lyre : noir bleuté, crête rouge, queue en lyre (blanche dessous), barre blanche sur l'aile
  e2_tetras_lyre: () => {
    const noir = rgbf('#16182a');
    const r = birdParts({ col: noir, body: [0.17, 0.17, 0.3], bodyY: 0.21, head: [0.075, 0.08, 0.09], face: TL.henF, beak: [0.025, 0.022, 0.025], beakCol: E2_NOIR,
      tail: [0.06, 0.03, 0.08], leg: [0.025, 0.1], legCol: rgbf('#4a4448') });
    const u = [
      { name: 'crete', parent: 'head', p: [0, 0.07, 0.025], s: [0.085, 0.022, 0.04], col: rgbf('#d81e1e'), tex: TL.plain },
      { name: 'barreL', parent: 'wingL', p: [0, -0.01, 0.02], s: [0.026, 0.02, 0.1], col: [0.95, 0.95, 0.93], tex: TL.plain },
      { name: 'barreR', parent: 'wingR', p: [0, -0.01, 0.02], s: [0.026, 0.02, 0.1], col: [0.95, 0.95, 0.93], tex: TL.plain },
      { name: 'dessous', parent: 'tail', p: [0, -0.01, -0.03], s: [0.07, 0.025, 0.06], col: [0.97, 0.97, 0.96], tex: TL.fur },
    ];
    // la lyre : deux plumes qui s'écartent et se recourbent
    for (const s of [-1, 1]) {
      u.push({ name: 'lyre' + s, parent: 'tail', p: [s * 0.025, 0.005, -0.06], s: [0.02, 0.012, 0.11], o: [0, 0, -0.05], col: noir, tex: TL.fur, r0: [-0.15, s * 0.45, 0] });
      u.push({ name: 'crosse' + s, parent: 'lyre' + s, p: [0, 0, -0.1], s: [0.018, 0.01, 0.07], o: [0, 0, -0.03], col: noir, tex: TL.fur, r0: [0.2, s * 0.9, 0] });
    }
    return rigPlus(r, u);
  },
  // la vipère péliade : grise (v 0), brune (v 1) ou toute noire (v 2)
  e2_peliade: (v) => [
    () => e2Serpent({ k: 0.72, clair: '#8a8a82', sombre: '#1a1a1a', tete: '#6a6a62', ventre: '#3a3a36' }),
    () => e2Serpent({ k: 0.72, clair: '#9a7a52', sombre: '#2a1a12', tete: '#7a5a3a', ventre: '#4a3a2a' }),
    () => e2Serpent({ k: 0.72, clair: '#1e1e20', sombre: '#0e0e10', tete: '#1a1a1c', ventre: '#141414' }),
  ][((v | 0) % 4 === 3 ? 2 : (v | 0) % 2)](),
  // la salamandre noire : celle des taches, toute noire, plus petite
  e2_salamandre_noire: () => {
    const r = scaleRig(ANIMAL_RIGS.salamandre(), 0.9);
    for (const q of r.parts) if (q.s) { q.col = /^tache/.test(q.name) ? [0.1, 0.1, 0.11] : [0.05, 0.05, 0.06]; q.tex = TL.metal; }
    return r;
  },
  // l'apollon : ailes blanches tachées de noir, deux yeux rouges sur les ailes de derrière
  e2_apollon: () => {
    const { P, add } = rigParts();
    const blanc = [0.95, 0.94, 0.9], gris = [0.62, 0.62, 0.6];
    add('body', null, [0, 0, 0], [0.012, 0.012, 0.045], [0, 0, 0], [0.12, 0.11, 0.1], TL.fur);
    add('neck', 'body', [0, 0, 0.022], null);
    add('head', 'neck', [0, 0, 0], [0.011, 0.011, 0.011], [0, 0, 0.005], [0.1, 0.09, 0.08], TL.fur);
    for (const s of [-1, 1]) add('antenne' + s, 'head', [s * 0.004, 0.005, 0.006], [0.002, 0.002, 0.026], [0, 0, 0.013], [0.1, 0.08, 0.06], TL.plain, { r0: [-0.6, s * 0.3, 0] });
    add('wingL', 'body', [-0.006, 0.002, 0.004], [0.07, 0.003, 0.055], [-0.035, 0, 0.004], blanc, TL.plain);
    add('wingR', 'body', [0.006, 0.002, 0.004], [0.07, 0.003, 0.055], [0.035, 0, 0.004], blanc, TL.plain);
    add('bordL', 'wingL', [-0.066, 0.001, 0], [0.012, 0.003, 0.05], [0, 0, 0.004], gris, TL.plain);
    add('bordR', 'wingR', [0.066, 0.001, 0], [0.012, 0.003, 0.05], [0, 0, 0.004], gris, TL.plain);
    add('tacheL', 'wingL', [-0.03, 0.0012, 0.01], [0.01, 0.003, 0.01], [0, 0, 0], E2_NOIR, TL.plain);
    add('tacheR', 'wingR', [0.03, 0.0012, 0.01], [0.01, 0.003, 0.01], [0, 0, 0], E2_NOIR, TL.plain);
    add('basL', 'body', [-0.006, 0, -0.012], [0.045, 0.003, 0.04], [-0.022, 0, -0.01], blanc, TL.plain);
    add('basR', 'body', [0.006, 0, -0.012], [0.045, 0.003, 0.04], [0.022, 0, -0.01], blanc, TL.plain);
    add('oeilL', 'basL', [-0.022, 0.0012, -0.01], [0.012, 0.003, 0.012], [0, 0, 0], rgbf('#d02818'), TL.plain);
    add('oeilR', 'basR', [0.022, 0.0012, -0.01], [0.012, 0.003, 0.012], [0, 0, 0], rgbf('#d02818'), TL.plain);
    add('cercleL', 'oeilL', [0, -0.0004, 0], [0.017, 0.003, 0.017], [0, 0, 0], E2_NOIR, TL.plain);
    add('cercleR', 'oeilR', [0, -0.0004, 0], [0.017, 0.003, 0.017], [0, 0, 0], E2_NOIR, TL.plain);
    const r = new Rig(P); r.kind = 'bird'; r.papillon = true; return r;
  },
  // le tichodrome : gris, des ailes rouge carmin tachées de blanc, le bec fin et courbe
  e2_tichodrome: () => {
    const r = birdParts({ col: rgbf('#8a8e94'), body: [0.055, 0.055, 0.1], bodyY: 0.07, head: [0.042, 0.042, 0.048], face: TL.henF, beak: [0.006, 0.006, 0.035], beakCol: E2_NOIR,
      tail: [0.03, 0.01, 0.045], tailCol: rgbf('#2a2a2e'), wing: [0.11, 0.008, 0.06], wingCol: rgbf('#c42838'), leg: [0.008, 0.02], legCol: E2_NOIR });
    const rr = rigPlus(r, [
      { name: 'gorge', parent: 'head', p: [0, 0.008, 0.02], s: [0.036, 0.02, 0.02], col: rgbf('#2a2a2e'), tex: TL.fur },
      { name: 'boutL', parent: 'wingL', p: [-0.085, 0.001, 0], s: [0.05, 0.009, 0.056], col: E2_NOIR, tex: TL.spots },
      { name: 'boutR', parent: 'wingR', p: [0.085, 0.001, 0], s: [0.05, 0.009, 0.056], col: E2_NOIR, tex: TL.spots },
      { name: 'replie-1', parent: 'body', p: [-0.03, 0.008, -0.01], s: [0.008, 0.032, 0.085], o: [0, 0, -0.01], col: rgbf('#6a6e74'), tex: TL.fur, hide: true },
      { name: 'replie1', parent: 'body', p: [0.03, 0.008, -0.01], s: [0.008, 0.032, 0.085], o: [0, 0, -0.01], col: rgbf('#6a6e74'), tex: TL.fur, hide: true },
      { name: 'liseré-1', parent: 'replie-1', p: [-0.002, -0.012, 0.01], s: [0.008, 0.01, 0.06], col: rgbf('#c42838'), tex: TL.plain },
      { name: 'liseré1', parent: 'replie1', p: [0.002, -0.012, 0.01], s: [0.008, 0.01, 0.06], col: rgbf('#c42838'), tex: TL.plain },
    ]);
    rr.e2Replie = true;
    return rr;
  },
  // le grand-duc : le hibou d'avant, bien plus gros ; aigrettes, yeux orange
  e2_grand_duc: () => {
    const r = scaleRig(ANIMAL_RIGS.owl(), 1.35);
    for (const q of r.parts) if (q.s) { if (q.name === 'head') q.col = rgbf('#9a7a50'); else if (q.name === 'beak') q.col = E2_NOIR; else if (q.name !== 'legFL' && q.name !== 'legFR') { q.col = rgbf('#8a6a40'); if (q.name === 'body') q.tex = TL.stripes; } }
    const H = r.part('head').s;
    const u = [];
    for (const s of [-1, 1]) {
      u.push({ name: 'aigrette' + s, parent: 'head', p: [s * H[0] * 0.38, H[1] * 0.95, H[2] * 0.25], s: [0.04, 0.1, 0.035], o: [0, 0.045, 0], col: rgbf('#5a4228'), tex: TL.fur, r0: [-0.2, 0, s * -0.3] });
      u.push({ name: 'oeil' + s, parent: 'head', p: [s * H[0] * 0.24, H[1] * 0.58, H[2] * 0.7 + 0.012], s: [0.045, 0.045, 0.012], col: rgbf('#f08a10'), tex: TL.plain, fl: FX_EMIT });
      u.push({ name: 'pupille' + s, parent: 'oeil' + s, p: [0, 0, 0.004], s: [0.022, 0.022, 0.016], col: E2_NOIR, tex: TL.plain });
    }
    u.push({ name: 'disque', parent: 'head', p: [0, H[1] * 0.45, H[2] * 0.7 + 0.004], s: [H[0] * 0.8, H[1] * 0.6, 0.01], col: rgbf('#b8945e'), tex: TL.fur });
    const rr = rigPlus(r, u);
    rr.e2lent = [6, 0.55];
    return rr;
  },
  // le vautour fauve : brun, la collerette pâle, le cou et la tête presque nus, très grandes ailes
  e2_vautour: () => e2Rapace({ col: '#9a7650', aile: '#6a4a30', bout: '#2a2018', ventre: '#b08a5a', queue: '#3a2a20', corps: [0.3, 0.26, 0.62], ailes: [1.15, 0.03, 0.46],
    cou: [0.07, 0.2, 0.07], couR: [0.7, 0, 0], couCol: '#e0d4c0', tete: [0.11, 0.1, 0.13], teteCol: '#ece4d6', bec: [0.04, 0.05, 0.07], becCol: '#c8b070', queueS: [0.24, 0.03, 0.18],
    patte: [0.04, 0.14], patteCol: '#8a8a80', lent: [3.2, 0.32],
    extra: [{ name: 'collerette', parent: 'body', p: [0, 0.1, 0.27], s: [0.24, 0.12, 0.12], col: '#f0e8da' }] }),
  // le gypaète : gris ardoise dessus, rouille dessous, la barbe noire, la queue en losange
  e2_gypaete: () => e2Rapace({ col: '#d8884a', aile: '#4a4c52', bout: '#2a2c30', ventre: '#d07a3a', queue: '#4a4c52', corps: [0.26, 0.24, 0.6], ailes: [1.2, 0.025, 0.36],
    tete: [0.12, 0.12, 0.15], teteCol: '#e8d8c0', bec: [0.035, 0.045, 0.07], becCol: '#8a8a88', queueS: [0.2, 0.025, 0.4], patte: [0.04, 0.12], patteCol: '#8a8a88', lent: [3, 0.3],
    extra: [
      { name: 'barbe', parent: 'beak', p: [0, -0.035, 0.0], s: [0.03, 0.05, 0.02], o: [0, -0.02, 0], col: E2_NOIR },
      { name: 'masque', parent: 'head', p: [0, 0.07, 0.06], s: [0.13, 0.025, 0.05], col: E2_NOIR },
      { name: 'cercle', parent: 'head', p: [0, 0.075, 0.09], s: [0.126, 0.016, 0.012], col: '#d02020', tex: TL.plain },
      { name: 'losange', parent: 'tail', p: [0, 0, -0.36], s: [0.12, 0.024, 0.14], o: [0, 0, -0.05], col: '#3a3c42' },
    ] }),
  // ================================================================ le bord du lac
  // la foulque : toute noire, le bec et la plaque du front blancs
  e2_foulque: () => e2Nageur({ col: '#1c1c22', corps: [0.16, 0.14, 0.26], tete: [0.07, 0.075, 0.08], bec: [0.022, 0.024, 0.035], becCol: '#f0eee6', patteCol: '#8a9a50',
    extra: [{ name: 'plaque', parent: 'head', p: [0, 0.05, 0.066], s: [0.022, 0.03, 0.008], col: [0.97, 0.97, 0.95], tex: TL.plain }] }),
  // la mouette rieuse : blanche, le capuchon brun, ailes grises au bout noir
  e2_mouette: () => e2Nageur({ col: '#f4f4f0', corps: [0.12, 0.11, 0.26], tete: [0.06, 0.06, 0.07], teteCol: '#4a3a30', bec: [0.012, 0.014, 0.04], becCol: '#b02a2a', queue: '#f4f4f0',
    ailes: [0.42, 0.015, 0.15], aile: '#c0c6cc', patteCol: '#b02a2a', patte: [0.012, 0.05], lent: [7, 0.55],
    extra: [
      { name: 'boutA', parent: 'wingL', p: [-0.36, 0.001, -0.01], s: [0.1, 0.017, 0.13], col: E2_NOIR },
      { name: 'boutB', parent: 'wingR', p: [0.36, 0.001, -0.01], s: [0.1, 0.017, 0.13], col: E2_NOIR },
    ] }),
  // le chevalier guignette : brun dessus, blanc dessous
  e2_guignette: () => rigPlus(birdParts({ col: rgbf('#7a6a54'), body: [0.07, 0.07, 0.13], bodyY: 0.09, head: [0.05, 0.05, 0.055], face: TL.henF, beak: [0.008, 0.008, 0.032], beakCol: rgbf('#3a3630'),
    tail: [0.035, 0.012, 0.05], leg: [0.01, 0.055], legCol: rgbf('#8a9a6a') }), [
    { name: 'ventre', parent: 'body', p: [0, -0.02, 0.01], s: [0.066, 0.035, 0.11], col: rgbf('#f2f0ea'), tex: TL.fur },
    { name: 'sourcil', parent: 'head', p: [0, 0.035, 0.02], s: [0.052, 0.008, 0.03], col: rgbf('#e8e4da'), tex: TL.plain },
  ]),
  e2_campagnol_amphibie: () => e2Campagnol({ col: '#5a4232', ventre: '#8a7a68', corps: [0.08, 0.075, 0.18], tete: [0.065, 0.06, 0.068], queue: 0.12, oreille: '#4a3426' }),
  // la couleuvre vipérine : brune, le zigzag sombre, le ventre jaunâtre
  e2_viperine: () => e2Serpent({ k: 0.85, clair: '#7a6a44', sombre: '#2a2214', tete: '#6a5a3a', ventre: '#c8a850' }),
  // l'oie cendrée : grise, rayée, le bec orange, les pattes roses ; de grandes ailes en vol, repliées au sol
  e2_oie: () => {
    const gris = rgbf('#9a9488'), aile = rgbf('#7e786e');
    const r = birdParts({ col: gris, body: [0.26, 0.24, 0.46], bodyY: 0.28, neck: [0.07, 0.3, 0.07], neckR: [0.15, 0, 0], neckCol: rgbf('#8a8478'), head: [0.1, 0.1, 0.13], headCol: rgbf('#8a8478'),
      beak: [0.055, 0.04, 0.09], beakCol: rgbf('#f08a30'), tail: [0.14, 0.06, 0.1], tailCol: rgbf('#5a5650'), wing: [0.72, 0.02, 0.26], wingCol: aile, leg: [0.035, 0.16], legCol: rgbf('#e8a0a0') });
    for (const q of r.parts) if (q.name === 'body') q.tex = TL.stripes;
    const rr = rigPlus(r, [
      { name: 'ventre', parent: 'body', p: [0, -0.07, -0.05], s: [0.22, 0.08, 0.26], col: rgbf('#d8d4cc'), tex: TL.fur },
      { name: 'boutL', parent: 'wingL', p: [-0.6, 0.001, -0.01], s: [0.24, 0.022, 0.24], col: rgbf('#4a4640'), tex: TL.fur },
      { name: 'boutR', parent: 'wingR', p: [0.6, 0.001, -0.01], s: [0.24, 0.022, 0.24], col: rgbf('#4a4640'), tex: TL.fur },
      { name: 'replie-1', parent: 'body', p: [-0.14, 0.04, -0.04], s: [0.025, 0.16, 0.42], o: [0, 0, -0.02], col: aile, tex: TL.stripes, hide: true },
      { name: 'replie1', parent: 'body', p: [0.14, 0.04, -0.04], s: [0.025, 0.16, 0.42], o: [0, 0, -0.02], col: aile, tex: TL.stripes, hide: true },
    ]);
    rr.e2Replie = true; rr.e2lent = [6, 0.55];
    return rr;
  },
  // le harle bièvre : le mâle blanc à tête vert sombre (v pair), la femelle grise à tête rousse huppée ; le bec fin et rouge
  e2_harle: (v) => (v | 0) % 2 === 0
    ? e2Nageur({ col: '#f0ece2', corps: [0.17, 0.12, 0.42], tete: [0.07, 0.08, 0.1], teteCol: '#16302a', bec: [0.012, 0.012, 0.07], becCol: '#c02a20', queue: '#5a5a5e', aile: '#2a2a2e',
      extra: [{ name: 'dos', parent: 'body', p: [0, 0.055, 0.02], s: [0.1, 0.02, 0.3], col: E2_NOIR }] })
    : e2Nageur({ col: '#9a9ca0', corps: [0.16, 0.12, 0.4], tete: [0.07, 0.08, 0.1], teteCol: '#9a4a28', bec: [0.012, 0.012, 0.07], becCol: '#c02a20', queue: '#7a7c80',
      extra: [{ name: 'gorge', parent: 'head', p: [0, -0.006, 0.03], s: [0.05, 0.03, 0.04], col: '#f0ece2' }, { name: 'huppe', parent: 'head', p: [0, 0.085, -0.03], s: [0.04, 0.03, 0.06], col: '#8a3e20', r0: [0.3, 0, 0] }] }),
  // le grand cormoran : noir à reflets de bronze, la joue blanche, le bec crochu ; les ailes s'ouvrent pour sécher
  e2_cormoran: () => e2Nageur({ col: '#16161a', corps: [0.2, 0.17, 0.48], cou: [0.06, 0.2, 0.06], couR: [-0.25, 0, 0], tete: [0.065, 0.075, 0.1], bec: [0.02, 0.024, 0.085], becCol: '#7a7466',
    queueS: [0.1, 0.03, 0.16], ailes: [0.55, 0.02, 0.24], aile: '#3a3224', patteCol: '#1a1a1a', lent: [5, 0.5],
    extra: [
      { name: 'joue', parent: 'head', p: [0, 0.012, 0.02], s: [0.068, 0.035, 0.04], col: [0.95, 0.94, 0.9], tex: TL.plain },
      { name: 'crochet', parent: 'beak', p: [0, -0.012, 0.04], s: [0.016, 0.018, 0.012], col: '#5a5448', tex: TL.plain },
    ] }),
  // le balbuzard : blanc dessous, brun dessus, le bandeau sombre ; (un poisson dans les serres : caché)
  e2_balbuzard: () => e2Rapace({ col: '#4a3626', aile: '#3e2c20', bout: '#2a1e16', ventre: '#f2f0ea', queue: '#5a4632', corps: [0.16, 0.14, 0.38], ailes: [0.72, 0.022, 0.22],
    tete: [0.09, 0.09, 0.11], teteCol: '#f2f0ea', bec: [0.025, 0.03, 0.04], becCol: '#2a2a2a', patteCol: '#c8ccd0', lent: [5, 0.45],
    extra: [
      { name: 'bandeau', parent: 'head', p: [0, 0.05, 0.02], s: [0.094, 0.02, 0.06], col: '#3a2a1e' },
      { name: 'poisson', parent: 'body', p: [0, -0.13, 0.02], s: [0.04, 0.05, 0.22], col: '#9aa098', tex: TL.scales, hide: true },
    ] }),
  // le vison d'Europe : brun sombre, le menton et les lèvres blancs
  e2_vison: () => {
    const r = quadRig({ col: rgbf('#3a2418'), body: [0.08, 0.08, 0.32], bodyY: 0.1, leg: [0.03, 0.07], neck: [0, 0.03], head: [0.07, 0.065, 0.08], face: TL.foxF,
      snout: [0.035, 0.03, 0.03, -0.015], snoutCol: rgbf('#2a1a12'), ears: [0.02, 0.015, 0.01] });
    return rigPlus(r, [
      { name: 'menton', parent: 'snout', p: [0, -0.016, 0.006], s: [0.034, 0.012, 0.032], col: [0.95, 0.94, 0.9], tex: TL.fur },
      { name: 'tail', parent: 'body', p: [0, 0.01, -0.16], s: [0.035, 0.035, 0.15], o: [0, 0, -0.075], col: rgbf('#2e1c12'), tex: TL.fur, r0: [0.35, 0, 0] },
    ]);
  },
});
