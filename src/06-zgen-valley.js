// ============================================================================
//  GÉNÉRATEUR : la Vallée (mode Ferme) — 2 km, biomes, ville, ferme, lieux-dits
// ============================================================================

const VALLEY_GEN = 3; // 1 : ferme complète d'origine ; 2 : la ferme ne compte qu'une maison et un champ ; 3 : la vallée dessinée (06-zzdesign.js)
const VALLEY_N = 1024; // cellules de 2 m -> 2 048 m de côté
const BIOMES = ['plaine', 'foret', 'marais', 'lande', 'hauteurs', 'lac', 'ville', 'ferme', 'bouleaux'];
const BIOME_NAMES = { plaine: 'les prés', foret: 'la forêt', marais: 'le marais', lande: 'la lande', hauteurs: 'les hauteurs', lac: 'le bord du lac', ville: 'la ville', ferme: 'la ferme', bouleaux: 'le bois de bouleaux' };

async function generateValley(seed, progress = () => {}, gen = VALLEY_GEN) {
  const tick = (msg) => { progress(msg); return new Promise((r) => setTimeout(r, 0)); };
  // version 3 : la vallée dessinée (même carte à chaque partie, 3 km de côté)
  const D = gen >= 3 && typeof VALLEY_DESIGN !== 'undefined' ? VALLEY_DESIGN : null, DP = D ? designPrepare(D) : null;
  if (D) seed = D.seed;
  const cell = 2, N = D ? D.N : VALLEY_N, W = N + 1, S = N * cell;
  const w = new World(N, cell);
  w.name = 'La Vallée'; w.seed = seed; w.genVersion = gen; w.valley = true;
  const rnd = mulberry32(seed * 13 + 7);
  const nA = makeNoise2D(seed), nB = makeNoise2D(seed + 11), nC = makeNoise2D(seed + 23), nD = makeNoise2D(seed + 37);
  const nE = makeNoise2D(seed + 51), nM = makeNoise2D(seed + 61), nR = makeNoise2D(seed + 73);
  const H = w.heights, M = w.mats, reserved = new Uint8Array(W * W);
  const B = new Builder(w, rnd, reserved);
  B.gen = gen;
  const idx = (i, j) => j * W + i;
  const DF = D ? designFields(D, S, nE) : null;
  const moistAt = (x, z) => (DF ? DF.moist(x, z) : fbm(nM, x / 620, z / 620, 3));
  const roughAt = (x, z) => (DF ? DF.rough(x, z) : fbm(nR, x / 800, z / 800, 3));
  // vallée dessinée : une ceinture de forêt sur les flancs des montagnes (entre les prés et les alpages)
  const beltAt = (x, z) => {
    const d = designMountain(D, x, z);
    if (d < -30) return 0;
    const h = w.heightAt(x, z) - D.WL;
    return smoothstep(-30, 110, d) * smoothstep(8, 18, h) * (1 - smoothstep(52, 70, h)) * (0.42 + 0.3 * fbm(nE, x / 140 + 7, z / 140, 2));
  };
  const forestAt = (x, z) => (DF ? DF.forest(x, z) + beltAt(x, z) : fbm(nE, x / 170, z / 170, 3) + moistAt(x, z) * 0.35);
  const birchAt = (x, z) => (DF ? DF.birch(x, z) > 0.5 : fbm(nD, x / 300 + 4, z / 300, 2) > 0.25);

  await tick('Relief de la vallée…');
  if (D) H.set(designTerrain(D, W, cell, nA, nB, nC, nD));
  else for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) {
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
  w.waterLevel = D ? D.WL : Math.round(sample[Math.floor(sample.length * 0.06)] * 100) / 100;
  const WL = w.waterLevel;
  const heightAt = (x, z) => w.heightAt(x, z);
  const isDry = (x, z, m) => heightAt(x, z) > WL + m;
  const center = { x: S / 2, z: S / 2 };

  // ---------------------------------------------------------------- grands emplacements
  const taken = [];
  const far = (x, z, r) => taken.every((p) => Math.hypot(p.x - x, p.z - z) > p.r + r);
  const lakes = [];
  const lakeFree = (x, z, r) => lakes.every((l) => Math.hypot(l.x - x, l.z - z) > l.r + r);
  const flatness = (x, z, r) => {
    let mn = 1e9, mx = -1e9, sum = 0, n = 0, wet = 0;
    for (let gy = -2; gy <= 2; gy++) for (let gx = -2; gx <= 2; gx++) {
      const h = heightAt(x + gx * r / 2, z + gy * r / 2);
      mn = Math.min(mn, h); mx = Math.max(mx, h); sum += h; n++;
      if (h < WL + 1) wet++;
    }
    return { spread: mx - mn, mean: sum / n, wet };
  };
  const flatSite = (r, minD, maxD, tries, from = center, extraScore) => {
    let best = null;
    for (let k = 0; k < tries; k++) {
      const a = rnd() * TAU, d = lerp(minD, maxD, Math.sqrt(rnd()));
      const x = from.x + Math.cos(a) * d, z = from.z + Math.sin(a) * d;
      if (!w.inside(x, z, r + 70) || !far(x, z, r) || !lakeFree(x, z, r * 0.8)) continue;
      const fl = flatness(x, z, r);
      if (fl.wet > 1) continue;
      const score = fl.spread + rnd() * 3 + (extraScore ? extraScore(x, z, fl) : 0);
      if (!best || score < best.score) best = { x, z, y: Math.max(fl.mean, WL + 1.5), score };
    }
    return best;
  };
  const anySite = (r, minD, maxD, test, from = center) => {
    for (let k = 0; k < 500; k++) {
      const a = rnd() * TAU, d = lerp(minD, maxD, Math.sqrt(rnd()));
      const x = from.x + Math.cos(a) * d, z = from.z + Math.sin(a) * d;
      if (!w.inside(x, z, r + 60) || !far(x, z, r) || !isDry(x, z, 1.2) || !lakeFree(x, z, r)) continue;
      if (!test || test(x, z)) return { x, z, y: heightAt(x, z) };
    }
    return null;
  };
  const place = (res) => { if (res) taken.push(res); return res; };

  await tick('La ferme et la ville…');
  const farmSite = D ? Object.assign({}, DP.sites.farm) : flatSite(42, 0, 260, 260) || { x: center.x, z: center.z, y: heightAt(center.x, center.z) };
  taken.push({ x: farmSite.x, z: farmSite.z, r: 46 });
  // la ville : plaine basse à 380-560 m de la ferme (le relief y est façonné)
  let townSite = D ? { x: DP.sites.town.x, z: DP.sites.town.z, score: 0 } : null;
  for (let k = 0; k < (D ? 0 : 220); k++) {
    const a = rnd() * TAU, d = 380 + rnd() * 180;
    const x = farmSite.x + Math.cos(a) * d, z = farmSite.z + Math.sin(a) * d;
    if (!w.inside(x, z, 190) || !far(x, z, 120)) continue;
    const fl = flatness(x, z, 60);
    const score = fl.spread + Math.max(0, fl.mean - WL - 6) * 0.7 + rnd() * 4;
    if (!townSite || score < townSite.score) townSite = { x, z, score, mean: fl.mean };
  }
  townSite.y = WL + 1.9;
  taken.push({ x: townSite.x, z: townSite.z, r: 130 });
  // grand lac : loin de la ferme et de la ville
  const carveLake = (x, z, r, depth) => {
    B.forVerts(x, z, r * 2.4, (i, j, id, px, pz) => {
      const t = Math.hypot(px - x, pz - z) / r * (1 + nB(px / 18, pz / 18) * 0.3);
      const bowl = t < 1 ? WL - depth * (1 - t * t) + 0.3 : WL + 0.3 + Math.pow(t - 1, 1.5) * r * 0.2;
      if (D) { const e = Math.hypot(px - x, pz - z) / (r * 2.4); if (e < 1) H[id] = lerp(Math.min(H[id], bowl), H[id], smoothstep(0.72, 1, e)); } // pas de marche carrée autour
      else H[id] = Math.min(H[id], bowl);
    });
  };
  let mainLake = null;
  if (D) {
    for (const L of DP.lakes) { carveLake(L.x, L.z, L.r, L.depth); lakes.push(L.kind ? { x: L.x, z: L.z, r: L.r, kind: L.kind } : { x: L.x, z: L.z, r: L.r }); }
    mainLake = lakes[0];
    for (const L of DP.ponds) { carveLake(L.x, L.z, L.r, L.depth); lakes.push({ x: L.x, z: L.z, r: L.r, kind: 'etang' }); }
  }
  for (let k = 0; k < 300 && !mainLake; k++) {
    const x = S * (0.15 + rnd() * 0.7), z = S * (0.15 + rnd() * 0.7), r = 70 + rnd() * 25;
    if (Math.hypot(x - farmSite.x, z - farmSite.z) < 280 || Math.hypot(x - townSite.x, z - townSite.z) < 260 || !far(x, z, r + 40)) continue;
    mainLake = { x, z, r };
  }
  if (!mainLake) mainLake = { x: S * 0.25, z: S * 0.25, r: 70 };
  if (!D) { carveLake(mainLake.x, mainLake.z, mainLake.r, 5); lakes.push(mainLake); }
  for (let k = 0, tries = 0; k < (D ? 2 : 2) && tries < (D ? 0 : 200); tries++) {
    const x = S * (0.15 + rnd() * 0.7), z = S * (0.15 + rnd() * 0.7), r = 26 + rnd() * 20;
    if (Math.hypot(x - farmSite.x, z - farmSite.z) < 160 || !far(x, z, r + 30) || !lakeFree(x, z, r + 120)) continue;
    carveLake(x, z, r, 3); lakes.push({ x, z, r, kind: 'etang' }); k++;
  }
  // mares du marais
  let swamp = D ? { x: DP.swamp.x, z: DP.swamp.z } : null;
  for (let k = 0; k < 400 && !swamp; k++) {
    const x = S * (0.12 + rnd() * 0.76), z = S * (0.12 + rnd() * 0.76);
    if (moistAt(x, z) < 0.22 || !far(x, z, 60) || !lakeFree(x, z, 60)) continue;
    swamp = { x, z };
  }
  if (!swamp) swamp = { x: S * 0.7, z: S * 0.7 };
  for (let k = 0; k < 12; k++) {
    const a = rnd() * TAU, d = rnd() * 55, x = swamp.x + Math.cos(a) * d, z = swamp.z + Math.sin(a) * d, r = 5 + rnd() * 9;
    carveLake(x, z, r, 1.4); lakes.push({ x, z, r, kind: 'marais' });
  }
  // cuvette de la ville (plaine à fleur d'eau autour des douves)
  B.forVerts(townSite.x, townSite.z, 175, (i, j, k, x, z) => {
    const d = Math.hypot(x - townSite.x, z - townSite.z);
    H[k] = lerp(townSite.y + nC(x / 40, z / 40) * 0.4, H[k], smoothstep(70, 175, d));
  });
  // ferme : terrain doux autour
  B.forVerts(farmSite.x, farmSite.z, 90, (i, j, k, x, z) => {
    const d = Math.hypot(x - farmSite.x, z - farmSite.z);
    H[k] = lerp(farmSite.y, H[k], smoothstep(45, 90, d));
  });
  if (D) {
    designRivers(D, H, B.forVerts.bind(B));
    for (const R of DP.rivers) if (R.fish) for (let i = 0; i < R.pts.length; i += 2) lakes.push({ x: R.pts[i][0], z: R.pts[i][1], r: 26, kind: 'riviere', river: true });
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
    if (D && h > WL + 28) { // alpages, éboulis et rochers
      const q = fbm(nC, x / 50 + 3.3, z / 50, 2);
      m = slope > 0.62 ? M_ROCK : slope > 0.42 ? (q > 0.1 ? M_ROCK : M_DRY) : q > 0.3 ? M_FLOWERS : q > -0.2 ? M_GRASS : M_DRY;
    }
    if (D) {
      if (m === M_GRASS && DF.flowers(x, z) > 0.5 && fbm(nC, x / 30 + 1.3, z / 30, 2) > -0.05) m = M_FLOWERS;
      const sn = h - WL - D.snowLine + fbm(nD, x / 40, z / 40, 2) * 8;
      if (sn > 0 && slope < 0.95) m = M_SNOW;
      const G = DP.glacier;
      if (Math.hypot((x - G.x) / G.rx, (z - G.z) / G.rz) < 0.98 && slope < 0.6) m = fbm(nB, x / 25, z / 25, 2) > 0.28 ? M_ICE : M_SNOW;
      if (Math.hypot(x - DP.frozen.x, z - DP.frozen.z) < DP.frozen.r * 0.98) m = M_ICE;
    }
    M[idx(i, j)] = m;
  }
  if (D) designCrevasses(D, H, M, B.forVerts.bind(B));

  // ---------------------------------------------------------------- constructions
  await tick('La vieille ferme…');
  const tdir = Math.atan2(townSite.x - farmSite.x, townSite.z - farmSite.z);
  // orientation alignée sur les axes : l'avant (-z local) regarde vers la ville
  const farmR = Math.round((tdir + Math.PI) / (Math.PI / 2)) * (Math.PI / 2);
  taken.length = 0;
  const farm = place(B.farm({ x: Math.round(farmSite.x), z: Math.round(farmSite.z), y: farmSite.y, r: farmR }));
  await tick('La ville et ses ponts-levis…');
  const town = place(B.townMoat({ x: Math.round(townSite.x), z: Math.round(townSite.z), y: townSite.y }));
  await tick('Le hameau, le lac, la forêt…');
  const DS = (k) => (D ? { x: DP.sites[k].x, z: DP.sites[k].z, y: heightAt(DP.sites[k].x, DP.sites[k].z) } : null);
  const hamletSite = DS('hamlet') || flatSite(36, 300, 460, 220, { x: town.x, z: town.z }, (x, z) => -Math.hypot(x - farm.x, z - farm.z) * 0.01)
    || flatSite(36, 250, 700, 400, { x: town.x, z: town.z }) || anySite(36, 200, 900, null, { x: town.x, z: town.z }) || { x: town.x + 300, z: town.z, y: heightAt(town.x + 300, town.z) };
  const hamlet = place(B.hamlet(hamletSite));
  // cabane du pêcheur : sur la rive du grand lac, du côté de la ville
  // (vallée dessinée : la cabane se pose à six mètres de l'eau, dans la direction prévue)
  const shoreSite = (st, L) => {
    const dx = st.x - L.x, dz = st.z - L.z, d0 = Math.hypot(dx, dz), ux = dx / d0, uz = dz / d0;
    for (let d = L.r * 0.5; d < d0 + 90; d += 1) {
      const x = L.x + ux * d, z = L.z + uz * d;
      if (heightAt(x, z) > WL + 0.5) { const X = x + ux * 6, Z = z + uz * 6; return { x: X, z: Z, y: Math.max(heightAt(X, Z), WL + 1.2) }; }
    }
    return st;
  };
  let fisher = D ? place(B.fisherHut(shoreSite(DS('fisher'), mainLake), mainLake)) : null;
  for (let k = 0; k < 72 && !fisher; k++) {
    const a = Math.atan2(town.z - mainLake.z, town.x - mainLake.x) + (k % 2 ? 1 : -1) * Math.floor(k / 2) * 0.09;
    for (let d = mainLake.r * 0.8; d < mainLake.r * 1.8; d += 1.5) {
      const x = mainLake.x + Math.cos(a) * d, z = mainLake.z + Math.sin(a) * d;
      if (heightAt(x, z) > WL + 0.6) {
        const hx = mainLake.x + Math.cos(a) * (d + 7), hz = mainLake.z + Math.sin(a) * (d + 7);
        if (isDry(hx, hz, 1) && far(hx, hz, 10)) fisher = place(B.fisherHut({ x: hx, z: hz, y: heightAt(hx, hz) }, mainLake));
        break;
      }
    }
  }
  if (!fisher) {
    const a = Math.atan2(town.z - mainLake.z, town.x - mainLake.x), x = mainLake.x + Math.cos(a) * (mainLake.r + 12), z = mainLake.z + Math.sin(a) * (mainLake.r + 12);
    fisher = place(B.fisherHut({ x, z, y: Math.max(heightAt(x, z), WL + 0.8) }, mainLake));
  }
  // phare : de l'autre côté du lac
  if (D) place(B.lighthouse({ x: DP.sites.lighthouse.x, z: DP.sites.lighthouse.z }));
  for (let k = 0; k < (D ? 0 : 40); k++) {
    const a = Math.atan2(town.z - mainLake.z, town.x - mainLake.x) + Math.PI + (rnd() - 0.5) * 1.5;
    const x = mainLake.x + Math.cos(a) * (mainLake.r + 9), z = mainLake.z + Math.sin(a) * (mainLake.r + 9);
    if (isDry(x, z, 1) && far(x, z, 10)) { place(B.lighthouse({ x, z })); break; }
  }
  B.landmark('lac', mainLake.x, mainLake.z, mainLake.r, { fish: 'lac' });
  // hutte de la guérisseuse : au fond de la forêt
  const hutSite = DS('hut') || anySite(14, 300, 750, (x, z) => forestAt(x, z) > 0.32 && heightAt(x, z) < WL + 22, { x: farm.x, z: farm.z })
    || anySite(14, 300, 750, (x, z) => forestAt(x, z) > 0.2, { x: farm.x, z: farm.z });
  const hut = place(B.healerHut(hutSite || anySite(14, 250, 900, null, { x: farm.x, z: farm.z }) || { x: farm.x - 350, z: farm.z, y: heightAt(farm.x - 350, farm.z) }));
  B.landmark('foret', hut.x + 30, hut.z + 30, 120);

  await tick('Lieux-dits et secrets…');
  // moulin : sur une butte
  let millSite = DS('mill');
  for (let k = 0; k < (D ? 0 : 300); k++) {
    const s = anySite(14, 200, 600, null, { x: farm.x, z: farm.z });
    if (!s) continue;
    const fl = flatness(s.x, s.z, 12);
    const around = (heightAt(s.x + 40, s.z) + heightAt(s.x - 40, s.z) + heightAt(s.x, s.z + 40) + heightAt(s.x, s.z - 40)) / 4;
    const score = (s.y - around) - fl.spread * 1.5;
    if (!millSite || score > millSite.score) millSite = { ...s, score };
  }
  if (millSite) place(B.windmill(millSite));
  // mine : entrée au pied d'une colline
  let mineSite = D ? Object.assign(DS('mine'), { dir: DP.sites.mine.dir }) : null;
  for (let k = 0; k < 600 && !mineSite; k++) {
    const x = S * (0.15 + rnd() * 0.7), z = S * (0.15 + rnd() * 0.7);
    if (!far(x, z, 45) || !isDry(x, z, 2) || !lakeFree(x, z, 40) || Math.hypot(x - farm.x, z - farm.z) < 300) continue;
    const h0 = heightAt(x, z);
    for (let a = 0; a < 8; a++) {
      const ang = (a / 8) * TAU, dx = Math.sin(ang), dz = Math.cos(ang);
      const rise = heightAt(x + dx * 24, z + dz * 24) - h0, back = heightAt(x - dx * 14, z - dz * 14) - h0;
      if (rise > 9 && back < 2.5 && isDry(x - dx * 14, z - dz * 14, 1)) { mineSite = { x, z, y: h0, dir: ang }; break; }
    }
  }
  const mine = mineSite ? place(B.mine(mineSite)) : null;
  if (mine) {
    B.landmark('mine', mine.x, mine.z, 24);
    // filons : cuivre et charbon à l'entrée, fer au fond ; la salle profonde (or, gemmes) est sous terre
    const mf = { x: mineSite.x, y: mineSite.y, z: mineSite.z, r: mineSite.dir };
    for (let k = 0; k < 7; k++) { const z2 = 3 + k * 3.3, s2 = k % 2 ? 1 : -1; B.objRel(mf, 'vein', s2 * 1.55, z2, 1.0, { v: k < 3 ? 0 : k < 5 ? 3 : 1 }); }
    for (const [lx, lz, v] of [[-3.5, 28, 1], [3.4, 29.5, 1], [-3.8, 33, 2], [2.5, 34.5, 0]]) B.objRel(mf, 'vein', lx, lz, 1.1, { v });
    const [ex, ez] = B.toWorld(mf, 0, 35);
    B.propRel(mf, 'trappe', 0, 0.05, 34.5, 0, { open: true });
    B.inter('deep', 'mine_profonde', ex, mf.y + 0.6, ez, 'Descendre dans le puits', {});
  }
  const sites = [
    ['stoneCircle', 16, 420, 900, (x, z) => moistAt(x, z) < -0.1],
    ['chapel', 18, 350, 800, (x, z) => forestAt(x, z) > 0.1],
    ['ghostHamlet', 34, 620, 980, null],
    ['watchtower', 10, 380, 900, (x, z) => heightAt(x, z) > WL + 14],
    ['ruins', 16, 400, 950, null],
    ['giantOak', 20, 280, 900, (x, z) => forestAt(x, z) < 0.25],
  ];
  const built = {};
  for (const [fn, r, a, b, test] of sites) {
    if (D) { built[fn] = place(B[fn](DS(fn))); continue; }
    let s = anySite(r, a, b, test, { x: farm.x, z: farm.z });
    if (!s) s = anySite(r, a, b, null, { x: farm.x, z: farm.z });
    if (s) built[fn] = place(B[fn](s));
  }
  // cimetière : hors les murs, près de la porte sud
  const cemSite = DS('cemetery') || anySite(16, 70, 140, null, { x: town.gS[0], z: town.gS[1] }) || anySite(16, 70, 300, null, { x: town.x, z: town.z });
  const cem = cemSite ? place(B.cemetery(cemSite)) : null;
  // cabane du marais
  const swSite = D ? DS('swampShack') : (() => { for (let k = 0; k < 200; k++) { const a = rnd() * TAU, d = rnd() * 50, x = swamp.x + Math.cos(a) * d, z = swamp.z + Math.sin(a) * d; if (heightAt(x, z) > WL - 0.8 && heightAt(x, z) < WL + 1.5 && far(x, z, 10)) return { x, z, y: heightAt(x, z) }; } return null; })();
  if (swSite) place(B.swampShack(swSite));
  else B.landmark('marais', swamp.x, swamp.z, 40, { fish: 'marais' });

  // ---------------------------------------------------------------- chemins
  await tick('Chemins…');
  const nav = w.nav;
  const drawPath = (a, b, width, nodes = true, wig = 30) => {
    const L = Math.hypot(b.x - a.x, b.z - a.z), n = Math.max(2, Math.ceil(L / 8));
    const nx = -(b.z - a.z), nz = b.x - a.x, nl = Math.hypot(nx, nz) || 1;
    let prev = null, lastNode = -1, acc = 0;
    for (let k = 0; k <= n; k++) {
      const t = k / n, off = Math.sin(t * Math.PI) * nA(t * 3 + a.x * 0.01, a.z * 0.01) * wig;
      const p = { x: lerp(a.x, b.x, t) + nx / nl * off, z: lerp(a.z, b.z, t) + nz / nl * off };
      if (prev) { B.paintLine(prev.x, prev.z, p.x, p.z, width, M_DIRT); acc += Math.hypot(p.x - prev.x, p.z - prev.z); }
      if (nodes && (k === 0 || k === n || acc > 22)) {
        const ni = B.navNode(p.x, p.z, 'chemin');
        if (lastNode >= 0) B.navLink(lastNode, ni, 'road');
        lastNode = ni; acc = 0;
      }
      prev = p;
    }
  };
  const P = (arr) => ({ x: arr[0], z: arr[1] });
  const farmRoad = P(farm.road);
  if (D) designRoadsBuild(D, w, B, { heightAt, nA, drawPath });
  else {
  const gateNear = Math.hypot(town.gN[0] - farm.x, town.gN[1] - farm.z) < Math.hypot(town.gS[0] - farm.x, town.gS[1] - farm.z) ? town.gN : town.gS;
  const gateFar = gateNear === town.gN ? town.gS : town.gN;
  drawPath(farmRoad, P(gateNear), 1.7);
  if (hamlet) drawPath(P(gateFar), { x: hamlet.x, z: hamlet.z }, 1.6);
  const gateLake = Math.hypot(town.gN[0] - fisher.x, town.gN[1] - fisher.z) < Math.hypot(town.gS[0] - fisher.x, town.gS[1] - fisher.z) ? town.gN : town.gS;
  drawPath(P(gateLake), { x: fisher.x, z: fisher.z }, 1.3);
  if (hamlet && mine) drawPath({ x: hamlet.x, z: hamlet.z }, { x: mine.entry[0], z: mine.entry[1] }, 1.3);
  if (millSite) drawPath(farmRoad, { x: millSite.x, z: millSite.z }, 1.1, false);
  if (cem) drawPath(P(town.gS), { x: cem.x, z: cem.z }, 1.2);
  if (hut) drawPath(farmRoad, { x: lerp(farm.x, hut.x, 0.55), z: lerp(farm.z, hut.z, 0.55) }, 0.9, true, 50);
  if (hut) drawPath({ x: lerp(farm.x, hut.x, 0.55), z: lerp(farm.z, hut.z, 0.55) }, { x: hut.x, z: hut.z }, 0.7, true, 20);
  if (built.chapel && hut) drawPath({ x: hut.x, z: hut.z }, { x: built.chapel.x, z: built.chapel.z }, 0.6, false, 25);
  }

  // ---------------------------------------------------------------- végétation
  await tick('Forêts et prairies…');
  const G = 3;
  for (let gz = 0; gz < S / G; gz++) for (let gx = 0; gx < S / G; gx++) {
    const x = gx * G + rnd() * G, z = gz * G + rnd() * G;
    if (!w.inside(x, z, 10)) continue;
    const h = heightAt(x, z), id = idx(Math.round(x / cell), Math.round(z / cell));
    if (reserved[id]) continue;
    const r = rnd();
    if (h < WL + 0.35) { if (h > WL - 0.5 && r < 0.2) B.obj('reeds', x, z); else if (h < WL - 0.6 && h > WL - 2 && r < 0.02) B.obj('lilypad', x, z, 0.3, { y: WL + 0.02 }); continue; }
    const m = M[id], moist = moistAt(x, z), f = forestAt(x, z);
    const high = h > WL + 22 || roughAt(x, z) > 0.32;
    if (m === M_SAND) { if (r < 0.01) B.obj('rock', x, z); continue; }
    if (m === M_SNOW || m === M_ICE) { if (r < 0.004) B.obj('rock', x, z); else if (D && m === M_SNOW && forestAt(x, z) > 0.2 && r < 0.05) B.obj('sapin_neige', x, z); continue; }
    if (D && DF.rocks(x, z) > 0.5 && r < 0.045) { B.obj(r < 0.02 ? 'rock' : 'stones', x, z); continue; }
    if (m === M_ROCK) { if (r < 0.03) B.obj(r < 0.015 ? 'rock' : 'stones', x, z); else if (r < 0.04 && !(D && h > WL + D.snowLine - 12)) B.obj('pine', x, z); continue; }
    if (m === M_DIRT || m === M_COBBLE) continue;
    if (moist > 0.28 && h < WL + 6) { // marais
      if (r < 0.03) B.obj('deadtree', x, z);
      else if (r < 0.05) B.obj('birch', x, z);
      else if (r < 0.1) B.obj('reeds', x, z);
      else if (r < 0.13) B.obj('fern', x, z);
      else if (r < 0.145) B.obj('mushroom', x, z);
      else if (r < 0.155) B.obj('herbs', x, z);
      continue;
    }
    if (f > 0.2) { // forêt
      if (high) { if (r < 0.14) B.obj(D ? (h > WL + D.snowLine - 14 ? 'sapin_neige' : r < 0.07 ? 'pine' : r < 0.115 ? 'sapin' : 'meleze') : 'pine', x, z); else if (r < 0.17) B.obj('fern', x, z); else if (r < 0.18) B.obj('rock', x, z); continue; }
      const birchWood = D ? birchAt(x, z) : fbm(nD, x / 300 + 4, z / 300, 2) > 0.25;
      if (r < 0.15) B.obj(birchWood ? (rnd() < 0.8 ? 'birch' : 'oak') : rnd() < 0.62 ? 'oak' : rnd() < 0.6 ? 'birch' : 'apple', x, z);
      else if (r < 0.22) B.obj('fern', x, z);
      else if (r < 0.245) B.obj(rnd() < 0.35 ? 'berry' : 'bush', x, z);
      else if (r < 0.258) B.obj('mushroom', x, z);
      else if (r < 0.263) B.obj('herbs', x, z);
      else if (r < 0.266) B.obj('deadtree', x, z);
      continue;
    }
    if (m === M_DRY && moist < -0.25) { // lande
      if (r < 0.06) B.obj('heather', x, z);
      else if (r < 0.075) B.obj('lavender', x, z);
      else if (r < 0.085) B.obj('rock', x, z);
      else if (r < 0.088) B.obj('pine', x, z);
      continue;
    }
    // prés
    if (r < 0.004) B.obj(rnd() < 0.5 ? 'oak' : rnd() < 0.5 ? 'apple' : 'birch', x, z);
    else if (r < 0.012) B.obj('bush', x, z);
    else if (m === M_FLOWERS && r < 0.08) { const q = rnd(); B.obj(q < 0.3 ? 'poppies' : q < 0.55 ? 'daisies' : q < 0.72 ? 'cornflower' : q < 0.85 ? 'lavender' : 'sunflower', x, z); }
    else if (r < 0.03) B.obj('tallgrass', x, z);
    else if (r < 0.032) B.obj('rock', x, z);
    else if (r < 0.034) B.obj('stones', x, z);
    else if (r < 0.0345) B.obj('berry', x, z);
  }

  await tick('Faune…');
  const wild = (id, count, test) => {
    for (let k = 0, t = 0; k < count && t < count * 80; t++) {
      const x = S * (0.08 + rnd() * 0.84), z = S * (0.08 + rnd() * 0.84);
      const i2 = idx(Math.round(x / cell), Math.round(z / cell));
      if (reserved[i2] || !isDry(x, z, 1) || M[i2] > M_DRY) continue;
      if (Math.hypot(x - farm.x, z - farm.z) < 80) continue;
      if (test(x, z)) { B.obj(id, x, z); k++; }
    }
  };
  wild('rabbit', 50, (x, z) => forestAt(x, z) < 0.15);
  wild('deer', 26, (x, z) => { const f = forestAt(x, z); return f > 0.12 && f < 0.35; });
  wild('boar', 12, (x, z) => forestAt(x, z) > 0.25);
  wild('fox', 10, (x, z) => { const f = forestAt(x, z); return f > 0.05 && f < 0.3; });
  wild('wolf', 5, (x, z) => forestAt(x, z) > 0.3 && Math.hypot(x - farm.x, z - farm.z) > 400 && Math.hypot(x - town.x, z - town.z) > 300);
  wild('crows', 8, (x, z) => forestAt(x, z) < 0.1);
  for (const L of lakes) for (let k = 0, t = 0; k < (L.r > 20 ? 4 : 1) && t < 30; t++) {
    const a = rnd() * TAU, r = rnd() * L.r * 0.7, x = L.x + Math.cos(a) * r, z = L.z + Math.sin(a) * r;
    if (heightAt(x, z) < WL - 0.4) { B.obj('duck', x, z); k++; }
  }
  for (let k = 0; k < 18; k++) B.obj('birds', S * (0.1 + rnd() * 0.8), S * (0.1 + rnd() * 0.8));
  B.obj('crows', farm.x + 20, farm.z - 30);

  // ---------------------------------------------------------------- secrets
  await tick('Secrets…');
  const lm = w.lm;
  // notes : chaque note va à son lieu (emplacement prévu, ou au sol près du lieu)
  const slots = w.noteSlots || {};
  const noteList = (typeof LORE_NOTES !== 'undefined' ? LORE_NOTES : []);
  const put = (key, id) => {
    const arr = slots[key];
    if (arr && arr.length) { B.placeNote(arr.shift(), id); return; }
    const L = lm[key] || lm.ferme;
    for (let k = 0; k < 40; k++) {
      const a = rnd() * TAU, d = L.r * (0.3 + rnd() * 0.6), x = L.x + Math.cos(a) * d, z = L.z + Math.sin(a) * d;
      if (isDry(x, z, 0.5)) { B.placeNote({ x, z, y: null, r: 0 }, id); return; }
    }
  };
  put('notaire', 'N0');
  noteList.forEach((n, i) => put(n.lieu, 'L' + i));
  // coffres enterrés : sous chaque lieu évoqué par une énigme, et quelques caches au hasard
  const treasureAt = new Set();
  noteList.forEach((n) => { if (/creus|enterr|sous la|sous le|trésor|caché/i.test(n.texte) && lm[n.lieu]) treasureAt.add(n.lieu); });
  for (const key of treasureAt) {
    const L = lm[key];
    for (let k = 0; k < 30; k++) {
      const a = rnd() * TAU, d = Math.min(L.r * 0.6, 8) + rnd() * 3, x = L.x + Math.cos(a) * d, z = L.z + Math.sin(a) * d;
      if (!isDry(x, z, 0.5)) continue;
      B.prop('coffre_enterre', x, heightAt(x, z) + 0.02, z, rnd() * TAU);
      B.inter('dig', 'tresor_' + key, x, heightAt(x, z) + 0.3, z, 'Creuser ici', { loot: key });
      break;
    }
  }
  for (let k = 0; k < 6; k++) {
    const s = anySite(3, 150, 950, (x, z) => M[idx(Math.round(x / cell), Math.round(z / cell))] <= M_DRY);
    if (!s) continue;
    B.prop('coffre_enterre', s.x, s.y + 0.02, s.z, rnd() * TAU);
    B.inter('dig', 'cache' + k, s.x, s.y + 0.3, s.z, 'Creuser ici', { loot: 'cache' });
    B.paintDisk(s.x, s.z, 2, -1, 0, true);
  }
  // figurines de bois cachées
  const figKeys = Object.keys(lm).filter((k) => !['place', 'marche', 'mairie', 'boulangerie', 'poste', 'forge', 'graineterie', 'garde', 'puits_ville', 'pont_nord', 'pont_sud', 'ferme'].includes(k));
  for (let k = 0; k < 12; k++) {
    const L = lm[figKeys[(rnd() * figKeys.length) | 0]];
    for (let t = 0; t < 30; t++) {
      const a = rnd() * TAU, d = L.r * (0.4 + rnd() * 0.9), x = L.x + Math.cos(a) * d, z = L.z + Math.sin(a) * d;
      if (!isDry(x, z, 0.4)) continue;
      B.prop('figurine', x, heightAt(x, z), z, rnd() * TAU);
      B.inter('pickup', 'figurine' + k, x, heightAt(x, z) + 0.2, z, 'Ramasser', { item: 'figurine', prop: w.props.length - 1 });
      break;
    }
  }
  // l'Envers : miroirs de sortie, cercles de bougies, le registre
  const envProp = (id, x, z, r, data, y) => B.prop(id, x, y ?? heightAt(x, z), z, r, data, 1, VER_ENVERS);
  const fb = w.bld.ferme;
  const [mx, mz] = B.toWorld(fb.f, 1.5, fb.D / 2 - 0.4);
  envProp('miroir', mx, mz, fb.f.r + Math.PI, null, fb.y);
  B.inter('mirror', 'miroir_ferme', mx, fb.y + 1.2, mz, 'Traverser le miroir', { envers: true });
  if (lm.vieux_puits) {
    const p = lm.vieux_puits;
    envProp('miroir', p.x + 3, p.z, 0);
    B.inter('mirror', 'miroir_puits', p.x + 3, p.y + 1.2, p.z, 'Traverser le miroir', { envers: true });
  }
  if (lm.cercle) for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; envProp('bougie', lm.cercle.x + Math.cos(a) * 4, lm.cercle.z + Math.sin(a) * 4, 0); }
  if (lm.chapelle && lm.chapelle.altar) {
    const [ax, ay, az] = lm.chapelle.altar;
    envProp('livre', ax, az, 0.4, null, ay);
    B.inter('pickup', 'registre', ax, ay + 0.1, az, 'Prendre le livre', { item: 'registre', envers: true, prop: w.props.length - 1 });
  }
  for (let k = 0; k < 14; k++) { const a = rnd() * TAU, d = 20 + rnd() * 40; envProp('ossements', farm.x + Math.cos(a) * d, farm.z + Math.sin(a) * d, rnd() * TAU); }

  // ---------------------------------------------------------------- pièces souterraines (cave, crypte, galerie profonde)
  await tick('Sous la terre…');
  const interById = (id) => (w.inter || []).find((it) => it.id === id);
  {
    const fb = w.bld.ferme;
    const cf = B.underRoom(70, 70, 7, 6, 2.6, 26, M_STONE, M_COBBLE);
    B.propRel(cf, 'etagere', 2.6, 0, 2.7, Math.PI, { kind: 'bocaux' });
    B.propRel(cf, 'tonneau', -2.8, 0, 2.4, 0); B.propRel(cf, 'tonneau', -2.1, 0, 2.6, 0);
    B.propRel(cf, 'table', 0.6, 0, 0.4, 0.2); B.propRel(cf, 'chaise', 0.6, 0, -0.4, Math.PI);
    B.propRel(cf, 'bougie', 1.0, 0.79, 0.3, 0); B.propRel(cf, 'bougie', -2.9, 0, -2.4, 0);
    B.lore(cf, 0.2, 0.6, 'ferme', 0.8);
    // porte murée : n'existe que dans certaines versions du monde
    B.block(cf, 3.3, 0, -0.5, 0.3, 2.2, 1.4, M_MOSSY); w.blocks[w.blocks.length - 1].ver = 0x1 | 0x2 | 0x8;
    B.block(cf, 3.3, 0, -0.5, 0.25, 2.2, 1.3, M_DARK); w.blocks[w.blocks.length - 1].ver = 0x4 | VER_ENVERS;
    B.propRel(cf, 'echelle', -2.8, 0, -2.75, 0, { h: 2.6 });
    const trap = interById('cave');
    if (trap) {
      const [lx, lz] = B.toWorld(cf, -2.6, -2.0);
      trap.data.to = [lx, cf.y + 0.05, lz];
      B.inter('ladder', 'cave_haut', lx - 0.2, cf.y + 1.0, lz - 0.6, 'Remonter l’échelle', { to: [trap.x, fb.y, trap.z + 0.8] });
    }
    w.cellar = { x: cf.x, z: cf.z, y: cf.y };
  }
  if (built.chapel && lm.chapelle) {
    const c = lm.chapelle;
    const cf = B.underRoom(130, 70, 9, 7, 3.2, 28, M_MOSSY, M_STONE);
    for (let k = 0; k < 4; k++) B.propRel(cf, 'caisse', -3 + k * 2, 0, 2.6, 0, null, 0.9);
    B.propRel(cf, 'autel', 0, 0, -2.4, Math.PI);
    B.propRel(cf, 'livre', 0, 1.0, -2.4, 0.3);
    B.propRel(cf, 'bougie', -0.7, 1.0, -2.4, 0); B.propRel(cf, 'bougie', 0.7, 1.0, -2.4, 0);
    B.propRel(cf, 'bougie', -3.8, 0, 0, 0); B.propRel(cf, 'bougie', 3.8, 0, 0, 0);
    const [rx, rz] = B.toWorld(cf, 0, -2.0);
    B.inter('registry', 'registre_crypte', rx, cf.y + 1.2, rz, 'Lire le registre');
    B.propRel(cf, 'echelle', 3.9, 0, 3.2, 0, { h: 3.2 });
    const trap = interById('crypte');
    if (trap) {
      const [lx, lz] = B.toWorld(cf, 3.5, 2.6);
      trap.data.to = [lx, cf.y + 0.05, lz];
      B.inter('ladder', 'crypte_haut', lx, cf.y + 1.0, lz + 0.4, 'Remonter l’échelle', { to: [trap.x, trap.y, trap.z + 0.8] });
    }
    w.crypt = { x: cf.x, z: cf.z, y: cf.y };
  }
  if (mine && D) buildMineMaze(w, B, D, mineSite, interById);
  else if (mine) {
    const mf0 = { x: mineSite.x, y: mineSite.y, z: mineSite.z, r: mineSite.dir };
    void mf0;
    const cf = B.underRoom(90, 150, 18, 14, 4.2, 30, M_ROCK, M_ROCK);
    for (let k = 0; k < 9; k++) {
      const x = -7 + (k % 5) * 3.4, z = k < 5 ? -5.8 : 5.8;
      const [ox, oz] = B.toWorld(cf, x, z);
      w.objects.push({ t: OBJ_INDEX.vein, x: ox, z: oz, h: 1.1, f: 0, v: k % 3 === 0 ? 2 : k % 3 === 1 ? 1 : 3, y: cf.y });
    }
    for (const [x, z] of [[-6, 0], [-4.5, 2.5], [6.5, -2], [5, 3]]) { const [ox, oz] = B.toWorld(cf, x, z); w.objects.push({ t: OBJ_INDEX.crystal, x: ox, z: oz, h: 1.2, f: 0, v: 0, y: cf.y }); }
    B.block(cf, 1.5, -0.05, 0.5, 5, 0.12, 4, M_WATERB);
    const [px, pz] = B.toWorld(cf, 1.5, 0.5);
    w.minePool = { x: px, z: pz, y: cf.y + 0.07, w: 5, d: 4 };
    B.propRel(cf, 'lanterne_sol', -8, 0, -6, 0); B.propRel(cf, 'lanterne_sol', 8, 0, 6, 0); B.propRel(cf, 'lanterne_sol', -8, 0, 6, 0);
    B.propRel(cf, 'ossements', -3, 0, -3, 0.6);
    B.propRel(cf, 'echelle', -8.7, 0, 0, Math.PI / 2, { h: 4.2 });
    const trap = interById('mine_profonde');
    if (trap) {
      const [lx, lz] = B.toWorld(cf, -8.2, 0);
      trap.data.to = [lx, cf.y + 0.05, lz];
      B.inter('ladder', 'mine_haut', lx, cf.y + 1.0, lz, 'Remonter l’échelle', { to: [trap.x, trap.y - 0.6, trap.z] });
    }
    w.deepMine = { x: cf.x, z: cf.z, y: cf.y };
  }

  // ---------------------------------------------------------------- navigation, biomes
  await tick('Chemins des habitants…');
  w.townInfo = { x: town.x, z: town.z, gN: town.gN, gS: town.gS, cemGrave: cem ? cem.newGrave : null };
  finalizeNav(w);
  const BW = Math.ceil(S / 8);
  w.biome = new Uint8Array(BW * BW); w.biomeW = BW;
  for (let j = 0; j < BW; j++) for (let i = 0; i < BW; i++) {
    const x = i * 8 + 4, z = j * 8 + 4, h = heightAt(x, z), moist = moistAt(x, z), f = forestAt(x, z);
    let b = 0;
    if (h < WL + 1.2 && lakes.some((l) => !l.kind && Math.hypot(l.x - x, l.z - z) < l.r * 1.6)) b = 5;
    else if (moist > 0.28 && h < WL + 6) b = 2;
    else if (h > WL + 24 || roughAt(x, z) > 0.4) b = 4;
    else if (f > 0.2) b = fbm(nD, x / 300 + 4, z / 300, 2) > 0.25 ? 8 : 1;
    else if (moist < -0.25) b = 3;
    if (Math.max(Math.abs(x - town.x), Math.abs(z - town.z)) < 56) b = 6;
    if (Math.hypot(x - farm.x, z - farm.z) < 40) b = 7;
    w.biome[j * BW + i] = b;
  }
  w.lakes = lakes;
  w.fishZones = lakes.map((l) => ({ x: l.x, z: l.z, r: l.r * 1.1, kind: l.kind || 'lac' }));
  const fs = w.farm.spawn;
  w.spawn = { x: fs[0], y: farmSite.y + 0.2, z: fs[1], yaw: farmR };
  w.pois = B.pois;
  w.time = 0.29;
  w.dayLength = 1200;
  addLootSpots(w, B, seed, { farm, town, mainLake, hamlet });
  addWonders(w, B, seed, { farm, town, mainLake, hamlet, swamp, forestAt, moistAt, roughAt, birchAt, mine, built, cem, hut, fisher, design: DP });
  addTownLife(w, B, seed, { farm, town, mainLake, hamlet, mine, fisher, mineSite });
  addFlora(w, B, seed, { design: D, forestAt, moistAt, roughAt, birchAt, farm, town, lakes });
  if (D) designExtras(w, B, D, { forestAt });
  addSigils(w, B, seed, { design: D, farm, town });
  w.designed = !!D; w.herdSpot = D ? { x: DP.herd[0], z: DP.herd[1] } : null; w.snowLine = D ? WL + D.snowLine : 1e4;
  return w;
}

