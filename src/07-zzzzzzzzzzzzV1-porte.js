// ============================================================================
//  LA GRANDE PORTE ET LES TERRES D'AVANT (agent V1) — matières et modèles
//  Trois matières (64 au plus dans le jeu : il en reste peu, voir le contrat) :
//   - la cendre (sol de la Zone), la terre morte (sol), la vieille pierre (blocs) ;
//  et les objets posés : les vantaux de la Porte, la barre, les braseros, la
//  stèle, les feux de veille.
// ============================================================================

// ---------------------------------------------------------------- matières
function texV1Cendre(seed) {
  const pal = ramp(['#4a4744', '#57534f', '#64605b', '#716c66', '#7e7973', '#8c867f', '#9a948c']);
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed), rnd = mulberry32(seed + 5);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const v = 0.42 + (tileFbm(tn, x / 14, y / 14, 9.142857, 3) - 0.5) * 0.55 + (tn(x / 2, y / 2, 64) - 0.5) * 0.18;
    pb.set(x, y, rampPick(pal, v, x, y));
  }
  // braises éteintes, petits os, charbons
  for (let k = 0; k < 140; k++) {
    const x = (rnd() * TS) | 0, y = (rnd() * TS) | 0, r = rnd();
    const c = r < 0.6 ? [34, 32, 31] : r < 0.85 ? [150, 144, 132] : [70, 40, 30];
    pb.setW(x, y, c); if (rnd() < 0.4) pb.setW(x + 1, y, c);
  }
  return pb;
}
function texV1TerreMorte(seed) {
  const pal = ramp(['#2a2520', '#352e27', '#40372e', '#4b4135', '#574b3d', '#625545']);
  const herbe = ramp(['#4e4a3a', '#5e5944', '#6e684f', '#7e775a']);
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed), rnd = mulberry32(seed + 7);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const v = 0.4 + (tileFbm(tn, x / 10, y / 10, 12.8, 3) - 0.5) * 0.6;
    pb.set(x, y, rampPick(pal, v, x, y));
  }
  // brins d'herbe morte, couchés
  for (let k = 0; k < 520; k++) {
    const x = (rnd() * TS) | 0, y = (rnd() * TS) | 0, L = 2 + ((rnd() * 4) | 0), dx = rnd() < 0.5 ? 1 : -1;
    const c = rampPick(herbe, rnd(), x, y);
    for (let i = 0; i < L; i++) pb.setW(x + (i >> 1) * dx, y - i, c);
  }
  return pb;
}
function texV1Pierre(seed) {
  // grands blocs anciens, usés, presque noirs, joints effacés par endroits
  const P = ramp(['#2c2d2b', '#363733', '#40413c', '#4b4c46', '#575850', '#63645b']);
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed);
  const bw = 64, bh = 32;
  for (let y = 0; y < TS; y++) {
    const row = Math.floor(y / bh), off = (row % 2) * (bw / 2), ly = y % bh;
    for (let x = 0; x < TS; x++) {
      const xx = (x + off) % TS, col = Math.floor(xx / bw), lx = xx % bw, id = row * 16 + col;
      let v = 0.3 + hash2i(id, 9, seed) * 0.35 + (tileFbm(tn, x / 10, y / 10, 12.8, 3) - 0.5) * 0.45;
      const joint = ly === bh - 1 || lx === bw - 1;
      if (joint && tn(x / 6, y / 6, 42.667) > 0.35) v = 0.04;
      else if (ly === 0 || lx === 0) v += 0.1;
      if (tn(x / 3 + 9, y / 3, 85.333) > 0.82) v -= 0.22; // éclats
      pb.set(x, y, rampPick(P, v, x, y));
    }
  }
  return pb;
}
const M_V1_CENDRE = MATERIALS.push({ id: 'v1_cendre', name: 'Cendre', terrain: true, scale: 4, gen: () => texV1Cendre(1401) }) - 1;
const M_V1_TERREMORTE = MATERIALS.push({ id: 'v1_terre_morte', name: 'Terre morte', terrain: true, scale: 4, gen: () => texV1TerreMorte(1402) }) - 1;
const M_V1_PIERRE = MATERIALS.push({ id: 'v1_pierre', name: 'Vieille pierre', scale: 3, gen: () => texV1Pierre(1403) }) - 1;
TERRAIN_MATS.push(M_V1_CENDRE, M_V1_TERREMORTE);
BLOCK_MATS.push(M_V1_PIERRE);

