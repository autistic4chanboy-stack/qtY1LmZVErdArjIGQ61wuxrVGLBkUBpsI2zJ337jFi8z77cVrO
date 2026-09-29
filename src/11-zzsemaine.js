// ============================================================================
//  LE CALENDRIER : une semaine de douze jours, de Primedi à Vorndi (le jour dure
//  dix minutes, la nuit dix minutes). Chaque habitant a sa semaine : grand marché de Valbrume,
//  lessive au lavoir, jour de la Mère, jour de chasse, de pêche, messe de
//  l'Orédi, foire de Clairpré, veillées, jour chômé, jour des morts ; chacun a
//  aussi son jour à lui (une visite, une promenade). Les colporteurs vont d'un
//  village à l'autre selon le jour.
// ============================================================================
const SEMAINE = [
  { nom: 'Primedi', cle: 'semailles', annonce: '(Primedi. On sème, dans toute la vallée.)' },
  { nom: 'Ferdi', cle: 'fer', annonce: '(Ferdi. La forge sonnera tard ce soir.)' },
  { nom: 'Marchedi', cle: 'marche', annonce: '(Marchedi. Grand marché à Valbrume.)' },
  { nom: 'Lavedi', cle: 'lessive', annonce: '(Lavedi. Le linge claque déjà aux fenêtres.)' },
  { nom: 'Nahédi', cle: 'mere', annonce: '(Nahédi. Le jour de la Mère : on dépose des offrandes aux pierres.)' },
  { nom: 'Chassedi', cle: 'chasse', annonce: '(Chassedi. Les chasseurs battent les bois : prudence en forêt.)' },
  { nom: 'Pêchedi', cle: 'peche', annonce: '(Pêchedi. Les cannes sortent des granges.)' },
  { nom: 'Orédi', cle: 'messe', annonce: '(Orédi. Messe à dix heures en l’église de Valbrume.)' },
  { nom: 'Foiredi', cle: 'foire', annonce: '(Foiredi. Foire à Clairpré.)' },
  { nom: 'Veilledi', cle: 'veillee', annonce: '(Veilledi. On contera ce soir à l’auberge.)' },
  { nom: 'Chômedi', cle: 'chome', annonce: '(Chômedi. Les boutiques restent fermées.)' },
  { nom: 'Vorndi', cle: 'morts', annonce: '(Vorndi. Le jour des morts. On rentre avant la nuit.)' },
];
const cal = {
  dow(day) { const d = day ?? (farm.s ? farm.s.day : 1); return ((d - 1) % 12 + 12) % 12; },
  jour(day) { return SEMAINE[this.dow(day)]; },
  nom(day) { return this.jour(day).nom; },
  is(cle, day) { return this.jour(day).cle === cle; },
  // phrase d'annonce (les textes du monde, s'ils sont là, sinon la nôtre)
  annonce(day) { const i = this.dow(day), M = typeof MONDE !== 'undefined' && MONDE.jours && MONDE.jours[i]; return (M && M.annonce) || SEMAINE[i].annonce; },
  lignes(day) { const i = this.dow(day), M = typeof MONDE !== 'undefined' && MONDE.jours && MONDE.jours[i]; return (M && M.lignes) || []; },
};

