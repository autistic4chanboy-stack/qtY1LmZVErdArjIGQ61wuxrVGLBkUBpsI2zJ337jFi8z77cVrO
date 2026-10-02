// ============================================================================
//  CINQUANTE PLANTES NOUVELLES (agent D1, douzième vague) — les données
//  Dix par milieu : les prés, la ferme, la ville, la lande, les hauteurs. Des
//  espèces vraies de nos campagnes, chacune avec son type du décor et son objet
//  (le même identifiant), son allure tant que l'alchimiste de la ville ne l'a
//  pas nommée (les plus connues n'en ont pas besoin), sa notice pour l'herbier,
//  sa rareté, son prix, ses essences d'alchimie.
//  Suite : 11-zzzzD1-plantes.js (types du décor, effets, remarques de
//  l'alchimiste, qui achète quoi, recettes, peuplement) ; sprites et icônes :
//  03-zzzzzD1-plantes.js.
// ============================================================================
// o : identifiant (type du décor ET objet cueilli), nom : nom du type (herbier), un : nom de l'objet, h : hauteur (m),
// n : [min, max] cueillis, bio : biome, hab : milieux (herbier, HABITATS), r : rareté (0 commune … 4 introuvable ou
// presque), fx : faim/soin/poison de l'objet, ic : icône, cat : catégorie du décor, look : [allure, ce qu'on en voit]
// (à faire nommer) ou rien, desc : la vraie description, note : notice de l'herbier, ess : essences, ou : où elle
// pousse (modes de 11-zzzzD1 : pres, talus, humide, sec, carrefour, ferme, champ, decombres, chalet, mur, jardin,
// eglise, lande, alpage, rochers, neiges, crete), prix : prix si ce n'est pas celui de sa rareté
const D1_PLANTES = [
  // ======================================================== LES PRÉS (plaine)
  { o: 'chicoree', nom: 'Chicorée sauvage', un: 'Chicorée sauvage', h: [0.7, 1.1], n: [1, 2], bio: 'plaine', hab: ['pres', 'ferme'], r: 0, fx: { food: 2, heal: 1 }, ic: ['c2_racine_long', '#d8c8a0', '#7a9ae8'], cat: 'Fleurs', ou: ['talus', 'pres'],
    desc: 'Des fleurs d’un bleu de ciel lavé, qui s’ouvrent le matin et se ferment avant midi. La feuille est amère ; la racine, grillée et moulue, fait le café des pauvres.',
    note: 'Au bord des chemins et des champs. Ses fleurs se ferment à midi.', ess: { terre: 1, lumiere: 1 } },
  { o: 'gaillet_jaune', nom: 'Gaillet jaune', un: 'Gaillet jaune', h: [0.4, 0.7], n: [1, 2], bio: 'plaine', hab: ['pres', 'lande'], r: 0, fx: { heal: 1 }, ic: ['c2_lavande', '#f0d030', '#5a8a3a'], cat: 'Fleurs', ou: ['sec', 'pres'],
    look: ['Panaches jaunes qui sentent le miel', 'Des tiges grêles couvertes de minuscules fleurs jaune d’or, serrées en panaches mousseux. Elles sentent le miel ; séchées, le foin.'],
    desc: 'Le caille-lait : une pincée de ses fleurs fait cailler le lait et donne au fromage sa couleur de beurre. On en bourrait les paillasses des accouchées.',
    note: 'Sur les talus secs et dans les prés maigres. Il sent le miel.', ess: { lumiere: 1, vie: 1 } },
  { o: 'rhinanthe', nom: 'Rhinanthe crête-de-coq', un: 'Crête-de-coq', h: [0.25, 0.45], n: [1, 2], bio: 'plaine', hab: ['pres'], r: 0, fx: { heal: -2 }, ic: ['c2_fleur', '#f0d040', '#9aa860'], cat: 'Fleurs', ou: ['pres'],
    look: ['Fleurs jaunes en casque, calice gonflé', 'Des fleurs jaunes en petit casque, qui sortent d’un calice renflé et plat comme une bourse. Mûre, la plante sonne quand on la secoue : les graines roulent dedans.'],
    desc: 'La cocriste, la tartarie, la cloche des foins : quand ses graines sonnent dans leur bourse, il est temps de faucher. Elle vit aux dépens des herbes et appauvrit les prés.',
    note: 'Dans les prés de fauche. Quand elle sonne, on fauche.', ess: { air: 2, sort: 1 } },
  { o: 'berce', nom: 'Berce commune', un: 'Pousses de berce', h: [1.2, 1.8], n: [1, 2], bio: 'plaine', hab: ['pres', 'berges'], r: 0, fx: { food: 3 }, ic: ['d1_ombelle', '#f0ece0', '#6a8a50'], cat: 'Fleurs', ou: ['talus', 'humide', 'pres'],
    desc: 'La patte-d’ours : une grande ombelle blanche sur une tige creuse et velue. Les cochons en raffolent ; les jeunes pousses se mangent comme l’asperge. La sève, au soleil, brûle la peau.',
    note: 'Au bord des prés, des chemins et des fossés. On la ramasse pour les cochons.', ess: { terre: 1, feu: 1 } },
  { o: 'cardere', nom: 'Cardère sauvage', un: 'Têtes de cardère', h: [1.2, 1.9], n: [1, 2], bio: 'plaine', hab: ['pres', 'berges'], r: 1, fx: { heal: 1 }, ic: ['d1_capitule', '#b89870', '#a080c0'], cat: 'Végétation', ou: ['humide', 'talus'],
    look: ['Grande tige épineuse aux têtes hérissées', 'Une tige raide couverte d’épines, aux feuilles soudées qui gardent l’eau de pluie comme des coupes. Au sommet, une tête ovale hérissée de crochets, cerclée de fleurs mauves.'],
    desc: 'Le chardon à foulon : ses têtes séchées, aux crochets durs, servent aux drapiers à lever le poil des draps. L’eau qui dort au creux des feuilles, dit-on, ôte les taches des yeux.',
    note: 'Au bord des fossés et des chemins humides. Les drapiers en achètent les têtes.', ess: { eau: 1, air: 1 } },
  { o: 'saponaire', nom: 'Saponaire officinale', un: 'Saponaire', h: [0.4, 0.7], n: [1, 2], bio: 'plaine', hab: ['berges', 'pres'], r: 1, fx: { heal: -2 }, ic: ['c2_fleur', '#f0c8d0', '#5a8a3a'], cat: 'Fleurs', ou: ['humide', 'talus'],
    look: ['Fleurs roses qui moussent dans l’eau', 'Des bouquets de fleurs rose pâle, qui sentent fort le soir. Froissées dans l’eau, les feuilles font une mousse comme du savon.'],
    desc: 'L’herbe à savon, l’herbe aux foulons : la racine bouillie fait une eau qui mousse et lave la laine sans l’abîmer. Mangée, elle irrite la gorge et le ventre.',
    note: 'Au bord des rivières, sur les talus et le long des chemins.', ess: { eau: 2, air: 1 } },
  { o: 'tanaisie', nom: 'Tanaisie commune', un: 'Tanaisie', h: [0.7, 1.2], n: [1, 2], bio: 'plaine', hab: ['pres', 'berges'], r: 1, fx: { heal: -3, poison: true }, ic: ['c2_dahlia', '#f0c020', '#4a7a3a'], cat: 'Fleurs', ou: ['talus', 'humide'],
    look: ['Boutons jaunes plats, feuilles de fougère', 'Des fleurs jaunes en boutons durs et plats, comme des têtes de clous dorés, au-dessus de feuilles découpées comme une fougère. L’odeur est forte, camphrée.'],
    desc: 'La tanaisie, l’herbe aux vers : elle chasse les vers du ventre, les mouches de la cuisine et les puces des paillasses. On en mettait dans les cercueils, pour que les vers attendent. Trop, elle rend fou.',
    note: 'Au bord des chemins et des rivières. Son odeur chasse les mouches.', ess: { mort: 1, ombre: 1, air: 1 } },
  { o: 'ophioglosse', nom: 'Ophioglosse', un: 'Langue-de-serpent', h: [0.14, 0.24], n: [1, 1], bio: 'plaine', hab: ['pres', 'berges'], r: 2, fx: { heal: 3 }, ic: ['d1_langue', '#5a9a40', '#c8b060'], cat: 'Végétation', ou: ['humide'],
    look: ['Une seule feuille, et une langue dressée', 'Une feuille unique, ovale et lisse, roulée à la base ; de son creux sort un épi étroit, crénelé comme une langue de serpent qu’on aurait aplatie.'],
    desc: 'L’ophioglosse, la langue-de-serpent, l’herbe sans couture : une fougère qui n’a qu’une feuille. Hachée dans l’huile, elle fait un baume qui ferme proprement les plaies.',
    note: 'Dans les prés humides qu’on ne laboure jamais. On passe dessus sans la voir.', ess: { vie: 2, sang: 1 } },
  { o: 'oeillet_superbe', nom: 'Œillet superbe', un: 'Œillet superbe', h: [0.4, 0.6], n: [1, 1], bio: 'plaine', hab: ['pres', 'berges'], r: 2, fx: { heal: 1 }, ic: ['c2_fleur', '#f0c0e0', '#5a8a5a'], cat: 'Fleurs', ou: ['humide', 'pres'],
    look: ['Fleur rose pâle aux pétales frangés', 'Des pétales rose pâle, déchiquetés en fines lanières comme une dentelle trop lavée. Le soir, on sent le parfum avant de voir la fleur.'],
    desc: 'L’œillet superbe, l’œillet frangé des prés humides : le plus parfumé des œillets sauvages. Les jardiniers de la ville en paient la graine.',
    note: 'Dans quelques prés humides, en lisière. Il sent plus fort le soir.', ess: { air: 1, vie: 1, sort: 1 } },
  { o: 'homme_pendu', nom: 'Orchis homme-pendu', un: 'Homme-pendu', h: [0.25, 0.4], n: [1, 1], bio: 'plaine', hab: ['pres'], r: 3, fx: { heal: -1 }, ic: ['d1_pendu', '#d8c860', '#8a5a30'], cat: 'Fleurs', ou: ['carrefour', 'sec'],
    look: ['Épi de petits hommes pendus', 'Un épi de fleurs jaune verdâtre, bordées de brun. Chaque fleur a une tête, deux bras, deux jambes ballantes : une rangée de petits hommes pendus par le cou.'],
    desc: 'L’orchis homme-pendu. Chaque fleur est un petit pendu, la tête sous son capuchon, les bras et les jambes ballants. Les vieux disent qu’il pousse là où quelqu’un s’est pendu.',
    note: 'Sur les pelouses sèches, très rarement. Les fleurs ont forme humaine.', ess: { mort: 2, esprit: 1 } },

  // ======================================================== LA FERME
  { o: 'bon_henri', nom: 'Chénopode bon-henri', un: 'Bon-henri', h: [0.3, 0.6], n: [1, 3], bio: 'ferme', hab: ['ferme', 'alpage'], r: 0, fx: { food: 5, heal: 1 }, ic: ['c2_feuille', '#6a9a4a', '#4a7a3a'], cat: 'Végétation', ou: ['ferme', 'chalet'],
    look: ['Feuilles en fer de flèche, farineuses', 'Des feuilles triangulaires, un peu farineuses dessous, et des épis de petites boules vertes. Elle aime le fumier et le pied des étables.'],
    desc: 'Le bon-henri, l’épinard sauvage, la toute-bonne : il pousse au fumier, près des étables, et se mange comme l’épinard. Les pousses de printemps, comme l’asperge.',
    note: 'Au pied des étables, sur les fumiers, près des fermes et des chalets.', ess: { terre: 1, vie: 1 } },
  { o: 'mouron_blanc', nom: 'Mouron des oiseaux', un: 'Mouron des oiseaux', h: [0.1, 0.16], n: [1, 3], bio: 'ferme', hab: ['ferme', 'ville'], r: 0, fx: { food: 2, heal: 1 }, ic: ['c2_salade', '#7ab060', '#f4f4ec'], cat: 'Végétation', ou: ['ferme', 'champ'],
    desc: 'Le mouron blanc, la morgeline : une herbe tendre, piquée d’étoiles blanches, qui couvre les cours et les potagers. On la donne aux poules et aux serins ; on la mange aussi, en salade, quand il n’y a rien d’autre.',
    note: 'Partout où la terre est remuée : cours, jardins, potagers. Même sous la neige.', ess: { vie: 1, eau: 1 } },
  { o: 'bourse_pasteur', nom: 'Bourse-à-pasteur', un: 'Bourse-à-pasteur', h: [0.2, 0.4], n: [1, 2], bio: 'ferme', hab: ['ferme', 'pres'], r: 0, fx: { heal: 2 }, ic: ['c2_herbe', '#7aa050', '#f0f0e8'], cat: 'Végétation', ou: ['ferme', 'champ'],
    desc: 'Les petites bourses en cœur, le long de la tige, sont celles des bergers. En tisane, elle arrête le sang : les femmes la gardaient pour les couches, et les soldats pour les blessures.',
    note: 'Au bord des chemins, dans les cours et les jardins, toute l’année.', ess: { sang: 1, terre: 1 } },
  { o: 'bardane', nom: 'Grande bardane', un: 'Racine de bardane', h: [0.9, 1.4], n: [1, 1], bio: 'ferme', hab: ['ferme', 'pres'], r: 0, fx: { food: 2, heal: 2 }, ic: ['c2_racine_long', '#6a5038', '#4a7a3a'], cat: 'Végétation', ou: ['ferme', 'decombres'],
    desc: 'Des feuilles grandes comme des oreilles d’éléphant, et des têtes qui s’accrochent à tout ce qui passe, laine, poils et jupons. La racine, en tisane, purifie le sang et nettoie la peau.',
    note: 'Au bord des chemins, près des étables et des décombres. Les têtes s’accrochent aux habits.', ess: { terre: 2, sang: 1 } },
  { o: 'pensee_champs', nom: 'Pensée des champs', un: 'Pensées des champs', h: [0.12, 0.22], n: [1, 2], bio: 'ferme', hab: ['ferme', 'pres'], r: 1, fx: { heal: 2 }, ic: ['c2_fleur', '#f0ecd0', '#8a60c0'], cat: 'Fleurs', ou: ['champ', 'ferme'],
    desc: 'La petite pensée des moissons, crème et violette, l’herbe de la Trinité : trois couleurs sur une fleur. En tisane, elle nettoie la peau des enfants et fait tomber les croûtes de lait.',
    note: 'Dans les champs de blé, sur les talus et les terres cultivées.', ess: { esprit: 1, vie: 1 } },
  { o: 'nielle', nom: 'Nielle des blés', un: 'Nielle', h: [0.6, 1.0], n: [1, 1], bio: 'ferme', hab: ['ferme'], r: 2, fx: { heal: -8, poison: true }, ic: ['c2_fleur', '#a03070', '#5a7a3a'], cat: 'Fleurs', ou: ['champ', 'ferme'],
    look: ['Fleur pourpre entre de longues pointes vertes', 'Une fleur d’un pourpre de vin, veinée de noir, entre cinq longues pointes vertes qui la dépassent comme les doigts d’une main. Les graines sont noires et râpeuses.'],
    desc: 'La nielle des blés, la couronne-des-blés : ses graines noires, moulues avec le grain, donnent un pain amer qui brûle la gorge et tord le ventre. Les meuniers la trient à la main.',
    note: 'Dans les champs de blé et de seigle, de plus en plus rare. Ses graines empoisonnent le pain.', ess: { mort: 1, sang: 1, terre: 1 } },
  { o: 'grande_cigue', nom: 'Grande ciguë', un: 'Grande ciguë', h: [1.2, 1.9], n: [1, 1], bio: 'ferme', hab: ['ferme', 'ville'], r: 1, fx: { heal: -20, poison: true }, ic: ['d1_ombelle', '#f4f4ec', '#8a3a5a'], cat: 'Fleurs', ou: ['decombres', 'ferme'],
    look: ['Ombelles blanches, tige tachée de pourpre', 'Une grande ombelle blanche, comme celle de la carotte sauvage ou du cerfeuil. La tige est lisse, bleutée, tachée de pourpre. Froissée, la plante sent l’urine de souris.'],
    desc: 'La grande ciguë, celle de Socrate. Elle ressemble au cerfeuil, au persil, à la carotte sauvage, et elle tue : les jambes s’engourdissent d’abord, puis le froid remonte, et l’esprit reste clair jusqu’au bout.',
    note: 'Sur les décombres, au bord des fumiers et des haies. La tige tachée de pourpre la trahit.', ess: { mort: 3, froid: 1 } },
  { o: 'bryone', nom: 'Bryone dioïque', un: 'Racine de bryone', h: [0.8, 1.4], n: [1, 1], bio: 'ferme', hab: ['ferme', 'ville'], r: 1, fx: { heal: -10, poison: true }, ic: ['c2_racine_gros', '#e8e0c8', '#4a8a3a'], cat: 'Végétation', ou: ['decombres', 'ferme'],
    look: ['Liane à vrilles et baies rouges', 'Une liane qui grimpe dans les haies en s’accrochant par des vrilles, aux feuilles comme celles de la vigne, avec des grappes de petites baies rouges. Dessous, une racine énorme, blanche, en forme de navet ou d’homme.'],
    desc: 'La bryone, le navet du diable, la mandragore des pauvres. Les charlatans en taillaient la racine en petit homme et la vendaient pour de la mandragore. Racine et baies purgent à en mourir.',
    note: 'Dans les haies, près des fermes et des villages. Sa racine ressemble à un homme.', ess: { mort: 1, terre: 2 } },
  { o: 'ivraie', nom: 'Ivraie enivrante', un: 'Ivraie', h: [0.5, 0.9], n: [1, 2], bio: 'ferme', hab: ['ferme'], r: 2, fx: { food: 1 }, ic: ['c2_epi', '#b8b070', '#8a8a50'], cat: 'Végétation', ou: ['champ'],
    look: ['Herbe à épi plat, grains barbus', 'Une herbe comme le blé, mais plus grêle, aux épillets plats rangés le long de la tige comme les dents d’un peigne, et des grains barbus.'],
    desc: 'L’ivraie, la zizanie de l’Évangile, semée par l’ennemi dans le champ de blé. Ses grains, dans le pain, font tituber comme l’eau-de-vie et brouillent la vue.',
    note: 'Dans les champs de blé et d’orge. Les mauvaises années, elle remplace le grain.', ess: { esprit: 1, ombre: 1, terre: 1 } },
  { o: 'adonis', nom: 'Adonis goutte-de-sang', un: 'Goutte-de-sang', h: [0.2, 0.4], n: [1, 1], bio: 'ferme', hab: ['ferme'], r: 3, fx: { heal: -12, poison: true }, ic: ['c2_fleur', '#e01818', '#1a1010'], cat: 'Fleurs', ou: ['champ'],
    look: ['Fleur rouge sang au cœur noir', 'Une petite fleur d’un rouge si vif qu’on la croirait mouillée, au cœur noir, sur un feuillage fin comme celui du fenouil.'],
    desc: 'L’adonis d’été, la goutte-de-sang, née, dit la fable, du sang d’Adonis tué par le sanglier. Comme la digitale, elle agit sur le cœur : un peu le règle, un peu plus l’arrête.',
    note: 'Dans les moissons des terres calcaires, de plus en plus rare. Le cœur de la fleur est noir.', ess: { sang: 2, mort: 1, feu: 1 } },

  // ======================================================== LA VILLE
  { o: 'parietaire', nom: 'Pariétaire officinale', un: 'Pariétaire', h: [0.3, 0.5], n: [1, 2], bio: 'ville', hab: ['ville'], r: 0, fx: { heal: 2 }, ic: ['c2_herbe', '#7a9a50', '#a05040'], cat: 'Végétation', ou: ['mur'],
    look: ['Herbe rougeâtre et collante des murs', 'Des tiges rougeâtres et cassantes, aux feuilles velues qui s’accrochent aux habits, et de petites boules de fleurs verdâtres collées à la tige. Elle sort des fentes des murs.'],
    desc: 'La pariétaire, la casse-pierre, l’herbe de muraille : elle vit dans les murs et passe pour dissoudre la pierre des reins. Les ménagères en frottaient les bouteilles pour les faire briller.',
    note: 'Dans les fentes et au pied des vieux murs, partout dans les villes.', ess: { terre: 1, eau: 1 } },
  { o: 'cymbalaire', nom: 'Cymbalaire', un: 'Ruine-de-Rome', h: [0.12, 0.2], n: [1, 2], bio: 'ville', hab: ['ville'], r: 0, fx: { food: 1, heal: 1 }, ic: ['c2_fleur', '#b8a0e0', '#f0d040'], cat: 'Fleurs', ou: ['mur'],
    look: ['Petites gueules mauves qui pendent des murs', 'Des tiges fines comme des fils, pendues aux pierres, aux feuilles rondes lobées comme de petites mains, et des fleurs mauves à gorge jaune, en gueule de lion minuscule.'],
    desc: 'La cymbalaire, la ruine-de-Rome, venue d’Italie avec les marbres. Ses fruits se retournent vers le mur pour semer leurs graines dans les fentes : elle descelle les pierres, lentement.',
    note: 'Elle pend des murs et des ponts, et sème dans les fentes.', ess: { terre: 1, air: 1, sort: 1 } },
  { o: 'orpin_acre', nom: 'Orpin âcre', un: 'Poivre de muraille', h: [0.1, 0.16], n: [1, 2], bio: 'ville', hab: ['ville', 'rochers'], r: 0, fx: { heal: -3, poison: true }, ic: ['c2_fleur', '#f8e030', '#6a9a4a'], cat: 'Végétation', ou: ['mur'],
    look: ['Coussin de petites étoiles jaunes, feuilles en grains', 'Un tapis de petites feuilles charnues serrées comme des grains de riz, et par-dessus, une foule d’étoiles jaune vif. Une feuille mâchée brûle la langue comme du poivre.'],
    desc: 'L’orpin âcre, le poivre de muraille : il pousse sur les murs et les toits, sans terre et presque sans eau. Il brûle la bouche, fait vomir, et soigne les cors.',
    note: 'Sur les murs, les toits et les pierres sèches, au soleil.', ess: { feu: 2, terre: 1 } },
  { o: 'capillaire', nom: 'Capillaire des murailles', un: 'Capillaire', h: [0.14, 0.24], n: [1, 2], bio: 'ville', hab: ['ville'], r: 0, fx: { heal: 2 }, ic: ['d1_fougere', '#4a8a3a', '#2a1a14'], cat: 'Végétation', ou: ['mur'],
    look: ['Petite fougère aux tiges noires et luisantes', 'Une fougère minuscule, en touffe dans une fente de mur : des tiges noires, fines et luisantes comme des crins, et de petites folioles rondes rangées des deux côtés.'],
    desc: 'Le capillaire des murailles : une fougère qui ne vit que dans les murs. On en fait le sirop de capillaire, contre la toux, qu’on sert aussi, coupé d’eau fraîche, dans les cafés de la ville.',
    note: 'Dans les fentes des vieux murs ombragés, des puits et des ponts.', ess: { eau: 1, air: 1 } },
  { o: 'giroflee', nom: 'Giroflée des murailles', un: 'Giroflées des murailles', h: [0.3, 0.5], n: [1, 2], bio: 'ville', hab: ['ville'], r: 1, fx: { heal: 1 }, ic: ['c2_lavande', '#e0a020', '#5a7a3a'], cat: 'Fleurs', ou: ['mur'],
    desc: 'La giroflée jaune, le violier, la ravenelle des murs : des fleurs d’or brun qui sentent le clou de girofle et le miel. On dit qu’elle ne fleurit que sur les murs qui ont vu des sièges.',
    note: 'Sur les remparts, les vieux murs et les ruines, au soleil.', ess: { lumiere: 1, terre: 1 } },
  { o: 'bourrache', nom: 'Bourrache officinale', un: 'Bourrache', h: [0.4, 0.7], n: [1, 2], bio: 'ville', hab: ['ville', 'ferme'], r: 1, fx: { food: 2, heal: 2 }, ic: ['c2_fleur', '#4a70e0', '#1a1a3a'], cat: 'Fleurs', ou: ['jardin'],
    desc: 'Des étoiles d’un bleu pur, au cœur noir, sur une plante hérissée de poils blancs. Les fleurs se mangent en salade ; la tisane fait suer les fièvres et rend, dit-on, le cœur joyeux.',
    note: 'Échappée des jardins, au pied des murs et sur les terres remuées des villages.', ess: { vie: 1, air: 1, lumiere: 1 } },
  { o: 'melisse', nom: 'Mélisse officinale', un: 'Mélisse', h: [0.4, 0.7], n: [1, 2], bio: 'ville', hab: ['ville'], r: 1, fx: { heal: 2 }, ic: ['c2_feuille', '#7ab050', '#4a7a3a'], cat: 'Végétation', ou: ['jardin', 'eglise'],
    desc: 'La mélisse, la citronnelle, le piment des abeilles : froissée, elle sent le citron. Les Carmes en tirent leur eau, qui ranime les dames évanouies et calme les nerfs.',
    note: 'Échappée des jardins de curé et des couvents, au pied des murs. Les abeilles l’aiment.', ess: { esprit: 1, vie: 1 } },
  { o: 'laitue_vireuse', nom: 'Laitue vireuse', un: 'Laitue vireuse', h: [0.8, 1.5], n: [1, 1], bio: 'ville', hab: ['ville', 'ferme'], r: 2, fx: { heal: -4, poison: true }, ic: ['c2_salade', '#8aa8a0', '#f0f0e8'], cat: 'Végétation', ou: ['jardin', 'decombres'],
    look: ['Haute salade amère au lait blanc', 'Une grande plante droite comme une laitue montée, aux feuilles bleutées, piquantes sur la nervure. La tige cassée pleure un lait blanc et amer.'],
    desc: 'La laitue vireuse, l’opium des pauvres : son lait séché fait dormir sans rêve, et parfois sans réveil.',
    note: 'Sur les décombres et au pied des murs, dans les villes et les villages.', ess: { ombre: 2, esprit: 1, eau: 1 } },
  { o: 'ceterach', nom: 'Cétérach officinal', un: 'Herbe dorée', h: [0.12, 0.2], n: [1, 1], bio: 'ville', hab: ['ville', 'rochers'], r: 2, fx: { heal: 2 }, ic: ['d1_fougere', '#6a8a50', '#c08a40'], cat: 'Végétation', ou: ['mur'],
    look: ['Petite fougère écailleuse, dorée dessous', 'Une petite fougère épaisse et coriace, aux feuilles découpées en lobes ronds. Dessous, des écailles rousses, comme de la limaille d’or. Sèche, elle se recroqueville ; mouillée, elle revit.'],
    desc: 'Le cétérach, l’herbe dorée, la doradille : elle meurt de soif sur les murs au soleil et ressuscite à la première pluie. Les anciens la donnaient contre la rate et la pierre.',
    note: 'Sur les vieux murs de pierre, au soleil. Sèche, elle semble morte ; à la pluie, elle revit.', ess: { lumiere: 1, vie: 1, terre: 1 } },
  { o: 'orobanche', nom: 'Orobanche du lierre', un: 'Orobanche', h: [0.2, 0.4], n: [1, 1], bio: 'ville', hab: ['ville'], r: 3, fx: { heal: -2 }, ic: ['c2_lavande', '#c8a090', '#a07080'], cat: 'Fleurs', ou: ['eglise'],
    look: ['Épi pâle sans feuilles, couleur de chair', 'Une tige dressée, sans une seule feuille verte, couleur de cire et de chair morte, couverte d’écailles et de fleurs en gueule, violacées. Elle sort de terre au pied des vieux murs.'],
    desc: 'L’orobanche du lierre : ni feuilles ni verdure, elle vit en buvant la sève des racines du lierre. On l’appelait herbe-à-la-mort, parce qu’elle pousse au pied des murs des églises et des cimetières.',
    note: 'Au pied du lierre, contre les vieux murs ombragés des églises et des cimetières. Elle n’a pas de feuilles.', ess: { mort: 2, ombre: 1, esprit: 1 } },

  // ======================================================== LA LANDE
  { o: 'genestrole', nom: 'Genêt des teinturiers', un: 'Genestrole', h: [0.3, 0.6], n: [1, 2], bio: 'lande', hab: ['lande'], r: 0, fx: { heal: -1 }, ic: ['c2_fleur', '#f0c818', '#3a6a2a'], cat: 'Végétation', ou: ['lande'],
    look: ['Petit genêt sans épines, fleurs d’or', 'Un petit buisson de tiges vertes et raides, sans épines, couvert de fleurs jaunes en papillon. Il ressemble au grand genêt, en plus ras.'],
    desc: 'La genestrole, le genêt des teinturiers : ses fleurs bouillies teignent la laine en jaune, et en vert si on la repasse au pastel. Le lait des vaches qui en broutent devient amer.',
    note: 'Sur la lande et les coteaux secs. Les teinturiers l’achètent.', ess: { lumiere: 2, terre: 1 } },
  { o: 'viperine', nom: 'Vipérine commune', un: 'Vipérine', h: [0.5, 0.9], n: [1, 2], bio: 'lande', hab: ['lande', 'pres'], r: 0, fx: { heal: 1 }, ic: ['c2_lavande', '#4060e0', '#a03040'], cat: 'Fleurs', ou: ['lande'],
    look: ['Haute tige hérissée aux fleurs bleues', 'Une tige raide, hérissée de poils piquants tachés de rouge, couverte de fleurs bleu vif aux étamines rouges qui dépassent comme des langues. Les graines ont la forme d’une tête de vipère.'],
    desc: 'La vipérine, l’herbe aux vipères : ses graines ressemblent à des têtes de serpent, et on la disait, pour cela, souveraine contre leurs morsures. Elle fait suer, et c’est tout ce qu’elle fait.',
    note: 'Sur les terres sèches et caillouteuses, la lande, les talus. Les abeilles l’adorent.', ess: { sang: 1, air: 1 } },
  { o: 'genevrier', nom: 'Genévrier commun', un: 'Baies de genièvre', h: [1.1, 2.1], n: [1, 3], bio: 'lande', hab: ['lande', 'alpage'], r: 0, fx: { food: 1, heal: 1 }, ic: ['d1_genievre', '#30406a', '#3a5a3a'], cat: 'Végétation', ou: ['lande'],
    desc: 'Des baies bleu-noir, poudrées de gris, qui mettent deux ans à mûrir. On en parfume la choucroute et le gibier ; on les distille avec le grain pour faire le genièvre. Brûlé, le bois chassait la peste des maisons.',
    note: 'Sur la lande et les coteaux, en buissons piquants qui ressemblent à de petits cyprès.', ess: { lumiere: 1, feu: 1 } },
  { o: 'polygala', nom: 'Polygala commun', un: 'Polygala', h: [0.12, 0.22], n: [1, 2], bio: 'lande', hab: ['lande'], r: 0, fx: { heal: 2 }, ic: ['c2_fleur', '#5070e0', '#e070a0'], cat: 'Fleurs', ou: ['lande'],
    look: ['Petites fleurs bleues en ailes', 'De minuscules fleurs bleues, roses ou blanches, aux deux sépales dressés comme des ailes, en grappes sur des tiges couchées.'],
    desc: 'Le polygala, l’herbe au lait : les bergers croient que les vaches qui en mangent donnent plus de lait, et les nourrices le croyaient aussi. La racine fait tousser et cracher ce qui encombre.',
    note: 'Dans les pelouses sèches de la lande et des coteaux.', ess: { vie: 1, eau: 1 } },
  { o: 'petite_centauree', nom: 'Petite centaurée', un: 'Petite centaurée', h: [0.15, 0.35], n: [1, 2], bio: 'lande', hab: ['lande', 'pres'], r: 1, fx: { heal: 3 }, ic: ['c2_fleur', '#e870a0', '#f0d040'], cat: 'Fleurs', ou: ['lande'],
    look: ['Petites étoiles roses très amères', 'Un bouquet de petites fleurs roses en étoile, au cœur jaune, qui ne s’ouvrent qu’au soleil, au-dessus d’une rosette de feuilles. Une fleur mâchée laisse la bouche amère pour la journée.'],
    desc: 'La petite centaurée, l’herbe à la fièvre, le fiel de terre : la plus amère des plantes après la gentiane. Le centaure Chiron, dit-on, s’en soigna d’une flèche empoisonnée.',
    note: 'Dans les clairières sèches, la lande et les pâturages maigres.', ess: { feu: 1, vie: 1, esprit: 1 } },
  { o: 'betoine', nom: 'Bétoine officinale', un: 'Bétoine', h: [0.3, 0.6], n: [1, 2], bio: 'lande', hab: ['lande', 'pres'], r: 1, fx: { heal: 3 }, ic: ['c2_lavande', '#b040a0', '#4a7a3a'], cat: 'Fleurs', ou: ['lande'],
    look: ['Épi pourpre serré, feuilles crénelées', 'Un épi court et serré de fleurs pourpres en gueule, au bout d’une tige carrée presque nue, avec une rosette de feuilles crénelées au pied.'],
    desc: 'La bétoine. « Vends ta cotte et achète de la bétoine », disaient les médecins d’autrefois : contre les maux de tête, les vertiges et les mauvais esprits. Séchée et prisée, elle fait éternuer.',
    note: 'Dans les landes, les bois clairs et les prés maigres.', ess: { esprit: 2, lumiere: 1 } },
  { o: 'pied_chat', nom: 'Pied-de-chat dioïque', un: 'Pied-de-chat', h: [0.12, 0.2], n: [1, 2], bio: 'lande', hab: ['lande', 'alpage'], r: 1, fx: { heal: 2 }, ic: ['c2_fleur', '#f0c0d0', '#c0c0b8'], cat: 'Fleurs', ou: ['lande'],
    look: ['Petits pompons roses et laineux', 'De petites têtes de fleurs serrées, roses ou blanches, rondes et douces comme le dessous d’une patte de chat, sur un tapis de feuilles laineuses, argentées dessous.'],
    desc: 'Le pied-de-chat, le gnaphale : ses têtes séchées entrent dans les « quatre fleurs » pectorales, contre la toux. Elles gardent leur couleur des années.',
    note: 'Sur les pelouses sèches et rases de la lande et des hauteurs.', ess: { vie: 1, air: 1, froid: 1 } },
  { o: 'cuscute', nom: 'Cuscute du thym', un: 'Cheveux du diable', h: [0.12, 0.2], n: [1, 1], bio: 'lande', hab: ['lande'], r: 2, fx: { heal: -2 }, ic: ['d1_fils', '#e05040', '#f0e8e0'], cat: 'Végétation', ou: ['lande'],
    look: ['Fils rouges emmêlés sur la bruyère', 'Un écheveau de fils roses et rouges, sans feuilles, emmêlés sur la bruyère et le thym comme une chevelure qu’on aurait arrachée. Par endroits, de petites boules de fleurs blanches, cireuses.'],
    desc: 'La cuscute, les cheveux du diable, la rogne : une plante sans racines ni feuilles, qui s’enroule autour des autres et boit leur sève. Les bergers disent que le diable s’y est peigné.',
    note: 'Sur la bruyère et le thym de la lande, en nappes rouges qui étouffent tout.', ess: { ombre: 1, mort: 1, sort: 1 } },
  { o: 'immortelle', nom: 'Immortelle des sables', un: 'Immortelles', h: [0.2, 0.35], n: [1, 2], bio: 'lande', hab: ['lande'], r: 2, fx: { heal: 1 }, ic: ['c2_dahlia', '#f0c020', '#b0b0a0'], cat: 'Fleurs', ou: ['lande'],
    look: ['Boutons d’or secs qui ne fanent pas', 'Des grappes de petits boutons jaune d’or, secs et brillants comme du papier verni dès qu’on les touche, sur des tiges laineuses, grises. Cueillis, ils ne fanent pas.'],
    desc: 'L’immortelle des sables : ses fleurs restent jaunes des années après qu’on les a cueillies. On en tresse les couronnes des tombes, qui durent plus longtemps que le chagrin.',
    note: 'Sur les sables et les terres sèches de la lande. Ses fleurs ne fanent pas.', ess: { lumiere: 2, mort: 1 } },
  { o: 'botryche', nom: 'Botryche lunaire', un: 'Lunaire', h: [0.1, 0.16], n: [1, 1], bio: 'lande', hab: ['lande', 'alpage'], r: 4, fx: { heal: 1 }, ic: ['d1_lune', '#7aa060', '#e0c050'], cat: 'Végétation', ou: ['lande'],
    look: ['Petite feuille en croissants de lune, épi doré', 'Une seule feuille charnue, découpée en petits éventails comme une rangée de lunes croissantes, et à côté, un épi de grains dorés. Elle sort de l’herbe rase, à peine plus haute qu’un doigt.'],
    desc: 'La lunaire, l’herbe à la lune, l’herbe qui déferre les chevaux : on dit qu’elle ouvre les serrures et fait tomber les fers des chevaux qui marchent dessus. Les alchimistes la cueillaient à la pleine lune.',
    note: 'Dans les pelouses rases de la lande, presque nulle part. On dit qu’elle ouvre les serrures.', ess: { sort: 3, lumiere: 1, froid: 1 } },

  // ======================================================== LES HAUTEURS
  { o: 'veratre', nom: 'Vérâtre blanc', un: 'Racine de vérâtre', h: [0.8, 1.5], n: [1, 1], bio: 'hauteurs', hab: ['alpage'], r: 0, fx: { heal: -18, poison: true }, ic: ['c2_racine_long', '#d8c070', '#7a9a6a'], cat: 'Végétation', ou: ['alpage'],
    look: ['Grandes feuilles plissées, racine jaune', 'De grandes feuilles ovales, plissées en long comme un éventail, le long d’une tige épaisse. La racine est grosse et jaunâtre, très amère.'],
    desc: 'Le vérâtre blanc, l’ellébore blanc, la fausse gentiane : il pousse dans les mêmes pâturages que la gentiane jaune et lui ressemble à s’y tromper tant qu’il n’a pas fleuri. Ses feuilles tournent autour de la tige ; celles de la gentiane vont par deux, face à face. Sa racine arrête le cœur.',
    note: 'Dans les pâturages d’altitude, parmi les gentianes. Ses feuilles s’enroulent en spirale autour de la tige.', ess: { mort: 2, terre: 1, froid: 1 } },
  { o: 'rumex_alpin', nom: 'Rumex des Alpes', un: 'Rhubarbe des moines', h: [0.5, 0.9], n: [1, 2], bio: 'hauteurs', hab: ['alpage'], r: 0, fx: { food: 3 }, ic: ['c2_feuille', '#4a8a3a', '#a04030'], cat: 'Végétation', ou: ['chalet', 'alpage'],
    look: ['Immenses feuilles en cœur près des étables', 'Des feuilles énormes, en cœur, sur de longues côtes rougeâtres, serrées en nappes autour des chalets et des étables. Des épis rouillés de graines.'],
    desc: 'Le rumex des Alpes, la rhubarbe des moines : il pousse en nappes là où le bétail a dormi. Les vachers en cuisent les feuilles pour les cochons et y enveloppent le beurre.',
    note: 'Autour des chalets d’estive et des étables, sur la terre engraissée par le bétail.', ess: { terre: 1, vie: 1 } },
  { o: 'gentiane_jaune', nom: 'Gentiane jaune', un: 'Racine de gentiane', h: [0.9, 1.5], n: [1, 1], bio: 'hauteurs', hab: ['alpage'], r: 0, prix: 2, fx: { heal: 3 }, ic: ['c2_racine_long', '#d8b860', '#f0c020'], cat: 'Végétation', ou: ['alpage'],
    look: ['Grandes feuilles plissées, fleurs jaunes', 'De grandes feuilles ovales, plissées en long, le long d’une tige épaisse, et des couronnes de fleurs jaunes étagées. La racine est grosse et jaunâtre, très amère.'],
    desc: 'La grande gentiane : sa racine, longue comme un bras, est la plus amère du monde. On en tire la liqueur des montagnards, et un remède contre la fièvre et le manque d’appétit. Elle vit cinquante ans.',
    note: 'Dans les pâturages d’altitude. Ses feuilles vont par deux, face à face ; le vérâtre pousse à côté.', ess: { feu: 1, terre: 1, vie: 1 } },
  { o: 'dryade', nom: 'Dryade à huit pétales', un: 'Thé suisse', h: [0.1, 0.16], n: [1, 2], bio: 'hauteurs', hab: ['rochers', 'alpage'], r: 0, fx: { heal: 2 }, ic: ['c2_fleur', '#f8f8f0', '#e0b030'], cat: 'Fleurs', ou: ['rochers', 'alpage'],
    look: ['Fleurs blanches à huit pétales, sur un tapis ras', 'Un tapis ras de petites feuilles crénelées comme des feuilles de chêne minuscules, blanches dessous, et des fleurs blanches à huit pétales autour d’un cœur d’or. Fanées, elles deviennent des plumets soyeux.'],
    desc: 'La dryade, le thé suisse, la chênette : les bergers en font une tisane qu’on boit dans les vallées comme du thé. Les plumets de ses fruits tournent en spirale, comme pour montrer d’où vient le vent.',
    note: 'Sur les éboulis et les rochers des hauteurs, en tapis.', ess: { froid: 1, vie: 1, air: 1 } },
  { o: 'carline', nom: 'Carline acaule', un: 'Carline', h: [0.1, 0.16], n: [1, 1], bio: 'hauteurs', hab: ['alpage', 'lande'], r: 1, fx: { food: 3, heal: 1 }, ic: ['d1_capitule', '#e8e4d8', '#c09050'], cat: 'Fleurs', ou: ['alpage'],
    look: ['Grande fleur d’argent posée au ras du sol', 'Une grande fleur sans tige, large comme une main, posée à plat sur une rosette de feuilles épineuses : une couronne de bractées argentées et brillantes autour d’un cœur fauve. Par temps humide, elle se referme.'],
    desc: 'La carline, le baromètre du berger, l’artichaut des montagnes : elle se ferme quand la pluie vient. On cloue sa fleur aux portes des granges contre la foudre et les sorcières ; le cœur se mange comme un artichaut.',
    note: 'Dans les pâturages secs et caillouteux des hauteurs. Elle se ferme avant la pluie.', ess: { lumiere: 1, air: 1, sort: 1 } },
  { o: 'trolle', nom: 'Trolle d’Europe', un: 'Boules d’or', h: [0.4, 0.6], n: [1, 2], bio: 'hauteurs', hab: ['alpage', 'combe'], r: 1, fx: { heal: -4, poison: true }, ic: ['c2_tulipe', '#f0e050', '#4a8a3a'], cat: 'Fleurs', ou: ['alpage'],
    look: ['Grosse boule jaune qui ne s’ouvre pas', 'Une fleur jaune pâle, ronde comme une bille, dont les pétales restent refermés en boule. Les feuilles sont découpées en main, comme celles du bouton d’or.'],
    desc: 'Le trolle, la boule d’or : il ne s’ouvre jamais, et de petites mouches vivent à l’abri dedans. Comme toute sa famille, il brûle la bouche et le ventre.',
    note: 'Dans les prairies humides des hauteurs.', ess: { lumiere: 1, feu: 1, eau: 1 } },
  { o: 'auricule', nom: 'Primevère auricule', un: 'Oreille-d’ours', h: [0.14, 0.24], n: [1, 1], bio: 'hauteurs', hab: ['rochers'], r: 2, fx: { heal: 2 }, ic: ['c2_fleur', '#f0e040', '#c8d0b8'], cat: 'Fleurs', ou: ['rochers'],
    look: ['Primevère jaune des rochers, feuilles poudrées', 'Une rosette de feuilles épaisses, poudrées de blanc comme de la farine, accrochée à une fente de rocher, et un bouquet de fleurs jaune soufre qui sentent le miel.'],
    desc: 'L’auricule, l’oreille-d’ours : une primevère des rochers. Les chasseurs de chamois en mâchaient la racine contre le vertige, pour passer les vires sans trembler.',
    note: 'Dans les fentes des rochers, sur les parois des hauteurs.', ess: { froid: 1, esprit: 1, terre: 1 } },
  { o: 'renoncule_glaciers', nom: 'Renoncule des glaciers', un: 'Renoncule des glaciers', h: [0.1, 0.18], n: [1, 1], bio: 'hauteurs', hab: ['neiges', 'rochers'], r: 3, fx: { heal: -3, poison: true }, ic: ['c2_fleur', '#f8f0f0', '#e0a0b0'], cat: 'Fleurs', ou: ['neiges'],
    look: ['Fleur blanche et rose au bord de la glace', 'Une petite fleur blanche qui rosit en vieillissant, sur des feuilles charnues et découpées, sortie d’un éboulis au ras de la neige.'],
    desc: 'La renoncule des glaciers : la fleur qui monte le plus haut, jusqu’aux dernières pierres sous les neiges éternelles. Les guides en rapportent une aux voyageurs, pour prouver qu’ils sont allés là-haut. Elle brûle la bouche, comme toute sa famille.',
    note: 'Au bord des glaciers et des neiges, sur les éboulis. Rien ne fleurit plus haut.', ess: { froid: 3, lumiere: 1 } },
  { o: 'ail_victorial', nom: 'Ail victorial', un: 'Ail victorial', h: [0.3, 0.5], n: [1, 1], bio: 'hauteurs', hab: ['alpage', 'rochers'], r: 2, fx: { food: 2, heal: 2 }, ic: ['d1_bulbe', '#a08a60', '#6a9a4a'], cat: 'Végétation', ou: ['rochers', 'alpage'],
    look: ['Ail à larges feuilles, bulbe en filet', 'Un ail aux larges feuilles plates et une boule de fleurs blanc-vert. Le bulbe est enveloppé de tuniques brunes en filet, serrées comme une cotte de mailles.'],
    desc: 'L’ail victorial, l’herbe à neuf chemises : son bulbe est vêtu de neuf tuniques comme une cotte de mailles. Les mineurs et les soldats le portaient sur eux contre les coups, les mauvais esprits et le mauvais air.',
    note: 'Dans les prairies rocailleuses des hauteurs. Les mineurs le portent sur eux.', ess: { terre: 2, sort: 1, vie: 1 } },
  { o: 'nard_celtique', nom: 'Nard celtique', un: 'Racine de nard', h: [0.1, 0.16], n: [1, 1], bio: 'hauteurs', hab: ['rochers', 'alpage'], r: 3, prix: 25, fx: { heal: 3 }, ic: ['c2_racine_long', '#8a6a48', '#a0a890'], cat: 'Végétation', ou: ['crete'],
    look: ['Petite plante grise qui sent le musc', 'Une petite rosette de feuilles grises et grasses, et quelques fleurs jaunâtres. Rien à voir. Mais la racine, quand on l’arrache, sent si fort le musc et la terre que l’odeur reste sur les doigts des jours.'],
    desc: 'Le nard celtique, la valériane des Alpes : sa racine parfumée partait jadis à dos de mulet jusqu’en Orient, où l’on en faisait des onguents pour les rois et pour les morts. On l’a tant arrachée qu’il n’en reste presque plus.',
    note: 'Sur quelques crêtes rocailleuses des hauteurs, presque nulle part. Sa racine sent le musc.', ess: { esprit: 2, mort: 1, sort: 1 } },
];
const D1_IDS = D1_PLANTES.map((P) => P.o);
const D1_PRIX = [1, 2, 5, 12, 25]; // prix selon la rareté (comme NAT_PRIX)
{
  const CAT_ICON = { Fleurs: ['c2_fleur', '#e0e0e0', '#e0c040'], Champignons: ['champi', '#c8a070'], Végétation: ['herbes', '#6a9a50'] };
  for (const P of D1_PLANTES) {
    if (!ITEMS[P.o]) defItem(P.o, P.un, 'cueillette', P.prix || D1_PRIX[P.r] || 1, P.ic || CAT_ICON[P.cat], Object.assign({ desc: P.desc }, P.fx));
    const I = ITEMS[P.o];
    if (P.look) { I.wild = true; PLANT_LOOK[P.o] = P.look; }
    HARVEST[P.o] = { tool: 'main', hp: 0, drop: [[P.o, P.n[0], P.n[1]]], regrow: [30, 30, 40, 48, 72][P.r] };
    ESPECES_PLANTES.push([P.o, P.hab, P.r]);
    NOTICE_PLANTES[P.o] = P.note;
    ESSENCES[P.o] = P.ess;
    I.alch = true;
  }
  // les herbes des plaies (11-zzzz8 : on les applique même le ventre plein, si l'on saigne)
  ITEMS.bourse_pasteur.panse = 2; ITEMS.ophioglosse.panse = 2;
}

