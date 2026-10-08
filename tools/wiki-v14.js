// Le wiki — LA QUATORZIÈME VAGUE : la Grande Porte et les Terres d’Avant (leurs régions, leurs feux de veille, la
// discrétion, leur plan), le Ver qui veille au-dessus, Hautguet le château des Hauts ; la bibliothèque (quarante-six livres
// nouveaux rangés par rayons, l’Enfer, la clé de la Grande Porte), les gobelins, la main du crocheteur et le cambriolage
// de nuit. Rédigé d’après les modules src/*U-*, *V1-*, *V3-*, *V4-*, *X-*, *Y-* (et les notes de leurs auteurs).
// tools/wiki-build.js appelle :
//  - extract(G, w, DB, O) à la fin de l’extraction : les Terres d’Avant, générées une fois dans la machine virtuelle
//    comme à la première entrée dans le jeu (leur plan : une image et des repères), les jours où la Porte est fermée,
//    quelques textes qui ne sont pas des tables → DB.world.v14 ;
//  - build(X) avec ses outils : les fiches (les tables du jeu fournissent ce qui se compte : paliers, bruits, heures,
//    portées, prix, répliques) ;
//  - sections(cats, X) : « La Grande Porte et les Terres d’Avant » (après « Le Dessous »), « Les gobelins » (après « Les
//    bêtes qui parlent ») ; la main du crocheteur et le cambriolage vont dans « Maisons, lits et serrures », les livres
//    se rangent par rayons dans « Livres » ;
//  - plans(DB, wiki, out) : le plan des Terres d’Avant (l’onglet « terres » des cartes).
// « ** » met en gras, « [[id|texte]] » fait un lien vers une fiche ; ce qui se cache va sous « révéler les secrets ».
// Une partie de la vague qui arrive plus tard (les créatures de la Zone, la ville d’en dessous, les trajets…) s’ajoute
// de la même façon : sa lettre dans AGENTS (ses tables ne vont plus dans « Autres tables », ses modules n’ont plus de
// fiche d’office), un CHAPITRE (ses fiches), ses fiches dans SECTIONS, et s’il le faut une COUCHE du plan (ses repères)
// et un mot dans REGIONS (ce qu’il y a dans chaque région).
'use strict';

// les étiquettes des modules de la vague (leurs tables sont lues ici ; leurs modules n’ont pas de fiche d’office)
const AGENTS = ['U', 'V1', 'V3', 'V4', 'X', 'Y'];
const vagueRE = () => { const L = AGENTS.join('|'); return new RegExp(`^(05-z+(${L})-|07-z+(${L})-|09-z+(${L})-|10-z+(${L})-|11-zzzz(${L})-|12-z+(${L})-)`); };

// ================================================================ les textes
// ---------------------------------------------------------------- la Grande Porte (V1)
const PORTE = {
  lead: 'Dans la paroi des monts de l’est, au bout de la route qui part de Clairpré et passe par les ruines, une façade de vieille pierre presque noire, enfoncée dans la roche : la Grande Porte. Derrière, [[sys:terres-avant|les Terres d’Avant]]. Elle est **parfois fermée à clé**, et la clé est à la grande bibliothèque.',
  voir: [
    'Une façade de vingt-quatre mètres, enfoncée dans la paroi (des pans de roche la débordent de part et d’autre et la surplombent) : quatre pilastres, une corniche, une frise d’« yeux » — des creux sombres.',
    'Deux statues agenouillées, tête basse, les mains ouvertes vers la Porte ; deux braseros sur des fûts de pierre ; des marches, et une stèle au pied des marches.',
    'Deux vantaux de chêne noir cerclés de fer, hauts comme trois maisons. Devant, une esplanade nue ; le long de la route, trois bornes de pierre.',
  ],
  fermee: [
    '**Tout le jour des morts**, le Vorndi : de six heures du matin à six heures le lendemain.',
    '**Les matins de brume** : de 5 h à 11 h, les jours dont le temps prévu a du brouillard.',
    '**Certaines nuits** : de 22 h à 5 h, une nuit sur trois environ, au hasard (de la partie et du jour).',
  ],
  signes: 'Fermée, une barre de fer est passée dans les anneaux, la serrure attend une clé, et les braseros sont éteints ; on entend la barre retomber (jusqu’au hameau, dit l’éleveuse). Ouverte, l’un des vantaux n’est pas tout à fait fermé : un souffle froid passe par la fente, et il sent la cendre.',
  cle: 'Avec [[it:cle_grande_porte|la clé de la Grande Porte]], la Porte fermée s’ouvre — pour une heure, le temps de passer. La clé ne s’use pas. Le crochetage ne l’ouvre pas.',
  passer: [
    '**E** sur la Porte : « Pousser le vantail et passer ».',
    'Pas à cheval : le cheval refuse d’avancer, les oreilles couchées. Le chien s’arrête au pied des marches et ne vous suit pas.',
    'La première fois, les Terres d’Avant se font (quelques secondes, derrière un écran d’attente) ; ensuite, on passe aussitôt.',
    'De l’autre côté, la Porte n’a ni serrure ni barre : on la repasse quand on veut, même les jours où elle est fermée de ce côté-ci.',
  ],
};

// ---------------------------------------------------------------- les Terres d’Avant (V1)
const TERRES = {
  lead: 'Derrière la [[sys:grande-porte|Grande Porte]], un second pays : les Terres d’Avant. Gris, brumeux, couvert de cendre par endroits, ruiné, et gardé. Deux fois la surface de la vallée, et rien n’y est à personne.',
  temps: [
    'Le même jour, la même nuit que la vallée : la ferme pousse pendant qu’on y est, les jours passent, les habitants vivent leur journée et sont à leur place de l’heure quand on revient. On peut y mourir pour de bon.',
    'Souvent de la brume ; de la pluie ; de la cendre grise qui tombe sur les Cendrières ; un ciel plus gris et plus bas que dans la vallée. Pas d’oiseaux ni de grillons : le vent, des bois qui craquent, une cloche fêlée très loin, une plainte. La musique y est celle « du dessous ».',
  ],
  chemins: 'Des chemins relient les régions : **la Voie**, pavée, monte du Seuil à la Ville Basse ; de là, des chemins vont au Bois Mort et aux Cendrières (à l’ouest), aux Ravines et à l’Étang des Noyés (à l’est), aux Tertres (au sud-est) ; **les Degrés** montent au nord, par des rampes, jusqu’aux Hauts ; un sentier va du haut des Degrés au Pic. Tout autour, des montagnes qu’on ne franchit pas.',
  feux: [
    'Six **feux de veille** : au Seuil, au Bois Mort, aux Cendrières, à la Ville Basse, aux Ravines et aux Degrés. Un cercle de pierres noires, une lame rouillée plantée dans la cendre.',
    '**E** : « Souffler sur la braise » (il s’allume), puis « S’asseoir et se reposer » : la vie et le souffle reviennent, les saignements s’arrêtent, la nuit passe si c’est la nuit (sinon une heure), et **la partie s’enregistre**.',
    'On s’y réveille si l’on s’effondre à trois heures du matin. **Le dernier feu allumé vous garde de la mort, une fois** : on s’y réveille, à trente points de vie, et il s’éteint (« Le feu de veille vous a gardé. Il en est mort. ») ; on ne le rallume pas le jour même.',
    'L’élixir du dernier souffle, [[it:larme_aela|la larme d’Aëla]] et [[it:chronographe|le chronographe]] retiennent la mort ici aussi (ils passent avant le feu) ; les Enfers, non : ils ne sont pas sous les Terres d’Avant.',
    'Si l’on s’évanouit (l’épuisement) : on se réveille au matin près du dernier feu allumé (ou au Seuil), un peu plus mal en point.',
  ],
  pasIci: 'On ne dort pas dans les Terres d’Avant (sauf aux feux), on n’y bâtit rien, on n’y laboure rien. Le sifflet n’appelle pas le cheval : il est resté de l’autre côté.',
  guettent: 'Ce qui y vit guette : on y passe en se faisant oublier ([[sys:discretion|la discrétion]]). Au-dessus de tout, le jour, [[sys:ver|le Ver]]. Sur les Hauts, [[sys:hautguet|Hautguet]], le château.',
  secret: {
    raccourcis: [
      '**Le pont-levis des Ravines** : en venant de la Ville Basse vers l’est, la travée du milieu du grand pont est levée — deux volées de planches dressées, debout sur les piles, au-dessus d’une entaille de quarante mètres. On fait le tour (par le nord : le premier palier des Degrés, un sentier vers l’est ; ou par le bout sud de l’entaille) ; au bout du pont, de l’autre côté, un long levier : « Peser de tout son poids ». Le pont reste baissé (et ça s’entend loin).',
      '**L’échelle des Degrés** : au pied d’une paroi entre deux paliers, des traces d’échelle ; elle a été tirée en haut. On monte par le chemin, on la trouve couchée dans l’herbe au bord de la paroi : « La faire glisser ». Ensuite on monte et on descend par elle.',
      '**La grille des Tertres** : l’enclos de pierre des Tertres a deux entrées ; la grille de l’ouest (vers la Voie) est barrée de l’intérieur. On entre par l’est, on la lève de l’intérieur.',
      '**Les boyaux des Degrés** (deux) : au pied d’une paroi, un pan de roche posé contre la falaise, qui sonne creux ; deux coups et il tombe ; derrière, un boyau où l’on monte à quatre pattes jusqu’au palier du dessus (on ressort par une dalle). D’en haut, la dalle est scellée : on ne l’ouvre que d’en bas. Ensuite, on monte et on descend par là.',
    ],
    recoins: [
      '**Les caveaux** (neuf : aux Tertres, au Bois Mort, à la Ville Basse, aux Cendrières, aux Ravines) : un petit caveau de pierre fermé ; E sur le mur de devant : « (Le mur sonne creux.) » ; encore E : il tombe (et ça s’entend loin) ; dedans, un tombeau (de vieilles pièces, un bijou, une relique, une figurine, parfois une gemme, un peu d’argent).',
      '**Les caves** (quatre, à la Ville Basse) : une trappe dans la poussière ; une cave de pierre, des caisses pourries, une échelle pour remonter.',
      '**Les tours creuses** (trois, à la Ville Basse) : une porte basse, une échelle intérieure, une plate-forme à merlons, une niche, et la vue.',
      '**Les corniches** (sur les falaises des Degrés) : une saillie à mi-paroi, des os, un sac de toile ; on y descend en sautant d’en haut (attention à la chute).',
      '**Sous trois tertres, un roi** (les trois plus grands des Tertres) : au pied du tertre, une dalle de pierre debout ; « Pousser la dalle » : elle pivote, on se glisse dessous, dans une chambre de pierre (prendre la lanterne) ; sur un lit de pierre, des os, et ce qu’on avait enterré avec le roi. On remonte par où l’on est venu ; la dalle reste ouverte.',
      '**Les maisons brûlées des Cendrières** (cinq) : des ruines aux pierres noircies de suie, une souche.',
      '**La barque de l’Étang** : une barque à moitié coulée près de la rive, un ponton pourri (une planche manque) ; il reste quelque chose au fond (une fois).',
      '**La cabane du bûcheron** (au Bois Mort) : quatre murs, un bout de toit, un tas de bûches, un coffre de bois. Pas loin, un arbre mort avec une corde : « (La corde est neuve.) »',
      'Une douzaine d’**inscriptions**, une par région ou presque (voir chaque région).',
    ],
    passages: [
      '**Le puits sec des Cendrières** : on y descend en s’accrochant aux pierres, et l’on ressort près du [[li:vieux_puits|vieux puits]] du [[li:hameau_abandonne|hameau abandonné]], au sud de la vallée.',
      '**La fente du Pic** : sur les pentes du Pic, une fente dans la roche ; on ressort près de [[li:antre|l’antre]], au pied des monts de l’est.',
      'On ne rentre pas par eux : ils se referment derrière vous (« La roche s’est refermée derrière vous. »).',
    ],
    avant: 'Les fermiers des parties passées (ceux du registre des versions) qui sont morts dans les Terres d’Avant y laissent leurs restes, là où ils sont tombés : un corps, une besace, et la même lettre de notaire que la vôtre. **E** : on lit qui c’était (son nom, sa version, ses jours, sa mort), et l’on garde ce qu’il avait sur lui (quelques pièces).',
  },
};

// ---------------------------------------------------------------- les régions (V1) ; ce que d’autres y ajoutent va dans .secret
// ou : où elle est ; court : un mot (le tableau) ; texte : ce qu’on y voit ; voir : de plus ; secret : ce qui s’y cache
const REGIONS = {
  seuil: { i: '⊓', ou: 'au sud, au pied de la paroi', court: 'la cour où l’on arrive par la Porte',
    texte: 'Une cour au pied de la paroi du sud, là où l’on arrive par la Grande Porte. Des murets écroulés, une arche brisée, une stèle ; le premier feu de veille.',
    voir: ['De ce côté, la Porte n’a ni serrure ni barre — seulement des traces de mains, très haut sur le bois : **E**, et l’on rentre dans la vallée.', '**La Voie**, pavée, part vers le nord : elle monte jusqu’à la Ville Basse.', 'Le Ver survole le Seuil et la Porte, dans ses rondes.'] },
  bois_mort: { i: '♣', ou: 'au sud-ouest', court: 'une forêt d’arbres morts',
    texte: 'Une forêt d’arbres morts, des herbes hautes, des souches, des os. On s’y cache bien ; on y voit mal.',
    voir: ['Un chemin y vient de la Ville Basse ; un autre continue au nord, vers les Cendrières.'],
    secret: ['La **cabane du bûcheron** : quatre murs, un bout de toit, un tas de bûches, un coffre de bois. Pas loin, un arbre mort avec une corde : « (La corde est neuve.) »'] },
  cendrieres: { i: '♨', ou: 'à l’ouest', court: 'un marais de cendre et d’eau noire',
    texte: 'Un marais de cendre et d’eau noire, des feux follets, un puits sec. Il y tombe de la cendre grise.',
    voir: ['Un chemin y vient du Bois Mort et de la Ville Basse.'],
    secret: ['Cinq **maisons brûlées** : des ruines aux pierres noircies de suie, une souche.', 'Le **puits sec** : on y descend en s’accrochant aux pierres, et l’on ressort près du [[li:vieux_puits|vieux puits]] du hameau abandonné, au sud de la vallée (le passage se referme : on ne rentre pas par là).'] },
  ville_basse: { i: '⌂', ou: 'au centre', court: 'une ville en ruines',
    texte: 'Une ville en ruines, au centre des Terres d’Avant : une cinquantaine de maisons écroulées, des tours creuses, des caves sous des trappes. La Voie y arrive du Seuil ; de là partent les chemins vers toutes les régions, et les Degrés vers le nord.',
    secret: ['Trois **tours creuses** : une porte basse, une échelle intérieure, une plate-forme à merlons, une niche (et la vue).', 'Quatre **caves** : une trappe dans la poussière ; une cave de pierre, des caisses pourries, une échelle pour remonter. Dans l’une, des traits de craie et « IL N’Y A PAS DE NUIT ICI. SEULEMENT DES JOURS PLUS SOMBRES. »'] },
  ravines: { i: '⩚', ou: 'à l’est', court: 'deux entailles profondes, un pont',
    texte: 'Deux entailles profondes dans le plateau, à pic, d’une quarantaine de mètres ; un grand pont au-dessus de la première, sur le chemin qui vient de la Ville Basse.',
    voir: ['Un chemin remonte au nord, vers l’Étang des Noyés.'],
    secret: ['**Le pont-levis** : en venant de la Ville Basse, la travée du milieu est levée — deux volées de planches dressées sur les piles, au-dessus du vide. On fait le tour (par le nord : le premier palier des Degrés, un sentier vers l’est ; ou par le bout sud de l’entaille), et au bout du pont, de l’autre côté, un long levier : « Peser de tout son poids ». Le pont reste baissé, et ça s’entend loin.'] },
  etang: { i: '≈', ou: 'à l’est, au nord des Ravines', court: 'un lac profond',
    texte: 'Un lac profond et noir, des roseaux, une falaise au-dessus.',
    voir: ['Un chemin y descend des Ravines.'],
    secret: ['Une **barque** à moitié coulée près de la rive, un ponton pourri (une planche manque) : il reste quelque chose au fond (une fois).'] },
  tertres: { i: '⌓', ou: 'au sud-est', court: 'des tumulus, des pierres dressées',
    texte: 'Des tumulus, des pierres dressées, un enclos de pierre à deux entrées.',
    voir: ['Un chemin y vient de la Voie.'],
    secret: ['**La grille de l’ouest** de l’enclos (vers la Voie) est barrée de l’intérieur : on entre par l’est, on la lève de l’intérieur ; ensuite on passe par là.', '**Sous les trois plus grands tertres, un roi** : au pied du tertre, une dalle de pierre debout ; « Pousser la dalle » : elle pivote, on se glisse dessous, dans une chambre de pierre (prendre la lanterne) ; sur un lit de pierre, des os, et ce qu’on avait enterré avec le roi. On remonte par où l’on est venu ; la dalle reste ouverte.'] },
  degres: { i: '☰', ou: 'au nord', court: 'six paliers taillés en falaises',
    texte: 'Six paliers taillés en falaises, l’un au-dessus de l’autre ; le chemin y monte par des rampes. En haut, le chemin des Hauts part vers l’est, et le sentier du Pic vers l’ouest. Le feu de veille des Degrés est le dernier avant le château.',
    secret: ['**L’échelle** : au pied d’une paroi entre deux paliers, des traces d’échelle ; elle a été tirée en haut. On monte par le chemin, on la trouve couchée dans l’herbe au bord de la paroi : « La faire glisser ». Ensuite on monte et on descend par elle.', '**Deux boyaux** : au pied d’une paroi, un pan de roche posé contre la falaise, qui sonne creux ; deux coups et il tombe ; derrière, un boyau où l’on monte à quatre pattes jusqu’au palier du dessus (on ressort par une dalle). D’en haut, la dalle est scellée : on ne l’ouvre que d’en bas.', 'Des **corniches**, à mi-paroi : des os, un sac de toile ; on y descend en sautant d’en haut (attention à la chute).'] },
  hauts: { i: '⛫', ou: 'au nord-est', court: 'un grand replat haut ; un château',
    texte: 'Un grand replat, très haut, au nord-est ; on y monte par les Degrés, puis un long chemin vers l’est. Au bout : [[sys:hautguet|Hautguet]], le château.',
    voir: ['On voit d’abord le château dans la brume : des tours, la flèche très haute de la tour de la Dame, pas une lumière.'] },
  pic: { i: '▲', ou: 'au nord-ouest', court: 'une montagne de roche',
    texte: 'Une montagne de roche, au nord-ouest, la plus haute des Terres d’Avant. Un sentier y monte depuis le haut des Degrés. Au sommet, la nuit, [[sys:ver|le Ver]] dort.',
    secret: ['**La fente du Pic** : sur les pentes, une fente dans la roche ; on ressort près de [[li:antre|l’antre]], au pied des monts de l’est (dans un seul sens).', '**L’aire**, au sommet, et la chaîne qui y monte : voir [[sys:ver|le Ver]].'] },
};
// les feux de veille (V1_FEUX) : leur région
const FEU_REGION = { feu_seuil: 'seuil', feu_bois: 'bois_mort', feu_cendres: 'cendrieres', feu_ville: 'ville_basse', feu_ravines: 'ravines', feu_degres: 'degres' };
// les perchoirs du Ver (V3) : leur région, ce qu’il y a
const PERCHOIRS = {
  dragon_perchoir_1: ['degres', 'le haut des Degrés', 'une borne et ses anneaux de fer : « ICI L’ON ATTACHAIT CE QU’ON LUI DEVAIT »'],
  dragon_perchoir_2: ['etang', 'la falaise de l’Étang', 'des entailles dans le roc, une écaille tombée'],
  dragon_perchoir_3: ['cendrieres', 'l’aiguille des Cendrières', 'un heaume à demi fondu, une écaille'],
  dragon_perchoir_4: ['ravines', 'le rebord des Ravines', 'une grande arbalète de rempart renversée, une lance'],
  dragon_perchoir_5: ['bois_mort', 'la butte du Bois Mort', 'des encoches dans une pierre plate, une écaille'],
  dragon_perchoir_6: ['hauts', 'la crête du nord', 'la loge du Guet : une paillasse, un carnet, la cloche'],
};

