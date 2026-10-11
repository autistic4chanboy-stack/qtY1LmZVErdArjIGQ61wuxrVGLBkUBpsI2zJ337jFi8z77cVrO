// ============================================================================
//  LES DETTES DE LA FERME (agent D18) — 3. LES TRAVAUX
//  Chaque terme acquitté, la ferme change : le plan D18_PLAN dit ce qui
//  s'ajoute, terme par terme, et où (en mètres, dans le repère de la ferme :
//  la maison au centre, la porte vers -z, le champ à l'est). Chaque élément a
//  sa place, et une ou deux places de rechange : il ne se pose que là où rien
//  ne gêne (bâtiments, chantiers du joueur, objets posés, arbres, cultures,
//  champ, chemins des habitants, interactions). Ce que le joueur a posé sur la
//  place d'un bâtiment est déplacé de quelques pas (une lettre le dit) ; sinon
//  l'élément attend, et on réessaie chaque matin.
//  Les places choisies sont gardées (farm.s.dettes18.places) : au chargement,
//  la vallée régénérée retrouve tout au même endroit (après les chantiers,
//  comme eux : 11-zzbuild.js). Rien n'est touché hors de la ferme : les blocs
//  de la maison changent de matériau ou montent d'un étage, le reste s'ajoute
//  au bout des listes (w.blocks, w.props, w.inter, w.doors).
//  Types d'éléments : mat (matériaux de la maison), etage, dep (les toits des
//  chantiers), bat (des blocs : perron, ailes, serre, écurie, piliers), prop
//  (un objet, avec ses places de rechange), dedans (un meuble de la maison),
//  pave (une suite de carreaux ou de murets, chacun posé s'il a la place),
//  arbres (un verger : des pommiers adultes dans les cultures).
// ============================================================================
const D18_RAYON = 40; // la ferme : ce qui est ajouté reste à moins de 40 m de son centre
const D18_PLAT = new Set(['allee', 'dalle', 'plancher', 'tapis', 'parterre', 'potager', 'arche_fleurie', 'fouille', 'b1_plaque', 'tableau', 'lettre']);

// ---------------------------------------------------------------- les constructions
const D18_BATIR = {
  // le perron : une dalle de pierre au pied de la porte, un auvent d'ardoise sur deux consoles (rien ne gêne le passage)
  perron(B, f) {
    B.block(f, 0, -0.35, 0, 2.8, 0.5, 1.6, M_STONE);
    for (const x of [-1.25, 1.25]) B.block(f, x, 2.05, 0.6, 0.14, 0.45, 0.14, M_LOGS); // les consoles de l'auvent
    B.block(f, 0, 2.5, 0.05, 3.0, 0.18, 1.9, M_SLATE);
  },
  // une aile de pierre, sa porte, ses meubles
  aile(B, f, k) {
    const res = B.house(f, 5, 5, { wall: M_STONE, win: M_STONEWIN, roof: M_SLATE, roofH: 2.2, chimney: k === 'salon' });
    B.door(f, res, 'ferme', {});
    B.propRel(f, 'tapis', 0, 0.16, 0.2, 0);
    if (k === 'chambre') {
      B.propRel(f, 'lit', -1.55, 0.15, 1.15, Math.PI, { col: '#8a5a6a' });
      B.interRel(f, 'bed', 'lit_aile_d18', -1.55, 0.8, 1.15, 'Dormir');
      const c = B.propRel(f, 'coffre', 1.4, 0.15, 1.85, Math.PI);
      c.d18coffre = 'coffre_d18_b';
      B.propRel(f, 'gueridon', 0.15, 0.15, 1.85, 0);
    } else {
      B.propRel(f, 'cheminee', 0, 0.15, 1.85, Math.PI, { lit: true });
      B.propRel(f, 'fauteuil', -1.2, 0.15, 0.5, Math.PI * 0.9);
      B.propRel(f, 'fauteuil', 1.2, 0.15, 0.5, -Math.PI * 0.9);
      B.propRel(f, 'horloge_comtoise', -1.95, 0.15, -1.5, Math.PI / 2);
      B.propRel(f, 'chandelier', 1.95, 0.15, -1.6, 0);
    }
  },
  // la serre : un soubassement de pierre, des parois et un toit de verre, des carrés de culture
  serre(B, f) {
    B.block(f, 0, -0.3, 0, 7, 0.55, 4.5, M_STONE);
    B.block(f, 0, 0.25, 2.15, 7, 2.0, 0.1, M_GLASS);
    for (const s of [-1, 1]) {
      B.block(f, s * 3.45, 0.25, 0, 0.1, 2.0, 4.2, M_GLASS);
      B.block(f, s * 2.05, 0.25, -2.2, 2.9, 2.0, 0.1, M_GLASS);
      for (const z of [-2.2, 2.15]) B.block(f, s * 3.45, 0.25, z, 0.14, 2.0, 0.14, M_LOGS);
    }
    B.block(f, 0, 1.95, -2.2, 1.2, 0.3, 0.1, M_GLASS);
    B.block(f, 0, 2.25, 0, 7.3, 1.3, 4.8, M_GLASS, 0, 1);
    B.propRel(f, 'potager', -1.8, 0.25, 1.1, 0);
    B.propRel(f, 'potager', 1.8, 0.25, 1.1, 0);
    B.propRel(f, 'jardiniere', -2.6, 0.25, -1.3, Math.PI / 2);
  },
  // l'écurie : ouverte devant, comme l'atelier ; foin, abreuvoir, et un poteau pour attacher les chevaux
  ecurie(B, f) {
    B.block(f, 0, -0.3, 0, 6.2, 0.45, 4.2, M_STONE);
    B.block(f, 0, 0, 1.95, 6.0, 2.6, 0.25, M_PLANKS);
    for (const s of [-1, 1]) { B.block(f, s * 2.95, 0, 0, 0.25, 2.6, 3.9, M_PLANKS); B.block(f, s * 2.9, 0, -1.9, 0.22, 2.6, 0.22, M_LOGS); }
    B.block(f, 0, 2.6, 0.1, 6.8, 0.28, 4.8, M_SLATE, 0, 2);
    B.propRel(f, 'botte_foin', 2.0, 0.15, 1.2, 0.3);
    B.propRel(f, 'botte_foin', 2.1, 0.75, 1.1, 0.1);
    B.propRel(f, 'abreuvoir', -1.0, 0.15, 1.45, 0);
    B.propRel(f, 'lanterne_suspendue', -2.5, 0.15, -1.6, 0);
    B.propRel(f, 'poteau_attache', 0, 0, -2.75, 0);
  },
  // les piliers du portail, et leurs lanternes
  piliers(B, f) {
    for (const x of [-2.3, 2.3]) {
      B.block(f, x, -0.2, 0, 0.8, 2.4, 0.8, M_STONE);
      B.block(f, x, 2.2, 0, 1.0, 0.2, 1.0, M_STONE);
      B.propRel(f, 'lanterne_sol', x, 2.4, 0, 0);
    }
  },
};

