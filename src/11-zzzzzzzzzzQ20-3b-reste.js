// ============================================================================
//  LES SCÈNES DES QUÊTES (agent Q20C) — 3b. LES QUÊTES HORS DE `quests` ET DE `q16`
//  Chacune son état (etat(), lu dans ce que son module retient déjà) et ses
//  déclencheurs : un guet toutes les deux secondes (ce qui a changé
//  depuis : un emprunt, une affiche clouée, un colis remis…), et quelques
//  emballages qui ne changent rien à ce qu'ils emballent (ils notent seulement
//  qui a parlé, quel travail a été pris, quelle carte a été tirée). Ce que Q20C
//  retient : farm.s.q20c (petites notes ; une partie d'avant n'en a pas).
//  - la tournée de la poste ; les petits travaux de la mairie (un pli, un banc,
//    le parvis, ce que la commune demande) ;
//  - la bibliothèque : un emprunt, la clé de la Grande Porte ;
//  - la lavandière de nuit ; les Petits (les gobelins) ; le baron du Cercle (sa
//    fin est déjà filmée) ; le service à la loge de l'hôtel ;
//  - l'avis de recherche ; l'homme au masque ; ce qui pèse sur vous ;
//  - le carnet de commandes ; la croix sur la carte ; les reliques des Anciens ;
//    le caveau du bois.
// ============================================================================
const q20c = {
  t: 2, guets: [], branche: null,
  // les notes de Q20C dans la partie
  S() { const s = farm.s; if (!s) return {}; return s.q20c && typeof s.q20c === 'object' ? s.q20c : (s.q20c = { v: 1 }); },
  note(k, v) { const S = this.S(); if (!S[k]) S[k] = Object.assign({ j: farm.s.day }, v || {}); return S[k]; },
  // un guet : f() rend le moment à déclencher maintenant ('demande', 'tournant', 'fin'), ou rien
  guetter(id, f) { this.guets.push({ id, f }); },
  update(dt) {
    if (!farm.s || !game.started) return;
    if (this.branche !== game) { this.branche = game; this.brancher(); }
    this.t -= dt;
    if (this.t > 0) return;
    this.t = 2;
    for (const G of this.guets) {
      try { const m = G.f(); if (m) q20.declencher(G.id, m); } catch (e) { if (!G.err) { G.err = 1; console.error('q20c ' + G.id, e); } }
    }
  },
  // les emballages des modules chargés après celui-ci (l'interface, la lavandière, les dialogues des autres)
  brancher() {
    if (game._q20c) return;
    game._q20c = true;
    const _ch = talk.choose.bind(talk);
    talk.choose = function (act) {
      const n = this.n;
      let r;
      try { if (act === 'colis' && n) q20c.S().colis = n.id; } catch (e) { /* rien */ }
      r = _ch(act);
      try {
        // qui a parlé de la lavandière (la réponse cite Marthe, ou les lavandières de nuit)
        if (act === 'chat' && n && r && r.text && /Marthe|lavandi/i.test(r.text) && typeof lavandiere !== 'undefined' && !lavandiere.apaisee()) { q20c.note('lav', { qui: n.id }); q20.declencher('q20c_lavandiere', 'demande'); }
        // le curé, la guérisseuse : on leur demande d'ôter ce qui pèse
        if ((act === 'mal_cure' || act === 'mal_gue') && n && typeof malediction !== 'undefined' && malediction.liste().length) { q20c.note('mal', { qui: n.id }); q20.declencher('q20c_malediction', 'demande'); }
      } catch (e) { console.error('q20c', e); }
      return r;
    };
    if (typeof lavandiere !== 'undefined' && lavandiere.drap) {
      const _dr = lavandiere.drap.bind(lavandiere);
      lavandiere.drap = function () { try { q20c.note('lav').drap = farm.s.day; } catch (e) { /* rien */ } return _dr(); };
    }
  },
};
HOOKS.update.push((dt) => q20c.update(dt));
// l'état d'une quête d'ici : { q, Q, qui, actif, fini, pret, choix }
// (pret : le tournant est passé — une partie d'avant le range aux souvenirs sans le rejouer)
function q20cE(titre, Q, actif, fini, choix, pret) { return { q: { title: titre }, Q: Q || null, qui: null, actif: !!actif, fini: !!fini, pret: !!actif && !!pret, choix: choix === undefined ? null : choix }; }
const q20cJour = () => (farm.s ? farm.s.day : 0);

// ---------------------------------------------------------------- des silhouettes
Object.assign(Q20_LOOKS, {
  q20c_marthe: { skin: '#cfd2cc', hair: '#22201e', hairStyle: 'long', top: '#b8bab4', bottom: '#a8aaa4', shoe: '#5a5a58', dress: true, apron: '#c8cac4', face: 'paleF', height: 0.97, build: 'mince' },
  q20c_masque: { skin: '#d8cfc0', hair: '#1a1614', hairStyle: 'court', hat: 'capuche', hatCol: '#1e1c1a', top: '#262422', bottom: '#1e1c1a', shoe: '#141210', coat: true, face: 'mask', height: 1.02 },
  q20c_voiturier: { skin: '#d2a882', hair: '#4a3a2c', hairStyle: 'court', beard: 'moustache', hat: 'chapeau', hatCol: '#2e2822', top: '#3e5a86', bottom: '#3a3228', shoe: '#1e1812', build: 'normal' },
  q20c_brissac: { skin: '#e2bea0', hair: '#9a9288', hairStyle: 'court', beard: 'moustache', top: '#24242a', bottom: '#1e1e22', shoe: '#141414', coat: true, build: 'rond' },
  q20c_cliente: { skin: '#ecd6c4', hair: '#5a3a2a', hairStyle: 'chignon', top: '#6a2a3a', bottom: '#5a2232', shoe: '#2a1a1a', dress: true, hat: 'voile', hatCol: '#3a1a2a', build: 'mince' },
  q20c_odile: { dress: true, hairStyle: 'chignon', hair: '#16100e', skin: '#ecdcd2', top: '#121012', bottom: '#121012', shoe: '#0e0c0c', build: 'mince' },
  q20c_gris: { coat: true, top: '#7a7a78', bottom: '#6a6a68', skin: '#d8d4cc', hair: '#9a9894', hairStyle: 'court', hat: 'chapeau', hatCol: '#5a5a58', shoe: '#3a3a38', build: 'mince', height: 1.04 },
});
const Q20C_D2 = {
  // l'affiche « RECHERCHÉ », à plat (sur le panneau, on se sert du vrai modèle)
  feuilles(PE) { const C = [[0.9, 0.55, 0.2], [0.75, 0.42, 0.18], [0.95, 0.75, 0.3], [0.6, 0.35, 0.15]]; for (let k = 0; k < 14; k++) PE.box(Math.sin(k * 2.4) * 1.4, 0.006, Math.cos(k * 1.7) * 1.1, 0.12, 0.006, 0.08, C[k % 4], TL.leaves, k); },
  drap(PE, t) { PE.box(0, 0.02 + Math.sin((t || 0) * 0.9) * 0.01, 0, 1.3, 0.04, 0.6, [1.2, 1.2, 1.16], TL.cloth, Math.sin((t || 0) * 0.4) * 0.06); },
  drap_plie(PE) { PE.box(0, 0.05, 0, 0.42, 0.1, 0.3, [1.3, 1.3, 1.26], TL.cloth); },
  masque(PE) { PE.box(0, 0.012, 0, 0.2, 0.02, 0.24, [0.85, 0.8, 0.72], TL.cloth, 0.3); for (const s of [-1, 1]) PE.box(s * 0.045, 0.024, -0.03, 0.035, 0.006, 0.025, [0.05, 0.04, 0.04], TL.plain, 0.3); PE.box(0, 0.024, 0.06, 0.06, 0.006, 0.012, [0.05, 0.04, 0.04], TL.plain, 0.3); },
  present(PE) { PE.box(-0.08, 0.06, 0, 0.06, 0.12, 0.06, [0.4, 0.6, 0.45], TL.glass); PE.box(0.07, 0.015, 0.02, 0.16, 0.03, 0.12, [0.7, 0.62, 0.5], TL.cloth, 0.4); PE.box(0.02, 0.012, -0.08, 0.14, 0.012, 0.012, [0.6, 0.5, 0.3], TL.rope, 1.1); },
  carte_croix(PE) { PE.box(0, 0.004, 0, 0.32, 0.006, 0.24, [1.05, 0.92, 0.7], TL.paper, 0.15); for (const s of [-1, 1]) PE.box(0.06, 0.009, -0.03, 0.06, 0.003, 0.012, [0.7, 0.2, 0.1], TL.plain, 0.15 + s * 0.785); PE.box(-0.07, 0.008, 0.04, 0.05, 0.003, 0.05, [0.35, 0.5, 0.3], TL.plain); },
  bon(PE) { PE.box(0, 0.004, 0, 0.2, 0.006, 0.14, [1.15, 1.08, 0.92], TL.paper, 0.2); for (let k = 0; k < 4; k++) PE.box(0, 0.008, -0.04 + k * 0.025, 0.15, 0.003, 0.006, [0.25, 0.25, 0.4], TL.plain, 0.2); },
  jeton_noir(PE) { PE.box(0, 0.006, 0, 0.04, 0.012, 0.04, [0.08, 0.07, 0.07], TL.plain, 0.4); },
  carnet_noir(PE) { PE.box(0, 0.012, 0, 0.12, 0.024, 0.17, [0.12, 0.09, 0.1], TL.leather, 0.3); },
  cle_fer(PE) { const r = [0.5, 0.46, 0.42]; PE.box(0, 0.01, 0, 0.02, 0.02, 0.3, r, TL.iron, 0.3); PE.box(0, 0.01, -0.17, 0.08, 0.02, 0.07, r, TL.iron, 0.3); PE.box(0.03, 0.01, 0.13, 0.05, 0.02, 0.05, r, TL.iron, 0.3); },
  livre_creux(PE) { PE.box(0, 0.04, 0, 0.24, 0.08, 0.32, [0.42, 0.22, 0.16], TL.leather, 0.1); PE.box(0, 0.075, 0, 0.16, 0.012, 0.22, [1.05, 0.98, 0.8], TL.paper, 0.1); PE.box(0, 0.08, 0, 0.12, 0.01, 0.18, [0.12, 0.1, 0.08], TL.plain, 0.1); },
  piecess(PE) { for (let k = 0; k < 5; k++) PE.box(-0.04 + (k % 3) * 0.03, 0.005 + Math.floor(k / 3) * 0.008, (k % 2) * 0.02, 0.022, 0.006, 0.022, [1.4, 1.15, 0.5], TL.gold); },
};
// un point fixe d'une maison de la vallée : la porte, dehors ; sinon le lieu du même nom
function q20cPorte(c, qui, d) { const M = c.maison(qui); return M ? M.dehors(d ?? 0.6) : null; }
// le tableau des petits travaux (contre la mairie) : où il est, et l'endroit où le lire
function q20cTableau(c) {
  const I = (c.w.inter || []).find((i) => i.id === 'f2a:travaux');
  const M = c.maison('mairie');
  if (!I) return M ? { P: c.haut(M.porte, 1.3), J: M.dehors(1.4), cap: M.cap } : null;
  const T = [I.x, I.y, I.z], g = c.sol(I.x, I.z);
  // (le joueur devant, du côté de la rue)
  const cap = M ? M.cap : 0, J = Q20H.libre(c, c.devant([I.x, g, I.z], cap, 1.1), 0, 2, 0.4);
  return { P: T, J, cap };
}
function q20cLireTableau(c, texte, o) {
  o = o || {};
  const T = q20cTableau(c);
  if (!T) return null;
  const J = c.joueur(T.J, { face: T.P, geste: 'leve' });
  return c.plan({ dur: o.dur || 6, cam: c.camActeur(J, { cote: 0.75, d: 2.3, avec: T.P, k: 0.55, buste: true }), acteurs: [J], dit: [texte, ''], son: 'page', court: true, heure: o.heure });
}
// le maire à sa porte (ou à son bureau) : la commune paie
function q20cMaire(c, texte, o) {
  o = o || {};
  const moi = Q20H.seuil(c, 'maire', { d: 1.0, geste: o.geste || ['offre', 'parle'] });
  const pi = moi && c.chose(Q20C_D2.piecess, Q20C.enMain(c, moi, 1.02, 0.36), { s: 1.4, r: moi.cap });
  return c.plan({ dur: o.dur || 6, cam: c.camActeur(moi, { cote: o.cote ?? 0.4, d: 2.4, avec: o.face ? Q20H.face(c, moi, 1.5, 0.2) : undefined, k: 0.3 }), acteurs: [moi, pi, o.face ? Q20H.face(c, moi, 1.5, 0.2) : null], dit: [texte, '@maire'], son: 'piece', heure: o.heure });
}