// ---------------------------------------------------------------- la discrétion (V1)
const DISCRETION = {
  lead: 'Dans les Terres d’Avant, ce qui guette vous voit, vous entend, et se souvient. On y passe en se faisant oublier : à couvert, accroupi, sans lumière, sans bruit.',
  montre: [
    '**La lumière** : le plein jour, la lune, la lanterne (qu’on voit de loin), un feu tout près ; l’ombre d’un toit cache.',
    '**Le mouvement** : immobile, accroupi, au pas, en courant.',
    '**Le bruit** : les pas s’entendent à 2,5 m accroupi, 8 m au pas, 18 m en courant ; plus dans l’eau ; une chute, un mur qui tombe, un pont, une grille s’entendent loin.',
  ],
  cache: '**S’accroupir** (C), surtout dans les **herbes hautes**, les roseaux, les buissons, les fougères ; et l’ombre.',
  guetteur: 'Ce qui guette voit dans un cône devant lui (de côté, moins ; dans le dos, presque rien), moins loin la nuit ; il entend ; il se souvient du dernier endroit où il vous a vu ou entendu. Il est **tranquille**, puis **intrigué** (il regarde), **alerté** (il a vu : il vient), il **cherche** (au dernier endroit), puis **abandonne** et se calme.',
  pierre: '**Jeter une pierre** : dans les Terres d’Avant, clic droit les mains nues (ou la pierre en main), si l’on a des pierres (les cailloux se ramassent à la pioche) : elle tombe là où l’on regarde, à vingt-cinq mètres au plus ; ceux qui l’entendent vont voir.',
  oeil: 'L’œil, en haut de l’écran, petit et à demi transparent, suit le plus inquiet de ce qui guette à moins de quatre-vingt-dix mètres (et [[sys:ver|le Ver]], de bien plus loin).',
};
const FURTIF_NOMS = { tallgrass: 'les herbes hautes', reeds: 'les roseaux', bush: 'les buissons', berry: 'les buissons à baies', fern: 'les fougères', heather: 'la bruyère', wheat: 'le blé', sunflower: 'les tournesols' };

// ---------------------------------------------------------------- le Ver (V3)
const VER = {
  lead: 'Au-dessus des Terres d’Avant, quelque chose veille : un dragon noir, très vieux, à deux pattes et deux grandes ailes — une wyverne. Les livres de la bibliothèque l’appellent « le Ver ». Le jour, il fait ses rondes et brûle ce qui bouge à découvert ; la nuit, il dort au sommet du Pic. Il ne passe jamais la Porte.',
  entendre: 'On l’entend : des battements lourds qui portent loin, un grondement, un cri qui roule d’un bout à l’autre des Terres d’Avant ; quand il passe bas, un souffle de vent. On voit son ombre glisser au sol, le jour. [[sys:discretion|L’œil]], en haut de l’écran, s’ouvre aussi pour lui, de loin. La première fois qu’on le voit : « (Ce n’est pas un nuage.) »',
  voit: [
    'Il voit **ce qui est à découvert**, de haut, dans un grand cône devant et sous lui (presque rien derrière ni au-dessus), et surtout **ce qui bouge** : c’est le berger du conte, qui le trompa en ne bougeant pas.',
    'Dans la brume, il ne voit pas plus loin que vous — alors il vole plus bas, et l’immobilité ne suffit plus.',
    'Il ne voit **jamais** : sous un toit, sous terre, dans les salles couvertes du château, dans une chapelle ; ni à travers les murs ou le relief.',
    'Il **entend** : posé, très bien ; en vol, moins (il est souvent très haut) ; endormi, un pas de course à vingt-cinq mètres, un pas accroupi seulement tout contre sa tête. **Un coup de fusil** s’entend de très loin : il vient voir.',
    'Comme ce qui guette, il est tranquille, puis **intrigué** (il grogne, et vient tourner au-dessus de l’endroit), **alerté** (il rugit), il **cherche** (des cercles bas au dernier endroit), puis il **abandonne**.',
  ],
  // portées mesurées (agent V3), en plein jour, par temps clair
  portees: [['debout, en marchant', '≈ 185 m'], ['en courant', '≈ 190 m'], ['immobile', '≈ 115 m'], ['accroupi, immobile', '≈ 90 m — de sa hauteur de ronde, il ne vous voit pas'], ['accroupi dans les herbes hautes', '≈ 55 m'], ['sous des arbres serrés', '≈ 90 m'], ['la nuit', '≈ 35 m'], ['la nuit, la lanterne allumée', '≈ 135 m']],
  attaque: [
    '**Alerté**, il s’éloigne pour se mettre en ligne, **pique** et **crache en rase-mottes** : le jet balaie le sol devant lui sur {portee} mètres. **{passes} passes au plus**, puis il cherche, puis il abandonne. Il faut une quinzaine de secondes entre son rugissement et la première flamme : c’est le temps de se cacher.',
    '**Une passe ne tue pas** (une quarantaine de points de vie) ; trois, si l’on reste à découvert. On brûle encore un peu après (l’eau l’éteint). **Posé**, il se dresse et crache droit sur vous.',
    'Le feu **ne passe ni les toits ni la pierre** ; sous l’eau, sous terre, on ne craint rien.',
    '**Il brûle les Terres d’Avant** (et elles seules) : l’herbe haute, les roseaux, les buissons, les fougères, la bruyère, le bois mort prennent feu et gagnent alentour (pas sous la pluie) ; ce qui a brûlé disparaît, le sol devient cendre. **L’herbe brûlée ne cache plus personne.** Tout repousse en {repousse} jours. Rester dans l’herbe qui brûle tue.',
  ],
  echapper: 'Sous un toit (une ruine qui a encore son toit, une tour, une cave par une trappe), sous terre, dans l’eau, sous les arbres serrés ; accroupi dans les herbes hautes (tant qu’elles ne brûlent pas) ; la nuit. Ne pas courir à découvert devant lui.',
  secret: {
    aire: [
      '**L’aire** : le sommet du Pic, au nord-ouest, à plus de deux cent soixante-dix mètres — un replat de roche noire et de cendre, entouré de blocs dressés. Le sentier du Pic (depuis le haut des Degrés) s’arrête au pied de la roche ; une vieille **chaîne** pend du bord de l’aire jusqu’au bout du sentier (E : « Monter ») : « LE GUET MONTE. NUL AUTRE NE MONTE. » Elle tinte en haut : s’il dort, il peut l’entendre.',
      '**Là-haut** : sa couche (de la cendre, de l’obsidienne), **le tas** (ce qu’il a pris à ceux qui sont venus : épées tordues, casques, vieilles pièces, bijoux, os), **l’anneau de fer** scellé dans le roc, des os, des côtes géantes, et **le dernier guetteur**, assis contre le roc, tout près de l’endroit où il pose la tête, une grosse clé noire dans la main.',
    ],
    cloche: '**La cloche du Guet**, à la loge de la crête du nord : le jour, la sonner le fait rentrer à son aire pour deux heures — où qu’il soit, s’il ne vous chasse pas. La nuit, rien ne répond.',
    fins: [
      '**Le délivrer** : la nuit, pendant qu’il dort, monter à l’aire, prendre la clé du dernier guetteur, s’approcher de son cou et ouvrir le collier (E sur le collier : « Tourner la clé »). Il s’éveille, se lève, regarde, et s’en va vers le nord par-dessus les montagnes. Il ne revient pas : plus d’ombre, plus de feu, plus de cris dans les Terres d’Avant. Un matin, dans la vallée, une écaille encore tiède sur le seuil.',
      '**Le tuer** : presque impossible. Tout ricoche sur lui (« La balle a sonné sur lui comme sur une cloche. »), sauf **sous l’aile gauche**, où le carreau est resté planté : {pv} points de vie (une dizaine de balles de fusil dans la plaie, ou deux douzaines de flèches de fer tirées à fond) ; touché, il sait d’où ça vient ; il guérit en {guerison} jours. Mort, il tombe et **son corps reste** où il est tombé : on peut y prendre son cœur, quatre écailles, trois dents.',
    ],
    delivrer: [
      'Partir de jour pour arriver au pied de la chaîne avant la nuit (le sentier monte depuis le haut des Degrés ; se tenir sous le relief, s’accroupir dans les herbes quand l’ombre passe), ou monter de nuit sans lanterne.',
      'Attendre qu’il dorme (après 21 h 30), monter à la chaîne (le dernier maillon tinte : rester accroupi un moment), puis avancer **accroupi** jusqu’au dernier guetteur, à quelques mètres de sa tête : prendre la clé fait un petit bruit d’os (parfois il bouge, un œil s’entrouvre : ne plus bouger le temps qu’il se rendorme).',
      'Toujours accroupi, aller à son cou : le collier se montre (E) quand on est tout près. Une lanterne allumée à moins de quarante mètres peut l’éveiller ; courir aussi.',
      'Ne pas fouiller le tas avant (le bruit de ferraille). Si un œil s’entrouvre (une lueur dans le noir) : ne plus bouger, accroupi ; il se rendort.',
    ],
    tuer: 'La plaie est sous l’aile gauche, au flanc, derrière l’épaule (le bout du carreau dépasse) : on la vise de côté, à gauche, quand il est posé ou qu’il se dresse pour cracher, ou par-dessous quand il passe bas. Dix balles ; il faut se cacher entre les tirs (il sait d’où ça vient, et il guérit en deux jours).',
    histoire: 'Le Ver gardait les Terres d’Avant pour le seigneur du château des Hauts, lié par un collier de fer. Douze hommes, « le Guet », le nourrissaient et le faisaient rentrer à la cloche. Le soir où la cendre est tombée, le seigneur est monté au Pic et lui a donné un dernier ordre : « Qu’il garde. Que rien ne sorte. » Ceux de la Ville Basse ont voulu passer la Porte : il a fait ce qu’on lui avait dit. Le château s’est tu, le Guet est mort de faim un à un ; le dernier est monté, une nuit, la clé du collier à la ceinture, pour la lui ôter pendant qu’il dormait. Il n’est pas redescendu : il est encore assis là-haut, la clé dans la main, et ses os ne sont pas noircis — le Ver ne l’a pas brûlé. Un seul carreau de baliste l’a jamais blessé, sous l’aile gauche. Il garde encore, parce que personne ne lui a dit d’arrêter.',
    tas: 'Le tas se fouille six fois au plus (chacune fait un bruit de ferraille — s’il dort tout près, il peut s’éveiller) : de vieilles pièces, des bijoux, des reliques, une gemme, parfois un lingot d’or ou une dent du Ver ; environ mille pièces en tout.',
    petites: [
      'Posé, endormi ou mort, il a un corps : on ne le traverse pas ; sous un Ver debout, on passe entre ses pattes.',
      'Les encoches de la butte du Bois Mort (« Il passe au-dessus du bois deux fois le jour… J’ai cessé de compter à mille ») : c’était vrai du temps de celui qui comptait ; aujourd’hui, il va surtout voir là où vous êtes.',
      'Le feu du Guet de [[sys:hautguet|Hautguet]], rallumé : de jour, il vient tourner bas au-dessus du château, puis repart.',
    ],
  },
};

// ---------------------------------------------------------------- Hautguet (V4)
const HAUTGUET = {
  lead: 'Au nord-est des Terres d’Avant, sur le grand replat des Hauts, le château des sires qui tenaient le feu du Guet. On y monte par les Degrés (leur feu de veille est le dernier avant le château), puis un long chemin vers l’est. On le voit d’abord dans la brume : des tours, la flèche très haute de la tour de la Dame, pas une lumière.',
  arrivee: 'Le chemin finit au bord d’un **fossé** sec, maçonné, de six mètres de fond, devant le **châtelet** : le **pont-levis est levé** — de ce côté, ni corde ni chaîne : on ne le baisse que de l’intérieur.',
  plan: [
    ['Le châtelet', 'la porte de l’ouest : le passage sous la voûte ; la loge du portier ; le corps de garde (paillasses, râteliers) ; par l’escalier à vis, la salle du treuil (le treuil du pont-levis, un brasero qui brûle encore) ; la terrasse'],
    ['La basse-cour', 'les écuries (mangeoires, os de chevaux ; une échelle au fenil), la caserne (châlits, coffres de soldats), la forge, un puits, le cimetière (une fosse ouverte), des arbres morts, des charrettes renversées ; l’escalier du chemin de ronde nord ; les tours d’angle et du milieu (des vis, un coffre en haut de plusieurs d’entre elles)'],
    ['Le mur de la haute cour', 'sa porte et sa **herse**, baissée'],
    ['La haute cour', 'dallée : les cuisines (la grande cheminée, le chaudron, le four, la huche) et leur cave ; la grand-salle (les longues tables, l’estrade, le siège du sire tourné vers le mur, deux cheminées, des tapisseries, des bannières, une tribune ; le toit a cédé au-dessus des tables : le jour y tombe) ; le logis (en bas le bureau du sénéchal ; en haut la chambre de la Dame : un berceau vide, un miroir, un métier à tisser) ; une galerie couverte ; la chapelle (vitraux, autel, cierges qui brûlent encore, un lutrin), son clocher et sa sacristie fermée ; le puits ; le jardin de la Dame (un bassin sec, des rosiers morts) ; la poterne de l’est'],
    ['Le donjon', 'au milieu de l’est, vingt-six mètres : un escalier de pierre jusqu’à la porte haute (fermée) ; la salle basse ; la chambre du sire ; la salle haute (les réserves vides du Guet) ; la terrasse, et le **feu du Guet**, le grand fanal éteint'],
    ['La tour de la Dame', 'l’angle nord-est, octogonale, une flèche de quarante mètres : fermée à clé ; en haut, la chambre de la Dame, sa fenêtre tournée vers la Ville Basse'],
    ['Sous terre', 'la crypte (les tombeaux des sires, un ancien ossuaire), les cachots (la salle du geôlier, deux rangées de cellules, la salle de la question), la fosse du donjon, et le souterrain jusqu’au charnier, hors les murs à l’est'],
  ],
  entrer: [
    '**La brèche** de la courtine sud (à l’ouest du milieu de la basse-cour) : des gravats en pente, on passe à pied.',
    '**Le chemin de ronde nord** : l’escalier de pierre de la basse-cour ; vers l’est, un pan s’est effondré (3,6 m) : on le saute **en courant** ; on arrive dans la tour des cuisines, la vis descend, une porte donne sur l’allée des cuisines, et la haute cour. Du chemin de ronde, on peut aussi marcher sur les toits du corps de logis.',
    '**Le conduit des latrines** : au pied de la courtine nord, dehors (on fait le tour du château par le nord), une bouche de pierre noire : on monte dans l’épaisseur du mur jusqu’aux latrines de la chambre de la Dame, dans le logis.',
  ],
  gens: [
    '**Thibaud**, un vieil homme, à la salle du treuil du châtelet, assis près du brasero, une couverture sur les épaules. Il parle peu.',
    '**La Dame**, dans sa tour : on ne la voit pas ; on lui parle à travers la porte, **la nuit seulement** (de 21 h à 5 h ; le jour, rien ne répond). Ce qu’elle dit dépend de ce qu’on a fait.',
    'Et les morts, là où ils sont restés.',
  ],
  cloche: 'La corde de la cloche de la chapelle : la tirer, c’est appeler tout le château — une diversion, ou une erreur.',
  guet: 'Le **feu du Guet**, sur la terrasse du donjon : une corbeille de fer grande comme une charrette, des cendres très vieilles. « Il faudrait de l’huile. Beaucoup : trois jarres au moins. » Rallumé, il brûle jusqu’à la fin — une grande lumière, la nuit, sur les Hauts.',
  ver: 'Le Ver ne voit pas dans les salles couvertes du château (sauf sous le toit crevé de la grand-salle), ni sous terre ; il ne se pose pas sur le donjon.',
  traverser: 'On peut tout traverser sans se battre : il y a toujours un autre chemin, une ombre, une porte.',
  secret: {
    histoire: 'Les sires de Hautguet tenaient le **feu du Guet**, le grand fanal du donjon (le Guet : les hommes qui gardaient le Ver) : tant qu’il brûlait, la Ville Basse dormait — on veillait pour elle. Le jour de la foire, Aude, neuf ans, la fille du sire Aymon et de dame Ysolde, était descendue à la Ville Basse avec sa nourrice (le registre du portier : « Sorties : dame Aude, avec sa nourrice, pour la foire d’en bas. Le matin. »). Le soir, le feu du Guet ne brûlait pas, le Ver est descendu, la cendre est tombée sur la ville ; ceux d’en bas sont montés aux Hauts avec des torches. Aymon a ordonné de garder le pont levé (« Le pont restera levé. » — « Elle ne vous le pardonnera pas. »). Thibaud, au treuil, a obéi. Ils sont morts au fossé (les os contre le pont). Aymon a enfermé Ysolde dans sa tour pour qu’elle ne descende pas au treuil ; Hugues, le sénéchal, a enfermé Aymon dans son donjon et emporté la grande clé dans la crypte, avec les pères. Le tonnelier de la Ville Basse, Joachim Fève, avait frappé à la poterne pour qu’on les laisse entrer : on l’a fait entrer, lui, et on l’a mis aux cachots (soixante-trois marques). La cuisinière portait un pain à la tour, en cachette du sire, jusqu’à la Toussaint.',
    cles: [
      ['v4_cle_poterne', 'au clou, dans la loge du portier', 'la poterne de l’est (avec la barre ôtée de l’intérieur)'],
      ['v4_cle_chapelle', 'dans la huche des cuisines', 'la sacristie (et l’escalier de la crypte)'],
      ['v4_cle_donjon', 'dans la crypte, avec le sénéchal', 'la porte haute du donjon'],
      ['v4_cle_tour', 'sur la terrasse du donjon, sous la main du sire', 'la tour de la Dame'],
      ['v4_trousseau', 'aux cachots, dans la salle du geôlier', 'l’escalier des cachots (des deux côtés), une cellule'],
    ],
    ordre: 'Loge du portier (clé de la poterne) → cuisines, la huche (clé de la sacristie) → sacristie, escalier de la crypte → le sénéchal (grande clé du donjon) → la porte haute du donjon → la terrasse : le sire (petite clé de la tour, [[it:v4_anneau|l’anneau de Hautguet]]) → la tour de la Dame. Et du donjon, par l’oubliette, aux cachots : le trousseau du geôlier. La porte de la sacristie se crochète aussi (une bonne serrure).',
    raccourcis: [
      '**Le pont-levis** : le treuil, dans la salle du treuil du châtelet. Baissé, on va du plateau au châtelet sans détour.',
      '**La herse** de la haute cour : la roue, à l’étage de la porte, du côté de la haute cour.',
      '**La poterne de la dépense** (dans le mur de la haute cour, près des cuisines) : barrée du côté de la haute cour.',
      '**La poterne de l’est** : barrée de l’intérieur ET fermée à clé (la clé du portier) : on ôte la barre dedans, la clé fait le reste ; du dehors, la clé tourne mais la porte ne bouge pas tant que la barre est mise.',
      '**La grille du charnier** : des verrous par-dessous ; du charnier, on ne l’ouvre pas.',
      '**L’escalier des cachots** (la tour du geôlier) : une grille fermée ; le trousseau l’ouvre.',
    ],
    oubliette: 'Dans la salle basse du donjon, une trappe (« ON N’Y DESCEND QU’UNE FOIS. ») ; une corde pourrie y pend : elle casse au dernier mètre (quelques points de vie). La fosse n’a pas de porte : un trou à ras du sol, au sud, d’où monte de l’eau — le **boyau** mène aux cachots (on ne le remonte pas). Des cachots on sort par l’escalier du geôlier (le trousseau) ou par le souterrain et la grille du charnier.',
    murs: [
      'La tribune de la grand-salle, le mur ouest (une fissure) → la **cache au-dessus des cuisines** (un coffre : une huile).',
      'La chambre du sire (donjon), le mur est (une fissure) → **le trésor de Hautguet** (le plus beau coffre du château).',
      'La crypte, le mur est → **l’ancien ossuaire** (un coffret sous les crânes).',
      'La cave des cuisines, le mur ouest → **les économies de la cuisinière** (une huile, trois vieilles pièces, et le reste).',
    ],
    recoins: 'La bouche d’égout au fond du fossé ; le coffre du portier ; sous une paillasse du corps de garde ; le coffre du fenil ; trois coffres de soldats à la caserne ; les cendres de la forge ; la fosse ouverte du cimetière ; le coffre en haut de cinq tours ; le sac du guetteur oublié (chemin de ronde sud) ; le tiroir de la cuisine ; les bocaux de la cave ; le coffre au pied de l’estrade ; le coffre et l’armoire du sénéchal ; la malle de la Dame ; l’armoire de la sacristie ; le nid du clocher ; une niche de la crypte ; le sac de la salle basse du donjon ; le coffre du sire ; les jarres du Guet (une huile) ; le coffre de la servante (tour de la Dame) ; le seau au fond du puits (on y descend à la corde, dans la haute cour) ; le sac de la fosse ; le coffre du geôlier ; les cercles de tonneau du tonnelier ; sous cinq paillasses des cellules ; le **trou du fuyard** (une cellule du sud : derrière la paillasse, un trou ; il a creusé quatre mètres). Une fois chacun.',
    huiles: 'Trois huiles sont au château : la cache au-dessus des cuisines, les jarres de la salle haute du donjon, les économies de la cuisinière (dans la cave). On peut aussi en apporter de la vallée (l’huile de tournesol).',
    morts: 'Gaucher le portier (sa loge, mort à sa table), un soldat (la caserne), un guetteur oublié au bout du chemin de ronde sud, la cuisinière (près de l’âtre), un homme à la grand-salle, frère Anselme le chapelain (mort à genoux, dans la chapelle), Hugues le sénéchal (la crypte), le geôlier, le tonnelier (une cellule), deux dans la fosse, un au fond du puits, un fuyard, le sire Aymon (assis devant le feu du Guet, sur la terrasse du donjon), la Dame (sa tour).',
    fins: [
      '**Le pont baissé** : Thibaud se lève et regarde par la meurtrière ; le lendemain, il n’est plus au treuil : on le trouve assis au bout du pont, face aux Degrés, mort.',
      '**Le feu du Guet rallumé** : il brûle jusqu’à la fin ; le Ver le voit, et vient tourner bas au-dessus du château.',
      '**La porte de la Dame ouverte** (la petite clé de la tour) : en haut, elle, assise à sa fenêtre ; sa lettre, « À qui ouvrira ».',
      '**Les trois** — le pont baissé, le feu du Guet rallumé, la porte de la Dame ouverte : « Hautguet se tait. Pour la première fois, le silence ressemble à du sommeil. »',
    ],
  },
};

