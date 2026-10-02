// ============================================================================
//  LES BÊTES DES BOIS ET DU MARAIS (agent E3) : leurs modèles en boîtes
//  (squelettes « e3_… », l'avant regarde +z). Les familles partagent un
//  modèle à réglages : les rapaces (autour, bondrée, busard), les pics, les
//  oiseaux à long bec (bécasse, bécassine), les hérons (bihoreau, aigrette),
//  les grenouilles (sonneur, rainette, grenouille rousse), les musaraignes
//  (carrelet, crossope), les coléoptères (capricorne, cicindèle), les
//  papillons (grand mars, morio, cuivré).
// ============================================================================
// une boîte en plus (pour rigPlus)
const e3B = (name, parent, p, s, col, tex, extra) => Object.assign({ name, parent, p, s, col: typeof col === 'string' ? rgbf(col) : col, tex: tex ?? TL.fur }, extra || {});
// les rapaces : ailes repliées (« plie ») au repos, déployées (wingL/R) en vol — voir e3Ailes (11-zzzzE3-betes.js)
function e3Rapace(o) {
  const r = birdParts({ col: rgbf(o.col), body: o.body, bodyY: o.body[1] / 2 + o.leg[1], head: o.head, headCol: rgbf(o.headCol || o.col), beak: o.beak, beakCol: rgbf(o.beakCol || '#2a2a2a'),
    tail: o.tail, tailCol: rgbf(o.tailCol || o.col), wing: o.wing, wingCol: rgbf(o.wingCol || o.col), leg: o.leg, legCol: rgbf(o.legCol || '#e0b030') });
  const b = o.body, u = [
    e3B('plieL', 'body', [-b[0] / 2 - 0.006, b[1] * 0.12, -0.02], [0.02, b[1] * 0.7, b[2] * 0.95], o.wingCol || o.col),
    e3B('plieR', 'body', [b[0] / 2 + 0.006, b[1] * 0.12, -0.02], [0.02, b[1] * 0.7, b[2] * 0.95], o.wingCol || o.col),
  ];
  if (o.ventre) u.push(e3B('ventre', 'body', [0, -b[1] * 0.2, b[2] * 0.1], [b[0] * 1.06, b[1] * 0.64, b[2] * 0.74], o.ventre, TL.stripes));
  for (const q of o.plus || []) u.push(q);
  const rr = rigPlus(r, u);
  rr.lent = o.lent || [8, 0.55];
  for (const n of ['wingL', 'wingR']) rr.part(n).hide = true;
  rr.e3Rapace = true;
  return rr;
}
// les pics : accrochés au tronc, le corps dressé (voir 11-zzzzE3-betes.js)
function e3Pic(o) {
  const r = birdParts({ col: rgbf(o.col), body: o.body, bodyY: o.body[1] / 2 + 0.03, head: o.head, headCol: rgbf(o.headCol || o.col), beak: o.beak, beakCol: rgbf(o.beakCol),
    tail: o.tail, tailCol: rgbf(o.tailCol || o.col), wingCol: rgbf(o.wingCol || o.col), leg: [0.012, 0.03], legCol: rgbf('#5a5a50') });
  return rigPlus(r, o.plus || []);
}
// les oiseaux à long bec qu'on lève sous ses pieds
function e3LongBec(o) {
  const r = birdParts({ col: rgbf(o.col), body: o.body, bodyY: o.body[1] / 2 + o.leg[1], head: o.head, headCol: rgbf(o.headCol || o.col), beak: o.beak, beakCol: rgbf(o.beakCol),
    tail: o.tail, tailCol: rgbf(o.tailCol || o.col), wingCol: rgbf(o.wingCol || o.col), leg: o.leg, legCol: rgbf(o.legCol) });
  const b = o.body, h = o.head, u = [];
  // la tête rayée : deux bandes sombres sur le dessus
  for (const s of [-1, 1]) u.push(e3B('raie' + s, 'head', [s * h[0] * 0.22, h[1] * 0.98, h[2] * 0.2], [h[0] * 0.2, 0.008, h[2] * 0.9], o.raie || '#2a1e14'));
  // le dos barré
  for (let k = 0; k < 3; k++) u.push(e3B('barre' + k, 'body', [0, b[1] / 2 - 0.001, b[2] * (0.25 - k * 0.22)], [b[0] * 1.01, 0.004, b[2] * 0.07], o.barre || '#3a2a1a'));
  for (const q of o.plus || []) u.push(q);
  return rigPlus(r, u);
}
// les hérons
function e3Heron(o) {
  const r = birdParts({ col: rgbf(o.col), body: o.body, bodyY: o.body[1] / 2 + o.leg[1], neck: o.neck, neckR: o.neckR, neckCol: rgbf(o.neckCol || o.col), head: o.head, headCol: rgbf(o.headCol || o.col),
    beak: o.beak, beakCol: rgbf(o.beakCol), tail: o.tail, tailCol: rgbf(o.tailCol || o.col), wingCol: rgbf(o.wingCol || o.col), leg: o.leg, legCol: rgbf(o.legCol) });
  const rr = rigPlus(r, o.plus || []);
  rr.lent = [10, 0.6]; rr.vol = o.vol || [0.9, -0.9, 1.3, 0.1];
  return rr;
}
// les grenouilles : c (dessus), v (ventre), taille k
function e3Grenouille(o) {
  const { P, add } = rigParts();
  const k = o.k, c = rgbf(o.c), d = rgbf(o.d || o.c), tex = o.tex ?? TL.fur;
  add('body', null, [0, 0.05 * k, 0], [0.1 * k, 0.055 * k, 0.12 * k], [0, 0, 0], c, tex);
  add('ventre', 'body', [0, -0.026 * k, 0], [0.094 * k, 0.012 * k, 0.11 * k], [0, 0, 0], rgbf(o.v), o.vTex ?? TL.plain);
  add('neck', 'body', [0, 0.02 * k, 0.06 * k], null);
  add('head', 'neck', [0, 0, 0], [0.1 * k, 0.05 * k, 0.07 * k], [0, 0, 0.03 * k], c, tx(tex, TL.henF));
  for (const s of [-1, 1]) add(s < 0 ? 'oeilL' : 'oeilR', 'head', [s * 0.03 * k, 0.03 * k, 0.03 * k], [0.025 * k, 0.025 * k, 0.025 * k], [0, 0, 0], rgbf(o.oeil || '#d8b040'), TL.plain);
  if (o.masque) for (const s of [-1, 1]) add('masque' + s, 'head', [s * 0.051 * k, 0.012 * k, 0.012 * k], [0.004, 0.022 * k, 0.04 * k], [0, 0, 0], rgbf(o.masque), TL.plain);
  if (o.raie) for (const s of [-1, 1]) add('raie' + s, 'body', [s * 0.051 * k, 0.006 * k, 0], [0.004, 0.014 * k, 0.12 * k], [0, 0, 0], rgbf(o.raie), TL.plain);
  add('legFL', 'body', [-0.05 * k, -0.02 * k, 0.05 * k], [0.02 * k, 0.04 * k, 0.02 * k], [0, -0.02 * k, 0], d, tex);
  add('legFR', 'body', [0.05 * k, -0.02 * k, 0.05 * k], [0.02 * k, 0.04 * k, 0.02 * k], [0, -0.02 * k, 0], d, tex);
  add('legBL', 'body', [-0.06 * k, -0.01 * k, -0.05 * k], [0.04 * k, 0.03 * k, 0.08 * k], [0, -0.01 * k, 0], d, tex);
  add('legBR', 'body', [0.06 * k, -0.01 * k, -0.05 * k], [0.04 * k, 0.03 * k, 0.08 * k], [0, -0.01 * k, 0], d, tex);
  const r = new Rig(P); r.kind = 'quad'; r.cfg = {}; return r;
}
// les musaraignes (et le muscardin) : un petit corps, un museau pointu
function e3Musaraigne(o) {
  const { P, add } = rigParts();
  const k = o.k || 1, c = rgbf(o.c), v = rgbf(o.v), m = rgbf(o.museau || '#c89080');
  add('body', null, [0, 0.022 * k, 0], [0.034 * k, 0.03 * k, 0.07 * k], [0, 0, 0], c, TL.fur);
  add('ventre', 'body', [0, -0.012 * k, 0.002 * k], [0.037 * k, 0.012 * k, 0.062 * k], [0, 0, 0], v, TL.fur);
  add('neck', 'body', [0, 0.004 * k, 0.034 * k], null);
  add('head', 'neck', [0, 0, 0], [0.026 * k, 0.024 * k, 0.03 * k], [0, 0, 0.014 * k], c, TL.fur);
  if (o.oeil) for (const s of [-1, 1]) add('oeil' + s, 'head', [s * 0.012 * k, 0.006 * k, 0.018 * k], [0.008 * k, 0.008 * k, 0.008 * k], [0, 0, 0], [0.04, 0.03, 0.03], TL.plain);
  if (o.oreilles) for (const s of [-1, 1]) add('oreille' + s, 'head', [s * 0.011 * k, 0.014 * k, 0.006 * k], [0.008 * k, 0.01 * k, 0.004 * k], [0, 0.004 * k, 0], c, TL.fur);
  add('museau', 'head', [0, -0.002 * k, 0.03 * k], [0.01 * k, 0.009 * k, o.long ? 0.022 * k : 0.012 * k], [0, 0, o.long ? 0.011 * k : 0.006 * k], m, TL.skin);
  for (const [n, sx, sz] of [['legFL', -1, 1], ['legFR', 1, 1], ['legBL', -1, -1], ['legBR', 1, -1]]) add(n, 'body', [sx * 0.013 * k, -0.008 * k, sz * 0.024 * k], [0.008 * k, 0.014 * k, 0.008 * k], [0, -0.007 * k, 0], o.pattes ? rgbf(o.pattes) : m, TL.skin);
  const q = o.queue || [0.007, 0.007, 0.05];
  add('tail', 'body', [0, 0.004 * k, -0.034 * k], [q[0] * k, q[1] * k, q[2] * k], [0, 0, -q[2] * k / 2], o.queueCol ? rgbf(o.queueCol) : c, TL.fur);
  const r = new Rig(P); r.kind = 'quad'; r.cfg = {}; return r;
}
// les coléoptères (genre « oiseau » : leurs ailes ne se voient qu'en vol)
function e3Scarabee(o) {
  const { P, add } = rigParts();
  const c = rgbf(o.c), m = rgbf(o.m), L = o.L;
  add('body', null, [0, 0.008, 0], [o.l, 0.009, L], [0, 0, 0], c, TL.scales);
  if (o.bout) add('bout', 'body', [0, 0.001, -L * 0.36], [o.l * 1.02, 0.009, L * 0.3], [0, 0, 0], rgbf(o.bout), TL.scales);
  for (const [x, z] of o.taches || []) add('t' + x + z, 'body', [x * o.l, 0.005, z * L], [o.l * 0.22, 0.002, L * 0.12], [0, 0, 0], rgbf(o.tache), TL.plain);
  add('neck', 'body', [0, 0.001, L / 2], null);
  add('head', 'neck', [0, 0, 0], [o.l * 0.75, 0.008, L * 0.28], [0, 0, L * 0.12], c, TL.scales);
  if (o.antennes) for (const s of [-1, 1]) add('antenne' + s, 'head', [s * o.l * 0.25, 0.004, L * 0.16], [0.0025, 0.0025, o.antennes], [0, 0, o.antennes / 2], m, TL.plain, { r0: [-0.25, s * 0.75, 0] });
  if (o.mandibules) for (const s of [-1, 1]) add('mandibule' + s, 'head', [s * o.l * 0.2, 0, L * 0.26], [0.002, 0.002, o.mandibules], [0, 0, o.mandibules / 2], m, TL.plain, { r0: [0, -s * 0.4, 0] });
  for (const [n, sx, sz] of [['legFL', -1, 1], ['legFR', 1, 1], ['legBL', -1, -1], ['legBR', 1, -1], ['legML', -1, 0], ['legMR', 1, 0]]) add(n, 'body', [sx * o.l * 0.4, -0.003, sz * L * 0.22], [o.patte, 0.003, 0.003], [sx * o.patte / 2, -0.003, 0], m, TL.plain);
  add('wingL', 'body', [-o.l * 0.3, 0.006, 0], [o.l * 1.5, 0.002, L * 0.7], [-o.l * 0.75, 0, 0], rgbf('#c8b8a0'), TL.plain, { hide: true });
  add('wingR', 'body', [o.l * 0.3, 0.006, 0], [o.l * 1.5, 0.002, L * 0.7], [o.l * 0.75, 0, 0], rgbf('#c8b8a0'), TL.plain, { hide: true });
  const r = new Rig(P); r.kind = 'bird'; r.e3Insecte = true; return r;
}
// les papillons : ailes de devant (wingL/R) et de derrière (basL/R), bordures, taches ; posé, il ouvre et ferme ses
// ailes lentement (poseBird, 11-zzzz8-nature.js : rig.papillon)
function e3Papillon(o) {
  const { P, add } = rigParts();
  const ai = rgbf(o.aile), bo = rgbf(o.bord), W = o.W || 0.06, D = W * 0.8;
  add('body', null, [0, 0, 0], [0.01, 0.01, 0.04], [0, 0, 0], rgbf(o.corps || '#2a2018'), TL.fur);
  add('neck', 'body', [0, 0, 0.02], null);
  add('head', 'neck', [0, 0, 0], [0.01, 0.01, 0.01], [0, 0, 0.004], rgbf(o.corps || '#2a2018'), TL.fur);
  for (const s of [-1, 1]) add('antenne' + s, 'head', [s * 0.003, 0.004, 0.005], [0.0018, 0.0018, 0.026], [0, 0, 0.013], [0.1, 0.08, 0.05], TL.plain, { r0: [-0.6, s * 0.3, 0] });
  add('wingL', 'body', [-0.005, 0.002, 0.003], [W, 0.003, D], [-W / 2, 0, 0.004], ai, TL.plain);
  add('wingR', 'body', [0.005, 0.002, 0.003], [W, 0.003, D], [W / 2, 0, 0.004], ai, TL.plain);
  add('bordL', 'wingL', [-W * 0.93, 0.001, 0], [W * 0.16, 0.003, D * 0.94], [0, 0, 0.004], bo, TL.plain);
  add('bordR', 'wingR', [W * 0.93, 0.001, 0], [W * 0.16, 0.003, D * 0.94], [0, 0, 0.004], bo, TL.plain);
  add('basL', 'body', [-0.005, 0, -0.01], [W * 0.62, 0.003, D * 0.66], [-W * 0.3, 0, -D * 0.2], rgbf(o.bas || o.aile), TL.plain);
  add('basR', 'body', [0.005, 0, -0.01], [W * 0.62, 0.003, D * 0.66], [W * 0.3, 0, -D * 0.2], rgbf(o.bas || o.aile), TL.plain);
  for (const [x, z, c] of o.taches || []) for (const s of [-1, 1]) add('tache' + s + x + z, s < 0 ? 'wingL' : 'wingR', [s * x * W, 0.0012, z * D], [W * 0.13, 0.003, D * 0.14], [0, 0, 0.004], rgbf(c), TL.plain);
  const r = new Rig(P); r.kind = 'bird'; r.papillon = true; r.e3Ailes = [ai, rgbf(o.reflet || o.aile)]; return r;
}

