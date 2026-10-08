// Le wiki — LA DOUZIÈME VAGUE : la voix de chaque milieu (ses oiseaux, ses bruits, sa pluie), la musique (quarante-deux
// morceaux, de temps en temps, selon le lieu), dix plantes et dix bêtes de plus par milieu, le hasard de la vallée
// (soixante et un événements), la pierre ronde et la cité des Maisons-d’Étoile (un seul voyage, l’Atelier des corps).
// Rédigé d’après les modules src/09-zzzzS-*, 09-zzzzM-*, 12-zzzzM-musique, *D1-*, *D2-*, *E1-*, *E2-*, *E3-*, 11-zzzzF-*,
// *G-* (et les notes de leurs auteurs). tools/wiki-build.js appelle build() avec ses outils : les fiches se font ici, les
// tables du jeu fournissent ce qui se compte (les morceaux, les espèces, les raretés, les prix, les textes de la cité) ;
// « ** » met en gras, « [[id|texte]] » fait un lien vers une fiche ; ce qui se cache va sous « révéler les secrets ».
'use strict';

// ---------------------------------------------------------------- la musique
// les groupes, dans l’ordre : [groupe, titre, précision, fiche]
const MUS_GROUPES = [
  ['pres', 'Les prés et la ferme', 'de jour', 'mil:pres'],
  ['foret', 'La forêt et le bois de bouleaux', 'de jour', 'mil:foret'],
  ['eau', 'Le marais et le bord du lac', 'de jour ; le marais, c’est autour de ses mares, dans le bas-fond', 'mil:berges'],
  ['lande', 'La lande et les hauteurs', 'de jour', 'mil:lande'],
  ['village', 'La ville et le hameau', 'de jour ; les abords du hameau comptent comme la ville', 'mil:ville'],
  ['nuit', 'La nuit', 'de 21 h à 5 h, partout dans la vallée', ''],
  ['dessous', 'Le Dessous', 'et tout ce qui est sous terre', 'sys:dessous'],
  ['bonbons', 'Le pays des bonbons', '', 'monde:bonbons'],
  ['tenebres', 'Les Ténèbres', '', 'monde:tenebres'],
  ['enfers', 'Les Enfers', '', 'monde:enfers'],
  ['vaisseau', 'La cité des Maisons-d’Étoile', 'de l’autre côté de la pierre ronde', 'monde:vaisseau'],
];
const MUS_INST = { piano: 'piano', harpe: 'harpe', celesta: 'célesta', boite: 'boîte à musique', cloche: 'cloche', cordes: 'cordes', flute: 'flûte', verre: 'verre', nappe: 'nappes', orgue: 'orgue' };
const MUS_SALLE = { chambre: 'chambre', salle: 'salle', cathedrale: 'grande nef', grotte: 'grotte' };
// les morceaux qui ne sont ni des compositions originales ni des œuvres signées
const MUS_AUTEUR = { bonbons_clair: 'air populaire français du XVIIIᵉ siècle, arrangé' };
const MUSIQUE = {
  lead: 'De temps en temps, jamais tout le temps : un morceau doux — du piano surtout, parfois la harpe, la flûte, le célesta, les cordes, le verre, la boîte à musique, l’orgue ou une cloche —, puis de longues minutes de silence. Le morceau dépend de l’endroit où l’on est quand il commence.',
  choix: 'Le morceau est choisi dans le groupe de l’endroit où l’on se trouve quand il commence, sans redite : tous les morceaux d’un groupe passent avant qu’un revienne, et jamais deux fois de suite le même. La nuit (de 21 h à 5 h), partout dans la vallée, c’est le groupe de la nuit ; sous terre, celui du Dessous ; dans un autre monde, celui de ce monde. Rien ne joue dans le cauchemar.',
  comment: [
    'Tout est synthétisé dans le navigateur, sans aucun fichier audio. Le piano est calculé note par note (une fois, en tâche de fond) : des partiels un peu plus hauts que les harmoniques (des cordes raides), le marteau qui frappe au huitième de la corde, deux ou trois cordes par note, un rien désaccordées, qui battent, un son qui s’éteint en deux temps (vite, puis très lentement), le feutre qui assombrit les nuances douces, les étouffoirs et la pédale. La harpe, le célesta, la boîte à musique, la cloche et les cordes sont calculés de la même façon ; la flûte, le verre, l’orgue et les nappes sont joués en direct.',
    'L’exécution est « humaine » : les phrases respirent, la mélodie est un rien en avance sur l’accompagnement, les accords sont légèrement égrenés, le tempo bouge à peine. Chaque morceau a sa salle (une chambre, une salle, une grande nef, une grotte), avec sa réverbération, calculée elle aussi.',
    'Les morceaux sans compositeur sont des compositions originales. Les œuvres du domaine public sont arrangées fidèlement (les notes de la partition, la forme ; seules les nuances sont adoucies) : Erik Satie (1866-1925), Frédéric Chopin (1810-1849), Jean-Sébastien Bach (1685-1750) ; « Au clair de la lune » est un air populaire français du XVIIIᵉ siècle.',
  ],
  volume: 'La musique passe par un bus à part, sous le volume général, plus bas que l’ambiance. Dans les **Options** : le curseur **« Musique »** (le volume de la musique, juste après le volume général ; 50 % au départ) et la case **« Musique de temps en temps »** : décochée, la musique s’efface en deux ou trois secondes et ne revient plus, jusqu’à ce qu’on la recoche. Ces réglages sont gardés avec les autres réglages du jeu, pas dans la partie.',
  silence: 'Un morceau en cours va jusqu’au bout, même si l’on passe d’un pré à la forêt. Mais il s’efface en fondu, au bout de quelques secondes, si l’endroit ne lui convient plus : on entre dans un autre monde ou l’on en sort, on descend sous terre (une cave où l’on ne fait que passer ne l’interrompt pas), la peur monte (une chose vous suit, le tueur, l’esprit), la nuit devient noire ou rouge, on bascule dans l’Envers, [[sys:slender|la chasse aux pages]] commence, ou le violoneux joue près de vous.',
  secret: [
    'Au pays des bonbons et dans les Ténèbres, la petite boîte à musique du monde joue sans fin « Au clair de la lune », faux. Quand un morceau commence, elle se tait ; et au pays des bonbons, l’un des morceaux est justement cet air, joué juste, enfin — la boîte, puis le célesta une octave plus haut, puis la boîte seule qui ralentit comme un ressort qui se détend. Dans les Ténèbres, « Clair de lune noir » est le même air, en mineur, au fond d’un puits ; la seconde fois, c’est le verre qui le chante.',
    '« Descente » (les Enfers) : une basse qui descend d’un demi-ton à chaque mesure, quatre fois de suite ; la toute dernière mesure est en sol majeur.',
    '« Le manège » (les bonbons) et « Au clair de la lune » finissent en ralentissant, comme une boîte à musique dont le ressort se détend.',
    '« La crête » commence et finit par une cloche, très loin — celle d’une chapelle qu’on ne voit pas.',
    '« Le marais au soir » : trois notes de célesta, de loin en loin, comme des feux follets.',
    '« Cristaux » passe, au milieu, par un do majeur qui n’a rien à faire là, comme une facette qui renvoie une autre lumière.',
    '« Les jardins suspendus » (la cité) n’emploie que les notes des touches noires (fa dièse pentatonique) ; « Le chemin creux » est à cinq temps ; « Le vieux chêne » est un vrai choral à quatre voix, qui finit en majeur ; « Le lac au matin » est une barcarolle (la main droite chante toujours à deux voix, en tierces et en sixtes).',
  ],
};

// ---------------------------------------------------------------- la voix de chaque milieu
const AMBIANCE = {
  lead: 'Chaque coin de la vallée a sa voix : on sait où l’on est les yeux fermés. Ses oiseaux, chacun avec son vrai chant (le rythme, le timbre, le phrasé) ; son fond (les insectes, les grenouilles, le vent dans les arbres, les roseaux ou la bruyère, le ressac du lac) ; ses bruits rares ; sa pluie. Rien n’est enregistré : tout est synthétisé, calculé une fois en tâche de fond, puis rejoué. Et tout reste doux et rare : un chanteur à la fois, de longs silences.',
  passage: 'On ne passe pas d’un son à l’autre d’un coup : autour de soi, les milieux se mélangent (la lisière d’un bois s’entend encore dans les prés), et les voix se fondent en quelques secondes quand on marche. Le bord d’une mare du marais sonne comme le marais, la rive d’un lac comme le lac, les abords de la ville comme la ville (ses cloches, ses chiens), un hameau comme une ferme (sa basse-cour).',
  // [fiche du milieu, milieu, le jour, le soir et la nuit, sous la pluie]
  milieux: [
    ['mil:pres', 'Les prés', 'l’alouette des champs haut dans le ciel, le bruant jaune (« ti-ti-ti-ti-tîîî… tuuu »), le bruant proyer et son trousseau de clés, la caille (« paye-tes-dettes »), la linotte, l’hirondelle ; les criquets au soleil, un bourdon qui passe', 'le râle des genêts (« crex-crex » dans l’herbe haute), la caille, la chevêche, le rossignol dans les haies ; le grillon d’Italie, la grande sauterelle le soir, les grillons', 'un chuchotement fin dans l’herbe'],
    ['mil:foret', 'La forêt', 'la grive musicienne (chaque motif redit deux ou trois fois), le rouge-gorge, le troglodyte, la sittelle, la fauvette à tête noire, le pigeon ramier, le pouillot véloce, le merle, le pinson, le pic qui tambourine ; le souffle dans les pins et les chênes, une brindille qui casse, un tronc qui grince quand il vente', 'le hibou moyen-duc, la hulotte ; le vent dans les cimes', 'le crépitement sur les feuilles, les grosses gouttes qui tombent des hautes branches ; après l’averse, les arbres s’égouttent longtemps'],
    ['mil:bouleaux', 'Le bois de bouleaux', 'le pouillot fitis (une cadence douce qui descend), la mésange bleue, le bouvreuil (« piou »), le pouillot véloce, le rouge-gorge ; le frisson clair des petites feuilles', 'l’engoulevent (un ronronnement sec, comme un petit moteur), le moyen-duc', 'comme la forêt'],
    ['mil:marais', 'Le marais (près des mares)', 'la rousserolle effarvatte, le bruant des roseaux, le troglodyte, le rossignol ; les roseaux qui froissent, les grenouilles vertes (des rires roulés), des bulles', 'le chœur des rainettes (« kèp-kèp-kèp », qui partent et s’arrêtent ensemble), les crapauds accoucheurs, le rossignol', 'la pluie sur l’eau : des milliers de petites bulles'],
    ['mil:berges', 'Le bord du lac', 'le loriot (un « didl-io » flûté), la rousserolle turdoïde (rauque), l’effarvatte, les hirondelles sur l’eau ; le ressac sur la grève, un poisson qui saute, un canard', 'le rossignol, les rainettes, les crapauds', 'la pluie sur l’eau'],
    ['mil:lande', 'La lande', 'l’alouette lulu (des notes liquides qui descendent), le tarier pâtre (deux cailloux qu’on cogne), la linotte ; le vent bas dans la bruyère, les criquets, les gousses d’ajonc qui éclatent au soleil, des sonnailles au loin', 'l’engoulevent, l’alouette lulu (elle chante aussi la nuit), la sauterelle, le grillon d’Italie', 'une pluie fine et sèche que le vent pousse par nappes'],
    ['mil:alpage', 'Les hauteurs', 'le merle à plastron, le pipit spioncelle (il monte en chantant et redescend en parachute), le rougequeue noir sur les rochers, la buse et la crécerelle très haut ; l’air des cimes, les sonnailles des troupeaux, un caillou qui dévale', 'le vent, et presque rien', 'la pluie sur la pierre et la bruyère'],
    ['mil:ville', 'La ville', 'les moineaux, les martinets qui passent en criant au-dessus des toits, le serin, le rougequeue noir, les tourterelles ; une charrette sur les pavés, un chien au loin, l’angélus', 'le petit-duc (un « tiou » de flûte, sans fin), les crapauds accoucheurs dans les vieux murs', 'les toits, la gouttière qui gargouille, les gouttes des avant-toits qui claquent sur les pavés, chacune à son rythme'],
    ['mil:ferme', 'La ferme', 'les hirondelles, les moineaux, le rougequeue, les tourterelles, le merle ; la basse-cour (des poules, une oie, une vache au loin), le coq d’une ferme voisine, un chien', 'la chevêche (« kiou »), les crapauds accoucheurs, les grillons', 'la pluie mate sur le chaume, plus claire sur les tuiles, la gouttière, et la goutte qui tombe dans le tonneau'],
  ],
  abri: 'À l’abri (dans une maison, une grange), on entend la pluie **sur le toit**, au-dessus de soi, et le dehors assourdi.',
  temps: [
    '**L’aube** (de 4 h 30 à 8 h 30) : les oiseaux chantent plus souvent ; le soir, le merle, le rouge-gorge et la grive ont le dernier mot, puis viennent les chanteurs de la nuit.',
    '**Les insectes** chantent quand il fait beau et chaud : les criquets du milieu de la matinée à la fin de l’après-midi, la grande sauterelle le soir, le grillon d’Italie la nuit. La canicule les réveille ; le gel et la neige les font taire.',
    '**Les grenouilles et les rainettes** chantent plus fort après la pluie.',
    '**La pluie** fait taire les oiseaux et les insectes ; **l’orage** fait tout taire, sauf la pluie et le vent.',
    '**Le brouillard** étouffe tout et fait taire un oiseau sur deux ; **la neige** fait taire les oiseaux et assourdit le reste. **La canicule**, l’après-midi, fait taire un oiseau sur deux.',
    'Le vent dans les arbres, les roseaux et la bruyère suit les bouffées du vent, et forcit avec lui.',
    'Sous terre, dans les autres mondes, les nuits rouges et l’Envers : rien de tout cela.',
  ],
  // les oiseaux qu’on entend sans les voir : [nom, où, quand, fiche de la bête quand on la voit aussi]
  oiseaux: [
    ['Grive musicienne', 'la forêt, le bois de bouleaux, la ferme', 'le jour, l’aube et le soir'],
    ['Rouge-gorge familier', 'la forêt, le bois de bouleaux, la ferme, la ville', 'le jour, l’aube et le soir'],
    ['Troglodyte mignon', 'la forêt, le bois de bouleaux, le marais', 'le jour'],
    ['Sittelle torchepot', 'la forêt', 'le jour'],
    ['Fauvette à tête noire', 'la forêt, le bois de bouleaux, la ferme', 'le jour'],
    ['Pigeon ramier', 'la forêt, la ferme', 'le jour'],
    ['Pouillot fitis', 'le bois de bouleaux', 'le jour'],
    ['Pouillot véloce', 'le bois de bouleaux, la forêt, le bord du lac', 'le jour'],
    ['Mésange bleue', 'le bois de bouleaux, la forêt', 'le jour'],
    ['Bouvreuil pivoine', 'le bois de bouleaux, la forêt', 'le jour'],
    ['Bruant jaune', 'les prés, la lande, la ferme', 'le jour'],
    ['Bruant proyer', 'les prés', 'le jour'],
    ['Caille des blés', 'les prés, la ferme', 'le jour et la nuit', 'an:caille'],
    ['Râle des genêts', 'les prés', 'la nuit'],
    ['Alouette lulu', 'la lande', 'le jour et la nuit'],
    ['Tarier pâtre', 'la lande', 'le jour'],
    ['Linotte mélodieuse', 'la lande, les prés', 'le jour'],
    ['Merle à plastron', 'les hauteurs', 'le jour'],
    ['Pipit spioncelle', 'les hauteurs', 'le jour'],
    ['Rougequeue noir', 'les hauteurs, la ville, la ferme', 'le jour'],
    ['Martinet noir', 'la ville', 'le jour'],
    ['Serin cini', 'la ville', 'le jour'],
    ['Hirondelle rustique', 'la ferme, les prés, le bord du lac', 'le jour'],
    ['Loriot d’Europe', 'le bord du lac, la forêt', 'le jour'],
    ['Rousserolle turdoïde', 'le bord du lac', 'le jour'],
    ['Rousserolle effarvatte', 'le marais, le bord du lac', 'le jour'],
    ['Bruant des roseaux', 'le marais', 'le jour'],
    ['Rossignol philomèle', 'le bord du lac, le marais, le bois de bouleaux, les prés, la ferme', 'surtout la nuit'],
    ['Engoulevent d’Europe', 'la lande, le bois de bouleaux', 'le crépuscule et la nuit'],
    ['Chevêche d’Athéna', 'la ferme, les prés', 'la nuit', 'an:cheveche'],
    ['Hibou moyen-duc', 'la forêt, le bois de bouleaux', 'la nuit', 'an:moyen_duc'],
    ['Petit-duc scops', 'la ville', 'la nuit', 'an:petit_duc'],
    ['Buse variable', 'les hauteurs', 'le jour, très haut', 'an:buse'],
    ['Faucon crécerelle', 'les hauteurs', 'le jour, très haut', 'an:crecerelle'],
    ['Le coq d’une ferme voisine', 'près d’une ferme ou d’un hameau', 'à l’aube'],
  ],
  reglage: 'Le curseur **« Ambiance »** des Options règle tout cela (les oiseaux, les insectes, les grenouilles, le vent dans les arbres, la pluie) ; la case **« Son 3D pour casque »** place les chanteurs et les bruits là où ils sont. Le total n’est pas plus fort qu’avant ; rien de plus n’est calculé à chaque image.',
  secret: [
    '**L’angélus** sonne trois fois par jour, à 7 h, à midi et à 19 h : trois tintements, trois fois, puis la volée, du clocher de l’église. On l’entend jusqu’à un kilomètre de la ville, de plus en plus sourd.',
    '**Le coq** d’une ferme voisine chante deux à quatre fois à l’aube (vers 5 h) quand on est près d’une ferme ou d’un hameau.',
    'Après une averse, sous les arbres, **l’égouttement** dure plusieurs minutes.',
    'Le **marais** se reconnaît à l’oreille même là où la carte ne le dit pas : près de ses mares.',
    '**Les nuits noires** (ni lune ni étoiles), la nature se tait : plus de grillons, de grenouilles, de rainettes, de crapauds, plus de rossignol ni de chouette ; rien que le vent. Le silence revient avec l’aube.',
    'Avant le lever du soleil, dans le noir, le rouge-gorge, le merle et la grive commencent le chœur de l’aube.',
    'Les jours de grand froid, tant que la neige reste au sol, les insectes ne chantent pas.',
    'Les oiseaux qu’on entend sans les voir sont trente-cinq (avec le merle, le pinson, la mésange, l’alouette, la tourterelle, le coucou, le moineau, la hulotte et le pic d’avant), et une dizaine de bruits les accompagnent (le chien très loin, les cloches, les sonnailles, un bourdon, une charrette, une brindille, un tronc, les gousses, un caillou, un poisson) ; les bêtes qu’on voit ont leurs propres cris.',
    'La nuit, les chanteurs viennent un à un, de leur place, et chacun reprend sa phrase plusieurs fois (le rossignol longtemps) avant un long silence ; le jour, un chanteur à la fois, et l’on n’en entend guère plus de deux par minute.',
  ],
};


