// ============================================================================
//  LA CAMPAGNE : ON ENTRE DANS CHAQUE BÂTIMENT (agent B2, dixième vague)
//  - Le vieux MOULIN : ses quatre étages (deux boîtes de pierre tournées de 45°
//    chacun) sont creusés, la silhouette ne bouge pas ; une vraie porte là où
//    les planches étaient peintes ; des planchers, des trappes et des échelles
//    jusque sous le chapeau : la salle basse du meunier, l'étage des farines,
//    l'étage des meules, le rouet sur l'arbre des ailes (il tourne avec elles).
//  - Le PHARE : creusé, une porte au pied, cinq étages et la chambre de la
//    lanterne (sa galerie, sa rambarde) ; les affaires du gardien.
//  - Les PIGEONNIERS des lieux perdus : creusés, une porte, les boulins,
//    l'échelle tournante, des pigeons, un roucoulement doux, de jour.
//  - Les LOGES DES CHARBONNIERS : une vraie loge de perches et de mottes où
//    l'on entre debout ; la couche de fougères, la marmite, les outils.
//  - Le CLOCHER ENGLOUTI : creusé, une baie là où le rectangle sombre était
//    peint ; le mouton, la corde, les abat-sons ; la cloche, les nuits d'orage.
//  - On grimpe aux échelles pour de vrai (on voit les barreaux défiler, la
//    trappe se soulever) ; on fouille (11-zzz98-fouilles.js : lieux abandonnés,
//    leurs papiers) ; on dort dans les lits (11-zzz95-sommeil.js).
//  - La carte des abris (05-world.js computeCover) ne garde qu'un plafond par
//    case : sous un chapeau plus étroit que le pied de la tour, on serait
//    « dehors » au bord des pièces. Chaque pièce dit donc sa hauteur d'abri
//    (w.b2abris), que l'emballage de computeCover reporte sur la carte.
//  Génération : après tout le reste (emballage de generateValley, après la ville
//  de 11-zzzzB1), tirage propre mulberry32(graine ^ 0xB2CA4E). On AJOUTE au bout
//  des listes (objets posés, interactions, portes) ; les blocs pleins d'avant
//  deviennent l'un de leurs murs, les autres morceaux s'ajoutent au bout.
//  État : farm.s.campagne = { v, ech: {lieu: angle}, vus: {clé: jour} }.
//  API : campagne (grimper(it), S(), dans(cle)).
// ============================================================================

// ---------------------------------------------------------------- géométrie
// repère f = { x, y, z, r } : local (lx, lz) → monde, et l'inverse
function b2W(f, lx, lz) { const c = Math.cos(f.r), s = Math.sin(f.r); return [f.x + lx * c + lz * s, f.z - lx * s + lz * c]; }
function b2L(f, x, z) { const c = Math.cos(f.r), s = Math.sin(f.r), dx = x - f.x, dz = z - f.z; return [dx * c - dz * s, dx * s + dz * c]; }
// un bloc au bout de la liste (y : le bas, en coordonnées du monde)
function b2Bloc(w, f, lx, y, lz, sx, sy, sz, m, rr, extra) {
  const [x, z] = b2W(f, lx, lz);
  const b = { x, y, z, sx, sy, sz, r: f.r + (rr || 0), m, sh: 0 };
  if (extra) Object.assign(b, extra);
  w.blocks.push(b);
  return b;
}
// un mur percé : ce qui reste d'une bande de longueur L et de hauteur H, ouvertures [u0, u1, h0, h1] ; renvoie [u0, u1, h0, h1] pleins
function b2Morceaux(L, H, ouv) {
  const xs = [-L / 2, L / 2];
  for (const o of ouv) for (const u of [o[0], o[1]]) if (u > -L / 2 + 0.01 && u < L / 2 - 0.01) xs.push(u);
  xs.sort((a, b) => a - b);
  const cols = [];
  for (let i = 0; i < xs.length - 1; i++) {
    const a = xs[i], b = xs[i + 1];
    if (b - a < 0.01) continue;
    const m = (a + b) / 2, trous = ouv.filter((o) => o[0] < m && o[1] > m).map((o) => [Math.max(0, o[2]), Math.min(H, o[3])]).sort((p, q) => p[0] - q[0]);
    let h = 0;
    const P = [];
    for (const [t0, t1] of trous) { if (t0 > h + 0.01) P.push([h, t0]); h = Math.max(h, t1); }
    if (H > h + 0.01) P.push([h, H]);
    cols.push({ a, b, P });
  }
  // (les colonnes voisines aux mêmes hauteurs ne font qu'un bloc)
  const out = [];
  for (const c of cols) for (const [h0, h1] of c.P) {
    const prev = out.find((q) => Math.abs(q[1] - c.a) < 0.001 && Math.abs(q[2] - h0) < 0.001 && Math.abs(q[3] - h1) < 0.001);
    if (prev) prev[1] = c.b; else out.push([c.a, c.b, h0, h1]);
  }
  return out;
}
// creuse une boîte pleine (bloc sans forme) : ses quatre murs d'épaisseur t ; le bloc d'origine devient le premier morceau
// ouv : { '-z': [[u0, u1, h0, h1]…], '+z', '-x', '+x' } (u le long du mur, en repère du bloc ; h depuis le bas du bloc)
function b2Creuser(w, b, t, ouv) {
  ouv = ouv || {};
  const hx = b.sx / 2, hz = b.sz / 2, H = b.sy, P = [];
  const faces = [['-z', 0, -hz + t / 2, b.sx, true], ['+z', 0, hz - t / 2, b.sx, true], ['-x', -hx + t / 2, 0, b.sz - 2 * t, false], ['+x', hx - t / 2, 0, b.sz - 2 * t, false]];
  for (const [k, cx, cz, L, alongX] of faces) for (const [u0, u1, h0, h1] of b2Morceaux(L, H, ouv[k] || [])) {
    const um = (u0 + u1) / 2;
    P.push(alongX ? { lx: um, lz: cz, sx: u1 - u0, sz: t, h0, h1 } : { lx: cx, lz: um, sx: t, sz: u1 - u0, h0, h1 });
  }
  const f = { x: b.x, z: b.z, r: b.r }, y0 = b.y, base = { r: b.r, m: b.m, sh: 0 };
  if (b.ver) base.ver = b.ver;
  P.forEach((q, i) => {
    const [x, z] = b2W(f, q.lx, q.lz), nb = Object.assign({}, base, { x, y: y0 + q.h0, z, sx: q.sx, sy: q.h1 - q.h0, sz: q.sz });
    if (i === 0) { for (const k of Object.keys(b)) delete b[k]; Object.assign(b, nb); } else w.blocks.push(nb);
  });
  return P.length;
}
// la seconde boîte d'un étage (tournée de 45°) : il n'en reste que ses quatre coins qui dépassent de la première (les
// « bosses »), chacun un petit bloc du même repère, logé pour moitié dans l'épaisseur du mur ; renvoie { prof, bosses }
// (prof : jusqu'où les bosses rentrent dans la première boîte — le mur doit être plus épais)
function b2Bosses(A, Bb) {
  const h = A.sx / 2, bx = Bb.sx / 2, bz = Bb.sz / 2, fA = { x: A.x, z: A.z, r: A.r }, fB = { x: Bb.x, z: Bb.z, r: Bb.r };
  const dedans = (lx, lz) => { const [x, z] = b2W(fB, lx, lz), [ax, az] = b2L(fA, x, z); return Math.max(Math.abs(ax), Math.abs(az)) <= h + 1e-6; };
  const out = [];
  let prof = 0;
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    if (dedans(sx * bx, sz * bz)) continue;
    // le long des deux faces, depuis le coin : où l'on rentre dans la première boîte
    let a0 = 0, a1 = 2 * bx; for (let i = 0; i < 40; i++) { const m = (a0 + a1) / 2; if (dedans(sx * (bx - m), sz * bz)) a1 = m; else a0 = m; }
    let c0 = 0, c1 = 2 * bz; for (let i = 0; i < 40; i++) { const m = (c0 + c1) / 2; if (dedans(sx * bx, sz * (bz - m))) c1 = m; else c0 = m; }
    const ax = a1, cz = c1, lx = sx * (bx - ax / 2), lz = sz * (bz - cz / 2);
    const [ix, iz] = b2W(fB, sx * (bx - ax), sz * (bz - cz)), [jx, jz] = b2L(fA, ix, iz);
    prof = Math.max(prof, h - Math.max(Math.abs(jx), Math.abs(jz)));
    const [x, z] = b2W(fB, lx, lz), [ux, uz] = b2L(fA, x, z);
    // (où la bosse s'appuie sur la face : la face, et l'intervalle qu'elle y couvre, en repère de la première boîte)
    const P1 = b2L(fA, ...b2W(fB, sx * (bx - ax), sz * bz)), P2 = b2L(fA, ...b2W(fB, sx * bx, sz * (bz - cz)));
    const surX = Math.abs(ux) > Math.abs(uz), face = surX ? (ux > 0 ? '+x' : '-x') : (uz > 0 ? '+z' : '-z');
    const u0 = surX ? Math.min(P1[1], P2[1]) : Math.min(P1[0], P2[0]), u1 = surX ? Math.max(P1[1], P2[1]) : Math.max(P1[0], P2[0]);
    out.push({ x, z, sx: ax, sz: cz, ux, uz, face, u0, u1 });
  }
  return { prof, bosses: out };
}
// transforme la seconde boîte en ses bosses (garde : (bosse) → faux pour en écarter une, ex. devant une porte)
function b2PoserBosses(w, Bb, bosses) {
  const base = { y: Bb.y, sy: Bb.sy, r: Bb.r, m: Bb.m, sh: 0 };
  if (Bb.ver) base.ver = Bb.ver;
  bosses.forEach((q, i) => {
    const nb = Object.assign({}, base, { x: q.x, z: q.z, sx: q.sx, sz: q.sz });
    if (i === 0) { for (const k of Object.keys(Bb)) delete Bb[k]; Object.assign(Bb, nb); } else w.blocks.push(nb);
  });
  if (!bosses.length) Object.assign(Bb, { sx: 0.01, sz: 0.01, sy: 0.01, hidden: true });
}
// un plancher (plafond de la pièce du dessous : b.plafond) percé d'une trémie carrée (trou : [lx, lz, demi-côté])
function b2Plancher(w, f, ytop, ep, hx, hz, m, trou) {
  const y = ytop - ep, X = { plafond: true };
  if (!trou) { b2Bloc(w, f, 0, y, 0, 2 * hx, ep, 2 * hz, m, 0, X); return; }
  const [tx, tz, th] = trou, x0 = tx - th, x1 = tx + th, z0 = tz - th, z1 = tz + th;
  if (x0 > -hx) b2Bloc(w, f, (-hx + x0) / 2, y, 0, x0 + hx, ep, 2 * hz, m, 0, X);
  if (x1 < hx) b2Bloc(w, f, (x1 + hx) / 2, y, 0, hx - x1, ep, 2 * hz, m, 0, X);
  const a = Math.max(-hx, x0), b = Math.min(hx, x1);
  if (z0 > -hz) b2Bloc(w, f, (a + b) / 2, y, (-hz + z0) / 2, b - a, ep, z0 + hz, m, 0, X);
  if (z1 < hz) b2Bloc(w, f, (a + b) / 2, y, (z1 + hz) / 2, b - a, ep, hz - z1, m, 0, X);
}
// une baie qui laisse entrer le jour (voir campagne.lumieres) : le point, côté pièce
function b2Jour(w, f, lx, y, lz, k) { const [x, z] = b2W(f, lx, lz); (w.b2jour || (w.b2jour = [])).push({ x, y, z, k: k || 1 }); }
// les ouvertures qu'il faut dans les murs d'une boîte (tournée) pour qu'un passage la traverse : le passage est la bande
// |X − xc| ≤ demi (repère f), du côté Z > zmin ; renvoie { '-z': [[u0, u1, h0, h1]…], … } pour b2Creuser
function b2Percee(b, t, f, xc, demi, zmin, h0, h1) {
  const hx = b.sx / 2, hz = b.sz / 2, fb = { x: b.x, z: b.z, r: b.r }, out = {};
  const faces = [['-z', (u, v) => [u, -hz + v], b.sx], ['+z', (u, v) => [u, hz - v], b.sx], ['-x', (u, v) => [-hx + v, u], b.sz - 2 * t], ['+x', (u, v) => [hx - v, u], b.sz - 2 * t]];
  for (const [k, P, L] of faces) {
    let a = null, z = null;
    for (let u = -L / 2; u <= L / 2 + 1e-6; u += 0.02) {
      let dedans = false;
      for (const v of [0.01, t / 2, t - 0.01]) { const [lx, lz] = P(u, v), [X, Z] = b2L(f, ...b2W(fb, lx, lz)); if (Math.abs(X - xc) <= demi && Z > zmin) dedans = true; }
      if (dedans) { if (a === null) a = u; z = u; }
    }
    if (a !== null) out[k] = [[a - 0.02, z + 0.02, h0, h1]];
  }
  return out;
}
// la hauteur d'abri d'une pièce (voir l'emballage de computeCover plus bas)
function b2Abri(w, f, hx, hz, y) { (w.b2abris || (w.b2abris = [])).push({ x: f.x, z: f.z, r: f.r, hx, hz, y }); }
// les blocs proches d'un point (x, z), filtrés
function b2Blocs(w, x, z, r, fn) { return w.blocks.filter((b) => Math.abs(b.x - x) < r && Math.abs(b.z - z) < r && (!fn || fn(b))); }
const b2Pres = (a, b, e) => Math.abs(a - b) < (e || 0.02);

