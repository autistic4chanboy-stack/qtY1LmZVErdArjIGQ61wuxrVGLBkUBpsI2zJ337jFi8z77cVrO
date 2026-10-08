// ============================================================================
//  DES BÊTES À QUI L'ON PEUT PARLER (agent P, treizième vague) : les données.
//  Huit bêtes uniques, chacune à son endroit de la vallée, à ses heures : elles
//  ne parlent qu'au joueur (les gens ne le croient pas, ou font semblant).
//  Le jeu : 11-zzzzP-betes.js ; modèles : 07-zzzzzzzzzzzzP-betes.js ;
//  créatures : 10-zzzzzP-betes.js ; voix : 09-zzzzzP-voix.js.
//  Chaque bête : ce qu'elle est (BP_BETES : nom, endroit, heures, voix, service)
//  et ce qu'elle dit (BP_TEXTES : rencontre, salutations selon l'heure, le temps,
//  le jour de la semaine, ce que le joueur a fait ; qui elle est ; un sujet
//  qu'elle approfondit à mesure qu'on revient ; des rumeurs, obliques ; une
//  question qu'elle pose et dont elle se souvient ; un service et sa récompense ;
//  ce qu'elle dit quand on la menace, qu'on la blesse, qu'on a tué l'une des
//  autres ; où trouver les autres).
// ============================================================================

// ---------------------------------------------------------------- les objets
defItem('crapaudine', 'Crapaudine', 'tresor', 30, ['gemme', '#6a8a5a'], { unique: true, desc: 'La pierre que le crapaud du vieux puits portait au front, donnée de son vivant. Elle tiédit quand le venin est dans le sang, et elle le boit, lentement. À garder sur soi.' });
defItem('pierre_terne', 'Pierre terne', 'tresor', 1, ['caillou', '#6a6a60'], { desc: 'Une pierre verdâtre, prise au front d’un crapaud mort. Elle ne chauffe pas, elle ne boit rien. Elle n’a de vertu que donnée.' });
defItem('plume_hulotte', 'Plume de la hulotte', 'tresor', 2, ['plume', '#b8a080'], { unique: true, desc: 'Une plume brune, très douce, barrée de clair. Tombée une nuit de veille, au vieux chêne. Dans la sacoche, les nuits sont un peu plus calmes.' });

// ---------------------------------------------------------------- les bêtes
// lieu : où elle se tient (11-zzzzP-betes.js, bpLieux) ; heures : éveillée et là ([de, à], en heures de la journée) ;
// dort : là, mais endormie (on la voit, elle ne parle pas) ; pluie : 'aime' (là aussi quand il pleut, le jour),
// 'fuit' (absente sous la pluie forte) ; neige : 'fuit' (absente sous la neige) ; orage : 'fuit' ;
// fuite : sa manière de partir ; tu : elle tutoie ; service : ce qu'elle demande (objets : [[id ou groupe, n]]).
const BP_ORDRE = ['chat', 'hulotte', 'crapaud', 'corbeau', 'renarde', 'chevre', 'carpe', 'cheval'];
const BP_BETES = {
  chat: {
    kind: 'p_chat', milieu: 'la ville', biome: 'ville', nom: 'Tibert', titre0: 'Le chat gris', lab0: 'Parler au chat gris', lab: 'Parler à Tibert', labDort: 'Le chat gris, endormi', qui: 'le chat de l’auberge', ou: 'sur un tonneau, devant l’auberge, le soir',
    lieu: 'auberge', heures: [[18, 24], [0, 2]], dort: [[9, 18]], pluie: 'fuit', fuite: 'court', voix: 'chat', tu: false, hp: 22, echelle: 1.15,
    service: { objets: [['poisson_frais', 1]], cadeau: 'poisson_frais' },
  },
  hulotte: {
    kind: 'p_hulotte', milieu: 'les prés, au chêne millénaire', nom: 'la hulotte', titre0: 'La hulotte', lab0: 'Parler à la hulotte', lab: 'Parler à la hulotte', qui: 'la hulotte du vieux chêne', ou: 'au chêne millénaire, la nuit',
    lieu: 'chene', heures: [[20.5, 24], [0, 5]], orage: 'fuit', fuite: 'vole', voix: 'hulotte', tu: true, hp: 10, fem: true,
    service: { veille: 2 },
  },
  crapaud: {
    kind: 'p_crapaud', milieu: 'le hameau abandonné', nom: 'le Crapaud', titre0: 'Le crapaud', lab0: 'Parler au crapaud', lab: 'Parler au Crapaud', qui: 'le crapaud du vieux puits', ou: 'sur la margelle du vieux puits, au hameau abandonné, le soir et les jours de pluie',
    lieu: 'vieux_puits', heures: [[19, 24], [0, 2]], pluie: 'aime', neige: 'fuit', fuite: 'puits', voix: 'crapaud', tu: true, hp: 8,
    service: { objets: [['vers', 3]], cadeau: 'vers' },
  },
  corbeau: {
    kind: 'p_corbeau', milieu: 'la lande', biome: 'lande', nom: 'Tiécelin', titre0: 'Le corbeau', lab0: 'Parler au corbeau', lab: 'Parler à Tiécelin', qui: 'le corbeau de la Table des Géants', ou: 'sur la Table des Géants, la lande, le jour',
    lieu: 'dolmen', heures: [[6.5, 19]], fuite: 'vole', voix: 'corbeau', tu: true, hp: 10,
    service: { objets: [['brillant', 1]], cadeau: 'brillant' },
  },
  renarde: {
    kind: 'p_renarde', milieu: 'la forêt', biome: 'foret', nom: 'Hermeline', titre0: 'La renarde', lab0: 'Parler à la renarde', lab: 'Parler à Hermeline', qui: 'la renarde du relais de chasse', ou: 'à la lisière, près du relais de chasse, à la brune et à l’aube',
    lieu: 'relais', heures: [[18.5, 23.5], [4, 7]], fuite: 'court', voix: 'renarde', tu: true, hp: 18, fem: true,
    service: { objets: [['oeuf', 1]], cadeau: 'oeuf' },
  },
  chevre: {
    kind: 'p_chevre', milieu: 'les hauteurs, l’estive', biome: 'hauteurs', nom: 'l’Écornée', titre0: 'La vieille chèvre', lab0: 'Parler à la vieille chèvre', lab: 'Parler à l’Écornée', qui: 'la vieille chèvre de l’estive', ou: 'près du cairn à la sonnaille, à l’estive, le jour',
    lieu: 'estive', heures: [[7, 19.5]], neige: 'fuit', fuite: 'court', voix: 'chevre', tu: true, hp: 30, fem: true,
    service: { objets: [['sel', 2]], cadeau: 'sel' },
  },
  carpe: {
    kind: 'p_carpe', milieu: 'le lac', biome: 'lac', nom: 'la Vieille', titre0: 'La grosse carpe', lab0: 'Parler à la grosse carpe', lab: 'Parler à la Vieille', qui: 'la vieille carpe du ponton', ou: 'au bout du ponton du pêcheur, le matin et le soir',
    lieu: 'ponton', heures: [[5, 9], [17, 21]], orage: 'fuit', fuite: 'plonge', voix: 'carpe', tu: false, hp: 24, fem: true,
    service: { promesse: 7, poissons: ['carpe', 'carpe_miroir'] },
  },
  cheval: {
    kind: 'p_cheval', milieu: 'la ferme brûlée', nom: 'Bayard', titre0: 'Le vieux cheval', lab0: 'Parler au vieux cheval', lab: 'Parler à Bayard', labDort: 'Le vieux cheval, endormi', qui: 'le vieux cheval de la ferme brûlée', ou: 'dans le pré de la ferme brûlée des Chabert, le jour',
    lieu: 'chabert', heures: [[6, 20.5]], dort: [[20.5, 24], [0, 6]], fuite: 'court', voix: 'cheval', tu: true, hp: 70, echelle: 1.06,
    service: { objets: [['pomme', 3]], cadeau: 'pomme' },
  },
};
// ce qu'on peut donner (les « groupes ») : le chat veut un vrai poisson, cru ; le corbeau, ce qui brille
const BP_GROUPES = {
  // (cru, de cinq à soixante pièces : ni une ablette, ni un poisson de légende qu'on voudrait garder)
  poisson_frais: { nom: 'un poisson frais', ok: (id) => { const it = ITEMS[id]; return !!(it && it.cat === 'poisson' && (it.price || 0) >= 5 && (it.price || 0) <= 60 && !it.unique && !it.questItem && !/fum|grill|sech|sale/.test(id)); } },
  // (le métal, le verre, les perles : ce qui accroche la lumière ; pas un tesson ni un fossile)
  // (des trésors seulement, de cinq à cent pièces : pas un outil — ni la montre, ni le miroir de poche qui ramène de l'Envers —,
  //  ni un poisson, ni ce qui se mange, ni ce qu'on voudrait garder)
  brillant: { nom: 'quelque chose qui brille', ok: (id) => { const it = ITEMS[id]; return !!(it && it.cat === 'tresor' && !it.tool && !it.unique && !it.questItem && (it.price || 0) >= 5 && (it.price || 0) <= 100 && /piece|bijou|perle|tabatiere|couteau_poche|medaill|cuiller|bougeoir|besicles|calice|montre|bague|alliance|bouton|de_coudre|de_argent|sonnaille|miroir|vg_plaque|vg_insigne|vg_toupie|vg_cristal|vg_oeil|geode|anneau|(^|_)broche($|_)|boucle|clochette/.test(id)); } },
};