// ---------------------------------------------------------------- objets posés
// les vantaux de la Porte : o.data.cote (-1 gauche, 1 droit) ; l'angle d'ouverture vient de porteV1.angle()
// (le vantail tourne autour de son gond, à l'extérieur de la baie ; hauteur 12,6 m, largeur 4 m)
Object.assign(PROP_MODELS, {
  v1_vantail(E, o) {
    const c = (o.data && o.data.cote) || 1, a = typeof porteV1 !== 'undefined' ? porteV1.angle(o) : 0;
    // le repère de l'objet est posé sur le gond ; on tourne le vantail autour de lui (il s'ouvre vers l'intérieur, +z)
    const th = a * c, ca = Math.cos(th), sa = Math.sin(th);
    const at = (lx, lz) => [lx * ca + lz * sa, -lx * sa + lz * ca];
    const W = 4.0, H = 12.6, T = 0.32;
    const piece = (cx, cy, cz, sx, sy, sz, col, code) => { const [x, z] = at(cx, cz); E.box(x, cy, z, sx, sy, sz, col, code, th); };
    // les planches (chêne noir), en cinq lés
    for (let k = 0; k < 5; k++) piece(-c * (W / 10 + k * W / 5), H / 2, 0, W / 5 - 0.03, H, T, k % 2 ? [0.42, 0.36, 0.32] : [0.38, 0.33, 0.3], TL.darkwood);
    // les pentures et les cercles de fer
    for (const y of [1.2, 4.0, 7.2, 10.4]) piece(-c * W / 2, y, -T / 2 - 0.03, W * 0.96, 0.32, 0.06, [0.5, 0.5, 0.52], TL.iron);
    // les gros clous
    for (const y of [2.6, 5.6, 8.8]) for (let k = 0; k < 4; k++) piece(-c * (0.5 + k * 1.0), y, -T / 2 - 0.05, 0.12, 0.12, 0.08, [0.4, 0.4, 0.42], TL.iron);
    // l'anneau (côté de la fente)
    piece(-c * (W - 0.45), 3.4, -T / 2 - 0.12, 0.08, 0.7, 0.08, [0.45, 0.43, 0.4], TL.iron);
    piece(-c * (W - 0.45), 3.05, -T / 2 - 0.12, 0.5, 0.08, 0.08, [0.45, 0.43, 0.4], TL.iron);
  },
  // la barre de fer passée dans les anneaux (montrée quand la Porte est close)
  v1_barre(E, o, t) {
    if (typeof porteV1 === 'undefined' || !porteV1.barreMise()) return;
    // (une grosse barre de fer rouillé, qu'on voit de loin : la Porte est fermée ; la baie est dans l'ombre de la façade,
    // alors le fer accroche un peu de jour — presque rien la nuit)
    const k = t && t.night ? 0.16 : 0.6, c = (r, g, b) => [r * k, g * k, b * k], f0 = E.fl;
    E.fl = FX_EMIT;
    E.bx(0, 3.0, -0.38, 8.8, 0.44, 0.36, c(0.66, 0.5, 0.38), TL.iron);
    for (const x of [-3.55, 3.55, -1.2, 1.2]) E.bx(x, 2.55, -0.32, 0.36, 1.2, 0.24, c(0.5, 0.42, 0.36), TL.iron);
    E.bx(0, 2.6, -0.44, 0.62, 0.62, 0.26, c(0.72, 0.58, 0.3), TL.iron); // le cadenas
    E.fl = f0;
  },
  // un brasero sur un fût de pierre (allumé ou non : o.data.feu = 'porte' suit la Porte, sinon o.data.lit)
  v1_brasier(E, o, t) {
    E.bx(0, 0, 0, 0.9, 2.2, 0.9, [0.55, 0.55, 0.52], mt(M_V1_PIERRE));
    E.bx(0, 2.2, 0, 1.3, 0.25, 1.3, [0.5, 0.5, 0.48], mt(M_V1_PIERRE));
    E.bx(0, 2.45, 0, 1.15, 0.5, 1.15, [0.3, 0.29, 0.28], TL.iron);
    const lit = o.data && o.data.feu === 'porte' ? (typeof porteV1 !== 'undefined' && porteV1.feux()) : !!(o.data && o.data.lit);
    if (lit) {
      const f = t ? 1 + Math.sin(t.t * 11 + o.x) * 0.12 : 1;
      E.fl = FX_EMIT;
      E.bx(0, 2.85, 0, 0.7, 0.55 * f, 0.7, [1.3, 0.75, 0.3], TL.flame, t ? t.t * 2 : 0);
      E.bx(0, 2.85, 0, 0.45, 0.95 * f, 0.45, [1.4, 1.05, 0.45], TL.flame, 0.6);
      E.fl = 0;
    } else E.bx(0, 2.9, 0, 0.9, 0.12, 0.9, [0.16, 0.15, 0.14], TL.coal);
  },
  // une stèle (texte lu avec E)
  v1_stele(E) {
    E.bx(0, 0, 0, 1.2, 0.35, 0.7, [0.5, 0.5, 0.48], mt(M_V1_PIERRE));
    E.bx(0, 0.35, 0, 0.95, 2.1, 0.32, [0.55, 0.55, 0.52], mt(M_V1_PIERRE));
    E.box(0, 2.55, 0, 0.95, 0.5, 0.32, [0.5, 0.5, 0.48], mt(M_V1_PIERRE), 0, 0, Math.PI / 4);
    for (let k = 0; k < 5; k++) E.bx(0, 0.75 + k * 0.3, -0.17, 0.62 - (k % 2) * 0.12, 0.05, 0.02, [0.12, 0.12, 0.11], 0);
  },
  // un feu de veille : un cercle de pierres noires, une épée rouillée plantée dans la cendre, et le feu (o.data.lit)
  v1_feu(E, o, t) {
    for (let k = 0; k < 9; k++) { const a = k / 9 * TAU; E.bx(Math.cos(a) * 0.75, 0, Math.sin(a) * 0.75, 0.3, 0.22 + (k % 3) * 0.05, 0.3, [0.4, 0.4, 0.38], mt(M_V1_PIERRE), a); }
    E.bx(0, 0, 0, 1.1, 0.08, 1.1, [0.45, 0.43, 0.4], mt(M_V1_CENDRE));
    E.box(0.05, 0.75, 0, 0.07, 1.4, 0.03, [0.5, 0.36, 0.26], TL.iron, 0.3, 0, 0.12); // la lame
    E.box(0.14, 1.48, 0, 0.36, 0.07, 0.07, [0.4, 0.3, 0.22], TL.iron, 0.3, 0, 0.12); // la garde
    const lit = typeof feuxV1 !== 'undefined' ? feuxV1.allume(o) : !!(o.data && o.data.lit);
    if (lit) {
      const f = t ? 1 + Math.sin(t.t * 9 + o.x) * 0.14 + Math.sin(t.t * 23) * 0.05 : 1;
      E.fl = FX_EMIT;
      E.bx(0, 0.08, 0, 0.55, 0.5 * f, 0.55, [1.25, 0.62, 0.26], TL.flame, t ? t.t * 2.5 : 0);
      E.bx(0, 0.08, 0, 0.3, 0.85 * f, 0.3, [1.35, 0.95, 0.45], TL.flame, 0.8);
      E.fl = 0;
    } else E.bx(0, 0.08, 0, 0.6, 0.1, 0.6, [0.12, 0.11, 0.1], TL.coal);
  },
});
Object.assign(PROP_MODELS, {
  // un levier de fer dans un bâti de pierre, une roue dentée, une chaîne (o.data.tire : abaissé)
  v1_levier(E, o) {
    E.bx(0, 0, 0, 1.2, 0.9, 0.9, [0.5, 0.5, 0.48], mt(M_V1_PIERRE));
    E.box(0, 1.25, 0.46, 0.9, 0.9, 0.12, [0.38, 0.35, 0.32], TL.iron, 0, 0, 0.4);
    const a = o.data && o.data.tire ? 1.0 : -0.7;
    E.box(0, 0.9 + Math.cos(a) * 0.8, Math.sin(a) * 0.8, 0.1, 1.7, 0.1, [0.4, 0.38, 0.36], TL.iron, 0, a);
    for (let k = 0; k < 6; k++) E.bx(0.45, 0.9 - k * 0.16, 0.5 + k * 0.08, 0.06, 0.12, 0.06, [0.36, 0.34, 0.32], TL.iron);
  },
  // une échelle couchée dans l'herbe, au bord d'une paroi (o.data.h)
  v1_echelle_couchee(E, o) {
    const h = (o.data && o.data.h) || 6;
    for (const s of [-0.28, 0.28]) E.bx(s, 0, h / 2, 0.07, 0.07, h, WHITE, TL.wood);
    for (let z = 0.3; z < h - 0.1; z += 0.38) E.bx(0, 0, z, 0.56, 0.05, 0.05, WHITE, TL.darkwood);
  },
  // des restes : des os, une veste, une besace (ceux d'avant)
  v1_reste(E) {
    E.bx(0, 0, 0, 0.55, 0.16, 1.2, [0.36, 0.32, 0.28], TL.cloth);
    E.bx(0, 0.05, -0.75, 0.22, 0.2, 0.24, [0.85, 0.82, 0.74], TL.bone);
    for (const c of [-1, 1]) E.box(c * 0.35, 0.05, 0.1, 0.07, 0.06, 0.7, [0.85, 0.82, 0.74], TL.bone, c * 0.4);
    E.bx(0.5, 0, 0.3, 0.32, 0.26, 0.24, [0.42, 0.3, 0.2], TL.leather);
    E.bx(-0.4, 0, -0.3, 0.2, 0.02, 0.28, [0.85, 0.82, 0.7], TL.paper);
  },
});
Object.assign(PROP_COLL, { v1_brasier: [0.5, 0.5, 2.9], v1_stele: [0.6, 0.35, 2.6], v1_levier: [0.6, 0.45, 1.0] });
// (les braseros de la Porte, côté vallée, éclairent par HOOKS.lights selon l'état de la Porte ; ceux de la Zone et les feux de
// veille par leurs données : data.lit)
Object.assign(PROP_LIGHTS, {
  v1_brasier: { c: [1.1, 0.6, 0.26], r: 15, y: 3.0, flicker: true, lit: true },
  v1_feu: { c: [1.05, 0.55, 0.22], r: 11, y: 0.7, flicker: true, lit: true },
});
// (les vantaux et la barre ne bloquent pas par eux-mêmes : la baie est fermée par un bloc invisible tant que la Porte est close)
