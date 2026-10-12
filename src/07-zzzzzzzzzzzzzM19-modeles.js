// ============================================================================
//  LES MODÈLES REFAITS (vague M19) : ce qui était fait trop vite, repris en boîtes
//  - les QUADRUPÈDES : le gabarit (quadRig) a un tronc plus étroit au ventre, des
//    pattes en deux segments (cuisse / canon, le jarret en arrière), des sabots
//    évasés ou des pattes larges, une queue en deux segments, des oreilles et un
//    museau effilés ; la pose (poseQuad, emballée) plie les genoux à la marche,
//    berce le corps, fait hocher la tête des grands, chasser les mouches à la queue,
//    replie les pattes sous le corps quand la bête est couchée. Mêmes noms de pièces
//    et mêmes pivots qu'avant (legFL…, neck, head, snout, earL/R, tail, saddle…) :
//    les pièces nouvelles portent des noms nouveaux (legFLb : le canon, legFLh : le
//    sabot ou la patte, tailb, …) ;
//  - les BÊTES DE LA FERME redessinées une à une (vache, cheval, âne, mouton,
//    cochon, chèvre, chien, chat, lapin, poule, oie, canard) et les bêtes sauvages
//    les plus vues (cerf, chevreuil, sanglier, renard, loup, ours, écureuil) ;
//  - les OISEAUX communs (corneille, passereaux, pigeon, canard) : des corps
//    d'oiseau (ailes repliées au repos, déployées en vol : e1Oiseau) ;
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
// - les bêtes (dessinées à chaque image) : au-delà de D.betes, seules les grandes pièces (tronc, tête, pattes,
//   queue…) sont calculées et émises (M19B, 11-zzzzzzzzzzM19-maisons.js) ; hors du champ de la vue, elles ne
//   sont plus ni posées ni dessinées (M19Vue, même fichier) ;
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
  // « au loin » ne s'approche pas à moins de D − pas (27 m en qualité moyenne, 13 m en basse)
  pas() { return clamp(0.4 * Math.min(this.D.objets, this.D.cultures) * this.k(), 8, 30); },
};

// ---------------------------------------------------------------- quadrupèdes : le gabarit refait
// options d'avant (col, col2, dark, body, bodyY, bodyTex, leg [l, h], legD, legIn, legCol, legTex, hoof, neck, neckS, neckO, headP,
// head, headCol, headTex, face, snout [l, h, L, y], snoutCol, snoutTex, ears, earCol, horns, tail, tailCol) et en plus :
//   simpleLegs (une seule boîte par patte), paw (couleur des pattes larges), earPoint (oreilles pointues), earTilt,
//   earDroop (oreilles tombantes), snoutTip ([couleur, tuile] : le bout du museau), tuft (couleur du toupet de la queue),
//   tailK (part de la queue dans le premier segment), tailLift (la queue relevée : un angle de plus vers l'arrière et le
//   haut), eyes (couleur des yeux posés sur les côtés de la tête), bodyShp
const _m19QuadRig0 = quadRig;
quadRig = function (o) {
  const { P, add } = rigParts();
  const A = (name, parent, p, s, off, col, tex, shp, extra) => { const q = add(name, parent, p, s, off, col, tex, extra); if (shp) q.shp = shp; return q; };
  const c = o.col, c2 = o.col2 || c, dark = o.dark || v3.scale(c, 0.35);
  const [bw, bh, bl] = o.body;
  const bodyTex = o.bodyTex ?? TL.fur;
  A('body', null, [0, o.bodyY, 0], o.body.slice(), [0, 0, 0], c, bodyTex, o.bodyShp === undefined ? TF.qCorps : o.bodyShp);
  // pattes : deux segments (le canon, plus fin, pivote au genou ou au jarret), le sabot évasé ou la patte posée à plat
  const [lw, lh] = o.leg, ldp = lw * (o.legD || 1), lx = bw / 2 - lw / 2 - 0.01, lz = bl / 2 - lw / 2 - (o.legIn || 0.06), ly = -bh / 2 + 0.06;
  const two = lh >= 0.16 && !o.simpleLegs, legCol = o.legCol || c2, legTex = o.legTex ?? o.bodyTex ?? TL.fur;
  const hock = two ? (o.hock ?? (o.hoof ? 0.17 : 0.13)) : 0;
  for (const [n, sx, sz] of [['legFL', -1, 1], ['legFR', 1, 1], ['legBL', -1, -1], ['legBR', 1, -1]]) {
    const back = sz < 0;
    if (!two) {
      A(n, 'body', [sx * lx, ly, sz * lz], [lw, lh, ldp], [0, -lh / 2, 0], legCol, legTex, lh > 0.08 ? TF.meche : 0);
      if (o.hoof) A(n + 'h', n, [0, -lh + 0.03, 0.01], [lw + 0.01, 0.07, ldp + 0.02], [0, 0, 0], dark, TL.leather, TF.qSabot);
      continue;
    }
    // (le jarret : la cuisse penche en arrière, le canon revient ; la hauteur totale ne change pas)
    const L1 = lh * (back ? 0.53 : 0.5) / (back ? Math.cos(hock) : 1), L2 = lh - lh * (back ? 0.53 : 0.5);
    const up = A(n, 'body', [sx * lx, ly, sz * lz], [lw * (back ? 1.22 : 1.12), L1 + 0.04, ldp * (back ? 1.34 : 1.14)], [0, -L1 / 2 + 0.02, back ? -0.01 : 0.005], legCol, legTex, TF.meche);
    const lo = A(n + 'b', n, [0, -L1, 0], [lw * 0.78, L2 + 0.03, ldp * 0.8], [0, -L2 / 2 + 0.012, 0], legCol, legTex, TF.bras);
    if (back) { up.r0 = [hock, 0, 0]; lo.r0 = [-hock, 0, 0]; }
    if (o.hoof) A(n + 'h', n + 'b', [0, -L2 + 0.034, 0.012], [lw * 0.98, 0.074, ldp + 0.03], [0, 0, 0], dark, TL.leather, TF.qSabot);
    else if (o.paw !== false) A(n + 'h', n + 'b', [0, -L2 + 0.02, 0.022], [lw * 0.98, 0.045, ldp * 1.5], [0, 0, 0], o.paw || legCol, legTex, 0);
  }
  A('neck', 'body', [0, o.neck[1], bl / 2 - 0.05], o.neckS || null, o.neckO || [0, 0, 0], c, bodyTex, o.neckS ? TF.pan : 0);
  A('head', 'neck', o.headP || [0, 0, 0.02], o.head, [0, 0, o.head[2] / 2], o.headCol || c, tx(o.headTex ?? TL.fur, o.face), o.headShp || 0);
  // museau : une boîte couchée vers l'avant (rx = π/2), plus étroite au bout ; le bout (truffe, mufle) à part
  if (o.snout) {
    const [sw, sh, sl] = o.snout, sy = o.snout[3] || -o.head[1] * 0.18, sc = o.snoutCol || c, shp = o.snoutShp ?? TF.bonnet, k = TR_FORMES.list[shp] || [0, 0];
    A('snout', 'head', [0, sy, o.head[2] - 0.01], [sw, sl + 0.01, sh], [0, sl / 2, 0], sc, o.snoutTex ?? TL.skin, shp, { r0: [Math.PI / 2, 0, 0] });
    // le bout (truffe, mufle, groin) : une plaque tournée vers l'avant, à la taille du bout du museau
    if (o.snoutTip) A('snoutT', 'snout', [0, sl + 0.012, 0], [sw * (1 + Math.min(0, k[0])) + 0.006, sh * (1 + Math.min(0, k[1])) + 0.006, 0.024], [0, 0, 0], o.snoutTip[0], tx(TL.plain, o.snoutTip[1] ?? TL.plain), 0, { r0: [-Math.PI / 2, 0, 0] });
  }
  if (o.ears) for (const s of [-1, 1]) {
    const e = o.ears, tilt = o.earTilt ?? (o.earDroop ? 1.25 : 0.32);
    A(s < 0 ? 'earL' : 'earR', 'head', [s * (o.head[0] / 2 - 0.01), o.head[1] / 2 - 0.02, o.head[2] * (o.earZ ?? 0.25)], e.slice(), [0, e[1] / 2, 0], o.earCol || c, TL.fur, o.earPoint ? TF.qOreille : TF.bonnet, { r0: [o.earDroop ? 0.5 : (o.earBack ?? -0.12), 0, -s * tilt] });
  }
  if (o.horns) for (const s of [-1, 1]) A(s < 0 ? 'hornL' : 'hornR', 'head', [s * (o.head[0] / 2), o.head[1] / 2 - 0.03, o.head[2] * 0.3], [0.14, 0.05, 0.05], [s * 0.07, 0.03, 0], rgbf('#e0d6b8'), TL.bone);
  // les yeux : sur les côtés de la tête (ou devant, pour le chat et les bêtes qui regardent en face : eyeFront)
  if (o.eyes) for (const s of [-1, 1]) {
    const es = o.eyeS || 0.04, n = s < 0 ? 'oeilL' : 'oeilR';
    if (o.eyeFront) A(n, 'head', [s * o.head[0] * (o.eyeX ?? 0.25), o.head[1] * (o.eyeY ?? 0.16), o.head[2] + 0.003], [es, es * 0.9, 0.008], [0, 0, 0], o.eyes, TL.m19Oeil);
    else A(n, 'head', [s * (o.head[0] / 2 * (o.eyeX ?? 1) + 0.003), o.head[1] * (o.eyeY ?? 0.16), o.head[2] * (o.eyeZ ?? 0.62)], [0.008, es, es], [0, 0, 0], o.eyes, TL.m19Oeil);
  }
  // queue en deux segments, plus fine au bout (pendante : coupée en hauteur ; couchée vers l'arrière : en longueur) ;
  // un toupet de crins au bout (vache, âne, lion…)
  if (o.tail) {
    const tl = o.tail, k = o.tailK ?? 0.55, tc = o.tailCol || c, flat = tl[2] > tl[1] * 1.2;
    if (!flat) {
      const L1 = tl[1] * k, L2 = tl[1] - L1;
      A('tail', 'body', [0, bh / 2 - 0.08, -bl / 2], [tl[0], L1 + 0.01, tl[2]], [0, -L1 / 2, -tl[2] / 2], tc, o.tailTex ?? TL.fur, 0);
      A('tailb', 'tail', [0, -L1, -tl[2] / 2], [tl[0] * 0.82, L2, tl[2] * 0.82], [0, -L2 / 2, 0], tc, o.tailTex ?? TL.fur, TF.membrePale);
      if (o.tuft) { const kt = o.tuftK ?? 1.8; A('tailc', 'tailb', [0, -L2 + 0.02, 0], [tl[0] * kt, Math.min(0.24, L2 * 0.65), tl[2] * kt], [0, -0.05, 0], o.tuft, kt > 1.2 ? TL.m19Crin : TL.fur, TF.membrePale); }
    } else {
      const L1 = tl[2] * k, L2 = tl[2] - L1;
      A('tail', 'body', [0, bh / 2 - 0.08, -bl / 2], [tl[0], tl[1], L1 + 0.01], [0, -tl[1] / 2, -L1 / 2], tc, o.tailTex ?? TL.fur, 0);
      A('tailb', 'tail', [0, -tl[1] / 2, -L1], [tl[0] * 0.9, tl[1] * 0.9, L2], [0, 0, -L2 / 2], tc, o.tailTex ?? TL.fur, 0);
      if (o.tuft) A('tailc', 'tailb', [0, 0, -L2 + 0.04], [tl[0] * 0.75, tl[1] * 0.75, 0.1], [0, 0, -0.03], o.tuft, o.tailTex ?? TL.fur, 0);
    }
  }
  const rig = new Rig(P);
  rig.kind = 'quad'; rig.cfg = o;
  rig.q2 = { by: o.bodyY, bh, hock, big: bh >= 0.4, sway: !!o.swish, np: o.np || null, hp: o.hp || null, tl: o.tailLift || 0, bob: 0 };
  return rig;
};
// (les bêtes mises à l'échelle gardent leur balancement : la hauteur du corps suit)
{
  const _sr = scaleRig;
  scaleRig = function (r, k) { _sr(r, k); if (r.q2) { r.q2.by *= k; r.q2.bh *= k; } return r; };
}

