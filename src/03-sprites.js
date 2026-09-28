// ============================================================================
//  SPRITES PROCÉDURAUX (style Doom : billboards pixelisés) + ATLAS
// ============================================================================

const PX_PER_M = 16;
const EMISSIVE_A = 200; // alpha spécial : pixel lumineux (ignore l'éclairage)
const SPR_L = v3.norm([-0.5, -0.62, 0.6]);

// Feuillage : union de sphères, ombrage + tramage + bord irrégulier
function drawCanopy(pb, blobs, pal, seed, o = {}) {
  let minY = 1e9, maxY = -1e9, minX = 1e9, maxX = -1e9;
  for (const b of blobs) {
    minY = Math.min(minY, b.y - b.r); maxY = Math.max(maxY, b.y + b.r);
    minX = Math.min(minX, b.x - b.r); maxX = Math.max(maxX, b.x + b.r);
  }
  const noise = o.noise ?? 0.32, bottomDark = o.bottomDark ?? 0.32, holes = o.holes ?? 1;
  for (let y = Math.max(0, minY | 0); y <= Math.min(pb.h - 1, maxY | 0); y++) {
    for (let x = Math.max(0, minX | 0); x <= Math.min(pb.w - 1, maxX | 0); x++) {
      let best = -1e9, n = null;
      for (const b of blobs) {
        const dx = x + 0.5 - b.x, dy = (y + 0.5 - b.y) / (b.sq || 1), r2 = b.r * b.r, d2 = dx * dx + dy * dy;
        if (d2 < r2) {
          const z = Math.sqrt(r2 - d2) + (b.z || 0);
          if (z > best) { best = z; n = [dx / b.r, dy / b.r, Math.sqrt(1 - d2 / r2)]; }
        }
      }
      if (!n) continue;
      const edge = 1 - n[2];
      const h = hash2i(x >> 1, y >> 1, seed);
      if (edge > 0.7 && h < (edge - 0.7) * 2.6 * holes) continue;
      let v = (n[0] * SPR_L[0] + n[1] * SPR_L[1] + n[2] * SPR_L[2]) * 0.55 + 0.42;
      v += (hash2i(x, y, seed + 1) - 0.5) * noise + (h - 0.5) * 0.22;
      v -= ((y - minY) / (maxY - minY)) * bottomDark;
      pb.set(x, y, rampPick(pal, v, x, y));
    }
  }
}

// Tronc effilé avec ombrage cylindrique
function drawTrunk(pb, cx0, y0, cx1, y1, w0, w1, pal, seed, marks) {
  for (let y = y0; y <= y1; y++) {
    const t = (y - y0) / Math.max(1, y1 - y0);
    const cx = lerp(cx0, cx1, t), hw = lerp(w0, w1, t) / 2;
    for (let x = Math.floor(cx - hw); x <= Math.ceil(cx + hw); x++) {
      const u = (x + 0.5 - cx) / hw;
      if (Math.abs(u) > 1) continue;
      let v = 0.62 - u * 0.38 + Math.sqrt(1 - u * u) * 0.12 + (hash2i(x, y >> 1, seed) - 0.5) * 0.3;
      let c = rampPick(pal, v, x, y);
      if (marks && hash2i(x >> 1, y >> 1, seed + 9) > 0.86) c = [34, 32, 30];
      pb.set(x, y, c);
    }
  }
}

function drawLine(pb, x0, y0, x1, y1, c, w = 1) {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= n; i++) {
    const x = lerp(x0, x1, i / n), y = lerp(y0, y1, i / n);
    for (let k = 0; k < w; k++) pb.set(Math.round(x) + k, Math.round(y), c);
  }
}

function drawSphere(pb, cx, cy, r, pal, seed, o = {}) {
  const sq = o.sq || 1;
  for (let y = Math.floor(cy - r * sq); y <= Math.ceil(cy + r * sq); y++) {
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      const dx = (x + 0.5 - cx) / r, dy = (y + 0.5 - cy) / (r * sq), d2 = dx * dx + dy * dy;
      if (d2 > 1) continue;
      if (o.flatBottom && y > cy + r * sq * o.flatBottom) continue;
      const nz = Math.sqrt(1 - d2);
      let v = (dx * SPR_L[0] + dy * SPR_L[1] + nz * SPR_L[2]) * 0.55 + 0.45 + (hash2i(x, y, seed) - 0.5) * (o.noise || 0.15);
      let c = rampPick(pal, v, x, y);
      if (o.moss && dy < -0.35 && hash2i(x >> 1, y, seed + 3) > 0.35) c = rampPick(o.moss, v, x, y);
      pb.set(x, y, c, o.alpha || 255);
    }
  }
}

