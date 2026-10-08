// ============================================================================
//  LES CRÉATURES DES TERRES D'AVANT (agent V2, quatorzième vague) — données
//  Quinze espèces, toutes évitables en restant discret ; chacune a ses lieux,
//  ses heures, sa façon de voir et d'entendre (réglages de furtif.guetteur),
//  ses coups, son butin, et ce qu'on finit par comprendre d'elle (le carnet).
//  Le moteur : 11-zzzzV2-1-moteur.js ; les repaires : 11-zzzzV2-2-repaires.js ;
//  les conduites propres : 11-zzzzV2-3-especes.js ; les modèles :
//  07-zzzzzzzzzzzzV2-creatures.js ; les cris : 09-zzzzzV2-cris.js.
//  Heures : [de, à] en heures de jeu (à cheval sur minuit si de > à).
//  hors : ce que fait la bête hors de ses heures — 'dort' (au nid, les sens
//  engourdis : réglages « dort »), 'cache' (on ne la voit pas), 'calme' (elle est
//  là, moins alerte).
// ============================================================================
const V2_ESPECES = {
  // ---------------------------------------------------------------- le Bois Mort, la nuit
  v2_garou: {
    nom: 'garou', nomPl: 'garous', titre: 'Les Garous', nature: 'hostile', types: ['rodeur'], conduite: 'meute',
    nb: [3, 3], pv: 70, rayon: 0.45, haut: 1.95, marche: 1.3, course: 7.2, tour: 5, errance: 120, laisse: 170,
    heures: [19, 6], hors: 'dort', feu: true,
    sens: { vue: 30, cone: 140, nuit: 0.95, ouie: 1.3, memoire: 24, oubli: 0.2, vitesse: 1.2, lumiere: 0.8, hauteur: 1.7 },
    dort: { vue: 4, cone: 120, nuit: 1, ouie: 0.35, memoire: 8, vitesse: 0.6 },
    coup: { dmg: 13, portee: 1.7, prep: 0.45, recup: 2.0, saigne: [0.35, 0.06], cause: 'Dévoré par les garous, dans le Bois Mort' },
    butin: 'v2_garou',
  },
  // ---------------------------------------------------------------- partout où il y a des os
  v2_charognard: {
    nom: 'mange-mort', nomPl: 'mange-morts', titre: 'Les Mange-Morts', nature: 'hostile', types: ['rodeur'], conduite: 'charogne',
    nb: [2, 4], pv: 25, rayon: 0.35, haut: 0.9, marche: 1.4, course: 6.0, tour: 6, errance: 60, laisse: 110,
    heures: [0, 24], hors: 'calme', feu: true,
    sens: { vue: 24, cone: 150, nuit: 0.75, ouie: 1.1, memoire: 16, oubli: 0.25, vitesse: 1.0, lumiere: 0.5, hauteur: 0.7 },
    coup: { dmg: 7, portee: 1.3, prep: 0.35, recup: 1.6, saigne: [0.2, 0.05], cause: 'Rongé par les mange-morts' },
    butin: 'v2_charognard',
  },
  // ---------------------------------------------------------------- aux arbres morts, le long des chemins
  v2_pendu: {
    nom: 'pendu', nomPl: 'pendus', titre: 'Les Pendus', nature: 'hostile', types: ['gardien'], conduite: 'pendu', dessous: true,
    nb: [1, 3], pv: 30, rayon: 0.32, haut: 1.75, marche: 0.8, course: 1.9, tour: 2.5, errance: 0, laisse: 45,
    heures: [0, 24], hors: 'calme', feu: false,
    sens: { vue: 0, aveugle: true, cone: 360, nuit: 1, ouie: 1.1, memoire: 10, oubli: 0.3, vitesse: 1.2, lumiere: 0, hauteur: 1.5 },
    coup: { dmg: 9, portee: 1.2, prep: 0.6, recup: 2.2, serre: 1.6, cause: 'Étranglé par un pendu' },
    butin: 'v2_pendu',
  },
  // ---------------------------------------------------------------- la Ville Basse, la nuit
  v2_ecoutant: {
    nom: 'écoutant', nomPl: 'écoutants', titre: 'Ce qui écoute', nature: 'hostile', types: ['rodeur', 'gardien'], conduite: 'ecoute', dessous: true,
    nb: [1, 1], pv: 60, rayon: 0.4, haut: 2.4, marche: 0.9, course: 6.5, tour: 3, errance: 70, laisse: 100,
    heures: [21, 5], hors: 'cache', feu: false,
    sens: { vue: 0, aveugle: true, cone: 360, nuit: 1, ouie: 2.0, memoire: 10, oubli: 0.35, vitesse: 1.6, lumiere: 0, hauteur: 2.2 },
    coup: { dmg: 24, portee: 1.9, prep: 0.5, recup: 2.5, cause: 'Saisi par ce qui écoute, dans la Ville Basse' },
    butin: 'v2_ecoutant',
  },
  // ---------------------------------------------------------------- sur les murs : elles regardent
  v2_gargouille: {
    nom: 'gargouille', nomPl: 'gargouilles', titre: 'Les Gargouilles', fem: true, nature: 'hostile', types: ['gardien'], conduite: 'guet',
    nb: [1, 1], pv: 50, rayon: 0.5, haut: 1.3, marche: 0, course: 9, tour: 1, errance: 0, laisse: 32,
    heures: [0, 24], hors: 'calme', feu: false, pierre: true,
    sens: { vue: 40, cone: 70, nuit: 0.7, ouie: 0, sourd: true, memoire: 12, oubli: 0.3, vitesse: 1.1, lumiere: 0.9, hauteur: 1.0 },
    coup: { dmg: 10, portee: 1.8, prep: 0.2, recup: 3, cause: 'Lacéré par une gargouille' },
    butin: 'v2_gargouille',
  },
  // ---------------------------------------------------------------- les falaises, la nuit
  v2_stryge: {
    nom: 'stryge', nomPl: 'stryges', titre: 'Les Stryges', fem: true, nature: 'hostile', types: ['rodeur'], conduite: 'stryge',
    nb: [2, 3], pv: 15, rayon: 0.5, haut: 0.7, marche: 4, course: 12, tour: 2, errance: 40, laisse: 90,
    heures: [20, 5], hors: 'cache', feu: true, vol: true,
    sens: { vue: 45, cone: 300, nuit: 1.15, ouie: 1.2, memoire: 10, oubli: 0.3, vitesse: 1.0, lumiere: 1.0, hauteur: 0 },
    coup: { dmg: 7, portee: 1.6, prep: 0, recup: 6, vole: 0.4, cause: 'Mis en pièces par les stryges' },
    butin: 'v2_stryge',
  },
  // ---------------------------------------------------------------- le Jardin de pierre (Cendrières)
  v2_basilic: {
    nom: 'basilic', nomPl: 'basilics', titre: 'Le Basilic', nature: 'hostile', unique: true, types: ['gardien'], conduite: 'basilic',
    nb: [1, 1], pv: 140, rayon: 0.6, haut: 1.2, marche: 0.6, course: 1.8, tour: 1.4, errance: 35, laisse: 45,
    heures: [6, 21], hors: 'dort', feu: false,
    sens: { vue: 26, cone: 100, nuit: 0.4, ouie: 0.6, memoire: 10, oubli: 0.3, vitesse: 1.0, lumiere: 0.6, hauteur: 1.0 },
    dort: { vue: 0, aveugle: true, ouie: 0.3, memoire: 4 },
    coup: { dmg: 15, portee: 1.6, prep: 0.6, recup: 2.4, poison: 25, cause: 'Mordu par le basilic' },
    butin: null,
  },
  // ---------------------------------------------------------------- la Bauge (Cendrières)
  v2_tarasque: {
    nom: 'tarasque', nomPl: 'tarasques', titre: 'La Tarasque', fem: true, nature: 'hostile', unique: true, types: ['gardien'], conduite: 'tarasque',
    nb: [1, 1], pv: 650, rayon: 2.1, haut: 2.6, marche: 0.9, course: 4.8, tour: 0.8, errance: 30, laisse: 60,
    heures: [12, 13], hors: 'dort', feu: false,
    sens: { vue: 18, cone: 120, nuit: 0.6, ouie: 1.0, memoire: 12, oubli: 0.3, vitesse: 0.8, lumiere: 0.5, hauteur: 2.2 },
    dort: { vue: 5, cone: 90, nuit: 1, ouie: 0.7, memoire: 6, vitesse: 1.0 },
    coup: { dmg: 40, portee: 3.2, prep: 0.9, recup: 3.5, cause: 'Écrasé par la Tarasque' },
    butin: null,
  },
  // ---------------------------------------------------------------- l'Antre (Ravines)
  v2_chimere: {
    nom: 'chimère', nomPl: 'chimères', titre: 'La Chimère', fem: true, nature: 'hostile', unique: true, types: ['gardien'], conduite: 'chimere',
    nb: [1, 1], pv: 280, rayon: 1.0, haut: 1.6, marche: 1.2, course: 6.0, tour: 2.5, errance: 0, laisse: 38,
    heures: [0, 24], hors: 'calme', feu: false,
    sens: { vue: 26, cone: 100, nuit: 0.6, ouie: 0.9, memoire: 12, oubli: 0.3, vitesse: 1.0, lumiere: 0.6, hauteur: 1.4 },
    coup: { dmg: 20, portee: 2.2, prep: 0.55, recup: 2.2, cause: 'Mis en pièces par la Chimère' },
    butin: null,
  },
  // ---------------------------------------------------------------- l'Étang des Noyés
  v2_vouivre: {
    nom: 'vouivre', nomPl: 'vouivres', titre: 'La Vouivre', fem: true, nature: 'hostile', unique: true, types: ['gardien'], conduite: 'vouivre',
    nb: [1, 1], pv: 320, rayon: 0.8, haut: 1.0, marche: 6, course: 13, tour: 1.6, errance: 150, laisse: 260,
    heures: [19, 4], hors: 'dort', feu: false, vol: true,
    sens: { vue: 50, cone: 220, nuit: 1.0, ouie: 1.0, memoire: 16, oubli: 0.25, vitesse: 1.0, lumiere: 1.0, hauteur: 0 },
    dort: { vue: 12, cone: 140, nuit: 1, ouie: 0.6, memoire: 6 },
    coup: { dmg: 18, portee: 2.2, prep: 0.5, recup: 3, poison: 20, cause: 'Tuée par la Vouivre' },
    butin: null,
  },
  v2_noye: {
    nom: 'noyé', nomPl: 'noyés', titre: 'Les Noyés', nature: 'hostile', types: ['gardien'], conduite: 'noye',
    nb: [1, 1], pv: 20, rayon: 0.4, haut: 1.2, marche: 1.2, course: 2.4, tour: 2, errance: 10, laisse: 22,
    heures: [20, 5], hors: 'cache', feu: false, eau: true,
    sens: { vue: 0, aveugle: true, cone: 360, nuit: 1, ouie: 0.8, memoire: 6, oubli: 0.4, vitesse: 1, lumiere: 0, hauteur: 0.3 },
    coup: { dmg: 4, portee: 1.4, prep: 0.3, recup: 0.5, cause: 'Noyé dans l’Étang des Noyés' },
    butin: null,
  },
  // ---------------------------------------------------------------- les Tertres, la nuit : la ronde
  v2_korrigan: {
    nom: 'korrigan', nomPl: 'korrigans', titre: 'Les Korrigans', nature: 'paisible', types: ['paisible'], conduite: 'ronde',
    nb: [7, 7], pv: 8, rayon: 0.25, haut: 0.95, marche: 1.4, course: 5, tour: 6, errance: 0, laisse: 40,
    heures: [22, 4], hors: 'cache', feu: false,
    sens: { vue: 11, cone: 200, nuit: 1, ouie: 0.6, memoire: 6, oubli: 0.5, vitesse: 1.0, lumiere: 0.7, hauteur: 0.8 },
    coup: null, butin: null,
  },
  // ---------------------------------------------------------------- les paisibles, et ceux qui aident
  v2_cerf: {
    nom: 'cerf-aux-mains', nomPl: 'cerfs-aux-mains', titre: 'Le Cerf-aux-Mains', nature: 'aide', unique: true, types: ['paisible'], conduite: 'cerf',
    nb: [1, 1], pv: 50, rayon: 0.45, haut: 2.3, marche: 1.0, course: 8, tour: 3, errance: 70, laisse: 400,
    heures: [7, 18], hors: 'cache', feu: false,
    sens: { vue: 40, cone: 220, nuit: 0.8, ouie: 1.6, memoire: 6, oubli: 0.4, vitesse: 1.4, lumiere: 0.7, hauteur: 1.9 },
    coup: null, butin: null,
  },
  v2_chien: {
    nom: 'chien gris', nomPl: 'chiens gris', titre: 'Le Chien Gris', nature: 'aide', unique: true, types: ['paisible'], conduite: 'chien',
    nb: [1, 1], pv: 60, rayon: 0.32, haut: 1.0, marche: 1.5, course: 7.6, tour: 6, errance: 12, laisse: 9999,
    heures: [0, 24], hors: 'calme', feu: false,
    sens: { vue: 20, cone: 240, nuit: 0.8, ouie: 1.2, memoire: 4, oubli: 0.5, vitesse: 1, lumiere: 0.5, hauteur: 0.8 },
    coup: { dmg: 10, portee: 1.5, prep: 0.3, recup: 1.6 }, butin: null,
  },
  v2_sans_visage: {
    nom: 'sans-visage', nomPl: 'sans-visage', titre: 'Les Sans-Visage', nature: 'paisible', types: ['paisible'], conduite: 'troupeau',
    nb: [5, 7], pv: 20, rayon: 0.4, haut: 1.0, marche: 0.6, course: 3.6, tour: 3, errance: 26, laisse: 60,
    heures: [0, 24], hors: 'calme', feu: false,
    sens: { vue: 18, cone: 300, nuit: 0.5, ouie: 1.0, memoire: 5, oubli: 0.5, vitesse: 1.2, lumiere: 0.6, hauteur: 0.8 },
    coup: null, butin: 'v2_sans_visage',
  },
};
const V2_ORDRE = ['v2_garou', 'v2_charognard', 'v2_pendu', 'v2_ecoutant', 'v2_gargouille', 'v2_stryge', 'v2_basilic', 'v2_tarasque', 'v2_chimere', 'v2_vouivre', 'v2_noye', 'v2_korrigan', 'v2_cerf', 'v2_chien', 'v2_sans_visage'];

