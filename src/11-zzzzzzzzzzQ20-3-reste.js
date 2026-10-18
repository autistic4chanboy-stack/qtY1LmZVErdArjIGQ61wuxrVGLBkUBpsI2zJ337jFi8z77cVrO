// ============================================================================
//  LES SCÈNES DES QUÊTES (agent Q20C, vingtième vague, lot 3) — 3. LE RESTE
//  Les quêtes qui n'avaient pas encore de scènes, hors des trente-neuf des
//  habitants (Q20A) et de celles de Q16 (Q20B). Le recensement : $SP/agentQ20C/
//  RECENSEMENT.md. Trois fichiers :
//  - celui-ci : ce que partagent les trois (les « donneurs » qui ne sont pas des
//    habitants, de petits objets, des outils) et les PREMIÈRES quêtes des
//    habitants ajoutés après coup (05-zzz6-habitants.js : l'alchimiste, le
//    bibliothécaire, les colporteurs, le chasseur, le docteur des Sources,
//    l'ancien des nains ; 11-zzzz7-carte3-peuples.js : les Planches et
//    l'estive). Elles passent par `quests` : le cadre les déclenche seul ;
//  - 3b : les quêtes qui ne passent ni par `quests` ni par `q16` (la tournée
//    de la poste, les petits travaux de la mairie, la bibliothèque, la
//    lavandière, les Petits, le baron, la loge, l'avis de recherche, l'homme au
//    masque, les malédictions, les commandes, la carte au trésor, les reliques,
//    le caveau du bois) : leur état (etat()) et leurs déclencheurs, posés en
//    emballant leur code sans rien y changer ;
//  - 3c : les quêtes T, enrichies (la demande, chez celui qui la propose, et le
//    dénouement de chaque fin, avec les gens), sans toucher à leurs scènes.
//  Rien n'est généré (aucune passe), rien ne change dans les quêtes elles-mêmes.
// ============================================================================

// ---------------------------------------------------------------- les donneurs qui ne sont pas des habitants
// (une définition porte alors souv: 'q20c:…' au lieu de qui : les Souvenirs les rangent sous ce nom)
const Q20C_QUI = {
  'q20c:vallee': 'La vallée',
  'q20c:lavandiere': 'Marthe Aubry — la lavandière de nuit',
  'q20c:petits': 'Les Petits',
  'q20c:cercle': 'Le Grand Cercle',
  'q20c:hotel': 'Le Grand Hôtel des Cimes',
  'q20c:commune': 'La commune — le tableau des petits travaux',
  'q20c:carte': 'Une carte au trésor',
  'q20c:lettre': 'Une lettre',
  'q20c:avis': 'Un avis',
  'q20c:objet': 'Une chose trouvée',
};
{
  const _quiDe = q20.quiDe.bind(q20), _nomDe = q20.nomDe.bind(q20);
  q20.quiDe = function (id) { const D = this.defs[id]; if (D && !D.qui && D.souv) return D.souv; return _quiDe(id); };
  q20.nomDe = function (qui) { if (qui && Q20C_QUI[qui]) return Q20C_QUI[qui]; return _nomDe(qui); };
}

