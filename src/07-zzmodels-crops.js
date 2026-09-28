// ============================================================================
//  CULTURES EN 3D (suite) : gabarits paramétrés pour les nouvelles plantes
//  (racines, bulbes, feuilles, choux, grandes tiges, rampantes, tuteurs,
//  céréales, buissons, treilles, aromates, fleurs), variétés de couleur, taille
//  propre à chaque pied, spécimens géants.
// ============================================================================
const _hexCache = {};
const hexf = (h) => _hexCache[h] || (_hexCache[h] = rgbf(h));
const NOC = {}; // case vide (icônes, décor)
const _green = [0.45, 0.7, 0.35];
const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const lightc = (c, k) => [Math.min(1.2, c[0] * k + 0.08), Math.min(1.2, c[1] * k + 0.08), Math.min(1.2, c[2] * k + 0.08)];
const lumc = (c) => c[0] * 0.3 + c[1] * 0.55 + c[2] * 0.15;
// feuille / tige : boîte partant de (ox + r0·sin a, y0, oz + r0·cos a), penchée de t vers la direction a
function cropLeaf(E, a, t, len, w, th, col, tex, r0, y0, ox, oz) {
  const sa = Math.sin(a), ca = Math.cos(a), m = len / 2, r = (r0 || 0) + m * Math.sin(t);
  E.box((ox || 0) + sa * r, (y0 || 0) + m * Math.cos(t), (oz || 0) + ca * r, w, len, th, col, tex, a, t, 0);
}
// Couleur de la variété semée
function cropColor(C, c) { const V = C.vars && C.vars[(c && c.vr) || 0]; return hexf((V && V.c) || C.col); }