// ---------------------------------------------------------------- ce qu'elles disent
// {nom} : le nom de la bête morte (dans « peur ») ; les répliques entre parenthèses se voient, elles ne s'entendent pas.
const BP_TEXTES = {
  // ======================================================================== Tibert, le chat de l'auberge
  chat: {
    approche: 'Vous avez fini de me dévisager ? Approchez, ou passez votre chemin. Mais pas les deux.',
    intro: 'Eh bien oui. Je parle. Fermez la bouche, vous allez avaler une mouche, et elles sont d’une saleté, ici. Asseyez-vous si vous voulez ; les chaises sont au patron, il ne s’en servira pas ce soir.',
    salut: {
      soir: ['Ah, c’est vous.', 'Bonsoir. Vous sentez le dehors.', 'Encore vous. On finira par jaser.'],
      nuit: ['Il est tard pour un honnête homme. Vous êtes donc autre chose.', 'La nuit vous va bien. Elle va bien à tout le monde, c’est sa politesse.'],
      matin: ['Il est bien tôt. Les gens convenables dorment, et les autres rentrent.'],
      jour: ['Vous me réveillez.'],
    },
    retour: ['Tiens. Je vous croyais mort. Les gens d’ici le croyaient aussi ; le maire avait l’air presque content.', 'Vous voilà. Vous m’avez manqué un peu, comme une puce.'],
    meteo: {
      pluie: 'La pluie. Je déteste la pluie. Elle rend les hommes bavards et les chats mouillés.',
      neige: 'La neige étouffe les pas. Les miens, les vôtres. Et ceux des choses qui marchent derrière vous.',
      brouillard: 'Par ce brouillard, même moi je rentre tôt. Il y a des formes, sur la place, qui ne sont pas des passants.',
      gel: 'Il gèle. Le patron a mis une couverture sur le tonneau. Il croit que c’est pour le vin.',
    },
    jours: {
      veillee: 'C’est Veilledi. Ce soir, ils content à l’intérieur. J’écoute par la fenêtre ; ils se trompent toujours sur la fin.',
      morts: 'Vorndi. Le jour des morts. Ce soir, je ne traverserai pas la place, et je vous conseille d’en faire autant.',
      marche: 'Jour de marché. On a volé trois harengs au poissonnier. On m’accuse. On a raison, mais on n’a pas de preuve.',
    },
    nuitRouge: 'La nuit dernière était rouge. Je l’ai passée sous le comptoir, contre les jambes du patron. Il ne le sait pas, et il dormait aussi mal que moi.',
    qui: 'Tibert. Les gens de l’auberge disent Minet. Je ne réponds pas à Minet. Je suis le chat de cette maison depuis trois patrons, et le seul à n’avoir jamais payé une chope.',
    pourquoi: [
      'Pourquoi je parle ? Mais tout le monde parle, mon bon. Les chats, simplement, ont l’élégance de ne pas le faire devant n’importe qui.',
      'Ma grand-mère disait que nous parlions tous, avant que les hommes n’apprennent à écrire. Écrire, voyez-vous, c’est parler à quelqu’un qui n’est pas là. Nous avons trouvé cela vulgaire, et nous nous sommes tus. Pas tout à fait.',
    ],
    sujet: {
      label: 'Et l’auberge ?',
      lignes: [
        'L’auberge ? Une boîte chaude où les hommes viennent se dire ce qu’ils ne diraient pas dehors. Je dors sur la poutre, au-dessus du comptoir. J’entends tout. Je ne répète que ce qui m’arrange.',
        'La cave… Le patron n’y laisse descendre personne. Il a raison. Le fût du fond n’a pas été rempli par un vigneron, et ce n’est pas du vin qui se bouge dedans, les nuits de lune.',
        'Les soirs de Veilledi, quand on conte, regardez qui ne rit pas. Il y a toujours quelqu’un qui ne rit pas. Ce n’est jamais le même, et c’est cela qui m’inquiète.',
        'Sous la rue de la porte du midi, il y a une cave que personne n’a creusée pour du vin. Les rats y descendent. Ils n’en remontent pas gras.',
      ],
    },
    rumeurs: [
      'Le curé ferme son église à clé, la nuit. De l’intérieur. Je ne sais pas par où il sort.',
      'La boulangère se lève à trois heures. À trois heures, il n’y a qu’elle et moi dans les rues. Et une troisième chose, certaines nuits, qui ne fait aucun bruit sur les pavés.',
      'Les nuits rouges, je monte sur le toit de l’église. D’en haut, on voit que la lune n’est pas rouge partout. Seulement au-dessus de la vallée.',
      'Le garde fait sa ronde en comptant ses pas. S’il se trompe, il recommence depuis la place. Je l’ai vu recommencer quatre fois, une nuit de Vorndi.',
      'Le libraire, là-haut, ne vieillit pas. Je ne dis pas qu’il est méchant. Je dis qu’il faut rendre les livres à l’heure.',
      'Quand quelqu’un va mourir en ville, je le sais avant le curé. Les chiens hurlent, mais ce sont les chats qui vont s’asseoir devant la porte.',
      'Les colporteurs vont d’un village à l’autre et racontent tout. Ce qu’on fait ici se sait aux Planches avant la nuit. Pensez-y, la prochaine fois que vous aurez la main leste.',
      'Il y a des nuits plus noires que les autres. Ces nuits-là, j’entends parler dans les murs, et ce n’est pas moi.',
      'La diseuse de bonne aventure, sous sa tente, a un chat elle aussi. Il ne parle pas. Il n’a rien à dire : elle le dit pour lui.',
    ],
    question: {
      texte: 'Dites-moi une chose. Vous préférez les chiens, ou les chats ?',
      reponses: [
        { label: 'Les chiens. Ils sont fidèles.', reaction: 'Fidèles… Ils ne savent pas faire autrement. Ce n’est pas une vertu, c’est une laisse.', rappel: 'Vous m’avez dit préférer les chiens. Je ne vous en veux pas. Je vous plains un peu, c’est tout.' },
        { label: 'Les chats, évidemment.', reaction: 'Flatteur. Je me méfie des flatteurs, mais je les préfère aux autres.', rappel: 'Vous m’aviez dit préférer les chats. Je l’ai répété aux autres chats. Ils ne vous croient pas.' },
        { label: 'Je préfère les gens.', reaction: 'Ah. Vous n’avez pas dû en rencontrer beaucoup.', rappel: 'Vous préférez les gens, disiez-vous. Comment vont-ils, ces temps-ci ?' },
      ],
    },
    service: {
      label: 'Puis-je faire quelque chose pour vous ?',
      demande: 'Un service ? Puisque vous insistez. Je voudrais un poisson. Pas une ablette, pas un goujon : un vrai poisson, de ceux qu’on sert aux gens qui paient. Cru, s’il vous plaît. La cuisine gâte tout.',
      attente: 'Mon poisson ? Je ne vois pas de poisson. Je vois quelqu’un qui parle beaucoup.',
      donner: 'Je vous ai apporté un poisson.',
      merci: '(Il le mange lentement, les yeux mi-clos, sans vous regarder.) … Ce n’était pas mauvais. Approchez. Je vais vous dire une chose. Une seule.',
      cadeau: ['(Il accepte le poisson comme on accepte un hommage.) Vous apprenez. Tenez, pour la peine : ', '(Il ne dit pas merci. Il ne dit jamais merci.) … Bon. Une chose encore : '],
    },
    secrets: [
      'le maire garde dans son secrétaire une lettre qu’il n’a jamais ouverte. Elle vient de la grande bibliothèque, et elle porte un cachet noir.',
      'l’aubergiste met de l’eau dans le vin des étrangers, et du vin dans l’eau du curé. Tout le monde est content.',
      'la porte de la poterne, à l’est de la ville, ne grince pas. Quelqu’un la graisse. Ce n’est pas le garde.',
      'quand on a mis un homme en prison, au cachot, il a gratté un mot dans la pierre. Personne n’est allé le lire. On a peur de ce qu’on lirait.',
    ],
    menace: ['Rangez ça. Les gens qui pointent ce genre de chose sur un chat finissent toujours par s’en vouloir.', 'Oh. Je vois. Bonsoir.'],
    blesse: 'Vous revoilà. J’ai une côte qui ne s’est pas recollée. Je m’en souviens chaque fois qu’il pleut. Vous ne vous en souvenez jamais, je suppose.',
    peur: 'On m’a dit, pour {nom}. Ne vous approchez pas davantage. Je vous entends très bien d’ici.',
    muet: '(Le chat vous regarde. Il n’a plus rien à vous dire, et il tient à ce que vous le sachiez.)',
    dort: ['(Il dort, roulé en boule sur le tonneau. Une oreille tourne vers vous, puis se rendort.)', '(Il dort. Sa queue bat une fois, pour dire qu’il vous a entendu et que cela ne change rien.)'],
    adieu: ['Bonsoir. Fermez bien votre porte. Ce n’est pas pour les voleurs.', 'Allez. Et ne dites à personne que vous m’avez parlé : on vous enfermerait, et je perdrais un auditoire.'],
    autres: {
      hulotte: 'Si vous aimez les conversations difficiles, il y a une hulotte, au vieux chêne, au midi de la ville. Elle ne sort que la nuit, et ne répond qu’aux questions qu’on ne lui pose pas.',
      cheval: 'Il y a aussi un vieux cheval, près de chez vous, dans les ruines des Chabert. Il est lent, mais il se souvient de tout. C’est fatigant.',
    },
    remarques: {
      crimes: 'On parle de vous, à l’auberge. Pas en bien. Moi, je trouve cela plutôt intéressant.',
      chienMort: 'Votre chien est mort, à ce qu’on dit. Je ne vais pas faire semblant d’être triste. Mais je ne dormirai pas sur sa tombe : c’est déjà ça.',
      recherche: 'Il y a une affiche, sur la place, avec un visage qui vous ressemble. Mal dessiné. Je l’ai griffée un peu, pour le principe.',
    },
    nonosFini: 'On dit que votre chien a retrouvé son os. Il le promène comme un évêque sa crosse. Grand bien lui fasse.',
  },

  // ======================================================================== la hulotte du chêne millénaire
  hulotte: {
    approche: 'Tu marches fort. On t’entend depuis le cimetière.',
    intro: 'Oui. Je te parle. Ne cherche pas qui d’autre : il n’y a que moi, et le chêne, et lui ne parle pas ta langue. Assieds-toi, ou ne t’assieds pas. L’herbe est mouillée.',
    salut: {
      nuit: ['Te voilà.', 'Tu es revenu. La nuit aussi.', 'Approche. Doucement. Il y a des choses qui dorment, ici.'],
      matin: ['Il est tard. Pour moi, il est tard. Dis vite.'],
      soir: ['Il fait encore clair. Tu es pressé.'],
      jour: ['…'],
    },
    retour: ['Tu n’étais pas venu depuis longtemps. Le chêne l’a remarqué. Il compte, lui aussi.'],
    meteo: {
      pluie: 'La pluie lave les chemins. Elle ne lave pas le reste.',
      neige: 'La neige compte les pas. Les tiens, ce soir, sont seuls. Tant mieux.',
      brouillard: 'Le brouillard. Ils aiment le brouillard ; ils lui ressemblent.',
      gel: 'Il gèle. Les morts n’ont pas froid. Ce sont les vivants qui ont froid pour eux.',
    },
    jours: {
      morts: 'C’est Vorndi. Ce soir, les morts passent sous le chêne pour aller boire. Écarte-toi du chemin, et ne dis pas leurs noms.',
      mere: 'Le jour de la Mère. As-tu porté quelque chose à la pierre ? Elle ne mange pas. Elle compte qui donne.',
    },
    nuitRouge: 'La nuit dernière, le ciel saignait. Les racines ont bu. Ne demande pas quoi.',
    qui: 'Les hommes disent la chouette, ou la dame du chêne. Le chêne m’appelle autrement. Ça ne se prononce pas avec une bouche. Appelle-moi la hulotte ; c’est assez.',
    pourquoi: [
      'Je parle parce que tu écoutes. La plupart ne m’entendent pas. Ils entendent un oiseau, et ils pressent le pas.',
      'Autrefois, toutes les bêtes parlaient, et les hommes savaient encore se taire. Puis les hommes ont parlé plus fort. Nous avons baissé la voix. Certains d’entre nous ne l’ont jamais relevée.',
    ],
    sujet: {
      label: 'Et ce chêne ?',
      lignes: [
        'Il a mille ans, ou davantage. Il ne compte pas comme toi. Il compte les hivers où on l’a oublié.',
        'Ses racines descendent plus bas que tes caves, plus bas que les puits. Ce qui est en dessous les tient, comme on tient une main.',
        'Ceux qui dorment à son pied rêvent des morts. Les morts ne mentent pas, mais ils se trompent de jour, souvent.',
        'Il y a un trou, entre ses racines. Ne descends pas sans lumière. Et si tu entends goutter, compte. Si le compte ne tombe pas juste, remonte.',
      ],
    },
    rumeurs: [
      'Il y a dans le cimetière une tombe qui n’a pas de nom. Elle a des fleurs fraîches chaque Vorndi. Personne ne les apporte.',
      'Les nuits noires, ne réponds pas quand on t’appelle par ton nom. Ceux qui t’aiment ne t’appellent pas, ces nuits-là.',
      'Un homme très grand marche parfois au bord des bois, dans un long manteau. Il n’a pas de visage. Si tu le vois, ne cours pas : il aime qu’on coure.',
      'Le vieux puits du hameau mort descend plus loin que l’eau. Une enfant y est descendue. Elle remonte, quelquefois, mais pas tout à fait.',
      'Treize pierres, sur la butte. Compte-les le jour, puis la nuit. Ne compte pas une troisième fois.',
      'Les loups ne viennent pas au chêne. Ils ont leurs raisons, et elles sont bonnes.',
      'Très haut, au-dessus de la vallée, il y a une lumière qui n’est pas une étoile. Elle ne tourne pas avec les autres.',
      'Le blanc… Non. De lui, je ne parle pas. Il passe ; on se tait.',
      'Il y a des cloches sous le lac. Il y a des voix sous la ville. Il y a des chandelles sous la montagne. La vallée a plusieurs étages, et tu n’habites que le premier.',
    ],
    question: {
      texte: 'Dis-moi. As-tu peur du noir ?',
      reponses: [
        { label: 'Oui.', reaction: 'Bien. Ceux qui n’ont pas peur ne vivent pas longtemps ici.', rappel: 'Tu m’as dit avoir peur du noir. Tu es revenu quand même, la nuit. C’est cela, le courage. Le reste est de la bêtise.' },
        { label: 'Non.', reaction: 'Tu mens, ou tu n’as pas encore vu ce qu’il y a dedans.', rappel: 'Tu m’as dit ne pas avoir peur du noir. Tu regardes pourtant derrière toi, ce soir.' },
        { label: 'Du noir, non. De ce qui s’y cache, oui.', reaction: 'Voilà une réponse qui mérite qu’on la garde.', rappel: '« De ce qui s’y cache », m’as-tu dit. Je l’ai gardé. Je m’en sers, parfois.' },
      ],
    },
    service: {
      label: 'Puis-je faire quelque chose pour toi ?',
      demande: 'Reste avec moi, sans lumière. Pas une minute : deux heures de nuit. Ne parle pas. Écoute ce qu’on entend quand on se tait.',
      attente: 'Tu n’es pas resté. Ce n’est rien. La nuit revient tous les soirs.',
      veille: 'Je reste avec toi.',
      lumiere: '(La hulotte ferme son œil.) Éteins ta lumière. La lumière fait du bruit.',
      merci: 'Tu as entendu ? Non. Tu as entendu quand même. … (Une plume se détache et descend vers vous en tournant.) Prends-la. Elle est tombée à ton intention. Garde-la près de toi la nuit : ceux qui viennent gratter aux portes ne l’aiment pas.',
    },
    menace: ['Baisse ça. Je ne fuis pas les hommes. Je fuis la bêtise.', '(Elle ne répond pas. Elle s’en va, sans un bruit.)'],
    blesse: 'Tu m’as frappée. Le chêne s’en souvient mieux que moi. Lui, il ne pardonne pas.',
    peur: 'Une voix s’est tue, par ta faute. {nom}. Je l’ai entendue se taire. Ne reste pas sous mon arbre.',
    muet: '(La hulotte vous fixe de son œil ouvert. L’autre reste fermé. Elle ne dit rien, et la nuit non plus.)',
    adieu: ['Va. Ne te retourne pas sur le chemin : ce n’est pas utile, et cela les attire.', 'Rentre avant la quatrième heure.'],
    autres: {
      crapaud: 'Au hameau mort, un crapaud garde le vieux puits. Il est gourmand et triste. Ne lui jette pas de pièce : il les compte.',
      carpe: 'Au lac, une vieille carpe porte de l’or à la lèvre. Elle est plus vieille que moi. Elle parle peu, et toujours de l’eau.',
    },
    remarques: {
      esprit: 'Tu dors mal. Je le vois à ta façon de regarder derrière toi. Ceux qui dorment mal laissent une porte entrouverte, de l’autre côté.',
      versions: 'Tu n’es pas le premier à t’arrêter sous ce chêne. D’autres sont venus de ta ferme, avant toi. Ils avaient ta démarche. Ils ne sont pas repartis par le même chemin.',
      vaisseau: 'Tu es allé très haut, et tu es revenu. Tu sens le verre et le froid. On ne revient jamais tout à fait de là-haut.',
      envers: 'Tu es passé de l’autre côté du puits. Je le vois à ton ombre : elle hésite, avant de te suivre.',
    },
    nonosFini: 'Le chien de ta ferme dort mieux. Je l’entends d’ici. Il ronge quelque chose, la nuit, et il ne gémit plus.',
  },

  // ======================================================================== le crapaud du vieux puits
  crapaud: {
    approche: 'Hé. Toi. Ne marche pas sur mes vers.',
    intro: 'Eh oui, je parle. Ne fais pas ces yeux-là ; j’ai les mêmes, en plus beaux. Approche. Je ne mords pas. Je n’ai pas de dents.',
    salut: {
      soir: ['Encore toi.', 'Ah. De la visite. C’est rare, au hameau. Les visiteurs d’ici ne marchent plus.', 'Tu sens la ville. Ça sent la soupe, la ville.'],
      nuit: ['Il est tard. Les crapauds aiment le tard. Les hommes, moins.'],
      jour: ['Il pleut. Alors je suis là. Tu as de la chance, ou tu as su attendre.'],
      matin: ['Il pleut encore ? Tant mieux.'],
    },
    retour: ['Tu reviens. Le puits t’avait oublié. Moi, non.'],
    meteo: {
      pluie: 'Il pleut ! Il pleut, et tu es venu quand même. Tu es presque un crapaud.',
      neige: 'La neige… Je devrais dormir sous la terre. Je ne dors plus beaucoup, depuis la petite.',
      brouillard: 'Le brouillard monte du puits, pas du ciel. Regarde. Regarde bien.',
    },
    jours: {
      morts: 'Vorndi. Ce soir, ça remonte, en bas. Ne te penche pas.',
      semailles: 'Primedi. On sème, partout. Ici, plus personne ne sème. La terre se souvient quand même des graines.',
    },
    nuitRouge: 'La nuit dernière était rouge. Le puits a fait un bruit de gorge toute la nuit. Je suis resté sous la pierre.',
    qui: 'Mon nom est tombé dans le puits, il y a longtemps. Appelle-moi le Crapaud. C’est ce que je suis, et c’est ce qui reste.',
    pourquoi: [
      'Je parle parce que je me suis assis trop longtemps au bord. Ce qui est en bas parle. À force d’écouter, j’ai appris.',
      'Au fond, on parle une langue d’avant. Je n’en ai appris que les mots tristes. Ils suffisent pour presque tout.',
    ],
    sujet: {
      label: 'Et ce puits ?',
      lignes: [
        'Il n’y a plus d’eau dedans, ou alors pas la bonne. Quand on y laisse tomber une pierre, on l’entend toucher le fond deux fois.',
        'Les gens y jettent des pièces et des vœux. Je compte les pièces. Les vœux, eux, descendent tout seuls.',
        'La petite du hameau, Lise. Elle s’est penchée, une nuit, parce qu’on l’appelait. Je l’ai vue passer. Elle avait l’air de savoir où elle allait.',
        'Il y a l’autre côté. Au fond, l’eau se referme au-dessus de toi, et tu respires. Ne reste pas trop longtemps, là-bas : on y oublie de quel côté est le haut.',
      ],
    },
    rumeurs: [
      'Il y a un miroir, au hameau. Ne te regarde pas dedans plus longtemps qu’il ne te regarde.',
      'La balançoire bouge les soirs sans vent. Je ne regarde pas qui la pousse. Je te conseille la même politesse.',
      'Cette année, trente-sept pièces dans le puits. Trois fausses. Les fausses, je les garde ; elles sont plus honnêtes.',
      'Les feux follets du marais sont des gens qui se sont trompés de chemin en rentrant. Ils cherchent encore. Ne les aide pas.',
      'Il y a des pierres gravées partout dans la vallée, dans une langue que personne ne lit plus. Moi non plus. Mais je sais qu’elles disent toutes à peu près la même chose : attention.',
      'Ceux qui descendent à la mine entendent frapper dans la roche. Ce ne sont pas des échos. Les échos ne frappent pas en retard.',
      'On a enterré un sou dans chaque mur du hameau quand on l’a bâti. Il faut payer la terre pour qu’elle vous porte. On a oublié de payer, une fois.',
      'Les sangsues du marais ont meilleure mémoire que les hommes. Elles se souviennent du goût de chacun.',
    ],
    question: {
      texte: 'Dis-moi. Tu as déjà fait un vœu, toi ?',
      reponses: [
        { label: 'Oui. Il ne s’est pas réalisé.', reaction: 'Ils se réalisent tous. Pas toujours pour celui qui l’a fait.', rappel: 'Ton vœu, celui qui ne s’est pas réalisé… Regarde mieux autour de toi. Il s’est peut-être trompé de maison.' },
        { label: 'Jamais.', reaction: 'Prudent. Les vœux sont des dettes.', rappel: 'Toujours pas de vœu ? Bien. Le puits n’aime pas les gens qui ne lui doivent rien. Moi, si.' },
        { label: 'Je ne te le dirai pas.', reaction: 'Tu as raison. Un vœu qu’on raconte se noie.', rappel: 'Ton vœu, celui que tu gardes… Il est encore à la surface. Je le vois flotter.' },
      ],
    },
    service: {
      label: 'As-tu besoin de quelque chose ?',
      demande: 'Un service ? J’ai faim depuis la Saint-Jean. Apporte-moi des vers. Trois. Des gros, de ceux qui sortent après la pluie.',
      attente: 'Pas de vers. Je les sentirais. Je sens tout ce qui se tortille.',
      donner: 'Je t’ai apporté des vers.',
      merci: '(Il les avale l’un après l’autre, en fermant les yeux à chaque fois.) … Voilà. Maintenant, approche ta main. Non, plus près. (La pierre de son front se détache, tiède, dans votre paume.) Prends-la. Elle était lourde. On dit qu’elle chauffe quand le venin est dans le sang, et qu’elle le boit. On dit vrai. Elle ne vaut rien prise à un crapaud mort ; souviens-t’en, si un jour on t’en propose une.',
      cadeau: ['(Il avale. Il ferme les yeux. Il les rouvre, plus doux.) Merci. Tiens, pour la peine : ', '(Il mange.) … Tu deviens gentil. Méfie-toi : '],
    },
    secrets: [
      'la balançoire, c’est elle qui la pousse. Lise. Ne la regarde pas faire, elle s’arrête, et elle est triste après.',
      'si tu passes de l’autre côté, ne mange rien là-bas. Même si ça a le goût de chez toi.',
      'le puits compte les pièces, mais il compte aussi ceux qui se penchent. Tu en es à trois fois. Ne va pas jusqu’à treize.',
    ],
    menace: ['Tu vas me tuer pour une pierre ? Tu ne serais pas le premier à essayer.', 'Non. Non, non.'],
    blesse: 'Tu m’as fait mal. Les crapauds ne pleurent pas. Ça ne veut pas dire que ça ne fait pas mal.',
    peur: 'Tu as tué {nom}. Le puits l’a su avant moi. Il en parle encore, en bas.',
    muet: '(Le crapaud vous regarde de ses yeux d’or. Il ne dira plus rien. Le puits non plus.)',
    adieu: ['Va. Et ne jette rien dans le puits en partant : j’ai assez compté pour ce soir.', 'Reviens quand il pleuvra. Je suis plus aimable mouillé.'],
    autres: {
      chevre: 'Là-haut, à l’estive, il y a une vieille chèvre qui parle aussi. Elle me méprise. Elle a raison, mais elle n’est jamais descendue me le dire en face.',
      renarde: 'Une renarde, près de la maison des chasseurs, dans les bois du nord. Elle ment comme elle respire. Elle respire beaucoup.',
    },
    remarques: {
      envers: 'Tu es descendu. Tu es passé de l’autre côté et tu es revenu. Tu as de la vase sous les ongles, de la vase d’en bas. Elle ne part pas au savon.',
      lise: 'La petite t’a vu, l’autre soir. Elle m’a demandé qui tu étais. Je n’ai pas su quoi lui dire.',
    },
  },

  // ======================================================================== Tiécelin, le corbeau de la Table des Géants
  corbeau: {
    approche: 'Tu grimpes pour rien. Ou pour moi. C’est pareil.',
    intro: 'Eh bien ? Un corbeau qui parle, ça te coupe le sifflet ? Il y a pire, dans cette vallée. Il y a des choses qui parlent et qui n’ont pas de bec.',
    salut: {
      jour: ['Tiens. Le fermier.', 'Qu’est-ce que tu m’apportes ?', 'Te voilà. Je t’ai vu venir depuis le chemin. Tu marches comme quelqu’un qui a une dette.'],
      matin: ['Le matin. Les vers sortent, les morts rentrent. C’est l’heure des corbeaux.'],
      soir: ['Il se fait tard. Je ne parle plus beaucoup quand le soleil descend. Dis vite.'],
      nuit: ['…'],
    },
    retour: ['Tu reviens. Je croyais que les loups t’avaient eu. J’étais presque déçu.'],
    meteo: {
      pluie: 'La pluie. Les vers sortent, les hommes rentrent. Tout le monde y gagne.',
      neige: 'La neige. D’en haut, la vallée est une page blanche ; on lit tout ce qui marche dessus.',
      brouillard: 'Le brouillard. Je ne vois plus rien d’en haut. Je déteste ne rien voir. C’est là que les autres voient.',
      orage: 'Orage. Ce soir, je dormirai sous la Table. Ceux d’en haut chassent, les nuits d’orage, et ils ne font pas la différence entre un corbeau et un homme.',
    },
    jours: {
      chasse: 'Chassedi. Les fusils sont de sortie. Si tu entends rire derrière un buisson, ce n’est pas moi.',
      morts: 'Vorndi. Tout le monde va au cimetière, et moi aussi. Je ne prie pas. Je regarde ce qu’on laisse.',
    },
    nuitRouge: 'La nuit dernière était rouge. Je suis resté sous la Table. Elle est faite pour ça, au fond : abriter.',
    qui: 'Tiécelin. Comme le corbeau du conte, celui qui a lâché son fromage. Ce n’était pas moi. C’était mon arrière-grand-père, et il était jeune.',
    pourquoi: [
      'Un homme m’a appris, il y a longtemps. Il m’avait pris au nid et me disait des mots pour se sentir moins seul. Il est mort. J’ai gardé les mots. Et sa voix, quand je veux.',
      '(Il parle avec la voix d’un vieil homme, enrouée, très douce.) « Tiécelin, mon petit, ne va pas sur la Table. » … (De sa voix.) Je vais sur la Table. Il est mort, lui.',
    ],
    sujet: {
      label: 'Et cette pierre ?',
      lignes: [
        'La Table des Géants. Ils mangeaient dessus, à ce qu’on dit. Moi, je dis qu’ils ne mangeaient pas : ils posaient.',
        'Des géants, il en reste. Là-haut, au nord, dans les rochers. Ils dorment beaucoup. Quand ils se retournent, la montagne fait un bruit de porte.',
        'Le cercle, à l’ouest, sur la butte. Les hommes disent treize pierres. Je les ai comptées d’en haut : il en manque une, les nuits sans lune.',
        'Le château, au nord. Il y avait de l’or, et un comte qui avait peur. L’or est sous la terre, et les bornes regardent toutes le même endroit. Je ne sais pas lire, mais je sais suivre un regard.',
      ],
    },
    rumeurs: [
      'L’abbaye, en haut, a un moine qui marche au crépuscule. Il n’a pas de visage. D’en haut, on voit qu’il n’a pas d’ombre non plus.',
      'Les colporteurs vont du bourg aux Planches et des Planches à l’estive. Ils portent plus de nouvelles que de marchandises.',
      'Le glacier, au nord, rend des choses l’été. Des bâtons, des sacs, une fois une main. Il garde le reste.',
      'Il y a dans la vallée une pierre ronde, très haut, qui luit la nuit. Les oiseaux n’y vont pas. Ils sentent qu’on n’en revient pas pareil.',
      'Les hommes du bourg cherchent toujours un coupable avant de chercher la vérité. Ça leur fait gagner du temps.',
      'Il y a trois jours, quelqu’un a pleuré au cimetière. Personne n’était mort, ce jour-là. Pas encore.',
      'La bibliothèque, là-haut, prête des livres. Les livres reviennent. Les gens, moins.',
      'Les loups suivent les corbeaux, et les corbeaux suivent les loups. On ne sait plus qui a commencé. On mange bien, des deux côtés.',
    ],
    question: {
      texte: 'Tu sais ce qui brille le plus, dans la vallée ?',
      reponses: [
        { label: 'L’or.', reaction: 'Bête réponse. L’or est jaune. Ça ne brille qu’au soleil, et le soleil ne dure pas.', rappel: 'Toujours l’or, hein ? Tu n’as rien appris.' },
        { label: 'Les yeux des loups, la nuit.', reaction: 'Pas mal. Pas mal du tout.', rappel: 'Les yeux des loups. Tu y repenses, la nuit ? Moi, oui.' },
        { label: 'L’eau du lac, le matin.', reaction: 'Tu regardes. C’est rare.', rappel: 'L’eau du lac le matin, m’as-tu dit. J’y suis allé voir. Tu avais raison. Je ne te le pardonne pas.' },
      ],
    },
    service: {
      label: 'Tu veux quelque chose ?',
      demande: 'Un service ? Apporte-moi quelque chose qui brille. Une pièce ancienne, un bijou, une cuillère d’argent… Ce que tu voudras, tant que ça brille. Je paie en choses qu’on ne trouve pas dans les boutiques.',
      attente: 'Rien qui brille. Tu me fais perdre mon temps. J’en ai beaucoup, mais il est à moi.',
      donner: 'J’ai quelque chose qui brille.',
      merci: '(Il le prend dans son bec, le retourne au soleil, le cache sous son aile.) Bien. Je vais te dire un endroit. Un seul. Ouvre tes oreilles, pas ta bouche.',
      cadeau: ['(Il saisit l’objet et le fait disparaître.) Tu deviens raisonnable. Écoute : ', '(Il cache l’objet sous la pierre.) Bon. Pour celle-là : '],
    },
    secrets: [
      'le chasseur a posé ses pièges près du sentier du relais. Un de trop. Il ne s’en souvient pas. Marche à côté du chemin, pas dessus.',
      'il y a un homme du bourg qui va au cimetière la nuit et qui creuse un peu, puis rebouche. Il ne vole rien. Il vérifie.',
      'les cygnes du lac ne sont à personne. Ou plutôt si : à quelqu’un qu’on ne voit pas. Ne les tire pas, même pour rire.',
    ],
    menace: ['Ah ! Une arme ! (Il éclate d’un rire de vieil homme.) Vise mieux que le dernier.', 'Pas aujourd’hui.'],
    blesse: 'Tu m’as touché. Je ne vole plus tout à fait droit. Tant mieux : on me voit venir de moins loin, et on se méfie de moins près.',
    peur: 'On a tué {nom}. C’est toi. Je l’ai vu d’en haut. Je vois tout d’en haut.',
    muet: '(Le corbeau vous tourne le dos. Il lisse la plume blanche de son aile et ne vous regarde plus.)',
    adieu: ['Va. Je te regarderai partir. Je regarde toujours partir.', '(Avec la voix d’une vieille femme.) « Rentre avant la nuit, mon petit. » … Ce n’était pas pour toi.'],
    autres: {
      chat: 'En ville, un gros chat gris vit sur un tonneau, devant l’auberge. Il parle comme un notaire. Il sait tout ce qui se dit sous les toits, et il le vend cher.',
      chevre: 'À l’estive, à l’ouest, il y a une vieille chèvre écornée. Elle et moi, on ne se parle plus depuis l’hiver de la grande neige.',
    },
    remarques: {
      crimes: 'Je t’ai vu. Tu sais où, tu sais quand. Je ne dirai rien : les corbeaux ne parlent pas aux gendarmes. Ils mangent ce qu’ils laissent.',
      chasse: 'Tu as tué beaucoup de bêtes, ces jours-ci. Je ne me plains pas : je passe après.',
      vaisseau: 'Tu es monté à la pierre ronde. Je t’ai vu passer dans la lumière, et je t’ai vu revenir. Tu es revenu plus léger. Je me demande de quoi.',
    },
    nonos: 'Un os ? Ça ne brille pas, un os. … J’ai vu le chien de ta ferme, d’en haut. Il tourne en rond. Les chiens cherchent en rond ; c’est pour ça qu’ils trouvent si peu. Toi, regarde ce qu’on te montre, et va droit.',
    nonosFini: 'Ton chien a retrouvé son os. Je l’ai vu le traîner jusqu’à sa niche, la tête haute. Ridicule. Touchant. Surtout ridicule.',
  },

  // ======================================================================== Hermeline, la renarde du relais de chasse
  renarde: {
    approche: 'Chut. Ils boivent, à côté. Parle bas.',
    intro: 'Oui, je parle. Ne crie pas, ne cours pas, ne va pas chercher les hommes du relais : ils ne te croiraient pas, et ils me tireraient dessus pour la peine. Assieds-toi dans l’herbe. Pas sur la fougère ; c’est ma chambre.',
    salut: {
      soir: ['Te voilà, toi.', 'Bonsoir, mon joli. Tu as l’air d’avoir faim. Moi aussi.', 'Tu reviens. Je savais que tu reviendrais. Je mens : je l’espérais.'],
      nuit: ['Il est tard. Les honnêtes gens dorment. Nous sommes donc entre nous.'],
      matin: ['L’aube. C’est l’heure où les renards rentrent et où les menteurs dorment. Je suis les deux.'],
      jour: ['…'],
    },
    retour: ['Tu m’as oubliée, ces jours-ci. Ce n’est rien. Moi aussi, je t’avais oublié. Je mens.'],
    meteo: {
      pluie: 'La pluie efface les odeurs. Les chasseurs ne trouvent plus rien, et moi non plus. Tout le monde est de mauvaise humeur.',
      neige: 'La neige, c’est terrible. On voit mes traces jusqu’au terrier. Je marche à reculons, le matin.',
      brouillard: 'Le brouillard. Le meilleur temps du monde. On passe sous le nez des chiens.',
    },
    jours: {
      chasse: 'Chassedi ! Va-t’en, ils sont tous là. Ne reste pas près de moi : ça finirait mal pour l’un de nous deux.',
      morts: 'Vorndi. Les hommes vont au cimetière. Les renards vont aux poulaillers. Chacun ses morts.',
    },
    nuitRouge: 'Hier, la nuit était rouge. J’ai mis mes petits sous la grosse racine et je suis restée devant, toute la nuit. Rien n’est venu. Ou alors c’était poli.',
    qui: 'Hermeline. Comme la femme de Renart, dans le livre. Je l’ai lu par-dessus l’épaule d’un enfant, au bord du chemin. Il sentait la tartine.',
    pourquoi: [
      'Je parle parce que je mens. Une bête qui ne parle pas ne peut pas mentir, et c’est triste à mourir.',
      'La vérité ? Ma mère parlait, et sa mère avant elle. On parle, chez nous, depuis qu’un renard a volé la langue d’un curé. C’est un mensonge. Peut-être.',
    ],
    sujet: {
      label: 'Et les chasseurs ?',
      lignes: [
        'Le relais, là. Ils boivent, ils comptent leurs bêtes, ils se racontent les mêmes histoires. Le meilleur endroit pour ne pas être chassée, c’est sous le nez de ceux qui chassent.',
        'Le chasseur du relais tire bien, mais trop tôt. Il m’a manquée trois fois. La quatrième, je lui laisserai une poule devant la porte. Pour l’humilier.',
        '(Elle lève sa patte de devant, celle à qui il manque deux doigts.) Les pièges. Il y en a qui se referment comme une bouche. Je sais où ils sont. Toi, tu ne sais pas. Marche dans l’herbe courte.',
        'Sous la forêt, il y a des galeries qui ne sont pas à nous. Le blaireau dit que ce sont des hommes petits, qui cognent. Le blaireau ment aussi, mais moins bien que moi.',
      ],
    },
    rumeurs: [
      'La guérisseuse, dans la forêt, a une hutte qui sent la fumée et le sucre. Elle parle aux corbeaux. Les corbeaux lui répondent, eux.',
      'Les loups ne descendent que la nuit, et jamais quand il y a un feu. Si tu n’as pas de feu, aie au moins une lanterne, et ne cours pas.',
      'Les poules du hameau ont une mauvaise réputation. Elles l’ont méritée : elles parlent de moi.',
      'Le Chassedi, ne marche pas dans les bois en habit brun. Ils tirent sur tout ce qui bouge et qui est brun. Une année, ils ont tiré sur un curé.',
      'J’ai vu un homme très grand, au bord du bois, une nuit. Il n’avait pas d’odeur. Tout a une odeur, même les pierres. Lui, non.',
      'Je mens souvent. Là, non. Enfin, je crois.',
      'Il y a un ours, plus haut, qui ne dort pas l’hiver. Il ne faut pas le regarder dans les yeux, ni lui tourner le dos. Bonne chance.',
      'Les champignons qui brillent, dans les bois, la nuit, ne sont pas à manger. Ils sont à regarder. Ce n’est pas pareil.',
    ],
    question: {
      texte: 'Dis-moi. Si tu trouvais une poule perdue sur le chemin, tu ferais quoi ?',
      reponses: [
        { label: 'Je la ramènerais à sa ferme.', reaction: 'Honnête. C’est mignon. Je mangerai donc les poules des autres.', rappel: 'Toujours à ramener les poules perdues ? Tu dois avoir une grande ferme, à force.' },
        { label: 'Je la mangerais.', reaction: 'Ah ! Une âme sœur. Ne le dis pas au curé.', rappel: 'Toi, la poule perdue, tu la mangerais. On se comprend, toi et moi. Ça m’inquiète un peu.' },
        { label: 'Je te la donnerais.', reaction: 'Menteur. Mais menteur gentil. J’accepte quand même.', rappel: 'Tu m’avais promis une poule, une fois. Je l’attends encore. Je suis patiente : je suis renarde.' },
      ],
    },
    service: {
      label: 'Tu as besoin de quelque chose ?',
      demande: 'Un service ? Un œuf. Un œuf de poule, pas de cane : les canes pondent des œufs qui sentent l’étang. Un seul. Je suis raisonnable, pour une renarde.',
      attente: 'Pas d’œuf ? Tu n’as donc pas de poules, à ta ferme ? Mon pauvre.',
      donner: 'Je t’ai apporté un œuf.',
      merci: '(Elle le prend délicatement entre ses dents et le pose dans l’herbe, comme une chose précieuse.) Merci. Pour la peine, je vais te dire une vérité. Une vraie. Écoute bien, je n’en dis pas deux.',
      cadeau: ['(Elle prend l’œuf, très doucement.) Tu es gentil. Trop. Tiens, une vérité de plus : ', '(L’œuf disparaît sous la fougère.) Encore un… Bon. Écoute : '],
    },
    secrets: [
      'le coffre du relais n’est pas fermé à clé. Le chasseur fait semblant. Il veut savoir qui ose.',
      'la grosse racine, derrière moi, c’est là que dorment mes petits. Si tu y touches, je saurai. Si tu n’y touches pas, je saurai aussi.',
      'les pièges des chasseurs, le Chassedi, sont posés le matin et relevés le soir. Ceux qui restent la nuit ne sont pas aux chasseurs.',
    ],
    menace: ['Oh, non, non. Pas ça. Je connais ça.', 'Tu me vises ? Charmant.'],
    blesse: 'Tu m’as touchée. J’avais une patte qui ne marchait plus, et maintenant une épaule. Il me reste deux pattes pour te détester.',
    peur: 'Tu as tué {nom}. On le sait, dans les bois. Ne m’approche pas. Je mens, mais pas sur ça.',
    muet: '(La renarde vous regarde un instant, sans un mot, puis s’efface entre les fougères.)',
    adieu: ['File. Et regarde où tu poses les pieds.', 'Bonne nuit, mon joli. Ne rêve pas de moi : je n’y serai pas.'],
    autres: {
      corbeau: 'Sur la lande, à l’est, il y a un corbeau qui se prend pour un notaire sur une table de pierre. Tiécelin. Il vole tout ce qui brille et revend ce qu’il sait.',
      carpe: 'Au lac, au bout du ponton, il y a une vieille carpe. Je l’ai vue avaler un caneton entier. Elle dit que non.',
    },
    remarques: {
      pieges: 'Tu as posé des pièges. Ça sent le fer et ta sueur, jusqu’ici. Je ne te le pardonnerai pas tout de suite.',
      chasse: 'Tu sens la poudre. Beaucoup. Tu as tué de mes cousins, cette semaine ?',
      chien: 'Ton chien m’a couru après, une fois. Il était gentil. Il ne m’a pas rattrapée ; c’est pour ça qu’il était gentil.',
    },
    nonos: 'L’os du chien ? Ce n’est pas moi. Pourquoi tout le monde pense toujours au renard ? … Je ne l’ai pas, je le jure sur ma queue. Mais ce qui est perdu se trouve d’abord avec les yeux, ensuite avec les pattes. Ne cherche pas où c’est facile.',
    nonosFini: 'Ton chien a retrouvé son os. Il est passé devant mon terrier en le portant comme une couronne. Je ne l’ai même pas regardé. Enfin, si.',
  },

  // ======================================================================== l'Écornée, la vieille chèvre de l'estive
  chevre: {
    approche: 'Tu as le souffle court, l’homme d’en bas. Assieds-toi, ou tombe, mais choisis.',
    intro: 'Oui, je parle. Ferme la bouche, le vent va y entrer. Les chèvres parlent toutes ; les autres sont bêtes, c’est tout. Toi aussi, tu es bête, mais tu es monté, et ça compte.',
    salut: {
      jour: ['Encore l’homme d’en bas.', 'Ah. Tu es monté.', 'Tu as mis le temps. La montagne ne bouge pas, pourtant.'],
      matin: ['Le jour se lève. En haut, il se lève une heure plus tôt qu’en bas. Vous dormez trop, en bas.'],
      soir: ['Le soleil descend. Toi aussi, bientôt, si tu es sage.'],
      nuit: ['…'],
    },
    retour: ['Tu reviens. Je croyais que la montagne t’avait fait peur. C’est bien qu’elle t’ait fait un peu peur.'],
    meteo: {
      pluie: 'La pluie, en haut, ce n’est pas de la pluie. C’est le nuage qui se pose. Il est lourd, il sent le fer.',
      neige: 'La neige arrive. Dans trois jours, on ne monte plus. Toi, tu ne monteras plus jamais, si tu traînes.',
      brouillard: 'Le brouillard. Ne quitte pas le sentier. Les crevasses aussi aiment le brouillard.',
      gel: 'Il gèle. Le baïle a rentré les bêtes, sauf moi. Je ne rentre pas. Je ne suis à personne.',
    },
    jours: {
      mere: 'Le jour de la Mère. En bas, vous posez des fruits sur des pierres. En haut, on ne pose rien : on laisse l’herbe pousser. C’est une offrande aussi.',
      morts: 'Vorndi. Le baïle ne siffle pas, ce jour-là. Il dit que ceux d’en haut l’entendraient. Il a raison.',
    },
    nuitRouge: 'La nuit dernière était rouge. Les sonnailles ont sonné toutes seules. Toutes. Même celles du cairn.',
    qui: 'L’Écornée. C’est le baïle qui m’appelle comme ça. Ma corne, je l’ai laissée dans le ventre d’un loup. Il l’a gardée.',
    pourquoi: [
      'Parce que j’ai quelque chose à dire, et que les autres chèvres sont bêtes.',
      'Une nuit d’hiver, il y a longtemps, je suis montée trop haut, jusqu’aux pierres où personne ne va. Il y avait quelqu’un, assis, qui regardait la vallée. Il m’a parlé. Quand je suis redescendue, je savais répondre.',
    ],
    sujet: {
      label: 'Et la montagne ?',
      lignes: [
        'La montagne ? Elle est là-haut, et toi, tu es en bas. C’est dans cet ordre-là qu’il faut s’en souvenir.',
        'Le glacier des Treize a des crevasses qui se ferment la nuit et s’ouvrent le matin. Une fois, il a mangé un berger et rendu son chien.',
        'Sur la crête, quand le vent tourne, on entend sonner une cloche qui n’est pas la mienne. Ce sont ceux d’en haut qui comptent leurs bêtes.',
        'Sous le col, il y a une falaise fendue de haut en bas. La nuit, ça cogne dedans, et ça chante faux. Les chèvres n’y vont pas : on y trouve du sel que personne n’a posé.',
      ],
    },
    rumeurs: [
      'Le baïle est dur, mais il est juste. Il a perdu une sonnaille, sur la crête. Il dit que c’est le vent. Le vent ne détache pas les colliers.',
      'Les géants dorment au nord, dans les rochers. Ne marche pas sur ce qui ressemble à une main.',
      'Le refuge du col est ouvert à tous. C’est pour ça que tout le monde y est mort, une fois ou l’autre.',
      'Le lac gelé, là-haut, ne gèle pas : il dort. Si tu fais un trou dedans, fais-le petit.',
      'Les Frappeurs, dans la roche. Si tu entends trois coups et un, va du côté du un.',
      'Les loups de l’estive ont peur des sonnailles. Pas de la mienne. De celle du cairn.',
      'Ceux d’en bas, à la ville, croient que la montagne leur appartient parce qu’ils l’ont dessinée sur un papier. Le papier, je l’ai mangé.',
      'Il y a une pierre plate, au plan d’en haut, plus haute qu’un homme. On dirait une porte. Personne ne fauche l’herbe devant. Moi non plus.',
    ],
    question: {
      texte: 'Dis-moi, l’homme d’en bas. Tu montes souvent, ou tu restes en bas ?',
      reponses: [
        { label: 'Je monte dès que je peux.', reaction: 'Menteur. Tu as les mollets de quelqu’un d’en bas. Mais c’est gentil.', rappel: 'Tu disais monter dès que tu peux. Tu n’as pas pu souvent, on dirait.' },
        { label: 'Je reste en bas, j’ai une ferme.', reaction: 'Une ferme. Des murs, des clôtures, des bêtes enfermées. Je te plains, et les bêtes encore plus.', rappel: 'Et ta ferme, en bas ? Tes bêtes sont toujours enfermées ? Ouvre-leur, un jour. Pour voir.' },
        { label: 'J’ai peur de la montagne.', reaction: 'Bien. C’est le début de l’intelligence.', rappel: 'Tu as toujours peur de la montagne ? Tant mieux. Elle, elle n’a pas peur de toi.' },
      ],
    },
    service: {
      label: 'Tu as besoin de quelque chose ?',
      demande: 'Un service ? Du sel. Le baïle en donne aux autres et pas à moi : il dit que je suis assez salée comme ça. Apporte-m’en deux poignées.',
      attente: 'Pas de sel. Alors pas de service. C’est simple, la montagne.',
      donner: 'Je t’ai apporté du sel.',
      merci: '(Elle lèche le sel dans votre main, longuement. Sa langue râpe comme une lime.) … Bon. Tu n’es pas tout à fait inutile. Écoute.',
      cadeau: ['(Elle lèche le sel, les yeux fermés.) Tu apprends. Alors écoute encore : ', '(Elle mâche, pensive.) … Bon. Une chose : '],
    },
    secrets: [
      'au plan d’en haut, sous la pierre qui ressemble à une porte, quelqu’un chante, certaines nuits. Le baïle l’entend aussi. Il fait semblant de ronfler.',
      'les marques sur les rochers sont les noms des familles d’ici. Il y en a une que plus personne ne porte. On ne repasse pas son trait.',
      'quand le brouillard monte de la vallée, ne descends pas. Attends qu’il redescende. Il y a des choses qui montent avec lui.',
    ],
    menace: ['Pose ça, l’homme d’en bas. J’ai déjà vu des fusils. J’ai vu ceux qui les tenaient, après.', 'Bon. Je m’en vais.'],
    blesse: 'Tu m’as fait mal. Je l’ai dit au baïle. Il ne m’a pas crue, mais il t’a regardé de travers, et ça me suffit.',
    peur: 'Tu as tué {nom}. Le vent l’a monté jusqu’ici. Reste en bas.',
    muet: '(La chèvre vous regarde, mâche, et vous tourne le dos. La sonnaille tinte une fois.)',
    adieu: ['Redescends. Il va faire froid.', 'Va. Et ne siffle pas en descendant : ça fait tomber les pierres.'],
    autres: {
      corbeau: 'Il y a un corbeau, à l’est, sur la Table des Géants. Tiécelin. Un voleur, un bavard, un malin. Ne lui donne rien de valeur. Ou alors si : il paie bien.',
      crapaud: 'En bas, au hameau mort, il y a un crapaud qui parle. Je ne l’ai jamais vu. Je ne descends pas si bas.',
    },
    remarques: {
      chasse: 'Tu sens la poudre et le sang. Les chamois t’ont vu venir de l’autre versant. Moi aussi.',
      froid: 'Tu n’as pas de manteau. En haut, le froid tue plus vite que les loups. Il est plus patient, aussi.',
    },
  },

  // ======================================================================== la vieille carpe du ponton
  carpe: {
    approche: '(Sous les planches, une grande ombre dorée remonte lentement. Une bulle crève à la surface.) … Bonjour, mon enfant.',
    intro: 'Oui. C’est moi qui parle, sous vos pieds. Ne vous penchez pas trop ; le lac aime qu’on se penche. Asseyez-vous au bord des planches. Nous avons le temps. Moi, du moins.',
    salut: {
      matin: ['Bonjour, mon enfant. L’eau est calme : profitons-en.', 'Ah. Vous. Le matin vous va bien. Il va bien à tout le monde, avant le soleil.'],
      soir: ['Le soir monte. C’est l’heure où l’on parle bas, sur l’eau.', 'Vous revoilà. Les planches ont craqué ; j’ai su que c’était vous.'],
      jour: ['…'],
      nuit: ['…'],
    },
    retour: ['Il y a longtemps, mon enfant. Pour vous. Pour moi, c’était hier. Pour le lac, c’est maintenant.'],
    meteo: {
      pluie: 'La pluie sur le lac, c’est comme des doigts sur une table. Nous comptons, en dessous.',
      brouillard: 'Le brouillard. On ne voit plus l’autre rive. Ne cherchez pas à la voir.',
      chaleur: 'Il fait chaud. Je ne reste pas. Les vieilles carpes aiment le froid du fond.',
      gel: 'Il gèle au bord. Bientôt, une peau de verre sur le lac. Ne marchez jamais dessus, même si elle vous porte.',
    },
    jours: {
      peche: 'Pêchedi. Ils sont tous au bord avec leurs cannes. Je ne monterai pas longtemps aujourd’hui ; vous comprendrez.',
      morts: 'Vorndi. Ce soir, les Planches allument des chandelles sur l’eau. Elles descendent. Nous les regardons passer.',
    },
    nuitRouge: 'La nuit dernière, l’eau était rouge en surface. En dessous, elle était noire. Je suis restée au fond, avec les cloches.',
    qui: 'On ne nomme pas les carpes, mon enfant. On les mange. Moi, on m’a baguée. Les pêcheurs m’appellent la Vieille, à voix basse. C’est assez.',
    pourquoi: [
      'Je parle parce que j’ai vécu plus longtemps que ma bouche n’aurait dû. Après cent ans, l’eau vous apprend des mots. Après deux cents, on s’en sert.',
      'Le comte qui m’a passé cet anneau parlait aux carpes de son étang. Il nous racontait ses peurs, la nuit, à genoux sur la margelle. J’étais la seule à écouter. J’ai appris sa langue en même temps que ses peurs.',
    ],
    sujet: {
      label: 'Et cet anneau ?',
      lignes: [
        'Cet anneau ? C’est de l’or, mon enfant, et c’est à moi. Un seigneur me l’a passé à la lèvre quand j’étais petite et lui jeune. Les seigneurs faisaient cela, en ce temps-là, pour savoir qui vivrait le plus longtemps.',
        'Valmont. Il s’appelait Valmont. Il avait un étang au pied du château, et beaucoup trop d’or. Quand la Révolution est montée dans la vallée, il a vidé l’étang une nuit et porté ses carpes au lac. Son or, il l’a porté ailleurs.',
        'Il comptait ses pas, ce comte. Toujours par quatre, et il gravait ce qu’il comptait. Les hommes appellent cela des bornes. Moi, j’appelle cela de la peur.',
        'Au milieu du lac, il y a un clocher. Les nuits d’orage, la cloche sonne. Elle ne sonne pas pour les vivants. Si vous l’entendez, ne répondez pas, et ne plongez pas.',
      ],
    },
    rumeurs: [
      'Elle… Non. Je ne parle pas d’Elle. Elle entend tout ce qui touche l’eau. Même ceci.',
      'Les cygnes du lac ne sont pas à vous. Ne les tirez pas. On ne vous le pardonnerait pas, ni ici ni ailleurs.',
      'Le passeur des Planches ne siffle jamais sur l’eau. Il a raison. Sous l’eau, on entend siffler, et on remonte voir.',
      'Les pêcheurs croient que le poisson mord mieux la nuit. Ce n’est pas le poisson qui mord, la nuit.',
      'Au fond, il y a des maisons, un lavoir, une école. Les enfants y ont laissé leurs sabots sur le seuil. Ils les attendent encore.',
      'La rivière apporte ce que la ville jette. J’ai mangé une lettre d’amour, une fois. Elle était amère.',
      'Il y a un vieux brochet dans les douves de la ville. Ne le pêchez pas. Il garde quelque chose, lui aussi.',
      'Le marais, au midi du lac, est plein de gens qui ont cru connaître le chemin. Ils ont des lumières, la nuit. Ne les suivez pas.',
    ],
    question: {
      texte: 'Dites-moi, mon enfant. Savez-vous nager ?',
      reponses: [
        { label: 'Oui, très bien.', reaction: 'Bien. Alors vous savez aussi qu’on ne remonte pas toujours par le même endroit.', rappel: 'Vous nagez très bien, disiez-vous. Ne nagez pas au milieu du lac, les nuits d’orage. Même très bien.' },
        { label: 'Pas du tout.', reaction: 'Alors restez sur les planches. L’eau aime ceux qui ne savent pas nager. Elle les garde.', rappel: 'Vous ne savez toujours pas nager ? Gardez cela. C’est une protection, ici.' },
        { label: 'Un peu.', reaction: '« Un peu », c’est ce que disaient les noyés de Saint-Aubin.', rappel: 'Toujours « un peu », mon enfant ? Le lac, lui, nage très bien.' },
      ],
    },
    service: {
      label: 'Puis-je faire quelque chose pour vous ?',
      demande: 'Un service ? Promettez-moi de ne pas pêcher de carpe pendant sept jours. Ce sont mes filles, mes petites-filles, et leurs petites. Sept jours. Je saurai si vous mentez.',
      promettre: 'Je vous le promets.',
      refuser: 'Je ne peux pas promettre.',
      refus: 'Bien. Au moins, vous ne mentez pas. C’est déjà beaucoup, pour un homme.',
      accepte: 'Sept jours, alors. L’eau compte avec moi.',
      attente: 'Encore {n} jours. L’eau compte avec moi, mon enfant.',
      rompu: 'Vous avez pêché l’une des miennes. L’eau me l’a dit. Je ne vous demanderai plus rien.',
      merci: 'Sept jours. Vous avez tenu. Les hommes tiennent si rarement. … Attendez. (Elle descend. Longtemps. Puis quelque chose de petit brille sur les planches, tout près de votre main.) Le lac me l’a rendu il y a longtemps. Une bague de noyée. Elle était trop petite pour moi.',
    },
    menace: ['Une arme ? Mon enfant, j’ai survécu à des comtes.', '(La grande ombre s’enfonce sans un bruit.)'],
    blesse: 'Vous m’avez blessée. L’eau a goûté mon sang. Elle n’oublie pas les goûts.',
    peur: 'On me dit que {nom} ne parlera plus. L’eau me l’a dit. Ne vous penchez pas trop au bord.',
    muet: '(La carpe vous regarde un moment à travers l’eau. Puis elle descend, lentement, et le lac se referme.)',
    adieu: ['Allez. Et ne sifflez pas en marchant sur les planches.', 'Bonsoir, mon enfant. Gardez vos pieds au sec.'],
    autres: {
      hulotte: 'Au vieux chêne, au levant de votre ferme, une hulotte veille la nuit. Elle compte les morts ; je compte les noyés. Nous nous entendons.',
      cheval: 'Près de votre ferme, un vieux cheval broute les ruines des Chabert. Il vient boire au lac, parfois, quand personne ne regarde. Il m’a raconté l’incendie.',
    },
    remarques: {
      peche: 'Vous avez beaucoup pêché, ces jours-ci. Je ne dis rien. Je compte.',
      cygne: 'Vous avez tiré sur un cygne. Je ne vous parlerai pas de ce que cela vous coûtera. Ce n’est pas à moi de vous le dire.',
    },
  },

  // ======================================================================== Bayard, le vieux cheval de la ferme brûlée
  cheval: {
    approche: 'Approche. Mes yeux sont moins bons que mon nez. … Ah. Tu sens la ferme d’à côté.',
    intro: 'Oui. C’est moi. N’aie pas peur ; je suis trop vieux pour faire peur, et trop lourd pour courir. Le vieux Chabert a lâché sa pipe, la première fois. Tu as encore la tienne : c’est bien.',
    salut: {
      jour: ['Bonjour, toi.', 'Te voilà. Tu sens la ferme. Ça me fait plaisir.', 'Tu reviens voir le vieux. C’est gentil. Les vieux, on vient les voir quand il est trop tard, d’habitude.'],
      matin: ['Le jour se lève. Avant, à cette heure-ci, on attelait.'],
      soir: ['Le soir. Avant, à cette heure-ci, on dételait, et j’avais de l’avoine.'],
      nuit: ['…'],
    },
    retour: ['Tu n’étais pas venu depuis longtemps. Ce n’est rien. Le pré ne bouge pas. Moi non plus.'],
    meteo: {
      pluie: 'La pluie, c’est bon pour les prés. Pour mes genoux, moins.',
      neige: 'La neige. Les Chabert me couvraient d’une couverture rouge. Elle a brûlé avec le reste.',
      chaleur: 'Il fait chaud. Les mouches me connaissent par mon nom.',
      orage: 'Il y a de l’orage dans l’air. Je ne dormirai pas, ce soir. Toi non plus, si tu es sage.',
      gel: 'Il gèle. L’abreuvoir est dur comme une pierre. Je lèche la glace. Ce n’est pas grave.',
    },
    jours: {
      mere: 'C’est le jour de la Mère. Tu as porté quelque chose à la pierre, près de ta ferme ? Fais-le. Pour moi.',
      semailles: 'Primedi. On sème. Je sens les champs ouverts depuis ici. Ça me démange les épaules.',
    },
    nuitRouge: 'La nuit dernière était rouge. Je suis resté au milieu du pré, loin des murs. Les murs brûlés n’aiment pas le rouge. Ils s’en souviennent.',
    qui: 'Bayard. Tous les chevaux de trait s’appellent Bayard, par ici, ou presque. Moi, je l’étais pour de vrai : quatre fils Chabert m’ont monté en même temps, une fois, pour rire. Ils sont partis à la ville. Je suis resté.',
    pourquoi: [
      'Je ne sais pas. J’ai toujours compris ce qu’on me disait. Un jour, j’ai répondu. Le vieux Chabert n’en a jamais parlé à personne. Il me parlait plus, après. Il me disait tout.',
      'La nuit du feu, j’ai crié des mots. On a sorti les enfants. La grand-mère n’a pas voulu sortir. Elle disait qu’on l’attendait. Depuis, je ne parle qu’à ceux qui écoutent jusqu’au bout.',
    ],
    sujet: {
      label: 'Et cette ferme ?',
      lignes: [
        'C’était la ferme des Aulnes, aux Chabert. On l’appelle la ferme brûlée, maintenant. Les gens oublient vite les noms des fermes, jamais ceux des incendies.',
        'Le feu a pris dans la grange, une nuit d’orage sec. Il n’y avait pas eu de foudre. Il y avait seulement quelqu’un au bout du champ, qui regardait. Je ne l’ai pas reconnu. Il ne sentait rien.',
        'Ta ferme, je l’ai labourée avant toi. Pour ceux d’avant toi. Il y en a eu plusieurs. Ils avaient tous tes mains, ou presque, et ils avaient tous reçu la même lettre.',
        'La Mère des Moissons… On lui laissait la dernière gerbe, chez les Chabert. Une année, le vieux ne l’a pas laissée. L’année d’après, il y a eu le feu. Je ne dis pas que c’est lié. Je dis l’ordre des choses.',
      ],
    },
    rumeurs: [
      'Les nuits d’orage, ne regarde pas le ciel. Ils passent, avec leurs chevaux noirs et leurs chiens. Ils m’appellent par mon nom. Je fais semblant de dormir.',
      'Au ranch, l’éleveuse a une jument noire qui rue. C’est la fille de la grise. L’homme est mort, un hiver. Elle parle à ses bêtes comme moi je te parle à toi.',
      'La pierre aux offrandes, près de ta ferme : mets-y tes premiers fruits. Même si tu n’y crois pas. Elle, elle croit en toi.',
      'Il y a une cave, sous la ferme brûlée. Les Chabert y gardaient le cidre. Il n’y a plus de cidre, mais quelqu’un y descend encore.',
      'Les loups ne m’attaquent pas. Je suis trop vieux, ou trop gros, ou trop triste. Peut-être les trois.',
      'Les calvaires, aux carrefours, ne sont pas là pour les morts. Ils sont là pour que les vivants sachent où s’arrêter.',
      'Le vieux moulin, au nord de ta ferme. Ses ailes tournent quelquefois sans vent. Le meunier est parti avant ma naissance.',
      'Avant toi, à ta ferme, il y en avait un qui chantait en fauchant. Il n’est pas allé au bout de sa saison. Je n’ai plus entendu chanter depuis.',
    ],
    question: {
      texte: 'Dis-moi. Tu laboures toi-même, ou tu as une bête pour ça ?',
      reponses: [
        { label: 'Moi-même, à la main.', reaction: 'À la main ! Tu vas te casser le dos. Ceux d’avant aussi. Il y a des choses qui ne changent pas.', rappel: 'Toujours à la main ? Montre-moi tes mains. … Oui. C’est bien ce que je pensais.' },
        { label: 'J’ai un cheval.', reaction: 'Prends soin de lui. Ne le laisse pas vieillir seul, au bout d’un champ. C’est tout ce que je te demande.', rappel: 'Et ton cheval ? Il va bien ? Donne-lui une pomme de ma part. Il ne saura pas qui c’est ; ce n’est pas grave.' },
        { label: 'Je ne laboure pas.', reaction: 'Alors tu n’es pas fermier. Tu es quelqu’un qui habite une ferme. Ce n’est pas pareil, mais ce n’est pas grave.', rappel: 'Toujours pas de labours ? La terre attend. Elle sait attendre, mais elle compte.' },
      ],
    },
    service: {
      label: 'Tu as besoin de quelque chose ?',
      demande: 'Un service ? J’ai envie de pommes. Le vieux Chabert m’en donnait le dimanche. Trois. Je ne demande pas plus ; je n’ai jamais demandé plus.',
      attente: 'Pas de pommes. Ce n’est rien. J’ai attendu des dimanches plus longs que celui-ci.',
      donner: 'Je t’ai apporté des pommes.',
      merci: '(Il les mange une à une, lentement, et souffle sur vos mains.) … Merci. Maintenant, écoute. La grand-mère Chabert cachait ses sous sous la pierre du foyer, celle qui sonne creux, au pied de la cheminée. Personne ne les a pris. Prends-les, toi. Elle aimait les gens qui donnent des pommes aux chevaux.',
      cadeau: ['(Il croque la pomme et ferme les yeux.) Le dimanche… Merci. Tiens, je me souviens d’une chose : ', '(Il mange, et souffle doucement.) Tu es un bon garçon. Écoute : '],
    },
    secrets: [
      'le vieux Chabert enterrait une pièce sous chaque piquet de clôture, pour que la terre tienne. Il disait que c’était sa banque.',
      'l’éleveuse descend au bas du pré, certaines nuits, en chemise, la lanterne éteinte. Elle ne s’en souvient pas le matin. Ne le lui dis pas.',
      'celui qui regardait le feu, au bout du champ, je l’ai revu une fois, l’hiver dernier, à la lisière. Il était plus grand.',
    ],
    menace: ['Tu vas me tirer dessus ? Je suis trop vieux pour courir.', '(Il s’éloigne au trot lourd, sans se retourner.)'],
    blesse: 'Tu m’as fait mal. Je ne t’en veux pas. Les hommes ont toujours fait mal aux chevaux. C’est la première fois que c’est quelqu’un à qui j’avais parlé.',
    peur: 'On m’a dit, pour {nom}. Je suis vieux, je n’ai pas peur de mourir. J’ai peur de toi. C’est différent.',
    muet: '(Le vieux cheval vous regarde longtemps. Puis il baisse la tête et se remet à brouter, comme une bête.)',
    dort: ['(Il dort debout, la tête basse. Sa lèvre tremble un peu, comme s’il parlait en rêve.)', '(Il dort. De temps en temps, une patte arrière se plie, puis se redresse.)'],
    adieu: ['Va. Le travail ne se fait pas tout seul.', 'Reviens. Je suis toujours là. C’est même la seule chose que je sache encore bien faire.'],
    autres: {
      chat: 'En ville, devant l’auberge, il y a un chat qui parle. Il me méprise parce que je mange de l’herbe. Il a raison : l’herbe, c’est triste.',
      carpe: 'Au lac, la vieille carpe. Va la voir le matin. Elle est plus aimable avant que le soleil ne monte.',
    },
    remarques: {
      chienFaim: 'Ton chien a faim. Je l’entends gémir d’ici, le soir. Nourris-le. Les bêtes, on ne leur demande pas de nous pardonner.',
      cheval: 'Tu as un cheval, maintenant. Je l’ai senti sur toi. Brosse-lui l’encolure, il aimera ça. Moi, j’aimais.',
    },
    nonosFini: 'Ton chien est passé ce matin avec son os. Il me l’a montré. Je lui ai dit qu’il était beau. Il l’est.',
  },
};