// ---------------------------------------------------------------- les milieux (plantes et bêtes)
// [milieu, titre, précision, fiche du milieu]
const MILIEUX = [
  ['plaine', 'Les prés', '', 'mil:pres'],
  ['ferme', 'La ferme', 'autour des fermes, du hameau, du moulin, de la bergerie ; les champs autour ; les décombres', 'mil:ferme'],
  ['ville', 'La ville', 'au pied des murs de la ville et du hameau, dans les jardins et les cours, contre l’église', 'mil:ville'],
  ['lande', 'La lande', '', 'mil:lande'],
  ['hauteurs', 'Les hauteurs', 'les alpages, les rochers et les éboulis, le bord des neiges, les crêtes, autour des chalets d’estive', 'mil:alpage'],
  ['foret', 'La forêt', 'le sous-bois, le pied des arbres, le bois mort', 'mil:foret'],
  ['bouleaux', 'Le bois de bouleaux', '', 'mil:bouleaux'],
  ['marais', 'Le marais', 'les abords des mares du marais et les prés mouillés autour', 'mil:marais'],
  ['lac', 'Le bord du lac', 'les rives, l’eau peu profonde, l’eau libre', 'mil:berges'],
];

// ---------------------------------------------------------------- les plantes : ce qu’on en dit
const PLANTES_TEXTES = {
  lead: 'Quatre-vingt-dix espèces vraies de nos campagnes, dix par milieu. Chacune pousse dans son milieu, se cueille à la main (touche E) et repousse (trente heures de jeu pour les communes, quarante à soixante-douze pour les rares) ; elle donne un objet qu’on peut manger (à ses risques), mêler sur la table d’alchimiste (ses essences), vendre (la caisse d’expédition au prix de base, et ses acheteurs) ; elle a sa notice dans l’**herbier** du marchand, rangée sous son milieu.',
  nommer: 'La plupart n’ont d’abord que leur **allure** (entre guillemets dans les tableaux) : [[pnj:alchimiste|l’alchimiste de la ville]] les nomme (5 à 15 pièces selon l’amitié, gratuit pour un ami) et dit ce qu’il en pense. Les plus connues portent leur nom tout de suite.',
  rarete: 'Rareté : commune, peu commune, rare, très rare, introuvable ou presque (un ou deux pieds dans toute la vallée). Prix de base : 1, 2, 5, 12 ou 25 pièces selon la rareté. La ville et la ferme sont petites, le marais et les rives aussi : leurs plantes y sont serrées. Les plantes marquées « Toxique » dans l’herbier : le lierre, le gouet, le lactaire à toison, la gratiole, l’œnanthe, la narthécie, la fritillaire, la lobélie.',
  faire: [
    '**Café de chicorée** (au feu) : deux chicorées donnent un [[it:cafe_chicoree|café]] : il nourrit un peu, et donne souvent de la vigueur une ou deux minutes. L’aubergiste l’achète.',
    '**Sirop de capillaire** (au feu) : trois capillaires et un pot de miel donnent un [[it:sirop_capillaire|sirop]] : remède, calme. La guérisseuse et l’aubergiste l’achètent.',
    '**Genièvre** (à l’alambic du bouilleur de cru, avec deux bûches ou un charbon) : cinq baies de genièvre et une eau-de-vie de grain donnent deux bouteilles de [[it:eau_genievre|genièvre]] : une eau-de-vie (l’ivresse) et de la chaleur. L’aubergiste l’achète.',
    '**Eau de mélisse** (à l’alambic, de même) : quatre mélisses et une eau-de-vie de grain donnent deux flasques d’[[it:eau_melisse|eau de mélisse]] : calme fort, remède, un peu d’alcool. La guérisseuse et l’aubergiste l’achètent.',
    '**Liqueur de gentiane** (au tonneau) : trois racines de gentiane jaune, une eau-de-vie de grain et un pot de miel donnent deux bouteilles de [[it:liqueur_gentiane|liqueur de gentiane]], comme avec la gentiane bleue.',
    '**Pâte de guimauve** (au feu) : deux racines de guimauve, un pot de miel et un œuf donnent deux [[it:pate_guimauve|pâtes]] : elles nourrissent un peu, remède, calme. La guérisseuse et l’aubergiste les achètent.',
    '**Chandelles de jonc** (sans atelier) : trois joncs et un bâton de cire donnent deux [[it:bougie|bougies]].',
    '**Lait caillé** (sans feu) : une bouteille de lait et une grassette donnent un [[it:lait_caille|lait caillé]] (l’aubergiste l’achète).',
    'Ces recettes ne s’affichent pas d’avance : on les découvre en assemblant (puis elles restent dans la liste) ; le café de chicorée, le sirop de capillaire, la pâte de guimauve et le lait caillé sont aussi dans le manuel de cuisine du marchand.',
    '**Les herbes à plaies** se posent sur une plaie qui saigne, même le ventre plein (clic, l’objet en main) : la bourse-à-pasteur, la langue-de-serpent et l’amadou arrêtent le sang ; la sanicle, la pyrole et la scrofulaire le ralentissent beaucoup.',
    '**En fouillant** : la tanaisie, la mélisse, la bourrache, la petite centaurée, la bétoine et la racine de gentiane dans les bocaux ; l’eau de mélisse, le sirop de capillaire, la laitue vireuse, la pâte et la racine de guimauve, l’amadou, l’acore (et très rarement une racine de nard) dans les tiroirs de l’apothicaire ; l’eau de mélisse dans les malles des curés ; les baies de genièvre dans les jarres ; les immortelles séchées dans les maisons abandonnées ; le genièvre dans les casiers des caves ; le café de chicorée sur les étagères ; l’amadou chez les bûcherons, les charbonniers et dans les campements ; les châtaignes d’eau chez les pêcheurs ; les canneberges et les joncs dans les caches du marais.',
    '**Les groupes « au choix »** : les fleurs entrent dans « fleurs (au choix) », la canneberge dans les baies et les fruits ; la mélisse, la dryade (le thé suisse), la bétoine, le gaillet jaune, la germandrée et le lycope dans les aromates (les infusions) ; le bolet rude, le paxille, la langue-de-bœuf, l’oronge et l’oreille-de-Judas dans les champignons comestibles (l’omelette).',
  ],
  conduites: [
    '**La berce** : cueillie en plein soleil, sa sève brûle la peau — une fois sur trois, des cloques viennent une à deux minutes plus tard (3 points de vie, et une pensée).',
    '**La carline**, le baromètre du berger, se ferme quand il pleut, qu’il fait orage ou que le brouillard tombe, et se rouvre ensuite : on la voit changer.',
    '**La cuscute** (les cheveux du diable), mangée, égare parfois un peu.',
  ],
};
// ce qui se cache : [plantes concernées (fiches « pl: »), texte]
const PLANTES_SECRETS = [
  [['botryche'], '**La lunaire** (la botryche, « Petite feuille en croissants de lune, épi doré ») : un ou deux pieds dans toute la vallée, dans l’herbe rase de la lande. On dit qu’elle ouvre les serrures : c’est vrai, mais seulement la nuit (de neuf heures du soir à quatre heures du matin). Qui la tient en main et veut crocheter une porte fermée à clé n’a pas besoin de crochets : la serrure cède d’elle-même, sans bruit et sans témoin, et la plante se fane (elle est perdue). Le jour, elle n’y fait rien. L’alchimiste l’aime plus que tout (elle le rend très amical) et l’achète.'],
  [['gentiane_jaune', 'veratre'], '**La gentiane et le vérâtre** : avant l’alchimiste, ils s’appellent « Grandes feuilles plissées, fleurs jaunes » et « Grandes feuilles plissées, racine jaune » ; ils poussent ensemble dans les alpages. La racine de vérâtre tue (elle fait vomir, empoisonne fort, paralyse parfois). On les distingue aux feuilles : par deux, face à face, chez la gentiane (et ses fleurs jaunes étagées) ; une à une, tout autour de la tige, chez le vérâtre (l’herbier et l’alchimiste le disent).'],
  [['veratre'], '**La liqueur de vérâtre** : qui met trois racines de vérâtre au tonneau, avec l’eau-de-vie et le miel, obtient deux bouteilles en tout pareilles à la liqueur de gentiane (même nom, même image) — mais elles empoisonnent (l’ivresse, les vomissements, le poison, parfois la paralysie : « Empoisonné par une liqueur de vérâtre »). Les indices : l’aubergiste ne les achète pas ; l’alchimiste les démasque (« Ce n’est pas de la gentiane. ») et les achète.'],
  [['homme_pendu'], '**L’orchis homme-pendu** : trois à cinq pieds, près des calvaires des carrefours (où l’on enterrait autrefois ceux qui s’étaient pendus) et sur les talus secs. La nuit (de dix heures du soir à quatre heures), qui passe tout près d’un homme-pendu entend un murmure — une fois par nuit, pas plus. Mangé : la clairvoyance, parfois des visions.'],
  [['ail_victorial'], '**L’ail victorial**, l’herbe à neuf chemises des mineurs : mangé, il endurcit — pendant deux ou trois minutes, les coups, les morsures et les chutes portent un cinquième de moins. Rien ne l’annonce.'],
  [['auricule'], '**L’auricule**, l’oreille-d’ours des chasseurs de chamois : sa racine ôte le vertige — le sang-froid, et pendant deux à quatre minutes on tombe comme si l’on tombait d’un peu moins haut (une chute qui blessait fait moins de mal).'],
  [['grande_cigue'], '**La grande ciguë** pousse aussi autour de la vieille ferme, du hameau et des décombres : elle ressemble au cerfeuil ; mangée, elle paralyse puis tue souvent (la tige tachée de pourpre la trahit ; l’alchimiste le dit).'],
  [['paxille'], '**Le paxille enroulé** : on le mange sans mal trois à six fois (le nombre est tiré pour chaque partie, et compté dans la sauvegarde) ; ensuite, à chaque fois : les coliques, la fièvre, et un empoisonnement qui vient une à trois minutes plus tard, et qui est pire à partir de la deuxième fois (il peut tuer). L’antidote l’empêche. (C’est vrai : le syndrome paxillien, une réaction du sang qui vient après des années.) Seulement quand on le mange tel quel : l’omelette ne compte pas.'],
  [['oenanthe'], '**L’œnanthe safranée** : la plus mortelle. Le visage se tord comme un rire (on marche mal, l’écran tremble), puis un poison très fort, souvent la paralysie et la panique. Sans antidote, on en meurt presque toujours.'],
  [['narthecie'], '**La narthécie, le brise-os** : rien ne le dit, mais pendant sept à douze minutes, toute chute compte comme si l’on tombait de plus haut (une chute qui ne faisait rien blesse, une petite chute peut casser une jambe).'],
  [['lobelie'], '**La lobélie** : elle fait vomir, mais elle ouvre la poitrine : « Souffle d’anguille » (on tient longtemps sous l’eau) pendant une ou deux minutes.'],
  [['gui_chene', 'linnee', 'oeil_bouc'], '**Le gui de chêne, la linnée boréale, la saxifrage œil-de-bouc** : une ou deux touffes d’un seul pied dans toute la vallée ; le gui gît au pied d’un vieux chêne de la forêt ; la linnée dans la mousse d’un bois de bouleaux ; l’œil-de-bouc au cœur du marais. Les montrer à l’alchimiste le rend plus amical (il les aime, comme le martagon et la trientale) ; le maire en achète, comme le sabot-de-Vénus.'],
  [['linnee', 'trientale', 'martagon', 'oeil_bouc'], 'Manger la linnée fait rêver (un songe) ; la trientale et le martagon portent chance ; l’œil-de-bouc donne le sang-froid et parfois la clairvoyance.'],
  [[], 'Ce que les habitants aiment qu’on leur montre ou qu’on leur offre : l’alchimiste adore la lunaire et le nard celtique, aime l’homme-pendu, l’orobanche, la renoncule des glaciers, la goutte-de-sang et le cétérach ; la guérisseuse aime la mélisse, la bourrache, la langue-de-serpent et l’eau de mélisse ; la fromagère d’estive, le gaillet (le caille-lait) ; le baïle, la gentiane. Le maire achète les fleurs rares (l’œillet superbe, la goutte-de-sang, l’auricule, la renoncule des glaciers, le nard celtique).'],
  [[], 'L’alchimiste a une remarque pour chacune (« Lâchez ça. Tout de suite. » pour l’œnanthe ; pour le paxille : « le corps s’en lasse, un jour, et il le fait payer »).'],
];

