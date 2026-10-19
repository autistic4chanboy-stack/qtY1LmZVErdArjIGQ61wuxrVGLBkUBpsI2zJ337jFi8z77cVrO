// ============================================================================
//  LES SCÈNES DES QUÊTES (agent Q20D, lot 4) — 4b. LE DESSOUS ET LES GALERIES
//  - le Hameau d'En-Bas (monde 'dessous') : entrer sans nom (la pierre d'appel,
//    le guetteur, les trois façons d'être admis) ; les onze de 1631 (le pain
//    rompu en onze, la peau pliée, la question du vieux et sa réponse) ;
//  - la Chambre des Gouttes : le onzième (le carnet de la cabane vide, le mort
//    qui porte des bottes) ; la perle des dormeurs (prise, puis rendue) ;
//  - la porte des Aëlim, dans la Ville engloutie (l'œil, la lumière, le coffre) ;
//  - la niche scellée des Galeries (monde 'galeries' : le labyrinthe de la vieille
//    mine, sous la vallée), celle des runes.
//  Les gens d'en bas : leurs silhouettes, leurs places, leur parler (Q20BD, de Q20B).
// ============================================================================
Object.assign(Q20D_DESSINS, {
  // la peau pliée (des noms à l'encre brune, des encoches dessous) ; le bâton à encoches ; le carnet gonflé d'eau
  peau(PE) { PE.box(0, 0.01, 0, 0.34, 0.016, 0.26, [0.92, 0.84, 0.68], TL.leather, 0.1); for (let k = 0; k < 11; k++) { PE.box(-0.07, 0.02, -0.11 + k * 0.021, 0.12, 0.003, 0.006, [0.32, 0.2, 0.12], TL.plain, 0.1); PE.box(0.07, 0.02, -0.11 + k * 0.021, 0.08 - (k === 10 ? 0.07 : 0), 0.003, 0.006, [0.22, 0.16, 0.1], TL.plain, 0.1); } },
  baton(PE) { PE.box(0, 0.02, 0, 0.035, 0.035, 0.9, [0.58, 0.46, 0.32], TL.wood, 0.05); for (let k = 0; k < 9; k++) PE.box(0.018, 0.025, -0.36 + k * 0.09, 0.006, 0.02, 0.012, [0.22, 0.16, 0.1], TL.plain); },
  carnet(PE) { PE.box(0, 0.02, 0, 0.13, 0.04, 0.19, [0.36, 0.3, 0.24], TL.leather, 0.2); PE.box(0.004, 0.022, 0, 0.12, 0.034, 0.18, [0.9, 0.84, 0.66], TL.paper, 0.2); },
  // une part de pain sur la pierre ; une perle des cavernes ; le miroir des Aëlim
  part(PE) { PE.box(0, 0.025, 0, 0.09, 0.05, 0.07, [1.05, 0.74, 0.42], TL.bread || TL.plain, 0.4); },
  perle(PE) { PE.fl = FX_HI; PE.box(0, 0.02, 0, 0.032, 0.032, 0.032, [1.4, 1.36, 1.28], TL.plain); PE.fl = 0; },
  miroir(PE) { PE.box(0, 0.012, 0, 0.2, 0.024, 0.26, [0.9, 0.8, 0.5], TL.gold); PE.box(0, 0.026, 0, 0.16, 0.006, 0.22, [0.75, 0.85, 1.05], TL.glass); },
  // un point de lumière (la flamme ramassée par le cristal)
  point(PE) { PE.fl = FX_EMIT; PE.box(0, 0, 0, 0.05, 0.05, 0.05, [1.8, 1.5, 1.0], TL.plain); PE.fl = 0; },
});

// ---------------------------------------------------------------- les gens d'en bas, là où la scène les veut
// (k : leur nombre ; le vrai est caché le temps de la scène ; o : options de l'acteur)
function q20dPale(c, k, P, o) {
  if (typeof soutTerres === 'undefined' || !P) return null;
  const e = (soutTerres.list || []).find((q) => q.k === k && !q.mort);
  if (!e) return null;
  c.masquer('sout:' + k);
  const look = Object.assign({}, e.g.look), A = c.gens(look, P, o || {});
  if (A) A.s = look.height || 1;
  return A ? { A, e, nom: Q20B.nom('sout:' + k), voix: e.g.voix || 1 } : null;
}
// le hameau : la place, la pierre d'appel (et la face aux entailles), l'entrée, les cabanes, la maison des encoches
function q20dHameau(c) {
  const V = Q20BD.V(c);
  if (!V || !V.appel) return null;
  const ap = c.ptSous(V.appel[0], V.appel[2], V.appel[1] + 0.3), rA = V.appel[3];
  return { V, place: Q20BD.place(c), ap, rA, garde: V.garde ? c.ptSous(V.garde[0], V.garde[1], ap[1] + 0.3) : ap, entree: V.entree ? c.ptSous(V.entree[0], V.entree[1], ap[1] + 0.3) : ap };
}
// les lueurs du hameau, pour un plan large : les portes des cabanes, la place
function q20dLueursHameau(c, Hm) { return Hm.V.huttes.slice(0, 6).map((H) => c.lueur(c.ptSous(H.porte[0], H.porte[1]), 8, [0.55, 0.86, 0.7], 1.2)).concat([c.lueur(Hm.place, 14, [0.6, 0.9, 0.75], 3), c.lueur(Hm.place, 6, [0.5, 0.8, 0.66], 1)]); }
// le joueur devant la pierre d'appel (là où il était, s'il est là : la scène se joue sur place)
function q20dDevantAppel(c, Hm) { const p = game.player; if (!c.rejeu && p && Math.hypot(p.pos[0] - Hm.ap[0], p.pos[2] - Hm.ap[2]) < 6) return c.ptSous(p.pos[0], p.pos[2], p.pos[1] + 0.3); return Q20B.libre(c, Q20B.devant(c, Hm.ap, Hm.rA, 1.3, 0), 0, 2, 0.4); }
// la Chambre des Gouttes : les dormeurs ; ses vasques (la première prise, sinon la première)
function q20dDormeurs(c) {
  const X = c.w.soutSecrets, L = X && X.dormeurs;
  if (!L || !L.length) return null;
  const vas = (c.w.soutCueillettes || []).map((i) => c.w.props[i]).filter((q) => q && q.id === 'sout_vasque' && souterrain.salleIci(q.x, q.z) === 'dormeurs');
  const pr = vas.find((q) => q.data && q.data.pris) || vas[0] || null;
  const salle = typeof SOUT_PLAN !== 'undefined' && SOUT_PLAN.salles.find((q) => q[0] === 'dormeurs');
  // (une chambre sans vasque : la goutte qui tombe sur le petit, toujours au même endroit)
  const petit = L[5] ? c.ptSous(L[5][0], L[5][2], L[5][1] + 0.3) : null;
  return { L, bottes: c.ptSous(L[0][0], L[0][2], L[0][1] + 0.3), petit, vasque: pr ? [pr.x, pr.y, pr.z] : petit || c.ptSous(L[0][0], L[0][2], L[0][1] + 0.3), C: salle ? c.ptSous(salle[1], salle[2]) : c.ptSous(L[0][0], L[0][2]) };
}

