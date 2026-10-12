// ============================================================================
//  LES CASCADES, LES GROTTES DE LA CHUTE ET LES COINS DE PARADIS (agent P18,
//  dix-huitième vague) — 1. LE PLAN ET LES TEXTES
//  Tout est placé à la main, comme la vallée dessinée (06-zzdesign.js) : cinq
//  chutes d'eau, chacune à sa place (loin des routes, des maisons, des lieux et
//  de ce qui est posé — tools/equilibrage/P18.js le vérifie), un réseau de
//  grottes sous les monts de l'ouest (derrière la Grande Chute), six coins de
//  paradis. La génération (11-zzzzzzzP18-1-gen.js) creuse le terrain d'après ce
//  plan, après tout le reste : les objets et objets posés d'avant ne bougent pas.
//  Hauteurs : « h » relatives au niveau de l'eau de la vallée (WL) dehors ;
//  absolues dessous (le Dessous : sol vers -50 à -150, eau à -150).
// ============================================================================

// ---------------------------------------------------------------- les chutes
// lip : le bord d'où l'eau tombe ; dir : où elle va (radians, 0 = +x, π/2 = +z) ; haut / bas : le bord, le bassin ;
// larg : largeur du rideau ; sorte : rideau (large), ruban (étroit, très haut), gradins (de bassin en bassin) ;
// cirque : le creux au pied (ellipse [cx, cz, rx, rz, rot], sol = bas + 0,6) ; bassin : [cx, cz, rx, rz, rot, profondeur] ;
// amont / aval : des gradins [x, z, niveau, largeur] (le premier : la source ; le dernier de l'aval : la fin) ;
// fin : perte (l'eau se perd sous terre), mare (une mare aux roseaux), lac (le grand lac).
const P18_CHUTES = [
  { k: 'grande', nom: 'la Grande Chute', sorte: 'rideau', lip: [391, 1597], dir: 0, haut: 38, bas: 7, larg: 13, surplomb: 6.4,
    cirque: [413, 1597, 30, 21, 0], bassin: [415.5, 1597, 25.5, 15, 0, 2],
    amont: [[326, 1601, 39.6, 3], [346, 1598, 39.0, 3.2], [366, 1597, 38.5, 3.4], [391, 1597, 38, 4]],
    aval: [[442, 1599, 6.8, 3], [452, 1601, 6.8, 2.6]], fin: 'perte',
    grotte: { bouche: [384.8, 1597], vers: Math.PI / 2 }, // la bouche de la grotte, au fond, derrière le rideau
    corniche: [384.6, 389.4, 1585, 1609], // le passage derrière le rideau : x de … à …, z de … à …
  },
  { k: 'saules', nom: 'la Cascade des Saules', sorte: 'rideau', lip: [764.5, 1795], dir: 0, haut: 25, bas: 7.5, larg: 9, source: 'faille',
    cirque: [790, 1795, 26, 22, 0], bassin: [789, 1796, 25, 18, 0, 1.9],
    ilot: [801, 1801, 4.6, 8.4],
    aval: [[814, 1793, 7.3, 3.4], [834, 1790, 6.0, 3.2], [853, 1789, 4.2, 3.4], [871, 1790, 2.2, 3.6], [893, 1792, 0, 4]], fin: 'lac',
  },
  { k: 'cascatelles', nom: 'les Cascatelles', sorte: 'gradins', lip: [2024, 2712], dir: -Math.PI / 2 - 0.12, haut: 34.5, bas: 7.5, larg: 3,
    gradins: [[2024, 2712, 34.5, 4.5, 3.2], [2021, 2699, 30.0, 5.5, 4], [2019, 2686, 25.5, 5.5, 4], [2017, 2674, 20.0, 6, 4.2], [2015, 2661, 14.5, 6, 4.2], [2013, 2649, 11.0, 6.5, 4.5]],
    cirque: [2010, 2628, 13, 11, 0.1], bassin: [2010, 2628, 9.5, 7.5, 0.1, 1.6],
    aval: [[2008, 2616, 6.4, 2.6], [2014, 2602, 5.4, 2.6], [2024, 2592, 4.6, 2.8]], fin: 'mare', mare: [2032, 2586, 8, 6, 0.4, 4.4],
  },
  { k: 'loup', nom: 'le Saut du Loup', sorte: 'ruban', lip: [2842, 2589], dir: Math.PI, haut: 56, bas: 17, larg: 2.6,
    cirque: [2826, 2589, 16, 12, 0], bassin: [2823, 2589, 11, 9, 0, 1.8],
    amont: [[2871, 2593, 57.4, 2.4], [2856, 2590, 56.6, 2.4], [2842, 2589, 56, 2.4]],
    aval: [[2810, 2589, 16.4, 3], [2795, 2584, 15.0, 3], [2780, 2577, 13.6, 3], [2765, 2569, 12.2, 3]], fin: 'mare', mare: [2752, 2562, 9, 7, 0.3, 10.6],
  },
  { k: 'voile', nom: 'le Voile de la Mariée', sorte: 'ruban', lip: [1996, 1184], dir: Math.PI / 2, haut: 51.5, bas: 18, larg: 4,
    cirque: [1995, 1203, 13, 19, 0], bassin: [1995, 1206, 9, 9, 0, 1.7],
    amont: [[1999, 1150, 59.5, 2.6], [1997, 1166, 55.0, 2.8], [1996, 1178, 51.5, 3], [1996, 1184, 51.5, 3]],
    aval: [[1994, 1218, 17.2, 3], [1992, 1234, 15.4, 3]], fin: 'mare', mare: [1990, 1248, 7, 6, 0, 13.8],
  },
];