// ---------------------------------------------------------------- la semaine de chacun
const ROUTINES = new Map();
const MARCHANDS = new Set(['boulangere', 'grainetiere', 'alchimiste', 'eleveuse']);
const BOUTIQUES = new Set(['boulangere', 'grainetiere', 'forgeron', 'alchimiste', 'libraire', 'postiere', 'aubergiste']);
function routineDuJour(n) {
  const s = farm.s, d = n.d, day = s.day, key = d.id + ':' + day;
  let S = ROUTINES.get(key);
  if (S) return S;
  S = (d.schedule || [[6, 'home']]).map((e) => e.slice());
  const placeAt = (h) => { let c = S[S.length - 1][1]; if (h < S[0][0]) return 'home'; for (const [hr, pl] of S) if (h >= hr) c = pl; return c; };
  // remplace [h0, h1[ par un lieu (et reprend ensuite où l'on en était)
  const put = (h0, h1, pl) => {
    const after = placeAt(h1);
    S = S.filter(([hr]) => hr < h0 || hr >= h1);
    S.push([h0, pl]);
    if (h1 < 24) S.push([h1, after]);
    S.sort((a, b) => a[0] - b[0]);
  };
  const J = cal.jour(day).cle, id = d.id, femme = d.gender === 'f' && (d.age || 30) >= 16, adulte = (d.age || 30) >= 16;
  const rnd = mulberry32(hashString(id) * 31 + day * 7919);
  const lieu = (k) => 'lieu:' + k;
  if (d.nomade) S = [[6.5, 'home'], [7.5, 'marche'], [18.5, 'auberge'], [20.5, 'home']];
  switch (J) {
    case 'semailles':
      if (id === 'eleveuse') put(7, 12, 'champ');
      if (id === 'grainetiere') put(6, 7, 'work');
      break;
    case 'fer':
      if (id === 'forgeron') put(18.5, 21, 'work');
      if (id === 'eleveuse') put(10, 11.5, 'bld:forge');
      if (id === 'garde') put(16, 17, 'bld:forge');
      break;
    case 'marche':
      if (MARCHANDS.has(id)) put(8, 12.5, 'marche');
      else if (['maire', 'cure', 'postiere', 'fillette', 'guerisseuse', 'aubergiste'].includes(id)) put(9.5 + rnd() * 0.5, 11.5, 'marche');
      break;
    case 'lessive':
      if (femme && id !== 'guerisseuse') put(9, 11, 'lavoir');
      if (id === 'fillette') put(9, 10.5, 'lavoir');
      break;
    case 'mere':
      if (id === 'guerisseuse') { put(10, 12, lieu('pierre_offrandes')); put(14, 16, lieu('cercle')); }
      if (id === 'eleveuse') put(17, 17.8, lieu('pierre_offrandes'));
      if (id === 'grainetiere') put(8, 9, lieu('pierre_offrandes'));
      break;
    case 'chasse':
      if (id === 'chasseur') { put(5, 11, 'foret'); put(14, 19, 'lande'); }
      if (id === 'garde') put(6, 8.5, 'foret');
      break;
    case 'peche':
      if (id === 'pecheur') put(5, 20, 'ponton');
      if (id === 'maire') put(14, 17, 'ponton');
      if (id === 'fillette') put(15, 16.5, 'ponton');
      break;
    case 'messe':
      if (d.area === 'ville' && adulte && id !== 'cure') put(11.5, 12.5, 'place');
      if (BOUTIQUES.has(id) && id !== 'aubergiste') put(13, 17, rnd() < 0.5 ? 'place' : 'auberge');
      break;
    case 'foire':
      if (['maire', 'aubergiste', 'postiere', 'fillette', 'boulangere', 'forgeron', 'alchimiste'].includes(id)) put(10 + rnd(), 15, 'hameau');
      break;
    case 'veillee':
      if (adulte && !['cure', 'guerisseuse', 'pecheur', 'chasseur'].includes(id)) { put(19, 22, 'auberge'); if (placeAt(22.1) !== 'home') put(22, 23.9, 'home'); }
      break;
    case 'chome':
      if (BOUTIQUES.has(id) || id === 'libraire') { const pl = ['lieu:lac', 'lieu:chene', 'place', 'auberge', 'lieu:ponton'][(rnd() * 5) | 0]; put(9, 11, 'home'); put(11, 15, pl); put(15, 18, 'place'); }
      break;
    case 'morts':
      if (adulte && id !== 'garde') put(16, 17, 'cimetiere');
      if (S.some(([hr, pl]) => hr >= 19 && pl !== 'home')) put(19, 23.9, 'home');
      break;
  }
  // le jour à soi : une visite ou une promenade
  if (!d.nomade && hashString(id) % 12 === cal.dow(day) && adulte) {
    const amis = Object.keys(d.liens || {}).map((k) => NPC_BY_ID[k]).filter((q) => q && q.home && q.home !== d.home);
    const pl = amis.length && rnd() < 0.6 ? 'bld:' + amis[(rnd() * amis.length) | 0].home : ['lieu:chene', 'lieu:lac', 'lieu:abbaye', 'lieu:chapelle', 'lieu:source', 'lieu:ponton'][(rnd() * 6) | 0];
    put(14, 16, pl);
  }
  // les colporteurs : d'un village à l'autre
  if (d.nomade) {
    const tour = d.id === 'colporteur'
      ? { marche: 'marche', foire: 'hameau', mere: lieu('bains'), peche: lieu('bibliotheque'), chome: lieu('abbaye'), semailles: lieu('ferme'), lessive: 'place', veillee: 'auberge' }
      : { marche: 'marche', foire: 'hameau', fer: lieu('bains'), chasse: lieu('bibliotheque'), messe: 'place', morts: lieu('cimetiere'), semailles: 'hameau', chome: lieu('ponton') };
    const pl = tour[J] || (rnd() < 0.5 ? 'place' : 'hameau');
    put(8, 17.5, pl);
  }
  ROUTINES.set(key, S);
  if (ROUTINES.size > 400) ROUTINES.clear();
  return S;
}
// la routine de base se lit désormais dans la semaine (la messe de l'Orédi, elle, garde la priorité)
{
  const _sp = npcs.schedulePlace.bind(npcs);
  npcs.schedulePlace = function (n, h) {
    const S0 = n.d.schedule;
    n.d.schedule = routineDuJour(n);
    try { return _sp(n, h); } finally { n.d.schedule = S0; }
  };
  // lieux en plus : « bld:clé » (chez quelqu'un), « lieu:clé » (un lieu-dit)
  const _dest = npcs.dest.bind(npcs);
  npcs.dest = function (n, pl, sleep) {
    const w = game.world;
    if (typeof pl === 'string' && pl.startsWith('bld:')) {
      const B = w.bld[pl.slice(4)];
      if (B && w.nav.nodes[B.nMid]) { const mid = w.nav.nodes[B.nMid]; return { node: B.nMid, x: mid.x + (Math.random() - 0.5), z: mid.z + (Math.random() - 0.5), pose: null, bld: B.key }; }
      pl = 'place';
    }
    if (typeof pl === 'string' && pl.startsWith('lieu:')) {
      const L = w.lm[pl.slice(5)];
      if (L && !L.under) {
        const sp = Math.min(10, (L.r || 8) * 0.6);
        let x = L.x, z = L.z;
        for (let k = 0; k < 12; k++) { const a = Math.random() * TAU, r = sp * (0.4 + Math.random() * 0.6); const tx = L.x + Math.cos(a) * r, tz = L.z + Math.sin(a) * r; if (pointFree(w, tx, tz, 0.45)) { x = tx; z = tz; break; } }
        return { node: this.nearestReach(x, z, (q) => !/:(in|mid)$/.test(q.tag)), x, z, pose: null };
      }
      pl = 'place';
    }
    return _dest(n, pl, sleep);
  };
  // les petites phrases du jour
  const _sg = npcs.shortGreet.bind(npcs);
  npcs.shortGreet = function (n) {
    const L = cal.lignes();
    if (L.length && Math.random() < 0.25) return fmtLine(L[(Math.random() * L.length) | 0], n);
    return _sg(n);
  };
}
// chaque matin : le nom du jour
HOOKS.day.push(() => { setTimeout(() => { if (!game.dying) ui.subtitle('', cal.annonce(), 4.5); }, 2600); });
