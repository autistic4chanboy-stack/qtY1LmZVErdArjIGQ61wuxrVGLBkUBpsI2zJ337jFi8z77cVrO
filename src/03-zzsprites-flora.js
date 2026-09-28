// ============================================================================
//  ARBRES ET FLEURS EN PLUS (sprites) : hêtre, châtaignier, noyer, saule
//  pleureur, peuplier, sapin (et sapin enneigé), mélèze, tilleul, érable (rouge
//  et doré), cerisier en fleurs, poirier, prunier, aulne, if, houx, arbre
//  foudroyé ; jacinthes, digitales, lupins, iris, orchidées, boutons d'or,
//  pissenlits, primevères, violettes, trèfle, reine-des-prés, achillée,
//  campanules, chardons, mauves, gentianes, edelweiss, rhododendrons,
//  églantier, sureau, myosotis, jonquilles.
// ============================================================================
const FLORA_PAL = {
  hetre: ramp(['#1f3d12', '#2b5419', '#3a6c22', '#4b842c', '#5e9a37', '#76b046', '#90c458']),
  chataignier: ramp(['#142a0c', '#1d3a11', '#294d17', '#35601e', '#437427', '#528830']),
  noyer: ramp(['#1c3812', '#274b18', '#335f1f', '#417327', '#508731', '#63993c']),
  saule: ramp(['#2f4f16', '#3e651c', '#4f7c24', '#62922d', '#78a93a', '#90bf4a', '#a8d15e']),
  peuplier: ramp(['#1e4214', '#29561a', '#356c21', '#43822a', '#539834', '#67ad42']),
  sapin: ramp(['#0a1c14', '#0f281c', '#153524', '#1c432d', '#245236', '#2d6140']),
  meleze: ramp(['#27401a', '#335322', '#41672b', '#517c35', '#629041', '#78a650']),
  tilleul: ramp(['#26461a', '#325b20', '#3f7128', '#4e8832', '#5f9e3d', '#76b44c', '#8fc85e']),
  erable: ramp(['#5a160c', '#7a2210', '#9c3214', '#bf4718', '#d9601f', '#ec7d2c', '#f59b40']),
  erable2: ramp(['#6a3a0c', '#8a5010', '#ad6a14', '#cc861a', '#e2a424', '#f0c034']),
  cerisier: ramp(['#8a4a64', '#a8607c', '#c47b95', '#d898ae', '#e8b6c6', '#f4d2de', '#fbe8ee']),
  poirier: ramp(['#243f16', '#30531c', '#3d6823', '#4c7e2c', '#5d9336', '#72a843']),
  prunier: ramp(['#2a0f1c', '#3a1626', '#4e1f32', '#63293f', '#7a344c', '#92425c']),
  aulne: ramp(['#142c10', '#1c3a15', '#264b1b', '#305d22', '#3c6f29']),
  if: ramp(['#0c1a0e', '#122414', '#18301a', '#1f3c21', '#284a29']),
  houx: ramp(['#0e2410', '#153216', '#1d411d', '#265026', '#306031']),
};
const BARK_PAL = {
  gris: ramp(['#4a4a46', '#5f5e59', '#76746c', '#8e8b82', '#a4a198']),
  pale: ramp(['#5c574e', '#736c61', '#8b8376', '#a39a8b', '#b8ae9e']),
  rouge: ramp(['#3a211b', '#4e2c23', '#63382c', '#784537', '#8e5343']),
  noir: ramp(['#0e0c0b', '#1a1714', '#26221e', '#34302a', '#433e37']),
};
const specks = (pb, rnd, n, cols, x0, y0, x1, y1) => { for (let k = 0; k < n; k++) { const x = (x0 + rnd() * (x1 - x0)) | 0, y = (y0 + rnd() * (y1 - y0)) | 0; if (pb.alpha(x, y) === 255) pb.set(x, y, cols[(rnd() * cols.length) | 0]); } };

