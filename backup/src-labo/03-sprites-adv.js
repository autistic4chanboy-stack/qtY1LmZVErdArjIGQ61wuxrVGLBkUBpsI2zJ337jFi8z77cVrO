// ============================================================================
//  SPRITES (AVENTURE) : le Rôdeur, outils en main, décor du laboratoire, icônes
// ============================================================================

const TINT_A = 180; // alpha spécial : pixel teinté par la couleur de la potion (fiole en main)
const MON = ramp(['#030304', '#09090c', '#111116', '#1b1b22', '#262630']);

function thickLine(pb, x0, y0, x1, y1, w, pal, v0) {
  const n = Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))) + 1;
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, px = -dy / L, py = dx / L;
  for (let i = 0; i <= n; i++) {
    const t = i / n, cx = x0 + dx * t, cy = y0 + dy * t;
    for (let k = -w / 2; k <= w / 2; k += 0.5) {
      const x = Math.round(cx + px * k), y = Math.round(cy + py * k);
      pb.set(x, y, rampPick(pal, v0 - (k / w) * 0.6, x, y));
    }
  }
}

// Le Rôdeur : silhouette très haute et décharnée, yeux luisants
function monsterFrame(view, frame, attack) {
  const pb = new PixelBuf(28, 66), G = 65, cx = 14, eye = [228, 240, 255];
  const limb = (pts, w) => { for (let i = 0; i + 1 < pts.length; i++) thickLine(pb, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], w, MON, 0.45); };
  const claws = (x, y, dir) => { for (let k = -1; k <= 1; k++) drawLine(pb, x + k, y, x + k * 1.5, y + 4 * dir, MON[3]); };
  if (view === 'side') {
    const s = frame ? 3 : -2;
    limb([[cx - 1, 40], [cx + 2 - s * 0.5, 52], [cx - 2 - s, G]], 2);
    limb([[cx, 40], [cx + 3 + s * 0.5, 52], [cx + s, G]], 2.5);
    limb([[cx, 41], [cx + 2, 30], [cx + 5, 19]], 5);
    for (let k = 0; k < 4; k++) pb.set(cx + 1 + k, 23 + k * 3, MON[3]);
    drawSphere(pb, cx + 8, 13, 3.8, MON, 3, { sq: 0.8 });
    pb.set(cx + 10, 12, eye, EMISSIVE_A); pb.set(cx + 9, 12, [150, 170, 190], EMISSIVE_A);
    if (attack) for (let y = 14; y < 17; y++) pb.set(cx + 10, y, [200, 30, 30], EMISSIVE_A);
    const hy = attack ? 8 : 44 + (frame ? -3 : 2);
    limb([[cx + 5, 20], [cx + 9, 32], [cx + 10 + (frame ? 3 : -1), hy]], 1.5);
    claws(cx + 10 + (frame ? 3 : -1), hy, attack ? -1 : 1);
  } else {
    const back = view === 'back', l = frame ? 2 : 0;
    limb([[cx - 2, 40], [cx - 4, 52], [cx - 4, G - l]], 2.5);
    limb([[cx + 2, 40], [cx + 4, 52], [cx + 4, G - (2 - l)]], 2.5);
    fillPoly(pb, [[cx - 6, 18], [cx + 6, 18], [cx + 2.5, 41], [cx - 2.5, 41]], MON, (x) => 0.55 - (x - cx) * 0.03);
    if (!back) for (const y of [24, 27, 30]) for (let x = cx - 3; x <= cx + 3; x++) pb.set(x, y, MON[3]);
    else for (let y = 19; y < 40; y += 2) pb.set(cx, y, MON[4]);
    for (const s of [-1, 1]) {
      const hx = cx + s * (attack ? 13 : 8), hy = attack ? 3 : 50 - (s > 0 ? l : 2 - l);
      limb([[cx + s * 6, 19], [cx + s * (attack ? 11 : 9), attack ? 12 : 34], [hx, hy]], 1.5);
      claws(hx, hy, attack ? -1 : 1);
    }
    for (let y = 14; y < 19; y++) { pb.set(cx - 1, y, MON[2]); pb.set(cx, y, MON[2]); }
    drawSphere(pb, cx - 0.5, 9, 4, MON, 4, { sq: 1.3 });
    if (!back) {
      pb.set(cx - 2, 9, eye, EMISSIVE_A); pb.set(cx + 1, 9, eye, EMISSIVE_A);
      pb.set(cx - 2, 10, [120, 140, 160], EMISSIVE_A); pb.set(cx + 1, 10, [120, 140, 160], EMISSIVE_A);
      if (attack) for (let y = 12; y < 16; y++) { pb.set(cx - 1, y, [200, 30, 30], EMISSIVE_A); pb.set(cx, y, [160, 20, 20], EMISSIVE_A); }
    }
  }
  return pb;
}

