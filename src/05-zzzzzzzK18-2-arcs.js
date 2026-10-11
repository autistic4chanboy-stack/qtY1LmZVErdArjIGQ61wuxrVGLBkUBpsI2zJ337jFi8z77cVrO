// ============================================================================
//  LES RÉCITS DES PROCHES (K18) — 2. L'AUBERGE, LE LAC, LA FORÊT, LE RANCH
//  (format : 05-zzzzzzzK18-1-arcs.js)
// ============================================================================

// ============================================================================ L'AUBERGISTE
K18_ARCS.push({
  id: 'aubergiste', npc: 'aubergiste', ordre: 5, titre: 'Chiche',
  accroche: 'Chaque dimanche, depuis dix ans, l’aubergiste sert sa soupe au pêcheur sans oser le regarder dans les yeux.',
  finDefaut: (k) => (k.ch('aubergiste.chiche') === 'dire' ? (k.vivant('pecheur') ? 'reconcilies' : 'tard') : 'silence'),
  etapes: [
    { id: 'soupe', titre: 'Le bol du dimanche', min: 3, jour: 4, label: 'Vous faites une drôle de tête, Bonnefoy.',
      carnet: 'L’aubergiste fait une drôle de tête. Lui parler.',
      dlg: [
        ['Moi ? C’est la tête de quelqu’un qui a goûté sa sauce et qui l’a trouvée bonne. Ça me fait toujours peur.', 'Vraiment ?'],
        ['(Il essuie un verre déjà sec.) Rendez-moi un service. Portez la soupe du dimanche à {npc:pecheur}, au ponton. D’habitude, il vient la manger ici, et je la lui sers sans le regarder. Cette fois, je n’ai pas le courage.', 'Pourquoi sans le regarder ?'],
        'Parce que. Portez-lui la soupe, voulez-vous ? Elle est meilleure chaude, comme les mauvaises nouvelles.',
      ],
      don: { k18_soupe: 1 } },
    { id: 'ponton', titre: 'La soupe au ponton', qui: 'pecheur', need: { k18_soupe: 1 }, label: 'La soupe de Bonnefoy',
      carnet: 'Porter la soupe de l’aubergiste au pêcheur.',
      attente: 'Une soupe ? Je n’en vois pas. Bonnefoy oublie tout, sauf le sel.',
      dlg: [
        ['La soupe de {npc:aubergiste} ? Il ne vient pas, lui ? (Il prend le bol à deux mains.) Il ne me regarde jamais quand il la sert. Dix ans. Je me dis que c’est la pitié. Je déteste la pitié.', 'Ce n’est peut-être pas de la pitié.'],
        ['(Il souffle sur la soupe, longtemps.) Qu’est-ce que ce serait, alors ?', '…'],
        'Dites-lui merci. Et dites-lui qu’elle est trop salée. Depuis dix ans. Ça lui fera plaisir que quelqu’un le remarque.',
      ] },
    { id: 'chiche', titre: 'Chiche', delai: 1, min: 5, label: 'Il dit que la soupe est trop salée.',
      carnet: 'Rapporter à l’aubergiste ce qu’a dit le pêcheur.',
      dlg: (k) => [
        k.fait('aubergiste.ponton') ? ['(Il rit, puis il ne rit plus.) Trop salée. Dix ans qu’il la mange, et il me le dit aujourd’hui, par vous.', 'Pourquoi ne le regardez-vous pas ?']
          : ['(Il regarde le bol que personne n’a porté.) Laissez. Il ne viendra plus la chercher, de toute façon.', 'Pourquoi ne le regardiez-vous pas ?'],
        ['Le soir de l’orage, il y a dix ans, Jules est entré trempé. Il jurait qu’il avait vu des fenêtres allumées sous le lac. Toute la salle a ri, et moi le premier. J’ai tapé sur le comptoir : « Chiche que tu n’y retournes pas ! »', 'Et il y est retourné.'],
        ['Il m’a regardé comme on regarde un ami, et il est sorti sous la pluie. On a retrouvé la barque. Pas lui. Son frère croit qu’il est parti tout seul. Moi, je sais qui l’a poussé dehors.', '…'],
        'Alors dites-moi, vous qui portez les soupes : je le lui dis ? Après dix ans ? Ou je continue à saler sa soupe en silence, jusqu’à ce qu’un de nous deux crève ?',
      ],
      choix: (k) => [
        k.vivant('pecheur') ? { k: 'dire', label: 'Dites-le-lui. Il porte peut-être quelque chose, lui aussi.', dlg: ['Quelque chose, lui aussi ? Qu’est-ce qu’il porterait, à part ses nasses ? … Bon. Un soir, au ponton. Vous viendrez ? Il faut un témoin pour les choses qu’on n’ose pas dire. Sinon, on se dégonfle.'] }
          : { k: 'dire', label: 'Dites-le-lui quand même. Au cimetière.', dlg: ['Au cimetière… Oui. Les morts, au moins, ne vous coupent pas. J’irai. Avec une soupe. Trop salée.'] },
        { k: 'taire', label: 'Taisez-vous. Ça ne ramènerait pas Jules.', dlg: ['Ça ne le ramènerait pas, non. Ça me soulagerait, moi, et ça l’écraserait, lui. … Vous avez raison. Je salerai moins, c’est tout. C’est déjà un aveu, pour un cuisinier.'] },
      ], defaut: 'taire' },
    { id: 'aveux', titre: 'Deux hommes au bout du ponton', aller: true, lieu: 'ponton', moment: 'soir', delai: 1, cine: 'ponton',
      si: (k) => k.ch('aubergiste.chiche') === 'dire' && k.vivant('pecheur'),
      carnet: 'Un soir, au ponton : être le témoin.',
      vu: 'Ils sont là tous les deux, au bout du ponton, à un mètre l’un de l’autre, comme deux piquets.' },
    { id: 'apres', titre: 'Le lendemain', delai: 1, si: (k) => k.ch('aubergiste.chiche') === 'dire', label: 'Alors, ce ponton ?',
      carnet: 'Revoir l’aubergiste.',
      dlg: (k) => (k.fait('aubergiste.aveux') ? [
        ['Il savait. Pas pour le « chiche », non. Mais il avait sa propre histoire, la même, à l’envers : il était là, sur l’eau, à trente brasses, et il a viré de bord.', 'Deux.'],
        ['Deux idiots qui se croyaient seuls à avoir tué Jules. Dix ans. On a ri, vous savez. Comme des noyés. Et puis on a versé du lait pour la Dame, à deux.', '…'],
        'Dimanche, il mange à ma table. Pas au comptoir : à ma table. Et la soupe sera trop salée, parce que c’est la recette.',
      ] : [
        ['J’y suis allé. Au cimetière, avec la soupe. Je lui ai dit ma phrase, à genoux dans l’herbe : « C’est moi qui ai dit chiche. »', '…'],
        'Le vent a renversé le bol. Je l’ai pris pour une réponse. Je ne sais pas laquelle. Je la prends quand même.',
      ]),
      don: { ragout: 2 } },
    { id: 'veillee', titre: 'Une noce sans mariés', delai: 3, min: 6, label: 'Votre grande salle est bien pleine, ces temps-ci.',
      carnet: 'L’aubergiste a une idée. Aller le voir.',
      dlg: (k) => [
        ['Pleine ? Elle est pleine tous les soirs, maintenant. Depuis vous. On rit, et la salle sent le tabac frais, pas seulement celui de l’oncle.', 'Et alors ?'],
        k.fin('forgeron') === 'noces' ? ['J’ai fait une noce, la semaine dernière, pour Marchal et la boulangère. J’ai pleuré dans la sauce. Ça m’a donné envie d’une autre fête.', 'Une autre ?']
          : ['Alors j’ai un rêve bête, je vous l’ai peut-être dit : une noce. Une vraie, avec des vivants qui mangent trop et qui cassent mes chopes. Mais personne ne se marie.', 'Personne ?'],
        'Une fête pour les vivants. Sans mariés, sans raison. Rien que parce qu’on est encore là. Il me faudrait de la viande, du vin et du pain. Vous m’aidez ? Moi, je fournis les chaises, la nappe de ma mère et la bonne humeur.',
      ] },
    { id: 'fete', titre: 'La fête des vivants', need: { viande: 4, vin: 3, pain: 6 }, label: 'De quoi faire la fête', cine: 'veillee',
      carnet: 'Apporter à l’aubergiste quatre viandes, trois bouteilles de vin et six pains, pour la fête des vivants.',
      attente: 'Quatre viandes, trois vins, six pains. Je compte large : les vivants, ça mange.',
      dlg: [
        ['(Il soulève les sacs, renifle la viande, débouche une bouteille, la rebouche, la redébouche.) C’est parfait. C’est trop. C’est exactement trop. Ce soir !', 'Ce soir.'],
        'Ce soir, au Coq Tordu, tout le monde. Je fais passer le mot. Et vous, vous vous asseyez au bout de la table, à la place d’honneur. Ne discutez pas, c’est ma maison.',
      ],
      argent: 120,
      fin: (k) => (k.ch('aubergiste.chiche') === 'dire' ? (k.fait('aubergiste.aveux') ? 'reconcilies' : 'tard') : 'silence') },
  ],
  fins: {
    reconcilies: { titre: 'Deux à table', resume: 'L’aubergiste a dit « chiche » ; le pêcheur a dit « trente brasses ». Le dimanche, ils mangent à la même table, et la soupe est trop salée, parce que c’est la recette.',
      salut: ['Mathias est passé, ce midi. Il a dit que la soupe était trop salée. J’ai dit merci. On a ri. Tous les dimanches, maintenant, on rit.', 'J’ai mis une troisième assiette, dimanche. Pour Jules. Mathias n’a rien dit. Il a mis du pain à côté.'] },
    silence: { titre: 'La soupe moins salée', resume: 'L’aubergiste n’a rien dit. Il sale moins la soupe du dimanche : c’est déjà un aveu, pour un cuisinier.',
      salut: ['La soupe est moins salée. Personne ne l’a remarqué. Sauf lui. Il a levé les yeux. Juste une seconde.', 'Je dors mal, certains soirs. Pas plus qu’avant. C’est une sorte de victoire.'] },
    tard: { titre: 'Une soupe au cimetière', resume: 'L’aubergiste a dit sa phrase trop tard, à genoux sur une tombe, avec une soupe trop salée. Le vent a renversé le bol.',
      salut: ['Je porte une soupe au cimetière, le dimanche. Elle refroidit. Je la laisse. Les oiseaux la boivent.'] },
  },
  rituel: { tous: 7, don: { ragout: 1 }, texte: ['Tiens ! Le plat du jour. Il n’a pas de nom. Il est un peu trop salé. Prends.', 'Une assiette pour la route ! Elle est pour toi, je l’ai pas comptée.'] },
  monde: {
    reconcilies: {
      liens: { aubergiste: { pecheur: 'ami retrouvé' }, pecheur: { aubergiste: 'ami retrouvé' } },
      discussions: [{ a: 'aubergiste', b: 'pecheur', lignes: [['pecheur', 'Ta soupe, Gaspard.'], ['aubergiste', 'Trop salée, je sais.'], ['pecheur', 'Non. Elle est bien. C’est ça qui m’inquiète.'], ['aubergiste', '(Il rit.) Dimanche, je la rate exprès.']] }],
    },
  },
  scenes: {
    ponton: { titre: 'Deux hommes au bout du ponton', lieu: 'ponton', h: 18.4, musique: 'eau_lac', angle: 0.9,
      gens: [
        { id: 'aubergiste', x: -0.6, z: 0, cap: 'droite' },
        { id: 'pecheur', x: 0.6, z: 0, cap: 'gauche' },
        { joueur: true, x: -2.6, z: 1.4, cap: 'centre' },
      ],
      paroles: [
        ['', 'Le soir tombe sur le lac. Au bout du ponton, deux hommes qui se connaissent depuis cinquante ans ne savent pas où mettre leurs mains.'],
        ['@aubergiste', 'Le soir de l’orage, Mathias, c’est moi qui lui ai dit « chiche ». C’est moi qui l’ai envoyé chercher sa tuile. J’ai ri le plus fort.'],
        ['@pecheur', '(Un long moment. L’eau clapote contre les pilotis : tac-tac.) Et moi, j’étais sur l’eau, Gaspard. À trente brasses. J’ai vu les fenêtres s’allumer sous lui. J’ai viré de bord.'],
        ['@aubergiste', '… Tu étais trempé, en arrivant chez moi. Je croyais que c’était la pluie.'],
        ['@pecheur', 'C’était le lac. (Il sort de sa poche une petite bouteille de lait.) Tiens. Verse la moitié. Pour la Dame. Elle garde ce que le lac a pris. Au frais. Pour plus tard.'],
        ['', '(Ils versent le lait à deux, maladroitement. Il en tombe à côté. Ils rient, comme des noyés qui ont pied.)'],
      ],
      fin: { haut: 'Chiche', titre: 'Deux hommes au bout du ponton' } },
    veillee: { titre: 'La fête des vivants', lieu: { bld: 'auberge' }, repli: 'place', h: 19.6, musique: 'village_dimanche', lum: [[0, 1.2, 2.4, 13], [-2.5, 2.0, 2.2, 9], [2.5, 2.0, 2.2, 9]],
      gens: [
        { id: 'aubergiste', x: 0, z: 0.4, cap: 'cam' },
        { id: 'pecheur', x: 1.4, z: 1.2, cap: 'centre' },
        { id: 'boulangere', x: -1.5, z: 1.4, cap: 'centre' },
        { id: 'forgeron', x: -2.3, z: 1.0, cap: 'centre' },
        { id: 'fillette', x: -0.8, z: 2.6, cap: 'cam' },
        { id: 'grainetiere', x: 2.6, z: 2.4, cap: 'centre' },
        { id: 'postiere', x: 3.0, z: 0.6, cap: 'centre' },
        { id: 'garde', x: -3.2, z: 2.6, cap: 'centre' },
        { id: 'eleveuse', x: -3.8, z: 1.6, cap: 'droite' },
        { id: 'maire', x: 0.8, z: -1.4, cap: 'cam' },
        { joueur: true, x: 0, z: 3.4, cap: 'centre' },
      ],
      paroles: (k) => [
        ['', 'Un soir, au Coq Tordu. Les tables sont sorties devant la porte, faute de place, et la nappe de la mère Bonnefoy a des taches de cent ans.'],
        ['@aubergiste', 'Mes amis ! Je ne fais pas de discours, j’en suis incapable, le maire les fait tous. Je dis seulement : mangez. Mangez trop. Cassez mes chopes.'],
        ['@maire', 'Au nom du conseil municipal, et en mon nom propre, qui est le même… À la santé des vivants de {ville} !'],
        k.ch('aubergiste.chiche') === 'dire' && k.fait('aubergiste.aveux') ? ['@pecheur', '(Il lève son verre vers le lac, sans rien dire. L’aubergiste lève le sien vers lui. Ils se comprennent.)'] : ['@pecheur', '(Il est venu. Il s’assoit au bout du banc, près de la porte, et il mange tout.)'],
        ['@fillette', '(Elle monte sur la table pour chanter. Faux. Toute la tablée reprend, encore plus faux.)'],
        ['', '(Au plus noir de la nuit, quelqu’un frappe trois coups à une porte, quelque part dans la ville. Personne ne l’entend : on chante trop fort.)', 'coups'],
      ],
      fin: { haut: 'Chiche', titre: 'La fête des vivants' } },
  },
});

