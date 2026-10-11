// ============================================================================
//  LES CASCADES, LES GROTTES ET LES COINS DE PARADIS (agent P18) — 2. LA GÉNÉRATION
//  Après tout le reste (la dernière passe de generateValley) et seulement dans
//  la vallée dessinée : on creuse le terrain d'après le plan (05-zzzzzzzP18-lieux.js)
//  — le cirque au pied de chaque chute, le bassin, le ruisseau en gradins, la
//  perte ou la mare où il finit ; on dégage les coins de paradis et on les garnit ;
//  sous les monts de l'ouest, les Grottes de la Chute (des creuseurs de plus pour
//  le moteur du Dessous, posés loin des siens) et ce qu'on y trouve.
//  Les objets d'avant ne bougent pas (leur rang) ; ceux qui gênent (arbres,
//  herbes, cailloux là où l'on creuse) sont seulement ôtés, comme les autres
//  lieux le font. Ce qui est ajouté vient après tout le reste, dans le même ordre
//  à chaque chargement (graine fixe : la vallée dessinée est la même partout).
//  Résultat : w.p18 = { eaux, chutes, minis, coins, grotte, n, ms, … } (voir plus bas).
// ============================================================================
// ---------------------------------------------------------------- les noms des lieux (LIEU_NAMES : 06-zfarm-structures.js)
Object.assign(LIEU_NAMES, {
  p18_grotte: 'les Grottes de la Chute', p18_bouche: 'la grotte derrière la chute',
});
for (const C of P18_CHUTES) LIEU_NAMES['p18_' + C.k] = C.nom;
for (const C of P18_COINS) LIEU_NAMES['p18_' + C.k] = C.nom;
for (const k in P18_SALLES_NOMS) LIEU_NAMES['p18g_' + k] = P18_SALLES_NOMS[k];

const P18_VER_PORTE = 1 << 26; // une « version du monde » jamais affichée : la porte du Sanctuaire, ouverte
const P18_PROF = 2.6;          // une nappe d'eau ne se dessine pas plus loin que cela au-dessus du fond (pas de « drap » qui flotte)

// ---------------------------------------------------------------- le terrain : creuser, relever, peindre
function p18Terrain(w) {
  const H = w.heights, Wd = w.W, C = w.cell, N = w.N, M = w.mats;
  const avant = new Map(); // sommet → hauteur d'origine (ce qui a bougé)
  const route = new Set(); // sommets d'un chemin (terre, pavés) qu'on a touchés (il ne doit y en avoir aucun)
  const T = {
    H, avant, route,
    sommets(x0, z0, x1, z1, fn) {
      const i0 = Math.max(0, Math.floor(x0 / C)), i1 = Math.min(N, Math.ceil(x1 / C)), j0 = Math.max(0, Math.floor(z0 / C)), j1 = Math.min(N, Math.ceil(z1 / C));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) fn(j * Wd + i, i * C, j * C);
    },
    poser(k, v) { if (!avant.has(k)) { avant.set(k, H[k]); if (M[k] === M_DIRT || M[k] === M_COBBLE) route.add(k); } H[k] = v; },
    baisser(k, v) { if (v < H[k] - 1e-4) T.poser(k, v); },
    monter(k, v) { if (v > H[k] + 1e-4) T.poser(k, v); },
    peindre(k, m) { if (M[k] === M_DIRT || M[k] === M_COBBLE) route.add(k); M[k] = m; },
  };
  // une ellipse (centre, demi-axes, rotation) : k = 0 au centre, 1 au bord (un peu de bruit sur le bord)
  T.ellipse = (E, x, z, bruit) => {
    const [cx, cz, rx, rz, rot] = E, co = Math.cos(rot || 0), si = Math.sin(rot || 0), dx = x - cx, dz = z - cz;
    const lx = dx * co + dz * si, lz = -dx * si + dz * co;
    return Math.hypot(lx / rx, lz / rz) * (1 + (bruit || 0) * (hash2i(Math.round(x), Math.round(z), 181) - 0.5));
  };
  // un segment : distance et t
  T.seg = (x, z, ax, az, bx, bz) => {
    const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1;
    const t = clamp(((x - ax) * dx + (z - az) * dz) / L2, 0, 1);
    return [Math.hypot(x - (ax + dx * t), z - (az + dz * t)), t];
  };
  return T;
}

