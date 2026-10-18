// ============================================================================
//  LES SCÈNES DES QUÊTES (agent Q20B) — 2e. BASSE-FOSSE (la ville sous la ville)
//  Les gens d'en bas, dans la Zone, sous la voûte de tuf : leurs scènes s'y
//  jouent (monde 'basse_fosse'), à la lueur des chandelles et des feux.
//  - Ceux qui ont un nom : le Greffier (au registre de la Nef), la Sonneuse
//    (au temple, près de sa cloche), la Marchande (à son étal), la Veilleuse
//    (à la ronde des feux), l'Ordonnateur (au mur de l'ossuaire).
//  - Les anonymes (gardiens, hommes, femmes, enfants) : chacun a la quête d'un
//    modèle (Q16_V5_MODELES), tirée pour la partie ; chaque modèle a SA scène,
//    jouée avec le nom et la maison de la personne tirée (son seuil, sa table,
//    sa chandelle), au bon genre (« il », « elle »).
// ============================================================================
Object.assign(Q20_DESSINS, {
  // deux chandelles de cire d'abeille ; une corde de chanvre ; deux dents de mange-morts ; un lingot ; un pain rond
  chandelles(PE) { for (const s of [-1, 1]) PE.box(s * 0.04, 0.1, 0, 0.03, 0.2, 0.03, [1.25, 1.12, 0.72], TL.plain); },
  corde(PE) { for (let k = 0; k < 5; k++) PE.box(0, 0.02 + k * 0.025, 0, 0.18 - k * 0.012, 0.022, 0.18 - k * 0.012, [0.82, 0.72, 0.5], TL.rope, k * 0.4); },
  dents(PE) { for (const s of [-1, 1]) PE.box(s * 0.03, 0.03, 0, 0.018, 0.06, 0.016, [1.2, 1.12, 0.9], TL.bone, s * 0.3); PE.box(0, 0.065, 0, 0.12, 0.006, 0.006, [0.4, 0.3, 0.2], TL.rope); },
  lingot(PE) { PE.box(0, 0.025, 0, 0.18, 0.05, 0.07, [0.62, 0.6, 0.58], TL.iron); },
  pain(PE) { PE.box(0, 0.05, 0, 0.2, 0.1, 0.14, [1.05, 0.72, 0.38], TL.bread); },
  // un pot de miel fermé ; un jeton de cire (le pouce pressé) ; une couronne de cire ; un chapelet de dents
  miel(PE) { PE.box(0, 0.06, 0, 0.09, 0.12, 0.09, [1.2, 0.85, 0.3], TL.glass); PE.box(0, 0.125, 0, 0.1, 0.015, 0.1, [0.85, 0.75, 0.6], TL.cloth || TL.plain); },
  jeton(PE) { PE.box(0, 0.006, 0, 0.045, 0.012, 0.045, [0.85, 0.82, 0.72], TL.plain); PE.box(0.005, 0.013, 0, 0.022, 0.003, 0.03, [0.6, 0.58, 0.5], TL.plain); },
  couronne_cire(PE) { for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; PE.box(Math.sin(a) * 0.08, 0.02, Math.cos(a) * 0.08, 0.035, 0.035, 0.035, [1.15, 1.08, 0.86], TL.plain); } },
  chapelet_dents(PE) { for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; PE.box(Math.sin(a) * 0.09, 0.008, Math.cos(a) * 0.065, 0.016, 0.02, 0.012, [1.18, 1.1, 0.88], TL.bone); } },
  // une plume, un œuf, des fleurs ; un cerceau, une clochette muette, un fil de dents de lait
  plume_v5(PE) { PE.box(0, 0.004, 0, 0.03, 0.006, 0.22, [0.85, 0.8, 0.72], TL.plain, 0.3); },
  oeuf(PE) { PE.box(0, 0.04, 0, 0.06, 0.08, 0.055, [1.3, 1.22, 1.08], TL.plain); },
  fleurs3(PE) { const C = [[1.4, 0.45, 0.45], [1.4, 1.25, 0.5], [1.0, 0.6, 1.3]]; for (let k = 0; k < 3; k++) { PE.box(-0.05 + k * 0.05, 0.12, 0, 0.05, 0.05, 0.05, C[k], TL.flowers); PE.box(-0.05 + k * 0.05, 0.05, 0, 0.012, 0.1, 0.012, [0.4, 0.62, 0.3], TL.leaves); } },
  cerceau(PE) { for (let k = 0; k < 14; k++) { const a = k / 14 * TAU; PE.box(Math.sin(a) * 0.2, 0.2 + Math.cos(a) * 0.2, 0, 0.03, 0.03, 0.02, [0.62, 0.5, 0.36], TL.wood); } },
  clochette_muette(PE) { PE.box(0, 0.04, 0, 0.06, 0.07, 0.05, [0.62, 0.58, 0.52], TL.iron); PE.box(0, 0.08, 0, 0.04, 0.014, 0.04, [0.62, 0.58, 0.52], TL.iron); },
  dents_lait(PE) { PE.box(0, 0.004, 0, 0.2, 0.004, 0.004, [0.75, 0.68, 0.55], TL.rope); for (let k = 0; k < 8; k++) PE.box(-0.08 + k * 0.023, 0.01, 0, 0.012, 0.016, 0.012, [1.25, 1.2, 1.05], TL.bone); },
  // une pique à croc, la lame fendue
  pique(PE) { PE.box(0, 0.9, 0, 0.04, 1.8, 0.04, [0.45, 0.35, 0.25], TL.wood); PE.box(0, 1.9, 0, 0.06, 0.24, 0.012, [0.42, 0.4, 0.38], TL.iron); PE.box(0.004, 1.92, 0.008, 0.008, 0.16, 0.004, [0.08, 0.08, 0.08], TL.plain); },
});