// ---------------------------------------------------------------- le plan, terme par terme
// at : [[lx, lz, rotation], …] (la première place, puis celles de rechange) ; parts (bat) : les rectangles solides,
// [cx, cz, demi-largeur, demi-profondeur, pas] dans le repère de l'élément (pas : on y marche, les chemins y passent) ;
// accole : contre la maison (ses blocs ne gênent pas) ; champ : peut aller dans le champ (les arroseurs).
const D18_ALLEE = (() => { const T = []; for (let z = -3.5; z >= -29.5; z -= 1) for (const x of [-0.5, 0.5]) T.push([x, z, 0]); return T; })();
const D18_COUR = (() => { const T = []; for (const z of [-3.6, -4.6]) for (let x = -3; x <= 3; x++) if (Math.abs(x) > 0.6) T.push([x, z, 0]); return T; })();
const D18_MURETS = (() => { const T = []; for (let x = 4; x <= 30; x += 2) for (const s of [-1, 1]) T.push([s * x, -30, 0]); return T; })();
const D18_PLAN = [
  { n: 1, id: 'toit', type: 'mat', map: { [M_THATCH]: M_SLATE } },
  { n: 1, id: 'banc', type: 'prop', p: 'banc', at: [[-3.2, -2.6, 0], [3.4, -2.6, 0], [-5.6, -1.0, Math.PI / 2]] },
  { n: 1, id: 'pot1', type: 'prop', p: 'pot_fleurs', at: [[-2.0, -2.0, 0]] },
  { n: 1, id: 'pot2', type: 'prop', p: 'pot_fleurs', at: [[2.0, -2.0, 0]] },
  { n: 2, id: 'allee', type: 'pave', p: 'allee', tuiles: D18_ALLEE },
  { n: 2, id: 'cour', type: 'pave', p: 'dalle', tuiles: D18_COUR },
  { n: 2, id: 'lamp1', type: 'prop', p: 'lampadaire', at: [[-1.9, -12, 0], [1.9, -12, 0]] },
  { n: 2, id: 'lamp2', type: 'prop', p: 'lampadaire', at: [[1.9, -24, 0], [-1.9, -24, 0]] },
  { n: 2, id: 'pompe', type: 'prop', p: 'puits_deco', at: [[6.6, -8.4, 0], [6.6, -27, 0], [-6, -15, 0]] },
  { n: 3, id: 'murs', type: 'mat', map: { [M_TIMBER]: M_STONE, [M_TIMBERWIN]: M_STONEWIN } },
  { n: 3, id: 'perron', type: 'bat', b: 'perron', at: [[0, -2.3, 0]], parts: [[0, 0, 1.45, 0.8, 1]], accole: true },
  { n: 3, id: 'horloge', type: 'dedans', p: 'horloge_comtoise', at: [[-0.7, 5.0, Math.PI], [3.9, -0.6, -Math.PI / 2]] },
  { n: 3, id: 'tapis', type: 'dedans', p: 'tapis', at: [[0.3, 0.6, 0]] },
  { n: 3, id: 'fauteuil', type: 'dedans', p: 'fauteuil', at: [[2.9, 2.2, -Math.PI / 2], [-0.4, 3.9, Math.PI]] },
  { n: 3, id: 'armoire', type: 'dedans', p: 'coffre', coffre: 'coffre_d18_a', at: [[3.7, -0.7, -Math.PI / 2], [-3.75, 1.0, Math.PI / 2], [-0.9, 4.9, Math.PI]] },
  { n: 3, id: 'chandelier', type: 'dedans', p: 'chandelier', at: [[-3.85, -0.9, 0], [3.85, 4.9, 0]] },
  { n: 4, id: 'verger', type: 'arbres', tuiles: [[6, 10], [10, 10], [14, 10], [6, 14], [10, 14], [14, 14], [18, 14], [18, 18]], max: 6 },
  { n: 4, id: 'ruche1', type: 'prop', p: 'ruche', at: [[18.5, 9.5, 0], [-14, 18, 0], [22, 12, 0]] },
  { n: 4, id: 'ruche2', type: 'prop', p: 'ruche', at: [[18.5, 11.5, 0], [-12.5, 18, 0], [22, 14, 0]] },
  { n: 4, id: 'jard1', type: 'prop', p: 'jardiniere', at: [[-3.3, -1.98, 0], [-2.5, 6.0, Math.PI]] },
  { n: 4, id: 'jard2', type: 'prop', p: 'jardiniere', at: [[3.3, -1.98, 0], [2.5, 6.0, Math.PI]] },
  { n: 5, id: 'aile_est', type: 'bat', b: 'aile', k: 'chambre', at: [[7.0, 3.0, 0]], parts: [[0, 0, 2.55, 2.55], [0, -3.1, 0.9, 0.55, 1]], accole: true, porte: [0, -2.5] },
  { n: 6, id: 'serre', type: 'bat', b: 'serre', at: [[-7, 12, 0], [0, 20, 0], [10, 21, 0], [-14, 21, 0]], parts: [[0, 0, 3.6, 2.35], [0, -2.9, 0.8, 0.6, 1]] },
  { n: 6, id: 'arr1', type: 'prop', p: 'arroseur_fer', champ: true, at: [[13.5, -17.5, 0], [13.5, -16.5, 0], [12.5, -10.2, 0]] },
  { n: 6, id: 'arr2', type: 'prop', p: 'arroseur_fer', champ: true, at: [[22.5, -17.5, 0], [22.5, -16.5, 0], [21.5, -10.2, 0]] },
  { n: 7, id: 'ecurie', type: 'bat', b: 'ecurie', at: [[-9, -5, 0], [-12, -17, 0], [-21, -5, 0], [-20, 14, 0]], parts: [[0, 0, 3.2, 2.2], [0, -2.75, 1.15, 0.2]] },
  { n: 7, id: 'fontaine', type: 'prop', p: 'fontaine_jardin', at: [[-5, -10, 0], [5, -16, 0], [-6, -20, 0]] },
  { n: 7, id: 'bancp1', type: 'prop', p: 'banc_pierre', at: [[-5, -12.6, 0], [-3, -13, 0]] },
  { n: 7, id: 'bancp2', type: 'prop', p: 'banc_pierre', at: [[-7.8, -10, Math.PI / 2], [-7.8, -12, Math.PI / 2]] },
  { n: 7, id: 'arche', type: 'prop', p: 'arche_fleurie', at: [[0, -21, 0], [0, -27.5, 0]] },
  { n: 7, id: 'ardoises', type: 'dep' },
  { n: 8, id: 'etage', type: 'etage' },
  { n: 8, id: 'aile_ouest', type: 'bat', b: 'aile', k: 'salon', at: [[-7.0, 3.0, 0]], parts: [[0, 0, 2.55, 2.55], [0, -3.1, 0.9, 0.55, 1]], accole: true, porte: [0, -2.5] },
  { n: 8, id: 'piliers', type: 'bat', b: 'piliers', at: [[0, -30, 0], [0, -26, 0], [0, -33, 0]], parts: [[-2.3, 0, 0.5, 0.5], [2.3, 0, 0.5, 0.5]] },
  { n: 8, id: 'murets', type: 'pave', p: 'cloture_pierre', tuiles: D18_MURETS, suit: 'piliers' },
  { n: 8, id: 'lamp3', type: 'prop', p: 'lampadaire', at: [[-1.9, -6.2, 0]] },
  { n: 8, id: 'lamp4', type: 'prop', p: 'lampadaire', at: [[1.9, -6.2, 0]] },
  { n: 8, id: 'lamp5', type: 'prop', p: 'lampadaire', at: [[-1.9, -18, 0], [1.9, -18, 0]] },
  { n: 8, id: 'statue', type: 'prop', p: 'statue_cerf', at: [[5, -8.5, 0], [-14, -12, 0], [-4, -26, 0]] },
  { n: 8, id: 'girouette', type: 'prop', p: 'girouette', at: [[-3.6, -6.4, 0], [3.6, -10, 0]] },
];
// le point que regarde la cinématique de chaque terme (repère de la ferme), quand ce n'est pas un bâtiment posé
const D18_VUE = { 1: [0, 2], 2: [0, -12], 3: [0, -1.5], 4: [10, 12], 5: [7, 3], 6: [-7, 12], 7: [-7, -7], 8: [0, 0] };
const D18_VUE_EL = { 5: 'aile_est', 6: 'serre', 7: 'ecurie' };

