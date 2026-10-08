// ============================================================================
//  LA GRANDE PORTE ET LES TERRES D'AVANT (agent V1, quatorzième vague) — données
//  La Zone est un second monde (un World à part, généré une fois par partie, gardé
//  en mémoire) : on y entre par la Grande Porte, dans la paroi des monts de l'est,
//  au bout de la route qui passe par les ruines (11-zzzzV1-1-porte.js).
//  Taille : V1_ZONE_N cases de 2 m de côté. La vallée en fait 1 536 (3 072 m) ;
//  la Zone 2 172 (4 344 m) : √2 fois le côté, deux fois la surface.
// ============================================================================
const V1_ZONE_N = 2172;     // côté de la Zone, en cases (LA constante : tout le reste s'en déduit)
const V1_ZONE_CELL = 2;     // mètres par case (comme la vallée)
const V1_ZONE_EAU = 4;      // niveau de l'eau dans la Zone
const V1_ZONE_NOM = 'les Terres d’Avant';

// ---------------------------------------------------------------- le plan (coordonnées réduites 0..1 : x vers l'est, z vers le sud)
// Chaque région : centre, rayon (en fraction du côté), hauteur visée au-dessus de l'eau, force de l'aplanissement.
const V1_REGIONS = {
  seuil: { nom: 'le Seuil', x: 0.50, z: 0.925, r: 0.045, h: 22, k: 0.92 },
  bois_mort: { nom: 'le Bois Mort', x: 0.25, z: 0.76, r: 0.13, h: 20, k: 0.35 },
  cendrieres: { nom: 'les Cendrières', x: 0.17, z: 0.45, r: 0.13, h: 0.5, k: 0.78 },
  ville_basse: { nom: 'la Ville Basse', x: 0.47, z: 0.60, r: 0.075, h: 26, k: 0.85 },
  ravines: { nom: 'les Ravines', x: 0.77, z: 0.70, r: 0.12, h: 42, k: 0.55 },
  etang: { nom: 'l’Étang des Noyés', x: 0.83, z: 0.42, r: 0.08, h: -7, k: 0.9 },
  tertres: { nom: 'les Tertres', x: 0.66, z: 0.885, r: 0.07, h: 18, k: 0.5 },
  degres: { nom: 'les Degrés', x: 0.50, z: 0.36, r: 0.09, h: 70, k: 0.45 },
  hauts: { nom: 'les Hauts', x: 0.74, z: 0.20, r: 0.11, h: 120, k: 0.7 },
  pic: { nom: 'le Pic', x: 0.18, z: 0.13, r: 0.07, h: 230, k: 0.25 },
};
// Les sites réservés aux autres agents (zone.site(id) → { x, y, z, r }) : r en mètres. y : hauteur du sol, ou (sous: m)
// sous la surface. Ils sont aplanis à la génération (sauf ceux qui sont sous terre) et laissés libres (rien n'y est posé).
const V1_SITES = {
  // V4 — le château, sur le grand replat des Hauts (on y monte par les Degrés)
  chateau: { x: 0.745, z: 0.19, r: 175, agent: 'V4', nom: 'le château' },
  // V5 — la ville catacombe : une grande salle sous la Ville Basse (l'entrée est à cacher : V5 décide où)
  catacombes: { x: 0.43, z: 0.62, r: 170, sous: 48, agent: 'V5', nom: 'la ville catacombe' },
  // V3 — l'aire du dragon au sommet du Pic, et ses perchoirs (sommets, corniches, tours)
  dragon_aire: { x: 0.18, z: 0.13, r: 45, agent: 'V3', nom: 'l’aire du dragon' },
  dragon_perchoir_1: { x: 0.50, z: 0.285, r: 14, agent: 'V3', nom: 'un perchoir (le haut des Degrés)' },
  dragon_perchoir_2: { x: 0.885, z: 0.36, r: 14, agent: 'V3', nom: 'un perchoir (la falaise de l’Étang)' },
  dragon_perchoir_3: { x: 0.285, z: 0.42, r: 12, agent: 'V3', nom: 'un perchoir (l’aiguille des Cendrières)' },
  dragon_perchoir_4: { x: 0.63, z: 0.765, r: 12, agent: 'V3', nom: 'un perchoir (le rebord des Ravines)' },
  dragon_perchoir_5: { x: 0.33, z: 0.69, r: 12, agent: 'V3', nom: 'un perchoir (la butte du Bois Mort)' },
  dragon_perchoir_6: { x: 0.60, z: 0.10, r: 14, agent: 'V3', nom: 'un perchoir (la crête du nord)' },
  // V2 — les repaires des créatures, un ou deux par région
  repaire_1: { x: 0.20, z: 0.73, r: 28, agent: 'V2', nom: 'un repaire (le Bois Mort, à l’ouest)' },
  repaire_2: { x: 0.31, z: 0.84, r: 26, agent: 'V2', nom: 'un repaire (le Bois Mort, au sud)' },
  repaire_3: { x: 0.11, z: 0.49, r: 30, agent: 'V2', nom: 'un repaire (les Cendrières, l’ouest)' },
  repaire_4: { x: 0.21, z: 0.35, r: 28, agent: 'V2', nom: 'un repaire (les Cendrières, le nord)' },
  repaire_5: { x: 0.81, z: 0.75, r: 26, agent: 'V2', nom: 'un repaire (les Ravines)' },
  repaire_6: { x: 0.86, z: 0.49, r: 24, agent: 'V2', nom: 'un repaire (la rive de l’Étang)' },
  repaire_7: { x: 0.40, z: 0.31, r: 24, agent: 'V2', nom: 'un repaire (les Degrés)' },
  repaire_8: { x: 0.70, z: 0.91, r: 24, agent: 'V2', nom: 'un repaire (les Tertres)' },
};
// Les chemins (polylignes en coordonnées réduites, largeur en m) : ils relient les régions ; le relief s'y adoucit.
const V1_CHEMINS = [
  { pts: [[0.50, 0.955], [0.50, 0.90], [0.485, 0.80], [0.475, 0.70], [0.47, 0.64]], w: 3.2, nom: 'la Voie' },
  { pts: [[0.455, 0.60], [0.38, 0.62], [0.30, 0.66], [0.26, 0.72], [0.25, 0.78]], w: 2.2 },
  { pts: [[0.30, 0.66], [0.24, 0.58], [0.19, 0.50], [0.17, 0.45]], w: 1.8 },
  { pts: [[0.49, 0.60], [0.56, 0.62], [0.63, 0.65], [0.70, 0.68], [0.77, 0.70]], w: 2.2 },
  { pts: [[0.70, 0.68], [0.75, 0.58], [0.79, 0.50], [0.81, 0.46]], w: 1.8 },
  { pts: [[0.47, 0.565], [0.48, 0.50], [0.49, 0.44], [0.50, 0.39], [0.50, 0.33]], w: 2.6, nom: 'les Degrés' },
  { pts: [[0.50, 0.33], [0.55, 0.28], [0.62, 0.24], [0.69, 0.21], [0.74, 0.20]], w: 2.4 },
  { pts: [[0.50, 0.33], [0.42, 0.28], [0.33, 0.22], [0.25, 0.17], [0.19, 0.135]], w: 1.2, sentier: true },
  { pts: [[0.485, 0.80], [0.56, 0.84], [0.62, 0.87], [0.66, 0.885]], w: 1.6 },
];
// Les ravines : des entailles profondes (largeur en m, profondeur en m)
const V1_RAVINES = [
  { pts: [[0.62, 0.55], [0.67, 0.62], [0.705, 0.70], [0.73, 0.79], [0.77, 0.87]], w: 34, p: 36 },
  { pts: [[0.80, 0.60], [0.79, 0.67], [0.82, 0.74], [0.87, 0.80]], w: 26, p: 28 },
];