// ---------------------------------------------------------------- les coins de paradis
// c : le centre ; r : le rayon (on y dégage la place) ; sorte : ce qu'on y trouve ; lieu : il s'appuie sur une chute
const P18_COINS = [
  { k: 'papillons', nom: 'le Pré aux Papillons', sorte: 'pre', c: [2610, 1930], r: 21 },
  { k: 'source', nom: 'la Source Tiède', sorte: 'source', c: [590, 1310], r: 14, bain: [590, 1310, 5.2, 4.2, 0.5] },
  { k: 'saule', nom: 'l’Îlot du Saule', sorte: 'ilot', c: [801, 1801], r: 9, chute: 'saules' },
  { k: 'fees', nom: 'le Bassin des Fées', sorte: 'bassin', c: [2010, 2626], r: 16, chute: 'cascatelles' },
  { k: 'belvedere', nom: 'le Belvédère', sorte: 'belvedere', c: [2030, 1150], r: 9 },
  { k: 'verger', nom: 'le Verger sauvage', sorte: 'verger', c: [1120, 2630], r: 22 },
];

// ---------------------------------------------------------------- les Grottes de la Chute (sous les monts de l'ouest)
// (le moteur du Dessous, 11-zzzz9-souterrain0.js : des creuseurs en plus, loin des siens ; aucune galerie ne les relie)
// salles : [clé, x, z, rx, rz, rot, sol, voûte, mat. sol, mat. voûte, { und, bowl }]
// galeries : [clé, [[x, z, sol, demi-largeur, hauteur], …], mat. sol, mat. voûte, { lisse }]
// lacs : [clé, x, z, rx, rz, rot, fond, voûte] (l'eau d'en bas : -150)
// torrent : [[x, z, berge, demi-largeur], …] (des gradins d'eau sous la berge, une berge pour marcher)
const P18_GROTTE = {
  boite: [120, 1360, 760, 2420], // où sont les grottes (et rien d'autre dessous)
  arrivee: [366, -50, 1597], sortie: [386.6, 1597], // l'arrivée (vestibule), la sortie dehors (devant la bouche, sur la corniche)
  salles: [
    ['vestibule', 360, 1597, 15, 9, 0, -50, 8, 'roche', 'roche', { und: 0.4, bowl: 2 }],
    ['mains', 300, 1556, 27, 8, -0.53, -56, 6.5, 'argile', 'roche', { und: 0.5, bowl: 1.6 }],
    ['cristaux', 226, 1470, 30, 22, -0.3, -68, 15, 'calcite', 'calcite', { und: 1, bowl: 3 }],
    ['puits', 166, 1408, 15, 12, 0.4, -72, 11, 'roche', 'roche', { und: 0.6, bowl: 2 }],
    ['aven', 560, 1470, 22, 18, 0.2, -62, 13, 'humus', 'roche', { und: 0.8, bowl: 2.5 }],
    ['tonnerre', 462, 1680, 21, 16, 0.3, -104, 30, 'roche', 'roche', { und: 0.6, bowl: 2.5 }],
    ['fossiles', 176, 1690, 29, 9, 1.15, -84, 7, 'argile', 'roche', { und: 0.6, bowl: 1.8 }],
    ['cathedrale', 302, 1812, 56, 40, 0.2, -100, 52, 'roche', 'roche', { und: 2.2, bowl: 5 }],
    ['sanctuaire', 182, 1880, 13, 11, 0, -100, 9, 'roche', 'roche', { und: 0.3, bowl: 1.5 }],
    ['gours', 332, 2150, 26, 18, 0.3, -140, 11, 'calcite', 'calcite', { und: 0.4, bowl: 2 }],
    ['draperies', 252, 2330, 30, 22, -0.2, -146, 19, 'calcite', 'calcite', { und: 1.2, bowl: 3 }],
    ['eboulis', 694, 2008, 11, 8, 0.2, -148, 7, 'roche', 'roche', { und: 0.4, bowl: 1.5 }],
  ],
  lacs: [
    ['lac', 470, 2052, 74, 54, 0.3, -158, 28],
  ],
  // galeries : [clé, de (salle), à (salle), [[x, z, sol, demi-largeur, hauteur], …] (les points du milieu), mat. sol, mat. voûte, { lisse }]
  // (les deux bouts sont pris dans les salles, vers le premier et le dernier point du milieu ; leur sol est celui de la salle)
  galeries: [
    ['g_mains', 'vestibule', 'mains', [[334, 1584, -52, 3, 5]], 'roche', 'roche'],
    ['g_cristaux', 'mains', 'cristaux', [[262, 1520, -61, 3.2, 5.5]], 'roche', 'calcite'],
    ['g_puits', 'cristaux', 'puits', [[192, 1436, -70, 2.8, 5]], 'calcite', 'roche'],
    ['g_aven', 'vestibule', 'aven', [[420, 1562, -54, 3, 5.5], [480, 1522, -58, 3.2, 5.5]], 'roche', 'roche'],
    ['g_tonnerre', 'aven', 'tonnerre', [[530, 1550, -72, 3.2, 6.5], [496, 1620, -90, 3.4, 7]], 'roche', 'roche'],
    ['g_fossiles', 'mains', 'fossiles', [[244, 1606, -66, 3, 5], [204, 1648, -77, 3, 5]], 'argile', 'roche'],
    ['g_cathedrale', 'fossiles', 'cathedrale', [[188, 1742, -90, 3.2, 6], [230, 1778, -96, 3.6, 7]], 'roche', 'roche'],
    ['g_lac', 'cathedrale', 'lac', [[372, 1880, -112, 4, 8], [410, 1950, -132, 4, 8]], 'roche', 'roche'],
    ['g_gours', 'lac', 'gours', [[392, 2110, -146, 3.6, 7]], 'roche', 'calcite'],
    ['g_draperies', 'gours', 'draperies', [[296, 2236, -143, 3.4, 6.5]], 'calcite', 'calcite'],
    ['g_eboulis', 'lac', 'eboulis', [[600, 2046, -148.4, 3.2, 5.5]], 'roche', 'roche'],
    ['g_sanctuaire', 'cathedrale', 'sanctuaire', [[230, 1848, -100, 2.6, 4.2]], 'roche', 'roche', { lisse: true }],
  ],
  // la rivière d'en bas : du pied de la chute qui tombe de la voûte (le Tonnerre) au lac, en gradins
  torrent: [[466, 1691, -103.6, 4], [470, 1722, -107.5, 4.2], [476, 1754, -112.4, 4.4], [482, 1786, -117.8, 4.4], [486, 1818, -123.4, 4.6],
    [486, 1852, -129.2, 4.6], [484, 1886, -135, 4.8], [480, 1920, -141, 5], [476, 1956, -147, 5.2], [472, 1990, -148.6, 5.4], [470, 2004, -148.8, 5.4]],
  // les gours : des vasques d'eau en terrasses, dans la salle des Gours (x, z, rayon, niveau)
  gours: [[318, 2140, 5, -139.2], [330, 2154, 5.5, -139.7], [344, 2166, 5, -140.2], [354, 2150, 4, -139.6], [322, 2164, 4, -140.1]],
  // la cheminée de l'aven (le jour en haut) ; le gouffre du puits ; les piliers de la cathédrale
  cheminees: [[560, 1470, 3.2, -34]],
  gouffres: [[160, 1404, 6, -200]],
  piliers: [[290, 1800, 4], [330, 1824, 3], [268, 1832, 2.5], [458, 2040, 3]],
  ilots: [[486, 2066, 7, -148.4]],
  // la porte du sanctuaire (une dalle qui s'enfonce quand on a touché les trois signes dans l'ordre)
  porte: [232, 1848, 6, 4.6],
  // l'éboulis du bout (derrière : la Mer muette du Dessous, qu'on entend et qu'on ne rejoint pas)
  bout: [702, 2005],
};
// les noms des salles (ce qu'on lit en y entrant, le carnet, le wiki)
const P18_SALLES_NOMS = {
  vestibule: 'le Vestibule', mains: 'la Galerie des Mains', cristaux: 'la Salle des Cristaux', puits: 'le Puits sans fond', aven: 'l’Aven',
  tonnerre: 'la Salle du Tonnerre', fossiles: 'la Galerie des Fossiles', cathedrale: 'la Cathédrale', sanctuaire: 'le Sanctuaire des Trois',
  gours: 'les Gours', draperies: 'les Draperies', eboulis: 'l’Éboulis', lac: 'le Lac aux Lueurs', torrent: 'la Rivière grondante',
};

