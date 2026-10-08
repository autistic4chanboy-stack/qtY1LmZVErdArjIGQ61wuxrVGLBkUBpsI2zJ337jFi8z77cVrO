// ============================================================================
//  DES OBJETS À RAMASSER (agent R, vague 13) — les modèles et les icônes
//  Chaque trouvaille a son petit modèle de boîtes, À SA TAILLE (une pièce fait
//  deux centimètres et demi, une branche morte près d'un mètre), posé à plat
//  sur le sol ou sur son meuble : RAM_MOD[mod](E, o, v) dessine dans le repère
//  de la trouvaille (y = 0 : le sol), v ∈ [0, 1[ varie le détail d'une
//  trouvaille à l'autre. PROP_MODELS.r_objet les dessine sous leur inclinaison
//  (o.tx, o.tz : la pente du terrain) : c'est lui que la lueur de l'objet visé
//  reprend (game.hiProp). Les icônes des objets nouveaux : formes « r_… ».
// ============================================================================
const RAM_C = {
  ecorce: [0.56, 0.45, 0.35], bois: [0.72, 0.54, 0.34], boisClair: [0.8, 0.66, 0.46], flotte: [0.8, 0.78, 0.72],
  fer: [0.36, 0.36, 0.39], rouille: [0.48, 0.33, 0.25], laiton: [0.86, 0.7, 0.36], cuivre: [0.74, 0.46, 0.27], argent: [0.8, 0.8, 0.84],
  bronze: [0.42, 0.58, 0.46], os: [0.9, 0.86, 0.76], blanc: [0.95, 0.93, 0.88], papier: [0.9, 0.86, 0.74], cuir: [0.44, 0.31, 0.21],
  noir: [0.12, 0.11, 0.11], terre: [0.74, 0.43, 0.28], pierre: [0.58, 0.57, 0.54], silex: [0.32, 0.3, 0.3], verreV: [0.24, 0.44, 0.32],
  verreC: [0.66, 0.82, 0.78], cire: [0.92, 0.82, 0.56], laine: [0.56, 0.55, 0.53], corde: [0.74, 0.62, 0.42],
};
const RAM_PI = Math.PI;
// une petite « boule » : deux boîtes croisées (on n'a que des boîtes)
function ramBoule(E, x, y, z, d, col, t, h) {
  const hh = (h || d);
  E.box(x, y + hh / 2, z, d, hh, d * 0.72, col, t);
  E.box(x, y + hh / 2, z, d * 0.72, hh * 0.92, d, col, t, RAM_PI / 4);
}
// un disque plat (pièce, bouton) : deux carrés tournés
function ramDisque(E, x, y, z, d, e, col, t) {
  E.box(x, y + e / 2, z, d * 0.84, e, d * 0.84, col, t);
  E.box(x, y + e / 2, z, d * 0.84, e * 0.96, d * 0.84, col, t, RAM_PI / 4);
}
// v -> une suite de nombres pseudo-aléatoires (le même dessin à chaque reconstruction)
function ramAlea(v) { let s = Math.floor((v || 0) * 2147483647) | 0 || 1; return () => { s = (s * 16807) % 2147483647; if (s <= 0) s += 2147483646; return (s - 1) / 2147483646; }; }

