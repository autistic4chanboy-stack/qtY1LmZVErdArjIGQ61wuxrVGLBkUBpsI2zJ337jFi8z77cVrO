// ============================================================================
//  LES BÊTES DES PRÉS, DE LA FERME ET DE LA VILLE (agent E1, douzième vague)
//  — données : le catalogue (livre des bêtes), les notices, ce qu'elles
//  laissent (PREY), les objets nouveaux et leurs essences.
//  Le reste : modèles 07-zzzzzzzzzzzzE1-modeles.js, cris 09-zzzzE1-cris.js,
//  réglages des créatures 10-zzzzE1-betes.js, le jeu 11-zzzzE1-betes.js.
// ============================================================================
// [créature, nom, milieux (le premier range la notice dans le livre), rareté (0 commune … 4), danger (0-3)]
const E1_ESPECES = [
  // ---- les prés
  ['crecerelle', 'Faucon crécerelle', ['pres', 'ferme', 'ville'], 0, 0], ['buse', 'Buse variable', ['pres', 'foret'], 0, 0],
  ['caille', 'Caille des blés', ['pres', 'ferme'], 0, 0], ['vanneau', 'Vanneau huppé', ['pres', 'berges'], 1, 0],
  ['outarde', 'Outarde canepetière', ['pres', 'lande'], 2, 0], ['belette', 'Belette', ['pres', 'ferme'], 1, 0],
  ['campagnol_champs', 'Campagnol des champs', ['pres', 'ferme'], 0, 0], ['hanneton', 'Hanneton commun', ['pres', 'foret'], 0, 0],
  ['sauterelle', 'Grande sauterelle verte', ['pres', 'lande'], 0, 0], ['machaon', 'Machaon', ['pres', 'lande'], 1, 0],
  // ---- la ferme
  ['cheveche', 'Chouette chevêche', ['ferme', 'pres'], 1, 0], ['putois', 'Putois', ['ferme', 'riviere'], 2, 1],
  ['lerot', 'Lérot', ['ferme', 'foret'], 1, 0], ['rat_noir', 'Rat noir', ['ferme', 'ville'], 0, 0],
  ['bergeronnette', 'Bergeronnette grise', ['ferme', 'riviere'], 0, 0], ['etourneau', 'Étourneau sansonnet', ['ferme', 'pres', 'ville'], 0, 0],
  ['esculape', 'Couleuvre d’Esculape', ['ferme', 'pres'], 1, 0], ['frelon', 'Frelon d’Europe', ['ferme', 'foret'], 1, 2],
  ['grillon_foyer', 'Grillon du foyer', ['ferme', 'ville'], 0, 0], ['epeire', 'Épeire diadème', ['ferme', 'pres'], 0, 0],
  // ---- la ville
  ['hirondelle_f', 'Hirondelle de fenêtre', ['ville', 'ferme'], 0, 0], ['choucas', 'Choucas des tours', ['ville'], 0, 0],
  ['freux', 'Corbeau freux', ['ville', 'pres'], 0, 0], ['pelerin', 'Faucon pèlerin', ['ville', 'rochers'], 2, 0],
  ['petit_duc', 'Petit-duc scops', ['ville'], 1, 0], ['surmulot', 'Surmulot', ['ville', 'riviere'], 0, 1],
  ['fouine', 'Fouine', ['ville', 'ferme'], 1, 0], ['alyte', 'Alyte accoucheur', ['ville', 'ferme'], 1, 0],
  ['grand_paon', 'Grand paon de nuit', ['ville'], 2, 0], ['escargot', 'Escargot de Bourgogne', ['ville', 'ferme'], 0, 0],
];
ESPECES_ANIMAUX.push(...E1_ESPECES);

