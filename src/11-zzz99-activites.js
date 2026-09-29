// ============================================================================
//  ACTIVITÉS : des choses à faire dans la ville, le hameau et ailleurs.
//  Valbrume : les dés et le vingt-et-un de l'auberge (contre les habitués, avec
//  mises ; gare aux dés pipés), le bras de fer (forgeron, éleveuse, chasseur…),
//  la tournée payée à l'aubergiste, la veillée du Veilledi (contes au coin du
//  feu), le tableau des petits travaux de la mairie, le puits aux souhaits, la
//  diseuse de bonne aventure (qui lit l'almanach des événements), le crieur
//  public (nouvelles du jour), le violoneux des rues (l'écouter apaise), le
//  clocher (la vue), les cierges, les tombes qu'on fleurit, les étals
//  particuliers du Marchedi (brocanteur, curiosités, grainier des Monts,
//  fromagère). Clairpré : le jeu de quilles, le four banal, la tombola du
//  Foiredi. Ailleurs : le concours de tir du Chassedi au relais de chasse et
//  le concours de pêche du Pêchedi au ponton.
//  Chaque activité a sa limite du jour. État : farm.s.activites.
//  API : activites (S(), fait(k), jouerDes(n), jouerCartes(n), brasDeFer(n),
//        tournee(), veillee(), travaux(), voeu(), diseuse(), crieur(),
//        clocher(), cierge(), fleurir(it), etal(it), quilles(), four(),
//        tombola(), tir(), peche(), nouvelles())
// ============================================================================
defItem('pli_mairie', 'Pli de la mairie', 'quete', 0, ['lettre', '#e8dcc0'], { unique: true, desc: 'Une enveloppe fermée d’un cachet rouge, au nom de quelqu’un d’ici. La mairie paie la course à la livraison.' });

// ---------------------------------------------------------------- ce qu'on dit en jouant (oui, gagne = l'habitant gagne, perd = l'habitant perd, refus)
const ACT_JEU = {
  aubergiste: { oui: 'Une partie ? Juste une, hein. J’ai des clients. Enfin, j’aurai des clients.', gagne: 'Ha ! La maison gagne toujours. C’est écrit au-dessus de la porte. Enfin, ce le sera.', perd: 'Bon, bon. Prenez. Mais je vous le reprends en cidre, vous verrez.' },
  forgeron: { oui: '… Lance.', gagne: '… Hm.', perd: '… Bien joué.' },
  maire: { oui: 'Un maire ne joue pas d’argent. Un maire… mise. Pour la commune.', gagne: 'La commune vous remercie de votre contribution.', perd: 'Voilà qui grèvera le budget. N’en dites rien au conseil.' },
  garde: { oui: 'Pendant le service ? … Une seule. Et pas un mot au maire.', gagne: 'Ha ! Pour une fois que la chance est du côté de la loi !', perd: 'Je savais bien que je n’aurais pas dû. Le noir me porte malheur, et les dés aussi.' },
  postiere: { oui: 'Oh, volontiers ! Et pendant qu’on joue, vous me direz ce qu’on raconte chez vous.', gagne: 'Gagné ! Mon oncle dit que j’ai la main heureuse. Pour les dés, seulement.', perd: 'Perdu ! Bah. Je saurai bien d’où vous vient cette chance. Je sais toujours tout.' },
  boulangere: { oui: 'Une partie ? Doux Jésus, je ne devrais pas… Allez, une.', gagne: 'Ha ! Ça paiera la farine de la semaine !', perd: 'Tant pis ! Vous me l’achèterez en pain.' },
  grainetiere: { oui: 'Je joue. Mais je compte. Je compte toujours.', gagne: 'Voilà. La terre rend ce qu’on lui donne. Les dés aussi.', perd: 'Ça ira pour cette fois. Ne vous y habituez pas.' },
  eleveuse: { oui: 'Des dés ? Mon mari trichait. Moi, non. Lance.', gagne: 'Ha ! Comme à la foire aux bestiaux : faut savoir quand miser.', perd: 'Bien joué. Tu tiens le gobelet comme un maquignon.' },
  pecheur: { oui: 'Une partie. Pas plus. Le lac m’attend.', gagne: 'Tiens. Comme une carpe qui mord.', perd: 'C’est le jeu. Comme la pêche : on rentre bredouille, on revient.' },
  chasseur: { oui: 'Je ne perds pas souvent. Tu es prévenu.', gagne: 'Je te l’avais dit.', perd: '… Ça arrive. Rarement.' },
  colporteur: { oui: 'Ah ! Un joueur ! Je joue dans toutes les auberges de la vallée, mon ami. Toutes.', gagne: 'Ha ha ! La route m’a appris les dés, et les dés m’ont appris la route !', perd: 'Aïe ! Bon. Je me referai au marché.' },
  colporteuse: { oui: 'Pourquoi pas. Ma sœur tient une auberge : j’ai appris les dés avant de savoir lire.', gagne: 'Merci pour la route. Ça paiera le col.', perd: 'Bien lancé. Je retiens ça.' },
  alchimiste: { oui: 'Les dés, c’est de la probabilité. J’ai une théorie. Elle est fausse, mais j’y tiens.', gagne: 'Ha ! La théorie tient !', perd: 'La théorie… demande des ajustements.' },
  cure: { refus: 'Le jeu d’argent, mon enfant ? Non. Mais je prierai pour vos pertes.' },
  fillette: { refus: 'Maman dit que les dés, c’est pour les grands et pour les menteurs.' },
  _: { oui: 'Une partie ? Pourquoi pas.', gagne: 'Gagné ! Merci bien.', perd: 'Perdu ! Bien joué.' },
};
const ACT_TRICHE = ['Attendez… Montrez-moi ces dés. … Tricheur ! TRICHEUR !', 'Ces dés tombent toujours du même côté. Vous me prenez pour qui ?', 'Ils sont pipés ! Tout le monde a vu ? Pipés !'];
const ACT_BRAS = {
  forgeron: { oui: '… Pose ton coude.', gagne: 'Mon père me battait. Personne d’autre.', perd: '… Personne ne m’avait battu depuis mon père. Va. Le prochain verre, c’est moi.', f: 1.8 },
  eleveuse: { oui: 'Un bras de fer ? Avec moi ? J’ai tenu des étalons par la bride. Allez.', gagne: 'Ha ! Il faudra manger plus de soupe.', perd: 'Eh bien ! Tu as des bras de laboureur. Respect.', f: 1.3 },
  chasseur: { oui: 'Si tu veux. Ne pleure pas après.', gagne: 'Le poignet, c’est comme le fusil : ça ne tremble pas, ou ça tremble.', perd: '… Tu tiens. C’est rare.', f: 1.5 },
  garde: { oui: 'Un bras de fer ? Bon. Mais doucement : j’ai une vieille blessure. Enfin, une vieille peur.', gagne: 'Ha ! La loi est forte !', perd: 'Aïe. Bon. Ne le dites pas au maire.', f: 1.0 },
  aubergiste: { oui: 'Un bras de fer ? Sur mon comptoir ? … Allez, pour l’honneur de la maison !', gagne: 'Ha ! Trente ans à porter des tonneaux, ça forge un bras !', perd: 'Ouh là. Vous, je vous sers double, désormais. Par prudence.', f: 1.1 },
  nain_forgeronne: { oui: 'Un grand qui veut perdre ? Pose ton bras sur l’enclume.', gagne: 'Les grands ont de longs bras. Pas de forts bras.', perd: '… Hm. Tu frapperais bien, au marteau. Pour un grand.', f: 2.0 },
  colporteur: { oui: 'Ha ! Pour une pièce ? Non ? Pour la gloire, alors.', gagne: 'La route rend costaud, mon ami !', perd: 'Aïe, aïe, aïe. Mon bras de vendeur. Mon gagne-pain !', f: 0.9 },
  _: { oui: 'D’accord. Un bras de fer.', gagne: 'Gagné !', perd: 'Perdu… Bien joué.', f: 1.0 },
};
const ACT_TOURNEE = ['À votre santé !', 'À la vôtre ! Et à la vallée !', 'Merci ! Vous êtes des nôtres, maintenant.', 'Santé ! Et que la nuit soit courte.', 'À celui qui paie ! C’est la meilleure santé qui soit.'];

// ---------------------------------------------------------------- les contes de la veillée
const ACT_CONTES = [
  { t: 'La lavandière de minuit', x: 'Au lavoir, les nuits sans lune, il y a une femme qui lave. Elle tape le linge sur la pierre, fort, régulier, et l’eau devient noire autour d’elle. Ce sont les chemises de ceux qui vont mourir dans l’année.\n\nSi elle vous demande de l’aider à tordre un drap, tordez-le dans le même sens qu’elle. Toujours dans le même sens. Le vieux Mathurin l’a tordu à l’envers, pour voir. On l’a retrouvé le lendemain, les bras tordus dans le dos comme un drap qu’on essore.\n\nEt si vous ne me croyez pas, allez donc laver votre linge après minuit.' },
  { t: 'Le semeur de pierres', x: 'Il y avait un homme, du côté des Monts, qui semait des pierres. Il marchait dans son champ avec un tablier plein de cailloux, et il les jetait à la volée, comme du blé. Les gens riaient.\n\nAu printemps, les pierres ont levé. Pas en herbe : en pierres plus grosses, rondes, qui sortaient de terre comme des têtes. Au mois de juin, elles avaient des yeux.\n\nL’homme est reparti dans les Monts, et le champ est resté. On l’appelle encore le champ aux têtes. Personne n’y fauche.' },
  { t: 'La treizième heure', x: 'Une fois l’an, l’horloge de la mairie sonne treize coups. Personne ne sait quel jour : ça dépend de l’horloge. Ceux qui dorment n’entendent rien. Ceux qui sont réveillés comptent, et au treizième coup, ils perdent une journée.\n\nIls se couchent un Ferdi et se lèvent un Lavedi, et le Marchedi entre les deux, quelqu’un l’a vécu à leur place, dans leurs souliers.\n\nMa tante a perdu un jour comme ça. Elle a retrouvé dans sa poche une lettre de sa propre main, qu’elle n’a jamais voulu lire. Elle l’a brûlée. La fumée sentait la violette.' },
  { t: 'Les moutons de la combe', x: 'Deux bergers de la combe comptaient leurs bêtes, le soir, à la barrière. Quarante. Le lendemain : quarante et une. Le surlendemain : quarante-deux. Ils n’avaient rien acheté, rien volé, et les brebis n’agnelaient pas.\n\nLes nouvelles bêtes étaient propres, blanches, bien nourries, et elles ne bêlaient jamais. Un soir, le plus jeune en a regardé une dans les yeux. C’étaient des yeux d’homme.\n\nLe lendemain, ils étaient quarante et un. Il ne restait qu’un berger.' },
  { t: 'La noce sous le lac', x: 'Avant le lac, il y avait un village, au fond, et ce village avait une noce le jour où l’eau est montée. Par les nuits calmes, on entend encore les violons, sous l’eau, et les cloches de la noce.\n\nUn garçon d’ici, qui dansait mieux que tout le monde, a voulu y aller. Il a nagé jusqu’au milieu du lac et il a plongé. Le lendemain, on a retrouvé ses souliers sur le ponton, bien rangés, les pointes vers l’eau.\n\nLes pêcheurs disent que certains soirs, on entend quelqu’un danser mieux que tout le monde, là-dessous.' },
  { t: 'L’homme qui demandait le chemin', x: 'Sur la route du nord, à la brune, un homme vous demande parfois le chemin. Il a un long manteau, un chapeau, et pas de visage à regarder : juste de l’ombre, là où la figure devrait être.\n\nIl demande toujours le chemin de chez vous. Pas du village : de chez vous. Il faut lui indiquer l’autre direction, n’importe laquelle, et ne pas se retourner.\n\nLe petit Lefèvre lui a indiqué la bonne. Ce soir-là, sa mère a entendu frapper trois coups. Elle a ouvert. Depuis, les volets de la maison sont bleus, et la maison est vide.' },
];

// ---------------------------------------------------------------- les petits travaux de la mairie
const ACT_APPORTER = [
  ['bois', 6, 'Du bois pour le poêle de l’école. Six bûches.', 36], ['pierre', 8, 'Des pierres pour le muret du cimetière. Huit.', 40], ['fleur', 5, 'Des fleurs pour les jardinières de la mairie (le préfet passera peut-être).', 30],
  ['oeuf', 4, 'Quatre œufs pour la soupe des indigents.', 34], ['pomme', 5, 'Des pommes pour l’hospice. Cinq, pas trop tapées.', 30], ['foin', 6, 'Du foin pour les chevaux de la poste.', 30],
  ['champignon', 3, 'Des champignons pour la table du conseil. Des bons, si possible.', 36], ['charbon', 3, 'Du charbon pour la forge communale.', 40], ['farine', 2, 'De la farine pour le pain des pauvres.', 34],
  ['poisson', 2, 'Du poisson pour la soupe du Vorndi. Deux pièces, n’importe lesquelles.', 44], ['corde', 1, 'Une corde neuve pour la cloche.', 30], ['herbes', 3, 'Des herbes pour la guérisseuse, qui ne descend plus en ville.', 38],
  ['fibre', 6, 'De la fibre pour réparer les filets du pêcheur.', 28], ['bougie', 3, 'Des bougies pour l’église. Le curé en brûle beaucoup, ces temps-ci.', 32],
];
const ACT_LIVRER = ['Porter un pli de la mairie à {npc}.', 'Remettre à {npc} une convocation de la mairie, en main propre.', 'Porter à {npc} l’avis du conseil municipal.'];

// ---------------------------------------------------------------- le puits aux souhaits
const ACT_VOEU = {
  fortune: '(La pièce tinte longtemps en descendant, comme si le puits la comptait.)',
  sante: '(Une odeur d’eau fraîche remonte. Vous respirez mieux.)',
  amour: '(Quelque part, quelqu’un pense à vous. Ou c’est le vent.)',
  nuits: '(Tout au fond, quelque chose rit. Doucement. Puis plus rien.)',
  mort: '(La pièce descend sans bruit. Vous vous sentez un peu plus léger.)',
  refus: '(La pièce remonte, posée sur l’eau, face visible. Le puits n’en veut pas. Pas aujourd’hui.)',
  nom: '(Au fond du puits, une voix d’enfant dit votre prénom. Une seule fois.)',
};

// ---------------------------------------------------------------- la diseuse
const ACT_MASQUE = {
  maire: 'une écharpe aux trois couleurs, tachée de boue', boulangere: 'de la farine sous les ongles, la nuit', forgeron: 'du fer qui rougit sans feu',
  grainetiere: 'des graines qu’on ne sème pas', aubergiste: 'un tablier raide, et du vin qui ne tourne pas', cure: 'une étole, et une corde coupée net',
  postiere: 'des lettres qui ne sont pas les siennes', garde: 'des clefs de pont, et une pique lavée', eleveuse: 'des chevaux qui se retournent',
  pecheur: 'de l’eau qui ne rend rien', guerisseuse: 'des herbes qui ne soignent pas',
};
const ACT_ARCANES = [
  ['Le Cerf blanc', 'Un cerf blanc traversera votre route. Ne le suivez pas. Ou suivez-le, mais ne revenez pas le raconter.'],
  ['La Clef', 'Une clef que vous n’avez pas encore ouvrira une porte que vous ne voyez pas encore. C’est tout ce que je peux dire. C’est déjà beaucoup.'],
  ['La Moisson', 'Ce que vous avez semé lèvera. Pas forcément ce que vous croyez avoir semé.'],
  ['Le Pont', 'Un pont se lèvera devant vous. Ne sautez pas. Attendez l’aube.'],
  ['La Poupée', 'Une enfant vous dira la vérité. Personne ne la croira. Vous non plus, d’abord.'],
  ['La Roue', 'Ici, le temps tourne à l’envers de chez vous. Comptez vos jours. Comptez-les deux fois.'],
  ['La Lettre', 'Une lettre vous attend, écrite d’une main que vous connaissez sans la connaître.'],
];
const ACT_DISEUSE = {
  accueil: ['Asseyez-vous. Donnez-moi votre main. Non, l’autre.', 'Dix pièces, et ce que les cartes voudront bien dire.', 'Je vous attendais. Je dis ça à tout le monde. Avec vous, c’est vrai.'],
  fin: ['C’est tout. Les cartes sont fatiguées. Moi aussi.', 'Allez. Et fermez bien le rideau en sortant : le vent écoute.', 'Revenez un autre jour. Ou ne revenez pas : c’est une réponse aussi.'],
  deja: 'Une fois par jour. Les cartes ne répètent pas, et moi non plus.',
  pauvre: 'Dix pièces. Les cartes ne font pas crédit. Elles savent trop bien comment ça finit.',
};