const RAM_MOD = {
  // ---------------------------------------------------------------- de quoi faire
  branche(E, o, v) {
    const c = RAM_C.ecorce, L = 0.75 + v * 0.3;
    E.box(0, 0.024, 0, L, 0.042, 0.048, c, TL.bark, 0, 0, 0.03);
    E.box(L * 0.18, 0.022, 0.09, 0.34, 0.028, 0.03, c, TL.bark, -0.65);
    E.box(-L * 0.3, 0.018, -0.05, 0.2, 0.022, 0.024, c, TL.bark, 0.9);
    E.box(L * 0.46, 0.02, 0.02, 0.05, 0.035, 0.035, [0.48, 0.38, 0.3], TL.bark);
  },
  galet(E, o, v) { const c = [0.56 + v * 0.1, 0.55 + v * 0.08, 0.52]; E.box(0, 0.022, 0, 0.09, 0.042, 0.066, c, TL.stone); E.box(0, 0.024, 0, 0.074, 0.046, 0.074, c, TL.stone, RAM_PI / 4); },
  silex(E) {
    E.box(0, 0.022, 0, 0.075, 0.042, 0.055, RAM_C.silex, TL.stone, 0.3); E.box(0.01, 0.024, 0.006, 0.05, 0.046, 0.05, RAM_C.silex, TL.stone, 1.1);
    E.box(-0.028, 0.028, -0.01, 0.026, 0.03, 0.04, [0.86, 0.83, 0.76], TL.stone, 0.3);
  },
  clous(E, o, v) {
    const r = ramAlea(v);
    for (let k = 0; k < 4; k++) {
      const a = r() * RAM_PI * 2, x = (r() - 0.5) * 0.08, z = (r() - 0.5) * 0.08;
      E.box(x, 0.004, z, 0.008, 0.008, 0.07, [0.62, 0.46, 0.36], TL.iron, a);
      E.box(x + Math.sin(a) * 0.035, 0.005, z + Math.cos(a) * 0.035, 0.016, 0.01, 0.005, [0.6, 0.6, 0.64], TL.iron, a);
    }
  },
  ficelle(E, o, v) {
    const c = RAM_C.corde;
    E.box(0, 0.003, 0, 0.16, 0.005, 0.007, c, TL.rope, 0.2); E.box(0.05, 0.003, 0.05, 0.12, 0.005, 0.007, c, TL.rope, 1.6);
    E.box(-0.02, 0.003, 0.07, 0.13, 0.005, 0.007, c, TL.rope, 2.6); E.box(-0.1, 0.003, -0.04, 0.22, 0.005, 0.007, c, TL.rope, 0.7 + v);
  },
  chiffon(E, o, v) {
    const c = RAM_C.blanc;
    E.box(0, 0.006, 0, 0.24, 0.012, 0.18, [0.86, 0.83, 0.76], TL.cloth2, 0.1);
    E.box(0.03, 0.016, 0.02, 0.16, 0.012, 0.12, c, TL.cloth2, 0.6, 0.12);
    E.box(-0.07, 0.014, -0.03, 0.1, 0.012, 0.09, [0.5, 0.56, 0.74], TL.cloth, 1.2, 0, 0.1);
  },
  bouteille(E) {
    const g = RAM_C.verreV;
    E.box(0, 0.036, 0, 0.068, 0.068, 0.19, g, TL.plain); E.box(0, 0.036, 0, 0.072, 0.06, 0.18, g, TL.plain, 0, 0, RAM_PI / 4);
    E.box(0, 0.036, 0.115, 0.05, 0.05, 0.04, g, TL.plain); E.box(0, 0.036, 0.16, 0.024, 0.024, 0.07, g, TL.plain);
    E.box(0, 0.036, 0.197, 0.03, 0.03, 0.008, [0.3, 0.5, 0.38], TL.plain);
  },
  fer(E) {
    const c = RAM_C.fer;
    for (const s of [-1, 1]) {
      E.box(s * 0.046, 0.006, -0.018, 0.022, 0.012, 0.09, c, TL.iron, s * 0.08);
      E.box(s * 0.032, 0.006, 0.045, 0.022, 0.012, 0.045, c, TL.iron, -s * 0.75);
    }
    E.box(0, 0.006, 0.058, 0.04, 0.012, 0.022, c, TL.iron);
  },
  ferraille(E, o, v) {
    const c = RAM_C.rouille;
    E.box(0, 0.008, 0, 0.2, 0.012, 0.032, c, TL.iron, 0.2); E.box(0.11, 0.012, 0.05, 0.1, 0.012, 0.032, c, TL.iron, 1.2, 0, 0.2);
    E.box(-0.06, 0.008, 0.08, 0.06, 0.016, 0.06, RAM_C.fer, TL.iron, v * 3);
  },
  verre(E, o, v) {
    const r = ramAlea(v);
    for (let k = 0; k < 5; k++) E.box((r() - 0.5) * 0.14, 0.005, (r() - 0.5) * 0.14, 0.035 + r() * 0.025, 0.008, 0.025 + r() * 0.02, k % 2 ? [0.82, 1.0, 0.96] : [0.36, 0.62, 0.44], TL.plain, r() * 6, 0.15, r() * 0.3);
  },
  corde(E, o, v) {
    const c = RAM_C.corde;
    for (let k = 0; k < 8; k++) { const a = k * RAM_PI / 4; E.box(Math.sin(a) * 0.1, 0.012, Math.cos(a) * 0.1, 0.088, 0.024, 0.026, c, TL.rope, a); }
    for (let k = 0; k < 6; k++) { const a = k * RAM_PI / 3 + 0.3; E.box(Math.sin(a) * 0.066, 0.034, Math.cos(a) * 0.066, 0.074, 0.022, 0.024, [0.68, 0.56, 0.38], TL.rope, a); }
    E.box(0.17, 0.012, -0.05, 0.16, 0.022, 0.024, c, TL.rope, 0.3 + v);
  },
  flotte(E, o, v) {
    const c = RAM_C.flotte, L = 0.55 + v * 0.3;
    E.box(0, 0.03, 0, L, 0.055, 0.062, c, TL.cloth2, 0, 0, 0.04); E.box(L * 0.32, 0.026, 0.07, 0.2, 0.04, 0.04, c, TL.cloth2, -0.8);
    E.box(-L * 0.5, 0.03, 0, 0.06, 0.07, 0.08, [0.66, 0.64, 0.6], TL.cloth2);
  },
  liege(E) { const c = [0.5, 0.36, 0.25]; E.box(0, 0.024, 0, 0.09, 0.048, 0.07, c, TL.leather); E.box(0, 0.025, 0, 0.07, 0.05, 0.09, c, TL.leather, RAM_PI / 4); E.box(0, 0.05, 0, 0.012, 0.006, 0.012, RAM_C.noir, TL.plain); },
  charbon(E, o, v) { const r = ramAlea(v); for (let k = 0; k < 3; k++) E.box((r() - 0.5) * 0.1, 0.018, (r() - 0.5) * 0.1, 0.04 + r() * 0.02, 0.03, 0.035, RAM_C.noir, TL.coal, r() * 3); },
  plume(E, o, v) { E.box(0, 0.003, 0, 0.022, 0.004, 0.12, RAM_C.blanc, TL.plain, 0, 0, 0.1); E.box(0, 0.004, -0.075, 0.004, 0.004, 0.04, [0.88, 0.85, 0.78], TL.plain); },
  plume_geai(E) {
    E.box(0, 0.003, 0, 0.02, 0.004, 0.08, [0.26, 0.46, 0.86], TL.plain);
    for (const z of [-0.02, 0.005, 0.03]) E.box(0, 0.0045, z, 0.021, 0.003, 0.006, [0.08, 0.08, 0.12], TL.plain);
    E.box(0, 0.004, -0.05, 0.003, 0.003, 0.025, [0.9, 0.88, 0.82], TL.plain);
  },
  plume_buse(E) {
    E.box(0, 0.003, 0, 0.042, 0.004, 0.24, [0.46, 0.34, 0.23], TL.plain);
    for (const z of [-0.06, 0, 0.06]) E.box(0, 0.0045, z, 0.043, 0.003, 0.012, [0.78, 0.7, 0.58], TL.plain);
    E.box(0, 0.004, -0.14, 0.005, 0.004, 0.05, [0.86, 0.82, 0.72], TL.plain);
  },
  plume_noire(E) { E.box(0, 0.003, 0, 0.032, 0.004, 0.17, [0.1, 0.1, 0.11], TL.plain); E.box(0, 0.004, -0.1, 0.004, 0.004, 0.04, [0.3, 0.28, 0.26], TL.plain); },
  os(E) {
    const c = RAM_C.os;
    E.box(0, 0.014, 0, 0.18, 0.024, 0.024, c, TL.bone);
    for (const s of [-1, 1]) { E.box(s * 0.095, 0.02, 0.008, 0.035, 0.036, 0.024, c, TL.bone); E.box(s * 0.095, 0.02, -0.01, 0.03, 0.03, 0.022, c, TL.bone); }
  },
  mue(E, o, v) { const c = [0.82, 0.78, 0.64]; for (let k = 0; k < 5; k++) E.box(k * 0.07 - 0.14, 0.003, Math.sin(k * 1.4 + v * 5) * 0.03, 0.08, 0.005, 0.024 - k * 0.002, c, TL.plain, Math.cos(k * 1.4 + v * 5) * 0.6); },
  andouiller(E) {
    const c = [0.74, 0.65, 0.5];
    E.box(0, 0.02, 0, 0.13, 0.026, 0.026, c, TL.bone, 0, 0, 0.12); E.box(0.12, 0.034, 0.012, 0.13, 0.022, 0.022, c, TL.bone, -0.3, 0, 0.22);
    E.box(0.04, 0.05, 0.02, 0.022, 0.08, 0.02, c, TL.bone, 0, 0.3, -0.3); E.box(0.17, 0.06, 0.03, 0.018, 0.07, 0.018, c, TL.bone, 0, 0.2, -0.4);
    E.box(-0.07, 0.024, 0, 0.03, 0.045, 0.045, [0.56, 0.46, 0.34], TL.bone);
  },
  crane(E) {
    const c = RAM_C.os;
    E.box(0, 0.03, 0, 0.07, 0.055, 0.065, c, TL.bone); E.box(0.06, 0.02, 0, 0.07, 0.034, 0.038, c, TL.bone);
    for (const s of [-1, 1]) E.box(0.03, 0.04, s * 0.024, 0.018, 0.016, 0.012, [0.12, 0.1, 0.09], TL.plain);
    E.box(0.065, 0.004, 0, 0.06, 0.008, 0.03, [0.82, 0.78, 0.68], TL.bone);
  },
  coquille(E, o, v) {
    E.box(0, 0.008, 0, 0.08, 0.014, 0.04, [0.16, 0.18, 0.22], TL.plain, 0.2);
    E.box(0.07, 0.004, 0.05, 0.075, 0.008, 0.038, [0.84, 0.82, 0.9], TL.plain, 1.1 + v); E.box(0.07, 0.002, 0.05, 0.08, 0.004, 0.04, [0.2, 0.22, 0.26], TL.plain, 1.1 + v);
  },
  mulette(E) { E.box(0, 0.015, 0, 0.085, 0.028, 0.042, [0.15, 0.17, 0.2], TL.plain, 0.3); E.box(0, 0.03, 0, 0.07, 0.006, 0.02, [0.24, 0.26, 0.28], TL.plain, 0.3); },
  cartouche(E, o, v) {
    for (const [x, z, a] of [[0, 0, 0.3], [0.03, 0.04, 1.4 + v]]) {
      E.box(x, 0.006, z, 0.012, 0.012, 0.05, [0.7, 0.14, 0.12], TL.plain, a);
      E.box(x - Math.sin(a) * 0.028, 0.006, z - Math.cos(a) * 0.028, 0.014, 0.014, 0.012, RAM_C.laiton, TL.metal, a);
    }
  },
  oeuf(E) { const c = [0.95, 0.92, 0.84]; E.box(0, 0.022, 0, 0.044, 0.04, 0.06, c, TL.plain); E.box(0, 0.022, 0, 0.034, 0.044, 0.05, c, TL.plain, RAM_PI / 4); },
  // ---------------------------------------------------------------- fruits tombés (autant qu'on en ramasse : ramNombre)
  pommes(E, o, v) {
    const r = ramAlea(v), n = ramNombre(RAM_SORTES.pommes, v);
    for (let k = 0; k < n; k++) {
      const x = (r() - 0.5) * 0.6, z = (r() - 0.5) * 0.6, u = r(), c = u < 0.55 ? [0.8, 0.14, 0.1] : u < 0.85 ? [0.76, 0.66, 0.2] : [0.5, 0.33, 0.16];
      ramBoule(E, x, 0, z, 0.07, c, TL.plain, 0.064); E.box(x, 0.068, z, 0.005, 0.014, 0.005, [0.3, 0.22, 0.14], TL.plain);
    }
  },
  poires(E, o, v) {
    const r = ramAlea(v), n = ramNombre(RAM_SORTES.poires, v);
    for (let k = 0; k < n; k++) { const x = (r() - 0.5) * 0.5, z = (r() - 0.5) * 0.5, a = r() * 6, c = [0.8, 0.74, 0.28]; E.box(x, 0.03, z, 0.064, 0.058, 0.064, c, TL.plain, a); E.box(x + Math.sin(a) * 0.05, 0.026, z + Math.cos(a) * 0.05, 0.04, 0.04, 0.05, c, TL.plain, a); E.box(x + Math.sin(a) * 0.08, 0.026, z + Math.cos(a) * 0.08, 0.004, 0.004, 0.02, [0.3, 0.22, 0.14], TL.plain, a); }
  },
  prunes(E, o, v) { const r = ramAlea(v), n = ramNombre(RAM_SORTES.prunes, v); for (let k = 0; k < n; k++) ramBoule(E, (r() - 0.5) * 0.45, 0, (r() - 0.5) * 0.45, 0.036, [0.38, 0.13, 0.44], TL.plain, 0.034); },
  cerises(E, o, v) {
    const r = ramAlea(v), n = ramNombre(RAM_SORTES.cerises, v);
    for (let k = 0; k < n; k++) { const x = (r() - 0.5) * 0.4, z = (r() - 0.5) * 0.4; E.box(x, 0.01, z, 0.021, 0.02, 0.021, [0.7, 0.04, 0.1], TL.plain); E.box(x, 0.022, z + 0.01, 0.002, 0.003, 0.03, [0.3, 0.42, 0.18], TL.plain); }
  },
  noix(E, o, v) {
    const r = ramAlea(v), n = ramNombre(RAM_SORTES.noix, v);
    for (let k = 0; k < n; k++) ramBoule(E, (r() - 0.5) * 0.45, 0, (r() - 0.5) * 0.45, 0.036, [0.66, 0.54, 0.38], TL.wood, 0.032);
    for (let k = 0; k < 2; k++) E.box((r() - 0.5) * 0.4, 0.008, (r() - 0.5) * 0.4, 0.04, 0.014, 0.035, [0.14, 0.12, 0.1], TL.plain, r() * 3);
  },
  chataignes(E, o, v) {
    const r = ramAlea(v), n = ramNombre(RAM_SORTES.chataignes, v);
    for (let k = 0; k < n; k++) { const x = (r() - 0.5) * 0.4, z = (r() - 0.5) * 0.4; E.box(x, 0.011, z, 0.028, 0.022, 0.026, [0.42, 0.2, 0.1], TL.plain, r() * 3); E.box(x, 0.016, z, 0.012, 0.014, 0.022, [0.86, 0.78, 0.64], TL.plain, r() * 3); }
    for (let k = 0; k < 2; k++) { const x = (r() - 0.5) * 0.35, z = (r() - 0.5) * 0.35; E.box(x, 0.026, z, 0.06, 0.05, 0.06, [0.5, 0.52, 0.24], TL.leaves, 0.4); E.box(x, 0.026, z, 0.05, 0.054, 0.05, [0.44, 0.44, 0.2], TL.leaves, 1.2); }
  },
  faines(E, o, v) {
    const r = ramAlea(v), n = ramNombre(RAM_SORTES.faines, v);
    for (let k = 0; k < n; k++) E.box((r() - 0.5) * 0.3, 0.006, (r() - 0.5) * 0.3, 0.013, 0.012, 0.017, [0.52, 0.32, 0.2], TL.plain, r() * 3);
    for (let k = 0; k < 3; k++) E.box((r() - 0.5) * 0.28, 0.01, (r() - 0.5) * 0.28, 0.026, 0.02, 0.026, [0.42, 0.32, 0.22], TL.bark, r() * 3);
  },
  // ---------------------------------------------------------------- petites valeurs
  sou(E, o, v) { ramDisque(E, 0, 0, 0, 0.025, 0.004, v < 0.7 ? [1.3, 0.82, 0.48] : [1.25, 1.25, 1.3], v < 0.7 ? TL.gold : TL.metal); },
  bouton(E) { ramDisque(E, 0, 0, 0, 0.018, 0.005, [1.15, 1.13, 1.08], TL.plain); E.box(0, 0.0055, 0, 0.004, 0.002, 0.004, [0.6, 0.58, 0.55], TL.plain); },
  bille(E, o, v) { ramBoule(E, 0, 0, 0, 0.017, v < 0.5 ? [0.36, 0.62, 0.84] : [0.82, 0.4, 0.3], TL.plain, 0.016); E.box(0, 0.009, 0, 0.004, 0.017, 0.012, [0.95, 0.9, 0.7], TL.plain); },
  de(E) { const c = [1.15, 1.15, 1.2]; E.box(0, 0.011, 0, 0.017, 0.022, 0.017, c, TL.metal); E.box(0, 0.011, 0, 0.016, 0.02, 0.016, c, TL.metal, RAM_PI / 4); },
  bobine(E, o, v) {
    for (const y of [0.004, 0.036]) E.box(0, y, 0, 0.034, 0.008, 0.034, RAM_C.bois, TL.wood);
    E.box(0, 0.02, 0, 0.027, 0.026, 0.027, v < 0.4 ? [0.12, 0.12, 0.14] : v < 0.7 ? [0.66, 0.16, 0.16] : [0.9, 0.88, 0.82], TL.cloth);
  },
  epingle(E) { E.box(0, 0.003, 0, 0.003, 0.003, 0.15, RAM_C.argent, TL.metal, 0.4); E.box(-Math.sin(0.4) * 0.075, 0.006, -Math.cos(0.4) * 0.075, 0.012, 0.012, 0.012, RAM_C.noir, TL.plain); },
  ruban(E, o, v) { const c = v < 0.5 ? [0.72, 0.2, 0.28] : [0.3, 0.36, 0.66]; for (let k = 0; k < 4; k++) E.box(k * 0.09 - 0.13, 0.002, Math.sin(k * 1.7 + v * 4) * 0.025, 0.1, 0.003, 0.022, c, TL.cloth, Math.cos(k * 1.7) * 0.5); },
  peigne(E) { E.box(0, 0.005, 0.012, 0.11, 0.009, 0.012, [0.72, 0.58, 0.4], TL.plain); E.box(0, 0.003, -0.006, 0.11, 0.005, 0.024, [0.62, 0.48, 0.32], TL.plain); },
  mouchoir(E, o, v) {
    E.box(0, 0.003, 0, 0.24, 0.006, 0.24, RAM_C.blanc, TL.cloth, v); E.box(0.03, 0.008, 0.02, 0.15, 0.006, 0.15, [0.92, 0.9, 0.86], TL.cloth, v + 0.3);
    E.box(0.03, 0.0115, 0.02, 0.15, 0.002, 0.012, [0.6, 0.3, 0.42], TL.plain, v + 0.3);
  },
  blague(E) { E.box(0, 0.016, 0, 0.1, 0.032, 0.075, RAM_C.cuir, TL.leather, 0.2); E.box(0.03, 0.034, 0, 0.05, 0.006, 0.07, [0.36, 0.25, 0.17], TL.leather, 0.2); },
  couteau(E) {
    E.box(0, 0.007, 0, 0.09, 0.014, 0.02, [0.42, 0.3, 0.2], TL.wood, 0.3);
    for (const s of [-1, 1]) E.box(Math.cos(0.3) * 0.046 * s, 0.007, -Math.sin(0.3) * 0.046 * s, 0.008, 0.015, 0.021, RAM_C.argent, TL.metal, 0.3);
  },
  besicles(E) {
    for (const s of [-1, 1]) { E.box(s * 0.022, 0.0025, 0, 0.032, 0.003, 0.028, [0.8, 0.86, 0.88], TL.plain); E.box(s * 0.022, 0.0035, 0, 0.034, 0.002, 0.03, RAM_C.fer, TL.metal); E.box(s * 0.04, 0.002, -0.05, 0.002, 0.002, 0.1, RAM_C.fer, TL.metal, s * 0.15); }
    E.box(0, 0.004, 0.006, 0.014, 0.002, 0.003, RAM_C.fer, TL.metal);
  },
  bague(E) { const c = RAM_C.laiton; for (let k = 0; k < 6; k++) { const a = k * RAM_PI / 3; E.box(Math.sin(a) * 0.0085, 0.002, Math.cos(a) * 0.0085, 0.0105, 0.004, 0.004, c, TL.gold, a); } },
  medaille(E) { const c = [1.15, 1.15, 1.2]; ramDisque(E, 0, 0, 0, 0.021, 0.003, c, TL.metal); E.box(0, 0.002, 0.013, 0.006, 0.003, 0.006, c, TL.metal); },
  montre(E) {
    ramDisque(E, 0, 0, 0, 0.05, 0.012, RAM_C.argent, TL.metal); E.box(0, 0.0125, 0, 0.034, 0.002, 0.034, [0.94, 0.92, 0.86], TL.plain);
    E.box(0, 0.006, 0.03, 0.012, 0.01, 0.01, RAM_C.argent, TL.metal); E.box(0.01, 0.0135, 0.004, 0.012, 0.001, 0.002, RAM_C.noir, TL.plain, 0.4);
    for (let k = 0; k < 4; k++) E.box(0.01 + k * 0.012, 0.002, 0.045 + k * 0.006, 0.01, 0.003, 0.004, RAM_C.argent, TL.metal, 0.6);
  },
  // ---------------------------------------------------------------- choses perdues
  lettre(E, o, v) {
    E.box(0, 0.003, 0, 0.15, 0.005, 0.1, RAM_C.papier, TL.paper, v * 0.5); E.box(0.01, 0.0065, 0.004, 0.13, 0.002, 0.085, [0.86, 0.82, 0.7], TL.paper, v * 0.5);
    if (v < 0.4) E.box(0, 0.008, 0, 0.014, 0.003, 0.014, [0.58, 0.12, 0.1], TL.plain);
  },
  cheval_bois(E) {
    const c = RAM_C.boisClair;
    E.box(0, 0.018, 0, 0.09, 0.034, 0.035, c, TL.wood); E.box(0.05, 0.034, 0, 0.026, 0.04, 0.026, c, TL.wood, 0, 0, -0.5); E.box(0.07, 0.054, 0, 0.034, 0.022, 0.022, c, TL.wood);
    for (const [x, z] of [[-0.03, 0.012], [-0.03, -0.012], [0.03, 0.012]]) E.box(x, 0.012, z + Math.sign(z) * 0.02, 0.012, 0.012, 0.04, c, TL.wood);
    E.box(-0.055, 0.024, 0, 0.03, 0.008, 0.008, [0.4, 0.3, 0.2], TL.wood, 0, 0, 0.6);
  },
  soldat(E) {
    E.box(0, 0.007, 0, 0.026, 0.012, 0.014, [0.2, 0.26, 0.56], TL.plain); E.box(-0.024, 0.006, 0, 0.022, 0.011, 0.012, [0.66, 0.16, 0.14], TL.plain);
    E.box(0.022, 0.007, 0, 0.012, 0.012, 0.012, [0.84, 0.7, 0.6], TL.plain); E.box(0.03, 0.007, 0, 0.006, 0.014, 0.014, RAM_C.noir, TL.plain);
    E.box(0.005, 0.012, 0.009, 0.05, 0.004, 0.004, RAM_C.fer, TL.metal);
  },
  toupie(E) { const c = [0.78, 0.62, 0.38]; E.box(0, 0.02, 0, 0.04, 0.026, 0.04, c, TL.wood, 0, 0, 1.1); E.box(0.014, 0.02, 0, 0.03, 0.03, 0.03, c, TL.wood, RAM_PI / 4, 0, 1.1); E.box(-0.024, 0.008, 0, 0.012, 0.004, 0.004, RAM_C.fer, TL.metal, 0, 0, 1.1); },
  sabot(E) {
    const c = [0.62, 0.45, 0.28];
    E.box(0, 0.032, 0, 0.17, 0.062, 0.07, c, TL.wood); E.box(0.075, 0.026, 0, 0.05, 0.05, 0.066, c, TL.wood, 0, 0, -0.3);
    E.box(-0.03, 0.063, 0, 0.08, 0.004, 0.05, [0.12, 0.09, 0.07], TL.plain);
  },
  gant(E, o, v) {
    const c = RAM_C.laine;
    E.box(0, 0.008, 0, 0.095, 0.016, 0.09, c, TL.wool, v * 0.4);
    for (let k = 0; k < 4; k++) E.box(0.07 + Math.abs(k - 1.5) * -0.006, 0.007, -0.033 + k * 0.022, 0.06, 0.014, 0.018, c, TL.wool, v * 0.4);
    E.box(0.02, 0.007, 0.06, 0.05, 0.014, 0.02, c, TL.wool, v * 0.4 - 0.7);
  },
  pipe(E) { const c = [0.92, 0.9, 0.85]; E.box(0.04, 0.018, 0, 0.026, 0.034, 0.026, c, TL.plain); E.box(0.04, 0.034, 0, 0.016, 0.002, 0.016, [0.16, 0.14, 0.12], TL.plain); E.box(-0.015, 0.007, 0, 0.1, 0.008, 0.008, c, TL.plain); },
  chapelet(E, o, v) {
    const c = [0.74, 0.6, 0.36];
    for (let k = 0; k < 12; k++) { const a = k / 12 * RAM_PI * 2; E.box(Math.cos(a) * 0.05, 0.004, Math.sin(a) * 0.035, 0.009, 0.008, 0.009, c, TL.wood); }
    E.box(0.07, 0.003, 0, 0.03, 0.005, 0.006, c, TL.wood); E.box(0.076, 0.003, 0, 0.006, 0.005, 0.02, c, TL.wood);
  },
  image(E, o, v) { E.box(0, 0.002, 0, 0.07, 0.003, 0.11, RAM_C.papier, TL.paper, v); E.box(0, 0.0036, 0, 0.05, 0.001, 0.07, [0.36, 0.5, 0.74], TL.plain, v); E.box(0, 0.0042, 0.006, 0.02, 0.001, 0.03, [0.92, 0.84, 0.6], TL.plain, v); },
  ex_voto(E) { const c = RAM_C.cire; E.box(0, 0.006, 0.004, 0.034, 0.012, 0.034, c, TL.plain, RAM_PI / 4); for (const s of [-1, 1]) E.box(s * 0.012, 0.006, -0.014, 0.024, 0.012, 0.024, c, TL.plain); },
  chandelle(E) { E.box(0, 0.011, 0, 0.022, 0.022, 0.05, [0.94, 0.9, 0.78], TL.plain); E.box(0, 0.011, 0.028, 0.003, 0.003, 0.008, RAM_C.noir, TL.plain); },
  gourde(E) {
    E.box(0, 0.016, 0, 0.12, 0.03, 0.15, [0.68, 0.7, 0.72], TL.metal, 0.4); E.box(Math.sin(0.4) * 0.085, 0.016, Math.cos(0.4) * 0.085, 0.024, 0.024, 0.03, RAM_C.fer, TL.metal, 0.4);
    E.box(-0.05, 0.002, 0.1, 0.25, 0.004, 0.02, RAM_C.cuir, TL.leather, 1.3);
  },
  chapeau(E) {
    const c = [0.15, 0.14, 0.13];
    E.box(0, 0.006, 0, 0.32, 0.012, 0.28, c, TL.cloth); E.box(0, 0.006, 0, 0.26, 0.012, 0.32, c, TL.cloth, RAM_PI / 4);
    E.box(0, 0.06, 0, 0.16, 0.1, 0.14, c, TL.cloth); E.box(0, 0.02, 0, 0.165, 0.022, 0.145, [0.3, 0.22, 0.16], TL.leather);
  },
  cle(E) {
    const c = RAM_C.fer;
    E.box(0, 0.006, 0, 0.1, 0.012, 0.012, c, TL.iron);
    for (let k = 0; k < 6; k++) { const a = k * RAM_PI / 3; E.box(-0.07 + Math.sin(a) * 0.017, 0.006, Math.cos(a) * 0.017, 0.021, 0.01, 0.008, c, TL.iron, a); }
    E.box(0.042, 0.006, 0.018, 0.018, 0.012, 0.028, c, TL.iron);
  },
  poupee(E) {
    const c = [0.8, 0.7, 0.62];
    E.box(0, 0.016, 0, 0.12, 0.03, 0.08, [0.56, 0.4, 0.36], TL.cloth); E.box(0.09, 0.022, 0, 0.06, 0.042, 0.06, c, TL.doll);
    for (const s of [-1, 1]) { E.box(0.02, 0.012, s * 0.06, 0.07, 0.022, 0.022, c, TL.cloth, s * 0.4); E.box(-0.1, 0.012, s * 0.022, 0.08, 0.022, 0.024, c, TL.cloth); }
  },
  sonnaille(E) {
    E.box(0, 0.035, 0, 0.07, 0.07, 0.05, [0.5, 0.42, 0.28], TL.metal, 0, 0, RAM_PI / 2 - 0.2); E.box(-0.04, 0.035, 0, 0.012, 0.06, 0.04, [0.12, 0.1, 0.08], TL.plain, 0, 0, RAM_PI / 2 - 0.2);
    E.box(0.1, 0.003, 0.04, 0.24, 0.006, 0.03, RAM_C.cuir, TL.leather, 0.5);
  },
  // ---------------------------------------------------------------- choses anciennes, raretés
  tesson(E, o, v) { E.box(0, 0.006, 0, 0.07, 0.008, 0.05, RAM_C.terre, TL.terracotta, v * 3, 0, 0.12); E.box(0.03, 0.009, 0.005, 0.03, 0.008, 0.045, [0.66, 0.38, 0.24], TL.terracotta, v * 3, 0, 0.35); },
  piece_ancienne(E) { ramDisque(E, 0, 0, 0, 0.026, 0.004, [0.56, 0.7, 0.5], TL.metal); },
  pointe(E) { const c = [0.36, 0.34, 0.32]; E.box(0, 0.003, 0, 0.022, 0.006, 0.026, c, TL.stone, RAM_PI / 4); E.box(0, 0.003, -0.016, 0.01, 0.005, 0.014, c, TL.stone); },
  perle(E) { ramBoule(E, 0, 0, 0, 0.012, [0.24, 0.42, 0.78], TL.plain, 0.011); E.box(0, 0.0055, 0, 0.013, 0.004, 0.013, [0.9, 0.78, 0.26], TL.plain); },
  fibule(E) { const c = RAM_C.bronze; E.box(0, 0.012, 0, 0.034, 0.01, 0.008, c, TL.metal, 0, 0, 0.5); E.box(0.024, 0.012, 0, 0.03, 0.01, 0.008, c, TL.metal, 0, 0, -0.5); E.box(0.008, 0.003, 0, 0.06, 0.003, 0.003, [0.5, 0.5, 0.42], TL.metal); },
  percee(E) { const c = RAM_C.pierre; E.box(0, 0.022, 0, 0.09, 0.042, 0.066, c, TL.stone, 0.2); E.box(0, 0.024, 0, 0.072, 0.046, 0.072, c, TL.stone, 0.2 + RAM_PI / 4); E.box(0.008, 0.044, 0, 0.016, 0.004, 0.016, [0.06, 0.06, 0.06], TL.plain); },
  fossile(E) {
    const c = [0.7, 0.66, 0.58];
    E.box(0, 0.015, 0, 0.09, 0.03, 0.09, c, TL.stone); E.box(0, 0.016, 0, 0.074, 0.032, 0.074, c, TL.stone, RAM_PI / 4);
    for (let k = 0; k < 3; k++) E.box(0, 0.031 + k * 0.001, 0, 0.06 - k * 0.018, 0.002, 0.06 - k * 0.018, [0.56, 0.52, 0.44], TL.stone, k * 0.5);
  },
  portrait(E) {
    E.box(0, 0.004, 0, 0.09, 0.008, 0.11, [0.3, 0.2, 0.15], TL.leather); E.box(0, 0.0085, 0, 0.07, 0.002, 0.09, [0.72, 0.72, 0.76], TL.metal);
    E.box(0.095, 0.004, 0, 0.09, 0.008, 0.11, [0.42, 0.1, 0.12], TL.cloth);
  },
  medaillon(E) { E.box(0, 0.004, 0, 0.032, 0.008, 0.042, RAM_C.laiton, TL.gold); E.box(0, 0.004, 0, 0.036, 0.007, 0.036, RAM_C.laiton, TL.gold, RAM_PI / 4); for (let k = 0; k < 5; k++) E.box(0.01 + k * 0.01, 0.002, 0.03 + k * 0.008, 0.008, 0.003, 0.004, RAM_C.laiton, TL.gold, 0.7); },
};

