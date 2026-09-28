// ============================================================================
//  TEXTURES PROCÉDURALES (pixel art, 128x128, raccord sans couture)
// ============================================================================

class PixelBuf {
  constructor(w, h) { this.w = w; this.h = h; this.d = new Uint8ClampedArray(w * h * 4); }
  set(x, y, c, a = 255) {
    x |= 0; y |= 0;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 4, d = this.d;
    d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = a;
  }
  setW(x, y, c, a = 255) {
    const w = this.w, h = this.h;
    this.set(((x | 0) % w + w) % w, ((y | 0) % h + h) % h, c, a);
  }
  get(x, y) {
    const i = (y * this.w + x) * 4, d = this.d;
    return [d[i], d[i + 1], d[i + 2], d[i + 3]];
  }
  getW(x, y) {
    const w = this.w, h = this.h;
    return this.get(((x | 0) % w + w) % w, ((y | 0) % h + h) % h);
  }
  alpha(x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0;
    return this.d[(y * this.w + x) * 4 + 3];
  }
  shade(x, y, k, wrap) {
    const c = wrap ? this.getW(x, y) : this.get(x, y);
    if (!c[3]) return;
    const o = [c[0] * k, c[1] * k, c[2] * k];
    if (wrap) this.setW(x, y, o, c[3]); else this.set(x, y, o, c[3]);
  }
  canvas() {
    const c = document.createElement('canvas');
    c.width = this.w; c.height = this.h;
    c.getContext('2d').putImageData(new ImageData(this.d, this.w, this.h), 0, 0);
    return c;
  }
}

const ramp = (hexes) => hexes.map(hexToRgb);
function rampPick(r, v, x, y) {
  const n = r.length;
  const f = clamp(v, 0, 0.9999) * (n - 1);
  let i = Math.floor(f);
  if (f - i > bayer(x, y)) i++;
  return r[Math.min(i, n - 1)];
}

// Cellules de Worley périodiques
function makeWorley(seed, cells) {
  const rnd = mulberry32(seed);
  const pts = [];
  for (let j = 0; j < cells; j++) for (let i = 0; i < cells; i++) pts.push([i + 0.15 + rnd() * 0.7, j + 0.15 + rnd() * 0.7]);
  return function (u, v) {
    const ci = Math.floor(u), cj = Math.floor(v);
    let f1 = 1e9, f2 = 1e9, id = 0;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      const ii = ci + di, jj = cj + dj;
      const wi = ((ii % cells) + cells) % cells, wj = ((jj % cells) + cells) % cells;
      const p = pts[wj * cells + wi];
      const d = Math.hypot(p[0] + (ii - wi) - u, p[1] + (jj - wj) - v);
      if (d < f1) { f2 = f1; f1 = d; id = wj * cells + wi; } else if (d < f2) f2 = d;
    }
    return { f1, f2, id };
  };
}

const TS = 128; // taille des textures

function texGrassBase(seed, pal, blades, flowers) {
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed), rnd = mulberry32(seed + 7);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const v = tileFbm(tn, x / 16, y / 16, 8, 3) * 0.75 + tn(x / 3, y / 3, 43) * 0.35;
    pb.set(x, y, rampPick(pal, v * 0.85 - 0.08, x, y));
  }
  const n = pal.length;
  for (let k = 0; k < blades; k++) {
    const x = (rnd() * TS) | 0, y = (rnd() * TS) | 0, len = 2 + ((rnd() * 4) | 0);
    const lean = rnd() < 0.3 ? (rnd() < 0.5 ? -1 : 1) : 0;
    const bright = rnd();
    for (let l = 0; l < len; l++) {
      const t = l / len;
      let ci = bright > 0.55 ? n - 2 + (t > 0.6 ? 1 : 0) : bright > 0.2 ? n - 3 + (t > 0.5 ? 1 : 0) : 1;
      pb.setW(x + (l === len - 1 ? lean : 0), y - l, pal[clamp(ci, 0, n - 1)]);
    }
    pb.setW(x, y + 1, pal[0]);
  }
  if (flowers) {
    for (let k = 0; k < flowers; k++) {
      const x = (rnd() * TS) | 0, y = (rnd() * TS) | 0;
      const kind = rnd();
      let petal, center;
      if (kind < 0.3) { petal = [236, 236, 228]; center = [240, 200, 60]; }
      else if (kind < 0.55) { petal = [246, 212, 58]; center = [200, 140, 30]; }
      else if (kind < 0.75) { petal = [214, 52, 40]; center = [40, 20, 20]; }
      else if (kind < 0.9) { petal = [150, 90, 210]; center = [230, 220, 120]; }
      else { petal = [90, 130, 230]; center = [240, 240, 240]; }
      pb.setW(x, y, center);
      pb.setW(x - 1, y, petal); pb.setW(x + 1, y, petal);
      pb.setW(x, y - 1, petal); pb.setW(x, y + 1, petal);
      pb.setW(x, y + 2, pal[1]);
    }
  }
  return pb;
}

