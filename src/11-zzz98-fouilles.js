// ============================================================================
//  FOUILLES : dans la ville, le hameau et les autres lieux habités, des dizaines
//  d'endroits à fouiller (touche E) : armoires, commodes, buffets, malles,
//  secrétaire et coffre-fort de la mairie, tiroirs-caisses des boutiques,
//  tonneaux et cave de l'auberge, pétrin, casiers du tri et boîte aux lettres,
//  sacristie et tronc des pauvres, tiroirs de l'apothicaire, sellerie, grange,
//  charrettes, caisses et étals, linge, poulaillers, tas de bois, poubelles,
//  et des cachettes que seuls certains papiers révèlent.
//  - chaque endroit a sa table de butin (objets du quotidien, pièces, nourriture,
//    outils, parfois un objet rare), et souvent des lettres et papiers intimes
//    qui racontent les habitants (on les relit dans la sacoche, onglet Lettres) ;
//  - fouiller chez quelqu'un ou dans son commerce, c'est voler : vu, c'est
//    societe.crime 'vol', l'amitié qui chute, la mentalité qui baisse, le garde
//    qui accourt ; pas vu, le lendemain l'habitant se plaint ; les objets pris
//    chez lui se reconnaissent (marques du vol à la tire) ;
//  - certains meubles sont fermés à clé : une clé (volée, trouvée) ou le
//    crochetage (crochetage.tenter, agent M) ;
//  - tout se remplit de nouveau avec le temps (un à sept jours selon l'endroit).
//  Génération : après tout le reste de la vallée, avec son propre tirage.
//  État : farm.s.fouille2 = { vides: {id: jour}, ouverts: {id: jour},
//         papiers: [id], lus: {id: 1}, ou: {id: texte}, caches: {c: 1},
//         prises: {c: jour}, plaintes: {pnj: jour}, n, pris }
//  API : fouilles (fouiller(it), vide(it), temoins(it, proprio), dedans(n, bld),
//        presents(bld), lirePapier(id), garderPapier(id), etiquettes, libres)
// ============================================================================

// ---------------------------------------------------------------- objets du quotidien
const F2_OBJETS = [
  ['bobine_fil', 'Bobine de fil', 'materiau', 4, ['rond', '#d8d0c0'], 'Du fil de lin écru, enroulé serré sur une bobine de bois. Quelqu’un comptait s’en servir.'],
  ['de_coudre', 'Dé à coudre d’argent', 'tresor', 14, ['rond', '#c8c8d0'], 'Usé au bout, là où l’aiguille pousse. Il a la taille d’un doigt de femme.'],
  ['cuillere_argent', 'Cuillère d’argent', 'tresor', 35, ['objet', '#d0d0d8'], 'Gravée d’une initiale. Le reste du service doit dormir dans un buffet.'],
  ['bougeoir', 'Bougeoir d’étain', 'tresor', 26, ['lampe', '#9a9aa2'], 'Une coulure de cire figée sur le pied, comme une larme.'],
  ['besicles', 'Besicles', 'tresor', 30, ['anneau', '#b8a888'], 'Des lunettes rondes, un verre fêlé. Le monde, à travers, penche un peu.'],
  ['peigne_corne', 'Peigne de corne', 'tresor', 8, ['objet', '#c8a878'], 'Il y reste un cheveu, long et gris.'],
  ['savon', 'Pain de savon', 'materiau', 6, ['tas', '#e8e0c8'], 'Du savon de Marseille, qui sent la lessive du Lavedi.'],
  ['ruban', 'Ruban de soie', 'tresor', 9, ['sachet', '#b83a50'], 'Un ruban rouge, noué puis dénoué tant de fois qu’il a gardé la forme du nœud.'],
  ['bille', 'Bille de verre', 'tresor', 3, ['rond', '#6ab0d0'], 'Une spirale bleue prise dans le verre. Les enfants l’appellent « l’œil ».'],
  ['boutons_nacre', 'Boutons de nacre', 'tresor', 10, ['rond', '#f0ece0'], 'Six boutons cousus sur un carton. Il en manque un.'],
  ['image_pieuse', 'Image pieuse', 'tresor', 5, ['carte', '#e8d8a8'], 'Une sainte aux yeux levés. Au dos, au crayon : « Pour que tu reviennes. »'],
  ['meche_cheveux', 'Mèche de cheveux', 'tresor', 2, ['sachet', '#8a6a3a'], 'Nouée d’un fil rouge, dans un papier plié. Il y a un prénom sur le papier. Ce n’est pas le vôtre.'],
  ['jeu_cartes', 'Jeu de cartes', 'tresor', 15, ['carte', '#c83030'], 'Trente-deux cartes cornées. Le valet de pique a été redessiné à l’encre.'],
  ['des_pipes', 'Dés pipés', 'tresor', 20, ['os', '#e8e0d0'], 'Deux dés en os, un peu trop lourds d’un côté. Aux dés de l’auberge, ils aideraient… si personne ne s’en aperçoit.'],
  ['tabac', 'Blague à tabac', 'tresor', 12, ['sachet', '#6a4a2a'], 'Du gris, sec, dans une blague de cuir. L’odeur de quelqu’un.'],
  ['eau_cologne', 'Eau de Cologne', 'tresor', 30, ['fiole', '#c0d8e8'], 'Un flacon à moitié plein. Bergamote, et quelque chose de plus triste.'],
  ['clous', 'Poignée de clous', 'materiau', 4, ['tas', '#7a7a80'], 'Des clous de charpentier, forgés à la main, encore gras.'],
  ['fer_cheval', 'Fer à cheval', 'materiau', 15, ['fer', '#6a6a70'], 'Un fer usé. Il porte chance, dit-on, si on le cloue les branches en haut.'],
  ['timbres', 'Timbres-poste', 'tresor', 8, ['lettre', '#c84040'], 'Une bande de timbres rouges, à l’effigie d’une République qui regarde ailleurs.'],
  ['cire', 'Bâton de cire', 'materiau', 5, ['bougie', '#b02020'], 'De la cire à cacheter, rouge sombre. Elle a déjà scellé bien des secrets.'],
  ['encrier', 'Encrier', 'tresor', 14, ['pot', '#2a2a3a'], 'Un encrier de verre, l’encre séchée au fond comme un lac noir.'],
  ['calice_etain', 'Calice d’étain', 'tresor', 60, ['calice', '#a8a8b0'], 'Le calice des jours ordinaires. Le beau, en vermeil, a disparu depuis longtemps.'],
  ['calice_vermeil', 'Calice de vermeil', 'tresor', 380, ['calice', '#e0b050'], 'Le calice de l’église, qu’on disait volé. Lourd, froid. Contre l’oreille, on entend la cloche.'],
];
for (const [id, name, cat, price, ic, desc] of F2_OBJETS) if (!ITEMS[id]) defItem(id, name, cat, price, ic, { desc });
defItem('cle_bureau', 'Petite clé de laiton', 'quete', 0, ['cle', '#d0b060'], { unique: true, desc: 'Une clé de meuble, dentée fin. Elle ouvre un bureau, quelque part, où l’on range ce qu’on ne veut pas montrer.' });
defItem('cle_cave', 'Clé de la cave', 'quete', 0, ['cle', '#6a6a70'], { unique: true, desc: 'Une grosse clé de fer, attachée à un bouchon de liège. « Cave — ne pas descendre seul. »' });

// ---------------------------------------------------------------- tables de butin : [objet, min, max, poids]
Object.assign(LOOT, {
  f2_armoire: { rolls: [1, 3], items: [['toile', 1, 2, 4], ['laine', 1, 1, 1], ['mouchoir_brode', 1, 1, 2], ['boutons_nacre', 1, 1, 2], ['ruban', 1, 1, 2], ['bougie', 1, 2, 3], ['savon', 1, 1, 2], ['argent', 3, 18, 3], ['peigne_corne', 1, 1, 1.5], ['eau_cologne', 1, 1, 0.6], ['vieille_piece', 1, 1, 0.5], ['bijou', 1, 1, 0.2], ['medaillon_portrait', 1, 1, 0.25], ['meche_cheveux', 1, 1, 0.3]] },
  f2_archives: { rolls: [1, 2], items: [['bougie', 1, 3, 3], ['cire', 1, 1, 3], ['plume', 1, 3, 2], ['encrier', 1, 1, 1], ['timbres', 1, 1, 1], ['vieille_piece', 1, 1, 1], ['argent', 2, 10, 1], ['cle_bureau', 1, 1, 0.7], ['carte_vallee', 1, 1, 0.15]] },
  f2_commode: { rolls: [1, 3], items: [['de_coudre', 1, 1, 2], ['bobine_fil', 1, 3, 3], ['boutons_nacre', 1, 1, 2], ['ruban', 1, 1, 2], ['mouchoir_brode', 1, 1, 2], ['image_pieuse', 1, 1, 2], ['besicles', 1, 1, 0.8], ['argent', 2, 15, 3], ['bougie', 1, 2, 2], ['tabac', 1, 1, 1], ['bille', 1, 2, 0.5], ['montre', 1, 1, 0.1], ['bijou', 1, 1, 0.2], ['meche_cheveux', 1, 1, 0.4]] },
  f2_buffet: { rolls: [1, 3], items: [['cuillere_argent', 1, 2, 1.5], ['bougeoir', 1, 1, 1], ['toile', 1, 1, 2], ['pain', 1, 2, 2], ['fromage', 1, 1, 1.5], ['confiture', 1, 1, 1.5], ['cidre', 1, 1, 1], ['vin', 1, 1, 0.6], ['sel', 1, 2, 2], ['miel', 1, 1, 0.5], ['argent', 2, 10, 1], ['bougie', 1, 2, 2], ['jeu_cartes', 1, 1, 0.5]] },
  f2_malle: { rolls: [1, 3], items: [['toile', 1, 2, 3], ['laine', 1, 2, 2], ['cuir', 1, 1, 1.5], ['corde', 1, 1, 2], ['bougie', 1, 2, 2], ['vieille_piece', 1, 2, 1.5], ['bijou', 1, 1, 0.4], ['montre', 1, 1, 0.2], ['boussole', 1, 1, 0.2], ['carte_tresor', 1, 1, 0.3], ['figurine', 1, 1, 0.6], ['livre_contes', 1, 1, 0.15], ['argent', 5, 30, 2], ['meche_cheveux', 1, 1, 0.3], ['tabatiere', 1, 1, 0.3], ['lanterne', 1, 1, 0.15]] },
  f2_secretaire: { rolls: [2, 3], items: [['argent', 10, 45, 3], ['cire', 1, 1, 3], ['encrier', 1, 1, 1.5], ['plume', 1, 3, 2], ['timbres', 1, 1, 1.5], ['vieille_piece', 1, 2, 2], ['tabatiere', 1, 1, 0.6], ['bijou', 1, 1, 0.3], ['besicles', 1, 1, 0.8]] },
  f2_coffre_commune: { rolls: [1, 2], items: [['argent', 40, 140, 5], ['vieille_piece', 1, 3, 2], ['lingot_or', 1, 1, 0.2], ['bijou', 1, 1, 0.5], ['relique', 1, 1, 0.15]] },
  f2_caisse_auberge: { rolls: [1, 2], items: [['argent', 8, 40, 7], ['jeu_cartes', 1, 1, 0.8], ['des_pipes', 1, 1, 0.6], ['cle_cave', 1, 1, 0.7], ['tabac', 1, 1, 0.8]] },
  f2_caisse_boulangerie: { rolls: [1, 2], items: [['argent', 5, 30, 7], ['pain', 1, 1, 2], ['brioche', 1, 1, 1], ['ruban', 1, 1, 0.5]] },
  f2_caisse_poste: { rolls: [1, 2], items: [['argent', 5, 28, 6], ['timbres', 1, 2, 3], ['cire', 1, 1, 1.5], ['plume', 1, 2, 1]] },
  f2_caisse_graineterie: { rolls: [1, 2], items: [['argent', 6, 32, 7], ['graines_tournesol', 2, 4, 1], ['graines_fraise', 1, 3, 1], ['sac_graines', 1, 1, 1]] },
  f2_tonneaux: { rolls: [1, 2], items: [['cidre', 1, 2, 4], ['vin', 1, 1, 2], ['biere', 1, 1, 2], ['cervoise', 1, 1, 1], ['eau_de_vie_cidre', 1, 1, 0.4]] },
  f2_petrin: { rolls: [1, 2], items: [['farine', 1, 3, 5], ['sel', 1, 1, 2], ['pain', 1, 2, 2], ['brioche', 1, 1, 1], ['argent', 1, 8, 0.6], ['bijou', 1, 1, 0.12]] },
  f2_tresors: { rolls: [1, 2], items: [['bille', 1, 4, 4], ['ruban', 1, 1, 3], ['figurine', 1, 1, 1.5], ['plume', 1, 2, 2], ['image_pieuse', 1, 1, 1], ['fleur', 1, 2, 1], ['tesson', 1, 1, 1], ['vieille_piece', 1, 1, 0.4]] },
  f2_tri: { rolls: [1, 1], items: [['timbres', 1, 1, 2], ['argent', 1, 6, 1], ['cire', 1, 1, 1]] },
  f2_colis: { rolls: [1, 2], items: [['toile', 1, 2, 2], ['sel', 1, 2, 2], ['bougie', 2, 4, 2], ['fiole', 1, 2, 1], ['confiture', 1, 1, 1], ['tabac', 1, 1, 1], ['eau_cologne', 1, 1, 0.7], ['graines_basilic', 2, 4, 0.8], ['livre_contes', 1, 1, 0.2], ['livre_manuel_cuisine', 1, 1, 0.15], ['montre', 1, 1, 0.1], ['boussole', 1, 1, 0.1], ['carte_ouest', 1, 1, 0.1], ['carte_sud', 1, 1, 0.1]] },
  f2_commode_postiere: { rolls: [1, 2], items: [['argent', 4, 20, 3], ['timbres', 1, 2, 2], ['ruban', 1, 1, 1.5], ['medaillon_portrait', 1, 1, 0.4], ['eau_cologne', 1, 1, 0.6]] },
  f2_baquet: { rolls: [1, 1], items: [['fer_cheval', 1, 1, 3], ['clous', 1, 3, 3], ['lingot_fer', 1, 1, 0.8], ['minerai_fer', 1, 2, 1], ['charbon', 1, 2, 1], ['bijou', 1, 1, 0.25]] },
  f2_outils: { rolls: [1, 3], items: [['clous', 1, 4, 4], ['fer_cheval', 1, 1, 2], ['corde', 1, 1, 2], ['lingot_fer', 1, 1, 1], ['lingot_cuivre', 1, 1, 1], ['marteau', 1, 1, 0.3], ['cisailles', 1, 1, 0.2], ['charbon', 1, 3, 2], ['argent', 1, 6, 0.5]] },
  f2_semences: { rolls: [1, 2], items: [['graines_ble', 2, 6, 3], ['graines_carotte', 2, 5, 3], ['graines_chou', 1, 4, 2], ['graines_fraise', 1, 3, 1.5], ['graines_tomate', 1, 3, 1.5], ['graines_haricot', 2, 4, 2], ['graines_tournesol', 1, 3, 1.5], ['graines_lin', 2, 5, 2], ['sac_graines', 1, 1, 1]] },
  f2_farine: { rolls: [1, 1], items: [['farine', 1, 3, 6], ['sel', 1, 1, 1]] },
  f2_coffre_garde: { rolls: [1, 3], items: [['cartouche', 2, 6, 2], ['bougie', 1, 3, 2], ['pain', 1, 1, 1], ['argent', 5, 20, 2], ['tabac', 1, 1, 1], ['lanterne', 1, 1, 0.3], ['corde', 1, 1, 1], ['couteau_poche', 1, 1, 0.5]] },
  f2_sacristie: { rolls: [1, 3], items: [['bougie', 2, 5, 5], ['eau_benite', 1, 2, 3], ['vin', 1, 1, 1.5], ['chapelet_buis', 1, 1, 1.5], ['image_pieuse', 1, 2, 2], ['calice_etain', 1, 1, 0.5], ['argent', 2, 12, 1], ['toile', 1, 1, 1]] },
  f2_malle_cure: { rolls: [1, 2], items: [['bougie', 1, 3, 3], ['chapelet_buis', 1, 1, 1], ['image_pieuse', 1, 1, 2], ['besicles', 1, 1, 1], ['tisane', 1, 1, 1.5], ['argent', 3, 12, 1.5], ['livre_contes', 1, 1, 0.2]] },
  f2_tronc: { rolls: [1, 1], items: [['argent', 3, 25, 8], ['vieille_piece', 1, 1, 0.4], ['boutons_nacre', 1, 1, 1]] },
  f2_apothicaire: { rolls: [1, 3], items: [['fiole', 1, 3, 4], ['sel', 1, 2, 3], ['lichen', 1, 2, 2], ['herbes', 1, 2, 2], ['rosee', 1, 1, 1.5], ['venin', 1, 1, 1], ['mue_serpent', 1, 1, 1], ['poudre_os', 1, 2, 1.5], ['aile_chauve_souris', 1, 1, 1], ['champi_lumineux', 1, 1, 0.8], ['mandragore', 1, 1, 0.2], ['potion_soin', 1, 1, 0.4], ['antidote', 1, 1, 0.3], ['argent', 2, 12, 1]] },
  f2_charrette_foin: { rolls: [1, 2], items: [['foin', 2, 5, 5], ['avoine', 1, 3, 2], ['corde', 1, 1, 1], ['pomme', 1, 3, 1]] },
  f2_charrette_tonneaux: { rolls: [1, 2], items: [['cidre', 1, 2, 4], ['vin', 1, 1, 1.5], ['biere', 1, 1, 1.5], ['huile', 1, 1, 0.6]] },
  f2_legumes: { rolls: [1, 2], items: [['carotte', 1, 3, 3], ['chou', 1, 1, 2], ['patate', 2, 4, 3], ['poireau', 1, 2, 2], ['oignon', 1, 3, 2], ['navet', 1, 3, 2], ['betterave', 1, 2, 1]] },
  f2_fruits: { rolls: [1, 2], items: [['pomme', 2, 4, 4], ['poire', 1, 3, 3], ['prune', 2, 4, 2], ['cerise', 2, 5, 2], ['noix', 2, 4, 1]] },
  f2_fromages: { rolls: [1, 2], items: [['fromage', 1, 1, 4], ['fromage_chevre', 1, 1, 2], ['beurre', 1, 1, 2], ['oeuf', 1, 3, 2], ['lait', 1, 1, 1]] },
  f2_poissons: { rolls: [1, 2], items: [['gardon', 1, 2, 4], ['perche', 1, 1, 3], ['carpe', 1, 1, 2], ['poisson_fume', 1, 1, 1], ['ecrevisse', 1, 3, 1]] },
  f2_pains: { rolls: [1, 2], items: [['pain', 1, 2, 5], ['brioche', 1, 1, 2], ['galette', 1, 1, 1.5], ['pain_mais', 1, 1, 1]] },
  f2_poteries: { rolls: [1, 1], items: [['argile', 1, 3, 3], ['tesson', 1, 2, 3], ['pot_fleurs', 1, 1, 1], ['argent', 1, 5, 0.5]] },
  f2_fleurs: { rolls: [1, 2], items: [['fleur', 2, 4, 4], ['bouquet', 1, 1, 2], ['rose', 1, 2, 1.5], ['tulipe', 1, 2, 1.5], ['lavande', 1, 2, 1]] },
  f2_tissus: { rolls: [1, 2], items: [['toile', 1, 2, 4], ['laine', 1, 2, 2], ['ruban', 1, 1, 2], ['mouchoir_brode', 1, 1, 1.5], ['boutons_nacre', 1, 1, 1.5], ['bobine_fil', 1, 2, 2]] },
  f2_bois: { rolls: [1, 1], items: [['bois', 2, 5, 8], ['oeuf', 1, 1, 0.5], ['fibre', 1, 2, 1], ['vieille_piece', 1, 1, 0.2], ['couteau_poche', 1, 1, 0.1]] },
  f2_linge: { rolls: [1, 1], items: [['toile', 1, 1, 4], ['mouchoir_brode', 1, 1, 2], ['laine', 1, 1, 1], ['ruban', 1, 1, 1]] },
  f2_oeufs: { rolls: [1, 1], items: [['oeuf', 1, 3, 10], ['plume', 1, 2, 2]] },
  f2_boite: { rolls: [1, 1], items: [['timbres', 1, 1, 1], ['argent', 1, 5, 1]] },
  f2_poubelle: { rolls: [1, 2], items: [['os', 1, 2, 3], ['tesson', 1, 2, 3], ['charbon', 1, 1, 1], ['bougie', 1, 1, 1], ['pain', 1, 1, 0.5], ['pomme', 1, 1, 0.5], ['plume', 1, 2, 1], ['fibre', 1, 2, 1], ['vieille_piece', 1, 1, 0.2], ['bijou', 1, 1, 0.05], ['pilule_joie', 1, 1, 0.25], ['boutons_nacre', 1, 1, 0.4], ['bille', 1, 1, 0.3], ['besicles', 1, 1, 0.1]] },
  f2_foin: { rolls: [1, 1], items: [['foin', 2, 5, 6], ['oeuf', 1, 2, 1.5], ['plume', 1, 1, 1], ['bijou', 1, 1, 0.1], ['montre', 1, 1, 0.08], ['fibre', 1, 2, 1]] },
  f2_grange_sacs: { rolls: [1, 2], items: [['avoine', 1, 3, 4], ['orge', 1, 3, 2], ['seigle', 1, 3, 2], ['farine', 1, 1, 1], ['sac_graines', 1, 1, 1]] },
  f2_sellerie: { rolls: [1, 2], items: [['cuir', 1, 1, 3], ['corde', 1, 1, 3], ['friandise', 1, 2, 2], ['fer_cheval', 1, 1, 2], ['selle', 1, 1, 0.15], ['harnais', 1, 1, 0.1], ['argent', 2, 10, 0.8]] },
  f2_bocaux: { rolls: [1, 3], items: [['herbes', 1, 2, 4], ['reine_pres', 1, 2, 2], ['achillee', 1, 2, 2], ['millepertuis', 1, 1, 2], ['valeriane', 1, 1, 2], ['camomille', 1, 2, 1], ['digitale', 1, 1, 0.7], ['aconit', 1, 1, 0.4], ['rosee', 1, 1, 1], ['mue_serpent', 1, 1, 0.8], ['tisane', 1, 1, 1], ['infusion', 1, 1, 0.8]] },
  f2_jarre: { rolls: [1, 1], items: [['herbes', 1, 3, 4], ['lichen', 1, 2, 2], ['sel', 1, 1, 1], ['champignon', 1, 2, 2]] },
  f2_peche: { rolls: [1, 2], items: [['vers', 2, 6, 4], ['poisson_fume', 1, 1, 2], ['corde', 1, 1, 2], ['carpe', 1, 1, 1], ['coffre_peche', 1, 1, 0.2], ['perle', 1, 1, 0.1], ['argent', 2, 10, 1]] },
  f2_chasse: { rolls: [1, 3], items: [['cartouche', 2, 8, 3], ['fleche', 4, 10, 2], ['cuir', 1, 1, 2], ['fourrure', 1, 1, 1], ['viande_fumee', 1, 1, 2], ['appeau', 1, 1, 0.5], ['graisse_ours', 1, 1, 0.3], ['croc', 1, 1, 0.8], ['argent', 3, 15, 1]] },
  f2_roulotte: { rolls: [1, 3], items: [['sel', 1, 2, 3], ['corde', 1, 1, 2], ['toile', 1, 2, 2], ['bougie', 1, 3, 2], ['fiole', 1, 2, 1], ['tabac', 1, 1, 1], ['eau_cologne', 1, 1, 0.6], ['carte_centre', 1, 1, 0.15], ['carte_ouest', 1, 1, 0.15], ['carte_sud', 1, 1, 0.15], ['livre_contes', 1, 1, 0.2], ['vieille_piece', 1, 1, 1], ['argent', 5, 30, 2], ['bijou', 1, 1, 0.3]] },
  f2_sources: { rolls: [1, 2], items: [['huile', 1, 1, 2], ['miel', 1, 1, 2], ['toile', 1, 1, 3], ['savon', 1, 1, 2], ['herbes', 1, 2, 1], ['fiole', 1, 1, 1], ['argent', 1, 8, 0.5]] },
  f2_nain: { rolls: [1, 2], items: [['lentille', 1, 1, 1], ['gemme', 1, 1, 0.8], ['lingot_fer', 1, 2, 2], ['lingot_acier', 1, 1, 0.5], ['minerai_or', 1, 2, 1], ['mousse_nains', 1, 2, 2], ['pain', 1, 1, 1], ['argent', 5, 20, 0.5]] },
  f2_abandon: { rolls: [1, 2], items: [['toile', 1, 1, 3], ['laine', 1, 1, 1], ['bougie', 1, 2, 2], ['vieille_piece', 1, 1, 1], ['tesson', 1, 1, 1], ['mouchoir_brode', 1, 1, 1], ['boutons_nacre', 1, 1, 1], ['meche_cheveux', 1, 1, 0.5], ['bijou', 1, 1, 0.3], ['image_pieuse', 1, 1, 1], ['livre_contes', 1, 1, 0.1]] },
  f2_abandon_commode: { rolls: [1, 2], items: [['bobine_fil', 1, 2, 2], ['de_coudre', 1, 1, 1.5], ['besicles', 1, 1, 0.8], ['image_pieuse', 1, 1, 2], ['bougie', 1, 1, 2], ['argent', 1, 8, 1], ['bille', 1, 2, 1], ['meche_cheveux', 1, 1, 0.5], ['vieille_piece', 1, 1, 0.6]] },
  f2_cave_tonneaux: { rolls: [1, 2], items: [['cidre', 1, 2, 4], ['vin', 1, 2, 3], ['biere', 1, 1, 2], ['cervoise', 1, 1, 1], ['eau_de_vie_cidre', 1, 1, 0.6]] },
  f2_cave_casier: { rolls: [1, 2], items: [['vin', 1, 2, 5], ['eau_de_vie_poire', 1, 1, 0.6], ['kirsch', 1, 1, 0.5], ['marc', 1, 1, 0.5], ['fine', 1, 1, 0.3], ['liqueur_cassis', 1, 1, 0.5], ['hydromel', 1, 1, 0.4]] },
  f2_cave_jambons: { rolls: [1, 2], items: [['viande_fumee', 1, 2, 5], ['fromage', 1, 1, 2], ['oignon', 1, 3, 1], ['ail', 1, 3, 1]] },
  f2_cave_caisse: { rolls: [1, 3], items: [['farine', 1, 2, 3], ['sel', 1, 2, 2], ['pomme', 1, 3, 3], ['patate', 2, 4, 2], ['oignon', 1, 3, 2], ['bougie', 1, 2, 2], ['argent', 2, 12, 1], ['vieille_piece', 1, 1, 0.5], ['jeu_cartes', 1, 1, 0.3]] },
});

