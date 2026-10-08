// ============================================================================
//  BASSE-FOSSE, LA VILLE SOUS LA VILLE (agent V5, quatorzième vague) — la passe
//  de génération (zone.passe('V5-basse-fosse'), après V1…V4)
//  Sur le site « catacombes » (48 m sous la Ville Basse) :
//   - la tonnellerie de Joachim Fève, une ruine de la Ville Basse (son enseigne
//     tombée, une trappe sous les gravats), et sa cave : des tonneaux, le foudre
//     et sa portette ;
//   - le Septième Degré : derrière le foudre, une galerie qui descend par six
//     volées et sept paliers jusqu'à la porte de la ville ;
//   - la ville : une salle immense sous une voûte de tuf (trois hauteurs), un
//     mur d'enceinte, des rues droites bordées d'ossements, des îlots taillés
//     dans la pierre où sont creusées les maisons, la Nef au milieu (le temple,
//     son clocher, le feu du compte, le registre, le marché, le puits des noms),
//     l'ossuaire, les Bas-Quartiers effondrés, des passerelles sur les toits.
//  Tout ce qui est sous terre porte b.under (et b.ceil pour les voûtes : la carte
//  des abris) et b.v5sous : ces blocs ne font pas d'ombre au sol d'en haut.
//  Ce que la passe pose est rangé dans Z.v5 (le plan, les maisons, le graphe des
//  rues, les objets à état) : 11-zzzzV5-2-catacombes.js et la suite s'en servent.
// ============================================================================
Object.assign(LIEU_NAMES, V5_LIEUX);
const V5_PLAN = {
  NEF: 72,                    // les îlots dont le centre est plus près que cela sont ôtés : la Nef
  MUR: 166, EP_MUR: 6,        // face intérieure du mur d'enceinte, son épaisseur
  RUE: 5, GRANDE_RUE: 7,      // largeur des rues, de la Grande-Rue (de la porte à la Nef)
  PAS_X: 34, PAS_Z: 33,       // pas de la grille des rues
  H_ILOT: 8, H_PIECE: 3.2,    // hauteur des îlots, des pièces
  PORTE_L: 1.3, PORTE_H: 2.3, // les portes des maisons (≥ 2,05 m)
  VOUTE: { nef: 26, milieu: 18, bord: 13 },
  CAVE_SOUS: 7,               // la cave du tonnelier : son sol, sous le sol de la ruine
  ANNEAU: 162,                // la ruelle le long de l'enceinte (rayon de son milieu)
};

// un bloc sous terre dans un repère (x, y, z, r) ; o : { ceil, sh, er, surface }
function v5Bloc(Z, f, lx, ly, lz, sx, sy, sz, m, o) {
  const c = Math.cos(f.r), s = Math.sin(f.r);
  const b = { x: f.x + lx * c + lz * s, y: f.y + ly, z: f.z - lx * s + lz * c, sx, sy, sz, r: f.r + ((o && o.er) || 0), m, sh: (o && o.sh) || 0, under: true, v5sous: true };
  if (o) { if (o.ceil) b.ceil = true; if (o.surface) { b.under = false; b.v5sous = false; } }
  Z.blocks.push(b);
  return b;
}
function v5Monde(f, lx, lz) { const c = Math.cos(f.r), s = Math.sin(f.r); return [f.x + lx * c + lz * s, f.z - lx * s + lz * c]; }
function v5Local(f, x, z) { const c = Math.cos(f.r), s = Math.sin(f.r), dx = x - f.x, dz = z - f.z; return [dx * c - dz * s, dx * s + dz * c]; }

// ---------------------------------------------------------------- la tonnellerie : où ? (dans la Ville Basse, au sec, à l'écart)
function v5ChoisirCave(Z, O, st) {
  const S = O.S, VB = V1_REGIONS.ville_basse, vx = VB.x * S, vz = VB.z * S, vr = VB.r * S;
  const a0 = Math.atan2(vx - st.x, vz - st.z);
  const feux = Z.props.filter((q) => q.id === 'v1_feu');
  let best = null;
  for (let k = 0; k < 600; k++) {
    const a = a0 + (O.rnd() - 0.5) * 2.6, r = 262 + O.rnd() * 58;
    const x = st.x + Math.sin(a) * r, z = st.z + Math.cos(a) * r;
    if (Math.hypot(x - vx, z - vz) > vr * 0.85) continue;
    if (!O.libre(x, z, 8)) continue;
    if (feux.some((q) => Math.hypot(q.x - x, q.z - z) < 70)) continue;
    // le sol, autour de la ruine et au-dessus de la galerie, doit tenir la galerie loin dessous
    const sol = O.hauteur(x, z);
    let ok = true, plat = 0;
    for (let q = 0; q < 8 && ok; q++) { const h = O.hauteur(x + Math.cos(q) * 7, z + Math.sin(q) * 7); plat = Math.max(plat, Math.abs(h - sol)); if (Math.abs(h - sol) > 2.2) ok = false; }
    for (let t = 0; t <= 1.001 && ok; t += 0.04) {
      const rr = lerp(r - 8, 172, t), fy = lerp(sol - V5_PLAN.CAVE_SOUS, st.y, t);
      for (const lat of [-3, 0, 3]) {
        const xx = st.x + Math.sin(a) * rr + Math.cos(a) * lat, zz = st.z + Math.cos(a) * rr - Math.sin(a) * lat;
        if (O.hauteur(xx, zz) < fy + 5.0) { ok = false; break; }
      }
    }
    if (!ok) continue;
    // près des ruines (on s'y cache), loin des chemins
    let ruines = 0;
    for (const b of Z.blocks) if (!b.hidden && !b.under && Math.abs(b.x - x) < 30 && Math.abs(b.z - z) < 30) ruines++;
    const score = Math.min(ruines, 12) * 2 - plat * 3 - Math.abs(r - 290) * 0.05 + (O.surChemin(x, z, 6) ? -8 : 0);
    if (!best || score > best.score) best = { x, z, a, r, sol, score };
  }
  if (!best) { const a = a0, r = 290; best = { x: st.x + Math.sin(a) * r, z: st.z + Math.cos(a) * r, a, r, sol: O.hauteur(st.x + Math.sin(a) * r, st.z + Math.cos(a) * r), score: -99 }; }
  return best;
}