function texDirt(seed) {
  const pal = ramp(['#35261a', '#433021', '#523b28', '#624730', '#735439', '#846243']);
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed), rnd = mulberry32(seed + 3);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const v = tileFbm(tn, x / 12, y / 12, 10.6667, 3) * 0.8 + tn(x / 2, y / 2, 64) * 0.25;
    pb.set(x, y, rampPick(pal, v - 0.05, x, y));
  }
  for (let k = 0; k < 110; k++) {
    const x = (rnd() * TS) | 0, y = (rnd() * TS) | 0, w = 1 + ((rnd() * 2) | 0);
    const c = rnd() < 0.5 ? pal[5] : [120, 110, 100];
    for (let i = 0; i < w + 1; i++) pb.setW(x + i, y, c);
    if (w > 1) pb.setW(x + 1, y - 1, [c[0] + 20, c[1] + 20, c[2] + 20]);
    for (let i = 0; i < w + 1; i++) pb.setW(x + i, y + 1, pal[0]);
  }
  return pb;
}

function texSand(seed) {
  const pal = ramp(['#9c8760', '#ac976c', '#bba679', '#c8b486', '#d5c294', '#e1cfa3']);
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed), rnd = mulberry32(seed + 5);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const rip = Math.sin((y + tileFbm(tn, x / 16, y / 16, 8, 2) * 14) * (TAU / 8)) * 0.12;
    const v = 0.5 + rip + (tn(x / 2, y / 2, 64) - 0.5) * 0.35;
    pb.set(x, y, rampPick(pal, v, x, y));
  }
  for (let k = 0; k < 160; k++) pb.setW(rnd() * TS, rnd() * TS, rnd() < 0.5 ? pal[0] : pal[5]);
  return pb;
}

function texRock(seed) {
  const pal = ramp(['#34353a', '#43454b', '#53565c', '#63676d', '#75797f', '#8a8e94', '#a0a4a9']);
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed), wor = makeWorley(seed, 5);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const w = wor(x / TS * 5, y / TS * 5);
    const cellTone = hash2i(w.id, 3, seed) * 0.3;
    let v = 0.35 + cellTone + (tileFbm(tn, x / 8, y / 8, 16, 3) - 0.5) * 0.5 + (0.5 - w.f1) * 0.25;
    const edge = w.f2 - w.f1;
    if (edge < 0.05) v = 0.02; else if (edge < 0.1) v -= 0.25;
    pb.set(x, y, rampPick(pal, v, x, y));
  }
  return pb;
}

function texCobble(seed) {
  const pal = ramp(['#46464a', '#56565a', '#68676a', '#7a787a', '#8d8a8b', '#a09c9b']);
  const mortar = ramp(['#252422', '#302e2b', '#3a3833']);
  const moss = ramp(['#2d4a1d', '#3a5e25']);
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed), wor = makeWorley(seed, 8);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const w = wor(x / TS * 8, y / TS * 8);
    const edge = w.f2 - w.f1;
    if (edge < 0.12) {
      const m = tn(x / 4, y / 4, 32);
      pb.set(x, y, m > 0.62 ? rampPick(moss, m, x, y) : rampPick(mortar, m, x, y));
    } else {
      const tone = hash2i(w.id, 11, seed);
      const dome = clamp(1 - w.f1 * 1.6, 0, 1);
      const v = 0.2 + tone * 0.35 + dome * 0.35 + (tn(x / 2, y / 2, 64) - 0.5) * 0.2 - (edge < 0.2 ? 0.15 : 0);
      pb.set(x, y, rampPick(pal, v, x, y));
    }
  }
  return pb;
}