const CROP_TPL = {
  racine(E, k, ripe, c, C, col, p) {
    const n = p.n || 5, h = p.h || 0.35, vr = c.vr || 0, s = p.shape, dark = s === 'mandra';
    for (let i = 0; i < n; i++) cropLeaf(E, i / n * TAU + vr * 0.7, 0.25 + (i % 2) * 0.22, 0.06 + k * h, 0.05 + k * 0.05, 0.02, dark ? hexf(p.lf) : WHITE, dark ? TL.leaves : TL.carrotTop, 0.03, s === 'rond' || s === 'gros' ? 0.06 + k * 0.1 : 0.02);
    if (s === 'rond') { const r = 0.06 + k * 0.16; E.bx(0, -0.03, 0, r, r * 0.95, r, col, TL.plain); if (p.top) E.bx(0, -0.03 + r * 0.6, 0, r * 1.03, r * 0.36, r * 1.03, hexf(p.top), TL.plain); }
    else if (s === 'long') { const r = 0.05 + k * 0.08; E.bx(0, -0.04, 0, r, 0.05 + k * 0.08, r, col, TL.plain); }
    else if (s === 'gros') { const r = 0.1 + k * 0.22; E.bx(0, -0.05, 0, r, r * 0.75, r, col, TL.plain); E.bx(0.02, -0.05 + r * 0.75, 0, r * 0.6, r * 0.15, r * 0.6, col, TL.plain); }
    else if (s === 'mandra' && k > 0.5) {
      const r = 0.05 + k * 0.07, top = -0.03 + r * 1.1;
      E.bx(0, -0.03, 0, r, r * 1.1, r * 0.9, col, TL.plain);
      if (ripe) { const z = r * 0.45 + 0.004, dk = [0.06, 0.03, 0.03]; E.box(-0.022, top - r * 0.3, z, 0.014, 0.014, 0.01, dk, TL.plain); E.box(0.022, top - r * 0.3, z, 0.014, 0.014, 0.01, dk, TL.plain); E.box(0, top - r * 0.62, z, 0.024, 0.01, 0.01, [0.12, 0.05, 0.05], TL.plain); }
    }
  },
  bulbe(E, k, ripe, c, C, col, p) {
    const n = p.n || 5, H = p.h || 0.45, vr = c.vr || 0, lc = ripe ? hexf('#b8b060') : hexf('#6aa050');
    if (p.cluster) {
      for (let j = 0; j < 3; j++) {
        const a = j * 2.1 + vr, x = Math.sin(a) * 0.1, z = Math.cos(a) * 0.1, r = 0.03 + k * 0.06;
        E.bx(x, -0.02, z, r, r * 1.3, r, col, TL.plain, a);
        for (let i = 0; i < 2; i++) cropLeaf(E, a + i * 1.5, ripe ? 0.95 : 0.15, 0.05 + k * H * 0.8, 0.022, 0.022, lc, TL.plain, 0, r * 1.1, x, z);
      }
      return;
    }
    const r = 0.04 + k * 0.1;
    if (k > 0.3) E.bx(0, -0.03, 0, r, r * 0.9, r, col, TL.plain, vr);
    for (let i = 0; i < n; i++) cropLeaf(E, i / n * TAU + vr, ripe ? 1.1 + (i % 2) * 0.2 : 0.12 + (i % 3) * 0.08, 0.06 + k * H, 0.025, 0.025, lc, TL.plain, 0, k > 0.3 ? r * 0.75 : 0);
  },
  poireau(E, k, ripe, c, C, col) {
    const sh = 0.12 + k * 0.3, w = 0.05 + k * 0.05;
    E.bx(0, -0.02, 0, w, sh, w, hexf('#e8ecd8'), TL.plain);
    for (let i = 0; i < 6; i++) cropLeaf(E, (i % 2 ? 0 : Math.PI) + (c.vr || 0) * 0.2 + i * 0.05, 0.15 + i * 0.1, 0.1 + k * 0.4, 0.07, 0.02, col, TL.plain, 0, sh - 0.02 - i * 0.01);
  },
  feuilles(E, k, ripe, c, C, col, p) {
    const vr = c.vr || 0;
    if (p.head) {
      for (let i = 0; i < 8; i++) cropLeaf(E, i / 8 * TAU + vr, 1.0 + (i % 2) * 0.25, 0.08 + k * 0.2, 0.1 + k * 0.1, 0.02, col, TL.plain, 0.02, 0.01);
      const s = 0.06 + k * 0.16; E.bx(0, 0, 0, s, s * 0.75, s, lightc(col, 1.1), TL.plain, vr);
      return;
    }
    if (p.flat) { for (let i = 0; i < 7; i++) cropLeaf(E, i / 7 * TAU + vr, 1.0 + (i % 2) * 0.15, 0.08 + k * 0.2, 0.07 + k * 0.08, 0.02, col, TL.plain, 0.02, 0.01); return; }
    const n = p.big ? 4 : 6, L0 = (p.big ? 0.2 : 0.12) + k * (p.big ? 0.45 : 0.35), lf = hexf(p.lf || '#3a7a2a');
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU + vr, t = 0.35 + (i % 2) * 0.15;
      cropLeaf(E, a, t, L0, p.big ? 0.05 : 0.03, 0.03, col, TL.plain, 0.02, 0);
      const sa = Math.sin(a), ca = Math.cos(a), st = Math.sin(t), ct = Math.cos(t), bw = (p.big ? 0.22 : 0.1) + k * (p.big ? 0.2 : 0.08);
      E.box(sa * (0.02 + L0 * st + bw * 0.3), L0 * ct + bw * 0.25, ca * (0.02 + L0 * st + bw * 0.3), bw, bw * 1.2, 0.02, lf, TL.leaves, a, t + 0.4, 0);
    }
  },
  chou(E, k, ripe, c, C, col, p) {
    const vr = c.vr || 0, lf = [0.62, 0.85, 0.7];
    for (let i = 0; i < 6; i++) cropLeaf(E, i / 6 * TAU + vr * 0.5, 0.65 + (i % 2) * 0.2, 0.12 + k * 0.25, 0.14 + k * 0.1, 0.02, lf, TL.leaves, 0.03, 0);
    if (k < 0.45) return;
    const s = 0.05 + k * 0.2;
    if (p.grain) {
      E.bx(0, 0, 0, 0.06, 0.12 + k * 0.08, 0.06, hexf('#8ab060'), TL.plain);
      for (const [x, z] of [[0, 0], [0.07, 0.05], [-0.06, 0.06], [0.02, -0.08]]) E.bx(x * k * 1.4, 0.1 + k * 0.08, z * k * 1.4, s * 0.55, s * 0.45, s * 0.55, col, TL.plain, x * 9);
      return;
    }
    if (C.vars && C.vars[vr] && C.vars[vr].n === 'Romanesco') { for (let j = 0; j < 4; j++) E.bx(0, 0.06 + j * s * 0.25, 0, s * (1 - j * 0.22), s * 0.26, s * (1 - j * 0.22), col, TL.plain, j * 0.4); return; }
    E.bx(0, 0.06, 0, s, s * 0.55, s, col, TL.plain); E.bx(0, 0.06 + s * 0.55, 0, s * 0.7, s * 0.14, s * 0.7, col, TL.plain, 0.785);
  },
  haute(E, k, ripe, c, C, col, p) {
    const vr = c.vr || 0;
    if (p.kind === 'topi') {
      const h = 0.2 + k * 1.5;
      for (const [x, z] of [[-0.12, -0.05], [0.1, 0.08], [0.02, -0.14]]) {
        E.bx(x, 0, z, 0.04, h, 0.04, hexf('#5a8a3a'), TL.plain);
        for (let j = 1; j < 4; j++) cropLeaf(E, j * 2.2 + x * 10 + vr, 1.0, 0.08 + k * 0.12, 0.07, 0.02, WHITE, TL.leaves, 0, h * j / 4, x, z);
        if (ripe) { E.box(x, h + 0.02, z, 0.13, 0.025, 0.13, hexf('#f0c020'), TL.plain, 0.3); E.box(x, h + 0.035, z, 0.05, 0.03, 0.05, hexf('#6a4a20'), TL.plain); }
      }
      return;
    }
    if (p.kind === 'arti') {
      for (let i = 0; i < 6; i++) cropLeaf(E, i / 6 * TAU + vr, 0.75, 0.2 + k * 0.35, 0.14, 0.02, [0.62, 0.72, 0.66], TL.leaves, 0.03, 0);
      const sh = 0.15 + k * 0.5;
      E.bx(0, 0, 0, 0.05, sh, 0.05, hexf('#8aa898'), TL.plain);
      if (k > 0.6) { E.bx(0, sh, 0, 0.13, 0.15, 0.13, col, TL.cabbage, 0.4); E.bx(0, sh + 0.15, 0, 0.08, 0.06, 0.08, col, TL.plain, 0.4); }
      return;
    }
    // asperges : turions qui sortent de terre
    for (let i = 0; i < 5; i++) {
      const a = i * 2.39 + vr, r = 0.05 + (i % 3) * 0.07, x = Math.sin(a) * r, z = Math.cos(a) * r, hh = 0.05 + k * (0.24 + (i % 2) * 0.08);
      E.bx(x, -0.02, z, 0.03, hh, 0.03, col, TL.plain);
      E.box(x, hh - 0.01, z, 0.042, 0.05, 0.042, lightc(col, 0.8), TL.plain, 0.785);
    }
  },
  rampant(E, k, ripe, c, C, col, p) {
    const vr = c.vr || 0;
    for (let i = 0; i < 5; i++) cropLeaf(E, i / 5 * TAU + vr, 1.15, 0.15 + k * 0.28, 0.16 + k * 0.12, 0.02, WHITE, TL.leaves, 0.02, 0.02 + (i % 2) * 0.04);
    if (p.flower && k > 0.35 && !ripe) E.box(0.12, 0.12, 0.05, 0.08, 0.08, 0.08, hexf('#f0c020'), TL.plain, 0.4, 0.3);
    if (k < 0.4) return;
    const [fx, fy, fz] = p.fruit, kk = 0.35 + k * 0.65, fc = ripe ? col : mixc(col, _green, 0.55);
    for (let j = 0; j < p.n; j++) {
      const a = j * 2.4 + 0.6 + vr, r = p.n > 1 ? 0.2 : 0.02;
      E.bx(Math.sin(a) * r, -0.02, Math.cos(a) * r, fx * kk, fy * kk, fz * kk, fc, p.stripes ? TL.stripes : TL.plain, a);
    }
  },
  tuteur(E, k, ripe, c, C, col, p) {
    const H = p.low ? 0.75 : 1.15, vr = c.vr || 0;
    E.bx(0, 0, 0, 0.035, H, 0.035, WHITE, TL.wood);
    if (p.twig) for (const s of [-0.12, 0.12]) E.box(s, H * 0.5, 0, 0.02, H, 0.02, WHITE, TL.wood, 0, 0, s * 1.2);
    const fh = 0.15 + k * (H - 0.2), w = 0.14 + k * 0.14;
    E.bx(0, 0, 0, w, fh, w, WHITE, TL.leaves, vr * 0.5);
    if (k > 0.5) E.bx(0, fh * 0.4, 0, w + 0.1, fh * 0.45, w + 0.1, [0.9, 1, 0.9], TL.leaves, 0.7);
    if (k < 0.72) return;
    const [fx, fy, fz] = p.fruit, fc = ripe ? col : mixc(col, _green, 0.7);
    for (let j = 0; j < p.n; j++) {
      const a = j * 2.39 + 0.5 + vr, r = w * 0.5 + 0.06 + 0.04 * (j % 2), y = fh * (0.2 + 0.65 * ((j * 0.37) % 1));
      E.box(Math.sin(a) * r, y, Math.cos(a) * r, fx, fy, fz, fc, TL.plain, a);
    }
  },
  cereale(E, k, ripe, c, C, col, p) {
    const h = 0.12 + k * (p.h || 1), stemC = p.stem ? hexf(p.stem) : ripe ? hexf('#c8b070') : hexf('#7aa850');
    if (p.hemp) {
      for (const [x, z] of [[-0.18, -0.15], [0.17, -0.1], [-0.1, 0.18], [0.14, 0.16]]) {
        E.bx(x, 0, z, 0.035, h, 0.035, stemC, TL.plain);
        for (let j = 1; j <= 3; j++) for (let q = 0; q < 5; q++) cropLeaf(E, q * 1.26 + j, 0.9 + (q % 2) * 0.2, 0.08 + k * 0.1, 0.03, 0.01, WHITE, TL.leaves, 0, h * j / 4, x, z);
      }
      return;
    }
    const hc = ripe ? col : hexf('#9ac060');
    for (let i = 0; i < 9; i++) {
      const x = (i % 3 - 1) * 0.25 + ((i * 7) % 3 - 1) * 0.04, z = ((i / 3 | 0) - 1) * 0.25 + ((i * 5) % 3 - 1) * 0.03, hh = h * (0.9 + ((i * 13) % 5) * 0.04);
      E.bx(x, 0, z, 0.03, hh, 0.03, stemC, TL.plain);
      if (k < 0.55) continue;
      if (p.flowers) { E.bx(x, hh - 0.02, z, 0.08, 0.07, 0.08, ripe ? col : hexf(p.flowers), TL.plain, i); continue; }
      if (p.droop) { for (const s of [-1, 1]) E.box(x + s * 0.035, hh - 0.05, z, 0.025, 0.07, 0.025, hc, TL.plain, 0, 0, s * 0.5); E.bx(x, hh - 0.02, z, 0.03, 0.08, 0.03, hc, TL.plain); }
      else { E.bx(x, hh - 0.02, z, 0.05, 0.14, 0.05, hc, TL.plain); if (p.barbu) E.bx(x, hh + 0.12, z, 0.012, 0.12, 0.012, hc, TL.plain); }
    }
  },
  buisson(E, k, ripe, c, C, col, p) {
    const vr = c.vr || 0, sz = (p.low ? 0.18 : 0.26) + k * (p.low ? 0.24 : 0.4);
    if (p.cane) {
      for (let i = 0; i < 5; i++) {
        const a = i * 1.26 + vr, x = Math.sin(a) * 0.15, z = Math.cos(a) * 0.15, hh = 0.2 + k * 0.9;
        E.bx(x, 0, z, 0.025, hh, 0.025, hexf('#8a6a4a'), TL.plain);
        E.bx(x, hh * 0.35, z, 0.14 + k * 0.06, hh * 0.6, 0.14 + k * 0.06, WHITE, TL.leaves, a);
      }
    } else { E.bx(0, 0, 0, sz, sz * 0.8, sz, WHITE, TL.leaves, vr * 0.4); E.bx(0.03, sz * 0.4, -0.02, sz * 0.75, sz * 0.6, sz * 0.75, [0.85, 1, 0.85], TL.leaves, 0.8); }
    const bloom = p.rose && k > 0.7;
    if (!ripe && !bloom) return;
    const n = p.n || 8, b = p.berry || 0.04, R = p.cane ? 0.22 : sz * 0.52, top = p.cane ? 0.2 + k * 0.9 : sz;
    for (let j = 0; j < n; j++) {
      const a = j * 2.39 + vr, y = top * (0.3 + 0.6 * ((j * 0.618) % 1)), x = Math.sin(a) * R, z = Math.cos(a) * R;
      if (p.grappes) { for (let q = 0; q < 3; q++) E.box(x, y - q * b * 1.15, z, b, b, b, col, TL.plain); }
      else if (p.rose) { E.box(x, y, z, b, b * 0.8, b, col, TL.plain, a); E.box(x, y + b * 0.3, z, b * 0.6, b * 0.5, b * 0.6, lightc(col, 1.15), TL.plain, a + 0.785); }
      else { E.box(x, y, z, b, b, b, col, TL.plain, a); if (p.star) E.box(x, y + b * 0.55, z, b * 1.4, 0.01, b * 1.4, hexf('#3a6a2a'), TL.plain, a + 0.4); }
    }
  },
  treille(E, k, ripe, c, C, col, p) {
    for (const s of [-0.42, 0.42]) E.bx(s, 0, 0, 0.05, 1.5, 0.05, WHITE, TL.wood);
    for (const y of [0.9, 1.4]) E.bx(0, y, 0, 0.9, 0.015, 0.015, [0.45, 0.45, 0.48], TL.plain);
    const h = 0.2 + k * 1.2;
    E.bx(0, 0, 0, 0.05, Math.min(h, 1.35), 0.05, hexf('#6a4a30'), TL.plain);
    if (k > 0.3) { const w = 0.3 + k * 0.55; E.bx(0, Math.min(h, 1.35) - 0.35, 0, w, 0.3 + k * 0.25, 0.2, WHITE, TL.leaves, 0); if (k > 0.6) E.bx(0, 0.75, 0.02, w * 0.8, 0.25, 0.18, [0.9, 1, 0.9], TL.leaves, 0); }
    if (!ripe) return;
    if (p.grapes) for (const x of [-0.3, -0.05, 0.22]) { E.bx(x, 0.72, 0.13, 0.11, 0.16, 0.08, col, TL.plain); E.bx(x, 0.64, 0.13, 0.07, 0.08, 0.06, col, TL.plain); }
    if (p.cones) for (let j = 0; j < 9; j++) E.box(-0.36 + j * 0.09, 0.9 + (j % 3) * 0.14, 0.12, 0.05, 0.07, 0.05, col, TL.plain, j);
  },
  aromate(E, k, ripe, c, C, col, p) {
    const h = 0.06 + k * (p.h || 0.3), lc = p.lf ? hexf(p.lf) : col, vr = c.vr || 0, big = p.big;
    E.bx(0, 0, 0, 0.12 + k * 0.12, h * 0.8, 0.12 + k * 0.12, lc, p.woody ? TL.leaves : TL.plain, vr);
    for (let i = 0; i < (big ? 6 : 9); i++) {
      const a = i * 2.39 + vr, r = 0.06 + (i % 3) * 0.045, y = h * (0.3 + (i % 4) * 0.18), s = (0.6 + k * 0.6);
      E.box(Math.sin(a) * r, y, Math.cos(a) * r, (big ? 0.09 : 0.06) * s, 0.03, (big ? 0.07 : 0.05) * s, lc, TL.plain, a, p.frise ? 0.6 : 0.2);
    }
    if (p.spikes && k > 0.5) for (let i = 0; i < 7; i++) { const a = i * 0.9 + vr, r = 0.06 + (i % 2) * 0.06; E.bx(Math.sin(a) * r, h * 0.6, Math.cos(a) * r, 0.015, h * 0.7, 0.015, lc, TL.plain); E.bx(Math.sin(a) * r, h * 1.25, Math.cos(a) * r, 0.035, 0.12, 0.035, col, TL.plain); }
    if (p.flowers && k > 0.7) for (let i = 0; i < 6; i++) { const a = i * 1.1; E.box(Math.sin(a) * 0.08, h * 0.85, Math.cos(a) * 0.08, 0.03, 0.03, 0.03, hexf(p.flowers), TL.plain); }
    if (p.pods && k > 0.6) for (let i = 0; i < 6; i++) { const a = i * 1.05 + vr; E.box(Math.sin(a) * 0.12, h * 0.55, Math.cos(a) * 0.12, 0.025, 0.06, 0.018, ripe ? col : hexf('#8ab050'), TL.plain, a, 0.4); }
  },
  fleur(E, k, ripe, c, C, col, p) {
    const n = p.n || 5, H = p.h || 0.5, vr = c.vr || 0, bloomK = clamp((k - 0.55) / 0.45, 0, 1);
    const stem = hexf('#4a8a3a'), lf = hexf('#5a9a3a');
    for (let i = 0; i < n; i++) {
      const a = i * 2.39 + vr, r = n > 1 ? 0.06 + (i % 3) * 0.06 : 0, hh = (0.08 + k * H) * (0.85 + (i % 3) * 0.1), x = Math.sin(a) * r, z = Math.cos(a) * r;
      E.bx(x, 0, z, 0.02, hh, 0.02, stem, TL.plain);
      if (i < 3) cropLeaf(E, a + 1, 0.8, 0.06 + k * 0.1, 0.04, 0.015, lf, TL.plain, 0, 0.02, x, z);
      if (bloomK <= 0) { if (k > 0.35) E.bx(x, hh, z, 0.03, 0.05, 0.03, hexf('#6a9a4a'), TL.plain); continue; }
      const b = (p.bloom || 0.08) * (0.5 + 0.5 * bloomK);
      if (p.cup) { E.bx(x, hh - 0.01, z, b, b * 1.3, b, col, TL.plain, a); E.bx(x, hh + b * 1.1, z, b * 0.5, b * 0.35, b * 0.5, col, TL.plain, a + 0.785); }
      else if (p.pompom) { E.box(x, hh + b * 0.4, z, b, b * 0.8, b, col, TL.plain, a); E.box(x, hh + b * 0.4, z, b * 0.9, b * 0.7, b * 0.9, lightc(col, 1.12), TL.plain, a + 0.785); }
      else if (p.poppy) { E.box(x, hh + 0.01, z, b, 0.02, b, col, TL.plain, a); E.box(x, hh + 0.02, z, b * 0.7, 0.02, b * 0.7, col, TL.plain, a + 0.785); E.box(x, hh + 0.035, z, b * 0.25, 0.03, b * 0.25, [0.1, 0.08, 0.08], TL.plain); }
      else {
        const ctr = lumc(col) > 0.8 ? hexf('#f0b020') : lightc(col, 0.55);
        E.box(x, hh + 0.01, z, b, 0.015, b, col, TL.plain, a); E.box(x, hh + 0.01, z, b, 0.015, b, col, TL.plain, a + 0.785); E.box(x, hh + 0.022, z, b * 0.35, 0.025, b * 0.35, ctr, TL.plain);
      }
    }
  },
};
for (const id in CROPS) {
  const C = CROPS[id];
  if (!C.tpl || !CROP_TPL[C.tpl] || CROP_MODELS[id]) continue;
  CROP_MODELS[id] = (E, k, ripe, c) => { c = c || NOC; CROP_TPL[C.tpl](E, k, ripe, c, C, cropColor(C, c), C.p || {}); };
}

