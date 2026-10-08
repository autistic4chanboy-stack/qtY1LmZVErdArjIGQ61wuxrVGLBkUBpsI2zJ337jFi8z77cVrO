// ============================================================================
//  LE CHÂTEAU DES HAUTS — HAUTGUET (agent V4, quatorzième vague) — matières et modèles
//  Deux matières (le jeu en a 64 au plus ; deux par agent V) :
//   - la pierre du château : un grand appareil gris clair, des coulures sombres, des
//     trous de boulin, du lichen (murs, tours, donjon) ;
//   - le dallage : de grandes dalles usées, des joints moussus (cours, salles, cryptes).
//  Les objets posés du château (v4_*) : herse, treuil, leviers, créneaux, tapisseries,
//  gisants, le Guet (le fanal du donjon), les morts assis, fissures, trappes, cloche…
//  Les modèles qui changent d'état lisent chateauV4 (11-zzzzV4-2-jeu.js), gardé.
// ============================================================================

// ---------------------------------------------------------------- matières
function texV4Pierre(seed) {
  const P = ramp(['#55514a', '#625d56', '#6f6a62', '#7c766d', '#898279', '#968e84', '#a39a8f', '#b0a69a']);
  const J = [38, 35, 32];
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed), rnd = mulberry32(seed + 3);
  // des assises de 16 px ; chaque assise coupée en pierres de 22 à 52 px (le compte boucle sur 128)
  const rows = [];
  for (let r = 0; r < 8; r++) {
    const cuts = [];
    let x = Math.floor(rnd() * 30);
    const x0 = x;
    while (x < x0 + TS - 20) { cuts.push(x % TS); x += 22 + Math.floor(rnd() * 31); }
    rows.push(cuts.sort((a, b) => a - b));
  }
  // coulures : une bande sombre qui descend depuis un rebord (colonnes tirées au hasard)
  const coul = new Float32Array(TS);
  for (let k = 0; k < 9; k++) { const c = Math.floor(rnd() * TS), w = 2 + Math.floor(rnd() * 5), f = 0.35 + rnd() * 0.5; for (let i = -w; i <= w; i++) coul[((c + i) % TS + TS) % TS] = Math.max(coul[((c + i) % TS + TS) % TS], f * (1 - Math.abs(i) / (w + 1))); }
  for (let y = 0; y < TS; y++) {
    const row = Math.floor(y / 16), ly = y % 16, cuts = rows[row];
    for (let x = 0; x < TS; x++) {
      let ci = 0;
      for (let i = 0; i < cuts.length; i++) if (cuts[i] <= x) ci = i + 1;
      const id = row * 16 + (ci % cuts.length);
      const onCut = cuts.includes(x);
      if (ly === 15 || onCut) { pb.set(x, y, (tn(x / 3, y / 3, 42.667) > 0.6) ? [26, 24, 22] : J); continue; }
      let v = 0.42 + (hash2i(id, 11, seed) - 0.5) * 0.36 + (tileFbm(tn, x / 9, y / 9, 14.222, 3) - 0.5) * 0.34;
      if (ly === 0 || cuts.includes((x - 1 + TS) % TS)) v += 0.1;
      if (ly === 14) v -= 0.12;
      // les coulures (plus fortes vers le bas de chaque pierre) et la suie
      v -= coul[x] * (0.18 + ly / 16 * 0.2) * (0.6 + tn(x / 2, y / 8, 64) * 0.6);
      if (tn(x / 4 + 7, y / 4, 32) > 0.83) v -= 0.16; // éclats
      let c = rampPick(P, v, x, y);
      // lichen pâle, par taches
      if (tileFbm(tn, x / 12 + 2.7, y / 12, 10.667, 2) > 0.74 && tn(x, y, 128) > 0.45) c = rampPick(ramp(['#6e7050', '#7f8258', '#8f9462']), tn(x / 2, y / 2, 64), x, y);
      pb.set(x, y, c);
    }
  }
  // des trous de boulin (une assise sur trois, de loin en loin)
  for (const [x, y] of [[18, 37], [82, 37], [50, 85], [114, 85], [30, 117]]) for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) pb.setW(x + i, y + j, i === 0 || j === 0 ? [30, 28, 26] : [14, 13, 12]);
  return pb;
}
function texV4Dalles(seed) {
  const P = ramp(['#4c4945', '#57534e', '#625e58', '#6d6862', '#78736c', '#847e76']);
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed), rnd = mulberry32(seed + 9);
  const H = [28, 22, 30, 24, 24]; // rangées (somme 128)
  let y0 = 0;
  for (let r = 0; r < H.length; r++) {
    const h = H[r], cuts = [];
    let x = Math.floor(rnd() * 24);
    const xs = x;
    while (x < xs + TS - 22) { cuts.push(x % TS); x += 24 + Math.floor(rnd() * 26); }
    cuts.sort((a, b) => a - b);
    for (let yy = 0; yy < h; yy++) {
      const y = y0 + yy;
      for (let xx = 0; xx < TS; xx++) {
        let ci = 0;
        for (let i = 0; i < cuts.length; i++) if (cuts[i] <= xx) ci = i + 1;
        const id = r * 32 + (ci % cuts.length);
        const joint = yy >= h - 2 || cuts.includes(xx) || cuts.includes((xx + 1) % TS);
        if (joint) {
          // joint : terre sombre, mousse par endroits
          const m = tn(xx / 3, y / 3, 42.667);
          pb.set(xx, y, m > 0.62 ? rampPick(ramp(['#2a3420', '#36442a']), m, xx, y) : [34, 32, 29]);
          continue;
        }
        // la dalle : plus claire au milieu (usée), des fissures, des taches
        let v = 0.38 + (hash2i(id, 21, seed) - 0.5) * 0.3 + (tileFbm(tn, xx / 7, y / 7, 18.286, 3) - 0.5) * 0.3;
        if (yy === 0) v += 0.08;
        if (tn(xx / 5 + 3, y / 5, 25.6) > 0.8) v -= 0.18;
        pb.set(xx, y, rampPick(P, v, xx, y));
      }
    }
    y0 += h;
  }
  // fissures
  for (let k = 0; k < 7; k++) {
    let x = rnd() * TS, y = rnd() * TS;
    for (let s = 0; s < 12; s++) { pb.setW(x, y, [30, 28, 26]); x += rnd() * 2 - 1; y += rnd() < 0.6 ? 1 : 0; }
  }
  return pb;
}
const M_V4_PIERRE = MATERIALS.push({ id: 'v4_pierre', name: 'Pierre du château', scale: 3.5, gen: () => texV4Pierre(1441) }) - 1;
const M_V4_DALLES = MATERIALS.push({ id: 'v4_dalles', name: 'Dallage', terrain: true, scale: 3.5, gen: () => texV4Dalles(1442) }) - 1;
TERRAIN_MATS.push(M_V4_DALLES);
BLOCK_MATS.push(M_V4_PIERRE, M_V4_DALLES);