// ---------------------------------------------------------------- ce qu'on en tire : les objets en plus
// (définis ici, avant 11-zzz63-alcool.js : les eaux-de-vie entrent dans ALCOOLS, que l'aubergiste achète ; et la liqueur
// de vérâtre, avant 11-zzz02-alchimie.js, qui met de côté les vrais noms des choses qu'il faut faire nommer)
defItem('cafe_chicoree', 'Café de chicorée', 'nourriture', 4, ['bol', '#3a2414'], { food: 4, heal: 2, desc: 'De la racine de chicorée grillée, moulue, passée à l’eau bouillante. Noir, amer, chaud : le café de ceux qui n’ont pas de café.' });
defItem('sirop_capillaire', 'Sirop de capillaire', 'nourriture', 9, ['h_bouteille', '#e0b878', '#e8dcc0'], { food: 3, heal: 4, desc: 'Un sirop doré, qu’on boit coupé d’eau fraîche. Contre la toux, et pour le plaisir.' });
defItem('eau_melisse', 'Eau de mélisse', 'nourriture', 14, ['h_flasque', '#d8e0a0'], { food: 1, heal: 6, alcool: 0.8, desc: 'L’eau des Carmes : de la mélisse distillée avec de l’eau-de-vie. Quelques gouttes sur un sucre contre les vapeurs, les évanouissements et les mauvaises nouvelles.' });
defItem('eau_genievre', 'Genièvre', 'nourriture', 18, ['h_flasque', '#e4ecee'], { food: 1, heal: 1, alcool: 2.5, desc: 'Du grain et des baies de genièvre passés ensemble à l’alambic. L’eau-de-vie des gens du Nord, qui sent la lande et la résine.' });
// la liqueur qu'on croit de gentiane, faite avec la racine de vérâtre : elle porte le nom de l'autre tant que
// l'alchimiste ne l'a pas goûtée (pas d'alcool déclaré ici : l'aubergiste ne l'achète pas, l'alchimiste si)
defItem('liqueur_veratre', 'Liqueur de vérâtre', 'nourriture', 17, ['h_bouteille', '#e0c030', '#e8dcc0'], { food: 2, heal: -6, poison: true, desc: 'Une liqueur faite avec la racine de vérâtre, la fausse gentiane. Assez de poison dans un verre pour arrêter le cœur d’un homme.' });
PLANT_LOOK.liqueur_veratre = ['Liqueur de gentiane', 'Amère comme la montagne. On dit que ça ouvre l’appétit et ferme les plaies.'];
ITEMS.liqueur_veratre.wild = true;
Object.assign(ESSENCES, { cafe_chicoree: { terre: 1, feu: 1 }, sirop_capillaire: { eau: 1, vie: 1 }, eau_melisse: { esprit: 2, vie: 1 }, eau_genievre: { feu: 2, air: 1 }, liqueur_veratre: { mort: 2, feu: 1, froid: 1 } });