// ---------------------------------------------------------------- les morceaux communs
// G : { w, B (Builder), rnd, n (compteurs) }
function b2Prop(G, f, id, lx, y, lz, rr, data, s) { const [x, z] = b2W(f, lx, lz); G.np++; return G.B.prop(id, x, y, z, f.r + (rr || 0), data || null, s); }
function b2Inter(G, f, kind, id, lx, y, lz, label, data) { const [x, z] = b2W(f, lx, lz); G.ni++; return G.B.inter(kind, id, x, y, z, label, data || {}); }
// une échelle entre deux niveaux, par une trappe : o = { id, trou: [lx, lz] (milieu de la trémie), d : direction (rad, repère f)
// vers laquelle on grimpe (l'échelle est de ce côté de la trémie), yB, yH (sols du bas et du haut), th (demi-côté), lieu }
function b2Echelle(G, f, o) {
  const w = G.w, th = o.th || 0.5, [tx, tz] = o.trou, dx = Math.sin(o.d || 0), dz = Math.cos(o.d || 0);
  const L = (k) => [tx + dx * k, tz + dz * k];
  // l'échelle, contre le bord de la trémie (du côté où l'on grimpe), du sol du bas jusque sous le plancher
  const [ex, ez] = L(th - 0.07);
  b2Prop(G, f, 'echelle', ex, o.yB, ez, o.d || 0, { h: o.yH - 0.14 - o.yB });
  // la trappe (fermée, à plat sur la trémie ; elle se soulève quand on passe) et, dessous, un fond qu'on ne voit pas, pour
  // qu'on marche dessus quand elle est fermée
  const tr = b2Prop(G, f, 'trappe', tx, o.yH + 0.004, tz, (o.d || 0) + Math.PI, { open: false }, th / 0.5);
  const iTr = w.props.length - 1;
  b2Bloc(w, f, tx, o.yH - 0.1, tz, 2 * th - 0.02, 0.1, 2 * th - 0.02, M_PLANKS, 0, { hidden: true, plafond: true });
  const bas = L(-0.08), sortieBas = L(-th - 0.42), haut = L(-th - 0.45);
  const W = (p, y) => { const [x, z] = b2W(f, p[0], p[1]); return [x, y, z]; };
  const yaw = f.r + (o.d || 0) + Math.PI; // (le joueur regarde vers l'échelle : son « devant » est −z de la caméra)
  const dataBase = { tr: iTr, col: W(bas, o.yB), yB: o.yB, yH: o.yH, yaw, lieu: o.lieu || '' };
  const [mx, mz] = L(th - 0.3);
  b2Inter(G, f, 'b2_echelle', o.id + ':monter', mx, o.yB + 1.15, mz, 'Monter à l’échelle', Object.assign({ to: W(haut, o.yH), niv: o.yB, sens: 1 }, dataBase));
  b2Inter(G, f, 'b2_echelle', o.id + ':descendre', tx, o.yH + 0.35, tz, 'Descendre l’échelle', Object.assign({ to: W(sortieBas, o.yB), niv: o.yH, sens: -1 }, dataBase));
  return tr;
}
// un endroit à fouiller (11-zzz98-fouilles.js) : un meuble posé (pid) et son interaction ; abandonné : personne ne s'en
// plaint, mais un témoin le prend mal
function b2Fouille(G, f, pid, t, lx, y, lz, rr, o) {
  const id = 'b2:' + o.slot;
  if (G.w.inter.some((i) => i.id === id)) return null;
  let q = null;
  if (pid) { q = b2Prop(G, f, pid, lx, y, lz, rr, { vide: false }); q.f2 = id; }
  const c = pid && PROP_COLL[pid], d = (c ? c[1] : 0.25) + 0.3, r = f.r + (rr || 0);
  const [px, pz] = b2W(f, lx, lz);
  const ix = o.ix !== undefined ? b2W(f, o.ix, o.iz)[0] : px + Math.sin(r) * d, iz = o.ix !== undefined ? b2W(f, o.ix, o.iz)[1] : pz + Math.cos(r) * d;
  G.ni++;
  return G.B.inter('f2', id, ix, y + (o.h ?? F2_TYPES[t].h), iz, o.lab || F2_TYPES[t].lab, { t, table: o.table, own: null, bld: null, lieu: 'abandon', pool: o.pool || null, nomLieu: o.nomLieu || '' });
}