// ---------------------------------------------------------------- les endroits : libellé, table, durée, bruit, chance de papier, jours pour se remplir, hauteur
const F2_TYPES = {
  armoire: { lab: 'Fouiller l’armoire', table: 'f2_armoire', d: 1.6, son: 'bois', p: 0.35, r: 3, h: 1.1 },
  commode: { lab: 'Fouiller la commode', table: 'f2_commode', d: 1.4, son: 'bois', p: 0.4, r: 3, h: 0.8 },
  buffet: { lab: 'Fouiller le buffet', table: 'f2_buffet', d: 1.4, son: 'vaisselle', p: 0.15, r: 3, h: 0.9 },
  malle: { lab: 'Ouvrir la malle', table: 'f2_malle', d: 1.6, son: 'bois', p: 0.4, r: 4, h: 0.55 },
  secretaire: { lab: 'Fouiller le secrétaire', table: 'f2_secretaire', d: 1.8, son: 'papier', p: 0.75, r: 3, h: 0.9 },
  coffre_fort: { lab: 'Ouvrir le coffre-fort', table: 'f2_coffre_commune', d: 1.5, son: 'metal', p: 0, r: 7, h: 0.75 },
  tiroir: { lab: 'Fouiller le tiroir-caisse', table: 'f2_caisse_auberge', d: 0.9, son: 'monnaie', p: 0.1, r: 1, h: 1.1, vides: ['(La caisse est vide. La recette du jour est déjà rangée ailleurs.)'] },
  tonneaux: { lab: 'Remplir un pichet en douce', table: 'f2_tonneaux', d: 1.2, son: 'eau', p: 0, r: 2, h: 0.95, vides: ['(Le robinet ne donne plus qu’un filet. Il faudra attendre qu’on mette un fût en perce.)'] },
  petrin: { lab: 'Fouiller le pétrin', table: 'f2_petrin', d: 1.3, son: 'farine', p: 0.1, r: 2, h: 0.95 },
  boite_tresors: { lab: 'Ouvrir la boîte à trésors', table: 'f2_tresors', d: 1.0, son: 'bois', p: 0.6, r: 4, h: 0.35, enfant: true },
  casier_tri: { lab: 'Fouiller les casiers du tri', table: 'f2_tri', d: 1.4, son: 'papier', p: 0.85, r: 2, h: 1.2 },
  colis: { lab: 'Fouiller les colis', table: 'f2_colis', d: 1.6, son: 'papier', p: 0.05, r: 3, h: 0.7 },
  baquet: { lab: 'Plonger la main dans le baquet', table: 'f2_baquet', d: 1.4, son: 'eau', p: 0, r: 4, h: 0.95 },
  coffre_outils: { lab: 'Fouiller le coffre à outils', table: 'f2_outils', d: 1.4, son: 'metal', p: 0.05, r: 3, h: 0.55 },
  sacs_grain: { lab: 'Fouiller les sacs', table: 'f2_semences', d: 1.2, son: 'grain', p: 0, r: 2, h: 0.6 },
  sacristie: { lab: 'Fouiller l’armoire de la sacristie', table: 'f2_sacristie', d: 1.6, son: 'bois', p: 0.4, r: 4, h: 1.1 },
  tronc: { lab: 'Forcer le tronc des pauvres', table: 'f2_tronc', d: 1.0, son: 'monnaie', p: 0, r: 2, h: 0.95, vides: ['(Le tronc est vide. Les pauvres aussi, sans doute.)'] },
  apothicaire: { lab: 'Fouiller les tiroirs de l’apothicaire', table: 'f2_apothicaire', d: 1.6, son: 'verre', p: 0.35, r: 3, h: 1.0 },
  charrette: { lab: 'Fouiller la charrette', table: 'charrette', d: 1.4, son: 'bois', p: 0.05, r: 2, h: 1.0 },
  caisses: { lab: 'Chaparder dans les caisses', table: 'f2_legumes', d: 1.0, son: 'bois', p: 0, r: 2, h: 0.9 },
  etal: { lab: 'Chaparder à l’étal', table: 'f2_legumes', d: 0.9, son: 'bois', p: 0, r: 1, h: 1.0, vides: ['(Il ne reste que des feuilles de chou et de la paille.)'] },
  tas_bois: { lab: 'Fouiller le tas de bois', table: 'f2_bois', d: 1.2, son: 'bois', p: 0, r: 3, h: 0.7 },
  linge: { lab: 'Décrocher du linge', table: 'f2_linge', d: 0.8, son: 'tissu', p: 0, r: 2, h: 1.5, vides: ['(Il ne sèche plus que des torchons troués.)'] },
  poulailler: { lab: 'Chaparder des œufs', table: 'f2_oeufs', d: 1.0, son: 'poule', p: 0, r: 1, h: 0.6, vides: ['(Pas un œuf. Les poules vous regardent de travers.)'] },
  boite_lettres: { lab: 'Fouiller la boîte aux lettres', table: 'f2_boite', d: 1.2, son: 'papier', p: 0.9, r: 1, h: 1.1 },
  poubelle: { lab: 'Fouiller la poubelle', table: 'f2_poubelle', d: 1.2, son: 'metal', p: 0.35, r: 1, h: 0.8, vides: ['(Rien que des épluchures et de la cendre.)', '(Il n’y a plus que des épluchures.)'] },
  foin: { lab: 'Fouiller le foin', table: 'f2_foin', d: 1.8, son: 'foin', p: 0, r: 3, h: 0.8 },
  sacs_avoine: { lab: 'Fouiller les sacs d’avoine', table: 'f2_grange_sacs', d: 1.2, son: 'grain', p: 0, r: 3, h: 0.6 },
  sellerie: { lab: 'Fouiller la sellerie', table: 'f2_sellerie', d: 1.4, son: 'cuir', p: 0.25, r: 3, h: 0.9 },
  bocaux: { lab: 'Fouiller les bocaux', table: 'f2_bocaux', d: 1.4, son: 'verre', p: 0.3, r: 3, h: 1.2 },
  jarre: { lab: 'Fouiller la jarre', table: 'f2_jarre', d: 1.0, son: 'terre', p: 0.25, r: 3, h: 0.6 },
  coffre_peche: { lab: 'Ouvrir le coffre de pêche', table: 'f2_peche', d: 1.4, son: 'bois', p: 0.45, r: 3, h: 0.55 },
  coffre_chasse: { lab: 'Ouvrir le coffre du chasseur', table: 'f2_chasse', d: 1.5, son: 'bois', p: 0.4, r: 4, h: 0.55 },
  coffre_roulotte: { lab: 'Ouvrir le coffre de la roulotte', table: 'f2_roulotte', d: 1.5, son: 'bois', p: 0.4, r: 3, h: 0.55 },
  coffre_nain: { lab: 'Ouvrir le coffre de pierre', table: 'f2_nain', d: 1.8, son: 'pierre', p: 0, r: 5, h: 0.7 },
  cave_tonneaux: { lab: 'Remplir une cruche aux tonneaux', table: 'f2_cave_tonneaux', d: 1.3, son: 'eau', p: 0, r: 2, h: 0.95 },
  cave_casier: { lab: 'Fouiller le casier à bouteilles', table: 'f2_cave_casier', d: 1.3, son: 'verre', p: 0, r: 3, h: 1.1 },
  cave_jambons: { lab: 'Décrocher un jambon', table: 'f2_cave_jambons', d: 1.1, son: 'cuir', p: 0, r: 3, h: 1.5 },
  cave_caisse: { lab: 'Fouiller les caisses de la cave', table: 'f2_cave_caisse', d: 1.4, son: 'bois', p: 0.35, r: 3, h: 0.8 },
  cache: { lab: 'Fouiller la cachette', table: null, d: 1.4, son: 'pierre', p: 0, r: 99999, h: 0.5 },
};
const F2_VIDES = ['(Vide. Quelqu’un est passé avant vous… ou c’était vous.)', '(Il n’y a plus rien.)', '(Rien. Revenez dans quelques jours.)'];

// ---------------------------------------------------------------- les cachettes (révélées par certains papiers ; vidées une fois pour toutes)
const F2_CACHES = {
  puits: { nom: 'la pierre descellée de la margelle', lots: [['argent', 120], ['vieille_piece', 3], ['bijou', 1]] },
  monument: { nom: 'la dalle creuse du monument', lots: [['argent', 60], ['medaillon_portrait', 1]], papier: 'monument_lettres' },
  lavoir: { nom: 'la pierre branlante du lavoir', lots: [['medaillon_portrait', 1], ['ruban', 1], ['vieille_piece', 1]] },
  chene: { nom: 'le creux du vieux chêne', lots: [['carte_tresor', 1], ['vieille_piece', 2], ['boussole', 1]] },
  forge: { nom: 'la boîte en fer sous le tas de bois', lots: [['argent', 85]], own: 'forgeron' },
  hameau: { nom: 'la boîte enterrée sous le banc', lots: [['montre', 1]] },
  clocher: { nom: 'la pierre creuse de l’escalier', lots: [['calice_vermeil', 1]], own: 'cure' },
};