Object.assign(NOTICE_ANIMAUX, {
  crecerelle: 'Le petit faucon des routes et des prés. Il se tient immobile en l’air, face au vent, la queue ouverte, les ailes qui battent sans avancer : les paysans disent qu’il fait le Saint-Esprit. Puis il tombe d’un coup dans l’herbe, et remonte avec un campagnol. Il niche dans les clochers et les vieux murs.',
  buse: 'Elle tourne en larges cercles au-dessus des prés en miaulant comme un chat, ou attend des heures sur un piquet, au bord du chemin, l’air de s’ennuyer. Brune, plus ou moins pâle, jamais deux pareilles. Les gardes la tirent comme une nuisible ; elle mange pourtant plus de campagnols que de poulets.',
  caille: 'On l’entend partout dans les foins, du soir au matin : trois notes, toujours les mêmes, que les anciens traduisent par « paye tes dettes ». On ne la voit presque jamais. Elle part sous vos pieds, file au ras de l’herbe sur trente pas, et retombe comme une pierre.',
  vanneau: 'Le dos vert sombre qui luit au soleil, une huppe fine comme un cil, le ventre blanc. Il vit en bandes dans les prés humides. Quand on approche, toute la bande se lève en criant « pi-ouit » et tourne au-dessus de vous d’un vol mou, sur des ailes rondes. « Qui n’a pas mangé de vanneau n’a pas mangé de bon morceau », dit-on au marché.',
  outarde: 'La canepetière : une grande bête des plaines sèches, grosse comme une poule, couleur de chaume, qu’on prend de loin pour une motte. Le mâle porte au cou un collier noir et blanc. Elle se méfie de tout et part à cent pas ; en vol, elle montre des ailes blanches, qui sifflent.',
  belette: 'Pas plus longue qu’une main, rousse dessus, blanche dessous, vive comme un feu follet. Elle se dresse pour vous regarder, disparaît dans un trou, et ressort la tête un peu plus loin, pour voir si vous êtes encore là. Les vieilles disent qu’il ne faut pas la tuer : elle reviendrait se venger sur les poules.',
  campagnol_champs: 'Une petite boule grise à queue courte, qui court dans des sentiers creusés dans l’herbe et plonge dans ses trous dès qu’une ombre passe. Certaines années, il y en a tant que les prés en sont percés comme des écumoires. Les buses, les faucons et les belettes le savent.',
  hanneton: 'Il sort de terre les soirs de beau temps et vole lourdement autour des arbres, en bourdonnant, et se cogne à tout. Les enfants l’attachent à un fil pour le faire tourner. Les années à hannetons, la mairie paie le hannetonnage : on secoue les arbres à l’aube, quand ils sont engourdis, et on les ramasse à pleins sacs.',
  sauterelle: 'Verte comme une feuille, longue comme le doigt, avec des antennes plus longues qu’elle. Elle grésille le soir dans les hautes herbes et se tait dès qu’on approche. On la cherche longtemps, on la trouve sous son nez. Elle mord, et pas pour rire.',
  machaon: 'Le plus beau papillon des prés : jaune soufre veiné de noir, une bordure bleue, un œil rouge et deux queues aux ailes de derrière. Il monte sur les buttes et s’y dispute avec ses semblables. Sa chenille vit sur les carottes du potager. Les collectionneurs de la ville le paient.',
  cheveche: 'La petite chouette des vergers et des fermes, ronde comme un poing, les yeux jaunes sous des sourcils blancs, l’air toujours fâché. On la voit en plein jour sur un piquet ou un toit ; quand on la regarde, elle hoche la tête de haut en bas, comme pour saluer. Son cri, le soir, est une plainte. On dit qu’elle chante sur le toit de qui va mourir.',
  putois: 'Brun presque noir, le museau blanc, un masque de brigand sur les yeux. Il vit au bord des ruisseaux et vient la nuit aux poulaillers. Acculé, il lâche une odeur qui ne vous quitte plus de la journée. Sa peau se vend bien chez les fourreurs, quand on arrive à la débarrasser de l’odeur.',
  lerot: 'Un loir au masque noir de voleur, la queue terminée par un pinceau noir et blanc. Il vit dans les granges et les greniers, mange les pommes qu’on y range, et mène toute la nuit un sabbat de grincements et de sifflements au-dessus des chambres.',
  rat_noir: 'Le rat des greniers : gris d’ardoise, presque noir, les oreilles grandes et fines, la queue plus longue que le corps. Il grimpe partout, aux poutres, aux cordes, aux tiges des blés. On dit qu’il a apporté la peste. On dit aussi qu’il quitte la maison qui va brûler.',
  bergeronnette: 'La lavandière, le hoche-queue : grise, blanche et noire, elle court dans les cours de ferme et au bord de l’eau en remuant sans cesse sa longue queue. Elle suit les bêtes au pré, pour les mouches, et vole par bonds en appelant « tsilitt ».',
  etourneau: 'Noir, d’un noir qui tourne au vert et au violet, piqué d’étoiles blanches. Ils vont en bandes, marchent dans les prés en piquant le sol et partent tous à la fois. Il imite tout ce qu’il entend : la buse, le loriot, le grincement d’une porte, le sifflet du berger.',
  esculape: 'La plus longue des couleuvres, un mètre et demi et plus, brun olive, mince et lisse comme une canne vernie. Elle chauffe au soleil sur les vieux murs et grimpe aux arbres comme sur un escalier. Elle ne mord que si on la prend. On dit ici qu’elle tète les vaches.',
  frelon: 'Une guêpe grosse comme le pouce, rousse et jaune, qui bâtit son nid de papier dans les arbres creux et sous les toits. Il vole aussi la nuit, et vient aux lanternes. Il ne cherche personne, mais qui touche à son nid l’apprend vite. Sept piqûres tuent un cheval, dit-on ; c’est faux, mais trois suffisent à gâcher une semaine.',
  grillon_foyer: 'Il vit dans les fentes de l’âtre, au chaud, et chante la nuit quand la maison dort. On ne le voit presque jamais : un petit grillon couleur de paille, aux longues antennes. Il porte bonheur à la maison qui l’abrite ; le tuer, c’est tuer la chance du foyer.',
  epeire: 'La grosse araignée des jardins, une croix blanche sur le dos. Elle tend sa roue entre deux piquets, la nuit, et l’on y passe le visage au matin. Ses toiles, roulées en boule, arrêtent le sang des coupures : tous les faucheurs le savent.',
  hirondelle_f: 'L’hirondelle des villes : bleu-noir dessus, blanche dessous, avec un croupion blanc qui se voit de loin. Elle colle sous les avant-toits des nids de boue en forme de coupe, en colonies, et tourne tout le jour autour des maisons en gazouillant. Qui détruit un nid d’hirondelles attire le malheur sur sa maison.',
  choucas: 'Le petit corbeau des clochers, noir, la nuque grise et l’œil pâle, presque blanc, qui lui donne l’air d’un vieillard. Ils vivent en bandes dans les tours, se parlent sans arrêt d’un « tchak » sec, et se laissent tomber du ciel en culbutant, pour le plaisir.',
  freux: 'Le corbeau des labours, noir à reflets violets, la face nue et blanchâtre autour du bec. Ils nichent ensemble au sommet des grands arbres, dans une corbeautière qui fait un vacarme de marché. Le soir, ils rentrent tous ensemble en criant. On dit qu’une corbeautière qui s’en va annonce la ruine du domaine.',
  pelerin: 'Le plus rapide de tous les oiseaux. Gris d’ardoise dessus, une moustache noire sur des joues blanches. Il se tient des heures au sommet des clochers, puis tombe sur un pigeon, les ailes repliées, si vite qu’on entend siffler l’air. Les fauconniers des rois le payaient le prix d’un cheval.',
  petit_duc: 'Une chouette pas plus grosse qu’une grive, grise comme l’écorce, deux petites aigrettes sur la tête. La nuit, dans les arbres des places, elle lance un « tiou » doux, toujours le même, jusqu’au matin. Si on la cherche à la lanterne, elle se fait mince et droite, et devient une branche.',
  surmulot: 'Le rat d’égout : brun, gros, la queue épaisse, les oreilles petites. Il vit au bord de l’eau, dans les douves, sous les ponts et les lavoirs, et nage comme une loutre. Il est arrivé de l’Orient, dit-on, et a chassé le rat noir des villes. Acculé, il vous saute aux jambes.',
  fouine: 'La martre des maisons : brune, avec une bavette blanche fourchue et une queue touffue. Elle vit dans les greniers et les clochers, court la nuit sur les toits, et fait un bruit de sabbat au-dessus des chambres. Elle saigne les poules et mâchonne tout ce qui est cuir. Sa peau vaut presque celle de la martre.',
  alyte: 'Un petit crapaud gris, pas plus gros qu’une noix, aux yeux d’or. La nuit, dans les vieux murs et autour des lavoirs, il fait entendre une petite note de flûte, claire et triste, qu’on prend pour un oiseau. Le mâle porte les œufs enroulés autour de ses pattes de derrière, comme un chapelet jaune.',
  grand_paon: 'Le plus grand papillon du pays, large comme une main ouverte, gris et brun, avec un œil sur chaque aile, cerclé de rouge et de blanc. Il ne vole que la nuit et vient aux réverbères, où il se cogne doucement. Il ne mange pas : il ne vit que quelques nuits.',
  escargot: 'Le gros escargot des vignes et des jardins, à coquille blonde rayée de brun. Il sort après la pluie et la nuit, et monte aux murs en laissant une trace d’argent. On le fait jeûner, puis on le cuit au beurre et à l’ail : c’est un plat de fête en Bourgogne.',
});