// ---------------------------------------------------------------- SANS NOM : la pierre d'appel, le guetteur ; admis (en se taisant, « frè », « onz »)
q20.scenes('q20d_so_appel', {
  qui: 'sout:se', titre: 'Sans nom',
  monde: 'dessous',
  delais: { demande: 1.5, tournant: 4, fin: 9 },
  etat() {
    if (!farm.s || typeof soutTerres === 'undefined') return q20dE('Sans nom', null, false, false);
    const T = soutTerres.S(), vu = souterrain.S().vu.hameau, N = q20d.S().appel;
    return q20dE('Sans nom', vu || T.appelVu || T.admis ? T : null, !!(vu || T.appelVu), !!T.admis, T.admis ? (N ? N.c : 0) : null, !!T.refus);
  },
  tournantSi() { return !!(typeof soutTerres !== 'undefined' && soutTerres.S().refus); },
  demande(c) {
    const Hm = q20dHameau(c);
    if (!Hm) return null;
    const Se = q20dPale(c, 'se', Hm.garde, { face: Hm.entree, geste: ['raide', { lookP: 0.05 }] });
    const huttes = q20dLueursHameau(c, Hm);
    const a = c.cap(Hm.place, Hm.ap);
    return [
      c.plan({ dur: 6.8, cam: Q20D.cam(c, () => c.camLieu(Hm.place, { d: 12, haut: 2.6, dy: 1.2, a, recul: 0.06, stop: 3 }), () => c.camLieu(Hm.place, { d: 10, haut: 2.2, dy: 1.2, a: a + 0.6, stop: 3 })), acteurs: [Se && Object.assign(Se.A, { vu: false })], lum: huttes, son: 'goutte', dit: Se ? c.parole('Nenn.', Se.nom, Se.voix) : c.parole('(Des cabanes de pierre, en ruche. Une lueur verte, dedans.)', ''), court: true }),
      c.plan({ dur: 6, cam: Q20D.cam(c, () => c.camChose(c.haut(Hm.ap, 0.85), { d: 1.7, haut: 1.25, a: Hm.rA + 0.35, dy: 0, recul: 0.1 }), () => c.camChose(c.haut(Hm.ap, 0.85), { d: 2.2, haut: 1.4, a: Hm.rA - 0.5, dy: 0 })), acteurs: [], lum: [c.lueur(Q20B.devant(c, Hm.ap, Hm.rA, 1.0, 0.3), 7, [0.7, 1.0, 0.85], 1.0), c.lueur(Q20B.devant(c, Hm.ap, Hm.rA, 2.2, -0.6), 6, [0.5, 0.78, 0.66], 1.6)], dit: c.parole('(Une pierre, à l’entrée. Trois entailles.)', '') }),
    ];
  },
  tournant(c) {
    const Hm = q20dHameau(c);
    if (!Hm) return null;
    const JP = q20dDevantAppel(c, Hm), J = c.joueur(JP, { face: Hm.ap, geste: 'baisse' });
    const sP = Q20B.devant(c, JP, c.cap(JP, Hm.garde), 1.1, 0);
    const Se = q20dPale(c, 'se', sP, { face: JP, geste: ['parle', { lookP: 0.1 }] });
    if (!Se) return null;
    const Se2 = q20dPale(c, 'se', sP, { vers: Hm.garde, t0: 0.6, t1: 5.2, capFin: c.cap(Hm.garde, Hm.entree) });
    return [
      c.plan({ dur: 6.4, cam: Q20D.cam(c, () => c.camActeur(Se.A, { cote: 1.35, d: 2.2 }), () => c.camActeur(Se.A, { cote: -1.35, d: 2.3 })), acteurs: [Se.A, Object.assign({}, J, { vu: false })], lum: [Q20D.froide(c, sP, 4.5, 1.4), Q20D.froide(c, JP, 4, 1.2)], son: 'murmure', dit: c.parole('Nom… d’sû. Va.', Se.nom, Se.voix), court: true }),
      Se2 && c.plan({ dur: 5.8, cam: Q20D.cam(c, () => c.camActeur(Se2.A, { cote: 2.0, d: 3.2 }), () => c.camActeur(Se2.A, { cote: -2.0, d: 3.2 })), acteurs: [Se2.A, Object.assign({}, J, { vu: false })], lum: [c.lueur(Hm.garde, 8, [0.6, 0.9, 0.75], 1.4), c.lueur(c.vers(sP, Hm.garde, 0.5), 7, [0.55, 0.85, 0.7], 1.4)] }),
    ];
  },
  fins: {
    0(c) { return q20dAdmis(c, '… Bô. San nom. Bô.'); },
    1(c) { return q20dAdmis(c, 'Frè ? … Frè.'); },
    2(c) { return q20dAdmis(c, 'Onz ? … Onz.'); },
  },
});
// admis : le guetteur, puis ils sortent des cabanes et viennent voir ; le vieux vous touche l'épaule
function q20dAdmis(c, t1) {
  const Hm = q20dHameau(c);
  if (!Hm) return null;
  const JP = q20dDevantAppel(c, Hm), J = c.joueur(JP, { face: Hm.place, geste: 'baisse' });
  const Se = q20dPale(c, 'se', Q20B.devant(c, JP, c.cap(JP, Hm.garde), 1.1, 0), { face: JP, geste: ['hoche'] });
  if (!Se) return null;
  const vers = c.cap(JP, Hm.place);
  const Un = q20dPale(c, 'un', Q20B.devant(c, JP, vers, 1.0, 0.25), { face: JP, geste: ['offre', { lookP: 0.2 }] });
  const autour = ['deu', 'tre', 'ui', 'neu'].map((k, i) => q20dPale(c, k, Q20B.libre(c, Q20B.devant(c, JP, vers + (i - 1.5) * 0.7, 2.6 + (i % 2) * 0.6, 0), 0, 1.5, 0.4), { face: JP, geste: k === 'neu' ? ['peur'] : ['raide'] })).filter(Boolean).map((x) => x.A);
  const lum = [c.lueur(JP, 8, [0.6, 0.9, 0.75], 1.6), c.lueur(Q20B.devant(c, JP, vers, 2.5, 0), 8, [0.55, 0.85, 0.7], 1.4), c.lueur(Hm.place, 12, [0.5, 0.8, 0.66], 2.5)];
  return [
    c.plan({ dur: 6.4, cam: Q20D.cam(c, () => c.camActeur(Se.A, { cote: 1.35, d: 2.2 }), () => c.camActeur(Se.A, { cote: -1.35, d: 2.3 })), acteurs: [Se.A, Object.assign({}, J, { vu: false })], lum, son: 'murmure', dit: c.parole(t1, Se.nom, Se.voix), court: true }),
    Un && c.plan({ dur: 6.6, cam: Q20D.cam(c, () => c.camActeur(Un.A, { cote: 0.9, d: 2.3, avec: J, k: 0.35 }), () => c.camActeur(Un.A, { cote: -0.9, d: 2.5 })), acteurs: [Un.A, J, ...autour], lum, dit: c.parole('Onz.', Un.nom, Un.voix) }),
  ];
}
q20d.guetter('q20d_so_appel', () => {
  if (!farm.s || !farm.s.souterrain || typeof soutTerres === 'undefined') return null;
  const T = soutTerres.S();
  if (T.admis) return 'fin';
  return souterrain.S().vu.hameau || T.appelVu ? 'demande' : null;
});