// ---------------------------------------------------------------- la bibliothèque (Y)
const BIBLIO = {
  lead: 'La grande bibliothèque range désormais chaque livre à sa place, par rayons, et en compte quarante-six de plus. On va chercher un livre là où il est rangé : on le feuillette sur place ; pour le lire en entier, on l’emprunte au comptoir.',
  ou: { bas: ['En bas, la salle de lecture', '« Parcourir les rayonnages », contre les rangées de gauche', 'feuilleter sur place'], galerie: ['À la galerie, au premier étage', 'l’échelle de meunier contre le mur, à gauche en entrant ; « Parcourir les rayonnages » au fond', 'feuilleter sur place'], archives: ['L’Enfer', 'quelque part sous la bibliothèque (secret)', 'lire en entier, sur place : rien ne sort'] },
  regles: [
    'Le panneau des rayonnages a **un onglet par rayon** ; chaque livre y montre son dos, de la couleur de sa reliure, son titre, son auteur, et « déjà lu » quand on l’a ouvert.',
    '**Feuilleter** : on lit sur place la page de titre et deux pages ; pour le reste, il faut l’emprunter.',
    '**Le comptoir** (« Parler de livres ») prête tout ce qui n’est pas dans l’Enfer, rangé par rayons : 10 pièces pour un jour, 25 pour trois, 40 pour sept (les lexiques et la réserve coûtent plus cher). On rend le jour dit, avant sept heures du soir ; en retard, le bibliothécaire devient ce qu’il devient ([[sys:bibliotheque|la grande bibliothèque]]). Trois emprunts au plus.',
    'Les livres d’avant ont reçu leur rayon (les contes de la veillée aux contes, les chroniques aux chroniques, les lexiques aux langues d’avant, l’atlas ancien aux cartes, les livres à secret à la réserve) : rien d’autre ne change pour eux.',
    '**L’Enfer** : sept livres qui ne sortent pas. On les lit en entier, sur place, là où ils sont rangés.',
    '**Les livres de serrurerie**, lus jusqu’au bout, font progresser [[sys:main-crocheteur|la main du crocheteur]] (douze points chacun, une fois) : {serrures}.',
    'Des livres parlent de la [[sys:grande-porte|Grande Porte]] et des [[sys:terres-avant|Terres d’Avant]], de biais, sans plan ni chemin ; d’autres des petits voleurs de la nuit ([[sys:gobelins|les gobelins]]), d’autres du Ver.',
  ],
};
// la clé de la Grande Porte (Y) : la fiche de l’objet
const CLE = {
  ouvre: 'La [[sys:grande-porte|Grande Porte]], les jours où elle est fermée (pour une heure). Elle ne s’use pas, ne se vend pas, ne va pas dans la caisse d’expédition ; on ne la donne à personne, sauf au bibliothécaire, pour la rendre. En main, clic : on la regarde.',
  demander: [
    'Au [[pnj:libraire|bibliothécaire]], « La Grande Porte… ». Il ne prête la clé qu’à un **lecteur exact** : trois livres rendus à l’heure et une bonne amitié (ou un seul livre rendu à l’heure, si on lui a montré [[it:fleur_temple|une fleur de pierre]]).',
    'Alors il pose **une question** (une par partie) ; la réponse est écrite dans un livre du comptoir. Une mauvaise réponse : « Lisez, et revenez. » — on peut réessayer le lendemain.',
    'Une bonne réponse, et il prête la clé : {durees}. En la prêtant, il dit si la Porte fermera cette nuit.',
    'Rendue à l’heure (au comptoir, en lui parlant, ou dans la boîte aux retours — la caution est alors rendue à la visite suivante), la caution revient entière. En retard : la caution reste au registre, il ne la prêtera plus, et le registre fait le reste — le sorcier, comme pour un livre ([[sys:bibliotheque|la grande bibliothèque]]).',
  ],
  perdre: 'Une clé qui n’est plus nulle part (ni dans la sacoche, ni dans un coffre, une charrette, une maison louée, la saisie de la prison…) revient d’elle-même à la bibliothèque **au bout de {retour}**. Prêtée, elle coûte alors la caution, et le bibliothécaire ne la prête plus (« Elle est revenue sans vous. Non. ») ; on peut aussi lui avouer la perte (« J’ai perdu la clé… ») : le prêt est rayé, la caution reste, et la clé rentre seule. Si la traque avait commencé pour elle, elle s’arrête quand la clé rentre, mais la bibliothèque vous est fermée.',
  anneau: 'L’anneau est gravé de Hautes Lettres, en aëlin ; le mot à mot se lit au fil des mots appris.',
  secret: {
    dort: 'Dans un **livre creux**, à la galerie : les [[lv:y_tables_mesures|Tables de concordance des anciennes mesures]], onglet « Traités et manuels », le dernier du rayon (« un in-folio lourd, que personne n’ouvre »). On le feuillette : deux pages de tables, puis la cavité, et la clé dedans (« Prendre la clé »). Il ne se prête pas. Quand il prête la clé, on voit le bibliothécaire aller la chercher dans un gros in-folio de la galerie.',
    indices: [
      'Le [[it:livre_y_journal_bibliothecaire|Journal d’un bibliothécaire]] : « ce qu’on veut garder, on ne le ferme pas, on le range… au milieu de ce que personne ne lit ».',
      'La ronde de la Grande Porte, dans les [[it:livre_y_comptines|Comptines, rondes et formulettes]] : « Ta clé dort au fond d’un livre ».',
      'Le [[lv:y_petit_albert|Petit Albert de la vallée]] (l’Enfer) : « le glisser dans un livre qu’on ne lit pas ».',
      'Le jeu de la clé, dans les [[it:livre_y_institutrice|Mémoires d’une institutrice de campagne]] : un caillou caché dans un livre.',
      'L’énigme de l’[[it:livre_y_almanach_veillees|Almanach des veillées]] : « qui me creuse me trahit ».',
      'Ce que dit le bibliothécaire en passant (les clés qui comptent se rangent « au milieu de ce que personne ne lit ») ; et, quand la vallée est inquiète : « Cette nuit, un livre de la galerie est tombé tout seul. Les Tables de concordance. »',
    ],
    prendre: [
      'Prise sans prêt, la clé est quand même inscrite au registre, d’une encre qui ne sèche pas : une lettre sans timbre arrive le lendemain matin, et il faut la rapporter **dans les trois jours** (au comptoir, dans la boîte, ou là où on l’a prise ; personne ne demande rien). Prise sur le fait, **un jour** seulement, et c’est un vol connu (la société, le garde). Ensuite, c’est un livre en retard.',
      '**Qui voit, qui entend** : sous ses yeux (éveillé, au même étage, tourné vers vous, ou à moins de 3,5 m), il reprend le livre : « Celui-là ne se feuillette pas. » À la galerie, il ne vous voit pas ; mais éveillé dans sa bibliothèque, il **entend** presque tout quand on soulève la clé (trois fois sur quatre ; un peu moins accroupi) : « Reposez-la. » — on la repose (rien de plus qu’un peu d’amitié perdue), ou on la garde (prise sur le fait).',
      '**La nuit**, il dort dans sa bibliothèque (le lit au fond de la salle de lecture), et la porte est fermée à clé : crocheter la porte (difficile), ou rester à l’intérieur avant la fermeture ; à la galerie, soulever la clé fait un petit bruit qui peut le réveiller ([[sys:cambriolage|le cambriolage de nuit]] : la main et la prudence comptent) — réveillé, il crie au voleur.',
    ],
    absences: [['Orédi', 'de 7 h à 8 h', 'la messe, à l’abbaye'], ['Chômedi', 'de 10 h à 12 h 30', 'l’abbaye'], ['Vorndi', 'de 16 h à 17 h', 'l’abbaye'], ['Nahédi', 'de 18 h à 19 h', 'le dolmen'], ['Foiredi', 'de 13 h à 14 h', 'les menhirs']],
    retour: 'Au retour des Terres d’Avant, le bibliothécaire dit, avant toute autre parole : « Rien n’est entré avec toi. »',
    gloss: 'kel : clé ; dal : porte ; teh : ici ; rhua : rends, reviens — « clé de la porte, reviens ici ».',
    biais: 'Ce que les livres disent de biais des Terres d’Avant : la pierre de la Porte n’est pas d’ici ; ses jours fermés (le jour des morts, les matins de brume, les nuits aux feux éteints ; de l’autre côté, elle s’ouvre toujours) ; les poternes qui ne s’ouvrent que d’un côté ; les feux qui ne s’éteignent pas et où l’on se réveille « compté » ; le Seuil, la Voie, la Ville Basse et les cloches qu’on entend sous ses dalles ; le Pic et le Ver qui veille, qui voit ce qui bouge et pas ce qui reste immobile ; Hautguet, sur les Hauts ; les bêtes des contes parties « de l’autre côté » ; ne pas porter de lumière.',
  },
};

// ---------------------------------------------------------------- les gobelins (X)
const GOB = {
  lead: 'Les gens d’ici les appellent « les Petits », « ceux d’en dessous », et rarement par leur nom. Une nichée de {nichee} gobelins et leur vieille vivent sous la vallée, dans un village creusé sous la terre : la Gobelinière. La nuit, ils sortent par des terriers, entrent dans les maisons à travers les murs, prennent ce qu’on ne regarde plus, et rentrent sous la terre. Ils restent loin des hommes : vus, ils fuient ; bloqués, ils passent dans les murs.',
  qui: 'Petits (un mètre, voûtés), maigres, gris-vert, les bras trop longs, la tête trop grosse, le nez crochu, les oreilles en pointe ; ils portent ce qu’ils ont volé — un gilet d’homme, une chemise de nuit d’enfant, un haut-de-forme cabossé, un châle —, trop grand ou trop petit, rapiécé. La nuit, leurs yeux renvoient la lumière. Ils ne parlent pas : ils répètent des **mots volés**, avec la voix de ceux à qui ils les ont pris. Ils ne sont sur aucune carte, n’ont pas de nom dans le bestiaire de la chasse, et les gardes ne les poursuivent pas.',
  nuit: [
    '**Quand** : ils sortent de {sortie0} à {sortie1}, par sept **terriers** — des trous trop petits pour un homme, qui sentent le suif et la cave : à Valbrume (dans ses murs), à Clairpré, près de la ferme, aux Planches, près de la cabane du pêcheur, aux Sources, au bois de l’ouest.',
    '**Où** : chaque nuit, **une ou deux maisons** (trois s’ils vous en veulent beaucoup), parmi les trente-cinq qu’un terrier met à leur portée. Ils préfèrent les commerces aux maisons habitées, et celles-ci aux maisons vides ; une maison visitée ces trois dernières nuits ne l’est presque plus.',
    '**Ce qu’ils prennent** : ce qu’il y a dans **un meuble** (plutôt un meuble qui ne ferme pas à clé) — il est vraiment vidé : on le trouve vide en le fouillant, et il se remplit avec le temps. Jamais les cachettes, ni les doubles fonds, ni les lieux publics ; les objets uniques et les objets de quête restent.',
    '**Le lendemain** : celui qui a été volé **s’en plaint** — c’est la première chose qu’il vous dit quand vous lui parlez, dans les trois jours (chacun à sa façon : ci-dessous). Sur le meuble vidé, **trois griffes et un rond**, griffés à hauteur de genou, la sciure fraîche (on peut les examiner pendant cinq jours).',
    '**Votre ferme** : s’ils vous en veulent, ils viennent **dans vos coffres**, presque chaque nuit : deux choses au plus, de peu de prix (quarante pièces au plus ; ni les outils, ni les reliques, ni les objets de quête). Au matin : « Le coffre a été ouvert cette nuit… ». Ce qu’ils reprennent ainsi apaise leur rancune.',
    '**Loin de vous**, tout cela se passe sans vous, aux heures dites. **Près de vous** (à moins de {paraitre} m), le gobelin **prend corps** : on le voit aller droit à la maison, **entrer par le mur**, fouiller (on l’entend : un froissement, des tintements), ressortir avec son sac, rentrer dans la terre. On peut le suivre — de loin.',
    'Si des gens dorment dans la maison qu’il fouille, chaque bruit peut réveiller un dormeur ([[sys:cambriolage|le cambriolage de nuit]]) : le réveillé se lève et va voir ; le gobelin, lui, s’enfuit. Mieux vaut ne pas être dans la maison à ce moment-là.',
  ],
  balade: 'La nuit surtout, on en croise un, **de loin** (35 à 55 m), sur le côté du regard, jamais sous vos yeux : il longe une haie, un mur, s’arrête, renifle, gratte la terre, ramasse quelque chose, repart vers un terrier. Toutes les {periode} secondes environ, la chance d’en croiser un est de {nuit} la nuit ({brune} à la brune, au bois ; {jour} le jour, au bois seulement) ; bien plus près d’un terrier, bien moins dans Valbrume, un peu plus s’ils vous en veulent, un peu moins avec une lanterne allumée.',
  loin: [
    'Un homme (vous, ou un habitant éveillé) à moins de **{homme} m** : ils se **tapissent**, immobiles, à quatre pattes, et attendent qu’il passe ; s’il s’attarde, ou s’approche à moins de sept mètres, ils s’écartent.',
    '**Ils se savent vus** quand vous les regardez — dans votre champ de vision, sans rien entre vous — d’assez près pour les distinguer, pendant un tiers de seconde (trois fois plus vite à moins de quatre mètres) : le tableau ci-dessous. Un habitant éveillé qui regarde par là, à moins de dix mètres, compte aussi (« Qui va là ? »).',
    '**Alors ils fuient hors de votre vue** : vers un endroit caché de vous (derrière un mur, un tronc, une butte), loin, sur le côté ou derrière vous, à quatre pattes, à {course} m/s — plus vite que vous. Parfois un petit rire étouffé, parfois un mot volé. Hors de vue, ils se cachent un instant, puis rentrent dans la terre. Après trois fuites, ils rentrent tout de suite.',
    '**Bloqués, ils passent à travers les murs** : un mur, une palissade, une maison entre eux et l’endroit où ils vont, ils ne le contournent pas — ils entrent **dedans**, lentement ({mur} m/s), en s’étirant, le corps qui tremble et se tord, avec un bruit de bois qui craque, quelque chose de mouillé qui se déchire, un gémissement très bas. On les voit disparaître dans la pierre, et ressortir de l’autre côté. (« Il est entré dans le mur. Pas derrière : dedans. »)',
    'L’eau : jamais (ils la contournent).',
  ],
  vue: [['le jour', 'jour', ' (22 m sous un toit)'], ['la nuit noire', 'nuit', ''], ['la pleine lune', 'lune', ''], ['votre lanterne allumée', 'lanterne', ''], ['eux sous un réverbère, près d’un feu', 'lumiere', ''], ['chez eux, sous la terre (les chandelles)', null, '26 m']],
  attraper: [
    '**Attraper** (E, à moins de 2,3 m) : seulement quand il **ne se sait pas vu**, ou quand il fouille, dort, guette, se cache, ou passe dans un mur ; sinon il glisse entre vos doigts. Tenu, il ne se débat pas : il vous regarde. Alors : **le laisser filer** — il s’en souvient (leur rancune baisse) ; un matin, dans les trois jours, **un présent sur le seuil**, posé bien droit sur une feuille de chou (un dé à coudre, une bille, des boutons de nacre, un ruban, une image pieuse, une vieille pièce, une cuillère d’argent) ; **lui faire lâcher ce qu’il a pris** — il ouvre la main (ce qu’il portait tombe : on le ramasse, et on peut le rendre), puis **il vous mord** jusqu’au sang, et leur rancune monte ; **lui serrer le cou** — « Il ne crie qu’une fois. Ses ongles sont des ongles d’enfant. »',
    '**Tuer** (à mains nues, au fusil, à l’arc, à l’outil ; dix-huit points de vie) : le corps reste là le temps qu’on s’éloigne (on peut lui prendre une [[it:gob_dent|dent]]) ; au matin, à sa place, un tas de [[it:gob_chiffons|chiffons]] cousus de travers. La nichée s’en souvient : leur rancune monte de trois, et l’esprit s’assombrit. **{partir} morts**, et la nichée **quitte la vallée** le lendemain (« Cette nuit, très loin sous la terre, on a chanté. Puis plus rien. ») : plus de vols, plus de rôdeurs. Blessé sans être tué, il fuit.',
  ],
  rancune: 'Leur **rancune** va de 0 à {max}. Elle s’use d’un tiers de point par jour ; un gobelin laissé filer l’apaise, et chaque chose qu’ils reprennent chez vous. Dès 1, ils visitent votre ferme presque chaque nuit ; dès 3, un vol de plus chaque nuit, et le carnet le note (« Ils vous en veulent. ») ; dès 4, certains matins, un signe : une rangée de cailloux devant la porte, le chien qui gémit toute la nuit le museau tourné vers le mur, la marque d’une petite main sur la vitre.',
  rendre: '**Rendre** : ce qu’on a repris à quelqu’un (tombé des mains d’un gobelin, par exemple), on peut **le lui rendre** : en lui parlant (« Ce qu’on vous a pris… »), ou en le lui offrant, en main. Il vous en sait gré (l’amitié monte de 20, plus le prix de l’objet, jusqu’à 60), et ne veut pas savoir où vous l’avez trouvé.',
  carnet: 'Dans la sacoche, au carnet, une page **« Les Petits »** se remplit de ce que vous savez : combien vous en avez aperçu, combien de maisons visitées, leur marque, et le reste à mesure.',
  secret: {
    chemin: [
      '**Le signe** : trois entailles courtes et un rond creusé dessous. On le trouve sur des **pierres griffées** (une près de chaque terrier, et une file, de loin en loin, de la souche vers la ferme) et sur les meubles qu’ils ont visités ; la grainetière : « On dit qu’ils marquent ce qu’ils ont visité. » La file des pierres mène, en la remontant, au fond des bois du sud.',
      '**Le mécanisme** : au bout, [[li:gob_souche|la vieille souche]] — un chêne mort, ouvert par la foudre, loin des chemins. À son pied, une **racine polie**, « comme une rampe d’escalier », qu’**on ne voit qu’accroupi**, à leur hauteur (la guérisseuse : « Pour voir leurs portes, ma grand-mère disait qu’il faut se mettre à leur hauteur. »). On la tire : quelque chose cède sous la souche ; un **panneau** (une vieille porte bleue, à demi enterrée) apparaît.',
      '**La condition** : le panneau **ne cède que la nuit, de {porte0} à {porte1}, quand ils sont dehors** (la doyenne des Planches : « Ils laissent leur maison ouverte derrière eux. Qui irait voler des voleurs ? »). Le jour, il ne bouge pas, et par une fente on voit une lueur de chandelle, on entend une respiration lente. Et **si l’un d’eux vous a vu rôder près de la souche** cette nuit-là, on tire une barre de l’autre côté : il faudra revenir une autre nuit.',
      '**Le raccourci** : dans la Gobelinière, au bout du boyau de l’est, une **barre**, lourde, polie par de petites mains. Levée, elle ouvre un passage qui ressort au **terrier près de la ferme** ; ensuite, ce terrier mène chez eux à toute heure (« Se glisser dans le terrier »).',
    ],
    village: [
      'Sous les bois du sud, à une cinquantaine de mètres de la souche et à plus de vingt mètres sous terre (quatorze mètres de roche au-dessus de la voûte). On arrive dans **la chambre des racines** (basse ; on en remonte par les racines) ; puis **le boyau** (1,30 m de haut : on n’y passe qu’accroupi) ; puis **la grande salle** (quarante mètres sur trente, six mètres et demi sous la voûte) : des stalactites, des racines qui pendent, des **cahutes** de planches volées et leurs **nids** de chiffons, de plumes et de cheveux, encore tièdes ; dix-sept **chandelles**, une **marmite** sur le feu ; **six tas** et **le grand tas** — ce qu’ils ont pris depuis des générations, pièces, cuillères, montres, bougeoirs, alliances —, des choses éparpillées partout ; **l’étal** des prises de ces dernières nuits ; et tout en haut du grand tas, **le siège de la vieille**.',
      '**Le jour**, tous dorment dans leurs nids. On peut entrer — par le raccourci — mais chaque pas près d’un dormeur peut en réveiller un : en courant beaucoup, en marchant un peu, accroupi presque pas ; la lanterne allumée presque double le risque. Réveillé, il se redresse, regarde autour de lui ; s’il vous voit…',
      '**La nuit**, ceux qui sont partis voler ne sont pas là ; deux ou trois s’affairent (ils vont d’un lieu à l’autre, rangent, guettent), les autres dorment.',
      '**Vu au village** : un cri, et **tous courent entrer dans les parois** — on les voit s’enfoncer dans la roche —, et pendant trois heures, le village reste vide et l’on entend chuchoter derrière la pierre (« Ils sont entrés dans les murs. Tous. ») ; leur rancune monte.',
    ],
    richesses: [
      '**Les tas** : chacun se fouille en **{poignees} poignées** (E : « Fouiller le tas »). Une poignée d’un petit tas vaut en moyenne trente-huit pièces (des pièces, une vieille pièce, une cuillère d’argent, un dé à coudre, des boutons de nacre, une montre parfois, rarement une [[it:gob_alliance|alliance gravée]] ou un [[it:gob_hochet|hochet d’argent]]) ; une poignée du **grand tas**, cent quinze pièces (bijoux, montres, médaillons, calices). **Tout le trésor : environ 1 030 pièces**, près de trois journées de travail d’un début de partie.',
      '**Mais ils comptent tout** : chaque poignée, leur rancune monte d’un point (le grand tas : deux) ; elle fait du bruit (les dormeurs à moins de neuf mètres se réveillent une fois sur quatre, ceux qui sont éveillés vous remarquent), et la vieille dit : « Tu as pris. » (avec votre propre voix) « Nous prendrons. » **Ils viendront le reprendre dans vos coffres** : tout vider, c’est une rancune au plus haut, et une douzaine de nuits de visites, où ils reprennent environ un cinquième de ce qu’on leur a pris.',
      '**L’étal** (« Ce qu’ils ont pris dans la vallée ») : ce qu’ils ont rapporté ces dernières nuits, **rangé par maisons**, une rangée par porte (le nom de celui qui y vit, si vous le connaissez). **Reprendre** une rangée, ou **tout reprendre** : leur rancune monte d’un demi-point par maison. Ce qu’on a repris, on peut le rendre à son propriétaire.',
      '**L’offrande** : du lait, du pain, du miel, du fromage, un œuf, une brioche ou de la confiture **en main**, E sur la vieille souche : « Déposer une offrande » (une par jour). Rien ne bouge. Au matin, elle n’y est plus : leur rancune baisse, et la fois suivante, à sa place, **un caillou blanc, bien rond** (le curé : « Ma mère disait qu’on ne les nourrit pas : on les paie. Elle n’a jamais été volée. »).',
    ],
    vieille: [
      'Assise tout en haut du grand tas, les jambes perdues dans l’argent, les yeux blancs. Elle ne bouge pas. Elle parle avec des voix qui ne sont pas la sienne.',
      '**« Que prenez-vous, et pourquoi ? »** — « On prend ce que vous ne regardez plus. Une cuillère. Une bille. Un nom. Vous ne vous en apercevez qu’après. C’est pour ça qu’on le prend. »',
      '**Un marché** (seulement si l’on n’a encore rien pris aux tas, et tué personne) : « Rien de chez toi. Rien de chez nous. » Elle tend une main froide comme une pierre de cave. Tant qu’il tient : **ils ne viennent plus chez vous**, la rancune tombe à zéro, et tous les cinq jours **un présent sur le seuil**. Il se rompt si l’on prend une poignée, si l’on reprend quelque chose sur l’étal, si l’on tue.',
      '**Lui rendre ce qu’on a pris** : les curiosités des tas (alliances, hochets, trousseaux, bonnets, la couronne) qu’on porte sur soi : la rancune baisse ; trois rendues réparent un marché rompu (si l’on n’a tué personne). « Tout revient. »',
      '**La tuer** : les chandelles s’éteignent une à une, toutes seules ; la nichée quitte la vallée le lendemain ; une **malédiction** vous tombe dessus (la malchance : « Vous avez tué la vieille des gobelins. ») ; de ses restes, on peut prendre sa [[it:gob_couronne|couronne de cuillères]] (tiède, et qui le reste). **Reposer la couronne au sommet du grand tas** lève la malédiction (le curé et la guérisseuse le peuvent aussi, comme pour les autres).',
    ],
    objets: [['gob_dent', 'un gobelin tué (sur le corps, ou dans ses chiffons)'], ['gob_chiffons', 'ce qui reste d’eux au matin'], ['gob_trousseau', 'les tas — des clés qui n’ouvrent plus rien'], ['gob_hochet', 'les tas (« …ette, 1821 »)'], ['gob_alliance', 'les tas (« J. M. — 1788 »)'], ['gob_bonnet', 'les tas'], ['gob_couronne', 'la vieille, morte']],
  },
};

