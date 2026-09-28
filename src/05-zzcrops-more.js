// ============================================================================
//  CULTURES EN PLUS : une cinquantaine de plantes (légumes, céréales, fruits,
//  aromates, fleurs, plantes étranges), des variétés pour chacune (et pour les
//  anciennes), des spécimens géants ; recettes, graines sauvages, boutiques.
//  Aussi : chantiers de bâtiments de ferme, friandises et selle pour les
//  chevaux, terre (pelle).
// ============================================================================

// n : nom · h : heures de pousse (terre humide) · re : repousse · y : récolte [min, max] · gel : sensible au gel
// col : couleur (variété par défaut) · t : gabarit 3D · p : paramètres du gabarit · ic : icône [forme, couleur 2]
// pr : prix de vente · sp : prix des graines · g : groupe · v : variétés [nom, couleur, poids] · sn : nom des graines
const CROPS_MORE = {
  // ---- racines et tubercules
  navet: { n: 'Navet', h: 2.5, y: [1, 2], col: '#ece6f0', t: 'racine', p: { shape: 'rond', lf: '#5a9a3a', top: '#9a5ab0' }, ic: ['racine_rond', '#9a5ab0'], pr: 9, sp: 3, g: 'legume',
    v: [['Violet de Milan', '#ece6f0', 3], ['Boule d’or', '#e8c860', 1.5], ['Blanc de Croissy', '#f4f2ea', 1]] },
  panais: { n: 'Panais', h: 4.5, y: [1, 2], col: '#e8dcb0', t: 'racine', p: { shape: 'long', lf: '#6aa04a', h: 0.45 }, ic: ['racine_long', '#6aa04a'], pr: 18, sp: 6, g: 'legume',
    v: [['Demi-long de Guernesey', '#e8dcb0', 3], ['Tender and True', '#f0e8c8', 1]] },
  celeri: { n: 'Céleri-rave', h: 5.5, y: [1, 1], col: '#d8d0b0', t: 'racine', p: { shape: 'gros', lf: '#4a8a3a', h: 0.5 }, ic: ['racine_gros', '#4a8a3a'], pr: 28, sp: 10, g: 'legume' },
  topinambour: { n: 'Topinambour', h: 6, y: [2, 4], col: '#c8a070', t: 'haute', p: { kind: 'topi' }, ic: ['topi', '#c8a070'], pr: 14, sp: 8, g: 'legume', sn: 'Tubercules de topinambour',
    v: [['Commun', '#c8a070', 3], ['Rouge', '#b86a5a', 1]] },
  // ---- bulbes
  oignon: { n: 'Oignon', h: 3.5, y: [1, 2], col: '#c89048', t: 'bulbe', p: { n: 5, h: 0.5 }, ic: ['bulbe', '#8ab060'], pr: 11, sp: 4, g: 'legume',
    v: [['Jaune paille', '#c89048', 4], ['Rouge de Florence', '#9a2a4a', 2], ['Blanc de Paris', '#f0ecd8', 1.2]] },
  ail: { n: 'Ail', h: 4, y: [1, 2], col: '#ece4d4', t: 'bulbe', p: { n: 4, h: 0.45 }, ic: ['ail', '#ece4d4'], pr: 14, sp: 5, g: 'legume', sn: 'Caïeux d’ail',
    v: [['Ail blanc', '#ece4d4', 3], ['Ail rose de Lautrec', '#e8b8c4', 1.5], ['Ail violet', '#b890b8', 1]] },
  echalote: { n: 'Échalote', h: 3, y: [2, 3], col: '#b87858', t: 'bulbe', p: { n: 6, h: 0.35, cluster: true }, ic: ['echalote', '#b87858'], pr: 8, sp: 4, g: 'legume', sn: 'Bulbes d’échalote',
    v: [['Grise', '#9a8a70', 2], ['Longue de Jersey', '#b87858', 3]] },
  poireau: { n: 'Poireau', h: 5, y: [1, 1], col: '#5a8a6a', t: 'poireau', p: {}, ic: ['poireau', '#5a8a6a'], pr: 20, sp: 7, g: 'legume', sn: 'Plants de poireau',
    v: [['Bleu de Solaise', '#4a7a78', 2], ['Monstrueux de Carentan', '#6a9a5a', 2]] },
  // ---- feuilles
  laitue: { n: 'Laitue', h: 2, y: [1, 1], col: '#8ac858', t: 'feuilles', p: { head: true }, ic: ['salade', '#8ac858'], pr: 10, sp: 3, g: 'legume',
    v: [['Batavia', '#8ac858', 4], ['Feuille de chêne rouge', '#a04a3a', 2], ['Romaine', '#5aa040', 2], ['Sucrine', '#b0d878', 1]] },
  epinard: { n: 'Épinards', h: 2.5, re: 1.5, y: [1, 2], col: '#2e6e2e', t: 'feuilles', p: { flat: true }, ic: ['feuille', '#2e6e2e'], pr: 8, sp: 4, g: 'legume' },
  blette: { n: 'Blettes', h: 3, re: 2, y: [1, 2], col: '#d82a3a', t: 'feuilles', p: { stems: true, lf: '#3a7a2a' }, ic: ['blette', '#3a7a2a'], pr: 11, sp: 5, g: 'legume',
    v: [['Côtes rouges', '#d82a3a', 3], ['Côtes jaunes', '#e8c020', 2], ['Côtes blanches', '#f0ecd8', 2], ['Arc-en-ciel', '#e87020', 0.8]] },
  rhubarbe: { n: 'Rhubarbe', h: 6, re: 3, y: [1, 2], col: '#c83a4a', t: 'feuilles', p: { stems: true, big: true, lf: '#4a8a3a' }, ic: ['rhubarbe', '#4a8a3a'], pr: 22, sp: 12, g: 'fruit', sn: 'Éclats de rhubarbe' },
  chou_fleur: { n: 'Chou-fleur', h: 7, y: [1, 1], col: '#f0ead8', t: 'chou', p: {}, ic: ['choufleur', '#5a8a4a'], pr: 42, sp: 15, g: 'legume', giant: true,
    v: [['Blanc', '#f0ead8', 4], ['Violet de Sicile', '#8a4aa0', 1.2], ['Romanesco', '#a8d060', 1]] },
  brocoli: { n: 'Brocoli', h: 6, y: [1, 2], col: '#3e6e32', t: 'chou', p: { grain: true }, ic: ['brocoli', '#3e6e32'], pr: 30, sp: 12, g: 'legume' },
  artichaut: { n: 'Artichaut', h: 9, re: 4, y: [1, 2], col: '#7a9a78', t: 'haute', p: { kind: 'arti' }, ic: ['artichaut', '#7a9a78'], pr: 36, sp: 18, gel: true, g: 'legume', sn: 'Œilletons d’artichaut',
    v: [['Gros vert de Laon', '#7a9a78', 3], ['Violet de Provence', '#8a5a8a', 2]] },
  asperge: { n: 'Asperges', h: 7, re: 3, y: [2, 3], col: '#8ab060', t: 'haute', p: { kind: 'asp' }, ic: ['asperge', '#8ab060'], pr: 26, sp: 16, g: 'legume', sn: 'Griffes d’asperge',
    v: [['Verte', '#8ab060', 3], ['Blanche', '#f0ecd8', 2], ['Violette', '#8a4a8a', 1]] },
  // ---- fruits-légumes
  courgette: { n: 'Courgette', h: 5, re: 2, y: [1, 2], col: '#3a7a2a', t: 'rampant', p: { fruit: [0.12, 0.12, 0.42], n: 2, flower: true }, ic: ['courgette', '#3a7a2a'], pr: 13, sp: 7, gel: true, g: 'legume',
    v: [['Verte de Milan', '#3a7a2a', 4], ['Jaune', '#e8c830', 1.5], ['Ronde de Nice', '#6aa040', 1]] },
  concombre: { n: 'Concombre', h: 5, re: 2, y: [1, 3], col: '#4a8a3a', t: 'tuteur', p: { fruit: [0.07, 0.26, 0.07], n: 4 }, ic: ['concombre', '#4a8a3a'], pr: 10, sp: 6, gel: true, g: 'legume',
    v: [['Marketer', '#4a8a3a', 3], ['Cornichon', '#5a9a3a', 2], ['Blanc', '#e8ecd0', 0.8]] },
  poivron: { n: 'Poivron', h: 7, re: 3, y: [1, 3], col: '#d83020', t: 'tuteur', p: { fruit: [0.12, 0.14, 0.12], n: 3, low: true }, ic: ['poivron', '#d83020'], pr: 16, sp: 9, gel: true, g: 'legume',
    v: [['Rouge', '#d83020', 3], ['Jaune', '#f0c020', 2], ['Orange', '#f07820', 1.5], ['Chocolat', '#6a3a24', 0.6]] },
  piment: { n: 'Piment', h: 7, re: 3, y: [2, 4], col: '#d82010', t: 'tuteur', p: { fruit: [0.04, 0.13, 0.04], n: 7, low: true }, ic: ['piment', '#d82010'], pr: 11, sp: 8, gel: true, g: 'legume',
    v: [['d’Espelette', '#d82010', 3], ['Jaune', '#f0c020', 1], ['Violet', '#5a2060', 0.7]] },
  aubergine: { n: 'Aubergine', h: 7, re: 3, y: [1, 2], col: '#4a2a5a', t: 'tuteur', p: { fruit: [0.1, 0.22, 0.1], n: 3, low: true }, ic: ['aubergine', '#4a2a5a'], pr: 18, sp: 10, gel: true, g: 'legume',
    v: [['Violette de Barbentane', '#4a2a5a', 3], ['Blanche', '#f0ecd8', 1], ['Zébrée', '#9a5ab0', 1]] },
  petit_pois: { n: 'Petits pois', h: 3.5, re: 1.5, y: [2, 3], col: '#6ab040', t: 'tuteur', p: { fruit: [0.05, 0.16, 0.03], n: 6, twig: true }, ic: ['pois', '#6ab040'], pr: 7, sp: 4, gel: true, g: 'legume',
    v: [['Petit provençal', '#6ab040', 3], ['Pois gourmand', '#8ac050', 2], ['Pois violet', '#6a3a8a', 0.7]] },
  pasteque: { n: 'Pastèque', h: 9, y: [1, 1], col: '#3a7a3a', t: 'rampant', p: { fruit: [0.5, 0.42, 0.64], n: 1, stripes: true }, ic: ['pasteque', '#3a7a3a'], pr: 72, sp: 28, gel: true, g: 'fruit', giant: true,
    v: [['Sugar Baby', '#2e5a2e', 3], ['Charleston', '#5a9a4a', 2], ['Pastèque jaune', '#8ab050', 0.7]] },
  courge: { n: 'Courge musquée', h: 8, y: [1, 2], col: '#e0a050', t: 'rampant', p: { fruit: [0.26, 0.26, 0.46], n: 2 }, ic: ['courge', '#e0a050'], pr: 38, sp: 15, g: 'legume', giant: true,
    v: [['Butternut', '#e0a050', 3], ['Potimarron', '#e06020', 2], ['Courge spaghetti', '#f0e060', 1], ['Pâtisson blanc', '#f0f0d8', 0.8]] },
  // ---- céréales et plantes utiles
  seigle: { n: 'Seigle', h: 3, y: [2, 3], col: '#b8a070', t: 'cereale', p: { h: 1.25 }, ic: ['epi', '#b8a070'], pr: 7, sp: 3, g: 'cereale' },
  orge: { n: 'Orge', h: 3, y: [2, 3], col: '#d8c890', t: 'cereale', p: { h: 0.9, barbu: true }, ic: ['epi', '#d8c890'], pr: 7, sp: 3, g: 'cereale' },
  avoine: { n: 'Avoine', h: 3.5, y: [2, 3], col: '#e0d8a0', t: 'cereale', p: { h: 1.0, droop: true }, ic: ['avoine', '#e0d8a0'], pr: 8, sp: 3, g: 'cereale' },
  sarrasin: { n: 'Sarrasin', h: 3, y: [2, 3], col: '#6a4a3a', t: 'cereale', p: { h: 0.7, flowers: '#f4f0f0', stem: '#b04a4a' }, ic: ['sarrasin', '#6a4a3a'], pr: 9, sp: 4, g: 'cereale' },
  colza: { n: 'Colza', h: 4, y: [2, 3], col: '#f0e020', t: 'cereale', p: { h: 1.2, flowers: '#f0e020', stem: '#6a9a3a' }, ic: ['colza', '#f0e020'], pr: 9, sp: 4, g: 'cereale' },
  chanvre: { n: 'Chanvre', h: 5, y: [2, 3], col: '#5a8a3a', t: 'cereale', p: { h: 1.8, hemp: true }, ic: ['chanvre', '#5a8a3a'], pr: 10, sp: 5, g: 'cereale' },
  lentille: { n: 'Lentilles', h: 4, y: [2, 3], col: '#a88050', t: 'aromate', p: { h: 0.35, pods: true, lf: '#7aa050' }, ic: ['lentille', '#a88050'], pr: 9, sp: 4, g: 'legume',
    v: [['Verte du Puy', '#6a7a4a', 3], ['Blonde', '#c8a060', 2], ['Corail', '#d86a40', 1]] },
  houblon: { n: 'Houblon', h: 8, re: 3, y: [2, 3], col: '#b0d070', t: 'treille', p: { cones: true }, ic: ['houblon', '#b0d070'], pr: 20, sp: 14, g: 'cereale', sn: 'Plants de houblon' },
  // ---- fruits
  framboise: { n: 'Framboises', h: 6, re: 2, y: [2, 3], col: '#d02a50', t: 'buisson', p: { cane: true, berry: 0.05, n: 10 }, ic: ['baie', '#d02a50'], pr: 18, sp: 14, g: 'fruit', sn: 'Plants de framboisier',
    v: [['Héritage', '#d02a50', 3], ['Framboise jaune', '#f0c040', 1]] },
  groseille: { n: 'Groseilles', h: 6, re: 2, y: [2, 4], col: '#e02020', t: 'buisson', p: { grappes: true, berry: 0.035, n: 6 }, ic: ['grappe', '#e02020'], pr: 14, sp: 12, g: 'fruit', sn: 'Boutures de groseillier',
    v: [['Rouge', '#e02020', 3], ['Blanche', '#f0e8c8', 1]] },
  cassis: { n: 'Cassis', h: 7, re: 2.5, y: [2, 3], col: '#2a1a3a', t: 'buisson', p: { grappes: true, berry: 0.04, n: 6 }, ic: ['grappe', '#2a1a3a'], pr: 20, sp: 14, g: 'fruit', sn: 'Boutures de cassissier' },
  myrtille: { n: 'Myrtilles', h: 7, re: 2.5, y: [2, 3], col: '#3a4aa0', t: 'buisson', p: { low: true, berry: 0.04, n: 14 }, ic: ['baie', '#3a4aa0'], pr: 22, sp: 16, g: 'fruit', sn: 'Plants de myrtillier' },
  raisin: { n: 'Raisin', h: 10, re: 4, y: [2, 3], col: '#4a2a5a', t: 'treille', p: { grapes: true }, ic: ['raisin', '#4a2a5a'], pr: 28, sp: 22, g: 'fruit', sn: 'Pieds de vigne',
    v: [['Pinot noir', '#4a2a5a', 3], ['Chardonnay', '#c8d070', 2], ['Muscat rosé', '#c87090', 1]] },
  // ---- aromates et plantes médicinales
  basilic: { n: 'Basilic', h: 3, re: 2, y: [1, 2], col: '#3a9a3a', t: 'aromate', p: { h: 0.35, big: true }, ic: ['herbe', '#3a9a3a'], pr: 10, sp: 5, g: 'aromate',
    v: [['Grand vert', '#3a9a3a', 3], ['Pourpre', '#5a2a4a', 1]] },
  persil: { n: 'Persil', h: 2.5, re: 2, y: [1, 2], col: '#4aa040', t: 'aromate', p: { h: 0.3, frise: true }, ic: ['herbe', '#4aa040'], pr: 8, sp: 4, g: 'aromate' },
  menthe: { n: 'Menthe', h: 2.5, re: 1.5, y: [1, 2], col: '#5ac070', t: 'aromate', p: { h: 0.42 }, ic: ['herbe', '#5ac070'], pr: 8, sp: 4, g: 'aromate', sn: 'Plants de menthe' },
  thym: { n: 'Thym', h: 4, re: 2, y: [1, 2], col: '#7a9a6a', t: 'aromate', p: { h: 0.25, flowers: '#e0b0d8', woody: true }, ic: ['herbe', '#7a9a6a'], pr: 12, sp: 6, g: 'aromate' },
  camomille: { n: 'Camomille', h: 3.5, re: 2, y: [1, 2], col: '#f4f0e0', t: 'fleur', p: { daisy: true, n: 9, h: 0.45, bloom: 0.07 }, ic: ['fleur', '#f0c020'], pr: 12, sp: 6, g: 'aromate' },
  souci: { n: 'Souci', h: 3, re: 2, y: [1, 2], col: '#f09020', t: 'fleur', p: { daisy: true, n: 6, h: 0.4, bloom: 0.1 }, ic: ['fleur', '#a85010'], pr: 10, sp: 5, g: 'fleur_c',
    v: [['Orange', '#f09020', 3], ['Citron', '#f0d030', 1.5]] },
  lavande: { n: 'Lavande', h: 6, re: 3, y: [2, 3], col: '#9a70d0', t: 'aromate', p: { h: 0.55, spikes: true, lf: '#8aa08a' }, ic: ['lavande', '#9a70d0'], pr: 18, sp: 10, g: 'fleur_c', sn: 'Plants de lavande',
    v: [['Vraie lavande', '#9a70d0', 3], ['Lavandin blanc', '#f0ecf4', 0.7], ['Lavande rose', '#e0a0c8', 0.7]] },
  // ---- fleurs
  tulipe: { n: 'Tulipes', h: 4, y: [1, 2], col: '#e03040', t: 'fleur', p: { cup: true, n: 5, h: 0.5, bloom: 0.1 }, ic: ['tulipe', '#e03040'], pr: 16, sp: 8, g: 'fleur_c', sn: 'Bulbes de tulipe',
    v: [['Rouge', '#e03040', 3], ['Jaune', '#f0d020', 2], ['Rose', '#f080a8', 2], ['Blanche', '#f4f0ec', 1.5], ['Perroquet', '#e86020', 0.8], ['Reine de la nuit', '#2a1a2e', 0.35]] },
  rose: { n: 'Roses', h: 8, re: 3, y: [1, 2], col: '#c81838', t: 'buisson', p: { rose: true, berry: 0.1, n: 5 }, ic: ['rose', '#c81838'], pr: 32, sp: 20, g: 'fleur_c', sn: 'Boutures de rosier',
    v: [['Rouge', '#c81838', 3], ['Blanche', '#f4f0e8', 2], ['Rose ancienne', '#f090b0', 2], ['Jaune', '#f0d040', 1], ['Noire', '#2a0a14', 0.3]] },
  pavot: { n: 'Pavot', h: 4, y: [1, 2], col: '#e04030', t: 'fleur', p: { poppy: true, n: 4, h: 0.7, bloom: 0.14 }, ic: ['fleur', '#2a2020'], pr: 14, sp: 7, g: 'fleur_c',
    v: [['Coquelicot', '#e04030', 3], ['Pavot blanc', '#f0ece8', 1], ['Pavot mauve', '#b070c0', 1]] },
  dahlia: { n: 'Dahlias', h: 6, y: [1, 2], col: '#d04080', t: 'fleur', p: { pompom: true, n: 3, h: 0.85, bloom: 0.16 }, ic: ['dahlia', '#d04080'], pr: 22, sp: 12, g: 'fleur_c', sn: 'Tubercules de dahlia',
    v: [['Fuchsia', '#d04080', 3], ['Orange', '#f07030', 2], ['Blanc', '#f4f0ec', 1.5], ['Pourpre', '#5a1a3a', 1]] },
  // ---- plantes étranges
  mandragore: { n: 'Mandragore', h: 14, y: [1, 1], col: '#c09060', t: 'racine', p: { shape: 'mandra', lf: '#2a4a2a', h: 0.4 }, ic: null, pr: 80, sp: 60, g: null, night: true, fruit: 'mandragore', sn: 'Graines de mandragore', noFood: true },
  belladone: { n: 'Belladone', h: 6, re: 3, y: [2, 3], col: '#1a1420', t: 'buisson', p: { low: true, berry: 0.05, n: 8, star: true }, ic: ['belladone', '#1a1420'], pr: 40, sp: 24, g: null, poison: true },
};
// Nourriture par groupe : [faim, soin]
const CROP_FOOD = { legume: [8, 2], fruit: [7, 3], aromate: [2, 5], fleur_c: [0, 0], cereale: [0, 0] };
for (const id in CROPS_MORE) {
  const d = CROPS_MORE[id];
  CROPS[id] = { name: d.n, h: d.h, regrow: d.re || 0, yield: d.y, frost: !!d.gel, col: d.col, tpl: d.t, p: d.p, giant: !!d.giant, night: !!d.night, group: d.g, poison: !!d.poison };
  if (d.fruit) CROPS[id].fruit = d.fruit;
  if (d.v) CROPS[id].vars = d.v.map(([n, c, w]) => ({ n, c, w }));
  CROP_PRICE[id] = d.pr; SEED_PRICE[id] = d.sp;
  if (!d.fruit) {
    const F = d.noFood ? [0, 0] : CROP_FOOD[d.g] || [0, 0];
    defItem(id, d.n, 'culture', d.pr, ['c2_' + d.ic[0], d.col, d.ic[1]], F[0] || F[1] ? { food: F[0], heal: F[1] } : (d.poison ? { food: 2, heal: -15, poison: true } : {}));
  }
  defItem('graines_' + id, d.sn || 'Graines : ' + d.n.toLowerCase(), 'graine', Math.ceil(d.sp / 2), ['sac', d.col], { crop: id, buy: d.sp });
  if (d.g) (ITEM_GROUPS[d.g] || (ITEM_GROUPS[d.g] = [])).push(id);
}
ITEMS.graines_mandragore.desc = 'Elles remuent un peu dans le sachet. Ne poussent que la nuit.';
ITEMS.graines_belladone.desc = 'Belle-dame. Les baies sont un poison ; la guérisseuse sait quoi en faire.';
ITEMS.belladone.desc = 'Des baies noires et luisantes. Surtout, ne pas les manger.';
ITEM_GROUPS.fleur_c.push('fleur');
GROUP_NAMES.fleur_c = 'fleurs (au choix)'; GROUP_NAMES.aromate = 'aromates (au choix)'; GROUP_NAMES.cereale = 'céréales (au choix)';

