// ============================================================================
//  BASSE-FOSSE, LA VILLE SOUS LA VILLE (agent V5, quatorzième vague) — matières,
//  tuiles et modèles
//  Deux matières (64 au plus dans le jeu ; voir le contrat) :
//   - les ossements (M_V5_OS) : têtes d'os longs empilées, bandes de crânes ;
//     les murs des rues de Basse-Fosse en sont faits, comme ceux des vieux
//     charniers ;
//   - le tuf (M_V5_TUF) : la pierre pâle et tendre où la ville est taillée,
//     marquée de coups de pic.
//  Quatre tuiles de l'atlas des peaux (190 à 193) : le visage des gens d'en bas
//  (des yeux de lait), celui des vieux, le linceul, la face d'un crâne.
//  Les objets posés (l'avant regarde +z ; l'origine au sol, au centre) : les
//  feux qui ne s'éteignent pas, les chandelles, les crânes, les ossements, les
//  niches, les lits de pierre, les tables, les étals, le registre, les cloches,
//  le foudre et sa portette, la trappe, l'enseigne, la stèle des lois, le
//  sarcophage, le puits des noms, le brasier mort, le métier, les bancs, et les
//  petits objets qu'on ramasse (v5_objet, selon data.k).
// ============================================================================

// ---------------------------------------------------------------- matières
function texV5Os(seed) {
  const pb = new PixelBuf(TS, TS), rnd = mulberry32(seed), tn = makeTileNoise(seed);
  // le fond : l'ombre entre les os
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const v = 16 + tn(x / 4, y / 4, 32) * 14;
    pb.set(x, y, [v + 4, v + 1, v - 2]);
  }
  const tonOs = () => { const k = 0.78 + rnd() * 0.3, br = rnd() < 0.18 ? 0.86 : 1; return [214 * k, 202 * k * br, 170 * k * br * br]; };
  // une tête d'os long, vue de bout (un bouton rond, éclairé d'en haut à gauche)
  const tete = (cx, cy, r) => {
    const c = tonOs();
    for (let dy = -r - 1; dy <= r + 1; dy++) for (let dx = -r - 1; dx <= r + 1; dx++) {
      const d = Math.hypot(dx, dy * 1.08);
      if (d > r + 0.4) { if (d < r + 1.4 && dy > 0) pb.setW(cx + dx, cy + dy, [10, 8, 7]); continue; }
      const l = 1.05 - (dx + dy) / (r * 4.2) - (d / r) * 0.18 + (hash2i(cx + dx, cy + dy, seed) - 0.5) * 0.12;
      let k = l;
      if (d < r * 0.38) k *= 0.82; // le cœur de l'os
      pb.setW(cx + dx, cy + dy, [c[0] * k, c[1] * k, c[2] * k]);
    }
  };
  // un crâne de face
  const crane = (cx, cy) => {
    const c = tonOs(), W = 6.4, H = 6.6;
    for (let dy = -7; dy <= 7; dy++) for (let dx = -7; dx <= 7; dx++) {
      const yy = dy < 2 ? dy / H : dy / (H * 0.78), xx = dx / (dy < 2 ? W : W * (1 - (dy - 2) * 0.07));
      const d = Math.hypot(xx, yy);
      if (d > 1.02) { if (d < 1.2 && dy > 1) pb.setW(cx + dx, cy + dy, [9, 8, 7]); continue; }
      let k = 1.08 - (dx + dy * 1.2) / 22 - d * 0.16 + (hash2i(cx + dx, cy + dy, seed + 3) - 0.5) * 0.1;
      // les orbites, le nez, les dents
      const orbite = (Math.hypot(dx + 2.6, (dy - 0.2) * 1.1) < 1.9) || (Math.hypot(dx - 2.6, (dy - 0.2) * 1.1) < 1.9);
      if (orbite) k = 0.1 + (dy < 0 ? 0.04 : 0);
      if (Math.abs(dx) <= 0.6 && dy >= 2 && dy <= 3) k = 0.16;
      if (dy === 5 && Math.abs(dx) <= 3) k = (dx & 1) ? 0.35 : 0.95;
      pb.setW(cx + dx, cy + dy, [c[0] * k, c[1] * k, c[2] * k]);
    }
  };
  // 128 px = 2 m : une bande de crânes tous les 64 px, des rangs de têtes d'os entre elles
  for (let band = 0; band < 2; band++) {
    const y0 = band * 64;
    for (let k = 0; k < 9; k++) crane(Math.round(k * 14.22 + 7 + (band ? 7 : 0) + (rnd() - 0.5) * 2), y0 + 8 + Math.round((rnd() - 0.5) * 1.5));
    for (let row = 0; row < 6; row++) {
      const y = y0 + 20 + row * 7.6, off = row % 2 ? 4 : 0;
      for (let k = 0; k < 16; k++) tete(Math.round(k * 8 + off + (rnd() - 0.5) * 1.6), Math.round(y + (rnd() - 0.5) * 1.2), rnd() < 0.15 ? 2.6 : 3.2 + rnd() * 0.5);
    }
  }
  return pb;
}
function texV5Tuf(seed) {
  const pal = ramp(['#4c473f', '#5a544a', '#686155', '#776f61', '#867d6d', '#958b79', '#a39886']);
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed), rnd = mulberry32(seed + 3);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const lit = Math.sin(y * 0.21 + tileFbm(tn, x / 32, y / 32, 4, 2) * 5) * 0.05; // les lits de la pierre
    const v = 0.5 + (tileFbm(tn, x / 14, y / 14, 9.142857, 3) - 0.5) * 0.5 + lit + (tn(x / 2, y / 2, 64) - 0.5) * 0.1;
    pb.set(x, y, rampPick(pal, v, x, y));
  }
  // les coups de pic : de courtes entailles obliques, par rangées
  for (let k = 0; k < 230; k++) {
    const x = (rnd() * TS) | 0, y = (rnd() * TS) | 0, L = 3 + ((rnd() * 4) | 0), sgn = rnd() < 0.7 ? 1 : -1;
    for (let i = 0; i < L; i++) { const c = pb.getW(x + i, y + i * sgn); pb.setW(x + i, y + i * sgn, [c[0] * 0.62, c[1] * 0.62, c[2] * 0.62]); const d = pb.getW(x + i, y + i * sgn + 1); pb.setW(x + i, y + i * sgn + 1, [Math.min(255, d[0] * 1.12), Math.min(255, d[1] * 1.12), Math.min(255, d[2] * 1.1)]); }
  }
  // de rares taches noires (la suie des chandelles)
  for (let k = 0; k < 6; k++) {
    const cx = rnd() * TS, cy = rnd() * TS, r = 4 + rnd() * 7;
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const d = Math.hypot(dx, dy * 1.6) / r; if (d > 1) continue; const c = pb.getW(cx + dx, cy + dy), q = 1 - (1 - d) * 0.35; pb.setW(cx + dx, cy + dy, [c[0] * q, c[1] * q, c[2] * q]); }
  }
  return pb;
}
const M_V5_OS = MATERIALS.push({ id: 'v5_os', name: 'Ossements', scale: 2, gen: () => texV5Os(1501) }) - 1;
const M_V5_TUF = MATERIALS.push({ id: 'v5_tuf', name: 'Tuf', scale: 3, gen: () => texV5Tuf(1502) }) - 1;
BLOCK_MATS.push(M_V5_OS, M_V5_TUF);

