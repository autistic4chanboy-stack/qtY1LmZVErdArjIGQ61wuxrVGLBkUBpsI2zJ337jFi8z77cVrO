// ============================================================================
//  LES MODÈLES REFAITS (vague M19) : ce qui était fait trop vite, repris en boîtes
//  - les BÊTES (le gabarit des quadrupèdes, les bêtes de la ferme et des bois, les
//    oiseaux) avaient été refaites ici aussi ; la vague 22 les a retirées : les
//    modèles d'avant, plus carrés, que le joueur préférait, sont revenus ;
//  - les CULTURES du champ (radis, blé, carotte, pomme de terre, chou, tomate,
//    citrouille, maïs, fraise, tournesol, betterave, haricot, melon, lin, pommier,
//    la plante morte) et les gabarits partagés (aromates, tuteurs, buissons) : des
//    feuilles effilées et nervurées, des tiges, des fruits qui grossissent avec le
//    stade, la couleur de la variété gardée ;
//  - les OBJETS POSÉS les plus vus (chaise, table, lit, étagère, âtre, comptoir,
//    tonneaux, caisse d'expédition, coffre, mangeoire, abreuvoir, brouette, meule,
//    barque, menhir, tombe, sac, jarre, réverbère, pot de fleurs, panneau, murets,
//    haie, jeune arbre, ailes du moulin) : mêmes noms, mêmes données, même encombrement (les
//    collisions de PROP_COLL ne changent pas) ;
//  - des TUILES peintes en plus dans l'atlas des peaux (plumes, œil, mufle, groin,
//    feuille nervurée, laine bouclée, paille tressée, crin, écorce).
//  Les formes effilées nouvelles (qCorps, qSabot, …) sont déclarées avec les autres
//  dans 07-zzzzz-personnages.js (le vertex shader les embarque à son chargement).
// ============================================================================

// ---------------------------------------------------------------- tuiles peintes
Object.assign(TL, { m19Plumes: 100, m19Oeil: 101, m19Mufle: 102, m19Groin: 103, m19Feuille: 104, m19Laine: 105, m19Paille: 106, m19Crin: 107, m19Ecorce: 108 });
function m19Tuiles() {
  const cv = SKIN.canvas, ctx = cv.getContext('2d'), pb = SKIN.pb && SKIN.pb.w === cv.width ? SKIN.pb : null;
  const T = (idx, fn) => {
    const img = ctx.createImageData(16, 16), D = img.data, ox = (idx % 16) * 16, oy = Math.floor(idx / 16) * 16;
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      let c = fn(x, y); if (typeof c === 'number') c = [c, c, c];
      const k = (y * 16 + x) * 4, r = clamp(Math.round(c[0]), 0, 255), g = clamp(Math.round(c[1]), 0, 255), b = clamp(Math.round(c[2]), 0, 255);
      D[k] = r; D[k + 1] = g; D[k + 2] = b; D[k + 3] = 255;
      if (pb) { const q = ((oy + y) * pb.w + ox + x) * 4; pb.d[q] = r; pb.d[q + 1] = g; pb.d[q + 2] = b; pb.d[q + 3] = 255; }
    }
    ctx.putImageData(img, ox, oy);
  };
  const N = (x, y, s) => hash2i(x, y, s);
  // plumes : rangs d'écailles arrondies décalés, le bord de chaque plume plus sombre, le rachis plus clair
  T(TL.m19Plumes, (x, y) => {
    const row = y >> 2, xx = (x + (row & 1) * 2) & 3, yy = y & 3;
    let v = 222 - yy * 6 + (N(x >> 2, row, 961) - 0.5) * 26 + (N(x, y, 960) - 0.5) * 10;
    if (yy === 3 && xx !== 2) v -= 26;
    if (xx === 0 && yy >= 2) v -= 16;
    if (xx === 2 && yy < 2) v += 12;
    return v;
  });
  // œil de bête : iris sombre, pupille, un reflet
  T(TL.m19Oeil, (x, y) => {
    const d = Math.hypot(x - 7.5, y - 7.5);
    if (d > 7.2) return [36, 26, 20];
    if ((x === 5 || x === 6) && (y === 4 || y === 5)) return 246;
    if (d < 3.4) return [10, 8, 8];
    return [70 + (8 - d) * 6, 48 + (8 - d) * 3, 30];
  });
  // mufle (vache, cheval, âne) : peau grenue, deux naseaux en virgule, le sillon au milieu
  T(TL.m19Mufle, (x, y) => {
    let v = 228 + (N(x, y, 962) - 0.5) * 26;
    for (const cx of [4, 11]) { const dx = x - cx, dy = y - 7; if (dx * dx * 1.6 + dy * dy < 7) v = 52 + Math.max(0, dx * (cx < 8 ? -8 : 8)); }
    if ((x === 7 || x === 8) && y > 9) v -= 40;
    if (y === 15 || y === 0) v -= 30;
    return v;
  });
  // groin : un disque rose, deux narines ovales
  T(TL.m19Groin, (x, y) => {
    const d = Math.hypot(x - 7.5, y - 7.5);
    let v = 236 - d * 3 + (N(x, y, 963) - 0.5) * 10;
    if (d > 7) v -= 50;
    for (const cx of [5, 10]) { const dx = x - cx, dy = y - 7.5; if (dx * dx * 2.2 + dy * dy < 6) v = 70; }
    return v;
  });
  // feuille : la nervure centrale claire, les nervures en arêtes de poisson, le limbe grenu
  T(TL.m19Feuille, (x, y) => {
    const dx = Math.abs(x - 7.5);
    let v = 214 + (N(x, y, 964) - 0.5) * 22 - dx * 2.2;
    if (dx < 1) v = 250;
    else if (Math.abs((y + dx * 0.9) % 5 - 2.5) < 0.6) v += 22;
    if (x === 0 || x === 15) v -= 26;
    return v;
  });
  // laine bouclée : des boucles rondes, claires au sommet, sombres dans les creux
  T(TL.m19Laine, (x, y) => {
    const cx = ((x + (((y >> 2) & 1) * 2)) & 3) - 1.5, cy = (y & 3) - 1.5, d = Math.hypot(cx, cy);
    return 236 - d * 24 + (N(x >> 1, y >> 1, 965) - 0.5) * 24 - (d > 1.9 ? 30 : 0);
  });
  // paille tressée (fond de chaise) : des brins croisés en diagonale
  T(TL.m19Paille, (x, y) => {
    const a = (x + y) & 7, b = (x - y + 16) & 7, tr = (((x >> 2) + (y >> 2)) & 1) ? a : b;
    return [222 - (tr < 2 ? 40 : 0) + (N(x, y, 966) - 0.5) * 18, 190 - (tr < 2 ? 40 : 0) + (N(x, y, 966) - 0.5) * 16, 112 - (tr < 2 ? 26 : 0)];
  });
  // crin (crinière, queue de cheval) : des mèches longues, sombres entre elles
  T(TL.m19Crin, (x, y) => 200 + (N(x, 0, 967) - 0.5) * 70 - ((x * 5 + (y >> 2)) % 7 === 0 ? 50 : 0) + y * 1.4);
  // écorce : des côtes verticales, des fentes sombres, un peu de lichen
  T(TL.m19Ecorce, (x, y) => {
    const k = N(x >> 1, y >> 3, 968);
    let v = 190 + (k - 0.5) * 50 - ((x + (y >> 3)) % 4 === 0 ? 70 : 0);
    if (N(x, y, 969) > 0.94) return [170, 186, 150];
    return v;
  });
}
{
  const _bsa = buildSkinAtlas;
  buildSkinAtlas = function () {
    _bsa();
    try { m19Tuiles(); } catch (e) { console.warn('M19 : tuiles', e); }
  };
}

// ---------------------------------------------------------------- le niveau de détail selon la distance
// Les modèles refaits ont deux à quatre fois plus de boîtes : on ne les dessine en entier que de près.
// - les bêtes (dessinées à chaque image) : au-delà de D.betes, seules les grandes pièces des corps d'oiseau (tronc,
//   tête, pattes, queue…) sont calculées et émises (M19B, 11-zzzzzzzzzzM19-maisons.js ; les quadrupèdes d'avant,
//   revenus à la vague 22, restent entiers) ; hors du champ de la vue, elles ne sont plus ni posées ni dessinées
//   (M19Vue, même fichier) ;
// - les objets posés et les cultures (refaits quand on a fait 30 m ou que quelque chose change) : au-delà de
//   D.objets / D.cultures, l'ancien modèle (celui d'avant la vague M19, aussi léger qu'avant) ;
// - le décor des maisons et de la fontaine : au-delà de D.maisonsFin, le décor fin fondu (chaînes d'angle en deux
//   pierres par angle, ni col de cygne ni épis) ; au-delà de D.maisons, rien (la maison seule, comme avant).
// Distances à la qualité « moyenne » ; elles suivent la distance de l'herbe (le réglage des petits détails :
// 20 m en qualité basse, soit la moitié ; 60 et 80 m en haute et très haute). Un battement de ±12 % évite les
// va-et-vient au seuil. M19LOD.force : 'pres' ou 'loin' (planches, mesures) ; sans caméra, tout est de près.
const M19LOD = {
  cam: null, camE: null, force: null, etat: new WeakMap(),
  D: { betes: 40, objets: 45, cultures: 45, maisons: 70, maisonsFin: 45 },
  k() { const g = typeof settings !== 'undefined' ? +settings.grassDist : 40; return clamp((g || 40) / 40, 0.5, 2); },
  // vrai si le point (x, z) est « loin » de la caméra c pour la distance D ; cle : l'objet dont on garde l'état
  loinXZ(c, x, z, D, cle) {
    if (this.force) return this.force === 'loin';
    if (!c) return false;
    const dx = x - c[0], dz = z - c[2], Dk = D * this.k(), avant = cle ? this.etat.get(cle) : undefined;
    const lim = avant === undefined ? Dk : avant ? Dk * 0.88 : Dk * 1.12, loin = dx * dx + dz * dz > lim * lim;
    if (cle) this.etat.set(cle, loin);
    return loin;
  },
  // pour un modèle posé par PE : la position est celle du repère courant (E.M)
  loin(E, cle, D) { return !!(E && E.M) && this.loinXZ(this.cam, E.M[3], E.M[11], D, cle); },
  // les objets posés sont refaits quand on s'est éloigné de pas() mètres (le moteur attend 30 m) : un objet dessiné
  // « au loin » ne s'approche pas à moins de D − pas (22 m en qualité moyenne ; en basse, 15 m de pas : pas plus
  // de reconstructions qu'il ne faut sur une petite machine, l'ancien modèle jusqu'à 7 m)
  pas() { return clamp(0.5 * Math.min(this.D.objets, this.D.cultures) * this.k(), 15, 30); },
};

