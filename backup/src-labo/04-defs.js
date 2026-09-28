// ============================================================================
//  DÉFINITIONS : objets, herbes, blocs, outils
// ============================================================================

const F_NIGHTLIT = 1, F_ANIMATED = 2;

// h = plage de hauteur (m) ; col = rayon de collision (m) ; colK = rayon proportionnel à la hauteur
// shade = [rayon d'ombre (m), intensité] ; sink = enfoncement relatif dans le sol
const OBJ_TYPES = [
  { id: 'oak', name: 'Chêne', cat: 'Arbres', spr: ['oak0', 'oak1'], h: [7.5, 10], col: 0.45, shade: [3.4, 0.9], sway: 0.3, spacing: 4.5, sink: 0.03 },
  { id: 'apple', name: 'Pommier', cat: 'Arbres', spr: ['apple0'], h: [5.5, 7], col: 0.35, shade: [2.8, 0.8], sway: 0.25, spacing: 4, sink: 0.03 },
  { id: 'birch', name: 'Bouleau', cat: 'Arbres', spr: ['birch0', 'birch1'], h: [8, 11], col: 0.2, shade: [1.8, 0.6], sway: 0.4, spacing: 2.5, sink: 0.02 },
  { id: 'pine', name: 'Sapin', cat: 'Arbres', spr: ['pine0', 'pine1'], h: [8, 12.5], col: 0.35, shade: [2.6, 0.95], sway: 0.15, spacing: 3.2, sink: 0.02 },
  { id: 'bush', name: 'Buisson', cat: 'Végétation', spr: ['bush0', 'bush1'], h: [1.3, 2.0], col: 0, shade: [1.5, 0.5], sway: 0.08, spacing: 2, sink: 0.08 },
  { id: 'berry', name: 'Buisson à baies', cat: 'Végétation', spr: ['berry0'], h: [1.2, 1.7], col: 0, shade: [1.3, 0.45], sway: 0.08, spacing: 2, sink: 0.08 },
  { id: 'tallgrass', name: 'Hautes herbes', cat: 'Végétation', spr: ['tallgrass0'], h: [1.0, 1.5], col: 0, sway: 0.3, spacing: 1.1, sink: 0.05 },
  { id: 'reeds', name: 'Roseaux', cat: 'Végétation', spr: ['reeds0'], h: [1.8, 2.4], col: 0, sway: 0.35, spacing: 1, sink: 0.05 },
  { id: 'poppies', name: 'Coquelicots', cat: 'Fleurs', spr: ['poppies0'], h: [0.8, 1.1], col: 0, sway: 0.18, spacing: 0.9, sink: 0.04 },
  { id: 'daisies', name: 'Marguerites', cat: 'Fleurs', spr: ['daisies0'], h: [0.7, 1.0], col: 0, sway: 0.18, spacing: 0.9, sink: 0.04 },
  { id: 'lavender', name: 'Lavande', cat: 'Fleurs', spr: ['lavender0'], h: [0.8, 1.1], col: 0, sway: 0.15, spacing: 0.9, sink: 0.04 },
  { id: 'cornflower', name: 'Bleuets', cat: 'Fleurs', spr: ['cornflower0'], h: [0.7, 1.0], col: 0, sway: 0.18, spacing: 0.9, sink: 0.04 },
  { id: 'sunflower', name: 'Tournesol', cat: 'Fleurs', spr: ['sunflower0'], h: [1.9, 2.5], col: 0, sway: 0.12, spacing: 0.8, sink: 0.02 },
  { id: 'mushroom', name: 'Champignons', cat: 'Fleurs', spr: ['mushroom0'], h: [0.45, 0.65], col: 0, sway: 0, spacing: 0.8, sink: 0.05 },
  { id: 'rock', name: 'Rocher', cat: 'Rochers', spr: ['rock0', 'rock1'], h: [1.1, 2.6], col: 0, colK: 0.55, shade: [1.6, 0.6], sway: 0, spacing: 3, sink: 0.1 },
  { id: 'stones', name: 'Cailloux', cat: 'Rochers', spr: ['stones0'], h: [0.35, 0.55], col: 0, sway: 0, spacing: 1.2, sink: 0.1 },
  { id: 'stump', name: 'Souche', cat: 'Rochers', spr: ['stump0'], h: [0.7, 1.0], col: 0.5, sway: 0, spacing: 1.5, sink: 0.08 },
  { id: 'lamp', name: 'Lampadaire', cat: 'Objets', spr: ['lamp'], h: [4.2, 4.2], col: 0.15, sway: 0, spacing: 2, sink: 0.01, flags: F_NIGHTLIT, light: { c: [1.0, 0.78, 0.45], r: 14, y: 3.9, night: true } },
  { id: 'campfire', name: 'Feu de camp', cat: 'Objets', spr: ['campfire'], h: [1.4, 1.4], col: 0.7, sway: 0, spacing: 2, sink: 0.04, flags: F_ANIMATED, light: { c: [1.0, 0.52, 0.18], r: 13, y: 0.8, flicker: true } },
  { id: 'sign', name: 'Panneau', cat: 'Objets', spr: ['sign0'], h: [1.8, 1.8], col: 0.15, sway: 0, spacing: 1.5, sink: 0.02 },
  { id: 'barrel', name: 'Tonneau', cat: 'Objets', spr: ['barrel0'], h: [1.15, 1.25], col: 0.45, sway: 0, spacing: 1.2, sink: 0.01 },
  { id: 'lantern', name: 'Lanterne', cat: 'Objets', spr: ['lantern'], h: [0.7, 0.7], col: 0, sway: 0, spacing: 1, sink: 0, light: { c: [1.0, 0.72, 0.42], r: 10, y: 0.35 } },
  { id: 'woodpile', name: 'Tas de bûches', cat: 'Village', spr: ['woodpile'], h: [0.9, 1.0], col: 0.7, sway: 0, spacing: 2, sink: 0.03 },
  { id: 'hay', name: 'Botte de foin', cat: 'Village', spr: ['hay'], h: [1.0, 1.15], col: 0.6, sway: 0, spacing: 1.6, sink: 0.03 },
  { id: 'cart', name: 'Charrette', cat: 'Village', spr: ['cart'], h: [1.6, 1.6], col: 0.9, sway: 0, spacing: 3, sink: 0.02 },
  { id: 'scarecrow', name: 'Épouvantail', cat: 'Village', spr: ['scarecrow'], h: [2.2, 2.3], col: 0.15, sway: 0.05, spacing: 2, sink: 0.02 },
  { id: 'wheat', name: 'Blé', cat: 'Village', spr: ['wheat0', 'wheat1'], h: [1.0, 1.25], col: 0, sway: 0.3, spacing: 0.6, sink: 0.04 },
  { id: 'produce', name: 'Cageot de légumes', cat: 'Village', spr: ['produce'], h: [0.65, 0.7], col: 0.35, sway: 0, spacing: 1, sink: 0.02 },
  { id: 'tomb', name: 'Pierre tombale', cat: 'Village', spr: ['tomb'], h: [0.9, 1.1], col: 0.3, sway: 0, spacing: 1.5, sink: 0.05 },
  { id: 'minecart', name: 'Wagonnet', cat: 'Mine', spr: ['minecart'], h: [1.1, 1.1], col: 0.7, sway: 0, spacing: 2, sink: 0.02 },
  { id: 'orepile', name: 'Tas de minerai', cat: 'Mine', spr: ['orepile'], h: [0.8, 1.0], col: 0.55, sway: 0, spacing: 1.5, sink: 0.05 },
  { id: 'crystal', name: 'Cristaux', cat: 'Mine', spr: ['crystal'], h: [1.0, 1.5], col: 0.3, sway: 0, spacing: 1.5, sink: 0.03, light: { c: [0.3, 0.75, 1.0], r: 9, y: 0.6 } },
  // Animaux et habitants : points d'apparition des créatures vivantes
  { id: 'sheep', name: 'Mouton', cat: 'Animaux', spr: ['a_sheep'], h: [1.02, 1.1], animal: 'sheep', col: 0, sway: 0, spacing: 1.5, sink: 0 },
  { id: 'cow', name: 'Vache', cat: 'Animaux', spr: ['a_cow'], h: [1.6, 1.7], animal: 'cow', col: 0, sway: 0, spacing: 2.5, sink: 0 },
  { id: 'pig', name: 'Cochon', cat: 'Animaux', spr: ['a_pig'], h: [0.88, 0.95], animal: 'pig', col: 0, sway: 0, spacing: 1.5, sink: 0 },
  { id: 'horse', name: 'Cheval', cat: 'Animaux', spr: ['a_horse'], h: [2.3, 2.4], animal: 'horse', col: 0, sway: 0, spacing: 3, sink: 0 },
  { id: 'hen', name: 'Poule', cat: 'Animaux', spr: ['a_hen0', 'a_hen1'], h: [0.5, 0.55], animal: 'hen', col: 0, sway: 0, spacing: 0.8, sink: 0 },
  { id: 'rabbit', name: 'Lapin', cat: 'Animaux', spr: ['a_rabbit'], h: [0.44, 0.5], animal: 'rabbit', col: 0, sway: 0, spacing: 1, sink: 0 },
  { id: 'deer', name: 'Cerf', cat: 'Animaux', spr: ['a_deer'], h: [2.0, 2.1], animal: 'deer', col: 0, sway: 0, spacing: 3, sink: 0 },
  { id: 'duck', name: 'Canard', cat: 'Animaux', spr: ['a_duck'], h: [0.55, 0.6], animal: 'duck', col: 0, sway: 0, spacing: 1, sink: 0 },
  { id: 'birds', name: "Nuée d'oiseaux", cat: 'Animaux', spr: ['a_bird'], h: [0.45, 0.5], animal: 'bird', col: 0, sway: 0, spacing: 20, sink: 0 },
  { id: 'villager', name: 'Villageois', cat: 'Habitants', spr: ['v0', 'v1', 'v2', 'v3', 'v4', 'v5'], h: [1.72, 1.85], animal: 'villager', col: 0, sway: 0, spacing: 1.5, sink: 0 },
];
const OBJ_INDEX = {};
OBJ_TYPES.forEach((t, i) => { OBJ_INDEX[t.id] = i; });

