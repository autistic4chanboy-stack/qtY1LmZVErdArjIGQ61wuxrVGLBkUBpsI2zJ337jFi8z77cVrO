// ============================================================================
//  DÉFINITIONS (FERME) : objets du monde, objets d'inventaire, cultures,
//  animaux, poissons, recettes, outils
// ============================================================================

const F_POWERED = 4;

// Décor supplémentaire (sprites)
OBJ_TYPES.push(
  { id: 'deadtree', name: 'Arbre mort', cat: 'Arbres', spr: ['deadtree0', 'deadtree1'], h: [6, 9], col: 0.3, shade: [1.2, 0.3], sway: 0.05, spacing: 3, sink: 0.02 },
  { id: 'giantoak', name: 'Chêne millénaire', cat: 'Arbres', spr: ['oak0'], h: [24, 28], col: 1.6, shade: [9, 1], sway: 0.1, spacing: 20, sink: 0.02 },
  { id: 'fern', name: 'Fougère', cat: 'Végétation', spr: ['fern0'], h: [0.7, 1.0], col: 0, sway: 0.2, spacing: 0.8, sink: 0.05 },
  { id: 'heather', name: 'Bruyère', cat: 'Fleurs', spr: ['heather0'], h: [0.6, 0.8], col: 0, sway: 0.1, spacing: 0.9, sink: 0.05 },
  { id: 'herbs', name: 'Herbes médicinales', cat: 'Végétation', spr: ['herbs0'], h: [0.5, 0.7], col: 0, sway: 0.15, spacing: 0.8, sink: 0.04 },
  { id: 'note', name: 'Note', cat: 'Objets', spr: ['note'], h: [1.0, 1.0], col: 0, sway: 0, spacing: 2, sink: 0, hidden: true },
  { id: 'bones', name: 'Ossements', cat: 'Objets', spr: ['bones0'], h: [0.4, 0.45], col: 0, sway: 0, spacing: 1, sink: 0.05 },
  { id: 'vein', name: 'Filon', cat: 'Mine', spr: ['vein0', 'vein1', 'vein2', 'vein3'], h: [0.9, 1.3], col: 0, colK: 0.45, sway: 0, spacing: 1.5, sink: 0.05 },
  { id: 'lilypad', name: 'Nénuphars', cat: 'Végétation', spr: ['lily0'], h: [0.3, 0.35], col: 0, sway: 0, spacing: 1, sink: 0 },
  { id: 'wisp', name: 'Feu follet', cat: 'Objets', spr: ['wisp'], h: [0.4, 0.4], col: 0, sway: 0, spacing: 2, sink: 0, flags: F_ANIMATED, hidden: true, light: { c: [0.5, 0.9, 1.0], r: 7, y: 0.2 } },
  { id: 'fox', name: 'Renard', cat: 'Animaux', spr: ['a_deer'], h: [0.6, 0.65], animal: 'fox', col: 0, sway: 0, spacing: 3, sink: 0 },
  { id: 'wolf', name: 'Loup', cat: 'Animaux', spr: ['a_deer'], h: [0.9, 1.0], animal: 'wolf', col: 0, sway: 0, spacing: 3, sink: 0 },
  { id: 'boar', name: 'Sanglier', cat: 'Animaux', spr: ['a_pig'], h: [1.0, 1.1], animal: 'boar', col: 0, sway: 0, spacing: 3, sink: 0 },
  { id: 'crows', name: 'Corbeaux', cat: 'Animaux', spr: ['a_bird'], h: [0.3, 0.3], animal: 'crow', col: 0, sway: 0, spacing: 10, sink: 0 },
  { id: 'dog', name: 'Chien', cat: 'Animaux', spr: ['a_sheep'], h: [0.7, 0.7], animal: 'dog', col: 0, sway: 0, spacing: 2, sink: 0 },
  { id: 'cat', name: 'Chat', cat: 'Animaux', spr: ['a_rabbit'], h: [0.4, 0.4], animal: 'cat', col: 0, sway: 0, spacing: 2, sink: 0 },
);
OBJ_TYPES.forEach((t, i) => { OBJ_INDEX[t.id] = i; });
OBJ_TYPES[OBJ_INDEX.villager].hidden = true; // les habitants sont gérés à part