// ---------------------------------------------------------------- le crieur, le violoneux, la tombola, les concours, les tombes
const ACT_PERDU = ['Perdu : un chat tigré qui répond au nom de Mistigri. Récompense.', 'Trouvé : un soulier d’enfant, près du lavoir. Le réclamer à la mairie.', 'Perdu : une montre en argent, du côté du pont sud. Bonne récompense.', 'Trouvé : une clé, sur la route de Clairpré. Personne ne l’a réclamée depuis trois ans.', 'Perdu : un chien noir, très doux. S’il gratte à votre porte la nuit, ce n’est peut-être pas lui.'];
const ACT_VIOLON = ['Merci, merci. Celle-là, je la tiens de ma mère. Elle la tenait de quelqu’un qu’elle n’a jamais voulu nommer.', 'Une pièce ? Alors une gigue. Les morts aussi aiment danser, mais ils ne paient pas.', 'Écoutez bien la fin. Elle ne finit pas comme elle commence.', 'Je joue ici depuis quarante ans. La place a changé trois fois de pavés. Moi, deux fois de cordes.'];
const ACT_EPITAPHES = [
  'Ici repose Anne-Marie Varenne, 1791 – 1858.\n« Elle attendait à la fenêtre. Elle attend encore. »',
  'Jean-Baptiste Morel, 1788 – 1849, rebouteux.\n« Il soignait les bêtes, et les gens qui voulaient bien. »',
  'Les enfants Bastien, Paul, Louise et le petit Jean.\n« Descendus au puits. Remontés au ciel. »',
  'Étienne Lefèvre, 1802 – 1861.\n« Il a indiqué le chemin. »',
  'Joséphine Rivière, née Garnier, 1810 – ?\nLa date de la mort n’a jamais été gravée. La pierre est pourtant vieille.',
  'L’abbé Mauduit, curé de cette paroisse, 1770 – 1845.\n« Il a compté les coups de la cloche jusqu’au dernier. »',
];
const ACT_TIR = {
  gagne: 'Pas mal. Pour quelqu’un qui tire sur les corbeaux. Prends le prix, tu l’as gagné.',
  perd: 'Tu trembles. Ce n’est pas le fusil, c’est toi. Reviens au prochain Chassedi.',
  inscrit: 'Trois coups, à quinze pas. On compte les points à la fin. Ne vise pas mes chiens.',
};
const ACT_PECHE = {
  gagne: 'Mon frère aurait aimé ce poisson-là. Il est à vous, le prix.',
  perd: 'Pas cette fois. Le lac choisit. Il choisit rarement les gens pressés.',
  inscrit: 'Inscrit. Jusqu’à quatre heures, ce que vous tirez du lac compte. Après, on pèse. Enfin, on regarde.',
};

// ---------------------------------------------------------------- les étals particuliers du Marchedi
const ACT_ETALS = [
  { id: 'brocanteur', nom: 'Lazare, brocanteur', accueil: 'Tout se vend, tout s’achète. Je ne demande jamais d’où ça vient. C’est ma politesse.', vend: [['bougeoir', 40], ['besicles', 45], ['jeu_cartes', 25], ['boussole', 120], ['lanterne', 75]], n: 3, achete: true,
    look: { skin: '#caa080', hair: '#3a3028', hairStyle: 'court', beard: 'courte', hat: 'chapeau', hatCol: '#2a2420', top: '#4a4038', bottom: '#2e2a26', shoe: '#1a1410', coat: true, build: 'mince', height: 1.02 } },
  { id: 'curiosites', nom: 'Mme Perrine, curiosités', accueil: 'Des choses rares, pour des gens qui le sont aussi. Regardez avec les yeux, d’abord.', vend: [['carte_tresor', 70], ['vieille_piece', 60], ['livre_contes', 45], ['montre', 170], ['figurine', 45], ['geode', 45], ['bijou', 220], ['fossile', 150], ['eau_cologne', 50], ['medaillon_portrait', 110]], n: 3,
    look: { skin: '#e0c0a8', hair: '#5a3a2a', hairStyle: 'chignon', hat: 'voile', hatCol: '#3a2a3a', top: '#5a3a5a', bottom: '#3a2a3a', shoe: '#1a1410', dress: true, build: 'normal', height: 0.97, fem: true } },
  { id: 'grainier', nom: 'le grainier des Monts', accueil: 'Des graines d’en haut. Elles lèvent mieux quand on leur parle. Pas trop fort.', vend: [['graines_rose', 16], ['graines_lavande', 9], ['graines_dahlia', 10], ['graines_pasteque', 22], ['graines_artichaut', 15], ['graines_asperge', 13], ['graines_houblon', 12], ['graines_raisin', 18], ['graines_mandragore', 55], ['graines_belladone', 20], ['graines_framboise', 12], ['graines_myrtille', 14]], n: 4,
    look: { skin: '#b88a68', hair: '#2a2420', hairStyle: 'court', beard: 'longue', hat: 'bonnet', hatCol: '#6a2a20', top: '#7a6a4a', bottom: '#4a4034', shoe: '#2a2018', build: 'normal', height: 1.0 } },
  { id: 'fromagere', nom: 'la mère Tatin, fromages et salaisons', accueil: 'Goûtez, goûtez ! Le fromage, c’est comme les gens : meilleur quand il a un peu de caractère.', vend: [['fromage', 70], ['fromage_chevre', 80], ['viande_fumee', 85], ['beurre', 55], ['miel', 80], ['confiture', 62]], n: 6,
    look: { skin: '#e8c4a8', hair: '#9a9088', hairStyle: 'chignon', hat: 'voile', hatCol: '#f0ece0', top: '#6a7a4a', bottom: '#4a4a3a', shoe: '#2a2018', dress: true, apron: '#f0ece0', build: 'rond', height: 0.95, old: true, fem: true } },
];
const ACT_LOOKS = {
  crieur: { skin: '#d8b090', hair: '#8a8278', hairStyle: 'chauve', beard: 'moustache', hat: 'casquette', hatCol: '#2a3050', top: '#3a4a7a', bottom: '#2a2a30', shoe: '#1a1410', coat: true, build: 'rond', height: 1.0, old: true },
  violon: { skin: '#c89a78', hair: '#b0aaa0', hairStyle: 'long', beard: 'longue', hat: 'chapeau', hatCol: '#3a2e24', top: '#6a4a30', bottom: '#3a3228', shoe: '#1a1410', coat: true, build: 'mince', height: 0.98, old: true },
  diseuse: { skin: '#d8b8a0', hair: '#1a1614', hairStyle: 'long', hat: 'voile', hatCol: '#4a1a2a', top: '#3a1a2a', bottom: '#2a1420', shoe: '#1a1410', dress: true, build: 'mince', height: 0.96, old: true, fem: true },
};
const ACT_NOMS = { crieur: 'Barnabé Toquet, tambour de ville', violon: 'le vieux Tiennot, violoneux', diseuse: 'Mère Ysaure' };

// ---------------------------------------------------------------- modèles
Object.assign(PROP_MODELS, {
  // la herse à cierges (les flammes sont dessinées à part)
  porte_cierges(E) {
    E.bx(0, 0, 0, 0.12, 0.8, 0.12, PC.iron, TL.iron); E.bx(0, 0, 0, 0.5, 0.05, 0.4, PC.iron, TL.iron);
    E.bx(0, 0.8, 0, 1.0, 0.05, 0.32, PC.iron, TL.iron); E.bx(0, 0.85, -0.12, 1.0, 0.18, 0.04, PC.iron, TL.iron);
    for (let i = 0; i < 12; i++) E.bx(-0.42 + (i % 6) * 0.168, 0.85, -0.06 + ((i / 6) | 0) * 0.13, 0.035, 0.1 + ((i * 7) % 3) * 0.03, 0.035, rgbf('#f0e8d0'), TL.plain);
    E.bx(0.38, 0.85, 0.1, 0.12, 0.1, 0.12, rgbf('#6a4a30'), TL.darkwood);
  },
  // la piste de quilles (les quilles et la boule sont dessinées à part)
  quilles_piste(E) {
    E.bx(0, 0, 0, 1.1, 0.04, 7.4, WHITE, TL.wood);
    for (const s of [-0.6, 0.6]) E.bx(s, 0, 0, 0.1, 0.12, 7.4, WHITE, TL.darkwood);
    E.bx(0, 0, 3.8, 1.3, 0.8, 0.12, WHITE, TL.darkwood); E.bx(0, 0, -3.85, 1.2, 0.02, 0.3, rgbf('#c8b088'), TL.plain);
    E.bx(-0.95, 0, -3.3, 0.5, 0.3, 0.5, WHITE, TL.wood); for (let i = 0; i < 3; i++) E.box(-0.95, 0.38, -3.45 + i * 0.15, 0.13, 0.13, 0.13, rgbf('#6a4a2a'), TL.darkwood, i);
  },
  // la cible de paille, sur son chevalet (l'avant regarde +z)
  cible(E) {
    E.box(0, 0.8, -0.35, 0.08, 1.7, 0.08, WHITE, TL.wood, 0, 0.35); for (const s of [-0.55, 0.55]) E.box(s, 0.8, 0.05, 0.08, 1.7, 0.08, WHITE, TL.wood, 0, -0.1);
    E.box(0, 1.15, 0.05, 1.2, 1.2, 0.2, WHITE, TL.straw, 0, -0.1);
    const C = ['#f0ece0', '#2a2a2a', '#3a6aa8', '#c83028', '#f0d030'];
    for (let i = 0; i < 5; i++) { const r = 1.0 - i * 0.2; E.box(0, 1.15, 0.16 + i * 0.006, r, r, 0.01, rgbf(C[i]), TL.plain, 0, -0.1, 0.785); }
  },
  // la tente de la diseuse (ouverte à l'avant, +z), un tabouret, une petite table, une bougie
  tente_diseuse(E) {
    const c = rgbf('#5a1a2a'), c2 = rgbf('#8a6a2a');
    E.box(-0.82, 1.05, 0, 0.08, 2.35, 2.2, c, TL.cloth2, 0, 0, -0.4); E.box(0.82, 1.05, 0, 0.08, 2.35, 2.2, c, TL.cloth2, 0, 0, 0.4);
    E.bx(0, 2.08, 0, 0.9, 0.06, 2.2, c, TL.cloth2);
    E.bx(0, 0, -1.08, 2.4, 1.1, 0.06, c, TL.cloth2); E.bx(0, 1.1, -1.08, 1.6, 0.6, 0.06, c, TL.cloth2); E.bx(0, 1.7, -1.08, 0.95, 0.4, 0.06, c, TL.cloth2); E.bx(0, 2.05, 0, 0.12, 0.12, 2.3, WHITE, TL.darkwood);
    for (const s of [-1, 1]) E.box(s * 0.62, 1.0, 1.1, 0.42, 2.0, 0.05, c, TL.cloth2, s * 0.35);
    for (let i = 0; i < 9; i++) E.box(-0.72 + i * 0.18, 2.1 - Math.abs(i - 4) * 0.11, 1.14, 0.06, 0.1, 0.02, c2, TL.plain);
    E.bx(0, 0, -0.35, 0.4, 0.45, 0.4, WHITE, TL.darkwood);
    E.bx(0, 0, 0.45, 0.7, 0.62, 0.5, rgbf('#3a1a24'), TL.cloth); E.bx(0.18, 0.62, 0.45, 0.07, 0.12, 0.07, rgbf('#f0e8d0'), TL.plain);
    E.bx(-0.12, 0.62, 0.5, 0.2, 0.02, 0.28, rgbf('#e8dcc0'), TL.paper, 0.4);
  },
  // le stand de la tombola : une table, le tambour à billets, les lots
  stand_tombola(E) {
    E.bx(0, 0.72, 0, 1.6, 0.06, 0.8, WHITE, TL.wood); for (const [x, z] of [[-0.72, -0.32], [0.72, -0.32], [-0.72, 0.32], [0.72, 0.32]]) E.bx(x, 0, z, 0.07, 0.72, 0.07, WHITE, TL.darkwood);
    E.box(-0.35, 1.0, 0, 0.5, 0.4, 0.4, rgbf('#c8a040'), TL.wood, 0, 0.785); for (const s of [-0.62, -0.08]) E.bx(s, 0.78, 0, 0.04, 0.3, 0.04, PC.iron, TL.iron);
    E.bx(0.4, 0.78, 0.05, 0.22, 0.26, 0.14, rgbf('#8a4a2a'), TL.leather); E.bx(0.62, 0.78, -0.1, 0.1, 0.3, 0.1, rgbf('#6a8a4a'), TL.glass); E.bx(0.25, 0.78, -0.2, 0.14, 0.12, 0.14, rgbf('#e8d8a0'), TL.plain);
    E.bx(0, 0, -0.55, 1.7, 1.6, 0.05, WHITE, TL.darkwood); E.bx(0, 1.25, -0.52, 1.3, 0.3, 0.02, rgbf('#e8dcc0'), TL.sign);
  },
});
Object.assign(PROP_COLL, { porte_cierges: [0.5, 0.2, 1.0], cible: [0.62, 0.4, 1.8], tente_diseuse: [1.0, 1.1, 2.2], stand_tombola: [0.85, 0.6, 1.6] });

// ---------------------------------------------------------------- sons
Object.assign(SoundEngine.prototype, {
  tambour() { if (!this.ok) return; const t = this.at(); for (let i = 0; i < 14; i++) this.noiseHit(t + i * 0.055, 0.06, 'bandpass', 170 + Math.random() * 60, 1.4, 0.1); this.tone(t + 0.8, 'sine', 95, 60, 0.35, 0.18); },
  desSon() { if (!this.ok) return; const t = this.at(); for (let i = 0; i < 6; i++) this.noiseHit(t + i * 0.07 + Math.random() * 0.03, 0.04, 'bandpass', 1800 + Math.random() * 1400, 3, 0.07); },
  quille(k = 1) { if (!this.ok) return; const t = this.at(); this.tone(t, 'triangle', 520 + Math.random() * 180, 380, 0.09, 0.07 * k); this.noiseHit(t, 0.08, 'bandpass', 900, 2, 0.06 * k); },
  applaudir() { if (!this.ok) return; const t = this.at(); for (let i = 0; i < 26; i++) this.noiseHit(t + i * 0.045 + Math.random() * 0.04, 0.03, 'bandpass', 1400 + Math.random() * 1200, 1.5, 0.03); },
});