// ---------------------------------------------------------------- arbres à couronne ronde
function spriteRoundTree(seed, o) {
  const rnd = mulberry32(seed), W = o.w || 96, Hh = o.h || 128, cx = W / 2;
  const pb = new PixelBuf(W, Hh), j = (v, a = 6) => v + (rnd() - 0.5) * a;
  const ty = o.trunkTop ?? 60;
  drawTrunk(pb, cx, ty, cx, Hh - 5, o.tw0 || 8, o.tw1 || 12, o.bark || PAL.bark, seed, o.marks);
  for (let x = -8; x <= 8; x++) { const h = Math.round(4 - Math.abs(x) * 0.45); for (let y = 0; y < h; y++) pb.set(cx + x, Hh - 1 - y, rampPick(o.bark || PAL.bark, 0.35 - x * 0.03, cx + x, y)); }
  drawLine(pb, cx - 1, ty + 12, cx - 16, ty - 6, (o.bark || PAL.bark)[2], 2); drawLine(pb, cx + 1, ty + 8, cx + 18, ty - 8, (o.bark || PAL.bark)[1], 2);
  const cy = o.cy ?? 50, sp = o.spread ?? 1, sq = o.sq || 1, blobs = [];
  for (const [dx, dy, r, z] of [[0, 0, 28, 0], [-20, 6, 19, 0], [20, 6, 19, 0], [-11, -18, 21, 0], [12, -17, 20, 0], [0, -29, 17, 4], [-28, -4, 13, 0], [28, -4, 13, 0], [-6, -7, 16, 10]]) {
    blobs.push({ x: j(cx + dx * sp), y: j(cy + dy * sq * (o.tall || 1)), r: r * (o.rk || 1), z, sq });
  }
  if (o.heart) blobs.push({ x: cx - 16, y: cy - 30, r: 15 }, { x: cx + 16, y: cy - 30, r: 15 });
  drawCanopy(pb, blobs, o.pal, seed, { noise: o.noise ?? 0.32, holes: o.holes ?? 1, bottomDark: o.bottomDark ?? 0.32 });
  if (o.dots) for (const [n, cols] of o.dots) specks(pb, rnd, n, cols, cx - 40, cy - 45, cx + 40, cy + 30);
  edgeDarken(pb);
  return pb;
}
// saule pleureur : couronne + longues mèches qui tombent
function spriteWillow(seed) {
  const rnd = mulberry32(seed), W = 104, Hh = 128, cx = W / 2, pb = new PixelBuf(W, Hh), P = FLORA_PAL.saule;
  drawTrunk(pb, cx, 50, cx - 2, Hh - 4, 9, 14, PAL.bark, seed);
  const blobs = [];
  for (let k = 0; k < 9; k++) blobs.push({ x: cx + (rnd() - 0.5) * 60, y: 34 + rnd() * 16, r: 12 + rnd() * 8 });
  drawCanopy(pb, blobs, P, seed, { noise: 0.4, bottomDark: 0.1 });
  for (let s = 0; s < 70; s++) {
    const x0 = cx + (rnd() - 0.5) * 84, y0 = 30 + rnd() * 26, len = 30 + rnd() * 52, sway = (rnd() - 0.5) * 6;
    for (let t = 0; t < len; t++) { const x = Math.round(x0 + sway * (t / len) * (t / len)), y = Math.round(y0 + t); if (y >= Hh - 6) break; pb.set(x, y, rampPick(P, 0.75 - t / len * 0.55 + (rnd() - 0.5) * 0.2, x, y)); }
  }
  edgeDarken(pb, 0.82);
  return pb;
}
// peuplier : haute colonne étroite
function spritePoplar(seed) {
  const rnd = mulberry32(seed), W = 40, Hh = 128, cx = W / 2, pb = new PixelBuf(W, Hh);
  drawTrunk(pb, cx, 70, cx, Hh - 4, 4, 7, BARK_PAL.gris, seed, true);
  const blobs = [];
  for (let k = 0; k < 16; k++) { const y = 8 + k * 6.5; blobs.push({ x: cx + (rnd() - 0.5) * 6, y, r: 8 + Math.sin(k / 15 * Math.PI) * 7 + rnd() * 2, sq: 1.3 }); }
  drawCanopy(pb, blobs, FLORA_PAL.peuplier, seed, { noise: 0.45, holes: 1.3, bottomDark: 0.25 });
  edgeDarken(pb);
  return pb;
}
// conifères : sapin (étroit, sombre), mélèze (aéré, clair), if (large, sombre) ; neige sur les branches
function spriteConifer(seed, o) {
  const rnd = mulberry32(seed), W = o.w || 64, Hh = 128, cx = W / 2, pb = new PixelBuf(W, Hh);
  drawTrunk(pb, cx, 96, cx, Hh - 1, 5, 7, o.bark || PAL.bark, seed);
  const tiers = o.tiers || 7;
  for (let k = tiers - 1; k >= 0; k--) {
    const ty0 = 2 + k * (o.step || 14), ty1 = ty0 + (o.th || 24), wb = (o.w0 || 6) + k * (o.wk || 3.6);
    for (let y = ty0; y <= ty1; y++) {
      const t = (y - ty0) / (ty1 - ty0), hw = wb * Math.pow(t, 0.8) + 1;
      for (let x = Math.floor(cx - hw); x <= Math.ceil(cx + hw); x++) {
        const u = (x + 0.5 - cx) / hw;
        if (Math.abs(u) > 1) continue;
        if (o.airy && hash2i(x >> 1, y >> 1, seed + k) < 0.28) continue;
        if (t > 0.75 && hash2i(x >> 1, y, seed + k) < (t - 0.75) * 4) continue;
        let v = 0.6 - u * 0.3 + (1 - t) * 0.12 - t * 0.2 + (hash2i(x, y, seed) - 0.5) * 0.3;
        let c = rampPick(o.pal, v, x, y);
        if (o.snow && t < 0.35 + hash2i(x, k, seed) * 0.2) c = rampPick(ramp(['#b8c4d0', '#d4dde6', '#eef2f6', '#ffffff']), 0.8 - t * 1.4 - u * 0.2, x, y);
        pb.set(x, y, c);
      }
    }
  }
  if (o.berries) specks(pb, rnd, o.berries, [[190, 30, 30], [220, 60, 50]], cx - 30, 10, cx + 30, 100);
  edgeDarken(pb);
  return pb;
}
// arbre foudroyé : tronc noirci, fendu, quelques branches
function spriteStruckTree(seed) {
  const rnd = mulberry32(seed), W = 64, Hh = 112, cx = W / 2, pb = new PixelBuf(W, Hh), P = BARK_PAL.noir;
  drawTrunk(pb, cx, 40, cx, Hh - 1, 7, 10, P, seed);
  thickLine(pb, cx - 1, 44, cx - 9, 8, 4, P, 0.4); thickLine(pb, cx + 2, 46, cx + 11, 12, 3, P, 0.5);
  for (let k = 0; k < 6; k++) { const y = 20 + rnd() * 40, s = rnd() < 0.5 ? -1 : 1; drawLine(pb, cx + s * 3, y, cx + s * (10 + rnd() * 14), y - 6 - rnd() * 10, P[1], 1); }
  for (let y = 44; y < 60; y++) pb.set(cx, y, [16, 12, 10]); // la fente
  specks(pb, rnd, 14, [[200, 80, 30], [150, 60, 30], [90, 90, 90]], cx - 6, 40, cx + 6, Hh - 4); // braises, cendres
  edgeDarken(pb, 0.9);
  return pb;
}
// houx : petit arbre touffu, baies rouges
function spriteHolly(seed) {
  const rnd = mulberry32(seed), pb = new PixelBuf(48, 64), cx = 24, blobs = [];
  drawTrunk(pb, cx, 50, cx, 63, 3, 5, PAL.bark, seed);
  for (let k = 0; k < 10; k++) blobs.push({ x: cx + (rnd() - 0.5) * 26, y: 16 + rnd() * 30, r: 8 + rnd() * 6 });
  drawCanopy(pb, blobs, FLORA_PAL.houx, seed, { noise: 0.4, bottomDark: 0.35 });
  specks(pb, rnd, 26, [[200, 24, 24], [230, 50, 40]], 4, 6, 44, 54);
  edgeDarken(pb);
  return pb;
}

