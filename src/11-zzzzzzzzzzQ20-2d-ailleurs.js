// ============================================================================
//  LES SCÈNES DES QUÊTES (agent Q20B) — 2d. CEUX D'AILLEURS
//  Leurs scènes se jouent chez eux, quand on y est (def.monde, -2a-outils.js) :
//  - le roi Sucre, au pays des bonbons (dans sa salle du trône de pain d'épice) ;
//  - la vieille des gobelins, dans la Gobelinière (sur son siège, au grand tas) ;
//  - Thibaud au treuil, et la Dame derrière la porte de sa tour, à Hautguet (la Zone) ;
//  - la veilleuse de la cité, au Seuil ;
//  - ceux du Dessous, au Hameau d'En-Bas : leur parler usé jusqu'à l'os, leurs
//    gestes, leurs cabanes, la pierre au pain, la rive, la longue galerie ;
//    et ce qu'ils montrent ailleurs (la cave des Murés, le vieux puits, la
//    Chambre des Gouttes).
// ============================================================================
Object.assign(Q20_DESSINS, {
  // une pomme d'en haut, une vraie (un ver, peut-être)
  pomme(PE) { PE.box(0, 0.045, 0, 0.09, 0.09, 0.09, [1.15, 0.22, 0.16], TL.plain); PE.box(0, 0.1, 0, 0.012, 0.03, 0.012, [0.35, 0.22, 0.12], TL.wood); PE.box(0.02, 0.105, 0, 0.03, 0.006, 0.016, [0.4, 0.7, 0.3], TL.leaves); },
  // des dragées
  dragees(PE) { const C = [[1.4, 0.8, 1.0], [0.8, 1.3, 1.05], [1.4, 1.3, 0.7]]; for (let k = 0; k < 6; k++) PE.box(-0.06 + (k % 3) * 0.06, 0.015, (k < 3 ? -0.03 : 0.03), 0.04, 0.03, 0.03, C[k % 3], TL.plain); },
  // les choses qu'on ne regarde plus : une ficelle, une bouteille vide, un chiffon
  trois_choses(PE) { PE.box(-0.18, 0.005, 0, 0.16, 0.01, 0.02, [0.85, 0.75, 0.55], TL.rope, 0.6); PE.box(0, 0.12, 0, 0.07, 0.24, 0.07, [0.4, 0.55, 0.42], TL.glass); PE.box(0.18, 0.02, 0.02, 0.18, 0.04, 0.14, [0.7, 0.6, 0.55], TL.cloth || TL.plain, 0.4); },
  // une pierre percée ; une perle des cavernes ; une pierre qui luit
  pierre_percee(PE) { PE.box(0, 0.03, 0, 0.09, 0.06, 0.09, [0.62, 0.6, 0.56], TL.stone); PE.box(0, 0.03, 0, 0.03, 0.062, 0.03, [0.05, 0.05, 0.05], TL.plain); },
  perle(PE) { PE.box(0, 0.02, 0, 0.035, 0.035, 0.035, [1.3, 1.28, 1.2], TL.plain); },
  luisante(PE) { PE.fl = FX_EMIT; PE.box(0, 0.04, 0, 0.1, 0.07, 0.08, [0.36, 0.95, 0.55], TL.stone, 0.4); PE.fl = 0; },
  // une couverture pliée ; une fiole d'huile pour le Guet ; un bouquet noué ; un bijou
  couverture(PE) { PE.box(0, 0.06, 0, 0.5, 0.12, 0.34, [0.62, 0.55, 0.45], TL.wool || TL.cloth || TL.plain); PE.box(0, 0.121, 0, 0.5, 0.004, 0.04, [0.45, 0.32, 0.22], TL.plain); },
  bouquet(PE) { const C = [[1.4, 0.45, 0.45], [1.4, 1.25, 0.5], [1.3, 1.3, 1.25], [0.9, 0.55, 1.2]]; for (let k = 0; k < 7; k++) PE.box(-0.06 + (k % 4) * 0.04, 0.03, -0.04 + Math.floor(k / 4) * 0.06, 0.05, 0.05, 0.05, C[k % 4], TL.flowers); PE.box(0, 0.015, 0.12, 0.03, 0.03, 0.16, [0.4, 0.62, 0.3], TL.leaves); PE.box(0, 0.02, 0.08, 0.04, 0.02, 0.02, [0.8, 0.2, 0.25], TL.plain); },
  bijou(PE) { PE.box(0, 0.006, 0, 0.06, 0.01, 0.06, [1.35, 1.1, 0.55], TL.gold); PE.box(0, 0.014, 0, 0.026, 0.012, 0.026, [0.25, 0.5, 1.1], TL.glass); },
  // le cahier d'Iorin ; une graine de la cité (elle luit)
  cahier(PE) { PE.box(0, 0.012, 0, 0.18, 0.024, 0.24, [0.55, 0.62, 0.78], TL.paper); PE.box(0.004, 0.014, 0, 0.17, 0.022, 0.23, [1.1, 1.08, 1.02], TL.paper); },
  graine(PE) { PE.fl = FX_EMIT; PE.box(0, 0.02, 0, 0.035, 0.04, 0.03, [0.6, 0.85, 1.25], TL.plain); PE.fl = 0; },
  // au Dessous : un paquet de peau cousue ; un écheveau de cheveux blancs ; un fuseau vide ; un bol de soupe ; du sel
  paquet(PE) { PE.box(0, 0.04, 0, 0.16, 0.08, 0.12, [0.85, 0.8, 0.72], TL.leather); PE.box(0, 0.081, 0, 0.16, 0.004, 0.01, [0.5, 0.45, 0.4], TL.rope); },
  echeveau(PE) { PE.box(0, 0.03, 0, 0.2, 0.05, 0.08, [1.3, 1.3, 1.26], TL.wool || TL.plain, 0.3); },
  fuseau(PE) { PE.box(0, 0.12, 0, 0.012, 0.24, 0.012, [0.62, 0.5, 0.36], TL.wood); PE.box(0, 0.04, 0, 0.06, 0.02, 0.06, [0.55, 0.45, 0.32], TL.wood); },
  bol(PE) { PE.box(0, 0.04, 0, 0.12, 0.08, 0.12, [0.62, 0.5, 0.38], TL.wood); PE.box(0, 0.075, 0, 0.1, 0.01, 0.1, [0.8, 0.6, 0.3], TL.plain); },
  sel(PE) { PE.box(0, 0.01, 0, 0.07, 0.02, 0.07, [1.35, 1.35, 1.32], TL.plain, 0.4); },
  // un hameçon (un clou plié), la ligne nouée
  hamecon(PE) { PE.box(0, 0.004, 0, 0.012, 0.008, 0.07, [0.6, 0.58, 0.55], TL.iron); PE.box(0, 0.004, 0.06, 0.25, 0.006, 0.006, [0.78, 0.7, 0.52], TL.rope); },
  // onze encoches dans la pierre, la onzième fraîche (vues de face)
  onze(PE) { PE.box(0, 0, 0, 0.9, 0.5, 0.02, [0.5, 0.48, 0.44], TL.stone); for (let k = 0; k < 11; k++) PE.box(-0.38 + k * 0.075, 0.02, 0.012, 0.018, 0.26, 0.006, k === 10 ? [1.2, 1.18, 1.1] : [0.16, 0.15, 0.14], TL.plain); },
  // une pierre verte sur une dalle, onze petites pierres en rond
  rond(PE) { PE.box(0, 0.06, 0, 0.7, 0.12, 0.7, [0.5, 0.48, 0.45], TL.stone); PE.fl = FX_EMIT; PE.box(0, 0.16, 0, 0.09, 0.08, 0.08, [0.36, 0.95, 0.55], TL.stone); PE.fl = 0; for (let k = 0; k < 11; k++) { const a = k / 11 * TAU; PE.box(Math.sin(a) * 0.26, 0.135, Math.cos(a) * 0.26, 0.045, 0.03, 0.045, [0.62, 0.6, 0.56], TL.stone); } },
  // une marmite froide
  marmite(PE) { PE.box(0, 0.12, 0, 0.32, 0.24, 0.32, [0.2, 0.2, 0.2], TL.iron); PE.box(0, 0.245, 0, 0.26, 0.01, 0.26, [0.08, 0.08, 0.08], TL.plain); },
});