// ---------------------------------------------------------------- le butin (objets nouveaux) : le jeu des choses, pas la richesse
defItem('v2_peau_garou', 'Peau de garou', 'chasse', 35, ['cuir', '#5a5048'], { desc: 'Une peau de loup, longue comme un homme. Au revers, sous le poil, des coutures : quelqu’un l’a cousue, il y a longtemps, à la manière d’un manteau.' });
defItem('v2_sceau_marchand', 'Chevalière de marchand', 'tresor', 60, ['anneau', '#b87840'], { desc: 'Une bague de cuivre, trop large pour un doigt d’homme. Le chaton porte une balance et deux lettres, P. M. Les marchands scellaient ainsi leurs ballots, sur la route d’avant.' });
defItem('v2_dent_charognard', 'Dent de mange-mort', 'chasse', 4, ['croc', '#e8e0c8'], { desc: 'Une dent plate et carrée, une dent de devant. Elle ressemble à une dent d’homme, et c’est ce qui dérange.' });
defItem('v2_corde_pendu', 'Corde de pendu', 'tresor', 15, ['fibre', '#4a3a2a'], { desc: 'Un bout de chanvre noirci, noué en coulant. Les anciens disaient que ça porte bonheur. Les anciens disaient beaucoup de choses.' });
defItem('v2_cuiller', 'Cuiller d’argent', 'tresor', 25, ['cle', '#d0d4dc'], { desc: 'Une cuiller d’argent, les initiales limées. On l’a volée deux fois : une fois pour la vendre, une fois pour la garder.' });
defItem('v2_tympan', 'Peau d’écoute', 'chasse', 40, ['mue', '#d8c8c0'], { desc: 'Une membrane sèche, fine comme une pelure d’oignon. Elle frémit quand on parle tout près. On n’ose pas parler tout près.' });
defItem('v2_oeil_gargouille', 'Œil d’agate', 'tresor', 45, ['gemme', '#8a7a68'], { desc: 'Une agate polie, grosse comme une noix, cerclée de plomb. Les maçons de la Ville Basse mettaient des yeux aux gargouilles, pour qu’elles voient venir.' });
defItem('v2_plume_stryge', 'Plume de stryge', 'chasse', 12, ['plume', '#a8a098'], { desc: 'Une plume grise, douce, qui ne fait aucun bruit. Elle sent le lait caillé et la chambre close.' });
defItem('v2_oeil_basilic', 'Œil de basilic', 'tresor', 250, ['gemme', '#d8b830'], { desc: 'Une pierre jaune et ronde, veinée comme un œil. On la tient dans la main sans la regarder. Les apothicaires d’autrefois l’auraient payée d’une maison.' });
defItem('v2_crete_basilic', 'Crête de basilic', 'chasse', 60, ['couronne', '#b83020'], { desc: 'Une crête de coq, rouge, dure comme de la corne, plantée sur un crâne de serpent.' });
defItem('v2_miroir_acier', 'Miroir d’acier', 'outil', 30, ['montre', '#a8b0b8'], { desc: 'Une plaque d’acier poli, grande comme une main, cerclée de cuir usé. On s’y voit mal : gris, et plus vieux.' });
defItem('v2_ecaille_tarasque', 'Écaille de tarasque', 'chasse', 90, ['mue', '#5a6a40'], { desc: 'Une écaille large comme une assiette, hérissée d’une pointe. Elle sonne comme une cloche quand on la frappe.' });
defItem('v2_ruban_bleu', 'Ruban bleu', 'tresor', 20, ['fibre', '#4a68a8'], { desc: 'Un ruban de soie bleue, délavé, effiloché, qu’on a noué très serré autour de quelque chose de grand. Il a tenu longtemps.' });
defItem('v2_criniere', 'Crinière de chimère', 'chasse', 70, ['laine', '#b88a40'], { desc: 'Une poignée de crins fauves, rêches, qui sentent le fauve et la cendre.' });
defItem('v2_corne_chimere', 'Corne de chimère', 'chasse', 55, ['croc', '#3a3430'], { desc: 'Une corne de bouc, noircie au bout comme une mèche. Elle est chaude.' });
defItem('v2_collier_armes', 'Collier aux armes', 'tresor', 30, ['anneau', '#5a5c62'], { desc: 'Un collier de fer large comme une main, rivé, jamais ouvert. Une plaque y porte des armes : trois tours sur une montagne.' });
defItem('v2_escarboucle', 'Escarboucle', 'tresor', 500, ['gemme', '#e02818'], { desc: 'Une pierre rouge, grosse comme un œuf de caille, chaude, qui luit dans le noir comme une braise qui respire.' });
defItem('v2_ecaille_vouivre', 'Écaille de vouivre', 'tresor', 120, ['mue', '#5aa070'], { desc: 'Une écaille verte et or, mince et souple. Elle ne pèse rien. On vous l’a laissée sur la pierre plate.' });
defItem('v2_alliance', 'Alliance noyée', 'tresor', 40, ['anneau', '#c8a040'], { desc: 'Un anneau d’or terni. À l’intérieur : « À toi jusqu’au fond ». Il était dans la vase, au bord de l’Étang, au matin.' });
defItem('v2_sou_korrigan', 'Sou des korrigans', 'tresor', 30, ['rond', '#e0c050'], { desc: 'Une petite pièce d’or, trop légère, frappée d’une ronde de bonshommes. Quand elle tombe, elle tinte comme un rire.' });
defItem('v2_bois_mains', 'Bois aux mains', 'chasse', 20, ['cerf', '#e8e2d4'], { desc: 'Un andouiller pâle qui finit en cinq doigts osseux, à demi refermés.' });
defItem('v2_laine_grise', 'Laine sans visage', 'produit', 18, ['laine', '#9a948c'], { desc: 'Une laine grise, grasse, tiède. Elle n’a aucune odeur.' });
defItem('v2_collier_chien', 'Collier de Fidèle', 'quete', 0, ['anneau', '#8a5a34'], { unique: true, desc: 'Un collier de cuir, une plaque de laiton : FIDÈLE. Et, gravée plus petit, une lettre à demi usée : A.' });