// ---------------------------------------------------------------- les papiers (t : titre, x : texte, s : signature ; pool : où on les trouve ; cache : cachette révélée)
const F2_PAPIERS = {
  // --- la mairie
  maire_registre: { pool: 'maire', t: 'Page d’un registre relié de noir', x: 'Une colonne de noms, une colonne de dates. Toutes les dates tombent des nuits où, écrit en marge, « la lune était rouge ».\n\nLa dernière ligne est de la main de {npc:maire} : un nom barré, réécrit, barré encore.\n\nEn bas de page : « Mon grand-père a commencé. Je voudrais tant finir. »' },
  maire_prefet: { pool: 'maire', t: 'Lettre de la préfecture', x: 'Monsieur le Maire,\n\nNous accusons réception de votre dix-septième demande d’abrogation de l’ordonnance dite « des ponts ». Nous regrettons de vous informer que ladite ordonnance ne figure dans aucun de nos registres.\n\nNous vous saurions gré de ne plus nous écrire à ce sujet, ni à aucun autre.', s: 'Le secrétaire général (signature illisible)' },
  maire_epouse: { pool: 'maire', t: 'Brouillon d’une ligne de registre', x: 'Plusieurs essais, raturés, de la même ligne : « Mme Vasseur — décès. » « … disparition. » « … partie. »\n\nLa dernière version, recopiée au propre : « Départ volontaire. »\n\nEn dessous, plus petit : « Elle a laissé ses souliers devant la porte. Pointes vers la rue. Je n’ai rien dit au garde. »' },
  maire_niece: { pool: 'maire', t: 'Lettre à une nièce, jamais envoyée', x: 'Ma chère {npc:postiere},\n\nTu ouvres les lettres des autres, je le sais, tout le monde le sait. Alors ouvre celle-ci : ne va pas au puits.\n\nJe ne sais pas pourquoi je t’écris cela. Je me suis réveillé avec la phrase dans la bouche, comme un goût de fer.', s: 'Ton oncle qui t’aime' },
  maire_moulin: { pool: 'maire', t: 'Note du maire', x: 'Moulin : ailes enchaînées depuis des années (voir délibération). Farine retrouvée sur le seuil trois matins de suite.\n\nQui moud ? Pour quoi faire ?\n\nNe rien dire au conseil. Le conseil, c’est moi.' },
  ind_monument: { pool: 'maire', cache: 'monument', t: 'Lettre d’un soldat, classée aux archives', x: '« Derrière le monument, la dalle du bas sonne creux. J’y ai mis mes lettres pour Jeanne, et ma solde. Si je ne reviens pas, qu’elle les prenne. »\n\nUne note de la mairie, agrafée : « Jeanne n’est jamais venue. Dossier clos. »' },
  // --- l'auberge et sa cave
  aub_chambre7: { pool: 'aubergiste', t: 'Registre des chambres', x: 'Chambres 1 à 6 : des noms, des nuits, des prix.\n\nChambre 7 : rien, sur des années. Sauf, ici et là, d’une écriture qui n’est pas celle de {npc:aubergiste} : « lit défait », « fenêtre ouverte », « a demandé du lait chaud », « est reparti avant l’aube ».\n\nEt une fois, au crayon : « Merci pour la soupe. — A. »' },
  aub_dette: { pool: 'aubergiste', t: 'Reconnaissance de dette', x: 'Je soussigné Marchal, forgeron à {ville}, reconnais devoir à l’Auberge du Coq Tordu la somme de soixante-dix francs, pour les tournées offertes le soir de la messe pour mon père, et que je rembourserai quand la forge voudra bien.\n\nAu dos, de la main de l’aubergiste : « Payé. Ne jamais lui dire que c’est payé. »' },
  aub_regles: { pool: 'aubergiste', t: 'Mot glissé sous le comptoir', x: 'Ne pas vider la pipe de l’oncle. Ne pas ouvrir la fenêtre de la sept. Ne pas descendre à la cave après minuit, même si on entend rouler un tonneau. Surtout si on entend rouler un tonneau.\n\n— Règles de la maison, recopiées pour la dixième fois, parce que l’encre s’efface toujours de la même ligne.' },
  cave_inventaire: { pool: 'cave', t: 'Inventaire de la cave', x: 'Fûts de cidre : six. Vin de la côte : onze bouteilles. Eau-de-vie de poire : trois.\n\nLe fût du fond : ne pas compter. Il se remplit tout seul.', s: 'Oncle Anatole' },
  cave_craie: { pool: 'cave', t: 'Des traits à la craie', x: 'Sur une planche, des traits à la craie, par paquets de cinq, comme on compte les jours. À côté, d’une écriture tremblée : « Il remonte quand on éteint. Garder une chandelle. Toujours une chandelle. »' },
  // --- la boulangerie
  boul_emile: { pool: 'boulangere', t: 'Un mot sur un sachet de farine', x: 'Au crayon gras : « {npc:boulangere} — le chien aboie vers le bois depuis une heure. Je vais voir. Garde la pâte au chaud, je reviens la façonner. — Émile »\n\nDans le livre de comptes du lendemain, une seule ligne : « Pâte perdue. »' },
  boul_lettre: { pool: 'boulangere', t: 'Lettre jamais postée', x: 'Émile,\n\nLa petite a eu neuf ans. Elle dit qu’elle t’entend chanter sous le fournil. Je lui ai dit que c’était le four qui chauffe. Hier, j’ai chanté avec. Pardonne-moi.\n\nJe garde toujours ta miche sur l’étagère. Personne n’y touche. Elle ne rassit pas. Est-ce que ça veut dire que tu vas revenir ?' },
  boul_recette: { pool: 'boulangere', t: 'Une recette de pain', x: 'Farine, eau, sel, levain de la veille. « Pétrir longtemps. »\n\nEn marge, une autre main, plus lourde : « Plus longtemps. »\n\nEt dessous, la première main : « Qui a écrit ça ? »' },
  // --- la fillette
  fil_lise: { pool: 'fillette', t: 'Un dessin d’enfant', x: 'Deux petites filles se tiennent la main près d’un puits. L’une a des cheveux jaunes et une robe rose. L’autre est coloriée tout en bleu, les cheveux en traits d’eau.\n\nEn grosses lettres : « MOI ET LISE ».\n\nAu dos : « Lise dit que tu peux venir aussi. »' },
  fil_papa: { pool: 'fillette', t: 'Un dessin d’enfant', x: 'Une maison, un four, et sous la terre, en coupe, un homme couché qui ouvre la bouche. Des petites notes de musique montent de lui jusqu’au lit de la fillette.\n\n« PAPA CHANTE ».\n\nLe crayon a percé le papier à l’endroit de la bouche.' },
  fil_ville: { pool: 'fillette', t: 'Un dessin d’enfant', x: 'La ville, dessinée deux fois : en haut, avec le soleil ; en bas, à l’envers, avec une lune rouge. Les gens d’en bas ont les yeux fermés.\n\nIl y en a un, en bas, qui a les yeux ouverts, et qui regarde en haut. Il porte vos habits.' },
  // --- la forge
  forg_amour: { pool: 'forgeron', t: 'Brouillons de lettre', x: 'Six fois le même début, six fois barré : « Madame, » « Chère Madame, » « {npc:boulangere}, » « Chère {npc:boulangere}, » « Ma… »\n\nPuis, d’une traite, sans rature : « Votre pain est bon. »\n\nLe papier a été plié en quatre et déplié si souvent qu’il se déchire aux plis.' },
  forg_mine: { pool: 'forgeron', t: 'Coupure de journal', x: '« Catastrophe à la mine de {ville} : quatorze ouvriers ensevelis. Les secours ont dû renoncer après trois jours, les coups frappés sous la terre ayant cessé. »\n\nQuelqu’un a souligné « ayant cessé » deux fois, et écrit en marge : « Faux. »' },
  forg_serrure: { pool: 'forgeron', t: 'Bon de commande', x: 'Forge Marchal. Une serrure de porte, pêne à l’extérieur, clé côté cour.\n\nClient : Anselme, de la vieille ferme.\n\nMotif, écrit par le client lui-même : « Pour que ce qui est dedans reste dedans. »\n\nPayé d’avance, en vieilles pièces.' },
  ind_forge: { pool: 'forgeron', cache: 'forge', t: 'Note du forgeron', x: 'Économies (pour la bague) : dans la boîte en fer, sous le tas de bois derrière la forge.\n\nNe rien dire à personne. Surtout pas à elle.' },
  // --- la graineterie
  grain_anselme: { pool: 'grainetiere', t: 'Lettre d’Anselme', x: '{npc:grainetiere},\n\nJe passe demain prendre une corde et une lanterne. Si tu me vois partir vers le bois, ne m’appelle pas.\n\nSi quelqu’un vient à la ferme après moi, sois gentille avec. Il ne saura rien. On ne sait jamais rien, en arrivant.\n\nTu avais raison de dire non, à seize ans. Tu as toujours eu raison.', s: 'A.' },
  grain_notaire: { pool: 'grainetiere', t: 'Lettre du notaire', x: 'Maître Duvernoy, notaire, certifie qu’Anselme, de la vieille ferme, n’a laissé ni testament, ni héritier connu, ni dette.\n\nEn marge, au crayon, de la main de la grainetière : « Alors qui a signé la lettre d’arrivée ? »\n\nEt plus bas : « Même écriture. Même encre. »' },
  grain_fleur: { pool: 'grainetiere', t: 'Une violette séchée', x: 'Une violette aplatie entre deux feuilles de papier de soie, brune comme du thé.\n\nSur le papier, une écriture d’enfant : « pour {npc:grainetiere}, de la part d’Anselme, qui te redemandera ».' },
  // --- la poste
  post_puits: { pool: 'postiere', t: 'Lettre à soi-même', x: 'Enveloppe adressée à « Mlle {npc:postiere}, Receveuse des Postes, {ville} », de sa propre écriture, oblitérée d’un tampon qui n’existe pas.\n\nDedans, une seule ligne : « Ne va pas au puits. »\n\nAu dos de l’enveloppe, une liste de dates, une par an. La dernière n’est pas encore passée.' },
  post_perdues: { pool: 'postiere', t: 'Lettres en souffrance', x: 'Une liasse ficelée : « À Madame Rivière, maison Rivière » ; « À Monsieur Bastien fils » ; « Aux enfants Lefèvre » ; « À celui qui dort dans la sept ».\n\nAucun de ces gens n’habite plus la vallée. Certaines enveloppes sont timbrées de l’an prochain.' },
  post_carnet: { pool: 'postiere', t: 'Carnet de la postière', x: '« Primedi : la guérisseuse écrit au docteur des Sources. Huit pages. Elle ne parle que de plantes. Elle ne parle pas du tout de plantes.\n\nFerdi : quelqu’un poste une lettre parfumée pour le ranch, sans timbre, la nuit. La boîte était fermée à clé.\n\nMarchedi : rien. Le curé a écrit à l’évêché ; l’évêché ne répond plus depuis quatre ans. »' },
  ind_lavoir: { pool: 'postiere', cache: 'lavoir', t: 'Un billet intercepté', x: '« Sous la troisième pierre du lavoir, en partant de la rigole : le médaillon. Ne le rends pas. Elle ne l’a jamais aimé. »\n\nLa postière a noté dans un coin : « Ni expéditeur, ni destinataire. Gardé. »' },
  // --- les casiers du tri (lettres arrivées)
  tri_circulaire: { pool: 'tri', t: 'Circulaire préfectorale', x: '« Il est rappelé aux communes que la semaine compte sept jours. »\n\nQuelqu’un, à la poste, a répondu dessus au crayon : « Pas ici. »' },
  tri_retour: { pool: 'tri', t: 'Retour à l’envoyeur', x: 'Une lettre revenue, tamponnée « Destinataire inconnu à l’adresse indiquée ».\n\nL’adresse indiquée : « La vieille ferme, {ville} ». L’envoyeur : Anselme.\n\nLa date d’envoi est dans quatre jours.' },
  tri_carte: { pool: 'tri', t: 'Carte postale', x: 'Une ville au bord de la mer, coloriée à la main.\n\n« Il fait beau, le ciel est grand, on ne lève pas les ponts, ici. Les jours ont des noms normaux. Je pense à vous. »\n\nPas de signature. L’écriture ressemble à celle de la femme du maire.' },
  // --- la boîte aux lettres (lettres en partance)
  boite_eveche: { pool: 'boite', t: 'Lettre pour l’évêché', x: 'Monseigneur,\n\nVoici la quarante-septième lettre. Je ne vous demande plus de réponse. Je vous demande seulement de dire une messe, chez vous, loin d’ici, pour ceux de {ville}. Je ne peux plus la dire moi-même : ici, ils répondent.', s: 'Le curé de {ville}' },
  boite_papa: { pool: 'boite', t: 'Lettre d’enfant', x: 'À PAPA, SOUS LE FOUR.\n\nPapa, maman chante aussi maintenant. Est-ce que tu as froid ? Lise dit qu’il fait chaud en dessous. Je t’embrasse.\n\nTa fille.' },
  boite_fermier: { pool: 'boite', t: 'Une lettre à votre nom', x: 'L’enveloppe porte votre nom, « {prenom} », d’une écriture que vous ne connaissez pas. Elle attend dans la boîte, timbrée, prête à partir.\n\nDedans : « Bienvenue. Tu es le bon, cette fois. On disait ça aussi au précédent. »\n\nAucune signature.' },
  boite_brasseur: { pool: 'boite', t: 'Commande à la brasserie', x: 'À la brasserie de la ville d’en bas : quatre fûts de cervoise, deux de cidre, et plus de ce vin « qui ne tourne pas ».\n\nLe dernier fût est reparti plein. Personne n’a voulu y goûter. Il chantait.', s: 'Bonnefoy, au Coq Tordu' },
  // --- le garde
  garde_mere: { pool: 'garde', t: 'Lettre d’une mère', x: 'Mon grand,\n\nTu as toujours eu peur du noir, alors ne prends pas ce poste de nuit. Prends-en un au soleil. Tu en as eu assez, là-bas, des fièvres.\n\nJe t’embrasse. Ta maman.\n\n(La lettre est datée d’un an après sa mort. Le cachet de la poste est de {ville}.)' },
  garde_pas: { pool: 'garde', t: 'Relevé des rondes', x: 'Pont sud, levé à 21 h. Pas sur le tablier : 3 h 10. 3 h 40. 4 h 02. Le pont était vertical.\n\nPont nord : rien.\n\nNote : demander au forgeron si le bois peut grincer tout seul. Ne pas demander au maire.' },
  garde_livret: { pool: 'garde', t: 'Livret militaire', x: 'Grosjean, {npc:garde}, soldat de deuxième classe, infanterie coloniale. Fièvres. Rapatrié.\n\nObservations du médecin : « Refuse de dormir sans lumière. Dit que quelque chose l’a suivi depuis la brousse. Inapte. »' },
  // --- l'église
  cure_mauduit: { pool: 'cure', t: 'Le registre de l’abbé Mauduit', x: '« Nuit du 3 au 4 : la cloche a sonné seule, onze coups. Nuit du 9 : quinze coups. J’ai monté l’escalier du clocher, la corde ne bougeait pas, et la cloche sonnait encore. Je commence à croire qu’elle ne sonne pas pour nous, mais pour quelqu’un d’en dessous qui compte les… »\n\nLa phrase s’arrête là. Plus bas, d’une autre encre : « …qui compte les vivants. »' },
  cure_messe: { pool: 'cure', t: 'Note du curé', x: 'Réveillé dans la nef, en chasuble. Les bancs pleins. J’ai reconnu la mère de {npc:maire}, et l’abbé Mauduit au premier rang. Ils répondaient en latin à des prières que je ne connais pas.\n\nÀ l’élévation, j’ai levé l’hostie : elle était noire.\n\nNe pas en parler à l’évêque. Ne plus en parler à Dieu.' },
  cure_tisanes: { pool: 'cure', t: 'Ordonnance de la guérisseuse', x: 'Pour le père {npc:cure} : valériane, trois pincées ; tilleul ; une goutte de pavot, pas deux. À boire chaud, avant les complies.\n\nNe pas dormir dans l’église. Si vous vous réveillez là-bas, ne regardez pas les bancs.', s: 'S.' },
  ind_clocher: { pool: 'cure', cache: 'clocher', t: 'Note de l’abbé Mauduit', x: 'Le calice de vermeil n’a pas été volé. Je l’ai caché moi-même, dans le clocher, derrière la troisième pierre de l’escalier, parce que la cloche le réclamait.\n\nQue mon successeur le laisse où il est. Ou qu’il le rende, s’il sait à qui.' },
  // --- le ranch
  elev_parfum1: { pool: 'eleveuse', t: 'Lettre parfumée', x: 'Papier mauve, qui sent la violette. Pas de signature.\n\n« Je vous ai vue ferrer la jument grise, ce matin, les manches roulées. Vous ne savez pas qu’on vous regarde. Je ne vous le dirai jamais en face : je n’ai pas la voix pour ça. Mais je vous le dis ici. Vous êtes ce que la vallée a de plus droit. »' },
  elev_parfum2: { pool: 'eleveuse', t: 'Lettre parfumée', x: 'Même papier mauve.\n\n« Le dimanche, je pose un bol de lait pour quelqu’un qui ne revient pas. Je voudrais en poser un pour quelqu’un qui est là. Vous sentez l’eau du lac, dans ce papier ? J’ai essayé de l’enlever. »\n\nL’encre a coulé, comme si la lettre avait été mouillée.' },
  elev_augustin: { pool: 'eleveuse', t: 'La dernière lettre d’Augustin', x: 'Ma {npc:eleveuse},\n\nLes chevaux ne mangent plus. Ils regardent tous du côté du hameau abandonné. Ta tante dit que ce n’est rien.\n\nSi je ne suis pas là demain, garde la grise, vends le reste, et ne va jamais là-bas les nuits où ils se retournent.\n\nJe t’aime comme au premier jour.', s: 'Ton Augustin' },
  ind_hameau: { pool: 'eleveuse', cache: 'hameau', t: 'Mot d’Augustin', x: 'La montre de mon père est sous le banc du hameau, dans une boîte de fer-blanc, enterrée d’un pouce. Je l’y ai mise le jour où il est parti. Qu’elle attende qu’il revienne.' },
  // --- le pêcheur
  pech_jules: { pool: 'pecheur', t: 'Lettre à Jules', x: 'Jules,\n\nLe lac a gelé sur les bords, cette année. Je suis allé au bout du ponton avec le bol. Il était vide le lundi, comme toujours. Propre, comme toujours.\n\nSi c’est toi, frappe trois fois sur le ponton. Si ce n’est pas toi, ne frappe pas.\n\nPersonne n’a frappé. J’ai entendu trois coups, pourtant. Sous l’eau.' },
  pech_brouillon: { pool: 'pecheur', t: 'Brouillon sur papier mauve', x: 'Une feuille mauve, froissée, qui sent un peu la violette et beaucoup le poisson. Des phrases essayées puis barrées : « Je vous ai vue ferrer… », « Vous êtes ce que la vallée… ».\n\nAu bas de la feuille, un nom écrit puis griffonné jusqu’à trouer le papier : celui de l’éleveuse du ranch.' },
  pech_carnet: { pool: 'pecheur', t: 'Carnet de pêche', x: 'Carpe, trois livres. Brochet, perdu.\n\nPar temps clair, vu le clocher du village noyé : il avait sa cloche. La dernière fois, il ne l’avait pas.\n\nQuelqu’un la remonte, ou quelqu’un la descend.' },
  // --- la guérisseuse
  gue_docteur: { pool: 'guerisseuse', t: 'Lettre du docteur des Sources', x: 'Chère amie,\n\nVous me demandez si la vapeur de nos bassins soigne les os. Oui. Vous me demandez pourquoi. Je n’en sais rien. Vous me demandez si je vais bien.\n\nJe relis votre lettre tous les soirs, ce qui doit être un symptôme. Je vous prescris de venir aux Sources. Je me prescris de ne pas y compter.', s: 'Votre dévoué {npc:naturiste_b}' },
  gue_grandmere: { pool: 'guerisseuse', t: 'Le cahier de la grand-mère', x: '« La vallée a deux faces, comme une feuille. On vit sur l’endroit. L’envers, on y descend par le vieux puits, et on n’y mange rien, même si on vous tend du pain.\n\nLes nuits rouges, la feuille se retourne toute seule. Ce jour-là, dors chez toi, et si on frappe, demande le nom de ta mère avant d’ouvrir. »' },
  // --- le chasseur
  chas_accident: { pool: 'chasseur', t: 'Une lettre jamais envoyée', x: 'Madame,\n\nC’était un Chassedi. Il y avait du brouillard dans les fougères, et quelque chose a bougé comme bouge un chevreuil. Plusieurs hommes ont tiré. Je ne sais pas si c’était mon plomb.\n\nJe sais seulement que depuis, chaque automne, j’entends quelqu’un cueillir des champignons derrière moi, et quand je me retourne, les fougères se referment.\n\nJe vous demande pardon. Je ne sais pas à qui d’autre le demander.' },
  chas_carnet: { pool: 'chasseur', t: 'Carnet de chasse', x: 'Sanglier, deux. Chevreuil, un. Renard, laissé.\n\nOurs : vu ses traces près du relais, en rond, comme s’il tournait autour de la maison. Il n’entre jamais. Je laisse la graisse dehors les nuits noires. Il la prend, et il repart.' },
  // --- l'alchimiste
  alch_notes: { pool: 'alchimiste', t: 'Carnet de Fauvel', x: '« Les contraires s’annulent : la Vie du miel éteint la Mort du venin. Ce qui domine l’emporte. Trois essences pour un philtre, jamais quatre : à quatre, ça bout, ça siffle, et ça sent l’œuf. »\n\nPlus bas, souligné : « Ne jamais goûter. Goûter quand même. Noter. »' },
  alch_faculte: { pool: 'alchimiste', t: 'Lettre de la faculté', x: 'Monsieur,\n\nLe conseil de discipline a pris connaissance de vos expériences du 12, et de l’état du laboratoire du deuxième étage. Nous ne vous demandons pas ce que vous avez tenté de faire. Nous vous demandons de partir, et de ne pas emporter le bocal.\n\nAu dos, de la main de Fauvel : « Je l’ai emporté. »' },
  alch_fleur: { pool: 'alchimiste', t: 'Note sur la fleur de pierre', x: 'Vue dans la vitrine de Morand : fleur de pierre, pétales de lichen fossile. Il dit qu’elle vient d’un temple « là-haut, derrière les neiges ». Trois pierres gardent la porte.\n\nSi j’avais vingt ans de moins, et deux jambes de plus, j’irais.' },
  // --- les colporteurs
  colp_comptes: { pool: 'colporteur', t: 'Livre de comptes', x: 'Vendu : trois almanachs, une carte du Centre (fausse, mais personne n’y va), deux coupons.\n\nAcheté à un vieux nain, la nuit, au pied des Monts : une lentille de cristal, contre tout mon miel. Il a payé d’avance, et il savait mon nom. Je n’ai jamais dit mon nom à un nain.' },
  ind_chene: { pool: 'colporteur', cache: 'chene', t: 'Un plan au crayon', x: 'Un plan maladroit : un très gros arbre, une flèche, et « le creux, du côté où le soleil se couche ».\n\nAu dos : « Payé en carte. Ne pas revendre la carte deux fois. »' },
  colpe_soeur: { pool: 'colporteuse', t: 'Lettre d’une sœur', x: '{npc:colporteuse},\n\nIci, l’auberge marche. Les clients sont des gens normaux, qui rentrent chez eux à la nuit et qui dorment. Reviens.\n\nTu m’as écrit que ta vallée a douze jours à la semaine : ce n’est pas possible, et tu le sais. Reviens avant qu’elle en ait treize.' },
  colpe_col: { pool: 'colporteuse', t: 'Note au crayon', x: 'Col des Treize. Ne pas répondre quand on m’appelle. Ne pas se retourner au troisième lacet. Laisser une pièce sur la pierre plate.\n\nJ’ai laissé la pièce. La pierre était déjà couverte de pièces, et certaines étaient toutes neuves.' },
  // --- les Sources
  nat_docteur: { pool: 'naturiste_b', t: 'Brouillon du docteur', x: 'Chère amie,\n\nJe vous écris d’un bain, ce qui est très commode et parfaitement ridicule. La vapeur a pris ce matin une forme que nous connaissons tous les deux : une main, et trois traits. Lise la dessine sans savoir. Je ne lui dis rien.\n\nVenez. Nous parlerons de plantes. Nous ne parlerons pas du tout de plantes.' },
  nat_dessins: { pool: 'naturiste_c', t: 'Dessins de vapeur', x: 'Des feuilles couvertes de fusain : une grande main ouverte, un œil, trois traits parallèles. Les mêmes, cent fois.\n\nSur la dernière feuille, la main s’est refermée.' },
  nat_note: { pool: 'naturiste_a', t: 'Un mot de la baigneuse', x: 'Pour le marché de {hameau} : huile, miel, et me couvrir. Surtout me couvrir.\n\nLa dernière fois, {npc:maire} a failli avaler son chapeau.' },
  // --- les maisons vides de la ville
  ma_a_1: { pool: 'maison_a', t: 'Journal d’une mère', x: 'Le petit se lève la nuit et va se planter devant la fenêtre. Il dit qu’un monsieur bleu lui fait signe depuis la rue.\n\nJ’ai peint les volets en bleu pour qu’il ne voie plus dehors.\n\nIl dit que maintenant, le monsieur est dedans.' },
  ma_a_2: { pool: 'maison_a', t: 'Un mot sur la table', x: 'Nous sommes partis chez la tante, à la ville d’en bas. Le petit va mieux quand on s’éloigne.\n\nSi quelqu’un trouve ce mot : ne rouvrez pas les volets.', s: 'Famille Lefèvre' },
  ma_b_1: { pool: 'maison_b', t: 'Carnet du tisserand', x: 'Commande : un drap pour le maire. Commande : un linceul pour la vieille Varenne, qui n’est pas morte, et qui l’a payé d’avance.\n\nLe métier bat tout seul la nuit. Au matin, il y a trois rangs de plus, dans une couleur que je n’ai pas.' },
  ma_b_2: { pool: 'maison_b', t: 'Une facture', x: 'Toile de lin, douze aunes, pour « l’homme au long manteau ». Réglé en vieilles pièces. Livraison : au carrefour, à minuit, sans lumière.\n\nLe tisserand a écrit en bas : « Il n’a pas de visage sous le chapeau, juste de l’ombre. Il a dit merci. »' },
  ma_c_1: { pool: 'maison_c', t: 'Une liste de courses', x: 'Pain. Sel. Chandelles. Clous pour la porte. Encore des clous. De la craie, pour les marques.\n\nDemander au curé ce que veulent dire les marques. Ne pas demander au curé.' },
  ma_c_2: { pool: 'maison_c', t: 'Lettre inachevée', x: 'Chère sœur,\n\nLa table est mise et personne ne vient manger. Pourtant on entend les chaises.\n\nHier soir, la lune a rougi, et nous sommes tous sortis dans la rue, en chemise, les yeux fermés. Ce matin, les enfants avaient de la terre sous les ongles.\n\nNous partons demain, avant que' },
  ma_d_1: { pool: 'maison_d', t: 'Lettres liées d’un ruban', x: 'Des lettres d’un soldat à une femme, de plus en plus courtes. La dernière dit : « Mets des lilas à la fenêtre, je reconnaîtrai la maison. »\n\nIl y a des lilas séchés sur tous les rebords. Ils ne sentent plus rien. Si, un peu, la nuit.' },
  ma_d_2: { pool: 'maison_d', t: 'Avis de décès', x: 'Avis de décès, bordé de noir, pour une femme « partie rejoindre son mari ».\n\nLa date du décès est antérieure de trois ans à celle de la dernière lettre du mari.' },
  ind_puits: { pool: 'maison_d', cache: 'puits', t: 'Note d’une vieille femme', x: 'Mes économies ne sont pas à la banque, les banques brûlent. Elles sont sous la margelle du puits de la place, côté mairie, la pierre qui bouge.\n\nSi je meurs, qu’elles aillent à qui les trouve.', s: 'Veuve Varenne' },
  v4_1: { pool: 'vide4', t: 'Mot griffonné', x: 'Nous partons. La vallée ne veut pas qu’on parte, alors nous partons de nuit, à pied, sans rien.\n\nSi nous revenons, ce ne sera pas nous.' },
  v4_2: { pool: 'vide4', t: 'Cahier d’écolier', x: 'Des lignes d’écriture : « Je ne dois pas descendre au puits. » Cent fois.\n\nÀ la page suivante, d’une écriture d’adulte, la même phrase. Cent fois aussi.' },
  v5_1: { pool: 'vide5', t: 'Feuillet du recensement', x: 'Un feuillet du recensement de la mairie, pour cette maison : père, mère, deux enfants.\n\nUne cinquième ligne a été ajoutée à l’encre rouge, sans nom, avec la mention « en visite ».\n\nDate de la visite : jour {jour}. C’est aujourd’hui.' },
  v5_2: { pool: 'vide5', t: 'Un bail', x: 'Bail de location, maison au nord de la rue.\n\nClause manuscrite ajoutée : « Le locataire s’engage à ne pas fermer la chambre du haut, à laisser une chandelle allumée le Vorndi, et à ne pas répondre si on l’appelle depuis la cheminée. »' },
  // --- le hameau
  mo_1: { pool: 'morel', t: 'Les recettes de la grand-mère Morel', x: 'Contre la fièvre : reine-des-prés. Contre la peur : du sel sur le seuil. Contre ce qui frappe la nuit : rien. On n’ouvre pas, c’est tout.\n\n— La grand-mère de {npc:guerisseuse}, de sa main.' },
  mo_2: { pool: 'morel', t: 'Faire-part jauni', x: 'Faire-part de naissance : une fille chez les Morel, « qui a les yeux ouverts depuis le premier jour et ne pleure jamais ».\n\nQuelqu’un a ajouté au crayon : « Elle voit les deux faces. »' },
  ba_1: { pool: 'bastien', t: 'Lettre de Bastien père', x: 'Nous avons creusé le puits du hameau, les garçons et moi. À quarante pieds, l’eau. À quarante-deux, une voûte de pierre taillée, avec des signes.\n\nLe maire a dit de reboucher. Nous avons rebouché.\n\nLa nuit, on entend encore la pioche. Ce n’est pas nous.' },
  ba_2: { pool: 'bastien', t: 'Mot d’enfant', x: 'Je m’appelle Paul Bastien et j’ai sept ans. Si vous lisez ça, c’est que vous êtes dans ma maison.\n\nVous pouvez dormir dans mon lit, mais ne tournez pas le dos à la fenêtre.' },
  // --- les poubelles
  reb_rdv: { pool: 'rebut', t: 'Billet froissé', x: '« Ce soir, derrière le lavoir, quand la cloche sonne neuf coups. Viens seul. Brûle ce mot. »\n\nLe mot n’a pas été brûlé. Il a été froissé, défroissé, et jeté.' },
  reb_liste: { pool: 'rebut', t: 'Une liste', x: 'Sel, bougies, un clou de girofle pour la dent, et une corde.\n\nPas trop longue, la corde.' },
  reb_plainte: { pool: 'rebut', t: 'Brouillon de plainte', x: 'Monsieur le Maire,\n\nJe me plains de mon voisin qui chante la nuit. Il chante sous ma fenêtre, à trois heures.\n\nJe me plains aussi de n’avoir pas de voisin.' },
  reb_almanach: { pool: 'rebut', t: 'Page d’almanach', x: '« Vorndi, jour des morts : ne pas balayer après le coucher du soleil, on chasserait les âmes. Primedi : semer le blé. Chassedi : porter du rouge en forêt. »\n\nÀ côté de Chassedi, quelqu’un a écrit : « Trop tard pour le petit Mathieu. »' },
  reb_anonyme: { pool: 'rebut', t: 'Lettre anonyme', x: 'Des lettres découpées dans un journal et collées : « JE SAIS CE QUE TU AS FAIT LE JOUR DE LA FOIRE. »\n\nPas d’adresse, pas de nom. Elle a été jetée, ce qui veut dire qu’elle a été reçue.' },
  reb_dessin: { pool: 'rebut', t: 'Dessin au charbon', x: 'Un visage sans traits, sous un chapeau. En dessous, d’une écriture d’enfant : « il a demandé le chemin ».\n\nLa feuille est noire au dos, comme si on l’avait posée sur de la suie.' },
  reb_recu: { pool: 'rebut', t: 'Reçu du mont-de-piété', x: 'Mont-de-piété de la ville d’en bas : une montre de gousset, déposée par M. Bonnefoy, contre quarante francs.\n\nDate limite de rachat : dépassée depuis six ans.' },
  // --- trouvé dans une cachette
  monument_lettres: { pool: null, t: 'Les lettres pour Jeanne', x: 'Une liasse de lettres qu’on n’a jamais envoyées, toutes commençant par « Ma Jeanne ». La dernière n’a que trois lignes :\n\n« Il fait froid dans la tranchée, et quelqu’un chante en dessous. Tu ne me croiras pas. Garde les lilas à la fenêtre. »' },
};
const F2_POOLS = {};
for (const id in F2_PAPIERS) { const P = F2_PAPIERS[id]; if (P.pool) (F2_POOLS[P.pool] || (F2_POOLS[P.pool] = [])).push(id); }