// ============================================================================ LE ROI SUCRE (au pays des bonbons)
function q20Roi(c) {
  const e = typeof mondes !== 'undefined' && Array.isArray(mondes.betes) ? mondes.betes.find((q) => q.kind === 'roi_sucre') : null;
  if (!e || typeof MONDES_RIGS === 'undefined') return null;
  c.masquer('roi_sucre');
  const P = [e.x, e.y, e.z];
  return { e, P, cap: e.heading || 0, s: e.s || 1.25 };
}
q20.scenes('q16_roi_sucre_1', {
  qui: 'roi_sucre',
  monde: 'bonbons',
  demande(c) {
    const R = q20Roi(c);
    if (!R) return null;
    const nom = Q20B.nom('roi_sucre');
    const roi = c.rigActeur('roi', () => MONDES_RIGS.roi(), R.P, { cap: R.cap, s: R.s, geste: ['parle', { lookP: 0.15 }] });
    const B = mondes.S().bonbons, Ch = B && B.sites && B.sites.chateau;
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(roi, { cote: 0.25, d: 4.2, haut: 1.8 }), acteurs: [roi], dit: c.parole('Apporte-moi une pomme de là-haut, la prochaine fois. Une vraie. Je voudrais voir quelque chose pourrir.', nom, 0.7), court: true }),
      Ch && c.plan({ dur: 6, cam: c.camLieu(c.pt(Ch.x, Ch.z), { d: 42, haut: 6, dy: 4, a: c.cap([Ch.x, 0, Ch.z], [B.x, 0, B.z]) + 0.4, recul: 0.1 }), dit: c.parole('Ici, rien ne pourrit. Tu ne peux pas savoir comme c’est long.', nom, 0.7) }),
    ];
  },
  fin(c) {
    const R = q20Roi(c);
    if (!R) return null;
    const nom = Q20B.nom('roi_sucre');
    const roi = c.rigActeur('roi', () => MONDES_RIGS.roi(), R.P, { cap: R.cap, s: R.s, geste: ['tend', 'baisse'] });
    const po = c.chose(Q20_DESSINS.pomme, c.haut(c.devant(R.P, R.cap, 0.55 * R.s, 0.12 * R.s, true), 1.08 * R.s), { s: 1.5 });
    const roi2 = c.rigActeur('roi', () => MONDES_RIGS.roi(), R.P, { cap: R.cap, s: R.s, geste: ['raide', 'offre'] });
    const tete = c.haut(R.P, 1.95 * R.s);
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(roi, { cote: 0.7, d: 3.4, haut: 1.7, buste: true }), acteurs: [roi, po], dit: c.parole('Il la tient longtemps au creux de sa main de pain d’épice. Elle ne pourrit pas.', ''), court: true }),
      c.plan({ dur: 6, cam: c.camActeur(roi2, { cote: 0.1, d: 3.0, haut: 1.9 }), acteurs: [roi2, po], chaque: Q20H.emet(c.devant(tete, R.cap, 0.18, 0, true), { n: 3, col: [1.0, 0.45, 0.7, 0.95], taille: 0.03, vie: 1.2, v: 0.02, vy: -0.4, grav: 2, r: 0.12 }), dit: c.parole('Il pleure du sirop. « Prends des dragées. Prends. »', nom, 0.7) }),
    ];
  },
});

// ============================================================================ LA VIEILLE DES GOBELINS (la Gobelinière : son siège, le grand tas)
function q20Vieille(c, st) {
  const G = c.w.gobelins && c.w.gobelins.village, Sg = G && G.siege;
  if (!Sg || typeof gobPose !== 'function' || !ANIMAL_RIGS.x_aieule) return null;
  c.masquer('aieule');
  const P = [Sg.x, Sg.y - 0.27, Sg.z];
  const A = c.figure(() => ANIMAL_RIGS.x_aieule(), (r, s, t) => { gobPose(r, Object.assign({ mode: 'assis', t, nuit: 1, seed: 3 }, s)); return 0; }, P, { cap: Sg.r, st });
  const ch = qtProps(c.w, G.x, G.z, 30, (q) => q.id === 'gob_chandelles').sort((a, b) => Math.hypot(a.x - Sg.x, a.z - Sg.z) - Math.hypot(b.x - Sg.x, b.z - Sg.z)).slice(0, 2);
  return { G, Sg, P, A, tete: c.haut(P, 1.0), lum: ch.map((q) => Q20B.flamme(c, [q.x, q.y, q.z], 4, 0.5)) };
}
// la vieille parle avec toutes les voix qu'elle a prises
function q20Voix(v) { return 'La vieille' + (v ? ', ' + v : ''); }
q20.scenes('q16_aieule_1', {
  qui: 'aieule',
  monde: 'gobeliniere',
  demande(c) {
    const V = q20Vieille(c, { lookP: -0.1 });
    if (!V) return null;
    const T = qtProps(c.w, V.G.x, V.G.z, 30, (q) => q.id === 'gob_tas').sort((a, b) => Math.hypot(a.x - V.Sg.x, a.z - V.Sg.z) - Math.hypot(b.x - V.Sg.x, b.z - V.Sg.z))[0];
    const tas = T ? [T.x, T.y, T.z] : c.haut(V.P, 0);
    return [
      c.plan({ dur: 6.2, cam: c.camChose(V.tete, { d: 2.4, haut: 1.4, dy: 0, a: V.Sg.r + 0.3, recul: 0.1 }), acteurs: [V.A], lum: V.lum, son: 'murmure', dit: c.parole('Apporte ce que tu ne regardes plus.', q20Voix('d’une voix de vieille'), 0.6), court: true }),
      c.plan({ dur: 6.2, cam: c.camChose(c.haut(tas, 0.5), { d: 3.0, haut: 1.5, dy: 0, a: V.Sg.r + 1.0 }), acteurs: [V.A], lum: V.lum, dit: c.parole('Trois choses. Un bout de ficelle, une bouteille vide, un chiffon. Ce qu’on oublie d’avoir.', q20Voix('d’une voix d’enfant'), 1.5) }),
    ];
  },
  fin(c) {
    const V = q20Vieille(c, { lookP: 0.2 });
    if (!V) return null;
    const tr = c.chose(Q20_DESSINS.trois_choses, Q20B.devant(c, V.P, V.Sg.r, 0.9, 0.2), { s: 1.3 });
    const pis = [0, 1].map((k) => c.chose(Q20_DESSINS.piece, c.haut(Q20B.devant(c, V.P, V.Sg.r, 0.55, k ? 0.06 : -0.06), 0.62), { s: 1.6 }));
    return [
      c.plan({ dur: 6, cam: c.camChose(V.tete, { d: 2.2, haut: 1.3, dy: 0, a: V.Sg.r - 0.3 }), acteurs: [V.A, tr], lum: V.lum, dit: c.parole('Tout revient.', q20Voix('d’une voix d’enfant'), 1.5), court: true }),
      c.plan({ dur: 6.2, cam: c.camChose(c.haut(V.P, 0.6), { d: 1.9, haut: 1.1, dy: 0, a: V.Sg.r + 0.6, recul: 0.12 }), acteurs: [V.A, ...pis], lum: V.lum, son: 'piece', dit: c.parole('Elle fouille l’argent du tas sans regarder, et vous tend deux pièces anciennes.', '') }),
    ];
  },
});