// ---------------------------------------------------------------- noms des lieux (carnet, cartes, mort)
const V1_LIEUX = {
  grande_porte: 'la Grande Porte',
  zone_seuil: 'le Seuil', zone_bois_mort: 'le Bois Mort', zone_cendrieres: 'les Cendrières', zone_ville_basse: 'la Ville Basse',
  zone_ravines: 'les Ravines', zone_etang: 'l’Étang des Noyés', zone_tertres: 'les Tertres', zone_degres: 'les Degrés',
  zone_hauts: 'les Hauts', zone_pic: 'le Pic',
};

// ---------------------------------------------------------------- textes (peu de mots : les lieux racontent)
const V1_TEXTES = {
  porteOuverte: 'La Grande Porte. Deux vantaux de chêne noir cerclés de fer, hauts comme trois maisons. L’un d’eux n’est pas tout à fait fermé : un souffle froid passe par la fente, et il sent la cendre.',
  porteFermee: 'La Grande Porte est close. Une barre de fer est passée dans les anneaux, et la serrure, à hauteur d’homme, attend une clé.',
  porteFermeeVorndi: 'La Grande Porte est close. Les braseros sont éteints. On dit qu’elle ne s’ouvre jamais le jour des morts.',
  porteFermeeBrume: 'La Grande Porte est close. La brume colle aux vantaux. La barre est mise.',
  porteFermeeNuit: 'La Grande Porte est close. Il fait nuit, et quelqu’un a mis la barre. Personne ne garde la Porte.',
  porteCle: 'La clé entre dans la serrure. Elle tourne d’elle-même, lourdement, comme si quelque chose l’attendait de l’autre côté.',
  seuilRetour: 'La Porte, de ce côté-ci, n’a ni serrure ni barre. Seulement des traces de mains, très haut sur le bois.',
  stele: 'CE QUI EST DERRIÈRE ÉTAIT AVANT.\nCE QUI EST DEVANT VIENDRA APRÈS.\nNE LAISSE PAS LA PORTE OUVERTE DERRIÈRE TOI.',
  steleTitre: 'Une stèle, au pied des marches',
  chevalRefuse: '(Le cheval refuse d’avancer. Il recule, les oreilles couchées.)',
  chienRefuse: '(Le chien s’arrête au pied des marches et ne vous suit pas.)',
  generation: 'Derrière la Porte…',
  arrivee: 'Il fait plus froid, de ce côté.',
};