// ---------------------------------------------------------------- de petits objets (dessinés dans le repère de la chose)
const Q20C_DESSINS = {
  // une gentiane et un edelweiss, posés sur un linge
  fleurs_haut(PE) { PE.box(0, 0.004, 0, 0.32, 0.006, 0.22, [1.2, 1.15, 1.05], TL.cloth, 0.2); PE.box(-0.06, 0.03, 0, 0.05, 0.05, 0.05, [0.35, 0.45, 1.35], TL.flowers); PE.box(-0.06, 0.012, 0.06, 0.012, 0.012, 0.1, [0.4, 0.7, 0.3], TL.leaves); PE.box(0.07, 0.025, 0.01, 0.06, 0.03, 0.06, [1.3, 1.3, 1.22], TL.flowers); PE.box(0.07, 0.01, 0.07, 0.012, 0.012, 0.09, [0.55, 0.65, 0.5], TL.leaves); },
  // un vieil herbier de cuir vert, gondolé
  herbier(PE) { PE.box(0, 0.03, 0, 0.26, 0.06, 0.34, [0.32, 0.5, 0.3], TL.leather, 0.15); PE.box(0.004, 0.032, 0, 0.24, 0.05, 0.32, [1.05, 1.0, 0.82], TL.paper, 0.15); PE.box(0.06, 0.062, 0.05, 0.08, 0.004, 0.1, [0.5, 0.7, 0.35], TL.leaves, 0.3); },
  // un feuillet couvert de Hautes Lettres
  feuillet(PE) { PE.box(0, 0.004, 0, 0.2, 0.006, 0.27, [1.08, 1.0, 0.8], TL.paper, 0.25); for (let k = 0; k < 6; k++) PE.box(0, 0.008, -0.09 + k * 0.035, 0.15, 0.003, 0.008, [0.25, 0.2, 0.15], TL.plain, 0.25); },
  // un paquet ficelé (des bouteilles, dedans)
  paquet(PE) { PE.box(0, 0.14, 0, 0.26, 0.28, 0.22, [0.62, 0.5, 0.36], TL.paper); PE.box(0, 0.281, 0, 0.27, 0.006, 0.02, [0.42, 0.34, 0.22], TL.rope); PE.box(0, 0.281, 0, 0.02, 0.006, 0.23, [0.42, 0.34, 0.22], TL.rope); },
  // deux poissons des Sources, sur des feuilles
  poissons(PE) { PE.box(0, 0.006, 0, 0.3, 0.008, 0.36, [0.4, 0.75, 0.35], TL.leaves, 0.3); for (const s of [-1, 1]) { PE.box(s * 0.06, 0.03, 0, 0.06, 0.045, 0.26, [0.95, 0.85, 0.75], TL.scales, s * 0.1); PE.box(s * 0.06, 0.03, -0.15, 0.015, 0.05, 0.05, [0.85, 0.75, 0.65], TL.scales); } },
  // des peaux pliées (trois fourrures, deux cuirs)
  peaux(PE) { const C = [[0.62, 0.45, 0.3], [0.5, 0.38, 0.26], [0.7, 0.6, 0.45], [0.55, 0.36, 0.22], [0.48, 0.32, 0.2]]; for (let k = 0; k < 5; k++) PE.box(0, 0.025 + k * 0.045, 0, 0.5 - k * 0.03, 0.04, 0.36, C[k], k < 3 ? TL.fur : TL.leather, k * 0.08); },
  // un piège refermé sur de la mousse
  piege_mousse(PE) { const f = [0.45, 0.42, 0.4]; PE.box(0, 0.01, 0, 0.36, 0.02, 0.06, f, TL.iron); PE.box(0, 0.04, 0, 0.3, 0.06, 0.03, f, TL.iron); PE.box(0, 0.06, 0, 0.16, 0.06, 0.12, [0.35, 0.6, 0.3], TL.leaves); PE.box(0.05, 0.08, 0.02, 0.08, 0.05, 0.08, [0.3, 0.55, 0.25], TL.leaves); PE.box(0.18, 0.01, 0, 0.012, 0.012, 0.4, [0.4, 0.38, 0.35], TL.iron); },
  // des fioles, une pharmacie
  fioles(PE) { const C = [[0.5, 0.75, 0.55], [0.85, 0.6, 0.3], [0.6, 0.5, 0.8], [0.9, 0.85, 0.7]]; for (let k = 0; k < 4; k++) { PE.box(-0.12 + k * 0.08, 0.06, 0, 0.05, 0.12, 0.05, C[k], TL.glass); PE.box(-0.12 + k * 0.08, 0.13, 0, 0.025, 0.02, 0.025, [0.6, 0.45, 0.3], TL.wood); } },
  // des miches, un pain d'en haut
  pains(PE) { for (let k = 0; k < 3; k++) PE.box(-0.13 + k * 0.13, 0.05, (k % 2) * 0.04, 0.12, 0.09, 0.2, [1.05, 0.72, 0.38], TL.bread, k * 0.3); PE.box(0.22, 0.06, 0.05, 0.08, 0.11, 0.08, [1.25, 0.95, 0.4], TL.glass); },
  // le petit marteau lourd des nains
  marteau(PE) { PE.box(0, 0.03, 0, 0.12, 0.06, 0.07, [0.55, 0.52, 0.5], TL.iron); PE.box(0.0, 0.025, 0.16, 0.025, 0.025, 0.26, [0.45, 0.3, 0.18], TL.darkwood); PE.box(0.035, 0.064, 0, 0.02, 0.004, 0.05, [1.2, 1.05, 0.5], TL.gold); },
  // deux lingots d'or
  lingots(PE) { for (const s of [-1, 1]) PE.box(s * 0.055, 0.025, 0, 0.09, 0.05, 0.18, [1.55, 1.2, 0.45], TL.gold, s * 0.1); },
  // les calèus : un bout de bougie monté sur liège, qui flotte (la flamme luit)
  caleu(PE, t) { PE.box(0, 0.015, 0, 0.12, 0.03, 0.12, [0.8, 0.62, 0.4], TL.wood); PE.box(0, 0.06, 0, 0.035, 0.07, 0.035, [1.3, 1.25, 1.1], TL.plain); PE.fl = FX_EMIT; PE.box(0, 0.11 + Math.sin((t || 0) * 7) * 0.004, 0, 0.018, 0.035, 0.018, [1.6, 1.0, 0.45], TL.plain); PE.fl = 0; },
  // quatre bougies de la ville, en botte
  bougies(PE) { for (let k = 0; k < 4; k++) PE.box(-0.06 + k * 0.04, 0.015, 0, 0.025, 0.025, 0.24, [1.3, 1.25, 1.12], TL.plain); PE.box(0, 0.03, 0, 0.18, 0.006, 0.02, [0.45, 0.36, 0.22], TL.rope); },
  // des bûches et des clous
  bois_clous(PE) { for (let k = 0; k < 4; k++) PE.box(-0.2 + (k % 2) * 0.4 * 0.5, 0.06 + Math.floor(k / 2) * 0.1, (k % 2) * 0.12, 0.6, 0.1, 0.1, [0.6, 0.44, 0.28], TL.wood); PE.box(0.38, 0.03, 0, 0.12, 0.06, 0.1, [0.5, 0.48, 0.46], TL.iron); },
  // une perle, dans une coquille
  perle(PE) { PE.box(0, 0.012, 0, 0.12, 0.02, 0.1, [0.85, 0.82, 0.78], TL.stone, 0.3); PE.box(0, 0.035, 0, 0.026, 0.026, 0.026, [1.45, 1.42, 1.38], TL.plain); },
  // des pierres de sel gris
  sel(PE) { for (let k = 0; k < 4; k++) PE.box(-0.12 + k * 0.08, 0.04, (k % 2) * 0.05, 0.07, 0.07, 0.07, [0.85, 0.85, 0.82], TL.stone, k); },
  // une sonnaille de tôle, marquée de trois traits
  sonnaille(PE) { const t = [0.62, 0.55, 0.42]; PE.box(0, 0.07, 0, 0.08, 0.12, 0.06, t, TL.iron); PE.box(0, 0.14, 0, 0.06, 0.02, 0.05, t, TL.iron); for (let k = 0; k < 3; k++) PE.box(-0.02 + k * 0.02, 0.07, 0.031, 0.006, 0.07, 0.004, [0.2, 0.18, 0.15], TL.plain); PE.box(0, 0.165, 0, 0.3, 0.012, 0.03, [0.4, 0.26, 0.15], TL.leather, 0.4); },
  // trois pots de miel
  miels(PE) { for (let k = 0; k < 3; k++) { PE.box(-0.1 + k * 0.1, 0.05, 0, 0.08, 0.1, 0.08, [1.25, 0.9, 0.35], TL.glass); PE.box(-0.1 + k * 0.1, 0.105, 0, 0.085, 0.012, 0.085, [1.0, 0.95, 0.85], TL.cloth); } },
  // deux tommes de l'estive
  tommes(PE) { for (const s of [-1, 1]) PE.box(s * 0.12, 0.05, 0, 0.2, 0.1, 0.2, [0.95, 0.82, 0.55], TL.plain, s * 0.2); },
  // une image pieuse aux couleurs vives, et un pot de confiture
  image(PE) { PE.box(0, 0.004, 0, 0.12, 0.006, 0.17, [1.2, 1.15, 1.05], TL.paper); PE.box(0, 0.008, 0.01, 0.08, 0.004, 0.1, [0.4, 0.5, 1.2], TL.plain); PE.box(0, 0.009, 0.0, 0.03, 0.004, 0.06, [1.3, 1.1, 0.5], TL.plain); PE.box(0.14, 0.05, 0, 0.07, 0.1, 0.07, [0.75, 0.15, 0.25], TL.glass); },
  // deux plumes d'aigle
  plumes_aigle(PE) { for (const s of [-1, 1]) { PE.box(s * 0.03, 0.006, 0, 0.05, 0.008, 0.36, [0.45, 0.32, 0.2], TL.plain, s * 0.15); PE.box(s * 0.03, 0.008, 0.15, 0.04, 0.008, 0.06, [1.1, 1.05, 0.95], TL.plain, s * 0.15); } },
  // une carte pliée (fausse, comme toutes les cartes)
  carte(PE) { PE.box(0, 0.004, 0, 0.3, 0.006, 0.22, [1.1, 1.0, 0.78], TL.paper, 0.1); PE.box(-0.05, 0.008, 0.02, 0.12, 0.003, 0.012, [0.3, 0.45, 0.7], TL.plain, 0.4); PE.box(0.06, 0.008, -0.04, 0.05, 0.003, 0.05, [0.35, 0.55, 0.3], TL.plain); },
};
// des silhouettes en plus
Object.assign(Q20_LOOKS, {
  // la sœur de la colporteuse, telle qu'elle l'imagine (une lettre de loin)
  q20c_soeur: { skin: '#d0a888', hair: '#2a1e16', hairStyle: 'chignon', top: '#5a4a6a', bottom: '#4a3a4a', shoe: '#2a2018', dress: true, apron: '#d8d0c0', height: 0.97, build: 'normal' },
});

