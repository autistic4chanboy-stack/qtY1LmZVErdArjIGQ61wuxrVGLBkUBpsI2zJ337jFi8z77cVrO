// ============================================================================
//  LES SCÈNES DES QUÊTES (agent Q20D, vingtième vague, lot 4) — 4. AILLEURS
//  Les quêtes qui se mènent hors de la vallée et qui n'avaient pas encore de
//  scènes (le recensement de Q20C, section D, les avait laissées de côté) :
//  - celui-ci : ce que partagent les trois fichiers du lot (l'état, le guet,
//    les donneurs des Souvenirs, les caméras dans une pièce, sous terre là où
//    le monde ne l'est pas), et le château de Hautguet (dans la Zone) : le
//    château vu de loin et son silence, les clés jusqu'au donjon, le feu du
//    Guet, le pont-levis, la Dame de la tour ;
//  - 4b : le Dessous (le Hameau d'En-Bas : entrer sans nom, les onze de 1631 ;
//    la Chambre des Gouttes : le onzième, la perle des dormeurs ; la porte des
//    Aëlim) et la niche scellée des Galeries (les runes) ;
//  - 4c : la pierre ronde et la cité des Maisons-d'Étoile (le seul voyage, le
//    Cœur), et les Terres d'Avant (sous chaque tertre un roi, le tertre scellé).
//  Elles ne passent ni par `quests` ni par `q16` : chacune a son état (etat(),
//  lu dans ce que son module retient déjà) et ses déclencheurs (un guet toutes
//  les deux secondes, dans la vallée comme dans la Zone, et quelques emballages
//  qui notent seulement ce qui vient de se passer). Leur monde (def.monde, les
//  outils de Q20B : 11-zzzzzzzzzzQ20-2a-outils.js) : chaque scène attend que le
//  joueur y soit. Rien n'est généré, rien ne change dans les quêtes elles-mêmes.
//  Ce que Q20D retient : farm.s.q20d (petites notes ; une partie d'avant n'en a
//  pas, et rien ne s'y rejoue). API : q20d (S, note, guetter), Q20D (outils).
// ============================================================================

// ---------------------------------------------------------------- les donneurs qui ne sont ni des habitants ni des Q16_PNJ
const Q20D_QUI = {
  'q20d:hautguet': 'Hautguet — le château des Hauts',
  'q20d:dessous': 'Le Dessous',
  'q20d:pierre': 'La pierre ronde',
  'q20d:zone': 'Les Terres d’Avant',
};
{
  const _quiDe = q20.quiDe.bind(q20), _nomDe = q20.nomDe.bind(q20);
  q20.quiDe = function (id) { const D = this.defs[id]; if (D && !D.qui && D.souv && Q20D_QUI[D.souv]) return D.souv; return _quiDe(id); };
  q20.nomDe = function (qui) { if (qui && Q20D_QUI[qui]) return Q20D_QUI[qui]; return _nomDe(qui); };
}
// (dans la Zone, q20B.ici() rend 'hautguet' partout où l'on est plus bas que la cour du château : zone.chateau.dedans()
// compte « sous le château » tout ce qui est sous son niveau. Loin du château — plus de V4_RAYON mètres —, c'est le reste
// de la Zone : les scènes de Hautguet attendent qu'on y soit, celles des Tertres peuvent se jouer. Contrat, section Q20D.)
if (typeof q20B !== 'undefined' && q20B.ici) {
  const _ici = q20B.ici.bind(q20B);
  q20B.ici = function () {
    const r = _ici();
    if (r !== 'hautguet') return r;
    try { const V = chateauV4.Z, p = game.player.pos; if (V && Math.hypot(p[0] - V.cx, p[2] - V.cz) > V4_RAYON) return 'zone'; } catch (e) { /* rien */ }
    return r;
  };
}
// (une fin déjà passée ne revient pas par un 'fin' redemandé : c'est le cadre qui le garde, q20.declencher)
// les Galeries (le labyrinthe de la vieille mine, sous la vallée) : un monde sous terre de plus pour la file de Q20B
if (typeof Q20B_SOUS !== 'undefined' && !Q20B_SOUS.galeries) Q20B_SOUS.galeries = { lm: 'galeries', r: 86 };

// ---------------------------------------------------------------- l'état, le guet
const q20d = {
  t: 2, guets: [],
  S() { const s = farm.s; if (!s) return {}; return s.q20d && typeof s.q20d === 'object' ? s.q20d : (s.q20d = { v: 1 }); },
  note(k, v) { const S = this.S(); if (!S[k]) S[k] = Object.assign({ j: farm.s ? farm.s.day : 0 }, v || {}); return S[k]; },
  // un guet : f() rend le moment à déclencher maintenant ('demande', 'tournant', 'fin'), ou rien
  guetter(id, f) { this.guets.push({ id, f }); },
  update(dt) {
    if (!farm.s || !game.started) return;
    this.t -= dt;
    if (this.t > 0) return;
    this.t = 2;
    for (const G of this.guets) {
      try { const m = G.f(); if (m && !this.passe(G.id, m)) q20.declencher(G.id, m); } catch (e) { if (!G.err) { G.err = 1; console.error('q20d ' + G.id, e); } }
    }
  },
  // un moment déjà passé (vu, sauté, rangé aux souvenirs) : pour une fin, l'une quelconque de ses fins
  passe(id, m) {
    const S = q20.S();
    if (!S) return true;
    if (m !== 'fin') return !!S.fait[q20.cle(id, m)];
    return q20.moments(id).some((k) => k.startsWith('fin') && S.fait[q20.cle(id, k)]);
  },
};
if (typeof window !== 'undefined') window.prairieQ20D = q20d;
{
  // (dans la vallée comme dans la Zone, la cité, le Dessous)
  const f = (dt) => q20d.update(dt);
  f.zone = true;
  HOOKS.update.push(f);
}
// l'état d'une quête d'ici : { q, Q, qui, actif, fini, pret, choix } (qui : null — pas de contrôle « habitant mort »)
function q20dE(titre, Q, actif, fini, choix, pret) { return { q: { title: titre }, Q: Q || null, qui: null, actif: !!actif && !fini, fini: !!fini, pret: !!actif && !!pret, choix: choix === undefined ? null : choix }; }

// ---------------------------------------------------------------- sous terre là où le monde ne l'est pas (la crypte, une chambre sous un tertre)
// (c.sous = true le temps de quelques plans : les caméras de Q20B, qui se cherchent entre les blocs)
{
  const D0 = Object.getOwnPropertyDescriptor(Q20Scene.prototype, 'sous');
  Object.defineProperty(Q20Scene.prototype, 'sous', {
    get() { return this._sous !== undefined ? this._sous : !!(D0 && D0.get && D0.get.call(this)); },
    set(v) { this._sous = v; },
    configurable: true,
  });
}

