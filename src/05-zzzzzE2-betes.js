// ============================================================================
//  LES BÊTES DE LA LANDE, DES HAUTEURS ET DU BORD DU LAC (agent E2, douzième
//  vague) — les données : trente espèces, leurs notices (le livre des bêtes),
//  ce qu'elles laissent (PREY), les objets nouveaux et leurs essences.
//  Modèles : 07-zzzzzzzzzzzzE2-modeles.js ; cris : 09-zzzzE2-cris.js ;
//  conduites : 10-zzzzE2-betes.js ; territoires, chasse, filet, marchands :
//  11-zzzzE2-betes.js. (CREATURES n'existe pas encore ici.)
// ============================================================================
// biome : le milieu de la vallée (BIOMES) ; hab : les milieux du livre des bêtes (HABITATS) ; r : rareté (0-4) ;
// d : dangereuse (0-3) ; h : son heure ('jour', 'nuit', 'crepuscule', 'toujours') ; T : nombre de territoires dans
// la vallée ; g : la troupe [min, max] ; place : où se tient son territoire ; R : distance (m) à laquelle elle paraît
const E2_BETES = [
  // ---- la lande
  { id: 'lezard_vert', nom: 'Lézard vert', biome: 'lande', hab: ['lande', 'rochers'], r: 0, d: 0, h: 'jour', T: 9, g: [1, 1], place: 'pierres', R: 70 },
  { id: 'calamite', nom: 'Crapaud calamite', biome: 'lande', hab: ['lande'], r: 0, d: 0, h: 'nuit', T: 6, g: [1, 2], place: 'sol', R: 70 },
  { id: 'perdrix_rouge', nom: 'Perdrix rouge', biome: 'lande', hab: ['lande', 'pres'], r: 0, d: 0, h: 'jour', T: 4, g: [3, 6], place: 'sol', R: 110 },
  { id: 'pie_grieche', nom: 'Pie-grièche écorcheur', biome: 'lande', hab: ['lande'], r: 1, d: 0, h: 'jour', T: 4, g: [1, 1], place: 'buisson', R: 90 },
  { id: 'huppe', nom: 'Huppe fasciée', biome: 'lande', hab: ['lande', 'pres'], r: 1, d: 0, h: 'jour', T: 3, g: [1, 1], place: 'sol', R: 100 },
  { id: 'oedicneme', nom: 'Œdicnème criard', biome: 'lande', hab: ['lande'], r: 1, d: 0, h: 'crepuscule', T: 3, g: [1, 2], place: 'sol', R: 110 },
  { id: 'busard_sm', nom: 'Busard Saint-Martin', biome: 'lande', hab: ['lande'], r: 1, d: 0, h: 'jour', T: 1, g: [1, 1], place: 'ciel', R: 220 },
  { id: 'minotaure', nom: 'Minotaure', biome: 'lande', hab: ['lande'], r: 1, d: 0, h: 'nuit', T: 5, g: [1, 1], place: 'sol', R: 45 },
  { id: 'genette', nom: 'Genette commune', biome: 'lande', hab: ['lande', 'rochers'], r: 2, d: 0, h: 'nuit', T: 1, g: [1, 1], place: 'pierres', R: 100 },
  { id: 'sphinx_tete_mort', nom: 'Sphinx tête-de-mort', biome: 'lande', hab: ['lande'], r: 3, d: 0, h: 'nuit', T: 1, g: [1, 1], place: 'sol', R: 60 },
  // ---- les hauteurs
  { id: 'campagnol_neiges', nom: 'Campagnol des neiges', biome: 'hauteurs', hab: ['rochers', 'neiges', 'alpage'], r: 0, d: 0, h: 'toujours', T: 40, g: [1, 2], place: 'pierres', R: 60 },
  { id: 'bartavelle', nom: 'Perdrix bartavelle', biome: 'hauteurs', hab: ['rochers', 'alpage'], r: 1, d: 0, h: 'jour', T: 14, g: [3, 5], place: 'pierres', R: 110 },
  { id: 'tetras_lyre', nom: 'Tétras lyre', biome: 'hauteurs', hab: ['alpage', 'sapiniere'], r: 1, d: 0, h: 'jour', T: 10, g: [1, 3], place: 'alpage', R: 110 },
  { id: 'peliade', nom: 'Vipère péliade', biome: 'hauteurs', hab: ['alpage', 'rochers'], r: 1, d: 2, h: 'jour', T: 16, g: [1, 1], place: 'pierres', R: 50 },
  { id: 'salamandre_noire', nom: 'Salamandre noire', biome: 'hauteurs', hab: ['alpage', 'combe', 'rochers'], r: 1, d: 0, h: 'toujours', T: 12, g: [2, 4], place: 'alpage', R: 55 },
  { id: 'apollon', nom: 'Apollon', biome: 'hauteurs', hab: ['alpage', 'rochers'], r: 1, d: 0, h: 'jour', T: 12, g: [1, 2], place: 'alpage', R: 70 },
  { id: 'tichodrome', nom: 'Tichodrome échelette', biome: 'hauteurs', hab: ['rochers'], r: 2, d: 0, h: 'jour', T: 6, g: [1, 1], place: 'falaise', R: 110 },
  { id: 'grand_duc', nom: 'Grand-duc d’Europe', biome: 'hauteurs', hab: ['rochers', 'sapiniere'], r: 2, d: 1, h: 'crepuscule', T: 4, g: [1, 1], place: 'falaise', R: 130 },
  { id: 'vautour_fauve', nom: 'Vautour fauve', biome: 'hauteurs', hab: ['rochers', 'alpage'], r: 2, d: 0, h: 'jour', T: 2, g: [3, 5], place: 'ciel', R: 360 },
  { id: 'gypaete', nom: 'Gypaète barbu', biome: 'hauteurs', hab: ['rochers', 'neiges'], r: 3, d: 0, h: 'jour', T: 1, g: [1, 1], place: 'falaise', R: 360 },
  // ---- le bord du lac
  { id: 'foulque', nom: 'Foulque macroule', biome: 'lac', hab: ['berges'], r: 0, d: 0, h: 'toujours', T: 5, g: [2, 5], place: 'eau', R: 130 },
  { id: 'mouette', nom: 'Mouette rieuse', biome: 'lac', hab: ['berges'], r: 0, d: 0, h: 'jour', T: 3, g: [3, 5], place: 'eau', R: 170 },
  { id: 'guignette', nom: 'Chevalier guignette', biome: 'lac', hab: ['berges', 'riviere'], r: 0, d: 0, h: 'jour', T: 5, g: [1, 1], place: 'berge', R: 90 },
  { id: 'campagnol_amphibie', nom: 'Campagnol amphibie', biome: 'lac', hab: ['berges', 'riviere'], r: 0, d: 0, h: 'toujours', T: 6, g: [1, 1], place: 'berge', R: 60 },
  { id: 'couleuvre_viperine', nom: 'Couleuvre vipérine', biome: 'lac', hab: ['berges'], r: 0, d: 0, h: 'jour', T: 5, g: [1, 1], place: 'berge', R: 50 },
  { id: 'oie_cendree', nom: 'Oie cendrée', biome: 'lac', hab: ['berges'], r: 1, d: 0, h: 'jour', T: 2, g: [4, 8], place: 'berge', R: 170 },
  { id: 'harle', nom: 'Harle bièvre', biome: 'lac', hab: ['berges', 'riviere'], r: 1, d: 0, h: 'jour', T: 3, g: [1, 3], place: 'eau', R: 130 },
  { id: 'cormoran', nom: 'Grand cormoran', biome: 'lac', hab: ['berges'], r: 1, d: 0, h: 'jour', T: 3, g: [1, 2], place: 'eau', R: 140 },
  { id: 'balbuzard', nom: 'Balbuzard pêcheur', biome: 'lac', hab: ['berges'], r: 2, d: 0, h: 'jour', T: 1, g: [1, 1], place: 'eau', R: 280 },
  { id: 'vison', nom: 'Vison d’Europe', biome: 'lac', hab: ['berges', 'riviere'], r: 3, d: 0, h: 'crepuscule', T: 1, g: [1, 1], place: 'berge', R: 80 },
];
const E2_PAR_ID = {};
for (const B of E2_BETES) E2_PAR_ID[B.id] = B;
// le livre des bêtes : [créature, nom, milieux, rareté, dangereuse]
ESPECES_ANIMAUX.push(...E2_BETES.map((B) => [B.id, B.nom, B.hab, B.r, B.d]));
Object.assign(NOTICE_ANIMAUX, {
  // ---- la lande
  lezard_vert: 'Long comme l’avant-bras, d’un vert si vif qu’on le croirait peint ; au printemps, le mâle a la gorge bleue. Il chauffe au soleil sur les pierres de la lande et se jette dans la bruyère au moindre pas. On dit qu’il réveille le dormeur quand la vipère approche.',
  calamite: 'Un petit crapaud qui ne saute pas : il court, comme une souris, une raie jaune tout le long du dos. Les soirs tièdes, après la pluie, les mâles chantent dans les flaques de la lande : un roulement sec, qui porte loin et ne semble venir de nulle part.',
  perdrix_rouge: 'Le bec et les pattes rouges, un collier noir, les flancs rayés comme un gilet. Elles vont en compagnie et piètent plus qu’elles ne volent ; quand on arrive dessus, tout part à la fois, dans un fracas d’ailes.',
  pie_grieche: 'Un petit oiseau masqué de noir, comme un voleur, qui guette du haut d’un buisson. Il prend les hannetons, les guêpes, les jeunes lézards, et les pique sur les épines pour plus tard. Un buisson ainsi garni, c’est qu’on est chez lui.',
  huppe: 'Couleur de cannelle, rayée de noir et de blanc, avec une huppe qu’elle ouvre comme un éventail quand on la surprend. Elle fouille le sol de son long bec courbe et chante « oup-oup-oup », bas, comme on souffle dans une bouteille. Son nid sent si fort qu’on l’appelle le coq puant. Les livres de secrets donnent des usages à son cœur, que nous ne répéterons pas.',
  oedicneme: 'Un gros oiseau couleur de sable, aux grands yeux jaunes, qui court plutôt qu’il ne vole. Le jour, il se plaque au sol et se fie à ses couleurs. Au crépuscule, il crie sur la lande comme un courlis qu’on aurait blessé : on l’appelle aussi le courlis de terre.',
  busard_sm: 'Il rase la lande à hauteur d’homme, les ailes relevées en V, en se balançant ; il revient sur ses pas, inlassable, et se laisse tomber dans la bruyère sur ce qui a bougé. Le mâle est gris pâle, le bout des ailes trempé dans l’encre ; la femelle est brune, avec du blanc au croupion.',
  minotaure: 'Un scarabée noir et luisant, gros comme une noisette ; le mâle porte trois cornes pointées en avant. Il creuse sous les crottes de lapin des puits profonds comme un bras. On le voit marcher la nuit sur le sable de la lande, sans se presser.',
  genette: 'De la longueur d’un chat, mais plus basse et plus longue, tachée de noir, la queue annelée. Elle ne sort que la nuit et monte aux arbres et aux rochers sans un bruit. Ses yeux renvoient la lumière de la lanterne. Sa peau se vend cher, et on en voit très peu.',
  sphinx_tete_mort: 'Le plus gros papillon de nuit qu’on connaisse ici. Il porte sur le dos une tête de mort, nette comme un dessin, et il crie quand on le prend : un petit cri aigu, qui n’est pas celui d’un insecte. Il entre dans les ruches voler le miel. La lumière l’attire. Sur la lande, on dit qu’il annonce un mort dans la maison où il entre.',
  // ---- les hauteurs
  campagnol_neiges: 'Un petit campagnol gris aux longues moustaches, qui vit plus haut que tous les autres, dans les éboulis, jusqu’aux neiges. Il se chauffe sur une pierre et rentre dans les fentes au moindre bruit. L’hiver, il ne dort pas : il court sous la neige.',
  bartavelle: 'La perdrix des rochers : grise et rose, la gorge blanche cerclée d’un collier noir bien net, les flancs zébrés. Elle remonte la pente en courant, et ne s’envole qu’au dernier moment, toujours vers le bas, en criant.',
  tetras_lyre: 'Le petit coq des bruyères : noir, d’un noir bleu, une crête rouge au-dessus de l’œil, et la queue recourbée en lyre, blanche dessous. Au petit jour, les coqs se retrouvent sur une place pelée et roucoulent, gonflés, la queue en roue, en se défiant. Ses plumes en lyre ornent le chapeau des montagnards.',
  peliade: 'La vipère des montagnes : courte, épaisse, grise ou brune, un zigzag noir le long du dos ; certaines sont toutes noires. Elle se chauffe au soleil du matin sur les pierres et ne bouge pas. Elle siffle avant de mordre : écoutez-la.',
  salamandre_noire: 'Toute noire et luisante, comme taillée dans du charbon mouillé. Elle ne sort qu’après la pluie, et alors on en voit partout dans les pâturages, lentes, comme si elles avaient toujours été là. Les bergers l’appellent le sourd. Elle porte ses petits deux ou trois ans, et les met au monde tout formés.',
  apollon: 'Un grand papillon blanc comme du papier huilé, taché de noir et marqué, sur les ailes de derrière, de deux yeux rouges cerclés de noir. Il plane plus qu’il ne vole, lentement, au-dessus des éboulis fleuris, et se laisse tomber sur les chardons. Les collectionneurs de la ville le paient bien.',
  tichodrome: 'Un oiseau gris, pas plus gros qu’un moineau, qui grimpe aux parois à petits bonds, les ailes battantes : des ailes rouge carmin tachées de blanc, qui s’ouvrent et se ferment comme celles d’un papillon. On l’appelle le papillon des murailles. Il vit sur les falaises, là où rien d’autre ne tient.',
  grand_duc: 'Un hibou gros comme un dindon, aux aigrettes dressées comme des cornes, aux yeux orange. Il niche dans les rochers. Sa voix grave, « ou-hou », s’entend à une lieue. Il ne craint rien : près de son rocher, il fait claquer son bec, et l’on ferait bien de s’éloigner.',
  vautour_fauve: 'De grands oiseaux bruns au cou nu, qui tournent par bandes dans l’air chaud, si haut qu’on les prend pour des buses. Ils ne tuent pas : ils attendent. Une bête meurt dans la montagne, et ils sont là en une heure, venus d’on ne sait où.',
  gypaete: 'Le plus grand oiseau des monts : près de trois mètres d’envergure, la queue en losange, une barbe noire sous le bec, la poitrine couleur de rouille. Il mange les os ; ceux qu’il ne peut avaler, il les emporte très haut et les laisse tomber sur les rochers pour les briser. Les bergers l’accusent d’enlever les agneaux, et parfois les enfants ; on l’a tant tiré qu’on n’en voit presque plus.',
  // ---- le bord du lac
  foulque: 'Une poule d’eau toute noire, avec une plaque blanche sur le front, comme un écusson. Elles vont en petites troupes sur l’eau libre, se chamaillent, plongent un instant ; dérangées, elles courent sur l’eau en battant des ailes, dans un grand bruit d’éclaboussures.',
  mouette: 'Blanche, le capuchon brun, le bec et les pattes rouges. Elles tournent au-dessus du lac, se posent sur l’eau, sur les pieux du ponton, et suivent les barques. Elles crient comme on rit, d’où leur nom ; de loin, à la tombée du jour, on ne sait plus si c’est elles.',
  guignette: 'Un petit échassier brun dessus, blanc dessous, qui marche au bord de l’eau en hochant la queue sans arrêt. Dérangé, il part au ras de l’eau, les ailes raides et frémissantes, en lançant un cri aigu, et se repose un peu plus loin.',
  campagnol_amphibie: 'Le rat d’eau : une bête ronde et brune, au museau court, qui vit dans les berges. Assis sur ses pattes de derrière, il mange les roseaux comme on mange une asperge. Au moindre bruit : un « plouf », et un sillage. Dans certaines campagnes, on le mange.',
  couleuvre_viperine: 'Une couleuvre d’eau, brune, marquée d’un zigzag sombre qui la fait prendre pour une vipère ; elle le sait. Menacée, elle aplatit la tête, siffle et fait mine de mordre. Elle ne mord pas, ou si peu. Elle chasse les petits poissons dans l’eau peu profonde.',
  oie_cendree: 'L’oie sauvage : grise, plus fine que celle de la ferme, le bec orange. Elles paissent l’herbe des berges en troupe, avec toujours une sentinelle qui garde le cou levé. Elle crie, et toutes partent. On dit que l’oie de la ferme vient d’elle, et qu’elle s’en souvient quand les sauvages passent.',
  harle: 'Un canard long et bas sur l’eau, au bec mince et rouge, dentelé comme une scie. Le mâle est blanc, la tête vert sombre ; la femelle est grise, la tête rousse et ébouriffée. Il plonge longtemps et ressort très loin.',
  cormoran: 'Un grand oiseau noir au bec crochu, qui nage enfoncé dans l’eau jusqu’au cou et plonge sans prévenir. Ensuite il se pose sur une pierre au bord de l’eau et reste là, les ailes ouvertes pour les faire sécher, sans bouger, comme une croix noire. Les pêcheurs le détestent.',
  balbuzard: 'L’aigle pêcheur : blanc dessous, brun dessus, un bandeau sombre sur l’œil. Il tourne au-dessus du lac, s’arrête en l’air en battant des ailes, puis tombe dans l’eau les serres en avant et en ressort avec un poisson, qu’il porte la tête en avant.',
  vison: 'Une petite bête d’un brun sombre, longue comme une hermine qu’on aurait étirée, le menton et les lèvres blancs. Elle chasse au crépuscule le long des berges et nage aussi bien qu’une loutre. On la voit si rarement qu’au village beaucoup n’y croient pas. Sa peau vaut une fortune.',
});
// ce qu'elles laissent (chasse : tirées, au collet, au filet)
Object.assign(PREY, {
  lezard_vert: { hp: 2, drop: [] }, calamite: { hp: 3, drop: [['venin_crapaud', 0, 1, 0.5]] },
  perdrix_rouge: { hp: 5, drop: [['viande', 1, 1], ['plume', 1, 1]] }, pie_grieche: { hp: 2, drop: [['plume', 0, 1]] },
  huppe: { hp: 3, drop: [['plume_huppe', 1, 1]] }, oedicneme: { hp: 6, drop: [['plume', 1, 2], ['viande', 0, 1, 0.5]] },
  busard_sm: { hp: 8, drop: [['plume', 1, 2]] }, minotaure: { hp: 1, drop: [] }, genette: { hp: 12, drop: [['peau_genette', 1, 1]] },
  sphinx_tete_mort: { hp: 1, drop: [] },
  campagnol_neiges: { hp: 1, drop: [] }, bartavelle: { hp: 6, drop: [['viande', 1, 1], ['plume', 1, 1]] },
  tetras_lyre: { hp: 9, drop: [['viande', 1, 2], ['plume_lyre', 1, 2]] }, peliade: { hp: 5, drop: [['venin', 1, 1], ['mue_serpent', 0, 1]] },
  salamandre_noire: { hp: 2, drop: [] }, apollon: { hp: 1, drop: [] }, tichodrome: { hp: 2, drop: [['plume_tichodrome', 1, 1]] },
  grand_duc: { hp: 14, drop: [['plume_hibou', 2, 3]] }, vautour_fauve: { hp: 30, drop: [['plume', 3, 5]] }, gypaete: { hp: 25, drop: [['plume_gypaete', 1, 2]] },
  foulque: { hp: 6, drop: [['viande', 1, 1], ['plume', 1, 1]] }, mouette: { hp: 4, drop: [['plume', 1, 1]] }, guignette: { hp: 2, drop: [['plume', 0, 1]] },
  campagnol_amphibie: { hp: 4, drop: [['viande', 0, 1, 0.4]] }, couleuvre_viperine: { hp: 4, drop: [['mue_serpent', 0, 1, 0.6]] },
  oie_cendree: { hp: 14, drop: [['viande', 2, 3], ['plume', 2, 3]] }, harle: { hp: 8, drop: [['viande', 0, 1, 0.5], ['plume', 1, 2]] },
  cormoran: { hp: 10, drop: [['plume_cormoran', 1, 2]] }, balbuzard: { hp: 12, drop: [['plume_balbuzard', 1, 2]] }, vison: { hp: 8, drop: [['peau_vison', 1, 1]] },
});
// les objets nouveaux (icônes « e2_… » : 03-zzzzzE2-icones.js)
defItem('plume_huppe', 'Plume de huppe', 'materiau', 4, ['e2_plume', '#d89a50', '#1a1410'], { alch: true, desc: 'Une plume couleur de cannelle, au bout noir et blanc. Les livres de secrets lui prêtent des vertus.' });
defItem('peau_genette', 'Peau de genette', 'chasse', 18, ['e2_peau', '#b8ae98', '#2a2420'], { desc: 'Une peau grise tachée de noir, la queue annelée. Les fourreurs de la ville la vendent sous un autre nom.' });
defItem('minotaure', 'Minotaure', 'tresor', 3, ['n2_insecte', '#1a1a1e', '#3a3a40'], { desc: 'Un scarabée noir à trois cornes, qui gratte encore la paume.' });
defItem('sphinx_tete_mort', 'Sphinx tête-de-mort', 'tresor', 15, ['e2_sphinx', '#6a5034', '#e0b840'], { desc: 'Un gros papillon de nuit, brun et jaune. Sur son dos, une tête de mort. Il a crié quand vous l’avez pris.' });
defItem('apollon', 'Apollon', 'tresor', 12, ['e2_apollon', '#f0eee6', '#c82820'], { desc: 'Un papillon blanc aux yeux rouges, léger comme une cendre.' });
defItem('plume_gypaete', 'Plume de gypaète', 'materiau', 25, ['e2_plume', '#5a5a60', '#e8e4dc'], { alch: true, desc: 'Une longue plume gris ardoise, au tuyau blanc, plus longue que l’avant-bras. Peu de gens peuvent dire en avoir tenu une.' });
defItem('plume_tichodrome', 'Plume de tichodrome', 'materiau', 8, ['e2_plume', '#c42838', '#f0f0f0'], { alch: true, desc: 'Une petite plume rouge carmin, tachée de blanc. Elle a la couleur d’une goutte de sang sur la pierre.' });
defItem('plume_lyre', 'Plume de tétras lyre', 'materiau', 6, ['e2_lyre', '#1a1c2a', '#3a4a7a'], { alch: true, desc: 'Une plume noire recourbée, d’un noir bleu. Les montagnards la portent au chapeau : elle dit qu’on a eu le coq.' });
defItem('peau_vison', 'Peau de vison', 'chasse', 30, ['e2_peau', '#4a3226', '#e8e0d0'], { desc: 'Une peau d’un brun sombre, d’une douceur qu’on ne croit pas. Elle vaut très cher.' });
defItem('plume_balbuzard', 'Plume de balbuzard', 'materiau', 8, ['e2_plume', '#6a4a30', '#f0ece4'], { alch: true, desc: 'Une plume brune barrée de clair, raide et serrée : l’eau glisse dessus.' });
defItem('plume_cormoran', 'Plume de cormoran', 'materiau', 2, ['e2_plume', '#1a1a1a', '#5a4a2a'], { alch: true, desc: 'Une plume noire, huileuse, aux reflets de bronze. Elle sent le poisson.' });
defItem('os_gypaete', 'Os brisé', 'materiau', 6, ['os', '#ece6d4'], { alch: true, desc: 'Un éclat d’os, poli et blanchi, tombé du ciel sur les rochers. Quelque chose l’avait choisi.' });
Object.assign(ESSENCES, {
  plume_huppe: { esprit: 2, sort: 1, air: 1 }, peau_genette: { ombre: 2, feu: 1 }, minotaure: { terre: 3, sang: 1 }, sphinx_tete_mort: { mort: 3, ombre: 1, air: 1 },
  apollon: { lumiere: 2, air: 2, froid: 1 }, plume_gypaete: { air: 3, mort: 1, lumiere: 1 }, plume_tichodrome: { sang: 2, air: 1, terre: 1 },
  plume_lyre: { ombre: 1, air: 2, sang: 1 }, peau_vison: { eau: 2, ombre: 1, feu: 1 }, plume_balbuzard: { eau: 2, air: 2 }, plume_cormoran: { eau: 2, ombre: 1 },
  os_gypaete: { mort: 2, air: 1, terre: 1 },
});
// (les insectes au filet sont des « trésors », comme la lucane et la mante : ils n'ont pas d'essence à l'alambic,
//  sauf le minotaure, le sphinx et l'apollon, qu'on peut piler : alch)
for (const id of ['minotaure', 'sphinx_tete_mort', 'apollon']) ITEMS[id].alch = true;