// tables de butin : [objet, min, max, poids] ; « argent » = pièces
Object.assign(LOOT, {
  v2_garou: { rolls: [1, 2], items: [['v2_peau_garou', 1, 1, 3], ['croc', 1, 2, 3], ['v2_sceau_marchand', 1, 1, 0.6], ['argent', 4, 18, 1]] },
  v2_charognard: { rolls: [1, 1], items: [['v2_dent_charognard', 1, 2, 4], ['os', 1, 2, 3], ['argent', 1, 6, 1]] },
  v2_pendu: { rolls: [1, 2], items: [['v2_corde_pendu', 1, 1, 3], ['v2_cuiller', 1, 1, 1], ['vieille_piece', 1, 2, 2], ['argent', 3, 15, 2]] },
  v2_ecoutant: { rolls: [1, 1], items: [['v2_tympan', 1, 1, 1]] },
  v2_gargouille: { rolls: [1, 1], items: [['v2_oeil_gargouille', 1, 1, 3], ['pierre', 2, 4, 3]] },
  v2_stryge: { rolls: [1, 1], items: [['v2_plume_stryge', 1, 2, 4], ['argent', 2, 10, 1]] },
  v2_sans_visage: { rolls: [1, 1], items: [['v2_laine_grise', 1, 1, 3], ['viande', 1, 2, 2]] },
  // les caches des repaires (une fois)
  v2_nid_stryge: { rolls: [2, 3], items: [['vieille_piece', 1, 3, 4], ['bijou', 1, 1, 1], ['v2_cuiller', 1, 1, 1], ['argent', 10, 40, 3], ['v2_plume_stryge', 1, 2, 2], ['perle', 1, 1, 0.4]] },
  v2_charrettes: { rolls: [2, 3], items: [['vieille_piece', 1, 3, 4], ['v2_sceau_marchand', 1, 1, 0.8], ['corde', 1, 2, 2], ['toile', 1, 3, 2], ['tesson', 1, 2, 2], ['argent', 15, 50, 3]] },
  v2_offrandes: { rolls: [3, 4], items: [['vieille_piece', 2, 4, 4], ['bijou', 1, 1, 2], ['relique', 1, 1, 1], ['argent', 30, 90, 3], ['bougie', 1, 3, 2]] },
  v2_tanniere: { rolls: [2, 3], items: [['os', 1, 3, 3], ['vieille_piece', 1, 2, 2], ['lingot_fer', 1, 1, 1], ['cuir', 1, 2, 2], ['argent', 10, 40, 2]] },
  v2_cache_cerf: { rolls: [2, 3], items: [['fleche', 4, 8, 3], ['fleche_fer', 2, 4, 1], ['cuir', 1, 2, 2], ['corde', 1, 2, 2], ['bois_de_cerf', 1, 1, 1], ['argent', 20, 60, 2], ['boussole', 1, 1, 0.3]] },
});

