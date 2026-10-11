// ============================================================================
//  LE GRAND HÔTEL DES CIMES (agent L18, dix-huitième vague) — 1. LE PLAN ET LA PASSE
//  Une passe de génération de la vallée (après toutes les autres de l'époque :
//  11-zzzzzzzL18 se trie après H17 ; tirage propre mulberry32(graine ^ 0x1A18C1E5)).
//  On AJOUTE au bout des listes (blocs, objets posés, interactions, portes) ;
//  rien n'est ajouté à w.objects (les arbres du chantier s'en vont : o.gone, leur
//  rang ne bouge pas) ; les anciennes sauvegardes retrouvent tout.
//  Le site : le replat des monts de l'Est, à 57 m au-dessus de l'eau, en face du
//  château, à 1,3 km de Valbrume (x 2 822, z 1 326) ; à plus de 400 m du château,
//  700 m de la Grande Porte, 800 m du camp des géants ; loin de l'estive, du col,
//  du refuge. Un grand terre-plein (110 × 66 m), la terrasse au couchant.
//  Repère local (f) : x vers le nord (la longueur du palace), z vers l'est
//  (la profondeur), la façade regarde l'ouest (-z), la vallée.
//   - le CORPS PRINCIPAL (60 × 18 m), quatre niveaux de 4 m : le rez-de-chaussée
//     (le hall et la loge du concierge, la salle à manger, la cuisine, le salon
//     de lecture, le bureau du directeur, le couloir de service et la table du
//     veilleur de nuit), deux étages de chambres (101-116, 117-129 ; 201-216,
//     217-229 : il n'y a pas de 13), les combles (le personnel, la mansarde du
//     concierge) ; l'escalier d'honneur, à double volée, au fond du hall ; le
//     balcon d'honneur au-dessus de l'entrée ; les lettres sur le toit ;
//   - la SALLE DE BAL au sud (20 × 22 m, 8 m sous plafond, trois lustres) ;
//   - l'AILE NORD, fermée depuis l'hiver 1871 (fenêtres aveuglées de planches,
//     la porte du couloir de service fermée à clé ; dedans, une échelle, et au
//     bout du couloir du premier, la porte sans numéro : la treize) ;
//   - les CAVES (sous la cuisine, par l'escalier de la cuisine) : la cave à vin,
//     la réserve, la buanderie, la chaufferie ;
//   - la cour d'honneur et sa fontaine, la marquise, la terrasse sur la vallée
//     (la balustrade, les parasols, la longue-vue), le potager, la remise (la
//     voiture de l'hôtel) ;
//   - le FUNICULAIRE : la gare d'en haut au bout de la terrasse, 180 m de voie
//     (une tranchée, puis un viaduc de pierre), la gare d'en bas dans la vallée ;
//     un chemin muletier en lacets à côté ; une route jusqu'à celle du château ;
//   - la VOITURE des Cimes : un arrêt à la fourche au nord de Valbrume.
//  Tout est noté dans w.l18 (pièces, chambres, nœuds de marche des gens, places).
// ============================================================================
const L18_SITE = { x: 2822, z: 1326, r: Math.PI / 2 };
const L18_GRAINE = 0x1A18C1E5;
const L18_ET = [0.15, 4, 8, 12, 15.6]; // le dessus des planchers (rez-de-chaussée, 1er, 2e, combles) et le toit
// la gare d'en bas du funiculaire, l'arrêt de la voiture (coordonnées du monde)
const L18_FUNI_BAS = { x: 2611, z: 1432 };
const L18_ARRET = { x: 1580, z: 1476 };
const L18_ROUTE = [[2214, 1312], [2300, 1338], [2400, 1372], [2500, 1406], [2590, 1430]];

const L18_LIEUX = {
  l18_hotel: 'le Grand Hôtel des Cimes', l18_terrasse: 'la terrasse du Grand Hôtel', l18_bal: 'la salle de bal du Grand Hôtel',
  l18_aile: 'l’aile Nord du Grand Hôtel', l18_caves: 'les caves du Grand Hôtel', l18_funi_haut: 'la gare haute du funiculaire',
  l18_funi_bas: 'la gare basse du funiculaire', l18_arret: 'l’arrêt de la voiture des Cimes',
};
Object.assign(LIEU_NAMES, L18_LIEUX);
DYN_PROPS.add('l18_cabine'); DYN_PROPS.add('l18_sonnettes');