// ---------------------------------------------------------------- la pose : genoux, jarrets, corps qui berce, tête, queue
// (appelée à chaque image pour chaque bête : rien n'y est alloué)
{
  const _pq = poseQuad;
  const HAUT = ['legFL', 'legFR', 'legBL', 'legBR'], BAS = ['legFLb', 'legFRb', 'legBLb', 'legBRb'], PIED = ['legFLh', 'legFRh', 'legBLh', 'legBRh'];
  poseQuad = function (rig, st) {
    _pq(rig, st);
    const Q = rig.q2;
    if (!Q) return;
    const P = rig.parts, I = rig.idx, mv = st.move || 0, ph = st.phase || 0, run = !!st.run, t = st.t || 0, sd = st.seed || 0;
    const B = P[I.body];
    if (st.lie) {
      // couchée : les canons repliés sous le corps
      for (let j = 0; j < 4; j++) { const i = I[BAS[j]]; if (i !== undefined) { const r = P[i].r; r[0] = j < 2 ? 2.35 : -2.35; r[1] = 0; r[2] = 0; } }
      if (B && Math.abs(B.p[1] - (Q.by + (Q.bob || 0))) < 1e-6) { B.p[1] = Q.by; Q.bob = 0; }
      return;
    }
    // les canons plient pendant que la patte revient en avant (le pied se lève) ; au trot comme au galop
    // (avant gauche et arrière droite ensemble, les deux autres décalées de off)
    const off = run ? 0.9 : Math.PI, K = (run ? 1.3 : 0.9) * mv;
    for (let j = 0; j < 4; j++) {
      const f = Math.max(0, -Math.cos(ph + (j === 0 || j === 3 ? 0 : off))) * K, back = j >= 2;
      const iu = I[HAUT[j]], il = I[BAS[j]], ih = I[PIED[j]];
      if (iu !== undefined && back && Q.hock) P[iu].r[0] += Q.hock;
      if (il !== undefined) { const lo = P[il].r; lo[0] = (back ? -Q.hock : 0) + f * (back ? 0.85 : 1.15); lo[1] = 0; lo[2] = 0; }
      if (ih !== undefined) { const ho = P[ih].r; ho[0] = -f * 0.45; ho[1] = 0; ho[2] = 0; }
    }
    // le corps berce (deux fois par foulée), les grands hochent la tête en marchant
    if (B) {
      const bob = mv > 0.01 ? (Math.abs(Math.cos(ph)) - 0.6) * Q.bh * (run ? 0.11 : 0.05) * mv : 0;
      if (Math.abs(B.p[1] - (Q.by + (Q.bob || 0))) < 1e-6) { B.p[1] = Q.by + bob; Q.bob = bob; }
    }
    // l'encolure et la tête : au repos, en broutant (graze), le regard (lookP) ; les grands hochent la tête en marchant
    const iN = I.neck, iH = I.head, nk = iN === undefined ? null : P[iN].r, hd = iH === undefined ? null : P[iH].r, g = st.graze || 0;
    if (nk && Q.np) nk[0] = Q.np[0] + g * Q.np[1] + (st.lookP || 0);
    if (hd && Q.hp) hd[0] = Q.hp[0] + g * Q.hp[1];
    if (nk && Q.big && mv > 0.01) nk[0] += Math.sin(ph * 2) * (run ? 0.07 : 0.05) * mv;
    // la queue : balance à la marche ; au repos, les vaches et les chevaux chassent les mouches
    const iT = I.tail, iTb = I.tailb, tq = iT === undefined ? null : P[iT].r, tb = iTb === undefined ? null : P[iTb].r;
    if (tq) {
      if (Q.tl) tq[0] += Q.tl;
      tq[1] += mv > 0.01 ? Math.sin(ph) * 0.14 * mv : (Q.sway ? Math.sin(t * 1.9 + sd) * 0.3 * Math.max(0, Math.sin(t * 0.37 + sd * 2)) : 0);
      if (tb) { tb[0] = 0.08 + (run ? 0.25 * mv : 0) + Math.sin(t * 1.3 + sd) * 0.04; tb[1] = tq[1] * 0.6; tb[2] = 0; }
    }
    // les oreilles : un battement de temps en temps (autour de leur pose de repos)
    const fl = Math.pow(Math.max(0, Math.sin(t * 0.8 + sd * 3)), 12) * 0.35, iL = I.earL, iR = I.earR;
    if (iL !== undefined && P[iL].r0) P[iL].r[2] = P[iL].r0[2] + fl;
    if (iR !== undefined && P[iR].r0) P[iR].r[2] = P[iR].r0[2] - fl;
  };
}

// ---------------------------------------------------------------- pièces en plus (une boîte posée sur une autre)
// M19X(nom, parent, pivot, taille, couleur, tuile, forme, rotation de repos, décalage)
const M19X = (name, parent, p, s, col, tex, shp, r0, o) => {
  const q = { name, parent, p, s, o: o || [0, 0, 0], col, tex: tex ?? TL.fur };
  if (shp) q.shp = shp;
  if (r0) q.r0 = r0;
  return q;
};
// les pièces qui suivent la selle (montrée ou cachée par le jeu : saddle, blanketS) ; celles qui suivent la taille du
// tronc (le chien qui maigrit, la dépouille qui sèche : le jeu rétrécit body.s)
function m19Suivre(rig, names) {
  const B = rig.part('body');
  rig.m19Suit = { s0: B.s.slice(), L: names.filter((n) => rig.has(n)).map((n) => [n, rig.part(n).s.slice()]) };
  return rig;
}
{
  const _pq = poseQuad;
  poseQuad = function (rig, st) {
    _pq(rig, st);
    const P = rig.parts, I = rig.idx;
    if (rig.m19Selle) for (const [n, of] of rig.m19Selle) { const q = P[I[n]], s = P[I[of]]; if (q && s) q.hide = !!s.hide; }
    const S = rig.m19Suit;
    if (S) {
      const B = P[I.body], kx = B.s[0] / S.s0[0], ky = B.s[1] / S.s0[1];
      for (const [n, s0] of S.L) { const q = P[I[n]]; q.s[0] = s0[0] * kx; q.s[1] = s0[1] * ky; }
    }
  };
}

