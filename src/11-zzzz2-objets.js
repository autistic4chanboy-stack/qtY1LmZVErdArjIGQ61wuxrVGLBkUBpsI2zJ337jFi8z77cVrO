// ============================================================================
//  OBJETS (agent U2) : RAMASSER les petits objets, CASSER tout le reste
//  - Touche E sur un petit objet posé (bougie, lanterne, chaise, livre, pot de
//    fleurs, poupée, os, sac de grain…) : on le prend ; il devient un objet
//    d'inventaire (un objet qui se pose se repose ensuite, avec le clic). Chez
//    quelqu'un, dans un commerce, en ville : c'est un vol (les témoins de
//    11-zzz98, societe.crime). Les meubles et les conteneurs restent à l'agent
//    U1 (butin.conteneur(q) : il les fait fouiller) ; ce qui a déjà un usage
//    (machines, lits, PROP_USE, HOOKS.propPre) le garde.
//  - Clic gauche avec le bon outil : tout se casse. Le bois à la hache
//    (meubles, caisses, tonneaux, clôtures, charrettes, portes, barques…), la
//    pierre et le métal à la pioche (statues, bornes, meules, calvaires, tombes,
//    enclumes, lampadaires, coffre-fort…), la poterie et le verre avec
//    n'importe quel outil ou le marteau ; la paille et la toile aussi. Plusieurs
//    coups selon la solidité et le palier de l'outil : fissures, éclats qui
//    volent et retombent, poussière, bruits ; il en reste des débris quelques
//    jours et l'on récupère des matériaux (bûches, pierres, ferraille, éclats de
//    verre…). Un conteneur cassé répand son contenu par terre (butin.vider de U1 ;
//    E pour le ramasser). Une porte, fermée à clé ou non, s'enfonce à la hache :
//    elle reste ouverte jusqu'à ce que l'habitant la fasse réparer (trois jours).
//  - Chez quelqu'un (ou devant chez lui, à moins de quatre mètres de ses murs),
//    dans un commerce ou en ville, vu ou entendu (on entend les coups de hache,
//    même en dormant) : crime — effraction (une porte, les affaires de quelqu'un
//    chez lui), vol (devant chez lui, commerce, commune, rue), profanation
//    (tombes, croix, calvaires : et la malédiction qui va avec). Pas vu : la
//    plainte du lendemain, la mentalité qui baisse.
//  - Ne se cassent pas : ce qui porte une quête ou un mécanisme (OBJ_JAMAIS, les
//    objets auxquels une interaction est attachée, les cachettes, la prison, le
//    temple), les objets que d'autres modules posent en cours de partie, les
//    bâtiments et les murs, le terrain, les arbres et les rochers (déjà
//    cassables), la ferme (son lit, sa porte), la charrette du joueur, la niche.
//  État : farm.s.casse = { v, pv: {clé: {d, j}}, portes: {rang: {j, bld}},
//         inters: {id: 1}, tas: [{id, x, y, z, o, j, own, bld, t}],
//         debris: [{x, y, z, r, m, t, j, g}], plaintes: {pnj: {j, t}}, n, r, pris }
//  API : objets (profil(q), cassable(q), ramassable(q), viser(oeil, f, portée),
//        casser(q), ramasser(q), porteCassee(dr), lieu(x, y, z), S())
// ============================================================================

// ---------------------------------------------------------------- objets d'inventaire nouveaux
defItem('eclats_verre', 'Éclats de verre', 'materiau', 1, ['tas', '#b8d0d8'], { desc: 'Des morceaux de verre verdâtre, coupants sur la tranche. Au soleil, ils font de petites lumières par terre.' });
defItem('ferraille', 'Ferraille', 'materiau', 5, ['tas', '#5c5e64'], { desc: 'Des bouts de fer tordus, des clous arrachés, une charnière. Le forgeron en fera toujours quelque chose.' });
defItem('livre_abime', 'Livre abîmé', 'tresor', 6, ['livre', '#6a4a34'], { desc: 'Les pages ont gondolé à l’humidité. On y lit encore des bribes : un sermon, une recette, le nom d’un mort souligné deux fois.' });
defItem('poupee_vieille', 'Vieille poupée', 'tresor', 4, ['poupee', '#c8a898'], { desc: 'Une poupée de chiffon aux yeux de boutons. L’un des deux pend à un fil. Elle a été beaucoup aimée, puis plus du tout.' });
defItem('sac_grain', 'Sac de grain', 'materiau', 10, ['sac', '#c8a870'], { open: 'u2_grain', desc: 'Un sac de toile ficelé, lourd, qui crisse quand on le soulève. En main, un clic l’ouvre.' });
if (typeof LOOT !== 'undefined' && !LOOT.u2_grain) LOOT.u2_grain = { rolls: [1, 2], items: [['ble', 2, 4, 4], ['avoine', 1, 3, 2], ['orge', 1, 3, 1.5], ['seigle', 1, 3, 1]] };
// abattre une croix de chemin : une faute, que le curé sait ôter (11-zzz42)
if (typeof MAL_CAUSES !== 'undefined' && !MAL_CAUSES.calvaire) MAL_CAUSES.calvaire = { mal: 'malchance', faute: 'Vous avez abattu une croix de chemin.', reparer: 'Se confesser au curé, avec une offrande.' };

// ---------------------------------------------------------------- les matières : l'outil qui convient, les couleurs des éclats
const OBJ_MAT = {
  bois: { k: { hache: 1, masse: 0.8 }, besoin: '(Du bois : il faudrait une hache.)', col: [128, 92, 58], col2: [172, 128, 82], tuile: 'wood' },
  pierre: { k: { pioche: 1, masse: 1.2 }, besoin: '(De la pierre : il faudrait une pioche.)', col: [128, 126, 120], col2: [166, 162, 154], tuile: 'stone' },
  metal: { k: { pioche: 0.75, masse: 1 }, besoin: '(Du fer : seule une pioche en viendrait à bout.)', col: [88, 90, 98], col2: [150, 152, 160], tuile: 'iron' },
  poterie: { tout: true, col: [176, 106, 68], col2: [206, 150, 104], tuile: 'terracotta' },
  verre: { tout: true, col: [190, 212, 220], col2: [236, 244, 248], tuile: 'plain' },
  paille: { tout: true, col: [206, 178, 94], col2: [232, 206, 128], tuile: 'hay' },
  tissu: { tout: true, col: [204, 194, 174], col2: [230, 222, 204], tuile: 'cloth' },
};
// ce qui compte comme un outil (poterie, verre, paille, toile : n'importe lequel)
const OBJ_OUTILS = new Set(['hache', 'pioche', 'marteau', 'houe', 'faux', 'fourche', 'cisailles', 'masse', 'rapiere', 'seau']);
const OBJ_DMG = { masse: 30, rapiere: 12 }; // outils sans valeur dans TOOL_DMG

// ---------------------------------------------------------------- ce qui se casse : [matière, solidité, [[matériau, min, max, chance?]], options]
// (options : prof = profanation ('tombe' | 'calvaire'), lourd = gros objet, tier = palier minimal de la pioche)
const OBJ_CASSE = {
  // --- le bois : la hache
  chaise: ['bois', 22, [['bois', 1, 1]]],
  table: ['bois', 45, [['bois', 1, 2]]],
  banc: ['bois', 40, [['bois', 1, 2]]],
  armoire: ['bois', 85, [['bois', 2, 3], ['clous', 0, 1]], { lourd: 1 }],
  commode: ['bois', 60, [['bois', 1, 2]]],
  buffet: ['bois', 75, [['bois', 2, 3], ['eclats_verre', 0, 1]], { lourd: 1 }],
  malle: ['bois', 50, [['bois', 1, 2], ['clous', 0, 1]]],
  secretaire: ['bois', 60, [['bois', 1, 2]]],
  petrin: ['bois', 50, [['bois', 1, 2]]],
  apothicaire: ['bois', 70, [['bois', 1, 2], ['eclats_verre', 1, 2]], { lourd: 1 }],
  casier_tri: ['bois', 55, [['bois', 1, 2]]],
  sellerie: ['bois', 55, [['bois', 1, 2], ['cuir', 1, 1, 0.3]]],
  boite_tresors: ['bois', 10, [['bois', 1, 1, 0.5]]],
  tronc: ['bois', 35, [['bois', 1, 1], ['ferraille', 1, 1, 0.5]]],
  coffre: ['bois', 50, [['bois', 1, 2], ['clous', 0, 1]]],
  coffre_vieux: ['bois', 50, [['bois', 1, 2]]],
  coffre_outils: ['bois', 50, [['bois', 1, 1], ['clous', 1, 2]]],
  caisse: ['bois', 25, [['bois', 1, 1]]],
  caisses: ['bois', 40, [['bois', 1, 2]]],
  tonneau: ['bois', 35, [['bois', 1, 2]]],
  tonneau_vieux: ['bois', 30, [['bois', 1, 1]]],
  tonneau_pluie: ['bois', 40, [['bois', 1, 2]]],
  etagere: ['bois', 45, [['bois', 1, 2]]],
  lit: ['bois', 60, [['bois', 1, 2], ['toile', 1, 1, 0.4]]],
  jambons: ['bois', 30, [['bois', 1, 1]]],
  charrette: ['bois', 110, [['bois', 3, 4], ['clous', 1, 2]], { lourd: 1 }],
  charrette_renversee: ['bois', 70, [['bois', 2, 3]], { lourd: 1 }],
  brouette: ['bois', 35, [['bois', 1, 1], ['clous', 0, 1]]],
  barque: ['bois', 90, [['bois', 3, 4], ['clous', 0, 1]], { lourd: 1 }],
  cloture: ['bois', 20, [['bois', 1, 1]]],
  cloture_blanche: ['bois', 20, [['bois', 1, 1]]],
  portillon: ['bois', 20, [['bois', 1, 1]]],
  panneau: ['bois', 25, [['bois', 1, 1]]],
  poteau_indicateur: ['bois', 25, [['bois', 1, 1]]],
  poteau_attache: ['bois', 30, [['bois', 1, 1]]],
  lanterne_suspendue: ['bois', 25, [['bois', 1, 1], ['eclats_verre', 1, 1]]],
  bac_fleurs: ['bois', 18, [['bois', 1, 1], ['fleur', 1, 1, 0.5]]],
  jardiniere: ['bois', 25, [['bois', 1, 1], ['fleur', 1, 1, 0.5]]],
  mangeoire: ['bois', 30, [['bois', 1, 1]]],
  nichoir: ['bois', 20, [['bois', 1, 1]]],
  clapier: ['bois', 35, [['bois', 1, 2]]],
  cage_poules: ['bois', 30, [['bois', 1, 1], ['plume', 1, 2, 0.6]]],
  ruche: ['bois', 35, [['bois', 1, 2]]],
  roue_deco: ['bois', 25, [['bois', 1, 1]]],
  treuil: ['bois', 45, [['bois', 1, 2], ['corde', 1, 1, 0.6]]],
  mat_drapeau: ['bois', 50, [['bois', 1, 2], ['toile', 1, 1, 0.5]]],
  corde_linge: ['bois', 20, [['bois', 1, 1], ['corde', 1, 1, 0.5]]],
  sechoir: ['bois', 25, [['bois', 1, 1]]],
  sechoir_peaux: ['bois', 30, [['bois', 1, 1], ['cuir', 1, 1, 0.3]]],
  fers_rack: ['bois', 20, [['bois', 1, 1], ['fer_cheval', 1, 2]]],
  trophee: ['bois', 20, [['bois', 1, 1], ['bois_de_cerf', 1, 1, 0.5]]],
  tas_bois: ['bois', 35, [['bois', 2, 4]]],
  etai: ['bois', 40, [['bois', 1, 2]]],
  horloge: ['bois', 45, [['bois', 1, 1], ['ferraille', 1, 1]]],
  presse: ['bois', 60, [['bois', 1, 2], ['ferraille', 0, 1]]],
  baratte: ['bois', 30, [['bois', 1, 1]]],
  composteur: ['bois', 40, [['bois', 1, 2]]],
  croix_bois: ['bois', 25, [['bois', 1, 1]]],
  arche_fleurie: ['bois', 40, [['bois', 1, 2], ['fleur', 0, 2]]],
  pergola: ['bois', 60, [['bois', 2, 3]], { lourd: 1 }],
  haie: ['bois', 25, [['fibre', 1, 2], ['bois', 0, 1]]],
  // --- la paille et la toile : n'importe quel outil
  botte_foin: ['paille', 15, [['foin', 2, 3]]],
  meule: ['paille', 30, [['foin', 3, 5]]],
  sac: ['tissu', 8, [['toile', 1, 1, 0.3]]],
  sacs: ['tissu', 15, [['toile', 1, 1, 0.5]]],
  tente: ['tissu', 40, [['toile', 1, 2], ['bois', 0, 1]]],
  parasol: ['tissu', 20, [['toile', 1, 1, 0.6], ['bois', 0, 1]]],
  filet: ['tissu', 15, [['corde', 1, 1, 0.7]]],
  nasse: ['tissu', 10, [['fibre', 1, 2]]],
  // --- la pierre : la pioche
  cloture_pierre: ['pierre', 55, [['pierre', 2, 3]]],
  bloc_pierre: ['pierre', 60, [['pierre', 2, 4]]],
  cairn: ['pierre', 40, [['pierre', 2, 3]]],
  stalagmite: ['pierre', 30, [['pierre', 1, 2]]],
  gravats: ['pierre', 20, [['pierre', 1, 2]]],
  abreuvoir: ['pierre', 70, [['pierre', 2, 3]]],
  meule_aiguiser: ['pierre', 60, [['pierre', 1, 2]]],
  banc_pierre: ['pierre', 70, [['pierre', 2, 3]]],
  statue: ['pierre', 120, [['pierre', 2, 4]], { lourd: 1 }],
  statue_cerf: ['pierre', 130, [['pierre', 3, 4]], { lourd: 1 }],
  statue_saint: ['pierre', 120, [['pierre', 2, 3]], { lourd: 1 }],
  puits_deco: ['pierre', 90, [['pierre', 3, 4]], { lourd: 1 }],
  bassin: ['pierre', 80, [['pierre', 2, 3]]],
  fontaine_jardin: ['pierre', 110, [['pierre', 3, 4]], { lourd: 1 }],
  fumoir: ['pierre', 70, [['pierre', 2, 3]]],
  moulin_a_bras: ['pierre', 60, [['pierre', 2, 2]]],
  coffre_nain: ['pierre', 150, [['pierre', 2, 3]], { lourd: 1 }],
  os_geant: ['pierre', 60, [['os', 2, 3]]],
  tombe: ['pierre', 60, [['pierre', 1, 2]], { prof: 'tombe' }],
  croix: ['pierre', 45, [['pierre', 1, 1]], { prof: 'tombe' }],
  calvaire: ['pierre', 140, [['pierre', 2, 4]], { prof: 'calvaire', lourd: 1 }],
  // --- le métal : la pioche (les pièces lourdes veulent au moins une pioche de fer)
  lampadaire: ['metal', 70, [['ferraille', 1, 2], ['eclats_verre', 1, 1]]],
  enclume: ['metal', 180, [['ferraille', 2, 3], ['lingot_fer', 1, 1, 0.5]], { tier: 2, lourd: 1 }],
  wagonnet: ['metal', 90, [['ferraille', 2, 3]], { tier: 1, lourd: 1 }],
  poubelle: ['metal', 30, [['ferraille', 1, 1]]],
  boite_poste: ['metal', 45, [['ferraille', 1, 1]]],
  coffre_fort: ['metal', 220, [['ferraille', 2, 3]], { tier: 2, lourd: 1 }],
  girouette: ['metal', 30, [['ferraille', 1, 1]]],
  arroseur: ['metal', 25, [['ferraille', 1, 1]]],
  arroseur_fer: ['metal', 35, [['ferraille', 1, 2]]],
  cage: ['metal', 35, [['ferraille', 1, 1]]],
  epouvantail_fer: ['metal', 60, [['ferraille', 1, 2], ['toile', 1, 1, 0.5]]],
  // --- la poterie, le verre : n'importe quel outil, ou le marteau
  jarre: ['poterie', 6, [['argile', 1, 1, 0.5]]],
  pot_fleurs: ['poterie', 4, [['argile', 1, 1, 0.5], ['fleur', 1, 1, 0.5]]],
  nain_jardin: ['poterie', 4, [['argile', 1, 1, 0.5]]],
  lanterne_sol: ['verre', 4, [['eclats_verre', 1, 1], ['ferraille', 1, 1, 0.3]]],
};