// ---------------------------------------------------------------- le vieux moulin
// quatre étages de pierre (côtés 6 ; 5,4 ; 4,8 ; 4,2), chacun une boîte et une boîte tournée de 45° ; le chapeau de chaume ;
// les planches peintes de la porte (z local −3,02) ; les ailes (moulin_ailes) à z −3,4, à la hauteur de l'arbre
function b2Moulin(G) {
  const w = G.w, L = w.lm && w.lm.moulin;
  if (!L) return;
  const pres = b2Blocs(w, L.x, L.z, 4.5, (b) => !b.hidden && !b.under);
  const A = [], Bq = [];
  for (let k = 0; k < 4; k++) {
    const s = 6 - k * 0.6;
    A[k] = pres.find((b) => b.m === M_STONE && !b.sh && b2Pres(b.sx, s) && b2Pres(b.sz, s) && b2Pres(b.sy, 3.2) && Math.hypot(b.x - L.x, b.z - L.z) < 0.3);
    Bq[k] = pres.find((b) => b.m === M_STONE && !b.sh && b2Pres(b.sx, s * 0.7) && b2Pres(b.sz, s * 1.02) && b2Pres(b.sy, 3.2) && Math.hypot(b.x - L.x, b.z - L.z) < 0.3);
  }
  const toit = pres.find((b) => b.m === M_THATCH && b.sh === 3 && b2Pres(b.sx, 4.4));
  const planches = pres.find((b) => b.m === M_PLANKS && b2Pres(b.sx, 1.4) && b2Pres(b.sy, 2.2) && b2Pres(b.sz, 0.1));
  if (A.some((b) => !b) || Bq.some((b) => !b) || !toit || !planches) return;
  const f = { x: A[0].x, y: A[0].y + 0.5, z: A[0].z, r: A[0].r }, Y = f.y, nom = 'le vieux moulin';
  // les sols (dessus des planchers) et les pièces
  const S = [Y + 0.1, Y + 2.75, Y + 5.95, Y + 9.15], plafondHaut = toit.y;
  const R = [], T = [];
  // les ouvertures, par étage : la porte (devant, −z), des fenêtres (hors des bosses), la baie devant les ailes
  const fen = (u0, h0) => [u0, u0 + 0.5, h0, h0 + 0.7];
  const OUV = [
    { '-z': [[-0.65, 0.65, 0.6, 2.75]], '-x': [fen(0.55, 1.6)] },
    { '+x': [fen(-1.0, 1.05)] },
    { '+z': [fen(-0.9, 1.05)], '-z': [fen(0.3, 1.05)] },
    { '+x': [fen(-0.8, 1.0)], '-x': [fen(0.3, 1.0)] },
  ];
  for (let k = 0; k < 4; k++) {
    const B0 = b2Bosses(A[k], Bq[k]);
    T[k] = Math.max(0.45, B0.prof + 0.05);
    R[k] = A[k].sx / 2 - T[k];
    let bosses = B0.bosses;
    if (k === 0) {
      // devant la porte : la bosse de gauche est retaillée en jambage (bloc droit, dehors seulement)
      const gene = bosses.find((q) => q.uz < -2.5 && q.ux > -1.6 && q.ux < 0.2);
      if (gene) {
        bosses = bosses.filter((q) => q !== gene);
        b2Bloc(w, f, -1.04, A[0].y, -3.3, 0.58, A[0].sy, 0.6, M_STONE);
        b2Bloc(w, f, 1.0, A[0].y, -3.15, 0.5, 2.95, 0.3, M_STONE);
      }
    }
    b2PoserBosses(w, Bq[k], bosses);
    b2Creuser(w, A[k], T[k], OUV[k]);
  }
  // les planches peintes deviennent le linteau de la vraie porte
  Object.assign(planches, { y: Y + 2.25, sy: 0.22, sx: 1.6, sz: 0.16 });
  { const [x, z] = b2W(f, 0, -3.02); planches.x = x; planches.z = z; }
  w.doors.push({ x: b2W(f, 0, -3 + 0.12)[0], y: S[0] + 0.01, z: b2W(f, 0, -3 + 0.12)[1], r: f.r, w: 1.24, h: 2.1, a: 0, open: 0, locked: false, bld: null, m: M_PLANKS });
  G.nd++;
  // un seuil de pierre devant la porte (le sol dedans est à +0,1)
  b2Bloc(w, f, 0, Y - 0.3, -3.25, 1.3, 0.38, 0.5, M_STONE);
  // les planchers : le dallage du bas, puis trois planchers de bois percés d'une trémie
  b2Bloc(w, f, 0, Y - 0.5, 0, 2 * R[0] + 0.1, 0.6, 2 * R[0] + 0.1, M_COBBLE);
  const TR = [null, [1.3, 1.3], [-1.2, 1.2], [0.95, 1.0]];
  for (let k = 1; k < 4; k++) b2Plancher(w, f, S[k], 0.2, R[k - 1] + 0.12, R[k - 1] + 0.12, M_PLANKS, [TR[k][0], TR[k][1], 0.5]);
  // les hauteurs d'abri (chaque pièce : le dessous du plancher d'au-dessus ; la dernière : le chapeau)
  for (let k = 0; k < 4; k++) b2Abri(w, f, A[k].sx / 2, A[k].sx / 2, k < 3 ? S[k + 1] - 0.2 : plafondHaut);
  // le jour qui entre par la porte et les fenêtres (un point par baie, côté pièce)
  b2Jour(w, f, 0, S[0] + 1.2, -R[0] + 0.5, 1.3); b2Jour(w, f, -R[0] + 0.45, S[0] + 1.4, 0.8);
  b2Jour(w, f, R[1] - 0.45, S[1] + 1.3, -0.75);
  b2Jour(w, f, -0.65, S[2] + 1.3, R[2] - 0.45); b2Jour(w, f, 0.55, S[2] + 1.3, -R[2] + 0.45);
  b2Jour(w, f, R[3] - 0.45, S[3] + 1.3, -0.55); b2Jour(w, f, -R[3] + 0.45, S[3] + 1.3, 0.55);
  // les échelles (on grimpe vers +z : les échelles sont contre le bord arrière des trémies)
  for (let k = 1; k < 4; k++) b2Echelle(G, f, { id: 'b2:moulin:' + k, trou: TR[k], d: 0, yB: S[k - 1], yH: S[k], lieu: nom });
  // ------------------------------------------------ la salle basse : le coin du meunier
  b2Prop(G, f, 'lit', -1.7, S[0], 0.62, Math.PI, { col: '#6a6050' });
  b2Prop(G, f, 'table', -1.35, S[0], -1.55, 0);
  b2Prop(G, f, 'chaise', -1.35, S[0], -0.82, Math.PI);
  b2Prop(G, f, 'lanterne_sol', -1.05, S[0] + 0.79, -1.62, 0);
  b2Prop(G, f, 'sacs', 1.62, S[0], -1.6, 0.4);
  b2Prop(G, f, 'tonneau_vieux', 1.95, S[0], 0.15, 0);
  b2Prop(G, f, 'b2_habits', 2.28, S[0], -0.7, -Math.PI / 2);
  b2Prop(G, f, 'b2_poussiere', 1.1, S[0], 0.7, 0.4, { n: 6, s: 3 });
  b2Fouille(G, f, 'malle', 'malle', -0.35, S[0], 1.98, Math.PI, { slot: 'moulin:malle', table: 'b2_meunier', pool: 'b2_moulin', lab: 'Ouvrir la malle du meunier', nomLieu: nom });
  // ------------------------------------------------ l'étage des farines
  b2Prop(G, f, 'b2_bluterie', -0.85, S[1], -1.58, -Math.PI / 2);
  b2Fouille(G, f, 'petrin', 'petrin', 1.72, S[1], -0.85, -Math.PI / 2, { slot: 'moulin:huche', table: 'b2_huche', lab: 'Ouvrir la huche à farine', nomLieu: nom });
  b2Prop(G, f, 'b2_goulotte', 0.25, S[1], -0.45, 0.2);
  b2Prop(G, f, 'sac', -0.2, S[1], 1.75, 0.3); b2Prop(G, f, 'sac', 0.3, S[1], 1.8, -0.2); b2Prop(G, f, 'sac', 0.0, S[1], 1.45, 1.2);
  b2Prop(G, f, 'b2_poussiere', -0.5, S[1], -0.7, 0, { n: 7, s: 5 });
  // ------------------------------------------------ l'étage des meules
  const meules = b2Prop(G, f, 'b2_meules', 0, S[2], -0.3, 0);
  b2Inter(G, f, 'f2', 'b2:moulin:meule', 0.0, S[2] + 1.0, 0.55, 'Passer la main sous l’archure', { t: 'sacs_grain', table: 'b2_meule', own: null, bld: null, lieu: 'abandon', nomLieu: nom });
  meules.f2 = 'b2:moulin:meule';
  b2Prop(G, f, 'b2_marteaux', -1.78, S[2], -0.6, Math.PI / 2);
  b2Prop(G, f, 'sac', -1.25, S[2], -1.2, 0.5);
  b2Prop(G, f, 'b2_poussiere', 0.6, S[2], 0.9, 0, { n: 5, s: 7 });
  // ------------------------------------------------ sous le chapeau : le rouet sur l'arbre des ailes, la lanterne, le frein
  b2Prop(G, f, 'b2_rouet', 0, S[3], -0.75, 0);
  b2Prop(G, f, 'treuil', -0.95, S[3], 1.1, 0);
  // (des pas dans la farine : ils montent de la trappe et vont jusqu'au mur)
  b2Prop(G, f, 'b2_traces', 0.8, S[3], 0.1, -Math.PI / 2 - 0.04, { n: 6 });
  w.b2.moulin = { x: f.x, z: f.z, y: Y, r: f.r, S, R, nom };
}