q20.scenes('q16_aieule_2', {
  qui: 'aieule',
  monde: { demande: 'gobeliniere', tournant: 'vallee', fin: 'gobeliniere' },
  demande(c) {
    const V = q20Vieille(c, { lookP: 0.25 });
    if (!V) return null;
    const cu = c.chose(Q20_DESSINS.cuillere, c.haut(Q20B.devant(c, V.P, V.Sg.r, 0.5, 0.05), 0.66), { s: 1.8, r: V.Sg.r });
    return [
      c.plan({ dur: 6.2, cam: c.camChose(c.haut(V.P, 0.75), { d: 2.0, haut: 1.2, dy: 0, a: V.Sg.r + 0.4, recul: 0.12 }), acteurs: [V.A, cu], lum: V.lum, dit: c.parole('Celle-ci pèse.', q20Voix('avec la voix du curé, quand il était petit'), 1.4), court: true }),
      c.plan({ dur: 6, cam: c.camChose(V.tete, { d: 2.6, haut: 1.4, dy: 0, a: V.Sg.r - 0.4 }), acteurs: [V.A, cu], lum: V.lum, son: 'murmure', dit: c.parole('Rends-la. Elle pèse sur le tas. Ne lui dis pas d’où : il le sait.', q20Voix('d’une voix de femme'), 1.1) }),
    ];
  },
  tournant(c) {
    const moi = Q20H.poste(c, 'cure', { geste: ['tend', 'raide'] });
    const cu = moi && c.chose(Q20_DESSINS.cuillere, c.haut(c.devant(moi.P, moi.cap, 0.36, 0.06, true), 1.2), { s: 1.6, r: moi.cap });
    const moi2 = Q20H.poste(c, 'cure', { geste: ['peur', 'baisse'] });
    const cierges = qtPropsDans(c.w, 'eglise', (q) => q.id === 'bougie').slice(0, 2).map((q) => c.lueur([q.x, q.y, q.z], 3.5, [1.0, 0.7, 0.35], 0.3));
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.5, d: 1.9, buste: true }), acteurs: [moi, cu], lum: cierges, dit: ['Ma cuillère de baptême ! Je l’avais perdue à sept ans, le jour où…', '@cure'] }),
      c.plan({ dur: 6, cam: c.camActeur(moi2, { cote: -0.3, d: 2.2 }), acteurs: [moi2], lum: cierges, dit: ['Où l’avez-vous… Non. Ne me dites pas. Ne me dites rien.', '@cure'] }),
    ];
  },
  fin(c) {
    const V = q20Vieille(c, { lookP: 0.1 });
    if (!V) return null;
    const pp = c.chose(Q20_DESSINS.pierre_percee, c.haut(Q20B.devant(c, V.P, V.Sg.r, 0.5, 0.05), 0.66), { s: 1.6 });
    return [
      c.plan({ dur: 6, cam: c.camChose(V.tete, { d: 2.3, haut: 1.3, dy: 0, a: V.Sg.r + 0.2 }), acteurs: [V.A], lum: V.lum, dit: c.parole('Rendue. Une de moins sur le tas.', q20Voix('d’une voix de femme'), 1.1), court: true }),
      c.plan({ dur: 6.2, cam: c.camChose(c.haut(V.P, 0.7), { d: 1.8, haut: 1.1, dy: 0, a: V.Sg.r + 0.7, recul: 0.12 }), acteurs: [V.A, pp], lum: V.lum, dit: c.parole('Une pierre percée. Pour regarder à travers. Ce qu’on ne voit plus.', q20Voix(''), 0.6) }),
    ];
  },
});

// ============================================================================ HAUTGUET : THIBAUD (au treuil du pont-levis) ; LA DAME (derrière la porte de sa tour)
function q20Hautguet() { return typeof chateauV4 !== 'undefined' && chateauV4.Z ? chateauV4.Z : null; }
q20.scenes('q16_thibaud_1', {
  qui: 'thibaud',
  monde: 'hautguet',
  demande(c) {
    const V = q20Hautguet(), T = V && V.thibaud;
    if (!T) return null;
    c.masquer('thibaud');
    const nom = Q20B.nom('thibaud');
    const P = [T.x, T.y + 0.04, T.z];
    const moi = c.gens('thibaud', P, { cap: T.r, geste: ['assis', 'penche', { lookP: 0.35 }] });
    const br = Q20H.pres(c, P, 'brasero', 6), tr = Q20H.pres(c, P, 'v4_treuil', 10);
    const lum = br ? [c.lueur(br.P, 4.5, [1.0, 0.55, 0.25], 0.8)] : [];
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.5, d: 2.4 }), acteurs: [moi], lum, dit: c.parole('Ma couverture est mangée. Les mites, ou autre chose. Il fait froid, au treuil.', nom, 0.7), court: true }),
      c.plan({ dur: 6, cam: tr ? c.camChose(c.haut(tr.P, 0.9), { d: 2.8, haut: 1.5, dy: 0, a: (tr.r || 0) + 0.6 }) : c.camActeur(moi, { cote: -0.6, d: 3 }), acteurs: [moi], lum, dit: c.parole('Il fait froid depuis cette nuit-là. Apportez-moi de la laine, si vous redescendez.', nom, 0.7) }),
    ];
  },
  fin(c) {
    const V = q20Hautguet(), T = V && V.thibaud;
    if (!T) return null;
    c.masquer('thibaud');
    const nom = Q20B.nom('thibaud');
    const P = [T.x, T.y + 0.04, T.z];
    const bc = Q20H.pres(c, P, 'banc', 6);
    const moi = c.gens('thibaud', P, { cap: bc ? c.cap(P, bc.P) : T.r, geste: ['assis', 'penche', { reach: 0.35 }] });
    const co = bc && c.chose(Q20_DESSINS.couverture, c.haut(bc.P, 0.45), { r: bc.r || 0 });
    const moi2 = c.gens('thibaud', P, { cap: T.r, geste: ['assis', 'offre'] });
    const hu = c.chose(Q20_DESSINS.huile, c.haut(c.devant(P, T.r, 0.4, 0.08, true), 0.72), { s: 1.3 });
    const br = Q20H.pres(c, P, 'brasero', 6), lum = br ? [c.lueur(br.P, 4.5, [1.0, 0.55, 0.25], 0.8)] : [];
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.6, d: 2.4, avec: bc ? bc.P : undefined, k: 0.15 }), acteurs: [moi, co], lum, dit: c.parole('Il ne la met pas sur ses épaules. « Pour quand ils monteront. Il fera froid, sur le pont. »', ''), court: true }),
      c.plan({ dur: 5.8, cam: c.camActeur(moi2, { cote: 0.3, d: 2.2, buste: true }), acteurs: [moi2, hu, co], lum, dit: c.parole('Pour le Guet. Il en faut trois.', nom, 0.7) }),
    ];
  },
});

