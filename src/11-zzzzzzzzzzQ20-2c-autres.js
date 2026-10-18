// ============================================================================
//  LES SCÈNES DES QUÊTES (agent Q20B) — 2c. CEUX QUI PARLENT SANS ÊTRE DES HABITANTS
//  Dans la vallée : Mère Ysaure (la diseuse, sous sa tente du marché), le vieux
//  Tiennot (le violoneux, à la porte de l'auberge), Barnabé Toquet (le crieur,
//  sur la place), le voiturier du roulage Bardin (là où il livre), le marchand
//  de joie (au bord d'un chemin, certains soirs), et trois bêtes qui parlent :
//  Tibert (le chat de l'auberge, sur son tonneau), la hulotte (au chêne
//  millénaire, sur son chicot), Tiécelin (le corbeau de la Table des Géants).
//  Ils ne sont pas des habitants : leurs répliques portent leur nom (c.parole),
//  leurs silhouettes sont celles de leurs modules ; le vrai est caché pendant
//  la scène (c.masquer) ; ce qu'ils demandent se voit de loin, sans tout dire.
// ============================================================================
Object.assign(Q20_DESSINS, {
  // une carte de tarot, face contre terre (le Pendu), une tache de cire noire au dos
  carte_dos(PE) { PE.box(0, 0.003, 0, 0.07, 0.004, 0.12, [0.78, 0.66, 0.46], TL.paper, 0.4); PE.box(0.01, 0.006, 0.02, 0.022, 0.003, 0.02, [0.08, 0.07, 0.07], TL.plain, 0.4); },
  // le jeu de cartes de la diseuse, la bougie posée à côté
  jeu_cartes(PE) { PE.box(0, 0.02, 0, 0.07, 0.04, 0.12, [0.78, 0.66, 0.46], TL.paper); PE.box(0.12, 0.002, 0.02, 0.07, 0.004, 0.12, [0.78, 0.66, 0.46], TL.paper, 0.3); },
  // l'enveloppe bordée de noir ; un avis à battre
  enveloppe_noire(PE) { PE.box(0, 0.004, 0, 0.2, 0.006, 0.12, [0.1, 0.09, 0.09], TL.plain, 0.2); PE.box(0, 0.008, 0, 0.17, 0.004, 0.09, [0.9, 0.86, 0.8], TL.paper, 0.2); },
  avis(PE) { PE.box(0, 0.003, 0, 0.18, 0.005, 0.24, [1.15, 1.1, 0.92], TL.paper, 0.1); PE.box(0.05, 0.007, 0.07, 0.035, 0.003, 0.035, [0.6, 0.12, 0.12], TL.plain, 0.1); for (let k = 0; k < 6; k++) PE.box(-0.01, 0.007, -0.08 + k * 0.025, 0.12, 0.002, 0.005, [0.18, 0.16, 0.16], TL.plain, 0.1); },
  // un fer à cheval, des clous ; une pomme ; un cidre
  fer_cheval(PE) { const f = [0.55, 0.52, 0.48]; for (const s of [-1, 1]) PE.box(s * 0.05, 0.01, 0.01, 0.02, 0.012, 0.1, f, TL.iron); PE.box(0, 0.01, -0.05, 0.12, 0.012, 0.02, f, TL.iron); },
  cidre(PE) { PE.box(0, 0.11, 0, 0.08, 0.22, 0.08, [0.45, 0.62, 0.3], TL.glass); PE.box(0, 0.24, 0, 0.03, 0.05, 0.03, [0.62, 0.45, 0.3], TL.wood); },
  // des yeux dans le noir (un chat sur une tombe), une pièce ancienne
  yeux(PE) { PE.fl = FX_EMIT; for (const s of [-1, 1]) PE.box(s * 0.035, 0, 0, 0.022, 0.016, 0.01, [1.4, 1.3, 0.45], TL.plain); PE.fl = 0; },
  piece(PE) { PE.box(0, 0.006, 0, 0.045, 0.01, 0.045, [1.25, 1.0, 0.5], TL.gold); },
  // un dé à coudre d'argent, cabossé (il brille plus qu'il ne devrait)
  de_argent(PE) { PE.fl = FX_HI; PE.box(0, 0.022, 0, 0.034, 0.044, 0.034, [1.35, 1.38, 1.45], TL.metal); PE.box(0, 0.046, 0, 0.026, 0.008, 0.026, [1.2, 1.22, 1.3], TL.metal); PE.fl = 0; },
  // une plume de hulotte, qui tombe
  plume_hulotte(PE) { PE.box(0, 0.004, 0, 0.04, 0.006, 0.17, [0.62, 0.46, 0.3], TL.fur, 0.4); PE.box(0, 0.006, 0.04, 0.03, 0.004, 0.05, [0.85, 0.78, 0.65], TL.plain, 0.4); },
  // la cuillère de baptême, noircie
  cuillere(PE) { PE.box(0, 0.008, 0, 0.012, 0.008, 0.12, [0.42, 0.42, 0.46], TL.metal); PE.box(0, 0.012, 0.075, 0.035, 0.014, 0.045, [0.4, 0.4, 0.44], TL.metal); },
  // une lettre qui brûle (posée sur le feu)
  lettre_feu(PE, t) { PE.box(0, 0.004, 0, 0.18, 0.006, 0.11, [0.12, 0.1, 0.09], TL.plain, 0.2); PE.fl = FX_EMIT; const k = 0.5 + 0.5 * Math.sin((t || 0) * 9); PE.box(0.05, 0.008, 0.02, 0.08, 0.004, 0.06, [1.6 * k + 0.4, 0.55 * k + 0.2, 0.12], TL.plain, 0.2); PE.fl = 0; },
});
// des sons en plus : un air de violon qui ne finit pas ; le tambour du crieur
Object.assign(Q20_SONS, {
  violon: () => sound.hfAir && sound.hfAir([[69, 1], [72, 0.5], [71, 0.5], [69, 1], [67, 1], [64, 1.5], [67, 0.5], [69, 2], [72, 1], [74, 1], [72, 0.5], [71, 0.5], [69, 3]], { bpm: 84, timbre: 'violon', vol: 0.045, bus: 'amb' }),
  violon_loin: () => sound.hfAir && sound.hfAir([[64, 1.5], [67, 0.5], [69, 1], [71, 1], [69, 1.5], [null, 2], [72, 0.75]], { bpm: 62, timbre: 'violon', vol: 0.018, bus: 'amb' }),
  tambour: () => sound.tambour && sound.tambour(),
});