const Q20BF = {
  v(c) { return (c.w && c.w.v5) || null; },
  e(id) { try { return (habitantsV5.L || []).find((q) => q.id === id && !q.parti) || null; } catch (er) { return null; } },
  // il ou elle (les anonymes : comme leur silhouette)
  il(e) { return e && e.look && e.look.dress ? 'Elle' : 'Il'; },
  // une personne d'en bas en acteur, à P (sinon là où elle est), tournée vers cap (ou face) ; le vrai est caché
  gens(c, e, P, o) {
    if (!e) return null;
    c.masquer('v5:' + e.id);
    const Q = P || [e.x, e.y, e.z];
    const A = c.gens(Object.assign({}, e.look), Q, Object.assign({ cap: e.heading || 0 }, o));
    if (A) A.s = e.look.height || 1;
    return A;
  },
  // la maison : le seuil (dehors), le dedans, sa table, son lit, sa chandelle, le cap vers la rue
  maison(c, e) {
    const M = e && e.maison, v = Q20BF.v(c);
    if (!M || !v) return null;
    const F = v.F, de = M.porte.dehors, dd = M.porte.dedans;
    const seuil = c.ptSous(de[0], de[1], F + 0.4), dedans = c.ptSous(dd[0], dd[1], F + 0.4);
    const cap = Math.atan2(de[0] - dd[0], de[1] - dd[1]);
    const ch = M.chandelle ? [M.chandelle.x, M.chandelle.y, M.chandelle.z] : null;
    const table = M.table ? c.ptSous(M.table[0], M.table[1], F + 0.4) : null;
    return { M, seuil, dedans, cap, ch, table, lum: ch ? [Q20B.flamme(c, ch, 4.2, 0.3)] : [] };
  },
  // les lieux de la ville : le registre, la cloche, le feu du compte, l'étal, le puits, la porte, l'ossuaire
  lieux(c) {
    const v = Q20BF.v(c);
    if (!v) return null;
    const T = v.temple, F = v.F, fl = T.fl || 0;
    const p = (xz, dy) => (xz ? c.ptSous(xz[0], xz[1], F + (dy || 0) + 0.4) : null);
    const O = v.ossuaire && v.maisons.find((q) => q.id === v.ossuaire.maison);
    return {
      v, F, registre: p(T.registre, fl), cloche: p(T.cloche, 0), feu: p(T.feu, fl), etal: v.marche && p(v.marche.etal || v.marche.place),
      puits: v.puits && p([v.puits.x, v.puits.z]), porteD: v.porte && p(v.porte.dedans), porteH: v.porte && p(v.porte.dehors),
      ossuaire: O ? p([O.f.x, O.f.z]) : null, osCap: O ? O.f.r : 0, feux: v.feux || [], temple: p([T.f.x, T.f.z], fl),
    };
  },
  // la flamme la plus proche (les feux d'en bas, les chandelles)
  flamme(c, P, L) {
    if (!P || !L) return [];
    let best = null;
    for (const q of L.feux) { const d = Math.hypot(q.x - P[0], q.z - P[2]); if (!best || d < best.d) best = { d, q }; }
    return best && best.d < 14 ? [Q20B.flamme(c, [best.q.x, best.q.y, best.q.z], 6, 0.8)] : [];
  },
  // un point de la rue devant P, dans la direction cap
  rue(c, P, cap, d, lat) { return Q20B.libre(c, Q20B.devant(c, P, cap, d, lat), 0, 3, 0.4); },
};

// ============================================================================ CEUX QUI ONT UN NOM
// le Greffier, au registre (debout, la plume à la main)
function q20Greffier(c, geste, o) {
  const L = Q20BF.lieux(c), e = Q20BF.e('greffier');
  if (!L || !e || !L.registre) return null;
  const cap = L.v.CF.r + Math.PI * 0.85;
  const P = Q20BF.rue(c, L.registre, cap + Math.PI, 0.9, 0);
  return { L, e, A: Q20BF.gens(c, e, P, Object.assign({ cap, geste }, o)), P, cap, nom: Q20B.nom('v5:greffier'), lum: [Q20B.flamme(c, L.registre, 3.5, 1.0)] };
}
q20.scenes('q16_v5_greffier_1', {
  qui: 'v5:greffier', monde: 'basse_fosse',
  demande(c) {
    const G = q20Greffier(c, ['travaille', { lookP: 0.35 }]);
    if (!G) return null;
    const ch = c.chose(Q20_DESSINS.chandelles, c.haut(G.L.registre, 0.9), { s: 0.6 });
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(G.A, { cote: 0.6, d: 2.2, buste: true }), acteurs: [G.A, ch], lum: G.lum, dit: c.parole('Ma chandelle baisse. Celles d’ici sont faites de… ce qu’il reste. Elles sentent.', G.nom, 0.7), court: true }),
      c.plan({ dur: 6, cam: c.camChose(c.haut(G.L.registre, 0.9), { d: 1.6, haut: 1.6, dy: 0, a: G.cap + 0.6 }), acteurs: [G.A, ch], lum: G.lum, chaque: Q20H.emet(c.haut(G.L.registre, 1.1), { n: 3, col: [0.12, 0.11, 0.1, 0.5], taille: 0.05, vie: 2, v: 0.04, vy: 0.3 }), dit: c.parole('Apporte-m’en deux de là-haut. Je compterai mieux. Je ne bouge pas. Je ne bouge jamais.', G.nom, 0.7) }),
    ];
  },
  fin(c) {
    const G = q20Greffier(c, [{ reach: 0.25, lookP: 0.2 }]);
    if (!G) return null;
    const ch = c.chose(Q20_DESSINS.chandelles, c.haut(c.devant(G.P, G.cap, 0.25, 0.06, true), 1.45), { s: 0.7 });
    const G2 = q20Greffier(c, ['offre']);
    const pi = c.chose(Q20_DESSINS.piece, c.haut(c.devant(G2.P, G2.cap, 0.35, 0.08, true), 1.05), { s: 1.6 });
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(G.A, { cote: 0.4, d: 1.9 }), acteurs: [G.A, ch], lum: G.lum, dit: c.parole('De la cire d’abeille. J’avais oublié les abeilles.', G.nom, 0.7), court: true }),
      c.plan({ dur: 5.8, cam: c.camActeur(G2.A, { cote: -0.4, d: 2.0, buste: true }), acteurs: [G2.A, pi], lum: G2.lum, son: 'piece', dit: c.parole('Des pièces d’en haut. Je les gardais propres.', G.nom, 0.7) }),
    ];
  },
});

// la Sonneuse : au pied du clocher, la corde de sa cloche
function q20Sonneuse(c, geste, o) {
  const L = Q20BF.lieux(c), e = Q20BF.e('sonneuse_1');
  if (!L || !e || !L.cloche) return null;
  const P = Q20BF.rue(c, L.cloche, L.v.CF.r, 1.2, 0.4);
  return { L, e, P, A: Q20BF.gens(c, e, P, Object.assign({ face: L.cloche, geste }, o)), nom: Q20B.nom('v5:sonneuse_1'), lum: Q20BF.flamme(c, L.cloche, L).concat([Q20B.flamme(c, P, 3.2, 1.4)]) };
}
q20.scenes('q16_v5_greffier_2', {
  qui: 'v5:greffier', monde: 'basse_fosse',
  demande(c) {
    const G = q20Greffier(c, ['parle', { lookP: 0.1 }]);
    if (!G) return null;
    const L = G.L;
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(G.A, { cote: 0.5, d: 2.2 }), acteurs: [G.A], lum: G.lum, dit: c.parole('Demande à la Sonneuse quelle heure il est, là-haut. Elle seule le sait encore.', G.nom, 0.7), court: true }),
      L.cloche && c.plan({ dur: 6, cam: c.camRegard(Q20BF.rue(c, L.cloche, L.v.CF.r, 4, 0), c.haut(L.cloche, 9), { haut: 1.4, recul: 0.04 }), acteurs: [], lum: Q20BF.flamme(c, L.cloche, L), son: 'cloche', dit: c.parole('Moi, j’ai le compte. Je n’ai plus l’heure.', G.nom, 0.7) }),
    ];
  },
  tournant(c) {
    const S = q20Sonneuse(c, ['raide', { lookP: -0.2 }]);
    if (!S) return null;
    const S2 = q20Sonneuse(c, ['parle']);
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(S.A, { cote: 0.4, d: 2.0 }), acteurs: [S.A], lum: S.lum, dit: c.parole('Là-haut ? … L’heure où l’on rentre les bêtes. Dis-lui ça.', S.nom, 1.1) }),
      c.plan({ dur: 5.6, cam: c.camActeur(S2.A, { cote: -0.5, d: 2.4 }), acteurs: [S2.A], lum: S2.lum, dit: c.parole('C’est toujours cette heure-là, dans ma tête.', S.nom, 1.1) }),
    ];
  },
  fin(c) {
    const G = q20Greffier(c, ['travaille', { lookP: 0.45 }]);
    if (!G) return null;
    const pv = c.chose(Q20_DESSINS.pv, c.haut(G.L.registre, 0.95), { s: 1.3, r: G.cap });
    const G2 = q20Greffier(c, ['hoche', 'parle']);
    return [
      c.plan({ dur: 6.2, cam: c.camChose(c.haut(G.L.registre, 0.95), { d: 1.5, haut: 1.6, dy: 0, a: G.cap + 0.4 }), acteurs: [G.A, pv], lum: G.lum, son: 'page', dit: c.parole('L’heure où l’on rentre les bêtes.', G.nom, 0.7), court: true }),
      c.plan({ dur: 5.6, cam: c.camActeur(G2.A, { cote: 0.3, d: 2.0 }), acteurs: [G2.A], lum: G2.lum, dit: c.parole('Merci. Je n’avais plus d’heure.', G.nom, 0.7) }),
    ];
  },
});