// ---------------------------------------------------------------- les bêtes de la ferme
Object.assign(ANIMAL_RIGS, {
  // vache : robe pie (taches), hanches saillantes, garrot, ventre, fanon sous l'encolure, mufle rose et naseaux, cornes
  // en croissant, yeux sur les côtés, pis et trayons, queue fine et son toupet ; elle chasse les mouches
  cow: () => {
    const C = [1, 0.97, 0.93], rose = rgbf('#e6b2a6'), corne = rgbf('#e2d8bc'), bout = rgbf('#5e5244');
    const r = quadRig({ col: C, body: [0.72, 0.66, 1.46], bodyY: 1.05, bodyTex: TL.spots, leg: [0.15, 0.78], hoof: true, legTex: TL.spots, dark: rgbf('#2e2620'),
      neck: [0, 0.14], neckS: [0.34, 0.44, 0.52], neckO: [0, 0, 0.2], headP: [0, 0.0, 0.42], head: [0.32, 0.34, 0.37], face: TL.fur, headTex: TL.fur,
      snout: [0.28, 0.22, 0.2, -0.07], snoutCol: rose, snoutTex: TL.skin, snoutShp: TF.calotte, snoutTip: [rgbf('#d49a90'), TL.m19Mufle],
      ears: [0.05, 0.18, 0.1], earTilt: 1.38, earZ: 0.32, eyes: [1, 1, 1], eyeY: 0.2, eyeZ: 0.5, eyeS: 0.045,
      tail: [0.05, 0.84, 0.05], tailTex: TL.fur, tuft: rgbf('#3a2e26'), swish: true, np: [0.02, 1.05], hp: [0.62, 0.35] });
    return rigPlus(r, [
      M19X('garrot', 'body', [0, 0.335, 0.42], [0.44, 0.06, 0.36], C, TL.spots),
      M19X('hancheL', 'body', [-0.3, 0.33, -0.44], [0.12, 0.08, 0.13], C, TL.fur),
      M19X('hancheR', 'body', [0.3, 0.33, -0.44], [0.12, 0.08, 0.13], C, TL.fur),
      M19X('attache', 'body', [0, 0.33, -0.66], [0.15, 0.07, 0.18], C, TL.fur),
      M19X('ventre', 'body', [0, -0.35, -0.02], [0.6, 0.12, 0.86], C, TL.spots, TF.qCorps),
      M19X('fanon', 'neck', [0, -0.2, 0.14], [0.07, 0.18, 0.38], C, TL.fur, TF.membrePale),
      M19X('lunetteL', 'head', [-0.161, 0.068, 0.185], [0.006, 0.09, 0.1], rgbf('#7a4a30'), TL.fur),
      M19X('lunetteR', 'head', [0.161, 0.068, 0.185], [0.006, 0.09, 0.1], rgbf('#7a4a30'), TL.fur),
      M19X('chignon', 'head', [0, 0.17, 0.07], [0.26, 0.05, 0.13], C, TL.fur),
      M19X('hornL', 'head', [-0.13, 0.16, 0.09], [0.055, 0.16, 0.055], corne, TL.bone, TF.calotte, [0.1, 0, 1.2], [0, 0.075, 0]),
      M19X('hornLb', 'hornL', [0, 0.15, 0], [0.045, 0.15, 0.045], bout, TL.bone, TF.pointe, [0.35, 0, -1.1], [0, 0.07, 0]),
      M19X('hornR', 'head', [0.13, 0.16, 0.09], [0.055, 0.16, 0.055], corne, TL.bone, TF.calotte, [0.1, 0, -1.2], [0, 0.075, 0]),
      M19X('hornRb', 'hornR', [0, 0.15, 0], [0.045, 0.15, 0.045], bout, TL.bone, TF.pointe, [0.35, 0, 1.1], [0, 0.07, 0]),
      M19X('udder', 'body', [0, -0.39, -0.32], [0.26, 0.15, 0.3], rose, TL.skin, TF.qCorps),
      ...[[-0.07, -0.39], [0.07, -0.39], [-0.07, -0.25], [0.07, -0.25]].map(([x, z], i) => M19X('trayon' + i, 'body', [x, -0.49, z], [0.035, 0.07, 0.035], rose, TL.skin, TF.membrePale)),
    ]);
  },
  // cheval : poitrail, croupe ronde, encolure qui monte en avant (et descend jusqu'à l'herbe), tête longue et
  // ganaches, naseaux, oreilles pointues, crinière, toupet, queue de crins ; selle et tapis (cachés jusqu'à la selle)
  horse: (v) => {
    const cols = ['#6b4226', '#3a2a1e', '#a88a64', '#e8e0d0', '#2a2220'];
    const k = (v || 0) % cols.length, c = rgbf(cols[k]), crin = k === 3 ? rgbf('#c8c0b0') : k === 2 ? rgbf('#4a3626') : v3.scale(c, 0.42);
    const sabot = k === 3 ? rgbf('#5a5650') : [0.12, 0.1, 0.08];
    const r = quadRig({ col: c, body: [0.56, 0.64, 1.42], bodyY: 1.38, leg: [0.14, 1.12], hoof: true, dark: sabot,
      neck: [0, 0.2], neckS: [0.26, 0.9, 0.42], neckO: [0, 0.4, 0.02], headP: [0, 0.84, 0.02], head: [0.25, 0.28, 0.3], face: TL.fur,
      snout: [0.21, 0.22, 0.34, -0.03], snoutCol: c, snoutTex: TL.fur, snoutShp: TF.bonnet, snoutTip: [v3.scale(c, 0.55), TL.m19Mufle],
      ears: [0.05, 0.15, 0.06], earPoint: true, earTilt: 0.18, earZ: 0.18, eyes: [1, 1, 1], eyeY: 0.18, eyeZ: 0.62, eyeS: 0.045,
      tail: [0.12, 0.86, 0.12], tailCol: crin, tailTex: TL.m19Crin, tailK: 0.32, swish: true, np: [0.66, 1.98], hp: [0.3, -1.36] });
    const rr = rigPlus(r, [
      M19X('poitrail', 'body', [0, 0.0, 0.66], [0.5, 0.5, 0.2], c, TL.fur, TF.qCorps),
      M19X('croupe', 'body', [0, 0.31, -0.42], [0.54, 0.12, 0.52], c, TL.fur),
      M19X('fesses', 'body', [0, 0.06, -0.72], [0.5, 0.44, 0.1], c, TL.fur, TF.qCorps),
      M19X('ventre', 'body', [0, -0.33, 0.05], [0.48, 0.08, 0.8], c, TL.fur, TF.qCorps),
      M19X('ganacheL', 'head', [-0.09, -0.06, 0.1], [0.07, 0.17, 0.2], c, TL.fur),
      M19X('ganacheR', 'head', [0.09, -0.06, 0.1], [0.07, 0.17, 0.2], c, TL.fur),
      M19X('mane', 'neck', [0, 0.46, -0.2], [0.07, 0.9, 0.12], crin, TL.m19Crin, TF.pan),
      M19X('maneb', 'neck', [0, 0.86, -0.15], [0.08, 0.14, 0.14], crin, TL.m19Crin),
      M19X('toupet', 'head', [0, 0.15, 0.08], [0.09, 0.07, 0.14], crin, TL.m19Crin, 0, [0.5, 0, 0]),
      { name: 'saddle', parent: 'body', p: [0, 0.35, 0.08], s: [0.6, 0.08, 0.5], o: [0, 0, 0], col: rgbf('#5a3a24'), tex: TL.leather, hide: true },
      { name: 'blanketS', parent: 'body', p: [0, 0.3, 0.08], s: [0.62, 0.08, 0.66], o: [0, 0, 0], col: rgbf('#8a2a24'), tex: TL.cloth, hide: true },
      M19X('pommeau', 'saddle', [0, 0.06, 0.22], [0.2, 0.1, 0.08], rgbf('#4a2e1c'), TL.leather),
      M19X('troussequin', 'saddle', [0, 0.06, -0.22], [0.36, 0.12, 0.07], rgbf('#4a2e1c'), TL.leather),
      M19X('etriviereL', 'saddle', [-0.31, -0.22, 0.04], [0.025, 0.42, 0.05], rgbf('#3a2618'), TL.leather),
      M19X('etriviereR', 'saddle', [0.31, -0.22, 0.04], [0.025, 0.42, 0.05], rgbf('#3a2618'), TL.leather),
      M19X('etrierL', 'etriviereL', [0, -0.23, 0], [0.04, 0.06, 0.12], rgbf('#6a6a70'), TL.iron),
      M19X('etrierR', 'etriviereR', [0, -0.23, 0], [0.04, 0.06, 0.12], rgbf('#6a6a70'), TL.iron),
      M19X('sangle', 'saddle', [0, -0.3, 0.12], [0.6, 0.06, 0.08], rgbf('#3a2618'), TL.leather),
    ]);
    rr.m19Selle = [['pommeau', 'saddle'], ['troussequin', 'saddle'], ['etriviereL', 'saddle'], ['etriviereR', 'saddle'], ['etrierL', 'saddle'], ['etrierR', 'saddle'], ['sangle', 'saddle']];
    for (const [n] of rr.m19Selle) rr.part(n).hide = true;
    return rr;
  },
  // âne : gris, ventre et mufle clairs, grandes oreilles, croix sombre sur le garrot, crinière courte et droite
  donkey: () => {
    const c = rgbf('#7a7068'), clair = rgbf('#d8d0c4'), crin = rgbf('#3a3430');
    const r = quadRig({ col: c, body: [0.46, 0.5, 1.1], bodyY: 1.0, leg: [0.11, 0.81], hoof: true, dark: [0.12, 0.1, 0.08],
      neck: [0, 0.14], neckS: [0.22, 0.6, 0.34], neckO: [0, 0.26, 0.02], headP: [0, 0.56, 0.02], head: [0.25, 0.27, 0.28], face: TL.fur,
      snout: [0.2, 0.22, 0.26, -0.03], snoutCol: clair, snoutTex: TL.fur, snoutShp: TF.calotte, snoutTip: [rgbf('#4a4440'), TL.m19Mufle],
      ears: [0.06, 0.3, 0.07], earPoint: true, earTilt: 0.22, earZ: 0.18, earBack: -0.3, eyes: [1, 1, 1], eyeY: 0.16, eyeZ: 0.6, eyeS: 0.045,
      tail: [0.06, 0.62, 0.06], tailCol: c, tuft: crin, swish: true, np: [0.95, 1.55], hp: [0.4, -1.0] });
    const rr = rigPlus(r, [
      M19X('ventre', 'body', [0, -0.27, 0.02], [0.42, 0.06, 0.74], clair, TL.fur, TF.qCorps),
      M19X('croix', 'body', [0, 0.252, 0.3], [0.44, 0.006, 0.06], crin, TL.fur),
      M19X('raie', 'body', [0, 0.252, -0.05], [0.06, 0.006, 0.9], crin, TL.fur),
      M19X('mane', 'neck', [0, 0.32, -0.15], [0.05, 0.6, 0.08], crin, TL.m19Crin, TF.pan),
      M19X('oeilClairL', 'head', [-0.126, 0.04, 0.18], [0.006, 0.09, 0.1], clair, TL.fur),
      M19X('oeilClairR', 'head', [0.126, 0.04, 0.18], [0.006, 0.09, 0.1], clair, TL.fur),
      { name: 'saddle', parent: 'body', p: [0, 0.28, 0.08], s: [0.52, 0.08, 0.46], o: [0, 0, 0], col: rgbf('#5a3a24'), tex: TL.leather, hide: true },
      { name: 'blanketS', parent: 'body', p: [0, 0.23, 0.08], s: [0.54, 0.08, 0.6], o: [0, 0, 0], col: rgbf('#2a4a7a'), tex: TL.cloth, hide: true },
      M19X('bat', 'saddle', [0, 0.07, 0], [0.3, 0.1, 0.36], rgbf('#6a4a30'), TL.wood),
      M19X('sangle', 'saddle', [0, -0.25, 0.1], [0.54, 0.05, 0.07], rgbf('#3a2618'), TL.leather),
    ]);
    rr.m19Selle = [['bat', 'saddle'], ['sangle', 'saddle']];
    for (const [n] of rr.m19Selle) rr.part(n).hide = true;
    return rr;
  },
  // mouton : toison arrondie (boîtes croisées, laine bouclée), tête noire effilée, toupet de laine, oreilles tombantes,
  // laine jusqu'aux genoux, pattes noires fines
  sheep: () => {
    const L = rgbf('#ece6d8'), noir = rgbf('#3a342e');
    const r = quadRig({ col: L, body: [0.6, 0.5, 0.86], bodyY: 0.8, bodyTex: TL.m19Laine, leg: [0.075, 0.61], legCol: noir, legTex: TL.fur, hoof: true, dark: rgbf('#1e1a16'),
      neck: [0, 0.12], head: [0.2, 0.24, 0.24], headCol: noir, face: TL.fur, snout: [0.15, 0.14, 0.1, -0.05], snoutCol: noir, snoutTex: TL.fur, snoutShp: TF.calotte,
      snoutTip: [rgbf('#2a2420'), TL.m19Mufle], ears: [0.04, 0.13, 0.07], earCol: noir, earTilt: 1.45, earZ: 0.4, eyes: [1, 1, 1], eyeY: 0.16, eyeZ: 0.6, eyeS: 0.035,
      tail: [0.1, 0.18, 0.08], tailTex: TL.m19Laine, np: [0.25, 0.7], hp: [0.3, 0.45] });
    const rr = rigPlus(r, [
      M19X('laineH', 'body', [0, 0.02, 0], [0.5, 0.64, 0.8], L, TL.m19Laine),
      M19X('laineL', 'body', [0, -0.02, 0], [0.7, 0.4, 0.8], L, TL.m19Laine),
      M19X('laineAv', 'body', [0, 0.0, 0.43], [0.5, 0.44, 0.1], L, TL.m19Laine),
      M19X('laineAr', 'body', [0, 0.02, -0.43], [0.5, 0.44, 0.1], L, TL.m19Laine),
      M19X('cou', 'neck', [0, -0.02, 0.0], [0.32, 0.34, 0.22], L, TL.m19Laine),
      M19X('toupet', 'head', [0, 0.12, 0.08], [0.2, 0.08, 0.16], L, TL.m19Laine),
    ]);
    // la laine descend jusqu'aux genoux
    for (const n of ['legFL', 'legFR', 'legBL', 'legBR']) { const q = rr.part(n); q.col = L; q.tex = TL.m19Laine; q.s = [q.s[0] * 1.9, q.s[1] * 0.9, q.s[2] * 1.8]; }
    return rr;
  },
  // cochon : corps arrondi (section octogonale, croupe et épaules arrondies), groin et narines, oreilles qui tombent en
  // avant, petits yeux, queue en tire-bouchon, onglons
  pig: () => {
    const C = rgbf('#e8a8a8'), D = rgbf('#d8908e');
    const r = quadRig({ col: C, body: [0.48, 0.44, 0.9], bodyY: 0.6, bodyTex: TL.skin, leg: [0.11, 0.44], legTex: TL.skin, hoof: true, dark: rgbf('#6a4a44'),
      neck: [0, 0.02], head: [0.32, 0.3, 0.24], headTex: TL.skin, face: TL.skin, snout: [0.21, 0.18, 0.13, -0.05], snoutCol: C, snoutTex: TL.skin, snoutShp: TF.calotte,
      snoutTip: [D, TL.m19Groin], ears: [0.03, 0.16, 0.14], earTilt: 0.45, earBack: 1.05, earZ: 0.35, eyes: [1, 1, 1], eyeY: 0.18, eyeZ: 0.7, eyeS: 0.03,
      tail: null, np: [0.05, 0.55], hp: [0.12, 0.45] });
    return rigPlus(r, [
      M19X('rond', 'body', [0, 0.0, 0], [0.47, 0.47, 0.86], C, TL.skin, 0, [0, 0, Math.PI / 4]),
      M19X('epaules', 'body', [0, -0.01, 0.38], [0.4, 0.4, 0.2], C, TL.skin, TF.qCorps),
      M19X('croupe', 'body', [0, 0.0, -0.38], [0.42, 0.42, 0.2], C, TL.skin, TF.qCorps),
      M19X('ventre', 'body', [0, -0.2, 0.0], [0.4, 0.1, 0.7], C, TL.skin, TF.qCorps),
      M19X('bajoue', 'head', [0, -0.1, 0.1], [0.28, 0.12, 0.2], C, TL.skin),
      M19X('queue', 'body', [0, 0.16, -0.48], [0.03, 0.08, 0.03], C, TL.skin, 0, [-0.6, 0, 0], [0, 0.04, -0.01]),
      M19X('queueb', 'queue', [0, 0.08, 0], [0.026, 0.07, 0.026], C, TL.skin, 0, [2.2, 0, 0.6], [0, 0.035, 0]),
      M19X('queuec', 'queueb', [0, 0.07, 0], [0.022, 0.06, 0.022], C, TL.skin, 0, [2.0, 0, 0.6], [0, 0.03, 0]),
    ]);
  },
  // chèvre : cornes en arrière, barbiche, pampilles, queue relevée, robe selon la bête
  goat: (v) => {
    const c = rgbf(['#d8d0c0', '#6a5a4a', '#e8e4dc', '#9a7a5a'][(v || 0) % 4]), corne = rgbf('#8a7a60');
    const r = quadRig({ col: c, body: [0.34, 0.38, 0.78], bodyY: 0.74, leg: [0.075, 0.61], hoof: true, dark: [0.15, 0.12, 0.1],
      neck: [0, 0.12], neckS: [0.15, 0.36, 0.2], neckO: [0, 0.15, 0.02], headP: [0, 0.32, 0.02], head: [0.16, 0.18, 0.18], face: TL.fur,
      snout: [0.12, 0.12, 0.15, -0.02], snoutCol: c, snoutTex: TL.fur, snoutShp: TF.bonnet, snoutTip: [v3.scale(c, 0.6), TL.m19Mufle],
      ears: [0.04, 0.12, 0.06], earTilt: 1.2, earZ: 0.3, eyes: [1, 1, 1], eyeY: 0.18, eyeZ: 0.6, eyeS: 0.032,
      tail: [0.05, 0.12, 0.04], np: [0.55, 1.35], hp: [0.35, -0.6] });
    return rigPlus(r, [
      M19X('hornL', 'head', [-0.045, 0.09, 0.07], [0.035, 0.16, 0.035], corne, TL.bone, TF.calotte, [-0.75, 0, -0.18], [0, 0.07, 0]),
      M19X('hornLb', 'hornL', [0, 0.15, 0], [0.028, 0.12, 0.028], corne, TL.bone, TF.pointe, [-0.7, 0, 0], [0, 0.05, 0]),
      M19X('hornR', 'head', [0.045, 0.09, 0.07], [0.035, 0.16, 0.035], corne, TL.bone, TF.calotte, [-0.75, 0, 0.18], [0, 0.07, 0]),
      M19X('hornRb', 'hornR', [0, 0.15, 0], [0.028, 0.12, 0.028], corne, TL.bone, TF.pointe, [-0.7, 0, 0], [0, 0.05, 0]),
      M19X('barbe', 'head', [0, -0.1, 0.28], [0.045, 0.12, 0.04], v3.scale(c, 0.75), TL.m19Crin, TF.membrePale, 0, [0, -0.05, 0]),
      M19X('pampilleL', 'neck', [-0.05, 0.02, 0.09], [0.02, 0.06, 0.02], c, TL.fur, 0, 0, [0, -0.03, 0]),
      M19X('pampilleR', 'neck', [0.05, 0.02, 0.09], [0.02, 0.06, 0.02], c, TL.fur, 0, 0, [0, -0.03, 0]),
      M19X('ventre', 'body', [0, -0.21, 0.02], [0.3, 0.08, 0.56], c, TL.fur, TF.qCorps),
    ]);
  },
  // chien de ferme : poitrine profonde, ventre levé, museau effilé et truffe noire, oreilles droites ou tombantes,
  // queue en panache ; quatre robes
  dog: (v) => {
    const k = (v || 0) % 4, c = rgbf(['#b08450', '#3a302a', '#e8dcc8', '#8a5a34'][k]), feu = rgbf(['#e0c49a', '#a87848', '#f4ece0', '#c8a070'][k]);
    const r = quadRig({ col: c, body: [0.3, 0.32, 0.68], bodyY: 0.52, leg: [0.09, 0.42], paw: feu,
      neck: [0, 0.1], neckS: [0.19, 0.24, 0.19], neckO: [0, 0.08, 0.02], headP: [0, 0.18, 0.0], head: [0.21, 0.21, 0.2], face: TL.fur,
      snout: [0.12, 0.105, 0.16, -0.045], snoutCol: feu, snoutTex: TL.fur, snoutShp: TF.bonnet, snoutTip: [rgbf('#1a1614'), TL.plain],
      ears: k % 2 ? [0.04, 0.12, 0.08] : [0.045, 0.11, 0.06], earPoint: k % 2 === 0, earDroop: k % 2 === 1, earTilt: k % 2 ? 1.2 : 0.25, earZ: 0.25,
      eyes: [1, 1, 1], eyeY: 0.18, eyeZ: 0.74, eyeS: 0.032, tail: [0.06, 0.34, 0.06], np: [0.25, 1.05], hp: [-0.1, 0.4] });
    return m19Suivre(rigPlus(r, [
      M19X('poitrine', 'body', [0, -0.05, 0.22], [0.28, 0.36, 0.24], c, TL.fur, TF.qCorps),
      M19X('poitrail', 'body', [0, -0.03, 0.345], [0.16, 0.26, 0.04], feu, TL.fur),
      M19X('flanc', 'body', [0, 0.01, -0.16], [0.26, 0.26, 0.36], c, TL.fur, TF.qCorps),
      M19X('dos', 'body', [0, 0.0, 0.0], [0.26, 0.26, 0.62], c, TL.fur, 0, [0, 0, Math.PI / 4]),
      M19X('sourcilL', 'head', [-0.06, 0.07, 0.201], [0.035, 0.025, 0.006], feu, TL.plain),
      M19X('sourcilR', 'head', [0.06, 0.07, 0.201], [0.035, 0.025, 0.006], feu, TL.plain),
      M19X('collier', 'neck', [0, 0.0, 0.02], [0.2, 0.04, 0.2], rgbf('#7a2a20'), TL.leather),
    ]), ['poitrine', 'poitrail', 'flanc', 'dos']);
  },
  // chat : petite tête ronde, oreilles pointues, museau court, queue longue qui monte
  cat: (v) => {
    const k = (v || 0) % 3, c = rgbf(['#2a2624', '#e0a060', '#9a9aa0'][k]), clair = rgbf(['#3a3634', '#f4e4c8', '#d8d8dc'][k]);
    const r = quadRig({ col: c, body: [0.18, 0.19, 0.44], bodyY: 0.31, leg: [0.055, 0.27], paw: clair, bodyTex: k === 1 ? TL.stripes : TL.fur,
      neck: [0, 0.08], head: [0.15, 0.14, 0.13], face: TL.fur, snout: [0.07, 0.06, 0.04, -0.035], snoutCol: clair, snoutTex: TL.fur, snoutShp: TF.calotte, snoutTip: [rgbf('#e8a0a0'), TL.plain],
      ears: [0.035, 0.07, 0.03], earPoint: true, earTilt: 0.32, earZ: 0.3, eyes: [1.05, 1.15, 0.75], eyeFront: true, eyeY: 0.12, eyeX: 0.24, eyeS: 0.032,
      tail: [0.03, 0.44, 0.03], tailK: 0.5, tailLift: 1.75, np: [0.0, 0.8], hp: [-0.05, 0.4] });
    return rigPlus(r, [
      M19X('jouesL', 'head', [-0.06, -0.035, 0.08], [0.04, 0.06, 0.07], c, TL.fur),
      M19X('jouesR', 'head', [0.06, -0.035, 0.08], [0.04, 0.06, 0.07], c, TL.fur),
      M19X('poitrail', 'body', [0, -0.03, 0.2], [0.13, 0.15, 0.06], clair, TL.fur),
      M19X('moustL', 'snout', [-0.04, 0.03, 0.0], [0.06, 0.004, 0.004], [0.95, 0.95, 0.92], TL.plain, 0, [0, 0.3, 0]),
      M19X('moustR', 'snout', [0.04, 0.03, 0.0], [0.06, 0.004, 0.004], [0.95, 0.95, 0.92], TL.plain, 0, [0, -0.3, 0]),
    ]);
  },
  // lapin : dos rond, grosses cuisses, longues oreilles, petite queue blanche
  rabbit: () => {
    const c = rgbf('#9a8672'), clair = rgbf('#e0d4c4');
    const r = quadRig({ col: c, body: [0.19, 0.18, 0.28], bodyY: 0.17, leg: [0.05, 0.1], neck: [0, 0.08], head: [0.13, 0.13, 0.14], face: TL.fur,
      snout: [0.08, 0.07, 0.04, -0.025], snoutCol: clair, snoutTex: TL.fur, snoutShp: TF.calotte, snoutTip: [rgbf('#d8a0a0'), TL.plain],
      ears: [0.035, 0.17, 0.025], earTilt: 0.12, earZ: 0.18, earBack: -0.25, eyes: [1, 1, 1], eyeY: 0.18, eyeZ: 0.62, eyeS: 0.03,
      tail: [0.065, 0.065, 0.05], tailCol: [1, 1, 1], np: [0.1, 0.6], hp: [0, 0.3] });
    return rigPlus(r, [
      M19X('dos', 'body', [0, 0.07, -0.04], [0.17, 0.08, 0.2], c, TL.fur),
      M19X('cuisseL', 'body', [-0.085, -0.02, -0.08], [0.06, 0.13, 0.15], c, TL.fur, TF.qCorps),
      M19X('cuisseR', 'body', [0.085, -0.02, -0.08], [0.06, 0.13, 0.15], c, TL.fur, TF.qCorps),
      M19X('piedL', 'body', [-0.07, -0.085, -0.06], [0.045, 0.03, 0.12], c, TL.fur),
      M19X('piedR', 'body', [0.07, -0.085, -0.06], [0.045, 0.03, 0.12], c, TL.fur),
      M19X('ventre', 'body', [0, -0.07, 0.03], [0.14, 0.05, 0.18], clair, TL.fur),
    ]);
  },
});

