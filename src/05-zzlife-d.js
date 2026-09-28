// Vie des habitants : l’éleveuse, le pêcheur, la guérisseuse
Object.assign(NPC_LIFE, {
  // --------------------------------------------------------------------------
  eleveuse: {
    foi: 'anciens', devotion: 1, fete: 1,
    mythes: ['cerf_blanc', 'bete_des_combes'],
    mythe_intro: [
      'Ma tante raconte ces histoires-là mieux que moi, avec les silences au bon endroit. Moi, je vais vous raconter celle-ci comme mon père me la racontait pendant les vêlages, à la lanterne, pour que je ne m’endorme pas.',
      'Asseyez-vous sur le seau retourné, il est propre. Au hameau, celle-là, on la raconte à voix basse, même en plein midi.',
    ],
    histoire: [
      {
        titre: 'Née dans la paille', min: 0,
        texte: 'Je suis née à {hameau}, dans la maison Morel, un soir de vêlage : ma mère a eu les douleurs en tenant la lanterne pour la vache. Mon père, Honoré, jurait que j’étais sortie en même temps que le veau, et que le veau avait crié moins fort. À sept ans, je trayais mieux que mes frères ; à dix, je savais qu’un cheval qui couche les oreilles va mordre, et qu’un homme aussi, à sa façon. Ma tante voulait m’apprendre les plantes. Moi, je ne tenais qu’aux bêtes chaudes.',
      },
      {
        titre: 'Quatre heures du matin', min: 0,
        texte: 'Au ranch, la journée commence à quatre heures, que le bon Dieu soit réveillé ou non. D’abord les vaches, ensuite les chevaux, les poules en dernier : elles sont bêtes, mais elles ont de la mémoire, et elles se vexent. Je vends des bêtes à toute la vallée, mais pas à n’importe qui ; l’an passé, j’ai refusé une jument à un marchand du bourg qui avait la cravache trop facile, et il a eu beau doubler le prix. Une bête, ça se vend comme on marie sa fille. Et je ne marie pas mes filles aux brutes.',
      },
      {
        titre: 'Une pouliche pour bague', min: 1,
        texte: 'Il s’appelait Augustin Chabert, et il n’était pas d’ici : un maquignon du Charolais, venu acheter des juments à la foire de la Saint-Michel. Il m’a vue soulever une barrière toute seule et il a ri ; je lui ai dit que s’il riait encore, je la lui soulevais sur la tête. Il est revenu le lendemain, puis toutes les semaines, puis il n’est plus reparti. Il ne m’a jamais offert de bague : il m’a offert une pouliche grise, Colombe, avec un ruban rouge noué dans la crinière. J’ai dit oui à la pouliche, et lui, il est venu avec.',
      },
      {
        titre: 'Neuf jours', min: 2,
        texte: 'La fièvre l’a pris à la Saint-Martin, il y aura cinq ans en novembre, et elle l’a tenu neuf jours. Le médecin du bourg est passé le quatrième, il a pris ses dix francs, il a regardé ma tante de haut, et il a dit que c’était entre les mains de Dieu. Ma tante, elle, est restée les neuf nuits : cataplasmes de moutarde, écorce de saule, et des chansons à voix basse dans une langue qui n’est même pas du patois. Ça sentait le camphre et la sueur, et les chevaux tapaient du pied dans l’écurie sans s’arrêter. Depuis, je dors de son côté du lit ; du mien, je n’y arrive plus.',
      },
      {
        titre: 'Ce que savent les bêtes', min: 3,
        texte: 'J’ai peur de mes propres bêtes, certaines nuits. Quand elles se tournent toutes du même côté, je compte les jours : il y a toujours un enterrement dans la semaine, j’ai vérifié onze fois. Et puis il y a autre chose, que je n’ai dit à personne : deux fois, je me suis réveillée debout contre la clôture du bas, en chemise, la lanterne éteinte à la main, sans savoir comment j’étais venue là. Les chiens ne m’avaient pas suivie. Ils me regardaient depuis la cour, tous les trois, et ils grognaient.',
      },
      {
        titre: 'La barrière', min: 4,
        texte: 'Augustin voulait partir : vendre le ranch, prendre les bêtes et redescendre dans le Charolais, parce qu’ici, disait-il, la nuit, la terre écoute. J’ai refusé, à cause de ma tante, des bêtes, de tout, et on s’est disputés comme jamais, un soir de novembre. Ce soir-là, je savais que la barrière du pré n’était pas fermée, et je me suis dit : qu’il la ferme, lui, pour une fois. Colombe s’est sauvée vers {lieu:hameau_abandonne}, il est parti la chercher sous la pluie, et il est revenu à l’aube, trempé, les lèvres bleues, sans vouloir dire ce qu’il avait vu. Il a cru jusqu’au bout que c’était le vent qui avait ouvert. Le bout est venu neuf jours plus tard.',
      },
      {
        titre: 'Tempête', min: 6,
        texte: 'Colombe était pleine, cette nuit-là ; au printemps, elle a donné une pouliche noire comme un four, qui ruait déjà en tétant. Je l’ai appelée Tempête, parce que c’était le seul mot qui me restait. C’est tout ce qu’Augustin m’a laissé de vivant, et elle me le fait payer chaque matin, la carne. Ce printemps, j’ai remis une robe, une fois, pour voir : je l’ai ôtée au bout d’une heure, mais je l’ai mise. Et je guette le courrier, maintenant, comme une gamine ; si Augustin voyait ça, il rirait, et je crois bien que je rirais avec lui.',
      },
      {
        titre: 'L’amande amère', min: 8,
        texte: 'Le neuvième soir, Augustin ne reconnaissait plus personne, sauf moi, et il m’a demandé de le laisser partir. Pas avec des mots : il me serrait le poignet, comme on tient la longe d’un cheval qu’on n’arrive plus à retenir. Je suis allée chercher ma tante à la cuisine, je n’ai rien eu besoin de lui dire ; elle a fait bouillir une tisane qui sentait l’amande amère, et c’est moi qui la lui ai donnée, à la cuillère, parce que ça devait être moi. Il s’est endormi en me tenant, et au matin, tous les chevaux regardaient vers {lieu:hameau_abandonne}. Le médecin a écrit « fièvre », le curé a dit la messe, et je ne me suis jamais confessée. Le pire, {prenom}, ce n’est pas de l’avoir fait : c’est que je ne le regrette pas.',
      },
    ],
    questions: [
      {
        id: 'eleveuse_q1', min: 0,
        texte: 'Dites-moi, vous avez déjà eu une bête à vous ? Une vraie, avec un nom, que vous pleureriez si elle mourait ?',
        reponses: [
          { label: 'Oui, un chien. Je lui parlais plus qu’aux gens.', amitie: 25, reaction: 'Ah, voilà une réponse ! Moi, c’est pareil avec Tempête, sauf qu’elle me répond à coups de sabot. Les gens qui parlent aux bêtes, on peut leur confier les clés.' },
          { label: 'Non. Une bête, c’est du travail et de la viande.', amitie: -15, reaction: 'Hm. Sur le papier, c’est vrai. Mais une bête qu’on ne regarde jamais dans les yeux vous le rend mal, un jour ou l’autre.' },
          { label: 'Un poisson rouge. Il m’ignorait royalement.', amitie: 10, reaction: 'Ha, un poisson rouge ! Comme ma tante, alors : on lui parle, elle regarde ailleurs, et on ne sait jamais si elle a entendu. Vous me plaisez, vous.' },
        ],
        rappel: [
          'Et votre chien, celui à qui vous parliez ? J’y repensais ce matin en trayant. On devrait tous avoir quelqu’un qui écoute sans répondre.',
          '« Du travail et de la viande », vous m’aviez dit. J’y ai repensé cette nuit en soignant le petit veau. Je ne suis toujours pas d’accord.',
          'J’ai raconté votre poisson rouge à ma tante. Sa bouche n’a pas ri. Ses yeux, si.',
        ],
      },
      {
        id: 'eleveuse_q2', min: 1,
        texte: 'Franchement : ça vous choque, vous, une femme qui porte les pantalons de son défunt mari ? Dites-le, je ne mords pas. Pas comme Tempête.',
        reponses: [
          { label: 'Pas du tout. Vous les portez mieux que bien des hommes.', amitie: 20, reaction: 'Mieux que bien des hommes, ça, ce n’est pas difficile : la moitié les porte comme des sacs de patates. Merci. Ça fait du bien, un peu de bon sens.' },
          { label: 'Un peu, je l’avoue. Ce n’est pas l’usage.', amitie: 5, reaction: 'Au moins, c’est franc. L’usage, voyez-vous, n’a jamais trait une vache à cinq heures du matin par un froid de loup ; le jour où il le fera, je remettrai mes jupes.' },
          { label: 'Moi, du moment qu’on me laisse mes bottes…', amitie: 12, reaction: 'Vos bottes, personne n’en voudrait, vu l’odeur ! Vous au moins, vous ne me faites pas la morale : c’est reposant.' },
        ],
        rappel: [
          'Mieux que bien des hommes, vous m’avez dit, pour les pantalons. Je me le répète quand les commères du lavoir me regardent passer. Ça marche.',
          'Vous m’aviez avoué que les pantalons, ça vous choquait un peu. J’en ai recousu un ce matin. Exprès pour vous.',
          'Toujours vos bottes aux pieds ? Bien. Chacun ses fidélités : vous, vos bottes ; moi, mes pantalons.',
        ],
      },
      {
        id: 'eleveuse_q3', min: 2,
        texte: 'Si vous pouviez quitter la vallée demain, pour de bon, avec tout ce que vous avez… vous partiriez ?',
        reponses: [
          { label: 'Non. Ma place est ici, maintenant.', amitie: 25, reaction: 'Ici, oui. C’est ce que j’ai répondu, moi aussi, un soir, et je ne le regrette pas tous les jours. Restez, alors : on a besoin de gens qui restent.' },
          { label: 'Oui. Sans me retourner.', amitie: -10, reaction: 'Augustin disait ça, avec les mêmes mots… Faites comme vous voulez, mais si vous partez, partez de jour.' },
          { label: 'Ça dépend. La vallée me laisserait partir ?', amitie: 10, reaction: 'Ha. Vous avez déjà compris ça, vous. Il y en a qui mettent dix ans, et d’autres qui essaient quand même, et qu’on revoit au bout d’une semaine.' },
        ],
        rappel: [
          '« Ma place est ici », vous m’avez dit. Je me le suis répété hier soir en fermant l’étable. Ça tient chaud, une phrase comme ça.',
          'Vous êtes toujours là, vous qui vouliez partir sans vous retourner ? Tant mieux. Enfin… tant mieux pour moi.',
          'J’ai demandé à ma tante si la vallée laisse partir les gens. Elle a changé de sujet. Chez elle, c’est une réponse.',
        ],
      },
      {
        id: 'eleveuse_q4', min: 4,
        texte: 'Vous croyez qu’on peut aimer deux fois ? Pour de vrai, je veux dire. Pas se tenir compagnie : aimer.',
        reponses: [
          { label: 'Oui. Le cœur n’est pas une chandelle qu’on souffle.', amitie: 30, reaction: 'Une chandelle… Vous avez de ces mots, vous. Ne me regardez pas comme ça, j’ai de la paille dans l’œil.' },
          { label: 'Non. On aime une fois. Le reste, c’est de la compagnie.', amitie: -10, reaction: 'C’est ce que je me disais. C’est ce que je me dis encore, les jours de pluie. Mais c’est dur à entendre dans une autre bouche que la mienne.' },
          { label: 'Moi, j’aime déjà mes choux deux fois par jour.', amitie: 8, reaction: 'Ha ! Vos choux, au moins, ne vous écrivent pas de lettres. Bon, j’ai compris, on ne parle pas de ça, et vous avez raison.' },
        ],
        rappel: [
          'Une chandelle qu’on ne souffle pas… J’y ai repensé en lisant la dernière lettre. Je ne vous dirai pas ce qu’elle disait. Mais j’y ai repensé.',
          'Vous disiez qu’on n’aime qu’une fois. J’ai failli vous croire. Et puis une lettre est arrivée, et je ne sais plus.',
          'Comment vont vos choux ? Toujours aimés deux fois par jour ? Vous m’avez fait rire, ce jour-là, alors que je n’en avais pas envie.',
        ],
      },
    ],
    humeurs: {
      joyeux: [
        'Blanchette a donné six litres ce matin, et Tempête ne m’a pas mordue : deux miracles avant le café !',
        'Tiens, vous ! Vous tombez bien, j’ai envie de causer, et les vaches n’ont aucune conversation.',
        'Belle journée, hein ? Le genre de journée où on se dit que la vallée n’est pas si mauvaise, au fond.',
      ],
      triste: [
        'Pardon, j’ai trouvé un bout de ficelle dans la poche de son pantalon, ce matin. Un bout de ficelle, et me voilà bonne à rien.',
        'Je n’ai pas le cœur à causer. Les bêtes l’ont senti : elles sont toutes venues s’appuyer contre la barrière.',
        'Vous savez ce qui est le plus dur ? Le silence de la maison, le soir ; on croit s’y faire, on ne s’y fait pas.',
      ],
      fatigue: [
        'Une vache a vêlé cette nuit, et le veau se présentait mal. Trois heures les bras dedans, alors ne me demandez rien de compliqué.',
        'Je dors debout, comme les chevaux. Dites vite ce que vous voulez, avant que je m’appuie sur vous.',
        'Si je bâille, ce n’est pas vous, ce sont les poules. Elles ont mené le sabbat toute la nuit, ces idiotes.',
      ],
      inquiet: [
        'Les chiens n’ont pas voulu sortir de la cuisine, ce matin. Vous avez vu quelque chose, sur le chemin ?',
        'Pardon, j’ai la tête ailleurs. Il me manque une brebis, et pas une trace dans la rosée, pas une.',
        'Vous avez pris quel chemin, pour venir ? Les bêtes ont regardé par là toute la nuit.',
      ],
      agace: [
        'Si c’est pour les lettres, je n’ai rien à dire. J’ai déjà {npc:postiere} sur le dos, ça suffit bien.',
        'Un renard m’a pris deux poules, et le curé m’a fait la morale sur mes pantalons, tout ça avant midi. Alors pas maintenant.',
        'Je vous préviens, j’ai la fourche facile aujourd’hui. Tempête a démoli sa stalle, et c’est encore moi qui répare.',
      ],
    },
    souvenirs: {
      cadeau_adore: [
        '{objet} ! Je n’ai pas oublié, vous savez. Ma tante dit que vous avez « la main juste », et venant d’elle, c’est une médaille.',
        '{objet}… J’y repense encore, le soir. Personne ne m’avait fait un cadeau pareil depuis Augustin ; voilà, c’est dit, n’en parlons plus.',
      ],
      cadeau_deteste: [
        '{objet}, franchement… J’ai voulu en faire cadeau aux cochons, et même eux ont fait la moue. Ne recommencez pas.',
        '{objet}. Vous vous rappelez ? Moi, oui. Je ne dis pas ça pour vous vexer, mais la prochaine fois, demandez-moi avant.',
      ],
      aide: [
        'Vous m’avez donné un coup de main, l’autre jour, et je n’ai pas dit merci comme il faut. Merci. Voilà : comme il faut.',
        'Depuis que vous m’avez aidée, Tempête tend le cou quand vous passez le portail. Elle ne fait ça pour personne. Moi non plus, d’ailleurs.',
      ],
      toque_nuit: [
        'C’était vous, l’autre nuit, qui frappiez chez moi ? J’ai passé le reste de la nuit assise sur mon lit, la fourche en travers des genoux. La prochaine fois, criez votre nom, ou ne venez pas.',
        'Des coups à ma porte, en pleine nuit, et les chiens qui n’aboyaient pas. C’est ça qui m’a fait le plus peur : les chiens qui n’aboyaient pas.',
      ],
      coup: [
        'Vous m’avez frappée. Je ne l’ai pas oublié, et mes bêtes non plus : regardez comme Tempête couche les oreilles.',
        'On ne lève pas la main sur quelqu’un qui vous vend son lait. On ne lève pas la main, tout court. Je vous ai à l’œil.',
      ],
      absence: [
        'Tiens, un revenant ! Je commençais à croire que le marais avait eu votre peau.',
        'Des jours qu’on ne vous voit plus au hameau. Blanchette vous cherchait. Enfin… je dis Blanchette.',
      ],
      victime: [
        'Encore un mort dans la vallée. Mes bêtes n’ont pas touché leur foin ce matin : elles savaient avant nous, comme toujours.',
        'Chacun soupçonne son voisin, maintenant. Moi, je rentre les bêtes plus tôt, je fais le tour des clôtures, et je ne demande rien à personne.',
      ],
    },
    tenue: {
      arme: 'Rangez-moi cette arme. Les bêtes sentent ce qui tue, et après, c’est moi qui passe la nuit à les calmer.',
      pelle: 'Une pelle ? Si c’est du fumier qu’il vous faut, servez-vous, j’en ai des montagnes : c’est bien la seule chose gratuite ici.',
      potion: 'Cette fiole sent la cuisine de ma tante. Ne la faites surtout pas boire à mes bêtes.',
      animal_mort: 'Vous l’avez tuée proprement, au moins, cette pauvre bête, d’un seul coup ? Si elle a souffert, ne me le dites pas.',
      fleurs: 'Des fleurs ! Tenez-les haut : Blanchette a un faible pour les bouquets, elle vous les mangerait dans la main.',
      poisson: 'Du poisson ? Dites à {npc:pecheur} que son lait l’attend dimanche, comme toujours.',
      lanterne_jour: 'Une lanterne allumée en plein midi ? Je ne me moque pas : ici, on ne se moque jamais de ceux qui ont peur du noir.',
      relique: 'Qu’est-ce que vous tenez là ? Mes chiens se sont couchés, regardez : ils ne se couchent devant personne.',
      rien: 'Les mains vides ? Parfait, il y a du foin à rentrer ; je plaisante, enfin, presque.',
    },
    chez_soi: {
      jour: 'Ho ! Ici, on frappe avant d’entrer. Bon… puisque vous êtes dedans, essuyez vos bottes et prenez un bol de lait ; mais la prochaine fois, on frappe.',
      nuit: 'Qui est là ? J’ai la fourche ! … Vous ? En pleine nuit, chez moi ? Brigand aurait pu vous sauter à la gorge. Sortez, et ne refaites jamais ça. Jamais.',
    },
    activites: {
      travail: [
        'Allez, ma belle, lève le pied… L’autre. Celui-là. Voilà.',
        'Trente-deux poules, trente et un œufs. Qui c’est qui fait la grève, encore ?',
        'Ce foin est trop humide. S’il chauffe dans la grange, c’est tout le hameau qui flambe. Allez, on retourne.',
      ],
      repas: [
        'Pain, fromage, un oignon. Augustin appelait ça « le festin du maquignon ». C’est toujours le meilleur.',
        'Encore manger debout. Un jour, je m’assiérai pour de bon, et je ne me relèverai plus.',
        'Brigand, ôte ton nez de mon assiette. Tu as eu ta part. Tu as eu la mienne, hier.',
      ],
      priere: [
        'Merci pour le veau. Il est vivant, il tète. Je ne demande rien d’autre. Enfin, pas aujourd’hui.',
        'Cerf Blanc, si tu passes par les Combes, garde mes brebis. Moi, je ne peux pas être partout.',
        'Je ne sais pas prier comme ma tante. Alors voilà du lait. Le lait, tout le monde le comprend.',
      ],
      promenade: [
        'La clôture du bas a encore bougé. Toute seule, évidemment. Comme d’habitude.',
        'Les hirondelles rasent l’herbe, et mon genou fait des siennes. Il pleuvra avant ce soir.',
        'Je devrais monter voir ma tante. Demain. Elle va encore dire que je dis toujours demain.',
      ],
      soir: [
        'Une, deux, trois… dix-sept vaches. Bon. Et personne de trop. Je ferme.',
        'Brigand, dedans. Tout de suite. Je n’aime pas ta façon de regarder le chemin.',
        'Bonne nuit, Tempête. Pas de bêtises. Et si quelqu’un vient, tu me réveilles.',
      ],
      pluie: [
        'Voilà, les poules font la tête. Trois jours de bouderie, au bas mot.',
        'Il pleut dans l’écurie, maintenant. Augustin, tu avais promis de refaire ce toit.',
        'Ça sent bon, la pluie sur le crottin. Si, si. Il faut être d’ici pour comprendre.',
      ],
    },
    discussions: [
      {
        avec: 'guerisseuse',
        lignes: [
          ['eleveuse', 'Ma tante, vous avez encore maigri. Venez passer l’hiver au ranch : il y a de la place, et du lait tant que vous voudrez.'],
          ['guerisseuse', 'Et qui soignera la forêt pendant que je boirai ton lait ? Les écureuils ? Ils ne savent même pas tenir une cuillère.'],
          ['eleveuse', 'La forêt se débrouillera bien un hiver. Vous, je n’en suis pas si sûre.'],
          ['guerisseuse', 'Tu parles comme ton père. Honoré voulait déjà m’enfermer au chaud quand j’avais vingt ans. Il est au cimetière, et moi, je cueille.'],
          ['eleveuse', 'Ne dites pas des choses comme ça. … Les bêtes ont encore regardé vers {lieu:hameau_abandonne}, cette nuit.'],
          ['guerisseuse', 'Je sais. Rentre-les tôt, ce soir, et mets du sel sur le seuil de l’étable. Pas pour elles, ma fille. Pour toi.'],
        ],
      },
      {
        avec: 'postiere',
        lignes: [
          ['postiere', 'Courrier ! La facture du bourrelier, le bulletin agricole, et… tiens, tiens. Une enveloppe mauve. Toute ma sacoche sent la violette !'],
          ['eleveuse', 'Donne. Et arrête de guetter ma tête, tu vas finir par t’user les yeux.'],
          ['postiere', 'Je ne guette rien, je vérifie l’adresse, c’est le règlement ! … Il y avait autre chose, ce matin. Une lettre pour Augustin.'],
          ['eleveuse', 'Pour Augustin. Il est mort depuis cinq ans, tu le sais mieux que personne.'],
          ['postiere', 'Je sais. Je l’ai rangée dans mon tiroir, avec les autres. Ces lettres-là, on ne les distribue pas.'],
          ['eleveuse', 'Garde-la. Et ne l’ouvre pas. Pour une fois dans ta vie, {npc:postiere}, n’ouvre pas.'],
        ],
      },
      {
        avec: 'grainetiere',
        lignes: [
          ['grainetiere', 'Te voilà ! Ton ardoise fait trois lignes, maintenant : avoine, avoine, et encore avoine. Mon père se retournerait dans sa tombe.'],
          ['eleveuse', 'Je vous paierai en fromage, comme toujours. Vous l’aimez, mon fromage, ne dites pas le contraire.'],
          ['grainetiere', 'Je l’aime, mais il ne paie pas mes graines. … Bon. Mets-en deux, et on n’en parle plus.'],
          ['eleveuse', 'Marché conclu. Dites… Anselme, avant de partir, il vous avait parlé de ses bêtes ? De la façon dont elles regardaient ?'],
          ['grainetiere', 'Il m’a dit que ses poules dormaient tournées vers {lieu:vieux_puits}. Pourquoi ? Qu’est-ce qu’elles regardent, les tiennes ?'],
          ['eleveuse', 'La même chose, je crois. Je vous apporte les fromages demain. Et fermez bien votre porte, ce soir.'],
        ],
      },
    ],
    foi_lignes: [
      'Je vais à la messe à Pâques et à Noël, pour que le curé ne m’enterre pas de travers. Le reste de l’année, je remercie qui il faut, là où il faut, avec du lait.',
      'Ma tante dit que le Cerf Blanc veille sur les bêtes. Moi, je laisse un seau de lait à la lisière : s’il ne le boit pas, les renards le boiront, et rien n’est perdu.',
      'Quand un poulain naît, je monte nouer un ruban rouge à {lieu:source}. Tout le monde fait pareil, au hameau, et personne n’en parle. C’est ça, la foi, chez nous.',
      'Ceux d’en bas… Ma tante m’a appris à ne jamais prononcer le reste. Je ne suis pas dévote, mais je ne suis pas idiote non plus.',
    ],
    reaction_piete: {
      eglise: 'On dit qu’on vous voit à l’église plus souvent que le sacristain. Tant mieux pour vous. Dites un mot pour mes bêtes, si vous y pensez : le curé ne le fera pas.',
      anciens: 'Ma tante m’a dit que vous laissiez des offrandes aux Anciens. Elle souriait en le disant, et ma tante ne sourit jamais. Vous lui avez fait un cadeau sans le savoir.',
      dessous: 'Mes chiens reculent devant vous, depuis quelques jours. Et vous sentez la pierre mouillée, la cave, le fond d’un puits. Qu’est-ce que vous avez fait, sur la lande ou au bord du vieux puits ? Non. Ne me le dites pas.',
    },
    fete_lignes: [
      'C’est ma fête, aujourd’hui ! Personne ne s’en souvient, sauf ma tante, qui m’envoie chaque année un bouquet d’herbes qui empeste. C’est sa façon de dire qu’elle m’aime.',
      'Encore un an de plus. Tempête ne m’a pas mordue de la journée, c’est son cadeau, je suppose. Venez boire un bol de lait à ma santé, ce soir. Avant la nuit.',
    ],
    secret: 'J’ai répondu, une fois, à une lettre à la violette. J’ai glissé ma réponse sous une pierre, devant {lieu:calvaire}, sans nom, comme une gamine. Le lendemain, elle n’y était plus. Et la lettre suivante commençait par « Merci ».',
  },

  // --------------------------------------------------------------------------
  pecheur: {
    foi: 'anciens', devotion: 3, fete: 15,
    mythes: ['dame_du_lac', 'cloche_noyee'],
    mythe_intro: [
      'Hé. Asseyez-vous au bout du ponton, les pieds au-dessus de l’eau : ces histoires-là, il faut les dire près d’elle, sinon elle croit qu’on parle dans son dos.',
      'Mon grand-père la racontait en ravaudant ses filets, sans lever les yeux. Je vais faire pareil ; ne m’interrompez pas, je perdrais le fil, et le fil, ici, c’est important.',
    ],
    histoire: [
      {
        titre: 'La seule mer qui ne ment pas', min: 0,
        texte: 'Mon grand-père, Yves Morvan, était marin à Douarnenez. Il est venu dans la vallée pour un héritage de rien du tout, il a vu le lac un matin de brume, et il n’est jamais reparti : il disait que c’était la seule mer qui ne lui avait jamais menti. Il m’a appris les nœuds avant les lettres, et il m’a donné sa boussole de marin pour mes dix ans. Moi, plus tard, je l’ai donnée à Jules, parce qu’il en avait plus besoin que moi. Quand je ferme les yeux, je sens encore le goudron de ses mains.',
      },
      {
        titre: 'Le Notaire', min: 0,
        texte: 'Pêcher, ce n’est pas attraper du poisson : c’est apprendre à attendre sans rien attendre. Je me lève avant la brume, je relève les nasses, je ravaude, je vends à {npc:aubergiste} ce qu’il veut bien me payer, et le reste, je le fume dans la cabane. Je connais chaque herbier, chaque trou, chaque vieux brochet ; il y en a un, sous le ponton, que j’appelle le Notaire, parce qu’il me regarde toujours comme si je lui devais de l’argent. Le soir, je relève tout avant que le soleil touche l’eau. Mon père ne pêchait jamais la nuit, son père non plus : ça ne s’explique pas, ça se respecte.',
      },
      {
        titre: 'Deux coups de lanterne', min: 1,
        texte: 'Il y a trente ans, le gardien du phare avait une fille, Rose, qui riait comme on casse du bois sec. Chaque soir, quand je rentrais la barque, elle balançait la lanterne deux fois, là-haut, et ça voulait dire bonne nuit. Je n’ai jamais osé lui dire autre chose que bonjour, bonsoir, et le prix des perches. Quand son père est mort, elle est partie servir chez des bourgeois, à Lyon ; elle m’a écrit deux fois, et moi, je lui ai écrit quarante lettres que je n’ai jamais postées. Certains soirs, la lanterne du phare s’allume encore. Je sais bien que ce n’est pas elle.',
      },
      {
        titre: 'Un cercueil pour des bottes', min: 2,
        texte: 'Le soir où Jules est parti, j’étais chez Bonnefoy, à perdre aux cartes ; l’orage a éclaté pendant la partie, les ponts étaient levés, et j’ai dormi là-bas en me disant que Jules était rentré depuis longtemps. Le lendemain, on a retrouvé sa barque retournée contre les rochers du phare, les avirons bien rangés dessous, comme s’il les avait posés là. On a dragué le lac six jours avec les hommes de {ville}, et {npc:aubergiste}, qui ramait à côté de moi, n’a pas fait une seule plaisanterie. Le curé a dit la messe devant un cercueil vide ; enfin, pas tout à fait vide : j’y avais mis ses bottes, pour qu’il revienne les chercher. Depuis, chaque Toussaint, une lettre arrive avec son écriture. Je ne les ouvre pas ; je les garde toutes, fermées, dans la boîte à hameçons, sous mon lit.',
      },
      {
        titre: 'Tac-tac', min: 3,
        texte: 'Gamins, quand Jules voulait que je sorte, il tapait deux coups sur la coque de la barque, sous ma fenêtre : tac-tac. Certaines nuits, l’eau clapote contre le ponton exactement comme ça. Alors je reste assis sur mon lit, les bottes aux pieds, jusqu’à l’aube, parce que j’ai peur de sortir, et peur de ne pas sortir. Quand je n’en peux plus, je marche le long de la rive, loin, sans lanterne, jusqu’à ce que le bruit se taise. Il y a des matins où je ne me rappelle pas le chemin du retour. Je me réveille dans la cabane, mouillé jusqu’aux genoux.',
      },
      {
        titre: 'Va voir tout seul', min: 4,
        texte: 'Le jour où il est parti, Jules est venu me trouver sur le ponton, les yeux brillants comme s’il avait la fièvre. Il avait vu des lumières sous l’eau, des fenêtres, des gens, et il voulait que je vienne voir avec lui, le soir même. J’avais les mains dans un filet déchiré et la tête ailleurs ; j’ai ri, je lui ai dit qu’il buvait trop chez Bonnefoy, et que s’il était si malin, il n’avait qu’à aller voir tout seul. Ce sont les derniers mots que je lui ai dits en face. Va voir tout seul. Dix ans que je les entends dans chaque clapotis.',
      },
      {
        titre: 'Le bol du dimanche', min: 6,
        texte: 'Ma mère posait déjà du lait pour la Dame, au bout du ponton, les soirs où mon père s’attardait trop loin sur l’eau. Moi, j’ai repris l’hiver d’après Jules, sans trop savoir pourquoi, avec le lait de {npc:eleveuse}. On dit que la Dame garde ce que le lac a pris : pas comme on garde un prisonnier, comme on garde des pommes au grenier, au frais, pour plus tard. Alors je me dis que Jules est quelque part au frais, et qu’un jour, elle me le rendra, ou qu’elle me mènera jusqu’à lui. Depuis que vous venez vous asseoir sur ce ponton, j’y crois un peu plus, allez savoir pourquoi.',
      },
      {
        titre: 'Trente brasses', min: 8,
        texte: 'Je vous ai dit que j’étais chez Bonnefoy, à perdre aux cartes, quand Jules est parti. C’est faux, {prenom} : j’y suis arrivé après. Au crépuscule, je l’ai vu pousser sa barque, et je l’ai suivi avec la vieille, pour le ramener par le col s’il le fallait. J’étais à trente brasses quand l’eau s’est allumée sous lui, comme une ville entière, et que des mains pâles sont montées le long de sa coque ; il ne se débattait pas, il se penchait vers elles, et il souriait. Moi, j’ai viré de bord, j’ai ramé jusqu’ici sans me retourner, et j’ai couru jusqu’en ville avant qu’on lève les ponts, pour m’asseoir chez Bonnefoy, trempé, et qu’on puisse dire que j’y étais. Dix ans que tout le monde me plaint, et je n’ai jamais eu le courage de dire que j’ai eu peur.',
      },
    ],
    questions: [
      {
        id: 'pecheur_q1', min: 0,
        texte: 'Hé. Vous savez vous taire, vous ? Longtemps, je veux dire. Une heure entière, sans que ça vous pèse ?',
        reponses: [
          { label: 'Oui. Le silence ne me fait pas peur.', amitie: 25, reaction: 'Alors revenez un matin, avant la brume. On ne dira rien, et ce sera la meilleure conversation de la semaine.' },
          { label: 'Non. Le silence, c’est du temps perdu.', amitie: -15, reaction: 'Perdu… Le lac ne pense pas comme vous. Moi non plus, mais bon : chacun son eau.' },
          { label: 'Je peux essayer. Vous commencez ?', amitie: 15, reaction: '… Hé. Vous avez tenu dix secondes de plus que Bonnefoy, c’est déjà un début.' },
        ],
        rappel: [
          'Le silence ne vous fait pas peur, vous m’aviez dit. Alors venez vous asseoir : il y en a pour deux, ce matin.',
          'Vous trouvez toujours que le silence, c’est du temps perdu ? J’en ai perdu beaucoup, de ce temps-là, et je ne le regrette pas.',
          'Dix secondes, vous aviez tenu. J’ai raconté ça à Bonnefoy : il a ri pendant une heure. Lui, il n’a jamais tenu du tout.',
        ],
      },
      {
        id: 'pecheur_q2', min: 1,
        texte: 'Vous avez un frère, vous ? Ou une sœur ? Quelqu’un qui connaît toutes vos bêtises d’enfant ?',
        reponses: [
          { label: 'Oui. Et je ne lui écris pas assez souvent.', amitie: 20, reaction: 'Écrivez-lui ce soir, même trois lignes, même des bêtises. On croit toujours qu’on aura le temps. Le lac, lui, ne prévient pas.' },
          { label: 'Non. Et je ne m’en porte pas plus mal.', amitie: -10, reaction: 'Hé. Tant mieux pour vous. Au moins, vous ne chercherez jamais un visage dans l’eau, tous les matins.' },
          { label: 'J’ai un cousin qui me doit de l’argent. Ça compte ?', amitie: 10, reaction: 'Ça compte, oui. Jules me devait trois francs et une canne, et je ne les lui ai jamais réclamés ; maintenant, je regrette, ça lui aurait fait une raison de revenir.' },
        ],
        rappel: [
          'Vous avez écrit, à votre frère, ou à votre sœur ? Ne me dites pas non. Dites-moi seulement « bientôt ».',
          'Vous m’aviez dit que vous n’aviez ni frère ni sœur. J’ai pensé à vous hier soir, en regardant l’eau : on est deux, comme ça, chacun sur sa rive.',
          'Votre cousin vous a remboursé ? Ne lui réclamez pas tout : il faut toujours qu’on vous doive un peu, ça oblige les gens à revenir.',
        ],
      },
      {
        id: 'pecheur_q3', min: 2,
        texte: 'Si le lac vous rendait une chose, une seule, parmi tout ce que vous avez perdu… vous lui demanderiez quoi ?',
        reponses: [
          { label: 'Quelqu’un que j’aimais. Rien qu’une heure.', amitie: 25, reaction: 'Une heure… C’est ce que je demande aussi, tous les dimanches. Il ne rend jamais, mais on continue de demander, sinon il oublierait qu’on attend.' },
          { label: 'Rien. Ce qui est perdu est perdu.', amitie: -5, reaction: 'C’est sage. C’est ce que dit le curé, avec plus de latin. Moi, je n’y arrive pas : je ne suis pas sage, je suis pêcheur.' },
          { label: 'Mon couteau. Je l’ai fait tomber du ponton hier.', amitie: 10, reaction: 'Hé ! Le Notaire l’a sûrement avalé, le vieux brochet. Au moins, vous, vous avez perdu quelque chose qui se remplace.' },
        ],
        rappel: [
          'Une heure avec quelqu’un que vous aimiez… J’ai demandé pour vous aussi, dimanche, en posant le bol. Ça ne coûte rien de demander pour deux.',
          '« Ce qui est perdu est perdu. » Vous aviez sûrement raison. J’ai quand même posé le bol, dimanche : on ne se refait pas.',
          'J’ai cherché votre couteau sous le ponton, hier. Rien. Le Notaire l’a gardé ; il garde tout, comme le lac.',
        ],
      },
      {
        id: 'pecheur_q4', min: 4,
        texte: 'Si quelqu’un vous appelait depuis l’eau, une nuit, avec la voix de quelqu’un que vous avez perdu… vous iriez ?',
        reponses: [
          { label: 'Oui. Je ne pourrais pas faire autrement.', amitie: 15, reaction: 'Moi non plus, je crois. C’est pour ça que je ne sors plus, la nuit. Si ça vous arrive, venez d’abord frapper chez moi en disant votre nom, et on ira ensemble… ou on n’ira pas.' },
          { label: 'Non. Les morts n’ont rien à me dire.', amitie: 5, reaction: 'C’est ce qu’il faut répondre. Accrochez-vous à ça, les nuits où l’eau clapote. Moi, je n’ai jamais su.' },
          { label: 'Je lui dirais de repasser en plein jour.', amitie: 10, reaction: 'Hé… hé hé. Repasser en plein jour ! Jules aurait aimé ça, il riait de tout, même du noir.' },
        ],
        rappel: [
          'Vous vous rappelez ? Si l’eau vous appelle, vous venez d’abord frapper chez moi, en disant votre nom. Je n’ai pas oublié.',
          '« Les morts n’ont rien à me dire. » Je me le suis répété cette nuit, quand l’eau clapotait. Ça a marché une heure ; c’est déjà ça.',
          'Cette nuit, l’eau a clapoté, et j’ai crié par la fenêtre : « Repassez en plein jour ! » Ça s’est tu. Je ne sais pas si c’est vous qui avez raison, ou le hasard.',
        ],
      },
    ],
    humeurs: {
      joyeux: [
        'Hé ! Trois truites avant la brume, et le Notaire a mordu ; il a craché l’hameçon, mais il a mordu.',
        'Vous tombez bien : le lac est de bonne humeur, ce matin. Moi aussi, pour une fois.',
        'Bonnefoy m’a fait rire, hier soir. Je ne sais plus de quoi, je sais seulement que j’ai ri.',
      ],
      triste: [
        'Hé… pardon. C’est un de ces jours où l’eau ressemble trop à ce jour-là.',
        'J’ai rêvé de mon frère. Il avait froid, et je n’avais pas de couverture à lui donner.',
        'Asseyez-vous, si vous voulez, mais je ne parlerai pas beaucoup. Le lac non plus, aujourd’hui.',
      ],
      fatigue: [
        'Pas fermé l’œil. L’eau a clapoté toute la nuit contre le ponton : tac-tac, tac-tac.',
        'J’ai ravaudé jusqu’à pas d’heure, et mes doigts ne savent plus faire les nœuds. C’est mauvais signe, quand les doigts oublient.',
        'J’ai les yeux qui piquent : trop regardé l’eau. Je le dis à tout le monde, et je ne m’écoute jamais.',
      ],
      inquiet: [
        'Vous n’avez pas entendu une cloche, cette nuit, sous le lac ? Tant mieux pour vous.',
        'Ma barque avait bougé, ce matin, amarrée plus loin avec un nœud de marin. Plus personne ne fait ces nœuds-là, ici, plus personne de vivant.',
        'Les poissons ne mordent plus depuis deux jours. Ils se tiennent au fond, tous du même côté, comme s’ils attendaient quelque chose.',
      ],
      agace: [
        'Pas aujourd’hui. Quelqu’un a piétiné mes lignes, et ce n’était pas un poisson.',
        'Si c’est pour me demander si ça mord : non, ça ne mord pas. Et ça ne mordra pas si on parle fort.',
        'Bonnefoy m’a payé mes perches en promesses. Je ne me nourris pas de promesses, et le lac non plus.',
      ],
    },
    souvenirs: {
      cadeau_adore: [
        '{objet}… Je n’ai pas oublié. Je l’ai raconté à la Dame, dimanche, en posant le bol : il fallait que quelqu’un d’autre le sache.',
        '{objet}. Personne ne m’avait rien offert depuis Jules. Voilà, je voulais que vous le sachiez, c’est tout.',
      ],
      cadeau_deteste: [
        '{objet}, hein… J’ai failli en faire cadeau au lac, et puis je me suis dit qu’il ne méritait pas ça.',
        '{objet}. Je ne vous en veux pas, mais la prochaine fois, apportez-moi une pomme. Une pomme, c’est simple, et c’est toujours juste.',
      ],
      aide: [
        'Vous m’avez aidé, l’autre jour. Je ne sais pas dire merci comme Bonnefoy, avec des tapes dans le dos, alors je vous garde la meilleure place du ponton.',
        'Je repense à votre coup de main. Jules aussi aidait sans qu’on lui demande ; ça me fait du bien et ça me fait mal, les deux à la fois.',
      ],
      toque_nuit: [
        'C’était vous, l’autre nuit, qui frappiez ? J’ai cru… Peu importe ce que j’ai cru. Ne frappez plus la nuit, et surtout jamais deux coups.',
        'Vous avez frappé chez moi en pleine nuit. Je ne suis pas sorti : je suis resté assis sur mon lit jusqu’au jour, les bottes aux pieds.',
      ],
      coup: [
        'Vous m’avez frappé. J’ai cinquante-huit ans et des mains de ravaudeur, je ne rends pas les coups ; le lac s’en chargera peut-être, il se souvient de tout.',
        'Je n’ai pas oublié le coup. Je ne dis rien, mais je n’oublie pas, et l’eau est encore plus patiente que moi.',
      ],
      absence: [
        'Hé. Vous revoilà. Je commençais à vous chercher dans l’eau, le matin ; c’est une mauvaise habitude que j’ai.',
        'Ça faisait longtemps. Le ponton trouvait le temps long. Moi aussi, un peu. Un tout petit peu.',
      ],
      victime: [
        'Encore quelqu’un de moins. Cette nuit, j’ai entendu ramer sur le lac, loin, sans lanterne ; je ne suis pas sorti voir, je ne sors jamais voir.',
        'Tout le monde se regarde de travers, depuis. Moi, on ne me regarde pas, on ne regarde jamais le pêcheur : c’est pratique, parfois, et triste, souvent.',
      ],
    },
    tenue: {
      arme: 'Hé. Rangez ça, sur mon ponton : l’eau n’aime pas le fer qui cherche le sang.',
      pelle: 'Une pelle ? Ici, dès qu’on creuse un peu, l’eau remonte dans le trou : tout finit au lac, vous verrez.',
      potion: 'Une fiole de chez la vieille Morel, hein ? Si c’est celle qui fait respirer sous l’eau, ne me la montrez pas : je pourrais en avoir envie.',
      animal_mort: 'Enterrez cette pauvre bête loin de la rive. Le lac a déjà assez de morts à garder.',
      fleurs: 'Si vous ne savez pas à qui donner ces fleurs, portez-les sur {lieu:pierre_dame} : elle ne dit jamais merci, mais elle les prend toujours.',
      poisson: 'Belle bête. Remerciez le lac, surtout : on le remercie toujours pour ce qu’il donne, sinon il s’en souvient.',
      lanterne_jour: 'Une lanterne en plein jour. Jules faisait pareil, les derniers temps : il disait qu’il y a des coins où il fait nuit même à midi.',
      relique: '… Ça vient d’avant, d’avant le lac, même. Serrez bien ça contre vous, et que ça ne tombe jamais à l’eau : elle reprendrait tout.',
      rien: 'Les mains vides. C’est bien : on pêche mieux les mains vides, il reste de la place pour ce qui vient.',
    },
    chez_soi: {
      jour: 'Hé. La porte n’a pas de loquet, mais ce n’est pas une invitation. Enfin… asseyez-vous, puisque vous êtes là, et ne touchez pas à la boîte sous le lit.',
      nuit: 'Jules ? … Non. Vous. Vous m’avez fait croire… Sortez, s’il vous plaît. Et si on vous appelle sur le chemin, ne répondez pas.',
    },
    activites: {
      travail: [
        'Nœud de chaise, nœud de cabestan… Grand-père, tu serais fier. Enfin, un peu.',
        'Allez, le Notaire, sors de ton trou. J’ai un bel asticot, rien que pour toi.',
        'Une maille, deux mailles… Ce qui a déchiré ce filet avait des dents. Ou des ongles.',
      ],
      repas: [
        'Pain, perche grillée, un reste de soupe. Jules disait que je cuisinais comme un phoque. Il avait raison.',
        'Une pomme pour le dessert. Une seule. L’autre, on la garde pour dimanche.',
        'Bonnefoy me vendrait bien un ragoût. Mais le ragoût, ça ne se mange pas seul.',
      ],
      priere: [
        'Dame, voilà le lait. Il vient du ranch, il est frais. Garde-le bien au frais, lui aussi. Tu sais de qui je parle.',
        'Je ne te demande pas de me le rendre. Je te demande qu’il n’ait pas froid. C’est déjà beaucoup.',
        'Le premier poisson est pour toi, comme toujours. Pas le plus beau, je sais. Mais le premier.',
      ],
      promenade: [
        'Il y a quelqu’un sur la rive d’en face. … Non. Un piquet. C’est un piquet.',
        'Encore des traces de pieds nus dans la vase. Elles sortent de l’eau. Elles n’y retournent pas.',
        'Le phare… Rose, si tu voyais comme il a vieilli. Comme moi. Plus que moi.',
      ],
      soir: [
        'Lignes relevées, barque tirée, porte calée. Encore une nuit. Encore une.',
        'Bonne nuit, le lac. Ne prends personne, cette nuit. Pas cette nuit.',
        'Le soleil touche l’eau. On rentre, tout de suite, et on ne regarde pas derrière.',
      ],
      pluie: [
        'Pluie fine, le brochet se réveille. Le Notaire va sortir, je le sens.',
        'La pluie sur le lac, ça fait comme des milliers de doigts qui frappent. Surtout, ne pas compter.',
        'Le toit fuit au-dessus du lit. C’est la partie que Jules avait réparée. Alors je la laisse fuir.',
      ],
    },
    discussions: [
      {
        avec: 'aubergiste',
        lignes: [
          ['aubergiste', 'Nom d’une pipe, le voilà ! Tu m’apportes des perches, ou tu viens seulement me faire la tête ?'],
          ['pecheur', 'Hé. Les deux. Six perches, et une tête de six pieds de long.'],
          ['aubergiste', 'Ha ! Parole de Bonnefoy, il fait de l’esprit ! Tu te rappelles les écrevisses au lard, sous le vieux saule ? T’en avais pris quarante, et moi, pas une.'],
          ['pecheur', 'Tu les avais toutes mangées avant qu’on rentre. Crues. Ta mère t’a soigné à l’huile de ricin pendant trois jours.'],
          ['aubergiste', 'Ah, ma pauvre mère… Dis, tu reviens jouer aux cartes, un jeudi ? Depuis le soir de Jules, tu ne viens plus. Ce soir-là, tu étais arrivé trempé jusqu’aux os, je m’en souviens, et il ne pleuvait même pas encore.'],
          ['pecheur', '… J’étais tombé du ponton. Je t’apporte les perches demain, Bonnefoy. Et jeudi, je viendrai. Peut-être.'],
        ],
      },
      {
        avec: 'eleveuse',
        lignes: [
          ['eleveuse', 'Voilà votre lait, comme chaque dimanche, le plus frais de la traite. Toujours pas de chat, chez vous ?'],
          ['pecheur', 'Hé. Toujours pas de chat.'],
          ['eleveuse', 'Alors c’est pour qui, ce lait ? Ça fait des années que je vous pose la question, et des années que vous me regardez comme ça.'],
          ['pecheur', 'Pour quelqu’un qui a soif le dimanche. Et froid, peut-être. Votre lait est bon ; il vaut mieux que ce soit le vôtre.'],
          ['eleveuse', 'Vous êtes pareil que ma tante, vous : des réponses qui posent trois questions. … Tenez, j’ai mis un fromage dans le panier. Celui-là, il est pour vous, pas pour la personne qui a soif.'],
          ['pecheur', 'Hé… Merci, {npc:eleveuse}. Vous avez le cœur plus tendre que vos bottes.'],
        ],
      },
      {
        avec: 'cure',
        lignes: [
          ['cure', 'Pax tecum, Morvan. Dimanche, cela fera dix ans pour votre frère ; je dirai la messe. Entrerez-vous, cette fois, ou resterez-vous encore sur le seuil ?'],
          ['pecheur', 'Sur le seuil, mon père. Le lac m’entend mieux de là.'],
          ['cure', 'Le lac n’a pas d’oreilles, mon enfant. Dieu en a. … Pardonnez-moi : je suis moins sûr qu’à vingt ans de ce que le lac a, ou n’a pas.'],
          ['pecheur', 'Vous l’avez entendue, vous aussi, la nuit de l’orage ? La cloche, sous l’eau ?'],
          ['cure', 'Treize coups. Mais la mienne sonnait dans mon clocher, et la corde n’a pas bougé. Elles sonnaient ensemble, Morvan. Exactement ensemble.'],
          ['pecheur', 'Alors elles se répondent. … Dites la messe, mon père. Je serai sur le seuil.'],
        ],
      },
    ],
    foi_lignes: [
      'La Dame n’est pas de ceux d’en bas, ne confondez jamais. Elle, elle garde. Eux, ils prennent, et ils ne rendent que ce qu’ils ont abîmé.',
      'Le curé est un brave homme. Son Dieu est là-haut, dans le ciel ; la mienne est au fond du lac, dans l’eau froide, et elle a les cheveux longs. On se salue, lui et moi, on ne se dispute pas.',
      'Mon père jetait le premier poisson de l’année à l’eau, vivant, et moi aussi. Jules se moquait de nous ; lui, il ne le faisait jamais. Je ne dis pas que c’est pour ça. Je ne dis rien.',
      'Je ne prie pas à genoux. Je prie assis, les pieds au-dessus de l’eau, et je parle doucement : elle n’aime pas qu’on crie.',
    ],
    reaction_piete: {
      eglise: 'Hé. Vous sentez le cierge. Le curé doit être content d’avoir enfin quelqu’un au premier rang ; moi, je reste sur le seuil. Priez pour Jules, si vous y pensez, ça ne peut pas faire de mal.',
      anciens: 'Vous avez posé des fleurs sur sa pierre, n’est-ce pas ? L’eau était claire comme du verre, ce matin, jusqu’au fond. Elle ne fait ça que pour ceux qu’elle aime.',
      dessous: 'L’eau recule quand vous marchez sur le ponton, regardez : elle se retire de vos pas. Elle ne fait ça pour personne. Qu’est-ce que vous leur avez donné, sur la lande ou au vieux puits ? Et qu’est-ce qu’ils vous ont promis ?',
    },
    fete_lignes: [
      'Hé. C’est ma fête, aujourd’hui. Jules m’offrait toujours un hameçon neuf, planté dans un bouchon ; j’en ai une boîte pleine, et le dernier a dix ans.',
      'Bonnefoy va descendre au ponton avec une omelette aux champignons, comme chaque année, et il va chanter faux. Restez, si vous voulez : il chante moins faux devant du monde.',
    ],
    secret: 'Je ne sais pas nager. Cinquante ans sur l’eau, et je coule comme une pierre. C’est moi qui ai appris à ramer à Jules ; nager, il l’a appris tout seul, en cachette, pour ne pas me faire honte. Ne le dites pas à Bonnefoy : il rirait, et puis il comprendrait, et il ne rirait plus.',
  },

  // --------------------------------------------------------------------------
  guerisseuse: {
    foi: 'anciens', devotion: 3, fete: 28,
    mythes: ['cerf_blanc', 'treize_pierres', 'dame_du_lac', 'chene_des_ancetres'],
    mythe_intro: [
      'Asseyez-vous, et ne croisez pas les jambes : les vieilles histoires n’aiment pas qu’on leur ferme la porte. Celle-ci, ma grand-mère la tenait de la sienne, et je vous la donne telle quelle, avec ses trous.',
      'Buvez d’abord, c’est de la mélisse, elle ouvre l’oreille. Je vais vous dire ce qu’on racontait ici avant les cloches, avant les cartes, avant le curé.',
    ],
    histoire: [
      {
        titre: 'La plus maigre', min: 0,
        texte: 'Je suis née à {hameau}, dans la maison Morel, la cinquième de sept, et la plus maigre. À six ans, ma grand-mère Aglaé est venue me prendre par la main et m’a emmenée ici, dans la forêt, « pour lui apprendre à écouter ». Ma mère a pleuré sur le seuil ; ma grand-mère lui a répondu qu’on ne choisit pas, que c’est la forêt qui choisit, et qu’elle avait pris la plus maigre parce que les maigres entendent mieux. J’ai su le nom de cent plantes avant de savoir mon Notre Père. Je le sais aussi, remarquez : il ne m’a jamais fait de mal.',
      },
      {
        titre: 'Payée en silence', min: 0,
        texte: 'J’ai mis au monde {npc:eleveuse}, {npc:postiere}, et la moitié des enfants que le père {npc:cure} a baptisés. J’ai remis des épaules, coupé des fièvres, arraché des dents, fermé des yeux. On me paie en œufs, en lard, en fagots, et surtout en silence : ceux qui viennent la nuit me font, le jour, un petit salut de la tête, et c’est tout. Le médecin du bourg m’appelle « la sorcière » devant les gens, et m’envoie ses cas perdus par derrière. Je ne lui en veux pas : il faut bien que quelqu’un ait l’air de savoir.',
      },
      {
        titre: 'Les mains noires', min: 1,
        texte: 'J’avais dix-neuf ans quand les charbonniers sont venus dresser leurs meules dans la forêt, là où il ne reste plus que {lieu:charbonniere} et des orties. L’un d’eux, Étienne Garnier, est venu me faire soigner une brûlure à la main ; il est revenu la semaine suivante avec une autre brûlure, puis une autre, et à la quatrième, j’ai compris qu’il se brûlait exprès. Il avait de la suie dans les plis des paupières, même le dimanche, et il sentait le bois qui fume. Ma grand-mère ne m’a rien défendu : elle m’a seulement montré la page du grimoire où il est écrit que la servante ne prend pas d’homme, parce qu’elle est déjà promise. Et elle m’a laissée choisir. C’est bien pire.',
      },
      {
        titre: 'Le cœur à droite', min: 2,
        texte: 'Étienne est parti avec les autres, à l’automne, en me promettant le printemps ; le printemps est venu, lui non. L’hiver suivant, ma grand-mère est descendue dans {lieu:vieux_puits}, une nuit où la lune saignait, et elle en est remontée au matin, les ongles cassés, souriante comme une étrangère. Elle est morte trois jours plus tard, dans le lit où je dors. Quand je l’ai lavée pour la mettre en terre, j’ai posé la main sur sa poitrine, par habitude, pour écouter ; il n’y avait plus rien à entendre, mais je sais de quel côté j’ai posé la main. Depuis ce jour-là, chaque matin, avant même d’ouvrir les volets, je vérifie le mien.',
      },
      {
        titre: 'Celui qui se rapproche', min: 3,
        texte: 'À mon âge, j’ai peur de deux choses, et la mort n’en fait pas partie. J’ai peur d’oublier : le jour où mes tisanes ne suffiront plus, je me réveillerai comme les autres après les nuits rouges, contente et vide, et plus personne dans la vallée ne se souviendra de rien. Et j’ai peur du grand, là-bas, celui qui se tient immobile au loin et qu’on ne voit jamais arriver. Quand j’étais petite, il était sur la crête des Combes ; à la mort de ma grand-mère, à la lisière du bois ; hier soir, de l’autre côté du ruisseau. Il ne marche pas. Il est simplement un peu plus près chaque fois qu’on regarde ailleurs.',
      },
      {
        titre: 'La nuit de Lise', min: 4,
        texte: 'À l’automne 1870, la veuve Roux est venue me trouver : sa petite Lise parlait d’un « monsieur blanc gentil » et marchait en dormant vers {lieu:vieux_puits}. La mère ne dormait plus depuis trois semaines, à veiller sa fille, et elle tenait à peine debout ; je lui ai donné de quoi dormir une nuit, une seule, en lui disant d’attacher une clochette à la cheville de la petite. Cette nuit-là, la mère a dormi comme une pierre. La clochette, on l’a retrouvée sur la margelle ; Lise, jamais. C’est moi qui ai planté sa croix, dans le bois, sur une tombe où il n’y a rien. Je n’y vais plus : elle m’y attend, et je n’ai pas le courage.',
      },
      {
        titre: 'Celle qui viendra', min: 6,
        texte: 'Ma grand-mère a écrit son grimoire « pour celle qui viendra après moi », et celle-là, c’était moi. Moi, je n’ai personne à qui l’écrire : ma nièce préfère les bêtes aux herbes, et elle a raison, les bêtes au moins regardent quand on leur parle. Et puis il y a eu vous, qui revenez toujours, qui posez les bonnes questions et qui ne vous asseyez pas sur la souche. Ma grand-mère croyait qu’on pouvait apaiser la vallée en rendant aux Anciens ce qu’on leur a pris, onze choses, une à une, posées sur l’autel du cercle à minuit ; j’ai passé ma vie à chercher, et je n’ai trouvé que des chemins. Mes jambes ne descendent plus dans les grottes, mais les vôtres, si. Je ne vous demande rien, {prenom} ; je dis seulement que j’ai recommencé à espérer, et qu’à mon âge, c’est presque indécent.',
      },
      {
        titre: 'Le visage d’Étienne', min: 8,
        texte: 'L’hiver 1868, {npc:eleveuse} avait deux ans, et le croup l’étouffait ; j’avais tout essayé, les vapeurs, le miel, les prières aux Anciens, et elle devenait bleue dans mes bras. Alors, une nuit, je suis montée à {lieu:dolmen}, sur la lande, et moi, la servante, j’ai parlé à ceux d’en bas. Ils ont voulu ce que j’avais de plus cher, et j’ai donné le visage d’Étienne. Je me souviens de tout, {prenom}, de sa voix, de ses mains brûlées, de l’odeur du bois qui fume ; mais quand je cherche son visage, il n’y a plus qu’un rond de fumée. La petite a respiré au matin, et elle n’en a jamais rien su. Quand Augustin est mort, j’ai compris qu’ils n’avaient pas fini d’encaisser.',
      },
    ],
    questions: [
      {
        id: 'guerisseuse_q1', min: 0,
        texte: 'Donnez-moi votre main. … Non, je ne lis pas les lignes, c’est bon pour les foires. Dites-moi plutôt : de quoi avez-vous rêvé, cette nuit ?',
        reponses: [
          { label: 'De ma mère. Elle me parlait, mais sans voix.', amitie: 20, reaction: 'Sans voix… alors elle est de l’autre côté, et elle essaie. Posez un verre d’eau près de votre lit, ce soir, l’eau porte les voix ; mais ne la buvez pas au matin.' },
          { label: 'Je ne rêve pas. Je dors, c’est tout.', amitie: -10, reaction: 'Tout le monde rêve, {fermier}. Ceux qui disent le contraire ont peur de s’en souvenir ; ce n’est pas un reproche, c’est un diagnostic.' },
          { label: 'D’une tarte aux pommes. Elle m’a échappé.', amitie: 10, reaction: 'Une tarte qui s’enfuit ! Ma grand-mère aurait dit que c’est un rêve d’argent ; moi, je dis que vous avez faim. Tenez, une noix.' },
        ],
        rappel: [
          'Vous avez posé le verre d’eau près du lit ? … Et elle a parlé ? Non, ne répondez pas ici : les arbres écoutent.',
          'Toujours pas de rêves ? Hm. Vous avez pourtant les yeux de quelqu’un qui en fait, de ceux qu’on range vite au réveil.',
          'Alors, cette tarte, vous l’avez rattrapée ? J’ai ri toute seule en y repensant. Ça ne m’arrive pas souvent.',
        ],
      },
      {
        id: 'guerisseuse_q2', min: 1,
        texte: 'Et vous, qu’est-ce que vous croyez ? Le Bon Dieu du curé, mes Anciens, ou rien du tout ? Répondez sans réfléchir : c’est là qu’on dit vrai.',
        reponses: [
          { label: 'Je crois ce que j’ai vu ici. Et j’en ai vu.', amitie: 25, reaction: 'Voilà une réponse de quelqu’un qui a les yeux ouverts. Gardez-les ouverts, mais pas toutes les nuits : ça use.' },
          { label: 'À rien. Vos herbes, c’est de la chimie.', amitie: -15, reaction: 'De la chimie, oui, aussi. La foudre aussi, c’est de la chimie, et elle tue quand même ; revenez me voir après votre première nuit rouge.' },
          { label: 'Je crois surtout en votre tisane.', amitie: 10, reaction: 'Flatteur. Ma tisane, elle, ne croit en personne : elle fait son travail, et ce n’est pas le pire des credo.' },
        ],
        rappel: [
          'Vous m’aviez dit que vous croyiez ce que vous aviez vu. Alors, depuis, qu’est-ce que vous avez vu ? … Non. Pas ici. Plus tard.',
          'Toujours de la chimie, mes herbes ? J’ai mis votre réponse dans un bocal, sur l’étagère. On verra comment elle se conserve après une nuit rouge.',
          'Vous croyez toujours en ma tisane ? Tant mieux, j’en ai fait une nouvelle. Elle a un goût de pied de chaise, mais elle croit en vous.',
        ],
      },
      {
        id: 'guerisseuse_q3', min: 2,
        texte: 'Si je connaissais le jour de votre mort… voudriez-vous que je vous le dise ?',
        reponses: [
          { label: 'Oui. Pour avoir le temps de dire au revoir.', amitie: 20, reaction: 'Au revoir… Vous avez le cœur bien placé, à gauche, j’espère. Je ne connais pas ce jour-là ; si je l’apprends, je vous le dirai, et nous irons cueillir des mûres avant.' },
          { label: 'Non. Et ne me le dites jamais.', amitie: 5, reaction: 'Sage. Ceux qui savent vivent mal leurs derniers jours, et trop bien les premiers. Je me tairai ; je sais très bien me taire, vous verrez.' },
          { label: 'Seulement si ce n’est pas un jour de marché.', amitie: 10, reaction: 'Vous avez raison : on ne meurt pas un jour de marché, ce serait gâcher les œufs. Je note. Je note tout, vous savez.' },
        ],
        rappel: [
          'Vous vouliez savoir, pour avoir le temps de dire au revoir. Je n’ai rien appris, rassurez-vous. Mais j’ai repéré un buisson de mûres. Au cas où.',
          'Je me suis tue, comme promis. D’ailleurs, je ne sais rien. Enfin… rien de précis.',
          'Pas un jour de marché, j’ai bien noté. J’ai regardé dans le marc de café, pour vous : il n’y avait que du marc.',
        ],
      },
      {
        id: 'guerisseuse_q4', min: 4,
        texte: 'Qu’est-ce que vous donneriez, pour sauver quelqu’un que vous aimez ? Réfléchissez, cette fois : ceux d’en bas posent la même question, et ils prennent la réponse au mot.',
        reponses: [
          { label: 'Tout. Même ce que je n’ai pas le droit de donner.', amitie: 15, reaction: 'Tout… oui. C’est ce que j’aurais répondu, autrefois, et je l’ai fait. N’en parlons plus, voulez-vous ; pas aujourd’hui.' },
          { label: 'Rien qui ne soit à moi. Il y a des marchés à refuser.', amitie: 25, reaction: 'Des marchés à refuser… Si quelqu’un m’avait dit ça, il y a longtemps. Vous êtes plus sage que moi, et ce n’est pas difficile, remarquez.' },
          { label: 'Mon dernier sou. Il ne vaut pas grand-chose.', amitie: 5, reaction: 'Ils n’aiment pas les sous. Ils aiment ce qui fait mal à donner ; gardez votre sou, et fermez votre bourse la nuit, comme votre porte.' },
        ],
        rappel: [
          '« Tout », vous m’avez dit. J’y pense encore. Le jour où vous voudrez tout donner, venez me voir avant ; juste avant.',
          '« Il y a des marchés à refuser. » Je me le répète le soir, en fermant mes volets. À mon âge, on apprend encore ; c’est vous qui me l’avez appris.',
          'Vous avez toujours votre dernier sou ? Gardez-le dans la chaussure gauche, du côté du cœur. On ne sait jamais qui compte.',
        ],
      },
    ],
    humeurs: {
      joyeux: [
        'Les morilles sont sorties cette nuit, toutes ensemble, comme des enfants à la fin de la messe. La forêt est de bonne humeur, et moi aussi.',
        'J’ai dormi sans rêver de personne, pour une fois. À mon âge, c’est un luxe.',
        'Le merle a chanté sur mon toit à l’aube : il ne chante que si quelqu’un de bien va venir. Il se trompe rarement.',
      ],
      triste: [
        'Asseyez-vous et ne dites rien. J’ai cherché un visage, cette nuit, et je ne l’ai pas trouvé.',
        'La rosée avait un goût de sel, ce matin. Quelqu’un pleure, dans la vallée ; peut-être moi.',
        'Aujourd’hui, je suis vieille. Les autres jours, je fais semblant de ne pas l’être.',
      ],
      fatigue: [
        'J’ai veillé une accouchée toute la nuit, au hameau : des jumeaux, et une mère têtue. Parlez doucement, mes oreilles dorment encore.',
        'Mes jambes ont soixante-douze ans, ce matin. D’habitude, elles se croient plus jeunes.',
        'J’ai cueilli jusqu’au lever de la lune : certaines plantes ne s’ouvrent que pour les insomniaques. Me voilà.',
      ],
      inquiet: [
        'La chouette a crié trois fois avant minuit. Rentrez tôt, cette semaine, et ne sortez pas pour voir.',
        'La menthe a noirci sur pied, cette nuit, tout le carré. Quelque chose est passé tout près, et ça ne marchait pas sur ses pieds.',
        'La forêt se tait depuis ce matin, pas un oiseau. Quand elle retient son souffle, je fais comme elle.',
      ],
      agace: [
        'Encore quelqu’un de la ville qui voulait un philtre d’amour. Je ne fais pas de philtres pour les imbéciles, alors si c’est pour ça, repartez.',
        'Les sangliers ont retourné tout mon carré de sauge. Ne me parlez pas de sangliers, ne me parlez de rien.',
        'Le père {npc:cure} m’a encore fait dire de « modérer mes pratiques ». Il viendra chercher sa tisane ce soir, par la porte de derrière, comme d’habitude.',
      ],
    },
    souvenirs: {
      cadeau_adore: [
        '{objet}… Votre présent a sa place sur l’étagère, près de la tresse de ma grand-mère. Elle l’aurait aimé, ma grand-mère ; moi aussi, même si je le dis moins souvent qu’elle.',
        '{objet}. J’y pense encore, le soir, quand le feu baisse. On m’offre rarement des choses ; on m’apporte surtout des maux.',
      ],
      cadeau_deteste: [
        '{objet}. J’ai dû enterrer votre cadeau au pied du houx, pour que la hutte cesse d’en sentir la mauvaise lune. Ne m’en voulez pas.',
        '{objet}, vraiment ? Vous avez du cœur, mais pas de nez. Apprenez à sentir ce qui porte malheur ; ça vous servira ailleurs que chez moi.',
      ],
      aide: [
        'Vous m’avez aidée, et je ne l’oublie pas. Les vieilles femmes ont la mémoire longue et la reconnaissance lente, mais elle vient.',
        'Depuis votre coup de main, la souche ne grince plus quand vous approchez. Elle a décidé que vous étiez de la maison.',
      ],
      toque_nuit: [
        'Vous avez frappé chez moi en pleine nuit. J’ai regardé par la fente du volet et j’ai vu votre visage ; ce n’est pas ce qui m’a rassurée : les visages, ça se prête.',
        'Ne frappez plus jamais chez moi après minuit. Si c’était vous, vous m’avez fait peur ; si ce n’était pas vous, je préfère ne pas savoir qui porte votre voix.',
      ],
      coup: [
        'Vous avez levé la main sur une vieille femme. La forêt l’a vu, et elle est patiente, la forêt.',
        'J’ai mis de l’arnica sur le bleu que vous m’avez fait. L’arnica soigne le bleu ; pour le reste, il n’y a pas d’herbe.',
      ],
      absence: [
        'Ah, c’est vous. J’ai jeté du sel dans le feu pour savoir si vous étiez encore de ce côté-ci ; il a crépité, et j’ai été contente de ne pas m’être trompée.',
        'Longtemps. Les champignons ont eu le temps de pousser et de pourrir deux fois. À mon âge, on compte les absences.',
      ],
      victime: [
        'Quelqu’un est passé de l’autre côté, et pas par la bonne porte. J’ai allumé une chandelle pour lui montrer le chemin ; elle a brûlé bleu toute la nuit.',
        'Ils vont tous regarder vers la forêt, maintenant, vers la sorcière. C’est toujours comme ça. Je fermerai ma porte de derrière quelques jours.',
      ],
    },
    tenue: {
      arme: 'Du fer, sous mon toit ? Laissez ça dehors, contre le mur, pas contre la souche : le fer coupe aussi ce qu’on ne voit pas.',
      pelle: 'Une pelle. Vous allez déterrer des choses ; souvenez-vous que ce qu’on sort de terre, il faut un jour l’y remettre.',
      potion: 'Faites voir… pas mal dosée. La prochaine fois, laissez-la reposer une nuit dans le noir : elle sera plus franche.',
      animal_mort: 'Pauvre bête. Posez-la, que je lui ferme les yeux : un mort qu’on porte les yeux ouverts regarde où on l’emmène, et il s’en souvient.',
      fleurs: 'Des fleurs coupées, pas arrachées : vous apprenez. Mettez-les dans l’eau de pluie, jamais dans l’eau du puits.',
      poisson: 'Il a ses yeux, au moins, ce poisson ? Ceux qui n’en ont pas, apportez-les-moi : je paie bien, et je ne dis pas pour quoi faire.',
      lanterne_jour: 'Une lanterne allumée à midi. Vous avez vu quelque chose, cette nuit, qui vous a fait douter du jour ; asseyez-vous, je mets de l’eau à chauffer.',
      relique: 'Gardez ça, je n’ai plus les mains qu’il faut. Vous tenez un morceau de la paix de la vallée ; il en faut onze, et il faudra tous les garder loin du puits.',
      rien: 'On vient chez la guérisseuse les mains vides quand on a le cœur plein. Qu’est-ce qui ne va pas ?',
    },
    chez_soi: {
      jour: 'Entrez, puisque la porte vous a laissé faire. Elle ne s’ouvre pas pour n’importe qui, c’est donc qu’elle vous connaît. Ne touchez pas aux pots du haut.',
      nuit: 'Je vous attendais. … Non, c’est faux : j’attendais quelqu’un d’autre. Asseyez-vous près du feu, ne regardez pas la fenêtre du fond, et quoi que vous entendiez frapper, ne répondez pas.',
    },
    activites: {
      travail: [
        'Sauge, mélisse, millepertuis… Et toi, là, qui es-tu ? Je ne t’ai pas semée, toi.',
        'Trois gouttes, pas quatre. À quatre, on dort. À cinq, on ne se réveille pas. Trois.',
        'Allons, petite racine, donne ce que tu as. Je te rendrai à la terre, c’est promis.',
      ],
      repas: [
        'Le pain de {npc:boulangere}, un peu dur, et une soupe d’orties. Ma grand-mère a vécu de ça jusqu’à quatre-vingt-dix ans passés.',
        'Une noix pour moi, une noix pour l’écureuil. Non, pas deux, gourmand. Une.',
        'Manger seule, c’est manger vite. Je devrais inviter quelqu’un. Mais les vivants ont peur, et les autres ne mangent pas.',
      ],
      priere: [
        'Mère des Moissons, voici le premier pain de la semaine. Pas le meilleur : le premier. Tu sais que c’est ce qui compte.',
        'Cerf Blanc, garde les chemins de ceux qui viennent chez moi. Même de ceux qui se trompent de chemin. Surtout de ceux-là.',
        'Vieux chêne, je ne te demande rien. Je viens seulement m’asseoir contre toi ; tu sais ce que ça veut dire, à mon âge.',
      ],
      promenade: [
        'Un rond de champignons, ici, depuis cette nuit. Non merci. Je passe à côté.',
        'Tiens, une trace de sabot fendu, fine comme un ongle. Il est passé. Il ne passe plus souvent, ces temps-ci.',
        'Les fougères ont changé de sens. Le sentier aussi, peut-être. Allons, vieille bête, compte tes pas.',
      ],
      soir: [
        'Le sel sur le seuil. La chandelle à la fenêtre. Le couteau sous l’oreiller, lame vers le mur. Voilà, on peut dormir.',
        'Bonsoir, grand-mère. Rien de neuf. Enfin, si : quelqu’un a repris la ferme d’Anselme, et vient me voir. Vous auriez aimé.',
        'La nuit tombe. Tant pis pour ceux qui sont encore dehors, et que la lune leur soit blanche.',
      ],
      pluie: [
        'Pluie d’automne, champignons demain. La forêt a toujours faim de pluie, et moi de champignons.',
        'Le toit goutte au-dessus du grimoire. Il y a des choses qu’on ne doit pas mouiller, et d’autres qu’on ne peut plus sécher.',
        'La pluie tape sur le toit comme des doigts. Je sais compter jusqu’à trois, et je m’arrête toujours avant.',
      ],
    },
    discussions: [
      {
        avec: 'cure',
        lignes: [
          ['cure', 'Bonsoir, madame Morel. Je passais… pour ma tisane. La même que la dernière fois, si vous le voulez bien.'],
          ['guerisseuse', 'Bonsoir, monsieur le curé. Par la porte de derrière, comme toujours. Votre Bon Dieu ne voit donc pas les portes de derrière ?'],
          ['cure', 'Il voit tout, madame. Il a seulement la bonté de ne pas tout dire. … N’auriez-vous pas quelque chose de plus fort ? Je ne dors plus.'],
          ['guerisseuse', 'Je sais. Vous vous réveillez devant l’autel, et la nef est pleine. Ce n’est pas une herbe qu’il vous faut : c’est une serrure à votre chambre, qui ferme du dehors.'],
          ['cure', '… Comment savez-vous cela ? Non, ne me le dites pas. Je prierai pour votre âme, madame Morel.'],
          ['guerisseuse', 'Et moi, je parlerai de vous à mes Anciens ; ils vous trouvent bien maigre, pour un homme de Dieu. Tenez. Trois gouttes, pas une de plus.'],
        ],
      },
      {
        avec: 'boulangere',
        lignes: [
          ['boulangere', 'Doux Jésus, vous êtes descendue jusqu’en ville ? Tenez, je vous ai gardé une miche bien cuite, comme vous les aimez.'],
          ['guerisseuse', 'Merci, ma petite. Ton pain arrive chaque semaine, tiède, par tous les temps. Tu n’oublies jamais.'],
          ['boulangere', 'C’est Émile qui vous l’apportait, avant. Alors je continue. Dites… il n’a toujours pas froid ? Vous me l’aviez fait dire, une fois.'],
          ['guerisseuse', 'Il n’a pas froid. Là où il est, il sent ton four, chaque matin à quatre heures, et il sait que c’est toi.'],
          ['boulangere', 'Comment vous savez ça ? Vous le voyez, vous ?'],
          ['guerisseuse', 'Non. Je le sens, comme on sent le pain chaud à travers le torchon. Et la miche de trop, sur ton étagère… ne la vends jamais.'],
        ],
      },
      {
        avec: 'fillette',
        lignes: [
          ['fillette', 'Bonjour, la dame de la forêt ! Maman sait pas que je te parle. Mais on est sur la place, c’est pas la forêt, alors ça compte pas.'],
          ['guerisseuse', 'Tu as raison, ça ne compte pas. Tu as fini le bonbon au miel ?'],
          ['fillette', 'Oui ! Depuis, Lise est toute nette. Même ses pieds : avant, elle en avait pas. Elle demande si tu viendras la voir. Elle dit que tu lui dois une chanson.'],
          ['guerisseuse', '… Elle a raison. Dis-lui que la vieille Morel n’a pas oublié. Et dis-lui pardon, de ma part.'],
          ['fillette', 'Pardon de quoi ?'],
          ['guerisseuse', 'D’avoir fait dormir quelqu’un, une nuit où il fallait veiller. Et toi, ma puce, la nuit, fais semblant de dormir si tu veux, mais ne suis personne. Personne, tu m’entends ?'],
        ],
      },
    ],
    foi_lignes: [
      'La Vieille Foi n’a pas d’église, pas de cloche, pas de quête. Elle a des pierres, des arbres, de l’eau, et une vieille femme qui se souvient des mots ; après moi, elle n’aura plus que les pierres.',
      'Le Bon Dieu du curé et mes Anciens ne se disputent pas. Ce sont les hommes qui se disputent pour eux, comme des enfants pour des parents qui s’entendent très bien.',
      'On ne prie pas les Anciens pour obtenir, on les prie pour rendre. Ceux qui prient pour obtenir finissent toujours par trouver quelqu’un qui exauce, et ce n’est jamais le bon.',
      'Ceux d’en bas… Je ne dis pas leur nom, même seule, même dans ma tête. Ils ont l’oreille fine et la mémoire longue.',
    ],
    reaction_piete: {
      eglise: 'Vous sentez l’encens et la cire. Le père {npc:cure} a trouvé une âme à son goût, tant mieux : priez aussi pour lui, il en a plus besoin que vous.',
      anciens: 'Les Anciens vous connaissent, maintenant. Cette nuit, il y avait une trace de sabot fendu devant ma porte, tournée vers votre ferme ; ma grand-mère en aurait pleuré.',
      dessous: 'Je connais cette odeur : terre froide, fer mouillé, cave fermée depuis cent ans. Je l’ai portée, moi aussi, une fois. Qu’est-ce qu’ils vous ont demandé ? … Non, ne me le dites pas, ne le dites à personne. Et n’y retournez jamais.',
    },
    fete_lignes: [
      'C’est ma fête, le dernier jour du mois, quand la lune hésite. Ma grand-mère disait que ceux qui naissent ce jour-là hésitent toute leur vie ; j’hésite encore.',
      'À mon âge, on ne fête plus les années : on les compte, comme les sous au fond de la bourse. Asseyez-vous, j’ai fait une tarte aux mûres. Elle est ratée, c’est la tradition.',
    ],
    secret: 'Chaque nuit de Noël, je descends à la messe de minuit. Je me mets au fond, derrière le dernier pilier, sous ma capuche, et je repars avant la bénédiction : pas pour le latin, {prenom}, pour entendre toute la ville chanter ensemble, une fois l’an. Le père {npc:cure} ne m’a jamais vue. Ou il fait semblant, et alors c’est un meilleur homme que je ne le dis.',
  },
});