// ---------------------------------------------------------------- les textes
const P18_TEXTES = {
  // en passant derrière le rideau
  entrer: 'Derrière l’eau, la roche s’ouvre. Un boyau descend longtemps dans le noir.',
  entrerNoir: 'Il fait noir comme dans un four. Il faudrait une lanterne.',
  sortir: 'Le grondement grandit, puis la lumière, à travers l’eau.',
  aven: 'Les racines tiennent. Vous montez vers le rond de ciel.',
  avenHaut: 'Un aven. Tout au fond, très bas, de l’eau brille.',
  avenDescendre: 'Une corde, un tronc solide : vous descendez dans le trou.',
  avenSansCorde: '(Trop profond pour sauter. Avec une corde, peut-être.)',
  eboulis: '(Derrière les blocs, très loin, de l’eau noire bat contre la pierre. On ne passe pas.)',
  porteFermee: '(Une dalle lisse, plus haute qu’un homme. Trois creux y sont taillés, comme pour trois mains.)',
  porteMauvais: '(La pierre reste froide. Ce n’était pas le bon ordre.)',
  porteOuverte: '(La dalle s’enfonce dans le sol, lentement, comme on se couche.)',
  perte: '(L’eau tourne, et s’enfonce dans la roche. On l’entend descendre longtemps.)',
  repos: '(Vous vous asseyez. Rien ne presse, ici.)',
  reposDeja: '(Vous restez un moment. C’est déjà beaucoup.)',
  bain: '(L’eau est tiède. Les épaules descendent d’un cran.)',
  bainDeja: '(Encore un peu d’eau tiède. Elle ne guérit plus, mais elle fait du bien.)',
  carnet: 'Les Grottes de la Chute',
  carnetVide: 'Pas encore de plan : rien n’a été vu.',
  carnetIci: 'vous êtes ici',
  carnetSorties: 'sorties',
};