// Paliers d'outils : pierre < cuivre < fer < acier
const TIERS = ['pierre', 'cuivre', 'fer', 'acier'];
const TIER_NAMES = { pierre: 'de pierre', cuivre: 'de cuivre', fer: 'de fer', acier: "d'acier" };
const TIER_COL = { pierre: '#8a8680', cuivre: '#c8743a', fer: '#9aa2ac', acier: '#dce4ec' };

// Ressources récoltables : outil, points de vie, palier minimal, butin [objet, min, max, proba]
const HARVEST = {
  oak: { tool: 'hache', hp: 7, tier: 0, drop: [['bois', 4, 6]], stump: true },
  apple: { tool: 'hache', hp: 5, tier: 0, drop: [['bois', 3, 4], ['pomme', 1, 3]], stump: true },
  birch: { tool: 'hache', hp: 5, tier: 0, drop: [['bois', 3, 4]], stump: true },
  pine: { tool: 'hache', hp: 7, tier: 0, drop: [['bois', 4, 6], ['fibre', 0, 1]], stump: true },
  deadtree: { tool: 'hache', hp: 3, tier: 0, drop: [['bois', 2, 3]] },
  giantoak: { tool: 'hache', hp: 60, tier: 3, drop: [['bois', 30, 40], ['figurine', 1, 1]], stump: true, omen: true },
  stump: { tool: 'hache', hp: 3, tier: 0, drop: [['bois', 1, 2]] },
  bush: { tool: 'hache', hp: 1, tier: 0, drop: [['fibre', 1, 2]] },
  woodpile: { tool: 'main', hp: 0, drop: [['bois', 4, 6]] },
  rock: { tool: 'pioche', hp: 6, tier: 0, drop: [['pierre', 3, 5], ['minerai_cuivre', 0, 1, 0.35], ['charbon', 0, 1, 0.25]] },
  stones: { tool: 'pioche', hp: 1, tier: 0, drop: [['pierre', 1, 2]] },
  orepile: { tool: 'pioche', hp: 3, tier: 0, drop: [['minerai_cuivre', 2, 3], ['charbon', 1, 2]] },
  crystal: { tool: 'pioche', hp: 4, tier: 3, drop: [['gemme', 1, 2]] },
  vein: { tool: 'pioche', hp: 4, tier: 0, veins: true },
  tallgrass: { tool: 'main', hp: 0, drop: [['fibre', 1, 2]] },
  reeds: { tool: 'main', hp: 0, drop: [['fibre', 2, 3]] },
  poppies: { tool: 'main', hp: 0, drop: [['fleur', 1, 2]] },
  daisies: { tool: 'main', hp: 0, drop: [['fleur', 1, 2]] },
  lavender: { tool: 'main', hp: 0, drop: [['fleur', 1, 2], ['herbes', 0, 1]] },
  cornflower: { tool: 'main', hp: 0, drop: [['fleur', 1, 2]] },
  sunflower: { tool: 'main', hp: 0, drop: [['fleur', 2, 3]] },
  heather: { tool: 'main', hp: 0, drop: [['fleur', 1, 1]] },
  mushroom: { tool: 'main', hp: 0, drop: [['champignon', 1, 3]] },
  berry: { tool: 'main', hp: 0, drop: [['baies', 2, 4]], regrow: 3 },
  herbs: { tool: 'main', hp: 0, drop: [['herbes', 1, 3]] },
  fern: { tool: 'main', hp: 0, drop: [['fibre', 1, 1]] },
  hay: { tool: 'main', hp: 0, drop: [['foin', 3, 5]] },
  wheat: { tool: 'main', hp: 0, drop: [['ble', 1, 1]] },
};
// Filons : variante -> minerai et palier de pioche requis
const VEINS = [
  { item: 'minerai_cuivre', tier: 0, n: [2, 4], name: 'Filon de cuivre' },
  { item: 'minerai_fer', tier: 1, n: [2, 3], name: 'Filon de fer' },
  { item: 'minerai_or', tier: 2, n: [1, 3], name: "Filon d'or" },
  { item: 'charbon', tier: 0, n: [2, 4], name: 'Veine de charbon' },
];