function q20Porte(c) {
  const V = q20Hautguet(), Pt = V && V.pts && V.pts.tour_dame;
  if (!Pt) return null;
  const ad = Pt.yaw + Math.PI, P = c.pt(Pt.x, Pt.z, Pt.y), porte = [Pt.x - Math.sin(ad) * 2.4, Pt.y, Pt.z - Math.cos(ad) * 2.4];
  return { V, Pt, ad, P, porte, haut: V.dame ? [V.dame.x, V.dame.y + 1.4, V.dame.z] : c.haut(porte, 24) };
}
q20.scenes('q16_dame_1', {
  qui: 'dame',
  monde: 'hautguet',
  demande(c) {
    const D = q20Porte(c);
    if (!D) return null;
    const nom = typeof Q16_PNJ !== 'undefined' ? q16.cap(Q16_PNJ.dame.nom) : 'Dame Ysolde';
    const J = c.joueur(D.P, { face: D.porte, geste: 'leve' });
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(J, { cote: 2.4, d: 3.6, avec: c.haut(D.porte, 1.2), k: 0.5 }), heure: c.heure('nuit'), acteurs: [J], son: 'murmure', dit: c.parole('Aude voulait voir la foire. Rapporte-moi quelque chose qui sente la foire.', nom, 1.2), court: true }),
      c.plan({ dur: 6, cam: c.camRegard(Q20B.devant(c, D.P, D.ad, 3, 0.8), D.haut, { haut: 1.5, recul: 0.04 }), heure: c.heure('nuit'), acteurs: [J], dit: c.parole('Des fleurs nouées. Glisse-les sous la porte. Je ne dors pas. Je ne dors plus.', nom, 1.2) }),
    ];
  },
  fin(c) {
    const D = q20Porte(c);
    if (!D) return null;
    const nom = typeof Q16_PNJ !== 'undefined' ? q16.cap(Q16_PNJ.dame.nom) : 'Dame Ysolde';
    const seuil = Q20B.devant(c, D.porte, D.ad, 0.3, 0.1), dedans = Q20B.devant(c, D.porte, D.ad, -0.3, 0.1);
    const bq = c.chose(Q20_DESSINS.bouquet, seuil, { r: D.ad, vers: dedans, t0: 1.6, t1: 3.8, s: 1.2 });
    const bj = c.chose(Q20_DESSINS.bijou, dedans, { vers: Q20B.devant(c, D.porte, D.ad, 0.7, -0.1), t0: 2.4, t1: 4.6, s: 1.6 });
    const J = c.joueur(Q20B.devant(c, D.porte, D.ad, 1.3, 0), { face: D.porte, geste: ['penche', { reach: 0.3 }] });
    return [
      c.plan({ dur: 6.4, cam: c.camChose(seuil, { d: 1.7, haut: 0.95, dy: 0.05, a: D.ad + 0.6 }), heure: c.heure('nuit'), acteurs: [bq, J], dit: c.parole('Elle sent la foire.', nom, 1.2), court: true }),
      c.plan({ dur: 6, cam: c.camChose(seuil, { d: 1.9, haut: 0.95, dy: 0.05, a: D.ad - 0.5 }), heure: c.heure('nuit'), acteurs: [bj, J], son: 'piece', dit: c.parole('Un long silence. Sous la porte, quelque chose glisse vers vous.', '') }),
    ];
  },
});

// ============================================================================ LA VEILLEUSE DE LA CITÉ (au Seuil)
function q20Cite(c) {
  if (typeof vgCite === 'undefined') return null;
  const f = vgCite.f(), [x, z] = vgCite.at(-6, -12), [bx, bz] = vgCite.at(44, 117);
  return { f, P: [x, f.y, z], berceaux: [bx, f.y + 12, bz] };
}
q20.scenes('q16_veilleuse_1', {
  qui: 'veilleuse',
  monde: 'vaisseau',
  demande(c) {
    const C = q20Cite(c);
    if (!C) return null;
    const nom = Q20B.nom('veilleuse');
    const lum = [c.lueur(C.P, 5, [0.3, 0.5, 0.95], 1.4)];
    return [
      c.plan({ dur: 6.4, cam: c.camChose(c.haut(C.P, 1.0), { d: 2.6, haut: 1.6, dy: 0, a: 0.6, recul: 0.1 }), acteurs: [], lum, dit: c.parole('Iorin avait un cahier. L’enfant. Je ne peux pas le lire : je n’ai pas d’yeux pour le papier.', nom, 1.3), court: true }),
      c.plan({ dur: 6, cam: c.camLieu(C.berceaux, { d: 9, haut: 1.6, dy: 0.2, recul: 0.12 }), acteurs: [], lum: [c.lueur(C.berceaux, 7, [0.3, 0.42, 0.7], 0.6)], dit: c.parole('Il était dans les Berceaux. Ou ailleurs. Les enfants ne rangent pas. Lis-le-moi.', nom, 1.3) }),
    ];
  },
  fin(c) {
    const C = q20Cite(c);
    if (!C) return null;
    const nom = Q20B.nom('veilleuse');
    const J = c.joueur(Q20B.devant(c, C.P, 0.6, 1.5, 0.2), { face: C.P, geste: ['penche', { reach: 0.32, lookP: 0.4 }], main: 'livre' });
    const L0 = c.lueur(C.P, 5, [0.3, 0.5, 0.95], 1.4), L1 = Object.assign({}, L0);
    const gr = c.chose(Q20_DESSINS.graine, c.haut(Q20B.devant(c, C.P, 0.6, 0.6, 0), 1.0), { s: 1.6 });
    return [
      c.plan({ dur: 6.6, cam: c.camActeur(J, { cote: 1.6, d: 2.8, avec: c.haut(C.P, 1.0), k: 0.5 }), acteurs: [J], lum: [L0], chaque: (t) => { const k = 0.55 + 0.45 * Math.cos(Math.min(t, 6) * 1.05); L0.r = 5 * k + 0.5; }, dit: c.parole('Vous lisez à voix haute. La lumière baisse, puis remonte.', ''), court: true }),
      c.plan({ dur: 6, cam: c.camChose(c.haut(C.P, 1.0), { d: 2.4, haut: 1.5, dy: 0, a: 0.9 }), acteurs: [J, gr], lum: [L1], dit: c.parole('Il écrivait mal. Il écrivait tout. Garde son cahier. Prends ceci : il l’avait gardé pour la vallée.', nom, 1.3) }),
    ];
  },
});