// Assombrit légèrement les pixels du contour (lisibilité)
function edgeDarken(pb, k = 0.72) {
  const mark = [];
  for (let y = 0; y < pb.h; y++) for (let x = 0; x < pb.w; x++) {
    if (pb.alpha(x, y) !== 255) continue;
    if (!pb.alpha(x - 1, y) || !pb.alpha(x + 1, y) || !pb.alpha(x, y + 1)) mark.push(x, y);
  }
  for (let i = 0; i < mark.length; i += 2) pb.shade(mark[i], mark[i + 1], k);
}

const PAL = {
  oak: ramp(['#16300f', '#1f4115', '#2a531b', '#356623', '#437a2b', '#548f35', '#6aa442']),
  birch: ramp(['#284a17', '#35601e', '#437526', '#548a2f', '#679f3a', '#7eb447']),
  pine: ramp(['#0c2215', '#12301c', '#193f24', '#214f2d', '#2b6037', '#377241']),
  bark: ramp(['#2a1c11', '#3a2718', '#4c3420', '#5e4129', '#704f32']),
  birchBark: ramp(['#6f6b62', '#a09c90', '#c6c2b6', '#e2ded2', '#f2eee4']),
  bush: ramp(['#193d14', '#22501a', '#2d6321', '#3a7729', '#4a8b33', '#5e9f3f']),
  rock: ramp(['#393a3f', '#4a4c52', '#5c5f65', '#6f7278', '#83878c', '#9a9ea2']),
  moss: ramp(['#2c4a1c', '#3a5f24', '#4b742d']),
  stem: ramp(['#1d4414', '#2a5a1c', '#3a7226', '#4c8a31']),
  grass: ramp(['#1e4516', '#29591c', '#356e24', '#43842d', '#549a38', '#69ae46', '#82c257']),
  dry: ramp(['#4d4a1f', '#625d27', '#7a7231', '#91873c', '#a89c48', '#bdb057']),
  wood: ramp(['#3a2514', '#4d321b', '#614023', '#754f2c', '#8a6037']),
  iron: ramp(['#141619', '#23272c', '#343a41', '#4a525b']),
};