// (sous terre, dans une galerie ou une salle étroite, les caméras des scènes du lot gardent 0,6 m de libre autour d'elles :
// une poutre, un linteau, un pan de cabane collé à l'objectif bouchent l'image sans couper le regard)
{
  const _ls = Q20Scene.prototype.libreSous;
  if (_ls) Q20Scene.prototype.libreSous = function (L, P) { if (this.id && this.id.startsWith('q20d_') && qtDansBloc(L, P, 0.6)) return false; return _ls.call(this, L, P); };
}

// ---------------------------------------------------------------- de petits objets (dans le repère de la chose)
const Q20D_DESSINS = {
  // une clé noire, courte (la poterne) ; une clé ouvragée (la sacristie) ; la grande clé du donjon ; la petite clé de la tour
  cle_noire(PE) { const r = [0.2, 0.2, 0.22]; PE.box(0, 0.01, 0, 0.018, 0.02, 0.16, r, TL.iron); PE.box(0, 0.01, -0.09, 0.05, 0.02, 0.04, r, TL.iron); PE.box(0.02, 0.01, 0.07, 0.03, 0.02, 0.03, r, TL.iron); },
  cle_croix(PE) { const r = [0.62, 0.55, 0.4]; PE.box(0, 0.01, 0, 0.018, 0.02, 0.18, r, TL.iron); PE.box(0, 0.01, -0.1, 0.06, 0.02, 0.05, r, TL.iron); PE.box(0, 0.022, -0.1, 0.012, 0.006, 0.04, [0.3, 0.26, 0.2], TL.plain); PE.box(0.025, 0.01, 0.08, 0.035, 0.02, 0.03, r, TL.iron); },
  grande_cle(PE) { const r = [0.4, 0.4, 0.44]; PE.box(0, 0.015, 0, 0.03, 0.03, 0.46, r, TL.iron); PE.box(0, 0.015, -0.27, 0.12, 0.03, 0.09, r, TL.iron); PE.box(0.04, 0.015, 0.2, 0.06, 0.03, 0.06, r, TL.iron); PE.box(0.04, 0.015, 0.13, 0.04, 0.03, 0.03, r, TL.iron); },
  petite_cle(PE) { const r = [1.05, 0.9, 0.5]; PE.box(0, 0.008, 0, 0.012, 0.014, 0.1, r, TL.gold); PE.box(0, 0.008, -0.055, 0.035, 0.014, 0.03, r, TL.gold); PE.box(0.014, 0.008, 0.04, 0.02, 0.014, 0.02, r, TL.gold); },
  // le registre du portier, ouvert ; une feuille roulée
  registre(PE) { PE.box(0, 0.02, 0, 0.36, 0.04, 0.26, [0.4, 0.28, 0.18], TL.leather); PE.box(0, 0.042, 0, 0.34, 0.006, 0.24, [1.0, 0.94, 0.78], TL.paper); for (let k = 0; k < 7; k++) PE.box(-0.08 + (k % 2) * 0.16, 0.047, -0.08 + Math.floor(k / 2) * 0.05, 0.12, 0.003, 0.006, [0.25, 0.2, 0.15], TL.plain); },
  feuille(PE) { PE.box(0, 0.012, 0, 0.05, 0.024, 0.24, [1.0, 0.94, 0.8], TL.paper); },
  // la couverture de Thibaud, pliée (de la laine grise, une bande sombre)
  couverture(PE) { PE.box(0, 0.05, 0, 0.56, 0.1, 0.36, [0.86, 0.82, 0.74], TL.cloth || TL.plain); PE.box(0, 0.101, 0, 0.56, 0.004, 0.05, [0.4, 0.3, 0.22], TL.plain); PE.box(0.2, 0.101, 0, 0.04, 0.004, 0.36, [0.4, 0.3, 0.22], TL.plain); },
  // une jarre d'huile ; la lettre d'Ysolde, pliée
  jarre(PE) { PE.box(0, 0.16, 0, 0.24, 0.32, 0.24, [0.7, 0.5, 0.32], TL.plain); PE.box(0, 0.34, 0, 0.12, 0.05, 0.12, [0.6, 0.42, 0.28], TL.plain); },
  lettre(PE) { PE.box(0, 0.004, 0, 0.15, 0.006, 0.2, [1.05, 0.98, 0.84], TL.paper, 0.2); PE.box(0, 0.008, 0.0, 0.14, 0.003, 0.004, [0.6, 0.55, 0.45], TL.plain, 0.2); },
  // une flamme qui monte dans la corbeille du Guet (elle danse)
  flamme(PE, t) { PE.fl = FX_EMIT; for (let k = 0; k < 5; k++) { const a = k * 1.3 + (t || 0) * 2.1; PE.box(Math.sin(a) * 0.5, 0.4 + ((t || 0) * 0.9 + k * 0.21) % 1 * 1.1, Math.cos(a) * 0.5, 0.45, 0.6, 0.45, [1.6, 0.7 + k * 0.05, 0.2], TL.flame || TL.plain, a); } PE.fl = 0; },
};