// ---------------------------------------------------------------- LES ONZE : le pain rompu en onze ; la peau pliée ; « pèst… d'sû ? »
// le vieux, dans la maison des encoches (sa place : assis), ou là où il est
function q20dUn(c, o) { return Q20BD.gens(c, 'un', o); }
q20.scenes('q20d_so_onze', {
  qui: 'sout:un', titre: 'Les onze',
  monde: 'dessous',
  delais: { demande: 1.5, tournant: 1.5, fin: 5 },
  etat() {
    if (!farm.s || typeof soutTerres === 'undefined') return q20dE('Les onze', null, false, false);
    const T = soutTerres.S(), N = q20d.S().pest, fini = !!(N || T.pest);
    return q20dE('Les onze', T.dons || T.liste || fini ? T : null, !!(T.dons || T.liste), fini, fini ? (N ? N.c : 0) : null, !!T.liste);
  },
  tournantSi() { return !!(typeof soutTerres !== 'undefined' && soutTerres.S().liste); },
  demande(c) {
    const Hm = q20dHameau(c);
    if (!Hm) return null;
    const pl = Hm.place, pa = c.chose(Q20D_DESSINS.part, c.haut(Q20B.devant(c, pl, Hm.rA + 0.4, 0.35, 0), 0.82), { s: 1.4, r: 0.4 });
    const autour = ['tre', 'deu', 'si'].map((k, i) => q20dPale(c, k, Q20B.libre(c, Q20B.devant(c, pl, Hm.rA + 1.8 + i * 1.1, 1.9, 0), 0, 1.2, 0.4), { face: pl, geste: ['baisse'] })).filter(Boolean).map((x) => x.A);
    const U = q20dUn(c, { geste: ['assis', { lookP: 0.05 }] });
    if (!U) return null;
    return [
      c.plan({ dur: 6.6, cam: Q20D.cam(c, () => c.camChose(c.haut(pl, 0.85), { d: 2.4, haut: 1.55, a: Hm.rA + 0.3, dy: 0, recul: 0.1 }), () => c.camChose(c.haut(pl, 0.85), { d: 3, haut: 1.8, a: Hm.rA - 0.8, dy: 0 })), acteurs: [pa, ...autour], lum: [Q20D.froide(c, pl, 4.5, 1.2)], son: 'murmure', dit: c.parole('Pan. Onz.', U.nom, U.voix), court: true }),
      c.plan({ dur: 6, cam: Q20D.cam(c, () => c.camActeur(U.A, { cote: 0.4, d: 2.0 }), () => c.camActeur(U.A, { cote: -0.6, d: 2.2 })), acteurs: [U.A], lum: Q20BD.lum(c, U.P), dit: c.parole('Onz ?', U.nom, U.voix) }),
    ];
  },
  tournant(c) {
    const U = q20dUn(c, { geste: ['assis', 'baisse'] });
    if (!U) return null;
    const pe = c.chose(Q20D_DESSINS.peau, c.haut(c.devant(U.P, U.cap, 0.36, 0, true), 0.5), { s: 1.3, r: U.cap });
    return [
      c.plan({ dur: 6.6, cam: Q20D.cam(c, () => c.camActeur(U.A, { cote: 0.5, d: 1.9, buste: true }), () => c.camActeur(U.A, { cote: -0.6, d: 2.1 })), acteurs: [U.A, pe], lum: Q20BD.lum(c, U.P), son: 'page', dit: c.parole('Onz. Mûr. Pan nenn. D’sou.', U.nom, U.voix), court: true }),
      c.plan({ dur: 6, cam: Q20D.cam(c, () => c.camChose(pe.P, { d: 1.3, haut: 0.95, a: U.cap + 0.9, dy: 0.02 }), () => c.camChose(pe.P, { d: 1.6, haut: 1.1, a: U.cap - 0.9, dy: 0.02 })), acteurs: [U.A, pe], lum: Q20BD.lum(c, pe.P), dit: c.parole('(Sous chaque nom, des encoches. Sous le dernier, elles s’arrêtent.)', '') }),
    ];
  },
  fins: {
    // « nenn » : la peste n'est plus là-haut ; le bâton à encoches
    0(c) {
      const U = q20dUn(c, { geste: ['assis', 'offre', { lookP: 0.1 }] });
      if (!U) return null;
      const ba = c.chose(Q20D_DESSINS.baton, c.haut(c.devant(U.P, U.cap, 0.42, 0.06, true), 0.68), { s: 0.9, r: U.cap + Math.PI / 2 });
      return [
        c.plan({ dur: 6.6, cam: Q20D.cam(c, () => c.camActeur(U.A, { cote: 0.6, d: 2.0, buste: true }), () => c.camActeur(U.A, { cote: -0.7, d: 2.2 })), acteurs: [U.A, ba], lum: Q20BD.lum(c, U.P), son: 'murmure', dit: c.parole('Pèst nenn… D’sû. Va.', U.nom, U.voix), court: true }),
        c.plan({ dur: 6, cam: Q20D.cam(c, () => c.camChose(ba.P, { d: 1.3, haut: 1.0, a: U.cap + 0.8, dy: 0.02 }), () => c.camChose(ba.P, { d: 1.6, haut: 1.1, a: U.cap - 0.8, dy: 0.02 })), acteurs: [U.A, ba], lum: Q20BD.lum(c, U.P).concat([Q20D.froide(c, ba.P, 3, 0.5)]), son: 'goutte' }),
      ];
    },
    // « ouï » : elle y est toujours
    1(c) {
      const U = q20dUn(c, { geste: ['assis', 'baisse', 'hoche'] });
      if (!U) return null;
      const Hm = q20dHameau(c);
      return [
        c.plan({ dur: 6.6, cam: Q20D.cam(c, () => c.camActeur(U.A, { cote: 0.4, d: 2.0 }), () => c.camActeur(U.A, { cote: -0.6, d: 2.2 })), acteurs: [U.A], lum: Q20BD.lum(c, U.P), son: 'murmure', dit: c.parole('… Ouï. D’sû mo. Tojor.', U.nom, U.voix), court: true }),
        Hm && c.plan({ dur: 6, cam: Q20D.cam(c, () => c.camLieu(Hm.place, { d: 10, haut: 2.4, dy: 1, a: c.cap(Hm.place, U.P), recul: 0.05, stop: 3 }), () => c.camLieu(Hm.place, { d: 12, haut: 2.6, dy: 1, stop: 3 })), acteurs: [Object.assign({}, U.A, { vu: false })], lum: q20dLueursHameau(c, Hm), dit: c.parole('Tojor.', U.nom, U.voix) }),
      ];
    },
  },
});
q20d.guetter('q20d_so_onze', () => {
  if (!farm.s || !farm.s.souterrain || typeof soutTerres === 'undefined') return null;
  const T = soutTerres.S(), N = q20d.S();
  if (T.pest && !N.pest) q20d.note('pest', { c: 0 });
  if (N.pest) return 'fin';
  return T.dons && !T.liste ? 'demande' : null;
});

