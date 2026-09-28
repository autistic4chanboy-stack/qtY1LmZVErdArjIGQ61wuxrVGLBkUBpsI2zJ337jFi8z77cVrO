// ============================================================================
//  SPRITES (FERME) : décor, icônes d'objets, outils tenus en main
// ============================================================================

const TINT_A = 180;

function thickLine(pb, x0, y0, x1, y1, w, pal, v0) {
  const n = Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))) + 1;
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, px = -dy / L, py = dx / L;
  for (let i = 0; i <= n; i++) {
    const t = i / n, cx = x0 + dx * t, cy = y0 + dy * t;
    for (let k = -w / 2; k <= w / 2; k += 0.5) {
      const x = Math.round(cx + px * k), y = Math.round(cy + py * k);
      pb.set(x, y, Array.isArray(pal[0]) ? rampPick(pal, v0 - (k / w) * 0.6, x, y) : pal);
    }
  }
}

// ---------------------------------------------------------------- décor
function spriteDeadTree(seed) {
  const pb = new PixelBuf(64, 96), rnd = mulberry32(seed), bark = ramp(['#1e1813', '#2c241c', '#3b3126', '#4b3f31']);
  const branch = (x, y, a, len, w, depth) => {
    const x2 = x + Math.sin(a) * len, y2 = y - Math.cos(a) * len;
    thickLine(pb, x, y, x2, y2, w, bark, 0.6);
    if (depth > 0) for (let k = 0; k < 2; k++) branch(x2, y2, a + (k ? 1 : -1) * (0.35 + rnd() * 0.5), len * (0.55 + rnd() * 0.2), Math.max(1, w * 0.6), depth - 1);
  };
  branch(32, 95, (rnd() - 0.5) * 0.2, 40, 6, 4);
  edgeDarken(pb, 0.8);
  return pb;
}
function spriteFern(seed) {
  const pb = new PixelBuf(24, 16), rnd = mulberry32(seed);
  for (let i = 0; i < 7; i++) {
    const a = -1.3 + i * 0.43 + (rnd() - 0.5) * 0.2, len = 8 + rnd() * 5;
    for (let s = 0; s < len; s++) {
      const x = 12 + Math.sin(a) * s, y = 15 - Math.cos(a) * s * 0.9 + (s * s) * 0.02;
      pb.set(Math.round(x), Math.round(y), PAL.stem[2 + ((s + i) % 2)]);
      if (s % 2 === 0 && s > 1) { pb.set(Math.round(x + Math.cos(a) * 1.5), Math.round(y + Math.sin(a) * 1.5), PAL.stem[1]); pb.set(Math.round(x - Math.cos(a) * 1.5), Math.round(y - Math.sin(a) * 1.5), PAL.stem[3]); }
    }
  }
  return pb;
}
function spriteHeather(seed) {
  const pb = new PixelBuf(24, 14), rnd = mulberry32(seed);
  const blobs = [];
  for (let i = 0; i < 6; i++) blobs.push({ x: 4 + rnd() * 16, y: 8 + rnd() * 3, r: 3 + rnd() * 2 });
  drawCanopy(pb, blobs, ramp(['#2a2a1c', '#3c3a24', '#4c4a2c']), seed, { bottomDark: 0.3 });
  for (let k = 0; k < 40; k++) { const x = (2 + rnd() * 20) | 0, y = (3 + rnd() * 8) | 0; if (pb.alpha(x, y) === 255) pb.set(x, y, rnd() < 0.5 ? [150, 80, 170] : [190, 110, 200]); }
  return pb;
}
function spriteHerbs(seed) {
  const pb = new PixelBuf(20, 14), rnd = mulberry32(seed);
  for (let i = 0; i < 9; i++) {
    const x0 = 10 + (rnd() - 0.5) * 6, a = (rnd() - 0.5) * 1.4, len = 6 + rnd() * 6;
    for (let s = 0; s < len; s++) pb.set(Math.round(x0 + Math.sin(a) * s), Math.round(13 - Math.cos(a) * s), PAL.stem[1 + (s % 3)]);
    const tx = Math.round(x0 + Math.sin(a) * len), ty = Math.round(13 - Math.cos(a) * len);
    for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [-1, 0]]) pb.set(tx + dx, ty + dy, i % 3 ? [230, 230, 240] : [180, 120, 210]);
  }
  return pb;
}
function spriteVein(kind) {
  const pb = new PixelBuf(28, 22), col = [[200, 116, 58], [170, 176, 190], [240, 196, 64], [20, 20, 24]][kind];
  drawSphere(pb, 14, 13, 11, PAL.rock, 11 + kind, { sq: 0.8, flatBottom: 0.7 });
  const rnd = mulberry32(90 + kind);
  for (let k = 0; k < 26; k++) {
    const x = (5 + rnd() * 18) | 0, y = (6 + rnd() * 12) | 0;
    if (pb.alpha(x, y) !== 255) continue;
    pb.set(x, y, col); if (rnd() < 0.5) pb.set(x + 1, y, C(col, 0.75));
  }
  return pb;
}
function spriteLily() {
  const pb = new PixelBuf(24, 8), leaf = ramp(['#1e4a1e', '#2c6a2a', '#3c8a36']);
  for (const [cx, cy, r] of [[6, 5, 4], [16, 4, 5], [11, 6, 3]]) drawSphere(pb, cx, cy, r, leaf, cx, { sq: 0.45 });
  pb.set(16, 3, [240, 220, 230]); pb.set(15, 3, [230, 180, 200]); pb.set(17, 3, [230, 180, 200]);
  return pb;
}
function spriteWisp(f) {
  const pb = new PixelBuf(8, 8);
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { const d = Math.hypot(x - 3.5, y - 3.5 - f * 0.5); if (d < 3.5) pb.set(x, y, d < 1.6 ? [230, 255, 255] : [110, 200, 255], EMISSIVE_A); }
  return pb;
}
function spriteNote() {
  const pb = new PixelBuf(12, 16);
  for (let y = 7; y < 16; y++) pb.set(6, y, PAL.wood[2]);
  for (let y = 0; y < 9; y++) for (let x = 1; x < 11; x++) pb.set(x, y, y === 0 || x === 1 ? [240, 234, 214] : [222, 214, 190]);
  for (const y of [2, 4, 6]) for (let x = 3; x < 9; x++) if (hash2i(x, y, 4) > 0.3) pb.set(x, y, [70, 60, 60]);
  return pb;
}
function spriteBones() {
  const pb = new PixelBuf(24, 10), bone = ramp(['#8a8272', '#b2aa98', '#d6cfbd', '#ebe6d8']);
  drawSphere(pb, 5, 6, 3.4, bone, 1, { sq: 0.9 });
  pb.set(4, 6, [30, 26, 22]); pb.set(6, 6, [30, 26, 22]);
  for (let k = 0; k < 4; k++) drawLine(pb, 10, 5 + k, 22, 3 + k * 1.5, bone[2 - (k % 2)]);
  return pb;
}