const Q20BA = {
  // la tente de la diseuse : elle, assise à sa table, la bougie ; { D (sa place), moi, lum }
  diseuse(c, geste) {
    const D = Q20B.act('diseuse');
    if (!D) return null;
    c.masquer('diseuse');
    const P = c.pt(D.x, D.z, D.y);
    const moi = c.gens('diseuse', P, { cap: D.h, geste: ['assis'].concat(geste || []) });
    const bg = [D.x + Math.sin(D.h) * 0.8, D.y, D.z + Math.cos(D.h) * 0.8];
    return { D, P, moi, lum: [Q20B.flamme(c, bg, 3, 0.9)], bg };
  },
  // les figures de la place (le violoneux, le crieur) : là où leur module les pose
  figure(c, k, cle, geste, o) {
    const F = Q20B.act(k);
    if (!F) return null;
    c.masquer(cle);
    return c.gens(cle, c.pt(F.x, F.z, F.y), Object.assign({ cap: F.h, geste }, o));
  },
  // le voiturier, sa charrette, sa jument : là où il est (sa tournée), sinon au point de livraison
  voiturier(c) {
    const T = typeof commandes !== 'undefined' && commandes.tour;
    c.masquer('voiturier');
    let car = null, h = null;
    if (T && T.car && T.h && !c.rejeu) { car = [T.car.x, T.car.y, T.car.z, T.car.r]; h = [T.h.x, T.h.y, T.h.z, T.h.r]; }
    else {
      let L = null;
      try { L = commandes.lieu(); } catch (e) { L = null; }
      const B = c.w.bld.ferme, P0 = L ? c.pt(L.x, L.z) : B ? c.pt(B.out[0], B.out[1]) : c.lieu('ferme').P;
      // (de la place pour la charrette, la jument devant elle, et lui à côté : pas contre un mur)
      const P1 = Q20H.libre(c, c.devant(P0, 0.4, 6), 0, 12, 2.4);
      const ok = (Q, rad) => { try { return qtSol(c.w, Q[0], Q[2], rad, { buissons: true }); } catch (e) { return true; } };
      let r = c.cap(P1, P0) + Math.PI / 2;
      for (let k = 0; k < 8; k++) {
        const a = r + k * Math.PI / 4, H = Q20B.devant(c, P1, a, 2.6, 0);
        if (ok(H, 1.1) && (ok(Q20B.devant(c, H, a + Math.PI / 2, 1.3, 0), 0.5) || ok(Q20B.devant(c, H, a - Math.PI / 2, 1.3, 0), 0.5))) { r = a; break; }
      }
      h = [...Q20B.devant(c, P1, r, 2.6, 0), r];
      car = [P1[0], P1[1], P1[2], r];
    }
    const ch = c.chose('charrette', [car[0], car[1], car[2]], { r: car[3] });
    const jument = c.bete('horse', [h[0], h[1], h[2]], { v: 2, cap: h[3], geste: { lookP: 0.25 } });
    // (de quel côté de la jument il se tient : celui où il y a de la place)
    let cote = 1;
    try { const H = [h[0], h[1], h[2]], Q = Q20B.devant(c, H, h[3] + Math.PI / 2, 1.3, 0); if (!qtSol(c.w, Q[0], Q[2], 0.5, { buissons: true })) cote = -1; } catch (e) { cote = 1; }
    return { ch, jument, H: [h[0], h[1], h[2]], cap: h[3], car: [car[0], car[1], car[2]], cote };
  },
  // le marchand de joie : au bord du chemin où il attend ce soir, sinon au bord d'un chemin près du joueur
  marchand(c) {
    const M = typeof pilules !== 'undefined' && pilules.m;
    let P = null;
    if (M && !c.rejeu) P = c.pt(M.x, M.z);
    else {
      const p = game.player, w = c.w;
      let best = null;
      for (const q of (w.nav && w.nav.nodes) || []) {
        if (!/chemin|route/.test(q.tag) || q.iso) continue;
        const d = Math.hypot(q.x - p.pos[0], q.z - p.pos[2]);
        if (!best || Math.abs(d - 40) < Math.abs(best.d - 40)) best = { q, d };
      }
      P = best ? c.pt(best.q.x + 1.6, best.q.z + 0.8) : c.lieu('place').P;
    }
    c.masquer('marchand_joie');
    return P;
  },
  // une bête qui parle, à sa place
  bete(c, id, o) {
    const L = Q20B.lieuBete(id);
    if (!L) return null;
    const P = [L.x, L.y, L.z];
    return { L, P, A: Q20B.bete(c, id, P, Object.assign({ cap: L.cap || 0 }, o)) };
  },
};