// ---------------------------------------------------------------- LE ONZIÈME : le carnet de la cabane vide ; le mort qui porte des bottes
q20.scenes('q20d_so_onzieme', {
  souv: 'q20d:dessous', titre: 'Le onzième',
  monde: 'dessous',
  delais: { demande: 2, fin: 3 },
  etat() {
    if (!farm.s || typeof souterrain === 'undefined') return q20dE('Le onzième', null, false, false);
    const S = souterrain.S(), N = q20d.S().bottes;
    return q20dE('Le onzième', S.carnet ? S : null, !!S.carnet, !!(S.carnet && N));
  },
  demande(c) {
    const V = Q20BD.V(c), H = V && V.huttes[7];
    if (!H || !V.carnet) return null;
    const ca = c.ptSous(V.carnet[0], V.carnet[2], V.carnet[1] + 0.3), Hp = Q20BD.hutte(c, H);
    const J = c.joueur(Q20B.libre(c, Q20B.devant(c, ca, c.cap(ca, Hp.D), 0.8, 0), 0, 1.2, 0.35), { face: ca, geste: 'baisse' });
    const cn = c.chose(Q20D_DESSINS.carnet, c.haut(c.devant(J.P, J.cap, 0.34, 0.04, true), 0.95), { s: 1.4, r: J.cap });
    return [
      c.plan({ dur: 6.8, cam: Q20D.cam(c, () => c.camChose(c.haut(J.P, 0.9), { d: Math.hypot(Hp.P[0] - J.P[0], Hp.P[2] - J.P[2]) * 0.8, haut: 1.5, a: c.cap(J.P, Hp.P), dy: 0, recul: 0.06 }), () => c.camActeur(J, { cote: 0.9, d: 1.8, buste: true }), () => c.camChose(ca, { d: 1.6, haut: 1.2 })), acteurs: [J, cn], lum: [Q20D.froide(c, ca, 3.5, 1.0), Q20D.froide(c, Hp.D, 4, 1.4)], son: 'page', dit: c.parole('Le vieux compte sur ses doigts jusqu’à onze, et il s’arrête sur moi.', 'Le carnet du géomètre'), court: true }),
      c.plan({ dur: 6, cam: Q20D.cam(c, () => c.camLieu(Hp.P, { d: 7, haut: 1.6, dy: 1.0, a: Hp.cap + 0.3, stop: 1 }), () => c.camLieu(Hp.P, { d: 9, haut: 2, dy: 1.0, a: Hp.cap - 0.5, stop: 1 })), acteurs: [Object.assign({}, J, { vu: false })], lum: [Q20D.froide(c, Hp.P, 5, 1.2), Q20D.froide(c, Hp.D, 4, 1.2)], dit: c.parole('d’sû bô ? onz dôr', 'Le carnet du géomètre') }),
    ];
  },
  fin(c) {
    const D = q20dDormeurs(c);
    if (!D) return null;
    const B = D.bottes, a0 = c.cap(B, D.C);
    const J = c.joueur(Q20B.libre(c, Q20B.devant(c, B, a0, 1.1, 0.3), 0, 1.2, 0.35), { face: B, geste: 'baisse', lanterne: true });
    return [
      c.plan({ dur: 6.8, cam: Q20D.cam(c, () => c.camActeur(J, { cote: 1.4, d: 2.2, avec: B, k: 0.45 }), () => c.camChose(c.haut(B, 0.2), { d: 1.8, haut: 1.2, a: a0 + 0.6, dy: 0 })), acteurs: [J], lum: [Q20D.flamme(c, J.P, 4.5, 1.2)], son: 'goutte', dit: c.parole('Le vieux m’a touché l’épaule. Onz. J’ai répondu.', 'Le carnet du géomètre'), court: true }),
      c.plan({ dur: 6, cam: Q20D.cam(c, () => c.camLieu(B, { d: 6.5, haut: 2.2, dy: 0.3, a: a0 + 0.9, recul: 0.06, stop: 1 }), () => c.camLieu(B, { d: 5, haut: 2, dy: 0.3, a: a0 - 0.9, stop: 1 })), acteurs: [Object.assign({}, J, { vu: false })], lum: [Q20D.flamme(c, J.P, 6, 1.2), c.lueur(B, 8, [0.42, 0.66, 0.6], 2.4)].concat(D.petit ? [Q20D.froide(c, D.petit, 4, 1)] : []), son: 'goutte' }),
    ];
  },
});
q20d.guetter('q20d_so_onzieme', () => { if (!farm.s || !farm.s.souterrain) return null; const S = souterrain.S(); if (!S.carnet) return null; return q20d.S().bottes ? 'fin' : 'demande'; });

