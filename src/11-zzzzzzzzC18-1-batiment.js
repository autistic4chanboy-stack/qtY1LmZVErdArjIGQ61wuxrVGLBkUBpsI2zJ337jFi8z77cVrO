// ============================================================================
//  LE GRAND CERCLE (agent C18) — 1. LE BÂTIMENT
//  « Ajoute un gros casino dans la ville principale, avec plusieurs jeux, et une
//  suite très chère au-dessus, à l'étage. Que chaque élément ait sa place. »
//  La place : le seul terrain libre de la ville qui donne sur une rue et tienne un
//  grand bâtiment — au sud-est de la place, entre le second marché (la grand-rue)
//  et la maison Delorme, adossé au rempart sud. La façade regarde l'ouest, le
//  marché et la grand-rue ; la porte passe entre deux étals et le poteau
//  d'attache. Avant de bâtir, la passe vérifie que rien n'y est (bloc, objet
//  posé, interaction, porte : sinon, pas de Cercle, et un message) ; les herbes
//  sauvages qui y poussaient sont arrachées (o.cleared, comme ailleurs).
//  Le bâtiment (16,4 × 15 m, deux niveaux, toit à quatre pans d'ardoise) :
//  - au rez-de-chaussée, la grande salle (4,45 m sous plafond) : la caisse
//    grillagée près de l'entrée, trois bandits manchots contre la façade, la
//    roulette au milieu, le passe-dix, le vingt-et-un et le baccara au fond, le
//    bar contre le mur du fond, un piano et des guéridons ; trois lustres ;
//  - le grand escalier, dans sa cage contre le mur nord, monte au palier de
//    l'étage (on le gravit à pied ; E au pied ou en haut : on monte d'un trait) ;
//  - à l'étage, la suite Impériale : le salon et son balcon sur la rue, la
//    chambre (lit à baldaquin), la salle de bains (baignoire de cuivre),
//    l'antichambre ; sa porte ferme à clé, sur le palier.
//  Génération : après tout le reste (tirage propre, graine ^ 0xC18), tout est
//  ajouté au bout des listes (objets, objets posés, interactions, blocs, portes) :
//  les objets d'avant gardent leurs numéros. Les nœuds de rue tombés dans
//  l'emprise sont isolés ; la porte est reliée aux rues (relinkNav).
//  Monde : w.c18 = { f, y0, gens (les places des gens), lustres, cylindre,
//  bandits, portes, … }. API : c18Generer(w, seed), c18Conflits(w, f).
// ============================================================================
Object.assign(LIEU_NAMES, { casino: 'le Grand Cercle' });
Object.assign(PORTE_STYLE_BLD, { casino: 'double' });
Object.assign(PORTE_TEINTE, { casino: '#3a1c16' });

// la parcelle (repère de la ville : x vers l'est, z vers le sud) et le bâtiment (repère f : x le long de la façade, z vers le fond)
const C18_LOT = { x: 19, z: 36, W: 16.4, D: 15, r: Math.PI / 2 };
const C18_Y = { sol: 0.15, plafond: 4.6, etage: 4.8, haut: 8.2, mur: 8.4, toit: 3.4 };
const C18_ESC = { x0: 6.1, x1: 7.8, z0: -1.4, z1: 4.8, n: 15 };   // le grand escalier (cage contre le mur +x)

// ---------------------------------------------------------------- ce qui gênerait (blocs, objets posés, interactions, portes)
function c18Conflits(w, f) {
  const W = C18_LOT.W, D = C18_LOT.D, y0 = f.y, out = [];
  const dans = (x, z, m) => { const [lx, lz] = b1L(f, x, z); return (Math.abs(lx) < W / 2 + m && Math.abs(lz) < D / 2 + m) || (Math.abs(lx) < 2.4 && lz < -D / 2 && lz > -D / 2 - 1.8); };
  const proche = (y) => y > y0 - 1.5 && y < y0 + 6;
  for (const b of w.blocks) {
    if (b.under || b.y > y0 + 6 || b.y + b.sy < y0 - 0.2) continue;
    const R = Math.hypot(b.sx, b.sz) / 2;
    if (Math.hypot(b.x - f.x, b.z - f.z) > R + 14) continue;
    const c = Math.cos(b.r), s = Math.sin(b.r);
    let hit = false;
    for (let u = -b.sx / 2; u <= b.sx / 2 + 1e-6 && !hit; u += Math.max(0.1, Math.min(0.4, b.sx / 2))) for (let v = -b.sz / 2; v <= b.sz / 2 + 1e-6; v += Math.max(0.1, Math.min(0.4, b.sz / 2))) {
      if (dans(b.x + u * c + v * s, b.z - u * s + v * c, 0.2)) { hit = true; break; }
    }
    if (hit) out.push('bloc ' + w.blocks.indexOf(b));
  }
  w.props.forEach((p, i) => { if (proche(p.y) && dans(p.x, p.z, 0.4)) out.push('objet posé ' + i + ' ' + p.id); });
  (w.inter || []).forEach((it, i) => { if (proche(it.y) && dans(it.x, it.z, 0.4)) out.push('interaction ' + i + ' ' + it.kind); });
  w.doors.forEach((d, i) => { if (proche(d.y) && dans(d.x, d.z, 1.2)) out.push('porte ' + i); });
  w.objects.forEach((o, i) => { if (!o.gone && OBJ_TYPES[o.t] && OBJ_TYPES[o.t].animal && dans(o.x, o.z, 0.5)) out.push('bête ' + i); });
  return out;
}