// ---- variétés des cultures d'origine (couleur remplacée sur le modèle 3D)
// f : couleur d'origine remplacée · x : texture recolorée (m : multiplier, r : remplacer par une couleur unie)
const OLD_VARS = {
  radis: { f: '#d83050', v: [['Rond écarlate', '#d83050', 4], ['Flamboyant', '#e86a8a', 2], ['Blanc glaçon', '#f2f0ea', 1.2], ['Violet de Gournay', '#7a3a8a', 0.8]] },
  carotte: { f: '#e87a20', v: [['Nantaise', '#e87a20', 4], ['Violette', '#6a2a6a', 1.2], ['Blanche de Küttingen', '#f0ecd0', 1], ['Jaune du Doubs', '#f0c030', 1]] },
  patate: { f: '#b89060', v: [['Charlotte', '#d8b878', 4], ['Vitelotte', '#4a2a4a', 1], ['Rosa', '#c86060', 1.5]] },
  betterave: { f: '#7a1a40', v: [['Rouge de Détroit', '#7a1a40', 4], ['Chioggia', '#e07090', 1.5], ['Jaune', '#e8b030', 1]] },
  tomate: { f: '#d83020', v: [['Cœur de bœuf', '#d83020', 4], ['Jaune', '#f0c020', 1.5], ['Noire de Crimée', '#5a2a2a', 1], ['Green Zebra', '#8ac040', 0.8], ['Ananas', '#f09030', 0.8]] },
  fraise: { f: '#e02030', v: [['Gariguette', '#e02030', 4], ['Mara des bois', '#b01828', 2], ['Fraise blanche', '#f0e8e0', 0.7]] },
  haricot: { f: '#6ab040', v: [['Haricot vert', '#6ab040', 4], ['Violet', '#6a3a8a', 1.2], ['Beurre', '#e8d040', 1.5]] },
  tournesol: { f: '#f0c020', v: [['Grand soleil', '#f0c020', 4], ['Soleil rouge', '#b83a20', 1.2], ['Citron', '#f0e070', 1]] },
  lin: { f: '#6a8ae0', v: [['Lin bleu', '#6a8ae0', 4], ['Lin blanc', '#f0f0f0', 1]] },
  melon: { f: '#9ac060', v: [['Charentais', '#9ac060', 4], ['Brodé', '#c8b070', 1.5], ['Vert d’hiver', '#4a7a3a', 1]] },
  chou: { x: 'cabbage', m: true, v: [['Chou vert', null, 4], ['Chou rouge', '#b86ab8', 2], ['Chou frisé', '#a0f090', 1.5]] },
  citrouille: { x: 'pumpkin', v: [['Rouge vif d’Étampes', null, 4], ['Citrouille blanche', '#ece8dc', 1], ['Bleue de Hongrie', '#8aa0a0', 1], ['Galeuse d’Eysines', '#e8b8a0', 0.7]] },
  mais: { x: 'corn', v: [['Maïs doux', null, 4], ['Maïs blanc', '#f0ecd8', 1.2], ['Maïs de couleurs', '#b85aa0', 0.6]] },
  ble: { x: 'wheat', m: true, v: [['Blé blond', null, 5], ['Blé rouge', '#ffb898', 1.5], ['Épeautre', '#dcccb4', 1]] },
};
for (const id in OLD_VARS) {
  const o = OLD_VARS[id], C = CROPS[id];
  if (!C) continue;
  C.vars = o.v.map(([n, c, w]) => ({ n, c, w }));
  C.recol = { f: o.f || null, x: o.x || null, m: !!o.m };
}
for (const id of ['citrouille', 'melon', 'chou']) CROPS[id].giant = true;
// Choix d'une variété au semis (pondéré)
function pickCropVar(id) {
  const V = CROPS[id] && CROPS[id].vars;
  if (!V || !V.length) return 0;
  let r = Math.random() * V.reduce((a, v) => a + v.w, 0);
  for (let i = 0; i < V.length; i++) { r -= V[i].w; if (r <= 0) return i; }
  return 0;
}
// variété rare : la moins fréquente de la liste
function cropVarRare(id, vr) { const V = CROPS[id] && CROPS[id].vars; if (!V || V.length < 3) return false; const min = Math.min(...V.map((v) => v.w)); return V[vr] && V[vr].w === min && min < 1.2; }

