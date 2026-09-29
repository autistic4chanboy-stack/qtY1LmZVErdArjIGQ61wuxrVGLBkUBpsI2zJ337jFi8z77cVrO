// ============================================================================
//  ARBRES ET FLEURS EN PLUS : types d'objets du décor, ce qu'on en récolte
//  (bois, châtaignes, noix, cerises, poires, prunes, fleurs, plantes utiles)
// ============================================================================
const FLORA_TREES = [
  // id, nom, sprites, hauteur, collision, ombre, balancement, espacement, fruit [objet, min, max]
  ['hetre', 'Hêtre', ['hetre0', 'hetre1'], [11, 15], 0.45, [3.6, 0.9], 0.25, 5, null],
  ['chataignier', 'Châtaignier', ['chataignier0'], [9, 13], 0.5, [3.8, 0.95], 0.22, 5, ['chataigne', 2, 5]],
  ['noyer', 'Noyer', ['noyer0'], [9, 12], 0.45, [3.6, 0.8], 0.25, 5, ['noix', 2, 5]],
  ['saule', 'Saule pleureur', ['saule0', 'saule1'], [8, 11], 0.4, [3.4, 0.85], 0.45, 5, null],
  ['peuplier', 'Peuplier', ['peuplier0', 'peuplier1'], [15, 21], 0.3, [1.6, 0.6], 0.35, 3, null],
  ['sapin', 'Sapin', ['sapin0', 'sapin1'], [12, 18], 0.35, [2.4, 0.95], 0.12, 3, null],
  ['sapin_neige', 'Sapin enneigé', ['sapinneige0', 'sapinneige1'], [10, 16], 0.35, [2.4, 0.9], 0.08, 3, null],
  ['meleze', 'Mélèze', ['meleze0'], [12, 17], 0.3, [2.0, 0.7], 0.2, 3, null],
  ['if', 'If', ['if0'], [6, 9], 0.4, [2.6, 0.95], 0.08, 3.5, null],
  ['tilleul', 'Tilleul', ['tilleul0'], [10, 14], 0.45, [3.6, 0.9], 0.25, 5, ['fleur_tilleul', 1, 3]],
  ['erable', 'Érable', ['erable0', 'erable1'], [8, 11], 0.4, [3.2, 0.85], 0.3, 4.5, null],
  ['cerisier', 'Cerisier', ['cerisier0'], [5.5, 7.5], 0.3, [2.6, 0.7], 0.3, 4, ['cerise', 3, 7]],
  ['poirier', 'Poirier', ['poirier0'], [6, 8.5], 0.3, [2.4, 0.75], 0.28, 4, ['poire', 1, 4]],
  ['prunier', 'Prunier', ['prunier0'], [5, 6.5], 0.3, [2.4, 0.75], 0.3, 4, ['prune', 2, 5]],
  ['aulne', 'Aulne', ['aulne0'], [8, 12], 0.35, [2.6, 0.8], 0.3, 3.5, null],
  ['houx', 'Houx', ['houx0'], [2.6, 4], 0, [1.6, 0.6], 0.1, 2.5, ['baies_houx', 1, 3]],
  ['foudroye', 'Arbre foudroyé', ['foudroye0', 'foudroye1'], [6, 9], 0.3, null, 0.02, 3, null],
];
const FLORA_WILD = [
  // id, nom, hauteur, ce qu'on cueille [objet, min, max, proba]
  ['jacinthe', 'Jacinthes des bois', [0.4, 0.55], [['fleur', 1, 2]]],
  ['digitale', 'Digitales', [1.1, 1.5], [['digitale', 1, 1], ['fleur', 0, 1]]],
  ['lupin', 'Lupins', [0.9, 1.2], [['fleur', 1, 2]]],
  ['lupin2', 'Lupins blancs', [0.9, 1.2], [['fleur', 1, 2]]],
  ['iris', 'Iris des marais', [0.8, 1.1], [['fleur', 1, 2]]],
  ['orchidee', 'Orchidée sauvage', [0.5, 0.7], [['orchidee', 1, 1]]],
  ['bouton_or', "Boutons d'or", [0.45, 0.6], [['fleur', 1, 1]]],
  ['pissenlit', 'Pissenlits', [0.3, 0.45], [['pissenlit', 1, 2]]],
  ['primevere', 'Primevères', [0.25, 0.35], [['fleur', 1, 1], ['graines_camomille', 0, 1, 0.04]]],
  ['violette', 'Violettes', [0.2, 0.3], [['fleur', 1, 1]]],
  ['trefle_f', 'Trèfle en fleur', [0.25, 0.35], [['trefle', 0, 1, 0.3], ['fleur', 0, 1]]],
  ['reine_pres', 'Reine-des-prés', [1.0, 1.4], [['reine_pres', 1, 2]]],
  ['achillee', 'Achillée', [0.6, 0.8], [['achillee', 1, 2]]],
  ['campanule', 'Campanules', [0.6, 0.8], [['fleur', 1, 2]]],
  ['chardon', 'Chardons', [0.9, 1.2], [['fibre', 0, 1], ['fleur', 0, 1]]],
  ['mauve', 'Mauves', [0.7, 0.9], [['fleur', 1, 2], ['herbes', 0, 1, 0.3]]],
  ['gentiane', 'Gentianes', [0.25, 0.35], [['gentiane', 1, 1]]],
  ['edelweiss', 'Edelweiss', [0.2, 0.3], [['edelweiss', 1, 1]]],
  ['rhododendron', 'Rhododendrons', [0.9, 1.2], [['fleur', 1, 3]]],
  ['eglantier', 'Églantier', [1.5, 2.1], [['cynorhodon', 1, 3], ['fleur', 0, 1]]],
  ['sureau', 'Sureau', [2.2, 3.0], [['baies_sureau', 1, 3], ['fleur', 0, 1]]],
  ['myosotis', 'Myosotis', [0.2, 0.3], [['fleur', 1, 1]]],
  ['jonquille', 'Jonquilles', [0.45, 0.6], [['fleur', 1, 2]]],
];
for (const [id, name, spr, h, col, shade, sway, spacing, fruit] of FLORA_TREES) {
  const t = { id, name, cat: 'Arbres', spr, h, col, sway, spacing, sink: 0.02 };
  if (shade) t.shade = shade;
  OBJ_TYPES.push(t);
  const drop = [['bois', id === 'houx' ? 1 : 3, id === 'houx' ? 2 : 6]];
  if (id === 'foudroye') drop.push(['charbon', 1, 3]);
  HARVEST[id] = { tool: 'hache', hp: id === 'houx' ? 3 : id === 'foudroye' ? 3 : 7, tier: 0, drop, stump: id !== 'houx' && id !== 'foudroye' };
  if (fruit) HARVEST[id].fruit = fruit;
}
for (const [id, name, h, drop] of FLORA_WILD) {
  OBJ_TYPES.push({ id, name, cat: ['eglantier', 'sureau', 'rhododendron'].includes(id) ? 'Végétation' : 'Fleurs', spr: ['w_' + id], h, col: 0, sway: 0.16, spacing: h[1] > 1.5 ? 2 : 0.9, sink: 0.04 });
  HARVEST[id] = { tool: 'main', hp: 0, drop, regrow: 24 };
}
OBJ_TYPES.forEach((t, i) => { OBJ_INDEX[t.id] = i; });