// ---------------------------------------------------------------- la main du crocheteur (U)
const MAIN = {
  lead: 'Le crochetage ([[sys:crochetage|crocheter une serrure]]) devient une **compétence** : la main progresse avec la pratique, et le petit jeu le dit, sous la serrure (« Vos doigts : … »). Six paliers, des « doigts gourds » à « une main de velours » ; deux serrures nouvelles ne s’ouvrent qu’aux derniers.',
  gains: [
    'une goupille calée : {goupille} × la difficulté de la serrure ;',
    'une serrure ouverte : {ouverte} × la difficulté (le quart seulement si c’est la même, le même jour) ;',
    'un échec : {echec} ;',
    'un cambriolage mené sans être vu, avec quelque chose de pris : {nuit} ([[sys:cambriolage|le cambriolage de nuit]]) ;',
    'les livres de la bibliothèque qui parlent de serrures, lus jusqu’au bout : douze points chacun, une fois ({serrures}) ;',
    'le [[it:cadenas_exercice|vieux cadenas]] (en main, clic : on s’exerce chez soi, sans rien risquer), jusqu’à {exerciceMax} points seulement — « Ce vieux cadenas n’a plus rien à vous apprendre ».',
  ],
  reperes: 'Le premier palier vient après cinq ou six portes ordinaires ; « une main de velours » demande soixante-dix bonnes serrures, ou leur équivalent. À chaque palier franchi, une pensée courte ; le carnet (sacoche) en garde un mot, sans chiffre, à partir du premier.',
  serrures: 'Les serrures 1 (« une serrure de rien du tout », deux goupilles) à 5 (« une serrure de maître », six goupilles) s’ouvrent comme avant, d’autant mieux que la main est sûre. Deux nouvelles : **6, « {s6} »** ({p6} goupilles : « {m6} » et des crochets fins, ou « {m6b} ») et **7, « {s7} »** ({p7} goupilles : « {m7} » et des crochets fins). Sans la main : « Vous sentez les goupilles, trop fines, trop serrées. Vos doigts n’en sont pas encore là. »',
  reussite: 'Pour un joueur moyen, chaque goupille d’une serrure de maître se cale une fois sur deux au début, cinq fois sur six au dernier palier ; celles d’une serrure à secret, près de deux fois sur trois à « une main de serrurier » ; celles d’une serrure de coffre, autant à « une main de rossignol ». (« Rossignol » : le vieux mot des voleurs pour un passe-partout.)',
  objets: [
    ['cadenas_exercice', 'le forgeron (18), le colporteur (16)', 'pour s’exercer chez soi, jusqu’à « une main sûre »'],
    ['crochets_fins', 'le colporteur (240), à qui a « une main de serrurier »', 'glissés dans un jeu ordinaire : la ligne ×{fz}, la casse ×{fc}, le bruit ×{fb} ; ils ouvrent les serrures de coffre'],
    ['chaussons_lisiere', 'la colporteuse (48)', 'dans la sacoche : des pas étouffés (×{cp}) et moins de lattes qui grincent (×{cg}) — dans la vallée comme dans les Terres d’Avant'],
  ],
};
// le cambriolage de nuit (U)
const CAMB = {
  lead: 'La nuit, chacun dort dans son lit, et les portes de ceux qui dorment sont fermées à clé. On les crochète, on entre, on fouille, on fait les poches du dormeur. Chaque bruit a une **petite chance** de réveiller ceux qui dorment : plus grande si l’on traîne, si l’on court, si l’on est maladroit, si le dormeur a le sommeil léger, à l’heure où l’on dort mal ; moindre avec [[sys:main-crocheteur|la main]].',
  heures: 'Chacun dort de 19 h 30 – 22 h à 5 h – 7 h, selon les gens ; les gardes de nuit dorment le jour. Entrer chez quelqu’un est une **effraction** si l’on est vu dedans (une **intrusion** si la porte était ouverte).',
  chance: 'La chance qu’un bruit réveille un dormeur : pour un bruit de force 1 (un crochet qui ripe) tout contre un dormeur ordinaire, {K} de base, soit un peu moins de 4 % au plus profond de la nuit ; derrière sa porte, à six mètres, moins de 1 % (près de 2 % juste après qu’il s’est couché). Elle se divise par deux à {portee} m, par cinq à dix mètres ; un mur la divise par deux, un étage presque autant.',
  facteurs: [
    '**L’heure** : le plein de la nuit ×0,7 ; les trois quarts d’heure après s’être couché ×1,5 ; entre trois heures et une heure et demie avant de se lever ×1 ; au petit matin, dans l’heure et demie avant de se lever, ×1,6.',
    '**Le dormeur** : le sommeil léger (les inquiets, les méfiants, les curieux, les tourmentés…) ×1,35 ; les vieux ×1,25 ; les gardes ×1,6 ; le sommeil lourd (les bons vivants, les costauds, les rêveurs) ×0,75 ; un enfant ×0,8.',
    '**S’attarder** : passé dix secondes dans sa maison, chaque bruit compte davantage (+1 toutes les vingt secondes, jusqu’à ×4) ; et le sommeil s’use même sans bruit : une présence, il finit par ouvrir les yeux.',
    '**L’agitation** : chaque bruit l’agite un peu (jusqu’à ×2,5), et elle retombe lentement.',
    '**Il remue** (trois fois plus souvent qu’il ne se réveille) : il se retourne, les draps bruissent, il marmonne (« … laisse la porte… ») ; pendant ces quelques secondes, tout compte double.',
    '**La lanterne** allumée sur son visage endormi l’agite ; s’il remue sous la lumière, il ouvre les yeux.',
    '**Une maison sur ses gardes** (cambriolée ces trois derniers jours, ou réveillée cette nuit) : ×1,5.',
  ],
  entendre: 'Dans la maison où l’on est, on entend le souffle des dormeurs, tout bas (certains ronflent) ; quand l’un d’eux s’agite tout près, son souffle s’accroche, et l’on entend son propre cœur.',
  // mesures (agent U, domaine U de l’équilibrage) : une maison, porte crochetée, deux meubles, trois choses prises à chacun
  mesures: [['un débutant, accroupi, au plein de la nuit', '≈ 17 %'], ['le même, debout', '≈ 28 %'], ['le même, en courant', '≈ 64 %'], ['accroupi, à 21 h', '≈ 35 %'], ['accroupi, à 5 h 30', '≈ 37 %'], ['« une main sûre », accroupi, au plein de la nuit', '≈ 11 %'], ['« une main de velours »', '≈ 6 %']],
  maison: 'La maison entière (quatre meubles, les poches du dormeur) : environ 36 % de réveiller quelqu’un au début (14 % d’être pris), 13 % au dernier palier (5 %).',
  reveille: [
    'Il se lève, au pied de son lit, une chandelle à la main (on voit sa lumière) : « Qui est là ? »',
    'Il va voir, dans sa maison, d’où venait le bruit, et regarde autour de lui, dix à vingt secondes.',
    '**S’il vous voit** (dans le noir on voit mal, et de près : 6,5 m debout, 4 m accroupi, de face ; à la lanterne, 13 m), il crie. Il vous **reconnaît** peut-être : presque sûrement à la lanterne, trois fois sur quatre tout près, rarement de loin dans le noir. Reconnu : **effraction** (ou intrusion) et **vol** si l’on a pris quelque chose chez lui cette nuit ([[sys:crimes|crimes et avis de recherche]] : primes, affiches, gardes, cachot), l’amitié qui s’effondre, la mentalité. Pas reconnu : une ombre — personne ne sait qui ; mais le cri fait venir le garde de nuit, et pendant une minute et demie, quiconque est trouvé près de la maison par un garde (ou par celui qu’on a réveillé, revenu voir) est pris sur le fait. Les costauds (le forgeron, le chasseur, l’éleveuse, la forgeronne naine, le baile, les gardes) se jettent sur vous ; les autres fuient en criant ; les autres dormeurs de la maison se réveillent au cri.',
    '**S’il ne voit personne**, il se recouche (« … Le vent. Ce n’est que le vent. »), et dort mal le reste de la nuit.',
  ],
  interrompu: 'Ce qu’on faisait s’interrompt quand on est vu : le petit jeu, la fouille, le menu du butin.',
  lendemain: 'S’il ne vous a pas vu mais qu’on lui a pris quelque chose, il se plaint ; réveillé sans rien voir, il parle de bruits. **La maison se garde trois jours** : un verrou de plus à la porte (une serrure plus dure d’un cran), un sommeil plus léger.',
  rapporte: 'Un meuble de maison vaut une quinzaine de pièces ; les poches d’un dormeur, une quarantaine (huit fois sur dix). Pris : l’effraction et le vol, environ 375 pièces de prime (avec la récidive), et l’amitié de la victime. Une maison entière, avec prudence : environ +20 pièces en moyenne au début, +85 au dernier palier ; debout et sans précaution, on y perd. Jamais plus, à la minute, que le travail du milieu de partie.',
  secret: {
    df: 'Deux meubles habités sur cinq (armoires, commodes, buffets, malles, secrétaires — pas chez les disparus) ont un **tiroir à secret**. Il faut « une main sûre » pour le sentir en fouillant le meuble (« Sous le dernier tiroir, le bois sonne creux. ») ; ensuite, E sur le meuble propose « Ouvrir le double fond » : une serrure de maître (5), ou à secret (6) pour un secrétaire. Il se remplit en {refill} jours. On y trouve les économies, un bijou, une montre, des lettres — environ quarante pièces (celui d’un secrétaire, quatre-vingts) — et parfois des papiers d’un autre cambrioleur :',
    papiers: [['u_serrurier_1', 'Feuillet arraché d’un carnet', 'garder la tension ; les portes neuves sont bavardes'], ['u_serrurier_2', 'Lettre à un frère', '« Les vieux dorment mal, les ivrognes dorment bien, et personne ne dort à quatre heures » ; le plein de la nuit, entre minuit et trois heures ; ne jamais courir, ne pas s’attarder'], ['u_serrurier_3', 'Une liste de maisons', '« réveillée — ne plus y retourner » ; « il y a des petites mains, aussi »'], ['u_serrurier_4', 'Reçu d’un cordonnier', 'les chaussons de lisière de M. R., « qui travaille la nuit »']],
    heures: 'On dort le plus profondément entre minuit et trois heures ; le petit matin est le pire moment. Et à trois heures, sans un remontant, c’est le cambrioleur qui s’effondre de fatigue : on se réveille chez soi, ramené par quelqu’un (la maison visitée compte comme quittée).',
    legers: 'Les dormeurs légers (×1,35) : le maire (inquiet), le curé (tourmenté), la postière (curieuse), le chasseur (dangereux), la guérisseuse (mystérieuse), le libraire (inquiétant), la doyenne des Planches (secrète), le nain ancien (méfiant), Grosjean (zélé, peureux : il dort d’un œil, comme tous les gardes). Les lourds (×0,75) : la boulangère, l’aubergiste, le colporteur, le pêcheur, l’éleveuse, la petite (×0,8 en plus).',
    divers: [
      'Faire les poches d’un dormeur : la main aide aussi ({poche}).',
      'La lanterne : utile pour voir, fatale si l’on vous voit (presque sûrement reconnu).',
      'Dans les Terres d’Avant, chaque bruit du petit jeu s’entend de ce qui guette (un raté porte à 14 m).',
      'La nuit, à la bibliothèque, soulever [[it:cle_grande_porte|la clé de la Grande Porte]] fait un petit bruit qui peut réveiller le bibliothécaire.',
    ],
  },
};
const U_BRUITS_NOMS = [
  ['une goupille calée / le pêne qui recule', ['goupille', 'ouvre']], ['une goupille ratée / un crochet qui casse', ['rate', 'casse']], ['ouvrir une porte / la refermer', ['porte', 'claque']],
  ['un pas : accroupi / debout / en courant', ['pasAccroupi', 'pas', 'pasCourus']], ['une latte qui grince ({gc} des pas debout, {ga} accroupi)', ['grince']], ['retomber d’un saut', ['saut'], ' et plus'],
  ['fouiller un meuble (le linge, le papier, le bois, la vaisselle, le métal…)', ['@fouille']], ['prendre une chose dans le meuble (les pièces sonnent : 0,18)', ['prendre']], ['faire les poches d’un dormeur', ['poche']],
  ['un objet qui tombe (la maladresse : {m0} des fouilles au début, {m5} au dernier palier ; plus si l’on est fatigué ou ivre)', ['chute']],
];

// ================================================================ les sections (sections)
// Chaque section : ses groupes de fiches (seules celles qui existent paraissent), et après quelles sections elle va.
const SECTIONS = [
  { id: 'terres', t: 'La Grande Porte et les Terres d’Avant', apres: ['dessous', 'mondes'],
    d: 'Derrière la Grande Porte, un second pays, deux fois grand comme la vallée : ses régions et son plan, ses feux de veille, la discrétion ; le Ver qui veille au-dessus ; Hautguet, le château des Hauts (et ce qui s’y cache : secrets).',
    groupes: [['La Grande Porte', ['sys:grande-porte', 'it:cle_grande_porte']], ['Les Terres d’Avant', ['sys:terres-avant', 'sys:discretion']], ['Les régions', Object.keys(REGIONS).map((k) => 'zone:' + k)], ['Le Ver', ['sys:ver', 'it:v3_ecaille', 'it:v3_dent', 'it:v3_coeur', 'it:v3_cle_collier', 'it:v3_carnet']], ['Hautguet', ['sys:hautguet', 'it:v4_registre', 'it:v4_lettre_dame', 'it:v4_anneau', 'it:v4_cle_poterne', 'it:v4_cle_chapelle', 'it:v4_cle_donjon', 'it:v4_cle_tour', 'it:v4_trousseau']]] },
  { id: 'gobelins', t: 'Les gobelins', apres: ['parlantes', 'betes'],
    d: 'Les Petits, ceux d’en dessous : leurs vols de nuit, leur marque, ce qu’on peut leur faire ; leur village, le chemin pour y entrer, la vieille (secrets).',
    groupes: [['Les gobelins', ['sys:gobelins', 'an:gobelin', 'an:gob_aieule']], ['Leurs lieux', ['li:gob_souche', 'li:gobeliniere']], ['Ce qu’on trouve chez eux', ['it:gob_dent', 'it:gob_chiffons', 'it:gob_trousseau', 'it:gob_hochet', 'it:gob_alliance', 'it:gob_bonnet', 'it:gob_couronne']]] },
];