function spriteTree(kind, seed) {
  const rnd = mulberry32(seed);
  const j = (v) => v + (rnd() - 0.5) * 6;
  if (kind === 'pine') {
    const pb = new PixelBuf(72, 128), cx = 36;
    drawTrunk(pb, cx, 90, cx, 127, 6, 8, PAL.bark, seed);
    for (let k = 5; k >= 0; k--) {
      const ty0 = 4 + k * 17, ty1 = ty0 + 28, wb = 9 + k * 5.2;
      for (let y = ty0; y <= ty1; y++) {
        const t = (y - ty0) / (ty1 - ty0), hw = wb * Math.pow(t, 0.8) + 1;
        for (let x = Math.floor(cx - hw); x <= Math.ceil(cx + hw); x++) {
          const u = (x + 0.5 - cx) / hw;
          if (Math.abs(u) > 1) continue;
          if (t > 0.78 && hash2i(x >> 1, y, seed + k) < (t - 0.78) * 4.5) continue;
          let v = 0.6 - u * 0.32 + (1 - t) * 0.12 - t * 0.2 + (hash2i(x, y, seed) - 0.5) * 0.3;
          if (Math.abs(u) > 0.85) v -= 0.12;
          pb.set(x, y, rampPick(PAL.pine, v, x, y));
        }
      }
    }
    edgeDarken(pb);
    return pb;
  }
  if (kind === 'birch') {
    const pb = new PixelBuf(56, 128), cx = 28;
    drawTrunk(pb, cx + 1, 20, cx, 127, 3, 6, PAL.birchBark, seed, true);
    drawLine(pb, cx, 60, cx - 12, 44, PAL.birchBark[1], 1);
    drawLine(pb, cx + 1, 52, cx + 12, 36, PAL.birchBark[1], 1);
    const blobs = [];
    for (let i = 0; i < 75; i++) {
      const a = rnd() * TAU, u = Math.sqrt(rnd());
      blobs.push({ x: cx + Math.cos(a) * 16 * u, y: 42 + Math.sin(a) * 33 * u, r: 2.5 + rnd() * 3, z: (1 - u) * 6 });
    }
    drawCanopy(pb, blobs, PAL.birch, seed, { noise: 0.5, holes: 1.8, bottomDark: 0.3 });
    edgeDarken(pb, 0.78);
    return pb;
  }
  // chêne / pommier
  const pb = new PixelBuf(96, 128), cx = 48;
  drawTrunk(pb, cx, 58, cx, 122, 8, 12, PAL.bark, seed);
  for (let x = -9; x <= 9; x++) { // racines
    const h = Math.round(5 - Math.abs(x) * 0.5);
    for (let y = 0; y < h; y++) pb.set(cx + x, 127 - y, rampPick(PAL.bark, 0.35 - x * 0.03, cx + x, y));
  }
  drawLine(pb, cx - 1, 72, cx - 18, 52, PAL.bark[2], 2);
  drawLine(pb, cx + 1, 68, cx + 20, 50, PAL.bark[1], 2);
  const blobs = [
    { x: j(cx), y: j(52), r: 28 }, { x: j(cx - 20), y: j(58), r: 19 }, { x: j(cx + 20), y: j(58), r: 19 },
    { x: j(cx - 11), y: j(33), r: 21 }, { x: j(cx + 12), y: j(34), r: 20 }, { x: j(cx), y: j(22), r: 17, z: 4 },
    { x: j(cx - 28), y: j(46), r: 13 }, { x: j(cx + 28), y: j(46), r: 13 }, { x: j(cx - 6), y: j(44), r: 16, z: 10 },
  ];
  drawCanopy(pb, blobs, PAL.oak, seed);
  if (kind === 'apple') {
    for (let k = 0; k < 26; k++) {
      const a = rnd() * TAU, r = rnd() * 28, x = Math.round(cx + Math.cos(a) * r), y = Math.round(44 + Math.sin(a) * r * 0.8);
      if (pb.alpha(x, y) !== 255 || pb.alpha(x + 1, y + 1) !== 255) continue;
      pb.set(x, y, [226, 60, 40]); pb.set(x + 1, y, [190, 30, 26]);
      pb.set(x, y + 1, [170, 26, 22]); pb.set(x + 1, y + 1, [130, 20, 18]);
    }
  }
  edgeDarken(pb);
  return pb;
}

function spriteBush(seed, berries) {
  const pb = new PixelBuf(48, 32), rnd = mulberry32(seed);
  const blobs = [];
  for (let i = 0; i < 7; i++) blobs.push({ x: 8 + rnd() * 32, y: 16 + rnd() * 8, r: 8 + rnd() * 5 });
  blobs.push({ x: 24, y: 14, r: 11, z: 3 });
  drawCanopy(pb, blobs, PAL.bush, seed, { bottomDark: 0.45 });
  for (let y = 28; y < 32; y++) for (let x = 0; x < 48; x++) if (y > 29) pb.set(x, y, [0, 0, 0], 0);
  if (berries) {
    for (let k = 0; k < 22; k++) {
      const x = (4 + rnd() * 40) | 0, y = (6 + rnd() * 20) | 0;
      if (pb.alpha(x, y) === 255) { pb.set(x, y, berries[0]); pb.set(x + 1, y, berries[1]); }
    }
  }
  edgeDarken(pb);
  return pb;
}

function spriteRock(seed) {
  const pb = new PixelBuf(48, 34), rnd = mulberry32(seed);
  drawSphere(pb, 22 + rnd() * 4, 22, 19, PAL.rock, seed, { sq: 0.72, flatBottom: 0.72, moss: PAL.moss, noise: 0.22 });
  drawSphere(pb, 12 + rnd() * 4, 26, 9, PAL.rock, seed + 1, { sq: 0.8, flatBottom: 0.8, noise: 0.2 });
  for (let k = 0; k < 3; k++) { // fissures
    let x = 12 + rnd() * 24, y = 12 + rnd() * 10;
    for (let s = 0; s < 7; s++) { if (pb.alpha(x | 0, y | 0) === 255) pb.shade(x | 0, y | 0, 0.6); x += rnd() * 2 - 1; y += 1; }
  }
  edgeDarken(pb);
  return pb;
}

