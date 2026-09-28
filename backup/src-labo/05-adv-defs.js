// ============================================================================
//  DÉFINITIONS (AVENTURE) : ressources, gibier, objets, potions, recettes
// ============================================================================

const F_POWERED = 4; // sprite dont l'image dépend du courant du laboratoire

// Nouveaux objets de décor
OBJ_TYPES.push(
  { id: 'deadtree', name: 'Arbre mort', cat: 'Arbres', spr: ['deadtree0', 'deadtree1'], h: [6, 9], col: 0.3, shade: [1.2, 0.3], sway: 0.05, spacing: 3, sink: 0.02 },
  { id: 'giantoak', name: 'Chêne millénaire', cat: 'Arbres', spr: ['oak0'], h: [24, 28], col: 1.6, shade: [9, 1], sway: 0.1, spacing: 20, sink: 0.02 },
  { id: 'fern', name: 'Fougère', cat: 'Végétation', spr: ['fern0'], h: [0.7, 1.0], col: 0, sway: 0.2, spacing: 0.8, sink: 0.05 },
  { id: 'heather', name: 'Bruyère', cat: 'Fleurs', spr: ['heather0'], h: [0.6, 0.8], col: 0, sway: 0.1, spacing: 0.9, sink: 0.05 },
  { id: 'note', name: 'Note', cat: 'Objets', spr: ['note'], h: [1.0, 1.0], col: 0, sway: 0, spacing: 2, sink: 0 },
  { id: 'beacon', name: 'Balise', cat: 'Objets', spr: ['beacon'], h: [0.5, 0.5], col: 0, sway: 0, spacing: 2, sink: 0, flags: F_ANIMATED },
  { id: 'neon', name: 'Néon', cat: 'Laboratoire', spr: ['neon'], h: [0.3, 0.3], col: 0, sway: 0, spacing: 1, sink: 0, flags: F_POWERED, light: { c: [0.9, 1.0, 0.95], r: 11, y: 0, power: true } },
  { id: 'monitor', name: 'Terminal', cat: 'Laboratoire', spr: ['monitor'], h: [0.8, 0.8], col: 0, sway: 0, spacing: 1, sink: 0, flags: F_POWERED },
  { id: 'alembic', name: 'Alambic', cat: 'Laboratoire', spr: ['alembic'], h: [1.1, 1.1], col: 0, sway: 0, spacing: 1, sink: 0, flags: F_ANIMATED, light: { c: [0.4, 1.0, 0.5], r: 5, y: 0.5 } },
  { id: 'vialshelf', name: 'Étagère de fioles', cat: 'Laboratoire', spr: ['vialshelf0', 'vialshelf1'], h: [1.9, 1.9], col: 0, sway: 0, spacing: 1.5, sink: 0 },
  { id: 'panel', name: 'Tableau de commande', cat: 'Laboratoire', spr: ['panel'], h: [0.9, 0.9], col: 0, sway: 0, spacing: 1, sink: 0, flags: F_POWERED },
  { id: 'orb', name: 'Orbe', cat: 'Objets', spr: ['orb'], h: [0.4, 0.4], col: 0, sway: 0, spacing: 1, sink: 0, flags: F_ANIMATED, light: { c: [0.7, 0.9, 1.0], r: 12, y: 0.2 } },
  { id: 'bones', name: 'Ossements', cat: 'Objets', spr: ['bones0'], h: [0.4, 0.45], col: 0, sway: 0, spacing: 1, sink: 0.05 },
  { id: 'missing', name: '???', cat: 'Objets', spr: ['missing'], h: [1, 1], col: 0, sway: 0, spacing: 1, sink: 0, hidden: true },
);
OBJ_TYPES.forEach((t, i) => { OBJ_INDEX[t.id] = i; });
OBJ_TYPES[OBJ_INDEX.villager].hidden = true; // plus aucun humain