// ---------------------------------------------------------------- produits, cuisine, objets
defItem('biere', 'Bière de la ferme', 'nourriture', 70, ['bouteille', '#d8a030'], { food: 6, heal: 4 });
defItem('ratatouille', 'Ratatouille', 'nourriture', 140, ['bol', '#c0502a'], { food: 45, heal: 25 });
defItem('soupe_oignon', 'Soupe à l’oignon', 'nourriture', 60, ['bol', '#c8a060'], { food: 32, heal: 14 });
defItem('gratin', 'Gratin de pommes de terre', 'nourriture', 85, ['tarte', '#e8c878'], { food: 40, heal: 16 });
defItem('tarte_rhubarbe', 'Tarte à la rhubarbe', 'nourriture', 115, ['tarte', '#c84a5a'], { food: 36, heal: 18 });
defItem('galette', 'Galette de sarrasin', 'nourriture', 50, ['pain', '#8a6a4a'], { food: 26, heal: 10 });
defItem('pistou', 'Pistou', 'nourriture', 70, ['pot', '#3a8a3a'], { food: 10, heal: 8 });
defItem('porridge', 'Bouillie d’avoine', 'nourriture', 45, ['bol', '#e8dcc0'], { food: 26, heal: 8 });
defItem('bouquet', 'Bouquet de fleurs', 'produit', 45, ['c2_bouquet', '#e05070', '#5a9a3a'], { desc: 'Des fleurs du jardin, nouées d’un brin de lin. Ça s’offre.' });
defItem('friandise', 'Friandise pour cheval', 'produit', 20, ['sac', '#c8a060'], { desc: 'Avoine, pomme écrasée. Aucun cheval n’y résiste tout à fait.' });
defItem('selle', 'Selle de cuir', 'outil', 180, ['c2_selle', '#6a3a24', '#c8a060'], { passive: true, desc: 'Dans la sacoche : vos chevaux sont sellés, et vont un peu plus vite.' });
defItem('terre', 'Terre', 'materiau', 1, ['tas', '#6a4a30'], { desc: 'Clic droit avec la pelle : on rehausse le sol là où l’on vise.' });
// chantiers : on les pose sur la ferme, le bâtiment est construit dans la journée
ITEM_CAT_NAMES.construction = 'Constructions';
defItem('plan_poulailler', 'Chantier : poulailler', 'construction', 380, ['c2_plan', '#b8683a', '#e8dcc0'], { build: 'poulailler', desc: 'À poser sur un terrain dégagé de la ferme. Pour les poules, canes, oies et lapins.' });
defItem('plan_grange', 'Chantier : grange', 'construction', 1200, ['c2_plan', '#8a3a2a', '#e8dcc0'], { build: 'grange', desc: 'À poser sur un terrain dégagé de la ferme. Pour les vaches, moutons, cochons, chèvres, ânes et chevaux.' });
defItem('plan_atelier', 'Chantier : atelier', 'construction', 480, ['c2_plan', '#6a6a70', '#e8dcc0'], { build: 'atelier', desc: 'Un appentis avec un établi et un four.' });
defItem('plan_puits', 'Chantier : puits', 'construction', 300, ['c2_plan', '#8a8a88', '#e8dcc0'], { build: 'puits', desc: 'Un puits à la ferme : l’eau à portée d’arrosoir.' });