function texBricks(seed, opts) {
  const { pal, mortar, bw, bh, noiseAmt, moss } = opts;
  const P = ramp(pal), M = hexToRgb(mortar);
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed), rnd = mulberry32(seed + 1);
  const mossR = ramp(['#26401a', '#325322', '#40682b', '#4f7c34']);
  for (let y = 0; y < TS; y++) {
    const row = Math.floor(y / bh), off = (row % 2) * (bw / 2), ly = y % bh;
    for (let x = 0; x < TS; x++) {
      const xx = (x + off) % TS, col = Math.floor(xx / bw), lx = xx % bw;
      if (ly === bh - 1 || lx === bw - 1) { pb.set(x, y, M); continue; }
      const id = row * 64 + col;
      let v = 0.25 + hash2i(id, 5, seed) * 0.4 + (tileFbm(tn, x / 8, y / 8, 16, 2) - 0.5) * noiseAmt;
      if (ly === 0 || lx === 0) v += 0.18;
      if (ly === bh - 2 || lx === bw - 2) v -= 0.18;
      let c = rampPick(P, v, x, y);
      if (moss) {
        const m = tileFbm(tn, x / 16 + 3.3, y / 16, 8, 3) + (y / TS) * 0.55;
        if (m > 0.78) c = rampPick(mossR, (m - 0.78) * 2.5 + tn(x / 2, y / 2, 64) * 0.3, x, y);
      }
      pb.set(x, y, c);
    }
  }
  // fissures
  for (let k = 0; k < 6; k++) {
    let x = rnd() * TS, y = rnd() * TS;
    for (let s = 0; s < 10; s++) {
      pb.setW(x, y, M);
      x += rnd() * 2 - 0.6; y += rnd() < 0.5 ? 1 : 0;
    }
  }
  return pb;
}

function texPlanks(seed, pal, plankH, vertical) {
  const P = ramp(pal);
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const a = vertical ? x : y, b = vertical ? y : x;
    const plank = Math.floor(a / plankH), la = a % plankH;
    const segLen = 64, off = (plank * 37) % segLen;
    const seg = Math.floor((b + off) / segLen), lb = (b + off) % segLen;
    if (la === plankH - 1) { pb.set(x, y, [30, 18, 10]); continue; }
    if (lb === 0) { pb.set(x, y, [40, 25, 14]); continue; }
    const id = plank * 16 + seg;
    const grain = Math.sin((la + tn(b / 16, la / 4 + plank * 3, 8) * 5) * 1.3) * 0.12;
    let v = 0.3 + hash2i(id, 9, seed) * 0.35 + grain + (tn(b / 4, a / 1.5, 32) - 0.5) * 0.2;
    if (la === 0) v += 0.15;
    if (la === plankH - 2) v -= 0.15;
    pb.set(x, y, rampPick(P, v, x, y));
    if ((lb === 3 || lb === segLen - 4) && (la === 3 || la === plankH - 5)) pb.set(x, y, [36, 30, 28]);
  }
  return pb;
}

function texLogs(seed) {
  const P = ramp(['#2e1d10', '#3e2816', '#50341d', '#624026', '#744d2e', '#875c38']);
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed);
  const LH = 16;
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const ly = y % LH, t = ly / (LH - 1);
    const cyl = Math.sqrt(Math.max(0, 1 - (t * 2 - 1) ** 2));
    const bark = tn(x / 3, y / 1.5, 42.667) * 0.35 + tn(x / 12, y / 4, 10.667) * 0.25;
    let v = cyl * 0.55 + bark - 0.08 - (t > 0.6 ? (t - 0.6) * 0.5 : 0);
    if (ly === LH - 1) v = 0;
    pb.set(x, y, rampPick(P, v, x, y));
  }
  return pb;
}

function texCrate(seed) {
  const P = ramp(['#4a3018', '#5e3d1f', '#734b27', '#885a30', '#9c6a3a', '#b07b45']);
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed);
  const B = 14;
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const border = x < B || y < B || x >= TS - B || y >= TS - B;
    const d = Math.abs((x - (TS - 1 - y))); // diagonale
    const brace = !border && d < 10;
    let v;
    if (border || brace) {
      v = 0.55 + (tn(x / 4, y / 1.5, 32) - 0.5) * 0.3;
      if (border) {
        if (x === 0 || y === 0) v += 0.2;
        if (x === TS - 1 || y === TS - 1 || x === B - 1 || y === B - 1 || x === TS - B || y === TS - B) v -= 0.3;
      } else if (d >= 9) v -= 0.25;
    } else {
      const pl = Math.floor(x / 20);
      v = 0.25 + hash2i(pl, 2, seed) * 0.15 + (tn(x / 1.5, y / 6, 85.33) - 0.5) * 0.25;
      if (x % 20 === 19) v = 0.02;
    }
    pb.set(x, y, rampPick(P, v, x, y));
  }
  const nail = [60, 58, 55], hi = [150, 145, 135];
  for (const [nx, ny] of [[5, 5], [TS - 7, 5], [5, TS - 7], [TS - 7, TS - 7], [TS / 2 - 1, 5], [TS / 2 - 1, TS - 7], [5, TS / 2 - 1], [TS - 7, TS / 2 - 1]]) {
    pb.set(nx, ny, hi); pb.set(nx + 1, ny, nail); pb.set(nx, ny + 1, nail); pb.set(nx + 1, ny + 1, nail);
  }
  return pb;
}

