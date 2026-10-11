// ============================================================================
//  LES RÉCITS DES PROCHES (agent K18, dix-huitième vague) — 0. LES DONNÉES
//  Onze habitants de la vallée ont chacun un long récit (six à neuf étapes, sur
//  des semaines) : leur histoire révélée peu à peu, un vrai dilemme dont le
//  choix change la fin, les liens entre eux, parfois la vallée (une noce, un
//  départ sur la route, une lumière au phare, une boutique qui change) ; des
//  lettres à la boîte, des cadeaux en retour, une ou deux cinématiques. Les
//  récits se croisent (la croix d'Émile, la soupe de Bonnefoy, la lettre
//  d'Hélène, le chiot du garde…). Un habitant qui meurt : son récit s'achève
//  là, doucement (« deuil ») ; celui qui manque à une étape d'un autre est
//  remplacé par la suite du récit, sans impasse.
//  Ici : les objets, les textes de l'écran, les voix (saluts selon l'amitié,
//  souvenirs, visites à la ferme), la suite des quêtes d'avant (une phrase de
//  plus, quelques jours après), les portraits du carnet « Proches ».
//  Les récits : 05-zzzzzzzK18-1/2/3-*.js ; le moteur : 11-zzzzzzzK18-1-recits.js ;
//  les scènes : 11-zzzzzzzK18-2-scenes.js ; le carnet : 12-zzzzzzzK18-carnet.js.
//  Textes : {npc:id}, {prenom}, {fermier}, {ville}, {hameau}, {lieu:k} (fmtLine) ;
//  {e} : le e de la fermière ; {m:masculin|féminin}.
// ============================================================================
const K18_ARCS = [];

// ---------------------------------------------------------------- les objets des récits (ils ne se vendent pas)
for (const [id, nom, ic, col, desc] of [
  ['k18_bague_fer', 'Bague de fer', 'anneau', '#3a3634', 'Une bague de fer noir, forgée en quatre-vingt-quatorze, polie par seize ans de chemise. Elle est plus lourde qu’une bague d’or.'],
  ['k18_clochette', 'Clochette de laiton', 'objet', '#c8a848', 'Une clochette de laiton sur un cordon neuf. Elle ne sonne que si quelqu’un marche pieds nus dans l’herbe, pas loin.'],
  ['k18_dessin', 'Un dessin d’enfant', 'lettre', '#e8dcc0', 'Une maison, un four qui fume, une grande personne aux bras très longs qui tient une lanterne. En bas : « C’est toi. »'],
  ['k18_soupe', 'Bol de soupe de Bonnefoy', 'objet', '#b8784a', 'Une soupe du dimanche dans un bol couvert d’une assiette. Elle sent le lard, le poireau, et un peu trop le sel.'],
  ['k18_lettres_rose', 'Quarante lettres', 'colis', '#d8ccb0', 'Un paquet ficelé, épais comme un missel : quarante lettres, une par an et quelques-unes en trop, pour Rose. Jamais postées.'],
  ['k18_grimoire', 'Grimoire de la forêt', 'livre', '#5a3a2a', 'Un cahier épais, cousu de fil rouge, d’une écriture qui change trois fois. Les dernières pages sont blanches. Ce sont les vôtres.'],
  ['k18_chiot', 'Chiot du ranch', 'objet', '#8a6a44', 'Une boule de poils qui sent le lait et la paille, et qui mordille tout. Le plus bête de la portée : celui qui aboiera le plus.'],
  ['k18_lettre_helene', 'Lettre sans timbre', 'lettre', '#d8ccb0', 'Une enveloppe jaunie, sans timbre, adressée au maire d’une écriture de femme. Ouverte à la vapeur il y a longtemps, et refermée.'],
  ['k18_medaille', 'Médaille de la commune', 'objet', '#d8b848', 'Une médaille de bronze aux armes de la ville, frappée pour un préfet qui n’est jamais venu. Au dos, gravé de travers, à votre nom : « Présent. »'],
  ['k18_timbre', 'Le premier timbre', 'lettre', '#a84a3a', 'Une Semeuse rouge décollée d’un carnet des bonnes nouvelles. Au dos de la charnière, au crayon : « Votre arrivée. »'],
]) defItem(id, nom, 'quete', 0, [ic, col], { desc, questItem: true });

// ---------------------------------------------------------------- les textes de l'écran
const K18_TEXTES = {
  recits: 'Récits',
  recit: 'Un récit',
  proches: 'Proches',
  chapitre: 'Chapitre',
  attente: 'La suite viendra : il faut du temps, ou un peu plus d’amitié.',
  fini: 'Achevé',
  revoir: 'Revoir',
  aucun: 'Personne encore. Parlez aux habitants, revenez les voir : on ne devient proche qu’à la longue.',
  souvenir: 'Dernier souvenir',
  deuil: '†',
  parti: 'emmené{e} à la préfecture',
  enRoute: 'parti{e} sur la route, pour quelques jours',
  passer: 'Passé{e} vous voir',
};
// ce qu'on est pour eux (le niveau d'amitié, de 0 à 10)
const K18_NIVEAUX = [[0, 'une connaissance'], [2, 'quelqu’un de familier'], [4, 'un ami'], [6, 'un proche'], [8, 'comme de la famille']];