// ---------------------------------------------------------------- les bêtes sauvages les plus vues
Object.assign(ANIMAL_RIGS, {
  // cerf (bois) ou biche ; le cerf blanc des légendes (white) : encolure qui monte, tête fine, grandes oreilles,
  // miroir blanc et petite queue, pattes fines ; bois en deux merrains et leurs andouillers
  deer: (v, white) => {
    const c = white ? [0.96, 0.96, 0.94] : rgbf('#9a6a3e'), clair = white ? [1, 1, 1] : rgbf('#e8dcc4'), bois = white ? [0.95, 0.95, 0.92] : rgbf('#cbb894');
    const r = quadRig({ col: c, body: [0.42, 0.5, 1.1], bodyY: 1.15, leg: [0.08, 0.96], hoof: true, dark: white ? [0.6, 0.6, 0.6] : [0.14, 0.11, 0.09],
      neck: [0, 0.18], neckS: [0.17, 0.58, 0.25], neckO: [0, 0.25, 0.02], headP: [0, 0.54, 0.02], head: [0.17, 0.19, 0.2], face: TL.fur,
      snout: [0.12, 0.13, 0.2, -0.02], snoutCol: c, snoutTex: TL.fur, snoutShp: TF.bonnet, snoutTip: [white ? [0.75, 0.7, 0.7] : rgbf('#2a2220'), TL.m19Mufle],
      ears: [0.04, 0.15, 0.09], earTilt: 0.75, earZ: 0.2, eyes: white ? [1.3, 0.35, 0.3] : [1, 1, 1], eyeY: 0.2, eyeZ: 0.62, eyeS: 0.036,
      tail: [0.08, 0.13, 0.04], tailCol: clair, np: [0.5, 2.0], hp: [0.4, -1.35] });
    const u = [
      M19X('poitrail', 'body', [0, -0.02, 0.5], [0.36, 0.4, 0.14], c, TL.fur, TF.qCorps),
      M19X('miroir', 'body', [0, 0.06, -0.552], [0.3, 0.26, 0.012], clair, TL.fur),
      M19X('ventre', 'body', [0, -0.252, 0.0], [0.32, 0.012, 0.7], clair, TL.fur),
      M19X('gorge', 'neck', [0, 0.16, 0.135], [0.12, 0.2, 0.012], clair, TL.fur),
    ];
    if (white || (v | 0) % 2 === 0) for (const s of [-1, 1]) {
      const n = 'ant' + s;
      u.push(M19X(n, 'head', [s * 0.05, 0.1, 0.08], [0.035, 0.3, 0.035], bois, TL.bone, TF.calotte, [-0.35, 0, s * 0.42], [0, 0.15, 0]));
      u.push(M19X('antb' + s, n, [0, 0.28, 0], [0.03, 0.26, 0.03], bois, TL.bone, TF.calotte, [0.25, 0, -s * 0.35], [0, 0.13, 0]));
      u.push(M19X('antc' + s, n, [0, 0.08, 0], [0.022, 0.14, 0.022], bois, TL.bone, TF.pointe, [1.25, 0, 0], [0, 0.07, 0]));
      u.push(M19X('antd' + s, 'antb' + s, [0, 0.1, 0], [0.02, 0.12, 0.02], bois, TL.bone, TF.pointe, [0.9, 0, 0], [0, 0.06, 0]));
      u.push(M19X('ante' + s, 'antb' + s, [0, 0.24, 0], [0.018, 0.1, 0.018], bois, TL.bone, TF.pointe, [-0.2, 0, s * 0.5], [0, 0.05, 0]));
    }
    return rigPlus(r, u);
  },
  // sanglier : garrot haut et hérissé, tête en coin, long groin, défenses, petites oreilles, pattes courtes, queue à pinceau
  boar: () => {
    const c = rgbf('#4a3a2e'), soie = rgbf('#2a2018'), groin = rgbf('#5a4840');
    const r = quadRig({ col: c, body: [0.44, 0.5, 0.96], bodyY: 0.64, bodyTex: TL.m19Crin, leg: [0.1, 0.45], hoof: true, dark: [0.1, 0.08, 0.07],
      neck: [0, 0.04], head: [0.3, 0.32, 0.26], face: TL.fur, headTex: TL.m19Crin, snout: [0.18, 0.15, 0.26, -0.07], snoutCol: v3.scale(c, 0.85), snoutTex: TL.fur, snoutShp: TF.bonnet,
      snoutTip: [groin, TL.m19Groin], ears: [0.04, 0.11, 0.07], earPoint: true, earTilt: 0.5, earZ: 0.3, eyes: [1, 1, 1], eyeY: 0.18, eyeZ: 0.62, eyeS: 0.026,
      tail: [0.035, 0.24, 0.035], tuft: soie, np: [0.32, 0.55], hp: [0.25, 0.35] });
    return rigPlus(r, [
      M19X('garrot', 'body', [0, 0.24, 0.2], [0.38, 0.14, 0.5], c, TL.m19Crin, TF.pPyramide),
      M19X('crete', 'body', [0, 0.3, 0.16], [0.06, 0.07, 0.52], soie, TL.m19Crin, TF.pPyramide),
      M19X('epaules', 'body', [0, -0.02, 0.36], [0.46, 0.5, 0.26], c, TL.m19Crin, TF.qCorps),
      M19X('rond', 'body', [0, 0.0, -0.06], [0.44, 0.44, 0.82], c, TL.m19Crin, 0, [0, 0, Math.PI / 4]),
      M19X('defL', 'snout', [-0.075, 0.2, 0.02], [0.022, 0.08, 0.022], [0.95, 0.92, 0.85], TL.bone, TF.pointe, [-0.9, 0, 0.3], [0, 0.035, 0]),
      M19X('defR', 'snout', [0.075, 0.2, 0.02], [0.022, 0.08, 0.022], [0.95, 0.92, 0.85], TL.bone, TF.pointe, [-0.9, 0, -0.3], [0, 0.035, 0]),
      M19X('joues', 'head', [0, -0.08, 0.12], [0.32, 0.14, 0.18], c, TL.m19Crin),
    ]);
  },
  // loup : collerette claire, museau long et truffe, oreilles droites, yeux jaunes, queue touffue portée bas
  wolf: () => {
    const c = rgbf('#6e6a66'), clair = rgbf('#b8b0a4'), sombre = rgbf('#3e3a36');
    const r = quadRig({ col: c, body: [0.32, 0.34, 0.86], bodyY: 0.62, leg: [0.09, 0.51], paw: v3.scale(c, 0.9),
      neck: [0, 0.1], neckS: [0.24, 0.26, 0.24], neckO: [0, 0.08, 0.02], headP: [0, 0.17, 0.02], head: [0.24, 0.22, 0.21], face: TL.fur,
      snout: [0.13, 0.11, 0.19, -0.05], snoutCol: clair, snoutTex: TL.fur, snoutShp: TF.qMuseauFin, snoutTip: [rgbf('#141210'), TL.plain],
      ears: [0.05, 0.12, 0.05], earPoint: true, earTilt: 0.22, earZ: 0.28, eyes: [1.5, 1.3, 0.5], eyeY: 0.16, eyeZ: 0.82, eyeS: 0.03,
      tail: [0.1, 0.44, 0.1], tailCol: c, tuft: sombre, tuftK: 0.75, np: [0.42, 0.95], hp: [-0.05, 0.4] });
    return rigPlus(r, [
      M19X('collerette', 'neck', [0, 0.02, 0.02], [0.3, 0.3, 0.24], clair, TL.fur, TF.qCorps),
      M19X('poitrine', 'body', [0, -0.04, 0.27], [0.3, 0.36, 0.26], c, TL.fur, TF.qCorps),
      M19X('dos', 'body', [0, 0.18, -0.05], [0.22, 0.06, 0.6], sombre, TL.fur),
      M19X('ventre', 'body', [0, -0.172, -0.05], [0.22, 0.012, 0.5], clair, TL.fur),
      M19X('jouesL', 'head', [-0.11, -0.04, 0.1], [0.05, 0.12, 0.14], clair, TL.fur),
      M19X('jouesR', 'head', [0.11, -0.04, 0.1], [0.05, 0.12, 0.14], clair, TL.fur),
    ]);
  },
  // renard : roux, gorge et bout de queue blancs, chaussettes noires, oreilles noires derrière, museau fin
  fox: () => {
    const c = rgbf('#c8652a'), blanc = rgbf('#f0ece4'), noir = rgbf('#2a1e18');
    const r = quadRig({ col: c, body: [0.22, 0.23, 0.56], bodyY: 0.39, leg: [0.06, 0.33], legCol: c, paw: noir,
      neck: [0, 0.08], neckS: [0.16, 0.16, 0.16], neckO: [0, 0.05, 0.02], headP: [0, 0.12, 0.0], head: [0.18, 0.16, 0.15], face: TL.fur,
      snout: [0.09, 0.08, 0.15, -0.04], snoutCol: blanc, snoutTex: TL.fur, snoutShp: TF.qMuseauFin, snoutTip: [noir, TL.plain],
      ears: [0.05, 0.11, 0.035], earPoint: true, earTilt: 0.3, earZ: 0.3, eyes: [1.5, 1.2, 0.5], eyeY: 0.18, eyeZ: 0.84, eyeS: 0.025,
      tail: [0.12, 0.12, 0.5], tailCol: c, tuft: blanc, tailK: 0.6, np: [0.35, 0.95], hp: [-0.05, 0.4] });
    const rr = rigPlus(r, [
      M19X('gorge', 'body', [0, -0.05, 0.27], [0.16, 0.16, 0.05], blanc, TL.fur),
      M19X('ventre', 'body', [0, -0.117, 0.0], [0.14, 0.008, 0.4], blanc, TL.fur),
      M19X('jouesL', 'head', [-0.08, -0.04, 0.09], [0.035, 0.08, 0.11], blanc, TL.fur),
      M19X('jouesR', 'head', [0.08, -0.04, 0.09], [0.035, 0.08, 0.11], blanc, TL.fur),
    ]);
    // les chaussettes noires : le bas des pattes
    for (const n of ['legFLb', 'legFRb', 'legBLb', 'legBRb']) if (rr.has(n)) rr.part(n).col = noir;
    return rr;
  },
  // ours brun : bosse au garrot, grosse tête ronde, petites oreilles rondes, museau plus clair, pattes épaisses et griffes
  bear: () => {
    const c = rgbf('#4a3424'), clair = rgbf('#7a5a40'), griffe = rgbf('#d8ccb4');
    const r = quadRig({ col: c, body: [0.76, 0.78, 1.36], bodyY: 0.95, leg: [0.24, 0.62], paw: v3.scale(c, 0.85), legIn: 0.12,
      neck: [0, 0.18], neckS: [0.48, 0.42, 0.42], neckO: [0, 0.1, 0.06], headP: [0, 0.24, 0.06], head: [0.42, 0.38, 0.36], face: TL.fur,
      snout: [0.22, 0.2, 0.2, -0.06], snoutCol: clair, snoutTex: TL.fur, snoutShp: TF.bonnet, snoutTip: [rgbf('#1a1412'), TL.plain],
      ears: [0.08, 0.09, 0.05], earTilt: 0.5, earZ: 0.3, eyes: [1, 1, 1], eyeY: 0.14, eyeZ: 0.86, eyeS: 0.036, hock: 0.08,
      tail: [0.1, 0.1, 0.08], np: [0.55, 0.85], hp: [0.05, 0.45] });
    return rigPlus(r, [
      M19X('bosse', 'body', [0, 0.38, 0.3], [0.6, 0.18, 0.5], c, TL.fur, TF.pPyramide),
      M19X('ventre', 'body', [0, -0.02, 0], [0.7, 0.7, 1.28], c, TL.fur, 0, [0, 0, Math.PI / 4]),
      ...['legFLh', 'legFRh', 'legBLh', 'legBRh'].map((n) => M19X(n + 'g', n, [0, -0.005, 0.12], [0.2, 0.025, 0.06], griffe, TL.bone)),
    ]);
  },
});