// ---------------------------------------------------------------- l'émission des squelettes, plus rapide
// Rig.emit (07-zzzzz-personnages.js : les formes effilées) à l'identique, au bit près, pour toutes les bêtes et
// tous les habitants : une pièce sans rotation (les détails posés sur une autre : yeux, nez, cheveux, garrot,
// pis…) n'a besoin ni des six sinus et cosinus ni du produit de matrices entier ; son repère est celui de son
// parent, déplacé de son pivot (arrondi en simple précision, comme dans _mT).
function m19Emettre(P, root, buf, flags) {
  const fr = Math.fround;
  for (let i = 0, n = P.length; i < n; i++) {
    const q = P[i], r = q.r, p = q.p, W = q.W, A = q.pi < 0 ? root : P[q.pi].W;
    if (r[0] === 0 && r[1] === 0 && r[2] === 0) {
      const px = fr(p[0]), py = fr(p[1]), pz = fr(p[2]);
      W[0] = A[0]; W[1] = A[1]; W[2] = A[2]; W[3] = A[0] * px + A[1] * py + A[2] * pz + A[3];
      W[4] = A[4]; W[5] = A[5]; W[6] = A[6]; W[7] = A[4] * px + A[5] * py + A[6] * pz + A[7];
      W[8] = A[8]; W[9] = A[9]; W[10] = A[10]; W[11] = A[8] * px + A[9] * py + A[10] * pz + A[11];
    } else {
      m34TR(_mT, p[0], p[1], p[2], r[0], r[1], r[2]);
      m34Mul(W, A, _mT);
    }
    if (!q.s || q.hide) continue;
    let code = withFlags(q.tex, (q.fl || 0) | flags);
    if (q.shp) code = code < 0 ? code - 512 * q.shp : code | (q.shp << 18);
    buf.box(W, q.o[0], q.o[1], q.o[2], q.s[0], q.s[1], q.s[2], q.col, code);
  }
}
Rig.prototype.emit = function (buf, root, flags) { m19Emettre(this.parts, root, buf, flags); };

// ---------------------------------------------------------------- les bêtes : celles d'avant (vague 22)
// Les bêtes refaites ici (le gabarit des quadrupèdes à pattes en deux segments et sa pose, les bêtes de la ferme, les
// bêtes sauvages, l'écureuil, le hérisson, les oiseaux en corps d'oiseau) sont retirées : le joueur préférait les
// anciennes, plus carrées. Les modèles d'avant (07-models.js, 07-zzmodels-more.js, …) reviennent tels quels ; restent
// l'émission plus rapide (ci-dessus) et, dans 11-zzzzzzzzzzM19-maisons.js, les bêtes hors de la vue : celles que le
// tri écartait (le gabarit des quadrupèdes ici, les oiseaux refaits là-bas) le sont encore, marquées (rig.trieVue :
// la marque ne change rien au modèle ; rigPlus la recopie).
{
  const _qr = quadRig;
  quadRig = function (o) { const r = _qr(o); r.trieVue = true; return r; };
}