// ---------------------------------------------------------------- les outils du lot
const Q20D = {
  // une interaction du monde (w.inter), par son identifiant : [x, y, z] (ou null)
  inter(c, id) { const I = (c.w.inter || []).find((i) => i.id === id); return I ? [I.x, I.y, I.z] : null; },
  // la première caméra qui ne tombe pas sur le repli, parmi plusieurs façons de cadrer (sinon la dernière)
  cam(c, ...fns) {
    let cam = null;
    for (let i = 0; i < fns.length; i++) {
      const r0 = c.repli;
      try { cam = fns[i](); } catch (e) { cam = null; }
      if (cam && !cam.repli) return cam;
      if (i < fns.length - 1) c.repli = r0;
    }
    return cam;
  },
  // quelques plans comme sous terre (la crypte, une chambre sous un tertre) : f() les fait ; c.sous rendu ensuite
  sous(c, f) { const s0 = c._sous; c._sous = true; try { return f(); } finally { c._sous = s0; } },
  // une flamme (bougie, brasero, lanterne posée) ; une lueur froide (la pierre qui luit, la lune)
  flamme(c, P, r, dy) { return c.lueur(P, r || 4, [1.0, 0.64, 0.3], dy ?? 0.4); },
  froide(c, P, r, dy) { return c.lueur(P, r || 4, [0.42, 0.7, 0.55], dy ?? 0.3); },
  lune(c, P, r) { return c.lueur(P, r || 18, [0.3, 0.34, 0.46], 6); },
  // une caméra DANS UNE PIÈCE close (le monde n'a pas de bâtiment w.bld : une salle du château, la tour, une chambre de
  // pierre) : P à hauteur he au-dessus du plancher y0, autour de T (en partant de l'angle a0, à d mètres), ni dans un bloc,
  // sous un plafond, au-dessus du plancher, dans la salle (o.dans(P) : un rectangle, un cercle), rien entre elle et T
  piece(c, T, o) {
    o = o || {};
    const w = c.w, L = c.blocs(T, (o.d || 2.6) * 2 + 10), y0 = o.y0 ?? T[1] - 1.2, he = o.he ?? 1.55, a0 = o.a ?? 0;
    const Ds = o.ds || [o.d || 2.6, (o.d || 2.6) * 0.8, (o.d || 2.6) * 1.25, (o.d || 2.6) * 0.62, (o.d || 2.6) * 1.5];
    for (const hh of [he, he + 0.35, he - 0.3]) for (let k = 0; k < 36; k++) {
      const a = a0 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * TAU / 36;
      for (const dd of Ds) {
        const P = [T[0] + Math.sin(a) * dd, y0 + hh, T[2] + Math.cos(a) * dd];
        try {
          if (o.dans && !o.dans(P)) continue;
          if (qtDansBloc(L, P, 0.32) || !qtSousToit(w, L, P)) continue;
          const g = w.groundAt(P[0], P[2], y0 + 0.4, 0.8);
          if (!(g > -1e8) || Math.abs(g - y0) > 0.7) continue;
          const v = [T[0] - P[0], T[1] - P[1], T[2] - P[2]], dv = Math.hypot(v[0], v[1], v[2]) || 1;
          if (qtRayon(w, L, P, [v[0] / dv, v[1] / dv, v[2] / dv], dv - 0.3)) continue;
          if (o.aussi && o.aussi.some((Q) => { const u = [Q[0] - P[0], Q[1] - P[1], Q[2] - P[2]], du = Math.hypot(u[0], u[1], u[2]) || 1; return !!qtRayon(w, L, P, [u[0] / du, u[1] / du, u[2] / du], du - 0.3); })) continue;
        } catch (e) { continue; }
        // (le travelling : un peu vers la cible, s'il reste libre)
        const k2 = o.recul ?? 0.1, Q2 = [P[0] + (T[0] - P[0]) * k2, P[1] + (o.monte || 0), P[2] + (T[2] - P[2]) * k2];
        let ok2 = true;
        try { ok2 = !qtDansBloc(L, Q2, 0.3) && (!o.dans || o.dans(Q2)); } catch (e) { ok2 = false; }
        return { de: { pos: P, look: T }, a: { pos: ok2 ? Q2 : P, look: o.vise2 || T }, dedans: null, vise: [T], toit: true };
      }
    }
    c.repli++;
    return { de: { pos: c.haut(T, 0.6), look: T }, a: { pos: c.haut(T, 0.6), look: T }, dedans: null, vise: [T], repli: true, toit: true };
  },
  // sur un acteur, dans une pièce : la tête (ou le buste), à d mètres, du côté cote (0 : de face)
  pieceActeur(c, A, o) {
    o = o || {};
    if (!A) return null;
    let T = c.tete(A, o.buste ? -0.42 : 0);
    if (o.avec) { const B = o.avec.k ? c.tete(o.avec, -0.2) : o.avec; T = c.vers(T, B, o.k ?? 0.4); }
    return Q20D.piece(c, T, Object.assign({ a: (A.cap || 0) + (o.cote ?? 0.45), y0: (A.vers || A.P)[1] }, o));
  },
  // le feu du Guet vu d'en haut (au-dessus du château, dans l'air) : G (le fanal), a (d'où), d (à quelle distance)
  dessus(c, G, a, d) { return Q20D.cam(c, () => c.camChose(c.haut(G, 1.2), { d: d || 16, haut: (G[1] - c.sol(G[0], G[2])) + 11, a, dy: 0, recul: 0.06 }), () => c.camChose(c.haut(G, 1.2), { d: (d || 16) * 1.3, haut: (G[1] - c.sol(G[0], G[2])) + 16, a: a + 0.8, dy: 0 })); },
  // un rectangle (salle) en coordonnées du monde, une marge m : pour piece({ dans })
  rect(x0, x1, z0, z1, m) { m = m ?? 0.35; return (P) => P[0] > x0 + m && P[0] < x1 - m && P[2] > z0 + m && P[2] < z1 - m; },
  rond(cx, cz, r) { return (P) => Math.hypot(P[0] - cx, P[2] - cz) < r; },
};

// ============================================================================
//  HAUTGUET (le château des Hauts, dans la Zone : monde 'hautguet')
// ============================================================================
// le château généré (chateauV4.Z) et un point du plan, en mètres locaux (x vers l'est, z vers le sud, y au-dessus du
// sol de la cour) : [x, y, z] du monde
function q20dHG() { return typeof chateauV4 !== 'undefined' && chateauV4.Z ? chateauV4.Z : null; }
function q20dL(V, x, y, z) { return [V.cx + x, V.y0 + y, V.cz + z]; }
function q20dV4() { try { return chateauV4.S(); } catch (e) { return null; } }
// les voix écrites du château (le registre, une feuille, une pierre) : pas de marmonnement
const Q20D_HG = {
  borne: 'Une borne, au bord du fossé',
  registre: 'Le registre de la porte',
  craie: 'À la craie, près de l’âtre',
  senechal: 'Hugues, sénéchal',
  fanal: 'Gravé sur le fût du fanal',
  lettre: 'Ysolde, « à qui ouvrira »',
};
// Thibaud, assis près du brasero de la salle du treuil (sa silhouette : Q20_LOOKS.thibaud, de Q20B), ou debout à une
// meurtrière ; o : options de l'acteur
function q20dThibaud(c, o, debout) {
  const V = q20dHG(), T = V && V.thibaud;
  if (!T) return null;
  c.masquer('thibaud');
  const P = debout ? q20dL(V, -105.4, 7, -3.5) : [T.x, T.y + 0.04, T.z];
  const look = Q20_LOOKS.thibaud || { skin: '#c8b49c', hair: '#c8c4bc', top: '#4a4238', bottom: '#3a342c', beard: 'longue', old: true, build: 'mince' };
  const A = c.gens(look, P, Object.assign({ cap: debout ? -Math.PI / 2 : T.r, geste: debout ? ['raide', { lookP: 0.1 }] : ['assis', 'penche', { lookP: 0.3 }] }, o));
  const br = q20dL(V, -99.0, 7, 4.6);
  return { V, A, P, br, lum: [Q20D.flamme(c, br, 5, 0.9)], nom: (typeof Q20B !== 'undefined' && Q20B.nom('thibaud')) || 'Thibaud', dans: Q20D.rect(V.cx - 106.3, V.cx - 92.3, V.cz - 9.3, V.cz + 9.3, 0.2) };
}
// la salle du treuil : une caméra sur Thibaud
function q20dCamThibaud(c, Th, o) {
  return Q20D.cam(c, () => Q20D.pieceActeur(c, Th.A, Object.assign({ cote: 0.5, d: 2.3, dans: Th.dans }, o)), () => Q20D.pieceActeur(c, Th.A, Object.assign({ cote: -0.7, d: 2.6, dans: Th.dans }, o)), () => c.camActeur(Th.A, Object.assign({ cote: 0.5, d: 2.4 }, o)));
}