// ============================================================================ LA TOURNÉE DE LA POSTE (la postière)
const Q20C_TOURNEE = 'Tournée de la poste';
function q20cTournee() { const s = farm.s; return s && s.deliveries && s.deliveries.day === s.day && Array.isArray(s.deliveries.list) && s.deliveries.list.length ? s.deliveries : null; }
q20.scenes('q20c_tournee', {
  qui: 'postiere', titre: Q20C_TOURNEE,
  etat() {
    const D = q20cTournee();
    if (!D) return q20cE(Q20C_TOURNEE, null, false, false);
    const reste = D.list.filter((p) => !p.done).length;
    return q20cE(Q20C_TOURNEE, D, reste > 0 && !D.late, reste === 0);
  },
  demande(c) {
    const D = c.Q, to = (D && D.list[0] && D.list[0].to) || 'pecheur';
    const moi = Q20H.poste(c, 'postiere', { ou: 'comptoir', geste: ['offre', 'parle'] });
    const co = moi && c.chose(Q20_DESSINS.colis, Q20C.enMain(c, moi, 1.02, 0.42), { r: moi.cap, s: 0.9 });
    const M = c.maison(to), noms = D ? D.list.map((p) => npcs.nameOf(p.to)).join(', ') : npcs.nameOf(to);
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 0.4, d: 2.4, buste: true }), acteurs: [moi, co], dit: [`Du travail ? Tenez : ${noms}. Un colis chacun, remis en main propre.`], court: true }),
      c.plan({ dur: 5.8, cam: c.camLieu(M ? M.porte : c.lieu('place'), { d: 13, haut: 2.4, dy: 1.6 }), heure: 9, dit: ['Avant six heures du soir, sinon ça ne compte pas. On paie à la livraison.'] }),
    ];
  },
  fin(c) {
    const to = q20c.S().colis || (c.Q && c.Q.list[c.Q.list.length - 1].to) || 'pecheur';
    const lui = npcs.byId[to] ? Q20H.seuil(c, to, { d: 0.9, geste: ['tend', 'parle'] }) : null;
    const co = lui && c.chose(Q20_DESSINS.colis, Q20C.enMain(c, lui, 1.0, 0.42), { r: lui.cap, s: 0.85 });
    const moi = Q20H.seuil(c, 'postiere', { d: 1.0, geste: ['bras', 'hoche'] });
    return [
      c.plan({ dur: 6, cam: lui ? c.camActeur(lui, { cote: 0.5, d: 2.2, buste: true }) : c.camActeur(moi), acteurs: [lui, co], son: 'piece', dit: lui ? ['Pour moi ? Merci, vous êtes bien aimable.', '@' + to] : ['Merci.'], court: true }),
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.5, d: 2.6 }), acteurs: [moi], heure: 17.4, dit: ['Tout est livré pour aujourd’hui. Beau travail ! Revenez demain matin.', '@postiere'] }),
    ];
  },
});
q20c.guetter('q20c_tournee', () => { const D = q20cTournee(); if (!D) return null; const reste = D.list.filter((p) => !p.done).length; return reste === 0 ? 'fin' : D.late ? null : 'demande'; });

// ============================================================================ LES PETITS TRAVAUX DE LA MAIRIE (le tableau, contre la mairie)
// (activites.accepter et activites.payer emballés : on note le travail pris, puis payé)
const Q20C_TRAVAUX = { livrer: 'q20c_pli', reparer: 'q20c_banc', balayer: 'q20c_parvis', apporter: 'q20c_depot' };
function q20cTravail(t) { const R = q20c.S().trav; return R && R[t] ? R[t] : null; }
function q20cEtatTravail(t, titre) {
  const R = q20cTravail(t);
  return q20cE(titre, R, !!R && !R.fait && R.j === q20cJour(), !!R && !!R.fait);
}
if (typeof activites !== 'undefined') {
  const _acc = activites.accepter.bind(activites), _pay = activites.payer.bind(activites);
  activites.accepter = function (j) {
    const r = _acc(j);
    try {
      const S = q20c.S(), R = S.trav || (S.trav = {});
      if (j && Q20C_TRAVAUX[j.t] && !R[j.t]) {
        R[j.t] = { j: farm.s.day, i: j.i, to: j.to || null, x: j.x, y: j.y, z: j.z, need: j.need || null, n: j.n || 0, txt: j.t === 'livrer' ? null : j.txt || null };
        q20.declencher(Q20C_TRAVAUX[j.t], 'demande');
      }
    } catch (e) { console.error('q20c', e); }
    return r;
  };
  activites.payer = function (j) {
    const r = _pay(j);
    try {
      const R = q20c.S().trav || {};
      for (const t in R) if (R[t] && R[t].j === farm.s.day && j && R[t].i === j.i && !R[t].fait) { R[t].fait = farm.s.day; q20.declencher(Q20C_TRAVAUX[t], 'fin'); }
    } catch (e) { console.error('q20c', e); }
    return r;
  };
}

q20.scenes('q20c_pli', {
  qui: 'maire', titre: 'Un pli de la mairie',
  etat() { return q20cEtatTravail('livrer', 'Un pli de la mairie'); },
  demande(c) {
    const to = (c.Q && c.Q.to) || 'grainetiere', M = c.maison(to);
    return [
      q20cLireTableau(c, `« Porter un pli de la mairie à ${npcs.nameOf(to)}. Payé par la commune. »`),
      c.plan({ dur: 6, cam: c.camLieu(M ? M.porte : c.lieu('place'), { d: 12, haut: 2.4, dy: 1.6 }), dit: ['En main propre. Et vous ne l’ouvrez pas, bien entendu.', '@maire'] }),
    ];
  },
  fin(c) {
    const to = (c.Q && c.Q.to) || 'grainetiere';
    const lui = npcs.byId[to] ? Q20H.seuil(c, to, { d: 0.9, geste: ['baisse', { reach: 0.25 }] }) : null;
    const pl = lui && c.chose(Q20_DESSINS.pli, Q20C.enMain(c, lui, 1.08, 0.32), { r: lui.cap, s: 1.1 });
    return [
      c.plan({ dur: 6.2, cam: lui ? c.camActeur(lui, { cote: 0.5, d: 2.0, buste: true }) : c.camLieu('mairie'), acteurs: [lui, pl], dit: lui ? ['Un pli de la mairie ? Pour moi ? … Encore une taxe, je parie. Merci quand même.', '@' + to] : ['…'], court: true }),
      q20cMaire(c, 'La commune paie, pour une fois. Ne dépensez pas tout à l’auberge.'),
    ];
  },
});

// le banc à réparer (celui du tableau ; sinon le plus proche de la place)
function q20cBanc(c) {
  const R = c.Q, P = c.lieu('place');
  if (R && isFinite(R.x)) { const b = Q20H.pres(c, [R.x, R.y, R.z], 'banc', 3); if (b) return b; }
  const b = P && Q20H.pres(c, P.P, 'banc', 45);
  return b || (P ? { P: Q20C.autour(c, P, 0.6, 9), r: 0 } : null);
}
q20.scenes('q20c_banc', {
  qui: 'maire', titre: 'Réparer un banc',
  etat() { return q20cEtatTravail('reparer', 'Réparer un banc'); },
  demande(c) {
    const bc = q20cBanc(c);
    return [
      q20cLireTableau(c, '« Réparer un banc de la ville : le dossier ne tient plus. »'),
      c.plan({ dur: 6, cam: Q20C.cam(c, ...[0.6, 2.2, -1.0, 3.6].map((a) => () => c.camChose(bc.P, { d: 3.2, haut: 1.4, dy: 0.5, a: bc.r + a }))), acteurs: [], dit: ['Deux bûches, un peu d’huile de coude. La commune fournit l’huile de coude.', '@maire'] }),
    ];
  },
  fin(c) {
    const bc = q20cBanc(c);
    const ass = ['cure', 'postiere', 'grainetiere', 'forgeron'].find((id) => npcs.alive(id)) || 'maire';
    const cap = bc.r + Math.PI;
    const lui = c.habitant(ass, c.devant(bc.P, cap, 0.05, 0, true), { cap, geste: ['assis', 'hoche'] });
    return [
      c.plan({ dur: 6.2, cam: Q20C.cam(c, ...[0.5, -0.5, 1.0, -1.0].map((k) => () => c.camActeur(lui, { cote: k, d: 2.6 }))), acteurs: [lui], heure: 17.4, dit: ['Il ne grince plus. Quelqu’un s’est enfin donné la peine.', '@' + ass], court: true }),
      q20cMaire(c, 'La commune paie, pour une fois. Et le banc tiendra jusqu’aux élections.', { heure: 17.6 }),
    ];
  },
});