// ---------------------------------------------------------------- les voix : saluts selon l'amitié, souvenirs, visites
// ami (niveau 3 à 5), proche (6 et plus), cadeau ({objet} : le dernier cadeau), quete ({quete} : la dernière quête faite),
// ferme (votre ferme qui pousse), gel, pluie (le temps), vies (une partie d'avant : un autre fermier, mort ou parti),
// visite (à la ferme, quand on les y trouve), don (ce qu'ils apportent), absent (le mot laissé quand on n'y est pas).
const K18_VOIX = {
  maire: {
    ami: ['Ah, {fermier} ! Je vous ai cité dans mon rapport hebdomadaire. Positivement. Le préfet ne le lira pas, mais c’est écrit.', 'Une commune, c’est des gens comme vous qui reviennent. Le reste, c’est du papier.'],
    proche: ['Vous ! Asseyez-vous, j’ai une heure entre deux arrêtés. Enfin, j’ai une heure tout court. Les arrêtés attendront.', 'Je vous ai inscrit au registre des personnes de confiance. Il n’existe pas. Je viens de le créer. Vous êtes le premier nom.'],
    cadeau: 'Votre {objet}, l’autre jour… Je l’ai posé sur mon bureau, entre le tampon et le portrait du président. Il fait meilleure figure que le président.',
    quete: 'Depuis « {quete} », je dors mieux. Pas beaucoup mieux. Mais je l’ai noté au registre, et ce qui est noté existe.',
    ferme: 'J’ai fait un détour par votre ferme, en tournée d’inspection. Belle tenue ! Je n’ai rien inspecté. J’ai regardé.',
    gel: 'Gel ce matin ! J’ai fait saler le pont nord. Enfin, j’ai demandé au garde. Enfin, j’ai pensé très fort à le lui demander.',
    pluie: 'Il pleut sur la commune. Je le prends personnellement, comme tout ce qui tombe sur la commune.',
    vies: 'Vous savez, il y a eu quelqu’un avant vous, à la vieille ferme. Je l’ai inscrit, et puis je l’ai rayé. Je n’aime pas rayer les gens. Ne m’obligez pas à recommencer.',
    visite: ['Visite officielle ! Non, je plaisante. Visite tout court. Je passais. Je ne passe jamais par ici. Voilà.', 'J’ai apporté une bouteille de la cave municipale. La commune vous la doit. Ne le dites pas au conseil.'],
    don: { vin: 2 },
    absent: 'Passé à la ferme pour une visite de courtoisie. Personne. J’ai laissé deux bouteilles au pied de la porte, et ma carte. Enfin, mon nom, écrit sur un ticket de marché. — Le maire.',
  },
  boulangere: {
    ami: ['Mon chou ! Vous tombez bien, j’ai une miche qui a raté sa vocation de miche. Elle sera parfaite pour vous.', 'Entrez, entrez, ça sent bon, et pour vous, sentir, c’est toujours gratuit. Le reste aussi, presque.'],
    proche: ['Te voilà. Assieds-toi sur le sac, celui qui n’est pas percé. Tu as une petite mine. Je le dis toujours, et j’ai toujours raison.', 'Je t’ai gardé la plus dorée. Ne la montre pas à la petite, elle dira que je fais des préférences. J’en fais.'],
    cadeau: 'Votre {objet}, mon chou… Je l’ai mis sur l’étagère du haut, là où je range ce qui compte. Il y a la boîte à sel, et lui.',
    quete: '« {quete} », vous vous souvenez ? Moi, j’y pense en pétrissant. Ça fait lever la pâte, les bons souvenirs.',
    ferme: 'J’ai vu de la fumée à votre cheminée, ce matin, en allant au four. Ça m’a fait chaud au ventre. Une ferme qui fume, c’est une ferme qui vit.',
    gel: 'Gel ! Le levain boude. Je l’ai couché contre le four, comme un enfant. Vous, couvrez-vous, vous n’avez pas de four.',
    pluie: 'La pluie fait gonfler la pâte et rétrécir les clients. Pas vous. Vous, vous venez quand même.',
    vies: 'Vous ressemblez à quelqu’un qui est passé par ici, avant. Il achetait sa miche le mardi. Un mardi, il n’est pas venu. Ne me faites pas ça, d’accord ?',
    visite: ['Je vous ai apporté du pain chaud ! Enfin, il était chaud quand je suis partie. Il est tiède. Il est fidèle, comme moi.', 'Doux Jésus, votre ferme ! Vous dormez où, là-dedans ? Vous mangez quoi ? Tenez. Mangez ça.'],
    don: { pain: 2, brioche: 1 },
    absent: 'Passée avec du pain. Personne. Je l’ai mis sur le rebord de la fenêtre, sous un torchon. Si un corbeau l’a pris, c’est un corbeau qui mange bien. — La boulangère.',
  },
  forgeron: {
    ami: ['Vous.', 'Il fait chaud, ici. C’est la forge. Restez.'],
    proche: ['(Il pose le marteau.) Vous. Bien.', 'J’ai réparé votre gond. Vous ne me l’aviez pas demandé. Il grinçait. Je l’entendais d’ici.'],
    cadeau: 'Votre {objet}. Je l’ai gardé. Sur l’étagère. À côté du fer de mon père.',
    quete: '« {quete} ». Je n’oublie pas. Je ne dis rien. Mais je n’oublie pas.',
    ferme: 'Vos outils. Je les ai vus. Affûtez-les. Ou apportez-les. Je le ferai.',
    gel: 'Gel. Le fer casse, par ce froid. Les gens aussi. Couvrez-vous.',
    pluie: 'Pluie. Le soufflet tire mal. Moi aussi.',
    vies: 'Il y en a eu un autre, avant vous. Je lui avais forgé une serrure. Elle n’a pas suffi. La vôtre est plus solide. Je vérifie.',
    visite: ['Je passais. (Il ne passait pas.) Votre porte. Je l’ai regardée. Elle tient.', 'Tenez. Des clous. On manque toujours de clous.'],
    don: { lingot_fer: 1 },
    absent: 'Passé. Personne. Le gond de la grange : réparé. Ne remerciez pas. — M.',
  },
  grainetiere: {
    ami: ['Vous voilà. Payez d’abord, on parlera après. … Je plaisante. À moitié.', 'Vos carottes de la semaine dernière, je les ai vues au marché. Droites. Pas mal. Ne vous en vantez pas.'],
    proche: ['Entrez. Non, pas par là, vous allez renverser les lentilles. Asseyez-vous sur le comptoir, comme un gamin. Vous en êtes un.', 'J’ai mis de côté des graines pour vous. Les meilleures. Ne dites pas « merci », je déteste ça, dites « bonnes ».'],
    cadeau: 'Votre {objet}. Je l’ai pesé. Il pèse ce qu’il pèse. Je l’ai gardé quand même.',
    quete: '« {quete} ». Je l’ai inscrit sur l’ardoise, du côté des choses qu’on me doit pas. C’est un côté très court.',
    ferme: 'Votre terre lève. Je le vois depuis la route, au vert. Elle vous écoute. Elle n’écoutait plus personne.',
    gel: 'Gelée. Rentrez vos semis, ou mangez-les ce soir. Il n’y a pas de troisième chemin.',
    pluie: 'Il pleut. Bonne pour la terre, mauvaise pour mes sacs. Je compte les gouttes au plafond. Sept.',
    vies: 'Je regarde vos mains quand vous payez. Il y en a eu d’autres, avant, sur ce comptoir, avec le même argent. Ne me demandez pas lesquelles.',
    visite: ['Je suis venue voir vos rangs. Ils sont de travers. Je les préfère comme ça.', 'Tenez. Des graines. Ne les payez pas, ça me vexerait.'],
    don: { graines_carotte: 4, graines_chou: 2 },
    absent: 'Passée voir vos rangs. Toujours de travers. Je vous ai laissé un sachet sous la pierre de la porte. Ne le payez pas. — Grenier.',
  },
  aubergiste: {
    ami: ['Ah ! Voilà une figure qui donne faim ! Asseyez-vous, je vous sers quelque chose, et on fera semblant que vous l’avez commandé.', 'Ma marmite chante, aujourd’hui. Quand elle chante, je réussis tout. Restez, vous lui portez chance.'],
    proche: ['Toi ! Viens là que je te serre ! Attention à la chope. Trop tard. Ce n’est rien, j’en ai d’autres, et elles sont toutes fêlées.', 'J’ai inventé un plat en pensant à toi. Il n’a pas encore de nom. Il est un peu trop salé. Comme toutes mes choses importantes.'],
    cadeau: 'Votre {objet}, l’autre jour ! Je l’ai mis à côté de la pipe de l’oncle Anatole. C’est l’étagère d’honneur.',
    quete: '« {quete} » ! J’en parle encore aux clients. J’exagère un peu. Beaucoup. C’est une histoire d’auberge, maintenant.',
    ferme: 'On parle de votre ferme, au comptoir. En bien. Si on en parlait en mal, je saurais quoi faire de mon torchon.',
    gel: 'Gel ! C’est le temps du vin chaud. J’en fais pour les clients et j’en goûte pour moi. Le cuisinier doit goûter.',
    pluie: 'Il pleut ! La salle sera pleine. Les gens aiment être mouillés ensemble.',
    vies: 'Il y avait une chope à son nom, ici, au fermier d’avant. Je l’ai gardée sur le haut de l’étagère. Je ne vous la donnerai pas. Je vous en ferai une neuve.',
    visite: ['Livraison ! Personne n’a commandé, c’est le principe. Un ragoût, encore chaud, pour la vieille ferme.', 'Je sors jamais de l’auberge. Alors je suis sorti, pour voir. C’est grand, dehors. Je rentre.'],
    don: { ragout: 1, vin: 1 },
    absent: 'Passé avec un ragoût. Personne. Je l’ai mis dans votre cheminée, au chaud. Si les souris l’ont mangé, dites-leur que c’était trop salé. — Bonnefoy.',
  },
  postiere: {
    ami: ['Bonjour ! Rien pour vous. Mais j’ai vérifié deux fois, ce qui est une forme d’affection, administrativement.', 'Vous savez quoi ? Non, je ne peux pas vous le dire. Si. Non. Plus tard. Peut-être.'],
    proche: ['Toi ! J’ai une page à ton nom, dans le carnet des bonnes nouvelles. Elle s’allonge. Je ne te la montrerai pas, mais elle s’allonge.', 'Je t’ai gardé un timbre neuf, un beau, au cas où tu aurais quelqu’un à qui écrire. Écris. Ça fait toujours arriver quelque chose.'],
    cadeau: 'Votre {objet} ! Je l’ai mis sur le guichet. Les gens me demandent qui me l’a donné. Je réponds « secret postal ». Ça les rend fous.',
    quete: '« {quete} » ! Je l’ai noté dans le carnet des bonnes nouvelles. Avec la date. Et l’heure. Et le temps qu’il faisait.',
    ferme: 'Votre boîte aux lettres a l’air contente. Si, si, une boîte aux lettres, ça a un air. La vôtre a l’air d’attendre quelque chose de bien.',
    gel: 'Gel ! Les timbres collent à la langue. J’en ai encore un sur le bout. Ne riez pas, c’est un risque du métier.',
    pluie: 'Il pleut, et le courrier passe. Pluie ou pas. C’est la règle. C’est la plus belle règle du monde.',
    vies: 'J’ai trié du courrier pour la vieille ferme, avant vous. Il y en a qui est revenu, « destinataire inconnu ». Le vôtre, je le garde au sec.',
    visite: ['Je faisais ma tournée ! Enfin, je l’ai rallongée exprès. Un peu. Beaucoup. Bonjour !', 'Pas de courrier pour vous. Alors je suis venue moi-même. C’est presque pareil, non ?'],
    don: { plume: 3 },
    absent: 'Passée à la ferme, hors tournée. Personne. Je vous écris donc ce mot, que je vais poster, et que je vais distribuer, à vous. C’est absurde. C’est très bien. — La Poste.',
  },
  garde: {
    ami: ['Halte ! … Ah, c’est vous. Pardon. Le règlement dit de crier « halte » à tout le monde. Même aux amis. Surtout aux amis.', 'Rien à signaler. C’est-à-dire qu’il y a des choses, mais rien que je puisse signaler.'],
    proche: ['Vous ! J’ai fait une ronde de plus près de chez vous, cette nuit. Rien. Enfin, un hibou. Je l’ai salué. Il ne m’a pas répondu. C’est réglementaire.', 'Avec vous, je n’ai pas peur. Enfin, moins. Disons que j’ai peur pour deux, et que c’est plus supportable.'],
    cadeau: 'Votre {objet}. Je l’ai inscrit au registre du poste. Objet trouvé : non. Objet donné : oui. Valeur : grande.',
    quete: '« {quete} ». Je l’ai mis dans mon rapport. Le préfet ne répond jamais, mais il le saura. Quelque part.',
    ferme: 'J’ai fait le tour de votre ferme, hier soir. Tout était fermé. Bravo. C’est la plus belle chose qu’on puisse dire d’une ferme, ici.',
    gel: 'Gel. Le treuil du pont colle. Je l’ai réchauffé avec mes mains. Elles collent aussi.',
    pluie: 'Pluie. On n’entend plus les pas sur le pont. Je ne sais pas si c’est mieux ou pire. Je note « pire ».',
    vies: 'Il y a eu un fermier, avant vous. Il était dehors après neuf heures, un soir. Je n’ai pas baissé le pont. C’est le règlement. Rentrez à l’heure, vous. S’il vous plaît.',
    visite: ['Ronde de jour ! Ça n’existe pas. Je l’ai inventée. Pour voir votre ferme en plein soleil. Elle est jolie, de jour.', 'Tout est en ordre ici ? Bien. Bien. Je reste une minute. Pour vérifier l’ordre.'],
    don: { bougie: 2 },
    absent: 'Rapport de ronde. Ferme de la vieille route : fermée, en ordre, personne. Laissé deux bougies sur le seuil, pour la nuit. Fin du rapport. — Le garde.',
  },
  eleveuse: {
    ami: ['Vous ! Bien. Vous avez des bottes, aujourd’hui. On progresse.', 'Tempête vous a reconnu, tout à l’heure. Elle a couché les oreilles. Chez elle, c’est de la tendresse.'],
    proche: ['Te voilà. Viens, on a un veau qui naît de travers, et j’ai besoin de bras qui ne tremblent pas. Je plaisante. À moitié.', 'Tu sens la ferme. C’est un compliment. C’est le plus grand que je fais.'],
    cadeau: 'Votre {objet}… Je l’ai gardé. Je ne garde rien, d’habitude. Les bêtes, ça mange tout.',
    quete: '« {quete} ». Je m’en souviens. Je ne remercie pas deux fois, mais je me souviens.',
    ferme: 'J’ai vu vos bêtes depuis la route. Bien tenues. Vous leur parlez ? Parlez-leur. Ça ne sert à rien, et c’est essentiel.',
    gel: 'Gel. J’ai cassé la glace des abreuvoirs à la masse. Pensez aux vôtres. Une bête qui a soif ne le dit pas : elle meurt.',
    pluie: 'Pluie. Les vaches s’en fichent. Moi aussi. Vous, rentrez, vous avez une tête de citadin mouillé.',
    vies: 'Mes bêtes regardaient vers votre ferme, l’hiver d’avant vous. Toutes. Et puis plus personne n’y a vécu. Elles ne regardent plus. C’est bon signe.',
    visite: ['Je passais avec la charrette. Je me suis arrêtée. Voilà. Je m’arrête jamais.', 'Tenez. Du lait du matin. Il est encore tiède, comme les bêtes.'],
    don: { lait: 1, oeuf: 3 },
    absent: 'Passée avec la charrette. Personne. Lait et œufs à l’ombre, sous la grange. Ferme ta barrière, la prochaine fois. — S. Chabert.',
  },
  pecheur: {
    ami: ['Bonjour. L’eau est calme. Ça ne veut rien dire, mais c’est agréable.', 'Le Notaire a mordu, ce matin. Il a regardé l’hameçon, et il est reparti. Comme s’il me devait de l’argent, cette fois.'],
    proche: ['Vous. Asseyez-vous. On ne dira rien, et ce sera bien.', 'Je vous ai gardé une truite. Elle était belle. Je lui ai demandé pardon. Elle a compris, je crois.'],
    cadeau: 'Votre {objet}… Je l’ai mis dans la cabane, près de la boussole. Les choses qu’on me donne, je les mets près de la boussole.',
    quete: '« {quete} ». J’y pense quand je relève les nasses. Elles sont moins lourdes, ces temps-ci.',
    ferme: 'Votre ferme est loin de l’eau. C’est une chance. L’eau, ça prend.',
    gel: 'Gel. Le lac fume. Il fait ça quand il a quelque chose à cacher.',
    pluie: 'Pluie. Les poissons montent. Moi, je reste. Il faut bien que quelqu’un reste.',
    vies: 'Il y avait un fermier, avant vous. Il venait pêcher le dimanche. Il ne prenait rien. Un dimanche, il n’est pas venu. Le lac était calme, ce jour-là.',
    visite: ['J’ai apporté du poisson. Fumé. Il ne sent plus l’eau. C’est mieux, pour une ferme.', 'Je n’étais jamais venu jusqu’ici. Il n’y a pas d’eau. C’est reposant.'],
    don: { poisson_fume: 2 },
    absent: 'Passé avec du poisson. Personne. Accroché à la porte, dans un linge, loin des chats. — Morvan.',
  },
  guerisseuse: {
    ami: ['Te voilà. Tu as marché vite : tes joues le disent. Assieds-toi. Pas sur la souche.', 'Tu as une coupure, là. Non, tu ne l’as pas vue. Moi si. Donne.'],
    proche: ['Mon enfant. Viens que je te regarde. Tu dors mal. Je le sais : je dors mal aussi, et ça se voit pareil.', 'J’ai mis de côté une racine pour toi. Elle ne soigne rien. Elle sent bon. Ça soigne aussi.'],
    cadeau: 'Ton {objet}… Je l’ai pendu au-dessus de la porte, avec les choses qui protègent. Il protège, tu sais. Tout ce qu’on donne de bon cœur protège.',
    quete: '« {quete} ». La forêt s’en souvient. Elle me l’a dit. Ne ris pas.',
    ferme: 'Ta terre, je l’ai sentie d’ici, ce matin, par le vent d’est. Elle sent le travail. Elle ne sentait que le froid.',
    gel: 'Gel. Mets de la graisse sur tes mains, et une tasse de thym dans ton ventre. Et ne sors pas pieds nus. Personne ne doit sortir pieds nus.',
    pluie: 'Il pleut. Les champignons montent, et les morts aussi, un peu. Ne cueille que les premiers.',
    vies: 'Je t’ai vu{e} arriver, cette fois-ci. L’autre fois aussi. Ce n’était pas tout à fait toi. Ne me demande pas comment je le sais : c’est le métier.',
    visite: ['La forêt m’a dit que tu avais besoin d’une tisane. La forêt dit beaucoup de bêtises. Mais tiens.', 'Je ne sors jamais de la forêt. Ta ferme est au bord du monde. Je suis venue voir le bord.'],
    don: { tisane: 2 },
    absent: 'Passée. Personne. Une tisane sur le seuil, dans un pot fermé. Bois-la chaude. La forêt t’embrasse, et moi aussi, un peu. — S. M.',
  },
  fillette: {
    ami: ['T’es là ! Lise dit que t’es gentil{le}. Lise se trompe jamais. Enfin, presque.', 'Tu veux voir ma dent ? Elle bouge. Non, l’autre. Elle bouge aussi.'],
    proche: ['T’es revenu{e} ! J’ai fait un dessin de toi. T’as des bras très longs, dessus. C’est pour porter les choses lourdes.', 'Tu sais quoi ? Quand t’es là, maman chante. Faux. Mais elle chante.'],
    cadeau: 'Ton {objet}, je l’ai mis dans ma boîte à trésors ! À côté du bouton de papa. C’est la meilleure place.',
    quete: 'Tu te souviens, « {quete} » ? Lise en parle encore. Elle dit que t’as été courageux{m:|se}. Moi aussi je le dis.',
    ferme: 'Je suis passée devant ta ferme avec maman ! T’as des poules ? Je veux les voir. Elles ont des noms ? Il faut des noms.',
    gel: 'Il a gelé ! J’ai fait une glissade de la boulangerie jusqu’au puits. Maman a crié. C’était bien.',
    pluie: 'Il pleut. Lise aime la pluie. Elle dit que ça lui fait comme à la maison.',
    vies: 'Lise dit que t’es déjà venu{e}, avant. Avec une autre figure. Moi je me souviens pas. Mais Lise, elle se souvient de tout le monde.',
    visite: ['Maman m’a laissée venir ! Toute seule ! Enfin, jusqu’au tournant. Après, j’ai couru.', 'Je t’ai apporté un caillou. Il est rond. C’est le plus rond que j’ai trouvé.'],
    don: { fleur: 2 },
    absent: 'Je suis venue. T’étais pas là. J’ai laissé deux fleurs dans ta boîte. Lise dit qu’elles vont faner. C’est pas grave, c’est le principe. — signé : moi',
  },
};