// ---------------------------------------------------------------- le phare
// un socle de pierre (6 × 1,6 × 6), cinq étages (côtés 4,6 à 3,4 ; enduit et brique) faits chacun d'une boîte et d'une boîte
// tournée de 45° ; la plate-forme de fer, la chambre de verre dépoli, le toit en flèche ; la lanterne_sol au milieu du verre
function b2Phare(G) {
  const w = G.w, L = w.lm && w.lm.phare;
  if (!L) return;
  const pres = b2Blocs(w, L.x, L.z, 4, (b) => !b.hidden && !b.under);
  const socle = pres.find((b) => b.m === M_STONE && !b.sh && b2Pres(b.sx, 6) && b2Pres(b.sy, 1.6) && b2Pres(b.sz, 6));
  if (!socle) return;
  const y0 = socle.y + 1, f0 = { x: socle.x, y: y0, z: socle.z, r: socle.r }, A = [], Bq = [];
  for (let k = 0; k < 5; k++) {
    const s = 4.6 - k * 0.3, m = k % 2 ? M_BRICK : M_PLASTER, yk = y0 + 0.6 + 3.2 * k;
    A[k] = pres.find((b) => b.m === m && !b.sh && b2Pres(b.sx, s) && b2Pres(b.sz, s) && b2Pres(b.y, yk, 0.05));
    Bq[k] = pres.find((b) => b.m === m && !b.sh && b2Pres(b.sx, s * 0.72) && b2Pres(b.sz, s * 1.02) && b2Pres(b.y, yk, 0.05));
  }
  const plat = pres.find((b) => b.m === M_METAL && b2Pres(b.sx, 4.2) && b2Pres(b.sy, 0.3));
  const verre = pres.find((b) => b.m === M_FROSTED && b2Pres(b.sx, 2.8) && b2Pres(b.sy, 2.2));
  const toit = pres.find((b) => b.m === M_ROOF && b.sh === 3 && b2Pres(b.sx, 3.4));
  if (A.some((b) => !b) || Bq.some((b) => !b) || !plat || !verre || !toit) return;
  const nom = 'le phare';
  // la porte : sur la face qui regarde la terre ferme (le plus haut, pas dans l'eau) ; repère fD : la porte en −z
  const WL = w.waterLevel, faces = [['-z', 0], ['+x', Math.PI / 2], ['+z', Math.PI], ['-x', -Math.PI / 2]];
  let best = null;
  for (const [k, rot] of faces) {
    const fD = { x: f0.x, y: y0, z: f0.z, r: f0.r + rot }, [x, z] = b2W(fD, 0, -4.6), [x2, z2] = b2W(fD, 0, -7), h = Math.min(w.heightAt(x, z), w.heightAt(x2, z2));
    const sc = (h > WL + 0.3 ? 0 : 100) - h;
    if (!best || sc < best.sc) best = { k, rot, sc };
  }
  const f = { x: f0.x, y: y0, z: f0.z, r: f0.r + best.rot }, faceDe = (fk, rot) => {
    // la face d'une boîte (repère f0) qui se trouve, dans le repère f, du côté −z, +x… (rot : de f0 à f)
    const ordre = ['-z', '+x', '+z', '-x'], i = ordre.indexOf(fk), q = Math.round(rot / (Math.PI / 2));
    return ordre[((i - q) % 4 + 4) % 4];
  };
  // (dans le repère f, l'axe u d'une face de f0 peut être inversé : on passe par le monde pour placer les ouvertures)
  const S = [], R = [], T = [], BOS = [];
  for (let k = 0; k < 5; k++) {
    const B0 = b2Bosses(A[k], Bq[k]);
    T[k] = Math.max(0.36, B0.prof + 0.05); R[k] = A[k].sx / 2 - T[k]; BOS[k] = B0.bosses;
    S[k] = k ? A[k].y + 0.2 : y0 + 0.6;
  }
  S[5] = plat.y + plat.sy;
  // une baie sur la face « côté » (repère f) de l'étage k, centrée en u (repère f, le long de la face), hors des bosses
  const ouv = [{}, {}, {}, {}, {}];
  const faceF = (cote) => faceDe(cote, best.rot);
  // u (repère f) → u (repère du bloc) : le long d'une face, l'axe du bloc va dans le même sens ou dans l'autre
  const uBloc = (cote, u) => {
    const k0 = A[0], fb = { x: k0.x, z: k0.z, r: k0.r };
    const P = cote === '-z' ? [u, -1] : cote === '+z' ? [u, 1] : cote === '-x' ? [-1, u] : [1, u];
    const [x, z] = b2W(f, P[0], P[1]), [lx, lz] = b2L(fb, x, z), fk = faceF(cote);
    return fk === '-z' || fk === '+z' ? lx : lz;
  };
  const baie = (k, cote, u, demi, h0, h1) => {
    const fk = faceF(cote), a = uBloc(cote, u - demi), b = uBloc(cote, u + demi);
    (ouv[k][fk] || (ouv[k][fk] = [])).push([Math.min(a, b), Math.max(a, b), h0, h1]);
  };
  // la bosse d'une face (repère f) : son intervalle le long de la face, en u du repère f
  const bosseDe = (k, cote) => {
    const fk = faceF(cote), q = BOS[k].find((b) => b.face === fk);
    if (!q) return null;
    const ends = [q.u0, q.u1].map((ub) => {
      const k0 = A[0], fb = { x: k0.x, z: k0.z, r: k0.r }, P = fk === '-z' || fk === '+z' ? [ub, fk === '-z' ? -1 : 1] : [fk === '-x' ? -1 : 1, ub];
      const [x, z] = b2W(fb, P[0], P[1]), [lx, lz] = b2L(f, x, z);
      return cote === '-z' || cote === '+z' ? lx : lz;
    });
    return [Math.min(...ends), Math.max(...ends)];
  };
  // une place libre sur une face pour une baie de demi-largeur d : le plus près du milieu, hors de la bosse
  const placeLibre = (k, cote, d, pref) => {
    const bo = bosseDe(k, cote), lim = R[k] - d - 0.15;
    const ok = (u) => Math.abs(u) <= lim && !(bo && u + d > bo[0] - 0.12 && u - d < bo[1] + 0.12);
    for (const u of pref || [0, 0.3, -0.3, 0.6, -0.6, 0.9, -0.9, 1.1, -1.1]) if (ok(u)) return u;
    return null;
  };
  // la porte (repère f : face −z)
  const uP = placeLibre(0, '-z', 0.55, [0.8, -0.8, 0.6, -0.6, 0.4, -0.4]);
  if (uP === null) return;
  const sg = uP > 0 ? 1 : -1; // (les échelles tournent du côté opposé)
  baie(0, '-z', uP, 0.55, 0, 2.15);
  // des fenêtres : une par étage (la chambre de veille : sur ses quatre faces)
  const fenetres = [];
  const fen = (k, cote, h) => { const u = placeLibre(k, cote, 0.24); if (u === null) return; baie(k, cote, u, 0.24, h, h + 0.62); fenetres.push([k, cote, u, h]); };
  fen(0, '+x', 1.2); fen(1, '-x', 1.25); fen(2, '+z', 1.25); fen(3, '+x', 1.25);
  for (const c of ['-z', '+z', '-x', '+x']) fen(4, c, 1.05);
  for (let k = 0; k < 5; k++) { b2PoserBosses(w, Bq[k], BOS[k]); b2Creuser(w, A[k], T[k], ouv[k]); }
  // la porte, la marche, le seuil
  w.doors.push({ x: b2W(f, uP, -A[0].sx / 2 + 0.12)[0], y: S[0] + 0.01, z: b2W(f, uP, -A[0].sx / 2 + 0.12)[1], r: f.r, w: 1.04, h: 2.1, a: 0, open: 0, locked: false, bld: null, m: M_PLANKS });
  G.nd++;
  b2Bloc(w, f, uP, y0 - 0.4, -3.32, 1.4, 0.7, 0.64, M_STONE);
  // les planchers (percés), la plate-forme de la lanterne (percée), la chambre de verre (creusée, une baie vers la galerie)
  const th = 0.4, coin = (k) => R[k] - th - 0.12;
  const TR = [null, [-sg * coin(1), coin(1), 0], [sg * coin(2), coin(2), 0], [sg * coin(3), -coin(3), Math.PI], [-sg * coin(4), -coin(4), Math.PI]];
  const c5 = Math.min(R[4], 1.32) - th - 0.12;
  TR[5] = [-sg * c5, c5, 0];
  for (let k = 1; k < 5; k++) b2Plancher(w, f, S[k], 0.2, R[k - 1] + 0.12, R[k - 1] + 0.12, M_PLANKS, [TR[k][0], TR[k][1], th]);
  // la plate-forme : le bloc d'origine devient l'un des morceaux autour de la trémie
  {
    const n0 = w.blocks.length;
    b2Plancher(w, f, S[5], plat.sy, plat.sx / 2, plat.sz / 2, M_METAL, [TR[5][0], TR[5][1], th]);
    const P = w.blocks.splice(n0); // (les morceaux que l'on vient d'ajouter : le premier remplace la plate-forme)
    Object.assign(plat, P[0], { r: P[0].r }); for (let i = 1; i < P.length; i++) w.blocks.push(P[i]);
  }
  b2Creuser(w, verre, 0.08, { [faceF(sg > 0 ? '+x' : '-x')]: [[-0.42, 0.42, 0, 2.0]] });
  // la rambarde de la galerie (on ne l'enjambe pas)
  for (const [lx, lz, sx, sz] of [[0, -2.07, 4.2, 0.06], [0, 2.07, 4.2, 0.06], [-2.07, 0, 0.06, 4.08], [2.07, 0, 0.06, 4.08]]) b2Bloc(w, f, lx, S[5], lz, sx, 1.12, sz, M_METAL);
  for (const [lx, lz] of [[-2.07, -2.07], [2.07, -2.07], [-2.07, 2.07], [2.07, 2.07]]) b2Bloc(w, f, lx, S[5], lz, 0.1, 1.18, 0.1, M_METAL);
  // les abris : chaque étage jusqu'au dessous du plancher suivant ; la chambre de la lanterne, jusqu'au toit
  for (let k = 0; k < 5; k++) b2Abri(w, f, A[k].sx / 2, A[k].sx / 2, k < 4 ? S[k + 1] - 0.2 : plat.y);
  b2Abri(w, f, 1.4, 1.4, toit.y);
  // les échelles
  for (let k = 1; k <= 5; k++) b2Echelle(G, f, { id: 'b2:phare:' + k, trou: [TR[k][0], TR[k][1]], d: TR[k][2], th, yB: S[k - 1], yH: S[k], lieu: nom });
  // le jour aux baies
  b2Jour(w, f, uP, S[0] + 1.2, -R[0] + 0.5, 1.2);
  for (const [k, cote, u, h] of fenetres) { const d = R[k] - 0.45, P = cote === '-z' ? [u, -d] : cote === '+z' ? [u, d] : cote === '-x' ? [-d, u] : [d, u]; b2Jour(w, f, P[0], A[k].y + h + 0.3, P[1], 0.8); }
  b2Jour(w, f, sg * 0.9, S[5] + 1.2, 0, 1.4);
  const X = (x) => sg * x;
  // ------------------------------------------------ le rez-de-chaussée : l'huile, les bidons, le ciré du gardien
  b2Prop(G, f, 'tonneau_vieux', X(-1.2), S[0], -1.15, 0.3);
  b2Prop(G, f, 'tonneau_vieux', X(-1.2), S[0], -0.5, 1.1);
  b2Fouille(G, f, 'b2_bidons', 'colis', X(1.15), S[0], 0.55, -sg * Math.PI / 2, { slot: 'phare:bidons', table: 'b2_reserve', lab: 'Fouiller les bidons et la caisse', h: 0.5, nomLieu: nom });
  b2Prop(G, f, 'b2_cire', X(R[0] - 0.05), S[0], -0.9, -sg * Math.PI / 2);
  b2Prop(G, f, 'caisse', X(-0.3), S[0], R[0] - 0.5, 0.2);
  // ------------------------------------------------ la chambre du gardien
  b2Prop(G, f, 'lit', X(-0.2), S[1], -R[1] + 0.56, Math.PI / 2, { col: '#5a6a7a' });
  b2Prop(G, f, 'b2_poele', X(R[1] - 0.33), S[1], -R[1] + 0.32, -sg * Math.PI / 2, { h: S[2] - 0.2 - S[1] });
  b2Fouille(G, f, 'commode', 'commode', X(R[1] - 0.28), S[1], 0.05, -sg * Math.PI / 2, { slot: 'phare:commode', table: 'b2_gardien', pool: 'b2_phare', lab: 'Fouiller la commode du gardien', nomLieu: nom });
  b2Prop(G, f, 'chaise', X(0.35), S[1], 0.15, Math.PI * 0.8);
  b2Prop(G, f, 'lanterne_sol', X(R[1] - 0.3), S[1] + 0.95, 0.15, 0);
  // ------------------------------------------------ la réserve : les tonneaux d'huile, les cordages
  b2Prop(G, f, 'tonneau', X(-1.05), S[2], 0.65, 0); b2Prop(G, f, 'tonneau', X(-1.05), S[2], -0.05, 0);
  b2Prop(G, f, 'caisse', X(-0.95), S[2], -0.85, 0.4, null, 0.85);
  b2Prop(G, f, 'sac', X(0.2), S[2], R[2] - 0.3, 0.5);
  // ------------------------------------------------ le bureau : le registre, le baromètre
  b2Fouille(G, f, 'secretaire', 'secretaire', 0, S[3], R[3] - 0.32, Math.PI, { slot: 'phare:bureau', table: 'b2_bureau', pool: 'b2_phare', lab: 'Fouiller le bureau du gardien', nomLieu: nom });
  b2Prop(G, f, 'chaise', 0.1, S[3], R[3] - 1.0, 0.1);
  b2Prop(G, f, 'b2_registre', -0.2, S[3] + 0.79, R[3] - 0.18, Math.PI);
  b2Inter(G, f, 'b2', 'b2:phare:registre', -0.2, S[3] + 0.95, R[3] - 0.5, 'Lire le registre du feu', { a: 'registre' });
  b2Prop(G, f, 'b2_barometre', X(-R[3] + 0.03), S[3], 0.3, sg * Math.PI / 2);
  // ------------------------------------------------ la chambre de veille : la longue-vue, une chaise à la fenêtre
  const fv = fenetres.find((q) => q[0] === 4 && q[1] === '+z');
  if (fv) { b2Prop(G, f, 'b2_longue_vue', fv[2], S[4], R[4] - 0.42, 0); b2Inter(G, f, 'b2', 'b2:phare:longue_vue', fv[2], S[4] + 1.3, R[4] - 0.6, 'Regarder dans la longue-vue', { a: 'longue_vue', yaw: f.r + Math.PI }); }
  b2Prop(G, f, 'chaise', X(0.6), S[4], -0.55, Math.PI * 0.85);
  // ------------------------------------------------ la lanterne : l'optique autour de la lampe
  const lampe = w.props.find((q) => q.id === 'lanterne_sol' && Math.hypot(q.x - f.x, q.z - f.z) < 0.5 && Math.abs(q.y - S[5] - 0.1) < 0.6);
  b2Prop(G, f, 'b2_optique', 0, S[5], 0, 0);
  b2Inter(G, f, 'b2', 'b2:phare:lanterne', -sg * 0.45, S[5] + 1.0, 0.0, 'Regarder la lanterne', { a: 'lanterne' });
  w.b2.phare = { x: f.x, z: f.z, y: y0, r: f.r, S, R, sg, nom, lampe: lampe ? w.props.indexOf(lampe) : -1 };
}