q20.scenes('q20c_parvis', {
  qui: 'maire', titre: 'Balayer le parvis',
  etat() { return q20cEtatTravail('balayer', 'Balayer le parvis'); },
  demande(c) {
    const E = c.maison('eglise'), Pv = E ? E.dehors(2.2) : c.lieu('eglise').P;
    return [
      q20cLireTableau(c, '« Balayer le parvis de l’église. »'),
      c.plan({ dur: 6, cam: c.camChose(Pv, { d: 5.5, haut: 2.0, dy: 0.2, a: E ? E.cap : 0 }), acteurs: [c.chose(Q20C_D2.feuilles, Pv, { s: 1.4 })], heure: 9.5, dit: ['Le curé dit que les feuilles y reviennent toutes seules. Moi, je dis qu’il les compte.', '@maire'] }),
    ];
  },
  fin(c) {
    const E = c.maison('eglise');
    const lui = npcs.alive('cure') ? Q20H.seuil(c, 'cure', { d: 1.6, geste: ['baisse'] }, 'eglise') : null;
    const Pv = E ? E.dehors(2.2) : null;
    return [
      c.plan({ dur: 6.4, cam: lui ? c.camActeur(lui, { cote: 0.5, d: 3.0 }) : c.camChose(Pv, { d: 5, haut: 2 }), acteurs: [lui], heure: 17.8, chaque: Pv ? Q20H.emet(c.haut(Pv, 2.6), { n: 0.6, col: [0.85, 0.5, 0.2, 1], taille: 0.06, vie: 4, v: 0.3, vy: -0.2, grav: 0.3, r: 3 }) : null, dit: ['Propre. Elles reviendront cette nuit. Elles reviennent toujours.', '@cure'], court: true }),
      q20cMaire(c, 'La commune paie, pour une fois. Monsieur le curé vous remercie. À sa manière.', { heure: 17.6 }),
    ];
  },
});

q20.scenes('q20c_depot', {
  qui: 'maire', titre: 'Ce que demande la commune',
  etat() { return q20cEtatTravail('apporter', 'Ce que demande la commune'); },
  demande(c) {
    const R = c.Q, txt = (R && R.txt) || 'Ce que demande la commune, déposé au tableau.';
    return [
      q20cLireTableau(c, '« ' + txt.replace(/^« |»$/g, '') + ' »'),
      q20cMaire(c, 'Déposez-le au tableau. La commune paie à réception. Elle paie toujours. Un jour.', { geste: ['bras', 'parle'] }),
    ];
  },
  fin(c) {
    const T = q20cTableau(c), cs = T && Q20H.libre(c, c.devant(T.J, T.cap, 0.3, 1.2), 0, 2, 0.5);
    return [
      c.plan({ dur: 6, cam: cs ? c.camChose(cs, { d: 2.6, haut: 1.3, dy: 0.3 }) : c.camLieu('mairie'), acteurs: [cs && c.chose('caisse', cs, { r: T.cap })], dit: ['Voilà qui fera plaisir au conseil. Le conseil, c’est moi.', '@maire'], court: true }),
      q20cMaire(c, 'La commune paie, pour une fois.'),
    ];
  },
});

// ============================================================================ LA GRANDE BIBLIOTHÈQUE : UN EMPRUNT (le bibliothécaire)
// (biblio.emprunter et biblio.rendre emballés : le premier emprunt, son retour)
if (typeof biblio !== 'undefined') {
  const _emp = biblio.emprunter.bind(biblio), _ren = biblio.rendre.bind(biblio);
  biblio.emprunter = function (e, j) {
    const r = _emp(e, j);
    try { if (r === 'ok' && e && !q20c.S().emprunt) { const P = this.S().prets.find((p) => p.id === e.item); q20c.note('emprunt', { id: e.item, titre: e.titre, due: P ? P.due : 0 }); q20.declencher('q20c_emprunt', 'demande'); } } catch (er) { console.error('q20c', er); }
    return r;
  };
  biblio.rendre = function (i, boite) {
    const P = this.S().prets[i], late = P && farm.s && farm.s.hours > P.due;
    const r = _ren(i, boite);
    try { const E = q20c.S().emprunt; if (r && P && E && !E.rendu && E.id === P.id) { E.rendu = farm.s.day; E.retard = late ? 1 : 0; E.boite = boite ? 1 : 0; q20.declencher('q20c_emprunt', 'fin'); } } catch (er) { console.error('q20c', er); }
    return r;
  };
}
function q20cComptoir(c, o) {
  const co = Q20H.meuble(c, 'bibliotheque', 'comptoir');
  return co ? c.habitant('libraire', c.devant(co.P, (co.r || 0) + Math.PI, 0.75, 0, true), Object.assign({ cap: co.r || 0 }, o || {})) : Q20C.chez(c, 'libraire', o);
}
q20.scenes('q20c_emprunt', {
  qui: 'libraire', titre: 'Un livre de la grande bibliothèque',
  etat() { const E = q20c.S().emprunt; return q20cE('Un livre de la grande bibliothèque', E, !!E && !E.rendu, !!E && !!E.rendu, E && E.rendu ? (E.retard ? 1 : 0) : null); },
  demande(c) {
    const E = c.Q, moi = q20cComptoir(c, { geste: ['travaille', 'baisse'] });
    const li = moi && c.chose('livre', Q20C.enMain(c, moi, 1.02, 0.42), { r: moi.cap });
    const et = Q20H.meuble(c, 'bibliotheque', 'etagere', moi && moi.P);
    let quand = 'au jour dit';
    try { if (E && E.due) quand = biblio.dateTexte(E.due); } catch (e) { /* rien */ }
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.5, d: 2.2, buste: true }), acteurs: [moi, li], son: 'page', dit: [`« ${E && E.titre ? E.titre : 'Le livre'} », ${quand}. Jour dit. Heure dite.`], court: true }),
      c.plan({ dur: 5.8, cam: et ? c.camDedans('bibliotheque', c.haut(et.P, 1.4), { pref: c.maison('libraire').cap + 0.8, d: 3.2 }) : c.camActeur(moi, { cote: 1.6, d: 3 }), acteurs: [moi], dit: ['Le registre n’oublie personne. Moi non plus.'] }),
    ];
  },
  fins: {
    0(c) {
      const moi = q20cComptoir(c, { geste: ['hoche', { reach: 0.3 }] });
      const li = moi && c.chose('livre', Q20C.enMain(c, moi, 1.02, 0.4), { r: moi.cap });
      const et = Q20H.meuble(c, 'bibliotheque', 'etagere', moi && moi.P);
      const moi2 = et ? c.habitant('libraire', c.devant(et.P, (et.r || 0) + Math.PI, 0.7, 0, true), { cap: et.r || 0, geste: ['leve', { reach: 0.6 }] }) : moi;
      return [
        c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.4, d: 2.2, buste: true }), acteurs: [moi, li], son: 'page', dit: ['À l’heure. Il n’a pas souffert. Vous non plus.'], court: true }),
        c.plan({ dur: 6, cam: c.camActeur(moi2, { cote: 1.2, d: 2.6 }), acteurs: [moi2], dit: ['Revenez quand vous voudrez. Les lecteurs exacts sont rares.'] }),
      ];
    },
    1(c) {
      const moi = q20cComptoir(c, { geste: ['raide', 'baisse'], regard: 'camera' });
      const moi2 = q20cComptoir(c, { geste: ['travaille', 'baisse'] });
      return [
        c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 0.1, d: 2.0 }), acteurs: [moi], heure: Math.max(c.h, 17.5), dit: ['En retard.'], court: true }),
        c.plan({ dur: 5.8, cam: c.camActeur(moi2, { cote: 0.9, d: 2.2, buste: true }), acteurs: [moi2], son: 'page', dit: ['Le registre s’en souviendra. Il se souvient de tout.'] }),
      ];
    },
  },
});