// ---------------------------------------------------------------- les murs percés (rectangle local, trous [u0, u1, ya, yb] le long de l'axe)
function c18Mur(w, f, R, y0, y1, m, axe, trous) {
  const a0 = axe === 'x' ? R[0] : R[2], a1 = axe === 'x' ? R[1] : R[3];
  const cuts = [a0, a1];
  for (const [u0, u1] of trous || []) cuts.push(u0, u1);
  cuts.sort((a, b) => a - b);
  const rect = (u0, u1) => (axe === 'x' ? [u0, u1, R[2], R[3]] : [R[0], R[1], u0, u1]);
  for (let i = 0; i + 1 < cuts.length; i++) {
    const u0 = Math.max(a0, cuts[i]), u1 = Math.min(a1, cuts[i + 1]);
    if (u1 - u0 < 0.02) continue;
    const T = (trous || []).find(([t0, t1]) => t0 <= u0 + 1e-6 && t1 >= u1 - 1e-6);
    if (!T) { b1Bloc(w, f, rect(u0, u1), y0, y1, m); continue; }
    if (T[2] > y0 + 0.01) b1Bloc(w, f, rect(u0, u1), y0, T[2], m);
    if (T[3] < y1 - 0.01) b1Bloc(w, f, rect(u0, u1), T[3], y1, m);
  }
}