// la trouvaille comme un « objet posé » (o.data.k : sa sorte ; o.tx, o.tz : sa pente ; o.v : son détail)
const RAM_T1 = new Float32Array(12), RAM_T2 = new Float32Array(12);
PROP_MODELS.r_objet = function (E, o) {
  const S = o && o.data && typeof RAM_SORTES !== 'undefined' ? RAM_SORTES[o.data.k] : null, f = S && RAM_MOD[S.mod];
  if (!f) return;
  if (o.tx || o.tz) { m34TR(RAM_T1, 0, 0, 0, o.tx || 0, 0, o.tz || 0); m34Mul(RAM_T2, E.M, RAM_T1); E.M.set(RAM_T2); }
  // (quelques millimètres au-dessus du sol ou du meuble : une pièce, un papier ne s'y enfoncent pas, de loin)
  E.M[7] += 0.006;
  f(E, o, o.v || 0);
};

// la boîte d'un modèle (repère de la trouvaille) : pour viser, pour l'éclat ; relevée une fois par modèle
const RAM_BB = {};
function ramBoite(mod) {
  if (RAM_BB[mod]) return RAM_BB[mod];
  const f = RAM_MOD[mod];
  let x0 = 1e9, y0 = 1e9, z0 = 1e9, x1 = -1e9, y1 = -1e9, z1 = -1e9;
  const M = new Float32Array(12);
  const rec = (cx, cy, cz, sx, sy, sz, ry, rx, rz) => {
    m34TR(M, cx, cy, cz, rx || 0, ry || 0, rz || 0);
    for (let i = 0; i < 3; i++) {
      const e = Math.abs(M[i * 4]) * sx / 2 + Math.abs(M[i * 4 + 1]) * sy / 2 + Math.abs(M[i * 4 + 2]) * sz / 2, m = M[i * 4 + 3];
      if (i === 0) { x0 = Math.min(x0, m - e); x1 = Math.max(x1, m + e); } else if (i === 1) { y0 = Math.min(y0, m - e); y1 = Math.max(y1, m + e); } else { z0 = Math.min(z0, m - e); z1 = Math.max(z1, m + e); }
    }
  };
  const E = { M: new Float32Array(12), box: (cx, cy, cz, sx, sy, sz, c, t, ry, rx, rz) => rec(cx, cy, cz, sx, sy, sz, ry, rx, rz), bx: (cx, y, cz, sx, sy, sz, c, t, ry, rx, rz) => rec(cx, y + sy / 2, cz, sx, sy, sz, ry, rx, rz) };
  try { if (f) f(E, { v: 0.5, data: {} }, 0.5); } catch (e) { /* rien */ }
  const b = x1 > x0 ? { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, cz: (z0 + z1) / 2, r: Math.max(0.02, Math.hypot(x1 - x0, z1 - z0) / 2), h: Math.max(0.006, y1) } : { cx: 0, cy: 0.02, cz: 0, r: 0.08, h: 0.04 };
  return (RAM_BB[mod] = b);
}