// ---------------------------------------------------------------- ce qui se ramasse (E) : l'objet d'inventaire, le libellé
const OBJ_RAMASSE = {
  bougie: { item: 'bougie', lab: 'Prendre la bougie' },
  lanterne_sol: { item: 'lanterne_sol', lab: 'Prendre la lanterne' },
  lanterne_suspendue: { item: 'lanterne_suspendue', lab: 'Décrocher la lanterne' },
  lanterne_grande: { item: 'lanterne', lab: 'Prendre la lanterne' },
  chaise: { item: 'chaise', lab: 'Prendre la chaise' },
  pot_fleurs: { item: 'pot_fleurs', lab: 'Prendre le pot de fleurs' },
  nain_jardin: { item: 'nain_jardin', lab: 'Prendre le nain de jardin' },
  citrouille: { item: 'citrouille_sculptee', lab: 'Prendre la citrouille' },
  tapis: { item: 'tapis', lab: 'Rouler le tapis' },
  livre: { item: 'livre_abime', lab: 'Prendre le livre' },
  poupee: { item: 'poupee_vieille', lab: 'Prendre la poupée' },
  ossements: { item: 'os', n: 2, lab: 'Ramasser les os' },
  sac: { item: 'sac_grain', lab: 'Charger le sac de grain' },
};

// ---------------------------------------------------------------- ce qui ne se casse ni ne se ramasse (quêtes, mécanismes, décor fixe)
const OBJ_JAMAIS = new Set(['pierre_trois', 'autel', 'dormeur', 'statue_dieu', 'eboulis', 'trappe', 'echelle', 'echelle_bois', 'bouche_mine', 'sigle',
  'stele', 'panneau_carte', 'panneau_affichage', 'affiche_recherche', 'poteau_dir', 'coffre_enterre', 'coffre_tresor', 'fleur_lune', 'champi_fees',
  'relique_sol', 'tombe_lise', 'tombe_neuve', 'tombe_chien', 'niche', 'gamelle', 'coffre_loc', 'ecriteau_louer', 'miroir', 'peinture', 'cheminee',
  'four', 'four_pain', 'feu_camp', 'feu_geant', 'lit_geant', 'pierre_cerf', 'pierre_offrandes', 'pierre_dame', 'pierre_dressee', 'pierre_gravee',
  'autel_maison', 'dolmen', 'fente_falaise', 'grotte_bouche', 'entree_grotte', 'paroi_fendue', 'niche_frappeurs', 'porte_grille', 'soupirail',
  'pierre_mur', 'chaine_mur', 'grille_cachot', 'grille_courte', 'paillasse', 'seau_cachot', 'lanterne_cachot', 'table_alchimie', 'alambic',
  'alambic_cru', 'vitrine', 'benitier', 'cloche_noyee', 'cloche', 'cascade', 'trou_glace', 'pont_bois', 'ponton', 'rails', 'monument', 'cible',
  'stand_tombola', 'quilles_piste', 'tente_diseuse', 'porte_cierges', 'balancoire', 'squelette', 'potager', 'charbonniere', 'moulin_ailes',
  'epouvantail', 'caisse_expedition', 'etabli', 'piege', 'piege_loup', 'comptoir', 'enseigne', 'lettre', 'sang', 'traces', 'trou', 'fouille',
  'ev_cratere', 'allee', 'dalle', 'plancher', 'parterre', 'mare', 'sapling', 'pain_etal', 'etal_complet', 'etal', 'figurine', 'rubans']);
// les interactions qui, attachées à un objet (ou tout contre), le rendent intouchable
const OBJ_KINDS_PROTEGES = new Set(['note', 'inscription', 'sign', 'mapboard', 'lire', 'painting', 'mirror', 'ladder', 'grimper', 'cellar', 'deep',
  'crypt', 'dig', 'registry', 'altar', 'autel_aela', 'autel_vesh', 'pierre_trois', 'dormeur', 'tombeau', 'temple_entree', 'louer', 'archives_livre',
  'alch_table', 'alambic', 'mailbox', 'water', 'cook', 'bed', 'rentbed', 'refuge', 'leg_spot', 'f2_trappe', 'benitier', 'peche_glace', 'affiche',
  'arrivages', 'book_legends', 'fente_nains', 'sigle', 'borne', 'chest', 'bell', 'oldwell', 'abbey_stone', 'fees', 'relic', 'pickup', 'lise',
  'eboulis', 'cave', 'forage', 'moonflower', 'dream', 'bain', 'station', 'ship', 'feeder', 'clue', 'frappeurs', 'paroi', 'pray', 'fond_trappe',
  'abreuvoir', 'fer_mesnie', 'ev_cratere', 'ev_poussiere', 'avis_recherche', 'guichet_mairie', 'slender_page']);
// ce qui appartient à la commune, même devant une maison (réverbères, mât du drapeau, poubelles, abreuvoirs, statues…)
const OBJ_COMMUNS = new Set(['lampadaire', 'mat_drapeau', 'poubelle', 'poteau_attache', 'abreuvoir', 'statue', 'statue_saint', 'statue_cerf',
  'fontaine_jardin', 'puits_deco', 'poteau_indicateur', 'panneau', 'banc', 'banc_pierre', 'bassin', 'cairn', 'calvaire', 'croix', 'tombe']);
// les propriétés qu'un objet posé peut porter sans être « marqué » par un autre module (quête, fouille du jour, étal, affiche…)
const OBJ_CLES_SURES = new Set(['id', 'x', 'y', 'z', 'r', 's', 'data', 'blk', 'ver', 'f2', 'rig', 'gone', 'blkOff', 'v', 'tilt', 'roue', '_grace']);
const OBJ_TOMBES = new Set(['tombe', 'croix', 'calvaire']);

// ---------------------------------------------------------------- ce qu'on dit
const OBJ_CRIS = {
  casse: {
    proprio: ['Mes meubles ! Vous êtes fou ?! Arrêtez tout de suite !', 'Qu’est-ce qui vous prend ?! Lâchez ça ! Au garde !', 'Chez moi ! Vous cassez tout chez moi ! Au secours !'],
    temoin: ['Hé ! Vous cassez les affaires de {victime} ?!', 'Au garde ! On saccage tout chez {victime} !', 'Arrêtez ! Ce n’est pas à vous, tout ça !'],
    public: ['Hé ! Qu’est-ce que vous cassez là ?!', 'Au garde ! On casse tout, ici !', 'Arrêtez ! C’est à la commune, ça !'],
  },
  dehors: {
    proprio: ['Hé ! C’est à moi, ça ! Arrêtez !', 'Qu’est-ce qui vous prend ?! Lâchez ça ! Au garde !', 'Vous êtes fou ?! Laissez mes affaires tranquilles !'],
    temoin: ['Hé ! Vous cassez les affaires de {victime} ?!', 'Au garde ! On casse tout devant chez {victime} !', 'Arrêtez ! Ce n’est pas à vous, tout ça !'],
    public: ['Hé ! Qu’est-ce que vous cassez là ?!', 'Au garde ! On casse tout, ici !', 'Arrêtez ! C’est à la commune, ça !'],
  },
  porte: {
    proprio: ['Qui est là ?! Qui défonce ma porte ?! Au garde !', 'Arrêtez ! Au secours ! On enfonce ma porte !', 'Ma porte ! Au voleur ! À l’aide !'],
    temoin: ['Hé ! Vous enfoncez la porte de {victime} ?!', 'Au garde ! On force la porte de {victime} !', 'Arrêtez ! Au voleur ! On force une porte !'],
    public: ['Hé ! Qu’est-ce que vous faites à cette porte ?!', 'Au garde ! On enfonce une porte !', 'Arrêtez ! Au voleur !'],
  },
  vol: {
    proprio: ['Hé ! Reposez ça ! C’est à moi !', 'Au voleur ! Chez moi, sous mes yeux !', 'Vous vous servez, maintenant ? Reposez ça !'],
    temoin: ['Hé ! Ce n’est pas à vous, ça ! C’est à {victime} !', 'Au voleur ! Là, chez {victime} !', 'Reposez ça ! Ce n’est pas chez vous !'],
    public: ['Hé ! Ce n’est pas à vous, ça !', 'Au voleur ! On se sert, là !', 'Je vous vois, vous ! Reposez ça !'],
  },
  volDehors: {
    proprio: ['Hé ! Reposez ça ! C’est à moi !', 'Au voleur ! Devant chez moi, sous mes yeux !', 'Vous vous servez, maintenant ? Reposez ça !'],
    temoin: ['Hé ! Ce n’est pas à vous, ça ! C’est à {victime} !', 'Au voleur ! Là, devant chez {victime} !', 'Reposez ça ! Ce n’est pas à vous !'],
    public: ['Hé ! Ce n’est pas à vous, ça !', 'Au voleur ! On se sert, là !', 'Je vous vois, vous ! Reposez ça !'],
  },
  profane: {
    proprio: ['Sacrilège ! Au garde ! Au curé !', 'Profanation ! Vous n’avez donc rien de sacré ?!', 'Mon Dieu… Arrêtez ! Arrêtez ça tout de suite !'],
    temoin: ['Sacrilège ! Au garde ! Au curé !', 'Profanation ! Vous n’avez donc rien de sacré ?!', 'Mon Dieu… Arrêtez ! Arrêtez ça tout de suite !'],
    public: ['Sacrilège ! Au garde ! Au curé !', 'Profanation ! Vous n’avez donc rien de sacré ?!', 'Mon Dieu… Arrêtez ! Arrêtez ça tout de suite !'],
  },
};
const OBJ_TEMOIN_ABANDON = ['Laissez donc les affaires des disparus. Ça porte malheur.', 'Ce n’est plus chez personne, ici. Ce n’est pas une raison pour tout casser.'];
const OBJ_TEMOIN_MORT = ['Laissez les affaires de {victime} ! Vous n’avez pas honte ?', 'On n’a pas encore fini de pleurer {victime}, et vous touchez déjà à ses affaires ?'];
const OBJ_PLAINTES = {
  porte: ['On a enfoncé ma porte, cette nuit. À la hache. Qui fait des choses pareilles ?', 'Vous avez vu ma porte ? Quelqu’un l’a défoncée. Je dors avec une chaise contre, maintenant.', 'On est entré chez moi en défonçant la porte. Le garde dit qu’il cherche. Il ne cherche rien du tout.'],
  casse: ['Quelqu’un est entré chez moi et a tout cassé. Des années de travail, en morceaux.', 'On a saccagé chez moi. Rien volé, ou presque : cassé. C’est pire, je trouve.', 'Mes affaires sont en miettes. Si je tenais celui qui a fait ça…'],
  vol: ['Il me manque des affaires. Quelqu’un est entré chez moi, j’en ai la certitude.', 'On m’a pris des choses. De petites choses. Mais on me les a prises.'],
  dehors: ['On m’a cassé des affaires devant la maison, cette nuit. Des vauriens, sûrement. Il y en a toujours.', 'Quelqu’un s’en est pris à ce que j’avais devant chez moi. Je ne comprends pas qu’on fasse des choses pareilles.'],
  volDehors: ['On m’a pris des choses devant chez moi. On ne peut même plus laisser un seau dehors.', 'Il manque des affaires, devant la maison. Hier soir, elles y étaient.'],
};
const OBJ_PENSEES = {
  tier: '(Le fer résiste : il faudrait au moins une pioche {t}.)',
  machine: '(Quelque chose travaille encore là-dedans.)',
  porteOutil: '(Une porte, ça s’enfonce à la hache.)',
  porteCede: '(La serrure pend, arrachée.)',
  porteCassee: '(La porte ne ferme plus.)',
  tombe: '(Sous la terre, quelque chose a remué.)',
  calvaire: '(Le vent se tait d’un coup.)',
};