function texRoof(seed) {
  const P = ramp(['#4f1e14', '#66291b', '#7c3422', '#92402a', '#a84d32', '#bc5b3b']);
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed);
  const TW = 16, TH = 12;
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const row = Math.floor(y / TH), ly = y % TH;
    const xx = (x + (row % 2) * (TW / 2)) % TS, col = Math.floor(xx / TW), lx = xx % TW;
    const cx = lx - (TW - 1) / 2;
    const bottom = TH - 1 - Math.sqrt(Math.max(0, 1 - (cx / (TW / 2)) ** 2)) * 4;
    let v = 0.3 + hash2i(row * 64 + col, 4, seed) * 0.3 + (0.5 - Math.abs(cx) / TW) * 0.3 + (tn(x / 2, y / 2, 64) - 0.5) * 0.2;
    if (ly > bottom) v = 0.02;
    else if (ly > bottom - 1.5) v -= 0.25;
    if (lx === 0) v -= 0.2;
    pb.set(x, y, rampPick(P, v, x, y));
  }
  return pb;
}

function texMetal(seed) {
  const P = ramp(['#22282e', '#2e353c', '#3b434b', '#48525b', '#56616b', '#66727d', '#7a8793']);
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const lx = x % 64, ly = y % 64;
    let v = 0.4 + (tn(x / 16, y / 16, 8) - 0.5) * 0.2 + (tn(x / 1, y / 8, 128) - 0.5) * 0.08;
    if (lx === 0 || ly === 0) v = 0.72;
    if (lx === 63 || ly === 63) v = 0.02;
    if (lx === 62 || ly === 62) v -= 0.2;
    if (ly > 20 && ly < 44 && (lx % 8 === 4)) v -= 0.18;
    if (ly > 20 && ly < 44 && (lx % 8 === 5)) v += 0.15;
    const rv = (lx === 5 || lx === 58) && (ly === 5 || ly === 58);
    pb.set(x, y, rampPick(P, v, x, y));
    if (rv) { pb.set(x, y, P[6]); pb.set(x + 1, y + 1, P[0]); }
  }
  return pb;
}

function texPlaster(seed) {
  const P = ramp(['#8f887c', '#a39c8f', '#b5ae9f', '#c6bfaf', '#d5cebe', '#e2dccc']);
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed), rnd = mulberry32(seed);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const v = 0.55 + (tileFbm(tn, x / 10, y / 10, 12.8, 3) - 0.5) * 0.5 + (tn(x, y, 128) - 0.5) * 0.15;
    pb.set(x, y, rampPick(P, v, x, y));
  }
  for (let k = 0; k < 5; k++) {
    let x = rnd() * TS, y = rnd() * TS;
    for (let s = 0; s < 14; s++) { pb.shade(x | 0, y | 0, 0.72, true); x += rnd() * 2 - 1; y += rnd() * 1.5; }
  }
  return pb;
}

// Colombages (plâtre + poutres), avec ou sans fenêtre à volets
function texTimber(seed, win) {
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed), rnd = mulberry32(seed);
  const plaster = ramp(['#b3a78f', '#c4b9a0', '#d3c9b1', '#e0d7c0', '#ebe3ce']);
  const wood = ramp(['#24170e', '#342114', '#442c1a', '#553822', '#65432a']);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const v = 0.55 + (tileFbm(tn, x / 10, y / 10, 12.8, 3) - 0.5) * 0.35 + (tn(x, y, 128) - 0.5) * 0.1 - (y > 110 ? (y - 110) * 0.012 : 0);
    pb.set(x, y, rampPick(plaster, v, x, y));
  }
  const beam = (x0, y0, x1, y1, w) => {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let i = 0; i <= n; i++) {
      const x = Math.round(lerp(x0, x1, i / n)), y = Math.round(lerp(y0, y1, i / n));
      for (let k = 0; k < w; k++) {
        const px = x0 === x1 ? x + k : x, py = x0 === x1 ? y : y + k;
        pb.setW(px, py, rampPick(wood, 0.35 + (k === 0 ? 0.3 : k === w - 1 ? -0.25 : 0) + (hash2i(px >> 1, py, seed) - 0.5) * 0.3, px, py));
      }
    }
  };
  beam(0, 0, 127, 0, 6); beam(0, 0, 0, 127, 6); beam(0, 62, 127, 62, 5);
  if (!win) { beam(6, 122, 60, 67, 5); beam(121, 122, 67, 67, 5); beam(6, 58, 60, 6, 5); }
  else {
    const shut = [[46, 92, 60], [52, 86, 128], [120, 44, 40], [70, 70, 76]][(rnd() * 4) | 0];
    const sh = ramp([rgbToHex(shut.map((v) => v * 0.55)), rgbToHex(shut.map((v) => v * 0.8)), rgbToHex(shut), rgbToHex(shut.map((v) => Math.min(255, v * 1.25)))]);
    for (let y = 18; y < 56; y++) for (let x = 36; x < 92; x++) {
      const inShutter = x < 46 || x >= 82;
      if (inShutter) pb.set(x, y, rampPick(sh, 0.55 + ((x % 4) === 0 ? -0.3 : 0) + (y === 18 ? 0.3 : 0), x, y));
      else if (x < 49 || x >= 79 || y < 21 || y >= 53 || x === 63 || x === 64 || y === 36) pb.set(x, y, wood[2 + (y < 21 ? 1 : 0)]);
      else pb.set(x, y, rampPick(ramp(['#141b24', '#1f2b38', '#2d3f52', '#48617a']), 0.35 + ((x - y) % 23 < 4 ? 0.5 : 0) - (y - 21) * 0.008, x, y));
    }
    for (let x = 34; x < 94; x++) { pb.set(x, 56, wood[4]); pb.set(x, 57, wood[1]); }
    beam(6, 122, 34, 94, 4); beam(121, 122, 93, 94, 4);
  }
  return pb;
}