function spriteStones(seed) {
  const pb = new PixelBuf(32, 12), rnd = mulberry32(seed);
  for (let i = 0; i < 4; i++) drawSphere(pb, 5 + rnd() * 22, 8, 3 + rnd() * 3, PAL.rock, seed + i, { sq: 0.7, flatBottom: 0.6 });
  edgeDarken(pb);
  return pb;
}

function spriteFlowers(seed, kind) {
  const w = 24, h = kind === 'sunflower' ? 40 : 20;
  const pb = new PixelBuf(kind === 'sunflower' ? 16 : w, h), rnd = mulberry32(seed);
  if (kind === 'sunflower') {
    drawLine(pb, 8, 12, 8, 39, PAL.stem[1], 2);
    for (const [ly, dir] of [[22, -1], [29, 1], [34, -1]]) {
      for (let i = 0; i < 5; i++) { pb.set(8 + dir * (2 + i), ly - (i > 2 ? 1 : 0), PAL.stem[2 + (i < 3 ? 1 : 0)]); pb.set(8 + dir * (2 + i), ly + 1, PAL.stem[1]); }
    }
    drawSphere(pb, 8, 8, 7, ramp(['#b58a10', '#d9a813', '#f2c81c', '#ffe04a']), seed, { noise: 0.3 });
    drawSphere(pb, 8, 8, 3.2, ramp(['#3a2210', '#553418', '#6e4620']), seed + 1);
    edgeDarken(pb, 0.8);
    return pb;
  }
  const n = kind === 'lavender' ? 9 : 7;
  for (let i = 0; i < n; i++) {
    const x = 2 + rnd() * (w - 4), top = 3 + rnd() * 8;
    drawLine(pb, x, top, x + (rnd() - 0.5) * 3, h - 1, PAL.stem[1 + ((rnd() * 2) | 0)]);
    const X = Math.round(x), T = Math.round(top);
    if (kind === 'poppies') {
      pb.set(X, T, [120, 16, 16]); pb.set(X - 1, T, [214, 40, 30]); pb.set(X + 1, T, [230, 58, 40]);
      pb.set(X, T - 1, [240, 72, 50]); pb.set(X - 1, T - 1, [200, 34, 26]); pb.set(X + 1, T - 1, [214, 44, 32]);
    } else if (kind === 'daisies') {
      pb.set(X, T, [242, 196, 40]);
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1]]) pb.set(X + dx, T + dy, [244, 244, 236]);
    } else if (kind === 'lavender') {
      for (let k = 0; k < 5; k++) pb.set(X + (k % 2), T + k, k < 2 ? [178, 140, 230] : [128, 88, 196]);
    } else {
      pb.set(X, T, [80, 120, 230]); pb.set(X - 1, T, [60, 90, 200]); pb.set(X + 1, T, [110, 150, 240]); pb.set(X, T - 1, [130, 170, 250]);
    }
  }
  for (let x = 0; x < w; x++) if (rnd() < 0.7) pb.set(x, h - 1, PAL.stem[(rnd() * 3) | 0]);
  return pb;
}

function spriteGrassClump(seed, w, h, pal, blades, seedHeads) {
  const pb = new PixelBuf(w, h), rnd = mulberry32(seed);
  for (let i = 0; i < blades; i++) {
    const x0 = w * 0.2 + rnd() * w * 0.6, len = h * (0.45 + rnd() * 0.55), lean = (rnd() - 0.5) * w * 0.7;
    const steps = Math.ceil(len);
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const x = Math.round(x0 + lean * t * t), y = h - 1 - s;
      pb.set(x, y, rampPick(pal, 0.15 + t * 0.8 + (rnd() - 0.5) * 0.2, x, y));
    }
    if (seedHeads && rnd() < 0.4) {
      const x = Math.round(x0 + lean), y = Math.round(h - 1 - len);
      for (let k = 0; k < 3; k++) pb.set(x, y - k, [190, 170, 110]);
    }
  }
  return pb;
}