// ============================================================================ MÈRE YSAURE (la diseuse, sous sa tente du marché)
q20.scenes('q16_diseuse_1', {
  qui: 'diseuse',
  demande(c) {
    const T = Q20BA.diseuse(c, ['travaille', { lookP: 0.3 }]);
    if (!T) return null;
    const nom = Q20B.nom('diseuse');
    const jeu = c.chose(Q20_DESSINS.jeu_cartes, c.haut(c.devant(T.P, T.D.h, 0.45, 0.1, true), 0.62), { s: 1.4, r: T.D.h });
    const Ci = c.lieu('cimetiere');
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(T.moi, { cote: 0.1, d: 2.8, haut: 1.3 }), acteurs: [T.moi, jeu], lum: T.lum, dit: c.parole('Mon jeu a soixante-dix-sept cartes. Il en avait soixante-dix-huit.', nom, 0.8), court: true }),
      Ci && c.plan({ dur: 6.2, cam: c.camLieu(Ci, { d: 22, haut: 3, dy: 1 }), heure: c.h > 18.8 && c.h < 21 ? c.h : 18.8, lum: [Q20B.lune(c, Ci)], dit: c.parole('Le Pendu, je l’ai perdu au cimetière, le soir où j’ai tiré les cartes pour une morte. Il ne faut pas lui laisser le Pendu.', nom, 0.8) }),
    ];
  },
  tournant(c) { return Q20H.trouvaille(c, Q20_DESSINS.carte_dos, { s: 2.0, son: 'murmure', dy2: 1 }); },
  fin(c) {
    const T = Q20BA.diseuse(c, ['travaille', { lookP: 0.1 }]);
    if (!T) return null;
    const nom = Q20B.nom('diseuse');
    const jeu = c.chose(Q20_DESSINS.jeu_cartes, c.haut(c.devant(T.P, T.D.h, 0.45, 0.1, true), 0.62), { s: 1.4, r: T.D.h });
    const T2 = Q20BA.diseuse(c, [{ lookP: -0.1 }, 'parle']);
    T2.moi.regard = 'camera';
    return [
      c.plan({ dur: 6, cam: c.camActeur(T.moi, { cote: 0.5, d: 1.9, buste: true }), acteurs: [T.moi, jeu], lum: T.lum, son: 'page', dit: c.parole('Le voilà.', nom, 0.8), court: true }),
      c.plan({ dur: 6.4, cam: c.camActeur(T2.moi, { cote: 0.05, d: 1.7 }), acteurs: [T2.moi, jeu], lum: T2.lum, son: 'piece', dit: c.parole('Tu as remarqué qu’il souriait ? Il ne souriait pas, avant.', nom, 0.8) }),
    ];
  },
});

q20.scenes('q16_diseuse_2', {
  qui: 'diseuse',
  demande(c) {
    const T = Q20BA.diseuse(c, ['tend', { lookP: 0.2 }]);
    if (!T) return null;
    const nom = Q20B.nom('diseuse');
    const env = c.chose(Q20_DESSINS.enveloppe_noire, c.haut(c.devant(T.P, T.D.h, 0.42, 0.05, true), 0.66), { s: 1.4, r: T.D.h });
    const H = c.lieu('hutte_ermite');
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(T.moi, { cote: 0.2, d: 2.0, buste: true }), acteurs: [T.moi, env], lum: T.lum, dit: c.parole('La morte du cimetière m’a dicté une lettre, la nuit dernière. Pour la femme des bois.', nom, 0.8), court: true }),
      H && c.plan({ dur: 6.2, cam: c.camLieu(H, { d: 22, haut: 3, dy: 1.5 }), dit: c.parole('Nous nous sommes tout dit, elle et moi, il y a quarante ans. Ne l’ouvre pas : elle n’est pas fermée pour toi.', nom, 0.8) }),
    ];
  },
  tournant(c) {
    const ch = Q20H.meuble(c, 'hutte_ermite', 'cheminee') || Q20H.meuble(c, 'hutte_ermite', 'four');
    const moi = Q20H.poste(c, 'guerisseuse', { vise: ch && ch.P, geste: ['tend', 'baisse'] });
    const moi2 = Q20H.poste(c, 'guerisseuse', { vise: ch && ch.P, geste: ['raide', 'baisse'] });
    const fe = ch && c.chose(Q20_DESSINS.lettre_feu, c.haut(c.devant(ch.P, ch.r || 0, 0.2, 0, true), 0.15), { s: 1.4, r: 0.3 });
    const lum = ch ? [c.lueur(ch.P, 4.5, [1.0, 0.5, 0.2], 0.5)] : q20Bougies(c);
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.8, d: 2.1, buste: true }), acteurs: [moi], lum, dit: ['Une lettre d’Ysaure ? Elle sait que je ne lis pas… Pose-la sur le feu.', '@guerisseuse'] }),
      c.plan({ dur: 6, cam: ch ? c.camChose(c.haut(ch.P, 0.2), { d: 1.6, dy: 0.1 }) : c.camActeur(moi2, { cote: -0.6, d: 2.2 }), acteurs: [moi2, fe], lum, chaque: ch ? Q20H.emet(c.haut(ch.P, 0.4), { n: 10, col: [1.4, 0.7, 0.25, 0.9], taille: 0.03, vie: 0.9, v: 0.3, vy: 0.8, eclat: true }) : null, dit: ['Voilà. C’est comme ça qu’on les lit, celles-là.', '@guerisseuse'] }),
    ];
  },
  fin(c) {
    const T = Q20BA.diseuse(c, [{ lookP: 0.1 }, 'parle']);
    if (!T) return null;
    const nom = Q20B.nom('diseuse');
    const T2 = Q20BA.diseuse(c, ['travaille', { lookP: 0.45 }]);
    const jeu = c.chose(Q20_DESSINS.jeu_cartes, c.haut(c.devant(T.P, T.D.h, 0.45, 0.1, true), 0.62), { s: 1.4, r: T.D.h });
    return [
      c.plan({ dur: 6, cam: c.camActeur(T.moi, { cote: 0.25, d: 2.0 }), acteurs: [T.moi, jeu], lum: T.lum, dit: c.parole('Brûlée ? Alors elle est arrivée.', nom, 0.8), court: true }),
      c.plan({ dur: 6, cam: c.camChose(c.haut(c.devant(T.P, T.D.h, 0.45, 0.1, true), 0.62), { d: 1.4, dy: 0.05, a: T.D.h + 0.4 }), acteurs: [T2.moi, jeu], lum: T2.lum, son: 'page', dit: null }),
    ];
  },
});

