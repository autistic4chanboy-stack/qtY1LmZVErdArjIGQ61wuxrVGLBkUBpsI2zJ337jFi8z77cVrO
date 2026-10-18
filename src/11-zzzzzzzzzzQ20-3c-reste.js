// ============================================================================
//  LES SCÈNES DES QUÊTES (agent Q20C) — 3c. LES QUÊTES T, ENRICHIES
//  Les cinq quêtes à lieux précis (11-zzzzT-1-quetes.js) ont leurs scènes :
//  chaque étape montre son lieu (11-zzzzT-2-scenes.js), la fin choisie un
//  dernier plan, avec son texte. Personne n'y paraît. On ajoute, sans rien y
//  changer (ni à leurs scènes, ni à leurs souvenirs) :
//  - la demande : celui qui la propose, chez lui, à sa façon (l'aubergiste à
//    son comptoir, le docteur des Sources), ou la chose qui la propose (la
//    lettre de Marie Lemarié, l'avis de la mairie, la crécelle devant le
//    relais) ; elle passe AVANT la scène de la première étape ;
//  - le dénouement de chaque fin, avec les gens (l'aubergiste au pied de
//    l'escalier, le maire et sa caisse pour Lyon, le curé, le chasseur et la
//    crécelle de son père, le docteur et son registre…), après le dernier plan
//    de la quête et la phrase qui le suit.
//  État : celui de la quête (quetes.q(id) : st, fin) ; déclencheurs : quetes.accepter
//  et quetes.finir, emballés.
// ============================================================================
const Q20C_T = {
  t1: { qui: 'aubergiste' }, t2: { souv: 'q20c:lettre' }, t3: { souv: 'q20c:avis' }, t4: { souv: 'q20c:objet' }, t5: { qui: 'naturiste_b' },
};
function q20cT(id) { try { return typeof quetes !== 'undefined' && farm.s ? quetes.q(id) : null; } catch (e) { return null; } }
function q20cTEtat(id) {
  const q = q20cT(id), D = typeof QT_QUETES !== 'undefined' && QT_QUETES[id];
  const titre = D ? D.titre : id;
  if (!q) return q20cE(titre, null, false, false);
  const vu = q.st === 'actif' || q.st === 'fini' || q.st === 'abandon';
  return q20cE(titre, vu ? q : null, q.st === 'actif', q.st === 'fini', q.st === 'fini' ? q.fin || null : null);
}
// le lieu d'une étape (ce que vise la quête), posé au sol
function q20cTLieu(c, k) { try { const S = quetes.spec(k); return S && S.p ? [S.p[0], c.sol(S.p[0], S.p[2], S.lieu && S.lieu.sol), S.p[2]] : null; } catch (e) { return null; } }
const Q20C_D3 = {
  // une crécelle de rabatteur, au manche gravé
  crecelle(PE) { const g = [0.62, 0.58, 0.52]; PE.box(0, 0.02, 0, 0.03, 0.03, 0.24, g, TL.wood, 0.3); PE.box(0, 0.05, -0.1, 0.1, 0.1, 0.03, g, TL.wood, 0.3); PE.box(0, 0.05, -0.1, 0.12, 0.012, 0.012, [0.5, 0.46, 0.4], TL.wood, 0.3); },
  // la lettre de Marie Lemarié, et son enveloppe
  lettre(PE) { PE.box(0, 0.004, 0, 0.2, 0.006, 0.26, [1.1, 1.04, 0.86], TL.paper, 0.2); for (let k = 0; k < 8; k++) PE.box(0, 0.008, -0.1 + k * 0.026, 0.15, 0.003, 0.006, [0.3, 0.26, 0.24], TL.plain, 0.2); PE.box(0.16, 0.004, 0.05, 0.16, 0.006, 0.1, [1.0, 0.95, 0.8], TL.paper, -0.3); },
  // trois toiles en caisse
  caisse_toiles(PE) { PE.box(0, 0.35, 0, 1.0, 0.7, 0.28, [0.7, 0.55, 0.36], TL.wood); PE.box(0, 0.72, 0, 1.04, 0.04, 0.3, [0.6, 0.46, 0.3], TL.wood); },
  // un bol, et sa cuillère
  bol(PE) { PE.box(0, 0.035, 0, 0.12, 0.07, 0.12, [0.9, 0.85, 0.75], TL.plain); PE.box(0.03, 0.08, 0.02, 0.012, 0.012, 0.12, [0.7, 0.7, 0.72], TL.metal, 0.4, 0.4); },
  // un appeau taillé dans un os
  appeau(PE) { PE.box(0, 0.015, 0, 0.03, 0.03, 0.12, [1.2, 1.15, 0.95], TL.bone, 0.5); },
  // la montre de gousset du docteur Ménard, ouverte
  montre(PE) { PE.box(0, 0.008, 0, 0.06, 0.012, 0.06, [1.3, 1.1, 0.55], TL.gold, 0.3); PE.box(0, 0.016, 0, 0.048, 0.004, 0.048, [1.2, 1.18, 1.1], TL.paper, 0.3); PE.box(0, 0.008, 0.06, 0.06, 0.006, 0.06, [1.3, 1.1, 0.55], TL.gold, 0.3); },
};