// ---------------------------------------------------------------- ce que disent les habitants
const F2_CRIS = {
  maire: 'Mes papiers ! Mes papiers officiels ! Vous rendez-vous compte de ce que vous touchez ? Au garde !',
  boulangere: 'Doux Jésus ! Chez moi, dans mes affaires ?! Sortez, voleur ! Sortez de ma maison !',
  forgeron: '… Pose ça. Tout de suite. Et sors de ma forge avant que je t’en sorte moi-même.',
  grainetiere: 'Eh bien ! On se sert ? Ici, on paie, ou on file. Au voleur !',
  aubergiste: 'Les mains dans mes affaires ! Et moi qui vous servais du cidre ! Au voleur ! Au garde !',
  cure: 'Dans la maison de Dieu ! Dieu voit, mon enfant. Et moi aussi. Sortez.',
  postiere: 'Ce sont des lettres privées ! Privées ! Même moi, je ne… enfin. Sortez ! Au voleur !',
  garde: 'Dans la guérite du garde ? Vous avez du cran, ou pas de cervelle. Halte ! Au nom de la loi !',
  eleveuse: 'Hé ! Qu’est-ce que tu fouilles là ? Dehors, avant que je lâche la jument sur toi !',
  pecheur: 'Ce coffre, c’est tout ce qui me reste de mon frère. Repose ça. Et va-t’en.',
  guerisseuse: 'Mes bocaux… Remets-les. Certains mordent. Et je ne parle pas des herbes.',
  chasseur: 'Tu touches à mes affaires. Je t’ai entendu depuis la porte. La prochaine fois, je tire.',
  alchimiste: 'Pas les tiroirs ! Il y a là-dedans des choses qui ne doivent pas prendre l’air ! Au voleur !',
  colporteur: 'Ah non ! Ma marchandise, on l’achète ! Au voleur, au voleur !',
  colporteuse: 'Hé ! Dans ma roulotte ? Sur les routes, on se fait détrousser, pas chez soi ! Au voleur !',
  naturiste_a: 'Oh ! Vous fouillez nos affaires ? Ici, on ne cache rien, alors il n’y avait rien à voler !',
  naturiste_b: 'Mon cher, on ne vole pas un médecin. On le consulte. Sortez, je vous prie.',
  naturiste_c: 'Qu’est-ce que vous faites ? … Posez ça. S’il vous plaît. Au secours !',
  nain_ancien: 'Des mains de surface dans le coffre des halles. Voleur ! Les pierres s’en souviendront.',
  nain_forgeronne: 'Tu fouilles une forge naine ? Tu tiens à tes doigts ? VOLEUR !',
  fillette: 'C’est MA boîte ! Rends-moi mes trésors ! MAMAN !',
  _: ['Hé ! Qu’est-ce que vous fouillez là ?!', 'Au voleur ! Chez moi !', 'Sortez de chez moi ! Au voleur !'],
};
const F2_TEMOIN = ['Hé ! Vous fouillez chez {victime} ?!', 'Au voleur ! Là, dans les affaires de {victime} !', 'Qu’est-ce que vous faites ? Ce n’est pas chez vous !'];
const F2_TEMOIN_PUBLIC = ['Hé ! Ce n’est pas à vous, ça !', 'Au voleur ! On se sert, là !', 'Je vous vois, vous ! Reposez ça !'];
const F2_TEMOIN_REBUT = ['Vous fouillez les ordures, maintenant ?', 'Si vous avez faim, l’auberge fait la soupe, vous savez.', 'Il y a des chiens pour ça.'];
const F2_TEMOIN_ABANDON = ['Ce n’est pas chez vous, ici. Ce n’est plus chez personne.', 'Laissez les affaires des disparus. Ça porte malheur.', 'Hé ! On ne fouille pas chez les partis !'];
const F2_TEMOIN_MORT = ['Laissez les affaires de {victime} ! Vous n’avez pas honte ?', 'On n’a pas encore fini de pleurer {victime}, et vous fouillez déjà ?'];
const F2_PLAINTES = {
  maire: 'Mon bureau a été fouillé. Mes papiers ne sont plus dans l’ordre. Si c’est vous… non. Ce ne peut pas être vous. Si ?',
  aubergiste: 'Il manque de la monnaie dans ma caisse, et du cidre au tonneau. Le cidre, je comprends. La monnaie, non.',
  boulangere: 'On est entré chez moi pendant que j’étais au four. Rien de cassé. Mais la farine avait des traces de doigts. Des doigts qui n’étaient pas les miens.',
  fillette: 'Quelqu’un a ouvert ma boîte à trésors. Lise dit que c’était pas elle. Moi, je la crois.',
  postiere: 'Quelqu’un a fouillé mes casiers. Des lettres ont disparu. Vous vous rendez compte ? Moi, je les ouvre, d’accord, mais je les remets !',
  forgeron: 'On a fouillé ma forge. … Si je trouve qui, je lui forge une serrure. Autour du cou.',
  cure: 'Le tronc des pauvres a été forcé. Qui vole les pauvres vole deux fois. Priez pour lui. Moi, je n’y arrive pas.',
  garde: 'On est entré dans ma guérite. Dans MA guérite. Je ne dors plus, alors si en plus on me vole…',
  _: ['On est entré chez moi. Rien de cassé, mais des choses ont bougé. On ne se sent plus chez soi.', 'Il me manque des affaires. Je ne suis pas folle : il me manque des affaires.', 'Quelqu’un a fouillé mes tiroirs. Je le sens. Les tiroirs ne se referment plus pareil.'],
};