q20.scenes('q16_v5_sonneuse_1', {
  qui: 'v5:sonneuse_1', monde: 'basse_fosse',
  demande(c) {
    const S = q20Sonneuse(c, [{ reach: 0.45, lookP: -0.3 }]);
    if (!S) return null;
    const co = c.chose(Q20_DESSINS.corde, c.haut(c.devant(S.P, S.A.cap, 0.4, 0.05, true), 1.1), { s: 1.2 });
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(S.A, { cote: 0.6, d: 2.2 }), acteurs: [S.A, co], lum: S.lum, dit: c.parole('La corde de ma cloche s’effiloche. Quand elle cassera, plus personne ne saura l’heure.', S.nom, 1.1), court: true }),
      c.plan({ dur: 5.8, cam: c.camRegard(c.devant(S.P, S.A.cap, -1.2, 0.4, true), c.haut(S.L.cloche, 8), { haut: 1.4, recul: 0.04 }), acteurs: [S.A], lum: S.lum, dit: c.parole('Apporte-m’en de la neuve. Du chanvre d’en haut. Deux longueurs : la cloche est haute.', S.nom, 1.1) }),
    ];
  },
  fin(c) {
    const S = q20Sonneuse(c, [{ reach: 0.5, lookP: -0.2 }, 'raide']);
    if (!S) return null;
    const S2 = q20Sonneuse(c, ['leve', { reach: 0.6 }]);
    return [
      c.plan({ dur: 6, cam: c.camActeur(S.A, { cote: 0.5, d: 2.0 }), acteurs: [S.A], lum: S.lum, dit: c.parole('Elle sent l’herbe.', S.nom, 1.1), court: true }),
      c.plan({ dur: 6.2, cam: c.camRegard(c.devant(S2.P, S2.A.cap, -1.6, 0.6, true), c.haut(S2.L.cloche, 8), { haut: 1.5, recul: 0.05 }), acteurs: [S2.A], lum: S2.lum, son: 'cloche', dit: c.parole('Écoute.', S2.nom, 1.1) }),
    ];
  },
});

// la Marchande, à son étal
function q20Marchande(c, geste) {
  const L = Q20BF.lieux(c), e = Q20BF.e('marchande_2');
  if (!L || !e || !L.etal) return null;
  const cap = L.v.CF.r + Math.PI / 2;
  const P = Q20BF.rue(c, L.etal, cap + Math.PI, 0.8, 0);
  return { L, e, P, cap, A: Q20BF.gens(c, e, P, { cap, geste }), nom: Q20B.nom('v5:marchande_2'), lum: Q20BF.flamme(c, P, L).concat([Q20B.flamme(c, L.etal, 3.6, 1.2)]) };
}
q20.scenes('q16_v5_marchande_1', {
  qui: 'v5:marchande_2', monde: 'basse_fosse',
  demande(c) {
    const M = q20Marchande(c, ['parle', 'bras']);
    if (!M) return null;
    const M2 = q20Marchande(c, ['penche', { lookP: 0.3 }]);
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(M.A, { cote: 0.5, d: 2.4 }), acteurs: [M.A], lum: M.lum, dit: c.parole('Trois pommes et un pot de miel. Pour moi, pas pour vendre.', M.nom, 1.0), court: true }),
      c.plan({ dur: 6, cam: c.camActeur(M2.A, { cote: -0.6, d: 2.2, buste: true }), acteurs: [M2.A], lum: M2.lum, dit: c.parole('Je ne compte pas, moi : je vends. Mais ça, je le garde. Des rouges, si tu en trouves. Le rouge, ici, on l’oublie.', M.nom, 1.0) }),
    ];
  },
  fin(c) {
    const M = q20Marchande(c, ['baisse', { reach: 0.3 }]);
    if (!M) return null;
    const pa = c.chose(Q20_DESSINS.panier, c.devant(M.P, M.cap, 0.6, 0.3, true), { s: 1.1 });
    const pos = [0, 1, 2].map((k) => c.chose(Q20_DESSINS.pomme, c.haut(c.devant(M.P, M.cap, 0.6, 0.2 + k * 0.08, true), 0.2), { s: 1.0 }));
    const M2 = q20Marchande(c, ['offre']);
    const cc = c.chose(Q20_DESSINS.couronne_cire, c.haut(c.devant(M2.P, M2.cap, 0.36, 0.06, true), 1.05), { s: 1.4 });
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(M.A, { cote: 0.8, d: 2.0, buste: true }), acteurs: [M.A, pa, ...pos], lum: M.lum, dit: c.parole('Rouges.', M.nom, 1.0), court: true }),
      c.plan({ dur: 5.8, cam: c.camActeur(M2.A, { cote: -0.3, d: 2.0, buste: true }), acteurs: [M2.A, cc], lum: M2.lum, dit: c.parole('Une couronne de cire. Pour rien. Ne le dis pas.', M.nom, 1.0) }),
    ];
  },
});