// ---------------------------------------------------------------- les déclencheurs
if (typeof quetes !== 'undefined') {
  const _acc = quetes.accepter.bind(quetes), _fin = quetes.finir.bind(quetes);
  quetes.accepter = function (id) {
    const r = _acc(id);
    try {
      if (r && q20.defs[id] && q20.declencher(id, 'demande') && q20.mode() !== 'aucune') {
        // (la scène de la première étape attend la demande : elle passe après)
        if (this.aJouer && this.aJouer.id === id) this.aJouer.t = Math.max(this.aJouer.t || 0, 3.2);
      }
    } catch (e) { console.error('q20c', e); }
    return r;
  };
  quetes.finir = function (id, k) {
    const avant = q20cT(id) && q20cT(id).st;
    const r = _fin(id, k);
    try { if (avant === 'actif' && q20cT(id) && q20cT(id).st === 'fini' && q20.defs[id]) q20.declencher(id, 'fin'); } catch (e) { console.error('q20c', e); }
    return r;
  };
}
// (le dénouement attend le dernier plan de la quête, et la phrase qui le suit)
const Q20C_TDELAIS = { fin: 9.5 };

// ============================================================================ 1. LA CHAMBRE SEPT (l'aubergiste)
q20.scenes('t1', {
  qui: 'aubergiste', titre: 'La chambre sept', delais: Q20C_TDELAIS,
  etat() { return q20cTEtat('t1'); },
  demande(c) {
    const moi = Q20H.poste(c, 'aubergiste', { geste: ['baisse', 'parle'] });
    const Au = c.lieu('auberge'), M = c.maison('aubergiste');
    return [
      c.plan({ dur: 6.6, cam: c.camActeur(moi, { cote: 0.3, d: 2.2 }), acteurs: [moi], dit: ['La sept. Je ne la loue pas. Chaque matin, le lit est défait, et les draps sont tièdes. Personne n’y dort.'], court: true }),
      c.plan({ dur: 6, cam: c.camLieu(M ? M.porte : Au, { d: 16, haut: 4.5, dy: 4.5 }), heure: 23.2, lum: Au ? [c.lueur(c.haut(Au.P, 4), 3, [1.0, 0.7, 0.35], 0)] : [], dit: ['Je voudrais savoir à qui elle est, cette chambre. Après, je la louerai, ou je la murerai.'] }),
    ];
  },
  fins: {
    a(c) {
      const moi = Q20H.poste(c, 'aubergiste', { geste: ['offre'] });
      const J = Q20H.face(c, moi, 1.5, 0.3);
      const bo = moi && c.chose(Q20C_D2.piecess, Q20C.enMain(c, moi, 1.0, 0.36), { s: 1.6, r: moi.cap });
      const Au = c.lieu('auberge');
      return [
        c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.5, d: 2.4, avec: J, k: 0.3 }), acteurs: [moi, J, bo], son: 'piece', dit: ['La sept est à vous, quand vous voudrez. Pour rien.'], court: true }),
        c.plan({ dur: 5.8, cam: c.camLieu(Au, { d: 18, haut: 4.5, dy: 4.5 }), heure: 6.6, dit: ['(Au matin, le lit est fait au carré. Les souliers sont propres.)', ''] }),
      ];
    },
    b(c) {
      const moi = Q20H.poste(c, 'aubergiste', { geste: ['hoche', 'baisse'] });
      const t = Q20H.meuble(c, 'auberge', 'table', moi && moi.P);
      return [
        c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.4, d: 2.2 }), acteurs: [moi], dit: ['Alors on la lui laisse. Il a payé d’avance, ma mère disait toujours.'], court: true }),
        c.plan({ dur: 5.8, cam: t ? c.camDedans('auberge', c.haut(t.P, 0.85), { pref: c.maison('aubergiste').cap + 0.6, d: 2.4 }) : c.camActeur(moi, { cote: 1.4 }), acteurs: [t && c.chose(Q20C_D3.bol, c.haut(t.P, 0.79))], heure: 23.6, son: 'goutte', dit: ['(Cette nuit-là, de la salle, on entend une cuillère tourner dans un bol. Longtemps.)', ''] }),
      ];
    },
  },
});