// ---------------------------------------------------------------- LA PERLE DES DORMEURS : prise ; rendue
q20.scenes('q20d_so_perle', {
  qui: 'sout:neu', titre: 'La perle des dormeurs',
  monde: 'dessous',
  delais: { demande: 2, fin: 2 },
  etat() {
    if (!farm.s || typeof soutTerres === 'undefined') return q20dE('La perle des dormeurs', null, false, false);
    const T = soutTerres.S();
    return q20dE('La perle des dormeurs', T.profane || T.rendue ? T : null, !!T.profane, !!T.rendue && !T.profane);
  },
  demande(c) {
    const D = q20dDormeurs(c);
    if (!D || !D.vasque) return null;
    const v = D.vasque, ch = Q20H.emet(c.haut(v, 2.6), { n: 1.2, col: [0.7, 0.8, 0.85, 0.8], taille: 0.025, vie: 1.3, v: 0.01, vy: -0.2, grav: 1.6, r: 0.02 });
    // (l'enfant, au hameau, qui vous tourne le dos)
    const G = Q20BD.gens(c, 'neu'), N = G && q20dPale(c, 'neu', G.P, { cap: G.cap + Math.PI * 0.85, geste: ['peur', { lookP: -0.1 }] });
    return [
      c.plan({ dur: 6.6, cam: Q20D.cam(c, () => c.camChose(c.haut(v, 0.15), { d: 1.6, haut: 1.0, a: 0.6, dy: 0, recul: 0.12 }), () => c.camChose(c.haut(v, 0.15), { d: 2, haut: 1.2, a: -1.2, dy: 0 })), acteurs: [], lum: [Q20D.froide(c, v, 3, 0.6)], chaque: ch, son: 'goutte', dit: c.parole('(La goutte tombe dans une vasque vide.)', ''), court: true }),
      N && c.plan({ dur: 6, cam: Q20D.cam(c, () => c.camActeur(N.A, { cote: 2.6, d: 2.2 }), () => c.camActeur(N.A, { cote: -2.6, d: 2.4 })), acteurs: [N.A], lum: Q20BD.lum(c, N.A.P), dit: c.parole('Gout… d’dôr !', N.nom, N.voix) }),
    ];
  },
  fin(c) {
    const D = q20dDormeurs(c);
    if (!D || !D.vasque) return null;
    const v = D.vasque, pe = c.chose(Q20D_DESSINS.perle, c.haut(v, 0.12), { s: 1.6 });
    const ch = Q20H.emet(c.haut(v, 2.6), { n: 1.2, col: [0.7, 0.8, 0.85, 0.8], taille: 0.025, vie: 1.3, v: 0.01, vy: -0.2, grav: 1.6, r: 0.02 });
    const G = Q20BD.gens(c, 'neu'), N = G && q20dPale(c, 'neu', G.P, { cap: G.cap, geste: [{ reach: 0.15, lookP: 0.2 }] });
    return [
      c.plan({ dur: 6.6, cam: Q20D.cam(c, () => c.camChose(c.haut(v, 0.15), { d: 1.5, haut: 1.0, a: 0.6, dy: 0, recul: 0.12 }), () => c.camChose(c.haut(v, 0.15), { d: 2, haut: 1.2, a: -1.2, dy: 0 })), acteurs: [pe], lum: [Q20D.froide(c, v, 3, 0.6)], chaque: ch, son: 'goutte', dit: c.parole('(La goutte retombe sur la perle. Toujours au même endroit.)', ''), court: true }),
      N && c.plan({ dur: 6, cam: Q20D.cam(c, () => c.camActeur(N.A, { cote: 0.3, d: 1.8, haut: 1.1 }), () => c.camActeur(N.A, { cote: -0.5, d: 2.0, haut: 1.1 })), acteurs: [N.A], lum: Q20BD.lum(c, N.A.P), dit: c.parole('Gout… bô.', N.nom, N.voix) }),
    ];
  },
});
q20d.guetter('q20d_so_perle', () => { if (!farm.s || !farm.s.souterrain || typeof soutTerres === 'undefined') return null; const T = soutTerres.S(); return T.profane ? 'demande' : T.rendue ? 'fin' : null; });

