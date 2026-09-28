// ============================================================================
//  AUTRES MONDES (dessins) : matériaux des blocs, sprites de la végétation
//  transformée, icônes des objets et squelettes des bêtes qui n'existent que
//  là-bas — le pays des bonbons, les Ténèbres, le cauchemar, les Enfers.
//  (la mécanique est dans 11-zzz70-mondes.js et les suivants)
// ============================================================================

// ---------------------------------------------------------------- matériaux
function texMdPainEpice(seed) {
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed), rnd = mulberry32(seed + 3);
  const P = ramp(['#5a2f14', '#6c3b1b', '#7f4923', '#93582c', '#a66a36', '#b97c42']);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const v = tileFbm(tn, x / 16, y / 16, 8, 3) * 0.7 + tn(x / 2, y / 2, 64) * 0.3;
    pb.set(x, y, rampPick(P, v * 0.95, x, y));
  }
  for (let k = 0; k < 170; k++) { const x = (rnd() * TS) | 0, y = (rnd() * TS) | 0; pb.setW(x, y, P[0]); if (rnd() < 0.35) pb.setW(x + 1, y, P[1]); }
  // frises de glaçage ondulées (deux par tuile) et points de sucre glace
  for (let x = 0; x < TS; x++) for (const y0 of [3, 67]) {
    const yy = y0 + Math.round(Math.sin(x / TS * TAU * 4) * 2);
    for (let t = 0; t < 4; t++) pb.setW(x, yy + t, t === 3 ? [214, 200, 190] : [252, 248, 242]);
  }
  for (let k = 0; k < 22; k++) {
    const x = (rnd() * TS) | 0, y = 20 + ((rnd() * 3) | 0) * 14 + (rnd() < 0.5 ? 64 : 0);
    for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) pb.setW(x + dx, y + dy, [250, 246, 240]);
    pb.setW(x + 2, y + 1, [200, 180, 170]);
  }
  return pb;
}
function texMdSucreRaye(seed) {
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const d = (x + y) % 32, red = d < 14;
    const k = 1 + (tn(x / 8, y / 8, 16) - 0.5) * 0.12 - (d === 0 || d === 13 ? 0.12 : 0) + (d === 2 || d === 16 ? 0.06 : 0);
    const c = red ? [218, 34, 64] : [252, 246, 248];
    pb.set(x, y, [clamp(c[0] * k, 0, 255), clamp(c[1] * k, 0, 255), clamp(c[2] * k, 0, 255)]);
  }
  return pb;
}
function texMdDragee(seed) {
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed);
  const COLS = [[246, 172, 204], [170, 228, 204], [250, 232, 156], [204, 182, 244], [250, 204, 172], [184, 218, 250]];
  const bw = 32, bh = 16;
  for (let y = 0; y < TS; y++) {
    const row = Math.floor(y / bh), off = row % 2 ? bw / 2 : 0;
    for (let x = 0; x < TS; x++) {
      const xx = (x + off) % TS, col = Math.floor(xx / bw), lx = xx % bw, ly = y % bh;
      if (lx === 0 || ly === 0) { pb.set(x, y, [255, 250, 252]); continue; } // joints de sucre glace
      const base = COLS[Math.floor(hash2i(col, row, seed) * COLS.length)];
      let k = 1.08 - (lx / bw) * 0.12 - (ly / bh) * 0.2 + (tn(x / 4, y / 4, 32) - 0.5) * 0.08;
      if (ly === 1 || lx === 1) k += 0.1;
      pb.set(x, y, [clamp(base[0] * k, 0, 255), clamp(base[1] * k, 0, 255), clamp(base[2] * k, 0, 255)]);
    }
  }
  return pb;
}
function texMdChocolat(seed) {
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed);
  const P = ramp(['#241008', '#34190c', '#452211', '#562c17', '#68371e', '#7a4426']);
  const S = 32;
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const lx = x % S, ly = y % S;
    let v = 0.45 + (tn(x / 8, y / 8, 16) - 0.5) * 0.14;
    const e = Math.min(lx, ly, S - 1 - lx, S - 1 - ly);
    if (e < 1) v = 0.05; else if (e < 4) v += (lx < 4 || ly < 4) ? 0.38 : -0.22;
    pb.set(x, y, rampPick(P, v, x, y));
  }
  return pb;
}
function texMdObsidienne(seed) {
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed), wor = makeWorley(seed, 5);
  const P = ramp(['#060508', '#0d0b11', '#15121a', '#1e1a24', '#29242f', '#37313e']);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const w = wor(x / TS * 5, y / TS * 5), g = w.f2 - w.f1;
    const v = 0.34 + (tileFbm(tn, x / 16, y / 16, 8, 3) - 0.5) * 0.5 + (w.f1 < 0.28 ? 0.22 : 0);
    let c = rampPick(P, v, x, y);
    if (g < 0.028) c = [128, 16, 10]; else if (g < 0.06) c = [46, 8, 8];
    pb.set(x, y, c);
  }
  return pb;
}
function texMdBraise(seed) {
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed), wor = makeWorley(seed + 5, 6);
  const crust = ramp(['#120705', '#1d0b07', '#2a1009', '#38160b']);
  const glow = ramp(['#7a1604', '#b83206', '#e86410', '#ffa42a', '#ffdc68']);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const w = wor(x / TS * 6, y / TS * 6), g = w.f2 - w.f1, n = tileFbm(tn, x / 16, y / 16, 8, 3);
    if (g < 0.1 + n * 0.1) pb.set(x, y, rampPick(glow, 1 - g / 0.2 + (n - 0.5) * 0.3, x, y));
    else pb.set(x, y, rampPick(crust, n, x, y));
  }
  return pb;
}
function texMdPapierPeint(seed) {
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const base = (x % 32) < 16 ? [146, 132, 106] : [130, 118, 94];
    const n = tileFbm(tn, x / 16, y / 16, 8, 3);
    const k = 0.84 + (n - 0.5) * 0.3 - (y > 90 ? (y - 90) / 38 * 0.3 * n : 0);
    pb.set(x, y, [base[0] * k, base[1] * k, base[2] * k]);
  }
  for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { // petites fleurs fanées
    const cx = i * 32 + 8 + (j % 2) * 16, cy = j * 32 + 12;
    for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) pb.setW(cx + dx, cy + dy, dx || dy ? [118, 66, 70] : [150, 122, 70]);
    pb.setW(cx, cy + 2, [78, 88, 58]); pb.setW(cx, cy + 3, [78, 88, 58]); pb.setW(cx + 1, cy + 3, [70, 80, 52]);
  }
  return pb;
}
const M_PAIN_EPICE = MATERIALS.push({ id: 'pain_epice', name: 'Pain d’épice', scale: 2, gen: () => texMdPainEpice(401) }) - 1;
const M_SUCRE_RAYE = MATERIALS.push({ id: 'sucre_raye', name: 'Sucre d’orge', scale: 1.5, gen: () => texMdSucreRaye(402) }) - 1;
const M_DRAGEE = MATERIALS.push({ id: 'dragee', name: 'Dragées', scale: 2, gen: () => texMdDragee(403) }) - 1;
const M_CHOCOLAT = MATERIALS.push({ id: 'chocolat', name: 'Chocolat', scale: 2, gen: () => texMdChocolat(404) }) - 1;
const M_OBSIDIENNE = MATERIALS.push({ id: 'obsidienne', name: 'Pierre noire', scale: 3, gen: () => texMdObsidienne(405) }) - 1;
const M_BRAISE = MATERIALS.push({ id: 'braise', name: 'Braise', scale: 3, gen: () => texMdBraise(406) }) - 1;
const M_PAPIER_PEINT = MATERIALS.push({ id: 'papier_peint', name: 'Papier peint', scale: 2, gen: () => texMdPapierPeint(407) }) - 1;

