// ============================================================================
//  GÉNÉRATEUR : grande prairie (collines, étangs, ville, villages, mine, ruines, camp)
// ============================================================================

const GEN_VERSION = 2;

// Ajoute des animaux à un monde existant (mondes créés avant leur apparition)
function addWildlife(w) {
  const rnd = mulberry32((w.seed | 0) + 99), S = w.size, WL = w.waterLevel;
  const B = new Builder(w, rnd, new Uint8Array(w.W * w.W));
  const areaK = (S / 768) ** 2;
  const grassy = (x, z) => w.inside(x, z, 25) && w.heightAt(x, z) > WL + 1 && w.matAt(x, z) <= M_DRY;
  const scatter = (id, count, test) => {
    for (let k = 0, t = 0; k < count && t < count * 60; t++) {
      const x = rnd() * S, z = rnd() * S;
      if (test(x, z)) { B.obj(id, x, z); k++; }
    }
  };
  scatter('rabbit', 34 * areaK, grassy);
  scatter('deer', 10 * areaK, grassy);
  scatter('duck', 8, (x, z) => w.inside(x, z, 20) && w.heightAt(x, z) < WL - 0.5);
  scatter('birds', 6 * areaK, (x, z) => w.inside(x, z, S * 0.15));
  scatter('sheep', 5, (x, z) => grassy(x, z) && Math.hypot(x - w.spawn.x, z - w.spawn.z) < 45 && Math.hypot(x - w.spawn.x, z - w.spawn.z) > 15);
  w.objectsDirty = true; w.shadeDirty = true; w.grid = null;
}