// ---------------------------------------------------------------- modèles des meubles (l'avant regarde +z)
Object.assign(PROP_MODELS, {
  armoire(E, o) {
    const v = o.data && o.data.vide;
    E.bx(0, 0, 0, 1.2, 0.12, 0.55, WHITE, TL.darkwood);
    E.bx(0, 0.12, -0.02, 1.16, 1.78, 0.5, WHITE, TL.wood);
    E.bx(0, 1.9, 0, 1.28, 0.1, 0.6, WHITE, TL.darkwood);
    E.bx(-0.29, 0.2, 0.235, 0.54, 1.62, 0.04, WHITE, TL.darkwood);
    if (v) {
      E.bx(0.29, 0.3, 0.03, 0.46, 0.25, 0.36, rgbf('#e8e0d0'), TL.cloth); E.bx(0.29, 0.9, 0.03, 0.46, 0.2, 0.36, rgbf('#7a8aa8'), TL.cloth);
      E.bx(0.56 - 0.27 * Math.cos(0.9), 0.2, 0.235 + 0.27 * Math.sin(0.9), 0.54, 1.62, 0.04, WHITE, TL.darkwood, 0.9);
    } else { E.bx(0.29, 0.2, 0.235, 0.54, 1.62, 0.04, WHITE, TL.darkwood); E.bx(0.04, 0.95, 0.265, 0.03, 0.12, 0.03, PC.iron, TL.iron); }
    E.bx(-0.04, 0.95, 0.265, 0.03, 0.12, 0.03, PC.iron, TL.iron);
  },
  commode(E, o) {
    const v = o.data && o.data.vide;
    for (const [x, z] of [[-0.44, -0.19], [0.44, -0.19], [-0.44, 0.19], [0.44, 0.19]]) E.bx(x, 0, z, 0.07, 0.12, 0.07, WHITE, TL.darkwood);
    E.bx(0, 0.12, 0, 1.0, 0.74, 0.46, WHITE, TL.wood);
    E.bx(0, 0.86, 0, 1.06, 0.05, 0.5, WHITE, TL.darkwood);
    for (let i = 0; i < 3; i++) {
      const out = v && i === 2 ? 0.2 : 0;
      if (out) E.bx(0, 0.14 + i * 0.23, 0.1 + out, 0.86, 0.18, 0.3, WHITE, TL.wood);
      E.bx(0, 0.15 + i * 0.23, 0.215 + out, 0.9, 0.2, 0.04, WHITE, TL.darkwood);
      for (const s of [-0.22, 0.22]) E.bx(s, 0.23 + i * 0.23, 0.245 + out, 0.05, 0.04, 0.03, rgbf('#c8a040'), TL.gold);
    }
    E.bx(0.3, 0.91, 0, 0.1, 0.18, 0.1, rgbf('#9a9aa2'), TL.metal);
  },
  buffet(E) {
    E.bx(0, 0, 0, 1.4, 0.9, 0.5, WHITE, TL.wood);
    E.bx(0, 0.9, 0, 1.46, 0.05, 0.54, WHITE, TL.darkwood);
    for (const s of [-0.35, 0.35]) { E.bx(s, 0.12, 0.245, 0.64, 0.7, 0.03, WHITE, TL.darkwood); E.bx(s * 0.2, 0.5, 0.265, 0.04, 0.1, 0.02, rgbf('#c8a040'), TL.gold); }
    E.bx(0, 0.95, -0.12, 1.3, 0.95, 0.24, WHITE, TL.wood);
    for (const y of [1.28, 1.62]) E.bx(0, y, -0.02, 1.3, 0.04, 0.26, WHITE, TL.darkwood);
    E.bx(0, 1.9, -0.1, 1.44, 0.07, 0.34, WHITE, TL.darkwood);
    for (let i = 0; i < 5; i++) E.box(-0.5 + i * 0.25, 1.44, 0.03, 0.2, 0.2, 0.02, rgbf('#f0ece0'), TL.plain);
    for (let i = 0; i < 4; i++) E.bx(-0.45 + i * 0.3, 1.66, 0, 0.14, 0.12, 0.14, rgbf(i % 2 ? '#e8e4d8' : '#6a8ab0'), TL.plain);
  },
  malle(E, o) {
    const v = o.data && o.data.vide;
    E.bx(0, 0, 0, 0.9, 0.42, 0.5, WHITE, TL.chest);
    for (const s of [-0.3, 0.3]) E.bx(s, 0, 0, 0.05, 0.43, 0.52, PC.iron, TL.iron);
    if (v) E.box(0, 0.62, -0.25, 0.92, 0.1, 0.52, WHITE, TL.darkwood, 0, -1.2);
    else { E.bx(0, 0.42, 0, 0.92, 0.12, 0.52, WHITE, TL.darkwood); E.bx(0, 0.3, 0.255, 0.1, 0.12, 0.03, rgbf('#c8a040'), TL.gold); }
  },
  secretaire(E, o) {
    const v = o.data && o.data.vide;
    E.bx(0, 0, 0, 1.1, 0.75, 0.55, WHITE, TL.darkwood);
    E.bx(0, 0.75, 0, 1.14, 0.04, 0.6, WHITE, TL.wood);
    E.bx(0, 0.79, -0.15, 1.1, 0.5, 0.28, WHITE, TL.darkwood);
    for (let i = 0; i < 4; i++) { E.bx(-0.39 + i * 0.26, 0.84, -0.005, 0.2, 0.18, 0.01, [0.1, 0.08, 0.06], TL.plain); if (!v || i === 2) E.bx(-0.39 + i * 0.26, 0.86, -0.02, 0.14, 0.12, 0.04, PC4.paper, TL.paper); }
    E.bx(0, 0.45, 0.28, 0.5, 0.16, 0.02, WHITE, TL.wood); E.bx(0, 0.5, 0.295, 0.06, 0.05, 0.02, rgbf('#c8a040'), TL.gold);
    E.bx(0.2, 0.79, 0.15, 0.28, 0.01, 0.2, PC4.paper, TL.paper); E.bx(-0.35, 0.79, 0.12, 0.07, 0.08, 0.07, [0.1, 0.1, 0.14], TL.glass);
    if (v) E.bx(0, 0.38, 0.42, 0.46, 0.13, 0.3, WHITE, TL.wood);
  },
  coffre_fort(E, o) {
    const v = o.data && o.data.vide, c = rgbf('#3a3c42');
    E.bx(0, 0, 0, 0.75, 0.9, 0.6, c, TL.iron);
    E.bx(0, 0.06, 0.3, 0.62, 0.78, 0.03, rgbf('#4a4c52'), TL.metal);
    E.box(0.12, 0.55, 0.33, 0.14, 0.14, 0.03, rgbf('#c8a040'), TL.gold, 0, 0, v ? 0.8 : 0);
    E.bx(-0.2, 0.4, 0.33, 0.04, 0.2, 0.03, rgbf('#c8a040'), TL.gold);
  },
  apothicaire(E) {
    E.bx(0, 0, 0, 1.2, 1.7, 0.42, WHITE, TL.darkwood);
    for (let r = 0; r < 6; r++) for (let c = 0; c < 4; c++) { E.bx(-0.43 + c * 0.287, 0.1 + r * 0.26, 0.2, 0.25, 0.22, 0.02, WHITE, TL.wood); E.bx(-0.43 + c * 0.287, 0.19 + r * 0.26, 0.215, 0.04, 0.04, 0.02, rgbf('#c8a040'), TL.gold); }
    E.bx(0, 1.7, 0, 1.26, 0.06, 0.46, WHITE, TL.darkwood);
    for (let i = 0; i < 4; i++) E.bx(-0.45 + i * 0.3, 1.76, 0, 0.12, 0.18, 0.12, rgbf(['#6a9a6a', '#b0a070', '#7a6aa8', '#c8c0b0'][i]), TL.glass);
  },
  casier_tri(E, o) {
    const v = o.data && o.data.vide;
    E.bx(0, 0, 0, 1.2, 0.8, 0.4, WHITE, TL.darkwood);
    E.bx(0, 0.8, 0, 1.24, 0.04, 0.44, WHITE, TL.wood);
    E.bx(0, 0.84, -0.05, 1.2, 0.8, 0.3, WHITE, TL.darkwood);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
      const x = -0.48 + c * 0.24, y = 0.88 + r * 0.25;
      E.bx(x, y, 0.095, 0.2, 0.2, 0.01, [0.12, 0.1, 0.08], TL.plain);
      if (!v || (r + c) % 3 === 0) E.bx(x, y, 0.1, 0.16, 0.1 + ((r * 5 + c) % 3) * 0.03, 0.02, PC4.paper, TL.paper);
    }
    E.bx(0, 1.64, -0.05, 1.28, 0.05, 0.34, WHITE, TL.wood);
  },
  petrin(E, o) {
    const v = o.data && o.data.vide;
    for (const [x, z] of [[-0.6, -0.22], [0.6, -0.22], [-0.6, 0.22], [0.6, 0.22]]) E.bx(x, 0, z, 0.08, 0.55, 0.08, WHITE, TL.darkwood);
    E.bx(0, 0.55, 0, 1.4, 0.35, 0.56, WHITE, TL.wood);
    E.bx(0, 0.62, 0, 1.28, 0.26, 0.44, rgbf('#e8e0cc'), TL.plain);
    if (v) E.box(0, 1.15, -0.3, 1.42, 0.05, 0.58, WHITE, TL.wood, 0, -1.2); else E.bx(0, 0.9, 0, 1.42, 0.05, 0.58, WHITE, TL.wood);
  },
  coffre_outils(E) {
    E.bx(0, 0, 0, 0.9, 0.42, 0.45, WHITE, TL.darkwood);
    for (const s of [-0.35, 0, 0.35]) E.bx(s, 0, 0, 0.04, 0.43, 0.47, PC.iron, TL.iron);
    E.bx(0, 0.42, 0, 0.92, 0.05, 0.47, rgbf('#4a4c52'), TL.iron);
    E.box(0.1, 0.5, 0, 0.4, 0.04, 0.04, WHITE, TL.wood, 0.3); E.box(0.28, 0.5, -0.05, 0.08, 0.08, 0.16, PC.iron, TL.iron, 0.3);
  },
  poubelle(E) {
    const c = rgbf('#7a7c80');
    E.bx(0, 0, 0, 0.5, 0.7, 0.5, c, TL.metal); E.bx(0, 0, 0, 0.52, 0.05, 0.52, c, TL.iron); E.bx(0, 0.35, 0, 0.53, 0.04, 0.53, c, TL.iron);
    E.box(0.1, 0.74, 0.05, 0.54, 0.04, 0.54, c, TL.metal, 0.4, 0.12);
    E.bx(0.42, 0, 0.22, 0.18, 0.05, 0.12, rgbf('#6a5a3a'), TL.plain, 0.6);
    E.bx(-0.38, 0, 0.28, 0.14, 0.02, 0.2, PC4.paper, TL.paper, 1.1);
  },
  tronc(E) {
    E.bx(0, 0, 0, 0.12, 0.85, 0.12, WHITE, TL.darkwood);
    E.bx(0, 0.85, 0, 0.34, 0.26, 0.26, WHITE, TL.darkwood);
    for (const s of [-0.1, 0.1]) E.bx(s, 0.85, 0, 0.03, 0.27, 0.27, PC.iron, TL.iron);
    E.bx(0, 1.105, 0, 0.14, 0.01, 0.03, [0.05, 0.05, 0.05], TL.plain);
    E.bx(0, 0.9, 0.135, 0.06, 0.08, 0.01, rgbf('#c8a040'), TL.gold);
  },
  boite_tresors(E) {
    E.bx(0, 0, 0, 0.36, 0.18, 0.24, rgbf('#6a8ab0'), TL.wood);
    E.bx(0, 0.18, 0, 0.38, 0.04, 0.26, rgbf('#5a7aa0'), TL.wood);
    E.bx(0, 0, 0, 0.04, 0.23, 0.25, rgbf('#c83a50'), TL.cloth);
    for (let i = 0; i < 3; i++) E.bx(-0.12 + i * 0.12, 0.07, 0.121, 0.05, 0.05, 0.01, rgbf(['#f0d020', '#e03040', '#40a060'][i]), TL.plain);
  },
  sellerie(E) {
    E.bx(0, 0, -0.2, 1.2, 1.7, 0.06, WHITE, TL.darkwood);
    E.box(-0.3, 1.2, 0, 0.08, 0.08, 0.36, WHITE, TL.wood);
    E.bx(-0.3, 1.14, 0.02, 0.42, 0.16, 0.46, rgbf('#6a3a1a'), TL.leather); E.bx(-0.3, 0.92, 0.02, 0.46, 0.24, 0.04, rgbf('#5a3018'), TL.leather);
    for (let i = 0; i < 3; i++) E.bx(0.22 + i * 0.1, 0.55, -0.15, 0.03, 0.95, 0.03, rgbf('#4a2a14'), TL.leather);
    E.bx(0.32, 1.5, -0.15, 0.36, 0.05, 0.08, PC.iron, TL.iron);
    E.bx(0, 0, 0.1, 1.1, 0.4, 0.38, WHITE, TL.wood);
  },
  coffre_nain(E) {
    E.bx(0, 0, 0, 0.9, 0.55, 0.6, rgbf('#8a8a90'), TL.stone);
    E.bx(0, 0.55, 0, 0.94, 0.1, 0.64, rgbf('#6a6a70'), TL.stone);
    for (let i = 0; i < 5; i++) E.bx(-0.3 + i * 0.15, 0.2, 0.301, 0.04, 0.14 + (i % 2) * 0.08, 0.01, rgbf('#c8a040'), TL.gold);
  },
  jambons(E) {
    E.bx(0, 2.1, 0, 1.6, 0.08, 0.08, WHITE, TL.darkwood);
    for (let i = 0; i < 3; i++) { const x = -0.5 + i * 0.5; E.bx(x, 1.95, 0, 0.02, 0.15, 0.02, PC4.rope, TL.plain); E.box(x, 1.72, 0, 0.22, 0.38, 0.18, rgbf(i === 1 ? '#8a4a2a' : '#9a5a34'), TL.leather, i * 0.4); }
    E.bx(0.75, 1.55, 0.05, 0.12, 0.5, 0.12, rgbf('#e8dcc0'), TL.plain);
  },
});
Object.assign(PROP_COLL, {
  armoire: [0.6, 0.28, 2.0], commode: [0.53, 0.25, 0.95], buffet: [0.72, 0.27, 1.95], malle: [0.46, 0.26, 0.55], secretaire: [0.57, 0.3, 1.3],
  coffre_fort: [0.38, 0.3, 0.9], apothicaire: [0.6, 0.22, 1.8], casier_tri: [0.62, 0.22, 1.7], petrin: [0.7, 0.29, 0.95], coffre_outils: [0.46, 0.24, 0.5],
  poubelle: [0.27, 0.27, 0.75], tronc: [0.17, 0.14, 1.1], sellerie: [0.6, 0.3, 1.7], coffre_nain: [0.47, 0.32, 0.65],
});

// ---------------------------------------------------------------- bruits de fouille
Object.assign(SoundEngine.prototype, {
  fouille(k) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random;
    if (k === 'papier') { for (let i = 0; i < 5; i++) this.noiseHit(t + i * 0.12 + R() * 0.05, 0.1, 'highpass', 3000 + R() * 2500, 0.8, 0.045); }
    else if (k === 'metal' || k === 'monnaie') { for (let i = 0; i < 3; i++) this.tone(t + i * 0.14 + R() * 0.04, 'triangle', 1700 + R() * 1100, 1500, 0.08, 0.03); this.noiseHit(t + 0.05, 0.25, 'bandpass', 900, 2, 0.05); }
    else if (k === 'eau') { this.noiseHit(t, 0.4, 'lowpass', 900, 0.8, 0.1, null, 300); this.noiseHit(t + 0.35, 0.3, 'lowpass', 700, 0.8, 0.06, null, 250); }
    else if (k === 'verre' || k === 'vaisselle') { for (let i = 0; i < 3; i++) this.tone(t + i * 0.16 + R() * 0.05, 'sine', 2300 + R() * 1500, 2200, 0.14, 0.025); this.noiseHit(t, 0.15, 'bandpass', 700, 1.5, 0.05); }
    else if (k === 'foin' || k === 'grain' || k === 'farine' || k === 'tissu' || k === 'cuir') { const f = k === 'grain' ? 2600 : k === 'tissu' ? 1800 : 1300; this.noiseHit(t, 0.5, 'bandpass', f, 0.7, 0.07); this.noiseHit(t + 0.35, 0.45, 'bandpass', f * 1.3, 0.7, 0.05); }
    else if (k === 'poule') { this.noiseHit(t, 0.4, 'bandpass', 1400, 0.8, 0.05); try { this.animal('hen', 0, 0.9); } catch (e) { /* rien */ } }
    else { for (let i = 0; i < 3; i++) this.noiseHit(t + i * 0.17 + R() * 0.05, 0.08, 'bandpass', (k === 'pierre' ? 300 : 500) + R() * 300, 1.2, 0.09); }
  },
});