// les signes de la porte du Sanctuaire : l'ordre est peint dans la Galerie des Mains (l'aube, la pierre, la nuit)
const P18_SIGNES = ['aela', 'durn', 'vesh'];

// les peintures (ce qu'on y voit, quand on les regarde) : clé, salle, texte
const P18_PEINTURES = [
  ['mains', 'mains', 'Des mains, des dizaines de mains, soufflées à l’ocre autour de la vôtre. Certaines n’ont que quatre doigts. Une seule est noire.'],
  ['trois', 'mains', 'Trois figures, de gauche à droite : une femme qui porte un soleil levant, un homme fait de pierres empilées, une forme sans visage, peinte au noir de fumée. Sous chacune, une encoche.'],
  ['ver', 'mains', 'Un trait long, très long, qui fait le tour de la paroi : un corps sans pattes, plié sous une montagne. Autour de son cou, un cercle épais, repassé plusieurs fois.'],
  ['feux', 'sanctuaire', 'Des hommes debout sur une crête, chacun avec un feu. Ils regardent tous du même côté, loin, vers le nord.'],
  ['porte', 'sanctuaire', 'Une porte, deux montants et un linteau. Devant, une silhouette qui se retourne. Derrière, rien n’est peint : la paroi est grattée jusqu’à la roche.'],
  ['cerfs', 'cathedrale', 'Des cerfs, des aurochs, un cheval qui court. Les bêtes sont belles. Les hommes, à côté, ne sont que des bâtons.'],
  ['oeil', 'sanctuaire', 'Un œil, grand comme une porte, au-dessus de tout le reste. Il est ouvert.'],
];