// ---------------------------------------------------------------- sprites (végétation des visions)
const MONDES_SPR = {
  sucette(seed, cols) { // arbre-sucette : bâton blanc, disque en spirale
    const pb = new PixelBuf(64, 128), cx = 32, cy = 38, R = 26;
    for (let y = cy + R - 4; y < 128; y++) for (let x = cx - 2; x <= cx + 2; x++) { const k = 1 - (x - cx + 2) * 0.07; pb.set(x, y, [248 * k, 243 * k, 234 * k]); }
    for (let y = cy - R; y <= cy + R; y++) for (let x = cx - R; x <= cx + R; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy, r = Math.hypot(dx, dy);
      if (r > R) continue;
      const band = Math.floor((Math.atan2(dy, dx) / TAU + r / 10) * 4);
      const c = cols[((band % cols.length) + cols.length) % cols.length];
      let k = 1.08 - (dx + dy) / R * 0.14 - (r * r) / (R * R) * 0.18;
      if (r > R - 1.3) k *= 0.7;
      pb.set(x, y, [clamp(c[0] * k, 0, 255), clamp(c[1] * k, 0, 255), clamp(c[2] * k, 0, 255)]);
    }
    for (let k = 0; k < 7; k++) pb.set(cx - 14 + k, cy - 13 + (k >> 1), [255, 255, 255]);
    pb.set(cx - 16, cy - 9, [255, 255, 255]); pb.set(cx - 16, cy - 8, [255, 250, 252]);
    const rub = cols[0];
    for (let dy = -2; dy <= 2; dy++) for (let dx = -6; dx <= 6; dx++) if (Math.abs(dx) < 2 || Math.abs(dy) <= 2 - Math.abs(dx) * 0.25) pb.set(cx + dx, cy + R + 2 + dy, rub.map((v) => v * (Math.abs(dx) < 2 ? 0.75 : 1)));
    return pb;
  },
  canne(seed) { // sucre d'orge géant en forme de crosse
    const pb = new PixelBuf(56, 128), W = 5.5, pts = [];
    for (let y = 127; y >= 36; y -= 0.5) pts.push([36, y]);
    for (let a = 0; a <= Math.PI; a += 0.02) pts.push([24 + Math.cos(a) * 12, 36 - Math.sin(a) * 12]);
    for (let y = 36; y <= 46; y += 0.5) pts.push([12, y]);
    let s = 0;
    for (let i = 0; i < pts.length; i++) {
      const [px, py] = pts[i], [qx, qy] = pts[Math.min(i + 1, pts.length - 1)];
      if (i) s += Math.hypot(px - pts[i - 1][0], py - pts[i - 1][1]);
      let tx0 = qx - px, ty0 = qy - py; const tl = Math.hypot(tx0, ty0) || 1; tx0 /= tl; ty0 /= tl;
      for (let dy = -W; dy <= W; dy++) for (let dx = -W; dx <= W; dx++) {
        if (dx * dx + dy * dy > W * W) continue;
        const o = dx * -ty0 + dy * tx0, stripe = Math.floor((s + o * 0.9 + 40) / 7) & 1, k = 1.05 - (o / W) * 0.25;
        const c = stripe ? [224, 34, 58] : [252, 248, 246];
        pb.set(Math.round(px + dx), Math.round(py + dy), [clamp(c[0] * k, 0, 255), clamp(c[1] * k, 0, 255), clamp(c[2] * k, 0, 255)]);
      }
    }
    return pb;
  },
  barbe(seed, pal) { // arbre à barbe à papa : cornet rayé, nuage de sucre filé
    const pb = new PixelBuf(80, 128), cx = 40, rnd = mulberry32(seed);
    for (let y = 60; y < 128; y++) {
      const hw = 1.5 + (y - 60) / 68 * 2.5;
      for (let x = Math.floor(cx - hw); x <= Math.ceil(cx + hw); x++) {
        const u = (x + 0.5 - cx) / hw; if (Math.abs(u) > 1) continue;
        const band = Math.floor((y + u * 3) / 6) & 1, k = 1 - u * 0.2, c = band ? [236, 226, 210] : [118, 168, 220];
        pb.set(x, y, [c[0] * k, c[1] * k, c[2] * k]);
      }
    }
    const blobs = [];
    for (let i = 0; i < 26; i++) { const a = rnd() * TAU, u = Math.sqrt(rnd()); blobs.push({ x: cx + Math.cos(a) * 24 * u, y: 38 + Math.sin(a) * 26 * u, r: 9 + rnd() * 7, z: (1 - u) * 6 }); }
    drawCanopy(pb, blobs, pal, seed, { noise: 0.18, holes: 0.4, bottomDark: 0.16 });
    return pb;
  },
  meringue(seed) { // sapin de meringue, étoile au sommet, vermicelles
    const pb = new PixelBuf(64, 128), cx = 32, rnd = mulberry32(seed);
    const pal = ramp(['#d4aec0', '#e4c4d2', '#f2dae4', '#faecf2', '#fffafc']);
    drawTrunk(pb, cx, 100, cx, 127, 5, 6, ramp(['#3a1d0f', '#4a2614', '#5a311a', '#6b3c21']), seed);
    for (let k = 4; k >= 0; k--) {
      const ty0 = 4 + k * 20, ty1 = ty0 + 30, wb = 8 + k * 5.5;
      for (let y = ty0; y <= ty1; y++) {
        const t = (y - ty0) / (ty1 - ty0), hw = wb * Math.pow(t, 0.75) + 1;
        for (let x = Math.floor(cx - hw); x <= Math.ceil(cx + hw); x++) {
          const u = (x + 0.5 - cx) / hw; if (Math.abs(u) > 1) continue;
          if (t > 0.85 && Math.sin((x - cx) * 0.9) * 0.5 + 0.5 < (t - 0.85) * 6) continue;
          pb.set(x, y, rampPick(pal, 0.72 - u * 0.3 + (1 - t) * 0.1 + (hash2i(x, y, seed) - 0.5) * 0.12, x, y));
        }
      }
    }
    const SPR = [[240, 80, 120], [80, 180, 240], [250, 220, 60], [120, 210, 120], [200, 120, 230]];
    for (let k = 0; k < 70; k++) { const x = (rnd() * 64) | 0, y = (rnd() * 100) | 0; if (pb.alpha(x, y) === 255 && pb.alpha(x + 1, y) === 255) { const c = SPR[(rnd() * SPR.length) | 0]; pb.set(x, y, c); pb.set(x + 1, y, c.map((v) => v * 0.8)); } }
    for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) pb.set(cx + dx, 3 + dy, [255, 230, 90]);
    return pb;
  },
  gommes(seed) { // buisson de boules de gomme
    const pb = new PixelBuf(48, 32), rnd = mulberry32(seed);
    const C = [ramp(['#a01830', '#d02848', '#f04868', '#ff7890']), ramp(['#1a8040', '#28a858', '#40c870', '#70e098']), ramp(['#c08010', '#e0a820', '#f8c838', '#ffe070']), ramp(['#6020a0', '#8030c8', '#a050e8', '#c888ff']), ramp(['#c04010', '#e86020', '#ff8840', '#ffb070'])];
    for (let i = 0; i < 5; i++) { const r = 7 + rnd() * 2; drawSphere(pb, 7 + i * 8.5 + rnd() * 2, 31 - r * 0.8, r, C[i % C.length], seed + i, { sq: 0.95, flatBottom: 0.8, noise: 0.08 }); }
    for (let k = 0; k < 40; k++) { const x = (rnd() * 48) | 0, y = (rnd() * 30) | 0; if (pb.alpha(x, y) === 255) pb.set(x, y, [255, 255, 255]); }
    edgeDarken(pb, 0.8);
    return pb;
  },
  guimauves(seed) { // brochettes de guimauve (à la place des hautes herbes)
    const pb = new PixelBuf(32, 24), rnd = mulberry32(seed);
    for (let i = 0; i < 6; i++) {
      const x0 = Math.round(3 + rnd() * 24), h = 8 + rnd() * 14, col = rnd() < 0.5 ? [250, 196, 218] : rnd() < 0.5 ? [252, 250, 246] : [196, 238, 220];
      for (let y = 23; y > 23 - h; y--) {
        const c = Math.floor((23 - y) / 4) % 2 ? col : [252, 248, 250];
        for (let x = x0 - 1; x <= x0 + 2; x++) { const k = x === x0 - 1 ? 0.84 : x === x0 + 2 ? 0.78 : 1; pb.set(x, y, [c[0] * k, c[1] * k, c[2] * k]); }
      }
    }
    return pb;
  },
  fleurs(seed) { // fleurs-sucettes
    const pb = new PixelBuf(24, 20), rnd = mulberry32(seed);
    const C = [[240, 70, 130], [250, 200, 60], [120, 200, 250], [180, 110, 240], [250, 130, 80]];
    for (let i = 0; i < 6; i++) {
      const x = Math.round(2 + rnd() * 20), top = Math.round(3 + rnd() * 8), c = C[(rnd() * C.length) | 0];
      drawLine(pb, x, top, x, 19, [150, 230, 190]);
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (dx * dx + dy * dy <= 5) pb.set(x + dx, top + dy, (dx + dy) % 2 ? [255, 250, 250] : c);
    }
    return pb;
  },
  champi(seed) { // champignons de guimauve
    const pb = new PixelBuf(16, 12), rnd = mulberry32(seed);
    for (const [cx, cy, r] of [[5, 6, 3.6], [11, 7, 2.8]]) {
      drawLine(pb, cx, cy, cx, 11, [252, 248, 244], 2);
      drawSphere(pb, cx + 0.5, cy, r, ramp(['#d0608e', '#e87aa6', '#f496be', '#fcb4d4']), seed, { sq: 0.7, flatBottom: 0.2 });
      for (let k = 0; k < 3; k++) pb.set(Math.round(cx - r / 2 + rnd() * r), Math.round(cy - 1 - rnd() * 1.5), [255, 255, 255]);
    }
    return pb;
  },
  truffe(seed) { // rocher-truffe en chocolat, filets de sucre
    const pb = new PixelBuf(48, 34), rnd = mulberry32(seed);
    drawSphere(pb, 23, 22, 18, ramp(['#2a1208', '#3c1c0e', '#502816', '#65341e', '#7a4228']), seed, { sq: 0.72, flatBottom: 0.72, noise: 0.3 });
    for (let k = 0; k < 4; k++) { let x = 8 + rnd() * 30, y = 10 + rnd() * 4; for (let s = 0; s < 18; s++) { if (pb.alpha(Math.round(x), Math.round(y)) === 255) pb.set(Math.round(x), Math.round(y), [250, 244, 236]); x += 1; y += Math.sin(s * 0.8 + k) * 0.9; } }
    edgeDarken(pb);
    return pb;
  },
  dragees(seed) { // cailloux-dragées
    const pb = new PixelBuf(32, 12), rnd = mulberry32(seed);
    const C = [ramp(['#d88aa8', '#f0a8c4', '#fcc8dc']), ramp(['#88c8a8', '#a8e4c4', '#c8f4dc']), ramp(['#d8c878', '#f0e098', '#fcf0c0']), ramp(['#a898d8', '#c4b4f0', '#dcd0fc'])];
    for (let i = 0; i < 6; i++) drawSphere(pb, 4 + rnd() * 24, 8, 2.5 + rnd() * 1.6, C[i % C.length], seed + i, { sq: 0.7, flatBottom: 0.6 });
    return pb;
  },
  buche(seed) { // bûche de chocolat roulée
    const pb = new PixelBuf(24, 16);
    drawTrunk(pb, 12, 4, 12, 15, 14, 18, ramp(['#3a1a0c', '#4c2412', '#5e2f18', '#70391e']), seed);
    for (let y = 1; y < 8; y++) for (let x = 3; x < 22; x++) {
      const dx = (x - 12) / 8.5, dy = (y - 4) / 3, d = Math.sqrt(dx * dx + dy * dy);
      if (d > 1) continue;
      pb.set(x, y, d > 0.85 ? [70, 36, 18] : (Math.floor(d * 5 + Math.atan2(dy, dx) / TAU) % 2 ? [248, 238, 220] : [90, 46, 22]));
    }
    return pb;
  },
  herbe(seed, pal) { return spriteGrassClump(seed, 16, 12, pal, 10); },
  minisucette(c) { // petite fleur-sucette du champ d'herbe
    const pb = new PixelBuf(8, 12);
    drawLine(pb, 4, 5, 4, 11, [250, 246, 240]);
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (dx * dx + dy * dy <= 5) pb.set(4 + dx, 3 + dy, (Math.abs(dx) + Math.abs(dy)) % 2 ? [255, 250, 250] : c);
    return pb;
  },
  // --- Ténèbres
  ronce(seed) { // ronces noires aux épines rouges
    const pb = new PixelBuf(48, 32), rnd = mulberry32(seed);
    for (let i = 0; i < 16; i++) {
      let x = 6 + rnd() * 36, y = 31, a = -Math.PI / 2 + (rnd() - 0.5) * 1.8;
      const L = 10 + rnd() * 20;
      for (let s = 0; s < L; s++) {
        x += Math.cos(a); y += Math.sin(a); a += (rnd() - 0.5) * 0.55;
        pb.set(Math.round(x), Math.round(y), rnd() < 0.5 ? [16, 10, 12] : [32, 20, 22]);
        if (rnd() < 0.2) pb.set(Math.round(x + (rnd() < 0.5 ? 1 : -1)), Math.round(y), [138, 16, 14]);
      }
    }
    return pb;
  },
  yeux(seed) { // champignons à œil
    const pb = new PixelBuf(16, 12), rnd = mulberry32(seed);
    for (const [cx, cy, r] of [[5, 5, 3.2], [11, 7, 2.4]]) {
      drawLine(pb, cx, cy, cx + (rnd() - 0.5) * 2, 11, [200, 190, 180], 1);
      drawSphere(pb, cx + 0.5, cy, r, ramp(['#a8a098', '#ccc4bc', '#e8e2dc']), seed, { sq: 0.9 });
      pb.set(cx, cy, [20, 10, 10]); pb.set(cx + 1, cy, [140, 20, 16]);
    }
    return pb;
  },
  mains(seed) { // des mains qui sortent de terre (à la place des fleurs)
    const pb = new PixelBuf(24, 20), rnd = mulberry32(seed);
    for (let i = 0; i < 3; i++) {
      const x0 = 4 + i * 7 + rnd() * 2, top = 4 + rnd() * 6, lean = (rnd() - 0.5) * 3, pale = [196 - i * 12, 188 - i * 12, 176 - i * 10];
      for (let y = 19; y > top + 3; y--) { const x = Math.round(x0 + lean * (19 - y) / 16); pb.set(x, y, pale); pb.set(x + 1, y, pale.map((v) => v * 0.8)); }
      const hx = Math.round(x0 + lean), hy = Math.round(top);
      for (let f = 0; f < 4; f++) for (let k = 0; k < 3; k++) pb.set(hx - 1 + f, hy + k - (f === 1 || f === 2 ? 1 : 0), pale.map((v) => v * (k ? 0.9 : 1)));
      pb.set(hx - 2, hy + 3, pale); pb.set(hx - 1, hy + 3, pale);
    }
    return pb;
  },
};
// correspondances des sprites (calculées au premier usage, d'après les catégories d'objets)
const MONDES_PAL = {
  rose: ramp(['#d8709e', '#e888b4', '#f2a2c6', '#f8bcd8', '#fcd4e6', '#ffeaf4']),
  bleu: ramp(['#7aa4e0', '#90b6ea', '#a8c8f2', '#c2dcf8', '#dcecfc', '#f0f8ff']),
  menthe: ramp(['#5ab894', '#70c8a4', '#8ad8b8', '#a8e8cc', '#c8f4e0', '#e4fcf2']),
  blanc: ramp(['#d8c8d0', '#e4d8de', '#eee6ea', '#f6f0f2', '#fcf8fa', '#ffffff']),
  caramel: ramp(['#8a4a14', '#a8601c', '#c47a28', '#dc9638', '#eeb454', '#f8d07a']),
};
{
  const _afs = addFarmSprites;
  addFarmSprites = function (add) {
    _afs(add);
    const S = MONDES_SPR, P = MONDES_PAL;
    add('bb_sucette0', S.sucette(9101, [[248, 104, 156], [255, 246, 250]]));
    add('bb_sucette1', S.sucette(9102, [[236, 70, 80], [250, 168, 56], [250, 228, 84], [110, 206, 120], [100, 156, 238], [184, 112, 228]]));
    add('bb_sucette2', S.sucette(9103, [[96, 204, 164], [255, 250, 250], [250, 150, 190]]));
    add('bb_canne0', S.canne(9104));
    add('bb_barbe0', S.barbe(9105, P.rose)); add('bb_barbe1', S.barbe(9106, P.bleu));
    add('bb_meringue0', S.meringue(9107));
    add('bb_gommes0', S.gommes(9108)); add('bb_guimauves0', S.guimauves(9109)); add('bb_fleurs0', S.fleurs(9110));
    add('bb_champi0', S.champi(9111)); add('bb_truffe0', S.truffe(9112)); add('bb_dragees0', S.dragees(9113)); add('bb_buche0', S.buche(9114));
    // champ d'herbe : touffes de sucre filé, fils de caramel, fleurs-sucettes (mêmes rangs que GRASS_VARIANTS)
    add('bbg_0', S.herbe(9121, P.rose)); add('bbg_1', S.herbe(9122, P.blanc)); add('bbg_2', S.herbe(9123, P.menthe)); add('bbg_3', spriteGrassClump(9124, 14, 22, P.rose, 9, true));
    add('bbg_4', S.herbe(9125, P.caramel)); add('bbg_5', spriteGrassClump(9126, 14, 16, P.caramel, 9, true));
    [[250, 250, 252], [252, 214, 60], [236, 50, 70], [90, 150, 240], [180, 100, 232], [250, 140, 200]].forEach((c, i) => add('bbg_f' + i, S.minisucette(c)));
    add('tn_ronce0', S.ronce(9131)); add('tn_yeux0', S.yeux(9132)); add('tn_mains0', S.mains(9133));
  };
}