// Outil tenu en main (hache / pioche), 2 poses : repos et frappe
function vmTool(kind, swing) {
  const W = 120, H = 100, pb = new PixelBuf(W, H);
  const glove = ramp(['#0f0f10', '#1a1a1c', '#262628', '#343437', '#46464a']);
  const suit = ramp(['#6a2e08', '#90430c', '#b95a12', '#da781c', '#f29a34']);
  const steel = ramp(['#26292e', '#3c4148', '#59606a', '#7e8792', '#aeb6bf', '#d6dce2']);
  const gx = 86, gy = 88, ang = swing ? -1.2 : -0.28, L = 66;
  const dx = Math.sin(ang), dy = -Math.cos(ang), hx = gx + dx * L, hy = gy + dy * L;
  const px = -dy, py = dx; // perpendiculaire (vers la gauche du manche)
  fillPoly(pb, [[70, 100], [120, 100], [120, 72], [100, 70], [80, 82]], suit, (x, y) => 0.85 - (x - 70) / 60 + (y - 66) * 0.004);
  thickLine(pb, gx - dx * 12, gy - dy * 12, hx, hy, 5, PAL.wood, 0.7);
  const T = (a, b) => [hx + px * a + dx * b, hy + py * a + dy * b];
  if (kind === 'axe') {
    fillPoly(pb, [T(-3, 4), T(-3, -6), T(13, -12), T(17, -2), T(13, 9)], steel, (x, y) => 0.55 + ((x - hx) * px + (y - hy) * py) * 0.025);
    for (let k = -10; k <= 7; k++) { const [x, y] = T(15.5, k * 0.9); pb.set(Math.round(x), Math.round(y), steel[5]); }
  } else {
    fillPoly(pb, [T(-20, -1), T(-8, -4), T(0, -5), T(8, -4), T(20, -1), T(8, 1), T(0, 2), T(-8, 1)], steel, (x, y) => 0.6 - ((x - hx) * dx + (y - hy) * dy) * 0.05);
    const [ax, ay] = T(-20, -1), [bx, by] = T(20, -1);
    pb.set(Math.round(ax), Math.round(ay), steel[5]); pb.set(Math.round(bx), Math.round(by), steel[5]);
  }
  drawSphere(pb, gx, gy, 11, glove, 3, { sq: 0.9, noise: 0.08 });
  drawSphere(pb, gx - 7, gy - 3, 6, glove, 4, { sq: 1.1, noise: 0.08 });
  edgeDarken(pb, 0.78);
  return pb;
}