// ---------------------------------------------------------------- les pigeonniers (lieux perdus : C2_TYPES.pigeonnier)
// deux boîtes d'enduit de 3,2 × 5,4 × 3,2 (l'une tournée de 45° : une étoile à huit pointes), la corniche, le toit en flèche ;
// la porte peinte (sombre) était dans la pointe de devant : on perce la pointe
function b2Pigeonnier(G, L) {
  const w = G.w, f = { x: L.x, y: L.y, z: L.z, r: L.r };
  const pres = b2Blocs(w, L.x, L.z, 3.5, (b) => !b.hidden && !b.under);
  const ang = (b, a) => Math.abs(Math.atan2(Math.sin(b.r - a), Math.cos(b.r - a))) < 0.01;
  const A = pres.find((b) => b.m === M_PLASTER && b2Pres(b.sx, 3.2) && b2Pres(b.sy, 5.4) && ang(b, f.r));
  const Bb = pres.find((b) => b.m === M_PLASTER && b2Pres(b.sx, 3.2) && b2Pres(b.sy, 5.4) && ang(b, f.r + Math.PI / 4));
  const corn = pres.find((b) => b.m === M_STONE && b2Pres(b.sx, 3.9) && b2Pres(b.sy, 0.2));
  const peinte = pres.find((b) => b.m === M_DARK && b2Pres(b.sx, 0.8) && b2Pres(b.sy, 1.7));
  if (!A || !Bb || !corn) return;
  const t = 0.3, ap = 1.6 - t, y0 = f.y, hb = 0.8; // (le bas des boîtes est 0,8 sous le sol)
  const ouvA = { '+z': [[-0.5, 0.5, hb, hb + 2.0]] };
  const ouvB = b2Percee(Bb, t, f, 0, 0.5, 0.9, hb, hb + 2.0);
  b2Creuser(w, A, t, ouvA); b2Creuser(w, Bb, t, ouvB);
  if (peinte) Object.assign(peinte, { y: y0 - 0.02, sy: 0.05, sz: 0.34, sx: 1.0 }, { x: b2W(f, 0, 1.45)[0], z: b2W(f, 0, 1.45)[1] });
  // le sol (terre battue, fientes), la porte
  b2Bloc(w, f, 0, y0 - 0.3, 0, 2 * ap + 0.1, 0.34, 2 * ap + 0.1, M_DIRT);
  w.doors.push({ x: b2W(f, 0, 1.46)[0], y: y0 + 0.05, z: b2W(f, 0, 1.46)[1], r: f.r + Math.PI, w: 0.92, h: 1.94, a: 0, open: 0, locked: false, bld: null, m: M_PLANKS });
  G.nd++;
  // l'abri : sous la corniche (les deux carrés)
  b2Abri(w, f, 1.6, 1.6, corn.y); b2Abri(w, { x: f.x, z: f.z, r: f.r + Math.PI / 4 }, 1.6, 1.6, corn.y);
  b2Jour(w, f, 0, y0 + 1.2, ap - 0.4, 0.9);
  // les boulins sur les huit pans (au-dessus de la porte sur le pan de devant)
  for (let k = 0; k < 8; k++) {
    const a = k * Math.PI / 4, lx = Math.sin(a) * (ap - 0.01), lz = Math.cos(a) * (ap - 0.01);
    if (k === 0) b2Prop(G, f, 'b2_boulins', lx, y0 + 1.95, lz, a + Math.PI, { l: 1.0, h: 2.4, s: L.i * 8 + k });
    else b2Prop(G, f, 'b2_boulins', lx, y0, lz, a + Math.PI, { l: 1.0, h: 4.3, s: L.i * 8 + k });
  }
  // l'échelle tournante au milieu
  const ech = b2Prop(G, f, 'b2_echelle_tournante', 0, y0 + 0.05, 0, 0, { h: corn.y - y0 - 0.15, a: 0.6 + (L.i % 5) * 0.9 });
  b2Inter(G, f, 'b2', 'b2:pigeonnier:' + L.i + ':echelle', 0, y0 + 1.15, 0.12, 'Faire tourner l’échelle', { a: 'echelle_t', l: L.i, prop: w.props.length - 1 });
  // des pigeons sur les rebords, des fientes par terre
  for (let k = 0; k < 4; k++) {
    const a = (k * 2 + 1) * Math.PI / 4 + 0.15, r = ap - 0.1, y = y0 + 0.45 + 0.36 * (3 + (k * 3 + L.i) % 7);
    b2Prop(G, f, 'b2_pigeon', Math.sin(a) * r, y, Math.cos(a) * r, a + Math.PI + (k % 2 ? 0.5 : -0.4), { s: k + L.i });
  }
  b2Prop(G, f, 'b2_pigeon', 0.5, y0 + 0.05, -0.6, 2.2, { s: 9 + L.i });
  b2Prop(G, f, 'b2_poussiere', 0.1, y0 + 0.05, -0.2, 0.3, { n: 9, s: L.i });
  (w.b2.pigeonniers || (w.b2.pigeonniers = [])).push({ i: L.i, x: f.x, z: f.z, y: y0, r: f.r, ech: w.props.indexOf(ech) });
}

// ---------------------------------------------------------------- les loges des charbonniers (C2_TYPES.loge_charbonnier)
// une pyramide pleine de rondins (3,4 m) et une porte peinte de 1,30 m ; devient une loge de perches et de mottes où l'on
// entre debout : le haut (le chapeau de mottes) reste un bloc ; les pans, la porte et son auvent sont un modèle (b2_loge) ;
// des murs qu'on ne voit pas arrêtent le joueur là où les pans deviennent trop bas
function b2Loge(G, L) {
  const w = G.w, f = { x: L.x, y: L.y, z: L.z, r: L.r };
  const pres = b2Blocs(w, L.x, L.z, 4, (b) => !b.hidden && !b.under);
  const cone = pres.find((b) => b.m === M_LOGS && b.sh === 3 && b2Pres(b.sx, 3.4) && b2Pres(b.sy, 3.4));
  const peinte = pres.find((b) => b.m === M_DARK && b2Pres(b.sx, 0.9) && b2Pres(b.sy, 1.3));
  if (!cone) return;
  const Bd = 2.25, C = 4.4, H = 1.95, pw = 0.55, y0 = f.y;
  const fc = { x: cone.x, z: cone.z, r: cone.r }, [cx, cz] = b2W(fc, 0, -0.45), fL = { x: cx, y: y0, z: cz, r: cone.r };
  // le chapeau de mottes : ce qui reste de la pyramide au-dessus de 1,95 m
  const cap = 2 * Bd * (1 - H / C);
  Object.assign(cone, { x: cx, z: cz, y: y0 + H, sx: cap, sz: cap, sy: C - H, m: M_LUSH, sh: 3, r: fL.r });
  if (peinte) { const [x, z] = b2W(fL, 0, 1.75); Object.assign(peinte, { x, z, y: y0 - 0.02, sx: 1.0, sy: 0.05, sz: 0.9, r: fL.r }); }
  b2Prop(G, fL, 'b2_loge', 0, y0, 0, 0, { B: Bd, H, C, pw, ph: H });
  // les murs qu'on ne voit pas (là où les pans passent sous 1,3 m) ; l'entrée, entre ses deux joues
  const m = 1.62, e = 0.2, X = { hidden: true };
  b2Bloc(w, fL, 0, y0, -m, 2 * m + e, H, e, M_LOGS, 0, X);
  b2Bloc(w, fL, -m, y0, 0, e, H, 2 * m, M_LOGS, 0, X); b2Bloc(w, fL, m, y0, 0, e, H, 2 * m, M_LOGS, 0, X);
  for (const s of [-1, 1]) {
    b2Bloc(w, fL, s * (pw + 0.07 + (m + e / 2 - pw - 0.07) / 2), y0, m, m + e / 2 - pw - 0.07, H, e, M_LOGS, 0, X);
    b2Bloc(w, fL, s * (pw + 0.12), y0, (m + Bd) / 2, 0.1, H * 0.6, Bd - m + 0.1, M_LOGS, 0, X);
  }
  b2Abri(w, fL, 1.62, 1.62, y0 + H);
  b2Jour(w, fL, 0, y0 + 1.1, 1.0, 0.7);
  // dedans : la couche de fougères, la marmite, les outils, le coffre, une lanterne
  b2Prop(G, fL, 'paillasse', -1.3, y0, -0.25, 0);
  b2Prop(G, fL, 'b2_fougeres', -1.3, y0 + 0.14, -0.25, 0);
  b2Prop(G, fL, 'b2_marmite', 0.85, y0, -0.95, 0.4);
  b2Prop(G, fL, 'b2_outils_charbon', 0.05, y0, -1.68, 0);
  b2Fouille(G, fL, 'coffre_outils', 'coffre_outils', 1.05, y0, 0.55, -Math.PI / 2, { slot: 'loge:' + L.i, table: 'b2_besace', pool: 'b2_loge', lab: 'Fouiller le coffre des charbonniers', nomLieu: L.nom });
  b2Prop(G, fL, 'lanterne_sol', -0.35, y0, -1.35, 0);
  (w.b2.loges || (w.b2.loges = [])).push({ i: L.i, x: fL.x, z: fL.z, y: y0, r: fL.r });
}

