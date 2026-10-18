// ============================================================================
//  LES SCÈNES DES QUÊTES (agent Q20C) — 3d. LES LÉGENDES DE LA VALLÉE
//  Les quatorze légendes (11-zzmyths.js) se racontent, puis mènent chacune à un
//  vrai secret (le carnet, onglet Légendes : la légende, son indice ; ce qu'on
//  a vu de ses yeux). Chacune a ses deux moments :
//  - la demande : celui qui la raconte (myths.hear : l'habitant, à sa porte,
//    avec une phrase de son récit), puis le lieu qu'elle dit, à l'heure qu'elle
//    dit (le bois de bouleaux à l'aube, le marais la nuit, l'abbaye au
//    crépuscule…), vu de loin ; lue dans un livre, la légende montre son lieu ;
//  - le dénouement (myths.found) : le lieu, au moment où on l'a vu de ses yeux,
//    et une phrase de ce qu'on y a trouvé.
//  myths.hear et myths.found emballés (ils notent qui a raconté) ; rien d'autre
//  ne change. Les Souvenirs les rangent sous « Les légendes de la vallée ».
// ============================================================================
Q20C_QUI['q20c:legendes'] = 'Les légendes de la vallée';
Object.assign(Q20_LOOKS, {
  q20c_moine: { skin: '#0c0c0e', hair: '#0c0c0e', hairStyle: 'court', hat: 'capuche', hatCol: '#2a241e', top: '#2e2822', bottom: '#2a241e', shoe: '#1a1612', coat: true, face: 'blankF', height: 1.04, build: 'mince' },
  q20c_cavalier: { skin: '#9a9ea4', hair: '#2a2a2e', hairStyle: 'court', hat: 'chapeau', hatCol: '#1a1a1e', top: '#3a3a40', bottom: '#2a2a30', shoe: '#18181c', coat: true, face: 'paleF', height: 1.06 },
});
const Q20C_D4 = {
  // un fer à cheval tombé dans l'herbe
  fer(PE) { const f = [0.55, 0.52, 0.5]; for (const s of [-1, 1]) PE.box(s * 0.055, 0.01, 0.01, 0.022, 0.014, 0.12, f, TL.iron, 0.4); PE.box(0, 0.01, -0.055, 0.13, 0.014, 0.022, f, TL.iron, 0.4); },
  // une poupée de paille aux bras en épis, nouée d'un ruban fané
  poupee(PE) { const p = [1.15, 0.95, 0.55]; PE.box(0, 0.11, 0, 0.06, 0.16, 0.05, p, TL.straw); PE.box(0, 0.22, 0, 0.06, 0.06, 0.05, p, TL.straw); PE.box(0, 0.16, 0, 0.24, 0.025, 0.03, p, TL.straw); PE.box(0, 0.14, 0.028, 0.065, 0.02, 0.004, [0.8, 0.45, 0.45], TL.cloth); },
  // une petite croix de bois verte de mousse
  croix(PE) { PE.box(0, 0.25, 0, 0.04, 0.5, 0.04, [0.45, 0.5, 0.32], TL.wood, 0.15); PE.box(0, 0.38, 0, 0.22, 0.04, 0.04, [0.45, 0.5, 0.32], TL.wood, 0.15); },
  // une goutte qui ne coule pas (elle luit à peine)
  goutte(PE) { PE.fl = FX_EMIT; PE.box(0, 0.02, 0, 0.018, 0.022, 0.018, [0.85, 0.95, 1.3], TL.plain); PE.fl = 0; },
};

