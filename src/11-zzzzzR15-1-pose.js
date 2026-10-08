// ============================================================================
//  LES RUNES (agent R15, quinzième vague) — 2. LA POSE
//  Une passe de génération, la DERNIÈRE de la vallée (le fichier se trie après
//  toutes les autres : 11-zzzzzR15 > 11-zzzzZ, 11-zzzzz-admin), tirage propre
//  (mulberry32(graine ^ 0x52313535)). On AJOUTE au bout des listes (interactions,
//  un coffre, des blocs) : les objets, les objets posés et les interactions
//  d'avant ne bougent pas (empreintes) ; les trouvailles de R (w.ramasse) non plus.
//   - trois tablettes, au pied d'un arbre, d'un rocher ou d'une souche, à l'écart
//     des chemins : autour de la ferme (35-180 m), de Valbrume (hors les murs,
//     90-260 m de la place), de Clairpré (40-200 m) ;
//   - la quatrième au fond d'un cul-de-sac des Galeries (le plus loin de
//     l'échelle) ; dans un autre cul-de-sac, une dalle scellée (la niche) ;
//   - le caveau du bois : un petit caveau de pierre moussue, dans une forêt, à
//     250-800 m de la ferme, loin des chemins ; sa dalle est scellée ;
//   - dans les Terres d'Avant (zone.passe) : le tertre scellé, aux Tertres.
//  Les dalles : un bloc de collision invisible (hidden) ; la pierre se dessine
//  chaque image (11-zzzzzR15-2-jeu.js), elle s'enfonce quand on l'ouvre.
//  w.r15 = { tablettes: [{ i, x, y, z, r, lieu, runes }], portes: { id: { … } },
//            avant: { o, p, i, b, ram }, ms }
// ============================================================================
const R15_GRAINE = 0x52313535;
// les salles du labyrinthe (06-zzgen-deep.js : rooms) : [cellule i, j]
const R15_SALLES = [[1, 7], [7, 7], [12, 3], [3, 12], [11, 11], [5, 3], [14, 1], [14, 13], [9, 13]];