// ---------------------------------------------------------------- LA PORTE DES AËLIM : l'œil ; la lumière y entre ; le coffre
function q20dTombeau(c) {
  const X = c.w.soutSecrets, T = X && X.tombeau;
  if (!T) return null;
  const P = c.ptSous(T.x, T.z, T.y + 0.3), po = c.ptSous(T.porte[0], T.porte[1], T.y + 0.3), dehors = c.cap(P, po);
  const co = X.coffre !== undefined && c.w.props[X.coffre];
  return { T, P, po, dehors, oeil: c.haut(po, 1.62), coffre: co ? [co.x, co.y, co.z] : c.haut(P, 0) };
}
q20.scenes('q20d_so_aelim', {
  souv: 'q20d:dessous', titre: 'La porte des Aëlim',
  monde: 'dessous',
  delais: { demande: 1.5, tournant: 3, fin: 2 },
  etat() {
    if (!farm.s || typeof soutSecrets === 'undefined') return q20dE('La porte des Aëlim', null, false, false);
    const X = soutSecrets.X(), N = q20d.S().aelim;
    return q20dE('La porte des Aëlim', N || X.vuePorte || X.porte ? X : null, !!(N || X.vuePorte || X.porte), !!(X.coffre || X.tablette), null, !!X.porte);
  },
  tournantSi() { return !!(typeof soutSecrets !== 'undefined' && soutSecrets.X().porte); },
  demande(c) {
    const Tb = q20dTombeau(c);
    if (!Tb) return null;
    return [
      c.plan({ dur: 6.8, cam: Q20D.cam(c, () => c.camLieu(Tb.oeil, { d: 9, haut: 1.9, dy: 0, a: Tb.dehors + 0.4, recul: 0.06, stop: 0.6 }), () => c.camLieu(Tb.oeil, { d: 7, haut: 1.7, dy: 0, a: Tb.dehors - 0.5, stop: 0.6 })), acteurs: [], lum: [c.lueur(Q20B.devant(c, Tb.po, Tb.dehors, 2.5, 0), 9, [0.45, 0.7, 0.6], 2.2), Q20D.froide(c, Tb.P, 5, 2.5)], son: 'goutte', dit: c.parole('« dal na-aelim , mir ael , tora »', 'Gravé sur la façade du tombeau'), court: true }),
      c.plan({ dur: 6, cam: Q20D.cam(c, () => c.camChose(Tb.oeil, { d: 1.6, haut: 1.4, a: Tb.dehors + 0.25, dy: 0, recul: 0.12 }), () => c.camChose(Tb.oeil, { d: 2.0, haut: 1.5, a: Tb.dehors - 0.3, dy: 0 })), acteurs: [], lum: [Q20D.froide(c, Tb.po, 3, 1.4)], dit: c.parole('(Au milieu de la dalle, un œil taillé. Creux, et profond.)', '') }),
    ];
  },
  tournant(c) {
    const Tb = q20dTombeau(c);
    if (!Tb) return null;
    // (le joueur de côté, la lanterne tendue ; la dalle, redessinée fermée, l'œil où entre le point de lumière, puis
    // elle descend dans le sol)
    const J = c.joueur(Q20B.libre(c, Q20B.devant(c, Tb.po, Tb.dehors + 0.5, 1.4, 0), 0, 1.0, 0.35), { face: Tb.oeil, geste: 'tend', lanterne: true });
    const pt = c.chose(Q20D_DESSINS.point, c.vers(c.haut(J.P, 1.3), Tb.oeil, 0.3), { s: 1, vers: c.devant(Tb.oeil, Tb.dehors, 0.08, 0, true), t0: 0.8, t1: 3.2 });
    const q = c.w.soutSecrets && c.w.props[c.w.soutSecrets.porte];
    const da = q ? c.chose('sout_porte_aelim', [q.x, q.y, q.z], { r: q.r || 0, data: {}, vers: [q.x, q.y - 2.25, q.z], t0: 3.4, t1: 6.2 }) : null;
    const lum = [Q20D.flamme(c, J.P, 5, 1.3), c.lueur(Tb.oeil, 2.2, [1.0, 0.9, 0.7], 0), c.lueur(Q20B.devant(c, Tb.po, Tb.dehors, 2.5, 0), 8, [0.45, 0.7, 0.6], 2)];
    return [
      c.plan({ dur: 6.8, cam: Q20D.cam(c, () => c.camChose(Tb.oeil, { d: 3.2, haut: 1.7, a: Tb.dehors - 0.35, dy: -0.3, recul: 0.05 }), () => c.camChose(Tb.oeil, { d: 2.6, haut: 1.6, a: Tb.dehors - 0.6, dy: -0.3 })), acteurs: [J, pt, da], lum, son: 'clochette' }),
      c.plan({ dur: 6, cam: Q20D.cam(c, () => c.camChose(c.haut(Tb.po, 1.0), { d: 3.4, haut: 1.6, a: Tb.dehors - 0.2, dy: 0 }), () => c.camLieu(Tb.P, { d: 8, haut: 2, dy: 1, a: Tb.dehors, stop: 1 })), acteurs: [Object.assign({}, J, { vu: false })], lum: [Q20D.flamme(c, J.P, 5, 1.3), Q20D.froide(c, Tb.P, 4, 1)], son: 'grondement' }),
    ];
  },
  fin(c) {
    const Tb = q20dTombeau(c);
    if (!Tb) return null;
    // (le joueur de côté, le miroir levé à la lumière ; la caméra dans l'ouverture)
    const Ko = Tb.coffre, a1 = c.cap(Ko, Tb.po), J = c.joueur(Q20B.libre(c, Q20B.devant(c, Ko, a1 + 1.2, 0.9, 0), 0, 0.8, 0.3), { face: c.vers(Ko, Tb.po, 0.5), geste: 'tend', lanterne: true });
    const mi = c.chose(Q20D_DESSINS.miroir, c.haut(c.devant(J.P, J.cap, 0.34, 0.03, true), 1.08), { s: 1.3, r: J.cap, lueur: true });
    return [
      c.plan({ dur: 6.8, cam: Q20D.cam(c, () => c.camActeur(J, { cote: 0.5, d: 2.2, buste: true, avec: mi.P, k: 0.25 }), () => c.camActeur(J, { cote: -0.5, d: 2.2, buste: true }), () => c.camChose(c.haut(Ko, 0.6), { d: 2.4, haut: 1.5, a: a1, dy: 0 })), acteurs: [J, mi], lum: [Q20D.flamme(c, J.P, 5, 1.3)], son: 'piece', dit: c.parole('« aelim fala , hemim ulen , ael rim neth thal »', 'Une tablette, dans le tombeau'), court: true }),
      c.plan({ dur: 6, cam: Q20D.cam(c, () => c.camLieu(Tb.P, { d: 7, haut: 2, dy: 1.2, a: Tb.dehors - 0.4, recul: 0.06, stop: 1 }), () => c.camLieu(Tb.P, { d: 6, haut: 2, dy: 1.2, a: Tb.dehors + 0.6, stop: 1 })), acteurs: [Object.assign({}, J, { vu: false })], lum: [Q20D.flamme(c, J.P, 6, 1.3), c.lueur(Q20B.devant(c, Tb.po, Tb.dehors, 2.5, 0), 9, [0.45, 0.7, 0.6], 2.2)], dit: c.parole('(Le fond du coffre est poli, comme par des mains.)', '') }),
    ];
  },
});
q20d.guetter('q20d_so_aelim', () => { if (!farm.s || !farm.s.souterrain || typeof soutSecrets === 'undefined') return null; const X = soutSecrets.X(); if (X.coffre || X.tablette) return 'fin'; if (X.porte) return null; return q20d.S().aelim || X.vuePorte ? 'demande' : null; });