// ---------------------------------------------------------------- géométrie
// un rectangle orienté : { x, z, hx, hz, r } (r comme les blocs : l'axe x local vaut (cos r, -sin r) dans le monde)
function d18Axes(r) { const c = Math.cos(r), s = Math.sin(r); return [[c, -s], [s, c]]; }
function d18Recoupe(A, B) {
  const aA = d18Axes(A.r), aB = d18Axes(B.r), dx = B.x - A.x, dz = B.z - A.z;
  for (const ax of [aA[0], aA[1], aB[0], aB[1]]) {
    const pa = A.hx * Math.abs(ax[0] * aA[0][0] + ax[1] * aA[0][1]) + A.hz * Math.abs(ax[0] * aA[1][0] + ax[1] * aA[1][1]);
    const pb = B.hx * Math.abs(ax[0] * aB[0][0] + ax[1] * aB[0][1]) + B.hz * Math.abs(ax[0] * aB[1][0] + ax[1] * aB[1][1]);
    if (Math.abs(dx * ax[0] + dz * ax[1]) > pa + pb) return false;
  }
  return true;
}
// distance d'un point au rectangle (0 dedans)
function d18Dist(R, x, z) {
  const c = Math.cos(R.r), s = Math.sin(R.r), dx = x - R.x, dz = z - R.z, lx = dx * c - dz * s, lz = dx * s + dz * c;
  return Math.hypot(Math.max(0, Math.abs(lx) - R.hx), Math.max(0, Math.abs(lz) - R.hz));
}