// ================================================================ le plan des Terres d’Avant : ses couches de repères
// Chaque couche : sa clé, son nom, secrète ou non, allumée ou non, et ses repères (C : outils, voir plans()).
const COUCHES_PLAN = [
  { cle: 'regions', nom: 'Les régions', on: 1, marques(C) {
    for (const [k, nom, x, z, r] of C.R.regions || []) C.M({ l: 'regions', k: 'zone', x, z, r: Math.round(r * 0.85), t: cap(nom), p: C.pg('zone:' + k, 'sys:terres-avant') });
    const voie = (C.R.chemins || []).find((c) => c[0] === 'la Voie');
    if (voie) { const P = voie[1], m = P[Math.floor(P.length / 2)]; C.M({ l: 'regions', k: 'zone', x: m[0], z: m[1], r: 60, t: 'La Voie', p: C.pg('zone:seuil', 'sys:terres-avant') }); }
  } },
  { cle: 'lieux', nom: 'La Porte, les feux de veille, Hautguet', on: 1, marques(C) {
    const S = C.inter('v1_seuil')[0];
    if (S) C.M({ l: 'lieux', k: 'pt', x: S[3], z: S[5], t: 'la Grande Porte', s: 'De ce côté, ni serrure ni barre : on la repasse quand on veut', p: C.pg('sys:grande-porte'), i: '⊓', big: 1 });
    for (const F of C.inter('v1_feu')) { const k = FEU_REGION[F[1]] || C.region(F[3], F[5]); C.M({ l: 'lieux', k: 'pt', x: F[3], z: F[5], t: `le feu de veille (${C.nomRegion(k)})`, s: 'Souffler sur la braise, se reposer : la partie s’enregistre', p: C.pg('zone:' + k, 'sys:terres-avant'), i: '♨' }); }
    const ch = (C.R.sites || []).find((s) => s[0] === 'chateau');
    if (ch) C.M({ l: 'lieux', k: 'pt', x: ch[2], z: ch[3], t: 'Hautguet', s: 'Le château des Hauts', p: C.pg('sys:hautguet', 'zone:hauts'), i: '⛫', big: 1 });
    for (const [x, z] of C.R.ponts || []) C.M({ l: 'lieux', k: 'pt', x, z, t: 'le pont des Ravines', s: 'Un grand pont au-dessus de la première entaille', p: C.pg('zone:ravines', 'sys:terres-avant'), i: '═' });
  } },
  { cle: 'hautguet', nom: 'Hautguet : les salles', on: 1, marques(C) {
    const sous = /cachots|crypte|souterrain|fosse|cave/;
    for (const [key, name, x, z, , r] of C.R.lm || []) if (/^v4_/.test(key) && key !== 'v4_chateau') C.M({ l: 'hautguet', k: 'zone', x, z, r: Math.max(6, Math.min(40, r)), t: cap(String(name).replace(/ de Hautguet$/, '')) + (sous.test(key) && key !== 'v4_charnier' ? ' (sous terre)' : ''), p: C.pg('sys:hautguet') });
  } },
  { cle: 'ver', nom: 'Le Ver : l’aire, les perchoirs, la loge du Guet', secret: 1, on: 1, marques(C) {
    const aire = (C.R.lm || []).find((l) => l[0] === 'v3_aire');
    if (aire) C.M({ l: 'ver', k: 'pt', x: aire[2], z: aire[3], t: 'l’aire du Ver', s: 'Au sommet du Pic : il y dort, la nuit, la tête tournée vers la Porte', p: C.pg('sys:ver'), i: '▲', big: 1 });
    const ch = C.inter('v3_chaine').find((i) => /bas$/.test(i[1]));
    if (ch) C.M({ l: 'ver', k: 'pt', x: ch[3], z: ch[5], t: 'la chaîne du Guet', s: 'Au bout du sentier du Pic : « LE GUET MONTE. NUL AUTRE NE MONTE. »', p: C.pg('sys:ver'), i: '┋' });
    for (const s of C.R.sites || []) { const P = PERCHOIRS[s[0]]; if (P) C.M({ l: 'ver', k: 'pt', x: s[2], z: s[3], t: 'un perchoir du Ver : ' + P[1], s: cap(P[2]), p: C.pg('sys:ver'), i: '◆' }); }
  } },
  { cle: 'raccourcis', nom: 'Les raccourcis (d’un seul côté)', secret: 1, on: 1, marques(C) {
    const R = { v1_levier: ['le levier du pont-levis', 'De ce côté-ci : « Peser de tout son poids »', '⇋'], v1_echelle: ['l’échelle des Degrés', 'Tirée en haut : « La faire glisser »', '☰'], v1_grille: ['la grille des Tertres', 'Barrée de l’intérieur', '▦'], v1_boyau: ['un boyau des Degrés', 'Un pan de roche qui sonne creux ; on monte au palier du dessus', '⇡'] };
    for (const it of C.R.inter || []) { const D = R[it[0]]; if (!D) continue; if (it[0] === 'v1_echelle' && !/haut$/.test(it[1])) continue; if (it[0] === 'v1_grille' && !/dedans$/.test(it[1])) continue; if (it[0] === 'v1_boyau' && !/bas$/.test(it[1])) continue; C.M({ l: 'raccourcis', k: 'pt', x: it[3], z: it[5], t: D[0], s: D[1], p: C.pg('zone:' + C.region(it[3], it[5]), 'sys:terres-avant'), i: D[2] }); }
  } },
  { cle: 'recoins', nom: 'Les recoins', secret: 1, on: 1, marques(C) {
    const pt = (it, t, s, i) => C.M({ l: 'recoins', k: 'pt', x: it[3], z: it[5], t, s, p: C.pg('zone:' + C.region(it[3], it[5]), 'sys:terres-avant'), i });
    for (const it of C.R.inter || []) {
      if (it[0] === 'v1_mur_creux' && /^caveau_/.test(it[1])) pt(it, 'un caveau', 'Le mur sonne creux : deux coups, et dedans un tombeau', '▣');
      else if (it[0] === 'v1_trappe') pt(it, 'une cave', 'Une trappe dans la poussière', '▿');
      else if (it[0] === 'ladder' && /_monter$/.test(it[1])) pt(it, 'une tour creuse', 'Une échelle intérieure, une niche en haut', '♜');
      else if (it[0] === 'v1_trouvaille' && /^corniche_/.test(it[1])) pt(it, 'une corniche', 'À mi-paroi : un sac de toile (on y saute d’en haut)', '◠');
      else if (it[0] === 'v1_tertre') pt(it, 'la chambre d’un roi', 'Au pied du tertre : « Pousser la dalle »', '⌓');
      else if (it[0] === 'v1_trouvaille' && it[1] === 'barque') pt(it, 'la barque coulée', 'Il reste quelque chose au fond', '◡');
      else if (it[0] === 'v1_trouvaille' && it[1] === 'bucheron') pt(it, 'la cabane du bûcheron', 'Un coffre de bois', '⌂');
      else if (it[0] === 'v1_inscr' && it[1] === 'inscr_corde') pt(it, 'l’arbre à la corde', '« (La corde est neuve.) »', '⊥');
    }
    for (const [x, z] of C.R.brulees || []) C.M({ l: 'recoins', k: 'pt', x, z, t: 'une maison brûlée', s: 'Des pierres noircies de suie, une souche', p: C.pg('zone:' + C.region(x, z), 'sys:terres-avant'), i: '⌂' });
  } },
  { cle: 'passages', nom: 'Les passages vers la vallée', secret: 1, on: 1, marques(C) {
    for (const it of C.inter('v1_passage')) C.M({ l: 'passages', k: 'pt', x: it[3], z: it[5], t: it[1] === 'passage_puits' ? 'le puits sec' : 'la fente du Pic', s: it[1] === 'passage_puits' ? 'On ressort près du vieux puits du hameau abandonné' : 'On ressort près de l’antre, au pied des monts de l’est', p: C.pg('zone:' + C.region(it[3], it[5]), 'sys:terres-avant'), i: '⇣' });
  } },
  { cle: 'inscr', nom: 'Ce que racontent les pierres', secret: 1, on: 0, marques(C) {
    const IN = Object.fromEntries((C.T('V1_INSCRIPTIONS', []) || []).map((a) => [a[0], a]));
    for (const it of C.inter('v1_inscr')) { const I = IN[it[6]]; if (!I) continue; C.M({ l: 'inscr', k: 'pt', x: it[3], z: it[5], t: cap(I[2]), s: String(I[3]).split('\n')[0], p: C.pg('zone:' + (I[1] || C.region(it[3], it[5])), 'sys:terres-avant'), i: '✎' }); }
  } },
];

// ================================================================ outils
const cap = (s) => (s ? String(s)[0].toUpperCase() + String(s).slice(1) : '');
const r1 = (v) => Math.round(v * 10) / 10;
const heure = (h) => { const H = Math.floor(h + 1e-6), m = Math.round((h - H) * 60); return `${H % 24} h${m ? ' ' + String(m).padStart(2, '0') : ''}`; };
const pct = (p) => `${String(Math.round(p * 1000) / 10).replace('.', ',')} %`;
const fois = (v) => `×${String(Math.round(v * 100) / 100).replace('.', ',')}`;
// ce qu’on garde d’une construction à l’autre (sections : les livres, rangés par rayons)
const ETAT = { livres: null, rayons: null, anciens: null };

// ================================================================ ce qu’on lit en faisant tourner le jeu (extract)
// Les Terres d’Avant sont générées une fois dans la machine virtuelle (comme à la première entrée dans le jeu) : on garde
// leur plan (une image : le relief ombré, les matières du sol, l’eau, les bois morts, les blocs vus de dessus) et leurs
// repères (régions, feux de veille, raccourcis, recoins…), puis on les défait (la mémoire).
const PLAN_ZONE = { ppm: 0.3, d: 3, niv: 5, pas: 12 };   // ppm : pixels par mètre (4 344 m de côté : ≈ 1 300 px)
async function extract(G, w, DB, O) {
  const V = {}, log = (m) => DB.log.push('vague 14 : ' + m);
  const say = O.say || (() => {});
  const val = (expr, d) => { try { const s = G.run(`(() => { try { return JSON.stringify(${expr}); } catch (e) { return null; } })()`); return s ? JSON.parse(s) : d; } catch (e) { return d; } };
  // les jours où la Grande Porte est fermée (porteV1.fermee), pour cette partie : les soixante-douze premiers jours
  V.porte = val(`(() => {
    if (typeof porteV1 === 'undefined' || !porteV1.fermee || !farm.s) return null;
    const out = { jours: 72, vorndi: [], brume: [], nuit: [], part: 0, n: 0 };
    for (let d = 1; d <= 240; d++) for (let h = 0; h < 24; h += 0.5) { out.n++; if (porteV1.fermee(d, h)) out.part++; }
    out.part /= out.n;
    for (let d = 1; d <= out.jours; d++) { if (porteV1.fermee(d, 12) === 'vorndi') out.vorndi.push(d); if (porteV1.fermee(d, 7) === 'brume') out.brume.push(d); if (porteV1.fermee(d, 23) === 'nuit') out.nuit.push(d); }
    return out;
  })()`, null);
  // des textes qui ne sont pas des tables (des chaînes), des réglages simples
  V.textes = val(`({ registre: typeof V4_REGISTRE !== 'undefined' ? V4_REGISTRE : null, lettre: typeof V4_LETTRE_DAME !== 'undefined' ? V4_LETTRE_DAME : null, inscr: typeof Y2_CLE_INSCR !== 'undefined' ? Y2_CLE_INSCR : null,
    retourH: typeof Y2_RETOUR_H !== 'undefined' ? Y2_RETOUR_H : null, dfRefill: typeof U_DF_REFILL !== 'undefined' ? U_DF_REFILL : null, serrures: typeof bibliotheque2 !== 'undefined' && bibliotheque2.serrures ? bibliotheque2.serrures() : [] })`, {});
  // le plan des Terres d’Avant
  try { V.zone = await planZone(G, DB, O); } catch (e) { log('plan des Terres d’Avant : ' + (e && e.message)); }
  if (V.zone) say(`plan des Terres d’Avant : ${V.zone.img.w} × ${V.zone.img.h} px, ${Math.round(V.zone.img.url.length / 1024)} Ko (générées en ${(V.zone.ms / 1000).toFixed(1)} s)`);
  DB.world.v14 = V;
  return V;
}

async function planZone(G, DB, O) {
  if (!G.has('zone') || !G.has('zoneGen')) return null;
  const t0 = Date.now();
  await G.run('zone.preparer(() => {})');
  const ms = Date.now() - t0;
  const R = O.jclone(G.run(`(() => {
    const Z = zone.Z, S = zone.taille(), r1 = (v) => Math.round(v * 10) / 10;
    const dataK = (d) => (d ? String(d.id ?? d.cle ?? d.table ?? d.key ?? '') : '');
    return {
      N: Z.N, W: Z.W, cell: Z.cell, S, WL: Z.waterLevel,
      regions: Object.keys(V1_REGIONS).map((k) => { const R = V1_REGIONS[k]; return [k, R.nom, r1(R.x * S), r1(R.z * S), r1(R.r * S)]; }),
      sites: zone.sites().map((s) => [s.id, s.agent, r1(s.x), r1(s.z), r1(s.y), s.r, s.nom]),
      lm: Object.values(Z.lm).map((L) => [L.key, L.name, r1(L.x), r1(L.z), r1(L.y || 0), L.r || 6]),
      inter: Z.inter.map((it) => [it.kind, it.id, it.name || '', r1(it.x), r1(it.y), r1(it.z), dataK(it.data)]),
      chemins: V1_CHEMINS.map((C) => [C.nom || '', C.pts.map(([u, v]) => [r1(u * S), r1(v * S)]), C.w, C.levis ? 1 : 0, C.sentier ? 1 : 0]),
      ponts: (Z.v1.ponts || []).map((p) => [r1(p.x), r1(p.z)]),
      brulees: (Z.v1.brulees || []).map((b) => [r1(b.x), r1(b.z)]),
      arrivee: Z.v1.arrivee ? [r1(Z.v1.arrivee.x), r1(Z.v1.arrivee.z)] : null,
      objets: Z.objects.length, blocs: Z.blocks.length, ruines: Z.v1.ruines || 0,
    };
  })()`));
  // le relief, les matières, les blocs, les arbres morts
  const H = G.run('zone.Z.heights'), MT = G.run('zone.Z.mats');
  const blocs = O.jclone(G.run('zone.Z.blocks.filter((b) => !b.hidden && !b.under).map((b) => [b.x, b.y, b.z, b.sx, b.sy, b.sz, b.r || 0, b.m, b.ceil ? 1 : 0])')) || [];
  const arbres = O.jclone(G.run(`(() => { const out = []; for (const o of zone.Z.objects) { if (o.gone) continue; const t = OBJ_TYPES[o.t]; if (t && t.cat === 'Arbres') out.push(Math.round(o.x), Math.round(o.z)); } return out; })()`)) || [];
  const img = dessinerZone(R, H, MT, blocs, arbres, DB, O);
  // les Terres d’Avant ne servent plus : on les défait (la mémoire)
  try { G.run('zone.Z = null; zone.graineZ = null; zone.prete = false;'); } catch (e) { /* tant pis */ }
  return { ms, ppm: img.ppm, img, raw: R, nArbres: arbres.length / 2, nBlocs: blocs.length };
}

// l’image : le relief ombré (méthode de Horn), la couleur du sol (les matières, floutées), l’eau selon sa profondeur, les
// bois morts (plus sombres), les blocs vus de dessus (les ruines, le château, les rochers de l’aire : élargis à un pixel)
function dessinerZone(R, H, MT, blocs, arbres, DB, O) {
  const RG = Object.assign({}, PLAN_ZONE, O.reglages || {});
  const N = R.N, W1 = R.W, cell = R.cell, S = R.S, WL = R.WL, ppm = RG.ppm;
  const P = new O.Plan(0, 0, S, S, ppm, [34, 32, 30]), w = P.w, h = P.h;
  const mats = DB.derived.mats || [];
  const hAt = (x, z) => { const gx = Math.max(0, Math.min(N - 1.001, x / cell)), gz = Math.max(0, Math.min(N - 1.001, z / cell)), i = gx | 0, j = gz | 0, fx = gx - i, fz = gz - j, k = j * W1 + i; return (H[k] * (1 - fx) + H[k + 1] * fx) * (1 - fz) + (H[k + W1] * (1 - fx) + H[k + W1 + 1] * fx) * fz; };
  const mAt = (x, z) => MT[Math.min(N, Math.max(0, Math.round(z / cell))) * W1 + Math.min(N, Math.max(0, Math.round(x / cell)))] & 63;
  // les bois morts : la densité des arbres aux 8 m, lissée
  const C8 = 8, n8 = Math.ceil(S / C8), dens = new Float32Array(n8 * n8);
  for (let k = 0; k + 1 < arbres.length; k += 2) { const i = Math.floor(arbres[k] / C8), j = Math.floor(arbres[k + 1] / C8); if (i >= 0 && j >= 0 && i < n8 && j < n8) dens[j * n8 + i] += 1; }
  const lisse = (src) => { const out = new Float32Array(src.length); for (let j = 0; j < n8; j++) for (let i = 0; i < n8; i++) { let s = 0, c = 0; for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const x = i + di, y = j + dj; if (x < 0 || y < 0 || x >= n8 || y >= n8) continue; s += src[y * n8 + x]; c++; } out[j * n8 + i] = s / c; } return out; };
  const D8 = lisse(lisse(dens));
  const L = [-0.55, 0.62, -0.55], Ln = Math.hypot(...L), q = (v, n) => Math.round(v * n) / n;
  const EAU0 = [70, 82, 84], EAU1 = [26, 34, 42];
  const d = RG.d / ppm;
  // la couleur du sol : celle des matières, moyennée aux 4 m puis floutée (une vingtaine de mètres) et arrondie : un sol
  // tacheté de deux herbes devient uni, les régions gardent leur teinte (cendre, terre morte, roche, pavés…)
  const C4 = 4, n4 = Math.ceil(S / C4), col = [0, 1, 2].map(() => new Float32Array(n4 * n4));
  for (let j = 0; j < n4; j++) for (let i = 0; i < n4; i++) {
    let r = 0, g = 0, b = 0;
    for (const [a, c] of [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]]) { const m = mAt((i + a) * C4, (j + c) * C4), A = (mats[m] && mats[m].avg) || [120, 112, 100]; r += A[0]; g += A[1]; b += A[2]; }
    const k = j * n4 + i; col[0][k] = r / 4; col[1][k] = g / 4; col[2][k] = b / 4;
  }
  const flou = (A, Rr) => {
    const T = new Float32Array(A.length), n = 2 * Rr + 1;
    for (let pass = 0; pass < 2; pass++) {
      for (let j = 0; j < n4; j++) { const row = j * n4; let s = 0; for (let i = -Rr; i <= Rr; i++) s += A[row + Math.max(0, Math.min(n4 - 1, i))]; for (let i = 0; i < n4; i++) { T[row + i] = s / n; s += A[row + Math.min(n4 - 1, i + Rr + 1)] - A[row + Math.max(0, i - Rr)]; } }
      for (let i = 0; i < n4; i++) { let s = 0; for (let j = -Rr; j <= Rr; j++) s += T[Math.max(0, Math.min(n4 - 1, j)) * n4 + i]; for (let j = 0; j < n4; j++) { A[j * n4 + i] = s / n; s += T[Math.min(n4 - 1, j + Rr + 1) * n4 + i] - T[Math.max(0, j - Rr) * n4 + i]; } }
    }
  };
  for (const A of col) flou(A, 2);
  const sol = (x, z) => { const k = Math.min(n4 - 1, Math.floor(z / C4)) * n4 + Math.min(n4 - 1, Math.floor(x / C4)); return [col[0][k], col[1][k], col[2][k]].map((v) => Math.round(v / RG.pas) * RG.pas); };
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const x = (i + 0.5) / ppm, z = (j + 0.5) / ppm, hh = hAt(x, z);
    if (hh < WL - 0.05) { const t = q(Math.min(1, (WL - hh) / 9), 5); P.set(i, j, [0, 1, 2].map((c) => Math.round(EAU0[c] + (EAU1[c] - EAU0[c]) * t))); continue; }
    const base = sol(x, z);
    const gx = (hAt(x + d, z) - hAt(x - d, z)) / (2 * d), gz = (hAt(x, z + d) - hAt(x, z - d)) / (2 * d);
    const nx = -gx * 1.7, nz = -gz * 1.7, nl = Math.hypot(nx, 1, nz);
    const s = q(Math.max(0.42, Math.min(1.2, 0.36 + 0.78 * (nx * L[0] + L[1] + nz * L[2]) / (nl * Ln))), RG.niv);
    const alt = q(Math.max(0, Math.min(1, (hh - WL) / 260)), 3);
    const de = D8[Math.min(n8 - 1, Math.floor(z / C8)) * n8 + Math.min(n8 - 1, Math.floor(x / C8))], bois = q(Math.min(1, de / 2.2), 3);
    const k = s * (0.84 + 0.26 * alt) * (1 - 0.32 * bois);
    P.set(i, j, base.map((v) => Math.max(0, Math.min(255, Math.round(v * k)))));
  }
  // les blocs vus de dessus : un mur plus mince qu’un pixel est élargi à un pixel (les ruines se lisent)
  const faces = [], px = 1 / ppm;
  for (const [x, y, z, sx, sy, sz, r, m, ceil] of blocs) if (!ceil) { const c = (mats[m] && mats[m].avg) || [120, 110, 100]; O.boxTopFaces(O.blocM(x, y, z, Math.max(sx, px), sy, Math.max(sz, px), r), c.map((v) => Math.min(255, v * 1.15)), false, faces); }
  O.paintFaces(P, faces, true);
  return Object.assign(P.png(), { ppm });
}