// ---------------------------------------------------------------- géométrie des emplacements (partagée avec 11-zzz99-activites.js)
// boîte orientée { x, z, hx, hz, r } ; axe x local = (cos r, -sin r), axe z local = (sin r, cos r)
function f2Recouvre(a, b, marge) {
  const ca = Math.cos(a.r), sa = Math.sin(a.r), cb = Math.cos(b.r), sb = Math.sin(b.r);
  const AX = [[ca, -sa], [sa, ca]], BX = [[cb, -sb], [sb, cb]], dx = b.x - a.x, dz = b.z - a.z;
  for (const ax of [AX[0], AX[1], BX[0], BX[1]]) {
    const ra = a.hx * Math.abs(AX[0][0] * ax[0] + AX[0][1] * ax[1]) + a.hz * Math.abs(AX[1][0] * ax[0] + AX[1][1] * ax[1]);
    const rb = b.hx * Math.abs(BX[0][0] * ax[0] + BX[0][1] * ax[1]) + b.hz * Math.abs(BX[1][0] * ax[0] + BX[1][1] * ax[1]);
    if (Math.abs(dx * ax[0] + dz * ax[1]) > ra + rb + (marge || 0)) return false;
  }
  return true;
}
function f2DansBoite(b, x, z, m) { const c = Math.cos(b.r), s = Math.sin(b.r), dx = x - b.x, dz = z - b.z; return Math.abs(dx * c - dz * s) < b.hx + m && Math.abs(dx * s + dz * c) < b.hz + m; }
function f2BoiteProp(q) { const c = PROP_COLL[q.id], s = q.s || 1; return c ? { x: q.x, z: q.z, hx: c[0] * s, hz: c[1] * s, r: q.r || 0 } : { x: q.x, z: q.z, hx: 0.22, hz: 0.22, r: 0 }; }
// une place libre ? (objets posés au même niveau, emplacements déjà pris, interactions, nœuds de chemin, réservations)
function f2Libre(w, box, y0, opt) {
  opt = opt || {};
  const m = opt.marge ?? 0.06;
  for (const q of w.props) {
    if (q.gone || q.y - y0 > 0.5 || y0 - q.y > 1.6) continue;
    if (Math.abs(q.x - box.x) > 5 || Math.abs(q.z - box.z) > 5) continue;
    if (f2Recouvre(box, f2BoiteProp(q), m)) return false;
  }
  for (const b of opt.pris || []) if (Math.abs((b.y ?? y0) - y0) < 1.6 && f2Recouvre(box, b, m)) return false;
  const rI = opt.interR ?? 0.7;
  for (const it of w.inter || []) { if (Math.abs(it.y - y0) > 3) continue; if (Math.abs(it.x - box.x) > 5 || Math.abs(it.z - box.z) > 5) continue; if (f2DansBoite(box, it.x, it.z, rI)) return false; }
  for (const [x, z, r] of opt.res || []) if (f2DansBoite(box, x, z, r)) return false;
  if (opt.nav !== false) for (const n of w.nav.nodes) { if (Math.abs(n.x - box.x) > 5 || Math.abs(n.z - box.z) > 5) continue; if (f2DansBoite(box, n.x, n.z, opt.navR ?? 0.55)) return false; }
  return true;
}
// les chemins intérieurs d'un bâtiment (porte → entrée → milieu → lit, ouvrage, siège…) ne doivent pas être coupés
function f2CheminsLibres(w, b, box, m) {
  const N = w.nav.nodes, P = [];
  const seg = (a, c) => { if (a && c) P.push([a.x, a.z, c.x, c.z]); };
  seg(N[b.nOut], N[b.nIn]); seg(N[b.nIn], N[b.nMid]);
  for (const k in b.spots || {}) seg(N[b.nMid], b.spots[k]);
  for (const [ax, az, cx, cz] of P) {
    const L = Math.hypot(cx - ax, cz - az), n = Math.max(1, Math.ceil(L / 0.2));
    for (let i = 0; i <= n; i++) { const t = i / n; if (f2DansBoite(box, lerp(ax, cx, t), lerp(az, cz, t), m ?? 0.3)) return false; }
  }
  return true;
}
const f2Local = (f, x, z) => { const c = Math.cos(f.r), s = Math.sin(f.r), dx = x - f.x, dz = z - f.z; return [dx * c - dz * s, dx * s + dz * c]; };

// ---------------------------------------------------------------- la génération (après tout le reste, tirage à part)
function fouillesGen(w, seed) {
  if (!w || !w.bld || !w.nav || !w.props) return;
  w.inter = w.inter || [];
  const rnd = mulberry32(((seed | 0) * 7919 + 9898) >>> 0);
  const B = new Builder(w, rnd, new Uint8Array(1));
  const T = w.townInfo, lm = w.lm || {};
  const pris = [], res = [];
  // un point loin des liaisons du maillage des rues (on ne coupe aucun chemin)
  const loinDesChemins = (x, z, r) => {
    const N = w.nav.nodes;
    for (const [a, b] of w.nav.edges) {
      const A = N[a], C = N[b];
      if (!A || !C || Math.min(A.x, C.x) > x + r + 1 || Math.max(A.x, C.x) < x - r - 1 || Math.min(A.z, C.z) > z + r + 1 || Math.max(A.z, C.z) < z - r - 1) continue;
      const dx = C.x - A.x, dz = C.z - A.z, L2 = dx * dx + dz * dz || 1, t = clamp(((x - A.x) * dx + (z - A.z) * dz) / L2, 0, 1);
      if (Math.hypot(x - (A.x + dx * t), z - (A.z + dz * t)) < r) return false;
    }
    return true;
  };
  // réservé : l'indice du tueur (chez ceux qui peuvent l'être) et le guichet de la mairie (posés au chargement)
  for (const d of NPC_DATA) { const b = d.killer && w.bld[d.home]; if (b && b.f) res.push([...B.toWorld(b.f, -b.W / 2 + 1.0, -0.4), 0.55]); }
  if (w.bld.mairie && w.bld.mairie.spots.work) res.push([w.bld.mairie.spots.work.x, w.bld.mairie.spots.work.z, 0.8]);
  const proprio = (key) => { const d = NPC_DATA.find((q) => q.home === key && (q.age || 30) >= 16); return d ? d.id : null; };
  const inter = (id, t, x, y, z, o) => { if (w.inter.some((i) => i.id === id)) return null; const T0 = F2_TYPES[t]; return B.inter('f2', id, x, y, z, (o && o.lab) || T0.lab, Object.assign({ t }, o || {})); };
  // un meuble contre un mur : 'B' fond, 'F' façade, 'L' gauche, 'R' droite ; u = position le long du mur
  const meuble = (b, pid, t, mur, u, o) => {
    if (!b || !b.f) return null;
    const c = PROP_COLL[pid], hx = c ? c[0] : 0.2, hz = c ? c[1] : 0.14, e = o.ep ?? 0.3, W = b.W, D = b.D;
    const [lx, lz, rr] = mur === 'B' ? [u, D / 2 - e - hz - 0.03, Math.PI] : mur === 'F' ? [u, -D / 2 + e + hz + 0.03, 0] : mur === 'L' ? [-W / 2 + e + hz + 0.03, u, Math.PI / 2] : mur === 'R' ? [W / 2 - e - hz - 0.03, u, -Math.PI / 2] : [u[0], u[1], u[2]];
    const f = b.f, y0 = f.y + (o.sol ?? 0.15), [x, z] = B.toWorld(f, lx, lz), r = f.r + rr;
    const box = { x, z, hx, hz, r, y: y0 };
    if (!f2Libre(w, box, y0, { pris, res }) || !f2CheminsLibres(w, b, box) || !pointFree(w, x, z, 0.05)) return null;
    const id = 'f2:' + b.key + ':' + (o.slot || t);
    const q = B.prop(pid, x, y0, z, r, { vide: false });
    q.f2 = id; pris.push(box);
    const d = hz + 0.3, own = o.own !== undefined ? o.own : proprio(b.key);
    return inter(id, t, x + Math.sin(r) * d, y0 + (o.h ?? F2_TYPES[t].h), z + Math.cos(r) * d, Object.assign({ own, bld: b.key, lieu: own ? 'maison' : 'abandon' }, o, { slot: undefined, ep: undefined, sol: undefined }));
  };
  // sur un objet déjà posé (comptoir, tonneau, sac, étagère, jarre…) : l'interaction seule
  const surObjet = (b, pid, plx, plz, ilx, ilz, t, o) => {
    if (!b || !b.f) return null;
    const [px, pz] = B.toWorld(b.f, plx, plz);
    const q = w.props.find((p) => p.id === pid && Math.hypot(p.x - px, p.z - pz) < 0.7);
    if (!q) return null;
    const [ix, iz] = B.toWorld(b.f, ilx, ilz), y = b.f.y + 0.15 + (o.h ?? F2_TYPES[t].h);
    if (w.inter.some((i) => Math.abs(i.y - y) < 1.5 && Math.hypot(i.x - ix, i.z - iz) < 0.6)) return null;
    for (const [x, z, r] of res) if (Math.hypot(x - ix, z - iz) < r) return null;
    const own = o.own !== undefined ? o.own : proprio(b.key);
    return inter('f2:' + b.key + ':' + (o.slot || t), t, ix, y, iz, Object.assign({ own, bld: b.key, lieu: own ? 'maison' : 'abandon' }, o, { slot: undefined }));
  };
  const bl = w.bld;
  // ============================================================ Valbrume : les boutiques et les maisons
  meuble(bl.mairie, 'secretaire', 'secretaire', 'R', -2.0, { lock: 3, cle: 'cle_bureau', pool: 'maire' });
  meuble(bl.mairie, 'armoire', 'armoire', 'L', -2.4, { pool: 'maire', table: 'f2_archives', lab: 'Fouiller l’armoire aux archives' });
  meuble(bl.mairie, 'coffre_fort', 'coffre_fort', 'B', 4.2, { lock: 4 });
  surObjet(bl.auberge, 'comptoir', 3.0, 3.3, 3.0, 3.15, 'tiroir', { table: 'f2_caisse_auberge', pool: 'aubergiste' });
  surObjet(bl.auberge, 'tonneau', 5.2, 4.4, 4.75, 3.9, 'tonneaux', {});
  meuble(bl.auberge, 'buffet', 'buffet', 'R', -2.0, { pool: 'aubergiste' });
  meuble(bl.boulangerie, 'petrin', 'petrin', 'R', -1.4, { pool: 'boulangere' });
  surObjet(bl.boulangerie, 'comptoir', 0, 0.6, 0.6, 0.75, 'tiroir', { table: 'f2_caisse_boulangerie' });
  meuble(bl.boulangerie, 'boite_tresors', 'boite_tresors', 'X', [-2.1, -3.3, 0], { own: 'fillette', pool: 'fillette' });
  meuble(bl.boulangerie, 'commode', 'commode', 'L', 0.8, { pool: 'boulangere' });
  meuble(bl.poste, 'casier_tri', 'casier_tri', 'R', -1.6, { pool: 'tri' });
  surObjet(bl.poste, 'caisse', 3.2, 1.6, 2.6, 1.7, 'colis', {});
  surObjet(bl.poste, 'comptoir', 0, 0.6, 0.6, 0.75, 'tiroir', { table: 'f2_caisse_poste' });
  meuble(bl.poste, 'commode', 'commode', 'F', -3.3, { lock: 2, pool: 'postiere', table: 'f2_commode_postiere', lab: 'Fouiller le tiroir des lettres perdues' });
  surObjet(bl.forge, 'tonneau', 3.8, 0.3, 3.3, 0.3, 'baquet', {});
  meuble(bl.forge, 'coffre_outils', 'coffre_outils', 'F', 4.1, {});
  meuble(bl.forge, 'malle', 'malle', 'L', -1.8, { pool: 'forgeron' });
  surObjet(bl.graineterie, 'sac', -3.2, 1.8, -2.7, 1.5, 'sacs_grain', {});
  surObjet(bl.graineterie, 'comptoir', 0, 0.6, 0.6, 0.75, 'tiroir', { table: 'f2_caisse_graineterie' });
  meuble(bl.graineterie, 'commode', 'commode', 'R', -1.8, { pool: 'grainetiere' });
  meuble(bl.garde, 'malle', 'malle', 'B', 1.8, { lock: 2, pool: 'garde', table: 'f2_coffre_garde', lab: 'Ouvrir le coffre du garde' });
  meuble(bl.eglise, 'armoire', 'sacristie', 'B', -3.1, { ep: 0.5, pool: 'cure', lieu: 'eglise' });
  meuble(bl.eglise, 'malle', 'malle', 'L', 6.0, { ep: 0.5, pool: 'cure', table: 'f2_malle_cure', lab: 'Ouvrir la malle du curé', lieu: 'eglise' });
  meuble(bl.eglise, 'tronc', 'tronc', 'X', [-2.0, -8.15, 0], { lock: 1, lieu: 'eglise' });
  meuble(bl.vide6, 'apothicaire', 'apothicaire', 'B', -0.9, { pool: 'alchimiste' });
  meuble(bl.vide6, 'malle', 'malle', 'F', 3.0, { pool: 'alchimiste' });
  for (const k of ['maison_a', 'maison_b', 'maison_c', 'maison_d', 'vide4', 'vide5']) {
    meuble(bl[k], 'armoire', 'armoire', 'B', 0.55, { pool: k, table: 'f2_abandon' });
    meuble(bl[k], 'commode', 'commode', 'F', -2.75, { pool: k, table: 'f2_abandon_commode' });
    if (k === 'maison_c' || k === 'vide5') meuble(bl[k], 'malle', 'malle', 'F', 3.0, { pool: k });
  }
  // ============================================================ Clairpré
  meuble(bl.ranch, 'sellerie', 'sellerie', 'F', -3.6, { pool: 'eleveuse' });
  meuble(bl.ranch, 'commode', 'commode', 'B', 0.6, { pool: 'eleveuse' });
  meuble(bl.ranch, 'malle', 'malle', 'F', 3.9, {});
  meuble(bl.maison_hameau_a, 'armoire', 'armoire', 'B', 0.5, { pool: 'morel', table: 'f2_abandon' });
  meuble(bl.maison_hameau_a, 'malle', 'malle', 'F', -2.3, { pool: 'morel' });
  meuble(bl.maison_hameau_b, 'armoire', 'armoire', 'B', 0.5, { pool: 'bastien', table: 'f2_abandon' });
  meuble(bl.maison_hameau_b, 'malle', 'malle', 'F', -2.3, { pool: 'bastien' });
  // la grange du ranch (sans aménagement : bottes de foin, sacs, coffre à outils)
  const H = lm.hameau, rb = bl.ranch;
  if (H && rb && rb.f) {
    const hf = { x: H.x, z: H.z, r: rb.f.r };
    const [gx, gz] = B.toWorld(hf, 18, 20), gy = rb.y;
    const G = { key: 'grange', f: { x: gx, y: gy - 0.15, z: gz, r: rb.f.r }, W: 12, D: 9, spots: {} };
    // (la grange du hameau : son plancher de terre battue, 11,7 m de large, est bien là ?)
    if (w.blocks.some((k) => Math.hypot(k.x - gx, k.z - gz) < 0.5 && k.sx > 11 && k.sx < 12.5 && Math.abs(k.y + k.sy - gy) < 0.3)) {
      const [f1x, f1z] = B.toWorld(G.f, -4.4, 3.4), [f2x, f2z] = B.toWorld(G.f, -3.3, 3.5), [f3x, f3z] = B.toWorld(G.f, -3.9, 3.45);
      const box = { x: f3x, z: f3z, hx: 1.2, hz: 0.4, r: G.f.r };
      if (f2Libre(w, box, gy, { pris, res, nav: false })) {
        B.prop('botte_foin', f1x, gy, f1z, G.f.r + 0.1); B.prop('botte_foin', f2x, gy, f2z, G.f.r - 0.08); B.prop('botte_foin', f3x, gy + 0.6, f3z, G.f.r + 0.3);
        // (la botte du dessus se pose sur les deux autres)
        pris.push(Object.assign(box, { y: gy }));
        const [ix, iz] = B.toWorld(G.f, -3.9, 2.6);
        inter('f2:grange:foin', 'foin', ix, gy + 0.8, iz, { own: 'eleveuse', bld: 'grange', lieu: 'maison' });
      }
      const [sx, sz] = B.toWorld(G.f, 4.4, 3.5), sbox = { x: sx, z: sz, hx: 0.5, hz: 0.45, r: G.f.r };
      if (f2Libre(w, sbox, gy, { pris, res, nav: false })) {
        B.prop('sacs', sx, gy, sz, G.f.r + Math.PI); pris.push(Object.assign(sbox, { y: gy }));
        const [ix, iz] = B.toWorld(G.f, 4.4, 2.7);
        inter('f2:grange:sacs', 'sacs_avoine', ix, gy + 0.6, iz, { own: 'eleveuse', bld: 'grange', lieu: 'maison' });
      }
      meuble(G, 'coffre_outils', 'coffre_outils', 'R', -0.8, { own: 'eleveuse', ep: 0.3 });
    }
  }
  // ============================================================ ailleurs
  meuble(bl.cabane_pecheur, 'malle', 'coffre_peche', 'F', -1.9, { pool: 'pecheur', table: 'f2_peche' });
  surObjet(bl.hutte_ermite, 'etagere', 2.6, 2.5, 2.6, 1.95, 'bocaux', { pool: 'guerisseuse' });
  surObjet(bl.hutte_ermite, 'jarre', -2.4, -1.8, -2.25, -2.2, 'jarre', { pool: 'guerisseuse' });
  meuble(bl.relais_chasse, 'malle', 'coffre_chasse', 'B', 0.8, { lock: 2, pool: 'chasseur' });
  meuble(bl.roulotte_a, 'malle', 'coffre_roulotte', 'X', [-0.62, -0.75, Math.PI / 2], { pool: 'colporteur', lieu: 'maison' });
  meuble(bl.roulotte_b, 'malle', 'coffre_roulotte', 'X', [-0.62, -0.75, Math.PI / 2], { pool: 'colporteuse', lieu: 'maison' });
  for (const k of ['source_a', 'source_b', 'source_c']) meuble(bl[k], 'armoire', 'armoire', 'B', 0.5, { pool: 'naturiste_' + k.slice(-1), table: 'f2_sources' });
  meuble(bl.nain_a, 'coffre_nain', 'coffre_nain', 'B', 0.5, { lock: 4, ep: 0.2, sol: 0 });
  meuble(bl.nain_b, 'coffre_nain', 'coffre_nain', 'B', 0.3, { lock: 4, ep: 0.2, sol: 0 });
  // ============================================================ la cave de l'auberge (salle souterraine ; on y descend par une trappe)
  const au = bl.auberge;
  if (au && au.f) {
    const [tx, tz] = B.toWorld(au.f, 5.0, 1.6), tb = { x: tx, z: tz, hx: 0.5, hz: 0.5, r: au.f.r };
    if (f2Libre(w, tb, au.f.y + 0.15, { pris, res }) && f2CheminsLibres(w, au, tb, 0.1)) {
      const cf = B.underRoom(170, 700, 8, 7, 2.6, 26, M_STONE, M_COBBLE);
      B.prop('trappe', tx, au.f.y + 0.16, tz, au.f.r, { open: false }); pris.push(Object.assign(tb, { y: au.f.y + 0.15 }));
      const [ex, ez] = B.toWorld(cf, -2.9, -2.5), [ux, uz] = B.toWorld(au.f, 4.2, 1.6);
      B.propRel(cf, 'echelle', -2.9, 0, -3.15, 0, { h: 2.6 });
      B.inter('f2_trappe', 'f2:auberge:trappe', tx, au.f.y + 0.45, tz, 'Descendre à la cave', { to: [ex, cf.y + 0.05, ez + 0.5], lock: 2, cle: 'cle_cave', own: 'aubergiste', bld: 'auberge' });
      B.inter('ladder', 'f2:cave:echelle', ex, cf.y + 1.1, ez - 0.2, 'Remonter l’échelle', { to: [ux, au.f.y + 0.2, uz] });
      for (const lx of [-1.9, -1.2, -0.5, 0.2]) B.propRel(cf, 'tonneau', lx, 0, 3.05, 0);
      B.propRel(cf, 'tonneau', 1.2, 0.3, 3.0, 0, null, 0.9);
      const c1 = B.toWorld(cf, -0.85, 2.3); inter('f2:cave:tonneaux', 'cave_tonneaux', c1[0], cf.y + 0.95, c1[1], { own: 'aubergiste', bld: 'cave', lieu: 'maison' });
      B.propRel(cf, 'etagere', 3.6, 0, 1.2, -Math.PI / 2, { kind: 'bocaux' });
      const c2 = B.toWorld(cf, 3.0, 1.2); inter('f2:cave:casier', 'cave_casier', c2[0], cf.y + 1.1, c2[1], { own: 'aubergiste', bld: 'cave', lieu: 'maison' });
      B.propRel(cf, 'jambons', 1.0, 0, -2.9, 0);
      const c3 = B.toWorld(cf, 1.0, -2.3); inter('f2:cave:jambons', 'cave_jambons', c3[0], cf.y + 1.5, c3[1], { own: 'aubergiste', bld: 'cave', lieu: 'maison' });
      B.propRel(cf, 'caisse', 3.3, 0, -2.9, 0.2); B.propRel(cf, 'caisse', 2.5, 0, -3.0, -0.1, null, 0.8); B.propRel(cf, 'sac', 3.4, 0, -1.9, 0.4); B.propRel(cf, 'sac', 3.4, 0, -1.4, -0.3);
      const c4 = B.toWorld(cf, 3.0, -2.35); inter('f2:cave:caisses', 'cave_caisse', c4[0], cf.y + 0.8, c4[1], { own: 'aubergiste', bld: 'cave', lieu: 'maison', pool: 'cave' });
      B.propRel(cf, 'table', -0.6, 0, -0.6, 0.15); B.propRel(cf, 'chaise', -0.6, 0, -1.4, Math.PI); B.propRel(cf, 'bougie', -0.4, 0.79, -0.5, 0);
      B.propRel(cf, 'bougie', -3.5, 0, 2.6, 0); B.propRel(cf, 'bougie', 3.5, 0, -3.1, 0);
      w.caveAuberge = { x: cf.x, z: cf.z, y: cf.y, r: cf.r, W: 8, D: 7 };
    }
  }
  // ============================================================ dehors : ce qui traîne déjà (charrettes, caisses, étals, bois, linge, poules, boîte aux lettres)
  const enVille = (q) => T && Math.abs(q.x - T.x) < 46.5 && Math.abs(q.z - T.z) < 46.5;
  const auHameau = (q) => H && Math.hypot(q.x - H.x, q.z - H.z) < 45;
  // le bâtiment le plus proche (distance au rectangle de ses murs)
  const prochain = (q, max) => { let best = null, bd = max; for (const k in bl) { const b = bl[k]; if (!b.f || b.under) continue; const [lx, lz] = f2Local(b.f, q.x, q.z), d = Math.hypot(Math.max(0, Math.abs(lx) - b.W / 2), Math.max(0, Math.abs(lz) - b.D / 2)); if (d < bd) { bd = d; best = k; } } return best; };
  const nb = {};
  const dehorsSur = (q, t, o) => {
    const id = 'f2:' + t + ':' + Math.round(q.x) + ':' + Math.round(q.z);
    const y = q.y + (o.h ?? F2_TYPES[t].h);
    if (w.inter.some((i) => Math.abs(i.y - y) < 2 && Math.hypot(i.x - q.x, i.z - q.z) < 0.6)) return null;
    const it = inter(id, t, q.x, y, q.z, o);
    if (it) { q.f2 = id; nb[t] = (nb[t] || 0) + 1; }
    return it;
  };
  const KT = { legumes: 'f2_legumes', fruits: 'f2_fruits', fromages: 'f2_fromages', poissons: 'f2_poissons', pains: 'f2_pains', poteries: 'f2_poteries', fleurs: 'f2_fleurs', tissus: 'f2_tissus' };
  for (const q of w.props.slice()) {
    if (q.gone || q.f2) continue;
    const ville = enVille(q), ham = auHameau(q), k = q.data && q.data.k;
    if (!ville && !ham && !(q.id === 'caisses' && k === 'poissons')) continue;
    if (q.id === 'charrette') dehorsSur(q, 'charrette', { table: k === 'foin' ? 'f2_charrette_foin' : k === 'tonneaux' ? 'f2_charrette_tonneaux' : 'charrette', own: ham ? 'eleveuse' : null, lieu: ham ? 'maison' : 'public', bld: ham ? 'ranch' : null, h: 1.1 });
    else if ((q.id === 'caisses' || q.id === 'tonneau') && k && KT[k]) dehorsSur(q, 'caisses', { table: KT[k], own: k === 'poissons' ? 'pecheur' : null, lieu: k === 'poissons' ? 'maison' : 'public', bld: k === 'poissons' ? 'cabane_pecheur' : null });
    else if (q.id === 'sacs' && ville) { const b = prochain(q, 6), own = b ? proprio(b) : null; dehorsSur(q, 'sacs_grain', { table: b === 'boulangerie' ? 'f2_farine' : 'f2_semences', own, bld: b, lieu: own ? 'maison' : 'public', h: 0.6 }); }
    else if (q.id === 'etal_complet' && ville) dehorsSur(q, 'etal', { table: KT[k] || 'f2_legumes', own: null, lieu: 'public', k: k || 'legumes' });
    else if (q.id === 'tas_bois' && (nb.tas_bois || 0) < 5) { const b = prochain(q, 5), own = b ? proprio(b) : null; dehorsSur(q, 'tas_bois', { own, bld: b, lieu: own ? 'maison' : 'public' }); }
    else if (q.id === 'corde_linge' && (nb.linge || 0) < 4) dehorsSur(q, 'linge', { own: ham ? 'eleveuse' : null, lieu: ham ? 'maison' : 'public', bld: ham ? 'ranch' : null });
    else if (q.id === 'cage_poules') dehorsSur(q, 'poulailler', { own: ham ? 'eleveuse' : null, lieu: ham ? 'maison' : 'public', bld: ham ? 'ranch' : null });
    else if (q.id === 'boite_poste' && ville) dehorsSur(q, 'boite_lettres', { own: 'postiere', bld: 'poste', lieu: 'maison', pool: 'boite' });
  }
  // les trois étals de la place (auvents de toile, sans objet posé : on vise le plateau)
  if (T) for (const [lx, lz] of [[-7.5, 6.5], [7.5, 6.5], [7.5, -6.5]]) {
    const x = T.x + lx, z = T.z + lz + Math.sign(lz) * 0.55, y = w.heightAt(T.x, T.z) + 1.0;
    if (w.inter.some((i) => Math.hypot(i.x - x, i.z - z) < 0.8 && Math.abs(i.y - y) < 2)) continue;
    inter('f2:etal:place:' + lx + ':' + lz, 'etal', x, y, z, { table: lx < 0 ? 'f2_legumes' : lz > 0 ? 'f2_fruits' : 'f2_fromages', own: null, lieu: 'public', k: 'place' });
  }
  // ============================================================ les poubelles, dans les arrière-cours des boutiques
  if (T) {
    for (const k of ['boulangerie', 'auberge', 'poste', 'forge', 'graineterie', 'mairie']) {
      const b = bl[k];
      if (!b || !b.f) continue;
      for (const [lx, lz] of [[b.W / 2 - 0.7, b.D / 2 + 0.55], [-b.W / 2 + 0.7, b.D / 2 + 0.55], [b.W / 2 + 0.55, b.D / 2 - 0.7]]) {
        const [x, z] = B.toWorld(b.f, lx, lz), y = w.heightAt(x, z), box = { x, z, hx: 0.27, hz: 0.27, r: b.f.r };
        if (Math.abs(y - b.f.y) > 0.5 || !pointFree(w, x, z, 0.3) || !f2Libre(w, box, y, { pris, res, navR: 0.6, interR: 0.8 }) || !loinDesChemins(x, z, 1.0)) continue;
        if (w.doors.some((d) => Math.hypot(d.x - x, d.z - z) < 1.8)) continue;
        const q = B.prop('poubelle', x, y, z, b.f.r + (rnd() - 0.5) * 0.6);
        const id = 'f2:poubelle:' + k;
        q.f2 = id; pris.push(Object.assign(box, { y }));
        inter(id, 'poubelle', x, y + 0.8, z, { own: null, lieu: 'rebut', pool: 'rebut', bld: null });
        break;
      }
    }
  }
  // ============================================================ les cachettes (invisibles tant qu'un papier ne les a pas révélées)
  const cache = (c, x, z, y, o) => {
    if (x === undefined || !isFinite(x)) return null;
    return inter('f2:cache:' + c, 'cache', x, y, z, Object.assign({ cache: c, own: F2_CACHES[c].own || null, lieu: F2_CACHES[c].own ? 'maison' : 'public', lab: 'Fouiller ' + F2_CACHES[c].nom }, o || {}));
  };
  const autour = (cx, cz, r0, r1, a0, fn) => { for (let k = 0; k < 24; k++) { const a = a0 + k * 0.52, d = r0 + (k % 4) * (r1 - r0) / 3, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d; if (pointFree(w, x, z, 0.25) && !w.inter.some((i) => Math.hypot(i.x - x, i.z - z) < 0.9)) return fn(x, z); } return null; };
  if (lm.puits_ville && bl.mairie) { const P = lm.puits_ville, a = Math.atan2(bl.mairie.z - P.z, bl.mairie.x - P.x); cache('puits', P.x + Math.cos(a) * 1.05, P.z + Math.sin(a) * 1.05, w.heightAt(P.x, P.z) + 0.55); }
  { const mo = w.props.find((q) => q.id === 'monument' && enVille(q)); if (mo) { const [x, z] = B.toWorld(mo, 0, 1.25); cache('monument', x, z, mo.y + 0.35); } }
  if (lm.lavoir) autour(lm.lavoir.x, lm.lavoir.z, 1.5, 4, 0.3, (x, z) => cache('lavoir', x, z, w.heightAt(x, z) + 0.35));
  if (lm.chene) autour(lm.chene.x, lm.chene.z, 2.0, 3.2, Math.PI, (x, z) => cache('chene', x, z, w.heightAt(x, z) + 0.8));
  if (bl.forge) { const tb = w.props.filter((q) => q.id === 'tas_bois' && Math.hypot(q.x - bl.forge.x, q.z - bl.forge.z) < 9).sort((a, b) => Math.hypot(a.x - bl.forge.x, a.z - bl.forge.z) - Math.hypot(b.x - bl.forge.x, b.z - bl.forge.z))[0]; if (tb) { const [x, z] = B.toWorld(tb, 0, 0.75); cache('forge', x, z, tb.y + 0.3, { bld: 'forge' }); } }
  if (H) { const bc = w.props.find((q) => q.id === 'banc' && auHameau(q)); if (bc) cache('hameau', bc.x, bc.z, bc.y + 0.25); }
  if (bl.eglise && bl.eglise.f) { const [x, z] = B.toWorld(bl.eglise.f, -1.55, -13.25); cache('clocher', x, z, bl.eglise.f.y + 0.6, { bld: 'eglise' }); }
  w.fouilles2 = { n: w.inter.filter((i) => i.kind === 'f2').length };
}
{
  const _gv = generateValley;
  generateValley = async function (seed, progress, gen) {
    const w = await _gv(seed, progress, gen);
    if (w && w.designed) { try { fouillesGen(w, w.seed || seed); } catch (e) { console.error('fouilles', e); } }
    return w;
  };
}