// Coins à fouiller (ajoutés en dernier : les sauvegardes existantes restent valables)
function addLootSpots(w, B, seed, ctx) {
  const rnd = mulberry32(seed * 97 + 11), lm = w.lm, WL = w.waterLevel;
  B.rnd = rnd;
  let n = 0;
  const dry = (x, z) => w.inside(x, z, 20) && w.heightAt(x, z) > WL + 0.6 && w.normalAt(x, z)[1] > 0.85;
  const box = (id, x, z, table, y, ver) => {
    const yy = y ?? w.heightAt(x, z);
    const p = B.prop(id, x, yy, z, rnd() * TAU, id === 'coffre_vieux' ? { vide: false } : null, 1, ver);
    const lid = 'loot' + (n++);
    B.inter('loot', lid, x, yy + 0.6, z, 'Fouiller', { table, prop: w.props.length - 1, envers: ver === VER_ENVERS });
    return p;
  };
  const near = (L, rMin, rMax, fn) => {
    for (let k = 0; k < 40; k++) {
      const a = rnd() * TAU, d = rMin + rnd() * (rMax - rMin), x = L.x + Math.cos(a) * d, z = L.z + Math.sin(a) * d;
      if (dry(x, z) && pointFree(w, x, z, 0.6)) { fn(x, z); return true; }
    }
    return false;
  };
  const K = ['coffre_vieux', 'tonneau_vieux', 'caisse', 'sac'];
  if (lm.ruines) { near(lm.ruines, 2, 6, (x, z) => box('coffre_vieux', x, z, 'ruines')); near(lm.ruines, 3, 8, (x, z) => box('tonneau_vieux', x, z, 'ruines')); }
  if (lm.hameau_abandonne) for (let k = 0; k < 3; k++) near(lm.hameau_abandonne, 8, 18, (x, z) => box(K[k % 4], x, z, 'hameau'));
  if (lm.chapelle) near(lm.chapelle, 6, 12, (x, z) => box('coffre_vieux', x, z, 'chapelle'));
  if (lm.marais) near(lm.marais, 3, 14, (x, z) => box('tonneau_vieux', x, z, 'marais'));
  if (lm.phare) near(lm.phare, 4, 7, (x, z) => box('caisse', x, z, 'phare'));
  if (lm.tour) near(lm.tour, 4, 7, (x, z) => box('coffre_vieux', x, z, 'tour'));
  if (lm.mine) { near(lm.mine, 4, 12, (x, z) => box('caisse', x, z, 'mine')); near(lm.mine, 4, 12, (x, z) => box('tonneau_vieux', x, z, 'mine')); }
  if (w.deepMine) { const D = w.deepMine; box('coffre_vieux', D.x + 6.5, D.z - 4.5, 'profond', D.y); box('caisse', D.x - 6, D.z + 4.8, 'profond', D.y); }
  if (w.cellar) box('tonneau_vieux', w.cellar.x + 2.6, w.cellar.z - 1.8, 'cave', w.cellar.y);
  if (w.crypt) { box('coffre_vieux', w.crypt.x - 3.4, w.crypt.z - 1.2, 'crypte', w.crypt.y); box('coffre_vieux', w.crypt.x + 3.4, w.crypt.z - 1.2, 'crypte', w.crypt.y); }
  // campements abandonnés : tente, feu éteint, affaires
  const F = ctx.farm;
  for (let c = 0, t = 0; c < 5 && t < 300; t++) {
    const a = rnd() * TAU, d = 220 + rnd() * 700, x = F.x + Math.cos(a) * d, z = F.z + Math.sin(a) * d;
    if (!dry(x, z) || !pointFree(w, x, z, 3) || Math.hypot(x - ctx.town.x, z - ctx.town.z) < 140) continue;
    const r = rnd() * TAU, y = w.heightAt(x, z);
    B.prop('tente', x + Math.cos(r) * 3, w.heightAt(x + Math.cos(r) * 3, z + Math.sin(r) * 3), z + Math.sin(r) * 3, r + Math.PI / 2);
    B.prop('feu_camp', x, y, z, 0, { lit: false });
    box(rnd() < 0.5 ? 'coffre_vieux' : 'sac', x - Math.sin(r) * 2, z + Math.cos(r) * 2, 'campement');
    if (rnd() < 0.6) box('caisse', x + Math.sin(r) * 2.2, z - Math.cos(r) * 2.2, 'campement');
    B.landmark('campement' + c, x, z, 8, { name: 'un campement abandonné' });
    c++;
  }
  // charrettes renversées au bord des chemins
  const road = w.nav.nodes.filter((q) => q.tag === 'chemin' && Math.hypot(q.x - F.x, q.z - F.z) > 150 && Math.hypot(q.x - ctx.town.x, q.z - ctx.town.z) > 120);
  for (let c = 0, t = 0; c < 3 && t < 60 && road.length; t++) {
    const q = road[(rnd() * road.length) | 0], a = rnd() * TAU, x = q.x + Math.cos(a) * 5, z = q.z + Math.sin(a) * 5;
    if (!dry(x, z) || !pointFree(w, x, z, 2)) continue;
    box('charrette_renversee', x, z, 'charrette');
    c++;
  }
  // barque échouée sur la rive du grand lac
  const L = ctx.mainLake;
  for (let t = 0; t < 80; t++) {
    const a = rnd() * TAU, d = L.r * (0.9 + rnd() * 0.5), x = L.x + Math.cos(a) * d, z = L.z + Math.sin(a) * d;
    const h = w.heightAt(x, z);
    if (h < WL + 0.15 || h > WL + 1.2) continue;
    box('barque', x, z, 'barque', h + 0.05);
    break;
  }
  // l'Envers garde ses propres restes
  for (let k = 0; k < 7; k++) near({ x: F.x, z: F.z }, 60, 420, (x, z) => box(K[k % 4], x, z, 'envers', undefined, VER_ENVERS));
}