// ---------------------------------------------------------------- recettes
{
  const four = RECIPES.find((r) => r.out === 'four');
  if (four) four.need = { pierre: 20, bois: 6 }; // plus d'œuf ni de poule : le four se bâtit sans lingot
}
RECIPES.push(
  { out: 'bouquet', n: 1, need: { fleur_c: 3 }, st: null },
  { out: 'friandise', n: 2, need: { avoine: 2, pomme: 1 }, st: null },
  { out: 'pistou', n: 1, need: { basilic: 2, ail: 1 }, st: null },
  { out: 'salade', n: 1, need: { laitue: 1, tomate: 1 }, st: null },
  { out: 'corde', n: 2, need: { chanvre: 2 }, st: null },
  { out: 'plan_poulailler', n: 1, need: { bois: 30, pierre: 10 }, st: 'etabli' },
  { out: 'plan_grange', n: 1, need: { bois: 70, pierre: 30, lingot_fer: 2 }, st: 'etabli' },
  { out: 'plan_atelier', n: 1, need: { bois: 24, pierre: 24 }, st: null },
  { out: 'plan_puits', n: 1, need: { pierre: 30, bois: 6, corde: 1 }, st: 'etabli' },
  { out: 'selle', n: 1, need: { cuir: 4, corde: 1 }, st: 'etabli' },
  { out: 'toile', n: 1, need: { chanvre: 3 }, st: 'etabli' },
  { out: 'galette', n: 2, need: { sarrasin: 2, oeuf: 1 }, st: 'feu' },
  { out: 'soupe_oignon', n: 1, need: { oignon: 2, pain: 1 }, st: 'feu' },
  { out: 'ratatouille', n: 1, need: { courgette: 1, aubergine: 1, tomate: 1, poivron: 1 }, st: 'feu' },
  { out: 'porridge', n: 1, need: { avoine: 2, lait: 1 }, st: 'feu' },
  { out: 'infusion', n: 1, need: { aromate: 2 }, st: 'feu' },
  { out: 'gratin', n: 1, need: { patate: 2, lait: 1 }, st: 'four' },
  { out: 'tarte_rhubarbe', n: 1, need: { rhubarbe: 2, farine: 1, oeuf: 1 }, st: 'four' },
);
MACHINES.tonneau.push({ in: { raisin: 3 }, out: ['vin', 1], h: 8 }, { in: { houblon: 1, orge: 2 }, out: ['biere', 1], h: 6 }, { in: { framboise: 4 }, out: ['vin', 1], h: 8 });
MACHINES.presse.push({ in: { colza: 3 }, out: ['huile', 1], h: 2 });
MACHINES.moulin_a_bras.push({ in: { seigle: 2 }, out: ['farine', 1], h: 0.5 }, { in: { orge: 2 }, out: ['farine', 1], h: 0.5 }, { in: { sarrasin: 2 }, out: ['farine', 1], h: 0.5 });
MACHINE_HINT.tonneau = 'Le tonneau attend des fruits (pommes, fraises, raisin, baies, melon) — ou du houblon et de l’orge.';
MACHINE_HINT.moulin_a_bras = 'La meule attend du blé, du seigle, de l’orge, du sarrasin ou du maïs.';