// ============================================================================ LA CLÉ DE LA GRANDE PORTE (le bibliothécaire ; un livre creux de la galerie)
// (bibliotheque2.sortir et .rentrer emballés : prêtée ou prise, puis rendue)
if (typeof bibliotheque2 !== 'undefined') {
  const _so = bibliotheque2.sortir.bind(bibliotheque2), _re = bibliotheque2.rentrer.bind(bibliotheque2);
  bibliotheque2.sortir = function (mode, o) {
    const r = _so(mode, o);
    try { const C = this.C(); if (r && C.mode && !q20c.S().cle) { q20c.note('cle', { mode: C.mode }); q20.declencher('q20c_cle_porte', 'demande'); } } catch (e) { console.error('q20c', e); }
    return r;
  };
  bibliotheque2.rentrer = function (comment) {
    const r = _re(comment);
    try { const K = q20c.S().cle; if (K && !K.rendu) { K.rendu = farm.s.day; K.comment = comment || ''; q20.declencher('q20c_cle_porte', 'fin'); } } catch (e) { console.error('q20c', e); }
    return r;
  };
}
q20.scenes('q20c_cle_porte', {
  qui: 'libraire', titre: 'La clé de la Grande Porte',
  etat() { const K = q20c.S().cle; return q20cE('La clé de la Grande Porte', K, !!K && !K.rendu, !!K && !!K.rendu, K ? K.mode : null); },
  demande(c) {
    const vol = c.choix === 'vol', G = c.lieu('grande_porte');
    const et = Q20H.meuble(c, 'bibliotheque', 'etagere');
    const moi = vol ? null : q20cComptoir(c, { geste: ['tend', 'parle'] });
    const cle = moi && c.chose(Q20C_D2.cle_fer, Q20C.enMain(c, moi, 1.04, 0.42), { r: moi.cap, s: 1.1 });
    const lc = et && c.chose(Q20C_D2.livre_creux, c.haut(et.P, 1.1), { r: et.r || 0, s: 1.1 });
    return [
      vol
        ? c.plan({ dur: 6.2, cam: et ? c.camChose(c.haut(et.P, 1.1), { d: 1.6, a: (et.r || 0) + 0.4 }) : c.camLieu('bibliotheque'), acteurs: [lc], heure: c.nuit() ? c.h : 23.2, son: 'murmure', dit: ['(Le papier creusé, la clé dedans. Le registre l’inscrira quand même, d’une encre qui ne sèche pas.)', ''], court: true })
        : c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.4, d: 2.2, buste: true }), acteurs: [moi, cle], son: 'piece', dit: ['La caution au registre. Rendue au retour, à l’heure. Pas une minute de plus.'], court: true }),
      c.plan({ dur: 6, cam: c.camLieu(G, { d: 46, haut: 5, dy: 8, monte: 2 }), heure: 17.6, dit: vol ? ['(Trois jours, pour la rapporter.)', ''] : ['Ce qu’elle ouvre ne se referme pas tout seul. Souvenez-vous-en, là-bas.'] }),
    ];
  },
  fins: {
    pret(c) {
      const moi = q20cComptoir(c, { geste: ['offre'] });
      const pi = moi && c.chose(Q20C_D2.piecess, Q20C.enMain(c, moi, 1.02, 0.4), { s: 1.6, r: moi.cap });
      const moi2 = q20cComptoir(c, { geste: ['baisse'] });
      return [
        c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.4, d: 2.2, buste: true }), acteurs: [moi, pi], son: 'piece', dit: ['« À l’heure. »'], court: true }),
        c.plan({ dur: 6, cam: c.camActeur(moi2, { cote: 1.1, d: 2.4 }), acteurs: [moi2], dit: ['Il range la clé sans la regarder. Il ne demande pas ce qu’il y a de l’autre côté.', ''] }),
      ];
    },
    vol(c) {
      const moi = q20cComptoir(c, { geste: ['raide', 'tend'], regard: 'camera' });
      const et = Q20H.meuble(c, 'bibliotheque', 'etagere');
      return [
        c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.15, d: 2.0 }), acteurs: [moi], dit: ['« Bien. »'], court: true }),
        c.plan({ dur: 6, cam: et ? c.camChose(c.haut(et.P, 1.1), { d: 1.7, a: (et.r || 0) + 0.5 }) : c.camActeur(moi, { cote: 1.2 }), acteurs: [et && c.chose(Q20C_D2.livre_creux, c.haut(et.P, 1.1), { r: et.r || 0, s: 1.1 })], dit: ['(Il ne demande pas d’où elle vient. La clé retrouve sa place, comme une main dans un gant.)', ''] }),
      ];
    },
  },
});

// ============================================================================ UN VISAGE, LA NUIT (Marthe Aubry, la lavandière de nuit ; le lavoir)
function q20cLavoir(c) {
  const L = c.w.lavoir, Lm = c.lieu('lavoir');
  if (L && L.f) return { P: [L.x, c.sol(L.x, L.z), L.z], f: L.f, L: Lm || { x: L.x, z: L.z, y: c.sol(L.x, L.z), r: 8, P: [L.x, c.sol(L.x, L.z), L.z] } };
  return Lm ? { P: Lm.P, f: null, L: Lm } : null;
}
q20.scenes('q20c_lavandiere', {
  souv: 'q20c:lavandiere', titre: 'Un visage, la nuit',
  etat() {
    if (typeof lavandiere === 'undefined' || !farm.s) return q20cE('Un visage, la nuit', null, false, false);
    const S = lavandiere.S();
    const N = q20c.S().lav;
    return q20cE('Un visage, la nuit', S.n > 0 ? S : null, S.n > 0 && !S.apaise, !!S.apaise, null, !!(N && N.drap));
  },
  tournantSi() { const N = q20c.S().lav; return !!(N && N.drap); },
  delais: { tournant: 1.2 },
  demande(c) {
    const N = q20c.S().lav, qui = (N && npcs.byId[N.qui] && N.qui) || 'guerisseuse';
    const moi = npcs.byId[qui] ? Q20H.seuil(c, qui, { d: 0.9, geste: ['raide', 'parle'] }) : null;
    const La = q20cLavoir(c);
    return [
      c.plan({ dur: 6.6, cam: moi ? c.camActeur(moi, { cote: 0.4, d: 2.2 }) : c.camLieu(La.L), acteurs: [moi], dit: ['Une femme trempée, la nuit ? C’est Marthe Aubry. Elle s’est noyée au lavoir, en lavant le linceul de son petit.', '@' + qui], court: true }),
      c.plan({ dur: 6.2, cam: c.camLieu(La.L, { d: 11, haut: 2.0, dy: 0.6 }), heure: c.heure('nuit'), son: 'coups', acteurs: [c.chose(Q20C_D2.drap, c.haut(La.P, 0.55), { r: 0.4 })], dit: ['Si elle vous tend le drap, prenez l’autre bout. Et tordez comme elle. Jamais dans l’autre sens.', '@' + qui] }),
    ];
  },
  tournant(c) {
    const La = q20cLavoir(c);
    if (!La) return null;
    const a = La.f ? La.f.r : 0.6;
    const J = c.joueur(c.devant(La.P, a, 1.4), { face: La.P, geste: 'tend' });
    const elle = c.gens('q20c_marthe', c.devant(La.P, a + Math.PI, 1.5), { face: La.P, geste: ['tend', 'baisse'] });
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(J, { cote: 2.4, d: 3.0, avec: elle, k: 0.5 }), acteurs: [J, elle, c.chose(Q20C_D2.drap, c.haut(La.P, 0.55), { r: a })], heure: c.heure('nuit'), lum: [c.lueur(La.P, 4, [0.55, 0.6, 0.7], 0.8)], son: 'murmure' }),
      c.plan({ dur: 5.2, cam: c.camActeur(elle, { cote: 0.2, d: 2.2, buste: true }), acteurs: [elle], heure: c.heure('nuit'), lum: [c.lueur(La.P, 3, [0.55, 0.6, 0.7], 0.8)] }),
    ];
  },
  fin(c) {
    const La = q20cLavoir(c), Ci = c.lieu('cimetiere');
    const a = La && La.f ? La.f.r : 0.6;
    const elle = La && c.gens('q20c_marthe', c.devant(La.P, a + Math.PI, 2.0), { cap: a + Math.PI, vers: c.devant(La.P, a + Math.PI, 6.0), t0: 1.2, t1: 6.0 });
    return [
      c.plan({ dur: 6.6, cam: La ? c.camLieu(La.L, { d: 9, haut: 1.8, dy: 0.6, a: a + 0.4 }) : null, acteurs: [elle, La && c.chose(Q20C_D2.drap_plie, c.haut(La.P, 0.55), { r: a })], heure: 5.9, dit: ['Merci. Il est propre, maintenant. Je peux le lui porter.', '???'], court: true }),
      c.plan({ dur: 6, cam: c.camLieu(Ci, { d: 22, haut: 3, dy: 1 }), heure: 6.3, son: 'cloche', dit: ['(Le battoir ne sonnera plus.)', ''] }),
    ];
  },
});
q20c.guetter('q20c_lavandiere', () => { if (typeof lavandiere === 'undefined') return null; return lavandiere.S().apaise ? 'fin' : null; });