// ---------------------------------------------------------------- icônes des objets des autres mondes
{
  const _ip = iconPaint;
  iconPaint = function (shape, c1, c2) {
    if (typeof shape !== 'string' || !shape.startsWith('md_')) return _ip(shape, c1, c2);
    const pb = new PixelBuf(16, 16), col = hexToRgb(c1 || '#aaaaaa'), col2 = hexToRgb(c2 || '#ffffff');
    const set = (x, y, c) => pb.set(x, y, c);
    const disc = (cx, cy, r, fn) => { for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) { const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy); if (d <= r) set(x, y, fn(x, y, d)); } };
    const sh = (c, k) => [clamp(c[0] * k, 0, 255), clamp(c[1] * k, 0, 255), clamp(c[2] * k, 0, 255)];
    switch (shape) {
      case 'md_pilule': // gélule deux tons
        for (let y = 5; y <= 10; y++) for (let x = 2; x <= 13; x++) {
          const ex = x < 5 ? 5 - x : x > 10 ? x - 10 : 0, ey = Math.abs(y - 7.5);
          if (ex * ex + ey * ey * 1.6 > 9.5) continue;
          set(x, y, sh(x < 8 ? col : col2, 1.12 - (y - 5) * 0.08));
        }
        set(4, 6, [255, 255, 255]); set(5, 6, [255, 255, 255]); break;
      case 'md_sucette': for (let y = 9; y < 16; y++) set(8, y, [246, 240, 232]); disc(8, 6, 5, (x, y, d) => (Math.floor(Math.atan2(y - 6, x - 8) / TAU * 4 + d / 2) & 1 ? col : col2)); set(6, 3, [255, 255, 255]); break;
      case 'md_barbe': for (let y = 10; y < 16; y++) set(8, y, [236, 226, 210]); disc(8, 6.5, 5.5, (x, y, d) => sh(col, 1.1 - d * 0.05 + ((x * 7 + y * 3) % 5 === 0 ? 0.12 : 0))); break;
      case 'md_guimauve': for (let y = 5; y <= 12; y++) for (let x = 4; x <= 11; x++) set(x, y, sh(y < 7 ? col2 : col, 1.05 - (x - 4) * 0.03)); for (let x = 4; x <= 11; x++) set(x, 4, sh(col2, 1.1)); break;
      case 'md_canne': for (let y = 6; y < 16; y++) { set(10, y, (y >> 1) % 2 ? col : [252, 248, 246]); set(11, y, (y >> 1) % 2 ? sh(col, 0.8) : [220, 214, 214]); } for (let a = 0; a <= 8; a++) { const t = a / 8 * Math.PI, x = Math.round(7.5 + Math.cos(t) * 3), y = Math.round(6 - Math.sin(t) * 3); set(x, y, a % 2 ? col : [252, 248, 246]); set(x, y + 1, a % 2 ? sh(col, 0.8) : [220, 214, 214]); } break;
      case 'md_dragee': [[5, 7, col], [10, 6, col2], [8, 10, [250, 230, 150]], [11, 11, [200, 180, 244]]].forEach(([x, y, c]) => disc(x, y, 2.3, (xx, yy, d) => sh(c, 1.15 - d * 0.12))); break;
      case 'md_ourson': { const c = col; disc(8, 10, 4, () => c); disc(8, 5, 3, () => sh(c, 1.08)); disc(5.5, 2.8, 1.3, () => c); disc(10.5, 2.8, 1.3, () => c); set(7, 5, [40, 20, 20]); set(9, 5, [40, 20, 20]); set(5, 8, [255, 255, 255]); break; }
      case 'md_crin': for (let k = 0; k < 6; k++) { const c = [[240, 80, 90], [250, 170, 60], [250, 230, 90], [110, 210, 120], [100, 150, 240], [190, 120, 230]][k]; for (let y = 2; y < 15; y++) set(3 + k * 2 + Math.round(Math.sin(y * 0.6 + k) * 1.2), y, c); } break;
      case 'md_coeur': disc(5.5, 6, 3.3, () => col); disc(10.5, 6, 3.3, () => col); for (let y = 7; y < 14; y++) for (let x = 2 + (y - 7); x <= 13 - (y - 7); x++) set(x, y, col); for (const [x, y] of [[6, 5], [7, 8], [9, 9], [10, 6], [8, 11]]) set(x, y, col2); break;
      case 'md_oeil': disc(8, 8, 6, (x, y, d) => (d < 2.2 ? [20, 12, 10] : d < 3.6 ? col : [238, 232, 224])); set(6, 6, [255, 255, 255]); for (const [x, y] of [[3, 7], [4, 11], [12, 5]]) set(x, y, [170, 30, 30]); break;
      case 'md_ronce': for (let k = 0; k < 3; k++) for (let y = 1; y < 16; y++) { const x = 4 + k * 4 + Math.round(Math.sin(y * 0.7 + k * 2) * 1.5); set(x, y, col); if (y % 4 === k) set(x + 1, y, col2); } break;
      case 'md_lys': for (let y = 7; y < 16; y++) set(8, y, [110, 110, 104]); for (let a = 0; a < 6; a++) { const t = a / 6 * TAU; for (let r = 1; r <= 4; r++) set(Math.round(8 + Math.cos(t) * r), Math.round(5 + Math.sin(t) * r * 0.7), sh(col, 1.1 - r * 0.08)); } set(8, 5, [60, 58, 54]); break;
      case 'md_dessin': for (let y = 2; y < 14; y++) for (let x = 2; x < 14; x++) set(x, y, [236, 228, 208]); for (const [x, y] of [[7, 4], [8, 4], [7, 5], [8, 5], [7, 6], [8, 6], [7, 7], [8, 7], [6, 7], [9, 7], [7, 8], [8, 8], [6, 10], [9, 10], [7, 9], [8, 9], [5, 6], [10, 6]]) set(x, y, col); set(7, 5, [240, 30, 30]); set(8, 5, [240, 30, 30]); for (let x = 3; x < 13; x++) set(x, 12, [80, 140, 60]); break;
      case 'md_cle': disc(5, 6, 3, (x, y, d) => (d < 1.4 ? [0, 0, 0] : col)); pb.set(5, 6, [0, 0, 0], 0); for (let x = 7; x < 14; x++) set(x, 6, col); set(12, 7, col); set(12, 8, col); set(10, 7, col); break;
      case 'md_page': for (let y = 2; y < 15; y++) for (let x = 3; x < 13; x++) set(x, y, sh(col, 1 - (y - 2) * 0.01)); for (let y = 4; y < 13; y += 2) for (let x = 4; x < 12; x++) if ((x * 3 + y) % 5) set(x, y, col2); break;
      default: return _ip('objet', c1, c2);
    }
    return pb;
  };
}

