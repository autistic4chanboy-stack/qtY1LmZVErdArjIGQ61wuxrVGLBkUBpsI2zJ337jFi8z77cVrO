// Vie des habitants : la boulangère, la fillette, le forgeron
Object.assign(NPC_LIFE, {
  // --------------------------------------------------------------------------
  boulangere: {
    foi: 'eglise',
    devotion: 2,
    fete: 3,
    mythes: ['mere_des_moissons', 'puits_aux_souhaits'],
    mythe_intro: [
      'Asseyez-vous donc sur le sac de farine, mon chou. Celle-là, ma grand-mère me la racontait en pétrissant, et on ne ment pas en pétrissant : la pâte le sentirait.',
      'Attendez que je m’essuie les mains. Ces histoires-là, on ne les raconte pas avec de la pâte sous les ongles, ça porte malheur.',
    ],
    histoire: [
      {
        titre: 'Les sacs de farine', min: 0,
        texte: 'J’ai grandi dans le fournil, mon chou. L’hiver, ma mère me couchait sur les sacs de farine, contre le mur du four, parce que c’était l’endroit le plus chaud de {ville}. Je me réveillais blanche comme une meunière, et ma grand-mère me faisait tracer la croix sur les miches avant même que je sache écrire mon nom. Elle disait : « Le pain, ça se bénit, ça se respecte, et ça ne se pose jamais à l’envers. » Aujourd’hui encore, je retourne les miches des clients quand ils ont le dos tourné.',
      },
      {
        titre: 'Trois heures et demie', min: 0,
        texte: 'Je me lève à trois heures et demie, été comme hiver. D’abord le levain : ma grand-mère l’a commencé l’année de ses noces, et on ne l’a jamais laissé mourir, même l’hiver où le puits de la place a gelé. Ensuite le pétrin, le four à chauffer au fagot, et les tailles à encocher pour ceux qui paient à la fin du mois. J’ai gardé la taille du vieil Anselme, avec ses deux encoches par jour : je n’ai jamais eu le cœur de la mettre au feu. Le dimanche, je fais le pain bénit, et celui-là, je le pétris sans dire un mot, ce qui, chez moi, tient du miracle.',
      },
      {
        titre: 'Le M de l’enseigne', min: 1,
        texte: 'Émile est arrivé un matin de mars, à pied, avec son sac de compagnon et sa canne à rubans. Il s’est planté devant la vitrine, il a reniflé, et il a dit : « Votre levain est fatigué, mademoiselle. » J’ai ri si fort que ma mère l’a embauché le jour même, rien que pour lui prouver qu’il avait tort. Il chantait en pétrissant, des chansons à lui, pour faire lever la pâte, et elle levait, la traîtresse. Quand on s’est mariés, il a repeint l’enseigne : c’était « Maubert », il n’a eu qu’à gratter le M. Ma mère a boudé huit jours ; elle disait que c’était la seule économie qu’il ait jamais faite.',
      },
      {
        titre: 'Un soir de septembre', min: 2,
        texte: 'C’était un mardi, il faisait déjà nuit. Pataud, notre chien, aboyait dans la cour, tourné vers les champs, et rien ne le faisait taire. Émile a pris la lanterne et son gilet, et il m’a dit : « Garde-moi la pâte au chaud, j’en ai pour une minute. » Au matin, la pâte avait débordé du pétrin : c’est la seule fournée que j’aie jamais ratée. On a retrouvé la lanterne de l’autre côté des douves, posée bien droite dans l’herbe, encore allumée. Le pont était resté levé toute la nuit.',
      },
      {
        titre: 'Le prénom', min: 3,
        texte: 'L’autre matin, j’ai regardé ma fille, et son prénom n’est pas venu. Une seconde, pas plus. J’ai ri pour qu’elle ne voie rien, mais elle a vu : cette enfant voit tout. Depuis, je le répète cent fois par jour, {npc:fillette}, {npc:fillette}, comme on repasse une leçon. Ce qui me fait peur, mon chou, ce n’est pas la nuit, ni ce qui frappe aux portes. C’est d’oublier.',
      },
      {
        titre: '« Ouvre-moi »', min: 4,
        texte: 'Je ne l’ai jamais raconté à personne. Cette nuit-là, vers deux heures, on a frappé trois coups à la porte de la boutique, et c’était sa voix : « {nom}, ouvre-moi, j’ai froid. » Je n’ai pas ouvert. On n’ouvre pas, la nuit : ma mère me l’a appris, et sa mère avant elle. Je me dis que ce n’était pas lui. Je me le dis tous les soirs, en tirant le verrou.',
      },
      {
        titre: 'Une chanson ratée', min: 6,
        texte: 'Hier, je me suis surprise à chanter en pétrissant. Faux, évidemment : Émile disait que je faisais tourner le lait. {npc:fillette} s’est arrêtée dans l’escalier pour écouter, et elle a ri, un vrai rire, pas un de ceux qu’elle fait pour me rassurer. Ça faisait neuf ans que je n’avais pas chanté. Je crois que c’est depuis que la vieille ferme a de nouveau de la lumière aux fenêtres, le soir. L’espoir, mon chou, ça ressemble peut-être à ça : une chanson ratée, et une petite qui rit dans l’escalier.',
      },
      {
        titre: 'La monnaie du puits', min: 8,
        texte: 'Même à confesse, je ne l’ai jamais dit. Pendant cinq ans, Émile et moi, on n’a pas eu d’enfant : j’avais brûlé des cierges à l’église et fait des nœuds à {lieu:source}, pour rien. Une nuit de novembre, j’ai pris le louis d’or de ma mère dans la boîte à sel, et je l’ai jeté dans {lieu:vieux_puits} en demandant une petite fille. Elle est née l’automne suivant, avec les yeux de son père. Et l’année d’après, un soir de septembre, le chien s’est mis à aboyer vers le puits. Le puits se souvient de chaque pièce, mon chou : je crois qu’il a rendu la monnaie.',
      },
    ],
    questions: [
      {
        id: 'boulangere_q1', min: 0,
        texte: 'Dites-moi, mon chou, vous mangez quoi, le soir, tout là-haut dans votre ferme ? Et ne mentez pas : sur la nourriture, je vois tout de suite quand on me ment.',
        reponses: [
          { label: 'Votre pain, avec un bout de fromage. Le meilleur moment.', amitie: 15, reaction: 'Ah, mon chou ! Voilà qui me fait plus plaisir qu’un compliment sur ma robe. Tenez, je vous ajoute un croûton, pour finir le fromage.' },
          { label: 'Ce que je mange ne regarde que moi.', amitie: -10, reaction: 'Oh. Pardon, c’est le métier : je nourris toute la ville, alors je me mêle de tout. Je me tais, enfin, j’essaie.' },
          { label: 'Des pommes crues et des regrets. C’est léger.', amitie: 8, reaction: 'Des regrets ! Ça ne tient pas au corps, ça. Revenez demain, je vous fais une soupe au pain : les regrets, ça se trempe.' },
        ],
        rappel: [
          'Alors, ce fromage d’hier soir, il était à la hauteur de mon pain ? Je veux des détails, mon chou.',
          'Je ne vous demande plus ce que vous mangez, hein. Je regarde, c’est tout. Et je trouve que vous avez maigri.',
          'Encore des pommes et des regrets, ce soir ? Je vous ai mis une brioche de côté, pour changer de menu.',
        ],
      },
      {
        id: 'boulangere_q2', min: 1,
        texte: '{npc:fillette} vous parle de Lise, à vous aussi ? Dites-moi franchement, vous qui venez d’ailleurs : est-ce qu’il faut que je m’inquiète ?',
        reponses: [
          { label: 'C’est une amie imaginaire. Ça passera en grandissant.', amitie: 10, reaction: 'C’est ce que dit {npc:grainetiere}. Vous avez sûrement raison, elle et vous. J’aimerais juste qu’elle ait aussi des amies qu’on peut inviter à goûter.' },
          { label: 'Oui. Elle sait des choses qu’elle ne devrait pas savoir.', amitie: 12, reaction: '… Je sais, mon chou. Je le sais depuis longtemps. Merci de ne pas m’avoir menti : ici, personne ne dit jamais la vérité, sauf sur le prix du beurre.' },
          { label: 'Les enfants inventent. Moi, j’avais un dragon.', amitie: 4, reaction: 'Un dragon ! Et qu’est-ce qu’il est devenu, votre dragon ? Non, ne répondez pas, je ne veux pas savoir ce que deviennent les amis imaginaires.' },
        ],
        rappel: [
          '« Ça passera en grandissant », vous aviez dit. Hier, elle a mis deux couverts pour le goûter, et j’ai fait semblant de ne rien voir.',
          'Vous m’avez dit la vérité, pour la petite. J’y pense tous les soirs. Je vous en veux un peu, et je vous remercie beaucoup.',
          'J’ai raconté votre dragon à {npc:fillette}. Elle a dit que Lise, au moins, elle ne crache pas de feu : elle goutte.',
        ],
      },
      {
        id: 'boulangere_q3', min: 2,
        texte: 'Vous qui passez à la forge… {npc:forgeron}, il vous parle, à vous ? Il vous dit quoi ? Oh, je demande ça comme ça, par curiosité de boulangère.',
        reponses: [
          { label: 'Il parle surtout de votre pain. Et de vous, sans le dire.', amitie: 15, reaction: 'De moi ? Taisez-vous donc, mon chou. Et il dit quoi, exactement… non, ne me dites rien, si, dites !' },
          { label: 'Rien. C’est un ours, cet homme-là.', amitie: -8, reaction: 'Un ours… Les ours, ça grogne, mais ça ne mord pas les gens qu’ils connaissent. Ne dites pas de mal de lui dans ma boutique, s’il vous plaît.' },
          { label: 'Ce qui se dit à la forge reste à la forge.', amitie: 5, reaction: 'Ah ! Voilà qu’il y a des secrets de forge, maintenant. Très bien : vous ne saurez jamais ce que je mets dans ma brioche.' },
        ],
        rappel: [
          'Il est resté vingt minutes, ce matin. Vingt ! J’ai compté. C’est votre faute, avec vos histoires.',
          'Votre ours m’a réparé le loquet de la porte, hier, sans un mot et sans rien demander. Les ours ont du bon, mon chou.',
          'Alors, quoi de neuf à la forge ? Rien, évidemment : secret de forge. Moi, je mets de la cannelle dans ma brioche. Oups.',
        ],
      },
      {
        id: 'boulangere_q4', min: 4,
        texte: 'Je peux vous poser une vraie question, mon chou ? Si quelqu’un que vous aimez sortait un soir et ne revenait jamais… vous l’attendriez combien de temps ?',
        reponses: [
          { label: 'Toute ma vie. On n’arrête pas d’attendre ceux qu’on aime.', amitie: 20, reaction: '… Ne dites pas ça comme ça, mon chou. Ça fait du bien et ça fait mal en même temps, comme quand on met la main trop près du four.' },
          { label: 'Un temps. Puis je vivrais, c’est ce qu’on voudrait pour moi.', amitie: 0, reaction: 'Vous parlez comme {npc:grainetiere}. Elle a raison, vous avez raison, tout le monde a raison. Et moi, je garde une miche sur l’étagère.' },
          { label: 'Je n’aime personne. C’est plus pratique.', amitie: -5, reaction: 'Plus pratique, oui : moins de pain à garder. Vous mentez très mal, mon chou, mais je n’insiste pas.' },
        ],
        rappel: [
          '« Toute ma vie », vous aviez dit. J’y ai repensé en pétrissant, et j’ai pleuré dans la pâte. Elle a très bien levé, allez comprendre.',
          'J’ai rangé une chemise d’Émile, hier, une seule, au fond de la malle. C’est un début, non ? C’est vous qui m’avez mis ça en tête.',
          'Toujours personne à aimer ? Tant pis. Si ça vous prend un jour, ma porte est ouverte. Le jour, hein.',
        ],
      },
    ],
    humeurs: {
      joyeux: [
        'Bonjour, mon chou ! La pâte a levé comme une reine, ce matin, et quand la pâte est contente, je suis contente.',
        'Ah, vous voilà ! Goûtez-moi ce croûton tout chaud, et ne discutez pas : c’est un ordre de boulangère.',
        'Quelle journée ! {npc:fillette} m’a aidée toute la matinée sans s’envoler une seule fois, je vais le faire inscrire au registre des miracles.',
      ],
      triste: [
        'Bonjour, mon chou. Excusez ma mine, le four était froid ce matin, et moi avec.',
        'Ne faites pas attention à mes yeux, c’est la farine. Elle pique beaucoup, aujourd’hui.',
        'J’ai mis deux tasses sur la table ce matin, sans y penser. Qu’est-ce qu’il vous faut ?',
      ],
      fatigue: [
        'Bonjour… Pardon, je dors debout : la pâte n’a rien voulu savoir avant quatre heures.',
        'Si je m’assois, je ne me relève plus. Alors je reste debout et je vous souris, c’est tout ce qui me reste en rayon.',
        'Doux Jésus, mes pieds, mes pieds et mon dos ! Servez-vous, mon chou, je vous fais confiance pour la monnaie.',
      ],
      inquiet: [
        'Vous n’avez pas vu {npc:fillette} ? Elle devait rentrer du catéchisme il y a une heure, et elle traîne toujours près des puits.',
        'Vous avez bien dormi, vous ? Moi, j’ai encore entendu pétrir dans le fournil toute la nuit.',
        'Ah, c’est vous… Il y avait quelqu’un devant la vitrine tout à l’heure, qui regardait sans entrer, et je n’aime pas ça du tout.',
      ],
      agace: [
        'Le meunier du bourg a encore augmenté sa farine, le brigand ! Je vais finir par moudre avec mes dents.',
        'Ne me parlez pas de {npc:postiere} : toute la ville sait déjà que j’ai brûlé une fournée. Toute la ville !',
        'Faites vite, mon chou : j’ai deux fournées au four et une fille envolée dans la nature. Encore.',
      ],
    },
    souvenirs: {
      cadeau_adore: [
        'Votre {objet} trône sur l’étagère du fournil, mon chou. J’y jette un œil en pétrissant, et je vous jure que la pâte lève mieux.',
        'Je parle encore de votre {objet} à toutes mes clientes. {npc:postiere} en est verte de jalousie, et ça, ça n’a pas de prix.',
      ],
      cadeau_deteste: [
        'Votre {objet}, l’autre jour… Même le chien du voisin n’en a pas voulu. Sans rancune, hein, mon chou ?',
        'J’ai rêvé de votre {objet}, cette nuit, et j’ai mal rêvé. La prochaine fois, apportez-moi des fraises, c’est plus simple.',
      ],
      aide: [
        'Je n’ai pas oublié le coup de main que vous m’avez donné. Chez les Aubert, on rend toujours ; en pain, le plus souvent.',
        'Quand je pense à tout ce que vous avez fait pour une boulangère qui parle trop… Je vous dois une fière chandelle, et une brioche.',
      ],
      toque_nuit: [
        'C’était vous, l’autre nuit, qui frappiez ? J’ai tenu le couteau à pain jusqu’à l’aube. Ne refaites jamais ça, mon chou.',
        'La nuit où vous avez frappé chez moi, j’ai cru que c’était Émile. J’ai mis une heure à me remettre à respirer.',
      ],
      coup: [
        'Vous m’avez frappée. Moi, devant mon four. Je vous sers encore parce que le pain ne se refuse à personne, c’est tout.',
        'J’ai encore la marque. {npc:fillette} m’a demandé ce que c’était, j’ai dit que je m’étais cognée au pétrin : je mens mal, et elle voit tout.',
      ],
      absence: [
        'Eh bien, vous revoilà ! J’ai failli envoyer le garde vous chercher. Il aurait refusé, mais j’ai failli.',
        'Tant de jours sans vous voir, mon chou ! J’ai fini par vendre votre miche à {npc:aubergiste}, et il ne la méritait pas.',
      ],
      victime: [
        'Je ne dors plus, depuis. J’ai mis du sel sur le seuil et une croix sur chaque miche : ça ne sert à rien, je sais, mais ça m’occupe les mains.',
        'Il y avait deux miches de trop sur l’étagère, ce matin. Je ne sais plus pour qui je les garde, mon chou.',
      ],
    },
    tenue: {
      arme: 'Doux Jésus, rangez-moi ça, mon chou ! Pas d’arme dans ma boutique, il y a une enfant dans la maison.',
      pelle: 'Une pelle ? Vous allez creuser où, avec ça ? Non, ne me dites pas le cimetière, ne me dites rien du tout.',
      potion: 'Qu’est-ce que c’est, cette fiole ? Ça vient de chez {npc:guerisseuse} ? Si ça guérit les mains gercées, j’en veux une douzaine.',
      animal_mort: 'Pas sur mon comptoir ! Il y a de la farine partout, et je ne fais pas de pâté, moi. Dehors, mon chou.',
      fleurs: 'Oh, les belles fleurs ! Émile m’en rapportait le dimanche, des coquelicots qui fanaient toujours avant d’arriver. C’était l’intention qui comptait.',
      poisson: 'Du poisson ! Tant que ce n’est pas une anguille, vous pouvez entrer. Si c’est une anguille, vous pouvez sortir.',
      lanterne_jour: 'Une lanterne en plein jour ? Vous cherchez un honnête homme, mon chou ? Ici, il n’y a que des femmes et du pain.',
      relique: 'Qu’est-ce que vous tenez là ? Ça sent la cave et l’ancien temps. Ma grand-mère aurait jeté du sel dessus… je peux ?',
      rien: 'Les mains vides ? Tenez, prenez ce croûton. Des mains vides dans ma boutique, ça me fend le cœur.',
    },
    chez_soi: {
      jour: 'Oh ! Vous êtes dans ma cuisine, mon chou ? La boutique, c’est devant ; ici, c’est chez moi. Bon, puisque vous êtes là, goûtez-moi ça, et ensuite, ouste !',
      nuit: 'Qui est là ?! … Vous ? Doux Jésus, j’ai failli vous assommer avec le rouleau. Sortez, vous allez réveiller la petite, et ne recommencez jamais. Jamais.',
    },
    activites: {
      travail: [
        'Allez, ma belle, lève. Lève pour moi. Tu ne vas pas me faire honte devant toute la ville…',
        'Une croix sur chaque miche… et une pour la route. On n’est jamais trop prudente.',
        'Doucement, la porte du four… Quinze ans qu’elle ferme juste. Il travaille bien, cet homme-là.',
      ],
      repas: [
        'Une tartine debout, comme d’habitude. Assise, je m’endormirais dans la soupe.',
        'Trop de sel. Ma mère aurait dit : trop de sel. Et ma mère avait raison, c’est le pire.',
        'Une part pour moi, une pour la petite… et une pour personne. Je sais. Je sais.',
      ],
      priere: [
        'Saint Honoré, patron des boulangers, faites que la pâte lève et que la petite rentre à l’heure. Dans l’ordre que vous voudrez.',
        'Je vous salue, Marie… et gardez Émile au chaud, où qu’il soit. Même si ce n’est pas chez vous.',
        'Seigneur, pardonnez-moi le sel sur le seuil. Je sais bien que c’est de la superstition. Mais vous, vous n’habitez pas ici.',
      ],
      promenade: [
        'Tiens, les coquelicots sont sortis. Émile en aurait déjà fait un bouquet, et il aurait fané en route.',
        'Bonjour, madame Pellerin ! … Elle ne m’a pas entendue. Ou elle boude, pour le pain trop cuit de jeudi.',
        'Je devrais marcher plus souvent. Mes jambes ont oublié qu’il existe autre chose que le fournil.',
      ],
      soir: [
        'Le volet, le verrou, le sel. Le volet, le verrou, le sel. Voilà.',
        '{npc:fillette} ! À la maison ! Le soleil touche le toit de l’église !',
        'Bonne nuit, Émile. Ta miche est sur l’étagère. Ne pétris pas trop fort, la petite dort.',
      ],
      pluie: [
        'Encore de la pluie ! La pâte va lever comme une folle. Au moins une qui s’amuse.',
        'Il pleut sur mon linge, évidemment. Le jour où j’étends, le ciel se souvient qu’il a de l’eau.',
        'La petite va rentrer trempée, et elle me dira qu’elle jouait avec son amie. Doux Jésus.',
      ],
    },
    discussions: [
      {
        avec: 'fillette',
        lignes: [
          ['boulangere', '{npc:fillette}, où étais-tu passée ? Tu as de la boue jusqu’aux genoux !'],
          ['fillette', 'Au puits de la place. Lise voulait me montrer un truc.'],
          ['boulangere', 'Je t’ai dit cent fois de ne pas te pencher sur les puits. Cent fois !'],
          ['fillette', 'Je me penchais pas, maman. C’est elle qui montait.'],
          ['boulangere', '… Va te laver les mains, et mets la table. Deux couverts, ma chérie. Deux.'],
          ['fillette', 'Je sais compter, maman. C’est toi qui te trompes, des fois.'],
        ],
      },
      {
        avec: 'grainetiere',
        lignes: [
          ['grainetiere', 'Alors, il est passé, ton forgeron, ce matin ?'],
          ['boulangere', 'Ce n’est pas « mon » forgeron, vieille mule. Il est venu chercher son pain, comme tout le monde.'],
          ['grainetiere', 'Tout le monde ne reste pas un quart d’heure à te regarder compter la monnaie. Neuf ans, ma fille. Le blé qu’on ne coupe pas, il pourrit sur pied.'],
          ['boulangere', 'C’est toi qui me dis ça ? Toi qui as dit non à Anselme à seize ans, et qui en parles encore tous les jours ?'],
          ['grainetiere', 'Justement. J’ai eu tout le temps de le regretter. Je ne te souhaite pas d’avoir autant de temps que moi.'],
          ['boulangere', '… Viens goûter ma brioche. Et tais-toi, pour une fois.'],
        ],
      },
      {
        avec: 'forgeron',
        lignes: [
          ['forgeron', 'Bonjour. Un pain.'],
          ['boulangere', 'Bonjour, mon chou ! Un pain, comme d’habitude. Le doré, ou le bien doré ?'],
          ['forgeron', 'Celui que vous voulez. … Vous avez de la farine. Là. Sur la joue.'],
          ['boulangere', 'Oh ! Doux Jésus, je dois ressembler à un Pierrot. Merci de me le dire, au moins, vous.'],
          ['forgeron', 'Ça vous va bien. La farine. Je veux dire… Au revoir.'],
          ['boulangere', 'Votre pain ! Vous oubliez votre pain ! … Il est parti. Un matin sur deux, il l’oublie, cet homme-là.'],
        ],
      },
    ],
    foi_lignes: [
      'Je vais à la messe tous les dimanches, et c’est moi qui fais le pain bénit. Le père {npc:cure} dit que c’est le plus beau du diocèse ; il le dit peut-être à tout le monde, mais moi, je le crois.',
      'Une croix sur la miche avant de la couper, jamais de pain à l’envers sur la table, et du sel sur le seuil les nuits d’orage. Ce n’est pas de la religion, mon chou, c’est de la prudence.',
      'Chaque semaine, je pose deux pains sur la tombe sans date, au fond du cimetière, celle qui porte le nom du vieil Anselme. Si c’est une vraie tombe, il faut du pain aux morts ; si ce n’en est pas une, ça ne lui fera pas de mal.',
      'La dernière gerbe de l’été, je la pends au-dessus du pétrin, pour la Mère des Moissons, et le curé fait semblant de ne pas la voir. Ceux d’en bas, par contre… Non. Ceux-là, on ne les nomme pas dans une maison où il y a du pain.',
    ],
    reaction_piete: {
      eglise: 'Toute la ville parle de vos prières à l’église, mon chou ! Le père {npc:cure} est aux anges. Tenez, un morceau de pain bénit que j’avais mis de côté.',
      anciens: 'Vous sentez le lait et les fleurs des champs : vous revenez de la pierre aux offrandes, hein ? Saluez la Mère des Moissons de la part de la boulangère. Pas trop fort, le curé a l’oreille fine.',
      dessous: 'Pardon, j’ai jeté du sel derrière vous, c’est plus fort que moi. Vous sentez le vieux puits, mon chou. Qu’est-ce que vous leur avez donné ? Et qu’est-ce qu’ils vous ont rendu ?',
    },
    fete_lignes: [
      'C’est ma fête aujourd’hui, mon chou ! Ne me demandez pas mon âge : l’âge d’une boulangère, c’est comme son levain, ça ne se dit pas. J’ai fait une tarte aux fraises, et j’en donne une part à qui me souhaite une bonne fête.',
      'Aujourd’hui, c’est ma fête. {npc:fillette} m’a fait un gâteau, enfin, elle a essayé : elle a confondu le sucre et le sel. Je l’ai mangé jusqu’à la dernière miette.',
    ],
    secret: 'Je vais vous dire un vrai secret, alors pas un mot. Je sais très bien pourquoi {npc:forgeron} reste un quart d’heure devant mon comptoir : je compte sa monnaie lentement, exprès, pour qu’il reste un peu plus. Mais tant qu’Émile n’a pas de tombe, je ne suis pas veuve. Je suis « la femme d’Émile », et je ne sais pas si j’ai le droit.',
  },

  // --------------------------------------------------------------------------
  fillette: {
    foi: 'aucune',
    devotion: 0,
    fete: 17,
    mythes: ['lise', 'feux_follets'],
    mythe_intro: [
      'Tu veux une histoire ? C’est Lise qui me l’a racontée, alors c’est une vraie.',
      'Assieds-toi par terre, comme au catéchisme. Et tu ris pas, sinon je m’arrête.',
    ],
    histoire: [
      {
        titre: 'Ma boîte à trésors', min: 0,
        texte: 'J’ai une boîte à trésors sous mon lit, une vieille boîte à sucre avec un couvercle qui grince. Dedans, y a le caillou rond, une plume de geai, ma dent de devant, un dessin de Lise et un bouton de la veste de papa. Le bouton, c’est le plus important, parce que c’est tout ce qui reste de papa, à part la chanson. Je l’ai trouvé dans une fente du plancher, à côté du pétrin, le jour de mes six ans. Maman sait pas que je l’ai. Si elle savait, elle pleurerait, et après elle ferait des brioches toute la nuit.',
      },
      {
        titre: 'Maman', min: 0,
        texte: 'Maman se lève quand il fait encore nuit, et elle parle à la pâte comme à une personne : « Allez, ma belle, lève. » Moi, elle m’appelle « mon trésor » quand elle est contente, et « {nom} Aubert ! » quand elle est fâchée. Quand elle rit très fort, c’est qu’elle est triste. Quand elle rit pas du tout, c’est qu’elle est fatiguée. Les grands croient que les enfants voient rien. Moi, je vois tout, mais je fais semblant, pour qu’elle soit tranquille.',
      },
      {
        titre: 'La chanson de papa', min: 1,
        texte: 'Maman dit que je peux pas me souvenir de papa, j’avais même pas un an. Pourtant, je connais sa chanson par cœur, celle qu’il chantait pour faire lever le pain. Personne me l’a apprise. La première fois que je l’ai chantée, maman est devenue toute blanche, et elle m’a demandé où je l’avais entendue. J’ai dit : « Sous le plancher. » Elle a plus jamais posé de questions sur la chanson.',
      },
      {
        titre: 'Lise', min: 2,
        texte: 'J’ai rencontré Lise devant {lieu:puits_ville}, l’été de mes six ans. Elle était assise sur la margelle, toute mouillée, et elle a dit : « Tu sens le pain chaud. Ça fait longtemps. » Elle habite au vieux puits, mais elle dit que les puits sont tous reliés en dessous, comme les rues. Elle a neuf ans, comme moi, mais elle a neuf ans depuis très, très longtemps. Des fois, elle me fait peur exprès, pour rire : elle rit pas, mais c’est pour rire.',
      },
      {
        titre: 'Les nuits rouges', min: 3,
        texte: 'Les nuits rouges, je fais semblant de dormir, et je regarde par le trou de la serrure. Maman descend au fournil avec les yeux fermés, et elle pétrit dans le noir, très bien, sans rien renverser. Après, elle sort dans la rue avec les autres, et ils marchent tous du même côté, comme quand la messe va commencer. Au matin, elle se souvient de rien, et il y a une miche de plus sur l’étagère. Je lui dis pas. Elle aurait peur d’elle.',
      },
      {
        titre: 'Jeannot Mercier', min: 4,
        texte: 'J’ai fait une grosse bêtise. Jeannot Mercier a dit devant tout le catéchisme que mon papa était parti avec une dame de la ville, parce que sa mère l’avait entendu dire dans {lieu:lavoir}. Alors je l’ai poussé dans l’eau, avec ses sabots et tout. Le père {npc:cure} m’a dit de demander pardon. J’ai demandé pardon au bon Dieu, mais pas à Jeannot : le bon Dieu, lui, il était pas mouillé. Depuis, Jeannot change de côté de la rue quand il me voit, et il regarde toujours un peu derrière moi.',
      },
      {
        titre: 'Quand je serai grande', min: 6,
        texte: 'Quand je serai grande, je serai boulangère comme maman, mais je ferai des pains en forme de tous les animaux, même ceux qui existent pas. Et maman se mariera avec {npc:forgeron}, parce qu’il répare tout et qu’il a des bras assez gros pour faire peur au monsieur du champ. Depuis que t’es là, maman chante en pétrissant. Faux, mais elle chante. Lise dit que rien change jamais, ici. Moi, je crois que si, un petit peu.',
      },
      {
        titre: 'Le monsieur blanc', min: 8,
        texte: 'Je vais te dire le plus grand secret de tous. Près du vieux puits, des fois, y a un monsieur tout blanc, très grand, qui a pas vraiment de visage, et il est gentil. Il dit que papa m’attend en bas, dans notre maison à l’envers, et qu’il pétrit tous les soirs en chantant ma chanson. Il dit que si je descends une nuit rouge, on remontera tous ensemble, et maman aussi, plus tard. Je lui ai pas encore dit oui. Il dit que c’est pas grave, qu’il est très patient.',
      },
    ],
    questions: [
      {
        id: 'fillette_q1', min: 0,
        texte: 'C’est quoi, ta couleur préférée ? Moi, c’est le jaune tournesol. Lise, c’est le noir, mais c’est parce qu’elle a pas le choix.',
        reponses: [
          { label: 'Le jaune, comme les tournesols. Comme toi.', amitie: 15, reaction: 'Comme moi ? Hi hi, alors on aime la même chose ! Je vais te faire un dessin tout jaune, avec un soleil qui a des yeux.' },
          { label: 'Je n’ai pas le temps pour ces bêtises.', amitie: -10, reaction: '… D’accord. Maman dit ça aussi, quand elle est fatiguée. Tu devrais faire une sieste, toi aussi.' },
          { label: 'Le vert crapaud. Avec des petits points.', amitie: 10, reaction: 'Beurk ! C’est pas une couleur, ça, c’est un animal ! … Bon, d’accord, c’est un peu joli.' },
        ],
        rappel: [
          'J’ai trouvé un bouton jaune sur la place. Je l’ai gardé pour toi, puisque t’aimes le jaune.',
          'T’as toujours pas le temps, aujourd’hui ? Moi, j’en ai plein, du temps. Je peux t’en prêter un peu.',
          'J’ai vu un crapaud vert avec des points, au lavoir ! Je l’ai appelé {prenom}. Il a l’air content.',
        ],
      },
      {
        id: 'fillette_q2', min: 1,
        texte: 'Quand t’avais mon âge, t’avais peur de quoi, toi ? Dis la vérité : les grands disent toujours « de rien », et c’est pas vrai.',
        reponses: [
          { label: 'Du noir. Et j’en ai encore un peu peur, tu sais.', amitie: 15, reaction: 'Moi aussi ! Enfin, pas du noir tout seul : de ce qu’il y a dedans. Je te prête mon caillou rond, si tu veux, il protège.' },
          { label: 'Je ne m’en souviens pas. Va jouer.', amitie: -10, reaction: 'Tu dis ça comme monsieur le maire. Il dit « va jouer », et après il regarde par la fenêtre si je suis bien partie.' },
          { label: 'D’une oie. Elle s’appelait Brigitte. Elle mordait.', amitie: 8, reaction: 'Hi hi, Brigitte ! Moi, les oies, j’ai pas peur. Les anguilles, si : elles ont des yeux de grand-mère.' },
        ],
        rappel: [
          'J’ai dit au caillou rond de te protéger du noir. Il a dit oui. Enfin, il a rien dit, mais c’est un caillou.',
          'Je suis allée jouer, comme t’avais dit. Toute seule. Enfin, avec Lise, mais pour les grands, ça compte pas.',
          'Tu crois qu’elle vit encore, Brigitte ? Les oies, ça vit plus longtemps que les gens ?',
        ],
      },
      {
        id: 'fillette_q3', min: 2,
        texte: 'Dis, tu crois que les morts nous entendent, quand on leur parle ? Pas ce que dit le curé. Ce que tu crois, toi.',
        reponses: [
          { label: 'Oui. Je crois qu’ils écoutent, surtout les chansons.', amitie: 15, reaction: 'Alors papa m’entend ! Je le savais. Ce soir, je chanterai plus fort, mais pas trop, sinon maman se réveille.' },
          { label: 'Non. Les morts ne sont plus là, ma grande.', amitie: 0, reaction: 'Si, ils sont là. Ils sont juste en dessous. T’as pas bien regardé, c’est tout.' },
          { label: 'Demande au curé, c’est son métier.', amitie: 5, reaction: 'Je lui ai déjà demandé si les morts savent nager. Il a dit oui, mais il ment pour me faire plaisir : ça se voit, son nez devient tout rouge.' },
        ],
        rappel: [
          'J’ai chanté plus fort, hier soir. Et quelqu’un a chanté avec moi, en dessous. Tu vois que t’avais raison.',
          'T’avais dit que les morts sont plus là. Je l’ai répété à Lise, et elle a ri. Elle rit jamais, d’habitude.',
          'Le père {npc:cure} m’a demandé pourquoi tout le monde lui envoie mes questions. J’ai dit que c’était toi.',
        ],
      },
      {
        id: 'fillette_q4', min: 4,
        texte: 'Si un jour je partais, très loin, là où on peut pas aller… tu me chercherais ?',
        reponses: [
          { label: 'Partout. Je te chercherais partout, et je te ramènerais.', amitie: 25, reaction: 'Même en bas ? Promis ? Alors la prochaine fois qu’on me demande, je dirai non.' },
          { label: 'Tu ne partiras nulle part. Arrête avec ces idées.', amitie: -15, reaction: 'Tu dis ça comme maman. Elle se fâche pour pas pleurer. Toi aussi, tu fais ça ?' },
          { label: 'Seulement si tu sèmes des miettes, comme le Petit Poucet.', amitie: 5, reaction: 'Des miettes, c’est facile, maman en a plein ! Mais les oiseaux les mangent. Je sèmerai plutôt des cailloux : j’ai déjà le rond.' },
        ],
        rappel: [
          'T’as promis de me chercher partout. Alors hier, quand on m’a demandé, j’ai dit non. Il a pas insisté, il a juste souri.',
          'Je parle plus de partir, t’as vu ? Je fais comme t’as dit. Mais j’y pense quand même, et penser, c’est pas partir.',
          'J’ai mis des cailloux dans mes poches. Au cas où. Comme ça, tu me retrouveras.',
        ],
      },
    ],
    humeurs: {
      joyeux: [
        'Bonjour ! J’ai trouvé une plume toute bleue, de geai ou d’ange, je sais pas encore.',
        'Coucou ! Maman m’a laissée faire les petits pains toute seule, et j’en ai fait un en forme de chat.',
        'T’es là ! J’ai sauté à cloche-pied depuis l’église jusqu’ici, cent douze sauts, tu veux essayer ?',
      ],
      triste: [
        'Salut. Les jumelles Pellerin disent que mon papa est parti avec une dame, c’est pas vrai, hein ?',
        'Je veux pas jouer. Lise est pas venue hier, et elle vient toujours, sauf quand elle est fâchée.',
        'Maman a pleuré dans le fournil. Elle croit que je l’entends pas, mais j’entends tout, moi.',
      ],
      fatigue: [
        'Bonjour… J’ai pas dormi : quelqu’un chantait sous le plancher, c’était joli mais c’était long.',
        'J’ai sommeil. Au catéchisme, j’ai dormi sur le livre, et le père {npc:cure} a cru que je priais très fort.',
        'Aaah… pardon. Maman m’a levée à cinq heures pour peser la farine, et les enfants, ça devrait dormir jusqu’à midi.',
      ],
      inquiet: [
        'Chut, parle doucement. Le monsieur du champ a bougé cette nuit : il est plus près de la ville qu’hier.',
        'T’as vu ? Les pigeons sont tous partis, et quand les pigeons partent, c’est qu’ils savent un truc.',
        'Maman sentait la terre, ce matin, pas la farine. Tu crois que c’est grave ?',
      ],
      agace: [
        'Pff. Maman veut pas que j’aille au puits, alors que tout le monde y va, même le curé !',
        'Je boude, tu peux me parler mais je réponds pas… Bon, d’accord : bonjour.',
        'Les jumelles Pellerin disent que je parle toute seule. Je parle pas toute seule, je parle à quelqu’un qu’elles voient pas !',
      ],
    },
    souvenirs: {
      cadeau_adore: [
        'Ton cadeau, je l’ai mis dans ma boîte à trésors, avec une étiquette : « {objet} ». C’est le trésor numéro un, et le caillou rond est un peu vexé.',
        'Tous les soirs, je dis bonne nuit à ton cadeau. Je l’appelle par son nom, « {objet} », et Lise est un peu jalouse.',
      ],
      cadeau_deteste: [
        'Ton cadeau, celui qui s’appelle « {objet} », je l’ai donné aux chats. Même eux, ils en ont pas voulu.',
        'Maman a jeté ton cadeau, « {objet} », sur le fumier. Elle a dit « le pauvre chou », mais je sais pas si c’était toi ou le cadeau.',
      ],
      aide: [
        'Tu m’as aidée, l’autre fois. Lise dit que les grands qui aident les enfants, ils vont jamais en bas. C’est une bonne nouvelle, non ?',
        'Je t’ai fait un dessin où tu m’aides. T’as des bras très longs, dessus : c’est normal, c’est pour aider.',
      ],
      toque_nuit: [
        'C’était toi qui toquais, l’autre nuit ? J’ai pas ouvert. J’ai demandé si tu connaissais la chanson, et personne a répondu, alors c’était peut-être pas toi.',
        'Maman a crié quand t’as toqué, la nuit, et après elle a pas dormi. Moi si : je me suis dit que c’était toi, ça fait moins peur.',
      ],
      coup: [
        'Tu m’as fait mal. Les grands, ça tape pas les enfants. Sauf les méchants, dans les histoires.',
        'J’ai plus peur du monsieur du champ, maintenant. J’ai peur de toi. Lise dit que c’est mieux : comme ça, je fais attention.',
      ],
      absence: [
        'T’étais où ? J’ai demandé à tout le monde, même aux tombes du cimetière, et elles savaient pas.',
        'Ça fait des jours et des jours ! J’avais peur que le puits te prenne. Lise a dit non. Elle a dit : « Pas encore. »',
      ],
      victime: [
        'Tout le monde parle tout bas, depuis. Maman a fermé les volets en plein jour : elle croit que les volets, ça arrête quelque chose.',
        'Le père {npc:cure} a dit une messe. J’ai pas pleuré. Lise dit que c’est pas la peine de pleurer ceux qui sont juste en dessous.',
      ],
    },
    tenue: {
      arme: 'Ooh, c’est une vraie ? C’est pour le monsieur du champ ? Faut viser le visage. Enfin, la toile.',
      pelle: 'Tu vas creuser un trou ? Si tu creuses trop loin, tu vas tomber chez Lise. Dis-lui bonjour de ma part.',
      potion: 'C’est quoi, ta bouteille qui brille ? C’est comme le bonbon de la dame de la forêt ? Ça fait voir les choses en vrai ?',
      animal_mort: 'Oh non… La pauvre bête. Faut chanter, quand on enterre une bête, sinon elle trouve pas le chemin.',
      fleurs: 'Des fleurs ! C’est pour moi ? … Non ? Alors pose-les sur le puits, pour Lise. Elle les prendra cette nuit.',
      poisson: 'Beurk, ça sent ! C’est pas une anguille, au moins ? Les anguilles, c’est des serpents qui ont appris à nager.',
      lanterne_jour: 'Pourquoi t’as une lanterne ? Il fait jour ! … Ah. Tu vas dans le noir. À la mine ? Dans le puits ?',
      relique: 'Oh ! Lise a dit « chut », tout d’un coup. C’est à cause de ton truc tout vieux : il fait peur à quelqu’un.',
      rien: 'T’as rien dans les mains ? Moi non plus ! On joue à « rien dans les mains, rien dans les poches » ?',
    },
    chez_soi: {
      jour: 'Qu’est-ce que tu fais dans notre maison ? Maman dit qu’on entre pas chez les gens sans toquer. Même les gens gentils.',
      nuit: 'Chut ! Maman dort. Qu’est-ce que tu fais là, dans le noir ? … Tu connais la chanson ? Non ? Alors t’es peut-être pas toi. Va-t’en. S’il te plaît.',
    },
    activites: {
      travail: [
        'Un petit pain chat, un petit pain chat, un petit pain… lapin. Il a raté ses oreilles.',
        'Maman ! J’ai pesé la farine ! Enfin, j’ai pesé la farine, et un peu le chat.',
        '« Qui a créé le monde ? » Dieu. « Et qui a creusé le monde d’en dessous ? » … Ça, c’est pas dans le livre.',
      ],
      repas: [
        'Je garde la croûte pour Lise. Elle aime pas la mie, elle dit que ça ressemble à la vase.',
        'Une tartine de confiture, une tartine de confiture, et une tartine de… confiture.',
        'Des fois, maman met trois assiettes sans faire exprès. Moi, je dis rien. Je mange dans la mienne.',
      ],
      priere: [
        'Mon Dieu, bénissez maman, et papa où qu’il soit, et Lise. Lise dit que vous l’entendez pas : prouvez-lui.',
        'Amen. … Voilà, maman, j’ai prié. Je peux aller jouer ?',
        'Je vous salue Marie, pleine de grâce… Lise, elle dit la sienne à l’envers. Ça commence par « amen ».',
      ],
      promenade: [
        'Faut pas marcher sur les lignes entre les pavés, sinon le monsieur du champ gagne un point.',
        'Bonjour les pigeons ! Un, deux… douze. Toujours douze. Le douzième a des yeux bizarres.',
        'Je vais dire bonjour aux tombes. Elles s’ennuient : personne leur parle, à part le curé, et il parle latin.',
      ],
      soir: [
        'Le soleil touche le toit de l’église… Maman va crier mon prénom. Trois, deux, un…',
        'Y a des petites lumières au-dessus de l’île du marais. C’est les noyés qui gardent leurs trésors. Faut surtout pas leur faire coucou.',
        'Bonne nuit, la lune. T’es blanche, ce soir ? Reste blanche, s’il te plaît.',
      ],
      pluie: [
        'Splash ! Cette flaque-là, elle est profonde. Y a quelqu’un au fond qui me regarde.',
        'Il pleut sur les tombes. La dame de la forêt dit que les morts ont moins soif, quand il pleut.',
        'La pluie écrit des choses sur la vitre. Je sais pas encore lire l’écriture de la pluie. Lise, elle sait.',
      ],
    },
    discussions: [
      {
        avec: 'cure',
        lignes: [
          ['fillette', 'Mon père, est-ce que Dieu entend aussi ceux qui sont en dessous ?'],
          ['cure', 'Dieu entend tout, mon enfant. Les vivants, les morts, et les âmes du purgatoire.'],
          ['fillette', 'Non, pas les morts. Ceux d’en dessous. Ceux qui marchent la tête en bas.'],
          ['cure', '… Qui t’a parlé de cela, mon enfant ? Ta mère ?'],
          ['fillette', 'Personne. Enfin, un monsieur tout blanc, près du puits. Il est gentil. Il dit que vous le connaissez très bien.'],
          ['cure', 'Récite-moi ton Pater Noster. Tout de suite, en entier, et ne t’arrête pas, quoi que tu entendes.'],
        ],
      },
      {
        avec: 'garde',
        lignes: [
          ['fillette', 'Monsieur le garde ! Pourquoi vous levez les ponts, le soir ?'],
          ['garde', 'Pour que rien n’entre en ville pendant la nuit, mademoiselle. Article premier du règlement.'],
          ['fillette', 'Mais ceux qui marchent sur le pont quand il est levé, ils sont déjà dedans, non ?'],
          ['garde', 'Qui… Qui t’a dit qu’on marchait sur le pont ?'],
          ['fillette', 'Personne. Je les entends de ma fenêtre. Ils montent tout en haut, et après, ils attendent.'],
          ['garde', 'Rentre chez ta mère. Tout de suite. Et ferme ta fenêtre. C’est… c’est le règlement.'],
        ],
      },
      {
        avec: 'forgeron',
        lignes: [
          ['fillette', 'Docteur des choses ! J’ai un malade : le moulin à café de maman. Il veut plus tourner.'],
          ['forgeron', 'Montre. … Une vis. Deux minutes.'],
          ['fillette', 'Tu le rapporteras toi-même ? Maman sera là. Elle a mis sa robe bleue, aujourd’hui.'],
          ['forgeron', '… Pourquoi tu me dis ça ?'],
          ['fillette', 'Pour rien. Elle la met jamais, la robe bleue, sauf le dimanche. Et c’est pas dimanche.'],
          ['forgeron', 'Hm. Attends-moi là. Je vais… me laver les mains.'],
        ],
      },
    ],
    foi_lignes: [
      'Le père {npc:cure} dit que Dieu voit tout. Alors il a vu papa sortir, ce soir-là. Pourquoi il l’a pas fait rentrer ?',
      'Je fais ma prière parce que maman regarde. Après, quand elle est partie, je parle à Lise. Lise, au moins, elle répond.',
      'La dame de la forêt dit que les Anciens habitent dans les arbres, dans l’eau et dans le blé. J’ai demandé s’ils sont gentils. Elle a dit : « Avec ceux qui sont polis. » Alors maintenant, je dis bonjour aux arbres.',
      'Ceux d’en bas, faut pas dire leur nom. Moi, je le connais pas, alors je risque rien. Le monsieur blanc, lui, il le connaît. Il a dit qu’il me l’apprendrait quand je serai plus grande.',
    ],
    reaction_piete: {
      eglise: 'T’as prié longtemps, hein ? T’as les genoux tout sales. Tu demandes quoi, au bon Dieu ? Moi, je lui demande toujours la même chose, et il répond toujours pareil : rien.',
      anciens: 'Tu sens la forêt et le lait. T’as vu le Cerf Blanc ? Tu lui as dit bonjour poliment ? Faut être poli, avec les Anciens, la dame de la forêt l’a dit.',
      dessous: 'Oh ! Tu sens comme le puits, maintenant. Le monsieur blanc m’a dit que tu lui avais fait une promesse. Il a dit qu’on pourrait jouer tous les trois, bientôt.',
    },
    fete_lignes: [
      'C’est mon anniversaire ! Maman a écrit mon prénom en sucre sur une brioche. Lise, elle a jamais d’anniversaire : elle a toujours le même âge.',
      'Aujourd’hui, c’est ma fête ! T’as pas de cadeau ? C’est pas grave, tu peux me chanter une chanson à la place. N’importe laquelle. Sauf celle de papa : celle-là, elle est à moi.',
    ],
    secret: 'Je te dis un secret, mais tu le répètes à personne. Surtout pas à maman. Un soir, j’ai laissé tomber mon ruban rouge dans le puits de la place, pour papa. Le lendemain matin, il était noué autour de la miche de trop, sur l’étagère.',
  },

  // --------------------------------------------------------------------------
  forgeron: {
    foi: 'anciens',
    devotion: 1,
    fete: 25,
    mythes: ['frappeurs', 'bete_des_combes'],
    mythe_intro: [
      'Mon grand-père la racontait mieux que moi. Écoutez quand même.',
      'Une histoire, courte : je ne sais pas les faire longues. Approchez-vous du feu.',
    ],
    histoire: [
      {
        titre: 'Le soufflet', min: 0,
        texte: 'À six ans, je tirais le soufflet. Mon père frappait, moi je tirais, et on ne se parlait pas : pas besoin. Ma mère était une Grosjean, la tante de mon cousin {npc:garde}. Lui, à cinq ans, il avait déjà peur du noir. Le soir, je le raccompagnais jusqu’à sa porte, et je rentrais en sifflant, pour qu’il croie que je n’avais pas peur, moi.',
      },
      {
        titre: 'Deux trempes', min: 0,
        texte: 'L’enclume, on l’appelle la Vieille : mon arrière-grand-père l’a fait venir de Saint-Étienne, quatre jours de charrette. Un Marchal a forgé l’épieu du chasseur qui a blessé la Bête des Combes. Le fer a cassé dans la bête. « Mauvais fer », ont dit les gens, et ils l’ont répété pendant cent ans. Depuis, chez nous, on trempe deux fois. Même un clou.',
      },
      {
        titre: 'La porte du four', min: 1,
        texte: 'Elle avait des tresses, à l’école, et moi quatre ans de plus et pas un mot. En quatre-vingt-quatorze, je m’étais décidé : je lui parlerais au printemps. En mars, un compagnon est arrivé, avec sa canne à rubans, et elle a ri à sa première phrase. Pour leur mariage, j’ai forgé la porte du four. Elle ferme encore bien. Je vérifie chaque matin, en achetant mon pain.',
      },
      {
        titre: 'Octobre quatre-vingt', min: 2,
        texte: 'Le trente octobre quatre-vingt, j’avais quinze ans. La terre a tremblé sous la forge, et les fers sont tombés du mur. On a creusé trois jours et trois nuits, avec les pioches que mon père avait forgées. La troisième nuit, on a entendu frapper, de l’autre côté des éboulis. Le quatrième matin, la compagnie a dit d’arrêter, et elle a fermé la mine. Quatorze cercueils vides, et des fleurs dessus, beaucoup de fleurs : depuis, je ne supporte plus leur odeur.',
      },
      {
        titre: 'Trois coups, un temps', min: 3,
        texte: 'Les mineurs avaient un signal, pour quand la roche les prenait : trois coups, un temps, trois coups. Ça veut dire « on est vivants ». Certaines nuits, c’est ce que j’entends, sous la forge. Alors je prends le marteau, et je réponds sur la Vieille. Ce qui me fait peur, ce n’est pas qu’on frappe. C’est que, parfois, on me répond avant que j’aie frappé.',
      },
      {
        titre: 'Le mal de ventre', min: 4,
        texte: 'Ce matin-là, je devais descendre avec mon père, pour la première fois. J’ai dit que j’avais mal au ventre. Je n’avais pas mal : j’avais peur du noir, comme mon cousin, et je ne l’ai jamais dit à personne. Mon père m’a ébouriffé les cheveux, et il est descendu sans moi. Quand je me moque de mon cousin, c’est moi que je vise.',
      },
      {
        titre: 'Le docteur des choses', min: 6,
        texte: '{npc:fillette} m’apporte tout ce qui casse chez elle : un moulin à café, une boucle de soulier, une poupée qui a perdu un bras. Elle m’appelle « docteur des choses ». Le dimanche, elle s’assoit sur le seuil de la forge et me regarde travailler ; elle ne dit rien, moi non plus, et c’est bien. Je me dis que si un jour… Voilà. Un jour.',
      },
      {
        titre: 'Le soir de septembre', min: 8,
        texte: 'Le soir où Émile est sorti, je l’ai vu passer devant la forge avec sa lanterne, et il m’a fait signe. J’ai pensé à le suivre. Et puis j’ai pensé autre chose, une seconde : « Et s’il ne revenait pas. » Je suis resté assis. Neuf ans que j’achète un pain chaque matin et que je reste un quart d’heure devant elle, pour le lui dire. Je ne dis jamais rien : je prends mon pain, et je m’en vais.',
      },
    ],
    questions: [
      {
        id: 'forgeron_q1', min: 0,
        texte: 'Vos outils. Vous les nettoyez, le soir ?',
        reponses: [
          { label: 'Tous les soirs. Graissés, affûtés, pendus au mur.', amitie: 15, reaction: 'Bien. Un outil soigné, c’est une main de plus. Revenez me voir.' },
          { label: 'Quand j’y pense. C’est de la ferraille.', amitie: -10, reaction: 'De la ferraille. Hm. C’est mon métier, la ferraille : vous en rachèterez souvent, alors.' },
          { label: 'Non, mais je leur parle gentiment. Ça compte ?', amitie: 8, reaction: '… Mon père parlait à son enclume. Elle lui répondait mieux que ma mère. Ça compte.' },
        ],
        rappel: [
          'Montrez vos outils. … Propres. Bien.',
          'Votre pioche. Rouillée. Je le savais.',
          'Vous leur parlez toujours, à vos outils ? Moi, je dis bonsoir à la Vieille. Ne le répétez pas.',
        ],
      },
      {
        id: 'forgeron_q2', min: 1,
        texte: 'Mon cousin. {npc:garde}. Vous le trouvez comment ?',
        reponses: [
          { label: 'Courageux. Il a peur, et il reste quand même.', amitie: 15, reaction: 'Oui. C’est ça. Personne ne le voit, vous si : merci.' },
          { label: 'Ridicule. Un garde qui a peur du noir.', amitie: -20, reaction: 'Moi, je peux le dire. C’est mon cousin. Vous, non.' },
          { label: 'Sa moustache me fait peur. Le reste, ça va.', amitie: 8, reaction: 'Hm. Il la cire tous les soirs, il croit que ça impressionne. … Ça n’impressionne pas.' },
        ],
        rappel: [
          'J’ai répété à mon cousin : « courageux ». Il a rougi comme une braise. Depuis, il se tient plus droit.',
          'Mon cousin a levé les ponts à l’heure, hier soir, dans le noir. Comme tous les soirs. Je dis ça pour vous.',
          'Mon cousin a raccourci sa moustache. Je ne sais pas qui lui a raconté. Pas moi.',
        ],
      },
      {
        id: 'forgeron_q3', min: 2,
        texte: 'La nuit. Vous entendez frapper ? Sous la terre ?',
        reponses: [
          { label: 'Oui. Je croyais que ça ne frappait que chez moi.', amitie: 15, reaction: 'Non. Ça frappe partout. On est deux, alors : ça aide un peu.' },
          { label: 'Non. Vous devriez boire moins à l’auberge.', amitie: -10, reaction: 'Je ne bois pas. Je paie mal, mais je ne bois pas. Laissez.' },
          { label: 'Je dors comme une souche. Même l’orage n’y fait rien.', amitie: 5, reaction: 'Tant mieux. Gardez ça. Ne vous réveillez pas, surtout pas.' },
        ],
        rappel: [
          'Cette nuit, ça a frappé. J’ai pensé : chez vous aussi. Je me suis rendormi.',
          'Pas bu une goutte, hier. Ça a frappé quand même. Pour votre information.',
          'Vous dormez toujours comme une souche ? Bien. Je veille pour deux.',
        ],
      },
      {
        id: 'forgeron_q4', min: 4,
        texte: 'Une question. Pas pour moi. Pour… quelqu’un. Si une femme vous plaisait, et qu’elle avait été à un autre, vous feriez quoi ?',
        reponses: [
          { label: 'Je lui parlerais. Un peu chaque jour. Pas que de pain.', amitie: 25, reaction: 'Pas que de pain… Il faudrait des mots, alors. Je vais y penser longtemps, mais j’y pense.' },
          { label: 'Rien. Il y a des places qu’on ne prend pas.', amitie: 0, reaction: '… Oui. C’est ce que je me dis chaque matin. Ça ne marche pas.' },
          { label: 'J’achèterais une brioche. Au lieu d’un pain.', amitie: 10, reaction: 'Une brioche. … Ça se remarquerait, tout le monde saurait. Vous croyez ?' },
        ],
        rappel: [
          'Ce matin, j’ai dit trois phrases. Pas sur le pain : sur le temps qu’il fait. C’est un début.',
          'Des places qu’on ne prend pas. Vous aviez raison. Je reste debout devant le comptoir : ce n’est pas une place.',
          'J’ai acheté une brioche. Elle a levé les yeux, longtemps. Je suis parti très vite, mais j’ai acheté la brioche.',
        ],
      },
    ],
    humeurs: {
      joyeux: [
        'Bonjour. Belle chauffe, ce matin : le fer chante, et moi presque.',
        'Ah, c’est vous. Un café noir, mais chaud ?',
        'Bonne journée, je le sens. Ça n’arrive pas souvent : profitez-en avec moi.',
      ],
      triste: [
        'Bonjour. Pas envie de parler, moins que d’habitude.',
        'Mon père aurait eu soixante-dix ans aujourd’hui. Voilà, c’est tout.',
        'Le fer ne prend pas la trempe, aujourd’hui. Moi non plus.',
      ],
      fatigue: [
        'Pas dormi : ça frappait. Bonjour quand même.',
        'Les bras lourds, le marteau aussi. Dites vite.',
        'Trois nuits sans sommeil. Je vais finir par forger en dormant, si ce n’est pas déjà le cas.',
      ],
      inquiet: [
        'Vous ne venez pas de la mine, au moins ? N’y allez pas, ces jours-ci.',
        'Mon enclume était chaude, ce matin, et le feu était éteint depuis la veille. Bonjour.',
        'Mon cousin jure qu’il a levé le pont nord, hier soir. À l’aube, il était baissé.',
      ],
      agace: [
        'Quoi ? Pardon, journée de travers.',
        '{npc:aubergiste} m’a encore parlé de son ardoise, devant tout le monde. Ses marmites, je les répare gratis : il oublie.',
        'Un client m’a rapporté une hache, « elle ne coupe pas ». Il coupait avec le dos.',
      ],
    },
    souvenirs: {
      cadeau_adore: [
        'Votre {objet}, au-dessus de l’enclume. Chaque matin, un coup d’œil. Merci encore.',
        'J’ai repensé à votre {objet}. Personne ne m’avait rien offert depuis longtemps. Voilà.',
      ],
      cadeau_deteste: [
        'Votre {objet}. Toujours pas compris pourquoi. Je ne demande pas.',
        'Votre {objet}, l’autre jour : la forge en a fait son affaire. Rien de personnel.',
      ],
      aide: [
        'Vous m’avez aidé. Je n’oublie pas. Si un jour il vous faut des bras, venez.',
        'Ce que vous avez fait pour moi… Je ne sais pas dire merci. Apportez-moi vos outils, je les affûte gratis : c’est comme ça que je dis merci.',
      ],
      toque_nuit: [
        'L’autre nuit, à ma porte, c’était vous ? J’avais le marteau à la main. Heureusement que je n’ai pas ouvert.',
        'Ne frappez plus chez moi, la nuit. Je ne réponds pas aux coups : j’en entends assez sous la terre.',
      ],
      coup: [
        'Vous m’avez frappé. Je n’ai pas rendu le coup. Ne comptez pas là-dessus une deuxième fois.',
        'On ne frappe pas un forgeron. On frappe le fer. Rappelez-vous ça.',
      ],
      absence: [
        'Longtemps. J’ai demandé de vos nouvelles à mon cousin, il ne savait rien. Bon. Vous revoilà.',
        'Hm. Vous revoilà. La forge était calme. Trop calme.',
      ],
      victime: [
        'J’ai forgé des verrous toute la semaine, pour tout le monde, gratis. Ça n’y changera rien. Je forge quand même.',
        'On a perdu quelqu’un. Encore. Je connais ce silence : c’était le même en quatre-vingt.',
      ],
    },
    tenue: {
      arme: 'Montrez. … Bien entretenue. On n’entre pas armé dans une forge, en principe. Mais je vous connais.',
      pelle: 'Une pelle. Pour creuser où ? … Pas à la mine. Promettez.',
      potion: 'Ça vient de la vieille, dans les bois ? Hm. Je ne bois pas ce que je ne sais pas forger.',
      animal_mort: 'Une bête morte. Tuée proprement ? Bien. Il faut que ça meure proprement.',
      fleurs: 'Des fleurs. En quatre-vingt, on en a mis sur quatorze cercueils vides. Rangez-les, s’il vous plaît.',
      poisson: 'Du poisson. Ça sent le lac. Le vin de {npc:aubergiste} aussi. Coïncidence.',
      lanterne_jour: 'Une lanterne, à midi. Bien. Vous avez compris : toujours la lanterne.',
      relique: 'Ça. D’où ça sort ? … Ça a été forgé, mais pas par un homme d’ici. Pas par un homme, peut-être. Rangez ça.',
      rien: 'Les mains vides. Ça m’inquiète toujours : les mains, c’est fait pour tenir quelque chose.',
    },
    chez_soi: {
      jour: 'Vous êtes chez moi. Pas à la forge : chez moi. Il y a une différence. Dehors.',
      nuit: 'Pas un geste. … Vous ? La nuit, chez moi ? J’ai failli frapper. Sortez, et ne refaites jamais ça.',
    },
    activites: {
      travail: [
        'Cerise. Orange. Jaune… Maintenant.',
        'Un clou. Un autre. Six cents clous pour le toit de l’église : le Bon Dieu est gourmand.',
        'Allez, la Vieille. Encore un fer, et on se repose. Enfin, moi.',
      ],
      repas: [
        'Pain. Fromage. Silence. C’est bien.',
        'Le ragoût de Bonnefoy. Trop salé. Je ne lui dirai pas.',
        'Une moitié pour moi. L’autre pour en bas. Comme mon grand-père.',
      ],
      priere: [
        'Petits gens de la roche, voilà le pain, voilà le lait. Guidez les honnêtes. Égarez les autres.',
        'Trois coups. Un temps. Trois coups. … Rien. Tant mieux. Tant pis.',
        'Saint Éloi, patron des forgerons… Je ne vous connais pas bien. Ma mère vous aimait. Ça devrait suffire.',
      ],
      promenade: [
        'La route du nord. Le chemin de la mine. Non. Pas aujourd’hui.',
        'Des fers à cheval sur toutes les portes, ouverts vers le haut. Bien. Celui-là, non : je repasserai le retourner.',
        'Le vent tourne. La girouette de mon père aussi, dans l’autre sens. Comme toujours.',
      ],
      soir: [
        'Le feu couvert. La porte. Le verrou. Le deuxième verrou. Bon.',
        'Un verre chez Bonnefoy. Un seul. Sur l’ardoise. Il râlera, ça l’occupe.',
        'La nuit tombe. Ça va frapper. Dors, Marchal. Dors avant que ça frappe.',
      ],
      pluie: [
        'Pluie. Les outils rouillent. Tout graisser.',
        'Quand il pleut, l’eau monte dans la mine. Les galeries du fond sont noyées. Avec eux.',
        'Il pleut dans la forge. Le fer siffle sous les gouttes, comme s’il avait peur de l’eau.',
      ],
    },
    discussions: [
      {
        avec: 'garde',
        lignes: [
          ['garde', 'Cousin. Tu as entendu, cette nuit ? Vers trois heures ?'],
          ['forgeron', 'Oui.'],
          ['garde', 'Des pas, sur le pont sud. Le pont était levé. Je n’ai pas bougé de la guérite : c’est le règlement.'],
          ['forgeron', 'Tu as bien fait.'],
          ['garde', 'Tu crois ? Des fois, je me dis que le règlement, c’est juste une manière d’avoir peur assis.'],
          ['forgeron', 'Avoir peur et rester, ça s’appelle du courage. Ce soir, je te raccompagne. Comme avant.'],
        ],
      },
      {
        avec: 'aubergiste',
        lignes: [
          ['aubergiste', 'Ah, voilà mon plus fidèle client ! Et mon plus fidèle débiteur ! Trois mois d’ardoise, mon vieux, parole de Bonnefoy.'],
          ['forgeron', 'Ta marmite. Réparée. Ta broche. Réparée. Ta grille. Réparée.'],
          ['aubergiste', 'Oui, bon, d’accord, mais une grille, ça ne se boit pas ! Tandis que mon vin…'],
          ['forgeron', 'Ton vin a le goût du lac.'],
          ['aubergiste', 'Nom d’une pipe, encore le lac ! Un jour, tu me diras ce que tu as contre le lac.'],
          ['forgeron', 'Il a pris assez de monde. Pas besoin qu’il vienne jusque dans les verres. Sers-moi. Sur l’ardoise.'],
        ],
      },
      {
        avec: 'cure',
        lignes: [
          ['cure', 'Maître Marchal. Les clous pour la toiture avancent-ils ? Il pleut sur l’autel.'],
          ['forgeron', 'Six cents. Demain.'],
          ['cure', 'Deo gratias. On me dit que vous portez encore du pain à la bouche de la mine, le dimanche.'],
          ['forgeron', 'Pendant votre messe. Comme ça, on prie en même temps.'],
          ['cure', 'Ce n’est pas la même prière, mon fils.'],
          ['forgeron', 'Non. Mais c’est le même pain. Celui de la boulangerie.'],
        ],
      },
    ],
    foi_lignes: [
      'Chez les Marchal, on laisse du pain et du lait aux Frappeurs. Mon grand-père les descendait tout au fond, dans une niche creusée exprès. Moi, je les pose à l’entrée de la mine. Je n’ai pas son courage.',
      'L’église, j’y vais pour les enterrements, et pour réparer la grille. Le curé ne m’en demande pas plus. C’est un homme bien.',
      'La vieille des bois prie la forêt, le lac, le blé. Moi, c’est la roche. Elle ne répond pas souvent, mais quand elle répond, on l’entend.',
      'Ceux d’en bas. Mon père disait : on creuse pour le fer, pas plus bas. Plus bas, ce n’est plus de la roche. C’est leur plafond.',
    ],
    reaction_piete: {
      eglise: 'On dit que vous priez beaucoup. Bien. Priez pour mon père aussi, s’il vous reste de la place. Moi, je ne sais pas faire.',
      anciens: 'On dit que vous portez des offrandes aux pierres, au lac. Bien. N’oubliez pas la roche : un bout de pain à la mine. Ils sont petits, mais ils se vexent.',
      dessous: 'Reculez. … Vous sentez le fond. Pas la mine : le dessous de la mine. Mon père disait qu’on ne creuse pas plus bas que le fer. Vous, vous avez creusé.',
    },
    fete_lignes: [
      'Ma fête. Oui. Comment vous savez ? … Mon cousin, évidemment. Merci. On n’en parle plus.',
      'Ce matin, {npc:boulangere} m’a donné une brioche. Gratis. Elle a dit « bonne fête ». Je ne savais pas qu’elle savait. Je vais la manger lentement.',
    ],
    secret: 'La première bague, je l’ai forgée en quatre-vingt-quatorze. En fer : je n’avais pas d’or. Elle pend à une ficelle, sous ma chemise, depuis seize ans. Je ne l’ai jamais enlevée.',
  },
});
