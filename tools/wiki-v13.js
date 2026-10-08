// Le wiki — LA TREIZIÈME VAGUE : des trouvailles posées à la vue un peu partout (un millier, soixante-treize sortes),
// huit bêtes uniques qui parlent (une fiche chacune) et les quêtes principales (pour l’instant : le nonos du chien).
// Rédigé d’après les modules src/*R-ramasser*, *P-betes*, *P-voix*, *Q-nonos*, *Q-scenes* (et les notes de leurs
// auteurs). tools/wiki-build.js appelle :
//  - extract(G, w, DB) pendant la génération : ce que la vallée générée porte de nouveau (les trouvailles, les endroits
//    des bêtes qui parlent, les textes du nonos où l’on dit le nom du chien) → DB.world.v13 ;
//  - build(X) avec ses outils : les fiches (les tables du jeu fournissent ce qui se compte : les sortes, les saisons,
//    les prix, les heures, les répliques) ;
//  - sections(cats, X) quand les sections se font : « Quêtes principales » (après « Quêtes ») et « Les bêtes qui
//    parlent » (après « Bêtes ») ; les trouvailles vont dans « Fouiller, ramasser, casser ».
// « ** » met en gras, « [[id|texte]] » fait un lien vers une fiche ; ce qui se cache va sous « révéler les secrets ».
// Une quête principale de plus : une entrée de plus dans QUETES (sa fiche « qp:<id> », sa ligne dans la fiche
// d’ensemble, sa place dans la section) et sa lettre dans AGENTS (ses tables ne vont plus dans « Autres tables »).
'use strict';

// les étiquettes des modules de la vague (leurs tables sont lues ici : rien dans « Autres tables »)
const AGENTS = ['P', 'Q', 'R'];

// ================================================================ 1) les trouvailles (des objets à ramasser un peu partout)
const TROUV = {
  lead: 'On trouve des choses en se promenant, posées à la vue : on les vise, le réticule dit ce que c’est (« E — Ramasser le fer à cheval »), **E**, et c’est dans la sacoche (une petite icône s’envole vers soi). Pas de meuble à ouvrir, pas de fouille. Ce qu’on voit est ce qu’on ramasse : quatre cerises dessinées, quatre cerises dans la sacoche.',
  voir: [
    'Chaque chose est à sa taille : une branche morte fait près d’un mètre, un sou deux centimètres et demi. Quand on la regarde de près, elle luit à peine (la même lueur que les objets posés qu’on vise).',
    'Les toutes petites choses (sous, boutons, billes, dés, bagues, perles, et les fines : épingles, clous, besicles, chapelets) ne sont jamais dans l’herbe : on les trouve sur la terre des chemins, les pavés des rues, le sable des berges, la roche, la neige, ou dans les maisons. Les moyennes (un gant, une pipe, une ficelle) ne restent dans l’herbe qu’une fois sur quatre ; les grandes (une branche, une bouteille, un bois de chevreuil), partout.',
    'Ce qui est en métal ou en verre accroche le soleil, de jour, à moins de {eclat} mètres : un petit éclat, de temps en temps (« brille », dans les tables).',
    'Plus dense en ville et près des maisons, rare dans les montagnes. Rien dans l’eau, dans un mur ni contre une chose qui sert déjà ; rien non plus dans les autres mondes, sous terre, ni pendant une cinématique.',
  ],
  ramasser: [
    '**E**, à portée de main ({portee} m). Dehors, ce qui traîne est à qui le trouve.',
    'Dans une maison habitée, le réticule dit « (chez Untel) » (ou « (chez quelqu’un) » si on ne le connaît pas) : prendre sous les yeux du maître de maison ou d’un témoin est un **vol** (des cris, de l’amitié perdue, le garde, la société : [[sys:crimes|crimes et avis de recherche]]) ; pas vu, la plainte vient le lendemain, et l’esprit s’en ressent un peu. Chez un mort, dans une maison vide ou à louer, à la ferme : rien.',
  ],
  revient: 'Quelques sortes reviennent, au même endroit, quelques jours après qu’on les a ramassées ; tout le reste se trouve une fois pour toutes.',
  saisons: 'La vallée n’a pas de calendrier des saisons : les fruits tombés suivent un cycle de {cycle} jours (deux semaines de douze jours), le même dans toutes les parties. Le jour de la partie, compté de 1 à {cycle}, puis l’on recommence (le jour {cycle1} est le 1ᵉʳ du cycle suivant). Chaque jour, deux ou trois sortes de fruits jonchent le pied de leurs arbres ; hors saison, rien. Un arbre abattu ne donne plus rien.',
  servir: [
    'Tout se vend : à la [[it:caisse_expedition|caisse d’expédition]], au prix de l’objet ; les trésors aussi au brocanteur des [[act:etals|étals du Marchedi]] (60 %).',
    'Le bois flotté compte comme du bois (la fabrication, le feu) ; le bois mort aussi.',
    'La **mulette fermée** s’ouvre en main (un clic) : sa coquille… et parfois autre chose.',
    'Une **lettre perdue** se lit en la ramassant ; en main, un clic relit toutes celles qu’on a trouvées.',
  ],
  rapporte: [
    '**Une journée de promenade** (sur les chemins, les rues et les sentiers, au hasard des carrefours, en faisant un petit détour pour ce qu’on aperçoit) : environ deux kilomètres et demi, une vingtaine de trouvailles, une quarantaine de pièces — un dixième, à peu près, d’une journée de travail du début.',
    '**Le ramassage acharné** (toujours à la trouvaille la plus proche, en sachant où tout est) : soixante-dix trouvailles et moins de deux cents pièces le premier jour, la moitié d’une journée de travail.',
    '**Ce qui revient**, ramassé chaque jour au plus près pendant une demi-journée : une vingtaine de pièces par jour.',
  ],
  liens: 'Rien n’est posé là où vivent [[sys:betes-parlantes|les bêtes qui parlent]], ni à moins de {nonos} mètres des lieux de [[qp:nonos|la quête du nonos]].',
  secret: [
    'La **pierre percée** : « en regardant au travers, on voit ce qui se cache » — on le dit.',
  ],
};
// les milieux : [clés du jeu, titre, où]
const RAM_MIL = [
  [['chemin'], 'Les chemins', 'le bord des chemins et des sentiers, une fois sur deux sur le chemin même (à peu près une chose tous les deux cents mètres de chemin)'],
  [['champ'], 'Les champs', 'le bord du champ de la ferme, les prés autour du hameau, du ranch, du moulin, de la bergerie'],
  [['verger'], 'Le pied des arbres', 'pommiers, poiriers, pruniers, cerisiers, noyers, châtaigniers, hêtres (plus souvent près des maisons)'],
  [['seuil'], 'Les seuils', 'devant les portes, au pied des murs'],
  [['rue'], 'Les rues et les places', '{ville}, {hameau}, les Planches, le lavoir, le marché'],
  [['eau'], 'Les berges', 'les lacs, les étangs, le marais, la rivière'],
  [['foret'], 'La forêt', 'les forêts, le bois de bouleaux, les sapinières'],
  [['lande', 'hauteurs'], 'La lande, les hauteurs', 'la lande, la Combe, les alpages et les rochers (pas sous la neige)'],
  [['pres'], 'Les prés', 'les grands prés, loin des chemins'],
  [['saint'], 'Les croix et les chapelles', 'chapelles, église, cimetière, calvaires, oratoires, croix, tombes isolées, sources sacrées'],
  [['ancien'], 'Les pierres levées', 'le cercle, les dolmens, les menhirs, les cromlechs, les pierres à cupules, les bornes anciennes, les abris sous roche'],
  [['ruine'], 'Les ruines', 'les ruines, le hameau abandonné, le château, l’abbaye, les tours et les moulins ruinés, les fermes brûlées, les puits perdus'],
  [['camp'], 'Les campements', 'campements, roulottes, charbonnières, cabanes de bûcheron, affûts, le relais de chasse'],
  [['estive'], 'L’estive', 'l’estive et la bergerie'],
  [['cour', 'poules'], 'Les cours, les basses-cours', 'autour de la ferme et des maisons des champs ; les basses-cours du hameau et du ranch'],
  [['maison', 'sol'], 'Les maisons', 'sur une table, une étagère, un manteau de cheminée, un établi, un coffre ; ou par terre, à chaque étage'],
  [['grange', 'tour'], 'Le fenil, le moulin, le phare, les tours', 'le grand fenil du hameau, les étages du vieux moulin et du phare, les tours des remparts, le corps de garde'],
];
// les mêmes, en un mot (la colonne « Où » des sortes)
const RAM_MIL_COURT = { chemin: 'chemins', champ: 'champs', verger: 'pied des arbres', seuil: 'seuils', rue: 'rues', eau: 'berges', foret: 'forêt', lande: 'lande', hauteurs: 'hauteurs', pres: 'prés', saint: 'croix et chapelles', ancien: 'pierres levées', ruine: 'ruines', camp: 'campements', estive: 'estive', cour: 'cours', poules: 'basses-cours', maison: 'maisons', sol: 'maisons', grange: 'fenil', tour: 'tours' };
// les sortes, par famille (ce qui manque ici va dans « Et encore »)
const RAM_FAMILLES = [
  ['De quoi faire', ['branche', 'galet', 'silex', 'clous', 'ficelle', 'chiffon', 'bouteille', 'fer', 'ferraille', 'verre', 'corde', 'flotte', 'liege', 'charbon', 'plume_poule', 'plume_geai', 'plume_buse', 'plume_noire', 'os', 'mue', 'andouiller', 'crane', 'coquille', 'mulette', 'cartouche', 'oeuf']],
  ['De quoi manger : les fruits tombés', ['pommes', 'poires', 'prunes', 'cerises', 'noix', 'chataignes', 'faines']],
  ['De petites valeurs', ['sou', 'bouton', 'bille', 'de', 'bobine', 'epingle', 'ruban', 'peigne', 'mouchoir', 'tabac', 'couteau', 'besicles', 'bague', 'medaille', 'montre']],
  ['Des choses perdues, qui racontent', ['lettre', 'cheval_bois', 'soldat', 'toupie', 'sabot', 'gant', 'pipe', 'chapelet', 'image', 'ex_voto', 'chandelle', 'gourde', 'chapeau', 'cle', 'poupee', 'sonnaille']],
  ['Des choses anciennes', ['tesson', 'piece_ancienne', 'pointe', 'perle']],
];
// les raretés : où les trouver est un secret
const RAM_RARES = ['fibule', 'percee', 'fossile', 'portrait', 'medaillon'];
// les arbres dont les fruits tombent (au pied des…)
const RAM_ARBRES = { apple: 'pommiers', poirier: 'poiriers', prunier: 'pruniers', cerisier: 'cerisiers', noyer: 'noyers', chataignier: 'châtaigniers', hetre: 'hêtres' };
// les objets nouveaux de la vague (les autres sortes donnent des objets du jeu)
const RAM_NOUVEAUX = ['ficelle', 'chiffon', 'bouteille_vide', 'bois_flotte', 'liege', 'coquille_mulette', 'mulette', 'faines', 'montre_arretee', 'bague_laiton', 'epingle_chapeau', 'cle_sans_porte', 'medaille_bapteme', 'cheval_bois', 'soldat_plomb', 'toupie', 'sabot_enfant', 'gant_laine', 'pipe_terre', 'lettre_perdue', 'gourde', 'chapeau_feutre', 'bois_chevreuil', 'crane_renard', 'pointe_fleche', 'fibule', 'perle_verre', 'pierre_percee', 'daguerreotype', 'ex_voto'];