// ---------------------------------------------------------------- les outils de ces scènes-ci
const Q20C = {
  // le premier lieu qui existe parmi des clés (w.lm, w.bld)
  lieu(c, ...cles) { for (const k of cles) { const L = k && c.lieu(k); if (L) return L; } return null; },
  // un point de sol libre autour d'un lieu (à d mètres, dans la direction a)
  autour(c, L, a, d, rad) { if (!L) return null; const P = Array.isArray(L) ? L : L.P; return Q20H.libre(c, c.devant(P, a || 0, d || 0), 0, 6, rad || 0.6); },
  // l'habitant chez lui à son poste (sinon assis, sinon au milieu) — dedans
  // (une maison sans poste de travail : la place assise ; debout, on se tient devant la chaise, pas dessus)
  chez(c, qui, o) {
    o = o || {};
    const M = c.maison(qui);
    if (!M) return null;
    const ou = o.ou || (M.poste ? 'poste' : M.assis ? 'assis' : undefined);
    const assis = JSON.stringify(o.geste || '').includes('assis');
    return Q20H.poste(c, qui, Object.assign({}, o, { ou, decale: o.decale || ((ou === 'assis' || ou === 'lit') && !assis ? [0.85, 0] : undefined) }));
  },
  // une chose posée sur un meuble (dy : sa hauteur), ou devant l'acteur, à hauteur de main
  surMeuble(c, cle, id, dy, pres) { const m = Q20H.meuble(c, cle, id, pres); return m ? { P: c.haut(m.P, dy ?? 0.8), r: m.r } : null; },
  enMain(c, A, dy, d) { return A ? c.haut(c.devant(A.P, A.cap, d ?? 0.34, 0.06, true), dy ?? 1.0) : null; },
  // la fente de la falaise (l'entrée des halles des nains) : { P (devant la fente, dehors), F (la fente), cap (vers dehors) }
  fente(c) {
    const D = c.w.nains && c.w.nains.door;
    if (!D) { const L = c.lieu('fente_nains'); return L ? { P: L.P, F: L.P, cap: 0 } : null; }
    const [x, y, z, a] = D, F = [x, y, z];
    return { F, cap: a, P: c.pt(x + Math.sin(a) * 1.4, z + Math.cos(a) * 1.4) };
  },
  // le bord de l'eau devant les Planches (la Dauna, le gourg)
  eau(c, L) { if (!L) return null; return [L.x, c.w.waterLevel + 0.05, L.z]; },
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
  // la trouvaille (comme Q20H.trouvaille) : la chose posée là où elle était, le joueur penché dessus, puis le lieu ;
  // les cadrages essaient plusieurs côtés (une cachette tirée au hasard peut être serrée contre un mur)
  trouvaille(c, dessin, o) {
    o = o || {};
    const P = c.cachette();
    if (!P) return [];
    const ch = c.chose(dessin, P, { s: o.s || 1.7, r: o.r || 0.6, lueur: true });
    const L = Q20H.lieuQuete(c);
    const a = L ? Math.atan2(P[0] - L.x, P[2] - L.z) : 0.6;
    const J = c.joueur(c.devant(P, a, 0.95, 0.15), { face: P, geste: { reach: 0.25, lean: 0.4, lookP: 0.4 }, vu: false });
    // (de près ; puis d'un peu plus haut, par-dessus un mur ; enfin le lieu, de loin)
    const cam1 = this.cam(c, () => c.camChose(P, { a: a + 0.9, d: 1.7, haut: 0.95 }), () => c.camChose(P, { a: a + 0.9, d: 2.4, haut: 2.2 }), () => c.camChose(P, { a: a + 2.6, d: 3.4, haut: 3.4 }),
      () => (L ? c.camLieu(L, { d: 14, haut: 4, vise2: c.haut(P, 0.2) }) : null));
    const plans = [c.plan({ dur: o.dur || 5.6, cam: cam1, acteurs: [ch, J], dit: o.dit, son: o.son, chaque: o.chaque, lum: o.lum })];
    if (L && o.lieu !== false) {
      const cam2 = this.cam(c, ...[0.8, 0.4, 1.2, 0, 1.6].map((k) => () => c.camLieu(L, { a: a + Math.PI * k, d: o.d2, dy: o.dy2 })));
      plans.push(c.plan({ dur: o.dur2 || 5, cam: cam2, acteurs: [c.joueur(P, { face: L.P, geste: 'baisse', vu: false })], dit: o.dit2, son: o.son2 }));
    }
    return plans;
  },
};

// ============================================================================ L'ALCHIMISTE (Fauvel ; sa boutique, en ville)
q20.scenes('alchimiste_1', {
  qui: 'alchimiste',
  demande(c) {
    const al = Q20H.meuble(c, 'vide6', 'alambic') || Q20H.meuble(c, 'vide6', 'table_alchimie');
    const moi = Q20C.chez(c, 'alchimiste', { vise: al && al.P, geste: ['travaille', 'baisse'] });
    const L = Q20C.lieu(c, 'estive_crete', 'estive_cairn', 'estive');
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 0.9, d: 2.2, buste: true }), acteurs: [moi], lum: al ? [c.lueur(al.P, 3.5, [0.7, 1.0, 0.6], 0.9)] : [], dit: ['Mon herbier a perdu ses planches de montagne. Une gentiane, un edelweiss : frais, je vous prie.'], court: true }),
      c.plan({ dur: 6, cam: c.camLieu(L, { d: 30, haut: 4, dy: 2, monte: 2 }), heure: 9.5, dit: ['Faites-les-moi nommer d’abord. Je ne veux pas d’un pissenlit peint en bleu. Et méfiez-vous du vide.'] }),
    ];
  },
  fin(c) {
    const t = Q20H.meuble(c, 'vide6', 'table') || Q20H.meuble(c, 'vide6', 'table_alchimie');
    const moi = Q20C.chez(c, 'alchimiste', { vise: t && t.P, geste: ['penche', { reach: 0.35 }] });
    const fl = t ? c.chose(Q20C_DESSINS.fleurs_haut, c.haut(t.P, 0.79), { s: 1.6, r: 0.4 }) : null;
    const ta = Q20H.meuble(c, 'vide6', 'table_alchimie');
    const moi2 = Q20C.chez(c, 'alchimiste', { vise: ta && ta.P, geste: ['montre', 'parle'] });
    return [
      c.plan({ dur: 6.2, cam: t ? c.camDedans('vide6', c.haut(t.P, 0.9), { pref: c.maison('alchimiste').cap + 0.6, d: 2.2 }) : c.camActeur(moi), acteurs: [moi, fl], dit: ['Superbes. Gentiana lutea, et la reine des rochers. Vous avez l’œil.'], court: true }),
      c.plan({ dur: 6, cam: c.camActeur(moi2, { cote: 0.6, d: 2.4, avec: ta ? ta.P : undefined, k: 0.35 }), acteurs: [moi2], dit: ['Les plans d’une table d’alchimiste. Chez vous, vous en aurez besoin.'], son: 'page' }),
    ];
  },
});

q20.scenes('alchimiste_2', {
  qui: 'alchimiste',
  demande(c) {
    const moi = Q20C.chez(c, 'alchimiste', { ou: 'assis', geste: ['assis', 'baisse'] });
    const li = moi && c.chose('livre', Q20C.enMain(c, moi, 0.62, 0.3), { r: moi.cap });
    const R = c.lieu('ruines');
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.5, d: 2.0 }), acteurs: [moi, li], dit: ['Mon premier herbier, je l’ai perdu il y a trente ans, aux ruines de l’est. En fuyant un orage.'], court: true }),
      c.plan({ dur: 6, cam: c.camLieu(R, { d: 26, haut: 3, dy: 1.5, recul: 0.18 }), heure: 17.8, son: 'grondement', dit: ['Je n’ai jamais osé y retourner. Vous, si ? Il était en cuir vert. Enfin, il l’était.'] }),
    ];
  },
  tournant(c) { return Q20C.trouvaille(c, Q20C_DESSINS.herbier, { s: 1.5, son: 'page' }); },
  fin(c) {
    const t = Q20H.meuble(c, 'vide6', 'table');
    const moi = Q20C.chez(c, 'alchimiste', { vise: t && t.P, geste: ['penche', 'baisse'] });
    const hb = t ? c.chose(Q20C_DESSINS.herbier, c.haut(t.P, 0.79), { s: 1.4, r: 0.3 }) : null;
    const moi2 = Q20C.chez(c, 'alchimiste', { geste: ['offre'] });
    const fi = moi2 && c.chose(Q20C_DESSINS.fioles, Q20C.enMain(c, moi2, 1.0, 0.38), { s: 0.6, r: moi2.cap });
    return [
      c.plan({ dur: 6.6, cam: t ? c.camDedans('vide6', c.haut(t.P, 0.85), { pref: c.maison('alchimiste').cap - 0.5, d: 2.0 }) : c.camActeur(moi), acteurs: [moi, hb], son: 'page', dit: ['Il en reste… presque tout. Mes dessins d’étudiant. J’étais si sûr de moi.'], court: true }),
      c.plan({ dur: 5.6, cam: c.camActeur(moi2, { cote: 0.3, d: 2.0, buste: true }), acteurs: [moi2, fi], dit: ['Merci. Prenez ceci : ce que je fais de mieux.'] }),
    ];
  },
});