// ============================================================================ LE VIEUX TIENNOT (le violoneux, à la porte de l'auberge)
q20.scenes('q16_violoneux_1', {
  qui: 'violoneux',
  delais: { tournant: 2 },
  demande(c) {
    const nom = Q20B.nom('violoneux');
    const moi = Q20BA.figure(c, 'violon', 'violoneux', ['travaille', { lookY: 0.4 }]);
    const moi2 = Q20BA.figure(c, 'violon', 'violoneux', ['parle', { lookP: 0.2 }]);
    const Ch = c.lieu('chapelle');
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.5, d: 2.6 }), acteurs: [moi], son: 'violon', dit: c.parole('Il y a un air que je ne sais pas finir. Je l’ai entendu une fois, à la chapelle, la nuit.', nom, 0.75), court: true }),
      moi2 && c.plan({ dur: 5, cam: c.camActeur(moi2, { cote: -0.3, d: 2.0 }), acteurs: [moi2], dit: c.parole('Un violon, sans personne. Va l’écouter, et reviens me fredonner la fin.', nom, 0.75) }),
      Ch && c.plan({ dur: 5, cam: c.camLieu(Ch, { d: 28, haut: 4, dy: 3 }), heure: c.heure('nuit'), lum: [Q20B.lune(c, Ch)], son: 'violon_loin', dit: c.parole('Ne chante pas avec. Écoute seulement.', nom, 0.75) }),
    ];
  },
  tournant(c) {
    const Ch = c.lieu('chapelle');
    if (!Ch) return null;
    const au = Q20H.pres(c, Ch.P, 'autel', 14), bg = Q20H.pres(c, Ch.P, 'bougie', 14);
    const P = au ? au.P : Ch.P;
    const J = c.joueur(Q20H.libre(c, c.devant(P, (au && au.r) || 0, 3.2), 0, 3, 0.5), { face: P, geste: 'raide' });
    const J0 = Object.assign({}, J, { vu: false });
    const lum = bg ? [c.lueur(bg.P, 3.2, [1.0, 0.68, 0.32], 0.3)] : [];
    return [
      c.plan({ dur: 6.6, cam: c.camChose(c.haut(P, 0.9), { d: 3, haut: 1.4, dy: 0, a: ((au && au.r) || 0) + 0.5, recul: 0.15 }), heure: c.heure('nuit'), acteurs: [J0], lum, son: 'violon_loin' }),
      c.plan({ dur: 5.2, cam: c.camActeur(J, { cote: 0.5, d: 2.6, buste: true }), heure: c.heure('nuit'), acteurs: [J], lum }),
    ];
  },
  fin(c) {
    const nom = Q20B.nom('violoneux');
    const moi = Q20BA.figure(c, 'violon', 'violoneux', ['raide', { lookP: 0.1 }]);
    moi && (moi.regard = 'camera');
    const moi2 = Q20BA.figure(c, 'violon', 'violoneux', ['offre', 'parle']);
    const ci = moi2 && c.chose(Q20_DESSINS.cidre, c.haut(c.devant(moi2.P, moi2.cap, 0.38, 0.08, true), 0.98), { s: 1.2 });
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 0.1, d: 2.0 }), acteurs: [moi], dit: c.parole('Rien ne sort ? … Tu as les lèvres bleues. Assieds-toi.', nom, 0.75), court: true }),
      moi2 && c.plan({ dur: 5.8, cam: c.camActeur(moi2, { cote: 0.6, d: 2.4, buste: true }), acteurs: [moi2, ci, Q20H.face(c, moi2, 1.4, 0.3)], son: 'violon', dit: c.parole('Je jouerai autre chose. Tiens, un cidre.', nom, 0.75) }),
    ];
  },
});