// ================================================================ 2) les bêtes qui parlent
const PARLANTES = {
  lead: 'Huit bêtes uniques parlent — au joueur seulement. Chacune vit à un endroit précis de la vallée, à ses heures, et se reconnaît à un détail. On s’approche, elle parle la première ; **E** pour lui répondre. Elles se souviennent de tout : du jour où on les a rencontrées, de ce qu’on leur a répondu, des services rendus, des coups, des bêtes qu’on a tuées.',
  parler: [
    '**La première fois**, quand on approche à quelques pas, la bête parle la première (une phrase, en sous-titre). **E** ouvre la conversation ; chaque réplique commence par un petit cri de la bête (synthétisé, doux, qui vient d’elle).',
    '**Qui es-tu ?** (son nom), puis **Pourquoi parles-tu ?** — et plus tard, quand elle a confiance, la suite : pourquoi elle parle vraiment.',
    '**Son sujet** (« Et l’auberge ? », « Et ce chêne ? »…) : une confidence de plus chaque jour où l’on revient, quatre en tout, à mesure de sa confiance.',
    '**Qu’est-ce qu’on raconte ?** : deux rumeurs par jour, obliques — de petites vérités sur la vallée et ses secrets, jamais la solution.',
    '**Le service** : elle demande parfois quelque chose, et rend la pareille (un objet, un renseignement, un endroit).',
    '**Y en a-t-il d’autres, comme toi ?** : chacune, quand on la connaît un peu, dit où trouver deux des autres.',
    '**Au revoir** : elle répond en sous-titre.',
  ],
  salut: 'Sa salutation dépend de ce qu’elle sait : une bête tuée par vous (elle le dit, et le nom de la morte) ; un coup reçu (le reproche) ; le deuxième jour où l’on se parle, **une question** qu’elle vous pose (trois réponses : elle s’en souviendra, et vous la rappellera un autre jour) ; une longue absence ; ce que vous avez fait (vos crimes, la chasse, la pêche, les pièges, le chien…) ; une nuit rouge la veille ; le temps qu’il fait ; le jour de la semaine ; l’heure.',
  entendre: 'On les entend avant de les voir : quand on approche à moins de quarante pas, de temps en temps (une fois par minute environ), la bête pousse son petit cri, qui vient d’elle. La nuit, les yeux du chat luisent (un bleu, un d’or), et l’œil ouvert de la hulotte.',
  carnet: 'Le **carnet** de la sacoche (onglet Carnet) garde une page « Des bêtes qui parlent » : celles qu’on a rencontrées, où et quand, ce qu’elles ont demandé, ce qu’elles ont dit d’important ; et celles dont on a entendu parler (avec un « ? »). Voir [[sys:savoir|la sacoche et le carnet]].',
  gens: 'Les gens n’y croient pas, ou font semblant. À chaque habitant, une fois, on peut demander « {question} » ; la plupart haussent les épaules. Qui passe tout près pendant qu’on parle à une bête fait une remarque, une fois par jour.',
  menace: [
    '**Menacer** : pointer une arme sur elle (fusil, arc, hache, faux, fourche, rapière, masse) un court instant, tirer, ou décocher une flèche tout près : elle dit un mot et s’en va (le chat file, les oiseaux s’envolent, le crapaud saute dans le puits, la carpe plonge, la chèvre bondit, le cheval s’éloigne au trot). Elle ne revient pas de la journée, et sa confiance baisse. Un coup de tonnerre la fait partir aussi.',
    '**Blesser** : elle s’enfuit, ne revient pas avant trois jours, et vous le reproche ; l’esprit baisse un peu. **Deux coups**, et elle ne vous parlera plus jamais : elle vous regarde, et se tait.',
    '**Tuer** : elle ne revient pas. Son corps reste là jusqu’à ce qu’on s’éloigne. L’esprit en prend un grand coup, et trois nuits de mauvais rêves. Les autres le savent (« Une voix s’est tue, par ta faute ») et se méfient : elles fuient une arme de plus loin. **À trois bêtes tuées, toutes se taisent.** L’aubergiste pleure son chat.',
    'Elles ne comptent pas comme du gibier : pas de dépouille, rien au tableau de chasse, pas de délit.',
  ],
  nonos: 'Pendant [[qp:nonos|la quête du nonos]], {pendant} un mot sur l’os du chien — jamais le chemin ; après, {apres} remarquent que le chien l’a retrouvé.',
  secret: [
    'Ce qu’elles rendent n’est jamais dit avant : il faut rendre le service. Chaque fiche dit le sien, et la suite (un secret par cadeau, un par jour, pour le chat, le crapaud, le corbeau, la renarde, la chèvre et le cheval).',
    'Pourquoi elles parlent : la hulotte dit qu’« autrefois, toutes les bêtes parlaient » ; l’Écornée a rencontré, sur les pierres où personne ne va, « quelqu’un, assis, qui regardait la vallée » ; Tiécelin imite la voix de l’homme mort qui l’a élevé ; Bayard a crié des mots la nuit du feu ; le crapaud a appris en écoutant le fond du puits ; la Vieille a appris la langue du comte qui lui confiait ses peurs.',
    'Les rumeurs des bêtes sont de petites vérités sur la vallée : l’église fermée de l’intérieur, la tombe sans nom fleurie chaque Vorndi, les treize pierres qu’on ne compte pas trois fois, la lumière qui ne tourne pas avec les étoiles, les cloches sous le lac… Aucune ne donne une solution.',
  ],
};
// ce qu’elles remarquent de vous (les autres remarques sont des secrets)
const REMARQUES = { crimes: 'vos crimes', recherche: 'une affiche « recherché » à votre visage', chienMort: 'la mort de votre chien', chienFaim: 'votre chien qui a faim', chien: 'votre chien', esprit: 'votre esprit, quand il va mal', vaisseau: 'le voyage à [[monde:vaisseau|la cité des Maisons-d’Étoile]]', chasse: 'la chasse', pieges: 'les pièges que vous posez', froid: 'le froid, quand vous montez sans manteau', peche: 'la pêche', cygne: 'un cygne abattu', cheval: 'un cheval à votre ferme' };
const SALUT = { matin: 'le matin', jour: 'le jour', soir: 'le soir', nuit: 'la nuit' };
// chaque bête : ce qu’on ne lit pas dans ses tables (son titre, l’endroit exact, comment la reconnaître…), et ce qui se cache
const FICHES_P = {
  chat: {
    titre: 'Tibert, le chat de l’auberge', court: 'Tibert, le chat de l’auberge', i: '🐈',
    ou: 'en ville, sur le tonneau à côté de la porte de [[li:auberge|l’auberge]]', carte: 'li:auberge',
    reconnaitre: 'un gros matou gris tigré, le plastron blanc, les yeux vairons (un bleu, un d’or), l’oreille gauche entaillée ; la nuit, ses yeux luisent',
    caractere: 'Un vieux matou de bonne maison : il vous vouvoie, parle comme un notaire, méprise un peu tout le monde, et ne dit jamais merci.',
    voix: 'un « mrrou » de vieux matou, roulé', fuite: 'il file', dort: 'sur le tonneau', gens: 'aubergiste',
    demande: 'Un **poisson frais**, cru : un vrai poisson, de cinq à soixante pièces — pas une ablette, ni un poisson de légende qu’on voudrait garder ; rien de grillé, de fumé, de séché ni de salé.',
    rend: 'Un **renseignement**. Si [[ent:tueur|le tueur caché parmi les habitants]] rôde, son **odeur** (selon son métier : ci-dessous) — jamais son nom. Sinon, [[li:sout_cave|la cave des Murés]], sous la rue entre la place et la porte du midi, et sa grille dans les douves, au pied de la tour : le lieu devient connu. Ensuite, un secret de la ville par poisson, un par jour.',
    secret: ['Ses secrets suivants (un par poisson) : la lettre au cachet noir que le maire n’a jamais ouverte, le vin de l’aubergiste, la poterne que quelqu’un graisse, le mot gratté au cachot.'],
  },
  hulotte: {
    titre: 'La hulotte du vieux chêne', court: 'la hulotte du vieux chêne', i: '🦉',
    ou: 'au [[li:chene|chêne millénaire]], sur un chicot au pied de l’arbre', carte: 'li:chene',
    reconnaitre: 'brune et ronde, l’œil gauche fermé par une cicatrice claire, une mèche blanche au front ; la nuit, son œil ouvert luit',
    caractere: 'Elle vous tutoie, parle peu et par énigmes, et répond rarement à la question qu’on lui pose. La nuit est à elle ; le jour, elle n’a rien à dire.',
    voix: '« hou… », puis un trémolo, très bas', fuite: 'elle s’envole, sans un bruit', gens: 'guerisseuse',
    demande: 'Rester près d’elle **deux heures de nuit, sans lumière** (la lanterne éteinte), sans s’éloigner.',
    rend: 'La [[it:plume_hulotte|plume de la hulotte]] : dans la sacoche, les nuits sont un peu plus calmes.',
    secret: ['Sa quatrième confidence montre le trou entre les racines du chêne : les Racines, sous la terre.'],
  },
  crapaud: {
    titre: 'Le crapaud du vieux puits', court: 'le crapaud du vieux puits', i: '🐸',
    ou: 'sur la margelle du [[li:vieux_puits|vieux puits]], au [[li:hameau_abandonne|hameau abandonné]]', carte: 'li:vieux_puits',
    reconnaitre: 'énorme, verruqueux, les yeux d’or, une pierre verte au front',
    caractere: 'Gourmand et triste, il vous tutoie, garde le vieux puits et compte les pièces qu’on y jette.',
    voix: 'deux coassements graves, rugueux', fuite: 'il saute dans le puits', gens: 'fillette',
    demande: '**Trois vers de terre**, des gros, de ceux qui sortent après la pluie.',
    rend: 'La [[it:crapaudine|crapaudine]], la pierre de son front : elle boit le venin (un empoisonnement passe trois fois plus vite). Ensuite, un secret par cadeau, un par jour.',
    secret: ['Sa quatrième confidence décrit l’Envers : « l’eau se referme au-dessus de toi, et tu respires ».', 'La pierre prise sur son cadavre n’est qu’une [[it:pierre_terne|pierre terne]] : elle n’a de vertu que donnée.'],
  },
  corbeau: {
    titre: 'Tiécelin, le corbeau de la Table des Géants', court: 'Tiécelin, le corbeau', i: '🐦‍⬛',
    ou: 'sur [[li:dolmen|la Table des Géants]], le dolmen de la lande', carte: 'li:dolmen',
    reconnaitre: 'une rémige blanche dans l’aile gauche, un bout de lanière de cuir à la patte ; il ne s’envole pas quand on approche',
    caractere: 'Un bavard et un voleur, qui vous tutoie : il prend tout ce qui brille, et revend ce qu’il sait.',
    voix: '« krrok », grave, parfois deux', fuite: 'il s’envole', gens: 'forgeron',
    demande: '**Quelque chose qui brille** : un trésor de cinq à cent pièces (une vieille pièce, un bijou, une médaille, une tabatière, une cuillère d’argent…) ; jamais un outil (ni la montre, ni le miroir de poche). Il prend ce qu’on tient en main, sinon le moins cher de la sacoche.',
    rend: 'Un **endroit caché** que l’on ne connaît pas encore, dans l’ordre : [[li:grotte_peinte|la grotte peinte]] (bois de bouleaux), [[li:grotte_contrebandiers|la grotte des contrebandiers]] (la forêt, à l’ouest du lac), [[li:grotte_cristaux|la grotte aux cristaux]], [[li:antre|l’antre de la Bête]] — avec sa direction depuis la Table, et « pas très loin », « à une bonne heure de marche » ou « loin ». Ensuite, un secret par objet brillant, un par jour.',
    secret: ['Sa quatrième confidence parle du trésor des Valmont : « les bornes regardent toutes le même endroit ».'],
  },
  renarde: {
    titre: 'Hermeline, la renarde du relais', court: 'Hermeline, la renarde', i: '🦊',
    ou: 'à la lisière, à une vingtaine de pas du [[li:relais_chasse|relais de chasse]] (loin de la cible)', carte: 'li:relais_chasse',
    reconnaitre: 'une renarde au museau gris, l’oreille droite fendue ; il manque deux doigts à sa patte de devant gauche, et elle boite',
    caractere: 'Elle vous tutoie, parle bas — les chasseurs boivent à côté — et ment comme elle respire : elle le dit elle-même.',
    voix: 'un jappement, puis un petit gémissement', fuite: 'elle file', gens: 'chasseur',
    demande: '**Un œuf de poule** — pas de cane.',
    rend: 'Où dort **une cache enterrée** (« à une centaine de pas vers le nord de la source aux rubans… prends une houe ») : l’une des caches à la houe de la vallée, la plus proche de la ferme qu’on n’a pas encore creusée. Ensuite, des secrets.',
    secret: [],
  },
  chevre: {
    titre: 'L’Écornée, la vieille chèvre de l’estive', court: 'l’Écornée, la vieille chèvre', i: '🐐',
    ou: 'à [[li:estive|l’estive]], près du [[li:estive_cairn|cairn à la sonnaille]]', carte: 'li:estive_cairn',
    reconnaitre: 'noire, les raies blanches de la face, le poil long, une corne cassée, une grosse sonnaille au collier de cuir rouge',
    caractere: 'Rude et moqueuse, elle vous tutoie et vous appelle « l’homme d’en bas » ; elle n’obéit qu’à elle-même.',
    voix: 'un bêlement fêlé, et la sonnaille', fuite: 'elle bondit', gens: 'estive_baile',
    demande: '**Deux poignées de sel** : le baïle en donne aux autres, pas à elle.',
    rend: 'Où est [[li:fente_nains|la falaise fendue]], au-dessus du col des Treize (l’entrée des halles des nains) : « appuie ton oreille contre la pierre ; si ça répond, frappe trois fois, et puis une ». Ensuite, des secrets de la montagne.',
    secret: [],
  },
  carpe: {
    titre: 'La Vieille, la carpe du ponton', court: 'la Vieille, la carpe du ponton', i: '🐟',
    ou: 'dans l’eau, au bout du [[li:ponton|ponton]] du pêcheur', carte: 'li:ponton',
    reconnaitre: 'énorme, bronze et or, de la mousse sur le dos, un anneau d’or à la lèvre, des barbillons',
    caractere: 'Très vieille et très lente, elle vous vouvoie et vous appelle « mon enfant ». Elle parle de l’eau, et de ce que l’eau a pris.',
    voix: 'des bulles, puis un « bloup » grave', fuite: 'elle plonge', gens: 'pecheur',
    demande: '**Promettre** de ne pas pêcher de carpe pendant **sept jours** (ni carpe, ni carpe miroir).',
    rend: 'Une **bague de noyée** (un bijou ancien, quatre-vingts pièces), posée sur les planches. Si l’on pêche une carpe avant, la promesse est rompue, et elle ne demande plus rien.',
    secret: ['Sa troisième confidence parle des bornes du comte de Valmont (« il comptait ses pas, toujours par quatre »), la quatrième de la cloche engloutie.'],
  },
  cheval: {
    titre: 'Bayard, le vieux cheval des Chabert', court: 'Bayard, le vieux cheval', i: '🐴',
    ou: 'dans le pré de [[{ferme}|la ferme brûlée des Chabert]], près de [[li:ferme|votre ferme]]', carte: '{ferme}',
    reconnaitre: 'grand, gris devenu presque blanc, les fanons épais, et toujours son collier de trait au cou',
    caractere: 'Lent et doux, il vous tutoie, sent sur vous la ferme d’à côté, et se souvient de tout.',
    voix: 'un hennissement grave et doux, l’ébrouement', fuite: 'il s’éloigne au trot', dort: 'debout', gens: 'eleveuse',
    demande: '**Trois pommes**, comme le vieux Chabert lui en donnait le dimanche.',
    rend: 'La cache de la grand-mère Chabert, sous **la pierre du foyer** de la ferme brûlée, au pied de la cheminée (E : « Soulever la pierre du foyer », une fois) : {argent} pièces, {vieilles} vieilles pièces, et la lettre de Mélanie Chabert, veuve, rangée dans les Lettres (ci-dessous). Ensuite, des souvenirs.',
    secret: ['Sa deuxième confidence : le feu de la ferme, et « quelqu’un au bout du champ, qui regardait ».', 'Il parle des fermiers d’avant vous, d’après les parties passées : « Celui d’avant toi… a tenu tant de jours, à ta ferme ».'],
  },
};
// les habitants qui parlent d’une bête (BP_RUMEURS) : à qui
const GENS_BETE = { aubergiste: 'chat', guerisseuse: 'hulotte', fillette: 'crapaud', forgeron: 'corbeau', chasseur: 'renarde', pecheur: 'carpe', eleveuse: 'cheval', estive_baile: 'chevre' };