// ---------------------------------------------------------------- le clocher englouti (06-zzgen-wonders.js), au fond du grand lac
// le haut d'un clocher qui sort de la vase : une tour pleine (3,2 × 4,2 × 3,2), sa coiffe, sa flèche d'ardoise ; la baie
// peinte (un rectangle sombre) sur la face +z
function b2Clocher(G) {
  const w = G.w, D = w.drowned;
  if (!D) return;
  const pres = b2Blocs(w, D.x, D.z, 3, (b) => !b.hidden);
  const corps = pres.find((b) => b.m === M_MOSSY && !b.sh && b2Pres(b.sx, 3.2) && b2Pres(b.sy, 4.2) && b2Pres(b.sz, 3.2));
  const coiffe = pres.find((b) => b.m === M_MOSSY && b2Pres(b.sx, 3.6) && b2Pres(b.sy, 0.3));
  const peinte = pres.find((b) => b.m === M_DARK && b2Pres(b.sx, 0.9) && b2Pres(b.sy, 1.6));
  if (!corps || !coiffe) return;
  const f = { x: corps.x, y: corps.y + 1, z: corps.z, r: corps.r }, t = 0.3, ap = 1.6 - t;
  // le fond : la vase, au plus haut dans la tour
  let hmax = -1e9;
  for (let i = -4; i <= 4; i++) for (let j = -4; j <= 5; j++) { const [x, z] = b2W(f, i * 0.33, j * 0.33); hmax = Math.max(hmax, w.heightAt(x, z)); }
  const sol = Math.max(hmax, corps.y) + 0.03, hs = sol - corps.y;
  const ouv = { '+z': [[0.35, 1.3, hs, hs + 2.0]] };
  // les abat-sons : une baie en haut de chaque face (au-dessus de la porte, sur la face +z)
  for (const k of ['-z', '+z', '-x', '+x']) (ouv[k] || (ouv[k] = [])).push([-0.6, 0.6, 3.2, 4.05]);
  b2Creuser(w, corps, t, ouv);
  b2Bloc(w, f, 0, corps.y, 0, 2 * ap + 0.1, hs, 2 * ap + 0.1, M_MOSSY);
  if (peinte) { const [x, z] = b2W(f, 0.82, 1.45); Object.assign(peinte, { x, z, y: sol + 2.0, sy: 0.18, sx: 1.05, sz: 0.34 }); }
  for (const [k, lx, lz, rr] of [['-z', 0, -1.45, 0], ['+z', 0, 1.45, Math.PI], ['-x', -1.45, 0, Math.PI / 2], ['+x', 1.45, 0, -Math.PI / 2]]) b2Prop(G, f, 'b2_abat_sons', lx, corps.y + 3.2, lz, rr, { l: 1.15, h: 0.85 });
  // le mouton d'un mur à l'autre, la corde ; la cloche (on ne la voit que certaines nuits)
  const yM = f.y + 3.0;
  b2Prop(G, f, 'b2_mouton', 0, yM, 0, 0, { l: 2 * ap + 0.2, h: yM - sol - 0.3 });
  const cl = b2Prop(G, f, 'b2_cloche_pendue', 0, yM - 0.1, 0, 0, { la: 0 });
  b2Inter(G, f, 'b2', 'b2:clocher:corde', 0.32, sol + 1.1, 0.12, 'Tirer la corde', { a: 'corde' });
  b2Prop(G, f, 'b2_vase', -0.3, sol, -0.3, 0.5, { s: 3 });
  b2Prop(G, f, 'b2_marches', -0.7, sol + 0.54, -1.25, 0);
  w.b2.clocher = { x: f.x, z: f.z, y: f.y, r: f.r, sol, cloche: w.props.indexOf(cl) };
}

// les tonneaux, caisses et sacs posés ici se fouillent, comme tout le mobilier de la vallée (11-zzzz1-butin.js, butinGen,
// qui passe avant nous) : abandonnés, ils mettent longtemps à se regarnir
const B2_BU = { tonneau: ['bu_tonneau', 0.95, 'b2_reserve'], tonneau_vieux: ['bu_tonneau', 0.9, 'bu_vieux_tonneau'], caisse: ['bu_caisse', 0.85, 'bu_caisse'], sac: ['bu_sac', 0.6, 'bu_sac'], sacs: ['sacs_grain', 0.6, 'f2_farine'] };
function b2Mobilier(G, i0) {
  const w = G.w;
  for (let i = i0; i < w.props.length; i++) {
    const q = w.props[i], R = B2_BU[q.id];
    if (!R || q.f2 || !F2_TYPES[R[0]] || !LOOT[R[2]]) continue;
    const s = q.s || 1, y = q.y + R[1] * s, id = 'f2:b2:' + i;
    if (w.inter.some((it) => it.kind === 'f2' && Math.abs(it.x - q.x) < 0.8 && Math.abs(it.z - q.z) < 0.8 && Math.abs(it.y - y) < 1)) continue;
    const L = Object.values(w.b2).find((b) => b && b.x !== undefined && Math.hypot(b.x - q.x, b.z - q.z) < 6);
    w.inter.push({ kind: 'f2', id, x: q.x, y, z: q.z, name: F2_TYPES[R[0]].lab, data: { t: R[0], table: R[2], own: null, bld: null, lieu: 'abandon', pr: i, bu: 1, refill: 6, nomLieu: L && L.nom ? L.nom : '' } });
    q.f2 = id; G.ni++;
  }
}

// ---------------------------------------------------------------- la génération
function campagneGen(w) {
  if (!w || !w.designed || w.b2) return;
  w.b2 = {};
  const rnd = mulberry32((((w.seed | 0) ^ 0xB2CA4E) >>> 0));
  const B = new Builder(w, rnd, new Uint8Array(4));
  const G = { w, B, rnd, nb0: w.blocks.length, np: 0, ni: 0, nd: 0 }, i0 = w.props.length;
  const L2 = (w.carte2 && w.carte2.lieux) || [];
  const etapes = [['moulin', () => b2Moulin(G)], ['phare', () => b2Phare(G)], ['clocher', () => b2Clocher(G)]];
  for (const L of L2) {
    if (L.t === 'pigeonnier') etapes.push(['pigeonnier ' + L.i, () => b2Pigeonnier(G, L)]);
    else if (L.t === 'loge_charbonnier') etapes.push(['loge ' + L.i, () => b2Loge(G, L)]);
  }
  for (const [k, fn] of etapes) { try { fn(); } catch (e) { console.error('campagne ' + k, e); } }
  try { b2Mobilier(G, i0); } catch (e) { console.error('campagne mobilier', e); }
  w.b2.n = { blocs: w.blocks.length - G.nb0, props: G.np, inter: G.ni, portes: G.nd };
  w.objectsDirty = true; w.grid = null; w.blocksDirty = true; w.coverDirty = true; w.shadeDirty = true;
}
{
  const _gv = generateValley;
  generateValley = async function (seed, progress, gen) {
    const w = await _gv(seed, progress, gen);
    if (w && w.designed) { try { campagneGen(w); } catch (e) { console.error('campagne', e); } }
    return w;
  };
}
// la carte des abris : chaque pièce creusée porte sa hauteur d'abri (la plus haute des pièces qui couvrent la case)
{
  const _cc = World.prototype.computeCover;
  World.prototype.computeCover = function (cx, cz) {
    _cc.call(this, cx, cz);
    const A = this.b2abris;
    if (!A || !A.length || !this.cover) return;
    const S = this.coverW, [ox, oz] = this.coverO, cov = this.cover, M = new Map();
    for (const a of A) {
      const R = Math.hypot(a.hx, a.hz);
      if (a.x + R < ox || a.z + R < oz || a.x - R > ox + S || a.z - R > oz + S) continue;
      const i0 = Math.max(0, Math.floor(a.x - R - ox)), i1 = Math.min(S - 1, Math.ceil(a.x + R - ox));
      const j0 = Math.max(0, Math.floor(a.z - R - oz)), j1 = Math.min(S - 1, Math.ceil(a.z + R - oz));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const [lx, lz] = World.blockLocal(a, ox + i + 0.5, oz + j + 0.5);
        if (Math.abs(lx) > a.hx || Math.abs(lz) > a.hz) continue;
        const k = j * S + i, v = M.get(k);
        if (v === undefined || a.y > v) M.set(k, a.y);
      }
    }
    for (const [k, y] of M) cov[k] = y;
  };
}