// ---------------------------------------------------------------- icônes des objets nouveaux (formes « r_… »)
{
  const _ip = iconPaint;
  iconPaint = function (shape, c1, c2) {
    if (typeof shape !== 'string' || !shape.startsWith('r_')) return _ip(shape, c1, c2);
    const kind = shape.slice(2);
    const pb = new PixelBuf(16, 16), P = rampOf(c1 || '#aaaaaa'), Q = rampOf(c2 || '#555555');
    const S = (cx, cy, r, pal, o) => drawSphere(pb, cx, cy, r, pal || P, (cx * 7 + cy * 3) | 0, o || {});
    const L = (x0, y0, x1, y1, c, w) => drawLine(pb, x0, y0, x1, y1, typeof c === 'string' ? hexc(c) : c, w || 1);
    const px = (x, y, c) => pb.set(Math.round(x), Math.round(y), typeof c === 'string' ? hexc(c) : c);
    const R = (x0, y0, x1, y1, f) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) pb.set(x, y, typeof f === 'function' ? f(x, y) : f); };
    switch (kind) {
      case 'ficelle': // une pelote lâche, un bout qui pend
        for (let a = 0; a < 30; a++) { const t = a / 30 * TAU * 2.2, r = 4.5 - a * 0.08; px(7 + Math.cos(t) * r, 7 + Math.sin(t) * r * 0.8, a % 3 ? P[2] : P[3]); }
        L(10, 10, 14, 15, P[1]); break;
      case 'chiffon': // un carré de toile froissé, une rayure
        fillPoly(pb, [[2, 5], [13, 3], [14, 12], [8, 14], [1, 11]], P, (x, y) => 0.7 + ((x + y) % 4 === 0 ? -0.12 : 0));
        L(3, 9, 13, 7, Q[2]); L(3, 10, 13, 8, Q[1]); break;
      case 'bouteille': // une bouteille de verre vert, le goulot en haut
        R(5, 7, 10, 14, (x, y) => rampPick(P, 0.95 - (x - 5) * 0.09, x, y)); R(6, 5, 9, 6, P[2]); R(7, 1, 8, 4, P[1]); px(6, 9, [200, 230, 210]); px(6, 10, [170, 210, 190]); break;
      case 'liege': S(8, 9, 5.5, P, { sq: 0.7, noise: 0.35 }); px(8, 6, [30, 24, 20]); px(8, 7, [40, 30, 24]); break;
      case 'coquille': // une coquille noire, nacrée dedans
        fillPoly(pb, [[2, 9], [6, 4], [13, 5], [14, 10], [9, 13]], P, (x, y) => 0.6 + (y - 4) * 0.03);
        fillPoly(pb, [[5, 9], [7, 6], [12, 7], [12, 10], [8, 11]], Q, (x, y) => 0.8 - (x - 5) * 0.04); break;
      case 'faines': for (const [x, y] of [[4, 6], [9, 4], [11, 9], [6, 11], [12, 13]]) { fillPoly(pb, [[x, y - 2], [x + 2, y + 2], [x - 2, y + 2]], P, () => 0.7); px(x, y, P[3]); } break;
      case 'epingle': L(3, 14, 12, 3, P[2]); L(4, 14, 13, 3, P[3]); S(12.5, 3.5, 2.2, Q); break;
      case 'cheval': // un petit cheval de bois, de profil
        R(4, 7, 11, 10, (x, y) => rampPick(P, 0.85 - (y - 7) * 0.08, x, y)); R(10, 3, 12, 7, P[2]); R(12, 3, 14, 5, P[2]);
        for (const x of [4, 6, 10]) L(x, 11, x, 14, P[1]); L(3, 7, 2, 10, P[0]); px(13, 4, [30, 20, 10]); break;
      case 'soldat': // un fantassin de plomb
        S(8, 3, 1.8, rampOf('#e0c0a8')); R(7, 1, 9, 1, [20, 20, 24]); R(6, 5, 10, 9, (x, y) => rampPick(P, 0.85 - (x - 6) * 0.05, x, y));
        R(6, 10, 10, 14, (x, y) => rampPick(Q, 0.85 - (x - 6) * 0.05, x, y)); L(11, 2, 11, 9, [90, 90, 96]); L(8, 10, 8, 14, C(Q[0], 0.8)); break;
      case 'toupie': fillPoly(pb, [[3, 5], [13, 5], [8, 15]], P, (x) => 0.9 - (x - 3) * 0.05); R(4, 3, 12, 5, P[1]); R(7, 1, 9, 2, P[0]); L(4, 7, 12, 7, C(P[0], 0.8)); break;
      case 'sabot': fillPoly(pb, [[1, 7], [11, 6], [15, 10], [14, 13], [2, 13]], P, (x, y) => 0.9 - (y - 6) * 0.05); R(3, 7, 8, 8, [36, 26, 18]); break;
      case 'gant': R(4, 7, 11, 14, (x, y) => rampPick(P, 0.8 - (x - 4) * 0.04 + ((x + y) % 2 ? 0.05 : 0), x, y)); for (let k = 0; k < 4; k++) R(5 + k * 2, 2 + (k === 0 || k === 3 ? 1 : 0), 5 + k * 2 + 1, 7, P[2]); R(1, 8, 4, 10, P[1]); break;
      case 'pipe': S(4.5, 7, 3, P, { sq: 1.2 }); R(3, 4, 6, 4, [40, 34, 30]); L(7, 9, 14, 12, P[2], 2); break;
      case 'gourde': S(8, 9, 5.8, P, { sq: 0.85 }); R(7, 1, 9, 3, [70, 70, 76]); L(2, 2, 13, 14, Q[1]); S(6, 7, 1.2, rampOf('#f0f4f8')); break;
      case 'chapeau': R(1, 11, 14, 12, (x, y) => rampPick(P, 0.75 - (y - 11) * 0.1, x, y)); R(4, 4, 11, 10, (x, y) => rampPick(P, 0.85 - (x - 4) * 0.05, x, y)); R(4, 9, 11, 9, [90, 60, 40]); break;
      case 'crane': S(7, 8, 5, P, { sq: 0.9 }); R(10, 9, 15, 11, P[2]); R(5, 7, 6, 8, [20, 16, 14]); R(9, 7, 10, 8, [20, 16, 14]); for (let x = 11; x < 15; x += 2) px(x, 12, P[3]); break;
      case 'pointe': fillPoly(pb, [[8, 1], [13, 11], [8, 9], [3, 11]], P, (x) => 0.9 - Math.abs(x - 8) * 0.06); L(8, 9, 8, 14, P[0]); break;
      case 'fibule': for (let a = 0; a < 24; a++) { const t = RAM_PI + a / 23 * RAM_PI; px(8 + Math.cos(t) * 6, 9 + Math.sin(t) * 5, rampPick(P, 0.75, a, 1)); px(8 + Math.cos(t) * 5, 9 + Math.sin(t) * 4, rampPick(Q, 0.6, a, 2)); } L(2, 9, 14, 9, P[1]); break;
      case 'perle': S(8, 8, 5, P); L(3, 8, 13, 8, Q[2], 2); R(7, 7, 9, 9, [18, 18, 22]); px(6, 6, [230, 240, 255]); break;
      case 'percee': S(8, 9, 6, P, { sq: 0.8, flatBottom: 0.7 }); S(8, 8, 1.8, ramp(['#101010', '#1a1a1a', '#222222'])); break;
      case 'portrait': R(1, 3, 7, 13, Q[1]); R(2, 4, 6, 12, Q[3]); R(8, 3, 14, 13, P[1]); S(4, 7, 1.6, rampOf('#9a9aa0')); R(3, 9, 5, 11, Q[2]); break;
      case 'coeur': S(5.5, 6.5, 3.2, P); S(10.5, 6.5, 3.2, P); fillPoly(pb, [[2.5, 7.5], [13.5, 7.5], [8, 14]], P, (x, y) => 0.8 - (y - 7) * 0.03); break;
      default: S(8, 8, 5, P);
    }
    edgeDarken(pb, 0.85);
    return pb;
  };
}