// ================================================================ 3) les quêtes principales
const QP = {
  lead: 'Les quêtes principales sont **facultatives** : on peut ne jamais s’en occuper, et rien n’attend après elles ; elles n’ouvrent ni ne ferment rien d’autre. Chacune se lit dans la sacoche, onglet **Carnet**, en tête, et ce qu’elle a montré s’y revoit (bouton « Revoir »).',
  note: 'Les quêtes que demandent les habitants, à mesure qu’ils vous font confiance, sont à part : <a href="#/cat/quetes">les quêtes des habitants</a>.',
};
// le nonos du chien (agent Q)
const NONOS = {
  lead: 'Une quête principale, **facultative** : le chien de la ferme a perdu le vieil os qu’il traînait partout. Cinq lieux à retrouver, chacun montré par un souvenir, sans jamais le chemin ; au bout, le nonos. Rendu au chien, il a faim **deux fois moins vite**, pour toujours. On peut ne jamais s’en occuper : elle n’ouvre ni ne ferme rien d’autre.',
  debut: [
    'D’elle-même, **une seule fois par partie**, un matin (entre 6 h et 14 h), quand le chien est vivant, à la ferme depuis au moins deux jours (le premier chien : à partir du troisième jour) et pas affamé — s’il a maigri, il faut d’abord le nourrir.',
    'Ce matin-là, il cherche : il tourne en rond près de sa niche (ou du seuil de la maison, s’il n’a pas de niche), le nez dans l’herbe, gratte, gémit. Quand on s’approche de lui, une courte scène, puis le premier souvenir.',
    'Dans une partie déjà avancée (une sauvegarde d’avant la quête), elle commence au premier matin venu.',
  ],
  carnet: 'Au carnet de la sacoche (onglet **Carnet**), en tête, sous « {section} » : « {titre} ». Chaque souvenir vu y garde une phrase — l’allure du lieu, entre guillemets — et un bouton **Revoir**. Voir [[sys:savoir|la sacoche et le carnet]].',
  lieux: [
    '**Tirés au hasard au début de la quête**, d’autres à chaque partie, parmi les vrais repères de la vallée (ci-dessous).',
    '**Jamais** dans la ville ni dans un village habité, dans la montagne, dans l’eau, sous terre, dans un lieu caché, ni là où vit [[sys:betes-parlantes|une bête qui parle]].',
    '**Pas trop loin** : le premier {d1} de la ferme ; chacun {dn} du précédent, et à {sep} au moins des autres lieux de la chaîne ; tous à moins de {loin} de la ferme, et tous **joignables à pied** depuis la ferme (des pentes qu’on monte, des rivières qu’on passe à la nage).',
  ],
  souvenirs: [
    '**Quand** : le premier à la fin de la scène du début ; les quatre autres, deux secondes après chaque indice trouvé.',
    '**Ce qu’on voit** : le lieu suivant, comme une bête l’a vu en passant — à ras de l’herbe, la tête qui bouge un peu, l’image un peu passée, brunie, les bords sombres —, en deux plans : on s’en approche, puis on le regarde de près, d’en bas. Toujours dans la lumière de l’heure où la bête est passée (l’aube, ou le soir), quelle que soit l’heure qu’il est.',
    '**Jamais le chemin** : on y est d’emblée, après un noir — ni survol depuis l’endroit où l’on est, ni flèche, ni marque sur une carte, ni direction écrite.',
    '**Les mots** : dans le noir, une phrase (« {avant} ») ; puis l’allure du lieu (« Une croix de bois au croisement de deux chemins. »), puis un détail. Le carnet ne garde que l’allure.',
    'On peut passer chaque scène (**Espace**) : ce qu’elle fait a lieu quand même, et chaque souvenir se revoit au carnet.',
  ],
  surPlace: [
    'À chaque lieu, **un indice**, posé tout près (à quelques mètres, dans l’herbe, au pied du lieu), sur une terre ferme. Il faut le chercher un peu : il luit à peine quand on le regarde de près, et on le prend avec **E**.',
    '**Le chien aide** : s’il vous suit (« Au pied ! », ou le sifflet), il flaire l’indice dès que vous en êtes à une trentaine de mètres, court s’y planter, le nez dans l’herbe, la queue battante, et aboie de temps en temps.',
    'Au cinquième lieu, le nonos. Il passe dans la sacoche : [[it:nonos|le nonos du chien]], un objet de quête, qui ne se vend pas.',
  ],
  retour: [
    '**E sur le chien** : « Lui rendre son nonos » (en tête des choix) ; ou bien **il le reconnaît** : quand on revient près de lui (une quinzaine de mètres) avec le nonos dans la sacoche, il aboie, accourt, et la scène commence.',
    'Il le prend tout doucement, l’emporte à sa niche sans se retourner, se couche, l’os entre les pattes, et le mâchonne longtemps, les yeux mi-clos. Il reste ensuite à sa niche (« À la niche ! ») : on le rappelle au sifflet.',
  ],
  ronge: 'On le voit ronger son os devant sa niche (ou, s’il n’a pas de niche, sur la terre battue devant la porte de la maison) : quand on n’est pas là, quand on est à l’intérieur, et souvent quand on est à la ferme. Quand il vous suit, l’os reste là, par terre, à sa place.',
  mort: [
    '**Pendant la quête** : elle s’arrête, et les indices disparaissent. Le carnet : « {mort} » — les souvenirs déjà vus se revoient toujours.',
    '**Le nonos déjà retrouvé** reste dans la sacoche, comme un souvenir ; on peut le poser sur sa tombe (E sur le tertre, le nonos dans la sacoche : « Vous posez son os sur le tertre. »).',
    '**Après le retour** : l’os reste où il le rongeait, et va avec lui sous le tertre quand on l’enterre.',
    '**Le chiot adopté ensuite** n’hérite pas du nonos : ce n’était pas le sien. Montré au chiot, l’os ne l’intéresse pas, et il a faim comme un chien ordinaire. La quête ne recommence pas.',
  ],
  secret: [
    'Le voleur est **un vieux renard** au museau gris, une oreille déchirée — pas [[an:p_renarde|Hermeline]], la renarde qui parle. Les indices le disaient : des poils roux, un os de poulet, des empreintes étroites posées l’une devant l’autre (un renard marche ainsi, pas un chien), un ruban porté jusque-là. Le petit gant de laine devant le terrier n’est expliqué nulle part.',
    'Au cinquième lieu, **un terrier** creusé sous une motte de terre, des racines au-dessus du trou ; devant l’entrée, dans la terre battue, des choses volées : une cuillère, un grelot, un petit gant de laine — et le nonos. **E sur le terrier** : une scène — le terrier, le nonos rongé « par d’autres dents que les siennes », puis le vieux renard qui vous regarde le prendre, ne s’enfuit pas, et s’en va sans se presser. Si le chien est là, il flaire le terrier, puis fixe le renard en grondant.',
    '**La lumière d’un souvenir dit d’où l’on regarde** : à l’aube, le soleil bas vient de l’est (du côté du soleil levant, à l’opposé du grand lac) ; le soir, de l’ouest. Les Monts sont au nord.',
    '**Le chien sait** : qu’il vous suive, et il mène droit à l’indice dès qu’on en est à une trentaine de mètres.',
    '**Où chercher l’indice** : toujours à moins de vingt mètres du centre du lieu montré (le plus souvent à cinq ou dix), jamais dans l’eau, jamais sous un toit, jamais contre un tronc ni sous un buisson.',
  ],
};
// les sortes de lieux du nonos, par famille (les clés de NONOS_TYPES ; ce qui manque ici va dans « Et encore »)
const NONOS_GROUPES = [
  ['Les croix', ['calvaire', 'croix_peste', 'calvaire_trois', 'oratoire']],
  ['Les chapelles, les morts', ['chapelle_ruine', 'chapelle', 'tombe_isolee', 'cimetiere', 'lanterne_morts', 'gibet']],
  ['Les pierres', ['menhir', 'cromlech', 'pierre_cupules', 'dolmen_petit', 'pierre_branlante', 'borne_ancienne', 'menhirs', 'dolmen', 'cercle']],
  ['Le feu, la suie', ['loge_charbonnier', 'charbonniere', 'four_chaux']],
  ['Les bois', ['cabane_bucheron', 'cabane_perchee', 'affut', 'glaciere', 'maison_forestiere', 'fosse_loups']],
  ['Les ruines, les maisons vides', ['ferme_brulee', 'bergerie_ruine', 'borie', 'moulin_ruine', 'tour_ruine', 'hameau_abandonne', 'ruines', 'bergerie']],
  ['Les camps, les charrettes', ['camp_abandonne', 'campement', 'charrette_abandonnee', 'galerie_prospecteur']],
  ['L’eau', ['source_sacree', 'source', 'puits_perdu', 'lavoir', 'pont', 'ponton', 'ponton_ruine', 'barque_echouee', 'cabane_pecheur', 'phare']],
  ['Les arbres, les jardins', ['arbre_offrandes', 'chene', 'rucher', 'jardin_clos', 'pigeonnier']],
  ['Les moulins, les tours', ['moulin', 'tour']],
];
// les lieux-dits nommés (pas une sorte de lieu perdu) : leur nom
const NONOS_NOMS = { calvaire: 'les calvaires des carrefours', chapelle: 'la chapelle abandonnée', cimetiere: 'le cimetière', menhirs: 'les Demoiselles', dolmen: 'la Table des Géants', cercle: 'le cercle de pierres', charbonniere: 'la charbonnière', ruines: 'les ruines', hameau_abandonne: 'le hameau abandonné', bergerie: 'la bergerie des Combes', moulin: 'le vieux moulin', tour: 'la tour de guet', campement: 'les campements abandonnés', source: 'la source aux rubans', lavoir: 'le lavoir', pont: 'les ponts sur la rivière', ponton: 'le ponton', cabane_pecheur: 'la cabane du pêcheur', phare: 'le phare', chene: 'le chêne millénaire' };