// ============================================================================ LE BIBLIOTHÉCAIRE (Morand ; la grande bibliothèque, sur le plateau)
q20.scenes('libraire_1', {
  qui: 'libraire',
  demande(c) {
    const moi = Q20C.chez(c, 'libraire', { geste: ['parle', 'baisse'], tient: true });
    const A = c.lieu('abbaye');
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.4, d: 2.4 }), acteurs: [moi], dit: ['Il manque une page à un registre de Montrevel. Les moines l’ont arrachée, dit-on, pour la cacher dans l’abbaye.'], court: true }),
      c.plan({ dur: 6, cam: c.camLieu(A, { d: 34, haut: 4, dy: 3, monte: 1.5 }), heure: 17.5, son: 'cloche', dit: ['Elle est couverte de Hautes Lettres. Cherchez là où l’on n’a pas envie de chercher.'] }),
    ];
  },
  tournant(c) { return Q20C.trouvaille(c, Q20C_DESSINS.feuillet, { s: 1.6, son: 'murmure', dy2: 2 }); },
  fin(c) {
    const lu = Q20H.meuble(c, 'bibliotheque', 'b1_lutrin') || Q20H.meuble(c, 'bibliotheque', 'table');
    const moi = lu ? c.habitant('libraire', c.devant(lu.P, (lu.r || 0) + Math.PI, 0.7, 0, true), { cap: lu.r || 0, geste: ['penche', 'baisse'] }) : Q20C.chez(c, 'libraire', { geste: 'baisse' });
    const fe = lu && c.chose(Q20C_DESSINS.feuillet, c.haut(lu.P, lu.q.id === 'table' ? 0.79 : 1.12), { s: 1.3, r: lu.r || 0 });
    const moi2 = Q20C.chez(c, 'libraire', { geste: ['offre'], tient: true });
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 0.9, d: 2.2, buste: true }), acteurs: [moi, fe], dit: ['Le voilà. On voit encore la déchirure. Ils ont eu peur de ce qu’ils lisaient, je crois.'], court: true }),
      c.plan({ dur: 6, cam: c.camActeur(moi2, { cote: 0.3, d: 2.2 }), acteurs: [moi2, Q20H.face(c, moi2, 1.4, 0.3)], dit: ['Gardez ce lexique. Vous en aurez besoin, si vous comptez lire ce que disent les pierres.'] }),
    ];
  },
});

// ============================================================================ LES COLPORTEURS (leurs roulottes, au bord de la ville)
q20.scenes('colporteur_1', {
  qui: 'colporteur',
  demande(c) {
    const moi = Q20H.seuil(c, 'colporteur', { d: 1.0, geste: ['offre', 'parle'] });
    const pq = moi && c.chose(Q20C_DESSINS.paquet, Q20C.enMain(c, moi, 0.9, 0.4), { r: moi.cap, s: 0.9 });
    const Au = c.maison('aubergiste');
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 0.5, d: 2.6 }), acteurs: [moi, pq], dit: ['Rendez-moi un service : ce paquet va à l’aubergiste, en main propre. Moi, je dois aller ailleurs.'], court: true }),
      c.plan({ dur: 5.8, cam: c.camLieu(Au ? Au.porte : c.lieu('auberge'), { d: 14, haut: 2.6, dy: 2 }), dit: ['Ne l’ouvrez pas. Ne le secouez pas trop non plus.'] }),
    ];
  },
  tournant(c) {
    const moi = Q20C.chez(c, 'aubergiste', { geste: ['tend', 'parle'] });
    const pq = moi && c.chose(Q20C_DESSINS.paquet, Q20C.enMain(c, moi, 1.02, 0.42), { r: moi.cap, s: 0.85 });
    const moi2 = Q20C.chez(c, 'aubergiste', { geste: ['bras', 'leve'] });
    return [
      c.plan({ dur: 5.8, cam: c.camActeur(moi, { cote: 0.5, d: 2.2, buste: true }), acteurs: [moi, pq], son: 'clochette', dit: ['Ah, enfin, le paquet de Jouvet. Ne me demandez pas ce qu’il y a dedans.', '@aubergiste'] }),
      c.plan({ dur: 5.6, cam: c.camActeur(moi2, { cote: -0.3, d: 2.4 }), acteurs: [moi2], dit: ['Des bouteilles. D’accord, des bouteilles.', '@aubergiste'] }),
    ];
  },
  fin(c) {
    const moi = Q20H.seuil(c, 'colporteur', { d: 1.0, geste: ['offre', 'parle'] });
    const ca = moi && c.chose(Q20C_DESSINS.carte, Q20C.enMain(c, moi, 1.0, 0.38), { r: moi.cap, s: 0.8 });
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.4, d: 2.2, avec: Q20H.face(c, moi, 1.5, 0.3), k: 0.3 }), acteurs: [moi, ca, Q20H.face(c, moi, 1.5, 0.3)], son: 'piece', dit: ['Livré ? Merci ! Et il n’a pas posé de questions ? Un brave homme.'], court: true }),
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 1.6, d: 3.2, haut: 1.9 }), acteurs: [moi, ca], dit: ['Tenez, une carte des environs. Fausse, comme toutes les cartes, mais jolie.'] }),
    ];
  },
});

q20.scenes('colporteuse_1', {
  qui: 'colporteuse',
  demande(c) {
    const moi = Q20H.seuil(c, 'colporteuse', { d: 1.0, geste: ['baisse', { reach: 0.2 }] });
    const le = moi && c.chose('lettre', Q20C.enMain(c, moi, 1.05, 0.3), { r: moi.cap });
    const S = c.lieu('sources');
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.6, d: 2.4 }), acteurs: [moi, le], dit: ['Ma sœur m’écrit qu’elle voudrait goûter le poisson des Sources. Il n’existe que là-bas, dans l’eau chaude.'], court: true }),
      c.plan({ dur: 6, cam: c.camLieu(S, { d: 34, haut: 4, dy: 1 }), heure: 7.2, chaque: S ? Q20H.emet(c.haut(S.P, 0.3), { n: 10, col: [0.92, 0.92, 0.95, 0.45], taille: 0.5, vie: 3.5, v: 0.6, vy: 0.5, r: 8 }) : null, dit: ['Deux, pour faire bonne mesure ? Aux Sources, au sud-est. Ils vous prêteront même une serviette.'] }),
    ];
  },
  fin(c) {
    const moi = Q20H.seuil(c, 'colporteuse', { d: 1.0, geste: ['penche', { reach: 0.3 }] });
    const po = moi && c.chose(Q20C_DESSINS.poissons, Q20C.enMain(c, moi, 1.0, 0.36), { r: moi.cap, s: 0.9 });
    const moi2 = Q20H.seuil(c, 'colporteuse', { d: 1.0, geste: ['offre', 'parle'] });
    const ca = moi2 && c.chose(Q20C_DESSINS.carte, Q20C.enMain(c, moi2, 1.0, 0.38), { r: moi2.cap, s: 0.8 });
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.5, d: 2.0, buste: true }), acteurs: [moi, po], dit: ['Ils sont encore tièdes ! Elle ne me croira jamais.'], court: true }),
      c.plan({ dur: 6, cam: c.camActeur(moi2, { cote: -0.4, d: 2.4 }), acteurs: [moi2, ca, Q20H.face(c, moi2, 1.5, 0.3)], son: 'piece', dit: ['Merci ! Tenez, une carte du nord : dessinée par un berger, relue par personne.'] }),
    ];
  },
});

