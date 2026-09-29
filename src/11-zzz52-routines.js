// ============================================================================
//  LA SEMAINE DE CHACUN — douze jours, et chacun les siens
//  - Chaque habitant a ses jours particuliers (marché, lessive, chasse, pêche,
//    messe, foire, veillée, jour des morts, visites, promenades…), dans des
//    lieux qui existent. Les nains ne quittent pas leurs halles ; les gens des
//    Sources vivent autour des bassins (et s'habillent pour aller au hameau) ;
//    le bibliothécaire garde sa bibliothèque.
//  - Personne ne se laisse enfermer par les ponts-levis : on rentre avant la
//    nuit, ou l'on attend le matin (à l'auberge, ou devant la porte).
//  - Les colporteurs vont réellement d'un village à l'autre selon le jour (et
//    jusqu'à la ferme) ; leur hotte change avec le jour et l'endroit (livres,
//    cartes, objets rares) ; arrivés quelque part, ils racontent ce qu'ils savent.
//  - Loin des yeux, on voyage vite, de nœud en nœud ; en vue, les voyageurs
//    ont le pas vif ; jamais personne ne marche dans l'eau profonde.
//  API : routines.semaine(n), routines.verifier() (contrôle des 12 jours).
// ============================================================================
// ---------------------------------------------------------------- les jours particuliers : [début, fin, lieu]
const ROUTINE_JOURS = {
  maire: { semailles: [[9.5, 11, 'hameau']], fer: [[16, 17, 'bld:forge']], lessive: [[10, 11.5, 'bld:poste']], mere: [[14, 15.5, 'bld:garde']], chasse: [[16, 17.5, 'lieu:moulin']], messe: [[9.8, 11.5, 'messe']], chome: [[10, 12, 'lieu:moulin'], [15, 17, 'place']] },
  boulangere: { semailles: [[13, 14, 'bld:graineterie']], chasse: [[14, 15, 'bld:maison_a']], mere: [[17.5, 18.5, 'lieu:pierre_offrandes']], peche: [[15, 16, 'bld:auberge']], messe: [[9.8, 11.5, 'messe']] },
  forgeron: { chasse: [[14, 16, 'bld:relais_chasse']], mere: [[13, 14, 'bld:auberge']], lessive: [[15, 16, 'puits_ville']], chome: [[9, 12, 'lieu:mine']] },
  grainetiere: { semailles: [[13, 15, 'hameau']], peche: [[16, 17, 'ponton']], messe: [[9.8, 11.5, 'messe']], foire: [[10, 15, 'hameau']], chome: [[14, 15, 'bld:maison_b']] },
  aubergiste: { chasse: [[8, 9.5, 'bld:relais_chasse']], peche: [[7, 8.5, 'ponton']], mere: [[16, 17, 'bld:boulangerie']] },
  cure: { semailles: [[8, 9, 'lieu:calvaire0']], messe: [[8.5, 12, 'work']], morts: [[10, 12, 'cimetiere'], [16, 18, 'cimetiere']], mere: [[15, 16, 'lieu:calvaire2']], chasse: [[15, 16.5, 'bld:hutte_ermite']], chome: [[14, 16, 'bld:mairie']] },
  postiere: { peche: [[13, 14, 'lieu:ferme']], mere: [[13, 14.5, 'bld:ranch']], chasse: [[13, 14, 'bld:cabane_pecheur']], messe: [[9.8, 11.5, 'messe']], chome: [[10, 12, 'lieu:moulin']] },
  garde: { marche: [[9, 12, 'marche']], foire: [[10, 15, 'hameau']], morts: [[16, 17, 'pont_sud']], veillee: [[19, 20.2, 'auberge']], chome: [[11, 13, 'place']], messe: [[9.8, 11.5, 'messe']], lessive: [[14, 15, 'lavoir']], peche: [[15, 16, 'bld:roulotte_a']] },
  eleveuse: { foire: [[10, 15, 'hameau']], chasse: [[14, 16, 'bld:relais_chasse']], peche: [[16, 17, 'bld:maison_hameau_a']], chome: [[10, 12, 'lieu:bergerie']] },
  pecheur: { marche: [[8, 11, 'marche']], foire: [[10, 14, 'hameau']], chome: [[9, 12, 'lieu:phare']], lessive: [[14, 16, 'lieu:pierre_dame']], mere: [[10, 11, 'lieu:pierre_dame']], messe: [[9.8, 11.5, 'messe']] },
  guerisseuse: { chasse: [[9, 17, 'home']], foire: [[11, 15, 'lieu:sources']], veillee: [[21, 22.5, 'lieu:cercle']], peche: [[14, 16, 'lieu:chapelle']] },
  fillette: { messe: [[9.8, 11.5, 'messe']], mere: [[17.5, 18.5, 'lieu:pierre_offrandes']], veillee: [[19, 20.2, 'auberge']], chome: [[10, 12, 'lavoir'], [14, 16, 'place']], semailles: [[14, 15.5, 'bld:graineterie']] },
  alchimiste: { mere: [[6.5, 8.5, 'foret']], peche: [[14, 17, 'bld:bibliotheque']], chasse: [[15, 16.5, 'bld:relais_chasse']], lessive: [[9, 10, 'puits_ville']], fer: [[16, 17, 'bld:forge']] },
  libraire: { messe: [[7, 8.2, 'lieu:abbaye']], chome: [[10, 12.5, 'lieu:abbaye'], [12.5, 20, 'home']], morts: [[16, 17, 'lieu:abbaye']], mere: [[18, 19, 'lieu:dolmen']], veillee: [[20, 23.5, 'work']], foire: [[13, 14, 'lieu:menhirs']] },
  chasseur: { marche: [[8, 12, 'marche']], fer: [[15, 16.5, 'bld:forge']], foire: [[10, 13, 'hameau']], veillee: [[18, 19.5, 'auberge']], chome: [[10, 12, 'lieu:chapelle']] },
  naturiste_a: { foire: [[8, 16, 'hameau']], semailles: [[9, 11, 'sources:potager']], lessive: [[9, 11, 'sources:linge']], veillee: [[19, 21, 'sources:bassin_soir']], morts: [[16, 17, 'sources:stele']], mere: [[15, 16.5, 'sources:potager']], chome: [[8, 12, 'bains'], [13, 19, 'bains']] },
  naturiste_b: { mere: [[9, 11, 'sources:potager']], peche: [[13, 17, 'hameau']], veillee: [[14, 19, 'bld:hutte_ermite']], morts: [[16, 17, 'sources:stele']], messe: [[10, 11.5, 'sources:table']], chasse: [[11, 13, 'sources:stele']] },
  naturiste_c: { semailles: [[9, 12, 'sources:potager']], marche: [[8, 11, 'sources:potager']], lessive: [[9, 11, 'sources:linge']], veillee: [[19, 22, 'sources:bassin_soir']], morts: [[16, 17, 'sources:stele']], chome: [[9, 15, 'hameau']], fer: [[20.5, 22, 'sources:bassin_soir']] },
  nain_ancien: { fer: [[14, 16, 'nain:forge']], mere: [[10, 12, 'nain:chant']], peche: [[9, 12, 'nain:lac']], chome: [[9, 12, 'nain:lac']], morts: [[16, 18, 'nain:stele']], chasse: [[15, 17, 'nain:seuil']], veillee: [[19.5, 22, 'nain:chant']] },
  nain_forgeronne: { fer: [[6, 23, 'work']], peche: [[14, 16, 'nain:lac']], chome: [[10, 12, 'nain:halle'], [13, 15, 'bld:nain_a']], morts: [[16, 18, 'nain:stele']], mere: [[10, 12, 'nain:chant']], veillee: [[19.5, 21, 'nain:chant']] },
};
// leur semaine de base (on ne garde pas celle de la ville pour eux)
const ROUTINE_BASES = {
  libraire: [[7, 'home'], [8.5, 'work'], [20, 'home']],
  naturiste_a: [[7, 'home'], [8, 'bains'], [12, 'sources:table'], [13, 'home'], [14, 'bains'], [19, 'home']],
  naturiste_b: [[6, 'home'], [7, 'bains'], [11, 'work'], [12, 'sources:table'], [13, 'work'], [15, 'bains'], [20, 'home']],
  naturiste_c: [[6.5, 'home'], [7.5, 'bains'], [12, 'sources:table'], [13, 'home'], [15, 'bains'], [20.5, 'home']],
  nain_ancien: [[6, 'home'], [8, 'work'], [12, 'nain:halle'], [13, 'work'], [19.5, 'nain:chant'], [20.5, 'home']],
  nain_forgeronne: [[5, 'home'], [6, 'work'], [12, 'nain:halle'], [12.5, 'work'], [19.5, 'nain:chant'], [20.5, 'work'], [21, 'home']],
};
// la tournée des colporteurs : où l'on est chaque jour
const TOURNEES = {
  colporteur: { semailles: 'lieu:ferme', fer: 'hameau', marche: 'marche', lessive: 'lieu:relais_chasse', mere: 'lieu:sources', chasse: 'place', peche: 'lieu:bibliotheque', messe: 'place', foire: 'hameau', veillee: 'ponton', chome: 'lieu:abbaye', morts: 'place' },
  colporteuse: { semailles: 'hameau', fer: 'lieu:sources', marche: 'marche', lessive: 'lavoir', mere: 'lieu:ferme', chasse: 'lieu:bibliotheque', peche: 'ponton', messe: 'place', foire: 'hameau', veillee: 'lieu:sources', chome: 'lieu:relais_chasse', morts: 'cimetiere' },
};
// ce que contient la hotte selon l'endroit (en plus du fonds), et les raretés du jour [objet, prix, 1 jour sur k]
const HOTTES = {
  colporteur: {
    fonds: ['livre_bestiaire', 'livre_herbier', 'livre_poissons', 'livre_sciences', 'carte_centre', 'carte_ouest', 'carte_sud', 'corde', 'bougie', 'lanterne'],
    ici: {
      'lieu:ferme': [['graines_mais', 9], ['graines_tournesol', 8], ['graines_citrouille', 20], ['graines_fraise', 12], ['jeune_pommier', 95], ['livre_manuel_jardin', 100], ['harnais', 110]],
      hameau: [['harnais', 110], ['roue', 85], ['selle', 200], ['livre_manuel_charron', 140]],
      'lieu:bibliotheque': [['livre_manuel_forgeron', 160], ['livre_manuel_charron', 140], ['livre_manuel_chasse', 130], ['carte_nord', 120], ['carte_monts', 150]],
      'lieu:sources': [['huile', 70], ['toile', 26], ['livre_manuel_cuisine', 60], ['bandage', 14]],
      'lieu:abbaye': [['carte_est', 90], ['carte_monts', 150], ['livre_sciences', 60]],
      marche: [['appeau', 40], ['roue', 85], ['harnais', 110], ['livre_manuel_forgeron', 160]],
      place: [['harnais', 110], ['livre_manuel_charron', 140]],
      'lieu:relais_chasse': [['livre_manuel_chasse', 130], ['appeau', 38]],
      ponton: [['canne', 70], ['livre_poissons', 70]],
    },
    rares: [['sifflet_argent', 180, 6], ['lentille', 75, 3], ['boussole', 110, 3], ['montre', 150, 4], ['vieille_piece', 55, 2], ['plume_aigle', 60, 2], ['perle', 260, 5]],
  },
  colporteuse: {
    fonds: ['toile', 'bandage', 'attelle', 'fiole', 'sel', 'corde', 'carte_nord', 'carte_est', 'graines_basilic', 'graines_lavande', 'appeau'],
    ici: {
      'lieu:ferme': [['graines_fraise', 10], ['graines_citrouille', 18], ['jeune_pommier', 90], ['livre_manuel_cuisine', 55]],
      hameau: [['laine', 50], ['fromage', 65], ['graines_ble', 3], ['graines_carotte', 4]],
      'lieu:sources': [['reine_pres', 14], ['huile', 68], ['livre_sciences', 60]],
      'lieu:bibliotheque': [['livre_manuel_jardin', 95], ['livre_herbier', 92], ['carte_ouest', 75]],
      ponton: [['canne', 65], ['vers', 2], ['livre_poissons', 72]],
      cimetiere: [['bougie', 9], ['fleur', 8]],
      lavoir: [['toile', 22], ['sel', 9]],
      marche: [['livre_manuel_cuisine', 55], ['livre_poissons', 72], ['carte_monts', 155]],
      'lieu:relais_chasse': [['attelle', 28], ['corde', 12]],
      place: [['livre_sciences', 60]],
    },
    rares: [['perle', 250, 4], ['gemme', 340, 5], ['eau_lustrale', 170, 4], ['fleur_lune', 40, 3], ['poussiere_etoile', 240, 8]],
  },
};
// les lieux-dits où l'on se promène : on y trace un sentier s'il n'y en a pas
const LIEUX_PROMENADE = ['chene', 'source', 'pierre_offrandes', 'pierre_dame', 'cercle', 'chapelle', 'abbaye', 'moulin', 'phare', 'mine', 'dolmen', 'menhirs', 'bergerie', 'calvaire0', 'calvaire1', 'calvaire2', 'calvaire3', 'calvaire4'];
const LIEU_ALIAS = { bains: 'sources', lac: 'ponton' };