// Les quêtes principales, dans l’ordre de la section. Chacune : son id (sa fiche « qp:<id> »), son titre, si elle est
// dans ce jeu (present), sa ligne dans la fiche d’ensemble (debut, ou, fin), ce qu’en dit la section (resume) et sa
// fiche (fiche(C) → { s, i, h, files }).
const QUETES = [
  {
    id: 'nonos', titre: 'Le nonos du chien', present: (X) => !!(X.ITEMS && X.ITEMS.nonos),
    debut: 'un matin, à partir du troisième jour : le chien cherche son vieil os', ou: 'cinq lieux tirés au hasard, à quelques centaines de mètres de la ferme', fin: 'le chien a faim deux fois moins vite, pour toujours',
    resume: 'le nonos du chien (cinq lieux tirés au hasard, cinq souvenirs, et le chien a faim deux fois moins vite)',
    fiche: ficheNonos,
  },
];

// ================================================================ ce qu’on lit dans la vallée générée (extract)
// La liste des trouvailles (w.ramasse), les endroits des bêtes qui parlent (w.betesP), et ce qui ne se lit qu’en
// faisant tourner le jeu : les textes du nonos où l’on dit le nom du chien, les repères qui peuvent servir à la quête.
function extract(G, w, DB) {
  const V = {}, log = (m) => DB.log.push('vague 13 : ' + m);
  const val = (expr, d) => { try { const s = G.run(`(() => { try { return JSON.stringify(${expr}); } catch (e) { return null; } })()`); return s ? JSON.parse(s) : d; } catch (e) { return d; } };
  // les trouvailles
  try {
    const R = w.ramasse;
    if (R && R.L && R.L.length) {
      const parSorte = {}, parMilieu = {};
      let dedans = 0;
      for (const t of R.L) { parSorte[t.k] = (parSorte[t.k] || 0) + 1; parMilieu[t.m] = (parMilieu[t.m] || 0) + 1; if (t.b) dedans++; }
      V.ramasse = { n: R.L.length, parSorte, parMilieu, dedans, cycle: val('typeof RAM_CYCLE !== "undefined" ? RAM_CYCLE : null', null) };
    }
  } catch (e) { log('trouvailles : ' + e.message); }
  // les endroits des bêtes qui parlent (et la ferme brûlée de Bayard)
  try {
    if (w.betesP) { V.betesP = {}; for (const k of Object.keys(w.betesP)) { const b = w.betesP[k]; V.betesP[k] = { x: Math.round(b.x), z: Math.round(b.z), ferme: b.ferme || null }; } }
  } catch (e) { log('bêtes qui parlent : ' + e.message); }
  V.betesQ = val('typeof BP_DIRE_AUX_GENS !== "undefined" ? BP_DIRE_AUX_GENS : null', null);
  // le nonos : les textes (le nom du chien : « {chien} »), les réglages, les repères qui peuvent servir
  V.nonos = val(`(() => {
    if (typeof NONOS_TXT === 'undefined') return null;
    const f = (x) => (typeof x === 'function' ? x('{chien}', '{jour}') : x);
    const txt = {}; for (const k of Object.keys(NONOS_TXT)) txt[k] = [].concat(NONOS_TXT[k]).map(f);
    const indices = typeof NONOS_INDICES !== 'undefined' ? NONOS_INDICES.map((i) => ({ id: i.id, court: i.court, texte: f(i.texte) })) : [];
    const carnet = {}; if (typeof NONOS_CARNET !== 'undefined') for (const k of Object.keys(NONOS_CARNET)) carnet[k] = f(NONOS_CARNET[k]);
    const regl = { n: typeof NONOS_N !== 'undefined' ? NONOS_N : 5, d1: typeof NONOS_D1 !== 'undefined' ? NONOS_D1 : null, dn: typeof NONOS_DN !== 'undefined' ? NONOS_DN : null, sep: typeof NONOS_SEP !== 'undefined' ? NONOS_SEP : null, loin: typeof NONOS_LOIN !== 'undefined' ? NONOS_LOIN : null };
    let cand = null;
    if (typeof nonosCandidats === 'function') {
      const C = nonosCandidats(__w), F = (__w.lm && __w.lm.ferme) || __w.spawn, R = regl.loin || 1150;
      cand = { n: C.length, proches: C.filter((c) => Math.hypot(c.x - F.x, c.z - F.z) < R).length };
    }
    return { txt, indices, carnet, regl, cand };
  })()`, null);
  DB.world.v13 = V;
}