// ---------------------------------------------------------------- les légendes : leur lieu, leurs heures, leurs mots
// lieu : les lieux-dits possibles ; hD, hF : l'heure de la demande (le lieu), du dénouement ; dit : une phrase du conteur ;
// lu : la même, lue dans un livre ; vu : ce qu'on a vu de ses yeux ; plus : de quoi faire chaque plan à sa façon
const Q20C_LEGENDES = {
  cerf_blanc: { lieu: ['clairiere', 'chene'], hD: 5.9, hF: 6.2, son: 'murmure',
    dit: 'Il n’est pas blanc comme la neige, le Cerf. Il est blanc comme le givre sur les carreaux. Il ne se montre qu’à l’aube.',
    vu: '(Au centre de la clairière, l’herbe est restée couchée là où il se tenait, encore tiède.)', bete: 'deer' },
  dame_du_lac: { lieu: ['lac'], hD: 23.4, hF: 23.8, son: 'eau', pierre: 'pierre_dame',
    dit: 'Avant le grand lac, il y avait les Eaux. Une fille du village y attendait son fiancé. Elle attend encore.',
    vu: '(Sur la pierre, entre les fleurs, une goutte tremble et ne coule pas. Le lac retient son souffle.)' },
  cloche_noyee: { lieu: ['lac'], hD: 17.6, hF: 6.4, son: 'cloche',
    dit: 'Au fond du grand lac, il y a un village. Les soirs de calme, on entend encore sa cloche.',
    vu: '(Le clocher sort de la vase comme un doigt levé. Il n’y a pas de cloche, et pourtant elle bourdonne.)' },
  treize_pierres: { lieu: ['cercle'], hD: 0.2, hF: 0.6, son: 'grondement',
    dit: 'Comptez les pierres du cercle : vous en trouverez douze. Les vieux disent qu’il y en a toujours treize.',
    vu: '(La pierre du centre glisse sur elle-même, avec un bruit de meule. Des marches descendent.)' },
  tresor_valmont: { lieu: ['chateau', 'ruines'], hD: 17.4, hF: 15.5, son: 'corbeau', coffre: true,
    dit: 'Les Valmont ont tenu la vallée quatre cents ans, du haut de leur butte. Leur or, personne ne l’a jamais retrouvé.',
    vu: '(La pelle heurte du bois, puis du fer. Le coffre des Valmont est lourd comme un remords.)' },
  bete_des_combes: { lieu: ['antre', 'combe'], hD: 17.6, hF: 22.8, son: 'grondement',
    dit: 'Ça a commencé à la Saint-Jean de 1764, par une petite bergère des Combes. Après, pendant trois ans, la Bête a pris ce qu’elle voulait.',
    vu: '(Au fond de l’antre, quelque chose respire, lentement, depuis bientôt cent cinquante ans.)' },
  feux_follets: { lieu: ['ilot', 'marais'], hD: 23.2, hF: 0.4, son: 'murmure', follets: true,
    dit: 'Le marais a pris du monde depuis qu’il y a du monde. Ne suivez pas les feux. Regardez où ils se rassemblent.',
    vu: '(Les follets se sont immobilisés autour du coffre, comme une assemblée qui regarde. Puis ils s’éteignent.)' },
  moine_sans_visage: { lieu: ['abbaye'], hD: 17.7, hF: 17.9, son: 'cloche', moine: true,
    dit: 'Il y avait parmi les moines un frère Anselme, un savant. On le voit encore passer, au crépuscule. Il n’a pas de visage.',
    vu: '(Derrière l’autel, un réduit sec comme un tiroir fermé depuis des siècles. Sur le pupitre, le grimoire.)' },
  frappeurs: { lieu: ['mine'], hD: 16.5, hF: 9.5, son: 'coups',
    dit: 'Dans la mine, on n’est jamais seul. Il y a là-dedans des petits gens, pas plus hauts qu’un genou. Ils frappent.',
    vu: '(Là où il n’y avait que de la roche, une fente s’est ouverte. Très loin, trois petits coups patients.)' },
  chene_des_ancetres: { lieu: ['chene'], hD: 17.5, hF: 5.9, son: 'hibou', dormir: true,
    dit: 'Le chêne était déjà vieux quand on a posé la première pierre de l’église. Il sera encore là quand nous n’y serons plus.',
    vu: '(Le rêve ne s’efface pas comme les autres. Il reste net, comme un souvenir qu’on vous aurait prêté.)' },
  puits_aux_souhaits: { lieu: ['vieux_puits', 'hameau_abandonne'], hD: 17.2, hF: 17.4, son: 'piece', puits: true,
    dit: 'Toutes les filles du hameau l’ont fait : une pièce dans le vieux puits, un vœu tout bas, et on se sauve sans se retourner.',
    vu: '(La pièce tombe bien plus longtemps que le puits n’est profond. Une voix remonte : on vous a entendu.)' },
  chasse_volante: { lieu: ['combe', 'cercle'], hD: 23.6, hF: 1.2, son: 'loup', chasse: true,
    dit: 'Le vieux seigneur de Valmont ne vivait que pour la chasse. Les nuits d’orage, il chasse encore. Là-haut.',
    vu: '(Quand vous vous relevez, il y a dans l’herbe un fer à cheval, encore chaud.)' },
  mere_des_moissons: { lieu: ['pierre_offrandes', 'ferme'], hD: 17.2, hF: 6.4, son: 'murmure', poupee: true,
    dit: 'Elle est dans le blé. Pas dans le grain : dans ce qui ondule quand il n’y a pas de vent. N’oubliez jamais sa part.',
    vu: '(Sur la pierre aux offrandes, une poupée de paille aux bras en épis, tiède comme un pain sorti du four.)' },
  lise: { lieu: ['tombe_lise', 'hameau_abandonne'], hD: 17.4, hF: 17.6, son: 'murmure', lise: true,
    dit: 'Lise Roux avait sept ans à l’automne de 1870. Une petite noiraude qui chantait faux et dessinait partout.',
    vu: '(Sous les ronces, une petite croix penche sur un tertre pas plus long qu’un enfant couché.)' },
};
// qui la raconte (celui qui l'a racontée ; sinon un habitant qui la connaît, vivant)
function q20cConteur(id) {
  // (myths retient qui l'a racontée ; lue dans un livre, personne)
  const H = farm.s && myths.st().heard[id];
  if (H && H.who && npcs.byId[H.who]) return H.who;
  if (H && !H.who) return null;
  for (const k in NPC_MYTHS) if (NPC_MYTHS[k].includes(id) && npcs.byId[k] && npcs.alive(k)) return k;
  return null;
}
function q20cLegLieu(c, L) { return Q20C.lieu(c, ...L.lieu) || c.lieu('place'); }

