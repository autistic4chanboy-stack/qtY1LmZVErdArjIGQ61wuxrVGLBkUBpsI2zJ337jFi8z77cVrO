// ============================================================================
//  ESPÈCES ET MILIEUX : chaque milieu a ses plantes et ses bêtes ; certaines
//  vivent dans plusieurs milieux, d'autres dans un seul ; certaines sont
//  communes, d'autres rares. Nouvelles plantes (à faire identifier par
//  l'alchimiste), nouveaux poissons (selon les eaux), nouvelles bêtes.
//  Le catalogue ESPECES sert aux livres (bestiaire, herbier, poissons) et au
//  peuplement de la vallée (06-zzgen-lieux3.js).
// ============================================================================
const HABITATS = {
  pres: 'les prés', foret: 'la vieille forêt', bouleaux: 'les bois de bouleaux', marais: 'le marais', lande: 'la lande',
  berges: 'les berges des lacs et des étangs', riviere: 'la rivière', alpage: 'les alpages', neiges: 'les neiges et le glacier',
  sapiniere: 'les sapinières des monts', combe: 'les combes humides', rochers: 'les rochers d’altitude', ville: 'les villes et les villages',
  ferme: 'les fermes', souterrain: 'sous la terre',
};
const RARETE = ['commune', 'peu commune', 'rare', 'très rare', 'légendaire'];