// ================================================================ les fiches (build)
function build(X) {
  const { DB, T, SP, SEC, esc, lk, IL, FILL, quotes, npcLink, pages, used, nfmt, mapBtn, ITEMS } = X;
  const log = (m) => (DB.log || (DB.log = [])).push('wiki-v13.js : ' + m);
  const has = (id) => pages.has(id);
  const V = (DB.world && DB.world.v13) || {};
  const NAMES = X.NAMES || (DB.derived && DB.derived.names) || {};
  // ---- le texte : « ** » en gras, « [[id|texte]] » un lien vers une fiche (résolu à la fin, comme les autres)
  const md = (t) => String(t ?? '').split(/(\[\[[^\]]+\]\])/).map((s, i) => {
    if (i % 2) { const [id, tx] = s.slice(2, -2).split('|'); return has(id) ? lk(id, tx) : esc(tx ?? id); }
    return esc(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  }).join('');
  const ps = (t) => [].concat(t).flatMap((x) => String(x).split(/\n\n+/)).filter((x) => x.trim()).map((x) => `<p>${md(x)}</p>`).join('');
  const ul = (a) => (a && a.length ? `<ul>${a.map((x) => `<li>${md(x)}</li>`).join('')}</ul>` : '');
  const h3 = (t) => `<h3>${esc(t)}</h3>`;
  const h4 = (t) => `<h4>${esc(t)}</h4>`;
  const tbl = (head, rows) => `<table class="t"><tr>${head.map((x) => `<th>${esc(x)}</th>`).join('')}</tr>${rows.join('')}</table>`;
  const td = (a) => `<tr>${a.map((x) => `<td>${x}</td>`).join('')}</tr>`;
  const kv = (rows) => `<dl class="kv">${rows.filter(([, v]) => v).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${v}</dd>`).join('')}</dl>`;
  const book = (titre, texte, sig) => `<section class="bookpage">${titre ? `<h4>${esc(titre)}</h4>` : ''}<p>${FILL(texte)}</p>${sig ? `<p class="note">— ${esc(sig)}</p>` : ''}</section>`;
  const plur = (n, a, b) => `${nfmt(n)} ${n > 1 ? b : a}`;
  const cap = (s) => (s ? String(s)[0].toUpperCase() + String(s).slice(1) : '');
  const files = (re) => Object.keys(X.MF || {}).filter((f) => re.test(f));
  const sub = (t, o) => String(t).replace(/\{(\w+)\}/g, (m, k) => (o[k] !== undefined && o[k] !== null ? o[k] : m));
  const q = (a) => quotes([].concat(a ?? []).filter((x) => typeof x === 'string' && x.trim()));
  // (le nom du chien, le jour : des gabarits)
  const fc = (t) => esc(String(t ?? '')).replace(/\{chien\}/g, '<span class="ph" title="le nom de votre chien">‹le chien›</span>').replace(/\{jour\}/g, '<span class="ph">‹jour›</span>');
  const fcq = (a) => { const L = [].concat(a || []).filter((x) => typeof x === 'string' && x.trim()); return L.length ? `<ul class="qs">${L.map((t) => `<li>${fc(t.replace(/^\(([^()]*)\)$/, '$1'))}</li>`).join('')}</ul>` : ''; };
  const NOMBRES = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix'];
  // ---- les tables de la vague : leurs fiches sont ici (rien dans « Autres tables », rien en bas des fiches)
  const L = AGENTS.join('|'), VAGUE = new RegExp(`^(05-z+(${L})-|07-z+(${L})-|09-z+(${L})-|10-z+(${L})-|11-zzzz(${L})-|12-z+(${L})-)`);
  for (const [n, t] of Object.entries(DB.tables || {})) if (VAGUE.test(t.file || '')) used.add(n);

  // ================================================================ 1) les trouvailles
  const RS = T('RAM_SORTES', null);
  if (RS) {
    const RV = V.ramasse || null, REGL = T('RAM_REGL', {}), SAIS = T('RAM_SAISONS', {});
    const sortes = Object.keys(RS).filter((k) => RS[k] && RS[k].it);
    const rare = (k) => RAM_RARES.includes(k);
    const court = (k) => String(RS[k].lab || k).replace(/^(Ramasser|Prendre)\s+/, '');
    const nu = (k) => court(k).replace(/^(le |la |les |l’|l')/, '');
    const fruit = (S) => !!S.arbre;
    const arbre = (S) => { const nm = RAM_ARBRES[S.arbre] || S.arbre; return has('pl:' + S.arbre) ? lk('pl:' + S.arbre, nm) : esc(nm); };
    // où : les milieux d’une sorte, du plus au moins
    const ouDe = (S) => {
      if (fruit(S)) return `au pied des ${arbre(S)}`;
      const w = {};
      for (const [m, p] of Object.entries(S.ou || {})) { const g = RAM_MIL_COURT[m] || m; w[g] = (w[g] || 0) + p; }
      return esc(Object.entries(w).sort((a, b) => b[1] - a[1]).map(([g]) => g).join(', '));
    };
    const obtient = (S) => {
      const n = S.n || [1, 1], nb = n[0] === n[1] ? (n[0] > 1 ? ` <small>×${n[0]}</small>` : '') : ` <small>×${n[0]}–${n[1]}</small>`;
      if (S.it === 'argent') return 'un sou <small>(une pièce dans la bourse)</small>';
      return (ITEMS[S.it] ? IL(S.it) : esc(S.it)) + nb + (S.lire ? ' <small>(on la lit)</small>' : '') + (ITEMS[S.it] && ITEMS[S.it].open ? ' <small>(s’ouvre)</small>' : '');
    };
    const prix = (S) => (S.it === 'argent' ? '1' : ITEMS[S.it] ? nfmt(ITEMS[S.it].price || 0) : '—');
    const revient = (S) => (S.rev ? `${plur(S.rev, 'jour', 'jours')}${S.saison ? ', en saison' : ''}` : '—');
    const dans = (k) => (RV ? nfmt((RV.parSorte || {})[k] || 0) : '');
    const ligne = (k) => { const S = RS[k]; return td([`${esc(cap(court(k)))}${S.brille ? ' <small>(brille)</small>' : ''}`, obtient(S), prix(S), ouDe(S), revient(S), ...(RV ? [dans(k)] : [])]); };
    const head = ['À ramasser', 'Ce qu’on obtient', 'Prix', 'Où', 'Revient', ...(RV ? ['Dans la vallée'] : [])];
    // les familles
    const vus = new Set(RAM_RARES);
    let tables = '';
    for (const [titre, ks] of RAM_FAMILLES) {
      const ok = ks.filter((k) => RS[k] && !rare(k));
      ok.forEach((k) => vus.add(k));
      if (ok.length) tables += h4(titre) + tbl(head, ok.map(ligne));
    }
    const reste = sortes.filter((k) => !vus.has(k));
    if (reste.length) tables += h4('Et encore') + tbl(head, reste.map(ligne));
    const rares = RAM_RARES.filter((k) => RS[k]);
    const nPub = sortes.filter((k) => !rare(k)).length;
    let h = `<p class="lead">${md(TROUV.lead)}</p>`;
    if (RV) h += `<p class="note">Dans la vallée de ce wiki (graine ${esc(DB.meta && DB.meta.seed || '')}) : ${plur(RV.n, 'trouvaille', 'trouvailles')}, dont ${nfmt(RV.dedans || 0)} dans les maisons et les granges ; ${nfmt(Object.keys(RV.parSorte || {}).length)} sortes sur ${nfmt(sortes.length)}.</p>`;
    h += h3('Les voir') + ul(TROUV.voir.map((t) => sub(t, { eclat: nfmt(REGL.eclat || 9) })));
    h += h3('Les ramasser') + ul(TROUV.ramasser.map((t) => sub(t, { portee: nfmt(REGL.portee || 2.6) })));
    // ce qui revient
    const rev = sortes.filter((k) => RS[k].rev && !rare(k));
    if (rev.length) h += h3('Ce qui revient') + ps(TROUV.revient) + tbl(['Ce qui revient', 'Au bout de', 'Où'], rev.map((k) => td([esc(cap(court(k))), revient(RS[k]), ouDe(RS[k])])));
    // les saisons des fruits
    const SK = Object.keys(SAIS);
    if (SK.length) {
      const cycle = (RV && RV.cycle) || Math.max(...SK.flatMap((k) => SAIS[k].map((w) => w[1])));
      const ofr = (k) => sortes.find((s) => RS[s].saison === k);
      const jours = (W) => W.map(([a, b]) => (b - a > 1 ? `${a + 1} à ${b}` : `${a + 1}`)).join(', et ');
      const bande = (W) => { let s = ''; for (let d = 0; d < cycle; d++) { if (d && d % 12 === 0) s += ' '; s += W.some(([a, b]) => d >= a && d < b) ? '■' : '·'; } return `<code>${s}</code>`; };
      const j1 = SK.filter((k) => SAIS[k].some(([a, b]) => 0 >= a && 0 < b)).map((k) => { const s = ofr(k); return s ? nu(s) : k; });
      h += h3('Les saisons des fruits') + ps(sub(TROUV.saisons, { cycle: nfmt(cycle), cycle1: nfmt(cycle + 1) }));
      h += tbl(['Fruit', 'Tombe les jours du cycle', `Le cycle (${nfmt(cycle)} jours)`], SK.map((k) => { const s = ofr(k), S = s && RS[s]; return td([S ? `${IL(S.it)} <small>(${arbre(S)})</small>` : esc(k), esc(jours(SAIS[k])), bande(SAIS[k])]); }));
      if (j1.length) h += `<p class="note">Au premier jour d’une partie : ${esc(j1.join(' et '))}.</p>`;
    }
    // les milieux
    h += h3('Où l’on trouve quoi') + tbl(['Milieu', 'Où', 'Ce qu’on y trouve surtout', ...(RV ? ['Dans la vallée'] : [])], RAM_MIL.map(([keys, titre, ou]) => {
      let quoi;
      if (keys.includes('verger')) quoi = 'les fruits tombés, en saison';
      else {
        const w = {};
        for (const k of sortes) { if (rare(k)) continue; let p = 0; for (const m of keys) p += (RS[k].ou || {})[m] || 0; if (p > 0) w[k] = p; }
        quoi = Object.entries(w).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k]) => nu(k)).join(', ');
      }
      const n = RV ? keys.reduce((a, m) => a + ((RV.parMilieu || {})[m] || 0), 0) : 0;
      return td([`<b>${esc(titre)}</b>`, esc(sub(ou, { ville: NAMES.ville || 'la ville', hameau: NAMES.hameau || 'le hameau' })), esc(quoi), ...(RV ? [n ? nfmt(n) : '—'] : [])]);
    }));
    h += '<p class="note">Dans l’église, ce qu’on trouve est celui des croix et des chapelles ; à la forge et à la fromagerie, celui du fenil ; au relais de chasse, celui des campements.</p>';
    // les sortes
    h += h3(`Les ${nfmt(sortes.length)} sortes`) + `<p class="note">${plur(nPub, 'sorte', 'sortes')} ci-dessous${rares.length ? `, et ${NOMBRES[rares.length] || nfmt(rares.length)} raretés (masquées : secrets)` : ''}. « À ramasser » : ce que dit le réticule ; « Prix » : le prix de vente d’un objet ; « Revient » : au bout de combien de jours après qu’on l’a ramassée${RV ? ' ; « Dans la vallée » : combien il y en a dans celle de ce wiki' : ''}.</p>` + tables;
    // à quoi ça sert
    const nouveaux = new Set(RAM_NOUVEAUX.filter((i) => ITEMS[i]));
    const rec = T('RECIPES', []).filter((r) => r && r.need && Object.keys(r.need).some((k) => nouveaux.has(k)));
    const STN = { four: 'au four' };
    h += h3('À quoi ça sert') + ul(TROUV.servir.slice(0, 1));
    if (rec.length) h += `<p>Des recettes, à découvrir en assemblant, comme les autres :</p><ul>${rec.map((r) => `<li>${Object.entries(r.need).map(([k, n]) => IL(k, n > 1 ? n : undefined)).join(' et ')} → ${IL(r.out, r.n > 1 ? r.n : undefined)}${r.st ? ` <small>(${esc(STN[r.st] || r.st)})</small>` : ''}</li>`).join('')}</ul>`;
    h += ul(TROUV.servir.slice(1));
    h += h3('Ce que ça rapporte') + ul(TROUV.rapporte);
    h += `<p class="note">${md(sub(TROUV.liens, { nonos: nfmt(REGL.nonos || 25) }))}</p>`;
    // ce qui se cache
    let s = h3('Ce qui se cache');
    if (rares.length) s += h4('Les raretés') + tbl(head, rares.map(ligne));
    const LM = T('LOOT', {}).r_mulette;
    const sec = [...TROUV.secret];
    if (LM && LM.items) sec.unshift(`La **mulette**, ouverte : ${LM.items.map(([i, , , p]) => `${(ITEMS[i] ? ITEMS[i].name : i).toLowerCase()} (${p >= 0.1 ? Math.round(p * 100) : Math.round(p * 1000) / 10 || '<1'} %)`).join(', ').replace(/\.(\d)/g, ',$1')}${has('bt:r_mulette') ? ' — [[bt:r_mulette|ce qu’il y a dans une mulette]]' : ''}.`);
    const pens = sortes.filter((k) => RS[k].pense);
    if (pens.length) sec.push(`Trois pensées, la première fois seulement : ${pens.map((k) => `${court(k)} (« ${String(RS[k].pense).replace(/^\(|\)$/g, '')} »)`).join(' ; ')}.`);
    if (RV) sec.push(`Une vallée n’a pas forcément toutes les sortes : les plus rares manquent parfois (celle de ce wiki en a ${nfmt(Object.keys(RV.parSorte || {}).length)} sur ${nfmt(sortes.length)}).`);
    s += ul(sec);
    const LET = T('RAM_LETTRES', []);
    if (LET.length) s += h4(`Les lettres perdues (${NOMBRES[LET.length] || nfmt(LET.length)})`) + '<p class="note">Une lettre tirée au hasard pour chaque lettre posée dans la vallée ; ramassée, elle se lit, puis se relit en main.</p>' + LET.map((x) => book(x.titre, x.texte, x.sign)).join('');
    h += SEC(s);
    SP('sys:trouvailles', { t: 'Les trouvailles', s: `${RV ? 'Un millier de choses' : 'Des choses'} posées à la vue, un peu partout : E, et c’est dans la sacoche`, c: ['fouilles'], g: 'Ramasser et casser', i: '🍂', h }, files(/^(07-z+R-|11-zzzzR-)/));
    // la fiche de chaque objet : où on le trouve, à la vue
    const parObjet = {};
    for (const k of sortes) { const S = RS[k]; if (S.it === 'argent' || !has('it:' + S.it)) continue; (parObjet[S.it] || (parObjet[S.it] = [])).push(k); }
    for (const [it, ks] of Object.entries(parObjet)) {
      const p = pages.get('it:' + it);
      const L1 = ks.map((k) => { const S = RS[k]; const n = S.n || [1, 1]; return `« ${esc(cap(court(k)))} »${n[1] > 1 ? ` (${n[0] === n[1] ? n[0] : n[0] + ' à ' + n[1]} d’un coup)` : ''} : ${ouDe(S)}${S.rev ? ` ; revient au bout de ${plur(S.rev, 'jour', 'jours')}${S.saison ? ', en saison' : ''}` : ' ; une fois pour toutes'}${S.brille ? ' ; brille au soleil' : ''}.`; });
      const x = h3('À ramasser, à la vue') + `<p>${L1.join('<br>')}</p>`;
      p.h += ks.every(rare) ? SEC(x) : x;
    }
    // les objets nouveaux : la fiche d’ensemble
    for (const i of nouveaux) { const p = pages.get('it:' + i); if (p && !p.h.includes('sys%3Atrouvailles')) p.h += `<p>${lk('sys:trouvailles', 'Les trouvailles')}</p>`; }
    // le butin de la mulette : un nom lisible
    const bm = pages.get('bt:r_mulette');
    if (bm) { const old = esc(bm.t); bm.t = 'Ce qu’il y a dans une mulette'; for (const p of pages.values()) if (p.h && p.h.includes(old)) p.h = p.h.split(old).join(esc(bm.t)); }
    // ramasser et casser : un mot
    const pc = pages.get('sys:casser');
    if (pc) pc.h += h3('Ce qui traîne à la vue') + ps('Ce qui traîne à la vue, dehors et dans les maisons — un fer à cheval au bord du chemin, des pommes tombées, un sou sur les pavés —, se ramasse aussi d’un **E** : [[sys:trouvailles|les trouvailles]].');
  } else log('pas de table RAM_SORTES : pas de fiche « Les trouvailles »');

  // ================================================================ 2) les bêtes qui parlent
  const BB = T('BP_BETES', null), BT = T('BP_TEXTES', {}), BG = T('BP_GROUPES', {});
  if (BB) {
    const ordre = (T('BP_ORDRE', null) || Object.keys(BB)).filter((k) => BB[k]);
    const pid = (k) => 'an:' + (BB[k].kind || 'p_' + k);
    const F = (k) => FICHES_P[k] || {};
    const fermeC = V.betesP && V.betesP.cheval && V.betesP.cheval.ferme ? 'li:' + V.betesP.cheval.ferme : 'c2t:ferme_brulee';
    const lien = (t) => String(t || '').replace(/\{ferme\}/g, fermeC);
    const hh = (x) => { const H = Math.floor(x + 1e-9), m = Math.round((x - H) * 60); return `${H % 24} h${m ? ' ' + String(m).padStart(2, '0') : ''}`; };
    const plages = (P) => {
      const A = (P || []).map(([a, b]) => [a, b]);
      const i = A.findIndex(([, b]) => b >= 24), j = A.findIndex(([a]) => a <= 0);
      if (i >= 0 && j >= 0 && i !== j) { A[i] = [A[i][0], A[j][1]]; A.splice(j, 1); }
      return A.map(([a, b]) => `de ${hh(a)} à ${hh(b)}`).join(', et ');
    };
    const quand = (k) => {
      const B = BB[k], f = !!B.fem;
      let s = cap(plages(B.heures));
      if (B.pluie === 'aime') s += ', et le jour quand il pleut';
      const abs = [];
      if (B.pluie === 'fuit') abs.push('sous la grosse pluie');
      if (B.neige === 'fuit') abs.push('sous la neige');
      if (B.orage === 'fuit') abs.push('par l’orage');
      if (abs.length) s += ` ; ${f ? 'partie' : 'parti'} ${abs.join(', ')}`;
      if (B.dort) s += ` ; ${f ? 'elle' : 'il'} dort ${F(k).dort ? F(k).dort + ' ' : ''}${plages(B.dort)} (on ${f ? 'la' : 'le'} voit, ${f ? 'elle' : 'il'} ne parle pas)`;
      return s;
    };
    const nom = (k) => F(k).court || BB[k].qui || k;
    const L1 = (k, t) => (has(pid(k)) ? lk(pid(k), t ?? nom(k)) : esc(t ?? nom(k)));
    const PRO = (k) => (BB[k].fem ? 'Elle' : 'Il');
    const pendant = ordre.filter((k) => (BT[k] || {}).nonos), apres = ordre.filter((k) => (BT[k] || {}).nonosFini);
    // ce qu’elle demande, en mots (d’après la table) ; ce qu’elle rend : la fiche
    const demande = (k) => {
      const S = BB[k].service || {};
      if (S.objets) return S.objets.map(([id, n]) => (BG[id] ? esc(BG[id].nom) : ITEMS[id] ? IL(id, n > 1 ? n : undefined) : esc(id))).join(', ');
      if (S.veille) return `${NOMBRES[S.veille] || nfmt(S.veille)} heures de veille près d’elle, la nuit, sans lumière`;
      if (S.promesse) return `${NOMBRES[S.promesse] || nfmt(S.promesse)} jours sans pêcher de carpe`;
      return '';
    };
    const BMO = T('BP_MOTS', {});
    const NPCD = Object.fromEntries(T('NPC_DATA', []).map((d) => [d.id, d]));
    const metier = (g) => cap(NPCD[g] && NPCD[g].role ? NPCD[g].role : g.replace(/_/g, ' '));
    const argent = 42, vieilles = 2;
    // ---- tout ce qu’elle dit (secret)
    const dialogue = (k) => {
      const t = BT[k] || {}, B = BB[k], tu = !!B.tu, fem = !!B.fem, il = fem ? 'elle' : 'il', out = [];
      const add = (titre, html) => { if (html) out.push(h4(titre) + html); };
      add('La première fois', q([t.approche, t.intro]));
      add('Pour saluer', Object.entries(t.salut || {}).map(([m, A]) => `<p class="note">${esc(cap(SALUT[m] || m))} :</p>${q(A)}`).join(''));
      add('Après une longue absence', q(t.retour));
      add('Le temps qu’il fait, le jour de la semaine', q([...Object.values(t.meteo || {}), ...Object.values(t.jours || {})]));
      add('Après une nuit rouge', q(t.nuitRouge));
      add(`« ${tu ? BMO.qui || 'Qui es-tu ?' : BMO.quiVous || 'Qui êtes-vous ?'} »`, q(t.qui));
      add(`« ${tu ? BMO.pourquoi || 'Pourquoi parles-tu ?' : BMO.pourquoiVous || 'Pourquoi parlez-vous ?'} »`, q(t.pourquoi) + ((t.pourquoi || []).length > 1 ? `<p class="note">La seconde réponse vient plus tard, quand ${il} a confiance.</p>` : ''));
      if (t.sujet && (t.sujet.lignes || []).length) add(`« ${t.sujet.label} » (quatre confidences, une de plus chaque jour où l’on revient)`, `<ol class="qs">${t.sujet.lignes.map((x) => `<li>${FILL(x)}</li>`).join('')}</ol>`);
      add(`« ${BMO.rumeur || 'Qu’est-ce qu’on raconte ?'} » (deux par jour)`, q(t.rumeurs));
      if (t.question) add('Sa question', `<p>« ${FILL(t.question.texte)} »</p><ul>${(t.question.reponses || []).map((r) => `<li><b>${esc(r.label)}</b> — ${FILL(r.reaction)}${r.rappel ? `<br><small>Un autre jour : ${FILL(r.rappel)}</small>` : ''}</li>`).join('')}</ul>`);
      const S = t.service || {};
      if (Object.keys(S).length) {
        let x = q(S.demande);
        if (S.promettre) x += `<p class="note">« ${esc(S.promettre)} » :</p>${q(S.accepte)}<p class="note">« ${esc(S.refuser)} » :</p>${q(S.refus)}`;
        if (S.attente) x += `<p class="note">En attendant :</p>${q(S.attente)}`;
        if (S.lumiere) x += `<p class="note">Avec une lumière :</p>${q(S.lumiere)}`;
        if (S.rompu) x += `<p class="note">La promesse rompue :</p>${q(S.rompu)}`;
        if (S.merci) x += `<p class="note">Quand c’est fait :</p>${q(S.merci)}`;
        if ((S.cadeau || []).length) x += `<p class="note">Les fois suivantes (un cadeau par jour), ce qu’${il} dit avant un secret :</p>${q(S.cadeau)}`;
        add(`« ${S.label || 'Le service'} »`, x);
      }
      add('Ses secrets (un par cadeau, un par jour)', q(t.secrets));
      add(`Ce qu’${il} a remarqué`, q([...Object.values(t.remarques || {}), ...(k === 'cheval' ? [].concat(T('BP_VERSIONS', {}).cheval || []) : [])]));
      add(`« ${tu ? BMO.autres || 'Y en a-t-il d’autres, comme toi ?' : BMO.autresVous || 'Y en a-t-il d’autres, comme vous ?'} »`, Object.entries(t.autres || {}).map(([o, x]) => `<p class="note">${L1(o, cap(nom(o)))} :</p>${q(x)}`).join(''));
      add('Le nonos du chien', (t.nonos ? `<p class="note">Pendant la quête :</p>${q(t.nonos)}` : '') + (t.nonosFini ? `<p class="note">Après :</p>${q(t.nonosFini)}` : ''));
      add(fem ? 'Menacée, blessée, et quand une autre bête est morte' : 'Menacé, blessé, et quand une autre bête est morte', q([...[].concat(t.menace || []), t.blesse, t.peur, t.muet]));
      add(fem ? 'Endormie' : 'Endormi', q(t.dort));
      return out.join('');
    };
    // ---- une fiche par bête
    const RU = T('BP_RUMEURS', {}), INC = T('BP_INCREDULES', {});
    const QGENS = V.betesQ || 'Les bêtes, par ici… il y en a qui parlent ?';
    const lignes = [];
    for (const k of ordre) {
      const B = BB[k], t = BT[k] || {}, f = F(k), id = pid(k), fem = !!B.fem, il = fem ? 'elle' : 'il';
      if (!pages.has(id)) log('pas de fiche de créature pour ' + id + ' : elle est créée');
      const carte = lien(f.carte);
      let x = f.caractere ? `<p class="lead">${md(f.caractere)}</p>` : '';
      x += kv([
        ['Où', md(lien(f.ou || B.ou))],
        ['Quand', esc(quand(k))],
        [`À quoi on ${fem ? 'la' : 'le'} reconnaît`, esc(cap(f.reconnaitre || ''))],
        ['Sous le réticule', `« ${esc(B.lab0 || '')} »${B.lab && B.lab !== B.lab0 ? `, puis « ${esc(B.lab)} » quand on sait son nom` : ''}`],
        ['Sa voix', f.voix ? esc(cap(f.voix)) + ' : au début de chaque réplique, et, de loin, de temps en temps' : ''],
        [fem ? 'Menacée' : 'Menacé', f.fuite ? esc(cap(f.fuite)) : ''],
        [`${cap(il)} vous`, B.tu ? 'tutoie' : 'vouvoie'],
      ]);
      if (carte && has(carte)) x += `<p>${mapBtn(carte, 'Voir l’endroit sur la carte')}</p>`;
      if (t.approche) x += h3('La première fois') + q(t.approche);
      // de quoi elle parle
      const rq = Object.keys(t.remarques || {}).map((r) => REMARQUES[r]).filter(Boolean);
      const parle = [
        t.qui ? `**Qui ${il} est** : « ${t.qui} »` : '',
        `**Pourquoi ${il} parle** : ${il} vous le dira — et plus tard, quand ${il} aura confiance, la suite.`,
        t.sujet ? `**Son sujet** : « ${t.sujet.label} » — une confidence de plus chaque jour où l’on revient, quatre en tout.` : '',
        '**Ce qu’on raconte** : deux rumeurs par jour, obliques.',
        t.question ? `**Une question**, le deuxième jour où l’on se parle : « ${t.question.texte} » (trois réponses ; ${il} s’en souviendra).` : '',
        '**Un service**, et la pareille (masqué : secrets).',
        Object.keys(t.autres || {}).length ? `**Les autres** : ${il} sait où trouver ${Object.keys(t.autres).map((o) => `[[${pid(o)}|${nom(o)}]]`).join(' et ')}.` : '',
        rq.length ? `**Ce que vous avez fait** : ${rq.join(', ')} ; et le temps qu’il fait, le jour de la semaine, l’heure.` : '',
        t.nonos || t.nonosFini ? `**Le nonos du chien** ([[qp:nonos|la quête]]) : ${[t.nonos ? `pendant la quête, ${il} a un mot sur l’os (jamais le chemin)` : '', t.nonosFini ? (t.nonos ? `après, ${il} remarque que le chien l’a retrouvé` : `${il} remarque, après, que le chien l’a retrouvé`) : ''].filter(Boolean).join(' ; ')}.` : '',
      ].filter(Boolean);
      x += h3(`De quoi ${il} parle`) + ul(parle);
      if ((t.adieu || []).length) x += h3('Pour se quitter') + q(t.adieu);
      // ce qu’en disent les gens
      const gens = Object.keys(RU).filter((g) => GENS_BETE[g] === k || f.gens === g);
      if (gens.length) x += h3('Ce qu’en disent les gens') + gens.map((g) => `<h4>${npcLink(g)}</h4>${q(RU[g])}`).join('');
      // ce qui se cache
      let s = h3('Le service') + kv([[`Ce qu’${il} demande`, md(f.demande || demande(k))], [`Ce qu’${il} rend`, md(sub(f.rend || '', { argent: nfmt(argent), vieilles: NOMBRES[vieilles] || vieilles }))]]);
      if (k === 'chat') { const OD = T('BP_ODEURS', {}); if (Object.keys(OD).length) s += h4('L’odeur du tueur, selon son métier') + tbl(['Le métier', 'L’odeur'], Object.entries(OD).map(([g, o]) => td([esc(metier(g)), esc(o)]))); }
      if (k === 'cheval' && BMO.lettre) s += h4(BMO.lettreTitre || 'La lettre') + book('', BMO.lettre, BMO.lettreSigne);
      if ((f.secret || []).length) s += h3('Ce qui se cache') + ul(f.secret);
      s += h3(`Tout ce qu’${il} dit`) + dialogue(k);
      x += SEC(s, `Ce qu’${il} demande, ce qu’${il} rend, et tout ce qu’${il} dit, est masqué (secrets).`);
      x += `<p>${lk('sys:betes-parlantes', 'Les bêtes qui parlent')}</p>`;
      SP(id, { t: f.titre || cap(B.qui || k), s: cap(B.ou || ''), c: ['parlantes'], g: 'Les huit bêtes', h: x });
      if (f.i && !(pages.get(id) || {}).fig) pages.get(id).i = f.i;
      lignes.push([k, id]);
    }
    // ---- les fiches de leurs endroits : un mot
    for (const k of ordre) {
      const c = lien(F(k).carte), p = c && pages.get(c);
      if (!p || !has(pid(k))) continue;
      p.h += h3('Une bête qui parle') + `<p>${md(`${cap(lien(F(k).ou || BB[k].ou).replace(/\[\[[^|\]]+\|([^\]]+)\]\]/g, '$1'))}, ${quand(k).toLowerCase().split(' ; ')[0]} : [[${pid(k)}|${nom(k)}]].`)}</p>`;
    }
    // ---- les habitants qui en parlent
    for (const g of new Set([...Object.keys(RU), ...Object.keys(INC).filter((y) => y !== 'defaut')])) {
      const p = pages.get('pnj:' + g);
      if (!p) continue;
      const k = GENS_BETE[g];
      let x = '';
      if (RU[g]) x += (k && has(pid(k)) ? `<p>${md(`À propos de [[${pid(k)}|${nom(k)}]] :`)}</p>` : '') + q(RU[g]);
      if (INC[g]) x += `<p class="note">Si on lui demande « ${esc(QGENS)} » :</p>${q(INC[g])}`;
      if (x) p.h += h3('Les bêtes qui parlent') + x + `<p>${lk('sys:betes-parlantes', 'Les bêtes qui parlent')}</p>`;
    }
    // ---- leurs objets : ce sont des récompenses (secrets)
    for (const [it, k] of [['crapaudine', 'crapaud'], ['pierre_terne', 'crapaud'], ['plume_hulotte', 'hulotte']]) {
      const p = pages.get('it:' + it);
      if (!p) continue;
      p.x = 1;
      p.h += h3('D’où elle vient') + `<p>${md(it === 'pierre_terne' ? `Prise au front du [[${pid(k)}|crapaud]] mort : elle n’a de vertu que donnée (la vraie, c’est [[it:crapaudine|la crapaudine]]).` : `Ce que rend [[${pid(k)}|${nom(k)}]], quand on lui a rendu son service.`)}</p>`;
    }
    // ---- la fiche d’ensemble
    let h = `<p class="lead">${md(PARLANTES.lead)}</p>`;
    h += h3(`Les ${NOMBRES[lignes.length] || nfmt(lignes.length)}`) + tbl(['Bête', 'Où', 'Quand', 'À quoi on la reconnaît'], lignes.map(([k, id]) => td([`<b>${lk(id, F(k).titre || nom(k))}</b>`, md(lien(F(k).ou || BB[k].ou)), esc(quand(k)), esc(cap(F(k).reconnaitre || ''))])));
    h += '<p class="note">Elles ne ressemblent aux bêtes ordinaires que de loin : chacune a son détail, et se tient toujours au même endroit, à ses heures.</p>';
    h += h3('Leur parler') + ul(PARLANTES.parler) + ps(PARLANTES.salut);
    h += h3('On les entend avant de les voir') + ps(PARLANTES.entendre) + tbl(['Bête', 'Sa voix'], lignes.map(([k, id]) => td([lk(id, cap(nom(k))), esc(cap(F(k).voix || ''))])));
    h += h3('Le carnet') + ps(PARLANTES.carnet);
    // les gens
    h += h3('Les gens n’y croient pas') + ps(sub(PARLANTES.gens, { question: QGENS }));
    if ((INC.defaut || []).length) h += `<p class="note">La plupart :</p>${q(INC.defaut)}`;
    const incN = Object.keys(INC).filter((g) => g !== 'defaut' && has('pnj:' + g));
    if (incN.length) h += `<p class="note">Quelques-uns, autrement :</p><ul class="qs">${incN.map((g) => `<li><b>${npcLink(g)}</b> — ${FILL(String(INC[g]).replace(/^\(([^()]*)\)$/, '$1'), g)}</li>`).join('')}</ul>`;
    if ((BMO.temoins || []).length) h += `<p class="note">Qui passe pendant qu’on parle à une bête :</p>${q(BMO.temoins)}`;
    const ruN = Object.keys(RU).filter((g) => has('pnj:' + g));
    if (ruN.length) h += h3('Ce qu’on en dit') + `<p>Les gens en parlent, sans y croire ; chacun connaît sa bête.</p><ul class="qs">${ruN.map((g) => `<li>${FILL([].concat(RU[g])[0] || '', g)} <small>— ${npcLink(g)}${GENS_BETE[g] && has(pid(GENS_BETE[g])) ? `, à propos de ${lk(pid(GENS_BETE[g]), nom(GENS_BETE[g]))}` : ''}</small></li>`).join('')}</ul>`;
    h += h3('Les menacer, les blesser, les tuer') + ul(PARLANTES.menace);
    if (pendant.length || apres.length) h += h3('Le nonos du chien') + ps(sub(PARLANTES.nonos, { pendant: pendant.map((k) => `[[${pid(k)}|${cap(BB[k].nom || nom(k))}]]`).join(' et ') + (pendant.length > 1 ? ' ont' : ' a'), apres: NOMBRES[apres.length] ? `${NOMBRES[apres.length]} d’entre elles` : 'quelques-unes' }));
    // ce qui se cache
    let s = h3('Les services') + tbl(['Bête', 'Ce qu’elle demande', 'Ce qu’elle rend'], lignes.map(([k, id]) => td([lk(id, cap(nom(k))), md(F(k).demande || demande(k)), md(sub(F(k).rend || '', { argent: nfmt(argent), vieilles: NOMBRES[vieilles] || vieilles }))])));
    s += h3('Ce qui se cache') + ul([...PARLANTES.secret, ...lignes.flatMap(([k]) => (F(k).secret || []).map((x) => `${cap(nom(k))} — ${x}`))]);
    h += SEC(s, 'Ce qu’elles demandent, ce qu’elles rendent, et ce qui se cache, est masqué (secrets).');
    SP('sys:betes-parlantes', { t: 'Les bêtes qui parlent', s: `${cap(NOMBRES[lignes.length] || nfmt(lignes.length))} bêtes uniques, à leur endroit et à leurs heures, qui ne parlent qu’à vous`, c: ['parlantes'], i: '🗨', h }, files(/^(07-z+P-|11-zzzzP-)/));
  } else log('pas de table BP_BETES : pas de fiche « Les bêtes qui parlent »');

  // ================================================================ 3) les quêtes principales
  const C = { X, V, md, ps, ul, h3, h4, tbl, td, kv, plur, sub, fc, fcq, cap, has, files, log, NOMBRES };
  const faites = [];
  for (const Q of QUETES) {
    if (!Q.present(X)) continue;
    let F = null;
    try { F = Q.fiche(C); } catch (e) { log(`quête ${Q.id} : ${e && e.message}`); }
    if (!F) continue;
    SP('qp:' + Q.id, { t: Q.titre, s: F.s || 'Quête principale, facultative', c: ['principales'], g: 'Les quêtes', i: F.i || '✎', h: F.h }, F.files || []);
    faites.push(Q);
  }
  if (faites.length) {
    let h = `<p class="lead">${md(QP.lead)}</p>`;
    h += tbl(['Quête', 'Comment elle commence', 'Où', 'Au bout'], faites.map((Q) => td([`<b>${lk('qp:' + Q.id, Q.titre)}</b>`, md(Q.debut), md(Q.ou), md(Q.fin)])));
    h += `<p class="note">${QP.note}</p>`;
    SP('sys:quetes-principales', { t: 'Les quêtes principales', s: 'Facultatives : on peut ne jamais s’en occuper', c: ['principales'], i: '⚑', h });
  }
}

// ---------------------------------------------------------------- la fiche du nonos
function ficheNonos(C) {
  const { X, V, md, ps, ul, h3, h4, tbl, td, plur, sub, fc, fcq, cap, has, files } = C;
  const { T, SEC, esc, lk, pages, nfmt } = X;
  const N = V.nonos || {}, R = N.regl || {}, TX = N.txt || T('NONOS_TXT', {}), CA = N.carnet || T('NONOS_CARNET', {});
  const m = (a) => (Array.isArray(a) ? `entre ${nfmt(a[0])} et ${nfmt(a[1])} m` : '');
  const d1 = m(R.d1 || T('NONOS_D1', [110, 380])), dn = m(R.dn || T('NONOS_DN', [150, 430])), sep = `${nfmt(R.sep || 140)} m`, loin = `${nfmt(R.loin || 1150)} m`;
  const TY = T('NONOS_TYPES', {}), IND = (N.indices && N.indices.length ? N.indices : T('NONOS_INDICES', []));
  // le nom d’une sorte de lieu (et sa fiche, quand c’est une sorte de lieu perdu)
  const nomL = (k) => (has('c2t:' + k) ? lk('c2t:' + k, pages.get('c2t:' + k).t.replace(/^\S/, (c) => c.toLowerCase())) : esc(NONOS_NOMS[k] || k.replace(/_/g, ' ')));
  let h = `<p class="lead">${md(NONOS.lead)}</p>`;
  h += h3('Quand elle commence') + ul(NONOS.debut);
  if ((TX.debut || []).filter(Boolean).length) h += `<p class="note">La scène :</p>${fcq(TX.debut)}`;
  h += h3('Au carnet') + `<p>${md(sub(NONOS.carnet, { section: CA.section || 'Quête principale — facultative', titre: '\u0001' })).replace('\u0001', fc(CA.titre || 'Le nonos de {chien}'))}</p>`;
  if (CA.intro) h += fcq([CA.intro, CA.chercher].filter(Boolean));
  h += h3('Les cinq lieux') + ul(NONOS.lieux.map((t) => sub(t, { d1, dn, sep, loin })));
  // les sortes de lieux
  const vus = new Set(), rows = [];
  for (const [titre, ks] of NONOS_GROUPES) { const ok = ks.filter((k) => TY[k]); ok.forEach((k) => vus.add(k)); if (ok.length) rows.push(td([`<b>${esc(titre)}</b>`, ok.map(nomL).join(', ')])); }
  const reste = Object.keys(TY).filter((k) => !vus.has(k));
  if (reste.length) rows.push(td(['<b>Et encore</b>', reste.map(nomL).join(', ')]));
  if (rows.length) h += `<p class="note">${plur(Object.keys(TY).length, 'sorte', 'sortes')} de repères peuvent servir${N.cand ? ` ; dans la vallée de ce wiki, ${plur(N.cand.n, 'repère', 'repères')} en tout, dont ${nfmt(N.cand.proches)} à moins de ${loin} de la ferme` : ''}.</p>` + tbl(['', 'Les repères qui peuvent servir'], rows);
  h += h3('Les souvenirs') + ul(NONOS.souvenirs.map((t) => sub(t, { avant: (TX.avant || [])[0] || 'Une odeur de bête passe dans le vent. Une image vient avec elle.' })));
  h += h3('Sur place') + ul(NONOS.surPlace);
  h += h3('Le retour') + ul(NONOS.retour);
  if ((TX.retour || []).filter(Boolean).length) h += `<p class="note">La scène :</p>${fcq(TX.retour)}`;
  // ce qui change pour le chien : la faim, deux fois moins vite
  const SE = (DB_SEUILS(X) || {}), st = SE.chienStades || [48, 24, 8], mort = (SE.chienMort || [72])[0], CR = T('CHIEN_REPAS', {});
  const hj = (x) => (x % 24 === 0 && x >= 48 ? `${nfmt(x)} h (${['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit'][x / 24] || nfmt(x / 24)} jours)` : `${nfmt(x)} h`);
  const rowsF = [['Il a faim : il gémit, il réclame', st[2]], ['Il maigrit', st[1]], ['Il se couche et ne se relève plus', st[0]], ['Il meurt de faim', mort]].map(([t, x]) => td([esc(t), hj(x), `<b>${hj(x * 2)}</b>`]));
  const repas = [['viande', 'Un repas de viande crue'], ['patee', 'Une pâtée pour chien']].filter(([k]) => CR[k]).map(([k, t]) => td([`${esc(t)} le tient`, `${nfmt(CR[k])} h`, `<b>${nfmt(CR[k] * 2)} h</b>`]));
  h += h3('Ce qui change pour le chien') + `<p>Pour toujours, <b>il a faim deux fois moins vite</b> : un repas le tient deux fois plus longtemps, et chaque stade de la faim vient deux fois plus tard.</p>` + tbl(['Sans manger', 'Avant', 'Avec son nonos'], [...rowsF, ...repas]) + `<p class="note">Des heures de jeu, après la fin du dernier repas. Voir [[sys:chien|le chien]].</p>`.replace(/\[\[sys:chien\|le chien\]\]/, has('sys:chien') ? lk('sys:chien', 'le chien') : 'le chien');
  h += ps(NONOS.ronge);
  h += h3('Si le chien meurt') + ul(NONOS.mort.map((t) => sub(t, { mort: '\u0001' }))).replace('\u0001', fc(CA.mort || '{chien} n’est plus là pour le chercher. Les images, elles, sont restées.'));
  // les bêtes qui parlent
  const BT = T('BP_TEXTES', {}), BB = T('BP_BETES', {});
  const pid = (k) => 'an:' + ((BB[k] || {}).kind || 'p_' + k);
  const pendant = Object.keys(BT).filter((k) => BT[k].nonos), apres = Object.keys(BT).filter((k) => BT[k].nonosFini);
  const nomB = (k) => (FICHES_P[k] || {}).court || (BB[k] || {}).qui || k, nom1 = (k) => cap((BB[k] || {}).nom || nomB(k));
  if (pendant.length || apres.length) h += h3('Les bêtes qui parlent') + ps(`${pendant.length ? `Pendant la quête, ${pendant.map((k) => `[[${pid(k)}|${nom1(k)}]]`).join(' et ')} ${pendant.length > 1 ? 'ont' : 'a'} un mot sur l’os du chien — jamais le chemin. ` : ''}${apres.length ? `Après, ${C.NOMBRES[apres.length] || nfmt(apres.length)} ${apres.length > 1 ? 'bêtes qui parlent remarquent' : 'bête qui parle remarque'} que le chien l’a retrouvé.` : ''}`);
  // ce qui se cache
  let s = h3('Ce qui se cache') + ul(NONOS.secret);
  if (IND.length) s += h4('Les indices, dans l’ordre') + tbl(['', 'L’indice', 'Ce qu’on lit en le prenant'], IND.map((I, i) => td([nfmt(i + 1), esc(cap(I.court || I.id)), I.texte ? fc(String(I.texte).replace(/^\(|\)$/g, '')) : '<small>(une scène)</small>'])));
  if ((TX.terrier || []).filter(Boolean).length) s += h4('Le terrier') + fcq(TX.terrier);
  if ((TX.avant || []).length) s += h4('Dans le noir, avant chaque souvenir') + fcq(TX.avant);
  const ty = Object.keys(TY).filter((k) => (TY[k].ph || []).length);
  if (ty.length) s += h4('Ce que montrent les souvenirs') + '<p class="note">L’allure (ce que garde le carnet), puis le détail (seulement dans le souvenir) : de quoi reconnaître le lieu.</p>' + tbl(['Le lieu', 'L’allure', 'Le détail'], ty.flatMap((k) => TY[k].ph.map(([a, b], i) => td([i ? '' : nomL(k), `« ${esc(a)} »`, esc(b)]))));
  const dit = [...pendant.map((k) => [k, BT[k].nonos, 'pendant la quête']), ...apres.map((k) => [k, BT[k].nonosFini, 'après'])];
  if (dit.length) s += h4('Ce que disent les bêtes') + `<ul class="qs">${dit.map(([k, t, w]) => `<li><b>${has(pid(k)) ? lk(pid(k), cap(nomB(k))) : esc(cap(nomB(k)))}</b> <small>(${esc(w)})</small> — ${X.FILL(t)}</li>`).join('')}</ul>`;
  h += SEC(s, 'Le voleur, le dernier lieu, et de quoi reconnaître chaque souvenir : masqué (secrets).');
  // la fiche du chien, et celle du nonos, renvoient ici
  const pc = pages.get('sys:chien');
  if (pc) pc.h += h3('Le nonos') + `<p>${md('Une fois par partie, un matin, le chien cherche le vieil os qu’il traînait partout : [[qp:nonos|le nonos du chien]], une quête principale, facultative. Rendu, il a faim **deux fois moins vite**, pour toujours :')}</p>` + tbl(['Sans manger', 'Avant', 'Avec son nonos'], rowsF);
  const pn = pages.get('it:nonos');
  if (pn) pn.h += h3('La quête') + `<p>${md('On le retrouve au bout de [[qp:nonos|la quête du nonos]], au cinquième lieu ; rendu au chien, il a faim deux fois moins vite. Un objet de quête : il ne se vend pas.')}</p>`;
  return { s: 'Quête principale, facultative : cinq lieux, cinq souvenirs, et le chien a faim deux fois moins vite', i: '🦴', h, files: files(/^(11-zzzzQ-|12-z+Q-)/) };
}
// les seuils lus dans le code du jeu (la faim du chien)
function DB_SEUILS(X) { return X.DB && X.DB.derived && X.DB.derived.sys ? X.DB.derived.sys.seuils : null; }

// ================================================================ les sections (sections)
// Deux sections nouvelles, à leur place : « Quêtes principales » après « Quêtes » (les quêtes des habitants), « Les bêtes
// qui parlent » après « Bêtes » ; et les descriptions de « Fouiller, ramasser, casser » et des « Nouveautés ».
function sections(cats, X) {
  const { byCat, pages, link } = X;
  const at = (id) => cats.findIndex((c) => c.id === id);
  const has = (id) => pages.has(id);
  const ins = (c, apres) => { c.groups = c.groups.filter((g) => g.ids.length); if (!c.groups.length || at(c.id) >= 0) return; const i = apres.map(at).find((x) => x >= 0); cats.splice(i >= 0 ? i + 1 : cats.length, 0, c); };
  // les quêtes principales
  const QS = QUETES.filter((Q) => has('qp:' + Q.id)), qids = QS.map((Q) => 'qp:' + Q.id);
  ins({ id: 'principales', t: 'Quêtes principales', d: `Facultatives, à mener quand on veut : ${QS.map((Q) => Q.resume || Q.titre.replace(/^\S/, (c) => c.toLowerCase())).join(' ; ')}.`, nouveau: true,
    groups: [{ t: 'Les quêtes principales', ids: ['sys:quetes-principales'].filter(has) }, { t: 'Les quêtes', ids: qids }] }, ['quetes', 'habitants']);
  // les bêtes qui parlent
  const ord = Object.keys(FICHES_P).map((k) => 'an:p_' + k), rang = (i) => (ord.indexOf(i) + 1) || 99;
  const bp = byCat('parlantes').filter((i) => i !== 'sys:betes-parlantes').sort((a, b) => rang(a) - rang(b));
  ins({ id: 'parlantes', t: 'Les bêtes qui parlent', d: 'Huit bêtes uniques, chacune à son endroit et à ses heures, qui ne parlent qu’à vous : les reconnaître, leur parler, ce qu’elles se rappellent (et ce qu’elles rendent : secrets).', nouveau: true,
    groups: [{ t: 'Les bêtes qui parlent', ids: ['sys:betes-parlantes'].filter(has) }, { t: 'Les huit', ids: bp }] }, ['betes']);
  // les descriptions
  const f = cats[at('fouilles')];
  if (f && has('sys:trouvailles') && !/trouvailles/.test(f.d || '')) f.d = 'Les trouvailles posées à la vue, un peu partout ; ' + (f.d || '').replace(/^\S/, (c) => c.toLowerCase());
  const nv = cats[at('nouveautes')];
  if (nv && nv.d && !/bêtes qui parlent/.test(nv.d)) nv.d = nv.d.replace(' : ', ' : les bêtes qui parlent, les quêtes principales, les trouvailles posées à la vue, ');
  // la fiche des quêtes des habitants renvoie aux quêtes principales
  const cq = pages.get('cat:quetes');
  if (cq && has('sys:quetes-principales') && !cq.h.includes('sys%3Aquetes-principales')) cq.h = `<p class="note">À part, facultatives : ${link('sys:quetes-principales', 'les quêtes principales')}.</p>` + cq.h;
}

module.exports = { extract, build, sections, QUETES, TROUV, PARLANTES, NONOS };
