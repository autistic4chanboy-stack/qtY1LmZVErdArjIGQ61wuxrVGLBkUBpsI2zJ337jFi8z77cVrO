// ============================================================================
//  LES CRÉATURES DES TERRES D'AVANT (agent V2) — les modèles
//  Quinze squelettes en boîtes (façon 1996, comme le reste du jeu : boîtes
//  effilées de 07-zzzzz-personnages.js, TF.*), leurs poses, dix tuiles de peau
//  (180…189 : visages et textures), et les objets posés des repaires
//  (statues de pierre du Jardin, l'œuf, la pierre plate, les socles, les nids,
//  les offrandes, la corde, l'arbre creux).
//  V2_RIGS[espece](v) → un Rig neuf (chaque bête a le sien : il garde sa pose) ;
//  V2_POSES[espece](rig, e, t) pose la bête (e : l'entité du moteur) et rend le
//  décalage en hauteur à appliquer au dessin.
// ============================================================================
Object.assign(TL, { v2Garou: 180, v2Stryge: 181, v2Gargouille: 182, v2Korrigan: 183, v2Basilic: 184, v2Lion: 185, v2Noye: 186, v2Plumes: 187, v2Carapace: 188, v2Ecoutant: 189 });

// ---------------------------------------------------------------- les tuiles (fond clair : la couleur de la pièce teinte)
function v2Tuiles(cv) {
  const ctx = cv.getContext('2d');
  const T = (idx, fn) => {
    const img = ctx.createImageData(16, 16), D = img.data;
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      let c = fn(x, y); if (typeof c === 'number') c = [c, c, c];
      const k = (y * 16 + x) * 4;
      D[k] = clamp(Math.round(c[0]), 0, 255); D[k + 1] = clamp(Math.round(c[1]), 0, 255); D[k + 2] = clamp(Math.round(c[2]), 0, 255); D[k + 3] = 255;
    }
    ctx.putImageData(img, (idx % 16) * 16, Math.floor(idx / 16) * 16);
  };
  const N = (x, y, s) => hash2i(x, y, s);
  const ex = (x) => (x <= 7 ? x : 15 - x); // colonnes en miroir
  // le garou : poil sombre, des yeux d'homme sous un front bas
  T(TL.v2Garou, (x, y) => {
    let v = 236 - N(x, y, 1801) * 30 - (y < 4 ? 18 : 0);
    const e = ex(x);
    if (y === 5 && e >= 2 && e <= 6) v = 120;               // le front, qui pèse
    if (y === 6 && e >= 3 && e <= 5) return e === 4 ? [40, 30, 20] : [230, 220, 190]; // l'œil : blanc d'homme, prunelle
    if (y === 7 && e >= 3 && e <= 5) v = 150;
    if (y >= 12 && e >= 5) v = 90;
    return v;
  });
  // la stryge : un visage de femme, pâle, les yeux deux trous noirs
  T(TL.v2Stryge, (x, y) => {
    const e = ex(x);
    let v = 246 - N(x, y, 1811) * 8 - (e === 0 ? 30 : e === 1 ? 12 : 0);
    if (y <= 2) return 60 + N(x, y, 1812) * 30;              // les cheveux, sur le front
    if ((y === 6 || y === 7) && e >= 3 && e <= 5) return 14;
    if (y === 8 && e === 4) return 40;
    if (y === 10 && e >= 6) v = 190;                       // l'arête du nez
    if (y === 12 && e >= 5 && e <= 7) return [120, 70, 70];  // la bouche, mince
    return v;
  });
  // la gargouille : une grimace de pierre, des orbites creuses, la gueule ouverte
  T(TL.v2Gargouille, (x, y) => {
    const e = ex(x);
    let v = 220 - N(x, y, 1821) * 40;
    if (y === 4 && e >= 2 && e <= 6) v = 150;
    if ((y === 5 || y === 6) && e >= 3 && e <= 5) v = 30;
    if (y >= 10 && y <= 13 && e >= 3) v = y === 10 || y === 13 ? 120 : 26;
    if ((y === 10 || y === 13) && e >= 3 && x % 2 === 0) v = 236;  // les dents
    return v;
  });
  // le korrigan : ridé, brun, les yeux rouges, un sourire trop large
  T(TL.v2Korrigan, (x, y) => {
    const e = ex(x);
    let v = 228 - N(x, y, 1831) * 26 - (y % 3 === 0 ? 14 : 0);
    if (y === 6 && e >= 3 && e <= 5) return e === 4 ? [255, 40, 20] : [90, 30, 20];
    if (y === 11 && e >= 2) v = 40;
    if (y === 10 && e === 2) v = 60;
    return v;
  });
  // le basilic : écailles sombres, deux grands yeux jaunes à pupille fendue
  T(TL.v2Basilic, (x, y) => {
    const e = ex(x);
    let v = 200 + ((x + (y >> 1)) % 3 === 0 ? -40 : 0) + N(x, y, 1841) * 20;
    if (y >= 4 && y <= 8 && e >= 2 && e <= 6) { const d = Math.hypot(e - 4, y - 6); if (d < 2.3) return e === 4 ? [20, 16, 8] : [255, 214, 40]; }
    return v;
  });
  // le lion (la Chimère, la Tarasque) : face fauve, yeux d'ambre, la truffe sombre
  T(TL.v2Lion, (x, y) => {
    const e = ex(x);
    let v = 236 - N(x, y, 1851) * 22;
    if (y === 5 && e >= 3 && e <= 5) return e === 4 ? [30, 20, 10] : [230, 170, 50];
    if (y >= 9 && y <= 11 && e >= 6) v = 50;
    if (y === 13 && e >= 4) v = 110;
    if (e === 0) v -= 40;
    return v;
  });
  // le noyé : gonflé, gris-bleu, les yeux blancs, la bouche noire
  T(TL.v2Noye, (x, y) => {
    const e = ex(x);
    let v = 232 - N(x, y, 1861) * 16 - (e <= 1 ? 26 : 0);
    if (y <= 2) return 40 + N(x, y, 1862) * 20;
    if (y === 6 && e >= 3 && e <= 5) return [250, 252, 248];
    if (y === 7 && e >= 3 && e <= 5) v = 170;
    if (y === 12 && e >= 4) return [40, 30, 40];
    return v;
  });
  // les plumes (stryge) : rangs d'écailles douces
  T(TL.v2Plumes, (x, y) => {
    const r = Math.floor(y / 4), xx = (x + (r % 2) * 2) % 4, yy = y % 4;
    return 212 + N(x, y, 1871) * 30 - (yy === 3 ? 50 : 0) - (xx === 0 ? 24 : 0);
  });
  // la carapace (tarasque) : grandes plaques sombres, arêtes claires
  T(TL.v2Carapace, (x, y) => {
    const c = Math.floor(x / 8) + Math.floor((y + (Math.floor(x / 8) % 2) * 4) / 8) * 2, lx = x % 8, ly = (y + (Math.floor(x / 8) % 2) * 4) % 8;
    let v = 150 + N(c, 1, 1881) * 40 + N(x, y, 1882) * 20;
    if (lx === 0 || ly === 0) v = 236;
    if (lx === 7 || ly === 7) v = 90;
    return v;
  });
  // l'écoutant : pas d'yeux ; deux creux à la place des oreilles, une fente pour la bouche
  T(TL.v2Ecoutant, (x, y) => {
    const e = ex(x);
    let v = 240 - N(x, y, 1891) * 10 - (e === 0 ? 30 : 0);
    if (y === 6 && e >= 3 && e <= 5) v = 214;  // là où les yeux devraient être : rien, une peau plus lisse
    if (y === 12 && e >= 5) v = 70;
    if (y >= 13 && e >= 6) v = 210;
    return v;
  });
}
{
  const _bsa = buildSkinAtlas;
  buildSkinAtlas = function () {
    _bsa();
    try { v2Tuiles(SKIN.canvas); } catch (e) { console.warn('V2 : tuiles', e); }
  };
}