const routines = {
  cache: new Map(),
  alias(k) { return LIEU_ALIAS[k] || k; },
  dansVille(x, z) { const T = game.world.townInfo; return !!T && Math.max(Math.abs(x - T.x), Math.abs(z - T.z)) < 50; },
  // position approximative d'un lieu de routine
  pos(n, pl) {
    const w = game.world, d = n.d, lm = w.lm, B = (k) => (w.bld[k] ? { x: w.bld[k].x, z: w.bld[k].z } : null);
    if (!pl || typeof pl !== 'string') return null;
    if (pl === 'home') return B(d.home);
    if (pl === 'work') return B(d.work) || B(d.home);
    if (pl === 'auberge' || pl === 'eglise' || pl === 'messe') return B(pl === 'messe' ? 'eglise' : pl);
    if (pl.startsWith('bld:')) return B(pl.slice(4));
    if (pl.startsWith('lieu:')) { const L = lm[this.alias(pl.slice(5))]; return L && !L.under ? { x: L.x, z: L.z } : null; }
    if (pl.startsWith('pt:')) { const [x, z] = pl.slice(3).split(',').map(Number); return isFinite(x) && isFinite(z) ? { x, z } : null; }
    if (pl === 'bains' || pl.startsWith('sources:')) return w.sources ? { x: w.sources.x, z: w.sources.z } : null;
    if (pl.startsWith('nain:')) return w.nains ? { x: w.nains.hall.x, z: w.nains.hall.z } : null;
    if (pl.startsWith('alerte')) return null;
    const tags = { place: 'place', hameau: 'hameau', cimetiere: 'cimetiere', ponton: 'ponton', pont_nord: 'pont_nord:porte', pont_sud: 'pont_sud:porte' };
    if (tags[pl]) {
      if (this.tagW !== w) { this.tagW = w; this.tagC = {}; }
      const i = this.tagC[pl] ?? (this.tagC[pl] = npcs.nodeTag(tags[pl]));
      return i >= 0 ? w.nav.nodes[i] : null;
    }
    if (pl === 'marche' || pl === 'puits_ville') return lm[pl] || null;
    if (pl === 'lac') return lm.ponton || null;
    if (pl === 'foret') return d.id === 'chasseur' && w.relais ? w.relais : lm.hutte_ermite || null;
    if (pl === 'lavoir') return w.lavoir || lm.lavoir || null;
    if (pl === 'champ' || pl === 'ranch') return B(d.home);
    if (pl === 'lande') { const k = this.lande(n); return k ? lm[k] : null; }
    return B(d.home);
  },
  lande(n) {
    const w = game.world, H = w.bld[n.d.home];
    let best = null, bd = 1e9;
    for (const k of ['cercle', 'menhirs', 'dolmen', 'bergerie']) { const L = w.lm[k]; if (!L || !H) continue; const d = Math.hypot(L.x - H.x, L.z - H.z); if (d < bd) { bd = d; best = k; } }
    return best;
  },
  valide(n, pl) {
    const w = game.world;
    if (pl === 'messe') return !!w.bld.eglise;
    if (pl === 'lavoir') return !!(w.lavoir || w.lm.lavoir);
    if (pl.startsWith('nain:')) return !!w.nains;
    if (pl === 'bains' || pl.startsWith('sources:')) return !!w.sources;
    return !!this.pos(n, pl);
  },
  placeA(S, h) { let c = S[S.length - 1][1]; if (h < S[0][0]) return 'home'; for (const [hr, pl] of S) if (h >= hr) c = pl; return c; },

  // ------------------------------------------------------------------ la semaine complète du jour
  semaine(n, S0) {
    const d = n.d, id = d.id, J = cal.jour(farm.s.day).cle;
    let S = ROUTINE_BASES[id] ? ROUTINE_BASES[id].map((e) => e.slice()) : S0.map((e) => e.slice());
    if (d.nomade) S = this.tournee(n, J);
    const put = (h0, h1, pl) => {
      const after = this.placeA(S, h1);
      S = S.filter(([hr]) => hr < h0 || hr >= h1);
      S.push([h0, pl]);
      if (h1 < 24) S.push([h1, after]);
      S.sort((a, b) => a[0] - b[0]);
    };
    for (const [h0, h1, pl] of (ROUTINE_JOURS[id] && ROUTINE_JOURS[id][J]) || []) put(h0, h1, pl);
    // (les nains ne sortent pas : tout lieu de surface redevient la halle)
    if (d.area === 'nains') S = S.map(([h, pl]) => [h, pl === 'home' || pl === 'work' || pl.startsWith('nain:') || pl.startsWith('bld:nain_') ? pl : 'nain:halle']);
    S = S.filter(([, pl]) => this.valide(n, pl));
    if (!S.length) S = [[6, 'home']];
    return this.ponts(n, S);
  },
  // les colporteurs : partir tôt quand c'est loin, revenir par l'auberge
  tournee(n, J) {
    const dest = (TOURNEES[n.d.id] || {})[J] || 'place';
    const H = this.pos(n, 'home'), P = this.pos(n, dest);
    const km = H && P ? Math.hypot(P.x - H.x, P.z - H.z) / 1000 : 0;
    if (km > 0.35) return [[5, 'home'], [Math.max(5.2, 8 - 1.6 * km), dest], [16.5, 'auberge'], [20, 'home']];
    return [[6.5, 'home'], [7.5, dest], [18, 'auberge'], [20, 'home']];
  },
  // les ponts-levis se lèvent à 21 h et s'abaissent à 6 h : on ne passe les douves qu'entre 6 h et 19 h 36
  ponts(n, S) {
    const w = game.world;
    if (!w.townInfo) return S;
    const H = this.pos(n, 'home');
    if (!H) return S;
    const chez = this.dansVille(H.x, H.z);
    const cote = (pl) => { const P = this.pos(n, pl); return P ? this.dansVille(P.x, P.z) : chez; };
    let out = S.filter(([h, pl]) => !((h >= 19.6 || h < 6) && cote(pl) !== chez));
    if (!out.length) out = [[6, 'home']];
    if (cote(this.placeA(out, 19.6)) !== chez) { out = out.filter(([h]) => h < 19.6); out.push([19.6, 'home']); }
    return out;
  },

  // ------------------------------------------------------------------ destinations en plus
  at(x, z, spread, pose, filtre) {
    const w = game.world;
    let tx = x, tz = z;
    for (let k = 0; k < 12; k++) { const a = Math.random() * TAU, r = Math.random() * (spread || 0); const px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r; if (pointFree(w, px, pz, 0.45)) { tx = px; tz = pz; break; } }
    return { node: npcs.nearestReach(tx, tz, filtre || ((q) => !/:(in|mid)$/.test(q.tag))), x: tx, z: tz, pose: pose || null };
  },
  // un lieu-dit : un point sec, libre, qu'on atteint depuis un nœud en ligne droite
  lieuDest(n, key) {
    const w = game.world, k = this.alias(key), L = w.lm[k];
    if (!L || L.under) return null;
    if (k === 'ferme' && w.bld.ferme) { // devant la maison, pas dans le champ
      const B = w.bld.ferme, o = B.out;
      for (let t = 0; t < 12; t++) { const a = Math.random() * TAU, r = 2 + Math.random() * 3, x = o[0] + Math.cos(a) * r, z = o[1] + Math.sin(a) * r; if (pointFree(w, x, z, 0.5) && !farm.crop(x, z)) return { node: B.nOut, x, z, r: Math.atan2(o[0] - x, o[1] - z), pose: null }; }
      return { node: B.nOut, x: o[0], z: o[1], pose: null };
    }
    const f = (q) => !q.iso && !/:(in|mid)$/.test(q.tag) && !/^(halle|village:)/.test(q.tag);
    const R0 = Math.min(10, (L.r || 8) * 0.6);
    for (let t = 0; t < 16; t++) {
      const a = Math.random() * TAU, r = R0 * (0.3 + Math.random() * 0.7) + (t > 8 ? 4 : 0), x = L.x + Math.cos(a) * r, z = L.z + Math.sin(a) * r;
      if (!pointFree(w, x, z, 0.5) || this.dansBassin(x, z)) continue;
      const node = npcs.nearestReach(x, z, f);
      if (node < 0) continue;
      const q = w.nav.nodes[node], dq = Math.hypot(q.x - x, q.z - z);
      if (dq > 40 || (dq > 2 && !segClear(w, q.x, q.z, x, z))) continue;
      return { node, x, z, pose: null };
    }
    const node = npcs.nearestNode(L.x, L.z, 45, f);
    if (node >= 0) { const q = w.nav.nodes[node]; return { node, x: q.x, z: q.z, pose: null }; }
    return null;
  },
  dansBassin(x, z) {
    for (const P of game.world.pools || []) {
      if (P.kind !== 'bains' || Math.abs(P.x - x) > 8 || Math.abs(P.z - z) > 8) continue;
      const c = Math.cos(P.r || 0), s = Math.sin(P.r || 0), dx = x - P.x, dz = z - P.z, lx = dx * c - dz * s, lz = dx * s + dz * c;
      if (Math.abs(lx) < P.w / 2 + 0.7 && Math.abs(lz) < P.d / 2 + 0.7) return true;
    }
    return false;
  },
  // un bain : assis dans l'eau chaude jusqu'à la taille
  bainDest(n) {
    const w = game.world, P = (w.pools || []).filter((p) => p.kind === 'bains');
    if (!P.length || !w.sources) return null;
    const B = P[(hashString(n.d.id) + farm.s.day + (npcs.hour() > 13 ? 1 : 0)) % P.length], c = Math.cos(B.r), s = Math.sin(B.r);
    const lx = (Math.random() - 0.5) * (B.w - 1.4), lz = (Math.random() - 0.5) * (B.d - 1.4);
    return { node: w.sources.node, x: B.x + lx * c + lz * s, z: B.z - lx * s + lz * c, r: Math.random() * TAU, pose: 'sit', y: B.y - 0.42, seat: true };
  },
  sourcesDest(n, k) {
    const w = game.world, S = w.sources, X = w.sourcesPlus || {}, i0 = ['naturiste_a', 'naturiste_b', 'naturiste_c'].indexOf(n.d.id), i = i0 >= 0 ? i0 : Math.abs(hashString(n.d.id)) % 7;
    if (!S) return null;
    const node = S.node;
    const devant = (o, d, pose) => { if (!o) return null; const x = o.x - Math.sin(o.r) * d + (Math.random() - 0.5) * 0.8, z = o.z - Math.cos(o.r) * d + (Math.random() - 0.5) * 0.8; return { node, x, z, r: Math.atan2(o.x - x, o.z - z), pose }; };
    if (k === 'potager' && X.potager && X.potager.length) return devant(X.potager[i % X.potager.length], 1.4, 'work');
    if (k === 'table' && X.table && X.table.sieges.length) { const sp = X.table.sieges[i % X.table.sieges.length]; return { node, x: sp.x, z: sp.z, r: sp.r, pose: 'sit', y: sp.y, seat: true }; }
    if (k === 'linge' && X.linge) return devant(X.linge, 1.1, 'work');
    if (k === 'stele' && X.stele) return devant(X.stele, -1.8, null); // (on lit la pierre du côté gravé)
    if (k === 'bassin_soir') { // assis sur la margelle, face à l'eau
      const P = (w.pools || []).filter((p) => p.kind === 'bains'), B = P[i % P.length];
      if (B) { const c = Math.cos(B.r), s = Math.sin(B.r), side = i % 2 ? 1 : -1, lx = (Math.random() - 0.5) * (B.w - 1), lz = side * (B.d / 2 + 0.25); return { node, x: B.x + lx * c + lz * s, z: B.z - lx * s + lz * c, r: Math.atan2(-(lz * s), -(lz * c)), pose: 'sit', y: B.y + 0.32, seat: true }; }
    }
    return this.at(S.x, S.z, 8);
  },
  nainDest(n, k) {
    const w = game.world, N = w.nains;
    if (!N) return null;
    const H = N.hall, y = H.y + 0.02, ancien = n.d.id === 'nain_ancien';
    let x, z, r = null, pose = null;
    if (k === 'lac') { x = H.x + (ancien ? -2.5 : 2.5); z = H.z - 7.8; r = Math.PI; pose = 'fish'; }
    else if (k === 'chant' || k === 'stele') { x = H.x + (ancien ? -0.8 : 0.8); z = H.z + 13.6; r = 0; }
    else if (k === 'forge' && w.bld.nain_b) { const sp = w.bld.nain_b.spots.work; x = sp.x + 1.2; z = sp.z - 1.2; r = Math.atan2(sp.x - x, sp.z - z); }
    else if (k === 'seuil') { x = H.x - 17; z = H.z - 11; r = -Math.PI / 2; }
    else { const Ls = w.nav.nodes.filter((q) => /^(halle:|village:nains)/.test(q.tag)); const q = Ls[(Math.random() * Ls.length) | 0]; if (!q) return null; x = q.x + (Math.random() - 0.5) * 2; z = q.z + (Math.random() - 0.5) * 2; }
    let node = -1, bd = 1e9;
    w.nav.nodes.forEach((q, i) => { if (!/^(halle:|village:nains)/.test(q.tag)) return; const d = Math.hypot(q.x - x, q.z - z); if (d < bd) { bd = d; node = i; } });
    return { node, x, z, r, pose, y };
  },
  // attendre que le pont s'abaisse : en ville, à l'auberge ; dehors, devant la porte sud
  attente(n) {
    const w = game.world, T = w.townInfo, dedans = this.dansVille(n.x, n.z);
    if (dedans) return 'auberge';
    const b = (w.bridges || []).reduce((best, br) => (!best || Math.hypot(br.x - n.x, br.z - n.z) < Math.hypot(best.x - n.x, best.z - n.z) ? br : best), null);
    if (!b || !T) return 'home';
    const dx = b.x - T.x, dz = b.z - T.z, L = Math.hypot(dx, dz) || 1;
    return 'pt:' + (T.x + dx / L * 62).toFixed(1) + ',' + (T.z + dz / L * 62).toFixed(1);
  },

  // ------------------------------------------------------------------ la hotte du colporteur, selon le jour et l'endroit
  hotte(n, sells0) {
    const H = HOTTES[n.d.id];
    if (!H) return sells0;
    const prix = (id) => { const e = sells0.find(([k]) => k === id); return e && e[1] > 0 ? e[1] : Math.max(1, (ITEMS[id] && ITEMS[id].price) || 10); };
    const out = [], ok = (id) => ITEMS[id] && !out.some(([k]) => k === id);
    for (const id of H.fonds) if (ok(id)) out.push([id, prix(id)]);
    for (const [id, p] of H.ici[n.place] || []) if (ok(id)) out.push([id, p]);
    const rnd = mulberry32(farm.s.seed * 13 + farm.s.day * 7 + hashString(n.d.id));
    for (const [id, p, k] of H.rares) if (rnd() < 1 / k && ok(id)) out.push([id, p]);
    return out;
  },

  // ------------------------------------------------------------------ après la mise à jour des habitants
  apres(dt) {
    const w = game.world, WL = w.waterLevel;
    for (const n of npcs.list) {
      if (!n.st.alive || n.state === 'gone' || n.vanished || n.hunting || n.state === 'dead') continue;
      if ((n.poursuite || 0) > game.time || n.alerte || n.fleeT > 0) { if (n.y > WL - 0.3) n._sur = [n.x, n.y, n.z]; else if (n._sur) this.remettre(n); continue; }
      // jamais dans l'eau profonde (fuites, trajets manqués) : on revient au dernier endroit sûr
      if (n.y < WL - 0.3 && !(n.state !== 'walk' && n.goal && n.goal.y !== undefined && n.goal.y !== null)) { if (n._sur) this.remettre(n); }
      else n._sur = [n.x, n.y, n.z];
      // un trajet impossible (pont levé, îlot) : on attend un peu, puis on réfléchit de nouveau
      if (n._echec && game.time - n._echec < 0.5 && n.state === 'walk' && !n.path.length) {
        n._echec = 0; n.state = 'idle'; n.move = 0; n.goal = { node: -1, x: n.x, z: n.z, pose: null }; n._retry = game.time + 8;
      }
      if (n._retry && game.time > n._retry) { n._retry = 0; n.goal = null; }
      // la longueur du trajet : les voyageurs ont le pas vif
      if (n.path !== n._pathRef) {
        n._pathRef = n.path;
        let L = 0;
        for (let i = 1; i < (n.path || []).length; i++) { const a = w.nav.nodes[n.path[i - 1]], b = w.nav.nodes[n.path[i]]; L += Math.hypot(a.x - b.x, a.z - b.z); }
        n.voyage = L > 250;
      }
    }
    // les colporteurs arrivés quelque part : ils disent ce qu'ils savent, ils écoutent
    this.nouvT = (this.nouvT || 0) - dt;
    if (this.nouvT <= 0 && typeof societe !== 'undefined') {
      this.nouvT = 1;
      for (const n of npcs.list) {
        if (!n.d.nomade || !n.st.alive || n.state !== 'idle' || n.sleep) continue;
        const v = societe.villageAt(n.x, n.z, 95);
        if (v && v !== n._village) { n._village = v; societe.echanger(n, v); }
        else if (!v) n._village = null;
      }
    }
  },
  remettre(n) {
    const [x, y, z] = n._sur;
    n.x = x; n.y = y; n.z = z; n.move = 0; n.fleeT = 0; n.run = false;
    if (n.state === 'walk') { n.goal = null; n.path = []; }
  },
  // loin des yeux : on file de nœud en nœud
  avancer(n, dt, w) {
    let reste = 28 * dt;
    for (let k = 0; k < 8 && reste > 0; k++) {
      let tx, tz, last = false;
      if (n.pi < n.path.length) {
        if (n.pi > 0) { const a = n.path[n.pi - 1], b = n.path[n.pi], e = (w.nav.adj[a] || []).find((x) => x.to === b); if (e && e.flag && e.flag.startsWith('bridge:') && !npcs.edgeOk(n, e)) { n.goal = null; n.state = 'idle'; n.move = 0; return; } }
        const q = w.nav.nodes[n.path[n.pi]]; tx = q.x; tz = q.z;
      } else { tx = n.goal.x; tz = n.goal.z; last = true; }
      const dx = tx - n.x, dz = tz - n.z, d = Math.hypot(dx, dz);
      if (d <= reste) {
        n.x = tx; n.z = tz; reste -= d;
        if (last) {
          n.state = n.sleep ? 'sleep' : 'idle'; n.inside = n.goal.bld || null; n.move = 0;
          n.y = n.goal.y !== undefined && n.goal.y !== null ? n.goal.y : w.groundAt(n.x, n.z, Math.max(n.y, w.heightAt(n.x, n.z)) + 1.2, 1.6);
          if (n.goal.r !== null && n.goal.r !== undefined) n.heading = n.goal.r;
          return;
        }
        n.pi++;
        continue;
      }
      n.x += dx / d * reste; n.z += dz / d * reste; n.heading = Math.atan2(dx, dz); reste = 0;
    }
    n.inside = null;
    n.y = w.groundAt(n.x, n.z, Math.max(n.y, w.heightAt(n.x, n.z) - 1) + 1.2, 1.8);
    n.move = 1; n.phase += dt * 6;
  },
  // ------------------------------------------------------------------ contrôle : les douze jours de chacun
  verifier() {
    const s = farm.s, w = game.world, day0 = s.day, out = [];
    try {
      for (let k = 0; k < 12; k++) {
        s.day = day0 + k; this.cache.clear();
        const J = cal.jour(s.day).cle;
        for (const n of npcs.list) {
          if (!n.st.alive) continue;
          const S = routineDuJour(n), H = this.pos(n, 'home'), chez = H && this.dansVille(H.x, H.z);
          let prev = 'home', prevH = 0;
          for (const [h, pl] of S) {
            if (!this.valide(n, pl)) out.push([n.id, J, h, pl, 'lieu inconnu']);
            const P = this.pos(n, pl), Q = this.pos(n, prev);
            if (P && Q && w.townInfo && this.dansVille(P.x, P.z) !== this.dansVille(Q.x, Q.z) && (h > 19.6 || h < 6)) out.push([n.id, J, h, pl, 'douves la nuit']);
            if (n.d.area === 'nains' && P && Math.hypot(P.x - w.nains.hall.x, P.z - w.nains.hall.z) > 40) out.push([n.id, J, h, pl, 'nain dehors']);
            if (n.d.area === 'sources' && P && pl !== 'home' && !pl.startsWith('sources') && pl !== 'bains' && !['hameau', 'bld:hutte_ermite', 'work'].includes(pl)) out.push([n.id, J, h, pl, 'hors des Sources']);
            void chez; void prevH;
            prev = pl; prevH = h;
          }
        }
      }
    } finally { s.day = day0; this.cache.clear(); }
    return out;
  },
};