// ---------------------------------------------------------------- LE CHÂTEAU DES HAUTS : vu de loin ; son silence
q20.scenes('q20d_hg_chateau', {
  souv: 'q20d:hautguet', titre: 'Le château des Hauts',
  monde: 'hautguet',
  delais: { fin: 9 },
  etat() {
    const S = q20dV4();
    if (!S || !farm.s) return q20dE('Le château des Hauts', null, false, false);
    return q20dE('Le château des Hauts', S.vus.arrivee || S.fin ? S : null, !!S.vus.arrivee, !!S.fin);
  },
  demande(c) {
    const V = q20dHG();
    if (!V) return null;
    const bo = Q20D.inter(c, 'v4_lire_borne') || q20dL(V, -124.4, 1.4, 7);
    const ch = q20dL(V, -20, 12, 0), pont = q20dL(V, -108, 4, 0);
    return [
      c.plan({ dur: 6.6, cam: Q20D.cam(c, () => c.camLieu(ch, { d: 150, haut: 9, dy: 0, a: -Math.PI / 2 + 0.25, recul: 0.06, stop: 40 }), () => c.camLieu(ch, { d: 120, haut: 14, dy: 0, a: -Math.PI / 2 - 0.3, stop: 40 }), () => c.camLieu(ch, { d: 170, haut: 20, dy: 0 })), acteurs: [], son: 'corbeau', dit: c.parole('(Des tours, et pas une lumière. On dirait qu’il attend quelqu’un.)', '') }),
      c.plan({ dur: 6.4, cam: Q20D.cam(c, () => c.camLieu(pont, { d: 22, haut: 2.0, dy: 0, a: -Math.PI / 2 + 0.32, recul: 0.08, stop: 2, aussi: [c.haut(bo, -0.5)] }), () => c.camLieu(pont, { d: 26, haut: 2.6, dy: 0, a: -Math.PI / 2 + 0.2, stop: 2 })), acteurs: [], dit: c.parole('HAUTGUET. ICI L’ON VEILLE, POUR QUE LA VILLE DORME.', Q20D_HG.borne), court: true }),
    ];
  },
  fin(c) {
    const V = q20dHG();
    if (!V) return null;
    const G = V.guet ? [V.guet.x, V.guet.y, V.guet.z] : q20dL(V, 49, 26, 5), pont = q20dL(V, -108, 0.6, 0);
    const feu = [c.lueur(G, 30, [1.0, 0.55, 0.22], 2), c.lueur(G, 12, [1.0, 0.7, 0.35], 1)];
    const fl = c.chose(Q20D_DESSINS.flamme, c.haut(G, 1.6), { s: 1.3 });
    return [
      c.plan({ dur: 7, cam: Q20D.dessus(c, G, -Math.PI / 2 + 0.5, 16), acteurs: [fl], lum: feu.concat([Q20D.lune(c, c.haut(G, -14), 30)]), dit: c.parole('Hautguet se tait.', ''), court: true }),
      c.plan({ dur: 6.4, cam: Q20D.cam(c, () => c.camLieu(pont, { d: 14, haut: 2.6, dy: 0, a: -Math.PI / 2 - 0.5, recul: 0.1, stop: 2 }), () => c.camLieu(pont, { d: 20, haut: 4, dy: 0, a: -Math.PI / 2 + 0.6, stop: 2 })), acteurs: [], lum: [Q20D.lune(c, pont, 22), c.lueur(c.haut(pont, 2), 10, [0.4, 0.42, 0.5], 1)], dit: c.parole('Pour la première fois, le silence ressemble à du sommeil.', '') }),
    ];
  },
});
q20d.guetter('q20d_hg_chateau', () => { const S = q20dV4(); if (!S || !farm.s.v4) return null; return S.fin ? 'fin' : S.vus.arrivee ? 'demande' : null; });