// écureuil : assis haut, panache relevé en crosse au-dessus du dos, oreilles à pinceaux, ventre clair
ANIMAL_RIGS.squirrel = () => {
  const c = rgbf('#b0582a'), q = rgbf('#c0683a'), clair = rgbf('#ece0cc');
  const r = quadRig({ col: c, body: [0.1, 0.1, 0.17], bodyY: 0.12, leg: [0.03, 0.08], neck: [0, 0.05], head: [0.075, 0.075, 0.085], face: TL.fur,
    snout: [0.045, 0.04, 0.03, -0.015], snoutCol: c, snoutTex: TL.fur, snoutShp: TF.calotte, snoutTip: [rgbf('#3a2a22'), TL.plain],
    ears: [0.02, 0.045, 0.015], earPoint: true, earTilt: 0.25, earZ: 0.3, eyes: [1, 1, 1], eyeY: 0.18, eyeZ: 0.62, eyeS: 0.018, tail: null, np: [-0.3, 0.9], hp: [0.2, 0.3] });
  return rigPlus(r, [
    M19X('ventre', 'body', [0, -0.045, 0.02], [0.07, 0.012, 0.12], clair, TL.fur),
    M19X('queue', 'body', [0, -0.01, -0.085], [0.08, 0.14, 0.07], q, TL.m19Crin, 0, [-0.55, 0, 0], [0, 0.07, 0]),
    M19X('queueb', 'queue', [0, 0.14, 0], [0.1, 0.15, 0.09], q, TL.m19Crin, TF.qCorps, [0.75, 0, 0], [0, 0.07, 0]),
    M19X('queuec', 'queueb', [0, 0.14, 0], [0.08, 0.08, 0.07], q, TL.m19Crin, 0, [1.0, 0, 0], [0, 0.03, 0]),
    M19X('pinceauL', 'earL', [0, 0.05, 0], [0.012, 0.025, 0.01], rgbf('#5a2e18'), TL.fur, TF.pointe),
    M19X('pinceauR', 'earR', [0, 0.05, 0], [0.012, 0.025, 0.01], rgbf('#5a2e18'), TL.fur, TF.pointe),
  ]);
};
// hérisson : le manteau d'épines en dôme, qui déborde sur les flancs et couvre le front, le museau pointu et sa truffe
// noire, la face claire ; roulé en boule (pose couchée), le manteau seul se voit
ANIMAL_RIGS.hedgehog = () => {
  const r = quadRig({ col: rgbf('#7a6450'), body: [0.18, 0.12, 0.24], bodyY: 0.09, bodyTex: TL.fur, leg: [0.03, 0.05], legCol: rgbf('#4a3a2e'),
    neck: [0, 0.0], head: [0.085, 0.075, 0.08], headCol: rgbf('#b09878'), face: TL.fur,
    snout: [0.05, 0.045, 0.06, -0.014], snoutCol: rgbf('#a08868'), snoutTex: TL.fur, snoutShp: TF.qMuseauFin, snoutTip: [[0.08, 0.06, 0.05], TL.plain],
    ears: [0.022, 0.02, 0.012], earTilt: 0.5, eyes: [0.06, 0.05, 0.05], eyeY: 0.22, eyeZ: 0.66, eyeS: 0.016, np: [0.1, 0.4], hp: [0, 0.2] });
  return rigPlus(r, [
    M19X('epines', 'body', [0, 0.018, -0.02], [0.25, 0.11, 0.3], rgbf('#5a4a3a'), TL.hair, TF.bonnet),
    M19X('epinesH', 'body', [0, 0.083, -0.03], [0.17, 0.06, 0.21], rgbf('#625040'), TL.hair, TF.calotte),
    M19X('epinesF', 'body', [0, 0.05, 0.11], [0.15, 0.07, 0.07], rgbf('#5a4a3a'), TL.hair, TF.bonnet),
  ]);
};

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