// ============================================================================ CEUX DU DESSOUS (le Hameau d'En-Bas)
const Q20BD = {
  V(c) { return c.w.soutVillage || null; },
  // celui qui porte ce nombre, à sa place ; o : options de l'acteur (geste…) ; sinon null
  gens(c, k, o) {
    if (typeof soutTerres === 'undefined') return null;
    const e = (soutTerres.list || []).find((q) => q.k === k && !q.mort);
    if (!e) return null;
    c.masquer('sout:' + k);
    let P = [e.x, e.y, e.z], cap = e.heading || 0;
    try { const p = soutTerres.poste(e); if (p) { P = [p[0], souterrain.floorAt(p[0], p[1]), p[1]]; cap = p[2]; } } catch (er) { /* sa place de l'instant */ }
    const look = Object.assign({}, e.g.look);
    const A = c.gens(look, P, Object.assign({ cap }, o));
    if (A) A.s = look.height || 1;
    return { e, P, cap, A, H: e.hutte, nom: Q20B.nom('sout:' + k), voix: e.g.voix || 1 };
  },
  // une cabane (son seuil, son dedans), la pierre au pain, la rive
  hutte(c, H) { if (!H) return null; const P = c.ptSous(H.porte[0], H.porte[1]), D = c.ptSous(H.dedans[0], H.dedans[1]); return { P, D, cap: H.r }; },
  place(c) { const V = Q20BD.V(c); return V ? [V.c[0], V.c[1], V.c[2]] : null; },
  vide(c) { const V = Q20BD.V(c); return V && V.huttes.length ? V.huttes[V.huttes.length - 1] : null; },
  // la voûte au-dessus d'un point (pour « d'sû », le haut)
  voute(c, P) { return [P[0], Math.min(souterrain.vaultAt(P[0], P[2]) - 0.6, P[1] + 14), P[2]]; },
  lum(c, P) { return P ? [Q20B.froide(c, P, 5, 0.6)] : []; },
};
// une quête d'en bas : la demande et la fin chez celui qui la donne ; m : { demande, tournant, fin } du monde, si autre
function q20Sout(id, k, def) { q20.scenes(id, Object.assign({ qui: 'sout:' + k, monde: 'dessous' }, def)); }

q20Sout('q16_sout_un_1', 'un', {
  demande(c) {
    const U = Q20BD.gens(c, 'un', { geste: ['assis', 'montre'] });
    if (!U) return null;
    const H = Q20BD.hutte(c, Q20BD.vide(c));
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(U.A, { cote: 0.4, d: 2.2 }), acteurs: [U.A], lum: Q20BD.lum(c, U.P), dit: c.parole('Lum… nenn. Lui.', U.nom, U.voix), court: true }),
      H && c.plan({ dur: 6, cam: c.camLieu(H.P, { d: 7, haut: 1.6, dy: 1.0, a: H.cap + 0.4 }), acteurs: [], dit: c.parole('Lui.', U.nom, U.voix) }),
    ];
  },
  fin(c) {
    const U = Q20BD.gens(c, 'un', { geste: ['hoche'] });
    if (!U) return null;
    const H = Q20BD.hutte(c, Q20BD.vide(c));
    const pi = H && c.chose(Q20_DESSINS.luisante, H.P, { s: 1.3 });
    const pe = c.chose(Q20_DESSINS.perle, c.haut(c.devant(U.P, U.cap, 0.35, 0.05, true), 0.62), { s: 2 });
    return [
      H && c.plan({ dur: 6.4, cam: c.camLieu(H.P, { d: 5.5, haut: 1.3, dy: 0.6, a: H.cap + 0.3, recul: 0.15 }), acteurs: [pi], lum: [Q20B.froide(c, H.D, 3.5, 0.6), Q20B.froide(c, H.P, 2.5, 0.2)], dit: c.parole('Onz. Bô.', U.nom, U.voix), court: true }),
      c.plan({ dur: 5.6, cam: c.camActeur(U.A, { cote: 0.2, d: 2.0, buste: true }), acteurs: [U.A, pe], lum: Q20BD.lum(c, U.P), dit: c.parole('Il vous donne une perle des cavernes.', '') }),
    ];
  },
});

q20Sout('q16_sout_un_2', 'un', {
  monde: { demande: 'dessous', tournant: 'cave', fin: 'dessous' },
  demande(c) {
    const U = Q20BD.gens(c, 'un', { geste: ['montre', 'leve'] });
    if (!U) return null;
    const U2 = Q20BD.gens(c, 'un', { geste: [{ reach: 0.55 }, 'raide'] });
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(U.A, { cote: 0.6, d: 2.4 }), acteurs: [U.A], lum: Q20BD.lum(c, U.P), dit: c.parole('Mûr. Onz.', U.nom, U.voix), court: true }),
      c.plan({ dur: 6, cam: c.camActeur(U2.A, { cote: -0.5, d: 2.2 }), acteurs: [U2.A], lum: Q20BD.lum(c, U2.P), son: 'coups', dit: c.parole('Va.', U.nom, U.voix) }),
    ];
  },
  tournant(c) {
    const L = c.lieu('sout_cave'), w = c.w;
    if (!L) return null;
    // (les traits, à la paroi de la cave : là où on les lit)
    const I = (w.inter || []).find((i) => i.id === 'sout_traits');
    const y0 = (L.L && L.L.y) ?? L.y, C = [L.x, y0, L.z];
    const T = I ? [I.x, y0, I.z] : C;
    // (la paroi des traits regarde le milieu de la cave ; on la voit de face)
    const face = c.cap(T, C), sol = Q20B.devant(c, T, face, 0.25, 0);
    sol[1] = y0;
    const enc = c.chose(Q20_DESSINS.onze, [T[0] + Math.sin(face) * 0.12, y0 + 1.05, T[2] + Math.cos(face) * 0.12], { r: face, s: 1 });
    const J = c.joueur(Q20B.libre(c, Q20B.devant(c, T, face, 1.6, 0.3), 0, 2, 0.4), { face: T, lanterne: true, geste: 'leve' });
    return [
      c.plan({ dur: 6.4, cam: c.camChose(c.haut(sol, 1.0), { d: 1.6, haut: 1.4, dy: 0, a: face + 0.35, recul: 0.1 }), acteurs: [enc, Object.assign({}, J, { vu: false })], lum: [Q20B.flamme(c, sol, 4, 1.2)], son: 'goutte' }),
      c.plan({ dur: 5.4, cam: c.camActeur(J, { cote: 1.2, d: 2.4, buste: true }), acteurs: [J, enc], lum: [Q20B.flamme(c, sol, 4, 1.2)] }),
    ];
  },
  fin(c) {
    const U = Q20BD.gens(c, 'un', { geste: ['assis', 'penche', { lookP: 0.4 }] });
    if (!U) return null;
    const lu = [0, 1].map((k) => c.chose(Q20_DESSINS.luisante, c.devant(U.P, U.cap, 0.6, k ? 0.12 : -0.12, true), { s: 1.1 }));
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(U.A, { cote: 0.5, d: 2.0 }), acteurs: [U.A], lum: Q20BD.lum(c, U.P), dit: c.parole('Il écoute vos mains, longtemps. « Onz. Tojor onz. »', ''), court: true }),
      c.plan({ dur: 5.6, cam: c.camChose(c.devant(U.P, U.cap, 0.6, 0, true), { d: 1.5, haut: 0.95, dy: 0.05, a: U.cap + 0.6 }), acteurs: [U.A, ...lu], lum: Q20BD.lum(c, U.P), dit: c.parole('Tojor.', U.nom, U.voix) }),
    ];
  },
});