// ---------------------------------------------------------------- la suite des quêtes d'avant : une phrase de plus
// (dite une fois, à la première rencontre de un à six jours après la quête faite ; {fermier}… comme partout)
const K18_APRES = {
  maire_1: 'Le préfet n’est pas venu. Mais une petite vieille s’est arrêtée devant les jardinières, et elle a souri. J’ai décidé que c’était le préfet.',
  maire_2: 'Le pont nord ne s’est plus abaissé la nuit. Enfin, je n’ai plus regardé. C’est peut-être la même chose, en droit administratif.',
  maire_3: 'Ma chevalière… Je ne l’enlève plus, même pour dormir. Ma femme me l’avait fait agrandir. C’est la seule chose d’elle qui me serre encore.',
  maire_4: 'Les réverbères sont posés. La première nuit, j’ai fait le tour de la place six fois, rien que pour marcher dans la lumière.',
  boulangere_1: 'Votre blé a fait une farine d’un blanc ! La petite a dit que le pain avait le goût de « dehors ». Je ne sais pas ce que ça veut dire, mais c’est vrai.',
  boulangere_2: 'La dame de la forêt m’a renvoyé le panier, avec dedans une racine qui sent la réglisse. Je ne sais pas quoi en faire. Je l’ai mise sous l’oreiller de la petite.',
  boulangere_3: 'L’alliance d’Émile… Je la sors de la boîte à sel le soir, je la regarde, et je la range. Elle est toujours tiède. Je ne cherche plus pourquoi.',
  forgeron_1: 'L’enclume a bien bu votre fer. Elle sonne plus clair. Mon père disait qu’une enclume contente sonne comme une église.',
  forgeron_2: 'Le fer de mon père, je l’ai cloué au-dessus de la porte. Clous neufs. Les miens, cette fois.',
  forgeron_3: 'La bague. Toujours pas donnée. Ne demandez pas. Merci de ne pas demander.',
  grainetiere_1: 'Vos légumes de la première récolte, je les ai vendus en disant d’où ils venaient. On les a achetés pour ça. Les gens sont superstitieux, et ils ont raison.',
  grainetiere_2: 'L’éleveuse a payé l’avoine avec un fromage. Je ne fais pas de troc. J’ai fait du troc. Ne le répétez pas.',
  grainetiere_3: 'L’épouvantail… Depuis que vous l’avez veillé, j’y pense le soir. Anselme voulait que je vienne le regarder. Je ne suis jamais venue.',
  aubergiste_1: 'Le ragoût du dimanche a fait salle comble. Même le curé a repris deux fois, et il s’est confessé à lui-même en sortant.',
  aubergiste_2: 'Marchal a commencé à payer son ardoise. Un sou par jour, en silence. Je ne lui ai pas dit que je l’avais effacée.',
  aubergiste_3: 'La pipe de l’oncle est sur l’étagère d’honneur. Certains soirs, la salle sent son tabac. Je ne l’allume pas. Elle s’allume.',
  cure_1: 'Les enfants ont trouvé tous les œufs. Sauf un. Je le cherche encore. Je crois que c’est un péché d’orgueil, de chercher un œuf aussi longtemps.',
  cure_2: 'Le chapelet de l’abbé Mauduit… Je l’ai remis à l’endroit. Le lendemain, la croix pendait de nouveau à l’envers. Je la laisse. On ne discute pas avec un mort.',
  cure_3: 'Trois heures trente-trois. Depuis que vous êtes venu voir, la cloche sonne juste. Je ne sais pas si je dois vous remercier ou vous plaindre.',
  postiere_1: 'Le pli de la préfecture ! Mon oncle l’a ouvert, il a lu, il a dit « enfin », et il l’a rangé. Il ne m’a pas dit ce qu’il y avait. C’est la première fois que je ne sais pas.',
  postiere_2: 'Elle a rougi, hein ? Je le savais. Je sais tout. Enfin, je ne sais toujours pas qui écrit. C’est insupportable.',
  postiere_3: 'Avec vos plumes, j’ai réécrit tout mon registre au propre. Douze ans de courrier. J’ai pleuré à deux endroits. Ne demandez pas lesquels.',
  postiere_4: 'Le colis du ponton… Le pêcheur ne l’a pas ouvert devant vous ? Il ne l’ouvre jamais devant personne. Il y en a un tous les ans, à la même date.',
  postiere_5: 'Le faire-part au nom blanc… La guérisseuse l’a regardé et elle a dit « pas encore ». Je n’ai plus envie de livrer de faire-part, ces temps-ci.',
  garde_1: 'Le tablier du pont ne grince plus. Maintenant, j’entends tout le reste. Je préférais le grincement, je crois.',
  garde_2: 'La clé du treuil ne quitte plus ma ceinture. Les marques de dents dessus, je les ai comptées. Vingt-huit. Ce n’est pas une bouche d’homme.',
  garde_3: 'Les pas sur le pont sud… Je les compte toujours. Mais depuis que vous êtes venu les entendre avec moi, je ne les compte plus tout seul.',
  eleveuse_1: 'Tempête a mangé vos pommes comme une reine, et elle m’a mordue pour me remercier. Elle a de qui tenir.',
  eleveuse_2: 'La cloche de Blanchette ne sonne toujours pas. Je l’ai pendue à l’étable. Les vaches la regardent. Je ne sais pas ce qu’elles entendent.',
  eleveuse_3: 'Le hameau abandonné, la nuit… Les bêtes ont arrêté de regarder par là, depuis votre visite. Elles regardent votre ferme, maintenant. Ne le prenez pas mal.',
  pecheur_1: 'Les filets tiennent. Le Notaire a essayé de passer à travers, ce matin. Il m’a regardé, vexé. C’est la première fois que je gagne.',
  pecheur_2: 'La boussole de Jules… L’aiguille montre toujours le lac. Sauf le dimanche soir, quand je pose le bol de lait. Là, elle tremble.',
  pecheur_3: 'Le clocher sous l’eau. Depuis que vous l’avez vu, je ne suis plus seul à l’avoir vu. C’est étrange comme ça soulage.',
  guerisseuse_1: 'L’onguent de l’hiver est prêt. Toute la vallée en aura. Ceux qui me traitent de sorcière aussi. Surtout eux : ils ont les mains les plus gercées.',
  guerisseuse_2: 'La dent du vieux loup est pendue au-dessus de mon lit. Il ne vient plus rôder. Il savait où était sa dent. Maintenant, il sait que je la garde.',
  guerisseuse_3: 'Le puits qui murmure… Tu as entendu son nom, n’est-ce pas ? Ne le répète pas. Même à moi. Surtout à moi.',
  fillette_1: 'Lise a mis la couronne. Elle dit que c’est la première fois qu’on lui fait une couronne depuis… depuis très longtemps. Elle a pas dit combien.',
  fillette_2: 'Lise a retrouvé sa poupée ! Elle la serre tout le temps. Elle dit merci. Elle dit aussi que t’as marché sur une tombe, en revenant. C’est pas grave.',
  fillette_3: 'C’est nous qui changeons de côté… Je l’ai dit à maman. Elle a fait la tête qu’elle fait quand je dis des choses vraies.',
};