// ---------------------------------------------------------------- les squelettes
const V2C = (h) => rgbf(h);
const V2_OS = V2C('#e2dccb'), V2_ROUGE_OEIL = [1.0, 0.25, 0.1], V2_JAUNE_OEIL = [1.0, 0.85, 0.3];
const V2_RIGS = {
  // ---------------------------------------------------------------- le garou : un loup qui se tient debout, voûté
  v2_garou(v) {
    const { P, add } = rigParts();
    const fur = V2C(['#4a4440', '#3a3634', '#5a524a'][v % 3]), dk = v3.scale(fur, 0.62), rag = V2C(['#5a3a2a', '#3a4a3a', '#4a3a4a'][v % 3]);
    add('hips', null, [0, 0.98, 0], [0.38, 0.26, 0.28], [0, 0, 0], fur, TL.fur, { shp: TF.bassin });
    for (const [n, s] of [['L', -1], ['R', 1]]) {
      add('leg' + n, 'hips', [s * 0.13, -0.05, 0], [0.17, 0.48, 0.22], [0, -0.22, 0.02], fur, TL.fur, { r0: [-0.5, 0, 0], shp: TF.cuisse });
      add('shin' + n, 'leg' + n, [0, -0.44, 0.04], [0.12, 0.46, 0.13], [0, -0.21, 0], dk, TL.fur, { r0: [0.95, 0, 0], shp: TF.mollet });
      add('paw' + n, 'shin' + n, [0, -0.43, 0], [0.15, 0.08, 0.26], [0, -0.02, 0.08], dk, TL.fur, { r0: [-0.45, 0, 0] });
    }
    add('torso', 'hips', [0, 0.1, 0], [0.54, 0.72, 0.38], [0, 0.34, 0.04], fur, TL.fur, { r0: [0.55, 0, 0], shp: TF.torseH });
    add('rag', 'torso', [0, 0.04, 0], [0.57, 0.3, 0.41], [0, 0.12, 0.05], rag, TL.cloth2);
    add('neck', 'torso', [0, 0.68, 0.1], [0.22, 0.2, 0.22], [0, 0.06, 0.02], fur, TL.fur, { r0: [-0.45, 0, 0], shp: TF.cou });
    add('head', 'neck', [0, 0.14, 0.04], [0.3, 0.28, 0.3], [0, 0.04, 0.08], fur, tx(TL.fur, TL.v2Garou));
    add('snout', 'head', [0, -0.02, 0.22], [0.16, 0.14, 0.24], [0, 0, 0.1], fur, TL.fur);
    add('jaw', 'head', [0, -0.1, 0.18], [0.13, 0.05, 0.22], [0, -0.02, 0.09], dk, TL.fur);
    add('truffe', 'snout', [0, 0.05, 0.22], [0.07, 0.05, 0.04], [0, 0, 0], [0.08, 0.07, 0.07], TL.plain);
    for (const [n, s] of [['L', -1], ['R', 1]]) {
      add('ear' + n, 'head', [s * 0.1, 0.17, 0.01], [0.08, 0.17, 0.05], [0, 0.07, 0], fur, TL.fur, { shp: TF.pointe, r0: [0, 0, -s * 0.15] });
      add('oeil' + n, 'head', [s * 0.075, 0.075, 0.235], [0.045, 0.025, 0.01], [0, 0, 0], V2_JAUNE_OEIL, TL.plain);
      add('arm' + n, 'torso', [s * 0.31, 0.6, 0.06], [0.14, 0.6, 0.16], [0, -0.28, 0], fur, TL.fur, { shp: TF.bras });
      add('fore' + n, 'arm' + n, [0, -0.58, 0], [0.12, 0.56, 0.13], [0, -0.27, 0], fur, TL.fur, { shp: TF.avantBras });
      add('hand' + n, 'fore' + n, [0, -0.56, 0.02], [0.15, 0.13, 0.16], [0, -0.05, 0], dk, TL.fur);
      for (let k = 0; k < 3; k++) add('griffe' + n + k, 'hand' + n, [(k - 1) * 0.045, -0.1, 0.05], [0.022, 0.1, 0.022], [0, -0.045, 0], V2_OS, TL.bone, { r0: [-0.35, 0, 0] });
    }
    add('tail', 'hips', [0, 0.06, -0.14], [0.11, 0.11, 0.55], [0, 0, -0.27], fur, TL.fur, { r0: [0.8, 0, 0] });
    const r = new Rig(P); r.kind = 'v2'; return r;
  },
  // ---------------------------------------------------------------- le mange-mort : nu, gris, long, des dents d'homme
  v2_charognard(v) {
    const { P, add } = rigParts();
    const peau = V2C(['#a89088', '#9a8c84', '#b09890'][v % 3]), dk = v3.scale(peau, 0.62);
    add('body', null, [0, 0.72, 0], [0.3, 0.3, 0.86], [0, 0, 0], peau, TL.skin, { shp: TF.torseE });
    add('cotes', 'body', [0, -0.02, 0.14], [0.315, 0.22, 0.38], [0, 0, 0], v3.scale(peau, 0.9), TL.stripes);
    add('echine', 'body', [0, 0.155, 0], [0.06, 0.05, 0.82], [0, 0, 0], dk, TL.skin);
    for (const [n, sx, sz] of [['FL', -1, 1], ['FR', 1, 1], ['BL', -1, -1], ['BR', 1, -1]]) {
      add('leg' + n, 'body', [sx * 0.12, -0.08, sz * 0.32], [0.075, 0.38, 0.09], [0, -0.17, 0], peau, TL.skin, { shp: TF.membrePale });
      add('tib' + n, 'leg' + n, [0, -0.36, 0], [0.06, 0.34, 0.07], [0, -0.16, 0], dk, TL.skin, { r0: [sz > 0 ? 0.25 : -0.3, 0, 0] });
    }
    add('neck', 'body', [0, 0.06, 0.42], [0.11, 0.11, 0.36], [0, 0, 0.16], peau, TL.skin, { r0: [0.4, 0, 0] });
    add('head', 'neck', [0, 0, 0.32], [0.17, 0.16, 0.36], [0, 0, 0.16], peau, TL.skin);
    add('dents', 'head', [0, -0.055, 0.34], [0.13, 0.05, 0.025], [0, 0, 0], [0.92, 0.88, 0.76], TL.plain);
    add('levre', 'head', [0, -0.015, 0.32], [0.15, 0.03, 0.05], [0, 0, 0], dk, TL.skin);
    for (const s of [-1, 1]) add('oeil' + s, 'head', [s * 0.07, 0.04, 0.24], [0.02, 0.02, 0.02], [0, 0, 0], [0.05, 0.04, 0.03], TL.plain);
    add('tail', 'body', [0, 0.05, -0.43], [0.04, 0.04, 0.55], [0, 0, -0.27], peau, TL.skin, { r0: [0.55, 0, 0] });
    const r = new Rig(P); r.kind = 'v2'; return r;
  },
  // ---------------------------------------------------------------- le pendu : un homme maigre, un sac sur la tête, la corde au cou
  v2_pendu(v) {
    const r = humanRig({ skin: ['#8a9490', '#9a9088', '#7e8884'][v % 3], hair: '#2a2420', hairStyle: 'court', top: ['#4a4038', '#3a3a34', '#504436'][v % 3], bottom: '#3a332c', shoe: '#2a2018', build: 'mince' });
    return rigPlus(r, [
      { name: 'sac', parent: 'head', p: [0, 0.16, 0], s: [0.34, 0.4, 0.34], col: V2C('#a89878'), tex: TL.sack },
      { name: 'noeud', parent: 'neck', p: [0, 0.02, 0], s: [0.17, 0.06, 0.17], col: V2C('#4a3a2a'), tex: TL.rope },
      { name: 'planche', parent: 'torso', p: [0, 0.36, 0.14], s: [0.32, 0.15, 0.025], col: V2C('#8a7050'), tex: TL.wood },
      { name: 'lettres', parent: 'planche', p: [0, 0, 0.014], s: [0.26, 0.05, 0.005], col: [0.12, 0.1, 0.08], tex: TL.plain },
    ]);
  },
  // ---------------------------------------------------------------- l'écoutant : très grand, très maigre, sans yeux, des oreilles comme des mains
  v2_ecoutant() {
    const { P, add } = rigParts();
    const pale = V2C('#b0aca4'), dk = V2C('#8a857e');
    add('hips', null, [0, 1.32, 0], [0.26, 0.2, 0.16], [0, 0, 0], pale, TL.skin);
    for (const [n, s] of [['L', -1], ['R', 1]]) {
      add('leg' + n, 'hips', [s * 0.09, -0.06, 0], [0.09, 0.7, 0.1], [0, -0.33, 0], pale, TL.skin, { shp: TF.membrePale });
      add('shin' + n, 'leg' + n, [0, -0.66, 0], [0.075, 0.62, 0.085], [0, -0.3, 0], dk, TL.skin, { shp: TF.membrePale });
      add('pied' + n, 'shin' + n, [0, -0.62, 0.02], [0.09, 0.05, 0.26], [0, 0, 0.09], dk, TL.skin);
    }
    add('torso', 'hips', [0, 0.06, 0], [0.3, 0.8, 0.17], [0, 0.38, 0], pale, TL.skin, { r0: [0.45, 0, 0], shp: TF.torseE });
    add('cotes', 'torso', [0, 0.42, 0.02], [0.31, 0.3, 0.16], [0, 0, 0], v3.scale(pale, 0.92), TL.stripes);
    add('neck', 'torso', [0, 0.78, 0.02], [0.07, 0.3, 0.07], [0, 0.13, 0], pale, TL.skin, { r0: [-0.55, 0, 0] });
    add('head', 'neck', [0, 0.28, 0.02], [0.28, 0.34, 0.27], [0, 0.12, 0.05], pale, tx(TL.skin, TL.v2Ecoutant));
    for (const [n, s] of [['L', -1], ['R', 1]]) {
      add('oreille' + n, 'head', [s * 0.15, 0.12, 0], [0.03, 0.36, 0.28], [s * 0.01, 0.02, -0.02], dk, TL.skin, { r0: [0, s * 0.45, 0], shp: TF.oreille });
      add('arm' + n, 'torso', [s * 0.19, 0.76, 0], [0.065, 0.95, 0.07], [0, -0.45, 0], pale, TL.skin, { shp: TF.membrePale });
      add('fore' + n, 'arm' + n, [0, -0.92, 0], [0.055, 0.9, 0.06], [0, -0.43, 0], dk, TL.skin, { shp: TF.membrePale });
      for (let k = 0; k < 4; k++) add('doigt' + n + k, 'fore' + n, [(k - 1.5) * 0.022, -0.88, 0.01], [0.014, 0.3, 0.014], [0, -0.14, 0], dk, TL.skin, { r0: [-0.2 + k * 0.05, 0, (k - 1.5) * 0.08] });
    }
    const r = new Rig(P); r.kind = 'v2'; return r;
  },
  // ---------------------------------------------------------------- la gargouille : accroupie, ailes repliées, cornes, gueule ouverte
  v2_gargouille(v) {
    const { P, add } = rigParts();
    const pierre = V2C(['#77756e', '#6e6c66', '#7e7a70'][v % 3]), dk = v3.scale(pierre, 0.8);
    add('base', null, [0, 0, 0], null);
    add('body', 'base', [0, 0.62, -0.05], [0.46, 0.5, 0.52], [0, 0, 0], pierre, TL.stone, { r0: [0.35, 0, 0], shp: TF.torseRond });
    for (const [n, s] of [['L', -1], ['R', 1]]) {
      add('cuisse' + n, 'body', [s * 0.18, -0.18, 0.08], [0.17, 0.38, 0.18], [0, -0.17, 0], pierre, TL.stone, { r0: [-1.45, 0, 0] });
      add('jambe' + n, 'cuisse' + n, [0, -0.36, 0], [0.14, 0.4, 0.15], [0, -0.18, 0], dk, TL.stone, { r0: [1.5, 0, 0] });
      add('pied' + n, 'jambe' + n, [0, -0.38, 0.03], [0.18, 0.08, 0.28], [0, 0, 0.08], dk, TL.stone, { r0: [-0.3, 0, 0] });
      add('bras' + n, 'body', [s * 0.27, 0.16, 0.12], [0.12, 0.42, 0.13], [0, -0.19, 0], pierre, TL.stone, { r0: [-0.6, 0, s * 0.1] });
      add('avant' + n, 'bras' + n, [0, -0.4, 0], [0.1, 0.38, 0.11], [0, -0.17, 0], dk, TL.stone, { r0: [-0.25, 0, 0] });
      for (let k = 0; k < 3; k++) add('griffe' + n + k, 'avant' + n, [(k - 1) * 0.035, -0.37, 0.03], [0.022, 0.1, 0.022], [0, -0.04, 0], dk, TL.stone, { r0: [-0.4, 0, 0] });
      add('aile' + n, 'body', [s * 0.18, 0.18, -0.2], [0.84, 0.05, 0.52], [s * 0.42, 0, -0.08], dk, TL.stone, { r0: [0.2, 0, -s * 1.35] });
      add('corne' + n, 'body', [s * 0.11, 0.45, 0.24], [0.06, 0.3, 0.06], [0, 0.13, 0], V2C('#4a4844'), TL.stone, { r0: [-0.7, 0, -s * 0.35], shp: TF.pointe });
    }
    add('head', 'body', [0, 0.3, 0.2], [0.34, 0.32, 0.36], [0, 0.06, 0.08], pierre, tx(TL.stone, TL.v2Gargouille));
    add('machoire', 'head', [0, -0.1, 0.06], [0.28, 0.08, 0.3], [0, -0.03, 0.08], dk, TL.stone, { r0: [0.3, 0, 0] });
    add('queue', 'body', [0, -0.18, -0.25], [0.08, 0.08, 0.55], [0, 0, -0.26], dk, TL.stone, { r0: [0.9, 0, 0] });
    const r = new Rig(P); r.kind = 'v2'; return r;
  },
  // ---------------------------------------------------------------- la stryge : un grand oiseau de nuit au visage de femme
  v2_stryge(v) {
    const { P, add } = rigParts();
    const pl = V2C(['#8a8076', '#7a726a', '#9a9084'][v % 3]), dk = v3.scale(pl, 0.7), visage = V2C('#e4dcd2'), cheveux = V2C('#1a1614');
    add('body', null, [0, 0.36, 0], [0.32, 0.44, 0.3], [0, 0, 0], pl, TL.v2Plumes, { shp: TF.torseRond });
    add('neck', 'body', [0, 0.22, 0.05], null);
    add('head', 'neck', [0, 0.02, 0], [0.27, 0.27, 0.22], [0, 0.13, 0.03], pl, TL.v2Plumes);
    add('visage', 'head', [0, 0.12, 0.145], [0.2, 0.22, 0.02], [0, 0, 0], visage, tx(TL.skin, TL.v2Stryge));
    add('cheveux', 'head', [0, 0.22, -0.1], [0.28, 0.4, 0.06], [0, -0.17, 0], cheveux, TL.hair);
    for (const [n, s] of [['L', -1], ['R', 1]]) {
      add('wing' + n, 'body', [s * 0.15, 0.12, 0], [0.78, 0.04, 0.36], [s * 0.39, 0, -0.04], dk, TL.v2Plumes);
      add('remige' + n, 'wing' + n, [s * 0.7, 0, -0.1], [0.3, 0.03, 0.42], [s * 0.12, 0, -0.08], v3.scale(dk, 0.85), TL.v2Plumes);
      add('patte' + n, 'body', [s * 0.07, -0.22, 0.02], [0.04, 0.16, 0.04], [0, -0.08, 0], V2C('#3a3028'), TL.plain);
      for (let k = 0; k < 3; k++) add('serre' + n + k, 'patte' + n, [(k - 1) * 0.025, -0.16, 0.02], [0.016, 0.08, 0.016], [0, -0.03, 0], [0.1, 0.08, 0.06], TL.plain, { r0: [-0.8, 0, 0] });
    }
    add('tail', 'body', [0, -0.12, -0.15], [0.2, 0.04, 0.26], [0, 0, -0.12], dk, TL.v2Plumes, { r0: [0.3, 0, 0] });
    const r = new Rig(P); r.kind = 'v2'; return r;
  },
  // ---------------------------------------------------------------- le basilic : un long serpent à tête de coq, le cou dressé
  v2_basilic() {
    const { P, add } = rigParts();
    const corps = V2C('#2e3628'), ventre = V2C('#7a6a34'), crete = V2C('#b02a1a');
    add('base', null, [0, 0, 0], null);
    add('cou', 'base', [0, 0.12, 0.3], [0.2, 0.78, 0.22], [0, 0.36, 0], corps, TL.scales, { r0: [-0.25, 0, 0], shp: TF.cou });
    add('gorge', 'cou', [0, 0.3, 0.1], [0.14, 0.6, 0.05], [0, 0, 0], ventre, TL.scales);
    add('head', 'cou', [0, 0.76, 0.02], [0.24, 0.24, 0.32], [0, 0.04, 0.1], corps, tx(TL.scales, TL.v2Basilic));
    add('bec', 'head', [0, 0.0, 0.27], [0.1, 0.08, 0.15], [0, 0, 0.06], V2C('#d8b030'), TL.plain, { shp: TF.nez });
    add('crete', 'head', [0, 0.16, 0.04], [0.05, 0.22, 0.3], [0, 0.08, 0], crete, TL.skin);
    add('barbillon', 'head', [0, -0.13, 0.18], [0.09, 0.14, 0.04], [0, -0.05, 0], crete, TL.skin);
    for (const s of [-1, 1]) add('oeil' + s, 'head', [s * 0.125, 0.07, 0.14], [0.01, 0.06, 0.06], [0, 0, 0], V2_JAUNE_OEIL, TL.plain);
    let par = 'base';
    for (let k = 0; k < 9; k++) {
      const n = 'b' + k, w = 0.32 - k * 0.026, h = 0.26 - k * 0.018;
      add(n, par, k ? [0, 0, -0.44] : [0, 0.13, 0.28], [w, h, 0.46], [0, 0, -0.22], k % 2 ? corps : v3.scale(corps, 0.86), TL.scales);
      par = n;
    }
    for (const s of [-1, 1]) add('aile' + s, 'b0', [s * 0.17, 0.08, -0.12], [0.03, 0.24, 0.38], [0, 0.04, -0.1], v3.scale(corps, 1.3), TL.fur, { r0: [0.2, 0, s * 0.5] });
    const r = new Rig(P); r.kind = 'v2'; return r;
  },
  // ---------------------------------------------------------------- la tarasque : une carapace d'épines, six pattes, une tête de lion
  v2_tarasque() {
    const { P, add } = rigParts();
    const dos = V2C('#3e4430'), peau = V2C('#5e5a40'), crin = V2C('#4a3622'), ruban = V2C('#3a5aa0');
    add('corps', null, [0, 1.15, 0], [2.0, 1.0, 3.4], [0, 0, 0], peau, TL.scales);
    add('cara0', 'corps', [0, 0.48, 0], [3.0, 0.7, 4.2], [0, 0, 0], dos, TL.v2Carapace);
    add('cara1', 'corps', [0, 0.92, -0.1], [2.3, 0.5, 3.3], [0, 0, 0], dos, TL.v2Carapace);
    add('cara2', 'corps', [0, 1.27, -0.15], [1.5, 0.4, 2.3], [0, 0, 0], dos, TL.v2Carapace);
    const pics = [[-1.2, 0.8, 1.4, -0.6], [1.2, 0.8, 1.4, 0.6], [-1.3, 0.8, 0, -0.7], [1.3, 0.8, 0, 0.7], [-1.2, 0.8, -1.5, -0.6], [1.2, 0.8, -1.5, 0.6],
      [-0.8, 1.2, 0.9, -0.4], [0.8, 1.2, 0.9, 0.4], [-0.9, 1.2, -0.9, -0.4], [0.9, 1.2, -0.9, 0.4], [0, 1.47, 0.6, 0], [0, 1.47, -0.5, 0], [-0.5, 1.47, 0, -0.2], [0.5, 1.47, 0, 0.2]];
    pics.forEach(([x, y, z, rz], k) => add('pic' + k, 'corps', [x, y, z], [0.22, 0.62, 0.22], [0, 0.28, 0], V2C('#c8c0a0'), TL.bone, { r0: [z * 0.15, 0, -rz], shp: TF.pointe }));
    for (const [n, x, z] of [['FL', -1.05, 1.15], ['FR', 1.05, 1.15], ['ML', -1.15, 0], ['MR', 1.15, 0], ['BL', -1.05, -1.15], ['BR', 1.05, -1.15]]) {
      add('p' + n, 'corps', [x, -0.25, z], [0.5, 0.95, 0.5], [0, -0.4, 0], peau, TL.scales, { shp: TF.mollet });
      add('pied' + n, 'p' + n, [0, -0.86, 0.08], [0.58, 0.16, 0.66], [0, 0, 0.12], v3.scale(peau, 0.8), TL.scales);
    }
    add('cou', 'corps', [0, 0.1, 1.75], [0.82, 0.72, 0.8], [0, 0, 0.3], peau, TL.scales);
    add('ruban', 'cou', [0, 0, 0.36], [0.88, 0.12, 0.86], [0, 0, 0], ruban, TL.cloth, { r0: [0.2, 0, 0] });
    add('head', 'cou', [0, 0.12, 0.68], [0.86, 0.8, 0.9], [0, 0, 0.32], V2C('#8a7848'), tx(TL.fur, TL.v2Lion));
    add('criniere', 'head', [0, 0.04, 0.02], [1.32, 1.24, 0.48], [0, 0, 0], crin, TL.hair);
    add('machoire', 'head', [0, -0.36, 0.3], [0.72, 0.18, 0.66], [0, -0.04, 0.2], v3.scale(peau, 0.9), TL.scales);
    add('crocs', 'machoire', [0, 0.1, 0.48], [0.6, 0.08, 0.06], [0, 0, 0], V2_OS, TL.bone);
    let par = 'corps';
    for (let k = 0; k < 5; k++) { const n = 'q' + k; add(n, par, k ? [0, 0, -0.62] : [0, -0.15, -1.75], [0.62 - k * 0.1, 0.5 - k * 0.07, 0.66], [0, 0, -0.31], peau, TL.scales, { r0: [k ? -0.05 : 0.15, 0, 0] }); par = n; }
    add('dard', 'q4', [0, 0, -0.6], [0.14, 0.5, 0.14], [0, 0.22, 0], V2C('#2a2a24'), TL.bone, { r0: [-1.57, 0, 0], shp: TF.pointe });
    const r = new Rig(P); r.kind = 'v2'; return r;
  },
  // ---------------------------------------------------------------- la chimère : lion, bouc sur le dos, serpent pour queue
  v2_chimere() {
    const fauve = V2C('#a8804a'), crin = V2C('#6a4a2a'), bouc = V2C('#3a3230'), serp = V2C('#3a5a34');
    const r = quadRig({ col: fauve, body: [0.72, 0.72, 1.55], bodyY: 1.02, leg: [0.2, 0.82], legD: 1.1, neck: [0, 0.24], head: [0.55, 0.52, 0.5], face: TL.v2Lion, headTex: TL.fur,
      snout: [0.28, 0.2, 0.16, -0.1], snoutCol: V2C('#c8a068'), ears: [0.12, 0.1, 0.06] });
    const u = [{ name: 'criniere', parent: 'head', p: [0, 0.02, -0.04], s: [0.86, 0.86, 0.36], col: crin, tex: TL.hair },
      { name: 'gcou', parent: 'body', p: [0.06, 0.34, 0.22], s: [0.16, 0.62, 0.18], o: [0, 0.3, 0], col: bouc, tex: TL.fur, r0: [-0.15, 0, -0.32], shp: TF.cou },
      { name: 'gtete', parent: 'gcou', p: [0, 0.62, 0.02], s: [0.2, 0.24, 0.36], o: [0, 0, 0.12], col: bouc, tex: tx(TL.fur, TL.deerF), r0: [0.2, 1.25, 0] },
      { name: 'gbarbe', parent: 'gtete', p: [0, -0.12, 0.24], s: [0.06, 0.16, 0.05], o: [0, -0.06, 0], col: v3.scale(bouc, 0.7), tex: TL.hair }];
    for (const s of [-1, 1]) u.push({ name: 'gcorne' + s, parent: 'gtete', p: [s * 0.06, 0.12, 0.02], s: [0.05, 0.38, 0.05], o: [0, 0.17, 0], col: V2C('#2a2420'), tex: TL.bone, r0: [-1.1, 0, s * 0.25], shp: TF.pointe });
    let par = 'body';
    for (let k = 0; k < 6; k++) { const n = 'sq' + k; u.push({ name: n, parent: par, p: k ? [0, 0, -0.38] : [0, 0.18, -0.76], s: [0.15 - k * 0.012, 0.14 - k * 0.011, 0.4], o: [0, 0, -0.19], col: k % 2 ? serp : v3.scale(serp, 0.85), tex: TL.scales, r0: [k === 0 ? -0.55 : k < 3 ? 0.18 : 0.1, 0, 0] }); par = n; }
    u.push({ name: 'stete', parent: 'sq5', p: [0, 0, -0.38], s: [0.17, 0.12, 0.26], o: [0, 0, 0.1], col: serp, tex: tx(TL.scales, TL.v2Basilic), r0: [0, Math.PI, 0] });
    const rr = rigPlus(r, u);
    rr.kind = 'v2';
    return rr;
  },
  // ---------------------------------------------------------------- la vouivre : un serpent ailé, une braise au front
  v2_vouivre() {
    const { P, add } = rigParts();
    const ec = V2C('#3a6a50'), ve = V2C('#c8b878'), aile = V2C('#2a3a34');
    add('base', null, [0, 0.5, 0], null);
    add('b0', 'base', [0, 0, 0.4], [0.44, 0.4, 0.62], [0, 0, -0.3], ec, TL.scales);
    add('ventre', 'b0', [0, -0.16, -0.3], [0.34, 0.1, 0.56], [0, 0, 0], ve, TL.scales);
    add('cou', 'b0', [0, 0.05, 0.02], [0.3, 0.3, 0.5], [0, 0, 0.24], ec, TL.scales, { r0: [-0.2, 0, 0] });
    add('head', 'cou', [0, 0.02, 0.48], [0.34, 0.26, 0.56], [0, 0, 0.26], ec, TL.scales, { r0: [0.2, 0, 0] });
    add('machoire', 'head', [0, -0.12, 0.1], [0.28, 0.08, 0.46], [0, -0.03, 0.2], v3.scale(ec, 0.8), TL.scales);
    add('gemme', 'head', [0, 0.14, 0.28], [0.11, 0.09, 0.08], [0, 0, 0], [1.0, 0.16, 0.08], TL.glass, { fl: FX_EMIT });
    for (const s of [-1, 1]) {
      add('oeil' + s, 'head', [s * 0.15, 0.06, 0.36], [0.02, 0.05, 0.08], [0, 0, 0], [0.9, 0.85, 0.5], TL.plain);
      add('corne' + s, 'head', [s * 0.11, 0.12, 0.06], [0.06, 0.32, 0.06], [0, 0.14, 0], V2C('#c8c0a0'), TL.bone, { r0: [-1.15, 0, s * 0.2], shp: TF.pointe });
      add('aile' + s, 'b0', [s * 0.2, 0.18, -0.12], [1.4, 0.06, 0.09], [s * 0.7, 0, 0], v3.scale(ec, 0.8), TL.scales);
      add('memb' + s, 'aile' + s, [0, 0, -0.04], [1.5, 0.02, 1.05], [s * 0.72, -0.01, -0.5], aile, TL.leather);
      add('patte' + s, 'b0', [s * 0.18, -0.16, -0.05], [0.08, 0.3, 0.08], [0, -0.13, 0.03], ec, TL.scales);
    }
    let par = 'b0';
    for (let k = 1; k < 10; k++) { const n = 'b' + k; add(n, par, [0, 0, -0.6], [0.42 - k * 0.032, 0.38 - k * 0.03, 0.62], [0, 0, -0.3], k % 2 ? v3.scale(ec, 0.88) : ec, TL.scales); par = n; }
    const r = new Rig(P); r.kind = 'v2'; return r;
  },
  // ---------------------------------------------------------------- le noyé : gris-bleu, gonflé, les cheveux collés
  v2_noye(v) {
    const r = humanRig({ skin: ['#7c8c90', '#86908e', '#748488'][v % 3], hair: '#1e1e1a', hairStyle: v % 2 ? 'long' : 'court', top: '#3a3e40', bottom: '#2e3234', shoe: '#1e2022', face: TL.v2Noye, build: v % 3 === 1 ? 'rond' : 'normal' });
    r.kind = 'v2';
    return r;
  },
  // ---------------------------------------------------------------- le korrigan : petit, ridé, les yeux rouges, un capuchon
  v2_korrigan(v) {
    const r = humanRig({ skin: ['#6a5240', '#5a4434', '#74583e'][v % 3], hair: '#d8d0c0', hairStyle: 'long', beard: 'longue', hat: 'capuche', hatCol: ['#7a2a1c', '#5a2418', '#6a3a1a'][v % 3],
      top: ['#4a3a28', '#3a3226', '#52402a'][v % 3], bottom: '#3a2e22', shoe: '#2a2018', face: TL.v2Korrigan, height: 0.72, build: 'rond' });
    const rr = rigPlus(r, [{ name: 'yeux', parent: 'head', p: [0, 0.12, 0.13], s: [0.14, 0.025, 0.01], col: V2_ROUGE_OEIL, tex: TL.plain, fl: FX_EMIT }]);
    rr.kind = 'v2';
    return rr;
  },
  // ---------------------------------------------------------------- le cerf-aux-mains : un cerf pâle, ses bois finissent en mains
  v2_cerf() {
    const r = scaleRig(ANIMAL_RIGS.deer(0, true), 1.12);
    for (const q of r.parts) if (q.s && !/^ant/.test(q.name)) q.col = q.name === 'head' ? V2C('#e0dcd4') : V2C('#cfcac0');
    const u = [];
    const main = (nom, par, tip) => {
      u.push({ name: nom, parent: par, p: [0, tip, 0], s: [0.1, 0.035, 0.12], col: V2_OS, tex: TL.bone });
      for (let k = 0; k < 4; k++) u.push({ name: nom + 'd' + k, parent: nom, p: [(k - 1.5) * 0.024, 0.01, 0.05], s: [0.016, 0.13, 0.016], o: [0, 0.06, 0], col: V2_OS, tex: TL.bone, r0: [-0.25 - k * 0.06, 0, (k - 1.5) * 0.12] });
      u.push({ name: nom + 'p', parent: nom, p: [0.06, 0, -0.01], s: [0.016, 0.1, 0.016], o: [0, 0.045, 0], col: V2_OS, tex: TL.bone, r0: [0, 0, -0.9] });
    };
    for (const s of [-1, 1]) { if (r.has('ant' + s)) main('main' + s, 'ant' + s, 0.47); if (r.has('antb' + s)) main('mainb' + s, 'antb' + s, 0.22); }
    const rr = rigPlus(r, u); rr.kind = 'quad'; rr.cfg = r.cfg;
    return rr;
  },
  // ---------------------------------------------------------------- le chien gris : grand, maigre, un collier de cuir
  v2_chien() {
    const r = scaleRig(ANIMAL_RIGS.dog(1), 1.35);
    for (const q of r.parts) if (q.s) q.col = q.name === 'snout' ? V2C('#5a5852') : V2C('#77736c');
    const rr = rigPlus(r, [
      { name: 'collier', parent: 'neck', p: [0, 0.02, 0.02], s: [0.2, 0.06, 0.2], col: V2C('#5a3a20'), tex: TL.leather },
      { name: 'plaque', parent: 'collier', p: [0, -0.05, 0.1], s: [0.06, 0.06, 0.01], col: V2C('#c8a050'), tex: TL.gold },
    ]);
    rr.kind = 'quad'; rr.cfg = r.cfg;
    return rr;
  },
  // ---------------------------------------------------------------- les sans-visage : des moutons gris, la tête lisse
  v2_sans_visage(v) {
    const r = ANIMAL_RIGS.sheep();
    for (const q of r.parts) {
      if (!q.s) continue;
      if (q.name === 'head') { q.col = V2C(['#cbbfb2', '#c2b6a8', '#d0c4b8'][v % 3]); q.tex = tx(TL.skin, TL.blankF); }
      else if (q.name === 'earL' || q.name === 'earR' || /^leg/.test(q.name)) q.col = V2C('#a8998a');
      else q.col = V2C(['#9a948c', '#8e8880', '#a49e94'][v % 3]);
    }
    return r;
  },
};