// Fiole en main : le liquide (alpha TINT_A) prend la couleur de la potion
function vmVial() {
  const W = 120, H = 100, pb = new PixelBuf(W, H);
  const glove = ramp(['#0f0f10', '#1a1a1c', '#262628', '#343437', '#46464a']);
  const suit = ramp(['#6a2e08', '#90430c', '#b95a12', '#da781c', '#f29a34']);
  fillPoly(pb, [[72, 100], [120, 100], [120, 74], [102, 72], [82, 84]], suit, (x, y) => 0.85 - (x - 70) / 60 + (y - 66) * 0.004);
  const cx = 72, cy = 66, r = 13;
  for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) {
    const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
    if (d > r) continue;
    if (d > r - 1.2) pb.set(x, y, [120, 140, 150]);
    else if (y > cy - 4) pb.set(x, y, C([235, 235, 235], 1 - (d / r) * 0.35 - (x - cx) * 0.012), TINT_A);
    else pb.set(x, y, [70, 90, 100], 150);
  }
  for (let y = cy - r - 12; y < cy - r + 1; y++) for (let x = cx - 4; x <= cx + 4; x++) pb.set(x, y, x === cx - 4 || x === cx + 4 ? [120, 140, 150] : [80, 100, 110], x === cx - 4 || x === cx + 4 ? 255 : 150);
  for (let y = cy - r - 17; y < cy - r - 11; y++) for (let x = cx - 5; x <= cx + 5; x++) pb.set(x, y, rampPick(PAL.wood, 0.7 - (x - cx) * 0.05, x, y));
  for (let k = 0; k < 6; k++) pb.set(cx - 7 + (k >> 1), cy - 6 + k, [250, 255, 255]);
  drawSphere(pb, 88, 88, 12, glove, 3, { sq: 0.9, noise: 0.08 });
  drawSphere(pb, 80, 80, 6, glove, 4, { sq: 1.2, noise: 0.08 });
  return pb;
}

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
function spriteBeacon(on) {
  const pb = new PixelBuf(8, 8);
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    const d = Math.hypot(x - 3.5, y - 3.5);
    if (d < (on ? 3.6 : 2.2)) pb.set(x, y, d < 1.5 ? [255, 220, 210] : [240, 40, 30], EMISSIVE_A);
  }
  return pb;
}
function spriteNote() {
  const pb = new PixelBuf(12, 16);
  for (let y = 7; y < 16; y++) pb.set(6, y, PAL.wood[2]);
  for (let y = 0; y < 9; y++) for (let x = 1; x < 11; x++) pb.set(x, y, y === 0 || x === 1 ? [240, 234, 214] : [222, 214, 190]);
  for (const y of [2, 4, 6]) for (let x = 3; x < 9; x++) if (hash2i(x, y, 4) > 0.3) pb.set(x, y, [70, 60, 60]);
  return pb;
}
function spriteNeon(on) {
  const pb = new PixelBuf(20, 6);
  for (let x = 0; x < 20; x++) { pb.set(x, 0, PAL.iron[2]); pb.set(x, 5, PAL.iron[1]); }
  for (let y = 1; y < 5; y++) for (let x = 0; x < 20; x++) {
    if (x === 0 || x === 19) pb.set(x, y, PAL.iron[1]);
    else if (on) pb.set(x, y, y < 3 ? [250, 255, 250] : [210, 235, 225], EMISSIVE_A);
    else pb.set(x, y, [70, 80, 82]);
  }
  return pb;
}
function spriteMonitor(on) {
  const pb = new PixelBuf(20, 18), case_ = ramp(['#8a8672', '#a6a189', '#bdb89f', '#d0cbb2']);
  for (let y = 0; y < 16; y++) for (let x = 0; x < 20; x++) pb.set(x, y, rampPick(case_, 0.6 - x * 0.015 - y * 0.01, x, y));
  for (let y = 2; y < 12; y++) for (let x = 2; x < 18; x++) {
    if (!on) { pb.set(x, y, [20, 26, 22]); continue; }
    const txt = (y % 2 === 0) && hash2i(x, y, 3) > 0.35 && x < 6 + ((y * 7) % 11);
    pb.set(x, y, txt ? [140, 255, 150] : [18, 60, 26], EMISSIVE_A);
  }
  for (let x = 6; x < 14; x++) { pb.set(x, 16, case_[1]); pb.set(x, 17, case_[0]); }
  return pb;
}
function spriteAlembic(frame) {
  const pb = new PixelBuf(24, 28), glassC = [150, 190, 200];
  for (let x = 2; x < 22; x++) { pb.set(x, 26, PAL.iron[2]); pb.set(x, 27, PAL.iron[1]); }
  for (let y = 12; y < 26; y++) { pb.set(4, y, PAL.iron[1]); pb.set(19, y, PAL.iron[1]); }
  const liquid = [[8, 18, 5, [120, 255, 120]], [17, 20, 3.5, [200, 90, 255]]];
  for (const [cx, cy, r, col] of liquid) for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) {
    const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
    if (d > r) continue;
    if (d > r - 1) pb.set(x, y, glassC);
    else if (y > cy - 1) pb.set(x, y, hash2i(x, y + frame * 7, 3) > 0.85 ? [255, 255, 255] : col, EMISSIVE_A);
  }
  drawLine(pb, 8, 12, 8, 4, glassC); drawLine(pb, 8, 4, 16, 10, glassC); drawLine(pb, 16, 10, 17, 16, glassC);
  pb.set(12, 1 + frame, [220, 255, 220], EMISSIVE_A);
  return pb;
}
function spriteVialShelf(seed) {
  const pb = new PixelBuf(32, 36), rnd = mulberry32(seed);
  for (let y = 0; y < 36; y++) { pb.set(0, y, PAL.wood[1]); pb.set(31, y, PAL.wood[0]); }
  for (const sy of [11, 23, 35]) for (let x = 0; x < 32; x++) { pb.set(x, sy, PAL.wood[2]); pb.set(x, sy - 1, PAL.wood[3]); }
  const cols = [[220, 60, 60], [80, 200, 90], [70, 130, 240], [240, 200, 60], [190, 90, 230], [80, 220, 220], [240, 140, 50]];
  for (const base of [9, 21, 33]) for (let x = 2; x < 30; x += 4) {
    if (rnd() < 0.15) continue;
    const c = cols[(rnd() * cols.length) | 0], h = 4 + ((rnd() * 4) | 0);
    for (let y = base - h; y < base; y++) { pb.set(x, y, y < base - h + 2 ? [170, 190, 200] : c, y < base - h + 2 ? 255 : EMISSIVE_A); pb.set(x + 1, y, y < base - h + 2 ? [140, 160, 170] : C(c, 0.75), y < base - h + 2 ? 255 : EMISSIVE_A); }
  }
  return pb;
}
function spritePanel(on) {
  const pb = new PixelBuf(20, 20), metal = ramp(['#262a30', '#343a42', '#454d57', '#58626e']);
  for (let y = 0; y < 20; y++) for (let x = 0; x < 20; x++) pb.set(x, y, rampPick(metal, 0.6 - x * 0.01 - y * 0.015, x, y));
  for (const [cx, cy] of [[6, 6], [14, 6]]) for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++) if (Math.hypot(x, y) < 3.2) pb.set(cx + x, cy + y, Math.hypot(x, y) > 2.4 ? [20, 20, 20] : [226, 222, 200]);
  pb.set(6, 5, [200, 30, 30]); pb.set(15, 6, [200, 30, 30]);
  for (let k = 0; k < 4; k++) pb.set(4 + k * 4, 14, on ? (k < 3 ? [90, 255, 90] : [255, 200, 60]) : [60, 20, 20], on ? EMISSIVE_A : 255);
  return pb;
}
function spriteOrb(frame) {
  const pb = new PixelBuf(8, 8);
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    const d = Math.hypot(x - 3.5, y - 3.5);
    if (d < 3.4 - frame * 0.4) pb.set(x, y, d < 1.4 ? [255, 255, 255] : [210, 240, 255], EMISSIVE_A);
  }
  return pb;
}
function spriteBones() {
  const pb = new PixelBuf(24, 10), bone = ramp(['#8a8272', '#b2aa98', '#d6cfbd', '#ebe6d8']);
  drawSphere(pb, 5, 6, 3.4, bone, 1, { sq: 0.9 });
  pb.set(4, 6, [30, 26, 22]); pb.set(6, 6, [30, 26, 22]);
  for (let k = 0; k < 4; k++) drawLine(pb, 10, 5 + k, 22, 3 + k * 1.5, bone[2 - (k % 2)]);
  return pb;
}
function spriteMissing() {
  const pb = new PixelBuf(16, 16);
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) pb.set(x, y, ((x >> 3) + (y >> 3)) % 2 ? [255, 0, 220] : [0, 0, 0], EMISSIVE_A);
  return pb;
}