// ============================================================================ 2. LE FEU DU LAC (une lettre de Marie Lemarié, veuve, de Saint-Flour)
function q20cPhare(c) { const F = c.w.b2 && c.w.b2.phare; if (F) return c.pt(F.x, F.z); const L = c.lieu('phare'); return L ? L.P : null; }
q20.scenes('t2', {
  souv: 'q20c:lettre', titre: 'Le feu du lac', delais: Q20C_TDELAIS,
  etat() { return q20cTEtat('t2'); },
  demande(c) {
    const t = Q20H.meuble(c, 'ferme', 'table');
    const J = t && c.joueur(c.devant(t.P, (t.r || 0) + Math.PI, 0.8, 0, true), { face: t.P, geste: ['baisse', { reach: 0.2 }] });
    const Ph = q20cPhare(c), F = c.lieu('ferme');
    return [
      c.plan({ dur: 6.6, cam: t ? c.camChose(c.haut(t.P, 0.79), { d: 1.4, a: (t.r || 0) + 0.4 }) : c.camLieu(F), acteurs: [J, t && c.chose(Q20C_D3.lettre, c.haut(t.P, 0.79), { r: t.r || 0, s: 1.2 })], son: 'page', dit: ['Mon mari gardait ce feu. Une nuit de novembre, il est descendu voir la barque, et il n’est pas remonté.', 'Marie Lemarié'], court: true }),
      c.plan({ dur: 6.2, cam: Ph ? c.camLieu(Ph, { d: 60, haut: 4, dy: 14 }) : c.camLieu('lac'), heure: 23, lum: Ph ? [c.lueur(c.haut(Ph, 16), 9, [1.0, 0.75, 0.4], 0)] : [], dit: ['Depuis dix-neuf ans, personne n’a porté d’huile là-haut. Il brûle quand même. Je voudrais seulement savoir qui l’allume.', 'Marie Lemarié'] }),
    ];
  },
  fins: {
    a(c) {
      const Ph = q20cPhare(c), Q = c.lieu('planches_quai') || c.lieu('planches');
      const F = c.maison('ferme'), bl = F && Q20H.pres(c, F.porte, 'boite_lettres', 30);
      return [
        c.plan({ dur: 6.4, cam: Q ? c.camLieu(Q, { d: 14, haut: 1.6, dy: 0.4 }) : c.camLieu(Ph), heure: 1.6, son: 'eau', dit: ['(Au bout des Planches, quelque chose qui attendait se détourne, et s’enfonce dans l’eau.)', ''], court: true }),
        c.plan({ dur: 6, cam: bl ? c.camChose(c.haut(bl.P, 1.0), { d: 2.2, a: bl.r + 0.4 }) : c.camLieu('ferme'), heure: 8, dit: ['Cette nuit, pour la première fois depuis dix-neuf ans, j’ai dormi.', 'Marie Lemarié'] }),
      ];
    },
    b(c) {
      const Ph = q20cPhare(c);
      const F = c.maison('ferme'), bl = F && Q20H.pres(c, F.porte, 'boite_lettres', 30);
      return [
        c.plan({ dur: 6.4, cam: Ph ? c.camLieu(Ph, { d: 56, haut: 3.5, dy: 14, monte: 1.5 }) : c.camLieu('lac'), heure: 1.4, lum: Ph ? [c.lueur(c.haut(Ph, 16), 9, [1.0, 0.75, 0.4], 0)] : [], dit: ['(Le feu brûle droit, sans fumée. Au registre, sous la dernière ligne : « Allumé. »)', ''], court: true }),
        c.plan({ dur: 6, cam: bl ? c.camChose(c.haut(bl.P, 1.0), { d: 2.2, a: bl.r + 0.4 }) : c.camLieu('ferme'), heure: 8, dit: ['Alors laissez-le brûler. Il faut que quelqu’un l’attende, et moi je n’ai plus la force.', 'Marie Lemarié'] }),
      ];
    },
  },
});