// ---------------------------------------------------------------- tuiles de l'atlas des peaux (190 à 193)
Object.assign(TL, { v5Visage: 190, v5VisageVieux: 191, v5Linceul: 192, v5Cranes: 193 });
function v5Tuiles(cv) {
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
  // visages (blancs : multipliés par la peau) : yeux au rang 7, des yeux de lait, sans pupille ; des cernes
  const visage = (vieux) => (x, y) => {
    const ex = x <= 7 ? x : 15 - x;
    let v = 238 + N(x, y, 1901) * 8 - (ex === 0 ? 20 : ex === 1 ? 8 : 0) - (y === 15 ? 20 : 0);
    if (y === 5 && ex >= 3 && ex <= 5) v = vieux ? 150 : 120;                    // les sourcils, clairsemés
    if (y === 6 && ex >= 3 && ex <= 5) v -= 40;                                  // l'ombre de l'arcade
    if (y === 7 && ex >= 3 && ex <= 5) return ex === 4 ? [214, 214, 206] : [196, 194, 186]; // l'œil de lait
    if (y === 8 && ex >= 3 && ex <= 5) v -= 46;                                  // les cernes
    if (vieux && (y === 3 || y === 10) && ex >= 2 && ex <= 6 && N(x, y, 1902) > 0.4) v -= 30; // les rides
    if ((y === 9 || y === 10) && (x === 7 || x === 8)) v -= 20;                  // le nez
    if (y === 12 && x >= 6 && x <= 9) return [128, 96, 92];                      // la bouche, mince
    return v;
  };
  T(TL.v5Visage, visage(false));
  T(TL.v5VisageVieux, visage(true));
  // le linceul : une toile grise et blanche, des plis
  T(TL.v5Linceul, (x, y) => {
    let v = 214 + Math.sin(x * 1.3 + y * 0.2) * 14 + N(x, y, 1903) * 10;
    if ((x + (y >> 2)) % 5 === 0) v -= 26;
    return [v, v * 0.98, v * 0.94];
  });
  // la face d'un crâne (pour les piles de crânes, les niches)
  T(TL.v5Cranes, (x, y) => {
    let k = 1 - (x + y) / 60 + (N(x, y, 1904) - 0.5) * 0.1;
    const orb = Math.hypot(x - 4.6, (y - 6.5) * 1.1) < 2.2 || Math.hypot(x - 10.4, (y - 6.5) * 1.1) < 2.2;
    if (orb) k = 0.1;
    if ((x === 7 || x === 8) && y >= 9 && y <= 10) k = 0.14;
    if (y === 13 && x >= 4 && x <= 11) k = (x & 1) ? 0.3 : 0.92;
    if (y >= 14) k *= 0.55;
    return [220 * k, 210 * k, 182 * k];
  });
}
{
  const _bsa = buildSkinAtlas;
  buildSkinAtlas = function () {
    _bsa();
    try { v5Tuiles(SKIN.canvas); } catch (e) { console.warn('V5 : tuiles', e); }
  };
}