// ---------------------------------------------------------------- graines sauvages, sacs de graines
HARVEST.poppies.drop.push(['graines_pavot', 0, 1, 0.08]);
HARVEST.daisies.drop.push(['graines_camomille', 0, 1, 0.06]);
HARVEST.lavender.drop.push(['graines_lavande', 0, 1, 0.08]);
HARVEST.cornflower.drop.push(['sac_graines', 0, 1, 0.03]);
HARVEST.sunflower.drop.push(['graines_tournesol', 0, 1, 0.2]);
HARVEST.herbs.drop.push(['graines_thym', 0, 1, 0.05], ['graines_menthe', 0, 1, 0.05], ['graines_persil', 0, 1, 0.04]);
HARVEST.berry.drop.push(['graines_framboise', 0, 1, 0.04], ['graines_groseille', 0, 1, 0.03], ['graines_myrtille', 0, 1, 0.03]);
HARVEST.heather.drop.push(['graines_myrtille', 0, 1, 0.03]);
HARVEST.wheat.drop.push(['graines_ble', 0, 1, 0.15]);
HARVEST.tallgrass.drop.push(['graines_avoine', 0, 1, 0.015], ['graines_seigle', 0, 1, 0.015], ['graines_orge', 0, 1, 0.015]);
LOOT.graines.items.push(
  ['graines_navet', 2, 4, 3], ['graines_oignon', 2, 4, 3], ['graines_laitue', 2, 5, 3], ['graines_epinard', 2, 4, 2], ['graines_petit_pois', 2, 4, 2], ['graines_courgette', 1, 3, 1.5],
  ['graines_poireau', 1, 3, 1.2], ['graines_ail', 1, 3, 1.2], ['graines_panais', 1, 3, 1], ['graines_seigle', 2, 5, 1.5], ['graines_orge', 2, 5, 1.5], ['graines_avoine', 2, 5, 1.5],
  ['graines_tulipe', 1, 3, 1], ['graines_pavot', 1, 3, 1], ['graines_basilic', 1, 3, 1], ['graines_persil', 1, 3, 1], ['graines_camomille', 1, 3, 0.8], ['graines_poivron', 1, 2, 0.8],
  ['graines_aubergine', 1, 2, 0.6], ['graines_courge', 1, 2, 0.6], ['graines_pasteque', 1, 1, 0.4], ['graines_chou_fleur', 1, 2, 0.5], ['graines_dahlia', 1, 2, 0.4], ['graines_rose', 1, 1, 0.3],
  ['graines_raisin', 1, 1, 0.25], ['graines_asperge', 1, 1, 0.25], ['graines_artichaut', 1, 1, 0.25], ['graines_houblon', 1, 1, 0.3], ['graines_mandragore', 1, 1, 0.05],
);
LOOT.pelle && LOOT.pelle.items.push(['graines_mandragore', 1, 1, 0.12], ['graines_topinambour', 1, 2, 0.5]);
LOOT.hameau && LOOT.hameau.items.push(['graines_tulipe', 1, 2, 1], ['graines_rose', 1, 1, 0.3]);
LOOT.chapelle && LOOT.chapelle.items.push(['graines_lavande', 1, 2, 1], ['graines_belladone', 1, 1, 0.3]);