function objRadius(t, o) {
  if (t.colK) return t.colK * o.h;
  return t.col;
}

// Variantes du champ d'herbe : [sprite, hauteur (m)]
const GRASS_VARIANTS = [
  ['g_tuft0', 0.4], ['g_tuft1', 0.44], ['g_tuft2', 0.5], ['g_tall', 0.74],
  ['g_dry0', 0.44], ['g_dry1', 0.58],
  ['g_fl_white', 0.44], ['g_fl_yellow', 0.44], ['g_fl_red', 0.48], ['g_fl_blue', 0.42], ['g_fl_purple', 0.44], ['g_fl_pink', 0.38],
];

// Formes de blocs : 0 pavé, 1 toit à deux pans (faîtage selon la largeur), 2 rampe (monte vers l'avant), 3 flèche (pyramide)
const SHAPES = ['Pavé', 'Toit 2 pans', 'Rampe', 'Flèche'];

const BLOCK_PRESETS = [
  { name: 'Cube', s: [1, 1, 1], m: M_STONE },
  { name: 'Caisse', s: [1, 1, 1], m: M_CRATE },
  { name: 'Mur', s: [4, 3, 0.5], m: M_STONE },
  { name: 'Mur à fenêtre', s: [3, 3, 0.3], m: M_TIMBERWIN },
  { name: 'Pilier', s: [1, 4, 1], m: M_MOSSY },
  { name: 'Dalle', s: [4, 0.25, 4], m: M_COBBLE },
  { name: 'Marche', s: [1, 0.5, 1], m: M_STONE },
  { name: 'Poutre', s: [4, 0.3, 0.3], m: M_LOGS },
  { name: 'Toit plat', s: [5, 0.3, 5], m: M_ROOF },
  { name: 'Toit 2 pans', s: [6, 2.2, 5], m: M_THATCH, sh: 1 },
  { name: 'Rampe', s: [2, 1, 3], m: M_PLANKS, sh: 2 },
  { name: 'Flèche', s: [4, 5, 4], m: M_SLATE, sh: 3 },
  { name: 'Rails', s: [1.2, 0.06, 6], m: M_RAILS },
];

const TOOLS = [
  { id: 'sculpt', name: 'Sculpter', icon: '⛰', hint: 'Clic gauche : élever · Clic droit : abaisser' },
  { id: 'smooth', name: 'Lisser', icon: '〰', hint: 'Clic : adoucir le relief' },
  { id: 'flatten', name: 'Aplanir', icon: '▬', hint: 'Clic gauche : aplanir · Clic droit : prélever la hauteur' },
  { id: 'paint', name: 'Peindre', icon: '🖌', hint: 'Clic gauche : peindre · Clic droit : pipette' },
  { id: 'place', name: 'Objets', icon: '🌳', hint: 'Clic gauche : placer (maintenir pour semer) · Clic droit : retirer' },
  { id: 'erase', name: 'Gomme', icon: '✖', hint: 'Maintenir : effacer les objets dans le pinceau' },
  { id: 'block', name: 'Blocs', icon: '▦', hint: 'Clic G : poser · Clic D : supprimer · R : pivoter · Clic molette : copier' },
];