// ---------------------------------------------------------------- les poses (après la pose commune ; rendent un décalage en y)
// e : { move (0..1), phase, run, etat, dort, att (0..1 : un coup qui part), regard (rad, tête), t, nuit, mort, vol, ... }
function v2Yeux(rig, noms, on) { for (const n of noms) { const q = rig.part(n); if (q) q.fl = on ? FX_EMIT : 0; } }
const V2_POSES = {
  v2_garou(r, e, t) {
    const mv = e.move || 0, ph = e.phase || 0, run = e.run ? 1 : 0;
    v2Yeux(r, ['oeilL', 'oeilR'], (e.nuit || 0) > 0.5 && !e.dort && !e.mort);
    if (e.mort || e.dort) {
      // couché sur le flanc, en boule
      r.part('hips').p[1] = 0.32;
      r.set('hips', 0, 0, 1.45);
      r.set('torso', 0.9, 0, 0); r.set('neck', 0.5, 0, 0); r.set('head', 0.4, 0, 0);
      for (const n of ['L', 'R']) { r.set('leg' + n, -1.4, 0, 0); r.set('shin' + n, 1.9, 0, 0); r.set('arm' + n, -1.0, 0, 0); r.set('fore' + n, -1.2, 0, 0); }
      r.set('tail', 1.4, 0.8, 0);
      return 0;
    }
    r.part('hips').p[1] = 0.98 - run * 0.22;
    r.set('hips', 0, 0, 0);
    const a = (0.5 + run * 0.4) * mv, s = Math.sin(ph) * a;
    r.set('legL', -0.5 + s, 0, 0); r.set('legR', -0.5 - s, 0, 0);
    r.set('shinL', 0.95 + Math.max(0, -s) * 0.6, 0, 0); r.set('shinR', 0.95 + Math.max(0, s) * 0.6, 0, 0);
    r.set('torso', 0.55 + run * 0.65, 0, 0);
    r.set('neck', -0.45 - run * 0.55, 0, 0);
    // les bras : au pas, ils pendent et balancent ; en courant, ils frappent le sol comme des pattes
    const bras = run ? -1.25 : -0.15, ba = run ? 0.85 : 0.35;
    let aL = bras + Math.sin(ph) * ba * mv, aR = bras - Math.sin(ph) * ba * mv;
    if (e.att > 0) { const k = Math.sin(e.att * Math.PI); aR = -2.6 * k + aR * (1 - k); aL = -1.4 * k + aL * (1 - k); }
    r.set('armL', aL, 0, 0.12); r.set('armR', aR, 0, -0.12);
    r.set('foreL', -0.35 - run * 0.4, 0, 0); r.set('foreR', -0.35 - run * 0.4, 0, 0);
    r.set('head', (e.flaire ? 0.35 + Math.sin(t * 7) * 0.08 : 0), clamp(e.regard || 0, -1, 1), e.ecoute ? 0.25 : 0);
    r.set('jaw', e.att > 0 || e.grogne ? 0.35 : 0.05, 0, 0);
    r.set('tail', 0.8 - run * 0.5 + Math.sin(t * 1.3) * 0.06, Math.sin(ph * 0.5) * 0.2 * mv, 0);
    return 0;
  },
  v2_charognard(r, e, t) {
    const mv = e.move || 0, ph = e.phase || 0, a = (e.run ? 0.7 : 0.45) * mv;
    if (e.mort) { r.set('body', 0, 0, 1.4); return -0.45; }
    const s = Math.sin(ph) * a, c = e.run ? Math.sin(ph + 0.9) * a : -s;
    r.set('legFL', s, 0, 0); r.set('legBR', s, 0, 0); r.set('legFR', c, 0, 0); r.set('legBL', c, 0, 0);
    r.set('body', e.recule ? -0.1 : 0, 0, 0);
    r.set('neck', 0.4 + (e.flaire ? 0.35 + Math.sin(t * 8) * 0.1 : 0) - (e.att > 0 ? 0.3 : 0), clamp(e.regard || 0, -0.8, 0.8), 0);
    r.set('head', e.att > 0 ? -0.3 : 0, 0, 0);
    r.set('tail', 0.55 + Math.sin(t * 2 + e.seed) * 0.1, Math.sin(t * 1.4) * 0.2, 0);
    return 0;
  },
  v2_pendu(r, e, t) {
    const st = { move: e.move || 0, phase: e.phase || 0, run: false, t };
    if (e.pendu) {
      poseHuman(r, st);
      // pendu : les bras ballants, les pieds tendus, la tête cassée sur l'épaule ; ça tourne doucement
      r.set('armL', 0.05, 0, 0.08); r.set('armR', 0.08, 0, -0.08);
      r.set('legL', -0.06 + Math.sin(t * 0.7 + e.seed) * 0.04, 0, 0.02); r.set('legR', -0.1 + Math.sin(t * 0.7 + e.seed + 1) * 0.04, 0, -0.02);
      if (r.has('shoeL')) { r.set('shoeL', 0.7, 0, 0); r.set('shoeR', 0.75, 0, 0); }
      r.set('neck', 0.25, 0, 0.55); r.set('head', 0.2, 0, 0.2);
      return 0;
    }
    if (e.mort || e.effondre) { poseHuman(r, Object.assign(st, { move: 0 })); r.set('hips', 0, 0, 1.5); r.part('hips').p[1] = 0.25; return 0; }
    poseHuman(r, Object.assign(st, { reach: e.att > 0 ? 1 : 0.6 }));
    r.set('neck', 0.2, 0, 0.5); r.set('head', 0.15, clamp(e.regard || 0, -0.6, 0.6), 0.25);
    return 0;
  },
  v2_ecoutant(r, e, t) {
    const mv = e.move || 0, ph = e.phase || 0, run = e.run ? 1 : 0;
    if (e.mort) { r.set('hips', 0, 0, 1.5); r.part('hips').p[1] = 0.3; return 0; }
    r.part('hips').p[1] = 1.32;
    r.set('hips', 0, 0, 0);
    const a = (0.35 + run * 0.4) * mv, s = Math.sin(ph) * a;
    r.set('legL', s, 0, 0); r.set('legR', -s, 0, 0);
    r.set('shinL', Math.max(0, -s) * 0.7, 0, 0); r.set('shinR', Math.max(0, s) * 0.7, 0, 0);
    const ec = e.ecoute ? 1 : 0;
    r.set('torso', 0.45 + run * 0.4 - ec * 0.25, 0, 0);
    r.set('neck', -0.55 + ec * 0.25, 0, 0);
    // la tête se penche vers le bruit ; les oreilles s'ouvrent
    r.set('head', ec * 0.1, clamp(e.regard || 0, -1.2, 1.2), ec * 0.55 * Math.sign(e.regard || 1) + Math.sin(t * 0.9 + e.seed) * 0.08);
    r.set('oreilleL', 0, -(0.45 + ec * 0.5), 0); r.set('oreilleR', 0, 0.45 + ec * 0.5, 0);
    let aL = -0.1 - run * 0.9 - s * 0.3, aR = -0.1 - run * 0.9 + s * 0.3;
    if (e.att > 0) { const k = Math.sin(e.att * Math.PI); aL = -1.6 * k + aL * (1 - k); aR = -1.6 * k + aR * (1 - k); }
    r.set('armL', aL, 0, 0.05); r.set('armR', aR, 0, -0.05);
    r.set('foreL', -0.25, 0, 0); r.set('foreR', -0.25, 0, 0);
    return 0;
  },
  v2_gargouille(r, e, t) {
    // la tête suit le regard (le balayage) ; en vol, les ailes s'ouvrent et battent
    if (e.mort) { r.set('body', 0.35, 0, 1.4); return -0.3; }
    const vol = e.vol ? 1 : 0;
    r.set('head', -0.1 + (e.cri > 0 ? -0.35 : 0), clamp(e.regard || 0, -1.4, 1.4), 0);
    r.set('machoire', 0.3 + (e.cri > 0 ? 0.5 : 0), 0, 0);
    for (const [n, s] of [['L', -1], ['R', 1]]) {
      const bat = vol ? Math.sin(t * 9 + (s > 0 ? 0 : 0.2)) * 0.6 : 0;
      r.set('aile' + n, vol ? 0 : 0.2, vol ? s * 0.25 : 0, vol ? -s * (0.1 + bat) : -s * 1.35);
      r.set('bras' + n, vol ? -0.2 : -0.6, 0, s * 0.1);
    }
    r.set('body', vol ? 0.9 : 0.35, 0, 0);
    return 0;
  },
  v2_stryge(r, e, t) {
    if (e.mort) { r.set('body', 0, 0, 1.5); return -0.25; }
    const fond = e.fond ? 1 : 0;
    for (const [n, s] of [['L', -1], ['R', 1]]) {
      const bat = e.plane ? Math.sin(t * 1.6 + e.seed) * 0.08 : Math.sin(t * 8 + e.seed) * 0.75;
      r.set('wing' + n, 0, fond ? -s * 0.9 : 0, -s * (fond ? 0.3 : bat));
    }
    r.set('body', fond ? 0.9 : 0.15, 0, 0);
    r.set('head', fond ? -0.6 : 0.25, clamp(e.regard || 0, -1.2, 1.2), 0);
    return 0;
  },
  v2_basilic(r, e, t) {
    const mv = e.move || 0, ph = e.phase || 0, dort = e.dort || e.mort;
    for (let k = 0; k < 9; k++) r.set('b' + k, 0, dort ? (k % 2 ? 0.55 : -0.55) * (k > 0 ? 1 : 0.3) : Math.sin(ph * 1.4 - k * 0.8) * (0.18 + 0.3 * mv), 0);
    r.set('cou', dort ? 1.35 : -0.25 + (e.att > 0 ? -0.5 * Math.sin(e.att * Math.PI) : 0) + Math.sin(t * 0.8 + e.seed) * 0.05, 0, 0);
    r.set('head', dort ? -1.2 : (e.fixe ? -0.05 : 0.1), clamp(e.regard || 0, -1, 1), 0);
    v2Yeux(r, ['oeil-1', 'oeil1'], !dort);
    return 0;
  },
  v2_tarasque(r, e, t) {
    const mv = e.move || 0, ph = e.phase || 0, dort = e.dort || e.mort;
    const souffle = Math.sin(t * (dort ? 0.6 : 1.2) + e.seed) * (dort ? 0.05 : 0.02);
    r.part('corps').p[1] = (dort ? 0.75 : 1.15) + souffle;
    const a = 0.32 * mv, s = Math.sin(ph) * a;
    const pattes = [['FL', s], ['MR', s], ['BL', s], ['FR', -s], ['ML', -s], ['BR', -s]];
    for (const [n, v] of pattes) r.set('p' + n, dort ? -0.2 : v, 0, dort ? (n.endsWith('L') ? -0.7 : 0.7) : 0);
    r.set('cou', dort ? 0.45 : (e.charge ? 0.25 : -0.05), clamp(e.regard || 0, -0.6, 0.6), 0);
    r.set('head', dort ? 0.25 : 0, 0, 0);
    r.set('machoire', e.rugit > 0 ? 0.7 : dort ? 0 : 0.08 + Math.max(0, Math.sin(t * 0.5)) * 0.06, 0, 0);
    for (let k = 0; k < 5; k++) r.set('q' + k, (k ? -0.05 : 0.15) + (dort ? 0.05 : 0), Math.sin(t * 0.7 - k * 0.6 + e.seed) * (dort ? 0.05 : 0.15), 0);
    return 0;
  },
  v2_chimere(r, e, t) {
    const st = { move: e.move || 0, phase: e.phase || 0, run: e.run, t, lie: e.couchee || e.mort, lookY: e.regard || 0 };
    poseQuad(r, st);
    if (st.lie) r.part('body').p[1] = 0.62; else r.part('body').p[1] = 1.02;
    const dort = e.tetesDort || [false, false, false];
    // la tête qui dort pend ; les autres veillent, chacune de son côté
    r.set('neck', dort[0] ? 0.55 : 0.05 + (e.att > 0 ? 0.3 : 0), dort[0] ? 0 : clamp(e.regard || 0, -0.8, 0.8), 0);
    r.set('head', dort[0] ? 0.3 : 0, 0, 0);
    r.set('gcou', dort[1] ? 0.5 : -0.15, 0, dort[1] ? -0.6 : -0.32 + Math.sin(t * 0.5 + e.seed) * 0.05);
    r.set('gtete', dort[1] ? 0.9 : 0.2 + (e.feu > 0 ? -0.2 : 0), 1.25 + (dort[1] ? 0 : Math.sin(t * 0.37) * 0.35), 0);
    r.set('sq0', dort[2] ? 0.3 : -0.55, Math.sin(t * 0.9) * 0.15, 0);
    for (let k = 1; k < 6; k++) r.set('sq' + k, dort[2] ? 0.15 : (k < 3 ? 0.18 : 0.1) + Math.sin(t * 1.3 - k) * 0.08, Math.sin(t * 1.1 - k * 0.7 + e.seed) * (dort[2] ? 0.05 : 0.22), 0);
    return 0;
  },
  v2_vouivre(r, e, t) {
    const vol = e.vol ? 1 : 0, dort = e.dort || e.mort;
    const g = r.part('gemme'); if (g) g.hide = !e.gemme;
    for (const s of [-1, 1]) {
      const bat = vol ? Math.sin(t * 4.2 + e.seed) * 0.65 : 0;
      r.set('aile' + s, vol ? 0 : 0.1, vol ? 0 : -s * 1.15, vol ? -s * bat : -s * 0.25);
    }
    for (let k = 1; k < 10; k++) r.set('b' + k, vol ? Math.sin(t * 2.4 - k * 0.6) * 0.08 : 0, dort ? (k % 2 ? 0.7 : -0.2) : Math.sin(t * (vol ? 2 : 1.4) - k * 0.75 + e.seed) * (vol ? 0.14 : 0.3), 0);
    r.set('cou', dort ? 0.5 : vol ? -0.05 : -0.35, clamp(e.regard || 0, -0.9, 0.9) * 0.5, 0);
    r.set('head', dort ? 0.6 : (e.att > 0 ? -0.4 : 0.2), clamp(e.regard || 0, -0.9, 0.9) * 0.5, 0);
    r.set('machoire', e.att > 0 || e.cri > 0 ? 0.5 : 0, 0, 0);
    return 0;
  },
  v2_noye(r, e, t) {
    poseHuman(r, { move: 0, phase: 0, t });
    // dans l'eau jusqu'aux épaules ; les bras se tendent quand il tient quelqu'un
    const k = e.tient ? 1 : 0.4 + Math.sin(t * 0.8 + e.seed) * 0.1;
    r.set('armL', -1.9 * k, 0, 0.3); r.set('armR', -1.9 * k, 0, -0.3);
    r.set('head', -0.15, clamp(e.regard || 0, -0.8, 0.8), Math.sin(t * 0.5 + e.seed) * 0.1);
    return 0;
  },
  v2_korrigan(r, e, t) {
    const st = { move: e.move || 0, phase: e.phase || 0, run: e.run, t };
    if (e.danse) { st.move = 1; st.phase = t * 7 + e.seed; }
    poseHuman(r, st);
    if (e.danse) { r.set('armL', -0.4, 0, 0.9); r.set('armR', -0.4, 0, -0.9); }
    if (e.rit > 0) r.set('head', -0.3 + Math.sin(t * 14) * 0.08, 0, 0);
    else r.set('head', 0, clamp(e.regard || 0, -1, 1), 0);
    return e.danse ? Math.abs(Math.sin(t * 7 + e.seed)) * 0.12 : 0;
  },
  v2_cerf(r, e, t) {
    poseQuad(r, { move: e.move || 0, phase: e.phase || 0, run: e.run, t, graze: e.broute || 0, lookY: e.regard || 0 });
    // les mains s'ouvrent et se ferment, très lentement
    const k = 0.25 + Math.sin(t * 0.5 + e.seed) * 0.2 + (e.montre ? 0.4 : 0);
    for (const s of [-1, 1]) for (const m of ['main', 'mainb']) for (let d = 0; d < 4; d++) { const q = r.part(m + s + 'd' + d); if (q) q.r[0] = -k - d * 0.06; }
    if (e.salue) r.set('neck', 0.9, 0, 0);
    return 0;
  },
  v2_chien(r, e, t) {
    poseQuad(r, { move: e.move || 0, phase: e.phase || 0, run: e.run, t, lie: e.couche, lookY: e.regard || 0, wag: e.remue });
    if (e.grogne) { r.set('neck', 0.35, clamp(e.regard || 0, -0.9, 0.9), 0); r.set('tail', 0.05, 0, 0); }
    return e.couche ? -0.22 : 0;
  },
  v2_sans_visage(r, e, t) {
    poseQuad(r, { move: e.move || 0, phase: e.phase || 0, run: e.run, t, graze: e.broute || 0, lie: e.couche || e.mort, lookY: e.regard || 0 });
    return e.couche || e.mort ? -0.25 : 0;
  },
};