// ---------------------------------------------------------------- les mots (peu ; la plupart des choses se voient)
const V2_TEXTES = {
  // les pensées (rares)
  garouVu: '(Des loups. Debout.)',
  pendusTombe: '(La corde a cédé derrière vous.)',
  ecoutantVu: '(Il ne vous regarde pas. Il n’a pas d’yeux. Il écoute.)',
  gargouilleCri: '(La pierre a crié.)',
  strygeVol: '(Quelque chose a pris dans votre poche, en passant.)',
  basilicPierre: '(Vos mains sont froides. Lourdes. Ne le regardez pas.)',
  basilicMiroir: '(Il s’est vu.)',
  tarasqueReveil: '(Le sol a bougé. Ce n’était pas le sol.)',
  chimereTete: '(Une des trois têtes dort. Les deux autres, non.)',
  vouivreGemme: '(La pierre est chaude dans votre main. Derrière vous, l’eau s’est tue.)',
  vouivreCherche: '(Elle cherche. Elle ne voit plus rien. Elle entend tout.)',
  vouivreRendue: '(Elle a repris sa pierre. Elle vous a regardé longtemps, puis elle a fermé les yeux.)',
  noyesVoix: '(Quelqu’un vous appelle, depuis l’eau.)',
  noyeSaisi: '(Des mains, sous l’eau, autour de vos chevilles.)',
  korriganRonde: '(Des petites voix. Une ronde, là-bas, autour de la grande pierre.)',
  cerfAttend: '(Il s’est arrêté. Il vous attend.)',
  chienGrogne: '(Le chien gris gronde, tout bas, le nez tendu.)',
  chienAdieu: '(Le chien gris s’assied au pied des marches. Il ne vient pas plus loin.)',
  feuRefuge: '(Elle s’arrête à la lisière de la lumière du feu.)',
  sansVisage: '(Ils n’ont pas de visage. Ils bêlent quand même.)',
  // les causes de mort particulières
  basilicMort: 'Changé en pierre par le regard du basilic',
  vouivreMort: 'Tué par la Vouivre, au bord de l’Étang',
  noyeMort: 'Noyé dans l’Étang des Noyés, entre des mains froides',
  feuChimere: 'Brûlé par la Chimère',
};