// le texte que dit le cheval de ceux d'avant (l'historique des parties) : {nom} (ou « Celui d’avant »), {jours}
const BP_VERSIONS = {
  cheval: ['Tu n’es pas le premier. {qui} a tenu {jours} jours, à ta ferme. Il me donnait du pain sec, le soir, par-dessus la haie. Puis il n’est plus venu.', 'Celui d’avant toi, {qui}, regardait la montagne comme toi. Il a tenu {jours} jours. Ne la regarde pas trop.'],
};

// ---------------------------------------------------------------- ce qu'en disent les gens (les rumeurs des habitants)
const BP_RUMEURS = {
  aubergiste: ['Mon chat ne mange que de la truite. Un chat de notaire ! Le soir, il s’installe sur le tonneau, devant la porte, et il regarde les clients comme s’il allait leur rendre la monnaie.'],
  guerisseuse: ['Au vieux chêne, la nuit, il y a une hulotte qui n’a qu’un œil. Ne lui posez pas de question dont vous ne voulez pas la réponse.'],
  fillette: ['Au hameau mort, il y a un crapaud gros comme un pain, avec une pierre verte sur la tête ! Il sort quand il pleut. Je l’ai vu ! Enfin, je crois.'],
  forgeron: ['Sur la Table des Géants, il y a un corbeau qui ne s’envole pas quand on approche. Il a une plume blanche dans l’aile. Ça porte malheur, un corbeau qui ne s’envole pas.'],
  chasseur: ['Une renarde boiteuse rôde autour du relais, à la brune. Je l’ai manquée trois fois. Je finis par croire qu’elle m’attend.'],
  pecheur: ['Au ponton, le matin, une vieille carpe vient sous les planches. Grosse comme un veau, avec un anneau d’or à la lèvre. Je ne la pêche pas. On ne pêche pas les vieilles.'],
  eleveuse: ['Il y a un vieux cheval de trait aux ruines des Chabert. Personne ne le nourrit, et il ne maigrit pas. Il porte encore son collier. Je n’aime pas ça, et je vais le voir quand même.'],
  estive_baile: ['L’Écornée n’obéit qu’à elle-même. Elle a enterré trois chiens de berger. Si elle vous suit des yeux, c’est qu’elle a quelque chose à vous dire. Je plaisante.'],
};
// ce qu'ils répondent quand on leur dit que les bêtes parlent (une fois chacun)
const BP_INCREDULES = {
  defaut: ['Les bêtes ? Parler ? Vous devriez dormir davantage.', 'Ma grand-mère disait ça. Elle parlait aussi à la lune.', 'Chut. On ne dit pas ces choses-là à voix haute. Même pour rire.', 'Bien sûr. Mon âne me demande l’heure tous les matins. (Le rire vient un peu trop fort, et s’arrête net.)', 'Je n’ai rien entendu. Et vous non plus, n’est-ce pas ?'],
  guerisseuse: 'Elles parlent toutes. Il faut savoir se taire assez longtemps pour les entendre. La plupart des gens n’y arrivent pas. Vous, si, à ce qu’il paraît.',
  cure: 'Le Malin prend la voix qu’il trouve. Quand une bête vous parle, faites un signe de croix, et ne répondez pas. … Et que vous a-t-elle dit ?',
  fillette: 'Moi, je les entends ! Mais seulement le soir, et seulement quand je ne le dis pas à maman.',
  aubergiste: 'Mon chat ? Il parle, oui : il dit « truite », et « encore ». (Il rit.) Ne buvez plus, vous.',
  chasseur: 'J’ai entendu un renard rire, une fois, derrière le relais. Depuis, je ne bois plus avant de chasser.',
  eleveuse: 'Mes bêtes me parlent tout le temps. Avec les yeux. Les vôtres vous parlent avec la bouche ? Il faudra me présenter.',
  pecheur: 'Les poissons ne parlent pas. Sauf la vieille, au ponton. Mais elle, ce n’est pas un poisson. C’est une dame.',
  garde: 'Je n’ai rien entendu, et vous non plus. C’est mieux pour tout le monde.',
  maire: 'Monsieur, la commune a assez de soucis sans que les bêtes s’en mêlent.',
  estive_baile: 'Je vous l’ai dit : écoutez les bêtes. Je ne vous ai pas dit de leur répondre.',
};
const BP_DIRE_AUX_GENS = 'Les bêtes, par ici… il y en a qui parlent ?';
// ce que dit la page du carnet, et quelques mots du jeu
const BP_MOTS = {
  carnet: 'Des bêtes qui parlent',
  carnetVide: 'Je n’en parlerai à personne.',
  mort: 'morte de ma main',
  morte: 'morte de ma main',
  muette: 'ne me parle plus',
  demande: 'm’a demandé',
  promesse: 'Sept jours sans pêcher de carpe.',
  rompue: 'Promesse rompue.',
  donne: 'Fait.',
  veille: 'Veiller avec elle, sans lumière, deux heures de nuit.',
  sousPierre: 'Sous la pierre du foyer, à la ferme brûlée.',
  autres: 'Y en a-t-il d’autres, comme toi ?',
  autresVous: 'Y en a-t-il d’autres, comme vous ?',
  rumeur: 'Qu’est-ce qu’on raconte ?',
  qui: 'Qui es-tu ?',
  quiVous: 'Qui êtes-vous ?',
  pourquoi: 'Pourquoi parles-tu ?',
  pourquoiVous: 'Pourquoi parlez-vous ?',
  encore: 'Parle-moi encore de toi.',
  encoreVous: 'Parlez-moi encore de vous.',
  nonos: 'Le chien a perdu son os. Tu ne l’aurais pas vu ?',
  nonosVous: 'Le chien a perdu son os. Vous ne l’auriez pas vu ?',
  bye: 'Au revoir.',
  plusRien: 'C’est tout pour aujourd’hui.',
  rien: 'Rien de plus. Reviens un autre jour.',
  rienVous: 'Rien de plus. Revenez un autre jour.',
  pierreFoyer: 'Soulever la pierre du foyer',
  foyerTitre: 'Sous la pierre du foyer',
  lettreTitre: 'Un papier plié en quatre',
  lettre: 'À celui qui trouvera.\n\nC’est pour le cheval, d’abord. Qu’on lui achète de l’avoine, l’hiver, et qu’on ne le vende pas au boucher. Le reste, c’est pour celui qui l’aura fait.\n\nJe ne sortirai pas, cette nuit. On m’attend au bout du champ, depuis trois soirs. Je n’ai pas peur. J’ai seulement froid.',
  lettreSigne: 'Mélanie Chabert, veuve',
  corps: 'Regarder',
  corpsCrapaud: '(Sur son front, la pierre est restée. Elle se détache sous vos doigts, froide et terne.)',
  corpsAutre: ['(Il ne dira plus rien.)', '(Les yeux restent ouverts. Ils ne vous regardent plus.)'],
  tuee: '(Elle ne dira plus rien. Le silence, autour, est plus grand qu’il ne devrait.)',
  tue: '(Il ne dira plus rien. Le silence, autour, est plus grand qu’il ne devrait.)',
  cauchemar: ['(Vous avez rêvé d’une voix qui disait votre nom, puis plus rien.)', '(Cette nuit, une bête parlait dans votre rêve. Vous ne vous souvenez plus de ce qu’elle disait. Seulement qu’elle avait peur.)'],
  silence: '(Les bêtes se taisent devant vous, désormais. Toutes.)',
  deja: 'Que voulais-tu, déjà ?',
  dejaVous: 'Que vouliez-vous, déjà ?',
  septJours: 'Sept jours, n’est-ce pas ?',
  // ce que dit quelqu'un qui passe et vous voit parler à une bête (une fois par jour)
  temoins: ['Vous parlez aux bêtes, vous ?', 'Laissez donc cette bête tranquille. Elle ne vous répondra pas.', 'Mon grand-père aussi parlait aux bêtes. Sur la fin.', 'Hé. À qui vous parlez, là ?', 'Il y a des jours comme ça, où l’on parle aux bêtes. Rentrez donc chez vous.'],
};
