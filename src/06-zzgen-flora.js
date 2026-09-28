// ============================================================================
//  FLORE EN PLUS : chaque milieu reçoit ses arbres et ses fleurs (saules et
//  aulnes au bord de l'eau, iris, reine-des-prés et myosotis sur les berges ;
//  hêtres, châtaigniers, noyers, érables, houx, jacinthes et digitales en
//  forêt ; sapins et mélèzes en altitude, gentianes, rhododendrons et
//  edelweiss sous la neige ; chardons, achillée et orchidées sur la lande ;
//  boutons d'or, pissenlits, trèfle, primevères, violettes, jonquilles, lupins
//  et mauves dans les prés ; arbres fruitiers, peupliers le long des routes,
//  ifs aux cimetières, vergers).
//  Passe ajoutée en dernier avec son propre tirage : les anciennes sauvegardes
//  gardent leurs objets et leurs numéros.
// ============================================================================
function addFlora(w, B, seed, ctx) {
  const rnd = mulberry32(seed * 173 + 41), WL = w.waterLevel, S = w.size, cell = w.cell, D = ctx.design;
  const snow = D ? WL + D.snowLine : 1e9;
  const H = (x, z) => w.heightAt(x, z);
  const pickOf = (arr) => arr[(rnd() * arr.length) | 0];
  w.grid = null;
  // arbres posés par cette passe : petite grille pour l'espacement
  const G = 6, cells = new Map(), kk = (x, z) => ((x / G) | 0) + ',' + ((z / G) | 0);
  const crowd = (x, z, r) => {
    for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) for (const q of cells.get((((x / G) | 0) + dx) + ',' + (((z / G) | 0) + dz)) || []) if (Math.hypot(q[0] - x, q[1] - z) < r) return true;
    let hit = false;
    w.query(x, z, r, (o) => { if (!hit && o && !o.gone && Math.hypot(o.x - x, o.z - z) < r) hit = true; }, null);
    return hit;
  };
  const free = (x, z) => {
    if (!w.inside(x, z, 14)) return false;
    const i = Math.round(x / cell), j = Math.round(z / cell);
    if (B.reserved[j * w.W + i]) return false;
    const m = w.mats[j * w.W + i];
    return m !== M_DIRT && m !== M_COBBLE;
  };
  const tree = (id, x, z, r) => { if (crowd(x, z, r || 4)) return false; B.obj(id, x, z); const k = kk(x, z); (cells.get(k) || cells.set(k, []).get(k)).push([x, z]); return true; };
  const flower = (id, x, z) => { B.obj(id, x, z); };
  const LOW = ['bouton_or', 'pissenlit', 'trefle_f', 'primevere', 'violette', 'jonquille', 'bouton_or', 'trefle_f'];
  const FRUIT = ['cerisier', 'poirier', 'prunier', 'noyer'];
  const step = 5.5;
  for (let gz = 0; gz < S / step; gz++) for (let gx = 0; gx < S / step; gx++) {
    const x = gx * step + rnd() * step, z = gz * step + rnd() * step, r = rnd();
    if (!free(x, z)) continue;
    const h = H(x, z);
    if (h < WL + 0.3) continue;
    const i = Math.round(x / cell), j = Math.round(z / cell), m = w.mats[j * w.W + i];
    const f = ctx.forestAt(x, z), moist = ctx.moistAt(x, z), high = h > WL + 22 || ctx.roughAt(x, z) > 0.32;
    if (m === M_SNOW || m === M_ICE) { if (m === M_SNOW && r < 0.006 && h < snow + 40) flower('edelweiss', x, z); continue; }
    if (m === M_SAND || m === M_ROCK) { if (m === M_ROCK && r < 0.004 && h > WL + 40) flower('edelweiss', x, z); continue; }
    // berges
    if (h < WL + 1.7) {
      if (r < 0.03) tree(r < 0.019 ? 'saule' : 'aulne', x, z, 6);
      else if (r < 0.08) flower(pickOf(['iris', 'reine_pres', 'myosotis', 'iris']), x, z);
      continue;
    }
    // forêts
    if (f > 0.22) {
      if (high) {
        if (r < 0.028) tree(h > snow - 14 ? 'sapin_neige' : r < 0.018 ? 'sapin' : 'meleze', x, z, 3.5);
        else if (r < 0.034 && h > WL + 30) flower(r < 0.031 ? 'gentiane' : 'rhododendron', x, z);
        continue;
      }
      if (r < 0.026) tree(moist > 0.2 ? 'aulne' : pickOf(['hetre', 'hetre', 'chataignier', 'noyer', 'erable', 'hetre', 'chataignier']), x, z, 5);
      else if (r < 0.032) flower('houx', x, z);
      else if (r < 0.075) flower('jacinthe', x, z);
      else if (r < 0.085 && f < 0.4) flower('digitale', x, z);
      else if (r < 0.092 && f < 0.33) flower(r < 0.088 ? 'sureau' : 'eglantier', x, z);
      continue;
    }
    // montagne sans forêt
    if (h > WL + 38) {
      if (r < 0.012) flower('gentiane', x, z);
      else if (r < 0.018) flower('rhododendron', x, z);
      else if (r < 0.021 && h > WL + 60) flower('edelweiss', x, z);
      else if (r < 0.026 && h < snow - 6) tree(r < 0.024 ? 'meleze' : 'sapin', x, z, 4);
      continue;
    }
    // lande
    if (moist < -0.22 && (m === M_DRY || m === M_FLOWERS)) {
      if (r < 0.02) flower('chardon', x, z);
      else if (r < 0.032) flower('achillee', x, z);
      else if (r < 0.04) flower('campanule', x, z);
      else if (r < 0.0425) flower('orchidee', x, z);
      else if (r < 0.046) flower('eglantier', x, z);
      continue;
    }
    // prés
    if (r < 0.0025) tree(pickOf(FRUIT), x, z, 6);
    else if (r < 0.0035) tree(r < 0.003 ? 'tilleul' : 'erable', x, z, 7);
    else if (m === M_FLOWERS && r < 0.05) flower(r < 0.03 ? pickOf(LOW) : pickOf(['lupin', 'lupin2', 'mauve', 'campanule', 'achillee']), x, z);
    else if (r < 0.014) flower(pickOf(LOW), x, z);
    else if (r < 0.0152) flower(r < 0.0146 ? 'sureau' : 'eglantier', x, z);
    else if (r < 0.0156) flower('orchidee', x, z);
  }
  // ifs près de l'église, du cimetière, de la chapelle
  for (const key of ['eglise', 'cimetiere', 'chapelle']) {
    const L = w.lm[key];
    if (!L) continue;
    for (let k = 0, t = 0; k < 3 && t < 60; t++) {
      const a = rnd() * TAU, d = (L.r || 10) + 3 + rnd() * 10, x = L.x + Math.cos(a) * d, z = L.z + Math.sin(a) * d;
      if (free(x, z) && H(x, z) > WL + 0.6 && tree('if', x, z, 5)) k++;
    }
  }
  // la vallée dessinée : peupliers le long des grandes routes, vergers, vieux arbres foudroyés
  if (D && D.P) {
    for (const R of D.P.roads) {
      if (R.w < 1.35) continue;
      for (let i = 1; i < R.pts.length; i++) {
        const [ax, az] = R.pts[i - 1], [bx, bz] = R.pts[i], L = Math.hypot(bx - ax, bz - az), nx = -(bz - az) / L, nz = (bx - ax) / L;
        for (let d = 8; d < L - 4; d += 15) for (const s of [-1, 1]) {
          if (rnd() < 0.35) continue;
          const x = ax + (bx - ax) * d / L + nx * s * 5.5, z = az + (bz - az) * d / L + nz * s * 5.5;
          if (free(x, z) && H(x, z) > WL + 0.8) tree('peuplier', x, z, 6);
        }
      }
    }
    const orchard = (cx, cz, nx, nz, sp, kinds) => { for (let a = 0; a < nx; a++) for (let b = 0; b < nz; b++) { const x = cx + a * sp + (rnd() - 0.5), z = cz + b * sp + (rnd() - 0.5); if (free(x, z) && H(x, z) > WL + 0.8) tree(kinds[(a + b) % kinds.length], x, z, sp * 0.6); } };
    const hm = D.P.sites.hamlet, gh = D.P.sites.ghostHamlet;
    orchard(hm.x - 70, hm.z + 34, 4, 3, 8, ['cerisier', 'poirier', 'prunier']);
    orchard(gh.x + 28, gh.z - 30, 3, 2, 8, ['poirier', 'prunier']);
    for (let k = 0, t = 0; k < 4 && t < 400; t++) {
      const x = 200 + rnd() * (S - 400), z = 900 + rnd() * (S - 1100), h = H(x, z);
      if (h > WL + 16 && h < snow - 10 && free(x, z) && tree('foudroye', x, z, 5)) k++;
    }
  }
  w.objectsDirty = true; w.grid = null;
}