// ---------------------------------------------------------------- couleurs
const V5C = {
  os: [0.86, 0.82, 0.7], osS: [0.7, 0.66, 0.55], tuf: [0.78, 0.75, 0.69], tufS: [0.62, 0.6, 0.55], fer: [0.34, 0.33, 0.32],
  bois: rgbf('#5a4430'), boisS: rgbf('#3a2c20'), cire: [0.9, 0.88, 0.8], flamme: [1.3, 0.95, 0.55], flamme2: [1.45, 1.15, 0.7],
  noir: [0.03, 0.03, 0.03], cendre: [0.34, 0.32, 0.3], linge: [0.86, 0.85, 0.82], bronze: rgbf('#7a6034'), papier: [0.92, 0.88, 0.76],
};
const V5_TUF = () => mt(M_V5_TUF), V5_OS = () => mt(M_V5_OS);
// un crâne posé (centre du bas en cx, y0, cz ; il regarde +z, ou ry)
function v5Crane(E, cx, y0, cz, ry, s, col) {
  s = s || 1;
  const c = col || V5C.os;
  E.box(cx, y0 + 0.09 * s, cz, 0.17 * s, 0.17 * s, 0.21 * s, c, tx(TL.bone, TL.v5Cranes), ry || 0);
  E.box(cx + Math.sin(ry || 0) * 0.05 * s, y0 + 0.025 * s, cz + Math.cos(ry || 0) * 0.05 * s, 0.12 * s, 0.05 * s, 0.1 * s, v3.scale(c, 0.9), TL.bone, ry || 0);
}
// une flamme pâle (les feux de Basse-Fosse sont blancs au cœur)
function v5Flamme(E, cx, y0, cz, w, h, t, ph) {
  const f = t && t.t !== undefined ? 1 + Math.sin(t.t * 9 + (ph || 0)) * 0.1 : 1;
  E.fl = FX_EMIT;
  E.bx(cx, y0, cz, w, h * f, w, V5C.flamme, TL.flame, t && t.t !== undefined ? t.t * 1.6 : (ph || 0));
  E.bx(cx, y0, cz, w * 0.55, h * 1.55 * f, w * 0.55, V5C.flamme2, TL.flame, 0.7);
  E.fl = 0;
}