// ============================================================================
//  LES CULTURES : les feuilles en pointe (toutes les plantes à gabarit), les
//  cultures d'origine redessinées (radis, blé, carotte, pomme de terre, chou,
//  tomate, citrouille, maïs, fraise, tournesol, betterave, haricot, melon, lin,
//  jeune pommier, culture morte), les gabarits « aromate », « tuteur » et
//  « buisson » sans leurs gros cubes. Les variétés gardent leurs couleurs : les
//  couleurs repères (OLD_VARS.f) sont gardées ; chou, citrouille, maïs et blé
//  prennent la couleur de leur variété ici (leurs boîtes portent une forme :
//  le recoloriage par tuile ne les voit plus).
// ============================================================================
const m19F = (code, shp) => (shp && code >= 0 ? code | (shp << 18) : code);
const m19Var = (id, c) => { const C = CROPS[id], V = C && C.vars && C.vars[(c && c.vr) || 0]; return V && V.c ? hexf(V.c) : null; };
const m19Mul = (a, b) => (b ? [a[0] * b[0], a[1] * b[1], a[2] * b[2]] : a);
// feuille en pointe (large : bout arrondi ; tige : sans forme) ; shp force la forme
{
  cropLeaf = function (E, a, t, len, w, th, col, tex, r0, y0, ox, oz, shp) {
    if (shp === undefined) shp = w >= th * 2 && w >= 0.02 ? (w > len * 0.6 ? TF.pFeuilleLarge : TF.pFeuille) : 0;
    const sa = Math.sin(a), ca = Math.cos(a), m = len / 2, r = (r0 || 0) + m * Math.sin(t);
    E.box((ox || 0) + sa * r, (y0 || 0) + m * Math.cos(t), (oz || 0) + ca * r, w, len, th, col, m19F(tex, shp), a, t, 0);
  };
}
const M19V = { feuille: [0.42, 0.7, 0.32], feuilleS: [0.34, 0.6, 0.26], tige: [0.4, 0.62, 0.3], fane: [0.36, 0.66, 0.3], terre: [0.4, 0.3, 0.2] };
// (les modèles d'avant, gardés pour le lointain : M19LOD)
const M19_CULTURES_ANC = Object.assign({}, CROP_MODELS), M19_GABARITS_ANC = Object.assign({}, CROP_TPL);
Object.assign(CROP_MODELS, {
  // radis : trois rosettes de feuilles rondes, le collet rouge qui sort de terre
  radis(E, k, ripe) {
    const root = hexf('#d83050');
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1 + 0.4, x = Math.sin(a) * 0.2, z = Math.cos(a) * 0.2, L = 0.06 + k * 0.17;
      for (let j = 0; j < 5; j++) cropLeaf(E, a + j * 1.257, 0.4 + (j % 2) * 0.32, L * (0.8 + (j % 3) * 0.15), 0.035 + k * 0.05, 0.012, j % 2 ? M19V.feuille : M19V.feuilleS, TL.m19Feuille, 0.012, 0.004, x, z);
      if (k > 0.4) { const r = ripe ? 0.085 : 0.03 + k * 0.045; E.bx(x, -0.04, z, r, r * 0.95, r, root, TL.plain, a); E.bx(x, -0.045 - r * 0.2, z, r * 0.3, 0.02, r * 0.3, [0.95, 0.92, 0.9], TL.plain); }
    }
  },
  // blé : touffes de tiges, des feuilles, l'épi barbu (vert, puis doré ; la variété teinte l'épi et la paille)
  ble(E, k, ripe, c) {
    const V = m19Var('ble', c), gold = m19Mul([1, 0.96, 0.84], V), green = [0.52, 0.8, 0.36], h = 0.12 + k * 0.82;
    const stem = ripe ? m19Mul([0.92, 0.82, 0.5], V) : k > 0.75 ? [0.7, 0.78, 0.4] : green;
    for (let i = 0; i < 10; i++) {
      const x = ((i % 4) - 1.5) * 0.22 + (hash2i(i, 3, 41) - 0.5) * 0.1, z = (((i / 4) | 0) - 1) * 0.26 + (hash2i(i, 5, 42) - 0.5) * 0.1, hh = h * (0.86 + hash2i(i, 7, 43) * 0.22), lean = (hash2i(i, 9, 44) - 0.5) * 0.16;
      if (k < 0.35) { cropLeaf(E, i * 2.4, 0.2 + lean, hh, 0.03, 0.01, green, TL.plain, 0, 0, x, z, TF.pLame); continue; }
      E.box(x, hh / 2, z, 0.022, hh, 0.022, stem, m19F(TL.wheat, TF.pTronc), 0, lean, 0);
      if (i % 2 === 0) cropLeaf(E, i * 2.4, 0.9, 0.18 + k * 0.12, 0.035, 0.008, ripe ? v3.scale(stem, 0.9) : green, TL.plain, 0, hh * 0.35, x, z, TF.pLame);
      if (k < 0.55) continue;
      const ec = ripe ? gold : [0.62, 0.85, 0.42], ey = hh * Math.cos(lean), ez = z + hh * Math.sin(lean) * 0.5;
      E.box(x, ey + 0.06, ez, 0.045, 0.15, 0.032, ec, m19F(TL.wheat, TF.qCorps), i * 0.7, lean + (ripe ? 0.28 : 0), 0);
      if (ripe) E.box(x, ey + 0.17, ez + 0.02, 0.03, 0.12, 0.012, ec, m19F(TL.wheat, TF.pFeuille), i * 0.7, lean + 0.4, 0);
    }
  },
  // carotte : trois touffes de fanes découpées, le collet orange qui affleure
  carotte(E, k, ripe) {
    const root = hexf('#e87a20');
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1 + 1.1, x = Math.sin(a) * 0.19, z = Math.cos(a) * 0.19, L = 0.08 + k * 0.32;
      for (let j = 0; j < 5; j++) cropLeaf(E, a + j * 1.26, 0.18 + (j % 3) * 0.16, L * (0.75 + (j % 2) * 0.3), 0.05 + k * 0.03, 0.01, j % 2 ? M19V.fane : v3.scale(M19V.fane, 0.85), TL.carrotTop, 0.01, 0.006, x, z, TF.pFeuille);
      if (k > 0.45) { const r = ripe ? 0.07 : 0.04; E.bx(x, -0.04, z, r, ripe ? 0.075 : 0.05, r, root, m19F(TL.plain, TF.pTronc)); }
    }
  },
  // pomme de terre : un plant touffu (feuilles composées), des fleurs blanches ou mauves, les tubercules au pied
  patate(E, k, ripe, c) {
    const fl = (c && c.vr) % 2 ? [0.82, 0.68, 0.9] : [0.96, 0.95, 0.92], tub = hexf('#b89060'), h = 0.12 + k * 0.42;
    // des tiges qui s'écartent, chacune avec ses folioles (feuilles composées), en deux étages
    for (let i = 0; i < 5; i++) {
      const a = i * 1.257 + 0.3, lean = 0.45 + (i % 2) * 0.2, L = h * (0.85 + (i % 3) * 0.12), tx2 = Math.sin(a) * L * Math.sin(lean), tz2 = Math.cos(a) * L * Math.sin(lean), ty = L * Math.cos(lean);
      cropLeaf(E, a, lean, L, 0.02, 0.02, M19V.tige, TL.plain, 0, 0, 0, 0, 0);
      for (let j = 0; j < 3; j++) { const q = 0.45 + j * 0.27; cropLeaf(E, a + (j - 1) * 0.9, 1.05 - j * 0.15, 0.06 + k * 0.08, 0.05 + k * 0.05, 0.012, (i + j) % 2 ? M19V.feuille : M19V.feuilleS, TL.m19Feuille, 0, ty * q, tx2 * q, tz2 * q, TF.pFeuilleLarge); }
    }
    if (k > 0.65 && !ripe) for (let i = 0; i < 4; i++) E.box(Math.sin(i * 1.7) * 0.12, h + 0.02 + (i % 2) * 0.04, Math.cos(i * 1.7) * 0.12, 0.04, 0.025, 0.04, fl, TL.plain, i);
    if (ripe) for (const [x, z, s] of [[-0.2, 0.26, 0.11], [0.18, 0.28, 0.09], [0.28, -0.1, 0.1]]) E.box(x, 0.0, z, s, s * 0.7, s * 1.2, tub, TL.plain, x * 4);
  },
  // chou : une rosette de grandes feuilles bleutées, la pomme serrée au milieu (la variété la teinte : rouge, frisé)
  chou(E, k, ripe, c) {
    const V = m19Var('chou', c), base = m19Mul([0.66, 0.86, 0.66], V), pomme = m19Mul([0.8, 0.95, 0.74], V), n = 7, L = 0.1 + k * 0.26;
    for (let i = 0; i < n; i++) cropLeaf(E, i / n * TAU + 0.3, 0.9 + (i % 2) * 0.28, L, 0.13 + k * 0.12, 0.02, i % 2 ? base : v3.scale(base, 0.88), TL.cabbage, 0.03, 0.01, 0, 0, TF.pFeuilleLarge);
    if (k < 0.4) return;
    const s = 0.06 + k * 0.17;
    E.box(0, s * 0.42, 0, s, s * 0.84, s, pomme, m19F(TL.cabbage, TF.qCorps));
    E.box(0, s * 0.5, 0, s * 0.86, s * 0.9, s * 0.86, v3.scale(pomme, 0.94), m19F(TL.cabbage, TF.pTronc), 0.785);
    for (let i = 0; i < 4; i++) cropLeaf(E, i * 1.57 + 0.6, 0.35, s * 0.9, s * 0.8, 0.015, v3.scale(pomme, 0.9), TL.cabbage, s * 0.35, 0.02, 0, 0, TF.pFeuilleLarge);
  },
  // tomate : tuteur, tige, bouquets de feuilles dentelées, fleurs jaunes, grappes de fruits
  tomate(E, k, ripe) {
    const H = 0.25 + k * 0.85, fruit = hexf('#d83020');
    E.bx(0.06, 0, 0.04, 0.035, 1.15, 0.035, WHITE, TL.wood);
    E.box(0.06, 1.1, 0.04, 0.05, 0.02, 0.05, WHITE, TL.wood);
    E.bx(0, 0, 0, 0.03, H, 0.03, M19V.tige, TL.plain);
    for (let i = 0; i < 6; i++) {
      const y = H * (0.18 + i * 0.14), a = i * 2.3;
      if (y > H) break;
      cropLeaf(E, a, 1.0, 0.12 + k * 0.12, 0.09 + k * 0.05, 0.015, i % 2 ? M19V.feuille : M19V.feuilleS, TL.m19Feuille, 0.01, y, 0, 0, TF.pFeuilleLarge);
      cropLeaf(E, a + 2.8, 0.75, 0.1 + k * 0.1, 0.08 + k * 0.04, 0.015, M19V.feuilleS, TL.m19Feuille, 0.01, y + 0.05, 0, 0, TF.pFeuilleLarge);
    }
    if (k > 0.5 && !ripe) for (let i = 0; i < 3; i++) E.box(Math.sin(i * 2) * 0.1, H * (0.45 + i * 0.15), Math.cos(i * 2) * 0.1, 0.035, 0.02, 0.035, hexf('#f0d020'), TL.plain, i);
    if (k > 0.7) {
      const col = ripe ? fruit : [0.5, 0.75, 0.32];
      for (const [x, y, z, s] of [[0.13, 0.42, 0.08, 0.085], [0.16, 0.34, 0.0, 0.075], [-0.12, 0.58, 0.1, 0.08], [-0.08, 0.5, 0.14, 0.07], [0.04, 0.68, -0.15, 0.08], [-0.13, 0.3, -0.1, 0.075]]) {
        E.box(x, y * H / 1.1, z, s, s * 0.85, s, col, TL.plain, x * 5); E.box(x, y * H / 1.1 + s * 0.45, z, s * 0.5, 0.012, s * 0.5, M19V.feuilleS, TL.plain, x * 5 + 0.7);
      }
    }
  },
  // citrouille : la tige rampante, de grandes feuilles, le fruit côtelé (octogone) et son pédoncule
  citrouille(E, k, ripe, c) {
    const V = m19Var('citrouille', c), n = 6, L = 0.12 + k * 0.24;
    E.box(0.1, 0.02, 0.05, 0.62 * Math.min(1, k + 0.3), 0.025, 0.025, M19V.tige, TL.plain, 0.4);
    for (let i = 0; i < n; i++) { const a = i / n * TAU + 0.2, r = 0.12 + (i % 2) * 0.12; cropLeaf(E, a, 1.15, L, 0.16 + k * 0.1, 0.018, i % 2 ? M19V.feuille : M19V.feuilleS, TL.m19Feuille, r, 0.06 + (i % 3) * 0.03, 0, 0, TF.pFeuilleLarge); }
    if (k < 0.4) { if (k > 0.25) E.box(0.15, 0.1, 0.1, 0.06, 0.05, 0.06, hexf('#f0c020'), TL.plain); return; }
    const s = 0.12 + k * 0.36, col = ripe ? (V || WHITE) : [0.72, 0.9, 0.5], code = ripe && V ? TL.plain : TL.pumpkin;
    E.box(-0.05, s * 0.38, -0.05, s, s * 0.76, s * 0.94, col, m19F(code, TF.qCorps));
    E.box(-0.05, s * 0.38, -0.05, s * 0.94, s * 0.7, s, col, m19F(code, TF.qCorps), 0.785);
    E.box(-0.05, s * 0.8, -0.05, 0.035, 0.07, 0.035, [0.45, 0.55, 0.3], m19F(TL.plain, TF.pTronc), 0, 0.3, 0);
  },
  // maïs : trois tiges, de longues feuilles qui retombent, la panicule en haut, les épis dans leurs spathes
  mais(E, k, ripe, c) {
    const V = m19Var('mais', c), h = 0.2 + k * 1.65, vert = ripe ? [0.72, 0.74, 0.42] : [0.48, 0.78, 0.36];
    for (const [x, z, a0] of [[-0.18, -0.16, 0.4], [0.2, 0.12, 2.2], [-0.08, 0.24, 4.1]]) {
      E.bx(x, 0, z, 0.05, h, 0.05, vert, m19F(TL.carrotTop, TF.pTronc));
      for (let j = 0; j < 4; j++) { const y = h * (0.2 + j * 0.2); cropLeaf(E, a0 + j * 2.6, 0.95 + (j % 2) * 0.2, 0.25 + k * 0.32, 0.07, 0.01, vert, TL.leaves, 0.02, y, x, z, TF.pLame); }
      if (k > 0.75) for (let j = 0; j < 3; j++) E.box(x + Math.sin(j * 2.1) * 0.04, h + 0.08, z + Math.cos(j * 2.1) * 0.04, 0.012, 0.16, 0.012, [0.86, 0.78, 0.46], TL.plain, 0, Math.sin(j * 2.1) * 0.4, Math.cos(j * 2.1) * 0.4);
      if (ripe) { const cy = h * 0.48; E.box(x + 0.07, cy, z, 0.07, 0.24, 0.07, V || WHITE, V ? TL.plain : TL.corn, 0, 0, -0.35); E.box(x + 0.06, cy - 0.06, z, 0.08, 0.2, 0.08, [0.82, 0.86, 0.56], m19F(TL.leaves, TF.pFeuille), 0, 0, -0.25); }
    }
  },
  // fraise : des feuilles par trois, des fleurs blanches, des fruits rouges qui pendent
  fraise(E, k, ripe) {
    const fruit = hexf('#e02030'), L = 0.06 + k * 0.08;
    for (let i = 0; i < 5; i++) {
      const a = i * 1.257, x = Math.sin(a) * (0.06 + k * 0.08), z = Math.cos(a) * (0.06 + k * 0.08), y = 0.04 + k * 0.05;
      E.box(x * 0.5, y * 0.5, z * 0.5, 0.012, y, 0.012, M19V.tige, TL.plain, a, 0.5);
      for (let j = -1; j <= 1; j++) cropLeaf(E, a + j * 0.75, 1.2, L, 0.05 + k * 0.03, 0.01, j ? M19V.feuilleS : M19V.feuille, TL.m19Feuille, 0, y, x, z, TF.pFeuilleLarge);
    }
    if (k > 0.55 && !ripe) for (let i = 0; i < 3; i++) E.box(Math.sin(i * 2.2 + 0.5) * 0.16, 0.08, Math.cos(i * 2.2 + 0.5) * 0.16, 0.04, 0.01, 0.04, [0.97, 0.96, 0.92], TL.plain, i);
    if (ripe) for (const [x, z] of [[0.2, 0.08], [-0.15, 0.18], [0.04, -0.21], [-0.18, -0.12]]) { E.box(x, 0.035, z, 0.045, 0.055, 0.045, fruit, m19F(TL.plain, TF.qCorps)); E.box(x, 0.065, z, 0.04, 0.01, 0.04, M19V.feuilleS, TL.plain, 0.785); }
  },
  // tournesol : une tige forte, de grandes feuilles, le capitule brun cerclé de pétales (étoile à huit branches)
  tournesol(E, k, ripe) {
    const h = 0.2 + k * 1.7, pet = hexf('#f0c020');
    E.bx(0, 0, 0, 0.055, h, 0.055, M19V.tige, m19F(TL.carrotTop, TF.pTronc));
    for (let j = 0; j < 4; j++) cropLeaf(E, j * 2.4, 0.95, 0.14 + k * 0.18, 0.12 + k * 0.08, 0.015, j % 2 ? M19V.feuille : M19V.feuilleS, TL.m19Feuille, 0.02, h * (0.25 + j * 0.16), 0, 0, TF.pFeuilleLarge);
    if (k < 0.55) return;
    const d = 0.22 + k * 0.3, y = h + 0.02;
    if (k < 0.75) { E.box(0, y, 0.03, d * 0.5, d * 0.5, 0.06, [0.4, 0.62, 0.3], TL.plain, 0, -0.3); return; }
    E.box(0, y, 0.04, d, d, 0.02, pet, TL.plain, 0, -0.3); E.box(0, y, 0.04, d, d, 0.02, pet, TL.plain, 0, -0.3, 0.785);
    E.box(0, y, 0.06, d * 0.55, d * 0.55, 0.04, ripe ? [0.36, 0.24, 0.12] : [0.5, 0.36, 0.16], TL.plain, 0, -0.3, 0.3);
    E.box(0, y, -0.0, d * 0.5, d * 0.5, 0.04, [0.4, 0.62, 0.3], TL.plain, 0, -0.3);
  },
  // betterave : grandes feuilles aux nervures rouges, la racine bombée qui sort de terre
  betterave(E, k, ripe) {
    const root = hexf('#7a1a40'), tige = [0.62, 0.22, 0.3];
    for (let i = 0; i < 6; i++) {
      const a = i * 1.05 + 0.2, t = 0.3 + (i % 2) * 0.25, L = 0.08 + k * 0.24;
      cropLeaf(E, a, t, L * 0.5, 0.02, 0.015, tige, TL.plain, 0.01, 0.01);
      cropLeaf(E, a, t + 0.15, L, 0.08 + k * 0.07, 0.012, M19V.feuille, TL.m19Feuille, 0.01 + L * 0.5 * Math.sin(t), L * 0.5 * Math.cos(t), 0, 0, TF.pFeuilleLarge);
    }
    const b = ripe ? 0.17 : 0.06 * k;
    if (b > 0.02) E.bx(0, -0.05, 0, b, b * 0.8, b, root, m19F(TL.plain, TF.qCorps));
  },
  // haricots : deux rames, des feuilles en cœur qui grimpent, les gousses qui pendent
  haricot(E, k, ripe) {
    const pod = hexf('#6ab040'), h = 0.15 + k * 1.0;
    for (const s of [-0.2, 0.2]) {
      E.bx(s, 0, 0, 0.035, 1.25, 0.035, WHITE, TL.wood);
      E.bx(s, 0, 0, 0.015, h, 0.015, M19V.tige, TL.plain);
      for (let j = 0; j < 5; j++) { const y = h * (0.12 + j * 0.18); if (y > h) break; cropLeaf(E, j * 2.1 + s * 9, 1.15, 0.09 + k * 0.05, 0.08 + k * 0.03, 0.012, j % 2 ? M19V.feuille : M19V.feuilleS, TL.m19Feuille, 0.01, y, s, 0, TF.pFeuilleLarge); }
      if (ripe) for (let j = 0; j < 4; j++) E.box(s + (j % 2 ? 0.06 : -0.05), 0.3 + j * 0.2, (j % 2 ? 0.04 : -0.03), 0.022, 0.15, 0.014, pod, m19F(TL.plain, TF.pFeuille), j, 0.15, (j % 2 ? 0.2 : -0.2));
    }
  },
  // melon : la tige rampante, des feuilles rondes, le melon brodé (côtelé)
  melon(E, k, ripe) {
    const L = 0.1 + k * 0.18;
    for (let i = 0; i < 5; i++) cropLeaf(E, i * 1.257 + 0.5, 1.2, L, 0.13 + k * 0.08, 0.015, i % 2 ? M19V.feuille : M19V.feuilleS, TL.m19Feuille, 0.1 + (i % 2) * 0.1, 0.05, 0, 0, TF.pFeuilleLarge);
    E.box(0.12, 0.02, 0.0, 0.5 * Math.min(1, k + 0.3), 0.022, 0.022, M19V.tige, TL.plain, 1.1);
    if (k < 0.4) return;
    const s = 0.1 + k * 0.24, col = ripe ? hexf('#9ac060') : hexf('#6a9a40');
    E.box(-0.06, s * 0.36, -0.04, s * 1.15, s * 0.72, s * 0.95, col, m19F(TL.stripes, TF.qCorps));
    E.box(-0.06, s * 0.36, -0.04, s * 1.05, s * 0.66, s * 1.02, v3.scale(col, 0.92), m19F(TL.stripes, TF.qCorps), 0.785);
  },
  // lin : des tiges fines, des feuilles étroites, les petites fleurs bleues (capsules dorées à maturité)
  lin(E, k, ripe) {
    const h = 0.15 + k * 0.7, fl = hexf('#6a8ae0');
    for (let i = 0; i < 9; i++) {
      const x = ((i * 37) % 7 - 3) * 0.09, z = ((i * 53) % 5 - 2) * 0.11, hh = h * (0.85 + (i % 3) * 0.08), lean = ((i * 13) % 5 - 2) * 0.05;
      E.box(x, hh / 2, z, 0.018, hh, 0.018, ripe ? [0.78, 0.7, 0.42] : [0.5, 0.78, 0.4], TL.plain, 0, lean, 0);
      if (i % 3 === 0) cropLeaf(E, i, 0.6, 0.08, 0.02, 0.006, M19V.feuille, TL.plain, 0, hh * 0.4, x, z, TF.pLame);
      if (k > 0.6) { const yy = hh * Math.cos(lean); if (ripe) E.box(x, yy + 0.02, z + hh * Math.sin(lean) * 0.5, 0.03, 0.035, 0.03, hexf('#b8a060'), TL.plain); else { E.box(x, yy + 0.015, z + hh * Math.sin(lean) * 0.5, 0.055, 0.012, 0.055, fl, TL.plain, i); E.box(x, yy + 0.02, z + hh * Math.sin(lean) * 0.5, 0.015, 0.012, 0.015, [0.95, 0.9, 0.5], TL.plain); } }
    }
  },
  // jeune pommier (planté par le joueur) : tronc, branches, une couronne en couches, des pommes
  pommier(E, k, ripe) {
    const t = 0.6 + k * 1.2, w = 0.07 + k * 0.08, s = 0.4 + k * 1.3, ec = rgbf('#8a6a4a');
    E.bx(0, 0, 0, w, t, w, ec, m19F(TL.m19Ecorce, TF.pTronc));
    for (let i = 0; i < 3; i++) E.box(Math.sin(i * 2.1) * s * 0.18, t * 0.92, Math.cos(i * 2.1) * s * 0.18, w * 0.6, s * 0.45, w * 0.6, ec, TL.m19Ecorce, i * 2.1, 0.7, 0);
    E.box(0, t + s * 0.28, 0, s * 0.95, s * 0.5, s * 0.95, [0.86, 1, 0.86], TL.leaves);
    E.box(0, t + s * 0.42, 0, s * 0.8, s * 0.5, s * 0.8, WHITE, TL.leaves, 0.785);
    E.box(0, t + s * 0.66, 0, s * 0.55, s * 0.32, s * 0.55, [0.92, 1.05, 0.92], TL.leaves, 0.4);
    if (ripe) for (let i = 0; i < 8; i++) { const a = i * 2.39; E.box(Math.sin(a) * s * 0.47, t + s * (0.12 + (i % 3) * 0.16), Math.cos(a) * s * 0.47, 0.09, 0.09, 0.09, rgbf('#c82020'), TL.plain, a); }
  },
  // culture morte : des tiges couchées, brunes, sur la terre nue
  mort(E) {
    for (let i = 0; i < 5; i++) cropLeaf(E, i * 1.4 + 0.3, 1.25, 0.14 + (i % 2) * 0.06, 0.04, 0.01, [0.42, 0.34, 0.22], TL.straw, 0.02, 0.01, 0, 0, TF.pFeuille);
    E.box(0, 0.04, 0, 0.025, 0.08, 0.025, [0.36, 0.28, 0.18], TL.straw, 0, 0.3);
  },
});
// gabarits sans gros cubes : aromates (des tiges feuillues), plantes à tuteur (tige, étages de feuilles), buissons
// (des touffes tournées, effilées vers le bas)
CROP_TPL.aromate = function (E, k, ripe, c, C, col, p) {
  const h = 0.06 + k * (p.h || 0.3), lc = p.lf ? hexf(p.lf) : col, vr = c.vr || 0, big = p.big, n = big ? 5 : 7;
  for (let i = 0; i < n; i++) {
    const a = i * 2.39 + vr, x = Math.sin(a) * (0.03 + (i % 3) * 0.03), z = Math.cos(a) * (0.03 + (i % 3) * 0.03), hh = h * (0.7 + (i % 3) * 0.15), lean = 0.12 + (i % 2) * 0.12;
    cropLeaf(E, a, lean, hh, 0.014, 0.014, p.woody ? [0.45, 0.42, 0.32] : v3.scale(lc, 0.8), TL.plain, 0, 0, x, z, 0);
    const s = (0.6 + k * 0.6), tx2 = x + Math.sin(a) * hh * Math.sin(lean), tz2 = z + Math.cos(a) * hh * Math.sin(lean), ty = hh * Math.cos(lean);
    for (let j = 0; j < 2; j++) cropLeaf(E, a + (j ? 1.4 : -1.4), p.frise ? 1.0 : 0.8, (big ? 0.08 : 0.05) * s, (big ? 0.07 : 0.04) * s, 0.01, j ? lc : v3.scale(lc, 0.88), TL.m19Feuille, 0, ty * (0.55 + j * 0.3), x + (tx2 - x) * (0.55 + j * 0.3), z + (tz2 - z) * (0.55 + j * 0.3), big ? TF.pFeuilleLarge : TF.pFeuille);
    cropLeaf(E, a, 0.2, (big ? 0.07 : 0.05) * s, (big ? 0.06 : 0.035) * s, 0.01, lc, TL.m19Feuille, 0, ty, tx2, tz2, TF.pFeuille);
  }
  if (p.spikes && k > 0.5) for (let i = 0; i < 7; i++) { const a = i * 0.9 + vr, r = 0.06 + (i % 2) * 0.06; E.bx(Math.sin(a) * r, h * 0.6, Math.cos(a) * r, 0.015, h * 0.7, 0.015, lc, TL.plain); E.bx(Math.sin(a) * r, h * 1.25, Math.cos(a) * r, 0.035, 0.12, 0.035, col, m19F(TL.plain, TF.pTronc)); }
  if (p.flowers && k > 0.7) for (let i = 0; i < 6; i++) { const a = i * 1.1; E.box(Math.sin(a) * 0.08, h * 0.95, Math.cos(a) * 0.08, 0.03, 0.03, 0.03, hexf(p.flowers), TL.plain); }
  if (p.pods && k > 0.6) for (let i = 0; i < 6; i++) { const a = i * 1.05 + vr; E.box(Math.sin(a) * 0.12, h * 0.55, Math.cos(a) * 0.12, 0.025, 0.06, 0.018, ripe ? col : hexf('#8ab050'), TL.plain, a, 0.4); }
};
CROP_TPL.tuteur = function (E, k, ripe, c, C, col, p) {
  const H = p.low ? 0.75 : 1.15, vr = c.vr || 0;
  E.bx(0.05, 0, 0.03, 0.035, H, 0.035, WHITE, TL.wood);
  if (p.twig) for (const s of [-0.12, 0.12]) E.box(s, H * 0.5, 0, 0.02, H, 0.02, WHITE, TL.wood, 0, 0, s * 1.2);
  const fh = 0.15 + k * (H - 0.2);
  E.bx(0, 0, 0, 0.025, fh, 0.025, M19V.tige, TL.plain);
  const n = 3 + Math.round(k * 4);
  for (let j = 0; j < n; j++) {
    const y = fh * (0.12 + j / n * 0.85), a = j * 2.4 + vr, L = (0.1 + k * 0.1) * (1 - j / n * 0.35);
    cropLeaf(E, a, 1.0, L, L * 0.85, 0.014, j % 2 ? M19V.feuille : M19V.feuilleS, TL.m19Feuille, 0.01, y, 0, 0, TF.pFeuilleLarge);
    cropLeaf(E, a + 2.6, 0.8, L * 0.85, L * 0.75, 0.014, M19V.feuilleS, TL.m19Feuille, 0.01, y + 0.04, 0, 0, TF.pFeuilleLarge);
  }
  if (k < 0.72) { if (k > 0.5) for (let j = 0; j < 2; j++) E.box(Math.sin(j * 2.5) * 0.08, fh * (0.5 + j * 0.2), Math.cos(j * 2.5) * 0.08, 0.03, 0.02, 0.03, [0.96, 0.94, 0.86], TL.plain, j); return; }
  const [fx, fy, fz] = p.fruit, fc = ripe ? col : mixc(col, _green, 0.7);
  for (let j = 0; j < p.n; j++) {
    const a = j * 2.39 + 0.5 + vr, r = 0.1 + 0.04 * (j % 2), y = fh * (0.2 + 0.65 * ((j * 0.37) % 1));
    E.box(Math.sin(a) * r, y, Math.cos(a) * r, fx, fy, fz, fc, m19F(TL.plain, TF.qCorps), a);
    E.box(Math.sin(a) * r, y + fy * 0.5, Math.cos(a) * r, fx * 0.5, 0.015, fz * 0.5, M19V.feuilleS, TL.plain, a + 0.785);
  }
};
CROP_TPL.buisson = function (E, k, ripe, c, C, col, p) {
  const vr = c.vr || 0, sz = (p.low ? 0.18 : 0.26) + k * (p.low ? 0.24 : 0.4);
  if (p.cane) {
    for (let i = 0; i < 5; i++) {
      const a = i * 1.26 + vr, x = Math.sin(a) * 0.15, z = Math.cos(a) * 0.15, hh = 0.2 + k * 0.9;
      E.bx(x, 0, z, 0.022, hh, 0.022, hexf('#8a6a4a'), TL.plain);
      for (let j = 0; j < 3; j++) cropLeaf(E, a + j * 2.1, 1.05, 0.1 + k * 0.05, 0.09 + k * 0.03, 0.012, j % 2 ? M19V.feuille : M19V.feuilleS, TL.m19Feuille, 0.01, hh * (0.35 + j * 0.22), x, z, TF.pFeuilleLarge);
    }
  } else {
    // des touffes de feuillage autour de quelques tiges : une silhouette découpée, pas un cube
    for (let i = 0; i < 4; i++) { const a = i * 1.57 + vr * 0.4; cropLeaf(E, a, 0.45, sz * 0.75, 0.025, 0.025, hexf('#6a5038'), TL.plain, 0, 0, 0, 0, 0); }
    for (let i = 0; i < 6; i++) {
      const a = i * 1.047 + vr * 0.4 + (i % 2) * 0.3, r = sz * (0.26 + (i % 2) * 0.08), s = sz * (0.5 - (i % 3) * 0.05), y = sz * (0.1 + (i % 3) * 0.14);
      E.bx(Math.sin(a) * r, y, Math.cos(a) * r, s, s * 0.8, s, i % 2 ? [0.9, 1.04, 0.9] : WHITE, m19F(TL.leaves, TF.qCorps), a * 1.7);
    }
    E.bx(0, sz * 0.36, 0, sz * 0.55, sz * 0.5, sz * 0.55, [0.95, 1.06, 0.95], m19F(TL.leaves, TF.pPyramide), 0.4);
  }
  const bloom = p.rose && k > 0.7;
  if (!ripe && !bloom) return;
  const n = p.n || 8, b = p.berry || 0.04, R = p.cane ? 0.22 : sz * 0.52, top = p.cane ? 0.2 + k * 0.9 : sz;
  for (let j = 0; j < n; j++) {
    const a = j * 2.39 + vr, y = top * (0.3 + 0.6 * ((j * 0.618) % 1)), x = Math.sin(a) * R, z = Math.cos(a) * R;
    if (p.grappes) { for (let q = 0; q < 3; q++) E.box(x, y - q * b * 1.15, z, b, b, b, col, TL.plain); }
    else if (p.rose) { E.box(x, y, z, b, b * 0.8, b, col, TL.plain, a); E.box(x, y + b * 0.3, z, b * 0.6, b * 0.5, b * 0.6, lightc(col, 1.15), TL.plain, a + 0.785); }
    else { E.box(x, y, z, b, b, b, col, TL.plain, a); if (p.star) E.box(x, y + b * 0.55, z, b * 1.4, 0.01, b * 1.4, hexf('#3a6a2a'), TL.plain, a + 0.4); }
  }
};
// au loin (M19LOD.D.cultures), la culture reprend son modèle d'avant (et les gabarits d'avant), aussi léger qu'avant :
// dans le champ (cropDraw) comme dans les potagers des villes (drawCropAt)
function m19AnciennesCultures(id, fn) {
  const neuf = CROP_MODELS[id], anc = M19_CULTURES_ANC[id], A = M19_GABARITS_ANC;
  const ga = CROP_TPL.aromate, gt = CROP_TPL.tuteur, gb = CROP_TPL.buisson;
  if (anc) CROP_MODELS[id] = anc;
  CROP_TPL.aromate = A.aromate || ga; CROP_TPL.tuteur = A.tuteur || gt; CROP_TPL.buisson = A.buisson || gb;
  try { return fn(); } finally { if (anc) CROP_MODELS[id] = neuf; CROP_TPL.aromate = ga; CROP_TPL.tuteur = gt; CROP_TPL.buisson = gb; }
}
{
  const _cd = cropDraw;
  cropDraw = function (E, c, k, ripe) {
    if (!c || !M19LOD.loin(E, c, M19LOD.D.cultures)) return _cd(E, c, k, ripe);
    return m19AnciennesCultures(c.dead ? 'mort' : c.c, () => _cd(E, c, k, ripe));
  };
  if (typeof drawCropAt === 'function') {
    const _dca = drawCropAt;
    drawCropAt = function (E, id, dx, dy, dz, k, ripe, vr) {
      if (!M19LOD.loin(E, null, M19LOD.D.cultures)) return _dca(E, id, dx, dy, dz, k, ripe, vr);
      return m19AnciennesCultures(id, () => _dca(E, id, dx, dy, dz, k, ripe, vr));
    };
  }
}