// ---------------------------------------------------------------- nouvelles plantes
// id, nom (objet), nom au singulier (ce qu'on cueille), hauteur, [objet, min, max], milieux, rareté, effets
const PLANTES2 = [
  ['ail_ours', 'Ail des ours', 'Ail des ours', [0.3, 0.45], ['ail_ours', 1, 3], ['foret', 'bouleaux', 'combe'], 0, { food: 3, heal: 2 }],
  ['muguet', 'Muguet', 'Brin de muguet', [0.25, 0.35], ['muguet', 1, 2], ['foret', 'bouleaux'], 1, { poison: true, heal: -18, food: 0 }],
  ['millepertuis', 'Millepertuis', 'Millepertuis', [0.5, 0.7], ['millepertuis', 1, 2], ['lande', 'pres'], 1, { heal: 8 }],
  ['valeriane', 'Valériane', 'Racine de valériane', [0.9, 1.3], ['valeriane', 1, 1], ['marais', 'riviere', 'berges'], 1, {}],
  ['sauge', 'Sauge sauvage', 'Feuilles de sauge', [0.5, 0.7], ['sauge', 1, 2], ['lande'], 0, { heal: 4 }],
  ['serpolet', 'Thym serpolet', 'Serpolet', [0.15, 0.2], ['serpolet', 1, 3], ['lande', 'rochers'], 0, {}],
  ['arnica', 'Arnica', 'Fleurs d’arnica', [0.4, 0.55], ['arnica', 1, 1], ['alpage'], 2, { heal: 14 }],
  ['genepi', 'Génépi', 'Génépi', [0.15, 0.25], ['genepi', 1, 1], ['neiges', 'rochers'], 2, {}],
  ['joubarbe', 'Joubarbe', 'Joubarbe', [0.12, 0.18], ['joubarbe', 1, 2], ['rochers', 'alpage'], 1, { heal: 5 }],
  ['lichen', 'Lichen d’Islande', 'Lichen', [0.1, 0.15], ['lichen', 1, 3], ['rochers', 'neiges', 'sapiniere'], 0, { food: 2 }],
  ['aconit', 'Aconit', 'Aconit', [1.0, 1.4], ['aconit', 1, 1], ['alpage', 'combe'], 2, { poison: true, heal: -40, food: 0 }],
  ['rossolis', 'Rossolis', 'Rossolis', [0.1, 0.14], ['rossolis', 1, 1], ['marais'], 2, {}],
  ['menthe_eau', 'Menthe aquatique', 'Menthe aquatique', [0.4, 0.6], ['menthe_eau', 1, 2], ['riviere', 'berges', 'marais'], 0, { heal: 3 }],
  ['prele', 'Prêle', 'Prêle', [0.6, 0.9], ['prele', 1, 3], ['marais', 'riviere'], 0, {}],
  ['cresson', 'Cresson', 'Cresson', [0.15, 0.2], ['cresson', 1, 3], ['riviere'], 0, { food: 4, heal: 2 }],
  ['girolle', 'Girolles', 'Girolles', [0.12, 0.18], ['girolle', 1, 3], ['foret', 'sapiniere'], 1, { food: 6, heal: 2 }],
  ['cepe', 'Cèpes', 'Cèpe', [0.18, 0.25], ['cepe', 1, 2], ['foret', 'bouleaux'], 1, { food: 8, heal: 3 }],
  ['amanite', 'Amanite tue-mouches', 'Amanite', [0.18, 0.25], ['amanite', 1, 2], ['bouleaux', 'sapiniere'], 1, { poison: true, heal: -30, food: 0 }],
  ['trompette', 'Trompettes-de-la-mort', 'Trompettes-de-la-mort', [0.15, 0.2], ['trompette', 1, 3], ['foret'], 2, { food: 6, heal: 2 }],
  ['morille', 'Morilles', 'Morille', [0.14, 0.2], ['morille', 1, 2], ['bouleaux', 'pres'], 2, { food: 9, heal: 4 }],
  ['lycopode', 'Lycopode', 'Lycopode', [0.1, 0.14], ['lycopode', 1, 2], ['sapiniere'], 1, {}],
  ['belladone_s', 'Belladone', 'Baies de belladone', [0.9, 1.2], ['belladone_baies', 1, 3], ['combe', 'foret'], 2, { poison: true, heal: -35, food: 0 }],
  ['perce_neige', 'Perce-neige', 'Perce-neige', [0.18, 0.25], ['perce_neige', 1, 2], ['alpage', 'neiges'], 1, {}],
  ['linaigrette', 'Linaigrette', 'Linaigrette', [0.4, 0.6], ['linaigrette', 1, 2], ['marais', 'alpage'], 1, {}],
  ['ortie', 'Orties', 'Orties', [0.7, 1.0], ['ortie', 1, 3], ['pres', 'ferme', 'foret'], 0, { food: 2, heal: 1 }],
  ['tussilage', 'Tussilage', 'Fleurs de tussilage', [0.2, 0.3], ['tussilage', 1, 2], ['riviere', 'pres'], 0, { heal: 4 }],
  ['colchique', 'Colchiques', 'Colchique', [0.15, 0.22], ['colchique', 1, 2], ['pres', 'alpage'], 1, { poison: true, heal: -25, food: 0 }],
];
{
  const IC = { ail_ours: ['herbes', '#f0f0e8'], muguet: ['c2_fleur', '#f4f4ee', '#3a8a4a'], millepertuis: ['c2_fleur', '#f0c828', '#a07010'], valeriane: ['racine', '#c8a080'], sauge: ['herbes', '#9a8ac0'],
    serpolet: ['herbes', '#c878b0'], arnica: ['c2_fleur', '#f0b020', '#a06010'], genepi: ['herbes', '#c8ccc0'], joubarbe: ['c2_salade', '#7a9a70', '#a04850'], lichen: ['lichen', '#a8b098'],
    aconit: ['c2_fleur', '#4050c0', '#202870'], rossolis: ['c2_fleur', '#c83030', '#f0d0d0'], menthe_eau: ['herbes', '#b890d8'], prele: ['herbes', '#6aa05a'], cresson: ['c2_salade', '#4a9a40', '#e8e8e0'],
    girolle: ['champi', '#f0a838'], cepe: ['champi', '#8a5a30'], amanite: ['champi', '#e03020'], trompette: ['champi', '#2a2428'], morille: ['champi', '#9a7a50'],
    lycopode: ['herbes', '#4a8a40'], belladone_baies: ['baies', '#1a1420'], perce_neige: ['c2_fleur', '#f8f8f8', '#6ab06a'], linaigrette: ['herbes', '#f4f4f0'], ortie: ['herbes', '#3a7a30'],
    tussilage: ['c2_fleur', '#f0c020', '#a07010'], colchique: ['c2_fleur', '#d090d0', '#f0e8e8'] };
  const PRIX = [1, 2, 5, 12, 25]; // selon la rareté (équilibrage : était 6, 14, 30, 60, 120)
  for (const [id, name, single, h, drop, hab, rar, fx] of PLANTES2) {
    OBJ_TYPES.push({ id, name, cat: ['girolle', 'cepe', 'amanite', 'trompette', 'morille'].includes(id) ? 'Champignons' : 'Fleurs', spr: ['w2_' + (id === 'belladone_s' ? 'belladone' : id)], h, col: 0, sway: 0.15, spacing: 0.9, sink: 0.04 });
    HARVEST[id] = { tool: 'main', hp: 0, drop: [drop], regrow: 30 };
    if (!ITEMS[drop[0]]) defItem(drop[0], single, 'cueillette', PRIX[rar] || 10, IC[drop[0]] || ['herbes', '#8aa060'], Object.assign({ wild: true }, fx));
    else ITEMS[drop[0]].wild = true;
  }
  OBJ_TYPES.forEach((t, i) => { OBJ_INDEX[t.id] = i; });
}
// les plantes déjà connues de la vallée : à faire identifier elles aussi (sauf les plus banales)
for (const id of ['digitale', 'orchidee', 'pissenlit', 'reine_pres', 'achillee', 'gentiane', 'edelweiss', 'cynorhodon', 'baies_sureau', 'baies_houx', 'fleur_tilleul']) if (ITEMS[id]) ITEMS[id].wild = true;