// ================================================================ le plan (buildPlansData)
function plans(DB, wiki, out) {
  const V = (DB.world && DB.world.v14) || {}, Z = V.zone;
  if (!Z || !Z.img) return;
  const R = Z.raw, has = (id) => wiki.ids.has(id), pg = (id, alt) => (id && has(id) ? id : alt && has(alt) ? alt : '');
  const T = (n, d) => (DB.tables[n] ? DB.tables[n].v : d);
  const marks = [];
  const C = {
    R, T, pg, has,
    M: (o) => { o.x = r1(o.x); o.z = r1(o.z); marks.push(o); return o; },
    inter: (kind) => (R.inter || []).filter((it) => it[0] === kind),
    region: (x, z) => regionDe(R, x, z),
    nomRegion: (k) => { const g = (R.regions || []).find((q) => q[0] === k); return g ? g[1] : k; },
  };
  for (const L of COUCHES_PLAN) try { L.marques(C); } catch (e) { (DB.log || []).push(`wiki-v14.js (plan, ${L.cle}) : ${e.message}`); }
  const layers = COUCHES_PLAN.filter((L) => marks.some((m) => m.l === L.cle)).map((L) => [L.cle, L.nom, L.secret ? 1 : 0, L.on ? 1 : 0]);
  out.push({ id: 'terres', t: 'Les Terres d’Avant', i: '⛰', s: `Derrière la Grande Porte : ${nfmt0(R.S)} m de côté, deux fois la vallée. Le plan est dessiné depuis le relief et le sol du jeu (graine ${DB.meta && DB.meta.seed || ''}) ; les régions, les feux de veille et Hautguet par-dessus, et, sous « révéler les secrets », le Ver, les raccourcis, les recoins, les passages.`,
    img: Z.img, x0: 0, z0: 0, x1: Z.img.w / Z.ppm, z1: Z.img.h / Z.ppm, ppm: Z.ppm, bg: '#22201e', coords: 1, p: pg('sys:terres-avant'), layers, marks });
}
// la région d’un point (comme zone.region du jeu : la plus proche, rapportée à son rayon)
function regionDe(R, x, z) { let best = null, bd = 1e9; for (const [k, , cx, cz, r] of R.regions || []) { const d = Math.hypot(x - cx, z - cz) / r; if (d < bd) { bd = d; best = k; } } return best; }
const nfmt0 = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