// ============================================================================
//  LES OBJETS POSÉS LES PLUS VUS, redessinés (mêmes noms, mêmes collisions,
//  même encombrement ; l'avant regarde +z, l'origine au sol au centre)
// ============================================================================
const M19P = { bois: rgbf('#a8805a'), boisC: rgbf('#c09468'), sombre: rgbf('#5a4028'), fer: rgbf('#4a4c52'), paille: rgbf('#d8b870'), pierre: [0.92, 0.9, 0.86], toile: rgbf('#e8dcc0') };
// un tonneau : deux moitiés évasées vers le ventre (section octogonale), trois cercles de fer, le fond
function m19Tonneau(E, h, r, col, couv) {
  const d = r * 2, hb = h / 2;
  for (const [y0, shp] of [[0, TF.pTronc], [hb, TF.bonnet]]) {
    E.bx(0, y0, 0, d, hb, d, col, m19F(TL.barrel, shp));
    E.bx(0, y0, 0, d, hb, d, col, m19F(TL.barrel, shp), Math.PI / 4);
  }
  for (const y of [h * 0.12, h * 0.5 - 0.03, h * 0.86]) { const k = y > h * 0.3 && y < h * 0.7 ? 1.035 : 0.93; E.bx(0, y, 0, d * k, 0.045, d * k, M19P.fer, TL.iron); E.bx(0, y, 0, d * k, 0.045, d * k, M19P.fer, TL.iron, Math.PI / 4); }
  if (couv !== false) E.bx(0, h - 0.01, 0, d * 0.78, 0.025, d * 0.78, v3.scale(col, 0.8), TL.darkwood, Math.PI / 8);
}
// une roue de bois (axe x) : la jante en huit pièces, les rayons (nr boîtes traversantes : 2·nr rayons), le moyeu
// cerclé de fer ; a : l'angle de roulement
function m19Roue(E, x, y, z, r, w, a, col, nr) {
  const t = r * 0.17, L = 2 * r * Math.sin(Math.PI / 8) + 0.012, rm = r * Math.cos(Math.PI / 8) - t / 2, n = nr || 3;
  for (let k = 0; k < 8; k++) { const b = a + (k + 0.5) * Math.PI / 4; E.box(x, y + rm * Math.cos(b), z + rm * Math.sin(b), w, t, L, col, TL.darkwood, 0, b); }
  for (let k = 0; k < n; k++) E.box(x, y, z, w * 0.45, 2 * rm, w * 0.55, col, TL.wood, 0, a + k * Math.PI / n);
  E.box(x, y, z, w * 1.6, r * 0.32, r * 0.32, M19P.fer, TL.iron, 0, a);
}
// (les modèles d'avant, gardés pour le lointain : M19LOD ; les nouveaux sont posés plus bas, après M19_OBJETS)
const M19_OBJETS_ANC = Object.assign({}, PROP_MODELS);
const M19_OBJETS = ({
  // chaise paillée : pieds tournés (effilés), fond de paille tressée, dossier à barreaux cintrés, traverses
  chaise(E) {
    const B = M19P.bois;
    for (const [x, z] of [[-0.19, 0.19], [0.19, 0.19]]) E.bx(x, 0, z, 0.045, 0.45, 0.045, B, m19F(TL.wood, TF.pTronc));
    for (const x of [-0.19, 0.19]) E.bx(x, 0, -0.19, 0.05, 0.98, 0.05, B, m19F(TL.wood, TF.pTronc));
    E.bx(0, 0.41, 0, 0.44, 0.045, 0.42, M19P.paille, TL.m19Paille);
    for (const z of [-0.2, 0.2]) E.bx(0, 0.4, z, 0.42, 0.04, 0.035, B, TL.wood);
    for (const x of [-0.2, 0.2]) E.bx(x, 0.4, 0, 0.035, 0.04, 0.38, B, TL.wood);
    for (const y of [0.13]) { for (const z of [-0.19, 0.19]) E.bx(0, y, z, 0.38, 0.025, 0.025, B, TL.wood); for (const x of [-0.19, 0.19]) E.bx(x, y + 0.05, 0, 0.025, 0.025, 0.38, B, TL.wood); }
    for (const y of [0.62, 0.76, 0.9]) E.box(0, y, -0.2, 0.36, 0.06, 0.025, M19P.boisC, TL.wood, 0, 0.1);
    for (const x of [-0.19, 0.19]) E.bx(x, 0.98, -0.19, 0.06, 0.04, 0.06, B, TL.wood);
  },
  // table de ferme : plateau épais à emboîtures, ceinture, pieds effilés, un tiroir
  table(E) {
    const B = M19P.bois, S = M19P.sombre;
    E.bx(0, 0.71, 0, 1.4, 0.06, 0.86, B, TL.wood);
    for (const s of [-1, 1]) E.bx(s * 0.67, 0.71, 0, 0.07, 0.065, 0.86, v3.scale(B, 0.92), TL.wood);
    for (const [x, z] of [[-0.62, -0.36], [0.62, -0.36], [-0.62, 0.36], [0.62, 0.36]]) E.bx(x, 0, z, 0.08, 0.71, 0.08, S, m19F(TL.darkwood, TF.pTronc));
    for (const s of [-1, 1]) { E.bx(0, 0.58, s * 0.36, 1.16, 0.13, 0.04, S, TL.darkwood); E.bx(s * 0.62, 0.58, 0, 0.04, 0.13, 0.64, S, TL.darkwood); }
    E.bx(0, 0.6, 0.385, 0.5, 0.09, 0.012, v3.scale(S, 1.15), TL.darkwood); E.bx(0, 0.635, 0.395, 0.06, 0.025, 0.02, rgbf('#c8a040'), TL.gold);
    for (const s of [-1, 1]) E.bx(0, 0.1, s * 0.36, 1.16, 0.05, 0.04, S, TL.darkwood);
  },
  // lit à rouleaux : chevet et pied à panneaux, quatre montants, le matelas, le traversin, la couverture repliée
  lit(E, o) {
    const c = o.data && o.data.col ? rgbf(o.data.col) : rgbf('#6a8ab0'), B = M19P.sombre, B2 = v3.scale(M19P.bois, 0.86);
    for (const [x, z, h] of [[-0.49, -0.98, 1.05], [0.49, -0.98, 1.05], [-0.49, 0.98, 0.72], [0.49, 0.98, 0.72]]) { E.bx(x, 0, z, 0.08, h, 0.08, B, TL.darkwood); E.bx(x, h, z, 0.1, 0.05, 0.1, B, TL.darkwood); }
    E.bx(0, 0.28, -0.98, 0.9, 0.7, 0.05, B2, TL.wood); E.bx(0, 0.92, -0.98, 0.9, 0.08, 0.07, B, TL.darkwood);
    E.bx(0, 0.28, 0.98, 0.9, 0.38, 0.05, B2, TL.wood); E.bx(0, 0.64, 0.98, 0.9, 0.06, 0.07, B, TL.darkwood);
    for (const s of [-1, 1]) E.bx(s * 0.49, 0.18, 0, 0.06, 0.2, 1.9, B, TL.darkwood);
    E.bx(0, 0.36, 0.02, 0.92, 0.16, 1.88, rgbf('#eae4d6'), TL.pillow);
    E.bx(0, 0.52, -0.78, 0.82, 0.14, 0.26, WHITE, m19F(TL.pillow, TF.qCorps));
    E.bx(0, 0.52, 0.2, 0.96, 0.07, 1.3, c, TL.blanket);
    E.bx(0, 0.58, -0.4, 0.96, 0.06, 0.26, v3.scale(c, 1.1), TL.blanket);
    for (const s of [-1, 1]) E.bx(s * 0.485, 0.27, 0.2, 0.02, 0.3, 1.3, c, TL.blanket);
  },
  // étagère : montants, corniche, plinthe, quatre planches au bord avant ; ce qu'on y range selon la sorte
  etagere(E, o) {
    const B = M19P.sombre, B2 = M19P.bois;
    E.bx(0, 0.05, -0.17, 1.36, 1.88, 0.04, v3.scale(B, 0.8), TL.darkwood);
    for (const s of [-0.68, 0.68]) E.bx(s, 0, 0.02, 0.06, 1.92, 0.42, B, TL.darkwood);
    E.bx(0, 1.92, 0.02, 1.5, 0.07, 0.48, B, TL.darkwood); E.bx(0, 1.85, 0.21, 1.42, 0.07, 0.04, B2, TL.wood);
    E.bx(0, 0, 0.02, 1.36, 0.1, 0.42, B, TL.darkwood);
    for (const y of [0.1, 0.62, 1.12, 1.6]) { E.bx(0, y, 0.02, 1.32, 0.04, 0.4, B2, TL.wood); E.bx(0, y - 0.02, 0.215, 1.32, 0.05, 0.02, B, TL.darkwood); }
    const k = o.data && o.data.kind;
    if (k === 'livres') { for (const y of [0.14, 0.66, 1.16]) { E.bx(-0.28, y, 0.04, 0.68, 0.36, 0.3, WHITE, TL.book); E.bx(0.36, y, 0.04, 0.5, 0.3, 0.3, WHITE, TL.book); E.box(0.12, y + 0.14, 0.04, 0.05, 0.3, 0.26, rgbf('#7a3a2a'), TL.leather, 0, 0, 0.4); } }
    else if (k === 'pain') { for (const y of [0.14, 0.66, 1.16]) for (let i = 0; i < 3; i++) E.bx(-0.42 + i * 0.42, y, 0.06, 0.32, 0.14, 0.24, WHITE, m19F(TL.bread, TF.qCorps), i * 0.3); }
    else if (k === 'bocaux') {
      const cols = ['#e8d090', '#c84a30', '#7a9a4a', '#9a5aa0', '#e8e0c8'];
      for (const [j, y] of [0.14, 0.66, 1.16].entries()) for (let i = 0; i < 5; i++) { const x = -0.52 + i * 0.26, h = 0.16 + ((i + j) % 2) * 0.06; E.bx(x, y, 0.06, 0.15, h, 0.15, rgbf(cols[(i + j * 2) % 5]), TL.glass); E.bx(x, y + h, 0.06, 0.12, 0.03, 0.12, rgbf('#e8e0d0'), TL.cloth); }
    } else { for (const y of [0.14, 0.66]) for (let i = 0; i < 3; i++) m19SubTonneau(E, -0.42 + i * 0.42, y, 0.04, 0.36); E.bx(0, 1.16, 0.04, 1.1, 0.26, 0.3, WHITE, TL.barrel); }
  },
  // âtre : jambages de pierre, manteau de bois, hotte qui monte en se resserrant, contrecœur noirci, chenets, bûches
  cheminee(E, o, t) {
    const S = mt(M_STONE), C = [0.95, 0.92, 0.88];
    E.bx(0, 0, 0.12, 1.7, 0.08, 0.62, [0.8, 0.78, 0.74], S);
    for (const s of [-1, 1]) E.bx(s * 0.62, 0, 0.1, 0.36, 1.0, 0.56, C, S);
    E.bx(0, 0, -0.12, 0.9, 1.0, 0.14, [0.08, 0.07, 0.06], TL.coal);
    E.bx(0, 1.0, 0.12, 1.76, 0.18, 0.6, M19P.sombre, TL.darkwood);
    E.bx(0, 1.18, 0.1, 1.84, 0.06, 0.66, M19P.sombre, TL.darkwood);
    E.bx(0, 1.24, -0.02, 1.5, 0.7, 0.5, C, S - 512 * TF.pPyramide);
    E.bx(0, 1.94, -0.06, 0.66, 0.86, 0.36, C, S);
    for (const s of [-0.28, 0.28]) { E.bx(s, 0.08, 0.15, 0.05, 0.22, 0.05, M19P.fer, TL.iron); E.bx(s, 0.08, 0.05, 0.04, 0.05, 0.3, M19P.fer, TL.iron); }
    E.box(0, 0.16, 0.06, 0.7, 0.11, 0.11, [0.8, 0.72, 0.62], TL.bark, 0.1); E.box(0.05, 0.25, 0.04, 0.62, 0.1, 0.1, [0.8, 0.72, 0.62], TL.bark, -0.15);
    if (!o.data || o.data.lit !== false) { const f = t ? 1 + Math.sin(t.t * 11 + o.z) * 0.15 : 1; E.fl = FX_EMIT; E.bx(0, 0.18, 0.06, 0.5, 0.35 * f, 0.2, [1.4, 0.8, 0.3], TL.flame); E.bx(0.04, 0.18, 0.08, 0.26, 0.5 * f, 0.12, [1.5, 1.05, 0.45], TL.flame, 0.6); E.fl = 0; }
  },
  // comptoir de boutique : soubassement, panneaux moulurés, dessus débordant
  comptoir(E) {
    const B = M19P.sombre;
    E.bx(0, 0, 0, 2.36, 0.1, 0.66, v3.scale(B, 0.8), TL.darkwood);
    E.bx(0, 0.1, 0, 2.3, 0.86, 0.62, B, TL.darkwood);
    for (let i = 0; i < 4; i++) { const x = -0.84 + i * 0.56; E.bx(x, 0.2, 0.31, 0.46, 0.62, 0.025, v3.scale(M19P.bois, 0.9), TL.wood); E.bx(x, 0.2, 0.322, 0.36, 0.52, 0.012, v3.scale(B, 1.1), TL.darkwood); }
    E.bx(0, 0.96, 0, 2.5, 0.06, 0.8, M19P.bois, TL.wood); E.bx(0, 0.92, 0.37, 2.46, 0.04, 0.06, B, TL.darkwood);
  },
  // tonneau : ventru, cerclé de fer, fermé
  tonneau(E) { m19Tonneau(E, 0.9, 0.29, [0.86, 0.72, 0.58]); },
  tonneau_vieux(E) { m19Tonneau(E, 0.85, 0.275, [0.66, 0.6, 0.52]); E.box(0.18, 0.62, 0.16, 0.2, 0.04, 0.02, [0.18, 0.14, 0.1], TL.plain, 0.6); },
  // tonneau de pluie : ouvert, l'eau à ras bord, la descente de zinc et son coude
  tonneau_pluie(E) {
    const Z = [0.55, 0.57, 0.6];
    m19Tonneau(E, 0.95, 0.31, [0.8, 0.68, 0.56], false);
    for (const a of [0, Math.PI / 4]) E.bx(0, 0.946, 0, 0.4, 0.012, 0.4, rgbf('#3a5a6a'), mt(M_WATERB), a);
    E.bx(-0.37, 1.12, 0, 0.075, 1.75, 0.075, Z, TL.metal);
    E.box(-0.3, 1.06, 0, 0.075, 0.2, 0.075, Z, TL.metal, 0, 0, 0.9);
    E.box(-0.2, 1.0, 0, 0.12, 0.07, 0.07, Z, TL.metal);
    for (const y of [1.5, 2.3]) E.bx(-0.37, y, 0, 0.1, 0.03, 0.1, M19P.fer, TL.iron);
  },
  // vieux coffre (ruines, chapelles, cryptes) : bois gris, bandes de fer rouillé, couvercle bombé ; ouvert et vide, on
  // voit le fond noir
  coffre_vieux(E, o) {
    const vide = o.data && o.data.vide, C = [0.75, 0.7, 0.62], R = [0.46, 0.32, 0.24];
    E.bx(0, 0, 0, 0.8, 0.42, 0.5, C, tx(TL.darkwood, TL.chest));
    for (const s of [-0.27, 0.27]) E.bx(s, 0, 0, 0.05, 0.43, 0.52, R, TL.iron);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) E.bx(sx * 0.39, 0, sz * 0.24, 0.04, 0.1, 0.04, R, TL.iron);
    if (vide) {
      E.bx(0, 0.42, 0, 0.7, 0.006, 0.4, [0.08, 0.06, 0.05], TL.plain);
      // (le couvercle tourne autour de la charnière, en haut à l'arrière du coffre : y 0,42, z −0,25)
      E.box(0, 0.672, -0.222, 0.84, 0.08, 0.52, C, TL.darkwood, 0, -1.3);
      for (const s of [-0.27, 0.27]) E.box(s, 0.672, -0.222, 0.05, 0.088, 0.53, R, TL.iron, 0, -1.3);
    } else {
      E.bx(0, 0.42, 0, 0.84, 0.08, 0.54, C, TL.darkwood); E.bx(0, 0.5, 0, 0.8, 0.06, 0.4, C, m19F(TL.darkwood, TF.bonnet));
      for (const s of [-0.27, 0.27]) E.bx(s, 0.42, 0, 0.05, 0.15, 0.56, R, TL.iron);
      E.bx(0, 0.26, 0.255, 0.09, 0.12, 0.02, R, TL.iron);
    }
  },
  // sacs de grain : trois sacs debout, tassés, noués, un quatrième couché devant
  sacs(E) {
    const C = rgbf('#c8b088'), L = rgbf('#8a6a3a');
    for (const [x, z, r, k] of [[-0.3, 0, 0.2, 1], [0.25, 0.08, -0.3, 0.94], [0, -0.3, 0.9, 1.06]]) {
      E.bx(x, 0, z, 0.5 * k, 0.34 * k, 0.36 * k, C, m19F(TL.cloth, TF.calotteH), r);
      E.bx(x, 0.34 * k, z, 0.465 * k, 0.16 * k, 0.335 * k, C, m19F(TL.cloth, TF.bonnet), r);
      E.bx(x, 0.49 * k, z, 0.13 * k, 0.05 * k, 0.1 * k, L, TL.rope, r);
      E.bx(x, 0.53 * k, z, 0.17 * k, 0.08 * k, 0.12 * k, v3.scale(C, 0.95), m19F(TL.cloth, TF.pTronc), r);
    }
    E.box(0.1, 0.36, 0.3, 0.45, 0.3, 0.6, rgbf('#b8a078'), m19F(TL.cloth, TF.qCorps), 0.3, 0, 1.35);
  },
  // tombe fraîche : la croix de bois et son écriteau, le tertre de terre remuée, une couronne de fleurs
  tombe_neuve(E) {
    const B = M19P.sombre;
    E.bx(0, -0.1, 0, 0.09, 1.22, 0.07, B, TL.darkwood); E.bx(0, 0.76, 0, 0.56, 0.08, 0.06, B, TL.darkwood);
    E.bx(0, 0.5, 0.04, 0.2, 0.11, 0.012, rgbf('#d8ccb0'), TL.paper);
    E.bx(0, 0, 0.6, 0.74, 0.16, 1.14, WHITE, mt(M_DIRT) - 512 * TF.bonnet);
    E.bx(0, 0.15, 0.6, 0.5, 0.07, 0.86, [0.92, 0.9, 0.88], mt(M_DIRT) - 512 * TF.bonnet);
    E.bx(0, 0.19, 0.2, 0.26, 0.05, 0.22, WHITE, m19F(TL.flowers, TF.qCorps), 0.4);
  },
  // caisse d'expédition : planches, battants en Z, couvercle soulevé ; du foin quand elle est pleine
  caisse_expedition(E, o) {
    const B = M19P.bois, S = M19P.sombre;
    E.bx(0, 0, 0, 1.3, 0.7, 0.85, B, mt(M_CRATE));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) E.bx(sx * 0.62, 0, sz * 0.4, 0.08, 0.72, 0.08, S, TL.darkwood);
    for (const s of [-1, 1]) E.box(0, 0.35, s * 0.43, 1.12, 0.07, 0.02, S, TL.darkwood, 0, 0, s * 0.45);
    E.box(0, 0.86, -0.38, 1.34, 0.06, 0.9, B, TL.wood, 0, -0.55);
    E.box(0, 0.86, -0.38, 0.1, 0.07, 0.9, S, TL.darkwood, 0, -0.55);
    if (o.data && o.data.full) E.bx(0, 0.66, 0.1, 1.1, 0.12, 0.5, rgbf('#c89a50'), TL.hay);
  },
  // coffre : bandes de fer, coins, serrure, couvercle bombé, petits pieds
  coffre(E) {
    const S = M19P.sombre;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) E.bx(sx * 0.4, 0, sz * 0.24, 0.08, 0.05, 0.08, S, TL.darkwood);
    E.bx(0, 0.05, 0, 0.9, 0.45, 0.56, WHITE, tx(TL.wood, TL.chest));
    E.bx(0, 0.5, 0, 0.92, 0.1, 0.58, M19P.bois, TL.wood); E.bx(0, 0.6, 0, 0.88, 0.06, 0.44, M19P.bois, TL.wood);
    for (const s of [-0.3, 0.3]) { E.bx(s, 0.05, 0, 0.05, 0.62, 0.6, M19P.fer, TL.iron); }
    E.bx(0, 0.28, 0.285, 0.1, 0.16, 0.02, rgbf('#d0b040'), TL.gold);
  },
  // mangeoire : une auge évasée sur quatre pieds, ses joues, du foin en tas
  mangeoire(E, o) {
    const B = M19P.bois, S = M19P.sombre, plein = !o.data || o.data.fill !== 0;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) E.bx(sx * 0.65, 0, sz * 0.18, 0.07, 0.36, 0.07, S, TL.darkwood);
    E.bx(0, 0.1, 0, 1.4, 0.06, 0.46, B, TL.wood);
    for (const s of [-1, 1]) E.box(0, 0.26, s * 0.21, 1.4, 0.26, 0.04, B, TL.wood, 0, s * 0.18);
    for (const s of [-1, 1]) E.bx(s * 0.68, 0.12, 0, 0.04, 0.28, 0.42, B, TL.wood);
    if (plein) { E.bx(0, 0.16, 0, 1.3, 0.18, 0.36, WHITE, m19F(TL.hay, TF.qCorps)); E.box(0.2, 0.32, 0.02, 0.5, 0.08, 0.3, WHITE, TL.hay, 0.4, 0.2); }
  },
  // abreuvoir : une auge de pierre (fond, bords), l'eau, la margelle en quatre pierres plates qui débordent
  abreuvoir(E) {
    const S = mt(M_STONE), C = [0.9, 0.88, 0.84], C2 = [0.97, 0.95, 0.91];
    E.bx(0, 0, 0, 1.5, 0.12, 0.5, C, S);
    for (const s of [-1, 1]) { E.bx(0, 0.12, s * 0.21, 1.5, 0.28, 0.08, C, S); E.bx(s * 0.71, 0.12, 0, 0.08, 0.28, 0.34, C, S); }
    for (const s of [-1, 1]) { E.bx(0, 0.4, s * 0.22, 1.58, 0.05, 0.13, C2, S); E.bx(s * 0.725, 0.4, 0, 0.13, 0.05, 0.31, C2, S); }
    E.bx(0, 0.12, 0, 1.36, 0.22, 0.34, rgbf('#3a5a6a'), mt(M_WATERB));
  },
  // brouette : caisse évasée, une roue à rayons, deux bras, deux pieds
  brouette(E) {
    const B = M19P.bois, S = M19P.sombre;
    E.bx(0, 0.36, -0.05, 0.54, 0.04, 0.72, B, TL.wood);
    for (const s of [-1, 1]) E.box(s * 0.3, 0.52, -0.05, 0.04, 0.3, 0.76, B, TL.wood, 0, 0, s * 0.28);
    E.box(0, 0.52, 0.34, 0.6, 0.3, 0.04, B, TL.wood, 0, 0.35); E.box(0, 0.5, -0.43, 0.56, 0.26, 0.04, B, TL.wood);
    m19Roue(E, 0, 0.22, 0.52, 0.22, 0.06, 0, S, 2);
    E.box(0, 0.22, 0.52, 0.48, 0.035, 0.035, M19P.fer, TL.iron);
    for (const s of [-0.22, 0.22]) { E.box(s, 0.42, -0.25, 0.05, 0.05, 1.5, S, TL.darkwood, 0, 0.16); E.bx(s, 0, -0.38, 0.05, 0.36, 0.05, S, TL.darkwood); }
  },
  // meule de foin : le pied droit, l'épaule arrondie, le cône du sommet (section octogonale), coiffée d'un toupet
  meule(E) {
    for (const [y, h, s, shp, col] of [[0, 0.95, 2.2, 0, WHITE], [0.95, 0.5, 2.2, TF.bonnet, [0.95, 0.93, 0.88]], [1.45, 0.62, 1.5, TF.pPyramide, WHITE]]) {
      E.bx(0, y, 0, s, h, s, col, m19F(TL.hay, shp));
      E.bx(0, y, 0, s, h, s, col, m19F(TL.hay, shp), Math.PI / 4);
    }
    E.bx(0, 2.0, 0, 0.32, 0.26, 0.32, [0.78, 0.68, 0.5], m19F(TL.straw, TF.pPyramide), 0.3);
  },
  // barque : le fond plat, les bordés évasés, l'étrave qui se relève à la proue (+z), le tableau arrière,
  // les plats-bords, deux bancs, une paire d'avirons couchés dedans
  barque(E) {
    const B = rgbf('#8a6a4a'), S = M19P.sombre, I = [0.36, 0.3, 0.24], fl = 0.3;
    E.bx(0, 0, -0.2, 0.66, 0.06, 2.5, I, TL.darkwood);
    E.box(0, 0.05, 1.18, 0.36, 0.06, 0.5, I, TL.darkwood, 0, -0.28);
    for (const s of [-1, 1]) {
      E.box(s * 0.43, 0.22, -0.3, 0.05, 0.44, 2.3, B, TL.wood, 0, 0, -s * fl);
      E.box(s * 0.215, 0.29, 1.15, 0.05, 0.5, 0.82, B, TL.wood, s * -0.58, -0.22, -s * 0.12);
      E.box(s * 0.5, 0.43, -0.3, 0.08, 0.05, 2.32, S, TL.darkwood);
      E.box(s * 0.25, 0.52, 1.15, 0.06, 0.05, 0.8, S, TL.darkwood, s * -0.58, -0.22);
    }
    E.box(0, 0.36, 1.5, 0.09, 0.66, 0.09, S, TL.darkwood, 0, 0.3);
    E.box(0, 0.24, -1.46, 0.98, 0.42, 0.06, B, TL.wood, 0, -0.18);
    for (const z of [-0.85, 0.25]) E.bx(0, 0.28, z, 0.9, 0.04, 0.24, M19P.boisC, TL.wood);
    for (const s of [-1, 1]) { E.box(s * 0.24, 0.36, -0.3, 0.045, 0.04, 2.0, M19P.boisC, TL.wood, s * 0.06); E.box(s * 0.31, 0.36, -1.18, 0.13, 0.02, 0.42, M19P.boisC, TL.wood, s * 0.06); }
  },
  // pierre dressée : un menhir brut, plus étroit au sommet, penché, ses éclats au pied
  pierre_dressee(E, o) {
    const C = [0.86, 0.86, 0.82], v = hash2i(Math.round(o.x * 3), Math.round(o.z * 3), 7);
    E.bx(0, -0.3, 0, 0.8, 2.2, 0.5, C, mt(M_ROCK) - 512 * TF.pan, v * 0.3, 0.02);
    E.box(0.04, 2.35, 0.0, 0.62, 1.1, 0.4, C, mt(M_ROCK) - 512 * TF.pPyramide, v * 0.3 + 0.2, 0.05, 0.06);
    E.box(0, 1.0, 0.26, 0.5, 1.5, 0.02, [0.7, 0.78, 0.6], mt(M_MOSSY), v * 0.3, 0.02);
    E.box(0.45, 0.05, 0.2, 0.3, 0.16, 0.26, C, mt(M_ROCK), v * 2);
  },
  // tombe : stèle au sommet arrondi, socle, tertre bordé
  tombe(E) {
    const S = mt(M_STONE), C = [0.88, 0.86, 0.82];
    E.bx(0, 0, 0, 0.7, 0.14, 0.24, C, S);
    E.bx(0, 0.14, 0, 0.56, 0.72, 0.14, C, S);
    E.box(0, 0.86, 0, 0.4, 0.4, 0.14, C, S, 0, 0, Math.PI / 4);
    E.bx(0, 0.5, 0.072, 0.3, 0.04, 0.005, [0.3, 0.28, 0.26], TL.plain); E.bx(0, 0.6, 0.072, 0.04, 0.16, 0.005, [0.3, 0.28, 0.26], TL.plain);
    E.bx(0, 0, 0.62, 0.62, 0.1, 0.98, WHITE, mt(M_DIRT));
    for (const s of [-1, 1]) E.bx(s * 0.33, 0, 0.62, 0.06, 0.12, 1.0, [0.8, 0.78, 0.74], S);
    E.bx(0, 0, 1.13, 0.72, 0.12, 0.06, [0.8, 0.78, 0.74], S);
  },
  // sac de grain : tassé, plus large au pied, les épaules qui tombent, le col froncé et noué, les oreilles
  sac(E) {
    const C = rgbf('#c8b088');
    E.bx(0, 0, 0, 0.5, 0.34, 0.36, C, m19F(TL.cloth, TF.calotteH));
    E.bx(0, 0.34, 0, 0.465, 0.16, 0.335, C, m19F(TL.cloth, TF.bonnet), 0, 0, 0.04);
    E.bx(0.005, 0.49, 0, 0.13, 0.05, 0.1, rgbf('#8a6a3a'), TL.rope);
    E.bx(0.01, 0.53, 0, 0.17, 0.08, 0.12, v3.scale(C, 0.95), m19F(TL.cloth, TF.pTronc));
  },
  // jarre : panse, épaule, col et lèvre
  jarre(E) {
    E.bx(0, 0, 0, 0.36, 0.28, 0.36, WHITE, m19F(TL.terracotta, TF.pTronc));
    E.bx(0, 0.28, 0, 0.4, 0.2, 0.4, WHITE, m19F(TL.terracotta, TF.bonnet));
    E.bx(0, 0.48, 0, 0.18, 0.08, 0.18, WHITE, TL.terracotta);
    E.bx(0, 0.56, 0, 0.24, 0.04, 0.24, v3.scale(WHITE, 0.9), TL.terracotta);
  },
  // réverbère : socle, fût cannelé, bague, la lanterne vitrée à quatre montants, son chapeau, l'épi
  lampadaire(E, o, t) {
    const F = PC.iron, lit = t && t.night;
    E.bx(0, 0, 0, 0.34, 0.12, 0.34, F, TL.iron); E.bx(0, 0.12, 0, 0.24, 0.3, 0.24, F, m19F(TL.iron, TF.bonnet));
    E.bx(0, 0.42, 0, 0.11, 2.2, 0.11, F, TL.iron); E.bx(0, 0.42, 0, 0.13, 2.2, 0.13, F, TL.iron, Math.PI / 4);
    E.bx(0, 2.62, 0, 0.2, 0.08, 0.2, F, TL.iron);
    for (const s of [-1, 1]) E.box(s * 0.12, 2.72, 0, 0.26, 0.03, 0.03, F, TL.iron, 0, 0, s * 0.5);
    E.bx(0, 2.68, 0, 0.26, 0.04, 0.26, F, TL.iron);
    E.fl = lit ? FX_EMIT : 0; E.bx(0, 2.72, 0, 0.22, 0.34, 0.22, lit ? [1.2, 1, 0.7] : [0.5, 0.45, 0.4], TL.glass); E.fl = 0;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) E.bx(sx * 0.12, 2.7, sz * 0.12, 0.025, 0.38, 0.025, F, TL.iron);
    E.bx(0, 3.06, 0, 0.36, 0.16, 0.36, F, m19F(TL.iron, TF.pPyramide));
    E.bx(0, 3.22, 0, 0.05, 0.12, 0.05, F, TL.iron); E.box(0, 3.36, 0, 0.07, 0.07, 0.07, F, TL.iron, Math.PI / 4, Math.PI / 4);
  },
  // pot de fleurs : la terre cuite plus étroite au pied, le bourrelet, une touffe fleurie
  pot_fleurs(E) {
    E.bx(0, 0, 0, 0.38, 0.32, 0.38, WHITE, m19F(TL.terracotta, TF.pTronc));
    E.bx(0, 0.3, 0, 0.44, 0.06, 0.44, v3.scale(WHITE, 0.92), TL.terracotta);
    E.bx(0, 0.34, 0, 0.36, 0.14, 0.36, WHITE, m19F(TL.flowers, TF.qCorps));
    E.bx(0.03, 0.44, -0.02, 0.24, 0.1, 0.24, [1.05, 1.05, 1.05], m19F(TL.flowers, TF.pPyramide), 0.6);
  },
  // panneau : poteau, planche peinte et sa bordure, un petit toit
  panneau(E) {
    E.bx(0, 0, 0, 0.1, 1.62, 0.1, M19P.sombre, TL.darkwood);
    E.bx(0, 1.12, 0.06, 0.96, 0.44, 0.04, M19P.sombre, TL.darkwood);
    E.bx(0, 1.15, 0.075, 0.88, 0.38, 0.03, WHITE, TL.sign);
    E.box(0, 1.62, 0.04, 1.06, 0.05, 0.2, M19P.sombre, TL.darkwood, 0, 0.2);
  },
  // mur de pierres sèches : assises irrégulières, couvertine de pierres posées de chant
  cloture_pierre(E, o) {
    const v = hash2i(Math.round(o.x * 2), Math.round(o.z * 2), 9);
    E.bx(0, -0.1, 0, 2.0, 0.72, 0.38, WHITE, mt(M_MOSSY));
    E.bx(0, 0.62, 0, 2.02, 0.07, 0.42, [0.92, 0.9, 0.86], mt(M_STONE));
    // la couvertine : des pierres posées de chant, serrées, un peu de travers
    for (let i = 0; i < 8; i++) E.box(-0.875 + i * 0.25, 0.77, 0, 0.21, 0.16 + ((i + Math.floor(v * 5)) % 3) * 0.025, 0.34, [0.84, 0.82, 0.78], mt(M_STONE), 0, 0, (i % 2 ? 0.1 : -0.1));
  },
  // haie : deux touffes de feuillage décalées sur un pied plus sombre, un dessus irrégulier
  haie(E, o) {
    const v = hash2i(Math.round(o.x * 2), Math.round(o.z * 2), 11);
    E.bx(0, 0, 0, 1.9, 0.5, 0.6, [0.74, 0.82, 0.74], TL.leaves);
    E.bx(-0.48, 0.32, 0.03, 1.08, 0.74, 0.74, WHITE, m19F(TL.leaves, TF.qCorps), 0.06);
    E.bx(0.5, 0.36, -0.03, 1.04, 0.7, 0.7, [0.94, 1.0, 0.94], m19F(TL.leaves, TF.qCorps), -0.08);
    for (let i = 0; i < 3; i++) E.bx(-0.62 + i * 0.62, 1.0, (i % 2 ? 0.05 : -0.05), 0.72, 0.18 + ((i + Math.floor(v * 3)) % 2) * 0.1, 0.56, [0.94, 1.04, 0.94], m19F(TL.leaves, TF.pPyramide), i * 0.4);
  },
  // jeune arbre : la tige qui s'affine, son tuteur et le lien, deux rameaux, des touffes de feuilles
  sapling(E) {
    const b = [0.85, 0.76, 0.64];
    E.bx(0, 0, 0, 0.07, 1.05, 0.07, b, m19F(TL.bark, TF.col));
    E.bx(0.075, 0, 0, 0.035, 1.15, 0.035, M19P.bois, TL.wood); E.bx(0.04, 0.9, 0, 0.11, 0.035, 0.06, rgbf('#8a6a3a'), TL.rope);
    E.box(0.1, 0.8, 0.02, 0.03, 0.3, 0.03, b, TL.bark, 0, 0, -0.75); E.box(-0.09, 0.68, -0.03, 0.03, 0.26, 0.03, b, TL.bark, 0, 0, 0.8);
    E.bx(0, 0.78, 0, 0.44, 0.38, 0.44, WHITE, m19F(TL.leaves, TF.qCorps), 0.3);
    E.bx(0.2, 0.8, 0.05, 0.26, 0.24, 0.26, [0.92, 1.0, 0.92], TL.leaves, 0.9); E.bx(-0.19, 0.66, -0.06, 0.24, 0.22, 0.24, [0.96, 1.03, 0.96], TL.leaves, 1.4);
    E.bx(0, 1.12, 0, 0.3, 0.24, 0.3, WHITE, m19F(TL.leaves, TF.pPyramide), 0.7);
  },
  // ailes du moulin : l'arbre, la croisée, les vergues, le treillis et la toile de chaque aile
  // (dessinées à chaque image : rien n'y est alloué)
  moulin_ailes(E, o, t) {
    const a = (t ? t.t * 0.4 : 0) * ((o.data && o.data.stop) ? 0 : 1) + (o.data && o.data.phase || 0), S = M19P.sombre, toile = M19P.toile;
    E.box(0, 0, -0.25, 0.5, 0.5, 0.9, S, TL.darkwood, 0, 0, 0); E.box(0, 0, -0.25, 0.5, 0.5, 0.9, S, TL.darkwood, 0, 0, Math.PI / 4);
    E.box(0, 0, 0.25, 0.3, 0.3, 0.14, M19P.fer, TL.iron);
    for (let k = 0; k < 4; k++) {
      const b = a + k * Math.PI / 2, sb = Math.sin(b), cb = Math.cos(b);
      E.box(sb * 4.2, cb * 4.2, 0.08, 0.26, 8.4, 0.16, S, TL.darkwood, 0, 0, -b);
      E.box(sb * 4.7 + cb * 0.55, cb * 4.7 - sb * 0.55, 0.12, 0.05, 6.2, 0.05, S, TL.darkwood, 0, 0, -b);
      E.box(sb * 4.7 + cb * 1.05, cb * 4.7 - sb * 1.05, 0.12, 0.06, 6.2, 0.06, S, TL.darkwood, 0, 0, -b);
      for (let j = 0; j < 7; j++) { const r = 1.9 + j * 0.92; E.box(sb * r + cb * 0.55, cb * r - sb * 0.55, 0.13, 1.1, 0.05, 0.04, S, TL.darkwood, 0, 0, -b); }
      E.box(sb * 4.75 + cb * 0.58, cb * 4.75 - sb * 0.58, 0.15, 0.96, 6.0, 0.02, toile, TL.cloth, 0, 0, -b);
    }
  },
});
// les nouveaux modèles, chacun avec son lointain : au-delà de M19LOD.D.objets, le modèle d'avant (aussi léger qu'avant)
for (const id of Object.keys(M19_OBJETS)) {
  const neuf = M19_OBJETS[id], anc = M19_OBJETS_ANC[id];
  PROP_MODELS[id] = anc ? function (E, o, t) { return (M19LOD.loin(E, o, M19LOD.D.objets) ? anc : neuf).call(this, E, o, t); } : neuf;
}
// un tonneau couché sur une étagère (étagère « tonneaux » : un petit fût)
function m19SubTonneau(E, x, y, z, h) { E.box(x, y + h / 2, z + 0.02, h * 0.62, h * 0.72, h * 0.62, WHITE, TL.barrel, 0, Math.PI / 2); E.box(x, y + h / 2, z + 0.02, h * 0.62, h * 0.72, h * 0.62, WHITE, TL.barrel, 0, Math.PI / 2, Math.PI / 4); }