// ---------------------------------------------------------------- nouveaux poissons (selon les eaux et la rareté)
Object.assign(FISH, {
  gardon: { name: 'Gardon', price: 3, where: ['lac', 'etang', 'riviere'], time: 'tout', w: 6, col: '#b8b8a8' },
  rotengle: { name: 'Rotengle', price: 3, where: ['etang', 'marais'], time: 'jour', w: 5, col: '#c89868' },
  tanche: { name: 'Tanche', price: 8, where: ['etang', 'marais'], time: 'nuit', w: 3, col: '#6a7a3a' },
  breme: { name: 'Brème', price: 6, where: ['lac'], time: 'tout', w: 4, col: '#a89878' },
  sandre: { name: 'Sandre', price: 21, where: ['lac', 'lac_noir'], time: 'nuit', w: 1.2, col: '#8a9a8a' },
  chevesne: { name: 'Chevesne', price: 5, where: ['riviere'], time: 'jour', w: 4, col: '#a0a8a0' },
  barbeau: { name: 'Barbeau', price: 9, where: ['riviere'], time: 'tout', w: 2, col: '#a88a5a' },
  vandoise: { name: 'Vandoise', price: 4, where: ['riviere'], time: 'jour', w: 4, col: '#c0c4c8' },
  vairon: { name: 'Vairon', price: 1, where: ['riviere', 'lac_gele'], time: 'jour', w: 6, col: '#8a9a6a' },
  loche: { name: 'Loche franche', price: 2, where: ['riviere'], time: 'nuit', w: 3, col: '#9a8a6a' },
  chabot: { name: 'Chabot', price: 2, where: ['riviere'], time: 'tout', w: 2, col: '#7a6a5a' },
  saumon: { name: 'Saumon', price: 49, where: ['riviere'], time: 'jour', w: 0.3, col: '#d08878' },
  esturgeon: { name: 'Esturgeon', price: 105, where: ['lac'], time: 'nuit', w: 0.1, col: '#6a6a6a' },
  ecrevisse: { name: 'Écrevisse', price: 5, where: ['riviere', 'etang'], time: 'nuit', w: 4, col: '#a84a2a' },
  ablette: { name: 'Ablette', price: 2, where: ['lac', 'riviere'], time: 'jour', w: 6, col: '#d0d4d8' },
  carassin: { name: 'Carassin doré', price: 15, where: ['etang'], time: 'jour', w: 0.8, col: '#e0a030' },
  poisson_chat: { name: 'Poisson-chat', price: 6, where: ['etang', 'marais'], time: 'nuit', w: 2, col: '#4a4038' },
  lavaret: { name: 'Lavaret', price: 18, where: ['lac_gele', 'lac'], time: 'tout', w: 1.5, col: '#b8c8d0' },
  reine_lac: { name: 'La Reine du lac', price: 200, where: ['lac'], time: 'nuit', w: 0.04, col: '#c8a040' },
  poisson_roche: { name: 'Poisson des roches', price: 20, where: ['souterrain'], time: 'tout', w: 1, col: '#e8e0f0' },
});
for (const id of ['gardon', 'rotengle', 'tanche', 'breme', 'sandre', 'chevesne', 'barbeau', 'vandoise', 'vairon', 'loche', 'chabot', 'saumon', 'esturgeon', 'ecrevisse', 'ablette', 'carassin', 'poisson_chat', 'lavaret', 'reine_lac', 'poisson_roche']) {
  defItem(id, FISH[id].name, 'poisson', FISH[id].price, ['poisson', FISH[id].col], { food: 6, heal: 2, raw: true });
  ITEM_GROUPS.poisson.push(id);
}
ITEMS.reine_lac.desc = 'Une carpe dorée longue comme un enfant, aux écailles larges comme des pièces. On dit qu’elle a connu le clocher avant l’eau.';
FISH.poisson_aveugle.where.push('souterrain');
// rareté d'un poisson (d'après son poids dans les tirages)
const fishRarete = (id) => { const w = FISH[id].w; return w >= 4 ? 0 : w >= 2 ? 1 : w >= 0.5 ? 2 : w >= 0.1 ? 3 : 4; };