// ============================================================================
//  LE JEU
// ============================================================================
for (const id of ['b2_rouet', 'b2_optique', 'b2_pigeon', 'b2_echelle_tournante', 'b2_cloche_pendue']) DYN_PROPS.add(id);
// ---------------------------------------------------------------- ce qu'on trouve (tables de butin : [objet, min, max, poids])
Object.assign(LOOT, {
  b2_meunier: { rolls: [1, 2], items: [['argent', 2, 9, 2], ['vieille_piece', 1, 1, 1], ['tabac', 1, 1, 1], ['bougie', 1, 2, 2], ['corde', 1, 1, 1.5], ['toile', 1, 1, 1.5], ['besicles', 1, 1, 0.4], ['farine', 1, 1, 1]] },
  b2_huche: { rolls: [1, 1], items: [['farine', 1, 2, 5], ['ble', 1, 3, 2], ['argent', 1, 4, 0.5]] },
  b2_meule: { rolls: [1, 1], items: [['farine', 1, 1, 5], ['vieille_piece', 1, 1, 0.6], ['bijou', 1, 1, 0.08]] },
  b2_reserve: { rolls: [1, 2], items: [['huile_lampe', 1, 2, 5], ['bougie', 1, 2, 2], ['corde', 1, 1, 1], ['toile', 1, 1, 1], ['clous', 1, 3, 1], ['argent', 1, 3, 0.5]] },
  b2_gardien: { rolls: [1, 2], items: [['tabac', 1, 1, 1], ['bougie', 1, 2, 2], ['argent', 2, 10, 2], ['besicles', 1, 1, 0.5], ['mouchoir_brode', 1, 1, 1], ['image_pieuse', 1, 1, 1], ['jeu_cartes', 1, 1, 0.5], ['boussole', 1, 1, 0.12]] },
  b2_bureau: { rolls: [1, 2], items: [['plume', 1, 2, 2], ['encrier', 1, 1, 1], ['cire', 1, 1, 1], ['argent', 1, 8, 1.5], ['timbres', 1, 1, 0.5], ['carte_vallee', 1, 1, 0.06]] },
  b2_besace: { rolls: [1, 2], items: [['pain', 1, 1, 3], ['charbon', 1, 3, 3], ['tabac', 1, 1, 1], ['argent', 1, 5, 1], ['corde', 1, 1, 1], ['viande_fumee', 1, 1, 0.8], ['eau_de_vie_cidre', 1, 1, 0.4]] },
});
// les papiers qu'on y trouve (11-zzz98-fouilles.js : F2_PAPIERS, tirés d'une réserve par lieu)
Object.assign(F2_PAPIERS, {
  b2_moulin_comptes: { pool: 'b2_moulin', t: 'Une page du livre du moulin', x: 'Des colonnes à l’encre brune : des noms, des sacs, des boisseaux. « Varenne, deux sacs de seigle. La veuve Morel, un sac, payé en œufs. Bastien, trois sacs, à crédit, comme toujours. »\n\nLa dernière ligne est d’une autre main, plus appuyée : « Moulu cette nuit pour personne. Un sac. Il était plein ce matin, ficelé, devant la porte. »' },
  b2_moulin_lettre: { pool: 'b2_moulin', t: 'Lettre pliée en quatre', x: 'Mon frère,\n\nje te rends le moulin, je n’en veux plus. Garde les meules, garde les ailes. Je ne dors plus depuis la Saint-Martin : la nuit, là-haut, on rhabille les meules. J’entends les marteaux, bien réguliers, comme le faisait notre père. Je suis monté avec la lanterne. Les meules étaient piquées de frais, et la farine était tiède.\n\nNe viens pas me chercher à la ville. J’y serai bien.' },
  b2_phare_inspection: { pool: 'b2_phare', t: 'Lettre de l’Inspection des phares', x: 'Monsieur le gardien,\n\nnous n’avons reçu de vous aucun état depuis le trimestre de printemps, ni la quittance des huiles. Nous vous rappelons que l’huile n’est livrée que contre état.\n\nFaute de nouvelles avant la fin de l’année, le feu du lac sera rayé des listes et la tour fermée.', s: 'Pour l’Inspecteur, le commis' },
  b2_phare_billet: { pool: 'b2_phare', t: 'Un mot, glissé sous le baromètre', x: 'Marie,\n\nje descends voir la barque. La lampe est pleine, elle tiendra jusqu’au jour.\n\nSi tu entends marcher là-haut, ne monte pas.' },
  b2_loge_planchette: { pool: 'b2_loge', t: 'Une planchette, écrite au charbon', x: '« Pierre, Jean, le petit. Fourneau de la Combe : trois jours. Fourneau du bas : quatre. »\n\nPlus bas, d’une autre main : « Le petit ne dort plus dans la loge. Il dit qu’on gratte aux mottes, la nuit, du côté du bois. On a mis la marmite devant la porte. »' },
});
for (const id in F2_PAPIERS) { const P = F2_PAPIERS[id]; if (id.startsWith('b2_') && P.pool) { const L = F2_POOLS[P.pool] || (F2_POOLS[P.pool] = []); if (!L.includes(id)) L.push(id); } }
// le registre du feu (le phare)
const B2_REGISTRE = 'Feu du lac. Gardien : A. Lemarié.\n\n« 12 octobre. Allumé à six heures et demie. Vent d’ouest, faible. Éteint à l’aube. »\n« 13 octobre. Allumé. Brume sur l’eau jusqu’à dix heures. »\n« 2 novembre. Allumé. Lune rouge. Brûlé toute la nuit, comme il est écrit. Quelqu’un sur la grève, vers trois heures. Il n’a pas bougé. »\n« 3 novembre. Allumé. »\n« 4 novembre. Allumé. Il est revenu. Plus près. »\n\nEnsuite, page après page, d’une même main : « Allumé. » Les dates continuent. La dernière est celle d’hier.';
// (les objets posés ici, et les interactions, ne se cassent ni ne se ramassent : 11-zzzz2-objets.js)
if (typeof OBJ_KINDS_PROTEGES !== 'undefined') { OBJ_KINDS_PROTEGES.add('b2'); OBJ_KINDS_PROTEGES.add('b2_echelle'); }
// ---------------------------------------------------------------- le roucoulement (un son de la bibliothèque des oiseaux, 09-audio.js)
if (typeof SoundEngine !== 'undefined' && SoundEngine.TAMPONS && !SoundEngine.TAMPONS.pigeon) {
  SoundEngine.TAMPONS.pigeon = [2.0, (d, sr) => {
    const R = Math.random, S = SoundEngine.SYN, f = 300 + R() * 50;
    let t = 0.05;
    for (let k = 0; k < 3; k++) { const du = k === 1 ? 0.5 : 0.32; S.note(d, sr, t, du, f * (k === 1 ? 1.1 : 1), f * 0.9, 0.55, { am: 20 + R() * 6, amd: 0.65, h2: 0.22 }); t += du + 0.1 + R() * 0.05; }
  }];
  SoundEngine.VOL_OISEAUX.pigeon = 0.045;
}