function spriteTinyFlower(petal, center, seed) {
  const pb = new PixelBuf(8, 12);
  drawLine(pb, 4, 4, 4, 11, PAL.stem[1]);
  pb.set(3, 8, PAL.stem[2]); pb.set(5, 9, PAL.stem[2]);
  pb.set(4, 3, center);
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) pb.set(4 + dx, 3 + dy, petal);
  pb.set(3, 2, petal.map((v) => v * 0.8)); pb.set(5, 4, petal.map((v) => v * 0.8));
  return pb;
}

function spriteReeds(seed) {
  const pb = new PixelBuf(24, 36), rnd = mulberry32(seed);
  for (let i = 0; i < 9; i++) {
    const x = 3 + rnd() * 18, top = 2 + rnd() * 14, lean = (rnd() - 0.5) * 4;
    drawLine(pb, x + lean, top, x, 35, PAL.stem[(rnd() * 4) | 0]);
    if (rnd() < 0.5) for (let k = 0; k < 5; k++) { pb.set(Math.round(x + lean), Math.round(top) + 2 + k, k === 0 ? [110, 72, 40] : [84, 52, 28]); pb.set(Math.round(x + lean) + 1, Math.round(top) + 3 + k, [70, 42, 22]); }
  }
  return pb;
}

function spriteMushrooms(seed) {
  const pb = new PixelBuf(16, 12), rnd = mulberry32(seed);
  for (const [cx, cy, r] of [[5, 6, 3.6], [11, 7, 2.8]]) {
    drawLine(pb, cx, cy, cx, 11, [226, 220, 204], 2);
    drawSphere(pb, cx + 0.5, cy, r, ramp(['#7a1410', '#a81d16', '#d02a1e', '#ea4a34']), seed, { sq: 0.7, flatBottom: 0.2 });
    for (let k = 0; k < 3; k++) pb.set(Math.round(cx - r / 2 + rnd() * r), Math.round(cy - 1 - rnd() * 1.5), [245, 240, 230]);
  }
  return pb;
}

function spriteStump(seed) {
  const pb = new PixelBuf(24, 16);
  drawTrunk(pb, 12, 4, 12, 15, 14, 18, PAL.bark, seed);
  const top = ramp(['#8a6a42', '#a27e52', '#b99464', '#cfaa78']);
  for (let y = 1; y < 8; y++) for (let x = 3; x < 22; x++) {
    const dx = (x - 12) / 8.5, dy = (y - 4) / 3;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d > 1) continue;
    pb.set(x, y, d > 0.85 ? PAL.bark[1] : rampPick(top, 0.9 - (Math.floor(d * 4) % 2) * 0.35, x, y));
  }
  edgeDarken(pb);
  return pb;
}

function spriteLamp(on) {
  const pb = new PixelBuf(16, 72);
  for (let y = 16; y < 72; y++) for (let x = 7; x < 10; x++) pb.set(x, y, rampPick(PAL.iron, 0.9 - (x - 7) * 0.35, x, y));
  for (let y = 64; y < 72; y++) for (let x = 5; x < 12; x++) pb.set(x, y, rampPick(PAL.iron, 0.75 - (x - 5) * 0.1, x, y));
  for (let x = 4; x < 13; x++) { pb.set(x, 3, PAL.iron[2]); pb.set(x, 4, PAL.iron[1]); pb.set(x, 15, PAL.iron[1]); }
  pb.set(8, 1, PAL.iron[1]); pb.set(8, 2, PAL.iron[2]);
  for (let y = 5; y < 15; y++) {
    pb.set(4, y, PAL.iron[1]); pb.set(12, y, PAL.iron[0]); pb.set(8, y, PAL.iron[1]);
    for (let x = 5; x < 12; x++) {
      if (x === 8) continue;
      if (on) pb.set(x, y, y < 8 || x === 5 ? [255, 250, 210] : [255, 214, 120], EMISSIVE_A);
      else pb.set(x, y, rampPick(ramp(['#1c2630', '#2a3a48', '#3c5264']), 0.8 - (y - 5) / 12 - (x > 8 ? 0.2 : 0), x, y));
    }
  }
  return pb;
}