q20Sout('q16_sout_deu_1', 'deu', {
  demande(c) {
    const D = Q20BD.gens(c, 'deu', { geste: [{ reach: 0.3, lookP: 0.2 }, 'parle'] });
    if (!D) return null;
    const mm = c.chose(Q20_DESSINS.marmite, Q20B.devant(c, D.P, D.cap + 0.8, 0.8, 0), { s: 1.0 });
    return [
      c.plan({ dur: 6, cam: c.camActeur(D.A, { cote: 0.4, d: 2.2 }), acteurs: [D.A, mm], lum: Q20BD.lum(c, D.P), dit: c.parole('Manj ?', D.nom, D.voix), court: true }),
      c.plan({ dur: 6, cam: c.camChose(c.haut(mm.P, 0.2), { d: 1.5, haut: 0.95, dy: 0, a: D.cap + 1.6 }), acteurs: [D.A, mm], lum: Q20BD.lum(c, mm.P), dit: c.parole('Chô ?', D.nom, D.voix) }),
    ];
  },
  fin(c) {
    const D = Q20BD.gens(c, 'deu', { geste: ['tend', { lookP: 0.35 }] });
    if (!D) return null;
    const bo = c.chose(Q20_DESSINS.bol, c.haut(c.devant(D.P, D.cap, 0.3, 0.02, true), 1.25), { s: 1.2 });
    const D2 = Q20BD.gens(c, 'deu', { geste: ['offre'] });
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(D.A, { cote: 0.5, d: 1.9, buste: true }), acteurs: [D.A, bo], lum: Q20BD.lum(c, D.P), chaque: Q20H.emet(c.haut(bo.P, 0.1), { n: 3, col: [0.9, 0.9, 0.9, 0.3], taille: 0.05, vie: 1.6, v: 0.04, vy: 0.25 }), dit: c.parole('Elle boit à petites gorgées, les yeux fermés. « Chô… »', ''), court: true }),
      c.plan({ dur: 5.6, cam: c.camActeur(D2.A, { cote: -0.3, d: 2.2 }), acteurs: [D2.A], lum: Q20BD.lum(c, D2.P), dit: c.parole('Bô.', D.nom, D.voix) }),
    ];
  },
});

q20Sout('q16_sout_tre_1', 'tre', {
  demande(c) {
    const T = Q20BD.gens(c, 'tre', { geste: (t) => ({ reach: 0.35 + 0.15 * Math.sin(t * 4) }) });
    if (!T) return null;
    const pl = Q20BD.place(c);
    return [
      c.plan({ dur: 6, cam: c.camActeur(T.A, { cote: 0.5, d: 2.2, buste: true }), acteurs: [T.A], lum: Q20BD.lum(c, T.P), dit: c.parole('Sèl. Trè sèl.', T.nom, T.voix), court: true }),
      pl && c.plan({ dur: 6, cam: c.camChose(pl, { d: 2.4, haut: 1.2, dy: 0.5 }), acteurs: [T.A], lum: Q20BD.lum(c, pl), dit: c.parole('Sèl ?', T.nom, T.voix) }),
    ];
  },
  fin(c) {
    const T = Q20BD.gens(c, 'tre', { geste: ['tend', { lookP: 0.3 }] });
    if (!T) return null;
    const se = c.chose(Q20_DESSINS.sel, c.haut(c.devant(T.P, T.cap, 0.32, 0.05, true), 1.18), { s: 1.4 });
    const lu = c.chose(Q20_DESSINS.luisante, c.haut(c.devant(T.P, T.cap, 0.36, 0.05, true), 1.1), { s: 1 });
    const T2 = Q20BD.gens(c, 'tre', { geste: ['offre'] });
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(T.A, { cote: 0.4, d: 1.8, buste: true }), acteurs: [T.A, se], lum: Q20BD.lum(c, T.P), dit: c.parole('Sèl !', T.nom, T.voix), court: true }),
      c.plan({ dur: 5.8, cam: c.camActeur(T2.A, { cote: -0.4, d: 2.0, buste: true }), acteurs: [T2.A, lu], lum: Q20BD.lum(c, T2.P).concat([Q20B.froide(c, lu.P, 1.4, 0.05)]), dit: c.parole('Elle vous donne une pierre qui luit.', '') }),
    ];
  },
});

q20Sout('q16_sout_katr_1', 'katr', {
  demande(c) {
    const K = Q20BD.gens(c, 'katr', { geste: ['peche'] });
    if (!K) return null;
    const K2 = Q20BD.gens(c, 'katr', { geste: [{ reach: 0.5 }, 'parle'] });
    const eau = c.devant(K.P, K.cap, 6, 0, true);
    eau[1] = SOUT_WL;
    return [
      c.plan({ dur: 6, cam: c.camActeur(K.A, { cote: 0.9, d: 2.4 }), acteurs: [K.A], lum: Q20BD.lum(c, K.P), son: 'eau', dit: c.parole('Gout… tsi.', K.nom, K.voix), court: true }),
      c.plan({ dur: 6.2, cam: c.camRegard(K.P, eau, { haut: 1.4, recul: 0.04 }), acteurs: [K2.A], lum: Q20BD.lum(c, K.P), dit: c.parole('Kord ?', K.nom, K.voix) }),
    ];
  },
  fin(c) {
    const K = Q20BD.gens(c, 'katr', { geste: ['travaille', { lookP: 0.4 }] });
    if (!K) return null;
    const ha = c.chose(Q20_DESSINS.hamecon, c.haut(c.devant(K.P, K.cap, 0.3, 0.04, true), 1.1), { s: 1.4, r: K.cap });
    const K2 = Q20BD.gens(c, 'katr', { geste: ['peche'] });
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(K.A, { cote: 0.5, d: 1.8, buste: true }), acteurs: [K.A, ha], lum: Q20BD.lum(c, K.P), dit: c.parole('Il plie un clou en hameçon entre ses dents, et noue la corde.', ''), court: true }),
      c.plan({ dur: 5.8, cam: c.camActeur(K2.A, { cote: 1.2, d: 2.6 }), acteurs: [K2.A], lum: Q20BD.lum(c, K2.P), son: 'eau', dit: c.parole('Gout bô.', K.nom, K.voix) }),
    ];
  },
});