// la Veilleuse des feux : au feu le plus proche de la Nef
function q20VeilleuseV5(c, geste) {
  const L = Q20BF.lieux(c), e = Q20BF.e('veilleuse_3');
  if (!L || !e || !L.feux.length) return null;
  const T = L.temple || L.registre;
  const f = L.feux.slice().sort((a, b) => Math.hypot(a.x - T[0], a.z - T[2]) - Math.hypot(b.x - T[0], b.z - T[2]))[0];
  const F = [f.x, f.y, f.z], P = Q20BF.rue(c, F, 0.4, 1.5, 0);
  return { L, e, F, P, A: Q20BF.gens(c, e, P, { face: F, geste, main: 'lanterne' }), nom: Q20B.nom('v5:veilleuse_3'), lum: [Q20B.flamme(c, F, 6, 0.8)] };
}
q20.scenes('q16_v5_veilleuse_1', {
  qui: 'v5:veilleuse_3', monde: 'basse_fosse',
  demande(c) {
    const V = q20VeilleuseV5(c, ['parle']);
    if (!V) return null;
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(V.A, { cote: 0.7, d: 2.6, avec: V.F, k: 0.3 }), acteurs: [V.A], lum: V.lum, dit: c.parole('Ils ne s’éteignent pas. On les nourrit quand même. C’est la règle.', V.nom, 1.2), court: true }),
      c.plan({ dur: 6, cam: c.camChose(c.haut(V.F, 0.5), { d: 2.2, haut: 1.4, dy: 0, a: 1.6 }), acteurs: [V.A], lum: V.lum, chaque: Q20H.emet(c.haut(V.F, 0.6), { n: 8, col: [1.4, 0.7, 0.3, 0.9], taille: 0.025, vie: 0.8, v: 0.25, vy: 0.7, eclat: true }), dit: c.parole('Trois mesures d’huile, et je n’aurai pas à en prendre là où on en prend. Ne me demande pas où.', V.nom, 1.2) }),
    ];
  },
  fin(c) {
    const V = q20VeilleuseV5(c, ['penche', { reach: 0.45 }]);
    if (!V) return null;
    V.A.main = null;
    const hu = c.chose(Q20_DESSINS.huile, c.haut(Q20B.devant(c, V.P, c.cap(V.P, V.F), 0.6, 0), 0.9), { s: 1.4 });
    const V2 = q20VeilleuseV5(c, ['parle', { lookP: 0.1 }]);
    V2.A.regard = 'camera';
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(V.A, { cote: 1.1, d: 2.6, avec: V.F, k: 0.4 }), acteurs: [V.A, hu], lum: V.lum, dit: null }),
      c.plan({ dur: 5.6, cam: c.camActeur(V2.A, { cote: 0.2, d: 2.0 }), acteurs: [V2.A], lum: V2.lum, dit: c.parole('Tu vois ? Ils n’en ont pas besoin. Merci quand même.', V.nom, 1.2), court: true }),
    ];
  },
});

// l'Ordonnateur, au mur des os de l'ossuaire
function q20Ordonnateur(c, geste) {
  const L = Q20BF.lieux(c), e = Q20BF.e('ordonnateur_4');
  if (!L || !e) return null;
  const P = e.maison && L.ossuaire ? Q20BF.rue(c, L.ossuaire, L.osCap + Math.PI, 1.0, 0) : [e.x, e.y, e.z];
  const mur = L.ossuaire ? Q20B.devant(c, P, L.osCap, 1.4, -0.6) : c.devant(P, e.heading || 0, 1.4, 0, true);
  return { L, e, P, mur, A: Q20BF.gens(c, e, P, { face: mur, geste }), nom: Q20B.nom('v5:ordonnateur_4'), lum: [Q20B.flamme(c, P, 4, 1.4)].concat(Q20BF.flamme(c, P, L)) };
}
q20.scenes('q16_v5_ordonnateur_1', {
  qui: 'v5:ordonnateur_4', monde: 'basse_fosse',
  demande(c) {
    const O = q20Ordonnateur(c, ['montre', 'baisse']);
    if (!O) return null;
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(O.A, { cote: 0.8, d: 2.4 }), acteurs: [O.A], lum: O.lum, dit: c.parole('Il manque des os au mur, en bas à gauche. Les longs. Cinq.', O.nom, 0.8), court: true }),
      c.plan({ dur: 6, cam: c.camChose(c.haut(O.mur, 0.4), { d: 1.8, haut: 1.0, dy: 0, a: c.cap(O.mur, O.P) + 0.5 }), acteurs: [O.A], lum: O.lum, dit: c.parole('Je ne demande pas d’où. Ici, on ne demande jamais d’où.', O.nom, 0.8) }),
    ];
  },
  fin(c) {
    const O = q20Ordonnateur(c, ['travaille', { lookP: 0.4 }]);
    if (!O) return null;
    const os = [0, 1, 2].map((k) => c.chose('ossements', c.haut(O.mur, 0.05 + k * 0.08), { s: 0.6, r: k * 0.4 }));
    const O2 = q20Ordonnateur(c, ['offre']);
    const ch = c.chose(Q20_DESSINS.chapelet_dents, c.haut(c.devant(O2.P, O2.A.cap, 0.36, 0.06, true), 1.05), { s: 1.4 });
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(O.A, { cote: 1.0, d: 2.2, avec: O.mur, k: 0.4 }), acteurs: [O.A, ...os], lum: O.lum, dit: c.parole('Chacun à sa place.', O.nom, 0.8), court: true }),
      c.plan({ dur: 5.8, cam: c.camActeur(O2.A, { cote: 0.3, d: 2.0, buste: true }), acteurs: [O2.A, ch], lum: O2.lum, dit: c.parole('Un chapelet de dents. Pour compter, si tu en as besoin.', O.nom, 0.8) }),
    ];
  },
});

// ============================================================================ LES ANONYMES : une scène par modèle (Q16_V5_MODELES)
// le contexte d'une scène d'anonyme : qui (e), sa maison, son nom, les lieux de la ville
function q20Anon(c, A) {
  const e = Q20BF.e(A.id), L = Q20BF.lieux(c);
  if (!e || !L) return null;
  return { e, L, M: Q20BF.maison(c, e), nom: Q20B.nom('v5:' + A.id), il: Q20BF.il(e), voix: e.role === 'enfant' ? 1.5 : e.look.dress ? 1.15 : 0.85 };
}
// au seuil de sa maison (dehors, tourné vers la rue), ou dedans, près de sa table
function q20Seuil(c, X, geste, o) {
  if (!X.M) return null;
  return Q20BF.gens(c, X.e, X.M.seuil, Object.assign({ cap: X.M.cap, geste }, o));
}
function q20Dedans(c, X, geste, o) {
  if (!X.M) return null;
  const P = X.M.table ? Q20BF.rue(c, X.M.table, X.M.cap, 0.8, 0) : X.M.dedans;
  return Q20BF.gens(c, X.e, P, Object.assign({ face: X.M.table || X.M.seuil, geste }, o));
}
// à la porte de la ville (les gardiens)
function q20Garde(c, X, geste, o) {
  const P = X.L.porteD;
  if (!P) return q20Seuil(c, X, geste, o);
  const cap = X.L.porteH ? c.cap(P, X.L.porteH) : 0;
  return Q20BF.gens(c, X.e, Q20BF.rue(c, P, cap + Math.PI / 2, 1.6, 0), Object.assign({ cap: cap + 0.4, geste }, o));
}
// au puits (les enfants y jouent le jour)
function q20Puits(c, X, geste, o) {
  const P = X.L.puits;
  if (!P) return q20Seuil(c, X, geste, o);
  const Q = Q20BF.rue(c, P, X.e.k * 1.3, 1.6, 0);
  return Q20BF.gens(c, X.e, Q, Object.assign({ face: P, geste }, o));
}
// une chose tendue par un acteur, à la main
function q20Main(c, A, dessin, s, dy) { return A && c.chose(dessin, c.haut(c.devant(A.P, A.cap || 0, 0.36, 0.06, true), dy ?? (A.s && A.s < 0.9 ? 0.72 : 1.08)), { s: s || 1.3, r: A.cap || 0 }); }
function q20Lum(c, X, P) { return (X.M ? X.M.lum : []).concat(Q20BF.flamme(c, P, X.L), [Q20B.flamme(c, P, 3.4, 1.5)]); }
// deux plans : (A1, cam1, texte1), (A2, cam2, texte2) — le premier gardé dans la version courte
function q20Deux(c, X, a, b) {
  return [
    a && a.A && c.plan({ dur: a.dur || 6.2, cam: a.cam, acteurs: [a.A].concat(a.avec || []), lum: a.lum || q20Lum(c, X, a.A.P), son: a.son, chaque: a.chaque, dit: a.t ? c.parole(a.t, a.qui ?? X.nom, X.voix) : null, court: !!a.t }),
    b && b.cam && c.plan({ dur: b.dur || 6, cam: b.cam, acteurs: [b.A].concat(b.avec || []).filter(Boolean), lum: b.lum || q20Lum(c, X, (b.A && b.A.P) || (a && a.A && a.A.P)), son: b.son, chaque: b.chaque, dit: b.t ? c.parole(b.t, b.qui ?? X.nom, X.voix) : null, court: !(a && a.t) }),
  ];
}

