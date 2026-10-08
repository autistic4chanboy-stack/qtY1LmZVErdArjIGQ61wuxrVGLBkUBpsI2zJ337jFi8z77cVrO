// ============================================================================
//  LES GOBELINS (agent X) : la passe de génération.
//  Elle tourne après toutes les autres de la vallée (R, T, puis U, V1…V5 : X
//  vient après dans l'ordre des noms), avec son propre tirage, et n'AJOUTE qu'au
//  bout des listes (w.props, w.inter, w.blocks) : rien de ce qui est posé avant
//  ne bouge (empreintes EMPREINTE_1234, N_C3 ; les trouvailles de R, w.ramasse,
//  restent où elles sont : on ne touche ni au relief ni aux sols, et l'on ne pose
//  rien sur elles).
//  - la vieille souche : un chêne mort au fond des bois du sud, loin des chemins,
//    des lieux-dits et des maisons ; une racine polie à son pied ; et le panneau
//    (une vieille porte bleue à demi enterrée) qu'on ne voit qu'une fois la racine
//    tirée ;
//  - les terriers : près des maisons (Valbrume, dans ses murs ; Clairpré ; la
//    ferme ; les Planches ; la cabane du pêcheur ; les Sources ; le bois de
//    l'ouest). Celui de la ferme est le bout du raccourci ;
//  - les pierres griffées (trois entailles et un rond) : une près de chaque
//    terrier, et une file, de loin en loin, de la souche vers la ferme ;
//  - la Gobelinière : une grande salle creusée sous la terre (sous les bois,
//    près de la souche, si l'on peut ; sinon dans un coin perdu des monts), la
//    chambre des racines où l'on arrive, le boyau bas où l'on passe accroupi, les
//    cahutes et leurs nids, six tas et le grand tas, l'étal des prises, les
//    chandelles, la marmite, le siège de la vieille, ce qui raconte (berceau,
//    clés, horloges sans aiguilles, cloche pleine d'alliances, souliers, miroir
//    retourné, lettres), et à l'est le boyau du raccourci, fermé par une barre.
//  w.gobelins = { souche, racine, trappe, terriers, marques, village, ms }
// ============================================================================
LIEU_NAMES.gob_souche = 'la vieille souche';
LIEU_NAMES.gobeliniere = 'la Gobelinière';

const GOB_GEN = {
  graine: 0x0b1e7a9,
  souche: { x: 1640, z: 2590, R: 280 },        // on la cherche autour : les bois du sud
  terriers: [
    { cle: 'valbrume', x: 1532, z: 1636, R: 14, ville: true },
    { cle: 'clairpre', x: 2004, z: 2092, R: 20 },
    { cle: 'ferme', x: 1474, z: 2196, R: 30, raccourci: true },
    { cle: 'planches', x: 992, z: 2102, R: 22 },
    { cle: 'pecheur', x: 1128, z: 1986, R: 20 },
    { cle: 'sources', x: 2304, z: 2428, R: 24 },
    { cle: 'bois', x: 1078, z: 1416, R: 34 },
  ],
  salle: { W: 40, D: 30, H: 6.5, prof: 22, Lt: 7, Lc: 4.2, Ls: 6, zs: 9 },
};