// ---------------------------------------------------------------- les plantes, milieu par milieu : [plante, où, allure (avant l’alchimiste), mangée, acheteurs]
const PLANTES = {
  plaine: [
    ['chicoree', 'bords des chemins ; prés', '', 'vigueur', 'aubergiste'],
    ['gaillet_jaune', 'talus et pelouses sèches ; prés', 'Panaches jaunes qui sentent le miel', 'calme', 'guérisseuse, fromagère d’estive'],
    ['rhinanthe', 'prés', 'Fleurs jaunes en casque, calice gonflé', 'nausée, coliques', 'alchimiste'],
    ['berce', 'bords des chemins ; prés humides, bords de l’eau ; prés', '', 'vigueur', 'aubergiste, éleveuse'],
    ['cardere', 'prés humides, bords de l’eau ; bords des chemins', 'Grande tige épineuse aux têtes hérissées', 'yeux de soleil', 'colporteur, colporteuse'],
    ['saponaire', 'prés humides, bords de l’eau ; bords des chemins', 'Fleurs roses qui moussent dans l’eau', 'nausée, vomissements', 'alchimiste, colporteuse'],
    ['tanaisie', 'bords des chemins ; prés humides, bords de l’eau', 'Boutons jaunes plats, feuilles de fougère', 'nausée, remède, panique (poison)', 'guérisseuse'],
    ['ophioglosse', 'prés humides, bords de l’eau', 'Une seule feuille, et une langue dressée', 'arrête le sang, soigne un peu', 'guérisseuse'],
    ['oeillet_superbe', 'prés humides, bords de l’eau ; prés', 'Fleur rose pâle aux pétales frangés', 'charme', 'maire'],
    ['homme_pendu', 'près des calvaires ; talus et pelouses sèches', 'Épi de petits hommes pendus', 'clairvoyance, hallucinations, panique', 'alchimiste'],
  ],
  ferme: [
    ['bon_henri', 'autour des fermes ; autour des chalets d’estive, de la bergerie, du refuge', 'Feuilles en fer de flèche, farineuses', 'vigueur', 'aubergiste, fromagère d’estive'],
    ['mouron_blanc', 'autour des fermes ; champs autour des fermes', '', 'soigne un peu', 'éleveuse'],
    ['bourse_pasteur', 'autour des fermes ; champs autour des fermes', '', 'arrête le sang', 'guérisseuse'],
    ['bardane', 'autour des fermes ; décombres, ruines', '', 'remède', 'guérisseuse'],
    ['pensee_champs', 'champs autour des fermes ; autour des fermes', '', 'remède, calme', 'guérisseuse'],
    ['nielle', 'champs autour des fermes ; autour des fermes', 'Fleur pourpre entre de longues pointes vertes', 'nausée, vomissements, coliques, empoisonne (poison)', 'alchimiste'],
    ['grande_cigue', 'décombres, ruines ; autour des fermes', 'Ombelles blanches, tige tachée de pourpre', 'paralysie, empoisonne, nausée (poison)', 'alchimiste'],
    ['bryone', 'décombres, ruines ; autour des fermes', 'Liane à vrilles et baies rouges', 'coliques, vomissements, empoisonne (poison)', 'alchimiste, colporteur'],
    ['ivraie', 'champs autour des fermes', 'Herbe à épi plat, grains barbus', 'ivresse, vue trouble, nausée', 'alchimiste'],
    ['adonis', 'champs autour des fermes', 'Fleur rouge sang au cœur noir', 'empoisonne, panique, vigueur (poison)', 'maire, alchimiste'],
  ],
  ville: [
    ['parietaire', 'pied des murs (ville, hameau)', 'Herbe rougeâtre et collante des murs', 'remède', 'guérisseuse'],
    ['cymbalaire', 'pied des murs (ville, hameau)', 'Petites gueules mauves qui pendent des murs', 'soigne un peu', 'colporteuse'],
    ['orpin_acre', 'pied des murs (ville, hameau)', 'Coussin de petites étoiles jaunes, feuilles en grains', 'brûle la bouche, vomissements (poison)', 'alchimiste'],
    ['capillaire', 'pied des murs (ville, hameau)', 'Petite fougère aux tiges noires et luisantes', 'remède', 'guérisseuse'],
    ['giroflee', 'pied des murs (ville, hameau)', '', 'calme, charme', 'colporteuse'],
    ['bourrache', 'jardins et cours (ville, hameau)', '', 'remède, calme', 'guérisseuse'],
    ['melisse', 'jardins et cours (ville, hameau) ; contre l’église et le cimetière', '', 'calme, somnolence', 'guérisseuse'],
    ['laitue_vireuse', 'jardins et cours (ville, hameau) ; décombres, ruines', 'Haute salade amère au lait blanc', 'somnolence, endort, calme, empoisonne (poison)', 'alchimiste'],
    ['ceterach', 'pied des murs (ville, hameau)', 'Petite fougère écailleuse, dorée dessous', 'remède, vigueur', 'guérisseuse'],
    ['orobanche', 'contre l’église et le cimetière', 'Épi pâle sans feuilles, couleur de chair', 'nausée, clairvoyance', 'alchimiste'],
  ],
  lande: [
    ['genestrole', 'lande', 'Petit genêt sans épines, fleurs d’or', 'nausée', 'colporteuse'],
    ['viperine', 'lande', 'Haute tige hérissée aux fleurs bleues', 'remède', 'guérisseuse'],
    ['genevrier', 'lande', '', 'chaleur, vigueur', 'aubergiste'],
    ['polygala', 'lande', 'Petites fleurs bleues en ailes', 'remède', 'éleveuse, guérisseuse'],
    ['petite_centauree', 'lande', 'Petites étoiles roses très amères', 'remède, creuse l’appétit', 'guérisseuse'],
    ['betoine', 'lande', 'Épi pourpre serré, feuilles crénelées', 'calme, sang-froid, remède', 'guérisseuse'],
    ['pied_chat', 'lande', 'Petits pompons roses et laineux', 'remède', 'guérisseuse'],
    ['cuscute', 'lande', 'Fils rouges emmêlés sur la bruyère', 'nausée, égarement', 'alchimiste'],
    ['immortelle', 'lande', 'Boutons d’or secs qui ne fanent pas', 'remède, calme', 'guérisseuse, colporteuse'],
    ['botryche', 'lande', 'Petite feuille en croissants de lune, épi doré', 'clairvoyance, chance', 'alchimiste'],
  ],
  hauteurs: [
    ['veratre', 'alpages', 'Grandes feuilles plissées, racine jaune', 'vomissements, empoisonne, paralysie, vue trouble (poison)', 'alchimiste'],
    ['rumex_alpin', 'autour des chalets d’estive, de la bergerie, du refuge ; alpages', 'Immenses feuilles en cœur près des étables', 'coliques', 'aubergiste, éleveuse, fromagère d’estive'],
    ['gentiane_jaune', 'alpages', 'Grandes feuilles plissées, fleurs jaunes', 'remède, creuse l’appétit, vigueur', 'guérisseuse, baïle de l’estive'],
    ['dryade', 'rochers, éboulis ; alpages', 'Fleurs blanches à huit pétales, sur un tapis ras', 'calme, chaleur', 'guérisseuse, baïle de l’estive'],
    ['carline', 'alpages', 'Grande fleur d’argent posée au ras du sol', 'vigueur', 'aubergiste, baïle de l’estive'],
    ['trolle', 'alpages', 'Grosse boule jaune qui ne s’ouvre pas', 'brûle la bouche, nausée, coliques (poison)', 'alchimiste'],
    ['auricule', 'rochers, éboulis', 'Primevère jaune des rochers, feuilles poudrées', 'sang-froid, pied sûr, calme', 'maire, guérisseuse'],
    ['renoncule_glaciers', 'bord des neiges', 'Fleur blanche et rose au bord de la glace', 'brûle la bouche, nausée, sang-froid (poison)', 'maire, alchimiste'],
    ['ail_victorial', 'rochers, éboulis ; alpages', 'Ail à larges feuilles, bulbe en filet', 'endurcit, chaleur', 'alchimiste'],
    ['nard_celtique', 'crêtes rocailleuses', 'Petite plante grise qui sent le musc', 'calme, somnolence, songe', 'maire, alchimiste'],
  ],
  foret: [
    ['lierre', 'au pied des arbres, contre le tronc', '', 'baies : nausée, vomissements', 'guérisseuse'],
    ['oreille_judas', 'sur le bois mort (sureaux, arbres morts, souches)', 'Oreilles brunes sur le bois mort', 'soigne la gorge (remède)', 'guérisseuse'],
    ['sanicle', 'sous-bois frais', 'Petites boules blanches sur des feuilles en main', 'arrête le sang (aussi posée sur une plaie, même rassasié), soin', 'guérisseuse'],
    ['gouet', 'sous-bois', 'Cornet pâle autour d’un doigt brun', 'brûle la bouche, nausée, vomissements, coliques (poison)', 'alchimiste'],
    ['fragon', 'sous les chênes', 'Petit buisson piquant à baie rouge', 'remède', 'alchimiste'],
    ['langue_boeuf', 'au pied des vieux chênes et des châtaigniers', 'Langue de chair rouge sur un vieux chêne', 'nourrit (5), parfois la force', 'aubergiste'],
    ['martagon', 'bois clairs, combes, sapinières de la forêt', 'Turbans roses tachés de pourpre', 'nourrit, parfois vigueur ou chance', 'alchimiste (il aime)'],
    ['oronge', 'sous les chênes, à quelques pas', 'Champignon orange sortant d’un œuf blanc', 'très bonne (10), vigueur, force', 'aubergiste'],
    ['sabot_venus', 'sous-bois et sapinières de la forêt', 'Sabot jaune entre des pétales bruns', 'calme, somnolence', 'alchimiste, maire'],
    ['gui_chene', 'une touffe tombée au pied d’un vieux chêne', 'Touffe de gui tombée d’un chêne', 'calme, parfois la chance ; baies : nausée', 'alchimiste (il aime), maire'],
  ],
  bouleaux: [
    ['amadouvier', 'chicots de bouleaux morts, ses sabots gris étagés', '', 'se pose sur une plaie : arrête le sang', 'guérisseuse, chasseur'],
    ['bolet_rude', 'sous les bouleaux', 'Bolet brun au pied hérissé de noir', 'nourrit (6)', 'aubergiste'],
    ['paxille', 'sous les bouleaux', 'Champignon brun au bord enroulé', 'nourrit (4)… (voir ce qui se cache)', 'alchimiste'],
    ['tormentille', 'bois de bouleaux, sols acides', 'Petite fleur jaune à quatre pétales', 'remède (flux de ventre), arrête un peu le sang', 'guérisseuse'],
    ['germandree', 'lisières', 'Sauge pâle des lisières', 'vigueur, remède ; aromate (infusions)', 'guérisseuse'],
    ['verge_or', 'clairières', 'Épis jaune d’or', 'soin, remède', 'guérisseuse'],
    ['lactaire', 'sous les bouleaux', 'Champignon rose au bord laineux', 'brûle, coliques, vomissements (poison)', 'alchimiste'],
    ['pyrole', 'mousses des bois de bouleaux', 'Clochettes blanches sur des feuilles rondes', 'arrête le sang (aussi sur une plaie), soin', 'guérisseuse'],
    ['trientale', 'bois de bouleaux', 'Étoile blanche à sept branches', 'la chance, calme', 'alchimiste (il aime), maire'],
    ['linnee', 'mousse des bois de bouleaux', 'Deux clochettes roses jumelles', 'un songe, calme', 'alchimiste (il aime), maire'],
  ],
  marais: [
    ['jonc', '', '', 'presque rien', 'vannière des Planches'],
    ['lycope', '', 'Menthe sans odeur aux feuilles découpées', 'calme, remède ; aromate', 'guérisseuse'],
    ['lysimaque', '', 'Grandes grappes jaunes des fossés', 'calme, arrête un peu le sang', 'guérisseuse'],
    ['pediculaire', '', 'Fleurs roses en casque, feuilles de fougère', 'nausée, coliques', 'alchimiste'],
    ['gratiole', '', 'Petites fleurs blanches veinées de violet', 'purge violente, parfois poison', 'alchimiste'],
    ['grassette', '', 'Rosette grasse et collante', 'remède', 'guérisseuse'],
    ['canneberge', '', 'Petites baies rouges sur la mousse', 'nourrit, vigueur ; baies et fruits (confitures, tartes)', 'guérisseuse, aubergiste'],
    ['oenanthe', '', 'Grande ombelle blanche aux racines en fuseaux', 'MORTELLE (voir ce qui se cache)', 'alchimiste'],
    ['narthecie', '', 'Épis d’étoiles jaunes sur des feuilles en éventail', 'nausée… (voir ce qui se cache)', 'alchimiste'],
    ['oeil_bouc', '', 'Fleur jaune piquetée d’orange', 'sang-froid, clairvoyance', 'alchimiste (il aime), maire'],
  ],
  lac: [
    ['scirpe', 'les pieds dans l’eau du bord', '', 'presque rien', 'vannière des Planches'],
    ['plantain_eau', 'eau peu profonde', 'Feuilles en cuillère, fleurs minuscules', 'brûle la bouche, nausée', 'guérisseuse'],
    ['eupatoire', 'rives', 'Bouquets rose sale, feuilles de chanvre', 'remède, parfois coliques', 'guérisseuse'],
    ['nuphar', 'flotte sur l’eau libre, loin du bord', 'Boule jaune posée sur l’eau', 'calme, somnolence', 'alchimiste'],
    ['scrofulaire', 'rives', 'Tige carrée ailée, fleurs comme des bouches', 'arrête le sang (aussi sur une plaie)', 'guérisseuse'],
    ['guimauve_off', 'rives', 'Feuilles de velours et fleurs rose pâle', 'remède, calme', 'guérisseuse'],
    ['macre', 'flotte sur l’eau libre, près du bord', 'Rosette flottante et noix à cornes', 'nourrit (6)', 'aubergiste'],
    ['acore', 'les pieds dans l’eau du bord', 'Feuilles d’iris qui sentent l’agrume', 'chaleur, remède, vigueur', 'alchimiste'],
    ['fritillaire', 'prés du bord du lac', 'Cloche à damier pourpre', 'nausée, vomissements, parfois paralysie (poison)', 'alchimiste'],
    ['lobelie', 'sous l’eau claire du bord, la fleur dehors', 'Clochettes lilas sortant de l’eau', 'vomissements… (voir ce qui se cache)', 'alchimiste'],
  ],
};

// ---------------------------------------------------------------- les bêtes : trois fiches (trois façons de paraître)
// { id, t, s, milieux, paraitre: [...], objets: [[[objets], d’où, qui l’achète, usage]], autres: [[titre, [...]]], secret: [[bêtes, texte]] }
const BETES_FICHES = [
  {
    id: 'sys:betes-pres', t: 'Les bêtes des prés, de la ferme et de la ville', s: 'Trente bêtes qui naissent autour de soi, à leur heure',
    milieux: ['plaine', 'ferme', 'ville'],
    lead: 'Trente bêtes, dix par milieu : les prés, la ferme (quarante mètres autour de la vieille ferme, et ses abords), la ville (la ville fortifiée et ses abords). Toutes ont leur notice dans le **livre des bêtes** (le colporteur le vend), rangée sous « les prés », « les fermes » ou « les villes et les villages ».',
    paraitre: [
      'Elles naissent autour de soi, jamais sous les yeux s’il se peut, dans leur milieu, à leur heure, par le temps qui leur convient, puis s’en vont au bout de quelques minutes (elles s’envolent, rentrent au trou, s’éloignent).',
      'Chaque espèce est là une part du temps selon sa rareté : une commune six fois sur dix environ, une peu commune un peu plus d’une fois sur trois, une rare une fois sur sept (quand tout lui convient). En moyenne, on attend une commune deux à trois minutes, une rare une demi-heure ou plus.',
      'Quelques groupes à la fois seulement (huit au plus, quarante-cinq bêtes en tout, bandes comprises).',
      'Rien n’est ajouté au monde : leurs lieux (le nid de frelons, les toiles, l’âtre, les nids d’hirondelles, la corbeautière, le sommet du clocher, les réverbères, les douves, le lavoir) se déduisent de la vallée, toujours les mêmes pour une graine. Les parties anciennes se chargent telles quelles.',
    ],
    objets: [
      [['plume_faucon'], 'la crécerelle, le pèlerin', 'l’alchimiste, le chasseur', 'alchimie'],
      [['plume_rapace'], 'la buse', 'l’alchimiste, le chasseur, la guérisseuse', 'alchimie'],
      [['hanneton'], 'au filet, ou à la main', 'le maire (le hannetonnage), l’alchimiste, le pêcheur', 'alchimie, appât'],
      [['sauterelle'], 'au filet, ou à la main', 'le pêcheur, l’alchimiste', 'alchimie, appât'],
      [['machaon', 'grand_paon'], 'au filet', 'le maire, le colporteur', 'collection'],
      [['escargot'], 'à la main', 'l’aubergiste, la guérisseuse', 'cru, on le regrette (nausée, coliques) ; six, avec une gousse d’ail, au feu : des escargots à l’ail'],
      [['escargots_cuits'], 'au feu (six escargots, une gousse d’ail)', 'l’aubergiste', 'nourrit bien, et soigne un peu'],
      [['musc_putois'], 'le putois', 'l’alchimiste', 'alchimie'],
      [['toile_epeire'], 'la toile d’une épeire (E)', 'l’alchimiste, la guérisseuse', 'arrête un saignement (comme le plantain) ; alchimie'],
      [['nid_frelon'], 'le nid, vide', 'l’alchimiste', 'alchimie'],
      [['peau_putois', 'peau_fouine', 'peau_belette'], 'le putois, la fouine, la belette', 'le chasseur, le colporteur', 'vente'],
    ],
    autres: [
      ['La chasse et le filet', [
        'Le fusil et l’arc pour les oiseaux et les petites bêtes ; le **filet à papillons** pour le hanneton, la sauterelle, le machaon et le grand paon de nuit ; la main (E) pour l’escargot, le hanneton posé, la sauterelle (accroupi : elle saute une fois sur deux) et la toile d’épeire.',
        'Les pièges laissés la nuit dans les prés prennent aussi des belettes et des putois ; dans les bois, des fouines.',
      ]],
      ['Les dangers', [
        '**Les frelons** : à cinq mètres du nid, l’un d’eux vient tourner autour de la tête (on l’entend, on le voit) ; si l’on reste plus de quatre secondes à moins de 2,8 m, si l’on passe à moins de 1,6 m ou si l’on frappe le nid, ils sortent tous et piquent : trois piqûres au plus (5 à 9 points de vie chacune, un peu de nausée), une douzaine de secondes ; ils lâchent qui s’éloigne de 26 m ou s’abrite.',
        '**Le surmulot** acculé (on le suit de tout près plus d’une seconde) mord une fois (3 à 5 points de vie).',
        '**Le putois** acculé lâche son odeur : la nausée, une demi-minute.',
      ]],
      ['Leurs cris', [
        'Synthétisés, doux et rares, joués là où est la bête (le réglage « Ambiance » les règle) ; quand la voix d’un milieu a déjà le chant d’une espèce (la caille, la chevêche, le petit-duc, la buse, la crécerelle), la bête qu’on voit prend le sien.',
      ]],
    ],
    secret: [
      [['frelon'], '**Le nid de frelons** : on ne prend un nid que vide — par grand froid (neige, gelée), les frelons engourdis ne sortent plus, et le nid se prend à la main (E). Une colonie nouvelle s’y installe quarante jours plus tard.'],
      [['hanneton'], '**Un soir sur quatre est un soir à hannetons** (d’après la graine et le jour) : ils sont alors sept à onze autour de l’arbre, et trois fois plus souvent.'],
      [['hirondelle_f'], '**Les hirondelles volent bas quand la pluie vient** : si le temps du jour annonce la pluie ou l’orage dans les trois heures, elles tournent au ras des toits et des pavés.'],
      [['cheveche'], '**La chevêche chante sur le toit de qui va mourir** : la nuit, quand le fermier est très mal en point (moins de 35 points de vie), elle vient quatre fois plus souvent, se pose sur le faîte de la maison, et crie plus souvent.'],
      [['grillon_foyer'], '**Le grillon du foyer se tait quand quelque chose rôde** (le tueur, une nuit rouge, la peur) ; le tuer porte malheur : la maison reste muette vingt jours, et la première nuit on le remarque.'],
      [['etourneau'], '**L’étourneau imite** : de temps en temps, sa bande pousse le miaulement de la buse ou le sifflet du berger.'],
      [['pelerin'], '**Le pèlerin prend un pigeon** une fois sur trois quand il pique sur la place (des plumes grises).'],
      [['belette', 'crecerelle'], '**La belette chasse les campagnols** ; **le faucon crécerelle** aussi, quand il tombe dans l’herbe.'],
      [['epeire'], '**Qui passe au travers d’une toile** la déchire (elle se refait le lendemain).'],
      [['hirondelle_f'], '**Tuer une hirondelle** : on dit que cela porte malheur à toute la maison (une pensée, rien de plus).'],
    ],
  },
  {
    id: 'sys:betes-lande', t: 'Les bêtes de la lande, des hauteurs et du lac', s: 'Trente bêtes, chacune ses territoires',
    milieux: ['lande', 'hauteurs', 'lac'],
    lead: 'Trente espèces vraies de la faune française du XIXᵉ siècle, dix par milieu. Toutes figurent au **livre des bêtes** (le bestiaire du marchand), rangées d’après leur premier milieu, avec leur rareté et, pour deux d’entre elles, un avertissement (« Peut se défendre. », « Dangereux. »). Une bête vue de ses yeux est cochée au livre.',
    paraitre: [
      'Chaque espèce a ses **territoires**, tirés de la graine de la partie : le busard a sa lande, la pie-grièche son buisson, le tichodrome et le grand-duc leur paroi, le gypaète sa falaise, les foulques et les harles leur eau libre, le rat d’eau et la couleuvre vipérine leur berge. On retrouve une bête là où on l’a vue.',
      'Une bête ne paraît que si l’on approche de son territoire (de 45 m pour un scarabée à 200 m pour un vautour), à **son heure** et par **son temps**, et elle s’en va quand l’heure passe ou que le temps tourne (hors de vue de préférence). Peu de bêtes à la fois : seize environ pour ces trente espèces (une troupe entière ou rien).',
      '**Tuée ou prise au filet**, sa place reste vide : un jour pour une commune, trois pour une peu commune, six pour une rare, douze pour une très rare. Les autres de la troupe s’en vont.',
      'Rien de tout cela n’est un objet du monde : les parties anciennes se chargent telles quelles.',
    ],
    objets: [
      [['plume_huppe'], 'la huppe', 'l’alchimiste', 'alambic'],
      [['peau_genette'], 'la genette (une dépouille à dépecer)', 'le chasseur', 'vente'],
      [['minotaure', 'sphinx_tete_mort'], 'au filet', 'l’alchimiste, le brocanteur', 'alambic, trésor ; le sphinx crie quand on le prend'],
      [['apollon'], 'au filet', 'le maire, le brocanteur', 'collection'],
      [['plume_gypaete'], 'le gypaète', 'l’alchimiste, le maire', 'la plus rare'],
      [['plume_tichodrome', 'plume_balbuzard', 'plume_cormoran'], 'le tichodrome, le balbuzard, le cormoran', 'l’alchimiste', 'alambic'],
      [['plume_lyre'], 'le tétras lyre', 'le chasseur', '« elle dit qu’on a eu le coq »'],
      [['peau_vison'], 'le vison', 'le chasseur', 'vente'],
      [['os_gypaete'], 'tombé du ciel', 'l’alchimiste', 'alambic'],
    ],
    autres: [
      ['La chasse', [
        'Toutes se tirent (fusil, arc). Les oiseaux et les petites bêtes laissent leur butin d’un coup ; la genette laisse une dépouille à dépecer (E).',
        'Les perdrix rouges, les bartavelles, les tétras lyres et les oies cendrées sont du **gibier** pour [[sys:chasseurs|les chasseurs du Chassedi]]. La genette se prend parfois, la nuit, dans un piège laissé tendu sur la lande.',
        'Le filet à papillons prend le sphinx, l’apollon et le minotaure (une fois sur dix, il manque).',
      ]],
      ['Les dangereuses', [
        '**La vipère péliade** siffle avant de mordre (le venin), si l’on passe tout près debout ; **la couleuvre vipérine** fait mine de mordre ; la nuit, près de son rocher, **le grand-duc** fait face, ouvre ses ailes et fait claquer son bec.',
      ]],
    ],
    secret: [
      [['gypaete'], '**Le gypaète et son ossuaire.** De loin (entre 35 et 220 m), on le voit parfois monter très haut au-dessus de sa falaise, lâcher un os qui tombe et éclate sur les rochers (on l’entend), puis descendre le manger. Les éclats restent sur les rochers : on les ramasse (E) — l’**os brisé**. Il recommence toutes les deux à quatre minutes, pas plus de trois éclats à la fois. S’approcher à moins de 35 m le fait partir.'],
      [['vautour_fauve'], '**Les vautours et les bêtes mortes.** Une bête abattue (et laissée là) dans les hauteurs attire les vautours qui tournaient au-dessus : quand on s’éloigne à plus de 40 m, ils descendent en spirale et se posent autour ; ils repartent lourdement si l’on revient à moins de 18 m.'],
      [['grand_duc'], '**Le grand-duc, la nuit.** Près de son rocher, à moins de 9 m, il fait face, ouvre les ailes et fait claquer son bec : c’est l’avertissement. Qui reste à moins de 3,5 m au-delà de trois secondes, ou s’approche à moins de 1,7 m, est griffé (6 points de vie, une égratignure qui saigne un peu) ; puis il part se poser plus loin et ne recommence pas avant une minute et demie. Le jour, il s’envole sans rien dire.'],
      [['sphinx_tete_mort'], '**Le sphinx et la lanterne.** Sur la lande, la nuit, une lanterne allumée l’attire : il vient tourner autour de la tête, tout près, et crie. On le prend alors facilement au filet. On dit qu’il annonce un mort dans la maison où il entre.'],
      [['pie_grieche'], '**Le lardoir de la pie-grièche.** Sur les épines de son buisson : un hanneton, une sauterelle, un jeune lézard.'],
      [['tetras_lyre'], '**La parade du tétras.** À l’aube (de 4 h 30 à 8 h 30), sur les alpages : il faut rester à plus de 20 m (accroupi, on s’approche mieux) pour les voir faire la roue et les entendre roucouler.'],
      [['salamandre_noire'], '**La salamandre noire** ne sort qu’après la pluie (pendant environ trois heures de jeu), ou sous la pluie, ou dans le brouillard.'],
      [['couleuvre_viperine'], '**La couleuvre vipérine** n’est pas une vipère : elle siffle et fait mine de mordre, mais au pire elle pince (un point de vie, et seulement si l’on va bien).'],
    ],
  },
  {
    id: 'sys:betes-bois', t: 'Les bêtes des bois et du marais', s: 'Trente bêtes de la forêt, du bois de bouleaux et du marais',
    milieux: ['foret', 'bouleaux', 'marais'],
    lead: 'Trente espèces vraies de la faune française du XIXᵉ siècle, dix par milieu. Toutes figurent au **livre des bêtes** (le bestiaire du marchand), rangées d’après leur premier milieu (la vieille forêt, les bois de bouleaux, le marais), avec leur rareté ; deux portent l’avertissement « Peut se défendre. » (le daim, l’autour), et la coronelle mord si on la prend. Une bête vue de ses yeux est cochée au livre.',
    paraitre: [
      'Chaque espèce a ses **territoires**, tirés de la graine de la partie, dans son milieu et à sa place : un arbre pour les pics, l’autour, le moyen-duc, l’oreillard et le muscardin ; un vieux chêne pour le capricorne ; un bouleau pour le morio ; une rive pour les échassiers, le râle, la bécassine, la rainette et la crossope ; l’eau pour la poule d’eau et les sangsues ; le ciel pour la bondrée et le busard ; une ornière pleine d’eau pour le sonneur. Les plus répandues ont huit à dix territoires (cinq au plus au marais, qui est petit), les rares deux à cinq, les très rares un seul (la cigogne noire n’a qu’une mare dans toute la forêt). On retrouve une bête là où on l’a vue. En se promenant un kilomètre en forêt, de jour, on en croise une demi-douzaine.',
      'Elle paraît quand on approche de son territoire (de 40 m pour une sangsue à 170 m pour un rapace), **à son heure** et **par son temps**, si le territoire est habité ce jour-là (neuf jours sur dix pour une commune, un sur deux pour une très rare). Elle ne naît jamais sous les yeux ; elle s’en va quand on s’éloigne, quand son heure passe ou que le temps tourne (hors de vue). **Dérangée** (levée trois fois, effrayée), elle quitte les lieux jusqu’au lendemain.',
      '**Tuée ou prise**, sa place reste vide : un jour pour une commune, trois pour une peu commune, six pour une rare, douze pour une très rare. La harde d’un daim tué s’en va.',
      'Peu de bêtes à la fois : six groupes au plus (une harde compte pour un), les territoires les plus proches d’abord. Rien de tout cela n’est un objet du monde : les parties anciennes se chargent telles quelles.',
      '**Le marais** : la carte des milieux de la vallée n’a pas de marais (une particularité ancienne de la génération) ; pour ces bêtes, le marais, ce sont les douze mares du marais, au sud-ouest de la ferme, et le bas-fond qui les entoure (environ cent mètres autour).',
    ],
    objets: [
      [['bois_daim'], 'le daim mâle, dépecé (souvent)', 'le chasseur, le colporteur', 'vente ; alchimie'],
      [['plume_peintre'], 'la bécasse (une ou deux)', 'le chasseur, le colporteur', 'vente ; alchimie'],
      [['plume_aigrette'], 'l’aigrette', 'le colporteur, la colporteuse', 'vente (les modistes) ; alchimie'],
      [['sangsue'], 'le marais (à la main, ou aux jambes)', 'l’alchimiste, la guérisseuse', 'posée sur la peau (clic) : elle boit le venin d’une vipère et calme la nausée ; on y perd un peu de sang ; alchimie'],
      [['capricorne', 'cicindele'], 'au filet, ou à la main', 'le maire (sa collection)', 'vente ; alchimie'],
      [['grand_mars', 'morio', 'cuivre_marais'], 'au filet', 'le maire', 'vente ; alchimie'],
    ],
    autres: [
      ['Ceux qui se défendent', [
        '**Le daim mâle** fait face, rait, gratte le sol, puis charge si l’on avance ; **l’autour** crie, puis pique sur qui s’attarde sous son arbre ; **la coronelle** et **la crossope** mordent si on les prend à la main.',
      ]],
      ['La chasse, le filet, la main', [
        'La chasse donne la viande, le cuir et les plumes ; le **bois du daim** mâle ; la **plume du peintre** de la bécasse ; les **aigrettes** que paient les modistes. Le **filet** prend le grand mars, le morio, le cuivré, le capricorne et la cicindèle, pour la collection du maire ; la main (E) le capricorne, la cicindèle (une fois sur deux, elle file entre les doigts) et une sangsue.',
        'Leurs **cris** sont synthétisés, doux et rares, placés là où est la bête.',
      ]],
    ],
    secret: [
      [['daim'], '**Le daim mâle qui tient tête** : un mâle sur trois ne fuit pas. Là où les autres détalent (à vingt-quatre mètres), il fait face, la tête basse ; à moins de dix-huit mètres il **rait** (un grognement rauque) ; si l’on reste plus de deux secondes à moins de six mètres (accroupi, on a plus de temps) ou qu’on arrive en courant, il charge, sept fois sur dix (sinon il s’en va) : un coup de bois (8 à 14 points, une plaie qui saigne un peu), puis il fuit et ne recommence pas avant une minute et demie. Blessé, un mâle charge une fois sur trois.'],
      [['autour'], '**L’autour qui défend son arbre** : on le fait fuir en approchant debout ; mais qui s’attarde accroupi sous son arbre (moins de neuf mètres) l’entend crier, puis le voit fondre sur lui : quelques griffures (3 à 6 points), puis il s’en va pour la journée.'],
      [['sangsue'], '**Les sangsues** : dans l’eau du marais jusqu’aux mollets, toutes les deux secondes, une chance sur dix qu’une sangsue se colle (davantage si l’on reste ; six au plus) — « (Quelque chose de froid s’est collé à votre mollet.) ». Les sangsues visibles de la rive nagent vers qui entre dans l’eau. En ressortant, on les détache : elles vont dans la sacoche, et les morsures saignent un peu. Posée sur la peau (clic avec la sangsue en main), une sangsue retire une bonne part du venin d’une vipère et calme la nausée, pour deux points de vie.'],
      [['becasse'], '**La plume du peintre** : la bécasse porte au coude de l’aile une petite plume raide dont les peintres de miniatures font des pinceaux d’un seul poil ; on la trouve sur chaque bécasse tirée.'],
      [['grand_mars'], '**Le grand mars** paraît brun ; vu sous le bon angle (face à vous, ou de dos), ses ailes deviennent violettes.'],
      [['grand_mars', 'morio', 'cuivre_marais', 'cicindele'], '**Le filet** : un papillon posé se prend presque à coup sûr ; en vol, une fois sur deux (accroupi, sept fois sur dix) — manqué, il s’effraie. La cicindèle, à la main, file entre les doigts une fois sur deux.'],
      [['bondree'], '**La bondrée** déterre parfois un nid de guêpes (vingt à quarante secondes au sol) : c’est le seul moment où on la voit de près.'],
      [['rale_eau', 'sonneur', 'becasse', 'becassine', 'oreillard'], '**Entendre sans voir** : le râle d’eau crie depuis les roseaux ; le sonneur chante à la nuit tombée ; la croule de la bécasse et le bêlement de la bécassine se font au crépuscule ; l’oreillard ne fait presque aucun bruit.'],
      [['daim'], 'Les chasseurs posent des pièges dans les bois : un daim peut s’y prendre la nuit.'],
    ],
  },
];