// ============================================================================ 3. LES TOILES D'ARDOIN (un avis de la mairie)
q20.scenes('t3', {
  souv: 'q20c:avis', titre: 'Les toiles d’Ardoin', delais: Q20C_TDELAIS,
  etat() { return q20cTEtat('t3'); },
  demande(c) {
    const Pa = q20cPanneau(c), J = Pa && c.joueur(c.devant(Pa.P, Pa.r + Math.PI, 1.1), { face: Pa.P, geste: 'leve' });
    const M = c.maison('maire');
    return [
      c.plan({ dur: 6.6, cam: J ? c.camActeur(J, { cote: 0.8, d: 2.4, avec: c.haut(Pa.P, 1.1), k: 0.55, buste: true }) : c.camLieu('place'), acteurs: [J], son: 'page', dit: ['« Le peintre Félix Ardoin, de Lyon, a séjourné dans la commune l’été 1878, et l’a quittée sans ses toiles. »', ''], court: true }),
      c.plan({ dur: 6, cam: c.camLieu(M ? M.porte : c.lieu('mairie'), { d: 15, haut: 5, dy: 4.5 }), heure: 17.4, dit: ['« L’une d’elles est au grenier de la mairie, sous un drap. Sa sœur offre une récompense. »', ''] }),
    ];
  },
  fins: {
    a(c) {
      const M = c.maison('maire'), P0 = M && Q20H.libre(c, M.dehors(1.8, 1.4), 0, 3, 0.7);
      const moi = M && c.habitant('maire', M.dehors(1.0, -0.6), { face: P0, geste: ['bras', 'parle'] });
      return [
        c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.8, d: 3.0, avec: P0, k: 0.4 }), acteurs: [moi, P0 && c.chose(Q20C_D3.caisse_toiles, P0, { r: M.cap })], dit: ['Pour Lyon, avec un mot de votre main. La commune se charge du port. Pour une fois.', '@maire'], court: true }),
        c.plan({ dur: 6, cam: c.camLieu(c.lieu('eglise'), { d: 26, haut: 4, dy: 3 }), heure: 17.5, dit: ['Félix n’est jamais revenu à Lyon. Pendant dix ans, il m’a écrit comme s’il y était.', 'Mlle Ardoin'] }),
      ];
    },
    b(c) {
      const moi = npcs.alive('cure') ? Q20H.seuil(c, 'cure', { d: 1.4, geste: ['offre'] }, 'eglise') : null;
      const J = moi && Q20H.face(c, moi, 1.4, 0.3);
      const E = c.maison('eglise');
      return [
        c.plan({ dur: 6.2, cam: moi ? c.camActeur(moi, { cote: 0.5, d: 2.6, avec: J, k: 0.3 }) : c.camLieu('eglise'), acteurs: [moi, J], son: 'piece', dit: ['Pour le tronc des pauvres. Ou pour vous.', '@cure'], court: true }),
        c.plan({ dur: 6, cam: E ? c.camDedans('eglise', c.haut(E.local(0, -E.B.D * 0.22), 0.8), { pref: E.cap + Math.PI, d: 3.6 }) : c.camLieu('eglise'), heure: 10.5, dit: ['(Le dimanche suivant, personne ne s’assoit plus au dernier rang.)', ''] }),
      ];
    },
  },
});