// ---------------------------------------------------------------- la génération (une fois par vallée)
const p18Gen = {
  // nappes d'eau (rectangles tournés) : { x, z, hx, hz, a, y, prof, sous }
  nappe(R, x, z, hx, hz, a, y, o) { R.eaux.push(Object.assign({ x, z, hx, hz, a, y, prof: P18_PROF, sous: 0 }, o || {})); },

  // ------------------------------------------------------------ un ruisseau en gradins : [x, z, niveau, largeur], le dernier ne sert qu'à finir
  // (chaque tronçon garde le niveau de son départ ; l'eau descend d'un coup à chaque point)
  ruisseau(w, T, R, pts, o) {
    const WL = w.waterLevel, n = pts.length;
    if (n < 2) return;
    const prof = (o && o.prof) || 0.9;
    const seg = [];
    for (let i = 0; i + 1 < n; i++) {
      const [ax, az, L, lw] = pts[i], [bx, bz] = pts[i + 1];
      seg.push({ ax, az, bx, bz, y: WL + L, w: lw, i });
    }
    let x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9;
    for (const [x, z, , lw] of pts) { x0 = Math.min(x0, x - lw - 4); z0 = Math.min(z0, z - lw - 4); x1 = Math.max(x1, x + lw + 4); z1 = Math.max(z1, z + lw + 4); }
    // 1. les berges : relevées là où le terrain est plus bas que l'eau (une levée de roche)
    const dv = o && o.devant; // (devant le bord d'une chute : rien ne se relève, l'eau y tombe)
    T.sommets(x0, z0, x1, z1, (k, x, z) => {
      if (dv && (x - dv[0]) * dv[2] + (z - dv[1]) * dv[3] > -dv[4] - 0.3) return;
      for (const S of seg) {
        const [d] = T.seg(x, z, S.ax, S.az, S.bx, S.bz), hw = S.w / 2;
        if (d < hw || d > hw + 2.2) continue;
        T.monter(k, lerp(S.y + 0.35, T.H[k], smoothstep(hw + 0.4, hw + 2.2, d)));
      }
    });
    // 2. le lit : creusé (le plus bas des tronçons proches l'emporte)
    T.sommets(x0, z0, x1, z1, (k, x, z) => {
      let best = null;
      for (const S of seg) {
        const [d] = T.seg(x, z, S.ax, S.az, S.bx, S.bz), hw = S.w / 2;
        if (d > hw + 0.25) continue;
        const v = lerp(S.y - prof + (hash2i(Math.round(x * 2), Math.round(z * 2), 77) - 0.5) * 0.18, S.y + 0.3, smoothstep(hw - 0.9, hw + 0.25, d));
        if (best === null || v < best) best = v;
      }
      if (best !== null) { T.baisser(k, best); T.peindre(k, M_SAND); }
    });
    // les nappes (une par tronçon, au-dessus de l'eau du jeu seulement) et les petites chutes entre deux tronçons
    for (const S of seg) {
      const L = Math.hypot(S.bx - S.ax, S.bz - S.az), a = Math.atan2(S.bz - S.az, S.bx - S.ax);
      if (S.y > WL + 0.05) this.nappe(R, (S.ax + S.bx) / 2, (S.az + S.bz) / 2, L / 2 + 0.3, S.w / 2 + 0.6, a, S.y, o && o.nappe);
    }
    for (let i = 0; i + 1 < seg.length; i++) {
      const A = seg[i], B = seg[i + 1], h = A.y - B.y;
      if (h < 0.45) continue;
      const a = Math.atan2(A.bz - A.az, A.bx - A.ax);
      R.minis.push({ x: A.bx, z: A.bz, a, y0: A.y, y1: B.y, l: Math.min(A.w, B.w) * 0.8, k: o && o.cle });
    }
    return seg;
  },

  // ------------------------------------------------------------ une chute
  chute(w, T, R, B, C) {
    const WL = w.waterLevel, yT = WL + C.haut, yB = WL + C.bas, sol = yB + 0.6;
    const D = { k: C.k, sorte: C.sorte, x: C.lip[0], z: C.lip[1], a: C.dir, y0: yT, y1: yB, l: C.larg, bassin: null };
    // 1. derrière le bord : un replat (relevé à la hauteur du bord, là où il manque) ; jamais devant
    const fx = Math.cos(C.dir), fz = Math.sin(C.dir);
    if (C.sorte !== 'gradins') {
      const sp = C.surplomb || 0, bx = C.lip[0] - fx * (6 + sp), bz = C.lip[1] - fz * (6 + sp), r = Math.max(7, C.larg * 0.8);
      T.sommets(bx - r - 8, bz - r - 8, bx + r + 8, bz + r + 8, (k, x, z) => {
        if ((x - C.lip[0]) * fx + (z - C.lip[1]) * fz > -0.8 - sp) return; // devant le bord (ou la paroi, sous le surplomb) : non
        const d = Math.hypot(x - bx, z - bz);
        if (d > r + 7) return;
        T.monter(k, lerp(yT + 0.6, T.H[k], smoothstep(r, r + 7, d)));
      });
    }
    // 2. le cirque : le creux au pied, à fond plat, aux parois raides
    if (C.cirque) {
      const E = C.cirque, Rr = Math.max(E[2], E[3]) + 3;
      T.sommets(E[0] - Rr, E[1] - Rr, E[0] + Rr, E[1] + Rr, (k, x, z) => {
        const q = T.ellipse(E, x, z, 0.12);
        if (q > 1.06) return;
        const v = q < 1 ? sol + (hash2i(Math.round(x), Math.round(z), 91) - 0.5) * 0.25 : lerp(sol, T.H[k], (q - 1) / 0.06);
        if (v < T.H[k] - 0.6) T.peindre(k, q < 0.92 ? M_SAND : M_CLIFF);
        T.baisser(k, v);
      });
      // les parois (ce qui reste haut tout autour) : la roche
      T.sommets(E[0] - Rr - 4, E[1] - Rr - 4, E[0] + Rr + 4, E[1] + Rr + 4, (k, x, z) => {
        const q = T.ellipse(E, x, z, 0.12);
        if (q >= 1 && q < 1.35 && T.H[k] > sol + 2) T.peindre(k, M_CLIFF);
      });
      // derrière le rideau : la corniche est de roche mouillée, pas de sable
      if (C.corniche) {
        const [x0, x1, z0, z1] = C.corniche;
        T.sommets(x0 - 1.5, z0 - 1.5, x1 + 1.5, z1 + 1.5, (k) => T.peindre(k, M_ROCK));
      }
    }
    // 3. le bassin
    if (C.bassin) D.bassin = this.bassin(w, T, R, C.bassin, yB, { rive: sol });
    // 4. l'îlot (au milieu du bassin)
    if (C.ilot) {
      const [ix, iz, ir, ih] = C.ilot;
      T.sommets(ix - ir - 2, iz - ir - 2, ix + ir + 2, iz + ir + 2, (k, x, z) => {
        const d = Math.hypot(x - ix, z - iz) * (1 + 0.15 * (hash2i(Math.round(x), Math.round(z), 13) - 0.5));
        if (d > ir) return;
        T.monter(k, lerp(WL + ih, yB - 1, smoothstep(ir * 0.55, ir, d)));
        T.peindre(k, d < ir * 0.7 ? M_LUSH : M_SAND);
      });
    }
    // 5. les gradins (les Cascatelles) : de vasque en vasque, chacune touche la suivante
    if (C.gradins) {
      const G = C.gradins;
      for (let i = 0; i < G.length; i++) {
        const [gx, gz, L, gw] = G[i], nx = i + 1 < G.length ? G[i + 1] : [C.bassin[0], C.bassin[1]];
        const d = Math.hypot(nx[0] - gx, nx[1] - gz), a = Math.atan2(nx[1] - gz, nx[0] - gx);
        const Ei = [gx + Math.cos(a) * d * 0.12, gz + Math.sin(a) * d * 0.12, d * 0.5, gw * 0.5, a, 0.9];
        this.bassin(w, T, R, Ei, WL + L, { rive: WL + L + 0.35, ellipseRot: true });
        const nl = i + 1 < G.length ? G[i + 1][2] : C.bas;
        const ex = gx + Math.cos(a) * (d * 0.62), ez = gz + Math.sin(a) * (d * 0.62);
        R.minis.push({ x: ex, z: ez, a, y0: WL + L, y1: WL + nl, l: Math.min(gw, 3.2) * 0.75, k: C.k, grad: i });
      }
    }
    // 6. l'amont (le ruisseau qui arrive au bord) et l'aval (jusqu'à la perte, la mare ou le lac)
    if (C.amont) D.amont = this.ruisseau(w, T, R, C.amont, { cle: C.k, devant: [C.lip[0], C.lip[1], fx, fz, C.surplomb || 0] });
    if (C.aval) {
      const bas = C.aval.map((p) => p.slice());
      D.aval = this.ruisseau(w, T, R, bas, { cle: C.k });
      const F = bas[bas.length - 1];
      if (C.fin === 'perte') {
        T.sommets(F[0] - 5, F[1] - 5, F[0] + 5, F[1] + 5, (k, x, z) => {
          const d = Math.hypot(x - F[0], z - F[1]);
          if (d > 3.4) return;
          T.baisser(k, lerp(WL + F[2] - 3.2, WL + F[2] + 0.3, smoothstep(0.6, 3.4, d)));
          T.peindre(k, M_ROCK);
        });
        D.perte = [F[0], F[1], WL + F[2]];
      } else if (C.fin === 'mare' && C.mare) {
        const [mx, mz, mrx, mrz, mrot, ml] = C.mare;
        this.bassin(w, T, R, [mx, mz, mrx, mrz, mrot, 1.2], WL + ml, { rive: WL + ml + 0.3 });
        D.mare = [mx, mz, mrx, mrz, mrot, WL + ml];
      }
    }
    // le dessus de l'eau qui tombe : le niveau du dernier tronçon d'amont (ou le bord)
    if (D.amont && D.amont.length) D.y0 = D.amont[D.amont.length - 1].y;
    R.chutes.push(D);
    return D;
  },

  // ------------------------------------------------------------ un bassin : [cx, cz, rx, rz, rot, profondeur], niveau y (absolu)
  bassin(w, T, R, E, y, o) {
    const [cx, cz, rx, rz, rot, prof] = E, rive = (o && o.rive) || y + 0.3, Rr = Math.max(rx, rz) + 4;
    // la berge : relevée là où le terrain manque
    T.sommets(cx - Rr, cz - Rr, cx + Rr, cz + Rr, (k, x, z) => {
      const q = T.ellipse(E, x, z, 0.1);
      if (q < 1 || q > 1.5) return;
      T.monter(k, lerp(Math.max(rive, y + 0.3), T.H[k], smoothstep(1.22, 1.5, q)));
    });
    // le fond
    T.sommets(cx - Rr, cz - Rr, cx + Rr, cz + Rr, (k, x, z) => {
      const q = T.ellipse(E, x, z, 0.1);
      if (q > 1.02) return;
      const v = lerp(y - (prof || 1.2) + (hash2i(Math.round(x * 2), Math.round(z * 2), 7) - 0.5) * 0.2, y + 0.25, smoothstep(0.55, 1.02, q));
      T.baisser(k, v); T.peindre(k, M_SAND);
    });
    const big = Math.max(rx, rz);
    this.nappe(R, cx, cz, rx * 1.08 + 0.6, rz * 1.08 + 0.6, rot || 0, y, { prof: (prof || 1.2) + 0.5 });
    return { x: cx, z: cz, rx, rz, rot: rot || 0, y, r: big };
  },

  // ------------------------------------------------------------ ce qui gêne là où le terrain a bougé : ôté
  degager(w, T, R) {
    const C = w.cell, Wd = w.W, keep = [];
    const cats = new Set(['Arbres', 'Végétation', 'Fleurs', 'Champignons', 'Rochers']);
    const pres = (x, z) => {
      const i = Math.round(x / C), j = Math.round(z / C);
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const k = (j + dj) * Wd + (i + di), h0 = T.avant.get(k); if (h0 !== undefined && Math.abs(h0 - w.heights[k]) > 0.2) return true; }
      return false;
    };
    const dansEau = (x, z) => R.eaux.some((E) => !E.sous && Math.abs((x - E.x) * Math.cos(E.a) + (z - E.z) * Math.sin(E.a)) < E.hx && Math.abs(-(x - E.x) * Math.sin(E.a) + (z - E.z) * Math.cos(E.a)) < E.hz && w.heightAt(x, z) < E.y + 0.1);
    // (un tri grossier d'abord : des carreaux de 16 m touchés par le terrain ou l'eau)
    const TW = Math.ceil(w.size / 16) + 1, tu = new Uint8Array(TW * TW);
    for (const k of T.avant.keys()) { const i = k % Wd, j = (k / Wd) | 0; tu[((j * C) >> 4) * TW + ((i * C) >> 4)] = 1; }
    for (const E of R.eaux) { if (E.sous) continue; const r = Math.hypot(E.hx, E.hz); for (let z = E.z - r; z <= E.z + r + 16; z += 16) for (let x = E.x - r; x <= E.x + r + 16; x += 16) if (x >= 0 && z >= 0 && x < w.size && z < w.size) tu[(z >> 4) * TW + (x >> 4)] = 1; }
    const touche = (x, z) => { const i = x >> 4, j = z >> 4; for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const ii = i + di, jj = j + dj; if (ii >= 0 && jj >= 0 && ii < TW && jj < TW && tu[jj * TW + ii]) return true; } return false; };
    let n = 0;
    for (let i = 0; i < R.n0.o; i++) {
      const o = w.objects[i];
      if (o.gone || (o.y !== undefined && o.y < -30)) continue;
      if (!touche(o.x, o.z)) continue;
      if (!pres(o.x, o.z) && !dansEau(o.x, o.z)) continue;
      const t = OBJ_TYPES[o.t];
      if (t && t.animal) { if (dansEau(o.x, o.z)) { o.gone = true; o.cleared = true; n++; } continue; } // (une bête : seulement si l'eau la noie)
      if (!t || !cats.has(t.cat)) { keep.push(i); continue; }
      o.gone = true; o.cleared = true; n++;
    }
    R.ecartes = keep; R.otes = n;
    w.objectsDirty = true;
  },
  // les arbres et herbes d'un coin à dégager (un disque)
  ecarter(w, R, x, z, r, garder) {
    let n = 0;
    for (let i = 0; i < R.n0.o; i++) {
      const o = w.objects[i];
      if (o.gone || o.y !== undefined || Math.abs(o.x - x) > r || Math.abs(o.z - z) > r || Math.hypot(o.x - x, o.z - z) > r) continue;
      const t = OBJ_TYPES[o.t];
      if (!t || !/^(Arbres|Végétation|Rochers|Fleurs|Champignons)$/.test(t.cat || '')) continue;
      if (garder && garder(t, o)) continue;
      o.gone = true; o.cleared = true; n++;
    }
    return n;
  },

  // ------------------------------------------------------------ la passe entière
  passe(w) {
    const t0 = performance.now();
    const R = { v: 1, eaux: [], chutes: [], minis: [], coins: [], ecartes: [], otes: 0, grotte: null, n0: { o: w.objects.length, p: w.props.length, i: w.inter.length, b: w.blocks.length } };
    w.p18 = R;
    const rnd = mulberry32(0x18ca5cad), B = new Builder(w, rnd, new Uint8Array(w.W * w.W)), T = p18Terrain(w), WL = w.waterLevel;
    const H = (x, z) => w.heightAt(x, z);
    // ---- les chutes : le terrain
    for (const C of P18_CHUTES) this.chute(w, T, R, B, C);
    // ---- le terrain des coins (avant de dégager)
    for (const P of P18_COINS) this.coinTerrain(w, T, R, P);
    this.degager(w, T, R);
    // les parois : la roche partout où le terrain creusé fait une marche (le sable en bas ne monte pas sur la paroi)
    { const Hh = w.heights, Wd = w.W;
      for (const k of T.avant.keys()) { const h = Hh[k]; let m = 0; for (const d of [1, -1, Wd, -Wd]) { const q = k + d; if (q >= 0 && q < Hh.length) m = Math.max(m, Math.abs(Hh[q] - h)); } if (m > 1.3) T.peindre(k, M_CLIFF); } }
    // les rangs (le terrain a bougé : les ombres, le maillage, les abris se refont au chargement)
    w.dirtyHeights = null; w.shadeDirty = true; w.coverDirty = true;
    // ---- ce qu'on pose autour des chutes
    for (const D of R.chutes) this.garnirChute(w, B, R, D, rnd);
    // ---- les coins de paradis
    for (const P of P18_COINS) R.coins.push(this.coin(w, B, R, P, rnd));
    // ---- les grottes (la décoration, ce qu'on y trouve)
    try { R.grotte = p18Grotte.garnir(w, B, rnd); } catch (e) { console.error('P18 grottes', e); }
    // ---- les zones où l'on ne bâtit pas (à part : w.noBuild garde les siennes, où poussent déjà des plantes)
    R.zones = [];
    for (const D of R.chutes) if (!D.sous) R.zones.push({ x: D.bassin ? D.bassin.x : D.x, z: D.bassin ? D.bassin.z : D.z, r: D.bassin ? D.bassin.r + 14 : 20, why: LIEU_NAMES['p18_' + D.k] });
    for (const P of P18_COINS) if (!P.chute) R.zones.push({ x: P.c[0], z: P.c[1], r: P.r + 6, why: LIEU_NAMES['p18_' + P.k] });
    R.routes = [...T.route].filter((k) => !T.avant.has(k) || Math.abs(T.avant.get(k) - w.heights[k]) > 0.15).length;
    R.n = { o: w.objects.length - R.n0.o, p: w.props.length - R.n0.p, i: w.inter.length - R.n0.i, b: w.blocks.length - R.n0.b, eaux: R.eaux.length, minis: R.minis.length, sommets: T.avant.size };
    R.ms = Math.round(performance.now() - t0);
    return R;
  },

  // ------------------------------------------------------------ autour d'une chute : rochers, bouche, dalle, perte, mare, source
  garnirChute(w, B, R, D, rnd) {
    const C = P18_CHUTES.find((q) => q.k === D.k), WL = w.waterLevel, H = (x, z) => w.heightAt(x, z);
    const fx = Math.cos(D.a), fz = Math.sin(D.a), px = -fz, pz = fx;
    B.landmark('p18_' + D.k, D.bassin ? D.bassin.x : D.x, D.bassin ? D.bassin.z : D.z, D.bassin ? Math.max(14, D.bassin.r + 8) : 16, { p18: 'chute' });
    // des rochers sur la rive du bassin (pas dans l'eau, pas devant la chute)
    if (D.bassin) {
      const Bs = D.bassin;
      let n = 0;
      for (let t = 0; t < 40 && n < 7; t++) {
        const a = rnd() * TAU, k = 1.12 + rnd() * 0.25, lx = Math.cos(a) * Bs.rx * k, lz = Math.sin(a) * Bs.rz * k;
        const x = Bs.x + lx * Math.cos(Bs.rot) - lz * Math.sin(Bs.rot), z = Bs.z + lx * Math.sin(Bs.rot) + lz * Math.cos(Bs.rot);
        if ((x - D.x) * fx + (z - D.z) * fz < 6 && Math.abs((x - D.x) * px + (z - D.z) * pz) < D.l) continue; // devant la chute
        if (H(x, z) < Bs.y + 0.15 || (C.corniche && x < C.corniche[1] + 2 && z > C.corniche[2] - 2 && z < C.corniche[3] + 2)) continue;
        B.prop('p18_roc', x, H(x, z) - 0.15, z, rnd() * TAU, { v: (rnd() * 4) | 0 }, 0.8 + rnd() * 0.9);
        n++;
      }
    }
    // la grande : la dalle d'où tombe le rideau, ses épaules, la bouche de la grotte derrière
    if (D.k === 'grande') {
      const top = D.y0 - 0.35, f = { x: (381 + 391.6) / 2, y: top - 2.4, z: D.z, r: 0 };
      B.block(f, 0, 0, 0, 391.6 - 381, 2.4, C.larg + 4, M_CLIFF);
      B.block({ x: 390.6, y: top - 3.6, z: D.z, r: 0 }, 0, 0, 0, 2.2, 1.4, C.larg + 2.4, M_CLIFF);
      for (const s of [-1, 1]) B.block({ x: 384, y: top - 9, z: D.z + s * (C.larg / 2 + 3.4), r: 0 }, 0, 0, 0, 8, 9.6, 4.2, M_CLIFF);
      const [bx, bz] = C.grotte.bouche, by = WL + C.bas + 0.6;
      B.prop('p18_bouche', bx, by, bz, Math.PI / 2, null, 1);
      B.inter('p18_grotte', 'p18_grotte', bx + 1.1, by + 1.4, bz, 'Entrer dans la grotte', {});
      B.landmark('p18_bouche', bx, bz, 6, { p18: 'bouche', secret: true });
      D.bouche = [bx, by, bz];
      // l'eau sur la dalle (le terrain est loin dessous : la nappe se dessine quand même)
      this.nappe(R, (381 + 391.6) / 2 + 1, D.z, (391.6 - 381) / 2 - 0.6, C.larg / 2 + 0.6, 0, D.y0, { prof: 40 });
    }
    // la source du ruisseau d'amont (des pierres, une fente d'où l'eau sort)
    if (D.amont && D.amont.length) {
      const S = D.amont[0], a = Math.atan2(S.bz - S.az, S.bx - S.ax), x = S.ax - Math.cos(a) * 1.4, z = S.az - Math.sin(a) * 1.4;
      B.prop('p18_source', x, H(x, z) - 0.1, z, a, null, 1);
    }
    // les Cascatelles naissent d'une source au-dessus de la première vasque
    if (C.gradins) { const [gx, gz] = C.gradins[0], [hx, hz] = C.gradins[1], a = Math.atan2(hz - gz, hx - gx), x = gx - Math.cos(a) * 4, z = gz - Math.sin(a) * 4; B.prop('p18_source', x, H(x, z) - 0.1, z, a, null, 1); }
    // la cascade des Saules sort d'une faille de la paroi
    if (C.source === 'faille') B.prop('p18_faille', D.x - fx * 0.4, D.y0 - 2.2, D.z, D.a, null, 1);
    // la perte : un trou rond où l'eau tourne
    if (D.perte) { const [x, z, y] = D.perte; B.prop('p18_perte', x, y - 0.25, z, 0, null, 1); B.inter('p18_perte', 'p18_perte', x, y + 0.5, z, 'Regarder la perte', {}); }
    // la mare : des roseaux, une ou deux pierres
    if (D.mare) {
      const [mx, mz, mrx, mrz, mrot] = D.mare;
      for (let k = 0; k < 16; k++) { const a = k / 16 * TAU + rnd() * 0.3, q = 0.95 + rnd() * 0.25, x = mx + Math.cos(a) * mrx * q, z = mz + Math.sin(a) * mrz * q; if (H(x, z) > D.mare[5] - 0.1) B.obj(rnd() < 0.7 ? 'reeds' : 'menthe_eau', x, z); }
    }
  },

  // ------------------------------------------------------------ les coins de paradis : le terrain d'abord
  coinTerrain(w, T, R, P) {
    const [cx, cz] = P.c, WL = w.waterLevel;
    if (P.sorte === 'source') {
      const [bx, bz, brx, brz, brot] = P.bain, y = w.heightAt(bx, bz) - 0.25;
      P._y = y;
      P._bain = this.bassin(w, T, R, [bx, bz, brx, brz, brot, 1.1], y, { rive: y + 0.35 });
      R.eaux[R.eaux.length - 1].chaud = 1;
    } else if (P.sorte === 'belvedere') {
      // un replat d'herbe au-dessus du vide
      const y = w.heightAt(cx, cz);
      T.sommets(cx - P.r - 6, cz - P.r - 6, cx + P.r + 6, cz + P.r + 6, (k, x, z) => {
        const d = Math.hypot(x - cx, z - cz);
        if (d > P.r + 5) return;
        T.poser(k, lerp(y, T.H[k], smoothstep(P.r * 0.6, P.r + 5, d)));
      });
    } else if (P.sorte === 'pre' || P.sorte === 'verger') {
      // à peine adouci
      const y = w.heightAt(cx, cz);
      T.sommets(cx - P.r, cz - P.r, cx + P.r, cz + P.r, (k, x, z) => {
        const d = Math.hypot(x - cx, z - cz);
        if (d > P.r) return;
        T.poser(k, lerp(lerp(T.H[k], y, 0.35), T.H[k], smoothstep(P.r * 0.5, P.r, d)));
      });
    }
  },
  // ------------------------------------------------------------ … puis ce qu'on y pose
  coin(w, B, R, P, rnd) {
    const [cx, cz] = P.c, H = (x, z) => w.heightAt(x, z), WL = w.waterLevel;
    const Q = { k: P.k, sorte: P.sorte, x: cx, z: cz, r: P.r, y: H(cx, cz), repos: null };
    B.landmark('p18_' + P.k, cx, cz, Math.max(10, P.r), { p18: 'coin', secret: true });
    const libre = (x, z, m) => H(x, z) > WL + 0.3 && !R.eaux.some((E) => !E.sous && Math.hypot(x - E.x, z - E.z) < Math.max(E.hx, E.hz) + (m || 0.5) && H(x, z) < E.y + 0.2);
    const fleurs = (ids, n, r0, r1, garde) => {
      let k = 0;
      for (let t = 0; t < n * 4 && k < n; t++) {
        const a = rnd() * TAU, d = r0 + Math.sqrt(rnd()) * (r1 - r0), x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
        if (!libre(x, z) || (garde && !garde(x, z))) continue;
        B.obj(ids[(rnd() * ids.length) | 0], x, z); k++;
      }
      return k;
    };
    const paint = (r, m) => { const Wd = w.W, C = w.cell; for (let j = Math.floor((cz - r) / C); j <= Math.ceil((cz + r) / C); j++) for (let i = Math.floor((cx - r) / C); i <= Math.ceil((cx + r) / C); i++) { const d = Math.hypot(i * C - cx, j * C - cz) + (hash2i(i, j, 5) - 0.5) * 3; const q = j * Wd + i; if (d < r && w.heights[q] > WL + 0.3 && w.mats[q] !== M_DIRT && w.mats[q] !== M_COBBLE) w.mats[q] = m; } };
    switch (P.sorte) {
      case 'pre': {
        this.ecarter(w, R, cx, cz, P.r - 2);
        paint(P.r - 1, M_FLOWERS);
        fleurs(['poppies', 'daisies', 'cornflower', 'lavender', 'myosotis', 'campanule', 'bouton_or', 'achillee', 'mauve', 'reine_pres'], 70, 0, P.r - 2);
        fleurs(['fraisier_bois', 'orchidee', 'violette'], 8, 2, P.r - 3);
        const [sx, sz] = [cx + 4, cz - 3]; B.prop('p18_souche', sx, H(sx, sz), sz, 0.4, null, 1); Q.repos = [sx, H(sx, sz), sz];
        Q.papillons = 16;
        break;
      }
      case 'source': {
        const Bn = P._bain;
        this.ecarter(w, R, Bn.x, Bn.z, 9);
        for (let k = 0; k < 9; k++) { const a = k / 9 * TAU + rnd() * 0.3, x = Bn.x + Math.cos(a) * (Bn.rx + 1.2), z = Bn.z + Math.sin(a) * (Bn.rz + 1.2); B.prop('p18_roc', x, H(x, z) - 0.2, z, rnd() * TAU, { v: (rnd() * 4) | 0, mousse: 1 }, 0.55 + rnd() * 0.4); }
        fleurs(['fern', 'mousse', 'violette', 'primevere'], 14, Bn.r + 1.5, P.r);
        B.inter('p18_bain', 'p18_bain_source', Bn.x, Bn.y + 0.4, Bn.z, 'Se glisser dans l’eau tiède', { coin: P.k });
        Q.bain = [Bn.x, Bn.y, Bn.z]; Q.vapeur = 1; Q.repos = [Bn.x, Bn.y, Bn.z];
        break;
      }
      case 'ilot': {
        // un saule pleureur sur l'îlot, des roseaux, des iris jaunes au bord de l'eau
        B.obj('saule', cx, cz, 9.5);
        for (let k = 0; k < 7; k++) { const a = rnd() * TAU, d = 2 + rnd() * 1.5, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d; if (H(x, z) > WL + 7.6) B.obj(rnd() < 0.5 ? 'iris' : 'myosotis', x, z); }
        const D = R.chutes.find((q) => q.k === P.chute);
        if (D && D.bassin) for (let k = 0; k < 18; k++) { const a = rnd() * TAU, q = 1.02 + rnd() * 0.18, x = D.bassin.x + Math.cos(a) * D.bassin.rx * q, z = D.bassin.z + Math.sin(a) * D.bassin.rz * q; if (H(x, z) > D.bassin.y && (x - D.x) > 6) B.obj(rnd() < 0.5 ? 'reeds' : rnd() < 0.5 ? 'iris' : 'menthe_eau', x, z); }
        B.prop('p18_pierre_plate', cx - 2.2, H(cx - 2.2, cz + 1) - 0.05, cz + 1, 0.7, null, 1);
        Q.repos = [cx - 2.2, H(cx - 2.2, cz + 1), cz + 1];
        break;
      }
      case 'bassin': {
        this.ecarter(w, R, cx, cz, 13, (t, o) => t.cat === 'Arbres' && Math.hypot(o.x - cx, o.z - cz) > 11);
        paint(P.r - 3, M_LUSH);
        fleurs(['fern', 'violette', 'myosotis', 'pervenche', 'fraisier_bois', 'anemone'], 26, 6, P.r - 1);
        const [sx, sz] = [cx - 7, cz + 4]; B.prop('p18_pierre_plate', sx, H(sx, sz) - 0.05, sz, 1.1, null, 1); Q.repos = [sx, H(sx, sz), sz];
        Q.papillons = 6; Q.lucioles = 1;
        break;
      }
      case 'belvedere': {
        this.ecarter(w, R, cx, cz, P.r, (t, o) => t.cat === 'Arbres' && Math.hypot(o.x - cx, o.z - cz) > P.r - 1.5);
        paint(P.r, M_FLOWERS);
        fleurs(['gentiane', 'campanule', 'pulsatille', 'serpolet', 'edelweiss'], 20, 0.8, P.r);
        // un banc de pierre tourné vers la vallée (le sud)
        const bx = cx, bz = cz + 3;
        B.prop('p18_banc', bx, H(bx, bz), bz, 0, null, 1); Q.repos = [bx, H(bx, bz), bz];
        B.obj('pine', cx - 6.5, cz - 4, 10.5);
        break;
      }
      case 'verger': {
        this.ecarter(w, R, cx, cz, P.r);
        paint(P.r, M_LUSH);
        const arb = ['poirier', 'prunier', 'cerisier', 'apple', 'poirier', 'cerisier', 'noyer'];
        let n = 0;
        for (let gx = -2; gx <= 2; gx++) for (let gz = -2; gz <= 2; gz++) {
          if (Math.abs(gx) + Math.abs(gz) > 3 || (gx === 0 && gz === 0)) continue;
          const x = cx + gx * 7.5 + (rnd() - 0.5) * 2.4, z = cz + gz * 7.5 + (rnd() - 0.5) * 2.4;
          if (!libre(x, z)) continue;
          B.obj(arb[n++ % arb.length], x, z);
        }
        fleurs(['tallgrass', 'paquerette', 'pissenlit', 'trefle_f', 'primevere'], 34, 1, P.r);
        fleurs(['berry', 'eglantier', 'sureau'], 5, P.r - 4, P.r + 1);
        B.prop('p18_muret', cx + 2, H(cx + 2, cz - 1), cz - 1, 0.35, null, 1); Q.repos = [cx + 2, H(cx + 2, cz - 1), cz - 1];
        Q.papillons = 8;
        break;
      }
    }
    if (Q.repos) B.inter('p18_repos', 'p18_repos_' + P.k, Q.repos[0], Q.repos[1] + 0.8, Q.repos[2], P.sorte === 'source' ? 'S’asseoir au bord' : 'S’asseoir un moment', { coin: P.k });
    return Q;
  },
};

// ---------------------------------------------------------------- la passe : après toutes les autres
{
  const _gv = generateValley;
  generateValley = async function (seed, progress, gen) {
    const w = await _gv(seed, progress, gen);
    if (w && w.designed) {
      try { if (progress) progress('Les cascades…'); p18Gen.passe(w); } catch (e) { console.error('P18', e); }
    }
    return w;
  };
}