// ---------------------------------------------------------------- icônes d'objets (ramassables, inventaire)
function iconSprite(kind) {
  const pb = new PixelBuf(16, 16), rnd = mulberry32(kind.length * 31);
  switch (kind) {
    case 'bois':
      for (let y = 5; y < 13; y++) for (let x = 1; x < 13; x++) pb.set(x, y, rampPick(PAL.bark, 0.7 - (y - 5) * 0.07 + (hash2i(x >> 1, y, 2) - 0.5) * 0.3, x, y));
      drawSphere(pb, 13, 9, 4, ramp(['#8e6c42', '#b08a58', '#caa570']), 3);
      pb.set(13, 9, [120, 90, 60]); break;
    case 'pierre': drawSphere(pb, 8, 9, 6, PAL.rock, 4, { sq: 0.8, flatBottom: 0.7 }); break;
    case 'minerai':
      drawSphere(pb, 8, 9, 6, PAL.rock, 5, { sq: 0.85, flatBottom: 0.7 });
      for (let k = 0; k < 7; k++) pb.set((4 + rnd() * 8) | 0, (6 + rnd() * 6) | 0, [250, 206, 80]); break;
    case 'cristal':
      fillPoly(pb, [[8, 1], [12, 8], [8, 15], [4, 8]], ramp(['#3070c0', '#50b0e0', '#a0f0ff']), (x) => 0.9 - (x - 4) * 0.08); break;
    case 'viande':
      drawSphere(pb, 8, 9, 6, ramp(['#6a1414', '#9a2020', '#c83a34', '#e06a5a']), 6, { sq: 0.75 });
      for (let x = 11; x < 16; x++) pb.set(x, 6, [236, 230, 214]); pb.set(15, 5, [236, 230, 214]); break;
    case 'cuir':
      fillPoly(pb, [[2, 4], [14, 3], [15, 12], [9, 14], [1, 12]], ramp(['#5a3a1e', '#7a5028', '#946434']), () => 0.6); break;
    case 'fleur':
      for (const [x, c] of [[4, [220, 50, 40]], [8, [245, 210, 60]], [12, [240, 240, 232]]]) { drawLine(pb, x, 6, 8, 15, PAL.stem[2]); drawSphere(pb, x, 5, 2.2, ramp([rgbToHex(C(c, 0.7)), rgbToHex(c)]), x); } break;
    case 'champignon': drawLine(pb, 8, 7, 8, 15, [226, 220, 204], 3); drawSphere(pb, 8.5, 7, 6, ramp(['#7a1410', '#b8261c', '#e24a34']), 3, { sq: 0.6, flatBottom: 0.2 }); pb.set(6, 5, [250, 245, 235]); pb.set(10, 4, [250, 245, 235]); break;
    case 'residu':
      for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const d = Math.hypot(x - 8, (y - 9) * 1.3) + (hash2i(x, y, 3) - 0.5) * 2; if (d < 6) pb.set(x, y, d < 3 ? [230, 140, 255] : [120, 40, 170], EMISSIVE_A); } break;
    case 'munitions':
      for (let y = 7; y < 15; y++) for (let x = 2; x < 14; x++) pb.set(x, y, y === 7 ? [120, 110, 70] : [80, 72, 44]);
      for (let k = 0; k < 3; k++) for (let y = 2; y < 8; y++) pb.set(4 + k * 4, y, y < 4 ? [200, 150, 60] : [180, 170, 120]); break;
    case 'eau':
      for (let y = 3; y < 15; y++) for (let x = 5; x < 11; x++) pb.set(x, y, y < 6 ? [180, 200, 210] : [120, 170, 230], y < 6 ? 255 : TINT_A); break;
  }
  return pb;
}
const ICON_KINDS = ['bois', 'pierre', 'minerai', 'cristal', 'viande', 'cuir', 'fleur', 'champignon', 'residu', 'munitions', 'eau'];