// ---------------------------------------------------------------- boutiques
{
  const S = (id) => NPC_DATA.find((d) => d.id === id);
  const all = Object.keys(CROPS_MORE).filter((id) => !CROPS_MORE[id].fruit);
  const G = S('grainetiere');
  if (G && G.shop) { for (const id of all) if (!G.shop.buys.includes(id)) G.shop.buys.push(id); G.shop.buys.push('bouquet'); }
  const A = S('aubergiste');
  if (A && A.shop) A.shop.buys.push(...all.filter((id) => ['legume', 'fruit', 'aromate'].includes(CROPS_MORE[id].g)), 'biere', 'pistou');
  const B = S('boulangere');
  if (B && B.shop) B.shop.buys.push('seigle', 'orge', 'avoine', 'sarrasin', 'rhubarbe', 'framboise', 'myrtille');
  const H = S('guerisseuse');
  if (H && H.shop) {
    H.shop.buys.push('camomille', 'souci', 'lavande', 'thym', 'menthe', 'belladone', 'pavot', 'basilic');
    H.shop.sells.push(['graines_camomille', 12], ['graines_souci', 10], ['graines_thym', 12], ['graines_menthe', 8], ['graines_belladone', 48]);
  }
  const E = S('eleveuse');
  if (E && E.shop) { E.shop.sells.push(['avoine', 12], ['friandise', 25], ['selle', 200], ['plan_poulailler', 400], ['plan_grange', 1250]); E.shop.buys.push('avoine', 'friandise'); }
  const F = S('forgeron');
  if (F && F.shop) F.shop.sells.push(['plan_atelier', 500], ['plan_puits', 320]);
  const M = S('maire');
  if (M && M.shop) M.shop.buys.push('rose', 'dahlia', 'tulipe');
  // un bouquet fait plaisir à presque tout le monde
  for (const d of NPC_DATA) { if ((d.dislikes || []).includes('bouquet')) continue; (d.likes || (d.likes = [])).push('bouquet'); }
}
// Graines toujours en rayon à la graineterie (le reste change chaque jour)
const SEED_BASE = ['radis', 'ble', 'carotte', 'patate', 'laitue', 'navet', 'oignon', 'epinard', 'petit_pois', 'haricot', 'lin'];
const SEED_ROTATE = Object.keys(CROPS).filter((id) => SEED_PRICE[id] && !SEED_BASE.includes(id) && !['mandragore', 'belladone', 'pommier'].includes(id));