// ---------------------------------------------------------------- les bêtes, milieu par milieu : [bête, quand, ce qu’elle fait, ce qu’elle donne]
const BETES = {
  plaine: [
    ['crecerelle', 'jour, sans pluie', 'tourne au-dessus des prés, s’arrête en l’air face au vent (« le Saint-Esprit »), tombe dans l’herbe (parfois sur un campagnol), se pose sur un arbre', 'plume de faucon'],
    ['buse', 'jour, sans pluie', 'larges cercles très haut, miaulements ; parfois des minutes sur un arbre ; trois robes (sombre, brune, pâle)', 'rémige de buse (1-2)'],
    ['caille', 'de 4 h à 23 h', 'cachée dans l’herbe : on l’entend (« paye tes dettes »), elle part sous les pieds (à 4 m, 2 m accroupi), file au ras de l’herbe et retombe', 'viande (parfois), plume'],
    ['vanneau', 'jour', 'bandes de 4 à 8 dans les prés humides (ou les grands prés plats) ; à 26 m, toute la bande se lève et tourne en criant « pi-ouit », puis se repose plus loin', 'plume, viande (parfois)'],
    ['outarde', 'jour, sans pluie', 'une à trois, dans les grands prés plats ; s’éloigne à pied dès 75 m, s’envole à 48 m (ailes blanches ; celles du mâle sifflent) ; après trois alertes, elle quitte le pays', 'viande (1-2), plumes'],
    ['belette', 'jour', 'par bonds ; se dresse pour regarder (5 à 16 m) ; à 6 m disparaît, reparaît plus loin (trois fois) ; chasse les campagnols', 'peau de belette (souvent)'],
    ['campagnol_champs', 'toujours', 'petits groupes ; courses et arrêts ; plonge au trou à 4 m (2 m accroupi)', '—'],
    ['hanneton', 'soir (19 h 20 – 21 h 40), sans pluie ni froid', 'vol lourd et bourdonnant autour d’un arbre ; certains se posent ; après 21 h 30 tous se posent', 'se prend au filet, ou posé à la main (E)'],
    ['sauterelle', '11 h – 21 h 30, sans pluie', 'immobile dans l’herbe ; grésille l’après-midi ; saute à 1,5 m (0,7 m accroupi), parfois s’envole', 'à la main, accroupi (E ; elle saute une fois sur deux), ou au filet'],
    ['machaon', '10 h – 17 h, beau temps', 'danse au-dessus des fleurs, se pose ailes ouvertes ; fuit qui approche vite ; après cinq frayeurs, s’en va', 'au filet'],
  ],
  ferme: [
    ['cheveche', '17 h 30 – 8 h', 'sur les perchoirs de la ferme (faîte de la maison, boîte aux lettres, épouvantail, poteaux, tas de bois, arbres) ; regarde, hoche la tête ; s’en va à 6 m (9 m avec la lanterne) ; crie le soir ; descend parfois au sol', 'plume de hibou'],
    ['putois', '21 h 30 – 4 h 30', 'rôde vers les murs de la ferme ; le chien l’aboie ; fuit à 12 m ; acculé (à 3 m, deux secondes) il lâche son odeur : nausée', 'peau de putois, musc de putois (souvent)'],
    ['lerot', '21 h – 5 h', 'le long des murs de la maison, grimpe, siffle ; la nuit, de l’intérieur, on l’entend au grenier', '—'],
    ['rat_noir', '19 h – 6 h', 'le long des murs, du tas de bois, des tonneaux ; file à 6 m', '—'],
    ['bergeronnette', '6 h 30 – 19 h 30', 'court dans la cour, s’arrête, hoche la queue ; vole par bonds à 5,5 m en criant « tsilitt »', 'plume (parfois)'],
    ['etourneau', '7 h – 18 h 30', 'bandes de 7 à 12 dans les prés autour de la ferme ; partent ensemble à 15 m', 'plume, viande (parfois)'],
    ['esculape', '9 h 30 – 18 h, beau temps', 'au soleil sur les pierres et le tas de bois ; file à 4 m ; une fois sur deux grimpe à un arbre voisin', 'mue (parfois)'],
    ['frelon', 'jour, sans froid', 'autour de leur nid, dans un vieil arbre près de la ferme', 'le nid, vide (voir « Ce qui se cache »)'],
    ['grillon_foyer', '20 h – 5 h', 'dans l’âtre de la maison (et au four de la boulangerie) ; chante par séries ; se montre parfois sur la pierre de l’âtre', '—'],
    ['epeire', 'toujours', 'au centre de sa toile, tête en bas, autour de la ferme (poteaux, épouvantail, buissons, coins de la maison) ; la toile brille de rosée le matin', 'la toile (E)'],
  ],
  ville: [
    ['hirondelle_f', '6 h 30 – 20 h, sans froid', '6 à 9 tournent autour des maisons ; entrent dans leurs nids de boue sous les avant-toits (trois maisons)', '—'],
    ['choucas', '6 h – 20 h 30', 'au sommet du clocher ; culbutes autour de la tour ; descendent parfois picorer sur la place ; « tchak »', 'plume noire'],
    ['freux', '6 h 30 – 20 h', 'le jour en bande dans les prés autour de la ville ; le soir (après 17 h 30) sur les nids de la corbeautière, un bouquet de grands arbres hors les murs', 'plumes noires'],
    ['pelerin', '7 h – 19 h', 'à la pointe du clocher, des minutes ; tourne très haut ; pique sur les pigeons de la place (l’air siffle)', 'plumes de faucon'],
    ['petit_duc', '20 h 30 – 5 h, sans froid', 'dans un arbre de la ville ; « tiou » toutes les trois secondes, par séries ; à la lanterne il se fait mince et droit', 'plume de hibou (souvent)'],
    ['surmulot', '19 h – 6 h', 'au bord des douves et du lavoir ; file vers l’eau et nage', '—'],
    ['fouine', '22 h – 4 h 30', 'court sur les faîtes des toits, saute d’un toit à l’autre (on l’entend trotter) ; aussi sur la maison de la ferme', 'peau de fouine'],
    ['alyte', '20 h 30 – 4 h, sans froid', 'près du lavoir et des murs ; flûte par séries ; se tait quand on approche ; le mâle porte un chapelet d’œufs jaunes', 'venin de crapaud (parfois)'],
    ['grand_paon', '21 h – 3 h, sans pluie ni vent', 'tourne autour d’un réverbère, s’y cogne ; se pose sur le poteau, ailes à plat', 'au filet'],
    ['escargot', 'la nuit, ou après la pluie', 'sur les murs de la ville et de la ferme ; rentre dans sa coquille quand on s’approche', 'à la main (E)'],
  ],
  lande: [
    ['lezard_vert', 'le jour, **au soleil seulement**', 'se chauffe sur les pierres, file dans la bruyère et s’y cache', 'rien'],
    ['calamite', 'la nuit', 'court plus qu’il ne saute ; chante (un roulement sec), surtout après la pluie', 'venin de crapaud (une fois sur deux)'],
    ['perdrix_rouge', 'le jour', 'en compagnie de trois à six ; toute la compagnie part à la fois ; le mâle chante au petit jour et au crépuscule', 'viande, plume'],
    ['pie_grieche', 'le jour', 'perchée au sommet d’un buisson ; descend prendre un insecte et remonte ; change de buisson si l’on approche', 'plume'],
    ['huppe', 'le jour', 'fouille le sol ; ouvre sa huppe et se fige quand on s’arrête près d’elle ; « oup-oup-oup »', 'plume de huppe'],
    ['oedicneme', 'crépuscule et nuit (présent le jour)', 'le jour il se plaque au sol ; de trop près il court ; tout près il s’envole ; crie au crépuscule', 'plumes, parfois de la viande'],
    ['busard_sm', 'le jour', 'rase la lande à hauteur d’homme, les ailes en V, et se laisse tomber sur ce qui bouge', 'plumes'],
    ['minotaure', 'la nuit', 'marche sur le sable, rentre parfois dans son puits', '**au filet** : le minotaure'],
    ['genette', 'la nuit', 'dérangée, file vers un arbre ou un rocher et disparaît ; ses yeux luisent', 'peau de genette (dépouille à dépecer)'],
    ['sphinx_tete_mort', 'la nuit', 'vol rapide et heurté au ras de la bruyère ; **la lanterne l’attire** ; il crie de près', '**au filet** : le sphinx (il crie quand on le prend)'],
  ],
  hauteurs: [
    ['campagnol_neiges', 'toujours', 'dans les éboulis, jusqu’aux neiges ; rentre dans une fente au moindre bruit', 'rien'],
    ['bartavelle', 'le jour', 'en compagnie, sur les pentes rocheuses ; **remonte la pente en courant**, puis s’envole **vers le bas**', 'viande, plume'],
    ['tetras_lyre', 'le jour', '**à l’aube, les coqs paradent** (roucoulements, souffles) ; le reste du jour ils picorent ; partent dans un fracas d’ailes', 'viande, plumes de tétras lyre'],
    ['peliade', 'le jour, pas sous la pluie', 'se chauffe sur les pierres ; **siffle, puis mord** si l’on passe tout près debout (venin)', 'venin, mue'],
    ['salamandre_noire', '**après la pluie** (ou sous la pluie, ou dans le brouillard)', 'lente, dans les pâturages', 'rien'],
    ['apollon', 'le jour, au soleil', 'plane au-dessus des éboulis fleuris, se pose ; fuit qui approche vite', '**au filet** : l’apollon'],
    ['tichodrome', 'le jour', 'grimpe aux parois à petits bonds en ouvrant ses ailes rouges', 'plume de tichodrome'],
    ['grand_duc', 'crépuscule et nuit', 'sur son rocher ; chante la nuit (« ou-hou ») ; voir « Ce qui se cache »', 'plumes de hibou'],
    ['vautour_fauve', 'le jour (9 h – 17 h 30), par beau temps', 'tournent par bandes, très haut ; descendent sur une bête morte', 'plumes'],
    ['gypaete', 'le jour', 'longe les falaises ; laisse tomber des os sur les rochers', 'plume de gypaète'],
  ],
  lac: [
    ['foulque', 'toujours', 'en petite troupe sur l’eau ; plonge un instant ; **court sur l’eau** quand on approche', 'viande, plume'],
    ['mouette', 'le jour', 'tournent au-dessus du lac en riant, se posent sur l’eau un moment', 'plume'],
    ['guignette', 'le jour', 'au bord de l’eau, la queue qui hoche ; part au ras de l’eau en criant', 'plume (parfois)'],
    ['campagnol_amphibie', 'toujours', 'mange assis ; au moindre bruit, un « plouf »', 'parfois de la viande'],
    ['couleuvre_viperine', 'le jour', 'menacée, se dresse, siffle, fait mine de mordre, puis file à l’eau', 'mue (parfois)'],
    ['oie_cendree', 'le jour', 'la troupe paît sur la berge, une sentinelle garde le cou levé ; à l’alarme, toutes gagnent l’eau ; de trop près, toutes s’envolent et vont se poser loin sur le lac', 'viande, plumes'],
    ['harle', 'le jour', 'plonge longtemps et ressort loin ; de trop près, part au ras de l’eau', 'plumes, parfois de la viande'],
    ['cormoran', 'le jour', 'nage enfoncé, plonge ; **sèche ses ailes en croix** sur une pierre de la rive', 'plumes de cormoran'],
    ['balbuzard', 'le jour', 'tourne au-dessus du lac, fait le « Saint-Esprit », plonge et emporte son poisson sur un arbre de la rive', 'plumes de balbuzard'],
    ['vison', 'crépuscule et nuit', 'court le long de la berge ; de trop près, plonge et reparaît bien plus loin', 'peau de vison'],
  ],
  foret: [
    ['daim', 'de l’aube au soir', 'en harde de deux à quatre, un mâle une fois sur deux (les palettes) ; broute, fuit de loin, le miroir blanc levé ; toute la harde part avec lui ; le mâle rait à la tombée du jour', 'dépouille à dépecer : viande, cuir ; le mâle, souvent, son **bois**'],
    ['pic_noir', 'le jour', 'accroché au tronc, le corps dressé ; tambourine longuement ; un cri plaintif ; dérangé, file vers un autre arbre (« krri-krri »)', 'plume noire'],
    ['becasse', 'toujours', 'tapie au sol, elle ne part qu’au dernier moment, en zigzag ; au crépuscule (et à l’aube), elle « croule » au-dessus des arbres en grognant', 'viande, **plume du peintre**'],
    ['sonneur', 'toujours (chante le soir, la nuit, sous la pluie)', 'dans l’ornière ou au bord de l’eau ; une petite cloche fêlée ; de trop près, il se tourne et montre son ventre jaune', 'parfois du venin de crapaud'],
    ['oreillard', 'la nuit', 'vole lentement autour d’un arbre, s’arrête en l’air', 'aile de chauve-souris'],
    ['autour', 'le jour', 'sur une branche, sous le feuillage ; dérangé, file entre les troncs (« kia-kia-kia »)', 'plumes'],
    ['coronelle', 'le jour, au soleil', 'lente ; se dresse et siffle de près ; **mord si on la prend** (E)', 'parfois une mue'],
    ['capricorne', 'au crépuscule et la nuit', 'sur l’écorce d’un vieux chêne, il monte lentement ; vole lourdement en bourdonnant', '**au filet ou à la main** : le capricorne (il grince)'],
    ['grand_mars', 'le matin, au soleil', 'vole haut, à la cime, et descend boire au sol', '**au filet** : le grand mars'],
    ['cigogne_noire', 'le jour', 'au bord d’une mare de la forêt ; très farouche, s’envole de loin', 'plumes noires'],
  ],
  bouleaux: [
    ['pic_epeiche', 'le jour', 'au tronc ; tambourinage bref et sec ; « kik »', 'plume'],
    ['musaraigne', 'toujours', 'de courtes courses dans les feuilles ; des cris aigus', 'rien'],
    ['lezard_vivipare', 'le jour, au soleil', 'file sous la mousse', 'rien'],
    ['grenouille_rousse', 'toujours (plus souvent sous la pluie)', 'bonds en zigzag ; ronronne doucement la nuit', 'parfois de la viande (les cuisses)'],
    ['moyen_duc', 'la nuit', 'sur une branche, suit des yeux ; dérangé, claque des ailes et change d’arbre ; « hou » sourd', 'plumes de hibou'],
    ['muscardin', 'la nuit', 'au pied des arbres ; inquiété, file dans les branches', 'rien'],
    ['cicindele', 'le jour, au soleil', 'courses vives, s’envole et se repose trois pas plus loin', '**au filet**, ou à la main une fois sur deux : la cicindèle'],
    ['gelinotte', 'le jour', 'tapie, puis un grand fracas : elle se pose dans un arbre, contre le tronc ; un sifflement très fin', 'viande, plumes'],
    ['bondree', 'le jour', 'tourne haut au-dessus des bois ; parfois se pose et **déterre un nid de guêpes** (la terre vole) ; « pi-u-u »', 'plumes'],
    ['morio', 'le jour, au soleil', 'se pose sur l’écorce des bouleaux', '**au filet** : le morio'],
  ],
  marais: [
    ['poule_eau', 'le jour', 'nage en hochant la tête ; inquiète, **court sur l’eau** jusqu’aux roseaux et s’y cache', 'viande, plume'],
    ['busard_roseaux', 'le jour', 'rase les roseaux, les ailes en V, se laisse tomber', 'plumes'],
    ['rale_eau', 'toujours', 'caché : on l’entend crier comme un goret ; il sort parfois, la queue relevée, et rentre', 'parfois de la viande, plume'],
    ['becassine', 'de l’aube au soir', 'sonde la vase ; part sous les pieds avec un cri rauque, en zigzag ; **au crépuscule, elle monte et bêle en tombant** (la chèvre volante)', 'viande, plume'],
    ['rainette', 'toujours (chante la nuit)', 'sur un roseau, à mi-hauteur ; de trop près, elle saute et disparaît', 'rien'],
    ['sangsue', 'toujours', 'nage sous la surface, près de la rive ; **vient à qui entre dans l’eau**', '**à la main** (E) : la sangsue'],
    ['bihoreau', 'le jour perché, la nuit au bord de l’eau', 'le jour, voûté sur une branche près de l’eau ; au crépuscule, part pêcher (« couac »)', 'plumes'],
    ['aigrette', 'le jour', 'à pas lents au bord de l’eau ; s’envole de loin', '**plumes d’aigrette** (les modistes)'],
    ['crossope', 'toujours', 'sur la rive ; plonge dans un nuage de bulles d’argent et reparaît plus loin ; **mord si on la prend**', 'rien'],
    ['cuivre_marais', 'le jour, au soleil', 'vole bas, se pose sur les fleurs', '**au filet** : le cuivré'],
  ],
};

