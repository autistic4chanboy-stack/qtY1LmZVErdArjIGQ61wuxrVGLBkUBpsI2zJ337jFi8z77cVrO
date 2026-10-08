// ============================================================================
//  LES SECRETS DE LA ZONE (agent V5) — des lieux cachés, des murs qui mentent,
//  des objets qui racontent, le fil d'A. (passe zone.passe('V5-secrets'))
//  - Le tertre creux (les Tertres) : un dolmen au pied d'un tertre ; dessous, la
//    chambre d'un roi (sa couronne de cire) ; derrière un mur qui ment, un escalier
//    et la chambre d'un roi plus vieux, sur la poitrine duquel on a posé le
//    battant de la Cloche du Jour (« sous chaque roi, un autre tertre »).
//  - La chapelle murée (le Bois Mort) : une chapelle en ruine dont le chevet ment ;
//    derrière, une crypte, le sceau de la Ville Basse.
//  - L'ermitage (les Ravines) : une cabane creusée dans la pente, sans porte ; un
//    pan de son mur ment ; dedans, ce qui reste d'un homme et son carnet (le Ver).
//  - Le brasier mort (les Cendrières) : là où l'on a brûlé les noms ; la cendre
//    froide, qui ne brûle pas (elle éteint le feu du compte).
//  - Les lettres d'A. : la première près de la tonnellerie, les autres en bas
//    (une maison vide près de la porte, le greffe, la salle d'avant).
//  API : zone.secrets (murs(), salles(), lieux()) ; ce que lit catacombesV5.
// ============================================================================
const V5_SECRETS_TEXTES = {
  dolmen: 'Deux pierres debout, une troisième posée dessus. Entre elles, une dalle noire, et, dessous, une marche.',
  entrerTertre: 'Descendre sous le tertre',
  descenteTertre: 'Vous vous glissez sous la dalle…',
  sortirTertre: 'Remonter au jour',
  remonteeTertre: 'Vous remontez…',
  roiTitre: 'Une inscription, au pied du roi',
  roi: 'ICI DORT UN ROI.\nSOUS LUI, UN AUTRE.',
  roi2Titre: 'Une inscription, plus ancienne',
  roi2: 'SOUS CELUI-CI, UN AUTRE ENCORE.\nNE CREUSE PLUS.',
  chapelleTitre: 'Une plaque, sur l’autel',
  chapelle: 'Une plaque de cuivre vert-de-gris. Les mots sont usés à force d’avoir été touchés :\n\nÀ L’HEURE OÙ LA CLOCHE SE TAIT, CEUX D’EN BAS COMPTENT.',
  cryptTitre: 'Des mots, au fond de la crypte',
  crypt: 'LA VILLE AVAIT UN NOM.\nON L’A DONNÉ AU FEU AVEC LES AUTRES,\nPOUR QUE RIEN NE PUISSE PLUS L’APPELER.',
  brasierTitre: 'Le brasier mort',
  brasier: 'Des troncs noircis en cercle, un pieu calciné, et au milieu un tas de cendre plus pâle que celle des Cendrières. Elle est froide comme de la neige.',
  brasierPrendre: 'Prendre une poignée de cendre',
  brasierPris: '(La cendre ne tache pas les doigts. Elle pèse plus qu’elle ne devrait.)',
  brasierRien: 'Des troncs noircis en cercle, un pieu calciné. Le tas de cendre pâle a un creux, là où vous avez pris.',
  pierreBrasierTitre: 'Une pierre noircie',
  pierreBrasier: 'ICI, LE DERNIER SOIR, ON A BRÛLÉ LES NOMS.',
  ermitageTitre: 'Des traits, sur la pierre',
  ermitage: 'Des traits gravés, par paquets de sept, sur tout un mur. Au-dessus de chaque paquet, une petite aile, dessinée d’un seul trait.',
  souliersTitre: 'Des souliers, au bord de l’eau',
  souliers: 'Trois paires de souliers, rangées côte à côte, la pointe vers l’eau : un homme, une femme, un enfant. Les lacets sont noués. Personne n’est revenu les chercher.',
  bancTitre: 'Un banc, face à la Porte',
  banc: 'Un banc de pierre, tourné vers la Porte. Dessus, une capote de garde pliée, raide de cendre ; dans la poche, une page :\n\n« M. de Sorbiers est entré au matin. Il a dit : trois jours. J’attends. »\n\nAu dos, des traits, par paquets de sept. Beaucoup de paquets.',
  cairnTitre: 'Un tas de pierres',
  cairn: 'Un petit tas de pierres plates, bien rangé, comme on en fait pour marquer un chemin. Sous la pierre du haut, quelque chose de blanc.',
};
const secretsV5 = {
  Z() { return zone.Z && zone.Z.v5s ? zone.Z.v5s : null; },
  murs() { const v = this.Z(); return v ? v.murs : []; },
  objets() { const v = this.Z(); return v ? v.objets : []; },
  places() { const v = this.Z(); return v ? v.places.slice() : []; },
  abris() { const v = this.Z(); return v ? v.abris.slice() : []; },
  // sous terre chez les secrets (le tertre) ?
  dedans(p) {
    const v = this.Z();
    if (!v || !p) return false;
    for (const s of v.sous) { const [lx, lz] = v5Local(s.f, p[0], p[2]); if (Math.abs(lx) < s.hx && Math.abs(lz) < s.hz && p[1] > s.y0 && p[1] < s.y1) return true; }
    return false;
  },
  aCouvert(p) {
    const v = this.Z();
    if (!v || !p) return false;
    if (this.dedans(p)) return true;
    for (const s of v.couverts) { const [lx, lz] = v5Local(s.f, p[0], p[2]); if (Math.abs(lx) < s.hx && Math.abs(lz) < s.hz && p[1] > s.y0 && p[1] < s.y1) return true; }
    return false;
  },
  lire(it) {
    const k = it.data.texte, T = V5_SECRETS_TEXTES;
    const L = { roi: ['roiTitre', 'roi'], roi2: ['roi2Titre', 'roi2'], chapelle: ['chapelleTitre', 'chapelle'], crypt: ['cryptTitre', 'crypt'], brasier_pierre: ['pierreBrasierTitre', 'pierreBrasier'], ermitage: ['ermitageTitre', 'ermitage'], cairn: ['cairnTitre', 'cairn'], souliers: ['souliersTitre', 'souliers'], banc: ['bancTitre', 'banc'] }[k];
    if (!L) return;
    catacombesV5.S().lus[k] = farm.s.day;
    sound.page && sound.page();
    ui.read(T[L[0]], T[L[1]]);
  },
  entrer(it) {
    const v = this.Z(), s = v && v.lieux[it.data.lieu];
    if (!s) return;
    const T = V5_SECRETS_TEXTES;
    if (it.kind === 'v5_entrer') {
      ui.choice('Le dolmen', T.dolmen, [
        { label: T.entrerTertre, fn: async () => { ui.close(); await catacombesV5.aller(s.dedans, s.capDedans, T.descenteTertre); } },
        { label: V5_TEXTES.laisser, fn: () => ui.close() },
      ]);
    } else {
      catacombesV5.aller(s.dehors, s.capDehors, T.remonteeTertre);
    }
  },
  brasier() {
    const S = catacombesV5.S(), T = V5_SECRETS_TEXTES, v = this.Z();
    if (S.cendre) { ui.choice(T.brasierTitre, T.brasierRien, [{ label: V5_TEXTES.laisser, fn: () => ui.close() }]); return; }
    ui.choice(T.brasierTitre, T.brasier, [
      { label: T.brasierPrendre, fn: () => {
        ui.close();
        S.cendre = farm.s.day;
        farm.give('v5_cendre_froide', 1);
        play.flyer('v5_cendre_froide', game.player.eyePos(), 1);
        ui.subtitle('', T.brasierPris, 3.5);
        if (v && v.brasier) { v.brasier.data = Object.assign({}, v.brasier.data, { pris: true }); farm.dirtyProps = true; }
        farm.save();
      } },
      { label: V5_TEXTES.laisser, fn: () => ui.close() },
    ]);
  },
};
zone.secrets = {
  murs: () => catacombesV5.murs().map((M) => ({ id: M.id, x: M.x, y: M.y, z: M.z, ouvert: !!(M.ouvert || M.b.hidden) })),
  salles: () => { const v = secretsV5.Z(); return v ? Object.keys(v.lieux).map((k) => ({ id: k, x: v.lieux[k].x, z: v.lieux[k].z })) : []; },
  lieux: () => { const v = secretsV5.Z(); return v ? Object.keys(v.lieux) : []; },
};