function texThatch(seed) {
  const P = ramp(['#5a4520', '#735a29', '#8c7033', '#a4863e', '#b99a4a', '#cbad58']);
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const row = Math.floor(y / 16), ly = y % 16;
    let v = 0.55 + (hash2i(x, row, seed) - 0.5) * 0.45 + (tn(x / 1.5, y / 6, 85.33) - 0.5) * 0.35 - ly * 0.012;
    if (ly >= 13) v -= 0.35;
    if (ly === 0) v += 0.12;
    pb.set(x, y, rampPick(P, v, x, y));
  }
  return pb;
}

function texSlate(seed) {
  const P = ramp(['#1f242c', '#2a3039', '#353d48', '#414a57', '#4e5867', '#5c6878']);
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const row = Math.floor(y / 10), ly = y % 10, xx = (x + (row % 2) * 7) % TS, col = Math.floor(xx / 14), lx = xx % 14;
    let v = 0.35 + hash2i(row * 32 + col, 3, seed) * 0.35 + (tn(x / 2, y / 2, 64) - 0.5) * 0.18 + (ly < 2 ? 0.15 : 0);
    if (ly === 9 || lx === 13) v = 0.02;
    pb.set(x, y, rampPick(P, v, x, y));
  }
  return pb;
}

function texStoneWindow(seed) {
  const pb = texBricks(seed, { pal: ['#4f4b45', '#5f5b54', '#706b63', '#827c73', '#958f85'], mortar: '#2d2a26', bw: 32, bh: 16, noiseAmt: 0.3 });
  const frame = ramp(['#6e675c', '#857e72', '#9c9588', '#b3ac9e']);
  const glass = ramp(['#10151c', '#1a2330', '#27364a', '#3c5470']);
  const cx = 64, top = 44, r = 16;
  for (let y = 22; y < 104; y++) for (let x = cx - 22; x < cx + 22; x++) {
    const dx = x + 0.5 - cx, inArch = y >= top || Math.hypot(dx, y - top) < r;
    const inFrame = y >= top - 6 || Math.hypot(dx, y - top) < r + 6;
    if (!inFrame || Math.abs(dx) > r + 6 || y > 100) continue;
    if (inArch && Math.abs(dx) < r && y < 96) {
      const lead = (Math.round(dx) % 8 === 0) || ((y - 20) % 10 === 0);
      pb.set(x, y, lead ? [22, 22, 24] : rampPick(glass, 0.3 + ((x - y) % 19 < 3 ? 0.5 : 0), x, y));
    } else pb.set(x, y, rampPick(frame, 0.6 - dx * 0.02 + (hash2i(x >> 2, y >> 2, seed) - 0.5) * 0.3, x, y));
  }
  return pb;
}