// ---------------------------------------------------------------- un îlot : une masse de pierre, des maisons creusées sur ses bords
// f : repère de l'îlot (centre au sol) ; W (x) × D (z) ; H ; pieces : [{ cote: 'pz'|'nz'|'px'|'nx', u, w, d, porte }]
// vides : [[x0, z0, x1, z1]] des salles sans porte (cachées), creusées dans la masse, plafond à H_PIECE
// rend les maisons : { f (repère de la pièce, +z vers la porte), w, d, du, porte: { dehors: [x, z], dedans: [x, z] } }
function v5Ilot(Z, f, W, D, H, pieces, mFacade, mCoeur, vides) {
  const P = V5_PLAN, hR = P.H_PIECE, t = 0.6;
  vides = vides || [];
  const rects = pieces.map((p) => {
    if (p.cote === 'pz') return [p.u - p.w / 2, D / 2 - p.d, p.u + p.w / 2, D / 2];
    if (p.cote === 'nz') return [p.u - p.w / 2, -D / 2, p.u + p.w / 2, -D / 2 + p.d];
    if (p.cote === 'px') return [W / 2 - p.d, p.u - p.w / 2, W / 2, p.u + p.w / 2];
    return [-W / 2, p.u - p.w / 2, -W / 2 + p.d, p.u + p.w / 2];
  });
  const creux = rects.concat(vides);
  // la masse : la grille des bords, les cases hors des pièces, fusionnées en rectangles
  const xs = [...new Set([-W / 2, W / 2, ...creux.flatMap((r) => [r[0], r[2]])])].sort((a, b) => a - b);
  const zs = [...new Set([-D / 2, D / 2, ...creux.flatMap((r) => [r[1], r[3]])])].sort((a, b) => a - b);
  const nx = xs.length - 1, nz = zs.length - 1, pris = [];
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const mx = (xs[i] + xs[i + 1]) / 2, mz = (zs[j] + zs[j + 1]) / 2;
    pris[j * nx + i] = creux.some((r) => mx > r[0] && mx < r[2] && mz > r[1] && mz < r[3]) ? 1 : 0;
  }
  const fait = new Uint8Array(nx * nz);
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    if (pris[j * nx + i] || fait[j * nx + i]) continue;
    let i1 = i; while (i1 + 1 < nx && !pris[j * nx + i1 + 1] && !fait[j * nx + i1 + 1]) i1++;
    let j1 = j;
    for (;;) { if (j1 + 1 >= nz) break; let ok = true; for (let ii = i; ii <= i1; ii++) if (pris[(j1 + 1) * nx + ii] || fait[(j1 + 1) * nx + ii]) { ok = false; break; } if (!ok) break; j1++; }
    for (let jj = j; jj <= j1; jj++) for (let ii = i; ii <= i1; ii++) fait[jj * nx + ii] = 1;
    const x0 = xs[i], x1 = xs[i1 + 1], z0 = zs[j], z1 = zs[j1 + 1];
    const bord = x0 <= -W / 2 + 1e-6 || x1 >= W / 2 - 1e-6 || z0 <= -D / 2 + 1e-6 || z1 >= D / 2 - 1e-6;
    v5Bloc(Z, f, (x0 + x1) / 2, -0.3, (z0 + z1) / 2, x1 - x0, H + 0.3, z1 - z0, bord ? mFacade : mCoeur);
  }
  for (const r of vides) v5Bloc(Z, f, (r[0] + r[2]) / 2, hR, (r[1] + r[3]) / 2, r[2] - r[0], H - hR, r[3] - r[1], mCoeur);
  // les pièces : plafond (la masse au-dessus), façade percée d'une porte
  const out = [];
  pieces.forEach((p, k) => {
    const [x0, z0, x1, z1] = rects[k];
    v5Bloc(Z, f, (x0 + x1) / 2, hR, (z0 + z1) / 2, x1 - x0, H - hR, z1 - z0, mFacade);
    const pl = P.PORTE_L, ph = P.PORTE_H, w = p.w, du = clamp(p.porte || 0, -w / 2 + pl / 2 + 0.4, w / 2 - pl / 2 - 0.4);
    const gauche = w / 2 + du - pl / 2, droite = w / 2 - du - pl / 2;
    // repère de la pièce : centre au sol, +z vers la façade (la rue)
    const rr = p.cote === 'pz' ? 0 : p.cote === 'nz' ? Math.PI : p.cote === 'px' ? Math.PI / 2 : -Math.PI / 2;
    const [wx, wz] = v5Monde(f, (x0 + x1) / 2, (z0 + z1) / 2);
    const fp = { x: wx, y: f.y, z: wz, r: f.r + rr };
    const d = p.d;
    if (gauche > 0.05) v5Bloc(Z, fp, -w / 2 + gauche / 2, -0.3, d / 2 - t / 2, gauche, hR + 0.3, t, mFacade);
    if (droite > 0.05) v5Bloc(Z, fp, w / 2 - droite / 2, -0.3, d / 2 - t / 2, droite, hR + 0.3, t, mFacade);
    v5Bloc(Z, fp, du, ph, d / 2 - t / 2, pl + 0.02, hR - ph, t, mFacade);
    out.push({ f: fp, w, d, du, porte: { dehors: v5Monde(fp, du, d / 2 + 0.9), dedans: v5Monde(fp, du, d / 2 - 1.4) }, cote: p.cote });
  });
  return out;
}