// ---------------------------------------------------------------- bruits : coups et casse, selon la matière
Object.assign(SoundEngine.prototype, {
  objetCoup(m, k = 1) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random;
    if (m === 'bois') { this.noiseHit(t, 0.09, 'bandpass', 360 + R() * 90, 1.3, 0.13 * k); this.tone(t, 'triangle', 180 + R() * 30, 110, 0.07, 0.05 * k); this.noiseHit(t + 0.02, 0.05, 'highpass', 2200, 0.8, 0.03 * k); }
    else if (m === 'pierre') { this.noiseHit(t, 0.06, 'bandpass', 1300 + R() * 400, 1.4, 0.09 * k); this.tone(t, 'triangle', 950, 620, 0.05, 0.035 * k); for (let i = 0; i < 3; i++) this.noiseHit(t + 0.06 + i * 0.05 + R() * 0.03, 0.04, 'bandpass', 2400 + R() * 900, 2, 0.025 * k); }
    else if (m === 'metal') { this.tone(t, 'triangle', 1050 + R() * 250, 980, 0.32, 0.05 * k); this.tone(t, 'sine', 2350 + R() * 200, 2300, 0.5, 0.018 * k); this.noiseHit(t, 0.04, 'bandpass', 3200, 1.5, 0.05 * k); }
    else if (m === 'paille' || m === 'tissu') { this.noiseHit(t, 0.14, 'bandpass', m === 'paille' ? 1600 : 1100, 0.7, 0.07 * k); }
    else this.noiseHit(t, 0.05, 'bandpass', 2400, 1.5, 0.05 * k);
  },
  objetCasse(m, gros) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, g = gros ? 1 : 0.7;
    if (m === 'bois') {
      for (let i = 0; i < 5; i++) this.noiseHit(t + i * 0.045 + R() * 0.02, 0.07, 'bandpass', 520 + R() * 500, 1.1, 0.1 * g);
      this.tone(t + 0.02, 'triangle', 110, 48, 0.25, 0.08 * g);
      if (gros) { this.voice(t + 0.05, 'sawtooth', 150, 60, 0.45, 0.018, this.sfx, { lp: 700 }); this.noiseHit(t + 0.32, 0.35, 'lowpass', 380, 0.7, 0.12); }
    } else if (m === 'pierre') {
      for (let i = 0; i < 7; i++) this.noiseHit(t + i * 0.06 + R() * 0.04, 0.12, 'lowpass', 700 + R() * 700, 0.8, 0.09 * g * (1 - i * 0.1));
      this.tone(t, 'sine', 90, 45, 0.35, 0.09 * g);
    } else if (m === 'metal') {
      this.tone(t, 'triangle', 620, 330, 0.7, 0.06 * g); this.tone(t, 'sine', 1580, 1500, 0.9, 0.02 * g);
      for (let i = 0; i < 4; i++) this.tone(t + 0.12 + i * 0.09 + R() * 0.04, 'triangle', 1800 + R() * 1400, 1500, 0.08, 0.02 * g);
      this.noiseHit(t + 0.05, 0.3, 'bandpass', 900, 1, 0.05 * g);
    } else if (m === 'verre') {
      this.noiseHit(t, 0.25, 'highpass', 4200, 0.7, 0.09);
      for (let i = 0; i < 9; i++) this.tone(t + i * 0.025 + R() * 0.05, 'sine', 2600 + R() * 3200, 2400 + R() * 2000, 0.06 + R() * 0.12, 0.018);
    } else if (m === 'poterie') {
      this.noiseHit(t, 0.12, 'bandpass', 1700, 1.2, 0.09);
      for (let i = 0; i < 5; i++) this.tone(t + 0.03 + i * 0.05 + R() * 0.03, 'triangle', 1300 + R() * 1400, 1100, 0.05, 0.025);
    } else {
      this.noiseHit(t, 0.35, 'bandpass', 2000, 0.7, 0.08, null, 700);
      this.noiseHit(t + 0.18, 0.2, 'lowpass', 700, 0.7, 0.05);
    }
  },
  objetPorte() {
    if (!this.ok) return;
    const t = this.at(), R = Math.random;
    for (let i = 0; i < 6; i++) this.noiseHit(t + i * 0.035 + R() * 0.02, 0.08, 'bandpass', 480 + R() * 420, 1.1, 0.13);
    this.tone(t, 'triangle', 95, 42, 0.4, 0.1);
    this.tone(t + 0.1, 'square', 760, 520, 0.06, 0.03); this.tone(t + 0.2, 'triangle', 1900, 1700, 0.18, 0.02);
    this.voice(t + 0.25, 'sawtooth', 210, 120, 0.7, 0.014, this.sfx, { bp: 700, q: 2.5 });
  },
});

// ---------------------------------------------------------------- utilitaires
const OBJ_M = new Float32Array(12);
// le modèle d'un objet posé, relevé une fois (par identifiant, variante et données : une charrette chargée n'a pas la forme
// d'une charrette vide) : ses boîtes { M (3 × 4, comme m34TR), h (demi-tailles) } et sa boîte englobante, repère de l'objet
const OBJ_MODELES = new Map();
function objModele(q) {
  if (typeof q === 'string') q = { id: q };
  let k = q.id + '|' + (q.v ?? '');
  if (q.data) { try { k += '|' + JSON.stringify(q.data); } catch (e) { /* rien */ } }
  const c = OBJ_MODELES.get(k);
  if (c) return c;
  const fn = PROP_MODELS[q.id], L = [];
  let ok = !!fn;
  if (fn) {
    const rec = (cx, cy, cz, sx, sy, sz, ry, rx, rz) => {
      if (![cx, cy, cz, sx, sy, sz].every(Number.isFinite) || L.length > 120) return;
      const M = m34TR(new Float32Array(12), cx, cy, cz, rx || 0, ry || 0, rz || 0);
      L.push({ M, h: [Math.max(0.012, Math.abs(sx) / 2), Math.max(0.012, Math.abs(sy) / 2), Math.max(0.012, Math.abs(sz) / 2)] });
    };
    const E = { M: new Float32Array(12), _L: new Float32Array(12), _O: new Float32Array(12), fl: 0, tint: null, buf: { box() {} },
      box(cx, cy, cz, sx, sy, sz, col, code, ry, rx, rz) { rec(cx, cy, cz, sx, sy, sz, ry, rx, rz); },
      bx(cx, y0, cz, sx, sy, sz, col, code, ry, rx, rz) { rec(cx, y0 + sy / 2, cz, sx, sy, sz, ry, rx, rz); }, frame() {} };
    const b0 = PE.buf;
    PE.buf = { box() {} }; // (un modèle qui dessinerait directement par PE ne laisse rien derrière lui)
    let data = {};
    try { if (q.data) data = JSON.parse(JSON.stringify(q.data)); } catch (e) { data = {}; }
    try { fn(E, { id: q.id, x: 0, y: 0, z: 0, r: 0, s: 1, v: q.v, data }, { night: false, t: 0, wind: 0, hour: 12 }); } catch (e) { ok = false; }
    PE.buf = b0;
  }
  let bb = null;
  if (L.length) {
    const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
    for (const B of L) for (let i = 0; i < 3; i++) {
      const e = Math.abs(B.M[i * 4]) * B.h[0] + Math.abs(B.M[i * 4 + 1]) * B.h[1] + Math.abs(B.M[i * 4 + 2]) * B.h[2], m = B.M[i * 4 + 3];
      mn[i] = Math.min(mn[i], m - e); mx[i] = Math.max(mx[i], m + e);
    }
    bb = { x0: mn[0], x1: mx[0], y0: mn[1], y1: mx[1], z0: mn[2], z1: mx[2] };
  }
  const r = { bb, formes: ok && L.length && L.length <= 120 ? L : null };
  if (OBJ_MODELES.size > 800) OBJ_MODELES.clear();
  OBJ_MODELES.set(k, r);
  return r;
}
const objMesure = (q) => objModele(q).bb;
const objFormes = (q) => objModele(q).formes;
const objCol = (c, k) => [clamp(c[0] / 255 * k, 0, 1), clamp(c[1] / 255 * k, 0, 1), clamp(c[2] / 255 * k, 0, 1)];