// Gibier et bêtes : points de vie et butin
const PREY = {
  rabbit: { hp: 10, drop: [['viande', 1, 1], ['cuir', 0, 1]] },
  deer: { hp: 40, drop: [['viande', 3, 4], ['cuir', 1, 2], ['bois_de_cerf', 0, 1]] },
  boar: { hp: 60, drop: [['viande', 4, 5], ['cuir', 1, 2]] },
  fox: { hp: 20, drop: [['cuir', 1, 1]] },
  wolf: { hp: 45, drop: [['cuir', 1, 2], ['viande', 1, 2]] },
  duck: { hp: 8, drop: [['viande', 1, 1], ['plume', 1, 2]] },
  hen: { hp: 8, drop: [['viande', 1, 1], ['plume', 1, 2]] },
  sheep: { hp: 30, drop: [['viande', 2, 3], ['laine', 1, 2]] },
  cow: { hp: 60, drop: [['viande', 4, 6], ['cuir', 2, 2]] },
  pig: { hp: 40, drop: [['viande', 4, 5]] },
  horse: { hp: 80, drop: [['viande', 4, 5], ['cuir', 2, 3]] },
  crow: { hp: 4, drop: [['plume', 1, 2]] },
  bird: { hp: 4, drop: [['plume', 1, 1]] },
  dog: { hp: 40, drop: [] },
  cat: { hp: 15, drop: [] },
};

// ---------------------------------------------------------------- objets d'inventaire
// cat : outil, graine, culture, produit, cueillette, chasse, poisson, materiau, nourriture, objet, animal, quete
// ic : [forme, couleur 1, couleur 2]
const ITEMS = {};
function defItem(id, name, cat, price, ic, extra) { ITEMS[id] = Object.assign({ id, name, cat, price, ic }, extra || {}); }

// cultures : heures de pousse quand la terre est humide, repousse (h), récolte, sensible au gel
const CROPS = {
  radis: { name: 'Radis', h: 2, regrow: 0, yield: [1, 2], frost: false, col: '#d84060' },
  ble: { name: 'Blé', h: 2.5, regrow: 0, yield: [2, 3], frost: false, col: '#e0c060' },
  carotte: { name: 'Carotte', h: 3, regrow: 0, yield: [1, 2], frost: false, col: '#e87a20' },
  lin: { name: 'Lin', h: 3, regrow: 0, yield: [2, 3], frost: false, col: '#6a8ae0' },
  patate: { name: 'Pomme de terre', h: 4, regrow: 0, yield: [2, 4], frost: false, col: '#b89060' },
  betterave: { name: 'Betterave', h: 4, regrow: 0, yield: [1, 2], frost: false, col: '#8a2050' },
  haricot: { name: 'Haricots', h: 5, regrow: 2, yield: [2, 3], frost: true, col: '#5a9a3a' },
  fraise: { name: 'Fraise', h: 5, regrow: 2.5, yield: [2, 3], frost: true, col: '#e02030' },
  tournesol: { name: 'Tournesol', h: 5, regrow: 0, yield: [1, 1], frost: false, col: '#f0c020', seedBack: [1, 3] },
  chou: { name: 'Chou', h: 6, regrow: 0, yield: [1, 1], frost: false, col: '#8ac060' },
  tomate: { name: 'Tomate', h: 6, regrow: 3, yield: [2, 4], frost: true, col: '#d83020' },
  mais: { name: 'Maïs', h: 6, regrow: 3, yield: [2, 3], frost: true, col: '#f0c030' },
  melon: { name: 'Melon', h: 8, regrow: 0, yield: [1, 1], frost: true, col: '#7ab050' },
  citrouille: { name: 'Citrouille', h: 10, regrow: 0, yield: [1, 1], frost: true, col: '#e88a20' },
};
const CROP_PRICE = { radis: 8, ble: 7, carotte: 12, lin: 6, patate: 14, betterave: 16, haricot: 10, fraise: 18, tournesol: 22, chou: 32, tomate: 14, mais: 16, melon: 60, citrouille: 85 };
const SEED_PRICE = { radis: 3, ble: 3, carotte: 5, lin: 3, patate: 7, betterave: 6, haricot: 9, fraise: 16, tournesol: 10, chou: 14, tomate: 12, mais: 12, melon: 25, citrouille: 30 };
for (const id in CROPS) {
  const c = CROPS[id];
  defItem(id, c.name === 'Maïs' ? 'Épi de maïs' : c.name, 'culture', CROP_PRICE[id], ['crop_' + id, c.col], { food: id === 'ble' || id === 'lin' ? 0 : 8, heal: 2 });
  defItem('graines_' + id, 'Graines : ' + c.name.toLowerCase(), 'graine', Math.ceil(SEED_PRICE[id] / 2), ['sac', c.col], { crop: id, buy: SEED_PRICE[id] });
}
ITEMS.graines_patate.name = 'Plants de pomme de terre';