// ---------------------------------------------------------------- le jeu
const fouilles = {
  enCours: null, par: new Map(), props: new Map(), hintEl: null, t: 0, libres: new Set(),
  // étiquettes des interactions d'autres modules (activités) pour l'indice sous le réticule : kind -> fn(it) -> texte (HTML)
  etiquettes: {},
  // surcharges d'étiquette pour les endroits à fouiller (fn(it) -> texte HTML ou null), et gardiens qui ne sont pas des
  // habitants (marchands du Marchedi…) : fn(it) -> { qui, texte, village } s'ils voient le vol, sinon null
  surcharges: [], gardiens: [],
  S() {
    const s = farm.s;
    if (!s) return null;
    const S = s.fouille2 || (s.fouille2 = {});
    if (!S.vides) Object.assign(S, { v: 1, vides: {}, ouverts: {}, papiers: [], lus: {}, ou: {}, caches: {}, prises: {}, plaintes: {}, n: 0, pris: 0 });
    for (const k of ['ouverts', 'lus', 'ou', 'caches', 'prises', 'plaintes']) if (!S[k]) S[k] = {};
    if (!Array.isArray(S.papiers)) S.papiers = [];
    return S;
  },
  indexer() {
    this.par.clear(); this.props.clear();
    const w = game.world;
    if (!w) return;
    for (const it of w.inter || []) if (it.kind === 'f2' || it.kind === 'f2_trappe') this.par.set(it.id, it);
    for (const q of w.props) if (q.f2 && PROP_MODELS[q.id]) this.props.set(q.f2, q);
  },
  type(it) { return F2_TYPES[it.data.t] || F2_TYPES.malle; },
  table(it) { return it.data.table || this.type(it).table; },
  refill(it) { return it.data.refill || this.type(it).r || 3; },
  vide(it) {
    const S = this.S(), d = it.data;
    if (!S) return false;
    if (d.cache) return !!S.prises[d.cache];
    const v = S.vides[it.id];
    return v !== undefined && farm.s.day - v < this.refill(it);
  },
  ouvert(it) { const S = this.S(); return !it.data.lock || (S && S.ouverts[it.id] === farm.s.day); },
  proprio(it) { const id = it.data.own; return id ? npcs.byId[id] || null : null; },
  cacheConnue(c) { const S = this.S(); return !!(S && S.caches[c]); },
  // un habitant est-il dans tel bâtiment ?
  dedans(n, key) {
    const b = game.world.bld[key];
    if (!b || !b.f || !n) return false;
    if (n.inside === key) return true;
    const [lx, lz] = f2Local(b.f, n.x, n.z);
    return Math.abs(lx) < b.W / 2 && Math.abs(lz) < b.D / 2 && Math.abs((n.y ?? b.f.y) - b.f.y) < 3;
  },
  presents(key) { return npcs.list.filter((n) => n.st.alive && !n.vanished && !n.hunting && n.state !== 'gone' && n.state !== 'dead' && n.state !== 'sleep' && !n.sleep && this.dedans(n, key)); },

  // ------------------------------------------------------------------ fouiller
  async fouiller(it) {
    if (!farm.s || !it || this.enCours || game.sleeping || game.dying || (typeof cine !== 'undefined' && cine.on)) return;
    const d = it.data, T = this.type(it);
    if (d.cache && !this.cacheConnue(d.cache)) return;
    if (this.vide(it)) { sound.click && sound.click(); ui.subtitle('', d.cache ? '(La cachette est vide. C’est vous qui l’avez vidée.)' : pick(T.vides || F2_VIDES), 3); return; }
    if (!this.ouvert(it)) { const ok = await this.deverrouiller(it); if (!ok) return; }
    sound.fouille && sound.fouille(T.son);
    const p = game.player;
    this.enCours = { it, t: T.d, d: T.d, x: p.pos[0], z: p.pos[2] };
  },
  async deverrouiller(it) {
    const d = it.data, S = this.S(), s = farm.s;
    if (d.cle && farm.count(d.cle)) { S.ouverts[it.id] = s.day; sound.lock && sound.lock(false); ui.subtitle('', '(La clé tourne sans un bruit. Clic.)', 2.5); return true; }
    if (typeof crochetage !== 'undefined' && crochetage && typeof crochetage.tenter === 'function') {
      let ok = false;
      const titre = String(it.name || '').replace(/^(Fouiller|Ouvrir|Forcer|Descendre à) (le |la |les |l’)?/, (m0, v, art) => (art || '')).replace(/^./, (c) => c.toUpperCase());
      try { ok = await crochetage.tenter({ difficulte: d.lock, bruit: Math.min(1, 0.25 + d.lock * 0.12), x: it.x, z: it.z, proprietaire: d.own || null, titre }); } catch (e) { console.error('crochetage', e); ok = false; }
      if (ok) { S.ouverts[it.id] = s.day; return true; }
      return false;
    }
    sound.lock && sound.lock(true);
    ui.subtitle('', pick(['(Fermé à clé.)', '(C’est fermé à clé. Il faudrait la clé… ou de quoi crocheter.)']), 3);
    return false;
  },
  resoudre(it) {
    const S = this.S(), s = farm.s, d = it.data, T = this.type(it), p = game.player;
    const pos = [it.x, it.y + 0.2, it.z], got = [];
    const lots = d.cache ? (F2_CACHES[d.cache] ? F2_CACHES[d.cache].lots : []) : rollLoot(this.table(it));
    let pieces = 0;
    for (const [k, n] of lots) {
      if (k === 'argent') { pieces += n; continue; }
      if (!ITEMS[k] || (ITEMS[k].unique && farm.count(k))) continue;
      farm.give(k, n); play.flyer && play.flyer(k, pos, n);
      got.push([k, n]);
    }
    if (pieces > 0) { farm.earn(pieces); sound.coin && sound.coin(); }
    // un papier
    let papier = d.cache ? (F2_CACHES[d.cache] && F2_CACHES[d.cache].papier) || null : this.tirerPapier(it);
    if (papier && S.papiers.includes(papier)) papier = null;
    if (papier) this.garderPapier(papier, it);
    // l'état
    if (d.cache) S.prises[d.cache] = s.day; else S.vides[it.id] = s.day;
    S.n = (S.n || 0) + 1;
    this.majProp(it);
    // le récit
    const bits = [];
    if (pieces > 0) bits.push(pieces > 1 ? `${pieces} pièces` : 'une pièce');
    for (const [k, n] of got) bits.push(n > 1 ? `${itemName(k).toLowerCase()} (${n})` : itemName(k).toLowerCase());
    if (papier) bits.push(F2_PAPIERS[papier].t.toLowerCase());
    ui.subtitle('', bits.length ? `(${pick(['Vous trouvez', 'Vous prenez', 'Dans vos mains'])} : ${bits.join(', ')}.)` : '(Rien qui vaille la peine. Des miettes, de la poussière.)', 3.8);
    // qui a vu ?
    const own = this.proprio(it), vivant = !!(own && own.st.alive);
    const lieu = d.lieu || (vivant ? 'maison' : 'public');
    const vus = this.temoins(it, own);
    let pris = false, cri = null;
    if (lieu !== 'rebut' && lieu !== 'abandon') for (const fn of this.gardiens) { try { cri = fn(it); } catch (e) { console.error(e); } if (cri) break; }
    if (lieu === 'rebut') {
      if (vus.length) { const m = vus[0]; npcs.say(m, pick(F2_TEMOIN_REBUT), 3); npcs.addAmitie(m, -5); if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-0.3, 'fouiller les ordures', 1); }
    } else if (lieu === 'abandon' || (own && !vivant)) {
      if (vus.length) { const m = vus[0]; npcs.say(m, fmtLine(pick(own && !vivant ? F2_TEMOIN_MORT : F2_TEMOIN_ABANDON), m, { victime: own ? own.name : '' }), 3.5); for (const v of vus) npcs.addAmitie(v, -20); }
      if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(own && !vivant ? -1 : -0.4, 'fouiller chez les disparus', 2);
    } else {
      // c'est un vol (chez quelqu'un, dans un commerce, à l'église, ou sur la marchandise d'autrui)
      this.marquer(got, vivant ? own.id : null, T);
      if (vus.length || cri) { this.pris(it, vivant ? own : null, vus, cri); pris = true; }
      else {
        if (vivant) S.plaintes[own.id] = s.day;
        if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(T.enfant || d.t === 'tronc' ? -1.5 : -0.6, 'voler', 3);
      }
    }
    if (papier && !pris) setTimeout(() => { if (!ui.panel && !game.dying) this.lirePapier(papier); }, 900);
    else if (papier) setTimeout(() => ui.subtitle('', '(Le papier, vous le relirez plus tard : sacoche, onglet Lettres.)', 3.5), 3800);
    return { pieces, got, papier, pris, vus: vus.map((m) => m.id) };
  },
  // les objets pris chez quelqu'un se reconnaissent (le vol à la tire les compte)
  marquer(got, de, T) {
    if (!de || typeof vol === 'undefined' || !vol.S) return;
    try { const V = vol.S(); if (!V) return; for (const [k, n] of got) { const perso = ITEMS[k] && (ITEMS[k].cat === 'tresor' || ITEMS[k].cat === 'outil'); for (let i = 0; i < Math.min(n, 3); i++) V.marques.push({ id: k, de, j: farm.s.day, t: perso ? 'p' : 'm' }); } } catch (e) { console.error(e); }
  },
  // qui voit ? (de face, pas trop loin, sans mur entre ; les dormeurs se réveillent parfois)
  temoins(it, own) {
    const p = game.player, w = game.world, h = npcs.hour(), nuit = h >= 21 || h < 5.5, out = [];
    const key = it.data.bld;
    for (const m of npcs.list) {
      if (!m.st.alive || m.vanished || m.hunting || m.state === 'gone' || m.state === 'dead' || m.talking) continue;
      const dx = p.pos[0] - m.x, dz = p.pos[2] - m.z, dist = Math.hypot(dx, dz);
      if (dist > 13) continue;
      if (m.y !== undefined && Math.abs(m.y - p.pos[1]) > 3.5) continue;
      const meme = key && this.dedans(m, key);
      if (m.sleep || m.state === 'sleep') {
        if (dist < 5.5 && (meme || dist < 3) && Math.random() < (it.data.lock ? 0.3 : 0.18)) { m.state = 'idle'; m.sleep = false; m.goal = null; out.push(m); }
        continue;
      }
      if (dist > 2.2 && !segClear(w, m.x, m.z, p.pos[0], p.pos[2])) continue;
      const face = (dx * Math.sin(m.heading || 0) + dz * Math.cos(m.heading || 0)) / (dist || 1);
      let k = face > 0.35 ? 0.8 : face > -0.1 ? 0.4 : 0.12;
      if (dist < 3) k += 0.2; else if (dist > 8) k *= 0.6;
      if (nuit && !game.lantern) k *= 0.55;
      if (p.crouch > 0.5) k *= 0.7;
      if (m === own) k += 0.15;
      if (Math.random() < k) out.push(m);
    }
    return out;
  },
  // pris sur le fait
  pris(it, own, vus, cri) {
    const S = this.S(), p = game.player, g = npcs.byId.garde;
    if (cri && !vus.length) {
      ui.subtitle(cri.qui || '', cri.texte, 3.5);
      if (own) { npcs.addAmitie(own, -60); npcs.remember(own, 'vol'); }
      if (typeof societe !== 'undefined' && societe.crime) { try { societe.crime({ type: 'vol', victime: own ? own.id : null, x: p.pos[0], z: p.pos[2], temoins: [], preuve: cri.village || true }); if (societe.alerterGarde) societe.alerterGarde(p.pos[0], p.pos[2], 0.8); } catch (e) { console.error(e); } }
      S.pris = (S.pris || 0) + 1;
      return;
    }
    if (own && vus.includes(own)) npcs.say(own, F2_CRIS[own.id] || pick(F2_CRIS._), 3.5);
    else { const a = vus[0]; npcs.say(a, fmtLine(pick(own ? F2_TEMOIN : F2_TEMOIN_PUBLIC), a, { victime: own ? own.name : '' }), 3.2); }
    for (const m of vus) { m.heading = Math.atan2(p.pos[0] - m.x, p.pos[2] - m.z); m.chatT = 0; }
    if (own) { npcs.addAmitie(own, -150); own.st.anger = Math.max(own.st.anger || 0, 4); npcs.remember(own, 'vol'); }
    if (typeof societe !== 'undefined' && societe.crime) { try { societe.crime({ type: 'vol', victime: own ? own.id : null, x: p.pos[0], z: p.pos[2], temoins: vus }); } catch (e) { console.error(e); } }
    else if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-2.5, 'crime : vol');
    if (g && g.st.alive && !g.sleep && (vus.includes(g) || Math.hypot(g.x - p.pos[0], g.z - p.pos[2]) < 40)) { g.poursuite = game.time + 18; g.vuT = game.time; g.fleeT = 0; }
    S.pris = (S.pris || 0) + 1;
  },

  // ------------------------------------------------------------------ les papiers
  tirerPapier(it) {
    const d = it.data, T = this.type(it), S = this.S(), L = d.pool && F2_POOLS[d.pool];
    if (!L || !L.length || Math.random() > (d.p ?? T.p ?? 0.3)) return null;
    const reste = L.filter((id) => !S.papiers.includes(id));
    return reste.length ? reste[(Math.random() * reste.length) | 0] : null;
  },
  garderPapier(id, it) {
    const S = this.S();
    if (!F2_PAPIERS[id] || S.papiers.includes(id)) return;
    S.papiers.push(id);
    S.ou[id] = it ? this.lieuDe(it) : '';
  },
  lieuDe(it) {
    const d = it.data, b = d.bld && game.world.bld[d.bld];
    if (d.bld === 'cave') return 'la cave de l’auberge';
    if (d.bld === 'grange') return 'la grange du ranch';
    if (b) return LIEU_NAMES[d.bld] || b.name || d.bld;
    return d.lieu === 'rebut' ? 'une poubelle' : 'la rue';
  },
  lirePapier(id) {
    const P = F2_PAPIERS[id], S = this.S();
    if (!P || !S) return;
    ui.read(P.t, fmtLine(P.x, null), P.s ? fmtLine(P.s, null) : '');
    sound.page && sound.page();
    const neuf = !S.lus[id];
    S.lus[id] = 1;
    if (P.cache && !S.caches[P.cache]) { S.caches[P.cache] = 1; if (neuf) setTimeout(() => ui.subtitle('', '(Une cachette… Voilà qui mérite qu’on aille voir.)', 3.5), 600); }
  },

  // ------------------------------------------------------------------ l'aspect des meubles (ouverts quand ils sont vides)
  majProp(it) {
    const q = this.props.get(it.id);
    if (!q) return;
    const v = this.vide(it);
    if (!!(q.data && q.data.vide) === v) return;
    q.data = Object.assign({}, q.data || {}, { vide: v });
    farm.dirtyProps = true;
  },
  majTout() { for (const it of this.par.values()) this.majProp(it); },
  // chaque matin : ce qui s'est rempli, les serrures refermées
  jour() {
    const S = this.S(), s = farm.s;
    if (!S) return;
    for (const id in S.vides) { const it = this.par.get(id); if (!it || s.day - S.vides[id] >= this.refill(it)) delete S.vides[id]; }
    for (const id in S.ouverts) if (S.ouverts[id] !== s.day) delete S.ouverts[id];
    for (const id in S.plaintes) if (s.day - S.plaintes[id] > 4) delete S.plaintes[id];
    this.majTout();
  },
  charger() {
    this.enCours = null;
    this.S(); this.indexer(); this.jour();
    if (typeof VOL_POCHES !== 'undefined') {
      const M = VOL_POCHES.maire; if (M && !(M.r || []).includes('cle_bureau')) (M.r = M.r || []).push('cle_bureau');
      const A = VOL_POCHES.aubergiste; if (A && A.m && !A.m.includes('cle_cave')) A.m.push('cle_cave');
    }
    if (this.branche) return;
    this.branche = true;
    // la plainte du lendemain
    const _open = talk.open.bind(talk);
    talk.open = function (n) {
      const v = _open(n);
      try {
        const S = fouilles.S(), j = S && S.plaintes[n.id];
        if (v && v.text && j !== undefined && farm.s.day > j && n.st.alive && !npcs.murdererKnown() && !(n.st.anger > 0)) {
          delete S.plaintes[n.id];
          v.text = fmtLine(F2_PLAINTES[n.id] || pick(F2_PLAINTES._), n);
        }
      } catch (e) { console.error(e); }
      return v;
    };
    // la sacoche, onglet Lettres : les papiers trouvés
    const _rs = ui.renderSatchel.bind(ui);
    ui.renderSatchel = function () {
      _rs();
      try {
        if (this.satTab !== 'lettres' || !farm.s) return;
        const S = fouilles.S();
        if (!S || !S.papiers.length) return;
        const body = $('#satchel .body');
        if (!body) return;
        fouilles.style();
        const div = document.createElement('div');
        div.className = 'f2-papiers';
        div.innerHTML = `<h4>Papiers trouvés (${S.papiers.length})</h4>` + S.papiers.slice().reverse().map((id) => { const P = F2_PAPIERS[id]; return P ? `<button class="f2-pap${S.lus[id] ? '' : ' neuf'}" data-f2pap="${id}">${esc(P.t)}<i>${esc(S.ou[id] || '')}</i></button>` : ''; }).join('');
        body.appendChild(div);
        div.querySelectorAll('[data-f2pap]').forEach((b) => (b.onclick = () => fouilles.lirePapier(b.dataset.f2pap)));
      } catch (e) { console.error(e); }
    };
    // les charrettes de la ville et du hameau ne sont pas au fermier : E les fouille
    const _pc = HOOKS.propPre.charrette;
    HOOKS.propPre.charrette = (q) => {
      const it = q && q.f2 && fouilles.par.get(q.f2);
      if (it && !(typeof attelage !== 'undefined' && attelage.aMoi && attelage.aMoi(q))) { fouilles.fouiller(it); return true; }
      return _pc ? _pc(q) : false;
    };
  },
  style() {
    if (this.styled || typeof document === 'undefined' || !document.head) return;
    this.styled = true;
    const st = document.createElement('style');
    st.textContent = '#f2-hint{position:fixed;left:50%;top:calc(50% + 26px);transform:translateX(-50%);color:#e8e0cc;font:13px Georgia,serif;text-shadow:0 1px 2px #000;opacity:0;transition:opacity .25s;pointer-events:none;z-index:6;white-space:nowrap}#f2-hint.on{opacity:.82}#f2-hint i{color:#b04a3a;margin-left:5px}#f2-hint b{font-weight:normal;color:#c8b070;margin-left:5px}'
      + '.f2-papiers{margin-top:14px}.f2-pap{display:block;width:100%;text-align:left;background:none;border:0;border-bottom:1px dotted rgba(90,70,40,.35);padding:5px 2px;font:14px Georgia,serif;color:inherit;cursor:pointer}.f2-pap i{float:right;opacity:.6;font-size:12px}.f2-pap.neuf{font-weight:bold}.f2-pap:hover{background:rgba(120,90,40,.08)}';
    document.head.appendChild(st);
  },
  hint() {
    if (this.hintEl && this.hintEl.isConnected) return this.hintEl;
    if (typeof document === 'undefined' || !document.body) return null;
    this.style();
    const d = document.createElement('div'); d.id = 'f2-hint';
    document.body.appendChild(d);
    this.hintEl = d;
    return d;
  },
  // le texte sous le réticule
  etiquette(it) {
    if (this.etiquettes[it.kind]) { try { return this.etiquettes[it.kind](it); } catch (e) { return esc(it.name || ''); } }
    if (it.kind === 'f2_trappe') return esc(it.name) + (it.data.lock && !this.ouvert(it) && !farm.count(it.data.cle) ? ' <b>— fermée à clé</b>' : '');
    if (it.kind !== 'f2') return null;
    for (const fn of this.surcharges) { const r = fn(it); if (r) return r; }
    const d = it.data, own = this.proprio(it);
    let t = esc(it.name);
    if (this.vide(it)) return t + ' <b>— vide</b>';
    if (d.lock && !this.ouvert(it)) t += ' <b>— fermé à clé</b>';
    if (own && own.st.alive && d.lieu !== 'rebut') t += ` <i>${esc(own.st.met ? '(chez ' + own.name + ')' : '(chez quelqu’un)')}</i>`;
    return t;
  },
  update(dt, playing) {
    const E = this.enCours;
    if (E) {
      const p = game.player;
      if (!playing || ui.panel || Math.hypot(p.pos[0] - E.x, p.pos[2] - E.z) > 1.4) { this.enCours = null; if (playing) ui.subtitle('', '(Vous laissez tomber.)', 2); }
      else { E.t -= dt; if (E.t <= 0) { this.enCours = null; try { this.resoudre(E.it); } catch (e) { console.error('fouille', e); } } }
    }
    const el = this.hint();
    if (!el) return;
    let html = '';
    if (this.enCours && playing) html = 'Vous fouillez' + ['.', '..', '...'][Math.floor((this.enCours.d - this.enCours.t) * 3) % 3];
    else {
      const t = playing ? game.target : null;
      if (t && t.kind === 'inter' && t.it) { const s = this.etiquette(t.it); if (s) html = 'E — ' + s; }
      else if (t && t.kind === 'hook' && t.f2lab) html = 'E — ' + esc(t.f2lab);
    }
    if (el.innerHTML !== html) el.innerHTML = html;
    el.classList.toggle('on', !!html);
  },
};