// ---------------------------------------------------------------- LES CLÉS DE HAUTGUET : la première clé ; la grande clé, dans la crypte ; le donjon
// (la première clé : celle du portier — la poterne — ou celle de la cuisinière — la sacristie, sur le chemin du donjon)
function q20dPris(id) { const S = q20dV4(); return S ? S.pris['o:' + id] || 0 : 0; }
q20.scenes('q20d_hg_cles', {
  souv: 'q20d:hautguet', titre: 'Les clés de Hautguet',
  monde: 'hautguet',
  delais: { demande: 2, tournant: 2.5, fin: 2 },
  etat() {
    const S = q20dV4();
    if (!S || !farm.s) return q20dE('Les clés de Hautguet', null, false, false);
    const prem = q20dPris('cle_poterne') || q20dPris('cle_chapelle'), N = q20d.S().terrasse;
    return q20dE('Les clés de Hautguet', prem || N ? { premier: q20d.S().cle1 || (q20dPris('cle_chapelle') && !q20dPris('cle_poterne') ? 'chapelle' : 'poterne') } : null, !!prem, !!N, null, !!q20dPris('cle_donjon'));
  },
  tournantSi() { return !!q20dPris('cle_donjon'); },
  demande(c) {
    const V = q20dHG();
    if (!V) return null;
    const pr = (c.Q && c.Q.premier) || 'poterne';
    if (pr === 'chapelle') {
      // les cuisines : la cuisinière morte contre l'âtre, la huche, les comptes à la craie
      const dans = Q20D.rect(V.cx - 25, V.cx - 4.5, V.cz - 58.2, V.cz - 41, 0.3);
      const hu = q20dL(V, -23.2, 0, -51.8), J = c.joueur(q20dL(V, -21.9, 0, -51.6), { face: hu, geste: 'penche', lanterne: true });
      const cle = c.chose(Q20D_DESSINS.cle_croix, c.haut(c.devant(J.P, J.cap, 0.32, 0.06, true), 1.05), { s: 1.5, r: J.cap, lueur: true });
      const mo = q20dL(V, -15.6, 0, -54.0), cr = q20dL(V, -20.4, 1.5, -55.4);
      return [
        c.plan({ dur: 6.4, cam: Q20D.cam(c, () => Q20D.pieceActeur(c, J, { cote: 1.1, d: 2.2, buste: true, dans, avec: cle.P, k: 0.3 }), () => Q20D.pieceActeur(c, J, { cote: -1.0, d: 2.4, dans })), acteurs: [J, cle], lum: [Q20D.flamme(c, J.P, 5, 1.2)], son: 'porte', dit: c.parole('Pain : quarante. Pain : trente. Pain : douze.', Q20D_HG.craie), court: true }),
        c.plan({ dur: 6.2, cam: Q20D.cam(c, () => Q20D.piece(c, c.haut(mo, 0.7), { a: 0.3, d: 2.4, y0: mo[1], dans, aussi: [cr] }), () => Q20D.piece(c, c.haut(mo, 0.7), { a: -0.8, d: 2.6, y0: mo[1], dans })), acteurs: [Object.assign({}, J, { vu: false })], lum: [Q20D.flamme(c, J.P, 5, 1.2), c.lueur(mo, 3.5, [0.7, 0.62, 0.55], 1)], dit: c.parole('Pain : un, pour la tour. Que le sire n’en sache rien.', Q20D_HG.craie) }),
      ];
    }
    // la loge du portier : Gaucher mort à sa table, son registre ; la clé au clou
    const dans = Q20D.rect(V.cx - 106.4, V.cx - 92.2, V.cz - 9.4, V.cz - 3.5, 0.25);
    const clou = q20dL(V, -106.2, 1.55, -6.0), J = c.joueur(q20dL(V, -105.1, 0, -6.1), { face: clou, geste: 'leve' });
    const cle = c.chose(Q20D_DESSINS.cle_noire, c.haut(c.devant(J.P, J.cap, 0.34, 0.05, true), 1.12), { s: 1.6, r: J.cap, lueur: true });
    const tb = q20dL(V, -101.6, 0.8, -7.6), mo = q20dL(V, -101.5, 0, -6.5);
    return [
      c.plan({ dur: 6.4, cam: Q20D.cam(c, () => Q20D.pieceActeur(c, J, { cote: 1.2, d: 2.3, buste: true, dans, avec: clou, k: 0.35 }), () => Q20D.pieceActeur(c, J, { cote: -1.2, d: 2.4, dans })), acteurs: [J, cle], lum: [c.lueur(J.P, 4, [0.62, 0.6, 0.58], 1.4)], son: 'porte', dit: c.parole('(Une étiquette de cuir, au clou : « poterne de l’est ».)', ''), court: true }),
      c.plan({ dur: 6.2, cam: Q20D.cam(c, () => Q20D.piece(c, tb, { a: Math.PI + 0.5, d: 1.9, y0: mo[1], dans, aussi: [c.haut(mo, 1.1)] }), () => Q20D.piece(c, tb, { a: 0.6, d: 2.1, y0: mo[1], dans })), acteurs: [Object.assign({}, J, { vu: false })], lum: [c.lueur(tb, 3.5, [0.75, 0.66, 0.55], 0.6)], son: 'page', dit: c.parole('Ordre du sire : le pont reste levé. … Je ne note plus les entrées. Il n’en vient plus.', Q20D_HG.registre) }),
    ];
  },
  tournant(c) {
    const V = q20dHG();
    if (!V) return null;
    // la crypte (sept mètres sous la cour) : le sénéchal adossé au pilier, la grande clé ; le tombeau vide d'Aymon
    const y = -7, dans = Q20D.rect(V.cx - 9.6, V.cx + 13.6, V.cz + 42.4, V.cz + 51.6, 0.3);
    return Q20D.sous(c, () => {
      const se = q20dL(V, 8, y, 50.0), J = c.joueur(q20dL(V, 10.2, y, 50.9), { face: se, geste: 'baisse', lanterne: true });
      const cle = c.chose(Q20D_DESSINS.grande_cle, c.haut(c.devant(J.P, J.cap, 0.36, 0.08, true), 1.0), { s: 1.3, r: J.cap, lueur: true });
      const gis = q20dL(V, 5, y, 47), bg = [q20dL(V, -7, y + 0.97, 48.4), q20dL(V, 5, y + 0.97, 48.6)];
      const lum = bg.map((P) => Q20D.flamme(c, P, 3.2, 0.3));
      return [
        c.plan({ dur: 6.6, cam: Q20D.cam(c, () => Q20D.piece(c, c.haut(se, 0.8), { a: 1.6, d: 2.4, y0: se[1], dans, aussi: [c.tete(J)] }), () => Q20D.piece(c, c.haut(se, 0.8), { a: 2.4, d: 2.2, y0: se[1], dans })), acteurs: [J, cle], lum, son: 'goutte', dit: c.parole('J’ai enfermé le sire dans son donjon, pour qu’il ne redescende plus.', Q20D_HG.senechal), court: true }),
        c.plan({ dur: 6.2, cam: Q20D.cam(c, () => Q20D.piece(c, c.haut(gis, 0.6), { a: 0.2, d: 2.6, y0: gis[1], dans }), () => Q20D.piece(c, c.haut(gis, 0.6), { a: -1.2, d: 2.8, y0: gis[1], dans })), acteurs: [Object.assign({}, J, { vu: false })], lum, dit: c.parole('Je garde la clé ici, avec ses pères. Dieu fera le reste.', Q20D_HG.senechal) }),
      ];
    });
  },
  fin(c) {
    const V = q20dHG();
    if (!V) return null;
    // la terrasse du donjon : le sire assis devant le fanal froid, la petite clé sous sa main ; puis la ville d'en bas
    const H = 26, G = V.guet ? [V.guet.x, V.guet.y, V.guet.z] : q20dL(V, 49, H, 5), sire = q20dL(V, 49.2, H, 8.6);
    const J = c.joueur(q20dL(V, 47.0, H, 10.8), { face: sire, geste: 'baisse' });
    const S = q20dV4(), feu = S && S.guet;
    return [
      c.plan({ dur: 6.8, cam: Q20D.cam(c, () => c.camChose(c.haut(sire, 0.9), { d: 3.0, haut: 1.6, a: Math.PI * 0.25, dy: 0 }), () => c.camChose(c.haut(sire, 0.9), { d: 3.4, haut: 2, a: -Math.PI * 0.4, dy: 0 })), acteurs: [J], lum: feu ? [c.lueur(G, 9, [1.0, 0.6, 0.28], 1.6)] : [], son: 'corbeau', dit: c.parole('TANT QUE LE FEU DU GUET BRÛLE, LA VILLE DORT.', Q20D_HG.fanal), court: true }),
      c.plan({ dur: 6.4, cam: Q20D.cam(c, () => c.camRegard(q20dL(V, 44, H, 15), q20dL(V, -600, -70, 760), { haut: 2.7, recul: 0.04 }), () => c.camLieu(G, { d: 14, haut: 4, dy: 1.2 })), acteurs: [], dit: c.parole('(D’ici, on voit toute la ville d’en bas. Elle ne dort pas, elle.)', '') }),
    ];
  },
});
q20d.guetter('q20d_hg_cles', () => {
  const S = q20dV4();
  if (!S || !farm.s.v4) return null;
  // (la première clé, celle par où l'on a commencé ; la terrasse, la première fois qu'on y monte, la porte haute ouverte)
  const N = q20d.S();
  if (!N.cle1 && (q20dPris('cle_poterne') || q20dPris('cle_chapelle'))) N.cle1 = q20dPris('cle_chapelle') && (!q20dPris('cle_poterne') || q20dPris('cle_chapelle') < q20dPris('cle_poterne')) ? 'chapelle' : 'poterne';
  if (!N.terrasse && S.portes.donjon === 'ouverte' && typeof zone !== 'undefined' && zone.dedans) { const s = chateauV4.salle(); if (s && s.id === 'terrasse') q20d.note('terrasse'); }
  if (N.terrasse) return 'fin';
  if (q20dPris('cle_donjon')) return null;
  return N.cle1 ? 'demande' : null;
});