defItem('oeuf', 'Œuf', 'produit', 15, ['oeuf', '#f2ede2'], { food: 6, heal: 2 });
defItem('lait', 'Bouteille de lait', 'produit', 30, ['bouteille', '#f4f2ea'], { food: 10, heal: 4 });
defItem('laine', 'Laine', 'produit', 45, ['laine', '#ece6d8']);
defItem('truffe', 'Truffe', 'produit', 160, ['truffe', '#3a2a22']);
defItem('plume', 'Plume', 'produit', 4, ['plume', '#d8d0c0']);
defItem('miel', 'Pot de miel', 'produit', 70, ['pot', '#e8a820'], { food: 12, heal: 6 });
defItem('champignon', 'Champignons', 'cueillette', 14, ['champi', '#c84030'], { food: 5, heal: 2 });
defItem('baies', 'Baies', 'cueillette', 8, ['baies', '#4a50c8'], { food: 4, heal: 2 });
defItem('fleur', 'Fleurs des champs', 'cueillette', 6, ['fleur', '#e8c040']);
defItem('herbes', 'Herbes médicinales', 'cueillette', 18, ['herbes', '#6aa050'], { heal: 12 });
defItem('pomme', 'Pomme', 'cueillette', 10, ['rond', '#c82828'], { food: 6, heal: 2 });
defItem('viande', 'Viande crue', 'chasse', 25, ['viande', '#b83838'], { food: 4, heal: 0, raw: true });
defItem('cuir', 'Cuir', 'chasse', 30, ['cuir', '#8a5a34']);
defItem('bois_de_cerf', 'Bois de cerf', 'chasse', 90, ['cerf', '#cbb894']);
defItem('bois', 'Bûches', 'materiau', 2, ['buche', '#8a5a34']);
defItem('pierre', 'Pierres', 'materiau', 2, ['caillou', '#8a8a88']);
defItem('fibre', 'Fibres', 'materiau', 1, ['fibre', '#8aa050']);
defItem('charbon', 'Charbon', 'materiau', 10, ['charbon', '#2a2a2e']);
defItem('minerai_cuivre', 'Minerai de cuivre', 'materiau', 12, ['minerai', '#c8743a']);
defItem('minerai_fer', 'Minerai de fer', 'materiau', 20, ['minerai', '#9aa2ac']);
defItem('minerai_or', "Minerai d'or", 'materiau', 45, ['minerai', '#f0c040']);
defItem('lingot_cuivre', 'Lingot de cuivre', 'materiau', 50, ['lingot', '#c8743a']);
defItem('lingot_fer', 'Lingot de fer', 'materiau', 80, ['lingot', '#9aa2ac']);
defItem('lingot_acier', "Lingot d'acier", 'materiau', 180, ['lingot', '#dce4ec']);
defItem('lingot_or', "Lingot d'or", 'materiau', 220, ['lingot', '#f0c040']);
defItem('gemme', 'Gemme', 'materiau', 300, ['gemme', '#60c8e8']);
defItem('foin', 'Foin', 'materiau', 3, ['foin', '#d8c07a']);
defItem('figurine', 'Figurine de bois', 'quete', 25, ['figurine', '#8a6a44'], { desc: 'Une petite silhouette sculptée. Le visage est effacé.' });
defItem('pain', 'Pain', 'nourriture', 15, ['pain', '#c48846'], { food: 20, heal: 6 });
defItem('brioche', 'Brioche', 'nourriture', 25, ['brioche', '#e0a050'], { food: 22, heal: 8 });
defItem('tarte', 'Tarte aux pommes', 'nourriture', 45, ['tarte', '#c87838'], { food: 35, heal: 15 });
defItem('soupe', 'Soupe de légumes', 'nourriture', 35, ['bol', '#b8a040'], { food: 30, heal: 15 });
defItem('ragout', 'Ragoût', 'nourriture', 70, ['bol', '#8a4a2a'], { food: 50, heal: 30 });
defItem('poisson_grille', 'Poisson grillé', 'nourriture', 40, ['poisson', '#b8783a'], { food: 30, heal: 15 });
defItem('viande_grillee', 'Viande grillée', 'nourriture', 45, ['viande', '#8a4a28'], { food: 35, heal: 15 });
defItem('fromage', 'Fromage', 'nourriture', 60, ['fromage', '#f0d070'], { food: 25, heal: 10 });
defItem('confiture', 'Confiture', 'nourriture', 55, ['pot', '#b82040'], { food: 20, heal: 8 });
defItem('infusion', 'Infusion', 'nourriture', 30, ['bol', '#6aa050'], { food: 5, heal: 35 });

