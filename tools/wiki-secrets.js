// ============================================================================
//  CE QUE LE JEU NE DIT NULLE PART EN CLAIR — pour le wiki (tools/wiki-build.js)
//  Les fiches du wiki sont lues dans le jeu lui-même ; restent quelques
//  solutions qui ne sont écrites dans aucune table, seulement dans la manière
//  dont le code réagit (un geste, une heure, un mot qu'on ne traduit jamais).
//  Elles sont rédigées ici, d'après ce code et les notes de ceux qui l'ont
//  écrit, et le wiki ne les montre que sous « révéler les secrets ».
//  Les chiffres qu'une table du jeu porte (heures du papillon d'or, prix, port
//  du carnet, circonstances du parler d'en bas…) ne sont pas recopiés ici : le
//  wiki les lit dans le jeu. Heures : heures de jeu ; la semaine a douze jours.
// ============================================================================
'use strict';

// ---------------------------------------------------------------- les lieux perdus : ce qui n'arrive qu'à son heure (par sorte de lieu)
const LIEUX = {
  pierre_branlante: '« Pousser » trois fois en moins de cinq secondes : elle bascule d’un cran et reste penchée, pour toujours ; dessous, un creux sec, et un trésor d’une seule fois.',
  jardin_clos: 'Le cadran solaire se lit au soleil (ni pluie, ni orage, ni brouillard, peu de nuages), entre 11 h 36 et 12 h 24 : l’ombre du style file jusqu’au pied du mur du nord, où une dalle est fendue. La cachette apparaît là ; il faut une pelle.',
  chapelle_ruine: 'La cloche fêlée, sonnée la nuit (23 h à 3 h 30) : une autre cloche répond au loin, une fois. La nuit du Vorndi, entre 2 h 30 et 4 h 30, les bougies de l’autel s’allument et elle sonne juste : sur la dalle, une médaille de saint Genès (une seule fois). Le linteau le dit à sa façon : « Elle sonnait toute seule. »',
  lanterne_morts: 'La nuit, avec une bougie, on allume la loge ; elle tient jusqu’au matin. Allumée une nuit du Vorndi, les flammes de la vallée se couchent un instant vers la montagne.',
  croix_peste: 'Les bougies à son pied s’allument le Vorndi à 17 h, jusqu’à 5 h.',
  cromlech: 'Des lueurs pâles au ras de l’herbe, les nuits du Nahédi (22 h à 4 h).',
  tombe_isolee: 'Chacune a son jour de la semaine : ce jour-là, dès 7 h, des fleurs fraîches. On ne voit jamais qui les apporte.',
  puits_perdu: 'Entre 23 h 48 et 0 h 24, tout au fond, quelqu’un dit votre prénom (une fois par nuit).',
  source_sacree: 'Boire : 8 points de vie, un peu de poison en moins, une fois par jour. Jeter une pièce. Prendre les pièces du bassin attire la malédiction « malchance » ; on la lève en rendant à la fontaine plus qu’on n’y a pris.',
  arbre_offrandes: 'On y noue ce qu’on a en main (pas un outil, ni un objet de quête) ; le lendemain matin, une fois sur deux environ, un petit présent pend à la place du nœud (bille, image pieuse, plume, vieille pièce, figurine, mèche de cheveux, boutons de nacre, tesson). Décrocher les offrandes des autres attire la « malchance ».',
  trou_souffleur: 'Il souffle le jour, il aspire la nuit ; le Veilledi, entre 22 h et 1 h, on croit entendre chanter, très loin ; une nuit noire, il se tait.',
  cairn_sommet: 'La boîte de fer et son registre : on peut y écrire son nom, et les vies d’avant y sont. Un registre sur quatre porte : « A. V., 1856. Je ne remonterai plus. Elle est en bas, sous la pierre aux trois croix. »',
  rucher: 'Sans enfumoir, les abeilles piquent quand on se sert.',
  rocher_marques: 'Ce sont les marques des familles de l’estive ; sous chacune, un mot du parler des hauts (FEA, NÈU, LOP, SAU, DRAC, AURA), qui s’inscrit au carnet comme un mot « vu taillé ».',
  calvaire_trois: 'Sous les trois croix, une cachette : la lettre d’É. (à la ferme brûlée) ou le bon registre du sommet la révèlent ; il faut une pelle. Dedans, un bijou et ce qu’Anselme Varenne gardait.',
  four_chaux: 'Au premier four à chaux, une fois lu le carnet du colporteur Morel : « Fouiller les cendres de la bouche du four » (sans pelle) — la montre de Morel.',
  borie: 'À la borie, une fois lue la lettre des sœurs Vignal : « Passer la main derrière la pierre percée » — la bague Vignal, et l’argent.',
  corps_gele: 'C’est Louis Varenne, le frère d’Anselme ; sa lettre gelée est dans sa poche.',
};