// ============================================================================ LES PETITS (les gobelins : la vieille souche, la Gobelinière)
function q20cGob() { try { return typeof gobelins !== 'undefined' && farm.s ? gobelins.S() : null; } catch (e) { return null; } }
function q20cSouche(c) { try { const P = gobelins.souche(); return P ? c.pt(P.x, P.z) : null; } catch (e) { return null; } }
q20.scenes('q20c_petits', {
  souv: 'q20c:petits', titre: 'Les Petits',
  etat() {
    const S = q20cGob();
    if (!S) return q20cE('Les Petits', null, false, false);
    const pacte = S.pacte > 0 && !S.pacteRompu, partis = gobelins.partis();
    return q20cE('Les Petits', S.connu && S.connu.signe ? S : null, !!(S.connu && S.connu.signe) && !pacte && !partis, pacte || partis, partis ? 'partis' : pacte ? 'pacte' : null, !!(S.connu && S.connu.village));
  },
  tournantSi(E) { return !!(E.Q && E.Q.connu && E.Q.connu.village); },
  demande(c) {
    const G = c.w.gobelins, mq = G && G.marques && G.marques[0] ? G.marques[0] : null;
    const Pm = mq ? [mq.x, mq.y, mq.z] : c.lieu('place').P;
    const So = q20cSouche(c) || c.lieu('gob_souche');
    const lisiere = So && Q20H.libre(c, c.devant(Array.isArray(So) ? So : So.P, 1.9, 9), 0, 6, 0.5);
    const petit = lisiere && c.bete('x_gobelin', lisiere, { cap: 2.2 });
    return [
      c.plan({ dur: 6, cam: c.camChose(Pm, { d: 1.6, haut: 1.0, dy: 0.3, a: mq ? (mq.q && mq.q.r) || 0.4 : 0.4 }), acteurs: [], dit: ['(Trois griffes et un rond. Les mêmes, partout où quelque chose manque.)', ''], court: true }),
      c.plan({ dur: 6.2, cam: lisiere ? c.camChose(lisiere, { d: 11, haut: 1.4, dy: 0.4, a: 4.4 }) : c.camLieu('gob_souche'), acteurs: [petit], heure: c.heure('nuit'), son: 'murmure', dit: ['(La nuit, au bord des haies, quelque chose de petit longe les murs. Il ramasse.)', ''] }),
    ];
  },
  tournant(c) {
    const So = q20cSouche(c);
    if (!So) return null;
    return [
      c.plan({ dur: 6.4, cam: c.camChose(So, { d: 5.5, haut: 1.4, dy: 0.6, a: 1.2 }), acteurs: [], heure: c.heure('nuit'), lum: [c.lueur(So, 2.6, [1.0, 0.7, 0.35], 0.2)], son: 'murmure' }),
      c.plan({ dur: 5.4, cam: c.camLieu(So, { d: 18, haut: 2.2, dy: 1.5 }), acteurs: [], heure: c.heure('aube') }),
    ];
  },
  fins: {
    pacte(c) {
      const F = c.maison('ferme'), Pp = F ? F.dehors(0.8, 0.4) : c.lieu('ferme').P;
      const haie = F && Q20H.libre(c, F.dehors(14, -6), 0, 6, 0.5);
      return [
        c.plan({ dur: 6.4, cam: c.camChose(Pp, { d: 2.2, haut: 1.1, dy: 0.1, a: F ? F.cap : 0 }), acteurs: [c.chose(Q20C_D2.present, Pp, { s: 1.4 })], heure: 6.2, dit: ['« Rien de chez toi. Rien de chez nous. » (Une voix d’enfant, une voix de vieille, la vôtre.)', 'La vieille'], court: true }),
        c.plan({ dur: 5.6, cam: haie ? c.camChose(haie, { d: 12, haut: 1.4, dy: 0.4, a: F.cap + 2.6 }) : c.camLieu('ferme'), acteurs: [haie && c.bete('x_gobelin', haie, { face: Pp })], heure: 6.0, dit: ['(Au bord de la haie, quelque chose regarde, puis s’enfonce dans la terre.)', ''] }),
      ];
    },
    partis(c) {
      const So = q20cSouche(c) || (c.lieu('gob_souche') && c.lieu('gob_souche').P);
      const file = So ? [0, 1, 2, 3, 4].map((k) => { const P = Q20H.libre(c, c.devant(So, 2.6, 4 + k * 2.4, (k % 2) * 0.8), 0, 2, 0.4); return c.bete('x_gobelin', P, { cap: 2.6, vers: c.devant(P, 2.6, 6), t0: k * 0.4, t1: 6 + k * 0.4 }); }) : [];
      return [
        c.plan({ dur: 6.8, cam: So ? c.camChose(c.devant(So, 2.6, 8), { d: 13, haut: 1.8, dy: 0.4, a: 1.0 }) : c.camLieu('place'), acteurs: file, heure: c.heure('nuit'), son: 'murmure', dit: ['(Une file de petites ombres, de la souche vers les monts. Elles ne se retournent pas.)', ''], court: true }),
        c.plan({ dur: 5.4, cam: c.camLieu(c.lieu('place'), { d: 26, haut: 5 }), heure: 6.4, dit: ['(Au matin, il n’y a plus de marques nulle part.)', ''] }),
      ];
    },
  },
});
q20c.guetter('q20c_petits', () => {
  const S = q20cGob();
  if (!S || !S.connu) return null;
  if ((S.pacte > 0 && !S.pacteRompu) || gobelins.partis()) return 'fin';
  return S.connu.signe ? 'demande' : null;
});

// ============================================================================ LE BARON DE LANCRY (le Grand Cercle ; sa fin, après minuit, est déjà filmée)
function q20cBaron() { try { return typeof c18 !== 'undefined' && farm.s ? c18.S().quete : null; } catch (e) { return null; } }
q20.scenes('q20c_baron', {
  souv: 'q20c:cercle', titre: 'Le baron de Lancry',
  etat() { const Q = q20cBaron(); return q20cE('Le baron de Lancry', Q && Q.e >= 1 ? Q : null, !!Q && Q.e >= 1 && Q.e < 5, !!Q && Q.e >= 5, null, !!Q && Q.e >= 4); },
  tournantSi(E) { return !!(E.Q && E.Q.e >= 4); },
  demande(c) {
    const ba = Q20H.meuble(c, 'casino', 'c18_bar');
    const gris = ba && c.gens('q20c_gris', c.devant(ba.P, (ba.r || 0) + Math.PI, 0.9, 0.8, true), { cap: ba.r || 0, geste: ['baisse'] });
    const ro = Q20H.meuble(c, 'casino', 'c18_roulette');
    const od = ro && c.gens('q20c_odile', c.devant(ro.P, ro.r || 0, 1.1, 0, true), { face: ro.P, geste: ['parle'] });
    return [
      c.plan({ dur: 6, cam: c.camLieu(c.maison('casino') ? c.maison('casino').porte : 'casino', { d: 15, haut: 2.4, dy: 3.2 }), heure: 22.5, dit: ['(Le carnet du baron de Lancry. Des colonnes de chiffres, et partout, le zéro.)', ''], court: true }),
      c.plan({ dur: 6.4, cam: od ? c.camActeur(od, { cote: 0.5, d: 2.6, avec: gris || undefined, k: 0.3 }) : c.camLieu('casino'), acteurs: [od, gris], heure: 23.5, dit: ['Le baron ? Il jouait le zéro. Il le joue encore. Demandez à Siméon, il tient le registre.', 'Odile'] }),
    ];
  },
  tournant(c) {
    const ro = Q20H.meuble(c, 'casino', 'c18_roulette'), ba = Q20H.meuble(c, 'casino', 'c18_bar');
    const gris = ba && c.gens('q20c_gris', c.devant(ba.P, (ba.r || 0) + Math.PI, 0.9, 0.8, true), { cap: ba.r || 0, regard: 'camera' });
    return [
      c.plan({ dur: 6, cam: ro ? c.camChose(c.haut(ro.P, 0.95), { d: 1.9, a: (ro.r || 0) + 0.5 }) : c.camLieu('casino'), acteurs: [ro && c.chose(Q20C_D2.jeton_noir, c.haut(ro.P, 0.97), { s: 1.6 })], heure: 0.5, dit: ['« Je reviendrai le reprendre. » (La lettre du baron, jamais envoyée.)', ''] }),
      c.plan({ dur: 5.6, cam: gris ? c.camActeur(gris, { cote: 0.2, d: 2.4 }) : c.camLieu('casino'), acteurs: [gris], heure: 0.6 }),
    ];
  },
});

// ============================================================================ LE SERVICE À LA LOGE (le Grand Hôtel des Cimes : M. Brissac)
// (hotelService.prendre et .finir emballés : le premier service, et son dernier client)
if (typeof hotelService !== 'undefined') {
  const _pr = hotelService.prendre.bind(hotelService), _fi = hotelService.finir.bind(hotelService);
  hotelService.prendre = function () { const r = _pr(); try { if (!q20c.S().loge) { q20c.note('loge'); q20.declencher('q20c_loge', 'demande'); } } catch (e) { console.error('q20c', e); } return r; };
  hotelService.finir = function (tot) {
    // (le service entier, ou quitté avant l'heure : la moitié des gages)
    let entier = 1;
    try { const sv = hotel18.S().service; entier = !sv || !tot || farm.s.hours >= sv.fin - 0.05 ? 1 : 0; } catch (e) { entier = 1; }
    const r = _fi(tot);
    try { const L = q20c.S().loge; if (L && !L.fini) { L.fini = farm.s.day; L.entier = entier; q20.declencher('q20c_loge', 'fin'); } } catch (e) { console.error('q20c', e); }
    return r;
  };
}
function q20cHotel(c) {
  const V = c.w.l18, T = c.lieu('l18_terrasse'), H = c.lieu('l18_hotel');
  const pl = V && V.places && V.places.terrasse_d;
  return { V, T, H, P: pl ? [pl.p[0], c.sol(pl.p[0], pl.p[2], pl.p[1]), pl.p[2]] : T ? T.P : null, cap: pl ? pl.cap : 0 };
}
q20.scenes('q20c_loge', {
  souv: 'q20c:hotel', titre: 'Le service à la loge',
  etat() { const L = q20c.S().loge; let sv = null; try { sv = typeof hotel18 !== 'undefined' && farm.s ? hotel18.S().service : null; } catch (e) { sv = null; } return q20cE('Le service à la loge', L, !!L && !L.fini && !!sv && sv.jour === q20cJour(), !!L && !!L.fini, L && L.fini ? (L.entier ? 0 : 1) : null); },
  demande(c) {
    const K = q20cHotel(c);
    const br = K.P && c.gens('q20c_brissac', K.P, { cap: K.cap + Math.PI * 0.5, geste: ['bras', 'parle'] });
    const cl = K.P && c.gens('q20c_cliente', Q20H.libre(c, c.devant(K.P, K.cap, 3.2, 1.4), 0, 3, 0.4), { face: K.P });
    return [
      c.plan({ dur: 6, cam: c.camLieu(K.H, { d: 70, haut: 10, dy: 8, recul: 0.1 }), heure: 7.4, dit: ['Un service par jour, cinq heures. Les clients viennent à la loge : on accepte, ou l’on s’excuse.', 'M. Brissac'], court: true }),
      c.plan({ dur: 6.4, cam: br ? c.camActeur(br, { cote: 0.6, d: 3.0, avec: cl || undefined, k: 0.3 }) : c.camLieu(K.T), acteurs: [br, cl], heure: 7.8, dit: ['Tout doit briller. Rien ne doit se savoir. Allez, la sonnette.', 'M. Brissac'] }),
    ];
  },
  fins: {
    0(c) {
      const K = q20cHotel(c);
      const br = K.P && c.gens('q20c_brissac', K.P, { cap: K.cap + Math.PI * 0.5, geste: ['offre', 'parle'] });
      const J = br && Q20H.face(c, br, 1.5, 0.2);
      return [
        c.plan({ dur: 6.2, cam: br ? c.camActeur(br, { cote: 0.5, d: 2.6, avec: J, k: 0.3 }) : c.camLieu(K.T), acteurs: [br, J], heure: 17.6, son: 'piece', dit: ['Vos gages. Et le pourboire, puisque vous l’avez mérité.', 'M. Brissac'], court: true }),
        c.plan({ dur: 5.8, cam: c.camLieu(K.T, { d: 30, haut: 6, dy: 2 }), heure: 17.5, dit: ['Demain, à la même heure. Et pas un mot de ce que vous avez vu.', 'M. Brissac'] }),
      ];
    },
    1(c) {
      const K = q20cHotel(c);
      const br = K.P && c.gens('q20c_brissac', K.P, { cap: K.cap + Math.PI * 0.5, geste: ['bras', 'raide'] });
      return [
        c.plan({ dur: 6.2, cam: br ? c.camActeur(br, { cote: 0.3, d: 2.4 }) : c.camLieu(K.T), acteurs: [br], heure: 14.5, dit: ['Parti avant l’heure ? La moitié des gages. Une maison comme celle-ci ne se tient pas à moitié.', 'M. Brissac'], court: true }),
        c.plan({ dur: 5.8, cam: c.camLieu(K.H, { d: 60, haut: 8, dy: 8 }), heure: 15, dit: ['(La sonnette de la loge sonne encore, derrière vous.)', ''] }),
      ];
    },
  },
});