// ================================================================ les fiches (build)
function build(X) {
  const { DB, T, SP, SEC, esc, lk, IL, FILL, quotes, npcLink, pages, used, nfmt, planBtn, mapBtn, ITEMS } = X;
  const log = (m) => (DB.log || (DB.log = [])).push('wiki-v14.js : ' + m);
  const V = (DB.world && DB.world.v14) || {};
  // ---- le texte : « ** » en gras, « [[id|texte]] » un lien (différé : la fiche peut venir plus tard ; sinon, le texte)
  const md = (t) => String(t ?? '').split(/(\[\[[^\]]+\]\])/).map((s, i) => {
    if (i % 2) { const [id, tx] = s.slice(2, -2).split('|'); return lk(id, tx ?? id); }
    return esc(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  }).join('');
  const ps = (t) => [].concat(t).flatMap((x) => String(x).split(/\n\n+/)).filter((x) => x.trim()).map((x) => `<p>${md(x)}</p>`).join('');
  const ul = (a) => (a && a.length ? `<ul>${a.map((x) => `<li>${md(x)}</li>`).join('')}</ul>` : '');
  const ol = (a) => (a && a.length ? `<ol>${a.map((x) => `<li>${md(x)}</li>`).join('')}</ol>` : '');
  const h3 = (t) => `<h3>${esc(t)}</h3>`;
  const h4 = (t) => `<h4>${esc(t)}</h4>`;
  const tbl = (head, rows) => `<table class="t"><tr>${head.map((x) => `<th>${esc(x)}</th>`).join('')}</tr>${rows.join('')}</table>`;
  const td = (a) => `<tr>${a.map((x) => `<td>${x}</td>`).join('')}</tr>`;
  const kv = (rows) => `<dl class="kv">${rows.filter(([, v]) => v).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${v}</dd>`).join('')}</dl>`;
  const book = (titre, texte, sig) => `<section class="bookpage">${titre ? `<h4>${esc(titre)}</h4>` : ''}${String(texte || '').split(/\n\n+/).map((x) => `<p>${FILL(x).replace(/\n/g, '<br>')}</p>`).join('')}${sig ? `<p class="note">— ${esc(sig)}</p>` : ''}</section>`;
  const engr = (titre, texte) => `<section class="bookpage">${titre ? `<h4>${esc(titre)}</h4>` : ''}<blockquote class="engr">${esc(texte).replace(/\n/g, '<br>')}</blockquote></section>`;
  const sub = (t, o) => String(t).replace(/\{(\w+)\}/g, (m, k) => (o[k] !== undefined && o[k] !== null ? o[k] : m));
  const q = (a) => quotes([].concat(a ?? []).flat().filter((x) => typeof x === 'string' && x.trim()));
  const MF = X.MF || {};
  const files = (re) => Object.keys(MF).filter((f) => re.test(f));
  const plan = (cible, texte) => (V.zone && V.zone.img ? planBtn('terres', cible, texte) : '');
  const append = (id, html) => { const p = pages.get(id); if (p && html) p.h = (p.h || '') + html; return !!p; };
  const C = { X, V, T, md, ps, ul, ol, h3, h4, tbl, td, kv, book, engr, sub, q, files, plan, append, log, esc, lk, IL, FILL, npcLink, SEC, SP, pages, ITEMS, nfmt, mapBtn };
  // ---- les tables de la vague : leurs fiches sont ici (rien dans « Autres tables », rien en bas des fiches)
  const VAGUE = vagueRE();
  for (const [n, t] of Object.entries(DB.tables || {})) if (VAGUE.test(t.file || '')) used.add(n);
  for (const n of ['LIVRES']) used.add(n);
  // ---- les chapitres
  for (const ch of CHAPITRES) {
    let ok = false;
    try { ok = ch.present(C); } catch (e) { ok = false; }
    if (!ok) { log(`chapitre ${ch.id} : absent du jeu`); continue; }
    try { ch.fiches(C); } catch (e) { log(`chapitre ${ch.id} : ${e && e.stack ? e.stack.split('\n').slice(0, 2).join(' ') : e}`); }
  }
}

// ---------------------------------------------------------------- les chapitres (une partie de la vague chacun)
const CHAPITRES = [
  // ======== la bibliothèque : les rayons, les livres nouveaux, l’Enfer ; la clé de la Grande Porte (Y)
  { id: 'Y', present: (C) => !!C.T('Y2_RAYONS', null), fiches(C) {
    const { T, md, ul, h3, h4, tbl, td, kv, SEC, SP, pages, lk, esc, IL, files } = C;
    const RAY = T('Y2_RAYONS', {}), ORD = T('Y2_RAYONS_ORDRE', Object.keys(RAY)), LIV = T('LIVRES', {}), ANC = T('Y2_ANCIENS', {});
    const Y2 = T('Y2_LIVRES', []).filter((b) => LIV[b]), creux = Y2.find((b) => LIV[b].creux) || 'y_tables_mesures';
    ETAT.livres = Object.fromEntries(Object.entries(LIV).map(([b, L]) => [b, { rayon: L.rayon || ANC[b] || null, biblio: !!L.biblio, enfer: !!L.enfer, creux: !!L.creux }]));
    ETAT.rayons = RAY; ETAT.ordre = ORD;
    const pid = (b) => (pages.has('it:livre_' + b) ? 'it:livre_' + b : 'lv:' + b);
    const lien = (b) => lk(pid(b), LIV[b].titre || b);
    const serrures = Y2.filter((b) => LIV[b].serrures);
    const serruresTxt = serrures.map((b) => `[[${pid(b)}|${LIV[b].titre}]]`).join(', ');
    // -- les pages des livres nouveaux : leur rayon (au lieu des « Autres données »), le livre creux est un secret
    for (const b of Y2) {
      const p = pages.get(pid(b)), L = LIV[b], R = RAY[L.rayon] || {};
      if (!p) continue;
      p.h = p.h.replace(/<details><summary>Autres données<\/summary>[\s\S]*?<\/details>/, '');
      const ou = R.ou === 'archives' ? `${esc(R.nom || 'L’Enfer')} — on le lit en entier, sur place ; il ne sort pas` : `${esc(R.nom || L.rayon)} — ${R.ou === 'galerie' ? 'à la galerie, au premier étage' : 'en bas, dans la salle de lecture'}${L.creux ? '' : ' ; se feuillette sur place, s’emprunte au comptoir'}`;
      const plus = [['Rayon', ou]];
      if (L.serrures) plus.push(['La main', `lu jusqu’au bout, il fait progresser ${lk('sys:main-crocheteur', 'la main du crocheteur')} (une fois)`]);
      p.h = p.h.replace(/(<dl class="kv"><dt>Auteur<\/dt><dd>[\s\S]*?<\/dd>)/, (m) => m + plus.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${v}</dd>`).join(''));
      if (L.enfer) p.h += SEC(`<p>${md('L’Enfer est sous la bibliothèque, dans [[li:archives|la salle des archives]] (le passage du rayonnage du fond : voir [[sys:bibliotheque|la grande bibliothèque]]).')}</p>`, 'Où se trouve l’Enfer : masqué (secrets).');
      if (L.creux) { p.x = 1; p.s = 'Un livre creux'; p.h += h3('Le livre creux') + `<p>${md('Deux pages de tables, puis les pages collées, et, dans la cavité, [[it:cle_grande_porte|la clé de la Grande Porte]] (« Prendre la clé »). Il ne se prête pas.')}</p>`; }
      p.h += `<p>${lk('sys:rayons', 'Les rayons de la bibliothèque')}</p>`;
    }
    // -- la fiche des rayons
    let h = `<p class="lead">${md(BIBLIO.lead)}</p>`;
    const parOu = {};
    for (const r of ORD) { const R = RAY[r]; if (R) (parOu[R.ou] || (parOu[R.ou] = [])).push(R.nom); }
    h += h3('Où sont les rayons') + tbl(['', 'Où', 'Les rayons', 'Ce qu’on y fait'], ['bas', 'galerie', 'archives'].filter((o) => parOu[o]).map((o) => td([`<b>${esc(BIBLIO.ou[o][0])}</b>`, esc(BIBLIO.ou[o][1]), esc(parOu[o].join(' · ')), esc(BIBLIO.ou[o][2])])).concat([td(['<b>Le comptoir</b>', '« Parler de livres »', 'tous, sauf l’Enfer', 'emprunter, rendre'])]));
    h += h3('Feuilleter, emprunter') + ul(BIBLIO.regles.map((t) => t.replace('{serrures}', serruresTxt || 'les traités de serrurerie')));
    h += h3(`Les livres nouveaux, rayon par rayon (${Y2.filter((b) => b !== creux).length})`);
    for (const r of ORD) {
      const R = RAY[r]; if (!R) continue;
      const nv = Y2.filter((b) => LIV[b].rayon === r && b !== creux), anc = Object.keys(ANC).filter((b) => ANC[b] === r && LIV[b]);
      if (!nv.length && !anc.length) continue;
      h += h4(R.nom + (R.ou === 'galerie' ? ' — à la galerie' : R.ou === 'archives' ? ' — sur place seulement' : ' — en bas'));
      if (nv.length) h += tbl(['Livre', 'Auteur', 'De quoi il parle'], nv.map((b) => td([`<b>${lien(b)}</b>${LIV[b].serrures ? ' <small>(serrures)</small>' : ''}`, esc(LIV[b].auteur || ''), esc(LIV[b].desc || '')])));
      if (anc.length) h += `<p class="note">Déjà là : ${anc.map((b) => (pages.has('it:livre_' + b) ? IL('livre_' + b) : esc(LIV[b].titre || b))).join(', ')}.</p>`;
    }
    let s = h3('L’Enfer') + `<p>${md('Sous la bibliothèque, dans [[li:archives|la salle des archives]] (le passage du rayonnage du fond : voir [[sys:bibliotheque|la grande bibliothèque]]). On y lit les livres de l’Enfer en entier ; rien ne sort.')}</p>`;
    if (LIV[creux]) s += h3('Le quarante-septième') + `<p>${md(`À la galerie, onglet « ${(RAY[LIV[creux].rayon] || {}).nom || 'Traités et manuels'} », le dernier du rayon : [[lv:${creux}|${LIV[creux].titre}]] — un livre creux, et dedans, [[it:cle_grande_porte|la clé de la Grande Porte]].`)}</p>`;
    s += h3('Ce que les livres disent de biais') + `<p>${md(CLE.secret.biais)}</p>`;
    h += SEC(s, 'Où est l’Enfer, et le quarante-septième livre : masqué (secrets).');
    SP('sys:rayons', { t: 'Les rayons de la bibliothèque', s: 'Quarante-six livres nouveaux, rangés par rayons ; l’Enfer, qui ne sort pas', c: ['livres'], i: '📚', h }, files(/^(11-zzzzY-|07-z+Y-)/));
    // -- la grande bibliothèque renvoie aux rayons et à la clé
    C.append('sys:bibliotheque', h3('Les rayons, la clé') + `<p>${md('Chaque livre a désormais sa place, par rayons, en bas et à la galerie ; et l’Enfer, qui ne sort pas : [[sys:rayons|les rayons de la bibliothèque]]. La bibliothèque garde aussi [[it:cle_grande_porte|la clé de la Grande Porte]].')}</p>`);
    C.append('li:bibliotheque', h3('Les rayons') + `<p>${md('[[sys:rayons|Les rayons de la bibliothèque]] : en bas, contes, chroniques, almanachs, mémoires ; à la galerie, histoire naturelle, traités, réserve, langues d’avant, cartes.')}</p>`);
    // -- la clé de la Grande Porte
    const pk = pages.get('it:cle_grande_porte');
    if (pk) {
      const CA = T('Y2_CAUTION', { 3: 150, 7: 300 }), Q = T('Y2_QUESTIONS', []);
      const durees = Object.entries(CA).map(([j, c]) => `**${j} jours (caution ${c} pièces)**`).join(' ou ');
      const rh = (C.V.textes && C.V.textes.retourH) || 48;
      let x = h3('Ce qu’elle ouvre') + `<p>${md(CLE.ouvre)}</p>`;
      x += h3('L’avoir : la demander') + ul(CLE.demander.map((t) => t.replace('{durees}', durees)));
      x += h3('La perdre') + `<p>${md(CLE.perdre.replace('{retour}', rh % 24 === 0 ? `${rh / 24 === 2 ? 'deux' : rh / 24} jours` : `${rh} heures`))}</p>`;
      const ins = (C.V.textes && C.V.textes.inscr) || 'kel na-dal , teh rhua';
      x += h3('L’anneau') + `<div class="inscr"><canvas class="glyph" data-lang="aelin" data-text="${esc(ins)}" data-size="16"></canvas><p><i>${esc(ins)}</i></p>${SEC(`<p>${esc(CLE.secret.gloss)}</p>`, false)}</div><p class="note">${md(CLE.anneau)}</p>`;
      let sk = h3('Où elle dort') + `<p>${md(CLE.secret.dort)}</p>` + h4('Les indices (aucun n’y suffit)') + ul(CLE.secret.indices);
      sk += h3('La prendre soi-même') + ul(CLE.secret.prendre);
      sk += h4('Quand il n’est pas là (personne n’entend)') + tbl(['Le jour', 'L’heure', 'Où il est'], CLE.secret.absences.map((a) => td(a.map(esc))));
      if (Q.length) sk += h3('Les questions du bibliothécaire') + '<p class="note">Une par partie, tirée au hasard. La bonne réponse est la première ; les autres sont celles qu’il propose aussi.</p>' + tbl(['La question', 'La bonne réponse', 'Où la lire', 'Les autres réponses'], Q.map((E) => td([esc(E.q), `<b>${esc((E.rep || [])[0] || '')}</b>`, LIV[E.livre] ? lien(E.livre) : esc(E.livre || ''), esc((E.rep || []).slice(1).join(' · '))])));
      sk += h4('Au retour des Terres d’Avant') + `<p>${md(CLE.secret.retour)}</p>`;
      x += SEC(sk, 'Où dort la clé, comment la prendre, les questions du bibliothécaire et leurs réponses : masqué (secrets).');
      pk.h += x + `<p>${lk('sys:grande-porte', 'La Grande Porte')} · ${lk('sys:rayons', 'Les rayons de la bibliothèque')}</p>`;
      pk.i = pk.i || '🗝';
    }
  } },

  // ======== la Grande Porte, les Terres d’Avant, leurs régions, la discrétion (V1)
  { id: 'V1', present: (C) => !!C.T('V1_REGIONS', null), fiches(C) {
    const { T, V, md, ps, ul, h3, h4, tbl, td, kv, SEC, SP, pages, lk, esc, q, npcLink, plan, files, engr, mapBtn } = C;
    const REG = T('V1_REGIONS', {}), TX = T('V1_TEXTES', {}), RU = T('V1_RUMEURS', {}), INSC = T('V1_INSCRIPTIONS', []), FEUX = T('V1_FEUX', []);
    const Z = V.zone && V.zone.raw;
    // -- la Grande Porte
    {
      let h = `<p class="lead">${md(PORTE.lead)}</p>`;
      h += kv([['Où', `${pages.has('li:grande_porte') ? lk('li:grande_porte', 'la Grande Porte') : 'la Grande Porte'}, au bout de la route de Clairpré, passé les ruines, dans la paroi des monts de l’est ${pages.has('li:grande_porte') ? mapBtn('li:grande_porte', 'Voir sur la carte') : ''}`], ['Derrière', `${lk('sys:terres-avant', 'les Terres d’Avant')} ${plan('', 'Le plan')}`]]);
      h += h3('Ce qu’on voit') + ul(PORTE.voir);
      if (TX.stele) h += engr(TX.steleTitre || 'Une stèle, au pied des marches', TX.stele);
      h += h3('Quand elle est fermée') + ul(PORTE.fermee) + `<p>${md(PORTE.signes)}</p>`;
      const P = V.porte;
      if (P) {
        const j = (a) => (a.length ? a.join(', ') : 'aucun');
        h += `<p class="note">Dans la partie de ce wiki (graine ${esc(String(C.X.DB.meta && C.X.DB.meta.seed || ''))}), sur les ${P.jours} premiers jours : fermée tout le jour des morts (les jours ${j(P.vorndi)}), les matins de brume ${P.brume.length ? 'des jours ' + j(P.brume) : '(aucun)'}, et ${P.nuit.length} nuits sur ${P.jours} (de 22 h à 5 h). En tout, sur deux cent quarante jours, la Porte est fermée ${pct(P.part)} du temps.</p>`;
      }
      if (TX.porteFermee) h += q([TX.porteFermee, TX.porteFermeeVorndi, TX.porteFermeeBrume, TX.porteFermeeNuit]);
      h += h3('La clé') + `<p>${md(PORTE.cle)}</p>`;
      h += h3('Passer') + ul(PORTE.passer);
      const ru = Object.keys(RU).filter((g) => pages.has('pnj:' + g));
      if (ru.length) h += h3('Ce qu’en disent les gens') + `<ul class="qs">${ru.map((g) => [].concat(RU[g]).map((t) => `<li>${C.FILL(t, g)} <small>— ${npcLink(g)}</small></li>`).join('')).join('')}</ul>`;
      SP('sys:grande-porte', { t: 'La Grande Porte', s: 'Dans la paroi des monts de l’est : parfois fermée à clé ; derrière, les Terres d’Avant', c: ['terres'], i: '⊓', h }, files(/^(11-zzzzV1-1-|07-z+V1-)/));
      C.append('li:grande_porte', h3('La Grande Porte') + `<p>${md('Parfois fermée à clé (le jour des morts, les matins de brume, certaines nuits) ; derrière, les Terres d’Avant : [[sys:grande-porte|la Grande Porte]].')}</p>`);
    }
    // -- les régions (une fiche chacune)
    const feuDe = {}; for (const F of FEUX) if (FEU_REGION[F.id]) feuDe[FEU_REGION[F.id]] = F.id;
    const parRegion = {};   // les recoins, les raccourcis, les perchoirs : par région (secrets)
    const ajoute = (k, t) => { if (k) (parRegion[k] || (parRegion[k] = [])).push(t); };
    if (Z) {
      const cnt = {};
      for (const it of Z.inter || []) {
        const k = regionDe(Z, it[3], it[5]);
        const kind = it[0] === 'v1_mur_creux' && /^caveau_/.test(it[1]) ? 'caveau' : it[0] === 'v1_trouvaille' && /^corniche_/.test(it[1]) ? 'corniche' : null;
        if (kind) { const c = cnt[k] || (cnt[k] = {}); c[kind] = (c[kind] || 0) + 1; }
      }
      const N = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six'];
      for (const [k, c] of Object.entries(cnt)) {
        if (c.caveau) ajoute(k, `${c.caveau > 1 ? cap(N[c.caveau] || c.caveau) + ' **caveaux**' : 'Un **caveau**'} : un petit caveau de pierre fermé ; E sur le mur de devant : « (Le mur sonne creux.) » ; encore E : il tombe (et ça s’entend loin) ; dedans, un tombeau.`);
        if (c.corniche && k !== 'degres') ajoute(k, `${c.corniche > 1 ? cap(N[c.corniche] || c.corniche) + ' **corniches**' : 'Une **corniche**'}, à mi-paroi : des os, un sac de toile (on y saute d’en haut).`);
      }
    }
    for (const [id, P] of Object.entries(PERCHOIRS)) ajoute(P[0], `**Le Ver s’y pose** : ${P[1]} — ${P[2]}.`);
    const lignes = [];
    for (const k of Object.keys(REGIONS)) {
      const D = REGIONS[k], R = REG[k];
      if (!R) continue;
      const id = 'zone:' + k;
      let h = `<p class="lead">${md(D.texte)}</p>`;
      h += kv([['Où', esc(D.ou)], ['Un feu de veille', feuDe[k] ? 'oui : « Souffler sur la braise », puis « S’asseoir et se reposer » — la partie s’enregistre' : ''], ['Le plan', plan('p:' + id, 'Voir sur le plan')]]);
      if ((D.voir || []).length) h += ul(D.voir);
      h += `<p>${lk('sys:terres-avant', 'Les Terres d’Avant')} · ${lk('sys:discretion', 'La discrétion')} · ${lk('sys:ver', 'Le Ver')}</p>`;
      let s = '';
      const sec = [...(D.secret || []), ...(parRegion[k] || [])];
      if (sec.length) s += h3('Ce qui s’y cache') + ul(sec);
      const ins = INSC.filter((a) => a[1] === k);
      if (ins.length) s += h3('Ce qu’on y lit') + ins.map((a) => engr(a[2], a[3])).join('');
      if (s) h += SEC(s, 'Ce qui se cache dans cette région, et ce qu’on y lit : masqué (secrets).');
      SP(id, { t: cap(R.nom), s: `Les Terres d’Avant — ${D.court}`, c: ['terres'], g: 'Les régions', i: D.i || '◬', h });
      lignes.push([k, id]);
    }
    // -- les Terres d’Avant
    {
      const S = Z ? Z.S : 4344, N = Z ? Z.N : 2172;
      let h = `<p class="lead">${md(TERRES.lead)}</p>`;
      h += kv([['Taille', `${nfmt0(S)} m de côté (${nfmt0(N)} cases de 2 m) : deux fois la surface de la vallée`], ['On y entre', lk('sys:grande-porte', 'par la Grande Porte')], ['Le plan', plan('', 'Voir le plan des Terres d’Avant')]]);
      h += h3('Le temps, le ciel') + ul(TERRES.temps);
      h += h3('Les régions') + tbl(['Région', 'Où', 'Ce qu’on y voit', 'Feu de veille'], lignes.map(([k, id]) => td([`<b>${lk(id, cap(REG[k].nom))}</b>`, esc(REGIONS[k].ou), esc(REGIONS[k].court), feuDe[k] ? 'oui' : '—'])));
      h += `<p>${md(TERRES.chemins)}</p>`;
      h += h3('Les feux de veille') + ul(TERRES.feux);
      h += h3('Ce qu’on n’y fait pas') + `<p>${md(TERRES.pasIci)}</p>`;
      h += h3('Ce qui guette') + `<p>${md(TERRES.guettent)}</p>`;
      const TS = TERRES.secret;
      let s = h3('Les raccourcis (ils ne s’ouvrent que d’un côté)') + ul(TS.raccourcis) + h3('Les recoins') + ul(TS.recoins) + h3('Les passages vers la vallée') + ul(TS.passages) + h3('Ceux d’avant') + `<p>${md(TS.avant)}</p>`;
      h += SEC(s, 'Les raccourcis, les recoins, les passages vers la vallée : masqué (secrets).');
      SP('sys:terres-avant', { t: 'Les Terres d’Avant', s: 'Derrière la Grande Porte : un second pays, deux fois grand comme la vallée', c: ['terres'], i: '⛰', h }, files(/^(11-zzzzV1-(2|3|4|6)-)/));
    }
    // -- la discrétion
    {
      let h = `<p class="lead">${md(DISCRETION.lead)}</p>`;
      h += h3('Ce qui vous montre') + ul(DISCRETION.montre);
      h += h3('Ce qui vous cache') + `<p>${md(DISCRETION.cache)}</p>`;
      const FC = T('FURTIF_COUVERT', {});
      if (Object.keys(FC).length) h += tbl(['Accroupi dans…', 'Il vous cache à'], Object.entries(FC).sort((a, b) => b[1] - a[1]).map(([k, v]) => td([esc(FURTIF_NOMS[k] || k), pct(v).replace(',0 %', ' %')])));
      h += h3('Ce qui guette') + `<p>${md(DISCRETION.guetteur)}</p>`;
      h += h3('Ce qui s’entend') + tbl(['Le bruit', 'Jusqu’où'], [['une chute', 'de 8 à 22 m, selon la hauteur'], ['un coup de fusil', '90 m (le Ver l’entend de bien plus loin)'], ['un coup d’outil', '5 à 9 m'], ['une porte, une trappe', '10 m'], ['l’eau', '12 m'], ['un mur creux qu’on fait tomber', '22 m'], ['le pont-levis des Ravines', '40 m'], ['le petit jeu du crochetage', 'une goupille ≈ 4 m, un raté ≈ 14 m']].map((r) => td(r.map(esc)))) + `<p>${md('Les bottes de cuir alourdissent le pas (+15 %) ; les [[it:chaussons_lisiere|chaussons de lisière]] l’étouffent (−40 %).')}</p>`;
      h += h3('Jeter une pierre') + `<p>${md(DISCRETION.pierre)}</p>`;
      h += h3('L’œil, en haut de l’écran') + `<p>${md(DISCRETION.oeil)}</p>` + tbl(['L’œil', 'Ce qu’il veut dire'], [['fermé (on ne voit rien)', 'personne ne s’inquiète'], ['mi-clos', 'quelque chose a entendu, ou entrevu'], ['grand ouvert, cerclé de rouge', 'on vous a vu'], ['il regarde de côté', 'on vous cherche']].map((r) => td(r.map(esc))));
      SP('sys:discretion', { t: 'La discrétion', s: 'Ce qui vous montre, ce qui vous cache ; l’œil, en haut de l’écran', c: ['terres'], i: '👁', h }, files(/^(11-zzzzV1-5-|12-z+V1-)/));
    }
  } },

  // ======== le Ver (V3)
  { id: 'V3', present: (C) => !!C.T('V3', null), fiches(C) {
    const { T, md, ul, ol, h3, h4, tbl, td, kv, SEC, SP, lk, esc, IL, npcLink, pages, book, engr, plan, files, ITEMS } = C;
    const V3 = T('V3', {}), H = V3.heures || { reveil: 4.6, envol: 6.6, retour: 19.4, coucher: 21.4 }, TX = T('V3_TEXTES', {}), RU = T('V3_RUMEURS', {}), RT = T('V3_RUMEURS_TOUS', []);
    let h = `<p class="lead">${md(VER.lead)}</p>`;
    h += kv([['Sa taille', 'une cinquantaine de mètres d’envergure, et autant du museau au bout de la queue ; posé, sa tête est à seize mètres du sol'], ['À quoi on le reconnaît', 'noir ; un collier de fer rivé au cou (trois maillons d’une chaîne rompue pendent dessous) ; les yeux comme des braises ; un carreau de baliste planté sous l’aile gauche'], ['Où', `seulement dans ${lk('sys:terres-avant', 'les Terres d’Avant')} ${plan('', 'Le plan')}`]]);
    h += h3('Ses heures') + tbl(['', 'Quand', 'Ce qu’il fait'], [
      ['La nuit', `de ${heure(H.coucher)} à ${heure(H.reveil)}`, 'il **dort** dans son aire, au sommet du Pic, lové, la tête tournée vers la Porte, les yeux fermés ; une braise rougeoie au fond de ses naseaux à chaque souffle (on le voit ainsi dans le noir) ; quand quelque chose l’inquiète, **un œil s’entrouvre**'],
      ['L’aube', `de ${heure(H.reveil)} à ${heure(H.envol)}`, 'il se lève et **veille** au bord de l’aire, puis s’envole'],
      ['Le jour', `de ${heure(H.envol)} à ${heure(H.retour)}`, 'il fait ses **rondes** : il survole les régions, le Seuil et la Porte, va **souvent voir la région où vous êtes**, tourne au-dessus de ce qui l’intrigue, et **se pose** sur ses perchoirs (une minute ou deux : il y tourne la tête, il guette) ; trois ou quatre fois par jour'],
      ['Le soir', `dès ${heure(H.retour)}`, 'il rentre à l’aire (plus tôt s’il est loin)'],
    ].map(([a, b, c]) => td([`<b>${esc(a)}</b>`, esc(b), md(c)])));
    h += `<p>${md(VER.entendre)}</p>`;
    h += h3('Ce qu’il voit, ce qu’il entend') + ul(VER.voit.slice(0, 1)) + tbl(['Comment on est (en plein jour, par temps clair)', 'Jusqu’où il vous voit'], VER.portees.map((r) => td(r.map(esc)))) + ul(VER.voit.slice(1));
    h += h3('L’attaque, le feu') + ul(VER.attaque.map((t) => C.sub(t, { portee: V3.feuPortee || 40, passes: ['', 'Une', 'Deux', 'Trois', 'Quatre'][V3.passesMax || 3] || V3.passesMax, repousse: ['', 'un', 'deux', 'trois', 'quatre', 'cinq'][V3.repousse || 4] || V3.repousse })));
    h += h3('Lui échapper') + `<p>${md(VER.echapper)}</p>`;
    const ru = Object.keys(RU).filter((g) => pages.has('pnj:' + g));
    if (ru.length || RT.length) h += h3('Ce qu’en disent les gens') + `<ul class="qs">${ru.map((g) => [].concat(RU[g]).map((t) => `<li>${C.FILL(t, g)} <small>— ${npcLink(g)}</small></li>`).join('')).join('')}${RT.map((t) => `<li>${C.FILL(t)} <small>— on le dit</small></li>`).join('')}</ul>`;
    const VS = VER.secret;
    let s = h3('L’aire') + ul(VS.aire);
    if (TX.anneau) s += engr(TX.anneauTitre || 'Un anneau de fer, scellé dans le roc', TX.anneau);
    s += h3('Ses perchoirs') + ul(Object.values(PERCHOIRS).map((P) => `**${cap(P[1])}** : ${P[2]}.`)) + '<p class="note">Des os autour de chacun.</p>';
    s += h3('La cloche du Guet') + `<p>${md(VS.cloche)}</p>`;
    s += h3('Les fins (aucune n’est obligée)') + ul(VS.fins.map((t) => C.sub(t, { pv: C.nfmt(V3.pv || 1500), guerison: ['', 'un', 'deux', 'trois'][V3.guerison || 2] || V3.guerison })));
    s += h4('Le délivrer sans se faire voir') + ol(VS.delivrer) + h4('Le tuer (si l’on y tient)') + `<p>${md(VS.tuer)}</p>`;
    s += h3('Ce qu’il garde, ce qu’on y gagne') + `<p>${md(VS.tas)}</p>`;
    const its = ['v3_ecaille', 'v3_dent', 'v3_coeur', 'v3_cle_collier', 'v3_carnet'].filter((i) => ITEMS[i]);
    const ou = { v3_ecaille: 'tombées sur trois perchoirs ; sur le corps du Ver (quatre) ; et, s’il est délivré, une sur le seuil de la ferme', v3_dent: 'le tas (parfois) ; sur le corps du Ver (trois)', v3_coeur: 'sur le corps du Ver', v3_cle_collier: 'dans la main du dernier guetteur, à l’aire', v3_carnet: 'sur la paillasse de la loge du Guet (en main, clic : le relire)' };
    if (its.length) s += tbl(['Objet', 'Prix', 'D’où'], its.map((i) => td([IL(i), ITEMS[i].price ? C.nfmt(ITEMS[i].price) : '—', esc(ou[i] || '')])));
    s += h3('L’histoire') + `<p>${md(VS.histoire)}</p>`;
    if ((TX.carnet || []).length) s += h4('Le carnet du Guet') + `<div class="book">${TX.carnet.map((t, i) => book(`Page ${i + 1}`, t)).join('')}${TX.carnetSigne ? `<p class="note">${esc(TX.carnetSigne)}</p>` : ''}</div>`;
    const lire = [['chaineTitre', 'chaine'], ['borneTitre', 'borne'], ['balisteTitre', 'baliste'], ['compteTitre', 'compte'], ['heaumeTitre', 'heaume'], ['griffesTitre', 'griffes']].filter(([, k]) => TX[k]);
    if (lire.length) s += h4('Ce qu’on lit, ce qu’on voit') + lire.map(([t, k]) => engr(TX[t], TX[k])).join('');
    s += h4('Petites choses') + ul(VS.petites);
    h += SEC(s, 'L’aire, les perchoirs, la cloche du Guet, les fins, l’histoire : masqué (secrets).');
    SP('sys:ver', { t: 'Le Ver', s: 'Le dragon qui veille sur les Terres d’Avant : ses rondes, ce qu’il voit, son feu', c: ['terres'], i: '🐉', h }, files(/^(11-zzzzV3-|07-z+V3-)/));
    for (const i of its) C.append('it:' + i, `<p>${lk('sys:ver', 'Le Ver')}</p>`);
  } },

  // ======== Hautguet (V4)
  { id: 'V4', present: (C) => !!C.T('V4_LIEUX', null), fiches(C) {
    const { T, V, md, ul, h3, h4, tbl, td, kv, SEC, SP, lk, esc, IL, book, engr, plan, files, ITEMS, pages } = C;
    const LI = T('V4_LIRE', {}), TH = T('V4_THIBAUD', {}), DA = T('V4_DAME', {}), TX = T('V4_TEXTES', {});
    const HG = HAUTGUET, HS = HG.secret;
    let h = `<p class="lead">${md(HG.lead)}</p>`;
    h += kv([['Où', `sur ${lk('zone:hauts', 'les Hauts')}, au nord-est des ${lk('sys:terres-avant', 'Terres d’Avant')} ${plan('p:sys:hautguet', 'Voir sur le plan')}`]]);
    h += h3('L’arrivée') + `<p>${md(HG.arrivee)}</p>`;
    if (LI.borne) h += engr(LI.borne[0], LI.borne[1]);
    h += h3('Le plan') + tbl(['', 'Ce qu’on y trouve'], HG.plan.map(([a, b]) => td([`<b>${esc(a)}</b>`, md(b)])));
    h += '<p class="note">Les murs ont leur chemin de ronde à onze mètres ; les tours le traversent (des vis les relient au sol).</p>';
    h += h3('Comment entrer, sans clé') + `<ol>${HG.entrer.map((t) => `<li>${md(t)}</li>`).join('')}</ol><p>${md(HG.traverser)}</p>`;
    h += h3('Les gens, ou ce qu’il en reste') + ul(HG.gens);
    h += h3('Le feu du Guet') + `<p>${md(HG.guet)}</p>`;
    h += h3('La cloche, le Ver') + ul([HG.cloche, HG.ver]);
    let s = h3('L’histoire') + `<p>${md(HS.histoire)}</p>`;
    s += h3('Les clés') + tbl(['La clé', 'Où', 'Ce qu’elle ouvre'], HS.cles.filter(([i]) => ITEMS[i]).map(([i, ou, quoi]) => td([IL(i), esc(ou), esc(quoi)]))) + `<p>${md('**L’ordre des clés** : ' + HS.ordre)}</p>`;
    s += h3('Les raccourcis (ils ne s’ouvrent que d’un côté)') + ul(HS.raccourcis) + `<p>${md('Une fois entré par la brèche, le chemin de ronde ou le conduit, on ouvre derrière soi : la roue de la herse, la poterne de la dépense, le treuil du pont.')}</p>`;
    s += h3('L’oubliette') + `<p>${md(HS.oubliette)}</p>`;
    s += h3('Les murs creux') + '<p class="note">E : on frappe ; avec une pioche ou un marteau dans la sacoche, au deuxième coup, ils cèdent.</p>' + ul(HS.murs);
    s += h3('Les autres recoins') + `<p>${md(HS.recoins)}</p>` + h4('Les trois huiles du fanal') + `<p>${md(HS.huiles)}</p>`;
    s += h3('Les morts, là où ils sont restés') + `<p>${md(HS.morts)}</p>`;
    const qt = [TH.qui, TH.quoi, TH.treuil, TH.dame, TH.guet].filter(Boolean);
    if (TH.premier) s += h3('Thibaud, ce qu’il dit') + `<p>${C.FILL(TH.premier)}</p>` + C.q(qt) + (TH.baisse ? `<p class="note">Le pont baissé :</p>${C.q([TH.baisse, TH.apres, TH.bout])}` : '');
    const qd = [DA.premier, DA.pontLeve, DA.pontBaisse, DA.cle, DA.aCle, DA.aude, DA.guet, DA.silence].filter(Boolean);
    if (qd.length) s += h3('La Dame, ce qu’elle dit') + '<p class="note">La nuit seulement, en frappant à sa porte ; selon ce qu’on a fait (le pont, la clé, le feu du Guet). Une fois la porte ouverte, plus rien.</p>' + C.q(qd);
    s += h3('Fins et choses qui changent') + ul(HS.fins);
    const lire = Object.entries(LI).filter(([k]) => k !== 'borne');
    if (lire.length) s += h3('Ce qu’on y lit') + lire.map(([, a]) => (/^[A-ZÀ-Ý« ’.,;:!?\n0-9-]+$/.test(String(a[1]).replace(/[«»]/g, '')) ? engr(a[0], a[1]) : book(a[0], a[1], a[2]))).join('');
    if (V.textes && V.textes.registre) s += h4('Le registre du portier') + book('', V.textes.registre);
    if (V.textes && V.textes.lettre) s += h4('La lettre de dame Ysolde') + book('', V.textes.lettre);
    h += SEC(s, 'L’histoire, les clés, les raccourcis, les recoins, ce que disent Thibaud et la Dame, les fins : masqué (secrets).');
    SP('sys:hautguet', { t: 'Hautguet, le château des Hauts', s: 'Sur les Hauts : le pont levé, la herse, le donjon, la tour de la Dame', c: ['terres'], i: '🏰', h }, files(/^(11-zzzzV4-|07-z+V4-)/));
    // les objets du château : d’où ils viennent (secrets)
    const ou = Object.fromEntries(HS.cles.map(([i, o]) => [i, o]));
    Object.assign(ou, { v4_registre: 'dans la loge du portier (en main, clic : le lire)', v4_lettre_dame: 'en haut de la tour de la Dame (en main, clic : la lire)', v4_anneau: 'sur la terrasse du donjon, au doigt du sire' });
    for (const [i, o] of Object.entries(ou)) {
      if (!pages.has('it:' + i)) continue;
      const m = /^v4_(registre|anneau|trousseau)$/.test(i);
      C.append('it:' + i, SEC(`<p>${md(`On ${m ? 'le' : 'la'} trouve à [[sys:hautguet|Hautguet]] : ${o}.`)}</p>`, `D’où ${m ? 'il' : 'elle'} vient : masqué (secrets).`) + `<p>${lk('sys:hautguet', 'Hautguet')}</p>`);
    }
  } },

  // ======== les gobelins (X)
  { id: 'X', present: (C) => !!C.T('GOB_REGL', null), fiches(C) {
    const { T, md, ul, h3, h4, tbl, td, kv, SEC, SP, lk, esc, IL, npcLink, pages, q, files, ITEMS } = C;
    const GR = T('GOB_REGL', {}), GT = T('GOB_T', {});
    const vit = GR.vitesse || {}, vue = GR.vue || {}, ro = GR.rodeurs || {};
    const o = { nichee: ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix'][GR.nichee || 9] || GR.nichee, sortie0: heure((GR.sortie || [21.5])[0]), sortie1: heure((GR.sortie || [0, 4.5])[1]), paraitre: GR.paraitre || 125, homme: GR.homme || 15, course: String(vit.course || 6.4).replace('.', ','), mur: String(vit.mur || 0.7).replace('.', ','), partir: cap(['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept'][GR.partir || 6] || String(GR.partir)), max: GR.rancuneMax || 12, periode: ro.periode || 18, nuit: pct(ro.nuit || 0.16).replace(',0 %', ' %'), brune: pct(ro.brune || 0.05).replace(',0 %', ' %'), jour: pct(ro.jour || 0.01).replace(',0 %', ' %'), poignees: ['', 'une', 'deux', 'trois', 'quatre'][GR.poignees || 3] || GR.poignees, porte0: heure((GR.porte || [22])[0]), porte1: heure((GR.porte || [0, 4])[1]) };
    const S = (t) => C.sub(t, o);
    let h = `<p class="lead">${md(S(GOB.lead))}</p>`;
    h += h3('Qui ils sont') + `<p>${md(GOB.qui)}</p>`;
    if ((GT.mots || []).length) h += `<p class="note">Leurs mots volés :</p>${q(GT.mots)}`;
    h += h3('La nuit : ils volent') + ul(GOB.nuit.map(S));
    const PL = GT.plaintes || {}, pl = Object.keys(PL).filter((g) => g !== '_' && pages.has('pnj:' + g));
    if (pl.length) h += h4('Les plaintes du lendemain') + `<ul class="qs">${pl.map((g) => `<li>${C.FILL(PL[g], g)} <small>— ${npcLink(g)}</small></li>`).join('')}${[].concat(PL._ || []).map((t) => `<li>${C.FILL(t)} <small>— les autres</small></li>`).join('')}</ul>`;
    h += h3('Ils se baladent') + `<p>${md(S(GOB.balade))}</p>`;
    h += h3('Ils restent loin des hommes') + ul(GOB.loin.map(S));
    h += tbl(['La lumière', 'Jusqu’où vous les distinguez'], GOB.vue.map(([t, k, plus]) => td([esc(t), k ? `${vue[k] || '?'} m${esc(plus)}` : esc(plus)])));
    h += h3('Les attraper, les tuer') + ul(GOB.attraper.map(S));
    h += h3('Leur rancune') + `<p>${md(S(GOB.rancune))}</p>`;
    h += h3('Rendre ce qu’on a repris') + `<p>${md(GOB.rendre)}</p>` + ((GT.rendre && GT.rendre.merci) ? q(GT.rendre.merci.map((t) => t.replace('{objets}', '…'))) : '');
    h += h3('Le carnet') + `<p>${md(GOB.carnet)}</p>`;
    const RU = GT.rumeurs || {}, ru = Object.keys(RU).filter((g) => pages.has('pnj:' + g));
    if (ru.length) h += h3('Ce qu’on dit d’eux') + `<ul class="qs">${ru.map((g) => `<li>${C.FILL(RU[g], g)} <small>— ${npcLink(g)}</small></li>`).join('')}</ul>`;
    const GS = GOB.secret;
    let s = h3('Le chemin de chez eux') + '<p class="note">Trois choses à comprendre, dans l’ordre ; et un raccourci.</p>' + ul(GS.chemin.map(S));
    s += h3('La Gobelinière') + ul(GS.village) + `<p>${md('[[li:gobeliniere|La Gobelinière]] · [[li:gob_souche|la vieille souche]]')}</p>`;
    const OB = GT.objets || {};
    if (Object.keys(OB).length) s += h4('Ce qui raconte (E pour lire)') + Object.values(OB).map(([t, x]) => C.book(t, x)).join('');
    s += h3('Les richesses, et ce qu’elles coûtent') + ul(GS.richesses.map(S));
    s += h3('La vieille') + ul(GS.vieille);
    const A = GT.aieule || {};
    const qa = [A.salut, A.salutPris, A.salutTue, A.salutPacte, A.pourquoi, A.pacte, A.pacteRefus, A.rendu, A.morte].filter(Boolean);
    if (qa.length) s += h4('Ce qu’elle dit') + q(qa);
    const its = GS.objets.filter(([i]) => ITEMS[i]);
    if (its.length) s += h3('Les objets') + tbl(['Objet', 'Prix', 'D’où'], its.map(([i, d]) => td([IL(i), C.nfmt(ITEMS[i].price || 0), esc(d)])));
    h += SEC(s, 'Le chemin de chez eux, leur village, leurs trésors, la vieille : masqué (secrets).');
    SP('sys:gobelins', { t: 'Les gobelins', s: 'Les Petits, ceux d’en dessous : les vols de nuit, leur marque, leur fuite, les murs qu’ils traversent', c: ['gobelins'], i: '⁂', h }, files(/^(11-zzzzX-|12-z+X-|07-z+X-)/));
    // les bêtes : le gobelin, la vieille (un secret)
    const pg = pages.get('an:gobelin');
    if (pg) { pg.h = `<p class="lead">${md('Un gobelin, l’un des Petits : un mètre, voûté, gris-vert, les bras trop longs ; il passe dans les murs et fuit qui le regarde. Voir [[sys:gobelins|les gobelins]].')}</p>` + pg.h.replace(/<details><summary>Autres caractéristiques<\/summary>[\s\S]*?<\/details>/, ''); pg.s = 'Les Petits, ceux d’en dessous'; }
    const pa = pages.get('an:gob_aieule');
    if (pa) { pa.t = 'La vieille des gobelins'; pa.x = 1; pa.s = 'Tout en haut du grand tas, à la Gobelinière'; pa.h = `<p class="lead">${md((A.desc || 'Assise tout en haut du grand tas, les yeux blancs.') + ' Voir [[sys:gobelins|les gobelins]].')}</p>` + pa.h.replace(/<details><summary>Autres caractéristiques<\/summary>[\s\S]*?<\/details>/, '').replace(/<dl class="kv"><\/dl>/, ''); }
    for (const id of ['li:gob_souche', 'li:gobeliniere']) C.append(id, h3('Les gobelins') + `<p>${md('Voir [[sys:gobelins|les gobelins]] : le chemin de chez eux, leur village, la vieille.')}</p>`);
    for (const [i, d] of its) C.append('it:' + i, SEC(`<p>${md(`D’où : ${d} — [[sys:gobelins|les gobelins]].`)}</p>`, false));
  } },

  // ======== la main du crocheteur, le cambriolage de nuit (U)
  { id: 'U', present: (C) => !!C.T('U_PALIERS', null), fiches(C) {
    const { T, V, md, ul, ol, h3, h4, tbl, td, SEC, SP, lk, esc, IL, pages, q, files, ITEMS, npcLink } = C;
    const PA = T('U_PALIERS', []), PE = T('U_PALIER_PENSEE', []), CA = T('U_PALIER_CARNET', []), GA = T('U_GAINS', {}), SE = T('U_SERRURES', {}), FI = T('U_FINS', {}), CH = T('U_CHAUSSONS', {}), BR = T('U_BRUITS', {}), RE = T('U_REVEIL', {});
    const LIV = T('LIVRES', {}), ser = ((V.textes && V.textes.serrures) || []).length ? V.textes.serrures : Object.keys(LIV).filter((b) => LIV[b].serrures);
    const serTxt = ser.map((b) => `[[${pages.has('it:livre_' + b) ? 'it:livre_' + b : 'lv:' + b}|${(LIV[b] || {}).titre || b}]]`).join(', ');
    const nom = (i) => (PA[i] ? PA[i].nom : '');
    // -- la main
    let h = `<p class="lead">${md(MAIN.lead)}</p>`;
    const ouvre = { 2: '(et autre chose encore : secret)', 3: `${(SE[6] || {}).nom || 'la serrure à secret'}, avec des crochets fins ; le colporteur propose les crochets fins`, 4: `${(SE[6] || {}).nom || 'la serrure à secret'} sans crochets fins ; ${(SE[7] || {}).nom || 'la serrure de coffre'}, avec`, 5: 'presque plus de maladresse' };
    h += h3('Les six paliers') + tbl(['', 'La main', 'Points', 'La ligne dorée', 'Les goupilles', 'Un crochet qui casse', 'Le bruit', 'Les pas', 'La maladresse', 'Ce qui s’ouvre'], PA.map((P, i) => td([String(i), `<b>${esc(P.nom)}</b>`, C.nfmt(P.pts), fois(P.zone), P.vit === 1 ? '—' : `${fois(P.vit)} de vitesse`, fois(P.casse), fois(P.bruit), fois(P.pas), pct(P.maladresse).replace(',0 %', ' %'), esc(ouvre[i] || '—')])));
    h += '<p class="note">La ligne dorée : la zone où l’on cale la goupille (plus large, c’est plus facile) ; les goupilles : la vitesse à laquelle elles montent et descendent ; la maladresse : la chance, à chaque fouille, de faire tomber quelque chose.</p>';
    h += h3('Ce qui la fait progresser') + ul(MAIN.gains.map((t) => C.sub(t, { goupille: String(GA.goupille ?? 0.06).replace('.', ','), ouverte: String(GA.ouverte ?? 1).replace('.', ','), echec: String(GA.echec ?? 0.3).replace('.', ','), nuit: String(GA.nuit ?? 3), exerciceMax: GA.exerciceMax ?? 35, serrures: serTxt || 'les traités de serrurerie' }))) + `<p>${md(MAIN.reperes)}</p>`;
    const pens = PE.map((t, i) => [i, t, CA[i]]).filter(([, t]) => t);
    if (pens.length) h += tbl(['', 'La pensée, au palier franchi', 'Au carnet'], pens.map(([i, t, c]) => td([`<b>${esc(nom(i))}</b>`, esc(String(t).replace(/^\(|\)$/g, '')), esc(c || '')])));
    const S6 = SE[6] || {}, S7 = SE[7] || {};
    h += h3('Les serrures') + `<p>${md(C.sub(MAIN.serrures, { s6: S6.nom || 'une serrure à secret', p6: S6.pins || 7, m6: nom(S6.palier ?? 3), m6b: nom((S6.palier ?? 3) + 1), s7: S7.nom || 'une serrure de coffre', p7: S7.pins || 8, m7: nom(S7.palier ?? 4) }))}</p><p>${md(MAIN.reussite)}</p><p>${md('Les sept serrures, leurs goupilles et leur fenêtre : [[sys:crochetage|crocheter une serrure]].')}</p>`;
    h += h3('Les objets') + tbl(['Objet', 'Prix', 'Qui le vend', 'À quoi il sert'], MAIN.objets.filter(([i]) => ITEMS[i]).map(([i, qui, quoi]) => td([IL(i), C.nfmt(ITEMS[i].price || 0), esc(qui), md(C.sub(quoi, { fz: fois(FI.zone ?? 1.1).slice(1), fc: fois(FI.casse ?? 0.35).slice(1), fb: fois(FI.bruit ?? 0.85).slice(1), cp: fois(CH.pas ?? 0.55).slice(1), cg: fois(CH.grince ?? 0.6).slice(1) }))])));
    h += SEC(h3('À « une main sûre »') + `<p>${md('On sent les **doubles fonds** en fouillant les meubles : voir [[sys:cambriolage|le cambriolage de nuit]]. Leurs papiers font aussi progresser la main (de 2 à 8 points, une fois chacun).')}</p>`, 'Ce que sent « une main sûre » : masqué (secrets).');
    SP('sys:main-crocheteur', { t: 'La main du crocheteur', s: 'Six paliers, des doigts gourds à une main de velours ; deux serrures nouvelles', c: ['maisons'], g: 'Crocheter, cambrioler', i: '🗝', h }, files(/^11-zzzzU-1-/));
    // -- le cambriolage
    const K = RE.K ?? 0.055;
    h = `<p class="lead">${md(CAMB.lead)}</p>` + `<p>${md(CAMB.heures)}</p>`;
    const fo = BR.fouille || {}, fv = Object.values(fo).filter((v) => typeof v === 'number').sort((a, b) => a - b);
    const val = (keys) => keys.map((k) => (k === '@fouille' ? (fv.length ? `${String(fv[0]).replace('.', ',')} à ${String(fv[fv.length - 1]).replace('.', ',')}` : '') : BR[k] !== undefined ? String(BR[k]).replace('.', ',') : '?')).join(' / ');
    h += h3('Chaque bruit') + tbl(['Le bruit', 'Sa force'], U_BRUITS_NOMS.map(([t, keys, plus]) => td([esc(C.sub(t, { gc: pct(BR.grinceChance ?? 0.05).replace(',0 %', ' %'), ga: pct(BR.grinceAccroupi ?? 0.025), m0: pct((PA[0] || {}).maladresse ?? 0.14).replace(',0 %', ' %'), m5: pct((PA[PA.length - 1] || {}).maladresse ?? 0.012) })), val(keys) + (plus || '')])));
    h += '<p class="note">La force : 1, c’est un crochet qui ripe. Avec la main, les gestes de la serrure et des fouilles font moins de bruit, et les pas aussi (les paliers : [[sys:main-crocheteur|la main du crocheteur]]) ; les chaussons de lisière étouffent les pas.</p>'.replace('[[sys:main-crocheteur|la main du crocheteur]]', lk('sys:main-crocheteur', 'la main du crocheteur'));
    h += h3('La chance de réveiller') + `<p>${md(C.sub(CAMB.chance, { K: pct(K), portee: RE.portee ?? 5 }))}</p>` + ul(CAMB.facteurs) + `<p>${md(CAMB.entendre)}</p>`;
    h += h4('Ce que ça donne') + '<p class="note">Mesuré (équilibrage du jeu) : une maison, la porte crochetée, deux meubles, trois choses prises dans chacun.</p>' + tbl(['Comment', 'La chance de réveiller quelqu’un'], CAMB.mesures.map((r) => td(r.map(esc)))) + `<p>${md(CAMB.maison)}</p>`;
    h += h3('Réveillé') + ol(CAMB.reveille) + `<p>${md(CAMB.interrompu)}</p>`;
    h += h3('Le lendemain') + `<p>${md(CAMB.lendemain)}</p>` + q([T('U_PLAINTE_NUIT', []), T('U_PLAINTE_BRUIT', [])].flat().map((t) => (Array.isArray(t) ? t[1] : t)));
    h += h3('Ce que ça rapporte, ce que ça coûte') + `<p>${md(CAMB.rapporte)}</p>`;
    const BRV = T('U_CRI_BRAVE', {});
    h += h3('Ce qu’on entend') + `<p class="note">Le dormeur qui remue :</p>${q(T('U_MURMURES', []))}<p class="note">Réveillé, il n’a encore rien vu :</p>${q(T('U_REVEIL_DOUTE', []))}<p class="note">Il se recouche :</p>${q(T('U_RECOUCHE', []).map((t) => (Array.isArray(t) ? t[1] : t)))}<p class="note">Il vous voit :</p>${q([...T('U_CRI_INCONNU', []), ...T('U_CRI_RECONNU', []).map((t) => t.replace('{prenom}', '‹votre prénom›'))])}` + (Object.keys(BRV).length ? `<p class="note">Ceux qui ne se laissent pas faire :</p><ul class="qs">${Object.entries(BRV).map(([g, t]) => `<li>${C.FILL(t, g)}${pages.has('pnj:' + g) ? ` <small>— ${npcLink(g)}</small>` : ''}</li>`).join('')}</ul>` : '');
    const CS = CAMB.secret, DF = T('U_DOUBLES_FONDS', {}), PP = T('U_PAPIERS_PTS', {}), refill = (V.textes && V.textes.dfRefill) || 9;
    const SERN = { 5: 'une serrure de maître (5)', 6: 'une serrure à secret (6)' }, MEU = { armoire: 'une armoire', commode: 'une commode', buffet: 'un buffet', malle: 'une malle', secretaire: 'un secrétaire' };
    let s = h3('Les doubles fonds') + `<p>${md(C.sub(CS.df, { refill: refill === 9 ? 'neuf' : refill }))}</p>` + tbl(['Le papier', 'Ce qu’il dit', 'La main'], CS.papiers.map(([id, t, d]) => td([`<b>${esc(t)}</b>`, esc(d), PP[id] ? `+${PP[id]} points` : '—']))) + (Object.keys(DF).length ? `<p class="note">Les meubles : ${Object.entries(DF).map(([m, D]) => `${esc(MEU[m] || m)} (${esc(SERN[D.lock] || D.lock)})`).join(', ')}.</p>` : '');
    s += h3('Les heures') + `<p>${md(CS.heures)}</p>` + h3('Qui dort léger, qui dort lourd') + `<p>${md(CS.legers)}</p>`;
    const po = PA.length ? `de +${Math.round(PA[1].poche * 100)} % à « ${PA[1].nom} » à +${Math.round(PA[PA.length - 1].poche * 100)} % à « ${PA[PA.length - 1].nom} »` : '+2 % à +10 % selon le palier';
    s += h3('Et encore') + ul(CS.divers.map((t) => t.replace('{poche}', po)));
    h += SEC(s, 'Les doubles fonds, les heures, qui dort léger : masqué (secrets).');
    SP('sys:cambriolage', { t: 'Le cambriolage de nuit', s: 'Les dormeurs qui peuvent se réveiller, le garde, les plaintes, les doubles fonds', c: ['maisons'], g: 'Crocheter, cambrioler', i: '🕯', h }, files(/^11-zzzzU-2-/));
    // -- crocheter une serrure (la fiche d’avant) : la main, et le dormeur d’aujourd’hui
    const pc = pages.get('sys:crochetage');
    if (pc) {
      pc.g = 'Crocheter, cambrioler';
      pc.h = pc.h.replace(/Pour chaque point de bruit, un habitant qui dort l’entend [^;]*; éveillé,/, `Un habitant qui dort a une petite chance de se réveiller à chaque bruit (${lk('sys:cambriolage', 'le cambriolage de nuit')}) ; pour chaque point de bruit, un habitant éveillé l’entend,`);
      pc.h = pc.h.replace(/<h3>Les serrures<\/h3>/, `<h3>La main</h3><p>${md('La main progresse avec la pratique, des « doigts gourds » à « une main de velours » : la ligne s’élargit, les goupilles courent moins vite, cassent et retombent moins, les gestes font moins de bruit ; les serrures 6 et 7 ne s’ouvrent qu’aux derniers paliers. Voir [[sys:main-crocheteur|la main du crocheteur]].')}</p><h3>Les serrures</h3>`);
      if (!pc.h.includes('sys%3Acambriolage')) pc.h += `<p>${lk('sys:main-crocheteur', 'La main du crocheteur')} · ${lk('sys:cambriolage', 'Le cambriolage de nuit')}</p>`;
    }
    for (const i of ['cadenas_exercice', 'crochets_fins', 'chaussons_lisiere']) C.append('it:' + i, `<p>${lk('sys:main-crocheteur', 'La main du crocheteur')}${i === 'chaussons_lisiere' ? ' · ' + lk('sys:cambriolage', 'Le cambriolage de nuit') + ' · ' + lk('sys:discretion', 'La discrétion') : ''}</p>`);
  } },
];