// ---------------------------------------------------------------- la génération (après les fouilles, tirage à part)
function activitesGen(w, seed) {
  if (!w || !w.bld || !w.nav || !w.props) return;
  w.inter = w.inter || [];
  const rnd = mulberry32(((seed | 0) * 6151 + 9999) >>> 0);
  const B = new Builder(w, rnd, new Uint8Array(1));
  const T = w.townInfo, lm = w.lm || {}, bl = w.bld, WL = w.waterLevel;
  const A = w.act = { vendeurs: [] };
  const pris = [];
  const inter = (kind, id, x, y, z, name, data) => (w.inter.some((i) => i.id === id) ? null : B.inter(kind, id, x, y, z, name, data || {}));
  // hors de tout bâtiment (un point au milieu d'une pièce passerait pour libre)
  const horsBat = (x, z, m) => { for (const k in bl) { const b = bl[k]; if (!b.f || b.under) continue; const [lx, lz] = f2Local(b.f, x, z); if (Math.abs(lx) < b.W / 2 + m && Math.abs(lz) < b.D / 2 + m) return false; } return true; };
  const libre = (x, z, y, hx, hz, r, o) => { const box = { x, z, hx, hz, r, y }; return f2Libre(w, box, y, Object.assign({ pris }, o || {})) && pointFree(w, x, z, Math.min(hx, hz) * 0.8) && (o && o.dedans || horsBat(x, z, Math.max(hx, hz) + 0.3)) ? box : null; };
  const poser = (id, x, y, z, r, box, data) => { const q = B.prop(id, x, y, z, r, data || null); if (box) pris.push(box); return q; };
  const loinDesChemins = (x, z, r) => {
    const N = w.nav.nodes;
    for (const [a, b] of w.nav.edges) {
      const P = N[a], C = N[b];
      if (!P || !C || Math.min(P.x, C.x) > x + r + 1 || Math.max(P.x, C.x) < x - r - 1 || Math.min(P.z, C.z) > z + r + 1 || Math.max(P.z, C.z) < z - r - 1) continue;
      const dx = C.x - P.x, dz = C.z - P.z, L2 = dx * dx + dz * dz || 1, t = clamp(((x - P.x) * dx + (z - P.z) * dz) / L2, 0, 1);
      if (Math.hypot(x - (P.x + dx * t), z - (P.z + dz * t)) < r) return false;
    }
    return true;
  };
  // les liaisons du maillage des rues qui traversent un objet posé sont retirées (sans isoler aucun nœud ; les îlots
  // marqués par les autres passes ne sont pas touchés)
  const couperChemins = (box) => {
    const N = w.nav, nodes = N.nodes, coupe = [];
    N.edges.forEach((e, i) => {
      if (e[2]) return;
      const P = nodes[e[0]], C = nodes[e[1]];
      if (!P || !C || Math.max(P.x, C.x) < box.x - 3 || Math.min(P.x, C.x) > box.x + 3 || Math.max(P.z, C.z) < box.z - 3 || Math.min(P.z, C.z) > box.z + 3) return;
      const L = Math.hypot(C.x - P.x, C.z - P.z), n = Math.max(1, Math.ceil(L / 0.25));
      for (let k = 0; k <= n; k++) if (f2DansBoite(box, lerp(P.x, C.x, k / n), lerp(P.z, C.z, k / n), 0.35)) { coupe.push(i); break; }
    });
    if (!coupe.length) return true;
    const deg = new Map();
    for (const e of N.edges) { deg.set(e[0], (deg.get(e[0]) || 0) + 1); deg.set(e[1], (deg.get(e[1]) || 0) + 1); }
    for (const i of coupe) { const e = N.edges[i]; deg.set(e[0], deg.get(e[0]) - 1); deg.set(e[1], deg.get(e[1]) - 1); }
    for (const i of coupe) { const e = N.edges[i]; if (deg.get(e[0]) < 1 || deg.get(e[1]) < 1) return false; }
    const S = new Set(coupe);
    N.edges = N.edges.filter((e, i) => !S.has(i));
    N.adj = nodes.map(() => []);
    for (const [a, b, flag] of N.edges) { const d = Math.hypot(nodes[a].x - nodes[b].x, nodes[a].z - nodes[b].z); N.adj[a].push({ to: b, d, flag }); N.adj[b].push({ to: a, d, flag }); }
    w.grid = null;
    return true;
  };
  // ============================================================ l'auberge : les dés, les cartes, la veillée
  const au = bl.auberge;
  if (au && au.f) {
    const y = au.f.y + 0.15;
    const t1 = w.props.find((q) => q.id === 'table' && Math.hypot(q.x - B.toWorld(au.f, -3, 1.2)[0], q.z - B.toWorld(au.f, -3, 1.2)[1]) < 0.5);
    if (t1) inter('f2a_des', 'f2a:des', t1.x, y + 0.95, t1.z, 'Jouer aux dés');
    const t2 = w.props.find((q) => q.id === 'table' && Math.hypot(q.x - B.toWorld(au.f, 0.5, -0.3)[0], q.z - B.toWorld(au.f, 0.5, -0.3)[1]) < 0.5);
    if (t2) inter('f2a_cartes', 'f2a:cartes', t2.x, y + 0.95, t2.z, 'Jouer aux cartes');
    const [vx, vz] = B.toWorld(au.f, -4.4, 1.9);
    inter('f2a_veillee', 'f2a:veillee', vx, y + 1.0, vz, 'Écouter les contes au coin du feu');
    // le violoneux, à côté de la porte
    for (const [lx, lz] of [[-2.2, -au.D / 2 - 1.6], [2.4, -au.D / 2 - 1.7], [-2.6, -au.D / 2 - 2.6]]) {
      const [x, z] = B.toWorld(au.f, lx, lz);
      if (!pointFree(w, x, z, 0.5) || !horsBat(x, z, 0.4) || w.props.some((q) => Math.hypot(q.x - x, q.z - z) < 1.0) || w.doors.some((d) => Math.hypot(d.x - x, d.z - z) < 1.2)) continue;
      A.violon = { x, z, y: w.heightAt(x, z), h: au.f.r + Math.PI };
      break;
    }
  }
  // ============================================================ la mairie : le tableau des petits travaux
  const ma = bl.mairie;
  if (ma && ma.f) {
    for (const lx of [3.3, -3.4, 4.2]) {
      const [x, z] = B.toWorld(ma.f, lx, -ma.D / 2 - 1.15), y = w.heightAt(x, z), box = libre(x, z, y, 0.8, 0.15, ma.f.r, { interR: 0.9, navR: 0.5 });
      if (!box || w.doors.some((d) => Math.hypot(d.x - x, d.z - z) < 1.6)) continue;
      const q = poser('panneau_affichage', x, y, z, ma.f.r, box);
      const [ix, iz] = B.toWorld(q, 0, -0.65);
      inter('f2a_travaux', 'f2a:travaux', ix, y + 1.45, iz, 'Lire le tableau des petits travaux');
      break;
    }
  }
  // ============================================================ la place : le puits aux souhaits, le crieur
  if (T && lm.puits_ville) {
    const P = lm.puits_ville, a = ma ? Math.atan2(ma.z - P.z, ma.x - P.x) + Math.PI : 0;
    inter('f2a_voeu', 'f2a:voeu', P.x + Math.cos(a) * 1.05, w.heightAt(P.x, P.z) + 0.95, P.z + Math.sin(a) * 1.05, 'Jeter une pièce et faire un vœu');
  }
  if (T) {
    for (const [lx, lz] of [[3.4, -3.3], [-3.4, 3.4], [3.4, 3.4]]) {
      const x = T.x + lx, z = T.z + lz;
      if (!pointFree(w, x, z, 0.4) || w.props.some((q) => Math.hypot(q.x - x, q.z - z) < 1.0)) continue;
      A.crieur = { x, z, y: w.heightAt(x, z), h: Math.atan2(-lx, -lz) + Math.PI };
      break;
    }
  }
  // ============================================================ le marché du sud : la tente de la diseuse, les marchands du Marchedi
  if (T) {
    // (le maillage des rues est serré : on cherche la place libre la plus proche du marché, l'ouverture vers la rue)
    const cands = [];
    for (let lx = -22; lx <= 22; lx++) for (let lz = 17; lz <= 43; lz++) if (Math.abs(lx) >= 6) cands.push([lx, lz, Math.hypot(Math.abs(lx) - 10, lz - 31)]);
    cands.sort((a, b) => a[2] - b[2]);
    for (const [lx, lz] of cands) {
      const r = lx < 0 ? Math.PI / 2 : -Math.PI / 2, x = T.x + lx, z = T.z + lz, y = w.heightAt(x, z);
      if (Math.abs(y - w.heightAt(T.x, T.z)) > 0.4) continue;
      const box = libre(x, z, y, 1.05, 1.15, r, { interR: 1.0, navR: 0.6 });
      if (!box || w.doors.some((d) => Math.hypot(d.x - x, d.z - z) < 3) || !couperChemins(box)) continue;
      const q = poser('tente_diseuse', x, y, z, r, box);
      const [ix, iz] = B.toWorld(q, 0, 1.45);
      inter('f2a_diseuse', 'f2a:diseuse', ix, y + 1.2, iz, 'Entrer sous la tente de la diseuse');
      const [dx, dz] = B.toWorld(q, 0, -0.35);
      A.diseuse = { x: dx, z: dz, y, h: r };
      break;
    }
    const etals = w.props.filter((q) => q.id === 'etal_complet' && Math.abs(q.x - T.x) < 46 && Math.abs(q.z - T.z) < 46).sort((a, b) => a.x - b.x || a.z - b.z);
    etals.forEach((q, i) => {
      const [x, z] = B.toWorld(q, 1.8, -0.2);
      q.act = i;
      A.vendeurs.push({ i, x, z, y: w.heightAt(x, z), h: q.r + Math.PI, etal: [q.x, q.z] });
    });
  }
  // ============================================================ l'église : le clocher, la herse à cierges, les vieilles tombes
  const eg = bl.eglise;
  if (eg && eg.f) {
    const f = eg.f;
    B.propRel(f, 'echelle', 1.9, 0.05, -12.3, Math.PI / 2, { h: 14.5 });
    const [cx, cz] = B.toWorld(f, 1.45, -12.3);
    inter('f2a_clocher', 'f2a:clocher', cx, f.y + 1.5, cz, 'Monter au clocher');
    const [tx, tz] = B.toWorld(f, 0, -11.6);
    A.clocher = { x: tx, z: tz, y: f.y, r: f.r };
    const [hx, hz] = B.toWorld(f, -2.3, 6.3), hy = f.y + 0.15, hb = libre(hx, hz, hy, 0.5, 0.2, f.r + Math.PI, { interR: 0.8, nav: false, dedans: true });
    if (hb && f2CheminsLibres(w, eg, hb, 0.25)) {
      const q = poser('porte_cierges', hx, hy, hz, f.r + Math.PI, hb);
      const [ix, iz] = B.toWorld(q, 0, 0.6);
      inter('f2a_cierge', 'f2a:cierge', ix, hy + 1.0, iz, 'Allumer un cierge (2 pièces)');
      A.cierges = { x: hx, z: hz, y: hy, r: f.r + Math.PI };
    }
    let k = 0;
    for (const q of w.props) {
      if (q.id !== 'tombe' || !T || Math.abs(q.x - T.x) > 47 || Math.abs(q.z - T.z) > 47 || k >= 6) continue;
      const [ix, iz] = B.toWorld(q, 0, -0.55);
      inter('f2a_tombe', 'f2a:tombe:' + k, ix, q.y + 0.7, iz, 'Lire l’épitaphe', { i: k, pos: [q.x, q.y, q.z, q.r] });
      k++;
    }
  }
  // ============================================================ Clairpré : les quilles, le four banal, la tombola
  const H = lm.hameau, rb = bl.ranch;
  if (H && rb && rb.f) {
    const hf = { x: H.x, z: H.z, r: rb.f.r }, y0 = w.heightAt(H.x, H.z);
    for (const [lx, lz] of [[0, -12], [-2, -11], [2, -12.5], [0, -20]]) {
      const [x, z] = B.toWorld(hf, lx, lz), r = rb.f.r + Math.PI / 2, y = w.heightAt(x, z);
      if (Math.abs(y - y0) > 0.4) continue;
      const box = libre(x, z, y, 0.75, 4.0, r, { interR: 1.0, navR: 0.5 });
      if (!box || !loinDesChemins(x, z, 0.9)) continue;
      const q = poser('quilles_piste', x, y, z, r, box);
      const [ix, iz] = B.toWorld(q, 0, -4.1);
      inter('f2a_quilles', 'f2a:quilles', ix, y + 0.8, iz, 'Jouer aux quilles');
      A.quilles = { x, y, z, r };
      break;
    }
    const fp = w.props.find((q) => q.id === 'four_pain' && Math.hypot(q.x - H.x, q.z - H.z) < 45);
    if (fp) { const [ix, iz] = B.toWorld(fp, 0, -1.35); inter('f2a_four', 'f2a:four', ix, fp.y + 0.95, iz, 'Enfourner du pain au four banal'); A.four = { x: fp.x, y: fp.y, z: fp.z, r: fp.r }; }
    for (const [lx, lz] of [[6.5, -12], [-6.5, -11.5], [6, -3], [-6, 11]]) {
      const [x, z] = B.toWorld(hf, lx, lz), y = w.heightAt(x, z), r = rb.f.r + Math.PI;
      if (Math.abs(y - y0) > 0.4) continue;
      const box = libre(x, z, y, 0.9, 0.65, r, { interR: 1.0, navR: 0.6 });
      if (!box || !loinDesChemins(x, z, 1.1)) continue;
      const q = poser('stand_tombola', x, y, z, r, box);
      const [ix, iz] = B.toWorld(q, 0, 0.8);
      inter('f2a_tombola', 'f2a:tombola', ix, y + 1.1, iz, 'La tombola de la foire');
      break;
    }
  }
  // ============================================================ le relais de chasse : la cible et le panneau du concours
  const re = bl.relais_chasse;
  if (re && re.f) {
    const f = re.f, arbres = [];
    for (const o of w.objects) if (Math.abs(o.x - f.x) < 34 && Math.abs(o.z - f.z) < 34 && !o.gone) arbres.push(o);
    const libreArbres = (x, z, r) => !arbres.some((o) => Math.hypot(o.x - x, o.z - z) < r);
    let cible = null;
    for (let d = 14; d <= 20 && !cible; d += 2) for (const lat of [0, -3, 3, -6, 6]) {
      if (cible) break;
      const [x, z] = B.toWorld(f, lat, -re.D / 2 - d), y = w.heightAt(x, z);
      if (Math.abs(y - f.y) > 2.5 || y < WL + 0.4 || !pointFree(w, x, z, 0.8) || !libreArbres(x, z, 1.6)) continue;
      const [sx, sz] = B.toWorld(f, lat * 0.2, -re.D / 2 - 2.5);
      let ok = true;
      for (let k = 1; k < 10 && ok; k++) { const px = lerp(sx, x, k / 10), pz = lerp(sz, z, k / 10); if (!libreArbres(px, pz, 0.7)) ok = false; }
      if (!ok) continue;
      const box = libre(x, z, y, 0.65, 0.45, f.r, { nav: false });
      if (!box) continue;
      poser('cible', x, y, z, f.r, box);
      cible = { x, y, z, r: f.r, d };
    }
    if (cible) A.cible = cible;
    const [px, pz] = B.toWorld(f, 2.5, -re.D / 2 - 1.6), py = w.heightAt(px, pz);
    if (pointFree(w, px, pz, 0.3) && !w.props.some((q) => Math.hypot(q.x - px, q.z - pz) < 0.9)) {
      poser('panneau', px, py, pz, f.r + Math.PI, null);
      inter('f2a_tir', 'f2a:tir', px, py + 1.3, pz, 'Le concours de tir du Chassedi');
    }
  }
  // ============================================================ le ponton : le panneau du concours de pêche
  const po = lm.ponton;
  if (po) {
    let ok = false;
    for (let r = 3; r <= 9 && !ok; r += 1.5) for (let k = 0; k < 12 && !ok; k++) {
      const a = k / 12 * TAU, x = po.x + Math.cos(a) * r, z = po.z + Math.sin(a) * r, y = w.heightAt(x, z);
      if (y < WL + 0.45 || !pointFree(w, x, z, 0.4) || w.props.some((q) => Math.hypot(q.x - x, q.z - z) < 1.2) || w.inter.some((i) => Math.hypot(i.x - x, i.z - z) < 1.2)) continue;
      poser('panneau', x, y, z, Math.atan2(po.x - x, po.z - z), null);
      inter('f2a_peche', 'f2a:peche', x, y + 1.3, z, 'Le concours de pêche du Pêchedi');
      ok = true;
    }
  }
}
{
  const _gv = generateValley;
  generateValley = async function (seed, progress, gen) {
    const w = await _gv(seed, progress, gen);
    if (w && w.designed) { try { activitesGen(w, w.seed || seed); } catch (e) { console.error('activites', e); } }
    return w;
  };
}