// ============================================================================ LE CHASSEUR (Brossard ; le relais de chasse, dans la forêt)
q20.scenes('chasseur_1', {
  qui: 'chasseur',
  demande(c) {
    const tr = Q20H.meuble(c, 'relais_chasse', 'trophee');
    const moi = Q20C.chez(c, 'chasseur', { geste: ['bras'], cap: tr ? undefined : undefined });
    const ch = Q20H.meuble(c, 'relais_chasse', 'cheminee');
    const lum = ch ? [c.lueur(ch.P, 4.5, [1.0, 0.55, 0.25], 0.6)] : [];
    const M = c.maison('chasseur'), bois = M && Q20C.autour(c, M.porte, M.cap + 0.5, 22);
    const loup = bois && c.bete('wolf', bois, { cap: c.cap(bois, M.porte) + 0.6 });
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.3, d: 2.4, avec: tr ? tr.P : undefined, k: 0.3 }), acteurs: [moi], lum, dit: ['Il me faut des peaux pour l’hiver. Trois fourrures, deux cuirs. Vous chassez ? Prouvez-le.'], court: true }),
      c.plan({ dur: 6, cam: bois ? c.camChose(bois, { d: 9, haut: 1.6, dy: 0.6, a: M.cap + 2.4 }) : c.camActeur(moi, { cote: 1.6 }), acteurs: [loup], heure: 6.4, son: 'loup', dit: ['Et ne revenez pas avec des peaux de chat.'] }),
    ];
  },
  fin(c) {
    const t = Q20H.meuble(c, 'relais_chasse', 'table');
    const moi = Q20C.chez(c, 'chasseur', { vise: t && t.P, geste: ['penche', { reach: 0.4 }] });
    const pe = t ? c.chose(Q20C_DESSINS.peaux, c.haut(t.P, 0.79), { s: 1.0, r: 0.2 }) : null;
    const M = c.maison('chasseur'), pp = M && Q20C.autour(c, M.porte, M.cap - 0.8, 4);
    return [
      c.plan({ dur: 6, cam: t ? c.camDedans('relais_chasse', c.haut(t.P, 0.9), { pref: M.cap + 0.7, d: 2.2 }) : c.camActeur(moi), acteurs: [moi, pe], dit: ['Bon travail. Pas une de chat.'], court: true }),
      c.plan({ dur: 6.2, cam: pp ? c.camChose(pp, { d: 2.4, haut: 1.1, dy: 0.1 }) : c.camActeur(moi), acteurs: [pp && c.chose('piege_loup', pp, { r: M.cap })], dit: ['Voilà comment on fait un piège à loup. Posez-le loin des chemins.', '@chasseur'] }),
    ];
  },
});

q20.scenes('chasseur_2', {
  qui: 'chasseur',
  delais: { tournant: 3 },
  demande(c) {
    const M = c.maison('chasseur'), pp = M && Q20C.autour(c, M.porte, M.cap + 1.1, 7);
    const moi = pp ? c.habitant('chasseur', c.devant(pp, M.cap + 1.1 + Math.PI, 1.1), { face: pp, geste: ['penche', 'montre'] }) : Q20H.seuil(c, 'chasseur', { geste: 'montre' });
    const pg = pp && c.chose(Q20C_DESSINS.piege_mousse, pp, { s: 1.4, r: M.cap });
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.8, d: 2.6, avec: pp, k: 0.4 }), acteurs: [moi, pg], heure: Math.max(c.h, 17.6), dit: ['Quelque chose vide mes pièges, la nuit. Pas un renard : ils se referment sur de la mousse.'], court: true }),
      c.plan({ dur: 5.8, cam: pp ? c.camChose(pp, { d: 1.6, haut: 0.95, dy: 0.05 }) : c.camActeur(moi), acteurs: [pg], heure: Math.max(c.h, 17.6), dit: ['Veillez une nuit près du relais. Ne tirez sur rien que vous n’ayez vu.'] }),
    ];
  },
  tournant(c) {
    const L = c.lieu('relais_chasse'), ici = Q20H.ici(c, L, 12, 2.2);
    if (!ici) return null;
    const J = c.joueur(ici, { face: L.P, tient: 'lanterne', geste: 'penche' });
    const pp = Q20C.autour(c, ici, c.cap(ici, L.P) + 0.7, 5);
    return [
      c.plan({ dur: 6.4, cam: c.camLieu(L, { d: 16, haut: 1.4, dy: 1.4, a: c.cap(L.P, ici), recul: 0.08 }), acteurs: [J], heure: c.heure('nuit'), son: 'hibou' }),
      c.plan({ dur: 5.6, cam: c.camChose(pp, { d: 1.5, haut: 0.95, dy: 0.05, a: c.cap(pp, ici) }), acteurs: [c.chose(Q20C_DESSINS.piege_mousse, pp, { s: 1.4, r: 0.6 })], heure: c.heure('nuit'), lum: [c.lueur(pp, 2.2, [0.5, 0.55, 0.65], 0.6)], son: 'murmure' }),
    ];
  },
  fin(c) {
    const moi = Q20H.seuil(c, 'chasseur', { d: 0.8, geste: ['bras', 'baisse'] });
    const moi2 = Q20H.seuil(c, 'chasseur', { d: 0.8, geste: ['offre'] });
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.2, d: 2.0 }), acteurs: [moi], dit: ['Vous l’avez vu aussi. … Bon.'], court: true }),
      c.plan({ dur: 5.6, cam: c.camActeur(moi2, { cote: 0.7, d: 2.6, avec: Q20H.face(c, moi2, 1.5, 0.2), k: 0.3 }), acteurs: [moi2, Q20H.face(c, moi2, 1.5, 0.2)], son: 'piece', dit: ['Tenez, des cartouches. On n’en parle à personne.'] }),
    ];
  },
});

// ============================================================================ LE DOCTEUR DES SOURCES (Bréhal ; sa maison, aux Sources)
q20.scenes('naturiste_b_1', {
  qui: 'naturiste_b',
  demande(c) {
    const et = Q20H.meuble(c, 'source_b', 'etagere') || Q20H.meuble(c, 'source_b', 'armoire');
    const moi = Q20C.chez(c, 'naturiste_b', { vise: et && et.P, geste: ['bras', 'leve'] });
    const V = c.maison('alchimiste');
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 1.0, d: 2.2, avec: et ? c.haut(et.P, 1.2) : undefined, k: 0.4 }), acteurs: [moi], dit: ['Ma pharmacie est vide. De la reine-des-prés, de l’achillée, un pot de miel.'], court: true }),
      c.plan({ dur: 6, cam: c.camLieu(V ? V.porte : c.lieu('place'), { d: 13, haut: 2.6, dy: 2 }), dit: ['Faites-les identifier en ville. Je ne soigne pas avec des devinettes.'] }),
    ];
  },
  fin(c) {
    const et = Q20H.meuble(c, 'source_b', 'etagere') || Q20H.meuble(c, 'source_b', 'armoire');
    const moi = Q20C.chez(c, 'naturiste_b', { vise: et && et.P, geste: ['leve', { reach: 0.55 }] });
    const fi = et && c.chose(Q20C_DESSINS.fioles, c.haut(et.P, 1.25), { s: 1.0, r: et.r || 0 });
    const moi2 = Q20C.chez(c, 'naturiste_b', { geste: ['offre', 'parle'] });
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 1.2, d: 2.2 }), acteurs: [moi, fi], dit: ['Parfait. Voilà une pharmacie qui ressemble à quelque chose.'], court: true }),
      c.plan({ dur: 6, cam: c.camActeur(moi2, { cote: 0.3, d: 2.2, buste: true }), acteurs: [moi2, Q20H.face(c, moi2, 1.4, 0.3)], dit: ['Des attelles, des bandages. Avec ce que vous faites, vous en aurez besoin.'] }),
    ];
  },
});