// ---------------------------------------------------------------- couleurs
const V4C = {
  pierre: [0.78, 0.76, 0.72], fer: rgbf('#3e3f44'), ferNoir: rgbf('#2a2a2e'), rouille: rgbf('#6a4a36'), bois: rgbf('#6a5038'), boisNoir: rgbf('#3e3024'),
  os: [0.84, 0.8, 0.7], cuir: rgbf('#4a3626'), drap: rgbf('#5a3a3a'), drap2: rgbf('#3e4a5a'), or: rgbf('#a8873a'), cire: [0.92, 0.9, 0.82],
  flamme: [1.45, 0.92, 0.42], braise: [1.3, 0.5, 0.18], noir: [0.03, 0.03, 0.03], bronze: rgbf('#7a6236'), corde: rgbf('#8a7450'),
};
const v4St = () => (typeof chateauV4 !== 'undefined' ? chateauV4 : null);

// ---------------------------------------------------------------- objets posés
Object.assign(PROP_MODELS, {
  // la herse (data.w, data.h ; data.id : son treuil ; levée selon l'état : chateauV4.herse(o) → 0..1)
  v4_herse(E, o) {
    const W = (o.data && o.data.w) || 4, H = (o.data && o.data.h) || 4.5, S = v4St(), k = S ? S.herseK(o) : 0;
    const y0 = k * (H - 0.4);
    for (let x = -W / 2 + 0.15; x < W / 2; x += 0.32) { E.bx(x, y0, 0, 0.08, H, 0.08, V4C.ferNoir, TL.iron); E.bx(x, y0 - 0.22, 0, 0.05, 0.22, 0.05, V4C.fer, TL.iron); }
    for (let y = 0.35; y < H; y += 0.62) E.bx(0, y0 + y, 0.02, W, 0.07, 0.1, V4C.fer, TL.iron);
  },
  // le treuil du pont-levis : un tambour sur deux chevalets, quatre bras, les chaînes qui partent vers le mur
  v4_treuil(E, o) {
    const S = v4St(), k = S ? S.treuilK(o) : 0;
    for (const s of [-1.2, 1.2]) {
      E.box(s, 0.75, -0.35, 0.16, 1.6, 0.16, V4C.bois, TL.darkwood, 0, -0.35);
      E.box(s, 0.75, 0.35, 0.16, 1.6, 0.16, V4C.bois, TL.darkwood, 0, 0.35);
      E.bx(s, 0, 0, 0.18, 0.12, 1.3, V4C.boisNoir, TL.darkwood);
    }
    const a = k * 9;
    E.box(0, 1.35, 0, 2.2, 0.62, 0.62, V4C.bois, TL.wood, 0, a);
    E.box(0, 1.35, 0, 2.2, 0.62, 0.62, V4C.bois, TL.wood, 0, a + Math.PI / 4);
    for (let i = 0; i < 4; i++) { const b = a + i * Math.PI / 2; E.box(-1.42, 1.35 + Math.sin(b) * 0.55, Math.cos(b) * 0.55, 0.1, 0.1, 1.1, V4C.boisNoir, TL.darkwood, 0, b); }
    E.box(0, 1.35, 0, 2.4, 0.12, 0.12, V4C.fer, TL.iron, 0, 0, Math.PI / 2);
    // les chaînes enroulées, puis tendues vers le mur (-z)
    E.bx(-0.5, 1.02, -0.05, 0.24, 0.66, 0.7, V4C.ferNoir, TL.iron); E.bx(0.5, 1.02, -0.05, 0.24, 0.66, 0.7, V4C.ferNoir, TL.iron);
    for (const x of [-0.5, 0.5]) E.box(x, 2.1, -1.4, 0.07, 0.07, 3.0, V4C.ferNoir, TL.iron, 0, -0.5);
  },
  // un levier de fer dans son support, une chaîne qui monte (data.on : abaissé)
  v4_levier(E, o) {
    const S = v4St(), on = S ? S.levierOn(o) : !!(o.data && o.data.on);
    E.bx(0, 0, 0, 0.5, 0.5, 0.4, V4C.pierre, mt(M_V4_PIERRE));
    E.bx(0, 0.5, 0, 0.36, 0.16, 0.24, V4C.fer, TL.iron);
    E.box(0, 0.95, on ? 0.25 : -0.25, 0.07, 1.0, 0.07, V4C.ferNoir, TL.iron, 0, on ? 0.6 : -0.6);
    E.box(0, 1.45, on ? 0.53 : -0.53, 0.12, 0.12, 0.12, V4C.rouille, TL.iron);
    for (let k = 0; k < 6; k++) E.box(0, 0.7 + k * 0.4, -0.18, k % 2 ? 0.04 : 0.07, 0.36, k % 2 ? 0.07 : 0.04, V4C.ferNoir, TL.iron);
  },
  // des merlons le long de l'axe x local (data.L longueur, data.h hauteur, data.e épaisseur, data.p pas)
  v4_creneaux(E, o) {
    const d = o.data || {}, L = d.L || 10, h = d.h || 1.0, e = d.e || 0.7, p = d.p || 2.2, w = d.w || 1.2;
    const n = Math.max(1, Math.round(L / p)), pas = L / n;
    for (let i = 0; i < n; i++) {
      const x = -L / 2 + pas * (i + 0.5);
      if (d.trous && hash2i(Math.round(o.x + x * 3), Math.round(o.z), 7) < d.trous) continue; // merlons tombés
      E.bx(x, 0, 0, Math.min(w, pas - 0.4), h, e, V4C.pierre, mt(M_V4_PIERRE));
    }
  },
  // une tapisserie usée sur un mur (le +z regarde la salle) ; data.v : le motif ; data.w, data.h
  v4_tapisserie(E, o) {
    const d = o.data || {}, W = d.w || 2.2, H = d.h || 3, v = d.v || 0;
    const fond = [[0.36, 0.2, 0.18], [0.2, 0.24, 0.3], [0.3, 0.28, 0.18]][v % 3];
    E.bx(0, H + 0.05, 0.05, W + 0.3, 0.08, 0.08, V4C.boisNoir, TL.darkwood);
    E.bx(0, 0.12, 0.03, W, H - 0.1, 0.03, fond, TL.plaid);
    E.bx(0, 0.4, 0.05, W - 0.3, H - 0.7, 0.01, v4Mix(fond, [0.65, 0.58, 0.42], 0.35), TL.blanket);
    // le motif : un arbre, une tour, une bête ailée
    const c = [0.55, 0.48, 0.32];
    if (v % 3 === 0) { E.bx(0, 0.6, 0.065, 0.16, 1.2, 0.01, c, TL.plain); E.bx(0, 1.7, 0.065, 1.0, 0.7, 0.01, [0.4, 0.42, 0.3], TL.plain); }
    else if (v % 3 === 1) { E.bx(0, 0.6, 0.065, 0.5, 1.5, 0.01, c, TL.plain); E.bx(0, 2.1, 0.065, 0.7, 0.2, 0.01, c, TL.plain); E.bx(0.55, 1.7, 0.065, 0.5, 0.18, 0.01, [0.6, 0.25, 0.15], TL.plain); }
    else { E.box(0, 1.6, 0.065, 1.3, 0.16, 0.01, [0.25, 0.22, 0.2], TL.plain, 0, 0, 0.25); E.box(0, 1.5, 0.065, 1.2, 0.14, 0.01, [0.25, 0.22, 0.2], TL.plain, 0, 0, -0.3); E.bx(0, 1.4, 0.065, 0.3, 0.3, 0.01, [0.25, 0.22, 0.2], TL.plain); }
    // un coin arraché
    E.box(W / 2 - 0.25, 0.3, 0.07, 0.5, 0.5, 0.01, [0.06, 0.06, 0.06], TL.plain, 0, 0, 0.6);
  },
  // un gisant sur son tombeau (data.v : 0 un chevalier, 1 une dame, 2 vide — la dalle seule, gravée)
  v4_gisant(E, o) {
    const v = (o.data && o.data.v) || 0;
    E.bx(0, 0, 0, 1.2, 0.85, 2.4, V4C.pierre, mt(M_V4_PIERRE));
    E.bx(0, 0.85, 0, 1.3, 0.12, 2.5, [0.82, 0.8, 0.76], mt(M_V4_DALLES));
    if (v === 2) { for (let k = 0; k < 4; k++) E.bx(0, 0.97, -0.6 + k * 0.3, 0.6 - (k % 2) * 0.2, 0.01, 0.04, [0.15, 0.15, 0.14], TL.plain); return; }
    const c = [0.74, 0.72, 0.68], y = 0.97;
    E.bx(0, y, 0.45, 0.5, 0.2, 1.3, c, TL.stone);       // le corps
    E.bx(0, y, -0.45, 0.42, 0.22, 0.6, c, TL.stone);    // le buste
    E.bx(0, y, -0.95, 0.26, 0.24, 0.28, c, TL.stone);   // la tête
    E.bx(0, y, -1.12, 0.5, 0.1, 0.18, c, TL.stone);     // le coussin
    if (v === 0) { E.bx(0, y + 0.2, 0.1, 0.12, 0.06, 1.3, [0.68, 0.66, 0.62], TL.stone); E.bx(0, y + 0.2, -0.45, 0.4, 0.06, 0.1, [0.68, 0.66, 0.62], TL.stone); }
    else E.bx(0, y + 0.2, -0.35, 0.3, 0.08, 0.2, [0.7, 0.68, 0.64], TL.stone);
    E.bx(0, y, 1.15, 0.3, 0.26, 0.2, c, TL.stone);       // le chien aux pieds
  },
  // le Guet : le grand fanal du donjon, une corbeille de fer sur un fût (DYN quand il brûle : v4_guet_feu)
  v4_guet(E, o, t) { v4Guet(E, o, t, false); },
  v4_guet_feu(E, o, t) { v4Guet(E, o, t, true); },
  // un mort : des os dans des habits, assis, couché, à genoux ou adossé (data.pose, data.look)
  v4_mort(E, o) {
    if (typeof depouilles === 'undefined' || !depouilles.squelette) { PROP_MODELS.squelette(E, o); return; }
    if (!o.rig) {
      const d = o.data || {};
      try { o.rig = depouilles.squelette(Object.assign({ skin: '#cfc6b0', hair: '#5a4a3a', top: '#5a4a3e', bottom: '#3e3630', shoe: '#2a2018' }, d.look || {})); } catch (e) { o.rig = null; }
      if (!o.rig) { PROP_MODELS.squelette(E, o); return; }
      const p = d.pose || 'assis';
      poseHuman(o.rig, { sit: p === 'assis' || p === 'adosse', pray: p === 'prie', lean: p === 'assis' ? 0.55 : p === 'prie' ? 0.35 : p === 'adosse' ? -0.15 : 0, lookP: p === 'adosse' ? 0.35 : 0.6, tilt: p === 'adosse' ? 0.4 : 0.15 });
      if (p === 'prie') { o.rig.set('legL', -1.6, 0, 0); o.rig.set('legR', -1.6, 0, 0); o.rig.part('hips').p[1] = 0.5; }
      if (p === 'adosse') { o.rig.set('armL', -0.2, 0, 0.5); o.rig.set('armR', -0.3, 0, -0.4); }
      if (p === 'assis') { o.rig.set('armL', -0.9, 0, 0.15); o.rig.set('armR', -0.6, 0, -0.1); }
    }
    const d = o.data || {}, dy = d.pose === 'assis' ? (d.dy ?? 0.05) : d.pose === 'prie' ? -0.3 : d.pose === 'adosse' ? -0.42 : 0;
    drawRig(E.buf, o.rig, o.x, o.y + dy, o.z, o.r, 1);
  },
  // une fissure sur un mur (le +z regarde dehors du mur) : on la voit si on regarde bien (data.mur : le mur creux ;
  // tombé, il ne reste que les pierres au pied)
  v4_fissure(E, o) {
    const S = v4St(), id = o.data && o.data.mur, tombe = !!(S && id && S.murTombe && S.murTombe(id));
    const c = [0.08, 0.075, 0.07];
    const P = [[0, 0.2, 0.05, 0.5, 0.2], [0.06, 0.65, 0.04, 0.45, -0.35], [-0.04, 1.05, 0.04, 0.4, 0.3], [0.08, 1.42, 0.035, 0.38, -0.25], [0.02, 1.78, 0.03, 0.3, 0.15]];
    if (!tombe) for (const [x, y, w, h, a] of P) E.box(x, y, 0.012, w, h, 0.012, c, TL.plain, 0, 0, a);
    E.bx(0.2, 0, 0.12, 0.22, 0.14, 0.18, [0.6, 0.58, 0.55], mt(M_V4_PIERRE)); E.bx(-0.15, 0, 0.18, 0.14, 0.1, 0.14, [0.6, 0.58, 0.55], mt(M_V4_PIERRE));
    if (tombe) { E.box(0.45, 0.08, 0.3, 0.32, 0.16, 0.26, [0.6, 0.58, 0.55], mt(M_V4_PIERRE), 0.6); E.box(-0.4, 0.06, 0.42, 0.26, 0.12, 0.22, [0.6, 0.58, 0.55], mt(M_V4_PIERRE), -0.4); E.box(0.05, 0.07, 0.55, 0.3, 0.14, 0.2, [0.6, 0.58, 0.55], mt(M_V4_PIERRE), 1.1); }
  },
  // une trappe de chêne dans un plancher (data.open), un anneau ; une corde pend quand elle est ouverte (data.corde)
  v4_trappe(E, o) {
    const S = v4St(), open = S ? S.trappeOuverte(o) : !!(o.data && o.data.open);
    if (open) {
      E.box(0, 0.75, -0.75, 1.5, 1.5, 0.08, V4C.bois, TL.wood, 0, 0, 0);
      E.bx(0, -0.04, 0, 1.4, 0.03, 1.4, V4C.noir, TL.plain);
      if (o.data && o.data.corde) { E.bx(0.45, -6, 0.45, 0.05, 6.05, 0.05, V4C.corde, TL.rope); E.bx(0.45, 0, 0.45, 0.16, 0.06, 0.16, V4C.ferNoir, TL.iron); }
    } else {
      E.bx(0, 0, 0, 1.5, 0.08, 1.5, V4C.bois, TL.wood);
      for (const x of [-0.45, 0.45]) E.bx(x, 0.08, 0, 0.1, 0.02, 1.4, V4C.ferNoir, TL.iron);
      E.bx(0, 0.08, 0.5, 0.18, 0.03, 0.18, V4C.fer, TL.iron);
    }
  },
  // la bouche du conduit des latrines, au pied du mur (le +z regarde dehors)
  v4_conduit(E) {
    E.bx(0, 0, 0.02, 0.9, 1.1, 0.04, V4C.noir, TL.plain);
    E.bx(0, 1.1, 0.12, 1.2, 0.25, 0.3, V4C.pierre, mt(M_V4_PIERRE));
    E.bx(0, 0, 0.4, 1.3, 0.04, 0.9, rgbf('#3a3424'), TL.soil);
    for (const x of [-0.3, 0, 0.3]) E.bx(x, 0.2, 0.05, 0.05, 0.9, 0.05, V4C.rouille, TL.iron);
  },
  // une grille de fer dans le sol ou une voûte (data.ouverte : levée)
  v4_grille_sol(E, o) {
    const ouv = v4St() ? v4St().grilleOuverte(o) : false;
    if (ouv) { E.box(0, 0.65, -0.65, 1.3, 1.3, 0.06, V4C.fer, TL.iron); E.bx(0, -0.02, 0, 1.2, 0.02, 1.2, V4C.noir, TL.plain); return; }
    for (let k = -2; k <= 2; k++) { E.bx(k * 0.26, 0, 0, 0.06, 0.06, 1.3, V4C.fer, TL.iron); E.bx(0, 0, k * 0.26, 1.3, 0.06, 0.06, V4C.fer, TL.iron); }
    E.bx(0, -0.03, 0, 1.2, 0.02, 1.2, V4C.noir, TL.plain);
  },
  // la cloche de la chapelle, pendue à sa poutre, la corde qui descend (data.c : longueur de corde)
  v4_cloche(E, o, t) {
    const S = v4St(), a = S ? S.clocheA(t) : 0, L = (o.data && o.data.c) || 0;
    E.bx(0, 2.2, 0, 2.4, 0.3, 0.3, V4C.boisNoir, TL.darkwood);
    E.box(0, 1.55 - Math.abs(a) * 0.05, Math.sin(a) * 0.25, 0.95, 0.85, 0.95, V4C.bronze, TL.gold, 0, a);
    E.box(0, 1.95, Math.sin(a) * 0.1, 0.55, 0.3, 0.55, V4C.bronze, TL.gold, 0, a);
    if (L > 0) E.bx(0.3, 2.2 - L, 0, 0.04, L, 0.04, V4C.corde, TL.rope);
  },
  // le siège du sire, au dos très haut (tourné vers le mur, dit-on)
  v4_trone(E) {
    E.bx(0, 0, 0, 0.9, 0.5, 0.75, V4C.boisNoir, TL.darkwood);
    E.bx(0, 0.5, 0, 0.84, 0.08, 0.7, V4C.drap, TL.cloth);
    E.bx(0, 0.5, -0.33, 0.9, 1.9, 0.12, V4C.boisNoir, TL.darkwood);
    E.bx(0, 2.4, -0.33, 0.5, 0.25, 0.12, V4C.boisNoir, TL.darkwood);
    for (const s of [-0.42, 0.42]) E.bx(s, 0.5, 0, 0.08, 0.45, 0.7, V4C.boisNoir, TL.darkwood);
  },
  // des os en tas contre le pont, des souliers, une poupée de chiffon
  v4_os_tas(E, o) {
    const r = (k) => hash2i(Math.round(o.x * 7) + k, Math.round(o.z * 7), 33);
    for (let k = 0; k < 9; k++) E.box((r(k) - 0.5) * 1.6, 0.05 + r(k + 20) * 0.25, (r(k + 40) - 0.5) * 1.0, 0.45, 0.06, 0.07, V4C.os, TL.bone, r(k + 60) * 3);
    for (let k = 0; k < 3; k++) E.bx((r(k + 80) - 0.5) * 1.4, 0, (r(k + 90) - 0.5) * 0.8, 0.2, 0.2, 0.2, V4C.os, TL.bone);
    E.bx(0.55, 0, 0.3, 0.12, 0.1, 0.28, V4C.cuir, TL.leather, 0.4); E.bx(0.7, 0, 0.2, 0.12, 0.1, 0.28, V4C.cuir, TL.leather, 0.7);
    if (o.data && o.data.poupee) { E.box(-0.5, 0.06, 0.35, 0.16, 0.1, 0.22, rgbf('#7a3a4a'), TL.cloth, 0.3); E.box(-0.5, 0.08, 0.2, 0.12, 0.1, 0.1, WHITE, tx(TL.skin, TL.doll), 0.3); }
  },
  // une bannière déchirée pendue à sa hampe (le +z regarde la salle ; data.h)
  v4_banniere(E, o) {
    const h = (o.data && o.data.h) || 3.5;
    E.bx(0, h, 0.08, 1.4, 0.07, 0.07, V4C.boisNoir, TL.darkwood);
    E.bx(-0.3, h - 2.4, 0.05, 0.55, 2.35, 0.02, rgbf('#4a2a2a'), TL.cloth);
    E.bx(0.3, h - 1.9, 0.05, 0.55, 1.85, 0.02, rgbf('#4a2a2a'), TL.cloth);
    E.bx(0, h - 1.2, 0.065, 0.3, 0.4, 0.01, rgbf('#8a7a4a'), TL.plain);
  },
  // une roue de fer pendue, de vieilles chandelles (data.lit)
  v4_lustre(E, o, t) {
    const lit = !!(o.data && o.data.lit), H = (o.data && o.data.h) || 2.5;
    E.bx(0, -H, 0, 0.03, H, 0.03, V4C.ferNoir, TL.iron);
    for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; E.box(Math.cos(a) * 0.6, -H, Math.sin(a) * 0.6, 0.66, 0.05, 0.05, V4C.ferNoir, TL.iron, -a + Math.PI / 2); E.bx(Math.cos(a) * 0.6, -H + 0.03, Math.sin(a) * 0.6, 0.06, 0.12, 0.06, V4C.cire, TL.plain); }
    if (lit) { E.fl = FX_EMIT; for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; E.bx(Math.cos(a) * 0.6, -H + 0.15, Math.sin(a) * 0.6, 0.03, 0.05 + (t ? Math.sin(t.t * 11 + k) * 0.01 : 0), 0.03, V4C.flamme, TL.flame); } E.fl = 0; }
  },
  // une échelle : debout (data.h) ou couchée sur le sol (data.couchee), comme on l'a tirée d'en haut
  v4_echelle(E, o) {
    const d = o.data || {}, S = v4St(), couchee = S ? S.echelleCouchee(o) : !!d.couchee, h = d.h || 6;
    if (couchee) {
      for (const s of [-0.28, 0.28]) E.bx(s, 0.04, h / 2, 0.08, 0.08, h, V4C.bois, TL.wood);
      for (let z = 0.3; z < h; z += 0.4) E.bx(0, 0.08, z, 0.56, 0.05, 0.05, V4C.boisNoir, TL.darkwood);
      return;
    }
    for (const s of [-0.28, 0.28]) E.bx(s, 0, 0, 0.08, h, 0.08, V4C.bois, TL.wood);
    for (let y = 0.3; y < h - 0.1; y += 0.38) E.bx(0, y, 0, 0.56, 0.05, 0.05, V4C.boisNoir, TL.darkwood);
  },
  // une plaque gravée scellée dans un mur (le +z regarde dehors)
  v4_inscription(E, o) {
    const w = (o.data && o.data.w) || 1.2;
    E.bx(0, 0, 0.02, w, 0.7, 0.06, [0.86, 0.84, 0.8], mt(M_V4_DALLES));
    for (let k = 0; k < 4; k++) E.bx(0, 0.14 + k * 0.13, 0.055, w * (0.78 - (k % 2) * 0.16), 0.03, 0.01, [0.12, 0.12, 0.11], TL.plain);
  },
  // des marques de jours grattées dans la pierre (le +z regarde la cellule)
  v4_marques(E, o) {
    const n = (o.data && o.data.n) || 40, c = [0.86, 0.84, 0.8];
    for (let i = 0; i < n; i++) {
      const g = Math.floor(i / 5), r = i % 5, row = Math.floor(g / 8), col = g % 8;
      const x = -0.9 + col * 0.24 + r * 0.035, y = 0.9 + row * 0.22;
      if (r === 4) E.box(x - 0.07, y + 0.08, 0.01, 0.17, 0.012, 0.008, c, TL.plain, 0, 0, 0.5);
      else E.bx(x, y, 0.01, 0.012, 0.16, 0.008, c, TL.plain);
    }
  },
  // un fauteuil à sangles (la salle de la question) : on n'en dit pas plus
  v4_fauteuil_sangles(E) {
    PROP_MODELS.v4_trone(E);
    for (const [x, y, z] of [[-0.42, 0.95, 0.15], [0.42, 0.95, 0.15], [0, 0.3, 0.38], [0, 1.6, -0.27]]) E.bx(x, y, z, x ? 0.14 : 0.8, 0.05, 0.14, V4C.cuir, TL.leather);
  },
  // un mur muré dans une baie : moellons plus clairs, mal jointoyés (le +z regarde dehors)
  v4_porte_muree(E, o) {
    const w = (o.data && o.data.w) || 1.4, h = (o.data && o.data.h) || 2.4;
    for (let y = 0; y < h; y += 0.3) for (let x = -w / 2; x < w / 2 - 0.05; x += 0.45) E.bx(x + 0.22 + ((y / 0.3) % 2) * 0.1 - 0.05, y, 0.03, 0.42, 0.28, 0.06, [0.9 - (x + y) % 0.1, 0.86, 0.8], mt(M_V4_PIERRE));
  },
  // le coffre du château : ferré, lourd (data.ouvert : le couvercle levé)
  v4_coffre(E, o) {
    const S = v4St(), ouvert = S ? S.coffreOuvert(o) : false;
    E.bx(0, 0, 0, 1.1, 0.55, 0.62, V4C.bois, tx(TL.darkwood, TL.chest));
    for (const x of [-0.4, 0, 0.4]) E.bx(x, 0, 0, 0.08, 0.57, 0.64, V4C.ferNoir, TL.iron);
    if (ouvert) { E.box(0, 0.86, -0.32, 1.14, 0.62, 0.08, V4C.bois, TL.darkwood, 0, -0.15); E.bx(0, 0.5, 0, 1.0, 0.03, 0.54, V4C.noir, TL.plain); }
    else { E.bx(0, 0.55, 0, 1.14, 0.12, 0.66, V4C.bois, TL.darkwood); E.bx(0, 0.36, 0.32, 0.12, 0.16, 0.03, V4C.fer, TL.iron); }
  },
  // le seau et la poulie du puits (le treuil du puits ; data.h : hauteur du montant)
  v4_puits(E) {
    for (const s of [-0.95, 0.95]) E.bx(s, 0, 0, 0.16, 2.3, 0.16, V4C.boisNoir, TL.darkwood);
    E.bx(0, 2.3, 0, 2.1, 0.14, 0.14, V4C.boisNoir, TL.darkwood);
    E.box(0, 1.9, 0, 0.9, 0.3, 0.3, V4C.bois, TL.wood);
    E.bx(0.1, 0.9, 0, 0.03, 0.9, 0.03, V4C.corde, TL.rope);
    E.bx(0.1, 0.65, 0, 0.3, 0.3, 0.3, V4C.bois, TL.wood);
  },
  // des couverts sur la grande table : écuelles, gobelets renversés, un plat (data.v)
  v4_couverts(E, o) {
    const v = (o.data && o.data.v) || 0, r = (k) => hash2i(Math.round(o.x * 5) + k, Math.round(o.z * 5) + v, 17);
    for (let k = 0; k < 4; k++) {
      const x = -0.55 + k * 0.38, z = (k % 2 ? 0.22 : -0.22);
      E.bx(x, 0, z, 0.24, 0.03, 0.24, rgbf('#6a5a48'), TL.wood);
      if (r(k) < 0.6) E.box(x + 0.12, 0.05, z - 0.06, 0.08, 0.1, 0.08, V4C.fer, TL.metal, 0, r(k) < 0.3 ? 1.4 : 0);
    }
    if (v % 2 === 0) { E.bx(0, 0, 0, 0.5, 0.04, 0.3, V4C.fer, TL.metal); E.bx(0, 0.04, 0, 0.3, 0.06, 0.18, rgbf('#3a3428'), TL.plain); }
  },
  // un banc de pierre le long d'un mur (une marche de la grand-salle, le banc des gardes…)
  v4_banc_pierre(E, o) { const L = (o.data && o.data.L) || 2; E.bx(0, 0, 0, L, 0.45, 0.5, V4C.pierre, mt(M_V4_PIERRE)); },
  // un petit objet qu'on prend (data.k : l'objet ; data.id : la prise, gardée) — il disparaît une fois pris
  v4_objet(E, o) {
    const S = v4St(), d = o.data || {};
    if (S && S.pris(d.id)) return;
    const k = d.k || '';
    if (/^v4_cle|trousseau/.test(k)) {
      const c = k === 'v4_cle_tour' ? V4C.or : V4C.fer;
      if (k === 'v4_trousseau') { E.box(0, 0.02, 0, 0.16, 0.02, 0.16, V4C.ferNoir, TL.iron, 0.5); for (let i = 0; i < 5; i++) E.box(Math.cos(i) * 0.1, 0.03, Math.sin(i) * 0.1, 0.03, 0.012, 0.13, c, TL.iron, i); return; }
      E.box(0, 0.015, 0, 0.05, 0.02, 0.22, c, TL.iron); E.box(0, 0.015, -0.13, 0.09, 0.02, 0.07, c, TL.iron); E.box(0.03, 0.015, 0.09, 0.05, 0.02, 0.03, c, TL.iron);
      return;
    }
    if (k === 'v4_registre') { E.bx(0, 0, 0, 0.36, 0.07, 0.26, rgbf('#4a3426'), TL.leather); E.bx(0, 0.07, 0, 0.33, 0.015, 0.23, WHITE, TL.paper); return; }
    if (k === 'v4_lettre_dame') { E.bx(0, 0, 0, 0.2, 0.012, 0.14, [0.9, 0.86, 0.76], TL.paper); E.bx(0.04, 0.012, 0.02, 0.03, 0.006, 0.03, rgbf('#7a2a2a'), TL.plain); return; }
    if (k === 'v4_anneau') { E.box(0, 0.02, 0, 0.05, 0.04, 0.012, V4C.or, TL.gold); E.box(0, 0.02, 0, 0.012, 0.04, 0.05, V4C.or, TL.gold); return; }
    E.bx(0, 0, 0, 0.12, 0.12, 0.12, WHITE, TL.plain);
  },
  // une meurtrière vue du dedans (une fente sombre et son ébrasement) (le +z regarde la salle)
  v4_meurtriere(E) {
    E.bx(0, 0, 0.02, 0.14, 1.4, 0.02, V4C.noir, TL.plain);
    E.box(-0.22, 0.7, 0.12, 0.34, 1.5, 0.04, [0.7, 0.68, 0.64], mt(M_V4_PIERRE), 0.5);
    E.box(0.22, 0.7, 0.12, 0.34, 1.5, 0.04, [0.7, 0.68, 0.64], mt(M_V4_PIERRE), -0.5);
  },
});
function v4Mix(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]; }
function v4Guet(E, o, t, lit) {
  E.bx(0, 0, 0, 1.6, 1.0, 1.6, V4C.pierre, mt(M_V4_PIERRE));
  E.bx(0, 1.0, 0, 1.2, 0.5, 1.2, V4C.pierre, mt(M_V4_PIERRE));
  for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; E.box(Math.cos(a) * 0.95, 2.2, Math.sin(a) * 0.95, 0.08, 1.4, 0.08, V4C.ferNoir, TL.iron, -a, 0, 0); }
  E.bx(0, 1.5, 0, 1.9, 0.08, 1.9, V4C.ferNoir, TL.iron);
  E.bx(0, 2.85, 0, 2.1, 0.06, 2.1, V4C.ferNoir, TL.iron, Math.PI / 4);
  if (!lit) { E.bx(0, 1.58, 0, 1.6, 0.2, 1.6, rgbf('#262422'), TL.coal); return; }
  const tt = t ? t.t || 0 : 0;
  E.fl = FX_EMIT;
  E.bx(0, 1.58, 0, 1.6, 0.25, 1.6, V4C.braise, TL.ember);
  for (let k = 0; k < 7; k++) {
    const h = 0.9 + 0.6 * (0.5 + 0.5 * Math.sin(tt * (3.1 + k * 0.7) + k * 1.3));
    E.box(Math.sin(k * 2.1) * 0.45, 1.8 + h / 2, Math.cos(k * 1.7) * 0.45, 0.42, h, 0.42, V4C.flamme, TL.flame, 0, tt * 0.5 + k);
  }
  E.box(0, 3.0, 0, 0.7, 1.4 + Math.sin(tt * 5) * 0.2, 0.7, [1.5, 1.1, 0.55], TL.flame, tt);
  E.fl = 0;
}
// (les objets animés — herse, treuil, cloche, Guet allumé, lustre — sont inscrits dans DYN_PROPS par 11-zzzzV4-2-jeu.js)
Object.assign(PROP_COLL, {
  v4_treuil: [1.4, 0.75, 1.8], v4_levier: [0.25, 0.2, 1.2], v4_gisant: [0.6, 1.2, 0.95], v4_guet: [0.8, 0.8, 1.6], v4_guet_feu: [0.8, 0.8, 1.6],
  v4_trone: [0.45, 0.38, 1.2], v4_fauteuil_sangles: [0.45, 0.38, 1.2], v4_coffre: [0.55, 0.32, 0.6], v4_puits: null, v4_banc_pierre: null,
});
Object.assign(PROP_LIGHTS, {
  v4_guet_feu: { c: [1.25, 0.7, 0.3], r: 45, y: 2.6, flicker: true },
  v4_lustre: { c: [1.0, 0.7, 0.38], r: 9, y: -2.2, flicker: true, lit: true },
});