function generateWorld(opts) {
  const o = Object.assign({ seed: 1337, size: 512, name: 'Prairie', trees: 1, flowers: 1, ponds: 4, ruins: true, camp: true, town: true, villages: 3, mine: true, animals: 1 }, opts);
  const cell = 2, N = o.size, W = N + 1, S = N * cell;
  const w = new World(N, cell);
  w.name = o.name; w.seed = o.seed; w.genVersion = GEN_VERSION;
  const rnd = mulberry32(o.seed * 7 + 3);
  const nA = makeNoise2D(o.seed), nB = makeNoise2D(o.seed + 11), nC = makeNoise2D(o.seed + 23);
  const nD = makeNoise2D(o.seed + 37), nE = makeNoise2D(o.seed + 51);
  const H = w.heights, M = w.mats;
  const reserved = new Uint8Array(W * W);
  const B = new Builder(w, rnd, reserved);
  const idx = (i, j) => j * W + i;

  // ---------------------------------------------------------------- relief
  for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) {
    const x = i * cell, z = j * cell;
    let h = fbm(nA, x / 320, z / 320, 4) * 17 + fbm(nB, x / 95, z / 95, 3) * 4 + fbm(nC, x / 26, z / 26, 2) * 0.55;
    const e = Math.min(i, j, N - i, N - j) / N;
    const rim = smoothstep(0.1, 0.0, e);
    h += rim * rim * (14 + 8 * nD(x / 70, z / 70));
    H[idx(i, j)] = h;
  }
  const sample = [];
  for (let j = N * 0.12 | 0; j < N * 0.88; j += 3) for (let i = N * 0.12 | 0; i < N * 0.88; i += 3) sample.push(H[idx(i, j)]);
  sample.sort((a, b) => a - b);
  w.waterLevel = Math.round(sample[Math.floor(sample.length * 0.05)] * 100) / 100;
  const WL = w.waterLevel;
  const heightAt = (x, z) => w.heightAt(x, z);
  const isDry = (x, z, margin) => heightAt(x, z) > WL + margin;

  // ---------------------------------------------------------------- lieu de départ
  let spawn = null;
  for (let tries = 0; tries < 400 && !spawn; tries++) {
    const r = 10 + tries * 0.4, a = rnd() * TAU;
    const x = S / 2 + Math.cos(a) * r, z = S / 2 + Math.sin(a) * r;
    if (isDry(x, z, 2.5) && w.slopeAt(Math.round(x / cell), Math.round(z / cell)) < 0.2) spawn = { x, z };
  }
  if (!spawn) {
    spawn = { x: S / 2, z: S / 2 };
    B.flatten(spawn.x, spawn.z, 10, Math.max(heightAt(spawn.x, spawn.z), WL + 3), 12);
  }

  // ---------------------------------------------------------------- étangs
  const ponds = [];
  for (let k = 0, tries = 0; k < o.ponds && tries < 200; tries++) {
    const x = S * (0.15 + rnd() * 0.7), z = S * (0.15 + rnd() * 0.7);
    if (Math.hypot(x - spawn.x, z - spawn.z) < 70) continue;
    if (ponds.some((p) => Math.hypot(p.x - x, p.z - z) < p.r + 40)) continue;
    const r = 9 + rnd() * 14;
    ponds.push({ x, z, r });
    k++;
    B.forVerts(x, z, r * 2.5, (i, j, id, px, pz) => {
      const t = Math.hypot(px - x, pz - z) / r * (1 + nB(px / 14, pz / 14) * 0.28);
      const bowl = t < 1 ? WL - 1.9 * (1 - t * t) + 0.3 : WL + 0.3 + Math.pow(t - 1, 1.5) * r * 0.22;
      H[id] = Math.min(H[id], bowl);
    });
  }

  // ---------------------------------------------------------------- matériaux de base
  for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) {
    const x = i * cell, z = j * cell, h = H[idx(i, j)], slope = w.slopeAt(i, j);
    let m = M_GRASS;
    if (fbm(nB, x / 60 + 7.7, z / 60, 2) > 0.2) m = M_LUSH;
    if (fbm(nC, x / 70 - 3.1, z / 70 + 9.2, 3) > 0.26 - 0.12 * (o.flowers - 1)) m = M_FLOWERS;
    if (fbm(nE, x / 110, z / 110, 2) > 0.34 && h > WL + 9) m = M_DRY;
    if (h < WL + 1.6 && m !== M_FLOWERS) m = M_LUSH;
    if (h < WL + 0.55 + nC(x / 9, z / 9) * 0.25) m = M_SAND;
    if (h < WL - 0.6) m = nD(x / 12, z / 12) > 0.1 ? M_DIRT : M_SAND;
    if (slope > 0.85) m = M_ROCK;
    M[idx(i, j)] = m;
  }

  // ---------------------------------------------------------------- choix des emplacements
  const taken = [{ x: spawn.x, z: spawn.z, r: 30 }];
  const far = (x, z, r) => taken.every((p) => Math.hypot(p.x - x, p.z - z) > p.r + r);
  const flatSite = (r, minD, maxD, tries) => {
    let best = null;
    for (let k = 0; k < tries; k++) {
      const x = S * (0.12 + rnd() * 0.76), z = S * (0.12 + rnd() * 0.76);
      const d = Math.hypot(x - spawn.x, z - spawn.z);
      if (d < minD || d > maxD || !far(x, z, r) || !w.inside(x, z, r + 20)) continue;
      if (ponds.some((p) => Math.hypot(p.x - x, p.z - z) < p.r + r * 0.8)) continue;
      let mn = 1e9, mx = -1e9, sum = 0, n = 0, wet = 0;
      for (let gy = -2; gy <= 2; gy++) for (let gx = -2; gx <= 2; gx++) {
        const h = heightAt(x + gx * r / 2, z + gy * r / 2);
        mn = Math.min(mn, h); mx = Math.max(mx, h); sum += h; n++;
        if (h < WL + 1) wet++;
      }
      if (wet > 1) continue;
      const score = mx - mn + rnd() * 3;
      if (!best || score < best.score) best = { x, z, y: Math.max(sum / n, WL + 1.5), score };
    }
    return best;
  };
  const steepSite = () => {
    let best = null;
    for (let k = 0; k < 400; k++) {
      const x = S * (0.15 + rnd() * 0.7), z = S * (0.15 + rnd() * 0.7);
      if (!far(x, z, 40) || !isDry(x, z, 2)) continue;
      const h0 = heightAt(x, z);
      for (let a = 0; a < 8; a++) {
        const ang = (a / 8) * TAU, dx = Math.sin(ang), dz = Math.cos(ang);
        const rise = heightAt(x + dx * 24, z + dz * 24) - h0, back = heightAt(x - dx * 14, z - dz * 14) - h0;
        if (back > 2.5 || !isDry(x - dx * 14, z - dz * 14, 1)) continue;
        const score = rise - Math.abs(back) * 0.5;
        if (rise > 7 && (!best || score > best.score)) best = { x, z, y: h0, dir: ang, score };
      }
    }
    return best;
  };

  let town = null;
  if (o.town && S >= 500) {
    const site = flatSite(85, 130, S * 0.62, 260);
    if (site) { town = B.town(site); taken.push(town); }
  }
  const villages = [];
  for (let k = 0; k < o.villages; k++) {
    const site = flatSite(42, 100, S * 0.72, 160);
    if (!site) break;
    const v = B.village(site);
    villages.push(v); taken.push(v);
  }
  let mine = null;
  if (o.mine) {
    let site = steepSite();
    if (!site) { // aucune colline assez raide : on en crée une
      const s = flatSite(30, 90, S * 0.7, 120);
      if (s) {
        const dir = rnd() * TAU, hx = s.x + Math.sin(dir) * 32, hz = s.z + Math.cos(dir) * 32;
        B.forVerts(hx, hz, 42, (i, j, id, x, z) => { const d = Math.hypot(x - hx, z - hz) / 42; if (d < 1) H[id] += 16 * (1 - d * d) ** 2; });
        site = { x: s.x, z: s.z, y: heightAt(s.x, s.z), dir };
      }
    }
    if (site) { mine = B.mine(site); taken.push(mine); }
  }

  // ---------------------------------------------------------------- outils locaux
  const addBlock = (cx, cy, cz, rot, lx, ly, lz, sx, sy, sz, m, extraRot = 0, sh = 0) => B.block({ x: cx, y: cy, z: cz, r: rot }, lx, ly, lz, sx, sy, sz, m, extraRot, sh);
  const addObj = (id, x, z, h, extra) => B.obj(id, x, z, h, extra);
  const pickSpot = (minD, maxD, margin) => {
    for (let tries = 0; tries < 300; tries++) {
      const a = rnd() * TAU, r = lerp(minD, maxD, rnd());
      const x = spawn.x + Math.cos(a) * r, z = spawn.z + Math.sin(a) * r;
      if (!w.inside(x, z, S * 0.12) || !far(x, z, margin + 10)) continue;
      let ok = isDry(x, z, 1.5);
      for (let k = 0; k < 8 && ok; k++) {
        const aa = (k / 8) * TAU;
        if (!isDry(x + Math.cos(aa) * margin, z + Math.sin(aa) * margin, 0.6)) ok = false;
      }
      if (ok) return { x, z };
    }
    return null;
  };

  // ---------------------------------------------------------------- place de départ
  const sh0 = heightAt(spawn.x, spawn.z);
  B.flatten(spawn.x, spawn.z, 7, sh0, 10);
  B.paintDisk(spawn.x, spawn.z, 6, M_COBBLE, 2.5, true);
  B.paintDisk(spawn.x, spawn.z, 9, -1, 0, true);
  B.pois.push({ name: 'Place du Carrefour', kind: 'plaza', x: spawn.x, z: spawn.z, r: 10 });

  const pois = [];
  // ---------------------------------------------------------------- ruines
  if (o.ruins) {
    const p = pickSpot(90, 190, 16);
    if (p) {
      const y0 = heightAt(p.x, p.z);
      B.flatten(p.x, p.z, 11, y0, 12);
      B.paintDisk(p.x, p.z, 10, M_COBBLE, 5, true);
      B.paintDisk(p.x, p.z, 13, -1, 0, true);
      const rot = rnd() * TAU;
      const n = 10, hs = [];
      for (let k = 0; k < n; k++) { const broken = rnd(); hs.push(broken < 0.2 ? 0 : broken < 0.45 ? 1 + rnd() * 1.5 : 4.6); }
      for (let k = 0; k < n; k++) {
        const a = (k / n) * TAU, hgt = hs[k];
        if (!hgt) continue;
        addBlock(p.x, y0 - 0.3, p.z, rot, Math.cos(a) * 7.5, 0, Math.sin(a) * 7.5, 1.2, hgt + 0.3, 1.2, rnd() < 0.6 ? M_MOSSY : M_STONE);
        if (hgt > 4 && hs[(k + 1) % n] > 4 && k % 2 === 0) {
          const a2 = ((k + 1) / n) * TAU;
          const mx = (Math.cos(a) + Math.cos(a2)) / 2 * 7.5, mz = (Math.sin(a) + Math.sin(a2)) / 2 * 7.5;
          addBlock(p.x, y0 - 0.3, p.z, rot, mx, hgt + 0.3, mz, 1.1, 0.7, 5.2, M_STONE, -((a + a2) / 2));
        }
      }
      addBlock(p.x, y0 - 0.2, p.z, rot, 0, 0, 0, 2.4, 1.2, 1.4, M_STONE);
      addBlock(p.x, y0 - 0.25, p.z, rot, 0, 0, 0, 5, 0.3, 5, M_COBBLE);
      for (let k = 0; k < 3; k++) {
        const a = rnd() * TAU, r = 10 + rnd() * 3;
        addBlock(p.x, y0 - 0.4, p.z, rot, Math.cos(a) * r, 0, Math.sin(a) * r, 1.2, 1.2, 3 + rnd() * 1.5, M_MOSSY, rnd() * 2);
      }
      addBlock(p.x, y0 - 0.3, p.z, rot, -3, 0, 11.5, 5, 2.6, 0.7, M_MOSSY);
      addBlock(p.x, y0 - 0.3, p.z, rot, 3.8, 0, 11.5, 2.2, 1.4, 0.7, M_STONE);
      for (let k = 0; k < 6; k++) { const a = rnd() * TAU, r = 3 + rnd() * 8; addObj('stones', p.x + Math.cos(a) * r, p.z + Math.sin(a) * r); }
      addObj('lamp', p.x + 9, p.z + 9, 4.2);
      pois.push({ ...p, r: 13 }); taken.push({ ...p, r: 16 });
      B.pois.push({ name: 'Ruines de ' + B.name(), kind: 'ruins', x: p.x, z: p.z, r: 14 });
    }
  }

  // ---------------------------------------------------------------- camp + cabane
  if (o.camp) {
    let p = null;
    if (ponds.length) {
      const pd = ponds[0];
      for (let tries = 0; tries < 40 && !p; tries++) {
        const a = rnd() * TAU, x = pd.x + Math.cos(a) * (pd.r + 16), z = pd.z + Math.sin(a) * (pd.r + 16);
        if (isDry(x, z, 1.2) && w.inside(x, z, S * 0.12) && far(x, z, 12)) p = { x, z };
      }
    }
    p = p || pickSpot(60, 150, 10);
    if (p) {
      const y0 = heightAt(p.x, p.z);
      B.flatten(p.x, p.z, 9, y0, 10);
      B.paintDisk(p.x, p.z, 4.5, M_DIRT, 2, true);
      B.paintDisk(p.x, p.z, 11, -1, 0, true);
      addObj('campfire', p.x, p.z, 1.4);
      for (let k = 0; k < 3; k++) { const a = (k / 3) * TAU + 0.5; addObj('stump', p.x + Math.cos(a) * 2.6, p.z + Math.sin(a) * 2.6, 0.75); }
      addObj('barrel', p.x + 4, p.z - 1.5, 1.2);
      const rot = rnd() * TAU, c = Math.cos(rot), s = Math.sin(rot);
      const cx = p.x + 7 * s, cz = p.z + 7 * c;
      const cy = heightAt(cx, cz) - 0.1;
      B.paintDisk(cx, cz, 5, M_DIRT, 3, true);
      addBlock(cx, cy, cz, rot, 0, 0, 0, 5.4, 0.3, 4.4, M_PLANKS);
      addBlock(cx, cy, cz, rot, 0, 0.3, 2.05, 5.4, 2.7, 0.3, M_LOGS);
      addBlock(cx, cy, cz, rot, -2.55, 0.3, 0, 0.3, 2.7, 3.8, M_LOGS);
      addBlock(cx, cy, cz, rot, 2.55, 0.3, 0, 0.3, 2.7, 3.8, M_LOGS);
      addBlock(cx, cy, cz, rot, -1.85, 0.3, -2.05, 1.7, 2.7, 0.3, M_LOGS);
      addBlock(cx, cy, cz, rot, 1.85, 0.3, -2.05, 1.7, 2.7, 0.3, M_LOGS);
      addBlock(cx, cy, cz, rot, 0, 2.3, -2.05, 2.0, 0.7, 0.3, M_LOGS);
      addBlock(cx, cy, cz, rot, 0, 3.0, 0, 6.2, 1.6, 5.4, M_THATCH, 0, 1);
      addBlock(cx, cy, cz, rot, 0, 3.0, 0, 5.3, 1.3, 4.4, M_LOGS, 0, 1);
      addBlock(cx, cy, cz, rot, 0, 0.3, 1.4, 1, 1, 1, M_CRATE);
      addBlock(cx, cy, cz, rot, 1.6, 0.3, 1.4, 1, 1, 1, M_CRATE, 0.3);
      addBlock(cx, cy, cz, rot, 1.9, 1.3, 1.5, 0.8, 0.8, 0.8, M_CRATE, 0.2);
      B.objRel({ x: cx, y: cy, z: cz, r: rot }, 'lantern', 0, 0, 0.7, { y: cy + 2.2 });
      addObj('lamp', p.x - 3.5, p.z + 3.5, 4.2);
      pois.push({ ...p, r: 12 }); taken.push({ ...p, r: 14 });
      B.pois.push({ name: 'Camp des bûcherons', kind: 'camp', x: p.x, z: p.z, r: 13 });
    }
  }

  // ---------------------------------------------------------------- tour de guet sur une colline
  {
    let best = null;
    for (let k = 0; k < 80; k++) {
      const x = S * (0.2 + rnd() * 0.6), z = S * (0.2 + rnd() * 0.6);
      if (Math.hypot(x - spawn.x, z - spawn.z) < 100 || !far(x, z, 20)) continue;
      const h = heightAt(x, z);
      if (!best || h > best.h) best = { x, z, h };
    }
    if (best && best.h > WL + 4) {
      const { x, z } = best, y0 = best.h;
      B.flatten(x, z, 4, y0, 6);
      B.paintDisk(x, z, 4, M_DIRT, 2, true);
      const rot = rnd() * TAU;
      for (const [lx, lz] of [[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3]]) addBlock(x, y0 - 0.3, z, rot, lx, 0, lz, 0.4, 6.3, 0.4, M_LOGS);
      addBlock(x, y0, z, rot, 0, 6, 0, 3.6, 0.3, 3.6, M_PLANKS);
      for (const [lx, lz, sx, sz] of [[0, 1.7, 3.6, 0.2], [0, -1.7, 3.6, 0.2], [1.7, 0, 0.2, 3.6], [-1.7, 0.9, 0.2, 1.8]]) addBlock(x, y0, z, rot, lx, 6.3, lz, sx, 1, sz, M_PLANKS);
      addBlock(x, y0, z, rot, 0, 8.6, 0, 4.2, 1.8, 4.2, M_ROOF, 0, 3);
      for (const [lx, lz] of [[-1.7, -1.7], [1.7, -1.7], [-1.7, 1.7], [1.7, 1.7]]) addBlock(x, y0, z, rot, lx, 6.3, lz, 0.2, 2.3, 0.2, M_LOGS);
      for (let k = 0; k < 12; k++) addBlock(x, y0 - 0.3, z, rot, -2.8, 0, 5.2 - k * 0.45, 1.2, k * 0.5 + 0.55, 0.45, M_PLANKS);
      addBlock(x, y0 - 0.3, z, rot, -2.6, 0, -0.6, 1.8, 6.3, 1.2, M_LOGS);
      pois.push({ x, z, r: 8 }); taken.push({ x, z, r: 10 });
      B.pois.push({ name: 'Tour de guet', kind: 'tower', x, z, r: 9 });
    }
  }

  // ---------------------------------------------------------------- chemins
  const paths = [];
  const drawPath = (a, b) => {
    const pts = [];
    const n = Math.max(2, Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / 6));
    const nx = -(b.z - a.z), nz = b.x - a.x, nl = Math.hypot(nx, nz) || 1;
    for (let k = 0; k <= n; k++) {
      const t = k / n, off = Math.sin(t * Math.PI) * nA(t * 3 + a.x * 0.01, a.z * 0.01) * 22;
      pts.push({ x: lerp(a.x, b.x, t) + nx / nl * off, z: lerp(a.z, b.z, t) + nz / nl * off });
    }
    paths.push(pts);
    for (let k = 0; k < pts.length - 1; k++) {
      const p0 = pts[k], p1 = pts[k + 1];
      const dx = p1.x - p0.x, dz = p1.z - p0.z, L2 = dx * dx + dz * dz || 1;
      B.forVerts((p0.x + p1.x) / 2, (p0.z + p1.z) / 2, Math.sqrt(L2) / 2 + 5, (i, j, id, px, pz) => {
        const t = clamp(((px - p0.x) * dx + (pz - p0.z) * dz) / L2, 0, 1);
        const d = Math.hypot(px - (p0.x + dx * t), pz - (p0.z + dz * t)) + (hash2i(i, j, 5) - 0.5) * 1.2;
        if (d < 1.7 && H[id] > WL + 0.2) { if (M[id] !== M_COBBLE) M[id] = M_DIRT; reserved[id] = 1; }
        else if (d < 3.2) reserved[id] = 1;
      });
    }
  };
  const nearestGate = (p) => town ? town.gates.reduce((a, g) => (Math.hypot(g[0] - p.x, g[1] - p.z) < Math.hypot(a[0] - p.x, a[1] - p.z) ? g : a)) : null;
  if (town) { const g = nearestGate(spawn); drawPath(spawn, { x: g[0], z: g[1] }); }
  for (const v of villages) {
    const g = nearestGate(v);
    const target = g && Math.hypot(g[0] - v.x, g[1] - v.z) < Math.hypot(spawn.x - v.x, spawn.z - v.z) * 1.3 ? { x: g[0], z: g[1] } : spawn;
    drawPath(v, target);
  }
  if (mine) { const g = nearestGate({ x: mine.entry[0], z: mine.entry[1] }); drawPath({ x: mine.entry[0], z: mine.entry[1] }, g ? { x: g[0], z: g[1] } : spawn); }
  for (const p of pois) drawPath(spawn, p);
  for (const pd of ponds.slice(0, 2)) {
    const a = Math.atan2(spawn.z - pd.z, spawn.x - pd.x);
    drawPath(spawn, { x: pd.x + Math.cos(a) * (pd.r + 3), z: pd.z + Math.sin(a) * (pd.r + 3) });
  }
  if (paths.length) { // lampadaires le long du premier chemin
    let acc = 0, side = 1;
    const pts = paths[0];
    for (let k = 1; k < pts.length - 1; k++) {
      acc += Math.hypot(pts[k].x - pts[k - 1].x, pts[k].z - pts[k - 1].z);
      if (acc > 30) {
        acc = 0; side = -side;
        const dx = pts[k + 1].x - pts[k].x, dz = pts[k + 1].z - pts[k].z, l = Math.hypot(dx, dz) || 1;
        const x = pts[k].x - dz / l * 2.6 * side, z = pts[k].z + dx / l * 2.6 * side;
        if (isDry(x, z, 0.3) && far(x, z, 0)) addObj('lamp', x, z, 4.2);
      }
    }
  }

  // ---------------------------------------------------------------- végétation
  const treeBuckets = new Map();
  const bucketKey = (x, z) => (Math.floor(x / 6) & 0xffff) | (Math.floor(z / 6) << 16);
  const treeTooClose = (x, z, r) => {
    for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
      const b = treeBuckets.get(bucketKey(x + dx * 6, z + dz * 6));
      if (b) for (const t of b) if (Math.hypot(t.x - x, t.z - z) < Math.max(r, t.r)) return true;
    }
    return false;
  };
  const addTree = (id, x, z) => {
    const r = OBJ_TYPES[OBJ_INDEX[id]].spacing;
    if (treeTooClose(x, z, r)) return false;
    const k = bucketKey(x, z);
    (treeBuckets.get(k) || treeBuckets.set(k, []).get(k)).push({ x, z, r });
    addObj(id, x, z);
    if (rnd() < 0.12) { const a = rnd() * TAU; addObj('mushroom', x + Math.cos(a) * 1.8, z + Math.sin(a) * 1.8); }
    return true;
  };
  const forestAt = (x, z) => fbm(nD, x / 140 + 100, z / 140, 3);
  for (let gz = 0; gz < S / 2; gz++) for (let gx = 0; gx < S / 2; gx++) {
    const x = gx * 2 + rnd() * 2, z = gz * 2 + rnd() * 2;
    if (!w.inside(x, z, 8)) continue;
    const h = heightAt(x, z);
    const i = Math.round(x / cell), j = Math.round(z / cell), id = idx(i, j);
    if (h < WL + 0.35) {
      if (h > WL - 0.5 && rnd() < 0.14 && !reserved[id]) addObj('reeds', x, z);
      continue;
    }
    if (reserved[id]) continue;
    const m = M[id];
    if (m === M_SAND || m === M_ROCK) { if (rnd() < 0.012) addObj('rock', x, z); continue; }
    if (m === M_DIRT) continue;
    const f = forestAt(x, z);
    let pTree = (f > 0.24 ? smoothstep(0.24, 0.45, f) * 0.17 : 0.0035) * o.trees;
    if (rnd() < pTree) {
      let sp = 'oak';
      const q = rnd();
      if (f > 0.4 || h > WL + 14) sp = q < 0.65 ? 'pine' : 'oak';
      else if (h < WL + 3.5) sp = q < 0.6 ? 'birch' : 'oak';
      else if (q < 0.16) sp = 'birch';
      else if (f < 0.24 && q < 0.3) sp = 'apple';
      addTree(sp, x, z);
      continue;
    }
    const r2 = rnd();
    if (r2 < ((f > 0.08 && f < 0.3) ? 0.05 : 0.005) * o.trees) { addObj(rnd() < 0.25 ? 'berry' : 'bush', x, z); continue; }
    if (r2 < 0.055 + (m === M_DRY ? 0.01 : 0) && rnd() < 0.08) { addObj('rock', x, z); continue; }
    if (m === M_FLOWERS && rnd() < 0.075 * o.flowers) {
      const sun = nE(x / 30, z / 30) > 0.45;
      const q = rnd();
      addObj(sun ? 'sunflower' : q < 0.35 ? 'poppies' : q < 0.6 ? 'daisies' : q < 0.8 ? 'lavender' : 'cornflower', x, z);
      continue;
    }
    if ((m === M_GRASS || m === M_LUSH || m === M_DRY) && rnd() < 0.012) { addObj('tallgrass', x, z); continue; }
    if (rnd() < 0.0015) addObj('stones', x, z);
  }

  // ---------------------------------------------------------------- animaux sauvages
  const areaK = (S / 768) ** 2 * o.animals;
  const wildSpot = (test) => {
    for (let k = 0; k < 60; k++) {
      const x = rnd() * S, z = rnd() * S;
      if (!w.inside(x, z, 25)) continue;
      const id = idx(Math.round(x / cell), Math.round(z / cell));
      if (reserved[id] || !isDry(x, z, 1) || M[id] > M_DRY) continue;
      if (test(x, z)) return { x, z };
    }
    return null;
  };
  for (let k = 0; k < 34 * areaK; k++) { const p = wildSpot((x, z) => forestAt(x, z) < 0.2); if (p) addObj('rabbit', p.x, p.z); }
  for (let k = 0; k < 12 * areaK; k++) {
    const p = wildSpot((x, z) => { const f = forestAt(x, z); return f > 0.12 && f < 0.32; });
    if (p) for (let n = 0; n < 1 + ((rnd() * 2) | 0); n++) addObj('deer', p.x + (rnd() - 0.5) * 8, p.z + (rnd() - 0.5) * 8);
  }
  for (const pd of ponds) {
    for (let k = 0, tries = 0; k < 2 + ((rnd() * 3) | 0) && tries < 30; tries++) {
      const a = rnd() * TAU, r = rnd() * pd.r * 0.7, x = pd.x + Math.cos(a) * r, z = pd.z + Math.sin(a) * r;
      if (heightAt(x, z) < WL - 0.4) { addObj('duck', x, z); k++; }
    }
  }
  for (let k = 0; k < 8 * areaK; k++) { const x = S * (0.15 + rnd() * 0.7), z = S * (0.15 + rnd() * 0.7); addObj('birds', x, z); }

  // ---------------------------------------------------------------- panneau + lampadaires de la place
  const first = town ? { x: nearestGate(spawn)[0], z: nearestGate(spawn)[1] } : pois[0] || { x: spawn.x + 10, z: spawn.z };
  const yawTo = Math.atan2(-(first.x - spawn.x), -(first.z - spawn.z));
  const fx = -Math.sin(yawTo), fz = -Math.cos(yawTo);
  addObj('sign', spawn.x + fx * 3 + fz * 1.5, spawn.z + fz * 3 - fx * 1.5, 1.8);
  addObj('lamp', spawn.x - fz * 5, spawn.z + fx * 5, 4.2);
  addObj('lamp', spawn.x + fz * 5, spawn.z - fx * 5, 4.2);
  addObj('barrel', spawn.x - fx * 4 + fz * 3, spawn.z - fz * 4 - fx * 3, 1.2);

  w.spawn = { x: spawn.x - fx * 2, y: heightAt(spawn.x, spawn.z), z: spawn.z - fz * 2, yaw: yawTo };
  w.pois = B.pois;
  w.time = 0.3;
  w.dayLength = 600;
  return w;
}