// ---------------------------------------------------------------- icônes (16 x 16)
const hexc = (h) => hexToRgb(h);
const rampOf = (c) => { const r = typeof c === 'string' ? (c[0] === '#' ? hexc(c) : [170, 170, 170]) : c; return [C(r, 0.5), C(r, 0.72), r, C(r, 1.18).map((v) => Math.min(255, v))]; };
function iconPaint(shape, c1, c2) {
  const pb = new PixelBuf(16, 16), P = rampOf(c1 || '#aaaaaa');
  const S = (cx, cy, r, pal, o) => drawSphere(pb, cx, cy, r, pal || P, (cx * 7 + cy) | 0, o || {});
  const L = (x0, y0, x1, y1, c, w) => drawLine(pb, x0, y0, x1, y1, typeof c === 'string' ? hexc(c) : c, w || 1);
  const R = (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) pb.set(x, y, typeof c === 'function' ? c(x, y) : c); };
  const wood = PAL.wood, steel = ramp(['#3c4148', '#59606a', '#7e8792', '#aeb6bf']);
  const tier = rampOf(c1 || '#9aa2ac');
  switch (shape) {
    case 'sac':
      R(4, 4, 11, 14, (x, y) => rampPick(ramp(['#a88a5a', '#c8aa78', '#e0c898']), 0.8 - (x - 4) * 0.06, x, y));
      R(5, 2, 10, 3, [170, 140, 96]); L(5, 4, 10, 4, [120, 96, 60]);
      S(8, 10, 2.6, P); break;
    case 'crop_ble':
      for (let k = -2; k <= 2; k++) { L(8, 15, 8 + k * 2, 4, [200, 170, 80]); for (let y = 2; y < 7; y++) pb.set(8 + k * 2 + (y % 2), y, [240, 200, 90]); }
      L(6, 11, 10, 11, [140, 100, 50]); break;
    case 'crop_carotte':
      for (let i = 0; i < 9; i++) for (let w = -2 + (i >> 2); w <= 2 - (i >> 2); w++) pb.set(4 + i + w, 13 - i + w, rampPick(P, 0.7 - w * 0.1, i, w));
      L(12, 5, 14, 1, '#4a9a3a'); L(12, 5, 15, 4, '#3a8a2a'); L(12, 5, 11, 1, '#5aaa4a'); break;
    case 'crop_patate': S(8, 9, 5.5, P, { sq: 0.8, noise: 0.3 }); pb.set(6, 8, C(P[0], 0.8)); pb.set(10, 10, C(P[0], 0.8)); break;
    case 'crop_chou': S(8, 9, 6, rampOf('#7ab050')); for (let k = 0; k < 5; k++) L(8, 9, 8 + Math.cos(k * 1.26) * 5, 9 + Math.sin(k * 1.26) * 5, [150, 200, 110]); break;
    case 'crop_tomate': S(8, 9, 5.5, P); L(6, 4, 10, 4, '#3a8a2a'); L(8, 3, 8, 5, '#3a8a2a'); pb.set(6, 7, [255, 200, 190]); break;
    case 'crop_citrouille': S(8, 10, 6.5, P, { sq: 0.75 }); for (const x of [5, 8, 11]) L(x, 6, x, 14, C(P[1], 0.9)); L(8, 3, 9, 5, '#4a6a2a', 2); break;
    case 'crop_mais': R(6, 3, 10, 13, (x, y) => ((x + y) % 2 ? [240, 200, 60] : [220, 170, 40])); L(5, 14, 5, 5, '#5a9a3a', 2); L(11, 14, 11, 5, '#5a9a3a', 2); break;
    case 'crop_fraise':
      for (let y = 5; y < 14; y++) { const w = y < 8 ? 4 : Math.max(0, 5 - (y - 8)); for (let x = 8 - w; x <= 8 + w; x++) pb.set(x, y, rampPick(P, 0.8 - (x - 8) * 0.05, x, y)); }
      for (const [x, y] of [[6, 7], [9, 8], [7, 10], [10, 6]]) pb.set(x, y, [250, 230, 120]);
      L(5, 4, 11, 4, '#3a8a2a'); L(8, 2, 8, 4, '#3a8a2a'); break;
    case 'crop_tournesol': for (let k = 0; k < 12; k++) L(8, 8, 8 + Math.cos(k * 0.52) * 7, 8 + Math.sin(k * 0.52) * 7, '#f0c020'); S(8, 8, 3.2, rampOf('#6a4a20')); break;
    case 'crop_radis': S(8, 10, 4.2, P); L(8, 14, 8, 15, [240, 230, 230]); pb.set(7, 15, [240, 230, 230]); L(8, 6, 6, 1, '#4a9a3a', 2); L(8, 6, 11, 2, '#3a8a2a', 2); pb.set(6, 9, [255, 190, 200]); break;
    case 'crop_lin': for (let k = -1; k <= 1; k++) L(8, 15, 8 + k * 3, 4, '#6a9a4a'); for (const [x, y] of [[5, 4], [8, 3], [11, 4]]) { S(x, y, 1.6, rampOf('#6a8ae0')); pb.set(x, y, [230, 230, 120]); } break;
    case 'crop_betterave': S(8, 10, 4.8, P, { sq: 0.95 }); L(8, 15, 8, 14, C(P[0], 0.8)); L(8, 5, 5, 1, '#7a2a40', 2); L(8, 5, 11, 1, '#3a8a2a', 2); L(8, 5, 8, 1, '#4a9a3a'); break;
    case 'crop_haricot': for (let i = 0; i < 3; i++) { const x0 = 3 + i * 4; for (let y = 3; y < 14; y++) { const x = x0 + Math.round(Math.sin(y * 0.35) * 1.2); pb.set(x, y, rampPick(P, 0.7, x, y)); pb.set(x + 1, y, rampPick(P, 0.95, x, y)); } } break;
    case 'crop_melon': S(8, 9, 6.5, P, { sq: 0.9 }); for (let k = -4; k <= 4; k += 2) L(8 + k, 4, 8 + k * 0.6, 14, C(P[0], 0.85)); L(8, 2, 9, 3, '#4a6a2a', 2); break;
    case 'oeuf': S(8, 9, 5, P, { sq: 1.25 }); break;
    case 'bouteille': R(5, 6, 10, 15, (x, y) => rampPick(ramp(['#b8b8b0', '#e0e0d8', '#f8f8f4']), 0.9 - (x - 5) * 0.1, x, y)); R(6, 3, 9, 5, [220, 220, 214]); R(6, 1, 9, 2, [60, 90, 150]); break;
    case 'laine': S(8, 9, 6, P, { noise: 0.4 }); for (let k = 0; k < 3; k++) L(3, 6 + k * 3, 13, 9 + k * 2, C(P[1], 0.9)); break;
    case 'truffe': S(8, 9, 5, P, { noise: 0.6, sq: 0.85 }); pb.set(7, 7, [90, 70, 60]); break;
    case 'plume': L(3, 14, 13, 2, [120, 100, 80]); for (let i = 0; i < 9; i++) { L(4 + i, 12 - i, 1 + i, 9 - i * 1.1, P[2]); L(4 + i, 12 - i, 7 + i, 13 - i * 1.1, P[3]); } break;
    case 'pot': R(4, 6, 11, 14, (x, y) => rampPick(P, 0.85 - (x - 4) * 0.07, x, y)); R(4, 3, 11, 5, [200, 180, 150]); L(4, 5, 11, 5, [150, 120, 90]); R(6, 8, 9, 11, [240, 230, 200]); break;
    case 'champi': L(8, 7, 8, 15, [226, 220, 204], 3); S(8.5, 7, 6, P, { sq: 0.6, flatBottom: 0.2 }); pb.set(6, 5, [250, 245, 235]); pb.set(10, 4, [250, 245, 235]); break;
    case 'baies': L(4, 4, 11, 3, '#3a7a2a', 2); for (const [x, y] of [[5, 9], [10, 8], [8, 12], [11, 12]]) S(x, y, 2.6, P); break;
    case 'fleur': for (const [x, c] of [[4, [220, 50, 40]], [8, [245, 210, 60]], [12, [240, 240, 232]]]) { L(x, 6, 8, 15, PAL.stem[2]); S(x, 5, 2.2, rampOf(c)); } break;
    case 'herbes': for (let k = -3; k <= 3; k++) { L(8, 15, 8 + k * 1.6, 3 + Math.abs(k), P[2 + (k & 1)], 2); } L(5, 11, 11, 11, [170, 140, 90], 2); break;
    case 'rond': S(8, 9, 6, P); L(8, 2, 9, 4, '#5a3a20', 1); pb.set(10, 3, [80, 160, 60]); pb.set(11, 3, [80, 160, 60]); pb.set(6, 6, [255, 220, 210]); break;
    case 'viande': S(8, 9, 6, P, { sq: 0.75 }); for (let x = 11; x < 16; x++) pb.set(x, 6, [236, 230, 214]); pb.set(15, 5, [236, 230, 214]); break;
    case 'cuir': fillPoly(pb, [[2, 4], [14, 3], [15, 12], [9, 14], [1, 12]], P, () => 0.6); break;
    case 'cerf': L(8, 15, 8, 6, P[2], 2); L(8, 9, 3, 3, P[2], 2); L(8, 8, 13, 2, P[2], 2); L(5, 6, 3, 8, P[3]); L(11, 5, 14, 7, P[3]); break;
    case 'buche':
      for (let y = 5; y < 13; y++) for (let x = 1; x < 13; x++) pb.set(x, y, rampPick(PAL.bark, 0.7 - (y - 5) * 0.07 + (hash2i(x >> 1, y, 2) - 0.5) * 0.3, x, y));
      S(13, 9, 4, ramp(['#8e6c42', '#b08a58', '#caa570'])); pb.set(13, 9, [120, 90, 60]); break;
    case 'caillou': S(8, 9, 6, PAL.rock, { sq: 0.8, flatBottom: 0.7 }); break;
    case 'fibre': for (let k = 0; k < 7; k++) L(3 + k, 15, 5 + k * 1.2, 1, k % 2 ? [140, 170, 80] : [180, 190, 100]); L(3, 9, 13, 9, [120, 90, 50], 2); break;
    case 'charbon': for (const [x, y, r] of [[5, 10, 3.5], [10, 11, 4], [8, 6, 3]]) S(x, y, r, ramp(['#101012', '#222226', '#38383e', '#505058']), { noise: 0.4 }); break;
    case 'minerai': S(8, 9, 6, PAL.rock, { sq: 0.85, flatBottom: 0.7 }); { const rnd = mulberry32(c1.length * 13 + 5); for (let k = 0; k < 8; k++) pb.set((4 + rnd() * 8) | 0, (6 + rnd() * 6) | 0, P[3]); } break;
    case 'lingot': fillPoly(pb, [[2, 13], [14, 13], [12, 6], [4, 6]], P, (x, y) => 0.9 - (y - 6) * 0.06 - (x - 2) * 0.02); L(4, 6, 12, 6, P[3]); break;
    case 'gemme': fillPoly(pb, [[8, 1], [13, 6], [8, 15], [3, 6]], P, (x) => 0.9 - (x - 3) * 0.07); L(3, 6, 13, 6, P[3]); break;
    case 'foin': R(2, 5, 13, 13, (x, y) => rampPick(ramp(['#a08a4a', '#c8ac62', '#e0c882']), 0.8 - (y - 5) * 0.05 + (hash2i(x, y >> 1, 3) - 0.5) * 0.4, x, y)); L(5, 5, 5, 13, [120, 90, 50]); L(10, 5, 10, 13, [120, 90, 50]); break;
    case 'figurine': R(6, 7, 10, 14, (x, y) => rampPick(wood, 0.8 - (x - 6) * 0.1, x, y)); S(8, 4, 2.5, wood); L(5, 8, 5, 11, wood[1]); L(11, 8, 11, 11, wood[1]); break;
    case 'pain': S(8, 10, 6.5, P, { sq: 0.55 }); for (const x of [5, 8, 11]) L(x - 1, 8, x + 1, 7, C(P[3], 1)); break;
    case 'brioche': S(8, 10, 5.5, P, { sq: 0.7 }); S(8, 5, 3, P); break;
    case 'tarte': R(2, 9, 13, 13, (x, y) => rampPick(ramp(['#8a5a2a', '#b07a3a', '#d09a50']), 0.8 - (y - 9) * 0.1, x, y)); for (let x = 3; x < 13; x += 2) pb.set(x, 8, [220, 160, 80]); for (let x = 3; x < 13; x++) pb.set(x, 9, x % 3 ? P[2] : [230, 180, 100]); break;
    case 'bol': R(2, 7, 13, 8, P[2]); for (let y = 8; y < 14; y++) { const w = 6 - (y - 8); for (let x = 8 - w; x < 8 + w; x++) pb.set(x, y, rampPick(ramp(['#8a8a90', '#b8b8c0', '#e0e0e8']), 0.8 - (x - 2) * 0.05, x, y)); } break;
    case 'fromage': fillPoly(pb, [[2, 13], [14, 13], [14, 7], [2, 11]], P, (x) => 0.8); for (const [x, y] of [[6, 11], [10, 10], [12, 12]]) pb.set(x, y, C(P[1], 0.8)); break;
    case 'poisson':
      for (let x = 2; x < 13; x++) { const h = Math.sin((x - 2) / 11 * Math.PI) * 4; for (let y = Math.round(8 - h); y <= Math.round(8 + h); y++) pb.set(x, y, rampPick(P, 0.9 - (y - 4) * 0.08, x, y)); }
      fillPoly(pb, [[12, 8], [15, 4], [15, 12]], P, () => 0.5); pb.set(4, 7, [20, 20, 20]); break;
    case 'hache': L(3, 14, 11, 3, wood[2], 2); fillPoly(pb, [[9, 2], [14, 1], [15, 7], [11, 7]], tier, (x) => 0.9 - (x - 9) * 0.05); L(15, 1, 15, 7, tier[3]); break;
    case 'pioche': L(4, 14, 9, 4, wood[2], 2); fillPoly(pb, [[1, 5], [8, 2], [15, 5], [15, 6], [8, 4], [1, 6]], tier, () => 0.7); break;
    case 'houe': L(3, 14, 10, 3, wood[2], 2); R(9, 1, 12, 3, tier[1]); fillPoly(pb, [[11, 2], [14, 2], [15, 9], [12, 9]], tier, (x) => 0.9 - (x - 11) * 0.06); L(12, 9, 15, 9, tier[3]); break;
    case 'arrosoir': R(3, 7, 10, 14, (x, y) => rampPick(steel, 0.9 - (x - 3) * 0.08, x, y)); L(10, 9, 15, 5, steel[2], 2); L(4, 6, 9, 4, steel[1]); L(9, 4, 10, 7, steel[1]); break;
    case 'faux': L(4, 15, 9, 1, wood[2], 2); for (let i = 0; i < 9; i++) pb.set(9 - i, 1 + Math.round(i * i * 0.05), steel[3]); for (let i = 0; i < 8; i++) pb.set(9 - i, 2 + Math.round(i * i * 0.05), steel[2]); break;
    case 'canne': L(2, 15, 14, 1, wood[2]); L(14, 1, 12, 12, [200, 200, 200]); pb.set(12, 12, [200, 40, 30]); pb.set(12, 13, [240, 240, 240]); break;
    case 'arc': for (let y = 1; y < 15; y++) { const x = 11 - Math.round(Math.sin((y - 1) / 14 * Math.PI) * 6); pb.set(x, y, wood[2]); pb.set(x + 1, y, wood[1]); } L(11, 1, 11, 14, [220, 220, 210]); break;
    case 'fleche': L(2, 14, 13, 3, wood[2]); fillPoly(pb, [[13, 1], [15, 1], [15, 3], [12, 4]], steel, () => 0.8); L(2, 12, 4, 14, [230, 230, 230]); L(1, 13, 3, 15, [200, 60, 50]); break;
    case 'marteau': L(4, 14, 9, 5, wood[2], 2); fillPoly(pb, [[5, 2], [13, 6], [11, 9], [3, 5]], tier, () => 0.7); break;
    case 'cisailles': L(3, 14, 11, 4, steel[2], 2); L(5, 14, 13, 4, steel[3], 2); S(4, 13, 2, rampOf('#8a3a2a')); S(6, 14, 2, rampOf('#8a3a2a')); break;
    case 'seau': for (let y = 6; y < 15; y++) { const w = 5 - Math.round((y - 6) * 0.25); for (let x = 8 - w; x <= 7 + w; x++) pb.set(x, y, rampPick(wood, 0.8 - (x - 3) * 0.06, x, y)); } L(3, 8, 12, 8, [80, 80, 86]); L(3, 13, 12, 13, [80, 80, 86]); for (let a = 0; a < 12; a++) pb.set(3 + a * 0.8, 6 - Math.sin(a / 11 * Math.PI) * 4, [90, 90, 96]); break;
    case 'lanterne': R(5, 5, 10, 13, (x, y) => (x === 5 || x === 10 || y === 5 || y === 13 ? [70, 70, 76] : [255, 210, 120])); R(6, 2, 9, 4, [70, 70, 76]); pb.set(7, 1, [70, 70, 76]); pb.set(8, 1, [70, 70, 76]); S(7.5, 9, 1.5, rampOf('#fff0b0')); break;
    case 'montre': S(8, 9, 6, rampOf('#d0b060')); S(8, 9, 4.5, ramp(['#d8d4c8', '#f0ece0', '#fbf8f0'])); L(8, 9, 8, 6, [30, 30, 30]); L(8, 9, 10, 9, [30, 30, 30]); R(7, 1, 9, 2, [200, 170, 80]); break;
    case 'boussole': S(8, 8, 6.5, rampOf('#b88a50')); S(8, 8, 5, ramp(['#d8d4c8', '#f0ece0', '#fbf8f0'])); L(8, 4, 8, 8, [200, 40, 30], 1); L(8, 8, 8, 12, [40, 40, 50], 1); break;
    case 'objet': {
      const k = c1 || '';
      if (k === 'cloture' || k === 'portillon') { L(3, 4, 3, 14, wood[1], 2); L(12, 4, 12, 14, wood[1], 2); L(2, 7, 14, 7, wood[3], 1); L(2, 11, 14, 11, wood[3], 1); }
      else if (k === 'epouvantail') { L(8, 15, 8, 5, wood[1]); L(3, 8, 13, 8, wood[1]); R(6, 7, 10, 11, [150, 50, 40]); S(8, 4, 2.4, ramp(['#a88a5a', '#c8aa78', '#e0c898'])); L(5, 2, 11, 2, [200, 170, 90]); }
      else if (k === 'lampadaire' || k === 'lanterne_sol') { L(8, 15, 8, 6, [70, 70, 76], 2); R(6, 2, 10, 6, [255, 210, 120]); }
      else if (k === 'coffre' || k === 'caisse_expedition') { R(2, 6, 13, 14, (x, y) => rampPick(wood, 0.8 - (y - 6) * 0.04, x, y)); L(2, 8, 13, 8, [60, 60, 66]); R(7, 8, 8, 10, [220, 190, 70]); }
      else if (k === 'pot_fleurs' || k === 'parterre' || k === 'arche_fleurie') { R(4, 9, 11, 14, [190, 100, 60]); S(6, 7, 2.5, rampOf('#e04040')); S(10, 6, 2.5, rampOf('#f0d040')); S(8, 8, 2, rampOf('#4a8a3a')); }
      else if (k === 'allee' || k === 'dalle') { for (const [x, y] of [[2, 2], [9, 2], [2, 9], [9, 9]]) R(x, y, x + 5, y + 5, (xx, yy) => rampPick(PAL.rock, 0.8 - (yy - y) * 0.06, xx, yy)); }
      else if (k === 'plancher') { R(1, 2, 14, 13, (x, y) => rampPick(wood, 0.75 - (y % 4 === 0 ? 0.3 : 0), x, y)); }
      else if (k === 'jeune_pommier') { L(8, 15, 8, 7, PAL.bark[2], 2); S(8, 6, 4.5, rampOf('#4a8a3a')); pb.set(6, 5, [200, 40, 40]); }
      else if (k === 'feu_camp') { for (let a = 0; a < 6; a++) pb.set(8 + Math.cos(a) * 5, 12 + Math.sin(a) * 2, [140, 140, 140]); S(8, 9, 3.5, ramp(['#c04010', '#f08020', '#ffd060']), { sq: 1.4 }); }
      else if (k === 'ruche') { for (let k2 = 0; k2 < 3; k2++) R(4, 4 + k2 * 3, 11, 6 + k2 * 3, k2 === 1 ? [240, 190, 60] : [180, 130, 80]); R(3, 3, 12, 3, [110, 80, 50]); }
      else if (k === 'statue') { R(5, 11, 11, 15, [150, 150, 150]); R(7, 5, 9, 10, [170, 170, 170]); S(8, 3, 2, PAL.rock); }
      else if (k === 'niche') { R(3, 7, 12, 14, (x, y) => rampPick(wood, 0.8, x, y)); L(2, 7, 8, 2, [150, 50, 40], 2); L(8, 2, 13, 7, [150, 50, 40], 2); R(6, 10, 9, 14, [20, 20, 20]); }
      else { R(3, 5, 12, 14, (x, y) => rampPick(wood, 0.8 - (y - 5) * 0.03 + (x === 3 || x === 12 || y === 5 || y === 14 ? -0.3 : 0), x, y)); L(3, 5, 12, 14, wood[0]); L(12, 5, 3, 14, wood[0]); }
      break;
    }
    case 'animal': for (const [x, y, r] of [[8, 11, 3.2], [4, 6, 1.8], [7, 4, 1.8], [10, 4, 1.8], [13, 6, 1.8]]) S(x, y, r, P); break;
    case 'colis': R(2, 5, 13, 14, (x, y) => rampPick(ramp(['#8a6a44', '#a8845a', '#c8a070']), 0.8 - (y - 5) * 0.04, x, y)); L(8, 5, 8, 14, [200, 180, 140]); L(2, 9, 13, 9, [200, 180, 140]); break;
    case 'lettre': R(2, 4, 13, 12, [236, 228, 204]); L(2, 4, 8, 9, [160, 150, 130]); L(13, 4, 8, 9, [160, 150, 130]); pb.set(8, 9, [180, 40, 40]); break;
    case 'cle': S(4, 5, 3, P); pb.set(4, 5, [0, 0, 0], 0); L(6, 7, 13, 14, P[2], 2); L(11, 12, 13, 10, P[2]); break;
    case 'masque': S(8, 8, 6, ramp(['#b8b0a0', '#d8d0c0', '#f0ece0']), { sq: 1.15 }); R(5, 6, 6, 7, [10, 10, 10]); R(10, 6, 11, 7, [10, 10, 10]); L(6, 11, 10, 11, [60, 30, 30]); pb.set(9, 13, [120, 20, 20]); break;
    case 'livre': R(3, 2, 12, 14, (x, y) => rampPick(P, 0.8 - (x - 3) * 0.04, x, y)); R(4, 3, 4, 13, [230, 220, 200]); L(6, 5, 10, 5, [200, 180, 100]); break;
    case 'bougie': R(6, 5, 9, 14, [240, 232, 208]); L(7, 3, 7, 4, [60, 50, 40]); S(7.5, 2, 1.4, ramp(['#ff9030', '#ffd060'])); break;
    // ------------------------------------------------ objets ajoutés (pelle, alchimie, reliques, piété)
    case 'pelle': L(10, 1, 14, 1, wood[3], 1); L(12, 1, 7, 10, wood[2], 2); fillPoly(pb, [[3, 9], [9, 9], [8, 15], [4, 15], [2, 12]], steel, (x, y) => 0.95 - (y - 9) * 0.05 - (x - 2) * 0.02); L(3, 9, 9, 9, steel[3]); break;
    case 'carte': R(2, 3, 13, 12, (x, y) => rampPick(P, 0.85 - ((x + y) % 5 === 0 ? 0.08 : 0) - (x === 7 || x === 8 ? 0.12 : 0), x, y)); L(3, 10, 6, 7, [150, 110, 70]); L(6, 7, 11, 8, [150, 110, 70]); L(4, 5, 5, 4, [70, 110, 160]); L(9, 4, 11, 6, [200, 40, 30]); L(11, 4, 9, 6, [200, 40, 30]); break;
    case 'fiole': { const gl = ramp(['#8aa8b0', '#c8e0e8', '#f4fcff']); R(7, 1, 8, 2, [120, 90, 60]); R(7, 3, 8, 5, (x, y) => rampPick(gl, 0.8, x, y)); S(8, 10, 4.6, gl); S(8, 10.5, 3.6, P); pb.set(6, 8, [255, 255, 255]); pb.set(6, 9, [240, 250, 255]); break; }
    case 'tas': S(8, 12, 6, P, { sq: 0.55, noise: 0.35 }); S(6, 10, 3, P, { sq: 0.8, noise: 0.3 }); S(10, 10.5, 2.6, P, { sq: 0.8, noise: 0.3 }); break;
    case 'os': L(4, 12, 12, 4, P[2], 2); for (const [x, y] of [[3, 12], [4, 13.5], [12, 3], [13, 4.5]]) S(x, y, 1.6, P); break;
    case 'ver': for (let x = 2; x < 14; x++) { const y = Math.round(9 + Math.sin(x * 0.9) * 2.2); pb.set(x, y, rampPick(P, 0.8, x, y)); pb.set(x, y + 1, rampPick(P, 0.5, x, y)); } pb.set(13, Math.round(9 + Math.sin(13 * 0.9) * 2.2) - 1, [240, 190, 190]); break;
    case 'trefle': for (const [x, y] of [[6, 5], [10, 5], [5.5, 9.5], [10.5, 9.5]]) S(x, y, 2.9, P); L(8, 8, 9, 15, [60, 110, 50]); pb.set(8, 7, [120, 200, 110]); break;
    case 'lichen': S(8, 10, 6, PAL.rock, { sq: 0.7 }); for (const [x, y, r] of [[5, 8, 1.8], [9, 7, 2.2], [11, 10, 1.6], [7, 11, 1.4]]) S(x, y, r, P); break;
    case 'aile': fillPoly(pb, [[2, 4], [8, 7], [14, 3], [13, 10], [10, 8], [8, 13], [6, 8], [3, 10]], P, (x, y) => 0.6 + (y % 3 === 0 ? 0.15 : 0)); L(2, 4, 14, 3, C(P[0], 0.6)); break;
    case 'mue': for (let i = 0; i < 12; i++) { const x = 2 + i, y = Math.round(8 + Math.sin(i * 0.8) * 3); for (let k = -1; k <= 1; k++) pb.set(x, y + k, rampPick(P, 0.8 - Math.abs(k) * 0.2 + ((x + y) % 2 ? 0.08 : 0), x, y)); } break;
    case 'larme': fillPoly(pb, [[8, 1], [11, 8], [5, 8]], P, () => 0.85); S(8, 10, 4, P); pb.set(6, 9, [240, 250, 255]); pb.set(7, 8, [240, 250, 255]); break;
    case 'racine': S(8, 10, 3.6, P, { sq: 1.5 }); L(6, 13, 4, 15, P[1]); L(10, 13, 12, 15, P[1]); L(6, 9, 3, 11, P[1]); L(10, 9, 13, 11, P[1]); for (const a of [-1, 0, 1]) L(8, 5, 8 + a * 3, 1, '#4a8a3a', 1); pb.set(7, 9, [40, 20, 10]); pb.set(9, 9, [40, 20, 10]); L(7, 11, 9, 11, [60, 30, 20]); break;
    case 'sachet': R(5, 7, 11, 14, (x, y) => rampPick(P, 0.85 - (x - 5) * 0.05, x, y)); R(6, 5, 10, 6, (x, y) => rampPick(P, 0.7, x, y)); L(5, 7, 11, 7, [120, 90, 60]); break;
    case 'bois_cerf': L(8, 15, 8, 6, P[2], 2); L(8, 9, 3, 3, P[2], 1); L(8, 8, 13, 2, P[2], 1); L(5, 6, 3, 7, P[3]); L(11, 5, 14, 6, P[3]); L(8, 6, 8, 1, P[3]); break;
    case 'anneau': for (let a = 0; a < 40; a++) { const t = a / 40 * TAU; for (const r of [3.6, 4.4]) pb.set(8 + Math.cos(t) * r, 9 + Math.sin(t) * r, rampPick(P, 0.6 + Math.sin(t) * 0.3, a, 0)); } S(8, 4, 1.8, rampOf('#9ad0ff')); break;
    case 'calice': R(4, 2, 11, 3, P[2]); for (let y = 3; y < 8; y++) R(5 + (y > 5 ? y - 5 : 0), y, 10 - (y > 5 ? y - 5 : 0), y, (x) => rampPick(P, 0.9 - (x - 4) * 0.06, x, y)); L(8, 8, 8, 12, P[1], 2); R(5, 13, 11, 14, P[1]); pb.set(6, 3, P[3]); break;
    case 'tablette': R(3, 2, 12, 14, (x, y) => rampPick(PAL.rock, 0.8 - (x - 3) * 0.03, x, y)); for (const y of [4, 7, 10, 13]) for (let x = 5; x < 11; x += 2) pb.set(x, y, [60, 60, 64]); break;
    case 'sceau': S(8, 8, 6, P); S(8, 8, 4, rampOf('#8a5a20')); L(6, 6, 10, 10, P[3]); L(10, 6, 6, 10, P[3]); R(7, 1, 9, 2, P[1]); break;
    case 'croc': fillPoly(pb, [[5, 2], [11, 2], [9, 10], [7, 15], [6, 9]], P, (x) => 0.9 - (x - 5) * 0.05); L(5, 2, 11, 2, C(P[0], 0.7)); break;
    case 'medaillon': L(4, 1, 8, 5, [200, 180, 120]); L(12, 1, 8, 5, [200, 180, 120]); S(8, 10, 4.5, P); S(8, 10, 2.5, C(P[1], 0.8)); break;
    case 'croix': R(7, 1, 9, 15, (x, y) => rampPick(P, 0.8 - (x - 7) * 0.1, x, y)); R(3, 5, 13, 7, (x, y) => rampPick(P, 0.85 - (y - 5) * 0.1, x, y)); break;
    case 'lampe': R(6, 3, 10, 11, (x, y) => (x === 6 || x === 10 ? P[1] : [255, 210, 120])); R(5, 11, 11, 13, P[1]); R(7, 1, 9, 2, P[0]); S(8, 7, 1.5, rampOf('#fff0b0')); break;
    case 'fer': for (let a = 0; a < 30; a++) { const t = Math.PI + a / 29 * Math.PI; for (const r of [4, 5]) pb.set(8 + Math.cos(t) * r, 6 - Math.sin(t) * r, rampPick(P, 0.7, a, r)); } L(3, 6, 3, 11, P[2]); L(13, 6, 13, 11, P[2]); L(4, 6, 4, 11, P[1]); L(12, 6, 12, 11, P[1]); break;
    case 'poupee': S(8, 4, 2.6, P); R(6, 7, 10, 13, (x, y) => rampPick(P, 0.8 - (x - 6) * 0.06, x, y)); L(5, 8, 3, 11, P[1]); L(11, 8, 13, 11, P[1]); L(7, 14, 6, 15, P[1]); L(9, 14, 10, 15, P[1]); L(6, 9, 10, 9, [150, 60, 40]); break;
    case 'couronne': R(3, 8, 13, 11, (x, y) => rampPick(P, 0.85 - (y - 8) * 0.08, x, y)); for (const x of [3, 6, 9, 12]) L(x + 0.5, 8, x + 0.5, 3, P[2]); for (const x of [4.5, 10.5]) S(x, 3, 1.3, rampOf('#f0f0e8')); break;
    case 'chapelet': for (let a = 0; a < 12; a++) { const t = a / 12 * TAU; S(8 + Math.cos(t) * 4.5, 6 + Math.sin(t) * 4, 1.1, P); } L(8, 10, 8, 15, [200, 190, 170]); L(6, 12, 10, 12, [200, 190, 170]); break;
    default: S(8, 8, 5, P);
  }
  edgeDarken(pb, 0.85);
  return pb;
}

