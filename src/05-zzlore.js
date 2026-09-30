// ============================================================================
//  LÉGENDES, FOIS ET TEXTES DES NOUVEAUX LIEUX
//  (fichier de données pur : constantes globales, aucune logique)
// ============================================================================

// Légendes, fois et textes des nouveaux lieux
const MYTHS = {
  // --------------------------------------------------------------------------
  cerf_blanc: {
    titre: 'Le Cerf Blanc',
    resume: 'Le gardien de la forêt se montre à l’aube à ceux que les Anciens aiment, et les mène jusqu’à sa clairière cachée.',
    texte: 'Il n’est pas blanc comme la neige, le Cerf. Il est blanc comme le givre sur les carreaux, d’un blanc qu’on voit à travers. Mon grand-père l’a vu une fois, un matin d’octobre, au bord du bois de bouleaux, et jusqu’à sa mort il en a parlé avec la voix qu’il prenait pour ma grand-mère. Le Cerf ne se montre qu’à l’aube, quand la nuit n’est pas tout à fait partie et que le jour hésite encore. Et il ne se montre qu’à ceux que les Anciens aiment : ceux qui laissent leur part à la Mère, qui nouent un ruban à la source, qui saluent les pierres en passant. Les autres peuvent user leurs sabots dans les bois, ils ne verront que des chevreuils. Quand il vous a vu, il s’en va au pas, en tournant la tête pour savoir si vous suivez. Alors suivez-le, au pas. Ne courez jamais derrière lui : ce qui court derrière une bête, c’est un chasseur, et devant un chasseur il n’y a plus de Cerf, seulement du brouillard. Et ne tirez pas. Un gars de {hameau} a tiré, une fois : il a tourné trois jours dans un bois qu’il connaissait depuis l’enfance, et il en est ressorti les cheveux blancs. Si vous marchez bien, il vous mène au cœur des bouleaux, dans une clairière ronde où les troncs sont blancs comme des cierges, autour d’une pierre sculptée de bois de cerf. Agenouillez-vous là, et priez les Anciens. Il sera déjà parti. Mais il vous aura laissé quelque chose.',
    indice: 'Honorer d’abord les Anciens, puis guetter l’aube près du bois de bouleaux ; suivre le Cerf au pas, sans courir ni tirer, et prier à la pierre de sa clairière.',
    decouverte: 'Les bouleaux se referment derrière vous comme une porte qu’on tire sans bruit. Au centre de la clairière, la pierre porte des bois sculptés, adoucis par des siècles de pluie, et sur la mousse, là où le Cerf se tenait, l’herbe est restée couchée, encore tiède. Vous n’avez pas couru. Pour la première fois depuis votre arrivée, vous avez le sentiment d’avoir été attendu.',
  },
  // --------------------------------------------------------------------------
  dame_du_lac: {
    titre: 'La Dame du Lac',
    resume: 'Une fiancée noyée devenue l’âme du lac : elle rend une larme à qui lui porte des fleurs la nuit, et garde tout ce que l’eau a pris.',
    texte: 'Avant le grand lac, il y avait les Eaux : un étang profond, noir comme un puits, au pied du village de Saint-Aubin. Une fille du village y attendait son fiancé, parti à la guerre du roi. Chaque soir, elle descendait au bord avec des fleurs et une perle de son collier de noces, et elle les jetait à l’eau pour qu’il revienne. Au bout de trois ans, il ne restait plus une perle au fil. Alors, une nuit, elle a mis son voile et elle est entrée dans l’étang, doucement, comme on s’avance vers l’autel. On ne l’a jamais repêchée. Depuis, l’eau, c’est elle. C’est la Dame. Elle donne le poisson à ceux qui la respectent, et elle garde ce qu’elle prend : les barques, les noyés, les bagues, les cloches. Elle ne rend rien, ou presque rien. Sur la rive, il y a sa pierre, une petite femme voilée, les mains jointes. Si vous y déposez des fleurs, ou une perle, la nuit, jamais le jour, elle vous rend une larme. Une seule : une goutte plus froide que l’eau, qui ne sèche pas, et qu’on recueille dans une fiole. Les guérisseuses en tirent des choses qu’on ne dit pas à voix haute. Et le lendemain, les poissons viennent à votre ligne comme des chiens qu’on siffle. Certains disent que c’est elle qui a pris Saint-Aubin, en 1791. D’autres, qu’elle l’a seulement gardé, comme on garde ce qu’on aime.',
    indice: 'La nuit, jamais le jour : déposer des fleurs ou une perle sur la pierre de la Dame, au bord du grand lac, et recueillir la larme qu’elle rend.',
    decouverte: 'Sur la pierre, entre vos fleurs, une goutte tremble et ne coule pas. Elle est si froide qu’elle vous mord le bout des doigts quand vous la faites glisser dans la fiole. Derrière vous, le lac a cessé de clapoter, comme quelqu’un qui retient son souffle. Puis une petite vague, une seule, vient mourir contre vos pieds.',
  },
  // --------------------------------------------------------------------------
  cloche_noyee: {
    titre: 'La Cloche noyée',
    resume: 'Le clocher du village englouti de Saint-Aubin-des-Eaux repose au milieu du lac, et sa cloche sonne encore sous l’eau les nuits d’orage.',
    texte: 'Au fond du grand lac, il y a un village. Saint-Aubin-des-Eaux, il s’appelait : des maisons, un lavoir, une église, et un saint Aubin de bois peint au-dessus de la porte. En 1791, on a supprimé la paroisse pour la réunir à la ville, et ceux du district devaient venir descendre la cloche pour en faire des sous. La veille, le sacristain a caché le calice dans un coffre, sous les marches du clocher. Et cette nuit-là, l’eau est montée. Sans pluie, sans crue : elle est montée, voilà tout, comme on remonte une couverture sur un enfant qui dort. Au matin, il n’y avait plus de village. Il y avait le lac. La cloche, personne ne l’a jamais retrouvée. Le clocher, par temps calme, on le devine encore au milieu du lac, là où l’eau devient noire, et il est vide. Pourtant, les nuits d’orage, on l’entend sonner sous l’eau, lentement, comme pour un enterrement qu’on n’a jamais fait. Le coffre du sacristain doit y être encore. Seulement, c’est profond, l’eau est froide, et aucun homme ne retient son souffle aussi longtemps. Il faudrait, disaient les anciens, « boire le souffle de l’anguille » : c’est une affaire de fiole et d’alambic, pas de courage. Et une fois en bas, ne vous attardez pas devant les fenêtres. Il paraît qu’il y a encore de la lumière derrière certaines.',
    indice: 'Plonger au milieu du grand lac, là où l’eau devient noire : le clocher et le coffre du sacristain sont au fond, mais il faut d’abord « boire le souffle de l’anguille », une potion pour respirer sous l’eau.',
    decouverte: 'Le clocher sort de la vase comme un doigt levé. Derrière les abat-sons, il n’y a pas de cloche, seulement de l’eau immobile, et pourtant vous sentez contre votre poitrine le bourdonnement d’un son très grave, comme si elle venait de se taire. Sous les marches, le coffre du sacristain vous attendait. Il n’est pas rouillé : il est seulement froid.',
  },
  // --------------------------------------------------------------------------
  treize_pierres: {
    titre: 'Les Treize Pierres',
    resume: 'Le cercle comptait treize pierres ; la treizième marche la nuit, et les années où elle revient, la pierre du centre s’ouvre.',
    texte: 'Comptez les pierres du cercle : vous en trouverez douze. Les vieux vous diront qu’il y en avait treize au commencement, qu’il y en a toujours treize, seulement la treizième n’est pas souvent là. Elle marche. Pas comme nous : personne ne l’a jamais vue bouger. Mais un soir, elle se dresse au bout du champ de quelqu’un, noire, plus haute qu’un homme ; le lendemain matin, elle est sur la crête, et le surlendemain, plus rien. Les chiens se couchent quand elle est là. On dit qu’elle compte les vivants, et que pendant qu’elle compte, il vaut mieux ne pas bouger non plus. Les douze, elles, veillent en rond et attendent qu’elle revienne. Certaines années, elle revient. On passe devant le cercle un matin, on compte machinalement, et on trouve treize. On recompte : treize. Ces années-là, et seulement ces années-là, la pierre du centre n’est plus tout à fait fermée. Il faut venir la nuit, entre minuit et deux heures, pas avant, pas après, s’agenouiller devant l’autel et prier. Alors la pierre du centre s’ouvre, comme une trappe de cave, sur des marches qui descendent dans la terre. Ce qu’il y a en bas, on dit que c’est le compte : tous les noms de la vallée, depuis toujours, gravés pour que quelqu’un s’en souvienne. Qui y descend en remonte plus vieux, ou plus sage. Mais qu’il remonte avant deux heures.',
    indice: 'Compter les pierres du cercle : les années où il y en a treize, prier à l’autel entre minuit et deux heures, et regarder la pierre du centre.',
    decouverte: 'La pierre du centre glisse sur elle-même avec un bruit de meule, et un souffle monte de la terre, froid et sec, qui sent le silex qu’on vient de fendre. Des marches descendent, creusées au milieu par des pieds qui n’ont pas laissé de nom. Autour de vous, les treize pierres se tiennent très droites. Vous avez la certitude qu’elles comptent vos pas.',
  },
  // --------------------------------------------------------------------------
  tresor_valmont: {
    titre: 'L’Or des Valmont',
    resume: 'En fuyant la vallée en 1791, le dernier comte de Valmont enterra son or et fit graver quatre bornes pour le retrouver.',
    texte: 'Les Valmont ont tenu la vallée quatre cents ans, du haut de leur château sur la butte. Des chasseurs, des plaideurs, des durs à cuire. Le dernier, le comte Aymar, a vu venir la Révolution comme on voit venir l’orage : trop tard pour rentrer les foins. Au printemps de 1791, il a fait atteler de nuit pour passer la frontière. Mais l’or, on ne passe pas les montagnes avec : c’est trop lourd, et ça fait trop de bruit. Alors il l’a enterré, lui et son intendant, une nuit sans lune, à deux pas de chez lui. Et pour retrouver l’endroit quand il reviendrait, il a fait poser quatre bornes dans la vallée, loin les unes des autres, comme de simples bornes de champ. Sur chacune, un chiffre de I à IV, l’année 1791, et une flèche gravée. Les flèches ne suivent aucun chemin : elles montrent l’or. Là où leurs lignes se croisent, près des ruines du château, il n’y a plus qu’à creuser. Le comte n’est jamais revenu. L’intendant est mort l’hiver suivant sans rien dire à personne. Et depuis plus de cent ans, les gens d’ici retournent les caves du château à la pioche, parce que l’or d’un seigneur, c’est forcément dans sa cave, pas vrai ? Ils n’y trouvent que des bouteilles vides. Moi, je dis : trouvez les quatre bornes, tirez vos lignes, prenez une pelle. L’or d’un seigneur n’est jamais là où on le cherche. Il est là où il l’a montré.',
    indice: 'Trouver les quatre bornes gravées d’une flèche (I à IV, 1791), suivre leurs lignes jusqu’à leur croisement, près des ruines du château de Valmont, et y creuser à la pelle.',
    decouverte: 'La pelle heurte du bois, puis du fer. Le coffre des Valmont est lourd comme un remords, et quand vous soulevez le couvercle, une odeur de cuir et de poudre à perruque s’en échappe, plus de cent ans après. Sur l’or, posé bien en évidence, il y a le sceau de la famille, comme si le comte avait tenu à ce qu’on sache qui avait tout laissé là.',
  },
  // --------------------------------------------------------------------------
  bete_des_combes: {
    titre: 'La Bête des Combes',
    resume: 'Un loup monstrueux qui ravagea les hauteurs de 1764 à 1767 ; blessé par un chasseur, il s’est terré dans une grotte et n’est jamais mort.',
    texte: 'Ça a commencé à la Saint-Jean de 1764, par une petite bergère des Combes qu’on a retrouvée dans les genêts. Après, pendant trois ans, la Bête a pris ce qu’elle voulait : des moutons par dizaines, des chiens, et des enfants, surtout des enfants, ceux qui gardaient les troupeaux là-haut. Ceux qui l’ont vue et qui en sont revenus parlaient d’un loup grand comme un veau, roux, avec une raie noire sur l’échine et une odeur de charogne qu’on sentait avant de la voir. Le seigneur de Valmont a fait des battues, le roi a envoyé ses louvetiers, on a tué des loups par centaines dans la vallée. Jamais le bon. Et puis, la nuit de la Saint-Martin 1767, pendant l’orage où le vieux seigneur s’est perdu avec ses gens, un de ses piqueux, Blaise Coste, lui a planté son épieu dans le flanc, un épieu forgé en ville par un Marchal. Le fer a cassé dans la plaie. La Bête est partie en hurlant vers les hauteurs, et Blaise l’a suivie à la trace du sang. On n’a jamais revu ni l’un ni l’autre. Ce que je crois ? Qu’elle s’est terrée dans une grotte, là-haut, que la montagne a refermé l’entrée derrière eux, et qu’elle dort. Ces bêtes-là ne meurent pas d’un fer dans le flanc : elles attendent. L’entrée est sous un éboulis, quelque part dans les hauteurs, à dégager à la pelle, si on est assez fou pour ça. Et si vous la trouvez, marchez doucement, et ne lui mettez pas de lumière dans les yeux.',
    indice: 'Chercher dans les hauteurs un éboulis qui cache l’entrée d’une grotte, le dégager à la pelle, puis avancer sans bruit : la Bête dort, et son chasseur est resté avec elle.',
    decouverte: 'Au fond de l’antre, quelque chose respire. Lentement, profondément, avec le bruit d’un soufflet de forge qu’on n’aurait jamais cessé de pousser depuis bientôt cent cinquante ans. Contre la paroi, un squelette tient encore son fusil sur les genoux, tourné vers le noir. Blaise Coste n’a jamais quitté son poste.',
  },
  // --------------------------------------------------------------------------
  feux_follets: {
    titre: 'Les Feux follets',
    resume: 'Les âmes des noyés du marais mènent les imprudents à la vase, ou à l’or qu’ils ont laissé derrière eux.',
    texte: 'Le marais a pris du monde depuis qu’il y a du monde. Des colporteurs qui coupaient par là pour gagner une heure, des faux-sauniers qui passaient le sel en fraude du temps de la gabelle, une noce entière un soir de brouillard, le violoneux en tête. Et des enfants, qui voulaient voir les lumières de plus près. Parce que les lumières, ce sont eux. Les feux follets. De petites flammes bleues qui vont et viennent au ras de l’eau, qui reculent quand on avance et reviennent quand on recule. Chaque noyé a la sienne. Elles ne sont pas méchantes, pas toutes. Elles s’ennuient, elles ont froid, elles voudraient de la compagnie. Suivez-les, et elles vous mènent tout droit à la vase, et la vase ne rend rien. Mais écoutez bien : il ne faut pas les suivre, il faut les regarder. Les nuits calmes, au bout d’un moment, elles cessent de courir et se rassemblent toutes au même endroit, au-dessus de l’îlot, au milieu du marais. C’est là que les faux-sauniers enterraient leur caisse, et c’est là qu’ils sont restés, à la garder. Les follets montrent l’or des noyés à qui ne leur court pas après. Allez-y par le chemin le plus sûr, une pelle sur l’épaule, et creusez sous l’endroit où elles se posent. Et si l’une d’elles vous appelle par votre nom, ne répondez pas.',
    indice: 'La nuit, ne pas suivre les feux follets mais regarder où ils se rassemblent : au-dessus de l’îlot des noyés, au milieu du marais, là où il faut creuser à la pelle.',
    decouverte: 'Sous la pelle, la terre de l’îlot est molle, puis dure : un coffre cerclé de fer, noir de vase. Autour de vous, les follets se sont immobilisés, suspendus, comme une assemblée qui regarde. Quand vous soulevez le couvercle, ils s’éteignent l’un après l’autre, doucement, comme on souffle les chandelles à la fin d’une veillée.',
  },
  // --------------------------------------------------------------------------
  moine_sans_visage: {
    titre: 'Le Moine sans visage',
    resume: 'Frère Anselme de Montrevel cherchait l’élixir qui garde en vie ; on dit qu’il a donné son visage en échange, et qu’il erre au crépuscule autour de l’abbaye.',
    texte: 'Là-haut, l’abbaye de Montrevel n’est plus qu’un squelette de pierre. Du temps où il y avait des moines, il y avait parmi eux un frère Anselme, un savant, qui passait ses nuits à l’alambic au lieu de les passer à genoux. Il cherchait ce que tous ces gens-là cherchent : l’élixir qui garde en vie. Et on dit qu’il l’a trouvé. Seulement, rien n’est gratuit. Pour la dernière chose qui lui manquait, il est allé demander à ceux d’en bas, et ceux d’en bas ont fixé le prix. Il a donné son visage. Pas ses yeux, pas sa langue : son visage, ce qui fait qu’on vous reconnaît. Depuis, il vit, et personne ne se souvient de lui. On le croise, on lui parle, et le soir on a oublié. Il revient au crépuscule, autour des ruines, en froc brun, le capuchon baissé. Il ne fait de mal à personne. Il marche jusqu’à l’autel, il passe derrière, et il ne ressort pas. Ceux qui ont osé regarder de près disent qu’il y a là, derrière l’autel, une pierre que le mortier ne tient plus, et derrière cette pierre sa chambre, ses fioles, et le grimoire où il a écrit toutes ses recettes. Et le plus curieux, c’est qu’il s’appelait Anselme, comme le vieux de votre ferme. Curieux… c’est une façon de parler. Moi, ça ne me fait pas rire.',
    indice: 'Au crépuscule, près de l’abbaye de Montrevel, le moine passe derrière l’autel : y chercher une pierre descellée, et la pousser.',
    decouverte: 'La pierre cède sous vos mains avec un soupir de poussière, et derrière, un réduit s’ouvre, sec comme un tiroir fermé depuis des siècles. Des étagères, des fioles, un pupitre, une chandelle à demi consumée dont la mèche est encore souple. Sur le pupitre, le grimoire est ouvert, comme si quelqu’un venait de s’interrompre au milieu d’une phrase.',
  },
  // --------------------------------------------------------------------------
  frappeurs: {
    titre: 'Les Frappeurs',
    resume: 'Les petits gens de la montagne frappent dans la roche : ils guident les mineurs honnêtes vers les filons et égarent les avides.',
    texte: 'Dans la mine, on n’est jamais seul. Les anciens le savaient. Il y a là-dedans des petits gens, pas plus hauts qu’un genou, vieux comme la montagne, qu’on appelle les Frappeurs parce qu’on ne les voit jamais : on les entend. Toc, toc, toc, dans la roche, juste à côté de votre oreille. Pour un mineur honnête, c’est une bénédiction. Trois coups au même endroit : creusez là, il y a un filon. Des coups qui s’éloignent : sortez, et vite, le plafond va tomber. Mais l’avide, celui qui pousse les galeries sans demander, qui gratte plus que sa part, ils le mènent par le bout du nez, de fausses veines en culs-de-sac, jusqu’au fond, jusqu’à ce qu’il ne sache plus remonter. Il faut les payer, voilà tout. Du temps où la mine tournait, chaque équipe laissait au fond, dans une niche creusée dans la roche, un morceau de pain et un peu de lait. Le lendemain, la niche était vide, et propre. En 1878, un ingénieur de la Compagnie a interdit la chose, par principe. Deux ans plus tard, la galerie s’est effondrée sur quatorze hommes. La niche est toujours là, tout au fond de la mine profonde. Mettez-y du pain et du lait, et revenez le lendemain. Les Frappeurs payent toujours leurs dettes, et ils ouvrent la roche à ceux qui ont été polis.',
    indice: 'Déposer du pain et du lait dans la niche, tout au fond de la mine profonde, et revenir le lendemain voir si la roche s’est ouverte.',
    decouverte: 'Là où il n’y avait que de la roche, une fente s’est ouverte, juste assez large pour qu’un homme s’y glisse de biais. De l’autre côté, une galerie basse file dans le noir, et très loin devant, trois petits coups patients vous montrent le chemin. Derrière vous, la niche est vide, et propre.',
  },
  // --------------------------------------------------------------------------
  chene_des_ancetres: {
    titre: 'Le Chêne des Ancêtres',
    resume: 'Le chêne millénaire garde la mémoire de la vallée : qui dort à son pied rêve des morts, et les morts lui montrent un secret.',
    texte: 'Le chêne était déjà vieux quand on a posé la première pierre de l’église. Il était vieux quand les Valmont sont arrivés. Il sera encore là quand nous aurons tous oublié nos noms, et c’est pour ça qu’il les garde. Un arbre pareil, ça boit la vallée par les racines. Tout ce qu’on enterre, les os, les pièces, les secrets, les promesses, finit par monter dans sa sève. Il sait tout. Il ne dit rien, sauf à ceux qui dorment contre lui. Couchez-vous à son pied, la nuit, entre ses racines, et si vous vous endormez vraiment, vous rêverez des morts. Pas de vos morts à vous : des morts de la vallée. Ils viennent s’asseoir autour de vous comme à une veillée, et ils vous montrent une chose, une seule : l’endroit d’un trésor, une pierre qui bouge, un geste qu’il fallait faire. Au matin, vous vous réveillez avec de la terre sous les ongles, et vous savez. Deux choses, seulement. Ne revenez pas y dormir trop souvent : les morts s’attachent, et à force, ils ne vous laissent plus repartir. Et ne l’abattez jamais. Jamais. Un homme, autrefois, a voulu en faire des planches. Au premier coup de hache, toute la vallée a fait le même rêve, la même nuit, et personne n’a jamais voulu dire lequel. On a retrouvé l’homme le lendemain, assis contre le tronc, les yeux ouverts, et sa hache plantée dans sa propre porte.',
    indice: 'Dormir la nuit au pied du chêne millénaire pour rêver des morts de la vallée, qui montrent un secret ; et ne jamais, jamais l’abattre.',
    decouverte: 'Vous vous réveillez contre l’écorce, la joue marquée de ses rides, avec dans la bouche un goût de terre et de gland. Le rêve ne s’efface pas comme les autres : il reste net, précis, comme un souvenir qu’on vous aurait prêté. Au-dessus de vous, les feuilles bruissent sans un souffle de vent. Quelqu’un, là-haut, a fini de raconter.',
  },
  // --------------------------------------------------------------------------
  puits_aux_souhaits: {
    titre: 'Le Puits aux souhaits',
    resume: 'Une pièce dans le vieux puits et un vœu tout bas : le puits exauce, mais il répond, et il se souvient de chaque pièce.',
    texte: 'Toutes les filles du hameau l’ont fait, du temps où il y avait un hameau : une pièce dans le vieux puits, un vœu tout bas, et on se sauve sans se retourner. Un mari, un enfant, de la pluie, une vache qui guérisse. Et ça marchait. C’est bien là le problème : ça marchait toujours. Parce que le vieux puits exauce. Ce n’est pas une fontaine de place où l’on jette un sou pour rire. Au fond, il y a quelqu’un qui écoute, et qui prend la chose au sérieux. Il vous donne ce que vous avez demandé, exactement, pas un grain de plus, et pas toujours de la manière que vous espériez. La mère Grelet avait demandé que son homme cesse de boire. Il a cessé. On l’a enterré le surlendemain. Et puis, le puits répond. Vous jetez la pièce, vous entendez le plouf, et au bout d’un moment, une voix remonte le long des pierres. Parfois c’est la vôtre. Parfois c’est celle de quelqu’un que vous avez connu. Elle vous dit un mot, une phrase, et ce n’est jamais tout à fait une réponse. Surtout, il se souvient. De chaque pièce, de chaque vœu, de chaque main qui l’a jetée. Il tient ses comptes mieux que la mairie. Ma grand-mère disait qu’à la treizième pièce, il rend la monnaie. Elle n’a jamais voulu m’expliquer ce que ça voulait dire.',
    indice: 'Jeter une pièce dans le vieux puits en faisant un vœu, écouter ce qu’il répond, et se méfier de la treizième.',
    decouverte: 'La pièce tombe longtemps, bien plus longtemps que le puits n’est profond. Puis le plouf, tout petit, et un silence qui écoute. Une voix remonte le long des pierres avec cet écho mouillé qu’ont les voix dans les caves : on vous a entendu. Vous avez l’impression très nette d’avoir signé quelque chose.',
  },
  // --------------------------------------------------------------------------
  chasse_volante: {
    titre: 'La Chasse volante',
    resume: 'Les nuits d’orage, les veneurs morts du vieux seigneur galopent dans le ciel avec leur meute ; qui les regarde en face est emporté.',
    texte: 'Le vieux seigneur de Valmont, Enguerrand, ne vivait que pour la chasse. Quand la Bête des Combes a ravagé les hauteurs, il l’a traquée trois ans avec ses piqueux et sa meute, sans jamais l’avoir. La nuit de la Saint-Martin 1767, pendant qu’un orage cassait les arbres, on est venu lui dire que la Bête rôdait près du château. Le curé l’a supplié de rester. Il a fait sonner le départ, et il a juré devant tout le monde qu’il chasserait jusqu’au Jugement dernier plutôt que de la laisser courir. On l’a pris au mot. Ni lui, ni ses gens, ni ses chiens ne sont rentrés. Au matin, on a retrouvé leurs chevaux dans la cour, trempés, les yeux fous, et pas un seul cavalier. Depuis, les nuits d’orage, ils chassent. On les entend passer au-dessus des nuages : les cors, les abois, le galop qui fait trembler les vitres. C’est la Mesnie, la chasse volante. Si vous êtes dehors quand elle passe, jetez-vous face contre terre, et ne relevez pas la tête avant que les chiens se soient tus. Celui qui les regarde en face, ils l’emmènent : il y a toujours de la place, dans la Mesnie, pour les curieux. Et parfois, quand elle est passée, on trouve dans l’herbe un fer de cheval énorme, noirci, encore chaud. Un fer perdu au galop, là-haut. Gardez-le. Mais ne le clouez jamais sur votre porte : ils reviendraient le chercher.',
    indice: 'Les nuits d’orage, quand la chasse passe dans le ciel, se jeter face contre terre sans regarder ; après son passage, chercher dans l’herbe un fer de cheval tombé d’en haut.',
    decouverte: 'Le galop passe au-dessus de vous, si bas que l’herbe se couche et que l’air sent le poil mouillé et la poudre. Vous gardez le front contre la terre jusqu’à ce que les chiens se taisent, jusqu’au dernier écho de cor. Quand vous vous relevez, il y a dans l’herbe, à un pas de votre main, un fer énorme qui fume sous la pluie.',
  },
  // --------------------------------------------------------------------------
  mere_des_moissons: {
    titre: 'La Mère des Moissons',
    resume: 'L’esprit des récoltes vit dans la dernière gerbe ; on lui offre les premiers fruits sur la pierre aux offrandes, sinon les champs pourrissent.',
    texte: 'Elle est dans le blé. Pas dans le grain, pas dans la paille : dans le blé debout, dans ce qui ondule quand il n’y a pas de vent. À mesure qu’on moissonne, elle recule, rang après rang, et à la fin elle se cache dans la dernière gerbe. C’est pour ça qu’on ne fauche jamais celle-là, n’importe quel vieux vous le dira. On la noue à la main, on en fait une poupée aux bras en épis, et on la garde au sec jusqu’aux semailles, où on la rend à la terre. En échange, elle fait lever les champs. Mais elle a ses exigences, la Mère. Les premiers fruits de chaque récolte sont à elle : la première carotte, la première gerbe, la première pomme. On les pose sur la pierre aux offrandes, la grande pierre plate au bord du champ de la vieille ferme, et le lendemain il n’y a plus rien, pas même une trace de souris. Ceux qui l’oublient, elle ne les punit pas tout de suite. Elle attend. Et un matin, un carré de leur champ a noirci pendant la nuit, un carré parfait, et le reste suit. Anselme ne l’a jamais oubliée. Quarante ans, il lui a porté ses premiers fruits. Sauf la dernière année. Cette année-là, la pierre est restée vide, et on l’a vu, un soir, debout au milieu de son blé, qui parlait tout bas. Et le blé lui répondait.',
    indice: 'Poser les premiers fruits de chaque récolte sur la pierre aux offrandes, au bord du champ de la ferme, et ne jamais oublier la part de la Mère.',
    decouverte: 'Sur la pierre aux offrandes, là où vous aviez posé vos premiers fruits, il y a une poupée de paille tressée, aux bras en épis, nouée d’un ruban fané. Elle est tiède comme un pain qu’on vient de sortir du four. Tout autour, le champ s’incline doucement vers vous, épi après épi, alors qu’il n’y a pas un souffle de vent.',
  },
  // --------------------------------------------------------------------------
  lise: {
    titre: 'La petite Lise',
    resume: 'L’enfant du hameau abandonné qui suivit la grande silhouette blanche dans le vieux puits, et qui revient parfois s’asseoir aux tables.',
    texte: 'Lise Roux avait sept ans à l’automne de 1870. Une petite noiraude qui chantait faux et dessinait partout, même sur les murs. Son père était mort à la guerre, et sa mère lavait le linge des autres pour les nourrir. Un soir, Lise a raconté qu’un monsieur blanc venait lui parler près du vieux puits : grand, très grand, sans figure, et gentil. Il disait qu’en bas il faisait jour, et que sa maman l’y attendait déjà. Après ça, la petite s’est mise à marcher en dormant, toujours vers le puits. Sa mère l’a veillée trois semaines, jusqu’à ne plus tenir debout ; une nuit, elle lui a attaché une clochette à la cheville, et elle s’est endormie. Au matin, la clochette était posée sur la margelle. Et plus de Lise. On a descendu des hommes avec des cordes : de l’eau noire, et rien. À la fin de l’hiver, après une nuit où la lune avait saigné, chaque famille du hameau a trouvé une chaise de trop à sa table. Chez la veuve Roux, c’était une petite fille mouillée qui ressemblait à Lise, qui ne mangeait pas et qui les regardait dormir. Le hameau s’est vidé en mars. On a fait à Lise une petite tombe dans le bois, près du hameau, une tombe où il n’y a rien, juste une croix, pour qu’elle ait un endroit où revenir. Plus personne n’y porte de fleurs. Alors Lise revient s’asseoir aux tables, les soirs de pluie, parce qu’elle a froid, et que là où elle est, il n’y a pas de fleurs.',
    indice: 'Chercher la petite tombe oubliée dans le bois, près du hameau abandonné, et y déposer des fleurs.',
    decouverte: 'Sous les ronces, une petite croix de bois penche, verte de mousse, sur un tertre pas plus long qu’un enfant couché. Vous écartez les ronces à mains nues. Quelque part derrière vous, quelqu’un retient son souffle. Il y a bien longtemps que personne n’est venu la voir.',
  },
};