// ---------------------------------------------------------------- le hasard de la vallée : ce qu’on en dit
const HASARD_TEXTES = {
  lead: 'Soixante et un événements, rares ou peu fréquents, qui s’ajoutent à ceux d’avant (le calendrier des nuits noires, de la neige et du soleil écrasant, [[ev:prodiges|les prodiges]], l’étrange des nuits, [[sys:divins|les Trois]], [[sys:maledictions|les malédictions]]) sans les refaire. Six familles : le ciel et le temps, les bêtes, la vie des villages, la ferme, les routes, l’étrange. Chacun a sa condition (le lieu, l’heure, le temps qu’il fait ou qu’il fera, le jour de la semaine, ce qu’on a ou ce qu’on a fait), quelque chose à voir, à entendre ou à faire, une fin, et une trace.',
  comment: [
    '**Le tirage du jour**, à l’aube, est fixé d’avance (la graine de la partie et le numéro du jour) : certains jours un événement est prévu, rarement deux, à une heure tirée dans sa fenêtre (la noce vers onze heures, l’enterrement vers trois heures, le renard après dix heures du soir…). Un almanach pourrait le prédire ; les habitants annoncent la veille ce qui se prépare au village (la noce, l’enterrement, les saltimbanques, la procession).',
    'Il faut d’ordinaire **être là** (en ville pour la noce, à la ferme pour le renard, sur un chemin hors des villages pour la diligence, dehors pour les choses du ciel). Si l’on n’y est pas, ou si l’on dort, l’événement se fait **sans nous** (on l’apprend le lendemain par les habitants) ou pas du tout. Trois ont des conséquences même en notre absence : le renard prend une poule (sept fois sur dix ; trois et demie sur dix quand le chien veille), les sangliers retournent des rangs, la procession des Rogations bénit les champs.',
    '**Au fil du temps**, quinze autres arrivent là où l’on se trouve, tant de fois par heure de jeu passée au bon endroit : au bord du lac au coucher du soleil, la nuit près d’un puits, dans les bois au crépuscule, sur les chemins la nuit.',
    'En tout, **un événement par jour environ** (un peu plus quand l’esprit est très sombre) ; **jamais plus de deux le même jour**, jamais deux à moins d’une heure et demie l’un de l’autre, jamais le même deux fois en quelques jours (de quatre jours pour le panier à quarante pour les cigognes), rien les deux premiers jours. Les événements étranges viennent plus souvent quand l’esprit du personnage s’assombrit, comme le reste de l’étrange.',
  ],
  traces: 'Une ligne au carnet de la sacoche (« Ce qui est arrivé », les huit dernières) ; les habitants en parlent pendant deux jours. Tout s’entend : la musique des gens (le violon de la noce, le fifre et le tambour, la litanie, le cantique, la vielle, la berceuse, le requiem) et les bruits (les sonnailles, le glas, le claquement des cigognes, le brame, la meute dans le ciel).',
};
// ce qui se cache : [événements concernés, texte]
const HASARD_SECRETS = [
  [['lettre_autre'], '**La montre du soldat** : la lettre de 1812 dit « J’ai laissé ma montre sous la pierre du seuil ». Devant la porte de la ferme, une terre remuée (« Creuser sous la pierre du seuil ») : avec la houe, la [[it:montre_soldat|montre d’un soldat]] (arrêtée à cinq heures moins dix, « J. D. — Smolensk »). La cachette reste tant qu’on n’a pas creusé, même après un chargement.'],
  [['pas_neige'], '**Les pas dans la neige** : quand on arrive au bout de la trace, deux pas de plus apparaissent derrière soi, tournés vers soi. Un murmure.'],
  [['chanson_puits'], '**La berceuse** : jeter une pièce dans le puits — un « merci » tout en bas, et la bonne fortune six heures.'],
  [['table_mise'], '**La table mise** : s’asseoir — un noir, des voix autour de soi, puis les chandelles s’éteignent toutes ensemble ; les bols sont vides. Si l’on s’en va sans s’asseoir, en se retournant il n’y a plus rien.'],
  [['chien_noir'], '**Le chien noir** : marcher droit sur lui — il n’y a plus que de la brume et une odeur de terre froide. Il ne mord pas.'],
  [['dame_blanche'], '**La dame blanche** : il faut lui parler (s’approcher), puis « L’accompagner » ; elle vous suit jusqu’au lieu qu’elle a nommé, dit qu’elle y attendait quelqu’un qui n’est jamais venu ; quand on la quitte des yeux, il ne reste qu’une couronne de fleurs d’oranger fanée. Si on ne l’accompagne pas, elle disparaît au bout d’une minute.'],
  [['messe_morts'], '**La messe des morts** : s’approcher fait taire le chant ; frapper à la porte : de l’autre côté, quelqu’un frappe une fois. Le lendemain, le curé trouve les cierges brûlés jusqu’au bout.'],
  [['chasse_volante'], '**La chasse volante** : la regarder fait peur (et les habitants disent qu’on meurt dans l’année — ce n’est pas vrai, du moins pas à cause d’elle) ; ne pas lever les yeux ne coûte rien.'],
  [['tambour_dessous'], '**Le tambour sous la terre** : regarder ses pieds (tête baissée) et « Coller l’oreille contre la terre » : des milliers de pas, très loin dessous, qui marchent en cadence — et qui s’arrêtent.'],
  [['fenetre_allumee'], '**La fenêtre éclairée** : là où elle brûlait, un bout de chandelle à la cire encore tiède (une bougie).'],
  [['peintre'], '**Le peintre anglais** : son croquis (le [[it:croquis_anglais|croquis d’un peintre]]) montre une silhouette qu’il n’a pas dessinée.'],
  [['panier_porte', 'enfant_perdu', 'linge_envole', 'cheval_echappe', 'incendie', 'rixe', 'vagabond_grange', 'colporteur_blesse', 'pelerins', 'diligence_renversee', 'crapauds', 'chevreuil_pris'], '**Le panier sur le seuil** dépend du dernier bienfait (dans les six jours) : un dessin d’enfant pour l’enfant ramené ; « Pour les draps » ; l’éleveuse pour le cheval ; le hameau pour les seaux ; « deux imbéciles réconciliés » pour la rixe ; des champignons et des mûres pour le vagabond ; « On se reverra. — J. » pour le colporteur ; les pèlerins ; le voyageur de la diligence. Et deux sans mot : du cresson mouillé entouré de traces de pattes palmées, après avoir fait traverser six crapauds ; des girolles et des fraises des bois dans un osier que personne ne tresse ainsi, après avoir délivré le chevreuil.'],
  [['cigognes'], '**Les cigognes** nichent une fois sur deux sur la grange de la ferme (s’il y en a une) quand on n’a commis aucun crime ; sinon sur l’église.'],
  [['comice'], '**Le comice** : la médaille demande au moins huit rangs de cultures vivants et une bête ; la mention, quatre rangs ou une bête.'],
  [['naissance'], '**La mise bas** : il faut aider trois fois (touche E près de la bête) ; seule, au bout d’une heure, le petit meurt.'],
  [['sangliers_champ'], '**Les sangliers** : leur courir dessus, c’est risquer une charge (une chance sur deux, neuf points de vie) ; en marchant, ils détalent à onze pas.'],
  [['corbeaux_semis'], '**Les corbeaux** reviennent se poser deux fois ; à la troisième, ils partent pour de bon.'],
  [['soldats'], '**Les soldats** ne font halte que si l’on s’approche à moins de neuf pas du capitaine ; ils achètent jusqu’à six vivres (les pommes au triple, les œufs et le pain au double, le fromage, le cidre et le vin un peu au-dessus du prix).'],
  [['rayon_vert'], '**Le rayon vert** ne se voit qu’en regardant le soleil au moment où il touche l’horizon (ou la rive d’en face) ; il faut un ciel clair et être au bord du lac.'],
  [['comete'], '**La comète** : la lettre de la bibliothèque (le deuxième matin, si le bibliothécaire est en vie) parle de la comète de 1811 et du « vin de la comète », et dit qu’en 1811 on cessa de sonner les cloches de la vallée pendant les sept nuits.'],
  [['enfant_perdu'], '**L’enfant perdu** se trouve près du lieu-dit que nomme sa mère (un calvaire, le moulin, la source aux rubans, le pont des Saules…) ; s’il n’est pas ramené, les hommes du village le retrouvent à la nuit tombée.'],
];