// ---------------------------------------------------------------- outils tenus en main (120 x 100)
const VM = {}; // id -> [PixelBuf, ...] (poses)
const VM_W = 120, VM_H = 100;
const SKIN_HAND = ramp(['#8a5a3c', '#a8704c', '#c4885e', '#d8a074', '#e8b88c']);
const SLEEVE = ramp(['#6a6258', '#8a8274', '#a8a090', '#c4bca8', '#dcd4c0']);
function vmArm(pb, gx, gy, left) {
  if (!left) fillPoly(pb, [[gx - 14, 100], [120, 100], [120, gy - 8], [gx + 10, gy - 14], [gx - 6, gy + 2]], SLEEVE, (x, y) => 0.85 - (x - gx) / 70 + (y - gy) * 0.004);
  else fillPoly(pb, [[0, 100], [gx + 14, 100], [gx + 6, gy + 2], [gx - 10, gy - 14], [0, gy - 8]], SLEEVE, (x, y) => 0.75 + (x - gx) / 90);
}
function vmFist(pb, gx, gy) {
  drawSphere(pb, gx, gy, 10, SKIN_HAND, 3, { sq: 0.9, noise: 0.08 });
  drawSphere(pb, gx - 7, gy - 3, 5.5, SKIN_HAND, 4, { sq: 1.1, noise: 0.08 });
  for (let k = 0; k < 3; k++) drawLine(pb, gx - 6 + k * 4, gy - 8, gx - 5 + k * 4, gy - 4, SKIN_HAND[1]);
}
function vmHandle(pb, gx, gy, ang, L, pal, w) {
  const dx = Math.sin(ang), dy = -Math.cos(ang);
  thickLine(pb, gx - dx * 12, gy - dy * 12, gx + dx * L, gy + dy * L, w || 5, pal || PAL.wood, 0.7);
  return { hx: gx + dx * L, hy: gy + dy * L, dx, dy, px: -dy, py: dx };
}
function vmTool(kind, swing, tcol) {
  const pb = new PixelBuf(VM_W, VM_H);
  const blade = rampOf(tcol || '#9aa2ac');
  const gx = 86, gy = 86;
  let ang = swing ? -1.25 : -0.3;
  if (kind === 'houe') ang = swing ? -1.05 : -0.45; // la houe s'abat vers le sol devant soi
  if (kind === 'faux') ang = swing ? -1.5 : -0.2;
  if (kind === 'pelle') ang = swing ? -0.05 : -0.35;
  vmArm(pb, gx, gy);
  const L = kind === 'faux' ? 80 : kind === 'marteau' ? 44 : 64;
  const h = vmHandle(pb, gx, gy, ang, L);
  const T = (a, b) => [h.hx + h.px * a + h.dx * b, h.hy + h.py * a + h.dy * b];
  // (h.px, h.py) : perpendiculaire au manche vers l'extérieur ; les fers sont du côté opposé (a < 0), vers le centre
  // de la vue, c'est-à-dire vers ce qu'on frappe : au coup, le tranchant mène (vers le bas)
  if (kind === 'hache') {
    fillPoly(pb, [T(2, -4), T(7, -3), T(7, 3), T(2, 4)], blade, () => 0.35); // talon du fer
    fillPoly(pb, [T(3, 4), T(3, -6), T(-13, -12), T(-17, -2), T(-13, 9)], blade, (x, y) => 0.55 - ((x - h.hx) * h.px + (y - h.hy) * h.py) * 0.025);
    for (let k = -10; k <= 7; k++) { const [x, y] = T(-15.5, k * 0.9); pb.set(Math.round(x), Math.round(y), blade[3]); }
  } else if (kind === 'pioche') { // fer en arc, les pointes tournées vers le manche
    fillPoly(pb, [T(-20, -7), T(-8, -3), T(0, -3), T(8, -3), T(20, -7), T(8, 1), T(0, 3), T(-8, 1)], blade, (x, y) => 0.6 - ((x - h.hx) * h.dx + (y - h.hy) * h.dy) * 0.05);
  } else if (kind === 'houe') { // lame perpendiculaire au manche, tournée vers le sol, un peu ramenée vers soi
    fillPoly(pb, [T(3, -3), T(3, 3), T(-3, 3), T(-3, -3)], blade, () => 0.4); // douille
    fillPoly(pb, [T(-2, 3), T(-2, -3), T(-15, -7), T(-16, 2)], blade, (x, y) => 0.5 - ((x - h.hx) * h.px + (y - h.hy) * h.py) * 0.02);
    for (let k = 0; k <= 9; k++) { const [x, y] = T(-15.6 + k * 0.1, -6.8 + k); pb.set(Math.round(x), Math.round(y), blade[3]); } // tranchant
  } else if (kind === 'marteau') {
    fillPoly(pb, [T(-9, -4), T(9, -4), T(9, 6), T(-9, 6)], blade, (x, y) => 0.75 - ((x - h.hx) * h.px) * 0.03);
  } else if (kind === 'pelle') {
    // lame de pelle au bout du manche, poignée en T de l'autre côté
    fillPoly(pb, [T(-7, 0), T(7, 0), T(8, 12), T(4, 18), T(-4, 18), T(-8, 12)], blade, (x, y) => 0.8 - ((x - h.hx) * h.px + (y - h.hy) * h.py) * 0.02);
    for (let k = -6; k <= 6; k++) { const [x, y] = T(k, 0); pb.set(Math.round(x), Math.round(y), blade[3]); }
  } else if (kind === 'faux') { // lame dont la pointe revient vers le manche, tranchant du côté creux
    for (let i = 0; i < 44; i++) { const [x, y] = T(-2 - i, 2 - i * i * 0.011), wm = Math.ceil(4 - i / 14); for (let w = 0; w < wm; w++) pb.set(Math.round(x), Math.round(y + w), blade[w === wm - 1 ? 3 : 2]); }
  }
  vmFist(pb, gx, gy);
  edgeDarken(pb, 0.8);
  return pb;
}
function vmCan(tilt) {
  const pb = new PixelBuf(VM_W, VM_H), steel = ramp(['#3c4a44', '#56665e', '#72847a', '#96a89e', '#c0d0c4']);
  vmArm(pb, 88, 88);
  const cx = 64, cy = 66 + tilt * 6, a = tilt ? -0.5 : 0;
  const rot = (x, y) => [cx + (x * Math.cos(a) - y * Math.sin(a)), cy + (x * Math.sin(a) + y * Math.cos(a))];
  fillPoly(pb, [rot(-18, -14), rot(14, -14), rot(16, 16), rot(-20, 16)], steel, (x) => 0.9 - (x - 44) * 0.012);
  const sp = [rot(-18, 4), rot(-44, -18), rot(-46, -14), rot(-18, 10)];
  fillPoly(pb, sp, steel, () => 0.55);
  drawLine(pb, ...rot(-4, -14).map(Math.round), ...rot(10, -26).map(Math.round), steel[1], 3);
  drawLine(pb, ...rot(10, -26).map(Math.round), ...rot(18, -8).map(Math.round), steel[1], 3);
  if (tilt) for (let k = 0; k < 14; k++) { const [x, y] = rot(-46 - k * 0.6, -16 + k * 2.2); pb.set(Math.round(x + (k % 3)), Math.round(y), [140, 190, 230], 200); }
  vmFist(pb, 88, 84);
  edgeDarken(pb, 0.8);
  return pb;
}
function vmRod(cast) {
  const pb = new PixelBuf(VM_W, VM_H);
  vmArm(pb, 86, 88);
  const h = vmHandle(pb, 86, 88, cast ? -0.15 : -0.6, 95, PAL.wood, 3);
  drawLine(pb, 78, 80, 70, 72, [60, 60, 66], 3);
  if (!cast) drawLine(pb, Math.round(h.hx), Math.round(h.hy), Math.round(h.hx), Math.round(h.hy + 30), [210, 210, 210]);
  vmFist(pb, 86, 86);
  edgeDarken(pb, 0.8);
  return pb;
}
function vmBow(draw) {
  const pb = new PixelBuf(VM_W, VM_H), wood = ramp(['#4a2c16', '#6a4222', '#8a5a30', '#a8743e']);
  const bx = 48, top = 6, bot = 96;
  const bend = 10 + draw * 6;
  for (let y = top; y <= bot; y++) { const t = (y - top) / (bot - top); const x = bx - Math.sin(t * Math.PI) * bend; for (let w = 0; w < 4; w++) pb.set(Math.round(x + w), y, wood[1 + (w > 1 ? 1 : 0)]); }
  const sx = bx + 3 + draw * 26;
  drawLine(pb, bx + 3, top, Math.round(sx), 52, [220, 220, 210]); drawLine(pb, bx + 3, bot, Math.round(sx), 52, [220, 220, 210]);
  if (draw > 0) {
    drawLine(pb, Math.round(sx), 52, 18, 52, PAL.wood[2], 2);
    fillPoly(pb, [[12, 52], [20, 48], [20, 56]], ramp(['#59606a', '#7e8792', '#aeb6bf']), () => 0.7);
    for (let k = 0; k < 6; k++) { pb.set(Math.round(sx) - k, 50 - (k >> 1), [230, 230, 230]); pb.set(Math.round(sx) - k, 54 + (k >> 1), [200, 60, 50]); }
    drawSphere(pb, sx + 6, 54, 8, SKIN_HAND, 2, { sq: 0.9 });
    fillPoly(pb, [[sx + 4, 60], [VM_W, 70], [VM_W, 100], [sx + 20, 100]], SLEEVE, () => 0.7);
  }
  drawSphere(pb, bx + 2, 56, 7, SKIN_HAND, 5, { sq: 1.2 });
  fillPoly(pb, [[0, 72], [bx - 4, 56], [bx + 8, 64], [20, 100], [0, 100]], SLEEVE, () => 0.7);
  edgeDarken(pb, 0.8);
  return pb;
}
function vmShears(open) {
  const pb = new PixelBuf(VM_W, VM_H), steel = ramp(['#3c4148', '#59606a', '#7e8792', '#aeb6bf', '#d6dce2']);
  vmArm(pb, 86, 86);
  const a = open ? 0.25 : 0.05;
  for (const s of [-1, 1]) {
    const ang = -0.55 + s * a;
    const x1 = 86 + Math.sin(ang) * 58, y1 = 86 - Math.cos(ang) * 58;
    thickLine(pb, 86, 86, x1, y1, 4, steel, 0.8);
  }
  vmFist(pb, 86, 86);
  edgeDarken(pb, 0.8);
  return pb;
}
function vmBucket(full) {
  const pb = new PixelBuf(VM_W, VM_H);
  vmArm(pb, 90, 60);
  for (let y = 58; y < 96; y++) { const w = 20 - (y - 58) * 0.12; for (let x = Math.round(76 - w); x < 76 + w; x++) pb.set(x, y, y === 64 || y === 88 ? [70, 70, 76] : rampPick(PAL.wood, 0.85 - (x - 56) * 0.012, x, y)); }
  if (full) for (let x = 58; x < 94; x++) { pb.set(x, 58, [240, 240, 232]); pb.set(x, 59, [226, 226, 218]); }
  drawLine(pb, 56, 58, 90, 46, [90, 90, 96], 2); drawLine(pb, 96, 58, 90, 46, [90, 90, 96], 2);
  vmFist(pb, 90, 46);
  edgeDarken(pb, 0.8);
  return pb;
}
function vmLantern(lit) {
  const pb = new PixelBuf(VM_W, VM_H), iron = [60, 60, 66];
  fillPoly(pb, [[0, 100], [26, 100], [34, 70], [18, 62], [0, 74]], SLEEVE, () => 0.7);
  drawSphere(pb, 26, 64, 8, SKIN_HAND, 5, { sq: 0.9 });
  drawLine(pb, 26, 56, 26, 48, iron, 2);
  for (let y = 48; y < 88; y++) for (let x = 12; x < 40; x++) {
    const edge = x < 14 || x > 37 || y < 50 || y > 85 || x === 25;
    if (y < 50 && (x < 18 || x > 33)) continue;
    pb.set(x, y, edge ? iron : lit ? [255, 214, 130] : [70, 66, 60], edge ? 255 : lit ? EMISSIVE_A : 255);
  }
  if (lit) drawSphere(pb, 25, 70, 4, ramp(['#ff9a30', '#ffd070', '#fff4c0']), 2, { alpha: EMISSIVE_A });
  return pb;
}
function vmHand(grab) {
  const pb = new PixelBuf(VM_W, VM_H);
  const gx = grab ? 70 : 84, gy = grab ? 70 : 86;
  vmArm(pb, gx, gy);
  vmFist(pb, gx, gy);
  if (!grab) for (let k = 0; k < 4; k++) drawLine(pb, gx - 8 + k * 4, gy - 10, gx - 10 + k * 4, gy - 20, SKIN_HAND[2], 3);
  edgeDarken(pb, 0.8);
  return pb;
}
function vmDial() { // main tenant un cadran (montre / boussole) : le reste est dessiné à la volée
  const pb = new PixelBuf(VM_W, VM_H);
  vmArm(pb, 80, 90);
  drawSphere(pb, 70, 66, 22, ramp(['#6a5020', '#9a7a30', '#c8a048', '#e8c870']), 3);
  drawSphere(pb, 70, 66, 18, ramp(['#c8c0b0', '#e0dace', '#f2eee4', '#fbf8f0']), 4, { noise: 0.05 });
  drawSphere(pb, 84, 84, 9, SKIN_HAND, 5, { sq: 0.9 });
  drawSphere(pb, 58, 84, 7, SKIN_HAND, 6, { sq: 1.1 });
  return pb;
}
function vmHolding() { // main ouverte (objet dessiné par-dessus)
  const pb = new PixelBuf(VM_W, VM_H);
  vmArm(pb, 84, 90);
  drawSphere(pb, 82, 84, 11, SKIN_HAND, 8, { sq: 0.7 });
  for (let k = 0; k < 4; k++) drawLine(pb, 72 + k * 5, 80, 70 + k * 5, 74, SKIN_HAND[2], 3);
  return pb;
}