// ---------------------------------------------------------------- les histoires à recouper : le fin mot
const HISTOIRES = {
  morel: 'La tombe du colporteur (« trouvé sur ce chemin le 3 mars 1847 ») ; son carnet dans le sac du premier bivouac abandonné (« Doit V. : quarante francs… Dit qu’il paiera au four, là où personne ne passe ») ; le lire fait apparaître, au premier four à chaux, « Fouiller les cendres de la bouche du four » : la montre de Morel, arrêtée à six heures et quart.',
  vignal: 'La tombe des sœurs (« qui n’ont pas voulu descendre, hiver 1812 ») ; leur lettre dans la bergerie ruinée (« L’argent est où grand-père le mettait. Derrière la pierre qui a un trou, dans la cabane ronde ») ; la lire ouvre, à la borie, « Passer la main derrière la pierre percée » : la bague Vignal et l’argent.',
  trois_croix: 'Anselme Varenne : le linteau d’une chapelle (« Elle sonnait toute seule »), la pierre du calvaire aux trois croix (« A. V., 1856, Pardonne »), le dormeur de glace (Louis, le frère, et sa lettre gelée), la ferme brûlée (les lettres d’« É. » : « Mets ce que tu gardais pour nous deux sous les trois croix ») et le registre d’un cairn de sommet. La lettre d’É. ou le bon registre révèlent la cachette sous le calvaire (une pelle) : un bijou, et ce qu’il gardait. On le retrouve, lui, aux Enfers, près de la Porte.',
};

// ---------------------------------------------------------------- les deux peuples : ce qui ne se dit pas
const PEUPLES = {
  planches: [
    ['Où', 'La rive sud du lobe sud-ouest du grand lac ; on y descend du chemin du marais (au sud-est du lac) par une rampe de terre. L’écriteau, en haut : « SAINT-AUBIN », et dessous « On ne siffle pas ».'],
    ['La doyenne', 'Petite-fille d’Aimé Lacombe, le sacristain de 1791 : son secret, à haute amitié, dit qu’il est descendu sonner la cloche d’en bas.'],
    ['Le passeur', 'De 6 h 30 à 19 h 30, pas par l’orage, trois pièces (rien après sa quête, ou à l’amitié 5) ; vers le ponton du pêcheur ou le pied du phare (vingt minutes de jeu). Une fois qu’on l’a rencontré, « Appeler le passeur » au bout du ponton et au pied du phare le fait venir.'],
    ['Le Vorndi', 'Le feu de la grève brûle de 18 h à 23 h (les autres soirs 18 h 30 – 21 h 30) ; de 19 h 36 à 22 h 24, les trois sont au bout du quai ; de 20 h à 5 h, des chandelles dérivent sur le lac.'],
    ['La Dame', 'La nuit, une chandelle sur liège à la main, on peut en poser une sur l’eau, au pied du poteau : la Faveur de la Dame, pour vingt-quatre heures ; la chandelle dérive cette nuit-là.'],
    ['Siffler', 'Siffler près d’eux : un reproche, et moins d’amitié (une fois par jour et par personne). La nuit, sans personne autour, quelqu’un siffle en retour sur l’eau.'],
  ],
  estive: [
    ['Où', 'La haute cuvette de l’ouest, une trentaine de mètres au-dessus de la vallée ; la draille part du chemin de la hutte de l’ermite, vers l’ouest (une planche en flèche : « ESTIVE », une croix à potence dessous).'],
    ['Le baïle', 'Son frère Hippolyte s’est perdu en 1831 ; son secret parle d’une porte dans la roche. La sonnaille de la Noire est sur la crête, au nord-est au-dessus du camp (une sonnaille cabossée dans l’herbe).'],
    ['L’appel du soir', 'Vers 19 h 15, si le pâtre est là, un appel sur deux notes ; l’écho répond de l’autre versant.'],
    ['Le feu', 'Chaque soir de 19 h 12 à 21 h 48 ; le Veilledi jusqu’à 23 h 48, et ils chantent (de 20 h 24 à 23 h 30 ; à moins de 24 m du feu : un peu de paix de l’esprit, une fois, et trois mots au carnet).'],
    ['Le cairn à la sonnaille', 'Sur la butte au nord-ouest du camp : le tombeau vide d’Hippolyte. Faire sonner la sonnaille devant le baïle (à moins de 70 m) : −40 d’amitié, et il se fâche. La nuit, de 1 h 30 à 4 h, elle peut tinter toute seule quand on est près.'],
    ['Le plan d’en haut', 'Derrière la crête, à l’ouest, l’herbe grasse : une pierre sombre dressée contre la pente, comme une porte. La nuit du Veilledi (22 h à 1 h 30), derrière, une voix d’homme chante (« fea »). Le dire ensuite au baïle (« J’ai entendu chanter… ») : sa réponse, et +40 d’amitié.'],
  ],
};