const FISH = {
  carpe: { name: 'Carpe', price: 30, where: ['lac', 'etang', 'marais'], time: 'tout', w: 5, col: '#a8904a' },
  perche: { name: 'Perche', price: 25, where: ['lac', 'etang'], time: 'jour', w: 5, col: '#8aa05a' },
  truite: { name: 'Truite', price: 45, where: ['lac'], time: 'jour', w: 3, col: '#b0a0a8', rain: true },
  brochet: { name: 'Brochet', price: 70, where: ['lac'], time: 'tout', w: 2, col: '#6a8a5a' },
  anguille: { name: 'Anguille', price: 55, where: ['marais', 'etang'], time: 'nuit', w: 3, col: '#4a4a3a' },
  silure: { name: 'Silure', price: 120, where: ['lac'], time: 'nuit', w: 1, col: '#3a3a36' },
  poisson_lune: { name: 'Poisson-lune', price: 400, where: ['lac'], time: 'nuit', w: 0.25, col: '#d8e0f0', moon: true },
  poisson_aveugle: { name: 'Poisson aveugle', price: 250, where: ['mine', 'envers'], time: 'tout', w: 1, col: '#f0e8e8' },
};
for (const id in FISH) defItem(id, FISH[id].name, 'poisson', FISH[id].price, ['poisson', FISH[id].col], { food: 6, heal: 2, raw: true });

// outils (paliers)
for (const t of TIERS) {
  const k = TIERS.indexOf(t);
  defItem('hache_' + t, 'Hache ' + TIER_NAMES[t], 'outil', [20, 120, 260, 600][k], ['hache', TIER_COL[t]], { tool: 'hache', tier: k });
  defItem('pioche_' + t, 'Pioche ' + TIER_NAMES[t], 'outil', [20, 120, 260, 600][k], ['pioche', TIER_COL[t]], { tool: 'pioche', tier: k });
}
defItem('houe', 'Houe', 'outil', 30, ['houe', '#8a8680'], { tool: 'houe' });
defItem('arrosoir', 'Arrosoir', 'outil', 60, ['arrosoir', '#6a7a70'], { tool: 'arrosoir' });
defItem('faux', 'Faux', 'outil', 90, ['faux', '#9aa2ac'], { tool: 'faux' });
defItem('canne', 'Canne à pêche', 'outil', 60, ['canne', '#8a6a44'], { tool: 'canne' });
defItem('arc', 'Arc', 'outil', 80, ['arc', '#8a5a34'], { tool: 'arc' });
defItem('fleche', 'Flèche', 'outil', 3, ['fleche', '#9a8a70']);
defItem('marteau', 'Marteau', 'outil', 25, ['marteau', '#8a8680'], { tool: 'marteau' });
defItem('cisailles', 'Cisailles', 'outil', 70, ['cisailles', '#9aa2ac'], { tool: 'cisailles' });
defItem('seau', 'Seau', 'outil', 40, ['seau', '#8a6a44'], { tool: 'seau' });
defItem('lanterne', 'Lanterne', 'outil', 60, ['lanterne', '#e8b050'], { tool: 'lanterne' });
defItem('montre', 'Montre à gousset', 'outil', 120, ['montre', '#d0b060'], { tool: 'montre' });
defItem('boussole', 'Boussole', 'outil', 90, ['boussole', '#b88a50'], { tool: 'boussole' });