function texStainedGlass(seed) {
  const pb = new PixelBuf(TS, TS), wor = makeWorley(seed, 6);
  const cols = [[190, 40, 40], [40, 70, 180], [220, 180, 50], [40, 140, 70], [120, 50, 150], [210, 110, 40]];
  const stone = ramp(['#5a554d', '#6f695f', '#857e72', '#9a9386']);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const dx = x + 0.5 - 64, inside = (y >= 50 || Math.hypot(dx, y - 50) < 42) && Math.abs(dx) < 42 && y < 118;
    if (!inside) { pb.set(x, y, rampPick(stone, 0.5 + (hash2i(x >> 3, y >> 3, seed) - 0.5) * 0.4, x, y)); continue; }
    const w = wor(x / TS * 6, y / TS * 6);
    if (w.f2 - w.f1 < 0.07 || Math.abs(dx) > 39 || (y < 50 && Math.hypot(dx, y - 50) > 39)) { pb.set(x, y, [24, 22, 22]); continue; }
    const c = cols[w.id % cols.length], k = 0.75 + (1 - w.f1) * 0.35;
    pb.set(x, y, [c[0] * k, c[1] * k, c[2] * k]);
  }
  return pb;
}

// Voie ferrée : centrée sur u = 0 (le bloc est centré sur son axe)
function texRails(seed) {
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed);
  const gravel = ramp(['#3a3632', '#4a4540', '#5b554e', '#6c665e', '#7e776e']);
  const wood = ramp(['#2e2016', '#3d2b1d', '#4d3725', '#5e442e']);
  const steel = ramp(['#2a2d31', '#4a4f56', '#7d848c', '#b7bec6']);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const u = ((x + 0.5) / TS + 0.5) % 1 - 0.5, au = Math.abs(u);
    const sleeper = ((y >= 8 && y < 30) || (y >= 72 && y < 94)) && au < 0.44;
    let c = rampPick(gravel, 0.5 + (tn(x / 2, y / 2, 64) - 0.5) * 0.8, x, y);
    if (sleeper) c = rampPick(wood, 0.5 + (tn(x / 6, y, 21.33) - 0.5) * 0.5 + (y === 8 || y === 72 ? 0.3 : 0) - (y === 29 || y === 93 ? 0.4 : 0), x, y);
    if (au > 0.25 && au < 0.31) c = rampPick(steel, au < 0.265 ? 0.95 : au > 0.295 ? 0.1 : 0.55, x, y);
    pb.set(x, y, c);
  }
  return pb;
}

function texOre(seed) {
  const pb = texRock(seed), rnd = mulberry32(seed + 9);
  const ores = [[[232, 192, 64], [150, 110, 30]], [[176, 100, 58], [100, 52, 30]], [[88, 208, 224], [30, 110, 130]]];
  for (let k = 0; k < 70; k++) {
    const [hi, lo] = ores[k % 3 === 2 ? (rnd() < 0.4 ? 2 : 0) : k % 3], x = (rnd() * TS) | 0, y = (rnd() * TS) | 0, n = 2 + ((rnd() * 4) | 0);
    for (let i = 0; i < n; i++) { const px = x + ((rnd() * 4) | 0) - 1, py = y + ((rnd() * 3) | 0) - 1; pb.setW(px, py, hi); pb.setW(px + 1, py + 1, lo); }
  }
  return pb;
}

function texCloth(seed) {
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed);
  const red = ramp(['#6e1c18', '#8e2620', '#ad3129', '#c64034']), cream = ramp(['#9f9580', '#bdb298', '#d8ceb2', '#ebe3cb']);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const v = 0.55 + (tn(x / 3, y / 1, 42.67) - 0.5) * 0.25 + ((x + y) % 4 === 0 ? -0.08 : 0);
    pb.set(x, y, rampPick(Math.floor(x / 16) % 2 ? cream : red, v, x, y));
  }
  return pb;
}

function texWaterBlock(seed) {
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed);
  const P = ramp(['#0e2f3c', '#15475a', '#1e6178', '#2e7f96', '#58a8bd', '#a8dbe6']);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const w = Math.sin((x + tileFbm(tn, x / 16, y / 16, 8, 2) * 30) * TAU / 32) * Math.sin((y + tn(x / 8, y / 8, 16) * 20) * TAU / 32);
    pb.set(x, y, rampPick(P, 0.4 + w * 0.3 + (w > 0.82 ? 0.3 : 0), x, y));
  }
  return pb;
}

function texDark(seed) {
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const v = 4 + tn(x / 4, y / 4, 32) * 14;
    pb.set(x, y, [v, v, v * 1.1]);
  }
  return pb;
}