function addAdventureSprites(add) {
  add('monster', ['side', 'front', 'back'].flatMap((v) => [monsterFrame(v, 0), monsterFrame(v, 1)]).concat([monsterFrame('front', 0, true)]));
  add('vm_axe', [vmTool('axe', false), vmTool('axe', true)]);
  add('vm_pick', [vmTool('pick', false), vmTool('pick', true)]);
  add('vm_vial', vmVial());
  add('deadtree0', spriteDeadTree(71)); add('deadtree1', spriteDeadTree(72));
  add('fern0', spriteFern(73)); add('heather0', spriteHeather(74));
  add('beacon', [spriteBeacon(false), spriteBeacon(true)]);
  add('note', spriteNote());
  add('neon', [spriteNeon(false), spriteNeon(true)]);
  add('monitor', [spriteMonitor(false), spriteMonitor(true)]);
  add('alembic', [spriteAlembic(0), spriteAlembic(1)]);
  add('vialshelf0', spriteVialShelf(75)); add('vialshelf1', spriteVialShelf(76));
  add('panel', [spritePanel(false), spritePanel(true)]);
  add('orb', [spriteOrb(0), spriteOrb(1)]);
  add('bones0', spriteBones());
  add('missing', spriteMissing());
  for (const k of ICON_KINDS) add('it_' + k, iconSprite(k));
}