// ============================================================================ BARNABÉ TOQUET (le crieur, sur la place ; l'avis qu'on lui donne chaque année)
q20.scenes('q16_crieur_1', {
  qui: 'crieur',
  demande(c) {
    const nom = Q20B.nom('crieur');
    const moi = Q20BA.figure(c, 'crieur', 'crieur', ['tend', 'parle']);
    const av = moi && c.chose(Q20_DESSINS.avis, c.haut(c.devant(moi.P, moi.cap, 0.4, 0.08, true), 1.18), { s: 1.3, r: moi.cap });
    const Mg = c.maison('garde_champetre');
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 0.5, d: 2.6, buste: true }), acteurs: [moi, av], son: 'tambour', dit: c.parole('Mon collègue du hameau a le tambour aussi. Portez-lui cet avis, qu’il le batte là-bas.', nom, 0.85), court: true }),
      Mg && c.plan({ dur: 6, cam: c.camLieu(Mg.porte, { d: 18, haut: 3, dy: 1.8, a: Mg.cap + 0.5 }), dit: c.parole('La mairie me le donne chaque année, au même jour. En main propre : les avis, ça s’égare.', nom, 0.85) }),
    ];
  },
  tournant(c) {
    const Mg = c.maison('garde_champetre');
    const moi = Q20H.seuil(c, 'garde_champetre', { d: 1.0, geste: ['baisse', { reach: 0.3 }] });
    const av = moi && c.chose(Q20_DESSINS.avis, c.haut(c.devant(moi.P, moi.cap, 0.36, 0.05), 1.18), { s: 1.3, r: moi.cap });
    const tb = Q20H.meuble(c, 'g1_cabane_hameau', 'g1_tambour');
    const moi2 = Q20H.seuil(c, 'garde_champetre', { d: 2.2, geste: ['travaille'] });
    const tam = moi2 && c.chose('g1_tambour', c.haut(c.devant(moi2.P, moi2.cap, 0.4, 0), 0.55), { r: moi2.cap });
    const loin = moi2 && Q20H.libre(c, c.devant(moi2.P, moi2.cap + 0.5, 26), 0, 8, 0.6);
    const enf = loin && c.gens('enfant_perdu', loin, { face: moi2.P, geste: 'raide', vu: false });
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.4, d: 2.2, buste: true }), acteurs: [moi, av], dit: ['« Avis. On a perdu un enfant, un soir de 1868. Qui l’a trouvé est prié de le rendre. »', '@garde_champetre'] }),
      moi2 && c.plan({ dur: 6, cam: c.camActeur(moi2, { cote: Math.PI + 0.25, d: 2.9, haut: 1.75 }), heure: Math.max(c.h, 18.8), acteurs: [moi2, tam, enf], son: 'tambour', dit: ['C’est le même chaque année. Je le bats quand même. On ne sait jamais qui écoute.', '@garde_champetre'] }),
    ];
  },
  fin(c) {
    const nom = Q20B.nom('crieur');
    const moi = Q20BA.figure(c, 'crieur', 'crieur', ['hoche', 'parle']);
    const moi2 = Q20BA.figure(c, 'crieur', 'crieur', ['travaille', { lookP: 0.4 }]);
    return [
      c.plan({ dur: 5.8, cam: c.camActeur(moi, { cote: 0.4, d: 2.4 }), acteurs: [moi], dit: c.parole('Il l’a battu ? Bien.', nom, 0.85), court: true }),
      moi2 && c.plan({ dur: 6.2, cam: c.camActeur(moi2, { cote: 1.0, d: 2.2, buste: true }), acteurs: [moi2], son: 'tambour', dit: c.parole('Un jour, quelqu’un répondra.', nom, 0.85) }),
    ];
  },
});

