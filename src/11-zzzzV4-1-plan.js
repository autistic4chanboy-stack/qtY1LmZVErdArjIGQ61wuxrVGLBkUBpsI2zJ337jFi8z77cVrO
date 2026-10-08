// ============================================================================
//  LE CHÂTEAU DES HAUTS — HAUTGUET (agent V4, quatorzième vague) — le plan et la passe
//  Sur le site « chateau » de la Zone (V1 : x 3 236, z 825, r 175, sol y ≈ 124,7),
//  une passe de génération (zone.passe('V4-chateau')) bâtit, en coordonnées locales
//  (x vers l'est, z vers le sud, y au-dessus du sol du replat) :
//   - à l'ouest, le FOSSÉ (sec, maçonné) et le CHÂTELET : le pont-levis est levé ; le
//     treuil est en haut, dans la salle du treuil, où veille encore un vieil homme ;
//   - la BASSE-COUR (x −98 … −32) : écuries et fenil, caserne, forge, puits, cimetière,
//     vergers morts ; une BRÈCHE dans la courtine sud ; l'escalier du chemin de ronde
//     nord, dont un pan s'est effondré (on saute, en courant) ;
//   - le mur de la HAUTE COUR (x = −30), sa porte et sa HERSE (le treuil est de l'autre
//     côté), la poterne de la dépense, barrée de l'autre côté ;
//   - la HAUTE COUR : cuisines (et leur cave), grand-salle (sa tribune, une cache
//     au-dessus des cuisines), logis (le sénéchal en bas, la Dame en haut, les latrines
//     dont le conduit débouche au pied de la courtine nord), une galerie couverte,
//     la chapelle (son clocher, sa sacristie fermée, sa crypte), le DONJON (la porte
//     haute, fermée ; la salle basse et la trappe de l'oubliette ; la chambre du sire et
//     le trésor muré ; la salle haute ; la terrasse et le GUET), la TOUR DE LA DAME
//     (fermée ; on lui parle à travers la porte, la nuit), le puits, le jardin, la
//     poterne de l'est (barrée dedans, fermée à clé dehors) ;
//   - sous terre : la crypte, la cave, les CACHOTS (la salle du geôlier, les cellules,
//     la salle de la question), la fosse du donjon et son boyau, le SOUTERRAIN jusqu'au
//     charnier, hors les murs, dont la grille ne s'ouvre que par-dessous.
//  Les raccourcis s'ouvrent d'un seul côté : pont-levis, herse, poterne de la dépense,
//  poterne de l'est, échelle du fenil, grille du charnier, porte des cachots.
//  Le jeu (portes, clés, leviers…) : 11-zzzzV4-2-jeu.js ; l'API zone.chateau : 11-zzzzV4-3-api.js.
//  Tout ce que la passe pose est noté dans Z.v4 (salles, places pour V2, abris pour V3).
// ============================================================================
Object.assign(LIEU_NAMES, V4_LIEUX);

// ---------------------------------------------------------------- les mesures du plan (m, repère local)
const V4_PLAN = {
  HM: 11, EM: 3,                              // courtines : hauteur du chemin de ronde, épaisseur
  XO: -100, XE: 72, ZN: -60, ZS: 60,          // axes des courtines (ouest, est, nord, sud)
  XI: -30,                                    // axe du mur de la haute cour
  FOSSE: { x0: -121, x1: -108, z: 66, p: 6 }, // le fossé (ouest), sa profondeur
  CACHOTS: -12, CRYPTE: -7, CAVE: -5, PUITS: -10,
};

// l'objet du château (état lu par les modèles ; complété par 11-zzzzV4-2-jeu.js et 11-zzzzV4-3-api.js)
const chateauV4 = {
  Z: null, // Z.v4 du monde généré
  // ------------------------------------------------------------- l'état sauvegardé (farm.s.v4)
  S() {
    const s = typeof farm !== 'undefined' && farm.s;
    if (!s) return this._vide || (this._vide = this.normaliser({}));
    if (!s.v4 || typeof s.v4 !== 'object') s.v4 = {};
    return this.normaliser(s.v4);
  },
  normaliser(S) {
    if (!S.v) S.v = 1;
    for (const k of ['portes', 'leviers', 'echelles', 'murs', 'pris', 'lus', 'grilles', 'trappes', 'vus', 'parle']) if (!S[k] || typeof S[k] !== 'object' || Array.isArray(S[k])) S[k] = {};
    if (!S.thibaud || typeof S.thibaud !== 'object') S.thibaud = { n: 0, etat: 'treuil' };
    if (!S.dame || typeof S.dame !== 'object') S.dame = { n: 0 };
    if (typeof S.guet !== 'boolean') S.guet = false;
    return S;
  },
};

// ---------------------------------------------------------------- la passe
zone.passe('V4-chateau', (Z, O) => v4Batir(Z, O));