const q20BV5 = {
  // les scènes de chaque modèle : { demande(c, X), tournant(c, X), fin(c, X) }
  M: {
    gardien: [
      { // Ce qui rôde aux Ravines
        demande(c, X) {
          const A = q20Garde(c, X, ['parle', { lookY: 0.5 }], { main: 'hallebarde' });
          const H = X.L.porteH;
          return q20Deux(c, X, { A, cam: c.camActeur(A, { cote: 0.6, d: 2.6 }), t: 'Il y a des mange-morts aux Ravines. Ils viennent jusqu’à la porte.' },
            { A: Object.assign({}, A, { vu: false }), cam: X.L.porteD ? c.camChose(c.haut(X.L.porteD, 1.8), { d: 6, haut: 1.9, dy: 0, a: H ? c.cap(H, X.L.porteD) : 0, recul: 0.1 }) : null, son: 'loup', t: 'Rapporte deux de leurs dents. Ne cours pas, là-bas : eux courent mieux.' });
        },
        fin(c, X) {
          const A = q20Seuil(c, X, ['leve', { reach: 0.2 }]) || q20Garde(c, X, ['leve']);
          const d = q20Main(c, A, Q20_DESSINS.dents, 1.6, 1.3);
          const A2 = q20Garde(c, X, ['bras'], { main: 'hallebarde' });
          return q20Deux(c, X, { A, avec: [d], cam: c.camActeur(A, { cote: 0.4, d: 2.0, buste: true }), t: 'Deux. Avec les autres.' },
            { A: A2, cam: c.camActeur(A2, { cote: 0.8, d: 2.8 }), t: 'On dormira mieux à la porte.' });
        },
      },
      { // Une lame qui tient
        demande(c, X) {
          const A = q20Seuil(c, X, ['penche', { lookP: 0.3 }]);
          const pq = A && c.chose(Q20_DESSINS.pique, c.devant(A.P, A.cap, 0.55, 0.3, true), { r: A.cap + 0.3 });
          return q20Deux(c, X, { A, avec: [pq], cam: c.camActeur(A, { cote: 0.7, d: 2.6 }), t: 'Ma pique se fend. Le fer d’ici est fait de clous de cercueil.' },
            { A: Object.assign({}, A, { vu: false }), avec: [pq], cam: pq ? c.camChose(c.haut(pq.P, 1.9), { d: 1.4, haut: 1.9, dy: 0, a: A.cap + 1.0 }) : null, t: 'Rapporte un lingot de là-haut. Un seul. Je ne suis pas gourmand.' });
        },
        fin(c, X) {
          const A = q20Seuil(c, X, ['tend', { lookP: 0.3 }]);
          const li = q20Main(c, A, Q20_DESSINS.lingot, 1.4, 1.1);
          const A2 = q20Seuil(c, X, ['raide'], { regard: 'camera' });
          return q20Deux(c, X, { A, avec: [li], cam: c.camActeur(A, { cote: 0.4, d: 2.0, buste: true }), t: 'Du fer qui a vu le jour.' },
            { A: A2, cam: c.camActeur(A2, { cote: 0.1, d: 2.0 }), t: 'Tu es compté. Tu le restes.' });
        },
      },
      { // Du pain pour la porte
        demande(c, X) {
          const A = q20Garde(c, X, ['parle'], { main: 'hallebarde' });
          const autres = (habitantsV5.L || []).filter((q) => q.role === 'gardien' && q.id !== X.e.id && !q.mort).slice(0, 2).map((q, i) => Q20BF.gens(c, q, Q20BF.rue(c, A.P, (A.cap || 0) + 1.4 + i * 0.9, 2.4 + i, 0), { face: A.P, geste: 'bras', vu: false }));
          return q20Deux(c, X, { A, avec: autres, cam: c.camActeur(A, { cote: 0.5, d: 2.6 }), t: 'À la porte, on a faim. Le pain d’ici est fait de racines.' },
            { A: Object.assign({}, A, { vu: false }), avec: autres, cam: X.L.porteD ? c.camLieu(X.L.porteD, { d: 9, haut: 2.2, dy: 1.4, a: (A.cap || 0) + 2.2 }) : null, t: 'Trois pains d’en haut, pour la garde. Marche. Ne cours pas.' });
        },
        fin(c, X) {
          const A = q20Garde(c, X, ['travaille', { lookP: 0.4 }]);
          const pa = q20Main(c, A, Q20_DESSINS.pain, 1.3, 1.05);
          const A2 = q20Garde(c, X, ['raide'], { regard: 'camera', main: 'hallebarde' });
          return q20Deux(c, X, { A, avec: [pa], cam: c.camActeur(A, { cote: 0.6, d: 2.0, buste: true }), t: 'Du vrai pain. Quatre parts : nous sommes quatre.' },
            { A: A2, cam: c.camActeur(A2, { cote: 0.15, d: 2.0 }), t: 'On ne t’a rien demandé. Tu comprends ?' });
        },
      },
      { // Le mot de la porte (parler : le Greffier)
        demande(c, X) {
          const A = q20Garde(c, X, ['parle', { lookY: -0.4 }], { main: 'hallebarde' });
          const T = X.L.temple;
          return q20Deux(c, X, { A, cam: c.camActeur(A, { cote: 0.5, d: 2.4 }), t: 'Va demander au Greffier le mot de cette nuit. Moi, je ne quitte pas mon poste.' },
            { A: null, cam: T ? c.camLieu(T, { d: 16, haut: 3, dy: 4 }) : null, son: 'cloche', t: 'Ne le dis à personne d’autre.' });
        },
        tournant(c, X) {
          const G = q20Greffier(c, ['travaille', { lookP: 0.4 }]);
          if (!G) return null;
          return [
            c.plan({ dur: 6.2, cam: c.camActeur(G.A, { cote: 0.6, d: 2.2, buste: true }), acteurs: [G.A], lum: G.lum, dit: c.parole('Le mot ? Dis-lui : le même qu’hier.', G.nom, 0.7) }),
            c.plan({ dur: 5.6, cam: c.camActeur(G.A, { cote: -0.4, d: 2.0 }), acteurs: [G.A], lum: G.lum, dit: c.parole('C’est toujours le même. Ils le savent.', G.nom, 0.7) }),
          ];
        },
        fin(c, X) {
          const A = q20Garde(c, X, ['hoche'], { main: 'hallebarde' });
          const A2 = q20Garde(c, X, ['bras', { lookY: 0.5 }], { main: 'hallebarde' });
          return q20Deux(c, X, { A, cam: c.camActeur(A, { cote: 0.4, d: 2.2 }), t: 'Le même qu’hier. Bien.' },
            { A: A2, cam: c.camActeur(A2, { cote: 1.0, d: 3.0 }), t: 'Rien ne change. C’est ça, garder.' });
        },
      },
    ],
    habitant: [
      { // Du pain qui a vu le jour
        demande(c, X) {
          const A = q20Seuil(c, X, ['parle', { lookP: -0.1 }]);
          const A2 = q20Dedans(c, X, ['baisse']);
          return q20Deux(c, X, { A, cam: c.camActeur(A, { cote: 0.5, d: 2.4 }), t: 'Le pain d’en haut… Je me souviens de l’odeur. Pas du goût.' },
            { A: A2, cam: c.camActeur(A2, { cote: 0.8, d: 2.0 }), t: 'Rapporte-m’en deux. Je veux me souvenir du goût. Ne le dis pas aux gardiens.' });
        },
        fin(c, X) {
          const A = q20Dedans(c, X, [{ reach: 0.25, lookP: 0.25 }]);
          const pa = q20Main(c, A, Q20_DESSINS.pain, 1.2, 1.35);
          const A2 = q20Dedans(c, X, ['raide', 'baisse']);
          return q20Deux(c, X, { A, avec: [pa], cam: c.camActeur(A, { cote: 0.5, d: 1.9, buste: true }), t: '' },
            { A: A2, cam: c.camActeur(A2, { cote: -0.3, d: 1.9 }), t: 'C’était ça. C’était ça.' });
        },
      },
      { // Une poignée de sel
        demande(c, X) {
          const A = q20Seuil(c, X, ['bras']);
          const A2 = q20Dedans(c, X, ['parle']);
          return q20Deux(c, X, { A, cam: c.camActeur(A, { cote: 0.6, d: 2.4 }), t: 'Tout a le même goût, ici. Le goût de la cave.' },
            { A: A2, cam: c.camActeur(A2, { cote: 0.4, d: 2.0 }), t: 'Du sel. Deux poignées. On dit que ceux d’en haut sont bons.' });
        },
        fin(c, X) {
          const A = q20Dedans(c, X, [{ reach: 0.15, lookP: -0.2 }, 'raide']);
          const se = q20Main(c, A, Q20_DESSINS.sel, 1.3, 1.3);
          return q20Deux(c, X, { A, avec: [se], cam: c.camActeur(A, { cote: 0.4, d: 1.8, buste: true }), t: '' },
            { A, cam: c.camActeur(A, { cote: -0.5, d: 2.0 }), t: 'La mer. Je ne l’ai jamais vue. C’est la mer.' });
        },
      },
      { // Trois pommes
        demande(c, X) {
          const A = q20Seuil(c, X, ['parle', 'montre']);
          const A2 = q20Dedans(c, X, ['baisse'], { vu: true });
          return q20Deux(c, X, { A, cam: c.camActeur(A, { cote: 0.5, d: 2.4 }), t: 'Trois pommes. Une pour moi, une pour ma mère, une pour celui qui était là avant moi.' },
            { A: A2, cam: c.camActeur(A2, { cote: 0.9, d: 2.0 }), t: 'Celui d’avant n’en mangera pas. Mais il faut compter.' });
        },
        fin(c, X) {
          const A = q20Seuil(c, X, ['baisse', { reach: 0.4 }]);
          const po = A && c.chose(Q20_DESSINS.pomme, c.devant(A.P, A.cap, 0.5, 0, true), { s: 1.1 });
          const A2 = q20Dedans(c, X, [{ reach: 0.15, lookP: 0.2 }]);
          const po2 = q20Main(c, A2, Q20_DESSINS.pomme, 1.0, 1.42);
          const po3 = X.M && X.M.table && c.chose(Q20_DESSINS.pomme, c.haut(X.M.table, 0.78), { s: 1.0 });
          return q20Deux(c, X, { A, avec: [po], cam: c.camActeur(A, { cote: 0.8, d: 2.2 }), t: 'Une pour celui d’avant.' },
            { A: A2, avec: [po2, po3], cam: c.camActeur(A2, { cote: 0.3, d: 1.9, buste: true }), t: 'Merci.' });
        },
      },
      { // Un peu de miel
        demande(c, X) {
          const A = q20Seuil(c, X, ['parle', { lookP: -0.35 }]);
          const A2 = q20Dedans(c, X, ['bras']);
          return q20Deux(c, X, { A, cam: c.camActeur(A, { cote: 0.5, d: 2.4 }), t: 'Les abeilles. Tu en as vu ?' },
            { A: A2, cam: c.camActeur(A2, { cote: 0.6, d: 2.0 }), t: 'Rapporte-moi un pot de leur miel. Je le garderai fermé. Je veux savoir qu’il est là.' });
        },
        fin(c, X) {
          const A = q20Dedans(c, X, ['baisse', { reach: 0.4 }]);
          const lit = X.M && X.M.M.lit ? c.ptSous(X.M.M.lit[0], X.M.M.lit[1], X.L.F + 0.4) : null;
          const mi = lit && c.chose(Q20_DESSINS.miel, c.haut(lit, 0.32), { s: 1.2 });
          const A2 = lit ? Q20BF.gens(c, X.e, Q20BF.rue(c, lit, X.M.cap, 0.9, 0), { face: lit, geste: ['raide'] }) : A;
          return q20Deux(c, X, { A: A2, avec: [mi], cam: c.camActeur(A2, { cote: 0.9, d: 2.0, avec: lit, k: 0.3 }), t: 'Fermé. Je le garderai fermé.' },
            { A: A2, cam: c.camActeur(A2, { cote: 0.2, d: 1.8 }), t: 'Il est là. C’est tout ce que je voulais.' });
        },
      },
      { // Des chandelles
        demande(c, X) {
          const A = q20Dedans(c, X, ['parle', { lookP: 0.2 }]);
          const fu = X.M && X.M.ch ? Q20H.emet(c.haut(X.M.ch, 0.15), { n: 5, col: [0.06, 0.06, 0.06, 0.6], taille: 0.06, vie: 2.4, v: 0.05, vy: 0.35 }) : null;
          return q20Deux(c, X, { A, chaque: fu, cam: c.camActeur(A, { cote: 0.5, d: 2.0 }), t: 'Nos chandelles fument noir. Les tiennes fument blanc, il paraît.' },
            { A: Object.assign({}, A, { vu: false }), chaque: fu, cam: X.M && X.M.ch ? c.camChose(X.M.ch, { d: 1.2, haut: 1.4, dy: 0.1, a: X.M.cap + 0.6 }) : null, t: 'Deux. Pour la nuit du compte.' });
        },
        fin(c, X) {
          const F = X.L.feu;
          const A = F ? Q20BF.gens(c, X.e, Q20BF.rue(c, F, X.L.v.CF.r + 1.2, 1.4, 0), { face: F, geste: ['penche', { reach: 0.4 }] }) : q20Dedans(c, X, ['leve']);
          const fu = F ? Q20H.emet(c.haut(F, 0.8), { n: 6, col: [1.2, 1.2, 1.2, 0.45], taille: 0.09, vie: 3, v: 0.05, vy: 0.45 }) : null;
          const autres = (habitantsV5.L || []).filter((q) => q.role === 'habitant' && q.id !== X.e.id && !q.mort).slice(0, 3).map((q, i) => F && Q20BF.gens(c, q, Q20BF.rue(c, F, X.L.v.CF.r + 2.6 + i * 0.8, 3 + i * 0.6, 0), { face: F, geste: 'leve', vu: false }));
          return q20Deux(c, X, { A, avec: autres, chaque: fu, lum: F ? [Q20B.flamme(c, F, 6, 0.8)] : undefined, cam: c.camActeur(A, { cote: 0.9, d: 2.6, avec: F, k: 0.4 }), t: 'Blanc.' },
            { A: null, avec: autres, chaque: fu, lum: F ? [Q20B.flamme(c, F, 6, 0.8)] : undefined, cam: F ? c.camChose(c.haut(F, 1.2), { d: 4.2, haut: 1.8, dy: 0, a: X.L.v.CF.r + 2.8 }) : null, t: '' });
        },
      },
      { // Un mot pour la Sonneuse (parler)
        demande(c, X) {
          const A = q20Seuil(c, X, ['raide', 'parle']);
          const S = X.L.cloche;
          return q20Deux(c, X, { A, cam: c.camActeur(A, { cote: 0.4, d: 2.2 }), t: 'Dis à la Sonneuse que je n’ai pas entendu la cloche, hier.' },
            { A: null, cam: S ? c.camRegard(Q20BF.rue(c, S, X.L.v.CF.r, 4, 0), c.haut(S, 9), { haut: 1.4, recul: 0.04 }) : null, t: 'Elle comprendra. Ou bien elle aura peur. Ne dis pas mon nom : je n’en ai plus.' });
        },
        tournant(c, X) {
          const S = q20Sonneuse(c, ['raide', { lookP: 0.25 }]);
          if (!S) return null;
          const S2 = q20Sonneuse(c, ['parle']);
          return [
            c.plan({ dur: 6.4, cam: c.camActeur(S.A, { cote: 0.4, d: 2.0 }), acteurs: [S.A], lum: S.lum, dit: c.parole('Pas entendu ? … Alors c’est qu’il commence à partir.', S.nom, 1.1) }),
            c.plan({ dur: 5.6, cam: c.camActeur(S2.A, { cote: -0.4, d: 2.2 }), acteurs: [S2.A], lum: S2.lum, dit: c.parole('Dis-lui de venir s’asseoir près du temple.', S.nom, 1.1) }),
          ];
        },
        fin(c, X) {
          const A = q20Seuil(c, X, ['hoche', 'baisse']);
          const A2 = q20Seuil(c, X, ['raide'], { cap: X.M ? c.cap(X.M.seuil, X.L.temple || X.M.seuil) : 0 });
          return q20Deux(c, X, { A, cam: c.camActeur(A, { cote: 0.4, d: 2.0 }), t: 'Près du temple.' },
            { A: A2, cam: c.camActeur(A2, { cote: 2.4, d: 3.4 }), t: 'Oui. Bientôt.' });
        },
      },
      { // Un jeton pour la Veilleuse (livrer)
        demande(c, X) {
          const A = q20Seuil(c, X, ['tend']);
          const je = q20Main(c, A, Q20_DESSINS.jeton, 1.8, 1.12);
          return q20Deux(c, X, { A, avec: [je], cam: c.camActeur(A, { cote: 0.5, d: 2.0, buste: true }), t: 'Porte ce jeton à la Veilleuse. Elle saura que c’est moi.' },
            { A: Object.assign({}, A, { vu: false }), avec: [je], cam: je ? c.camChose(je.P, { d: 1.0, haut: 1.4, dy: 0, a: (A.cap || 0) + 0.7 }) : null, t: 'Elle gardera ma flamme une nuit de plus. Ne le perds pas : il n’y en a qu’un par personne.' });
        },
        tournant(c, X) {
          const V = q20VeilleuseV5(c, [{ reach: 0.2, lookP: 0.4 }]);
          if (!V) return null;
          const je = q20Main(c, V.A, Q20_DESSINS.jeton, 1.8, 1.12);
          return [
            c.plan({ dur: 6.2, cam: c.camActeur(V.A, { cote: 0.6, d: 2.0, buste: true }), acteurs: [V.A, je], lum: V.lum, dit: null }),
            c.plan({ dur: 5.6, cam: c.camActeur(V.A, { cote: -0.3, d: 2.2 }), acteurs: [V.A], lum: V.lum, dit: c.parole('Une nuit de plus. Dis-le-lui.', V.nom, 1.2) }),
          ];
        },
        fin(c, X) {
          const A = q20Seuil(c, X, ['raide', { lookP: -0.2 }]);
          const A2 = q20Seuil(c, X, ['hoche']);
          return q20Deux(c, X, { A, cam: c.camActeur(A, { cote: 0.5, d: 2.0 }), t: 'Une nuit de plus.' },
            { A: A2, cam: c.camActeur(A2, { cote: -0.4, d: 2.4 }), t: 'Merci.' });
        },
      },
      { // Des fleurs pour la Nef
        demande(c, X) {
          const A = q20Seuil(c, X, ['parle', { lookY: 0.5 }]);
          const T = X.L.temple;
          return q20Deux(c, X, { A, cam: c.camActeur(A, { cote: 0.5, d: 2.4 }), t: 'Il n’y a pas de fleurs, ici. On en sculpte dans la cire, pour la Nef.' },
            { A: null, cam: T ? c.camLieu(T, { d: 14, haut: 2.6, dy: 2.4 }) : null, t: 'Rapporte-m’en des vraies. Trois. Elles faneront. Je sais. C’est pour ça.' });
        },
        fin(c, X) {
          const T = X.L.temple;
          const P = T ? Q20BF.rue(c, T, X.L.v.CF.r + Math.PI, 7, 1.5) : X.M && X.M.seuil;
          const fl = P && c.chose(Q20_DESSINS.fleurs3, Q20B.devant(c, P, X.L.v.CF.r, 0.6, 0), { s: 1.3 });
          const A = P && Q20BF.gens(c, X.e, P, { face: fl ? fl.P : T, geste: ['baisse', { reach: 0.4 }] });
          const A2 = P && Q20BF.gens(c, X.e, P, { face: fl ? fl.P : T, geste: ['raide'] });
          return q20Deux(c, X, { A, avec: [fl], cam: A ? c.camActeur(A, { cote: 0.9, d: 2.4, avec: fl && fl.P, k: 0.4 }) : null, t: '' },
            { A: A2, avec: [fl], cam: A2 ? c.camActeur(A2, { cote: -0.5, d: 2.2 }) : null, t: 'Elles faneront. Tout le monde le verra. C’est bien.' });
        },
      },
    ],
    enfant: [
      { // Ça sent comment ?
        demande(c, X) {
          const A = q20Puits(c, X, [{ lookP: -0.25 }, 'parle']);
          const A2 = q20Puits(c, X, [{ reach: 0.3 }]);
          return q20Deux(c, X, { A, cam: c.camActeur(A, { cote: 0.4, d: 1.8, haut: 1.0 }), t: 'C’est vrai qu’il y a des fleurs, là-haut ? Ça sent comment ?' },
            { A: A2, cam: c.camActeur(A2, { cote: -0.5, d: 1.6, haut: 1.0 }), t: 'Rapporte-m’en une. Juste une. Tu promets ?' });
        },
        fin(c, X) {
          const A = q20Seuil(c, X, ['leve', { reach: 0.2 }]);
          const fl = q20Main(c, A, Q20_DESSINS.fleurs3, 0.8, 0.78);
          const A2 = q20Seuil(c, X, ['offre']);
          const ce = A2 && c.chose(Q20_DESSINS.cerceau, Q20B.devant(c, A2.P, A2.cap, 0.6, 0.2), { r: A2.cap + Math.PI / 2 });
          return q20Deux(c, X, { A, avec: [fl], cam: c.camActeur(A, { cote: 0.5, d: 1.6, haut: 1.0 }), t: 'Ça pique le nez !' },
            { A: A2, avec: [ce], cam: c.camActeur(A2, { cote: -0.4, d: 1.8, haut: 1.0 }), t: 'Tiens. Mon cerceau. Pour toi.' });
        },
      },
      { // Une plume
        demande(c, X) {
          const A = q20Puits(c, X, [{ lookP: -0.3 }]);
          const A2 = q20Puits(c, X, ['parle', 'leve']);
          return q20Deux(c, X, { A, cam: c.camActeur(A, { cote: 0.4, d: 1.8, haut: 1.0 }), t: 'Les oiseaux, ça existe ?' },
            { A: A2, cam: c.camActeur(A2, { cote: -0.4, d: 1.6, haut: 1.0 }), t: 'Rapporte une plume, pour que je montre aux autres. Une grande !' });
        },
        fin(c, X) {
          const A = q20Seuil(c, X, [{ reach: 0.25, lookP: -0.1 }]);
          const pl = q20Main(c, A, Q20_DESSINS.plume_v5, 1.4, 0.95);
          const A2 = q20Seuil(c, X, ['offre']);
          const cl = q20Main(c, A2, Q20_DESSINS.clochette_muette, 1.4, 0.75);
          return q20Deux(c, X, { A, avec: [pl], cam: c.camActeur(A, { cote: 0.5, d: 1.6, haut: 1.0 }), t: 'Ça vole avec ça ?' },
            { A: A2, avec: [cl], cam: c.camActeur(A2, { cote: -0.3, d: 1.6, haut: 1.0 }), t: 'Tiens. Elle ne sonne pas.' });
        },
      },
      { // Un œuf
        demande(c, X) {
          const A = q20Puits(c, X, ['parle']);
          const A2 = q20Puits(c, X, [{ reach: 0.3 }, 'leve']);
          return q20Deux(c, X, { A, cam: c.camActeur(A, { cote: 0.4, d: 1.8, haut: 1.0 }), t: 'Ma grand-mère dit qu’il y a des pierres blanches qui deviennent des oiseaux.' },
            { A: A2, cam: c.camActeur(A2, { cote: -0.5, d: 1.6, haut: 1.0 }), t: 'Rapporte-m’en une. Une pierre-oiseau !' });
        },
        fin(c, X) {
          const A = q20Seuil(c, X, ['penche', { reach: 0.1 }]);
          const oe = A && c.chose(Q20_DESSINS.oeuf, c.haut(c.devant(A.P, A.cap, 0.1, 0.12, true), 1.0 * (A.s || 1)), { s: 1.1 });
          const A2 = q20Seuil(c, X, ['offre']);
          const de = q20Main(c, A2, Q20_DESSINS.dents_lait, 1.3, 0.75);
          return q20Deux(c, X, { A, avec: [oe], cam: c.camActeur(A, { cote: 0.6, d: 1.6, haut: 1.0 }), t: 'Il dort.' },
            { A: A2, avec: [de], cam: c.camActeur(A2, { cote: -0.3, d: 1.6, haut: 1.0 }), t: 'Un fil de dents de lait. C’est ce que j’ai de mieux.' });
        },
      },
    ],
  },
  // le modèle de la quête d'un anonyme (celui tiré pour la partie) : { role, i } ou null
  modele(A) {
    let q = null;
    try { q = q16.P('v5:' + A.id).quetes[0]; } catch (e) { q = null; }
    const L = q && Q16_V5_MODELES[A.role];
    if (!L) return null;
    const i = L.findIndex((M) => M.title === q.title);
    return i >= 0 ? { role: A.role, i, q } : null;
  },
  scene(role, i) { return (this.M[role] && this.M[role][i]) || null; },
  // la scène d'un moment pour un anonyme (le bon modèle, avec lui)
  jouer(c, A, m) {
    const T = this.modele(A), S = T && this.scene(T.role, T.i);
    if (!S || typeof S[m] !== 'function') return null;
    const X = q20Anon(c, A);
    return X ? S[m](c, X) : null;
  },
  // le tournant n'existe que pour les modèles où l'on porte un mot ou une chose : selon le modèle tiré pour la partie
  majDefs() {
    for (const A of Q16_V5_ANONYMES) {
      const D = q20.defs['q16_v5_' + A.id];
      if (!D) continue;
      const T = this.modele(A), S = T && this.scene(T.role, T.i);
      if (S && typeof S.tournant === 'function') D.tournant = (c) => q20BV5.jouer(c, A, 'tournant');
      else delete D.tournant;
    }
  },
};
for (const A of Q16_V5_ANONYMES) {
  q20.scenes('q16_v5_' + A.id, {
    qui: 'v5:' + A.id, monde: 'basse_fosse',
    demande: (c) => q20BV5.jouer(c, A, 'demande'),
    fin: (c) => q20BV5.jouer(c, A, 'fin'),
  });
}
// le modèle tiré change avec la partie (sa graine) : le tournant suit
{
  const _ge = q16.generer.bind(q16);
  q16.generer = function () {
    const neuf = !this._gen || this._genSeed !== ((farm.s && farm.s.seed) | 0);
    const G = _ge();
    if (neuf) { try { q20BV5.majDefs(); } catch (e) { console.error('q20 : Basse-Fosse', e); } }
    return G;
  };
}
HOOKS.load.push(() => { try { q20BV5.majDefs(); } catch (e) { console.error('q20 : Basse-Fosse', e); } });