// ---------------------------------------------------------------- les portraits du carnet « Proches » (ce qu'on sait d'eux, à mesure)
// [niveau, texte] : le dernier dont le niveau est atteint ; la fin d'un récit ajoute sa phrase (05-…-arcs : fins[f].resume).
const K18_PORTRAITS = {
  maire: [[0, 'Le maire, ceint de son écharpe depuis l’enterrement de son père. Pompeux, inquiet, il tient un registre de tout.'], [3, 'Il fait des discours trop longs et des blagues trop courtes. Sa femme, Hélène, est partie une nuit d’octobre, sans son manteau.'], [6, 'Il tient, dans un tiroir fermé, la liste des disparus des nuits rouges. Il voudrait tant l’arrêter.'], [8, 'Un petit garçon de sept ans s’est réveillé un matin les pieds pleins de terre rouge, et son père ne l’a plus jamais embrassé. C’est lui.']],
  boulangere: [[0, 'La boulangère, joviale et bavarde, levée à trois heures et demie, été comme hiver. Elle appelle tout le monde « mon chou ».'], [3, 'Son mari, Émile, est sorti un soir de septembre avec une lanterne. On n’a jamais retrouvé que la pâte, qui avait débordé.'], [6, 'Elle a recommencé à chanter en pétrissant. Faux. Sa fille rit dans l’escalier, un vrai rire.'], [8, 'Elle a jeté un louis d’or dans le vieux puits pour avoir une enfant. Elle croit que le puits a rendu la monnaie.']],
  forgeron: [[0, 'Le forgeron. Taciturne, loyal. Il trempe deux fois, même les clous.'], [3, 'Son père est mort à la mine, avec treize autres. Lui devait descendre ce jour-là. Il a dit qu’il avait mal au ventre.'], [6, 'Il achète un pain chaque matin et reste un quart d’heure devant le comptoir de la boulangère. Il ne dit rien.'], [8, 'Il porte une bague de fer sous sa chemise depuis seize ans.']],
  grainetiere: [[0, 'La grainetière. Têtue, franche, elle pèse tout, même les compliments.'], [3, 'Anselme Varenne posait une citrouille sur son seuil chaque automne, pendant quarante ans, sans un mot. Elle lui avait dit non.'], [6, 'Elle a gardé l’ardoise d’Anselme derrière le comptoir : trois francs quarante, une corde et une lanterne.'], [8, 'Elle a eu un enfant de lui, né une nuit de lune rouge, donné à des charbonniers. Elle regarde vos mains quand vous payez.']],
  aubergiste: [[0, 'L’aubergiste du Coq Tordu. Jovial, gourmand, la sauce un peu trop salée.'], [3, 'Hortense, la colporteuse de la chambre sept, devait l’épouser à la Saint-Jean. Un matin de brouillard, elle est partie.'], [6, 'Il rêve d’une noce dans sa grande salle, avec des vivants qui cassent ses chopes.'], [8, 'Le soir de l’orage, il a dit « chiche » à Jules Morvan, qui est sorti sous la pluie et n’est jamais revenu.']],
  postiere: [[0, 'La postière. Curieuse, pressée, elle lit les enveloppes et jure qu’elle ne lit pas les lettres.'], [3, 'Son père conduisait la voiture jaune du courrier. Un soir de brouillard, les chevaux sont rentrés seuls.'], [6, 'Elle tient un carnet des bonnes nouvelles. Votre arrivée y est soulignée deux fois.'], [8, 'Elle garde depuis vingt ans une lettre qui n’était pas pour elle. Chaque dimanche, elle répond « rien, mon oncle ».']],
  garde: [[0, 'Le garde des ponts. Zélé, peureux. Il lève les ponts à neuf heures pile.'], [3, 'Il a fait Madagascar. Hortense Brunet ne voulait pas d’un mari qu’on ne voit qu’à la lueur d’une lanterne.'], [6, 'Il voudrait un chien, pour qu’il ait peur à sa place.'], [8, 'Une nuit de faction, il a crié « qui vive » une seule fois, et il a tiré. C’était un petit Breton de dix-neuf ans.']],
  eleveuse: [[0, 'L’éleveuse du ranch. Robuste, directe. Elle vend ses bêtes comme on marie ses filles.'], [3, 'Augustin, son mari, venait du Charolais. Il lui avait offert une pouliche grise au lieu d’une bague.'], [6, 'Elle reçoit des lettres à la violette, sans signature. Elle guette le courrier comme une gamine.'], [8, 'Le neuvième soir de la fièvre, c’est elle qui a donné la tisane à l’amande amère. Elle ne le regrette pas.']],
  pecheur: [[0, 'Le pêcheur. Patient, mélancolique. Il connaît chaque herbier du lac, et un vieux brochet qu’il appelle le Notaire.'], [3, 'Son frère Jules a disparu sur le lac, un soir d’orage. On a retrouvé la barque retournée, les avirons bien rangés.'], [6, 'Il pose un bol de lait pour la Dame au bout du ponton, chaque dimanche.'], [8, 'Il était sur l’eau, ce soir-là, à trente brasses. Il a viré de bord. Il ne sait pas nager.']],
  guerisseuse: [[0, 'La guérisseuse, au fond de la forêt. On la paie en œufs, en lard, et surtout en silence.'], [3, 'Étienne, un charbonnier, se brûlait les mains exprès pour venir se faire soigner. Il n’est pas revenu au printemps.'], [6, 'Elle cherche quelqu’un à qui laisser le grimoire de sa grand-mère, « pour celle qui viendra ».'], [8, 'Elle a donné le visage d’Étienne à ceux d’en bas pour sauver une enfant. Elle se souvient de tout, sauf de lui.']],
  fillette: [[0, 'La fille de la boulangère. Rêveuse, perspicace. Elle a une amie, Lise, que personne d’autre ne voit.'], [3, 'Elle chante la chanson de son père sans l’avoir apprise. Elle l’a entendue « sous le plancher ».'], [6, 'Elle a une boîte à trésors sous son lit ; le bouton de la veste de son papa est la plus belle chose dedans.'], [8, 'Près du vieux puits, un monsieur tout blanc lui dit que son papa l’attend en bas, dans la maison à l’envers.']],
};