// ============================================================================ LE PÊCHEUR
K18_ARCS.push({
  id: 'pecheur', npc: 'pecheur', ordre: 6, titre: 'Quarante lettres',
  accroche: 'Rose, la fille du gardien du phare, balançait la lanterne deux fois pour dire bonne nuit. Elle est partie à Lyon il y a trente ans. Il lui a écrit quarante lettres.',
  finDefaut: (k) => (k.ch('pecheur.lettres') === 'poster' ? 'attente' : 'cendres'),
  etapes: [
    { id: 'lanterne', titre: 'Deux coups de lanterne', min: 3, jour: 5, label: 'Vous regardez le phare.',
      carnet: 'Le pêcheur regarde le phare, le soir. Lui parler.',
      dlg: [
        ['Je regarde s’il y a de la lumière. Il n’y en a jamais. Je regarde quand même. C’est comme les nasses : on relève, même quand on sait.', 'Qui y vivait ?'],
        ['Rose. La fille du gardien. Elle riait comme on casse du bois sec. Le soir, quand je rentrais la barque, elle balançait la lanterne deux fois, là-haut. Ça voulait dire « bonne nuit ».', 'Et vous, vous répondiez ?'],
        ['Je levais la main. Elle ne pouvait pas la voir, de là-haut. Trente ans que je lève la main dans le noir.', '…'],
        'Allez-y, vous, un soir. Montez, balancez la lanterne deux fois. Pour voir ce que ça fait, d’en bas. Non. Pour voir ce que ça me fait, à moi.',
      ] },
    { id: 'phare', titre: 'Au phare, un soir', aller: true, lieu: 'phare', moment: 'soir',
      carnet: 'Aller au phare, un soir, et balancer la lanterne deux fois.',
      vu: 'Vous balancez la lanterne, deux fois. En bas, sur l’eau, une main se lève, toute petite.' },
    { id: 'lettres', titre: 'Quarante lettres', min: 4, label: 'J’ai balancé la lanterne.',
      carnet: 'Retourner voir le pêcheur.',
      dlg: [
        ['(Il ne dit rien. Il va à son coffre et en sort un paquet ficelé, épais comme un missel.)', 'Qu’est-ce que c’est ?'],
        ['Quarante lettres. Une par an, et quelques-unes en trop, les mauvais hivers. Pour Rose. Elle est partie servir à Lyon, chez des bourgeois, quand son père est mort. Elle m’a écrit deux fois. Moi, quarante. Je ne les ai jamais postées.', 'Pourquoi ?'],
        'Parce qu’on ne poste pas trente ans de « bonsoir » d’un coup. Prenez-les. Faites-en ce que vous voudrez. Moi, je ne peux pas : soit je les brûle, soit je les poste, et je n’ai le courage ni de l’un ni de l’autre.',
      ],
      choix: [
        { k: 'poster', label: 'Je les porte à la poste.', don: { k18_lettres_rose: 1 }, dlg: ['À la poste. (Il ferme les yeux.) Bon. Si elle est morte, elles reviendront. Si elle est mariée, elles reviendront aussi, sans doute. Les lettres reviennent toujours, c’est leur défaut.'] },
        { k: 'bruler', label: 'On les brûle ensemble, un soir, au ponton.', don: { k18_lettres_rose: 1 }, dlg: ['Au ponton. Un soir. Oui. Le feu et l’eau, en même temps : comme ça, elles iront quelque part. Gardez-les jusque-là. Moi, je les relirais.'] },
      ], defaut: 'bruler' },
    { id: 'poste', titre: 'Pour Lyon', qui: 'postiere', need: { k18_lettres_rose: 1 }, si: (k) => k.ch('pecheur.lettres') === 'poster', label: 'Quarante lettres pour Lyon', finSaut: 'paquet',
      carnet: 'Porter les quarante lettres à la postière.',
      attente: 'Des lettres pour Lyon ? Je n’en vois pas. Vous les avez perdues ? Ne me dites pas que vous les avez perdues.',
      dlg: [
        ['Quarante ? Pour Lyon ? Pour une Rose, rue Mercière, chez Mme veuve Darnand ? L’adresse a trente ans !', 'Essayez quand même.'],
        ['J’essaie toujours. C’est mon métier, d’essayer. Je les mets dans un seul paquet, avec un mot du bureau : « Prière de faire suivre. Urgent depuis trente ans. »', 'Merci.'],
        'Et vous ne direz pas à {npc:pecheur} que j’ai pleuré sur son paquet. Ça mouille les timbres.',
      ],
      lettre: { delai: 5, de: 'Rose Lemoine, à Lyon', titre: 'Quarante lettres', texte: 'Madame, Monsieur,\n\nLe bureau de poste de {ville} a eu la bonté de joindre un mot, et votre nom. J’ai reçu quarante lettres d’un coup, un mardi, dans l’escalier de service. Je les ai lues assise sur la marche, jusqu’à la nuit, et Madame m’a cherchée dans toute la maison.\n\nIl a toujours écrit comme il parle : peu, et juste.\n\nMadame est morte cet hiver. Je n’ai plus personne à servir. Dites-lui que j’arrive par la voiture de la gare, et qu’il vienne me chercher, puisqu’il a des jambes. Dites-lui de lever la main : cette fois, je la verrai.\n\nRose.' } },
    { id: 'feu', titre: 'Le feu et l’eau', aller: true, lieu: 'ponton', moment: 'soir', delai: 1, need: { k18_lettres_rose: 1 },
      si: (k) => k.ch('pecheur.lettres') === 'bruler',
      carnet: 'Retrouver le pêcheur au ponton, un soir, avec les lettres.',
      vu: 'Il les brûle une à une, au bout du ponton. Le papier se tord, et chaque lettre s’envole un peu avant de tomber dans l’eau.' },
    { id: 'apresfeu', titre: 'Douze heures', delai: 1, si: (k) => k.ch('pecheur.lettres') === 'bruler', label: 'Vous avez dormi ?',
      carnet: 'Revoir le pêcheur.',
      dlg: [
        ['Douze heures. Comme un enfant, ou comme un mort, je ne sais pas.', 'Et les lettres ?'],
        ['Parties avec l’eau. Elle les lira peut-être, si l’eau va jusqu’à Lyon. Elle y va, je crois. Tout finit par descendre.', '…'],
        'Tenez. Du poisson fumé, le meilleur. Je n’en aurai plus besoin pour attendre : je le mangeais en attendant.',
      ],
      don: { poisson_fume: 3, soupe_poisson: 2 }, fin: 'cendres' },
    { id: 'depart', titre: 'Lever la main', delai: 5, min: 5, si: (k) => k.fait('pecheur.poste'), label: 'Vous avez des nouvelles ?',
      carnet: 'Attendre des nouvelles de Lyon, puis retourner voir le pêcheur.',
      dlg: [
        ['(Il tient une lettre ouverte, qu’il ne lâche pas, même pour parler.) Elle a répondu. À moi. Et à vous, je crois.', 'Elle arrive.'],
        ['Elle est seule, à soixante ans. Elle dit qu’elle prend la voiture de la gare, et que c’est à deux jours de marche, et que je n’ai qu’à venir la chercher, puisque j’ai des jambes.', 'Et vous y allez ?'],
        'Je n’ai pas quitté la vallée depuis quarante ans. … Je pars demain, à l’aube. Six jours. Ne touchez pas à mes nasses. Les poissons me feront un cadeau de retour.',
      ],
      voyage: ['pecheur', 6], cine: 'depart' },
    { id: 'retour', titre: 'Rose au phare', delai: 6, si: (k) => k.fait('pecheur.depart'), label: 'Vous êtes revenu !',
      carnet: 'Le pêcheur est sur la route. À son retour, aller le voir.',
      dlg: [
        ['Revenu. Et pas seul.', 'Rose ?'],
        ['Elle est à la cabane. Elle a dit que le lac était plus petit qu’avant. Elle a dit que moi aussi. Elle a ri. Comme du bois sec. Pareil. Exactement pareil.', '…'],
        'Elle reste. Au phare, si la commune veut bien. Le maire a dit oui avant que je finisse ma phrase. Ce soir, elle balancera la lanterne. Moi, je lèverai la main. Et cette fois, elle la verra.',
      ],
      cine: 'retour', don: { poisson_fume: 2 }, fin: 'rose' },
  ],
  fins: {
    rose: { titre: 'Rose au phare', resume: 'Rose est revenue de Lyon par la voiture de la gare. Le soir, il y a de nouveau une lumière au phare, qui se balance deux fois, et une main qui se lève sur l’eau.',
      salut: ['Rose vous fait dire bonjour. Elle dit aussi que vous avez une tête de quelqu’un qui poste des lettres. C’est un compliment, chez elle.', 'Le Notaire a mordu, ce matin. Je l’ai relâché. Rose dit qu’il faut laisser les vieux tranquilles. Elle parlait de moi, je crois.'] },
    cendres: { titre: 'Les lettres à l’eau', resume: 'Quarante lettres ont brûlé au bout du ponton, et sont parties avec l’eau. Le pêcheur dort, maintenant. Il ne regarde plus le phare : il le salue.',
      salut: ['Je dors. Je me réveille. Entre les deux, rien. C’est neuf, pour moi.', 'Je salue le phare, le soir. Il ne répond pas. Il n’a pas besoin.'] },
    attente: { titre: 'Une lettre en route', resume: 'Les quarante lettres sont parties pour Lyon. Il n’est pas venu de réponse. Il guette la voiture du courrier.',
      salut: ['Pas de lettre. Ce n’est rien. Trente ans, j’ai l’habitude.'] },
    paquet: { titre: 'Le paquet ficelé', resume: 'Il n’y a plus personne au guichet pour faire suivre le courrier. Le paquet de quarante lettres est retourné dans le coffre du pêcheur. Il le rouvre, parfois.',
      salut: ['J’ai relu la sept, hier. C’était un bon hiver, celui-là. J’écrivais mieux.'] },
  },
  rituel: { tous: 7, don: { poisson_fume: 2 }, texte: ['Tenez. Une truite, fumée ce matin. Elle ne sent plus l’eau. C’est mieux, pour une ferme.'] },
  monde: { rose: { phare: true } },
  scenes: {
    depart: { titre: 'Sur la route de la gare', lieu: 'pont_sud', h: 5.8, musique: 'pres_chemin', angle: 3.3,
      gens: [
        { id: 'pecheur', x: 0, z: 0, cap: 'dos', chemin: { de: [0, 2], a: [0.5, -26], t0: 5, t1: 30 } },
      ],
      paroles: [
        ['', 'À l’aube, au pont sud. Le pêcheur a mis son costume de baptême, trop court aux poignets, et ses bottes de pêche, faute d’autres.'],
        ['@pecheur', '(Il s’arrête au bord du tablier, comme les chevaux. Il regarde le lac, derrière lui. Il lève la main, pour rien, pour l’habitude.)'],
        ['@pecheur', 'Six jours. Le Notaire n’a qu’à bien se tenir.'],
        ['', '(Il traverse. Il ne se retourne pas. Il marche comme on rame : un pas, un temps, un pas.)'],
      ],
      fin: { haut: 'Quarante lettres', titre: 'Sur la route de la gare' } },
    retour: { titre: 'Deux coups de lanterne', lieu: 'phare', repli: 'ponton', h: 18.9, musique: 'eau_reflets', angle: 0.3, lum: [[0, 0.3, 2.0, 10], [0, -1, 17.8, 30]],
      gens: [
        { look: 'rose', x: -0.4, z: 0.2, cap: 'cam' },
        { id: 'pecheur', x: 0.5, z: 0.6, cap: 'gauche' },
        { joueur: true, x: 2.4, z: 4.2, cap: 'centre' },
      ],
      paroles: [
        ['', 'Le soir, au phare. Pour la première fois depuis trente ans, quelqu’un monte l’escalier avec une lanterne.'],
        ['Rose', 'Tu as vieilli, Mathias Morvan. Tu as les mêmes bottes. Ce sont les mêmes bottes ?'],
        ['@pecheur', 'Ce sont les mêmes bottes.'],
        ['Rose', '(Elle rit, comme on casse du bois sec.) Descends à ta barque. Je monte. Et cette fois, lève la main assez haut.'],
        ['', '(Là-haut, une lanterne se balance deux fois. Sur l’eau, une main se lève, et ne se baisse pas tout de suite.)'],
      ],
      fin: { haut: 'Quarante lettres', titre: 'Rose au phare' } },
  },
});