// ---------------------------------------------------------------- les emballages du Dessous (ils notent, puis laissent faire)
HOOKS.load.push(() => {
  if (game._q20dSout) return;
  game._q20dSout = true;
  // admis : comment (en se taisant, « frè », « onz »)
  if (typeof soutTerres !== 'undefined' && soutTerres.accepter) {
    const _ac = soutTerres.accepter.bind(soutTerres);
    soutTerres.accepter = function (se, comment) { try { if (!this.S().admis && !q20d.S().appel) q20d.note('appel', { c: comment === 'onz' ? 2 : comment === 'frè' ? 1 : 0 }); } catch (e) { console.error('q20d', e); } return _ac(se, comment); };
  }
  // la réponse à « pèst… d'sû ? » : « ouï » (la première)
  if (typeof soutTerres !== 'undefined' && soutTerres.panneau) {
    const _pn = soutTerres.panneau.bind(soutTerres);
    soutTerres.panneau = function (e, L, ...a) { try { if (L && L[1] === 'pest_ouï' && !q20d.S().pest) q20d.note('pest', { c: 1 }); } catch (er) { console.error('q20d', er); } return _pn(e, L, ...a); };
  }
  // le mort aux bottes (après le carnet) ; la dalle à l'œil, la première fois qu'on la touche
  if (typeof soutSecrets !== 'undefined') {
    const _do = soutSecrets.dormeur.bind(soutSecrets);
    soutSecrets.dormeur = function (it) { try { if (it && it.data && it.data.n === 0 && souterrain.S().carnet) q20d.note('bottes'); } catch (e) { console.error('q20d', e); } return _do(it); };
    const _po = soutSecrets.porte.bind(soutSecrets);
    soutSecrets.porte = function () { try { q20d.note('aelim'); } catch (e) { console.error('q20d', e); } return _po(); };
  }
});