// ============================================================================
//  LA GÉNÉRATION
// ============================================================================
function c18Generer(w, seed) {
  if (!w || !w.townInfo || !w.bld || !w.bld.mairie || w.bld.casino || !w.nav || !w.props || !w.blocks) return;
  w.inter = w.inter || [];
  const T = w.townInfo, y0 = w.heightAt(T.x, T.z);
  const f = { x: T.x + C18_LOT.x, y: y0, z: T.z + C18_LOT.z, r: C18_LOT.r };
  w.grid = null;
  const gene = c18Conflits(w, f);
  if (gene.length) { console.warn('C18 : la place du Grand Cercle est prise (' + gene.slice(0, 6).join(', ') + ') ; pas de Cercle dans cette vallée.'); return; }
  const rnd = mulberry32((((seed | 0) * 7919) ^ 0xC18C18) >>> 0);
  const B = new Builder(w, rnd, new Uint8Array(1));
  const Y = C18_Y, W = C18_LOT.W, D = C18_LOT.D, HX = W / 2, HZ = D / 2, t = 0.4, IX = HX - t, IZ = HZ - t, E = C18_ESC;
  const K = (R, a, b, m, o) => b1Bloc(w, f, R, a, b, m, o);
  const PL = { plafond: true };
  const P = (id, lx, ly, lz, rr, data, s) => B.propRel(f, id, lx, ly, lz, rr || 0, data || undefined, s);
  const I = (kind, id, lx, ly, lz, nom, data) => B.interRel(f, kind, id, lx, ly, lz, nom, data || {});
  const WP = (lx, ly, lz) => { const [x, z] = b1W(f, lx, lz); return [x, f.y + ly, z]; };
  const C = w.c18 = { f, y0, W, D, gens: {}, lustres: [], bandits: [], portes: {}, fenetres: [], cylindre: -1, inter0: w.inter.length };
  const PI = Math.PI, PI2 = Math.PI / 2;

  // ------------------------------------------------------------- le terrain : les herbes de l'emprise (déplacées à la fin), le parvis pavé
  const emprise = (x, z, m) => { const [lx, lz] = b1L(f, x, z); return (Math.abs(lx) < HX + m && Math.abs(lz) < HZ + m) || (Math.abs(lx) < 4.6 + m && lz < -HZ && lz > -HZ - 2.6 - m); };
  const aDeplacer = [];
  w.objects.forEach((o, i) => { if (!o.gone && !(OBJ_TYPES[o.t] && OBJ_TYPES[o.t].animal) && emprise(o.x, o.z, 0.4)) aDeplacer.push(i); });
  C.objets0 = w.objects.length; C.props0 = w.props.length; C.blocs0 = w.blocks.length; C.portes0 = w.doors.length;
  B.paintRect(f, 0, 0, HX + 0.3, HZ + 0.3, M_DIRT);
  B.paintRect(f, 0, -HZ - 1.3, 4.4, 1.3, M_COBBLE);

  // ------------------------------------------------------------- le gros œuvre
  K([-HX - 0.1, HX + 0.1, -HZ - 0.1, HZ + 0.1], -1.2, 0.05, M_STONE);                        // les fondations
  K([-IX, IX, -IZ, IZ], 0.05, Y.sol, M_PLANKS);                                              // le parquet
  // les murs (crépi clair) : la façade percée de la grande porte et de la porte du balcon
  c18Mur(w, f, [-HX, HX, -HZ, -HZ + t], 0, Y.mur, M_PLASTER, 'x', [[-1.0, 1.0, 0, 2.9], [-0.7, 0.7, Y.etage, 7.0]]);
  K([-HX, HX, HZ - t, HZ], 0, Y.mur, M_PLASTER);
  K([-HX, -HX + t, -HZ + t, HZ - t], 0, Y.mur, M_PLASTER);
  K([HX - t, HX, -HZ + t, HZ - t], 0, Y.mur, M_PLASTER);
  // la pierre : soubassement, chaînes d'angle et pilastres, bandeau d'étage, corniche
  c18Mur(w, f, [-HX - 0.1, HX + 0.1, -HZ - 0.1, -HZ], 0, 0.7, M_STONE, 'x', [[-1.1, 1.1, 0, 0.7]]);
  K([-HX - 0.1, HX + 0.1, HZ, HZ + 0.1], 0, 0.7, M_STONE);
  K([-HX - 0.1, -HX, -HZ, HZ], 0, 0.7, M_STONE); K([HX, HX + 0.1, -HZ, HZ], 0, 0.7, M_STONE);
  for (const x of [-HX + 0.25, -4.8, -1.75, 1.75, 4.8, HX - 0.25]) K([x - 0.25, x + 0.25, -HZ - 0.12, -HZ], 0.7, Y.mur - 0.1, M_STONE);
  for (const sx of [-1, 1]) for (const z of [-HZ + 0.25, HZ - 0.25]) K(sx < 0 ? [-HX - 0.12, -HX, z - 0.25, z + 0.25] : [HX, HX + 0.12, z - 0.25, z + 0.25], 0.7, Y.mur - 0.1, M_STONE);
  for (const [R] of [[[-HX - 0.18, HX + 0.18, -HZ - 0.18, -HZ]], [[-HX - 0.18, HX + 0.18, HZ, HZ + 0.18]], [[-HX - 0.18, -HX, -HZ, HZ]], [[HX, HX + 0.18, -HZ, HZ]]]) K(R, Y.plafond - 0.1, Y.etage, M_STONE);
  for (const [R] of [[[-HX - 0.28, HX + 0.28, -HZ - 0.28, -HZ]], [[-HX - 0.28, HX + 0.28, HZ, HZ + 0.28]], [[-HX - 0.28, -HX, -HZ, HZ]], [[HX, HX + 0.28, -HZ, HZ]]]) K(R, Y.mur - 0.12, Y.mur + 0.14, M_STONE);
  // le toit à quatre pans, deux souches de cheminée
  K([-HX - 0.45, HX + 0.45, -HZ - 0.45, HZ + 0.45], Y.mur, Y.mur + Y.toit, M_SLATE, { sh: 3 });
  for (const z of [-3.5, 2.2]) K([-HX + 0.15, -HX + 0.85, z - 0.35, z + 0.35], Y.mur - 0.1, Y.mur + 2.3, M_BRICK);

  // ------------------------------------------------------------- le dedans : planchers, plafonds, la cage de l'escalier
  K([-IX, E.x0, -IZ, IZ], Y.plafond, Y.plafond + 0.06, M_PLASTER, PL);                      // le plafond blanc de la salle
  K([-IX, E.x0, -IZ, IZ], Y.plafond + 0.06, Y.etage, M_PLANKS, PL);                         // le plancher de la suite
  K([E.x0, IX, E.z1, IZ], Y.plafond, Y.plafond + 0.06, M_PLASTER, PL);                      // le palier
  K([E.x0, IX, E.z1, IZ], Y.plafond + 0.06, Y.etage, M_PLANKS, PL);
  K([-IX, IX, -IZ, IZ], Y.haut, Y.haut + 0.1, M_PLASTER, PL);                                // le plafond de l'étage
  K([E.x0 - 0.12, E.x0, E.z0, E.z1], Y.sol, Y.haut, M_PAPIER_PEINT, PL);                    // le mur de la cage
  K([E.x0 - 0.12, E.x0, E.z1, IZ], Y.sol, Y.plafond, M_PAPIER_PEINT, PL);                  // (le réduit sous le palier, fermé)
  // les marches (bois), une main courante contre le mur
  const run = (E.z1 - E.z0) / E.n, h = (Y.etage - Y.sol) / E.n;
  C.marches = [];
  for (let i = 0; i < E.n; i++) {
    const b = K([E.x0, IX, E.z0 + i * run, E.z0 + (i + 1) * run], 0.05, Y.sol + (i + 1) * h, M_PLANKS, PL);
    C.marches.push(w.blocks.length - 1); void b;
  }
  P('c18_rampe', IX - 0.12, Y.sol, E.z0, 0, { L: E.z1 - E.z0, h: Y.etage - Y.sol });
  P('c18_colonne', E.x0 - 0.06, Y.sol, E.z0 - 0.05, 0, { h: Y.plafond - Y.sol });
  // les tentures : papier peint et soubassement de pierre au rez-de-chaussée (pas de planches minces : la passe Z les prendrait pour une clôture), papier peint à l'étage
  const doubler = (y0r, y1r, lam) => {
    const L = [[-IX, -IX + 0.04, -IZ, IZ], [-IX, E.x0 - 0.12, IZ - 0.04, IZ], [-IX, -1.0, -IZ, -IZ + 0.04], [1.0, IX, -IZ, -IZ + 0.04], [IX - 0.04, IX, -IZ, E.z0]];
    for (const R of L) K(R, y0r, y1r, M_PAPIER_PEINT, PL);
    if (lam) for (const R of [[-IX + 0.04, -IX + 0.1, -IZ + 0.04, IZ - 0.04], [-IX + 0.04, E.x0 - 0.12, IZ - 0.1, IZ - 0.04], [-IX + 0.04, -1.0, -IZ + 0.04, -IZ + 0.1], [1.0, IX - 0.04, -IZ + 0.04, -IZ + 0.1], [IX - 0.1, IX - 0.04, -IZ + 0.1, E.z0]]) K(R, y0r, y0r + 0.95, M_STONE, PL);
  };
  doubler(Y.sol, Y.plafond, true);
  K([IX - 0.04, IX, E.z0, IZ], Y.sol, Y.haut, M_PAPIER_PEINT, PL);                           // la cage, côté rue
  K([E.x0, IX, IZ - 0.04, IZ], Y.sol, Y.haut, M_PAPIER_PEINT, PL);                           // le palier, au fond
  // à l'étage : les murs du dehors doublés, les cloisons de la suite
  for (const R of [[-IX, -IX + 0.04, -IZ, IZ], [-IX, E.x0 - 0.12, IZ - 0.04, IZ], [-IX, -0.7, -IZ, -IZ + 0.04], [0.7, E.x0 - 0.12, -IZ, -IZ + 0.04]]) K(R, Y.etage, Y.haut, M_PAPIER_PEINT, PL);
  const cloison = (axe, pos, a0, a1, portes) => {
    const e = 0.12, cuts = [a0];
    for (const [p0, p1] of portes) cuts.push(p0, p1);
    cuts.push(a1);
    for (let i = 0; i + 1 < cuts.length; i += 2) {
      const u0 = cuts[i], u1 = cuts[i + 1];
      if (u1 - u0 > 0.02) K(axe === 'x' ? [u0, u1, pos - e / 2, pos + e / 2] : [pos - e / 2, pos + e / 2, u0, u1], Y.etage, Y.haut, M_PAPIER_PEINT, PL);
      if (i + 2 < cuts.length) { const p0 = cuts[i + 1], p1 = cuts[i + 2]; K(axe === 'x' ? [p0, p1, pos - e / 2, pos + e / 2] : [pos - e / 2, pos + e / 2, p0, p1], Y.etage + 2.15, Y.haut, M_PAPIER_PEINT, PL); }
    }
  };
  cloison('x', 0, -IX, E.x0 - 0.12, [[-4.5, -3.4], [0.4, 1.4], [3.9, 5.2]]);              // salon | chambre, bains, antichambre
  cloison('z', -1.0, 0.06, IZ, []);                                                          // chambre | bains
  cloison('z', 3.4, 0.06, IZ, []);                                                           // bains | antichambre
  K([E.x0 - 0.12, E.x0, -IZ, E.z0], Y.etage, Y.haut, M_PAPIER_PEINT, PL);                    // le salon, au-dessus du vestibule
  K([E.x0 - 0.12, E.x0, E.z1, 5.4], Y.etage, Y.haut, M_PAPIER_PEINT, PL);                    // l'antichambre et le palier : la porte de la suite
  K([E.x0 - 0.12, E.x0, 6.5, IZ], Y.etage, Y.haut, M_PAPIER_PEINT, PL);
  K([E.x0 - 0.12, E.x0, 5.4, 6.5], Y.etage + 2.3, Y.haut, M_PAPIER_PEINT, PL);
  K([-1.0, 3.4, 0.06, IZ], Y.etage, Y.etage + 0.02, M_TILE, PL);                             // le carrelage de la salle de bains

  // ------------------------------------------------------------- le balcon (sur la rue), la marquise, le perron
  K([-2.2, 2.2, -HZ - 1.4, -HZ], Y.plafond, Y.etage, M_STONE);
  for (const x of [-1.8, 0, 1.8]) K([x - 0.15, x + 0.15, -HZ - 0.6, -HZ], Y.plafond - 0.4, Y.plafond, M_STONE);
  const garde = { hidden: true, m: 0, sh: 0 };
  K([-2.2, 2.2, -HZ - 1.4, -HZ - 1.34], Y.etage, Y.etage + 1.05, 0, garde);
  K([-2.2, -2.14, -HZ - 1.34, -HZ], Y.etage, Y.etage + 1.05, 0, garde);
  K([2.14, 2.2, -HZ - 1.34, -HZ], Y.etage, Y.etage + 1.05, 0, garde);
  P('c18_balustrade', 0, Y.etage, -HZ - 1.37, 0, { L: 4.4 });
  P('c18_balustrade', -2.17, Y.etage, -HZ - 0.7, PI2, { L: 1.34 });
  P('c18_balustrade', 2.17, Y.etage, -HZ - 0.7, PI2, { L: 1.34 });
  K([-2.0, 2.0, -HZ - 1.0, -HZ - 0.1], 0, Y.sol, M_STONE);                                    // le perron
  P('c18_marquise', 0, 0, -HZ, PI, { w: 3.6 });
  for (const s of [-1, 1]) K([s * 1.6 - 0.1, s * 1.6 + 0.1, -HZ - 1.65, -HZ - 1.45], 0, 3.0, 0, garde);
  P('c18_enseigne', 0, 3.42, -HZ - 0.02, PI);
  for (const s of [-1, 1]) {
    const [x, z] = b1W(f, s * 2.7, -HZ - 0.55);
    if (pointFree(w, x, z, 0.4)) P('c18_palmier', s * 2.7, 0, -HZ - 0.55, 0, { oranges: true });
    const [x2, z2] = b1W(f, s * 3.7, -HZ - 1.25);
    if (pointFree(w, x2, z2, 0.3)) P('lampadaire', s * 3.7, 0, -HZ - 1.25, 0);
  }

  // ------------------------------------------------------------- les fenêtres : dehors sur les quatre faces, dedans là où un meuble ne les cache pas
  const FEN = (lx, ly, lz, rr, fw, fh, dedans) => { const q = P('c18_fenetre', lx, ly, lz, rr, { w: fw, h: fh, dedans: !!dedans }); C.fenetres.push(w.props.indexOf(q)); return q; };
  for (const x of [-6.2, -3.4, 3.4, 6.2]) { FEN(x, 0.95, -HZ, PI, 1.25, 2.7); FEN(x, 5.4, -HZ, PI, 1.1, 2.0); }
  for (const x of [-6.2, -3.4, 0, 3.4, 6.2]) { FEN(x, 0.95, HZ, 0, 1.25, 2.7); FEN(x, 5.4, HZ, 0, 1.1, 2.0); }
  for (const z of [-4.5, 0, 4.5]) for (const s of [-1, 1]) { FEN(s * HX, 0.95, z, s * PI2, 1.25, 2.7); FEN(s * HX, 5.4, z, s * PI2, 1.1, 2.0); }
  for (const z of [-4.5, 0]) FEN(-IX + 0.04, 0.95, z, PI2, 1.25, 2.7, true);
  FEN(2.6, 0.95, IZ - 0.04, PI, 1.25, 2.7, true);
  FEN(IX - 0.04, 0.95, -4.5, -PI2, 1.25, 2.7, true);
  for (const x of [-6.2, -3.4, 3.4]) FEN(x, 5.4, -IZ + 0.04, 0, 1.1, 2.0, true);
  FEN(-IX + 0.04, 5.4, 4.6, PI2, 1.1, 2.0, true);
  FEN(1.2, 5.4, IZ - 0.04, PI, 1.1, 2.0, true);

  // ------------------------------------------------------------- les portes
  const porte = (cle, lx, ly, lz, rr, pw, ph, o) => {
    const [x, z] = b1W(f, lx, lz);
    const d = Object.assign({ x, y: f.y + ly + 0.02, z, r: f.r + rr, w: pw, h: ph, a: 0, open: 0, locked: true, bld: 'casino', ep: 0.4, c18: cle }, o || {});
    w.doors.push(d);
    C.portes[cle] = w.doors.length - 1;
    return w.doors.length - 1;
  };
  const dEntree = porte('entree', 0, 0, -HZ + t / 2, 0, 1.94, 2.85, { style: 'double' });
  porte('balcon', 0, Y.etage, -HZ + t / 2, 0, 1.34, 2.15, { style: 'boutique', locked: false });
  porte('suite', E.x0 - 0.06, Y.etage, 5.95, -PI2, 1.04, 2.25, { style: 'mairie', ep: 0.12 });

  // ------------------------------------------------------------- la grande salle
  const yS = Y.sol;
  P('c18_tapis', -1.2, yS, -2.6, 0, { w: 6.4, d: 4.2, c: '#5a1418' });
  P('c18_tapis', -1.5, yS, 2.6, 0, { w: 10.4, d: 3.8, c: '#4a1a2a' });
  P('c18_tapis', 0, yS, -6.0, 0, { w: 2.4, d: 2.0, c: '#5a1418' });
  // la caisse (le guichet regarde la salle), la caissière derrière
  P('c18_caisse', -5.6, yS, -6.05, 0);
  I('c18_caisse', 'c18:caisse', -5.6, yS + 1.2, -5.45, 'La caisse');
  C.gens.caissiere = { lx: -5.6, lz: -6.72, rr: 0 };
  // trois bandits manchots contre la façade
  for (const x of [2.4, 3.5, 4.6]) {
    const q = P('c18_bandit', x, yS, -IZ + 0.36, 0, { lev: 0 });
    C.bandits.push(w.props.indexOf(q));
    I('c18_jeu', 'c18:bandit:' + C.bandits.length, x, yS + 1.15, -IZ + 0.95, 'Le bandit manchot', { jeu: 'bandit', n: C.bandits.length - 1 });
  }
  // la roulette au milieu (les joueurs côté entrée, la croupière au fond, près du cylindre)
  P('c18_roulette', -1.2, yS, -2.6, PI);
  { const q = P('c18_cylindre', -1.2 - 1.12, yS, -2.6, PI); C.cylindre = w.props.indexOf(q); }
  I('c18_jeu', 'c18:roulette', -1.0, yS + 1.05, -3.75, 'La roulette', { jeu: 'roulette' });
  C.gens.odile = { lx: -2.32, lz: -1.5, rr: PI };
  // le passe-dix
  P('c18_des', 3.5, yS, -2.4, PI);
  I('c18_jeu', 'c18:des', 3.5, yS + 1.05, -3.25, 'Le passe-dix', { jeu: 'des' });
  C.gens.rigobert = { lx: 3.5, lz: -1.5, rr: PI };
  // le vingt-et-un (la demi-lune : le croupier côté plat, au fond)
  P('c18_table21', -4.6, yS, 2.3, 0);
  I('c18_jeu', 'c18:vingt', -4.6, yS + 1.05, 1.25, 'Le vingt-et-un', { jeu: 'vingt' });
  C.gens.valentin = { lx: -4.6, lz: 3.25, rr: PI };
  // le baccara
  P('c18_baccara', 1.5, yS, 2.6, 0);
  I('c18_jeu', 'c18:baccara', 1.5, yS + 1.05, 1.45, 'Le baccara', { jeu: 'baccara' });
  C.gens.desire = { lx: 1.5, lz: 3.65, rr: PI };
  // le bar, les bouteilles, les tabourets, le barman
  P('c18_bar', -4.3, yS, 5.6, PI, { L: 5.6 });
  K([-7.1, -1.5, 5.3, 5.9], yS, yS + 1.12, 0, garde);
  P('c18_bouteilles', -4.3, yS, IZ - 0.06, PI, { L: 5.4 });
  for (const x of [-6.4, -5.3, -3.3, -2.2]) P('c18_tabouret', x, yS, 4.85, 0);
  I('c18_bar', 'c18:bar', -3.6, yS + 1.3, 4.95, 'Le bar');
  C.gens.theodule = { lx: -4.0, lz: 6.45, rr: PI };
  // le coin du piano : le piano, deux guéridons, des fauteuils, des palmiers
  P('c18_piano', 4.4, yS, IZ - 0.45, PI);
  P('c18_tabouret', 4.4, yS, IZ - 1.25, 0);
  C.gens.pianiste = { lx: 4.4, lz: IZ - 1.22, rr: 0, assis: true };
  P('c18_gueridon', 1.2, yS, 5.6, 0); P('fauteuil', 0.35, yS, 5.6, PI2, { col: '#7a1822' }); P('fauteuil', 2.05, yS, 5.6, -PI2, { col: '#7a1822' });
  P('c18_gueridon', 2.9, yS, -5.6, 0, { vide: true });
  P('c18_palmier', -7.25, yS, -2.8, 0); P('c18_palmier', 5.45, yS, -6.6, 0); P('c18_palmier', -0.5, yS, IZ - 0.45, 0);
  // les trois lustres de la salle (allumés quand le Cercle est ouvert)
  for (const [x, z] of [[-1.2, -2.6], [-1.6, 2.5], [3.6, -2.4]]) { const q = P('c18_lustre', x, Y.plafond, z, 0, { h: 0.85, lit: false }); C.lustres.push(w.props.indexOf(q)); }
  // la directrice, au pied de l'escalier ; le portier, sous la marquise
  C.gens.directrice = { lx: 6.95, lz: -3.3, rr: PI };
  C.gens.portier = { lx: 1.55, lz: -HZ - 0.85, rr: PI };
  I('c18_parler', 'c18:portier', 1.55, 1.5, -HZ - 0.85, 'Le portier', { qui: 'portier' });
  // les habitués (ils viennent le soir)
  Object.assign(C.gens, {
    notaire: { lx: -0.2, lz: -3.85, rr: 0, client: true },
    pelagie: { lx: 2.4, lz: -IZ + 1.0, rr: PI, client: true },
    capitaine: { lx: -5.3, lz: 1.25, rr: 0.25, client: true },
    comtesse: { lx: 2.3, lz: 1.45, rr: -0.2, client: true },
    coquard: { lx: 4.3, lz: -3.3, rr: 0.15, client: true },
    docteur: { lx: 0.35, lz: 5.6, rr: PI2, client: true, assis: true },
    gris: { lx: -2.5, lz: 4.75, rr: 0, client: true },
  });
  for (const k of ['odile', 'rigobert', 'valentin', 'desire', 'theodule', 'caissiere', 'directrice', 'pianiste', 'notaire', 'pelagie', 'capitaine', 'comtesse', 'coquard', 'docteur', 'gris']) {
    const g = C.gens[k], hh = g.assis ? 1.05 : 1.45;
    I('c18_parler', 'c18:' + k, g.lx, yS + hh, g.lz, '', { qui: k });
  }
  // le grand escalier : à pied, ou d'un trait (E au pied, E sur le palier)
  const xm = (E.x0 + IX) / 2, dirH = b1W({ x: 0, z: 0, r: f.r }, 0, 1), yawH = Math.atan2(-dirH[0], -dirH[1]);
  I('c18_escalier', 'c18:monter', xm, yS + 1.2, E.z0 - 0.45, 'Monter le grand escalier', { sens: 'haut', to: WP(xm, Y.etage + 0.02, E.z1 + 0.8), pied: WP(xm, yS + 0.02, E.z0 - 0.35), haut: WP(xm, Y.etage + 0.02, E.z1 + 0.3), yaw: yawH });
  I('c18_escalier', 'c18:descendre', xm, Y.etage + 1.0, E.z1 + 0.55, 'Descendre', { sens: 'bas', to: WP(xm, yS + 0.02, E.z0 - 0.9), pied: WP(xm, yS + 0.02, E.z0 - 0.35), haut: WP(xm, Y.etage + 0.02, E.z1 + 0.3), yaw: yawH + PI });

  // ------------------------------------------------------------- la suite Impériale
  const yE = Y.etage;
  // le salon : la cheminée, le portrait du baron au-dessus, les fauteuils, le secrétaire, le lustre
  P('c18_tapis', -1.2, yE, -3.6, 0, { w: 8.5, d: 5.0, c: '#3a2448' });
  P('cheminee', -IX + 0.35, yE, -3.5, PI2, { lit: true });
  P('c18_portrait', -IX + 0.06, yE + 1.75, -3.5, PI2, { voile: false });
  I('c18_suite', 'c18:portrait', -IX + 0.6, yE + 2.3, -3.5, 'Le portrait', { quoi: 'portrait' });
  P('c18_gueridon', -4.4, yE, -3.5, 0);
  P('fauteuil', -4.4, yE, -4.5, 0, { col: '#5a2a5a' }); P('fauteuil', -4.4, yE, -2.5, PI, { col: '#5a2a5a' }); P('fauteuil', -3.3, yE, -3.5, -PI2, { col: '#5a2a5a' });
  P('secretaire', -2.3, yE, -0.4, PI);
  I('c18_suite', 'c18:secretaire', -2.3, yE + 1.0, -0.95, 'Le secrétaire', { quoi: 'secretaire' });
  P('c18_palmier', 5.3, yE, -6.4, 0); P('c18_palmier', -7.1, yE, -6.4, 0);
  P('horloge', 5.6, yE, -0.45, PI);
  P('c18_piano', 2.2, yE, -0.45, PI); P('c18_tabouret', 2.2, yE, -1.2, 0);
  { const q = P('c18_lustre', -1.2, Y.haut, -3.6, 0, { h: 0.6, lit: true }); C.lustreSuite = w.props.indexOf(q); }
  I('c18_suite', 'c18:balcon', 0, yE + 1.3, -HZ - 0.9, 'Regarder la ville', { quoi: 'balcon' });
  // la chambre : le lit à baldaquin, l'armoire, la commode (le coffre de la suite), la malle du baron, une lampe
  P('c18_tapis', -4.4, yE, 4.2, 0, { w: 4.4, d: 3.4, c: '#5a1418' });
  P('c18_lit', -4.4, yE, IZ - 1.15, PI);
  I('c18_suite', 'c18:lit', -4.4, yE + 0.9, IZ - 2.6, 'Dormir', { quoi: 'lit' });
  P('armoire', -6.4, yE, 0.36, 0);
  P('commode', -1.35, yE, 2.0, -PI2);
  I('c18_suite', 'c18:coffre', -1.85, yE + 1.0, 2.0, 'La commode', { quoi: 'coffre' });
  { const q = P('c18_malle', -1.75, yE, IZ - 0.6, PI, { ouverte: false }); C.malle = w.props.indexOf(q); }
  I('c18_suite', 'c18:malle', -1.75, yE + 0.7, IZ - 1.25, 'Une malle', { quoi: 'malle' });
  P('cheminee', -IX + 0.35, yE, 2.2, PI2, { lit: false });
  P('b1_lampe', -6.6, yE + 0.0, IZ - 0.35, 0, null);
  // la salle de bains : la baignoire, le paravent, le miroir
  P('c18_baignoire', 1.2, yE + 0.02, IZ - 0.75, 0, { eau: false });
  { C.baignoire = w.props.length - 1; }
  I('c18_suite', 'c18:bain', 1.2, yE + 1.0, IZ - 1.5, 'Prendre un bain', { quoi: 'bain' });
  P('c18_paravent', 2.4, yE + 0.02, 3.2, -0.4);
  P('miroir', -0.92, yE + 0.02, 3.4, PI2);
  // l'antichambre
  P('c18_palmier', 4.0, yE, IZ - 0.5, 0); P('fauteuil', 3.9, yE, 2.4, PI2, { col: '#5a2a5a' });

  // ------------------------------------------------------------- le bâtiment, le lieu, les chemins
  const out = b1W(f, 0, -HZ - 2.2), inn = b1W(f, 0, -HZ + 1.2), mid = b1W(f, 0, -5.0);
  const N = w.nav, nodes = N.nodes;
  for (const n of nodes) { const [lx, lz] = b1L(f, n.x, n.z); if (Math.abs(lx) < HX + 0.5 && Math.abs(lz) < HZ + 0.5) n.c18 = 1; }
  N.edges = N.edges.filter(([a, b]) => !nodes[a].c18 && !nodes[b].c18);
  const nOut = B.navNode(out[0], out[1], 'casino:out'), nIn = B.navNode(inn[0], inn[1], 'casino:in'), nMid = B.navNode(mid[0], mid[1], 'casino:mid');
  B.navLink(nOut, nIn, 'door:' + dEntree); B.navLink(nIn, nMid);
  w.grid = null;
  const voisins = nodes.map((n, i) => [i, Math.hypot(n.x - out[0], n.z - out[1])]).filter(([i, d]) => i !== nOut && i !== nIn && i !== nMid && !nodes[i].c18 && d < 14 && !/:(in|mid)$/.test(nodes[i].tag)).sort((a, b) => a[1] - b[1]);
  let liens = 0;
  for (const [i] of voisins) { if (liens >= 3) break; if (segClear(w, out[0], out[1], nodes[i].x, nodes[i].z)) { B.navLink(nOut, i); liens++; } }
  // les liaisons qui traversent l'emprise sont retirées (les autres ne bougent pas, ni les nœuds isolés d'ailleurs)
  const traverse = (A, Bn) => { const L = Math.hypot(Bn.x - A.x, Bn.z - A.z), n = Math.max(2, Math.ceil(L / 0.5)); for (let k = 0; k <= n; k++) { const [lx, lz] = b1L(f, lerp(A.x, Bn.x, k / n), lerp(A.z, Bn.z, k / n)); if (Math.abs(lx) < HX + 0.3 && Math.abs(lz) < HZ + 0.3) return true; } return false; };
  N.edges = N.edges.filter(([a, b, flag]) => (a >= nOut && a <= nMid) || (b >= nOut && b <= nMid) || flag || !traverse(nodes[a], nodes[b]));
  N.adj = nodes.map(() => []);
  for (const [a, b, flag] of N.edges) { const d = Math.hypot(nodes[a].x - nodes[b].x, nodes[a].z - nodes[b].z); N.adj[a].push({ to: b, d, flag }); N.adj[b].push({ to: a, d, flag }); }
  for (const n of nodes) if (n.c18) { n.iso = true; delete n.c18; }
  for (const i of [nOut, nIn, nMid]) nodes[i].iso = !liens;
  const Bd = { key: 'casino', name: LIEU_NAMES.casino, x: f.x, z: f.z, y: f.y + Y.sol, f, W, D, H: Y.mur, door: dEntree, nOut, nIn, nMid, spots: {}, out, c18: true };
  w.bld.casino = Bd;
  B.landmark('casino', out[0], out[1], 9);
  // l'étage, pour les règles « dans quel bâtiment est-on » (11-zzzzB1-ville.js)
  if (!w.b1) w.b1 = { niveaux: {}, tours: [], chandelle: -1 };
  (w.b1.niveaux.casino || (w.b1.niveaux.casino = [])).push({ y: f.y + Y.etage, y1: f.y + Y.haut - 0.2, trappe: null, niv: 1 });
  C.nOut = nOut; C.inter1 = w.inter.length;
  // les herbes qui poussaient là : replantées tout près, dehors (contre un mur, loin des portes et des interactions) ; sinon, arrachées
  w.grid = null;
  const loinDe = (x, z) => !w.inter.some((it) => Math.abs(it.x - x) < 1.5 && Math.abs(it.z - z) < 1.5) && !w.doors.some((d) => Math.abs(d.x - x) < 1.6 && Math.abs(d.z - z) < 1.6);
  C.deplaces = []; C.arraches = [];
  for (const i of aDeplacer) {
    const o = w.objects[i], [lx0, lz0] = b1L(f, o.x, o.z);
    const cands = [];
    for (const d of [0.7, 1.2, 1.8]) for (const u of [0, 0.8, -0.8, 1.6, -1.6, 2.6, -2.6]) {
      cands.push([lx0 < 0 ? -HX - d : HX + d, clamp(lz0 + u, -HZ + 0.5, HZ - 0.5)]);       // contre un pignon
      cands.push([clamp(lx0 + u, -HX + 0.5, HX - 0.5), HZ + d]);                             // contre le mur du fond
    }
    let ok = null;
    for (const [cx, cz] of cands) {
      const [x, z] = b1W(f, cx, cz);
      if (emprise(x, z, 0.3) || w.heightAt(x, z) < w.waterLevel + 0.3 || !w.inside(x, z, 10) || !pointFree(w, x, z, 0.35) || !loinDe(x, z)) continue;
      if (C.deplaces.some((j) => Math.hypot(w.objects[j].x - x, w.objects[j].z - z) < 0.5)) continue;
      ok = [x, z]; break;
    }
    if (ok) { o.x = ok[0]; o.z = ok[1]; C.deplaces.push(i); } else { o.gone = true; o.cleared = true; C.arraches.push(i); }
  }
  // les trouvailles (11-zzzzR-ramasser.js) tombées dans l'emprise : posées sur ce qui les porte (le parquet, une marche),
  // sans bouger en plan (leur signature, qui garde ce qu'on a ramassé, ne change pas)
  C.trouvailles = 0;
  if (w.ramasse && Array.isArray(w.ramasse.L)) for (const o of w.ramasse.L) {
    if (!emprise(o.x, o.z, 0.3)) continue;
    let y = Math.max(o.y, f.y);
    for (let k = 0; k < 12; k++) {
      let haut = y;
      for (let j = C.blocs0; j < w.blocks.length; j++) {
        const b = w.blocks[j];
        if (b.hidden || b.y > y + 0.01 || b.y + b.sy <= y + 0.001 || Math.abs(b.x - o.x) > 20 || Math.abs(b.z - o.z) > 20) continue;
        const [lx, lz] = World.blockLocal(b, o.x, o.z);
        if (Math.abs(lx) <= b.sx / 2 && Math.abs(lz) <= b.sz / 2) haut = Math.max(haut, b.y + b.sy);
      }
      if (haut <= y + 0.001) break;
      y = haut;
    }
    if (Math.abs(y - o.y) > 0.001) { o.y = y + 0.005; o.b = '_casino'; o.tx = 0; o.tz = 0; C.trouvailles++; }
  }
  w.objectsDirty = true; w.grid = null; w.blocksDirty = true; w.coverDirty = true; w.shadeDirty = true;
}
{
  const _gv = generateValley;
  generateValley = async function (seed, progress, gen) {
    const w = await _gv(seed, progress, gen);
    if (w) { try { c18Generer(w, w.seed || seed); } catch (e) { console.error('C18 : génération', e); } }
    return w;
  };
}