function spriteCampfire(frame) {
  const pb = new PixelBuf(32, 32), rnd = mulberry32(99 + frame * 13);
  // pierres
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI + 0.1;
    drawSphere(pb, 16 - Math.cos(a) * 13, 28 + Math.sin(a) * 1.5, 3.2, PAL.rock, i, { sq: 0.7, flatBottom: 0.5 });
  }
  drawLine(pb, 7, 29, 24, 24, PAL.wood[1], 2);
  drawLine(pb, 8, 24, 25, 29, PAL.wood[2], 2);
  drawLine(pb, 9, 27, 23, 27, PAL.wood[3], 1);
  const fire = ramp(['#8a1a08', '#c83a0c', '#ee6a12', '#ffa62a', '#ffd860', '#fff6c8']);
  for (let y = 4; y < 27; y++) for (let x = 6; x < 26; x++) {
    const dx = (x - 16) / 8, t = (27 - y) / 22;
    const wob = Math.sin(y * 0.7 + frame * 1.7) * 0.18 + (hash2i(x, y + frame * 31, 5) - 0.5) * 0.35;
    const width = (1 - t) * 1.05 + 0.05;
    const f = 1 - Math.abs(dx + wob * t) / width - t * 0.35;
    if (f <= 0) continue;
    if (t > 0.55 && hash2i(x, y, frame + 40) < t - 0.45) continue;
    pb.set(x, y, rampPick(fire, f * 1.1, x, y), EMISSIVE_A);
  }
  for (let k = 0; k < 4; k++) pb.set((10 + rnd() * 12) | 0, (1 + rnd() * 8) | 0, [255, 200, 90], EMISSIVE_A);
  return pb;
}

function spriteSign() {
  const pb = new PixelBuf(28, 32);
  for (let y = 10; y < 32; y++) for (let x = 12; x < 16; x++) pb.set(x, y, rampPick(PAL.wood, 0.8 - (x - 12) * 0.2, x, y));
  for (let y = 2; y < 16; y++) for (let x = 1; x < 27; x++) {
    let v = 0.55 + (hash2i(x >> 2, y, 3) - 0.5) * 0.3;
    if (y === 2 || x === 1) v += 0.25;
    if (y === 15 || x === 26) v -= 0.35;
    if (y % 5 === 1) v -= 0.18;
    pb.set(x, y, rampPick(PAL.wood, v, x, y));
  }
  const ink = [40, 26, 16];
  for (const [y, x0, x1] of [[6, 5, 22], [9, 5, 18], [12, 7, 21]]) for (let x = x0; x < x1; x++) if (hash2i(x, y, 1) > 0.25) pb.set(x, y, ink);
  edgeDarken(pb);
  return pb;
}

function spriteBarrel() {
  const pb = new PixelBuf(20, 26);
  for (let y = 0; y < 26; y++) {
    const bulge = Math.sin((y / 25) * Math.PI) * 1.6;
    const hw = 8 + bulge;
    for (let x = 0; x < 20; x++) {
      const u = (x + 0.5 - 10) / hw;
      if (Math.abs(u) > 1) continue;
      let v = 0.6 - u * 0.4 + Math.sqrt(1 - u * u) * 0.1;
      const band = y === 3 || y === 4 || y === 21 || y === 22 || y === 12;
      let c = band ? rampPick(PAL.iron, v + 0.1, x, y) : rampPick(PAL.wood, v + (x % 4 === 0 ? -0.2 : 0), x, y);
      pb.set(x, y, c);
    }
  }
  edgeDarken(pb);
  return pb;
}

// Polygone plein avec ombrage par pixel : shadeFn(x, y) -> [0,1]
function fillPoly(pb, pts, pal, shadeFn) {
  let minY = 1e9, maxY = -1e9;
  for (const p of pts) { minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); }
  for (let y = Math.max(0, Math.floor(minY)); y <= Math.min(pb.h - 1, Math.ceil(maxY)); y++) {
    const xs = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      const yy = y + 0.5;
      if ((a[1] <= yy && b[1] > yy) || (b[1] <= yy && a[1] > yy)) xs.push(a[0] + (yy - a[1]) / (b[1] - a[1]) * (b[0] - a[0]));
    }
    xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2)
      for (let x = Math.ceil(xs[k] - 0.5); x <= Math.floor(xs[k + 1] - 0.5); x++) pb.set(x, y, rampPick(pal, shadeFn(x, y), x, y));
  }
}

// Arme (vue à la première personne) : revolver « .357 » tenu par un gant noir, manche de combinaison orange
const ATLAS = { w: 1024, h: 1024, sprites: {}, canvas: null };