// ---------------------------------------------------------------- ce qu'on en dit dans la vallée (sans tout dire)
const V1_RUMEURS = {
  aubergiste: ['Au bout de la route de Clairpré, passé les ruines, il y a la Porte. Vous l’avez vue ? On ne peut pas la manquer.', 'Le jour des morts, la Grande Porte reste fermée. Ça, tout le monde le sait. Le reste du temps… ça dépend.'],
  fillette: ['Ma grand-mère dit que la Porte était là avant la montagne.'],
  chasseur: ['J’ai suivi un cerf jusqu’à la Grande Porte, une fois. Il s’est arrêté net devant les marches. Moi aussi.'],
  eleveuse: ['Les matins de brume, on entend la barre de la Porte retomber jusqu’au hameau.'],
  cure: ['Il y a une clé, paraît-il. On dit qu’elle dort chez les livres, à la bibliothèque. Je ne vous ai rien dit.'],
};

// ---------------------------------------------------------------- ce que racontent les lieux (stèles, linteaux, troncs gravés)
// [clé, région, titre, texte] — peu de mots ; rien ne s'explique
const V1_INSCRIPTIONS = [
  ['voie', 'seuil', 'Une borne, au bord de la Voie', 'ICI FINISSAIT LA ROUTE DES MARCHANDS.\nILS NE SONT PAS REVENUS. LEURS ÂNES NON PLUS.'],
  ['tonnelier', 'ville_basse', 'Un linteau tombé', 'JOACHIM FÈVE, TONNELIER.\nIL A FERMÉ SA PORTE LE SOIR OÙ LA CENDRE EST TOMBÉE.\nIL L’A ROUVERTE AU MATIN.'],
  ['arbres', 'bois_mort', 'Des mots creusés dans une pierre, au pied d’un arbre', 'Les arbres ont cessé de pousser l’année où l’on a fermé la Porte.\nIls n’ont pas cessé de grandir.'],
  ['cendres', 'cendrieres', 'Une pierre noircie', 'NOUS AVONS BRÛLÉ CE QU’IL FALLAIT BRÛLER.\nCE QUI RESTE NE BRÛLE PAS.'],
  ['etang', 'etang', 'Une pierre plate, au bord de l’eau', 'Ne bois pas. Ne te penche pas. Ne réponds pas.'],
  ['tertres', 'tertres', 'Une pierre dressée', 'SOUS CHAQUE TERTRE, UN ROI.\nSOUS CHAQUE ROI, UN AUTRE TERTRE.'],
  ['degres', 'degres', 'Une marche gravée', 'SIX DEGRÉS JUSQU’AUX HAUTS.\nLE SEPTIÈME, TU LE DESCENDRAS SEUL.'],
  ['hauts', 'hauts', 'Une borne renversée', 'Là-haut, on ferme les volets quand il passe.'],
  ['pic', 'pic', 'Une croix de pierre, au bord du sentier', 'Il dort la tête tournée vers la Porte.'],
  ['ravines', 'ravines', 'Une pierre, près du pont', 'LE PONT SE LÈVE DE L’AUTRE CÔTÉ.\nIL S’EST TOUJOURS LEVÉ DE L’AUTRE CÔTÉ.'],
  ['feu', 'seuil', 'Une lettre roulée sous une pierre', 'Jour onze. J’ai trouvé un feu. Il ne chauffe pas, mais il se souvient de moi.\nSi tu lis ceci, tu as la même lettre que moi dans ta poche.\n— A.'],
  ['puits', 'cendrieres', 'La margelle d’un puits sans eau', 'TOUT EN BAS, IL Y A UN AUTRE PUITS.\nAU FOND DE CELUI-LÀ, UN VILLAGE.'],
];
// le butin des recoins (niches, caveaux, caves) : de vieilles choses, peu d'argent ; la Zone ne rend pas riche
LOOT.v1_recoin = { rolls: [1, 2], items: [['vieille_piece', 1, 3, 5], ['tesson', 1, 2, 4], ['bougie', 1, 2, 3], ['bijou', 1, 1, 0.8], ['relique', 1, 1, 0.6], ['figurine', 1, 1, 0.8], ['argent', 8, 40, 3], ['geode', 1, 1, 1], ['plume_noire', 1, 2, 1]] };
LOOT.v1_caveau = { rolls: [2, 3], items: [['vieille_piece', 2, 4, 5], ['bijou', 1, 1, 1.5], ['relique', 1, 1, 1.2], ['figurine', 1, 1, 1], ['gemme', 1, 1, 0.5], ['argent', 20, 70, 3], ['bougie', 1, 3, 2]] };
Object.assign(V1_TEXTES, {
  murCreux: '(Le mur sonne creux.)',
  murCreuxTombe: '(Les pierres cèdent d’un coup. Derrière, il fait noir et sec.)',
  trappe: 'Une trappe de bois, sous la poussière. Un anneau de fer.',
  echelleHaut: 'Une échelle, tirée en haut de la paroi et couchée dans l’herbe. Quelqu’un ne voulait pas qu’on monte.',
  echelleBas: '(Il y avait une échelle ici : les traces sont encore dans la terre. On l’a tirée d’en haut.)',
  levier: 'Un levier de fer, très long, pris dans un engrenage rouillé. Une chaîne descend vers le pont.',
  pontLeve: '(Le pont est levé. Il se dresse, de l’autre côté, comme une porte.)',
  grilleDedans: 'Une grille, fermée par une barre, de ce côté-ci.',
  grilleDehors: '(La grille ne bouge pas. On voit la barre, de l’autre côté.)',
  passage: 'Un passage étroit, qui descend sous la roche. Il y souffle un air tiède, qui sent l’herbe.',
  passageFerme: '(La roche s’est refermée derrière vous. Le passage ne s’ouvre que d’un côté.)',
  reste: 'Un corps, ou ce qu’il en reste. Dans la poche de la veste, une lettre de notaire — la même que la vôtre —, gonflée d’eau.',
  feuGarde: 'Le feu de veille vous a gardé. Il en est mort.',
});