// ============================================================================ L'AVIS DE RECHERCHE (le garde ; le panneau de la place)
function q20cRecherche() { try { return typeof societe !== 'undefined' && farm.s ? societe.recherche() : null; } catch (e) { return null; } }
function q20cPanneau(c) {
  const T = c.w.town2 && c.w.town2.board, pa = T && Q20H.pres(c, c.pt(T[0], T[1]), 'panneau_affichage', 3);
  if (pa) return { P: pa.P, r: pa.r };
  const P = c.lieu('place');
  return P ? { P: P.P, r: 0 } : null;
}
q20.scenes('q20c_avis', {
  qui: 'garde', titre: 'Avis de recherche',
  etat() {
    const R = q20cRecherche(), A = q20c.S().avis;
    return q20cE('Avis de recherche', A || null, !!R, !!A && !!A.fin && !R, A && A.fin ? A.fin : null);
  },
  demande(c) {
    const Pa = q20cPanneau(c), R = c.Q || {};
    const moi = Pa && c.habitant(npcs.alive('garde') ? 'garde' : 'maire', c.devant(Pa.P, Pa.r + Math.PI, 0.9), { face: Pa.P, geste: 'travaille', main: 'marteau' });
    const af = Pa && c.chose('affiche_recherche', c.haut(c.devant(Pa.P, Pa.r + Math.PI, 0.04, 0.42, true), 1.02), { r: Pa.r + Math.PI });
    const gens = Pa ? ['boulangere', 'grainetiere'].filter((id) => npcs.alive(id)).map((id, k) => c.habitant(id, c.devant(Pa.P, Pa.r + Math.PI, 2.6, k ? 1.0 : -0.9), { face: Pa.P, geste: k ? 'bras' : 'baisse' })) : [];
    const prime = (R && R.prime) || ((q20cRecherche() || {}).prime) || 0;
    const qui = moi && moi.id === 'maire' ? '@maire' : '@garde';
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 2.4, d: 2.8, avec: Pa && c.haut(Pa.P, 1.0), k: 0.35 }), acteurs: [moi, af], son: 'coups', dit: [prime ? `On cloue votre portrait à chaque porte. ${prime} pièces, c’est le prix.` : 'On cloue votre portrait à chaque porte.', qui], court: true }),
      c.plan({ dur: 6, cam: gens.length ? c.camActeur(gens[0], { cote: 2.5, d: 3.6, avec: c.haut(Pa.P, 1.0), k: 0.5, aussi: gens[1] ? [c.tete(gens[1])] : undefined }) : c.camChose(Pa.P, { d: 3 }), acteurs: [...gens, af], dit: gens.length ? ['C’est {fermier}, de la vieille ferme… Qui l’aurait cru.', '@' + gens[0].id] : ['(Votre visage, mal dessiné, et pourtant c’est bien vous.)', ''] }),
    ];
  },
  fins: {
    payee(c) {
      const Pa = q20cPanneau(c);
      const moi = Pa && c.habitant(npcs.alive('garde') ? 'garde' : 'maire', c.devant(Pa.P, Pa.r + Math.PI, 0.8), { face: Pa.P, geste: { reach: 0.6, lookP: -0.2 } });
      const qui = moi && moi.id === 'maire' ? '@maire' : '@garde';
      return [
        c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 1.7, d: 3.0, avec: Pa && c.haut(Pa.P, 1.0), k: 0.3 }), acteurs: [moi], dit: ['C’est réglé. On retire les affiches. Que je ne vous y reprenne pas.', qui], court: true }),
        c.plan({ dur: 5.8, cam: c.camChose(Pa.P, { d: 3.4, haut: 1.6, dy: 1.0, a: Pa.r + Math.PI + 0.4 }), heure: 17.7, dit: ['(Une trace plus claire sur le bois, là où était votre visage.)', ''] }),
      ];
    },
    cachot(c) {
      const M = c.maison('garde'), moi = npcs.alive('garde') ? Q20H.seuil(c, 'garde', { d: 1.4, geste: ['bras'] }) : null;
      const J = M && c.joueur(M.dehors(3.2, 1.0), { cap: M.cap, geste: 'baisse' });
      return [
        c.plan({ dur: 6.4, cam: c.camActeur(J, { cote: 2.4, d: 3.6, avec: moi || undefined, k: 0.4 }), acteurs: [J, moi], heure: 6.4, dit: ['On vous rend vos affaires. La dette est payée en jours de cachot.', moi ? '@garde' : ''], court: true }),
        c.plan({ dur: 5.6, cam: c.camLieu(c.lieu('place'), { d: 24, haut: 4 }), heure: 7, dit: ['(Les affiches ont disparu. Les regards, pas tout à fait.)', ''] }),
      ];
    },
  },
  fin(c) {
    const Pa = q20cPanneau(c);
    return [
      c.plan({ dur: 6.4, cam: c.camChose(Pa.P, { d: 3.2, haut: 1.6, dy: 1.0, a: Pa.r + Math.PI + 0.5 }), acteurs: [c.chose('affiche_recherche', c.haut(c.devant(Pa.P, Pa.r + Math.PI, 0.04, 0.42, true), 1.02), { r: Pa.r + Math.PI })], heure: 17, dit: ['(L’affiche a pâli. Plus personne ne la regarde.)', ''], court: true }),
      c.plan({ dur: 5.6, cam: c.camLieu(c.lieu('place'), { d: 24, haut: 4 }), heure: 17.5, dit: ['(On a fini par oublier. Pas tout le monde.)', ''] }),
    ];
  },
});
q20c.guetter('q20c_avis', () => {
  const R = q20cRecherche(), S = q20c.S();
  if (R) { if (!S.avis) S.avis = { j: farm.s.day, prime: R.prime }; return 'demande'; }
  if (S.avis && !S.avis.fin) {
    // la raison : celle du dernier crime levé (payée, cachot, ou le temps)
    let fin = 'autre';
    try { const L = societe.S().crimes.filter((C) => C.leve); const C = L[L.length - 1]; if (C && (C.leve === 'payee' || C.leve === 'cachot')) fin = C.leve; } catch (e) { /* rien */ }
    S.avis.fin = fin;
    return 'fin';
  }
  return null;
});

// ============================================================================ L'HOMME AU MASQUE (le garde, ou le maire)
function q20cTueur() { try { return typeof strange !== 'undefined' && strange.s ? strange.s : null; } catch (e) { return null; } }
function q20cGarde() { return npcs.alive('garde') ? 'garde' : 'maire'; }
q20.scenes('q20c_masque', {
  qui: 'garde', titre: 'L’homme au masque',
  etat() {
    const S = q20cTueur();
    if (!S) return q20cE('L’homme au masque', null, false, false);
    const v = (S.victims || []).length;
    return q20cE('L’homme au masque', v ? S : null, v > 0 && !S.kCaught && !S.kDead, !!(S.kCaught || S.kDead), S.kCaught ? 'pris' : S.kDead ? 'mort' : null, farm.count('masque') > 0);
  },
  tournantSi() { return farm.count('masque') > 0; },
  demande(c) {
    const S = c.Q, vi = S && S.victims && S.victims[0], M = vi && c.maison(vi);
    const P0 = M ? M.dehors(1.4, 0.6) : c.lieu('place').P;
    const g = q20cGarde(), moi = c.habitant(g, Q20H.libre(c, c.devant(P0, M ? M.cap : 0, 1.2, 1.2), 0, 3, 0.5), { face: P0, geste: ['baisse', 'bras'] });
    const nuit = c.lieu('place'), fig = nuit && c.gens('q20c_masque', Q20H.libre(c, c.devant(nuit.P, 2.2, 16), 0, 5, 0.5), { face: nuit.P });
    return [
      c.plan({ dur: 6.6, cam: c.camActeur(moi, { cote: 0.7, d: 3.0, avec: P0, k: 0.35 }), acteurs: [moi, c.chose('sang', c.haut(P0, 0.01), { r: 0.7 })], heure: 6.6, dit: ['La porte forcée, cette nuit. Quelqu’un d’ici. Quelqu’un qui connaît nos portes.', '@' + g], court: true }),
      c.plan({ dur: 6, cam: fig ? c.camActeur(fig, { cote: 0.3, d: 16, haut: 2 }) : c.camLieu(nuit), acteurs: [fig], heure: 23.4, son: 'murmure', dit: ['Si vous savez quelque chose, venez me le dire. À moi seul.', '@' + g] }),
    ];
  },
  tournant(c) {
    // (la maison du tueur ; une partie sans tueur — les essais — : une maison de la ville)
    const S = c.Q, k = (S && S.killer) || 'forgeron', M = c.maison(k) || c.maison('garde');
    const B = M && M.B, I = (c.w.inter || []).find((i) => i.id === 'indice');
    const P = I ? c.pt(I.x, I.z, B ? B.y : undefined) : M ? M.local(-(B.W / 2) + 1.0, -0.4) : null;
    if (!P) return null;
    return [
      c.plan({ dur: 6.4, cam: c.camChose(P, { d: 1.5, dy: 0.05 }), acteurs: [c.chose(Q20C_D2.masque, c.haut(P, 0.01), { s: 1.5 })], heure: 21.5, son: 'murmure' }),
      c.plan({ dur: 5.4, cam: M ? c.camLieu(M.porte, { d: 14, haut: 2.2, dy: 1.6 }) : c.camChose(P, { d: 3 }), acteurs: [], heure: 22 }),
    ];
  },
  fins: {
    pris(c) {
      const S = c.Q, k = S && S.killer, g = q20cGarde();
      const P = c.lieu('place'), a = P ? c.cap(P.P, c.lieu('garde') ? c.lieu('garde').P : P.P) : 0;
      const P0 = P && Q20H.libre(c, c.devant(P.P, a, 3), 0, 4, 0.6), P1 = P0 && c.devant(P0, a, 7);
      const lui = k && npcs.byId[k] && P0 ? c.habitant(k, P0, { vers: P1, t0: 0.5, t1: 6.5, geste: 'baisse' }) : null;
      const moi = P0 && c.habitant(g, c.devant(P0, a, -1.2, 0.5), { vers: c.devant(P1, a, -1.2, 0.5), t0: 0.5, t1: 6.5, lanterne: true });
      return [
        c.plan({ dur: 6.8, cam: P0 ? c.camChose(c.vers(P0, P1, 0.5), { d: 8, haut: 1.8, dy: 1.2, a: a + 1.6 }) : c.camLieu(P), acteurs: [lui, moi], heure: 21.2, dit: ['Avec ce que vous m’apportez, je n’ai plus le choix. La préfecture, ce soir même.', '@' + g], court: true }),
        c.plan({ dur: 5.6, cam: c.camLieu(P, { d: 24, haut: 4 }), heure: 7.2, son: 'cloche', dit: ['La vallée vous doit une fière chandelle.', npcs.alive('maire') ? '@maire' : '@' + g] }),
      ];
    },
    mort(c) {
      const Ci = c.lieu('cimetiere'), P = Ci && Q20H.libre(c, c.devant(Ci.P, 2.8, Ci.r + 3), 0, 5, 1.0);
      return [
        c.plan({ dur: 6.4, cam: P ? c.camChose(P, { d: 4, haut: 1.4, dy: 0.3 }) : c.camLieu(Ci), acteurs: [P && c.chose('tombe_neuve', P, { r: 0.4 })], heure: 6.2, dit: ['(On l’a enterré à l’écart, sans croix, sans nom.)', ''], court: true }),
        c.plan({ dur: 5.6, cam: c.camLieu(c.lieu('place'), { d: 24, haut: 4 }), heure: 7, dit: ['Il n’y a plus personne à craindre, la nuit. Personne de chez nous.', '@' + q20cGarde()] }),
      ];
    },
  },
});
q20c.guetter('q20c_masque', () => { const S = q20cTueur(); if (!S || !(S.victims || []).length) return null; return S.kCaught || S.kDead ? 'fin' : 'demande'; });

