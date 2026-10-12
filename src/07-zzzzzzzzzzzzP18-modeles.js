// ============================================================================
//  LES CASCADES, LES GROTTES ET LES COINS DE PARADIS (agent P18) — LES MODÈLES
//  En boîtes, comme le reste : rochers de rive, bouche de la grotte derrière la
//  chute, source, faille, perte, souche et pierre plate où s'asseoir, banc du
//  Belvédère, muret du verger, l'aven (dehors), et dans les grottes : fossiles,
//  draperies, peintures (mains, les Trois, le Ver, les feux du Guet, la porte,
//  les bêtes, l'œil), l'ocre, les signes de la dalle, la lueur du dehors, le
//  carnet du géologue, les flèches peintes, le rayon de jour sous l'aven.
// ============================================================================
const P18C = {
  roche: rgbf('#a8a296'), rocheS: rgbf('#8c867a'), mousse: rgbf('#4e7a3a'), noir: [0.025, 0.025, 0.03], eau: rgbf('#5a7a8a'), ecume: [0.85, 0.9, 0.92],
  ocre: rgbf('#a0482c'), ocreC: rgbf('#c07a3a'), suie: rgbf('#1c1a18'), craie: rgbf('#d8d0bc'), calc: rgbf('#cfc3a4'), bois: rgbf('#6a5038'), boisS: rgbf('#4a3826'),
};
const p18H = (o, k) => hash2i(Math.round(o.x * 5), Math.round(o.z * 5), k || 3);
Object.assign(PROP_MODELS, {
  // un rocher de rive (data.v : forme ; data.mousse : un peu de mousse dessus)
  p18_roc(E, o) {
    const v = ((o.data && o.data.v) || 0) % 4, h = p18H(o, 5) * 6;
    const F = [[[0, 0, 0, 1.3, 0.8, 1.0], [0.25, 0.7, 0.1, 0.8, 0.45, 0.7]], [[0, 0, 0, 1.6, 0.6, 1.1], [-0.4, 0.5, 0.2, 0.7, 0.5, 0.6], [0.5, 0.45, -0.2, 0.6, 0.35, 0.5]],
      [[0, 0, 0, 0.9, 1.2, 0.9], [0.1, 1.1, 0, 0.6, 0.4, 0.6]], [[0, 0, 0, 1.8, 0.45, 1.3], [0.3, 0.4, 0.1, 0.9, 0.35, 0.8]]][v];
    F.forEach(([x, y, z, sx, sy, sz], i) => E.bx(x, y - 0.1, z, sx, sy + 0.1, sz, i ? P18C.roche : P18C.rocheS, mt(M_ROCK), h + i * 0.7));
    if (o.data && o.data.mousse) E.bx(0.1, F[0][4] - 0.08, 0, F[0][3] * 0.7, 0.1, F[0][5] * 0.6, P18C.mousse, TL.leaves, h);
  },
  // la bouche de la grotte, au fond du passage derrière le rideau (face vers +z : le rideau)
  p18_bouche(E) {
    E.bx(0, 0, -0.2, 3.4, 4.0, 0.3, P18C.noir, 0);
    E.bx(0, 0, -1.2, 2.6, 3.4, 0.3, [0.01, 0.01, 0.012], 0);
    for (const s of [-1, 1]) { E.bx(s * 2.1, -0.3, 0.05, 1.0, 4.8, 1.0, P18C.rocheS, mt(M_CLIFF), s * 0.1); E.bx(s * 1.75, 2.6, 0.12, 0.6, 1.8, 0.7, P18C.roche, mt(M_CLIFF), s * 0.3); }
    E.bx(0, 3.8, 0.1, 5.0, 1.1, 1.1, P18C.rocheS, mt(M_CLIFF), 0.05);
    E.box(-0.6, 3.75, 0.45, 0.5, 0.5, 0.06, P18C.mousse, TL.leaves); E.box(0.9, 3.6, 0.48, 0.4, 0.7, 0.06, P18C.mousse, TL.leaves);
    E.bx(0, -0.05, 0.6, 3.2, 0.12, 1.4, P18C.rocheS, mt(M_ROCK)); // le seuil, mouillé
  },
  // la source : des pierres moussues et une fente d'où l'eau sort
  p18_source(E, o) {
    const h = p18H(o, 7) * 6;
    E.bx(0, -0.2, -0.4, 1.8, 1.1, 0.9, P18C.rocheS, mt(M_ROCK), h * 0.1);
    for (const s of [-1, 1]) E.bx(s * 0.9, -0.2, 0, 0.8, 0.9, 1.1, P18C.roche, mt(M_ROCK), s * 0.4 + h);
    E.bx(0, 0, 0.08, 0.5, 0.5, 0.2, P18C.noir, 0);
    E.box(0, 0.12, 0.45, 0.45, 0.08, 0.7, P18C.eau, TL.plain, 0, 0.35);
    E.bx(-0.5, 0.65, -0.3, 0.7, 0.12, 0.6, P18C.mousse, TL.leaves, h);
  },
  // la faille d'où sort la cascade des Saules (sur la paroi ; face vers +z)
  p18_faille(E) {
    E.bx(0, -0.2, -0.1, 0.55, 2.4, 0.4, P18C.noir, 0);
    for (const s of [-1, 1]) E.bx(s * 0.55, -0.5, 0.05, 0.6, 3.0, 0.5, P18C.rocheS, mt(M_CLIFF), s * 0.2);
    E.bx(0, 2.1, 0.05, 1.5, 0.5, 0.55, P18C.roche, mt(M_CLIFF), 0.1);
  },
  // la perte : l'eau tourne et s'enfonce
  p18_perte(E, o, t) {
    for (let k = 0; k < 4; k++) E.bx(0, -0.25 - k * 0.05, 0, 2.4 - k * 0.5, 0.06, 2.4 - k * 0.5, k > 1 ? P18C.noir : P18C.eau, 0, k * 0.4);
    for (let k = 0; k < 9; k++) { const a = k / 9 * TAU; E.bx(Math.cos(a) * 1.75, -0.3, Math.sin(a) * 1.75, 0.6, 0.5 + (k % 3) * 0.15, 0.5, P18C.roche, mt(M_ROCK), a); }
  },
  // une vieille souche où s'asseoir
  p18_souche(E) { E.bx(0, 0, 0, 0.75, 0.48, 0.7, P18C.bois, TL.bark, 0.3); E.bx(0, 0.47, 0, 0.66, 0.04, 0.6, rgbf('#a0865e'), TL.wood, 0.3); E.bx(0.45, 0, 0.1, 0.35, 0.18, 0.2, P18C.boisS, TL.bark, 1.2); },
  // une pierre plate, au bord de l'eau
  p18_pierre_plate(E) { E.bx(0, 0, 0, 1.4, 0.32, 1.0, P18C.roche, mt(M_ROCK), 0.2); E.bx(0.1, 0.3, 0, 1.0, 0.06, 0.7, rgbf('#8a8478'), mt(M_ROCK), 0.25); },
  // le banc de pierre du Belvédère (face vers +z : la vallée)
  p18_banc(E) { for (const s of [-0.7, 0.7]) E.bx(s, 0, 0, 0.3, 0.42, 0.45, P18C.rocheS, mt(M_ROCK)); E.bx(0, 0.42, 0, 1.9, 0.12, 0.55, P18C.roche, mt(M_ROCK)); E.bx(0.85, 0.54, -0.1, 0.12, 0.05, 0.12, rgbf('#9a8a6a'), TL.plain); },
  // un muret de pierres sèches (le verger)
  p18_muret(E, o) { const h = p18H(o, 9) * 5; for (let k = 0; k < 6; k++) E.bx(-1.25 + k * 0.5, 0, 0, 0.52, 0.32 + (k % 2) * 0.1, 0.45, k % 2 ? P18C.roche : P18C.rocheS, mt(M_ROCK), h + k * 0.2); for (let k = 0; k < 4; k++) E.bx(-0.9 + k * 0.6, 0.38, 0.02, 0.5, 0.22, 0.4, P18C.roche, mt(M_ROCK), h + k); E.bx(-0.6, 0.6, 0, 0.8, 0.06, 0.35, P18C.mousse, TL.leaves); },
  // l'aven, dehors : un trou noir bordé de pierres et de racines
  p18_aven(E, o) {
    const h = p18H(o, 11) * 6;
    for (let k = 0; k < 3; k++) E.bx(0, -0.4 + k * 0.12, 0, 5.4 - k * 0.6, 0.12, 5.4 - k * 0.6, P18C.noir, 0, k * 0.5 + h);
    for (let k = 0; k < 14; k++) { const a = k / 14 * TAU + h; E.bx(Math.cos(a) * 3.1, -0.4, Math.sin(a) * 3.1, 1.2, 0.6 + (k % 3) * 0.25, 0.8, k % 2 ? P18C.roche : P18C.rocheS, mt(M_ROCK), a); }
    for (let k = 0; k < 5; k++) { const a = k * 1.3 + h; E.box(Math.cos(a) * 2.6, -0.3, Math.sin(a) * 2.6, 0.12, 1.4, 0.12, rgbf('#4a3a2a'), TL.bark, a, 0.8 * Math.cos(a), 0.8 * Math.sin(a)); }
  },
  // ---- dans les grottes
  // une ammonite prise dans la roche (on ne la détache pas : celles qu'on détache sont des « p18_fossile »)
  p18_ammonite(E, o) {
    const h = p18H(o, 13) * 6;
    E.bx(0, 0, 0, 1.1, 0.7, 0.9, SPC.roche, mt(M_SARGILE), h);
    for (let k = 0; k < 9; k++) { const a = k * 0.75, r = 0.06 + k * 0.03; E.bx(Math.cos(a) * r, 0.7, Math.sin(a) * r, 0.08, 0.035, 0.08, P18C.craie, TL.plain, a); }
  },
  p18_fossile(E, o) {
    const h = p18H(o, 15) * 6;
    E.bx(0, 0, 0, 0.5, 0.22, 0.42, SPC.rocheS, mt(M_SARGILE), h);
    for (let k = 0; k < 8; k++) { const a = k * 0.8, r = 0.03 + k * 0.022; E.bx(Math.cos(a) * r, 0.22, Math.sin(a) * r, 0.05, 0.03, 0.05, rgbf('#e0d4b4'), TL.plain, a); }
  },
  // une draperie : de fines lames de calcite qui pendent de la voûte (posée à la voûte, vers le bas)
  p18_draperie(E, o) {
    const v = p18H(o, 17) * 10, n = 7;
    for (let k = 0; k < n; k++) { const x = (k - n / 2) * 0.32, L = 1.4 + ((k * 7 + v) % 5) * 0.55 + Math.sin(k * 0.9 + v) * 0.3; E.box(x, -L / 2, Math.sin(k * 1.4 + v) * 0.18, 0.05, L, 0.36, k % 2 ? SPC.calc : SPC.calcS, mt(M_SCALCITE), 0.2 * Math.sin(k + v)); }
  },
  // une peinture sur la paroi (face vers +z, contre le mur ; data.k : ce qu'elle montre)
  p18_peinture(E, o) {
    const k = o.data && o.data.k, z = 0.02;
    E.bx(0, 0.5, -0.06, 2.4, 1.9, 0.1, rgbf('#7a6e5e'), mt(M_SARGILE));
    const P = (x, y, w, h, c, a) => E.box(x, y, z + 0.01, w, h, 0.012, c, TL.plain, 0, 0, a || 0);
    if (k === 'mains') {
      for (let i = 0; i < 9; i++) { const x = -0.95 + (i % 5) * 0.45 + (i > 4 ? 0.2 : 0), y = 0.9 + (i > 4 ? 0.6 : 0) + Math.sin(i * 2.3) * 0.1, c = i === 6 ? P18C.suie : i % 3 ? P18C.ocre : P18C.ocreC; P(x, y, 0.16, 0.18, c, i * 0.2); for (let f = 0; f < (i === 2 ? 4 : 5); f++) P(x - 0.08 + f * 0.04, y + 0.15, 0.025, 0.11, c, (f - 2) * 0.12 + i * 0.2); }
    } else if (k === 'trois') {
      const fig = (x, c, sun) => { P(x, 1.0, 0.18, 0.55, c); P(x, 1.37, 0.12, 0.12, c); P(x - 0.14, 1.05, 0.06, 0.3, c, 0.4); P(x + 0.14, 1.05, 0.06, 0.3, c, -0.4); if (sun) for (let r = 0; r < 6; r++) P(x + Math.cos(r * 1.05) * 0.24, 1.6 + Math.sin(r * 1.05) * 0.12, 0.05, 0.05, rgbf('#e0b040')); P(x, 0.62, 0.12, 0.03, P18C.suie); };
      fig(-0.7, P18C.ocreC, true); fig(0, rgbf('#8a8478'), false); fig(0.7, P18C.suie, false);
      for (let r = 0; r < 4; r++) P(0 + (r - 1.5) * 0.08, 1.48 + (r % 2) * 0.05, 0.07, 0.07, rgbf('#6a6458'));
    } else if (k === 'ver') {
      for (let i = 0; i < 26; i++) { const u = i / 25, x = -1.05 + u * 2.1, y = 0.9 + Math.sin(u * 6.2) * 0.32; P(x, y, 0.1, 0.07, P18C.ocre, Math.cos(u * 6.2) * 0.6); }
      P(-0.15, 0.92, 0.2, 0.3, P18C.suie); P(-0.15, 0.92, 0.1, 0.18, rgbf('#7a6e5e'));
      for (let i = 0; i < 5; i++) P(0.2 + i * 0.12, 1.45 - Math.abs(i - 2) * 0.12, 0.12, 0.05, rgbf('#5a5248'), (i - 2) * 0.3);
    } else if (k === 'feux') {
      for (let i = 0; i < 5; i++) { const x = -0.9 + i * 0.45; P(x, 0.9, 0.04, 0.42, P18C.suie); P(x, 1.15, 0.07, 0.07, P18C.suie); P(x + 0.12, 1.28, 0.08, 0.12, rgbf('#d06a2a')); P(x + 0.12, 1.36, 0.05, 0.07, rgbf('#e8b040')); }
      P(0, 0.62, 2.0, 0.04, P18C.suie, 0.06);
    } else if (k === 'porte') {
      P(-0.32, 1.0, 0.08, 0.9, P18C.suie); P(0.32, 1.0, 0.08, 0.9, P18C.suie); P(0, 1.47, 0.76, 0.08, P18C.suie);
      P(0, 1.0, 0.5, 0.82, rgbf('#9a907e')); P(-0.75, 0.9, 0.06, 0.4, P18C.ocre); P(-0.75, 1.13, 0.08, 0.08, P18C.ocre);
    } else if (k === 'cerfs') {
      for (let i = 0; i < 3; i++) { const x = -0.75 + i * 0.75, y = 1.0 + (i % 2) * 0.2, c = i === 1 ? P18C.suie : P18C.ocre; P(x, y, 0.42, 0.18, c); P(x + 0.24, y + 0.12, 0.1, 0.1, c); for (const s of [-0.14, 0.14]) P(x + s, y - 0.15, 0.04, 0.16, c); if (i !== 1) { P(x + 0.27, y + 0.28, 0.03, 0.2, c, 0.4); P(x + 0.33, y + 0.28, 0.03, 0.2, c, -0.4); } }
      for (let i = 0; i < 3; i++) P(-0.6 + i * 0.5, 0.55, 0.03, 0.22, P18C.suie);
    } else if (k === 'oeil') {
      P(0, 1.0, 1.7, 0.6, P18C.suie); P(0, 1.0, 1.3, 0.42, rgbf('#cfc6b0')); P(0, 1.0, 0.36, 0.36, P18C.ocre); P(0, 1.0, 0.14, 0.14, P18C.suie);
      for (let i = 0; i < 7; i++) P(-0.6 + i * 0.2, 1.38, 0.04, 0.14, P18C.suie, (i - 3) * 0.15);
    }
  },
  // l'ocre : la paroi rouge, grattée par endroits (face vers +z)
  p18_ocre(E, o) { const h = p18H(o, 19) * 6; E.bx(0, 0.2, -0.1, 1.6, 1.2, 0.2, P18C.ocre, mt(M_SARGILE), 0); for (let k = 0; k < 5; k++) E.box(-0.5 + k * 0.25, 0.5 + Math.sin(k + h) * 0.3, 0.02, 0.18, 0.12, 0.02, P18C.ocreC, TL.plain, 0, 0, k); },
  // un creux taillé dans la dalle du Sanctuaire (data.k : aela, durn, vesh)
  p18_signe(E, o) {
    const k = o.data && o.data.k;
    E.bx(0, 1.15, 0, 0.62, 0.62, 0.12, rgbf('#4a443c'), mt(M_SROCHE));
    E.bx(0, 1.25, 0.07, 0.42, 0.42, 0.02, [0.12, 0.11, 0.1], 0);
    const c = k === 'aela' ? rgbf('#c89a3a') : k === 'durn' ? rgbf('#8a8478') : P18C.suie;
    if (k === 'aela') for (let r = 0; r < 8; r++) E.box(Math.cos(r * 0.785) * 0.13, 1.46 + Math.sin(r * 0.785) * 0.13, 0.09, 0.04, 0.04, 0.01, c, TL.plain);
    else if (k === 'durn') { E.box(0, 1.38, 0.09, 0.2, 0.06, 0.01, c, TL.plain); E.box(0, 1.46, 0.09, 0.14, 0.06, 0.01, c, TL.plain); E.box(0, 1.54, 0.09, 0.08, 0.06, 0.01, c, TL.plain); }
    else { E.box(0, 1.46, 0.09, 0.22, 0.22, 0.01, c, TL.plain); E.box(0, 1.46, 0.095, 0.1, 0.1, 0.01, [0.12, 0.11, 0.1], TL.plain); }
  },
  // la lueur du dehors, au bout du Vestibule (le grondement, la lumière à travers l'eau)
  p18_jour(E) { E.fl = FX_EMIT; E.bx(0, 0.3, 0, 1.6, 2.6, 0.06, [0.16, 0.2, 0.24], TL.plain); E.bx(0, 0.8, 0.02, 0.7, 1.6, 0.04, [0.3, 0.36, 0.42], TL.plain); E.fl = 0; },
  // le carnet du géologue, sur une pierre
  p18_pierre_carnet(E) { E.bx(0, 0, 0, 0.9, 0.55, 0.7, SPC.roche, mt(M_SROCHE), 0.4); E.bx(0, 0.55, 0, 0.3, 0.05, 0.22, rgbf('#5a3e2a'), TL.leather, 0.2); E.bx(0, 0.6, 0, 0.27, 0.01, 0.19, rgbf('#e8dcc0'), TL.paper, 0.2); },
  // une flèche peinte à la craie rouge sur le sol (vers +z : la sortie)
  p18_fleche(E) { const c = rgbf('#a8442a'); E.bx(0, 0.01, -0.25, 0.12, 0.012, 0.8, c, TL.plain); E.box(-0.14, 0.016, 0.2, 0.1, 0.012, 0.42, c, TL.plain, 0.7); E.box(0.14, 0.016, 0.2, 0.1, 0.012, 0.42, c, TL.plain, -0.7); },
  // le jour qui tombe de l'aven : des traits pâles, le jour seulement (modèle animé : l'heure)
  p18_rayon(E, o, t) {
    const h = t && t.hour !== undefined ? t.hour : 12, j = clamp(Math.min((h - 6.3) / 1.2, (18.2 - h) / 1.2), 0, 1);
    if (j <= 0) return;
    E.fl = FX_EMIT;
    for (let k = 0; k < 9; k++) { const a = k * 2.4, r = 0.4 + (k % 3) * 0.6, L = 9 + (k % 4) * 3; E.bx(Math.cos(a) * r, 0.2, Math.sin(a) * r, 0.05, L, 0.05, [0.32 * j, 0.34 * j, 0.32 * j], TL.plain); }
    E.bx(0, 0.02, 0, 3.2, 0.02, 3.2, [0.18 * j, 0.19 * j, 0.17 * j], TL.plain);
    E.fl = 0;
  },
});
Object.assign(PROP_COLL, {
  p18_roc: [0.7, 0.55, 0.9], p18_source: [0.9, 0.7, 0.8], p18_perte: [1.2, 1.2, 0.5], p18_souche: [0.38, 0.35, 0.5], p18_pierre_plate: [0.7, 0.5, 0.36],
  p18_banc: [0.95, 0.3, 0.55], p18_muret: [1.5, 0.25, 0.65], p18_aven: [2.8, 2.8, 1.4], p18_ammonite: [0.55, 0.45, 0.75], p18_pierre_carnet: [0.45, 0.35, 0.6],
});