const r15Pose = {
  // les matières des chemins, des rues, des cours (on n'y pose pas une tablette)
  cheminMat(m) { return m === M_DIRT || m === M_COBBLE || m === M_SAND || m === M_PLANKS || m === M_STONE; },

  // ------------------------------------------------------------- la vallée
  vallee(w, seed) {
    if (!w || !w.heightAt || !w.inter || !w.props) return null;
    const T0 = Date.now();
    const rnd = mulberry32(((seed | 0) ^ R15_GRAINE) >>> 0);
    const B = new Builder(w, rnd, new Uint8Array(1));
    const R = { tablettes: [], portes: {}, avant: { o: w.objects.length, p: w.props.length, i: w.inter.length, b: w.blocks.length, ram: w.ramasse ? w.ramasse.sig : null }, ms: 0 };
    // les runes des trois tablettes de la vallée (neuf, au hasard), la quatrième : celles du Dessous
    const neuf = R15_ORDRE.filter((k) => !R15_DESSOUS.includes(k));
    for (let i = neuf.length - 1; i > 0; i--) { const j = (rnd() * (i + 1)) | 0; [neuf[i], neuf[j]] = [neuf[j], neuf[i]]; }
    const runesDe = (i) => (i < 3 ? neuf.slice(i * 3, i * 3 + 3) : R15_DESSOUS.slice());
    // ce qu'il faut éviter (grille de 8 m) : objets posés, interactions, portes, trouvailles de R
    const C = 8, OB = new Map(), cle = (x, z) => ((x / C) | 0) * 8192 + ((z / C) | 0);
    const marque = (x, z, r) => { const k = cle(x, z); let A = OB.get(k); if (!A) OB.set(k, (A = [])); A.push(x, z, r); };
    for (const q of w.props) if (q && !q.gone) marque(q.x, q.z, 1.2);
    for (const it of w.inter) if (it) marque(it.x, it.z, 1.0);
    for (const d of w.doors || []) if (d && d.x !== undefined) marque(d.x, d.z, 2);
    if (w.ramasse && w.ramasse.L) for (const o of w.ramasse.L) marque(o.x, o.z, 0.6);
    const encombre = (x, z, m) => {
      const n = Math.ceil((m + 2) / C);
      for (let dx = -n; dx <= n; dx++) for (let dz = -n; dz <= n; dz++) {
        const A = OB.get((((x / C) | 0) + dx) * 8192 + ((z / C) | 0) + dz);
        if (!A) continue;
        for (let i = 0; i < A.length; i += 3) if (Math.hypot(A[i] - x, A[i + 1] - z) < A[i + 2] + m) return true;
      }
      return false;
    };
    const fd = w.farm && w.farm.field;
    const surChamp = (x, z, m) => !!fd && x > fd.x0 - m && x < fd.x1 + m && z > fd.z0 - m && z < fd.z1 + m;
    const pres = (x, z, r) => { for (const P of w.noBuild || []) if (Math.hypot(P.x - x, P.z - z) < P.r + r) return true; return false; };
    const chemin = (x, z, d) => {
      if (this.cheminMat(w.matAt(x, z))) return true;
      for (let a = 0; a < 8; a++) for (const s of [d * 0.5, d]) if (this.cheminMat(w.matAt(x + Math.cos(a * 0.785) * s, z + Math.sin(a * 0.785) * s))) return true;
      return false;
    };
    const WL = w.waterLevel;
    this.encombre = encombre;

    // ---- les trois tablettes de la vallée
    const F = w.lm.ferme || (w.farm && w.farm.spawn ? { x: w.farm.spawn[0], z: w.farm.spawn[1] } : { x: w.size / 2, z: w.size / 2 });
    const V = w.townInfo ? { x: w.townInfo.x, z: w.townInfo.z } : w.lm.place || null;
    const H = w.lm.hameau || null;
    const autour = [
      { lieu: 'ferme', c: F, r0: 35, r1: 180 },
      { lieu: 'valbrume', c: V || F, r0: V ? 90 : 190, r1: V ? 260 : 320 },
      { lieu: 'clairpre', c: H || F, r0: H ? 40 : 330, r1: H ? 200 : 450 },
    ];
    const ancre = (o) => { const t = OBJ_TYPES[o.t]; return t && !o.gone && (t.cat === 'Arbres' || t.id === 'rock' || t.id === 'stump'); };
    for (let i = 0; i < 3; i++) {
      const A = autour[i];
      let pose = null;
      for (let essai = 0; essai < 900 && !pose; essai++) {
        const a = rnd() * TAU, d = A.r0 + Math.sqrt(rnd()) * (A.r1 - A.r0);
        const cx = A.c.x + Math.cos(a) * d, cz = A.c.z + Math.sin(a) * d;
        if (!w.inside(cx, cz, 40)) continue;
        // un arbre, un rocher, une souche tout près
        let o = null, od = 1e9;
        w.query(cx, cz, 7, (q) => { if (!ancre(q)) return; const e = Math.hypot(q.x - cx, q.z - cz); if (e < od) { od = e; o = q; } }, null);
        if (!o) continue;
        const ro = objRadius(OBJ_TYPES[o.t], o), b = rnd() * TAU, dd = ro + 0.45;
        const x = o.x + Math.cos(b) * dd, z = o.z + Math.sin(b) * dd;
        if (!w.inside(x, z, 40)) continue;
        const h = w.heightAt(x, z);
        if (h < WL + 0.6) continue;
        if (w.normalAt(x, z)[1] < 0.86) continue;
        if (surChamp(x, z, 4) || pres(x, z, 6) || chemin(x, z, 4)) continue;
        if (encombre(x, z, 3.5)) continue;
        if (!pointFree(w, x, z, 1.4)) continue;
        // aucun autre tronc, rocher, buisson dans la pierre
        let bute = false;
        w.query(x, z, 3, (q) => { if (bute || q === o || q.gone) return; const t = OBJ_TYPES[q.t]; const rr = t ? objRadius(t, q) : 0; if (rr && Math.hypot(q.x - x, q.z - z) < rr + 0.35) bute = true; }, null);
        if (bute) continue;
        // pas trop loin des autres tablettes déjà posées
        if (R.tablettes.some((T) => Math.hypot(T.x - x, T.z - z) < 60)) continue;
        pose = { i, x: +x.toFixed(2), y: +h.toFixed(3), z: +z.toFixed(2), r: +Math.atan2(x - o.x, z - o.z).toFixed(3), lieu: A.lieu, runes: runesDe(i) };
      }
      if (!pose) continue;
      R.tablettes.push(pose);
      marque(pose.x, pose.z, 1.2);
      B.inter('r15_tablette', 'r15_tab_' + i, pose.x, pose.y + 0.35, pose.z, 'Une pierre gravée', { i });
    }

    // ---- le Dessous : la quatrième tablette, la niche scellée
    try { this.dessous(w, rnd, B, R, runesDe(3)); } catch (e) { console.error('R15 : le Dessous', e); }

    // ---- le caveau du bois
    try {
      let best = null;
      for (let essai = 0; essai < 1400 && !best; essai++) {
        const a = rnd() * TAU, d = 250 + Math.sqrt(rnd()) * 550, x = F.x + Math.cos(a) * d, z = F.z + Math.sin(a) * d;
        if (!w.inside(x, z, 80)) continue;
        const mi = typeof milieuAt === 'function' ? milieuAt(w, x, z) : 'foret';
        if (mi !== 'foret' && mi !== 'bouleaux' && mi !== 'sapiniere') continue;
        const y = w.heightAt(x, z);
        if (y < WL + 2) continue;
        let mn = 1e9, mx = -1e9;
        for (let k = 0; k < 12; k++) { const an = k / 12 * TAU; for (const s of [1.5, 3]) { const hh = w.heightAt(x + Math.cos(an) * s, z + Math.sin(an) * s); mn = Math.min(mn, hh); mx = Math.max(mx, hh); } }
        if (mx - mn > 0.9) continue;
        if (pres(x, z, 15) || chemin(x, z, 8) || encombre(x, z, 9)) continue;
        if (!pointFree(w, x, z, 6)) continue;
        let lm = false;
        for (const k in w.lm) { const L = w.lm[k]; if (!L.under && Math.hypot(L.x - x, L.z - z) < (L.r || 20) + 18) { lm = true; break; } }
        if (lm) continue;
        if (this.presDesChemins(w, x, z, 9)) continue;
        if (R.tablettes.some((T) => Math.hypot(T.x - x, T.z - z) < 40)) continue;
        best = { x, z, y: mx, r: rnd() * TAU };
      }
      if (best) {
        // les arbres sur la place s'en vont (comme pour les signes tracés au sol)
        w.query(best.x, best.z, 5, (o) => { if (o && !o.gone && Math.hypot(o.x - best.x, o.z - best.z) < 4.6) { o.gone = true; o.cleared = true; } }, null);
        w.objectsDirty = true;
        const f = { x: best.x, y: best.y, z: best.z, r: best.r };
        R.portes.caveau = this.caveau(w, B, f, 'caveau', { mur: M_MOSSY, dalle: M_STONE, sol: M_STONE });
        B.landmark('r15_caveau', best.x, best.z, 6, { secret: true });
      }
    } catch (e) { console.error('R15 : le caveau', e); }
    w.grid = null; w.blocksDirty = true;
    R.ms = Date.now() - T0;
    return R;
  },

  // les chemins des habitants (graphe de navigation) : à moins de r m d'un tronçon ?
  presDesChemins(w, x, z, r) {
    const N = w.nav;
    if (!N || !N.nodes || !N.edges) return false;
    for (const [a, b] of N.edges) {
      const A = N.nodes[a], Bn = N.nodes[b];
      if (!A || !Bn) continue;
      if (Math.min(A.x, Bn.x) - r > x || Math.max(A.x, Bn.x) + r < x || Math.min(A.z, Bn.z) - r > z || Math.max(A.z, Bn.z) + r < z) continue;
      const dx = Bn.x - A.x, dz = Bn.z - A.z, L2 = dx * dx + dz * dz || 1, t = clamp(((x - A.x) * dx + (z - A.z) * dz) / L2, 0, 1);
      if (Math.hypot(x - A.x - dx * t, z - A.z - dz * t) < r) return true;
    }
    return false;
  },

  // ------------------------------------------------------------- un caveau (vallée, Zone) : murs, toit, une dalle, un coffre
  // f : { x, y (le sol), z, r } ; la porte regarde vers −z local. Renvoie la description de la dalle.
  caveau(w, B, f, id, M) {
    const n0 = w.blocks.length;
    const bl = (lx, ly, lz, sx, sy, sz, m, o) => { B.block(f, lx, ly, lz, sx, sy, sz, m); const b = w.blocks[w.blocks.length - 1]; if (o) Object.assign(b, o); return w.blocks.length - 1; };
    bl(0, -1.6, 0, 3.4, 1.65, 3.8, M.sol);                 // le sol (et le soubassement, sous la terre)
    bl(0, -0.6, 1.6, 3.2, 2.9, 0.4, M.mur);                // le fond
    bl(-1.4, -0.6, 0, 0.4, 2.9, 2.8, M.mur);               // les côtés
    bl(1.4, -0.6, 0, 0.4, 2.9, 2.8, M.mur);
    bl(-1.125, -0.6, -1.6, 0.95, 2.9, 0.4, M.mur);         // la façade, de part et d'autre de la porte
    bl(1.125, -0.6, -1.6, 0.95, 2.9, 0.4, M.mur);
    bl(0, -1.2, -2.2, 1.6, 0.92, 0.8, M.dalle);            // la marche, devant le seuil
    bl(0, 1.9, -1.6, 1.3, 0.4, 0.4, M.dalle);              // le linteau
    bl(0, 2.3, 0, 3.7, 0.3, 4.1, M.dalle);                 // le toit, en deux dalles
    bl(0, 2.6, 0.1, 2.7, 0.26, 3.1, M.mur);
    const ib = bl(0, 0.05, -1.6, 1.3, 1.85, 0.32, M.dalle, { hidden: true, r15: id }); // la dalle (collision ; dessinée à part)
    for (let k = n0; k < w.blocks.length; k++) if (w.blocks[k]) w.blocks[k].r15c = id;
    // le coffre, au fond
    const [cx, cz] = B.toWorld(f, 0, 0.85);
    B.prop('coffre_vieux', cx, f.y + 0.05, cz, f.r + Math.PI, { vide: false });
    const iq = w.props.length - 1;
    const [tx, tz] = B.toWorld(f, 0, 0.45);
    B.inter('r15_tresor', 'r15_tresor_' + id, tx, f.y + 0.75, tz, 'Le coffre', { porte: id, prop: iq });
    const [dx, dz] = B.toWorld(f, 0, -2.05);
    B.inter('r15_porte', 'r15_porte_' + id, dx, f.y + 1.15, dz, 'Une dalle gravée', { porte: id });
    const [sx, sz] = B.toWorld(f, 0, -1.6);
    return { id, x: +f.x.toFixed(2), y: +f.y.toFixed(3), z: +f.z.toFixed(2), r: +f.r.toFixed(4), bloc: ib, coffre: iq,
      dalle: { x: sx, y: f.y + 0.05, z: sz, r: f.r, sx: 1.22, sy: 1.85, sz: 0.3 }, devant: [dx, f.y, dz] };
  },

  // ------------------------------------------------------------- le Dessous : le labyrinthe des Galeries
  dessous(w, rnd, B, R, runes) {
    const M = w.maze;
    if (!M || !M.open) return;
    const { x0, z0, G, y, open } = M, Rc = M.R, NC = MAZE.NC, SP = MAZE.SP;
    const C = (c) => c * SP + 2;
    const isOpen = (i, j) => i >= 0 && j >= 0 && i < G && j < G && open[j * G + i] === 1;
    const centre = (ci, cj) => [x0 + (C(ci) + 1) * Rc, z0 + (C(cj) + 1) * Rc];
    const salle = (ci, cj) => R15_SALLES.some(([a, b]) => Math.max(Math.abs(a - ci), Math.abs(b - cj)) <= 1);
    const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    // un lien vers la cellule voisine : la galerie entre les deux est ouverte
    const lien = (ci, cj, a, b) => {
      const ni = ci + a, nj = cj + b;
      if (ni < 0 || nj < 0 || ni >= NC || nj >= NC) return false;
      return a > 0 ? isOpen(C(ci) + 3, C(cj)) : a < 0 ? isOpen(C(ci) - 1, C(cj)) : b > 0 ? isOpen(C(ci), C(cj) + 3) : isOpen(C(ci), C(cj) - 1);
    };
    // distances depuis l'entrée (cellule 1, 7)
    const dist = new Int32Array(NC * NC).fill(-1), Q = [[1, 7]];
    dist[7 * NC + 1] = 0;
    for (let h = 0; h < Q.length; h++) { const [ci, cj] = Q[h]; for (const [a, b] of DIRS) { if (!lien(ci, cj, a, b)) continue; const k = (cj + b) * NC + ci + a; if (dist[k] < 0) { dist[k] = dist[cj * NC + ci] + 1; Q.push([ci + a, cj + b]); } } }
    const culs = [];
    for (let cj = 0; cj < NC; cj++) for (let ci = 0; ci < NC; ci++) {
      if (dist[cj * NC + ci] < 0 || salle(ci, cj) || !isOpen(C(ci), C(cj))) continue;
      const L = DIRS.filter(([a, b]) => lien(ci, cj, a, b));
      if (L.length !== 1) continue;
      const [a, b] = L[0];
      // la voisine doit mener ailleurs (sinon on scellerait plus qu'une cellule)
      if (DIRS.filter(([c, d]) => lien(ci + a, cj + b, c, d)).length < 2) continue;
      culs.push({ ci, cj, a, b, d: dist[cj * NC + ci] });
    }
    if (!culs.length) return;
    culs.sort((p, q) => q.d - p.d);
    // la tablette : le cul-de-sac le plus loin de l'échelle
    const T = culs[0];
    {
      const [cx, cz] = centre(T.ci, T.cj), x = cx - T.a * 1.05, z = cz - T.b * 1.05;
      const pose = { i: 3, x: +x.toFixed(2), y: +y.toFixed(3), z: +z.toFixed(2), r: +Math.atan2(T.a, T.b).toFixed(3), lieu: 'dessous', runes, sous: true };
      R.tablettes.push(pose);
      B.inter('r15_tablette', 'r15_tab_3', pose.x, pose.y + 0.35, pose.z, 'Une pierre gravée', { i: 3 });
    }
    // la niche : un autre cul-de-sac, loin aussi (parmi la moitié la plus lointaine), pas voisin de la tablette
    const reste = culs.slice(1).filter((c) => Math.max(Math.abs(c.ci - T.ci), Math.abs(c.cj - T.cj)) > 1);
    if (!reste.length) return;
    const N = reste[(rnd() * Math.max(1, Math.ceil(reste.length / 2))) | 0];
    const [cx, cz] = centre(N.ci, N.cj), [vx, vz] = centre(N.ci + N.a, N.cj + N.b);
    const mx = (cx + vx) / 2, mz = (cz + vz) / 2, r = Math.atan2(N.a, N.b) + Math.PI; // la dalle regarde vers la voisine (−z local)
    const f = { x: mx, y, z: mz, r };
    const ib = w.blocks.length;
    w.blocks.push({ x: mx, y, z: mz, sx: 2 * Rc + 0.02, sy: MAZE.Hc, sz: 0.4, r, m: M_CLIFF, sh: 0, hidden: true, under: true, r15: 'niche', r15c: 'niche' });
    // le coffre, au fond du cul-de-sac
    const kx = cx - N.a * 0.9, kz = cz - N.b * 0.9;
    B.prop('coffre_vieux', kx, y, kz, Math.atan2(N.a, N.b), { vide: false });
    const iq = w.props.length - 1;
    B.inter('r15_tresor', 'r15_tresor_niche', kx + N.a * 0.4, y + 0.75, kz + N.b * 0.4, 'Le coffre', { porte: 'niche', prop: iq });
    const [dx, dz] = B.toWorld(f, 0, -0.55);
    B.inter('r15_porte', 'r15_porte_niche', dx, y + 1.15, dz, 'Une dalle gravée', { porte: 'niche' });
    R.portes.niche = { id: 'niche', x: +mx.toFixed(2), y: +y.toFixed(3), z: +mz.toFixed(2), r: +r.toFixed(4), bloc: ib, coffre: iq, sous: true,
      dalle: { x: mx, y, z: mz, r, sx: 2 * Rc - 0.06, sy: MAZE.Hc - 0.02, sz: 0.36 }, devant: [dx, y, dz], cellule: [N.ci, N.cj], tablette: [T.ci, T.cj] };
  },

  // ------------------------------------------------------------- les Terres d'Avant : le tertre scellé (aux Tertres)
  zone(Z, O) {
    const RG = V1_REGIONS.tertres, S = O.S, cx = RG.x * S, cz = RG.z * S, rr = RG.r * S * 0.85;
    let best = null;
    for (let essai = 0; essai < 900 && !best; essai++) {
      const a = O.rnd() * TAU, d = Math.sqrt(O.rnd()) * rr, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
      if (!O.libre(x, z, 6)) continue;
      let mn = 1e9, mx = -1e9;
      for (let k = 0; k < 12; k++) { const an = k / 12 * TAU; for (const s of [1.5, 3]) { const hh = O.hauteur(x + Math.cos(an) * s, z + Math.sin(an) * s); mn = Math.min(mn, hh); mx = Math.max(mx, hh); } }
      if (mx - mn > 1.0) continue;
      best = { x, z, y: mx, r: O.rnd() * TAU };
    }
    if (!best) return;
    Z.query(best.x, best.z, 5, (o) => { if (o && !o.gone && Math.hypot(o.x - best.x, o.z - best.z) < 4.6) { o.gone = true; o.cleared = true; } }, null);
    Z.objectsDirty = true;
    const pierre = typeof M_V1_PIERRE !== 'undefined' ? M_V1_PIERRE : M_STONE;
    const P = this.caveau(Z, O.B, { x: best.x, y: best.y, z: best.z, r: best.r }, 'tertre', { mur: pierre, dalle: M_STONE, sol: pierre });
    P.zone = true;
    Z.r15 = { portes: { tertre: P } };
    O.lieu('r15_tertre', best.x, best.z, 6, LIEU_NAMES.r15_tertre || 'le tertre scellé', { secret: true });
    Z.grid = null; Z.blocksDirty = true;
    // déjà ouvert ? (la Zone se génère à la première entrée : la partie est chargée)
    try { if (farm.s && farm.s.runes && farm.s.runes.p && farm.s.runes.p.tertre) { const b = Z.blocks[P.bloc]; if (b && !b.r15bas) { b.y -= 60; b.r15bas = true; } } } catch (e) { /* rien */ }
  },
};
LIEU_NAMES.r15_caveau = LIEU_NAMES.r15_caveau || 'le caveau du bois';
LIEU_NAMES.r15_tertre = LIEU_NAMES.r15_tertre || 'le tertre scellé';

// la passe de la vallée (la dernière)
{
  const _gv = generateValley;
  generateValley = async function (seed, progress, gen) {
    const w = await _gv(seed, progress, gen);
    if (w && w.designed && w.lm && !w.r15) { try { w.r15 = r15Pose.vallee(w, w.seed !== undefined ? w.seed : seed); } catch (e) { console.error('R15 : la pose', e); } }
    return w;
  };
}
// la passe des Terres d'Avant (après celles de V2…V5)
if (typeof zone !== 'undefined' && zone.passe) zone.passe('R15', (Z, O) => { try { r15Pose.zone(Z, O); } catch (e) { console.error('R15 : le tertre', e); } });