for (const id of MYTH_ORDER) {
  const L = Q20C_LEGENDES[id];
  if (!L) continue;
  const titre = () => (typeof MYTHS !== 'undefined' && MYTHS[id] ? MYTHS[id].titre : MYTH_FALLBACK[id] || id);
  q20.scenes('q20c_leg_' + id, {
    souv: 'q20c:legendes', titre: (MYTHS[id] && MYTHS[id].titre) || MYTH_FALLBACK[id] || id,
    etat() {
      const S = farm.s ? myths.st() : { heard: {}, found: {} }, h = S.heard[id], f = S.found[id];
      return q20cE(titre(), h || f ? { heard: h || null, found: f || null } : null, !!h && !f, !!f);
    },
    demande(c) {
      const qui = q20cConteur(id), Lx = q20cLegLieu(c, L);
      const moi = qui ? Q20H.seuil(c, qui, { d: 0.9, geste: ['parle', 'baisse'] }) : null;
      const plans = [];
      if (moi) plans.push(c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.5, d: 2.4 }), acteurs: [moi], dit: [L.dit, '@' + qui], court: true }));
      const ac = [], lum = [];
      if (L.bete && Lx) { const P = Q20C.autour(c, Lx, 2.0, (Lx.r || 10) * 0.7); if (P) ac.push(c.bete(L.bete, P, { cap: 2.4, white: true, s: 1.05 })); }
      if (L.moine && Lx) { const P = Q20C.autour(c, Lx, 0.8, (Lx.r || 10) * 0.6); if (P) ac.push(c.gens('q20c_moine', P, { cap: 1.2, vu: false, vers: c.devant(P, 1.2, 3), t0: 0.5, t1: 6 })); }
      if (L.lise && Lx) { const P = Q20C.autour(c, Lx, 2.6, 7); if (P) ac.push(c.gens('lise', P, { face: Lx.P, vu: false })); }
      if (L.follets && Lx) for (let k = 0; k < 5; k++) lum.push(c.lueur(c.devant(Lx.P, k * 1.3, 2 + k * 1.1), 2.2, [0.45, 0.75, 1.0], 0.8 + (k % 2) * 0.4));
      const camL = L.chasse && Lx ? c.camRegard(Lx.P, c.haut(Lx.P, 60), { haut: 1.6 }) : c.camLieu(Lx, { d: Math.max(18, (Lx.r || 10) * 1.6), haut: 3.2, dy: 1.4, recul: 0.15 });
      plans.push(c.plan({ dur: moi ? 6 : 7, cam: camL, acteurs: ac, heure: L.hD, lum, son: L.son, dit: moi ? ['(' + titre() + '.)', ''] : [L.dit, ''], court: !moi }));
      if (!moi) plans.push(c.plan({ dur: 5.4, cam: c.camLieu(Lx, { d: Math.max(28, (Lx.r || 10) * 2.2), haut: 6, dy: 1.2 }), heure: L.hD, acteurs: [], dit: ['(' + titre() + '.)', ''] }));
      return plans;
    },
    fin(c) {
      const Lx = q20cLegLieu(c, L), plans = [];
      let P = Lx && Lx.P, ac = [], lum = [], cam = null;
      if (L.pierre) { const p = Q20H.pres(c, Lx.P, L.pierre, Math.max(40, (Lx.r || 10) + 30)); if (p) { P = p.P; ac.push(c.chose(Q20C_D4.goutte, c.haut(p.P, 0.62), { s: 2 }), c.chose(Q20_DESSINS.couronne, c.haut(p.P, 0.58), { s: 0.5 })); lum.push(c.lueur(p.P, 2.6, [0.6, 0.75, 1.0], 0.8)); } }
      if (L.coffre && P) { const X = Q20C.autour(c, Lx, 1.4, 6); P = X; ac.push(c.chose('coffre_tresor', c.haut(X, -0.15), { r: 0.6, data: { vide: false } }), c.joueur(Q20H.libre(c, c.devant(X, 0.8, 1.3), 0, 2, 0.4), { face: X, tient: 'pelle', geste: 'penche', vu: false })); }
      if (L.follets && P) { const X = Lx.P; ac.push(c.chose('coffre_tresor', c.haut(X, -0.1), { r: 1.2, data: { vide: false } })); for (let k = 0; k < 6; k++) lum.push(c.lueur(c.devant(X, k * 1.05, 1.6), 1.6, [0.45, 0.75, 1.0], 0.9)); }
      if (L.poupee && P) { ac.push(c.chose(Q20C_D4.poupee, c.haut(P, 0.62), { s: 1.6 })); }
      if (L.lise && P) { ac.push(c.chose(Q20C_D4.croix, P, { s: 1 }), c.chose(Q20_DESSINS.couronne, c.devant(P, 0, 0.35, 0, true), { s: 0.5 })); const G = Q20C.autour(c, Lx, 2.8, 6); if (G) ac.push(c.gens('lise', G, { face: P, vu: false })); }
      if (L.chasse && P) { const X = Q20C.autour(c, Lx, 0.6, 3); P = X; ac.push(c.chose(Q20C_D4.fer, X, { s: 1.8 }), c.joueur(Q20H.libre(c, c.devant(X, 1.6, 1.0), 0, 2, 0.4), { face: X, geste: 'peur', vu: false })); }
      if (L.dormir && P) { const X = Q20C.autour(c, Lx, 2.2, 3.2); ac.push(c.joueur(X, { face: Lx.P, geste: 'assis' })); P = X; }
      if (L.puits && Lx) cam = Q20H.puits(c, Lx, { fond: -3 });
      if (L.bete && P) lum.push(c.lueur(P, 4, [0.95, 0.95, 1.0], 0.4));
      // (un grand lieu sans chose à montrer — le lac — : de la rive ; sinon la chose, de près)
      if (!cam) cam = P && !(P === Lx.P && (Lx.r || 0) > 40) ? c.camChose(P, { d: L.coffre || L.chasse || L.poupee ? 2.6 : 5, haut: 1.4, dy: 0.4, a: 0.9 }) : c.camLieu(Lx, { d: 46, haut: 2.4, dy: 0.6, recul: 0.1 });
      plans.push(c.plan({ dur: 6.6, cam, acteurs: ac, heure: L.hF, lum, son: L.son, dit: [L.vu, ''], court: true }));
      plans.push(c.plan({ dur: 5.6, cam: c.camLieu(Lx, { d: Math.max(22, (Lx.r || 10) * 1.8), haut: 4, dy: 1.2, recul: 0.15 }), heure: L.hF, acteurs: [], dit: ['(' + titre() + ' : vu de vos yeux.)', ''] }));
      return plans;
    },
  });
}
// (qui a raconté ; et le dénouement, quand on l'a vu de ses yeux)
{
  const _hear = myths.hear.bind(myths), _found = myths.found.bind(myths);
  myths.hear = function (id, who) {
    const neuf = farm.s && !this.heard(id);
    const r = _hear(id, who);
    try { if (neuf && Q20C_LEGENDES[id]) { const S = q20c.S(), N = S.leg || (S.leg = {}); N[id] = { j: farm.s.day, qui: who || '' }; q20.declencher('q20c_leg_' + id, 'demande'); } } catch (e) { console.error('q20c', e); }
    return r;
  };
  myths.found = function (id) {
    const neuf = farm.s && !this.isFound(id);
    const r = _found(id);
    try { if (neuf && Q20C_LEGENDES[id]) q20.declencher('q20c_leg_' + id, 'fin', { delai: 2 }); } catch (e) { console.error('q20c', e); }
    return r;
  };
}