// ---------------------------------------------------------------- fleurs sauvages
function spriteWild(kind, seed) {
  const rnd = mulberry32(seed);
  const size = { digitale: [22, 40], lupin: [24, 32], lupin2: [24, 32], iris: [22, 30], reine_pres: [26, 34], chardon: [22, 30], rhododendron: [40, 26], eglantier: [44, 30], sureau: [48, 38], jonquille: [22, 24], campanule: [22, 26], orchidee: [18, 26], achillee: [24, 24], mauve: [26, 24] }[kind] || [24, 18];
  const [W, H] = size, pb = new PixelBuf(W, H);
  const stem = (x, top, lean = 0, col) => drawLine(pb, x + lean, top, x, H - 1, col || PAL.stem[1 + ((rnd() * 2) | 0)]);
  const bush = (pal, n, y0) => { const blobs = []; for (let k = 0; k < n; k++) blobs.push({ x: 6 + rnd() * (W - 12), y: y0 + rnd() * (H - y0 - 6), r: 5 + rnd() * 4 }); drawCanopy(pb, blobs, pal, seed, { noise: 0.4, bottomDark: 0.4 }); };
  const px = (x, y, c) => pb.set(Math.round(x), Math.round(y), c);
  switch (kind) {
    case 'jacinthe': for (let i = 0; i < 6; i++) { const x = 3 + rnd() * (W - 6), top = 4 + rnd() * 6; stem(x, top, (rnd() - 0.5) * 3); for (let b = 0; b < 4; b++) { px(x + 1 + (b % 2), top + 1 + b * 2, [70, 90, 210]); px(x + 1, top + 2 + b * 2, [50, 60, 170]); } } break;
    case 'digitale': for (let i = 0; i < 3; i++) { const x = 5 + i * 6 + rnd() * 2, top = 2 + rnd() * 6; stem(x, top); for (let b = 0; b < 9; b++) { const y = top + 2 + b * 2.2; px(x - 1, y, [200, 90, 170]); px(x + 1, y + 1, [220, 110, 190]); px(x, y + 1, [150, 50, 120]); } } break;
    case 'lupin': case 'lupin2': { const C = kind === 'lupin' ? [[90, 110, 230], [230, 110, 180], [150, 90, 220]] : [[245, 245, 240], [170, 100, 220], [240, 200, 90]]; for (let i = 0; i < 4; i++) { const x = 3 + i * 5.5 + rnd() * 2, top = 3 + rnd() * 8, c = C[i % C.length]; stem(x, top); for (let b = 0; b < 8; b++) { px(x - 1, top + b * 1.5, c); px(x + 1, top + b * 1.5 + 0.7, c.map((v) => v * 0.8)); } } break; }
    case 'iris': for (let i = 0; i < 6; i++) { const x = 4 + rnd() * (W - 8); drawLine(pb, x + (rnd() - 0.5) * 4, 6 + rnd() * 8, x, H - 1, PAL.stem[2]); } for (let i = 0; i < 3; i++) { const x = 5 + i * 6, y = 4 + rnd() * 4; for (const [dx, dy] of [[0, 0], [-1, 1], [1, 1], [0, -1], [-2, 2], [2, 2]]) px(x + dx, y + dy, i % 2 ? [240, 210, 40] : [250, 230, 80]); px(x, y + 1, [140, 90, 30]); } break;
    case 'orchidee': for (let i = 0; i < 2; i++) { const x = 6 + i * 6, top = 3 + rnd() * 4; stem(x, top); for (let b = 0; b < 7; b++) { px(x - 1, top + b * 1.6, [220, 120, 190]); px(x + 1, top + b * 1.6 + 0.8, [200, 90, 170]); } } for (let x = 3; x < 15; x++) { px(x, H - 2, PAL.stem[2]); if (x % 3 === 0) px(x, H - 2, [60, 40, 50]); } break;
    case 'bouton_or': for (let i = 0; i < 10; i++) { const x = 2 + rnd() * (W - 4), top = 3 + rnd() * 9; stem(x, top); px(x, top, [252, 220, 40]); px(x + 1, top, [240, 190, 20]); px(x, top - 1, [255, 240, 110]); } break;
    case 'pissenlit': for (let x = 2; x < W - 2; x++) if (rnd() < 0.6) px(x, H - 2 - rnd() * 2, PAL.stem[2]); for (let i = 0; i < 5; i++) { const x = 3 + rnd() * (W - 6), top = 4 + rnd() * 7; stem(x, top); if (i < 3) { for (const [dx, dy] of [[0, 0], [-1, 0], [1, 0], [0, -1]]) px(x + dx, top + dy, [250, 210, 30]); } else { for (let a = 0; a < 8; a++) px(x + Math.cos(a * 0.785) * 2, top + Math.sin(a * 0.785) * 2, [240, 240, 236]); px(x, top, [210, 210, 200]); } } break;
    case 'primevere': for (let x = 4; x < W - 4; x++) px(x, H - 2, PAL.stem[3]); for (let i = 0; i < 6; i++) { const x = 4 + rnd() * (W - 8), y = H - 6 - rnd() * 6; stem(x, y); for (const [dx, dy] of [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]]) px(x + dx, y + dy, dx || dy ? [250, 240, 150] : [240, 170, 40]); } break;
    case 'violette': for (let x = 5; x < W - 5; x++) { px(x, H - 2, PAL.stem[2]); if (rnd() < 0.5) px(x, H - 3, PAL.stem[3]); } for (let i = 0; i < 7; i++) { const x = 4 + rnd() * (W - 8), y = H - 5 - rnd() * 5; px(x, y, [120, 60, 180]); px(x + 1, y, [150, 90, 210]); px(x, y - 1, [150, 90, 210]); px(x, y + 1, [240, 220, 120]); } break;
    case 'trefle_f': for (let x = 3; x < W - 3; x++) if (rnd() < 0.7) px(x, H - 2 - rnd() * 2, PAL.stem[2 + ((rnd() * 2) | 0)]); for (let i = 0; i < 6; i++) { const x = 3 + rnd() * (W - 6), top = 5 + rnd() * 6, c = i % 3 ? [240, 236, 236] : [230, 150, 180]; stem(x, top); for (const [dx, dy] of [[0, 0], [-1, 0], [1, 0], [0, -1], [-1, -1], [1, -1]]) px(x + dx, top + dy, c.map((v) => v * (0.8 + rnd() * 0.2))); } break;
    case 'reine_pres': for (let i = 0; i < 4; i++) { const x = 4 + i * 5.5, top = 3 + rnd() * 6; stem(x, top); for (let k = 0; k < 10; k++) px(x + (rnd() - 0.5) * 6, top + rnd() * 5, [250, 244, 214]); } break;
    case 'achillee': for (let i = 0; i < 4; i++) { const x = 3 + i * 6, top = 3 + rnd() * 6; stem(x, top); for (let dx = -2; dx <= 2; dx++) { px(x + dx, top, [245, 245, 238]); px(x + dx * 0.5, top - 1, [230, 230, 220]); } } break;
    case 'campanule': for (let i = 0; i < 4; i++) { const x = 3 + i * 5.5, top = 3 + rnd() * 7; stem(x, top); for (let b = 0; b < 3; b++) { const y = top + b * 4; px(x + 1, y, [110, 120, 230]); px(x + 1, y + 1, [80, 90, 200]); px(x + 2, y + 1, [130, 140, 240]); } } break;
    case 'chardon': for (let i = 0; i < 3; i++) { const x = 4 + i * 7, top = 4 + rnd() * 6; stem(x, top, 0, [110, 140, 90]); for (let y = top + 4; y < H - 2; y += 3) { px(x - 1, y, [140, 170, 110]); px(x + 1, y + 1, [140, 170, 110]); } for (const [dx, dy] of [[0, 0], [-1, 0], [1, 0]]) px(x + dx, top + dy + 1, [100, 130, 80]); for (const [dx, dy] of [[0, -1], [-1, -1], [1, -1], [0, -2], [-1, -2], [1, -2]]) px(x + dx, top + dy + 1, [170, 70, 190]); } break;
    case 'mauve': bush(ramp(['#1d4414', '#2a5a1c', '#3a7226']), 5, 6); specks(pb, rnd, 16, [[230, 130, 190], [200, 100, 170], [245, 170, 215]], 2, 2, W - 2, H - 6); break;
    case 'gentiane': for (let x = 5; x < W - 5; x++) px(x, H - 2, PAL.stem[3]); for (let i = 0; i < 5; i++) { const x = 4 + rnd() * (W - 8), y = H - 7 - rnd() * 6; stem(x, y + 2); px(x, y, [30, 60, 200]); px(x, y + 1, [20, 40, 170]); px(x - 1, y - 1, [50, 90, 230]); px(x + 1, y - 1, [50, 90, 230]); } break;
    case 'edelweiss': for (let x = 5; x < W - 5; x++) px(x, H - 2, [150, 160, 140]); for (let i = 0; i < 4; i++) { const x = 5 + rnd() * (W - 10), y = H - 7 - rnd() * 5; stem(x, y, 0, [150, 160, 140]); for (let a = 0; a < 6; a++) px(x + Math.cos(a * 1.05) * 2, y + Math.sin(a * 1.05) * 1.5, [240, 240, 232]); px(x, y, [220, 200, 120]); } break;
    case 'rhododendron': bush(ramp(['#132c14', '#1b3b1b', '#244b22']), 7, 4); specks(pb, rnd, 30, [[220, 70, 130], [240, 110, 160], [200, 50, 110]], 2, 2, W - 2, H - 8); break;
    case 'eglantier': bush(ramp(['#1b3e14', '#26521b', '#326722', '#40792b']), 8, 4); specks(pb, rnd, 18, [[240, 170, 190], [250, 200, 215]], 2, 2, W - 2, H - 8); specks(pb, rnd, 8, [[200, 40, 30]], 2, 2, W - 2, H - 8); break;
    case 'sureau': bush(ramp(['#183a12', '#224d18', '#2e621f', '#3a7527']), 9, 6); for (let k = 0; k < 7; k++) { const x = 6 + rnd() * (W - 12), y = 5 + rnd() * (H - 16); for (let dx = -2; dx <= 2; dx++) px(x + dx, y, [245, 240, 215]); px(x, y - 1, [250, 248, 230]); } specks(pb, rnd, 10, [[30, 20, 40]], 4, 8, W - 4, H - 8); break;
    case 'myosotis': for (let x = 3; x < W - 3; x++) if (rnd() < 0.7) px(x, H - 2 - rnd() * 3, PAL.stem[2 + ((rnd() * 2) | 0)]); for (let i = 0; i < 12; i++) { const x = 3 + rnd() * (W - 6), y = H - 5 - rnd() * 7; px(x, y, [110, 160, 240]); px(x + 1, y, [140, 190, 250]); if (rnd() < 0.5) px(x, y, [250, 230, 90]); } break;
    case 'jonquille': for (let i = 0; i < 5; i++) { const x = 3 + rnd() * (W - 6); drawLine(pb, x + (rnd() - 0.5) * 3, 8 + rnd() * 6, x, H - 1, PAL.stem[2]); } for (let i = 0; i < 3; i++) { const x = 5 + i * 6, y = 4 + rnd() * 5; stem(x, y + 2); for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1]]) px(x + dx, y + dy, [250, 236, 120]); px(x, y, [240, 170, 30]); px(x + 1, y + 1, [230, 150, 20]); } break;
    default: stem(W / 2, 4); px(W / 2, 4, [240, 240, 240]);
  }
  return pb;
}