const d18Travaux = {
  raisons: {}, // pourquoi un élément attend (le dernier essai)
  // ------------------------------------------------------------- le repère de la ferme
  F(w) { return w && w.farm && w.farm.f; },
  monde(F, lx, lz) { const c = Math.cos(F.r), s = Math.sin(F.r); return [F.x + lx * c + lz * s, F.z - lx * s + lz * c]; },
  maison(w) { return w.bld && w.bld.ferme; },
  // les blocs de la maison de la ferme (générés : les murs, le toit, le sol, la cheminée)
  blocsMaison(w) {
    const B = this.maison(w);
    if (!B) return [];
    if (w._d18maison && w._d18maison.w === w.blocks.length + ':' + B.x) return w._d18maison.L;
    const f = B.f, c = Math.cos(f.r), s = Math.sin(f.r), L = [];
    for (const b of w.blocks) {
      if (b.hidden || b.under || b.d18) continue;
      const dx = b.x - f.x, dz = b.z - f.z, lx = dx * c - dz * s, lz = dx * s + dz * c;
      if (Math.abs(lx) > B.W / 2 + 0.6 || Math.abs(lz) > B.D / 2 + 0.6 || b.y < f.y - 1.4 || b.y > f.y + 4) continue;
      if (![M_TIMBER, M_TIMBERWIN, M_THATCH, M_SLATE, M_STONE, M_STONEWIN, M_PLANKS, M_BRICK].includes(b.m)) continue;
      L.push(b);
    }
    w._d18maison = { w: w.blocks.length + ':' + B.x, L };
    return L;
  },
  dansMaison(w, x, z) {
    const B = this.maison(w), f = B.f, c = Math.cos(f.r), s = Math.sin(f.r), dx = x - f.x, dz = z - f.z;
    return Math.abs(dx * c - dz * s) < B.W / 2 && Math.abs(dx * s + dz * c) < B.D / 2;
  },
  // ------------------------------------------------------------- ce qui gêne
  // les listes proches de la ferme, faites une fois par chantier
  voisins(w) {
    const F = this.F(w), R = D18_RAYON + 30, V = { blocs: [], objets: [], props: [] };
    for (const b of w.blocks) if (!b.under && Math.abs(b.x - F.x) < R && Math.abs(b.z - F.z) < R) V.blocs.push(b);
    w.objects.forEach((o, i) => { if (o && !o.gone && Math.abs(o.x - F.x) < R && Math.abs(o.z - F.z) < R) V.objets.push(i); });
    for (const q of w.props) if (q && !q.gone && Math.abs(q.x - F.x) < R && Math.abs(q.z - F.z) < R) V.props.push(q);
    return V;
  },
  // le rectangle d'un objet posé (son collisionneur, sinon 30 cm)
  boiteProp(q) {
    const c = PROP_COLL[q.id], s = q.s || 1;
    return c ? { x: q.x, z: q.z, hx: c[0] * s, hz: c[1] * s, r: q.r || 0 } : { x: q.x, z: q.z, hx: 0.3, hz: 0.3, r: q.r || 0 };
  },
  // un objet posé par le joueur, qu'on peut déplacer
  aJoueur(w, q) {
    const i = w.props.indexOf(q);
    if (i < farm.genProps || q.bld || q.d18) return null;
    return (farm.s.props || []).find((p) => p.id === q.id && Math.abs(p.x - q.x) < 0.01 && Math.abs(p.z - q.z) < 0.01) || null;
  },
  // les rectangles d'un élément posé en (x, z, r) : { R, pas }
  rects(E, x, z, r, F) {
    const P = E.parts || [[0, 0, E.hx || 0.3, E.hz || 0.3]];
    const c = Math.cos(r), s = Math.sin(r);
    return P.map(([cx, cz, hx, hz, pas]) => ({ R: { x: x + cx * c + cz * s, z: z - cx * s + cz * c, hx, hz, r }, pas: !!pas }));
  },
  // que gêne-t-il ? null si rien ; sinon { pourquoi, joueur: [objets du joueur déplaçables] }
  gene(w, V, E, rects, o) {
    o = o || {};
    const F = this.F(w), s = farm.s, pad = o.pad ?? 0.25, maison = E.accole ? new Set(this.blocsMaison(w)) : null;
    const y0 = (o.y ?? F.y) - 0.3, y1 = (o.y ?? F.y) + (o.h ?? 3.4);
    const grand = (R, p) => ({ x: R.x, z: R.z, hx: R.hx + p, hz: R.hz + p, r: R.r });
    const joueur = [];
    for (const { R, pas } of rects) {
      // hors de la ferme
      if (Math.hypot(R.x - F.x, R.z - F.z) > D18_RAYON) return { pourquoi: 'loin' };
      const G = grand(R, pad);
      // le champ
      if (!o.champ && w.farm.field) {
        const fd = w.farm.field, C = { x: (fd.x0 + fd.x1 + 1) / 2, z: (fd.z0 + fd.z1 + 1) / 2, hx: (fd.x1 - fd.x0 + 1) / 2 + 1, hz: (fd.z1 - fd.z0 + 1) / 2 + 1, r: 0 };
        if (d18Recoupe(G, C)) return { pourquoi: 'champ' };
      }
      // blocs (bâtiments, chantiers, murets) ; les collisionneurs des objets posés sont vus avec les objets
      for (const b of V.blocs) {
        if (b.hidden || (maison && maison.has(b))) continue;
        if (b.y > y1 || b.y + b.sy < y0) continue;
        if (b.ver && !(b.ver & (w.curVer || VER_ALL))) continue;
        if (d18Recoupe(G, { x: b.x, z: b.z, hx: b.sx / 2, hz: b.sz / 2, r: b.r || 0 })) return { pourquoi: 'bloc', b };
      }
      // objets posés
      for (const q of V.props) {
        if (q.gone || D18_PLAT.has(q.id) || (PLACEABLES[q.id] && PLACEABLES[q.id].flat)) continue;
        if (maison && this.dansMaison(w, q.x, q.z)) continue;
        if (q.y > y1 || q.y < y0 - 0.5) continue;
        if (!d18Recoupe(G, this.boiteProp(q))) continue;
        const sp = this.aJoueur(w, q);
        if (sp && o.deplacer) { joueur.push(q); continue; }
        return { pourquoi: 'objet', q };
      }
      // arbres, rochers (la végétation basse sera arrachée)
      for (const i of V.objets) {
        const ob = w.objects[i];
        if (!ob || ob.gone) continue;
        const T = OBJ_TYPES[ob.t];
        if (!T || T.animal) continue;
        const rr = objRadius(T, ob);
        if (rr > 0 && d18Dist(G, ob.x, ob.z) < rr) return { pourquoi: 'arbre' };
      }
      // cultures (une case labourée vide n'empêche qu'un carreau)
      for (const k in s.crops) {
        const c = s.crops[k];
        const j = k.indexOf(','), cx = +k.slice(0, j) + 0.5, cz = +k.slice(j + 1) + 0.5;
        if (Math.abs(cx - R.x) > 12 || Math.abs(cz - R.z) > 12) continue;
        if ((c.c || c.tree || o.plat) && d18Dist(R, cx, cz) < 0.5) return { pourquoi: 'culture' };
      }
      // interactions (boîte aux lettres, eau, lits…)
      for (const it of w.inter || []) {
        if (Math.abs(it.x - R.x) > 10 || Math.abs(it.z - R.z) > 10 || it.y > y1 + 1 || it.y < y0 - 1) continue;
        if (it.d18) continue;
        if (it.kind === 'dig') continue; // (une fouille du jour : elle change chaque matin)
        if (d18Dist(R, it.x, it.z) < (o.interPad ?? 0.2)) return { pourquoi: 'inter', it };
      }
      // chemins des habitants (ce qui est solide seulement)
      if (!pas && !o.plat && w.nav) {
        const N = w.nav;
        for (const e of N.edges) {
          const A = N.nodes[e[0]], C = N.nodes[e[1]];
          if (!A || !C || (Math.abs(A.x - R.x) > 60 && Math.abs(C.x - R.x) > 60) || (Math.abs(A.z - R.z) > 60 && Math.abs(C.z - R.z) > 60)) continue;
          for (let t = 0; t <= 1.001; t += 0.05) if (d18Dist(R, A.x + (C.x - A.x) * t, A.z + (C.z - A.z) * t) < 0.6) return { pourquoi: 'chemin', e: [A.tag, C.tag] };
        }
      }
      // le joueur
      if (o.joueur && game.player) { const p = game.player.pos; if (Math.abs(p[1] - F.y) < 4 && d18Dist(R, p[0], p[2]) < 0.6) return { pourquoi: 'joueur' }; }
    }
    return joueur.length ? { pourquoi: 'joueur_objets', joueur } : null;
  },
  // ------------------------------------------------------------- déplacer un objet du joueur, de quelques pas
  deplacer(w, V, q, interdits) {
    const sp = this.aJoueur(w, q);
    if (!sp) return false;
    const F = this.F(w), B0 = this.boiteProp(q);
    for (let d = 1.5; d <= 9; d += 0.75) for (let a = 0; a < 6.28; a += 0.4) {
      const x = q.x + Math.cos(a) * d, z = q.z + Math.sin(a) * d;
      const R = { x, z, hx: B0.hx, hz: B0.hz, r: q.r || 0 };
      if (interdits.some((I) => d18Recoupe({ x: I.x, z: I.z, hx: I.hx + 0.3, hz: I.hz + 0.3, r: I.r }, R))) continue;
      if (Math.abs(w.heightAt(x, z) - q.y) > 0.4 || w.heightAt(x, z) < w.waterLevel + 0.3) continue;
      const V2 = { blocs: V.blocs, objets: V.objets, props: V.props.filter((p) => p !== q) };
      if (this.gene(w, V2, { hx: B0.hx, hz: B0.hz }, [{ R, pas: false }], { pad: 0.1, y: q.y })) continue;
      removePropCollider(w, q, true);
      q.x = x; q.z = z; sp.x = x; sp.z = z;
      addPropCollider(w, q);
      w.blocChange && w.blocChange();
      farm.dirtyProps = true;
      return true;
    }
    return false;
  },
  // ------------------------------------------------------------- poser
  bati(w) { return new Builder(w, mulberry32(1818), this.reserve(w)); },
  reserve(w) { return this._res && this._res.length === w.W * w.W ? this._res : (this._res = new Uint8Array(w.W * w.W)); },
  // ce qui est ajouté par un élément est marqué (d18 : son id) : on ne le démonte pas, on le retrouve
  marquer(w, n0, b0, i0, d0, id) {
    for (let i = n0; i < w.props.length; i++) { w.props[i].bld = 'd18'; w.props[i].d18 = id; }
    for (let i = b0; i < w.blocks.length; i++) w.blocks[i].d18 = id;
    for (let i = i0; i < (w.inter || []).length; i++) w.inter[i].d18 = id;
    for (let i = d0; i < w.doors.length; i++) w.doors[i].d18 = id;
  },
  frame(w, lx, lz, rr) { const F = this.F(w), [x, z] = this.monde(F, lx, lz); return { x, y: F.y, z, r: F.r + (rr || 0) }; },
  // un élément « prop » ou « dedans » à la place k
  poserProp(w, E, k, V) {
    const [lx, lz, rr] = E.at[k];
    const f = this.frame(w, lx, lz, rr), B = this.bati(w), n0 = w.props.length, b0 = w.blocks.length, i0 = (w.inter || []).length, d0 = w.doors.length;
    const y = E.type === 'dedans' ? this.maison(w).f.y + 0.15 : w.heightAt(f.x, f.z);
    const q = B.prop(E.p, f.x, y, f.z, f.r, E.p === 'cheminee' ? { lit: true } : null);
    if (E.coffre) q.d18coffre = E.coffre;
    this.marquer(w, n0, b0, i0, d0, E.id);
    if (V) { V.props.push(q); if (q.blk) V.blocs.push(q.blk); }
    return q;
  },
  // un bâtiment à la place k
  poserBat(w, E, k, V) {
    const [lx, lz, rr] = E.at[k];
    const f = this.frame(w, lx, lz, rr), B = this.bati(w), n0 = w.props.length, b0 = w.blocks.length, i0 = (w.inter || []).length, d0 = w.doors.length;
    D18_BATIR[E.b](B, f, E.k);
    this.marquer(w, n0, b0, i0, d0, E.id);
    if (E.id === 'perron' && w.farm.mini) w.farm.niche = this.monde(this.F(w), -1.9, -3.7); // le chien dort au bas du perron
    if (V) { for (let i = n0; i < w.props.length; i++) V.props.push(w.props[i]); for (let i = b0; i < w.blocks.length; i++) V.blocs.push(w.blocks[i]); }
    this.arracher(w, this.rects(E, f.x, f.z, f.r).map((x) => x.R));
  },
  // la végétation basse et les cases labourées vides, sous un bâtiment
  arracher(w, Rs) {
    const s = farm.s;
    w.objects.forEach((o, idx) => {
      if (!o || o.gone) return;
      const T = OBJ_TYPES[o.t];
      if (!T || T.animal || objRadius(T, o) > 0) return;
      if (Rs.some((R) => d18Dist(R, o.x, o.z) < 0.2)) { o.gone = true; s.removed[idx] = 1; if (w.objetChange) w.objetChange(idx); }
    });
    for (const k in s.crops) {
      const c = s.crops[k];
      if (c.c || c.tree) continue;
      const j = k.indexOf(','), cx = +k.slice(0, j) + 0.5, cz = +k.slice(j + 1) + 0.5;
      if (Rs.some((R) => d18Dist(R, cx, cz) < 0.5)) delete s.crops[k];
    }
  },
  // ------------------------------------------------------------- les matériaux de la maison, l'étage, les toits des chantiers
  materiaux(w, map) {
    for (const b of this.blocsMaison(w)) if (map[b.m] !== undefined) b.m = map[b.m];
  },
  etage(w) {
    const B = this.maison(w);
    if (!B || w._d18etage) return;
    w._d18etage = true;
    const L = this.blocsMaison(w), f = B.f, H = 2.9, dH = 2.7, t = 0.3, W = B.W, D = B.D;
    // le toit, son pignon et la cheminée montent d'un étage
    for (const b of L) {
      if (b.y >= f.y + H - 0.25 && b.sh === 1) b.y += dH;
      else if (b.m === M_BRICK && b.y > f.y + 1) b.sy += dH;
    }
    const Bd = this.bati(w), b0 = w.blocks.length, mur = M_STONE, fen = M_STONEWIN;
    Bd.block(f, 0, H, D / 2 - t / 2, W, dH, t, fen);
    Bd.block(f, 0, H, -D / 2 + t / 2, W, dH, t, fen);
    Bd.block(f, -W / 2 + t / 2, H, 0, t, dH, D - 2 * t, fen);
    Bd.block(f, W / 2 - t / 2, H, 0, t, dH, D - 2 * t, fen);
    Bd.block(f, 0, H - 0.05, 0, W - 2 * t + 0.02, 0.16, D - 2 * t + 0.02, M_PLANKS); // le plafond du rez-de-chaussée
    Bd.block(f, 0, H - 0.1, 0, W + 0.3, 0.18, D + 0.3, mur); // le bandeau entre les étages
    for (let i = b0; i < w.blocks.length; i++) w.blocks[i].d18 = 'etage';
  },
  // les toits des chantiers (grange, poulailler, atelier) passent à l'ardoise
  ardoises(w) {
    for (const bd of farm.s.builds || []) {
      const K = typeof BUILDS !== 'undefined' && BUILDS[bd.kind];
      if (!K || bd.kind === 'puits') continue;
      const R = { x: bd.x, z: bd.z, hx: K.W / 2 + 0.6, hz: K.D / 2 + 0.6, r: bd.r || 0 };
      for (const b of w.blocks) if (b.m === M_ROOF && !b.hidden && Math.abs(b.x - bd.x) < 12 && Math.abs(b.z - bd.z) < 12 && d18Dist(R, b.x, b.z) < 0.01) b.m = M_SLATE;
    }
  },
  // ------------------------------------------------------------- un élément : le poser (ou le retrouver au chargement)
  // P : farm.s.dettes18.places ; neuf : pendant le jeu (le joueur gêne, les objets du joueur sont déplacés)
  element(w, E, P, V, neuf) {
    const T = E.type;
    if (T === 'mat') { this.materiaux(w, E.map); return true; }
    if (T === 'etage') { this.etage(w); return true; }
    if (T === 'dep') { this.ardoises(w); return true; }
    if (T === 'pave' || T === 'arbres') return this.carreaux(w, E, P, V, neuf);
    const deja = P[E.id];
    if (deja !== undefined && deja >= 0 && E.at[deja]) {
      if (T === 'bat') this.poserBat(w, E, deja, V); else this.poserProp(w, E, deja, V);
      return true;
    }
    // chercher une place
    const opts = { champ: !!E.champ, joueur: neuf };
    const F = this.F(w), maisonY = this.maison(w) ? this.maison(w).f.y : F.y;
    for (let k = 0; k < E.at.length; k++) {
      const [lx, lz, rr] = E.at[k];
      const [x, z] = this.monde(F, lx, lz), r = F.r + (rr || 0);
      let rects;
      if (T === 'bat') rects = this.rects(E, x, z, r);
      else { const c = PROP_COLL[E.p]; rects = [{ R: { x, z, hx: c ? c[0] : 0.3, hz: c ? c[1] : 0.3, r }, pas: !c }]; }
      const hc = PROP_COLL[E.p] ? PROP_COLL[E.p][2] : 1;
      const o = Object.assign({}, opts, T === 'dedans' ? { y: maisonY, pad: 0.05, interPad: 0.15, dedans: true } : T === 'prop' ? { pad: 0.12, y: w.heightAt(x, z), h: hc } : { pad: 0.3, deplacer: neuf });
      if (T === 'dedans') { const m = new Set(this.blocsMaison(w)); o.ignore = m; }
      let g = T === 'dedans' ? this.geneDedans(w, V, rects, o) : this.gene(w, V, E, rects, o);
      if (g && g.pourquoi === 'joueur_objets') {
        const interdits = rects.map((x) => x.R), bouges = [];
        for (const q of g.joueur) if (this.deplacer(w, V, q, interdits)) bouges.push(q);
        if (bouges.length === g.joueur.length) {
          g = null;
          const noms = [...new Set(bouges.map((q) => (ITEMS[q.id] ? ITEMS[q.id].name : q.id).toLowerCase()))];
          if (neuf) farm.mail(D18_SIGNE, 'Les travaux', D18_LETTRES.deplace({ objets: noms.join(', ') }));
        }
      }
      if (g) { this.raisons[E.id] = g.pourquoi + (g.q ? ' ' + g.q.id : '') + (g.e ? ' ' + g.e.join('-') : '') + (g.it ? ' ' + g.it.kind : ''); continue; }
      P[E.id] = k;
      if (T === 'bat') this.poserBat(w, E, k, V); else this.poserProp(w, E, k, V);
      return true;
    }
    return false;
  },
  // un meuble de la maison : il ne gêne ni un meuble, ni un mur, ni une interaction
  geneDedans(w, V, rects, o) {
    const B = this.maison(w), f = B.f;
    for (const { R } of rects) {
      // dans la maison (à 30 cm des murs)
      const c = Math.cos(f.r), s = Math.sin(f.r);
      for (const [px, pz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => { const cc = Math.cos(R.r), ss = Math.sin(R.r); return [R.x + a * R.hx * cc + b * R.hz * ss, R.z - a * R.hx * ss + b * R.hz * cc]; })) {
        const dx = px - f.x, dz = pz - f.z, lx = dx * c - dz * s, lz = dx * s + dz * c;
        if (Math.abs(lx) > B.W / 2 - 0.28 || Math.abs(lz) > B.D / 2 - 0.28) return { pourquoi: 'mur' };
      }
      const G = { x: R.x, z: R.z, hx: R.hx + o.pad, hz: R.hz + o.pad, r: R.r };
      for (const q of V.props) {
        if (q.gone || Math.abs(q.y - o.y) > 1.2) continue;
        if (q.id === 'tapis' && !R.tapis) continue;
        if (d18Recoupe(G, this.boiteProp(q))) return { pourquoi: 'meuble', q };
      }
      for (const it of w.inter || []) if (!it.d18 && Math.abs(it.y - o.y) < 2 && d18Dist(R, it.x, it.z) < o.interPad) return { pourquoi: 'inter' };
      // la porte : un passage d'un mètre et demi devant elle
      const dr = w.doors[B.door];
      if (dr && d18Recoupe(G, { x: dr.x, z: dr.z, hx: 0.9, hz: 1.4, r: dr.r })) return { pourquoi: 'porte' };
    }
    return null;
  },
  // une suite de carreaux (pavés, murets) ou d'arbres : chacun posé s'il a sa place ; P[id] : les rangs posés
  carreaux(w, E, P, V, neuf) {
    const s = farm.s, F = this.F(w);
    const L = E.tuiles;
    if (Array.isArray(P[E.id])) {
      if (E.type === 'pave') for (const i of P[E.id]) if (L[i]) this.poserCarreau(w, E, this.decale(E, L[i], P), V);
      return true;
    }
    const pris = [];
    for (let i = 0; i < L.length; i++) {
      if (E.max && pris.length >= E.max) break;
      const [lx, lz, rr] = this.decale(E, L[i], P), [x, z] = this.monde(F, lx, lz), r = F.r + (rr || 0);
      if (E.type === 'arbres') {
        const kx = Math.floor(x), kz = Math.floor(z), key = kx + ',' + kz;
        if (s.crops[key] || !farm.canTill(kx + 0.5, kz + 0.5)) continue;
        if (this.gene(w, V, E, [{ R: { x: kx + 0.5, z: kz + 0.5, hx: 0.5, hz: 0.5, r: 0 }, pas: false }], { pad: 0.6, plat: true, joueur: neuf })) continue;
        s.crops[key] = { c: 'pommier', g: CROPS.pommier.h, wet: 0, dryH: 0, t: s.hours, tree: 1 };
        pris.push(i);
        continue;
      }
      const c = PROP_COLL[E.p], hx = c ? c[0] : 0.49, hz = c ? c[1] : 0.49;
      const o = { pad: c ? 0.05 : 0.0, plat: !c, y: w.heightAt(x, z), h: c ? c[2] : 0.3, joueur: false, interPad: 0.1 };
      if (this.gene(w, V, E, [{ R: { x, z, hx, hz, r }, pas: !c }], o)) continue;
      if (Math.abs(w.heightAt(x, z) - F.y) > 0.6) continue;
      this.poserCarreau(w, E, [lx, lz, rr], V);
      pris.push(i);
    }
    P[E.id] = pris;
    if (E.type === 'arbres') farm.dirtyProps = true;
    return true;
  },
  // une suite qui en suit une autre (les murets suivent les piliers du portail, là où ils ont trouvé leur place)
  decale(E, t, P) {
    const S = E.suit && D18_PLAN.find((e) => e.id === E.suit), k = S ? P[S.id] : undefined;
    if (!S || !(k > 0)) return t;
    return [t[0] + S.at[k][0] - S.at[0][0], t[1] + S.at[k][1] - S.at[0][1], t[2]];
  },
  poserCarreau(w, E, t, V) {
    const [lx, lz, rr] = t, f = this.frame(w, lx, lz, rr), B = this.bati(w), n0 = w.props.length;
    const q = B.prop(E.p, f.x, w.heightAt(f.x, f.z) + (E.p === 'allee' || E.p === 'dalle' ? 0.02 : 0), f.z, f.r);
    q.bld = 'd18'; q.d18 = E.id;
    if (V) { V.props.push(q); if (q.blk) V.blocs.push(q.blk); }
    return n0;
  },
  // ------------------------------------------------------------- appliquer : les termes 1 à n
  // au chargement (neuf faux) : ce qui a déjà sa place s'y remet, le reste cherche la sienne ; pendant le jeu (neuf) :
  // les travaux du terme n. Renvoie les éléments encore en attente.
  appliquer(w, n0, n1, neuf) {
    const S = farm.s && farm.s.dettes18;
    if (!S || !this.F(w) || !this.maison(w)) return [];
    const P = S.places || (S.places = {}), V = this.voisins(w), attente = [];
    for (const E of D18_PLAN) {
      if (E.n < n0 || E.n > n1) continue;
      let ok = false;
      try { ok = this.element(w, E, P, V, neuf); } catch (e) { console.error('dettes18 : ' + E.id, e); }
      if (!ok) attente.push(E.id);
    }
    this.rafraichir(w, neuf);
    return attente;
  },
  // les éléments en attente (pas de place hier) : on réessaie
  reprendre(w) {
    const S = farm.s && farm.s.dettes18;
    if (!S || !S.fait) return 0;
    const P = S.places || (S.places = {}), V = this.voisins(w);
    let n = 0;
    for (const E of D18_PLAN) {
      if (E.n > S.fait || P[E.id] !== undefined || ['mat', 'etage', 'dep', 'pave', 'arbres'].includes(E.type)) continue;
      try { if (this.element(w, E, P, V, true)) n++; } catch (e) { console.error('dettes18 : ' + E.id, e); }
    }
    if (n) this.rafraichir(w, true);
    return n;
  },
  rafraichir(w, neuf) {
    const F = this.F(w);
    w.blocksDirty = true; w.grid = null; w.coverDirty = true; w.shadeDirty = true;
    w.shadeRegion = [F.x - D18_RAYON - 8, F.z - D18_RAYON - 8, F.x + D18_RAYON + 8, F.z + D18_RAYON + 8];
    w.objectsDirty = true;
    w._d18maison = null;
    farm.dirtyProps = true;
    if (neuf) {
      const c = w.cell, R = D18_RAYON + 4;
      w.markMats(Math.floor((F.x - R) / c), Math.floor((F.z - R) / c), Math.ceil((F.x + R) / c), Math.ceil((F.z + R) / c));
      if (w.collectLights) w.collectLights();
    }
  },
  // le centre de ce qu'a apporté le terme n (pour la caméra)
  vue(w, n) {
    const F = this.F(w), S = farm.s.dettes18, id = D18_VUE_EL[n];
    if (id && S.places && S.places[id] >= 0) { const E = D18_PLAN.find((e) => e.id === id), a = E.at[S.places[id]]; return this.monde(F, a[0], a[1]); }
    const v = D18_VUE[n] || [0, 0];
    return this.monde(F, v[0], v[1]);
  },
};