// Graphe de navigation des habitants : liaisons automatiques entre nœuds proches et dégagés
function segClear(w, ax, az, bx, bz) {
  const L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.ceil(L / 0.7));
  let ph = w.heightAt(ax, az);
  for (let k = 1; k < n; k++) {
    const t = k / n, x = lerp(ax, bx, t), z = lerp(az, bz, t), h = w.heightAt(x, z);
    if (h < w.waterLevel + 0.15 || Math.abs(h - ph) > 0.9) return false;
    ph = h;
    let hit = false;
    w.query(x, z, 0.8, null, (b) => {
      if (hit) return;
      const g = w.groundAt(x, z, h + 0.6, 0.6);
      if (b.y > g + 1.7 || b.y + b.sy < g + 0.5) return;
      const [lx, lz] = World.blockLocal(b, x, z);
      if (Math.abs(lx) < b.sx / 2 + 0.28 && Math.abs(lz) < b.sz / 2 + 0.28) hit = true;
    });
    if (hit) return false;
  }
  return true;
}
function pointFree(w, x, z, r) {
  const h = w.heightAt(x, z);
  if (h < w.waterLevel + 0.15) return false;
  let hit = false;
  w.query(x, z, r + 0.6, null, (b) => {
    if (hit) return;
    const g = w.groundAt(x, z, h + 0.6, 0.6);
    if (b.y > g + 1.7 || b.y + b.sy < g + 0.5) return;
    const [lx, lz] = World.blockLocal(b, x, z);
    if (Math.abs(lx) < b.sx / 2 + r && Math.abs(lz) < b.sz / 2 + r) hit = true;
  });
  return !hit;
}
function finalizeNav(w) {
  const N = w.nav || (w.nav = { nodes: [], edges: [] });
  const nodes = N.nodes;
  w.grid = null;
  const inner = (n) => /:(in|mid)$/.test(n.tag);
  // nœuds tombés dans un mur, un puits… : on les décale vers un endroit libre
  for (const n of nodes) {
    if (inner(n) || pointFree(w, n.x, n.z, 0.35)) continue;
    let done = false;
    for (let r = 0.6; r <= 6 && !done; r += 0.6) for (let a = 0; a < 12 && !done; a++) {
      const x = n.x + Math.cos(a / 12 * TAU) * r, z = n.z + Math.sin(a / 12 * TAU) * r;
      if (pointFree(w, x, z, 0.35)) { n.x = x; n.z = z; done = true; }
    }
  }
  // rues de la ville : un maillage de nœuds dans les espaces libres
  const T = w.townInfo;
  const inTown = (n) => T && Math.max(Math.abs(n.x - T.x), Math.abs(n.z - T.z)) < 52;
  if (T) for (let dz = -42; dz <= 42; dz += 6) for (let dx = -42; dx <= 42; dx += 6) {
    const x = T.x + dx, z = T.z + dz;
    if (!pointFree(w, x, z, 0.7)) continue;
    if (nodes.some((q) => Math.hypot(q.x - x, q.z - z) < 3)) continue;
    nodes.push({ x, z, tag: 'rue' });
  }
  const C = 44, cells = new Map();
  nodes.forEach((n, i) => { const k = Math.floor(n.x / C) + ',' + Math.floor(n.z / C); (cells.get(k) || cells.set(k, []).get(k)).push(i); });
  const has = new Set(N.edges.map(([a, b]) => Math.min(a, b) + ':' + Math.max(a, b)));
  nodes.forEach((a, i) => {
    if (inner(a)) return;
    const cx = Math.floor(a.x / C), cz = Math.floor(a.z / C);
    for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
      for (const j of cells.get((cx + dx) + ',' + (cz + dz)) || []) {
        if (j <= i) continue;
        const b = nodes[j];
        if (inner(b)) continue;
        const d = Math.hypot(a.x - b.x, a.z - b.z);
        const R = inTown(a) && inTown(b) ? 21 : 44;
        if (d > R || d < 0.3) continue;
        const key = i + ':' + j;
        if (has.has(key)) continue;
        if (segClear(w, a.x, a.z, b.x, b.z)) { N.edges.push([i, j, '']); has.add(key); }
      }
    }
  });
  N.adj = nodes.map(() => []);
  for (const [a, b, flag] of N.edges) {
    const d = Math.hypot(nodes[a].x - nodes[b].x, nodes[a].z - nodes[b].z);
    N.adj[a].push({ to: b, d, flag }); N.adj[b].push({ to: a, d, flag });
  }
  // îlots isolés : ignorés par les habitants
  const start = nodes.findIndex((n) => n.tag === 'place');
  if (start >= 0) {
    const seen = new Set([start]), q = [start];
    while (q.length) { const c = q.shift(); for (const e of N.adj[c]) if (!seen.has(e.to)) { seen.add(e.to); q.push(e.to); } }
    nodes.forEach((n, i) => { if (!seen.has(i)) n.iso = true; });
  }
}