// ce qu'on finit par comprendre (le carnet : « Derrière la Porte ») — 0 : vue ; 1 : on lui a échappé (ou on a compris son
// heure) ; 2 : on l'a tuée, ou on a fait ce qu'il fallait. Phrases du personnage, courtes.
const V2_CARNET = {
  v2_garou: ['Des loups qui marchent debout, dans le Bois Mort. Ils vont par trois.', 'Le jour, ils dorment en tas, près des charrettes renversées. La nuit, ils chassent. Ils ne s’approchent pas des feux.', 'Sous la peau, il y avait des coutures. Et des boutons de gilet.'],
  v2_charognard: ['Des bêtes nues, grises, qui suivent à distance. Elles ont des dents d’homme.', 'Elles ne mordent que ce qui saigne, ou ce qui leur tourne le dos. Face à elles, elles reculent.', 'Elles mangent ce que les autres laissent.'],
  v2_pendu: ['Des pendus aux arbres morts, la tête dans un sac. Ils se balancent sans vent.', 'Ils tombent sur qui passe dessous, debout. Accroupi, ils ne sentent rien. Ils sont lents.', 'On leur a laissé au cou ce qu’ils avaient volé.'],
  v2_ecoutant: ['Une chose très maigre, sans yeux, dans les ruines de la Ville Basse. La nuit seulement.', 'Elle entend tout : un pas, un caillou. Elle ne voit rien. Immobile, on n’existe pas.', 'Elle avait des oreilles comme des mains ouvertes.'],
  v2_gargouille: ['Des bêtes de pierre sur les murs. Elles tournent la tête, lentement.', 'Elles voient loin, mais elles n’entendent rien. Quand elles crient, tout vient.', 'Le fer de la pioche les fend. Les flèches ricochent.'],
  v2_stryge: ['Des oiseaux de nuit avec des visages de femmes, au-dessus des falaises.', 'Elles fondent sur ce qui marche à découvert. Sous un toit, sous les herbes, elles ne voient plus.', 'Elles gardent ce qui brille dans leurs nids.'],
  v2_basilic: ['Un serpent à tête de coq, dans les Cendrières, au milieu de gens de pierre.', 'Il ne faut pas le regarder. La nuit, il dort.', 'Il s’est vu dans le miroir, et il est devenu ce qu’il faisait des autres.'],
  v2_tarasque: ['Une bête énorme, sous une carapace d’épines, qui dort sur des offrandes.', 'Elle n’entend pas les pas lents. Elle entend courir, sauter, les pierres qui tombent. À midi, elle se lève.', 'On lui avait noué un ruban bleu autour du cou. Il a tenu plus longtemps que ceux qui l’avaient noué.'],
  v2_chimere: ['Une bête à trois têtes, dans l’Antre, au fond des Ravines : un lion, un bouc, un serpent.', 'Une tête dort toujours, les deux autres veillent, chacune de son côté.', 'Elle portait un collier de fer aux armes d’un château.'],
  v2_vouivre: ['Un serpent ailé au-dessus de l’Étang, la nuit, avec une braise au front.', 'À l’aube, elle se baigne. Elle pose sa pierre sur la grande pierre plate, et sans elle elle ne voit rien.', 'Elle a repris sa pierre, ou elle est morte : de toute façon, l’Étang se tait.'],
  v2_noye: ['La nuit, une voix appelle depuis l’Étang. Elle connaît mon nom.', 'Ne pas répondre. Ne pas entrer dans l’eau. Au matin, l’Étang rend quelque chose.', 'Ils tiennent ce qu’ils attrapent.'],
  v2_korrigan: ['Des petits hommes qui dansent la nuit autour de la grande pierre des Tertres, en chantant les jours.', 'Ils chantent les jours de la semaine, et ils s’arrêtent avant le dernier.', 'La semaine tourne ; elle ne finit pas.'],
  v2_cerf: ['Un cerf pâle dans le Bois Mort. Ses bois finissent en mains.', 'Il ne fuit pas qui vient doucement, accroupi. Il marche devant, et il attend.', 'Il m’a mené à un arbre creux. Quelqu’un y avait laissé ses affaires, comme pour lui.'],
  v2_chien: ['Un grand chien gris, au Seuil. Il garde ses distances.', 'Il a mangé. Il me suit, et il gronde tout bas quand quelque chose approche.', 'Il ne passe pas la Porte.'],
  v2_sans_visage: ['Des moutons sans visage, sur les paliers des Degrés.', 'Effrayés, ils s’égaillent en bêlant, et tout ce qui est autour l’entend. Accroupi au milieu d’eux, on n’est qu’un mouton de plus.', 'Leur laine n’a pas d’odeur.'],
};
const V2_CARNET_TITRE = 'Derrière la Porte';