function gobGenerer(w, seed) {
  const t0 = Date.now();
  const rnd = mulberry32(((seed | 0) ^ GOB_GEN.graine) >>> 0);
  const B = new Builder(w, rnd, new Uint8Array(1));
  const WL = w.waterLevel, H = (x, z) => w.heightAt(x, z);
  const G = { v: 1, terriers: [], marques: [], ms: 0 };
  // ------------------------------------------------ ce qui est déjà là (grilles de 8 m)
  const grille = (L, fx) => { const M = new Map(); L.forEach((o, i) => { const p = fx(o); if (!p) return; const k = Math.floor(p[0] / 8) * 4096 + Math.floor(p[1] / 8); if (!M.has(k)) M.set(k, []); M.get(k).push(p); }); return M; };
  const pres = (M, x, z, r) => { for (let i = Math.floor((x - r) / 8); i <= Math.floor((x + r) / 8); i++) for (let j = Math.floor((z - r) / 8); j <= Math.floor((z + r) / 8); j++) { const A = M.get(i * 4096 + j); if (A) for (const p of A) if (Math.hypot(p[0] - x, p[1] - z) < r && (p[2] === undefined || Math.abs(p[2] - H(x, z)) < 4)) return true; } return false; };
  const Gp = grille(w.props, (q) => (q && !q.gone ? [q.x, q.z, q.y] : null));
  const Gi = grille(w.inter || [], (it) => [it.x, it.z, it.y]);
  const Gr = grille((w.ramasse && w.ramasse.L) || [], (o) => [o.x, o.z, o.y]);
  const arbres = new Map();
  w.objects.forEach((o) => { const T = OBJ_TYPES[o.t]; if (!T || T.cat !== 'Arbres' || o.gone) return; const k = Math.floor(o.x / 8) * 4096 + Math.floor(o.z / 8); if (!arbres.has(k)) arbres.set(k, []); arbres.get(k).push(o); });
  const nbArbres = (x, z, r) => { let n = 0; for (let i = Math.floor((x - r) / 8); i <= Math.floor((x + r) / 8); i++) for (let j = Math.floor((z - r) / 8); j <= Math.floor((z + r) / 8); j++) { const A = arbres.get(i * 4096 + j); if (A) for (const o of A) if (Math.hypot(o.x - x, o.z - z) < r) n++; } return n; };
  const arbreProche = (x, z, r) => { let best = null, bd = r; for (let i = Math.floor((x - r) / 8); i <= Math.floor((x + r) / 8); i++) for (let j = Math.floor((z - r) / 8); j <= Math.floor((z + r) / 8); j++) { const A = arbres.get(i * 4096 + j); if (A) for (const o of A) { const d = Math.hypot(o.x - x, o.z - z); if (d < bd) { bd = d; best = o; } } } return best; };
  const biome = (x, z) => (w.biome && typeof BIOMES !== 'undefined' ? BIOMES[w.biome[clamp(Math.floor(z / 8), 0, w.biomeW - 1) * w.biomeW + clamp(Math.floor(x / 8), 0, w.biomeW - 1)]] : '');
  const N = w.nav || { nodes: [], edges: [] };
  // les chemins des habitants (segments du graphe), et les blocs de surface : par cases de 32 m
  const C32 = (x, z) => Math.floor(x / 32) * 4096 + Math.floor(z / 32);
  const Gs = new Map(), Gb = new Map();
  for (const [a, b] of N.edges || []) {
    const A = N.nodes[a], Bn = N.nodes[b];
    if (!A || !Bn || A.iso || Bn.iso || Math.hypot(A.x - Bn.x, A.z - Bn.z) > 400) continue;
    for (let i = Math.floor(Math.min(A.x, Bn.x) / 32); i <= Math.floor(Math.max(A.x, Bn.x) / 32); i++) for (let j = Math.floor(Math.min(A.z, Bn.z) / 32); j <= Math.floor(Math.max(A.z, Bn.z) / 32); j++) { const k = i * 4096 + j; if (!Gs.has(k)) Gs.set(k, []); Gs.get(k).push([A, Bn]); }
  }
  for (const b of w.blocks) {
    if (b.under || b.ver) continue;
    const rb = Math.hypot(b.sx, b.sz) / 2;
    for (let i = Math.floor((b.x - rb) / 32); i <= Math.floor((b.x + rb) / 32); i++) for (let j = Math.floor((b.z - rb) / 32); j <= Math.floor((b.z + rb) / 32); j++) { const k = i * 4096 + j; if (!Gb.has(k)) Gb.set(k, []); Gb.get(k).push(b); }
  }
  const autour = (M, x, z, r, fn) => { for (let i = Math.floor((x - r) / 32); i <= Math.floor((x + r) / 32); i++) for (let j = Math.floor((z - r) / 32); j <= Math.floor((z + r) / 32); j++) { const A = M.get(i * 4096 + j); if (A) for (const v of A) if (fn(v)) return true; } return false; };
  const distChemin = (x, z, max) => {
    let d = max;
    autour(Gs, x, z, max, ([A, Bn]) => {
      const dx = Bn.x - A.x, dz = Bn.z - A.z, L2 = dx * dx + dz * dz || 1, t = clamp(((x - A.x) * dx + (z - A.z) * dz) / L2, 0, 1);
      d = Math.min(d, Math.hypot(x - A.x - dx * t, z - A.z - dz * t));
      return false;
    });
    return d;
  };
  const blocProche = (x, z, r) => autour(Gb, x, z, r + 12, (b) => Math.hypot(b.x - x, b.z - z) - Math.hypot(b.sx, b.sz) / 2 < r);
  // un endroit libre : au sec, pas trop pentu, sans mur, sans objet posé, sans interaction, sans trouvaille de R
  const libre = (x, z, r, o) => {
    o = o || {};
    if (!w.inside(x, z, 20)) return false;
    const h = H(x, z);
    if (h < WL + (o.sec ?? 0.5)) return false;
    if (w.normalAt(x, z)[1] < (o.pente ?? 0.86)) return false;
    if (!pointFree(w, x, z, r)) return false;
    if (pres(Gp, x, z, r + 0.9) || pres(Gi, x, z, r + 1.3) || pres(Gr, x, z, r + 1.2)) return false;
    if (o.pave !== true && w.matAt(x, z) === M_COBBLE) return false;
    return true;
  };
  const chercher = (cx, cz, R, n, score, ok) => {
    let best = null, bs = -1e9;
    for (let k = 0; k < n; k++) {
      const a = rnd() * TAU, d = Math.sqrt(rnd()) * R, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
      if (!ok(x, z)) continue;
      const s = score(x, z, d);
      if (s > bs) { bs = s; best = { x, z }; }
    }
    return best;
  };
  const noter = (M, x, z, y) => { const k = Math.floor(x / 8) * 4096 + Math.floor(z / 8); if (!M.has(k)) M.set(k, []); M.get(k).push([x, z, y]); };
  const poser = (id, x, z, r, data, s) => { const y = H(x, z); const q = B.prop(id, x, y, z, r, data, s); noter(Gp, x, z, y); return q; };
  const inter = (kind, id, x, y, z, name, data) => { const it = B.inter(kind, id, x, y, z, name, data); noter(Gi, x, z, y); return it; };

  // ================================================ la vieille souche
  const lms = Object.values(w.lm || {}).filter((L) => !L.under && (L.r || 0) < 60);
  const blds = Object.values(w.bld || {}).filter((b) => !b.under);
  const S0 = GOB_GEN.souche;
  const site = chercher(S0.x, S0.z, S0.R, 900, (x, z, d) => nbArbres(x, z, 14) - d / 55, (x, z) => {
    const bi = biome(x, z);
    if (bi && bi !== 'foret' && bi !== 'bouleaux') return false;
    if (!libre(x, z, 2.8, { sec: 1.2, pente: 0.9 })) return false;
    if (lms.some((L) => Math.hypot(L.x - x, L.z - z) < 70) || blds.some((b) => Math.hypot(b.x - x, b.z - z) < 60)) return false;
    if (blocProche(x, z, 40)) return false;
    if (nbArbres(x, z, 14) < 6) return false;
    return distChemin(x, z, 46) >= 45;
  }) || chercher(S0.x, S0.z, S0.R * 1.6, 1200, (x, z, d) => nbArbres(x, z, 14) - d / 40, (x, z) => libre(x, z, 2.8, { sec: 1.0, pente: 0.88 }) && !blocProche(x, z, 30) && distChemin(x, z, 31) >= 30);
  if (!site) return null;
  const sx = site.x, sz = site.z, sy = H(sx, sz), sr = rnd() * TAU;
  const qSouche = B.prop('gob_souche', sx, sy - 0.05, sz, sr);
  noter(Gp, sx, sz, sy);
  inter('gob_souche', 'gob_souche', sx, sy + 1.0, sz, 'La vieille souche', {});
  // devant : la racine polie, puis le panneau
  const fx = Math.sin(sr), fz = Math.cos(sr), rx = Math.cos(sr), rz = -Math.sin(sr);
  const [ax, az] = [sx + fx * 1.35 + rx * 0.35, sz + fz * 1.35 + rz * 0.35];
  const qRacine = B.prop('gob_racine', ax, H(ax, az) - 0.02, az, sr + Math.PI / 2, {});
  inter('gob_racine', 'gob_racine', ax, H(ax, az) + 0.22, az, 'Une racine', {});
  const [tx0, tz0] = [sx + fx * 2.15 - rx * 0.35, sz + fz * 2.15 - rz * 0.35];
  const qTrappe = B.prop('gob_trappe', tx0, H(tx0, tz0) + 0.01, tz0, sr, { cachee: true });
  inter('gob_trappe', 'gob_trappe', tx0, H(tx0, tz0) + 0.3, tz0, 'Le panneau', {});
  B.landmark('gob_souche', sx, sz, 7, { secret: true });
  G.souche = { x: sx, y: sy, z: sz, r: sr, q: qSouche };
  G.racine = { x: ax, y: H(ax, az), z: az, q: qRacine };
  G.trappe = { x: tx0, y: H(tx0, tz0), z: tz0, q: qTrappe, sortie: [sx + fx * 3.2, H(sx + fx * 3.2, sz + fz * 3.2) + 0.05, sz + fz * 3.2] };

  // ================================================ les terriers (et leur pierre griffée)
  const ville = w.townInfo || { x: 1572, z: 1600 };
  for (const T of GOB_GEN.terriers) {
    const p = chercher(T.x, T.z, T.R, 500, (x, z, d) => -d + (T.ville ? 0 : nbArbres(x, z, 6) * 1.5) - (distChemin(x, z, 8) < 3 ? 20 : 0), (x, z) => {
      if (T.ville && (Math.abs(x - ville.x) > 42 || Math.abs(z - ville.z) > 42)) return false;
      if (!T.ville && Math.abs(x - ville.x) < 60 && Math.abs(z - ville.z) < 60) return false;
      if (!libre(x, z, T.ville ? 1.1 : 1.4, { sec: 0.6, pente: 0.85 })) return false;
      return libre(x + 1.4, z + 0.6, 0.5, { sec: 0.5, pente: 0.8 });
    });
    if (!p) continue;
    const y = H(p.x, p.z), r = rnd() * TAU;
    const q = poser('gob_terrier', p.x, p.z, r, {});
    inter('gob_terrier', 'gob_terrier_' + T.cle, p.x, y + 0.3, p.z, 'Un trou', { cle: T.cle });
    const E = { cle: T.cle, x: p.x, y, z: p.z, r, q, raccourci: !!T.raccourci, ville: !!T.ville };
    G.terriers.push(E);
    // la pierre griffée, tout près
    for (let k = 0; k < 12; k++) {
      const a = rnd() * TAU, dm = 2.0 + rnd() * 0.8, mx = p.x + Math.cos(a) * dm, mz = p.z + Math.sin(a) * dm;
      if (!libre(mx, mz, 0.4, { sec: 0.5, pente: 0.8, pave: T.ville })) continue;
      const qm = poser('gob_marque', mx, mz, rnd() * TAU, {});
      inter('gob_marque', 'gob_marque_' + T.cle, mx, H(mx, mz) + 0.2, mz, 'Une pierre', { cle: T.cle });
      G.marques.push({ x: mx, y: H(mx, mz), z: mz, q: qm, cle: T.cle });
      break;
    }
  }
  // ================================================ la file de pierres griffées, de la souche vers le terrier de la ferme
  const TF = G.terriers.find((t) => t.raccourci) || G.terriers[0];
  if (TF) {
    const L = Math.hypot(TF.x - sx, TF.z - sz), n = Math.floor((L - 60) / 64);
    for (let i = 1; i <= n; i++) {
      const t = (30 + i * 64) / L, ix = sx + (TF.x - sx) * t, iz = sz + (TF.z - sz) * t;
      let pos = null;
      const tr = arbreProche(ix, iz, 7);
      if (tr) for (let k = 0; k < 6 && !pos; k++) { const a = rnd() * TAU, mx = tr.x + Math.cos(a) * 0.9, mz = tr.z + Math.sin(a) * 0.9; if (libre(mx, mz, 0.35, { sec: 0.5, pente: 0.8 })) pos = [mx, mz]; }
      if (!pos) { const p2 = chercher(ix, iz, 6, 60, (x, z, d) => -d, (x, z) => libre(x, z, 0.4, { sec: 0.5, pente: 0.82 })); if (p2) pos = [p2.x, p2.z]; }
      if (!pos) continue;
      const qm = poser('gob_marque', pos[0], pos[1], rnd() * TAU, {});
      inter('gob_marque', 'gob_marque_file' + i, pos[0], H(pos[0], pos[1]) + 0.2, pos[1], 'Une pierre', { file: i });
      G.marques.push({ x: pos[0], y: H(pos[0], pos[1]), z: pos[1], q: qm, file: i });
    }
  }

  // ================================================ la Gobelinière
  const V = gobSalle(w, B, rnd, sx, sz);
  if (V) G.village = V;
  G.ms = Date.now() - t0;
  w.grid = null;
  return G;
}