// ---------------------------------------------------------------- objets posés
// un cercle de fer à plat (centre cx, cy, cz ; rayon R) : douze bouts de fer, chacun tangent au cercle
function v5Cercle(E, cx, cy, cz, R, col) {
  const n = 12, L = TAU * R / n * 1.1;
  for (let k = 0; k < n; k++) { const a = (k + 0.5) / n * TAU; E.box(cx + Math.cos(a) * R, cy, cz + Math.sin(a) * R, 0.035, 0.03, L, col, TL.iron, -a); }
}
Object.assign(PROP_MODELS, {
  // une paire de souliers, la pointe vers +z (v : 0 un homme, 1 une femme, 2 un enfant)
  v5_souliers(E, o) {
    const v = (o.data && o.data.v) || 0, k = [1, 0.84, 0.62][v] || 1, c = [rgbf('#3a2a1e'), rgbf('#1e1a18'), rgbf('#5a4430')][v] || V5C.boisS, cs = v3.scale(c, 0.65);
    for (const sx of [-1, 1]) {
      const x = sx * 0.075 * k;
      E.bx(x, 0, 0.01, 0.11 * k, 0.03, 0.28 * k, cs, TL.leather);
      E.bx(x, 0.03, -0.05 * k, 0.1 * k, 0.1 * k, 0.16 * k, c, TL.leather);
      E.bx(x, 0.03, 0.08 * k, 0.09 * k, 0.05 * k, 0.11 * k, c, TL.leather);
      E.box(x, 0.13 * k + 0.03, -0.02 * k, 0.07 * k, 0.012, 0.012, [0.7, 0.66, 0.58], TL.cloth, 0.2);
    }
  },
  // une capote de garde pliée, raide de cendre, et une lanterne morte (le banc du garde, au Seuil)
  v5_manteau(E) {
    const c = rgbf('#3e4048'), cg = [0.5, 0.5, 0.5];
    E.bx(0, 0, 0, 0.55, 0.12, 0.38, c, TL.cloth, 0.08); E.bx(0.02, 0.12, 0.01, 0.5, 0.06, 0.34, v3.lerp(c, cg, 0.35), TL.cloth, 0.12);
    E.bx(-0.75, 0, 0.02, 0.18, 0.04, 0.18, V5C.fer, TL.iron); E.bx(-0.75, 0.04, 0.02, 0.15, 0.22, 0.15, [0.12, 0.12, 0.11], TL.glass); E.bx(-0.75, 0.26, 0.02, 0.18, 0.04, 0.18, V5C.fer, TL.iron);
    E.box(-0.75, 0.36, 0.02, 0.12, 0.02, 0.02, V5C.fer, TL.iron);
  },
  // des cercles de tonneau rouillés, empilés, et deux douelles
  v5_cercles(E) {
    const r1 = rgbf('#5a3422'), r2 = rgbf('#6e4228');
    v5Cercle(E, 0, 0.02, 0, 0.44, r1); v5Cercle(E, 0.1, 0.055, 0.06, 0.4, r2); v5Cercle(E, -0.06, 0.09, -0.03, 0.36, r1);
    E.box(0.55, 0.025, 0.25, 0.09, 0.025, 0.95, V5C.boisS, TL.darkwood, 0.5); E.box(0.4, 0.06, -0.35, 0.09, 0.025, 0.9, V5C.bois, TL.wood, -0.9, 0.15);
  },
  // un feu qui ne s'éteint pas : une vasque de tuf sur un fût, des os dans la cendre, une flamme pâle (data.lit)
  v5_feu(E, o, t) {
    E.bx(0, 0, 0, 0.78, 0.18, 0.78, V5C.tufS, V5_TUF());
    E.bx(0, 0.18, 0, 0.52, 0.72, 0.52, V5C.tuf, V5_TUF());
    E.bx(0, 0.9, 0, 1.12, 0.28, 1.12, V5C.tuf, V5_TUF());
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; E.bx(Math.sin(a) * 0.5, 1.18, Math.cos(a) * 0.5, k % 2 ? 0.12 : 1.12, 0.1, k % 2 ? 1.12 : 0.12, V5C.tufS, V5_TUF()); }
    E.bx(0, 1.1, 0, 0.9, 0.08, 0.9, V5C.cendre, TL.coal);
    E.box(0.12, 1.2, -0.1, 0.42, 0.06, 0.07, V5C.osS, TL.bone, 0.6); E.box(-0.15, 1.21, 0.12, 0.36, 0.06, 0.06, V5C.osS, TL.bone, -0.9);
    if (o.data && o.data.lit) v5Flamme(E, 0, 1.16, 0, 0.42, 0.5, t, o.x);
  },
  // le feu du compte : une grande cuve de tuf, au cœur du temple
  v5_feu_compte(E, o, t) {
    E.bx(0, 0, 0, 3.2, 0.3, 3.2, V5C.tufS, V5_TUF());
    E.bx(0, 0.3, 0, 2.6, 0.7, 2.6, V5C.tuf, V5_TUF());
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; E.bx(Math.sin(a) * 1.2, 1.0, Math.cos(a) * 1.2, k % 2 ? 0.2 : 2.6, 0.22, k % 2 ? 2.6 : 0.2, V5C.tufS, V5_TUF()); }
    E.bx(0, 0.9, 0, 2.3, 0.14, 2.3, V5C.cendre, TL.coal);
    for (let k = 0; k < 7; k++) { const a = k * 0.9 + 0.3, r = 0.3 + (k % 3) * 0.25; E.box(Math.cos(a) * r, 1.06, Math.sin(a) * r, 0.5, 0.07, 0.08, V5C.osS, TL.bone, a); }
    if (o.data && o.data.lit) { v5Flamme(E, 0, 1.0, 0, 1.0, 0.9, t, 1); v5Flamme(E, 0.5, 1.0, 0.3, 0.5, 0.6, t, 2.2); v5Flamme(E, -0.45, 1.0, -0.35, 0.5, 0.55, t, 3.4); }
  },
  // des chandelles collées sur un crâne, ou sur une pierre (data.lit)
  v5_chandelles(E, o, t) {
    const v = o.data && o.data.v !== undefined ? o.data.v : Math.floor(Math.abs(o.x * 7 + o.z * 3)) % 3;
    if (v === 0) v5Crane(E, 0, 0, 0, 0, 1.1);
    else E.bx(0, 0, 0, 0.32, 0.16, 0.26, V5C.tufS, V5_TUF());
    const top = v === 0 ? 0.2 : 0.16;
    const C = [[0, 0.16, 0], [-0.08, 0.1, 0.05], [0.09, 0.12, -0.04]];
    const lit = !o.data || o.data.lit !== false;
    for (let k = 0; k < (v === 2 ? 3 : 2) + (v === 0 ? 1 : 0); k++) {
      const [x, h, z] = C[k % 3];
      E.bx(x, top, z, 0.045, h, 0.045, V5C.cire, TL.plain);
      E.bx(x + 0.02, top, z + 0.02, 0.03, h * 0.6, 0.03, V5C.cire, TL.plain); // la cire coulée
      if (lit) { E.fl = FX_EMIT; E.bx(x, top + h, z, 0.026, 0.05, 0.026, V5C.flamme2, TL.flame); E.fl = 0; }
    }
  },
  // une pile de crânes
  v5_cranes(E, o) {
    const n = o.data && o.data.n ? o.data.n : 6, seed = Math.floor(Math.abs(o.x * 13.1 + o.z * 7.3));
    let k = 0;
    for (let row = 0; k < n; row++) {
      const m = Math.max(1, 4 - row);
      for (let i = 0; i < m && k < n; i++, k++) {
        const x = (i - (m - 1) / 2) * 0.2, j = (seed + k * 31) % 7;
        v5Crane(E, x + (j - 3) * 0.008, row * 0.16, (j % 3) * 0.04, (j - 3) * 0.08, 1, j === 2 ? V5C.osS : V5C.os);
      }
    }
  },
  // un tas d'ossements : des os longs croisés, un crâne
  v5_os_tas(E, o) {
    const seed = Math.floor(Math.abs(o.x * 5.7 + o.z * 11.3));
    for (let k = 0; k < 7; k++) { const a = ((seed + k * 47) % 63) / 10, r = ((seed + k * 13) % 5) * 0.06; E.box(Math.cos(a) * r, 0.03 + (k % 3) * 0.05, Math.sin(a) * r, 0.46, 0.05, 0.06, k % 2 ? V5C.os : V5C.osS, TL.bone, a); }
    v5Crane(E, 0.18, 0.06, -0.12, 0.7, 1, V5C.osS);
  },
  // une niche creusée, garnie de crânes (contre un mur : le fond à z = -0.3)
  v5_niche(E, o) {
    E.bx(0, 0, -0.3, 1.3, 1.6, 0.12, V5C.tufS, V5_TUF());
    E.bx(0, 0, 0, 1.3, 0.3, 0.6, V5C.tuf, V5_TUF());
    E.bx(0, 1.36, 0, 1.3, 0.24, 0.6, V5C.tuf, V5_TUF());
    for (const s of [-1, 1]) E.bx(s * 0.58, 0.3, 0, 0.14, 1.06, 0.6, V5C.tuf, V5_TUF());
    E.bx(0, 0.3, -0.18, 1.02, 1.06, 0.02, V5C.noir, 0);
    for (let k = 0; k < 4; k++) v5Crane(E, -0.3 + k * 0.2, 0.3, -0.05, 0, 1, k === 2 ? V5C.osS : V5C.os);
    for (let k = 0; k < 3; k++) v5Crane(E, -0.2 + k * 0.2, 0.47, -0.1, 0, 1, V5C.os);
    E.box(0, 0.68, -0.08, 0.9, 0.06, 0.07, V5C.osS, TL.bone);
  },
  // un lit de pierre, le linceul plié dessus
  v5_lit(E, o) {
    E.bx(0, 0, 0, 0.95, 0.5, 2.0, V5C.tuf, V5_TUF());
    E.bx(0, 0.5, 0.15, 0.85, 0.08, 1.6, V5C.linge, TL.v5Linceul);
    E.bx(0, 0.5, -0.78, 0.6, 0.14, 0.32, V5C.tufS, V5_TUF());
    if (!(o.data && o.data.vide)) E.bx(0.1, 0.58, 0.5, 0.6, 0.1, 0.5, V5C.linge, TL.v5Linceul, 0.2);
  },
  // une table de pierre, une écuelle, un gobelet
  v5_table(E) {
    E.bx(0, 0, 0, 0.5, 0.7, 0.5, V5C.tufS, V5_TUF());
    E.bx(0, 0.7, 0, 1.3, 0.1, 0.8, V5C.tuf, V5_TUF());
    E.bx(-0.3, 0.8, 0.1, 0.24, 0.06, 0.24, V5C.bois, TL.wood); E.bx(-0.3, 0.83, 0.1, 0.18, 0.04, 0.18, [0.3, 0.26, 0.2], TL.plain);
    E.bx(0.32, 0.8, -0.12, 0.08, 0.12, 0.08, V5C.osS, TL.bone);
  },
  // un banc de pierre
  v5_banc(E) { E.bx(0, 0, 0, 1.8, 0.42, 0.45, V5C.tuf, V5_TUF()); E.bx(0, 0.42, 0, 1.9, 0.06, 0.5, V5C.tufS, V5_TUF()); },
  // un étal : une table de pierre, des racines, des chandelles, des bouts d'os ; une perche et un linge
  v5_etal(E) {
    E.bx(0, 0, 0, 2.0, 0.85, 0.7, V5C.tuf, V5_TUF());
    E.bx(0, 0.85, 0, 2.1, 0.06, 0.8, V5C.tufS, V5_TUF());
    for (let k = 0; k < 5; k++) E.box(-0.7 + k * 0.32, 0.95, 0.05, 0.22, 0.08, 0.12, [0.5, 0.38, 0.26], TL.wood, k * 0.7); // les racines
    for (let k = 0; k < 4; k++) E.bx(0.55 + (k % 2) * 0.1, 0.91, -0.2 + (k >> 1) * 0.1, 0.05, 0.18, 0.05, V5C.cire, TL.plain);
    for (const s of [-1, 1]) E.bx(s * 1.0, 0, -0.38, 0.07, 2.2, 0.07, V5C.boisS, TL.darkwood);
    E.bx(0, 2.15, -0.38, 2.1, 0.05, 0.05, V5C.boisS, TL.darkwood);
    E.box(0, 1.7, -0.4, 1.9, 0.9, 0.02, [0.62, 0.6, 0.56], TL.v5Linceul, 0, 0.06);
  },
  // le registre : un lutrin de tuf, un livre énorme ouvert (data.ferme : refermé)
  v5_registre(E, o) {
    E.bx(0, 0, 0, 0.6, 0.12, 0.5, V5C.tufS, V5_TUF());
    E.bx(0, 0.12, 0, 0.34, 0.92, 0.3, V5C.tuf, V5_TUF());
    E.box(0, 1.1, 0, 0.9, 0.08, 0.6, V5C.tufS, V5_TUF(), 0, -0.35);
    if (o.data && o.data.ferme) { E.box(0, 1.2, 0.02, 0.5, 0.12, 0.64, rgbf('#3a2018'), TL.leather, 0, -0.35); return; }
    E.box(-0.25, 1.17, 0.02, 0.5, 0.06, 0.66, V5C.papier, TL.paper, 0, -0.35, 0.06);
    E.box(0.25, 1.17, 0.02, 0.5, 0.06, 0.66, V5C.papier, TL.paper, 0, -0.35, -0.06);
    E.box(0, 1.14, 0.02, 1.06, 0.04, 0.7, rgbf('#3a2018'), TL.leather, 0, -0.35);
    E.box(0.32, 1.26, 0.18, 0.02, 0.02, 0.22, [0.1, 0.1, 0.1], 0, 0.5, -0.4); // la plume
  },
  // une cloche pendue à sa poutre (data.muette : sans battant)
  v5_cloche(E, o) {
    const s = o.data && o.data.s ? o.data.s : 1;
    E.bx(0, 1.55 * s, 0, 1.6 * s, 0.16 * s, 0.2 * s, V5C.boisS, TL.darkwood);
    E.bx(0, 0.4 * s, 0, 0.9 * s, 0.9 * s, 0.9 * s, V5C.bronze, TL.gold);
    E.bx(0, 1.3 * s, 0, 0.55 * s, 0.25 * s, 0.55 * s, V5C.bronze, TL.gold);
    E.bx(0, 0.3 * s, 0, 1.02 * s, 0.14 * s, 1.02 * s, v3.scale(V5C.bronze, 0.85), TL.gold);
    if (!(o.data && o.data.muette)) E.bx(0, 0.15 * s, 0, 0.16 * s, 0.4 * s, 0.16 * s, V5C.fer, TL.iron);
  },
  // le foudre du tonnelier : un tonneau géant couché (axe z), sa portette sur le fond avant (data.ouverte)
  v5_foudre(E, o) {
    const R = 1.35, L = 3.0, cy = R + 0.3, b = V5C.bois, w = 2 * R * Math.tan(Math.PI / 8) + 0.02;
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + Math.PI / 8; E.box(Math.sin(a) * R, cy + Math.cos(a) * R, 0, w, 0.12, L, k % 2 ? b : v3.scale(b, 0.86), TL.barrel, 0, 0, -a); }
    for (const z of [-1.25, -0.45, 0.45, 1.25]) for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + Math.PI / 8; E.box(Math.sin(a) * (R + 0.05), cy + Math.cos(a) * (R + 0.05), z, w, 0.04, 0.12, V5C.fer, TL.iron, 0, 0, -a); }
    // le fond avant (octogone), le fond arrière
    for (const z of [L / 2 - 0.08, -L / 2 + 0.08]) { E.box(0, cy, z, 2 * R * 0.93, 2 * R * 0.93, 0.08, v3.scale(b, 0.9), TL.darkwood); E.box(0, cy, z, 2 * R * 0.93, 2 * R * 0.93, 0.08, v3.scale(b, 0.9), TL.darkwood, 0, 0, Math.PI / 4); }
    // les berceaux
    for (const z of [-1.0, 1.0]) { E.bx(0, 0, z, 2.4, 0.3, 0.3, V5C.boisS, TL.darkwood); for (const s of [-1, 1]) E.box(s * 0.95, 0.42, z, 0.3, 0.5, 0.3, V5C.boisS, TL.darkwood, 0, 0, s * 0.5); }
    // la portette : 0,72 × 0,95, son cadre ; ouverte, elle pend sur ses gonds et l'on voit le noir
    const pz = L / 2 + 0.02, py = cy - 0.75;
    E.bx(0, py - 0.06, pz, 0.92, 0.08, 0.06, V5C.fer, TL.iron); E.bx(0, py + 0.97, pz, 0.92, 0.08, 0.06, V5C.fer, TL.iron);
    for (const s of [-1, 1]) E.bx(s * 0.42, py, pz, 0.08, 1.0, 0.06, V5C.fer, TL.iron);
    if (o.data && o.data.ouverte) {
      E.bx(0, py, pz - 0.03, 0.76, 0.96, 0.04, V5C.noir, 0);
      // (pivotée sur son gond gauche : le bout libre vient vers +z)
      const ph = -1.7;
      E.box(-0.36 + Math.cos(ph) * 0.36, py + 0.475, pz + 0.03 - Math.sin(ph) * 0.36, 0.72, 0.95, 0.06, v3.scale(b, 1.05), TL.darkwood, ph);
    } else {
      E.bx(0, py, pz + 0.03, 0.72, 0.95, 0.06, v3.scale(b, 1.05), TL.darkwood);
      E.bx(0.22, py + 0.42, pz + 0.07, 0.08, 0.12, 0.04, V5C.fer, TL.iron); // l'anneau
    }
  },
  // la trappe de la cave, sous les gravats (data.degagee, data.ouverte)
  v5_trappe(E, o) {
    const d = o.data || {};
    E.bx(0, -0.02, 0, 1.4, 0.06, 1.4, V5C.boisS, TL.darkwood);
    if (d.ouverte) { E.bx(0, -0.01, 0, 1.1, 0.03, 1.1, V5C.noir, 0); E.box(0, 0.6, -0.62, 1.1, 1.1, 0.07, V5C.bois, TL.wood, 0, -0.15); }
    else { E.bx(0, 0.02, 0, 1.1, 0.06, 1.1, V5C.bois, TL.wood); E.bx(0.3, 0.08, 0.1, 0.16, 0.03, 0.16, V5C.fer, TL.iron); }
    if (!d.degagee) {
      const c = V5C.tufS;
      E.box(-0.3, 0.12, 0.2, 0.6, 0.3, 0.45, c, mt(M_V1_PIERRE), 0.4); E.box(0.35, 0.1, -0.25, 0.5, 0.26, 0.5, c, mt(M_V1_PIERRE), -0.3);
      E.box(0.1, 0.32, 0.05, 0.45, 0.24, 0.4, c, mt(M_V1_PIERRE), 1.1); E.box(-0.45, 0.06, -0.4, 0.4, 0.16, 0.3, c, mt(M_V1_PIERRE), 0.2);
      E.box(0.45, 0.05, 0.45, 0.7, 0.08, 0.12, V5C.boisS, TL.darkwood, 0.7);
      v5Cercle(E, -0.05, 0.27, -0.1, 0.38, rgbf('#5a3422'));
    }
  },
  // l'enseigne tombée : une potence de fer, une planche peinte d'un tonneau
  v5_enseigne(E) {
    E.box(0, 0.05, 0, 1.3, 0.05, 0.05, V5C.fer, TL.iron, 0.3);
    E.box(0.15, 0.12, 0.25, 1.0, 0.7, 0.05, V5C.bois, TL.sign, 0.3, -1.4);
    E.fl = 0;
    E.box(0.15, 0.16, 0.25, 0.42, 0.3, 0.02, rgbf('#6a4428'), TL.barrel, 0.3, -1.4);
  },
  // la stèle des lois : une dalle de tuf, sept lignes gravées (la dernière effacée)
  v5_stele(E) {
    E.bx(0, 0, 0, 1.6, 0.3, 0.6, V5C.tufS, V5_TUF());
    E.bx(0, 0.3, 0, 1.36, 2.3, 0.34, V5C.tuf, V5_TUF());
    E.box(0, 2.62, 0, 1.36, 0.2, 0.34, V5C.tufS, V5_TUF());
    for (let k = 0; k < 7; k++) E.bx(0, 0.62 + k * 0.27, -0.18, k === 6 ? 0.3 : 0.9 - (k % 3) * 0.1, 0.05, 0.02, [0.08, 0.07, 0.06], 0);
  },
  // un sarcophage (data.ouvert : le couvercle a glissé)
  v5_sarcophage(E, o) {
    E.bx(0, 0, 0, 0.95, 0.75, 2.15, V5C.tuf, V5_TUF());
    const op = o.data && o.data.ouvert;
    E.box(op ? 0.3 : 0, 0.83, op ? 0.25 : 0, 1.0, 0.16, 2.2, V5C.tufS, V5_TUF(), op ? 0.25 : 0);
    if (op) E.bx(-0.1, 0.6, -0.4, 0.5, 0.16, 0.9, V5C.noir, 0);
    E.bx(0, 0.25, 1.08, 0.5, 0.3, 0.02, [0.12, 0.1, 0.09], 0);
  },
  // le puits des noms : une margelle octogonale, un treuil, une chaîne qui descend
  v5_puits(E) {
    const R = 1.25, w = 2 * R * Math.tan(Math.PI / 8) + 0.05;
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; E.box(Math.sin(a) * R, 0.4, Math.cos(a) * R, w, 0.8, 0.32, V5C.tuf, V5_TUF(), a); }
    E.bx(0, 0.05, 0, 2.2, 0.04, 2.2, V5C.noir, 0);
    for (const s of [-1, 1]) E.bx(s * 1.2, 0.8, 0, 0.16, 1.5, 0.16, V5C.boisS, TL.darkwood);
    E.box(0, 2.15, 0, 2.5, 0.16, 0.16, V5C.bois, TL.wood, Math.PI / 2, 0, Math.PI / 2);
    E.bx(0, 0.4, 0, 0.05, 1.7, 0.05, V5C.fer, TL.iron);
  },
  // le brasier mort des Cendrières : des troncs noircis en rond, un tas de cendre, un pieu calciné
  v5_brasier(E, o) {
    for (let k = 0; k < 7; k++) { const a = k / 7 * TAU; E.box(Math.cos(a) * 1.5, 0.15, Math.sin(a) * 1.5, 1.4, 0.24, 0.26, [0.16, 0.14, 0.12], TL.coal, a + 1.2); }
    E.bx(0, 0, 0, 2.4, 0.3, 2.4, [0.5, 0.48, 0.45], mt(M_V1_CENDRE));
    E.bx(0, 0.3, 0, 1.4, 0.25, 1.4, [0.45, 0.43, 0.4], mt(M_V1_CENDRE));
    E.box(0.1, 1.2, -0.1, 0.18, 2.4, 0.18, [0.12, 0.1, 0.09], TL.coal, 0, 0.08, 0.05);
    if (!(o.data && o.data.pris)) E.bx(-0.5, 0.55, 0.3, 0.5, 0.12, 0.4, [0.62, 0.6, 0.58], mt(M_V1_CENDRE));
  },
  // un métier à tisser les linceuls
  v5_metier(E) {
    for (const s of [-1, 1]) { E.bx(s * 0.75, 0, -0.3, 0.08, 1.6, 0.08, V5C.boisS, TL.darkwood); E.bx(s * 0.75, 0, 0.3, 0.08, 1.0, 0.08, V5C.boisS, TL.darkwood); }
    E.bx(0, 1.5, -0.3, 1.6, 0.08, 0.08, V5C.boisS, TL.darkwood); E.bx(0, 0.9, 0.3, 1.6, 0.08, 0.08, V5C.boisS, TL.darkwood);
    E.box(0, 1.2, 0, 1.4, 0.02, 0.62, V5C.linge, TL.v5Linceul, 0, 0.75);
  },
  // un rideau de linceul tendu dans une porte (largeur data.w)
  v5_rideau(E, o) {
    const w = (o.data && o.data.w) || 1.4, h = (o.data && o.data.h) || 2.1;
    E.bx(0, h, 0, w + 0.1, 0.05, 0.05, V5C.boisS, TL.darkwood);
    E.bx(0, 0.1, 0, w, h - 0.1, 0.03, [0.62, 0.6, 0.57], TL.v5Linceul);
  },
  // une pierre gravée de noms, dans un mur (contre un mur : le fond à z = -0.1)
  v5_noms(E) {
    E.bx(0, 0, -0.05, 1.1, 1.4, 0.1, V5C.tuf, V5_TUF());
    for (let k = 0; k < 8; k++) E.bx(-0.05 + ((k * 37) % 5 - 2) * 0.03, 0.18 + k * 0.15, 0.002, 0.55 + ((k * 17) % 4) * 0.08, 0.035, 0.01, [0.1, 0.09, 0.08], 0);
  },
  // un petit objet qu'on ramasse (data.k : lettre, livre, couronne, dents, chapelet, sceau, battant, cerceau, masque, cloche, bague, carnet, cendre)
  v5_objet(E, o) {
    const k = o.data && o.data.k;
    if (o.data && o.data.pris) return;
    switch (k) {
      case 'livre': E.bx(0, 0, 0, 0.3, 0.06, 0.22, rgbf('#4a2a1a'), TL.leather, 0.3); E.bx(0, 0.06, 0, 0.28, 0.02, 0.2, V5C.papier, TL.paper, 0.3); break;
      case 'carnet': E.bx(0, 0, 0, 0.18, 0.04, 0.13, rgbf('#3a3026'), TL.leather, -0.4); break;
      case 'couronne': for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; E.box(Math.sin(a) * 0.1, 0.04, Math.cos(a) * 0.1, 0.07, 0.08, 0.03, rgbf('#c8b070'), TL.plain, a); } break;
      case 'dents': for (let i = 0; i < 7; i++) E.bx(-0.12 + i * 0.04, 0, Math.sin(i) * 0.02, 0.02, 0.025, 0.02, [0.95, 0.93, 0.86], TL.plain); E.bx(0, 0, 0, 0.3, 0.005, 0.005, [0.6, 0.55, 0.45], TL.rope); break;
      case 'chapelet': for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; E.bx(Math.sin(a) * 0.1, 0, Math.cos(a) * 0.07, 0.025, 0.025, 0.025, [0.92, 0.9, 0.82], TL.plain); } break;
      case 'sceau': E.bx(0, 0, 0, 0.07, 0.1, 0.07, V5C.bronze, TL.gold); E.bx(0, 0, 0, 0.12, 0.03, 0.12, V5C.bronze, TL.gold); break;
      case 'battant': E.box(0, 0.06, 0, 0.06, 0.06, 0.7, V5C.fer, TL.iron, 0.4); E.box(Math.sin(0.4) * 0.38, 0.09, Math.cos(0.4) * 0.38, 0.17, 0.17, 0.17, V5C.fer, TL.iron, 0.4); break;
      case 'cerceau': for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; E.box(Math.sin(a) * 0.3, 0.015, Math.cos(a) * 0.3, 0.2, 0.025, 0.03, V5C.bois, TL.wood, a + Math.PI / 2); } break;
      case 'masque': E.bx(0, 0, 0, 0.2, 0.05, 0.24, [0.9, 0.86, 0.74], tx(TL.plain, TL.paleF), 0.2); break;
      case 'cloche': E.bx(0, 0, 0, 0.16, 0.16, 0.16, V5C.bronze, TL.gold); E.bx(0, 0.16, 0, 0.08, 0.05, 0.08, V5C.bronze, TL.gold); break;
      case 'bague': E.bx(0, 0, 0, 0.05, 0.02, 0.05, V5C.os, TL.bone); break;
      case 'plume': E.box(0, 0.01, 0, 0.03, 0.01, 0.3, [0.15, 0.14, 0.14], TL.plain, 0.7); break;
      case 'jeton': E.bx(0, 0, 0, 0.06, 0.015, 0.06, V5C.os, TL.bone); break;
      default: E.bx(0, 0, 0, 0.26, 0.01, 0.18, V5C.papier, TL.paper, 0.4); // une lettre
    }
  },
});
Object.assign(PROP_COLL, {
  v5_feu: [0.56, 0.56, 1.25], v5_feu_compte: [1.5, 1.5, 1.2], v5_lit: [0.48, 1.0, 0.6], v5_table: [0.65, 0.4, 0.8], v5_banc: [0.9, 0.24, 0.48],
  v5_etal: [1.0, 0.35, 0.95], v5_registre: [0.3, 0.25, 1.2], v5_foudre: [1.45, 1.6, 2.6], v5_stele: [0.7, 0.2, 2.6], v5_sarcophage: [0.48, 1.08, 0.9],
  v5_puits: [1.3, 1.3, 0.8], v5_metier: [0.8, 0.35, 1.5], v5_brasier: [1.2, 1.2, 0.5],
});
Object.assign(PROP_LIGHTS, {
  v5_feu: { c: [1.0, 0.7, 0.42], r: 13, y: 1.7, flicker: true, lit: true },
  v5_feu_compte: { c: [1.05, 0.76, 0.48], r: 20, y: 2.2, flicker: true, lit: true },
  v5_chandelles: { c: [1.0, 0.72, 0.42], r: 5, y: 0.4, flicker: true },
});