function v4Batir(Z, O) {
  const st = O.site('chateau'), CX = st.x, CZ = st.z, Y0 = st.y, P = V4_PLAN;
  const n0 = Z.blocks.length, p0 = Z.props.length, i0 = Z.inter.length, d0 = Z.doors.length;
  const rnd = O.rnd, SV = chateauV4.S();
  const V = {
    cx: CX, cz: CZ, y0: Y0, salles: [], abris: [], places: [], portes: {}, herses: {}, murs: {}, ponts: {},
    echelles: {}, trappes: {}, grilles: {}, objets: {}, fouilles: {}, lieux: {}, pts: {}, guet: null, thibaud: null, cloche: null,
  };
  Object.defineProperty(V, 'monde', { value: Z, enumerable: false });
  Z.v4 = V; chateauV4.Z = V;
  const W = (x, y, z) => [CX + x, Y0 + y, CZ + z];
  // ------------------------------------------------------------- outils (repère local ; le château n'est pas tourné)
  // (pour un bloc tourné, les bornes x et z sont celles du bloc dans son propre repère, autour du même centre)
  const B = (x0, x1, y0, y1, z0, z1, m, o) => {
    if (x1 - x0 < 0.01 || y1 - y0 < 0.01 || z1 - z0 < 0.01) return null;
    let r = 0, sh = 0, extra;
    if (o) { extra = {}; for (const k in o) { if (k === 'r') r = o.r; else if (k === 'sh') sh = o.sh; else extra[k] = o[k]; } }
    return O.bloc(CX + (x0 + x1) / 2, Y0 + y0, CZ + (z0 + z1) / 2, x1 - x0, y1 - y0, z1 - z0, m === undefined ? M_V4_PIERRE : m, r, sh, extra);
  };
  // un toit (ou un bloc) tourné d'un quart de tour : centre (xc, zc), étendues lx (le long de x) et lz (le long de z) dans le monde
  const B90 = (xc, zc, y0, y1, lx, lz, m, o) => B(xc - lz / 2, xc + lz / 2, y0, y1, zc - lx / 2, zc + lx / 2, m, Object.assign({ r: Math.PI / 2 }, o || {}));
  // un mur le long de x (à z = zc, épaisseur e), de x0 à x1, de y0 à y1 ; ouvertures [a, b, bas, haut] (y locaux) —
  // des ouvertures peuvent s'empiler (une porte en bas, une fenêtre au-dessus) : le mur est coupé en tranches
  const mur = (axe, c, e, a0, a1, y0, y1, m, ouv, o) => {
    const cuts = new Set([a0, a1]);
    for (const [a, b] of ouv || []) { if (a > a0 && a < a1) cuts.add(a); if (b > a0 && b < a1) cuts.add(b); }
    const xs = [...cuts].sort((p, q) => p - q), tr = [];
    for (let i = 0; i + 1 < xs.length; i++) {
      const sa = xs[i], sb = xs[i + 1], mid = (sa + sb) / 2;
      const trous = (ouv || []).filter(([a, b]) => a <= mid && b >= mid).map(([, , bas, haut]) => [Math.max(y0, bas), Math.min(y1, haut)]).filter(([p, q]) => q > p).sort((p, q) => p[0] - q[0]);
      const pleins = [];
      let cur = y0;
      for (const [p, q] of trous) { if (p > cur) pleins.push([cur, p]); cur = Math.max(cur, q); }
      if (cur < y1) pleins.push([cur, y1]);
      const k = pleins.map((v) => v.join(':')).join('|'), L = tr[tr.length - 1];
      if (L && L.k === k && Math.abs(L.sb - sa) < 1e-6) L.sb = sb; else tr.push({ sa, sb, k, pleins });
    }
    for (const t of tr) for (const [p, q] of t.pleins) {
      if (axe === 'x') B(t.sa, t.sb, p, q, c - e / 2, c + e / 2, m, o);
      else B(c - e / 2, c + e / 2, p, q, t.sa, t.sb, m, o);
    }
  };
  const murX = (zc, e, x0, x1, y0, y1, m, ouv, o) => mur('x', zc, e, x0, x1, y0, y1, m, ouv, o);
  const murZ = (xc, e, z0, z1, y0, y1, m, ouv, o) => mur('z', xc, e, z0, z1, y0, y1, m, ouv, o);
  // une dalle percée de trous rectangulaires [x0, x1, z0, z1]
  const dalle = (x0, x1, z0, z1, y0, y1, m, trous, o) => {
    for (const [a0, a1, b0, b1] of percer([[x0, x1, z0, z1]], trous)) B(a0, a1, y0, y1, b0, b1, m, o);
  };
  // des rectangles [x0, x1, z0, z1] moins des trous rectangulaires
  function percer(rects, trous) {
    let parts = rects;
    for (const [tx0, tx1, tz0, tz1] of trous || []) {
      const out = [];
      for (const [a0, a1, b0, b1] of parts) {
        if (tx1 <= a0 || tx0 >= a1 || tz1 <= b0 || tz0 >= b1) { out.push([a0, a1, b0, b1]); continue; }
        if (tz0 > b0) out.push([a0, a1, b0, tz0]);
        if (tz1 < b1) out.push([a0, a1, tz1, b1]);
        const c0 = Math.max(b0, tz0), c1 = Math.min(b1, tz1);
        if (tx0 > a0) out.push([a0, tx0, c0, c1]);
        if (tx1 < a1) out.push([tx1, a1, c0, c1]);
      }
      parts = out;
    }
    return parts;
  }
  const prop = (id, x, y, z, r, data, s) => O.prop(id, CX + x, Y0 + y, CZ + z, r || 0, data || null, s);
  const inter = (kind, id, x, y, z, nom, data) => O.inter(kind, id, CX + x, Y0 + y, CZ + z, nom || '', data || {});
  // une vraie porte (Z.doors) : (x, z) au milieu du mur, plancher y, r (le +z de la porte regarde « dedans »), w, h ;
  // o : { id, cle, barre ('dedans' : la barre est du côté +z ; 'dehors'), style, ouverte }
  const porte = (x, z, y, r, w, h, o) => {
    o = o || {};
    const d = { x: CX + x, y: Y0 + y + 0.02, z: CZ + z, r, w, h, a: 0, open: 0, locked: !!(o.cle || o.barre), bld: null, m: M_PLANKS, style: o.style || 'garde', ep: o.ep || 1.2, v4: { id: o.id, cle: o.cle || null, barre: o.barre || null, nom: o.nom || null } };
    Z.doors.push(d);
    if (o.id) V.portes[o.id] = d;
    return d;
  };
  // (o.trous : [x0, x1, z0, z1] locaux, là où le toit est crevé : ni abri pour l'éclairage, ni pour le dragon ;
  //  o.octo : [cx, cz, apothème] local, une salle octogonale, pour la carte des abris ; o.abri : [x0, x1, z0, z1] local,
  //  le rectangle de la carte des abris quand la salle est tracée au milieu des murs ou s'ouvre d'un côté)
  const salle = (id, nom, x0, x1, y0, y1, z0, z1, o) => {
    const s = Object.assign({ id, nom, x0: CX + x0, x1: CX + x1, y0: Y0 + y0, y1: Y0 + y1, z0: CZ + z0, z1: CZ + z1, couvert: true, dessous: y1 <= 0.5 }, o || {});
    if (s.trous) s.trous = s.trous.map(([a, b, c, d]) => [CX + a, CX + b, CZ + c, CZ + d]);
    if (s.octo) s.octo = [CX + s.octo[0], CZ + s.octo[1], s.octo[2]];
    if (s.abri) s.abri = [CX + s.abri[0], CX + s.abri[1], CZ + s.abri[2], CZ + s.abri[3]];
    V.salles.push(s);
    return s;
  };
  const place = (id, type, x, y, z, r, o) => V.places.push(Object.assign({ id: 'v4_' + id, type, x: CX + x, y: Y0 + y, z: CZ + z, r: r || 4, site: 'chateau', agent: 'V4' }, o || {}));
  const pt = (k, x, y, z, yaw) => (V.pts[k] = { x: CX + x, y: Y0 + y, z: CZ + z, yaw: yaw || 0 });
  const lieu = (cle, x, z, r) => { const L = O.lieu(cle, CX + x, CZ + z, r, V4_LIEUX[cle] || cle, { v4: true }); V.lieux[cle] = L; return L; };
  // un escalier droit, marches pleines : de (x, z) au sol y0 jusqu'à y1, vers dir ('+x', '-x', '+z', '-z'), largeur l
  const escalier = (x, z, y0, y1, dir, l, run, m) => {
    const n = Math.max(1, Math.ceil((y1 - y0) / 0.33)), h = (y1 - y0) / n, s = run || 0.5;
    for (let i = 0; i < n; i++) {
      const top = y0 + h * (i + 1), a = i * s, b = (i + 1) * s;
      if (dir === '+x') B(x + a, x + b, Math.min(y0, -0.6), top, z - l / 2, z + l / 2, m || M_V4_PIERRE);
      else if (dir === '-x') B(x - b, x - a, Math.min(y0, -0.6), top, z - l / 2, z + l / 2, m || M_V4_PIERRE);
      else if (dir === '+z') B(x - l / 2, x + l / 2, Math.min(y0, -0.6), top, z + a, z + b, m || M_V4_PIERRE);
      else B(x - l / 2, x + l / 2, Math.min(y0, -0.6), top, z - b, z - a, m || M_V4_PIERRE);
    }
    return n * s;
  };
  // un escalier dont on ne voit que les marches (sous un plancher : y0 > 0) — marches flottantes de 0,4 m d'épaisseur
  const escalierSuspendu = (x, z, y0, y1, dir, l, run, m) => {
    const n = Math.max(1, Math.ceil((y1 - y0) / 0.33)), h = (y1 - y0) / n, s = run || 0.5;
    for (let i = 0; i < n; i++) {
      const top = y0 + h * (i + 1), a = i * s, b = (i + 1) * s, bas = Math.max(y0 - 0.6, top - 0.9);
      if (dir === '+x') B(x + a, x + b, bas, top, z - l / 2, z + l / 2, m);
      else if (dir === '-x') B(x - b, x - a, bas, top, z - l / 2, z + l / 2, m);
      else if (dir === '+z') B(x - l / 2, x + l / 2, bas, top, z + a, z + b, m);
      else B(x - l / 2, x + l / 2, bas, top, z - b, z - a, m);
    }
  };
  // un passage d'un point à un autre (escalier à vis, échelle, escalier dans le mur…) : deux interactions (aller, retour)
  const vis = (id, a, b, nom, o) => {
    o = o || {};
    inter('v4_escalier', id + ':m', a[0], a[1] + 1.0, a[2], nom || V4_TEXTES.vis, { to: W(b[0], b[1], b[2]), sens: b[1] > a[1] ? 'monter' : 'descendre', id, cle: o.cle || null, texte: o.texte || null, yaw: o.yaw });
    if (!o.aller) inter('v4_escalier', id + ':d', b[0], b[1] + 1.0, b[2], nom || V4_TEXTES.vis, { to: W(a[0], a[1], a[2]), sens: a[1] > b[1] ? 'monter' : 'descendre', id, cle: o.cle || null, texte: o.texte2 || o.texte || null, yaw: o.yaw2 });
  };
  const lire = (t, x, y, z) => inter('v4_lire', 'v4_lire_' + t, x, y, z, V4_LIRE[t] ? V4_LIRE[t][0] : '', { t });
  // fouille : un contenant (une fois) ; table (LOOT) ou contenu fixe
  const fouille = (id, x, y, z, titre, table, fixe) => { inter('v4_fouille', 'v4_f_' + id, x, y, z, titre, { id, table: table || null, fixe: fixe || null, titre }); V.fouilles[id] = 1; };
  // un objet à prendre (une clé, une lettre…) : une fois ; le modèle v4_objet disparaît quand on l'a pris
  const objet = (id, item, x, y, z, r, texte) => { prop('v4_objet', x, y, z, r, { id, k: item }); inter('v4_prendre', 'v4_p_' + id, x, y + 0.25, z, ITEMS[item] ? ITEMS[item].name : '', { id, item, texte: texte || null }); V.objets[id] = item; };
  const creneaux = (x0, x1, z0, z1, y, e, o) => {
    // des merlons (un objet posé) au-dessus d'un parapet, le long d'un segment axial
    const L = Math.hypot(x1 - x0, z1 - z0); if (L < 1.5) return;
    const r = x1 !== x0 ? 0 : Math.PI / 2;
    prop('v4_creneaux', (x0 + x1) / 2, y, (z0 + z1) / 2, r, Object.assign({ L, e: e || 0.6 }, o || {}));
  };

  // ------------------------------------------------------------- le terrain : dalles de la haute cour, terre de la basse-cour, le fossé
  const f0 = { x: CX, z: CZ, r: 0 };
  O.B.paintRect(f0, -64, 0, 34.5, 58.5, M_DIRT);                         // basse-cour
  O.B.paintRect(f0, 21, 0, 49.5, 58.5, M_V4_DALLES);                     // haute cour
  O.B.paintRect(f0, -60, 0, 30, 2.5, M_COBBLE);                          // l'allée pavée, de la porte à la herse
  O.B.paintRect(f0, -48, 38, 10, 12, M_V1_TERREMORTE);                   // le cimetière
  O.B.paintRect(f0, 28, 34, 6, 6, M_V1_TERREMORTE);                      // le jardin de la Dame
  O.B.paintRect(f0, -104.75, 0, 3.25, 62, M_V1_TERREMORTE);              // la lice, entre la courtine et le fossé
  // le fossé : un fond plat 6 m plus bas, deux murs maçonnés ; aux deux bouts, une rampe de terre
  {
    const F = P.FOSSE, yb = Y0 - F.p;
    O.B.forVerts(CX + (F.x0 + F.x1) / 2, CZ, 100, (i, j, k, x, z) => {
      const lx = x - CX, lz = Math.abs(z - CZ);
      if (lx < F.x0 + 1 || lx > F.x1 - 1 || lz > F.z + 16) return;
      const t = lz <= F.z ? 0 : (lz - F.z) / 16;
      Z.heights[k] = Math.min(Z.heights[k], lerp(yb, Y0, t));
    });
    O.B.paintRect(f0, (F.x0 + F.x1) / 2, 0, (F.x1 - F.x0) / 2 + 1, F.z + 16, M_DIRT);
    B(F.x1 - 1.2, F.x1, -F.p - 1, 0.25, -F.z, -3.4, M_V4_PIERRE); B(F.x1 - 1.2, F.x1, -F.p - 1, 0.25, 3.4, F.z, M_V4_PIERRE); // l'escarpe
    B(F.x0, F.x0 + 1.2, -F.p - 1, 0.25, -F.z, F.z, M_V4_PIERRE);   // la contrescarpe
    salle('fosse', 'le fossé', F.x0, F.x1, -F.p, 0, -F.z, F.z, { couvert: false, dessous: false });
    // contre le pont levé, au fond : les os de ceux d'en bas
    prop('v4_os_tas', F.x1 - 2.2, -F.p, -0.8, 0.3, { poupee: true });
    prop('v4_os_tas', F.x1 - 2.8, -F.p, 1.8, 1.9);
    prop('v4_os_tas', F.x1 - 5.5, -F.p, -3.6, 2.4);
    lire('os_pont', F.x1 - 2.5, -F.p + 0.6, 0.4);
    // la bouche d'égout du fossé (un recoin) : un caveau sous la lice
    B(F.x1 - 1.3, F.x1 - 1.1, -F.p, -F.p + 1.6, 9, 10.4, M_DARK);
    prop('grille_courte', F.x1 - 1.0, -F.p, 9.7, Math.PI / 2, null, 0.6);
    fouille('egout', F.x1 - 1.6, -F.p + 0.5, 9.7, 'Une bouche d’égout, au pied du mur', 'v4_recoin');
    // la borne, de l'autre côté du fossé ; le chemin qui y mène
    prop('v1_stele', F.x0 - 4, 0, 7, -Math.PI / 2);
    lire('borne', F.x0 - 3.4, 1.4, 7);
    for (let k = 0; k <= 12; k++) { const t = k / 12, x = lerp(-200, F.x0 - 1, t), z = lerp(70, 0, Math.pow(t, 0.6)); O.peindre(CX + x, CZ + z, 2.4, M_DIRT); }
    pt('fosse_bord', F.x0 - 6, 0, 0, -Math.PI / 2);
    pt('fosse_fond', F.x1 - 3, -F.p, 0, Math.PI / 2);
    place('fosse', 'rodeur', F.x1 - 6, -F.p, 30, 14, { heures: [19, 6] });
  }

  // ------------------------------------------------------------- les tours (carrées : pyramide d'ardoise ou terrasse crénelée)
  // o : { cx, cz, w, e, H, niveaux: [y…], toit, portes: [{ cote, u, y, w, h, porte, muree, id }], vis: { coin, de: [y…] }, nom, id }
  const tours = [];
  const tour = (o) => {
    const w = o.w || 9, e = o.e || 1.5, H = o.H, h2 = w / 2, cx = o.cx, cz = o.cz;
    const ouv = { n: [], s: [], e: [], o: [] };
    for (const p of o.portes || []) {
      const pw = p.w || 1.5, ph = p.h || 2.5, a = (p.cote === 'n' || p.cote === 's' ? cx : cz) + (p.u || 0) - pw / 2;
      if (p.muree) { ouv[p.cote].push([a, a + pw, p.y, p.y + ph]); }
      else ouv[p.cote].push([a, a + pw, p.y, p.y + ph]);
    }
    const y0 = o.base === undefined ? -1 : o.base;
    murX(cz - h2 + e / 2, e, cx - h2, cx + h2, y0, H, M_V4_PIERRE, ouv.n);
    murX(cz + h2 - e / 2, e, cx - h2, cx + h2, y0, H, M_V4_PIERRE, ouv.s);
    murZ(cx + h2 - e / 2, e, cz - h2 + e, cz + h2 - e, y0, H, M_V4_PIERRE, ouv.e);
    murZ(cx - h2 + e / 2, e, cz - h2 + e, cz + h2 - e, y0, H, M_V4_PIERRE, ouv.o);
    // les baies murées : une maçonnerie plus claire, en retrait
    for (const p of o.portes || []) if (p.muree) {
      const pw = p.w || 1.5, ph = p.h || 2.5, u = p.u || 0;
      if (p.cote === 'n' || p.cote === 's') B(cx + u - pw / 2, cx + u + pw / 2, p.y, p.y + ph, (p.cote === 'n' ? cz - h2 + e / 2 : cz + h2 - e / 2) - 0.4, (p.cote === 'n' ? cz - h2 + e / 2 : cz + h2 - e / 2) + 0.4, M_V1_PIERRE);
      else B((p.cote === 'o' ? cx - h2 + e / 2 : cx + h2 - e / 2) - 0.4, (p.cote === 'o' ? cx - h2 + e / 2 : cx + h2 - e / 2) + 0.4, p.y, p.y + ph, cz + u - pw / 2, cz + u + pw / 2, M_V1_PIERRE);
    }
    const ix0 = cx - h2 + e, ix1 = cx + h2 - e, iz0 = cz - h2 + e, iz1 = cz + h2 - e;
    for (const y of o.niveaux || []) B(ix0, ix1, y - 0.35, y, iz0, iz1, M_PLANKS, { plafond: true });
    if (o.toit === 'fleche') {
      B(cx - h2 - 0.7, cx + h2 + 0.7, H, H + w * 0.95, cz - h2 - 0.7, cz + h2 + 0.7, M_SLATE, { sh: 3 });
    } else {
      B(ix0, ix1, H - 0.4, H, iz0, iz1, M_V4_DALLES); // la terrasse
      murX(cz - h2 + 0.3, 0.6, cx - h2, cx + h2, H, H + 1.3, M_V4_PIERRE);
      murX(cz + h2 - 0.3, 0.6, cx - h2, cx + h2, H, H + 1.3, M_V4_PIERRE);
      murZ(cx - h2 + 0.3, 0.6, cz - h2 + 0.6, cz + h2 - 0.6, H, H + 1.3, M_V4_PIERRE);
      murZ(cx + h2 - 0.3, 0.6, cz - h2 + 0.6, cz + h2 - 0.6, H, H + 1.3, M_V4_PIERRE);
      creneaux(cx - h2 + 0.3, cx + h2 - 0.3, cz - h2 + 0.3, cz - h2 + 0.3, H + 1.3, 0.6, { p: 2.2 });
      creneaux(cx - h2 + 0.3, cx + h2 - 0.3, cz + h2 - 0.3, cz + h2 - 0.3, H + 1.3, 0.6, { p: 2.2 });
      creneaux(cx - h2 + 0.3, cx - h2 + 0.3, cz - h2 + 0.9, cz + h2 - 0.9, H + 1.3, 0.6, { p: 2.2 });
      creneaux(cx + h2 - 0.3, cx + h2 - 0.3, cz - h2 + 0.9, cz + h2 - 0.9, H + 1.3, 0.6, { p: 2.2 });
    }
    // l'escalier à vis : un coin de la tour, d'un niveau au suivant (et la terrasse)
    if (o.vis) {
      const c = o.vis.coin || 'no', sx = c[1] === 'o' ? ix0 + 1.0 : ix1 - 1.0, sz = c[0] === 'n' ? iz0 + 1.0 : iz1 - 1.0;
      const L = (o.vis.de || [0].concat(o.niveaux || [])).slice();
      if (o.toit !== 'fleche' && o.vis.terrasse !== false) L.push(H);
      for (let k = 0; k + 1 < L.length; k++) vis(o.id + '_vis' + k, [sx, L[k], sz], [sx + (c[1] === 'o' ? 0.9 : -0.9), L[k + 1], sz], V4_TEXTES.vis, { yaw: c[0] === 'n' ? Math.PI : 0 });
    }
    // en haut, contre un mur : ce qu'un homme de garde a laissé (un recoin par tour)
    if (o.coffre) {
      const yc = (o.niveaux || [0])[(o.niveaux || [0]).length - 1], c = (o.vis && o.vis.coin) || 'no';
      const qx = c[1] === 'o' ? ix1 - 0.7 : ix0 + 0.7, qz = c[0] === 'n' ? iz1 - 0.6 : iz0 + 0.6;
      prop('coffre_vieux', qx, yc, qz, c[0] === 'n' ? Math.PI : 0);
      fouille('tour_' + o.id, qx, yc + 0.6, qz + (c[0] === 'n' ? -0.5 : 0.5), o.coffre === 'soldat' ? 'Le coffre d’un homme de garde' : 'Un vieux coffre', o.coffre === 'soldat' ? 'v4_soldat' : 'v4_recoin');
    }
    salle('tour_' + o.id, o.nom || 'une tour', ix0, ix1, 0, H, iz0, iz1);
    V.abris.push({ x: CX + cx, y: Y0 + H / 2, z: CZ + cz, r: w / 2 - e, nom: o.nom || 'une tour' });
    tours.push(o);
    return { ix0, ix1, iz0, iz1 };
  };

  // ------------------------------------------------------------- les courtines (chemin de ronde à 11 m, parapet du côté du dehors)
  const HM = P.HM, EM = P.EM;
  // côté : 'n' (z = ZN), 's' (z = ZS), 'o' (x = XO), 'e' (x = XE), 'i' (le mur de la haute cour, x = XI) ; segments [a, b] entre les tours
  const courtine = (cote, a, b, o) => {
    o = o || {};
    const h = o.h === undefined ? HM : o.h, ouv = o.ouv || [];
    if (cote === 'n' || cote === 's') {
      const zc = cote === 'n' ? P.ZN : P.ZS;
      murX(zc, EM, a, b, -1, h, M_V4_PIERRE, ouv);
      if (o.parapet !== false && h >= HM - 0.1) {
        const zp = cote === 'n' ? zc - EM / 2 + 0.3 : zc + EM / 2 - 0.3;
        murX(zp, 0.6, a, b, h, h + 1.3, M_V4_PIERRE, o.ouvP);
        creneaux(a + 0.4, b - 0.4, zp, zp, h + 1.3, 0.6, { trous: o.trous || 0.12 });
      }
    } else {
      const xc = cote === 'o' ? P.XO : cote === 'e' ? P.XE : P.XI;
      murZ(xc, EM, a, b, -1, h, M_V4_PIERRE, ouv);
      if (o.parapet !== false && h >= HM - 0.1) {
        const xp = cote === 'e' ? xc + EM / 2 - 0.3 : xc - EM / 2 + 0.3;
        murZ(xp, 0.6, a, b, h, h + 1.3, M_V4_PIERRE, o.ouvP);
        creneaux(xp, xp, a + 0.4, b - 0.4, h + 1.3, 0.6, { trous: o.trous || 0.12 });
      }
    }
  };
  // ---- nord
  courtine('n', -95.5, -69.5);
  courtine('n', -60.5, -44.6, { trous: 0.25 });
  courtine('n', -44.6, -41, { h: 6.5, parapet: false });                           // le pan effondré (on saute)
  B(-44.4, -41.2, 6.5, 7.4, -61.5, -59.2, M_V4_PIERRE, { r: 0.18 });                // un bloc tombé, de travers
  courtine('n', -41, -34.5, { trous: 0.3 });
  courtine('n', -25.5, 66.5);
  // ---- sud
  courtine('s', -95.5, -84);
  // la brèche : des pans bas, des gravats (on monte par les rampes)
  B(-84, -82, -1, 7.2, 58.5, 61.5); B(-82, -79.2, -1, 3.6, 58.5, 61.5); B(-79.2, -76.4, -1, 2.0, 58.5, 61.5); B(-76.4, -74, -1, 5.4, 58.5, 61.5);
  B(-80.2, -75.4, -0.2, 2.0, 61.5, 66.5, M_V4_PIERRE, { sh: 2, r: Math.PI });          // la rampe du dehors
  B(-80.2, -75.4, -0.2, 2.0, 53.5, 58.5, M_V4_PIERRE, { sh: 2 });                      // la rampe du dedans
  for (const [x, z, s, a] of [[-82.5, 64, 1.1, 0.4], [-73.5, 63.5, 0.9, 1.1], [-83, 55.5, 1.2, 2.2], [-72.8, 56, 0.8, 0.6], [-77, 67.6, 0.7, 1.7], [-78.5, 52.4, 0.9, 0.2]]) B(x - s / 2, x + s / 2, -0.3, s * 0.8, z - s / 2, z + s / 2, M_V4_PIERRE, { r: a });
  prop('gravats', -81, 0, 57, 0.4); prop('gravats', -74.5, 0, 63, 1.4); prop('gravats', -77.6, 2.0, 60, 0.9);
  pt('breche', -77.8, 2.0, 60, 0);
  courtine('s', -74, -69.5);
  courtine('s', -60.5, -34.5);
  // au bout du chemin de ronde sud, contre la baie murée de la tour du geôlier : un guetteur qu'on a oublié là
  prop('v4_mort', -36.6, HM, 59.4, -Math.PI / 2, { pose: 'adosse', look: { top: '#3e3a34', bottom: '#2a2620' } });
  prop('sac', -37.4, HM, 60.6, 0.4); fouille('guetteur', -37.2, HM + 0.5, 60.2, 'Le sac du guetteur', 'v4_soldat');
  courtine('s', -25.5, 20.5);
  courtine('s', 29.5, 67.5);
  // ---- ouest (le châtelet au milieu)
  courtine('o', -55.5, -11);
  courtine('o', 11, 55.5);
  // ---- est (la poterne)
  courtine('e', -54.5, 55.5, { ouv: [[33.2, 34.8, 0, 2.4]] });
  // ---- le mur de la haute cour (x = −30) : la poterne de la dépense
  courtine('i', -55.5, -7, { ouv: [[-48.75, -47.25, 0, 2.4]] });
  courtine('i', 7, 55.5);
  salle('chemin_ronde', 'le chemin de ronde', -101.5, 73.5, HM, HM + 2.5, -61.5, 61.5, { couvert: false, dessous: false });

  // ------------------------------------------------------------- les tours d'angle et du milieu
  tour({ id: 'no', nom: 'la tour du nord-ouest', cx: -100, cz: -60, H: 17, toit: 'fleche', niveaux: [HM], coffre: 'soldat', portes: [{ cote: 's', u: 0, y: HM, w: 1.5, h: 2.4 }, { cote: 'e', u: 0, y: HM, w: 1.5, h: 2.4 }, { cote: 'e', u: 2.2, y: 0, w: 1.4, h: 2.4 }], vis: { coin: 'no' } });
  tour({ id: 'so', nom: 'la tour du sud-ouest', cx: -100, cz: 60, H: 17, toit: 'fleche', niveaux: [HM], coffre: 'recoin', portes: [{ cote: 'n', u: 0, y: HM, w: 1.5, h: 2.4 }, { cote: 'e', u: 0, y: HM, w: 1.5, h: 2.4 }, { cote: 'n', u: 2.2, y: 0, w: 1.4, h: 2.4 }], vis: { coin: 'so' } });
  tour({ id: 'n1', nom: 'la tour du nord', cx: -65, cz: -60, H: 15.5, toit: 'terrasse', niveaux: [HM], coffre: 'soldat', portes: [{ cote: 'o', u: 0, y: HM, w: 1.5, h: 2.4 }, { cote: 'e', u: 0, y: HM, w: 1.5, h: 2.4 }], vis: { coin: 'ne' } });
  tour({ id: 's1', nom: 'la tour du sud', cx: -65, cz: 60, H: 15.5, toit: 'terrasse', niveaux: [HM], portes: [{ cote: 'o', u: 0, y: HM, w: 1.5, h: 2.4 }, { cote: 'e', u: 0, y: HM, w: 1.5, h: 2.4 }, { cote: 'n', u: 0, y: 0, w: 1.4, h: 2.4 }], vis: { coin: 'se' } });
  // la tour de la cuisine (nord-ouest de la haute cour) : on y arrive du chemin de ronde, par le pan effondré
  tour({ id: 'ni', nom: 'la tour des cuisines', cx: -30, cz: -60, H: 17, toit: 'terrasse', niveaux: [HM], portes: [{ cote: 'o', u: 0, y: HM, w: 1.5, h: 2.4 }, { cote: 's', u: 0, y: HM, w: 1.5, h: 2.4 }, { cote: 'e', u: 0, y: HM, w: 1.5, h: 2.4 }, { cote: 's', u: 2.4, y: 0, w: 1.4, h: 2.4 }], vis: { coin: 'ne' } });
  // la tour du geôlier (sud-ouest de la haute cour) : l'escalier des cachots
  tour({ id: 'si', nom: 'la tour du geôlier', cx: -30, cz: 60, w: 10, H: 17, toit: 'terrasse', niveaux: [HM], portes: [{ cote: 'n', u: 0, y: HM, w: 1.5, h: 2.4 }, { cote: 'e', u: 0, y: HM, w: 1.5, h: 2.4 }, { cote: 'o', u: 0, y: HM, w: 1.5, h: 2.4, muree: true }, { cote: 'e', u: -3.2, y: 0, w: 1.5, h: 2.5 }], vis: { coin: 'ne' } });
  tour({ id: 's2', nom: 'la tour du sud-est', cx: 25, cz: 60, H: 15.5, toit: 'terrasse', niveaux: [HM], coffre: 'recoin', portes: [{ cote: 'o', u: 0, y: HM, w: 1.5, h: 2.4 }, { cote: 'e', u: 0, y: HM, w: 1.5, h: 2.4 }, { cote: 'n', u: 0, y: 0, w: 1.4, h: 2.4 }], vis: { coin: 'se' } });
  tour({ id: 'se', nom: 'la tour de l’angle', cx: 72, cz: 60, H: 17, toit: 'fleche', niveaux: [HM], coffre: 'soldat', portes: [{ cote: 'o', u: 0, y: HM, w: 1.5, h: 2.4 }, { cote: 'n', u: 0, y: HM, w: 1.5, h: 2.4 }, { cote: 'o', u: -2.2, y: 0, w: 1.4, h: 2.4 }], vis: { coin: 'se' } });
  // (les baies basses des tours restent ouvertes : des arcs sans vantail)

  // ------------------------------------------------------------- le châtelet (la porte de l'ouest) et le pont-levis
  {
    const x0 = -108, x1 = -90, z0 = -11, z1 = 11, H = 14, e = 1.5;
    // le passage (z −3 … 3), voûté à 6 m ; deux corps de part et d'autre
    murX(-3.25, 0.5, x0, x1, -1, 6.5, M_V4_PIERRE, [[-98.6, -97.0, 0, 2.4]]);       // mur du passage, côté nord (porte de la loge)
    murX(3.25, 0.5, x0, x1, -1, 6.5, M_V4_PIERRE, [[-98.6, -97.0, 0, 2.4]]);        // côté sud (porte du corps de garde)
    B(x0, x1, 6.0, 6.6, -3.5, 3.5, M_V4_PIERRE, { plafond: true });                    // la voûte du passage
    // les murs extérieurs : le passage s'ouvre à l'ouest (sous le pont) et à l'est (la basse-cour)
    murZ(x0 + e / 2, e, z0, z1, -P.FOSSE.p - 1, H, M_V4_PIERRE, [[-3, 3, 0, 6.0]]);
    murZ(x1 - e / 2, e, z0, z1, -1, H, M_V4_PIERRE, [[-3, 3, 0, 6.0], [-8.4, -7.0, 8.2, 10.4], [7.0, 8.4, 8.2, 10.4]]);
    murX(z0 + e / 2, e, x0 + e, x1 - e, -1, H, M_V4_PIERRE);
    murX(z1 - e / 2, e, x0 + e, x1 - e, -1, H, M_V4_PIERRE);
    // planchers : la salle du treuil (y 7) au-dessus du passage et des deux corps ; la terrasse (y 14)
    B(x0 + e, x1 - e, 6.6, 7.0, z0 + e, z1 - e, M_PLANKS, { plafond: true });
    B(x0 + e, x1 - e, H - 0.4, H, z0 + e, z1 - e, M_V4_DALLES);
    murX(z0 + 0.3, 0.6, x0, x1, H, H + 1.3); murX(z1 - 0.3, 0.6, x0, x1, H, H + 1.3);
    murZ(x0 + 0.3, 0.6, z0 + 0.6, z1 - 0.6, H, H + 1.3); murZ(x1 - 0.3, 0.6, z0 + 0.6, z1 - 0.6, H, H + 1.3);
    creneaux(x0 + 0.3, x0 + 0.3, z0 + 0.8, z1 - 0.8, H + 1.3, 0.6); creneaux(x1 - 0.3, x1 - 0.3, z0 + 0.8, z1 - 0.8, H + 1.3, 0.6);
    creneaux(x0 + 0.8, x1 - 0.8, z0 + 0.3, z0 + 0.3, H + 1.3, 0.6); creneaux(x0 + 0.8, x1 - 0.8, z1 - 0.3, z1 - 0.3, H + 1.3, 0.6);
    // deux échauguettes aux angles de la façade (la silhouette)
    for (const z of [z0 + 1.6, z1 - 1.6]) { B(x0 - 1.2, x0 + 2.0, H - 2, H + 3.5, z - 1.6, z + 1.6); B(x0 - 1.4, x0 + 2.2, H + 3.5, H + 3.8, z - 1.8, z + 1.8, M_SLATE); B(x0 - 0.8, x0 + 1.6, H + 3.8, H + 6.8, z - 1.2, z + 1.2, M_SLATE, { sh: 3 }); }
    // l'escalier à vis du corps de garde monte à la salle du treuil, puis à la terrasse
    vis('chatelet', [-93.0, 0, 8.2], [-93.4, 7, 6.4], V4_TEXTES.vis);
    vis('chatelet2', [-105.2, 7, -8.2], [-104.6, H, -6.8], V4_TEXTES.vis);
    // la loge du portier (nord) et le corps de garde (sud), au rez-de-chaussée
    porte(-97.8, -3.25, 0, Math.PI, 1.4, 2.35, { id: 'loge', style: 'rustique' });     // (le +z regarde la loge, au nord)
    porte(-97.8, 3.25, 0, 0, 1.4, 2.35, { id: 'garde', style: 'rustique' });
    salle('loge', 'la loge du portier', x0 + e, x1 - e, 0, 6.6, z0 + e, -3.5);
    salle('corps_garde', 'le corps de garde du châtelet', x0 + e, x1 - e, 0, 6.6, 3.5, z1 - e);
    salle('passage', 'le passage du châtelet', x0, x1, 0, 6, -3, 3, { abri: [x0 + e, x1 - e, -3, 3] });
    salle('treuil', 'la salle du treuil', x0 + e, x1 - e, 7, H - 0.4, z0 + e, z1 - e);
    lieu('v4_chatelet', -99, 0, 14);
    V.abris.push({ x: CX - 99, y: Y0 + 3, z: CZ, r: 3, nom: 'le passage du châtelet' }, { x: CX - 99, y: Y0 + 9, z: CZ, r: 7, nom: 'la salle du treuil' });
    // la loge : le portier, sa table, son registre, la clé de la poterne au clou
    prop('table', -101.5, 0, -7.5, 0); prop('chaise', -101.5, 0, -6.6, Math.PI);
    prop('v4_mort', -101.5, 0, -6.5, Math.PI, { pose: 'assis', look: { top: '#4a3e34', bottom: '#2e2a26', hat: 'bonnet' } });
    objet('registre', 'v4_registre', -101.8, 0.79, -7.7, 0.2);
    objet('cle_poterne', 'v4_cle_poterne', -106.2, 1.55, -6.0, Math.PI / 2);
    prop('lanterne_cachot', -100.5, 0.79, -7.9, 0);
    prop('tonneau_vieux', -95, 0, -9.2, 0); prop('coffre_vieux', -93.6, 0, -9.0, 0);
    fouille('loge', -93.6, 0.6, -8.4, 'Le coffre du portier', 'v4_coffre');
    // le corps de garde : des châlits, une table, des armes
    for (let k = 0; k < 4; k++) prop('paillasse', -105.4 + k * 3.4, 0, 8.6, Math.PI / 2);
    prop('b1_ratelier', -93.2, 0, 5.2, -Math.PI / 2); prop('g1_cuirasse_pose', -93.4, 0, 8.2, -Math.PI / 2);
    prop('table', -99, 0, 6.0, 0); prop('banc', -99, 0, 5.2, 0); prop('banc', -99, 0, 6.8, Math.PI);
    fouille('garde_chatelet', -105.0, 0.4, 8.6, 'Sous une paillasse', 'v4_soldat');
    // la salle du treuil : le treuil (face au mur ouest), le brasero du vieil homme, son banc
    prop('v4_treuil', -104.4, 7, 0, -Math.PI / 2, null, 1.3);
    inter('v4_levier', 'v4_lev_pont', -103.0, 8.2, 0, V4_TEXTES.treuilTitre, { id: 'pont' });
    lire('chatelet', -105.9, 9.6, -1.6);
    prop('brasero', -99.0, 7, 4.6, 0, { lit: true }); prop('lanterne_cachot', -102.6, 7, -2.0, 0.4);
    prop('banc', -97.6, 7, 6.6, Math.PI / 2);
    prop('b1_ratelier', -92.8, 7, -6.0, -Math.PI / 2);
    for (let k = 0; k < 3; k++) prop('v4_meurtriere', -106.4, 7.8, -7 + k * 3.5, Math.PI / 2);
    V.thibaud = { x: CX - 98.4, y: Y0 + 7, z: CZ + 5.6, r: -Math.PI / 2 - 0.4 };
    inter('v4_parler', 'v4_thibaud', -98.6, 8.1, 5.0, V4_THIBAUD.titre, { qui: 'thibaud' });
    // au bout du pont (quand le vieil homme n'est plus au treuil)
    V.thibaudBout = { x: CX + P.FOSSE.x0 - 1.4, y: Y0, z: CZ + 1.2, r: -Math.PI / 2 };
    inter('v4_parler', 'v4_thibaud_bout', P.FOSSE.x0 - 1.4, 0.9, 1.2, 'Au bout du pont', { qui: 'thibaud_bout' });
    pt('treuil', -100.5, 7, -2, -Math.PI / 2);
    // le pont-levis : charnière sur la face ouest, le tablier sur le fossé (vers −x)
    const L = P.FOSSE.x1 - P.FOSSE.x0 + 0.6, br = { key: 'v4_pont', x: CX + x0, y: Y0 + 0.0, z: CZ, r: -Math.PI / 2, w: 5.2, L, a: Math.PI / 2 * 0.98, up: true, chainY: 9.2, v4: 'pont' };
    Z.bridges.push(br); V.ponts.pont = br;
    // gardiens et rôdeurs
    place('chatelet_passage', 'gardien', -96, 0, 0, 3, { cap: -Math.PI / 2, garde: true });
    place('chatelet_echauguette', 'gardien', x0 + 0.4, H + 3.8, z0 + 1.6, 1.5, { perche: Y0 + H + 3.8, cap: -Math.PI / 2, espece: 'gargouille' });
  }

  // ------------------------------------------------------------- la basse-cour
  lieu('v4_chateau', -14, 0, 120);
  lieu('v4_basse_cour', -64, 0, 40);
  salle('basse_cour', 'la basse-cour', -98.5, -31.5, 0, 30, -58.5, 58.5, { couvert: false, dessous: false });
  // les écuries, contre la courtine nord : le fenil au fond, une échelle ; l'échelle du fenil vers le chemin de ronde
  {
    const x0 = -92, x1 = -70, z0 = -58.5, z1 = -48;
    murZ(x0, 0.8, z0, z1, -0.5, 4.4, M_V4_PIERRE); murZ(x1, 0.8, z0, z1, -0.5, 4.4, M_V4_PIERRE);
    murX(z1, 0.8, x0 - 0.4, x1 + 0.4, -0.5, 1.2, M_V4_PIERRE, [[-82.5, -79.5, -0.5, 1.2]]); // un muret devant, l'entrée au milieu
    for (const x of [x0 + 0.2, -86.5, -83, -79, -75.5, x1 - 0.2]) B(x - 0.15, x + 0.15, 1.2, 4.4, z1 - 0.15, z1 + 0.15, M_LOGS);
    B(x0 - 0.6, x1 + 0.6, 4.4, 7.2, z0 - 0.2, z1 + 0.8, M_SLATE, { sh: 1 });
    B(x0 + 0.4, x1 - 0.4, 2.9, 3.2, z0, -53, M_PLANKS, { plafond: true });          // le fenil
    vis('fenil', [-80, 0, -51.6], [-80, 3.2, -54.6], V4_TEXTES.echelle);
    prop('v4_echelle', -80, 0, -52.6, 0, { h: 3.4 });
    for (let k = 0; k < 6; k++) prop('mangeoire', -89 + k * 3.6, 0, -57.6, 0);
    prop('ossements', -84.5, 0, -55.6, 0.6); prop('ossements', -76.5, 0, -55.2, 2.1);
    prop('g1_selle', -90.8, 0, -51, Math.PI / 2);
    for (const [x, z] of [[-88, -56.8], [-85, -55.6], [-74, -56.4], [-72.5, -55.0]]) prop('botte_foin', x, 3.2, z, rnd() * 3);
    prop('v4_coffre', -73.4, 3.2, -57.4, 0, { f: 'fenil' }); fouille('fenil', -73.4, 3.9, -56.9, 'Un coffre, sous le foin', 'v4_coffre');
    lire('ecurie', -75.5, 2.2, -48.4);
    salle('ecuries', 'les écuries', x0, x1, 0, 4.4, z0, z1, { abri: [x0 + 0.4, x1 - 0.4, z0, z1] });
    V.abris.push({ x: CX - 81, y: Y0 + 2, z: CZ - 53, r: 9, nom: 'les écuries' });
    place('ecuries', 'paisible', -81, 0, -52, 6);
  }
  // la caserne, contre la courtine ouest
  {
    const x0 = -98.5, x1 = -88, z0 = 16, z1 = 46;
    murX(z0, 1, x0, x1 + 0.5, -0.5, 5, M_V4_PIERRE); murX(z1, 1, x0, x1 + 0.5, -0.5, 5, M_V4_PIERRE);
    murZ(x1, 1, z0 + 0.5, z1 - 0.5, -0.5, 5, M_V4_PIERRE, [[29.3, 30.7, 0, 2.4], [22, 23.2, 1.4, 3.2], [37, 38.2, 1.4, 3.2]]);
    B90((x0 + x1) / 2 + 0.4, (z0 + z1) / 2, 5, 8.2, x1 - x0 + 1.4, z1 - z0 + 1.6, M_SLATE, { sh: 1 });
    porte(x1, 30, 0, -Math.PI / 2, 1.3, 2.35, { id: 'caserne', style: 'garde' });
    for (let k = 0; k < 6; k++) { prop('paillasse', -96.6, 0, 18.5 + k * 4.4, 0); if (k % 2) prop('coffre_vieux', -94.6, 0, 18.5 + k * 4.4, Math.PI / 2); }
    prop('table', -92, 0, 30, Math.PI / 2); prop('banc', -91.2, 0, 30, -Math.PI / 2); prop('banc', -92.8, 0, 30, Math.PI / 2);
    prop('b1_ratelier', -89, 0, 20, -Math.PI / 2); prop('b1_ratelier', -89, 0, 40, -Math.PI / 2);
    prop('g1_cuirasse_pose', -89.2, 0, 43.6, -Math.PI / 2); prop('g1_tambour', -90, 0, 18, 0);
    prop('v4_mort', -93.2, 0, 44.2, Math.PI, { pose: 'adosse', look: { top: '#3e3a34', bottom: '#2a2620' } });
    fouille('caserne1', -94.6, 0.5, 23.0, 'Un coffre de soldat', 'v4_soldat');
    fouille('caserne2', -94.6, 0.5, 31.8, 'Un coffre de soldat', 'v4_soldat');
    fouille('caserne3', -94.6, 0.5, 40.6, 'Un coffre de soldat', 'v4_soldat');
    lire('caserne', -96.4, 0.6, 27.6);
    salle('caserne', 'la caserne', x0, x1, 0, 5, z0, z1);
    V.abris.push({ x: CX - 93, y: Y0 + 2, z: CZ + 31, r: 12, nom: 'la caserne' });
    place('caserne', 'gardien', -92.5, 0, 34, 4, { heures: [6, 20] });
  }
  // la forge : un appentis ouvert, l'âtre, l'enclume
  {
    for (const [x, z] of [[-56, -34], [-46, -34], [-56, -26], [-46, -26]]) B(x - 0.2, x + 0.2, -0.3, 3.6, z - 0.2, z + 0.2, M_LOGS);
    B(-56.8, -45.2, 3.6, 5.2, -34.8, -25.2, M_SLATE, { sh: 1 });
    B(-55.4, -52.6, -0.2, 1.1, -33.6, -31.8, M_V4_PIERRE); B(-55.6, -52.4, 2.0, 2.8, -33.8, -31.6, M_V4_PIERRE); B(-54.6, -53.4, 2.8, 5.6, -33.4, -32.2, M_V4_PIERRE);
    prop('enclume', -50.5, 0, -30.5, 0.3); prop('fers_rack', -46.6, 0, -32.6, -Math.PI / 2); prop('meule_aiguiser', -49, 0, -27, 1.2);
    prop('tonneau_vieux', -47.2, 0, -27.2, 0); fouille('forge', -54, 1.2, -32.6, 'Les cendres de la forge', 'v4_recoin');
    salle('forge', 'la forge', -56, -46, 0, 3.6, -34, -26);
  }
  // le puits de la basse-cour
  {
    const x = -66, z = 4;
    murX(z - 0.9, 0.35, x - 1.1, x + 1.1, -0.5, 0.9, M_V4_PIERRE); murX(z + 0.9, 0.35, x - 1.1, x + 1.1, -0.5, 0.9, M_V4_PIERRE);
    murZ(x - 0.92, 0.35, z - 0.72, z + 0.72, -0.5, 0.9, M_V4_PIERRE); murZ(x + 0.92, 0.35, z - 0.72, z + 0.72, -0.5, 0.9, M_V4_PIERRE);
    B(x - 0.75, x + 0.75, 0.05, 0.1, z - 0.72, z + 0.72, M_DARK);
    prop('v4_puits', x, 0, z, 0);
  }
  // le cimetière : un muret, des tombes, une fosse ouverte
  {
    const x0 = -58, x1 = -38, z0 = 26, z1 = 50;
    murX(z0, 0.5, x0, x1, -0.4, 1.0, M_V4_PIERRE, [[-49.5, -46.5, -0.4, 1.0]]); murX(z1, 0.5, x0, x1, -0.4, 1.0, M_V4_PIERRE);
    murZ(x0, 0.5, z0, z1, -0.4, 1.0, M_V4_PIERRE); murZ(x1, 0.5, z0, z1, -0.4, 1.0, M_V4_PIERRE);
    let k = 0;
    for (let z = 30; z < 48; z += 4) for (let x = -55; x < -40; x += 4.2) { if (k++ % 3 === 2) continue; prop(rnd() < 0.5 ? 'tombe' : 'croix', x + (rnd() - 0.5), 0, z + (rnd() - 0.5), Math.PI + (rnd() - 0.5) * 0.3); }
    prop('trou', -41.5, 0, 46.5, 0.2); prop('ossements', -41.2, 0, 47.8, 1.0);
    lire('cimetiere', -46.0, 0.6, 25.4);
    fouille('fosse_ouverte', -41.5, 0.3, 46.5, 'La fosse ouverte', 'v4_recoin');
    lieu('v4_cimetiere', -48, 38, 14);
    place('cimetiere', 'paisible', -48, 0, 38, 8, { heures: [20, 5] });
  }
  // des arbres morts, des charrettes, des tonneaux
  for (const [x, z] of [[-90, -30], [-84, -22], [-74, -34], [-88, -6], [-80, 22], [-70, 36], [-62, -40], [-36, 30], [-75, 48], [-62, 50]]) O.objet('deadtree', CX + x + (rnd() - 0.5) * 2, CZ + z + (rnd() - 0.5) * 2);
  prop('charrette_renversee', -60, 0, -12, 0.7); prop('tonneau_vieux', -44, 0, -46, 0); prop('tonneau_vieux', -43.2, 0, -45.2, 0); prop('caisse', -42.6, 0, -47, 0.3);
  prop('charrette_renversee', -38, 0, 14, 2.6);
  // l'escalier du chemin de ronde nord (le long de la courtine, du côté de la cour)
  escalier(-45.4, -57.6, 0, HM, '-x', 1.8, 0.42);
  place('basse_cour_1', 'rodeur', -72, 0, -14, 22, { heures: [19, 6] });
  place('basse_cour_2', 'rodeur', -58, 0, 22, 18);
  place('ronde_nord', 'rodeur', -80, HM, -60, 14, { perche: Y0 + HM, ronde: [[-92, -60], [-62, -60]] });
  place('ronde_ouest', 'rodeur', -100, HM, 30, 14, { perche: Y0 + HM, ronde: [[-100, 15], [-100, 50]] });

  // ------------------------------------------------------------- la porte de la haute cour (la herse) et la poterne de la dépense
  {
    const x0 = -35, x1 = -25, z0 = -7, z1 = 7, H = 17, e = 1.3;
    murX(-2.5, 0.5, x0, x1, -1, 5.8, M_V4_PIERRE); murX(2.5, 0.5, x0, x1, -1, 5.8, M_V4_PIERRE);
    B(x0, x1, 5.0, 5.6, -2.75, 2.75, M_V4_PIERRE, { plafond: true });                   // la voûte
    murZ(x0 + e / 2, e, z0, z1, -1, H, M_V4_PIERRE, [[-2.25, 2.25, 0, 5.0], [-4.3, -2.9, HM, HM + 2.4]]);
    murZ(x1 - e / 2, e, z0, z1, -1, H, M_V4_PIERRE, [[-2.25, 2.25, 0, 5.0], [3.0, 4.6, 6.0, 8.4], [-4.3, -2.9, HM, HM + 2.4]]);
    murX(z0 + e / 2, e, x0 + e, x1 - e, -1, H, M_V4_PIERRE, [[-30.75, -29.25, HM, HM + 2.4]]);
    murX(z1 - e / 2, e, x0 + e, x1 - e, -1, H, M_V4_PIERRE, [[-30.75, -29.25, HM, HM + 2.4]]);
    B(x0 + e, x1 - e, 5.6, 6.0, z0 + e, z1 - e, M_PLANKS, { plafond: true });
    B(x0 + e, x1 - e, HM - 0.35, HM, z0 + e, z1 - e, M_PLANKS, { plafond: true });
    B(x0 + e, x1 - e, H - 0.4, H, z0 + e, z1 - e, M_V4_DALLES);
    murX(z0 + 0.3, 0.6, x0, x1, H, H + 1.3); murX(z1 - 0.3, 0.6, x0, x1, H, H + 1.3);
    murZ(x0 + 0.3, 0.6, z0 + 0.6, z1 - 0.6, H, H + 1.3); murZ(x1 - 0.3, 0.6, z0 + 0.6, z1 - 0.6, H, H + 1.3);
    creneaux(x0 + 0.3, x0 + 0.3, z0 + 0.8, z1 - 0.8, H + 1.3, 0.6); creneaux(x0 + 0.8, x1 - 0.8, z0 + 0.3, z0 + 0.3, H + 1.3, 0.6); creneaux(x0 + 0.8, x1 - 0.8, z1 - 0.3, z1 - 0.3, H + 1.3, 0.6);
    // la herse, côté basse-cour ; sa collision (un bloc caché qu'on lève)
    prop('v4_herse', -33.7, 0, 0, Math.PI / 2, { w: 4.5, h: 5, id: 'herse' });
    V.herses.herse = { blk: B(-33.85, -33.55, 0, 5, -2.25, 2.25, M_V4_PIERRE, { hidden: true, v4herse: 'herse' }), y: Y0 };
    // la roue de la herse, à l'étage (on n'y monte que de la haute cour)
    prop('v4_levier', -27.2, 6, -4.2, Math.PI);
    inter('v4_levier', 'v4_lev_herse', -27.4, 7.2, -3.4, V4_TEXTES.herseTitre, { id: 'herse' });
    inter('v4_lire', 'v4_herse_dehors', -34.6, 1.6, 0, '', { t: null, texte: V4_TEXTES.herseDehors });
    // l'escalier de l'étage, contre la face est (de la haute cour), et son palier
    escalier(-24.1, 17.0, 0, 6.0, '-z', 1.8, 0.48);
    B(-25, -23.2, -0.6, 6.0, 2.6, 8.0);
    B(-25, -23.2, 6.0, 7.1, 2.6, 2.9); B(-23.5, -23.2, 6.0, 7.1, 2.9, 8.0);
    // l'étage du chemin de ronde (y 11) : vis
    vis('herse_vis', [-27.4, 6, 4.4], [-27.4, HM, 4.4], V4_TEXTES.vis);
    vis('herse_vis2', [-32.4, HM, -4.4], [-32.4, H, -4.4], V4_TEXTES.vis);
    salle('porte_haute', 'la porte de la haute cour', x0, x1, 0, 5, -2.25, 2.25, { abri: [x0 + e, x1 - e, -2.25, 2.25] });
    salle('herse_etage', 'la salle de la herse', x0 + e, x1 - e, 6, HM - 0.35, z0 + e, z1 - e);
    salle('herse_haut', 'la salle haute de la porte', x0 + e, x1 - e, HM, H - 0.4, z0 + e, z1 - e);
    V.abris.push({ x: CX - 30, y: Y0 + 2.5, z: CZ, r: 3, nom: 'la porte de la haute cour' });
    place('porte_haute', 'gardien', -27.5, 0, 0, 3, { cap: -Math.PI / 2, garde: true });
    pt('herse_dehors', -37, 0, 0, Math.PI / 2); pt('herse_dedans', -22, 0, 0, -Math.PI / 2);
    // la poterne de la dépense (barrée du côté de la haute cour)
    porte(-30, -48, 0, Math.PI / 2, 1.4, 2.35, { id: 'depense', barre: 'dedans', style: 'poterne', ep: 3 });
    pt('depense_dehors', -33, 0, -48, Math.PI / 2); pt('depense_dedans', -27, 0, -48, -Math.PI / 2);
  }

  // ------------------------------------------------------------- la haute cour : cuisines, grand-salle, logis (contre la courtine nord)
  lieu('v4_cour', 20, 10, 40);
  salle('cour', 'la haute cour', -28.5, 70.5, 0, 30, -58.5, 58.5, { couvert: false, dessous: false });
  const ZF = -42; // la façade sud du corps de logis
  // ---- les cuisines (x −24 … −6)
  {
    const x0 = -24, x1 = -6, H = 9;
    murZ(x0, 1.2, -58.5, ZF + 0.6, -0.5, H, M_V4_PIERRE, [[-50.8, -49.2, 0, 2.4]]);
    murX(ZF, 1.2, x0 - 0.6, x1 + 0.6, -0.5, H, M_V4_PIERRE, [[-15.8, -14.2, 0, 2.5], [-21, -19.8, 3.2, 5.6], [-10.6, -9.4, 3.2, 5.6]]);
    murZ(x1, 1.2, -58.5, ZF - 0.6, -0.5, 12, M_V4_PIERRE, [[-57.2, -55.8, 5.2, 7.6], [-46.5, -45.1, 0, 2.4]]);   // le mur de la grand-salle (la tribune y donne, murée en apparence)
    B(x0 - 0.8, x1 + 0.6, H, H + 4, -58.5, ZF + 0.8, M_SLATE, { sh: 1 });
    // la cheminée : les jambages, le manteau, le conduit qui passe le toit
    B(-19.2, -18.2, -0.2, 3.2, -58.5, -55.6, M_V4_PIERRE); B(-11.8, -10.8, -0.2, 3.2, -58.5, -55.6, M_V4_PIERRE);
    B(-19.4, -10.6, 3.2, 4.4, -58.5, -55.4, M_V4_PIERRE); B(-16.2, -13.8, 4.4, 15.0, -58.5, -56.8, M_V4_PIERRE);
    prop('c2_chaudron', -15, 0, -57.0, 0); prop('b2_marmite', -17.6, 0, -57.4, 0);
    // le grenier de la cuisine (au-dessus de l'office, à l'est) : une cache qu'on n'atteint que par la tribune
    B(-12.4, -6.6, 5.0, 5.3, -57.9, -48.6, M_PLANKS, { plafond: true });
    murX(-48.6, 0.4, -12.4, -6.6, 5.3, 8.4, M_PLANKS); murZ(-12.4, 0.4, -57.9, -48.8, 5.3, 8.4, M_PLANKS);
    prop('v4_coffre', -8.4, 5.3, -51, -Math.PI / 2, { f: 'grenier' }); fouille('grenier', -8.9, 6.0, -51, 'Un coffre, sous la poussière', 'v4_recoin', [['huile', 1]]);
    prop('sacs', -10.8, 5.3, -56.6, 0); prop('tonneau_vieux', -7.5, 5.3, -56.8, 0);
    salle('grenier', 'le grenier des cuisines', -12.4, -6.6, 5.3, 8.4, -57.9, -48.6);
    // la salle : tables, huche, four, étagères
    prop('table', -18, 0, -48, 0); prop('table', -12, 0, -48, 0); prop('banc', -18, 0, -47.1, Math.PI); prop('banc', -12, 0, -47.1, Math.PI);
    prop('four_pain', -22.4, 0, -55.5, Math.PI / 2); prop('etagere', -23.2, 0, -45.5, Math.PI / 2, { kind: 'bocaux' });
    prop('tonneau_vieux', -7.3, 0, -44, 0); prop('tonneau_vieux', -8.1, 0, -43.2, 0); prop('jarre', -22.8, 0, -43.4, 0);
    prop('v4_mort', -15.6, 0, -54.0, 0.3, { pose: 'adosse', look: { top: '#6a5a4a', bottom: '#4a3e34', hairStyle: 'chignon', dress: true } });
    lire('cuisine', -20.4, 1.5, -55.4);
    prop('coffre_vieux', -23.2, 0, -51.8, Math.PI / 2);
    objet('cle_chapelle', 'v4_cle_chapelle', -23.0, 0.48, -51.8, Math.PI / 2);
    fouille('cuisine', -12.6, 0.9, -48.6, 'Le tiroir de la table', 'v4_cuisine');
    // la cave : un escalier dans l'angle
    vis('cave', [-8.4, 0, -44.2], [-14, P.CAVE, -49], V4_TEXTES.descendre, { texte: 'Vous descendez à la cave.', texte2: 'Vous remontez aux cuisines.' });
    salle('cuisines', 'les cuisines', x0, x1, 0, H, -58.5, ZF);
    lieu('v4_cuisines', -15, -50, 9);
    V.abris.push({ x: CX - 15, y: Y0 + 3, z: CZ - 50, r: 8, nom: 'les cuisines' });
    place('cuisines', 'paisible', -14, 0, -51, 5);
    // l'allée des cuisines (entre la tour, le mur de la haute cour et les cuisines) : un portail de bois
    porte(-24, -50, 0, Math.PI / 2, 1.4, 2.35, { id: 'cuisines_o', style: 'rustique' });
    porte(-15, ZF, 0, Math.PI, 1.5, 2.4, { id: 'cuisines_s', style: 'rustique' });
  }
  // ---- la grand-salle (x −6 … 32)
  {
    const x0 = -6, x1 = 32, H = 12;
    murX(ZF, 1.2, x0 + 0.6, x1 - 0.6, -0.5, H, M_V4_PIERRE, [[11.7, 14.3, 0, 3.4], [5.4, 6.6, 5.4, 8], [19.4, 20.6, 4, 8], [25.4, 26.6, 4, 8]]);
    murZ(x1, 1.2, -58.5, ZF + 0.6, -0.5, H, M_V4_PIERRE, [[-46.7, -45.3, 0.6, 3.0]]);
    // le toit a cédé au-dessus des tables (x 14.4 … 20.8) : il reste une poutre, une autre pend ; les gravats dessous
    B(x0 - 0.6, 14.4, H, H + 6.5, -58.5, ZF + 1.0, M_SLATE, { sh: 1 }); B(20.8, x1 + 0.6, H, H + 6.5, -58.5, ZF + 1.0, M_SLATE, { sh: 1 });
    B(16.5, 16.8, H - 0.3, H, -58.5, ZF - 0.6, M_PLANKS); B(18.7, 19.0, H - 0.3, H, -58.5, -51.5, M_PLANKS);
    B(15.4, 17.2, -0.1, 0.55, -50.6, -48.8, M_V4_PIERRE, { r: 0.35 }); B(16.4, 17.4, 0.55, 0.95, -50.2, -49.2, M_V4_PIERRE, { r: 0.9 });
    B(17.6, 18.8, -0.1, 0.45, -53.4, -52.2, M_V4_PIERRE, { r: -0.5 }); B(19.0, 20.0, -0.1, 0.35, -46.2, -45.2, M_V4_PIERRE, { r: 1.2 });
    B(18.2, 20.4, -0.1, 0.1, -48.6, -47.2, M_SLATE, { r: 0.6 }); B(15.0, 16.4, -0.1, 0.1, -55.0, -53.8, M_SLATE, { r: -0.3 });
    B(19.85, 20.15, -0.05, 0.25, -53.4, -46.6, M_PLANKS, { r: 0.3 });                     // la poutre tombée
    // l'estrade, au fond (est) ; deux cheminées au mur nord
    B(23.6, 31.4, -0.2, 0.6, -57.9, ZF - 0.6, M_V4_DALLES); B(23.0, 23.6, -0.2, 0.3, -57.9, ZF - 0.6, M_V4_DALLES);
    for (const xc of [4, 16]) { B(xc - 2.2, xc - 1.4, -0.2, 2.6, -58.5, -56.4, M_V4_PIERRE); B(xc + 1.4, xc + 2.2, -0.2, 2.6, -58.5, -56.4, M_V4_PIERRE); B(xc - 2.4, xc + 2.4, 2.6, 3.6, -58.5, -56.2, M_V4_PIERRE); B(xc - 0.9, xc + 0.9, 3.6, 18.6, -58.5, -57.2, M_V4_PIERRE); }
    // la tribune, à l'ouest (y 5) : son garde-corps, l'escalier contre le mur sud
    B(x0 + 0.6, -1.0, 4.7, 5.0, -57.9, ZF - 0.6, M_PLANKS, { plafond: true });
    murZ(-1.2, 0.3, -57.9, -45.6, 5.0, 6.0, M_PLANKS);
    escalierSuspendu(8.6, -43.4, 0, 5.0, '-x', 1.4, 0.6, M_V4_PIERRE);
    B(-1.6, 0.6, 4.6, 5.0, -44.2, ZF - 0.6, M_V4_PIERRE);
    // la cache au-dessus des cuisines : une porte murée en apparence (mur creux) dans le mur ouest, sur la tribune
    V.murs.tribune = { blocs: [B(-6.62, -5.38, 5.2, 7.6, -57.2, -55.8, M_V4_PIERRE, { v4mur: 'tribune' })], nom: 'tribune' };
    prop('v4_fissure', -5.35, 5.0, -56.5, Math.PI / 2, { mur: 'tribune' });
    inter('v4_mur', 'v4_mur_tribune', -4.9, 6.2, -56.5, '', { id: 'tribune' });
    // les tables, le siège du sire (tourné vers le mur), les bancs
    for (let k = 0; k < 3; k++) { prop('table', 27.4, 0.6, -55 + k * 1.45, Math.PI / 2); prop('v4_couverts', 27.4, 1.39, -55 + k * 1.45, Math.PI / 2, { v: k }); }
    prop('v4_trone', 29.4, 0.6, -52.8, Math.PI / 2 + 0.15);
    lire('table', 28.0, 1.6, -52.8);
    for (const zr of [-52.5, -47.5]) for (let k = 0; k < 3; k++) { const x = 1 + k * 5.4; prop('table', x, 0, zr, 0); prop('banc', x, 0, zr - 0.85, 0); prop('banc', x, 0, zr + 0.85, Math.PI); if (rnd() < 0.6) prop('v4_couverts', x, 0.79, zr, 0, { v: k }); }
    prop('v4_tapisserie', 10, 0.6, -57.85, 0, { v: 0, w: 2.6, h: 3.6 }); prop('v4_tapisserie', 22, 0.6, -57.85, 0, { v: 1, w: 2.6, h: 3.6 }); prop('v4_tapisserie', 31.35, 1.0, -48, -Math.PI / 2, { v: 2, w: 3.2, h: 4.4 });
    for (const x of [2, 12, 22]) prop('v4_banniere', x, 4.8, ZF - 0.62, Math.PI, { h: 5 });
    prop('v4_lustre', 27.4, 9.2, -51, 0, { lit: true, h: 6.2 }); prop('v4_lustre', 10, 9.2, -50, 0, { lit: true, h: 5.5 });
    prop('chandelier', 24.6, 0.6, -43.6, 0, { lit: false });
    prop('v4_mort', 6.8, 0, -51.6, 0.4, { pose: 'assis', look: { top: '#5a4a3a', bottom: '#3a302a' } });
    fouille('salle_coffre', 30.6, 1.2, -44.2, 'Un coffre, au pied de l’estrade', 'v4_coffre');
    prop('v4_coffre', 30.6, 0.6, -43.6, Math.PI, { f: 'salle_coffre' });
    prop('banc', 21.4, 0, -43.9, 1.9); prop('table', 22.6, 0, -55.4, 0.25); prop('ossements', 16.0, 0, -46.4, 2.2);
    salle('grand_salle', 'la grand-salle', x0, x1, 0, H, -58.5, ZF, { trous: [[14.4, 20.8, -58.5, ZF]] });
    salle('tribune', 'la tribune de la grand-salle', x0, -1.2, 5, H, -58.5, ZF);
    lieu('v4_grand_salle', 13, -50, 16);
    V.abris.push({ x: CX + 4, y: Y0 + 3, z: CZ - 50, r: 8.5, nom: 'la grand-salle' }, { x: CX + 26.5, y: Y0 + 3, z: CZ - 50, r: 6, nom: 'la grand-salle' });
    place('grand_salle', 'gardien', 26, 0.6, -50, 6, { cap: -Math.PI / 2 });
    place('grand_salle_rodeur', 'rodeur', 10, 0, -50, 12, { heures: [21, 5] });
    porte(13, ZF, 0, Math.PI, 2.5, 3.3, { id: 'salle_s', style: 'double' });
    porte(-6, -45.8, 0, Math.PI / 2, 1.4, 2.35, { id: 'salle_cuisines', style: 'rustique' });
    porte(32, -46, 0.6, Math.PI / 2, 1.3, 2.35, { id: 'salle_logis', style: 'garde' });
    B(32.6, 33.4, -0.2, 0.3, -46.8, -45.2, M_V4_DALLES);                                  // une marche, du côté du logis
  }
  // ---- le logis (x 32 … 56) : deux étages ; les latrines
  {
    const x0 = 32, x1 = 56, H = 11, YE = 5.6;
    murX(ZF, 1.2, x0 + 0.6, x1 + 0.6, -0.5, H, M_V4_PIERRE, [[43.3, 44.7, 0, 2.4], [36.4, 37.6, 1.6, 3.6], [49.4, 50.6, 1.6, 3.6], [36.4, 37.6, YE + 1.4, YE + 3.4], [43.4, 44.6, YE + 1.4, YE + 3.4], [49.4, 50.6, YE + 1.4, YE + 3.4]]);
    murZ(x1, 1.2, -58.5, ZF - 0.6, -0.5, H, M_V4_PIERRE);
    B(x0 - 0.6, x1 + 0.8, H, H + 5, -58.5, ZF + 1.0, M_SLATE, { sh: 1 });
    // l'étage : un plancher percé de la trémie de l'escalier (contre le mur est)
    dalle(x0 + 0.6, x1 - 0.6, -57.9, ZF - 0.6, YE - 0.3, YE, M_PLANKS, [[53.4, 55.4, -54.2, -44.0]], { plafond: true });
    escalierSuspendu(54.4, -43.6, 0, YE, '-z', 1.8, 0.62, M_V4_PIERRE);
    // en bas : le bureau du sénéchal
    prop('secretaire', 33.2, 0, -52, Math.PI / 2); prop('armoire', 33.1, 0, -47, Math.PI / 2); prop('etagere', 40, 0, -57.6, 0, { kind: 'livres' }); prop('etagere', 42, 0, -57.6, 0, { kind: 'livres' });
    prop('table', 40, 0, -50, 0); prop('chaise', 40, 0, -49.1, Math.PI); prop('v4_coffre', 47, 0, -57.2, 0, { f: 'senechal' });
    fouille('senechal', 47, 0.7, -56.6, 'Le coffre du sénéchal', 'v4_coffre');
    fouille('armoire_logis', 33.8, 1.0, -47, 'L’armoire', 'v4_armoire');
    prop('v4_banniere', 46, 2.4, ZF - 0.62, Math.PI, { h: 2.6 });
    // à l'étage : la chambre de la Dame (vide), le berceau, le miroir voilé ; les latrines au fond
    prop('lit_clos', 35.4, YE, -55, Math.PI / 2); prop('b1_berceau', 38.6, YE, -56.8, 0); prop('miroir', 44, YE, -57.5, 0);
    prop('malle', 41, YE, -57.2, 0); fouille('malle_dame', 41, YE + 0.5, -56.7, 'Une malle', 'v4_armoire');
    prop('b1_metier', 47.5, YE, -45, Math.PI); prop('v4_tapisserie', 32.65, YE + 0.4, -49, Math.PI / 2, { v: 1, w: 2.4, h: 2.8 }); prop('poupee', 38.6, YE + 0.55, -56.8, 0.3);
    // les latrines : une petite pièce dans l'angle nord-est, le conduit dans la courtine
    murX(-54.2, 0.3, 49.4, 53.4, YE, H, M_PLANKS, [[50.6, 51.9, YE, YE + 2.3]]); murZ(49.6, 0.3, -57.9, -54.4, YE, H, M_PLANKS);
    prop('v4_banc_pierre', 51.6, YE, -57.6, 0, { L: 2.6 });
    inter('v4_passage', 'v4_conduit_haut', 51.6, YE + 0.9, -56.6, V4_TEXTES.conduitDescendre, { to: W(51.6, 0, -63.4), id: 'conduit', sens: 'descendre', texte: V4_TEXTES.conduitTexte, yaw: Math.PI });
    prop('v4_conduit', 51.6, 0, -61.5, Math.PI);
    inter('v4_passage', 'v4_conduit_bas', 51.6, 0.9, -62.5, V4_TEXTES.conduitMonter, { to: W(51.6, YE, -56.2), id: 'conduit', sens: 'monter', texte: V4_TEXTES.conduitTexte, desc: V4_TEXTES.conduit, yaw: 0 });
    salle('logis', 'le logis', x0, x1, 0, YE - 0.3, -58.5, ZF);
    salle('logis_haut', 'la chambre de la Dame', x0, x1, YE, H, -58.5, ZF);
    lieu('v4_logis', 44, -50, 10);
    V.abris.push({ x: CX + 44, y: Y0 + 2, z: CZ - 50, r: 10, nom: 'le logis' });
    porte(44, ZF, 0, Math.PI, 1.4, 2.35, { id: 'logis_s', style: 'garde' });
    place('logis', 'rodeur', 44, 0, -50, 8, { heures: [20, 6] });
    place('dehors_nord', 'rodeur', 30, 0, -72, 18, { heures: [19, 6] });
  }
  // ---- la galerie couverte, devant la grand-salle
  {
    B(-6, 32, 4.6, 5.0, ZF + 0.6, -36.4, M_PLANKS);
    B(-6.4, 32.4, 5.0, 6.2, ZF + 0.6, -36.0, M_SLATE, { sh: 2, r: Math.PI });
    for (const x of [-5.6, -0.6, 4.4, 9.4, 17.0, 22.0, 27.0, 31.6]) B(x - 0.4, x + 0.4, -0.3, 4.6, -37.2, -36.4, M_V4_PIERRE);
    salle('galerie', 'la galerie couverte', -6, 32, 0, 4.6, ZF, -36.4, { abri: [-5.6, 31.6, ZF + 0.6, -36.4] });
    for (const x of [0, 13, 26]) V.abris.push({ x: CX + x, y: Y0 + 2, z: CZ - 39, r: 3, nom: 'la galerie couverte' });
  }

  // ------------------------------------------------------------- la chapelle, son clocher, sa sacristie ; la crypte
  {
    const x0 = -14, x1 = 16, z0 = 40, z1 = 54, H = 11;
    murX(z0, 1.2, x0 - 0.6, x1 + 0.6, -0.5, H, M_V4_PIERRE, [[-1.2, 1.2, 0, 3.4], [-8.7, -7.3, 3.5, 8.5], [7.3, 8.7, 3.5, 8.5]]);
    murX(z1, 1.2, x0 - 0.6, x1 + 0.6, -0.5, H, M_V4_PIERRE, [[-8.7, -7.3, 3.5, 8.5], [7.3, 8.7, 3.5, 8.5], [11.3, 12.7, 0, 2.4]]);
    murZ(x1, 1.2, z0 + 0.6, z1 - 0.6, -0.5, H, M_V4_PIERRE, [[45.5, 48.5, 3, 9]]);
    murZ(x0, 1.2, z0 + 0.6, z1 - 0.6, -0.5, H, M_V4_PIERRE, [[46.3, 47.7, 0, 2.4]]);
    B(x0 - 0.7, x1 + 0.7, H, H + 5, z0 - 0.8, z1 + 0.8, M_SLATE, { sh: 1 });
    // les vitraux
    for (const [x, z] of [[-8, z0], [8, z0], [-8, z1], [8, z1]]) B(x - 0.7, x + 0.7, 3.5, 8.5, z - 0.08, z + 0.08, M_GLASS);
    B(x1 - 0.08, x1 + 0.08, 3, 9, 45.5, 48.5, M_GLASS);
    // le chœur : une marche, l'autel, les cierges
    B(8, x1 - 0.6, -0.2, 0.4, z0 + 0.6, z1 - 0.6, M_V4_DALLES);
    prop('autel', 13.4, 0.4, 47, Math.PI / 2); prop('c2_bougies', 13.4, 1.4, 46.4, Math.PI / 2, { lit: true }); prop('c2_bougies', 13.4, 1.4, 47.7, Math.PI / 2, { lit: true });
    prop('croix', 15.0, 0.4, 47, -Math.PI / 2);
    for (let k = 0; k < 4; k++) for (const z of [44.2, 49.8]) prop('banc', -9 + k * 4, 0, z, Math.PI / 2);
    prop('b1_lutrin', 6.6, 0.4, 44.6, Math.PI / 2); lire('chapelle', 6.9, 1.5, 44.6);
    prop('v4_mort', 11.6, 0.4, 47, Math.PI / 2, { pose: 'prie', look: { top: '#3a3430', bottom: '#3a3430', hairStyle: 'chauve' } });
    prop('statue_saint', -12.6, 0, 52.6, Math.PI * 0.75); prop('benitier', 1.8, 0, 41.4, 0);
    // le clocher, à l'ouest : la corde de la cloche, l'échelle de la chambre des cloches
    const cx0 = -20, cx1 = -14.6, cz0 = 44, cz1 = 50, CH = 20;
    murX(cz0, 1, cx0, cx1, -0.5, CH, M_V4_PIERRE, [[-18.2, -16.6, 15.4, 18.4]]); murX(cz1, 1, cx0, cx1, -0.5, CH, M_V4_PIERRE, [[-18.2, -16.6, 15.4, 18.4]]);
    murZ(cx0, 1, cz0 + 0.5, cz1 - 0.5, -0.5, CH, M_V4_PIERRE, [[46.2, 47.8, 0, 2.4], [46.2, 47.8, 15.4, 18.4]]);
    B(cx0 + 0.5, x0 - 0.6, 14.6, 15.0, cz0 + 0.5, cz1 - 0.5, M_PLANKS, { plafond: true });
    B(cx0 - 0.8, cx1 + 0.4, CH, CH + 6, cz0 - 0.8, cz1 + 0.8, M_SLATE, { sh: 3 });
    prop('v4_cloche', -17.3, 15.4, 47, 0, { c: 16.6 });
    V.cloche = { x: CX - 17.3, y: Y0 + 16.5, z: CZ + 47 };
    inter('v4_cloche', 'v4_cloche', -17.3, 1.2, 46.2, V4_TEXTES.cloche, {});
    prop('v4_echelle', -18.8, 0, 48.6, Math.PI / 2, { h: 15 });
    vis('clocher', [-18.6, 0, 48.0], [-16.2, 15, 48.2], V4_TEXTES.echelle);
    fouille('clocher', -18.6, 15.5, 45.4, 'Un nid, dans l’angle des poutres', 'v4_recoin');
    // la sacristie (fermée : la clé de la cuisinière) et l'escalier de la crypte
    murZ(8, 1, z1 + 0.6, 58.5, -0.5, 4.2, M_V4_PIERRE); murZ(16, 1, z1 + 0.6, 58.5, -0.5, 4.2, M_V4_PIERRE);
    B(7.5, 16.5, 4.2, 4.6, z1, 58.5, M_V4_PIERRE);
    porte(12, z1, 0, 0, 1.4, 2.35, { id: 'sacristie', cle: 'v4_cle_chapelle', style: 'eglise' });
    prop('armoire', 15.1, 0, 56.6, -Math.PI / 2); fouille('sacristie', 14.6, 1.0, 56.6, 'L’armoire aux ornements', 'v4_armoire');
    vis('crypte', [9.6, 0, 56.6], [11.6, P.CRYPTE, 50.4], V4_TEXTES.descendre, { texte: 'Vous descendez dans la crypte.', texte2: 'Vous remontez à la sacristie.' });
    salle('chapelle', 'la chapelle', x0, x1, 0, H, z0, z1);
    salle('clocher', 'le clocher', cx0, cx1, 0, CH, cz0, cz1);
    salle('sacristie', 'la sacristie', 8, 16, 0, 4.2, z1, 58.5, { abri: [8.5, 15.5, z1 + 0.6, 58.5] });
    lieu('v4_chapelle', 1, 47, 12);
    V.abris.push({ x: CX + 1, y: Y0 + 3, z: CZ + 47, r: 12, nom: 'la chapelle' }, { x: CX + 12, y: Y0 + 2, z: CZ + 56.2, r: 2.5, nom: 'la sacristie' });
    porte(0, z0, 0, 0, 2.3, 3.3, { id: 'chapelle', style: 'eglise' });
    place('chapelle', 'paisible', 0, 0, 47, 6, { heures: [21, 5] });
  }
  // ---- la crypte (y −7)
  {
    const y = P.CRYPTE, x0 = -10, x1 = 14, z0 = 42, z1 = 52, U = { under: true };
    B(x0, x1, y - 0.5, y, z0, z1, M_V4_DALLES, U);
    murX(z0 - 0.4, 0.8, x0 - 0.8, x1 + 0.8, y, y + 4.2, M_V4_PIERRE, null, U); murX(z1 + 0.4, 0.8, x0 - 0.8, x1 + 0.8, y, y + 4.2, M_V4_PIERRE, null, U);
    murZ(x0 - 0.4, 0.8, z0, z1, y, y + 4.2, M_V4_PIERRE, null, U); murZ(x1 + 0.4, 0.8, z0, z1, y, y + 4.2, M_V4_PIERRE, [[45.6, 48.4, y, y + 2.6]], U);
    B(x0 - 0.8, x1 + 0.8, y + 4.2, y + 4.8, z0 - 0.8, z1 + 0.8, M_V4_PIERRE, U);
    for (const x of [-4, 2, 8]) for (const z of [45, 49]) B(x - 0.4, x + 0.4, y, y + 4.2, z - 0.4, z + 0.4, M_V4_PIERRE, U);
    prop('v4_gisant', -7, y, 47, 0, { v: 0 }); lire('tombe_guerin', -7, y + 1.3, 45.4);
    prop('v4_gisant', -1, y, 47, 0, { v: 0 }); lire('tombe_aymeric', -1, y + 1.3, 45.4);
    prop('v4_gisant', 5, y, 47, 0, { v: 2 }); lire('tombe_aymon', 5, y + 1.3, 45.4);
    prop('c2_bougies', -7, y + 0.97, 48.4, 0, { lit: true }); prop('c2_bougies', 5, y + 0.97, 48.6, 0, { lit: true });
    for (const z of [42.8, 51.2]) for (let x = -8; x < 13; x += 3.4) prop('ossements', x, y, z, rnd() * 3);
    // le sénéchal, adossé à un pilier, la clé du donjon ; sa feuille
    prop('v4_mort', 8, y, 50.0, Math.PI, { pose: 'adosse', look: { top: '#2e3a4a', bottom: '#2a2a2e' } });
    lire('senechal', 8.6, y + 0.7, 50.4);
    objet('cle_donjon', 'v4_cle_donjon', 7.4, y + 0.02, 50.6, 0.6);
    fouille('crypte', -9.2, y + 0.6, 50.8, 'Une niche, des os rangés', 'v4_crypte');
    // l'ancien ossuaire, derrière une dalle qui sonne creux (mur est, une baie murée)
    V.murs.ossuaire = { blocs: [B(x1, x1 + 0.4, y, y + 2.6, 45.6, 48.4, M_V4_PIERRE, { under: true, v4mur: 'ossuaire' })], nom: 'ossuaire' };
    prop('v4_fissure', x1 - 0.05, y, 47, -Math.PI / 2, { mur: 'ossuaire' });
    inter('v4_mur', 'v4_mur_ossuaire', x1 - 0.5, y + 1.2, 47, '', { id: 'ossuaire' });
    B(x1 + 0.8, x1 + 3.6, y - 0.5, y, 45.2, 48.8, M_V4_DALLES, U); murX(45.0, 0.4, x1 + 0.8, x1 + 3.8, y, y + 2.6, M_V4_PIERRE, null, U); murX(49.0, 0.4, x1 + 0.8, x1 + 3.8, y, y + 2.6, M_V4_PIERRE, null, U);
    murZ(x1 + 3.8, 0.4, 45, 49, y, y + 2.6, M_V4_PIERRE, null, U); B(x1 + 0.6, x1 + 4, y + 2.6, y + 3.0, 44.8, 49.2, M_V4_PIERRE, U);
    for (let k = 0; k < 3; k++) prop('ossements', x1 + 1.6 + k * 0.7, y, 46 + k, rnd() * 3);
    fouille('ossuaire', x1 + 2.8, y + 0.5, 47, 'Un coffret, sous les crânes', 'v4_crypte');
    salle('crypte', 'la crypte', x0, x1, y, y + 4.2, z0, z1, { dessous: true });
    salle('ossuaire', 'l’ancien ossuaire', x1 + 0.8, x1 + 3.8, y, y + 2.6, 45, 49, { dessous: true });
    lieu('v4_crypte', 2, 47, 8);
    V.abris.push({ x: CX + 2, y: Y0 + y + 1, z: CZ + 47, r: 12, nom: 'la crypte' });
    place('crypte', 'gardien', 0, y, 47, 5, { dessous: true, garde: true });
  }

  // ------------------------------------------------------------- le donjon
  {
    const x0 = 38, x1 = 60, z0 = -6, z1 = 16, e = 2.5, H = 26, L1 = 7, L2 = 14, L3 = 20.5;
    const ix0 = x0 + e, ix1 = x1 - e, iz0 = z0 + e, iz1 = z1 - e;
    murX(z0 + e / 2, e, x0, x1, -1, H, M_V4_PIERRE, [[47.6, 48.4, L1 + 1.0, L1 + 2.6], [47.6, 48.4, L2 + 1.0, L2 + 2.6], [47.6, 48.4, L3 + 1.0, L3 + 2.6]]);
    murX(z1 - e / 2, e, x0, x1, -1, H, M_V4_PIERRE, [[49.6, 50.4, L1 + 1.0, L1 + 2.6], [49.6, 50.4, L2 + 1.0, L2 + 2.6], [49.6, 50.4, L3 + 1.0, L3 + 2.6]]);
    murZ(x0 + e / 2, e, iz0, iz1, -1, H, M_V4_PIERRE, [[1.0, 2.6, L1, L1 + 2.45], [7.6, 8.4, L2 + 1.0, L2 + 2.6], [7.6, 8.4, L3 + 1.0, L3 + 2.6]]);
    // le mur est : le trésor muré dans son épaisseur, à l'étage du sire
    murZ(x1 - e / 2, e, iz0, iz1, -1, H, M_V4_PIERRE, [[3.6, 4.4, L1 + 1.0, L1 + 2.6], [8.0, 11.0, L2, L2 + 2.4], [3.6, 4.4, L3 + 1.0, L3 + 2.6]]);
    B(x1 - 0.5, x1, L2, L2 + 2.4, 8.0, 11.0, M_V4_PIERRE);                                   // le fond du trésor (le parement extérieur)
    V.murs.tresor = { blocs: [B(ix1, ix1 + 0.35, L2, L2 + 2.4, 8.0, 11.0, M_V4_PIERRE, { v4mur: 'tresor' })], nom: 'tresor' };
    prop('v4_fissure', ix1 - 0.02, L2, 9.5, -Math.PI / 2, { mur: 'tresor' });
    inter('v4_mur', 'v4_mur_tresor', ix1 - 0.45, L2 + 1.2, 9.5, '', { id: 'tresor' });
    prop('v4_coffre', x1 - 1.3, L2, 9.5, -Math.PI / 2, { f: 'tresor' }); fouille('tresor', x1 - 1.6, L2 + 0.7, 9.5, 'Le trésor de Hautguet', 'v4_tresor');
    salle('tresor', 'le trésor', ix1, x1 - 0.5, L2, L2 + 2.4, 8.0, 11.0);
    // les planchers : la trappe de l'oubliette au milieu de la salle basse
    dalle(ix0, ix1, iz0, iz1, L1 - 0.5, L1, M_PLANKS, [[48.25, 49.75, 4.25, 5.75]], { plafond: true });
    V.trappes.oubliette = { blk: B(48.25, 49.75, L1 - 0.5, L1, 4.25, 5.75, M_PLANKS, { hidden: true, v4trappe: 'oubliette' }), y: Y0 + L1 - 0.5 };
    prop('v4_trappe', 49, L1, 5, 0, { id: 'oubliette', corde: true });
    inter('v4_trappe', 'v4_trappe_oubliette', 49, L1 + 0.6, 5.9, V4_TEXTES.trappeTitre, { id: 'oubliette', to: W(49, 0, 6.5) });
    lire('trappe', 49.9, L1 + 0.35, 5.0);
    B(ix0, ix1, L2 - 0.5, L2, iz0, iz1, M_PLANKS, { plafond: true });
    B(ix0, ix1, L3 - 0.5, L3, iz0, iz1, M_PLANKS, { plafond: true });
    B(x0, x1, H - 0.5, H, z0, z1, M_V4_DALLES);                                          // la terrasse
    murX(z0 + 0.4, 0.8, x0, x1, H, H + 1.4); murX(z1 - 0.4, 0.8, x0, x1, H, H + 1.4);
    murZ(x0 + 0.4, 0.8, z0 + 0.8, z1 - 0.8, H, H + 1.4); murZ(x1 - 0.4, 0.8, z0 + 0.8, z1 - 0.8, H, H + 1.4);
    creneaux(x0 + 3, x1 - 3, z0 + 0.4, z0 + 0.4, H + 1.4, 0.8, { p: 2.4 }); creneaux(x0 + 3, x1 - 3, z1 - 0.4, z1 - 0.4, H + 1.4, 0.8, { p: 2.4 });
    creneaux(x0 + 0.4, x0 + 0.4, z0 + 3, z1 - 3, H + 1.4, 0.8, { p: 2.4 }); creneaux(x1 - 0.4, x1 - 0.4, z0 + 3, z1 - 3, H + 1.4, 0.8, { p: 2.4 });
    // les échauguettes d'angle
    for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) { B(x - 1.6, x + 1.6, H - 3, H + 3.2, z - 1.6, z + 1.6); B(x - 1.85, x + 1.85, H + 3.2, H + 3.5, z - 1.85, z + 1.85, M_SLATE); B(x - 1.2, x + 1.2, H + 3.5, H + 6.9, z - 1.2, z + 1.2, M_SLATE, { sh: 3 }); }
    // l'escalier de pierre, la porte haute (fermée : la grande clé)
    escalier(35, 21.4, 0, L1, '-z', 2.0, 0.78);
    B(34, x0, -0.6, L1, 0.2, 4.2);
    B(34, x0, L1, L1 + 1.1, 0.2, 0.5); B(34, 34.3, L1, L1 + 1.1, 0.5, 4.2); B(36, x0, L1, L1 + 1.1, 3.9, 4.2);
    porte(x0 + e / 2, 1.8, L1, Math.PI / 2, 1.5, 2.4, { id: 'donjon', cle: 'v4_cle_donjon', style: 'garde', ep: e });
    // les escaliers dans le mur (d'un étage à l'autre) et l'échelle de la terrasse
    vis('donjon1', [ix0 + 1.0, L1, iz0 + 1.0], [ix0 + 1.0, L2, iz0 + 2.0], V4_TEXTES.murEsc);
    vis('donjon2', [ix1 - 1.0, L2, iz0 + 1.0], [ix1 - 1.0, L3, iz0 + 2.0], V4_TEXTES.murEsc);
    vis('donjon3', [ix0 + 1.0, L3, iz1 - 1.0], [ix0 + 2.0, H, iz1 - 1.6], V4_TEXTES.echelle);
    prop('v4_echelle', ix0 + 0.6, L3, iz1 - 0.6, 0, { h: H - L3 + 0.2 });
    // la fosse (le rez-de-chaussée, sans porte) : des os, et le boyau
    for (const [x, z, a] of [[45, 2, 0.4], [52, 9, 2.0], [43.5, 11, 1.2], [55, 1.5, 2.6]]) prop('ossements', x, 0, z, a);
    prop('v4_mort', 51.4, 0, 3.2, 1.2, { pose: 'couche', look: { top: '#4a4038', bottom: '#2e2a26' } });
    prop('v4_mort', 46, 0, 10.6, -0.6, { pose: 'adosse', look: { top: '#3a3a3a', bottom: '#2a2a2a' } });
    prop('grille_courte', 49, 0, iz1 - 0.05, Math.PI, null, 0.35);
    inter('v4_passage', 'v4_boyau', 49, 0.5, iz1 - 0.7, V4_TEXTES.boyauEntrer, { to: W(44.0, P.CACHOTS, 20), id: 'boyau', sens: 'descendre', texte: V4_TEXTES.boyauTexte, desc: V4_TEXTES.boyau, aller: true, yaw: -Math.PI / 2 });
    fouille('fosse', 53.4, 0.4, 12.0, 'Ce qui reste d’un sac', 'v4_cachot');
    // la salle basse (L1) : la table des gardes, des armures, le brasero éteint
    prop('table', 52.5, L1, 1.0, 0); prop('banc', 52.5, L1, 0.15, 0); prop('banc', 52.5, L1, 1.85, Math.PI);
    prop('g1_cuirasse_pose', 56.6, L1, 12.6, -Math.PI / 2); prop('g1_cuirasse_pose', 56.6, L1, 10.2, -Math.PI / 2); prop('b1_ratelier', 41.0, L1, 12.0, Math.PI / 2);
    prop('brasero', 45.5, L1, 1.5, 0); prop('v4_banniere', 49, L1 + 3.6, iz1 - 0.05, Math.PI, { h: 3.8 });
    fouille('donjon_bas', 41.4, L1 + 0.6, 8.0, 'Un sac de cuir', 'v4_soldat'); prop('sac', 41.2, L1, 8.0, 0.5);
    // la chambre du sire (L2) : le grand lit, la cheminée, le coffre, une tapisserie
    prop('lit_clos', 42.0, L2, 11.8, Math.PI / 2, { col: '#5a2a2a' }); prop('v4_tapisserie', 48, L2 + 0.4, iz1 - 0.05, Math.PI, { v: 0, w: 3.0, h: 3.2 });
    B(48, 52, L2, L2 + 2.4, iz0, iz0 + 0.9, M_V4_PIERRE); prop('cheminee', 50, L2, iz0 + 1.2, 0, { lit: false });
    prop('v4_coffre', 55.6, L2, 0.6, 0, { f: 'chambre_sire' }); fouille('chambre_sire', 55.6, L2 + 0.7, 1.2, 'Le coffre du sire', 'v4_coffre');
    prop('table', 45, L2, 3.6, 0); prop('fauteuil', 45, L2, 4.6, Math.PI);
    // la salle haute (L3) : les réserves vides du Guet, la table des cartes
    for (let k = 0; k < 6; k++) prop('tonneau_vieux', 41.2 + (k % 3) * 0.75, L3, -2.6 + Math.floor(k / 3) * 0.75, rnd() * 3);
    fouille('reserve_guet', 42.0, L3 + 0.6, -1.0, 'Les jarres du Guet', null, [['huile', 1]]);
    prop('table', 50, L3, 6, 0.3); prop('b1_carte_murale', ix1 - 0.05, L3 + 0.8, 6, -Math.PI / 2);
    // la terrasse : le Guet, le sire assis devant, sa feuille, la petite clé, l'anneau
    prop(SV.guet ? 'v4_guet_feu' : 'v4_guet', 49, H, 5, 0, { id: 'guet' });
    V.guet = { x: CX + 49, y: Y0 + H, z: CZ + 5 };
    inter('v4_guet', 'v4_guet', 49, H + 1.2, 6.9, V4_TEXTES.guetTitre, {});
    lire('guet', 49.9, H + 1.0, 5);
    prop('v4_mort', 49.2, H, 8.6, Math.PI, { pose: 'assis', look: { top: '#5a2e2e', bottom: '#2e2420', hat: null } });
    prop('chaise', 49.2, H, 8.75, Math.PI);
    lire('aymon', 48.4, H + 0.6, 9.2);
    objet('cle_tour', 'v4_cle_tour', 50.1, H + 0.55, 8.9, 0.4);
    objet('anneau', 'v4_anneau', 48.5, H + 0.55, 8.6, 0.2);
    salle('fosse_donjon', 'la fosse du donjon', ix0, ix1, 0, L1 - 0.5, iz0, iz1);
    salle('donjon1', 'la salle basse du donjon', ix0, ix1, L1, L2 - 0.5, iz0, iz1);
    salle('donjon2', 'la chambre du sire', ix0, ix1, L2, L3 - 0.5, iz0, iz1);
    salle('donjon3', 'la salle haute du donjon', ix0, ix1, L3, H - 0.5, iz0, iz1);
    salle('terrasse', 'la terrasse du donjon', x0, x1, H, H + 4, z0, z1, { couvert: false });
    lieu('v4_donjon', 49, 5, 13); lieu('v4_fosse', 49, 5, 4);
    V.abris.push({ x: CX + 49, y: Y0 + 3, z: CZ + 5, r: 8, nom: 'la fosse du donjon' }, { x: CX + 49, y: Y0 + L1 + 2, z: CZ + 5, r: 8, nom: 'la salle basse du donjon' }, { x: CX + 49, y: Y0 + L2 + 2, z: CZ + 5, r: 8, nom: 'la chambre du sire' }, { x: CX + 49, y: Y0 + L3 + 2, z: CZ + 5, r: 8, nom: 'la salle haute du donjon' });
    pt('donjon_porte', 36, L1, 1.8, Math.PI / 2); pt('terrasse', 47, H, 2, Math.PI);
    place('donjon_bas', 'gardien', 46, L1, 8, 5, { garde: true });
    place('terrasse_1', 'gardien', x0 + 0.2, H + 3.5, z0 + 0.2, 1.2, { perche: Y0 + H + 3.5, cap: -Math.PI * 0.75, espece: 'gargouille' });
    place('terrasse_2', 'gardien', x1 - 0.2, H + 3.5, z1 - 0.2, 1.2, { perche: Y0 + H + 3.5, cap: Math.PI * 0.25, espece: 'gargouille' });
    place('fosse_donjon', 'rodeur', 49, 0, 5, 6, {});
  }

  // ------------------------------------------------------------- la tour de la Dame (l'angle nord-est) : octogonale, une flèche
  {
    const cx = 72, cz = -60, R = 6.2, e = 1.2, H = 30, NIV = [8, 16, 24], side = 2 * (R - e / 2) * Math.tan(Math.PI / 8);
    // huit pans (le pan k regarde la direction a = k·π/4 : 0 le sud, 2 l'est, 4 le nord, 6 l'ouest, 7 le sud-ouest) ;
    // le pan 7 (vers la cour) a la porte en bas et la fenêtre de la chambre haute ; le pan 0 une seconde fenêtre
    const L = side + 0.5;
    for (let k = 0; k < 8; k++) {
      const a = k * Math.PI / 4, nx = Math.sin(a), nz = Math.cos(a), mx = cx + nx * (R - e / 2), mz = cz + nz * (R - e / 2);
      // repère du pan : son x local le long du pan, son z local vers le dehors (r = a)
      const pan = (y0, y1, u0, u1) => O.bloc(CX + mx + Math.cos(a) * (u0 + u1) / 2, Y0 + y0, CZ + mz - Math.sin(a) * (u0 + u1) / 2, u1 - u0, y1 - y0, e, M_V4_PIERRE, a, 0);
      if (k === 7) { pan(-1, 0, -L / 2, L / 2); pan(0, H, -L / 2, -0.8); pan(0, H, 0.8, L / 2); pan(2.6, 24.9, -0.8, 0.8); pan(27.5, H, -0.8, 0.8); }
      else if (k === 0) { pan(-1, 24.9, -L / 2, L / 2); pan(24.9, H, -L / 2, -0.7); pan(24.9, H, 0.7, L / 2); pan(27.3, H, -0.7, 0.7); }
      else pan(-1, H, -L / 2, L / 2);
    }
    // planchers octogonaux : quatre bandes (deux droites, deux tournées) ; la flèche : deux pyramides tournées
    const ri = R - e, t = ri * Math.tan(Math.PI / 8);
    for (const y of NIV) for (const [rr, w2, d2] of [[0, t, ri], [0, ri, t], [Math.PI / 4, t, ri], [Math.PI / 4, ri, t]]) O.bloc(CX + cx, Y0 + y - 0.35, CZ + cz, w2 * 2, 0.35, d2 * 2, M_PLANKS, rr, 0, { plafond: true });
    O.bloc(CX + cx, Y0 + H, CZ + cz, R * 2 * 0.86 + 0.8, 11, R * 2 * 0.86 + 0.8, M_SLATE, 0, 3);
    O.bloc(CX + cx, Y0 + H, CZ + cz, R * 2 * 0.86 + 0.8, 11, R * 2 * 0.86 + 0.8, M_SLATE, Math.PI / 4, 3);
    // la porte (pan 7, au sud-ouest) : le +z de la porte regarde le dedans (le nord-est)
    const ad = 7 * Math.PI / 4, dx = cx + Math.sin(ad) * (R - e / 2), dz = cz + Math.cos(ad) * (R - e / 2);
    porte(dx, dz, 0, ad - Math.PI, 1.5, 2.45, { id: 'tour_dame', cle: 'v4_cle_tour', style: 'garde', ep: e });
    inter('v4_parler', 'v4_dame', dx + Math.sin(ad) * 1.0, 1.5, dz + Math.cos(ad) * 1.0, V4_DAME.titre, { qui: 'dame' });
    pt('tour_dame', dx + Math.sin(ad) * 2.4, 0, dz + Math.cos(ad) * 2.4, ad - Math.PI);
    // dedans : la vis, d'un étage à l'autre ; en haut, la Dame à sa fenêtre (face au sud-ouest : la Ville Basse)
    const L0 = [0].concat(NIV);
    for (let k = 0; k + 1 < L0.length; k++) vis('dame' + k, [cx + 1.6, L0[k], cz + 1.6], [cx + 1.6, L0[k + 1], cz - 1.4], V4_TEXTES.vis);
    lire('tour_pied', cx + 2.6, 0.6, cz + 0.4);
    prop('lit', cx + 2.4, 8, cz - 1.6, -Math.PI / 2); prop('coffre_vieux', cx - 2.6, 8, cz + 1, Math.PI / 2); fouille('servante', cx - 2.2, 8.5, cz + 1, 'Le coffre de la servante', 'v4_armoire');
    prop('b1_lutrin', cx - 2.4, 16, cz - 1.2, Math.PI / 2); prop('statue_saint', cx + 2.6, 16, cz + 1.8, -Math.PI * 0.75);
    const yt = 24, fx = cx + Math.sin(ad) * (ri - 1.1), fz = cz + Math.cos(ad) * (ri - 1.1);
    prop('fauteuil', fx, yt, fz, ad); prop('v4_mort', fx, yt, fz, ad, { pose: 'assis', dy: 0.12, look: { top: '#3e3446', bottom: '#2e2834', dress: true, hairStyle: 'long', hair: '#9a9a96', hat: 'voile', hatCol: '#2a2630' } });
    prop('b1_metier', cx + 2.8, yt, cz - 0.6, -Math.PI / 2); prop('lit', cx - 1.6, yt, cz - 2.6, 0); prop('poupee', cx + 0.6, yt, cz + 2.0, 1.2);
    prop('gueridon', cx - 2.2, yt, cz + 1.0, 0); prop('c2_bougies', cx - 2.2, yt + 0.75, cz + 1.0, 0, { lit: true });
    objet('lettre_dame', 'v4_lettre_dame', cx - 2.0, yt + 0.76, cz + 0.8, 0.3);
    salle('tour_dame', 'la tour de la Dame', cx - ri, cx + ri, 0, H, cz - ri, cz + ri, { octo: [cx, cz, ri] });
    lieu('v4_tour_dame', cx, cz, 7);
    V.abris.push({ x: CX + cx, y: Y0 + 12, z: CZ + cz, r: ri, nom: 'la tour de la Dame' });
    V.dame = { x: CX + fx, y: Y0 + yt, z: CZ + fz };
  }

  // ------------------------------------------------------------- la haute cour : le puits, le jardin, la poterne de l'est
  {
    const x = 10, z = 12;
    murX(z - 1.0, 0.4, x - 1.2, x + 1.2, -0.5, 0.9, M_V4_PIERRE); murX(z + 1.0, 0.4, x - 1.2, x + 1.2, -0.5, 0.9, M_V4_PIERRE);
    murZ(x - 1.0, 0.4, z - 0.8, z + 0.8, -0.5, 0.9, M_V4_PIERRE); murZ(x + 1.0, 0.4, z - 0.8, z + 0.8, -0.5, 0.9, M_V4_PIERRE);
    B(x - 0.8, x + 0.8, 0.0, 0.05, z - 0.8, z + 0.8, M_DARK);
    prop('v4_puits', x, 0, z, 0);
    lire('puits', x, 1.2, z - 1.6);
    inter('v4_escalier', 'v4_puits:m', x + 0.6, 1.2, z + 1.4, V4_TEXTES.puitsDescendre, { to: W(x, P.PUITS, z + 0.6), sens: 'descendre', id: 'puits', texte: 'Vous descendez à la corde, longtemps.', desc: V4_TEXTES.puitsDesc });
    // la chambre du puits (sous terre)
    const y = P.PUITS, U = { under: true };
    B(x - 2.2, x + 2.2, y - 0.4, y, z - 1.6, z + 3.2, M_V4_DALLES, U);
    murX(z - 1.8, 0.4, x - 2.4, x + 2.4, y, y + 3, M_V4_PIERRE, null, U); murX(z + 3.4, 0.4, x - 2.4, x + 2.4, y, y + 3, M_V4_PIERRE, null, U);
    murZ(x - 2.4, 0.4, z - 1.6, z + 3.2, y, y + 3, M_V4_PIERRE, null, U); murZ(x + 2.4, 0.4, z - 1.6, z + 3.2, y, y + 3, M_V4_PIERRE, null, U);
    B(x - 2.6, x + 2.6, y + 3, y + 3.4, z - 2, z + 3.6, M_V4_PIERRE, U);
    prop('v4_mort', x - 1.4, y, z + 2.4, 0.6, { pose: 'adosse', look: { top: '#4a4a40', bottom: '#2a2a26' } });
    fouille('puits', x + 1.2, y + 0.4, z + 2.4, 'Un seau, plein de choses tombées', 'v4_recoin');
    inter('v4_escalier', 'v4_puits:d', x, y + 1.2, z, V4_TEXTES.puitsRemonter, { to: W(x + 1.8, 0, z + 1.6), sens: 'monter', id: 'puits', texte: 'Vous remontez à la corde, les bras en feu.' });
    salle('puits', 'le fond du puits', x - 2.2, x + 2.2, y, y + 3, z - 1.6, z + 3.2, { dessous: true });
  }
  {
    // le jardin de la Dame : un banc, un bassin sec, des rosiers morts
    prop('banc_pierre', 26, 0, 38, Math.PI); prop('bassin', 30, 0, 32, 0); prop('v4_banc_pierre', 34.4, 0, 35, -Math.PI / 2, { L: 2.4 });
    for (const [x, z] of [[23, 30], [24, 35], [33, 30], [35, 39], [22, 39], [29, 39.5]]) O.objet('bush', CX + x, CZ + z, 0.8);
    O.objet('deadtree', CX + 40, CZ + 36);
    place('jardin', 'paisible', 28, 0, 34, 6, { heures: [5, 8] });
    // la poterne de l'est : barrée de l'intérieur, fermée à clé (la clé du portier ouvre du dehors)
    porte(P.XE, 34, 0, -Math.PI / 2, 1.4, 2.35, { id: 'poterne', barre: 'dedans', cle: 'v4_cle_poterne', style: 'poterne', ep: EM });
    lire('poterne', P.XE - 2.0, 2.6, 35.6);
    pt('poterne_dedans', P.XE - 3, 0, 34, Math.PI / 2); pt('poterne_dehors', P.XE + 3.5, 0, 34, -Math.PI / 2);
    place('cour_1', 'rodeur', 18, 0, 0, 26, { heures: [19, 6] });
    place('cour_2', 'rodeur', 52, 0, 34, 16);
    place('ronde_sud', 'rodeur', -45, HM, 60, 12, { perche: Y0 + HM, ronde: [[-58, 60], [-38, 60]] });
    place('ronde_est', 'rodeur', P.XE, HM, 10, 14, { perche: Y0 + HM, ronde: [[P.XE, -40], [P.XE, 50]] });
    // des tonneaux et une charrette près des cuisines
    prop('charrette_renversee', -18, 0, -36, 1.2); prop('tonneau_vieux', -24, 0, -38, 0); prop('caisse', -22.6, 0, -37.4, 0.4);
    O.objet('deadtree', CX + 58, CZ + 30); O.objet('deadtree', CX - 10, CZ + 22);
    // la barricade de la nuit de la cendre, contre le mur de la haute cour, au nord de la herse : défaite, tirée de côté
    prop('charrette_renversee', -21.4, 0, -6.6, 0.4); prop('tonneau_vieux', -23.2, 0, -8.4, 0); prop('tonneau_vieux', -19.6, 0, -9.0, 1.1);
    prop('caisse', -22.8, 0, -4.6, 0.7); prop('tas_bois', -19.0, 0, -5.2, 1.4); prop('ossements', -18.4, 0, -3.4, 0.9);
    B(-23.6, -18.6, 0, 0.12, -10.4, -10.1, M_PLANKS, { r: 0.25 }); B(-22.4, -19.0, 0.12, 0.24, -10.9, -10.6, M_PLANKS, { r: -0.3 });
    // des os, devant la chapelle et au pied de l'escalier du donjon
    prop('ossements', -6.2, 0, 34.6, 2.4); prop('ossements', 31.8, 0, 22.8, 0.3);
  }

  // ------------------------------------------------------------- sous terre : la cave des cuisines
  {
    const y = P.CAVE, x0 = -23, x1 = -11, z0 = -57, z1 = -45, U = { under: true };
    B(x0, x1, y - 0.4, y, z0, z1, M_V4_DALLES, U);
    murX(z0 - 0.3, 0.6, x0 - 0.6, x1 + 0.6, y, y + 3.2, M_V4_PIERRE, null, U); murX(z1 + 0.3, 0.6, x0 - 0.6, x1 + 0.6, y, y + 3.2, M_V4_PIERRE, null, U);
    murZ(x0 - 0.3, 0.6, z0, z1, y, y + 3.2, M_V4_PIERRE, [[-52.2, -50.8, y, y + 2.3]], U); murZ(x1 + 0.3, 0.6, z0, z1, y, y + 3.2, M_V4_PIERRE, null, U);
    B(x0 - 0.6, x1 + 0.6, y + 3.2, y + 3.6, z0 - 0.6, z1 + 0.6, M_V4_PIERRE, U);
    for (let k = 0; k < 7; k++) prop('tonneau_vieux', -21.8 + k * 1.3, y, -56.2, rnd() * 3);
    prop('etagere', -11.6, y, -52, -Math.PI / 2, { kind: 'bocaux' }); prop('sacs', -20, y, -46.2, 0); prop('jambons', -16, y + 2.4, -56.6, 0);
    lire('cave', -17.6, y + 1.0, -55.6);
    fouille('cave', -12.4, y + 1.0, -52, 'Les bocaux de l’étagère', 'v4_cuisine');
    // la cache de la cuisinière : derrière un pan qui sonne creux (mur ouest)
    V.murs.cave = { blocs: [B(x0 - 0.6, x0, y, y + 2.3, -52.2, -50.8, M_V4_PIERRE, { under: true, v4mur: 'cave' })], nom: 'cave' };
    prop('v4_fissure', x0 + 0.02, y, -51.5, Math.PI / 2, { mur: 'cave' });
    inter('v4_mur', 'v4_mur_cave', x0 + 0.5, y + 1.2, -51.5, '', { id: 'cave' });
    B(x0 - 3.4, x0 - 0.6, y - 0.4, y, -53, -50, M_V4_DALLES, U); murX(-53.2, 0.4, x0 - 3.6, x0 - 0.6, y, y + 2.3, M_V4_PIERRE, null, U); murX(-49.8, 0.4, x0 - 3.6, x0 - 0.6, y, y + 2.3, M_V4_PIERRE, null, U);
    murZ(x0 - 3.6, 0.4, -53, -50, y, y + 2.3, M_V4_PIERRE, null, U); B(x0 - 3.8, x0 - 0.4, y + 2.3, y + 2.7, -53.4, -49.6, M_V4_PIERRE, U);
    prop('coffre_vieux', x0 - 2.4, y, -51.5, Math.PI / 2); fouille('cache_cuisiniere', x0 - 2.0, y + 0.5, -51.5, 'Les économies de la cuisinière', 'v4_recoin', [['huile', 1], ['vieille_piece', 3]]);
    salle('cave', 'la cave des cuisines', x0, x1, y, y + 3.2, z0, z1, { dessous: true });
    salle('cache_cave', 'la cache de la cave', x0 - 3.4, x0 - 0.6, y, y + 2.3, -53, -50, { dessous: true });
    lieu('v4_cave', -17, -51, 6);
    V.abris.push({ x: CX - 17, y: Y0 + y + 1, z: CZ - 51, r: 7, nom: 'la cave des cuisines' });
  }

  // ------------------------------------------------------------- sous terre : les cachots, la salle de la question, le souterrain
  {
    const y = P.CACHOTS, U = { under: true }, hC = 3.4;
    const sol = (x0, x1, z0, z1) => B(x0, x1, y - 0.4, y, z0, z1, M_V4_DALLES, U);
    const voute = (x0, x1, z0, z1, h) => B(x0, x1, y + (h || hC), y + (h || hC) + 0.5, z0, z1, M_V4_PIERRE, U);
    // la salle du geôlier, sous la tour (l'escalier y arrive)
    sol(-34, -24, 48, 58); voute(-34.5, -23.5, 47.5, 58.5);
    murX(58.3, 0.6, -34.6, -23.4, y, y + hC, M_V4_PIERRE, null, U); murX(47.7, 0.6, -34.6, -23.4, y, y + hC, M_V4_PIERRE, [[-31, -27, y, y + 2.6]], U);
    murZ(-34.3, 0.6, 48, 58, y, y + hC, M_V4_PIERRE, null, U); murZ(-23.7, 0.6, 48, 58, y, y + hC, M_V4_PIERRE, null, U);
    prop('table', -28, y, 55, 0); prop('chaise', -28, y, 54.2, 0); prop('lanterne_cachot', -27.4, y + 0.79, 55.2, 0);
    prop('v4_mort', -31.4, y, 56.6, 0.3, { pose: 'adosse', look: { top: '#3a3026', bottom: '#2a241e', beard: 'longue' } });
    objet('trousseau', 'v4_trousseau', -32.6, y + 1.5, 57.85, Math.PI);
    lire('geolier', -26.0, y + 1.4, 57.9);
    fouille('geolier', -24.6, y + 0.5, 50.0, 'Le coffre du geôlier', 'v4_coffre'); prop('coffre_vieux', -24.4, y, 49.6, -Math.PI / 2);
    // l'escalier de la tour du geôlier (une grille fermée : le trousseau ouvre, des deux côtés)
    vis('cachots', [-27.6, 0, 61.6], [-30, y, 56.8], V4_TEXTES.descendre, { cle: 'v4_trousseau', texte: 'Vous descendez aux cachots.', texte2: 'Vous remontez à la tour du geôlier.', yaw: Math.PI, yaw2: 0 });
    prop('porte_grille', -27.6, 0, 62.4, 0, { open: !!SV.portes.cachots });
    // le couloir nord-sud, puis le grand couloir est-ouest
    sol(-31, -27, 22, 48); voute(-31.5, -26.5, 21.5, 48);
    murZ(-31.3, 0.6, 22, 47.7, y, y + hC, M_V4_PIERRE, null, U); murZ(-26.7, 0.6, 22, 47.7, y, y + hC, M_V4_PIERRE, null, U);
    sol(-31, 46, 18, 22); voute(-31.5, 46.5, 17.5, 22.5);
    // les cellules : six au nord (z 12 … 18), six au sud (z 22 … 28), x de −26 à 4 ; les grilles
    for (let k = 0; k < 6; k++) {
      const cx0 = -26 + k * 5, cx1 = cx0 + 4;
      sol(cx0, cx1, 12, 18); voute(cx0 - 0.5, cx1 + 0.5, 11.5, 17.6, 2.8);
      sol(cx0, cx1, 22, 28); voute(cx0 - 0.5, cx1 + 0.5, 22.4, 28.5, 2.8);
      murZ(cx0 - 0.5, 1.0, 11.5, 17.6, y, y + 2.8, M_V4_PIERRE, null, U); murZ(cx0 - 0.5, 1.0, 22.4, 28.5, y, y + 2.8, M_V4_PIERRE, null, U);
      // les grilles (une collision qu'on ôte quand elles sont ouvertes)
      const gn = 'cellule_n' + k, gs = 'cellule_s' + k;
      prop('porte_grille', cx0 + 2, y, 17.8, 0, { open: true, id: gn }); prop('grille_courte', cx0 + 2, y, 17.8, 0, null, 1);
      prop('grille_courte', cx0 + 2, y, 22.2, 0, null, 1);
      if (k === 2) { V.grilles[gn] = { blk: B(cx0 + 0.8, cx0 + 3.2, y, y + 2.8, 17.65, 17.95, M_V4_PIERRE, { hidden: true, v4grille: gn }), cle: 'v4_trousseau' }; inter('v4_grille', 'v4_g_' + gn, cx0 + 2, y + 1.2, 18.8, 'Une grille de cellule', { id: gn, cle: 'v4_trousseau' }); }
    }
    // les murs du fond des cellules et du couloir
    murX(11.7, 0.6, -27, 4.0, y, y + 2.8, M_V4_PIERRE, null, U); murX(28.3, 0.6, -27, 4.0, y, y + 2.8, M_V4_PIERRE, null, U);
    murZ(3.5, 1.0, 11.5, 17.6, y, y + 2.8, M_V4_PIERRE, null, U); murZ(3.5, 1.0, 22.4, 28.5, y, y + 2.8, M_V4_PIERRE, null, U);
    murX(17.7, 0.6, -31.6, -26.5, y, y + hC, M_V4_PIERRE, null, U);
    // les cellules : des paillasses, des seaux, des chaînes ; le tonnelier (cellule nord 2, fermée) ; le trou du fuyard (sud 4)
    for (let k = 0; k < 6; k++) { const cx0 = -26 + k * 5; prop('paillasse', cx0 + 1.2, y, 14.4, 0); prop('seau_cachot', cx0 + 3.3, y, 12.6, 0); prop('chaine_mur', cx0 + 2, y, 12.05, 0); prop('paillasse', cx0 + 1.2, y, 25.4, Math.PI); if (k % 2) prop('ossements', cx0 + 2.8, y, 26.4, k); }
    prop('v4_mort', -14.0, y, 12.8, 0.2, { pose: 'adosse', look: { top: '#5a4a3a', bottom: '#3a3026', beard: 'courte' } });
    prop('v4_marques', -14.0, y, 12.03, 0, { n: 63 }); lire('cachot', -14.8, y + 1.2, 12.8);
    fouille('tonnelier', -13.0, y + 0.4, 13.4, 'Des cercles de tonneau, rouillés', 'v4_cachot');
    for (let k = 0; k < 6; k++) if (k !== 2 && k !== 4) fouille('cellule' + k, -26 + k * 5 + 1.2, y + 0.4, 25.0, 'Sous la paillasse', 'v4_cachot');
    // le fuyard : une paillasse poussée, un trou dans le mur du fond (sud 4)
    V.murs.fuyard = { blocs: [], nom: 'fuyard' };
    inter('v4_passage', 'v4_trou_fuyard', -4.0, y + 0.5, 27.6, 'Un trou, derrière la paillasse', { to: W(-4.0, y, 31.4), id: 'fuyard', sens: 'entrer', texte: 'Vous rampez dans le trou. Il fait quatre mètres.', aller: false, yaw: 0 });
    inter('v4_passage', 'v4_trou_fuyard_r', -4.0, y + 0.5, 30.6, 'Le trou, vers la cellule', { to: W(-4.0, y, 26.4), id: 'fuyard', sens: 'sortir', texte: 'Vous revenez dans la cellule.', yaw: Math.PI });
    sol(-5.6, -2.4, 29.2, 32.6); murX(32.8, 0.4, -5.8, -2.2, y, y + 1.6, M_V4_PIERRE, null, U); murZ(-5.8, 0.4, 29, 32.6, y, y + 1.6, M_V4_PIERRE, null, U); murZ(-2.2, 0.4, 29, 32.6, y, y + 1.6, M_V4_PIERRE, null, U); B(-6, -2, y + 1.6, y + 2.0, 28.6, 33, M_V4_PIERRE, U);
    prop('squelette', -4.2, y, 31.6, 0.4); fouille('fuyard', -3.4, y + 0.4, 31.4, 'Ce qu’il avait sur lui', 'v4_recoin');
    salle('cache_fuyard', 'le trou du fuyard', -5.6, -2.4, y, y + 1.6, 29.2, 32.6, { dessous: true });
    // la salle de la question (sud, après les cellules) : on n'en dit pas plus
    sol(8, 18, 22, 30); voute(7.5, 18.5, 21.5, 30.5);
    murX(30.3, 0.6, 7.4, 18.6, y, y + hC, M_V4_PIERRE, null, U); murZ(7.7, 0.6, 22.4, 30, y, y + hC, M_V4_PIERRE, null, U); murZ(18.3, 0.6, 22.4, 30, y, y + hC, M_V4_PIERRE, null, U);
    murX(22.3, 0.6, 7.4, 18.6, y, y + hC, M_V4_PIERRE, [[11.8, 13.4, y, y + 2.4]], U);
    prop('v4_fauteuil_sangles', 13, y, 27.6, Math.PI); prop('brasero', 10, y, 28.6, 0); prop('chaine_mur', 17.9, y, 26, -Math.PI / 2); prop('chaine_mur', 17.9, y, 24, -Math.PI / 2);
    salle('question', 'la salle de la question', 8, 18, y, y + hC, 22, 30, { dessous: true });
    // les murs du grand couloir (entre les cellules et au-delà)
    murX(17.7, 0.6, 3.0, 46.6, y, y + hC, M_V4_PIERRE, null, U);
    murX(22.3, 0.6, 18.6, 46.6, y, y + hC, M_V4_PIERRE, null, U);
    murX(22.3, 0.6, 3.0, 7.7, y, y + hC, M_V4_PIERRE, null, U);
    murZ(-31.3, 0.6, 17.4, 22, y, y + hC, M_V4_PIERRE, null, U);
    // le bout est : l'arrivée du boyau (une rigole qui sort d'un trou trop haut), puis le souterrain
    prop('v4_grille_sol', 44.6, y + 2.8, 18.4, 0);
    inter('v4_lire', 'v4_boyau_bas', 44.6, y + 1.4, 18.6, '', { t: null, texte: '(Le trou est trop haut, et l’eau en coule encore. On n’y remonte pas.)' });
    sol(46, 98, 19, 21); voute(46, 98, 18.6, 21.4, 2.6);
    murX(18.8, 0.4, 46.6, 98, y, y + 2.6, M_V4_PIERRE, null, U); murX(21.2, 0.4, 46.6, 98, y, y + 2.6, M_V4_PIERRE, null, U);
    murZ(46.3, 0.6, 17.4, 18.6, y, y + hC, M_V4_PIERRE, null, U); murZ(46.3, 0.6, 21.4, 22.6, y, y + hC, M_V4_PIERRE, null, U);
    // la chambre de sortie, sous le charnier ; la grille (verrous de ce côté)
    sol(96, 102, 16, 24); voute(95.6, 102.4, 15.6, 24.4);
    murX(15.8, 0.4, 95.6, 102.4, y, y + hC, M_V4_PIERRE, null, U); murX(24.2, 0.4, 95.6, 102.4, y, y + hC, M_V4_PIERRE, null, U); murZ(102.2, 0.4, 16, 24, y, y + hC, M_V4_PIERRE, null, U);
    murZ(95.8, 0.4, 16, 18.8, y, y + hC, M_V4_PIERRE, null, U); murZ(95.8, 0.4, 21.2, 24, y, y + hC, M_V4_PIERRE, null, U);
    prop('caisses', 100.6, y, 17.2, 0); prop('tonneau_vieux', 101, y, 22.6, 0);
    prop('v4_echelle', 99, y, 20.6, Math.PI, { h: hC });
    inter('v4_grille', 'v4_g_charnier_bas', 99, y + 1.4, 20.0, V4_TEXTES.grilleTitre, { id: 'charnier', dessous: true, to: W(99, 0, 21.4), yaw: 0 });
    lire('souterrain', 99.6, y + 1.2, 20.4);
    salle('geolier', 'la salle du geôlier', -34, -24, y, y + hC, 48, 58, { dessous: true });
    salle('cachots_couloir', 'les cachots', -31, 46, y, y + hC, 12, 48, { dessous: true });
    salle('souterrain', 'le souterrain', 46, 102, y, y + hC, 16, 24, { dessous: true });
    lieu('v4_cachots', -10, 22, 18); lieu('v4_souterrain', 72, 20, 18);
    V.abris.push({ x: CX - 29, y: Y0 + y + 1, z: CZ + 53, r: 6, nom: 'la salle du geôlier' }, { x: CX - 10, y: Y0 + y + 1, z: CZ + 20, r: 20, nom: 'les cachots' }, { x: CX + 72, y: Y0 + y + 1, z: CZ + 20, r: 28, nom: 'le souterrain' });
    pt('cachots', -29, y, 52, Math.PI);
    place('geolier', 'gardien', -29, y, 52, 3, { dessous: true, garde: true });
    place('cachots', 'rodeur', 6, y, 20, 18, { dessous: true });
    place('souterrain', 'rodeur', 72, y, 20, 20, { dessous: true });
  }
  // ---- le charnier, hors les murs (à l'est) : la grille dans le sol ne s'ouvre que par-dessous
  {
    const x0 = 94, x1 = 104, z0 = 14, z1 = 26;
    murX(z0, 0.8, x0, x1, -0.5, 3.6, M_V4_PIERRE); murX(z1, 0.8, x0, x1, -0.5, 3.6, M_V4_PIERRE, [[97.8, 100.2, -0.5, 1.2]]);
    murZ(x0, 0.8, z0 + 0.4, z1 - 0.4, -0.5, 3.6, M_V4_PIERRE, [[18.8, 21.2, 0, 2.6]]); murZ(x1, 0.8, z0 + 0.4, z1 - 0.4, -0.5, 2.4, M_V4_PIERRE);
    B(x0 - 0.2, x0 + 0.6, 2.6, 3.6, 18.6, 21.4, M_V4_PIERRE);
    for (let k = 0; k < 5; k++) { prop('ossements', x0 + 1.4 + k * 1.8, 0, z0 + 1.0, k); prop('ossements', x0 + 1.4 + k * 1.8, 0, z1 - 1.0, k + 2); }
    prop('v4_os_tas', 101.6, 0, 18, 0.4); prop('v4_os_tas', 101.4, 0, 23, 2.2);
    prop('v4_grille_sol', 99, 0.02, 20, 0, { id: 'charnier' });
    inter('v4_grille', 'v4_g_charnier_haut', 99, 0.9, 20.9, V4_TEXTES.grilleTitre, { id: 'charnier', dessous: false, to: W(99, P.CACHOTS, 20.4), yaw: Math.PI });
    lire('charnier', x0 - 1.0, 2.2, 20);
    salle('charnier', 'le charnier', x0, x1, 0, 3.6, z0, z1, { couvert: false, dessous: false });
    lieu('v4_charnier', 99, 20, 8);
    pt('charnier', 92, 0, 20, Math.PI / 2);
    place('charnier', 'paisible', 99, 0, 20, 5, { heures: [21, 4] });
  }

  // ------------------------------------------------------------- la carte des abris (l'éclairage du dedans)
  // 05-world.js computeCover ne retient, par case d'un mètre, que les plafonds dont l'empreinte (moins 45 cm) couvre le
  // milieu de la case : le long d'un mur dont le toit s'arrête au nu intérieur (la courtine, la voûte d'une porte), la
  // rangée de cases serait « dehors », claire en plein jour. Chaque case qui touche une salle couverte (hors les trous
  // d'un toit crevé) prend donc au moins la hauteur du plafond de la salle, plus 10 cm (l'éclairage lit la carte à 5 cm
  // près : sans cela, le haut des murs, sous le plafond, brillerait d'un liseré ; un sol posé à cette hauteur, lu à 8 cm
  // au-dessus, reste dehors). Les murs du château font plus d'un mètre : leur parement extérieur est dans une autre
  // case. Seulement ce monde-ci (la Zone), et seulement le château.
  {
    const R = [], OCT = [];
    for (const s of V.salles) {
      if (!s.couvert || s.dessous) continue;
      if (s.octo) { OCT.push([s.octo[0], s.octo[1], s.octo[2], s.y1 + 0.1]); continue; }
      for (const [a0, a1, b0, b1] of percer([s.abri || [s.x0, s.x1, s.z0, s.z1]], s.trous)) if (a1 - a0 > 0.05 && b1 - b0 > 0.05) R.push([a0, a1, b0, b1, s.y1 + 0.1]);
    }
    const dansOcto = (x, z, o) => { for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; if ((x - o[0]) * Math.sin(a) + (z - o[1]) * Math.cos(a) > o[2]) return false; } return true; };
    const _cc = Z.computeCover;
    Z.computeCover = function (cx, cz) {
      _cc.call(this, cx, cz);
      const S = this.coverW, cov = this.cover;
      if (!cov || !this.coverO) return;
      const [ox, oz] = this.coverO;
      const mettre = (i, j, y) => { if (i >= 0 && j >= 0 && i < S && j < S && cov[j * S + i] < y) cov[j * S + i] = y; };
      for (const [a0, a1, b0, b1, y] of R) {
        const i0 = Math.floor(a0 - ox + 1e-3), i1 = Math.ceil(a1 - ox - 1e-3) - 1, j0 = Math.floor(b0 - oz + 1e-3), j1 = Math.ceil(b1 - oz - 1e-3) - 1;
        if (i1 < 0 || j1 < 0 || i0 >= S || j0 >= S) continue;
        for (let j = Math.max(0, j0); j <= Math.min(S - 1, j1); j++) for (let i = Math.max(0, i0); i <= Math.min(S - 1, i1); i++) mettre(i, j, y);
      }
      for (const o of OCT) {
        const i0 = Math.floor(o[0] - o[2] - 1 - ox), i1 = Math.ceil(o[0] + o[2] + 1 - ox), j0 = Math.floor(o[1] - o[2] - 1 - oz), j1 = Math.ceil(o[1] + o[2] + 1 - oz);
        for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
          const x = ox + i, z = oz + j;
          if (dansOcto(x + 0.5, z + 0.5, o) || dansOcto(x + 0.1, z + 0.1, o) || dansOcto(x + 0.9, z + 0.1, o) || dansOcto(x + 0.1, z + 0.9, o) || dansOcto(x + 0.9, z + 0.9, o)) mettre(i, j, o[3]);
        }
      }
    };
  }

  // ------------------------------------------------------------- ce qui dépend de l'état (une partie déjà avancée)
  chateauV4.appliquer(true);
  V.mesures = { blocs: Z.blocks.length - n0, props: Z.props.length - p0, inter: Z.inter.length - i0, portes: Z.doors.length - d0, tours: tours.length };
}