// Ressources récoltables : outil, points de vie, butin [objet, min, max]
const HARVEST = {
  oak: { tool: 'axe', hp: 6, drop: [['bois', 4, 6]], stump: true },
  apple: { tool: 'axe', hp: 5, drop: [['bois', 3, 4]], stump: true },
  birch: { tool: 'axe', hp: 5, drop: [['bois', 3, 4]], stump: true },
  pine: { tool: 'axe', hp: 6, drop: [['bois', 4, 6]], stump: true },
  deadtree: { tool: 'axe', hp: 3, drop: [['bois', 2, 3]] },
  giantoak: { tool: 'axe', hp: 45, drop: [['bois', 25, 30]], stump: true },
  stump: { tool: 'axe', hp: 2, drop: [['bois', 1, 1]] },
  woodpile: { tool: 'hands', hp: 0, drop: [['bois', 4, 6]] },
  rock: { tool: 'pick', hp: 5, drop: [['pierre', 2, 4], ['minerai', 0, 1]] },
  stones: { tool: 'pick', hp: 1, drop: [['pierre', 1, 2]] },
  orepile: { tool: 'pick', hp: 3, drop: [['minerai', 3, 4]] },
  crystal: { tool: 'pick', hp: 3, drop: [['cristal', 2, 3]] },
  poppies: { tool: 'hands', hp: 0, drop: [['fleur', 1, 2]] },
  daisies: { tool: 'hands', hp: 0, drop: [['fleur', 1, 2]] },
  lavender: { tool: 'hands', hp: 0, drop: [['fleur', 1, 2]] },
  cornflower: { tool: 'hands', hp: 0, drop: [['fleur', 1, 2]] },
  sunflower: { tool: 'hands', hp: 0, drop: [['fleur', 2, 3]] },
  heather: { tool: 'hands', hp: 0, drop: [['fleur', 1, 1]] },
  mushroom: { tool: 'hands', hp: 0, drop: [['champignon', 2, 3]] },
};
// Gibier : points de vie et butin
const PREY = {
  rabbit: { hp: 2, drop: [['viande', 1, 1], ['cuir', 0, 1]] },
  deer: { hp: 6, drop: [['viande', 3, 4], ['cuir', 1, 2]] },
  sheep: { hp: 4, drop: [['viande', 2, 3], ['cuir', 1, 1]] },
  cow: { hp: 8, drop: [['viande', 4, 5], ['cuir', 2, 2]] },
  pig: { hp: 4, drop: [['viande', 3, 3]] },
  hen: { hp: 1, drop: [['viande', 1, 1]] },
  duck: { hp: 1, drop: [['viande', 1, 1]] },
  horse: { hp: 8, drop: [['viande', 4, 4], ['cuir', 2, 2]] },
  bird: { hp: 1, drop: [] },
};

const ITEMS = {
  bois: { name: 'Bûches', icon: 'it_bois', color: [150, 105, 60] },
  pierre: { name: 'Pierres', icon: 'it_pierre', color: [140, 140, 145] },
  minerai: { name: 'Minerai', icon: 'it_minerai', color: [230, 180, 70] },
  cristal: { name: 'Cristaux', icon: 'it_cristal', color: [90, 200, 240] },
  viande: { name: 'Viande', icon: 'it_viande', color: [200, 60, 50] },
  cuir: { name: 'Cuir', icon: 'it_cuir', color: [130, 90, 50] },
  fleur: { name: 'Fleurs', icon: 'it_fleur', color: [240, 190, 70] },
  champignon: { name: 'Champignons', icon: 'it_champignon', color: [210, 50, 40] },
  residu: { name: 'Résidu anomal', icon: 'it_residu', color: [170, 80, 230] },
  munitions: { name: 'Munitions', icon: 'it_munitions', color: [200, 170, 90] },
  eau: { name: 'Eau distillée', icon: 'it_eau', color: [120, 170, 230] },
};
const REAGENTS = ['eau', 'fleur', 'champignon', 'cristal', 'minerai', 'viande', 'bois', 'residu'];