// ============================================================================ LE VOITURIER (le roulage Bardin ; sa jument a perdu un fer)
q20.scenes('q16_voiturier_1', {
  qui: 'voiturier',
  demande(c) {
    const V = Q20BA.voiturier(c), nom = Q20B.nom('voiturier');
    const P0 = Q20B.devant(c, V.H, V.cap + V.cote * Math.PI / 2, 1.3, 0);
    const moi = c.gens('voiturier', P0, { face: V.H, geste: ['penche', { reach: 0.3 }] });
    const sabot = c.devant(V.H, V.cap, -0.5, 0.2, true);
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 0.9, d: 3.4, avec: V.H, k: 0.45 }), heure: c.heure('matin'), acteurs: [moi, V.jument, V.ch], son: 'cheval', dit: c.parole('Ma jument a perdu un fer sur la route, en venant. Elle boite, la pauvre.', nom, 0.9), court: true }),
      c.plan({ dur: 5.8, cam: c.camChose(sabot, { d: 1.8, haut: 0.95, dy: 0.2, a: V.cap + V.cote * 1.4 }), heure: c.heure('matin'), acteurs: [V.jument, moi], dit: c.parole('Un fer, si vous en avez un, et je repars d’aplomb. Je repasse demain, de toute façon.', nom, 0.9) }),
    ];
  },
  fin(c) {
    const V = Q20BA.voiturier(c), nom = Q20B.nom('voiturier');
    const P0 = Q20B.devant(c, V.H, V.cap + V.cote * Math.PI / 2, 1.0, -0.4);
    const moi = c.gens('voiturier', P0, { face: V.H, geste: ['travaille'], main: 'marteau' });
    const moi2 = c.gens('voiturier', Q20B.devant(c, V.H, V.cap + V.cote * Math.PI / 2, 1.6, 0.6), { face: 'camera', geste: ['offre', 'parle'] });
    const cl = c.chose(Q20_DESSINS.fer_cheval, c.haut(c.devant(moi2.P, moi2.cap, 0.36, 0.06, true), 1.05), { s: 1.3 });
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 1.1, d: 2.8, avec: V.H, k: 0.4 }), heure: c.heure('matin'), acteurs: [moi, V.jument, V.ch], son: 'enclume', dit: c.parole('Bouge pas, ma belle. Là. Te voilà d’aplomb.', nom, 0.9), court: true }),
      c.plan({ dur: 5.6, cam: c.camActeur(moi2, { cote: 0.3, d: 2.4, buste: true }), heure: c.heure('matin'), acteurs: [moi2, cl, V.jument], son: 'piece', dit: c.parole('Merci bien. Tenez, des clous, pour la peine.', nom, 0.9) }),
    ];
  },
});

// ============================================================================ LE MARCHAND DE JOIE (redingote verte, au bord d'un chemin, certains soirs)
q20.scenes('q16_marchand_joie_1', {
  qui: 'marchand_joie',
  demande(c) {
    const P = Q20BA.marchand(c), nom = Q20B.nom('marchand_joie');
    const E = c.maison('cure');
    const moi = c.gens('marchand_joie', P, { face: E.porte, geste: ['parle', { lookY: -0.5 }], regard: 'camera' });
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 0.2, d: 2.6 }), heure: Math.max(c.h, 19.4), acteurs: [moi], dit: c.parole('Dites au curé que je suis revenu. Juste ça. Il comprendra.', nom, 1.1), court: true }),
      c.plan({ dur: 6, cam: c.camLieu(E.porte, { d: 24, haut: 5, dy: 5, a: E.cap + 0.3 }), heure: Math.max(c.h, 19.6), son: 'cloche', dit: c.parole('Et regardez ses mains, quand vous le lui direz.', nom, 1.1) }),
    ];
  },
  tournant(c) {
    const moi = Q20H.poste(c, 'cure', { geste: ['raide', { reach: 0.2, lookP: 0.4 }] });
    const moi2 = Q20H.seuil(c, 'cure', { d: 0.6, geste: ['bras', 'parle'] });
    const cierges = qtPropsDans(c.w, 'eglise', (q) => q.id === 'bougie').slice(0, 2).map((q) => c.lueur([q.x, q.y, q.z], 3.5, [1.0, 0.7, 0.35], 0.3));
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.5, d: 1.8, buste: true }), acteurs: [moi], lum: cierges, dit: ['Revenu ? … Il était déjà là quand j’étais enfant. Avec la même redingote verte.', '@cure'] }),
      c.plan({ dur: 5.6, cam: c.camActeur(moi2, { cote: 0.4, d: 2.8 }), heure: Math.max(c.h, 19.5), acteurs: [moi2], son: 'porte', dit: ['Dites-lui que l’église lui reste fermée.', '@cure'] }),
    ];
  },
  fin(c) {
    const P = Q20BA.marchand(c), nom = Q20B.nom('marchand_joie');
    const moi = c.gens('marchand_joie', P, { cap: 0, geste: ['hoche'], regard: 'camera' });
    const moi2 = c.gens('marchand_joie', P, { cap: 0, geste: ['offre', 'parle'] });
    const pi = c.chose(Q20_DESSINS.piece, c.haut(c.devant(P, 0, 0.38, 0.08, true), 1.08), { s: 1.6 });
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.15, d: 2.2 }), heure: Math.max(c.h, 19.6), acteurs: [moi], dit: c.parole('Fermée. Bien sûr. Elle l’était déjà.', nom, 1.1), court: true }),
      c.plan({ dur: 5.8, cam: c.camActeur(moi2, { cote: 0.6, d: 2.6, buste: true }), heure: Math.max(c.h, 19.8), acteurs: [moi2, pi, Q20H.face(c, moi2, 1.5, 0.3)], son: 'piece', dit: c.parole('Tenez, pour la commission.', nom, 1.1) }),
    ];
  },
});