// ---------------------------------------------------------------- le jeu
const activites = {
  rigs: {}, musique: null, crieurT: 0, fourT: 0, ecouteT: 0, quilles: null, brasEtat: null, tirEtat: null,
  S() {
    const s = farm.s;
    if (!s) return null;
    const A = s.activites || (s.activites = {});
    if (A.jour !== s.day) { A.jour = s.day; A.fait = {}; A.cierges = 0; A.ecoute = 0; }
    for (const k of ['fait', 'tombes']) if (!A[k]) A[k] = {};
    return A;
  },
  fait(k) { const A = this.S(); return (A && A.fait[k]) || 0; },
  marquer(k, n) { const A = this.S(); if (A) A.fait[k] = (A.fait[k] || 0) + (n || 1); },
  h() { return npcs.hour(); },
  cle(d) { return cal.jour(d).cle; },
  esprit(d, raison, cap) { if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(d, raison, cap); },
  nom(n) { return n.st.met ? n.name : n.d.role.toLowerCase(); },
  ligne(T, n, k) { const L = (T[n.d.id] && T[n.d.id][k]) || (T._ && T._[k]); return L ? fmtLine(L, n) : ''; },
  voir(it) { return !!it; },
  // les habitants adultes présents dans un bâtiment, prêts à jouer
  joueurs(key) { return fouilles.presents(key).filter((n) => (n.d.age || 30) >= 16 && !n.talking && !(n.st.anger > 0)); },

  // ================================================================ les dés (le passe-dix)
  adversaire() {
    const L = this.joueurs('auberge');
    if (!L.length) return null;
    return L.find((n) => n.d.id !== 'aubergiste') || L[0];
  },
  jouerDes(n, jeu) {
    const s = farm.s, A = this.S(), h = this.h();
    jeu = jeu || 'des';
    if (h < 9 || h >= 23.5) { ui.subtitle('', '(Les dés dorment dans leur gobelet. Les joueurs aussi.)', 3); return; }
    n = n || this.adversaire();
    if (!n) { ui.subtitle('', jeu === 'des' ? '(Personne pour jouer. Les dés attendent dans leur gobelet.)' : '(Personne pour jouer. Le jeu de cartes attend, corné, sur la table.)', 3); return; }
    const J = ACT_JEU[n.d.id] || ACT_JEU._;
    if (J.refus && !J.oui) { npcs.say(n, J.refus, 3); return; }
    if (npcs.murdererKnown()) { npcs.say(n, 'Jouer avec vous ? … Non. Non merci.', 3); return; }
    if (A.tricheur !== undefined && s.day - A.tricheur < 3) { npcs.say(n, 'Avec vous ? Plus jamais. On sait ce que vous avez dans les poches.', 3.5); return; }
    if (this.fait(jeu) >= 6) { npcs.say(n, 'Assez joué pour aujourd’hui. L’aubergiste nous regarde de travers.', 3); return; }
    if (s.money < 5) { npcs.say(n, 'Sans mise, on ne joue pas. C’est la règle. La seule.', 3); return; }
    npcs.say(n, J.oui || ACT_JEU._.oui, 3);
    n.heading = Math.atan2(game.player.pos[0] - n.x, game.player.pos[2] - n.z);
    this.mise(n, jeu);
  },
  mise(n, jeu) {
    const s = farm.s, opts = [];
    for (const m of [5, 10, 20]) if (s.money >= m) opts.push({ label: `Miser ${m} pièces`, fn: () => (jeu === 'des' ? this.lancerDes(n, m, false) : this.donne(n, m)) });
    if (jeu === 'des' && farm.count('des_pipes')) for (const m of [10, 20]) if (s.money >= m) opts.push({ label: `Miser ${m} pièces, avec vos dés à vous`, fn: () => this.lancerDes(n, m, true) });
    opts.push({ label: 'Laisser', fn: () => ui.close() });
    ui.choice(jeu === 'des' ? 'Le passe-dix' : 'Le vingt-et-un', jeu === 'des' ? `Contre ${this.nom(n)}. Trois dés chacun : le plus gros total gagne. Vous avez ${s.money} pièces.` : `Contre ${this.nom(n)}. Approchez-vous de vingt et un sans le dépasser. Les figures valent dix, l’as un ou onze. Vous avez ${s.money} pièces.`, opts);
  },
  lancerDes(n, m, pipes) {
    const s = farm.s, A = this.S(), J = ACT_JEU[n.d.id] || ACT_JEU._, F = '⚀⚁⚂⚃⚄⚅';
    if (!farm.pay(m)) { ui.close(); return; }
    this.marquer('des');
    sound.desSon && sound.desSon();
    const de = (bon) => { const a = 1 + ((Math.random() * 6) | 0); return bon ? Math.max(a, 1 + ((Math.random() * 6) | 0)) : a; };
    let a, b, relances = 0;
    do { a = [de(pipes), de(pipes), de(pipes)]; b = [de(), de(), de()]; relances++; } while (a[0] + a[1] + a[2] === b[0] + b[1] + b[2] && relances < 4);
    const ta = a[0] + a[1] + a[2], tb = b[0] + b[1] + b[2], gagne = ta > tb, egal = ta === tb;
    let desc = `Vous : ${a.map((v) => F[v - 1]).join(' ')} = ${ta}. ${this.nom(n)} : ${b.map((v) => F[v - 1]).join(' ')} = ${tb}. `;
    if (egal) { farm.earn(m); desc += 'Égalité, encore : chacun reprend sa mise.'; }
    else if (gagne) { farm.earn(m * 2); desc += `Gagné : ${m} pièces.`; sound.coin && sound.coin(); npcs.say(n, J.perd || ACT_JEU._.perd, 3); }
    else { desc += `Perdu : ${m} pièces.`; npcs.say(n, J.gagne || ACT_JEU._.gagne, 3); }
    if (this.fait('amitie_jeu:' + n.id) < 3) { npcs.addAmitie(n, gagne ? 2 : 5); this.marquer('amitie_jeu:' + n.id); }
    this.esprit(0.3, 'jeu', 0.9);
    // les dés pipés se remarquent, parfois
    if (pipes && Math.random() < 0.2) {
      A.tricheur = s.day;
      if (gagne && farm.pay(m)) desc += ' (On vous reprend le gain.)';
      npcs.say(n, pick(ACT_TRICHE), 3.5);
      npcs.addAmitie(n, -80); n.st.anger = Math.max(n.st.anger || 0, 2); npcs.remember(n, 'tricheur');
      for (const o of this.joueurs('auberge')) if (o !== n) npcs.addAmitie(o, -20);
      this.esprit(-1, 'tricher', 2);
      ui.choice('Le passe-dix', desc + ' Tricheur ! Toute la salle vous regarde.', [{ label: 'Partir, vite', fn: () => ui.close() }]);
      return;
    }
    const opts = [];
    if (this.fait('des') < 6 && s.money >= m) opts.push({ label: `Rejouer (${m} pièces)`, fn: () => this.lancerDes(n, m, pipes) });
    opts.push({ label: 'Arrêter là', fn: () => ui.close() });
    ui.choice('Le passe-dix', desc, opts);
  },

  // ================================================================ le vingt-et-un
  carte() { const v = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'V', 'D', 'R'][(Math.random() * 13) | 0], c = '♠♥♦♣'[(Math.random() * 4) | 0]; return { v, c }; },
  valeur(main) { let t = 0, as = 0; for (const k of main) { if (k.v === 'A') { as++; t += 11; } else if (['V', 'D', 'R'].includes(k.v)) t += 10; else t += +k.v; } while (t > 21 && as) { t -= 10; as--; } return t; },
  txt(main) { return main.map((k) => k.v + k.c).join(' '); },
  donne(n, m) {
    if (!farm.pay(m)) { ui.close(); return; }
    this.marquer('cartes');
    sound.page && sound.page();
    const P = { n, m, moi: [this.carte(), this.carte()], lui: [this.carte(), this.carte()] };
    this.main21(P);
  },
  main21(P) {
    const t = this.valeur(P.moi);
    if (t >= 21) return this.fin21(P);
    ui.choice('Le vingt-et-un', `Vos cartes : ${this.txt(P.moi)} (${t}). ${this.nom(P.n)} montre : ${P.lui[0].v + P.lui[0].c}.`, [
      { label: 'Tirer une carte', fn: () => { P.moi.push(this.carte()); sound.page && sound.page(); this.main21(P); } },
      { label: 'S’arrêter là', fn: () => this.fin21(P) },
    ]);
  },
  fin21(P) {
    const s = farm.s, J = ACT_JEU[P.n.d.id] || ACT_JEU._, t = this.valeur(P.moi);
    if (t <= 21) while (this.valeur(P.lui) < 17) P.lui.push(this.carte());
    const u = this.valeur(P.lui);
    let desc = `Vous : ${this.txt(P.moi)} (${t}). ${this.nom(P.n)} : ${this.txt(P.lui)} (${u}). `;
    let gagne = false;
    if (t > 21) desc += 'Vous dépassez : perdu.';
    else if (u > 21 || t > u) { gagne = true; const g = t === 21 && P.moi.length === 2 ? Math.round(P.m * 2.5) : P.m * 2; farm.earn(g); desc += `Gagné : ${g - P.m} pièces.`; sound.coin && sound.coin(); }
    else if (t === u) { farm.earn(P.m); desc += 'Égalité : chacun reprend sa mise.'; }
    else desc += 'Perdu.';
    npcs.say(P.n, gagne ? (J.perd || ACT_JEU._.perd) : (J.gagne || ACT_JEU._.gagne), 3);
    if (this.fait('amitie_jeu:' + P.n.id) < 3) { npcs.addAmitie(P.n, gagne ? 2 : 5); this.marquer('amitie_jeu:' + P.n.id); }
    this.esprit(0.3, 'jeu', 0.9);
    const opts = [];
    if (this.fait('cartes') < 6 && s.money >= P.m) opts.push({ label: `Une autre main (${P.m} pièces)`, fn: () => this.donne(P.n, P.m) });
    opts.push({ label: 'Arrêter là', fn: () => ui.close() });
    ui.choice('Le vingt-et-un', desc, opts);
  },

  // ================================================================ le bras de fer
  forceJoueur() {
    const p = game.player;
    let k = 0.75 + clamp((p.food ?? 80) / 100, 0, 1) * 0.35;
    if (BUFF.on && BUFF.on('force')) k *= 1.5;
    if (typeof corps !== 'undefined' && corps.jambeCassee && corps.jambeCassee()) k *= 0.85;
    try { if (typeof alcool !== 'undefined' && alcool.niveau && alcool.niveau() >= 2) k *= 0.85; } catch (e) { /* rien */ }
    return k;
  },
  brasDeFer(n) {
    const J = ACT_BRAS[n.d.id] || ACT_BRAS._;
    if (this.fait('bras:' + n.id)) { npcs.say(n, 'Encore ? Demain. Mon bras a une mémoire, lui aussi.', 3); return 'keep'; }
    this.marquer('bras:' + n.id);
    npcs.say(n, J.oui, 2.5);
    const E = this.brasEtat = { g: 50, t: 0, fini: false, n, f: J.f || 1, k: this.forceJoueur() };
    ui.open('#choice', `<h3>Bras de fer</h3><div class="desc">${esc('Contre ' + this.nom(n) + '. Poussez, vite, plusieurs fois (clic, E ou Espace) : amenez son poing jusqu’à la table.')}</div><div class="f2a-jauge"><b style="left:50%"></b></div><div class="opts"><button data-i="0"><kbd>1</kbd> ${esc('Pousser !')}</button></div>`);
    this.style();
    const pousser = () => { if (!E.fini) { E.g += 6 * E.k; sound.swish && sound.swish(0.3); } };
    E.pousser = pousser;
    ui.choiceOpts = [{ fn: pousser }];
    const b = $('#choice [data-i="0"]'); if (b) b.onclick = pousser;
    const key = (e) => { if (e.code === 'KeyE' || e.code === 'Space') { e.preventDefault(); pousser(); } };
    window.addEventListener('keydown', key);
    const iv = setInterval(() => {
      const ouvert = ui.panel === '#choice';
      E.t += 0.05;
      E.g -= E.f * 16 * 0.05 * (0.75 + 0.5 * Math.abs(Math.sin(E.t * 2.1)));
      const j = $('#choice .f2a-jauge b'); if (j) j.style.left = clamp(E.g, 0, 100) + '%';
      if (!ouvert || E.g >= 100 || E.g <= 0 || E.t > 12) {
        clearInterval(iv); window.removeEventListener('keydown', key);
        if (!E.fini) { E.fini = true; this.finBras(E, ouvert && E.g > 50); }
      }
    }, 50);
    return 'keep';
  },
  finBras(E, gagne) {
    const n = E.n, J = ACT_BRAS[n.d.id] || ACT_BRAS._;
    E.gagne = gagne;
    if (gagne) { npcs.say(n, J.perd, 4); npcs.addAmitie(n, 25); this.esprit(1, 'bras de fer', 1); sound.applaudir && sound.applaudir(); }
    else { npcs.say(n, J.gagne, 3.5); npcs.addAmitie(n, 8); play.hurt && game.player.hp > 10 && play.hurt(2, null, 'Le poignet tordu au bras de fer'); }
    if (ui.panel === '#choice') ui.choice('Bras de fer', gagne ? `Le poing de ${this.nom(n)} touche la table. Gagné.` : `Votre poing touche la table. ${this.nom(n)} a gagné.`, [{ label: 'Se frotter le poignet', fn: () => ui.close() }]);
  },

  // ================================================================ la tournée
  tournee(au) {
    const s = farm.s, L = this.joueurs('auberge').filter((n) => n !== au), prix = Math.max(8, 4 * (L.length + 1));
    if (this.fait('tournee')) return talk.view('Une tournée par jour, c’est déjà bien. Deux, ce serait de la politique.', talk.options());
    if (!farm.pay(prix)) return talk.view(`Une tournée, c’est ${prix} pièces. Vous ne les avez pas. Je vous sers de l’eau ? Elle est gratuite. Et triste.`, talk.options());
    this.marquer('tournee');
    sound.coin && sound.coin();
    npcs.addAmitie(au, 10);
    L.forEach((n, i) => { npcs.addAmitie(n, 20); setTimeout(() => { if (n.st.alive) npcs.say(n, pick(ACT_TOURNEE), 2.5); }, 900 + i * 1500); });
    const bavard = L.find((n) => n.d.lines && n.d.lines.rumeurs && n.d.lines.rumeurs.length);
    if (bavard) setTimeout(() => { if (bavard.st.alive) npcs.say(bavard, pick(bavard.d.lines.rumeurs), 6); }, 1200 + L.length * 1500);
    this.esprit(1.5, 'tournée', 1.5);
    return talk.view(L.length ? `Une tournée ! Pour tout le monde ! … ${prix} pièces, merci bien. Ça, c’est une soirée qui commence comme il faut.` : `Une tournée ? Il n’y a que vous et moi. Bon. À la nôtre, alors. ${prix} pièces.`, talk.options());
  },

  // ================================================================ la veillée du Veilledi
  veilleeOuverte() { const h = this.h(); return cal.is('veillee') && h >= 18.5 && h < 24; },
  veillee() {
    if (!this.veilleeOuverte()) { ui.subtitle('', '(Le feu crépite. Les contes, c’est le Veilledi soir.)', 3); return; }
    if (this.fait('veillee')) { ui.subtitle('', '(Vous avez eu votre conte. Les autres somnolent, le menton dans la main.)', 3); return; }
    this.marquer('veillee');
    const L = this.joueurs('auberge');
    const conteur = L.slice().sort((a, b) => (b.d.age || 30) - (a.d.age || 30))[0] || npcs.byId.aubergiste;
    const C = ACT_CONTES[Math.floor(farm.s.day / 12) % ACT_CONTES.length];
    for (const n of L) npcs.addAmitie(n, 5);
    this.esprit(2, 'veillée', 2);
    ui.read(C.t, C.x, conteur && conteur.st.alive ? `Conté par ${conteur.st.met ? conteur.name : conteur.d.role.toLowerCase()}, à la veillée.` : 'Conté à la veillée.');
  },

  // ================================================================ le tableau des petits travaux
  travauxDuJour() {
    const s = farm.s, rnd = mulberry32(((s.seed | 0) * 31 + s.day * 977) >>> 0), out = [];
    const pool = ACT_APPORTER.slice();
    const tirer = () => pool.splice((rnd() * pool.length) | 0, 1)[0];
    const a = tirer(); out.push({ i: 0, t: 'apporter', need: a[0], n: a[1], txt: a[2], pay: a[3] });
    const vivants = npcs.list.filter((n) => n.st.alive && !n.d.nomade && n.d.id !== 'maire' && (n.d.age || 30) >= 16 && ['ville', 'hameau', 'lac', 'foret'].includes(n.d.area));
    if (vivants.length && rnd() < 0.8) { const n = vivants[(rnd() * vivants.length) | 0]; out.push({ i: 1, t: 'livrer', to: n.id, txt: ACT_LIVRER[(rnd() * ACT_LIVRER.length) | 0], pay: 22 + ((rnd() * 4) | 0) * 5 }); }
    else { const b = tirer(); out.push({ i: 1, t: 'apporter', need: b[0], n: b[1], txt: b[2], pay: b[3] }); }
    const w = game.world, bancs = w.props.filter((q) => q.id === 'banc' && w.townInfo && Math.abs(q.x - w.townInfo.x) < 46 && Math.abs(q.z - w.townInfo.z) < 46);
    if (rnd() < 0.5 && bancs.length) { const q = bancs[(rnd() * bancs.length) | 0]; out.push({ i: 2, t: 'reparer', x: q.x, y: q.y, z: q.z, txt: 'Réparer un banc de la ville : le dossier ne tient plus. Deux bûches, un peu d’huile de coude.', pay: 32 }); }
    else if (w.bld.eglise) { const e = w.bld.eglise, o = w.nav.nodes[e.nOut]; out.push({ i: 2, t: 'balayer', x: o.x, y: w.heightAt(o.x, o.z), z: o.z, txt: 'Balayer le parvis de l’église. Le curé dit que les feuilles y reviennent toutes seules.', pay: 20 }); }
    return out;
  },
  compte(k) { return ITEM_GROUPS[k] ? ITEM_GROUPS[k].reduce((a, id) => a + farm.count(id), 0) : farm.count(k); },
  prendre(k, n) { if (!ITEM_GROUPS[k]) return farm.take(k, n); let r = n; for (const id of ITEM_GROUPS[k]) { const c = Math.min(r, farm.count(id)); if (c) { farm.take(id, c); r -= c; } if (!r) break; } return r === 0; },
  nomBesoin(k) { return k === 'poisson' ? 'poissons' : itemName(k).toLowerCase(); },
  TR() { const A = this.S(); if (!A.travaux || A.travaux.j !== farm.s.day) A.travaux = { j: farm.s.day, pris: {}, faits: {} }; return A.travaux; },
  travaux() {
    const J = this.travauxDuJour(), TR = this.TR(), opts = [];
    let desc = 'Le tableau de la mairie. Trois papiers punaisés, de la main du secrétaire : « Travaux du jour — payés par la commune. »';
    for (const j of J) {
      const txt = j.t === 'livrer' ? j.txt.replace('{npc}', npcs.nameOf(j.to)) : j.txt;
      if (TR.faits[j.i]) { desc += `\n— ${txt} (fait)`; continue; }
      if (!TR.pris[j.i]) { opts.push({ label: `${txt} — ${j.pay} pièces`, fn: () => { this.accepter(j); this.travaux(); } }); continue; }
      if (j.t === 'apporter') {
        const c = this.compte(j.need);
        if (c >= j.n) opts.push({ label: `Déposer : ${j.n} ${this.nomBesoin(j.need)} (${j.pay} pièces)`, fn: () => { if (this.prendre(j.need, j.n)) this.payer(j); this.travaux(); } });
        else desc += `\n— En cours : ${txt} (vous en avez ${c} sur ${j.n})`;
      } else desc += `\n— En cours : ${txt}`;
    }
    opts.push({ label: 'Partir', fn: () => ui.close() });
    ui.choice('Les petits travaux', desc, opts);
  },
  accepter(j) {
    const TR = this.TR();
    TR.pris[j.i] = 1;
    if (j.t === 'livrer') { if (!farm.count('pli_mairie')) farm.give('pli_mairie', 1); TR.pli = { to: j.to, i: j.i, pay: j.pay }; ui.subtitle('', `(Vous décrochez le pli. Il est pour ${npcs.nameOf(j.to)}.)`, 3); }
    if (j.t === 'reparer' || j.t === 'balayer') this.marqueurs();
    sound.page && sound.page();
  },
  payer(j) {
    const TR = this.TR();
    TR.faits[j.i] = 1;
    farm.earn(j.pay); sound.coin && sound.coin();
    const m = npcs.byId.maire;
    if (m && m.st.alive) npcs.addAmitie(m, 8);
    this.esprit(1, 'travail utile', 3);
    ui.subtitle('', `(La commune vous doit ${j.pay} pièces. Elle paie, pour une fois.)`, 3);
    this.marqueurs();
  },
  // les endroits où travailler (banc à réparer, parvis à balayer) : des interactions posées à la demande
  marqueurs() {
    const w = game.world;
    if (!w || !farm.s) return;
    w.inter = w.inter.filter((i) => i.kind !== 'f2a_job');
    const TR = this.TR();
    for (const j of this.travauxDuJour()) if ((j.t === 'reparer' || j.t === 'balayer') && TR.pris[j.i] && !TR.faits[j.i]) w.inter.push({ kind: 'f2a_job', id: 'f2a:job:' + j.i, x: j.x, y: j.y + 0.6, z: j.z, name: j.t === 'reparer' ? 'Réparer le banc' : 'Balayer le parvis', data: { i: j.i, t: j.t } });
  },
  travailler(it) {
    const j = this.travauxDuJour().find((q) => q.i === it.data.i), TR = this.TR();
    if (!j || TR.faits[j.i]) return;
    if (j.t === 'reparer' && farm.count('bois') < 2) { ui.subtitle('', '(Il faudrait deux bûches pour caler le dossier.)', 3); return; }
    if (j.t === 'reparer') farm.take('bois', 2);
    game.sleeping = true;
    ui.fade(true, j.t === 'reparer' ? 'Vous calez, vous clouez, vous jurez un peu…' : 'Vous balayez. Les feuilles reviennent. Vous balayez encore…', 700).then(() => {
      const w = game.world; w.time = Math.min(w.time + 0.5 / 24, 0.99); game.lastT = w.time;
      setTimeout(() => ui.fade(false, '', 700).then(() => { game.sleeping = false; this.payer(j); }), 900);
    });
  },
  livrerPli(n) {
    const TR = this.TR(), P = TR.pli;
    if (!P || P.to !== n.id || !farm.count('pli_mairie')) return null;
    farm.take('pli_mairie', 1); TR.pli = null;
    npcs.addAmitie(n, 10);
    this.payer({ i: P.i, pay: P.pay });
    return talk.view(pick(['Un pli de la mairie ? Pour moi ? … Encore une taxe, je parie. Merci quand même.', 'Ah. La mairie. Merci de la course. Ce n’est pas vous qui l’avez écrit, au moins ?', 'Posez-le là. Je le lirai quand j’aurai le courage.']), talk.options());
  },

  // ================================================================ le puits aux souhaits
  voeu() {
    const s = farm.s, p = game.player;
    if (this.fait('voeu')) { ui.subtitle('', '(Le puits vous a déjà écouté aujourd’hui. Il n’écoute qu’une fois.)', 3); return; }
    if (s.money < 1) { ui.subtitle('', '(Il faudrait au moins une pièce.)', 2.5); return; }
    const faire = (k, fn) => () => {
      ui.close();
      if (!farm.pay(1)) return;
      this.marquer('voeu');
      sound.coin && sound.coin();
      setTimeout(() => { sound.splash && sound.splash(); }, 700);
      const r = Math.random();
      if (r < 0.05) { farm.earn(1); ui.subtitle('', ACT_VOEU.refus, 4); return; }
      if (r < 0.08) { sound.whisper && sound.whisper(0, 0.5); ui.subtitle('', ACT_VOEU.nom, 4); this.esprit(-0.5, 'le puits', 1); return; }
      fn(); ui.subtitle('', ACT_VOEU[k], 4); this.esprit(0.5, 'un vœu', 1);
    };
    const opts = [
      { label: 'Pour la fortune', fn: faire('fortune', () => BUFF.add && BUFF.add('chance', 6)) },
      { label: 'Pour la santé', fn: faire('sante', () => { p.hp = Math.min(100, (p.hp || 100) + 15); if (typeof corps !== 'undefined' && corps.saignement && corps.saignement() < 0.3) corps.panser(); }) },
      { label: 'Pour l’amour', fn: faire('amour', () => { const c = npcs.list.filter((n) => n.st.alive && n.st.met && typeof sentiments !== 'undefined' && sentiments.candidat && sentiments.candidat(n)).sort((a, b) => (b.st.amitie || 0) - (a.st.amitie || 0))[0]; if (c) npcs.addAmitie(c, 12); }) },
      { label: 'Que les nuits rouges cessent', fn: faire('nuits', () => { sound.whisper && sound.whisper(0, 0.4); }) },
    ];
    const morts = (s.dead || []).filter((d) => s.day - d.day <= 12);
    if (morts.length) opts.push({ label: `Pour ${morts[morts.length - 1].name}, qui n’est plus`, fn: faire('mort', () => this.esprit(1.5, 'un vœu pour un mort', 1.5)) });
    opts.push({ label: 'Garder sa pièce', fn: () => ui.close() });
    ui.choice('Le puits de la place', 'Une pièce, un vœu. On dit que le puits exauce, parfois. On dit aussi qu’il garde les pièces, et le reste.', opts);
  },

  // ================================================================ la diseuse de bonne aventure
  diseusePresente() { const h = this.h(), k = this.cle(); return (k === 'marche' || k === 'veillee' || k === 'morts') && h >= 9 && h < 19; },
  lectures() {
    const s = farm.s, d0 = s.day, urg = [], perso = [];
    const quand = (d) => (d === d0 ? 'Ce soir' : d === d0 + 1 ? 'Demain' : 'Le ' + cal.nom(d));
    const E = typeof evenements !== 'undefined' ? evenements : null;
    if (strange.s && strange.s.redTonight && !strange.s.red) urg.push(['La Lune rouge', 'Cette nuit, la lune saignera. Dormez chez vous, les volets clos, et si l’on vous appelle par votre nom, ne répondez pas.']);
    if (E) {
      const vu = {};
      for (let d = d0; d < d0 + 7; d++) {
        let J = null; try { J = E.jour(d); } catch (e) { J = null; }
        if (!J) continue;
        if (J.nuitNoire && !vu.n) { vu.n = 1; urg.push(['La Nuit sans étoiles', `${quand(d)}, le ciel se retirera. Pas une étoile. Gardez une lumière, et ne répondez pas aux voix.`]); }
        if (J.tueur && !vu.t) { vu.t = 1; urg.push(['L’Homme au manteau', `${quand(d)}, un homme sans visage marchera sur les routes. Restez sur votre seuil, et s’il demande le chemin, mentez.`]); }
        if (J.neige && !vu.g) { vu.g = 1; urg.push(['Le Givre', `${quand(d)}, le froid descendra des Monts jusque dans les prés. Rentrez du bois. Beaucoup de bois.`]); }
        if (J.soleil && !vu.s) { vu.s = 1; urg.push(['Le Soleil noir', `${quand(d)}, un soleil qu’il ne faut pas regarder. Ceux qui le regardent en gardent une tache. Ici. (Elle touche votre œil.)`]); }
        if (J.tornade !== null && J.tornade !== undefined && J.tornade !== false && !vu.v) { vu.v = 1; urg.push(['La Trombe', `${quand(d)}, le vent tournera sur lui-même, et il emportera ce qui n’est pas attaché. Vous compris.`]); }
      }
    }
    if (strange.killerPhase && strange.killerPhase() >= 1 && strange.s && ACT_MASQUE[strange.s.killer] && Math.random() < 0.6) urg.push(['Le Masque', `Quelqu’un qui vous sourit porte deux visages. Je vois ${ACT_MASQUE[strange.s.killer]}. Je ne vois pas plus. Je ne veux pas voir plus.`]);
    try {
      const P = weather.dayPlan(s.seed, d0 + 1);
      const M = P.storm ? ['La Cloche', 'Demain, le ciel frappera. Rentrez les bêtes avant la cloche de midi.'] : P.frost ? ['Le Givre', 'Demain à l’aube, les prés seront blancs. Couvrez ce qui pousse.'] : P.rain ? ['La Cruche', 'Demain, l’eau. Elle lavera ce qu’on a laissé dehors.'] : P.plan.some((q) => q[1] === 'fog') ? ['Le Voile', 'Demain matin, on ne verra pas plus loin que sa main. Ceux qui marchent dans le blanc ne sont pas tous d’ici.'] : P.heat ? ['Le Four', 'Demain, la chaleur. Buvez, et ne dormez pas au soleil.'] : ['L’Étoile', 'Demain, le ciel sera clair. Un bon jour pour ce qui pousse, et pour ce qui marche.'];
      perso.push(M);
    } catch (e) { /* rien */ }
    try {
      if (typeof esprit !== 'undefined' && esprit.niveau && esprit.niveau() < 35) perso.unshift(['Le Puits', 'Une ombre marche à côté de vous. Elle a votre pas. Elle n’est pas encore vous.']);
      if (typeof societe !== 'undefined' && societe.recherche && societe.recherche()) perso.unshift(['L’Affiche', 'Votre visage est cloué sur des portes. Les gens le regardent plus que vous ne le faites.']);
      if (typeof sentiments !== 'undefined' && sentiments.conjoint && sentiments.conjoint()) perso.push(['Le Cœur', 'Quelqu’un vous attend, le soir, et compte vos pas sur le chemin. Gardez-le. Ça ne se trouve pas deux fois.']);
      if (typeof malediction !== 'undefined' && malediction.a && malediction.a()) perso.unshift(['La Chaîne', 'Quelque chose vous colle à la peau, et ce n’est pas de la poussière. Cherchez qui peut défaire ce qui a été fait.']);
      if (typeof meurtresDuJoueur === 'function' && meurtresDuJoueur() > 0) perso.unshift(['Le Couteau', 'Vous avez du sang sur les mains. Pas sur la peau : dessous.']);
    } catch (e) { /* rien */ }
    const gen = ACT_ARCANES.slice().sort(() => Math.random() - 0.5);
    const out = urg.slice(0, 2);
    for (const q of perso) if (out.length < 3) out.push(q);
    for (const q of gen) if (out.length < 3) out.push(q);
    return out;
  },
  diseuse() {
    const s = farm.s;
    if (!this.diseusePresente()) { ui.subtitle('', '(La tente est fermée. Un ruban noir noue les pans. Un écriteau : « Marchedi, Veilledi, Vorndi. De neuf heures au soir. »)', 4.5); return; }
    if (this.fait('diseuse')) { ui.subtitle(ACT_NOMS.diseuse, ACT_DISEUSE.deja, 3); return; }
    if (s.money < 10) { ui.subtitle(ACT_NOMS.diseuse, ACT_DISEUSE.pauvre, 3.5); return; }
    ui.choice('La tente de la diseuse', 'Une odeur de cire et de cannelle. Une vieille femme aux mains couvertes de bagues bat un jeu de cartes usé jusqu’à la trame. « Dix pièces, et ce que les cartes voudront bien dire. »', [
      { label: 'Donner dix pièces et tendre la main', fn: () => {
        if (!farm.pay(10)) { ui.close(); return; }
        this.marquer('diseuse'); sound.coin && sound.coin();
        const L = this.lectures();
        ui.read('Les cartes de Mère Ysaure', pick(ACT_DISEUSE.accueil) + '\n\n' + L.map(([t, x], i) => `${['Première', 'Deuxième', 'Troisième'][i]} carte : ${t}.\n${x}`).join('\n\n') + '\n\n' + pick(ACT_DISEUSE.fin), 'Mère Ysaure, diseuse de bonne aventure');
        sound.page && sound.page();
      } },
      { label: 'Ressortir', fn: () => ui.close() },
    ]);
  },

  // ================================================================ le crieur public
  crieurPresent() { const h = this.h(); return !cal.is('chome') && ((h >= 8 && h < 8.8) || (h >= 17 && h < 17.8)); },
  nouvelles() {
    const s = farm.s, out = [], j = cal.jour(), dm = cal.jour(s.day + 1).cle;
    out.push(`Oyez, oyez, braves gens ! Nous sommes ${j.nom}, jour ${s.day}.`);
    const an = cal.annonce().replace(/^\(|\)$/g, '');
    if (an) out.push(an);
    try { const k = weather.tomorrow(); out.push({ soleil: 'Demain, du beau temps, à ce qu’on dit.', pluie: 'Demain, de la pluie : rentrez le foin.', orage: 'Demain, de l’orage : rentrez les bêtes.', gel: 'Demain à l’aube, du gel : couvrez les semis.', brouillard: 'Demain matin, du brouillard : ne vous écartez pas des chemins.' }[k] || 'Demain, le temps qu’il plaira au ciel.'); } catch (e) { /* rien */ }
    const dem = { marche: 'Demain, grand marché sur la place, avec les étals des Monts !', foire: `Demain, foire à ${farm.names.hameau}, avec la tombola ! Billets à huit pièces.`, chasse: 'Demain, Chassedi : concours de tir au relais de chasse ! Et portez du rouge en forêt.', peche: 'Demain, Pêchedi : concours de pêche au ponton du lac !', veillee: 'Demain soir, veillée à l’auberge : on contera.', messe: 'Demain, messe à dix heures en l’église.', morts: 'Demain, Vorndi, jour des morts : fleurissez vos tombes, et rentrez avant la nuit.' }[dm];
    if (dem) out.push(dem);
    for (const d of (s.dead || []).filter((q) => s.day - q.day <= 2)) { const n = npcs.byId[d.id]; const qui = d.name + (n ? ' ' + n.d.surname : ''); out.push(n && n.d.gender === 'f' ? `Avis de décès : ${qui}. Priez pour elle.` : `Avis de décès : ${qui}. Priez pour lui.`); }
    const de = (t) => (/^une? /.test(t) ? 'd’' + t : /^le /.test(t) ? 'du ' + t.slice(3) : /^du /.test(t) ? 'de ' + t.slice(3) : 'de ' + t);
    try { if (typeof societe !== 'undefined' && societe.recherche) { const R = societe.recherche(); if (R && R.villages.includes('valbrume')) out.push(`Avis de recherche : on recherche l’auteur ${societe.actifs().filter((C) => societe.connait(C, 'valbrume')).map((C) => de(societe.libelle(C))).join(', ')}. Prime : ${R.prime} pièces !`); } } catch (e) { /* rien */ }
    try { if (typeof evenements !== 'undefined') { const r = (evenements.S().recents || []).filter((q) => q.d >= s.day - 1 && EV_LIGNES[q.id] && EV_LIGNES[q.id].apres); if (r.length) out.push(pick(EV_LIGNES[r[r.length - 1].id].apres)); } } catch (e) { /* rien */ }
    if (typeof fouilles !== 'undefined' && fouilles.S() && Object.keys(fouilles.S().plaintes).length) out.push('Des vols ont été signalés en ville. Fermez vos portes, et vos tiroirs.');
    out.push('La mairie offre des petits travaux, payés : voyez le tableau.');
    const rnd = mulberry32(((s.seed | 0) * 7 + s.day * 131) >>> 0);
    out.push(ACT_PERDU[(rnd() * ACT_PERDU.length) | 0]);
    const bav = npcs.list.filter((n) => n.st.alive && n.d.lines && n.d.lines.rumeurs && n.d.lines.rumeurs.length);
    if (bav.length) { const n = bav[(rnd() * bav.length) | 0]; out.push('Et l’on dit, sur la place, que… ' + fmtLine(n.d.lines.rumeurs[(rnd() * n.d.lines.rumeurs.length) | 0], n)); }
    out.push('C’est tout pour aujourd’hui ! Rentrez avant les ponts !');
    return out;
  },
  crier() {
    const A = this.S(), L = this.nouvelles();
    sound.tambour && sound.tambour();
    this.parleT = 1.2 + L.length * 3.6;
    L.forEach((t, i) => setTimeout(() => { if (!game.dying) ui.subtitle(ACT_NOMS.crieur, t, 3.6); }, 900 + i * 3600));
    A.crie = (A.crie || 0) + 1;
  },
  lireNouvelles() { ui.read('Les nouvelles du jour', this.nouvelles().join('\n\n'), ACT_NOMS.crieur); sound.tambour && sound.tambour(); },

  // ================================================================ le violoneux
  violonPresent() { const h = this.h(), k = this.cle(); return k !== 'chome' && k !== 'morts' && ((h >= 10 && h < 12.5) || (h >= 16 && h < 19.5)) && !(game.sky && game.sky.wet > 0.3); },
  pourboire() {
    const s = farm.s;
    ui.choice(ACT_NOMS.violon, 'Il joue les yeux fermés, un pied qui bat la mesure. Son chapeau, à ses pieds, contient trois boutons et une pièce.', [
      ...[1, 2, 5].filter((m) => s.money >= m).map((m) => ({ label: `Lui donner ${m} pièce${m > 1 ? 's' : ''}`, fn: () => {
        ui.close(); if (!farm.pay(m)) return;
        sound.coin && sound.coin();
        ui.subtitle(ACT_NOMS.violon, pick(ACT_VIOLON), 5);
        if (!this.fait('pourboire')) { this.marquer('pourboire'); this.esprit(0.5 + m * 0.1, 'musique', 1); const V = game.world.act && game.world.act.violon; if (V) for (const n of npcs.list) if (n.st.alive && Math.hypot(n.x - V.x, n.z - V.z) < 12) npcs.addAmitie(n, 3); }
        this.air = 'complainte'; this.musique = null;
      } })),
      { label: 'Écouter, simplement', fn: () => ui.close() },
    ]);
  },
  // le violon : une mélodie jouée tant qu'on est à portée (volume selon la distance)
  jouerMusique(dt) {
    const V = game.world.act && game.world.act.violon, p = game.player;
    const d = V ? Math.hypot(p.pos[0] - V.x, p.pos[2] - V.z) : 1e9;
    const present = !!V && this.violonPresent() && d < 34 && !p.underground;
    // l'écouter apaise
    if (present && d < 9) {
      const A = this.S();
      A.ecoute = (A.ecoute || 0) + dt;
      if (A.ecoute >= 20 && !this.fait('ecoute1')) { this.marquer('ecoute1'); this.esprit(1, 'musique', 2); ui.subtitle('', '(La musique vous détend les épaules. Vous ne saviez pas qu’elles étaient si serrées.)', 3.5); if (strange.fear) strange.fear = Math.max(0, strange.fear * 0.5); }
      if (A.ecoute >= 60 && !this.fait('ecoute2')) { this.marquer('ecoute2'); this.esprit(1, 'musique', 2); }
    }
    const on = present && sound.ok && sound.ctx;
    const M = this.musique;
    if (!on) { if (M && M.g) { try { M.g.gain.setTargetAtTime(0, sound.ctx.currentTime, 0.3); } catch (e) { /* rien */ } } this.musique = null; return; }
    let m = M;
    if (!m) { const g = sound.ctx.createGain(); g.gain.value = 0; g.connect(sound.sfx); m = this.musique = { g, t: sound.ctx.currentTime + 0.1, i: 0, air: this.air || 'gigue' }; }
    m.g.gain.setTargetAtTime(clamp(1 - d / 34, 0, 1) * 0.85, sound.ctx.currentTime, 0.2);
    const AIR = ACT_AIRS[m.air] || ACT_AIRS.gigue, now = sound.ctx.currentTime;
    while (m.t < now + 0.3) {
      const [f, n] = AIR.notes[m.i], dur = n * AIR.tempo;
      if (f) sound.voice(m.t, 'sawtooth', f, f * 1.002, dur * 0.95, 0.05, m.g, { vib: 5.5, vibDepth: f * 0.012, lp: 2600 });
      m.t += dur; m.i++;
      if (m.i >= AIR.notes.length) { m.i = 0; m.t += 0.8; if (m.air === 'complainte') { m.air = 'gigue'; this.air = 'gigue'; } }
    }
  },

  // ================================================================ le clocher
  clocher() {
    const h = this.h(), w = game.world, C = w.act && w.act.clocher;
    if (!C) return;
    if (h < 7 || h >= 20) { ui.subtitle('', '(La porte de l’escalier est fermée à clé. Le curé la rouvre au matin.)', 3); return; }
    if (cal.is('messe') && h >= 9.8 && h < 11.6) { ui.subtitle('', '(Pas pendant la messe. La cloche va sonner, et vous seriez dessous.)', 3); return; }
    if (this.fait('clocher')) { ui.subtitle('', '(Vos mollets se souviennent des cent douze marches. Une fois par jour suffit.)', 3); return; }
    if (typeof cine === 'undefined' || !cine.jouer) return;
    this.marquer('clocher');
    const y = C.y + 14.2, dir = (a) => [Math.sin(C.r + a), Math.cos(C.r + a)];
    const [ex, ez] = dir(Math.PI), [sx, sz] = dir(Math.PI / 2), [nx, nz] = dir(0);
    const vue = (dx, dz, dist, a0) => { const px = C.x + dx * 3.4, pz = C.z + dz * 3.4; return { pos: [px, y, pz], look: [px + Math.sin(a0) * dist, y - 9, pz + Math.cos(a0) * dist] }; };
    const a1 = Math.atan2(ex, ez), a2 = Math.atan2(sx, sz), a3 = Math.atan2(nx, nz);
    const T = w.townInfo, aT = T ? Math.atan2(T.x - C.x, T.z - C.z) : a1;
    const inquietant = pick(['Sur la route du nord, quelqu’un vous fait signe. Quand vous regardez de nouveau, il n’y a que la route.', 'Au loin, vers le hameau abandonné, une fumée monte d’une cheminée qui n’a plus de toit.', 'Les pigeons se taisent tous en même temps. Puis ils repartent, comme si de rien n’était.', 'Dans une cour, en bas, quelqu’un lève la tête vers vous. Il ne bouge plus. Il attend que vous descendiez.']);
    cine.jouer([
      { dur: 2.6, fondu: 'noir', texte: 'Cent douze marches. Au milieu, une odeur de cire, de pigeon, et de corde mouillée.', de: vue(ex, ez, 40, a1) },
      { dur: 7, texte: '(D’ici, la ville tient dans la main. Les toits, la place, les ponts, et les douves qui brillent.)', de: vue(Math.sin(aT), Math.cos(aT), 60, aT - 0.5), a: vue(Math.sin(aT), Math.cos(aT), 60, aT + 0.5) },
      { dur: 7, texte: '(Et plus loin, la vallée. Les champs, les bois, la ligne sombre des Monts.)', de: vue(sx, sz, 400, a2 - 0.4), a: vue(sx, sz, 400, a2 + 0.6) },
      { dur: 5.5, texte: `(${inquietant})`, de: vue(nx, nz, 300, a3 + 0.3), a: vue(nx, nz, 300, a3 - 0.2) },
    ], { apres: () => this.apresClocher() });
  },
  apresClocher() {
    const w = game.world, C = w.act.clocher, vus = [];
    // (de là-haut, on repère quelques lieux : les plus proches de ceux qu'on ne connaissait pas)
    if (typeof savoir !== 'undefined' && savoir.connaitreLieu) {
      const L = Object.keys(w.lm).map((k) => [k, w.lm[k]]).filter(([k, q]) => !q.under && !q.secret && q.name && !savoir.lieuConnu(k)).map(([k, q]) => [k, q, Math.hypot(q.x - C.x, q.z - C.z)]).filter((q) => q[2] > 60 && q[2] < 480).sort((a, b) => a[2] - b[2]);
      for (const [k, q] of L.slice(0, 6)) if (savoir.connaitreLieu(k)) vus.push(q.name);
    }
    this.esprit(1.5, 'la vue', 1.5);
    setTimeout(() => ui.subtitle('', vus.length ? `(De là-haut, vous avez repéré ${vus.slice(0, 5).join(', ')}.)` : '(Vous redescendez, les jambes molles et la tête pleine de ciel.)', 5), 600);
  },

  // ================================================================ les cierges
  cierge() {
    const s = farm.s;
    if (this.fait('cierge')) { ui.subtitle('', '(Votre cierge brûle déjà. Il brûlera jusqu’au soir.)', 3); return; }
    if (s.money < 2) { ui.subtitle('', '(Deux pièces dans la fente, et on prend un cierge. Vous ne les avez pas.)', 3); return; }
    const allumer = (pour, mort) => () => {
      ui.close(); if (!farm.pay(2)) return;
      this.marquer('cierge'); this.S().cierges = (this.S().cierges || 0) + 1;
      sound.candle ? sound.candle() : sound.place && sound.place();
      BUFF.add && BUFF.add('cierge', 12);
      if (typeof faith !== 'undefined' && faith.add) faith.add('eglise', 1);
      this.esprit(1, 'cierge', 1.5);
      if (mort) { const d = NPC_BY_ID[mort.id]; for (const id in (d && d.liens) || {}) { const m = npcs.byId[id]; if (m && m.st.alive) npcs.addAmitie(m, 15); } }
      ui.subtitle('', pour, 4);
    };
    const opts = [
      { label: 'Pour les vivants', fn: allumer('(La flamme prend du premier coup. Elle ne tremble pas.)') },
      { label: 'Pour les morts', fn: allumer('(La flamme se couche, se relève, et monte droite. Quelqu’un a reçu.)') },
    ];
    for (const d of (s.dead || []).filter((q) => s.day - q.day <= 12).slice(-3)) opts.push({ label: `Pour ${d.name}`, fn: allumer(`(Pour ${d.name}. La flamme est petite, mais elle tient.)`, d) });
    opts.push({ label: 'Pour vous-même', fn: allumer('(Un cierge pour soi. Le curé dit que ce n’est pas interdit. Il ne dit pas que c’est permis.)') });
    opts.push({ label: 'Ne rien allumer', fn: () => ui.close() });
    ui.choice('La herse à cierges', 'Des cierges de toutes les tailles, des coulures de cire sur le fer. Deux pièces dans la fente, et on en allume un.', opts);
  },

  // ================================================================ les tombes
  FLEURS: ['bouquet', 'rose', 'fleur', 'tulipe', 'dahlia', 'souci', 'lavande', 'pavot', 'tournesol', 'muguet', 'orchidee', 'edelweiss', 'perce_neige', 'camomille', 'fleur_lune'],
  fleur() { const s = farm.s; if (this.FLEURS.includes(s.hand) && farm.count(s.hand)) return s.hand; return this.FLEURS.find((k) => ITEMS[k] && farm.count(k)) || null; },
  fleurir(id, x, y, z, qui) {
    const A = this.S(), f = this.fleur();
    if (!f) return false;
    if (A.tombes[id] === farm.s.day) { ui.subtitle('', '(Vous l’avez déjà fleurie aujourd’hui.)', 2.5); return true; }
    farm.take(f, 1);
    A.tombes[id] = farm.s.day;
    A.fleurs = (A.fleurs || []).filter((q) => farm.s.day - q.j < 3 && q.id !== id);
    A.fleurs.push({ id, x, y, z, j: farm.s.day, c: f });
    sound.place && sound.place();
    const k = cal.is('morts') ? 2 : 1;
    this.esprit(1 * k, 'fleurir les tombes', 3);
    if (qui) { const d = NPC_BY_ID[qui]; for (const lid in (d && d.liens) || {}) { const m = npcs.byId[lid]; if (m && m.st.alive) npcs.addAmitie(m, 15); } }
    ui.subtitle('', cal.is('morts') ? '(Le jour des morts. Vous posez les fleurs, et il vous semble qu’on vous remercie, tout bas.)' : `(Vous posez ${itemName(f).toLowerCase()} sur la pierre.)`, 3.5);
    return true;
  },
  tombe(it) {
    const d = it.data, t = ACT_EPITAPHES[d.i % ACT_EPITAPHES.length], f = this.fleur();
    if (!f) { ui.read('Une vieille tombe', t); return; }
    ui.choice('Une vieille tombe', t, [
      { label: `Fleurir la tombe (${itemName(f).toLowerCase()})`, fn: () => { ui.close(); this.fleurir(it.id, d.pos[0], d.pos[1], d.pos[2]); } },
      { label: 'Se recueillir, simplement', fn: () => ui.close() },
    ]);
  },

  // ================================================================ les étals particuliers du Marchedi
  marcheOuvert() { const h = this.h(); return cal.is('marche') && h >= 7 && h < 13; },
  roleEtal(it) {
    const q = it && it.data.t === 'etal' && it.data.k !== 'place' && game.world.props.find((p) => p.f2 === it.id);
    return q && q.act !== undefined ? ACT_ETALS[q.act % ACT_ETALS.length] : null;
  },
  etalOuvert(it) { return this.marcheOuvert() && !!this.roleEtal(it); },
  offre(R) {
    const s = farm.s, sem = Math.floor(s.day / 12), rnd = mulberry32(((s.seed | 0) * 13 + sem * 7 + R.id.length) >>> 0), L = R.vend.filter(([id]) => ITEMS[id]).slice();
    const out = [];
    while (L.length && out.length < R.n) out.push(L.splice((rnd() * L.length) | 0, 1)[0]);
    return out;
  },
  // la brocante et les curiosités n'ont qu'une pièce de chaque, pour la semaine (une carte au trésor, une géode
  // achetées à la chaîne rapportaient plus qu'elles ne coûtaient) ; les fromages et les graines, à volonté
  piece(R, id, prendre) {
    if (R.id !== 'brocanteur' && R.id !== 'curiosites') return false;
    const A = this.S(), sem = Math.floor(farm.s.day / 12);
    if (!A.etalsPris || A.etalsPris.sem !== sem) A.etalsPris = { sem, ids: {} };
    const k = R.id + ':' + id, deja = !!A.etalsPris.ids[k];
    if (prendre) A.etalsPris.ids[k] = 1;
    return deja;
  },
  etal(it) {
    const R = this.roleEtal(it), s = farm.s;
    if (!R) return;
    const pos = [it.x, it.y + 0.3, it.z], opts = [];
    for (const [id, prix] of this.offre(R)) if (!this.piece(R, id)) opts.push({ label: `Acheter : ${itemName(id)} — ${prix} pièces`, fn: () => { if (!farm.pay(prix)) { ui.subtitle(R.nom, 'Il vous manque des pièces. Revenez quand votre bourse aura grandi.', 3); return; } this.piece(R, id, true); farm.give(id, 1); play.flyer && play.flyer(id, pos, 1); sound.coin && sound.coin(); this.etal(it); } });
    if (R.achete) {
      const vendus = this.fait('brocante');
      const T = Object.keys(s.inv).filter((id) => ITEMS[id] && ITEMS[id].cat === 'tresor' && ITEMS[id].price > 0 && farm.count(id)).slice(0, 8);
      if (vendus < 6) for (const id of T) {
        const prix = Math.max(1, Math.round(ITEMS[id].price * 0.6));
        opts.push({ label: `Vendre : ${itemName(id)} (${farm.count(id)}) — ${prix} pièces`, fn: () => {
          if (!farm.take(id, 1)) return;
          farm.earn(prix); sound.coin && sound.coin(); this.marquer('brocante');
          try { if (typeof vol !== 'undefined' && vol.marques) { const M = vol.marques(id); if (M.length) vol.oter(M[0]); } } catch (e) { /* rien */ }
          this.etal(it);
        } });
      } else opts.push({ label: 'Plus rien à vendre aujourd’hui : sa bourse est vide', fn: () => ui.close() });
    }
    opts.push({ label: 'Chaparder, pendant qu’on regarde ailleurs', fn: () => { ui.close(); fouilles.fouiller(it); } });
    opts.push({ label: 'Partir', fn: () => ui.close() });
    ui.choice(R.nom.charAt(0).toUpperCase() + R.nom.slice(1), R.accueil + ` Vous avez ${s.money} pièces.`, opts);
  },

  // ================================================================ le jeu de quilles
  QUILLES: [[-0.3, 2.45], [0, 2.45], [0.3, 2.45], [-0.3, 2.8], [0, 2.8], [0.3, 2.8], [-0.3, 3.15], [0, 3.15], [0.3, 3.15]],
  quillesJouer() {
    if (this.quilles && this.quilles.actif) return;
    if (this.fait('quilles') >= 3) { ui.subtitle('', '(Trois parties, c’est assez. Les quilles aussi ont besoin de repos.)', 3); return; }
    const h = this.h();
    if (h < 7 || h >= 21) { ui.subtitle('', '(Trop sombre pour viser. Et les quilles, la nuit, on ne sait jamais qui les relève.)', 3); return; }
    this.marquer('quilles');
    this.quilles = { actif: true, lancer: 1, total: 0, debout: this.QUILLES.map(() => true), anim: this.QUILLES.map(() => ({ a: 0, t0: -1, dir: 0 })), boule: null };
    this.viser();
  },
  viser() {
    const Q = this.quilles;
    ui.choice('Les quilles', `${Q.lancer === 1 ? 'Première boule' : 'Seconde boule'}. ${Q.debout.filter(Boolean).length} quilles debout.`, [
      { label: 'Viser à gauche', fn: () => this.lancerBoule(-1) },
      { label: 'Viser au milieu', fn: () => this.lancerBoule(0) },
      { label: 'Viser à droite', fn: () => this.lancerBoule(1) },
    ]);
  },
  lancerBoule(vise) {
    const Q = this.quilles, now = performance.now() / 1000, force = 0.8 + Math.random() * 0.35;
    ui.close();
    let n = 0;
    this.QUILLES.forEach(([x, z], i) => {
      if (!Q.debout[i]) return;
      const cote = Math.sign(Math.round(x * 10));
      let p = cote === vise ? 0.82 : vise === 0 ? (cote === 0 ? 0.85 : 0.55) : (cote === 0 ? 0.5 : 0.18);
      p *= force * (Q.lancer === 2 ? 0.95 : 1);
      if (Math.random() < p) { Q.debout[i] = false; n++; Q.anim[i] = { a: 0, t0: now + 0.95 + (z - 2.45) * 0.4 + Math.random() * 0.15, dir: (Math.random() - 0.5) * 1.6 + vise * 0.4 }; }
    });
    Q.total += n;
    Q.boule = { t0: now, x: vise * 0.28 + (Math.random() - 0.5) * 0.12 };
    sound.swish && sound.swish(0.6);
    for (let k = 0; k < Math.min(n, 4); k++) setTimeout(() => sound.quille && sound.quille(1 - k * 0.15), 1000 + k * 110);
    setTimeout(() => {
      const reste = Q.debout.filter(Boolean).length;
      ui.subtitle('', n === 9 ? '(Quille ! Les neuf d’un coup.)' : n ? `(${n} quille${n > 1 ? 's' : ''}.)` : '(La boule file entre les quilles. Pas une ne tombe.)', 2.5);
      if (Q.lancer === 1 && reste > 0) { Q.lancer = 2; setTimeout(() => this.viser(), 900); }
      else setTimeout(() => this.finQuilles(), 900);
    }, 1900);
  },
  finQuilles() {
    const Q = this.quilles, s = farm.s, H = game.world.lm.hameau;
    Q.actif = false;
    const temoins = H ? npcs.list.filter((n) => n.st.alive && !n.sleep && Math.hypot(n.x - H.x, n.z - H.z) < 40) : [];
    if (Q.total === 9 && Q.lancer === 1) { farm.earn(10); sound.applaudir && sound.applaudir(); this.esprit(1, 'les quilles', 1); for (const n of temoins) npcs.addAmitie(n, 10); if (temoins[0]) npcs.say(temoins[0], 'Quille ! Au hameau, on paie à boire pour moins que ça !', 3.5); ui.subtitle('', '(La cagnotte des quilles : dix pièces.)', 3); }
    else if (Q.total >= 7) { this.esprit(0.5, 'les quilles', 1); if (temoins[0]) npcs.say(temoins[0], 'Pas mal, pour quelqu’un de la ferme !', 3); }
    else if (temoins[0]) npcs.say(temoins[0], 'Ha ! Les quilles, ça ne s’apprend pas en un jour.', 3);
    ui.subtitle('', `(Partie finie : ${Q.total} sur 9.)`, 3);
    setTimeout(() => { if (this.quilles === Q) this.quilles = null; }, 2500);
  },

  // ================================================================ le four banal
  four() {
    const A = this.S(), s = farm.s, F = A.four;
    if (F && F.j === s.day && !F.pris) {
      if (s.hours < F.pret) { ui.subtitle('', '(Ça cuit. La croûte chante déjà un peu. Encore un moment.)', 3); return; }
      farm.give(F.out[0], F.out[1]); play.flyer && play.flyer(F.out[0], [game.player.pos[0], game.player.pos[1] + 1, game.player.pos[2]], F.out[1]);
      F.pris = true; sound.pop && sound.pop();
      ui.subtitle('', `(Vous défournez : ${itemName(F.out[0]).toLowerCase()} (${F.out[1]}). L’odeur se répand jusqu’au ranch.)`, 3.5);
      this.esprit(0.8, 'le pain', 1);
      return;
    }
    if (F && F.j === s.day) { ui.subtitle('', '(Une fournée par jour : le four banal est à tout le monde.)', 3); return; }
    const foire = cal.is('foire');
    if (farm.count('farine') < 2) { ui.subtitle('', '(Il faudrait deux mesures de farine. La grainetière en vend, et le moulin en donne.)', 3.5); return; }
    if (!foire && farm.count('bois') < 1) { ui.subtitle('', '(Le four est froid. Il faudrait une bûche pour le chauffer.)', 3); return; }
    const brioche = farm.count('beurre') >= 1 && farm.count('oeuf') >= 1;
    farm.take('farine', 2); if (!foire) farm.take('bois', 1);
    if (brioche) { farm.take('beurre', 1); farm.take('oeuf', 1); }
    A.four = { j: s.day, pret: s.hours + 1, out: brioche ? ['brioche', 3] : ['pain', foire ? 4 : 3], pris: false };
    sound.place && sound.place();
    const el = npcs.byId.eleveuse;
    if (el && el.st.alive && Math.hypot(el.x - game.player.pos[0], el.z - game.player.pos[2]) < 25) { npcs.addAmitie(el, 5); npcs.say(el, foire ? 'Le four est chaud, c’est la foire ! Enfournez, enfournez.' : 'Ça va sentir le bon pain jusqu’au ranch. Laissez-m’en un croûton.', 3); }
    ui.subtitle('', foire ? '(Le four banal chauffe pour tout le hameau, jour de foire. Vous enfournez.)' : '(Vous chauffez le four, vous enfournez. Il faudra compter une heure.)', 3.5);
  },

  // ================================================================ la tombola du Foiredi
  TIRAGE_H: 15,
  // le billet : les huit lots valent environ les trois quarts de ce que rapportent les cinquante billets (la tombola
  // paie la fête ; à cinq pièces, avec les anciens prix, un billet en rapportait trois fois son prix)
  BILLET: 8,
  tirage() { const s = farm.s, rnd = mulberry32(((s.seed | 0) * 5 + s.day * 313) >>> 0), L = []; while (L.length < 8) { const n = 1 + ((rnd() * 50) | 0); if (!L.includes(n)) L.push(n); } return L; },
  LOTS: [['poule', 1, 'une poule pondeuse, vivante'], ['viande_fumee', 2, 'un jambon fumé'], ['montre', 1, 'une montre de gousset'], ['bouquet', 1, 'un bouquet'], ['confiture', 2, 'deux pots de confiture'], ['cidre', 2, 'deux bouteilles de cidre'], ['fromage', 1, 'un fromage'], ['livre_contes', 1, 'un livre de contes']],
  tombola() {
    const s = farm.s, A = this.S(), h = this.h();
    if (!cal.is('foire') || h < 9 || h >= 18) { ui.subtitle('', `(Le stand est bâché. Un carton : « Tombola, le Foiredi. Tirage à trois heures. »)`, 3.5); return; }
    if (!A.tombola || A.tombola.j !== s.day) A.tombola = { j: s.day, billets: [], reclame: false };
    const TB = A.tombola;
    if (h < this.TIRAGE_H) {
      const opts = [];
      if (TB.billets.length < 3 && s.money >= this.BILLET) opts.push({ label: `Acheter un billet (${this.BILLET} pièces)`, fn: () => { if (!farm.pay(this.BILLET)) return; let n; do { n = 1 + ((Math.random() * 50) | 0); } while (TB.billets.includes(n)); TB.billets.push(n); sound.coin && sound.coin(); this.tombola(); } });
      opts.push({ label: 'Partir', fn: () => ui.close() });
      ui.choice('La tombola de la foire', `Un tambour de bois plein de billets pliés. Les lots s’alignent sur une planche : ${this.LOTS.slice(0, 4).map((l) => l[2]).join(', ')}… Tirage à trois heures.${TB.billets.length ? ' Vos billets : ' + TB.billets.join(', ') + '.' : ''}${TB.billets.length >= 3 ? ' (Trois billets par personne.)' : ''}`, opts);
      return;
    }
    const G = this.tirage(), gagnes = [];
    G.forEach((n, i) => { if (TB.billets.includes(n)) gagnes.push(i); });
    let desc = `Les numéros sortis : ${G.join(', ')}. Vos billets : ${TB.billets.length ? TB.billets.join(', ') : 'aucun'}.`;
    if (!TB.billets.length) desc += ' Il fallait en acheter.';
    else if (!gagnes.length) desc += ' Rien. Le tambour ne vous aime pas, cette année.';
    else if (TB.reclame) desc += ' Vos lots vous ont été remis.';
    const opts = [];
    if (gagnes.length && !TB.reclame) opts.push({ label: 'Réclamer vos lots', fn: () => {
      TB.reclame = true;
      for (const i of gagnes) { const [id, n] = this.LOTS[i]; if (ITEMS[id]) { farm.give(id, n); play.flyer && play.flyer(id, [game.player.pos[0], game.player.pos[1] + 1, game.player.pos[2]], n); } }
      sound.applaudir && sound.applaudir(); this.esprit(1, 'la tombola', 1);
      ui.subtitle('', `(Vous gagnez ${gagnes.map((i) => this.LOTS[i][2]).join(' et ')} !)`, 4);
      ui.close();
    } });
    opts.push({ label: 'Partir', fn: () => ui.close() });
    ui.choice('La tombola de la foire', desc, opts);
  },

  // ================================================================ le concours de tir du Chassedi
  scoresPNJ(k, noms) { const s = farm.s, rnd = mulberry32(((s.seed | 0) * 17 + s.day * 71 + k) >>> 0); return noms.map(([id, a, b]) => [id, Math.round(a + rnd() * (b - a))]).filter(([id]) => npcs.alive ? npcs.alive(id) : true); },
  // le concours de pêche : chacun présente la plus belle de ses prises du jour, tirées comme les vôtres dans le lac
  // (les poissons de jour et de toute heure) : le classement suit les prix des poissons, quels qu'ils soient
  prisesPNJ(k, noms) {
    const s = farm.s, rnd = mulberry32(((s.seed | 0) * 17 + s.day * 71 + k) >>> 0);
    const L = Object.keys(FISH).filter((id) => ITEMS[id] && FISH[id].where.includes('lac') && FISH[id].time !== 'nuit' && !FISH[id].moon);
    const tot = L.reduce((a, id) => a + FISH[id].w, 0);
    const prise = () => { let r = rnd() * tot; for (const id of L) { r -= FISH[id].w; if (r <= 0) return id; } return L[L.length - 1]; };
    return noms.map(([id, n]) => { let best = 0; for (let i = 0; i < n; i++) best = Math.max(best, ITEMS[prise()].price || 0); return [id, best]; }).filter(([id]) => npcs.alive ? npcs.alive(id) : true);
  },
  tir() {
    const s = farm.s, A = this.S(), h = this.h();
    if (!cal.is('chasse') || h < 9 || h >= 17) { ui.read('Le concours de tir', 'Concours de tir, chaque Chassedi, de neuf heures à cinq heures. Trois coups à quinze pas, sur la cible de paille. Inscription : cinq pièces.\n\nPremier prix : soixante pièces et six cartouches. Deuxième : vingt-cinq pièces. Troisième : trois cartouches.\n\nPortez du rouge en forêt.', 'Le relais de chasse'); return; }
    if (A.tir && A.tir.j === s.day) { ui.subtitle('', `(Vous avez tiré aujourd’hui : ${A.tir.score} points sur 30.)`, 3); return; }
    if (s.money < 5) { ui.subtitle('', '(L’inscription coûte cinq pièces.)', 3); return; }
    const ch = npcs.byId.chasseur;
    if (ch && ch.st.alive && ch.st.met) ui.subtitle(ch.name, ACT_TIR.inscrit, 4);
    farm.pay(5);
    this.jeuTir();
  },
  jeuTir() {
    const s = farm.s, A = this.S(), p = game.player;
    let amp = 0.55;
    if (farm.bestTool('fusil')) amp = 0.34; else if (farm.bestTool('arc')) amp = 0.45;
    try { if (typeof alcool !== 'undefined' && alcool.niveau && alcool.niveau() >= 2) amp += 0.25; } catch (e) { /* rien */ }
    if (strange.fear > 0.5) amp += 0.15;
    if (BUFF.on && BUFF.on('sang_froid')) amp *= 0.5;
    const E = this.tirEtat = { t: 0, coups: [], amp, ph: Math.random() * 6, fini: false, x: 0, y: 0 };
    ui.open('#choice', `<h3>Le concours de tir</h3><div class="desc">${esc('Le guidon danse sur la cible. Tirez quand il passe au centre (clic, E ou Espace). Trois coups.')}</div><canvas class="f2a-cible" width="220" height="220"></canvas><div class="opts"><button data-i="0"><kbd>1</kbd> ${esc('Tirer')}</button></div>`);
    this.style();
    const cv = $('#choice canvas.f2a-cible'), g = cv && cv.getContext('2d');
    const dessiner = () => {
      if (!g) return;
      g.fillStyle = '#d8c88a'; g.fillRect(0, 0, 220, 220);
      const C = ['#f0ece0', '#2a2a2a', '#3a6aa8', '#c83028', '#f0d030'];
      for (let i = 0; i < 5; i++) { g.fillStyle = C[i]; g.beginPath(); g.arc(110, 110, 100 - i * 20, 0, TAU); g.fill(); }
      g.fillStyle = '#111'; for (const [x, y] of E.coups) { g.beginPath(); g.arc(110 + x * 100, 110 + y * 100, 4, 0, TAU); g.fill(); }
      g.strokeStyle = '#1a1a1a'; g.lineWidth = 2; const cx = 110 + E.x * 100, cy = 110 + E.y * 100;
      g.beginPath(); g.arc(cx, cy, 12, 0, TAU); g.moveTo(cx - 18, cy); g.lineTo(cx + 18, cy); g.moveTo(cx, cy - 18); g.lineTo(cx, cy + 18); g.stroke();
    };
    const tirer = () => {
      if (E.fini || E.coups.length >= 3) return;
      E.coups.push([E.x, E.y]); sound.shot ? sound.shot() : sound.bowShot && sound.bowShot();
      if (E.coups.length >= 3) { E.fini = true; setTimeout(() => this.finTir(E), 700); }
    };
    E.tirer = tirer;
    ui.choiceOpts = [{ fn: tirer }];
    const b = $('#choice [data-i="0"]'); if (b) b.onclick = tirer;
    const key = (e) => { if (e.code === 'KeyE' || e.code === 'Space') { e.preventDefault(); tirer(); } };
    window.addEventListener('keydown', key);
    const iv = setInterval(() => {
      E.t += 0.04;
      E.x = E.amp * (Math.sin(1.7 * E.t + E.ph) + 0.35 * Math.sin(4.3 * E.t));
      E.y = E.amp * (Math.sin(1.25 * E.t + E.ph * 1.3) * 0.8 + 0.3 * Math.cos(3.6 * E.t));
      dessiner();
      if (ui.panel !== '#choice' || E.fini) { clearInterval(iv); window.removeEventListener('keydown', key); if (!E.fini) { E.fini = true; while (E.coups.length < 3) E.coups.push([1, 1]); this.finTir(E); } }
    }, 40);
  },
  finTir(E) {
    const s = farm.s, A = this.S();
    const pts = E.coups.map(([x, y]) => Math.max(0, 10 - Math.floor(Math.hypot(x, y) * 10))), score = pts.reduce((a, b) => a + b, 0);
    A.tir = { j: s.day, score };
    const L = this.scoresPNJ(1, [['chasseur', 21, 28], ['garde', 12, 22], ['eleveuse', 14, 24], ['forgeron', 10, 20], ['colporteur', 9, 19]]);
    L.push(['vous', score]); L.sort((a, b) => b[1] - a[1]);
    const rang = L.findIndex((q) => q[0] === 'vous') + 1;
    const ch = npcs.byId.chasseur;
    let prix = '';
    if (rang === 1) { farm.earn(60); farm.give('cartouche', 6); prix = 'Premier prix : soixante pièces et six cartouches.'; if (ch && ch.st.alive) { npcs.addAmitie(ch, 40); ui.subtitle(ch.st.met ? ch.name : 'Le chasseur', ACT_TIR.gagne, 4.5); } sound.applaudir && sound.applaudir(); this.esprit(1.5, 'le concours', 1.5); }
    else if (rang === 2) { farm.earn(25); prix = 'Deuxième prix : vingt-cinq pièces.'; if (ch && ch.st.alive) npcs.addAmitie(ch, 15); }
    else if (rang === 3) { farm.give('cartouche', 3); prix = 'Troisième prix : trois cartouches.'; }
    else if (ch && ch.st.alive) ui.subtitle(ch.st.met ? ch.name : 'Le chasseur', ACT_TIR.perd, 4);
    const nom = (id) => (id === 'vous' ? 'vous' : npcs.nameOf(id));
    const txt = `Vos coups : ${pts.join(', ')} — ${score} points sur 30.\n\nClassement : ${L.map((q, i) => `${i + 1}. ${nom(q[0])} (${q[1]})`).join(' ; ')}.${prix ? '\n\n' + prix : ''}`;
    if (ui.panel === '#choice') ui.choice('Le concours de tir', txt, [{ label: 'Rendre le fusil de concours', fn: () => ui.close() }]);
    else ui.subtitle('', `(Concours de tir : ${score} points ; classement : ${rang} sur ${L.length}.)`, 4);
  },

  // ================================================================ le concours de pêche du Pêchedi
  peche() {
    const s = farm.s, A = this.S(), h = this.h(), P = A.peche && A.peche.j === s.day ? A.peche : null, pe = npcs.byId.pecheur;
    if (!cal.is('peche')) { ui.read('Le concours de pêche', 'Concours de pêche, chaque Pêchedi. Inscriptions au ponton, de six heures à midi (cinq pièces). Ce qu’on tire du lac jusqu’à quatre heures compte ; on présente sa plus belle prise entre quatre heures et huit heures du soir.\n\nPremier prix : cinquante pièces et un coffre de pêcheur. Deuxième : vingt-cinq pièces. Troisième : des vers, beaucoup de vers.', 'Le ponton'); return; }
    if (!P) {
      if (h < 6 || h >= 12) { ui.subtitle('', h < 6 ? '(Les inscriptions ouvrent à six heures.)' : '(Les inscriptions sont closes depuis midi.)', 3); return; }
      if (!farm.pay(5)) { ui.subtitle('', '(L’inscription coûte cinq pièces.)', 3); return; }
      A.peche = { j: s.day, best: null, fini: false };
      sound.coin && sound.coin();
      ui.subtitle(pe && pe.st.alive && pe.st.met ? pe.name : 'Au ponton', ACT_PECHE.inscrit, 4.5);
      return;
    }
    if (P.fini) { ui.subtitle('', '(Le concours est fini pour vous. Le lac, lui, continue.)', 3); return; }
    if (h < 16) { ui.subtitle('', P.best ? `(Votre plus belle prise, pour l’instant : ${itemName(P.best.id).toLowerCase()}. On présente à quatre heures.)` : '(Rien de pris pour l’instant. Il reste jusqu’à quatre heures.)', 3.5); return; }
    if (h >= 20) { ui.subtitle('', '(Trop tard : le jury est rentré souper.)', 3); P.fini = true; return; }
    P.fini = true;
    // (le pêcheur a lancé sa ligne dès l'aube : six prises ; les autres, une à trois)
    const L = this.prisesPNJ(2, [['pecheur', 6], ['maire', 2], ['aubergiste', 3], ['fillette', 1], ['colporteur', 2]]);
    const moi = P.best ? P.best.prix : 0;
    L.push(['vous', moi]); L.sort((a, b) => b[1] - a[1]);
    const rang = L.findIndex((q) => q[0] === 'vous') + 1;
    let prix = '';
    if (moi && rang === 1) { farm.earn(50); farm.give('coffre_peche', 1); prix = 'Premier prix : cinquante pièces et un coffre de pêcheur.'; if (pe && pe.st.alive) { npcs.addAmitie(pe, 30); ui.subtitle(pe.st.met ? pe.name : 'Le pêcheur', ACT_PECHE.gagne, 4.5); } sound.applaudir && sound.applaudir(); this.esprit(1.5, 'le concours', 1.5); }
    else if (moi && rang === 2) { farm.earn(25); prix = 'Deuxième prix : vingt-cinq pièces.'; }
    else if (moi && rang === 3) { farm.give('vers', 12); prix = 'Troisième prix : douze vers de terre, frétillants.'; }
    else if (pe && pe.st.alive) ui.subtitle(pe.st.met ? pe.name : 'Le pêcheur', ACT_PECHE.perd, 4);
    const nom = (id) => (id === 'vous' ? 'vous' : npcs.nameOf(id));
    ui.read('Le concours de pêche', `${P.best ? 'Votre plus belle prise : ' + itemName(P.best.id).toLowerCase() + '.' : 'Vous n’avez rien présenté.'}\n\nClassement : ${L.map((q, i) => `${i + 1}. ${nom(q[0])}`).join(' ; ')}.${prix ? '\n\n' + prix : ''}`, 'Le jury du ponton');
  },

  // ================================================================ chaque image
  update(dt, playing) {
    const w = game.world, s = farm.s, p = game.player, act = w.act;
    if (!act) return;
    const A = this.S();
    // le crieur crie quand on passe
    if (act.crieur && this.crieurPresent()) {
      const cle = this.h() < 12 ? 'matin' : 'soir';
      if (A.crieurVu !== s.day + cle && Math.hypot(p.pos[0] - act.crieur.x, p.pos[2] - act.crieur.z) < 22 && playing) { A.crieurVu = s.day + cle; this.crier(); }
    }
    if (this.parleT > 0) this.parleT -= dt;
    // le four banal fume
    if (act.four && A.four && A.four.j === s.day && !A.four.pris && s.hours < A.four.pret + 0.2) {
      this.fourT -= dt;
      if (this.fourT <= 0 && Math.hypot(p.pos[0] - act.four.x, p.pos[2] - act.four.z) < 70) { this.fourT = 0.6; const [x, z] = [act.four.x + Math.sin(act.four.r) * 0.45 + Math.cos(act.four.r) * 0.45, act.four.z + Math.cos(act.four.r) * 0.45 - Math.sin(act.four.r) * 0.45]; puffAt(x, act.four.y + 2.35, z, [150, 146, 140], 2, 0.4, false); }
    }
    this.jouerMusique(dt);
    // les travaux : les endroits à réparer ou à balayer
    if (!this.marqueJ || this.marqueJ !== s.day) { this.marqueJ = s.day; this.marqueurs(); }
  },
  // les silhouettes : crieur, violoneux, diseuse, marchands du Marchedi ; les quilles ; les cierges ; les fleurs des tombes
  rig(k, look) { return this.rigs[k] || (this.rigs[k] = humanRig(Object.assign({}, look))); },
  figure(buf, sbuf, k, look, F, t, st) {
    const p = game.player;
    if (!F || Math.abs(F.x - p.pos[0]) > 80 || Math.abs(F.z - p.pos[2]) > 80) return;
    const rig = this.rig(k, look);
    poseHuman(rig, Object.assign({ move: 0, t, lookY: Math.sin(t * 0.4 + F.x) * 0.3 }, st || {}));
    drawRig(buf, rig, F.x, F.y, F.z, F.h, look.height || 1, 0);
    if (sbuf) drawShadow(sbuf, F.x, F.y, F.z, 0.34);
  },
  draw(buf, sbuf, cam, t) {
    const w = game.world, act = w && w.act, s = farm.s;
    if (!act || !s) return;
    if (act.crieur && this.crieurPresent()) {
      this.figure(buf, sbuf, 'crieur', ACT_LOOKS.crieur, act.crieur, t, { talk: this.parleT > 0 });
      const F = act.crieur; PE.buf = buf; PE.fl = 0; PE.frame(F.x, F.y, F.z, F.h, 1);
      PE.bx(0.24, 0.72, 0.12, 0.3, 0.26, 0.3, rgbf('#b83a30'), TL.cloth); PE.bx(0.24, 0.98, 0.12, 0.32, 0.03, 0.32, rgbf('#e8e0d0'), TL.plain);
    }
    if (act.violon && this.violonPresent()) {
      const F = act.violon;
      this.figure(buf, sbuf, 'violon', ACT_LOOKS.violon, F, t, { work: true, lookY: 0.4 });
      PE.buf = buf; PE.fl = 0; PE.frame(F.x, F.y, F.z, F.h, 1);
      PE.box(-0.12, 1.36, 0.16, 0.13, 0.05, 0.34, rgbf('#7a3a1a'), TL.wood, 0.5, 0, 0.3);
    }
    if (act.diseuse && this.diseusePresente()) this.figure(buf, sbuf, 'diseuse', ACT_LOOKS.diseuse, act.diseuse, t, { sit: true, lookY: Math.sin(t * 0.25) * 0.2 });
    if (this.marcheOuvert()) for (const V of act.vendeurs) { const R = ACT_ETALS[V.i % ACT_ETALS.length]; this.figure(buf, sbuf, 'etal' + V.i, R.look, V, t, {}); }
    // les quilles et la boule
    const Qp = act.quilles;
    if (Qp && Math.abs(Qp.x - cam[0]) < 80 && Math.abs(Qp.z - cam[2]) < 80) {
      const Q = this.quilles, now = performance.now() / 1000;
      PE.buf = buf; PE.fl = 0;
      this.QUILLES.forEach(([x, z], i) => {
        const a = Q && Q.anim[i] && Q.anim[i].t0 >= 0 ? clamp((now - Q.anim[i].t0) / 0.35, 0, 1) * 1.45 : 0, dir = Q && Q.anim[i] ? Q.anim[i].dir : 0;
        PE.frame(Qp.x, Qp.y, Qp.z, Qp.r, 1);
        const cy = 0.17 * Math.cos(a), off = 0.17 * Math.sin(a);
        PE.box(x + Math.sin(dir) * off, 0.04 + cy, z + Math.cos(dir) * off, 0.08, 0.34, 0.08, WHITE, TL.plain, dir, a);
        PE.box(x + Math.sin(dir) * off * 1.4, 0.04 + 0.24 * Math.cos(a), z + Math.cos(dir) * off * 1.4, 0.085, 0.04, 0.085, rgbf('#c83028'), TL.plain, dir, a);
      });
      const b = Q && Q.boule;
      if (b) { const k = clamp((now - b.t0) / 1.0, 0, 1.25); PE.frame(Qp.x, Qp.y, Qp.z, Qp.r, 1); PE.box(b.x * k, 0.12, -3.2 + k * 6.2, 0.18, 0.18, 0.18, rgbf('#5a3a1a'), TL.darkwood, k * 9, k * 7); }
    }
    // les flammes des cierges
    const C = act.cierges;
    if (C && Math.abs(C.x - cam[0]) < 40 && Math.abs(C.z - cam[2]) < 40) {
      const A = this.S(), nb = Math.min(12, 3 + (A.cierges || 0) * 2);
      PE.buf = buf; PE.frame(C.x, C.y, C.z, C.r, 1); PE.fl = FX_EMIT;
      for (let i = 0; i < nb; i++) { const fl = 1 + Math.sin(t * 9 + i * 1.7) * 0.15; PE.bx(-0.42 + (i % 6) * 0.168, 0.97 + ((i * 7) % 3) * 0.03, -0.06 + ((i / 6) | 0) * 0.13, 0.025, 0.06 * fl, 0.025, [1.4, 0.95, 0.45], TL.flame); }
      PE.fl = 0;
    }
    // les fleurs sur les tombes
    const A2 = this.S();
    if (A2 && A2.fleurs && A2.fleurs.length) { PE.buf = buf; PE.fl = 0; for (const f of A2.fleurs) { if (s.day - f.j >= 3 || Math.abs(f.x - cam[0]) > 60 || Math.abs(f.z - cam[2]) > 60) continue; PE.frame(f.x, f.y, f.z, 0, 1); PE.bx(0, 0.02, 0.35, 0.3, 0.06, 0.12, rgbf('#4a7a3a'), TL.leaves); for (let i = 0; i < 4; i++) PE.bx(-0.1 + i * 0.07, 0.07, 0.34 + (i % 2) * 0.04, 0.06, 0.06, 0.06, rgbf(['#e03040', '#f0d020', '#f4f0ec', '#9a70d0'][i]), TL.plain); } }
  },
  lights(eye) {
    const L = [], act = game.world && game.world.act;
    if (!act) return L;
    const C = act.cierges, A = this.S();
    if (C && Math.hypot(C.x - eye[0], C.z - eye[2]) < 30) L.push({ x: C.x, y: C.y + 1.2, z: C.z, r: 3.5 + (A && A.cierges ? 1.5 : 0), c: [1.0, 0.7, 0.35], d: Math.hypot(C.x - eye[0], C.y - eye[1], C.z - eye[2]) });
    const D = act.diseuse;
    if (D && this.diseusePresente() && Math.hypot(D.x - eye[0], D.z - eye[2]) < 40) L.push({ x: D.x + Math.sin(D.h) * 0.8, y: D.y + 0.9, z: D.z + Math.cos(D.h) * 0.8, r: 3, c: [1.0, 0.62, 0.3], d: Math.hypot(D.x - eye[0], D.z - eye[2]) });
    return L;
  },
  style() {
    if (this.styled || typeof document === 'undefined' || !document.head) return;
    this.styled = true;
    const st = document.createElement('style');
    st.textContent = '.f2a-jauge{position:relative;height:18px;margin:14px 6px;border:1px solid rgba(80,60,30,.6);background:linear-gradient(90deg,#8a3a2a,#c8b890 50%,#3a6a3a)}.f2a-jauge b{position:absolute;top:-5px;width:6px;height:26px;margin-left:-3px;background:#2a2016}canvas.f2a-cible{display:block;margin:10px auto;border:1px solid rgba(80,60,30,.5)}';
    document.head.appendChild(st);
  },
  etiquette(it) {
    const k = it.kind, A = this.S(), h = this.h();
    let t = esc(it.name);
    if (k === 'f2a_des' || k === 'f2a_cartes') { const n = this.adversaire(); t += n ? ` <i>(contre ${esc(this.nom(n))})</i>` : ' <b>— personne pour jouer</b>'; }
    else if (k === 'f2a_voeu' && this.fait('voeu')) t += ' <b>— déjà fait aujourd’hui</b>';
    else if (k === 'f2a_diseuse' && !this.diseusePresente()) t += ' <b>— fermée</b>';
    else if (k === 'f2a_cierge' && this.fait('cierge')) t += ' <b>— votre cierge brûle</b>';
    else if (k === 'f2a_quilles') t += ` <b>(${Math.max(0, 3 - this.fait('quilles'))} parties)</b>`;
    else if (k === 'f2a_four') { const F = A.four; if (F && F.j === farm.s.day && !F.pris) t = farm.s.hours >= F.pret ? 'Défourner le pain' : 'Le pain cuit…'; }
    else if (k === 'f2a_tombe' && this.fleur()) t = 'Fleurir la tombe';
    else if (k === 'f2a_tombola' && !cal.is('foire')) t += ' <b>— le Foiredi</b>';
    else if (k === 'f2a_tir' && cal.is('chasse') && h >= 9 && h < 17) t = 'S’inscrire au concours de tir (5 pièces)';
    else if (k === 'f2a_peche' && cal.is('peche')) t = A.peche && A.peche.j === farm.s.day ? (h >= 16 ? 'Présenter sa plus belle prise' : 'Le concours de pêche (inscrit)') : 'S’inscrire au concours de pêche (5 pièces)';
    else if (k === 'f2a_veillee' && !this.veilleeOuverte()) return null;
    return t;
  },
  charger() {
    this.quilles = null; this.musique = null; this.brasEtat = null; this.tirEtat = null; this.marqueJ = null;
    this.S();
    if (this.branche) return;
    this.branche = true;
    for (const k of ['f2a_des', 'f2a_cartes', 'f2a_veillee', 'f2a_travaux', 'f2a_voeu', 'f2a_diseuse', 'f2a_clocher', 'f2a_cierge', 'f2a_tombe', 'f2a_quilles', 'f2a_four', 'f2a_tombola', 'f2a_tir', 'f2a_peche', 'f2a_job']) fouilles.etiquettes[k] = (it) => this.etiquette(it);
    fouilles.surcharges.push((it) => (this.etalOuvert(it) ? esc('Voir l’étal : ' + this.roleEtal(it).nom) : null));
    fouilles.gardiens.push((it) => (it.data.t === 'etal' && it.data.k !== 'place' && this.marcheOuvert() && Math.random() < 0.75 ? { qui: this.roleEtal(it) ? this.roleEtal(it).nom : '', texte: 'Au voleur ! Arrêtez-le ! Au voleur !', village: 'valbrume' } : null));
    // les options de dialogue : bras de fer, tournée, pli de la mairie
    const _opt = talk.options.bind(talk);
    talk.options = function () {
      const opts = _opt(), n = this.n;
      try {
        const i = opts.findIndex((o) => o.act === 'bye'), extra = [];
        const TR = activites.TR();
        if (TR.pli && TR.pli.to === n.id && farm.count('pli_mairie')) extra.push({ label: 'Un pli de la mairie, pour vous', act: 'f2a_pli', quest: true });
        if (ACT_BRAS[n.d.id] && !npcs.murdererKnown() && !(n.st.anger > 0)) extra.push({ label: 'Un bras de fer ?', act: 'f2a_bras' });
        if (n.d.id === 'aubergiste' && activites.dedans(n, 'auberge') && activites.h() >= 10) extra.push({ label: 'Payer une tournée', act: 'f2a_tournee' });
        opts.splice(i >= 0 ? i : opts.length, 0, ...extra);
      } catch (e) { console.error(e); }
      return opts;
    };
    const _ch = talk.choose.bind(talk);
    talk.choose = function (act) {
      const n = this.n;
      if (act === 'f2a_bras') { ui.close(true); setTimeout(() => activites.brasDeFer(n), 30); return 'keep'; }
      if (act === 'f2a_tournee') return activites.tournee(n);
      if (act === 'f2a_pli') { const v = activites.livrerPli(n); if (v) return v; }
      return _ch(act);
    };
    // le concours de pêche : ce qu'on tire du lac pendant le concours compte
    const _cf = play.catchFish.bind(play);
    play.catchFish = function (F) {
      const A = activites.S(), avant = {};
      const P = A && A.peche && A.peche.j === farm.s.day && !A.peche.fini && npcs.hour() < 16 && F && F.zone === 'lac' ? A.peche : null;
      if (P) for (const k in FISH) avant[k] = farm.count(k);
      const r = _cf(F);
      if (P) for (const k in FISH) if (farm.count(k) > avant[k] && ITEMS[k]) { const prix = ITEMS[k].price || 0; if (!P.best || prix > P.best.prix) { P.best = { id: k, prix }; setTimeout(() => ui.subtitle('', `(Pour le concours : ${itemName(k).toLowerCase()}. Votre plus belle prise.)`, 3), 800); } }
      return r;
    };
    // les tombes fraîches et celles du cimetière : on les fleurit
    const _grave = HOOKS.interPre.grave;
    HOOKS.interPre.grave = (it) => {
      const f = activites.fleur();
      if (f) {
        ui.choice('Une tombe', 'Des lettres usées par la pluie. De l’herbe qui pousse, sage, tout autour.', [
          { label: `Fleurir la tombe (${itemName(f).toLowerCase()})`, fn: () => { ui.close(); activites.fleurir(it.id, it.x, it.y - 0.9, it.z, it.data && it.data.who); } },
          { label: 'Lire l’inscription', fn: () => { ui.close(); game.readGrave(it); } },
        ]);
        return true;
      }
      return _grave ? _grave(it) : false;
    };
    // les étals du Marchedi : on achète, on vend, avant de chaparder
    const _pre = HOOKS.interPre.f2;
    HOOKS.interPre.f2 = (it) => { if (activites.etalOuvert(it)) { activites.etal(it); return true; } return _pre ? _pre(it) : false; };
  },
  dedans(n, k) { return fouilles.dedans(n, k); },
};
const ACT_AIRS = {
  gigue: { tempo: 0.17, notes: [[659, 1], [587, 1], [523, 1], [587, 1], [659, 2], [659, 1], [659, 1], [587, 2], [587, 1], [523, 1], [494, 2], [523, 1], [587, 1], [659, 2], [784, 1], [659, 1], [587, 1], [523, 1], [494, 2], [440, 3], [0, 1], [523, 1], [587, 1], [659, 1], [523, 1], [440, 2], [494, 1], [523, 1], [587, 3]] },
  complainte: { tempo: 0.34, notes: [[440, 2], [523, 1], [494, 1], [440, 2], [392, 2], [349, 2], [392, 1], [440, 1], [494, 3], [440, 1], [392, 2], [330, 4], [349, 2], [392, 1], [349, 1], [330, 2], [294, 2], [330, 6]] },
};

