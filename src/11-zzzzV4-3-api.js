// ============================================================================
//  LE CHÂTEAU DES HAUTS — HAUTGUET (agent V4) — l'API zone.chateau
//  Pour les autres agents de la Zone (contrat : $SP/eq/contrat-v14.md, section V4) ;
//  appels gardés : zone.chateau && zone.chateau.places && zone.chateau.places().
//   - places(type)   : les places où V2 pose des créatures (gardiens, rôdeurs, paisibles)
//   - abris()        : les endroits couverts (le dragon de V3 n'y voit pas)
//   - aCouvert(pos)  : sous un toit, une voûte, sous terre, au château
//   - dedans(pos), salle(pos), salles() ; pontBaisse(), herseLevee(), guet() ; surGuet
//   - cles(), raccourcis() ; S() (farm.s.v4) ; mesures()
//   - essais : aller(id), ouvrir(id)
// ============================================================================
zone.chateau = {
  nom: V4_NOM,
  S() { return chateauV4.S(); },
  site() { return zone.site('chateau'); },
  genere() { return !!(chateauV4.Z && zone.Z && zone.Z.v4 === chateauV4.Z); },
  // ------------------------------------------------------------- pour V2 : les places des créatures
  places(type) {
    const V = chateauV4.Z;
    if (!V) return [];
    const esp = zone.creatures && zone.creatures.especes ? zone.creatures.especes() : null;
    return V.places.filter((p) => !type || p.type === type).map((p) => {
      const o = Object.assign({}, p);
      if (o.espece && esp && !esp.some((e) => e.id === o.espece)) delete o.espece;
      return o;
    });
  },
  // ------------------------------------------------------------- pour V3 : où le dragon ne voit pas
  abris() { const V = chateauV4.Z; return V ? V.abris.map((a) => Object.assign({}, a)) : []; },
  aCouvert(pos) {
    const V = chateauV4.Z, Z = zone.Z;
    if (!V || !pos || !Z) return false;
    if (Math.hypot(pos[0] - V.cx, pos[2] - V.cz) > V4_RAYON) return false;
    if (pos[1] < Z.heightAt(pos[0], pos[2]) - 2) return true; // sous terre
    const s = chateauV4.salle(pos);
    if (s && s.couvert && !(s.trous && s.trous.some(([a, b, c, d]) => pos[0] > a && pos[0] < b && pos[2] > c && pos[2] < d))) return true;
    try { return !!Z.covered(pos[0], pos[1] + 1.4, pos[2]); } catch (e) { return false; }
  },
  dedans(pos) {
    const V = chateauV4.Z;
    if (!V || !pos) return false;
    const x = pos[0] - V.cx, z = pos[2] - V.cz;
    return (x > V4_PLAN.XO - 1.5 && x < V4_PLAN.XE + 1.5 && z > V4_PLAN.ZN - 1.5 && z < V4_PLAN.ZS + 1.5) || pos[1] < V.y0 - 2;
  },
  salle(pos) { const s = chateauV4.salle(pos); return s ? s.id : null; },
  salles() { const V = chateauV4.Z; return V ? V.salles.map((s) => ({ id: s.id, nom: s.nom, x0: s.x0, x1: s.x1, y0: s.y0, y1: s.y1, z0: s.z0, z1: s.z1, couvert: s.couvert, dessous: s.dessous, trous: s.trous ? s.trous.map((t) => t.slice()) : null })) : []; },
  // ------------------------------------------------------------- l'état du château
  pontBaisse() { return !!chateauV4.S().leviers.pont; },
  herseLevee() { return !!chateauV4.S().leviers.herse; },
  guet() { return !!chateauV4.S().guet; },
  get surGuet() { return chateauV4.surGuet; },
  fini() { return !!chateauV4.S().fin; },
  cles() {
    const S = chateauV4.S();
    return [
      ['v4_cle_poterne', ['poterne']], ['v4_cle_chapelle', ['sacristie']], ['v4_cle_donjon', ['donjon']], ['v4_cle_tour', ['tour_dame']], ['v4_trousseau', ['cachots', 'cellule_n2']],
    ].map(([id, ouvre]) => ({ id, nom: ITEMS[id] ? ITEMS[id].name : id, ouvre, trouvee: !!(farm.s && farm.count(id)) || Object.keys(S.pris).some((k) => chateauV4.Z && chateauV4.Z.objets[k.slice(2)] === id) }));
  },
  raccourcis() {
    const S = chateauV4.S(), V = chateauV4.Z, P = (k) => (V && V.pts[k]) || null;
    return [
      { id: 'pont', nom: 'le pont-levis', ouvert: !!S.leviers.pont, de: P('fosse_bord'), a: P('treuil') },
      { id: 'herse', nom: 'la herse de la haute cour', ouvert: !!S.leviers.herse, de: P('herse_dehors'), a: P('herse_dedans') },
      { id: 'depense', nom: 'la poterne de la dépense', ouvert: S.portes.depense === 'ouverte', de: P('depense_dehors'), a: P('depense_dedans') },
      { id: 'poterne', nom: 'la poterne de l’est', ouvert: S.portes.poterne === 'ouverte', de: P('poterne_dehors'), a: P('poterne_dedans') },
      { id: 'charnier', nom: 'la grille du charnier', ouvert: !!S.grilles.charnier, de: P('charnier'), a: P('cachots') },
      { id: 'cachots', nom: 'l’escalier des cachots', ouvert: S.portes['esc:cachots'] === 'ouverte', de: P('cachots'), a: null },
    ];
  },
  mesures() { const V = chateauV4.Z; return V ? Object.assign({}, V.mesures) : null; },
  // ------------------------------------------------------------- essais
  aller(id) {
    const V = chateauV4.Z;
    if (!V || !zone.dedans) return false;
    const P = V.pts[id];
    if (!P) return false;
    const p = game.player, Z = zone.Z;
    p.pos = [P.x, P.y + 0.05, P.z]; p.vel = [0, 0, 0]; p.yaw = P.yaw || 0; p.pitch = 0;
    game.renderer.uploadCover(P.x, P.z);
    return true;
  },
  ouvrir(id) {
    const S = chateauV4.S();
    if (id === 'pont' || id === 'herse') S.leviers[id] = farm.s.day || 1;
    else if (id === 'charnier') S.grilles.charnier = 1;
    else S.portes[id] = 'ouverte';
    chateauV4.appliquer(false);
    return true;
  },
};