function buildViewModels() {
  for (const t of TIERS) {
    VM['hache_' + t] = [vmTool('hache', false, TIER_COL[t]), vmTool('hache', true, TIER_COL[t])];
    VM['pioche_' + t] = [vmTool('pioche', false, TIER_COL[t]), vmTool('pioche', true, TIER_COL[t])];
  }
  VM.houe = [vmTool('houe', false, '#8a8680'), vmTool('houe', true, '#8a8680')];
  VM.faux = [vmTool('faux', false, '#c8ccd4'), vmTool('faux', true, '#c8ccd4')];
  VM.pelle = [vmTool('pelle', false, '#8a8680'), vmTool('pelle', true, '#8a8680')];
  VM.marteau = [vmTool('marteau', false, '#7a7a80'), vmTool('marteau', true, '#7a7a80')];
  VM.arrosoir = [vmCan(0), vmCan(1)];
  VM.canne = [vmRod(false), vmRod(true)];
  VM.arc = [vmBow(0), vmBow(0.5), vmBow(1)];
  VM.cisailles = [vmShears(true), vmShears(false)];
  VM.seau = [vmBucket(false), vmBucket(true)];
  VM.lanterne = [vmLantern(false), vmLantern(true)];
  VM.main = [vmHand(false), vmHand(true)];
  VM.cadran = [vmDial()];
  VM.tenir = [vmHolding()];
}

function addFarmSprites(add) {
  add('deadtree0', spriteDeadTree(71)); add('deadtree1', spriteDeadTree(72));
  add('fern0', spriteFern(73)); add('heather0', spriteHeather(74)); add('herbs0', spriteHerbs(75));
  add('note', spriteNote());
  add('bones0', spriteBones());
  for (let k = 0; k < 4; k++) add('vein' + k, spriteVein(k));
  add('lily0', spriteLily());
  add('wisp', [spriteWisp(0), spriteWisp(1)]);
  for (const id in ITEMS) { const it = ITEMS[id]; add('it_' + id, iconPaint(it.ic[0], it.ic[1], it.ic[2])); }
  buildViewModels();
  add('vm_lantern', VM.lanterne);
}