// ce qu'elles laissent (chasse) ; les petites bêtes qu'on attrape vivantes (insectes, escargots) ne laissent rien quand on les tue
Object.assign(PREY, {
  crecerelle: { hp: 5, drop: [['plume_faucon', 1, 1]] }, buse: { hp: 9, drop: [['plume_rapace', 1, 2]] },
  caille: { hp: 2, drop: [['viande', 0, 1, 0.5], ['plume', 0, 1]] }, vanneau: { hp: 4, drop: [['plume', 1, 1], ['viande', 0, 1, 0.4]] },
  outarde: { hp: 10, drop: [['viande', 1, 2], ['plume', 1, 2]] }, belette: { hp: 3, drop: [['peau_belette', 1, 1, 0.7]] },
  campagnol_champs: { hp: 1, drop: [] }, hanneton: { hp: 1, drop: [] }, sauterelle: { hp: 1, drop: [] }, machaon: { hp: 1, drop: [] },
  cheveche: { hp: 4, drop: [['plume_hibou', 1, 1]] }, putois: { hp: 8, drop: [['peau_putois', 1, 1], ['musc_putois', 0, 1, 0.6]] },
  lerot: { hp: 3, drop: [] }, rat_noir: { hp: 3, drop: [] }, bergeronnette: { hp: 2, drop: [['plume', 0, 1, 0.5]] },
  etourneau: { hp: 2, drop: [['plume', 0, 1, 0.5], ['viande', 0, 1, 0.25]] }, esculape: { hp: 6, drop: [['mue_serpent', 0, 1, 0.5]] },
  frelon: { hp: 1, drop: [] }, grillon_foyer: { hp: 1, drop: [] }, epeire: { hp: 1, drop: [] },
  hirondelle_f: { hp: 2, drop: [] }, choucas: { hp: 3, drop: [['plume_noire', 1, 1]] }, freux: { hp: 5, drop: [['plume_noire', 1, 2]] },
  pelerin: { hp: 7, drop: [['plume_faucon', 1, 2]] }, petit_duc: { hp: 3, drop: [['plume_hibou', 0, 1, 0.7]] }, surmulot: { hp: 4, drop: [] },
  fouine: { hp: 7, drop: [['peau_fouine', 1, 1]] }, alyte: { hp: 1, drop: [['venin_crapaud', 0, 1, 0.3]] }, grand_paon: { hp: 1, drop: [] }, escargot: { hp: 1, drop: [] },
});