// ---------------------------------------------------------------- LE FEU DU GUET (Thibaud en parle ; trois huiles, et il brûle)
q20.scenes('q20d_hg_guet', {
  qui: 'thibaud', titre: 'Le feu du Guet',
  monde: 'hautguet',
  delais: { demande: 1.5, fin: 6 },
  etat() {
    const S = q20dV4();
    if (!S || !farm.s) return q20dE('Le feu du Guet', null, false, false);
    return q20dE('Le feu du Guet', S.parle.t_guet || S.guet ? S : null, !!S.parle.t_guet, !!S.guet);
  },
  demande(c) {
    const Th = q20dThibaud(c, { geste: ['assis', 'penche', 'parle', { lookP: 0.2 }] });
    if (!Th) return null;
    const V = Th.V, G = V.guet ? [V.guet.x, V.guet.y, V.guet.z] : q20dL(V, 49, 26, 5);
    return [
      c.plan({ dur: 6.6, cam: q20dCamThibaud(c, Th), acteurs: [Th.A], lum: Th.lum, dit: c.parole('Le feu du Guet ? Il faut de l’huile. Beaucoup. Il n’y en a plus. Et il n’y a plus personne pour la monter.', Th.nom, 0.7), court: true }),
      c.plan({ dur: 6.2, cam: Q20D.cam(c, () => c.camLieu(G, { d: 46, haut: 4, dy: -3, a: -Math.PI / 2 + 0.3, vise2: c.haut(G, 1.5), recul: 0.08, stop: 4 }), () => c.camLieu(G, { d: 60, haut: 8, dy: -3, a: Math.PI * 0.8, stop: 4 })), acteurs: [], son: 'corbeau', dit: c.parole('On le voyait de la ville d’en bas. Tant qu’il brûlait, ils dormaient.', Th.nom, 0.7) }),
    ];
  },
  fin(c) {
    const V = q20dHG();
    if (!V) return null;
    const H = 26, G = V.guet ? [V.guet.x, V.guet.y, V.guet.z] : q20dL(V, 49, H, 5);
    const fl = c.chose(Q20D_DESSINS.flamme, c.haut(G, 1.6), { s: 1.3 });
    const J = c.joueur(q20dL(V, 46.6, H, 7.6), { face: G, geste: 'leve' });
    const feu = [c.lueur(G, 14, [1.0, 0.56, 0.24], 2.2), c.lueur(G, 6, [1.0, 0.74, 0.4], 1.2)];
    const T = chateauV4.thibaudEtat ? chateauV4.thibaudEtat() : 'treuil', vit = T === 'treuil' || T === 'baisse';
    return [
      c.plan({ dur: 6.8, cam: Q20D.cam(c, () => c.camActeur(J, { cote: 2.5, d: 3.4, haut: 1.5, avec: c.haut(G, 1.6), k: 0.35, recul: 0.04 }), () => c.camChose(c.haut(G, 2), { d: 4.5, haut: 2, a: 0.8, dy: 0 })), acteurs: [J, fl], lum: feu, son: 'grondement', dit: c.parole('TANT QUE LE FEU DU GUET BRÛLE, LA VILLE DORT.', Q20D_HG.fanal), court: true }),
      c.plan({ dur: 6.4, cam: Q20D.dessus(c, G, Math.PI * 0.75, 18), acteurs: [fl], lum: [c.lueur(G, 30, [1.0, 0.52, 0.2], 3), c.lueur(G, 12, [1.0, 0.7, 0.35], 1), Q20D.lune(c, c.haut(G, -14), 30)], dit: vit ? c.parole('Il brûle. … En bas, ils vont pouvoir dormir.', (typeof Q20B !== 'undefined' && Q20B.nom('thibaud')) || 'Thibaud', 0.7) : c.parole('(Toute la Zone, en bas, doit le voir.)', '') }),
    ];
  },
});
q20d.guetter('q20d_hg_guet', () => { const S = q20dV4(); if (!S || !farm.s.v4) return null; return S.guet ? 'fin' : S.parle.t_guet ? 'demande' : null; });