// Les trois fois de la vallée : prières, signes, sermons, inscriptions
const FAITH = {
  // --------------------------------------------------------------------------
  eglise: {
    nom: 'l’Église',
    saint: 'saint Aubin',
    prieres: [
      'Seigneur, souvenez-vous de ceux qui dorment au cimetière de {ville}, et de ceux qui n’y dorment pas, sous le lac et sous la terre. Donnez-leur le repos éternel, et que la lumière sans déclin les garde de ce qui les appelle. Requiem aeternam dona eis, Domine.',
      'Seigneur, la terre a soif, et mes semis baissent la tête. Envoyez-nous une pluie douce, qui entre dans la terre sans l’arracher. Et s’il se peut, pas le jour de la Saint-Médard.',
      'Seigneur, voici la nuit. Visitez cette maison et éloignez-en toutes les embûches de l’ennemi ; gardez ma porte, mes bêtes et mon sommeil. Que je ne réponde à aucune voix, cette nuit, sinon à la vôtre.',
      'Saint Aubin, vous qui rachetiez les captifs, souvenez-vous de ceux que la vallée retient. Priez pour ceux de Saint-Aubin-des-Eaux, qui n’ont pas eu de glas, et pour nous, qui l’entendons encore.',
      'Notre Père, donnez-nous aujourd’hui notre pain de ce jour, et bénissez la main qui sème. Que le grain lève, que la grêle passe au large, et que je sache rendre grâce avant de compter.',
      'Mon Dieu, j’ai peur, et je ne sais pas toujours de quoi. Pardonnez-moi mes fautes, celles dont je me souviens et celles que la vallée m’a fait oublier. Tenez-moi la main dans le noir.',
    ],
    signes_bon: [
      '(Une chaleur douce vous prend aux épaules.)',
      '(Le vent tombe. Votre cœur bat lentement.)',
      '(Une odeur de cire chaude et de lys passe près de vous, puis s’en va.)',
    ],
    signes_neutre: [
      '(Rien. Le silence.)',
      '(Au loin, un chien aboie deux fois, puis se tait.)',
      '(Le vent continue de passer, occupé ailleurs.)',
    ],
    signes_mauvais: [
      '(L’amen vous revient en écho, avec une voix de trop.)',
      '(Une goutte froide tombe sur votre nuque, alors qu’il ne pleut pas.)',
      '(Derrière vous, quelqu’un se relève en même temps que vous.)',
    ],
    sermons: [
      'Mes frères, saint Aubin rachetait les captifs et ouvrait les prisons. Priez-le pour tous ceux que cette vallée retient, les vivants comme les autres.',
      'Sous le lac dort une église dédiée au même saint que la nôtre. Quand vous longez la rive, un Ave pour ceux de Saint-Aubin-des-Eaux : ils n’ont jamais eu de funérailles.',
      'Il est des nuits où la charité commande de fermer sa porte. N’ouvrez à aucune voix après minuit, fût-ce la plus aimée ; ce péché-là, je le prends sur moi.',
      'La patience, mes frères, n’est pas d’attendre que la nuit passe. C’est de pétrir le pain du lendemain pendant qu’elle passe.',
      'Nos morts ne frappent pas aux portes. Ce qui frappe, ce n’est pas eux ; ne leur faites pas l’injure de le croire.',
      'Je sais que certains d’entre vous portent encore du lait aux pierres. Dieu juge les cœurs, et je ne suis que son curé ; mais ne donnez jamais rien au vieux puits.',
      'On me demande pourquoi je compte les fidèles à l’entrée. Je ne les compte pas pour moi : je vérifie que nous sortirons aussi nombreux que nous sommes entrés.',
      'Le Christ est descendu aux enfers, et il en est remonté le troisième jour. Il est le seul ; que personne ici ne se croie capable d’en faire autant.',
      'Voilà trente ans que je vous parle depuis cet autel. J’ai baptisé vos enfants et enterré vos pères, et certains soirs, je ne sais plus très bien lesquels sont restés.',
      'Rendez grâce pour le pain. Il vient de la terre, de la pluie et de vos bras ; pour le reste, ne cherchez pas à savoir d’où il vient.',
      'Quand la cloche sonne seule, ne comptez pas les coups. Dieu seul sait compter jusqu’à treize sans que cela coûte à personne.',
      'Aimez-vous les uns les autres, et rentrez avant la nuit. Le premier commandement est du Seigneur ; le second est de moi, et je vous demande pardon de cette audace.',
    ],
    calvaires: [
      'Mission de 1823 : « O Crux, ave, spes unica. » Passant, salue la croix et continue ta route.',
      'Érigée par les gens des Combes en action de grâces pour la fin de la Bête, l’an 1768. Priez pour les enfants qu’elle a pris.',
      'À la mémoire de messire Enguerrand de Valmont et de ses gens, partis en chasse la nuit de la Saint-Martin 1767 et jamais rentrés. Priez pour eux, et ne levez pas les yeux les nuits d’orage.',
      'Pour ceux de Saint-Aubin-des-Eaux, que l’eau a pris sans sacrement la nuit de la Saint-Aubin 1791. Requiescant in pace.',
      'Ici est tombé Jean Coutelier, voiturier, par une nuit de brouillard, le 2 novembre 1848. Passant, s’il t’appelle, ne t’arrête pas.',
      'Ne passe pas cette croix après le coucher du soleil : ce qui te suit ne sait pas lire, mais il sait compter. Abbé Mauduit, 1852.',
    ],
    messe_debut: 'In nomine Patris, et Filii, et Spiritus Sancti… Mes frères, la paix soit avec vous, et avec ceux qui n’ont pas pu venir.',
    messe_fin: 'Ite, missa est. Rentrez chez vous par le grand chemin, et que chacun soit sous son toit avant la nuit.',
  },
  // --------------------------------------------------------------------------
  anciens: {
    nom: 'la Vieille Foi',
    prieres: {
      mere: [
        'Mère des Moissons, voici le premier de ce que tu as fait pousser. Je te le rends avant d’y avoir goûté. Garde mes sillons, et ne recule pas trop vite quand viendra la faux.',
        'Mère, dors dans la dernière gerbe, au chaud, jusqu’aux semailles. Je ne te fauche pas : je te noue, je te garde, et je te rendrai à la terre.',
        'Toi qui ondules quand il n’y a pas de vent, je te salue. Que le grain soit lourd, que la paille soit droite, et que rien de ce qui rôde ne marche dans mon blé.',
      ],
      dame: [
        'Dame, toi qui attends sous l’eau, je t’apporte des fleurs, puisqu’on ne t’en a pas porté le jour de tes noces. Garde bien ce que tu as pris. Rends-moi seulement ce que tu veux.',
        'Dame des Eaux, que ma ligne soit bénie et ma barque légère. Je ne te demande pas ce que tu gardes ; je te demande de me laisser rentrer.',
        'Belle noyée, douce Dame, que tes larmes soient les dernières du lac. Je dis ton nom tout bas, puisque plus personne ne s’en souvient.',
      ],
      cerf: [
        'Cerf Blanc, gardien des chemins, je marche, je ne cours pas. Mène-moi où tu veux, et ramène-moi avant la nuit.',
        'Toi qui passes sans briser la rosée, veille sur les bêtes et sur ceux qui les gardent. Que le loup se trompe de sentier, et que je ne me trompe pas du mien.',
        'Seigneur des bouleaux, je pose mes mains nues sur ta pierre. Je n’ai pas d’arme ; je n’ai que mon souffle, et je te le donne un instant.',
      ],
      cercle: [
        'Pierres qui veillez en rond, je me tiens parmi vous et je ne compte pas. Veillez encore cette nuit, et que celle qui marche reste où elle est.',
        'Vous qui étiez là avant nos morts et qui serez là après, gardez la porte fermée. Ce qui est dessous, laissez-le dessous. Ce qui est dessus, laissez-le vivre.',
        'Anciennes, debout sous la lune, je vous salue comme on saluait vos pareilles, du temps où l’on savait vos noms. Tenez bon. Moi aussi, je tiendrai.',
      ],
      chene: [
        'Grand-père chêne, toi qui bois la vallée par les racines, souviens-toi de moi quand je serai sous toi. D’ici là, prête-moi un peu de ta patience.',
        'Vieux chêne, je pose mon front contre ton écorce. Je n’ai pas de hache. Garde nos morts au chaud dans tes racines, et laisse-les dormir.',
        'Toi qui as vu passer tous nos noms, garde aussi le mien. Mais pas tout de suite. Pas encore.',
      ],
      source: [
        'Source, je noue ce ruban à ta branche : dénoue ce qui me serre. Que le mal s’en aille avec ton eau, vers le bas, loin, et qu’il ne remonte pas.',
        'Eau qui sors de la nuit de la terre, claire et froide, je bois dans le creux de ma main. Lave-moi de la fièvre, et de la peur, si tu peux.',
        'Petite source, mère des ruisseaux, je te laisse un ruban de plus. Quand il sera gris et effiloché, je serai guéri, ou je serai sous la terre, et ce sera bien aussi.',
      ],
    },
    signes_bon: [
      '(Un souffle tiède, qui sent la sève et la pluie.)',
      '(La terre est tiède sous vos genoux.)',
      '(Quelque part tout près, un oiseau que vous ne voyez pas répond à votre dernier mot.)',
    ],
    signes_neutre: [
      '(Une feuille tombe devant vous, et c’est tout.)',
      '(Les arbres continuent de parler entre eux, d’autre chose.)',
    ],
    signes_mauvais: [
      '(Tout ce qui bruissait autour de vous se tait au même instant.)',
      '(Une odeur de fruit pourri monte de la terre.)',
      '(Dans les fourrés, quelque chose s’éloigne de vous à reculons, sans vous quitter des yeux.)',
    ],
    inscriptions: {
      pierre_offrandes: 'Une pierre plate, creusée au milieu comme une écuelle par des siècles d’offrandes. Sur le rebord, on devine des épis gravés, et au couteau, plus récent : « La première pour Elle. A. V. »',
      pierre_dame: 'Une petite femme voilée, sculptée dans une pierre grise que l’eau a polie, les mains jointes sur quelque chose qu’on ne distingue plus : un bouquet, ou un anneau. Même par temps sec, le voile paraît mouillé, et à ses pieds, quelqu’un a gravé : « Rends-le-moi. »',
      pierre_cerf: 'Au centre du rond de bouleaux, une pierre dressée porte des bois de cerf sculptés, si anciens que la mousse elle-même semble les avoir oubliés. À sa base, en lettres usées : « Marche. Ne cours pas. »',
      source: 'Au-dessus de la source, les branches sont couvertes de rubans noués, de toutes les couleurs et de tous les âges ; les plus vieux ne sont plus que des fils gris. Sur la pierre d’où sort l’eau, gravé : « Ce que tu noues, je le dénoue. »',
    },
  },
  // --------------------------------------------------------------------------
  dessous: {
    nom: 'Ceux d’En-Dessous',
    prieres: [
      'Vous qui êtes sous nos pieds et sous nos lits, je ne dis pas votre nom. Je sais que vous m’entendez, je sais que vous comptez. Donnez-moi ce que je demande, et prenez ce que vous voudrez, plus tard.',
      'Veilleurs d’en bas, j’ai posé ma part sur la pierre et je ne regarderai pas qui la prend. Ouvrez-moi ce qui est fermé. Je n’ai pas demandé le prix, et je ne le demanderai pas.',
      'Je me penche au bord et je parle bas, comme on parle aux dormeurs. Réveillez-vous un peu, juste assez pour m’exaucer. Puis rendormez-vous, s’il vous plaît. Rendormez-vous.',
      'Ceux d’en bas, je vous donne ma nuit, mon sommeil et mon ombre ; gardez-les le temps qu’il faudra. En échange, que la chose se fasse. Je ne veux pas savoir comment.',
      'Vous qui étiez là avant les pierres et avant les cloches, je viens les mains vides et le cœur ouvert. Prenez dans le cœur. Laissez-moi les mains.',
    ],
    reponses: [
      '… oui…',
      '… nous avons entendu…',
      '… plus tard… nous viendrons chercher plus tard…',
      '… tu as la même voix que l’autre… celui d’avant…',
      '… c’est accordé… c’est compté…',
      '… encore… donne encore…',
      '… ne te retourne pas en partant…',
      '… on se reverra… en bas…',
    ],
    prix: [
      '(Au matin, une de vos poules manque ; il ne reste qu’une plume, et l’empreinte d’une main dans la paille.)',
      '(Un carré de votre champ a noirci pendant la nuit, un carré parfait, de la taille d’une porte.)',
      '(Vous ne retrouvez plus la voix de votre mère : vous savez qu’elle chantait, vous ne savez plus quoi.)',
      '(Votre reflet, dans l’eau du seau, met un temps de trop à se relever.)',
    ],
    inscriptions: {
      dolmen: 'Sur la Table des Géants, des cupules creusées dans la pierre sont reliées par des rigoles qui descendent toutes vers le même bord, vers la terre. Gravé sur la tranche, très profond : « Ici l’on mange avec ceux d’en bas. Pose ta part, et ne regarde pas qui la prend. »',
      margelle: 'Sur la margelle, des mains plus vieilles que la vallée ont gravé : « Quand la lune saigne, descends dans le vieux puits. » Tout autour, plus petites, des centaines d’encoches serrées comme des comptes de berger ; la dernière est encore blanche de poussière.',
      crypte: 'L’autel de la crypte porte une inscription plus ancienne que la chapelle : « À CEUX QUI VEILLENT SOUS LE MONDE. » Quelqu’un a tenté de la marteler, puis a renoncé ; à côté, à la craie, d’une écriture d’abbé : « Dieu me pardonne, ils répondent. »',
    },
  },
};