function texTiles(seed) {
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed), P = ramp(['#8e928f', '#a9ada9', '#c0c4bf', '#d3d6d1', '#e4e6e1']);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const lx = x % 32, ly = y % 32, id = Math.floor(x / 32) * 7 + Math.floor(y / 32);
    let v = 0.62 + hash2i(id, 1, seed) * 0.12 + (tn(x / 4, y / 4, 32) - 0.5) * 0.1 - (y / TS) * 0.04;
    if (lx === 0 || ly === 0) v = 0.12;
    if (lx === 1 || ly === 1) v -= 0.12;
    pb.set(x, y, rampPick(P, v, x, y));
  }
  return pb;
}
function texConcrete(seed, win) {
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed), P = ramp(['#55575a', '#66686b', '#77797b', '#88898a', '#9a9b9b']);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    let v = 0.5 + (tileFbm(tn, x / 12, y / 12, 10.667, 3) - 0.5) * 0.35 + (tn(x, y, 128) - 0.5) * 0.12;
    if (y % 64 === 0) v = 0.15;
    if (y % 64 === 1) v += 0.1;
    if (y > 100 && hash2i(x >> 1, y >> 3, seed) > 0.8) v -= 0.12;
    pb.set(x, y, rampPick(P, v, x, y));
  }
  if (win) {
    const frame = ramp(['#2a2d31', '#3d4248', '#565d65']), glass = ramp(['#16222e', '#20364a', '#305070', '#5a86a8']);
    for (let y = 30; y < 80; y++) for (let x = 30; x < 98; x++) {
      const edge = x < 34 || x >= 94 || y < 34 || y >= 76 || x === 63 || x === 64;
      pb.set(x, y, edge ? rampPick(frame, 0.6 - (x > 90 || y > 72 ? 0.4 : 0), x, y) : rampPick(glass, 0.35 + ((x + y) % 21 < 3 ? 0.55 : 0) - (y - 34) * 0.006, x, y));
    }
  }
  return pb;
}
function texFrosted(seed) {
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed), P = ramp(['#6f8d86', '#86a69e', '#9dbdb4', '#b6d3ca', '#d0e6de']);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    let v = 0.55 + (tn(x / 8, y / 8, 16) - 0.5) * 0.3 + ((x - y + 256) % 37 < 4 ? 0.25 : 0);
    if (x % 64 < 3 || y % 64 < 3) v = 0.05;
    pb.set(x, y, rampPick(P, v, x, y));
  }
  return pb;
}
function texHazard(seed) {
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed);
  const Y = ramp(['#8a6a0c', '#b8900e', '#dcb21a', '#f0cc32']), K = ramp(['#141414', '#222222', '#303030']);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const s = Math.floor((x + y) / 16) % 2, v = 0.6 + (tn(x / 3, y / 3, 42.67) - 0.5) * 0.4;
    pb.set(x, y, rampPick(s ? Y : K, v, x, y));
  }
  return pb;
}

// Liste des matériaux (terrain + blocs). scale = mètres par répétition, fit = texture ajustée à la face
const M_GRASS = 0, M_LUSH = 1, M_FLOWERS = 2, M_DRY = 3, M_DIRT = 4, M_SAND = 5, M_ROCK = 6, M_COBBLE = 7;
const M_STONE = 8, M_MOSSY = 9, M_PLANKS = 10, M_LOGS = 11, M_CRATE = 12, M_BRICK = 13, M_ROOF = 14, M_METAL = 15, M_PLASTER = 16;
const M_TIMBER = 17, M_TIMBERWIN = 18, M_THATCH = 19, M_SLATE = 20, M_STONEWIN = 21, M_GLASS = 22, M_RAILS = 23, M_ORE = 24, M_CLOTH = 25, M_WATERB = 26, M_DARK = 27;
const M_TILE = 28, M_CONCRETE = 29, M_LABWIN = 30, M_FROSTED = 31, M_HAZARD = 32;

