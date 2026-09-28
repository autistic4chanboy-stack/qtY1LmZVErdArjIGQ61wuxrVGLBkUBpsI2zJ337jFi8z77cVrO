// ============================================================================
//  LA GRANDE VALLÉE : poissons de la rivière, du lac Noir et du lac gelé ;
//  ce qu'on trouve au refuge du col et au fond des crevasses
// ============================================================================
Object.assign(FISH, {
  goujon: { name: 'Goujon', price: 12, where: ['riviere'], time: 'jour', w: 6, col: '#9aa08a' },
  ombre: { name: 'Ombre commun', price: 50, where: ['riviere'], time: 'jour', w: 2, col: '#8a9098', rain: true },
  omble: { name: 'Omble chevalier', price: 95, where: ['lac_gele'], time: 'tout', w: 4, col: '#c86848' },
  lotte: { name: 'Lotte', price: 70, where: ['lac_gele', 'lac_noir'], time: 'nuit', w: 2, col: '#6a6448' },
  vieux_silure: { name: 'Le vieux silure du lac Noir', price: 650, where: ['lac_noir'], time: 'nuit', w: 0.12, col: '#22221e' },
});
for (const id of ['goujon', 'ombre', 'omble', 'lotte', 'vieux_silure']) { defItem(id, FISH[id].name, 'poisson', FISH[id].price, ['poisson', FISH[id].col], { food: 6, heal: 2, raw: true }); ITEM_GROUPS.poisson.push(id); }
ITEMS.vieux_silure.desc = 'Long comme un homme. Ses barbillons ont l’air de vous chercher encore.';
FISH.truite.where.push('riviere'); FISH.perche.where.push('riviere', 'lac_noir'); FISH.anguille.where.push('riviere', 'lac_noir');
FISH.brochet.where.push('lac_noir'); FISH.silure.where.push('lac_noir');

LOOT.refuge = { rolls: [2, 3], items: [['pain', 1, 2, 3], ['bougie', 1, 3, 4], ['corde', 1, 2, 3], ['charbon', 1, 3, 3], ['viande_fumee', 1, 1, 2], ['lanterne', 1, 1, 0.4], ['boussole', 1, 1, 0.4], ['argent', 5, 30, 2], ['edelweiss', 1, 1, 0.5]] };
LOOT.crevasse = { rolls: [2, 3], items: [['argent', 20, 90, 4], ['vieille_piece', 1, 3, 4], ['bijou', 1, 1, 2], ['corde', 1, 2, 3], ['boussole', 1, 1, 0.8], ['relique', 1, 1, 0.5], ['edelweiss', 1, 1, 1], ['os', 1, 2, 2]] };
