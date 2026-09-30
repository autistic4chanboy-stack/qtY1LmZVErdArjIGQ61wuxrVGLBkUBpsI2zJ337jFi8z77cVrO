// ============================================================================
//  LES LIVRES : ceux qu'on achète au marchand (bestiaire, herbier, poissons,
//  sciences, manuels de fabrication) et ceux de la grande bibliothèque, qu'on
//  emprunte (chroniques, archives, lexiques des langues perdues, traités,
//  atlas, secrets). Un livre s'ouvre en main (clic) ; certains enseignent des
//  recettes ou des mots, d'autres révèlent un lieu (sans jamais le montrer
//  exactement) ou une vérité.
//  pages : tableau de { titre, texte } ou fonction (pages calculées à la lecture)
// ============================================================================
const LIVRES = {
  // ------------------------------------------------------------ vendus par les marchands
  bestiaire: { titre: 'Bestiaire de la vallée', auteur: 'par un naturaliste de passage', prix: 90, col: '#6a4a2a', gen: 'bestiaire',
    desc: 'Toutes les bêtes de la vallée, de la plus commune à la plus rare : où elles vivent, ce qu’elles craignent, ce qu’il faut craindre d’elles.' },
  herbier: { titre: 'Herbier de la vallée', auteur: 'planches et notices', prix: 90, col: '#3a6a3a', gen: 'herbier',
    desc: 'Toutes les plantes et tous les arbres de la vallée, avec leurs milieux et leurs dangers. Pour être sûr de ce qu’on a cueilli, il faut toujours montrer la plante à un alchimiste.' },
  poissons: { titre: 'Poissons des eaux douces', auteur: 'par Émile Rivière, pêcheur', prix: 70, col: '#2a5a7a', gen: 'poissons',
    desc: 'Tous les poissons des eaux de la vallée : dans quelles eaux, à quelle heure, et combien ils sont rares.' },
  sciences: { titre: 'Précis des sciences de base', auteur: 'à l’usage des écoles de canton', prix: 60, col: '#7a2a2a',
    desc: 'Le temps, le corps, la matière, les essences, les astres, les mécaniques. De quoi comprendre un peu le monde, ou s’en donner l’impression.',
    pages: [
      { titre: 'Avertissement', texte: 'Ce petit livre ne dit pas tout. Il dit ce que tout le monde devrait savoir, et que personne ne sait. Lisez-le dans l’ordre, ou dans le désordre : la science n’est pas pressée.' },
      { titre: 'I. Le temps', texte: 'La semaine compte douze jours : Primedi, Ferdi, Marchedi, Lavedi, Nahédi, Chassedi, Pêchedi, Orédi, Foiredi, Veilledi, Chômedi et Vorndi. Chacun a ses habitudes : le marché le Marchedi, la chasse le Chassedi (prudence en forêt), la messe l’Orédi, le jour des morts le Vorndi.\n\nUne journée passe vite : le soleil se lève vers six heures et se couche vers vingt heures et demie.\n\nLe ciel prévient : des nuages qui se figent annoncent la pluie ; un ciel trop clair et trop chaud, l’orage sec. Il peut neiger partout, même dans les prés du bas, quand le froid descend des Monts. Les tornades sont rarissimes ; si le ciel devient vert et que le vent tourne en rond, cherchez une cave.' },
      { titre: 'II. Le corps', texte: 'On ne meurt pas toujours d’un coup. Une chute de plus de quatre mètres fait mal ; de plus de six, elle casse une jambe ; de plus de dix, elle tue. Une jambe cassée se soigne avec une attelle, du repos, ou le baume de moelle des alchimistes : sans cela, on boite trois jours.\n\nUne plaie ouverte saigne : le sang s’en va peu à peu. Un bandage l’arrête ; la potion de givre aussi. Le venin tue lentement : l’antidote le chasse. Le froid tue la nuit, en montagne, sans feu ni toit. La faim tue en quelques jours.\n\nOn ne gravit pas une pente trop raide : il faut chercher un sentier, des lacets, une échelle.' },
      { titre: 'III. La matière', texte: 'Le minerai se fond au four avec du charbon : trois pierres de minerai et un charbon donnent un lingot. Deux lingots de fer et trois charbons donnent l’acier.\n\nTout objet fabriqué est l’assemblage de ses parties : un manche de bois, une tête de pierre, une ficelle de fibre font une hache. Qui comprend de quoi une chose est faite peut la refaire. Qui essaie au hasard découvre parfois ce que personne n’a noté.' },
      { titre: 'IV. Les essences', texte: 'Les alchimistes enseignent que chaque chose porte en elle des essences cachées : la Vie, la Mort, le Feu, le Froid, l’Eau, la Terre, l’Air, l’Ombre, la Lumière, l’Esprit, le Sang et la Fortune.\n\nQuatre paires s’annulent : la Vie et la Mort, le Feu et le Froid, la Lumière et l’Ombre, la Terre et l’Air. Quand on mêle des ingrédients, leurs essences s’additionnent, les contraires se mangent, et ce qui domine décide du résultat. Une essence seule qui l’emporte donne une potion simple ; deux essences fortes ensemble donnent une potion plus rare.\n\nQuelques exemples connus de tous : le miel tient de la Vie ; la plume, de l’Air ; le croc, du Sang ; le venin, de la Mort ; la rosée, de l’Eau ; le trèfle, de la Fortune. Pour le reste, il faut essayer, noter, recommencer. C’est pour cela que les alchimistes ont de si gros carnets.' },
      { titre: 'V. Les astres', texte: 'Certaines nuits sont noires : ni lune, ni étoiles, et les lanternes semblent éclairer moins loin. Les anciens disaient qu’on y entend murmurer. Restez chez vous.\n\nCertains jours, le soleil brille trop fort. Ne le regardez pas en face : l’œil se brûle, et une tache noire y reste longtemps. La potion de soleil protège et soigne.\n\nLes étoiles filantes laissent parfois une poussière qui brille encore au matin.' },
      { titre: 'VI. Les mécaniques', texte: 'Un cheval tire dix fois ce que porte un homme : attelé à une charrette, il emporte un coffre entier de récoltes.\n\nUn piège à loup se tend à la main, s’arme au sol, et se referme sur la première patte qui passe. Il ne choisit pas : ni le loup, ni le chien, ni vous.\n\nLe fusil de chasse porte loin et juste ; la lunette rapproche la cible (bouton droit). Une cartouche, un coup. Le bruit fait fuir toute la forêt, et un chasseur qui entend tirer tire parfois lui aussi, sur ce qui bouge.' },
    ] },
  // ------------------------------------------------------------ manuels (enseignent des recettes)
  manuel_menuisier: { titre: 'Manuel du menuisier', auteur: 'Compagnons du Devoir', prix: 120, col: '#8a6a3a', recettes: ['banc', 'table', 'chaise', 'tonneau', 'coffre', 'caisse_expedition', 'niche', 'brouette', 'mangeoire', 'nichoir', 'portillon', 'plancher', 'panneau'],
    desc: 'Assemblages, tenons et mortaises : de quoi meubler une ferme entière.' },
  manuel_forgeron: { titre: 'L’art du forgeron', auteur: 'Maître Jacquemin', prix: 160, col: '#4a4a52', recettes: ['hache_cuivre', 'pioche_cuivre', 'hache_fer', 'pioche_fer', 'hache_acier', 'pioche_acier', 'faux', 'cisailles', 'seau', 'lanterne', 'arrosoir', 'lingot_acier', 'piege_loup'],
    desc: 'Le feu, le fer, le marteau. Et comment ne pas y laisser ses doigts.' },
  manuel_chasse: { titre: 'Traité de la chasse et des pièges', auteur: 'par un vieux garde-chasse', prix: 130, col: '#5a3a20', recettes: ['arc', 'fleche', 'piege', 'piege_loup', 'cartouche', 'lunette', 'fusil', 'bandage', 'appeau'],
    desc: 'Pister, attendre, tirer. Et surtout : ne jamais tirer sur ce qu’on n’a pas vu.' },
  manuel_cuisine: { titre: 'Les recettes de la mère Aubert', auteur: 'Boulangerie Aubert', prix: 50, col: '#c08040', recettes: ['pain', 'tarte', 'soupe', 'ragout', 'confiture', 'fromage', 'viande_grillee', 'poisson_grille', 'infusion', 'chataignes_grillees'],
    desc: 'Tout ce qui se mange, et comment faire pour que ça se mange bien.' },
  manuel_jardin: { titre: 'Le jardin d’agrément', auteur: 'par un paysagiste de la ville', prix: 90, col: '#4a8a4a', recettes: ['pot_fleurs', 'parterre', 'arche_fleurie', 'allee', 'dalle', 'haie', 'cloture_pierre', 'statue', 'lampadaire', 'lanterne_sol', 'girouette', 'puits_deco', 'citrouille_sculptee'],
    desc: 'Une ferme n’est pas qu’un champ : il y faut des fleurs, des allées, de la lumière.' },
  manuel_charron: { titre: 'Charronnage et attelages', auteur: 'Maison Brossard, charrons', prix: 140, col: '#6a5030', recettes: ['roue', 'charrette', 'harnais', 'selle', 'attelle', 'corde'],
    desc: 'Roues, essieux, brancards et harnais : tout pour atteler un cheval.' },
  // ------------------------------------------------------------ la grande bibliothèque (s'empruntent)
  chroniques: { titre: 'Chroniques de la vallée', auteur: 'recueillies par les moines de Montrevel', biblio: true, col: '#5a3a3a',
    pages: [
      { titre: 'Avant les villes', texte: 'Avant les villes, il y avait les Gorr, qui dressaient des pierres, et avant les Gorr il y avait les Aëlim, qui en taillaient. Les moines n’en savent rien de plus que ce que disent les pierres elles-mêmes, et les pierres parlent peu.' },
      { titre: 'Le siège', texte: 'Valbrume fut assiégée trois fois. La troisième, on creusa les douves à la hâte et l’on releva les ponts pour la première fois. Les assiégeants partirent une nuit sans lune, sans que personne ne sût pourquoi. Au matin, leurs feux étaient encore chauds.' },
      { titre: 'Les disparus', texte: 'Chaque génération a ses disparus. Les registres de la commune en tiennent le compte, avec une précision que les moines trouvent inquiétante.' },
    ] },
  archives: { titre: 'Archives de la commune (copie)', auteur: 'Mairie de Valbrume', biblio: true, col: '#4a4a3a', secret: 'archives',
    pages: [
      { titre: 'Registre, 1791', texte: 'Cette année-là, un fermier de la vieille ferme a signé un bail avec « ceux d’en dessous ». L’acte est au dossier. Il ne porte pas de signature de l’autre partie, mais une empreinte de main, à l’ocre.' },
      { titre: 'Registre, 1854', texte: 'Treize habitants sont montés au col pour chercher un enfant. Douze sont redescendus. Le treizième figure encore au recensement, chaque année, sans que personne ne se souvienne de l’avoir recensé.' },
      { titre: 'Une note au crayon', texte: 'Les nains ne sont pas une légende. Le grand-père Morel a commercé avec eux ; il allait au nord-est de la Combe Perdue, là où la falaise a une fente en forme de serrure. Il n’a jamais voulu dire comment on entre. « Il faut frapper comme eux », disait-il.' },
    ] },
  // (lexiques : une tranche de l'ordre mêlé de la partie, voir livres.motsLexique ; aucun ne donne toute la langue)
  lexique_aelin: { titre: 'Des langues d’avant : l’aëlin', auteur: 'Frère Anselme de Montrevel', biblio: true, col: '#3a4a6a', langue: 'aelin', mots: 20 },
  lexique_aelin2: { titre: 'Glossaire des Hautes Lettres', auteur: 'anonyme', biblio: true, col: '#2a3a5a', langue: 'aelin', mots: 40, depuis: 12, grand: true },
  lexique_gorrain: { titre: 'Les pierres qui parlent : le gorrain', auteur: 'Docteur Lefèvre, antiquaire', biblio: true, col: '#6a5a3a', langue: 'gorrain', mots: 15 },
  lexique_gorrain2: { titre: 'Vocabulaire des géants', auteur: 'recueilli au péril de sa vie', biblio: true, col: '#5a4a2a', langue: 'gorrain', mots: 30, depuis: 9, grand: true },
  les_trois: { titre: 'Les Trois', auteur: 'fragment aëlim traduit', biblio: true, col: '#6a6a8a', secret: 'trois',
    pages: [
      { titre: 'Aëla', texte: 'Aëla est l’Aube. Elle se lève avant le soleil et c’est elle qui lui dit de venir. Elle guérit ce qui peut l’être. Elle ne se montre qu’à qui a veillé toute une nuit sans lumière et sans peur, et encore : une fois dans une vie.' },
      { titre: 'Durn', texte: 'Durn est la Pierre, le Dormeur. Il dort sous la montagne, et la montagne est son lit. Quand il se retourne, la terre tremble. Il n’aime pas qu’on le réveille, mais il respecte ceux qui trouvent son seuil.' },
      { titre: 'Vesh', texte: 'Vesh est la Nuit noire. Les nuits sans lune ni étoiles sont son souffle ; les murmures sont sa voix. Il offre, et ce qu’il offre se paie toujours. Il ne faut pas répondre quand il appelle. Il faut encore moins lui dire son nom.' },
    ] },
  temple_montagne: { titre: 'Du temple sous la montagne', auteur: 'Frère Anselme de Montrevel', biblio: true, col: '#3a3a3a', secret: 'temple',
    pages: [
      { titre: 'Ce qu’on raconte', texte: 'Les Aëlim auraient creusé, sous la montagne du nord, un temple plus grand que la ville, pour y faire dormir Durn. On y entrerait par l’eau : là où la rivière naît de la montagne, sous les Monts, derrière ce qui tombe.' },
      { titre: 'Ce qu’on n’ose pas écrire', texte: 'La porte ne s’ouvre qu’à qui sait la lire. Un fragment parle de trois pierres qu’on « appelle », et d’un ordre, que le copiste a laissé en blanc ; la marge dit seulement : « comme le jour les amène ». Je n’y suis pas allé. Je suis trop vieux, ou trop sage.' },
    ] },
  maledictions: { titre: 'Traité des malédictions', auteur: 'par une guérisseuse de l’ancien temps', biblio: true, col: '#4a2a4a', secret: 'maledictions',
    pages: [
      { titre: 'Comment on attrape une malédiction', texte: 'En tuant un cygne de la Dame ou le Cerf blanc. En pillant une tombe. En volant dans un temple. En brisant une pierre dressée. En gardant un livre qui ne vous appartient pas. En buvant ce qu’il ne fallait pas boire. En répondant, la nuit noire, à ce qui vous appelle par votre nom.' },
      { titre: 'Ce qu’elles font', texte: 'La malchance : les pièges restent vides, les poissons ne mordent plus. La faim qui ne passe pas. Les bêtes qui vous fuient. Le sommeil sans repos. Les récoltes qui pourrissent. Le poids : on marche comme dans l’eau. La pire de toutes : l’ombre qui vous suit, et qui un jour vous rattrape.' },
      { titre: 'Comment on s’en défait', texte: 'L’eau lustrale lave les petites. Le curé en ôte certaines, en échange d’une confession sincère et d’une offrande. La guérisseuse en ôte d’autres, en échange de ce qu’elle voudra. Les plus lourdes ne partent qu’en réparant la faute, ou en s’en remettant à l’un des Trois.' },
    ] },
  geants: { titre: 'Les géants et la Table', auteur: 'Docteur Lefèvre, antiquaire', biblio: true, col: '#5a5a4a', secret: 'geants',
    pages: [
      { titre: 'La Table des Géants', texte: 'Le dolmen du plateau n’est pas une tombe, mais une table. Les géants y mangeaient, disent les gens du plateau, et y mangent encore certaines nuits.' },
      { titre: 'Ce que j’ai vu', texte: 'J’en ai vu un, une fois, marcher sur les crêtes de l’est, à l’aube, grand comme trois maisons. Il ne m’a pas vu, ou il m’a laissé vivre. Ils parlent le gorrain, lentement. Ils ne sont pas méchants. Ils ne font pas attention à ce qui est petit, c’est tout.' },
    ] },
  peuple_bas: { titre: 'Le peuple d’en bas', auteur: 'contes recueillis à Clairpré', biblio: true, col: '#4a3a2a', secret: 'nains',
    pages: [
      { titre: 'Les petits hommes', texte: 'Ils sont petits, larges, barbus, et ils vivent sous la montagne depuis que les Aëlim leur ont confié le temple. Ils commercent parfois avec les hommes, en échange de pain, de miel et de laine. Ils ont horreur du soleil et des menteurs.' },
      { titre: 'Pour les trouver', texte: 'Au bord de la Combe, où la falaise est fendue. Qui ne sait pas frapper reste dehors. Les vieux de Clairpré disent qu’ils frappent en trois temps, et que celui du milieu n’a qu’un coup ; pour les deux autres, chacun raconte le sien.' },
    ] },
  contes: { titre: 'Contes de la veillée', auteur: 'recueillis par l’instituteur', biblio: true, col: '#7a5a3a',
    pages: [
      { titre: 'Le fermier et la Nuit', texte: 'Il était un fermier qui répondit, une nuit noire, à la voix qui l’appelait. On lui donna tout ce qu’il voulut : la pluie à point, le blé haut, l’or dans le puits. Le jour où il voulut rendre, il n’y avait plus personne à qui rendre. On dit qu’il cherche encore.' },
      { titre: 'L’enfant et le géant', texte: 'Une petite fille perdue dans la neige fut ramenée au village, un matin, endormie dans une main grande comme une charrette. Personne ne la crut. Au printemps, on trouva dans le pré des empreintes de pieds longues comme des barques.' },
      { titre: 'Le libraire', texte: 'Il ne faut jamais rendre un livre en retard à la grande bibliothèque. Tout le monde sait ça. Personne ne sait pourquoi. Ceux qui savaient ne sont plus là pour le dire.' },
    ] },
  memoires_chasseur: { titre: 'Mémoires d’un chasseur', auteur: 'Auguste Delorme', biblio: true, col: '#5a4a2a', recettes: ['appeau', 'piege_loup'],
    pages: [
      { titre: 'L’ours', texte: 'L’ours ne vous veut rien. Il veut son miel, ses baies, ses petits. Si vous tombez entre lui et l’un des trois, faites-vous grand, parlez-lui, reculez. Ne courez pas. Ne tirez que si vous êtes sûr de tuer : un ours blessé ne s’arrête plus.' },
      { titre: 'Les jours de chasse', texte: 'Le Chassedi, les bois sont pleins de fusils. Portez du rouge, faites du bruit, restez sur les chemins. J’ai vu un homme tomber parce qu’il marchait accroupi dans les fougères. On l’avait pris pour un chevreuil.' },
    ] },
  almanach_nuits: { titre: 'Almanach des nuits noires', auteur: 'anonyme', biblio: true, col: '#1a1a2a',
    pages: [
      { titre: 'Les nuits noires', texte: 'Elles reviennent sans règle, une ou deux fois par mois. On les sent venir : les chiens se taisent au crépuscule, les chandelles fument. Il faut fermer les volets, garder une lumière, et ne pas écouter.\n\nCe qui murmure ne peut pas entrer. Ce qui murmure peut appeler. Si vous répondez, vous lui avez ouvert.' },
    ] },
  atlas_ancien: { titre: 'Atlas ancien (feuillets)', auteur: 'cartographe inconnu', biblio: true, col: '#6a5a3a', carte: 'ancien',
    pages: [{ titre: 'Feuillets de cartes', texte: 'Des feuillets jaunis, dessinés à la main, où les montagnes sont des pointes et les forêts des petits arbres. Rien n’est à sa place exacte. Tout est à peu près là.' }] },
};
// objets « livre »
for (const id in LIVRES) {
  const L = LIVRES[id];
  defItem('livre_' + id, L.titre, 'livre', L.prix ? Math.round(L.prix / 2) /* revendu moitié prix */ : (L.biblio ? 0 : 40), ['livre', L.col || '#6a2a24'], { book: id, desc: (L.desc || (L.biblio ? 'Un livre de la grande bibliothèque. Il faudra le rendre à temps.' : '')) + (L.biblio ? '' : '') });
  if (L.biblio) ITEMS['livre_' + id].biblio = true;
}
ITEM_CAT_NAMES.livre = 'Livres';
// ce que vendent les marchands (colporteurs, bibliothèque, boutiques)
const LIVRES_MARCHANDS = ['bestiaire', 'herbier', 'poissons', 'sciences'];
const LIVRES_MANUELS = ['manuel_menuisier', 'manuel_forgeron', 'manuel_chasse', 'manuel_cuisine', 'manuel_jardin', 'manuel_charron'];