// ---------------------------------------------------------------- les événements, famille par famille : [événement (HF), nom, quand et où, ce qu’on voit et ce qu’on fait]
const HASARD = {
  ciel: [
    ['arc_en_ciel', 'L’arc-en-ciel double', 'quand une averse finit en fin d’après-midi (le soleil assez bas), dehors', 'un arc, souvent deux (couleurs inversées dans celui du haut) ; le ciel s’éclaircit'],
    ['halo_lune', 'La lune cerclée', 'la veille d’un jour de pluie, la nuit, dehors, lune levée', 'un grand cercle pâle autour de la lune. Le lendemain, il pleut'],
    ['parhelie', 'Les faux soleils', 'un matin de gel ou de grand clair, soleil bas', 'deux soleils de part et d’autre du vrai, rougis du côté du soleil'],
    ['eclairs_chaleur', 'Les éclairs de chaleur', 'un soir lourd et sec (canicule ou ciel clair)', 'des lueurs dans les nuages au loin, sans tonnerre'],
    ['foudre_boule', 'La foudre en boule', 'un jour d’orage', 'une boule de lumière grésillante flotte à hauteur d’homme, puis s’éteint ou éclate (trop près : brûlé)'],
    ['rayon_vert', 'Le rayon vert', 'au bord du lac, par temps clair, au coucher du soleil', 'un trait vert, une seconde, là où le soleil disparaît'],
    ['saint_elme', 'Le feu Saint-Elme', 'pendant un orage, le soir ou la nuit', 'des flammes bleues au bout des croix, des lampadaires, des épouvantails ; les cheveux se dressent'],
    ['linge_envole', 'Le linge envolé', 'un Lavedi sans pluie, près d’une corde à linge', 'le vent emporte les draps ; on les ramasse et on les rend à la lavandière (deux sous chacun)'],
    ['pluie_soleil', 'La pluie au soleil', 'une averse de la journée', 'la pluie tombe en plein soleil (« le diable bat sa femme et marie sa fille »)'],
    ['comete', 'La comète', 'une fois dans une partie, à partir du dixième jour', 'une étoile chevelue au-dessus des collines, sept nuits ; la grande bibliothèque écrit le deuxième matin'],
  ],
  betes: [
    ['cigognes', 'Les cigognes', 'six jours durant', 'un couple niche sur le faîte de l’église (ou sur la grange) ; elles claquent du bec'],
    ['loups_choeur', 'La meute qui chante', 'la nuit, loin des maisons (landes, hauteurs, bois)', 'des hurlements qui se répondent, puis des ombres basses qui passent, les yeux qui luisent'],
    ['brame', 'Le brame', 'en forêt, au crépuscule, la nuit, à l’aube', 'deux cerfs front contre front ; ils s’enfuient si l’on approche'],
    ['crapauds', 'Les crapauds', 'un soir de pluie, sur un chemin hors de la ville', 'une vingtaine de crapauds traversent vers l’eau ; on peut les faire traverser (touche E)'],
    ['etourneaux', 'Les étourneaux', 'au bord du lac, en fin d’après-midi', 'un nuage d’oiseaux qui se plie et se déplie au-dessus de l’eau'],
    ['hirondelles_basses', 'Les hirondelles basses', 'une heure avant une averse de l’après-midi, aux prés, à la ferme', 'elles rasent l’herbe autour de vous ; les habitants le disent : il va pleuvoir'],
    ['chauves_souris', 'Les chauves-souris', 'au crépuscule, près d’une grotte', 'un ruban de chauves-souris qui sort de la roche'],
    ['chevreuil_pris', 'Le chevreuil au collet', 'en forêt, en journée', 'un chevreuil pris dans un fil de laiton : le délivrer (on garde le fil : une corde), l’achever (viande, cuir) ou le laisser'],
    ['essaim', 'L’essaim', 'en journée, près d’un arbre, aux prés, à la ferme, au village', 'une grappe d’abeilles pend à une branche ; avec un enfumoir on la recueille (une ruche) ; sans, elles piquent'],
    ['renardeaux', 'Les renardeaux', 'à l’aube, dans les bois, les prés, la lande', 'une renarde et trois petits qui jouent devant le terrier ; ils y rentrent si l’on approche'],
  ],
  village: [
    ['noce', 'La noce', 'vers onze heures, en ville (pas le Vorndi ni le Chômedi)', 'le cortège de l’église à l’auberge derrière le violoneux, deux coups de fusil ; féliciter les mariés : des dragées, l’amitié des gens présents'],
    ['enterrement', 'L’enterrement', 'vers trois heures, en ville', 'le glas, le curé et sa croix, quatre porteurs et le cercueil, jusqu’au cimetière ; se recueillir (l’amitié du curé). Si un habitant est mort ces trois derniers jours, c’est le sien'],
    ['enfant_perdu', 'L’enfant perdu', 'en journée, en ville ou au hameau', 'une mère cherche son petit ; il pleure près d’un lieu-dit qu’elle nomme ; on le ramène par la main (huit pièces, l’amitié des gens)'],
    ['cheval_echappe', 'Le cheval échappé', 'en journée, à quelques centaines de pas du ranch', 'un cheval sellé court les prés ; ne pas courir vers lui ; saisir la longe et le ramener au ranch (douze pièces, l’amitié de l’éleveuse)'],
    ['saltimbanques', 'Les saltimbanques', 'l’après-midi, sur la place (Marchedi, Foiredi, Primedi, Veilledi, Ferdi, Pêchedi)', 'un jongleur, un cracheur de feu, un tambour-fifre, un ours au bout d’une chaîne, des badauds ; jeter des sous à la petite'],
    ['procession', 'La procession', 'un Primedi matin, vers la ferme', 'les Rogations : la bannière, la croix, une litanie à trois voix ; le curé bénit vos champs (vos cultures avancent)'],
    ['bapteme', 'Le baptême', 'vers midi, un Orédi, un Primedi ou un Nahédi', 'les cloches à toute volée ; le parrain jette des dragées aux enfants sur le parvis ; on peut en ramasser'],
    ['rixe', 'La rixe', 'un soir de Veilledi, de Foiredi, de Marchedi, de Ferdi ou de Chassedi, devant l’auberge', 'deux ivrognes se battent ; les séparer (l’amitié du garde ; parfois, on prend le coup)'],
    ['incendie', 'L’incendie', 'une nuit sèche, au hameau', 'une grange brûle, le tocsin, la chaîne des seaux jusqu’à l’eau ; passer les seaux'],
    ['charivari', 'Le charivari', 'un soir, en ville', 'des casseroles et une corne sous les fenêtres d’un veuf remarié avec une jeunesse ; on peut taper avec eux'],
  ],
  ferme: [
    ['renard_poulailler', 'Le renard au poulailler', 'la nuit, si l’on a des poules', 'les poules s’affolent ; on chasse le renard en approchant (ou le chien aboie) ; sinon il repart avec une poule. Au matin, des plumes'],
    ['panier_porte', 'Le panier sur le seuil', 'au matin, après un bienfait (un enfant ramené, des draps rendus, un incendie, une rixe séparée, un vagabond nourri, un colporteur soigné, des pèlerins nourris, une voiture redressée…)', 'un panier sous un torchon : des œufs, du pain, du fromage… et un mot'],
    ['rats_grange', 'Les rats', 'le soir, dans la grange', 'des rats filent le long des murs ; on les écrase (touche E) ; sinon, au matin, la mangeoire est vide'],
    ['vagabond_grange', 'Le vagabond', 'au matin, dans le foin de la grange', 'un vieil homme endormi ; lui donner à manger (une figurine de bois, une histoire) ou le chasser'],
    ['poussins', 'La couvée cachée', 'en journée, si l’on a des poules', 'une poule et cinq poussins dans les hautes herbes ; les ramener au poulailler (une poulette de plus)'],
    ['sangliers_champ', 'Les sangliers', 'la nuit, si l’on a des cultures', 'ils fouillent le champ ; on les chasse en approchant (leur courir dessus : l’un charge) ; sinon des rangs perdus'],
    ['corbeaux_semis', 'Les corbeaux', 'le matin, si l’on a des cultures', 'une dizaine de corbeaux sur les semis ; les chasser trois fois ; sinon de jeunes pousses picorées'],
    ['bete_echappee', 'La bête échappée', 'en journée, si l’on a des bêtes (pas les poules)', 'le portillon bat ; on retrouve la bête à travers champs et on la ramène'],
    ['naissance', 'La mise bas', 'la nuit, une vache, une brebis, une chèvre ou une truie', 'la bête gémit ; aider (trois fois) : le petit vit et rejoint la ferme'],
    ['comice', 'Le comice', 'un Foiredi, un Marchedi ou un Ferdi, en journée', 'le président du comice et son greffier jugent la ferme : médaille et vingt pièces, mention et cinq pièces, ou rien'],
  ],
  routes: [
    ['colporteur_blesse', 'Le colporteur blessé', '', 'assis dans le fossé, la cheville tordue ; un bandage ou une attelle : une pièce ancienne ; sinon l’aider à se relever'],
    ['diligence_renversee', 'La diligence renversée', '', 'une voiture versée, les chevaux dételés, des voyageurs ; pousser quatre fois pour la redresser (dix pièces)'],
    ['pelerins', 'Les pèlerins', '', 'ils vont à l’abbaye, en chantant un cantique ; ils demandent le chemin ; du pain : ils prient pour vous (bonne fortune, huit heures)'],
    ['roulottes_nuit', 'Les voyageurs', '', 'la nuit, un feu, une tente, une vielle, un chien ; s’asseoir au feu (la soupe, la chaleur quatre heures, une histoire)'],
    ['remouleur', 'Le rémouleur', '', 'sa meule, sa clochette ; six pièces : les outils affûtés (la force, trois heures)'],
    ['soldats', 'Les soldats', '', 'une compagnie au pas, tambour en tête, le capitaine à cheval ; ils font halte près de vous : on leur vend des vivres (œufs, pain, fromage, pommes, cidre, vin, plus cher qu’au marché, six au plus)'],
    ['charrette_embourbee', 'La charrette embourbée', '', 'après une pluie ; pousser quatre fois (six pommes)'],
    ['petit_savoyard', 'Le petit Savoyard', '', 'une vielle, une marmotte qui danse quand on donne un sou'],
    ['transhumance', 'La transhumance', '', 'le matin, un grand troupeau monte vers l’estive : sonnailles, chiens, sifflets'],
    ['peintre', 'Le peintre anglais', '', 'un chevalet ; lui parler deux fois : il donne un croquis'],
  ],
  etrange: [
    ['lettre_autre', 'La lettre', 'un matin, une fois dans une partie', 'une lettre de 1812 dans la boîte, pour une « Madame veuve Delorme, la vieille ferme »'],
    ['pas_neige', 'Les pas dans la neige', 'un jour de grand froid, au matin, hors de la ville', 'une trace de pas qui vient de loin et s’arrête net au milieu d’un pré'],
    ['chanson_puits', 'La berceuse du puits', 'la nuit, près d’un puits (place, ferme, vieux puits)', 'une voix de femme, sans paroles, qui monte de l’eau ; elle se tait si l’on approche'],
    ['table_mise', 'La table mise', 'le soir, aux abords du hameau abandonné', 'une table mise pour quatre, des chandelles, une soupe qui fume ; personne'],
    ['chien_noir', 'Le chien noir', 'la nuit, sur un chemin hors des villages', 'un grand chien noir aux yeux rouges, à quinze pas derrière vous ; il s’assoit quand on le regarde'],
    ['dame_blanche', 'La dame blanche', 'la nuit, sur un chemin', 'une femme en blanc demande qu’on l’accompagne jusqu’à un pont, un calvaire ou le cimetière'],
    ['messe_morts', 'La messe des morts', 'la nuit du Vorndi, à minuit, en ville', 'l’église fermée est éclairée ; on y chante un requiem'],
    ['chasse_volante', 'La chasse volante', 'la nuit, en terrain ouvert, ciel dégagé', 'des aboiements dans les nuages, une trompe, des sabots ; des chiens et des cavaliers noirs courent sur le ciel'],
    ['meneur_loups', 'Le meneur de loups', 'au crépuscule ou la nuit, landes, hauteurs, bois', 'un homme en cape suivi de cinq loups dociles ; il vous dit de passer votre chemin'],
    ['tambour_dessous', 'Le tambour sous la terre', 'le soir ou la nuit, sur les hauteurs, les landes, près de la mine ou des galeries (et au-dessus de la cave des Murés)', 'un battement très grave ; le sol vibre'],
    ['fenetre_allumee', 'La fenêtre éclairée', 'la nuit, en vue du hameau abandonné', 'une lumière à une fenêtre, qui s’éteint quand on arrive'],
  ],
};

// ---------------------------------------------------------------- la pierre ronde et la cité des Maisons-d’Étoile
const CITE = {
  lead: 'Quelque part sur les hauteurs, un anneau de pierre plein d’une lumière bleue : la **pierre ronde**. De l’autre côté, très haut au-dessus de la vallée, une cité abandonnée, les **Maisons-d’Étoile** : des salles immenses, des machines endormies, une voix qui veille, et beaucoup à lire. On peut y rester aussi longtemps qu’on veut. On n’y va qu’une fois.',
  pierre: [
    '**Une seule dans toute la vallée.** Sa place est tirée par la graine de la partie : elle change d’une partie à l’autre. Elle est toujours sur les hauteurs (le plus souvent 40 à 200 m au-dessus de l’eau), loin des chemins (des centaines de mètres, souvent), des villages, des fermes et des lieux-dits, sur un replat où l’on peut monter à pied (la génération vérifie qu’un chemin aux pentes praticables y mène depuis la ferme).',
    '**Ce qu’on voit** : un anneau de pierre grise, debout sur un socle à demi enterré, haut comme une porte de grange, couvert de mousse sur le dessus, avec des traits gravés sur le flanc. Dedans, une lumière bleue qui coule sans bruit. De jour, une lueur ; la nuit, elle éclaire l’herbe autour et se voit de loin. Quand on s’approche, elle chante, tout bas : trois notes de verre (plus souvent la nuit).',
    '**Ce qu’on en dit** : trois habitants, dans leurs rumeurs, parlent d’une lueur bleue, d’une pierre ronde, d’une porte dans le ciel, du côté de la vallée où elle se trouve — jamais plus précis : [[pnj:eleveuse|l’éleveuse]], [[pnj:chasseur|le chasseur]], [[pnj:fillette|la fillette]].',
    '**Au pied** : un caillou plat sous lequel dépasse un coin de papier (« Soulever le caillou ») : le mot d’Anselme Varenne, l’ancien fermier, qui l’a trouvée et n’y est pas allé.',
    '**Les traits gravés** (E, « Lire les traits gravés ») : une [[ins:a_vg_seuil|inscription en Hautes Lettres]] (l’aëlin), à déchiffrer comme les autres.',
    '**Passer la main dans la lumière** : on part pour la cité. Il n’y a pas de retour en arrière avant d’y être.',
  ],
  voyage: [
    '**Un monde à part** (comme le cauchemar et les Enfers) : on y est vraiment, mais la vallée s’arrête (son temps est suspendu : les heures, les effets des potions, les courbatures attendent votre retour). La faim, elle, vient lentement (de 80 à rien en une heure et demie environ ; ensuite elle fait mal, très lentement) : il y a de quoi manger là-haut (des rations, la sève, les fruits des serres). On n’y dort pas ; aucun autre monde (rêves, visions) ne vous y prend.',
    '**On peut y rester aussi longtemps qu’on veut**, et sauvegarder : une partie rechargée là-haut y reprend.',
    '**Le retour** : par le seuil de la cité, l’anneau de nacre du Seuil, là où l’on est arrivé (« Passer le seuil »). On se retrouve devant la pierre ronde, qui s’éteint derrière vous, se fend, et ne se rallumera jamais. L’autre côté aussi. **Un seul voyage.**',
    '**Mourir là-haut** (de faim, sans air dans la Brèche, d’une chute dans un puits…) : la veilleuse dépense la dernière lumière du seuil pour vous rendre à la vallée. On se réveille contre la pierre, blessé ; le voyage est fini de la même façon, les deux portails éteints. (Qui a tué dix personnes descend [[monde:enfers|aux Enfers]], comme partout ailleurs.)',
    '**Ce qui reste** : tout ce qu’on a rapporté, et ce que [[sys:atelier|l’Atelier des corps]] a fait. Au pied de la pierre éteinte, un [[it:vg_pierre_seuil|éclat de pierre]] à ramasser, une fois.',
  ],
  lieux: [
    '**Le Seuil** (on arrive et l’on repart) : l’anneau de nacre ; l’écran du registre de la cité (le journal de bord, lu et traduit par la veilleuse) ; la veilleuse elle-même, une petite flamme bleue sur un socle, à qui l’on peut parler ; une inscription ; la toupie de verre d’Iorin.',
    '**Le couloir des hublots**, qui mène à la Nef.',
    '**La Nef** : une salle immense, ouverte sur les étoiles ; une allée de nacre, des arbres morts dans leurs bacs, une fontaine sèche, des lampadaires, le régulateur de pesanteur, l’hologramme de la cité ; huit maisons de l’équipage (on y entre), chacune avec son lit, sa table, son étagère, son coffre et, souvent, un mot ; l’ascenseur et la trappe de la Machinerie ; l’escalier de service qui monte à l’aile haute.',
    '**Les Jardins** (une porte coulissante dans le mur ouest de la Nef) : huit bacs de culture, une rampe de lumière rose, le carnet de Seriane, une graine qui luit dans un pot.',
    '**L’aile haute** (douze mètres plus haut) : la galerie ; **les Archives** (des rayonnages, un écran, la carte du ciel, un papier glacé et une lampe électrique laissés par un autre visiteur, un cristal à souvenirs, un œil de verre) ; **l’Atelier des corps** ; **la Chapelle** (un autel aux trois signes : un soleil, trois traits, un rond noir) ; **les Berceaux** (vingt capsules vides, une qui ne l’est pas).',
    '**L’Observatoire** (par l’ascenseur de la galerie, ou l’échelle) : une baie immense sur les étoiles, une lunette, un écran, l’image d’Ilaeth, la plaque des étoiles.',
    '**La Machinerie** (sous la Nef) : le Cœur, haute colonne ajourée cerclée de nacre, et son pupitre ; un écran ; le carnet de Thalvor ; un coffre ; des étagères.',
    '**La Brèche** (une porte à l’est de la Machinerie) : la coque est ouverte sur le vide, au-dessus d’un rebord ; sans le rideau, il n’y a plus d’air (on étouffe en une vingtaine de secondes).',
  ],
  veilleuse: 'Au Seuil, sur un socle de nacre, une petite lumière bleue, pas plus grosse qu’une flamme de bougie, tient toute seule dans l’air : **la veilleuse**. Elle vous accueille, vous lit le registre de la cité, vous répond quand on lui parle, dit un mot dans chaque salle la première fois qu’on y entre, et se souvient.',
  objets: 'Le tout vaut environ 1 400 pièces à la revente ; les carnets, le cahier, les notes et la fiche se lisent (clic), la boîte à musique joue cinq notes dans un ordre qui change, un cristal à souvenirs montre un moment de la vie de quelqu’un.',
  // ce qui se cache (sous « révéler les secrets »)
  secret: [
    '**Qui a bâti la cité** : les Aëlim — le « peuple de la lumière » des livres de la vallée, ceux qui taillaient les pierres, écrivaient de haut en bas et creusèrent le temple de Durn — venaient d’ailleurs. Leur soleil, Iseth, « s’est tu » ; ils ont fui avec leur cité pendant sept cents ans, trouvé la vallée, et sont descendus par le seuil (la cité ne pouvait pas se poser). Ils ont ensuite oublié la cité exprès, génération après génération, pour que sa lumière ne se voie plus.',
    '**Ce qui les a suivis** : la Nuit — que la vallée connaît sous le nom de [[dieu:vesh|Vesh]], la troisième des Trois. « La troisième n’était pas en bas. La troisième, nous l’avons amenée. » [[dieu:aela|Aëla]] (la lumière de l’aube sur les hauteurs) et [[dieu:durn|Durn]] (la montagne qui dort) étaient déjà là. C’est pour cela qu’en bas on a caché les lampes sous la montagne ([[sys:dessous|le Dessous]]) et qu’on a tout éteint là-haut.',
    '**Le seuil n’a de place que pour un** : Thalvor a gardé de quoi un aller et un retour, « pour quelqu’un qui reviendrait chercher la petite ». Iorin, sept ans, dort toujours dans son berceau, qui n’a pas voulu s’ouvrir ; on ne peut pas l’emmener (la fillette de la ville le dit à sa façon : « Elle a de la place pour une seule personne. Pas pour deux. »). Après le voyage, la fillette, une fois, raconte qu’elle a rêvé de « la petite qui dort, là-haut ».',
    '**La Fondation est passée par là** : « un visiteur sans seuil », apparu dans une boîte qui bourdonnait, vêtu de jaune, un œil de verre sur la poitrine ; il a laissé un papier glacé (la fiche de terrain VAL-7 : « Pont à usage unique… NE PAS EMPRUNTER LE PONT ») et une lampe électrique. (Voir [[sys:fondation|la Fondation]].)',
    '**Les gens de la cité** : Ilaeth, la capitaine, descendue la dernière ; Thalvor, l’ingénieur du Cœur, qui a tout éteint et fait la veilleuse ; Seriane, des Jardins, mère d’Iorin ; Mirelle, de l’Atelier des corps (« Ce qu’on ajoute, on l’emprunte. ») ; les jumeaux Aren et Isse ; le vieux Dasso.',
  ],
  // les inscriptions en Hautes Lettres : [fiche, où]
  inscriptions: [
    ['ins:a_vg_seuil', 'sur la pierre ronde'], ['ins:a_vg_retour', 'au pied du seuil de la cité'], ['ins:a_vg_aelim', 'à l’entrée de la Nef'], ['ins:a_vg_trois', 'à la Chapelle'],
    ['ins:a_vg_ior', 'aux Berceaux'], ['ins:a_vg_estel', 'à l’Observatoire'], ['ins:a_vg_vir', 'dans la Machinerie'], ['ins:a_vg_hem', 'à l’Atelier des corps'],
  ],
};
// les machines : [machine (VG_MACH, ou rien), nom, où, ce qu’elle fait]
const CITE_MACHINES = [
  ['coeur', 'Le Cœur', 'la Machinerie (la colonne ou son pupitre)', 'le courant de toute la cité. Allumé : la lumière revient partout (la cité passe du bleu de la veilleuse à une lumière blanche), les écrans s’éveillent, les portes s’ouvrent, les ascenseurs vont deux fois plus vite, et les autres machines marchent ; plus de fenêtres s’allument dans les tours qu’on voit par les baies. Une lumière pliée tourne dans la colonne, des anneaux tournent autour ; un grondement sourd.'],
  ['lampes', 'Les lampes de la Nef', 'le pupitre à l’entrée de la Nef', 'douze lampadaires.'],
  ['fontaine', 'La fontaine', 'la Nef', 'l’eau coule ; on l’entend.'],
  ['gravite', 'Le régulateur de pesanteur', 'la Nef', 'une sphère tourne dans sa cage ; dans toute la Nef, on pèse moins (on saute bien plus haut, on retombe lentement), et la poussière flotte.'],
  ['holo_nef', 'Les hologrammes', 'la Nef, les Archives, l’Observatoire', 'la cité en petit, qui tourne (la Nef) ; la carte du ciel, avec sa part noire (les Archives) ; Ilaeth debout, les mains dans le dos (l’Observatoire).'],
  ['serre', 'Les serres', 'le pupitre des Jardins', 'la lumière rose, la bruine ; les plantes repoussent en une minute environ, et donnent des fruits (six) qu’on cueille.'],
  ['rideau', 'Le rideau de la Brèche', 'le pupitre près de la porte de la Brèche', 'un champ de lumière qui tient l’air.'],
  ['', 'Les portes', 'les Jardins, les Berceaux, la Brèche', 'elles s’ouvrent seules devant vous s’il y a du courant ; sans le Cœur, leur voyant est rouge et elles restent comme elles sont (une porte ouverte le reste : on ne se retrouve jamais enfermé quand le Cœur s’arrête).'],
  ['', 'Les ascenseurs', 'la Nef et la Machinerie ; la galerie et l’Observatoire', 'E sur la plate-forme ou sur une borne ; ils marchent même sans le Cœur (lentement). Un garde-corps se lève autour du puits quand la plate-forme n’est pas là.'],
  ['', 'Les échelles', 'la trappe de la Nef et la Machinerie ; la galerie et l’Observatoire', 'pour qui n’attend pas l’ascenseur.'],
];
const CITE_COEUR = 'Le Cœur ne doit pas brûler longtemps : au bout de quatre minutes, la veilleuse s’inquiète ; au bout de cinq, elle l’éteint elle-même ; il faut alors attendre qu’il refroidisse (vingt-cinq secondes) avant de le rallumer. Pendant qu’il brûle, des étoiles s’éteignent dans le ciel. Sans le Cœur, rien ne marche que les ascenseurs (lentement) ; l’Atelier des corps, lui, ne marche qu’avec.';
const ATELIER = {
  lead: 'Dans l’aile haute de la cité, un fauteuil sous des bras articulés : l’Atelier des corps refait un peu le corps. Il ne marche que si [[sys:cite-machines|le Cœur]] marche. Ce qu’il fait est permanent (gardé dans la partie) et vaut partout, toujours.',
  regles: [
    'Trois degrés au plus par reprise, six en tout.',
    'Chaque degré coûte des **cœurs de verre** (qui disparaissent dans la machine) et des **points de vie** (il faut en avoir assez : sinon, les bras s’approchent, hésitent, et se retirent).',
    'On garde ensuite six heures de **courbatures** (on va un dixième moins vite), qui ne passent qu’une fois revenu dans la vallée, où le temps coule.',
    'La cité cache dix [[it:vg_coeur|cœurs de verre]] : de quoi six degrés bien choisis, pas de quoi pousser deux reprises au bout. Les cœurs se vendent aussi (30 pièces) : il faut choisir.',
  ],
};