// ce qu'on en dit dans la vallée (rarement, de biais)
const V2_RUMEURS = {
  chasseur: ['Derrière la Porte, il y a des loups qui ne marchent pas comme des loups. Mon père le disait. Il disait aussi que les marchands d’avant y sont restés.'],
  guerisseuse: ['Il y a des pierres qu’on ne regarde pas en face. Les vieux le disaient d’une bête, autrefois. On posait un miroir au fond des puits.'],
  aubergiste: ['Un colporteur m’a juré qu’au-delà de la Porte, des petits hommes dansent en chantant les jours. Il avait bu. Il savait quand même les jours.'],
};

// les inscriptions des repaires (on les lit avec E) : [clé, titre, texte]
const V2_INSCRIPTIONS = {
  charrettes: ['Un registre de route, dans une caisse crevée', 'Douze barriques. Six ballots de drap. Le sel. Les ânes sont fatigués : on campera au bois.\nLa nuit, on entend des chiens. Pierre dit que ce ne sont pas des chiens.\nPierre a la fièvre. Il ne veut plus qu’on le touche.'],
  pendants: ['Une planche, pendue au cou d’un des pendus', 'VOLEUR'],
  jardin: ['Une pierre gravée, à l’entrée du jardin', 'ICI ON A FAIT ÉCLORE L’ŒUF.\nQUE CEUX QUI ENTRENT FERMENT LES YEUX.'],
  bauge: ['Une stèle renversée, contre les offrandes', 'À LA BÊTE DOUCE, QUI DORT POUR NOUS.\nNE COURS PAS ICI.'],
  antre: ['Des lettres, sur une plaque scellée dans la roche', 'MÉNAGERIE DE MONSEIGNEUR.\nNE PAS NOURRIR APRÈS LE COUCHER.'],
  bains: ['Une pierre, au bord de l’eau, usée par les genoux', 'ELLE SE BAIGNE QUAND LE CIEL BLANCHIT.\nCE QU’ELLE POSE, ELLE LE REPREND.'],
  guetteurs: ['Le socle d’une gargouille', 'TAILLÉE PAR LES MAÇONS DE LA VILLE BASSE, L’AN DE LA CENDRE.\nELLE VOIT. ELLE N’ENTEND PAS.'],
  ronde: ['Une pierre couchée, au milieu de la ronde', 'PRIMEDI, FERDI, MARCHEDI…\nON NE CHANTE PAS LE JOUR DES MORTS.'],
};