// ============================================================================ CE QUI PÈSE SUR VOUS (les malédictions : le curé, la guérisseuse)
q20.scenes('q20c_malediction', {
  qui: 'cure', titre: 'Ce qui pèse sur vous',
  etat() { const N = q20c.S().mal; let L = []; try { L = malediction.liste(); } catch (e) { L = []; } return q20cE('Ce qui pèse sur vous', N, !!N && !N.leve && L.length > 0, !!N && !!N.leve, N ? (N.qui === 'guerisseuse' ? 'guerisseuse' : 'cure') : null); },
  demande(c) {
    const gue = c.choix === 'guerisseuse';
    const moi = gue ? Q20H.seuil(c, 'guerisseuse', { d: 0.9, geste: ['raide', 'parle'] }) : Q20C.chez(c, 'cure', { geste: ['prie'] });
    const F = c.maison('ferme'), J = F && c.joueur(F.dehors(1.6), { cap: F.cap, geste: 'raide' });
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.4, d: 2.4 }), acteurs: [moi], dit: gue ? ['Ce qui est sur vous, je peux l’ôter. Contre ce que je veux. Ou réparez la faute, si vous savez laquelle.', '@guerisseuse'] : ['Confessez-vous, et donnez pour les pauvres. Ou réparez la faute, si vous le pouvez.', '@cure'], court: true }),
      c.plan({ dur: 6, cam: J ? c.camActeur(J, { cote: 2.8, d: 5, haut: 1.8 }) : c.camLieu('ferme'), acteurs: [J], heure: 22.8, son: 'murmure', dit: ['(Quelque chose sur vous. Il s’arrête quand vous vous retournez.)', ''] }),
    ];
  },
  fin(c) {
    const gue = c.choix === 'guerisseuse';
    const F = c.maison('ferme'), J = F && c.joueur(F.dehors(1.6), { cap: F.cap, geste: 'leve' });
    const moi = gue ? Q20H.seuil(c, 'guerisseuse', { d: 0.9, geste: ['hoche'] }) : Q20H.seuil(c, 'cure', { d: 1.4, geste: ['hoche', 'prie'] }, 'eglise');
    return [
      c.plan({ dur: 6.2, cam: J ? c.camActeur(J, { cote: 0.6, d: 3.4 }) : c.camLieu('ferme'), acteurs: [J], heure: 6.1, dit: ['(Ce qui pesait s’en est allé. Le jour se lève, et c’est seulement le jour.)', ''], court: true }),
      c.plan({ dur: 5.8, cam: c.camActeur(moi, { cote: 0.5, d: 2.6 }), acteurs: [moi], dit: gue ? ['C’est parti. Ne recommencez pas : la prochaine fois, je ne voudrai pas la même chose.', '@guerisseuse'] : ['Allez en paix. Et ne recommencez pas.', '@cure'] }),
    ];
  },
});
// (la levée : quand il n'y a plus rien sur vous)
q20c.guetter('q20c_malediction', () => { const N = q20c.S().mal; if (!N || N.leve) return null; let L = []; try { L = malediction.liste(); } catch (e) { return null; } if (!L.length) { N.leve = farm.s.day; return 'fin'; } return null; });

// ============================================================================ LE CARNET DE COMMANDES (le voiturier du roulage Bardin)
function q20cCmd() { try { return typeof commandes !== 'undefined' && farm.s ? commandes.S() : null; } catch (e) { return null; } }
function q20cLivraison(c) { let L = null; try { L = commandes.lieu(); } catch (e) { L = null; } if (L && isFinite(L.x)) return c.pt(L.x, L.z); const F = c.maison('ferme'); return F ? F.dehors(3) : c.lieu('ferme').P; }
q20.scenes('q20c_commande', {
  qui: 'voiturier', titre: 'Le carnet de commandes',
  etat() {
    const C = q20cCmd(), N = q20c.S().cmd, k = N && C && C.cmds.find((x) => x.id === N.id);
    return q20cE('Le carnet de commandes', N, !!N && !N.livre && !!k && (k.st === 'attente' || k.st === 'route'), !!N && !!N.livre);
  },
  demande(c) {
    const t = Q20H.meuble(c, 'ferme', 'table');
    const J = t ? c.joueur(c.devant(t.P, (t.r || 0) + Math.PI, 0.8, 0, true), { face: t.P, geste: ['travaille', 'baisse'] }) : null;
    const bon = t && c.chose(Q20C_D2.bon, c.haut(t.P, 0.79), { r: t.r || 0, s: 1.2 });
    const Lv = q20cLivraison(c), F = c.lieu('ferme');
    const ro = Lv && Q20H.libre(c, c.devant(Lv, 2.2, 26), 0, 8, 1.2);
    const vo = ro && c.gens('q20c_voiturier', ro, { face: Lv });
    const ch = ro && c.bete('horse', c.devant(ro, c.cap(ro, Lv), 1.6, 1.2), { face: Lv, v: 1 });
    return [
      c.plan({ dur: 6, cam: J ? c.camActeur(J, { cote: 1.0, d: 2.0, avec: t.P, k: 0.5 }) : c.camLieu(F), acteurs: [J, bon], son: 'page', dit: ['« Roulage Bardin. Livré le lendemain matin, au point de livraison. Payé d’avance. »', ''], court: true }),
      c.plan({ dur: 6, cam: vo ? c.camActeur(vo, { cote: 0.8, d: 7, haut: 2, avec: ch || undefined, k: 0.3 }) : c.camLieu(F), acteurs: [vo, ch], heure: 6.8, dit: ['(Au matin, une charrette, par la route.)', ''] }),
    ];
  },
  fin(c) {
    const Lv = q20cLivraison(c);
    const vo = Lv && c.gens('q20c_voiturier', Q20H.libre(c, c.devant(Lv, 2.2, 1.6), 0, 3, 0.5), { face: Lv, geste: ['parle', { reach: 0.2 }] });
    const pa = vo && vo.P && c.devant(vo.P, vo.cap + 2.4, 9);
    const ch = pa && c.bete('horse', pa, { cap: vo.cap + 2.4, v: 1, vers: c.devant(pa, vo.cap + 2.4, 5), t0: 2, t1: 6 });
    return [
      c.plan({ dur: 6.2, cam: vo ? c.camActeur(vo, { cote: 0.6, d: 2.8, avec: Lv, k: 0.4 }) : c.camChose(Lv), acteurs: [vo, c.chose(Q20_DESSINS.colis, Lv, { s: 1.8, r: 0.5 })], heure: 7.2, dit: ['Pour vous. C’est réglé d’avance. La tournée m’attend.', 'Le voiturier'], court: true }),
      c.plan({ dur: 5.8, cam: c.camChose(Lv, { d: 3.2, haut: 1.3, dy: 0.2, a: 2.2 }), acteurs: [c.chose(Q20_DESSINS.colis, Lv, { s: 1.8, r: 0.5 }), ch], heure: 7.4, son: 'cheval', dit: ['(Le colis, posé dans l’herbe, un peu humide de rosée.)', ''] }),
    ];
  },
});
q20c.guetter('q20c_commande', () => {
  const C = q20cCmd(), S = q20c.S();
  if (!C || !C.cmds.length) return null;
  if (!S.cmd) { const k = C.cmds.find((x) => x.st === 'attente' || x.st === 'route'); if (!k) return null; S.cmd = { j: farm.s.day, id: k.id }; return 'demande'; }
  if (S.cmd.livre) return null;
  const k = C.cmds.find((x) => x.id === S.cmd.id);
  if (k && k.st === 'livre') { S.cmd.livre = farm.s.day; return 'fin'; }
  return null;
});