q20Sout('q16_sout_sin_1', 'sin', {
  demande(c) {
    const S = Q20BD.gens(c, 'sin', { geste: ['assis', 'montre'] });
    if (!S) return null;
    const H = Q20BD.hutte(c, S.H);
    const nP = H ? Q20B.devant(c, S.P, S.cap + 2.4, 1.1, 0) : null;
    const N = nP && Q20BD.gens(c, 'neu', {});
    const enf = N && c.gens(Object.assign({}, N.e.g.look), nP, { cap: S.cap + 1.2, geste: ['assis', 'peur'], s: N.e.g.look.height || 0.66 });
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(S.A, { cote: 0.6, d: 2.4 }), acteurs: [S.A, enf], lum: Q20BD.lum(c, S.P), dit: c.parole('Neu… dôr.', S.nom, S.voix), court: true }),
      enf && c.plan({ dur: 6, cam: c.camActeur(enf, { cote: 0.5, d: 1.8 }), acteurs: [S.A, enf], lum: Q20BD.lum(c, nP), dit: c.parole('Frè.', S.nom, S.voix) }),
    ];
  },
  fin(c) {
    const S = Q20BD.gens(c, 'sin', { geste: ['penche', { reach: 0.4, lookP: 0.5 }] });
    if (!S) return null;
    const nP = Q20B.devant(c, S.P, S.cap, 0.9, 0);
    const N = Q20BD.gens(c, 'neu', {});
    const la = c.chose(Q20_DESSINS.couverture, nP, { r: S.cap + Math.PI / 2, s: 1.4 });
    const enf = N && c.gens(Object.assign({}, N.e.g.look), c.haut(nP, 0.12), { cap: S.cap + Math.PI, geste: ['assis', { lookP: 0.4 }], s: N.e.g.look.height || 0.66, vu: false });
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(S.A, { cote: 0.9, d: 2.2, avec: nP, k: 0.4 }), acteurs: [S.A, la, enf], lum: Q20BD.lum(c, S.P), dit: c.parole('Elle étale la laine sous l’enfant, la lisse longtemps. « Neu dôr. »', ''), court: true }),
      c.plan({ dur: 5.6, cam: c.camChose(nP, { d: 1.6, haut: 0.95, dy: 0.2, a: S.cap + 0.8 }), acteurs: [la, enf], lum: Q20BD.lum(c, nP), son: 'murmure', dit: c.parole('Dôr.', S.nom, S.voix) }),
    ];
  },
});

q20Sout('q16_sout_si_1', 'si', {
  demande(c) {
    const S = Q20BD.gens(c, 'si', { geste: ['tend'] });
    if (!S) return null;
    const pa = c.chose(Q20_DESSINS.paquet, c.haut(c.devant(S.P, S.cap, 0.34, 0.04, true), 1.15), { s: 1.3, r: S.cap });
    const U = Q20BD.gens(c, 'ui', {});
    const H = U && Q20BD.hutte(c, U.H);
    return [
      c.plan({ dur: 6, cam: c.camActeur(S.A, { cote: 0.5, d: 2.2, buste: true }), acteurs: [S.A, pa], lum: Q20BD.lum(c, S.P), dit: c.parole('Va. Ui.', S.nom, S.voix), court: true }),
      H && c.plan({ dur: 6, cam: c.camLieu(H.P, { d: 9, haut: 1.8, dy: 1.0, a: H.cap + 0.5 }), acteurs: [], lum: Q20BD.lum(c, H.P), dit: c.parole('Va, va.', S.nom, S.voix) }),
    ];
  },
  tournant(c) {
    const U = Q20BD.gens(c, 'ui', { geste: ['baisse', { reach: 0.3 }] });
    if (!U) return null;
    const ec = c.chose(Q20_DESSINS.echeveau, c.haut(c.devant(U.P, U.cap, 0.4, 0.04, true), 0.62), { s: 1.4, r: U.cap });
    const U2 = Q20BD.gens(c, 'ui', { geste: ['raide'] });
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(U.A, { cote: 0.6, d: 1.9, buste: true }), acteurs: [U.A, ec], lum: Q20BD.lum(c, U.P), dit: c.parole('Des cheveux blancs, longs, roulés en écheveau.', '') }),
      c.plan({ dur: 5.6, cam: c.camActeur(U2.A, { cote: 0.1, d: 1.8 }), acteurs: [U2.A, ec], lum: Q20BD.lum(c, U2.P), dit: c.parole('Frè.', U.nom, U.voix) }),
    ];
  },
  fin(c) {
    const S = Q20BD.gens(c, 'si', { geste: ['hoche'] });
    if (!S) return null;
    const S2 = Q20BD.gens(c, 'si', { geste: ['offre'] });
    return [
      c.plan({ dur: 6, cam: c.camActeur(S.A, { cote: 0.4, d: 2.2 }), acteurs: [S.A], lum: Q20BD.lum(c, S.P), dit: c.parole('Va. Bô.', S.nom, S.voix), court: true }),
      c.plan({ dur: 5.8, cam: c.camActeur(S2.A, { cote: -0.5, d: 2.0, buste: true }), acteurs: [S2.A], lum: Q20BD.lum(c, S2.P), dit: c.parole('Il vous donne des pieds-de-pierre grillés.', '') }),
    ];
  },
});

q20Sout('q16_sout_se_1', 'se', {
  monde: { demande: 'dessous', tournant: 'vallee', fin: 'dessous' },
  delais: { tournant: 1.5 },
  demande(c) {
    const S = Q20BD.gens(c, 'se', { geste: ['montre', 'leve'] });
    if (!S) return null;
    const V = Q20BD.V(c), ap = V && V.appel ? [V.appel[0], V.appel[1], V.appel[2]] : S.P;
    const S2 = Q20BD.gens(c, 'se', { geste: [{ reach: 0.5 }, 'penche'] });
    return [
      c.plan({ dur: 6, cam: c.camActeur(S.A, { cote: 0.5, d: 2.4 }), acteurs: [S.A], lum: Q20BD.lum(c, S.P), dit: c.parole('Hoûm. D’sû.', S.nom, S.voix), court: true }),
      c.plan({ dur: 6, cam: c.camChose(c.haut(ap, 0.8), { d: 2.0, haut: 1.3, dy: 0, a: (V && V.appel ? V.appel[3] : 0) + 0.4 }), acteurs: [S2.A], lum: Q20BD.lum(c, ap), son: 'coups', dit: c.parole('Hoûm.', S.nom, S.voix) }),
    ];
  },
  tournant(c) {
    const Pu = c.lieu('vieux_puits');
    if (!Pu) return null;
    const bord = c.devant(Pu.P, 2.4, 1.3);
    return [
      c.plan({ dur: 6.4, cam: Q20H.puits(c, Pu, { a: 2.4, fond: -3 }), heure: c.heure('nuit'), son: 'coups', acteurs: [] }),
      c.plan({ dur: 5.4, cam: c.camLieu(Pu, { d: 6.5, haut: 1.6, dy: 0.8, a: 2.4 + Math.PI }), heure: c.heure('nuit'), acteurs: [c.joueur(bord, { face: Pu.P, tient: 'lanterne', geste: 'penche' })], son: 'coups' }),
    ];
  },
  fin(c) {
    const S = Q20BD.gens(c, 'se', { geste: ['hoche', { lookP: -0.1 }] });
    if (!S) return null;
    S.A.regard = 'camera';
    const lu = c.chose(Q20_DESSINS.luisante, c.haut(c.devant(S.P, S.cap, 0.36, 0.05, true), 1.1), { s: 1 });
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(S.A, { cote: 0.15, d: 2.0 }), acteurs: [S.A], lum: Q20BD.lum(c, S.P), son: 'coups', dit: c.parole('Il sourit, pour la première fois. « Onz. Bô. »', ''), court: true }),
      c.plan({ dur: 5.4, cam: c.camChose(lu.P, { d: 1.4, haut: 1.2, dy: 0, a: S.cap + 0.7 }), acteurs: [S.A, lu], lum: [Q20B.froide(c, lu.P, 1.6, 0.05)].concat(Q20BD.lum(c, S.P)), dit: c.parole('Bô.', S.nom, S.voix) }),
    ];
  },
});