// ============================================================================
//  GÉNÉRATION : des sentiers jusqu'aux lieux-dits où l'on se promène
// ============================================================================
function routinesSentiers(w) {
  const N = w.nav, usable = (q) => !q.iso && !/:(in|mid)$/.test(q.tag) && !/^(halle|village:)/.test(q.tag);
  let ajout = false;
  for (const k of LIEUX_PROMENADE) {
    const L = w.lm[k];
    if (!L || L.under) continue;
    // un point libre et sec près du lieu
    let P = null;
    for (let t = 0; t < 40 && !P; t++) { const a = t * 2.4, r = 2 + (t % 8) * 1.5, x = L.x + Math.cos(a) * r, z = L.z + Math.sin(a) * r; if (pointFree(w, x, z, 0.6)) P = { x, z }; }
    if (!P) continue;
    let bi = -1, bd = 1e9;
    N.nodes.forEach((q, i) => { if (!usable(q)) return; const d = Math.hypot(q.x - P.x, q.z - P.z); if (d < bd) { bd = d; bi = i; } });
    if (bi < 0 || bd < 16 || bd > 520) continue;
    const q = N.nodes[bi], m = Math.ceil(bd / 15);
    for (let j = 1; j <= m; j++) {
      const t = j / m;
      let x = lerp(q.x, P.x, t), z = lerp(q.z, P.z, t);
      if (!pointFree(w, x, z, 0.45)) { let ok = false; for (let r = 1; r <= 6 && !ok; r += 1) for (let a = 0; a < 8 && !ok; a++) { const px = x + Math.cos(a * 0.785) * r, pz = z + Math.sin(a * 0.785) * r; if (pointFree(w, px, pz, 0.45)) { x = px; z = pz; ok = true; } } if (!ok) break; }
      N.nodes.push({ x, z, tag: 'sentier:' + k });
      ajout = true;
    }
  }
  if (!ajout) return;
  // on refait le réseau (les îlots repartent de zéro ; les halles des nains restent habitées)
  for (const q of N.nodes) delete q.iso;
  finalizeNav(w);
  const seen = new Set();
  for (let i = 0; i < N.nodes.length; i++) {
    if (!/^village:/.test(N.nodes[i].tag)) continue;
    const Q = [i]; seen.add(i);
    while (Q.length) { const c = Q.shift(); N.nodes[c].iso = false; for (const e of N.adj[c]) if (!seen.has(e.to)) { seen.add(e.to); Q.push(e.to); } }
  }
}
{
  const _gv = generateValley;
  generateValley = async function (seed, progress, gen) {
    const w = await _gv(seed, progress, gen);
    if (w.designed && w.nav) { try { routinesSentiers(w); } catch (e) { console.error(e); } }
    return w;
  };
}