// ---------------------------------------------------------------- la passe
zone.passe('V5-secrets', (Z, O) => {
  const S = typeof farm !== 'undefined' && farm.s ? (farm.s.v5 || {}) : {};
  const murs0 = S.murs || {}, pris0 = S.pris || {};
  const v = Z.v5s = { murs: [], objets: [], places: [], abris: [], sous: [], couverts: [], lieux: {} };
  const SZ = O.S;
  const prop = (id, f, lx, ly, lz, rr, data, s) => { const [x, z] = v5Monde(f, lx, lz); const q = O.prop(id, x, f.y + ly, z, f.r + (rr || 0), data || null, s); q.v5 = true; return q; };
  const inter = (kind, id, f, lx, ly, lz, nom, data) => { const [x, z] = v5Monde(f, lx, lz); return O.inter(kind, id, x, f.y + ly, z, nom, data || {}); };
  const objet = (k, item, f, lx, ly, lz, nom, liste) => { const q = prop('v5_objet', f, lx, ly, lz, 0.3, { k, item, pris: !!pris0[item] }); const i = inter('v5_prendre', item, f, lx, ly + 0.25, lz, nom, { item }); (liste || v.objets).push({ k, item, q, i }); return q; };
  const mur = (id, b) => { b.v5illusoire = id; const M = { id, b, x: b.x, y: b.y, z: b.z }; if (murs0[id]) { b.hidden = true; M.ouvert = true; } v.murs.push(M); return M; };
  // un endroit libre dans une région (tirage propre à la passe)
  const chercher = (reg, r, test) => {
    const R = V1_REGIONS[reg], cx = R.x * SZ, cz = R.z * SZ, rr = R.r * SZ;
    for (let k = 0; k < 500; k++) {
      const a = O.rnd() * TAU, d = Math.sqrt(O.rnd()) * rr * 0.8, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
      if (!O.libre(x, z, r)) continue;
      if (O.surChemin(x, z, Math.ceil((r + 6) / 4))) continue;
      if (Z.props.some((q) => q.id === 'v1_feu' && Math.hypot(q.x - x, q.z - z) < 45)) continue;
      if (test && !test(x, z)) continue;
      return { x, z };
    }
    return null;
  };

  // ------------------------------------------------------------ 1. le tertre creux
  {
    const P = chercher('tertres', 14);
    if (P) {
      const sol = O.hauteur(P.x, P.z), R0 = 12, Hm = 5.5;
      // le tertre : une bosse de terre
      O.B.forVerts(P.x, P.z, R0 * 1.3, (i, j, k, px, pz) => { const q = 1 - Math.hypot(px - P.x, pz - P.z) / (R0 * 1.3); if (q > 0) Z.heights[k] += Math.sin(q * Math.PI / 2) * Hm; });
      const a = O.rnd() * TAU, f = { x: P.x, y: sol, z: P.z, r: a };
      // le dolmen, au pied du tertre (côté +z local)
      const [dx, dz] = v5Monde(f, 0, R0 + 1.2), yd = O.hauteur(dx, dz);
      const fD = { x: dx, y: yd, z: dz, r: a };
      const pierre = M_V1_PIERRE;
      for (const s of [-1, 1]) v5Bloc(Z, fD, s * 1.15, -0.6, 0, 0.6, 2.6, 1.4, pierre, { surface: true });
      v5Bloc(Z, fD, 0, 2.0, -0.2, 3.2, 0.55, 2.0, pierre, { surface: true });
      v5Bloc(Z, fD, 0, -0.4, -0.55, 1.7, 2.4, 0.3, M_DARK, { surface: true });
      inter('v5_entrer', 'v5_tertre_entrer', fD, 0, 1.2, 0.5, 'Le dolmen', { lieu: 'tertre' });
      // dessous : un couloir, la chambre du roi ; derrière un mur qui ment, des marches, la chambre du roi d'avant
      const yC = sol - 5.5, fC = { x: P.x, y: yC, z: P.z, r: a };
      const blk = (lx, ly, lz, sx, sy, sz, m, o) => v5Bloc(Z, fC, lx, ly, lz, sx, sy, sz, m, o);
      // le couloir (de +z = R0 vers la chambre) : 2,2 de large, 2,5 de haut
      blk(0, -0.5, R0 / 2 + 1, 2.4, 0.5, R0 - 2, M_STONE); blk(0, 2.5, R0 / 2 + 1, 3.4, 1.0, R0 - 2, M_V5_TUF, { ceil: true });
      for (const s of [-1, 1]) blk(s * 1.4, -0.5, R0 / 2 + 1, 0.6, 3.6, R0 - 2, M_V1_PIERRE);
      blk(0, -0.5, R0 - 0.2, 2.4, 3.6, 0.6, M_V1_PIERRE);
      // la chambre du roi : 5 × 5 (de z -1,5 à 3,5)
      blk(0, -0.5, 1, 5.6, 0.5, 5.6, M_STONE); blk(0, 2.9, 1, 6.2, 1.0, 6.2, M_V5_TUF, { ceil: true });
      blk(-2.8, -0.5, 1, 0.6, 4.4, 5.6, M_V1_PIERRE); blk(2.8, -0.5, 1, 0.6, 4.4, 5.6, M_V1_PIERRE);
      blk(-1.9, -0.5, 3.8, 1.8, 4.4, 0.6, M_V1_PIERRE); blk(1.9, -0.5, 3.8, 1.8, 4.4, 0.6, M_V1_PIERRE); blk(0, 2.5, 3.8, 2.0, 1.9, 0.6, M_V1_PIERRE);
      // le fond : deux pans, et au milieu le mur qui ment
      blk(-1.9, -0.5, -1.8, 1.8, 4.4, 0.6, M_V1_PIERRE); blk(1.9, -0.5, -1.8, 1.8, 4.4, 0.6, M_V1_PIERRE); blk(0, 2.6, -1.8, 2.0, 1.8, 0.6, M_V1_PIERRE);
      mur('tertre', blk(0, -0.5, -1.8, 2.04, 3.1, 0.62, M_V1_PIERRE));
      // le roi : une dalle, ses os, sa couronne de cire ; des chandelles mortes
      blk(0, 0, 1.4, 1.2, 0.7, 2.4, M_V1_PIERRE);
      const fK = { x: v5Monde(fC, 0, 1.4)[0], y: yC + 0.7, z: v5Monde(fC, 0, 1.4)[1], r: a };
      prop('v5_os_tas', fK, 0, 0, 0.2, 0.3); prop('v5_cranes', fK, 0, 0, -0.85, 0, { n: 1 });
      objet('couronne', 'v5_couronne_cire', fK, 0, 0.18, -0.85, 'Une couronne de cire');
      prop('v5_chandelles', fC, -2.1, 0, 3.1, 0, { lit: false, v: 1 }); prop('v5_chandelles', fC, 2.1, 0, 3.1, 0, { lit: false, v: 2 });
      inter('v5_lire', 'v5_roi', fC, 0, 0.9, 2.95, 'Une inscription', { texte: 'roi' });
      // les marches, derrière : elles descendent de 3 m vers -z, puis la chambre du roi d'avant
      const y2 = yC - 3.0;
      v5Bloc(Z, { x: P.x, y: y2, z: P.z, r: a }, 0, 0, -4.4, 1.8, 3.0, 4.4, M_STONE, { sh: 2 });
      blk(0, -3.5, -4.4, 1.8, 0.5, 4.4, M_STONE);
      for (const s of [-1, 1]) blk(s * 1.2, -3.5, -4.4, 0.6, 6.6, 4.6, M_V1_PIERRE);
      for (let k = 0; k < 3; k++) blk(0, 2.6 - k * 1.0, -2.8 - k * 1.5, 2.6, 1.6, 1.6, M_V5_TUF, { ceil: true });
      const fC2 = { x: P.x, y: y2, z: P.z, r: a };
      const b2 = (lx, ly, lz, sx, sy, sz, m, o) => v5Bloc(Z, fC2, lx, ly, lz, sx, sy, sz, m, o);
      b2(0, -0.5, -9.0, 4.6, 0.5, 4.6, M_STONE); b2(0, 2.4, -9.0, 5.2, 1.0, 5.2, M_V5_TUF, { ceil: true });
      b2(-2.3, -0.5, -9.0, 0.6, 3.9, 4.6, M_V1_PIERRE); b2(2.3, -0.5, -9.0, 0.6, 3.9, 4.6, M_V1_PIERRE); b2(0, -0.5, -11.3, 4.6, 3.9, 0.6, M_V1_PIERRE);
      b2(-1.7, -0.5, -6.7, 1.4, 3.9, 0.6, M_V1_PIERRE); b2(1.7, -0.5, -6.7, 1.4, 3.9, 0.6, M_V1_PIERRE); b2(0, 2.8, -6.7, 2.2, 1.4, 0.6, M_V1_PIERRE);
      b2(0, 0, -9.3, 1.1, 0.6, 2.2, M_V1_PIERRE);
      const fK2 = { x: v5Monde(fC2, 0, -9.3)[0], y: y2 + 0.6, z: v5Monde(fC2, 0, -9.3)[1], r: a };
      prop('v5_os_tas', fK2, 0, 0, 0.1, 1.2); prop('v5_cranes', fK2, 0, 0, -0.8, 0.2, { n: 1 });
      objet('battant', 'v5_battant', fK2, 0, 0.05, 0.1, 'Un battant de cloche');
      inter('v5_lire', 'v5_roi2', fC2, 0, 0.9, -10.9, 'Une inscription', { texte: 'roi2' });
      // la sortie : au bout du couloir
      inter('v5_sortir', 'v5_tertre_sortir', fC, 0, 1.2, R0 - 0.9, 'Remonter au jour', { lieu: 'tertre' });
      const [ix, iz] = v5Monde(fC, 0, R0 - 1.6), [ox, oz] = v5Monde(fD, 0, 1.8);
      v.lieux.tertre = { x: P.x, z: P.z, dedans: [ix, yC + 0.02, iz], capDedans: a, dehors: [ox, O.hauteur(ox, oz) + 0.05, oz], capDehors: a + Math.PI };
      v.sous.push({ f: fC, hx: 3.2, hz: R0 + 1, y0: y2 - 1, y1: sol - 1.2 });
      v.abris.push({ x: P.x, z: P.z, r: R0 + 2, y0: y2 - 1, y1: sol });
      v.places.push({ x: v5Monde(fC2, 0, -9)[0], y: y2, z: v5Monde(fC2, 0, -9)[1], r: 2, type: 'gardien', id: 'v5_tertre', dessous: true });
      O.lieu('v5_tertre_creux', P.x, P.z, 14, 'le tertre creux', { secret: true });
    }
  }

  // ------------------------------------------------------------ 2. la chapelle murée (le Bois Mort)
  {
    const P = chercher('bois_mort', 10);
    if (P) {
      const sol = O.hauteur(P.x, P.z), a = O.rnd() * TAU;
      O.aplanir(P.x, P.z, 8, sol, 3);
      const f = { x: P.x, y: sol, z: P.z, r: a }, m = M_V1_PIERRE, W = 7, D = 10, H = 4.2, ep = 0.7;
      const blk = (lx, ly, lz, sx, sy, sz, mm, o) => v5Bloc(Z, f, lx, ly, lz, sx, sy, sz, mm, Object.assign({ surface: true }, o || {}));
      // la nef : deux murs longs, la façade percée (+z), un toit à moitié tombé
      blk(-W / 2, -0.6, 0, ep, H + 0.6, D, m); blk(W / 2, -0.6, 0, ep, H * 0.7 + 0.6, D, m);
      blk(-W / 4 - 0.6, -0.6, D / 2, W / 2 - 1.2, H + 0.6, ep, m); blk(W / 4 + 0.6, -0.6, D / 2, W / 2 - 1.2, H * 0.8 + 0.6, ep, m);
      blk(0, H - 0.6, D / 2, 2.6, 1.0, ep, m);
      blk(-1.2, H, -1.0, W / 2 + 1.6, 0.4, D - 3, M_SLATE, { er: 0.05 });
      // le clocher-mur au-dessus de la porte : vide (la cloche, on l'a descendue) ; une croix de pierre
      blk(-0.8, H + 0.4, D / 2, 0.5, 1.9, ep, m); blk(0.8, H + 0.4, D / 2, 0.5, 1.9, ep, m); blk(0, H + 2.3, D / 2, 2.1, 0.5, ep, m);
      blk(0, H + 2.8, D / 2, 0.2, 1.1, 0.2, m); blk(0, H + 3.35, D / 2, 0.75, 0.18, 0.18, m);
      // le chevet : deux pans et, au milieu, le mur qui ment ; derrière, la crypte (fermée, couverte)
      blk(-2.4, -0.6, -D / 2, 2.2, H + 0.6, ep, m); blk(2.4, -0.6, -D / 2, 2.2, H + 0.6, ep, m); blk(0, 2.7, -D / 2, 2.6, H - 2.7, ep, m);
      mur('chapelle', blk(0, -0.6, -D / 2, 2.64, 3.3, ep + 0.02, m));
      blk(0, -0.6, -D / 2 - 3.2, W, H + 0.6, ep, m); blk(-W / 2, -0.6, -D / 2 - 1.6, ep, H + 0.6, 3.2, m); blk(W / 2, -0.6, -D / 2 - 1.6, ep, H + 0.6, 3.2, m);
      blk(0, H, -D / 2 - 1.6, W + 0.6, 0.5, 3.9, M_SLATE);
      // l'autel, sa plaque ; dans la crypte : une niche, le sceau, des mots
      blk(0, -0.2, -D / 2 + 1.5, 2.0, 1.1, 0.9, m);
      inter('v5_lire', 'v5_chapelle', f, 0, 1.2, -D / 2 + 2.1, 'L’autel', { texte: 'chapelle' });
      const fK = { x: v5Monde(f, 0, -D / 2 - 1.6)[0], y: sol, z: v5Monde(f, 0, -D / 2 - 1.6)[1], r: a };
      prop('v5_niche', fK, 0, 0, -1.2, 0);
      objet('sceau', 'v5_sceau_ville', fK, 0, 0.32, -1.25, 'Un sceau de bronze');
      inter('v5_lire', 'v5_crypt', fK, 2.4, 1.4, 0, 'Des mots, au mur', { texte: 'crypt' });
      prop('v5_chandelles', fK, -2.3, 0, -0.9, 0, { lit: false, v: 0 });
      v.couverts.push({ f, hx: W / 2, hz: D / 2 + 3.4, y0: sol - 1, y1: sol + H });
      v.abris.push({ x: P.x, z: P.z, r: 7, y0: sol - 1, y1: sol + H });
      v.places.push({ x: P.x, y: sol, z: P.z, r: 4, type: 'rodeur', id: 'v5_chapelle', dessous: false });
      v.lieux.chapelle = { x: P.x, z: P.z };
      O.lieu('v5_chapelle_muree', P.x, P.z, 8, 'la chapelle murée', { secret: true });
    }
  }

  // ------------------------------------------------------------ 3. l'ermitage (les Ravines) : une cabane creusée dans la pente
  {
    // une pente : le sol monte d'au moins 3 m sur 7 m dans une direction
    let best = null;
    for (let k = 0; k < 8 && !best; k++) {
      const P = chercher('ravines', 5, (x, z) => {
        for (let q = 0; q < 8; q++) { const a = q * TAU / 8, h0 = O.hauteur(x, z), h1 = O.hauteur(x + Math.sin(a) * 7, z + Math.cos(a) * 7); if (h1 - h0 > 3 && h1 - h0 < 9) return true; }
        return false;
      });
      if (!P) continue;
      for (let q = 0; q < 16; q++) { const a = q * TAU / 16, h0 = O.hauteur(P.x, P.z), h1 = O.hauteur(P.x + Math.sin(a) * 7, P.z + Math.cos(a) * 7); if (h1 - h0 > 3 && (!best || h1 - h0 > best.dh)) best = { x: P.x, z: P.z, a, dh: h1 - h0 }; }
    }
    if (best) {
      const sol = O.hauteur(best.x, best.z);
      // la cabane : 4 × 4, l'arrière dans la pente (+z local = vers le haut de la pente)
      const f = { x: best.x + Math.sin(best.a) * 3.4, y: sol, z: best.z + Math.cos(best.a) * 3.4, r: best.a };
      // on creuse la pente là où sera la pièce (le sol de la pièce au niveau de l'entrée)
      O.B.forVerts(f.x, f.z, 4.2, (i, j, k, px, pz) => { const [lx, lz] = v5Local(f, px, pz); if (Math.abs(lx) < 2.6 && Math.abs(lz) < 2.6) Z.heights[k] = Math.min(Z.heights[k], sol); });
      const m = M_V1_PIERRE, blk = (lx, ly, lz, sx, sy, sz, mm, o) => v5Bloc(Z, f, lx, ly, lz, sx, sy, sz, mm, Object.assign({ surface: true }, o || {}));
      blk(0, -0.3, 0, 4.4, 0.32, 4.4, M_STONE);
      blk(-2.1, -0.6, 0, 0.6, 3.6, 4.8, m); blk(2.1, -0.6, 0, 0.6, 3.6, 4.8, m); blk(0, -0.6, 2.1, 4.8, 3.6, 0.6, m);
      blk(0, 2.6, 0, 5.2, 0.8, 5.2, M_ROCK);
      // la façade (vers le bas de la pente, -z) : des pierres sèches ; un pan ment
      blk(-1.5, -0.6, -2.1, 1.8, 3.6, 0.6, m); blk(1.5, -0.6, -2.1, 1.8, 3.6, 0.6, m); blk(0, 2.2, -2.1, 1.2, 0.8, 0.6, m);
      mur('ermitage', blk(0, -0.6, -2.1, 1.24, 2.82, 0.62, m));
      prop('v5_os_tas', f, -0.9, 0.02, 0.8, 0.6); prop('v5_cranes', f, -1.3, 0.02, 1.4, 0.4, { n: 1 });
      objet('carnet', 'v5_carnet_ermite', f, 1.1, 0.02, 1.2, 'Un carnet');
      inter('v5_lire', 'v5_ermitage', f, 1.7, 1.4, 0, 'Des traits, sur la pierre', { texte: 'ermitage' });
      v.couverts.push({ f, hx: 2.4, hz: 2.4, y0: sol - 1, y1: sol + 2.6 });
      v.abris.push({ x: f.x, z: f.z, r: 3, y0: sol - 1, y1: sol + 2.6 });
      v.places.push({ x: f.x, y: sol, z: f.z, r: 2, type: 'paisible', id: 'v5_ermitage', dessous: false });
      v.lieux.ermitage = { x: f.x, z: f.z };
      O.lieu('v5_ermitage', f.x, f.z, 6, 'l’ermitage', { secret: true });
    }
  }

  // ------------------------------------------------------------ 4. le brasier mort (les Cendrières)
  {
    const P = chercher('cendrieres', 6);
    if (P) {
      const sol = O.hauteur(P.x, P.z), a = O.rnd() * TAU, f = { x: P.x, y: sol, z: P.z, r: a };
      O.aplanir(P.x, P.z, 4, sol, 3);
      v.brasier = prop('v5_brasier', f, 0, 0, 0, 0, { pris: !!S.cendre });
      inter('v5_brasier', 'v5_brasier', f, 0, 0.9, 1.6, 'Le brasier mort', {});
      for (let k = 0; k < 4; k++) { const [x, z] = v5Monde(f, (O.rnd() - 0.5) * 9, (O.rnd() - 0.5) * 9); Z.blocks.push({ x, y: O.hauteur(x, z) - 0.4, z, sx: 0.22, sy: 1.6 + O.rnd() * 1.8, sz: 0.22, r: O.rnd(), m: M_DARK, sh: 0 }); }
      const [px, pz] = v5Monde(f, 3.2, -2.0);
      O.prop('v1_stele', px, O.hauteur(px, pz), pz, a + 2.2).v5 = true;
      O.inter('v5_lire', 'v5_brasier_pierre', px, O.hauteur(px, pz) + 1.4, pz, 'Une pierre noircie', { texte: 'brasier_pierre' });
      v.lieux.brasier = { x: P.x, z: P.z };
      O.lieu('v5_brasier_mort', P.x, P.z, 7, 'le brasier mort', { secret: true });
    }
  }

  // ------------------------------------------------------------ 5. les lettres d'A.
  {
    const V = Z.v5;
    // la première : un cairn dans la Ville Basse, à 60-110 m de la tonnellerie
    if (V) {
      const T = V.tonnellerie;
      let P = null;
      for (let k = 0; k < 300 && !P; k++) {
        const a = O.rnd() * TAU, d = 60 + O.rnd() * 50, x = T.x + Math.cos(a) * d, z = T.z + Math.sin(a) * d;
        if (!O.libre(x, z, 3) || O.surChemin(x, z, 1)) continue;
        P = { x, z };
      }
      if (P) {
        const sol = O.hauteur(P.x, P.z), f = { x: P.x, y: sol, z: P.z, r: O.rnd() * TAU };
        for (let k = 0; k < 5; k++) { const [x, z] = v5Monde(f, (k % 2 - 0.5) * 0.25, (k - 2) * 0.05); Z.blocks.push({ x, y: sol - 0.1 + k * 0.18, z, sx: 0.9 - k * 0.13, sy: 0.2, sz: 0.7 - k * 0.1, r: f.r + k * 0.4, m: M_V1_PIERRE, sh: 0 }); }
        objet('lettre', 'v5_lettre_1', f, 0.55, 0.02, 0.3, 'Une lettre, sous une pierre');
        inter('v5_lire', 'v5_cairn', f, 0, 0.9, 0, 'Un tas de pierres', { texte: 'cairn' });
        v.lieux.cairn = { x: P.x, z: P.z };
      }
      // la deuxième : dans une maison vide, près de la porte de la ville
      const pres = V.maisons.filter((M) => M.relie && !M.ossuaire).sort((a, b) => Math.hypot(a.x - V.porte.dedans[0], a.z - V.porte.dedans[1]) - Math.hypot(b.x - V.porte.dedans[0], b.z - V.porte.dedans[1]));
      const M = pres[0];
      if (M) { objet('lettre', 'v5_lettre_2', M.f, -M.w / 2 + 0.75, 0.58, -M.d / 2 + 1.6, 'Une lettre'); M.lettre = true; V.maisonLettre = M.id; }
      // la troisième : sur la table du greffe ; la quatrième : dans la salle d'avant, près de la lettre de notaire
      if (V.greffe) objet('lettre', 'v5_lettre_3', V.greffe.f, 1.4, 0.8, 1.3, 'Une lettre');
      if (V.salleAvant) objet('lettre', 'v5_lettre_4', V.salleAvant.f, -1.0, 0.8, 1.5, 'Une lettre');
    }
  }

  // ------------------------------------------------------------ 6. les souliers (l'Étang des Noyés) : au bord, rangés, la pointe vers l'eau
  {
    const WL = O.WL;
    const bord = (x, z) => { const h = O.hauteur(x, z); if (h < WL + 0.4 || h > WL + 2.2) return false; for (let k = 0; k < 8; k++) { const a = k * TAU / 8; if (O.hauteur(x + Math.cos(a) * 9, z + Math.sin(a) * 9) < WL - 0.3) return true; } return false; };
    const P = chercher('etang', 4, bord);
    if (P) {
      let best = 0, hb = 1e9;
      for (let k = 0; k < 16; k++) { const a = k * TAU / 16, h = O.hauteur(P.x + Math.sin(a) * 9, P.z + Math.cos(a) * 9); if (h < hb) { hb = h; best = a; } }
      const f = { x: P.x, y: O.hauteur(P.x, P.z), z: P.z, r: best };
      prop('v5_souliers', f, -0.55, 0, 0, 0.05, { v: 0 }); prop('v5_souliers', f, 0, 0, 0.05, -0.04, { v: 1 }); prop('v5_souliers', f, 0.45, 0, 0.1, 0.02, { v: 2 });
      inter('v5_lire', 'v5_souliers', f, 0, 0.4, -0.2, 'Des souliers', { texte: 'souliers' });
      v.lieux.souliers = { x: P.x, z: P.z };
    }
  }

  // ------------------------------------------------------------ 7. le banc du garde (le Seuil) : face à la Porte, il attendait quelqu'un
  {
    const Pt = Z.v1 && Z.v1.porte;
    const P = Pt ? chercher('seuil', 3, (x, z) => { const d = Math.hypot(x - Pt.x, z - Pt.z); return d > 28 && d < 80 && Math.abs(O.hauteur(x, z) - Pt.y) < 6; }) : null;
    if (P) {
      const a = Math.atan2(Pt.x - P.x, Pt.z - P.z), f = { x: P.x, y: O.hauteur(P.x, P.z), z: P.z, r: a };
      O.aplanir(P.x, P.z, 2.5, f.y, 2);
      prop('v5_banc', f, 0, 0, 0, 0);
      prop('v5_manteau', f, 0.35, 0.48, 0.02, 0.1);
      inter('v5_lire', 'v5_banc_garde', f, 0, 0.9, -0.3, 'Un banc, face à la Porte', { texte: 'banc' });
      v.lieux.banc = { x: P.x, z: P.z };
    }
  }
});

// ---------------------------------------------------------------- branchements
HOOKS.inter.v5_entrer = (it) => secretsV5.entrer(it);
HOOKS.inter.v5_sortir = (it) => secretsV5.entrer(it);
HOOKS.inter.v5_brasier = () => secretsV5.brasier();
for (const k of ['v5_entrer', 'v5_sortir', 'v5_brasier']) HOOKS.interVis[k] = () => zone.dedans;
