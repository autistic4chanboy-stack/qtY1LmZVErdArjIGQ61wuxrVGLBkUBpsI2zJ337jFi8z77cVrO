// ============================================================================
//  OBJETS EN PLUS : le fusil de chasse à lunette et ses cartouches, le piège à
//  loup, la charrette qu'on attelle au cheval, les soins (attelle, bandage), la
//  table d'alchimiste, les cartes de régions (toujours approximatives), et les
//  recettes correspondantes. La fabrication se découvre : seules les recettes
//  de BASE sont connues au départ (voir 11-zzz03-fabrication.js).
// ============================================================================
defItem('fusil', 'Fusil de chasse à lunette', 'outil', 950, ['fusil', '#5a4a3a'], { tool: 'fusil', desc: 'Clic : tirer. Bouton droit maintenu : viser à la lunette. Une cartouche par coup.' });
defItem('cartouche', 'Cartouche', 'outil', 6, ['cartouche', '#c8a040'], { desc: 'Pour le fusil de chasse.' });
defItem('canon_fusil', 'Canon de fusil', 'materiau', 143, ['canon', '#6a6a72'], { desc: 'Un tube d’acier foré, long comme le bras.' });
defItem('lunette', 'Lunette de visée', 'materiau', 107, ['lunette', '#3a3a40'], { desc: 'Deux lentilles dans un tube de cuivre. Tout paraît plus près, et plus seul.' });
defItem('lentille', 'Lentille de verre', 'materiau', 39, ['rond', '#d0e8f0'], { desc: 'Taillée par un nain, dit-on. Parfaitement claire.' });
defItem('appeau', 'Appeau', 'outil', 35, ['cle', '#8a6a44'], { tool: 'appeau', desc: 'Clic : imiter le cri du gibier. Les bêtes curieuses approchent.' });
defItem('roue', 'Roue de charrette', 'materiau', 29, ['roue', '#7a5a3a'], { desc: 'Rayons de frêne, bandage de fer.' });
defItem('harnais', 'Harnais', 'outil', 90, ['cuir', '#5a3a24'], { passive: true, desc: 'Pour atteler un cheval (ou un âne) à une charrette.' });
defItem('attelle', 'Attelle', 'outil', 25, ['attelle', '#c8b088'], { desc: 'Clic : immobiliser une jambe cassée. Elle guérira bien plus vite.' });
defItem('bandage', 'Bandage', 'outil', 12, ['bandage', '#f0ece0'], { desc: 'Clic : panser une plaie. Arrête le saignement.' });
defItem('sifflet_argent', 'Sifflet d’argent', 'outil', 0, ['cle', '#d0d8e0'], { desc: 'Un sifflet des nains. Soufflé devant la fente de la falaise, il répond au rythme des coups.' });
// objets à poser en plus
Object.assign(PLACEABLES, {
  piege_loup: { name: 'Piège à loup', price: 61, trap: true },
  charrette: { name: 'Charrette', price: 130, store: true },
  table_alchimie: { name: 'Table d’alchimiste', price: 40, alembic: true },
  echelle_bois: { name: 'Échelle de bois', price: 1 },
});
for (const id of ['piege_loup', 'charrette', 'table_alchimie', 'echelle_bois']) defItem(id, PLACEABLES[id].name, 'objet', PLACEABLES[id].price, ['objet', id], { place: id });
ITEMS.piege_loup.desc = 'Clic : le poser au sol. Il se referme sur la première patte qui passe. Attention où vous marchez.';
ITEMS.charrette.desc = 'À poser, puis à atteler au cheval (un harnais, E sur la charrette à cheval). Elle transporte ce qu’on y met.';
ITEMS.table_alchimie.desc = 'On y mêle deux à quatre ingrédients, à l’aveugle. On note ce qu’il en sort.';
ITEMS.echelle_bois.desc = 'À poser contre une paroi : on y grimpe (E).';

// cartes de régions : jamais la vallée entière, jamais un point exact
const CARTES_REGIONS = {
  centre: { titre: 'Carte du pays de Valbrume', x: 1540, z: 1880, r: 470, prix: 60, desc: 'La ville, la ferme, le hameau, le grand lac. Dessinée à main levée par un clerc de la mairie.' },
  ouest: { titre: 'Carte du lac et du marais', x: 960, z: 1980, r: 430, prix: 70, desc: 'Le grand lac, le marais, la forêt de l’ouest. Les rives sont fantaisistes.' },
  nord: { titre: 'Carte de la Combe et des Monts', x: 1640, z: 820, r: 520, prix: 120, desc: 'Le col, la Combe Perdue, le glacier, le refuge. Levée par des bergers, avec leurs mots à eux.' },
  est: { titre: 'Carte du plateau', x: 2140, z: 1380, r: 460, prix: 90, desc: 'La lande, l’abbaye, le château, la Table des Géants. Tracée par un moine qui voyait mal.' },
  sud: { titre: 'Carte des bois du sud', x: 1500, z: 2480, r: 460, prix: 80, desc: 'La forêt du sud, le hameau abandonné. Beaucoup de blancs.' },
  monts: { titre: 'Carte des crêtes', x: 2300, z: 800, r: 520, prix: 150, desc: 'Les crêtes de l’est et le lac gelé. On y a dessiné des géants dans les marges.' },
  ancien: { titre: 'Feuillets de l’atlas ancien', x: 1700, z: 1300, r: 800, prix: 0, desc: 'Des feuillets anciens : la vallée comme on la voyait il y a trois siècles. Rien n’est plus tout à fait là.' },
};
for (const k in CARTES_REGIONS) {
  const C = CARTES_REGIONS[k];
  defItem('carte_' + k, C.titre, 'outil', C.prix, ['carte', k === 'ancien' ? '#b89868' : '#d8c8a0'], { use: 'region', region: k, desc: 'Clic : déplier la carte. ' + C.desc });
}
// la « carte de la vallée » d'autrefois n'est plus qu'une carte du pays de Valbrume, approximative
if (ITEMS.carte_vallee) { ITEMS.carte_vallee.use = 'region'; ITEMS.carte_vallee.region = 'centre'; ITEMS.carte_vallee.name = 'Carte du pays (vieille)'; ITEMS.carte_vallee.desc = 'Clic : déplier la carte. Une vieille carte approximative des environs de la ville.'; }