// objets à poser (id = modèle 3D)
const PLACEABLES = {
  cloture: { name: 'Clôture', price: 6, snap: 2 }, cloture_pierre: { name: 'Muret de pierre', price: 12, snap: 2 }, haie: { name: 'Haie', price: 15, snap: 2 },
  portillon: { name: 'Portillon', price: 20, snap: 2, gate: true }, epouvantail: { name: 'Épouvantail', price: 45, scare: 9 },
  mangeoire: { name: 'Mangeoire', price: 30 }, abreuvoir: { name: 'Abreuvoir', price: 30 }, nichoir: { name: 'Nichoir', price: 25, birds: true },
  ruche: { name: 'Ruche', price: 90 }, coffre: { name: 'Coffre', price: 40, store: true }, caisse_expedition: { name: "Caisse d'expédition", price: 60, ship: true },
  banc: { name: 'Banc', price: 30 }, pot_fleurs: { name: 'Pot de fleurs', price: 15 }, lampadaire: { name: 'Lampadaire', price: 120, light: true },
  statue: { name: 'Statue', price: 250 }, panneau: { name: 'Panneau', price: 12 }, allee: { name: 'Pavés', price: 3, flat: true, snap: 1 },
  dalle: { name: 'Dalle', price: 3, flat: true, snap: 1 }, plancher: { name: 'Plancher', price: 3, flat: true, snap: 1 },
  parterre: { name: 'Parterre fleuri', price: 25 }, jeune_pommier: { name: 'Jeune pommier', price: 80, tree: true }, table: { name: 'Table', price: 35 },
  chaise: { name: 'Chaise', price: 15 }, girouette: { name: 'Girouette', price: 80 }, tonneau: { name: 'Tonneau', price: 25 }, brouette: { name: 'Brouette', price: 40 },
  botte_foin: { name: 'Botte de foin', price: 10 }, arche_fleurie: { name: 'Arche fleurie', price: 60 }, puits_deco: { name: 'Puits décoratif', price: 150, water: true },
  feu_camp: { name: 'Feu de camp', price: 10, light: true, cook: true }, niche: { name: 'Niche', price: 40 }, citrouille: { name: 'Citrouille sculptée', price: 60, light: true },
  lanterne_sol: { name: 'Lanterne de jardin', price: 40, light: true }, piege: { name: 'Piège à lapins', price: 20, trap: true }, etabli: { name: 'Établi', price: 50, bench: true },
  four: { name: 'Four', price: 80, furnace: true }, meule: { name: 'Meule de foin', price: 40 }, tonnelle: null,
};
delete PLACEABLES.tonnelle;
for (const id in PLACEABLES) {
  const p = PLACEABLES[id];
  if (id === 'citrouille') { defItem('citrouille_sculptee', p.name, 'objet', p.price, ['objet', '#e88a20'], { place: 'citrouille' }); continue; }
  defItem(id, p.name, 'objet', p.price, ['objet', id], { place: id });
}
// animaux (achetés au ranch : livrés à la ferme le lendemain)
defItem('poule', 'Poule', 'animal', 150, ['animal', '#f2ede2'], { animal: 'hen' });
defItem('vache', 'Vache', 'animal', 900, ['animal', '#e8e0d8'], { animal: 'cow' });
defItem('mouton', 'Mouton', 'animal', 600, ['animal', '#ece6d8'], { animal: 'sheep' });
defItem('cochon', 'Cochon', 'animal', 500, ['animal', '#e8a6a8'], { animal: 'pig' });
defItem('cheval', 'Cheval', 'animal', 2500, ['animal', '#6b4226'], { animal: 'horse' });
// divers
defItem('colis', 'Colis', 'quete', 0, ['colis', '#b89a6a'], { unique: true });
defItem('lettre', 'Lettre', 'quete', 0, ['lettre', '#e8e0c8'], { unique: true });
defItem('cle_crypte', "Clé d'os", 'quete', 0, ['cle', '#e8e0c8'], { desc: 'Froide. Elle ne vient pas d’ici.' });
defItem('masque', 'Masque de toile', 'quete', 0, ['masque', '#e8e0d0'], { desc: 'Taché. Il sent la terre et le fer.' });
defItem('registre', 'Registre des versions', 'quete', 0, ['livre', '#3a2a24']);
defItem('bougie', 'Bougie', 'materiau', 8, ['bougie', '#f0e8d0']);

const ITEM_CAT_NAMES = {
  outil: 'Outils', graine: 'Graines', culture: 'Récoltes', produit: 'Produits de la ferme', cueillette: 'Cueillette', chasse: 'Chasse',
  poisson: 'Poissons', materiau: 'Matériaux', nourriture: 'Nourriture', objet: 'Objets à poser', animal: 'Animaux', quete: 'Objets particuliers',
};