// ---------------------------------------------------------------- le parler d'en bas : le jeu ne le traduit JAMAIS (ceci est le seul lexique)
const PARLER_BAS = {
  lum: 'lumière, feu (la flamme)', tsi: 'chut, silence', zyeu: 'les yeux', lui: 'la pierre qui luit', 'bô': 'bon, beau', nenn: 'non (nenni)', 'ouï': 'oui (et « entendre »)',
  ki: 'qui ?', nom: 'nom (un mot tabou)', san: 'sans', 'd’sû': 'dessus, la surface', 'd’sou': 'dessous, ici', va: 'va, pars', vyin: 'viens', pan: 'pain', 'sèl': 'sel', sou: 'sou, argent',
  manj: 'manger', 'frè': 'frère, un des nôtres', mo: 'mort', 'dôr': 'dormir, les dormeurs', gout: 'goutte, eau', 'hoûm': 'la bête des Gouffres', 'mûr': 'muré, le mur', 'grî': 'la grille',
  'koû': 'coup (frapper)', 'pèst': 'la peste', tojor: 'toujours', un: 'un', 'deû': 'deux', 'trè': 'trois', katr: 'quatre', sin: 'cinq', si: 'six', 'sè': 'sept', ui: 'huit', neu: 'neuf', di: 'dix', onz: 'onze',
};
// les dalles d'encoches du hameau, dites en français
const ENCOCHES = {
  e_onz: 'Onze murés ; pas de pain ; en dessous. (L’histoire en cinq mots.)', e_lum: 'La flamme, la mort ; la pierre qui luit, le bien.', e_mo: 'Les morts dorment sous la goutte.',
  e_houm: 'Le Hoûm entend : silence.', e_dsu: 'Là-haut, la peste ; là-haut, la mort.', e_tojor: 'Toujours onze.',
};