// ---------------------------------------------------------------- les objets nouveaux
defItem('plume_faucon', 'Plume de faucon', 'materiau', 4, ['plume', '#9a5a32'], { alch: true, desc: 'Une rémige rousse barrée de noir, raide et légère. Les fauconniers en garnissaient les chaperons.' });
defItem('plume_rapace', 'Rémige de buse', 'materiau', 3, ['plume', '#6a4a30'], { alch: true, desc: 'Une grande plume brune barrée de gris. Les écoliers en taillent des plumes à écrire, qui crachent l’encre.' });
defItem('hanneton', 'Hanneton', 'materiau', 1, ['n2_insecte', '#9a5a2a', '#3a2a22'], { alch: true, desc: 'Il agite ses antennes en éventail et cherche à s’envoler. La mairie en paie quelques sous le cent, les années à hannetons.' });
defItem('sauterelle', 'Grande sauterelle', 'materiau', 1, ['e1_sauterelle', '#5a9a3a', '#3a6a2a'], { alch: true, desc: 'Elle vous mord le doigt, et elle a raison. Les truites en raffolent, dit le pêcheur.' });
defItem('machaon', 'Machaon', 'tresor', 14, ['n2_papillon', '#f0d040', '#1a1a1a'], { desc: 'Jaune soufre et noir, un œil rouge au bord des ailes, et deux queues fines. Les collectionneurs de la ville le paient.' });
defItem('grand_paon', 'Grand paon de nuit', 'tresor', 28, ['e1_paon', '#8a7a6a', '#c04020'], { desc: 'Large comme une main, gris et brun, un œil sur chaque aile. Il ne mange jamais : il ne vit que quelques nuits.' });
defItem('escargot', 'Escargot', 'cueillette', 1, ['e1_escargot', '#c8a060', '#8a6a4a'], { food: 2, desc: 'Il est rentré dans sa coquille et n’en sortira pas tant qu’on le regarde. On le fait jeûner, puis on le cuit.' });
defItem('escargots_cuits', 'Escargots à l’ail', 'nourriture', 14, ['bol', '#6a5a30'], { food: 28, heal: 8, desc: 'Six escargots dans leur coquille, au beurre d’ail, brûlants. Il faut une épingle, et de la patience.' });
defItem('musc_putois', 'Musc de putois', 'materiau', 6, ['fiole', '#5a4a20'], { alch: true, desc: 'Une goutte brune qui empeste à dix pas. Les braconniers en frottent leurs pièges : les renards, dit-on, n’y résistent pas.' });
defItem('toile_epeire', 'Toile d’araignée', 'materiau', 2, ['e1_toile', '#e8e8e0', '#a8a8a0'], { alch: true, panse: 1, desc: 'Une toile roulée en boule, collante. Posée sur une coupure, elle arrête le sang : tous les faucheurs le savent.' });
defItem('nid_frelon', 'Nid de frelons', 'materiau', 12, ['e1_guepier', '#c8b090', '#8a7a5a'], { alch: true, desc: 'Une boule de papier gris et beige, en couches fines comme des pelures d’oignon. Vide, Dieu merci.' });
defItem('peau_putois', 'Peau de putois', 'materiau', 10, ['cuir', '#3a2a1a'], { desc: 'Une peau brun-noir au duvet jaunâtre. Elle sent encore. Les fourreurs la paient bien quand même.' });
defItem('peau_fouine', 'Peau de fouine', 'materiau', 14, ['cuir', '#5a4232'], { desc: 'Brune et douce, avec la tache blanche du cou. On en borde les manteaux des notaires.' });
defItem('peau_belette', 'Peau de belette', 'materiau', 3, ['cuir', '#9a6a3a'], { desc: 'Une toute petite peau rousse au ventre blanc. De quoi faire un col d’enfant, si l’on en a vingt.' });
Object.assign(ESSENCES, {
  plume_faucon: { air: 2, sang: 1 }, plume_rapace: { air: 2, terre: 1 }, hanneton: { terre: 2, ombre: 1 }, sauterelle: { air: 1, vie: 1 },
  musc_putois: { ombre: 1, sang: 2 }, toile_epeire: { vie: 2, ombre: 1 }, nid_frelon: { feu: 2, air: 1 },
});
// les escargots se cuisent à l'ail, sur le feu (une recette à découvrir)
RECIPES.push({ out: 'escargots_cuits', n: 1, need: { escargot: 6, ail: 1 }, st: 'feu' });