// ============================================================================
//  BRANCHEMENTS
// ============================================================================
// la semaine de chacun (par-dessus celle du calendrier)
{
  const _rdj = routineDuJour;
  routineDuJour = function (n) {
    const key = n.d.id + ':' + farm.s.day;
    let S = routines.cache.get(key);
    if (S) return S;
    S = routines.semaine(n, _rdj(n));
    routines.cache.set(key, S);
    if (routines.cache.size > 500) routines.cache.clear();
    return S;
  };
}
// on se déplace : vite loin des yeux, d'un pas vif en voyage, jamais dans l'eau
{
  const _walk = npcs.walk.bind(npcs);
  npcs.walk = function (n, dt, w, c) {
    if (n.pi > 0 && n.pi < n.path.length) { // un pont levé sur le chemin : on renonce, la routine décidera
      const a = n.path[n.pi - 1], b = n.path[n.pi], e = (w.nav.adj[a] || []).find((x) => x.to === b);
      if (e && e.flag && e.flag.startsWith('bridge:') && !this.edgeOk(n, e)) { n.goal = null; n.state = 'idle'; n.move = 0; return; }
    }
    if (n.dist > 170 && !n.run && n.goal) { routines.avancer(n, dt, w); return; }
    const x0 = n.x, z0 = n.z;
    _walk(n, dt, w, c);
    if (n.voyage && n.dist < 70 && n.state === 'walk' && !n.run) {
      const mx = n.x - x0, mz = n.z - z0, m = Math.hypot(mx, mz);
      if (m > 1e-4 && m < 0.5) {
        let nx = n.x + mx * 1.0, nz = n.z + mz * 1.0;
        [nx, nz] = w.collideCircle(nx, nz, n.y, n.y + 1.7, 0.28, 0.5, true);
        const g = w.groundAt(nx, nz, n.y + 0.6, 0.6);
        if (g > w.waterLevel - 0.2) { n.x = nx; n.z = nz; n.y = g; n.phase += dt * 1.35 * 2.4; }
      }
    }
  };
  const _fp = npcs.findPath.bind(npcs);
  npcs.findPath = function (n, a, b) { const p = _fp(n, a, b); if (!p && n && n.d) n._echec = game.time; return p; };
}
HOOKS.update.push((dt) => { if (farm.s && game.world) routines.apres(dt); });
HOOKS.day.push(() => routines.cache.clear());
HOOKS.load.push(() => {
  routines.cache.clear();
  for (const n of npcs.list) { n._sur = null; n._echec = 0; n._retry = 0; n.voyage = false; n._village = null; }
  if (routines.hooked) return;
  routines.hooked = true;
  // l'emploi du temps : malades au lit, garde à la ferme, et personne coincé par les ponts
  const _sp = npcs.schedulePlace.bind(npcs);
  npcs.schedulePlace = function (n, h) {
    if (!farm.s) return _sp(n, h);
    if (n.st.malade) return { place: 'home', sleep: h < 8 || h >= 20.5 };
    if (n.d.id === 'garde' && typeof societe !== 'undefined' && societe.visiteFerme(h)) return { place: 'lieu:ferme', sleep: false };
    const r = _sp(n, h);
    if (n.goal && game.world.townInfo && (h >= 20.95 || h < 6.05)) {
      const P = routines.pos(n, r.place), dedans = routines.dansVille(n.x, n.z);
      if (P && routines.dansVille(P.x, P.z) !== dedans) return { place: routines.attente(n), sleep: false };
    }
    return r;
  };
  // les lieux en plus : lieux-dits sûrs, bains, Sources, halles des nains, lande, point précis
  const _dest = npcs.dest.bind(npcs);
  npcs.dest = function (n, pl, sleep) {
    if (typeof pl === 'string') {
      let D = null;
      if (pl.startsWith('lieu:')) { D = routines.lieuDest(n, pl.slice(5)); if (!D) return _dest(n, 'home', false); }
      else if (pl === 'bains') D = routines.bainDest(n);
      else if (pl.startsWith('sources:')) D = routines.sourcesDest(n, pl.slice(8));
      else if (pl.startsWith('nain:')) D = routines.nainDest(n, pl.slice(5));
      else if (pl === 'lande') { const k = routines.lande(n); D = k ? routines.lieuDest(n, k) : null; }
      else if (pl === 'foret' && n.d.id === 'chasseur') { const Q = game.world.nav.nodes.filter((q) => q.tag === 'chasse'); const q = Q[(Math.random() * Q.length) | 0]; if (q) D = routines.at(q.x, q.z, 5, null); }
      else if (pl.startsWith('pt:')) { const P = routines.pos(n, pl); if (P) D = routines.at(P.x, P.z, 1.5, null); }
      if (D && D.node >= 0) return D;
    }
    return _dest(n, pl, sleep);
  };
  // la hotte du colporteur change avec le jour et l'endroit
  const _rs = ui.renderShop.bind(ui);
  ui.renderShop = function () {
    const n = this.shopN, S = n && n.d.shop;
    if (!S || !HOTTES[n.d.id] || !farm.s) return _rs();
    const sells0 = S.sells;
    S.sells = routines.hotte(n, sells0);
    try { return _rs(); } finally { S.sells = sells0; }
  };
});
