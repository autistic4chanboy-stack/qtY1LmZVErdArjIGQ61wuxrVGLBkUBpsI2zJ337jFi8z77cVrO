// ============================================================================
//  LES QUÊTES PRINCIPALES À LIEUX PRÉCIS (agent T, treizième vague) : les
//  données et les textes. Cinq histoires facultatives, chacune PROPOSÉE (une
//  personne, une lettre, un avis, un objet trouvé), en quatre ou cinq étapes ;
//  à chaque étape, un lieu nommé de la vallée — les mêmes dans toutes les
//  parties —, montré par une courte scène, tantôt dehors, tantôt dedans.
//  Le jeu : 11-zzzzT-1-quetes.js ; les scènes : 11-zzzzT-2-scenes.js ; le
//  carnet : 12-zzzzzT-quetes.js. État : farm.s.quetes. API : quetes.
// ============================================================================

// ---------------------------------------------------------------- les objets (de quête : ils ne se vendent pas)
defItem('t_plaque_roulier', 'Plaque de roulier', 'quete', 0, ['t_plaque', '#a8aab0'], { desc: 'Une plaque de fer-blanc, de celles qu’on cloue aux ridelles. Frappé dedans : « J.-B. MAURY · ROULIER · TULLE ». De la vase sèche dans les lettres.' });
defItem('t_lettre_leonie', 'Lettre de Léonie', 'quete', 0, ['lettre', '#e2d6b8'], { desc: 'Une lettre jaunie, jamais remise, adressée à la chambre sept de l’auberge. Clic : la relire.' });
defItem('t_longue_vue', 'Longue-vue d’Aristide', 'quete', 0, ['t_longue_vue', '#8a6a3a'], { desc: 'La longue-vue de laiton du gardien du phare, gainée de cuir. En main, clic droit : regarder au loin (on la baisse en bougeant).' });
defItem('t_crecelle', 'Crécelle de rabatteur', 'quete', 0, ['t_crecelle', '#8a8274'], { desc: 'Une crécelle de bois gris, fendue par les hivers. Sur le manche, gravé au couteau : « BASTIEN ».' });
defItem('t_registre_menard', 'Registre du docteur Ménard', 'quete', 0, ['livre', '#4a5a4a'], { desc: 'Un registre de toile verte, gonflé d’humidité, tenu aux Sources de 1859 à 1871. Clic : le relire.' });

// les icônes de ces objets (formes « t_… »)
{
  const _ip = iconPaint;
  iconPaint = function (shape, c1, c2) {
    if (typeof shape !== 'string' || !shape.startsWith('t_')) return _ip(shape, c1, c2);
    const pb = new PixelBuf(16, 16), P = rampOf(c1 || '#aaaaaa');
    const L = (x0, y0, x1, y1, c, w) => drawLine(pb, x0, y0, x1, y1, typeof c === 'string' ? hexc(c) : c, w || 1);
    const px = (x, y, c) => pb.set(Math.round(x), Math.round(y), typeof c === 'string' ? hexc(c) : c);
    switch (shape) {
      case 't_plaque': // une plaque rectangulaire, deux clous, des lettres frappées
        for (let y = 5; y <= 11; y++) for (let x = 2; x <= 13; x++) px(x, y, y === 5 || x === 2 ? P[3] : y === 11 || x === 13 ? P[0] : P[2]);
        px(3, 6, [60, 56, 52]); px(12, 10, [60, 56, 52]);
        for (const x of [5, 7, 9, 11]) { px(x, 8, P[0]); px(x, 9, P[0]); }
        for (const x of [6, 10]) px(x, 8, P[0]);
        break;
      case 't_longue_vue': // un tube de laiton en trois tirages, gainé de cuir au milieu
        L(2, 12, 6, 9, '#c8a050', 3); L(6, 9, 10, 6, '#6a4a2a', 3); L(10, 6, 14, 3, '#d8b860', 2);
        px(2, 13, [90, 70, 40]); px(1, 12, [90, 70, 40]); px(14, 2, [240, 230, 200]);
        break;
      case 't_crecelle': // le manche, la roue dentée, le cadre et sa lame
        L(4, 15, 7, 9, P[1], 2);
        for (let a = 0; a < 8; a++) { const t = a / 8 * TAU; px(8 + Math.cos(t) * 2.4, 7 + Math.sin(t) * 2.4, P[3]); }
        px(8, 7, P[0]);
        L(6, 4, 13, 4, P[2], 2); L(13, 4, 13, 10, P[2], 2); L(6, 4, 6, 6, P[2]);
        L(9, 5, 12, 9, [200, 190, 170]);
        break;
      default: return _ip('objet', c1, c2);
    }
    return pb;
  };
}