// ============================================================================ 4. LA CRÉCELLE (une chose trouvée devant le relais de chasse)
q20.scenes('t4', {
  souv: 'q20c:objet', titre: 'La crécelle', delais: Q20C_TDELAIS,
  etat() { return q20cTEtat('t4'); },
  demande(c) {
    const M = c.maison('chasseur'), P0 = M ? Q20H.libre(c, M.dehors(2.4, 1.2), 0, 3, 0.4) : c.lieu('relais_chasse').P;
    return [
      c.plan({ dur: 6.4, cam: c.camChose(P0, { d: 1.6, haut: 0.95, dy: 0.05, a: M ? M.cap + 0.8 : 0.6 }), acteurs: [c.chose(Q20C_D3.crecelle, P0, { s: 1.6, r: 0.8 })], heure: 17.6, dit: ['(Une crécelle de rabatteur. Sur le manche, gravé au couteau : « BASTIEN ». Posée là comme si on venait de la poser.)', ''], court: true }),
      c.plan({ dur: 6, cam: c.camLieu(c.lieu('relais_chasse'), { d: 26, haut: 3, dy: 1.5 }), heure: 17.4, son: 'corbeau', dit: ['(Du côté du relais, le soir, on entend parfois claquer une crécelle. Personne ne chasse plus, à cette heure.)', ''] }),
    ];
  },
  fins: {
    a(c) {
      const t = Q20H.meuble(c, 'relais_chasse', 'table');
      const moi = Q20C.chez(c, 'chasseur', { ou: 'assis', geste: ['assis', 'baisse', { reach: 0.2 }] });
      const cr = moi && c.chose(Q20C_D3.crecelle, Q20C.enMain(c, moi, 0.72, 0.32), { r: moi.cap, s: 1.2 });
      const ch = Q20H.meuble(c, 'relais_chasse', 'cheminee'), lum = ch ? [c.lueur(ch.P, 4.5, [1.0, 0.55, 0.25], 0.6)] : [];
      const moi2 = Q20C.chez(c, 'chasseur', { vise: t && t.P, geste: ['travaille'] });
      return [
        c.plan({ dur: 6.6, cam: c.camActeur(moi, { cote: 0.7, d: 2.5, haut: 1.4 }), acteurs: [moi, cr], heure: 20, lum, dit: ['Mon père ne chassait plus, après. Il venait là-bas le dimanche, avec une serpe. Je croyais qu’il allait prier.', '@chasseur'], court: true }),
        c.plan({ dur: 5.8, cam: c.camActeur(moi2, { cote: 1.0, d: 2.2, buste: true }), acteurs: [moi2, t && c.chose(Q20C_D3.appeau, c.haut(t.P, 0.79), { s: 1.6 })], heure: 20.4, lum, dit: ['Un appeau, dans un os. Comme il me l’avait appris.', '@chasseur'] }),
      ];
    },
    b(c) {
      const T = q20cTLieu(c, 't4:3') || (Q20C.lieu(c, 'chapelle', 'relais_chasse') || c.lieu('ferme')).P;
      const M = c.maison('chasseur'), so = M && Q20H.libre(c, M.dehors(3.0, -1.4), 0, 3, 0.4);
      return [
        c.plan({ dur: 6.4, cam: c.camChose(T, { d: 2.4, haut: 1.1, dy: 0.3, a: 0.7 }), acteurs: [c.chose(Q20C_D3.crecelle, c.haut(T, 0.35), { s: 1.6, r: 1.4 })], heure: 17.5, son: 'clochette', dit: ['(Le vent la fait tourner d’un cran, une seule fois.)', ''], court: true }),
        c.plan({ dur: 5.8, cam: so ? c.camChose(so, { d: 1.6, haut: 0.95, dy: 0.05 }) : c.camLieu('relais_chasse'), acteurs: [so && c.chose(Q20C_D3.appeau, so, { s: 1.8 })], heure: 6.8, dit: ['(Le lendemain, sur la souche devant le relais, un appeau taillé dans un os, que personne ne réclame.)', ''] }),
      ];
    },
  },
});