// ---------------------------------------------------------------- le Dessous : ce qui ne se dit pas
const DESSOUS = {
  entree: [
    ['Où', 'La grille rouillée de l’exutoire des douves, au pied de la tour, côté sud de Valbrume, à fleur d’eau (≈ 1576, 1648). Trois entailles sont taillées dans la pierre à côté : le signe de ceux d’en bas.'],
    ['Les indices', 'Le garde (une rumeur) : « on murait les malades dans les caves de la porte sud… Trois coups. Je n’ai jamais répondu. » La fillette (une rumeur) : la comptine « Trois coups sous le pont, sans chandelle et sans nom : la grille se lève, et l’on descend au fond. »'],
    ['Le geste', 'Frapper la grille (E) trois fois en moins de cinq secondes, la nuit (21 h à 5 h), sans lumière (lanterne éteinte, pierre luisante cachée). Deux secondes et demie après, trois coups répondent, puis la barre se lève : la grille reste ouverte pour toujours. De jour : rien. Avec une lumière : un bruit de métal, loin, et plus rien.'],
    ['Ensuite', 'E sur la grille ouverte : le conduit, puis la cave des Murés (sous la rue) — des os, un panier, des bougies, les traits gravés (« MDCXXXI. Murés céans par les échevins, pour la contagion. Nous étions onze. On nous passe le pain par la grille. » puis « Le pain ne vient plus. Nous descendons. »). Le puits (E) : les barreaux descendent au Seuil, cent vingt mètres plus bas. On remonte par les mêmes barreaux, puis le conduit ramène dans les douves.'],
  ],
  noir: [
    ['La lumière', 'La lanterne éclaire à 26 m sous terre, 42 m avec la lentille de cristal sur soi. La pierre luisante se charge au grand jour, dehors, à découvert (une minute au soleil la remplit : huit minutes de lumière verte, 8,5 m) ; ceux d’en bas la supportent.'],
    ['Les repères', 'Trois tas de pierres à trois entailles le long de la longue galerie, vers le hameau ; les flèches au charbon du géomètre, une tous les soixante-dix mètres, du hameau jusqu’au vieux puits de la mine, la pointe vers la mine ; et les siennes (charbon en main : clic pour tracer, clic droit pour effacer).'],
    ['L’aiguille dans la coquille', 'Du troc : clic, elle dit en mots où est le hameau (« droit devant vous », « un peu à gauche », « derrière vous »…). Dehors, elle tourne sans fin.'],
    ['Le bâton à encoches', 'Le don du vieux : clic, il dit la direction et la distance (« tout près », « pas loin », « loin », « très loin ») de la sortie la plus proche.'],
  ],
  gens: [
    ['Qui', 'Les descendants des onze Murés de 1631. Ils sont dix, et se nomment par des nombres. Onz, le onzième, est mort : c’était le géomètre ; sa cabane est vide. Leurs noms s’affichent quand on les a entendus (en disant leur nombre à l’un d’eux, ou en les entendant s’appeler).'],
    ['La flamme', 'Une lanterne allumée à moins de 26 m : ils crient (« Tsi ! Lum ! Lum ! »), se sauvent dans leur cabane et s’y cachent, les bras sur les yeux, tant que la flamme est là. Courir au hameau : « Tsi ! », une douzaine de secondes ; tirer, ou un grand bruit : une quarantaine. Frapper l’un d’eux : ils fuient deux minutes ; en tuer un : le hameau se tait pour toujours.'],
    ['Entrer', 'La pierre d’appel, à l’entrée ouest du hameau, dans le noir, marquée des trois entailles. La frapper trois fois (E), sans flamme. Le guetteur vient, vous touche le visage et demande « Ki ? … Nom ? ». Dire son nom : « Nom… d’sû. Va. » (refusé pour la journée). Ne rien dire : « … Bô. San nom. Bô. » (admis : « sans nom », comme dans la comptine). Dire « frè » ou « onz », si on les a entendus : admis aussi. Admis, tous viennent voir ; le vieux dit « Onz » : vous êtes le onzième. Sans ce rituel, ils vous regardent de loin, reculent, et répondent « Nenn ».'],
    ['Le troc', 'Chez la femme au pain, contre du pain (jamais de sous : « Sou ? Nenn. ») : deux pains, une pierre luisante ; un pain, des pieds-de-pierre grillés ; quatre pains, une perle ; trois pains et une magnétite, l’aiguille dans la coquille (une fois) ; un sel, deux pieds-de-pierre. Le pêcheur et la vieille, une fois par jour, sur « gout » ou « manj » : deux algues ou deux pieds-de-pierre. L’enfant, sur « lui » (une fois) : une mousse luisante.'],
    ['La pierre au pain', 'Y poser un pain (E, admis) : ils viennent, le rompent en onze ; une part reste sur la pierre, devant vous. C’est ce qui ouvre la mémoire du vieux.'],
    ['La peau pliée', 'Dire « onz » au vieux après avoir posé un pain sur la pierre : il déplie la liste des onze de 1631 (Jehan Mauduit, tisserand ; Perrine, sa femme ; Guillemette, leur fille ; Denis Crochard, tonnelier ; Michel Vaudrey, dit le Sourd ; Catherine Lebrun, veuve ; Pierre Gaudin, clerc, qui écrit ceci ; Marguerite Gaudin, sa sœur ; Jacquette, servante chez Lebrun ; Étienne Roux, compagnon ; Nicolas, onze ans, sans autre nom). Sous chaque nom, des encoches ; sous le dernier, elles s’arrêtent.'],
    ['« Pèst… d’sû ? »', 'Dire « pèst » au vieux : il demande si la peste est toujours là-haut (ils croient la surface morte). Répondre « nenn » : il se tait longtemps, puis donne le bâton à encoches (« Pèst nenn… D’sû. Va. ») ; « ouï » : « … Ouï. D’sû mo. Tojor. »'],
    ['Le guetteur ramène', 'Lui dire « d’sû » : « D’sû ? … Vyin. », puis « Le suivre » : on se retrouve au pied du puits du Seuil.'],
    ['La cabane vide', 'La huitième : sous la couche, le carnet du géomètre (1872) — descendu par le vieux puits sous l’éboulement de la mine, ses flèches au charbon, la lumière verte, « je me suis tu ; on m’a pris la main », le vieux qui compte jusqu’à onze et s’arrête sur lui, « Hoûm. Il ne faut pas courir », puis « d’sû bô ? onz dôr ».'],
    ['Le jeune', 'Di va du hameau à la Chambre des Gouttes par la longue galerie et la chatière (une demi-heure réelle aller-retour), une pierre verte à la main : on voit sa lueur de loin. Il s’arrête devant qui vient sans flamme ; devant la flamme, il se sauve. Le suivre mène aux morts, et au hameau.'],
    ['Profaner', 'Prendre une perle dans une vasque de la Chambre des Gouttes : le hameau le sait (« Gout… d’dôr ! », dit l’enfant) et ne parle plus, ne troque plus. La rendre : E sur la vasque vide, une perle en poche.'],
  ],
  gouttes: 'Par la chatière (un boyau bas, on s’y baisse) qui part de la longue galerie. Quinze morts couchés sous la goutte, la tête vers la paroi, de plus en plus pris dans la calcite ; le plus ancien n’est plus qu’une forme ; un petit ; le dernier porte des bottes : c’est le géomètre du carnet, le onzième. Deux vasques à perles.',
  houm: [
    ['Où', 'Une grande bête pâle, sans yeux, aux oreilles de peau ; elle rôde aux Gouffres, à la Salle des Échos et dans la galerie entre les deux, jamais au hameau. On l’entend souffler (« hoûm ») et marcher.'],
    ['Le bruit', 'Elle chasse au bruit : courir (entendu à 29 m environ), tirer (72 m), casser la roche à la pioche (31 m), retomber d’un saut (19 m), marcher debout (8 m). Elle court à l’endroit du bruit, renifle, repart.'],
    ['Survivre', 'Tout près, elle prend qui bouge : 28 points de vie, et un choc qui projette ; puis elle s’éloigne un moment. Accroupi et immobile, on la laisse passer : elle contourne en reniflant. La lumière ne la gêne pas.'],
    ['La tuer', '140 points de vie ; elle ne revient pas ; elle laisse une dent du Hoûm.'],
  ],
  tombeau: [
    ['Où', 'Dans la Ville engloutie (≈ 1262, 2330), à une place tirée au sort dans la salle : fermé d’une dalle taillée d’un œil. Sur la façade, en Hautes Lettres : « La porte des Aëlim. À l’œil, la lumière : elle s’ouvre. »'],
    ['L’ouvrir', 'E sur la dalle, la lanterne allumée et une lentille de cristal sur soi : la lentille ramasse la flamme en un point, le point entre dans l’œil, et la dalle descend dans le sol, pour toujours. Sans lentille : la lumière s’étale, et l’œil reste noir. La lentille : deux cristaux de roche (les Cristallières) et un lingot d’argent (trois galènes des Vieilles Mines et un charbon, au four), à l’établi.'],
    ['Lire les pierres', 'Les pierres de la Ville engloutie entrent dans l’onglet Langues comme les autres : une fois relevées, le bibliothécaire en donne un mot à la fois, et les mots connus s’y lisent ; c’est le chemin le plus sûr vers « À l’œil, la lumière ».'],
    ['Dedans', 'Un coffre (le miroir des Aëlim et deux lingots d’argent), des os, et une tablette gravée : « Les Aëlim sont tombés, les hommes se sont tus ; la lumière est gardée sous la pierre. »'],
  ],
  retours: [
    ['Le vieux puits de la mine', 'Aux Vieilles Mines (≈ 1541, 1206), des barreaux montent dans une cheminée : on sort dans la salle de l’éboulement des Galeries (le labyrinthe de la mine) en poussant la pierre qui bouchait le trou. D’en haut, avant cela, la pierre ne bouge pas ; ensuite, le trou mène en bas. C’est par là qu’était descendu le géomètre : ses flèches mènent au hameau.'],
    ['Les racines du grand chêne', 'Salle des Racines (≈ 1760, 2374) : une échelle de racines, sous la cheminée où tombe un peu de jour ; on sort au pied du grand chêne, près d’un enchevêtrement de racines qui cache un trou. D’en haut, ce trou ne laisse passer qu’une fois qu’on en est sorti.'],
    ['Le guetteur', 'Il ramène au pied du puits du Seuil (voir ceux d’en bas).'],
  ],
};