q20Sout('q16_sout_ui_1', 'ui', {
  demande(c) {
    const U = Q20BD.gens(c, 'ui', { geste: ['assis', 'tend'] });
    if (!U) return null;
    const fu = c.chose(Q20_DESSINS.fuseau, Q20B.devant(c, U.P, U.cap, 0.6, 0.2), { s: 1.4 });
    return [
      c.plan({ dur: 6, cam: c.camActeur(U.A, { cote: 0.5, d: 2.0, buste: true }), acteurs: [U.A, fu], lum: Q20BD.lum(c, U.P), dit: c.parole('Fil ?', U.nom, U.voix), court: true }),
      c.plan({ dur: 6, cam: c.camChose(c.haut(fu.P, 0.15), { d: 1.4, haut: 0.95, dy: 0, a: U.cap + 1.2 }), acteurs: [U.A, fu], lum: Q20BD.lum(c, fu.P), dit: c.parole('Le fuseau tourne à vide.', '') }),
    ];
  },
  fin(c) {
    const U = Q20BD.gens(c, 'ui', { geste: ['assis', 'travaille', { lookP: 0.3 }] });
    if (!U) return null;
    const U2 = Q20BD.gens(c, 'ui', { geste: ['assis', 'offre'] });
    const pe = c.chose(Q20_DESSINS.perle, c.haut(c.devant(U2.P, U2.cap, 0.35, 0.05, true), 0.55), { s: 2 });
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(U.A, { cote: 0.7, d: 1.9, buste: true }), acteurs: [U.A], lum: Q20BD.lum(c, U.P), dit: c.parole('Elle roule le fil entre ses doigts, le sent. « D’sû. Bô. »', ''), court: true }),
      c.plan({ dur: 5.6, cam: c.camActeur(U2.A, { cote: -0.3, d: 1.9 }), acteurs: [U2.A, pe], lum: Q20BD.lum(c, U2.P), dit: c.parole('Bô.', U.nom, U.voix) }),
    ];
  },
});

q20Sout('q16_sout_neu_1', 'neu', {
  demande(c) {
    const N = Q20BD.gens(c, 'neu', { geste: [{ reach: 0.35, lookP: -0.45 }] });
    if (!N) return null;
    return [
      c.plan({ dur: 6, cam: c.camActeur(N.A, { cote: 0.4, d: 1.8, haut: 1.0 }), acteurs: [N.A], lum: Q20BD.lum(c, N.P), dit: c.parole('D’sû ?', N.nom, N.voix), court: true }),
      c.plan({ dur: 6, cam: c.camRegard(Q20B.devant(c, N.P, N.cap, -1.2, 0.3), Q20BD.voute(c, N.P), { haut: 1.2, recul: 0.03 }), acteurs: [N.A], lum: Q20BD.lum(c, N.P), dit: c.parole('D’sû ? D’sû ?', N.nom, N.voix) }),
    ];
  },
  fin(c) {
    const N = Q20BD.gens(c, 'neu', { geste: [{ reach: 0.15, lookP: 0.4 }] });
    if (!N) return null;
    const fl = c.chose(Q20_DESSINS.bouquet, c.haut(c.devant(N.P, N.cap, 0.22, 0, true), 0.82), { s: 0.7, r: N.cap });
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(N.A, { cote: 0.5, d: 1.6, haut: 1.0, buste: true }), acteurs: [N.A, fl], lum: Q20BD.lum(c, N.P), dit: c.parole('Il sent la fleur longtemps. Il ne sait pas ce que c’est. Il la cache sous sa chemise.', ''), court: true }),
      c.plan({ dur: 5.6, cam: c.camActeur(N.A, { cote: -0.2, d: 1.5, haut: 0.9 }), acteurs: [N.A], lum: Q20BD.lum(c, N.P), dit: c.parole('Lum…', N.nom, N.voix) }),
    ];
  },
});

q20Sout('q16_sout_di_1', 'di', {
  delais: { tournant: 1.5 },
  demande(c) {
    const D = Q20BD.gens(c, 'di', { geste: ['montre'] });
    if (!D) return null;
    const lg = typeof SOUT_PLAN !== 'undefined' && SOUT_PLAN.galeries.find((g) => g[0] === 'longue');
    const loin = lg ? lg[1][Math.max(0, lg[1].length - 4)] : null;
    const Lp = loin ? c.ptSous(loin[0], loin[1]) : null;
    const pv = c.chose(Q20_DESSINS.luisante, c.haut(c.devant(D.P, D.cap, 0.3, 0.12, true), 1.05), { s: 0.9 });
    // (puis tourné vers la longue galerie, qui descend dans le noir)
    const D2 = Lp && Q20BD.gens(c, 'di', { face: Lp, geste: ['montre', { lookP: 0.1 }] });
    return [
      c.plan({ dur: 6, cam: c.camActeur(D.A, { cote: 0.5, d: 2.2, buste: true }), acteurs: [D.A, pv], lum: Q20BD.lum(c, D.P).concat([Q20B.froide(c, pv.P, 1.4, 0.05)]), dit: c.parole('Va. D’sou.', D.nom, D.voix), court: true }),
      D2 && c.plan({ dur: 6, cam: c.camActeur(D2.A, { cote: 1.3, d: 2.6 }), acteurs: [D2.A], lum: Q20BD.lum(c, D2.P), dit: c.parole('Mo dôr. Va.', D.nom, D.voix) }),
    ];
  },
  tournant(c) {
    const L = c.lieu('sout_dormeurs');
    if (!L) return null;
    const P = Q20B.libre(c, [L.x, souterrain.floorAt(L.x, L.z), L.z], 0, 8, 0.6);
    const ro = c.chose(Q20_DESSINS.rond, P, { s: 1.2 });
    const J = c.joueur(Q20B.libre(c, Q20B.devant(c, P, 0.5, 1.8), 0, 3, 0.4), { face: P, geste: 'baisse' });
    return [
      c.plan({ dur: 6.4, cam: c.camChose(c.haut(P, 0.2), { d: 2.0, haut: 1.3, dy: 0, a: 0.9, recul: 0.12 }), acteurs: [ro, Object.assign({}, J, { vu: false })], lum: [Q20B.froide(c, P, 3.5, 0.4)], son: 'goutte' }),
      c.plan({ dur: 5.4, cam: c.camActeur(J, { cote: 1.0, d: 2.6, avec: P, k: 0.4 }), acteurs: [J, ro], lum: [Q20B.froide(c, P, 3.5, 0.4)], son: 'goutte' }),
    ];
  },
  fin(c) {
    const D = Q20BD.gens(c, 'di', { geste: ['hoche', { lookP: -0.1 }] });
    if (!D) return null;
    D.A.regard = 'camera';
    const lu = c.chose(Q20_DESSINS.luisante, c.haut(c.devant(D.P, D.cap, 0.36, 0.05, true), 1.1), { s: 1 });
    const D2 = Q20BD.gens(c, 'di', { geste: ['offre'] });
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(D.A, { cote: 0.2, d: 2.0 }), acteurs: [D.A], lum: Q20BD.lum(c, D.P), dit: c.parole('Il rit sans bruit. « Onz. »', ''), court: true }),
      c.plan({ dur: 5.6, cam: c.camActeur(D2.A, { cote: -0.4, d: 2.0, buste: true }), acteurs: [D2.A, lu], lum: Q20BD.lum(c, D2.P).concat([Q20B.froide(c, lu.P, 1.4, 0.05)]), dit: c.parole('Onz.', D.nom, D.voix) }),
    ];
  },
});
