// ============================================================================
//  GÉNÉRATEUR (AVENTURE) : la Vallée — 2 km, biomes, laboratoire, relais, mystères
// ============================================================================

const ADV_GEN = 1;
const ADV_N = 1024; // cellules de 2 m -> 2 048 m de côté
const RELAY_NAMES = ['Relais Boréal', 'Relais du Levant', 'Relais des Crêtes', 'Relais Austral', 'Relais du Couchant', 'Relais du Marais'];

async function generateAdventure(seed, progress = () => {}) {
  const tick = (msg) => { progress(msg); return new Promise((r) => setTimeout(r, 0)); };
  const cell = 2, N = ADV_N, W = N + 1, S = N * cell;
  const w = new World(N, cell);
  w.name = 'La Vallée'; w.seed = seed; w.genVersion = ADV_GEN; w.adventure = true;
  const rnd = mulberry32(seed * 13 + 7);
  const nA = makeNoise2D(seed), nB = makeNoise2D(seed + 11), nC = makeNoise2D(seed + 23), nD = makeNoise2D(seed + 37);
  const nE = makeNoise2D(seed + 51), nM = makeNoise2D(seed + 61), nR = makeNoise2D(seed + 73);
  const H = w.heights, M = w.mats, reserved = new Uint8Array(W * W);
  const B = new Builder(w, rnd, reserved);
  const idx = (i, j) => j * W + i;
  const moistAt = (x, z) => fbm(nM, x / 620, z / 620, 3);
  const roughAt = (x, z) => fbm(nR, x / 800, z / 800, 3);

  await tick('Relief de la vallée…');
  for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) {
    const x = i * cell, z = j * cell, rough = roughAt(x, z);
    let h = fbm(nA, x / 420, z / 420, 4) * 20 + fbm(nB, x / 110, z / 110, 3) * (3 + 5 * clamp(rough + 0.5, 0, 1.2)) + fbm(nC, x / 26, z / 26, 2) * 0.6;
    const ridge = 1 - Math.abs(nD(x / 260, z / 260));
    h += smoothstep(0.12, 0.45, rough) * ridge * ridge * 55;
    const e = Math.min(i, j, N - i, N - j) / N;
    const rim = smoothstep(0.06, 0.0, e);
    h += rim * rim * (24 + 10 * nD(x / 70, z / 70));
    H[idx(i, j)] = h;
  }
  const sample = [];
  for (let j = N * 0.1 | 0; j < N * 0.9; j += 5) for (let i = N * 0.1 | 0; i < N * 0.9; i += 5) sample.push(H[idx(i, j)]);
  sample.sort((a, b) => a - b);
  w.waterLevel = Math.round(sample[Math.floor(sample.length * 0.06)] * 100) / 100;
  const WL = w.waterLevel;
  const heightAt = (x, z) => w.heightAt(x, z);
  const isDry = (x, z, m) => heightAt(x, z) > WL + m;
  const center = { x: S / 2, z: S / 2 };

  // grands lacs et mares du marais
  const lakes = [];
  const carveLake = (x, z, r, depth) => {
    B.forVerts(x, z, r * 2.4, (i, j, id, px, pz) => {
      const t = Math.hypot(px - x, pz - z) / r * (1 + nB(px / 18, pz / 18) * 0.3);
      const bowl = t < 1 ? WL - depth * (1 - t * t) + 0.3 : WL + 0.3 + Math.pow(t - 1, 1.5) * r * 0.2;
      H[id] = Math.min(H[id], bowl);
    });
  };
  for (let k = 0, tries = 0; k < 3 && tries < 200; tries++) {
    const x = S * (0.15 + rnd() * 0.7), z = S * (0.15 + rnd() * 0.7), r = 35 + rnd() * 35;
    if (Math.hypot(x - center.x, z - center.z) < 160 || lakes.some((l) => Math.hypot(l.x - x, l.z - z) < l.r + r + 120)) continue;
    carveLake(x, z, r, 3.5); lakes.push({ x, z, r }); k++;
  }
  for (let k = 0, tries = 0; k < 14 && tries < 400; tries++) {
    const x = S * (0.1 + rnd() * 0.8), z = S * (0.1 + rnd() * 0.8);
    if (moistAt(x, z) < 0.25 || Math.hypot(x - center.x, z - center.z) < 120) continue;
    const r = 6 + rnd() * 10;
    carveLake(x, z, r, 1.6); lakes.push({ x, z, r }); k++;
  }

  await tick('Biomes…');
  for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) {
    const x = i * cell, z = j * cell, h = H[idx(i, j)], slope = w.slopeAt(i, j);
    const moist = moistAt(x, z), rough = roughAt(x, z);
    let m = M_GRASS;
    if (fbm(nB, x / 60 + 7.7, z / 60, 2) > 0.2) m = M_LUSH;
    if (fbm(nC, x / 70 - 3.1, z / 70 + 9.2, 3) > 0.27) m = M_FLOWERS;
    if (moist < -0.25) m = fbm(nC, x / 40, z / 40, 2) > 0.3 ? M_FLOWERS : M_DRY;
    if (moist > 0.28 && h < WL + 6) m = M_LUSH;
    if (h > WL + 28 || (rough > 0.4 && h > WL + 16)) m = slope > 0.45 ? M_ROCK : M_DRY;
    if (h < WL + 1.6 && m !== M_FLOWERS && m !== M_ROCK) m = M_LUSH;
    if (h < WL + 0.55 + nC(x / 9, z / 9) * 0.25) m = M_SAND;
    if (h < WL - 0.6) m = nD(x / 12, z / 12) > 0.1 ? M_DIRT : M_SAND;
    if (slope > 0.85) m = M_ROCK;
    M[idx(i, j)] = m;
  }

  // ---------------------------------------------------------------- emplacements
  const taken = [];
  const far = (x, z, r) => taken.every((p) => Math.hypot(p.x - x, p.z - z) > p.r + r);
  const lakeFree = (x, z, r) => lakes.every((l) => Math.hypot(l.x - x, l.z - z) > l.r + r);
  const flatSite = (r, minD, maxD, tries, from = center) => {
    let best = null;
    for (let k = 0; k < tries; k++) {
      const a = rnd() * TAU, d = lerp(minD, maxD, Math.sqrt(rnd()));
      const x = from.x + Math.cos(a) * d, z = from.z + Math.sin(a) * d;
      if (!w.inside(x, z, r + 60) || !far(x, z, r) || !lakeFree(x, z, r * 0.8)) continue;
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
  const anySite = (r, minD, maxD, test) => {
    for (let k = 0; k < 400; k++) {
      const a = rnd() * TAU, d = lerp(minD, maxD, Math.sqrt(rnd()));
      const x = center.x + Math.cos(a) * d, z = center.z + Math.sin(a) * d;
      if (!w.inside(x, z, r + 60) || !far(x, z, r) || !isDry(x, z, 1.2) || !lakeFree(x, z, r)) continue;
      if (!test || test(x, z)) return { x, z, y: heightAt(x, z) };
    }
    return null;
  };
  const place = (res) => { if (res) taken.push(res); return res; };

  await tick('Laboratoire Prairie-7…');
  const labSite = flatSite(48, 0, 220, 300) || { x: center.x, z: center.z, y: heightAt(center.x, center.z) };
  const lab = place(B.lab(labSite));

  await tick('Relais et lieux étranges…');
  const relays = [];
  for (let k = 0; k < 6; k++) {
    let best = null;
    for (let t = 0; t < 60; t++) {
      const a = ((k + 0.2 + rnd() * 0.6) / 6) * TAU, d = 280 + rnd() * 560;
      const x = lab.x + Math.sin(a) * d, z = lab.z - Math.cos(a) * d;
      if (!w.inside(x, z, 80) || !far(x, z, 12) || !isDry(x, z, 2) || !lakeFree(x, z, 10)) continue;
      const h = heightAt(x, z);
      if (!best || h > best.h) best = { x, z, h };
    }
    if (best) { const r = place(B.relay(best, k, RELAY_NAMES[k])); relays.push({ ...best, name: RELAY_NAMES[k], id: 'relais' + k }); }
  }
  // maisons abandonnées : caisses et notes
  let houseNote = 0;
  const houseNotes = [1, 2, 4, 6, 12, 13];
  B.onHouse = (f, Wd, D) => {
    if (rnd() < 0.3) B.crate(f, Wd / 2 - 1.1, -D / 2 + 1.2, 0.15);
    if (rnd() < 0.18 && houseNote < houseNotes.length) B.note(f, -Wd / 2 + 1.2, 0.5, houseNotes[houseNote++], 0.15);
  };
  const townSite = flatSite(85, 380, 900, 260);
  const town = townSite ? place(B.town(townSite)) : null;
  const villages = [];
  for (let k = 0; k < 4; k++) { const s = flatSite(42, 250, 950, 160); if (s) villages.push(place(B.village(s))); }
  let mineSite = null;
  for (let k = 0; k < 500 && !mineSite; k++) {
    const x = S * (0.15 + rnd() * 0.7), z = S * (0.15 + rnd() * 0.7);
    if (!far(x, z, 45) || !isDry(x, z, 2) || Math.hypot(x - lab.x, z - lab.z) < 250) continue;
    const h0 = heightAt(x, z);
    for (let a = 0; a < 8; a++) {
      const ang = (a / 8) * TAU, dx = Math.sin(ang), dz = Math.cos(ang);
      const rise = heightAt(x + dx * 24, z + dz * 24) - h0, back = heightAt(x - dx * 14, z - dz * 14) - h0;
      if (rise > 9 && back < 2.5 && isDry(x - dx * 14, z - dz * 14, 1)) { mineSite = { x, z, y: h0, dir: ang }; break; }
    }
  }
  const mine = mineSite ? place(B.mine(mineSite)) : null;
  const monoliths = [];
  for (let k = 0; k < 2; k++) { const s = anySite(18, 550, 980); if (s) monoliths.push(place(B.monolith(s, k))); }
  const extra = [
    ['henge', 1, 350, 900], ['plane', 1, 400, 950], ['graveyard', 1, 300, 800], ['bunker', 1, 450, 950],
    ['cabin', 3, 250, 950], ['camp', 3, 200, 950],
  ];
  for (const [kind, n, a, b] of extra) for (let k = 0; k < n; k++) {
    const s = kind === 'cabin' ? anySite(12, a, b, (x, z) => fbm(nE, x / 170, z / 170, 3) + moistAt(x, z) * 0.35 > 0.15) : anySite(16, a, b);
    if (s) place(B[kind](s));
  }
  if (lakes.length) {
    const L = lakes[0];
    for (let t = 0; t < 40; t++) {
      const a = rnd() * TAU, x = L.x + Math.cos(a) * (L.r + 8), z = L.z + Math.sin(a) * (L.r + 8);
      if (isDry(x, z, 1) && far(x, z, 10)) { place(B.lighthouse({ x, z })); break; }
    }
  }
  const oakSite = anySite(20, 300, 900);
  if (oakSite) {
    B.obj('giantoak', oakSite.x, oakSite.z, 26);
    B.paintDisk(oakSite.x, oakSite.z, 14, -1, 0, true);
    B.note({ x: oakSite.x, y: oakSite.y, z: oakSite.z, r: 0 }, 3, 2.5, 14);
    B.pois.push({ name: 'Le Chêne millénaire', kind: 'oak', x: oakSite.x, z: oakSite.z, r: 16 });
    place({ x: oakSite.x, z: oakSite.z, r: 20 });
  }
  for (let k = 0; k < 16; k++) { // caches isolées
    const s = anySite(3, 150, 980);
    if (s) { B.crate({ x: s.x, y: s.y, z: s.z, r: 0 }, 0, 0); B.paintDisk(s.x, s.z, 3, -1, 0, true); }
  }

  await tick('Chemins…');
  const drawPath = (a, b) => {
    const n = Math.max(2, Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / 8));
    const nx = -(b.z - a.z), nz = b.x - a.x, nl = Math.hypot(nx, nz) || 1;
    let prev = null;
    for (let k = 0; k <= n; k++) {
      const t = k / n, off = Math.sin(t * Math.PI) * nA(t * 3 + a.x * 0.01, a.z * 0.01) * 40;
      const p = { x: lerp(a.x, b.x, t) + nx / nl * off, z: lerp(a.z, b.z, t) + nz / nl * off };
      if (prev) B.paintLine(prev.x, prev.z, p.x, p.z, 1.6, M_DIRT);
      prev = p;
    }
  };
  const entry = { x: lab.entry[0], z: lab.entry[1] };
  if (town) drawPath(entry, { x: town.gates[3][0], z: town.gates[3][1] });
  if (mine) drawPath(entry, { x: mine.entry[0], z: mine.entry[1] });
  for (const v of villages.slice(0, 2)) drawPath(v, town ? { x: town.gates[0][0], z: town.gates[0][1] } : entry);
  if (relays[0]) drawPath(entry, relays.reduce((a, r) => (Math.hypot(r.x - lab.x, r.z - lab.z) < Math.hypot(a.x - lab.x, a.z - lab.z) ? r : a)));

  await tick('Forêts et prairies…');
  const forestAt = (x, z) => fbm(nE, x / 170, z / 170, 3) + moistAt(x, z) * 0.35;
  const G = 3;
  for (let gz = 0; gz < S / G; gz++) for (let gx = 0; gx < S / G; gx++) {
    const x = gx * G + rnd() * G, z = gz * G + rnd() * G;
    if (!w.inside(x, z, 10)) continue;
    const h = heightAt(x, z), id = idx(Math.round(x / cell), Math.round(z / cell));
    if (reserved[id]) continue;
    const r = rnd();
    if (h < WL + 0.35) { if (h > WL - 0.5 && r < 0.2) B.obj('reeds', x, z); continue; }
    const m = M[id], moist = moistAt(x, z), f = forestAt(x, z);
    const high = h > WL + 22 || roughAt(x, z) > 0.32;
    if (m === M_SAND) { if (r < 0.01) B.obj('rock', x, z); continue; }
    if (m === M_ROCK) { if (r < 0.03) B.obj(r < 0.015 ? 'rock' : 'stones', x, z); else if (r < 0.04) B.obj('pine', x, z); continue; }
    if (m === M_DIRT || m === M_COBBLE) continue;
    if (moist > 0.28 && h < WL + 6) { // marais
      if (r < 0.03) B.obj('deadtree', x, z);
      else if (r < 0.05) B.obj('birch', x, z);
      else if (r < 0.1) B.obj('reeds', x, z);
      else if (r < 0.13) B.obj('fern', x, z);
      else if (r < 0.145) B.obj('mushroom', x, z);
      continue;
    }
    if (f > 0.2) { // forêt
      if (high) { if (r < 0.14) B.obj('pine', x, z); else if (r < 0.17) B.obj('fern', x, z); else if (r < 0.18) B.obj('rock', x, z); continue; }
      if (r < 0.15) B.obj(rnd() < 0.62 ? 'oak' : rnd() < 0.6 ? 'birch' : 'apple', x, z);
      else if (r < 0.22) B.obj('fern', x, z);
      else if (r < 0.245) B.obj(rnd() < 0.3 ? 'berry' : 'bush', x, z);
      else if (r < 0.255) B.obj('mushroom', x, z);
      else if (r < 0.258) B.obj('deadtree', x, z);
      continue;
    }
    if (m === M_DRY && moist < -0.25) { // lande
      if (r < 0.06) B.obj('heather', x, z);
      else if (r < 0.075) B.obj('lavender', x, z);
      else if (r < 0.085) B.obj('rock', x, z);
      else if (r < 0.088) B.obj('pine', x, z);
      continue;
    }
    // plaines
    if (r < 0.004) B.obj(rnd() < 0.5 ? 'oak' : rnd() < 0.5 ? 'apple' : 'birch', x, z);
    else if (r < 0.012) B.obj('bush', x, z);
    else if (m === M_FLOWERS && r < 0.08) { const q = rnd(); B.obj(q < 0.3 ? 'poppies' : q < 0.55 ? 'daisies' : q < 0.72 ? 'cornflower' : q < 0.85 ? 'lavender' : 'sunflower', x, z); }
    else if (r < 0.03) B.obj('tallgrass', x, z);
    else if (r < 0.032) B.obj('rock', x, z);
    else if (r < 0.034) B.obj('stones', x, z);
  }

  await tick('Faune…');
  const wild = (id, count, test) => {
    for (let k = 0, t = 0; k < count && t < count * 80; t++) {
      const x = S * (0.08 + rnd() * 0.84), z = S * (0.08 + rnd() * 0.84);
      const i2 = idx(Math.round(x / cell), Math.round(z / cell));
      if (reserved[i2] || !isDry(x, z, 1) || M[i2] > M_DRY) continue;
      if (test(x, z)) { B.obj(id, x, z); k++; }
    }
  };
  wild('rabbit', 55, (x, z) => forestAt(x, z) < 0.15);
  wild('deer', 28, (x, z) => { const f = forestAt(x, z); return f > 0.12 && f < 0.35; });
  for (const L of lakes) for (let k = 0, t = 0; k < (L.r > 20 ? 4 : 1) && t < 30; t++) {
    const a = rnd() * TAU, r = rnd() * L.r * 0.7, x = L.x + Math.cos(a) * r, z = L.z + Math.sin(a) * r;
    if (heightAt(x, z) < WL - 0.4) { B.obj('duck', x, z); k++; }
  }
  for (let k = 0; k < 18; k++) B.obj('birds', S * (0.1 + rnd() * 0.8), S * (0.1 + rnd() * 0.8));

  // départ : dans le hall du laboratoire, face à la salle de contrôle
  const [sx, sz] = B.toWorld(lab.frame, 0, -12);
  w.spawn = { x: sx, y: lab.frame.y + 0.15, z: sz, yaw: lab.frame.r + Math.PI };
  w.pois = B.pois;
  w.time = 0.33;
  w.dayLength = 840;
  w.adv = { lab: { x: lab.x, z: lab.z, bed: lab.bed, entry: lab.entry, frame: lab.frame }, relays, monoliths: monoliths.map((m) => ({ x: m.x, z: m.z })), lakes };
  return w;
}