// ---------------------------------------------------------------- nouvelles bêtes
// (leurs comportements et leurs modèles sont dans 10-zzfauna3.js : CREATURES n'existe pas encore ici)
defItem('peau_salamandre', 'Peau de salamandre', 'materiau', 8, ['cuir', '#2a2a20'], { alch: true, desc: 'Noire et jaune, froide au toucher même au soleil.' });
defItem('ecaille_tortue', 'Écaille de tortue', 'materiau', 8, ['os', '#5a5a3a'], { alch: true });
defItem('plume_bleue', 'Plume de martin-pêcheur', 'materiau', 5, ['plume', '#2a90d0'], { alch: true });
defItem('plume_aigle', 'Plume d’aigle', 'materiau', 10, ['plume', '#6a4a2a'], { alch: true, desc: 'Longue comme l’avant-bras. Les Aëlim, dit-on, en faisaient des plumes à écrire.' });
// ---------------------------------------------------------------- le catalogue (livres, peuplement)
// bêtes : [id de créature, nom, milieux, rareté, dangereux (0-3)]
const ESPECES_ANIMAUX = [
  ['rabbit', 'Lapin de garenne', ['pres', 'lande'], 0, 0], ['lievre_blanc', 'Lièvre variable', ['alpage', 'neiges'], 1, 0], ['deer', 'Cerf élaphe', ['foret', 'bouleaux'], 1, 1],
  ['roe', 'Chevreuil', ['bouleaux', 'foret', 'pres'], 0, 0], ['boar', 'Sanglier', ['foret'], 1, 2], ['fox', 'Renard', ['pres', 'foret', 'ferme'], 0, 0],
  ['wolf', 'Loup', ['foret', 'sapiniere'], 2, 3], ['bear', 'Ours brun', ['sapiniere', 'foret'], 3, 3], ['lynx', 'Lynx', ['sapiniere', 'rochers'], 2, 1],
  ['chamois', 'Chamois', ['alpage', 'rochers'], 1, 0], ['ibex', 'Bouquetin', ['rochers', 'alpage'], 1, 1], ['marmot', 'Marmotte', ['alpage'], 0, 0],
  ['squirrel', 'Écureuil roux', ['foret', 'sapiniere', 'bouleaux'], 0, 0], ['martre', 'Martre', ['foret', 'sapiniere'], 2, 0], ['badger', 'Blaireau', ['foret'], 1, 1],
  ['hedgehog', 'Hérisson', ['pres', 'ferme'], 0, 0], ['otter', 'Loutre', ['riviere', 'berges'], 2, 0], ['castor', 'Castor', ['riviere'], 1, 0],
  ['frog', 'Grenouille', ['marais', 'berges'], 0, 0], ['salamandre', 'Salamandre tachetée', ['combe', 'foret'], 2, 1], ['cistude', 'Cistude d’Europe', ['marais'], 2, 0],
  ['snake', 'Vipère aspic', ['lande', 'rochers'], 1, 2], ['couleuvre', 'Couleuvre à collier', ['riviere', 'marais', 'berges'], 1, 0],
  ['heron', 'Héron cendré', ['marais', 'berges', 'riviere'], 0, 0], ['stork', 'Cigogne blanche', ['pres', 'marais'], 2, 0], ['swan', 'Cygne', ['berges'], 1, 0],
  ['duck', 'Canard colvert', ['berges', 'riviere'], 0, 0], ['martin', 'Martin-pêcheur', ['riviere'], 2, 0], ['pheasant', 'Faisan', ['pres', 'lande'], 0, 0],
  ['partridge', 'Perdrix grise', ['pres'], 0, 0], ['lagopede', 'Lagopède alpin', ['neiges', 'alpage'], 2, 0], ['tetras', 'Grand tétras', ['sapiniere'], 3, 0],
  ['magpie', 'Pie bavarde', ['pres', 'ville'], 0, 0], ['crow', 'Corneille', ['pres', 'ferme'], 0, 0], ['chocard', 'Chocard à bec jaune', ['rochers', 'neiges'], 0, 0],
  ['owl', 'Chouette hulotte', ['foret'], 1, 0], ['aigle', 'Aigle royal', ['rochers', 'alpage'], 3, 0], ['bat', 'Chauve-souris', ['foret', 'souterrain'], 1, 0],
  ['pigeon', 'Pigeon des villes', ['ville'], 0, 0], ['wildhorse', 'Cheval sauvage', ['pres'], 2, 1], ['bird', 'Passereaux', ['pres', 'foret', 'ville'], 0, 0],
  ['hen', 'Poule', ['ferme'], 0, 0], ['cow', 'Vache', ['ferme'], 0, 0], ['sheep', 'Mouton', ['ferme'], 0, 0], ['pig', 'Cochon', ['ferme'], 0, 0], ['horse', 'Cheval', ['ferme'], 0, 0],
  ['goat', 'Chèvre', ['ferme'], 0, 0], ['donkey', 'Âne', ['ferme'], 0, 0], ['goose', 'Oie', ['ferme'], 0, 1], ['dog', 'Chien', ['ferme', 'ville'], 0, 0], ['cat', 'Chat', ['ferme', 'ville'], 0, 0],
];
// plantes : [id d'objet, milieux, rareté] (les anciennes ; les nouvelles viennent de PLANTES2)
const ESPECES_PLANTES = [
  ['poppies', ['pres'], 0], ['daisies', ['pres'], 0], ['cornflower', ['pres'], 0], ['lavender', ['lande'], 1], ['sunflower', ['pres', 'ferme'], 1], ['heather', ['lande'], 0],
  ['mushroom', ['foret', 'bouleaux'], 0], ['berry', ['foret', 'lande'], 0], ['herbs', ['foret', 'pres'], 0], ['fern', ['foret', 'combe'], 0], ['reeds', ['berges', 'marais', 'riviere'], 0],
  ['lilypad', ['berges', 'marais'], 0], ['tallgrass', ['pres'], 0],
  ['jacinthe', ['foret'], 0], ['digitale', ['foret'], 1], ['lupin', ['pres'], 1], ['lupin2', ['pres'], 1], ['iris', ['berges', 'marais'], 1], ['orchidee', ['lande', 'pres'], 3],
  ['bouton_or', ['pres'], 0], ['pissenlit', ['pres', 'ferme'], 0], ['primevere', ['pres'], 0], ['violette', ['pres', 'foret'], 0], ['trefle_f', ['pres'], 0], ['reine_pres', ['berges'], 1],
  ['achillee', ['lande'], 1], ['campanule', ['lande', 'alpage'], 1], ['chardon', ['lande'], 0], ['mauve', ['pres'], 1], ['gentiane', ['alpage', 'rochers'], 2], ['edelweiss', ['rochers', 'neiges'], 3],
  ['rhododendron', ['alpage', 'sapiniere'], 1], ['eglantier', ['lande', 'pres'], 1], ['sureau', ['foret', 'pres'], 1], ['myosotis', ['berges', 'riviere'], 1], ['jonquille', ['pres'], 1],
  ...PLANTES2.map(([id, , , , , hab, rar]) => [id, hab, rar]),
];
// arbres : [id, milieux, rareté]
const ESPECES_ARBRES = [
  ['oak', ['foret', 'pres'], 0], ['birch', ['bouleaux'], 0], ['pine', ['sapiniere', 'lande', 'rochers'], 0], ['apple', ['pres', 'ferme'], 0], ['deadtree', ['marais'], 1],
  ['giantoak', ['pres'], 4], ['hetre', ['foret'], 0], ['chataignier', ['foret'], 1], ['noyer', ['foret', 'pres'], 1], ['saule', ['riviere', 'berges'], 1], ['peuplier', ['riviere', 'pres'], 0],
  ['sapin', ['sapiniere'], 0], ['sapin_neige', ['neiges', 'sapiniere'], 0], ['meleze', ['sapiniere', 'alpage'], 1], ['if', ['ville'], 2], ['tilleul', ['pres', 'ville'], 1], ['erable', ['foret', 'pres'], 1],
  ['cerisier', ['pres'], 1], ['poirier', ['pres'], 1], ['prunier', ['pres'], 1], ['aulne', ['riviere', 'marais'], 1], ['houx', ['foret'], 1], ['foudroye', ['foret', 'rochers'], 2],
];
// objets cueillis « de base », que tout le monde reconnaît (pas besoin de les faire identifier)
const PLANTES_BANALES = new Set(['fleur', 'herbes', 'champignon', 'baies', 'pomme', 'fibre', 'foin', 'trefle', 'chataigne', 'noix', 'cerise', 'poire', 'prune']);