// ============================================================================
//  LE MODULE
// ============================================================================
const objets = {
  eclats: [], cache: new WeakMap(), hotes: new WeakMap(), alertes: {}, penseT: {}, f2c: null,

  // ------------------------------------------------------------------ l'état sauvegardé
  S() {
    const s = farm.s;
    if (!s) return null;
    const S = s.casse || (s.casse = {});
    if (!S.v) Object.assign(S, { v: 1, n: 0, r: 0, pris: 0 });
    for (const k of ['pv', 'portes', 'inters', 'plaintes']) if (!S[k] || typeof S[k] !== 'object' || Array.isArray(S[k])) S[k] = {};
    for (const k of ['tas', 'debris']) if (!Array.isArray(S[k])) S[k] = [];
    return S;
  },
  // on n'agit que dans la vallée, hors de l'Envers, des mondes « à part », du cachot et des cinématiques
  actif() {
    if (!farm.s || !farm.on || farm.s.over || game.kind !== 'farm' || !game.world || game.world !== farm.w || game.dying || game.sleeping) return false;
    try {
      if (typeof cine !== 'undefined' && cine.on) return false;
      if (typeof strange !== 'undefined' && strange.inEnvers && strange.inEnvers()) return false;
      if (typeof mondes !== 'undefined' && mondes.actuel && mondes.actuel() && mondes.aPart && mondes.aPart()) return false;
      if (typeof prison !== 'undefined' && prison.S && prison.S() && prison.S().actif) return false;
    } catch (e) { return false; }
    return true;
  },
  pense(k, texte, d) { const t = performance.now(); if ((this.penseT[k] || 0) > t) return; this.penseT[k] = t + 7000; ui.subtitle('', texte, d || 2.8); },

  // ------------------------------------------------------------------ la boîte d'un objet (monde) : sa collision, sinon son modèle
  // (modele : la boîte englobante du modèle plutôt que la collision, pour viser ; large : un peu plus grande, pour les petits objets)
  boite(q, large, modele) {
    const c = PROP_COLL[q.id], s = q.s || 1, bb = !c || modele ? objMesure(q) : null;
    let hx, hz, y0, y1, cx = 0, cz = 0;
    if (bb && Math.max(bb.x1 - bb.x0, bb.y1 - bb.y0, bb.z1 - bb.z0) <= 4) {
      hx = (bb.x1 - bb.x0) / 2 * s; hz = (bb.z1 - bb.z0) / 2 * s; cx = (bb.x0 + bb.x1) / 2 * s; cz = (bb.z0 + bb.z1) / 2 * s; y0 = bb.y0 * s; y1 = bb.y1 * s;
    } else if (c) { hx = c[0] * s; hz = c[1] * s; y0 = 0; y1 = c[2] * s; }
    else return null; // ponts, ailes de moulin, échelles : pas de boîte
    const m = large ? 0.08 : 0.02, mn = large ? 0.15 : 0.05;
    hx = Math.max(hx + m, mn); hz = Math.max(hz + m, mn);
    if (y1 - y0 < (large ? 0.24 : 0.08)) y1 = y0 + (large ? 0.24 : 0.08);
    const r = q.r || 0, co = Math.cos(r), si = Math.sin(r);
    return { x: q.x + cx * co + cz * si, y: q.y + y0, z: q.z - cx * si + cz * co, sx: hx * 2, sy: y1 - y0, sz: hz * 2, r };
  },
  distBoite(B, x, z) { const [lx, lz] = World.blockLocal(B, x, z); return Math.hypot(Math.max(0, Math.abs(lx) - B.sx / 2), Math.max(0, Math.abs(lz) - B.sz / 2)); },
  // le rayon sur les boîtes du modèle : { t, lp (point), ln (normale) dans le repère de l'objet, n (normale, monde) } ; null s'il
  // passe entre elles ; undefined si le modèle n'a pas de boîtes lisibles (la boîte englobante suffit alors)
  rayForme(q, eye, f) {
    const L = objFormes(q);
    if (!L) return undefined;
    const r = q.r || 0, s = q.s || 1, c = Math.cos(r), n = Math.sin(r);
    const dx = eye[0] - q.x, dy = eye[1] - q.y, dz = eye[2] - q.z;
    const lo = [(c * dx - n * dz) / s, dy / s, (n * dx + c * dz) / s], ld = [(c * f[0] - n * f[2]) / s, f[1] / s, (n * f[0] + c * f[2]) / s];
    let best = null;
    for (const B of L) {
      const M = B.M, px = lo[0] - M[3], py = lo[1] - M[7], pz = lo[2] - M[11];
      const o = [M[0] * px + M[4] * py + M[8] * pz, M[1] * px + M[5] * py + M[9] * pz, M[2] * px + M[6] * py + M[10] * pz];
      const d = [M[0] * ld[0] + M[4] * ld[1] + M[8] * ld[2], M[1] * ld[0] + M[5] * ld[1] + M[9] * ld[2], M[2] * ld[0] + M[6] * ld[1] + M[10] * ld[2]];
      let tn = -Infinity, tf = Infinity, ax = -1, sg = 0, ok = true;
      for (let a = 0; a < 3; a++) {
        const h = B.h[a];
        if (Math.abs(d[a]) < 1e-9) { if (o[a] < -h || o[a] > h) { ok = false; break; } continue; }
        let t1 = (-h - o[a]) / d[a], t2 = (h - o[a]) / d[a], g = -1;
        if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; g = 1; }
        if (t1 > tn) { tn = t1; ax = a; sg = g; }
        if (t2 < tf) tf = t2;
        if (tn > tf || tf < 0) { ok = false; break; }
      }
      if (!ok || tn < 0 || ax < 0 || (best && tn >= best.t)) continue;
      best = { t: tn, ln: [M[ax] * sg, M[4 + ax] * sg, M[8 + ax] * sg] };
    }
    if (!best) return null;
    best.lp = [lo[0] + ld[0] * best.t, lo[1] + ld[1] * best.t, lo[2] + ld[2] * best.t];
    best.n = [c * best.ln[0] + n * best.ln[2], best.ln[1], -n * best.ln[0] + c * best.ln[2]];
    return best;
  },
  // un objet posé par le joueur (sauvegardé dans farm.s.props)
  aJoueur(q) { return farm.s.props.some((p) => p.id === q.id && Math.abs(p.x - q.x) < 0.01 && Math.abs(p.z - q.z) < 0.01); },
  cle(q, i) {
    if (i === undefined) i = game.world.props.indexOf(q);
    return i >= 0 && i < farm.genProps ? 'p:' + i : 'j:' + q.id + ':' + Math.round(q.x * 10) + ':' + Math.round(q.z * 10);
  },
  // les fouilles déjà attachées à un meuble (q.f2)
  f2Pris() {
    const w = game.world;
    if (this.f2c && this.f2c.n === w.props.length && this.f2c.w === w) return this.f2c.set;
    const set = new Set();
    for (const q of w.props) if (q.f2) set.add(q.f2);
    this.f2c = { n: w.props.length, w, set };
    return set;
  },
  // l'objet qui « porte » une interaction : le plus proche (collision ou objet cassable), à moins d'un mètre
  hote(it, ids) {
    const w = game.world, stamp = w.props.length + (ids ? ':t' : '');
    const c = this.hotes.get(it);
    if (c && c.stamp === stamp) return c.q;
    let best = null, bd = 1.0;
    for (const q of w.props) {
      if (!w.live(q) || Math.abs(q.x - it.x) > 3 || Math.abs(q.z - it.z) > 3) continue;
      if (ids ? !ids.has(q.id) : !(PROP_COLL[q.id] || OBJ_CASSE[q.id])) continue;
      const B = this.boite(q);
      if (!B || it.y < B.y - 1.2 || it.y > B.y + B.sy + 1.6) continue;
      const d = this.distBoite(B, it.x, it.z);
      if (d < bd) { bd = d; best = q; }
    }
    this.hotes.set(it, { stamp, q: best });
    return best;
  },
  zoneInterdite(q) {
    const w = game.world, lm = w.lm || {};
    for (const k of ['cachot', 'carriere_cachot']) { const L = lm[k]; if (L && Math.hypot(q.x - L.x, q.z - L.z) < 30) return true; }
    const T = w.temple || lm.temple;
    if (T && Math.hypot(q.x - T.x, q.z - T.z) < 110) return true;
    return false;
  },
  enVille(x, z) { const T = game.world.townInfo; return !!(T && Math.abs(x - T.x) < 46.5 && Math.abs(z - T.z) < 46.5); },

  // ------------------------------------------------------------------ le profil d'un objet : ce qu'on peut en faire
  profil(q) {
    const w = game.world;
    if (!q || !w || !w.live(q)) return null;
    const stamp = w.inter.length * 100003 + w.props.length;
    const c = this.cache.get(q);
    if (c && c.stamp === stamp && c.day === farm.s.day) return c;
    let P;
    try { P = this.calculer(q); } catch (e) { console.error('objets', e); P = { q, protege: 'erreur', liens: [] }; }
    P.stamp = stamp; P.day = farm.s.day;
    this.cache.set(q, P);
    return P;
  },
  calculer(q) {
    const w = game.world, i = w.props.indexOf(q);
    const P = { q, rang: i, gen: i >= 0 && i < farm.genProps, joueur: false, casse: null, ramasse: null, protege: null, liens: [], B: null, cle: null };
    if (i < 0) { P.protege = 'absent'; return P; }
    if (!P.gen) { P.joueur = this.aJoueur(q); if (!P.joueur) { P.protege = 'dynamique'; return P; } }
    P.cle = this.cle(q, i);
    const C = OBJ_CASSE[q.id];
    if (C) P.casse = { mat: C[0], pv: C[1], drops: C[2] || [], opt: C[3] || {} };
    P.ramasse = OBJ_RAMASSE[q.id] || null;
    if (!P.casse && !P.ramasse) { P.protege = 'inconnu'; return P; }
    if (OBJ_JAMAIS.has(q.id) || q.id.startsWith('fond_')) { P.protege = 'mécanisme'; return P; }
    for (const k in q) if (!OBJ_CLES_SURES.has(k)) { P.protege = 'marqué'; return P; }
    if (P.joueur && !PLACEABLES[q.id]) { P.protege = 'joueur'; return P; }
    if (q.id === 'charrette' && (P.joueur || (q.data && q.data.hitched) || (typeof attelage !== 'undefined' && attelage.aMoi && attelage.aMoi(q)))) { P.protege = 'attelage'; return P; }
    if (this.zoneInterdite(q)) { P.protege = 'zone'; return P; }
    if (q.id === 'banc' && this.enVille(q.x, q.z)) { P.protege = 'travaux'; return P; } // les bancs de la place : le tableau de la mairie les fait réparer
    const B = this.boite(q) || { x: q.x, y: q.y, z: q.z, sx: 0.4, sy: 0.5, sz: 0.4, r: q.r || 0 };
    P.B = B;
    if (q.id === 'lit' && P.gen) { const L = this.lieu(q.x, q.y + 0.3, q.z); if (L.t === 'ferme') { P.protege = 'lit de la ferme'; return P; } }
    const f2p = this.f2Pris();
    // (l'agent U1 tient la liste des meubles et de leurs fouilles : quand il est là, c'est la sienne qui fait foi)
    const u1 = this.u1Inter(q);
    if (u1 && typeof u1.kind === 'string' && u1.kind.startsWith('fond_')) { P.protege = 'usage : ' + u1.kind; return P; }
    for (const it of w.inter) {
      if (!it || Math.abs(it.x - q.x) > 4 || Math.abs(it.z - q.z) > 4) continue;
      if (it.y < B.y - 1.5 || it.y > B.y + B.sy + 2) continue;
      const d = it.data || {}, parRang = P.gen && d.prop === i;
      if (it.kind === 'f2' || it.kind === 'f2_trappe') {
        if (d.cache || it.kind === 'f2_trappe') { if (parRang || this.distBoite(B, it.x, it.z) < 0.9) { P.protege = 'cachette'; return P; } continue; }
        if (u1 !== undefined) { if (u1 === it) P.liens.push(it); continue; }
        if (it.id === q.f2 || (!q.f2 && !f2p.has(it.id) && this.hote(it) === q)) P.liens.push(it);
        continue;
      }
      if (it.kind === 'loot') {
        if (u1 !== undefined) { if (u1 === it) P.liens.push(it); continue; }
        if (parRang || (d.prop === undefined && this.hote(it) === q)) P.liens.push(it);
        continue;
      }
      // (l'inscription d'une vieille tombe part avec elle ; jamais celle d'un mort qu'on a enterré : data.who)
      if (it.kind === 'grave') { if (P.casse && P.casse.opt.prof && d.who === undefined && this.hote(it, OBJ_TOMBES) === q) P.liens.push(it); continue; }
      if (parRang) { if (it.kind === 'pray' && q.id === 'calvaire') { P.liens.push(it); continue; } P.protege = 'attaché : ' + it.kind; return P; }
      const k = it.kind || '';
      if (OBJ_KINDS_PROTEGES.has(k) || k.startsWith('f2a') || k.startsWith('k_') || k.startsWith('biblio') || k.startsWith('fond_')) {
        if (this.distBoite(B, it.x, it.z) < 0.35 || this.hote(it) === q) { P.protege = 'usage : ' + k; return P; }
      }
    }
    return P;
  },
  conteneur(q) { try { return !!(typeof butin !== 'undefined' && butin && typeof butin.conteneur === 'function' && butin.conteneur(q)); } catch (e) { return false; } },
  // la fouille que l'agent U1 attache à cet objet (null : aucune ; undefined : U1 absent, on la cherche soi-même)
  u1Inter(q) {
    try { if (typeof butin !== 'undefined' && butin && typeof butin.interDe === 'function') return butin.interDe(q) || null; } catch (e) { /* rien */ }
    return undefined;
  },
  cassable(q) { const P = this.profil(q); return !!(P && P.casse && !P.protege); },
  ramassable(q, P) {
    P = P || this.profil(q);
    if (!P || P.protege || !P.ramasse || !ITEMS[P.ramasse.item]) return false;
    if (PROP_USE[q.id] && (PROP_USE[q.id] !== 'm' || P.joueur)) return false; // ce qui a déjà un usage le garde
    if (HOOKS.propPre[q.id]) return false;
    if (P.joueur && !PLACEABLES[q.id]) return false;
    if (P.liens.length) return false; // une fouille, un butin y tiennent : E les ouvre
    if (this.conteneur(q)) return false; // un conteneur : l'agent U1 le fait fouiller
    return true;
  },

  // ------------------------------------------------------------------ à qui est-ce ? (x, y, z : un point de l'objet)
  // dedans : la maison (lieuBld) ; à moins de 4 m de ses murs : ses abords (à l'habitant ; la cour de la ferme au joueur),
  // sauf pour ce qui est à la commune (commun : réverbère, abreuvoir, statue…) et au cimetière
  lieu(x, y, z, commun) {
    const w = game.world, bl = w.bld || {};
    let bld = null, pres = null, pd = 4;
    for (const k in bl) {
      const b = bl[k];
      if (!b || !b.f || !b.W || !b.D) continue;
      if (Math.abs(b.f.x - x) > 22 || Math.abs(b.f.z - z) > 22 || y < b.f.y - 1.5 || y > b.f.y + 7) continue;
      const [lx, lz] = World.blockLocal({ x: b.f.x, z: b.f.z, r: b.f.r }, x, z), ex = Math.abs(lx) - b.W / 2, ez = Math.abs(lz) - b.D / 2;
      if (ex < -0.05 && ez < -0.05) { bld = k; break; }
      const d = Math.hypot(Math.max(0, ex), Math.max(0, ez));
      if (d < pd && !b.under) { pd = d; pres = k; }
    }
    const C = w.caveAuberge;
    if (!bld && C && Math.abs(y - C.y) < 3.5 && Math.hypot(x - C.x, z - C.z) < 6) bld = 'auberge';
    if (bld) return this.lieuBld(bld);
    const lm = w.lm || {}, ci = lm.cimetiere;
    if (ci && Math.hypot(x - ci.x, z - ci.z) < (ci.r || 13) + 6) return { t: 'cimetiere', own: null, bld: null };
    if (pres && !commun) {
      const L = this.lieuBld(pres);
      if (L.t === 'maison' || L.t === 'commerce') return { t: 'abords', own: L.own, bld: pres };
      if (L.t !== 'abandon') return L; // la cour de la ferme, une maison à louer, la maison d'un mort
    }
    if (this.enVille(x, z)) return { t: 'public', own: null, bld: null };
    const H = lm.hameau;
    if (H && Math.hypot(x - H.x, z - H.z) < 45) { const e = npcs.byId.eleveuse; return { t: 'public', own: e && e.st.alive ? e : null, bld: null }; }
    return { t: 'nature', own: null, bld: null };
  },
  lieuBld(k) {
    if (k === 'ferme' || k === 'poulailler') return { t: 'ferme', own: null, bld: k };
    try { if (typeof locations !== 'undefined' && locations.locataire && locations.locataire(k)) return { t: 'ferme', own: null, bld: k }; } catch (e) { /* rien */ }
    const hab = npcs.list.filter((n) => n.d.home === k && (n.d.age || 30) >= 16), trav = npcs.list.filter((n) => n.d.work === k && n.d.home !== k);
    const vivant = hab.find((n) => n.st.alive) || trav.find((n) => n.st.alive);
    const commerce = SHOP_DOORS.has(k) || k === 'eglise' || k === 'bibliotheque' || k === 'vide6';
    if (vivant) return { t: commerce ? 'commerce' : 'maison', own: vivant, bld: k };
    if (hab.length || trav.length) return { t: 'mort', own: hab[0] || trav[0], bld: k };
    if (typeof LOC_MAISONS !== 'undefined' && LOC_MAISONS[k]) return { t: 'commune', own: null, bld: k };
    return { t: 'abandon', own: null, bld: k };
  },

  // ------------------------------------------------------------------ viser : l'objet ou la porte sous le regard (null si un mur, le sol, un arbre, une bête ou un habitant est devant)
  viser(eye, f, dist) {
    const w = game.world;
    let best = null, bt = dist;
    const R2 = (dist + 3.5) * (dist + 3.5);
    for (const q of w.props) {
      if (!w.live(q)) continue;
      const dx = q.x - eye[0], dz = q.z - eye[2];
      if (dx * dx + dz * dz > R2) continue;
      const B = this.boite(q, false, true);
      if (!B) continue;
      const h = w.raycastBlock(B, eye, f);
      if (!h || h.t >= bt) continue;
      const fm = this.rayForme(q, eye, f);
      if (fm === null) continue; // entre les pieds d'une chaise, sous une table : rien de touché
      if (!fm) { bt = h.t; best = { q, t: h.t, n: h.n }; continue; }
      if (fm.t < bt) { bt = fm.t; best = { q, t: fm.t, n: fm.n, lp: fm.lp, ln: fm.ln }; }
    }
    for (let i = 0; i < w.doors.length; i++) {
      const dr = w.doors[i];
      if (dr.a > 0.5 || dr.deco || Math.abs(dr.x - eye[0]) > dist + 2 || Math.abs(dr.z - eye[2]) > dist + 2) continue;
      const h = w.raycastBlock(w.doorBox(dr), eye, f);
      if (h && h.t < bt) {
        bt = h.t;
        const px = eye[0] + f[0] * h.t - dr.x, pz = eye[2] + f[2] * h.t - dr.z, c = Math.cos(dr.r), n = Math.sin(dr.r);
        best = { dr, i, t: h.t, n: h.n, lp: [c * px - n * pz, eye[1] + f[1] * h.t - dr.y, n * px + c * pz], ln: h.ln };
      }
    }
    if (!best) return null;
    const th = w.raycastTerrain(eye, f, bt);
    if (th && th.t < bt - 0.03) return null;
    const bh = w.raycastBlocks(eye, f, bt);
    if (bh && !bh.block.hidden && bh.t < bt - 0.06) return null;
    const oh = w.raycastObjects(eye, f, bt, false);
    if (oh && oh.t < bt - 0.05) return null;
    const eh = entities.raycast(eye, f, bt);
    if (eh && eh.t < bt) return null;
    const nh = npcs.raycast(eye, f, bt);
    if (nh && nh.t < bt) return null;
    best.p = [eye[0] + f[0] * bt, eye[1] + f[1] * bt, eye[2] + f[2] * bt];
    return best;
  },

  // ------------------------------------------------------------------ un coup d'outil (play.resolveHit) : true si c'est pour nous
  coup(h) {
    if (!this.actif()) return false;
    const { eye, f, kind, id } = h;
    const tier = h.tier === undefined ? -1 : h.tier;
    const c = this.viser(eye, f, kind === 'faux' ? 3.0 : 2.7);
    if (!c) return false;
    if (c.dr) return this.coupPorte(c, h, kind, tier);
    const q = c.q, P = this.profil(q);
    if (!P || !P.casse || P.protege) return false; // le reste : comme avant (éclats de poussière, démontage au marteau…)
    if (kind === 'marteau' && P.joueur) return false; // le marteau démonte ce que le joueur a posé (11-farm-play)
    const M = OBJ_MAT[P.casse.mat], [x, y, z] = c.p;
    const k = M.tout ? (OBJ_OUTILS.has(kind) ? 1 : 0) : (M.k[kind] || 0);
    if (!k) {
      puffAt(x, y, z, M.col, 4, 1.2, P.casse.mat !== 'bois');
      sound.impact && sound.impact(P.casse.mat === 'bois' ? 'soft' : 'hard');
      if (kind !== 'main' && M.besoin) this.pense('outil', M.besoin);
      return true;
    }
    if (P.casse.opt.tier && kind === 'pioche' && tier < P.casse.opt.tier) {
      puffAt(x, y, z, M.col, 4, 1.4, true); sound.objetCoup && sound.objetCoup(P.casse.mat, 0.6);
      const tn = (typeof TIERS !== 'undefined' && TIER_NAMES[TIERS[P.casse.opt.tier]]) || 'de fer';
      this.pense('tier', OBJ_PENSEES.tier.replace('{t}', tn.replace("'", '’')));
      return true;
    }
    if (q.data && q.data.m && MACHINES[q.id]) { sound.impact && sound.impact('soft'); this.pense('machine', OBJ_PENSEES.machine); return true; }
    const base = Array.isArray(TOOL_DMG[kind]) ? TOOL_DMG[kind][Math.max(0, Math.min(TOOL_DMG[kind].length - 1, tier))] : (TOOL_DMG[kind] || OBJ_DMG[kind] || 4);
    const dmg = base * k * (BUFF.on('force') ? 2 : 1);
    const S = this.S(), key = P.cle, E = S.pv[key] || { d: 0, j: farm.s.day };
    E.d += dmg; E.j = farm.s.day;
    this.marque(E, c);
    this.impact(P.casse.mat, [x, y, z], c.n, dmg / P.casse.pv);
    if (E.d < P.casse.pv) {
      S.pv[key] = E;
      if (P.casse.pv > 25) this.ecoute({ acte: 'casse', q, P, cle: key, pos: [q.x, y, q.z] }, P.casse.opt.lourd ? 0.35 : 0.25);
      return true;
    }
    delete S.pv[key];
    this.casser(q, P, [x, y, z]);
    return true;
  },
  // l'endroit du coup (repère de l'objet ou de la porte), pour y dessiner les fissures
  marque(E, c) {
    if (!c.lp || !c.ln) return;
    const r2 = (v) => Math.round(v * 100) / 100;
    (E.h || (E.h = [])).push([...c.lp.map(r2), ...c.ln.map(r2)]);
    if (E.h.length > 6) E.h.shift();
  },
  // les éclats d'un coup
  impact(m, p, n, k) {
    const M = OBJ_MAT[m], nx = n ? n[0] : 0, nz = n ? n[2] : 0;
    puffAt(p[0] + nx * 0.05, p[1], p[2] + nz * 0.05, M.col, 5 + Math.round(Math.min(1, k) * 6), 1.6, m === 'pierre' || m === 'metal');
    const nb = m === 'verre' || m === 'poterie' ? 0 : 1 + (Math.random() < 0.5 ? 1 : 0);
    for (let i = 0; i < nb; i++) this.eclat(m, p[0] + nx * 0.08, p[1], p[2] + nz * 0.08, nx * 2.2, nz * 2.2, 0.55);
    sound.objetCoup && sound.objetCoup(m, 1);
    if (m === 'pierre' || m === 'metal') play.clank = (play.clank || 0) + 1;
  },

  // ------------------------------------------------------------------ casser
  casser(q, P, p) {
    const w = game.world, S = this.S(), m = P.casse.mat, gros = !!P.casse.opt.lourd || P.casse.pv >= 70;
    const B = P.B || this.boite(q) || { x: q.x, y: q.y, z: q.z, sx: 0.5, sy: 0.6, sz: 0.5, r: q.r || 0 };
    const L = P.joueur ? { t: 'ferme', own: null, bld: null } : this.lieu(q.x, q.y + Math.min(0.6, B.sy / 2), q.z, OBJ_COMMUNS.has(q.id));
    const centre = [B.x, B.y + B.sy * 0.45, B.z];
    // le contenu : ce que l'agent U1 y garde, ou ce que le joueur y avait rangé
    let contenu = [];
    if (this.conteneur(q) || P.liens.some((it) => it.kind === 'f2' || it.kind === 'loot')) contenu = this.vider(q);
    if (P.joueur && q.data && q.data.items) for (const k in q.data.items) if (q.data.items[k] > 0 && ITEMS[k]) contenu.push([k, q.data.items[k]]);
    // les interactions qui tenaient à lui (fouille, butin, inscription d'une tombe, prière au calvaire)
    for (const it of P.liens) this.oterInter(it);
    this.retirer(q);
    // les matériaux
    for (const [item, a, b, pr] of P.casse.drops) {
      if (!ITEMS[item] || (pr !== undefined && Math.random() > pr)) continue;
      const n = a + Math.floor(Math.random() * (b - a + 1));
      if (n > 0) { farm.give(item, n); play.flyer(item, centre, n); }
    }
    if (contenu.length) this.poserTas(B, contenu, L);
    this.eclater(m, B, gros);
    this.poserDebris(m, B, gros);
    sound.objetCasse && sound.objetCasse(m, gros);
    if (gros) game.shakeT = Math.max(game.shakeT || 0, 0.18);
    S.n = (S.n || 0) + 1;
    this.consequences('casse', { q, P, L, cle: P.cle, pos: centre });
    return true;
  },
  // ce que l'agent U1 garde dans le conteneur ([[id, n], …], 'argent' pour les pièces) ; sans lui, rien
  vider(q) {
    try {
      if (typeof butin === 'undefined' || !butin || typeof butin.vider !== 'function') return [];
      const r = butin.vider(q);
      if (!Array.isArray(r)) return [];
      return r.filter((e) => Array.isArray(e) && (e[0] === 'argent' || ITEMS[e[0]]) && e[1] > 0).map((e) => [e[0], Math.round(e[1])]);
    } catch (e) { console.error('butin.vider', e); return []; }
  },
  oterInter(it) {
    const w = game.world, i = w.inter.indexOf(it);
    if (i >= 0) w.inter.splice(i, 1);
    if (it.id) this.S().inters[it.id] = 1;
    if (game.target && game.target.it === it) game.target = null;
  },
  retirer(q) {
    const w = game.world, lum = !!PROP_LIGHTS[q.id];
    if (w.props.indexOf(q) < 0) return;
    farm.removeProp(q);
    q.gone = true; // (les listes que d'autres modules gardent le voient disparu)
    farm.dirtyProps = true; w.grid = null;
    if (q.id === 'tente') w.coverDirty = true;
    if (lum) w.collectLights();
    if (game.hiProp === q) game.hiProp = null;
    this.cache.delete(q);
  },

  // ------------------------------------------------------------------ les portes
  porteInterdite(dr) { return !dr.bld || dr.poterne || dr.deco || dr.bld === 'ferme' || dr.bld === 'poulailler' || dr.bld === 'eglise'; },
  porteSolidite(dr) {
    const k = dr.bld || '';
    if (/^roulotte/.test(k)) return 45;
    if (['garde', 'mairie', 'auberge', 'bibliotheque'].includes(k)) return 120;
    if (SHOP_DOORS.has(k) || k === 'vide6') return 90;
    return 70;
  },
  porteCassee(dr) { return !!(dr && dr.casse); },
  coupPorte(c, h, kind, tier) {
    const dr = c.dr, [x, y, z] = c.p, M = OBJ_MAT.bois;
    if (this.porteInterdite(dr) || dr.casse) return false;
    const k = M.k[kind] || 0;
    if (!k) { puffAt(x, y, z, M.col, 4, 1.2, false); sound.impact && sound.impact('soft'); if (kind !== 'main') this.pense('porte', OBJ_PENSEES.porteOutil); return true; }
    const base = Array.isArray(TOOL_DMG[kind]) ? TOOL_DMG[kind][Math.max(0, Math.min(TOOL_DMG[kind].length - 1, tier))] : (TOOL_DMG[kind] || OBJ_DMG[kind] || 4);
    const dmg = base * k * (BUFF.on('force') ? 2 : 1), pv = this.porteSolidite(dr);
    const S = this.S(), key = 'd:' + c.i, E = S.pv[key] || { d: 0, j: farm.s.day };
    E.d += dmg; E.j = farm.s.day;
    this.marque(E, c);
    this.impact('bois', [x, y, z], c.n, dmg / pv);
    sound.knock && sound.knock(1);
    const L = this.lieuBld(dr.bld);
    if (E.d < pv) { S.pv[key] = E; this.ecoute({ acte: 'porte', dr, L, cle: key, pos: [dr.x, dr.y + 1, dr.z] }, 0.45); return true; }
    delete S.pv[key];
    // elle cède
    dr.casse = true; dr.locked = false; dr.open = 1; dr.playerClosed = false; dr.scelle = false;
    S.portes[c.i] = { j: farm.s.day, bld: dr.bld };
    sound.objetPorte && sound.objetPorte();
    game.shakeT = Math.max(game.shakeT || 0, 0.15);
    const B = { x: dr.x, y: dr.y, z: dr.z, sx: dr.w, sy: dr.h, sz: 0.12, r: dr.r };
    this.eclater('bois', B, true);
    const nx = Math.sin(dr.r), nz = Math.cos(dr.r); // (vers l'intérieur)
    this.poserDebris('bois', { x: dr.x + nx * 0.7, y: dr.y, z: dr.z + nz * 0.7, sx: dr.w, sy: 0.3, sz: 0.8, r: dr.r }, false);
    if (Math.random() < 0.6) { farm.give('bois', 1); play.flyer('bois', [dr.x, dr.y + 1, dr.z], 1); }
    if (Math.random() < 0.5) { farm.give('ferraille', 1); play.flyer('ferraille', [dr.x, dr.y + 1, dr.z], 1); }
    ui.subtitle('', OBJ_PENSEES.porteCede, 3);
    S.n = (S.n || 0) + 1;
    this.consequences('porte', { dr, L, cle: key, pos: [dr.x, dr.y + 1, dr.z] });
    return true;
  },
  // chaque image : les portes enfoncées restent ouvertes
  tenirPortes(instant) {
    const S = this.S(), w = game.world;
    if (!S || !w) return;
    for (const i in S.portes) {
      const dr = w.doors[+i];
      if (!dr) continue;
      dr.casse = true;
      if (dr.locked) dr.locked = false;
      if (!dr.open) dr.open = 1;
      dr.scelle = false;
      if (instant) dr.a = 1.5;
    }
  },

  // ------------------------------------------------------------------ ramasser (E)
  ramasser(q) {
    if (!this.actif()) return;
    const P = this.profil(q);
    if (!this.ramassable(q, P)) return;
    const R = P.ramasse, n = R.n || 1, pos = [q.x, q.y + 0.3, q.z];
    const L = P.joueur ? { t: 'ferme', own: null, bld: null } : this.lieu(q.x, q.y + 0.2, q.z, OBJ_COMMUNS.has(q.id));
    this.retirer(q);
    farm.give(R.item, n); play.flyer(R.item, pos, n);
    sound.pop && sound.pop();
    const S = this.S();
    S.r = (S.r || 0) + 1;
    this.consequences('ramasse', { q, P, L, cle: P.cle, pos, got: [[R.item, n]] });
  },
  etiquette(q, P) {
    const R = P.ramasse;
    let t = R.lab || 'Ramasser';
    if (!P.joueur) {
      const L = this.lieu(q.x, q.y + 0.2, q.z, OBJ_COMMUNS.has(q.id));
      // (des phrases entières, pour la traduction : pas de « devant » recollé)
      if (L.own && L.own.st.alive && (L.t === 'maison' || L.t === 'commerce' || L.t === 'abords')) {
        if (L.t === 'abords') t += L.own.st.met ? ` (devant chez ${L.own.name})` : ' (devant chez quelqu’un)';
        else t += L.own.st.met ? ` (chez ${L.own.name})` : ' (chez quelqu’un)';
      }
    }
    return t;
  },

  // ------------------------------------------------------------------ ce qui est tombé d'un conteneur : un petit tas, E pour le ramasser
  poserTas(B, contenu, L) {
    const S = this.S(), w = game.world;
    const x = B.x + (Math.random() - 0.5) * 0.4, z = B.z + (Math.random() - 0.5) * 0.4;
    const y = w.groundAt(x, z, B.y + 0.4, 0.6);
    S.tas.push({ id: 't' + Date.now().toString(36) + ((Math.random() * 1e4) | 0), x, y: isFinite(y) ? y : B.y, z, o: contenu, j: farm.s.day, own: L.own ? L.own.id : null, bld: L.bld || null, t: L.t });
    while (S.tas.length > 30) S.tas.shift();
  },
  prendreTas(T) {
    if (!this.actif()) return;
    if (typeof butin !== 'undefined' && butin && typeof butin.ouvrir === 'function') {
      try {
        butin.ouvrir({ titre: 'Ce qui est tombé', objets: T.o.map((e) => e.slice()), cle: 'u2tas:' + T.id, proprio: T.own || null, x: T.x, y: T.y, z: T.z,
          bld: T.bld || null, lieu: T.t === 'maison' || T.t === 'commerce' ? 'maison' : 'public',
          onPris: (id, n) => this.tasPris(T, id, n), onFerme: () => this.tasFerme(T) });
        return;
      } catch (e) { console.error('butin.ouvrir', e); }
    }
    const got = [];
    for (const [id, n] of T.o) {
      if (id === 'argent') { farm.earn(n); sound.coin && sound.coin(); got.push([id, n]); }
      else if (ITEMS[id]) { farm.give(id, n); play.flyer(id, [T.x, T.y + 0.2, T.z], n); got.push([id, n]); }
    }
    T.o = [];
    this.tasFerme(T);
    sound.pop && sound.pop();
    const own = T.own ? npcs.byId[T.own] : null;
    this.consequences('tas', { L: { t: T.t || 'nature', own, bld: T.bld }, cle: 'tas:' + T.id, pos: [T.x, T.y + 0.2, T.z], got: got.filter((g) => g[0] !== 'argent') });
  },
  tasPris(T, id, n) {
    const e = T.o.find((q) => q[0] === id);
    if (!e) return;
    e[1] -= n;
    if (e[1] <= 0) T.o.splice(T.o.indexOf(e), 1);
  },
  tasFerme(T) { const S = this.S(); if (!T.o.length) { const i = S.tas.indexOf(T); if (i >= 0) S.tas.splice(i, 1); } },

  // ------------------------------------------------------------------ qui voit, qui entend ?
  temoins(pos, own, bld, bruit) {
    const out = [];
    try {
      if (typeof fouilles !== 'undefined' && fouilles.temoins) for (const m of fouilles.temoins({ x: pos[0], y: pos[1], z: pos[2], data: { bld, lock: bruit > 0.7 ? 1 : 0 } }, own)) out.push(m);
      else for (const m of npcs.witnesses(pos[0], pos[2])) if (Math.hypot(m.x - pos[0], m.z - pos[2]) < 14) out.push(m);
    } catch (e) { console.error(e); }
    if (bruit > 0) {
      const w = game.world;
      for (const m of npcs.list) {
        if (out.includes(m) || !m.st.alive || m.vanished || m.hunting || m.state === 'gone' || m.state === 'dead' || m.talking) continue;
        const d = Math.hypot(m.x - pos[0], m.z - pos[2]);
        if (d > 6 + 12 * bruit || (m.y !== undefined && Math.abs(m.y - pos[1]) > 4)) continue;
        const dort = m.sleep || m.state === 'sleep', chezLui = own && m === own;
        const dedans = bld && typeof fouilles !== 'undefined' && fouilles.dedans && fouilles.dedans(m, bld);
        const voit = d < 3 || segClear(w, m.x, m.z, pos[0], pos[2]);
        const k = (dort ? (chezLui || dedans ? 0.3 : 0.08) : voit ? 0.5 : chezLui || dedans ? 0.4 : 0.12) * bruit;
        if (Math.random() < k) { if (dort) { m.state = 'idle'; m.sleep = false; m.goal = null; } out.push(m); }
      }
    }
    return out;
  },
  typeCrime(acte, L, prof) {
    if (prof) return 'profanation';
    const t = L.t;
    let ty = null;
    if (acte === 'porte') ty = t === 'abandon' || t === 'ferme' || t === 'nature' ? null : 'effraction';
    else if (acte === 'casse') ty = t === 'maison' ? 'effraction' : ['commerce', 'abords', 'commune', 'public', 'cimetiere'].includes(t) ? 'vol' : null;
    else if (acte === 'tas') ty = ['maison', 'commerce', 'abords'].includes(t) ? 'vol' : null; // (ce qui s'est répandu dans la rue est à tout le monde)
    else ty = ['maison', 'commerce', 'abords', 'commune', 'public', 'cimetiere'].includes(t) ? 'vol' : null;
    if (ty && typeof CRIME_DEF !== 'undefined' && !CRIME_DEF[ty]) ty = 'vol';
    return ty;
  },
  // un coup, un bruit : quelqu'un l'entend-il ? (une fois pris, on n'est pas repris pour la même chose avant un moment)
  ecoute(o, bruit) {
    const L = o.L || (o.P && o.P.joueur ? null : o.q ? this.lieu(o.q.x, o.q.y + 0.3, o.q.z, OBJ_COMMUNS.has(o.q.id)) : null);
    if (!L || !this.typeCrime(o.acte, L, o.P && o.P.casse && o.P.casse.opt.prof)) return;
    if ((this.alertes[o.cle] || 0) > game.time) return;
    const own = L.own && L.own.st.alive ? L.own : null;
    const vus = this.temoins(o.pos, own, L.bld, bruit);
    if (!vus.length) return;
    this.alertes[o.cle] = game.time + 90;
    this.surpris(this.typeCrime(o.acte, L, o.P && o.P.casse && o.P.casse.opt.prof), o.acte, own, vus, o.pos, L, o.P && o.P.casse && o.P.casse.opt.prof);
  },
  consequences(acte, o) {
    const S = this.S(), s = farm.s, L = o.L;
    const prof = o.P && o.P.casse && o.P.casse.opt.prof;
    if (prof) this.profanation(prof);
    if (!L || L.t === 'ferme' || (L.t === 'nature' && !prof)) return;
    const own = L.own && L.own.st.alive ? L.own : null, type = this.typeCrime(acte, L, prof);
    const deja = (this.alertes[o.cle] || 0) > game.time;
    const bruit = acte === 'porte' ? 1 : acte === 'casse' ? (o.P.casse.opt.lourd ? 0.9 : 0.6) : 0;
    const vus = deja ? [] : this.temoins(o.pos, own, L.bld, bruit);
    if (type) {
      if (vus.length) { this.alertes[o.cle] = game.time + 90; this.surpris(type, acte, own, vus, o.pos, L, prof); }
      else if (!deja) {
        const dedans = L.t === 'maison' || L.t === 'commerce';
        if (own && !prof) S.plaintes[own.id] = { j: s.day, t: acte === 'porte' ? 'porte' : acte === 'casse' ? (dedans ? 'casse' : 'dehors') : dedans ? 'vol' : 'volDehors' };
        if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(acte === 'porte' ? -1 : acte === 'casse' ? -0.5 : -0.4, acte === 'ramasse' || acte === 'tas' ? 'voler' : 'casser', 3);
      }
      if ((acte === 'ramasse' || acte === 'tas') && own && o.got && o.got.length) this.marquer(o.got, own.id);
    } else if (vus.length && (L.t === 'mort' || L.t === 'abandon')) {
      const m = vus[0];
      npcs.say(m, fmtLine(pick(L.t === 'mort' ? OBJ_TEMOIN_MORT : OBJ_TEMOIN_ABANDON), m, { victime: L.own ? L.own.name : '' }), 3.5);
      for (const v of vus) npcs.addAmitie(v, -20);
      if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-0.5, 'casser', 3);
    }
  },
  // pris sur le fait
  surpris(type, acte, own, vus, pos, L, prof) {
    const S = this.S(), p = game.player, g = npcs.byId.garde;
    const dedans = !!(L && (L.t === 'maison' || L.t === 'commerce'));
    const C = OBJ_CRIS[prof ? 'profane' : acte === 'porte' ? 'porte' : acte === 'casse' ? (dedans ? 'casse' : 'dehors') : dedans ? 'vol' : 'volDehors'];
    if (own && vus.includes(own)) npcs.say(own, pick(C.proprio), 3.5);
    else { const a = vus[0]; npcs.say(a, fmtLine(pick(own ? C.temoin : C.public), a, { victime: own ? own.name : '' }), 3.2); }
    for (const m of vus) { m.heading = Math.atan2(p.pos[0] - m.x, p.pos[2] - m.z); m.chatT = 0; }
    if (own) { npcs.addAmitie(own, acte === 'ramasse' || acte === 'tas' ? -100 : -140); own.st.anger = Math.max(own.st.anger || 0, 4); npcs.remember(own, acte === 'porte' ? 'effraction' : 'vol'); }
    if (typeof societe !== 'undefined' && societe.crime) {
      try { societe.crime({ type, victime: own ? own.id : null, x: pos[0], z: pos[2], temoins: vus, detail: prof && L && L.t === 'cimetiere' ? 'cimetiere' : null }); } catch (e) { console.error(e); }
    } else if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-2.5, 'crime : ' + type);
    if (g && g.st.alive && !g.sleep && (vus.includes(g) || Math.hypot(g.x - p.pos[0], g.z - p.pos[2]) < 40)) { g.poursuite = game.time + 18; g.vuT = game.time; g.fleeT = 0; }
    S.pris = (S.pris || 0) + 1;
  },
  // une tombe, une croix, un calvaire : ce qui dort dessous s'en souvient
  profanation(prof) {
    ui.subtitle('', prof === 'calvaire' ? OBJ_PENSEES.calvaire : OBJ_PENSEES.tombe, 3.5);
    sound.whisper && sound.whisper(0, 0.35);
    try { if (typeof faith !== 'undefined' && faith.add) faith.add('eglise', -6); } catch (e) { /* rien */ }
    if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-2, 'profaner', 4);
    try { if (typeof malediction !== 'undefined' && malediction.frapper) setTimeout(() => { if (farm.s && !game.dying) malediction.frapper(prof === 'calvaire' ? 'malchance' : 'sommeil', prof === 'calvaire' ? 'calvaire' : 'tombe'); }, 1500); } catch (e) { console.error(e); }
  },
  // les objets pris chez quelqu'un se reconnaissent (le vol à la tire les compte)
  marquer(got, de) {
    if (typeof fouilles !== 'undefined' && fouilles.marquer) { try { fouilles.marquer(got, de, {}); } catch (e) { console.error(e); } }
  },

  // ------------------------------------------------------------------ éclats, débris, fissures
  eclat(m, x, y, z, vx, vz, k) {
    if (this.eclats.length > 90) this.eclats.shift();
    const M = OBJ_MAT[m], R = Math.random;
    let sx, sy, sz;
    if (m === 'bois') { sx = 0.04 + R() * 0.05; sy = 0.025 + R() * 0.02; sz = 0.16 + R() * 0.32; }
    else if (m === 'pierre') { sx = 0.06 + R() * 0.12; sy = 0.05 + R() * 0.09; sz = 0.06 + R() * 0.12; }
    else if (m === 'metal') { sx = 0.03 + R() * 0.06; sy = 0.015 + R() * 0.02; sz = 0.06 + R() * 0.16; }
    else if (m === 'verre') { sx = 0.02 + R() * 0.05; sy = 0.006; sz = 0.02 + R() * 0.06; }
    else if (m === 'poterie') { sx = 0.04 + R() * 0.07; sy = 0.012; sz = 0.03 + R() * 0.06; }
    else { sx = 0.07 + R() * 0.08; sy = 0.015; sz = 0.07 + R() * 0.1; }
    const kk = 0.75 + R() * 0.45, col = R() < 0.35 ? objCol(M.col2, kk) : objCol(M.col, kk);
    this.eclats.push({ x, y, z, vx: vx + (R() - 0.5) * 2.4 * k, vy: 1.2 + R() * 2.6 * k, vz: vz + (R() - 0.5) * 2.4 * k, rx: R() * TAU, ry: R() * TAU, rz: R() * TAU,
      wx: (R() - 0.5) * 14, wy: (R() - 0.5) * 10, wz: (R() - 0.5) * 14, sx, sy, sz, col, tuile: TL[M.tuile] ?? TL.plain, t: 0, vie: 28 + R() * 16, repos: false });
  },
  eclater(m, B, gros) {
    const n = m === 'verre' || m === 'poterie' ? 8 : gros ? 14 : 8, c = Math.cos(B.r), s = Math.sin(B.r);
    for (let i = 0; i < n; i++) {
      const lx = (Math.random() - 0.5) * B.sx, lz = (Math.random() - 0.5) * B.sz, y = B.y + Math.random() * B.sy;
      const x = B.x + lx * c + lz * s, z = B.z - lx * s + lz * c, d = Math.hypot(lx, lz) || 1;
      this.eclat(m, x, y, z, (lx * c + lz * s) / d * 1.4, (-lx * s + lz * c) / d * 1.4, 1);
    }
    // la poussière (elle monte, puis retombe doucement)
    const M = OBJ_MAT[m], nd = gros ? 26 : 14;
    for (let i = 0; i < nd; i++) {
      const k = 0.85 + Math.random() * 0.3, col = [M.col2[0] / 255 * k, M.col2[1] / 255 * k, M.col2[2] / 255 * k, 0.55];
      particles.spawn(B.x + (Math.random() - 0.5) * B.sx, B.y + Math.random() * B.sy * 0.8, B.z + (Math.random() - 0.5) * B.sz,
        (Math.random() - 0.5) * 1.2, 0.3 + Math.random() * 0.9, (Math.random() - 0.5) * 1.2, col, 0.14 + Math.random() * 0.16, 1.2 + Math.random() * 1.3, 0.6, false);
    }
    if (m === 'metal' || m === 'pierre') puffAt(B.x, B.y + B.sy * 0.5, B.z, M.col, 6, 2.4, true);
  },
  poserDebris(m, B, gros) {
    const S = this.S();
    S.debris.push({ x: Math.round(B.x * 100) / 100, y: Math.round(B.y * 100) / 100, z: Math.round(B.z * 100) / 100, r: Math.round((B.r || 0) * 100) / 100, m,
      t: Math.round(clamp(Math.max(B.sx, B.sz) * 0.8, 0.35, gros ? 1.4 : 0.9) * 100) / 100, j: farm.s.day, g: (Math.random() * 1e6) | 0 });
    while (S.debris.length > 40) S.debris.shift();
  },
  // chaque image : les éclats tombent, rebondissent, se posent, puis s'effacent
  update(dt) {
    const w = game.world;
    for (let i = this.eclats.length - 1; i >= 0; i--) {
      const e = this.eclats[i];
      e.t += dt;
      if (e.t > e.vie) { this.eclats.splice(i, 1); continue; }
      if (e.repos) continue;
      e.vy -= 9.8 * dt;
      e.x += e.vx * dt; e.y += e.vy * dt; e.z += e.vz * dt;
      e.rx += e.wx * dt; e.ry += e.wy * dt; e.rz += e.wz * dt;
      const g = w.groundAt(e.x, e.z, e.y + 0.1, 0.25);
      if (e.y - e.sy / 2 <= g) {
        e.y = g + e.sy / 2;
        if (Math.abs(e.vy) < 1.3) { e.repos = true; e.rx = (Math.random() - 0.5) * 0.25; e.rz = (Math.random() - 0.5) * 0.25; }
        else { e.vy = -e.vy * 0.3; e.vx *= 0.45; e.vz *= 0.45; e.wx *= 0.5; e.wz *= 0.5; }
      }
    }
    if (this.S()) this.tenirPortes(false);
  },
  dessiner(buf, cam) {
    const S = this.S(), w = game.world;
    if (!S) return;
    PE.buf = buf; PE.fl = 0; PE.tint = null;
    // les éclats qui volent
    for (const e of this.eclats) {
      if (Math.abs(e.x - cam[0]) > 60 || Math.abs(e.z - cam[2]) > 60) continue;
      const k = e.t > e.vie - 2 ? Math.max(0.05, (e.vie - e.t) / 2) : 1;
      PE.frame(e.x, e.y, e.z, e.ry, 1);
      PE.box(0, 0, 0, e.sx * k, e.sy * k, e.sz * k, e.col, e.tuile, 0, e.rx, e.rz);
    }
    // les débris qui restent quelques jours
    for (const D of S.debris) {
      if (Math.abs(D.x - cam[0]) > 60 || Math.abs(D.z - cam[2]) > 60) continue;
      this.dessinerDebris(D);
    }
    // ce qui est tombé des conteneurs
    for (const T of S.tas) {
      if (Math.abs(T.x - cam[0]) > 50 || Math.abs(T.z - cam[2]) > 50) continue;
      this.dessinerTas(T);
    }
    // les fissures de ce qui a pris des coups
    for (const k in S.pv) {
      const E = S.pv[k];
      if (k.startsWith('d:')) { const dr = w.doors[+k.slice(2)]; if (dr && dr.a < 0.5 && Math.abs(dr.x - cam[0]) < 40 && Math.abs(dr.z - cam[2]) < 40) this.dessinerFissuresPorte(dr, E, k); continue; }
      const q = this.objetDe(k);
      if (!q || !w.live(q) || Math.abs(q.x - cam[0]) > 40 || Math.abs(q.z - cam[2]) > 40) continue;
      const P = this.profil(q);
      if (P && P.casse) this.dessinerFissures(q, P, E, k);
    }
  },
  objetDe(k) {
    const w = game.world;
    if (k.startsWith('p:')) return w.props[+k.slice(2)] || null;
    if (!k.startsWith('j:')) return null;
    const [, id, x, z] = k.split(':');
    return w.props.find((q) => q.id === id && Math.round(q.x * 10) === +x && Math.round(q.z * 10) === +z) || null;
  },
  dessinerDebris(D) {
    const M = OBJ_MAT[D.m] || OBJ_MAT.bois, rnd = mulberry32(D.g), n = D.m === 'verre' || D.m === 'poterie' ? 6 : 5 + Math.round(D.t * 4);
    PE.frame(D.x, D.y, D.z, D.r, 1);
    for (let i = 0; i < n; i++) {
      const a = rnd() * TAU, d = rnd() * D.t * 0.7, x = Math.cos(a) * d, z = Math.sin(a) * d, kk = 0.7 + rnd() * 0.45;
      const col = rnd() < 0.35 ? objCol(M.col2, kk) : objCol(M.col, kk);
      let sx, sy, sz;
      if (D.m === 'bois') { sx = 0.05 + rnd() * 0.06; sy = 0.03; sz = 0.2 + rnd() * 0.45 * D.t; }
      else if (D.m === 'pierre') { sx = 0.08 + rnd() * 0.16 * D.t; sy = 0.05 + rnd() * 0.1; sz = 0.08 + rnd() * 0.16 * D.t; }
      else if (D.m === 'metal') { sx = 0.04 + rnd() * 0.06; sy = 0.02; sz = 0.1 + rnd() * 0.2; }
      else if (D.m === 'verre') { sx = 0.03 + rnd() * 0.05; sy = 0.006; sz = 0.03 + rnd() * 0.06; }
      else if (D.m === 'poterie') { sx = 0.05 + rnd() * 0.07; sy = 0.014; sz = 0.04 + rnd() * 0.06; }
      else { sx = 0.1 + rnd() * 0.12; sy = 0.02; sz = 0.1 + rnd() * 0.14; }
      PE.box(x, sy / 2, z, sx, sy, sz, col, TL[M.tuile] ?? TL.plain, rnd() * TAU, (rnd() - 0.5) * 0.3, (rnd() - 0.5) * 0.3);
    }
  },
  // le tas : une tache de ce qui s'est répandu (les objets eux-mêmes sont des icônes posées au sol : icones())
  dessinerTas(T) {
    const rnd = mulberry32(T.id.length * 131 + Math.round(T.x * 7) + Math.round(T.z * 13));
    PE.frame(T.x, T.y, T.z, rnd() * TAU, 1);
    PE.box(0, 0.004, 0, 0.62, 0.008, 0.46, [0.3, 0.24, 0.17], TL.soil);
    for (let k = 0; k < 4; k++) { const a = rnd() * TAU, d = 0.2 + rnd() * 0.14; PE.box(Math.cos(a) * d, 0.012, Math.sin(a) * d, 0.08, 0.02, 0.05, [0.62, 0.5, 0.34], TL.straw, rnd() * TAU); }
  },
  // les icônes des objets répandus, debout au sol (dans le tampon des icônes qui volent vers soi : 64 places)
  icones(D, n) {
    const S = this.S();
    if (!S || !S.tas.length || !game.world || game.world !== farm.w) return n;
    const cap = Math.floor(D.length / 13), p = game.player.pos;
    for (const T of S.tas) {
      if (Math.abs(T.x - p[0]) > 24 || Math.abs(T.z - p[2]) > 24) continue;
      const rnd = mulberry32(T.id.length * 977 + Math.round(T.x * 11) + Math.round(T.z * 5));
      let k = 0;
      for (const [id] of T.o) {
        if (n >= cap || k >= 6) break;
        const s = ATLAS.sprites['it_' + (id === 'argent' ? 'vieille_piece' : id)];
        if (!s) continue;
        const a = k * 2.4 + rnd(), d = k ? 0.13 + rnd() * 0.12 : 0.02, o = n * 13, size = 0.24;
        D[o] = T.x + Math.cos(a) * d; D[o + 1] = T.y + 0.01; D[o + 2] = T.z + Math.sin(a) * d; D[o + 3] = size; D[o + 4] = size;
        D[o + 5] = s.u0; D[o + 6] = s.v0; D[o + 7] = s.u1; D[o + 8] = s.v1; D[o + 9] = 0; D[o + 10] = 1; D[o + 11] = 0; D[o + 12] = 0;
        n++; k++;
      }
    }
    return n;
  },
  // une étoile de fêlures au point d'un coup (h : [x, y, z, nx, ny, nz] dans le repère courant de PE) ; sur le bois, des échardes
  etoile(h, ratio, m, rnd) {
    const [x, y, z, nx, ny, nz] = h, len = 0.1 + Math.min(1, ratio) * 0.24, e = 0.012, cx = x + nx * e, cy = y + ny * e, cz = z + nz * e;
    const ax = Math.abs(nx) >= Math.abs(ny) && Math.abs(nx) >= Math.abs(nz) ? 0 : Math.abs(nz) >= Math.abs(ny) ? 2 : 1;
    const dark = m === 'metal' ? [0.84, 0.84, 0.88] : m === 'bois' ? [0.09, 0.06, 0.04] : [0.2, 0.19, 0.18], M = OBJ_MAT[m] || OBJ_MAT.bois;
    const clair = objCol(M.col2, 1.2), tu = TL[M.tuile] ?? TL.plain;
    for (let k = 0; k < 4; k++) {
      const a = rnd() * 0.8 + k * 0.8, l = len * (0.55 + rnd() * 0.6), wd = k ? 0.022 : 0.032;
      if (ax === 2) PE.box(cx, cy, cz, wd, l, 0.012, dark, TL.plain, 0, 0, a);
      else if (ax === 0) PE.box(cx, cy, cz, 0.012, l, wd, dark, TL.plain, 0, a, 0);
      else PE.box(cx, cy, cz, wd, 0.012, l, dark, TL.plain, a, 0, 0);
    }
    if (m !== 'bois' && m !== 'pierre') return;
    for (let k = 0; k < 3; k++) {
      const u = (rnd() - 0.5) * len * 0.9, v = (rnd() - 0.5) * len * 0.9, l = m === 'bois' ? 0.06 + rnd() * 0.07 : 0.03, t = (rnd() - 0.5) * 0.9;
      if (ax === 2) PE.box(cx + u, cy + v, cz + nz * l * 0.4, 0.024, 0.024, l, clair, tu, t, t * 0.5, 0);
      else if (ax === 0) PE.box(cx + nx * l * 0.4, cy + v, cz + u, l, 0.024, 0.024, clair, tu, 0, t, t * 0.5);
      else PE.box(cx + u, cy + ny * l * 0.4, cz + v, 0.024, l, 0.024, clair, tu, t, 0, t * 0.5);
    }
  },
  dessinerFissures(q, P, E, k) {
    const ratio = E.d / P.casse.pv, rnd = mulberry32((k.length * 7919 + Math.round(q.x * 31) + Math.round(q.z * 17)) >>> 0);
    const dark = P.casse.mat === 'bois' ? [0.16, 0.11, 0.07] : P.casse.mat === 'metal' ? [0.78, 0.78, 0.8] : [0.3, 0.29, 0.27];
    if (E.h && E.h.length) { PE.frame(q.x, q.y, q.z, q.r || 0, q.s || 1); for (const h of E.h) this.etoile(h, ratio, P.casse.mat, rnd); return; }
    const B = P.B || this.boite(q), n = Math.min(6, Math.ceil(ratio * 6));
    if (!B) return;
    PE.frame(B.x, B.y, B.z, B.r, 1);
    for (let i = 0; i < n; i++) {
      const face = (rnd() * 4) | 0, u = rnd() - 0.5, v = 0.15 + rnd() * 0.7, len = Math.min(B.sy * 0.5, 0.12 + rnd() * 0.3), tilt = (rnd() - 0.5) * 1.4;
      if (face < 2) { const z = (face ? 0.5 : -0.5) * B.sz + (face ? 0.006 : -0.006); PE.box(u * B.sx * 0.8, v * B.sy, z, 0.022, len, 0.012, dark, TL.plain, 0, 0, tilt); }
      else { const x = (face === 2 ? 0.5 : -0.5) * B.sx + (face === 2 ? 0.006 : -0.006); PE.box(x, v * B.sy, u * B.sz * 0.8, 0.012, len, 0.022, dark, TL.plain, 0, tilt, 0); }
    }
  },
  dessinerFissuresPorte(dr, E, k) {
    const ratio = E.d / this.porteSolidite(dr), rnd = mulberry32((k.length * 104729 + Math.round(dr.x * 13)) >>> 0), n = Math.min(7, Math.ceil(ratio * 7)), dark = [0.14, 0.1, 0.06];
    PE.frame(dr.x, dr.y, dr.z, dr.r, 1);
    // (le vantail fait 7 cm : les fêlures se posent sur ses faces, pas sur la boîte de collision)
    if (E.h && E.h.length) { for (const h of E.h) this.etoile([h[0], h[1], Math.sign(h[2] || h[5] || 1) * 0.028, h[3], h[4], h[5]], ratio * 1.3, 'bois', rnd); return; }
    for (let i = 0; i < n; i++) {
      const u = (rnd() - 0.5) * dr.w * 0.7, v = 0.3 + rnd() * (dr.h - 0.6), len = 0.15 + rnd() * 0.35, tilt = (rnd() - 0.5) * 1.2;
      for (const z of [-0.07, 0.07]) PE.box(u, v, z, 0.024, len, 0.012, dark, TL.plain, 0, 0, tilt);
    }
  },

  // ------------------------------------------------------------------ chaque matin : réparations, débris balayés, plaintes oubliées
  jour() {
    const S = this.S(), s = farm.s, w = game.world;
    if (!S) return;
    for (const i in S.portes) if (s.day - S.portes[i].j >= 3) { delete S.portes[i]; const dr = w && w.doors[+i]; if (dr) dr.casse = false; }
    for (const k in S.pv) if (s.day - S.pv[k].j >= 2) delete S.pv[k];
    S.debris = S.debris.filter((D) => s.day - D.j < 3);
    S.tas = S.tas.filter((T) => s.day - T.j < 3 && T.o.length);
    for (const id in S.plaintes) if (s.day - S.plaintes[id].j > 4) delete S.plaintes[id];
  },
  // au chargement : ce qui a été cassé le reste
  charger() {
    const S = this.S(), w = game.world;
    this.eclats = []; this.alertes = {}; this.cache = new WeakMap(); this.hotes = new WeakMap(); this.f2c = null;
    if (!S || !w) return;
    const ids = S.inters;
    if (Object.keys(ids).length) for (let k = w.inter.length - 1; k >= 0; k--) if (w.inter[k] && ids[w.inter[k].id]) w.inter.splice(k, 1);
    for (const i in S.portes) {
      const dr = w.doors[+i], P = S.portes[i];
      if (!dr || (P.bld && dr.bld !== P.bld)) { delete S.portes[i]; continue; }
      dr.casse = true; dr.locked = false; dr.open = 1; dr.a = 1.5;
    }
    for (const dr of w.doors) if (dr.casse && !S.portes[w.doors.indexOf(dr)]) dr.casse = false;
    this.brancher();
  },
  // les emballages qui ont besoin de game (une seule fois)
  brancher() {
    if (game._u2objets) return;
    game._u2objets = true;
    // les icônes 3D des objets ramassés (chaise, lanterne, pot…) : la couleur moyenne des tuiles du « skin » se lit sur
    // une copie du canevas, une seule fois (sans quoi le canevas des peaux, déjà relu par 07-zzzzz-personnages, fait
    // afficher au navigateur un avertissement de relectures multiples)
    if (typeof ICON3D !== 'undefined' && ICON3D.tileAvg && !ICON3D._u2) {
      ICON3D._u2 = true;
      const _ta = ICON3D.tileAvg.bind(ICON3D);
      ICON3D.tileAvg = function (idx) {
        if (!this.tiles && SKIN.canvas && typeof document !== 'undefined') {
          try {
            const src = SKIN.canvas, cv = document.createElement('canvas');
            cv.width = src.width; cv.height = src.height;
            const c = cv.getContext('2d', { willReadFrequently: true });
            c.drawImage(src, 0, 0);
            const d = c.getImageData(0, 0, cv.width, cv.height).data, tiles = [];
            for (let t = 0; t < 256; t++) {
              const ox = (t % 16) * 16, oy = Math.floor(t / 16) * 16;
              let r = 0, g = 0, b = 0, n = 0;
              for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const k = ((oy + y) * cv.width + ox + x) * 4; if (d[k + 3] < 10) continue; r += d[k]; g += d[k + 1]; b += d[k + 2]; n++; }
              tiles[t] = n ? [r / n, g / n, b / n] : [200, 200, 200];
            }
            this.tiles = tiles;
          } catch (e) { /* on laisse faire l'original */ }
        }
        return _ta(idx);
      };
    }
    // une porte enfoncée ne se referme plus
    const _ud = game.useDoor.bind(game);
    game.useDoor = function (dr) {
      if (dr && dr.casse && objets.actif()) { sound.impact && sound.impact('soft'); objets.pense('porteCassee', OBJ_PENSEES.porteCassee, 3); return; }
      return _ud(dr);
    };
    const _doors = npcs.updateDoors.bind(npcs);
    npcs.updateDoors = function (w, instant) { _doors(w, instant); if (farm.s && game.world === w) objets.tenirPortes(instant); };
    // la plainte du lendemain
    const _open = talk.open.bind(talk);
    talk.open = function (n) {
      let f2 = false;
      try { f2 = !!(typeof fouilles !== 'undefined' && fouilles.S && fouilles.S() && fouilles.S().plaintes[n.id] !== undefined); } catch (e) { /* rien */ }
      const v = _open(n);
      try {
        const S = objets.S(), P = S && S.plaintes[n.id];
        if (!f2 && P && v && v.text && farm.s.day > P.j && n.st.alive && !npcs.murdererKnown() && !(n.st.anger > 0)) {
          delete S.plaintes[n.id];
          v.text = fmtLine(pick(OBJ_PLAINTES[P.t] || OBJ_PLAINTES.casse), n);
        }
      } catch (e) { console.error(e); }
      return v;
    };
  },

  // ------------------------------------------------------------------ E : les petits objets sous le regard, et ce qui est tombé
  cible(eye, f, cand) {
    const w = game.world, S = this.S();
    for (const T of S.tas) {
      if (Math.abs(T.x - eye[0]) > 3.5 || Math.abs(T.z - eye[2]) > 3.5) continue;
      const h = w.raycastBlock({ x: T.x, y: T.y - 0.05, z: T.z, sx: 0.8, sy: 0.4, sz: 0.8, r: 0 }, eye, f);
      // (le regard posé droit dessus : il l'emporte sur une interaction voisine, un peu de biais)
      if (h && h.t < 2.6) cand({ kind: 'hook', use: () => objets.prendreTas(T), f2lab: 'Ramasser ce qui est tombé' }, h.t * 0.7);
    }
    let best = null, bt = 2.6;
    const pres = game.presDe ? game.presDe(eye) : null;
    for (const q of pres ? pres.qi.map((i) => w.props[i]) : w.props) {
      if (!q || !OBJ_RAMASSE[q.id] || !w.live(q)) continue;
      if (Math.abs(q.x - eye[0]) > 3.4 || Math.abs(q.z - eye[2]) > 3.4) continue;
      const B = this.boite(q, true);
      if (!B) continue;
      const h = w.raycastBlock(B, eye, f);
      if (!h || h.t >= bt) continue;
      const P = this.profil(q);
      if (!this.ramassable(q, P)) continue;
      best = { q, P }; bt = h.t;
    }
    if (!best) return;
    const th = w.raycastTerrain(eye, f, bt);
    if (th && th.t < bt - 0.05) return;
    const bh = w.raycastBlocks(eye, f, bt);
    if (bh && !bh.block.hidden && bh.t < bt - 0.08) return;
    const q = best.q;
    cand({ kind: 'hook', use: () => objets.ramasser(q), lit: q, f2lab: this.etiquette(q, best.P) }, bt * 0.8 + 0.02);
  },
};