// ============================================================================ LA GUÉRISSEUSE
K18_ARCS.push({
  id: 'guerisseuse', npc: 'guerisseuse', ordre: 7, titre: 'Celle qui viendra',
  accroche: 'La guérisseuse cherche quelqu’un à qui laisser le grimoire de sa grand-mère, « pour celle qui viendra ». Et il lui manque un visage.',
  finDefaut: 'heritiere',
  etapes: [
    { id: 'lecon', titre: 'Les mains qui écoutent', min: 3, jour: 4, label: 'Apprenez-moi davantage.',
      carnet: 'Demander à la guérisseuse de vous en apprendre davantage.',
      dlg: [
        ['Davantage ? Tu sais déjà les trois tisanes. C’est plus que le médecin du bourg.', 'Davantage.'],
        'Bon. Ma grand-mère disait qu’on apprend les plantes avec les genoux, pas avec les yeux. Va me cueillir de quoi faire l’onguent de l’hiver : des herbes, des champignons. Et ne cueille jamais tout : laisse toujours la plus belle, pour qu’elle dise aux autres de repousser.',
      ] },
    { id: 'cueillette', titre: 'L’onguent de l’hiver', need: { herbes: 6, champignon: 4 }, label: 'Ma cueillette',
      carnet: 'Cueillir six poignées d’herbes et quatre champignons pour la guérisseuse.',
      attente: 'Six d’herbes, quatre champignons. Et pas ceux qui ont des anneaux blancs : eux, ils te cueillent.',
      dlg: [
        ['(Elle trie votre cueillette, plante par plante, en reniflant chaque tige.) Celle-ci est bonne. Celle-là, tu l’as arrachée : elle te le reprochera. Celle-là, c’est de la ciguë, et tu le sais, puisque tu l’as mise à part. Bien.', 'Et maintenant ?'],
        'Maintenant, va au cercle de pierres, à l’aube, et regarde la rosée sur la pierre couchée. Ne la touche pas. Ce que tu verras, tu me le diras. Ou pas.',
      ],
      don: { fiole: 2 } },
    { id: 'rosee', titre: 'La rosée du cercle', aller: true, lieu: 'cercle', moment: 'aube',
      carnet: 'Aller au cercle de pierres, à l’aube, regarder la rosée sur la pierre couchée.',
      vu: 'Sur la pierre couchée, la rosée a une forme : deux mains ouvertes, l’une dans l’autre, couvertes de cicatrices. Le soleil la boit avant que vous ayez fini de la regarder.' },
    { id: 'visage', titre: 'Le visage d’Étienne', delai: 1, min: 6, label: 'J’ai vu deux mains, dans la rosée.',
      carnet: 'Dire à la guérisseuse ce que vous avez vu dans la rosée.',
      dlg: [
        ['Deux mains. (Elle sourit, ou bien elle a mal.) Ce sont les siennes. Étienne. Il avait les mains brûlées, et je me souviens de chaque cicatrice. Mais pas de son visage.', 'Pourquoi ?'],
        ['L’hiver soixante-huit, ma nièce étouffait du croup. Je suis montée à la Table des Géants, et j’ai donné à ceux d’en bas ce que j’avais de plus cher. Ils ont pris son visage. La petite a respiré au matin.', '…'],
        ['On peut marchander, avec eux. Ma grand-mère l’a fait. Je pourrais racheter son visage. Il faudrait payer avec autre chose de cher. Avec ce que j’ai de plus neuf, maintenant.', 'Quoi ?'],
        '(Elle vous regarde.) Toi. Ce que j’ai de plus neuf, c’est toi. Ton nom, ta voix, le bruit de tes pas sur le chemin. Ils les prendraient, et je te verrais comme une étrangère polie. Mais j’aurais son visage pour mourir.',
      ],
      choix: [
        { k: 'garder', label: 'Ne marchandez pas. Gardez les mains, et gardez-moi.', dlg: ['(Elle rit, et cette fois, c’est un vrai rire.) Égoïste. Tu as raison. Les morts ont leur visage, eux ; c’est aux vivants qu’il manque des choses.', 'Alors écoute : puisque tu restes, tu seras celle qui viendra. Celui. Les deux, je m’en moque, la forêt ne regarde pas sous les jupes. Reviens demain soir.'] },
        { k: 'racheter', label: 'Allez-y. Vous l’avez payé assez cher.', dlg: ['Tu es sûr{e} ? … Oui. Tu l’es. Tu as les yeux des gens qui savent ce qu’ils donnent.', 'Cette nuit, à la Table des Géants. Viens. Il faut un témoin, et il faut que ce soit celui qu’on va oublier. C’est la règle. Elle est cruelle. Elles le sont toutes.'] },
      ], defaut: 'garder' },
    { id: 'grimoire', titre: 'Pour celle qui viendra', delai: 1, si: (k) => k.ch('guerisseuse.visage') !== 'racheter', label: 'Me voici, comme convenu.',
      carnet: 'Retourner voir la guérisseuse, le lendemain.',
      dlg: [
        ['Assieds-toi. Pas sur la souche.', '…'],
        ['(Elle pose sur vos genoux un cahier épais, cousu de fil rouge, plein d’une écriture qui change trois fois.) Le grimoire. Ma grand-mère, moi, et la fin est vide. La fin, c’est toi.', 'Je ne saurai pas.'],
        'Tu n’y écriras pas ce que je sais : tu y écriras ce que tu apprendras. C’est comme ça que ça marche. Les grimoires ne se recopient pas. Ils poussent.',
      ],
      cine: 'transmission', don: { k18_grimoire: 1, potion_soin: 2 }, fin: 'heritiere' },
    { id: 'dolmen', titre: 'La Table des Géants', aller: true, lieu: 'dolmen', moment: 'nuit', si: (k) => k.ch('guerisseuse.visage') === 'racheter', cine: 'dolmen',
      carnet: 'Retrouver la guérisseuse à la Table des Géants, la nuit.',
      vu: 'Elle est là, sur la Table des Géants, une lanterne à la main. Elle ne se retourne pas quand vous arrivez. Elle sait que c’est vous. Pour encore quelques minutes.' },
    { id: 'etrangere', titre: 'Des yeux gris', delai: 1, si: (k) => k.ch('guerisseuse.visage') === 'racheter', label: 'Bonjour.',
      carnet: 'Retourner voir la guérisseuse.',
      dlg: [
        ['Bonjour… Pardon, nous nous connaissons ? Vous avez une tête de quelqu’un qui revient souvent.', '…'],
        ['(Elle vous regarde avec une politesse douce, comme on regarde un voyageur.) J’ai bien dormi, cette nuit. Pour la première fois depuis quarante ans. J’ai rêvé d’un charbonnier qui riait. Il avait les yeux gris. Je ne savais pas qu’il avait les yeux gris.', 'Je suis content{e} pour vous.'],
        'Tenez, c’est pour vous. Je ne sais pas pourquoi. Je l’avais préparé, il y avait un nom dessus, que je n’arrive pas à lire. Vous avez une tête à qui ça revient.',
      ],
      don: { potion_soin: 3 }, fin: 'visage' },
  ],
  fins: {
    heritiere: { titre: 'Celle qui viendra', resume: 'La guérisseuse vous a donné le grimoire de sa grand-mère, cousu de fil rouge. Les dernières pages sont blanches : ce sont les vôtres.',
      salut: ['Tu as écrit dans le grimoire ? Montre. Non, ne montre pas. Écris d’abord. On montre quand c’est faux, pas avant.', 'La forêt te connaît, maintenant. Elle te laisse passer. Remercie-la, de temps en temps : elle aime les gens polis.'] },
    visage: { titre: 'Des yeux gris', resume: 'Elle a racheté le visage d’Étienne, à la Table des Géants. Elle a des yeux gris pour mourir, et vous êtes pour elle une étrangère polie qui revient souvent.',
      salut: ['Bonjour ! Encore vous. Vous revenez souvent, n’est-ce pas ? C’est gentil. Je ne sais pas pourquoi, mais c’est gentil.', 'Je rêve d’yeux gris, toutes les nuits. Et parfois, de quelqu’un qui me tient la lanterne. Je ne vois jamais son visage. C’est drôle, non ?'] },
  },
  rituel: { tous: 6, don: { tisane: 1, herbes: 2 }, texte: ['Tiens. Pour la gorge, pour les nuits, pour rien. Bois chaud.'] },
  scenes: {
    transmission: { titre: 'Pour celle qui viendra', lieu: { bld: 'hutte_ermite' }, repli: 'hutte_ermite', h: 18.9, musique: 'foret_clairiere',
      gens: [
        { id: 'guerisseuse', x: -0.5, z: 0.2, cap: 'droite' },
        { joueur: true, x: 0.6, z: 0.6, cap: 'gauche' },
      ],
      paroles: [
        ['', 'Le soir tombe sur la forêt. Devant la hutte, la fumée d’un feu de thym monte droit, sans vent.'],
        ['@guerisseuse', 'Ma grand-mère me l’a donné à six ans, en disant : « C’est la forêt qui choisit. » La forêt a mis soixante-dix ans à choisir, cette fois. Elle se fait vieille, elle aussi.'],
        ['@guerisseuse', 'Tu n’auras pas peur de la nuit. Tu auras peur des matins où l’on vient te chercher pour un enfant qui étouffe. C’est pire. C’est le métier.'],
        ['', '(Elle pose le grimoire sur vos genoux, et sa main dessus, un moment. Elle est légère comme une feuille sèche.)'],
      ],
      fin: { haut: 'Celle qui viendra', titre: 'Le grimoire' } },
    dolmen: { titre: 'La Table des Géants', lieu: 'dolmen', h: 20.6, musique: 'lande_bruyeres', angle: 5.2,
      gens: [
        { id: 'guerisseuse', x: 0, z: 0, cap: 'dos' },
        { joueur: true, x: 0.8, z: 3.6, cap: 'centre' },
      ],
      paroles: [
        ['', 'La lande, la nuit. Sur la Table des Géants, une vieille femme et une lanterne.', 'murmure'],
        ['@guerisseuse', '(Elle parle bas, dans une langue qui n’est pas du patois. Le vent tombe d’un coup. Les bruyères se taisent.)'],
        ['@guerisseuse', 'Je vous rends ce que j’ai de plus neuf. Rendez-moi ce que j’avais de plus cher.', 'grondement'],
        ['', '(Quelque chose répond, sous la pierre. Pas avec des mots. Comme une respiration qu’on retient.)'],
        ['@guerisseuse', '(Elle se retourne vers vous. Elle sourit, d’un sourire très doux, très poli.) Oh. Bonsoir. Vous vous êtes {m:perdu|perdue} ? Vous êtes loin de chez vous, à cette heure.'],
      ],
      fin: { haut: 'Celle qui viendra', titre: 'Des yeux gris' } },
  },
});