// ---------------------------------------------------------------- fabrication
// st : poste requis (null = n'importe où, 'etabli', 'four', 'feu' = feu de camp, cheminée ou four)
const RECIPES = [
  { out: 'hache_pierre', n: 1, need: { bois: 3, pierre: 3, fibre: 2 }, st: null },
  { out: 'pioche_pierre', n: 1, need: { bois: 3, pierre: 3, fibre: 2 }, st: null },
  { out: 'houe', n: 1, need: { bois: 2, pierre: 2 }, st: null },
  { out: 'marteau', n: 1, need: { bois: 1, pierre: 2 }, st: null },
  { out: 'canne', n: 1, need: { bois: 3, fibre: 4 }, st: null },
  { out: 'arc', n: 1, need: { bois: 3, fibre: 6 }, st: null },
  { out: 'fleche', n: 5, need: { bois: 1, pierre: 1, plume: 1 }, st: null },
  { out: 'piege', n: 1, need: { bois: 3, fibre: 3 }, st: null },
  { out: 'feu_camp', n: 1, need: { bois: 5, pierre: 5 }, st: null },
  { out: 'botte_foin', n: 1, need: { foin: 6 }, st: null },
  { out: 'cloture', n: 2, need: { bois: 3 }, st: null },
  { out: 'epouvantail', n: 1, need: { bois: 3, fibre: 6, foin: 3 }, st: null },
  { out: 'allee', n: 4, need: { pierre: 3 }, st: null },
  { out: 'dalle', n: 4, need: { pierre: 4 }, st: null },
  { out: 'etabli', n: 1, need: { bois: 12, pierre: 4 }, st: null },
  { out: 'bougie', n: 2, need: { miel: 1, fibre: 1 }, st: null },
  { out: 'infusion', n: 1, need: { herbes: 2 }, st: 'feu' },
  // établi
  { out: 'hache_cuivre', n: 1, need: { bois: 2, lingot_cuivre: 3 }, st: 'etabli' },
  { out: 'pioche_cuivre', n: 1, need: { bois: 2, lingot_cuivre: 3 }, st: 'etabli' },
  { out: 'hache_fer', n: 1, need: { bois: 2, lingot_fer: 3 }, st: 'etabli' },
  { out: 'pioche_fer', n: 1, need: { bois: 2, lingot_fer: 3 }, st: 'etabli' },
  { out: 'hache_acier', n: 1, need: { bois: 2, lingot_acier: 3, cuir: 1 }, st: 'etabli' },
  { out: 'pioche_acier', n: 1, need: { bois: 2, lingot_acier: 3, cuir: 1 }, st: 'etabli' },
  { out: 'arrosoir', n: 1, need: { lingot_cuivre: 2 }, st: 'etabli' },
  { out: 'faux', n: 1, need: { bois: 2, lingot_fer: 2 }, st: 'etabli' },
  { out: 'cisailles', n: 1, need: { lingot_fer: 2 }, st: 'etabli' },
  { out: 'seau', n: 1, need: { bois: 3, lingot_fer: 1 }, st: 'etabli' },
  { out: 'lanterne', n: 1, need: { lingot_fer: 1, charbon: 1, bougie: 1 }, st: 'etabli' },
  { out: 'boussole', n: 1, need: { lingot_fer: 1, lingot_cuivre: 1 }, st: 'etabli' },
  { out: 'montre', n: 1, need: { lingot_or: 1, lingot_fer: 1 }, st: 'etabli' },
  { out: 'portillon', n: 1, need: { bois: 6, lingot_fer: 1 }, st: 'etabli' },
  { out: 'haie', n: 2, need: { fibre: 4, bois: 1 }, st: 'etabli' },
  { out: 'cloture_pierre', n: 2, need: { pierre: 6 }, st: 'etabli' },
  { out: 'plancher', n: 4, need: { bois: 3 }, st: 'etabli' },
  { out: 'mangeoire', n: 1, need: { bois: 6 }, st: 'etabli' },
  { out: 'abreuvoir', n: 1, need: { pierre: 10 }, st: 'etabli' },
  { out: 'nichoir', n: 1, need: { bois: 4 }, st: 'etabli' },
  { out: 'ruche', n: 1, need: { bois: 10, fleur: 4 }, st: 'etabli' },
  { out: 'coffre', n: 1, need: { bois: 10, lingot_cuivre: 1 }, st: 'etabli' },
  { out: 'caisse_expedition', n: 1, need: { bois: 14 }, st: 'etabli' },
  { out: 'banc', n: 1, need: { bois: 6 }, st: 'etabli' },
  { out: 'table', n: 1, need: { bois: 8 }, st: 'etabli' },
  { out: 'chaise', n: 1, need: { bois: 4 }, st: 'etabli' },
  { out: 'tonneau', n: 1, need: { bois: 8, lingot_fer: 1 }, st: 'etabli' },
  { out: 'brouette', n: 1, need: { bois: 6, lingot_fer: 1 }, st: 'etabli' },
  { out: 'pot_fleurs', n: 1, need: { pierre: 3, fleur: 2 }, st: 'etabli' },
  { out: 'parterre', n: 1, need: { bois: 3, fleur: 5 }, st: 'etabli' },
  { out: 'arche_fleurie', n: 1, need: { bois: 8, fleur: 8 }, st: 'etabli' },
  { out: 'panneau', n: 1, need: { bois: 3 }, st: 'etabli' },
  { out: 'girouette', n: 1, need: { lingot_cuivre: 2, bois: 2 }, st: 'etabli' },
  { out: 'lampadaire', n: 1, need: { lingot_fer: 2, pierre: 4, bougie: 1 }, st: 'etabli' },
  { out: 'lanterne_sol', n: 1, need: { lingot_cuivre: 1, bougie: 1 }, st: 'etabli' },
  { out: 'citrouille_sculptee', n: 1, need: { citrouille: 1, bougie: 1 }, st: 'etabli' },
  { out: 'niche', n: 1, need: { bois: 10 }, st: 'etabli' },
  { out: 'statue', n: 1, need: { pierre: 30 }, st: 'etabli' },
  { out: 'puits_deco', n: 1, need: { pierre: 24, bois: 8 }, st: 'etabli' },
  { out: 'meule', n: 1, need: { foin: 20 }, st: 'etabli' },
  { out: 'four', n: 1, need: { pierre: 20, lingot_cuivre: 1 }, st: 'etabli' },
  // four
  { out: 'charbon', n: 1, need: { bois: 4 }, st: 'four' },
  { out: 'lingot_cuivre', n: 1, need: { minerai_cuivre: 3, charbon: 1 }, st: 'four' },
  { out: 'lingot_fer', n: 1, need: { minerai_fer: 3, charbon: 1 }, st: 'four' },
  { out: 'lingot_acier', n: 1, need: { lingot_fer: 2, charbon: 3 }, st: 'four' },
  { out: 'lingot_or', n: 1, need: { minerai_or: 3, charbon: 1 }, st: 'four' },
  { out: 'pain', n: 2, need: { ble: 3 }, st: 'four' },
  { out: 'tarte', n: 1, need: { pomme: 3, ble: 2, oeuf: 1 }, st: 'four' },
  // feu (cuisine : feu de camp, cheminée ou four)
  { out: 'viande_grillee', n: 1, need: { viande: 1 }, st: 'feu' },
  { out: 'poisson_grille', n: 1, need: { poisson: 1 }, st: 'feu' },
  { out: 'soupe', n: 1, need: { legume: 3 }, st: 'feu' },
  { out: 'ragout', n: 1, need: { viande: 1, patate: 1, carotte: 1 }, st: 'feu' },
  { out: 'confiture', n: 1, need: { fruit: 3, miel: 1 }, st: 'feu' },
  { out: 'fromage', n: 1, need: { lait: 3 }, st: 'feu' },
];
// ingrédients génériques
const ITEM_GROUPS = {
  poisson: Object.keys(FISH),
  legume: ['carotte', 'patate', 'chou', 'tomate', 'citrouille', 'mais', 'champignon'],
  fruit: ['fraise', 'baies', 'pomme'],
};
const GROUP_NAMES = { poisson: 'poisson (au choix)', legume: 'légumes (au choix)', fruit: 'fruits (au choix)' };
const STATION_NAMES = { etabli: 'un établi', four: 'un four', feu: 'un feu (feu de camp, cheminée ou four)' };