// ---------------------------------------------------------------- une porte enfoncée : arrachée de ses gonds, tombée à plat derrière le seuil
// (l'encadrement reste ; le vantail gît à l'intérieur, la face de la rue en l'air, un trou dans les planches ; on marche dessus)
{
  const _ed = emitDoor;
  emitDoor = function (buf, d, fl) {
    if (!d || !d.casse) return _ed(buf, d, fl);
    const S = typeof PORTES !== 'undefined' && PORTES.style ? PORTES.style(d) : null;
    const col = S ? S.col : [0.55, 0.4, 0.26], st = S ? S.st : 'rustique';
    const tuile = st === 'ville' || st === 'mairie' || st === 'double' ? TL.portePanneau : st === 'boutique' ? TL.porteBasPanneau
      : st === 'auberge' || st === 'poterne' || st === 'eglise' ? TL.porteClous : (TL.porteBois ?? TL.wood);
    const w = d.w, h = d.h, t = 0.07, dark = [col[0] * 0.7, col[1] * 0.7, col[2] * 0.7], clair = [0.8, 0.64, 0.44], noir = [0.07, 0.05, 0.04], fer = [0.25, 0.25, 0.28];
    PE.buf = buf; PE.fl = 0; PE.tint = null;
    const R = m34Root(OBJ_M, d.x, d.y, d.z, d.r, 1);
    if (S && S.cadre && typeof porteCadre === 'function') { PE.M.set(R); try { porteCadre(d, S, 2); } catch (e) { /* rien */ } }
    // les gonds arrachés, et le chambranle éclaté côté serrure
    PE.M.set(R); PE.fl = fl || 0;
    for (const y of [0.3, h - 0.34]) PE.box(-w / 2 + 0.03, y, 0, 0.06, 0.07, 0.07, fer, TL.iron, 0, 0, 0.4);
    PE.box(w / 2 - 0.04, h * 0.47, -0.03, 0.05, 0.36, 0.05, clair, TL.wood, 0, 0, 0.22);
    PE.box(w / 2 - 0.07, h * 0.55, -0.04, 0.03, 0.18, 0.03, clair, TL.wood, 0, 0, -0.5);
    // le vantail, basculé vers l'intérieur autour du seuil (un peu de travers), posé sur le plancher (relevé une fois)
    if (d._u2sol === undefined && game.world) {
      const nx = Math.sin(d.r), nz = Math.cos(d.r), g = game.world.groundAt(d.x + nx * 1.1, d.z + nz * 1.1, d.y + 0.7, 0.9);
      d._u2sol = isFinite(g) ? clamp(g - d.y, -0.2, 0.5) : 0;
    }
    m34TR(PE._L, 0.05, (d._u2sol || 0) + t / 2 + 0.012, 0.14, Math.PI / 2, 0.1, 0);
    m34Mul(PE.M, R, PE._L);
    PE.box(0, h / 2, 0, w - 0.06, h - 0.04, t, col, tuile);
    for (const y of [0.26, h - 0.34]) PE.box(0, y, -t / 2 - 0.016, w - 0.12, 0.13, 0.032, dark, tuile);
    const u = w * 0.08, v = h * 0.5;
    PE.box(u, v, -t / 2 - 0.004, 0.32, 0.46, 0.012, noir, TL.plain);
    for (const [du, dv, l, rz] of [[-0.17, 0.12, 0.28, 0.5], [0.16, -0.15, 0.3, -0.6], [0.02, 0.26, 0.22, 1.2], [-0.13, -0.21, 0.24, -1.1], [0.18, 0.17, 0.2, 0.9]]) {
      PE.box(u + du, v + dv, -t / 2 - 0.02, 0.035, l, 0.04, clair, TL.wood, 0, 0, rz);
    }
    PE.box(w / 2 - 0.17, h * 0.42, -t / 2 - 0.02, 0.1, 0.13, 0.035, fer, TL.iron, 0, 0, 0.55); // la serrure, arrachée avec son pêne
    PE.fl = 0;
  };
}