// ---------------------------------------------------------------- LE PONT-LEVIS (« n'y touchez pas » ; baissé ; le lendemain, au bout du pont)
q20.scenes('q20d_hg_pont', {
  qui: 'thibaud', titre: 'Le pont-levis',
  monde: 'hautguet',
  delais: { demande: 1.5, tournant: 10, fin: 2 },
  etat() {
    const S = q20dV4();
    if (!S || !farm.s) return q20dE('Le pont-levis', null, false, false);
    const T = S.thibaud || {}, bout = T.etat === 'bout' || (T.etat === 'baisse' && farm.s.day > (T.jour || 0)) || T.etat === 'parti';
    return q20dE('Le pont-levis', S.parle.t_treuil || S.leviers.pont ? S : null, !!S.parle.t_treuil || !!S.leviers.pont, bout && !!q20d.S().bout, null, !!S.leviers.pont);
  },
  tournantSi() { const S = q20dV4(); return !!(S && S.leviers.pont); },
  demande(c) {
    const Th = q20dThibaud(c, { geste: ['assis', 'penche', { lookP: 0.15 }] });
    if (!Th) return null;
    const V = Th.V, tr = q20dL(V, -104.4, 7.9, 0), fo = q20dL(V, -110.4, -5.6, 0.2);
    return [
      c.plan({ dur: 6.6, cam: q20dCamThibaud(c, Th, { avec: tr, k: 0.25 }), acteurs: [Th.A], lum: Th.lum, dit: c.parole('N’y touchez pas. S’il baisse, ils monteront tous.', Th.nom, 0.7), court: true }),
      c.plan({ dur: 6.4, cam: Q20D.cam(c, () => c.camChose(fo, { d: 7, haut: 6.2, a: -Math.PI / 2 - 0.4, dy: 0 }), () => c.camChose(fo, { d: 9, haut: 7.5, a: -Math.PI / 2 + 0.5, dy: 0 }), () => c.camLieu(q20dL(V, -108, 0, 0), { d: 18, haut: 4 })), acteurs: [], son: 'murmure', dit: c.parole('Ils attendent au fossé. Ils attendent depuis si longtemps.', Th.nom, 0.7) }),
    ];
  },
  tournant(c) {
    const Th = q20dThibaud(c, { geste: ['raide', { lookP: 0.05 }] }, true);
    if (!Th) return null;
    const V = Th.V, mt = q20dL(V, -106.4, 8.6, -3.5), pont = q20dL(V, -114, 0.4, 0);
    return [
      c.plan({ dur: 6.6, cam: Q20D.cam(c, () => Q20D.pieceActeur(c, Th.A, { cote: -2.3, d: 2.8, he: 1.5, dans: Th.dans, avec: mt, k: 0.2 }), () => Q20D.pieceActeur(c, Th.A, { cote: -1.6, d: 2.6, he: 1.5, dans: Th.dans }), () => Q20D.pieceActeur(c, Th.A, { cote: 1.9, d: 2.9, he: 1.45, dans: Th.dans })), acteurs: [Th.A], lum: Th.lum, dit: c.parole('Personne ne monte. Vous voyez ? Personne.', Th.nom, 0.7), court: true }),
      c.plan({ dur: 6.2, cam: Q20D.cam(c, () => c.camLieu(pont, { d: 26, haut: 5, dy: 0.5, a: -Math.PI / 2 - 0.25, recul: 0.06, stop: 3 }), () => c.camLieu(pont, { d: 34, haut: 8, dy: 0.5, a: -Math.PI / 2 + 0.6, stop: 3 })), acteurs: [], son: 'corbeau' }),
    ];
  },
  fin(c) {
    const V = q20dHG();
    if (!V || !V.thibaudBout) return null;
    const B = [V.thibaudBout.x, V.thibaudBout.y, V.thibaudBout.z], r = V.thibaudBout.r;
    // (sa couverture pliée sur le banc, dans la salle du treuil, vide)
    const bc = q20dL(V, -97.6, 7, 6.6), co = c.chose(Q20D_DESSINS.couverture, c.haut(bc, 0.49), { r: Math.PI / 2, s: 1.3 });
    const dans = Q20D.rect(V.cx - 106.3, V.cx - 92.3, V.cz - 9.3, V.cz + 9.3, 0.2);
    return [
      c.plan({ dur: 7, cam: Q20D.cam(c, () => c.camChose(c.haut(B, 0.8), { d: 3.4, haut: 1.4, a: r + 0.55, dy: 0 }), () => c.camChose(c.haut(B, 0.8), { d: 4, haut: 1.8, a: r - 0.7, dy: 0 })), acteurs: [], son: 'corbeau', dit: c.parole('(Il est assis au bout du pont, face aux Degrés. Il a l’air d’attendre encore.)', ''), court: true }),
      c.plan({ dur: 6, cam: Q20D.cam(c, () => Q20D.piece(c, c.haut(bc, 0.5), { a: 2.6, d: 2.2, y0: bc[1], dans }), () => Q20D.piece(c, c.haut(bc, 0.5), { a: -2.2, d: 2.4, y0: bc[1], dans })), acteurs: [co], lum: [Q20D.flamme(c, q20dL(V, -99.0, 7, 4.6), 4, 0.9)], dit: c.parole('(Sa couverture est pliée sur le banc.)', '') }),
    ];
  },
});
q20d.guetter('q20d_hg_pont', () => {
  const S = q20dV4();
  if (!S || !farm.s.v4) return null;
  // (le lendemain du pont baissé : quand on revient au château et qu'il est au bout du pont)
  if (S.leviers.pont && typeof zone !== 'undefined' && zone.dedans && q20B.ici() === 'hautguet' && chateauV4.thibaudEtat() === 'bout') { q20d.note('bout'); return 'fin'; }
  if (q20d.S().bout) return 'fin';
  return S.parle.t_treuil && !S.leviers.pont ? 'demande' : null;
});