// ---------------------------------------------------------------- branchements
HOOKS.inter.f2a_des = () => activites.jouerDes(null, 'des');
HOOKS.inter.f2a_cartes = () => activites.jouerDes(null, 'cartes');
HOOKS.inter.f2a_veillee = () => activites.veillee();
HOOKS.interVis.f2a_veillee = () => activites.veilleeOuverte();
HOOKS.inter.f2a_travaux = () => activites.travaux();
HOOKS.inter.f2a_job = (it) => activites.travailler(it);
HOOKS.inter.f2a_voeu = () => activites.voeu();
HOOKS.inter.f2a_diseuse = () => activites.diseuse();
HOOKS.inter.f2a_clocher = () => activites.clocher();
HOOKS.inter.f2a_cierge = () => activites.cierge();
HOOKS.inter.f2a_tombe = (it) => activites.tombe(it);
HOOKS.inter.f2a_quilles = () => activites.quillesJouer();
HOOKS.inter.f2a_four = () => activites.four();
HOOKS.inter.f2a_tombola = () => activites.tombola();
HOOKS.inter.f2a_tir = () => activites.tir();
HOOKS.inter.f2a_peche = () => activites.peche();
HOOKS.target.push((eye, f, cand) => {
  const act = game.world && game.world.act;
  if (!act || !farm.s) return;
  const vise = (F, use, lab) => {
    if (!F) return;
    const dx = F.x - eye[0], dz = F.z - eye[2], dy = F.y + 1.3 - eye[1], d = Math.hypot(dx, dy, dz);
    if (d > 2.8 || (dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1) < 0.7) return;
    cand({ kind: 'hook', use, f2lab: lab }, d);
  };
  if (activites.crieurPresent()) vise(act.crieur, () => activites.lireNouvelles(), 'Écouter le crieur');
  if (activites.violonPresent()) vise(act.violon, () => activites.pourboire(), 'Donner une pièce au violoneux');
});
HOOKS.update.push((dt, eye, basis, sky, playing) => { if (farm.s && game.world) activites.update(dt, playing); });
HOOKS.draw.push((buf, sbuf, cam, t) => { if (farm.s && game.world) activites.draw(buf, sbuf, cam, t); });
HOOKS.lights.push((eye) => (farm.s && game.world ? activites.lights(eye) : []));
HOOKS.day.push(() => { if (farm.s) { activites.S(); activites.marqueurs(); } });
HOOKS.load.push(() => { if (farm.s && game.world) activites.charger(); });