// ============================================================================ L'ANCIEN DES NAINS (les halles, sous la montagne ; la fente de la falaise)
// Les halles sont sous terre : on filme la fente par où l'on y descend, et sa voix qui en sort.
function q20cNain(c, o) {
  const Fe = Q20C.fente(c);
  if (!Fe) return { Fe: null };
  const A = c.habitant('nain_ancien', c.devant(Fe.F, Fe.cap, 0.35, 0, true), Object.assign({ cap: Fe.cap, lanterne: true }, o || {}));
  // (la lueur des halles, qui monte de la fente, et sa lanterne)
  return { Fe, A, lum: [c.lueur(c.haut(Fe.F, 0.3), 6, [1.0, 0.7, 0.35], 0.8), c.lueur(c.devant(Fe.F, Fe.cap, 1.4, 0, true), 4, [1.0, 0.75, 0.45], 1.4)] };
}
q20.scenes('nain_ancien_1', {
  qui: 'nain_ancien',
  demande(c) {
    const { Fe, A, lum } = q20cNain(c, { geste: ['bras', 'parle'] });
    const Bo = c.maison('boulangere');
    return [
      c.plan({ dur: 6.4, cam: Fe ? c.camActeur(A, { cote: 0.4, d: 2.8, haut: 1.2 }) : c.camLieu('place'), acteurs: [A], heure: Math.max(c.h, 17.7), lum, dit: ['Nos fours ne font que des galettes. Rapporte-nous du pain d’en haut. Six. Et deux pots de miel.'], court: true }),
      c.plan({ dur: 5.8, cam: c.camLieu(Bo ? Bo.porte : c.lieu('place'), { d: 14, haut: 2.6, dy: 2 }), heure: 7, dit: ['Tu auras nos mots, et du verre.'] }),
    ];
  },
  fin(c) {
    const { Fe, A, lum } = q20cNain(c, { geste: ['penche', { reach: 0.35 }] });
    const pa = A && c.chose(Q20C_DESSINS.pains, Q20C.enMain(c, A, 0.62, 0.32), { r: A.cap, s: 0.9 });
    const { A: A2 } = q20cNain(c, { geste: ['offre'] });
    return [
      c.plan({ dur: 6.2, cam: Fe ? c.camActeur(A, { cote: 0.5, d: 2.2, haut: 1.1 }) : c.camLieu('place'), acteurs: [A, pa], lum, dit: ['Il sent le blé et le soleil.'], court: true }),
      c.plan({ dur: 5.8, cam: Fe ? c.camActeur(A2, { cote: -0.4, d: 2.4, haut: 1.0, avec: Q20H.face(c, A2, 1.4, 0.2), k: 0.3 }) : c.camLieu('place'), acteurs: [A2, Q20H.face(c, A2, 1.4, 0.2)], lum, dit: ['Prends : deux lentilles, et le glossaire des Hautes Lettres. Tu liras, maintenant.'] }),
    ];
  },
});

q20.scenes('nain_ancien_2', {
  qui: 'nain_ancien',
  demande(c) {
    const { Fe, A, lum } = q20cNain(c, { geste: ['bras', 'baisse'] });
    const Mi = c.lieu('mine');
    return [
      c.plan({ dur: 6.4, cam: Fe ? c.camActeur(A, { cote: -0.5, d: 2.8, haut: 1.2 }) : c.camLieu('place'), acteurs: [A], heure: Math.max(c.h, 17.7), lum, dit: ['Un des nôtres a perdu son marteau dans la mine des grands, il y a trente de vos années.'], court: true }),
      c.plan({ dur: 5.8, cam: c.camLieu(Mi, { d: 24, haut: 3, dy: 1.5 }), dit: ['Il est trop fier pour y retourner. Toi, tu n’as pas de fierté.'] }),
    ];
  },
  tournant(c) { return Q20C.trouvaille(c, Q20C_DESSINS.marteau, { s: 1.6, son: 'enclume' }); },
  fin(c) {
    const { Fe, A, lum } = q20cNain(c, { geste: ['baisse', { reach: 0.3 }] });
    const ma = A && c.chose(Q20C_DESSINS.marteau, Q20C.enMain(c, A, 0.6, 0.3), { r: A.cap });
    const { A: A2 } = q20cNain(c, { geste: ['offre'] });
    const li = A2 && c.chose(Q20C_DESSINS.lingots, Q20C.enMain(c, A2, 0.62, 0.34), { r: A2.cap });
    return [
      c.plan({ dur: 6.2, cam: Fe ? c.camActeur(A, { cote: 0.6, d: 2.2, haut: 1.1 }) : c.camLieu('place'), acteurs: [A, ma], lum, son: 'enclume', dit: ['Le voilà. Il va pleurer, et prétendre que c’est la poussière.'], court: true }),
      c.plan({ dur: 5.8, cam: Fe ? c.camActeur(A2, { cote: -0.3, d: 2.0, haut: 1.0 }) : c.camLieu('place'), acteurs: [A2, li], lum, dit: ['Tiens : de l’or de nos filons.'] }),
    ];
  },
});

// ============================================================================ LES PLANCHES (le village sur pilotis, au bord de l'étang)
q20.scenes('planches_doyenne_1', {
  qui: 'planches_doyenne',
  demande(c) {
    const bo = Q20H.meuble(c, 'pl_doyenne', 'bougie');
    const moi = Q20C.chez(c, 'planches_doyenne', { ou: 'assis', geste: ['assis', 'baisse'] });
    const D = Q20C.lieu(c, 'planches_dame', 'planches_greve', 'planches');
    const Pe = D && Q20C.eau(c, D);
    const cal = Pe ? [0, 1, 2].map((k) => c.chose(Q20C_DESSINS.caleu, c.devant(Pe, 2.6 + k * 0.5, 1.4 + k * 0.8, (k - 1) * 0.9, true), { s: 1.8, lueur: true })) : [];
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.6, d: 2.0 }), acteurs: [moi], lum: bo ? [c.lueur(bo.P, 3, [1.0, 0.66, 0.3], 0.3)] : [], dit: ['Le Vorndi approche, et je n’ai plus de cire. Quatre bougies de la ville. Je les couperai en calèus.'], court: true }),
      c.plan({ dur: 6, cam: c.camLieu(D, { d: 9, haut: 2.0, dy: 0.5, a: 0.2, stop: 1.2 }), acteurs: cal, heure: 21.4, lum: cal.filter(Boolean).map((A) => c.lueur(A.P, 2.4, [1.0, 0.68, 0.32], 0.25)), dit: ['Un par maison d’en bas. Pas des cierges d’église : ils sentent l’encens, la Dauna n’aime pas.'] }),
    ];
  },
  fin(c) {
    const t = Q20H.meuble(c, 'pl_doyenne', 'table');
    const moi = Q20C.chez(c, 'planches_doyenne', { vise: t && t.P, geste: ['travaille', 'baisse'] });
    const bg = t ? c.chose(Q20C_DESSINS.bougies, c.haut(t.P, 0.79), { s: 1.2, r: 0.4 }) : null;
    const D = Q20C.lieu(c, 'planches_dame', 'planches_greve', 'planches'), Pe = D && Q20C.eau(c, D);
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 0.9, d: 2.0, buste: true }), acteurs: [moi, bg], dit: ['Bien. Celles-là ne sentent rien. Elle ne dira rien.'], court: true }),
      c.plan({ dur: 6, cam: c.camLieu(D, { d: 6.5, haut: 1.6, dy: 0.3, a: -0.25, stop: 1.2 }), acteurs: Pe ? [c.chose(Q20C_DESSINS.caleu, c.devant(Pe, 0.9, 1.6, 0, true), { s: 1.8, lueur: true })] : [], heure: 21.8, lum: Pe ? [c.lueur(Pe, 4.5, [1.0, 0.7, 0.35], 0.4)] : [], dit: ['Garde ces trois-là, montés sur liège. Pose-les sur l’aigue un soir, pour qui tu veux. Elle comprendra.', '@planches_doyenne'] }),
    ];
  },
});