// ---------------------------------------------------------------- LA DAME DE LA TOUR (la nuit, derrière sa porte ; la clé qu'elle entend ; la chambre)
// la porte de la tour (dehors, devant), l'endroit où l'on frappe, sa fenêtre là-haut, la chambre
function q20dTour(c) {
  const V = q20dHG(), Pt = V && V.pts && V.pts.tour_dame;
  if (!Pt) return null;
  const ad = 7 * Math.PI / 4, cx = V.cx + 72, cz = V.cz - 60, ri = 5;
  const porte = [cx + Math.sin(ad) * 5.6, V.y0, cz + Math.cos(ad) * 5.6];
  return { V, ad, cx, cz, ri, P: [Pt.x, Pt.y, Pt.z], porte, haut: V.dame ? [V.dame.x, V.dame.y + 1.2, V.dame.z] : [cx, V.y0 + 25, cz], yt: V.y0 + 24,
    lum: [c.lueur(porte, 2.6, [1.0, 0.6, 0.28], 0.12), c.lueur(porte, 7, [0.26, 0.26, 0.32], 2.4)],
    dans: Q20D.rond(cx, cz, ri - 0.45) };
}
const Q20D_DAME = 'Ysolde, derrière la porte';
q20.scenes('q20d_hg_dame', {
  qui: 'dame', titre: 'La Dame de la tour',
  monde: 'hautguet',
  delais: { demande: 1.2, tournant: 1.2, fin: 3 },
  etat() {
    const S = q20dV4();
    if (!S || !farm.s) return q20dE('La Dame de la tour', null, false, false);
    const D = S.dame || {}, N = q20d.S().dame;
    return q20dE('La Dame de la tour', D.n || D.fin ? D : null, !!D.n, !!D.fin, D.fin ? (N ? (N.pont ? 0 : 1) : (S.leviers.pont ? 0 : 1)) : null, !!q20d.S().dameCle);
  },
  tournantSi() { return !!q20d.S().dameCle; },
  demande(c) {
    const T = q20dTour(c);
    if (!T) return null;
    const J = c.joueur(T.P, { face: T.porte, geste: 'leve' });
    return [
      c.plan({ dur: 6.6, cam: Q20D.cam(c, () => c.camActeur(J, { cote: 2.3, d: 3.4, avec: c.haut(T.porte, 1.3), k: 0.5 }), () => c.camActeur(J, { cote: -2.3, d: 3.6, avec: c.haut(T.porte, 1.3), k: 0.5 })), acteurs: [J], lum: T.lum, son: 'coups', dit: c.parole('Qui est là ? … Ce n’est pas son pas. Ce n’est pas le pas d’Aymon.', Q20D_DAME, 1.2), court: true }),
      c.plan({ dur: 6.2, cam: Q20D.cam(c, () => c.camChose(c.haut(T.porte, 0.25), { d: 2.0, haut: 0.95, a: T.ad + 0.35, dy: 0, recul: 0.1 }), () => c.camChose(c.haut(T.porte, 0.25), { d: 2.4, haut: 1.0, a: T.ad - 0.35, dy: 0 })), acteurs: [Object.assign({}, J, { vu: false })], lum: T.lum.concat([c.lueur(T.porte, 1.6, [1.0, 0.62, 0.3], 0.05)]), dit: c.parole('Aude. Elle avait neuf ans. Elle voulait voir la foire.', Q20D_DAME, 1.2) }),
    ];
  },
  tournant(c) {
    const T = q20dTour(c);
    if (!T) return null;
    const J = c.joueur(c.devant(T.P, T.ad + Math.PI, -0.9, 0), { face: T.porte, geste: 'tend' });
    const cle = c.chose(Q20D_DESSINS.petite_cle, c.haut(c.devant(J.P, J.cap, 0.34, 0.02, true), 1.1), { s: 2, r: J.cap, lueur: true });
    return [
      c.plan({ dur: 6.6, cam: Q20D.cam(c, () => c.camActeur(J, { cote: 1.6, d: 2.0, buste: true, avec: cle.P, k: 0.3 }), () => c.camActeur(J, { cote: -1.6, d: 2.2, buste: true })), acteurs: [J, cle], lum: T.lum, son: 'clochette', dit: c.parole('Tu as la clé. Je l’entends tinter.', Q20D_DAME, 1.2), court: true }),
      c.plan({ dur: 6, cam: Q20D.cam(c, () => c.camActeur(J, { cote: 2.6, d: 3.4, avec: c.haut(T.porte, 1.2), k: 0.35, recul: 0.04 }), () => c.camChose(c.haut(T.porte, 1.0), { d: 2.6, haut: 1.4, a: T.ad + 0.5, dy: 0 })), acteurs: [J], lum: T.lum, dit: c.parole('Ouvre, si tu veux. Il n’y a plus ici qu’une vieille femme.', Q20D_DAME, 1.2) }),
    ];
  },
  fins: {
    // le pont était baissé quand on a ouvert : « alors je peux dormir »
    0(c) { return q20dDameFin(c, 'Si le pont est baissé quand tu liras ceci, alors je peux dormir.', 'Je l’ai regardée descendre les Degrés depuis ma fenêtre, jusqu’à ce que la brume la prenne.'); },
    // il ne l'était pas : « il n'a pas voulu baisser le pont »
    1(c) { return q20dDameFin(c, 'Il n’a pas voulu baisser le pont. Il a fermé ma porte, et il a emporté la clé.', 'Le soir, j’ai vu les torches monter. J’ai entendu sa voix au fossé, ou j’ai cru l’entendre.'); },
  },
});
// la chambre en haut de la tour : elle, morte, assise à sa fenêtre ; sa lettre près des bougies ; dehors, la Ville Basse
function q20dDameFin(c, t1, t2) {
  const T = q20dTour(c);
  if (!T) return null;
  const V = T.V, fz = V.dame ? [V.dame.x, T.yt, V.dame.z] : [T.cx, T.yt, T.cz];
  const bg = [T.cx - 2.2, T.yt + 0.75, T.cz + 1.0], le = [T.cx - 2.0, T.yt + 0.77, T.cz + 0.8];
  const J = c.joueur([T.cx + 0.8, T.yt, T.cz + 1.4], { face: fz, geste: 'baisse' });
  const lum = [Q20D.flamme(c, bg, 4.5, 0.3), c.lueur(fz, 3, [0.5, 0.52, 0.6], 1.2)];
  const fen = c.devant(fz, T.ad, 2.2, 0);
  fen[1] = T.yt + 1.2;
  const loin = [fz[0] + Math.sin(T.ad) * 300, V.y0 - 40, fz[2] + Math.cos(T.ad) * 300];
  return [
    c.plan({ dur: 7, cam: Q20D.cam(c, () => Q20D.piece(c, c.haut(fz, 1.0), { a: T.ad + Math.PI + 0.5, d: 2.4, y0: T.yt, dans: T.dans, aussi: [c.tete(J)] }), () => Q20D.piece(c, c.haut(fz, 1.0), { a: T.ad + Math.PI - 0.6, d: 2.2, y0: T.yt, dans: T.dans })), acteurs: [J], lum, son: 'page', dit: c.parole(t1, Q20D_HG.lettre), court: true }),
    c.plan({ dur: 6.4, cam: Q20D.cam(c, () => Q20D.piece(c, fen, { a: T.ad + Math.PI, d: 2.0, y0: T.yt, dans: T.dans, vise2: c.vers(fen, loin, 0.02) }), () => Q20D.piece(c, c.haut(le, 0.1), { a: 0.8, d: 1.6, y0: T.yt, dans: T.dans })), acteurs: [Object.assign({}, J, { vu: false })], lum, dit: c.parole(t2, Q20D_HG.lettre) }),
  ];
}
q20d.guetter('q20d_hg_dame', () => { const S = q20dV4(); if (!S || !farm.s.v4) return null; const D = S.dame || {}; return D.fin ? 'fin' : D.n ? 'demande' : null; });
// (ce que la Dame entend : la petite clé ; la porte ouverte, le pont baissé ou non à ce moment-là)
HOOKS.load.push(() => {
  if (typeof chateauV4 === 'undefined' || chateauV4._q20d) return;
  chateauV4._q20d = true;
  const _pd = chateauV4.parlerDame.bind(chateauV4);
  chateauV4.parlerDame = function () {
    try { const D = this.S().dame; if (!D.fin && D.n && this.nuit() && farm.count('v4_cle_tour') && !q20d.S().dameCle) q20d.note('dameCle'); } catch (e) { console.error('q20d', e); }
    return _pd();
  };
  const _dv = chateauV4.deverrouiller.bind(chateauV4);
  chateauV4.deverrouiller = function (dr, comment) {
    try { const v = dr && dr.v4; if (v && v.id === 'tour_dame' && !q20d.S().dame) q20d.note('dame', { pont: this.S().leviers.pont ? 1 : 0 }); } catch (e) { console.error('q20d', e); }
    return _dv(dr, comment);
  };
});
