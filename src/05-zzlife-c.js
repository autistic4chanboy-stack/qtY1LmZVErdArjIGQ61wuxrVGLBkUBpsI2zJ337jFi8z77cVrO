// Vie des habitants : la grainetière, l’aubergiste, la postière
Object.assign(NPC_LIFE, {
  // --------------------------------------------------------------------------
  grainetiere: {
    foi: 'anciens', devotion: 2, fete: 9,
    mythes: ['mere_des_moissons', 'chene_des_ancetres'],
    mythe_intro: [
      'Asseyez-vous sur ce sac de lentilles, il en a vu d’autres. Ma grand-mère me la racontait en écossant les haricots ; je vous la donne pareille, sans sucre et sans fioritures.',
      'Je ne vous demande pas d’y croire, je vous demande d’écouter : c’est gratuit, et ça ne vous empêchera pas de semer.',
    ],
    histoire: [
      { titre: 'Née dans les graines', min: 0, texte: 'Je suis née au-dessus de la boutique, l’hiver cinquante-deux, entre les sacs de lentilles et le trébuchet de cuivre de mon grand-père Honoré. J’ai appris à compter avec des pois chiches, et à lire sur les étiquettes des tiroirs : « Chou de Milan », « Carotte de Crécy », « Betterave champêtre ». À six ans, je reconnaissais l’orge du seigle dans le noir, rien qu’au toucher. Mon grand-père disait que j’avais des mains de semeuse ; mon père, que j’avais surtout une tête de mule. Ils avaient raison tous les deux, pour une fois.' },
      { titre: 'Le comptoir', min: 0, texte: 'Mon père voulait un fils pour tenir le comptoir. Il n’a eu que moi, et il a fait avec pendant trente ans, en soupirant à chaque pesée. Quand il est mort, en quatre-vingt-deux, j’ai repeint l’enseigne moi-même et j’ai laissé « Grenier » en grosses lettres, sans prénom : qu’on vienne pour les graines, pas pour la vendeuse. Je connais chaque champ de la vallée rien qu’à ce que son maître m’achète ; je sais qui sème trop serré, qui ne paie pas, et qui ment sur ses récoltes. Une graineterie, c’est un confessionnal avec des tiroirs.' },
      { titre: 'Quarante citrouilles', min: 1, texte: 'À la communale, Anselme était assis derrière moi, et il glissait des grains de blé dans ma natte ; le maître le mettait au coin, il recommençait le lendemain. Après mon non, il n’a plus jamais reparlé de mariage. Il a fait pire : chaque automne, pendant quarante ans, une citrouille sur mon seuil, sans un mot, sans une carte. Je les ai toutes mangées, et j’ai ressemé chaque graine : le potager derrière la boutique n’est plein que de ses citrouilles. Cet automne, il n’y aura rien sur mon seuil. Je le sais déjà, et je me lèverai quand même pour aller voir.' },
      { titre: 'Trois francs quarante', min: 2, texte: 'Le soir où il est parti, je lui ai vendu une corde de chanvre et une lanterne, et je les ai marquées sur son ardoise, comme d’habitude : trois francs quarante. Je n’ai pas demandé pourquoi une corde. J’ai pensé à la monnaie. L’ardoise est toujours accrochée derrière le comptoir, son nom en haut, la dette en bas ; tous les soirs je prends le chiffon, et tous les soirs je le repose. Tant qu’il me doit quelque chose, il faut bien qu’il revienne.' },
      { titre: 'La voix derrière la porte', min: 3, texte: 'La troisième nuit après son départ, on a frappé chez moi : trois coups bien espacés, comme lui quand il venait payer en retard. Puis sa voix, à travers le bois : « {nom}, ouvre, je te dois de l’argent. » Je suis restée assise sur l’escalier jusqu’à l’aube, la main sur la bouche, pour ne pas répondre. Au matin, il y avait des pièces sur le seuil, noires de terre ; je les ai rendues à la terre, au fond du potager, sans les compter. Je ne sais pas ce qui me fait le plus peur : qu’il revienne, ou que la prochaine fois, j’ouvre.' },
      { titre: 'Un soir de juin', min: 4, texte: 'Un soir de juin, Anselme est venu jusqu’à la boutique, le chapeau à la main, ce qu’il ne faisait jamais, et il m’a dit : « Viens voir mon épouvantail, s’il te plaît, viens juste le regarder. » Je lui ai ri au nez : je lui ai dit qu’à son âge, on ne fait plus peur aux filles avec des histoires de chiffons, et que j’avais ma caisse à faire. Il a remis son chapeau et il est reparti seul par la grand-route, sans se retourner. J’ai fait ma caisse ; elle était juste, au centime près. C’est la seule chose juste que j’ai faite, ce soir-là.' },
      { titre: 'Ce qui lève', min: 6, texte: 'Le premier matin où j’ai vu de la fumée monter de la vieille ferme, j’ai dû m’asseoir sur un sac. Je croyais que plus personne ne tirerait rien de cette terre ; elle vous écoute, vous, je l’ai vu à vos carottes. J’ai remis des graines de côté dans le tiroir du bas, les meilleures, et je ne les vends à personne. La nuit de la Saint-Jean, j’ai dormi sous {lieu:chene}, comme on faisait jeunes, et les morts m’ont montré un champ fauché au soleil, avec quelqu’un dedans qui sifflait faux. Je n’ai pas vu son visage. Mais depuis que je vous entends siffler faux sur la grand-route, je dors mieux.' },
      { titre: 'Neuf mars', min: 8, texte: 'Je vous ai dit qu’Anselme n’avait pas de famille ; sur les papiers du notaire, c’est vrai. L’été de mes dix-huit ans, avant qu’il parte à la guerre, nous nous sommes aimés dans les foins, et j’ai caché mon ventre tout l’hiver dans l’arrière-boutique. Le petit est né la nuit du 9 mars 1871, sous une lune rouge ; au matin, on refaisait le recensement, et mon père a dit qu’un enfant né cette nuit-là serait compté « en surnombre ». Il l’a donné à des charbonniers qui descendaient vers la plaine, et je ne l’ai tenu qu’une nuit. Anselme est rentré en avril ; je ne lui ai jamais rien dit, pas une fois en quarante citrouilles. Alors ne me demandez plus pourquoi je regarde vos mains quand vous payez, {prenom} : j’y cherche les siennes.' },
    ],
    questions: [
      {
        id: 'grainetiere_q1', min: 0,
        texte: 'Question de grainetière, et répondez franchement : qu’est-ce que vous allez semer en premier, sur la terre d’Anselme ?',
        reponses: [
          { label: 'Des citrouilles. On m’a dit qu’il les aimait.', amitie: 25, reaction: 'Qui vous a dit ça ? … Prenez les graines du tiroir du bas, ce sont les meilleures. Et ne me regardez pas comme ça, j’ai de la poussière dans l’œil.' },
          { label: 'Ce qui rapporte le plus. Je ne fais pas de sentiment.', amitie: -5, reaction: 'Franc. J’aime les gens francs. Mais la terre fait du sentiment, elle, que vous le vouliez ou non : elle se souvient de qui la compte et de qui la soigne.' },
          { label: 'Des cailloux. Il paraît qu’ils poussent tout seuls.', amitie: 10, reaction: 'Ha ! Chez Anselme, ils poussaient mieux que le blé : il en sortait trois tombereaux chaque hiver, et le gel en remontait autant. Vous avez de l’humour, tant mieux, il vous en faudra.' },
        ],
        rappel: [
          'Alors, ces citrouilles ? Je passe devant chez vous en allant au cimetière. Je regarde, je ne dis rien, mais je regarde.',
          'Toujours rien que ce qui rapporte ? Vous me direz combien vous rapporte un champ qui vous en veut.',
          'J’ai vu un beau caillou sur votre chemin, ce matin. Je vous l’ai laissé : il avait l’air de bien pousser.',
        ],
      },
      {
        id: 'grainetiere_q2', min: 1,
        texte: 'Au bout de votre champ du bas, il y a une pierre plate avec un creux au milieu. Vous y laissez quelque chose, de temps en temps ?',
        reponses: [
          { label: 'Oui, les premiers fruits. Je ne veux fâcher personne.', amitie: 25, reaction: 'Bien. La Mère a de la mémoire, et moi aussi. Anselme y posait sa première carotte chaque année en ronchonnant que c’étaient des bêtises, et il n’a jamais oublié une seule fois.' },
          { label: 'Non. Je ne donne pas ma récolte à une pierre.', amitie: -15, reaction: 'Alors ne venez pas pleurer dans ma boutique le jour où vos choux tourneront au noir. Je vous préviens, c’est tout : après, chacun sème comme il veut.' },
          { label: 'Une pierre ? Je croyais que c’était un banc.', amitie: 5, reaction: 'Un banc ! Si vous y avez posé votre derrière, excusez-vous en repassant. Je plaisante à moitié : posez-y une carotte, ça ne vous coûtera qu’une carotte.' },
        ],
        rappel: [
          'Il y avait une pomme sur la pierre, au bout de votre champ, ce matin. Ne dites rien. Ça m’a fait plaisir pour deux.',
          'Vos choux ont bonne mine, pour des choux qui ne remercient personne. Profitez-en tant que ça dure.',
          'Alors, votre banc ? Toujours aussi confortable ? Moi, je ne m’y assiérais pas, mais je ne suis pas vous.',
        ],
      },
      {
        id: 'grainetiere_q3', min: 2,
        texte: 'Dites-moi une chose. Si on vous demandait en mariage demain, là, devant ma boutique, qu’est-ce que vous répondriez ?',
        reponses: [
          { label: 'Oui, si c’est la bonne personne. On ne vit qu’une fois.', amitie: 20, reaction: 'Ne dites jamais non par orgueil. C’est tout ce que j’ai à vous apprendre, et c’est ce que je sais le mieux. Pour le reste, achetez mes graines.' },
          { label: 'Non. Je n’ai besoin de personne.', amitie: 5, reaction: 'C’est ce que je disais aussi. Je le disais très bien, même, le menton levé. Il n’y a que la nuit que ça sonne un peu faux.' },
          { label: 'Ça dépend. Combien d’arpents ?', amitie: 10, reaction: 'Ha ! Vous parlez comme mon père. Il m’aurait mariée à un champ de betteraves, s’il avait trouvé un curé pour bénir la noce.' },
        ],
        rappel: [
          'Vous dites toujours oui à la bonne personne ? Tant mieux. Gardez ce oui au chaud, ça ne se ressème pas.',
          'Toujours besoin de personne ? Moi non plus. On fait la paire, vous et moi, avec nos mentons levés.',
          'J’ai repensé à vos arpents. Je vous ai trouvé un parti : six hectares, un bon puits et un sale caractère. Non ? Tant pis.',
        ],
      },
      {
        id: 'grainetiere_q4', min: 4,
        texte: 'Je vais vous poser la question que je me pose toutes les nuits. Vous savez, vous, pourquoi la ferme d’Anselme vous est revenue ?',
        reponses: [
          { label: 'Non. Je me le demande aussi, chaque nuit.', amitie: 20, reaction: 'Alors on est deux à ne pas dormir. Un de ces soirs, on se le demandera ensemble devant un bol de soupe : ça fera moins de bruit dans la tête.' },
          { label: 'Oui. Mais ça ne regarde que moi.', amitie: -10, reaction: 'Hm. Chacun ses tiroirs fermés, j’en ai un moi aussi. Mais ne me mentez jamais : c’est la seule chose que je ne pardonne pas.' },
          { label: 'J’ai dû gagner à la loterie des ennuis.', amitie: 8, reaction: 'Le gros lot, même : une ferme qui grince, un épouvantail qui tourne, et une vieille grainetière qui vous surveille du coin de l’œil. Profitez-en bien.' },
        ],
        rappel: [
          'Je me suis encore réveillée cette nuit avec votre question. Enfin, la mienne. La nôtre, maintenant.',
          'Votre tiroir fermé, vous l’avez toujours ? Gardez-le. Mais le jour où il déborde, ma boutique est au coin de la place.',
          'Alors, ce gros lot ? L’épouvantail tourne toujours ? La vieille grainetière, elle, vous surveille toujours.',
        ],
      },
    ],
    humeurs: {
      joyeux: [
        'Belle journée ! J’ai vendu mes dernières graines de tournesol avant dix heures, et pas une au maire.',
        'Regardez-moi ce ciel. Même moi, je n’y trouve rien à redire, et Dieu sait que je cherche.',
        'Ah, {fermier} ! J’ai le cœur léger ce matin, ne me demandez pas pourquoi : ça s’envolerait.',
      ],
      triste: [
        'Pardon, j’ai la tête ailleurs. Au cimetière, pour tout dire.',
        'J’ai retrouvé une étiquette de la main d’Anselme au fond d’un tiroir : « Citrouille, pour {nom} ». Ça m’a coupé les jambes.',
        'Il y a des jours où les graines ne veulent plus rien dire. Aujourd’hui en est un.',
      ],
      fatigue: [
        'J’ai porté des sacs toute la matinée. Mon dos a cinquante-huit ans, lui aussi, et il tient à me le rappeler.',
        'Je n’ai pas fermé l’œil : le vent faisait battre la grille du potager. Enfin, j’espère que c’était le vent.',
        'Parlez doucement, voulez-vous. Mes oreilles sont restées couchées.',
      ],
      inquiet: [
        'Vous avez vu l’épouvantail de la grand-route, ce matin ? … Non, rien, je radote.',
        'Mes semis ont levé de travers cette nuit, tous penchés vers le nord. Je n’aime pas ça du tout.',
        'Rentrez tôt, ce soir. Je ne sais pas pourquoi je vous dis ça ; si, je le sais, et c’est bien ce qui m’inquiète.',
      ],
      agace: [
        '{npc:maire} veut encore ses douze sacs de tournesol pour hier. Ne me parlez pas du maire.',
        '{npc:eleveuse} a encore tout mis sur son ardoise. Son ardoise fait la taille d’une porte de grange, maintenant.',
        'Les pigeons de la place m’ont vidé un sac de chènevis. Des rats avec des ailes, voilà ce que c’est.',
      ],
    },
    souvenirs: {
      cadeau_adore: [
        'J’ai noté votre cadeau dans le cahier de la boutique : « {objet}, don de {prenom} ». C’est la première ligne de ce cahier qui ne soit pas une dette.',
        'Je repense encore à « {objet} ». Personne ne m’avait fait un cadeau pareil depuis… enfin, depuis un certain automne.',
      ],
      cadeau_deteste: [
        'Votre cadeau de l’autre jour, « {objet} »… J’ai fait bonne figure. Je fais bonne figure depuis cinquante ans, j’ai l’habitude.',
        '« {objet} » a fini dans la marmite de {npc:aubergiste}. Il met n’importe quoi dans ses ragoûts, personne n’a rien remarqué.',
      ],
      aide: [
        'Vous m’avez rendu service sans rien demander. Anselme faisait comme ça, et ça m’agaçait déjà chez lui.',
        'Je n’oublie pas votre coup de main de l’autre jour. Je n’oublie jamais rien, d’ailleurs : demandez à mes débiteurs.',
      ],
      toque_nuit: [
        'C’était vous, l’autre nuit, qui frappiez chez moi ? Je n’ai pas ouvert. Je n’ouvre à aucune voix, la nuit, même pas à la vôtre. Surtout pas à la vôtre.',
        'Ne frappez plus jamais chez moi après le coucher du soleil. J’ai passé la nuit assise sur l’escalier, et à mon âge, c’est l’escalier qui gagne.',
      ],
      coup: [
        'Vous avez levé la main sur moi. J’ai vu des orages coucher le blé, je sais me relever. Mais je sais aussi me souvenir.',
        'J’ai encore le bleu. Je raconte que je me suis cognée à un sac de lentilles : c’est la première fois de ma vie que je mens pour quelqu’un qui ne le mérite pas.',
      ],
      absence: [
        'Tiens, une apparition ! J’ai failli vendre vos graines à quelqu’un d’autre.',
        'Ça fait des jours ! J’ai cru que la vallée vous avait pris, comme les autres. Ne me faites plus ça, je n’ai plus l’âge.',
      ],
      victime: [
        'Encore quelqu’un. Je l’ai appris en ouvrant mes volets, par {npc:postiere}, évidemment. J’ai passé la matinée à trier des graines déjà triées.',
        'On dit que certains ne méritent pas la vallée. Personne ne mérite ça. Même pas ceux que je n’aimais pas.',
      ],
    },
    tenue: {
      arme: 'Posez votre arsenal près de la porte, s’il vous plaît : même Anselme laissait sa faux dehors.',
      pelle: 'Une pelle ! Enfin quelqu’un qui sait que la terre se retourne. Mais ne creusez pas n’importe où, surtout pas sous {lieu:chene}.',
      potion: 'Qu’est-ce que c’est que cette fiole ? Si c’est une drogue de la forêt, je ne veux pas savoir ; si c’est pour les semis, je veux tout savoir.',
      animal_mort: 'Posez-moi ça dehors, vous allez tacher mes sachets. Et remerciez la bête, au moins : les Anciens y tenaient.',
      fleurs: 'Des fleurs coupées ? C’est joli, mais c’est déjà mort : c’est bon pour le cimetière. Aux vivants, moi, j’offre des graines.',
      poisson: 'Ça sent le lac jusqu’ici. Tant que ce n’est pas un silure, vous pouvez entrer.',
      lanterne_jour: 'Une lanterne allumée en plein midi ? Anselme aussi, les derniers temps. Éteignez-la, je vous en prie.',
      relique: 'Ne posez pas ça sur mon comptoir. Ces choses-là appartiennent aux Anciens, et les Anciens savent compter leurs affaires.',
      rien: 'Les mains vides ? Parfait, vous allez pouvoir me porter un sac.',
    },
    chez_soi: {
      jour: 'La boutique, c’est devant. Ici, c’est ma cuisine, et dans ma cuisine, on entre quand on y est prié. Ressortez et frappez, je vous dirai peut-être oui.',
      nuit: 'Qui… C’est vous ? Vous entrez chez une femme seule, en pleine nuit, sans frapper ? La faux est derrière la porte, je vous préviens. Dites quelque chose. Avec votre voix. Votre vraie voix.',
    },
    activites: {
      travail: [
        'Chou de Milan, trois onces… non, quatre. Qui m’a encore dérangé ces tiroirs ?',
        'Trente-deux sacs de blé, deux de mouillés. Mon grand-père aurait hurlé ; moi, je soupire, c’est plus moderne.',
        'Faucille aiguisée, faux graissée. Le chiendent n’a qu’à bien se tenir.',
      ],
      repas: [
        'Soupe aux choux, pain et un bout de lard. Anselme disait que je mangeais comme un moineau, pour une femme qui vend des graines.',
        'Une pomme de terre sous la cendre, et du gros sel. Les meilleurs repas ne coûtent rien.',
        'Tiens, la tarte de {npc:boulangere} est encore tiède. Elle me gâte. Je ne le lui dirai jamais.',
      ],
      priere: [
        'Mère des Moissons, voilà la première carotte. Elle est tordue, mais c’est la première : ne fais pas la difficile.',
        'Je ne te demande pas de pluie. Je te demande qu’il ne pleuve pas de travers. Tu sais ce que je veux dire.',
        'Vous, ceux d’en bas, je ne vous parle pas. Je ne vous ai jamais parlé. Restez où vous êtes.',
      ],
      promenade: [
        'Du chiendent jusque sur le chemin. La terre gagne toujours, à la fin ; elle a le temps, elle.',
        'Ce vieux chêne a vu passer mon grand-père, mon père, et moi. Il me verra passer encore un moment, s’il veut bien.',
        'Encore un corbeau sur {lieu:calvaire}. Qu’est-ce qu’ils attendent, ceux-là ?',
      ],
      soir: [
        'Cinq heures. Le cimetière, les fleurs, et à la maison. Comme hier. Comme demain.',
        'Le volet, le loquet. Je revérifie le loquet. Voilà, je suis devenue Anselme.',
        'Bonne nuit, les graines. Ne germez pas sans moi.',
      ],
      pluie: [
        'Voilà qui fera lever mes semis. Et mes rhumatismes.',
        'Il pleut sur le blé et sur les morts. Les deux en ont besoin, disait ma mère.',
        'Mon sac de pois est trempé : trois francs de pois qui vont germer dans la toile. Tant pis, je les sèmerai dans mes souliers.',
      ],
    },
    discussions: [
      {
        avec: 'boulangere',
        lignes: [
          ['grainetiere', 'Tu as une tête à avoir pétri toute la nuit, toi.'],
          ['boulangere', 'Doux Jésus, ça se voit tant que ça ? J’ai encore trouvé une miche de trop sur l’étagère, ce matin.'],
          ['grainetiere', 'Et tu l’as encore gardée pour Émile, je parie.'],
          ['boulangere', 'Qu’est-ce que tu veux que j’en fasse ? La vendre ? Tu la mangerais, toi, une miche que personne n’a pétrie ?'],
          ['grainetiere', 'Moi, je la poserais sur {lieu:pierre_offrandes}. Ce qui vient de nulle part retourne à la terre, c’est la règle.'],
          ['boulangere', 'Tu vois, c’est pour ça que je t’aime bien : tu dis des choses à faire dresser les cheveux sur la tête avec la voix de l’almanach.'],
        ],
      },
      {
        avec: 'eleveuse',
        lignes: [
          ['eleveuse', 'Deux sacs d’avoine. Sur l’ardoise.'],
          ['grainetiere', 'Ton ardoise, ma fille, elle déborde sur le mur. Bientôt, je l’écrirai sur la porte de ta grange.'],
          ['eleveuse', 'Tu seras payée à la foire, comme chaque année. Dis, tu as vendu un épouvantail, ces temps-ci ? Il y en a un tout neuf au bord de mon pré. Je ne l’ai pas planté.'],
          ['grainetiere', 'Je n’en ai vendu aucun depuis la Saint-Jean. Tourne-le face au chemin, et ne le regarde pas quand tu passes devant.'],
          ['eleveuse', 'Et si je le retrouve tourné vers la maison, le matin ?'],
          ['grainetiere', 'Alors tu viens me chercher, et on le brûle ensemble. Deux sacs, sur l’ardoise. File.'],
        ],
      },
      {
        avec: 'cure',
        lignes: [
          ['cure', 'Les Rogations sont dans trois jours, mademoiselle Grenier. Je bénirai les champs. Me ferez-vous l’honneur, cette année ?'],
          ['grainetiere', 'Je viendrai, mon père, si vous bénissez aussi la pierre plate, au bout du champ de la vieille ferme.'],
          ['cure', 'Une pierre païenne ? Où l’on dépose du lait et du miel pour… Dieu sait quoi ?'],
          ['grainetiere', 'Justement, lui, il sait. Et puis vous bénissez bien la cloche, qui sonne toute seule la nuit.'],
          ['cure', 'Mea culpa… Vous avez la langue plus affûtée que votre faucille, mon enfant.'],
          ['grainetiere', 'Passez prendre des graines de poireau pour le jardin du presbytère. Pour rien. Ça, c’est une bénédiction qui pousse.'],
        ],
      },
    ],
    foi_lignes: [
      'À l’église, on prie pour le pain. Moi, je prie la terre qui le donne : ça fait moins de détour.',
      'Le curé est un brave homme. Il croit que c’est le bon Dieu qui fait lever le blé ; le bon Dieu a d’autres soucis, le blé, c’est la Mère qui s’en occupe.',
      'Ceux d’en bas, on ne les nomme pas, on ne les nourrit pas, on ne leur répond pas. Ils donnent tout de suite, et ils se paient sur la récolte d’après. Et sur celle d’après encore.',
      'Ma grand-mère tressait la dernière gerbe en poupée et l’accrochait au-dessus de la porte. Il y en a une au-dessus de la mienne. Vous ne l’aviez pas vue ? Elle, elle vous a vu.',
    ],
    reaction_piete: {
      eglise: 'On vous voit plus souvent à l’église qu’au potager, ces temps-ci. Priez, priez. Mais arrosez aussi : le bon Dieu ne porte pas d’arrosoir.',
      anciens: 'Vous sentez le lait, le miel et le blé coupé, comme ceux d’avant. La pierre aux offrandes n’avait pas été honorée comme ça depuis Anselme. Ne dites rien : je suis contente, c’est tout.',
      dessous: 'Vos champs lèvent trop vite. Trop beaux, trop tôt, sans une mauvaise herbe… Qu’est-ce que vous leur avez donné, à ceux d’en bas ? Ne me répondez pas. Et ne me touchez pas.',
    },
    fete_lignes: [
      'C’est ma fête, aujourd’hui. Pas de cadeau, pas de chanson. … Bon, une citrouille, à la rigueur.',
      '{npc:boulangere} m’a fait une tarte aux pommes, comme chaque année depuis qu’elle sait tenir un rouleau. Anselme, lui, faisait semblant d’oublier, et passait trois fois devant la boutique.',
    ],
    secret: 'Tous les soirs, à cinq heures, je vais au cimetière. Pas sur la tombe de mes parents : au fond, sous le lierre, il y a une vieille pierre au nom d’Anselme, qui a l’air d’avoir cent ans de plus que lui. J’y mets des fleurs, et je lui raconte la journée ; je lui parle de vous, aussi. Quelqu’un d’autre y dépose deux pains, et je fais semblant de ne pas savoir qui.',
  },
  // --------------------------------------------------------------------------
  aubergiste: {
    foi: 'aucune', devotion: 0, fete: 19,
    mythes: ['chasse_volante', 'feux_follets', 'tresor_valmont'],
    mythe_intro: [
      'Approchez votre chaise, baissez la lampe, et que personne ne tousse. Une histoire, ça se sert comme une soupe : bien chaude, et jusqu’à la dernière cuillère.',
      'Je n’en crois pas un mot, notez bien, mais je la raconte mieux que ceux qui y croient. L’oncle Anatole me l’a apprise, et il est mort au milieu d’une autre : alors celle-ci, je vous la finis, parole de Bonnefoy.',
    ],
    histoire: [
      { titre: 'La marmite du fond', min: 0, texte: 'Je suis né dans la cuisine de l’auberge, entre la marmite et le four à pain, un soir de foire où il ne restait plus une chambre. Ma mère disait que j’avais crié moins fort que les clients. À huit ans, je portais six chopes d’une main et je goûtais toutes les sauces de l’autre, ce qui explique la suite. La marmite du fond n’a jamais refroidi depuis mon arrière-grand-père : on y rajoute, on ne la vide jamais. Quand on me demande de quel jour est le ragoût, je réponds : du jour où la maison a ouvert !' },
      { titre: 'Le Coq Tordu', min: 0, texte: 'L’auberge s’appelle le Coq Tordu à cause du coq du clocher, que la foudre a plié en deux l’été quarante-trois : mon arrière-grand-père a trouvé que c’était un beau nom pour une maison où l’on penche un peu. Je me lève à cinq heures, je rallume le feu, je prends le pain chez {npc:boulangere}, je pèle, je goûte, je sers, je regoûte. J’ai huit chambres et presque jamais de voyageurs : personne ne passe par ici, et ceux qui passent ne vont jamais bien loin. Alors je fais auberge pour les gens de la vallée : le curé qui goûte, le forgeron qui doit, le garde qui mange en surveillant la porte. Un aubergiste, ce n’est pas un marchand de vin, c’est un marchand de soirées.' },
      { titre: 'La chambre sept', min: 1, texte: 'Au printemps soixante-dix-neuf, une colporteuse est arrivée par le pont sud avec sa balle de rubans et d’aiguilles, et elle a pris la sept pour trois nuits. Elle s’appelait Hortense, elle riait plus fort que moi, et elle est restée trois semaines. On devait se marier à la Saint-Jean ; un matin de brouillard, elle est partie chercher sa mère dans la plaine, pour la noce. On dit que personne ne quitte la vallée plus d’une semaine, que tout le monde finit par revenir. Elle, non. Voilà pourquoi je ne loue jamais la sept : elle a peut-être encore la clé.' },
      { titre: 'La fin de l’histoire', min: 2, texte: 'Mes parents sont partis de la typhoïde l’hiver soixante-six, à trois jours l’un de l’autre, et l’oncle Anatole m’a pris derrière son comptoir sans poser de questions. C’est lui qui m’a tout appris : la sauce au vin, le coup de torchon, et surtout les histoires, il en savait une par tonneau. Un soir de novembre quatre-vingt-neuf, il racontait la Chasse volante à une salle pleine ; il a levé sa pipe, il a dit « et c’est alors que le cor a sonné… », et il est tombé le nez dans sa soupe. Personne n’a jamais su la fin, ce soir-là. Depuis, je finis toujours mes histoires, même quand la salle est vide et que je les raconte aux chaises.' },
      { titre: 'Trois coups en hiver', min: 3, texte: 'L’hiver quatre-vingt-quinze, par une nuit de gel à fendre les pierres, on a frappé à la porte de l’auberge : trois coups. C’était le rémouleur qui passait chaque année aiguiser mes couteaux ; j’ai reconnu le grincement de sa meule, et il a crié : « Bonnefoy, ouvre, je gèle ! » L’arrêté dit qu’on ne répond pas à qui frappe après minuit, et surtout, j’avais peur ; alors je suis resté derrière la porte, la louche à la main, à compter mes tonneaux à voix haute. Au matin, il était assis contre le seuil, blanc de givre, le poing encore levé. Depuis, les nuits de gel, je laisse une soupe chaude sur le rebord de la fenêtre, et je ne sais toujours pas pour qui.' },
      { titre: 'La raclée', min: 4, texte: 'À douze ans, j’ai chipé la pipe de l’oncle pour faire l’homme, et j’ai mis le feu à la remise du presbytère. {npc:pecheur} m’a aidé à éteindre avec son seau à écrevisses ; quand le curé de ce temps-là est arrivé, c’est lui qui avait les mains noires. Il a pris la raclée de sa vie devant tout le village, et il ne m’a jamais dénoncé, pas même d’un regard. Moi, je n’ai rien dit : je me suis caché derrière le comptoir et j’ai mangé une deuxième part de gâteau. Voilà l’ami que j’ai. Et voilà l’ami qu’il a.' },
      { titre: 'Une noce', min: 6, texte: 'Mon rêve, je ne l’ai jamais dit à personne, parce qu’il est bête : une noce. Une vraie, dans ma grande salle, avec des vivants qui mangent trop, qui respirent fort, qui montent sur les tables pour chanter et qui cassent mes chopes. Depuis votre arrivée, il y a de nouveau du monde le soir ; on rit, et la salle sent le tabac frais, pas seulement celui de l’oncle. J’ai recommencé à inventer des plats, j’ai même ressorti la nappe de ma mère. Si un jour vous vous mariez, c’est moi qui fais le repas, et je ne compterai pas les truffes.' },
      { titre: 'Chiche', min: 8, texte: 'Le soir de l’orage, il y a dix ans, Jules est entré trempé à l’auberge en jurant qu’il avait vu des fenêtres allumées sous le lac. Toute la salle a ri, et moi le premier, le plus fort, comme toujours. J’ai tapé sur le comptoir : « Chiche que tu n’y retournes pas ce soir : rapporte-moi une tuile du clocher, et je te paie un tonneau ! » Il a vidé son verre, il m’a regardé comme on regarde un ami, et il est sorti sous la pluie. On a retrouvé la barque, pas lui. {npc:pecheur} croit que son frère est parti tout seul, et depuis dix ans, chaque dimanche, je lui sers sa soupe sans oser le regarder dans les yeux.' },
    ],
    questions: [
      {
        id: 'aubergiste_q1', min: 0,
        texte: 'Question sérieuse, {fermier}, la plus sérieuse de toutes, et je vous regarde dans les yeux : qu’est-ce que vous aimez manger, vous ?',
        reponses: [
          { label: 'Un bon ragoût qui a mijoté depuis l’aube.', amitie: 20, reaction: 'Ha ! Voilà quelqu’un de goût ! Vous aurez toujours une louche de plus chez moi, parole de Bonnefoy, et deux si le maire ne regarde pas.' },
          { label: 'Je mange pour tenir debout, c’est tout.', amitie: -10, reaction: 'Pour tenir debout ? Misère, même un cheval de labour mange avec plus de joie que ça ! Asseyez-vous, on va reprendre votre éducation depuis le début.' },
          { label: 'Tout ce qu’on ne m’a pas encore servi ici.', amitie: 8, reaction: 'Oh ! Touché, en plein dans la marmite. Revenez demain soir : je vous invente quelque chose, et si c’est raté, on dira que c’est une spécialité.' },
        ],
        rappel: [
          'Le ragoût mijote depuis l’aube, rien que pour vous. Enfin, pour vous et pour le garde, mais surtout pour vous.',
          'Alors, on mange toujours pour tenir debout ? Aujourd’hui, vous mangerez pour le plaisir, et c’est un ordre.',
          'J’ai inventé un plat pour vous, comme promis. Personne n’a su dire ce que c’était, moi non plus. Vous goûtez ?',
        ],
      },
      {
        id: 'aubergiste_q2', min: 1,
        texte: 'Entre nous, et sans rire, pour une fois : vous croyez aux revenants, vous ?',
        reponses: [
          { label: 'Oui. J’en ai vu depuis mon arrivée.', amitie: 12, reaction: 'Ha, ha… bon. Ne le dites pas trop fort : la sept a l’oreille fine, et moi aussi, maintenant.' },
          { label: 'Non. Ce sont des histoires pour faire boire.', amitie: -5, reaction: 'Pour faire boire ? Vous parlez comme le maire. Je les raconte pour que les gens restent ensemble le soir, au lieu de rentrer seuls dans le noir, et ce n’est pas pareil.' },
          { label: 'Je crois surtout aux ivrognes qui en voient.', amitie: 10, reaction: 'Ha ! Ceux-là, j’en fabrique tous les soirs ! Mais l’oncle Anatole n’a pas bu une goutte depuis qu’il est mort, et il fume encore.' },
        ],
        rappel: [
          'Vous en avez revu, des revenants ? Racontez-moi. Non, ne me racontez pas. Si, racontez.',
          'Hier soir, j’ai raconté la Chasse volante, et personne n’a voulu rentrer seul. Des histoires pour faire boire, hein ?',
          'Un ivrogne a vu l’oncle Anatole dans la cave, hier. Je lui ai dit que c’était le vin. Il m’a répondu qu’il n’avait bu que du lait.',
        ],
      },
      {
        id: 'aubergiste_q3', min: 2,
        texte: 'Dites, vous, quand vous étiez enfant, vous aviez un meilleur ami ? Un vrai, de ceux qui prennent les raclées à votre place ?',
        reponses: [
          { label: 'Oui. Je donnerais tout pour le revoir.', amitie: 15, reaction: 'Tout, hein ? Faites attention à ce que vous donneriez, par ici : il y a des choses qui écoutent. Mais je comprends, oh oui, je comprends.' },
          { label: 'Non. Je n’ai jamais eu besoin de personne.', amitie: -8, reaction: 'Jamais besoin de personne… C’est ce qu’on dit, jusqu’au soir où il faut quelqu’un pour tenir la lanterne. Ce soir-là, venez me voir, je la tiendrai.' },
          { label: 'Mon chien. Il trichait aux cartes.', amitie: 10, reaction: 'Ha ! Le mien aussi ! Enfin, je n’ai pas de chien, mais s’il existait, il tricherait, j’en mettrais ma main au feu.' },
        ],
        rappel: [
          'J’ai pensé à votre ami d’enfance, celui que vous voudriez revoir. Ne donnez pas tout, d’accord ? Gardez-vous un petit morceau.',
          'Toujours besoin de personne ? Tant mieux. Mais la lanterne est accrochée derrière le comptoir, au cas où.',
          'Votre chien tricheur, il jouait à quoi ? À la manille ? Je cherche un partenaire : le curé triche aussi.',
        ],
      },
      {
        id: 'aubergiste_q4', min: 4,
        texte: 'Une question d’aubergiste, et répondez sans réfléchir. Si vous aviez fait du mal à quelqu’un sans le vouloir, un mal qui ne se répare pas… vous le lui diriez ?',
        reponses: [
          { label: 'Oui. Même si ça me coûte son amitié.', amitie: 15, reaction: '… Vous avez plus de courage que moi. Allez, je vous sers quelque chose. Non, pas pour moi : moi, je… non, pas ce soir.' },
          { label: 'Non. Ça ferait deux malheureux au lieu d’un.', amitie: 5, reaction: 'C’est ce que je me dis. Ça marche une nuit sur deux ; l’autre nuit, je compte les tonneaux.' },
          { label: 'Ça dépend. Il est plus grand que moi ?', amitie: 0, reaction: 'Ha ! … Oubliez ma question. C’était une question d’ivrogne, et je n’ai même pas bu.' },
        ],
        rappel: [
          'J’ai repensé à ce que vous m’avez dit, sur le courage de tout avouer. J’ai essayé, dimanche. J’ai servi la soupe à la place.',
          'Deux malheureux au lieu d’un, vous disiez. J’ai refait le calcul toute la nuit : ça tombe juste, et ça ne console pas.',
          'Plus grand que vous… Ha ! Je la ressors à tout le monde, celle-là. Ça fait rire, et ça évite de répondre.',
        ],
      },
    ],
    humeurs: {
      joyeux: [
        'Nom d’une pipe, quelle journée ! J’ai trouvé trois truffes sous le noisetier du jardin, grosses comme le poing de {npc:forgeron} !',
        'Entrez, entrez, {fermier} ! Aujourd’hui, tout le monde est beau, même le maire, surtout de dos.',
        'J’ai la chanson dans le ventre, ce matin ! Ou la faim : chez moi, c’est souvent la même chose.',
      ],
      triste: [
        'Pas de blague aujourd’hui, pardonnez-moi. Le tiroir à blagues est coincé.',
        'C’est l’anniversaire de l’oncle Anatole : je lui ai mis un couvert. Il n’a pas touché à sa soupe, il n’y touche jamais.',
        'J’ai rêvé du lac, cette nuit, moi qui n’en rêve jamais. Je n’aime pas quand je rêve du lac.',
      ],
      fatigue: [
        'La salle s’est vidée à minuit, et moi à deux heures. Mes pieds me parlent, et ils ne disent rien de gentil.',
        'Je me suis réveillé assis dans la salle, sur une chaise tournée vers la porte. J’ai dû m’endormir en comptant les tonneaux.',
        'Un café, non, deux… Non : la cafetière et une paille.',
      ],
      inquiet: [
        'Je ris trop fort, aujourd’hui ? C’est que j’ai peur, et un rire, ça fait du bruit dans une salle vide.',
        'La marmite du fond a refroidi, cette nuit. Elle n’avait jamais refroidi depuis que je suis né.',
        'Des lumières sur {lieu:marais}, hier soir : des gaz de vase, voilà tout ! Seulement, d’habitude, les gaz de vase ne vous suivent pas jusqu’au pont.',
      ],
      agace: [
        '{npc:forgeron} m’a encore dit que mon vin avait le goût du lac ! Au prix où je le paie, mon lac !',
        'Quelqu’un a mis ses doigts dans ma sauce. Je vois les traces, j’ai des yeux !',
        'Le maire veut que j’affiche « Ici, on ne parle pas des nuits rouges ». Et on parle de quoi, alors, de ses discours ?',
      ],
    },
    souvenirs: {
      cadeau_adore: [
        'J’ai écrit sur l’ardoise de la salle : « Grâce à {prenom} : {objet} ! » Les clients ont cru que c’était le plat du jour ; je n’en ai donné à personne.',
        'Le jour où vous m’avez apporté « {objet} », j’ai fermé la cuisine pour moi tout seul. Premier jour de ma vie où j’ai refusé de servir quelqu’un !',
      ],
      cadeau_deteste: [
        'Votre cadeau de l’autre jour, « {objet} »… Ça a fini dans la soupe du maire. Il a demandé la recette.',
        '« {objet} »… Je ne vous en veux pas, hein. Mais mon estomac, lui, a de la mémoire.',
      ],
      aide: [
        'Vous m’avez sauvé la mise, l’autre fois. Le ragoût s’en souvient, et moi aussi : il y aura une louche de plus dans votre assiette, pour la vie.',
        'Quand vous m’avez donné un coup de main, j’ai failli vous embaucher. Heureusement pour vous, je ne paie personne.',
      ],
      toque_nuit: [
        'C’était vous, l’autre nuit, qui frappiez ? Trois fois ? Ne faites plus jamais ça : je suis resté dans le noir à compter les tonneaux jusqu’au chant du coq.',
        'Si vous avez faim la nuit, cassez un carreau, mais ne frappez pas. Un carreau, ça se remplace.',
      ],
      coup: [
        'Vous m’avez frappé. Moi, le seul homme de la vallée qui n’ait jamais refusé une soupe à personne. Ça passera. Pas tout de suite.',
        'J’ai encore la marque. Je dis aux clients que je me suis cogné à une poutre ; une poutre qui vous ressemble drôlement.',
      ],
      absence: [
        'Vous voilà ! Je croyais que vous aviez trouvé une meilleure auberge. Il n’y en a pas d’autre, mais j’ai eu peur quand même.',
        'Ça fait des jours ! Votre chaise a pris la poussière, et moi trois livres, à force de manger vos parts.',
      ],
      victime: [
        'Encore une place vide au comptoir. Ce soir, je mettrai un couvert de plus, comme pour l’oncle : on ne sait jamais qui a besoin de s’asseoir.',
        'Je n’ai pas envie de rire, aujourd’hui. D’habitude, ça m’arrive une fois par an. Cette année, ça m’arrive trop souvent.',
      ],
    },
    tenue: {
      arme: 'Oh là ! Posez-moi ça près de la porte : ici, on ne découpe que le jambon, et c’est moi qui tiens le couteau.',
      pelle: 'Une pelle ! Si c’est pour l’or des Valmont, la première tournée est pour vous… enfin, c’est vous qui la payez.',
      potion: 'Si c’est de la gnôle de la forêt, je vous l’achète ; si c’est un remède de la vieille, je ne veux rien savoir.',
      animal_mort: 'Ah, voilà de la belle viande ! Et le sang sur le plancher, ça part à l’eau froide et au vinaigre : je suis bien placé pour le savoir.',
      fleurs: 'Des fleurs, pour qui ? Ne dites rien, je le saurai par {npc:postiere} avant ce soir.',
      poisson: 'Un beau poisson ! Pas un de ces poissons blancs sans yeux, j’espère : ceux-là, je ne les cuis pas, ils vous regardent quand même.',
      lanterne_jour: 'Une lanterne en plein jour ? Si vous cherchez un honnête homme, il n’y en a pas à l’auberge, mais il y a du fromage.',
      relique: 'Rangez ça, voulez-vous. Pas parce que j’y crois : parce que toutes mes chandelles viennent de vaciller en même temps.',
      rien: 'Les mains vides ? Parfait, vous pourrez tenir une assiette.',
    },
    chez_soi: {
      jour: 'Ho, ho ! La salle, c’est en bas ! Ici, c’est ma chambre, mes chaussettes et mes secrets. Redescendez, je vous offre un café pour oublier ce que vous avez vu.',
      nuit: 'Qui est là ? … Vous ? Par tous les saints, j’ai failli vous assommer avec la louche ! Vous n’avez pas frappé trois fois, au moins ? Non ? Bon. Bon. Asseyez-vous, je ne dormais pas.',
    },
    activites: {
      travail: [
        'Un peu de sel, un peu de lard, et beaucoup d’amour. Ou beaucoup de lard. Les deux marchent.',
        'Quarante-deux tonneaux… quarante-trois ? Non. Quarante-deux. Je recompte.',
        'Chope, chope, chope… Qui a bu dans la chope de l’oncle ? Personne n’a le droit de boire dans la chope de l’oncle.',
      ],
      repas: [
        'Ah, le meilleur moment de la journée : quand le cuisinier mange. C’est toujours lui qui a le plus faim.',
        'Une omelette aux truffes à midi. Le médecin dirait non. Il n’y a pas de médecin. Donc, oui.',
        'Pain, fromage et un oignon cru. Le déjeuner des rois et des aubergistes.',
      ],
      priere: [
        'Saint Lard, patron des marmites, faites que la sauce prenne. Amen, et une pincée de sel.',
        'Je ne prie pas, moi. Je parle au plafond. Des fois, il répond : c’est la sept.',
        'Seigneur, si vous existez, gardez-moi une place au chaud, près des cuisines. Et si vous n’existez pas, ce n’est pas grave : je vous garde la vôtre.',
      ],
      promenade: [
        'Ah, l’odeur des champignons après la pluie ! Si je n’étais pas aubergiste, je serais cochon truffier.',
        'Le lac est beau, ce matin. Beau et plat. Je ne m’approche pas plus, j’ai des souliers neufs.',
        'Tiens, un fer à cheval sur le chemin. Tombé du ciel, sûrement ! Ha ! … Il est chaud.',
      ],
      soir: [
        'Les chaises sur les tables, les volets, la barre, le verrou. Et un deuxième verrou, pour la symétrie.',
        'Bonne nuit, la salle. Bonne nuit, l’oncle. Bonne nuit, la sept. … Personne ne répond. Parfait.',
        'Dernière tournée ! Pour moi : un bol de lait. Pas un mot aux clients, j’ai une réputation.',
      ],
      pluie: [
        'Il pleut ! Les clients vont venir se sécher, boire et raconter des histoires. Béni soit le mauvais temps.',
        'La pluie tape sur le toit comme des doigts. Je n’aime pas quand elle tape en rythme.',
        'Les jours de pluie, l’oncle Anatole faisait des crêpes. Je fais pareil, et elles collent autant que les siennes.',
      ],
    },
    discussions: [
      {
        avec: 'pecheur',
        lignes: [
          ['aubergiste', 'Hé, vieux brochet ! Une soupe ? C’est la maison qui régale.'],
          ['pecheur', 'Hé. Tu dis ça tous les dimanches.'],
          ['aubergiste', 'Et tous les dimanches, c’est vrai ! Tu te souviens des écrevisses au lard ? Tu tombais à l’eau une fois sur deux.'],
          ['pecheur', 'Une fois sur trois. C’est toi qui me poussais. … La cloche a sonné sous l’eau, cette nuit. Jules l’entendait, lui aussi.'],
          ['aubergiste', 'Ha ! Ce sont les grenouilles qui ont appris le carillon. Mange ta soupe, va, elle refroidit.'],
          ['pecheur', 'Tu ris toujours, quand on parle de lui. Comme ce soir-là.'],
        ],
      },
      {
        avec: 'forgeron',
        lignes: [
          ['aubergiste', 'Ah, {npc:forgeron} ! Justement, je pensais à toi. Enfin, à ton ardoise : elle fait bientôt le tour du comptoir.'],
          ['forgeron', 'Hm. Ton chaudron fuit.'],
          ['aubergiste', 'Ne change pas de sujet ! … Il fuit beaucoup ?'],
          ['forgeron', 'Par le fond. Je le répare. On est quittes.'],
          ['aubergiste', 'Quittes ? Trois mois d’ardoise contre un fond de chaudron ! … Bon. Et tu me cercles le tonneau du fond, aussi ? Celui qui… enfin, celui qui sonne.'],
          ['forgeron', 'Pas celui-là. Il frappe de l’intérieur. Je ne touche pas à ce qui frappe de l’intérieur.'],
        ],
      },
      {
        avec: 'cure',
        lignes: [
          ['aubergiste', 'Mon père ! Le vin de messe est arrivé. Il n’attend plus que votre jugement.'],
          ['cure', 'In vino veritas, mon fils. Et dans celui-ci, je trouve surtout de l’eau.'],
          ['aubergiste', 'De l’eau ! Vous fréquentez trop le maire, mon père.'],
          ['cure', 'Je le goûterai de nouveau demain, pour en avoir le cœur net. La prudence est une vertu cardinale.'],
          ['aubergiste', 'Tant que vous y êtes… vous ne voudriez pas bénir la cave ? Une petite fois. Juste le tonneau du fond.'],
          ['cure', 'C’est la troisième fois cette année, mon fils. Qu’y a-t-il donc, dans ce tonneau, que vous n’osez pas me dire ?'],
        ],
      },
    ],
    foi_lignes: [
      'Le bon Dieu, les Anciens, ceux d’en bas… Moi, je crois au lard, au feu de bois et à la soupe chaude. Eux, au moins, ils répondent quand on les appelle.',
      'Le curé bénit ma cave deux fois l’an et goûte mon vin tous les soirs. Si ça ne fait pas de bien à la cave, ça en fait au curé.',
      'Les légendes, c’est mon fonds de commerce : un verre, une histoire de revenants, et les gens restent jusqu’à la fermeture. Si j’y croyais, je fermerais plus tôt.',
      'Ceux d’en bas ? Il n’y a rien, en bas, que ma cave et mes tonneaux. Et si quelqu’un frappe dedans, c’est le vin qui travaille. Voilà. C’est le vin.',
    ],
    reaction_piete: {
      eglise: 'Vous passez plus de temps à genoux qu’à table, ces temps-ci ! Attention : le curé va vous proposer de goûter le vin de messe avec lui, et ça, c’est un sacerdoce.',
      anciens: 'Vous sentez le miel et la mousse, comme les vieux d’autrefois qui laissaient du pain aux pierres. Moi, je n’y crois pas. Mais je vous mets une assiette de côté, au cas où les pierres auraient faim.',
      dessous: 'Pourquoi les chaises se tournent-elles vers vous quand vous entrez ? … Elles faisaient ça, la nuit de mes dix ans. Asseyez-vous près de la porte, voulez-vous, et ne me dites pas ce que vous leur avez promis.',
    },
    fete_lignes: [
      'C’est ma fête ! Tournée générale ! … De soupe. Le vin, c’est à vos frais, faut pas pousser.',
      'L’oncle Anatole me faisait un gâteau aux noix pour ma fête, et il le ratait chaque année. Je le rate encore chaque année, pour lui. Vous en voulez une part ? Elle est… mémorable.',
    ],
    secret: 'Chaque année, à la Saint-Jean, j’écris une lettre à Hortense, avec toutes les nouvelles : le prix du lard, les baptêmes, les enterrements, le ragoût. Je la donne à {npc:postiere}, pour une adresse qui n’existe pas. Elle la prend sans un mot et ne m’en a jamais reparlé. C’est la seule chose que cette petite n’ait jamais racontée à personne.',
  },
  // --------------------------------------------------------------------------
  postiere: {
    foi: 'eglise', devotion: 1, fete: 27,
    mythes: ['lise', 'puits_aux_souhaits'],
    mythe_intro: [
      'Je ne devrais pas vous raconter ça : je le tiens d’une lettre qui ne m’était pas adressée. Mais puisque vous insistez… Vous insistez, n’est-ce pas ?',
      'Je vous la fais courte, j’ai une tournée. Écoutez bien, parce que celle-là, je ne la raconte jamais deux fois, et jamais près d’un puits.',
    ],
    histoire: [
      { titre: 'La voiture jaune', min: 0, texte: 'Mon père, Désiré Pichon, conduisait la voiture du courrier entre la vallée et la plaine : une caisse jaune, deux chevaux gris, et une trompe pour annoncer les lettres. Le jeudi, il m’asseyait à côté de lui sur le siège, et je triais les enveloppes à l’odeur : le tabac pour les hommes, la lavande pour les veuves, la violette pour les amoureux. J’ai appris à lire sur les adresses ; je savais écrire « Madame veuve » avant de savoir écrire « maman ». Les gens nous attendaient au bord de la route comme on attend la pluie après la sécheresse. C’est là que j’ai compris que les nouvelles, c’est ce qu’il y a de plus précieux au monde, après le pain.' },
      { titre: 'Receveuse', min: 0, texte: 'À quatorze ans, j’aidais déjà le vieux receveur Fromentin, qui tremblait tant qu’il datait les lettres de travers ; à vingt-deux, j’ai repris son bureau et son tampon. Le sac du courrier est déposé à l’aube sur la borne du pont sud : en douze ans, je n’ai jamais croisé celui qui l’apporte, et pourtant j’ai essayé d’arriver plus tôt. Je trie à sept heures et demie, je cours au hameau à dix, je reviens à midi et demi, et je ne fais jamais de tournée après le coucher du soleil. Je ne lis pas les lettres, je lis les enveloppes : on y apprend déjà tout. Une écriture qui appuie, c’est une colère ; une adresse recopiée trois fois, c’est un amour qui n’ose pas.' },
      { titre: 'Au dos de la feuille de route', min: 1, texte: 'Chaque sac arrive avec sa feuille de route, signée par le receveur de la gare d’en bas. Il y a six ans, j’ai trouvé au dos, au crayon, tout petit : « Il fait beau, chez vous ? » J’ai répondu en dessous, et depuis, on s’écrit là, dans la marge, où le règlement ne regarde pas. Il s’appelle Octave, il a une écriture penchée, il aime les poires et il déteste le dimanche. Un jour, j’ai écrit : « Venez. » Le lendemain, la feuille disait : « Je ne trouve pas la route. »' },
      { titre: 'Les chevaux sont rentrés seuls', min: 2, texte: 'J’avais neuf ans. Un soir de novembre, dans un brouillard à couper au couteau, la voiture jaune est rentrée au pas, les chevaux fumants, les sacs bien ficelés : il ne manquait pas une lettre. Il manquait papa. On l’a cherché trois jours le long de la grand-route et au bord du marais ; on n’a retrouvé que sa trompe, pendue à une branche, bien droite, comme accrochée exprès. Maman a pleuré tout un hiver. Moi, j’ai commencé à guetter le courrier, et je guette encore.' },
      { titre: 'L’eau qui parle', min: 3, texte: 'Un jeudi de juillet, je rinçais ma sacoche au bout du ponton. L’eau s’est mise à clapoter autrement, et j’ai entendu « {nom} », avec la voix de mon père, puis : « Tu as du courrier. » Je suis partie en courant, la sacoche dégoulinante, et je n’ai plus jamais remis les pieds au bord du lac. Depuis, je fais le grand tour par le pont, et je rentre avant la nuit, toujours. J’ai peur de l’eau qui parle, du noir qui écoute, et des lettres qui en savent plus que moi.' },
      { titre: 'Un sou dans le puits', min: 4, texte: 'L’hiver où papa a disparu, maman pleurait toutes les nuits, et je n’en pouvais plus de l’entendre à travers la cloison. Un matin, j’ai pris le sou de ma tirelire, je suis allée jusqu’au vieux puits, où l’on m’avait défendu d’aller, et j’ai demandé que maman arrête de pleurer. Le soir même, elle a cessé : elle n’a plus jamais pleuré, ni ri, pas même à l’enterrement de grand-père Vasseur. C’est moi qui lui ai pris ça, avec un sou. Chaque année, je me décide à retourner au puits pour le lui rendre, et chaque année, ce matin-là, la lettre arrive : « Ne va pas au puits. »' },
      { titre: 'Le carnet des bonnes nouvelles', min: 6, texte: 'J’ai un carnet des bonnes nouvelles depuis mes quinze ans. En vingt ans, j’y ai inscrit deux naissances, un mariage, une recette de brioche, et puis votre arrivée, soulignée deux fois. La lettre d’Anselme, « pour la personne qui viendra », je ne l’ai pas ouverte, je le jure ; mais je la soupèse chaque soir, et elle pèse un peu plus lourd chaque fois que vous passez devant le guichet. Je crois bien que c’est vous. Je la garde encore un peu, pourtant : tant qu’elle dort dans mon tiroir, vous n’avez aucune raison de faire comme lui.' },
      { titre: 'Rien pour vous, mon oncle', min: 8, texte: 'La femme de mon oncle n’est pas partie sans un mot. Trois jours après cette nuit d’octobre, une lettre sans timbre est arrivée dans le sac, de son écriture, adressée à {npc:maire}. Je l’ai ouverte à la vapeur, comme on m’en accuse : elle disait qu’elle n’était pas partie, qu’elle était descendue, qu’on l’appelait depuis des mois du fond du vieux puits et qu’elle avait fini par répondre. En bas, souligné deux fois : « Surtout, qu’il ne vienne pas me chercher. » Je ne la lui ai jamais donnée, parce qu’il y serait allé le soir même. Et chaque dimanche, au repas de famille, il me demande pour rire s’il y a du courrier pour lui, et chaque dimanche, je réponds : « Rien, mon oncle. »' },
    ],
    questions: [
      {
        id: 'postiere_q1', min: 0,
        texte: 'Dites-moi, vous écrivez à quelqu’un, vous ? Parce que vous ne recevez jamais rien, et ça m’intrigue depuis le premier jour.',
        reponses: [
          { label: 'Non. Il n’y a plus personne à qui écrire.', amitie: 15, reaction: 'Oh… Alors c’est la Poste qui vous écrira. Enfin, moi : des avis de passage, des petits mots… c’est mieux que rien, non ?' },
          { label: 'Ça ne regarde pas la Poste.', amitie: -10, reaction: 'La Poste, non. Moi, un petit peu. Bon, pas le temps, pas le temps, j’ai un recommandé qui s’impatiente !' },
          { label: 'Si, mais sans adresse. Pour vous donner du travail.', amitie: 10, reaction: 'Ne riez pas, j’en ai tout un tiroir, des lettres sans adresse ! Si j’en trouve une de votre écriture, je saurai à qui me plaindre.' },
        ],
        rappel: [
          'Tenez, un petit mot de la Poste. Il dit : « Bonjour. » C’est tout, et c’est déjà beaucoup, non ?',
          'Toujours rien qui regarde la Poste ? Je respecte. Je ronge mon crayon, mais je respecte.',
          'J’ai trouvé une lettre sans adresse, ce matin. Je l’ai reniflée : ce n’était pas vous. Dommage.',
        ],
      },
      {
        id: 'postiere_q2', min: 1,
        texte: 'Entre nous, qu’est-ce qu’on dit de moi, en ville ? Vous pouvez tout me dire : de toute façon, je le sais déjà. Enfin, presque.',
        reponses: [
          { label: 'Qu’on peut compter sur vous, pluie ou pas.', amitie: 20, reaction: 'Ah bon ? On dit ça ? Non, ne me dites pas qui : je veux le garder comme ça, sans nom dessus, comme une lettre anonyme gentille.' },
          { label: 'Que vous lisez les lettres des autres.', amitie: -15, reaction: 'Je ne lis pas les lettres, je lis les enveloppes. C’est une nuance qui a coûté très cher à ma réputation, et vous venez d’en rajouter une couche.' },
          { label: 'Que vous courez plus vite que les nouvelles.', amitie: 8, reaction: 'C’est faux ! Je cours exactement à la même vitesse. Je pars juste un peu avant.' },
        ],
        rappel: [
          'Quelqu’un m’a dit merci, ce matin, pour une lettre portée sous la pluie. J’ai pensé à ce que vous m’aviez dit, et je suis restée plantée là comme une borne.',
          'Vous croyez toujours que je lis les lettres ? Ce matin, j’en ai tenu une contre la lumière. Pour vérifier le timbre. Uniquement le timbre.',
          'Aujourd’hui, j’ai battu une nouvelle à la course : j’ai annoncé un mariage avant que les fiancés soient au courant.',
        ],
      },
      {
        id: 'postiere_q3', min: 2,
        texte: 'Si vous pouviez recevoir une seule lettre, de n’importe qui, même de quelqu’un qui n’est plus là… elle viendrait de qui ?',
        reponses: [
          { label: 'De quelqu’un que j’ai perdu. Pour lui dire au revoir.', amitie: 18, reaction: 'Au revoir… Moi, je voudrais juste savoir s’il a eu froid, mon père. Il est parti sans son manteau, c’est bête, hein ?' },
          { label: 'De personne. Les morts n’écrivent pas.', amitie: -5, reaction: 'Ici, parfois, il arrive des choses dans ma sacoche. Je ne dis pas qu’elles viennent de là-bas. Je ne dis pas le contraire non plus.' },
          { label: 'Du percepteur, pour me dire qu’il m’oublie.', amitie: 10, reaction: 'Ha ! Celle-là, même la Poste ne saurait pas l’acheminer : il faudrait un miracle, et un timbre spécial.' },
        ],
        rappel: [
          'J’ai pensé à votre lettre, celle que vous voudriez recevoir. Si elle arrive un jour, je vous la porte en courant, même tard. Enfin, presque tard.',
          'Les morts n’écrivent pas, vous disiez. Ce matin, j’ai trié une carte datée de 1851, et l’encre était encore fraîche.',
          'Toujours rien du percepteur. Il réfléchit. Moi, à sa place, je ferais semblant de perdre votre dossier.',
        ],
      },
      {
        id: 'postiere_q4', min: 4,
        texte: 'Je vais vous poser la question que je n’ose poser à personne. Si on vous confiait une lettre qui pourrait briser le cœur de celui qui l’attend… vous la lui donneriez ?',
        reponses: [
          { label: 'Oui. Une lettre appartient à celui qui l’attend.', amitie: 10, reaction: '… Oui. C’est ce que dit le règlement, et c’est ce que je me répète tous les dimanches. Le règlement a toujours raison, sauf le dimanche.' },
          { label: 'Non. Je la brûlerais, et je me tairais.', amitie: -10, reaction: 'La brûler, devant une receveuse des Postes ! Pardon… c’est juste que je n’ai jamais eu le courage de la brûler, moi non plus, ni de la donner.' },
          { label: 'Je la lirais d’abord. Par curiosité.', amitie: 15, reaction: 'Vous voyez ? Tout le monde le ferait ! Et ensuite… non, ne répondez pas : ensuite, c’est là que ça se complique.' },
        ],
        rappel: [
          'Une lettre appartient à celui qui l’attend, vous disiez. J’ai failli, dimanche : j’avais la main dans mon sac. Et puis on a servi le rôti.',
          'Je n’ai rien brûlé. J’ai allumé une bougie, j’ai tenu l’enveloppe au-dessus, et je l’ai rangée. Encore.',
          'Je la lirais d’abord, vous aviez dit. Vous avez une âme de postière, vous savez. C’est un compliment. À peu près.',
        ],
      },
    ],
    humeurs: {
      joyeux: [
        'Bonne nouvelle, {fermier} ! Pas pour vous, pour quelqu’un d’autre, et je ne peux pas dire qui : réjouissez-vous sans savoir, ça marche aussi.',
        'La tournée jusqu’à {hameau} en une heure douze, record battu ! Le chien du ranch n’a même pas eu le temps d’aboyer.',
        'Il fait beau, j’ai reçu des timbres neufs, et personne n’est mort cette semaine. Vous savez comme c’est rare, ici ?',
      ],
      triste: [
        'Pas de courrier pour vous, ni pour moi. Comme toujours, mais aujourd’hui, ça me pèse.',
        'J’ai distribué un faire-part, ce matin. On a beau savoir ce qu’il y a dedans, ça tire sur l’épaule plus qu’un colis.',
        'Maman a regardé par la fenêtre toute la matinée, sans rien dire, comme les jours de brouillard. Et je me surprends à faire pareil.',
      ],
      fatigue: [
        'Quatorze lettres, deux colis, un recommandé et mon oncle. Je ne sais pas ce qui pèse le plus lourd.',
        'J’ai couru toute la journée. Mes souliers vont demander leur retraite, et la Poste va la leur refuser.',
        'Je n’ai pas dormi : j’ai trié des lettres, des idées, un peu de tout. Ne me demandez pas quoi.',
      ],
      inquiet: [
        'Il y a une lettre dans le sac qui ne pèse rien : la balance dit zéro. Vous trouvez ça normal, vous ?',
        'Hier soir, mon tampon était sur le guichet ; ce matin, il était au fond de l’encrier, à l’envers. Et maman ne touche jamais à rien.',
        'Quelqu’un a laissé une lettre sur {lieu:tombe_lise}, dans le bois, une lettre sans timbre. Je ne l’ai pas ramassée, je n’ai pas pu.',
      ],
      agace: [
        'Mon oncle m’a encore rappelé qui m’a obtenu la place. C’est la quatre cent douzième fois, je tiens le compte.',
        'On m’a encore accusée d’ouvrir les lettres ! Moi, qui n’ouvre que celles qui le méritent… enfin, qui n’ouvre rien du tout.',
        '{npc:garde} a levé le pont sud avec un quart d’heure d’avance, et j’étais encore dessus ! « Le règlement », qu’il dit : quel règlement, le sien ?',
      ],
    },
    souvenirs: {
      cadeau_adore: [
        'J’ai inscrit votre cadeau dans mon carnet des bonnes nouvelles : « {objet}, don de {prenom} ». Il n’y a pas beaucoup de lignes, dans ce carnet ; la vôtre est soulignée.',
        'Vous vous rappelez « {objet} » ? Je l’ai raconté à toute la vallée. Pour une fois, c’était une bonne nouvelle, et c’était la mienne.',
      ],
      cadeau_deteste: [
        '« {objet} »… C’est parti avec les colis sans adresse, là où l’on range ce qu’on ne sait pas où ranger.',
        'Retour à l’envoyeur, vous vous souvenez ? « {objet} ». Je ne vous en veux pas. Je le note, c’est tout. Je note tout.',
      ],
      aide: [
        'Vous m’avez aidée, l’autre jour, et je l’ai dit à tout le monde. Ce n’est pas un reproche, c’est de la publicité.',
        'Sans vous, mes plis dormiraient encore dans ma sacoche. La Poste vous doit une fière chandelle ; moi aussi, mais moins officiellement.',
      ],
      toque_nuit: [
        'C’était vous, l’autre nuit, qui frappiez au guichet ? J’ai passé la nuit sous le comptoir, le tampon à la main. Le tampon ! Comme si ça servait à quelque chose.',
        'La nuit, je n’ouvre pas. Même pas à vous. Surtout pas à une voix qui vous ressemble.',
      ],
      coup: [
        'Vous m’avez frappée. Toute la vallée le sait, évidemment : c’est moi qui l’ai dit. Mais j’aurais préféré n’avoir rien à raconter.',
        'Ma joue a gardé la marque trois jours. Trois jours à répondre « je me suis cognée au guichet ». Je mens très mal : pour une postière, c’est un comble.',
      ],
      absence: [
        'Vous ! J’ai cru que vous aviez quitté la vallée. J’ai failli faire suivre votre courrier. Enfin, si vous en aviez.',
        'Ça fait des jours ! Il s’est passé des choses, il faut que je vous raconte tout. Asseyez-vous. Non, restez debout, ça ira plus vite.',
      ],
      victime: [
        'J’ai une lettre dans mon sac pour quelqu’un qui ne la lira plus. Je ne sais pas quoi en faire, et je ne veux pas la rendre.',
        'Tout le monde me demande qui, comment, pourquoi. Pour une fois, je ne sais rien. Et je n’ai pas envie de savoir.',
      ],
    },
    tenue: {
      arme: 'Rangez ça, vous allez faire peur à mes recommandés ! La Poste est un service public, pas un champ de bataille.',
      pelle: 'Une pelle ? Vous creusez quoi, où, pour qui ? … Pardon, déformation professionnelle.',
      potion: 'Cette fiole, ça vient de chez {npc:guerisseuse} ? Ne dites rien, je vais deviner… non, dites.',
      animal_mort: 'Ah non, pas sur le guichet ! Le sang sur un tampon, ça ne part jamais.',
      fleurs: 'Des fleurs ! Non, ne me dites pas pour qui : laissez-moi une minute d’espoir.',
      poisson: 'Ça sent le lac, et je n’aime pas quand ça sent le lac. Posez-le dehors, voulez-vous ?',
      lanterne_jour: 'Une lanterne à midi ? Vous savez quelque chose que je ne sais pas, et je déteste ça.',
      relique: 'Pas de timbre, pas d’adresse, et ça me donne la chair de poule. Où avez-vous trouvé ça ?',
      rien: 'Rien à poster ? Tant mieux, j’ai déjà trop de travail.',
    },
    chez_soi: {
      jour: 'Le guichet, c’est devant ! Ici, c’est chez moi, et chez maman. Elle ne dit rien, mais elle vous regarde. Ressortez, s’il vous plaît.',
      nuit: 'Qui est… Vous ! Chez moi, en pleine nuit ! Vous savez ce que vous risquez ? Que je le raconte à tout le monde, voilà ce que vous risquez. … Qu’est-ce qui se passe ? Parlez vite, et parlez bas.',
    },
    activites: {
      travail: [
        'Grenier, catalogue de semences. Lagrange, deux livres de bougies. Chabert… violette, encore. Rien pour la ferme, évidemment.',
        'Recommandé, accusé de réception, signature… Personne ne signe du premier coup, ici. Ils ont tous peur de laisser leur nom quelque part.',
        'Jour {jour}. Quatorze lettres, un colis, zéro merci. Je note tout, et je ne dis rien. Presque rien.',
      ],
      repas: [
        'Une brioche en marchant, c’est un repas, non ? C’est ce que je me dis depuis douze ans.',
        'Soupe avec maman. Elle ne parle pas, alors je parle pour deux. On s’entend très bien.',
        'Du lait et une tartine. Si je m’assois plus de cinq minutes, les nouvelles partent sans moi.',
      ],
      priere: [
        'Sainte Vierge, protégez les facteurs, les receveuses et les lettres perdues. Surtout les lettres perdues.',
        'Notre Père, qui êtes aux cieux… aux cieux, n’est-ce pas ? Pas en bas. Pas en bas.',
        'Saint Aubin, je vous confie mon oncle. Il en a besoin, et moi, je n’ai plus le temps de m’en occuper.',
      ],
      promenade: [
        'Tiens, les volets du garde sont restés ouverts toute la nuit. Comment je le sais ? … Je le sais, c’est tout.',
        'Personne dans {lieu:lavoir}, à cette heure-ci ? Le lavoir n’est jamais vide. Qu’est-ce qu’elles me cachent ?',
        'Je fais le tour par le pont. C’est plus long, mais ça ne passe pas par le lac.',
      ],
      soir: [
        'Les sacs sont bouclés, le guichet est fermé, et je rentre avant le coucher du soleil. Mon règlement à moi.',
        'Bonne nuit, les lettres. Ne vous ouvrez pas toutes seules.',
        'Encore une journée sans lettre pour moi. Demain, peut-être. Je dis ça depuis douze ans.',
      ],
      pluie: [
        'Ma sacoche fait éponge, les adresses coulent. Je vais livrer au jugé.',
        'Il pleut sur les enveloppes, et l’encre fait des larmes. Ça donne un air triste même aux factures.',
        'Quand il pleut, les gens écrivent plus. Moi, je cours plus. Tout le monde y trouve son compte.',
      ],
    },
    discussions: [
      {
        avec: 'maire',
        lignes: [
          ['maire', 'Ma chère nièce ! Tout va bien, à la Poste ? N’oublie pas qui t’a obtenu cette place.'],
          ['postiere', 'Quatre cent treize, mon oncle.'],
          ['maire', 'Pardon ?'],
          ['postiere', 'C’est la quatre cent treizième fois que vous me le rappelez. Je tiens un registre, moi aussi.'],
          ['maire', 'Hum. Bien. Très bien, l’esprit administratif, c’est de famille ! … Et, dis-moi, rien pour moi, ce matin ? Rien de… personnel ?'],
          ['postiere', 'Rien, mon oncle. Rien du tout.'],
        ],
      },
      {
        avec: 'eleveuse',
        lignes: [
          ['postiere', 'Une lettre pour toi ! Violette. Encore. Tu ne l’ouvres pas ?'],
          ['eleveuse', 'Tout à l’heure. Quand tu seras partie.'],
          ['postiere', 'Mais je ne regarde pas ! Je regarde le ciel, il va pleuvoir. … Tu ne l’ouvres toujours pas ?'],
          ['eleveuse', 'Tu es mon amie et je t’aime bien. Mais tu as le bout du nez qui bouge quand tu mens.'],
          ['postiere', 'Je n’ai pas… Bon. Dis-moi au moins si c’est la même écriture.'],
          ['eleveuse', 'La même. Et elle sent toujours la violette. Maintenant, file, ou je lâche Tempête.'],
        ],
      },
      {
        avec: 'fillette',
        lignes: [
          ['fillette', 'Dis, t’as une lettre pour Lise, aujourd’hui ?'],
          ['postiere', 'Pour Lise ? Lise… qui, ma puce ? Il n’y a pas de Lise à {ville}.'],
          ['fillette', 'Lise du puits. Elle dit qu’on lui écrit jamais. Elle dit que toi, tu gardes ses lettres dans un tiroir.'],
          ['postiere', 'Qui t’a parlé de mon tiroir ? Ce sont des lettres pour des gens qui n’existent pas, c’est tout.'],
          ['fillette', 'Elle existe. Elle est juste en bas. Tu lui en donnes une, dis ? Elle en a jamais eu, même avant.'],
          ['postiere', 'Rentre chez ta mère, ma puce. Et dis à Lise que la Poste ne descend pas. Jamais.'],
        ],
      },
    ],
    foi_lignes: [
      'Je vais à la messe le dimanche, au deuxième rang, derrière mon oncle. C’est la meilleure place : on voit tout le monde, et le bon Dieu ne voit que mon oncle.',
      'Je prie vite, comme je fais tout. Le bon Dieu a toute la paroisse à écouter : les prières courtes, il doit les apprécier.',
      'Les Anciens, les pierres, la Dame du lac… Je n’y crois pas. Mais je ne passe jamais devant {lieu:source} sans nouer un ruban. Par politesse.',
      'Ceux d’en bas, on ne les nomme pas, on ne leur écrit pas, et surtout, on ne leur répond pas. Même quand ils ont votre écriture.',
    ],
    reaction_piete: {
      eglise: 'On vous voit à toutes les messes, maintenant ! Mon oncle en fait une jaunisse : il n’aime pas qu’on prie plus fort que lui. Continuez, surtout.',
      anciens: 'Il paraît que vous laissez du lait aux pierres. Ne niez pas, j’ai mes sources. Je ne juge pas, je trouve même ça joli ; mais n’en dites rien au curé, c’est moi qui le lui dirai.',
      dessous: 'Vous sentez la terre mouillée, comme les lettres sans timbre… Qu’est-ce que vous avez promis, au puits ? Non, ne répondez pas. Pour une fois dans ma vie, je ne veux pas savoir.',
    },
    fete_lignes: [
      'C’est ma fête, aujourd’hui ! Personne ne m’a écrit. Normal : c’est moi qui distribue, j’aurais vu passer la lettre.',
      'Mon oncle m’offre chaque année le même cadeau : un discours. Cette année, il a duré vingt minutes. Il s’améliore.',
    ],
    secret: 'Personne ne m’envoie jamais de vraie lettre, avec mon nom sur l’enveloppe. Alors, une fois par mois, je m’envoie une carte postale, avec une Semeuse et une vue de la mer, et je la distribue à mon propre guichet en faisant semblant d’être surprise. Je la signe « une amie ». Des fois, je me demande si la lettre de chaque année, celle qui me défend d’aller au puits, ce n’est pas moi aussi, un soir où je dormais debout.',
  },
});