// ============================================================================ LA CROIX SUR LA CARTE (la première carte au trésor)
function q20cCarte() { const s = farm.s; return s && Array.isArray(s.maps) && s.maps[0] ? s.maps[0] : null; }
q20.scenes('q20c_tresor', {
  souv: 'q20c:carte', titre: 'La croix sur la carte',
  etat() { const m = q20cCarte(); return q20cE('La croix sur la carte', m, !!m && !m.found, !!m && !!m.found); },
  demande(c) {
    const m = c.Q, X = m ? c.pt(m.x, m.z) : Q20C.autour(c, c.lieu('ferme'), 2.2, 160);
    const t = Q20H.meuble(c, 'ferme', 'table');
    const J = t ? c.joueur(c.devant(t.P, (t.r || 0) + Math.PI, 0.8, 0, true), { face: t.P, geste: 'penche' }) : null;
    return [
      c.plan({ dur: 6, cam: t ? c.camChose(c.haut(t.P, 0.79), { d: 1.3, a: (t.r || 0) + 0.3 }) : c.camLieu('ferme'), acteurs: [J, t && c.chose(Q20C_D2.carte_croix, c.haut(t.P, 0.79), { r: t.r || 0, s: 1.3 })], dit: ['(Une croix, à l’encre rousse. Autour, des arbres qui ne sont peut-être plus là.)', ''], court: true }),
      c.plan({ dur: 6, cam: c.camLieu(X, { d: 30, haut: 5, dy: 1 }), heure: 17.6, dit: ['(Quelque part par là. Trois coups de pelle, peut-être quatre.)', ''] }),
    ];
  },
  fin(c) {
    const m = c.Q, X = m ? c.pt(m.x, m.z) : Q20C.autour(c, c.lieu('ferme'), 2.2, 160);
    const J = X && c.joueur(Q20H.libre(c, c.devant(X, 0.8, 1.3), 0, 2, 0.4), { face: X, tient: 'pelle', geste: 'penche' });
    return [
      c.plan({ dur: 6.2, cam: c.camChose(X, { d: 2.4, haut: 1.4, dy: 0.1, a: 2.4 }), acteurs: [J, c.chose('coffre_tresor', c.haut(X, -0.15), { r: 0.6, data: { vide: true } })], son: 'piece', dit: ['(La croix ne mentait pas.)', ''], court: true }),
      c.plan({ dur: 5.8, cam: c.camLieu(X, { d: 24, haut: 4, dy: 1 }), acteurs: [J && Object.assign({}, J, { vu: false })], dit: ['(Quelqu’un l’avait enterré là. Quelqu’un qui comptait revenir.)', ''] }),
    ];
  },
});
q20c.guetter('q20c_tresor', () => { const m = q20cCarte(); if (!m) return null; return m.found ? 'fin' : 'demande'; });

// ============================================================================ LES RELIQUES DES ANCIENS (l'autel du cercle, à minuit)
function q20cReliques() { try { return typeof RELICS !== 'undefined' && farm.s ? RELICS.filter((r) => farm.s.flags['got_' + r] || farm.count(r) > 0).length : 0; } catch (e) { return 0; } }
function q20cCercle(c) { const I = (c.w.inter || []).find((i) => i.kind === 'altar'); return I ? c.pt(I.x, I.z) : c.lieu('cercle') && c.lieu('cercle').P; }
q20.scenes('q20c_reliques', {
  souv: 'q20c:vallee', titre: 'Les reliques des Anciens',
  etat() { const n = q20cReliques(), fini = !!(farm.s && farm.s.flags && farm.s.flags.apaisee); let tout = false; try { tout = myths.relicsHeld().length === RELICS.length; } catch (e) { tout = false; } return q20cE('Les reliques des Anciens', n || fini ? { n } : null, n > 0 && !fini, fini, null, tout); },
  tournantSi() { try { return myths.relicsHeld().length === RELICS.length; } catch (e) { return false; } },
  demande(c) {
    const Au = q20cCercle(c), Ce = c.lieu('cercle');
    return [
      c.plan({ dur: 6.6, cam: c.camLieu(Ce, { d: 24, haut: 3.2, dy: 1.4 }), heure: 23.8, son: 'murmure', dit: ['(Une relique des Anciens. Il y en a d’autres : onze, dit-on, réunies à l’autel du cercle, à minuit.)', ''], court: true }),
      c.plan({ dur: 5.8, cam: c.camChose(Au, { d: 2.6, haut: 1.4, dy: 0.6, a: 0.8 }), acteurs: [], heure: 0.2, lum: [c.lueur(Au, 3, [0.6, 0.7, 0.9], 1.0)], dit: ['(La pierre est tiède, comme si quelqu’un venait de s’y asseoir.)', ''] }),
    ];
  },
  tournant(c) {
    const Ce = c.lieu('cercle');
    return [
      c.plan({ dur: 6.4, cam: c.camLieu(Ce, { d: 40, haut: 6, dy: 2, monte: 2 }), heure: 23.6, son: 'cloche' }),
      c.plan({ dur: 5.4, cam: c.camChose(q20cCercle(c), { d: 3, haut: 1.5, dy: 0.6, a: 2.4 }), heure: 23.7, lum: [c.lueur(q20cCercle(c), 3, [0.6, 0.7, 0.9], 1.0)] }),
    ];
  },
  fin(c) {
    const Ce = c.lieu('cercle'), F = c.lieu('ferme'), Au = q20cCercle(c);
    return [
      c.plan({ dur: 6.6, cam: c.camLieu(Ce, { d: 26, haut: 3, dy: 1.4, recul: 0.2 }), heure: 5.8, chaque: Au ? Q20H.emet(c.haut(Au, 0.3), { n: 6, col: [0.92, 0.92, 0.95, 0.35], taille: 0.6, vie: 4, v: 0.5, vy: 0.2, r: 10 }) : null, dit: ['(Les treize pierres, une à une, se sont tournées vers vous. Puis plus rien.)', ''], court: true }),
      c.plan({ dur: 5.8, cam: Ce && F ? c.camRegard(Q20C.autour(c, Ce, c.cap(Ce.P, F.P), Ce.r + 6), c.haut(F.P, 6), { haut: 1.8 }) : c.camLieu(F), heure: 6.4, dit: ['(Les nuits rouges ne reviendront plus.)', ''] }),
    ];
  },
});
q20c.guetter('q20c_reliques', () => { if (farm.s.flags && farm.s.flags.apaisee) return 'fin'; return q20cReliques() > 0 ? 'demande' : null; });

// ============================================================================ LE CAVEAU DU BOIS (une dalle gravée, les runes)
function q20cCaveau(c) {
  const W = c.w.r15, D = W && W.portes && W.portes.caveau;
  if (D) return { D, P: [D.x, D.y, D.z], devant: D.devant ? [D.devant[0], c.sol(D.devant[0], D.devant[2]), D.devant[2]] : null, r: D.r };
  // (une vallée sans caveau : son lieu-dit, ou le bois près de la ferme)
  const L = c.lieu('r15_caveau') || c.lieu('ferme');
  return L ? { D: null, P: L.P, devant: Q20C.autour(c, L, 0, 2), r: 0 } : null;
}
function q20cRunes() { try { return typeof runes !== 'undefined' && farm.s ? runes.S() : null; } catch (e) { return null; } }
q20.scenes('q20c_caveau', {
  souv: 'q20c:vallee', titre: 'Le caveau du bois',
  etat() { const R = q20cRunes(), N = q20c.S().caveau; return q20cE('Le caveau du bois', N || (R && R.p.caveau ? R.p : null), (!!N || !!(R && R.p.caveau)) && !(R && R.c.caveau), !!(R && R.c.caveau), null, !!(R && R.p.caveau)); },
  tournantSi() { const R = q20cRunes(); return !!(R && R.p.caveau); },
  demande(c) {
    const K = q20cCaveau(c);
    if (!K) return null;
    return [
      c.plan({ dur: 6.4, cam: c.camLieu(K.P, { d: 10, haut: 2.0, dy: 1.2, a: K.r + Math.PI + 0.5 }), heure: 16.5, dit: ['(Un petit caveau de pierre moussue, au fond du bois. Personne n’en parle.)', ''], court: true }),
      c.plan({ dur: 5.8, cam: K.devant ? c.camChose(c.haut(K.devant, 1.1), { d: 1.8, a: K.r + Math.PI }) : c.camLieu(K.P), heure: 16.8, dit: ['(Une dalle gravée. Trois signes. Elle ne s’ouvrira pas pour n’importe qui.)', ''] }),
    ];
  },
  tournant(c) {
    const K = q20cCaveau(c);
    if (!K || !K.devant) return null;
    return [
      c.plan({ dur: 6, cam: c.camChose(c.haut(K.devant, 1.0), { d: 2.2, a: K.r + Math.PI + 0.3 }), heure: c.h, lum: [c.lueur(K.P, 3, [0.6, 0.75, 1.0], 0.9)], son: 'grondement' }),
      c.plan({ dur: 5.4, cam: c.camLieu(K.P, { d: 9, haut: 1.8, dy: 1.0, a: K.r + Math.PI - 0.6 }), heure: c.h }),
    ];
  },
  fin(c) {
    const K = q20cCaveau(c);
    if (!K) return null;
    const J = K.devant && c.joueur(K.devant, { cap: K.r, geste: 'penche' });
    return [
      c.plan({ dur: 6.4, cam: K.devant ? c.camActeur(J, { cote: 2.6, d: 3.0, haut: 1.5 }) : c.camLieu(K.P), acteurs: [J], lum: [c.lueur(K.P, 3, [1.0, 0.8, 0.5], 0.6)], son: 'piece', dit: ['(Ce qu’on avait mis là n’était pas pour vous. Ni pour personne.)', ''], court: true }),
      c.plan({ dur: 5.6, cam: c.camLieu(K.P, { d: 14, haut: 2.6, dy: 1.2 }), heure: 17.5, dit: ['(Le bois s’est tu. Il écoute, lui aussi.)', ''] }),
    ];
  },
});
// (la première fois qu'on regarde la dalle : son interaction, emballée au chargement)
HOOKS.load.push(() => {
  if (!HOOKS.inter.r15_porte || HOOKS.inter.r15_porte._q20c) return;
  const _f = HOOKS.inter.r15_porte;
  const f = (it) => { try { if (it && it.data && it.data.porte === 'caveau' && !q20c.S().caveau) { q20c.note('caveau'); q20.declencher('q20c_caveau', 'demande'); } } catch (e) { console.error('q20c', e); } return _f(it); };
  f._q20c = true;
  HOOKS.inter.r15_porte = f;
});
q20c.guetter('q20c_caveau', () => { const R = q20cRunes(); if (!R) return null; if (R.c.caveau) return 'fin'; return null; });