// ---------------------------------------------------------------- la nature : ce qui ne se dit pas
const NATURE = {
  papillon: 'Il fuit qui s’approche à moins de 3,8 m debout, 7 m en courant, 1,9 m accroupi ; il file alors plus haut et plus loin, et à la cinquième frayeur il s’en va pour de bon. Il part aussi à la nuit tombante, ou s’il pleut. Il paraît à 14-30 m du joueur, à découvert, vers 0,8 m du sol ; il luit un peu (au crépuscule, on le voit encore), danse autour d’un point qui dérive et se pose parfois sur une fleur (deux à six secondes). Le prendre : filet en main, clic, à 2,7 m au plus, dans l’axe du regard ; réussite 92 % s’il est posé, 72 % accroupi, 45 % debout — un coup manqué lui fait peur. Le mieux : attendre qu’il se pose, s’accroupir, avancer doucement, frapper. Il se vend 2 000 pièces à la caisse d’expédition ; personne n’en vend.',
  egarement: 'L’herbe d’égarement (légendaire ; forêts, combes, bois de bouleaux ; une herbe comme les autres, à faire nommer) : qui marche dessus (à moins de 75 cm, une fois par jour et par touffe) est pris, trois à huit secondes plus tard, d’égarement pendant une minute à deux minutes et demie : la vue tourne doucement, toujours du même côté, on marche en rond sans s’en apercevoir, on entend chuchoter. La manger fait pareil (95 %), le datura aussi (70 %, avec des hallucinations). L’alchimiste l’achète.',
  mousse: 'La mousse pousse au nord des arbres (côté −z) : de quoi s’orienter sans boussole.',
  plaies: 'Sur une plaie qui saigne (clic, même le ventre plein) : le plantain réduit le saignement des deux tiers ; l’achillée, la barbe-de-vieillard et la sphaigne l’arrêtent. La grande consoude, mangée, remet une jambe cassée (comme une attelle). Salicaire, trèfle d’eau et bouillon-blanc chassent la fièvre et les coliques.',
  amanite: 'L’amanite phalloïde est bonne au goût ; le mal vient trois à cinq minutes plus tard, quand on se croit sauvé.',
};