const MATERIALS = [
  { id: 'grass', name: 'Herbe', terrain: true, scale: 4, gen: () => texGrassBase(11, ramp(['#21451a', '#2a561e', '#346924', '#3f7c2b', '#4d9034', '#5fa33f', '#76b64e']), 1300, 0) },
  { id: 'lush', name: 'Herbe dense', terrain: true, scale: 4, gen: () => texGrassBase(12, ramp(['#153a15', '#1c4a1a', '#245b20', '#2d6d26', '#377f2d', '#449236']), 1700, 0) },
  { id: 'flowers', name: 'Prairie fleurie', terrain: true, scale: 4, gen: () => texGrassBase(13, ramp(['#23471a', '#2c5a1f', '#376e25', '#43822d', '#529637', '#65a943']), 1100, 150) },
  { id: 'dry', name: 'Herbe sèche', terrain: true, scale: 4, gen: () => texGrassBase(14, ramp(['#4f4f22', '#62602a', '#777232', '#8c853c', '#a19747', '#b5aa55']), 1300, 0) },
  { id: 'dirt', name: 'Terre', terrain: true, scale: 4, gen: () => texDirt(15) },
  { id: 'sand', name: 'Sable', terrain: true, scale: 4, gen: () => texSand(16) },
  { id: 'rock', name: 'Roche', terrain: true, scale: 4, gen: () => texRock(17) },
  { id: 'cobble', name: 'Pavés', terrain: true, scale: 4, gen: () => texCobble(18) },
  { id: 'stone', name: 'Pierre', scale: 2, gen: () => texBricks(19, { pal: ['#4a4741', '#5a5650', '#6b665f', '#7d7870', '#908a81'], mortar: '#2b2825', bw: 32, bh: 16, noiseAmt: 0.35 }) },
  { id: 'mossy', name: 'Pierre moussue', scale: 2, gen: () => texBricks(20, { pal: ['#45443d', '#55534b', '#65625a', '#76726a', '#88837a'], mortar: '#262521', bw: 32, bh: 16, noiseAmt: 0.4, moss: true }) },
  { id: 'planks', name: 'Planches', scale: 2, gen: () => texPlanks(21, ['#4a2f1d', '#5b3a24', '#6d472c', '#805535', '#93643f'], 16, false) },
  { id: 'logs', name: 'Rondins', scale: 3, gen: () => texLogs(22) },
  { id: 'crate', name: 'Caisse', scale: 1, fit: true, gen: () => texCrate(23) },
  { id: 'brick', name: 'Briques', scale: 2, gen: () => texBricks(24, { pal: ['#6a281c', '#7e3023', '#93392a', '#a64431'], mortar: '#8b8479', bw: 16, bh: 8, noiseAmt: 0.25 }) },
  { id: 'roof', name: 'Tuiles', scale: 2, gen: () => texRoof(25) },
  { id: 'metal', name: 'Métal', scale: 2, gen: () => texMetal(26) },
  { id: 'plaster', name: 'Crépi', scale: 2, gen: () => texPlaster(27) },
  { id: 'timber', name: 'Colombages', scale: 3, gen: () => texTimber(28, false) },
  { id: 'timberwin', name: 'Colombages + fenêtre', scale: 3, gen: () => texTimber(29, true) },
  { id: 'thatch', name: 'Chaume', scale: 2, gen: () => texThatch(30) },
  { id: 'slate', name: 'Ardoise', scale: 2, gen: () => texSlate(31) },
  { id: 'stonewin', name: 'Pierre + fenêtre', scale: 3, gen: () => texStoneWindow(32) },
  { id: 'glass', name: 'Vitrail', scale: 1, fit: true, gen: () => texStainedGlass(33) },
  { id: 'rails', name: 'Rails', scale: 1.25, gen: () => texRails(34) },
  { id: 'ore', name: 'Minerai', scale: 2, gen: () => texOre(35) },
  { id: 'cloth', name: 'Toile rayée', scale: 2, gen: () => texCloth(36) },
  { id: 'water', name: 'Eau', scale: 2, gen: () => texWaterBlock(37) },
  { id: 'dark', name: 'Obscurité', scale: 2, gen: () => texDark(38) },
  { id: 'tile', name: 'Carrelage', scale: 2, gen: () => texTiles(39) },
  { id: 'concrete', name: 'Béton', scale: 3, gen: () => texConcrete(40, false) },
  { id: 'labwin', name: 'Béton + fenêtre', scale: 3, gen: () => texConcrete(41, true) },
  { id: 'frosted', name: 'Verre dépoli', scale: 2, gen: () => texFrosted(42) },
  { id: 'hazard', name: 'Bandes de danger', scale: 1, gen: () => texHazard(43) },
];
const TERRAIN_MATS = MATERIALS.map((m, i) => i).filter((i) => MATERIALS[i].terrain);
const BLOCK_MATS = [M_STONE, M_MOSSY, M_STONEWIN, M_BRICK, M_PLASTER, M_TIMBER, M_TIMBERWIN, M_PLANKS, M_LOGS, M_CRATE,
  M_ROOF, M_SLATE, M_THATCH, M_GLASS, M_METAL, M_ORE, M_RAILS, M_CLOTH, M_WATERB, M_DARK, M_ROCK, M_COBBLE, M_DIRT, M_SAND, M_GRASS,
  M_CONCRETE, M_LABWIN, M_TILE, M_FROSTED, M_HAZARD];

// Couleur moyenne (pour particules / carte)
function averageColor(pb) {
  let r = 0, g = 0, b = 0;
  const n = pb.w * pb.h;
  for (let i = 0; i < n; i++) { r += pb.d[i * 4]; g += pb.d[i * 4 + 1]; b += pb.d[i * 4 + 2]; }
  return [r / n, g / n, b / n];
}

function buildMaterialTextures() {
  for (const m of MATERIALS) {
    const pb = m.gen();
    m.canvas = pb.canvas();
    m.avg = averageColor(pb);
  }
}