// Textes des nouveaux lieux, rêves, grimoire, reliques, fin, apparitions, notes
const LORE_TEXT = {
  // ---------------------------------------------------------------- les quatre bornes de Valmont
  bornes: [
    'Une borne de granit gris, haute comme un enfant, gravée : « VALMONT · I · 1791 ». Sous le chiffre, une flèche taillée profond, qui ne suit ni le chemin ni la pente.',
    'Borne moussue, gravée « II · 1791 » et d’une flèche que la pluie a usée, mais qu’on suit encore du doigt. Au-dessous, une main maladroite a ajouté au couteau : « J’ai compté les pas. Il en manque. »',
    'À moitié enfouie dans la bruyère : « III · MDCCXCI », les armes des Valmont, une tour et un cor de chasse, et la flèche, nette comme au premier jour.',
    'Borne penchée, fendue par le gel : « IV · 1791 ». La flèche est percée d’un petit trou à sa pointe, comme pour y attacher une ficelle et la tendre jusqu’au bout de la vallée.',
  ],
  // ---------------------------------------------------------------- rêves au pied du chêne
  reves: {
    valmont: 'Vous rêvez d’une nuit sans lune, il y a longtemps. Un homme en perruque, les bas crottés jusqu’aux genoux, tient une lanterne sourde pendant qu’un autre creuse, en sueur, sans un mot. Le château est encore debout derrière eux, toutes fenêtres noires. Le coffre descend dans la terre avec le bruit d’un sac qu’on pose. Puis le rêve s’élargit, comme vu du haut d’un clocher : vous voyez les quatre bornes, loin les unes des autres, et de chaque flèche part un fil de lumière pâle. Les quatre fils traversent la vallée et se nouent en un seul point, tout près des murs du château, là où l’homme en perruque tasse la terre du talon. Il lève les yeux vers vous, comme s’il vous voyait. « Là, dit-il. Là où elles se croisent. Et que Dieu me pardonne de ne pas revenir. »',
    abbaye: 'Vous rêvez de l’abbaye entière, avec ses toits, sa cloche, et l’odeur de cire et de soupe aux choux. C’est le soir. Les moines chantent complies, et l’un d’eux ne chante pas. Il a le capuchon baissé, et quand il le relève, il n’y a rien dessous, seulement une surface lisse, comme une assiette retournée. Il passe derrière l’autel. Vous le suivez. Il pose la main à plat sur une pierre du mur, une pierre comme les autres, sauf que le mortier, autour, s’est changé en poussière. Il pousse. La pierre recule sans bruit, et un souffle sec, qui sent le parchemin et la chandelle, vous passe sur le visage. Le moine se tourne vers vous, et sans bouche, il dit : « Tout est écrit là-dedans. Le prix aussi. »',
    lise: 'Vous rêvez du hameau, du temps où il avait encore ses toits. Il neige un peu. Deux femmes sortent d’une maison et vont jusqu’au bois, tout près, sous les arbres : l’une en châle noir, qui ne pleure plus, l’autre plus jeune, un panier d’herbes au bras et une croix de bois sur l’épaule. Elles creusent un trou pas plus long qu’un enfant, et elles le rebouchent sans rien y mettre. La plus jeune plante la croix. La mère dit : « Comme ça, tu auras un endroit où revenir, ma Lise. » Puis elles s’en vont, et personne ne revient plus. Les saisons passent sur la tombe comme des mains qu’on essuie. Une petite fille mouillée vient s’asseoir à côté, une ficelle nouée à la cheville, et elle vous regarde. « Il n’y a pas de fleurs, dit-elle. Personne ne m’apporte jamais de fleurs. »',
    frappeurs: 'Vous rêvez de la mine du temps où elle vivait : les chariots, les lampes, les voix, la poussière qui flotte dans la lumière jaune. Un mineur aux épaules larges, qui a sur la figure le silence des Marchal, descend jusqu’au fond, là où la roche est la plus noire. Dans la paroi, il y a une niche creusée à hauteur de poitrine. Il y pose un quignon de pain, puis un petit pot de lait, et il ôte sa casquette. Trois coups répondent dans la roche, tout près, contents. Le mineur sourit et se tourne vers vous, et vous voyez qu’il est couvert d’une poussière qui date de 1880. « Du pain et du lait, dit-il, et on revient le lendemain. Ils ouvrent toujours, pour ceux qui ont été polis. Moi, on ne m’a pas laissé le temps. »',
    dame: 'Vous rêvez du lac, la nuit, lisse comme une ardoise. Sur la rive, assise sur sa pierre, une jeune femme en voile de mariée tord ses cheveux, et il en coule une eau qui ne finit pas. Elle ne vous regarde pas. Elle regarde vos mains, et vos mains sont pleines de fleurs. Vous les posez sur la pierre, à côté d’elle, et elle les touche du bout des doigts, un peu étonnée, comme si c’était la première fois depuis très longtemps. Une larme descend sur sa joue, s’arrête, et reste là, ronde, sans tomber. « La nuit, dit-elle. Des fleurs, la nuit, sur ma pierre. Le jour, je ne suis pas là. Le jour, je suis tout le lac. »',
    generique: [
      'Vous rêvez d’une veillée dans une grande salle que vous ne connaissez pas. Des gens de toutes les époques sont assis autour du feu : un homme en sabots, une femme en coiffe, un soldat qui fume la pipe, un enfant qui dort. Ils se passent un bol de soupe, et chacun, avant de boire, dit son nom. Quand le bol arrive à vous, tout le monde se tait et attend. Vous ouvrez la bouche, et c’est un autre nom qui sort, un nom que vous n’avez jamais entendu. Ils hochent la tête, contents, comme si le compte était enfin juste. Vous vous réveillez avec un goût de sel dans la bouche, et ce nom sur le bout de la langue.',
      'Vous rêvez que vous marchez dans la vallée en plein jour, et qu’il n’y a personne. Les portes sont ouvertes, les tables mises, le pain coupé. Au loin, sur une crête, une grande silhouette noire se tient debout, immobile, et vous savez qu’elle vous regarde depuis toujours. Vous voulez lui faire signe ; votre bras ne se lève pas. Derrière vous, une voix très douce dit : « {prenom}, ce n’est pas encore l’heure. » Quand vous vous retournez, il n’y a que le chêne, et à son pied un vieil homme assis, de dos, qui écosse des petits pois dans son chapeau. Il ressemble à quelqu’un que vous n’avez jamais rencontré.',
      'Vous rêvez de la cloche. Pas de celle de l’église : d’une cloche plus vieille, plus grave, qui sonne sous vous, sous la terre, sous l’eau. À chaque coup, quelqu’un dans la vallée ouvre les yeux dans le noir. Vous comptez sans le vouloir : un, deux, trois… À douze, vous vous arrêtez de toutes vos forces. Le treizième coup ne vient pas. Il attend, lui aussi. Des racines vous tiennent chaud aux épaules, et une voix qui a l’âge du bois vous dit que vous avez bien fait. Au réveil, vos poings sont serrés si fort que vos ongles ont marqué vos paumes.',
    ],
  },
  // ---------------------------------------------------------------- grottes cachées
  grotte_peinte: [
    'Au plafond, à l’ocre rouge, un cercle de traits dressés, que vous comptez deux fois : treize. Le treizième est peint en noir, un peu à l’écart, plus grand que les autres, et quelqu’un, il y a des milliers d’années, l’a entouré de mains ouvertes, comme pour le retenir.',
    'Un cerf tracé d’un seul geste au charbon, rehaussé d’une craie blanche qui n’a pas jauni. Derrière lui, une file de petits hommes marche en se tenant par l’épaule ; aucun ne court. Au bout de la file, un rond de traits clairs, comme des arbres.',
    'Une grande silhouette blanche, deux fois plus haute que les hommes peints à côté d’elle, sans tête, ou avec une tête vide. Ses bras descendent jusqu’au sol. Elle tend la main à un tout petit personnage, un enfant peut-être, et l’enfant la prend.',
    'Des gens descendent dans un trou, les uns derrière les autres, peints de plus en plus petits jusqu’à n’être plus que des points. Au-dessus du trou, un disque rouge frotté à même la roche. Tout en bas, quelqu’un a peint les mêmes gens la tête en bas, et ils remontent.',
  ],
  grotte_contrebandiers: [
    'Règles de la grotte, pour les nouveaux. Un : on entre à la nuit, on ressort à la nuit, et on rebouche l’éboulis derrière soi. Deux : le tabac en haut, sur les planches, les allumettes au sec dans les caisses de fer ; l’eau suinte au fond. Trois : on ne rentre jamais par le marais, sauf avec le Rouquin, et on ne suit pas les lumières. Quatre : si les gabelous vous tiennent, vous ne connaissez ni la grotte, ni le Rouquin, ni votre mère. Cinq : on laisse une chique de tabac sur la pierre du fond. Ne demandez pas pour qui. Le Rouquin dit que depuis qu’on la laisse, on n’a jamais été pris.',
    'Pierrot, si tu lis ça, c’est que je ne suis pas revenu. Cette nuit, je suis rentré par le marais parce que les douaniers tenaient le col, et j’ai vu les feux se ranger tous ensemble au-dessus de l’îlot, comme des chandelles sur un gâteau. Le Rouquin disait que c’était l’or des faux-sauniers. Je n’ai pas pu m’en empêcher : j’y retourne demain avec une pelle. Garde ma part de la dernière passe pour ma sœur, à {hameau}, et ne lui dis pas où j’étais. Si je ne reviens pas, c’est que les feux avaient faim. Le Grand Jacques, octobre 1887.',
  ],
  grotte_cristaux: '(Un son trop grave pour l’oreille. On le sent dans les dents.)',
  antre: {
    entree: '(Des griffures dans la roche, à hauteur d’homme. Elles vont toutes vers le dehors.)',
    chasseur: 'Carnet de Blaise Coste, piqueux de Valmont. Nuit de la Saint-Martin 1767. Monsieur a fait sonner le départ malgré l’orage et malgré le curé. Dans le noir, j’ai perdu les autres. J’entendais encore leurs cors, mais trop haut. Je me suis jeté à terre et j’ai prié. Quand j’ai relevé la tête, elle était devant moi. Je lui ai mis l’épieu de Marchal dans le flanc ; le fer a cassé dedans. Ce n’est pas un mauvais fer, c’est une mauvaise bête. J’ai suivi le sang jusqu’ici. 13 novembre. Elle est au fond ; je l’entends respirer. L’éboulis a fermé l’entrée cette nuit, sans un bruit. 16 novembre. Plus qu’une charge de poudre. Je ne tire pas : tant qu’elle dort, les enfants des Combes dorment aussi. 19 novembre. Elle ne mourra pas. Elle attend. Alors j’attends aussi, le fusil sur les genoux. Qui trouvera ce carnet, qu’il marche sans bruit et ne lui mette pas de lumière dans les yeux. Et qu’il dise à ma Toinette que je ne suis pas parti avec eux, là-haut. Je suis resté de garde.',
  },
  // ---------------------------------------------------------------- l’abbaye de Montrevel et le grimoire
  abbaye: {
    autel: 'L’autel de l’abbaye n’est plus qu’un bloc de pierre nue, fendu par le gel. Derrière, dans le mur du chœur, une pierre ne ressemble pas aux autres : le mortier, autour, s’est changé en poussière grise, et quand on y colle l’oreille, on entend un courant d’air, comme une respiration de l’autre côté.',
    scriptorium: 'Une pièce étroite et voûtée, sèche comme l’intérieur d’un coffre. Des étagères chargées de fioles aux bouchons de cire, de pots étiquetés d’une écriture fine, d’os d’oiseaux et de racines ; un alambic de cuivre verdi sur un fourneau froid ; un pupitre, et sur le pupitre, un grand livre ouvert. Il n’y a pas de poussière sur le livre. Il y en a partout ailleurs.',
    grimoire_pages: [
      'Anno Domini 1641, en la fête de saint Luc, patron des médecins. Frère infirmier depuis Pâques, je note ici ce que la forêt enseigne mieux que nos livres. Les simples cueillis à l’aube, écrasés dans le miel des ruches du cloître : la plaie se ferme, la fièvre tombe, et le frère cellérier recommence à se plaindre du vin. Nota : contre la morsure de la vipère, prendre le venin même de la bête, l’adoucir dans le lait et le lier d’herbes amères. Le mal chasse le mal. Notre père abbé dit que c’est une pensée de païen. Il a guéri quand même.',
      '1648. Pour les vigiles, où l’âme veut et où la chair tombe : la truffe noire que déterrent les porcs, pilée dans le miel, tient un homme debout jusqu’à laudes et au-delà, sans qu’il chancelle. J’ai veillé ainsi trois nuits de suite, et j’ai vu des choses que la quatrième m’aurait peut-être expliquées. À l’inverse, pour le frère Hilarion, qui ne dort plus depuis la mort de son frère : des fleurs des prés, du lait tiède et quelques champignons de souche bien choisis. Il s’endort avant d’avoir reposé la coupe. Qu’on ne s’en serve jamais contre personne.',
      '1652. Le novice qui court porter nos lettres au prieuré m’en a donné l’idée. Une plume, pourvu qu’elle ait volé, et ce trèfle rare qui a une feuille de trop : les jambes s’allègent, la route raccourcit, le souffle ne manque plus. Mieux encore : l’aile de la chauve-souris, une plume, quelques fleurs pour la douceur. Qui boit cela tombe comme tombe une feuille. Le frère Mathieu a sauté du haut du mur d’enceinte pour me prouver que j’avais tort ; il s’est relevé en riant. J’ai fait pénitence pour nous deux.',
      '1657. Il est des nuits où les chandelles ne suffisent pas. Le champignon qui luit au fond des grottes, joint à la plume du hibou, qui voit sans lune, ouvre l’œil de la nuit : on y voit comme au crépuscule, et l’on voit aussi ce qui aurait préféré rester dans le noir. Pour n’être pas vu à son tour : une plume noire, le lichen gris qui ronge les rochers des hauteurs, et la rosée d’avant le soleil. Ce qui chasse la nuit passe alors à côté de vous et flaire l’air, perplexe. Je l’ai éprouvé. Ils sont passés tout près.',
      '1661, année de disette. La rosée recueillie à l’aube dans une fiole propre, la poudre des os que l’on moud au mortier, et des fleurs, pour que la terre sache ce qu’on attend d’elle : versé sur les semis, cela les fait lever à vue d’œil. Le frère jardinier s’est signé trois fois. Pour la fortune, qui est une autre sorte de récolte : le trèfle à la feuille de trop, une vieille pièce frappée d’un roi mort, et la fleur qui ne s’ouvre qu’à la lune, au milieu des pierres levées. Je n’ai jamais tant gagné aux osselets. Je m’en suis confessé.',
      '1666. La force qui manque aux bras, on la prend aux bêtes qui mordent : un croc, un morceau de viande crue, des champignons de souche. Le manche de l’outil s’allège dans la main, et le fer mord la pierre comme le loup mord l’agneau. Pour le cœur des gens, qui est plus dur que la pierre : la fraise des bois, le miel, et encore la fleur de lune, qui sert à tout ce qui est doux et à tout ce qui est dangereux. Le frère portier, qui me haïssait, m’a embrassé trois jours durant. Le quatrième, il m’a regardé comme on regarde un voleur.',
      '1673. L’étang des Eaux, au pied de Saint-Aubin, est profond, et l’on dit qu’une femme l’habite. J’ai voulu savoir. L’anguille respire là où nous nous noyons : il faut boire son souffle. L’anguille donc, une perle d’eau douce, la rosée d’un matin sans vent, passées ensemble à l’alambic. J’ai marché une heure au fond de l’étang, parmi les herbes. Une femme voilée m’a regardé sans colère. Elle m’a montré, au-dessus de nous, le village de Saint-Aubin vu par en dessous, comme un plafond, avec l’église, le clocher, les toits. L’étang n’était pas assez grand pour cela. Pas encore.',
      '1679. Voir ce qui est caché. Il y faut trois choses qui ne s’accordent pas : la fleur qui s’ouvre à la lune au milieu des pierres levées, l’eau que le prêtre a bénie, et un de ces éclats froids que laissent derrière eux les Pâles, les nuits où la lune saigne. On les trouve dans l’herbe au matin, comme du verre rouge qui bat. Qui boit cela voit les choses telles qu’elles sont, et non telles qu’elles se montrent. J’ai regardé le cloître. J’ai regardé mes frères. Je n’en écrirai pas davantage. Je prie pour eux.',
      '1684. La vallée a un envers, comme une étoffe. On y passe par le vieux puits quand la lune saigne, et nulle autre nuit, disent les vieilles. Elles se trompent. Un éclat rouge, une larme de la Dame de l’étang, une plume noire tombée d’un oiseau de nuit : dans la fiole, cela fait un vin couleur de cendre. Qui le boit peut descendre par le vieux puits, ou passer un miroir comme on passe une porte, sans attendre que la lune saigne. De l’autre côté, l’abbaye est la même, mais tous mes frères y dorment debout, les yeux ouverts, tournés vers moi.',
      '1691. La dernière chose. La racine qui crie quand on l’arrache, la nuit, en forêt ; une larme de la Dame ; l’eau bénite, pour que Dieu ne détourne pas tout à fait les yeux. Cela ne donne pas la vie : cela la rend, une fois, à l’instant où elle s’en va. Pour qu’elle ne s’en aille jamais, il fallait autre chose, que seuls ceux d’en bas possèdent. J’ai demandé. Ils ont fixé le prix. Je l’ai payé. Plus personne ne me reconnaît dans le cloître. 1791. On ferme l’abbaye. Je laisse ce livre à la pierre. Il me faudra une terre, un autre nom, et des gens qui oublient vite.',
    ],
  },
  // ---------------------------------------------------------------- la mine profonde
  frappeurs: {
    niche: 'Tout au fond de la mine profonde, à hauteur de poitrine, une niche est creusée dans la roche, pas plus grande qu’un pain. Le rebord est poli par des générations de mains, et au fond, dans la poussière, il y a de petites empreintes de doigts, trop petites pour des doigts d’homme.',
    galerie: 'La paroi s’est fendue pendant la nuit, net, comme un pain qu’on rompt. Derrière, une galerie basse, étayée d’un bois noir qui n’a pas pourri, file droit dans la montagne ; des veines d’or courent au plafond comme des racines, et sur une pierre plate, une petite lampe brûle sans huile, posée là pour vous.',
  },
  // ---------------------------------------------------------------- le village englouti
  clocher: 'Le clocher de Saint-Aubin-des-Eaux se dresse dans la vase, vêtu d’herbes qui ondulent comme des cheveux. Par les abat-sons, on voit la charpente vide où pendait la cloche, et la corde, toujours là, qui descend dans le noir et bouge doucement, comme si quelqu’un, en bas, la tenait encore.',
  sacristain: 'Ce dernier jour de février 1791. Moi, Aimé Lacombe, sacristain de Saint-Aubin-des-Eaux. La paroisse est supprimée et réunie à la ville ; demain, ceux du district viennent descendre la cloche pour en faire des sous. Monsieur le curé a refusé le serment et il est parti par la montagne. J’ai mis dans ce coffre le calice, la patène et les registres, pour qu’on ne les fonde pas avec le reste. L’eau de l’étang monte depuis trois jours, sans une goutte de pluie. Les vieilles disent que la Dame ne veut pas qu’on lui prenne sa cloche. Ce soir, je sonnerai une dernière fois, pour saint Aubin. Que Dieu garde ceux d’ici, même ceux qui ne croient qu’en elle.',
  // ---------------------------------------------------------------- la tombe de Lise
  lise: {
    tombe: 'Sur la petite croix de bois, gravé au couteau : « LISE ROUX, 7 ANS, 1870. Elle n’est pas ici. Mais il lui fallait un endroit où revenir. » Les lettres sont vertes de mousse, sauf le prénom, qu’on dirait gratté de frais.',
    apaisee: 'Vous posez les fleurs au pied de la croix. Le vent tombe, les oiseaux se taisent, et pendant un long moment il ne se passe rien ; puis, tout près, quelqu’un pousse un soupir d’enfant, un soupir de fin de journée, content, et la mousse de la croix sèche d’un coup, comme au soleil. Ce soir, à l’une des tables de la vallée, il y aura une chaise de moins.',
  },
  // ---------------------------------------------------------------- le vieux puits
  puits: {
    voeux: [
      '… Accordé. Mais tu as demandé trop vite : tu ne sais pas encore ce que tu voulais…',
      '… Une pièce de plus. Je les garde toutes, tu sais. Elles sont bien au chaud, en bas…',
      '… Anselme aussi souhaitait tout bas. Il souhaitait toujours la même chose…',
      '(Votre voix remonte du puits, en retard : « … exauce-moi… »)',
      '… C’est noté. Tout est noté. Même ce que tu n’as pas osé dire…',
      '… Merci. Reviens. Reviens souvent. Reviens la nuit…',
    ],
    treizieme: 'La treizième pièce ne fait aucun bruit en tombant. Puis toutes les voix du puits remontent ensemble, tous les vœux qu’on a faits ici depuis toujours, murmurés en même temps : des filles qui demandent un mari, un homme qui demande la pluie, une femme qui répète « rends-la-moi ». Et, plus net que les autres, tout près, un vieil homme fatigué : « Envoie quelqu’un pour la ferme. Quelqu’un de bien. Je paierai ce qu’il faudra. » Puis le silence. Le puits vient de vous rendre la monnaie.',
  },
  // ---------------------------------------------------------------- panneaux-cartes
  panneaux: {
    ferme: 'La vieille ferme. Fermez les barrières derrière vous, et la porte, le soir.',
    ville: '{ville}, ville close. Ponts levés au coucher du soleil, par arrêté municipal du 3 mars 1854.',
    hameau: '{hameau}. Lait, chevaux et fromages. Le chemin du hameau abandonné n’est plus entretenu : ne le prenez pas.',
    lac: 'Le grand lac. Pêche tolérée de l’aube au coucher du soleil. Ne répondez pas à qui vous appelle depuis l’eau.',
    mine: 'Mine fermée par arrêté préfectoral, 1880 : danger d’éboulement. Au-dessous, à la craie : « Pain et lait pour ceux du fond. »',
    abbaye: 'Ruines de l’abbaye de Montrevel. Il est déconseillé de s’y attarder au crépuscule.',
  },
  // ---------------------------------------------------------------- les onze reliques des Anciens
  reliques: {
    relique_cerf: 'Un andouiller blanc comme l’os lavé par la lune, léger comme une branche morte. Il sent la mousse et le givre, en toute saison.',
    relique_dame: 'Un anneau d’argent terni, trop petit pour vos doigts, gravé à l’intérieur d’un mot que l’eau a effacé. Il est toujours mouillé, même au fond d’une poche sèche.',
    relique_calice: 'Le calice de Saint-Aubin-des-Eaux, vermeil piqué de vert, sauvé du district par un sacristain. Au fond de la coupe, un peu d’eau du lac ne s’évapore jamais.',
    relique_tablette: 'Une tablette de pierre noire gravée de treize points disposés en cercle, dont un plus profond que les autres. Elle est froide, et plus lourde la nuit que le jour.',
    relique_sceau: 'La matrice de bronze du sceau des Valmont : une tour, un cor de chasse, et autour la devise « Je reviendrai ». Aucun d’eux n’est revenu.',
    relique_croc: 'Un croc jauni, long comme la main d’un enfant, tombé de la gueule de la Bête endormie. Il est chaud, et parfois, contre votre paume, il semble battre.',
    relique_medaillon: 'Un médaillon de cuivre qui s’ouvre sur deux portraits délavés, un homme et une femme que l’eau a presque effacés. Chaque nuit, une goutte perle à la charnière.',
    relique_croix: 'La croix pectorale de frère Anselme, en argent noirci. Le visage du Christ y est tout lisse, usé par un pouce qui l’a caressé pendant des siècles.',
    relique_lampe: 'Une lampe de mineur à peine plus grande qu’un poing, en laiton martelé par des mains minuscules. Elle brûle sans huile, d’une petite flamme qui ne tremble jamais.',
    relique_fer: 'Un fer à cheval noirci, trop grand pour un cheval de ce monde, tombé du ciel un soir d’orage. Ses clous sont encore chauds, et il sent la pluie, le poil mouillé et la poudre.',
    relique_poupee: 'Une poupée tressée dans la dernière gerbe, aux bras en épis, nouée d’un ruban rouge fané. Elle sent le pain chaud et la terre après la pluie.',
  },
  // ---------------------------------------------------------------- la fin : les reliques déposées à l’autel du cercle, à minuit
  fin: {
    autel: 'Minuit. Le cercle est si silencieux que vous entendez votre sang battre contre vos tempes. Vous posez les reliques sur l’autel, une à une, et chacune se fait plus lourde au moment de la lâcher, comme une main qui hésite à quitter la vôtre : le bois du Cerf, l’anneau de la Dame, le calice noyé, la tablette des Treize, le sceau des Valmont, le croc de la Bête, le médaillon des noyés, la croix du moine, la lampe des Frappeurs, le fer de la Mesnie, la poupée de la Mère. Onze choses que la vallée avait perdues, ou cachées, ou oubliées exprès. Quand la dernière touche la pierre, les douze pierres levées se penchent. Pas beaucoup : juste assez pour qu’on sache qu’elles regardent. Et au loin, là où il se tient depuis votre arrivée, toujours trop loin pour qu’on le voie bien, le Veilleur se met en marche. Il ne court pas. Il n’a jamais eu besoin de courir. Il traverse la lande en quelques pas, et plus il approche, moins il est noir : gris d’abord, puis couleur de pierre, couleur de pluie sur la pierre. Il s’arrête à la place vide du cercle, la treizième, celle que personne ne voyait plus, et il vous regarde avec ce qui lui tient lieu de visage. Au-dessus de vous, la lune pâlit ; le rouge s’en retire comme le sang d’une joue. Au fond du lac, une cloche sonne une fois, une seule, et se tait. Dans toutes les maisons de la vallée, les dormeurs se retournent du même côté, et soupirent. Le compte, enfin, tombe juste. Quelque part, une porte qu’on avait laissée ouverte depuis très longtemps se referme doucement, du bon côté.',
    veilleur: [
      '… Onze. Tu as rapporté ce que la vallée avait égaré. Personne, avant toi, n’avait pensé à le lui rendre.',
      '… Nous ne punissions pas. Nous comptions. Quand le compte était faux, la lune saignait.',
      '… La vallée peut dormir, maintenant. Cette nuit, personne ne passera de l’autre côté. Ni les suivantes.',
      '… Je retourne parmi les pierres. C’est toi qui veilleras, {prenom}. De jour, les yeux ouverts, avec les vivants.',
    ],
  },
  // ---------------------------------------------------------------- nouvelles apparitions (sous-titres)
  anomalies: {
    moine: [
      '… Avez-vous vu mon visage ? Je l’ai laissé quelque part, par ici. On me l’a pris…',
    ],
    dame_blanche: [
      'Pardon… Le chemin de Saint-Aubin-des-Eaux, s’il vous plaît ? On m’attend à l’église.',
      'Vous êtes sûr ? Il y avait un village, par ici. Il y avait une église, et des noces…',
      'Ne regardez pas mes pieds. C’est l’eau. J’ai marché longtemps.',
      'Merci. Je vais couper par le lac, c’est plus court.',
    ],
    chasse: [
      'Taïaut ! Taïaut ! … Qui nous regarde, là, en bas ?',
    ],
    lanterne_lac: [
      '(Une lanterne glisse sur le lac, à hauteur d’homme, sans barque et sans rameur.)',
      '(Au milieu du lac, la lanterne s’arrête, puis s’enfonce lentement, toujours allumée, là où dort le clocher.)',
    ],
    semeur: [
      '(Dans le champ, des rangs que vous n’avez pas semés.)',
      '… Il faut toujours laisser sa part à la Mère. Anselme le savait. Il le savait, la plupart du temps…',
    ],
  },
  // ---------------------------------------------------------------- notes, lettres et pages à trouver
  notes: [
    {
      titre: 'Procès-verbal du district',
      lieu: 'abbaye',
      texte: 'Procès-verbal dressé le 14 avril 1791 par nous, commissaire du district, en l’abbaye de Montrevel, désormais bien national. Trouvé : quatre religieux, un tonneau de vin aigre, une bibliothèque mangée par les rats, et un alambic de cuivre que personne n’a su nous expliquer. Un cinquième religieux s’est présenté à nous à la tombée du jour, capuchon baissé : le frère Anselme, porté au registre des profès de l’an 1641. Nous l’avons pris pour un petit-neveu du même nom. Il a refusé qu’on touche à l’autel ; quand notre maçon a frappé le mur derrière, une pierre a sonné creux. Nous avons remis l’examen au lendemain. Au matin, le frère n’était plus là, et aucun de nous n’a su décrire son visage.',
    },
    {
      titre: 'Lettre du notaire Pradel',
      lieu: 'chateau',
      texte: 'Monsieur le vicomte, vous me demandez ce qui reste des biens de votre grand-père, feu le comte Aymar de Valmont, émigré en 1791. Il reste la butte, des murs noircis, et une rumeur. Les paysans affirment que monsieur le comte a enterré son or avant de partir, et que les quatre bornes qu’il fit poser cette année-là, numérotées de I à IV et gravées d’une flèche, ne bornent aucun champ. J’ai fait relever leur position. Les lignes de leurs flèches se croisent, à quelques pas près, au pied des ruines du château. Je n’y ai pas fait creuser : ces gens ont des pelles et de la mémoire, et je tiens à ma charge. Si vous venez, venez de jour. Les nuits d’orage, on entend encore les chiens de votre bisaïeul. Votre dévoué, Pradel, notaire, 1824.',
    },
    {
      titre: 'Rédaction de Célestin',
      lieu: 'clairiere',
      texte: 'Rédaction. Sujet : racontez une promenade. Un matin, j’étais levé avant tout le monde parce que la vache avait vêlé, et je suis allé au bois de bouleaux voir si le brouillard était encore dedans. Il y avait un cerf tout blanc, blanc comme le givre sur les carreaux. Maman dit qu’il ne faut jamais courir derrière, alors j’ai marché. Il m’attendait à chaque arbre. On est arrivés dans un rond de bouleaux, avec une pierre au milieu où il y a des cornes sculptées. Il n’était plus là. J’ai dit la prière pour les Anciens, comme grand-mère. Après, j’ai trouvé un bout de corne blanche dans l’herbe, mais je l’ai laissé sur la pierre, parce que ce n’était pas à moi. Célestin, 10 ans, 1894. En rouge, de la main du maître : « Hors sujet. Mais bien écrit. Ne va pas seul au bois. »',
    },
    {
      titre: 'Billet sous la pierre',
      lieu: 'pierre_dame',
      texte: 'Plié en quatre sous la pierre, protégé par un galet : Dame, je suis venue la nuit, comme on dit qu’il faut, avec des bleuets et la perle de ma marraine. Je n’ai plus rien d’autre de joli. Tu m’as rendu une larme ; je l’ai mise dans une fiole, elle ne sèche pas. Mais ce n’est pas une larme que je voulais. Je voulais Jules. Il est parti sur sa barque un soir d’orage, il y a dix ans, pour aller voir les lumières sous l’eau, et tu ne l’as jamais rendu. Son frère pose du lait au bout du ponton tous les dimanches ; moi, je ne sais pas ce que tu aimes. Si tu le gardes, garde-le bien. Garde-le au chaud, s’il y a du chaud chez toi. Et dis-lui que je ne me suis pas mariée. Celle qui l’attendait.',
    },
    {
      titre: 'Aveu griffonné',
      lieu: 'dolmen',
      texte: 'Au crayon, au dos d’une page d’almanach : J’écris ça parce que je ne peux pas le dire au curé. L’été 93, il n’avait pas plu depuis la Saint-Jean, les blés crevaient debout. Mon père disait qu’on ne va jamais à la Table des Géants. J’y suis allé. J’ai posé mon pain dessus, et du sel, et j’ai demandé la pluie à ceux d’en bas, tout bas, sans dire leur nom. Il a plu le lendemain. Trois jours de suite, une bonne pluie droite, la plus belle que j’aie vue. Mon voisin a eu sa récolte, et moi aussi. Mais depuis, mon petit ne parle plus. Il va bien, il mange, il rit même. Il ne dit plus un mot. Et la nuit, il se lève pour aller regarder par la fenêtre, du côté de la lande. H. F.',
    },
    {
      titre: 'Carnet de l’instituteur',
      lieu: 'menhirs',
      texte: 'Notes sur les traditions de la commune, pour la Société d’émulation du département. Les « Demoiselles » : alignement de pierres levées sur la lande. La légende veut que ce soient des filles changées en pierre pour avoir dansé la bourrée pendant la messe de minuit, derrière un violoneux qui n’avait pas d’ombre. Elles seraient sept. J’en ai compté huit le 3 mai, sept le 10. Je note, sans conclure, que les gens d’ici comptent tout : les pierres, les coups de cloche, les chaises à table. Le cercle de pierres, voisin : douze pierres en 1884, treize en 1885 (comptées trois fois, en présence du garde champêtre), douze à nouveau cette année. Le garde champêtre refuse désormais de m’accompagner. E. Castagné, instituteur, 1886.',
    },
    {
      titre: 'Planche de la charbonnière',
      lieu: 'charbonniere',
      texte: 'Écrit au charbon sur une planche de la cabane, d’une grosse main appliquée : Pour ceux qui feront le charbon après nous. Laissez la meule brûler doucement sous la terre, et ne dormez jamais tous les deux en même temps. Sous les grands arbres, la nuit, il pousse une racine qui crie quand on la tire ; la guérisseuse la paie bien, mais bouchez-vous les oreilles avec de la cire, et ne l’arrachez jamais de jour, elle ne vaut plus rien. Les soirs d’orage, si vous entendez des chiens dans le ciel, couchez-vous le nez dans la cendre et ne regardez pas. Mon frère a regardé, en 1859. On a retrouvé son bonnet tout en haut du grand hêtre, et lui, on l’entend encore passer avec les autres. Il sonne du cor, maintenant. Lui qui n’avait jamais su.',
    },
    {
      titre: 'Le compte du berger',
      lieu: 'bergerie',
      texte: 'Encoches sur le montant de la porte, et dessous, au crayon de menuisier : Compte des brebis, saison 1889. Montées cent douze à la Saint-Jean. Redescendues cent douze. Mais tout l’été, elles n’ont pas voulu paître près de l’éboulis, là-haut dans les rochers, où l’herbe est pourtant la meilleure. Le chien grogne devant les pierres. Moi, j’y ai collé l’oreille un soir de gel : ça respire, là-dessous. Lentement, comme une bête qui dort d’un gros sommeil. Mon grand-père disait que c’est la Bête des Combes, qui n’a jamais fini de mourir, avec le piqueux du seigneur pour la garder. Je ne déplace pas ces pierres. Celui qui voudra, qu’il prenne une pelle et qu’il y aille doucement. Moi, cette année, je descends plus tôt.',
    },
    {
      titre: 'Lettre de la mère Chauvet',
      lieu: 'lavoir',
      texte: 'Glissée entre deux pierres du lavoir, jamais postée : Ma Nine, au lavoir on ne parle que de toi, alors je t’écris pour qu’on parle d’autre chose. La vieille Adèle, qui a quatre-vingt-dix ans, m’a raconté ce matin qu’elle lavait ici avec la veuve Roux, du temps du hameau. La pauvre femme avait perdu sa Lise dans le vieux puits, l’automne de la guerre. On lui a fait une petite tombe dans le bois, tout près du hameau, une tombe vide, avec une croix que la guérisseuse avait plantée. Adèle dit que plus personne n’y va, que la ronce a tout pris, et que c’est pour ça que la petite revient s’asseoir chez les gens : elle cherche des fleurs. Moi, j’ai rincé mes draps en vitesse et je suis rentrée par le grand chemin. Ta mère qui t’embrasse, juin 1896.',
    },
    {
      titre: 'Ruban et prière',
      lieu: 'source',
      texte: 'Un papier plié, noué à une branche par un ruban bleu délavé : Source, c’est pour ma petite Odile, qui tousse depuis la Toussaint et qui ne mange plus. Le médecin de la ville est venu deux fois ; il a dit d’attendre. La vieille des bois m’a dit de venir ici, de nouer le ruban moi-même sans jamais le couper, et de prier les Anciens avant l’aube, les pieds dans ton eau. Elle dit que quand le ruban se dénouera tout seul, la toux s’en ira avec. J’ai aussi fait brûler un cierge à saint Aubin, qu’on ne m’en veuille pas : je prends tout ce qui aide. Si tu la guéris, je te rapporterai un ruban neuf chaque printemps, tant que je vivrai. A., décembre 1879.',
    },
    {
      titre: 'Rapport de l’ingénieur Delorme',
      lieu: 'grotte_cristaux',
      texte: 'Rapport à la Compagnie des mines, 6 juin 1878. Au cours d’une prospection des hauteurs, nous avons dégagé un éboulis qui masquait une cavité naturelle, tapissée de cristaux de quartz d’une pureté remarquable. Phénomènes à signaler : les cristaux émettent une vibration audible dès que l’on se tait ; des champignons à lueur verdâtre poussent dans les fissures, et continuent de luire une fois cueillis. Les ouvriers refusent d’y travailler, invoquant « les petits » qui frapperaient dans la roche pour les chasser, et tiennent à déposer chaque soir du pain et du lait dans une niche, au fond de la mine. J’ai interdit cette pratique, par principe. Je recommande en outre de ne pas pousser plus loin la galerie nord. Elle sonne creux. Et elle sonne en retard. A. Delorme, ingénieur.',
    },
    {
      titre: 'Rapport du brigadier Lemasson',
      lieu: 'grotte_contrebandiers',
      texte: 'Brigade des douanes, rapport du 12 novembre 1886. Avons suivi de nuit une bande de passeurs de tabac et d’allumettes jusqu’aux hauteurs, où ils ont disparu contre un éboulis. Au jour, l’éboulis était intact, les pierres couvertes de mousse, comme si personne n’y avait touché depuis cent ans. Un berger affirme qu’il y a une grotte derrière, et qu’il faut une pelle pour y entrer. Les passeurs, selon lui, rentrent par le marais, la nuit, sans lanterne : ils ne suivent pas les feux qui courent sur l’eau, ils attendent de voir où ces feux se posent. Le douanier Rivière, qui a voulu couper par le marais derrière eux, n’est pas rentré. Demande qu’on nous envoie des chiens. Et un prêtre. Brigadier Lemasson.',
    },
    {
      titre: 'Carnet du faux-saunier',
      lieu: 'ilot',
      texte: 'Roulé dans une fiole bouchée à la cire : Compte de la bande, à la Saint-Michel 1784. Passé quarante minots de sel par le marais sans une perte, sauf le petit Guillaume. Le magot est dans le coffre, enterré sur l’îlot du milieu, là où ne pousse que le jonc noir. Si les gabelous nous prennent, que le dernier vivant revienne le chercher, de nuit, par le chemin sûr, et qu’il ne suive surtout pas les lumières. Elles aiment l’or, les lumières. Elles se couchent dessus comme des chiens sur un os. Au dos, d’une autre main, qui tremble : « Tous pris. Je suis le dernier. J’y retourne ce soir. »',
    },
    {
      titre: 'Déclaration du violoneux',
      lieu: 'cercle_fees',
      texte: 'Moi, Tonin, violoneux des noces, je certifie ceci à qui voudra le croire. En revenant d’une noce à {hameau}, la nuit de la Saint-Jean 1887, j’ai vu luire un rond de champignons dans la forêt, et au milieu, des petites gens qui faisaient la ronde sans musique. Ils m’ont fait signe. J’ai mis un pied dans le rond et j’ai joué : une bourrée, deux bourrées, pas plus. Quand j’en suis ressorti, ma femme était en noir et mon chien ne me reconnaissait plus. Il s’était passé un an et un jour. Depuis, je dors mal. La seule nuit où j’ai bien dormi, c’est au pied du grand chêne : j’y ai rêvé de mon père, qui m’a montré où il cachait ses économies. Elles y étaient. Ne cueillez rien dans le rond. Et si on vous fait signe, jouez de loin.',
    },
  ],
};