// ---------------------------------------------------------------- inscription dans l'atlas
{
  const _afs = addFarmSprites;
  addFarmSprites = function (add) {
    _afs(add);
    add('hetre0', spriteRoundTree(811, { pal: FLORA_PAL.hetre, bark: BARK_PAL.gris, spread: 1.15, tw0: 7, tw1: 11 }));
    add('hetre1', spriteRoundTree(812, { pal: FLORA_PAL.hetre, bark: BARK_PAL.gris, spread: 1.1, cy: 46 }));
    add('chataignier0', spriteRoundTree(821, { pal: FLORA_PAL.chataignier, spread: 1.2, cy: 54, tw1: 14, dots: [[34, [[232, 222, 170], [214, 200, 140]]]] }));
    add('noyer0', spriteRoundTree(831, { pal: FLORA_PAL.noyer, bark: BARK_PAL.pale, spread: 1.25, holes: 1.7, sq: 0.8, cy: 48 }));
    add('saule0', spriteWillow(841)); add('saule1', spriteWillow(842));
    add('peuplier0', spritePoplar(851)); add('peuplier1', spritePoplar(852));
    add('sapin0', spriteConifer(861, { pal: FLORA_PAL.sapin, w: 56, tiers: 8, step: 12, th: 22, w0: 4, wk: 3.3 }));
    add('sapin1', spriteConifer(862, { pal: FLORA_PAL.sapin, w: 60, tiers: 7, step: 13, th: 24, w0: 5, wk: 3.6 }));
    add('sapinneige0', spriteConifer(863, { pal: FLORA_PAL.sapin, w: 56, tiers: 8, step: 12, th: 22, w0: 4, wk: 3.3, snow: true }));
    add('sapinneige1', spriteConifer(864, { pal: FLORA_PAL.sapin, w: 60, tiers: 7, step: 13, th: 24, w0: 5, wk: 3.6, snow: true }));
    add('meleze0', spriteConifer(871, { pal: FLORA_PAL.meleze, w: 60, tiers: 7, step: 13, th: 22, w0: 4, wk: 3.8, airy: true }));
    add('if0', spriteConifer(881, { pal: FLORA_PAL.if, w: 72, tiers: 6, step: 13, th: 30, w0: 12, wk: 4, berries: 16 }));
    add('tilleul0', spriteRoundTree(891, { pal: FLORA_PAL.tilleul, spread: 1.05, heart: true, cy: 54, dots: [[30, [[236, 230, 150], [220, 214, 120]]]] }));
    add('erable0', spriteRoundTree(901, { pal: FLORA_PAL.erable, spread: 1.0, cy: 52 }));
    add('erable1', spriteRoundTree(902, { pal: FLORA_PAL.erable2, spread: 0.95, cy: 50 }));
    add('cerisier0', spriteRoundTree(911, { pal: FLORA_PAL.cerisier, bark: BARK_PAL.rouge, spread: 1.0, rk: 0.9, cy: 56, dots: [[40, [[255, 250, 252], [250, 236, 240]]]] }));
    add('poirier0', spriteRoundTree(921, { pal: FLORA_PAL.poirier, spread: 0.8, tall: 1.3, cy: 48, dots: [[30, [[250, 250, 244]]], [14, [[200, 210, 80], [180, 190, 60]]]] }));
    add('prunier0', spriteRoundTree(931, { pal: FLORA_PAL.prunier, bark: BARK_PAL.rouge, spread: 0.85, rk: 0.8, cy: 60, dots: [[22, [[40, 20, 60], [60, 30, 90]]]] }));
    add('aulne0', spriteRoundTree(941, { pal: FLORA_PAL.aulne, spread: 0.85, tall: 1.25, cy: 50, bark: BARK_PAL.noir }));
    add('houx0', spriteHolly(951));
    add('foudroye0', spriteStruckTree(961)); add('foudroye1', spriteStruckTree(962));
    for (const k of ['jacinthe', 'digitale', 'lupin', 'lupin2', 'iris', 'orchidee', 'bouton_or', 'pissenlit', 'primevere', 'violette', 'trefle_f', 'reine_pres', 'achillee', 'campanule', 'chardon', 'mauve', 'gentiane', 'edelweiss', 'rhododendron', 'eglantier', 'sureau', 'myosotis', 'jonquille']) add('w_' + k, spriteWild(k, 970 + k.length * 7 + k.charCodeAt(0)));
  };
}