Object.assign(ANIMAL_RIGS, {
  // ------------------------------------------------------------ la forêt
  // le daim : fauve semé de blanc, le miroir blanc bordé de noir ; le mâle (v pair) porte ses palettes
  e3_daim: (v) => {
    const male = (v | 0) % 2 === 0, c = rgbf('#a8723c');
    const r = scaleRig(ANIMAL_RIGS.deer(1), 0.8);
    for (const q of r.parts) if (q.s && !/h$/.test(q.name)) q.col = q.name === 'tail' ? [0.95, 0.94, 0.9] : c;
    const B = r.part('body').s, u = [];
    for (const s of [-1, 1]) for (let k = 0; k < 4; k++) for (let j = 0; j < 2; j++) u.push(e3B('tache' + s + k + j, 'body', [s * (B[0] / 2 + 0.003), B[1] * (0.18 - j * 0.12), B[2] * (0.3 - k * 0.2) + j * 0.05], [0.006, 0.04, 0.045], [0.96, 0.94, 0.88], TL.plain));
    u.push(e3B('miroir', 'body', [0, 0.02, -B[2] / 2 - 0.004], [B[0] * 0.8, B[1] * 0.6, 0.012], [0.96, 0.95, 0.92], TL.plain));
    for (const s of [-1, 1]) u.push(e3B('cadre' + s, 'body', [s * B[0] * 0.42, 0.02, -B[2] / 2 - 0.006], [0.025, B[1] * 0.62, 0.012], [0.1, 0.08, 0.06], TL.plain));
    u.push(e3B('raieQ', 'tail', [0, 0, -0.025], [0.035, 0.11, 0.02], [0.1, 0.08, 0.06], TL.plain, { o: [0, -0.05, 0] }));
    u.push(e3B('ventre', 'body', [0, -B[1] / 2 + 0.03, 0], [B[0] * 0.9, 0.05, B[2] * 0.8], [0.9, 0.86, 0.76], TL.fur));
    if (male) {
      const bo = rgbf('#c8b088');
      for (const s of [-1, 1]) {
        u.push(e3B('perche' + s, 'head', [s * 0.05, 0.1, 0.08], [0.028, 0.2, 0.028], bo, TL.bone, { o: [0, 0.1, 0], r0: [-0.3, 0, s * 0.42] }));
        u.push(e3B('pelle' + s, 'perche' + s, [0, 0.19, 0], [0.024, 0.2, 0.15], bo, TL.bone, { o: [0, 0.09, -0.035], r0: [0.25, 0, s * 0.18] }));
        u.push(e3B('dent' + s, 'perche' + s, [0, 0.05, 0.01], [0.02, 0.02, 0.08], bo, TL.bone, { o: [0, 0, 0.04], r0: [-0.4, 0, 0] }));
      }
    }
    return rigPlus(r, u);
  },
  // l'autour : gris dessus, barré dessous, un sourcil blanc, l'œil orange
  e3_autour: () => e3Rapace({ col: '#6c747e', body: [0.15, 0.16, 0.3], head: [0.08, 0.08, 0.09], headCol: '#4a5058', beak: [0.018, 0.022, 0.03], beakCol: '#2a2a30', tail: [0.09, 0.015, 0.2],
    wing: [0.5, 0.02, 0.2], leg: [0.02, 0.09], legCol: '#e0c030', ventre: '#e4e0d6', plus: [
      e3B('sourcilL', 'head', [-0.041, 0.055, 0.02], [0.004, 0.012, 0.05], '#f2f0ea', TL.plain), e3B('sourcilR', 'head', [0.041, 0.055, 0.02], [0.004, 0.012, 0.05], '#f2f0ea', TL.plain),
      e3B('oeilL', 'head', [-0.041, 0.04, 0.03], [0.004, 0.014, 0.014], '#f08a20', TL.plain), e3B('oeilR', 'head', [0.041, 0.04, 0.03], [0.004, 0.014, 0.014], '#f08a20', TL.plain),
    ] }),
  // le pic noir : noir, la calotte rouge, le bec ivoire
  e3_pic_noir: () => e3Pic({ col: '#141414', body: [0.1, 0.13, 0.24], head: [0.075, 0.075, 0.085], beak: [0.016, 0.016, 0.065], beakCol: '#d8d0b0', tail: [0.06, 0.012, 0.13], plus: [
    e3B('calotte', 'head', [0, 0.076, 0.012], [0.05, 0.016, 0.075], '#c81a18'),
    e3B('oeilL', 'head', [-0.038, 0.045, 0.025], [0.004, 0.012, 0.012], '#e8e4d0', TL.plain), e3B('oeilR', 'head', [0.038, 0.045, 0.025], [0.004, 0.012, 0.012], '#e8e4d0', TL.plain),
  ] }),
  // la bécasse : feuille morte, le bec long et droit
  e3_becasse: () => e3LongBec({ col: '#8a6a48', body: [0.14, 0.12, 0.2], head: [0.07, 0.07, 0.075], headCol: '#9a7a52', beak: [0.012, 0.012, 0.085], beakCol: '#8a7058', tail: [0.07, 0.014, 0.06],
    wingCol: '#7a5a3a', leg: [0.015, 0.045], legCol: '#b8a090', raie: '#2e2016', barre: '#5e4630', plus: [e3B('dessous', 'body', [0, -0.03, 0.02], [0.13, 0.05, 0.15], '#c8aa80', TL.stripes)] }),
  // la cigogne noire : la cigogne des clochers, en noir ; le ventre blanc
  e3_cigogne_noire: () => {
    const r = scaleRig(ANIMAL_RIGS.stork(), 0.92), N = rgbf('#1c2420');
    for (const q of r.parts) if (q.s && q.name !== 'beak' && !/^leg/.test(q.name)) q.col = N;
    const B = r.part('body').s, rr = rigPlus(r, [e3B('ventre', 'body', [0, -B[1] * 0.2, -B[2] * 0.05], [B[0] * 0.94, B[1] * 0.55, B[2] * 0.6], '#f0eeea')]);
    rr.lent = [10, 0.6]; rr.vol = [1.3, -1.3, 1.35, 0.2];
    return rr;
  },
  // le sonneur : gris et verruqueux dessus, jaune taché de noir dessous
  e3_sonneur: () => e3Grenouille({ k: 0.5, c: '#5e5a46', tex: TL.scales, v: '#f0c020', vTex: TL.spots, oeil: '#c8a040' }),
  // la coronelle : grise ou rousse, tachée, un trait sombre à travers l'œil
  e3_coronelle: (v) => {
    const r = scaleRig(ANIMAL_RIGS.snake(), 0.85), c1 = rgbf((v | 0) % 2 ? '#a8805c' : '#9a9282'), c2 = rgbf((v | 0) % 2 ? '#6a4a34' : '#5a5248');
    for (const q of r.parts) if (q.s) q.col = q.name === 'head' ? v3.scale(c1, 0.9) : /[1357]$/.test(q.name) ? c2 : c1;
    return rigPlus(r, [e3B('traitL', 'head', [-0.026, 0.01, 0.03], [0.004, 0.008, 0.05], '#2a2018', TL.plain), e3B('traitR', 'head', [0.026, 0.01, 0.03], [0.004, 0.008, 0.05], '#2a2018', TL.plain)]);
  },
  // le grand capricorne : long, noir, roux au bout, les antennes plus longues que lui
  e3_capricorne: () => e3Scarabee({ c: '#2a1c14', m: '#3a2418', bout: '#7a4024', l: 0.014, L: 0.05, antennes: 0.075, patte: 0.016 }),
  // le grand mars : brun, une bande blanche ; violet sous certains angles
  e3_grand_mars: () => e3Papillon({ aile: '#4a3222', bord: '#2a1c12', reflet: '#6a3aa0', W: 0.055, taches: [[0.45, 0.1, '#e8e0d0'], [0.62, -0.05, '#e8e0d0'], [0.3, 0.25, '#e8e0d0']] }),
  // l'oreillard : la chauve-souris aux oreilles plus longues que la tête
  e3_oreillard: () => {
    const r = scaleRig(ANIMAL_RIGS.bat(), 0.62), c = rgbf('#7a5a44');
    for (const q of r.parts) if (q.s && !/^wing/.test(q.name)) q.col = c;
    return rigPlus(r, [
      e3B('oreilleL', 'head', [-0.018, 0.05, 0.0], [0.016, 0.07, 0.03], '#b08a70', TL.skin, { o: [0, 0.03, -0.01], r0: [-0.35, 0, -0.3] }),
      e3B('oreilleR', 'head', [0.018, 0.05, 0.0], [0.016, 0.07, 0.03], '#b08a70', TL.skin, { o: [0, 0.03, -0.01], r0: [-0.35, 0, 0.3] }),
    ]);
  },
  // ------------------------------------------------------------ le bois de bouleaux
  // la gélinotte : grise et rousse, une petite huppe, la gorge noire, un sourcil rouge
  e3_gelinotte: () => rigPlus(birdParts({ col: rgbf('#8a7a68'), body: [0.13, 0.13, 0.22], bodyY: 0.065 + 0.06, head: [0.065, 0.065, 0.075], headCol: rgbf('#7a6a58'), beak: [0.016, 0.014, 0.018], beakCol: rgbf('#2a2a24'),
    tail: [0.08, 0.02, 0.1], tailCol: rgbf('#6a6a68'), wingCol: rgbf('#8a6a4a'), leg: [0.016, 0.06], legCol: rgbf('#a09080') }), [
    e3B('huppe', 'head', [0, 0.07, -0.01], [0.02, 0.02, 0.035], '#6a5a48', TL.fur, { r0: [-0.5, 0, 0] }),
    e3B('gorge', 'head', [0, 0.008, 0.04], [0.045, 0.03, 0.02], '#1a1612'),
    e3B('sourcilL', 'head', [-0.033, 0.05, 0.02], [0.004, 0.01, 0.025], '#c8301e', TL.plain), e3B('sourcilR', 'head', [0.033, 0.05, 0.02], [0.004, 0.01, 0.025], '#c8301e', TL.plain),
    e3B('bandeQ', 'tail', [0, 0.004, -0.085], [0.082, 0.02, 0.02], '#1a1612', TL.plain),
    e3B('flancs', 'body', [0, -0.02, 0.01], [0.134, 0.06, 0.16], '#d8c8b0', TL.stripes),
  ]),
  // le pic épeiche : noir et blanc, le dessous de la queue rouge, la nuque rouge
  e3_pic_epeiche: () => e3Pic({ col: '#1a1a1a', body: [0.07, 0.09, 0.15], head: [0.055, 0.055, 0.06], headCol: '#f0ece4', beak: [0.01, 0.01, 0.035], beakCol: '#2a2a2a', tail: [0.045, 0.01, 0.08], plus: [
    e3B('calotte', 'head', [0, 0.056, -0.004], [0.05, 0.012, 0.05], '#141414'), e3B('nuque', 'head', [0, 0.045, -0.026], [0.03, 0.016, 0.012], '#d02020'),
    e3B('moust', 'head', [0, 0.02, 0.006], [0.058, 0.01, 0.04], '#141414'),
    e3B('ventre', 'body', [0, -0.012, 0.03], [0.066, 0.06, 0.08], '#ece6da'), e3B('dessousQ', 'body', [0, -0.035, -0.06], [0.05, 0.022, 0.04], '#d02020'),
    e3B('epauleL', 'wingL', [0, 0.012, 0.02], [0.024, 0.03, 0.04], '#f0ece4', TL.plain), e3B('epauleR', 'wingR', [0, 0.012, 0.02], [0.024, 0.03, 0.04], '#f0ece4', TL.plain),
  ] }),
  // la bondrée : brune, la tête grise et petite, le dessous pâle barré
  e3_bondree: () => e3Rapace({ col: '#6a4e36', body: [0.16, 0.16, 0.32], head: [0.07, 0.07, 0.085], headCol: '#8a8e94', beak: [0.016, 0.018, 0.028], beakCol: '#222', tail: [0.1, 0.015, 0.22], tailCol: '#5a4434',
    wing: [0.6, 0.02, 0.22], wingCol: '#5e4430', leg: [0.02, 0.08], legCol: '#e0c030', ventre: '#d8c8a8', plus: [e3B('bandeQ', 'tail', [0, 0.006, -0.18], [0.102, 0.016, 0.03], '#2a2018', TL.plain)] }),
  // le moyen-duc : mince, roux strié, les aigrettes, les yeux orange
  e3_moyen_duc: () => rigPlus(birdParts({ col: rgbf('#a07a4a'), body: [0.15, 0.27, 0.14], bodyY: 0.2, head: [0.13, 0.12, 0.11], face: TL.catF, headCol: rgbf('#b8905a'), beak: [0.02, 0.025, 0.02], beakCol: rgbf('#2a2420'),
    tail: [0.08, 0.08, 0.04], wingCol: rgbf('#8a6a40'), leg: [0.025, 0.06], legCol: rgbf('#c8a878') }), [
    e3B('aigretteL', 'head', [-0.04, 0.12, 0.0], [0.022, 0.07, 0.018], '#3a2a1a', TL.fur, { o: [0, 0.03, 0], r0: [-0.15, 0, -0.18] }),
    e3B('aigretteR', 'head', [0.04, 0.12, 0.0], [0.022, 0.07, 0.018], '#3a2a1a', TL.fur, { o: [0, 0.03, 0], r0: [-0.15, 0, 0.18] }),
    e3B('oeilL', 'head', [-0.03, 0.07, 0.079], [0.026, 0.026, 0.004], '#f07818', TL.plain), e3B('oeilR', 'head', [0.03, 0.07, 0.079], [0.026, 0.026, 0.004], '#f07818', TL.plain),
    e3B('pupilleL', 'head', [-0.03, 0.07, 0.082], [0.01, 0.012, 0.003], '#140c08', TL.plain), e3B('pupilleR', 'head', [0.03, 0.07, 0.082], [0.01, 0.012, 0.003], '#140c08', TL.plain),
    e3B('stries', 'body', [0, -0.01, 0.06], [0.12, 0.2, 0.024], '#d8b888', TL.stripes),
  ]),
  // la musaraigne carrelet : brune, les flancs clairs, le museau long
  e3_musaraigne: () => e3Musaraigne({ c: '#4a3426', v: '#b09a80', long: true, queue: [0.006, 0.006, 0.045] }),
  // le muscardin : couleur de miel, de grands yeux noirs, la queue touffue
  e3_muscardin: () => e3Musaraigne({ k: 1.15, c: '#d08a3a', v: '#f0d8a8', museau: '#e0a060', pattes: '#e8c090', oeil: true, oreilles: true, queue: [0.02, 0.02, 0.065], queueCol: '#c87a30' }),
  // le lézard vivipare : brun, une bande sombre au flanc
  e3_lezard_vivipare: () => {
    const { P, add } = rigParts();
    const c = rgbf('#6a5438'), c2 = rgbf('#3e3020'), f = rgbf('#2a2016');
    add('body', null, [0, 0.011, 0], [0.02, 0.011, 0.05], [0, 0, 0], c, TL.scales);
    for (const s of [-1, 1]) add('bande' + s, 'body', [s * 0.0102, 0.002, 0], [0.002, 0.005, 0.05], [0, 0, 0], f, TL.plain);
    add('neck', 'body', [0, 0.002, 0.025], null);
    add('head', 'neck', [0, 0, 0], [0.016, 0.01, 0.022], [0, 0, 0.01], c2, TL.scales);
    for (const [n, sx, sz] of [['legFL', -1, 1], ['legFR', 1, 1], ['legBL', -1, -1], ['legBR', 1, -1]]) add(n, 'body', [sx * 0.011, -0.002, sz * 0.017], [0.016, 0.005, 0.005], [sx * 0.008, -0.003, 0], c2, TL.scales);
    add('tail', 'body', [0, 0, -0.025], [0.011, 0.008, 0.065], [0, 0, -0.032], c2, TL.scales);
    const r = new Rig(P); r.kind = 'quad'; r.cfg = {}; return r;
  },
  // la grenouille rousse : brune ou rousse, le masque sombre derrière l'œil
  e3_grenouille_rousse: () => e3Grenouille({ k: 0.85, c: '#9a6a3a', d: '#8a5a30', v: '#e8d8b0', masque: '#3a2418', oeil: '#c09040' }),
  // le morio : couleur de vin, bordé de jaune pâle, des points bleus
  e3_morio: () => e3Papillon({ aile: '#3a1612', bord: '#e8d890', W: 0.06, taches: [[0.72, 0.15, '#4060c0'], [0.72, -0.15, '#4060c0'], [0.72, 0.0, '#4060c0']] }),
  // la cicindèle : vert émeraude piqueté de blanc, de longues pattes, des mandibules
  e3_cicindele: () => e3Scarabee({ c: '#2a9a50', m: '#8a6a40', l: 0.012, L: 0.02, mandibules: 0.008, patte: 0.016, tache: '#ece4c0', taches: [[0.25, 0.25], [-0.25, 0.25], [0.25, -0.15], [-0.25, -0.15]] }),
  // ------------------------------------------------------------ le marais
  // le busard des roseaux : brun sombre, la tête crème
  e3_busard_roseaux: () => e3Rapace({ col: '#4e3424', body: [0.15, 0.15, 0.32], head: [0.07, 0.07, 0.085], headCol: '#e6d4a4', beak: [0.015, 0.018, 0.028], beakCol: '#222', tail: [0.09, 0.015, 0.22],
    tailCol: '#6a5a50', wing: [0.62, 0.02, 0.19], wingCol: '#4a3222', leg: [0.018, 0.09], legCol: '#e0c030', lent: [7, 0.4] }),
  // le bihoreau : trapu, le dos noir, les ailes grises, deux plumes blanches sur la nuque, l'œil rouge
  e3_bihoreau: () => e3Heron({ col: '#8a8e94', body: [0.18, 0.2, 0.3], neck: [0.06, 0.1, 0.06], neckR: [0.2, 0, 0], neckCol: '#e8e8e4', head: [0.085, 0.08, 0.1], headCol: '#1a2228',
    beak: [0.018, 0.018, 0.08], beakCol: '#1a1a1a', tail: [0.09, 0.03, 0.06], wingCol: '#8a8e94', leg: [0.022, 0.24], legCol: '#d8c040', plus: [
      e3B('dos', 'body', [0, 0.09, 0.02], [0.16, 0.03, 0.24], '#1a2228'), e3B('ventre', 'body', [0, -0.05, 0.04], [0.17, 0.1, 0.2], '#ecece8'),
      e3B('plumeN1', 'head', [-0.01, 0.06, -0.05], [0.006, 0.006, 0.16], '#f4f4f2', TL.plain, { o: [0, 0, -0.08], r0: [0.5, 0, 0] }),
      e3B('plumeN2', 'head', [0.01, 0.06, -0.05], [0.006, 0.006, 0.14], '#f4f4f2', TL.plain, { o: [0, 0, -0.07], r0: [0.55, 0, 0] }),
      e3B('oeilL', 'head', [-0.043, 0.05, 0.03], [0.004, 0.014, 0.014], '#c81818', TL.plain), e3B('oeilR', 'head', [0.043, 0.05, 0.03], [0.004, 0.014, 0.014], '#c81818', TL.plain),
    ] }),
  // l'aigrette : blanche, le bec et les pattes noirs, les doigts jaunes, les longues plumes du dos
  e3_aigrette: () => e3Heron({ col: '#f6f6f2', body: [0.13, 0.15, 0.27], neck: [0.035, 0.3, 0.035], neckR: [0.3, 0, 0], head: [0.05, 0.05, 0.08], beak: [0.014, 0.014, 0.11], beakCol: '#1a1a1a',
    tail: [0.07, 0.03, 0.06], leg: [0.016, 0.42], legCol: '#1a1a1a', vol: [1.2, -1.2, 1.35, 0.3], plus: [
      e3B('doigtsL', 'legFL', [0, -0.42, 0.015], [0.026, 0.012, 0.05], '#e8d020', TL.plain), e3B('doigtsR', 'legFR', [0, -0.42, 0.015], [0.026, 0.012, 0.05], '#e8d020', TL.plain),
      e3B('plumes', 'body', [0, 0.07, -0.08], [0.1, 0.01, 0.26], '#ffffff', TL.plain, { o: [0, 0, -0.1], r0: [0.25, 0, 0] }),
      e3B('plumeN', 'head', [0, 0.04, -0.03], [0.006, 0.006, 0.12], '#ffffff', TL.plain, { o: [0, 0, -0.06], r0: [0.6, 0, 0] }),
    ] }),
  // le râle d'eau : mince comme une lame, le bec rouge, la face grise, les flancs rayés
  e3_rale_eau: () => rigPlus(birdParts({ col: rgbf('#6a5034'), body: [0.065, 0.09, 0.18], bodyY: 0.045 + 0.07, head: [0.05, 0.055, 0.06], headCol: rgbf('#6e7680'), beak: [0.01, 0.012, 0.048], beakCol: rgbf('#c82a20'),
    tail: [0.035, 0.012, 0.04], tailCol: rgbf('#4a3828'), tailUp: 0.6, wingCol: rgbf('#5a4430'), leg: [0.012, 0.07], legCol: rgbf('#b88070') }), [
    e3B('poitrine', 'body', [0, -0.005, 0.06], [0.066, 0.06, 0.06], '#727a84'),
    e3B('flancs', 'body', [0, -0.025, -0.02], [0.068, 0.04, 0.1], '#e8e4dc', TL.stripes),
    e3B('dessousQ', 'tail', [0, -0.01, -0.02], [0.03, 0.01, 0.03], '#f0ece4', TL.plain),
  ]),
  // la bécassine : rayée de crème, le bec très long
  e3_becassine: () => e3LongBec({ col: '#5e4630', body: [0.09, 0.08, 0.15], head: [0.05, 0.05, 0.055], headCol: '#7a6044', beak: [0.008, 0.008, 0.07], beakCol: '#6a5a48', tail: [0.05, 0.01, 0.04],
    wingCol: '#4e3a28', leg: [0.01, 0.05], legCol: '#8a9a60', raie: '#1e140c', barre: '#e0c890', plus: [e3B('ventre', 'body', [0, -0.025, 0.01], [0.085, 0.03, 0.11], '#f0ece0')] }),
  // la poule d'eau : ardoise, l'écusson rouge, le bec rouge à pointe jaune, la ligne blanche au flanc
  e3_poule_eau: () => rigPlus(birdParts({ col: rgbf('#2a2e34'), body: [0.13, 0.12, 0.22], bodyY: 0.06 + 0.09, head: [0.06, 0.06, 0.065], beak: [0.016, 0.016, 0.03], beakCol: rgbf('#d02a1e'),
    tail: [0.06, 0.02, 0.05], tailUp: 0.5, wingCol: rgbf('#3a3428'), leg: [0.016, 0.09], legCol: rgbf('#a8b840') }), [
    e3B('ecusson', 'head', [0, 0.04, 0.034], [0.022, 0.026, 0.012], '#d02a1e', TL.plain),
    e3B('pointe', 'beak', [0, 0, 0.012], [0.017, 0.017, 0.01], '#e8d030', TL.plain),
    e3B('ligneL', 'body', [-0.066, 0.01, 0], [0.004, 0.012, 0.14], '#f0f0ec', TL.plain), e3B('ligneR', 'body', [0.066, 0.01, 0], [0.004, 0.012, 0.14], '#f0f0ec', TL.plain),
    e3B('dessousQ', 'tail', [0, -0.012, -0.02], [0.05, 0.016, 0.04], '#f4f4f0', TL.plain),
  ]),
  // la rainette : vert pomme, une raie sombre au flanc
  e3_rainette: () => e3Grenouille({ k: 0.42, c: '#4cb030', tex: TL.plain, v: '#f0f0d8', raie: '#3a3020', oeil: '#d8b040' }),
  // la sangsue : un ver noir et plat, rayé de roux (pose de la vipère : elle ondule)
  e3_sangsue: () => {
    const { P, add } = rigParts();
    const c = rgbf('#24201c'), c2 = rgbf('#7a4a24');
    add('body', null, [0, 0.004, 0], [0.012, 0.005, 0.014], [0, 0, 0], c, TL.skin);
    add('head', 'body', [0, 0, 0.01], [0.008, 0.004, 0.012], [0, 0, 0.005], c, TL.skin);
    let par = 'body';
    for (let k = 0; k < 7; k++) { const n = 'seg' + k; add(n, par, [0, 0, -0.012], [0.013 - Math.abs(k - 2) * 0.0012, 0.005, 0.012], [0, 0, -0.006], k % 2 ? c2 : c, TL.skin); par = n; }
    const r = new Rig(P); r.kind = 'snake'; return r;
  },
  // la crossope : noire dessus, blanche dessous
  e3_crossope: () => e3Musaraigne({ k: 1.1, c: '#16161a', v: '#e8e8e4', museau: '#a07070', long: true, pattes: '#d8c8c0', queue: [0.007, 0.01, 0.05] }),
  // le cuivré des marais : orange de cuivre, bordé de sombre, des points noirs
  e3_cuivre_marais: () => e3Papillon({ aile: '#f07020', bord: '#3a2010', W: 0.04, taches: [[0.4, 0.2, '#1a1008'], [0.55, -0.1, '#1a1008']] }),
});