// ---------------------------------------------------------------- la salle sous la terre
function gobSalle(w, B, rnd, sx, sz) {
  const C = GOB_GEN.salle, W = C.W, D = C.D, Hh = C.H, Lt = C.Lt, Lc = C.Lc, Ls = C.Ls, zs = C.zs;
  // l'emprise (repère de la salle) : la chambre des racines et le boyau à l'ouest, le boyau du raccourci à l'est
  const xa = -W / 2 - 0.5 - Lt - Lc - 0.6, xb = W / 2 + 0.5 + Ls + 3.4, za = -D / 2 - 0.6, zb = D / 2 + 0.6;
  const ux = -(W / 2 + 0.5 + Lt + Lc / 2);      // la chambre des racines, sous la souche
  // les blocs, par cases de 64 m (pour essayer vite beaucoup d'endroits)
  const BG = new Map();
  for (const b of w.blocks) {
    const rb = Math.hypot(b.sx, b.sz) / 2 + 14;
    for (let i = Math.floor((b.x - rb) / 64); i <= Math.floor((b.x + rb) / 64); i++) for (let j = Math.floor((b.z - rb) / 64); j <= Math.floor((b.z + rb) / 64); j++) {
      const k = i * 4096 + j; if (!BG.has(k)) BG.set(k, []); BG.get(k).push(b);
    }
  }
  const essai = (cx, cz) => {
    if (!w.inside(cx + xa, cz + za, 10) || !w.inside(cx + xb, cz + zb, 10)) return null;
    for (let i = Math.floor((cx + xa) / 64); i <= Math.floor((cx + xb) / 64); i++) for (let j = Math.floor((cz + za) / 64); j <= Math.floor((cz + zb) / 64); j++) {
      for (const b of BG.get(i * 4096 + j) || []) {
        const rb = Math.hypot(b.sx, b.sz) / 2 + 14;
        if (b.x + rb < cx + xa || b.x - rb > cx + xb || b.z + rb < cz + za || b.z - rb > cz + zb) continue;
        return null; // (un bâtiment au-dessus, ou une autre salle : la carte des abris ne garde qu'un plafond par case)
      }
    }
    let hmin = 1e9;
    for (let x = xa; x <= xb; x += 3) for (let z = za; z <= zb; z += 3) hmin = Math.min(hmin, w.heightAt(cx + x, cz + z));
    return hmin;
  };
  let cx = 0, cz = 0, hmin = null;
  for (const d of [0, 25, 50, 80, 120, 170]) {
    for (let k = 0; k < (d ? 12 : 1) && hmin === null; k++) {
      const a = k * TAU / 12;
      const x = sx - ux + Math.cos(a) * d, z = sz + Math.sin(a) * d;
      const h = essai(x, z);
      if (h !== null) { cx = x; cz = z; hmin = h; }
    }
    if (hmin !== null) break;
  }
  if (hmin === null) { // un coin perdu des monts
    let bd = 1e9;
    for (let x = 150; x < w.size - 150; x += 60) for (let z = 150; z < w.size - 150; z += 60) {
      const d = Math.hypot(x - sx, z - sz);
      if (d > bd) continue;
      const h = essai(x, z);
      if (h !== null) { bd = d; cx = x; cz = z; hmin = h; }
    }
  }
  if (hmin === null) return null;
  const y0 = hmin - C.prof;
  const f = { x: cx, y: y0, z: cz, r: 0 };
  const n0 = w.blocks.length;
  const blk = (lx, ly, lz, sx2, sy2, sz2, m, plafond) => { B.block(f, lx, ly, lz, sx2, sy2, sz2, m); const b = w.blocks[w.blocks.length - 1]; b.under = true; if (plafond) b.ceil = true; return b; };
  const sol = typeof M_SARGILE !== 'undefined' ? M_SARGILE : M_DIRT, paroi = typeof M_SHUMUS !== 'undefined' ? M_SHUMUS : M_ROCK, roche = typeof M_SROCHE !== 'undefined' ? M_SROCHE : M_ROCK;
  const t = 0.5, hb = 1.3; // l'épaisseur des parois ; la hauteur des boyaux (on y passe accroupi)
  // ---- la grande salle
  blk(0, -0.6, 0, W + 2 * t, 0.6, D + 2 * t, sol);
  blk(0, Hh, 0, W + 2 * t, 0.8, D + 2 * t, paroi, true);
  blk(0, 0, -D / 2 - t / 2, W + 2 * t, Hh, t, paroi);
  blk(0, 0, D / 2 + t / 2, W + 2 * t, Hh, t, paroi);
  const mur = (xw, z1, z2, ouv) => { // un mur nord-sud percé d'une ouverture basse [ouv - 0,7 ; ouv + 0,7]
    const a = ouv - 0.7, b2 = ouv + 0.7;
    if (a > z1) blk(xw, 0, (z1 + a) / 2, t, Hh, a - z1, paroi);
    if (b2 < z2) blk(xw, 0, (b2 + z2) / 2, t, Hh, z2 - b2, paroi);
    blk(xw, hb, ouv, t, Hh - hb, 1.4, paroi);
  };
  mur(-W / 2 - t / 2, -D / 2, D / 2, 0);
  mur(W / 2 + t / 2, -D / 2, D / 2, zs);
  // ---- le boyau d'entrée (bas : 1,3 m)
  const bx0 = -W / 2 - t, bxc = bx0 - Lt / 2;
  blk(bxc, -0.6, 0, Lt, 0.6, 2.4, sol); blk(bxc, hb, 0, Lt, 0.8, 2.4, paroi, true);
  blk(bxc, 0, -0.95, Lt, hb, t, paroi); blk(bxc, 0, 0.95, Lt, hb, t, paroi);
  // ---- la chambre des racines (on y arrive par le panneau)
  const cx0 = bx0 - Lt, ccx = cx0 - Lc / 2, Hc = 2.5;
  blk(ccx, -0.6, 0, Lc + 2 * t, 0.6, 4 + 2 * t, sol); blk(ccx, Hc, 0, Lc + 2 * t, 0.8, 4 + 2 * t, paroi, true);
  blk(ccx, 0, -2 - t / 2, Lc + 2 * t, Hc, t, paroi); blk(ccx, 0, 2 + t / 2, Lc + 2 * t, Hc, t, paroi);
  blk(cx0 - Lc - t / 2, 0, 0, t, Hc, 4, paroi);
  blk(cx0 + t / 2, 0, -1.35, t, Hc, 1.3, paroi); blk(cx0 + t / 2, 0, 1.35, t, Hc, 1.3, paroi); blk(cx0 + t / 2, hb, 0, t, Hc - hb, 1.4, paroi);
  // ---- le boyau du raccourci (à l'est), et sa petite chambre, fermée par un panneau barré
  const ex0 = W / 2 + t, exc = ex0 + Ls / 2;
  blk(exc, -0.6, zs, Ls, 0.6, 2.4, sol); blk(exc, hb, zs, Ls, 0.8, 2.4, paroi, true);
  blk(exc, 0, zs - 0.95, Ls, hb, t, paroi); blk(exc, 0, zs + 0.95, Ls, hb, t, paroi);
  const kx0 = ex0 + Ls, kxc = kx0 + 1.4, Hk = 2.2;
  blk(kxc, -0.6, zs, 2.8 + 2 * t, 0.6, 3 + 2 * t, sol); blk(kxc, Hk, zs, 2.8 + 2 * t, 0.8, 3 + 2 * t, paroi, true);
  blk(kxc, 0, zs - 1.5 - t / 2, 2.8 + 2 * t, Hk, t, paroi); blk(kxc, 0, zs + 1.5 + t / 2, 2.8 + 2 * t, Hk, t, paroi);
  blk(kx0 + 2.8 + t / 2, 0, zs, t, Hk, 3, paroi);
  blk(kx0 - t / 2, 0, zs - 1.1, t, Hk, 0.8, paroi); blk(kx0 - t / 2, 0, zs + 1.1, t, Hk, 0.8, paroi); blk(kx0 - t / 2, hb, zs, t, Hk - hb, 1.4, paroi);
  // ---- deux piliers de roche, des bosses au sol
  blk(-6, 0, 7, 1.8, Hh, 1.5, roche); blk(12, 0, -5.5, 1.5, Hh, 1.7, roche);
  blk(-16, 0, -3, 2.6, 0.35, 3.2, sol); blk(3, 0, 8.5, 3.0, 0.25, 2.2, sol);
  const P = (id, lx, ly, lz, rr, data, s) => B.propRel(f, id, lx, ly, lz, rr || 0, data, s);
  const I = (kind, id, lx, ly, lz, name, data) => B.interRel(f, kind, id, lx, ly, lz, name, data);
  const W2 = (lx, lz) => B.toWorld(f, lx, lz);
  // ---- les parois ne sont pas droites : des rochers tout du long ; des stalactites, des racines au plafond
  // (les places prises le long des parois : les deux boyaux, les horloges, les clés, le miroir, les lettres, la cloche, le berceau, les cahutes)
  const pris = [[-W / 2, 0, 3], [W / 2, zs, 3], [5, -D / 2, 2.2], [-W / 2, -7, 1.6], [-6.5, D / 2, 1.5], [2.5, D / 2, 1.5], [10.5, D / 2, 1.5], [W / 2, -3, 1.5]];
  const hutsN = [-15, -8, 0, 13], hutsS = [-11, -2, 6];
  for (const x of hutsN) pris.push([x, -D / 2, 1.8]);
  for (const x of hutsS) pris.push([x, D / 2, 1.8]);
  const occupe = (lx, lz) => pris.some(([x, z, r]) => Math.abs(lx - x) < r + 1.0 && Math.abs(lz - z) < r + 1.0);
  for (let lx = -W / 2 + 1.5; lx <= W / 2 - 1.5; lx += 3.2 + rnd() * 1.5) for (const s of [-1, 1]) { const lz = s * (D / 2 - 0.55); if (!occupe(lx, lz)) P('gob_rocher', lx, -0.1, lz, rnd() * TAU, null, 0.75 + rnd() * 0.6); }
  for (let lz = -D / 2 + 2; lz <= D / 2 - 2; lz += 3.4 + rnd() * 1.4) for (const s of [-1, 1]) { const lx = s * (W / 2 - 0.55); if (!occupe(lx, lz)) P('gob_rocher', lx, -0.1, lz, rnd() * TAU, null, 0.75 + rnd() * 0.6); }
  for (let k = 0; k < 26; k++) P('gob_stalactite', (rnd() - 0.5) * (W - 3), Hh, (rnd() - 0.5) * (D - 3), rnd() * TAU, null, 0.8 + rnd() * 0.7);
  // ---- la chambre des racines : les racines qui pendent (on y remonte), une chandelle
  P('gob_racines', ccx, 0, 0, Math.PI / 2);
  P('gob_chandelles', ccx + 1.2, 0, -1.4, 0, null);
  I('gob_remonter', 'gob_remonter', ccx - 0.6, 1.2, 0.2, 'Les racines', {});
  // ---- les cahutes, et un nid dans chacune
  const nids = [], cahutes = [];
  const cahute = (lx, lz, rr, v) => {
    const q = P('gob_cahute', lx, 0, lz, rr, null);
    q.v = v;
    const hf = { x: W2(lx, lz)[0], y: y0, z: W2(lx, lz)[1], r: rr };
    const [nx, nz] = B.toWorld(hf, 0.1, -1.6); // (ils dorment devant leur cahute, en rond, comme des chiens)
    B.prop('gob_nid', nx, y0, nz, rr + rnd());
    nids.push({ x: nx, y: y0, z: nz, r: rr });
    cahutes.push({ x: hf.x, z: hf.z, r: rr, q });
  };
  hutsN.forEach((x, i) => cahute(x, -D / 2 + 1.75, Math.PI, i));
  hutsS.forEach((x, i) => cahute(x, D / 2 - 1.75, 0, i + 4));
  for (const [lx, lz] of [[-2, 5.2], [2.4, 5.8]]) { const [nx, nz] = W2(lx, lz); B.prop('gob_nid', nx, y0, nz, rnd() * TAU); nids.push({ x: nx, y: y0, z: nz, r: rnd() * TAU }); }
  // ---- les tas
  const tas = [];
  [[-13, -6], [-15, 6.5], [-3, -9], [5, -9.5], [16, -9], [15.5, 6.5]].forEach(([lx, lz], i) => {
    const q = P('gob_tas', lx, 0, lz, rnd() * TAU, { n: 0 }, 1.45);
    q.v = i;
    for (let k = 0; k < 2; k++) { const a = rnd() * TAU; P('gob_eparpille', lx + Math.cos(a) * 1.9, 0, lz + Math.sin(a) * 1.9, rnd() * TAU); }
    const [x, z] = W2(lx, lz);
    I('gob_tas', 'gob_tas_' + i, lx, 0.6, lz, 'Un tas', { i });
    tas.push({ x, y: y0, z, q, i });
  });
  // ---- le grand tas, le siège de la vieille
  const GX = 8, GZ = 1;
  const qG = P('gob_grand_tas', GX, 0, GZ, 0, { n: 0 });
  for (const [ex2, ez2] of [[-3.0, -1.5], [-3.2, 2.4], [0.4, -2.6], [2.8, 2.6], [3.3, -1.0]]) P('gob_eparpille', GX + ex2, 0, GZ + ez2, rnd() * TAU);
  const [gx, gz] = W2(GX, GZ);
  I('gob_grand', 'gob_grand_tas', GX - 2.6, 0.75, GZ - 0.6, 'Le grand tas', {});
  const qS = P('gob_siege', GX - 1.45, 0.98, GZ + 0.35, -Math.PI / 2);
  const [qsx, qsz] = W2(GX - 1.45, GZ + 0.35);
  const siege = { x: qsx, y: y0 + 0.98 + 0.3, z: qsz, r: -Math.PI / 2, q: qS };
  // ---- l'étal des prises, la marmite, les chandelles
  const qE = P('gob_etal', -6, 0, -2, 0, { items: [] });
  const [ex, ez] = W2(-6, -2);
  I('gob_etal', 'gob_etal', -6, 0.9, -1.4, 'L’étal', {});
  const qM = P('gob_marmite', -1, 0, 3.5, 0);
  const chandelles = [];
  for (const [lx, lz] of [[-18.5, 1.8], [-10.5, -4.8], [-12.6, 8.2], [-4.2, -11.2], [3.5, -11.4], [9.2, -2.2], [5.8, 3.8], [17.6, -6.4], [14.2, 9.6], [-7.6, -0.6], [0.6, 11.6], [17.2, -1.2], [-13.4, -12.0], [-6.4, -12.0], [14.6, -12.0], [-9.4, 12.0], [7.6, 12.0]]) {
    const q = P('gob_chandelles', lx, 0, lz, rnd() * TAU, null); q.v = (rnd() * 4) | 0; chandelles.push(q);
  }
  // ---- ce qui raconte
  const lire = [];
  const objet = (id, cle, lx, ly, lz, rr, ix, iz) => { const q = P(id, lx, ly, lz, rr, null); I('gob_lire', 'gob_lire_' + cle, ix ?? lx, 1.0, iz ?? lz, GOB_T.objets[cle][0], { cle }); lire.push({ cle, q }); return q; };
  objet('gob_berceau', 'berceau', 18, 0, -3, -Math.PI / 2, 17.2, -3);
  objet('gob_cloche', 'cloche', 10.5, 0, 12.4, 0, 10.5, 11.8);
  objet('gob_horloges', 'horloges', 5, 0, -D / 2 + 0.35, 0, 5, -D / 2 + 1.3);
  objet('gob_cles', 'cles', -W / 2 + 0.3, 0, -7, Math.PI / 2, -W / 2 + 1.2, -7);
  objet('gob_souliers', 'souliers', -17, 0, -11, 0, -16.4, -10.4);
  objet('gob_miroir', 'miroir', -6.5, 0, D / 2 - 0.35, 0, -6.5, D / 2 - 1.2);
  objet('gob_lettres', 'lettres', 2.5, 0, 12.2, 0.3, 2.5, 11.5);
  // ---- le panneau barré du raccourci
  const qP = P('gob_panneau', kx0 + 2.8 - 0.08, 0, zs, -Math.PI / 2, { ouvert: false });
  I('gob_raccourci', 'gob_raccourci', kx0 + 2.1, 0.8, zs, 'Le panneau', {});
  // ---- où l'on arrive ; où ils vont ; les parois où ils entrent quand on les surprend
  const [ax, az] = W2(ccx + 0.6, 0.6), [rx2, rz2] = W2(kxc - 0.3, zs);
  const lieux = [[-6, -0.6], [-1, 2.2], [-11, -3.4], [-12.4, 4.2], [-2, -7], [3.6, -7.6], [13.8, -7.2], [13.4, 4.8], [4.6, 1.2], [9.5, 9.5], [-9, 10]].map(([lx, lz]) => { const [x, z] = W2(lx, lz); return { x, z }; });
  const murs = [];
  for (let lx = -W / 2 + 2; lx <= W / 2 - 2; lx += 2.5) for (const s of [-1, 1]) { const [x, z] = W2(lx, s * (D / 2 + 0.6)); murs.push({ x, z, nx: 0, nz: s }); }
  for (let lz = -D / 2 + 2; lz <= D / 2 - 2; lz += 2.5) for (const s of [-1, 1]) { if (Math.abs(lz - (s < 0 ? 0 : zs)) < 1.5) continue; const [x, z] = W2(s * (W / 2 + 0.6), lz); murs.push({ x, z, nx: s, nz: 0 }); }
  B.landmark('gobeliniere', cx, cz, 24, { under: true, secret: true, y: y0 });
  for (let k = n0; k < w.blocks.length; k++) w.blocks[k].under = true;
  return {
    f, x: cx, y: y0, z: cz, W, D, H: Hh, arrivee: [ax, y0 + 0.05, az], raccourciArrivee: [rx2, y0 + 0.05, rz2],
    grand: { x: gx, y: y0, z: gz, q: qG }, siege, tas, etal: { x: ex, y: y0, z: ez, q: qE }, marmite: qM, chandelles, nids, cahutes, lire,
    panneau: { q: qP }, lieux, murs, boyau: { a: W2(bx0 - Lt, 0), b: W2(bx0, 0) },
  };
}

// la passe (après toutes les autres de la vallée)
{
  const _gv = generateValley;
  generateValley = async function (seed, progress, gen) {
    const w = await _gv(seed, progress, gen);
    if (w && w.designed && w.lm && w.bld && !w.gobelins) { try { w.gobelins = gobGenerer(w, w.seed !== undefined ? w.seed : seed); } catch (e) { console.error('gobelins', e); } }
    return w;
  };
}