q20.scenes('planches_passeur_1', {
  qui: 'planches_passeur',
  demande(c) {
    const Q = Q20C.lieu(c, 'planches_quai', 'planches');
    const moi = Q ? c.habitant('planches_passeur', [Q.x, Math.max(Q.y, c.w.waterLevel + 0.4), Q.z], { cap: 2.4, geste: ['penche', 'montre'] }) : Q20H.seuil(c, 'planches_passeur');
    if (moi) moi.P[1] = c.sol(moi.P[0], moi.P[2], moi.P[1]);
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 0.7, d: 3.0 }), acteurs: [moi], dit: ['Le quai pourrit par en dessous. Dix bûches, deux poignées de clous, et je le refais avant l’hiver.'], court: true }),
      c.plan({ dur: 5.8, cam: c.camLieu(Q, { d: 12, haut: 1.4, dy: 0.2 }), son: 'eau', dit: ['Du chêne si vous pouvez : le sapin boit l’eau. Et vous passerez pour rien.'] }),
    ];
  },
  fin(c) {
    const Q = Q20C.lieu(c, 'planches_quai', 'planches');
    const P0 = Q ? [Q.x, Math.max(Q.y, c.w.waterLevel + 0.4), Q.z] : null;
    if (P0) P0[1] = c.sol(P0[0], P0[2], P0[1]);
    const moi = P0 ? c.habitant('planches_passeur', P0, { cap: 0.4, geste: 'travaille', main: 'marteau' }) : Q20H.seuil(c, 'planches_passeur', { geste: 'travaille' });
    const bc = P0 && c.chose(Q20C_DESSINS.bois_clous, c.devant(P0, 1.2, 0.9, 0.4, true), { r: 0.3 });
    const moi2 = P0 ? c.habitant('planches_passeur', P0, { cap: 0.4, face: 'camera', geste: ['hoche', 'parle'] }) : moi;
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 1.1, d: 2.8 }), acteurs: [moi, bc], son: 'coups', dit: ['Voilà de quoi tenir dix ans.'], court: true }),
      c.plan({ dur: 6, cam: c.camActeur(moi2, { cote: 0.2, d: 2.4 }), acteurs: [moi2, bc], dit: ['Vous passerez pour rien, maintenant. C’est dit.'] }),
    ];
  },
});

q20.scenes('planches_vanniere_1', {
  qui: 'planches_vanniere',
  demande(c) {
    const et = Q20H.meuble(c, 'pl_vanniere', 'etabli');
    const moi = Q20C.chez(c, 'planches_vanniere', { vise: et && et.P, geste: ['travaille', 'baisse'] });
    const D = Q20C.lieu(c, 'planches_dame', 'planches'), Pe = D && Q20C.eau(c, D);
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 1.0, d: 2.0 }), acteurs: [moi], dit: ['On dit que la Dauna rend ce qu’on lui a donné, si on lui donne plus beau. Je lui ai donné mon anneau.'], court: true }),
      c.plan({ dur: 6, cam: c.camLieu(D, { d: 10, haut: 1.6, dy: 0.4, a: -0.45, stop: 1.2 }), heure: 20.2, son: 'goutte', dit: ['Une perle, une vraie. Je la lui porterai à la place. Peut-être qu’elle me le rendra.'] }),
    ];
  },
  fin(c) {
    const moi = Q20C.chez(c, 'planches_vanniere', { geste: ['leve', { reach: 0.3 }] });
    const pe = moi && c.chose(Q20C_DESSINS.perle, Q20C.enMain(c, moi, 1.12, 0.3), { s: 1.6, lueur: true });
    const D = Q20C.lieu(c, 'planches_dame', 'planches'), Pe = D && Q20C.eau(c, D);
    const bord = Pe && Q20H.libre(c, c.devant(Pe, 2.0, 3.2), 0, 4, 0.5);
    const elle = bord && c.habitant('planches_vanniere', bord, { face: Pe, geste: ['baisse', 'tend'], lanterne: true });
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.4, d: 1.8, buste: true }), acteurs: [moi, pe], dit: ['Elle est belle. Je la porterai ce soir au gourg.'], court: true }),
      c.plan({ dur: 6.2, cam: elle ? c.camActeur(elle, { cote: 0.7, d: 3.2, haut: 1.5 }) : c.camLieu(D), acteurs: [elle], heure: 17.9, son: 'eau', dit: ['Tenez, ce bracelet, en peau de sègue. On ne se noie pas, avec ça. Enfin, on se noie moins vite.', '@planches_vanniere'] }),
    ];
  },
});

// ============================================================================ L'ESTIVE (les cabanes de pierre, la jasse, la crête)
function q20cTroupeau(c, L, n, rig) {
  if (!L) return [];
  const out = [];
  for (let k = 0; k < n; k++) {
    const P = Q20H.libre(c, c.devant(L.P || L, k * 1.9, 2 + (k % 3) * 1.6), 0, 4, 0.9);
    if (P) out.push(c.bete(rig || (k % 3 ? 'sheep' : 'cow'), P, { cap: k * 1.3, v: k % 2, geste: { graze: 0.6 } }));
  }
  return out;
}
q20.scenes('estive_baile_1', {
  qui: 'estive_baile',
  demande(c) {
    const J = Q20C.lieu(c, 'estive_jasse', 'estive');
    const P0 = J && Q20H.libre(c, c.devant(J.P, 0.9, 3), 0, 5, 0.6);
    const moi = P0 ? c.habitant('estive_baile', P0, { face: J.P, geste: ['bras', 'parle'] }) : Q20H.seuil(c, 'estive_baile');
    const sel = J && Q20H.pres(c, J.P, 'c2_pierre_sel', 25);
    const Pl = c.lieu('place');
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 0.6, d: 3.0, avec: sel ? sel.P : undefined, k: 0.3 }), acteurs: [moi, ...q20cTroupeau(c, J, 3)], son: 'vache', dit: ['Il nous manque du sau pour les pierres. Huit mesures. Pas du sel de cuisine : du gros, du gris.'], court: true }),
      c.plan({ dur: 5.8, cam: c.camLieu(Pl, { d: 28, haut: 6, dy: 2 }), dit: ['La ville en vend, pour qui a les jambes de le monter.'] }),
    ];
  },
  fin(c) {
    const Pr = Q20C.lieu(c, 'estive_pre', 'estive');
    const sel = Pr && Q20H.libre(c, c.devant(Pr.P, 0.3, 1), 0, 5, 0.8);
    const vaches = sel ? [0, 1, 2].map((k) => c.bete(k === 1 ? 'sheep' : 'cow', c.devant(sel, k * 2.1, 1.3), { face: sel, v: k, geste: { graze: 0.9 } })) : [];
    const moi = sel ? c.habitant('estive_baile', Q20H.libre(c, c.devant(sel, 3.6, 3.2), 0, 4, 0.6), { face: sel, geste: ['bras', 'hoche'] }) : Q20H.seuil(c, 'estive_baile');
    const moi2 = Q20H.seuil(c, 'estive_baile', { d: 0.9, geste: ['offre', 'parle'] });
    const to = moi2 && c.chose(Q20C_DESSINS.tommes, Q20C.enMain(c, moi2, 1.0, 0.38), { r: moi2.cap, s: 0.7 });
    return [
      c.plan({ dur: 6.2, cam: sel ? c.camChose(sel, { d: 6, haut: 1.6, dy: 0.4 }) : c.camActeur(moi), acteurs: [c.chose(Q20C_DESSINS.sel, sel, { s: 2.2 }), ...vaches, moi], son: 'vache', dit: ['Bien. Les fea te diront merci à leur façon : elles ne te fonceront plus dedans.'], court: true }),
      c.plan({ dur: 5.8, cam: c.camActeur(moi2, { cote: 0.4, d: 2.4 }), acteurs: [moi2, to], dit: ['Tiens, une tomme de l’an passé.'] }),
    ];
  },
});