// ---------------------------------------------------------------- les objets posés des repaires
// les statues de pierre du Jardin (des gens qui ont regardé) : un squelette d'homme, posé, repeint en pierre
const V2_STATUES = [];
function v2Statue(v) {
  if (V2_STATUES[v]) return V2_STATUES[v];
  const r = humanRig({ skin: '#888', hair: '#888', hairStyle: ['court', 'chauve', 'long', 'court'][v % 4], top: '#888', bottom: '#888', shoe: '#888', hat: v % 4 === 0 ? 'chapeau' : null, beard: v % 3 === 0 ? 'courte' : null, dress: v % 4 === 2, coat: v % 4 === 1 });
  const st = [
    { reach: 1, move: 0, t: 0 },      // le bras levé devant le visage (celui au miroir)
    { cower: 1, move: 0, t: 0 },      // recroquevillé
    { move: 1, phase: 1.1, run: true, t: 0 }, // il courait
    { pray: 1, move: 0, t: 0 },       // à genoux, ou presque
  ][v % 4];
  poseHuman(r, st);
  if (v % 4 === 0) { r.set('armL', 0.1, 0, 0.1); r.set('armR', -2.2, 0, -0.2); r.set('head', -0.35, 0, 0); }
  if (v % 4 === 1) r.set('head', 0.5, 0.4, 0);
  if (v % 4 === 3) { r.set('legL', -1.4, 0, 0); r.set('legR', -1.4, 0, 0); r.part('hips').p[1] = 0.55; }
  if (v % 4 === 2) r.set('head', -0.2, -0.9, 0);
  const g = 0.48 + (v % 3) * 0.03;
  for (const q of r.parts) if (q.s) { q.col = [g, g * 0.98, g * 0.94]; q.tex = TL.stone; }
  return (V2_STATUES[v] = r);
}
const V2_PIERRE = rgbf('#6e6c66');
Object.assign(PROP_MODELS, {
  v2_statue(E, o) {
    const v = o.v !== undefined ? o.v : (o.data && o.data.v) || 0;
    E.bx(0, -0.05, 0, 0.7, 0.12, 0.7, V2_PIERRE, TL.stone);
    if (!E.buf) { E.bx(0, 0, 0, 0.5, 1.75, 0.4, V2_PIERRE, TL.stone); return; } // (une mesure : la boîte suffit)
    const r = v2Statue(v);
    r.emit(E.buf, E.M, E.fl || 0);
    if (v % 4 === 0 && !(o.data && o.data.pris)) {
      // la plaque d'acier dans la main levée (tant qu'on ne l'a pas prise)
      const h = r.part('handR');
      if (h) E.buf.box(h.W, 0, -0.1, 0.07, 0.16, 0.2, 0.015, [0.72, 0.74, 0.78], withFlags(TL.metal, E.fl || 0));
    }
  },
  v2_oeuf(E) {
    // un œuf énorme, ouvert, la coquille en morceaux
    const c = rgbf('#e8dcc0');
    E.bx(0, 0, 0, 0.7, 0.45, 0.6, c, TL.plain, 0.2);
    E.bx(0.05, 0.42, 0.02, 0.5, 0.18, 0.44, c, TL.plain, 0.5);
    E.bx(0.0, 0.02, 0.0, 0.5, 0.42, 0.42, rgbf('#2a2418'), TL.plain);
    for (const [x, z, r] of [[0.7, 0.3, 0.4], [-0.6, 0.4, 1.3], [0.2, -0.75, 2.2], [-0.5, -0.5, 0.8]]) E.bx(x, 0, z, 0.32, 0.06, 0.24, c, TL.plain, r, 0.2, 0.3);
  },
  v2_pierre_plate(E, o) {
    // une grande pierre plate au bord de l'eau, un creux usé au milieu
    E.bx(0, -0.3, 0, 2.4, 0.75, 1.8, rgbf('#5a5a54'), TL.stone, 0.15);
    E.bx(0.1, 0.44, 0.1, 0.5, 0.04, 0.4, rgbf('#3a3a36'), TL.stone, 0.15);
    if (o.data && o.data.gemme) E.bx(0.1, 0.46, 0.1, 0.1, 0.08, 0.08, [1.2, 0.2, 0.1], withFlags(TL.glass, FX_EMIT), 0.3);
  },
  v2_socle(E, o) {
    const h = (o.data && o.data.h) || 2.4;
    E.bx(0, -0.4, 0, 0.9, h + 0.4, 0.9, V2_PIERRE, TL.stone);
    E.bx(0, h - 0.1, 0, 1.15, 0.22, 1.15, rgbf('#5e5c56'), TL.stone);
    E.bx(0, -0.4, 0, 1.15, 0.5, 1.15, rgbf('#5e5c56'), TL.stone);
  },
  v2_nid(E) {
    // brindilles, os, et ce qui brille
    for (let k = 0; k < 9; k++) { const a = k * 0.7; E.bx(Math.cos(a) * 0.35, 0.04 + (k % 3) * 0.06, Math.sin(a) * 0.35, 0.8, 0.05, 0.06, rgbf('#4a3a2a'), TL.wood, a, 0.1); }
    E.bx(0, 0, 0, 0.7, 0.08, 0.7, rgbf('#3a3024'), TL.hay);
    E.bx(0.12, 0.1, -0.05, 0.05, 0.05, 0.05, rgbf('#d8c060'), TL.gold);
    E.bx(-0.15, 0.1, 0.1, 0.22, 0.04, 0.04, V2_OS, TL.bone, 0.7);
  },
  v2_offrandes(E) {
    // le tas d'offrandes de la Bauge : des bols, des pièces vertes, des bougies mortes, des petites figures
    E.bx(0, 0, 0, 1.6, 0.25, 1.2, rgbf('#5a5040'), TL.stone, 0.2);
    for (const [x, z, c] of [[-0.4, 0.2, '#8a6a3a'], [0.3, -0.2, '#9a7a4a'], [0.5, 0.35, '#7a5a3a']]) { E.bx(x, 0.25, z, 0.26, 0.12, 0.26, rgbf(c), TL.terracotta); }
    for (let k = 0; k < 7; k++) E.bx(-0.6 + k * 0.2, 0.26, -0.4 + (k % 3) * 0.3, 0.08, 0.02, 0.08, rgbf('#6a8a5a'), TL.gold);
    for (const [x, z] of [[0.6, -0.4], [-0.6, 0.45], [0.05, 0.5]]) E.bx(x, 0.25, z, 0.06, 0.16, 0.06, rgbf('#e8e0c8'), TL.plain);
    E.bx(-0.1, 0.25, -0.1, 0.12, 0.3, 0.1, rgbf('#8a8070'), TL.stone);
  },
  v2_corde(E, o) {
    // une corde qui pend d'une branche, coupée net (un pendu est tombé)
    const L = (o.data && o.data.L) || 1.2;
    E.bx(0, -L, 0, 0.035, L, 0.035, rgbf('#4a3a2a'), TL.rope);
    E.bx(0, -L - 0.04, 0, 0.12, 0.05, 0.12, rgbf('#4a3a2a'), TL.rope);
  },
  v2_creux(E) {
    // un gros tronc mort, creux, une gueule noire à hauteur de main
    E.bx(0, 0, 0, 1.3, 3.2, 1.3, rgbf('#4a4038'), TL.bark);
    E.bx(0, 3.2, 0, 1.0, 0.5, 1.0, rgbf('#3e362e'), TL.bark, 0.3);
    E.bx(0.1, 0.7, 0.56, 0.6, 0.9, 0.22, rgbf('#0e0c0a'), TL.plain);
    for (const a of [0.4, 2.1, 3.9, 5.3]) E.bx(Math.cos(a) * 0.7, 0, Math.sin(a) * 0.7, 0.5, 0.35, 0.3, rgbf('#4a4038'), TL.bark, -a);
    E.bx(-0.3, 3.0, 0.2, 0.16, 1.6, 0.16, rgbf('#4a4038'), TL.bark, 0, 0.5, 0.4);
  },
});
// l'arbre aux pendus : un tronc mort, des branches nues où pendent des cordes (o.data.br : [angle, longueur, hauteur])
PROP_MODELS.v2_potence = function (E, o) {
  const col = rgbf('#3e362e'), dk = rgbf('#2e2822');
  E.bx(0, -0.3, 0, 0.62, 5.6, 0.62, col, TL.bark);
  E.bx(0.05, 5.2, -0.05, 0.4, 1.3, 0.4, dk, TL.bark, 0.3, 0.18, 0.1);
  for (const [a, L, h] of (o.data && o.data.br) || [[0.6, 2.4, 4.4]]) {
    E.box(Math.sin(a) * L / 2, h, Math.cos(a) * L / 2, 0.2, 0.2, L, col, TL.bark, a, -0.08);
    E.box(Math.sin(a) * (L + 0.5), h + 0.35, Math.cos(a) * (L + 0.5), 0.1, 0.1, 1.0, dk, TL.bark, a, -0.7);
  }
  for (const a of [0.5, 2.3, 4.2]) E.bx(Math.cos(a) * 0.45, -0.1, Math.sin(a) * 0.45, 0.5, 0.4, 0.28, dk, TL.bark, -a);
};
PROP_COLL.v2_potence = [0.33, 0.33, 5.4];
PROP_COLL.v2_statue = [0.32, 0.32, 1.7];
PROP_COLL.v2_pierre_plate = [1.15, 0.85, 0.45];
PROP_COLL.v2_socle = [0.5, 0.5, 2.4];
PROP_COLL.v2_creux = [0.62, 0.62, 3.2];
PROP_COLL.v2_offrandes = [0.75, 0.55, 0.4];
PROP_LIGHTS.v2_pierre_plate = { c: [1.0, 0.25, 0.12], r: 5, y: 0.6, lit: true };