// ---------------------------------------------------------------- les oiseaux : des corps d'oiseau (e1Oiseau)
// ailes repliées au repos, déployées en vol (e1Pose) ; yeux sur les côtés pour la basse-cour
// (les pièces en plus d'e1Oiseau ne prenaient leur rotation de repos, leur forme, leur drapeau qu'à travers « extra » :
// celles qui les donnent directement, comme les autres pièces, les gardent maintenant)
{
  const _e1o = e1Oiseau;
  e1Oiseau = function (o) {
    if (o && o.plus) {
      o = Object.assign({}, o, {
        plus: o.plus.map((x) => {
          if (!x || x.extra || (x.r0 === undefined && x.shp === undefined && x.hide === undefined && x.fl === undefined)) return x;
          const e = {};
          for (const k of ['r0', 'shp', 'hide', 'fl']) if (x[k] !== undefined) e[k] = x[k];
          return Object.assign({}, x, { extra: e });
        }),
      });
    }
    return _e1o(o);
  };
}
const m19YeuxCote = (hd, y, z, k, col) => [-1, 1].map((s) => ({ name: 'oeil' + s, parent: 'head', p: [s * (hd[0] / 2 + 0.002), hd[1] * (y ?? 0.62), hd[2] * (z ?? 0.38)], s: [0.004, hd[1] * 0.22 * (k || 1), hd[2] * 0.2 * (k || 1)], o: [0, 0, 0], col: col || [1, 1, 1], tex: TL.m19Oeil }));
Object.assign(ANIMAL_RIGS, {
  // poule : crête dentelée, barbillons, queue relevée en éventail, cuisses emplumées, pattes jaunes et doigts
  hen: (v) => {
    const c = (v || 0) % 2 ? rgbf('#9a5a2c') : rgbf('#f2ede2'), c2 = (v || 0) % 2 ? rgbf('#6a3a1c') : rgbf('#e2dccc'), rouge = rgbf('#d02a20'), jaune = rgbf('#e8b030');
    const body = [0.2, 0.2, 0.28], head = [0.085, 0.095, 0.09];
    const r = e1Oiseau({
      body, bodyY: 0.27, dos: c, bodyTex: TL.m19Plumes, ventre: v3.scale(c, 1.04), ventreTex: TL.m19Plumes, ventreS: 0.7, head, headCol: c, face: TL.fur,
      neck: [0.075, 0.09, 0.075], neckR: [0.25, 0, 0], neckCol: c, beak: [0.026, 0.024, 0.04], beakCol: jaune, beakY: 0.45,
      tail: [0.12, 0.03, 0.12], tailCol: c2, tailUp: 0.95, wing: [0.24, 0.014, 0.14], wingCol: c2, pliL: 0.82, pliCol: c2,
      leg: [0.022, 0.155], legCol: jaune, cuisses: c, droit: -0.2, batF: 16, batA: 0.85,
      plus: [
        ...[-0.022, 0, 0.022].map((z, i) => ({ name: 'crete' + i, parent: 'head', p: [0, head[1] + 0.012 + (i === 1 ? 0.008 : 0), head[2] * 0.25 + z], s: [0.016, 0.04, 0.026], o: [0, 0, 0], col: rouge, tex: TL.plain, shp: TF.pointe })),
        { name: 'barbillon', parent: 'head', p: [0, head[1] * 0.2, head[2] * 0.62], s: [0.024, 0.04, 0.018], o: [0, -0.015, 0], col: rouge, tex: TL.plain },
        ...m19YeuxCote(head, 0.62, 0.42, 1.0),
        { name: 'faucille0', parent: 'tail', p: [0, 0.02, -0.06], s: [0.05, 0.02, 0.14], o: [0, 0, -0.05], col: c2, tex: TL.m19Plumes, r0: [0.55, 0.25, 0] },
        { name: 'faucille1', parent: 'tail', p: [0, 0.02, -0.06], s: [0.05, 0.02, 0.14], o: [0, 0, -0.05], col: c2, tex: TL.m19Plumes, r0: [0.55, -0.25, 0] },
        { name: 'doigtsL', parent: 'legFL', p: [0, -0.15, 0.02], s: [0.05, 0.012, 0.07], o: [0, 0, 0], col: jaune, tex: TL.plain },
        { name: 'doigtsR', parent: 'legFR', p: [0, -0.15, 0.02], s: [0.05, 0.012, 0.07], o: [0, 0, 0], col: jaune, tex: TL.plain },
      ],
    });
    return r;
  },
  // oie : long cou, bec orange, corps en carène, ventre bas, pattes palmées
  goose: () => {
    const c = rgbf('#f0f0ea'), orange = rgbf('#e89030'), body = [0.25, 0.22, 0.42], head = [0.085, 0.09, 0.11];
    return e1Oiseau({
      body, bodyY: 0.31, dos: c, bodyTex: TL.m19Plumes, ventre: rgbf('#e4e2da'), ventreTex: TL.m19Plumes, ventreS: 0.72, head, headCol: c, face: TL.fur,
      neck: [0.065, 0.3, 0.065], neckR: [0.12, 0, 0], beak: [0.05, 0.035, 0.08], beakCol: orange, beakY: 0.4,
      tail: [0.12, 0.05, 0.08], tailUp: 0.45, wing: [0.46, 0.018, 0.2], wingCol: rgbf('#e8e8e0'), pliL: 0.9, pliCol: rgbf('#dcdcd2'),
      leg: [0.03, 0.17], legCol: orange, droit: -0.12, batF: 7, batA: 0.6,
      plus: [...m19YeuxCote(head, 0.62, 0.4, 0.9),
        { name: 'palmeL', parent: 'legFL', p: [0, -0.165, 0.03], s: [0.07, 0.012, 0.08], o: [0, 0, 0], col: orange, tex: TL.plain },
        { name: 'palmeR', parent: 'legFR', p: [0, -0.165, 0.03], s: [0.07, 0.012, 0.08], o: [0, 0, 0], col: orange, tex: TL.plain }],
    });
  },
  // canard colvert : tête verte, collier blanc, poitrine brune, dos gris, miroir bleu, plumes bouclées de la queue
  duck: () => {
    const body = [0.19, 0.15, 0.32], head = [0.075, 0.078, 0.09];
    return e1Oiseau({
      body, bodyY: 0.17, dos: rgbf('#8a8a82'), bodyTex: TL.m19Plumes, ventre: rgbf('#b4aea2'), ventreTex: TL.m19Plumes, ventreS: 0.6, head, headCol: rgbf('#1e5a34'), face: TL.fur,
      neck: [0.052, 0.07, 0.052], neckR: [0.1, 0, 0], neckCol: rgbf('#1e5a34'), beak: [0.038, 0.016, 0.058], beakCol: rgbf('#d8b830'), beakY: 0.32,
      tail: [0.08, 0.025, 0.07], tailCol: rgbf('#3a3a36'), tailUp: 0.3, wing: [0.3, 0.012, 0.13], wingCol: rgbf('#6a6458'), pliL: 0.9, pliCol: rgbf('#5a544a'),
      miroir: rgbf('#3a52b0'), leg: [0.018, 0.05], legCol: rgbf('#e88a30'), batF: 13, batA: 0.85,
      plus: [...m19YeuxCote(head, 0.6, 0.45, 0.9),
        { name: 'collier', parent: 'neckB', p: [0, 0.01, 0], s: [0.058, 0.012, 0.058], o: [0, 0, 0], col: [0.96, 0.96, 0.94], tex: TL.plain },
        { name: 'poitrine', parent: 'body', p: [0, 0.01, body[2] * 0.4], s: [body[0] * 0.92, body[1] * 0.7, 0.07], o: [0, 0, 0], col: rgbf('#6a3a24'), tex: TL.m19Plumes },
        { name: 'boucle', parent: 'tail', p: [0, 0.02, -0.05], s: [0.016, 0.04, 0.016], o: [0, 0.015, 0], col: [0.1, 0.1, 0.1], tex: TL.plain, r0: [-0.6, 0, 0] }],
    });
  },
  // cane de la ferme : blanche, bec et pattes orange
  farmduck: () => {
    const c = rgbf('#f2eee2'), body = [0.2, 0.16, 0.34], head = [0.076, 0.08, 0.092];
    return e1Oiseau({
      body, bodyY: 0.18, dos: c, bodyTex: TL.m19Plumes, ventre: rgbf('#ebe6d8'), ventreTex: TL.m19Plumes, ventreS: 0.6, head, headCol: c, face: TL.fur,
      neck: [0.055, 0.09, 0.055], neckR: [0.12, 0, 0], beak: [0.04, 0.017, 0.062], beakCol: rgbf('#e8a030'), beakY: 0.32,
      tail: [0.08, 0.025, 0.07], tailUp: 0.4, wing: [0.3, 0.012, 0.13], wingCol: rgbf('#e6e2d6'), pliL: 0.9, pliCol: rgbf('#e0dace'),
      leg: [0.02, 0.07], legCol: rgbf('#e88a30'), batF: 13, batA: 0.85, droit: -0.15,
      plus: [...m19YeuxCote(head, 0.6, 0.45, 0.9),
        { name: 'palmeL', parent: 'legFL', p: [0, -0.07, 0.025], s: [0.05, 0.01, 0.06], o: [0, 0, 0], col: rgbf('#e88a30'), tex: TL.plain },
        { name: 'palmeR', parent: 'legFR', p: [0, -0.07, 0.025], s: [0.05, 0.01, 0.06], o: [0, 0, 0], col: rgbf('#e88a30'), tex: TL.plain }],
    });
  },
  // corneille noire (les corbeaux des champs) : bec fort, ailes longues repliées, la queue en éventail en vol
  crow: () => {
    const noir = rgbf('#18181c'), body = [0.105, 0.11, 0.23], head = [0.072, 0.078, 0.088];
    return e1Oiseau({
      body, bodyY: 0.155, dos: noir, bodyTex: TL.m19Plumes, head, headCol: noir, face: TL.crowF, beak: [0.022, 0.022, 0.056], beakCol: rgbf('#121214'), beakY: 0.4,
      neck: [0.06, 0.04, 0.06], neckR: [0.2, 0, 0], tail: [0.08, 0.014, 0.16], tailCol: rgbf('#141418'), wing: [0.36, 0.015, 0.15], wingCol: rgbf('#1c1c22'), wingTip: rgbf('#101014'),
      pliCol: rgbf('#1e1e24'), pliL: 1.1, leg: [0.013, 0.06], legCol: rgbf('#141214'), cuisses: noir, droit: -0.22, batF: 9, batA: 0.7,
      plus: [...e1Yeux(head, [0.2, 0.18, 0.16], 1.0, 0.6, 0.6)],
    });
  },
  // petits passereaux (quatre robes) : ventre plus clair, une barre sur l'aile
  songbird: (v) => {
    const robes = [['#7a5a40', '#d8c4a4', '#4a3424'], ['#4a5a8a', '#e8d8b8', '#2a3450'], ['#a8902a', '#f0e070', '#5a4a1c'], ['#7a746c', '#d8d2c8', '#4a4640']], [d, b, a] = robes[(v || 0) % 4];
    const body = [0.075, 0.075, 0.14], head = [0.055, 0.055, 0.058];
    return e1Oiseau({
      body, bodyY: 0.08, dos: rgbf(d), bodyTex: TL.m19Plumes, ventre: rgbf(b), ventreS: 0.65, head, headCol: rgbf(d), beak: [0.012, 0.012, 0.02], beakCol: rgbf('#3a3028'),
      tail: [0.045, 0.01, 0.075], tailCol: rgbf(a), tailUp: 0.2, wing: [0.17, 0.008, 0.065], wingCol: rgbf(d), wingTip: rgbf(a), pliCol: rgbf(a), pliL: 0.9,
      leg: [0.008, 0.036], legCol: rgbf('#8a6a5a'), batF: 20, batA: 0.9,
      plus: [{ name: 'barre', parent: 'body', p: [0, body[1] * 0.18, 0], s: [body[0] * 1.12, body[1] * 0.12, body[2] * 0.4], o: [0, 0, 0], col: rgbf(b), tex: TL.plain },
        ...e1Yeux(head, [0.12, 0.1, 0.08], 1.0, 0.62, 0.6)],
    });
  },
});
// les oiseaux sauvages d'avant (une boîte, deux planches pour ailes, deux bâtons) refaits avec les mêmes corps
Object.assign(ANIMAL_RIGS, {
  // héron cendré : dos gris, cou blanc strié de noir, sourcil et huppe noirs, long bec jaune, rémiges noires
  heron: () => {
    const gris = rgbf('#8e949c'), clair = rgbf('#e4e8ec'), noir = rgbf('#24262a'), body = [0.2, 0.22, 0.4], head = [0.075, 0.08, 0.11];
    return e1Oiseau({
      body, bodyY: 0.72, dos: gris, bodyTex: TL.m19Plumes, ventre: rgbf('#c8ccd2'), ventreTex: TL.m19Plumes, ventreS: 0.6, head, headCol: clair, face: TL.fur,
      neck: [0.05, 0.36, 0.05], neckR: [0.35, 0, 0], neckCol: clair, beak: [0.026, 0.026, 0.19], beakCol: rgbf('#d8b030'), beakY: 0.4,
      tail: [0.12, 0.03, 0.1], tailCol: gris, tailUp: -0.15, wing: [0.75, 0.018, 0.3], wingCol: gris, wingTip: noir, dessous: rgbf('#9aa0a8'),
      pliCol: rgbf('#7e848c'), pliL: 1.0, leg: [0.022, 0.6], legCol: rgbf('#9a8a5a'), batF: 4, batA: 0.5,
      plus: [...e1Yeux(head, [0.95, 0.85, 0.2], 0.9, 0.62, 0.6),
        { name: 'sourcil', parent: 'head', p: [0, head[1] * 0.8, -0.004], s: [head[0] * 1.06, head[1] * 0.18, head[2] * 0.72], col: noir, tex: TL.plain },
        { name: 'huppe', parent: 'head', p: [0, head[1] * 0.8, -head[2] * 0.28], s: [0.012, 0.01, 0.13], o: [0, 0, -0.06], col: noir, tex: TL.plain, r0: [-0.25, 0, 0] },
        { name: 'strie', parent: 'neckB', p: [0, 0.05, 0.026], s: [0.014, 0.24, 0.004], o: [0, 0.1, 0], col: noir, tex: TL.plain }],
    });
  },
  // cigogne blanche : toute blanche, le bout et l'arrière des ailes noirs, bec et pattes rouges
  stork: () => {
    const blanc = rgbf('#f2f2ee'), noir = rgbf('#1c1c20'), rouge = rgbf('#d04020'), body = [0.22, 0.24, 0.42], head = [0.08, 0.085, 0.11];
    return e1Oiseau({
      body, bodyY: 0.75, dos: blanc, bodyTex: TL.m19Plumes, ventre: rgbf('#ececea'), ventreTex: TL.m19Plumes, ventreS: 0.6, head, headCol: blanc, face: TL.fur,
      neck: [0.06, 0.3, 0.06], neckR: [0.2, 0, 0], beak: [0.03, 0.032, 0.22], beakCol: rouge, beakY: 0.4,
      tail: [0.14, 0.03, 0.1], tailCol: blanc, wing: [0.8, 0.02, 0.32], wingCol: blanc, wingTip: noir, dessous: blanc, pliCol: blanc, pliTip: noir, pliL: 1.0,
      leg: [0.026, 0.62], legCol: rouge, batF: 3.5, batA: 0.45,
      plus: [...e1Yeux(head, [0.12, 0.1, 0.08], 0.8, 0.62, 0.6)],
    });
  },
  // cygne : grand corps bas, le dos relevé par les ailes, long cou, bec orange à la base noire
  swan: () => {
    const blanc = rgbf('#f6f6f2'), body = [0.32, 0.24, 0.62], head = [0.08, 0.085, 0.12];
    return e1Oiseau({
      body, bodyY: 0.14, dos: blanc, bodyTex: TL.m19Plumes, ventre: rgbf('#eeeeea'), ventreTex: TL.m19Plumes, ventreS: 0.7, head, headCol: blanc, face: TL.fur,
      neck: [0.07, 0.42, 0.07], neckR: [-0.1, 0, 0], beak: [0.045, 0.03, 0.1], beakCol: rgbf('#e87a20'), beakY: 0.35, cire: rgbf('#1a1a1a'),
      tail: [0.16, 0.06, 0.12], tailUp: 0.25, tailCol: blanc, wing: [1.0, 0.024, 0.36], wingCol: blanc, dessous: rgbf('#ecece8'), pliCol: rgbf('#f0f0ea'), pliL: 0.9,
      leg: [0.02, 0.02], legCol: rgbf('#2a2a2a'), batF: 3, batA: 0.4,
      plus: [...e1Yeux(head, [0.1, 0.08, 0.06], 0.7, 0.62, 0.55),
        { name: 'dosArque', parent: 'body', p: [0, body[1] * 0.42, -body[2] * 0.08], s: [body[0] * 0.75, body[1] * 0.3, body[2] * 0.6], col: blanc, tex: TL.m19Plumes }],
    });
  },
  // faisan (le coq) : cuivré, tête vert sombre, caroncules rouges, collier blanc, aigrettes, très longue queue barrée
  pheasant: () => {
    const vert = rgbf('#1e4a3a'), rouge = rgbf('#d02a20'), body = [0.16, 0.16, 0.3], head = [0.07, 0.08, 0.085];
    return e1Oiseau({
      body, bodyY: 0.24, dos: rgbf('#a0522a'), bodyTex: TL.m19Plumes, ventre: rgbf('#6a321a'), ventreTex: TL.m19Plumes, ventreS: 0.6, head, headCol: vert, face: TL.fur,
      neck: [0.055, 0.07, 0.055], neckR: [0.25, 0, 0], neckCol: vert, beak: [0.022, 0.02, 0.03], beakCol: rgbf('#d8c8a0'), beakY: 0.42,
      tail: [0.05, 0.02, 0.46], tailCol: rgbf('#9a7a50'), tailUp: 0.22, bande: rgbf('#3a2a1c'), wing: [0.34, 0.014, 0.16], wingCol: rgbf('#b8946a'), wingTip: rgbf('#6a5a44'),
      pliCol: rgbf('#b8946a'), pliL: 0.85, leg: [0.018, 0.12], legCol: rgbf('#8a8a80'), batF: 14, batA: 0.85,
      plus: [
        { name: 'caronculeL', parent: 'head', p: [-head[0] / 2 - 0.0005, head[1] * 0.5, head[2] * 0.45], s: [0.003, head[1] * 0.42, head[2] * 0.42], col: rouge, tex: TL.plain },
        { name: 'caronculeR', parent: 'head', p: [head[0] / 2 + 0.0005, head[1] * 0.5, head[2] * 0.45], s: [0.003, head[1] * 0.42, head[2] * 0.42], col: rouge, tex: TL.plain },
        ...m19YeuxCote(head, 0.6, 0.45, 0.9, [1, 0.92, 0.6]),
        { name: 'collier', parent: 'neckB', p: [0, 0.004, 0], s: [0.062, 0.016, 0.062], col: [0.96, 0.96, 0.94], tex: TL.plain },
        { name: 'aigretteL', parent: 'head', p: [-head[0] * 0.3, head[1], -head[2] * 0.1], s: [0.012, 0.03, 0.012], o: [0, 0.012, 0], col: vert, tex: TL.fur, r0: [-0.4, 0, 0.2] },
        { name: 'aigretteR', parent: 'head', p: [head[0] * 0.3, head[1], -head[2] * 0.1], s: [0.012, 0.03, 0.012], o: [0, 0.012, 0], col: vert, tex: TL.fur, r0: [-0.4, 0, -0.2] }],
    });
  },
  // perdrix grise : dos brun, poitrine grise, face orangée, le fer à cheval marron, queue rousse
  partridge: () => {
    const body = [0.14, 0.13, 0.2], head = [0.062, 0.065, 0.07];
    return e1Oiseau({
      body, bodyY: 0.14, dos: rgbf('#7a6a56'), bodyTex: TL.m19Plumes, ventre: rgbf('#8a8478'), ventreTex: TL.m19Plumes, ventreS: 0.7, head, headCol: rgbf('#c8783a'), face: TL.fur,
      beak: [0.018, 0.016, 0.022], beakCol: rgbf('#6a6a60'), beakY: 0.42, tail: [0.07, 0.016, 0.05], tailCol: rgbf('#a8582a'), tailUp: 0.1,
      wing: [0.22, 0.012, 0.11], wingCol: rgbf('#7a6a56'), wingTip: rgbf('#5a4e40'), pliCol: rgbf('#86745c'), pliL: 0.85, leg: [0.014, 0.07], legCol: rgbf('#c89070'), batF: 20, batA: 0.9,
      plus: [...m19YeuxCote(head, 0.62, 0.45, 1.0, [0.9, 0.8, 0.6]),
        { name: 'fer', parent: 'body', p: [0, -body[1] * 0.12, body[2] * 0.47], s: [body[0] * 0.5, body[1] * 0.3, 0.012], col: rgbf('#5a2a1a'), tex: TL.plain },
        ...e1Taches('body', 6, body[0], body[1], body[2], rgbf('#4a3a2a'), 71)],
    });
  },
  // chouette hulotte : grosse tête ronde, disque facial clair, yeux noirs, sourcils pâles, ventre strié, posée droite
  owl: () => {
    const brun = rgbf('#8a6a48'), body = [0.2, 0.28, 0.19], head = [0.18, 0.15, 0.15];
    return e1Oiseau({
      body, bodyY: 0.2, dos: brun, bodyTex: TL.m19Plumes, ventre: rgbf('#c8aa84'), ventreTex: TL.stripes, ventreS: 0.75, head, headCol: rgbf('#9a7a58'), headTex: TL.m19Plumes, face: TL.catF,
      beak: [0.022, 0.026, 0.018], beakCol: rgbf('#d8c8a0'), beakY: 0.32, tail: [0.1, 0.014, 0.07], tailCol: brun, tailUp: 0.4,
      wing: [0.5, 0.016, 0.22], wingCol: brun, dessous: rgbf('#d8c4a4'), pliCol: rgbf('#7a5c3e'), leg: [0.025, 0.05], legCol: rgbf('#c8b090'), chouette: true, batF: 6, batA: 0.6,
      plus: [{ name: 'disque', parent: 'head', p: [0, head[1] * 0.45, head[2] * 0.7 + 0.001], s: [head[0] * 0.9, head[1] * 0.72, 0.004], col: rgbf('#b8946a'), tex: TL.fur },
        ...e1Yeux(head, [0.08, 0.06, 0.05], 1.5, 0.5, 0.55, head[0] * 0.22),
        { name: 'sourcils', parent: 'head', p: [0, head[1] * 0.74, head[2] * 0.7 + 0.004], s: [head[0] * 0.8, head[1] * 0.1, 0.006], col: rgbf('#e8dcc4'), tex: TL.plain },
        ...e1Taches('body', 8, body[0], body[1], body[2], [0.95, 0.9, 0.8], 81)],
    });
  },
  // pie bavarde : noire à reflets bleus, ventre et épaules blancs, longue queue verdâtre, le bout des ailes blanc en vol
  magpie: () => {
    const blanc = rgbf('#f2f2ee'), body = [0.11, 0.12, 0.22], head = [0.075, 0.078, 0.085];
    return e1Oiseau({
      body, bodyY: 0.16, dos: rgbf('#16181e'), bodyTex: TL.m19Plumes, ventre: blanc, ventreS: 0.55, head, headCol: rgbf('#16181e'), face: TL.crowF, beak: [0.02, 0.02, 0.045], beakCol: rgbf('#121214'), beakY: 0.42,
      tail: [0.05, 0.014, 0.3], tailCol: rgbf('#1a2a3a'), tailUp: 0.2, wing: [0.26, 0.012, 0.12], wingCol: rgbf('#1a2030'), wingTip: blanc, dessous: rgbf('#2a2e36'),
      pliCol: rgbf('#1a2030'), pliL: 0.9, leg: [0.012, 0.075], legCol: rgbf('#141416'), batF: 13, batA: 0.8,
      plus: [...e1Yeux(head, [0.12, 0.1, 0.1], 1.0, 0.6, 0.6),
        { name: 'epauleL', parent: 'pliL', p: [-0.009, body[1] * 0.1, -body[2] * 0.06], s: [0.004, body[1] * 0.3, body[2] * 0.42], col: blanc, tex: TL.plain },
        { name: 'epauleR', parent: 'pliR', p: [0.009, body[1] * 0.1, -body[2] * 0.06], s: [0.004, body[1] * 0.3, body[2] * 0.42], col: blanc, tex: TL.plain }],
    });
  },
});
// (le pigeon des villes : 10-zzfauna2.js, avec les mêmes corps d'oiseau)