// Potions : dur = durée de l'effet bu (s)
const POTIONS = {
  eau: { name: 'Eau pure', color: [170, 205, 235], drink: '+5 santé', thr: 'Éclaboussure inoffensive' },
  soin: { name: 'Élixir de soin', color: [240, 70, 95], drink: '+40 santé', thr: 'Soigne les bêtes, fait éclore des fleurs' },
  regen: { name: 'Régénération', color: [200, 25, 55], dur: 30, drink: '+60 santé puis régénération', thr: 'Grande floraison' },
  vitesse: { name: 'Célérité', color: [250, 220, 60], dur: 60, drink: 'Course ×1,8 pendant 60 s', thr: 'Affole les animaux' },
  bond: { name: 'Bond', color: [150, 250, 90], dur: 45, drink: 'Sauts immenses, gravité réduite (45 s)', thr: 'Projette tout en l’air' },
  lumiere: { name: 'Luminescence', color: [160, 240, 255], dur: 120, drink: 'Vous brillez dans le noir (2 min)', thr: 'Orbe lumineux durable' },
  fusee: { name: 'Fusée éclairante', color: [255, 255, 235], drink: 'Éblouissement', thr: 'Lumière aveuglante qui repousse le Rôdeur' },
  vision: { name: 'Nyctalopie', color: [90, 255, 110], dur: 120, drink: 'Vision nocturne (2 min)', thr: 'Nuage verdâtre' },
  voile: { name: 'Voile', color: [215, 220, 255], dur: 60, drink: 'Invisible pour le Rôdeur et les bêtes (60 s)', thr: 'Brume qui dissimule' },
  croissance: { name: 'Croissance', color: [90, 225, 90], drink: 'Un goût de sève…', thr: 'Fait pousser des fleurs' },
  sylve: { name: 'Sylve', color: [35, 135, 55], drink: 'Des feuilles poussent… dans votre bouche', thr: 'Fait jaillir des arbres' },
  geant: { name: 'Gigantisme', color: [255, 150, 40], dur: 40, drink: 'Vous devenez géant (40 s)', thr: 'Fait grandir les bêtes' },
  petit: { name: 'Rétrécissement', color: [180, 90, 255], dur: 40, drink: 'Vous rapetissez (40 s)', thr: 'Rapetisse les bêtes' },
  retour: { name: 'Retour', color: [60, 120, 255], drink: 'Téléporte au laboratoire', thr: 'Envoie les bêtes au loin' },
  quantique: { name: 'Saut quantique', color: [115, 60, 235], drink: 'Téléportation au hasard', thr: 'Déplace les bêtes au hasard' },
  feu: { name: 'Flamme', color: [255, 110, 30], drink: 'Brûlure (−20 santé)', thr: 'Incendie : brûle arbres et bêtes, blesse le Rôdeur' },
  explosion: { name: 'Détonant', color: [95, 85, 75], drink: 'Très mauvaise idée (−45 santé)', thr: 'Explosion qui creuse le sol' },
  givre: { name: 'Givre', color: [170, 230, 255], dur: 15, drink: 'Vous êtes transi (lenteur)', thr: 'Gèle les créatures et le Rôdeur' },
  poison: { name: 'Poison', color: [150, 200, 40], dur: 10, drink: 'Empoisonnement (−30 santé)', thr: 'Nuage toxique mortel pour les bêtes' },
  force: { name: 'Force', color: [220, 30, 30], dur: 90, drink: 'Hache et pioche ×3 (90 s)', thr: 'Onde de choc' },
  chaos: { name: 'Chaos', color: [255, 60, 200], dur: 30, drink: 'Hallucinations (30 s)', thr: 'Zone de distorsion' },
  sommeil: { name: 'Sommeil', color: [190, 160, 255], drink: 'Dormir jusqu’au matin', thr: 'Endort les bêtes' },
  ralenti: { name: 'Ralenti', color: [60, 200, 190], dur: 20, drink: 'Le monde ralentit (20 s)', thr: 'Ralentit les créatures' },
  chronos: { name: 'Chronos', color: [255, 200, 90], dur: 8, drink: 'Le temps file (×30)', thr: 'Fait pousser la végétation' },
  repulsif: { name: 'Répulsif', color: [200, 140, 255], dur: 180, drink: 'Le Rôdeur vous évite (3 min)', thr: 'Zone protégée (2 min)' },
  appat: { name: 'Appât', color: [165, 105, 50], dur: 60, drink: 'Les bêtes vous suivent', thr: 'Attire les bêtes' },
  appel: { name: 'Appel', color: [70, 0, 25], drink: 'Quelque chose vous a entendu…', thr: 'Attire le Rôdeur (la nuit)' },
  levitation: { name: 'Lévitation', color: [165, 225, 255], dur: 15, drink: 'Vous flottez (15 s)', thr: 'Fait léviter les bêtes' },
  rupture: { name: 'Rupture', color: [25, 22, 35], drink: '█▓▒ ERREUR ▒▓█', thr: 'Déchire la réalité' },
  boue: { name: 'Boue', color: [115, 92, 62], dur: 10, drink: 'Nausée', thr: 'Tache de boue' },
};

// Mélanges : paire de réactifs (ordre indifférent) -> potion
const RECIPES = {};
[
  ['eau', 'eau', 'eau'], ['eau', 'fleur', 'soin'], ['eau', 'champignon', 'chaos'], ['eau', 'cristal', 'lumiere'],
  ['eau', 'minerai', 'bond'], ['eau', 'viande', 'appat'], ['eau', 'bois', 'vitesse'], ['eau', 'residu', 'quantique'],
  ['fleur', 'fleur', 'croissance'], ['fleur', 'champignon', 'sommeil'], ['fleur', 'cristal', 'voile'], ['fleur', 'minerai', 'boue'],
  ['fleur', 'viande', 'regen'], ['fleur', 'bois', 'sylve'], ['fleur', 'residu', 'repulsif'],
  ['champignon', 'champignon', 'poison'], ['champignon', 'cristal', 'vision'], ['champignon', 'minerai', 'petit'],
  ['champignon', 'viande', 'force'], ['champignon', 'bois', 'ralenti'], ['champignon', 'residu', 'appel'],
  ['cristal', 'cristal', 'fusee'], ['cristal', 'minerai', 'retour'], ['cristal', 'viande', 'givre'], ['cristal', 'bois', 'geant'],
  ['cristal', 'residu', 'chronos'], ['minerai', 'minerai', 'explosion'], ['minerai', 'viande', 'force'], ['minerai', 'bois', 'feu'],
  ['minerai', 'residu', 'rupture'], ['viande', 'viande', 'appat'], ['viande', 'bois', 'feu'], ['viande', 'residu', 'chaos'],
  ['bois', 'bois', 'vitesse'], ['bois', 'residu', 'levitation'], ['residu', 'residu', 'rupture'],
].forEach(([a, b, p]) => { RECIPES[[a, b].sort().join('+')] = p; });
const recipeOf = (a, b) => RECIPES[[a, b].sort().join('+')] || 'boue';

const ADV_TOOLS = [
  { id: 'revolver', name: 'Revolver', icon: '🔫' },
  { id: 'axe', name: 'Hache', icon: '🪓' },
  { id: 'pick', name: 'Pioche', icon: '⛏' },
  { id: 'vial', name: 'Fiole', icon: '⚗' },
  { id: 'hands', name: 'Mains', icon: '✋' },
];