// ---------------------------------------------------------------- branchements
// le coup d'outil : avant la résolution d'origine (arbres, rochers, bêtes, démontage au marteau)
{
  const _rh = play.resolveHit.bind(play);
  play.resolveHit = function () {
    const h = this.pendingHit;
    if (h && farm.s) {
      let pris = false;
      try { pris = objets.coup(h); } catch (e) { console.error('objets.coup', e); }
      if (pris) { this.pendingHit = null; if (h.kind === 'faux') this.scythe(h.eye, h.f); return; }
    }
    return _rh();
  };
}
// les objets répandus au sol : leurs icônes, avec celles qui volent vers soi
{
  const _af = play.appendFlyers.bind(play);
  play.appendFlyers = function (D, n) {
    n = _af(D, n);
    try { if (farm.s) n = objets.icones(D, n); } catch (e) { console.error('objets.icones', e); }
    return n;
  };
}
// la houe ne frappe pas d'elle-même : sur une poterie, un verre, un sac, elle sert d'outil
HOOKS.primary.push((eye, basis, held, it) => {
  if (held || !it || it.tool !== 'houe' || play.cool > 0 || !objets.actif()) return false;
  const c = objets.viser(eye, basis.f, 2.7);
  if (!c || !c.q) return false;
  const P = objets.profil(c.q);
  if (!P || !P.casse || P.protege || !OBJ_MAT[P.casse.mat].tout) return false;
  play.swing(eye, basis);
  return true;
});
HOOKS.target.push((eye, f, cand) => { if (objets.actif()) { try { objets.cible(eye, f, cand); } catch (e) { console.error('objets.cible', e); } } });
HOOKS.update.push((dt) => { if (farm.s && game.world && game.world === farm.w) objets.update(dt); });
HOOKS.draw.push((buf, sbuf, cam) => { if (farm.s && game.world && game.world === farm.w) objets.dessiner(buf, cam); });
HOOKS.day.push(() => { if (farm.s) objets.jour(); });
HOOKS.load.push(() => { if (farm.s && game.world) objets.charger(); });