// ---------------------------------------------------------------- recettes en plus
RECIPES.push(
  { out: 'canon_fusil', n: 1, need: { lingot_acier: 2, charbon: 2 }, st: 'four' },
  { out: 'lunette', n: 1, need: { lingot_cuivre: 1, lentille: 2 }, st: 'etabli' },
  { out: 'fusil', n: 1, need: { canon_fusil: 1, lunette: 1, bois: 3, lingot_fer: 1 }, st: 'etabli' },
  { out: 'cartouche', n: 6, need: { lingot_cuivre: 1, charbon: 2, silex: 1 }, st: 'etabli' },
  { out: 'piege_loup', n: 1, need: { lingot_fer: 2, corde: 1 }, st: 'etabli' },
  { out: 'appeau', n: 1, need: { bois: 1, os: 1 }, st: null },
  { out: 'roue', n: 1, need: { bois: 6, lingot_fer: 1 }, st: 'etabli' },
  { out: 'charrette', n: 1, need: { bois: 16, roue: 2, lingot_fer: 2 }, st: 'etabli' },
  { out: 'harnais', n: 1, need: { cuir: 3, corde: 1 }, st: 'etabli' },
  { out: 'attelle', n: 1, need: { bois: 2, toile: 1 }, st: null },
  { out: 'bandage', n: 2, need: { toile: 1 }, st: null },
  { out: 'bandage', n: 1, need: { fibre: 4, herbes: 1 }, st: null },
  { out: 'table_alchimie', n: 1, need: { bois: 8, lingot_cuivre: 2, fiole: 3 }, st: 'etabli' },
  { out: 'echelle_bois', n: 1, need: { bois: 5, corde: 1 }, st: null },
  { out: 'corde', n: 1, need: { fibre: 5 }, st: null },
  { out: 'toile', n: 1, need: { fibre: 8 }, st: 'etabli' },
  { out: 'fiole', n: 2, need: { sable: 3, charbon: 1 }, st: 'four' },
  { out: 'lentille', n: 1, need: { sable: 5, charbon: 2, gemme: 1 }, st: 'four' },
);
// les recettes de base, connues de tous dès le premier jour (les autres se découvrent)
const CRAFT_BASE = new Set(['hache_pierre', 'pioche_pierre', 'houe', 'marteau', 'canne', 'feu_camp', 'cloture', 'botte_foin', 'infusion', 'viande_grillee',
  'poisson_grille', 'etabli', 'bougie', 'corde', 'bandage', 'charbon', 'lingot_cuivre', 'lingot_fer', 'pain', 'allee']);
// ---------------------------------------------------------------- butins des lieux nouveaux
Object.assign(LOOT, {
  archives: { rolls: [2, 3], items: [['livre_archives', 1, 1, 2], ['livre_temple_montagne', 1, 1, 2], ['feuillet_perdu', 0, 0, 0], ['vieille_piece', 2, 5, 3], ['bijou', 1, 1, 1], ['carte_ancien', 1, 1, 2], ['argent', 40, 120, 3]] },
  temple: { rolls: [2, 4], items: [['vieille_piece', 3, 8, 5], ['bijou', 1, 2, 3], ['gemme', 1, 2, 2], ['cendre_sacree', 1, 2, 3], ['relique', 1, 1, 1], ['lingot_or', 1, 2, 1.5], ['argent', 60, 220, 3], ['poussiere_etoile', 1, 1, 0.5]] },
  temple_or: { rolls: [3, 4], items: [['lingot_or', 2, 4, 4], ['gemme', 2, 3, 3], ['bijou', 1, 3, 3], ['couronne_aelim', 1, 1, 1], ['argent', 200, 500, 3]] },
});
defItem('couronne_aelim', 'Diadème des Aëlim', 'tresor', 750, ['couronne', '#e8e0f0'], { desc: 'Un diadème d’argent pâle, gravé de Hautes Lettres : « ael vor ves ». La lumière avant la nuit.' });
LOOT.fouille.items.push(['sel', 1, 2, 1]);
LOOT.campement.items.push(['bandage', 1, 2, 2], ['cartouche', 2, 6, 0.8]);
LOOT.ruines.items.push(['herbier_fauvel', 0, 0, 0]);