// ---------------------------------------------------------------- variétés des anciennes cultures : couleur remplacée
{
  const box1 = PE.box;
  PE.box = function (cx, cy, cz, sx, sy, sz, col, code, ry, rx, rz) {
    const R = this.recol;
    if (R) {
      if (R.f && Math.abs(col[0] - R.f[0]) < 0.004 && Math.abs(col[1] - R.f[1]) < 0.004 && Math.abs(col[2] - R.f[2]) < 0.004) col = R.to;
      else if (R.x !== null && code === R.x) { if (R.m) col = [col[0] * R.to[0], col[1] * R.to[1], col[2] * R.to[2]]; else { col = R.to; code = TL.plain; } }
    }
    box1.call(this, cx, cy, cz, sx, sy, sz, col, code, ry, rx, rz);
  };
}
const _recolCache = {};
function cropRecol(id, vr) {
  const C = CROPS[id];
  if (!vr || !C || !C.recol || !C.vars || !C.vars[vr] || !C.vars[vr].c) return null;
  const k = id + vr;
  return _recolCache[k] || (_recolCache[k] = { f: C.recol.f ? hexf(C.recol.f) : null, x: C.recol.x ? TL[C.recol.x] : null, m: C.recol.m, to: hexf(C.vars[vr].c) });
}
// Dessin d'une case cultivée (variété, pied mort) ; le repère est déjà posé
function cropDraw(E, c, k, ripe) {
  if (c.dead) { CROP_MODELS.mort(E); return; }
  const fn = CROP_MODELS[c.c];
  if (!fn) return;
  E.recol = cropRecol(c.c, c.vr);
  fn(E, Math.max(0.08, k), ripe, c);
  E.recol = null;
}
// Taille propre à chaque pied (et spécimens géants)
function cropScale(c, x, z) {
  if (c.tree) return 1;
  const s = 0.88 + hash2i(x | 0, z | 0, 11) * 0.24;
  return c.big ? s * 1.85 : s;
}