// ce qu'on en dit dans la vallée (des indices, jamais tout)
const P18_RUMEURS = {
  chasseur: ['Sous les monts de l’ouest, il y a une chute qu’on entend avant de la voir. Les anciens disaient qu’elle cache quelque chose. Les anciens disaient beaucoup de choses.',
    'Au fond du bois du sud, l’eau descend de bassin en bassin. Le dernier, on dirait qu’il a été fait exprès pour qu’on s’y arrête.'],
  pecheur: ['Au bord du lac, côté ouest, un ruisseau arrive d’une butte. Il y a un saule dans l’eau, au pied. Je n’y pêche pas : c’est trop joli pour y mettre un hameçon.'],
  guerisseuse: ['Dans le bois de l’est, il y a un pré que les arbres ont oublié de manger. Les papillons s’y retrouvent tous, on dirait. J’y cueille quand j’ai besoin de calme.',
    'Au pied des monts, au nord-ouest, l’eau sort de terre toute tiède. Pour les vieux os, il n’y a pas mieux.'],
  estive_patre: ['De là-haut, on voit l’eau tomber de la paroi, à l’ouest : un drap blanc. Et derrière, le noir. J’y suis jamais allé derrière.'],
  libraire: ['Un vieux registre parle de « grottes peintes » derrière une chute, sous les monts. Des mains sur la pierre, et trois figures. Personne n’a su me dire où.'],
  eleveuse: ['Il y a un verger au sud, au bord du bois, que personne n’a planté. Des poiriers, des pruniers, des cerisiers. Les bêtes le connaissent mieux que nous.'],
  aubergiste: ['Au nord, au-dessus de l’abbaye, il y a une eau qui tombe comme un voile. On dit qu’en haut, on voit toute la vallée. On dit aussi qu’on y monte essoufflé.'],
  garde_champetre: ['Tout au bout de l’est, dans le bois, une eau saute d’une falaise si haute qu’on l’appelle le Saut du Loup. Le loup, je ne l’ai jamais vu. La falaise, si.'],
  naturiste_a: ['Il y a d’autres eaux tièdes que les nôtres, au nord-ouest, dans le bois. Plus sauvages. On y va seule, et on revient légère.'],
};
const P18_RUMEURS_TOUS = ['On dit qu’il y a des coins, dans la vallée, où l’on oublie l’heure. Je ne sais pas où. Si je savais, j’y serais.'];