function l18Generer(w, seed) {
  if (!w || !w.designed || w.l18) return null;
  const T0 = Date.now();
  const rnd = mulberry32(((seed | 0) ^ L18_GRAINE) >>> 0);
  const B = new Builder(w, rnd, new Uint8Array(1));
  const avant = { o: w.objects.length, p: w.props.length, i: w.inter.length, b: w.blocks.length, d: w.doors.length };
  const f = { x: L18_SITE.x, z: L18_SITE.z, r: L18_SITE.r, y: 0 };
  // ------------------------------------------------------------- le niveau du terre-plein
  let s = 0, n = 0;
  for (let lx = -30; lx <= 30; lx += 4) for (let lz = -9; lz <= 9; lz += 3) { const [x, z] = B.toWorld(f, lx, lz); s += w.heightAt(x, z); n++; }
  const Y = Math.round((s / n) * 2) / 2;
  f.y = Y;
  const V = {
    v: 1, x: f.x, z: f.z, r: f.r, y: Y, f, pieces: {}, chambres: {}, nav: { n: [], e: [], id: {} }, places: {}, portes: {}, inters: {},
    funi: null, route: L18_ROUTE.slice(), arret: null, avant, ms: 0,
  };
  Object.defineProperty(V, 'monde', { value: w, enumerable: false });
  w.l18 = V;
  const toW = (lx, lz) => B.toWorld(f, lx, lz);
  const W3 = (lx, ly, lz) => { const [x, z] = toW(lx, lz); return [x, Y + ly, z]; };
  // ------------------------------------------------------------- les outils (repère local du palace)
  const bloc = (x0, x1, y0, y1, z0, z1, m, o) => {
    if (x1 - x0 < 0.01 || y1 - y0 < 0.01 || z1 - z0 < 0.01) return null;
    const [x, z] = toW((x0 + x1) / 2, (z0 + z1) / 2);
    const b = { x, y: Y + y0, z, sx: x1 - x0, sy: y1 - y0, sz: z1 - z0, r: f.r, m, sh: (o && o.sh) || 0, l18: 1 };
    if (y0 >= 1.2 && !(o && o.toit)) b.plafond = true;
    if (o && o.under) { b.under = true; if (o.ceil) b.ceil = true; }
    if (o && o.hidden) b.hidden = true;
    w.blocks.push(b);
    return b;
  };
  // les pleins d'un mur percé : [u0, u1, h0, h1] (les colonnes voisines aux mêmes pleins sont fusionnées)
  const morceaux = (a, b, y0, y1, ouv) => {
    const xs = [a, b];
    for (const o of ouv) for (const u of [o[0], o[1]]) if (u > a + 0.01 && u < b - 0.01) xs.push(u);
    xs.sort((p, q) => p - q);
    const cols = [];
    for (let i = 0; i < xs.length - 1; i++) {
      const u0 = xs[i], u1 = xs[i + 1];
      if (u1 - u0 < 0.01) continue;
      const m = (u0 + u1) / 2;
      const trous = ouv.filter((o) => o[0] < m && o[1] > m).map((o) => [Math.max(y0, o[2]), Math.min(y1, o[3])]).filter((t) => t[1] > t[0]).sort((p, q) => p[0] - q[0]);
      const pleins = [];
      let h = y0;
      for (const [t0, t1] of trous) { if (t0 > h + 0.01) pleins.push([h, t0]); h = Math.max(h, t1); }
      if (y1 > h + 0.01) pleins.push([h, y1]);
      const cle = pleins.map((p) => p.join(',')).join(';'), last = cols[cols.length - 1];
      if (last && last.cle === cle && Math.abs(last.u1 - u0) < 1e-6) { last.u1 = u1; continue; }
      cols.push({ u0, u1, cle, pleins });
    }
    const res = [];
    for (const c of cols) for (const [h0, h1] of c.pleins) res.push([c.u0, c.u1, h0, h1]);
    return res;
  };
  // un mur le long de x (à z = c), ou le long de z (à x = c) ; t : épaisseur ; ouv : [u0, u1, h0, h1]
  const murX = (c, a, b, y0, y1, t, m, ouv) => { for (const [u0, u1, h0, h1] of morceaux(a, b, y0, y1, ouv || [])) bloc(u0, u1, h0, h1, c - t / 2, c + t / 2, m); };
  const murZ = (c, a, b, y0, y1, t, m, ouv) => { for (const [u0, u1, h0, h1] of morceaux(a, b, y0, y1, ouv || [])) bloc(c - t / 2, c + t / 2, h0, h1, u0, u1, m); };
  // une vraie porte (w.doors) ; axe 'x' : dans un mur le long de x ; sens : de quel côté elle s'ouvre (+1 : vers +z ou +x)
  const porte = (id, lx, lz, y, axe, o) => {
    o = o || {};
    const [x, z] = toW(lx, lz);
    const r = f.r + (axe === 'x' ? 0 : Math.PI / 2) + ((o.sens || 1) < 0 ? Math.PI : 0) * (axe === 'x' ? 1 : -1);
    const d = { x, y: Y + y + 0.02, z, r, w: (o.w || 1.0) - 0.06, h: (o.h || 2.2) - 0.05, a: 0, open: o.ouverte ? 1 : 0, locked: !!o.verrou, bld: null, m: o.m, l18: id };
    w.doors.push(d);
    V.portes[id] = w.doors.length - 1;
    return w.doors.length - 1;
  };
  const prop = (id, lx, ly, lz, rr, data, sc) => { const [x, z] = toW(lx, lz); return B.prop(id, x, Y + ly, z, f.r + (rr || 0), data, sc); };
  const inter = (kind, id, lx, ly, lz, nom, data) => { const [x, z] = toW(lx, lz); const it = B.inter(kind, id, x, Y + ly, z, nom, data || {}); V.inters[id] = it; return it; };
  // les nœuds de marche des gens (repère local ; y : le dessus du plancher)
  const N = V.nav;
  const noeud = (id, lx, ly, lz) => { if (N.id[id] !== undefined) return N.id[id]; N.n.push({ id, p: W3(lx, ly, lz) }); N.id[id] = N.n.length - 1; return N.id[id]; };
  const lien = (a, b, porteId) => { const ia = typeof a === 'number' ? a : N.id[a], ib = typeof b === 'number' ? b : N.id[b]; if (ia === undefined || ib === undefined) throw new Error('L18 : nœud ' + a + ' / ' + b); N.e.push([ia, ib, porteId || null]); };
  const chaine = (...ids) => { for (let i = 1; i < ids.length; i++) lien(ids[i - 1], ids[i]); };
  const piece = (k, nom, lx0, lx1, ly, lz0, lz1, et) => { V.pieces[k] = { k, nom, lx0, lx1, lz0, lz1, y: ly, et: et || 0, c: W3((lx0 + lx1) / 2, ly, (lz0 + lz1) / 2) }; };
  const place = (k, lx, ly, lz, cap) => { V.places[k] = { p: W3(lx, ly, lz), cap: f.r + (cap || 0) }; };

  // ------------------------------------------------------------- 1. le terre-plein, la cour, la terrasse (le relief)
  // ce qu'il ne faut pas déranger : les lieux, objets posés, interactions et blocs d'avant, proches
  const garde = [];
  for (const k in w.lm) { const L = w.lm[k]; if (!L.under && Math.hypot(L.x - f.x, L.z - f.z) < 260) garde.push([L.x, L.z, Math.min(L.r || 8, 20)]); }
  for (const q of w.props) if (Math.abs(q.x - f.x) < 260 && Math.abs(q.z - f.z) < 260) garde.push([q.x, q.z, 2]);
  for (const it of w.inter) if (Math.abs(it.x - f.x) < 260 && Math.abs(it.z - f.z) < 260) garde.push([it.x, it.z, 2]);
  for (const b of w.blocks) if (!b.under && Math.abs(b.x - f.x) < 260 && Math.abs(b.z - f.z) < 260) garde.push([b.x, b.z, Math.max(b.sx, b.sz) / 2 + 1]);
  V.garde = garde.length;
  const change = new Map(); // sommet → écart de hauteur
  const H = w.heights;
  const terrasser = (fn) => (i, j, k, x, z) => {
    const y0 = H[k];
    let y = fn(x, z, y0);
    if (y === null || y === undefined) return;
    for (const [gx, gz, gr] of garde) { const d = Math.hypot(x - gx, z - gz) - gr; if (d < 12) y = lerp(y0, y, smoothstep(2, 12, d)); }
    if (Math.abs(y - y0) < 0.01) return;
    H[k] = y; change.set(k, (change.get(k) || 0) + Math.abs(y - y0));
  };
  const PL = { x0: -58, x1: 52, z0: -42, z1: 24 }, CHUTE = 22;
  B.forVerts(f.x, f.z, 140, terrasser((x, z, y0) => {
    const [lx, lz] = B.toLocal(f, x, z);
    const d = Math.max(PL.x0 - lx, lx - PL.x1, PL.z0 - lz, lz - PL.z1, 0);
    // devant la terrasse (la vallée) : le relief est rabattu sous un talus qui descend, jusqu'à 70 m (la vue) ;
    // sur les côtés et derrière (la montagne), il retrouve sa pente naturelle
    const devant = lz < PL.z0 + 6 && lx > PL.x0 - 30 && lx < PL.x1 + 30;
    if (devant && d < 70) {
      const talus = Y - 0.06 - Math.max(0, d - 2) * 0.55;
      const cible = Math.min(y0, talus);
      return d < CHUTE ? lerp(Y - 0.06, cible, smoothstep(0, CHUTE, d)) : (cible < y0 - 0.01 ? cible : null);
    }
    if (d >= CHUTE) return null;
    return lerp(Y - 0.06, y0, smoothstep(0, CHUTE, d));
  }));
  // les sols : la cour (gravier), la terrasse (pavés), les pelouses, le potager
  B.paintRect(f, -3, -6, 55, 30, M_LUSH);
  B.paintRect(f, 6, -16.5, 40, 7.2, M_SAND);
  B.paintRect(f, -4, -32, 52, 8, M_COBBLE);
  B.paintRect(f, 0, 16, 26, 5.5, M_DIRT);
  for (let k = -3; k <= 3; k++) B.paintRect(f, k * 7, 16, 2.6, 5, M_FLOWERS);
  B.paintRect(f, 48, -12, 4, 10, M_SAND);
  B.paintRect(f, 0, 0, 31, 10, M_SAND); B.paintRect(f, -40, 0, 11, 12, M_SAND); B.paintRect(f, 36, 0, 7, 8, M_SAND); B.paintRect(f, 48, 0, 5, 7, M_SAND);

  // ------------------------------------------------------------- 2. le corps principal
  const FAC = M_L18_FACADE, ENDUIT = M_PLASTER, PEINT = M_PAPIER_PEINT, PARQ = M_PLANKS, PIERRE = M_STONE;
  const X0 = -30, X1 = 30, Z0 = -9, Z1 = 9, EP = 0.5;
  const ZI0 = Z0 + EP, ZI1 = Z1 - EP, XI0 = X0 + EP, XI1 = X1 - EP;
  const SX0 = -6, SX1 = 2, SZ0 = 1.2; // la cage de l'escalier (fond du hall)
  // les fondations, un socle de pierre qui dépasse un peu
  bloc(X0 - 0.3, X1 + 0.3, -1.4, 0.15, Z0 - 0.3, Z1 + 0.3, PIERRE);
  // une façade le long de x, par travées de 4 m (une fenêtre au milieu de chacune) : spec[k] (k = -7..7) : rien, ou
  // { u0, u1, h0, h1 } (une baie dans cette travée : la travée est alors enduite, avec son encadrement de pierre)
  const facadeX = (c, y0, y1, spec) => {
    let run = [];
    const vider = () => {
      // des suites impaires de travées (le milieu d'un bloc tombe sur une fenêtre)
      while (run.length) {
        const nb = run.length % 2 ? run.length : run.length - 1;
        const a = run[0] * 4 - 2, b = run[nb - 1] * 4 + 2;
        bloc(a, b, y0, y1, c - EP / 2, c + EP / 2, FAC);
        run = run.slice(nb);
      }
    };
    for (let k = -7; k <= 7; k++) {
      const o = spec && spec[k];
      if (!o) { run.push(k); continue; }
      vider();
      const a = k * 4 - 2, b = k * 4 + 2;
      murX(c, a, b, y0, y1, EP, ENDUIT, [[o.u0, o.u1, o.h0, o.h1]]);
      // l'encadrement (deux montants, un linteau), en saillie
      const s = c < 0 ? -1 : 1;
      bloc(o.u0 - 0.25, o.u0, o.h0, o.h1 + 0.3, c + s * EP / 2 - (s < 0 ? 0.12 : 0), c + s * EP / 2 + (s > 0 ? 0.12 : 0), PIERRE);
      bloc(o.u1, o.u1 + 0.25, o.h0, o.h1 + 0.3, c + s * EP / 2 - (s < 0 ? 0.12 : 0), c + s * EP / 2 + (s > 0 ? 0.12 : 0), PIERRE);
      bloc(o.u0 - 0.25, o.u1 + 0.25, o.h1, o.h1 + 0.3, c + s * EP / 2 - (s < 0 ? 0.12 : 0), c + s * EP / 2 + (s > 0 ? 0.12 : 0), PIERRE);
    }
    vider();
  };
  // les quatre niveaux : murs extérieurs (un bloc de 4 m par étage : une rangée de fenêtres), planchers, bandeaux
  for (let e = 0; e < 4; e++) {
    const wy0 = 4 * e, wy1 = Math.min(4 * e + 4, 15.6), y0e = e === 0 ? 0.15 : L18_ET[e];
    // la façade (ouest) : l'entrée, les portes-fenêtres de la salle à manger et du salon ; le balcon d'honneur ; la lucarne des combles
    const avant = {};
    if (e === 0) { avant[0] = { u0: -1.3, u1: 1.3, h0: 0, h1: 3.1 }; avant[-4] = { u0: -16.6, u1: -15.4, h0: 0, h1: 2.8 }; avant[4] = { u0: 15.4, u1: 16.6, h0: 0, h1: 2.8 }; }
    else avant[0] = { u0: -0.65, u1: 0.65, h0: y0e - 0.05, h1: y0e + 2.6 };
    facadeX(Z0 + EP / 2, wy0, wy1, avant);
    // le dos (est) : la porte de service de la cuisine
    const dos = {};
    if (e === 0) dos[-5] = { u0: -20.6, u1: -19.4, h0: 0, h1: 2.6 };
    facadeX(Z1 - EP / 2, wy0, wy1, dos);
    // les pignons : au sud, l'arche de la salle de bal (rez-de-chaussée) ; au nord, les portes de l'aile
    murZ(X0 + EP / 2, ZI0, ZI1, wy0, wy1, EP, FAC, e === 0 ? [[-6, -2, 0, 3.4]] : []);
    const pN = e === 0 ? [[5.4, 6.6, 0.15, 2.45]] : e < 3 ? [[-0.6, 0.6, y0e, y0e + 2.3]] : [];
    murZ(X1 - EP / 2, ZI0, ZI1, wy0, wy1, EP, FAC, pN);
    // le plancher de l'étage d'au-dessus (percé de la cage de l'escalier, sauf le palier de départ)
    if (e < 3) {
      const yp = L18_ET[e + 1] - 0.25, yt = L18_ET[e + 1];
      const sol = e + 1 === 3 ? ENDUIT : PARQ;
      bloc(XI0, XI1, yp, yt, ZI0, SZ0, sol);                      // devant la cage
      bloc(XI0, SX0, yp, yt, SZ0, ZI1, sol);                      // au sud de la cage
      bloc(SX1, XI1, yp, yt, SZ0, ZI1, sol);                      // au nord
      bloc(SX0, SX0 + 2.7, yp, yt, SZ0, ZI1, sol);                // le palier de départ de l'étage
      bloc(SX0 + 2.7, SX0 + 5.3, yp, yt, 3.3, 6.6, sol);          // au-dessus du noyau
      // le bandeau mouluré, dehors, tout autour
      bloc(X0 - 0.15, X1 + 0.15, yt - 0.35, yt + 0.05, Z0 - 0.15, Z0, PIERRE);
      bloc(X0 - 0.15, X1 + 0.15, yt - 0.35, yt + 0.05, Z1, Z1 + 0.15, PIERRE);
      bloc(X0 - 0.15, X0, yt - 0.35, yt + 0.05, Z0, Z1, PIERRE);
      bloc(X1, X1 + 0.15, yt - 0.35, yt + 0.05, Z0, Z1, PIERRE);
    }
  }
  // le sol du rez-de-chaussée : marbre (carrelage) au hall, parquet ailleurs
  bloc(XI0, SX0, 0, 0.15, ZI0, ZI1, PARQ);
  bloc(SX0, 6, 0, 0.15, ZI0, ZI1, M_TILE);
  bloc(6, XI1, 0, 0.15, ZI0, ZI1, PARQ);
  // la corniche et le toit (un seul grand toit d'ardoise à deux pans : les combles dessous)
  bloc(X0 - 0.4, X1 + 0.4, 15.3, 15.7, Z0 - 0.4, Z1 + 0.4, PIERRE, { toit: true });
  const toitP = bloc(X0 - 0.6, X1 + 0.6, 15.6, 21.2, Z0 - 0.6, Z1 + 0.6, M_SLATE, { sh: 1, toit: true });
  void toitP;
  // les cheminées sur le toit
  for (const x of [-22, -8, 8, 22]) bloc(x - 0.6, x + 0.6, 17, 22.8, -0.6, 0.6, M_BRICK, { toit: true });
  // les lettres du toit, sur le faîtage, face à la vallée
  prop('l18_enseigne', 0, 20.6, -0.6, Math.PI, { p: 0.36 });
  // la lucarne des combles et son petit balcon (on y sort par la porte-fenêtre)
  bloc(-1.6, 1.6, 15.6, 18.4, Z0 - 0.5, Z0 + 1.5, PIERRE, { toit: true });
  bloc(-1.2, 1.2, 11.75, 12.0, Z0 - 1.3, Z0, PIERRE);
  for (const s2 of [-1, 1]) bloc(s2 * 1.2 - 0.08, s2 * 1.2 + 0.08, 12, 12.5, Z0 - 1.3, Z0, M_METAL);
  bloc(-1.2, 1.2, 12.0, 12.45, Z0 - 1.3, Z0 - 1.2, M_METAL); // (un parapet bas : on enjambe)
  // le balcon d'honneur (1er) et celui du 2e, au-dessus de l'entrée
  for (const e of [1, 2]) {
    const yb = L18_ET[e];
    bloc(-3.6, 3.6, yb - 0.3, yb, Z0 - 1.6, Z0, PIERRE);
    bloc(-3.6, 3.6, yb, yb + 1.0, Z0 - 1.6, Z0 - 1.45, M_METAL);
    for (const s2 of [-1, 1]) bloc(s2 * 3.6 - 0.15 * (s2 > 0 ? 1 : 0), s2 * 3.6 + 0.15 * (s2 < 0 ? 1 : 0), yb, yb + 1.0, Z0 - 1.6, Z0, M_METAL);
  }
  // la marquise de l'entrée (fer et verre), sur deux colonnes de fonte
  bloc(-4, 4, 3.5, 3.7, Z0 - 4.2, Z0, M_FROSTED);
  bloc(-4.1, 4.1, 3.7, 3.85, Z0 - 4.3, Z0 - 4.1, M_METAL);
  for (const s2 of [-1, 1]) bloc(s2 * 3.7 - 0.1, s2 * 3.7 + 0.1, 0, 3.5, Z0 - 4.1, Z0 - 3.9, M_METAL);
  // le perron : trois marches devant l'entrée
  for (let k = 0; k < 3; k++) bloc(-2.4 - k * 0.3, 2.4 + k * 0.3, -0.4, 0.15 - k * 0.05, Z0 - 0.6 - k * 0.5, Z0, PIERRE);

  // ------------------------------------------------------------- 3. le rez-de-chaussée
  const y0 = 0.15, hR = 3.75; // le plafond du rez-de-chaussée (le plancher du 1er, en dessous)
  // le hall (x -6..6) : la salle à manger au sud, le salon au nord (deux grandes arches) ; la cage et le bureau au fond
  murZ(-6, ZI0, SZ0, y0, hR, 0.3, PEINT, [[-4.4, -1.0, y0, 3.2]]);
  murZ(6, ZI0, ZI1, y0, hR, 0.3, PEINT, [[-4.4, -1.0, y0, 3.2]]);
  // le fond du hall : la cage (balustrade de pierre au pied de la première volée), le bureau du directeur
  murX(SZ0, -3.3, SX1, y0, y0 + 1.0, 0.25, PIERRE);
  murX(SZ0, SX1, 6, y0, hR, 0.3, PEINT, [[3.5, 4.5, y0, y0 + 2.2]]);
  murZ(SX1, SZ0, ZI1, y0, hR, 0.3, PEINT);
  murZ(SX0, SZ0, ZI1, y0, hR, 0.3, PEINT);
  porte('bureau', 4, SZ0, y0, 'x', { sens: 1 });
  // la salle à manger (x -30..-6, z -8.5..2.4) ; la cuisine derrière (z 2.4..8.5)
  murX(2.4, XI0, SX0, y0, hR, 0.3, PEINT, [[-10.6, -9.4, y0, y0 + 2.2]]);
  porte('cuisine', -10, 2.4, y0, 'x', { sens: 1 });
  // le salon (x 6..30, z -8.5..3.4) ; le couloir de service derrière (z 3.4..8.5) jusqu'à l'aile
  murX(3.4, 6, XI1, y0, hR, 0.3, PEINT, [[7.4, 8.6, y0, y0 + 2.2]]);
  porte('service', 8, 3.4, y0, 'x', { sens: 1 });
  // la porte de l'aile Nord, au bout du couloir de service (fermée à clé)
  porte('aile', X1 - EP / 2, 6, y0, 'z', { verrou: true, sens: 1, w: 1.2 });
  // les portes-fenêtres de la salle à manger et du salon, la porte de service de la cuisine
  porte('resto_terrasse', -16, Z0 + EP / 2, y0 - 0.15, 'x', { sens: 1, w: 1.2, h: 2.8, m: M_GLASS });
  porte('salon_terrasse', 16, Z0 + EP / 2, y0 - 0.15, 'x', { sens: 1, w: 1.2, h: 2.8, m: M_GLASS });
  porte('cuisine_dos', -20, Z1 - EP / 2, y0 - 0.15, 'x', { sens: -1, w: 1.2, h: 2.6 });
  piece('hall', 'le hall', -6, 6, y0, ZI0, SZ0, 0);
  piece('resto', 'la salle à manger', XI0, -6, y0, ZI0, 2.4, 0);
  piece('cuisine', 'la cuisine', XI0, SX0, y0, 2.4, ZI1, 0);
  piece('salon', 'le salon de lecture', 6, XI1, y0, ZI0, 3.4, 0);
  piece('service', 'le couloir de service', 6, XI1, y0, 3.4, ZI1, 0);
  piece('bureau', 'le bureau du directeur', SX1, 6, y0, SZ0, ZI1, 0);
  // -- le hall : la loge du concierge (dans l'angle sud, face au hall), le casier aux clés, le tableau des sonnettes, l'horloge, les palmiers
  prop('l18_loge', -4.2, y0, -6.6, Math.PI / 2);
  prop('l18_casier', -5.72, y0, -6.6, Math.PI / 2);
  prop('l18_sonnettes', -4.4, y0 + 1.5, -8.32, 0, {});
  prop('horloge_comtoise', -5.6, y0, 0.1, Math.PI / 2);
  for (const [x, z] of [[4.8, -7.8], [4.8, -0.2]]) prop('l18_palmier', x, y0, z, rnd() * TAU);
  prop('l18_bouquet', 0, y0, -2.2, 0);
  prop('tapis', 0, y0, -4.6, 0, { col: '#7a2430' });
  prop('l18_canape', 3.2, y0, -7.7, 0, { col: '#2e4a38' });
  prop('l18_chariot', 2.9, y0, -5.2, 0.3);
  prop('l18_malles', 2.6, y0, -3.6, 0, { n: 3 });
  prop('l18_lustre', 0, hR, -3.6, 0, { g: 1.5 });
  for (const z of [-7.6, 0]) prop('l18_applique', -5.84, 2.4, z, Math.PI / 2);
  for (const z of [-7.6, 0]) prop('l18_applique', 5.84, 2.4, z, -Math.PI / 2);
  inter('l18_loge', 'l18_loge', -3.5, y0 + 1.1, -6.0, 'La loge du concierge', {});
  inter('l18_sonnettes', 'l18_sonnettes', -4.4, y0 + 1.9, -8.1, 'Le tableau des sonnettes', {});
  inter('l18_registre', 'l18_registre', -3.7, y0 + 1.15, -7.4, 'Le registre des voyageurs', {});
  place('loge', -5.0, y0, -6.6, Math.PI / 2);         // derrière le comptoir (le concierge de service, quand ce n'est pas vous)
  place('loge_client', -2.6, y0, -6.6, -Math.PI / 2); // devant, côté hall (les clients qui demandent)
  place('loge_client2', -2.3, y0, -5.1, -Math.PI / 2 - 0.4);
  place('loge_client3', -2.3, y0, -8.0, -Math.PI / 2 + 0.4);
  // -- le bureau du directeur
  prop('secretaire', 4, y0, 8.0, Math.PI);
  prop('coffre_fort', 5.4, y0, 6.2, -Math.PI / 2);
  prop('fauteuil', 4, y0, 6.8, 0);
  prop('tableau', 2.2, 1.6, 5.2, Math.PI / 2);
  prop('gueridon', 2.8, y0, 2.6, 0, { lit: true });
  place('bureau', 4, y0, 7.1, Math.PI);
  inter('l18_coffre', 'l18_coffre', 5.2, y0 + 0.7, 6.2, 'Le coffre-fort du directeur', {});
  // -- la salle à manger : douze tables nappées, le buffet, deux lustres
  const TX = [-26, -21, -11.5];
  TX.forEach((x, i) => { for (let j = 0; j < 3; j++) {
    const z = -6.2 + j * 3.6;
    prop('l18_table', x, y0, z, 0, { fleurs: (i + j) % 2 === 0 });
    prop('chaise', x - 0.9, y0, z, Math.PI / 2); prop('chaise', x + 0.9, y0, z, -Math.PI / 2);
  } });
  prop('buffet', -7.2, y0, 0.6, -Math.PI / 2);
  for (const x of [-24, -12]) prop('l18_lustre', x, hR, -2.6, 0, { g: 1.3 });
  for (const x of [-26, -18, -10]) prop('l18_applique', x, 2.4, 2.22, Math.PI);
  TX.forEach((x, i) => { for (let j = 0; j < 3; j++) place('resto_' + i + j, x - 0.9, y0, -6.2 + j * 3.6, Math.PI / 2); });
  place('maitre_hotel', -7.6, y0, -3, -Math.PI / 2);
  // -- la cuisine : les fourneaux, la grande table, l'escalier de la cave
  prop('four', -28.5, y0, 6.4, Math.PI / 2, { lit: true });
  prop('b1_poele', -26.5, y0, 7.8, Math.PI);
  prop('etabli', -20, y0, 5.2, 0);
  prop('etabli', -15, y0, 5.2, 0);
  prop('etagere', -11, y0, 8.1, Math.PI, { kind: 'bocaux' });
  prop('etagere', -13, y0, 8.1, Math.PI, { kind: 'pain' });
  prop('jambons', -24, 3.0, 8.0, Math.PI);
  prop('tonneau', -8, y0, 7.6, 0); prop('sacs', -9.2, y0, 7.8, 0);
  for (const x of [-24, -14]) prop('l18_applique', x, 2.4, 2.58, 0);
  place('chef', -20, y0, 4.2, 0);
  place('cuisine_porte', -10, y0, 3.4, Math.PI);
  prop('trappe', -7.4, y0, 4.6, 0, { open: true });
  inter('l18_escalier', 'l18_cave_haut', -7.4, y0 + 1, 4.0, 'Descendre aux caves', { to: null });
  // -- le salon : le piano, les canapés, le bar, la bibliothèque
  prop('l18_piano', 26.5, y0, -4.5, Math.PI / 2 + 0.3);
  for (const [x, z, r] of [[12, -6.4, 0], [12, -2.2, Math.PI], [18, -6.4, 0], [18, -2.2, Math.PI]]) prop('l18_canape', x, y0, z, r);
  for (const [x, z] of [[12, -4.3], [18, -4.3]]) prop('gueridon', x, y0, z, 0, { lit: true });
  prop('comptoir', 24, y0, 1.8, Math.PI);
  for (const x of [7.5, 9.5, 11.5]) prop('etagere', x, y0, 3.05, Math.PI, { kind: 'livres' });
  prop('fauteuil', 9, y0, 0.6, Math.PI); prop('fauteuil', 28, y0, 1.4, -Math.PI / 2);
  for (const x of [12, 22]) prop('l18_lustre', x, hR, -3.2, 0, { g: 1.2 });
  place('piano', 26.5 - 1.2, y0, -4.5 - 1.3, Math.PI / 2 + 0.3);
  place('salon_canape', 12, y0, -6.0, 0); place('salon_canape2', 18, y0, -2.6, Math.PI); place('salon_bar', 24, y0, 0.8, Math.PI); place('salon_lecture', 9, y0, 0.2, Math.PI);
  inter('l18_piano', 'l18_piano', 25.8, y0 + 1.0, -5.6, 'Le piano', {});
  // -- le couloir de service : la table du veilleur de nuit, la lingerie
  prop('table', 27, y0, 5.6, 0); prop('chaise', 27, y0, 6.4, Math.PI);
  prop('b1_lampe', 27.2, y0 + 0.8, 5.5, 0);
  prop('armoire', 14, y0, 8.1, Math.PI); prop('armoire', 17, y0, 8.1, Math.PI);
  prop('l18_malles', 21, y0, 7.8, 0, { n: 2 });
  prop('l18_applique', 12, 2.4, 3.58, 0); prop('l18_applique', 24, 2.4, 3.58, 0);
  place('veilleur', 27, y0, 6.4, Math.PI); place('lingerie', 15.5, y0, 7.2, Math.PI);

  // ------------------------------------------------------------- 4. l'escalier d'honneur (trois fois deux volées)
  // la cage : x SX0..SX1 (-6..2), z SZ0..ZI1 (1,2..8,5) ; le palier de départ x -6..-3,3 ; les volées x -3,3..-0,7 ;
  // le palier du milieu x -0,7..1,8 ; le noyau entre les volées, z 3,3..6,6
  const A0 = SX0 + 2.7, A1 = SX0 + 5.3;
  for (let e = 0; e < 3; e++) {
    const ya = L18_ET[e], yb = L18_ET[e + 1], dm = (yb - ya) / 2, pas = dm / 8, run = (A1 - A0) / 8;
    for (let i = 0; i < 8; i++) {
      const t1 = ya + (i + 1) * pas;
      bloc(A0 + i * run, A0 + (i + 1) * run, Math.max(ya - 0.1, t1 - 0.45), t1, SZ0 + 0.2, 3.3, PIERRE);                 // volée A (monte vers +x)
      const t2 = ya + dm + (i + 1) * pas;
      bloc(A1 - (i + 1) * run, A1 - i * run, Math.max(ya - 0.1, t2 - 0.45), t2, 6.6, ZI1, PIERRE);                       // volée B (monte vers -x)
    }
    bloc(A1, SX1 - 0.15, ya + dm - 0.4, ya + dm, SZ0 + 0.2, ZI1, PIERRE);                                              // le palier du milieu
    bloc(A0, A1, ya - 0.1, yb - 0.25, 3.3, 6.6, PIERRE);                                                                  // le noyau
    // côté couloir (aux étages) : un mur entre le couloir et la cage, sauf le palier de départ
    if (e > 0) murX(SZ0, A0, SX1, ya, yb - 0.25, 0.25, PEINT);
    // les nœuds de marche
    const id = (s2) => 'esc' + e + s2;
    noeud(id('D'), SX0 + 1.4, ya, 2.4); noeud(id('A0'), A0 - 0.1, ya, 2.35); noeud(id('A1'), A1 + 0.1, ya + dm, 2.35);
    noeud(id('M1'), A1 + 1.0, ya + dm, 2.35); noeud(id('M2'), A1 + 1.0, ya + dm, 7.5); noeud(id('B0'), A1 - 0.1, ya + dm, 7.5);
    noeud(id('B1'), A0 + 0.1, yb, 7.5); noeud(id('Ar'), SX0 + 1.4, yb, 7.5);
    chaine(id('D'), id('A0'), id('A1'), id('M1'), id('M2'), id('B0'), id('B1'), id('Ar'));
  }
  // aux étages : les deux murs de la cage ; aux combles, le mur du couloir, et une rambarde au bord du vide
  for (let e = 1; e <= 3; e++) { const ya = L18_ET[e], yh = L18_ET[e + 1] - (e < 3 ? 0.25 : 0); murZ(SX0, SZ0, ZI1, ya, yh, 0.2, PEINT); murZ(SX1, SZ0, ZI1, ya, yh, 0.2, PEINT); }
  murX(SZ0, A0, SX1, 12, 15.6, 0.25, PEINT);
  bloc(A0 - 0.1, A0, 12, 13, SZ0, 3.3, M_METAL);
  for (let e = 0; e < 3; e++) for (const z of [2.2, 7.6]) prop('l18_applique', SX0 + 0.16, L18_ET[e] + 2.4, z, Math.PI / 2 * 0 + 0);
  prop('l18_lustre', -1.0, 15.5, 5, 0, { g: 1.6 });

  // ------------------------------------------------------------- 5. les étages : un couloir, les chambres de part et d'autre
  // devant (vue sur la vallée) : quinze chambres d'une travée (4 m) ; derrière : de x -30 à -6 et de 2 à 30
  const numero = (e, i) => { const base = e * 100 + 1 + i; return base >= e * 100 + 13 ? base + 1 : base; }; // il n'y a pas de 13
  // les chambres où l'on entre (une vraie porte, des meubles) ; les autres : une porte close, on n'y entre pas
  const OUVERTES = new Set([103, 105, 108, 110, 112, 115, 118, 202, 204, 208, 209, 211, 214, 221]);
  const LITS = ['#7a2430', '#2a4a6a', '#5a6a3a', '#6a4a7a', '#8a6a3a', '#3a5a5a'];
  for (let e = 1; e <= 3; e++) {
    const ya = L18_ET[e], yh = L18_ET[e + 1] - (e < 3 ? 0.25 : 0), comb = e === 3;
    // le couloir (z -1,2..1,2)
    const portesAv = [], portesAr = [];
    // devant : une travée par chambre (aux combles : deux travées par chambre)
    const largeur = comb ? 2 : 1;
    for (let k = -7, i = 0; k <= 7; k += largeur, i++) {
      const a = k * 4 - 2, b = Math.min(30, (k + largeur) * 4 - 2), cx = (a + b) / 2;
      const num = comb ? null : numero(e, i);
      const dx = cx + (comb ? 0 : 0.9);
      portesAv.push([dx - 0.5, dx + 0.5, ya, ya + 2.2]);
      if (b < 30) murZ(b, ZI0, -1.2, ya, yh, 0.2, ENDUIT);
      const ch = { num, e, k, a, b, cote: 'av', porte: [dx, -1.2], y: ya, c: W3(cx, ya, -5), lit: W3(a + 1.0, ya, -6.2), entree: W3(dx, ya, 0), dedans: W3(dx, ya, -3), ouverte: comb || OUVERTES.has(num) };
      if (comb) ch.nom = ['la mansarde du concierge', 'la chambre des femmes de chambre', 'la chambre de Firmin', 'la chambre du chef', 'la mansarde du veilleur', 'la chambre de la gouvernante', 'la chambre du cocher', 'la lingerie des combles'][i] || 'une mansarde';
      V.chambres[comb ? 'm' + i : num] = ch;
    }
    if (!comb) {
      // derrière : de -30 à -6 (six chambres d'une travée), de 2 à 30 (sept)
      const der = [[-30, -26], [-26, -22], [-22, -18], [-18, -14], [-14, -10], [-10, -6], [2, 6], [6, 10], [10, 14], [14, 18], [18, 22], [22, 26], [26, 30]];
      der.forEach(([a, b], j) => {
        const num = numero(e, 15 + j), cx = (a + b) / 2, dx = cx;
        portesAr.push([dx - 0.5, dx + 0.5, ya, ya + 2.2]);
        if (b !== -6 && b !== 2 && b < 30) murZ(b, 1.2, ZI1, ya, yh, 0.2, ENDUIT);
        V.chambres[num] = { num, e, a, b, cote: 'ar', porte: [dx, 1.2], y: ya, c: W3(cx, ya, 5), lit: W3(cx - 1.0, ya, 7.0), entree: W3(dx, ya, 0), dedans: W3(dx, ya, 3), ouverte: OUVERTES.has(num) };
      });
    } else {
      // les combles : derrière, trois grandes pièces (la buanderie des combles, les malles, le grenier) ; on n'y entre pas
      void 0;
    }
    // les murs du couloir (percés des portes des chambres ouvertes ; les autres : une porte close, posée contre le mur)
    const ouvAv = [], ouvAr = [];
    for (const ch of Object.values(V.chambres)) {
      if (ch.e !== e) continue;
      const trou = [ch.porte[0] - 0.5, ch.porte[0] + 0.5, ya, ya + 2.2];
      if (ch.ouverte) (ch.cote === 'av' ? ouvAv : ouvAr).push(trou);
    }
    murX(-1.2, XI0, XI1, ya, yh, 0.2, PEINT, ouvAv);
    murX(1.2, XI0, SX0, ya, yh, 0.2, PEINT, ouvAr.filter((o) => o[1] <= SX0));
    murX(1.2, SX1, XI1, ya, yh, 0.2, PEINT, ouvAr.filter((o) => o[0] >= SX1));
    for (const ch of Object.values(V.chambres)) {
      if (ch.e !== e) continue;
      const [px, pz] = ch.porte, s2 = ch.cote === 'av' ? -1 : 1;
      const cle = ch.num ? 'ch' + ch.num : 'm' + ch.k;
      if (ch.ouverte) {
        ch.porteI = porte(cle, px, pz, ya, 'x', { sens: s2 });
      } else {
        const q = prop('l18_porte_close', px, ya, pz - s2 * 0.15, s2 < 0 ? Math.PI : 0, { num: ch.num, dnd: rnd() < 0.2 });
        ch.prop = w.props.length - 1; void q;
        inter('l18_chambre', 'l18_ch' + ch.num, px, ya + 1.3, pz - s2 * 0.3, 'Chambre ' + ch.num, { num: ch.num });
      }
    }
    // la porte condamnée, au bout du couloir (vers l'aile Nord), au 1er et au 2e
    if (!comb) porte('aile' + e, X1 - EP / 2, 0, ya, 'z', { verrou: true, sens: 1, w: 1.2 });
    // les appliques et les lustres du couloir
    for (let x = -26; x <= 26; x += 8) prop('l18_applique', x, ya + 2.3, -1.04, 0);
    // les nœuds : le couloir, du sud au nord, et le palier
    const ids = [];
    for (let k = -7; k <= 7; k++) { const id = 'c' + e + '_' + k; noeud(id, k * 4, ya, 0); ids.push(id); }
    chaine(...ids);
    // (le palier d'arrivée de la volée B est celui du départ de l'étage : on relie au couloir)
    noeud('pal' + e, SX0 + 1.4, ya, 0.4);
    lien('esc' + (e - 1) + 'Ar', 'pal' + e); lien('pal' + e, 'c' + e + '_-1'); lien('pal' + e, 'c' + e + '_-2');
    if (e < 3) lien('pal' + e, 'esc' + e + 'D');
  }
  // l'aménagement des chambres où l'on entre ; les nœuds (porte, dedans, lit)
  for (const k in V.chambres) {
    const ch = V.chambres[k], s2 = ch.cote === 'av' ? -1 : 1, ya = ch.y;
    const cid = 'c' + ch.e + '_' + Math.max(-7, Math.min(7, Math.round(ch.porte[0] / 4)));
    const pid = 'p_' + k, did = 'd_' + k;
    noeud(pid, ch.porte[0], ya, 0);
    lien(cid, pid);
    if (!ch.ouverte) continue;
    noeud(did, ch.porte[0], ya, s2 * 3.2);
    lien(pid, did, ch.num ? 'ch' + ch.num : 'm' + ch.k);
    ch.noeud = did;
    const a = ch.a, b = ch.b, zf = s2 < 0 ? ZI0 : ZI1;
    const lx = s2 < 0 ? a + 1.0 : b - 1.0;
    prop('lit', lx, ya, zf - s2 * 1.3, s2 < 0 ? 0 : Math.PI, { col: LITS[(ch.e * 7 + ch.k + 7) % LITS.length] });
    ch.lit = W3(lx, ya, zf - s2 * 1.3);
    prop('armoire', b - 0.35 * (s2 < 0 ? 1 : -1) * 0 - 0.4, ya, s2 * 2.3, -Math.PI / 2);
    prop('table', (a + b) / 2 + 0.6, ya, zf - s2 * 1.0, 0);
    prop('chaise', (a + b) / 2 + 0.6, ya, zf - s2 * 1.7, s2 < 0 ? 0 : Math.PI);
    prop('l18_applique', (a + b) / 2, ya + 2.3, (s2 < 0 ? -1.3 : 1.3) - s2 * 0.0, s2 < 0 ? Math.PI : 0);
    if (ch.e < 3) prop('tapis', (a + b) / 2, ya, zf - s2 * 3.6, 0, { col: '#6a3a2a' });
    place('ch_' + k, (a + b) / 2 + 0.6, ya, zf - s2 * 1.7, s2 < 0 ? 0 : Math.PI);
  }
  // les deux chambres des balcons : la porte-fenêtre ouvre sur le balcon d'honneur
  noeud('balcon1', 0, 4, -9.8); noeud('balcon2', 0, 8, -9.8);
  if (V.chambres[108] && V.chambres[108].noeud) lien(V.chambres[108].noeud, 'balcon1');
  if (V.chambres[208] && V.chambres[208].noeud) lien(V.chambres[208].noeud, 'balcon2');
  place('balcon1', 0.6, 4, -9.9, Math.PI); place('balcon2', -0.6, 8, -9.9, Math.PI);
  // la mansarde du concierge : un lit à vous, un coffre, une fenêtre
  {
    const ch = V.chambres.m0;
    V.mansarde = ch;
    if (ch) {
      inter('l18_lit', 'l18_lit_concierge', ch.a + 1.0, ch.y + 0.7, ZI0 + 1.3, 'Dormir dans la mansarde', {});
      inter('chest', 'l18_coffre_mansarde', ch.b - 1.2, ch.y + 0.6, ZI0 + 0.7, 'Le coffre de la mansarde', {});
      prop('coffre', ch.b - 1.2, ch.y, ZI0 + 0.6, Math.PI);
    }
  }

  // ------------------------------------------------------------- 6. la salle de bal (au sud)
  const BX0 = -50, BX1 = -30, BZ0 = -11, BZ1 = 11, BH = 8;
  bloc(BX0 - 0.3, BX1, -1.4, 0.15, BZ0 - 0.3, BZ1 + 0.3, PIERRE);
  bloc(BX0 + 0.5, BX1, 0, 0.15, BZ0 + 0.5, BZ1 - 0.5, PARQ);
  // au rez-de-chaussée, des murs enduits percés de trois hautes baies (une porte-fenêtre au milieu, deux vitrées) ; au-dessus, la façade
  murX(BZ0 + 0.25, BX0, BX1 - 0.5, 0, 4, 0.5, ENDUIT, [[-46.6, -45.4, 0.3, 3.4], [-40.6, -39.4, 0, 2.8], [-34.6, -33.4, 0.3, 3.4]]);
  murX(BZ1 - 0.25, BX0, BX1 - 0.5, 0, 4, 0.5, ENDUIT, [[-46.6, -45.4, 0.3, 3.4], [-34.6, -33.4, 0.3, 3.4]]);
  for (const c of [BZ0 + 0.25, BZ1 - 0.25]) {
    murX(c, BX0, BX1 - 0.5, 4, BH, 0.5, FAC);
    for (const x of [-46, -34]) bloc(x - 0.6, x + 0.6, 0.3, 3.4, c - 0.08, c + 0.08, M_GLASS);
  }
  murZ(BX0 + 0.25, BZ0 + 0.5, BZ1 - 0.5, 0, 4, 0.5, ENDUIT);
  murZ(BX0 + 0.25, BZ0 + 0.5, BZ1 - 0.5, 4, BH, 0.5, FAC);
  for (const [z0, z1] of [[BZ0, Z0], [Z1, BZ1]]) murZ(BX1 - 0.25, z0, z1, 0, BH, 0.5, ENDUIT);
  porte('bal_terrasse', -40, BZ0 + 0.25, 0, 'x', { sens: 1, w: 1.2, h: 2.8, m: M_GLASS });
  // le plafond à caissons, la corniche, le toit en pavillon
  bloc(BX0 + 0.5, BX1, BH - 0.3, BH, BZ0 + 0.5, BZ1 - 0.5, ENDUIT, { toit: true });
  bloc(BX0 - 0.4, BX1 + 0.2, BH, BH + 0.4, BZ0 - 0.4, BZ1 + 0.4, PIERRE, { toit: true });
  bloc(BX0 - 0.5, BX1 + 0.3, BH + 0.4, BH + 5.2, BZ0 - 0.5, BZ1 + 0.5, M_SLATE, { sh: 3, toit: true });
  // l'estrade de l'orchestre, le piano, les pupitres ; les miroirs ; trois lustres
  bloc(BX0 + 0.5, BX0 + 5, 0.15, 0.6, -6, 6, PARQ);
  for (let k = 0; k < 4; k++) bloc(BX0 + 5 + k * 0.01, BX0 + 5.4, 0.15, 0.6 - k * 0.11, -2 + k * 0.0, 2, PARQ);
  prop('l18_piano', BX0 + 2.6, 0.6, 3.4, Math.PI / 2);
  for (let k = 0; k < 5; k++) prop('l18_pupitre', BX0 + 3.4, 0.6, -4.5 + k * 1.6, Math.PI / 2);
  for (const z of [-7.5, -2.5, 2.5, 7.5]) prop('miroir', BX0 + 0.62, 0.15, z, Math.PI / 2, null, 1.4);
  for (const x of [-46, -40, -34]) prop('l18_grand_lustre', x, BH - 0.3, 0, 0, { g: 2 });
  for (const x of [-46, -40, -34]) for (const z of [BZ0 + 0.6, BZ1 - 0.6]) prop('l18_applique', x, 3.2, z, z < 0 ? 0 : Math.PI);
  for (const x of [-44, -36]) for (const z of [-8.8, 8.8]) prop('fauteuil', x, 0.15, z, z < 0 ? 0 : Math.PI);
  for (const [x, z] of [[-31.4, -9.6], [-31.4, 9.6]]) prop('l18_palmier', x, 0.15, z, 0);
  piece('bal', 'la salle de bal', BX0 + 0.5, BX1, 0.15, BZ0 + 0.5, BZ1 - 0.5, 0);
  place('bal_chef', BX0 + 4.4, 0.6, 0, Math.PI / 2); place('bal_piano', BX0 + 2.6, 0.6, 2.0, Math.PI / 2);
  for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; place('bal_danse' + k, -39 + Math.cos(a) * 4.5, 0.15, Math.sin(a) * 4.5, -a); }
  inter('l18_bal', 'l18_bal_estrade', BX0 + 5.6, 1.2, 0, 'L’estrade de l’orchestre', {});

  // ------------------------------------------------------------- 7. l'aile Nord (fermée depuis l'hiver 1871)
  const AX0 = 30, AX1 = 42, AZ0 = -7, AZ1 = 7, AEP = 0.5;
  bloc(AX0, AX1 + 0.3, -1.4, 0.15, AZ0 - 0.3, AZ1 + 0.3, PIERRE);
  bloc(AX0, AX1 - AEP, 0, 0.15, AZ0 + AEP, AZ1 - AEP, PARQ);
  for (let e = 0; e < 3; e++) {
    const ya = e === 0 ? 0.15 : 4 * e, yb = e === 0 ? 0 : 4 * e - 0.25, yh = 4 * (e + 1);
    // la façade ouest, le dos, le pignon nord (le sud est le mur du corps principal)
    bloc(AX0, AX1, yb, yh, AZ0, AZ0 + AEP, FAC);
    bloc(AX0, AX1, yb, yh, AZ1 - AEP, AZ1, FAC);
    murZ(AX1 - AEP / 2, AZ0 + AEP, AZ1 - AEP, yb, yh, AEP, FAC);
    // les fenêtres aveuglées : des planches clouées dehors
    for (const x of [32, 36, 40]) for (const z of [AZ0 - 0.05, AZ1 + 0.05]) bloc(x - 0.8, x + 0.8, ya + 0.7, ya + 3.3, z - 0.04, z + 0.04, PARQ);
    for (const z of [-4, 0, 4]) bloc(AX1 + 0.01, AX1 + 0.09, ya + 0.7, ya + 3.3, z - 0.8, z + 0.8, PARQ);
    if (e < 2) bloc(AX0, AX1 - AEP, 4 * (e + 1) - 0.25, 4 * (e + 1), AZ0 + AEP, AZ1 - AEP, PARQ);
  }
  bloc(AX0 - 0.2, AX1 + 0.4, 12, 12.4, AZ0 - 0.4, AZ1 + 0.4, PIERRE, { toit: true });
  bloc(AX0 - 0.2, AX1 + 0.6, 12.4, 16.8, AZ0 - 0.6, AZ1 + 0.6, M_SLATE, { sh: 3, toit: true });
  // dedans : le rez-de-chaussée (l'ancien salon de musique, sous ses draps) ; l'échelle (l'escalier s'est effondré)
  for (const [x, z, h, wd] of [[33, -4, 1.0, 1.6], [36, 3.5, 1.4, 1.2], [39.5, -3, 0.8, 2.0], [34, 4.5, 1.9, 0.9]]) prop('l18_drap', x, 0.15, z, rnd() * 0.6, { h, w: wd });
  prop('l18_piano', 39, 0.15, 2.5, -0.4, { sansBanc: true });
  bloc(37.5, 41.4, 0.15, 0.9, -6.4, -4.2, PARQ); // des marches effondrées, un tas de bois
  prop('echelle', 40.6, 0.15, -5.6, Math.PI / 2, { h: 4.0 });
  inter('l18_echelle', 'l18_aile_echelle_bas', 40.2, 1.2, -5.6, 'Monter à l’échelle', { to: W3(39.6, 4.05, -5.2) });
  inter('l18_echelle', 'l18_aile_echelle_haut', 39.8, 5.1, -5.4, 'Descendre l’échelle', { to: W3(39.4, 0.2, -4.6) });
  // le 1er de l'aile : un couloir (z -1,2..1,2), quatre anciennes chambres (9 à 12) et, au bout, la porte sans numéro
  murX(-1.2, AX0, AX1 - AEP, 4, 7.75, 0.2, PEINT, [[33.5, 34.5, 4, 6.2], [39.2, 40.2, 4, 6.2]]);
  murX(1.2, AX0, AX1 - AEP, 4, 7.75, 0.2, PEINT, [[33.5, 34.5, 4, 6.2], [37.5, 38.5, 4, 6.2]]);
  murZ(36, AZ0 + AEP, -1.2, 4, 7.75, 0.2, ENDUIT); murZ(36, 1.2, AZ1 - AEP, 4, 7.75, 0.2, ENDUIT);
  // la trouée du plancher au-dessus de l'échelle (on monte au grenier par une seconde échelle)
  prop('echelle', 31.0, 4, 5.8, -Math.PI / 2, { h: 4.0 });
  inter('l18_echelle', 'l18_grenier_bas', 31.4, 5.1, 5.6, 'Monter au grenier', { to: W3(32.2, 8.05, 5.0) });
  inter('l18_echelle', 'l18_grenier_haut', 32.0, 9.1, 5.2, 'Descendre l’échelle', { to: W3(31.8, 4.05, 4.6) });
  porte('aile_9', 34, -1.2, 4, 'x', { sens: -1 });
  porte('aile_10', 34, 1.2, 4, 'x', { sens: 1 });
  porte('treize', 38, 1.2, 4, 'x', { sens: 1, verrou: true });
  for (const [x, z, h, wd] of [[33, -4.5, 1.0, 2.0], [34.5, 5, 1.2, 1.0]]) prop('l18_drap', x, 4, z, 0.2, { h, w: wd });
  // la treize : un lit fait, une chaise tournée vers la fenêtre aveuglée, un plateau ; le registre de 1854
  prop('lit', 40.4, 4, 5.4, Math.PI, { col: '#3a3a44' });
  prop('chaise', 38.8, 4, 6.0, Math.PI * 0.85);
  prop('table', 37.6, 4, 5.8, 0);
  prop('bougie', 37.4, 4.79, 5.7, 0);
  prop('l18_plateau', 37.9, 4.79, 5.9, 0.3);
  inter('l18_treize', 'l18_treize', 38.8, 5.2, 5.2, 'La treize', {});
  piece('aile', 'l’aile Nord', AX0, AX1 - AEP, 0.15, AZ0 + AEP, AZ1 - AEP, 0);
  piece('treize', 'la treize', 36, AX1 - AEP, 4, 1.2, AZ1 - AEP, 1);
  place('treize', 39.0, 4, 5.6, Math.PI * 0.85);
  place('aile_rdc', 35, 0.15, 0, 0);
  // le grenier de l'aile (2e) : les malles des voyageurs qui ne sont pas redescendus
  for (const [x, z] of [[33, -4], [35, -4.5], [38, -3.8], [40, -4.6], [39, 3.6]]) prop('malle', x, 8, z, rnd() * TAU);
  inter('l18_malles', 'l18_grenier_malles', 37, 8.8, -4, 'Les malles du grenier', {});
  // les nœuds : le couloir de service jusqu'à la porte de l'aile ; le couloir du 1er de l'aile
  noeud('aile_rdc', 33, 0.15, 6); noeud('aile_1', 33, 4, 0); noeud('aile_porte1', 30.6, 4, 0); noeud('treize_porte', 38, 4, 0); noeud('treize', 38.5, 4, 4.8);
  chaine('aile_porte1', 'aile_1', 'treize_porte');
  lien('treize_porte', 'treize', 'treize');
  lien('c1_7', 'aile_porte1', 'aile1');

  // ------------------------------------------------------------- 8. les caves (sous la cuisine)
  {
    // (la carte des abris ne garde qu'un plafond par case d'un mètre : les caves ne sont pas SOUS l'hôtel, mais 170 m
    // plus loin, dans la montagne, à vingt mètres sous le niveau du hall ; on y descend par l'escalier de la cuisine)
    const [cx, cz] = toW(-4, 165);
    const yc = Y - 22;
    const g = { x: cx, y: yc, z: cz, r: f.r };
    const cb = (x0, x1, y0b, y1b, z0b, z1b, m, o) => { const [x, z] = B.toWorld(g, (x0 + x1) / 2, (z0b + z1b) / 2); const b = { x, y: yc + y0b, z, sx: x1 - x0, sy: y1b - y0b, sz: z1b - z0b, r: g.r, m, sh: 0, under: true, l18: 1 }; if (o && o.ceil) b.ceil = true; w.blocks.push(b); return b; };
    const CW = 30, CD = 12, CH = 3.2;
    cb(-CW / 2 - 0.5, CW / 2 + 0.5, -0.6, 0, -CD / 2 - 0.5, CD / 2 + 0.5, M_COBBLE);
    cb(-CW / 2 - 0.5, CW / 2 + 0.5, CH, CH + 0.8, -CD / 2 - 0.5, CD / 2 + 0.5, PIERRE, { ceil: true });
    for (const s2 of [-1, 1]) { cb(-CW / 2 - 0.5, CW / 2 + 0.5, 0, CH, s2 * CD / 2 - 0.25, s2 * CD / 2 + 0.25, PIERRE); cb(s2 * CW / 2 - 0.25, s2 * CW / 2 + 0.25, 0, CH, -CD / 2, CD / 2, PIERRE); }
    // les cloisons : la cave à vin (x -15..-5), la réserve (-5..5), la buanderie et la chaufferie (5..15) ; un couloir au milieu (z -1,4..1,4)
    for (const x of [-5, 5]) { cb(x - 0.25, x + 0.25, 0, CH, -CD / 2, -1.4, PIERRE); cb(x - 0.25, x + 0.25, 0, CH, 1.4, CD / 2, PIERRE); }
    for (const [x0, x1] of [[-15, -5], [-5, 5], [5, 15]]) for (const s2 of [-1, 1]) {
      const zz = s2 * 1.4;
      // des murs le long du couloir, percés d'une baie de 1,4 m au milieu
      const m = (x0 + x1) / 2;
      cb(x0, m - 0.7, 0, CH, zz - 0.2, zz + 0.2, PIERRE); cb(m + 0.7, x1, 0, CH, zz - 0.2, zz + 0.2, PIERRE); cb(m - 0.7, m + 0.7, 2.2, CH, zz - 0.2, zz + 0.2, PIERRE);
    }
    const cp = (id, x, y, z, rr, data) => { const [px, pz] = B.toWorld(g, x, z); return B.prop(id, px, yc + y, pz, g.r + (rr || 0), data); };
    for (let k = 0; k < 4; k++) { cp('l18_casier_vin', -13 + k * 2.4, 0, -5.6, 0); cp('l18_casier_vin', -13 + k * 2.4, 0, 5.6, Math.PI); }
    cp('tonneau', -7, 0, -3, 0); cp('tonneau', -7.6, 0, -2.4, 0); cp('tonneau', -7, 0, 3, 0);
    for (let k = 0; k < 3; k++) { cp('etagere', -3 + k * 2.6, 0, -5.7, 0, { kind: k ? 'bocaux' : 'pain' }); cp('caisse', -3 + k * 2.6, 0, 4.8, 0); }
    cp('sacs', 3.4, 0, 3.2, 0); cp('jambons', 0, 2.4, 5.8, Math.PI);
    cp('l18_chaudiere', 12, 0, -4.2, 0); cp('charrette', 8, 0, -4.4, 0.4);
    cp('corde_linge', 9.5, 0, 3.6, 0); cp('tonneau_pluie', 6.6, 0, 5.2, 0); cp('etabli', 12.5, 0, 4.8, Math.PI);
    for (const x of [-12, -2, 8]) cp('lanterne_suspendue', x, 0, 0, 0);
    cp('echelle', -14.4, 0, 0, Math.PI / 2, { h: CH });
    const [ex, ez] = B.toWorld(g, -13.6, 0);
    V.caves = { x: g.x, y: yc, z: g.z, r: g.r, pied: [ex, yc + 0.05, ez] };
    V.inters.l18_cave_haut.data.to = [ex, yc + 0.05, ez];
    const [hx, hz] = toW(-8.2, 4.0);
    const bas = B.inter('l18_escalier', 'l18_cave_bas', ex - 0.0, yc + 1.0, ez, 'Remonter aux cuisines', { to: [hx, Y + 0.2, hz] });
    V.inters.l18_cave_bas = bas;
    const lieuC = (k2, x, z) => { const [px, pz] = B.toWorld(g, x, z); return [px, yc + 0.05, pz]; };
    V.cave = { vin: lieuC('vin', -10, -3.2), reserve: lieuC('reserve', 0, -3.6), buanderie: lieuC('buanderie', 10, 3.4), chaufferie: lieuC('chaufferie', 10, -3.2), couloir: lieuC('couloir', 0, 0) };
    // les trois choses qu'on vient chercher à la cave (une interaction par réserve)
    const ci = (id, x, z, nom, data) => { const [px, pz] = B.toWorld(g, x, z); V.inters[id] = B.inter('l18_reserve', id, px, yc + 1.0, pz, nom, data); };
    ci('l18_res_vin', -10, -4.8, 'La cave à vin', { quoi: 'vin' });
    ci('l18_res_epicerie', 0, -4.8, 'La réserve', { quoi: 'epicerie' });
    ci('l18_res_linge', 10, 4.4, 'La buanderie', { quoi: 'linge' });
    ci('l18_res_chaufferie', 12, -2.6, 'La chaudière', { quoi: 'chaudiere' });
    B.landmark('l18_caves', g.x, g.z, 14, { under: true });
  }

  // ------------------------------------------------------------- 9. la cour, la terrasse, le potager, la remise
  prop('fontaine_jardin', 0, 0, -17, 0, null, 1.6);
  for (const x of [-12, 12]) prop('lampadaire', x, 0, -12.5, 0);
  for (const x of [-24, -8, 8, 24]) prop('lampadaire', x, 0, -24.5, 0);
  for (const x of [-20, -14, 14, 20]) prop('parterre', x, 0, -16, 0);
  // la balustrade de la terrasse, au bord du vide (une ouverture vers le chemin, à x 40 ; la gare au sud)
  const yb0 = -0.6;
  for (const [a, b2] of [[-46, 37.5], [42.5, 50]]) {
    bloc(a, b2, yb0, 0.85, -41.2, -40.8, PIERRE);
    bloc(a, b2, 0.85, 1.0, -41.3, -40.7, PIERRE);
    for (let x = a + 1; x < b2 - 0.5; x += 2) bloc(x - 0.25, x + 0.25, yb0, 1.05, -41.3, -40.7, PIERRE);
  }
  for (const x of [-46, 50]) { bloc(x - 0.2, x + 0.2, yb0, 1.0, -41, -24, PIERRE); }
  for (let x = -40; x <= 44; x += 12) { prop('l18_table', x, 0, -33, 0, {}); prop('chaise', x - 0.9, 0, -33, Math.PI / 2); prop('chaise', x + 0.9, 0, -33, -Math.PI / 2); prop('parasol', x, 0, -33, 0); }
  for (const x of [-34, -18, 18, 34]) prop('banc', x, 0, -39.4, Math.PI);
  for (const x of [-28, -6, 6, 28]) prop('pot_fleurs', x, 0, -39.6, 0, null, 1.3);
  prop('l18_longue_vue', 0, 0, -39.2, Math.PI);
  inter('l18_longue_vue', 'l18_longue_vue', 0, 1.3, -38.8, 'La longue-vue', {});
  place('terrasse', 0, 0, -37.5, Math.PI); place('terrasse_g', -20, 0, -36, Math.PI); place('terrasse_d', 20, 0, -36, Math.PI);
  place('longue_vue', 0, 0, -38.2, Math.PI);
  for (let x = -40, k = 0; x <= 44; x += 12, k++) place('terrasse_t' + k, x - 0.9, 0, -33, Math.PI / 2);
  piece('terrasse', 'la terrasse', -46, 50, 0, -41, -24, 0);
  // le potager (derrière), la remise (au nord, après l'aile)
  for (let x = -24; x <= 24; x += 2) prop('haie', x, 0, 22.4, 0);
  for (let k = -3; k <= 3; k++) prop('jardiniere', k * 7, 0, 16, 0);
  bloc(44, 52, -0.6, 0.15, -6, 6, PIERRE);
  // (trois murs de brique ; elle s'ouvre sur la cour, à l'ouest)
  murZ(44.25, -6, 6, 0, 4.2, 0.5, M_BRICK);
  murZ(51.75, -6, 6, 0, 4.2, 0.5, M_BRICK);
  murX(5.75, 44.5, 51.5, 0, 4.2, 0.5, M_BRICK);
  bloc(43.6, 52.4, 4.2, 6.6, -6.4, 6.4, M_ROOF, { sh: 1, toit: true });
  prop('l18_voiture', 48, 0.15, 0.6, Math.PI);
  prop('sellerie', 50.9, 0.15, 3.6, -Math.PI / 2);
  prop('botte_foin', 50.6, 0.15, -4.2, 0);
  inter('l18_voiture', 'l18_voiture_hotel', 48, 1.3, -2.6, 'La voiture de l’hôtel', { sens: 'descendre' });
  place('cocher', 46, 0.15, -4.4, Math.PI);
  piece('remise', 'la remise', 44, 51.5, 0.15, -5.5, 5.5, 0);

  // ------------------------------------------------------------- 10. le funiculaire, son chemin, sa route
  {
    const [hx, hz] = toW(-50, -38.5);
    const A = { x: hx, z: hz, y: Y };
    const Bb = { x: L18_FUNI_BAS.x, z: L18_FUNI_BAS.z, y: w.heightAt(L18_FUNI_BAS.x, L18_FUNI_BAS.z) + 0.6 };
    const dx = Bb.x - A.x, dz = Bb.z - A.z, L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L;
    const cap = Math.atan2(-ux, -uz); // le haut de la voie (+z local d'un tronçon) regarde vers la gare d'en haut
    const yAt = (t) => lerp(A.y, Bb.y, t);
    const pente = Math.atan2(A.y - Bb.y, L);
    // la tranchée : le relief s'abaisse sous la voie (et ses talus) ; jamais relevé
    B.forVerts((A.x + Bb.x) / 2, (A.z + Bb.z) / 2, L / 2 + 14, terrasser((x, z, y0) => {
      const t = clamp(((x - A.x) * ux + (z - A.z) * uz) / L, 0, 1), px = A.x + ux * L * t, pz = A.z + uz * L * t, d = Math.hypot(x - px, z - pz);
      if (t <= 0.02 || t >= 0.99) return null;
      const yl = yAt(t) - 0.4, lim = yl + Math.max(0, d - 2.6) * 1.1;
      return y0 > lim ? lim : null;
    }));
    // la voie : des tronçons de 6 m (un plan incliné de pierre, les rails dessus), des piles là où le sol est plus bas
    const nT = Math.ceil(L / 6), seg = L / nT;
    for (let i = 0; i < nT; i++) {
      const t0 = i / nT, t1 = (i + 1) / nT, tm = (t0 + t1) / 2;
      const g = { x: A.x + ux * L * tm, z: A.z + uz * L * tm, y: yAt(t1), r: cap };
      const haut = yAt(t0) - yAt(t1);
      B.block(g, 0, 0, 0, 3.6, haut + 0.02, seg + 0.04, PIERRE, 0, 2);
      w.blocks[w.blocks.length - 1].l18 = 1;
      B.block(g, -0.5, 0.12, 0, 1.6, haut + 0.02, seg + 0.04, M_RAILS, 0, 2);
      w.blocks[w.blocks.length - 1].l18 = 1;
      const sol = Math.min(w.heightAt(g.x, g.z), w.heightAt(g.x + ux * seg / 2, g.z + uz * seg / 2), w.heightAt(g.x - ux * seg / 2, g.z - uz * seg / 2));
      if (g.y - sol > 0.4) { B.block({ x: g.x, y: sol - 1.2, z: g.z, r: cap }, 0, 0, 0, 3.4, g.y - sol + 1.2, seg + 0.04, PIERRE); w.blocks[w.blocks.length - 1].l18 = 1; }
      if (g.y - sol > 1.5 && i % 2 === 0) { B.block({ x: g.x, y: sol - 1.2, z: g.z, r: cap }, 0, 0, 0, 4.4, g.y - sol + 0.6, 1.2, PIERRE); w.blocks[w.blocks.length - 1].l18 = 1; }
    }
    // les deux gares : un auvent de fer et de verre sur quatre colonnes, un quai, un banc, un lampadaire
    const gare = (P, sens, nom) => {
      const g = { x: P.x, y: P.y, z: P.z, r: cap + (sens < 0 ? Math.PI : 0) };
      B.block(g, 2.8, -0.8, 0, 2.2, 0.95, 8, PIERRE);
      for (const lx of [-2.2, 4.0]) for (const lz of [-3.6, 3.6]) B.block(g, lx, 0, lz, 0.2, 3.4, 0.2, M_METAL);
      B.block(g, 0.9, 3.4, 0, 7.4, 1.4, 8.6, M_ROOF, 0, 1);
      for (let k = w.blocks.length - 6; k < w.blocks.length; k++) w.blocks[k].l18 = 1;
      const [bx, bz] = B.toWorld(g, 3.4, 1.5), [lx2, lz2] = B.toWorld(g, 3.6, -3.0), [ix, iz] = B.toWorld(g, 1.7, 0);
      B.prop('banc', bx, P.y + 0.15, bz, g.r - Math.PI / 2);
      B.prop('lampadaire', lx2, P.y + 0.15, lz2, 0);
      const it = B.inter('l18_funi', 'l18_funi_' + nom, ix, P.y + 1.3, iz, nom === 'haut' ? 'Le funiculaire (descendre)' : 'Le funiculaire (monter)', { gare: nom });
      V.inters['l18_funi_' + nom] = it;
      const [qx, qz] = B.toWorld(g, 2.6, 0);
      return { x: qx, y: P.y + 0.15, z: qz, cap: g.r };
    };
    const quaiH = gare({ x: A.x - ux * 1.5, z: A.z - uz * 1.5, y: A.y }, 1, 'haut');
    const quaiB = gare({ x: Bb.x + ux * 3.5, z: Bb.z + uz * 3.5, y: Bb.y }, -1, 'bas');
    // la cabine (un objet posé qui bouge) : au repos en haut
    const cab = B.prop('l18_cabine', A.x + ux * 4, A.y + 0.2, A.z + uz * 4, cap, { a: pente, t: 0.02 });
    V.funi = { A: [A.x, A.y, A.z], B: [Bb.x, Bb.y, Bb.z], L, ux, uz, cap, pente, cabine: w.props.length - 1, quaiH, quaiB };
    void cab;
    B.paintLine(A.x, A.z, Bb.x, Bb.z, 2.2, M_DIRT);
    B.landmark('l18_funi_haut', A.x, A.z, 10, {});
    B.landmark('l18_funi_bas', Bb.x + ux * 3, Bb.z + uz * 3, 12, {});
    // un poteau indicateur à la gare d'en bas
    const [px, pz] = [Bb.x + ux * 9 - uz * 4, Bb.z + uz * 9 + ux * 4];
    B.prop('l18_poteau', px, w.heightAt(px, pz), pz, cap + 0.5);
    V.inters.l18_poteau_bas = B.inter('l18_poteau', 'l18_poteau_bas', px, w.heightAt(px, pz) + 1.8, pz, 'Le poteau indicateur', { ou: 'bas' });
    // le chemin muletier, en lacets, de la gare d'en bas à l'ouverture de la balustrade (x 40)
    const [ox, oz] = toW(40, -42);
    const lac = [];
    const n2 = 7;
    for (let k = 0; k <= n2; k++) {
      const t = k / n2, x = lerp(Bb.x + 10, ox, t), z = lerp(Bb.z - 6, oz, t), side = k % 2 ? 1 : -1;
      lac.push([x + (k && k < n2 ? -uz * side * 22 : 0), z + (k && k < n2 ? ux * side * 22 : 0)]);
    }
    for (let k = 1; k < lac.length; k++) B.paintLine(lac[k - 1][0], lac[k - 1][1], lac[k][0], lac[k][1], 1.0, M_DIRT);
    // (une banquette : le relief est mis à plat en travers du chemin)
    for (let k = 1; k < lac.length; k++) {
      const [ax, az] = lac[k - 1], [bx2, bz2] = lac[k], LL = Math.hypot(bx2 - ax, bz2 - az) || 1;
      B.forVerts((ax + bx2) / 2, (az + bz2) / 2, LL / 2 + 4, terrasser((x, z, y0) => {
        const t = clamp(((x - ax) * (bx2 - ax) + (z - az) * (bz2 - az)) / (LL * LL), 0, 1), cxx = ax + (bx2 - ax) * t, czz = az + (bz2 - az) * t, d = Math.hypot(x - cxx, z - czz);
        if (d > 3.2) return null;
        const yc2 = w.heightAt(cxx, czz);
        return lerp(yc2, y0, smoothstep(1.4, 3.2, d));
      }));
    }
    V.chemin = lac;
    // la route : de celle du château jusqu'à la gare d'en bas
    const R = L18_ROUTE;
    for (let k = 1; k < R.length; k++) B.paintLine(R[k - 1][0], R[k - 1][1], R[k][0], R[k][1], 1.6, M_DIRT);
    const [rx, rz] = [R[0][0] + 8, R[0][1] - 5];
    B.prop('l18_poteau', rx, w.heightAt(rx, rz), rz, 1.2);
    V.inters.l18_poteau_chateau = B.inter('l18_poteau', 'l18_poteau_chateau', rx, w.heightAt(rx, rz) + 1.8, rz, 'Le poteau indicateur', { ou: 'chateau' });
    V.corridors = [{ pts: [[A.x, A.z], [Bb.x, Bb.z]], r: 5 }, { pts: lac, r: 3.5 }, { pts: R, r: 3.5 }];
  }

  // ------------------------------------------------------------- 11. l'arrêt de la voiture, à la fourche au nord de Valbrume
  {
    const P = L18_ARRET, y = w.heightAt(P.x, P.z);
    B.prop('l18_poteau', P.x, y, P.z, 0.4);
    B.prop('banc', P.x + 2.2, w.heightAt(P.x + 2.2, P.z + 0.6), P.z + 0.6, -Math.PI / 2);
    B.prop('lanterne_suspendue', P.x - 0.8, y, P.z - 0.4, 0);
    V.inters.l18_arret = B.inter('l18_voiture', 'l18_voiture_arret', P.x + 0.6, y + 1.3, P.z, 'L’arrêt de la voiture des Cimes', { sens: 'monter' });
    B.landmark('l18_arret', P.x, P.z, 6, {});
    V.arret = { x: P.x, y, z: P.z };
    V.corridors.push({ pts: [[P.x - 3, P.z], [P.x + 3, P.z]], r: 3 });
  }

  // ------------------------------------------------------------- 12. les nœuds de marche du rez-de-chaussée et du dehors
  noeud('dehors', 0, 0, -13); noeud('entree', 0, 0.15, -8); noeud('hall', 0, 0.15, -4); noeud('loge_client', -2.6, 0.15, -6.6);
  noeud('hall_esc', SX0 + 1.4, 0.15, -0.2); noeud('bureau_porte', 4, 0.15, 0.4); noeud('bureau', 4, 0.15, 6.4);
  noeud('resto_arche', -6, 0.15, -2.7); noeud('resto', -18, 0.15, -3); noeud('resto_s', -27, 0.15, -3); noeud('cuisine_porte', -10, 0.15, 1.4); noeud('cuisine', -10, 0.15, 4.4); noeud('cuisine_f', -20, 0.15, 4.2);
  noeud('bal_arche', -30, 0.15, -4); noeud('bal', -40, 0.15, -3); noeud('bal_estrade', -44.6, 0.6, 0);
  noeud('salon_arche', 6, 0.15, -2.7); noeud('salon', 16, 0.15, -3); noeud('salon_f', 25, 0.15, -2); noeud('service_porte', 8, 0.15, 2.6); noeud('service', 10, 0.15, 4.6); noeud('veilleur', 26, 0.15, 4.6); noeud('aile_porte', 29, 0.15, 6);
  noeud('resto_dehors', -16, 0, -10.4); noeud('salon_dehors', 16, 0, -10.4); noeud('bal_dehors', -40, 0, -12.4); noeud('bal_porte', -40, 0.15, -9.6);
  noeud('fontaine', 0, 0, -20); noeud('terrasse', 0, 0, -36); noeud('terrasse_g', -20, 0, -34); noeud('terrasse_d', 20, 0, -34); noeud('terrasse_gg', -40, 0, -34); noeud('terrasse_dd', 38, 0, -34);
  noeud('funi_haut', -48, 0, -36); noeud('chemin_haut', 40, 0, -40.4); noeud('remise', 46, 0, -8); noeud('remise_d', 46, 0.15, -4.4); noeud('cour_n', 30, 0, -14); noeud('cour_s', -30, 0, -14);
  noeud('cuisine_dos', -20, 0.15, 7.4); noeud('potager', -20, 0, 12); noeud('potager_c', 0, 0, 13);
  chaine('dehors', 'entree', 'hall'); lien('hall', 'loge_client'); lien('hall', 'hall_esc'); lien('hall_esc', 'esc0D'); lien('hall', 'bureau_porte'); lien('bureau_porte', 'bureau', 'bureau');
  chaine('hall', 'resto_arche', 'resto', 'resto_s', 'bal_arche', 'bal', 'bal_estrade'); lien('resto', 'cuisine_porte'); lien('cuisine_porte', 'cuisine', 'cuisine'); lien('cuisine', 'cuisine_f'); lien('cuisine_f', 'cuisine_dos'); lien('cuisine_dos', 'potager', 'cuisine_dos'); lien('potager', 'potager_c');
  chaine('hall', 'salon_arche', 'salon', 'salon_f'); lien('salon', 'service_porte'); lien('service_porte', 'service', 'service'); chaine('service', 'veilleur', 'aile_porte'); lien('aile_porte', 'aile_rdc', 'aile');
  lien('resto', 'resto_dehors', 'resto_terrasse'); lien('salon', 'salon_dehors', 'salon_terrasse'); lien('bal', 'bal_porte'); lien('bal_porte', 'bal_dehors', 'bal_terrasse');
  chaine('dehors', 'fontaine', 'terrasse'); chaine('terrasse_gg', 'terrasse_g', 'terrasse', 'terrasse_d', 'terrasse_dd'); lien('terrasse_gg', 'funi_haut'); lien('terrasse_dd', 'chemin_haut');
  lien('resto_dehors', 'cour_s'); lien('cour_s', 'dehors'); lien('cour_s', 'bal_dehors'); lien('bal_dehors', 'terrasse_gg'); lien('salon_dehors', 'cour_n'); lien('cour_n', 'dehors'); lien('cour_n', 'remise'); lien('remise', 'remise_d'); lien('cour_n', 'terrasse_dd');
  lien('resto_dehors', 'dehors'); lien('salon_dehors', 'dehors');
  // les places des gens, au rez-de-chaussée et dehors, aux nœuds les plus proches (gens : 11-zzzzzzzL18-2-gens.js)
  for (const k in V.places) { const P = V.places[k]; let best = -1, bd = 1e9; for (let i = 0; i < N.n.length; i++) { const q = N.n[i].p; if (Math.abs(q[1] - P.p[1]) > 1.2) continue; const d = Math.hypot(q[0] - P.p[0], q[2] - P.p[2]); if (d < bd) { bd = d; best = i; } } P.n = best; P.dn = +bd.toFixed(1); }

  // ------------------------------------------------------------- 13. les arbres du chantier s'en vont ; les lieux ; le reste
  const c = w.cell;
  const dansCorr = (x, z) => { for (const C of V.corridors) for (let i = 1; i < C.pts.length; i++) if (segDist(x, z, C.pts[i - 1][0], C.pts[i - 1][1], C.pts[i][0], C.pts[i][1]) < C.r) return true; return false; };
  let partis = 0;
  for (const ob of w.objects) {
    if (ob.gone || OBJ_TYPES[ob.t].animal) continue;
    if (Math.abs(ob.x - f.x) > 420 && !dansCorr(ob.x, ob.z)) continue;
    const [lx, lz] = B.toLocal(f, ob.x, ob.z);
    const dh = change.get(Math.round(ob.z / c) * w.W + Math.round(ob.x / c)) || 0;
    if ((lx > PL.x0 - 3 && lx < PL.x1 + 3 && lz > PL.z0 - 3 && lz < PL.z1 + 3) || dh > 0.8 || dansCorr(ob.x, ob.z)) { ob.gone = true; partis++; }
  }
  V.partis = partis;
  B.landmark('l18_hotel', f.x, f.z, 60, {});
  { const [x, z] = toW(0, -33); B.landmark('l18_terrasse', x, z, 22, {}); }
  { const [x, z] = toW(-40, 0); B.landmark('l18_bal', x, z, 11, {}); }
  { const [x, z] = toW(36, 0); B.landmark('l18_aile', x, z, 8, {}); }
  (w.noBuild || (w.noBuild = [])).push({ x: f.x, z: f.z, r: 95, why: 'le Grand Hôtel des Cimes' }, { x: V.funi.B[0], z: V.funi.B[2], r: 18, why: 'la gare basse du funiculaire' }, { x: L18_ARRET.x, z: L18_ARRET.z, r: 6, why: 'l’arrêt de la voiture des Cimes' });
  B.pois = []; // (les lieux nommés de la carte : w.lm suffit)
  w.shadeDirty = true; w.grid = null; w.blocksDirty = true; w.objectsDirty = true;
  V.ms = Date.now() - T0;
  V.ajoute = { p: w.props.length - avant.p, i: w.inter.length - avant.i, b: w.blocks.length - avant.b, d: w.doors.length - avant.d };
  return V;
}
{
  const _gv = generateValley;
  generateValley = async function (seed, progress, gen) {
    const w = await _gv(seed, progress, gen);
    if (w && w.designed) { try { l18Generer(w, w.seed !== undefined ? w.seed : seed); } catch (e) { console.error('L18 : le Grand Hôtel', e); } }
    return w;
  };
}
