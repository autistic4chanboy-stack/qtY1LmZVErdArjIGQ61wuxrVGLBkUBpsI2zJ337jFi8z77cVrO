// ============================================================================
//  LES GOBELINS (agent X) : les créatures. Elles n'ont pas de point
//  d'apparition : gobelins (11-zzzzX-2-jeu.js) les fait paraître là où ils sont
//  (dehors, la nuit, près du joueur ; chez eux, à la Gobelinière), les mène
//  (leur façon de marcher, de fuir, de passer dans les murs) et les dessine.
//  La chasse ne les compte pas comme gibier (CHASSE_GIBIER ne les nomme pas),
//  les gardes ne les poursuivent pas (G1_BETES), on ne les dépèce pas.
// ============================================================================
Object.assign(CREATURES, {
  gobelin: { walk: 1.55, run: 6.4, range: 0, flee: 0, radius: 0.24, idle: [2, 6], rig: 'x_gobelin', h: 1.0, gob: true },
  gob_aieule: { walk: 0, run: 0, range: 0, flee: 0, radius: 0.4, idle: [4, 9], rig: 'x_aieule', h: 1.3, gob: true },
});