const campagne = {
  mont: null, branche: false, majT: 0, zoom: null, tour: null, ciel: 0,
  S() {
    const s = farm.s;
    if (!s) return null;
    const C = s.campagne || (s.campagne = { v: 1 });
    for (const k of ['ech', 'vus']) if (!C[k] || typeof C[k] !== 'object') C[k] = {};
    return C;
  },
  W() { return game.world; },
  heure() { return npcs.hour(); },
  // ------------------------------------------------------------------ grimper à l'échelle (on voit les barreaux défiler)
  // trois temps : on se met devant l'échelle, on monte (ou descend) dans la trémie, on prend pied ; la trappe se soulève
  grimper(it) {
    const d = it.data, p = game.player, w = this.W();
    if (!d || !d.to || game.sleeping || game.dying || this.mont || (typeof cine !== 'undefined' && cine.on) || p.riding) return;
    const tr = d.tr >= 0 ? w.props[d.tr] : null;
    const debut = [p.pos[0], p.pos[1], p.pos[2]], col = d.col, monte = d.sens > 0;
    const yA = monte ? d.yB : d.yH, yZ = monte ? d.yH : d.yB;
    const dur = [0.35, Math.max(0.9, Math.abs(yZ - yA) * 0.38), 0.4];
    this.zoomFin();
    this.mont = { t: 0, dur, debut, col, to: d.to.slice(), yA, yZ, yaw0: p.yaw, yaw: d.yaw, pitch0: p.pitch, monte, tr, crac: 0, ouvert: false };
    game.sleeping = true;
  },
  // la caméra (et le joueur) pendant qu'on grimpe ; renvoie { pos, yaw, pitch }
  camera(dt) {
    const M = this.mont, p = game.player;
    if (!M) return this.zoomCamera();
    if (game.dying) { this.finir(); return null; }
    M.t += dt;
    const [d0, d1, d2] = M.dur, t = M.t, e = (k) => k * k * (3 - 2 * k), eyeH = p.eyeH || 1.62;
    let x, y, z, yaw, pitch;
    // (l'écart d'angle le plus court)
    let dy = M.yaw - M.yaw0; while (dy > Math.PI) dy -= TAU; while (dy < -Math.PI) dy += TAU;
    if (t < d0) {
      const k = e(t / d0);
      x = lerp(M.debut[0], M.col[0], k); z = lerp(M.debut[2], M.col[2], k); y = lerp(M.debut[1], M.yA, k);
      yaw = M.yaw0 + dy * k; pitch = lerp(M.pitch0, M.monte ? 0.35 : -0.45, k);
    } else if (t < d0 + d1) {
      const k = (t - d0) / d1;
      x = M.col[0]; z = M.col[2]; y = lerp(M.yA, M.yZ, e(k)) + Math.sin(k * Math.PI * 6) * 0.025;
      yaw = M.yaw; pitch = M.monte ? lerp(0.35, -0.05, k) : lerp(-0.45, 0.1, k);
      if (!M.ouvert && k > (M.monte ? 0.25 : 0.0)) { M.ouvert = true; this.trappe(M.tr, true); }
      M.crac -= dt;
      if (M.crac <= 0) { M.crac = 0.3; if (sound.ici) sound.ici([x, y + 1, z], () => sound.step('wood', 2.5)); }
    } else if (t < d0 + d1 + d2) {
      const k = e((t - d0 - d1) / d2);
      x = lerp(M.col[0], M.to[0], k); z = lerp(M.col[2], M.to[2], k); y = M.yZ;
      yaw = M.yaw; pitch = lerp(M.monte ? -0.05 : 0.1, 0, k);
    } else {
      this.finir();
      return null;
    }
    p.pos = [x, y, z]; p.vel = [0, 0, 0]; p.yaw = yaw; p.pitch = pitch;
    return { pos: [x, y + eyeH, z], yaw, pitch };
  },
  finir() {
    const M = this.mont, p = game.player;
    if (!M) return;
    this.mont = null;
    p.pos = [M.to[0], M.to[1] + 0.02, M.to[2]]; p.vel = [0, 0, 0]; p.onGround = true;
    if (game.renderer) game.renderer.uploadCover(p.pos[0], p.pos[2]);
    game.sleeping = false;
    const tr = M.tr;
    setTimeout(() => this.trappe(tr, false), 700);
  },
  trappe(q, ouvrir) {
    if (!q) return;
    if (!!(q.data && q.data.open) === !!ouvrir) return;
    q.data = Object.assign({}, q.data || {}, { open: !!ouvrir });
    farm.dirtyProps = true;
    if (sound.ici) sound.ici([q.x, q.y + 0.2, q.z], () => sound.door(!!ouvrir), { att: 'phys', ref: 3 });
  },
  // une échelle ne se voit (touche E) que depuis son étage
  visible(it) { const p = game.player, d = it.data; return Math.abs(p.pos[1] - d.niv) < 1.1; },
  // ------------------------------------------------------------------ les autres gestes (interactions « b2 »)
  agir(it) {
    const d = it.data || {}, fn = this['a_' + d.a];
    try { if (fn) fn.call(this, it, d); } catch (e) { console.error('campagne', e); }
  },
  a_registre() {
    ui.read('Le registre du feu', B2_REGISTRE);
    if (sound.page) sound.page();
    this.S().vus.registre = farm.s.day;
  },
  // la longue-vue : le champ se resserre ; on regarde le lac, et l'on lâche dès qu'on bouge
  a_longue_vue(it, d) {
    const p = game.player;
    if (this.zoom) { this.zoomFin(); return; }
    if (d && d.yaw !== undefined) { p.yaw = d.yaw; p.pitch = -0.06; }
    this.zoom = { k: 1, pos: [p.pos[0], p.pos[2]], t: 0 };
    if (sound.equip) sound.equip();
  },
  zoomFin() { if (!this.zoom) return; this.zoom = null; game.fovK = 1; },
  zoomCamera() {
    const Z = this.zoom, p = game.player;
    if (!Z) return null;
    if (Math.hypot(p.pos[0] - Z.pos[0], p.pos[2] - Z.pos[1]) > 0.35 || game.sleeping || ui.panel || Z.t > 25) { this.zoomFin(); return null; }
    Z.t += 1 / 60;
    Z.k = lerp(Z.k, 0.22, 0.12);
    game.fovK = Z.k;
    return null;
  },
  a_lanterne() {
    const h = this.heure(), nuit = h >= 19.5 || h < 5.5;
    ui.subtitle('', nuit ? '(La flamme ne tremble pas. En montant, il n’y avait dans la poussière des marches que vos traces.)' : '(La mèche est coupée net, le réservoir plein jusqu’au bord.)', 4.5);
  },
  // l'échelle tournante du pigeonnier : un huitième de tour
  a_echelle_t(it, d) {
    const w = this.W(), q = w.props[d.prop], S = this.S();
    if (!q || this.tour) return;
    const a0 = (q.data && q.data.a) || 0;
    this.tour = { q, a0, a1: a0 + Math.PI / 4, t: 0 };
    S.ech[d.l] = a0 + Math.PI / 4;
    if (sound.ici && sound.voice) sound.ici([q.x, q.y + 1.5, q.z], () => sound.voice(sound.at(), 'sawtooth', 150 + Math.random() * 40, 110, 0.55, 0.02, sound.sfx, { bp: 700, q: 3, vib: 8, vibDepth: 12, lp: 1800 }), { att: 'phys', ref: 3 });
  },
  // la corde de la cloche (au fond du lac)
  a_corde() {
    const w = this.W(), C = w.b2.clocher, q = C && w.props[C.cloche];
    if (q && q.data && q.data.la) { this.tinter(1.4); if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-0.6, 'la cloche noyée', 2); return; }
    ui.subtitle('', '(La corde est molle. Elle ne tient plus à rien.)', 3);
  },
  tinter(k) {
    const C = this.W().b2.clocher;
    if (!C || !sound.ici) return;
    sound.ici([C.x, C.y + 2.6, C.z], () => sound.bell(k), { att: 'phys', ref: 8 });
  },
  // ------------------------------------------------------------------ la lumière du jour par les baies (HOOKS.lights)
  lumieres(eye) {
    const w = this.W(), J = w && w.b2jour, sky = game.sky;
    if (!J || !sky || !(sky.day > 0.05) || !w.covered(eye[0], eye[1], eye[2])) return [];
    const W = typeof weather !== 'undefined' && weather.cur ? weather.cur : {}, k0 = sky.day * (1 - 0.45 * (W.cloud || 0)) * (1 - 0.3 * (W.rain || 0));
    const out = [];
    for (const q of J) {
      if (Math.abs(q.x - eye[0]) > 12 || Math.abs(q.z - eye[2]) > 12) continue;
      const d = Math.hypot(q.x - eye[0], q.y - eye[1], q.z - eye[2]);
      if (d > 12) continue;
      const k = k0 * q.k;
      out.push({ x: q.x, y: q.y, z: q.z, r: 3.4, c: [0.34 * k, 0.36 * k, 0.4 * k], d });
    }
    return out;
  },
  // ------------------------------------------------------------------ à chaque image : l'échelle tournante ; toutes les demi-secondes : le reste
  update(dt) {
    const w = this.W();
    if (!w || !w.b2 || !farm.s) return;
    const T = this.tour;
    if (T) { T.t += dt; const k = Math.min(1, T.t / 0.9), e = k * k * (3 - 2 * k); T.q.data = Object.assign({}, T.q.data, { a: T.a0 + (T.a1 - T.a0) * e }); if (k >= 1) this.tour = null; }
    this.majT -= dt;
    if (this.majT > 0) return;
    this.majT = 0.5;
    const p = game.player, h = this.heure(), W = typeof weather !== 'undefined' && weather.cur ? weather.cur : {}, R = Math.random;
    // les pigeons roucoulent, de jour (rarement ; plus fort dedans)
    for (const P of w.b2.pigeonniers || []) {
      const d = Math.hypot(P.x - p.pos[0], P.z - p.pos[2]);
      if (d > 30 || h < 6.5 || h > 19.5 || (W.rain || 0) > 0.4) continue;
      if (R() < 0.5 / (d < 2.5 ? 18 : 40) && sound.oiseau) sound.oiseau('pigeon', [P.x + (R() - 0.5) * 2, P.y + 2 + R() * 2, P.z + (R() - 0.5) * 2], d < 2.5 ? 1 : 0.7, 4);
    }
    // le moulin : quand les ailes tournent, le bois de l'arbre et du rouet grince (on l'entend dedans)
    const M = w.b2.moulin;
    if (M && Math.hypot(M.x - p.pos[0], M.z - p.pos[2]) < 6 && (w.curVer & 0x5) && !(w.curVer & VER_ENVERS) && R() < 0.5 / 4.5 && sound.ici && sound.voice) {
      sound.ici([M.x, M.y + 11, M.z], () => sound.voice(sound.at(), 'sawtooth', 95 + R() * 25, 70, 0.7 + R() * 0.5, 0.012, sound.sfx, { bp: 420, q: 4, vib: 5, vibDepth: 9, lp: 1200 }), { att: 'phys', ref: 4 });
    }
    // le clocher englouti : la cloche n'est là que les nuits d'orage ; elle sonne, lentement
    const C = w.b2.clocher, q = C && w.props[C.cloche];
    if (q) {
      const la = (W.storm || 0) > 0.35 && (h >= 20.5 || h < 5);
      if (!!(q.data && q.data.la) !== la) q.data = Object.assign({}, q.data || {}, { la: la ? 1 : 0 });
      const d = Math.hypot(C.x - p.pos[0], C.z - p.pos[2]);
      if (la && d < 90) {
        this.ciel -= 0.5;
        if (this.ciel <= 0) { this.ciel = 9 + R() * 6; const sous = p.pos[1] + 1.5 < w.waterLevel; this.tinter(sous && d < 20 ? 0.9 : 0.12 + 0.3 * (1 - d / 90)); }
      }
    }
  },
  charger() {
    this.mont = null; this.zoom = null; this.tour = null;
    const S = this.S(), w = this.W();
    // l'angle des échelles tournantes (on les a fait tourner)
    for (const P of (w.b2 && w.b2.pigeonniers) || []) { const q = w.props[P.ech]; if (q && S.ech[P.i] !== undefined) q.data = Object.assign({}, q.data || {}, { a: S.ech[P.i] }); }
    if (this.branche) return;
    this.branche = true;
    // le lieu d'un papier trouvé ici (sinon : « la rue »)
    if (typeof fouilles !== 'undefined' && fouilles.lieuDe) {
      const _ld = fouilles.lieuDe.bind(fouilles);
      fouilles.lieuDe = function (it) { return (it && it.data && it.data.nomLieu) || _ld(it); };
    }
  },
};
HOOKS.inter.b2_echelle = (it) => campagne.grimper(it);
HOOKS.interVis.b2_echelle = (it) => campagne.visible(it);
HOOKS.inter.b2 = (it) => campagne.agir(it);
HOOKS.camera.push((dt) => { try { return campagne.camera(dt); } catch (e) { console.error('campagne', e); campagne.mont = null; game.sleeping = false; return null; } });
HOOKS.lights.push((eye) => { try { return campagne.lumieres(eye); } catch (e) { return []; } });
HOOKS.update.push((dt) => { try { campagne.update(dt); } catch (e) { console.error('campagne', e); } });
HOOKS.load.push(() => { try { if (game.world && game.world.b2) campagne.charger(); else { campagne.mont = null; campagne.zoom = null; } } catch (e) { console.error('campagne', e); } });