// ============================================================================ L'ÉLEVEUSE
K18_ARCS.push({
  id: 'eleveuse', npc: 'eleveuse', ordre: 8, titre: 'La violette',
  accroche: 'Une lettre par semaine, à la violette, sans signature, pour l’éleveuse. Elle a répondu une fois, sous une pierre, au calvaire. La suivante commençait par « Merci ».',
  finDefaut: 'lettres',
  etapes: [
    { id: 'lettres', titre: 'À la violette', min: 3, jour: 5, label: 'Encore une lettre parfumée ?',
      carnet: 'L’éleveuse cache une enveloppe mauve dans son tablier. Lui parler.',
      dlg: [
        ['(Elle cache vite une enveloppe mauve dans son tablier.) Une quoi ? C’est la facture du maréchal-ferrant. Elle sent la violette parce que… parce que le maréchal est coquet.', 'Bien sûr.'],
        ['Bon. Ça va. Depuis le printemps, une lettre par semaine, à la violette, sans signature. Postée en ville. Des lettres sur les bêtes, la pluie, le soir qui tombe. Pas une bêtise. Pas une fois mon nom.', 'Et vous ?'],
        'Une fois, j’ai répondu. Sous une pierre, au calvaire, comme une gamine. La lettre d’après commençait par « Merci ». Je veux savoir qui c’est. Je ne veux pas savoir. Allez voir au calvaire, une nuit, qui vient chercher sous la pierre.',
      ] },
    { id: 'calvaire', titre: 'Sous la pierre du calvaire', aller: true, lieu: 'calvaire0', moment: 'nuit',
      carnet: 'Guetter une nuit au calvaire, sur la route : qui vient chercher sous la pierre ?',
      vu: 'Une silhouette s’approche du calvaire avec une lanterne sourde, soulève la pierre, prend le papier, et repart vers la ville en marchant au pas. Au pas : comme on fait une ronde.' },
    { id: 'ecriture', titre: 'Une écriture de rapport', qui: 'postiere', label: 'Une écriture penchée, à la violette',
      carnet: 'Demander à la postière si elle reconnaît l’écriture des lettres à la violette.',
      dlg: [
        ['Des lettres à la violette ? Pour {npc:eleveuse} ? Vous me demandez qui ? Mais je ne lis pas les lettres, voyons ! Je lis les enveloppes.', 'Justement.'],
        ['(Elle baisse la voix.) Une écriture qui fait les « t » comme des hallebardes. Les mêmes que sur les rapports qu’on m’apporte chaque semaine pour la préfecture. Vous voyez qui je veux dire.', '…'],
        'Ne lui dites pas que c’est moi. Il serait capable de démissionner. Ou de s’engager. Il a déjà fait les deux, pour moins que ça.',
      ] },
    { id: 'nom', titre: 'Celui qui fait sa ronde', delai: 0, min: 4, si: (k) => k.vivant('garde'), label: 'Je sais qui écrit.',
      carnet: 'Dire à l’éleveuse qui écrit les lettres à la violette.',
      dlg: (k) => [
        ['Vous savez ? Non. Ne dites rien. Dites-le. … C’est qui ?', '(Le lui dire.)'],
        ['{npc:garde} ? Le garde ? Celui qui a peur de son ombre et qui lève les ponts à neuf heures pile ? (Elle s’assoit sur un seau.) Le garde.', 'Le garde.'],
        k.coeur('eleveuse') >= 2 || k.coeur('garde') >= 2 ? 'Il écrit bien, le bougre. Mais j’ai d’autres idées en tête, ces temps-ci, et vous savez lesquelles. Je lui répondrai gentiment. Comme on répond à un ami. Il comprendra : il comprend tout, il a peur de tout.'
          : 'Il écrit bien, le bougre. Il a écrit que Tempête avait « un caractère de bonne femme qu’on a trop longtemps fait attendre ». J’ai cru que c’était moi qu’il visait. C’était peut-être moi qu’il visait.',
      ],
      choix: (k) => (k.coeur('eleveuse') >= 2 || k.coeur('garde') >= 2
        ? [{ k: 'ami', label: 'Répondez-lui gentiment.', fin: 'amitie', dlg: ['Gentiment. Oui. Avec des nouvelles de Tempête. On peut tout dire avec des nouvelles d’une jument.'] }]
        : [
          { k: 'aller', label: 'Allez le trouver. Au calvaire, au crépuscule.', dlg: ['Au calvaire. Au crépuscule. Comme dans un roman de quatre sous. (Elle rit.) J’y serai. S’il ne vient pas, je l’attache à sa guérite avec une longe.'] },
          { k: 'lettres', label: 'Laissez-le écrire. Répondez-lui sous la pierre.', dlg: ['Sous la pierre… Oui. On a le temps. Il a peur du soir, moi j’ai peur des gens. Les lettres, ça ne fait peur à personne. Je lui écrirai, toutes les semaines.'] },
        ]),
      defaut: 'lettres' },
    { id: 'rencontre', titre: 'Au calvaire, au crépuscule', aller: true, lieu: 'calvaire0', moment: 'soir', delai: 1, cine: 'calvaire',
      si: (k) => k.ch('eleveuse.nom') === 'aller' && k.vivant('garde'),
      carnet: 'Être au calvaire, au crépuscule, pour la rencontre.',
      vu: 'Ils sont là. Elle, les bras croisés. Lui, sa hallebarde à la main, comme pour se donner une contenance.' },
    { id: 'apres', titre: 'Le témoin', delai: 1, label: (k) => (k.ch('eleveuse.nom') === 'aller' ? 'Alors, le calvaire ?' : 'Vous lui avez répondu ?'),
      carnet: 'Revoir l’éleveuse.',
      dlg: (k) => (!k.vivant('garde') && !k.fait('eleveuse.rencontre') ? [
        ['Il est mort sans que je lui aie parlé en face. Les lettres continuent d’arriver. Non. Elles n’arrivent plus. Je les relis.', '…'],
        'Je garde la dernière dans mon tablier. Elle sent encore la violette. Ça partira. Tout part. Tenez. Un fromage. Pour le facteur que vous avez été.',
      ] : k.ch('eleveuse.nom') === 'aller' ? [
        ['Il a bégayé quatre minutes. Je les ai comptées. Et puis il a dit une phrase entière, sans s’arrêter, sur la façon dont je soulève les barrières, et je l’ai embrassé pour qu’il se taise.', 'Et maintenant ?'],
        ['On ne se marie pas. On n’a plus l’âge des bêtises. Le dimanche, il vient au ranch, il a peur des vaches, je me moque de lui. Ça nous suffit.', '…'],
        'Tenez. Un fromage. Pour le témoin.',
      ] : [
        ['Je lui ai écrit. Trois pages. Sur Tempête, sur la pluie, sur Augustin aussi : il a le droit de savoir qu’il y a eu quelqu’un.', 'Il a répondu ?'],
        ['Le lendemain. Une page. Il dit qu’il connaît le poids des morts, qu’il en porte un, lui aussi, un petit Breton. Je ne sais pas ce que ça veut dire. Il me le dira, peut-être, dans une autre lettre.', '…'],
        'Tenez. Un fromage. Pour le facteur.',
      ]),
      don: { fromage: 1, lait: 2 },
      fin: (k) => (!k.vivant('garde') && !k.fait('eleveuse.rencontre') ? 'souvenir' : k.ch('eleveuse.nom') === 'aller' ? 'ensemble' : 'lettres') },
  ],
  fins: {
    ensemble: { titre: 'Le garde et l’éleveuse', resume: 'Au calvaire, au crépuscule, le garde a bégayé quatre minutes, et l’éleveuse l’a embrassé pour qu’il se taise. Le dimanche, il vient au ranch. Il a peur des vaches.',
      salut: ['Il est venu dimanche. Une vache l’a regardé. Il a dit « halte ». La vache s’est arrêtée. Je ne m’en remets pas.', 'Les lettres continuent. Même maintenant. Il dit qu’il parle mieux par écrit. C’est vrai. Il parle mieux par écrit.'] },
    lettres: { titre: 'Sous la pierre', resume: 'Chaque semaine, une lettre à la violette part de la ville, et une lettre qui sent le foin repart du ranch. Sous la pierre du calvaire, ils se disent tout ce qu’ils n’oseraient pas dire en face.',
      salut: ['Lettre de la semaine : il a vu un renard, il a eu peur, il en a fait trois pages. Il écrit si bien la peur, cet homme-là.', 'J’ai mis de la violette dans ma dernière lettre. Pour qu’il voie l’effet que ça fait.'] },
    amitie: { titre: 'Une réponse gentille', resume: 'L’éleveuse a répondu au garde gentiment, comme on répond à un ami, avec des nouvelles de Tempête. Il a compris. Il comprend tout.',
      salut: ['Le garde m’écrit toujours. Des nouvelles du pont. Moi, des nouvelles de Tempête. C’est une drôle d’amitié, à la violette.'] },
    souvenir: { titre: 'La dernière lettre', resume: 'Le garde est mort avant qu’ils se soient parlé en face. L’éleveuse garde la dernière lettre dans son tablier.',
      salut: ['La lettre sent de moins en moins la violette. Je la sens quand même, tous les soirs.'] },
  },
  rituel: { tous: 7, don: { lait: 1, oeuf: 2 }, texte: ['Tenez. Lait du matin, œufs du jour. Ne dites pas merci aux poules, ça les rend prétentieuses.'] },
  monde: {
    ensemble: {
      liens: { eleveuse: { garde: 'galant' }, garde: { eleveuse: 'bonne amie' } },
      discussions: [{ a: 'garde', b: 'eleveuse', lignes: [['garde', 'Rien à signaler. Enfin… vous. Vous, à signaler.'], ['eleveuse', 'Signalez, alors, garde. Signalez.'], ['garde', 'Je le mettrai dans mon rapport.']] }],
    },
  },
  scenes: {
    calvaire: { titre: 'Au calvaire, au crépuscule', lieu: 'calvaire0', repli: 'pont_nord', h: 18.6, musique: 'pres_noyer', angle: 1.9,
      gens: [
        { id: 'eleveuse', x: -0.7, z: 0, cap: 'droite' },
        { id: 'garde', x: 0.7, z: 0, cap: 'gauche', chemin: { de: [7, -4], a: [0.7, 0], t0: 3, t1: 14 } },
      ],
      paroles: [
        ['', 'Le calvaire, au bord de la route, au crépuscule. Une femme attend, les bras croisés, dans sa robe des dimanches qu’elle n’a mise qu’une fois.'],
        ['@garde', 'Halte ! … Pardon. Bonsoir. Je… le règlement… il se trouve que… je faisais ma ronde, et il se trouve que…'],
        ['@eleveuse', 'Quatre minutes, garde. Ça fait quatre minutes que « il se trouve que ».'],
        ['@garde', '(D’un trait, sans respirer.) Vous soulevez les barrières comme on soulève un enfant, d’un seul coup, sans effort, et c’est la plus belle chose que j’aie vue depuis Madagascar, et je ne sais pas parler, alors j’écris, voilà.'],
        ['@eleveuse', '(Elle l’embrasse, pour qu’il se taise. Il lâche sa hallebarde. Elle tombe sur la route avec un bruit de casserole.)'],
      ],
      fin: { haut: 'La violette', titre: 'Au calvaire, au crépuscule' } },
  },
});