// ============================================================================ TIBERT (le chat gris de l'auberge, sur son tonneau)
q20.scenes('q16_bete_chat_1', {
  qui: 'bete:chat',
  delais: { tournant: 2 },
  demande(c) {
    const T = Q20BA.bete(c, 'chat', { parle: true }), nom = Q20B.nom('bete:chat');
    if (!T) return null;
    const Ci = c.lieu('cimetiere');
    return [
      c.plan({ dur: 6.4, cam: c.camChose(T.P, { d: 1.7, haut: 1.0, dy: 0.25, a: (T.L.cap || 0) + 0.5, recul: 0.12 }), heure: Math.max(c.h, 20.5), acteurs: [T.A], lum: [Q20B.flamme(c, T.P, 4, 1.4)], dit: c.parole('Les chats de la ville se réunissent au cimetière, les nuits sans lune. Je n’y vais plus, depuis… une affaire.', nom), court: true }),
      Ci && c.plan({ dur: 6, cam: c.camLieu(Ci, { d: 20, haut: 2.6, dy: 1 }), heure: c.h > 20.5 && c.h < 21.4 ? c.h : 21.2, lum: [Q20B.lune(c, Ci)], dit: c.parole('Allez voir s’ils m’attendent encore. Comptez-les. S’ils sont treize, partez.', nom) }),
    ];
  },
  tournant(c) {
    const Ci = c.lieu('cimetiere');
    if (!Ci) return null;
    const T = qtProps(c.w, Ci.x, Ci.z, 16, (q) => q.id === 'tombe').sort((a, b) => Math.hypot(a.x - Ci.x, a.z - Ci.z) - Math.hypot(b.x - Ci.x, b.z - Ci.z));
    const mil = T[0] ? [T[0].x, T[0].y, T[0].z] : Ci.P;
    const yeux = T.slice(1, 13).map((q, i) => c.chose(Q20_DESSINS.yeux, [q.x, q.y + 0.75 + (i % 3) * 0.05, q.z], { r: c.cap([q.x, 0, q.z], mil) + (i % 2 ? 0.3 : -0.2), s: 1.6 }));
    const chats = T.slice(1, 4).map((q, i) => c.bete('cat', [q.x, q.y + 0.5, q.z], { v: i, cap: c.cap([q.x, 0, q.z], mil), geste: { lie: 0.6 } }));
    return [
      c.plan({ dur: 6.6, cam: c.camLieu(mil, { d: 9, haut: 1.6, dy: 0.6, recul: 0.12 }), heure: c.heure('nuit'), acteurs: [...yeux, ...chats] }),
      c.plan({ dur: 5.2, cam: c.camChose(mil, { d: 2.4, haut: 1.0, dy: 0.5 }), heure: c.heure('nuit'), acteurs: [...yeux, ...chats], son: 'murmure' }),
    ];
  },
  fin(c) {
    const T = Q20BA.bete(c, 'chat', { parle: true }), nom = Q20B.nom('bete:chat');
    if (!T) return null;
    const pi = c.chose(Q20_DESSINS.piece, c.devant(T.P, (T.L.cap || 0) + 0.4, 0.8, 0), { s: 1.6 });
    pi.P[1] = c.sol(pi.P[0], pi.P[2]);
    return [
      c.plan({ dur: 6.2, cam: c.camChose(T.P, { d: 1.6, haut: 1.0, dy: 0.25, a: (T.L.cap || 0) + 0.3 }), heure: Math.max(c.h, 20.5), acteurs: [T.A], lum: [Q20B.flamme(c, T.P, 4, 1.4)], dit: c.parole('Une place vide. Ils m’attendent encore… Bien. Qu’ils attendent.', nom), court: true }),
      c.plan({ dur: 5.6, cam: c.camChose(pi.P, { d: 1.5, haut: 0.95, dy: 0.05, a: (T.L.cap || 0) + 1.0 }), heure: Math.max(c.h, 20.5), acteurs: [T.A, pi], lum: [Q20B.flamme(c, T.P, 4, 1.4)], son: 'piece', dit: c.parole('Je l’ai trouvée sous un tonneau. Les pièces n’intéressent pas les chats.', nom) }),
    ];
  },
});

// ============================================================================ LA HULOTTE (au chêne millénaire, sur son chicot pourri)
q20.scenes('q16_bete_hulotte_1', {
  qui: 'bete:hulotte',
  demande(c) {
    const T = Q20BA.bete(c, 'hulotte', { parle: true }), nom = Q20B.nom('bete:hulotte');
    if (!T) return null;
    const Ch = c.lieu('chene');
    // (la nuit tombée, pas la nuit noire : on la voit encore sur son chicot)
    const hn = c.h >= 20.6 && c.h < 22 ? c.h : 21.2, lune = [c.lueur(T.P, 8, [0.56, 0.62, 0.82], 1.6)];
    return [
      c.plan({ dur: 6.4, cam: c.camChose(T.P, { d: 2.4, haut: 0.4, dy: 0.2, a: (T.L.cap || 0) + 0.4, recul: 0.1, ign: Ch ? [Ch.x, Ch.z] : null }), heure: hn, acteurs: [T.A], lum: lune, son: 'hibou', dit: c.parole('Mon chicot est pourri jusqu’au cœur. Il tombera avant l’hiver.', nom), court: true }),
      c.plan({ dur: 6, cam: c.camChose(T.P, { d: 4.4, haut: 0.2, dy: -0.6, a: (T.L.cap || 0) + 1.2, ign: Ch ? [Ch.x, Ch.z] : null }), heure: hn, acteurs: [T.A], lum: lune, dit: c.parole('Toi, tu sais faire des boîtes avec un trou rond. Fais-en une. Un trou large : je ne suis pas une mésange.', nom) }),
    ];
  },
  fin(c) {
    const T = Q20BA.bete(c, 'hulotte', {}), nom = Q20B.nom('bete:hulotte');
    if (!T) return null;
    const Ch = c.lieu('chene');
    const pn = Q20H.libre(c, c.devant(c.pt(T.P[0], T.P[2]), (T.L.cap || 0) + 0.8, 2.2), 0, 3, 0.4);
    // (le nichoir a son poteau : la boîte à hauteur d'homme, son trou rond de notre côté)
    const ni = c.chose('nichoir', pn, { r: c.cap(T.P, pn) });
    const hn = c.h >= 20.6 && c.h < 22 ? c.h : 21.2, lune = [c.lueur(Q20B.devant(c, pn, c.cap(T.P, pn), 1.4, 0), 8, [0.56, 0.62, 0.82], 2.2)];
    const pl = c.chose(Q20_DESSINS.plume_hulotte, c.haut(Q20B.devant(c, pn, (T.L.cap || 0) + 2.4, 0.9, 0), 0.01), { s: 1.6, r: 0.6 });
    return [
      c.plan({ dur: 6.4, cam: c.camChose(c.haut(pn, 1.9), { d: 3.2, haut: 0.2, dy: 0, a: c.cap(T.P, pn) + 0.35 }), heure: hn, acteurs: [ni, T.A], lum: lune, dit: c.parole('Pas mal. Pour une main.', nom), court: true }),
      c.plan({ dur: 5.6, cam: c.camChose(pl.P, { d: 1.6, haut: 0.95, dy: 0.02 }), heure: hn, acteurs: [pl, ni], lum: lune, son: 'hibou', chaque: Q20H.emet(c.haut(pl.P, 1.6), { n: 2, col: [0.62, 0.46, 0.3, 0.9], taille: 0.03, vie: 2.2, v: 0.15, vy: -0.6, grav: 0.3 }), dit: c.parole('Je ne dirai à personne que j’ai demandé.', nom) }),
    ];
  },
});