// ---------------------------------------------------------------- les quêtes
// qui : comment elle est proposée ('pnj' : un habitant, en parlant ; 'lettre' ; 'avis' : le panneau de la place ;
//   'objet' : une chose trouvée) ; pnj : l'habitant qui la propose (sa mort la perd, comme les quêtes des habitants) ;
// des : le jour à partir duquel elle peut être proposée ;
// etapes : nom (le lieu, tel qu'on le nomme au carnet), dedans (true : la scène est à l'intérieur), heure (la lumière de
//   la scène), plans (ce qu'on lit pendant la scène : l'allure du lieu, puis l'endroit précis), carnet (une phrase
//   vague, au carnet), trouve (ce qu'on y trouve : une pensée, ou { titre, texte, signe } qu'on lit), quand (une heure
//   pour le faire : 'nuit' de 21 h à 5 h, 'aube' de 3 h à 6 h 30) ; fin : le dernier choix.
const QT_QUETES = {
  // ============================================================== 1. La chambre sept (l'aubergiste)
  t1: {
    titre: 'La chambre sept', qui: 'pnj', pnj: 'aubergiste', des: 2, quiNom: 'l’aubergiste',
    propose: {
      label: 'Vous avez l’air soucieux.',
      texte: 'La sept. Je ne la loue pas. Ma mère ne la louait pas, et sa mère avant elle, je crois. Chaque matin, le lit est défait et les draps sont tièdes. Le bol est vide. Les souliers, au pied du lit, sont crottés de frais. Personne n’y dort. Personne. Ma mère disait de ne pas y toucher ; ma mère est morte à la Toussaint. Je voudrais savoir à qui elle est, cette chambre. Après, je la louerai, ou je la murerai.',
      oui: 'Je vais voir ça.', plusTard: 'Pas maintenant.', non: 'Ce n’est pas mon affaire.',
      repOui: 'Merci. La porte n’est jamais fermée. Montez quand vous voudrez ; de jour, si j’étais vous.',
      repPlusTard: 'Comme vous voudrez. La sept ne bouge pas.',
      repNon: 'Bien. N’en parlons plus.',
      rappel: 'La sept… vous y avez repensé ?',
      resume: 'L’aubergiste voudrait savoir qui dort, chaque nuit, dans la chambre sept qu’il ne loue pas.',
    },
    etapes: [
      { nom: 'La chambre sept, à l’étage de l’auberge du Coq Tordu', dedans: true, heure: 10.5,
        plans: ['Au bout du couloir de l’auberge, la dernière porte. Sur la plaque d’émail : sept.', 'Le lit défait, une chandelle qui brûle en plein jour. Au pied du lit, des souliers d’homme.'],
        carnet: 'Regarder de près ce que l’occupant a laissé au pied du lit.',
        trouve: '(Des souliers d’homme, ferrés, crottés d’une vase grise où brillent de petites coquilles. La vase est encore humide.)' },
      { nom: 'Le pont des Saules, sur la rivière', dedans: false, heure: 6.7,
        plans: ['Le pont des Saules, au petit jour. La rivière passe dessous sans un bruit.', 'Sur la berge, côté ville, la vase grise est marquée.'],
        carnet: 'Chercher au bord de l’eau, au pied du pont, du côté de la ville.',
        trouve: '(Des pas d’homme, ferrés, qui sortent de l’eau et montent vers la route. Aucun n’y redescend. Dans la vase, une plaque de fer-blanc.)' },
      { nom: 'L’étage de la poste, le casier des lettres en souffrance', dedans: true, heure: 11,
        plans: ['Sous le toit de la poste, ce qui n’a jamais été remis attend dans un casier de bois.', 'Une enveloppe dépasse d’une case. Elle est là depuis longtemps.'],
        carnet: 'Ce qui n’a pas été remis attend toujours quelque part.',
        trouve: { titre: 'Lettre en souffrance', signe: 'Au dos, d’une main de postière : « Arrivée trop tard. Le destinataire n’est pas reparti. »',
          texte: '« À Monsieur Maury, roulier, à l’auberge du Coq Tordu, Valbrume. Chambre sept. »\n\nJean-Baptiste,\n\nla petite a eu la fièvre et elle en est sortie. Elle t’appelle le soir, elle croit que tu es au grenier. Ne passe pas par le gué des Saules, même si la rivière est basse, même si c’est plus court. Le père Fombeur dit que l’eau de ce pays-là ne rend pas ce qu’elle prend. Reviens par le pont. Nous t’attendons pour la Saint-Joseph.\n\nTa femme, Léonie.\nTulle, le 2 février 1861.' } },
      { nom: 'Le cimetière, contre le mur', dedans: false, heure: 17.85,
        plans: ['Le cimetière, à l’heure où les ifs deviennent noirs.', 'Contre le mur, une petite croix de bois, sans tombe dessous.'],
        carnet: 'Quelqu’un s’est souvenu de lui, autrefois. Il en reste une marque.',
        trouve: '(Gravé au couteau dans le bois : « J.-B. MAURY, ROULIER. LA RIVIÈRE L’A GARDÉ. 1861. » À ses pieds, un bol retourné.)' },
      { nom: 'La chambre sept, la nuit', dedans: true, heure: 23.3, quand: 'nuit',
        plans: ['La sept, la nuit. La chandelle brûle. Le bol attend.', 'Les draps sont froids. Il n’est pas encore rentré.'],
        carnet: 'Revenir à la sept, la nuit, avec ce qu’on a trouvé.' },
    ],
    fin: {
      titre: 'La chambre sept', desc: 'Les draps sont froids. Dans l’escalier, une marche craque, puis plus rien. Le bol attend sur la table.',
      choix: [
        { k: 'a', label: 'Poser la lettre de Léonie sur l’oreiller',
          texte: 'Vous posez la lettre sur l’oreiller, et la plaque de fer-blanc à côté. Vous éteignez la chandelle. Au matin, le lit est fait au carré. Les souliers sont propres. La lettre n’est plus là.',
          apres: 'L’aubergiste vous attendait au pied de l’escalier. Il ne pose aucune question. « La sept est à vous, quand vous voudrez. Pour rien. » Il vous glisse une bourse.',
          carnet: 'Jean-Baptiste Maury, roulier, a eu sa lettre. La sept est froide, à présent ; l’aubergiste vous la laisse pour rien.' },
        { k: 'b', label: 'Lui laisser sa chambre',
          texte: 'Vous remettez le bol à l’endroit, et vous redescendez sans bruit. Vous gardez la lettre. Cette nuit-là, de la salle, on entend une cuillère tourner dans un bol, longtemps.',
          apres: 'L’aubergiste a compris avant que vous parliez. « Alors on la lui laisse. Il a payé d’avance, ma mère disait toujours. » Il vous paie votre peine.',
          carnet: 'Jean-Baptiste Maury, roulier, dort toujours dans la sept. Personne ne la louera.' },
      ],
    },
  },

  // ============================================================== 2. Le feu du lac (une lettre de Marie Lemarié)
  t2: {
    titre: 'Le feu du lac', qui: 'lettre', des: 4, quiNom: 'une lettre de Marie Lemarié',
    propose: {
      de: 'Marie Lemarié, veuve', titreLettre: 'De Saint-Flour',
      texte: 'Madame, Monsieur,\n\nOn me dit que la vieille ferme a de nouveau quelqu’un, et qu’on voit toujours, chaque nuit, le feu du phare sur le lac.\n\nMon mari, Aristide Lemarié, gardait ce feu. Une nuit de novembre, il est descendu voir la barque, et il n’est pas remonté. Je suis partie le lendemain. Je n’ai pas monté l’escalier : il m’avait écrit de ne pas monter.\n\nDepuis dix-neuf ans, personne n’a porté d’huile là-haut. L’Inspection a rayé le feu de ses listes. Il brûle quand même.\n\nJe suis vieille, et je ne ferai plus le voyage. Je voudrais seulement savoir qui l’allume.\n\nMarie Lemarié, veuve,\nchez sa sœur, à Saint-Flour.',
      oui: 'Aller voir le phare', plusTard: 'Plus tard', non: 'Ne pas répondre',
      resume: 'La veuve du gardien du phare voudrait savoir qui allume encore le feu, chaque nuit, depuis dix-neuf ans.',
    },
    etapes: [
      { nom: 'La grève, au pied du phare', dedans: false, heure: 17.75,
        plans: ['Le phare, à la tombée du jour. Là-haut, le feu est déjà allumé.', 'Sur la grève, une barque retournée, le ventre au ciel.'],
        carnet: 'Commencer par où il est descendu, cette nuit-là.',
        trouve: '(Peint sur le bordé, presque effacé : MARIE. La chaîne est rouillée dans l’anneau. Dessous, les avirons sont rangés, comme pour repartir.)' },
      { nom: 'Le bureau du gardien, au troisième étage du phare', dedans: true, heure: 10,
        plans: ['À mi-hauteur de la tour, le bureau du gardien. Le registre est ouvert sur le secrétaire.', 'Le registre du feu. Quelqu’un y écrit encore.'],
        carnet: 'Lire ce que le gardien écrivait chaque soir.',
        feuillet: '\n\nGlissé entre deux pages, un feuillet d’une autre écriture, plus serrée : « 6 novembre. Le passeur l’a vu lui aussi, debout dans l’eau jusqu’aux genoux, au bout du quai des Planches. Il ne bouge pas. Il regarde la lumière. Je n’ai rien dit à Marie. — A. L. »' },
      { nom: 'Le bout du quai des Planches', dedans: false, heure: 2.4,
        plans: ['Les Planches, la nuit. Au bout du quai, l’eau noire, et au loin le feu du phare.', 'Au bord des planches, une paire de bottes, posées côte à côte, la pointe vers le lac.'],
        carnet: 'Aller voir là où on l’a vu attendre.',
        trouve: '(Des bottes de gardien, en cuir graissé. Elles sont mouillées jusqu’au genou, et pleines d’une eau très froide. Au loin, le feu du phare brûle sans trembler.)' },
      { nom: 'La chambre de la lanterne, en haut du phare', dedans: true, heure: 23.6, quand: 'nuit',
        plans: ['En haut du phare, la nuit. La flamme ne tremble pas.', 'Personne. Le réservoir est plein jusqu’au bord.'],
        carnet: 'Monter là-haut, la nuit, quand il brûle.' },
    ],
    fin: {
      titre: 'Le feu du lac', desc: 'La flamme brûle droit, sans fumée. En bas, sur l’eau, rien ne bouge. Ou si : au bout des Planches, quelque chose qui regarde par ici.',
      choix: [
        { k: 'a', label: 'Éteindre le feu',
          texte: 'Vous soufflez la flamme. La nuit entre dans la lanterne. Au bout des Planches, quelque chose qui attendait se détourne et s’enfonce dans l’eau, sans un bruit.',
          lettre: { de: 'Marie Lemarié, veuve', titre: 'De Saint-Flour, encore', texte: 'Madame, Monsieur,\n\nOn m’écrit que le feu du lac s’est éteint. Cette nuit, pour la première fois depuis dix-neuf ans, j’ai dormi d’un trait.\n\nJe vous envoie sa longue-vue. Il disait qu’avec elle, on voyait venir le temps de l’autre bout du lac. Il n’a pas vu venir le reste.\n\nMarie.' },
          carnet: 'Le feu du lac est éteint. Ce qui attendait au bout des Planches est rentré dans l’eau. Marie Lemarié dort.' },
        { k: 'b', label: 'Remplir la lampe, et redescendre',
          texte: 'Vous remplissez le réservoir jusqu’au bord. En redescendant, dans le bureau, vous écrivez au registre, sous la dernière ligne : « Allumé. »',
          lettre: { de: 'Marie Lemarié, veuve', titre: 'De Saint-Flour, encore', texte: 'Madame, Monsieur,\n\nAlors laissez-le brûler. Il faut que quelqu’un l’attende, et moi je n’ai plus la force.\n\nJe vous envoie ce qui me restait de ses gages. Il aurait voulu qu’on paie l’huile.\n\nMarie.' },
          carnet: 'Le feu du lac brûle toujours. Au registre, sous les « Allumé » du gardien, il y a maintenant le vôtre.' },
      ],
    },
  },

  // ============================================================== 3. Les toiles d'Ardoin (un avis, sur la place)
  t3: {
    titre: 'Les toiles d’Ardoin', qui: 'avis', des: 3, quiNom: 'un avis de la mairie',
    propose: {
      texte: 'AVIS DE LA MAIRIE — Le peintre Félix Ardoin, de Lyon, a séjourné dans la commune l’été 1878, et l’a quittée sans ses toiles. L’une d’elles est au grenier de la mairie, sous un drap. Sa sœur, Mlle Ardoin, offre une récompense à qui retrouvera les deux autres, ou saura dire ce qu’il a peint.',
      oui: 'S’en occuper', plusTard: 'Plus tard', non: 'Laisser l’avis',
      resume: 'La sœur d’un peintre parti en 1878 voudrait qu’on retrouve ses trois toiles, et ce qu’il a peint.',
    },
    etapes: [
      { nom: 'Le grenier de la mairie, parmi les meubles des successions', dedans: true, heure: 11,
        plans: ['Le grenier de la mairie : les meubles de ceux qui n’ont pas laissé d’héritiers, sous leurs draps.', 'Contre le mur du fond, un tableau sous un drap.'],
        carnet: 'La première toile est au grenier de la mairie.',
        trouve: { titre: 'Le lavoir, au petit matin', signe: 'Au dos, au crayon : « I. Je ne l’ai pas peinte. Elle était là quand j’ai relevé la tête. »',
          texte: 'Sous le drap, une toile sans cadre, signée en bas : F. Ardoin, août 1878.\n\nLe lavoir de Valbrume, l’eau grise, le toit de tuiles, la brume qui monte. Agenouillée à la pierre, une jeune fille en coiffe blanche, de dos. Elle ne lave rien.' } },
      { nom: 'Le lavoir, au petit matin', dedans: false, heure: 6.6,
        plans: ['Le lavoir, à l’heure de la toile. L’eau grise, le toit, la brume.', 'Personne à la pierre. À quelques pas, un chevalet de peintre, face au lavoir.'],
        carnet: 'Se tenir là où il se tenait pour la peindre.',
        trouve: '(Un chevalet de peintre, debout dans l’herbe, face au lavoir. Pas de toile dessus. Le bois n’a pas grisé. À son pied, un tube de couleur écrasé : du blanc d’argent. Il est encore souple.)' },
      { nom: 'Les combles de la grande bibliothèque', dedans: true, heure: 14,
        plans: ['Sous le toit de la grande bibliothèque, ce qu’on n’ose pas jeter.', 'Un tableau sous un drap, tourné vers le mur.'],
        carnet: 'La deuxième toile a payé des livres.',
        trouve: { titre: 'L’abbaye, au couchant', signe: 'Au dos : « II. Je l’ai vue de mes yeux, cette fois. Elle m’a fait signe de continuer. » Une étiquette : « Don de M. Ardoin, pour solde de ses emprunts. »',
          texte: 'Sous le drap, une toile : les ruines de Montrevel au soleil couchant, le ciel rouge dans les fenêtres vides. Dans l’encadrement d’une fenêtre, une jeune fille en coiffe blanche. Elle regarde le peintre.' } },
      { nom: 'L’abbaye de Montrevel, au couchant', dedans: false, heure: 17.6,
        plans: ['Montrevel, au couchant. Le ciel rouge passe dans les fenêtres vides.', 'Au pied du mur, une pierre a été déplacée.'],
        carnet: 'Aller voir la ruine à l’heure où il l’a peinte.',
        trouve: '(Sous la pierre, un carnet de croquis gonflé d’humidité. Des pages entières de la même coiffe blanche, de dos, de profil, de plus en plus près. Sur la dernière page, un visage, et il est vide.)' },
      { nom: 'La nef de l’église de Valbrume', dedans: true, heure: 16,
        plans: ['L’église, l’après-midi. La lumière tombe de biais sur les bancs.', 'Contre le mur, près de la porte, une toile retournée.'],
        carnet: 'La troisième toile est restée dans la commune.' },
    ],
    fin: {
      titre: 'La troisième toile', desc: 'Une toile tournée contre le mur. Au dos : « III. Elle m’a demandé de la finir. Je ne peux pas. Je pars ce soir. — F. A., octobre 1878. »',
      lecture: { titre: 'La nef', texte: 'Vous la retournez. La nef de cette église, les bancs, la lumière de biais. Au dernier rang, la jeune fille en coiffe blanche, assise, de face, les mains sur les genoux.\n\nElle n’a pas de visage. La toile est nue à cet endroit, d’un blanc sale, comme si le peintre n’avait pas osé.' },
      choix: [
        { k: 'a', label: 'Faire envoyer les toiles à sa sœur',
          texte: 'Le maire fait mettre les trois toiles en caisse pour Lyon, avec un mot de votre main.',
          lettre: { de: 'Mlle Ardoin', titre: 'De Lyon', texte: 'Madame, Monsieur,\n\nJ’ai reçu les toiles. Je vous dois la vérité, puisque vous me les avez rendues : Félix n’est jamais revenu à Lyon. Pendant dix ans, il m’a écrit à chaque Noël, de plus en plus court, sans jamais dire d’où.\n\nLa dernière lettre ne disait que ceci : « Je l’ai finie. »\n\nJ’ai ouvert la caisse ce matin. La troisième toile a un visage.\n\nJe joins la récompense promise. Ne m’écrivez pas.' },
          carnet: 'Les trois toiles sont parties pour Lyon. Mlle Ardoin dit que la troisième a un visage, maintenant.' },
        { k: 'b', label: 'La laisser là, tournée contre le mur',
          texte: 'Vous la retournez contre le mur, comme elle était. En sortant, vous ne regardez pas le dernier rang.',
          apres: 'Le curé vous a vu faire. Il ne dit rien ; il vous met quelques pièces dans la main, « pour le tronc des pauvres, ou pour vous ». Le dimanche suivant, personne ne s’assoit plus au dernier rang.',
          carnet: 'La troisième toile est toujours là, tournée contre le mur. On ne s’assoit plus au dernier rang.' },
      ],
    },
  },

  // ============================================================== 4. La crécelle (un objet trouvé, devant le relais de chasse)
  t4: {
    titre: 'La crécelle', qui: 'objet', des: 3, quiNom: 'une crécelle trouvée devant le relais de chasse',
    propose: {
      titre: 'Une crécelle de rabatteur',
      texte: 'Une crécelle de bois, comme en portent les rabatteurs les jours de battue : une roue dentée, une lame qui claque. Le bois est gris, fendu par les hivers. Sur le manche, gravé au couteau : « BASTIEN ».\n\nElle est posée là comme si on venait de la poser.',
      oui: 'Chercher à qui elle était', plusTard: 'Plus tard', non: 'La laisser où elle est',
      resume: 'Une crécelle de rabatteur, posée devant le relais de chasse, au nom de Bastien.',
    },
    etapes: [
      { nom: 'La salle du relais de chasse', dedans: true, heure: 11,
        plans: ['Le relais de chasse : des bois de cerf au mur, l’odeur du feu froid et de la poudre.', 'Sur la table, un registre relié de toile, ouvert sur une page ancienne.'],
        carnet: 'Les battues ont leur registre.',
        trouve: { titre: 'Le livre des battues', signe: 'Le huit est écrit par-dessus un neuf, d’une encre plus noire. Les pages suivantes sont vides jusqu’à l’automne d’après.',
          texte: 'Battue du 12 novembre 1851. Maître de battue : J. Brossard. Onze fusils, neuf rabatteurs. Rendez-vous à la cascade, à la pointe du jour.\n\nGibier : deux chevreuils, un renard.\n\nRentrés : huit rabatteurs.' } },
      { nom: 'La cascade de la source, au pied de la paroi', dedans: false, heure: 7.2,
        plans: ['La cascade, à la pointe du jour, là où les rabatteurs se mettaient en ligne.', 'Au pied de la paroi, sous la chute, une pierre plate.'],
        carnet: 'Aller où l’on se donnait rendez-vous, à la pointe du jour.',
        trouve: '(Neuf traits gravés au couteau dans la pierre, côte à côte. Le dernier est barré, d’un trait plus profond que les autres.)' },
      { nom: 'La hutte de la guérisseuse', dedans: true, heure: 15,
        plans: ['La hutte de la guérisseuse, au cœur de la vieille forêt. Des bocaux partout, avec des noms dessus.', 'Sur l’étagère, un petit bocal, tout au fond, derrière les autres.'],
        carnet: 'Ce soir-là, on a porté quelqu’un chez la guérisseuse.',
        trouve: { titre: 'Un petit bocal', signe: 'Une écriture fine, à l’encre brune.',
          texte: 'Un bocal fermé à la cire. Dedans, trois grains de plomb noircis.\n\nSur l’étiquette : « Retirés du petit Bastien Roux, nuit du 12 novembre 1851. Il n’a pas passé la nuit. Le père Brossard l’a porté lui-même. »' },
        dit: 'On garde ce qu’on retire. Chez moi, c’est comme ça.' },
      { nom: 'Les tombes de la chapelle abandonnée', dedans: false, heure: 17.4,
        plans: ['La chapelle abandonnée, au soir. Autour, des tombes que personne ne fleurit.', 'Un tertre bas, sans croix. Un bâton planté, à la place.'],
        carnet: 'On ne l’a pas enterré au cimetière.' },
    ],
    fin: {
      titre: 'Le tertre', desc: 'Un bâton de noisetier, planté en terre, poli par les mains. Dessous, un petit tertre que les ronces n’ont jamais pris. Quelqu’un vient l’entretenir.',
      choix: [
        { k: 'a', label: 'Porter la crécelle au chasseur, et tout lui dire', pnj: 'chasseur',
          texte: 'Le soir même, au relais, le chasseur tourne longtemps la crécelle dans ses mains. « Mon père ne chassait plus, après. Il venait là-bas le dimanche, avec une serpe, pour les ronces. Je croyais qu’il allait prier. »',
          apres: 'Il vous paie, sans que vous ayez rien demandé, et vous apprend à tailler un appeau dans un os, comme son père le lui avait appris.',
          carnet: 'Le chasseur sait, pour la battue de 1851. Il va le dimanche à la chapelle, avec une serpe.' },
        { k: 'b', label: 'Planter la crécelle sur le tertre, et se taire',
          texte: 'Vous plantez la crécelle à côté du bâton. Le vent la fait tourner d’un cran, une seule fois. On ne l’entendra plus, le soir, du côté du relais.',
          apres: 'Le lendemain matin, sur la souche devant le relais, un appeau taillé dans un os, que personne ne réclame.',
          carnet: 'Bastien Roux a sa crécelle. On ne l’entend plus, le soir, du côté du relais.' },
      ],
    },
  },

  // ============================================================== 5. La source froide (le docteur des Sources)
  t5: {
    titre: 'La source froide', qui: 'pnj', pnj: 'naturiste_b', des: 4, quiNom: 'le docteur des Sources',
    propose: {
      label: 'Vous avez l’air préoccupé, docteur.',
      texte: 'Sous mon lit, il y a une caisse qui était là avant moi : les papiers de mon prédécesseur, le docteur Ménard. Il soignait ici, dans les années soixante. On dit qu’il guérissait des gens que personne ne guérissait. On dit aussi qu’il est parti un matin, et qu’il n’est pas revenu. Je n’ai jamais ouvert la caisse. Je suis médecin : j’ai peur de ce qui guérit trop bien. Ouvrez-la pour moi, voulez-vous ? Et dites-moi où il les envoyait.',
      oui: 'Je vais l’ouvrir.', plusTard: 'Une autre fois.', non: 'Laissez-la fermée.',
      repOui: 'Merci. Elle est sous le lit, chez moi. Prenez-en soin : c’est tout ce qui reste de lui.',
      repPlusTard: 'Elle attendra. Elle a l’habitude.',
      repNon: 'Vous avez raison, sans doute. Laissons dormir.',
      rappel: 'La caisse du docteur Ménard… vous avez réfléchi ?',
      resume: 'Le docteur des Sources voudrait savoir où son prédécesseur envoyait ceux qu’il ne savait plus guérir.',
    },
    etapes: [
      { nom: 'La maison du docteur, aux Sources', dedans: true, heure: 10,
        plans: ['La maison du docteur, aux Sources : des bocaux, des fioles, l’odeur du soufre et de l’eau chaude.', 'Sous le lit, une caisse de bois, clouée.'],
        carnet: 'La caisse est sous le lit du docteur.',
        trouve: { titre: 'Le registre du docteur Ménard', signe: 'Les dernières pages sont blanches.', registre: true } },
      { nom: 'Le chêne millénaire', dedans: false, heure: 6.4,
        plans: ['Le grand chêne, avant que le soleil passe les collines.', 'Dans l’écorce, un clou, et un gobelet d’étain pendu au clou.'],
        carnet: 'Ménard y allait d’abord, avant l’aube.',
        trouve: '(Un gobelet d’étain, gravé d’un M. Il est plein de rosée. Sous le clou, au couteau : « Pour qui viendra boire. »)' },
      { nom: 'La maison du bas, à Clairpré', dedans: true, heure: 12,
        plans: ['La maison du bas, à Clairpré. On y logeait les malades du docteur, autrefois.', 'Dans le tiroir de la table, un papier plié.'],
        carnet: 'Une malade a logé là, en 1867.',
        trouve: { titre: 'Un papier plié', signe: 'Clémence',
          texte: 'Lundi. Je ne tousse plus. Le docteur dit que je pourrai rentrer à Lyon avant l’été.\n\nMardi. Maman est venue me chercher. Une dame en noir, très douce, qui pleurait. Le docteur m’a dit que c’était ma mère. Je l’ai crue, puisqu’il le disait.\n\nIl dit que c’est le prix. Je l’aurais payé deux fois.' } },
      { nom: 'La source aux rubans, avant l’aube', dedans: false, heure: 5.5, quand: 'aube',
        plans: ['La source aux rubans, avant l’aube. Les rubans pendent, lourds de brume.', 'L’eau est froide comme en hiver. Au fond, quelque chose brille.'],
        carnet: 'La source où l’on noue des rubans. Avant l’aube : après, elle est tiède.' },
    ],
    // le registre (on le lit à l'étape 1, et ensuite d'un clic, en main)
    registre: '1859. Repris la maison des bains. Soufre, fer, une chaleur qui ne vient pas du soleil. Les gens du pays disent que la montagne est chaude dedans.\n\n1866. La vieille des bois m’a mené, une nuit, sous le grand chêne, puis à une source où l’on noue des rubans. L’eau y est froide même en août. Elle m’a dit : « Elle rend ce qu’on lui demande. Elle garde ce qu’on oublie. » Elle dit que cette eau vient d’en dessous, de très loin, et qu’elle ne fait que passer.\n\n1867. Mlle Clémence D., dix-neuf ans, de Lyon, logée à Clairpré, dans la maison du bas : phtisie au dernier degré. Bu avant l’aube. Guérie en neuf jours. Ne reconnaît plus sa mère.\n\n1868 à 1870. Onze malades. Onze guérisons. Onze oublis, que je n’écris pas ici.\n\n1871. J’ai bu. Je ne sais plus pourquoi j’avais tant besoin de boire.',
    fin: {
      titre: 'La source froide', desc: 'L’eau est si froide qu’elle fait mal aux dents rien qu’à la regarder. Au fond, entre deux pierres, une montre de gousset, ouverte, arrêtée. Dans le couvercle : « Ménard ».',
      tiede: '(L’eau est tiède, à cette heure. Il faudrait revenir avant l’aube.)',
      choix: [
        { k: 'a', label: 'Rapporter le registre et la montre au docteur', pnj: 'naturiste_b',
          texte: 'Le docteur Bréhal lit le registre jusqu’au bout, une nuit entière. Au matin, il le range dans la caisse et cloue le couvercle. « Je n’enverrai personne là-bas. »',
          apres: '« Mais vous, si un jour vous saignez, allez-y à l’aube, les pieds dans l’eau, et ne demandez rien de plus. » Il vous paie, et vous laisse la montre : « Elle ne marchera plus pour lui. »',
          carnet: 'Le registre de Ménard est cloué dans sa caisse. À l’aube, les pieds dans l’eau de la source aux rubans, une plaie se ferme ; il ne faut rien demander de plus.' },
        { k: 'b', label: 'Boire',
          texte: 'Vous buvez dans le creux de la main. L’eau a un goût de pierre et de neige. Votre corps se tait d’un coup, entièrement, comme un champ après la grêle.',
          apres: 'Quand vous relevez la tête, il vous manque quelque chose. Vous ne savez pas quoi. Vous gardez la montre ; le docteur, lui, n’aura pas sa réponse.',
          carnet: 'Vous avez bu à la source froide. Il vous manque quelque chose, et vous ne savez pas quoi.' },
      ],
    },
  },
};
const QT_ORDRE = ['t1', 't2', 't3', 't4', 't5'];

// ---------------------------------------------------------------- le carnet
const QT_CARNET = {
  section: 'Quêtes principales',
  proposees: 'Proposées', enCours: 'En cours', abandonnees: 'Abandonnées', finies: 'Achevées', laissees: 'Laissées de côté',
  accepter: 'S’en occuper', jamais: 'Jamais', abandonner: 'Abandonner', reprendre: 'Reprendre', revoir: 'Revoir',
  lieu: 'Le lieu', nuit: 'La nuit.', aube: 'Avant l’aube.',
  vu: 'Vu là-bas', perdue: '† ne pourra plus se faire', refusee: 'Refusée.', abandonnee: 'Abandonnée.',
  confirme: 'Abandonner cette quête ? On pourra la reprendre où on l’a laissée.',
  rien: 'Rien pour l’instant.',
};