// ---------------------------------------------------------------- le carnet de commandes : ce qu'aucune table ne dit
const COMMANDES = [
  ['Le voiturier', 'Chaque jour son heure, tirée de la graine et du jour. Il vient du côté de la ville, par les routes (les sentiers lui coûtent), d’un point pris à 100-170 m de chemin du lieu de livraison, jamais sous le nez du joueur ; il arrête le cheval à cinq mètres au moins, porte le colis à pied, le pose, remonte, fait demi-tour sur place et repart par où il est venu. Le chien de la ferme aboie à son arrivée.'],
  ['Colis ouvert', 'Seulement quand personne n’a vu la livraison. On a pris 30 à 80 % d’une ligne (jamais tout, sauf un colis d’un seul article) ; une fois sur trois, et toujours si le colis serait vide, on y a laissé quelque chose. Le menu dit seulement « La ficelle a été coupée. »'],
  ['Colis égaré', 'Pas de colis ; une lettre du « Roulage Bardin » (deux versions, dont l’une : le cheval arrêté au calvaire, le colis disparu du plateau), la marchandise remboursée, le port gardé.'],
  ['Vendeur mort', 'Mort, arrêté, ou qui apprend vos crimes entre la commande et l’aube : le prix de ses articles revient dans le colis, en pièces, sans un mot. Un objet unique qu’on a eu entre-temps revient de même en pièces.'],
  ['Carnet égaré', 'S’il n’est plus nulle part (sacoche, coffres, maisons, charrette, meubles posés, greffe), un carnet neuf attend au matin dans le coffre de la ferme.'],
];

module.exports = { LIEUX, HISTOIRES, PEUPLES, PARLER_BAS, ENCOCHES, DESSOUS, NATURE, COMMANDES };