// ---------------------------------------------------------------- squelettes des bêtes des autres mondes
function mdRecolor(r, fn) { for (const q of r.parts) if (q.s) { const o = fn(q); if (o) { if (o.col) q.col = o.col; if (o.tex !== undefined) q.tex = o.tex; if (o.fl !== undefined) q.fl = o.fl; } } return r; }
const MONDES_RIGS = {
  // pays des bonbons
  ourson(v) { const C = ['#e8243e', '#2ab85a', '#f2b41c', '#9444e4', '#f27028', '#f25aa0'], c = rgbf(C[(v || 0) % C.length]); return mdRecolor(scaleRig(ANIMAL_RIGS.bear(), 0.42), (q) => ({ col: q.name === 'snout' ? v3.scale(c, 1.2).map((x) => Math.min(1, x)) : c, tex: q.name === 'head' ? tx(TL.plain, TL.dogF) : TL.plain })); },
  lapin(v) { return mdRecolor(scaleRig(ANIMAL_RIGS.rabbit(), 1.35), (q) => ({ col: q.name === 'earL' || q.name === 'earR' || q.name === 'tail' ? rgbf('#f6a8c8') : (v || 0) % 2 ? rgbf('#fce4ee') : [1, 1, 1], tex: q.name === 'head' ? tx(TL.plain, TL.rabbitF) : TL.plain })); },
  licorne() {
    const r = mdRecolor(ANIMAL_RIGS.horse(3), (q) => ({ col: [1, 0.97, 0.99], tex: q.name === 'head' ? tx(TL.plain, TL.horseF) : TL.plain }));
    return rigPlus(r, [
      { name: 'corne', parent: 'head', p: [0, 0.3, 0.3], s: [0.06, 0.4, 0.06], o: [0, 0.18, 0], col: rgbf('#f8d060'), tex: TL.stripes, r0: [0.5, 0, 0] },
      { name: 'crin1', parent: 'neck', p: [0, 0.3, -0.05], s: [0.08, 0.26, 0.5], o: [0, 0, 0], col: rgbf('#f0708a'), tex: TL.hair },
      { name: 'crin2', parent: 'neck', p: [0, 0.18, -0.2], s: [0.08, 0.24, 0.36], o: [0, 0, 0], col: rgbf('#80b0f0'), tex: TL.hair },
    ]);
  },
  cerf() { return mdRecolor(ANIMAL_RIGS.deer(0), (q) => ({ col: /antler|bois/i.test(q.name) ? rgbf('#fff4f6') : rgbf('#e03050'), tex: /antler|bois/i.test(q.name) ? TL.plain : q.name === 'head' ? tx(TL.stripes, TL.deerF) : TL.stripes })); },
  // Ténèbres
  chien_ecorche() { return mdRecolor(scaleRig(ANIMAL_RIGS.wolf(), 1.15), (q) => ({ col: /leg/.test(q.name) ? rgbf('#d8ccb8') : rgbf('#8a1a18'), tex: /leg/.test(q.name) ? TL.bone : q.name === 'head' ? tx(TL.blood, TL.wolfF) : TL.blood })); },
  rampant() { return mdRecolor(paleRig(false), () => ({ col: rgbf('#c8c4bc') })); },
  ombre() { return paleRig(true); },
  pendu() { return mdRecolor(humanRig({ skin: '#8a9088', hair: '#1a1614', top: '#3a3430', bottom: '#2a2622', shoe: '#1a1612', face: TL.blankF }), () => null); },
  // cauchemar : l'homme au sac
  tueur() {
    const r = humanRig({ skin: '#b89a84', hair: '#1a1614', hairStyle: 'chauve', top: '#4a4038', bottom: '#2e2822', shoe: '#1a1410', apron: '#7a1e18', face: TL.sack, height: 1.12, build: 'rond' });
    const h = r.part('head'); if (h) { h.tex = tx(TL.sack, TL.sack); h.col = rgbf('#c8b088'); }
    return rigPlus(r, [
      { name: 'crocM', parent: 'handR', p: [0, -0.04, 0.04], s: [0.05, 0.05, 0.3], o: [0, 0, 0.1], col: rgbf('#3a2a1e'), tex: TL.wood },
      { name: 'croc1', parent: 'handR', p: [0, -0.04, 0.3], s: [0.03, 0.26, 0.03], o: [0, -0.1, 0], col: rgbf('#8a8c92'), tex: TL.iron },
      { name: 'croc2', parent: 'handR', p: [0, -0.24, 0.26], s: [0.03, 0.03, 0.12], o: [0, 0, -0.04], col: rgbf('#8a8c92'), tex: TL.iron },
      { name: 'sang', parent: 'handR', p: [0.02, -0.18, 0.3], s: [0.012, 0.1, 0.035], o: [0, 0, 0], col: [0.5, 0.04, 0.03], tex: TL.blood },
    ]);
  },
  // Enfers
  damne(v) { const g = 0.36 + ((v || 0) % 3) * 0.06; return mdRecolor(paleRig(false), () => ({ col: [g, g * 0.94, g * 0.9] })); },
  chien_cendre() {
    const r = mdRecolor(scaleRig(ANIMAL_RIGS.wolf(), 1.25), (q) => ({ col: q.name === 'head' ? [0.2, 0.18, 0.17] : [0.14, 0.13, 0.13], tex: TL.coal }));
    return rigPlus(r, [{ name: 'yeux', parent: 'head', p: [0, 0.06, 0.25], s: [0.2, 0.04, 0.02], o: [0, 0, 0], col: [1.4, 0.45, 0.1], tex: TL.plain, fl: FX_EMIT }]);
  },
  gardien() {
    const r = humanRig({ skin: '#8c867a', hair: '#d8d4cc', hairStyle: 'long', beard: 'longue', top: '#1c1a1e', bottom: '#141216', shoe: '#0c0a0a', coat: true, hat: 'chapeau', hatCol: '#101012', face: TL.blankF, held: 'livre', height: 1.4, build: 'mince' });
    return r;
  },
  ame(v) {
    const r = humanRig({ skin: '#d8e0e8', hair: '#c8d0da', hairStyle: (v || 0) % 2 ? 'long' : 'court', top: '#c4ccd6', bottom: '#b8c0cc', shoe: '#aab2be', dress: !!((v || 0) % 2), face: TL.blankF });
    for (const q of r.parts) if (q.s) q.fl = FX_EMIT;
    return r;
  },
};