// ============================================================================ TIÉCELIN (le corbeau de la Table des Géants) ; le dé chez les Demoiselles
q20.scenes('q16_bete_corbeau_1', {
  qui: 'bete:corbeau',
  demande(c) {
    const T = Q20BA.bete(c, 'corbeau', { parle: true }), nom = Q20B.nom('bete:corbeau');
    if (!T) return null;
    const Me = c.lieu('menhirs');
    return [
      c.plan({ dur: 6.2, cam: c.camChose(T.P, { d: 2.2, haut: 0.5, dy: 0.2, a: (T.L.cap || 0) + 0.5, recul: 0.1 }), heure: Math.min(Math.max(c.h, 9), 17), acteurs: [T.A], son: 'corbeau', dit: c.parole('J’ai caché une chose qui brille sous une pierre des Demoiselles, et je ne sais plus laquelle.', nom), court: true }),
      Me && c.plan({ dur: 6.2, cam: c.camLieu(Me, { d: 28, haut: 3.5, dy: 1.6 }), heure: Math.min(Math.max(c.h, 9), 17), dit: c.parole('Elles se ressemblent toutes, ces pierres. Elles le font exprès. Un dé, en argent. Ne le mets pas à ton doigt.', nom) }),
    ];
  },
  tournant(c) { return Q20H.trouvaille(c, Q20_DESSINS.de_argent, { s: 2.0, son: 'clochette', dy2: 1.6 }); },
  fins: {
    0: (c) => {
      const T = Q20BA.bete(c, 'corbeau', { parle: true }), nom = Q20B.nom('bete:corbeau');
      if (!T) return null;
      const de = c.chose(Q20_DESSINS.de_argent, c.devant(T.P, (T.L.cap || 0), 0.25, 0, true), { s: 1.4 });
      const pis = [0, 1].map((k) => c.chose(Q20_DESSINS.piece, c.devant(T.P, (T.L.cap || 0) + 0.3 * (k ? 1 : -1), 0.45, 0, true), { s: 1.5 }));
      return [
        c.plan({ dur: 6, cam: c.camChose(T.P, { d: 1.9, haut: 0.5, dy: 0.15, a: (T.L.cap || 0) + 0.6 }), acteurs: [T.A, de], dit: c.parole('Tu es moins bête qu’un homme. Un peu.', nom), court: true }),
        c.plan({ dur: 5.8, cam: c.camChose(T.P, { d: 2.4, haut: 0.4, dy: 0.05, a: (T.L.cap || 0) - 0.5 }), acteurs: [T.A, ...pis], son: 'piece', dit: null }),
      ];
    },
    1: (c) => {
      const T = Q20BA.bete(c, 'corbeau', {}), nom = Q20B.nom('bete:corbeau');
      if (!T) return null;
      const T2 = Q20BA.bete(c, 'corbeau', { parle: true });
      return [
        c.plan({ dur: 6, cam: c.camChose(T.P, { d: 2.0, haut: 0.45, dy: 0.15, a: (T.L.cap || 0) + 0.2 }), acteurs: [T.A], dit: c.parole('Garde-le.', nom), court: true }),
        c.plan({ dur: 6.2, cam: c.camChose(T2.P, { d: 1.5, haut: 0.4, dy: 0.2, a: (T2.L.cap || 0) + 0.05, recul: 0.15 }), acteurs: [T2.A], son: 'corbeau', dit: c.parole('Je m’en souviendrai. Les corbeaux se souviennent de tout : c’est pour ça qu’on nous déteste.', nom) }),
      ];
    },
  },
});