// ce qu'on en tire
defItem('chataigne', 'Châtaignes', 'cueillette', 1, ['baies', '#7a4a24'], { food: 5, heal: 2 });
defItem('noix', 'Noix', 'cueillette', 2, ['rond', '#b8966a'], { food: 5, heal: 2 });
defItem('cerise', 'Cerises', 'cueillette', 1, ['baies', '#c81c30'], { food: 4, heal: 2 });
defItem('poire', 'Poire', 'cueillette', 2, ['rond', '#c8c850'], { food: 6, heal: 2 });
defItem('prune', 'Prunes', 'cueillette', 1, ['baies', '#5a2a6a'], { food: 5, heal: 2 });
defItem('fleur_tilleul', 'Fleurs de tilleul', 'cueillette', 2, ['herbes', '#e8e0a0'], { desc: 'En tisane, elles font dormir les enfants et les inquiets.' });
defItem('baies_houx', 'Baies de houx', 'cueillette', 1, ['baies', '#c81818'], { desc: 'Jolies, et toxiques. Les oiseaux, eux, les mangent.' });
defItem('digitale', 'Digitale', 'cueillette', 5, ['c2_fleur', '#c060b0', '#f0d0f0'], { food: 1, heal: -20, poison: true, desc: 'Le cœur s’emballe, puis ralentit. La guérisseuse sait la doser.' });
defItem('orchidee', 'Orchidée sauvage', 'cueillette', 8, ['c2_fleur', '#e080c0', '#6a3a5a'], { desc: 'Rare. On dit qu’elle ne pousse que là où personne n’a marché depuis cent ans.' });
defItem('pissenlit', 'Pissenlits', 'cueillette', 1, ['c2_salade', '#7ab040', '#f0d030'], { food: 4, heal: 3 });
defItem('reine_pres', 'Reine-des-prés', 'cueillette', 2, ['herbes', '#f0ead0'], { heal: 8, desc: 'Contre la fièvre et les douleurs.' });
defItem('achillee', 'Achillée', 'cueillette', 2, ['herbes', '#f4f4ec'], { heal: 10, desc: 'L’herbe aux charpentiers : elle ferme les coupures.' });
defItem('gentiane', 'Gentiane', 'cueillette', 6, ['c2_fleur', '#2040c0', '#f0f0f0'], { heal: 12, desc: 'Amère comme la montagne. La guérisseuse la paie bien.' });
defItem('edelweiss', 'Edelweiss', 'cueillette', 10, ['c2_fleur', '#f0f0e8', '#d8c878'], { desc: 'L’étoile des neiges. On la cueille au bord des précipices, dit-on, pour prouver qu’on existe.' });
defItem('cynorhodon', 'Cynorhodons', 'cueillette', 1, ['baies', '#d03020'], { food: 3, heal: 4 });
defItem('baies_sureau', 'Baies de sureau', 'cueillette', 1, ['baies', '#2a1830'], { food: 3, heal: 2 });
defItem('chataignes_grillees', 'Châtaignes grillées', 'nourriture', 5, ['baies', '#6a3a1a'], { food: 18, heal: 6 });
ITEM_GROUPS.fruit.push('cerise', 'poire', 'prune', 'cynorhodon', 'baies_sureau');
ITEM_GROUPS.aromate.push('reine_pres', 'achillee', 'fleur_tilleul');
RECIPES.push(
  { out: 'confiture', n: 1, need: { cerise: 3, miel: 1 }, st: 'feu' },
  { out: 'gateau', n: 1, need: { farine: 1, noix: 2, oeuf: 1, miel: 1 }, st: 'four' },
  { out: 'chataignes_grillees', n: 1, need: { chataigne: 4 }, st: 'feu' },
);
MACHINES.tonneau.push({ in: { poire: 4 }, out: ['cidre', 1], h: 5 }, { in: { prune: 4 }, out: ['vin', 1], h: 8 });
{
  const S = (id) => NPC_DATA.find((d) => d.id === id);
  const H = S('guerisseuse'); if (H && H.shop) H.shop.buys.push('digitale', 'gentiane', 'edelweiss', 'reine_pres', 'achillee', 'fleur_tilleul', 'orchidee', 'baies_houx');
  const A = S('aubergiste'); if (A && A.shop) A.shop.buys.push('chataigne', 'noix', 'cerise', 'poire', 'prune');
  const M = S('maire'); if (M && M.shop) M.shop.buys.push('edelweiss', 'orchidee');
}