function buildSpriteAtlas() {
  const defs = [];
  const add = (id, frames, worldH, extra) => {
    const pbs = Array.isArray(frames) ? frames : [frames];
    defs.push({ id, pbs, fw: pbs[0].w, fh: pbs[0].h, worldH, ...extra });
  };
  add('oak0', spriteTree('oak', 101)); add('oak1', spriteTree('oak', 202));
  add('apple0', spriteTree('apple', 303));
  add('birch0', spriteTree('birch', 404)); add('birch1', spriteTree('birch', 505));
  add('pine0', spriteTree('pine', 606)); add('pine1', spriteTree('pine', 707));
  add('bush0', spriteBush(11)); add('bush1', spriteBush(12));
  add('berry0', spriteBush(13, [[40, 60, 170], [80, 100, 220]]));
  add('rock0', spriteRock(21)); add('rock1', spriteRock(22));
  add('stones0', spriteStones(31));
  add('poppies0', spriteFlowers(41, 'poppies')); add('daisies0', spriteFlowers(42, 'daisies'));
  add('lavender0', spriteFlowers(43, 'lavender')); add('cornflower0', spriteFlowers(44, 'cornflower'));
  add('sunflower0', spriteFlowers(45, 'sunflower'));
  add('tallgrass0', spriteGrassClump(51, 32, 24, PAL.grass, 22, true));
  add('reeds0', spriteReeds(52));
  add('mushroom0', spriteMushrooms(53));
  add('stump0', spriteStump(54));
  add('lamp', [spriteLamp(false), spriteLamp(true)]);
  add('campfire', [0, 1, 2, 3].map(spriteCampfire));
  add('sign0', spriteSign());
  add('barrel0', spriteBarrel());
  // touffes du champ d'herbe
  add('g_tuft0', spriteGrassClump(61, 16, 12, PAL.grass, 9));
  add('g_tuft1', spriteGrassClump(62, 16, 12, PAL.grass, 11));
  add('g_tuft2', spriteGrassClump(63, 12, 14, PAL.grass, 8));
  add('g_tall', spriteGrassClump(64, 14, 22, PAL.grass, 9, true));
  add('g_dry0', spriteGrassClump(65, 16, 12, PAL.dry, 10));
  add('g_dry1', spriteGrassClump(66, 14, 16, PAL.dry, 9, true));
  add('g_fl_white', spriteTinyFlower([240, 240, 232], [240, 196, 50]));
  add('g_fl_yellow', spriteTinyFlower([248, 214, 56], [210, 150, 30]));
  add('g_fl_red', spriteTinyFlower([222, 44, 34], [60, 20, 20]));
  add('g_fl_blue', spriteTinyFlower([84, 124, 232], [230, 230, 240]));
  add('g_fl_purple', spriteTinyFlower([168, 96, 220], [240, 220, 120]));
  add('g_fl_pink', spriteTinyFlower([240, 140, 190], [250, 230, 200]));
  addExtraSprites(add);
  addFarmSprites(add);

  // tri par hauteur puis étagères
  const PAD = 2;
  const order = defs.slice().sort((a, b) => b.fh - a.fh);
  let x = PAD, y = PAD, rowH = 0;
  for (const d of order) {
    const w = d.fw * d.pbs.length;
    if (x + w + PAD > ATLAS.w) { x = PAD; y += rowH + PAD * 2; rowH = 0; }
    d.x = x; d.y = y;
    x += w + PAD * 2; rowH = Math.max(rowH, d.fh);
  }
  ATLAS.h = 256;
  while (ATLAS.h < y + rowH + PAD) ATLAS.h *= 2;
  const cv = document.createElement('canvas');
  cv.width = ATLAS.w; cv.height = ATLAS.h;
  const ctx = cv.getContext('2d');
  for (const d of defs) {
    d.pbs.forEach((pb, i) => ctx.putImageData(new ImageData(pb.d, pb.w, pb.h), d.x + i * d.fw, d.y));
    d.canvas = d.pbs[0].canvas();
    d.u0 = d.x / ATLAS.w; d.v0 = d.y / ATLAS.h;
    d.u1 = (d.x + d.fw) / ATLAS.w; d.v1 = (d.y + d.fh) / ATLAS.h;
    d.frames = d.pbs.length;
    d.aspect = d.fw / d.fh;
    delete d.pbs;
    ATLAS.sprites[d.id] = d;
  }
  ATLAS.canvas = cv;
}