// ---------------------------------------------------------------- branchements
HOOKS.inter.f2 = (it) => { fouilles.fouiller(it); };
HOOKS.interVis.f2 = (it) => !it.data.cache || fouilles.cacheConnue(it.data.cache);
HOOKS.inter.f2_trappe = async (it) => {
  const d = it.data, au = npcs.byId.aubergiste;
  if (game.sleeping) return;
  const vus = fouilles.temoins(it, au);
  let permis = false;
  if (vus.length) {
    if (au && vus.includes(au)) {
      if (npcs.level(au) >= 6) { permis = true; npcs.say(au, 'La cave ? Allez-y, si ça vous amuse. Mais ne touchez pas au fût du fond. Je ne plaisante pas.', 4); }
      else { npcs.say(au, pick(['Hé ! La cave, c’est pour la maison, pas pour les clients.', 'Non, non, non. Personne ne descend à ma cave. Personne.']), 3.2); npcs.addAmitie(au, -10); return; }
    } else { const m = vus[0]; npcs.say(m, 'Hé ! La cave, ce n’est pas pour les clients. Je le dirai au patron.', 3); npcs.addAmitie(m, -5); if (au) npcs.addAmitie(au, -8); return; }
  }
  if (!permis && !fouilles.ouvert(it)) { const ok = await fouilles.deverrouiller(it); if (!ok) return; }
  const S = fouilles.S(), premier = S.caveJour !== farm.s.day;
  S.caveJour = farm.s.day;
  await game.teleport(d.to, 'Vous soulevez la trappe, et vous descendez dans le noir…');
  if (premier) setTimeout(() => { if (!game.dying) { ui.subtitle('', '(Ça sent le tabac à pipe. Personne ne fume, ici.)', 4); sound.whisper && sound.whisper(0, 0.25); } }, 1200);
};
HOOKS.update.push((dt, eye, basis, sky, playing) => { if (farm.s && game.world) fouilles.update(dt, playing); });
HOOKS.day.push(() => { if (farm.s) fouilles.jour(); });
HOOKS.load.push(() => { if (farm.s && game.world) fouilles.charger(); });