// ---------------------------------------------------------------- les coffres des travaux (armoire, coffre de la chambre)
{
  const pre = HOOKS.propPre.coffre;
  HOOKS.propPre.coffre = (q) => {
    if (q && q.d18coffre && farm.s) {
      const s = farm.s;
      sound.lootOpen && sound.lootOpen();
      ui.openStore(q.d18coffre === 'coffre_d18_a' ? 'Armoire' : 'Coffre', s.chests[q.d18coffre] || (s.chests[q.d18coffre] = {}), 'chest');
      return true;
    }
    return pre ? pre(q) : false;
  };
}

// ---------------------------------------------------------------- au chargement : les travaux faits, remis en place
{
  const _start = farm.start;
  farm.start = async function (saved, seed, progress) {
    const w = await _start.call(this, saved, seed, progress);
    try {
      const S = this.s && this.s.dettes18;
      if (S && S.fait > 0) d18Travaux.appliquer(w, 1, S.fait, false);
    } catch (e) { console.error('dettes18 : travaux', e); }
    return w;
  };
}
// un chantier bâti après « Les dépendances » : son toit est d'ardoise lui aussi
if (typeof builds !== 'undefined') {
  const _make = builds.make.bind(builds);
  builds.make = function (w, b, n, fresh) {
    const r = _make(w, b, n, fresh);
    try { const S = farm.s && farm.s.dettes18; if (S && S.fait >= D18_AVANTAGES.ecurie) d18Travaux.ardoises(w); } catch (e) { console.error(e); }
    return r;
  };
}