// ============================================================================ LA NICHE DES GALERIES (une dalle gravée, les runes ; monde 'galeries')
function q20dDalle(c, id) {
  const W = c.w.r15, D = W && W.portes && W.portes[id];
  if (!D) return null;
  const sol = (x, z, y) => (c.sous ? c.solSous(x, z, y) : c.sol(x, z));
  const dv = D.devant ? [D.devant[0], sol(D.devant[0], D.devant[2], D.y + 0.3), D.devant[2]] : null;
  const co = D.coffre !== undefined && c.w.props[D.coffre];
  // (la face gravée regarde vers « devant » ; le coffre est derrière la dalle)
  const L = D.dalle || D, face = dv ? c.cap([L.x, 0, L.z], dv) : (D.r || 0);
  return { D, P: [L.x, D.y, L.z], T: [L.x, D.y + Math.min(1.3, ((L.sy || 1.85) * 0.68)), L.z], dv, face, coffre: co ? [co.x, co.y, co.z] : null };
}
function q20dR15() { try { return typeof runes !== 'undefined' && farm.s ? runes.S() : null; } catch (e) { return null; } }
q20.scenes('q20d_r15_niche', {
  souv: 'q20c:vallee', titre: 'La niche des Galeries',
  monde: 'galeries',
  delais: { demande: 1.2, tournant: 3, fin: 1.5 },
  etat() { const R = q20dR15(), N = q20d.S().niche; return q20dE('La niche des Galeries', N || (R && R.p.niche) ? (R || {}) : null, !!N || !!(R && R.p.niche), !!(R && R.c.niche), null, !!(R && R.p.niche)); },
  tournantSi() { const R = q20dR15(); return !!(R && R.p.niche); },
  demande(c) {
    const K = q20dDalle(c, 'niche');
    if (!K || !K.dv) return null;
    const J = c.joueur(Q20B.libre(c, Q20B.devant(c, K.dv, K.face + Math.PI / 2, 0.7, 0), 0, 0.6, 0.3), { face: K.T, geste: 'leve', lanterne: true });
    return [
      c.plan({ dur: 6.6, cam: Q20D.cam(c, () => c.camChose(K.T, { d: 3.0, haut: 1.6, a: K.face - 0.15, dy: 0, recul: 0.06 }), () => c.camChose(K.T, { d: 2.6, haut: 1.5, a: K.face + 0.15, dy: 0 }), () => c.camActeur(J, { cote: 2.6, d: 2.2, avec: K.T, k: 0.5 })), acteurs: [J], lum: [Q20D.flamme(c, J.P, 5, 1.3)], son: 'goutte', dit: c.parole('(Au plus loin de l’échelle, une dalle. Trois signes ; l’un s’efface.)', ''), court: true }),
      c.plan({ dur: 6, cam: Q20D.cam(c, () => c.camChose(K.T, { d: 1.6, haut: 1.3, a: K.face + 0.3, dy: 0, recul: 0.1 }), () => c.camChose(K.T, { d: 1.9, haut: 1.4, a: K.face - 0.3, dy: 0 })), acteurs: [], lum: [Q20D.flamme(c, K.dv, 5, 1.3), c.lueur(K.T, 2.6, [0.5, 0.72, 1.0], 0)] }),
    ];
  },
  tournant(c) {
    const K = q20dDalle(c, 'niche');
    if (!K || !K.dv) return null;
    // (le joueur de côté, contre la paroi ; la caméra dans la galerie, face à la niche qui s'ouvre)
    const J = c.joueur(Q20B.libre(c, Q20B.devant(c, K.dv, K.face + Math.PI / 2, 0.75, 0), 0, 0.6, 0.3), { face: K.T, geste: 'baisse', lanterne: true });
    const pous = Q20H.emet(c.haut(K.P, 0.2), { n: 6, col: [0.62, 0.58, 0.52, 0.6], taille: 0.07, vie: 2.2, v: 0.5, vy: 0.2, r: 1.2 });
    return [
      c.plan({ dur: 6.4, cam: Q20D.cam(c, () => c.camChose(K.T, { d: 3.4, haut: 1.6, a: K.face - 0.12, dy: 0, recul: 0.06 }), () => c.camChose(K.T, { d: 2.8, haut: 1.5, a: K.face + 0.15, dy: 0 })), acteurs: [Object.assign({}, J, { vu: false })], lum: [Q20D.flamme(c, J.P, 5, 1.3)], chaque: pous, son: 'grondement' }),
      K.coffre && c.plan({ dur: 5.8, cam: Q20D.cam(c, () => c.camChose(c.haut(K.coffre, 0.4), { d: 2.0, haut: 1.4, a: K.face, dy: 0 }), () => c.camChose(c.haut(K.coffre, 0.4), { d: 2.6, haut: 1.6, a: K.face + 0.5, dy: 0 })), acteurs: [Object.assign({}, J, { vu: false })], lum: [Q20D.flamme(c, K.dv, 5, 1.3)] }),
    ];
  },
  fin(c) {
    const K = q20dDalle(c, 'niche');
    if (!K || !K.coffre) return null;
    // (le joueur à côté du coffre ; la caméra dans l'ouverture de la niche)
    const J = c.joueur(Q20B.libre(c, Q20B.devant(c, K.coffre, K.face + Math.PI / 2, 0.85, 0), 0, 0.6, 0.3), { face: K.coffre, geste: 'penche', lanterne: true });
    const or = c.chose(Q20_DESSINS.lingots || Q20D_DESSINS.point, c.haut(K.coffre, 0.62), { s: 1.2, r: K.face, lueur: true });
    return [
      c.plan({ dur: 6.6, cam: Q20D.cam(c, () => c.camActeur(J, { cote: Math.PI / 2 + 0.3, d: 2.2, avec: c.haut(K.coffre, 0.5), k: 0.45 }), () => c.camChose(c.haut(K.coffre, 0.5), { d: 2.3, haut: 1.5, a: K.face, dy: 0 }), () => c.camActeur(J, { cote: -1.6, d: 2.1, buste: true })), acteurs: [J, or], lum: [Q20D.flamme(c, J.P, 4.5, 1.2)], son: 'piece', dit: c.parole('(Personne ne descend si loin. C’était fait pour ça.)', ''), court: true }),
      c.plan({ dur: 5.8, cam: Q20D.cam(c, () => c.camRegard(Q20B.devant(c, K.dv, K.face, 1.0, 0), Q20B.devant(c, K.dv, K.face, 12, 0), { haut: 1.55, recul: 0.05 }), () => c.camChose(K.T, { d: 2.4, haut: 1.5, a: K.face, dy: 0 })), acteurs: [Object.assign({}, J, { vu: false })], lum: [Q20D.flamme(c, J.P, 5, 1.2)], son: 'goutte' }),
    ];
  },
});
q20d.guetter('q20d_r15_niche', () => { const R = q20dR15(); if (!R) return null; if (R.c.niche) return 'fin'; if (R.p.niche) return null; return q20d.S().niche ? 'demande' : null; });
// (la première fois qu'on regarde une dalle : la niche des Galeries, le tertre scellé des Terres d'Avant)
{
  const _f = HOOKS.inter.r15_porte;
  if (_f) {
    const f = (it) => { try { const p = it && it.data && it.data.porte; if ((p === 'niche' || p === 'tertre') && !q20d.S()[p]) q20d.note(p); } catch (e) { console.error('q20d', e); } return _f(it); };
    // (l'emballage de Q20C, posé au chargement, se reconnaît à sa marque : il emballe celui-ci une fois, pas à chaque partie)
    if (_f._q20c) f._q20c = true;
    f._q20d = true;
    HOOKS.inter.r15_porte = f;
  }
}