q20.scenes('estive_baile_2', {
  qui: 'estive_baile',
  demande(c) {
    const Cr = Q20C.lieu(c, 'estive_crete', 'estive');
    const moi = Q20H.seuil(c, 'estive_baile', { d: 1.2, vise: Cr && Cr.P, geste: ['montre', 'parle'] });
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.9, d: 3.2, avec: Cr ? c.haut(Cr.P, 4) : undefined, k: 0.3 }), acteurs: [moi], heure: Math.max(c.h, 17.4), dit: ['La Noire, c’est la meneuse. Elle a perdu sa sonnaille sur la crête, le soir où le drac a soufflé.'], court: true }),
      c.plan({ dur: 5.8, cam: c.camLieu(Cr, { d: 22, haut: 3, dy: 1.5 }), heure: 17.6, son: 'grondement', dit: ['Sans sa sonnaille, les autres ne la suivent plus. En tôle, avec trois traits. Retrouve-la.'] }),
    ];
  },
  tournant(c) { return Q20C.trouvaille(c, Q20C_DESSINS.sonnaille, { s: 1.6, son: 'clochette' }); },
  fin(c) {
    const Pr = Q20C.lieu(c, 'estive_pre', 'estive');
    const noire = Pr && Q20H.libre(c, c.devant(Pr.P, 0.4, 3), 0, 5, 1.0);
    const tr = noire ? [c.bete('cow', noire, { cap: 0.4, v: 2, s: 1.05 }), ...[1, 2, 3].map((k) => c.bete('cow', c.devant(noire, 0.4 + Math.PI, 2.6 * k, (k - 2) * 1.2), { cap: 0.4, v: k % 2, vers: c.devant(noire, 0.4 + Math.PI, 2.6 * k - 2.2, (k - 2) * 1.2), t0: 0.6, t1: 5.4 }))] : [];
    const moi2 = Q20H.seuil(c, 'estive_baile', { d: 0.9, geste: ['offre', 'parle'] });
    const so = moi2 && c.chose(Q20C_DESSINS.sonnaille, Q20C.enMain(c, moi2, 1.05, 0.36), { r: moi2.cap });
    return [
      c.plan({ dur: 6.2, cam: noire ? c.camChose(noire, { d: 8, haut: 1.8, dy: 1.0, a: 0.4 }) : c.camActeur(moi2), acteurs: tr, son: 'clochette', dit: ['C’est elle. Écoute : pas une autre ne sonne comme ça.', '@estive_baile'], court: true }),
      c.plan({ dur: 5.8, cam: c.camActeur(moi2, { cote: 0.45, d: 2.7 }), acteurs: [moi2, so], dit: ['Tiens, une des miennes. Accroche-la où tu veux : on saura que tu es passé.'] }),
    ];
  },
});

q20.scenes('estive_fromagere_1', {
  qui: 'estive_fromagere',
  demande(c) {
    const ba = Q20H.meuble(c, 'es_fromagerie', 'baratte');
    const moi = Q20C.chez(c, 'estive_fromagere', { vise: ba && ba.P, geste: 'travaille' });
    const F = c.lieu('ferme');
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 0.9, d: 2.2 }), acteurs: [moi], son: 'coups', dit: ['Si vous remontez un jour, apportez-moi trois pots de miel. Du miel de fleurs, pas de sapin.'], court: true }),
      c.plan({ dur: 5.8, cam: c.camLieu(F, { d: 40, haut: 8, dy: 2 }), heure: 10, dit: ['En échange, deux tommes. Les plus vieilles. Les meilleures.'] }),
    ];
  },
  fin(c) {
    const t = Q20H.meuble(c, 'es_fromagerie', 'table');
    const moi = Q20C.chez(c, 'estive_fromagere', { vise: t && t.P, geste: ['penche', 'leve'] });
    const mi = t ? c.chose(Q20C_DESSINS.miels, c.haut(t.P, 0.79), { s: 1.1 }) : null;
    const moi2 = Q20C.chez(c, 'estive_fromagere', { geste: ['offre', 'parle'] });
    const to = moi2 && c.chose(Q20C_DESSINS.tommes, Q20C.enMain(c, moi2, 1.0, 0.36), { r: moi2.cap, s: 0.7 });
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.7, d: 2.0, buste: true }), acteurs: [moi, mi], dit: ['Oh, qu’il sent bon. On sent la plaine, là-dedans.'], court: true }),
      c.plan({ dur: 6, cam: c.camActeur(moi2, { cote: -0.3, d: 2.1 }), acteurs: [moi2, to], dit: ['Deux tommes. Avec du pain noir, pas avec votre pain blanc de la ville !'] }),
    ];
  },
});

q20.scenes('estive_patre_1', {
  qui: 'estive_patre',
  demande(c) {
    const bc = Q20H.meuble(c, 'es_patre', 'banc');
    const M = c.maison('estive_patre');
    // (du côté de la cabane qui regarde la vallée)
    const Pl0 = c.lieu('place'), P0 = M && Pl0 ? Q20H.libre(c, c.devant(M.centre, c.cap(M.centre, Pl0.P), Math.max(M.B.W, M.B.D) / 2 + 2.2), 0, 3, 0.5) : M && M.dehors(1.6, 1.2);
    const moi = P0 ? c.habitant('estive_patre', P0, { cap: c.cap(P0, c.lieu('place') ? c.lieu('place').P : M.porte), geste: ['assis', 'leve'] }) : Q20C.chez(c, 'estive_patre');
    const Pl = c.lieu('place');
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.6, d: 2.2 }), acteurs: [moi], heure: Math.max(c.h, 17.8), dit: ['Rapportez-moi quelque chose d’en bas ! Une image, avec des couleurs. Et de la confiture.'], court: true }),
      c.plan({ dur: 5.8, cam: P0 && Pl ? c.camRegard(c.devant(P0, c.cap(P0, Pl.P), -1.2, 1.3), c.haut(Pl.P, 4), { haut: 1.5 }) : c.camLieu(Pl, { d: 60, haut: 12 }), acteurs: [moi], heure: 17.7, dit: ['Je n’en ai mangé qu’une fois. Je garderai l’image au-dessus de ma paillasse.'] }),
    ];
  },
  fin(c) {
    const moi = Q20C.chez(c, 'estive_patre', { ou: 'centre', geste: ['leve', { reach: 0.55 }] });
    const im = moi && c.chose(Q20C_DESSINS.image, Q20C.enMain(c, moi, 1.35, 0.3), { r: moi.cap, s: 1.3 });
    const moi2 = Q20H.seuil(c, 'estive_patre', { d: 0.9, geste: ['offre', 'parle'] });
    const pl = moi2 && c.chose(Q20C_DESSINS.plumes_aigle, Q20C.enMain(c, moi2, 1.0, 0.36), { r: moi2.cap });
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 0.8, d: 1.9, buste: true }), acteurs: [moi, im], dit: ['Oh… Elle est belle. Et la confiture…'], court: true }),
      c.plan({ dur: 5.8, cam: c.camActeur(moi2, { cote: 0.4, d: 2.0 }), acteurs: [moi2, pl], dit: ['Deux plumes d’aigle, du rocher de l’Aigle. Ne le dites pas au baïle : il dit que ça porte malheur.'] }),
    ];
  },
});
