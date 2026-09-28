// Vie des habitants : le maire, le curé, le garde
Object.assign(NPC_LIFE, {
  // --------------------------------------------------------------------------
  maire: {
    foi: 'eglise', devotion: 1, fete: 6,
    mythes: ['tresor_valmont', 'treize_pierres'],
    mythe_intro: [
      'Asseyez-vous, {fermier}. Ce que je vais vous raconter ne figure dans aucun registre de la commune, et je vous saurais gré de ne pas me citer.',
      'Notez bien que je n’y crois pas : la République ne croit qu’aux actes notariés. Mais un maire se doit de connaître le patrimoine de sa commune, même celui qui n’existe pas.',
    ],
    histoire: [
      { titre: 'Sous la table du conseil', min: 0, texte: 'J’ai appris à marcher dans la salle du conseil, au rez-de-chaussée de {lieu:mairie}. Mon père présidait, et moi, sous la grande table, je comptais les souliers : onze paires bien cirées, et celle du vieux Pelletier, qui ne touchait jamais le plancher. Ça sentait la cire à cacheter, le poêle et le tabac gris. Quand j’ai eu sept ans, mon père s’est mis à me faire réciter l’arrêté des ponts, chaque soir, debout sur une chaise. Il ne disait jamais « bien ». Il disait « encore ».' },
      { titre: 'L’écharpe trop longue', min: 0, texte: 'J’ai ceint l’écharpe en 1888, le lendemain de l’enterrement de mon père. Elle était trop longue : il avait une tête de plus que moi, et la couturière a dû la raccourcir d’un empan. Je n’ai jamais osé jeter le bout coupé ; il dort dans une enveloppe, au fond de mon bureau. Depuis, j’ai marié cent quarante couples, inscrit plus de décès que de naissances, et écrit à la préfecture tous les lundis sans recevoir une seule réponse. Je continue : une commune dont le maire cesse d’écrire est une commune qui cesse d’exister.' },
      { titre: 'Hélène', min: 1, texte: 'Elle s’appelle Hélène. C’était la fille du pharmacien du bourg voisin, et elle était venue à la Saint-Aubin de 1877 voir à quoi ressemblait un village qui lève ses ponts à neuf heures. J’ai fait un discours sur l’estrade, et elle a ri, pas aux bons endroits : aux vrais. Nous nous sommes mariés au printemps suivant. Chaque premier dimanche de septembre, elle faisait une tarte aux mirabelles qu’elle m’interdisait de partager avec le conseil municipal.' },
      { titre: 'Une nuit d’octobre', min: 2, texte: 'Le 19 octobre 1897, Hélène s’est levée vers deux heures du matin. J’ai entendu le parquet, l’escalier, le verrou ; je me suis dit qu’elle avait soif, et je me suis rendormi. Au matin, la porte de la rue était ouverte, la clé sur la serrure côté rue, et son manteau gris pendait encore à la patère. On a sondé les douves et battu la campagne pendant trois jours. Au registre, j’ai écrit « départ volontaire » ; dans l’autre, celui du tiroir, je n’ai rien écrit du tout, car tant que son nom n’y est pas, elle est seulement partie.' },
      { titre: 'Le recensement', min: 3, texte: 'Le lendemain de chaque nuit rouge, je refais le recensement, comme l’exige l’article quatre de l’arrêté. Je frappe aux portes, mon registre sous le bras, et je compte les lits, les bols, les enfants. Il y a toujours un compte qui ne tombe pas juste : parfois il manque quelqu’un, et parfois, c’est pire, il y a quelqu’un de trop, qui me sourit et me donne son nom comme s’il l’avait toujours porté. Je dors mal, depuis des années. Certains matins, je trouve mes souliers vernis crottés au pied du lit, et je ne sais plus si j’ai rêvé mes tournées.' },
      { titre: 'Les bancs verts', min: 4, texte: 'Trois semaines avant de disparaître, le vieil Anselme est venu à la mairie, sa casquette à la main. Il voulait qu’on scelle {lieu:vieux_puits} sous une dalle, aux frais de la commune, avec une croix dessus. J’ai souri, je lui ai parlé de budget, de priorités, de préfecture. Le conseil venait de voter douze bancs pour la place, après trois heures de débat sur la couleur ; nous avons choisi le vert. Certains matins, je trouve ces bancs tournés tous du même côté, et je n’ai jamais osé regarder ce qu’ils regardent.' },
      { titre: 'L’arrêté sans date', min: 6, texte: 'J’ai rédigé un arrêté, {prenom}. Article unique : l’arrêté du 3 mars 1854 est abrogé ; les ponts de {ville} resteront baissés, et chacun pourra sortir le soir regarder la lune, de quelque couleur qu’elle soit. Je l’ai écrit la semaine de votre arrivée, et je le garde dans la poche de mon gilet, du côté du cœur, comme un billet doux. Il n’y manque que la date et ma signature. Le soir où les enfants joueront sur la place après le coucher du soleil, et où leurs mères les appelleront sans avoir peur, je signerai.' },
      { titre: 'Vasseur, fils', min: 8, texte: 'Dans le registre du tiroir, {prenom}, au milieu des noms écrits par mon grand-père, il y a une ligne de la main de mon père : « 17 octobre 1859. Vasseur, fils. Sept ans. » Je me souviens de m’être couché ce soir-là, et de m’être réveillé le lendemain dans mon lit, les pieds pleins de terre rouge. Mon père n’a jamais rayé la ligne, et il ne m’a plus jamais embrassé. Le soir même de mon retour, il a commencé à me faire réciter l’arrêté, debout sur une chaise : il écoutait si c’était bien ma voix. Toute ma vie, j’ai compté les gens en trop de cette vallée. Je n’ai jamais osé me compter moi-même.' },
    ],
    questions: [
      {
        id: 'maire_q1', min: 0,
        texte: 'Pour le registre, {fermier} : comptez-vous vous établir durablement dans la commune ? Je demande pour les statistiques. Et un peu pour moi.',
        reponses: [
          { label: 'Oui. J’ai l’intention de vieillir ici.', amitie: 20, reaction: 'Vieillir ici ! Voilà une phrase qu’on n’entend plus guère, dans cette vallée. Je vous inscris à l’encre, et non au crayon : c’est un honneur que je ne fais pas à tout le monde.' },
          { label: 'Le temps de vendre la ferme, pas plus.', amitie: -10, reaction: 'Vendre ? Personne n’achète dans la vallée, {fermier}, et personne n’en part. Je vous inscris au crayon, en attendant que vous changiez d’avis : tout le monde finit par changer d’avis.' },
          { label: 'Ça dépend. Il y a des bals, le samedi ?', amitie: 10, reaction: 'Des bals ! Du temps de mon père, on dansait sur la place jusqu’à huit heures et demie, pas une minute de plus. Je soumettrai l’idée au conseil, qui en débattra jusqu’à la Toussaint.' },
        ],
        rappel: [
          'Vous m’avez dit vouloir vieillir ici. Je relis parfois la ligne, dans le registre ; elle me fait du bien.',
          'Toujours décidé à vendre ? J’ai demandé au notaire : aucune offre. Il n’y en a jamais eu, pour aucune ferme de la vallée.',
          'Le conseil a débattu de votre bal pendant trois heures. Nous avons voté à l’unanimité… d’en reparler.',
        ],
      },
      {
        id: 'maire_q2', min: 1,
        texte: 'Question hypothétique, {fermier}, purement hypothétique : si vous trouviez l’or des Valmont, qu’en feriez-vous ?',
        reponses: [
          { label: 'Je le remettrais à la commune, jusqu’au dernier sou.', amitie: 20, reaction: 'Jusqu’au dernier sou ! Je vous décernerais la médaille de la commune sur-le-champ, si la commune avait une médaille. Nous referions le toit de l’école, les ponts, et peut-être une statue, modeste, sur la place.' },
          { label: 'Je le garderais. C’est moi qui aurais creusé.', amitie: -10, reaction: 'Qui creuse garde, c’est cela ? C’est ce qu’ont dû se dire ceux qui ont racheté les terres des Valmont à la Révolution, et mon arrière-grand-père en était… Oubliez ce que je viens de dire.' },
          { label: 'J’achèterais la préfecture, qu’elle vous réponde.', amitie: 15, reaction: 'Ha ! Elle ne répondrait pas davantage, j’en ai peur, mais l’intention me touche. Je le mentionnerai dans ma prochaine lettre, lundi.' },
        ],
        rappel: [
          'Jusqu’au dernier sou, m’avez-vous dit, pour l’or des Valmont. Il reste donc des gens honnêtes dans cette vallée ; je l’ai noté.',
          'Qui creuse garde, disiez-vous. Si vous creusez près des ruines de Valmont, rappelez-vous que la commune a droit à la moitié. Au moins.',
          'J’ai écrit à la préfecture que quelqu’un envisageait de l’acheter. Toujours pas de réponse. Ils délibèrent, sans doute.',
        ],
      },
      {
        id: 'maire_q3', min: 2,
        texte: 'Dites-moi, {fermier}… Y a-t-il quelqu’un, quelque part, qui vous attend ? Une lampe à une fenêtre, je veux dire.',
        reponses: [
          { label: 'Oui. Et je lui écris chaque semaine.', amitie: 15, reaction: 'Chaque semaine… Alors écrivez-lui, même quand vous n’avez rien à dire, surtout quand vous n’avez rien à dire. Ce sont les lettres qu’on n’a pas écrites qu’on relit le plus.' },
          { label: 'Personne. Et c’est très bien ainsi.', amitie: 0, reaction: 'Très bien ainsi… Je disais la même chose avant Hélène, et je le redis depuis. Entre les deux, j’ai eu dix-neuf ans de bonheur, et l’on s’en remet très mal, croyez-moi.' },
          { label: 'Mon chien, s’il se souvient encore de moi.', amitie: 10, reaction: 'Un chien ! Les chiens se souviennent de tout, c’est ce qui les rend si fidèles. Mon chat, Préfet, n’a de mémoire que pour l’heure de la pâtée, et comme l’autre, il ne répond jamais quand on l’appelle.' },
        ],
        rappel: [
          'Avez-vous écrit, cette semaine, à la personne qui vous attend ? Écrivez. Ma nièce vous le dira : le courrier finit toujours par arriver.',
          'Personne ne vous attend, disiez-vous. Ce n’est plus tout à fait vrai : à la mairie, quelqu’un guette votre passage. Pour le registre, bien sûr.',
          'Préfet vous salue. Enfin, il a bâillé quand j’ai prononcé votre nom ; chez un chat, c’est une marque d’estime.',
        ],
      },
      {
        id: 'maire_q4', min: 4,
        texte: 'Une question… administrative, {fermier}. Si vous appreniez que quelqu’un, en ville, est revenu d’une nuit rouge un peu différent, plus tout à fait lui-même, le signaleriez-vous au maire, comme l’exige l’article quatre ?',
        reponses: [
          { label: 'Non. S’il est bon avec les autres, il est d’ici.', amitie: 30, reaction: 'S’il est bon avec les autres, il est d’ici… Pardonnez-moi, j’ai une poussière dans l’œil ; il y en a toujours, dans cette vallée. Merci, {fermier} : vous ne savez pas pourquoi, mais merci.' },
          { label: 'Oui. Le règlement, c’est le règlement.', amitie: -15, reaction: 'Oui. Bien sûr : c’est ce que dit l’article quatre, et j’aurais répondu comme vous. Excusez-moi, j’ai un dossier sur le feu, un dossier très urgent.' },
          { label: 'D’abord, je lui demanderais s’il joue à la manille.', amitie: 10, reaction: 'À la manille ! S’il y joue, il est d’ici ; s’il gagne, il est de la préfecture. Vous avez l’esprit d’un législateur, {fermier}, d’un législateur un peu dérangé, mais d’un législateur.' },
        ],
        rappel: [
          'Je repense à ce que vous m’avez dit : s’il est bon avec les autres, il est d’ici. Je me le répète le soir, en fermant mes volets.',
          'Vous signaleriez, m’avez-vous dit. J’y pense chaque fois que je vous vois sur la place. Comptez juste, {fermier} ; c’est tout ce que je vous demande.',
          'J’ai demandé à Préfet s’il jouait à la manille. Il m’a regardé comme on regarde un homme en trop.',
        ],
      },
    ],
    humeurs: {
      joyeux: [
        'Ah, {fermier}, belle journée pour la République ! Le conseil a adopté mon budget sans une objection : ils dormaient, mais une adoption est une adoption.',
        'Jour {jour} de votre installation, et votre nom ne figure ni aux décès ni aux disparitions : excellent bilan, excellent !',
        'Bonjour, bonjour ! Préfet a dormi sur mes genoux toute la matinée, je n’ai pas pu signer un seul acte : une matinée parfaite.',
      ],
      triste: [
        'Bonjour, {fermier}. Pardonnez ma mine : c’était l’anniversaire de mon mariage, hier… enfin, ç’aurait été l’anniversaire.',
        'J’ai ouvert le secrétaire de mon père, ce matin, pour la première fois en vingt-deux ans. Il avait gardé tous mes cahiers d’écolier, et je ne l’ai jamais su.',
        'Ah, c’est vous. Non, rien de grave : une commune, c’est lourd à porter, certains jours, et les autres jours aussi.',
      ],
      fatigue: [
        'Pardonnez-moi, je n’ai pas fermé l’œil : j’ai relu le budget de 1883 jusqu’à l’aube. Il ne tombait pas juste non plus.',
        'Bonjour… Si je bâille pendant que vous parlez, ce n’est pas de l’ennui, c’est du dévouement.',
        'J’ai dormi dans mon fauteuil, avec l’écharpe, et je me suis réveillé en plein discours. Il n’y avait que le chat, qui n’a pas applaudi.',
      ],
      inquiet: [
        'Vous n’auriez pas vu le garde ? Il devait me faire son rapport à sept heures, il est sept heures douze, et il se passe des choses, en douze minutes.',
        'Dites-moi franchement : ai-je l’air d’un homme qui a bien dormi ? Non, c’est bien ce que je pensais.',
        'On a recompté les bancs de la place, ce matin : il y en a treize, et nous en avons voté douze. Qui paie le treizième, et surtout, qui s’y assoit ?',
      ],
      agace: [
        'Pas maintenant, {fermier}. Le curé a encore fait sonner ses cloches pendant mon discours, par pure coïncidence, bien entendu.',
        'Ma nièce raconte à toute la vallée que je dors avec une chandelle. C’est une veilleuse, {fermier}, une veilleuse municipale.',
        'Je suis d’une humeur de préfet, aujourd’hui : je ne réponds à personne.',
      ],
    },
    souvenirs: {
      cadeau_adore: [
        'Votre {objet}, l’autre jour… Je n’avais rien reçu d’aussi aimable depuis des années. Je l’ai inscrit au registre des dons, colonne « personnel ».',
        'Je pense encore à votre {objet}. Hélène savait faire ce genre de cadeau ; vous lui auriez plu, je crois.',
      ],
      cadeau_deteste: [
        'Je n’ai pas oublié votre {objet}, {fermier}. Je l’ai classé. Dans le poêle.',
        'Votre {objet} de l’autre jour… Était-ce une plaisanterie, ou une motion de censure ?',
      ],
      aide: [
        'Vous m’avez rendu service, et un maire n’oublie pas ses dettes : il les inscrit, il les relit, et il se promet de les payer. Un jour.',
        'Grâce à vous, la commune a tenu bon, cette semaine. Je l’ai dit au conseil, et l’un d’eux a toussé : j’ai choisi d’y voir des applaudissements.',
      ],
      toque_nuit: [
        'L’autre nuit, on a frappé à la mairie, très tard. On m’a dit que c’était vous. Je préfère le croire.',
        'Ne frappez plus chez moi en pleine nuit, {fermier}, je vous en prie. Je n’ai pas ouvert, je n’ouvre jamais : je suis resté derrière la porte jusqu’à l’aube, le tisonnier à la main.',
      ],
      coup: [
        'Vous avez levé la main sur le premier magistrat de la commune. Ma joue s’en souvient, et le registre aussi.',
        'Je n’ai pas porté plainte. Auprès de qui ? Du garde ? Il a eu plus peur que moi.',
      ],
      absence: [
        'Ah, {fermier} ! J’allais faire afficher un avis de recherche ; j’avais même choisi les caractères.',
        'Vous revoilà ! J’ai failli ouvrir le mauvais registre. Ne me refaites jamais cela.',
      ],
      victime: [
        'Il a fallu écrire le décès au registre, et la case « cause » est restée vide. Je ne sais pas écrire ce mot-là.',
        'J’ai fait mettre les drapeaux en berne. Le vent les a relevés dans la nuit, tous, et je les ai fait redescendre. Je ne sais pas lequel de nous deux gagnera.',
      ],
    },
    tenue: {
      arme: 'Une arme, sur la voie publique ? Rangez-moi cela, je vous prie : il y a un arrêté. Enfin, il devrait y en avoir un ; je le rédige ce soir.',
      pelle: 'Une pelle… Vous creusez quelque part, {fermier} ? Rappelez-vous que la moitié de ce que vous trouverez appartient à la commune.',
      potion: 'Qu’est-ce que cette fiole ? Elle vient de la vieille, dans les bois ? Je n’ai rien vu : le maire ne voit pas les fioles.',
      animal_mort: 'Seigneur, cette bête ! Ne pourriez-vous pas la porter plus discrètement ? Nous sommes sur la voie publique.',
      fleurs: 'Des fleurs ! Si elles sont pour les jardinières de la mairie, je vous serre la main ; si elles sont pour moi, je vous la serre deux fois.',
      poisson: 'Du poisson… Pas une anguille, j’espère ? Je ne supporte pas les anguilles : elles me rappellent les conseillers municipaux, on ne sait jamais par quel bout les prendre.',
      lanterne_jour: 'Une lanterne en plein midi ? Vous cherchez un honnête homme, comme Diogène ? Essayez la mairie. Non, à la réflexion, n’essayez pas.',
      relique: 'Où avez-vous trouvé cela ? C’est ancien, c’est… Ce genre d’objet devrait être déclaré en mairie. Et puis non : gardez-le, et surtout ne le posez pas sur mon bureau.',
      rien: 'Les mains vides, {fermier} ? Quelqu’un qui vient à la mairie sans rien réclamer ! C’est si rare que je devrais le noter.',
    },
    chez_soi: {
      jour: 'Vous êtes dans les appartements privés du maire, {fermier}. La mairie, c’est en bas ; ici, il n’y a que mon chat, mes pantoufles et mes regrets. Redescendez, je vous prie.',
      nuit: 'Qui est là ? Comment avez-vous ouvert ? J’avais fermé à double tour, j’en suis certain… Restez où vous êtes : j’ai un tisonnier, une écharpe tricolore, et la loi pour moi.',
    },
    activites: {
      travail: [
        '« Considérant que… » Considérant que quoi, Vasseur ? Que personne ne lira jamais ceci. Bien. Continuons.',
        'Naissances : aucune. Mariages : aucun. Décès… Nous verrons les décès après le déjeuner.',
        'Encre, buvard, sceau… Où est encore passé le sceau ? Préfet ! Descends de ce registre !',
      ],
      repas: [
        'Un peu de fromage, un verre de vin, et le monde redevient une commune gouvernable.',
        'Tarte aux pommes, tarte aux prunes… Plus personne ne fait de tarte aux mirabelles, dans cette vallée. Plus personne.',
        'Préfet, cette sardine est à moi. Nous en avons débattu, et j’ai voté contre toi.',
      ],
      priere: [
        'Je ne suis pas ici en tant que maire, Seigneur, mais en simple particulier. Cela dit, si vous pouviez glisser un mot à la préfecture…',
        'Notre Père, qui êtes aux cieux… et pas en dessous. Surtout pas en dessous.',
        'Protégez la commune, ses habitants, ses ponts. Et Hélène, où qu’elle soit. Ainsi soit-il.',
      ],
      promenade: [
        'Ce banc est de travers. Tout se perd, dans cette commune, même l’alignement.',
        'Belle perspective. Il faudrait une statue, ici. Quelque chose de sobre : un homme debout, à moustache, qui regarde l’avenir.',
        'Un, deux, trois… treize bancs. Non. Douze. Douze. Je recompterai demain.',
      ],
      soir: [
        'Volets, verrou, veilleuse. Volets, verrou, veilleuse. Comme papa. Comme grand-papa.',
        'Viens, Préfet, on rentre. Non, pas par là. Jamais par là.',
        'Encore une journée sans réponse de la préfecture. Au moins, elle n’a pas dit non.',
      ],
      pluie: [
        'Mes souliers vernis ! Trente francs de souliers, et la commune n’a pas de trottoirs. Il faut que je propose des trottoirs.',
        'Il pleut sur la mairie comme sur le reste. La République ne fait pas de différence ; c’est beau, dans un sens.',
        'Qui a encore emprunté le parapluie municipal ? Le curé, je parie. Il appelle cela la charité.',
      ],
    },
    discussions: [
      {
        avec: 'cure',
        lignes: [
          ['maire', 'Monsieur le curé, vos cloches ont encore sonné pendant mon discours, dimanche. Pile sur « chers administrés ».'],
          ['cure', 'Le Seigneur a ses heures, monsieur le maire. Il se trouve qu’elles tombent souvent pendant les vôtres.'],
          ['maire', 'La loi de 1905 sépare les Églises et l’État. Elle pourrait aussi séparer les cloches et les discours.'],
          ['cure', 'Venez donc entendre un de mes sermons : vous verrez qu’on peut parler longtemps sans que personne ne sonne. Ni n’écoute.'],
          ['maire', 'Hum. Et cette nuit… vous avez entendu, vous aussi ? Vers trois heures et demie ?'],
          ['cure', 'Je n’entends jamais rien, la nuit, monsieur le maire. Comme vous. Fermez bien vos volets.'],
        ],
      },
      {
        avec: 'garde',
        lignes: [
          ['maire', 'Grosjean, j’ai une idée : cet été, nous lèverions les ponts dix minutes plus tard. Pour le commerce.'],
          ['garde', 'Oui, monsieur le maire. Enfin, non, monsieur le maire. L’arrêté dit « au coucher du soleil ».'],
          ['maire', 'L’arrêté, c’est mon grand-père qui l’a signé. Je peux bien lui ajouter dix minutes.'],
          ['garde', 'Et après dix minutes, il y aura toujours quelqu’un qui arrivera à la onzième, monsieur le maire. Il y a toujours quelqu’un.'],
          ['maire', 'Hum. Vous avez peut-être raison. Oublions ces dix minutes. Votre rapport de la nuit ?'],
          ['garde', 'Rien à signaler, monsieur le maire. Rien du tout. Comme d’habitude.'],
        ],
      },
      {
        avec: 'postiere',
        lignes: [
          ['postiere', 'Mon oncle ! Rien pour vous ce matin. Ni préfecture, ni ministère, ni rien. Pas le temps, pas le temps !'],
          ['maire', 'Rien ? Tu es sûre ? Tu as bien regardé au fond du sac ?'],
          ['postiere', 'Au fond du sac, il y a du sable et une lettre pour un monsieur mort en 1850. Je la garde, au cas où il passerait.'],
          ['maire', 'Tu viens déjeuner dimanche ? Il y aura un pâté. Et n’oublie pas qui t’a obtenu ta place.'],
          ['postiere', 'Comment l’oublier, mon oncle ? Vous me le rappelez chaque dimanche, entre le pâté et le fromage.'],
          ['maire', 'C’est une tradition familiale, comme le pâté. Les traditions, il faut les entretenir.'],
        ],
      },
    ],
    foi_lignes: [
      'Je vais à la messe, oui, au dernier rang, en simple particulier. La République est laïque ; la commune, elle, a une grand-mère dans chaque maison.',
      'Je ne sais pas si Dieu existe, {fermier}. Mais quand la petite lampe rouge brûle dans l’église, la nuit, la commune dort mieux, et moi aussi.',
      'Les Anciens, la Dame du Lac, le Cerf Blanc… Du folklore, du patrimoine ! Il faudrait en faire une brochure. Je n’irais pas déposer du lait sur leurs pierres, voilà tout. Pas en plein jour, en tout cas.',
      'Ceux d’en bas ? Il n’existe aucune délibération du conseil à leur sujet, aucune. Mon grand-père en a pourtant brûlé une, en 1854, dans ce poêle-là, et je me suis toujours demandé ce qu’elle disait.',
    ],
    reaction_piete: {
      eglise: 'On vous voit souvent à l’église, {fermier}. C’est très bien. N’en dites rien au curé, surtout : il s’en attribuerait le mérite.',
      anciens: 'On me dit que vous déposez des offrandes sur les vieilles pierres. La commune est tolérante, {fermier}. Rapportez simplement les pots de lait vides : c’est un espace public.',
      dessous: 'Vous… vous sentez la terre mouillée, {fermier}, la terre du fond. Mon grand-père sentait comme cela, ses dernières années. N’approchez pas davantage, je vous prie, et surtout ne me dites pas ce que vous leur avez promis.',
    },
    fete_lignes: [
      'C’est mon anniversaire, {fermier}. Le conseil m’a offert une plume : la mienne, qu’ils ont prise sur mon bureau et ornée d’un ruban tricolore.',
      'Hélène me faisait une tarte, ce jour-là. Si par hasard vous passiez devant la boulangerie, et que par hasard une tarte… Non, je ne demande rien. Un maire ne demande pas : il suggère.',
    ],
    secret: 'Ce que je faisais dans {lieu:tour}, la nuit où j’ai perdu ma chevalière ? Je regardais le lac, où certaines nuits une seconde ville s’allume : la nôtre, à l’envers, toutes fenêtres éclairées. Au premier étage de la mairie d’en bas, une femme coud près d’une lampe, sans jamais lever les yeux. Je lui fais signe quand même, chaque fois.',
  },
  // --------------------------------------------------------------------------
  cure: {
    foi: 'eglise', devotion: 3, fete: 13,
    mythes: ['cloche_noyee', 'moine_sans_visage'],
    mythe_intro: [
      'Asseyez-vous, mon enfant. Ce que je vais vous dire, on ne l’enseigne pas au séminaire : on l’apprend ici, à ses dépens.',
      'Je ne devrais pas raconter ces choses, ce sont des histoires de veillée, et je suis prêtre. Mais dans cette vallée, les veillées ont souvent eu raison contre les prêtres.',
    ],
    histoire: [
      { titre: 'La robe noire', min: 0, texte: 'Je suis né en Beauce, dans un pays si plat qu’on y voit venir le dimanche dès le mercredi. Mon père était charron, et ses mains sentaient le frêne et la graisse d’essieu. Ma mère voulait un prêtre dans la famille : à onze ans, je suis entré au petit séminaire de Chartres avec une soutane taillée dans sa robe de mariée. Chez nous, les femmes se mariaient en noir, pour pouvoir porter la robe toute leur vie. La sienne, c’est moi qui l’ai portée.' },
      { titre: 'Quatorze cercueils', min: 0, texte: 'On m’a envoyé ici en novembre 1880, pour six mois, au lendemain de l’éboulement de la mine. Ma première messe, dans cette église, a été pour quatorze hommes qu’on n’avait pas pu remonter. Les veuves avaient voulu des cercueils quand même, si légers que les porteurs trébuchaient d’avoir trop forcé. Au premier rang, un garçon de quinze ans ne pleurait pas : c’était {npc:forgeron}, et il ne pleure toujours pas. J’avais trente-trois ans, l’âge du Christ, et je ne savais pas quoi dire ; alors j’ai tout dit en latin, pour ne pas avoir à trouver mes propres mots.' },
      { titre: 'Le ruban bleu', min: 1, texte: 'Avant le grand séminaire, il y a eu Eugénie Thibault, la fille du bourrelier. Nous avions dix-neuf ans, et nous parlions de tout, sauf de ce qui comptait. Le jour de mon départ, elle m’a donné un ruban bleu, sans un mot, et je l’ai glissé dans mon bréviaire, à l’office des morts, là où personne ne regarde. Je n’ai jamais regretté ma vocation. Je me le répète souvent, et c’est déjà un aveu.' },
      { titre: 'Les sabots du petit Gaudin', min: 2, texte: 'En 1891, j’avais au catéchisme un garçon qui posait des questions comme celles de {npc:fillette} : le petit Honoré Gaudin, huit ans. Il voulait savoir si les cloches ont une âme, et si elles ont peur quand on les sonne. Une nuit où la lune avait rougi, son lit s’est trouvé vide, et l’on a retrouvé ses sabots au bord du lac, bien alignés, la pointe vers l’eau. Je lui dois toujours une réponse. Je la prépare depuis bientôt vingt ans, et je ne l’ai pas encore trouvée.' },
      { titre: 'La langue de la nuit', min: 3, texte: 'Ces nuits où je m’éveille devant l’autel, en chasuble, la nef pleine… Ce que je n’ai dit à personne, c’est la langue : ce n’est pas du latin, ni rien que j’aie appris, et pourtant je la prononce sans une faute. La dernière fois, au troisième rang, j’ai reconnu un visage qui chantait plus fort que les autres : le mien. Depuis, je dors la cheville attachée au montant du lit par une vieille corde de cloche. Certains matins, je la retrouve coupée net, et il n’y a pas de couteau dans ma chambre.' },
      { titre: 'La page brûlée', min: 4, texte: 'Dans le registre de l’abbé Mauduit, il y avait une page que j’ai arrachée, ma première semaine ici, et brûlée dans le poêle de la sacristie. C’était une liste de dates, de sa main, qui n’étaient pas encore venues. La première tombait le lendemain de mon arrivée, et cette nuit-là, la cloche a sonné treize coups. J’ai eu peur de connaître la suite, alors j’ai choisi de ne pas savoir. Depuis, chaque fois qu’elle sonne, je me demande si la date était sur la page, et je crois que oui.' },
      { titre: 'Une messe de Pâques', min: 6, texte: 'J’ai gardé la clé de {lieu:chapelle}, celle de l’abbé Mauduit, dans ma commode, sous mes chaussettes d’hiver. Je rêve d’y dire une messe un matin de Pâques, portes grandes ouvertes, avec le soleil dans les vitraux cassés et les enfants du catéchisme qui se disputent les œufs sur les marches. Une messe ordinaire, {prenom}, que tout le monde comprendrait, et après laquelle chacun rentrerait déjeuner. C’est un petit espoir. Ici, ce sont les petits qui tiennent.' },
      { titre: 'Ceux qui répondent', min: 8, texte: 'Je vais vous dire ce que je n’ai jamais avoué à aucun confesseur, {prenom}. Le dimanche, j’ai six fidèles, une vieille qui dort et un chien qui entre par la sacristie. La nuit, j’ai la nef pleine, et ils répondent à chaque mot, d’une seule voix, comme personne ne m’a jamais répondu de toute ma vie. Je crois encore en Dieu, je crois. Mais c’est la nuit que je me sens prêtre, et certains soirs, que le Seigneur me pardonne, je me couche de bonne heure pour qu’elle vienne plus vite.' },
    ],
    questions: [
      {
        id: 'cure_q1', min: 0,
        texte: 'Pardonnez la curiosité d’un vieux prêtre, mon enfant : avez-vous reçu le baptême ?',
        reponses: [
          { label: 'Oui, mon père. Et je tâche d’en rester digne.', amitie: 20, reaction: 'Deo gratias. Alors vous êtes des nôtres, même les jours où vous l’oubliez, et surtout ces jours-là.' },
          { label: 'Non. Et je n’en vois pas l’utilité.', amitie: -10, reaction: 'L’utilité… Dieu n’est pas une houe, mon enfant. Mais il n’a pas besoin de votre permission pour vous aimer, et moi non plus, hélas.' },
          { label: 'Je crois. Je n’avais pas encore mon mot à dire.', amitie: 10, reaction: 'Pas encore votre mot à dire… C’est tout le principe : le Seigneur aime parler le premier. Ne répétez pas à l’évêque que cela m’a fait rire.' },
        ],
        rappel: [
          'Vous tâchez d’être digne de votre baptême, disiez-vous. Cela se voit, mon enfant. Le Seigneur l’a remarqué aussi, j’imagine : il a plus de temps que moi.',
          'Je prie pour vous quand même, chaque soir. Pas beaucoup : une dizaine. Vous ne sentirez rien, c’est promis.',
          'J’ai répété votre mot à {npc:fillette} : « pas encore mon mot à dire ». Elle a ri si fort qu’on l’a entendue jusque dans la sacristie.',
        ],
      },
      {
        id: 'cure_q2', min: 1,
        texte: 'On dit que vous allez parfois voir {npc:guerisseuse}, au fond des bois. Qu’allez-vous y chercher, mon enfant ?',
        reponses: [
          { label: 'Des remèdes. Elle ne m’a jamais fait de mal.', amitie: 10, reaction: 'Jamais fait de mal… Je veux bien le croire : à moi non plus, et c’est bien ce qui me tourmente. Allez-y de jour, seulement, et ne mangez rien de ce qui pousse en rond.' },
          { label: 'Cela ne regarde que moi, mon père.', amitie: -10, reaction: 'Vous avez raison, je ne suis pas votre confesseur. Du moins, pas encore. Souvenez-vous seulement que ce qu’on va chercher dans les bois, il faut parfois le rapporter.' },
          { label: 'La même chose que vous, mon père : des tisanes.', amitie: 20, reaction: 'Je… Qui vous a dit cela ? Pour mes rhumatismes uniquement, et un peu pour dormir ; puisque nous voilà complices, méfiez-vous de la tisane verte, elle fait rêver en latin.' },
        ],
        rappel: [
          'Toujours vos remèdes, chez {npc:guerisseuse} ? Si elle vous demande de mes nouvelles, dites-lui que je dors. Ce sera un pieux mensonge.',
          'Ce que vous allez chercher dans les bois ne me regarde pas, m’avez-vous dit. Je le respecte. Je prie seulement pour que vous en reveniez avec toute votre âme.',
          'Notre petit secret tient toujours, mon enfant ? Les tisanes… Chut. Le maire en ferait une affiche.',
        ],
      },
      {
        id: 'cure_q3', min: 2,
        texte: 'Si Dieu vous accordait une heure avec l’un de vos morts, une seule, lequel choisiriez-vous ?',
        reponses: [
          { label: 'Ma mère. Je ne lui ai jamais dit merci.', amitie: 20, reaction: 'Merci… C’est le mot qu’on garde toujours pour trop tard. Dites-le-lui ce soir, dans le noir : les mères entendent de loin, et la mienne entendait à six lieues, avec le vent.' },
          { label: 'Aucun. Les morts sont morts, mon père.', amitie: -5, reaction: 'Les morts sont morts… Vous avez de la chance de pouvoir le croire. Ici, ils ont la fâcheuse habitude de ne l’être qu’à moitié.' },
          { label: 'Anselme, pour savoir pourquoi il a muré sa cave.', amitie: 10, reaction: 'Anselme ! De l’humour ou du courage : ici, les deux se ressemblent. Il était venu me demander les archives de {lieu:abbaye}, un hiver, pour y chercher un moine qui portait son prénom, et il n’a plus jamais été tout à fait le même.' },
        ],
        rappel: [
          'Avez-vous dit merci à votre mère, l’autre soir, dans le noir ? Moi, j’ai essayé avec la mienne. Il y a eu un courant d’air ; je choisis d’y croire.',
          'Les morts sont morts, disiez-vous. J’ai pensé à vous pendant la messe des défunts, et j’ai prié pour que vous ayez raison.',
          'J’ai repensé à Anselme et à sa cave. Il m’a dit un jour que certaines portes se murent de l’intérieur ; si vous obtenez votre heure, demandez-lui de quel côté il était.',
        ],
      },
      {
        id: 'cure_q4', min: 4,
        texte: 'Dites-moi franchement, mon enfant : pourriez-vous pardonner à quelqu’un qui a fait le mal par peur ?',
        reponses: [
          { label: 'Oui. La peur n’est pas la méchanceté.', amitie: 25, reaction: 'La peur n’est pas la méchanceté… Je me le suis dit mille fois sans jamais y croire tout à fait. Dans votre bouche, cela sonne presque vrai.' },
          { label: 'Non. La peur n’excuse rien.', amitie: -10, reaction: 'Non. Vous avez raison, sans doute : je le prêche moi-même, certains dimanches, et je le prêche mal. Laissez-moi, voulez-vous, j’ai un office à préparer.' },
          { label: 'Ça dépend. Il m’apporte de la confiture ?', amitie: 10, reaction: 'De la confiture ! Vous marchandez l’absolution, à présent ? À ce prix-là, je connais un vieux curé qui serait pardonné depuis longtemps.' },
        ],
        rappel: [
          'La peur n’est pas la méchanceté, m’avez-vous dit. J’ai écrit votre phrase sur un papier, et je l’ai glissée dans mon bréviaire, à l’office des morts, là où je range ce qui compte.',
          'Vous ne pardonnez pas à la peur. Je le comprends. Je vous demanderai seulement, le jour venu, de ne pas me juger trop vite.',
          'On a déposé un pot de confiture devant ma porte, hier, sans un mot. Était-ce vous ? Je me suis senti pardonné pour toute la semaine.',
        ],
      },
    ],
    humeurs: {
      joyeux: [
        'Pax vobiscum, mon enfant ! Le toit n’a pas fui sur l’autel cette nuit : je n’ose y voir un miracle, j’y vois une gouttière.',
        'Laudate Dominum ! {npc:fillette} a récité son catéchisme sans une faute, et sans me demander si les morts savent nager.',
        'Bonjour, mon enfant. J’ai dormi six heures d’affilée, ce qui, à mon âge et dans cette paroisse, relève de la grâce d’état.',
      ],
      triste: [
        'J’ai fleuri une petite tombe, ce matin, au fond du cimetière. Je le fais chaque année, et je suis le seul à m’en souvenir.',
        'Dominus vobiscum… Pardonnez ma voix : c’est un de ces jours où les prières tombent par terre avant d’atteindre le plafond.',
        'Trente ans que l’on m’a envoyé ici pour six mois. Certains jours, je compte encore les semaines, par habitude.',
      ],
      fatigue: [
        'Bonjour, mon enfant. Si je bâille, que Dieu me pardonne : la nuit a été longue, et je ne suis pas certain de l’avoir passée dans mon lit.',
        'Mes rhumatismes ont chanté matines avant moi, ce matin, et laudes, et tout l’office.',
        'Pardonnez ma mine : j’ai veillé le registre des sonneries jusqu’à l’aube, et il n’a rien écrit tout seul, cette fois… je crois.',
      ],
      inquiet: [
        'Vous n’avez rien entendu, cette nuit, vers trois heures et demie ? Tant mieux pour vous, mon enfant, tant mieux.',
        'L’eau du bénitier a baissé d’un doigt depuis hier. Personne ne boit l’eau bénite, mon enfant… personne de chez nous.',
        'Priez pour moi aujourd’hui, voulez-vous, juste un Ave. Je ne sais pas pourquoi je vous demande cela ; si, je le sais.',
      ],
      agace: [
        'Le maire a encore prononcé un discours sur la place pendant les vêpres, avec un « chers administrés » à chaque répons. Le Seigneur est patient ; je ne suis que son serviteur.',
        'Quelqu’un a encore noué des rubans sur {lieu:calvaire}. Des rubans, sur la croix du Christ, et je sais très bien qui leur a appris cela !',
        'Pas maintenant, mon enfant. Ma patience est partie sonner l’angélus il y a une heure, et elle n’est pas revenue.',
      ],
    },
    souvenirs: {
      cadeau_adore: [
        'Votre {objet}, l’autre jour… Je l’ai reçu comme on reçoit une lettre de sa mère. J’en ai rendu grâce à Dieu, puis à vous, mais de peu.',
        'Je n’ai pas oublié votre {objet}, mon enfant. Il y a longtemps qu’on ne m’avait pas fait plaisir sans rien demander en échange, pas même une absolution.',
      ],
      cadeau_deteste: [
        'Votre {objet} de l’autre jour… J’ai prié pour avoir la force de vous le pardonner. La prière est toujours en cours.',
        'J’ai donné votre {objet} aux pauvres. Ils me l’ont rendu. Même les pauvres ont leurs limites, mon enfant.',
      ],
      aide: [
        'Vous m’avez aidé quand je n’osais plus rien demander. Je l’ai confié au Seigneur, mais je voulais aussi vous le dire en face : merci.',
        'Le service que vous m’avez rendu, je l’ai mis dans mes prières du soir, entre ma mère et le toit de l’église. Vous êtes en bonne compagnie.',
      ],
      toque_nuit: [
        'Vous avez frappé chez moi en pleine nuit, l’autre fois. J’ai demandé votre nom trois fois, et vous ne l’avez pas dit. C’était bien vous, n’est-ce pas ? Dites-moi que c’était vous.',
        'Ne frappez plus chez moi après minuit, je vous en conjure, même si c’est grave. Surtout si c’est grave : venez plutôt sonner la cloche. Elle, au moins, je sais qui la sonne. Presque toujours.',
      ],
      coup: [
        'Vous m’avez frappé, mon enfant. J’ai tendu l’autre joue, comme il est écrit, mais vous ne l’avez pas vue : je l’ai tendue après votre départ.',
        'Je vous ai pardonné le coup ; c’est mon métier. Mais mon épaule, elle, n’a pas fait le séminaire.',
      ],
      absence: [
        'Vous voilà enfin ! J’ai failli dire une messe pour vous. Une petite, par précaution.',
        'Cela faisait longtemps, mon enfant. J’ai demandé de vos nouvelles à saint Aubin ; il ne répond pas souvent, mais il écoute.',
      ],
      victime: [
        'J’ai sonné le glas ce matin. La corde était tiède, comme si quelqu’un l’avait tenue avant moi. Requiescat in pace.',
        'Une âme de plus à recommander, et je n’ai pas su la garder. On me dira que ce n’était pas mon rôle ; c’était exactement mon rôle.',
      ],
    },
    tenue: {
      arme: 'Rangez cela, mon enfant. Qui prend l’épée périra par l’épée ; pour la hache et l’arc, l’Évangile ne dit rien, mais je vous les déconseille aussi.',
      pelle: 'Une pelle… Si vous creusez près du cimetière, prévenez-moi. Il y a des endroits où la terre n’aime pas qu’on la dérange, et d’autres où elle n’attend que cela.',
      potion: 'Cette fiole vient des bois, n’est-ce pas ? Je ne dirai rien. Faites au moins un signe de croix avant de la boire : cela ne change peut-être rien, mais cela ne coûte rien.',
      animal_mort: 'Pauvre bête. Pas un passereau ne tombe sans que le Père le sache, dit l’Évangile ; il doit avoir fort à faire, dans cette vallée.',
      fleurs: 'Des fleurs ! L’autel en manque depuis la Toussaint, et la tombe de l’abbé Mauduit aussi. Enfin… celle qu’on dit être la sienne.',
      poisson: 'Un poisson ! Le signe des premiers chrétiens, et le repas du vendredi. Pourvu que ce ne soit pas une anguille : celles-là remontent de trop loin.',
      lanterne_jour: 'Une lanterne allumée à midi ? Vous avez peut-être raison. Il y a des jours, ici, où la lumière du bon Dieu ne suffit pas.',
      relique: 'Où avez-vous pris cela ? C’est plus vieux que mon église, mon enfant. Ne l’approchez pas de l’autel, je vous en prie : je ne sais pas lequel des deux s’en offenserait.',
      rien: 'Les mains vides ? C’est ainsi qu’on vient au monde, et qu’on en repart. Entre les deux, on porte des choses. Bonjour, mon enfant.',
    },
    chez_soi: {
      jour: 'La maison de Dieu est ouverte le jour, mon enfant, entrez. Mais la petite porte, derrière l’autel, c’est chez moi, et d’ordinaire on y frappe. Ne touchez pas au registre, sur la table.',
      nuit: 'Qui est là ? Au nom du Christ, dites votre nom ! … C’est vous ? Seigneur, j’ai cru que… Sortez, je vous en prie, et n’entrez plus jamais ici à cette heure. La nuit, je ne réponds plus de rien, pas même de moi.',
    },
    activites: {
      travail: [
        'Baptêmes : deux. Mariages : un. Sépultures : quatre. Et une ligne en bas de page qui n’est pas de moi. Encore.',
        'L’Évangile de dimanche : la brebis égarée. Non. Trop de gens croiraient que je parle d’eux.',
        'Il faudrait réparer ce vitrail. Saint Aubin a perdu la tête depuis l’orage de 1902. Au sens propre, Dieu merci.',
      ],
      repas: [
        'Bénissez-nous, Seigneur, ainsi que ce repas… et la confiture. Surtout la confiture.',
        'Pain, fromage, un doigt de vin. Un doigt. Deux doigts. Le Seigneur a de grandes mains.',
        'Soupe maigre du vendredi. On m’a dit qu’elle était bonne pour l’âme ; personne n’a parlé de l’estomac.',
      ],
      priere: [
        'Pater noster, qui es in caelis… Aux cieux, Seigneur. Pas ailleurs. Nulle part ailleurs.',
        'Je ne vous demande plus de me faire comprendre cette vallée, Seigneur. Seulement de la garder.',
        'Saint Aubin, patron des vivants et des noyés, priez pour nous. Et pour ceux qui ne savent plus lesquels ils sont.',
      ],
      promenade: [
        'Un pas, un Ave. Un pas, un Ave. À ce train-là, j’arriverai au cimetière avec un chapelet complet.',
        'Tiens, un ruban noué à cette branche. Je ne l’ai pas vu. Je n’ai rien vu. Vous non plus, Seigneur, n’est-ce pas ?',
        'Les tilleuls ont fleuri. Ma mère en faisait des tisanes, en Beauce. Ici, c’est une autre qui me les fait, et je n’en dis rien à personne.',
      ],
      soir: [
        'Complies. La porte. Le verrou. La corde à la cheville. Et puis, Seigneur, ce que vous voudrez.',
        'In manus tuas, Domine… Je vous remets mon âme pour la nuit. Rendez-la-moi demain matin, dans le même état, s’il vous plaît.',
        'La lampe du sanctuaire a de l’huile ? Bien. Qu’elle brûle jusqu’à l’aube. Elle, au moins, ne s’endort pas.',
      ],
      pluie: [
        'Troisième seau depuis matines, sous la fuite du chœur. Ce toit est plus charitable que moi : il laisse tout passer.',
        'Deo gratias pour cette pluie. Si elle pouvait seulement épargner mes rhumatismes…',
        'Les nuits d’orage, on entend une cloche sous le lac. Il pleut, ce n’est pas l’orage. Ce n’est pas l’orage.',
      ],
    },
    discussions: [
      {
        avec: 'guerisseuse',
        lignes: [
          ['cure', 'Bonjour. Je passais par là. Par hasard. Pour mes rhumatismes.'],
          ['guerisseuse', 'Par hasard, et par la porte de derrière, comme mardi dernier. Asseyez-vous, mon père. Pas sur cette souche.'],
          ['cure', 'Votre tisane de l’autre fois… Elle m’a fait rêver en latin. Un latin d’avant le latin.'],
          ['guerisseuse', 'Ce n’est pas la tisane qui vous fait rêver. Elle vous empêche seulement d’oublier en vous réveillant.'],
          ['cure', 'Vous dites cela pour m’effrayer.'],
          ['guerisseuse', 'Je dis cela pour que vous dormiez fenêtre fermée. Tenez, la même. Et pas un mot à vos paroissiens : ils viendraient tous.'],
        ],
      },
      {
        avec: 'fillette',
        lignes: [
          ['fillette', 'Monsieur le curé, est-ce que les cloches, elles ont peur quand on les sonne ?'],
          ['cure', 'Les cloches n’ont pas d’âme, mon enfant ; elles ont une voix, c’est tout. Qui t’a mis cette idée en tête ?'],
          ['fillette', 'C’est Lise. Elle dit que celle du lac, elle pleure quand personne la sonne.'],
          ['cure', 'Il n’y a pas de cloche dans le lac. Récite-moi plutôt ton Je vous salue Marie.'],
          ['fillette', 'Je vous salue Marie, pleine de grâce… Monsieur le curé, pourquoi vous avez les mains qui tremblent ?'],
          ['cure', 'C’est le froid, mon enfant. Seulement le froid. Continue.'],
        ],
      },
      {
        avec: 'aubergiste',
        lignes: [
          ['aubergiste', 'Mon père ! Le vin de messe est arrivé. Il faut le goûter, voir s’il est digne de l’autel !'],
          ['cure', 'Un doigt seulement, Bonnefoy. Par devoir.'],
          ['aubergiste', 'Un doigt, deux doigts… Le Seigneur a de grandes mains, à ce qu’on dit ! À la bonne vôtre !'],
          ['cure', 'Hum. Il a comme un goût de lac, votre vin, cette année.'],
          ['aubergiste', 'C’est ce que dit {npc:forgeron} ! Vous vous êtes donné le mot ? Je le garde à la cave, pourtant, contre le mur du fond, comme toujours.'],
          ['cure', 'Changez-le de mur, Bonnefoy. Et je repasserai bénir votre cave. Une troisième fois.'],
        ],
      },
    ],
    foi_lignes: [
      'La foi, ce n’est pas de ne pas avoir peur, mon enfant. C’est d’avoir peur à genoux plutôt que debout.',
      'Saint Aubin est le patron de la vallée, et celui de l’église noyée sous le lac. Il a deux paroisses, une qui prie et une qui se tait, et je dis la messe pour les deux.',
      'Les Anciens ? De vieilles pierres que des gens de bonne foi ont prises pour des dieux. Je ne les méprise pas, mon enfant ; je les plains d’être si seules, là-haut, sous la pluie.',
      'Ceux d’en bas… Ne prononcez pas cela sous mon toit. Il y a des prières qui montent et d’autres qui descendent, et je passe mes nuits à veiller qu’elles ne se croisent pas.',
    ],
    reaction_piete: {
      eglise: 'Je vous vois souvent à l’autel, mon enfant, et votre prière est droite ; dans cette paroisse, c’est une chose rare. Si un jour je ne suis plus là, j’aimerais que ce soit quelqu’un comme vous qui garde la clé.',
      anciens: 'Vous sentez la sauge, la fumée et le lait des offrandes, mon enfant. Je ne vous juge pas. Je crains seulement que ces vieilles pierres ne vous aiment davantage que vous ne les aimez.',
      dessous: 'Arrêtez-vous. Là. Il y a sur vous un froid que je connais, celui qui monte de la crypte les nuits où la lampe s’éteint seule. Qu’avez-vous promis, mon enfant ? Non, ne le dites pas. Pas ici.',
    },
    fete_lignes: [
      'Aujourd’hui, j’ai un an de plus, et pas un gramme de sagesse. Chez les prêtres, on ne fête pas les anniversaires, mais les saints ; pour un pot de confiture, pourtant, je ferais une exception.',
      'Merci d’y avoir pensé, mon enfant. Ma mère était la seule à se souvenir de ce jour ; chaque année, elle m’envoyait une paire de chaussettes tricotées, et la dernière, je n’ai jamais osé la porter.',
    ],
    secret: 'Vous vous souvenez du ruban bleu, dans mon bréviaire ? Il n’y est plus. En 1887, pendant le croup, une petite fille de onze ans étouffait, et j’avais épuisé toutes mes prières ; alors, une nuit, je suis allé nouer le ruban d’Eugénie à {lieu:source}. L’enfant a vécu, elle vit encore dans cette ville, elle n’en sait rien, et moi, je ne sais toujours pas qui remercier.',
  },
  // --------------------------------------------------------------------------
  garde: {
    foi: 'eglise', devotion: 2, fete: 22,
    mythes: ['bete_des_combes', 'chasse_volante'],
    mythe_intro: [
      'Je vais vous raconter une histoire, mais pas trop fort, et pas après le coucher du soleil. C’est ma grand-mère qui me l’a apprise, pour que je rentre avant la nuit : ça a marché, et ça marche encore.',
      'Repos, {fermier}, asseyez-vous. Ce qui suit n’est pas dans le règlement, mais ça devrait y être.',
    ],
    histoire: [
      { titre: 'La lanterne du cousin', min: 0, texte: 'Petit, j’avais peur de tout : du grenier, de la cave, du puits, et surtout de la fin du jour. Ma grand-mère Grosjean me racontait la Bête des Combes, qui rôdait encore, disait-elle, du côté de {lieu:bergerie}, et je rentrais avant la nuit, croyez-moi, en courant. Les soirs où je traînais chez les Marchal, mon cousin {npc:forgeron} me raccompagnait avec une lanterne, sans dire un mot, et il me la donnait à tenir, pour que j’aie les mains occupées. Aujourd’hui encore, quand il me voit trembler, il me met quelque chose dans les mains. Un marteau, un pain, n’importe quoi.' },
      { titre: 'La Betsiboka', min: 0, texte: 'À vingt-quatre ans, on m’a envoyé à Madagascar, avec l’expédition de quatre-vingt-quinze. On a remonté un fleuve rouge qui s’appelait la Betsiboka, en poussant des charrettes de fer qui s’enfonçaient dans la boue. La fièvre a tué plus d’hommes que tout le reste ensemble ; moi, elle m’a seulement gardé trois mois à l’hôpital de Majunga, à claquer des dents sous un soleil de plomb. J’en suis revenu avec vingt kilos de moins et l’habitude de dormir le fusil contre la joue. Le fusil, je l’ai rendu ; l’habitude, je l’ai gardée.' },
      { titre: 'Les bans d’Hortense', min: 1, texte: 'En rentrant, je devais épouser Hortense Brunet, la fille du sabotier du bourg voisin. Nos bans étaient affichés à la porte de {lieu:mairie}, nos deux noms bien alignés. Et puis le maire m’a offert la place de garde de nuit, et Hortense m’a dit : « Je ne veux pas d’un mari que je ne verrais qu’à la lueur d’une lampe. » C’est moi qui ai décroché l’affiche, le lendemain, avant l’ouverture. Je l’ai pliée en huit, et elle est dans mon portefeuille, avec ma feuille de route et une photographie de ma mère.' },
      { titre: 'Retour à l’envoyeur', min: 2, texte: 'Ma mère est morte en février quatre-vingt-seize, pendant que je grelottais à Majunga. Sa dernière lettre m’a couru après pendant des mois, de navire en caserne, puis elle est revenue ici avec un tampon : « retour à l’envoyeur ». L’envoyeur était au cimetière depuis des mois. C’est moi qui l’ai ouverte, dans sa cuisine, sur sa table. Trois lignes sur les poules et le prix du sel, et à la fin, comme toujours : « Rentre avant la nuit, mon grand. »' },
      { titre: 'Quarante et un', min: 3, texte: 'Les pas sur le pont sud, vers trois heures, je les entends depuis le pont nord, et je les compte. Quarante-deux pour monter le long du tablier dressé, quarante-deux pour redescendre : des pieds nus, ça s’entend, et qui ne se pressent pas. Une nuit de juin, il n’y en a eu que quarante et un pour redescendre, et depuis, je me demande où est resté le dernier. Je fais ma ronde la manivelle serrée contre le ventre, en récitant des Ave à voix haute pour ne pas entendre mon cœur. Il m’arrive de me réveiller dans la guérite au petit jour, debout, la pique à la main, sans me rappeler m’être levé.' },
      { titre: 'Neuf heures deux', min: 4, texte: 'Le père Jouvet, le colporteur, passait deux fois l’an avec ses aiguilles, ses almanachs et ses rubans. Un soir d’automne, il est arrivé au pont nord à neuf heures deux, deux minutes après la levée, et je le lui ai dit : le règlement, c’est le règlement. Il m’a répondu « Je comprends, mon garçon », puis il s’est assis sur sa balle pour attendre l’aube, en sifflotant. Au matin, il n’y avait plus que la balle, et tous ses almanachs ouverts à la page des lunes. J’aurais pu attendre deux minutes, {fermier} : personne ne l’aurait jamais su.' },
      { titre: 'Un chien', min: 6, texte: 'Je voudrais un chien, {prenom}. Un gros, qui aboie pour un rien : comme ça, la nuit, c’est lui qui aurait peur à ma place, et moi, je n’aurais plus qu’à le rassurer. Je crois que je saurais très bien faire ça ; j’ai de l’expérience. Le maire dit que les chiens sont interdits à la guérite, mais j’ai relu le règlement douze fois, et il n’en parle nulle part. Je l’appellerai Courage : comme ça, j’en aurai toujours un peu à côté de moi.' },
      { titre: 'Qui vive', min: 8, texte: 'À Madagascar, une nuit de faction, j’ai vu bouger les hautes herbes devant le poste. J’ai crié « Qui vive ? » une fois, pas deux, parce que j’avais trop peur pour attendre la réponse, et j’ai tiré. C’était Yves Le Goff, un petit Breton de dix-neuf ans, qui était sorti vomir sa fièvre en silence pour ne réveiller personne. Le rapport a dit « mort de fièvre » : le sergent l’a écrit pour moi, et je l’ai laissé faire. Depuis, je ne porte plus qu’une pique, pour voir qui je touche, et je garde les ponts la nuit, {prenom}, parce que c’est là que la peur habite. Je me suis dit que si je restais avec elle, elle ne ferait de mal à personne d’autre.' },
    ],
    questions: [
      {
        id: 'garde_q1', min: 0,
        texte: 'Question de service, {fermier}, pour mon rapport : avez-vous peur du noir ?',
        reponses: [
          { label: 'Un peu, oui. Comme tout le monde, je crois.', amitie: 20, reaction: 'Comme tout le monde… Merci, vous ne savez pas le bien que ça fait. Moi, c’est beaucoup, mais c’est rassurant de ne pas être le seul.' },
          { label: 'Jamais. Le noir, c’est l’absence de lumière.', amitie: -5, reaction: 'L’absence de lumière… C’est ce que disait mon sergent, à Madagascar, et il le disait très fort, pour que la nuit l’entende. Je vous ai à l’œil, {fermier} : ceux qui n’ont peur de rien, on les repêche au matin dans les douves.' },
          { label: 'Seulement quand il fait nuit.', amitie: 10, reaction: 'Ha ! Seulement quand il fait nuit. Elle est bonne : je la mettrai au rapport, et je la dirai au maire, qui ne rira pas.' },
        ],
        rappel: [
          'Vous m’avez dit que vous aviez un peu peur du noir, vous aussi. J’y repense pendant mes rondes : ça me tient compagnie.',
          'Toujours pas peur du noir, {fermier} ? Tant mieux. Restez quand même du bon côté des ponts, pour me faire plaisir.',
          '« Seulement quand il fait nuit. » Je l’ai dite au maire, et il n’a pas ri. Moi, si, toute la nuit : ma meilleure nuit depuis des années.',
        ],
      },
      {
        id: 'garde_q2', min: 1,
        texte: 'Imaginez, {fermier} : il est minuit, le pont est levé, et de l’autre côté des douves, quelqu’un que vous aimez vous supplie de le baisser. Que faites-vous ?',
        reponses: [
          { label: 'Je baisse le pont. On n’abandonne pas les siens.', amitie: 15, reaction: 'Vous baissez… Alors vous ne serez jamais garde, et c’est tant mieux pour vous. Moi, je n’ai pas baissé, le soir où c’était la voix de ma mère, et je me demande chaque nuit si c’était elle.' },
          { label: 'Je laisse le pont levé. Le règlement nous protège.', amitie: 5, reaction: 'Réponse réglementaire. Parfaite. Vous avez plus de cran que moi, {fermier}, ou moins de cœur, et je n’ai pas encore décidé lequel des deux me fait le plus peur.' },
          { label: 'Je lui demande le mot de passe.', amitie: 10, reaction: 'Le mot de passe ? Mais il n’y a pas de mot de passe. Enfin… oui, bonne idée, très bonne idée ; changeons de sujet, voulez-vous ?' },
        ],
        rappel: [
          'Vous baisseriez le pont, m’avez-vous dit. Si un jour c’est vous, de l’autre côté, je ne sais pas ce que je ferai. Je préfère ne pas le savoir.',
          'Le pont reste levé, disiez-vous. J’ai pensé à vous cette nuit, quand ça a frappé, et j’ai tenu bon. Merci.',
          'Le mot de passe… J’y repense depuis que vous en avez parlé. Ne répétez à personne que vous en avez parlé.',
        ],
      },
      {
        id: 'garde_q3', min: 2,
        texte: 'Dites-moi, {fermier}… qu’est-ce qui vous fait tenir, vous, quand vous avez peur ?',
        reponses: [
          { label: 'Je pense aux gens que j’aime.', amitie: 20, reaction: 'Aux gens qu’on aime… Moi, je pense à ma mère, à mon cousin, et à vous, maintenant, un peu. Ça fait une petite garnison, mais c’est mieux que rien.' },
          { label: 'Rien. J’attends que ça passe.', amitie: 0, reaction: 'Vous attendez que ça passe… Ça ne passe pas toujours, {fermier} : parfois ça s’assoit à côté de vous, et ça attend avec vous. Mais ça finit toujours par se lever avant l’aube.' },
          { label: 'Je chante faux. Ça fait fuir les monstres.', amitie: 15, reaction: 'Chanter ! Je n’y avais jamais pensé. Ma mère chantait en écossant les petits pois, et rien n’osait entrer dans la cuisine ; j’essaierai cette nuit, tant pis pour le maire.' },
        ],
        rappel: [
          'J’ai pensé à ce que vous m’avez dit, les gens qu’on aime. Cette nuit, j’ai passé ma garnison en revue : vous étiez au rapport.',
          'Toujours à attendre que ça passe, {fermier} ? Si ça ne passe pas, venez attendre à la guérite. À deux, ça passe plus vite.',
          'J’ai chanté toute la nuit, comme vous me l’aviez conseillé. Rien n’est venu, pas même le maire, mais trois chiens ont hurlé avec moi, et il n’y a pas de chiens en ville.',
        ],
      },
      {
        id: 'garde_q4', min: 4,
        texte: 'Si tout allait mal, {fermier}, vraiment mal, un soir de lune rouge… à qui feriez-vous confiance, dans cette ville ?',
        reponses: [
          { label: 'À vous, garde. Vous tenez les ponts.', amitie: 30, reaction: 'À moi ? Personne ne m’avait jamais… Enfin, merci : je tâcherai d’en être digne, même la nuit, surtout la nuit.' },
          { label: 'À personne. Pas même à vous.', amitie: -15, reaction: 'À personne… C’est peut-être la réponse la plus sage de toute la vallée, et la plus triste. Je vais faire ma ronde.' },
          { label: 'Au chat du maire. Il a l’air de tout savoir.', amitie: 10, reaction: 'Préfet ? Ce chat-là ne fait confiance à personne, pas même au maire. Il me regarde faire ma ronde tous les soirs depuis la fenêtre de la mairie, comme un inspecteur ; vous avez peut-être raison.' },
        ],
        rappel: [
          'Vous m’avez dit que vous me feriez confiance. Je l’ai écrit sur un papier, et je l’ai rangé dans mon portefeuille, avec ce que j’ai de plus précieux.',
          'À personne, disiez-vous. J’y ai bien réfléchi : vous avez raison. Je lève quand même les ponts pour vous, chaque soir.',
          'J’ai surveillé Préfet toute la semaine, comme vous me l’avez suggéré. Il sait des choses, c’est certain, et il n’en dit rien : il ferait un excellent garde.',
        ],
      },
    ],
    humeurs: {
      joyeux: [
        'Rien à signaler, {fermier} ! Vraiment rien, cette fois : pas un pas, pas une voix, et j’en ai presque pleuré de joie.',
        'Repos ! Le soleil brille, les ponts sont baissés, et {npc:aubergiste} a promis du ragoût : journée réglementaire en tous points.',
        'Bonjour ! J’ai dormi trois heures d’affilée, trois ; si ça continue, je vais devenir un homme reposé.',
      ],
      triste: [
        'Excusez-moi, {fermier}, je ne suis pas très réglementaire, aujourd’hui. C’est l’anniversaire de ma mère ; elle aurait fait des crêpes.',
        'Hortense est passée au marché avec ses trois enfants, et ils sont beaux. Rien à signaler.',
        'Quatorze ans de rapports, {fermier}, et rien à signaler. C’est ça qui est triste, parfois : on ne sait même pas ce qu’on a empêché.',
      ],
      fatigue: [
        'Garde… à vous. Pardon, garde à moitié : je n’ai pas fermé l’œil de la nuit.',
        'Je me suis endormi debout contre la chaîne du pont, et j’ai encore la marque des maillons sur la joue. Ne le dites pas au maire.',
        'Si je vous parle un peu fort, ce n’est pas contre vous, {fermier} : c’est contre le sommeil.',
      ],
      inquiet: [
        'Vous n’avez rien vu sur la route, en venant, même pas un épouvantail ? Bon… bon.',
        'La manivelle était glacée, ce matin, alors qu’elle a passé la nuit contre moi. Comment peut-elle être froide ?',
        'Halte ! Pardon, {fermier}, je suis nerveux : on a frappé à la guérite cette nuit, et j’ai reconnu la façon de frapper.',
      ],
      agace: [
        'Circulez. Et dites à ceux qui ont gravé « POLTRON » sur ma guérite que je les ai vus… enfin, que je les verrai.',
        'Le maire voudrait lever les ponts dix minutes plus tard, l’été : dix minutes ! Le règlement n’a pas de saisons, lui.',
        'Non, je ne baisserai pas le pont en dehors des heures, même pour vous. Surtout pas pour le curé : il le demande toujours en latin.',
      ],
    },
    souvenirs: {
      cadeau_adore: [
        'Je n’ai pas oublié votre {objet}. Personne ne m’avait fait de cadeau depuis ma mère ; je l’ai noté au rapport : « nuit calme, cadeau reçu ».',
        'Votre {objet}, je l’ai montré à mon cousin. Il a dit « Hm ». Chez lui, c’est de l’admiration.',
      ],
      cadeau_deteste: [
        'Votre {objet}… Je l’ai jeté dans les douves, et il est remonté. Même les douves n’en voulaient pas.',
        'J’ai consigné votre {objet} au rapport, à la rubrique « objets suspects ». C’est la seule entrée de l’année.',
      ],
      aide: [
        'Vous m’avez donné un coup de main, et je ne l’oublie pas. Si un soir vous arrivez au pont à neuf heures deux, j’attendrai. Hors règlement.',
        'Grâce à vous, j’ai dormi une nuit presque entière. Presque. C’est déjà beaucoup plus que d’habitude.',
      ],
      toque_nuit: [
        'L’autre nuit, on a frappé chez moi, trois coups. On m’a dit ce matin que c’était vous. J’espère que c’était vous. Vous me le jurez ?',
        'Ne frappez plus jamais à ma porte la nuit, {fermier}. J’ai passé des heures derrière, la pique à la main, à me demander quelle voix vous alliez prendre.',
      ],
      coup: [
        'Vous m’avez frappé, moi, un agent de la force publique ! Enfin, de la petite force publique. Je n’ai pas riposté ; je ne riposte plus depuis longtemps.',
        'J’ai encore le bleu, {fermier}. Je le regarde dans le miroir de la guérite, et je me demande ce que j’ai fait pour le mériter.',
      ],
      absence: [
        'Ah, vous voilà ! J’ai demandé de vos nouvelles à tous les passants, même à ceux qui n’en avaient pas l’air.',
        'Ça faisait longtemps ! Chaque soir, avant de lever les ponts, je regardais la route, au cas où. Au cas où vous.',
      ],
      victime: [
        'J’ai levé les ponts, comme chaque soir, tout était en ordre, et quelqu’un est mort quand même. À quoi je sers, {fermier} ? Dites-le-moi.',
        'Depuis le malheur, je fais ma ronde deux fois, trois parfois. Je ne sais pas ce que je cherche ; je sais seulement que je ne veux pas le trouver.',
      ],
    },
    tenue: {
      arme: 'Halte ! Ah… c’est vous. Une arme en ville, {fermier}, c’est contraire au règlement, et à mes nerfs. Baissez-la. Doucement.',
      pelle: 'Une pelle ? Ne creusez pas près des douves, je vous en prie. Il y a des choses, là-dessous, qui dorment, et moi, je ne dors pas : laissons au moins dormir les autres.',
      potion: 'Qu’est-ce que c’est, cette fiole ? Ça rend courageux ? Non ? Dommage, j’en aurais pris une caisse.',
      animal_mort: 'Qu’est-ce qui l’a tuée, cette bête ? Vous ? Ah. Bon. Tant mieux… Enfin, tant mieux que ce soit vous.',
      fleurs: 'Des fleurs… Ma mère en mettait toujours à la fenêtre de la cuisine ; elle disait que ce qui rôde n’aime pas les fleurs. J’ai des géraniums à la guérite, au cas où.',
      poisson: 'Du poisson ! Pas pêché dans les douves, au moins ? Ce qui remonte des douves après la nuit, on ne le mange pas. Ce n’est écrit nulle part, mais on ne le mange pas.',
      lanterne_jour: 'Une lanterne allumée en plein jour ! Vous avez raison, j’en ai toujours une aussi. Éteinte, mais toujours, au cas où le soleil tomberait en panne.',
      relique: 'Halte ! Qu’est-ce que vous tenez là ? Ça ne vient pas d’ici, ça vient d’avant. Rangez-le, s’il vous plaît : je n’aime pas la façon dont il me regarde.',
      rien: 'Les mains vides ? Rien à déclarer, parfait. Circulez… ou restez un peu, si vous voulez : le pont ne va pas s’envoler.',
    },
    chez_soi: {
      jour: 'Halte ! Ah, c’est vous. Vous êtes chez le garde, {fermier}, et il n’y a rien à voir : un lit de camp, une cafetière et le règlement. Ne touchez pas au règlement, il est rangé par articles.',
      nuit: 'QUI VA LÀ ? Ne bougez plus, je suis armé ! … C’est vous ? Non, ne dites rien. Reculez vers la porte, doucement, les mains bien en vue. Je vous crois. Je veux vous croire. Sortez.',
    },
    activites: {
      travail: [
        'Chaînes : graissées. Manivelle : à la ceinture. Pique : au clair. Garde : présent. Moral : on verra.',
        'Pont nord, rien. Pont sud, rien. Douves… un peu plus hautes qu’hier. À noter. Non. À ne pas noter.',
        'Article premier : tout doit être en ordre. Article deux… c’était quoi, l’article deux ? Ah. Oui. Oh.',
      ],
      repas: [
        'Du ragoût ! Un vrai, avec des morceaux. Aujourd’hui, il ne peut rien m’arriver.',
        'Pas de champignons, j’ai dit. Jamais de champignons. On ne sait pas sur quoi ils ont poussé.',
        'Du pain, une soupe, un café : le repas du soldat. Et un deuxième café : le repas du garde de nuit.',
      ],
      priere: [
        'Je vous salue Marie, pleine de grâce… et protégez les ponts, les deux. Surtout le sud.',
        'Seigneur, je ne vous demande pas du courage. Juste un peu moins de peur. C’est plus facile à livrer, non ?',
        'Pour maman. Pour le cousin. Pour le petit Le Goff. Pour tous ceux qui seront dehors ce soir. Amen.',
      ],
      promenade: [
        'Un, deux, un, deux. Une ronde, c’est comme une prière : on ne sait pas si ça sert, mais on la fait.',
        'Tiens, des traces de pas. Pieds nus. Qui marche pieds nus en ville ? … Pas moi. Non. J’ai mes bottes.',
        'Pas un nuage, pas d’orage. Pas de Chasse, ce soir. Pas de Chasse.',
      ],
      soir: [
        'Neuf heures moins le quart ! Tout le monde rentre ! Allez, allez, les retardataires !',
        'Dernier coup d’œil sur la route. Personne. Personne. Personne… Bien. Je lève.',
        'La nuit tombe. Bonsoir, la nuit. Je vous ai à l’œil, vous aussi.',
      ],
      pluie: [
        'Il pleut dans ma guérite, il pleut sur mon rapport, il pleut sur mon moral. Rien à signaler.',
        'Les douves montent. Elles montent toujours quand il pleut. C’est de l’eau. C’est de l’eau, rien d’autre.',
        'Un temps de Chasse, ça. Si ça tonne, face contre terre, Grosjean, et on ne lève pas le nez. Même si ça appelle.',
      ],
    },
    discussions: [
      {
        avec: 'forgeron',
        lignes: [
          ['garde', 'Cousin ! Tu pourrais me forger une manivelle de rechange ? Pour le pont sud. Au cas où.'],
          ['forgeron', 'Pourquoi deux ?'],
          ['garde', 'Au cas où, j’ai dit. Si la première disparaît. Ou si elle se retrouve… ailleurs.'],
          ['forgeron', 'Hm. Demain.'],
          ['garde', 'Merci. Et toi, tu dors bien, en ce moment ?'],
          ['forgeron', 'Non. Toi non plus. Tiens. Un pain. Mange.'],
        ],
      },
      {
        avec: 'fillette',
        lignes: [
          ['fillette', 'Monsieur le garde, pourquoi tu regardes dans le puits de la place, tous les jours à trois heures ?'],
          ['garde', 'Je vérifie le niveau, mademoiselle. C’est dans mes attributions.'],
          ['fillette', 'Lise dit que c’est pas le niveau que tu regardes. Elle dit que tu regardes si quelqu’un te regarde.'],
          ['garde', 'Il n’y a personne dans les puits. Les puits, c’est pour l’eau. C’est… réglementaire.'],
          ['fillette', 'Alors pourquoi il t’a fait coucou, hier ?'],
          ['garde', 'Rentre chez ta mère. Tout de suite. S’il te plaît. S’il te plaît.'],
        ],
      },
      {
        avec: 'aubergiste',
        lignes: [
          ['garde', 'Un ragoût, patron. Sans champignons. Surtout sans champignons.'],
          ['aubergiste', 'Sans champignons, avec double lard ! Parole de Bonnefoy, tu vas reprendre des couleurs, mon vieux.'],
          ['garde', 'Mon cousin vous doit toujours trois mois d’ardoise ?'],
          ['aubergiste', 'Quatre, maintenant ! Mais il m’a refait la crémaillère pour rien, alors on s’arrange. Surtout lui.'],
          ['garde', 'Il passe un quart d’heure chaque matin à la boulangerie. Pour un seul pain.'],
          ['aubergiste', 'Un quart d’heure pour un pain ! S’il mettait autant de temps à me payer, je serais rentier. Mange, ça refroidit.'],
        ],
      },
    ],
    foi_lignes: [
      'Je prie beaucoup, oui. Pas par sainteté, {fermier} : par précaution. Un Ave avant de lever les ponts, un autre après, et entre les deux, autant que j’ai de peur.',
      'Le curé dit que Dieu voit tout, même la nuit. C’est pour ça que je laisse la lanterne allumée : pour qu’il voie mieux. On ne sait jamais.',
      'Les pierres des Anciens, je ne m’en approche pas. Ce n’est pas que je n’y crois pas ; c’est que j’y crois un peu trop.',
      'Ceux d’en bas… Ma grand-mère disait qu’il ne faut jamais leur répondre, même pour dire non. Surtout pas pour dire non : ils prennent ça pour une conversation.',
    ],
    reaction_piete: {
      eglise: 'On vous voit souvent prier, {fermier}, et ça me rassure. Si un jour je n’ai plus le courage de le faire, vous prierez pour deux ?',
      anciens: 'Vous sentez la sauge et la fumée, {fermier}. Ma grand-mère aussi, le soir, quand elle revenait des vieilles pierres en cachette du curé ; elle en revenait toujours plus calme, et moi, rien que d’y penser, je tremble.',
      dessous: 'Halte. Restez là. Vous avez le même froid que les voix de l’autre côté des douves, {fermier}. Qu’est-ce que vous leur avez donné ? Et qu’est-ce qu’ils vous ont donné en échange ?',
    },
    fete_lignes: [
      'C’est mon anniversaire, {fermier}. Mon cousin m’a cloué un fer à cheval au-dessus de la porte de la guérite, sans dire un mot : chez les Marchal, c’est une déclaration d’affection.',
      'Un an de plus, et toujours peur du noir. Ma mère disait qu’on grandit toute sa vie ; je dois être encore petit.',
    ],
    secret: 'Il n’y a pas de mot de passe à la guérite : c’est ce que je dis à tout le monde. C’est faux. Il y en a un, que je n’ai confié à personne, ni au maire ni à mon cousin : « mon grand », comme dans les lettres de ma mère. Trois fois cette année, à travers la porte, quelqu’un me l’a donné.',
  },
});