// ============================================================================
//  LES FICHES : build(X), appelé par tools/wiki-build.js avec ses outils
//  X = { DB, T, P, SP, SEC, esc, lk, IL, FILL, quotes, npcLink, pages, used, addCat, rarTag, nfmt, planBtn, MF, ITEMS }
// ============================================================================
function build(X) {
  const { DB, T, SP, SEC, esc, lk, IL, FILL, quotes, npcLink, pages, used, addCat, rarTag, nfmt, planBtn, MF, ITEMS } = X;
  const log = (m) => (DB.log || (DB.log = [])).push('wiki-v12.js : ' + m);
  const has = (id) => pages.has(id);
  const W = DB.world || {};
  // ---- le texte : « ** » en gras, « [[id|texte]] » un lien vers une fiche (résolu à la fin, comme les autres)
  const md = (t) => String(t ?? '').split(/(\[\[[^\]]+\]\])/).map((s, i) => {
    if (i % 2) { const [id, tx] = s.slice(2, -2).split('|'); return lk(id, tx); }
    return esc(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  }).join('');
  const ps = (t) => [].concat(t).flatMap((x) => String(x).split(/\n\n+/)).filter((x) => x.trim()).map((x) => `<p>${md(x)}</p>`).join('');
  const ul = (a) => (a && a.length ? `<ul>${a.map((x) => `<li>${md(x)}</li>`).join('')}</ul>` : '');
  const h3 = (t) => `<h3>${esc(t)}</h3>`;
  const tbl = (head, rows) => `<table class="t"><tr>${head.map((x) => `<th>${esc(x)}</th>`).join('')}</tr>${rows.join('')}</table>`;
  const td = (a) => `<tr>${a.map((x) => `<td>${x}</td>`).join('')}</tr>`;
  const book = (titre, texte, sig) => `<section class="bookpage">${titre ? `<h4>${esc(titre)}</h4>` : ''}<p>${FILL(texte)}</p>${sig ? `<p class="note">— ${esc(sig)}</p>` : ''}</section>`;
  const plur = (n, a, b) => `${nfmt(n)} ${n > 1 ? b : a}`;
  const fmtS = (s) => { s = Math.round(s); const m = Math.floor(s / 60), r = s % 60; return m ? `${m} min${r ? ' ' + String(r).padStart(2, '0') : ''}` : `${r} s`; };
  const files = (re) => Object.keys(MF || {}).filter((f) => re.test(f));
  const item = (id) => (ITEMS[id] ? IL(id) + (ITEMS[id].price ? ` <small>${plur(ITEMS[id].price, 'pièce', 'pièces')}</small>` : '') : esc(id));
  // ---- les tables de la vague : leurs fiches sont ici (rien dans « Autres tables », rien en bas des fiches)
  const VAGUE = /^(03-z+(D1|D2|E1|E2|E3|G)-|05-z+(D1|D2|E1|E2|E3|G)-|07-z+(E1|E2|E3|G)-|09-zzzz(S|M|E1|E2|E3|F)-|10-zzzz(E1|E2|E3)-|11-zzzz(D1|D2|E1|E2|E3|F|G)-|12-zzzzM-)/;
  for (const [n, t] of Object.entries(DB.tables || {})) if (VAGUE.test(t.file || '')) used.add(n);
  const MIL = Object.fromEntries(MILIEUX.map((m) => [m[0], m]));

  // ================================================================ 1) la musique
  const MU = T('MUSIQUE', null), SIL = T('MUS_SILENCE', {});
  if (MU && MU.morceaux) {
    const M = MU.morceaux, ordre = (MU.ordre || Object.keys(M)).filter((id) => M[id]);
    // la durée, d’après la partition : les mesures, le tempo (des noires par minute), les points d’orgue ; le jeu respire
    // un peu (≈ 7 %) et la salle résonne encore quelques secondes après la dernière note
    const duree = (p) => {
      const [num, den] = String(p.mesure || '4/4').split('/').map(Number), barQ = num * 4 / (den || 4);
      let nb = 0;
      for (const v of Object.values(p.voix || {})) nb = Math.max(nb, String(v.notes || '').split('|').filter((x) => x.trim()).length);
      let s = (p.anacrouse ? (nb - 1) * barQ + p.anacrouse : nb * barQ) * 60 / (p.tempo || 60);
      for (const f of p.fermates || []) s += f[1] || 0;
      return Math.round((s * 1.07 + 4) / 5) * 5;
    };
    const insts = (p) => [...new Set(Object.values(p.voix || {}).map((v) => MUS_INST[v.inst] || v.inst))].join(', ');
    const auteur = (id, p) => p.auteur || MUS_AUTEUR[id] || '';
    const titre = (id, p) => (auteur(id, p) && !MUS_AUTEUR[id] ? esc(p.titre) : `« ${esc(p.titre)} »`);
    const D = ordre.map((id) => duree(M[id])), tot = D.reduce((a, b) => a + b, 0);
    const rng = (a) => (a && a.length === 2 ? `${fmtS(a[0])} à ${fmtS(a[1])}` : '');
    const n = ordre.length, nOrig = ordre.filter((id) => !auteur(id, M[id])).length;
    let h = `<p class="lead">${md(MUSIQUE.lead)}</p>`;
    h += h3('Quand') + `<p>Le premier morceau vient de ${rng(SIL.premier)} après le début de la partie (ou le chargement) ; ensuite, après chaque morceau, un silence de ${rng(SIL.entre)}, tiré au hasard : une journée de jeu (vingt minutes) en entend deux ou trois. Un morceau dure de ${fmtS(Math.min(...D))} à ${fmtS(Math.max(...D))} environ. Il ne commence que pendant le jeu : pas pendant une cinématique, ni quand l’onglet est caché. En arrivant dans un autre monde, sa musique vient bientôt (de ${rng(SIL.monde)} après), si le dernier morceau a fini depuis plus d’une minute.</p>`;
    h += h3('Où l’on est') + ps(MUSIQUE.choix);
    h += h3(`Les ${n} morceaux`) + `<p class="note">${plur(n, 'morceau', 'morceaux')}, environ ${fmtS(tot).replace(/ \d\d$/, '')} de musique en tout : ${plur(nOrig, 'composition originale', 'compositions originales')}, l’air populaire « Au clair de la lune », et ${plur(n - nOrig - 1, 'œuvre', 'œuvres')} du domaine public. Les durées sont celles de la partition, à peu près.</p>`;
    for (const [g, gt, prec, pid] of MUS_GROUPES) {
      const own = ordre.filter((id) => M[id].groupe === g), also = ordre.filter((id) => M[id].groupe !== g && (M[id].aussi || []).includes(g));
      if (!own.length && !also.length) continue;
      const row = (id, aussi) => `<tr${aussi ? ' class="same"' : ''}><td>${titre(id, M[id])}${aussi ? ' <small>(aussi)</small>' : ''}</td><td><small>${esc(auteur(id, M[id]) || 'composition originale')}</small></td><td>${esc(insts(M[id]))}</td><td>${esc(M[id].mesure || '')}</td><td>${esc(MUS_SALLE[M[id].salle] || M[id].salle || '')}</td><td>${fmtS(D[ordre.indexOf(id)])}</td></tr>`;
      h += `<h4>${pid && has(pid) ? lk(pid, gt) : esc(gt)}${prec ? ` <small>(${esc(prec)})</small>` : ''}</h4>` + tbl(['Morceau', 'Compositeur', 'Instruments', 'Mesure', 'Salle', 'Durée'], [...own.map((id) => row(id, false)), ...also.map((id) => row(id, true))]);
    }
    h += `<p class="note">Rien ne joue dans le cauchemar.</p>`;
    h += h3('Comment c’est fait') + ps(MUSIQUE.comment);
    h += h3('Le volume, les Options') + ps(MUSIQUE.volume);
    h += h3('Quand elle se tait') + ps(MUSIQUE.silence);
    h += SEC(h3('Ce qui se cache') + ul(MUSIQUE.secret));
    SP('sys:musique', { t: 'La musique', s: `${n === 42 ? 'Quarante-deux' : n} morceaux doux, de temps en temps, selon le lieu`, c: ['musique'], i: '♪', h }, files(/^12-zzzzM-/));
  } else log('pas de table MUSIQUE : pas de fiche « La musique »');

  // ================================================================ 2) la voix de chaque milieu
  {
    let h = `<p class="lead">${md(AMBIANCE.lead)}</p>`;
    h += h3('D’un milieu à l’autre') + ps(AMBIANCE.passage);
    h += h3('Ce qu’on entend') + tbl(['Milieu', 'Le jour', 'Le soir et la nuit', 'Sous la pluie'], AMBIANCE.milieux.map(([mid, nom, j, nu, pl]) => td([`<b>${has(mid) ? lk(mid, nom) : esc(nom)}</b>`, md(j), md(nu), md(pl)])));
    h += ps(AMBIANCE.abri);
    h += h3('Selon l’heure et le temps') + ul(AMBIANCE.temps);
    h += h3('Les oiseaux qu’on entend sans les voir') + `<p class="note">${plur(AMBIANCE.oiseaux.length, 'chanteur', 'chanteurs')} nouveaux, chacun avec son vrai chant (les bêtes qu’on voit ont leurs propres cris).</p>` + tbl(['Oiseau', 'Où', 'Quand'], AMBIANCE.oiseaux.map(([nom, ou, quand, an]) => td([an && has(an) ? `${lk(an, nom)} <small>(on peut aussi le voir)</small>` : esc(nom), esc(ou), esc(quand)])));
    h += h3('Le réglage') + ps(AMBIANCE.reglage + (has('sys:son') ? ' Voir aussi [[sys:son|le son]].' : ''));
    h += SEC(h3('Ce qui se cache') + ul(AMBIANCE.secret));
    SP('sys:ambiance', { t: 'Les voix de chaque milieu', s: 'Les oiseaux, les bruits, la pluie de chaque milieu', c: ['musique'], i: '🐦', h });
    // la fiche du son renvoie aux deux nouvelles, et entre dans la section
    const ps2 = pages.get('sys:son');
    if (ps2) {
      ps2.h += h3('La musique, les voix des milieux') + ps('Chaque milieu a sa voix : [[sys:ambiance|ses oiseaux, ses bruits, sa pluie]]. Et deux réglages de plus dans les Options, pour [[sys:musique|la musique]] : le curseur « Musique » (son volume) et la case « Musique de temps en temps ».');
      addCat('sys:son', 'musique');
    }
  }

  // ================================================================ 3) les plantes
  {
    const PD = {};
    for (const p of [...T('D1_PLANTES', []), ...T('D2_PLANTES', [])]) PD[p.o] = p;
    const pieds = (id) => ((W.objCounts || {})[id] || 0);
    const secretsDe = (id) => PLANTES_SECRETS.filter(([ids]) => ids.includes(id)).map(([, t]) => t);
    let tot = 0, nb = 0;
    let tables = '';
    for (const [m, titre, prec, mid] of MILIEUX) {
      const L = PLANTES[m] || [];
      if (!L.length) continue;
      tables += `<h3>${esc(titre)}</h3>${prec ? `<p class="note">${esc(cap1(prec))}.</p>` : ''}` + tbl(['Plante', 'Rareté', 'Où', 'Allure (avant l’alchimiste)', 'Ce qu’on en tire', 'Mangée', 'Acheteurs'], L.map(([id, ou, allure, mangee, ach]) => {
        const p = PD[id];
        if (!p) { log('plante inconnue : ' + id); return ''; }
        const n = pieds(id); tot += n; nb++;
        return td([has('pl:' + id) ? lk('pl:' + id, p.nom) : esc(p.nom), `${rarTag(p.r)}${n ? `<br><small>${plur(n, 'pied', 'pieds')}</small>` : ''}`, md(ou || prec), allure ? `« ${esc(allure)} »` : '<small>son nom, d’emblée</small>', item(p.it || p.o), md(mangee), md(ach)]);
      }));
      // la fiche de chaque plante : où, ce qu’elle fait mangée, qui l’achète (et ce qui se cache)
      for (const [id, ou, , mangee, ach] of L) {
        const q = pages.get('pl:' + id);
        if (!q) { log('pas de fiche pour la plante ' + id); continue; }
        const sec = secretsDe(id);
        q.h += h3('Dans son milieu') + `<dl class="kv"><dt>Où</dt><dd>${md(ou || prec)}</dd><dt>Mangée</dt><dd>${md(mangee)}</dd><dt>Acheteurs</dt><dd>${md(ach)}</dd></dl>` + (sec.length ? SEC(`<h4>Ce qui se cache</h4>${ul(sec)}`) : '') + `<p class="note">Les dix plantes nouvelles ${esc(deMilieu(titre))} : ${lk('sys:plantes12', 'dix plantes de plus par milieu')}.</p>`;
        addCat('pl:' + id, 'nature');
      }
    }
    let h = `<p class="lead">${md(PLANTES_TEXTES.lead)}</p>` + ps([PLANTES_TEXTES.nommer, PLANTES_TEXTES.rarete]);
    if (tot) h += `<p class="note">Dans la vallée de ce wiki : ${plur(tot, 'pied', 'pieds')} pour ces ${nb} espèces (une passe de génération après tout le reste, qui ne touche pas aux objets d’avant).</p>`;
    h += tables;
    h += h3('Ce qu’on en fait') + ul(PLANTES_TEXTES.faire);
    h += h3('Quelques conduites (qu’on remarque en jouant)') + ul(PLANTES_TEXTES.conduites);
    h += SEC(h3('Ce qui se cache') + ul(PLANTES_SECRETS.map(([, t]) => t)));
    SP('sys:plantes12', { t: 'Dix plantes de plus par milieu', s: 'Quatre-vingt-dix plantes vraies, de la chicorée au nard celtique', c: ['nature'], i: '🌿', h }, files(/^11-zzzz(D1|D2)-/));
  }

  // ================================================================ 4) les bêtes
  {
    const EA = Object.fromEntries(T('ESPECES_ANIMAUX', []).map((e) => [e[0], e]));
    for (const BF of BETES_FICHES) {
      const secretsDe = (id) => BF.secret.filter(([ids]) => ids.includes(id)).map(([, t]) => t);
      let h = `<p class="lead">${md(BF.lead)}</p>` + h3('Où et quand on les voit') + ul(BF.paraitre);
      for (const m of BF.milieux) {
        const [, titre, , mid] = MIL[m] || [m, m, '', ''];
        const L = BETES[m] || [];
        h += `<h3>${esc(titre)}</h3>` + tbl(['Bête', 'Rareté', 'Quand', 'Ce qu’elle fait', 'Ce qu’elle donne'], L.map(([id, quand, fait, donne]) => {
          const e = EA[id];
          return td([has('an:' + id) ? lk('an:' + id) : esc(e ? e[1] : id), e ? rarTag(e[3]) : '', md(quand), md(fait), md(donne)]);
        }));
        for (const [id, quand, fait, donne] of L) {
          const q = pages.get('an:' + id);
          if (!q) { log('pas de fiche pour la bête ' + id); continue; }
          const sec = secretsDe(id);
          q.h += h3('Ses mœurs') + `<dl class="kv"><dt>Quand</dt><dd>${md(quand)}</dd><dt>Ce qu’elle fait</dt><dd>${md(fait)}</dd><dt>Ce qu’elle donne</dt><dd>${md(donne)}</dd></dl>` + (sec.length ? SEC(`<h4>Ce qui se cache</h4>${ul(sec)}`) : '') + `<p class="note">Les dix bêtes nouvelles ${esc(deMilieu(titre))} : ${lk(BF.id, BF.t[0].toLowerCase() + BF.t.slice(1))}.</p>`;
          addCat('an:' + id, 'nature');
        }
      }
      if (BF.objets.length) h += h3('Les objets') + tbl(['Objet', 'D’où', 'Qui l’achète', 'Usage'], BF.objets.map(([ids, ou, qui, usage]) => td([ids.map(item).join('<br>'), md(ou), md(qui), md(usage)])));
      for (const [t, L] of BF.autres) h += h3(t) + ul(L);
      h += SEC(h3('Ce qui se cache') + ul(BF.secret.map(([, t]) => t)));
      const tag = BF.id === 'sys:betes-pres' ? 'E1' : BF.id === 'sys:betes-lande' ? 'E2' : 'E3';
      SP(BF.id, { t: BF.t, s: BF.s, c: ['nature'], i: '🐾', h }, files(new RegExp('^11-zzzz' + tag + '-')));
    }
  }

  // ================================================================ 5) le hasard de la vallée
  const HF = T('HF', null), HC = T('HF_CATS', {}), HQ = T('HF_FREQ', {});
  if (HF) {
    const ICONE = { ciel: '🌈', betes: '🦌', village: '⛪', ferme: '🐓', routes: '🛤', etrange: '☾' };
    const nomDe = {};
    for (const L of Object.values(HASARD)) for (const [id, nom] of L) nomDe[id] = nom;
    const manque = Object.keys(HF).filter((id) => !nomDe[id]);
    if (manque.length) log('événements sans fiche : ' + manque.join(', '));
    let h = `<p class="lead">${md(HASARD_TEXTES.lead)}</p>` + h3('Comment ça arrive') + ul(HASARD_TEXTES.comment) + h3('Les traces') + ps(HASARD_TEXTES.traces);
    for (const [c, L] of Object.entries(HASARD)) {
      const ok = L.filter(([id]) => HF[id]);
      if (!ok.length) continue;
      const quand = ok.some(([, , q]) => q);
      h += `<h3>${esc(HC[c] || c)}${c === 'routes' ? ' <small>(sur les chemins, hors des villages)</small>' : ''}</h3>` + tbl(quand ? ['Événement', 'Quand, où', 'Ce qu’on voit, ce qu’on fait'] : ['Événement', 'Ce qu’on voit, ce qu’on fait'], ok.map(([id, nom, q, quoi]) => td([lk('hf:' + id, nom), ...(quand ? [md(q)] : []), md(quoi)])));
    }
    h += SEC(h3('Ce qui se cache') + ul(HASARD_SECRETS.map(([, t]) => t)));
    SP('sys:hasard', { t: 'Le hasard de la vallée', s: 'Soixante et un événements : le ciel, les bêtes, les villages, la ferme, les routes, l’étrange', c: ['evenements'], g: 'Le hasard de la vallée', i: '⚂', h }, files(/^11-zzzzF-/));
    // une fiche par événement
    for (const [c, L] of Object.entries(HASARD)) {
      for (const [id, nom, quand, quoi] of L) {
        const e = HF[id];
        if (!e) { log('événement inconnu : ' + id); continue; }
        const tx = e.txt || {};
        let x = `<dl class="kv"><dt>Famille</dt><dd>${esc(HC[c] || c)}</dd>`;
        x += quand ? `<dt>Quand, où</dt><dd>${md(quand)}</dd>` : c === 'routes' ? '<dt>Où</dt><dd>sur les chemins, hors des villages</dd>' : '';
        x += `<dt>Ce qu’on voit</dt><dd>${md(quoi)}</dd>`;
        x += `<dt>Comment il vient</dt><dd>${e.tirage === 'heure' ? `au fil du temps, là où l’on est : ${nfmt(e.parHeure || 0)} fois par heure de jeu passée au bon endroit, en moyenne` : 'le tirage du jour, à l’aube'}</dd>`;
        const premier = e.premier ?? HQ.premier;
        if (premier) x += `<dt>Pas avant</dt><dd>le ${premier}ᵉ jour de la partie</dd>`;
        if (e.fois) x += `<dt>Au plus</dt><dd>${e.fois === 1 ? 'une fois dans une partie' : e.fois + ' fois dans une partie'}</dd>`;
        const ecart = e.ecart ?? HQ.ecart;
        if (ecart && e.fois !== 1) x += `<dt>Pas deux fois</dt><dd>en moins de ${ecart} jours</dd>`;
        if (e.duree >= 0.4) x += `<dt>Dure</dt><dd>environ ${nfmt(e.duree)} h de jeu</dd>`;
        if (e.etrange) x += '<dt>Étrange</dt><dd>oui : plus fréquent quand la mentalité s’assombrit</dd>';
        x += '</dl>';
        if (tx.journal) x += h3('Au carnet de la sacoche') + `<blockquote>${FILL(tx.journal)}</blockquote>`;
        const dit = [['avant', 'La veille'], ['pendant', 'Sur le moment'], ['apres', 'Les jours d’après']].filter(([k]) => [].concat(tx[k] || []).length);
        if (dit.length) x += h3('Ce qu’en disent les habitants') + dit.map(([k, t]) => `<h4>${t}</h4>${quotes([].concat(tx[k]))}`).join('');
        const sec = HASARD_SECRETS.filter(([ids]) => ids.includes(id)).map(([, t]) => t);
        if (sec.length) x += SEC(h3('Ce qui se cache') + ul(sec));
        x += `<p>${lk('sys:hasard', 'Tout le hasard de la vallée')}</p>`;
        const fam = HC[c] ? HC[c][0].toLowerCase() + HC[c].slice(1) : c;
        SP('hf:' + id, { t: nom, s: 'Le hasard : ' + fam, c: ['evenements'], g: 'Le hasard : ' + fam, i: ICONE[c] || '⚂', h: x });
      }
    }
  } else log('pas de table HF : pas de fiche « Le hasard de la vallée »');

  // ================================================================ 6) la pierre ronde et la cité
  {
    const VM = T('VG_MACH', {}), VC = T('VG_CORPS', []), VCC = T('VG_CORPS_COUT', []), VCV = T('VG_CORPS_VIE', []), VCT = T('VG_CORPS_TEXTES', {});
    const VJ = T('VG_JOURNAL', []), VE = T('VG_ECRANS', {}), VK = T('VG_CARNETS', {}), VMS = T('VG_MESSAGES', {}), VS = T('VG_SOUVENIRS', []);
    const VQ = T('VG_QUESTIONS', []), VMA = T('VG_MAISONS', {}), VV = T('VG_VOIX', {}), VR = T('VG_RUMEURS', {}), VP = T('VG_PAPIERS', {}), VT = T('VG_TEXTES', {});
    const fixe = (s) => String(s || '').replace(/\{cote\}/g, '{lieu:vg_versant}');
    const plan = W.mondes && W.mondes.vaisseau && W.mondes.vaisseau.img;
    // les machines
    {
      let h = `<p class="lead">${md('Dans la cité, des machines endormies qu’on met en route ou qu’on arrête (touche E), chacune avec sa lumière et son bruit. Toutes demandent le courant du Cœur, sauf les ascenseurs (lents sans lui) et les échelles.')}</p>`;
      h += tbl(['Machine', 'Où', 'Ce qu’elle fait'], CITE_MACHINES.filter(([k]) => !k || VM[k]).map(([, nom, ou, quoi]) => td([`<b>${esc(nom)}</b>`, md(ou), md(quoi)])));
      h += h3('Le Cœur') + ps(CITE_COEUR);
      h += `<p>${lk('monde:vaisseau', 'La cité des Maisons-d’Étoile')} · ${lk('sys:atelier', 'L’Atelier des corps')}</p>`;
      SP('sys:cite-machines', { t: 'Les machines de la cité', s: 'Le Cœur, les lampes, la pesanteur, les serres, les hologrammes…', c: ['mondes'], g: 'La cité des Maisons-d’Étoile', i: '⚙', h });
    }
    // l’Atelier des corps
    if (VC.length) {
      let h = `<p class="lead">${md(ATELIER.lead)}</p>`;
      h += h3('Les quatre reprises') + tbl(['Reprise', 'Ce qu’elle fait', 'Par degré'], VC.map((c) => td([`<b>${esc(c.nom)}</b>`, esc(c.desc), esc(c.effet)])));
      if (VCC.length) h += h3('Le prix') + tbl(['Degré d’une reprise', 'Cœurs de verre', 'Points de vie'], VCC.map((nc, i) => td([i ? `le ${i + 1}ᵉ` : 'le 1ᵉʳ', String(nc), VCV[i] !== undefined ? String(VCV[i]) : '—'])));
      h += ul(ATELIER.regles);
      const dit = [VCT.intro, VCT.prix, VCT.pendant].filter(Boolean);
      if (dit.length) h += h3('Dans le fauteuil') + quotes(dit);
      if (VCT.apres && typeof VCT.apres === 'object') h += `<h4>Après</h4>${quotes(VC.map((c) => VCT.apres[c.id]).filter(Boolean))}`;
      h += `<p>${lk('monde:vaisseau', 'La cité des Maisons-d’Étoile')} · ${lk('sys:cite-machines', 'Les machines de la cité')}</p>`;
      SP('sys:atelier', { t: 'L’Atelier des corps', s: 'Courir un peu plus vite, sauter un peu plus haut… pour toujours', c: ['mondes', 'corps'], g: 'La cité des Maisons-d’Étoile', i: '⚕', h }, files(/^11-zzzzG-vaisseau3/));
    }
    // la cité
    {
      let h = (plan ? `<p>${planBtn('vaisseau', '', 'Voir le plan')}</p>` : '') + `<p class="lead">${md(CITE.lead)}</p>`;
      h += h3('La pierre ronde') + ul(CITE.pierre);
      if (has('li:vg_pierre')) h += `<p class="note">Sa place, dans la vallée de ce wiki : ${lk('li:vg_pierre', 'la pierre ronde')} (sous « révéler les secrets »).</p>`;
      h += h3('Le voyage') + ul(CITE.voyage);
      h += h3('Les lieux') + ul(CITE.lieux);
      h += h3('La veilleuse') + ps(CITE.veilleuse);
      h += h3('Les machines') + ps(`Le Cœur (le courant de toute la cité), les lampes de la Nef, la fontaine, le régulateur de pesanteur, les serres, trois hologrammes, le rideau qui tient l’air dans la Brèche, les portes, deux ascenseurs : [[sys:cite-machines|les machines de la cité]]. Et dans l’aile haute, le fauteuil qui refait un peu le corps : [[sys:atelier|l’Atelier des corps]].`);
      const its = Object.keys(ITEMS).filter((k) => /^vg_/.test(k) && k !== 'vg_pierre_seuil');
      if (its.length) h += h3('Ce qu’on y trouve') + `<p>${its.map((k) => IL(k)).join(', ')}${ITEMS.lampe_torche ? ', ' + IL('lampe_torche') : ''}.</p>` + ps(CITE.objets);
      const rum = Object.entries(VR).filter(([, L]) => [].concat(L).length);
      if (rum.length) h += h3('Ce qu’en disent les habitants') + rum.map(([who, L]) => `<h4>${npcLink(who)}</h4>${quotes([].concat(L).map(fixe), who)}`).join('');
      const ins = CITE.inscriptions.filter(([id]) => has(id));
      if (ins.length) h += h3('Les inscriptions') + `<p class="note">En Hautes Lettres (l’aëlin) : elles se déchiffrent comme les autres pierres ; leur traduction est sur leur fiche, sous « révéler les secrets ».</p><ul>${ins.map(([id, ou]) => `<li>${lk(id)} <small>— ${esc(ou)}</small></li>`).join('')}</ul>`;
      // ce que la cité raconte (secrets)
      let s = h3('Ce qui se cache') + ul(CITE.secret);
      if (VJ.length) s += h3('Le registre de la cité') + `<p class="note">Le journal de bord, au Seuil, que la veilleuse lit et traduit.</p>` + VJ.map(([d, x]) => book(d, x)).join('');
      const ecr = Object.values(VE).filter((e) => e && (e.pages || []).length);
      if (ecr.length) s += h3('Les écrans') + ecr.map((e) => `<section class="bookpage"><h4>${esc(e.titre || '')}</h4>${(e.pages || []).map(([t, x]) => `<p><b>${esc(t)}</b></p><p>${FILL(x)}</p>`).join('')}${e.nuit ? `<p class="note">Sans le Cœur : ${FILL(e.nuit)}</p>` : ''}</section>`).join('');
      const car = Object.entries(VK);
      if (car.length) s += h3('Les carnets') + car.map(([k, [t, x, sig]]) => book(t, x, sig)).join('');
      const msg = Object.values(VMS).filter((m) => m && (m.lignes || []).length);
      if (msg.length) s += h3('Les messages enregistrés') + msg.map((m) => `<h4>${esc(m.qui || '')}</h4>${quotes(m.lignes)}`).join('');
      if (VS.length) s += h3('Les cristaux à souvenirs') + `<ul>${VS.map(([qui, x]) => `<li><b>${esc(qui)}</b> : ${FILL(x)}</li>`).join('')}</ul>`;
      const mai = Object.values(VMA).filter(Array.isArray);
      if (mai.length) s += h3('Les maisons de l’équipage') + mai.map(([nom, note, objs]) => `<section class="bookpage"><h4>${esc(nom)}</h4>${note ? `<p><b>${esc(note[0] || '')}</b></p><p>${FILL(note[1] || '')}</p>${note[2] ? `<p class="note">— ${esc(note[2])}</p>` : ''}` : ''}${(objs || []).length ? `<p class="note">Dans le coffre : ${objs.map(([i, k]) => IL(i, k > 1 ? k : undefined)).join(', ')}</p>` : ''}</section>`).join('');
      if (VQ.length) s += h3('Ce que répond la veilleuse') + VQ.map(([q, r]) => `<section class="bookpage"><h4>« ${esc(q)} »</h4><p>${FILL(r)}</p></section>`).join('');
      const vv = Object.values(VV).flatMap((v) => [].concat(v)).filter((v) => typeof v === 'string' && v.trim());
      if (vv.length) s += h3('Ce que dit la veilleuse, salle après salle') + quotes(vv);
      if (VT.lunette) s += h3('Dans la lunette') + `<p>${FILL(VT.lunette + (VT.lunetteTard || ''))}</p>`;
      if (VT.iorin) s += h3('Le berceau qui ne s’est pas ouvert') + `<p>${FILL(VT.iorin)}</p>${VT.iorinTouche ? `<p>${FILL(VT.iorinTouche)}</p>` : ''}`;
      const pap = Object.values(VP).filter(Array.isArray);
      if (pap.length) s += h3('Les papiers de la vallée') + pap.map(([t, x, sig]) => book(t, fixe(x), sig)).join('');
      h += SEC(s, 'Ce que la cité raconte, et ce qui s’y cache, est masqué (secrets).');
      SP('monde:vaisseau', { t: 'La cité des Maisons-d’Étoile', s: 'Un monde à part, au-delà de la pierre ronde — un seul voyage', c: ['mondes'], i: '✧', h }, files(/^11-zzzzG-(portail|vaisseau\.|vaisseau2)/));
    }
    // la fiche de la pierre (un lieu secret) : ce qu’on y voit, le papier sous le caillou, et la cité
    const pp = pages.get('li:vg_pierre');
    if (pp) {
      pp.h += h3('La pierre') + (VT.pierreJour ? `<p>${FILL(VT.pierreJour)}</p>` : '') + (VT.pierreNuit ? `<p>${FILL(VT.pierreNuit)}</p>` : '') + (VT.pierreMorte ? `<p class="note">Après le voyage : ${FILL(VT.pierreMorte[0].toLowerCase() + VT.pierreMorte.slice(1))}</p>` : '');
      if (VP.anselme) pp.h += h3('Sous le caillou') + book(VP.anselme[0], fixe(VP.anselme[1]), VP.anselme[2]);
      pp.h += `<p>De l’autre côté : ${lk('monde:vaisseau', 'la cité des Maisons-d’Étoile')} (un seul voyage).</p>`;
    } else log('pas de fiche li:vg_pierre');
    // la liste des autres mondes
    const pm = pages.get('sys:mondes');
    if (pm) { const i = pm.h.lastIndexOf('</ul>'); const li = `<li>${lk('monde:vaisseau', 'La cité des Maisons-d’Étoile')}</li>`; pm.h = i >= 0 ? pm.h.slice(0, i) + li + pm.h.slice(i) : pm.h + `<ul class="cards">${li}</ul>`; }
  }

  // ================================================================ 7) les effets de ce qu’on mange : des noms, et ce qui se cache
  {
    const EFN = { d1_armure: ['Endurci', 1], d1_brulure: ['Brûlure de la berce', 0], d1_piedsur: ['Pied sûr', 1], d2_paxille: ['Le mal du paxille', 1], d2_rire: ['Le rire de l’œnanthe', 1], d2_os_fragiles: ['Os de verre', 1], d2_souffle: [null, 1] };
    const reS = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    for (const [k, [nom, sec]] of Object.entries(EFN)) {
      const id = 'eff:' + k, p = pages.get(id);
      if (!p) continue;
      const old = p.t, a = lk(id, old);
      if (nom) p.t = nom;
      const b = lk(id, p.t);
      const ra = new RegExp('(href="#/p/' + reS(encodeURIComponent(id)) + '"[^>]*>)' + reS(esc(old)) + '<', 'g');
      for (const q of pages.values()) if (q.h) { if (q.h.includes(a)) q.h = q.h.split(a).join(b); if (nom && q.h.includes(encodeURIComponent(id))) q.h = q.h.replace(ra, (m, x) => x + esc(p.t) + '<'); }
      if (!sec) continue;
      p.x = 1;
      const nr = pages.get('sys:nourriture');
      if (nr) nr.h = nr.h.replace(new RegExp(reS(b) + ' <small>[^<]*</small>', 'g'), (m) => `<span class="sec">${m}</span>`).split(`<li>${b}</li>`).join(`<li class="sec">${b}</li>`);
    }
    // la liqueur de vérâtre se cache sous la gentiane : sa fiche aussi
    const lv = pages.get('it:liqueur_veratre');
    if (lv) lv.x = 1;
    // le butin de la montre : un nom lisible
    const bm = pages.get('bt:hf_montre');
    if (bm) { const old = esc(bm.t); bm.t = 'Butin « sous la pierre du seuil »'; for (const q of pages.values()) if (q.h && q.h.includes(old)) q.h = q.h.split(old).join(esc(bm.t)); }
  }
}

// « Les prés » → « des prés » ; « La ferme » → « de la ferme » ; « Le bord du lac » → « du bord du lac »
function deMilieu(t) { return String(t).replace(/^Les /, 'des ').replace(/^Le /, 'du ').replace(/^La /, 'de la ').replace(/^L’/, 'de l’'); }
function cap1(s) { return s ? String(s)[0].toUpperCase() + String(s).slice(1) : ''; }

module.exports = { build, MUSIQUE, AMBIANCE, PLANTES, BETES, HASARD, CITE };