// ---------------------------------------------------------------- la passe
zone.passe('V5-basse-fosse', (Z, O) => {
  const t0 = performance.now();
  const P = V5_PLAN, st = O.site('catacombes'), F = st.y;
  const S = typeof farm !== 'undefined' && farm.s ? (farm.s.v5 || {}) : {};
  const murs0 = S.murs || {};
  // le plus haut qu'on puisse bâtir sous la Ville Basse : trois mètres sous le sol le plus bas du disque
  let solMin = 1e9;
  for (let r = 0; r <= 180; r += 6) for (let a = 0; a < TAU; a += 6 / Math.max(6, r)) solMin = Math.min(solMin, O.hauteur(st.x + Math.sin(a) * r, st.z + Math.cos(a) * r));
  const TOP = Math.min(F + 31, solMin - 3);
  const V = Math.min(P.VOUTE.nef, TOP - F - 2), VM = Math.min(P.VOUTE.milieu, TOP - F - 3), VB = Math.min(P.VOUTE.bord, TOP - F - 4);
  // ------------------------------------------------------------ la tonnellerie et l'axe de la ville (la porte regarde la cave)
  const cave = v5ChoisirCave(Z, O, st);
  const aG = cave.a;
  const CF = { x: st.x, y: F, z: st.z, r: aG };       // repère de la ville : +z vers la porte et la cave
  const v5 = Z.v5 = {
    site: st, F, TOP, voute: { nef: V, milieu: VM, bord: VB }, CF, aG, cave,
    maisons: [], noeuds: [], aretes: [], feux: [], chandelles: [], murs: [], fouilles: [], objets: [], places: [], abris: [],
    refs: {}, ilots: [], passerelles: [], echelles: [], obstacles: [],
  };
  const P0 = Z.props.length, B0 = Z.blocks.length, I0 = Z.inter.length;
  const prop = (id, f, lx, ly, lz, rr, data, s) => { const [x, z] = v5Monde(f, lx, lz); const q = O.prop(id, x, f.y + ly, z, f.r + (rr || 0), data || null, s); q.v5 = true; return q; };
  const inter = (kind, id, f, lx, ly, lz, nom, data) => { const [x, z] = v5Monde(f, lx, lz); return O.inter(kind, id, x, f.y + ly, z, nom, data || {}); };
  const obstacles = v5.obstacles; // rectangles (repère de la ville) que les gens d'en bas contournent : [x0, z0, x1, z1]
  const obst = (f, lx, lz, hx, hz) => { const [x, z] = v5Monde(f, lx, lz), [a, b] = v5Local(CF, x, z); obstacles.push([a - hx, b - hz, a + hx, b + hz]); };
  const objet = (k, item, f, lx, ly, lz, nom) => { const q = prop('v5_objet', f, lx, ly, lz, 0.3, { k, item }); const i = inter('v5_prendre', item, f, lx, ly + 0.25, lz, nom, { item }); v5.objets.push({ k, item, q, i }); return q; };

  // ------------------------------------------------------------ 1. la ruine de la tonnellerie (en surface)
  {
    const sol = cave.sol;
    O.aplanir(cave.x, cave.z, 7, sol, 3);
    const fR = { x: cave.x, y: sol, z: cave.z, r: aG + 0.08 };
    const pierre = M_V1_PIERRE, W = 10, D = 8, ep = 0.6;
    const pan = (lx, lz, sx, sz, h) => v5Bloc(Z, fR, lx, -0.8, lz, sx, h + 0.8, sz, pierre, { surface: true });
    // quatre murs à moitié tombés (la porte sur la façade), des pierres au pied
    pan(-3.4, D / 2, 3.2, ep, 2.6); pan(3.1, D / 2, 3.8, ep, 1.4);
    pan(0, -D / 2, W, ep, 3.4);
    pan(-W / 2, -1.6, ep, 4.8, 3.0); pan(-W / 2, 3.0, ep, 1.4, 1.1);
    pan(W / 2, 0.6, ep, 6.8, 1.9);
    v5Bloc(Z, fR, -3.4, 2.6, D / 2, 3.4, 0.3, ep + 0.2, pierre, { surface: true });
    for (const [lx, lz, s] of [[2.4, -1.8, 0.7], [-2.9, 1.2, 0.5], [4.1, -3.0, 0.6], [1.0, 3.0, 0.45]]) { const [x, z] = v5Monde(fR, lx, lz); Z.blocks.push({ x, y: O.hauteur(x, z) - 0.2, z, sx: s * 1.4, sy: s, sz: s * 1.1, r: O.rnd() * TAU, m: pierre, sh: 0 }); }
    // l'enseigne tombée, devant la porte ; la trappe dans un coin, sous les gravats
    v5.refs.enseigne = prop('v5_enseigne', fR, 0.6, 0, D / 2 + 1.6, 0.4);
    inter('v5_lire', 'v5_enseigne', fR, 0.6, 0.6, D / 2 + 1.6, 'L’enseigne', { texte: 'enseigne' });
    v5.refs.trappe = prop('v5_trappe', fR, -2.4, 0.02, -1.6, 0, { degagee: !!S.trappe, ouverte: !!S.trappe });
    inter('v5_trappe', 'v5_trappe', fR, -2.4, 0.5, -1.6, 'La trappe', {});
    prop('tonneau', fR, 3.6, 0, -2.6, 0.3);
    v5.tonnellerie = { x: cave.x, z: cave.z, y: sol, r: aG, f: fR, trappe: v5Monde(fR, -2.4, -0.4), sortie: v5Monde(fR, -1.2, 0.6) };
    O.lieu('v5_tonnellerie', cave.x, cave.z, 9, 'la tonnellerie', { secret: true });
  }

  // ------------------------------------------------------------ 2. la cave du tonnelier (sous la ruine)
  const zc = cave.r;
  const yCave = cave.sol - P.CAVE_SOUS;
  {
    const fC = { x: st.x, y: yCave, z: st.z, r: aG };
    // (dans le repère de la ville : la cave est en (0, zc) ; elle va de zc - 3 à zc + 3, de -4 à 4)
    v5Bloc(Z, fC, 0, -0.6, zc, 9.2, 0.6, 7.2, M_STONE);
    v5Bloc(Z, fC, 0, 2.8, zc, 9.2, 1.4, 7.2, M_V5_TUF, { ceil: true });
    v5Bloc(Z, fC, -4.3, -0.6, zc, 0.6, 3.6, 7.2, M_V5_TUF); v5Bloc(Z, fC, 4.3, -0.6, zc, 0.6, 3.6, 7.2, M_V5_TUF);
    v5Bloc(Z, fC, 0, -0.6, zc + 3.3, 9.2, 3.6, 0.6, M_V5_TUF);
    v5Bloc(Z, fC, 0, -0.6, zc - 3.3, 9.2, 3.6, 0.6, M_V5_TUF);
    // le foudre contre le mur de la ville, des tonneaux, l'échelle qui remonte
    v5.refs.foudre = prop('v5_foudre', fC, 0, 0, zc - 1.45, 0, { ouverte: !!S.barre });
    inter('v5_portette', 'v5_portette', fC, 0, 1.3, zc + 0.3, 'La portette du foudre', {});
    for (const [lx, lz] of [[-3.3, 2.3], [-3.3, 1.4], [-2.5, 2.4], [3.4, 2.2], [3.4, 0.4]]) prop('tonneau', fC, lx, 0, zc + lz, O.rnd());
    prop('echelle', fC, 2.0, 0, zc + 2.95, Math.PI, { h: 3.6 });
    inter('v5_remonter', 'v5_remonter_cave', fC, 2.0, 1.2, zc + 2.4, 'Remonter', {});
    // le livre de comptes du tonnelier, sur un tonneau ; les traits gravés au mur
    objet('livre', 'v5_livre_feve', fC, -3.3, 0.92, zc + 1.4, 'Un livre de comptes');
    inter('v5_lire', 'v5_traits_cave', fC, 4.0, 1.5, zc - 0.8, 'Des traits, sur le mur', { texte: 'traits' });
    prop('v5_chandelles', fC, -3.3, 0.92, zc + 2.3, 0, { lit: false, v: 1 });
    const [ccx, ccz] = v5Monde(fC, 0, zc);
    v5.cave2 = { x: ccx, z: ccz, y: yCave, f: fC, zc, devant: v5Monde(fC, 0, zc + 1.2), echelle: v5Monde(fC, 2.0, zc + 2.0) };
    v5.abris.push({ x: ccx, z: ccz, r: 6, y0: yCave - 0.5, y1: yCave + 3 });
  }

  // ------------------------------------------------------------ 3. le Septième Degré : six volées, sept paliers
  {
    const N = 6, LL = 3.2, zTop = zc - 3.6, zBas = P.MUR + P.EP_MUR, L1 = 4.4;
    const lf = (zTop - L1 - zBas - (N - 1) * LL) / N, dy = (yCave - F) / N, pente = dy / lf;
    const fG = { x: st.x, y: 0, z: st.z, r: aG };
    const larg = 3.2;
    const solSur = (lz0, lz1) => { let m = 1e9; for (let lz = lz0; lz <= lz1 + 0.01; lz += 1.5) for (const lx of [-3, 0, 3]) { const [x, z] = v5Monde(fG, lx, lz); m = Math.min(m, O.hauteur(x, z)); } return m; };
    const plafond = (lz0, lz1, yb) => { const top = Math.min(yb + 3.4, solSur(lz0, lz1) - 0.8); v5Bloc(Z, fG, 0, yb, (lz0 + lz1) / 2, larg + 1.3, Math.max(0.6, top - yb), lz1 - lz0 + 0.02, M_V5_TUF, { ceil: true }); return Math.max(yb + 0.6, top); };
    const murs = (lz0, lz1, y0, y1, m) => { for (const s of [-1, 1]) v5Bloc(Z, fG, s * (larg / 2 + 0.3), y0, (lz0 + lz1) / 2, 0.6, y1 - y0, lz1 - lz0 + 0.02, m); };
    const paliers = [];
    // le palier du haut (derrière le foudre) : on arrive ici par la portette
    {
      const y = yCave, z0 = zTop - L1, z1 = zTop;
      v5Bloc(Z, fG, 0, y - 0.6, (z0 + z1) / 2, larg + 1.2, 0.6, L1, M_STONE);
      const top = plafond(z0, z1 + 0.6, y + 2.9);
      murs(z0, z1 + 0.6, y - 0.6, top, M_V5_TUF);
      paliers.push({ n: 0, y, z0, z1 });
    }
    let zHaut = zTop - L1;
    for (let j = 0; j < N; j++) {
      const yH = yCave - j * dy, yL = yCave - (j + 1) * dy, zH = zHaut, zL = zHaut - lf;
      // la volée : une rampe de pierre (forme 2 : elle monte vers +z, vers la cave)
      v5Bloc(Z, fG, 0, yL, (zH + zL) / 2, larg + 0.02, dy, lf + 0.02, M_STONE, { sh: 2 });
      v5Bloc(Z, fG, 0, yL - 0.6, (zH + zL) / 2, larg + 0.02, 0.6, lf + 0.02, M_STONE);
      // la voûte par marches (épaisses : pas de jour entre elles), les murs d'ossements dans le bas
      const n = Math.max(2, Math.ceil(lf / 3.6)), pas = lf / n;
      let topMax = 0;
      for (let s = 0; s < n; s++) { const za = zL + s * pas, zb = za + pas, yb = yL + (s + 1) * pas * pente + 2.9; topMax = Math.max(topMax, plafond(za, zb, yb)); }
      murs(zL, zH, yL - 0.6, Math.max(topMax, yH + 3.6), j >= 2 ? M_V5_OS : M_V5_TUF);
      // le palier du bas de la volée (le dernier traverse l'enceinte : le seuil de la ville)
      const dernier = j === N - 1, zl0 = dernier ? P.MUR - 0.5 : zL - LL, zl1 = zL;
      if (!dernier) v5Bloc(Z, fG, 0, yL - 0.6, (zl0 + zl1) / 2, larg + 1.2, 0.6, zl1 - zl0, M_STONE);
      const top = plafond(zl0, zl1, yL + (dernier ? 3.6 : 3.0));
      murs(zl0, zl1, yL - 0.6, top, j >= 2 ? M_V5_OS : M_V5_TUF);
      paliers.push({ n: j + 1, y: yL, z0: zl0, z1: zl1 });
      zHaut = zL - LL;
    }
    // des chandelles aux paliers (les gens d'en bas les allument, sauf en haut) ; des crânes ; l'inscription du haut
    const fP = (y) => ({ x: st.x, y, z: st.z, r: aG });
    for (const p of paliers) {
      if (p.n === 0 || p.n === N) continue;
      v5.chandelles.push(prop('v5_chandelles', fP(p.y), (p.n % 2 ? 1 : -1) * 1.25, 0, (p.z0 + p.z1) / 2, p.n % 2 ? -Math.PI / 2 : Math.PI / 2, { lit: true, v: p.n % 3 }));
      if (p.n % 2 === 0) prop('v5_cranes', fP(p.y), (p.n % 4 ? -1 : 1) * 1.1, 0, p.z1 - 0.8, 0, { n: 5 });
    }
    {
      const p = paliers[0];
      inter('v5_lire', 'v5_septieme', fP(p.y), 0, 1.6, p.z0 + 0.2, 'Des lettres taillées dans la pierre', { texte: 'septieme' });
      inter('v5_portette', 'v5_portette_dedans', fP(p.y), 0, 1.2, p.z1 - 0.4, 'La portette', { dedans: true });
      // un feu de veille (celui de V1 : on s'y repose ; il garde le haut du Degré)
      const [fx, fz] = v5Monde(fP(p.y), 0.85, p.z0 + 1.5);
      const qf = O.prop('v1_feu', fx, p.y, fz, O.rnd() * TAU, { id: 'feu_degre' });
      O.inter('v1_feu', 'feu_degre', fx, p.y + 0.8, fz, 'Le feu de veille', { id: 'feu_degre' });
      qf.data.lit = !!(typeof zone !== 'undefined' && farm.s && zone.S().feux && zone.S().feux.feu_degre);
      v5.refs.feuDegre = qf;
    }
    const [gx, gz] = v5Monde(fG, 0, (zTop + zBas) / 2);
    v5.degre = { paliers, lf, dy, larg, zTop, zBas, haut: v5Monde(fG, 0, paliers[0].z0 + 0.6), yHaut: yCave, f: fG };
    O.lieu('v5_septieme_degre', gx, gz, 30, 'le Septième Degré', { under: true, secret: true });
    v5.abris.push({ x: gx, z: gz, r: (zTop - zBas) / 2 + 4, y0: F - 1, y1: yCave + 4, couloir: { f: fG, z0: zBas - 7, z1: zTop + 0.6, l: larg / 2 + 0.6 } });
    v5.places.push({ x: gx, y: (F + yCave) / 2, z: gz, r: 6, type: 'paisible', id: 'v5_degre', dessous: true });
  }

  // ------------------------------------------------------------ 4. la salle : le sol, l'enceinte, la voûte
  {
    v5Bloc(Z, CF, 0, -2, 0, 360, 2, 360, M_V5_TUF);
    // la voûte : trois hauteurs (bord, milieu, Nef), épaisses jusqu'au même plafond (pas de jour entre elles)
    const anneau = (r1, r2, h, n) => {
      for (let k = 0; k < n; k++) {
        const a = (k + 0.5) * TAU / n, rm = (r1 + r2) / 2, L = 2 * r2 * Math.sin(Math.PI / n) + 1.2;
        v5Bloc(Z, { x: st.x + Math.sin(aG + a) * rm, y: F, z: st.z + Math.cos(aG + a) * rm, r: aG + a }, 0, h, 0, L, TOP - F - h, r2 - r1 + 1, M_V5_TUF, { ceil: true });
      }
    };
    anneau(52, 112, VM, 24);
    anneau(112, 178, VB, 32);
    v5Bloc(Z, CF, 0, V, 0, 108, TOP - F - V, 108, M_V5_TUF, { ceil: true });
    // l'enceinte : 48 pans de roche, la porte au milieu du premier (+z)
    const n = 48;
    for (let k = 0; k < n; k++) {
      const a = k * TAU / n, rm = P.MUR + P.EP_MUR / 2, L = 2 * (P.MUR + P.EP_MUR) * Math.sin(Math.PI / n) + 0.8;
      const f = { x: st.x + Math.sin(aG + a) * rm, y: F, z: st.z + Math.cos(aG + a) * rm, r: aG + a };
      if (k === 0) {
        const gw = 4.4, cote = (L - gw) / 2;
        for (const s of [-1, 1]) v5Bloc(Z, f, s * (gw / 2 + cote / 2), -1, 0, cote, TOP - F + 1, P.EP_MUR, M_V5_TUF);
        v5Bloc(Z, f, 0, 4.4, 0, gw + 0.2, TOP - F - 4.4, P.EP_MUR, M_V5_TUF);
        continue;
      }
      v5Bloc(Z, f, 0, -1, 0, L, TOP - F + 1, P.EP_MUR, M_V5_TUF);
    }
    v5.abris.push({ x: st.x, z: st.z, r: P.MUR + P.EP_MUR, y0: F - 1, y1: TOP });
  }

  // ------------------------------------------------------------ 5. les îlots, les maisons
  const RUES_X = [], RUES_Z = [];
  for (let k = -4; k <= 4; k++) { RUES_X.push(k * P.PAS_X); RUES_Z.push(k * P.PAS_Z); }
  v5.rues = { x: RUES_X, z: RUES_Z };
  const largeur = (x) => (x === 0 ? P.GRANDE_RUE : P.RUE);
  // les quartiers : les Bas-Quartiers (effondrés) au fond de la ville, d'un côté ; la Porte ; les Tailleurs ; les Os
  const quartier = (x, z) => (x < -40 && z < -20 ? 'bas' : z > 60 ? 'porte' : Math.abs(x) > 60 ? 'tailleurs' : 'os');
  // les cases de la grille
  const cases = [];
  for (let i = 0; i < RUES_X.length - 1; i++) for (let j = 0; j < RUES_Z.length - 1; j++) {
    const x0 = RUES_X[i] + largeur(RUES_X[i]) / 2, x1 = RUES_X[i + 1] - largeur(RUES_X[i + 1]) / 2;
    const z0 = RUES_Z[j] + P.RUE / 2, z1 = RUES_Z[j + 1] - P.RUE / 2;
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, rc = Math.hypot(cx, cz);
    if (rc < P.NEF || rc > P.MUR - 22) continue;
    let W = x1 - x0, D = z1 - z0, ccx = cx, ccz = cz;
    const coin = () => Math.max(...[[ccx - W / 2, ccz - D / 2], [ccx + W / 2, ccz - D / 2], [ccx - W / 2, ccz + D / 2], [ccx + W / 2, ccz + D / 2]].map(([a, b]) => Math.hypot(a, b)));
    for (let it = 0; it < 14 && coin() > P.ANNEAU - 4; it++) {
      if (Math.abs(ccx) / W > Math.abs(ccz) / D) { W -= 2; ccx -= Math.sign(ccx); } else { D -= 2; ccz -= Math.sign(ccz); }
    }
    if (W < 14 || D < 14 || coin() > P.ANNEAU - 4) continue;
    cases.push({ i, j, cx: ccx, cz: ccz, W, D, q: quartier(ccx, ccz) });
  }
  // l'ossuaire : la case habitable la plus proche de la Nef, à l'ouest de l'axe
  const caseOss = cases.filter((c) => c.q !== 'bas' && c.cx < -20 && Math.abs(c.cz) < 60 && c.W >= 28).sort((a, b) => Math.hypot(a.cx, a.cz) - Math.hypot(b.cx, b.cz))[0];
  let nMaisons = 0;
  for (const C of cases) {
    const { i, j, cx: ccx, cz: ccz, W, D, q } = C;
    const [wx, wz] = v5Monde(CF, ccx, ccz);
    const fI = { x: wx, y: F, z: wz, r: aG };
    const ilot = { i, j, cx: ccx, cz: ccz, W, D, q, maisons: [], f: fI };
    v5.ilots.push(ilot);
    obstacles.push([ccx - W / 2, ccz - D / 2, ccx + W / 2, ccz + D / 2]);
    if (q === 'bas') {
      // les Bas-Quartiers : des pans de murs, des tas d'éboulis ; on y passe (et quelque chose y vit)
      const nb = 3 + Math.floor(O.rnd() * 3);
      for (let k = 0; k < nb; k++) {
        const lx = (O.rnd() - 0.5) * (W - 4), lz = (O.rnd() - 0.5) * (D - 4), sx = 2 + O.rnd() * 6, sz = 0.8 + O.rnd() * 1.2, tourne = O.rnd() < 0.5;
        v5Bloc(Z, fI, lx, -0.3, lz, tourne ? sx : sz, 0.8 + O.rnd() * 4.5, tourne ? sz : sx, O.rnd() < 0.6 ? M_V5_OS : M_V5_TUF, { er: (O.rnd() - 0.5) * 0.5 });
      }
      for (let k = 0; k < 3; k++) { const lx = (O.rnd() - 0.5) * (W - 3), lz = (O.rnd() - 0.5) * (D - 3); v5Bloc(Z, fI, lx, -0.5, lz, 2.5 + O.rnd() * 2, 1.2 + O.rnd(), 2 + O.rnd() * 2, M_V5_TUF, { er: O.rnd() * TAU, sh: 3 }); }
      for (let k = 0; k < 4; k++) prop(O.rnd() < 0.5 ? 'v5_os_tas' : 'v5_cranes', fI, (O.rnd() - 0.5) * (W - 3), 0, (O.rnd() - 0.5) * (D - 3), O.rnd() * TAU, { n: 3 + Math.floor(O.rnd() * 5) });
      v5.places.push({ x: wx, y: F, z: wz, r: Math.min(W, D) / 2, type: 'rodeur', id: 'v5_bas_' + i + '_' + j, dessous: true });
      continue;
    }
    // le genre d'îlot : plein jusqu'à la voûte (un pilier de roche), quatre, trois ou deux maisons
    const r0 = O.rnd(), rc = Math.hypot(ccx, ccz), voute = rc < 112 ? VM : VB;
    const oss = C === caseOss;
    const pilier = !oss && r0 < 0.22 && q !== 'porte';
    const H = pilier ? voute + 0.5 : P.H_ILOT + Math.round(O.rnd() * 2);
    const mF = q === 'tailleurs' ? M_V5_TUF : (O.rnd() < 0.78 ? M_V5_OS : M_V5_TUF), mC = M_V5_TUF;
    const cotes = [['pz', W], ['nz', W], ['px', D], ['nx', D]];
    // les côtés qui regardent une vraie rue (pas l'enceinte de près, pas les Bas-Quartiers)
    const libres = cotes.filter(([c]) => {
      const nx = c === 'px' ? 1 : c === 'nx' ? -1 : 0, nz = c === 'pz' ? 1 : c === 'nz' ? -1 : 0;
      const ex = ccx + nx * (W / 2 + 3), ez = ccz + nz * (D / 2 + 3);
      return Math.hypot(ex, ez) < P.ANNEAU && quartier(ex + nx * 10, ez + nz * 10) !== 'bas';
    });
    for (let k = libres.length - 1; k > 0; k--) { const m = Math.floor(O.rnd() * (k + 1)); [libres[k], libres[m]] = [libres[m], libres[k]]; }
    const pieces = [], vides = [];
    if (oss) {
      // l'ossuaire : une grande salle sur le côté de la Nef (+x), et derrière son mur du fond, une salle sans porte
      pieces.push({ cote: 'px', u: 0, w: 10, d: 7, porte: 0 });
      vides.push([W / 2 - 7 - 0.9 - 5.4, -3, W / 2 - 7 - 0.9, 3]);  // la salle des Premiers
      vides.push([W / 2 - 7 - 0.9, -1.1, W / 2 - 7, 1.1]);           // le passage (le mur qui ment le referme)
    } else {
      const nP = pilier ? (O.rnd() < 0.5 ? 1 : 2) : r0 < 0.55 ? 4 : r0 < 0.85 ? 3 : 2;
      const rect = (p) => (p.cote === 'pz' ? [p.u - p.w / 2, D / 2 - p.d, p.u + p.w / 2, D / 2] : p.cote === 'nz' ? [p.u - p.w / 2, -D / 2, p.u + p.w / 2, -D / 2 + p.d] : p.cote === 'px' ? [W / 2 - p.d, p.u - p.w / 2, W / 2, p.u + p.w / 2] : [-W / 2, p.u - p.w / 2, -W / 2 + p.d, p.u + p.w / 2]);
      for (const [c, L] of libres.slice(0, nP)) {
        const w = 5.6 + Math.floor(O.rnd() * 3), d = 5.2 + Math.floor(O.rnd() * 2);
        if (L < w + 4) continue;
        const p = { cote: c, u: (O.rnd() - 0.5) * (L - w - 4), w, d, porte: (O.rnd() - 0.5) * (w - 2.5) };
        const R = rect(p);
        // pas deux pièces qui se touchent (un mur d'au moins 1,2 m entre elles)
        if (pieces.some((o) => { const Q = rect(o); return R[0] < Q[2] + 1.2 && R[2] > Q[0] - 1.2 && R[1] < Q[3] + 1.2 && R[3] > Q[1] - 1.2; })) continue;
        pieces.push(p);
      }
    }
    const ms = v5Ilot(Z, fI, W, D, H, pieces, mF, mC, vides);
    for (const m of ms) {
      const M = { id: 'm' + (nMaisons++), ilot, f: m.f, w: m.w, d: m.d, du: m.du, porte: m.porte, q, cote: m.cote, x: m.f.x, z: m.f.z, ossuaire: oss };
      v5.maisons.push(M); ilot.maisons.push(M);
    }
    if (oss) {
      // le mur qui ment : il referme le passage vers la salle des Premiers
      const b = v5Bloc(Z, fI, W / 2 - 7 - 0.45, -0.3, 0, 0.9, P.H_PIECE + 0.3, 2.2, mF);
      b.v5illusoire = 'premiers';
      v5.murs.push({ id: 'premiers', b });
      const [sx, sz] = v5Monde(fI, W / 2 - 7 - 0.9 - 2.7, 0);
      v5.premiersSalle = { x: sx, y: F, z: sz, r: aG + Math.PI / 2, f: { x: sx, y: F, z: sz, r: aG + Math.PI / 2 } };
      ilot.ossuaire = true;
    }
    // une échelle sur certains îlots (on monte sur les toits)
    if (!pilier && !oss && O.rnd() < 0.32) {
      const c = libres.find(([cc]) => !pieces.some((p) => p.cote === cc));
      if (c) {
        const nx = c[0] === 'px' ? 1 : c[0] === 'nx' ? -1 : 0, nz = c[0] === 'pz' ? 1 : c[0] === 'nz' ? -1 : 0;
        const lx = nx * (W / 2 + 0.2), lz = nz * (D / 2 + 0.2), rr = Math.atan2(nx, nz);
        const qq = prop('echelle', fI, lx, 0, lz, rr, { h: H });
        const [ex, ez] = v5Monde(fI, lx + nx * 0.7, lz + nz * 0.7), [hx, hz] = v5Monde(fI, lx - nx * 1.7, lz - nz * 1.7);
        O.inter('ladder', 'v5_echelle_' + i + '_' + j, ex, F + 1.2, ez, 'Grimper à l’échelle', { to: [hx, F + H + 0.05, hz] });
        O.inter('ladder', 'v5_echelle_bas_' + i + '_' + j, hx, F + H + 1.0, hz, 'Redescendre', { to: [ex, F + 0.05, ez] });
        v5.echelles.push({ q: qq, ilot: [i, j], H, bas: [ex, ez], haut: [hx, hz] });
      }
    }
    ilot.H = H; ilot.pilier = pilier;
  }

  // ------------------------------------------------------------ 6. la Nef : le temple et son clocher, le feu du compte, le registre, le marché, le puits
  {
    const fN = CF;
    v5Bloc(Z, fN, 0, 0, 0, 132, 0.04, 132, M_STONE);           // le pavé de la Nef
    // le temple (24 × 30), sa porte vers la Grande-Rue (+z), le clocher derrière (-z) ; sol à +0,54 (une marche)
    const TW = 24, TD = 30, TH = 11, tz = -6, ep = 1.0, fl = 0.54;
    const [tx, tzw] = v5Monde(fN, 0, tz);
    const fT = { x: tx, y: F, z: tzw, r: aG };
    const m = M_V5_TUF;
    v5Bloc(Z, fT, 0, 0.04, 0, TW, fl - 0.04, TD, M_STONE);
    // le mur ouest (-x) en trois morceaux : le passage du greffe vers la salle d'avant (refermé par un mur qui ment)
    const gz = -TD / 2 + 4.6, gl = 2.2;
    v5Bloc(Z, fT, -TW / 2 + ep / 2, -0.3, (-TD / 2 + gz - gl / 2) / 2, ep, TH + 0.3, gz - gl / 2 + TD / 2, m);
    v5Bloc(Z, fT, -TW / 2 + ep / 2, -0.3, (gz + gl / 2 + TD / 2) / 2, ep, TH + 0.3, TD / 2 - gz - gl / 2, m);
    v5Bloc(Z, fT, -TW / 2 + ep / 2, fl + 3.0, gz, ep, TH - fl - 3.0, gl + 0.02, m);
    v5Bloc(Z, fT, TW / 2 - ep / 2, -0.3, 0, ep, TH + 0.3, TD, m);
    v5Bloc(Z, fT, 0, -0.3, -TD / 2 + ep / 2, TW - 2 * ep, TH + 0.3, ep, m);
    const pw = 3.2, ph = 4.6;
    for (const s of [-1, 1]) v5Bloc(Z, fT, s * (pw / 2 + (TW / 2 - pw / 2) / 2), -0.3, TD / 2 - ep / 2, TW / 2 - pw / 2, TH + 0.3, ep, M_V5_OS);
    v5Bloc(Z, fT, 0, ph, TD / 2 - ep / 2, pw + 0.02, TH - ph, ep, M_V5_OS);
    v5Bloc(Z, fT, 0, TH, 0, TW + 0.6, 0.8, TD + 0.6, m);
    // la marche du seuil : une rampe douce
    { const [x, z] = v5Monde(fT, 0, TD / 2 + 1.0); v5Bloc(Z, { x, y: F, z, r: aG + Math.PI }, 0, 0, 0, pw + 1, fl, 2.0, M_STONE, { sh: 2 }); }
    // le greffe (à gauche en entrant, au fond) : 6,8 × 8,6 ; une porte dans sa cloison est
    const gx1 = -TW / 2 + ep + 6.8, gz1 = -TD / 2 + ep + 8.6;
    v5Bloc(Z, fT, gx1 + 0.3, -0.3, (-TD / 2 + ep + (-TD / 2 + 5.0)) / 2, 0.6, TH + 0.3, 5.0 - ep, m);
    v5Bloc(Z, fT, gx1 + 0.3, -0.3, (-TD / 2 + 6.4 + gz1 + 0.6) / 2, 0.6, TH + 0.3, gz1 + 0.6 - (-TD / 2 + 6.4), m);
    v5Bloc(Z, fT, gx1 + 0.3, fl + 2.3, -TD / 2 + 5.7, 0.6, TH - fl - 2.3, 1.42, m);
    v5Bloc(Z, fT, (-TW / 2 + ep + gx1) / 2, -0.3, gz1 + 0.3, gx1 + TW / 2 - ep, TH + 0.3, 0.6, m);
    // le clocher (derrière) : une tour carrée jusqu'à la voûte de la Nef ; les cloches en haut
    const [kx, kz] = v5Monde(fT, 0, -TD / 2 - 3.5);
    const fK = { x: kx, y: F, z: kz, r: aG }, KH = V - 1.5;
    v5Bloc(Z, fK, 0, -0.3, 0, 7, KH + 0.3, 7, M_V5_OS);
    v5Bloc(Z, fK, 0, KH - 3.2, 0, 7.6, 0.4, 7.6, m);
    for (const lx of [-1.6, 1.6]) v5.refs['cloche' + lx] = prop('v5_cloche', fK, lx, KH - 2.8, 3.6, 0, { s: 0.8 });
    // dedans : le feu du compte, le registre, des bancs, des chandelles ; la Cloche du Jour, posée par terre, muette
    v5.refs.feuCompte = prop('v5_feu_compte', fT, 0, fl, -4, 0, { lit: S.fin !== 'extinction' });
    inter('v5_feu', 'v5_feu_compte', fT, 0, fl + 1.6, -2.0, 'Le feu du compte', { compte: true });
    v5.refs.registre = prop('v5_registre', fT, 3.4, fl, -2.6, -0.6, { ferme: false });
    inter('v5_registre', 'v5_registre', fT, 3.4, fl + 1.3, -1.9, 'Le registre', {});
    for (let k = 0; k < 4; k++) for (const s of [-1, 1]) prop('v5_banc', fT, s * 5.2, fl, 2 + k * 2.6, 0);
    for (const [lx, lz] of [[-10.5, 12], [10.5, -12], [10.5, 12], [9.8, -6], [-4.0, -13.4]]) v5.chandelles.push(prop('v5_chandelles', fT, lx, fl, lz, O.rnd() * TAU, { lit: true, v: Math.floor(O.rnd() * 3) }));
    for (let k = 0; k < 6; k++) prop('v5_niche', fT, TW / 2 - ep - 0.25, fl, -11 + k * 4.4, -Math.PI / 2);
    v5.refs.clocheJour = prop('v5_cloche', fT, 7.6, fl, -11.6, 0.5, { s: 1.6, muette: !S.battant });
    inter('v5_cloche', 'v5_cloche_jour', fT, 7.6, fl + 1.4, -9.9, 'La Cloche du Jour', {});
    // le greffe : le coin du Greffier (sa table, ses chandelles, son lit de pierre, des niches)
    const [grx, grz] = v5Monde(fT, (-TW / 2 + ep + gx1) / 2, (-TD / 2 + ep + gz1) / 2);
    const fGr = { x: grx, y: F + fl, z: grz, r: aG };
    prop('v5_table', fGr, 1.4, 0, 1.6, Math.PI / 2);
    v5.chandelles.push(prop('v5_chandelles', fGr, 1.4, 0.8, 1.9, 0, { lit: true, v: 1 }));
    prop('v5_lit', fGr, -2.4, 0, -2.4, 0);
    for (let k = 0; k < 2; k++) prop('v5_niche', fGr, 0.8 + k * 1.8, 0, -4.0, 0);
    v5.greffe = { f: fGr, table: v5Monde(fGr, 0.6, 1.6), lit: v5Monde(fGr, -2.4, -2.4), centre: [grx, grz] };
    // la salle d'avant (ce que le Greffier était) : bâtie contre le mur ouest du temple, sans porte
    {
      const [sx, sz] = v5Monde(fT, -TW / 2 - 3.0, gz);
      const fS = { x: sx, y: F, z: sz, r: aG };
      v5Bloc(Z, fS, 0, -0.3, -2.9, 5.6, fl + 3.3, 0.6, m); v5Bloc(Z, fS, 0, -0.3, 2.9, 5.6, fl + 3.3, 0.6, m);
      v5Bloc(Z, fS, -2.8 - 0.3 + 0.3, -0.3, 0, 0.6, fl + 3.3, 6.4, m); v5Bloc(Z, fS, 0, fl + 3.0, 0, 6.2, 0.6, 6.4, m);
      v5Bloc(Z, fS, 0.3, 0.04, 0, 5.4, fl - 0.04, 5.2, M_STONE);
      const b = v5Bloc(Z, fT, -TW / 2 + ep / 2, -0.3, gz, ep + 0.02, fl + 3.3, gl + 0.04, m);
      b.v5illusoire = 'greffe';
      v5.murs.push({ id: 'greffe', b });
      const fSi = { x: sx, y: F + fl, z: sz, r: aG };
      prop('v5_table', fSi, -1.2, 0, 1.2, Math.PI / 2);
      objet('lettre', 'v5_lettre_notaire', fSi, -1.2, 0.8, 1.0, 'Une lettre');
      prop('v5_chandelles', fSi, -1.3, 0.8, 1.6, 0, { lit: false, v: 1 });
      prop('lit', fSi, -1.0, 0, -1.4, Math.PI / 2);
      inter('v5_lire', 'v5_chambre_avant', fSi, 0.6, 1.4, -2.4, 'Des mots gravés, sur le mur', { texte: 'chambre_avant' });
      v5.salleAvant = { x: sx, z: sz, f: fSi };
      obst(fS, 0, 0, 3.4, 3.4);
    }
    // le marché : une arcade à l'est de la Nef (+x), des étals
    const [mx, mz] = v5Monde(fN, 40, 4);
    const fMa = { x: mx, y: F, z: mz, r: aG };
    for (const lz of [-12, -4, 4, 12]) v5Bloc(Z, fMa, -4, -0.3, lz, 0.9, 5.3, 0.9, M_V5_TUF);
    v5Bloc(Z, fMa, 0, 5.0, 0, 9.2, 0.6, 27, M_V5_TUF);
    v5Bloc(Z, fMa, 4.2, -0.3, 0, 0.8, 5.3, 27, M_V5_OS);
    obstacles.push([35.5, -9.6, 45.4, 17.6]);
    v5.etals = [];
    for (const lz of [-8, 0, 8]) v5.etals.push(prop('v5_etal', fMa, 1.6, 0, lz, -Math.PI / 2));
    v5.marche = { f: fMa, place: v5Monde(fMa, -0.9, 0), etal: v5Monde(fMa, 0.4, 0) };
    // le puits des noms, à l'ouest de la Nef
    const [px, pz] = v5Monde(fN, -34, 10);
    const fPu = { x: px, y: F, z: pz, r: aG };
    prop('v5_puits', fPu, 0, 0.04, 0, 0);
    inter('v5_puits', 'v5_puits', fPu, 0, 1.0, 1.5, 'Le puits des noms', {});
    v5.puits = { x: px, z: pz };
    obstacles.push([-35.6, 8.4, -32.4, 11.6]);
    // quatre piliers autour du temple : ils tiennent la voûte de la Nef
    for (const [lx, lz] of [[-26, -30], [26, -30], [-26, 22], [26, 22]]) { v5Bloc(Z, fN, lx, -0.3, lz, 4, V + 0.6, 4, M_V5_TUF); obstacles.push([lx - 2, lz - 2, lx + 2, lz + 2]); }
    obstacles.push([-TW / 2 - 0.2, tz - TD / 2 - 7.2, TW / 2 + 0.2, tz + TD / 2 + 0.2]);
    v5.temple = { f: fT, TW, TD, fl, porte: v5Monde(fT, 0, TD / 2 + 2.5), dedans: v5Monde(fT, 0, TD / 2 - 3), feu: v5Monde(fT, 0, -4), registre: v5Monde(fT, 3.4, -1.6), clocher: [kx, kz], cloche: v5Monde(fT, 7.6, -9.9) };
    O.lieu('v5_temple', fT.x, fT.z, 18, 'le temple des cloches', { under: true, secret: true });
    O.lieu('v5_marche', fMa.x, fMa.z, 14, 'le marché d’en bas', { under: true, secret: true });
  }

  // ------------------------------------------------------------ 7. l'ossuaire : crânes, ossements ; derrière le mur qui ment, les Premiers
  {
    const M = v5.maisons.find((q) => q.ossuaire);
    if (M) {
      v5.ossuaire = { maison: M.id, f: M.f };
      for (let k = 0; k < 4; k++) prop('v5_cranes', M.f, -M.w / 2 + 1.1 + k * 2.4, 0, -M.d / 2 + 0.8, 0, { n: 7 + k * 2 });
      prop('v5_os_tas', M.f, M.w / 2 - 1.2, 0, 0.4, 0.4); prop('v5_os_tas', M.f, -M.w / 2 + 1.0, 0, 1.0, 1.4);
      for (const s of [-1, 1]) prop('v5_niche', M.f, s * (M.w / 2 - 0.32), 0, -0.6, s * -Math.PI / 2);
      v5.chandelles.push(prop('v5_chandelles', M.f, 2.2, 0, -M.d / 2 + 0.9, 0, { lit: true, v: 0 }));
      const fS = v5.premiersSalle.f;
      prop('v5_sarcophage', fS, -1.4, 0, 0, 0, { ouvert: false }); prop('v5_sarcophage', fS, 1.4, 0, 0, 0, { ouvert: true });
      objet('masque', 'v5_masque_cire', fS, 1.4, 0.92, 0.3, 'Un masque de cire');
      inter('v5_lire', 'v5_premiers', fS, 0, 1.4, -2.3, 'Des noms', { texte: 'premiers' });
      v5.places.push({ x: fS.x, y: F, z: fS.z, r: 3, type: 'gardien', id: 'v5_premiers', dessous: true });
    }
  }

  // ------------------------------------------------------------ 8. les feux qui ne s'éteignent pas (rues, Nef, porte), la stèle des lois
  {
    const lit = S.fin !== 'extinction';
    const feu = (lx, lz, nom) => {
      if (obstacles.some((r) => lx > r[0] - 1.2 && lx < r[2] + 1.2 && lz > r[1] - 1.2 && lz < r[3] + 1.2)) return null;
      const [x, z] = v5Monde(CF, lx, lz);
      const q = O.prop('v5_feu', x, F, z, O.rnd() * TAU, { lit }); q.v5 = true;
      v5.feux.push(q);
      O.inter('v5_feu', 'v5_feu_' + v5.feux.length, x, F + 1.3, z, nom || 'Le feu', {});
      obstacles.push([lx - 0.6, lz - 0.6, lx + 0.6, lz + 0.6]);
      return q;
    };
    // sur la Grande-Rue, au bord, après chaque carrefour ; dans la Nef ; à quelques carrefours ailleurs
    for (const [k, z] of [[1, 99 + 7], [-1, 66 + 7], [1, 132 + 7]]) feu(k * 2.4, z);
    for (const [lx, lz] of [[0, 44], [-30, 36], [30, 36], [-46, -12], [46, -26], [0, -48], [-38, -2]]) feu(lx, lz);
    for (const [xi, zj, s] of [[34, 66, 1], [-68, 99, -1], [68, -33, 1], [102, 33, -1], [-34, -99, 1], [34, -132, -1], [-102, 33, 1], [68, 99, -1]]) feu(xi + s * 1.9, zj + 7);
    // la porte de la ville : deux feux contre l'enceinte, la stèle des lois
    for (const s of [-1, 1]) feu(s * 3.1, P.MUR - 1.0, 'Le feu de la porte');
    {
      const [x, z] = v5Monde(CF, 5.6, P.MUR - 6.5);
      O.prop('v5_stele', x, F, z, aG + Math.PI + 0.35).v5 = true;
      O.inter('v5_lire', 'v5_lois', x, F + 1.5, z, 'La stèle', { texte: 'lois' });
      obstacles.push([4.6, P.MUR - 7.5, 6.6, P.MUR - 5.5]);
    }
    v5.porte = { dedans: v5Monde(CF, 0, P.MUR - 8), dehors: v5Monde(CF, 0, P.MUR + P.EP_MUR + 2), y: F };
    O.lieu('v5_basse_fosse', st.x, st.z, P.MUR, 'Basse-Fosse', { under: true, secret: true });
  }

  // ------------------------------------------------------------ 9. l'intérieur des maisons : lits, tables, chandelles, niches des morts, ce qu'on y fouille
  v5.maisons.forEach((M, k) => {
    if (M.ossuaire) return;
    const f = M.f, w = M.w, d = M.d;
    M.lit = v5Monde(f, -w / 2 + 0.75, -d / 2 + 1.4);
    prop('v5_lit', f, -w / 2 + 0.75, 0, -d / 2 + 1.4, 0);
    M.table = v5Monde(f, w / 2 - 1.1, -0.2);
    prop('v5_table', f, w / 2 - 1.1, 0, -0.6, Math.PI / 2);
    M.chandelle = prop('v5_chandelles', f, w / 2 - 1.1, 0.8, -0.3, O.rnd() * TAU, { lit: false, v: k % 3 });
    prop('v5_niche', f, 0.4, 0, -d / 2 + 0.32, 0);
    if (k % 5 === 2 && M.du > 0.2) prop('v5_metier', f, -w / 2 + 1.1, 0, d / 2 - 1.7, Math.PI / 2);
    if (k % 7 === 3) prop('v5_os_tas', f, w / 2 - 0.9, 0, d / 2 - 1.3, O.rnd() * TAU);
    M.fouille = 'v5_f_' + M.id;
    inter('v5_fouiller', M.fouille, f, 0.4, 0.95, -d / 2 + 0.8, 'La niche', { maison: M.id, table: 'v5_maison' });
    v5.fouilles.push({ id: M.fouille, maison: M.id });
  });

  // ------------------------------------------------------------ 10. le graphe des rues (pour les gens d'en bas)
  {
    const N = v5.noeuds, A = v5.aretes, cle = new Map();
    const libre = (x, z, m) => {
      if (Math.hypot(x, z) > P.MUR - 1.6) return false;
      for (const r of obstacles) if (x > r[0] - m && x < r[2] + m && z > r[1] - m && z < r[3] + m) return false;
      return true;
    };
    const ligneLibre = (a, b) => { const L = Math.hypot(b.lx - a.lx, b.lz - a.lz), n = Math.max(2, Math.ceil(L / 1.2)); for (let k = 0; k <= n; k++) { const t = k / n; if (!libre(lerp(a.lx, b.lx, t), lerp(a.lz, b.lz, t), 0.65)) return false; } return true; };
    const noeud = (lx, lz, tag, y) => {
      const k = Math.round(lx * 2) + ',' + Math.round(lz * 2) + (y !== undefined ? ',' + Math.round(y) : '');
      if (cle.has(k)) return cle.get(k);
      const [x, z] = v5Monde(CF, lx, lz);
      N.push({ i: N.length, x, z, lx, lz, y: y === undefined ? F : y, tag: tag || '', v: [] });
      cle.set(k, N.length - 1);
      return N.length - 1;
    };
    const lier = (a, b, sans) => { if (a === b || N[a].v.includes(b)) return false; if (!sans && !ligneLibre(N[a], N[b])) return false; N[a].v.push(b); N[b].v.push(a); A.push([a, b]); return true; };
    const proches = (lx, lz, filtre, n) => N.filter((q) => filtre(q)).sort((a, b) => Math.hypot(a.lx - lx, a.lz - lz) - Math.hypot(b.lx - lx, b.lz - lz)).slice(0, n || 10);
    // le long de chaque rue : les carrefours, et un point tous les 16 m
    const rue = (fixe, axe) => {
      const pts = [];
      for (let t = -P.MUR; t <= P.MUR; t += 2) { const lx = axe === 'x' ? fixe : t, lz = axe === 'x' ? t : fixe; if (libre(lx, lz, 0.8)) pts.push(t); }
      let prev = null, last = -1e9;
      for (let k = 0; k < pts.length; k++) {
        const t = pts[k], carre = (axe === 'x' ? RUES_Z : RUES_X).some((u) => Math.abs(u - t) < 1.01);
        const fin = k === pts.length - 1 || pts[k + 1] - t > 2.01, debut = k === 0 || t - pts[k - 1] > 2.01;
        if (debut) { prev = null; last = -1e9; }
        if (!(carre || fin || debut || t - last >= 16)) continue;
        const i = axe === 'x' ? noeud(fixe, t) : noeud(t, fixe);
        if (prev !== null) lier(prev, i);
        prev = i; last = t;
      }
    };
    for (const x of RUES_X) rue(x, 'x');
    for (const z of RUES_Z) rue(z, 'z');
    // la ruelle qui longe l'enceinte : un anneau ; chacun de ses nœuds se lie à la rue la plus proche
    const ann = [];
    for (let k = 0; k < 96; k++) { const a = k * TAU / 96, lx = Math.sin(a) * P.ANNEAU, lz = Math.cos(a) * P.ANNEAU; ann.push(libre(lx, lz, 0.8) ? noeud(lx, lz, 'enceinte') : null); }
    for (let k = 0; k < 96; k++) { const a = ann[k], b = ann[(k + 1) % 96]; if (a !== null && b !== null) lier(a, b); }
    // la Nef : un anneau autour du temple, relié à ce qui l'entoure
    const nef = [];
    for (let k = 0; k < 28; k++) { const a = k * TAU / 28, lx = Math.sin(a) * 42, lz = Math.cos(a) * 42 - 4; nef.push(libre(lx, lz, 1) ? noeud(lx, lz, 'nef') : null); }
    for (let k = 0; k < 28; k++) { const a = nef[k], b = nef[(k + 1) % 28]; if (a !== null && b !== null) lier(a, b); }
    for (const i of nef) { if (i === null) continue; let n2 = 0; for (const q of proches(N[i].lx, N[i].lz, (q) => q.tag !== 'nef' && Math.hypot(q.lx - N[i].lx, q.lz - N[i].lz) < 40)) { if (lier(i, q.i) && ++n2 >= 2) break; } }
    // les nœuds de l'anneau de l'enceinte qui ne touchent qu'à l'anneau : on les lie aux rues
    for (const i of ann) { if (i === null || N[i].v.length > 2) continue; for (const q of proches(N[i].lx, N[i].lz, (q) => q.tag !== 'enceinte' && Math.hypot(q.lx - N[i].lx, q.lz - N[i].lz) < 20, 4)) if (lier(i, q.i)) break; }
    // le temple : sa porte, l'allée, le feu, le registre, le greffe ; les bancs
    const T = v5.temple, fT = T.f, fl = T.fl;
    const tl = (lx, lz) => v5Local(CF, ...v5Monde(fT, lx, lz));
    const iPorte = noeud(...tl(0, T.TD / 2 + 3.2), 'temple_porte');
    { let n2 = 0; for (const q of proches(N[iPorte].lx, N[iPorte].lz, (q) => q.i !== iPorte && (q.tag === 'nef' || q.tag === ''))) { if (lier(iPorte, q.i) && ++n2 >= 2) break; } }
    const nt = (lx, lz, tag) => noeud(...tl(lx, lz), tag, F + fl);
    const iSeuil = nt(0, T.TD / 2 - 2, 'temple');
    lier(iPorte, iSeuil, true);
    const iAllee = nt(0, 1.5, 'temple'), iFeu = nt(0, -0.6, 'temple_feu'), iReg = nt(2.6, -1.4, 'registre');
    lier(iSeuil, iAllee, true); lier(iAllee, iFeu, true); lier(iFeu, iReg, true);
    const iGr0 = nt(-T.TW / 2 + 9.6, -T.TD / 2 + 5.7, 'temple'), iGr1 = nt(-T.TW / 2 + 5.4, -T.TD / 2 + 5.7, 'greffe'), iGr2 = nt(-T.TW / 2 + 3.4, -T.TD / 2 + 3.0, 'greffe_lit');
    lier(iFeu, iGr0, true); lier(iGr0, iGr1, true); lier(iGr1, iGr2, true);
    T.noeuds = { porte: iPorte, seuil: iSeuil, allee: iAllee, feu: iFeu, registre: iReg, greffe: iGr1, greffeLit: iGr2 };
    T.places = [];
    for (let k = 0; k < 8; k++) { const i = nt((k % 2 ? 1 : -1) * 3.3, 2.0 + Math.floor(k / 2) * 2.6, 'banc'); lier(i, iAllee, true); T.places.push(i); }
    // le marché, le puits, la porte de la ville
    const ML = v5Local(CF, v5.marche.place[0], v5.marche.place[1]);
    const iMar = noeud(ML[0], ML[1], 'marche');
    { let n2 = 0; for (const q of proches(ML[0], ML[1], (q) => q.i !== iMar && !q.tag.startsWith('temple') && q.tag !== 'banc')) { if (lier(iMar, q.i) && ++n2 >= 2) break; } }
    v5.marche.noeud = iMar;
    const PL = v5Local(CF, v5.puits.x, v5.puits.z);
    const iPu = noeud(PL[0] + 2.4, PL[1] + 2.4, 'puits');
    { let n2 = 0; for (const q of proches(PL[0], PL[1], (q) => q.i !== iPu && !q.tag.startsWith('temple') && q.tag !== 'banc')) { if (lier(iPu, q.i) && ++n2 >= 2) break; } }
    v5.puits.noeud = iPu;
    const iPo = noeud(0, P.MUR - 8, 'porte');
    { let n2 = 0; for (const q of proches(0, P.MUR - 8, (q) => q.i !== iPo && !q.tag.startsWith('temple'))) { if (lier(iPo, q.i) && ++n2 >= 2) break; } }
    v5.porte.noeud = iPo;
    // la galerie (pour la Remontée) : de la porte au palier du haut
    {
      let prev = iPo;
      const gal = [];
      for (const p of v5.degre.paliers.slice().reverse()) { const i = noeud(0, (p.z0 + p.z1) / 2, 'degre', p.y); lier(prev, i, true); prev = i; gal.push(i); }
      v5.degre.noeuds = gal;
    }
    // les maisons : la porte dehors (reliée à la rue), dedans
    for (const M of v5.maisons) {
      const [ox, oz] = v5Local(CF, M.porte.dehors[0], M.porte.dehors[1]), [ix, iz] = v5Local(CF, M.porte.dedans[0], M.porte.dedans[1]);
      const iO = noeud(ox, oz, 'porte');
      N[iO].maison = M.id;
      let n2 = 0;
      for (const q of proches(ox, oz, (q) => q.i !== iO && !q.maison && !q.tag.startsWith('temple') && q.tag !== 'banc' && q.tag !== 'degre', 10)) { if (lier(iO, q.i) && ++n2 >= 2) break; }
      const iI = noeud(ix, iz, 'maison');
      N[iI].maison = M.id;
      lier(iO, iI, true);
      M.noeuds = { dehors: iO, dedans: iI };
    }
    // ce qui est relié au temple (les gens d'en bas habitent là)
    const vu = new Uint8Array(N.length), pile = [T.noeuds.porte];
    vu[T.noeuds.porte] = 1;
    while (pile.length) { const i = pile.pop(); for (const j of N[i].v) if (!vu[j]) { vu[j] = 1; pile.push(j); } }
    for (const M of v5.maisons) M.relie = !!vu[M.noeuds.dedans];
    for (const q of N) q.relie = !!vu[q.i];
    v5.relies = vu.reduce((a, b) => a + b, 0);
  }

  // ------------------------------------------------------------ 11. des passerelles de planches entre les toits (les chemins d'en haut)
  {
    let n = 0;
    for (const I of v5.ilots) {
      if (n >= 10 || I.q === 'bas' || I.pilier || !I.H) continue;
      for (const J of v5.ilots) {
        if (J === I || J.q === 'bas' || J.pilier || !J.H || n >= 10 || Math.abs(I.H - J.H) > 0.01) continue;
        let a = null;
        if (J.i === I.i + 1 && J.j === I.j) a = 'x'; else if (J.j === I.j + 1 && J.i === I.i) a = 'z';
        if (!a || O.rnd() > 0.4) continue;
        let lx, lz, sx, sz;
        if (a === 'x') { const x0 = I.cx + I.W / 2, x1 = J.cx - J.W / 2, z0 = Math.max(I.cz - I.D / 2, J.cz - J.D / 2), z1 = Math.min(I.cz + I.D / 2, J.cz + J.D / 2); if (z1 - z0 < 4) continue; lx = (x0 + x1) / 2; lz = (z0 + z1) / 2; sx = x1 - x0 + 1.2; sz = 1.2; }
        else { const z0 = I.cz + I.D / 2, z1 = J.cz - J.D / 2, x0 = Math.max(I.cx - I.W / 2, J.cx - J.W / 2), x1 = Math.min(I.cx + I.W / 2, J.cx + J.W / 2); if (x1 - x0 < 4) continue; lz = (z0 + z1) / 2; lx = (x0 + x1) / 2; sz = z1 - z0 + 1.2; sx = 1.2; }
        if (sx > 9.5 || sz > 9.5) continue;
        v5Bloc(Z, CF, lx, I.H - 0.12, lz, sx, 0.12, sz, M_PLANKS);
        v5.passerelles.push({ lx, lz, H: I.H, sx, sz });
        n++;
      }
    }
  }

  // ------------------------------------------------------------ 12. les murs qui mentent déjà dissipés (sauvegarde) ; l'ombre au sol
  for (const M of v5.murs) { M.x = M.b.x; M.z = M.b.z; M.y = M.b.y; if (murs0[M.id]) { M.b.hidden = true; M.ouvert = true; } }
  if (!Z.v5ombre) {
    // (les blocs d'en bas ne font pas d'ombre sur le sol d'en haut : computeShade les ignore)
    Z.v5ombre = true;
    const _cs = Z.computeShade.bind(Z);
    Z.computeShade = function (region) {
      const B = this.blocks;
      this.blocks = B.filter((b) => !b.v5sous);
      try { return _cs(region); } finally { this.blocks = B; }
    };
  }
  v5.mesures = { ms: Math.round(performance.now() - t0), blocs: Z.blocks.length - B0, props: Z.props.length - P0, inter: Z.inter.length - I0, maisons: v5.maisons.length, ilots: v5.ilots.length, noeuds: v5.noeuds.length, aretes: v5.aretes.length, relies: v5.relies };
});