// ============================================================================ 5. LA SOURCE FROIDE (le docteur des Sources)
q20.scenes('t5', {
  qui: 'naturiste_b', titre: 'La source froide', delais: Q20C_TDELAIS,
  etat() { return q20cTEtat('t5'); },
  demande(c) {
    const moi = Q20C.chez(c, 'naturiste_b', { geste: ['bras', 'baisse'] });
    const li = Q20H.meuble(c, 'source_b', 'lit');
    return [
      c.plan({ dur: 6.6, cam: c.camActeur(moi, { cote: 0.4, d: 2.2 }), acteurs: [moi], dit: ['Sous mon lit, il y a une caisse qui était là avant moi : les papiers du docteur Ménard. On dit qu’il guérissait ceux que personne ne guérissait.'], court: true }),
      c.plan({ dur: 6, cam: li ? c.camDedans('source_b', c.haut(li.P, 0.3), { pref: c.maison('naturiste_b').cap + 0.5, d: 2.2 }) : c.camActeur(moi, { cote: 1.5 }), acteurs: [li && c.chose('caisse', c.devant(li.P, li.r || 0, 0.2, 0.1, true), { s: 0.7, r: li.r || 0 })], dit: ['Je suis médecin : j’ai peur de ce qui guérit trop bien. Ouvrez-la pour moi. Et dites-moi où il les envoyait.'] }),
    ];
  },
  fins: {
    a(c) {
      const t = Q20H.meuble(c, 'source_b', 'table');
      const moi = Q20C.chez(c, 'naturiste_b', { ou: 'assis', geste: ['assis', 'baisse'] });
      const li = moi && c.chose('livre', Q20C.enMain(c, moi, 0.66, 0.3), { r: moi.cap });
      const moi2 = Q20C.chez(c, 'naturiste_b', { geste: ['offre', 'parle'] });
      const mo = moi2 && c.chose(Q20C_D3.montre, Q20C.enMain(c, moi2, 1.02, 0.34), { s: 1.6, r: moi2.cap });
      return [
        c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.6, d: 1.9 }), acteurs: [moi, li], heure: 3.2, lum: t ? [c.lueur(t.P, 2.6, [1.0, 0.66, 0.3], 0.9)] : [], son: 'page', dit: ['Je n’enverrai personne là-bas.'], court: true }),
        c.plan({ dur: 6, cam: c.camActeur(moi2, { cote: 0.3, d: 2.0, buste: true }), acteurs: [moi2, mo], heure: 7, dit: ['Mais vous, si un jour vous saignez, allez-y à l’aube, les pieds dans l’eau. Gardez la montre : elle ne marchera plus pour lui.'] }),
      ];
    },
    b(c) {
      const T = q20cTLieu(c, 't5:3') || (Q20C.lieu(c, 'source', 'sources', 'source_b') || c.lieu('ferme')).P;
      const J = T && c.joueur(Q20H.libre(c, c.devant(T, 0.6, 1.0), 0, 2, 0.4), { face: T, geste: ['penche', { reach: 0.4 }] });
      return [
        c.plan({ dur: 6.6, cam: c.camActeur(J, { cote: 1.6, d: 2.6, avec: T, k: 0.4 }), acteurs: [J], heure: 5.4, son: 'eau', dit: ['(L’eau a un goût de pierre et de neige. Le corps se tait d’un coup, comme un champ après la grêle.)', ''], court: true }),
        c.plan({ dur: 5.8, cam: c.camLieu(T, { d: 18, haut: 2.4, dy: 0.8 }), heure: 5.8, dit: ['(Il vous manque quelque chose. Vous ne savez pas quoi.)', ''] }),
      ];
    },
  },
});