// ================================================================ les sections (sections)
function sections(cats, X) {
  const { byCat, pages, isSys, sortT } = X;
  const at = (id) => cats.findIndex((c) => c.id === id);
  const has = (id) => pages.has(id);
  const ins = (c, apres) => { c.groups = c.groups.filter((g) => g.ids.length); if (!c.groups.length || at(c.id) >= 0) return; const i = apres.map(at).find((x) => x >= 0); cats.splice(i >= 0 ? i + 1 : cats.length, 0, c); };
  for (const S of SECTIONS) ins({ id: S.id, t: S.t, d: S.d, nouveau: true, groups: S.groupes.map(([t, ids]) => ({ t, ids: ids.filter(has) })) }, S.apres);
  // les livres, rangés par rayons (les fiches « sys: » d’abord)
  const c = cats[at('livres')];
  if (c && ETAT.livres && ETAT.rayons) {
    const all = byCat('livres'), sys = all.filter(isSys), groups = {}, ord = (ETAT.ordre || Object.keys(ETAT.rayons)).map((r) => ETAT.rayons[r] && ETAT.rayons[r].nom).filter(Boolean);
    for (const id of all.filter((i) => !isSys(i))) {
      const b = id.replace(/^it:livre_|^lv:/, ''), L = ETAT.livres[b], R = L && L.rayon && ETAT.rayons[L.rayon];
      const g = R ? R.nom : L && !L.biblio ? 'Chez les marchands' : 'Autres';
      (groups[g] || (groups[g] = [])).push(id);
    }
    const noms = [...ord.filter((g) => groups[g]), ...Object.keys(groups).filter((g) => !ord.includes(g))];
    c.groups = [...(sys.length ? [{ t: 'Lire, emprunter', ids: sys }] : []), ...noms.map((g) => ({ t: g === 'L’Enfer' ? 'L’Enfer (sur place)' : g, ids: sortT(groups[g]) }))];
    if (!/rayons/.test(c.d || '')) c.d = (c.d || '').replace(/\.$/, '') + ', rangés par rayons (et l’Enfer, qui ne sort pas).';
  }
  // les descriptions
  const m = cats[at('maisons')];
  if (m && m.d && !/cambriolage/.test(m.d)) m.d = m.d.replace(/\.$/, '') + ' ; la main du crocheteur, le cambriolage de nuit.';
  const nv = cats[at('nouveautes')];
  if (nv && nv.d && !/Terres d’Avant/.test(nv.d)) nv.d = nv.d.replace(' : ', ' : la Grande Porte et les Terres d’Avant, le Ver, Hautguet, les gobelins, la main du crocheteur et le cambriolage de nuit, ');
}

module.exports = { extract, build, sections, plans, planZone, dessinerZone, PLAN_ZONE, AGENTS, CHAPITRES, SECTIONS, COUCHES_PLAN, REGIONS };
