// ============================================================================
//  DEUX PEUPLES DE SURFACE (agent C1)
//  - LES PLANCHES : ceux de Saint-Aubin-des-Eaux. Quand l'étang est monté, en
//    février 1791, et qu'il a pris leur village avec sa cloche, une partie des
//    gens n'est pas partie : ils ont planté des pieux dans les hauts-fonds du
//    grand lac, au sud, au-dessus de leurs morts, et vivent sur des planches
//    depuis. Ils pêchent l'anguille à la nasse, tressent le jonc, ne sonnent
//    jamais de cloche, ne sifflent pas sur l'eau, posent de petites chandelles
//    sur le lac la nuit du Vorndi, un pour chaque maison d'en bas, et gardent la
//    Dame. Leur parler : « le parler d'eau ». Trois habitants : la doyenne, le
//    passeur (il vous fait traverser le lac), la vannière.
//  - L'ESTIVE : des bergers qui montent avec leurs bêtes dans le haut pâturage
//    de l'ouest, une cuvette à l'abri des vents, et n'en descendent qu'à la
//    neige. Trois cabanes de pierre sèche et de lauzes, une jasse, un feu. Ils
//    taillent la marque de leur famille sur les rochers, posent le sel sur des
//    pierres plates, s'appellent d'un versant à l'autre au soir, font un grand
//    feu le Veilledi et y chantent, et mettent une sonnaille sur le cairn de
//    leurs morts. Leur parler : « le parler des hauts ». Trois habitants : le
//    baïle, la fromagère, le pâtre.
//  Leurs parlers ne se traduisent pas : on entend des mots, on les note (onglet
//  Langues), on devine ; quelques-uns seulement se font expliquer.
//  (la génération des villages : c2Villages, appelée par 11-zzzz7-carte.js
//  avant le reste ; le jeu : 11-zzzz7-carte4-peuples-jeu.js)
// ============================================================================

// ---------------------------------------------------------------- leurs objets
// (prix : ce qu'on n'achète qu'à eux se revend moitié prix, règle du commerce)
defItem('anguille_fumee', 'Anguille fumée', 'nourriture', 16, ['poisson', '#3a3026'], { food: 26, desc: 'Une anguille fumée à l’aulne, noire et luisante. Ceux des Planches en vivent l’hiver.' });
defItem('cierge_flottant', 'Chandelle sur liège', 'materiau', 2, ['bougie', '#e8d8a0'], { desc: 'Un bout de chandelle planté dans un rond de liège. Aux Planches, on les pose sur l’eau pour les morts. Elle éclaire aussi une lanterne, comme une bougie.' });
defItem('panier_jonc', 'Panier de jonc', 'materiau', 5, ['sac', '#a89060'], { desc: 'Un panier de jonc tressé serré. Il ne pourrit pas, même mouillé.' });
defItem('bracelet_segue', 'Bracelet de peau d’anguille', 'tresor', 10, ['anneau', '#4a4a3a'], { desc: 'Une lanière de peau d’anguille tressée. Aux Planches, on dit qu’on ne se noie pas quand on le porte. Pas tout de suite.' });
defItem('tomme_estive', 'Tomme d’estive', 'nourriture', 32, ['fromage', '#d8c890'], { food: 30, desc: 'Une tomme à croûte grise, montée au sel de la jasse. Elle sent l’herbe et la bête.' });
defItem('sonnaille', 'Sonnaille', 'tresor', 8, ['objet', '#8a7a5a'], { desc: 'Une cloche de bête, en tôle martelée, au son sourd. Une marque est frappée dessus.' });
defItem('sonnaille_noire', 'Sonnaille à trois traits', 'quete', 0, ['objet', '#6a5a3a'], { desc: 'Une sonnaille cabossée, marquée de trois traits. Elle sonne plus grave que les autres.', questItem: true });
if (ITEMS.lanterne && typeof LANTERNE_HUILES !== 'undefined' && Array.isArray(LANTERNE_HUILES) && !LANTERNE_HUILES.includes('cierge_flottant')) LANTERNE_HUILES.push('cierge_flottant');

// ---------------------------------------------------------------- leurs parlers (on entend les mots ; on n'en apprend que quelques-uns)
const C2_PARLERS = {
  planches: {
    nom: 'le parler d’eau', peuple: 'ceux des Planches',
    desc: 'Le parler des gens des Planches, sur le lac. Du français, avec des mots à eux, plus vieux que l’eau qui a pris leur village.',
    mots: { aigue: 'l’eau', dauna: 'la Dame, celle de l’eau', nau: 'la barque', segue: 'l’anguille', campane: 'la cloche', neble: 'le brouillard', gourg: 'le trou d’eau profond', caleu: 'la petite chandelle', escur: 'le noir, la nuit sans lune', reires: 'les anciens, ceux d’avant' },
    // comment on les écrit dans les répliques (mot → forme vue)
    formes: { aigue: ['aigue'], dauna: ['Dauna'], nau: ['nau'], segue: ['sègue', 'sègues'], campane: ['campane'], neble: ['nèble'], gourg: ['gourg'], caleu: ['calèu', 'calèus'], escur: ['escur'], reires: ['rèires'] },
    max: 4,
  },
  estive: {
    nom: 'le parler des hauts', peuple: 'ceux de l’estive',
    desc: 'Le parler des bergers de l’estive, là-haut, à l’ouest. Ils le parlent entre eux, et le laissent tomber dans le français comme des cailloux.',
    mots: { fea: 'la brebis', aret: 'le bélier', jasse: 'la bergerie', aura: 'le vent', neu: 'la neige', lauza: 'la pierre plate', lop: 'le loup', cabana: 'la cabane', sau: 'le sel', drac: 'ce qui souffle dans la montagne' },
    formes: { fea: ['fea'], aret: ['aret'], jasse: ['jasse'], aura: ['aura'], neu: ['nèu'], lauza: ['lauza'], lop: ['lop'], cabana: ['cabana'], sau: ['sau'], drac: ['drac'] },
    max: 5,
  },
};

// ---------------------------------------------------------------- les habitants
const C2_HABITANTS = [
  // ============================================================ les Planches
  {
    id: 'planches_doyenne', role: 'Doyenne des Planches', gender: 'f', names: ['Aldegonde', 'Scolastique', 'Philomène'], surname: 'Lacombe', age: 84, area: 'planches',
    home: 'pl_doyenne', work: 'pl_doyenne', traits: ['grave', 'secrète'], liens: { planches_passeur: 'petit-fils', planches_vanniere: 'petite-nièce' },
    look: { skin: '#d8b8a0', hair: '#e8e8e0', hairStyle: 'long', hat: 'voile', hatCol: '#26262c', top: '#2a2a32', bottom: '#26262c', dress: true, apron: null, height: 0.9, build: 'mince', fem: true, bust: 0.6, hips: 0.8 },
    schedule: [[6, 'home'], [8, 'work'], [18.5, 'c2:greve'], [20.5, 'home']],
    likes: ['bougie', 'miel', 'pain', 'image_pieuse'], loves: ['perle', 'tisane'], dislikes: ['os', 'plume_noire'],
    shop: null,
    lines: {
      intro: 'Tu es venu par la grève. Bien. Ceux qui arrivent par l’aigue, on ne les reçoit pas. {nom} Lacombe. Mon grand-père sonnait la campane de Saint-Aubin. Assieds-toi, ne siffle pas, et ne dis pas le nom de la Dauna trois fois de suite.',
      greet: {
        matin: ['Le nèble est sur l’aigue. On ne sort pas la nau avant qu’il se lève.', 'Tu as mangé ? Ici, on mange avant de parler.'],
        jour: ['Assieds-toi. Les planches sont solides. Elles le sont depuis soixante ans.', 'Tu regardes l’aigue ? Elle te regarde aussi. C’est poli de baisser les yeux.'],
        soir: ['L’escur vient. Allume un calèu avant, pas après.', 'Le soir, on parle bas. L’aigue porte les voix jusqu’au gourg.'],
        pluie: ['La pluie, c’est la Dauna qui remplit sa maison. On ne s’en plaint pas.'],
        orage: ['Quand ça tonne, on couche les nau et on se tait. Le tonnerre cherche ce qui dépasse.'],
        ami: ['Tu reviens toujours. Tu finiras par avoir des planches à toi, si tu continues.', 'Tu as le pas de quelqu’un d’ici, maintenant. Ne le dis pas en ville.'],
        froid: ['Tu as fait quelque chose qui ne se fait pas. L’aigue le sait déjà.', 'Va. Reviens quand tu seras lavé.'],
        peur: ['Ne t’approche pas. La Dauna me garde, et elle ne garde pas que moi.'],
      },
      about: [
        'Saint-Aubin-des-Eaux, c’était en bas. Là où tu vois l’aigue plus sombre. L’église, le lavoir, la place, la maison de mes arrière-grands-parents. Tout y est encore. Plus bas que les nau.',
        'En 1791, ceux du district sont venus chercher la campane. Il n’a pas plu, et l’eau est montée quand même. Trois jours. Ceux qui sont partis sont allés en ville. Ceux qui sont restés ont planté des pieux.',
        'Les rèires disaient qu’on ne quitte pas ses morts. Les nôtres sont en bas. Alors on vit au-dessus.',
        'On ne sonne pas de cloche, aux Planches. Jamais. Ni pour une noce, ni pour un mort. Les enfants apprennent ça avant leur nom.',
        'Le Vorndi, on pose des calèus sur l’aigue, un pour chaque maison d’en bas. Ils vont où ils veulent. Le matin, il n’y en a plus.',
      ],
      rumeurs: [
        'Le passeur est mon petit-fils. Il fait payer les gens de la ville. Nous, jamais.',
        'Ne pêche pas le gourg. Ce qui mord au fond n’est pas pour les poêles.',
        'La vannière tresse le jonc mieux que sa mère. Sa mère le tressait mieux que moi. Ça se perd, en montant.',
        'Les feux qui marchent sur le marais, là-bas, au sud : ce ne sont pas les nôtres. Les nôtres restent sur l’aigue.',
        'Ceux de la ville disent « les Planches ». Nous, on dit Saint-Aubin. On est polis : on ne les reprend pas.',
        'Quand le nèble reste trois jours, quelqu’un du village se met à entendre la campane. On l’écoute, et on attend.',
      ],
      etrange: ['Cette nuit, les calèus ont fait le tour du village, contre le vent. Personne n’en a parlé au matin.', 'L’aigue était tiède ce matin, sur le gourg. Comme un bain qu’on vient de quitter.', 'On a frappé sous les planches, cette nuit. Trois coups. Personne n’était en bas. Personne de vivant.'],
      cadeau: { adore: 'Ça… Ça, je le garderai jusqu’au bout. Merci, petit.', aime: 'C’est bien. Ça servira.', neutre: 'Pose-le là. Merci.', deteste: 'Remporte ça. Ça ne se donne pas, ici.' },
      nuit: 'Il fait escur. On n’ouvre plus.',
      meurtre: 'Tu as du sang sur toi. L’aigue ne te lavera pas. Va-t’en de mes planches.',
      disparu: '{victime}… On posera un calèu de plus, le Vorndi.',
      nuitrouge: 'La lune était rouge sur l’aigue. Le gourg a bu la lumière. On a gardé les enfants dedans.',
      adieu: ['Marche sur les planches, pas à côté.', 'Va. Et ne siffle pas en partant.'],
      tueur: ['…'], indice: '…',
    },
    quests: [
      { id: 'planches_doyenne_1', title: 'Des calèus pour le Vorndi', type: 'apporter', need: { bougie: 4 }, minAmitie: 0, reward: { argent: 0, amitie: 2, objets: { cierge_flottant: 3 } },
        texte: { offre: 'Le Vorndi approche, et je n’ai plus de cire. Apporte-moi quatre bougies de la ville. Je les couperai en calèus. Il en faut un par maison d’en bas, et il y en a beaucoup.', accepte: 'Quatre. Pas des cierges d’église : ils sentent l’encens, la Dauna n’aime pas.', attente: 'Les bougies, petit. Le Vorndi n’attend pas.', fin: 'Bien. Tiens, garde ces trois-là, montés sur liège. Pose-les sur l’aigue un soir, pour qui tu veux. Elle comprendra.' } },
    ],
  },
  {
    id: 'planches_passeur', role: 'Passeur', gender: 'm', names: ['Honoré', 'Firmin', 'Clément'], surname: 'Lacombe', age: 38, area: 'planches',
    home: 'pl_passeur', work: 'pl_passeur', traits: ['taiseux', 'serviable'], liens: { planches_doyenne: 'grand-mère', planches_vanniere: 'cousine', pecheur: 'estime' },
    look: { skin: '#c8a080', hair: '#3a2a1a', hairStyle: 'court', beard: 'courte', hat: 'bonnet', hatCol: '#4a5a6a', top: '#5a6a5a', bottom: '#3a3a30', dress: false, apron: null, height: 1.02, build: 'normal' },
    schedule: [[5.5, 'home'], [6.5, 'c2:quai'], [12, 'home'], [13, 'c2:quai'], [19, 'c2:greve'], [21, 'home']],
    likes: ['pain', 'tabac', 'corde', 'cidre'], loves: ['canne_fer', 'perle'], dislikes: ['sonnaille', 'os'],
    shop: { name: 'La nau du passeur', sells: [['anguille_fumee', 34], ['cierge_flottant', 6], ['corde', 6], ['vers', 4]], buys: ['anguille', 'carpe', 'brochet', 'tanche', 'gardon', 'perche', 'truite'] },
    lines: {
      intro: 'Vous voulez passer ? {nom} Lacombe, passeur. Trois pièces pour l’autre rive. Ma grand-mère vous a vu arriver. Elle voit tout ce qui arrive, surtout par l’aigue.',
      greet: {
        matin: ['Le nèble se lève. On pourra passer dans une heure.', 'Bonjour. La nau est sèche, pour une fois.'],
        jour: ['Pour l’autre rive ? Montez, je rame.', 'Belle eau aujourd’hui. On voit presque le fond.'],
        soir: ['Je ne passe plus après la brune. Personne ne passe l’aigue la nuit.', 'Le soir, je relève les nasses. Les sègues sortent avec l’escur.'],
        pluie: ['Sous la pluie, la nau prend l’eau par le haut. On passe quand même, si c’est pressé.'],
        orage: ['Pas aujourd’hui. Le gourg a des vagues quand ça tonne. Des vagues qui ne viennent pas du vent.'],
        ami: ['Pour vous, je passe à l’œil. Ne le dites pas à ma grand-mère.', 'Vous ramez presque comme un gars d’ici. Presque.'],
        froid: ['Cherchez un autre passeur. Il n’y en a pas d’autre.'],
        peur: ['Reculez. J’ai une gaffe, et je sais m’en servir.'],
      },
      about: [
        'Je passe les gens d’une rive à l’autre depuis mes douze ans. Mon père le faisait, et son père. Le premier Lacombe passeur a sorti les gens de Saint-Aubin quand l’eau est montée. Cent voyages en trois jours.',
        'Le gourg, c’est le trou au milieu, au-dessus du clocher. On le contourne. Tout le monde le contourne. Même les poissons, on dirait.',
        'Les sègues, on les prend à la nasse, la nuit. On les fume à l’aulne. En ville, ils les achètent en faisant la grimace, et ils en redemandent.',
        'Une fois, en passant le gourg dans le nèble, j’ai senti la nau cogner contre quelque chose. Du bois, pas de la pierre. Un clocher, ça a des abat-sons en bois.',
      ],
      rumeurs: [
        'Les gens de la ville ne savent pas nager. Nous, on apprend avant de marcher. Ça ne sert à rien : ceux qui tombent dans le gourg ne remontent pas, qu’ils sachent nager ou non.',
        'Le pêcheur de l’autre rive est un brave homme. Il pêche le jour. C’est pour ça qu’il pêche si peu.',
        'La vannière est ma cousine. Son mari est parti relever les nasses un soir de nèble. La nau est revenue toute seule.',
        'Si vous trouvez une nau à la dérive, ne montez pas dedans. Ramenez-la au bord en la tirant.',
        'Le phare n’éclaire plus rien depuis longtemps. Pourtant, certaines nuits, il y a de la lumière en haut.',
      ],
      etrange: ['Ce matin, il y avait des traces mouillées sur les planches. Des pieds nus. Elles sortaient de l’aigue, et elles y retournaient.', 'J’ai compté les nau au soir : quatre. Au matin : cinq. La cinquième était pleine d’eau, et d’herbes du fond.'],
      cadeau: { adore: 'Ça alors. Merci. Je vous passerai pour rien, un bout de temps.', aime: 'Merci, c’est gentil.', neutre: 'Merci.', deteste: 'Qu’est-ce que je ferais de ça sur une barque ?' },
      nuit: 'On ne passe pas la nuit. Revenez au jour.',
      meurtre: 'Pas vous, dans ma nau. Jamais.',
      disparu: '{victime}. On posera un calèu pour lui aussi, même s’il n’était pas d’ici.',
      nuitrouge: 'Cette nuit, l’aigue était rouge jusqu’au fond. On voyait le clocher. Il était éclairé de dedans.',
      adieu: ['Bonne route. Restez sur la grève.', 'À une autre fois.'],
      tueur: ['…'], indice: '…',
    },
    quests: [
      { id: 'planches_passeur_1', title: 'Des planches pour le quai', type: 'apporter', need: { bois: 10, clous: 2 }, minAmitie: 1, reward: { argent: 50, amitie: 2 },
        texte: { offre: 'Le quai pourrit par en dessous. Si vous m’apportez dix bûches et deux poignées de clous, je le refais avant l’hiver. Et vous passerez pour rien, tant que je serai passeur.', accepte: 'Dix bûches, des clous. Du chêne si vous pouvez : le sapin boit l’eau.', attente: 'Le bois ? Le quai n’attendra pas l’hiver.', fin: 'Voilà de quoi tenir dix ans. Vous passerez pour rien, maintenant. C’est dit.' } },
    ],
  },
  {
    id: 'planches_vanniere', role: 'Vannière', gender: 'f', names: ['Rosalie', 'Mélanie', 'Toinette'], surname: 'Aubrée', age: 29, area: 'planches',
    home: 'pl_vanniere', work: 'pl_vanniere', traits: ['douce', 'obstinée'], liens: { planches_doyenne: 'grand-tante', planches_passeur: 'cousin' },
    look: { skin: '#e0c0a0', hair: '#6a3a1a', hairStyle: 'queue', hat: null, top: '#8a6a4a', bottom: '#5a4a3a', dress: true, apron: '#c8b890', height: 0.96, build: 'mince', fem: true, bust: 0.9, hips: 1.0 },
    schedule: [[6, 'home'], [7, 'c2:greve'], [12, 'home'], [13.5, 'c2:greve'], [19, 'home']],
    likes: ['fleur', 'miel', 'bobine_fil', 'confiture'], loves: ['perle', 'bijou'], dislikes: ['anguille', 'os'],
    shop: { name: 'Les paniers de jonc', sells: [['panier_jonc', 12], ['bracelet_segue', 26], ['corde', 6]], buys: ['anguille', 'oeuf', 'pain', 'miel'] },
    lines: {
      intro: 'Bonjour. Vous venez de la ville ? Ça se voit à vos souliers. {nom} Aubrée. Je fais les paniers, les nasses, les nattes. Si vous voulez un panier qui ne pourrit pas, c’est moi.',
      greet: {
        matin: ['Le jonc se coupe le matin, quand il est encore mou de la nuit.', 'Bonjour. Attention où vous mettez les pieds, le jonc sèche par terre.'],
        jour: ['Un panier ? Une natte ? Une nasse, si vous pêchez ?', 'Asseyez-vous si vous voulez. Je parle mieux en tressant.'],
        soir: ['Le soir, je tresse près du calèu. Ma mère disait qu’on voit mieux les nœuds à la flamme.'],
        pluie: ['Avec la pluie, le jonc se travaille tout seul. C’est le seul bon côté.'],
        orage: ['Rentrez sous un toit. Le tonnerre aime l’aigue.'],
        ami: ['Je vous tresse une bricole. Un jour je vous la donnerai. Pas aujourd’hui.', 'Vous revenez souvent. Les gens d’ici commencent à dire votre nom.'],
        froid: ['Je n’ai rien à vous vendre.'],
        peur: ['Ne m’approchez pas. Je crie, et tout le village descend de ses planches.'],
      },
      about: [
        'Je suis née ici, sur les planches du fond. On dit que je n’ai touché la terre ferme qu’à trois ans. Ma mère avait peur que je m’en aille.',
        'Mon mari s’appelait Jacques. Il est parti relever les nasses un soir de nèble. La nau est revenue toute seule, bien rangée contre le quai, les rames croisées.',
        'Quand il n’est pas revenu, j’ai jeté mon anneau à la Dauna. On fait ça, ici. On donne, pour qu’elle rende. Elle n’a rien rendu. Maintenant, je voudrais l’anneau.',
        'Le jonc, c’est la seule chose que l’aigue nous laisse prendre sans rien demander. Alors on en fait tout.',
      ],
      rumeurs: [
        'La mère Lacombe a quatre-vingt-quatre ans. Elle dit qu’elle en a trois cents, et qu’elle a connu Saint-Aubin avant l’eau. On ne la contredit pas.',
        'Mon cousin le passeur fait payer ceux de la ville. Moi, je ne ferais payer personne, mais il faut bien acheter le pain.',
        'Les enfants d’ici ne jouent pas au bord du gourg. Pas parce qu’on le leur défend. Parce qu’ils n’en ont pas envie.',
        'Les bergers de la montagne, à l’ouest, descendent parfois au lac pour laver la laine. Ils parlent drôle. Eux trouvent qu’on parle drôle.',
      ],
      etrange: ['Il y avait un panier sur ma table, ce matin, que je n’avais pas tressé. Un point que je ne connais pas. Un point très ancien.', 'J’ai entendu Jacques m’appeler, depuis l’aigue. J’ai fermé les volets. Il n’appelait pas comme lui.'],
      cadeau: { adore: 'Oh… Merci. Vraiment. Je ne sais pas quoi dire.', aime: 'C’est joli. Merci.', neutre: 'Merci, c’est aimable.', deteste: 'Non, merci. Gardez ça.' },
      nuit: 'Il est tard. Revenez demain.',
      meurtre: 'Allez-vous-en. Tout de suite.',
      disparu: '{victime}… Je tresserai une couronne de jonc. On la posera sur l’aigue.',
      nuitrouge: 'Toute la nuit, le jonc a chuchoté. Il n’y avait pas de vent.',
      adieu: ['Au revoir. Faites attention aux planches mouillées.', 'Revenez, j’aurai d’autres paniers.'],
      tueur: ['…'], indice: '…',
    },
    quests: [
      { id: 'planches_vanniere_1', title: 'L’anneau de la Dauna', type: 'apporter', need: { perle: 1 }, minAmitie: 2, reward: { argent: 0, amitie: 3, objets: { bracelet_segue: 1 } },
        texte: { offre: 'On dit que la Dauna rend ce qu’on lui a donné, si on lui donne plus beau. Je lui ai donné mon anneau. Si vous trouvez une perle, une vraie, je la lui porterai à la place. Peut-être qu’elle me le rendra.', accepte: 'Une perle. On en trouve dans les coffres que remontent les lignes, parfois. Ou chez ceux qui ont les moyens.', attente: 'Pas encore de perle ? Moi, j’attends. On sait attendre, ici.', fin: 'Elle est belle. Je la porterai ce soir au gourg. Tenez, ce bracelet : c’est de la peau de sègue. On ne se noie pas, avec ça. Enfin, on se noie moins vite.' } },
    ],
  },
  // ============================================================ l'estive
  {
    id: 'estive_baile', role: 'Baïle de l’estive', gender: 'm', names: ['Baptistin', 'Cyprien', 'Justin'], surname: 'Rouveyrol', age: 67, area: 'estive',
    home: 'es_baile', work: 'es_baile', traits: ['dur', 'juste'], liens: { estive_patre: 'petit-fils', estive_fromagere: 'nièce' },
    look: { skin: '#b88a60', hair: '#d0d0c8', hairStyle: 'court', beard: 'longue', hat: 'chapeau', hatCol: '#3a2a1a', top: '#6a5a48', bottom: '#4a3a28', dress: false, apron: null, coat: true, height: 1.0, build: 'normal' },
    schedule: [[5.5, 'home'], [6, 'c2:jasse'], [11.5, 'home'], [13, 'c2:jasse'], [19.5, 'c2:feu'], [21, 'home']],
    likes: ['sel', 'pain', 'vin', 'cidre'], loves: ['tabac', 'edelweiss'], dislikes: ['fleur', 'plume'],
    shop: { name: 'La jasse du baïle', sells: [['tomme_estive', 70], ['sonnaille', 18], ['laine', 60]], buys: ['sel', 'pain', 'vin', 'cidre', 'tabac'] },
    lines: {
      intro: 'Tu es monté jusqu’ici sans te perdre. Tu as de bonnes jambes, ou de la chance. {nom} Rouveyrol, baïle de cette jasse. Ne passe pas au milieu des fea, fais le tour. Et ne touche pas aux chiens.',
      greet: {
        matin: ['L’aura tourne. Il fera beau jusqu’à midi, pas après.', 'Les fea sont déjà sorties. Toi, tu es en retard.'],
        jour: ['Tu cherches quelque chose, là-haut ? Ou quelqu’un ?', 'Assieds-toi sur la lauza. Elle est chaude, à cette heure.'],
        soir: ['Le soir, on rentre les fea et on compte. Toujours. Même quand on sait.', 'Écoute. En face, ils appellent. Ils sont bien rentrés, eux aussi.'],
        pluie: ['La pluie en bas, c’est la nèu en haut. Demain, on verra blanc sur la crête.'],
        orage: ['Couche-toi si ça tape. Loin des sonnailles. Le tonnerre les aime.'],
        ami: ['Toi, tu pourrais garder une jasse. Il te manque trente ans et une mauvaise jambe.', 'Tu es le premier d’en bas qui monte deux fois. On le dira au feu.'],
        froid: ['Descends. Il n’y a rien pour toi ici.'],
        peur: ['Reste où tu es. Les chiens t’ont déjà senti.'],
      },
      about: [
        'On monte avec les bêtes quand la nèu se retire, on redescend quand elle revient. Ça fait quarante-huit fois pour moi. Je ne compte plus les étés, je compte les fea.',
        'Chaque famille a sa marque. On la taille sur les rochers du chemin, pour dire « on est passés, on est vivants ». Tu en as vu, sûrement. Tu ne sais pas les lire. C’est normal.',
        'Mon frère est resté là-haut, en 1831. Le drac l’a pris, disent les vieux. Moi, je dis la lauza qui a glissé. On ne l’a pas retrouvé. On lui a fait un cairn quand même, avec sa sonnaille dessus.',
        'Les gens d’en bas nous appellent « ceux de l’estive ». Nous, on n’a pas de nom pour nous. On a des noms pour les bêtes.',
      ],
      rumeurs: [
        'Le sau, c’est la vie des bêtes. Sans sau, les fea lèchent les pierres, et les pierres d’ici ne sont pas toutes bonnes à lécher.',
        'Le lop descend quand la nèu tombe tôt. Cette année, elle tombera tôt.',
        'Il y a un plan, derrière la crête, où l’herbe est plus grasse qu’ailleurs. On n’y mène pas les bêtes. Jamais.',
        'Mon petit-fils veut descendre voir la ville. Qu’il y aille. Il remontera.',
        'La fromagère fait la meilleure tomme de la montagne. Ne le lui dis pas, elle en demanderait plus cher.',
      ],
      etrange: ['Cette nuit, les fea se sont toutes tournées vers la crête, en même temps. Pas un bruit. Au matin, il en manquait une, et il y avait un aret de trop.', 'Le drac a soufflé toute la nuit sur la cabana. Il n’y avait pas de vent dans la vallée.', 'Quelqu’un a taillé une marque sur la lauza de la jasse. Une marque qu’aucune famille n’a.'],
      cadeau: { adore: 'Ça… Tu sais ce qui est bon, pour quelqu’un d’en bas. Merci.', aime: 'C’est bien. Merci.', neutre: 'Hm. Merci.', deteste: 'Qu’est-ce que tu veux que j’en fasse, là-haut ?' },
      nuit: 'Il fait nuit. Même les chiens dorment. Descends, ou dors dehors.',
      meurtre: 'Tu as tué. Ne remonte jamais. Les chiens ne te laisseront pas passer.',
      disparu: '{victime}… On mettra une pierre de plus au cairn.',
      nuitrouge: 'La lune était rouge sur la nèu. Les fea ont pleuré toute la nuit. Pleuré, pas bêlé.',
      adieu: ['Descends par le chemin, pas par la pente.', 'Va. Et salue le bas de ma part.'],
      tueur: ['…'], indice: '…',
    },
    quests: [
      { id: 'estive_baile_1', title: 'Le sau des bêtes', type: 'apporter', need: { sel: 8 }, minAmitie: 0, reward: { argent: 40, amitie: 2, objets: { tomme_estive: 1 } },
        texte: { offre: 'Il nous manque du sau pour les pierres. Huit mesures. La ville en vend, pour qui a les jambes de le monter.', accepte: 'Huit. Pas du sel de cuisine : du gros, du gris.', attente: 'Le sau ? Les bêtes lèchent la lauza, en t’attendant.', fin: 'Bien. Les fea te diront merci à leur façon : elles ne te fonceront plus dedans. Tiens, une tomme de l’an passé.' } },
      { id: 'estive_baile_2', title: 'La sonnaille de la Noire', type: 'trouver', objet: 'sonnaille_noire', lieu: 'estive_crete', minAmitie: 2, reward: { argent: 90, amitie: 2, objets: { sonnaille: 1 } },
        texte: { offre: 'La Noire, c’est la meneuse. Elle a perdu sa sonnaille sur la crête, au-dessus de la jasse, le soir où le drac a soufflé. Sans sa sonnaille, les autres ne la suivent plus. Retrouve-la.', accepte: 'Sur la crête. Là où l’aura tourne. En tôle, avec une marque : trois traits.', attente: 'La sonnaille ? La Noire tourne en rond depuis.', fin: 'C’est elle. Écoute : pas une autre ne sonne comme ça. Tiens, une des miennes. Accroche-la où tu veux : on saura que tu es passé.' } },
    ],
  },
  {
    id: 'estive_fromagere', role: 'Fromagère d’estive', gender: 'f', names: ['Mariette', 'Clémence', 'Benoîte'], surname: 'Vachier', age: 44, area: 'estive',
    home: 'es_fromagerie', work: 'es_fromagerie', traits: ['rieuse', 'travailleuse'], liens: { estive_baile: 'oncle', estive_patre: 'neveu' },
    look: { skin: '#d8b090', hair: '#4a3020', hairStyle: 'queue', hat: 'bonnet', hatCol: '#e8e0d0', top: '#5a3a3a', bottom: '#3a2a2a', dress: true, apron: '#e0d8c8', height: 0.97, build: 'rond', fem: true, bust: 1.1, hips: 1.1 },
    schedule: [[5, 'home'], [5.5, 'work'], [12, 'c2:feu'], [13, 'work'], [19.5, 'c2:feu'], [21.5, 'home']],
    likes: ['sel', 'pain', 'confiture', 'tisane'], loves: ['miel', 'brioche'], dislikes: ['poisson_fume', 'anguille'],
    shop: { name: 'La cabane à fromages', sells: [['tomme_estive', 68], ['beurre', 60], ['lait', 44]], buys: ['sel', 'miel', 'pain'] },
    lines: {
      intro: 'Oh, un visage neuf ! On n’en voit pas souvent, ici. {nom} Vachier. Je fais la tomme. Si vous avez faim, j’ai du petit-lait et du pain d’avant-hier. Si vous avez de l’argent, j’ai de la tomme.',
      greet: {
        matin: ['La traite est finie, le lait chauffe. Vous tombez bien, ou mal : je n’ai pas le temps de parler.', 'Il a gelé, cette nuit. En plein été, là-haut, ça arrive.'],
        jour: ['Goûtez. Non, pas celle-là, elle n’est pas faite.', 'Il faut tourner les tommes tous les jours. Tous. Les tommes, c’est comme les enfants.'],
        soir: ['Le soir, je chante aux tommes. Ne riez pas : elles sont meilleures.', 'Il va faire froid. Ici, il fait toujours froid la nuit, même quand le jour a brûlé.'],
        pluie: ['Avec la pluie, le lait tourne. Tout tourne, avec la pluie.'],
        orage: ['Rentrez sous la lauza ! Là, dans la cabana. Allez !'],
        ami: ['Je vous ai mis une tomme de côté. La meilleure. Enfin, la deuxième meilleure.', 'Vous êtes un peu d’ici, maintenant. Il vous manque l’odeur.'],
        froid: ['Je n’ai pas de tomme pour vous.'],
        peur: ['Allez-vous-en ! {npc:estive_baile} ! {npc:estive_baile} !'],
      },
      about: [
        'Je monte depuis mes quinze ans. Avant moi, c’était ma tante. Avant elle, sa tante. La cabane à fromages passe de tante en nièce, comme un nom.',
        'La tomme, il lui faut du sel, du temps, et une cave qui ne gèle pas. La nôtre est sous la lauza. Elle n’a jamais gelé, même l’hiver où les bêtes sont mortes debout.',
        'J’ai un mari en bas, de l’autre côté de la montagne. On se voit à la descente, et à la montée. Deux fois par an. C’est un bon mariage.',
        'Il y a une femme blanche sur la nèu, certaines nuits, au-dessus de la jasse. Elle ne fait rien. Elle regarde les bêtes. Les chiens ne l’aboient pas. C’est ça qui me fait peur.',
      ],
      rumeurs: [
        'Le baïle est dur, mais il n’a jamais perdu une fea par sa faute. Pas une, en quarante-huit étés.',
        '{npc:estive_patre} veut voir la ville. Il a raison. On ne peut pas savoir qu’on aime la montagne si on n’a jamais vu autre chose.',
        'Si vous montez le soir, restez près du feu. Ce qui marche la nuit, là-haut, n’aime pas le feu.',
        'Le miel de la vallée, c’est ce qui manque le plus ici. Le sucre, on n’en voit jamais.',
        'Ceux du lac, en bas, fument les anguilles. Nous, on fume la tomme. Chacun son malheur.',
      ],
      etrange: ['Une tomme a saigné, ce matin. Du rouge, dans la croûte. Je l’ai jetée au ravin sans la regarder.', 'Il y avait des mains sur la lauza de la cave, dans la poussière. Des mains d’enfant. Il n’y a pas d’enfant, ici.'],
      cadeau: { adore: 'Oh ! Merci ! Vous êtes un ange descendu… non, monté.', aime: 'Merci ! Ça fera plaisir.', neutre: 'Merci, c’est gentil.', deteste: 'Beurk. Non. Merci quand même.' },
      nuit: 'Il fait nuit. Les tommes dorment, et moi aussi.',
      meurtre: 'N’approchez pas ! Au secours !',
      disparu: '{victime}… Pauvre âme. On lui gardera une part, au feu du Veilledi.',
      nuitrouge: 'Le lait a caillé en rouge, cette nuit. Tout le chaudron.',
      adieu: ['Revenez avec du miel !', 'Descendez avant la nuit. Promettez-le.'],
      tueur: ['…'], indice: '…',
    },
    quests: [
      { id: 'estive_fromagere_1', title: 'Du miel pour la montagne', type: 'apporter', need: { miel: 3 }, minAmitie: 0, reward: { argent: 0, amitie: 2, objets: { tomme_estive: 2 } },
        texte: { offre: 'Si vous remontez un jour, apportez-moi trois pots de miel. En échange, deux tommes, les plus vieilles. Les meilleures.', accepte: 'Trois pots ! Du miel de fleurs, pas de sapin, s’il vous plaît.', attente: 'Le miel ? J’en rêve la nuit.', fin: 'Oh, qu’il sent bon. Tenez, deux tommes. Mangez-les avec du pain noir, pas avec votre pain blanc de la ville.' } },
    ],
  },
  {
    id: 'estive_patre', role: 'Pâtre', gender: 'm', names: ['Antonin', 'Félicien', 'Urbain'], surname: 'Rouveyrol', age: 17, area: 'estive',
    home: 'es_patre', work: 'es_patre', traits: ['curieux', 'rêveur'], liens: { estive_baile: 'grand-père', estive_fromagere: 'tante' },
    look: { skin: '#c89870', hair: '#6a4a2a', hairStyle: 'court', hat: 'capuche', hatCol: '#7a6a4a', top: '#8a7a5a', bottom: '#5a4a30', dress: false, apron: null, height: 0.96, build: 'mince' },
    schedule: [[5, 'home'], [5.5, 'c2:jasse'], [7, 'c2:pre'], [12, 'c2:feu'], [13, 'c2:pre'], [18.5, 'c2:jasse'], [19.5, 'c2:feu'], [21, 'home']],
    likes: ['pain', 'confiture', 'bille', 'image_pieuse'], loves: ['figurine', 'couteau_poche'], dislikes: ['os', 'viande'],
    shop: null,
    lines: {
      intro: 'Oh ! Quelqu’un ! D’en bas ? Vraiment d’en bas ? {nom}, pâtre. Le baïle, c’est mon grand-père. Vous avez vu la ville ? Elle est grande comment ? Plus grande que la jasse ?',
      greet: {
        matin: ['Les fea sont sorties avant moi, ce matin. Elles n’ont honte de rien, ces bêtes.', 'Vous avez dormi en bas ? Il fait chaud, en bas ?'],
        jour: ['Regardez, là-bas, sur la crête : un aigle. Ou un drac. Ça dépend qui regarde.', 'Vous voulez voir le rocher aux marques ? Je sais les lire, moi. Enfin, un peu.'],
        soir: ['Tout à l’heure, j’appellerai. Écoutez bien : en face, ils répondront.', 'Le soir, l’aura descend. Elle sent la nèu, même en été.'],
        pluie: ['Sous la pluie, les fea se serrent. Moi je reste sous la lauza. On est pareils.'],
        orage: ['Il faut se coucher par terre ! Loin des bêtes ! C’est le baïle qui le dit.'],
        ami: ['Un jour je descendrai, et c’est vous qui me ferez visiter. Promis ?', 'Je vous ai gardé une plume d’aigle. Elle est à vous, si vous la voulez.'],
        froid: ['Le baïle dit de ne plus vous parler.'],
        peur: ['Grand-père ! Grand-père !'],
      },
      about: [
        'Je suis né à la jasse, un soir d’orage. Ma mère dit que le tonnerre est entré par le toit pour voir. Il est reparti. Moi, je suis resté.',
        'Je garde les fea depuis mes sept ans. Je connais chaque bête par son nom. Il y en a deux cent six. Il y en avait deux cent sept hier.',
        'Je voudrais voir la ville. Les maisons collées, les ponts qui se lèvent, les gens qui ne se connaissent pas. Ici, tout le monde se connaît, même les rochers.',
        'Une fois, au-dessus du plan où l’on ne mène pas les bêtes, j’ai vu des lumières dans la roche. Pas des feux. Des lumières, comme derrière une vitre. Je ne l’ai dit à personne. Sauf à vous.',
      ],
      rumeurs: [
        'Le rocher aux marques, près du chemin : chaque trait, c’est une famille. Le nôtre, c’est la croix à potence. Les autres, je vous les dirai si vous revenez.',
        'Il y a une fente dans la roche, plus haut, où les contrebandiers cachaient le tabac. Ils cachent peut-être encore.',
        'Les pierres à sau, faut pas les déplacer. Sinon les bêtes ne les retrouvent plus, et elles vont lécher ailleurs. Ailleurs, c’est pas bon.',
        'Le cairn avec une sonnaille dessus, c’est le frère du baïle. On ne touche pas la sonnaille. Des fois, elle sonne toute seule.',
        'Ma tante chante aux tommes. Et elles sont bonnes. Alors je chante aux fea. Elles s’en fichent.',
      ],
      etrange: ['Cette nuit, quelqu’un a appelé depuis la crête, comme nous, le soir. Mais personne n’habite de ce côté-là.', 'Une fea est revenue avec de la neige dans la laine. Il n’a pas neigé depuis un mois.'],
      cadeau: { adore: 'Pour moi ? Vraiment ? Je le garderai toute ma vie !', aime: 'Oh, merci !', neutre: 'Merci !', deteste: 'Hein ? Qu’est-ce que c’est ? Je n’en veux pas.' },
      nuit: 'Chut ! Les fea dorment. Et grand-père aussi.',
      meurtre: 'Vous… vous avez tué quelqu’un ? Allez-vous-en !',
      disparu: '{victime}… Je ne le connaissais pas. J’appellerai quand même, ce soir, pour lui.',
      nuitrouge: 'La lune était rouge ! Les fea ne voulaient pas sortir. J’ai eu peur, un peu. Beaucoup.',
      adieu: ['Revenez ! Avec des histoires d’en bas !', 'À bientôt ! Attention à la pente, par là.'],
      tueur: ['…'], indice: '…',
    },
    quests: [
      { id: 'estive_patre_1', title: 'Ce qu’il y a en bas', type: 'apporter', need: { image_pieuse: 1, confiture: 1 }, minAmitie: 1, reward: { argent: 0, amitie: 3, objets: { plume_aigle: 2 } },
        texte: { offre: 'Rapportez-moi quelque chose d’en bas ! Une image, avec des couleurs. Et de la confiture ! Je n’en ai mangé qu’une fois.', accepte: 'Une image pieuse, ça ira, et un pot de confiture. Je garderai l’image dans la cabana, au-dessus de ma paillasse.', attente: 'Alors ? Vous l’avez ? L’image ? La confiture ?', fin: 'Oh… Elle est belle. Et la confiture… Tenez, deux plumes d’aigle. Je les ai ramassées sous le rocher de l’Aigle. Ne le dites pas au baïle : il dit que ça porte malheur de les garder.' } },
    ],
  },
];
for (const d of C2_HABITANTS) {
  if (NPC_DATA.some((q) => q.id === d.id)) continue;
  if (d.look && d.look.fem === undefined) d.look.fem = d.gender === 'f';
  NPC_DATA.push(d);
  NPC_BY_ID[d.id] = d;
}
Object.assign(NPC_HELD, { planches_passeur: 'canne', planches_vanniere: 'panier', estive_baile: 'baton', estive_patre: 'baton' });

// ---------------------------------------------------------------- leur vie (11-zzlife.js : histoire, questions, humeurs, foi)
Object.assign(NPC_LIFE, {
  planches_doyenne: {
    foi: 'anciens', devotion: 3, fete: 19, mythes: ['dame_du_lac', 'cloche_noyee'],
    mythe_intro: ['Assieds-toi. Ça se raconte assis.', 'Écoute bien. Je ne le raconte qu’une fois par hiver.'],
    histoire: [
      { titre: 'La campane', min: 0, texte: 'Mon grand-père, Aimé, sonnait la campane de Saint-Aubin. Le dernier soir, il a sonné pour saint Aubin, tout seul, dans le clocher. Le matin, l’eau était aux fenêtres. Lui, on ne l’a pas revu. La campane non plus.' },
      { titre: 'Les pieux', min: 1, texte: 'Mon père a planté le premier pieu à six ans, avec son père à lui. Il disait que le bois criait en entrant dans la vase, et qu’il fallait lui parler pour qu’il tienne. On parle encore aux pieux, quand on en plante un.' },
      { titre: 'La noce sur l’eau', min: 2, texte: 'Je me suis mariée dans une nau, au milieu du lac, au-dessus de la place d’en bas. Pas de curé : la ville n’en envoie pas. La Dauna a été témoin. Mon mari est mort vieux, dans son lit. C’est rare, ici. On a dit qu’elle l’aimait bien.' },
      { titre: 'Ce qu’on donne', min: 4, texte: 'Ici, quand on perd quelque chose, on donne quelque chose à l’aigue. Un anneau, une pièce, un bol de lait. Pas pour que ça revienne. Pour que ça ne soit pas perdu tout seul.' },
      { titre: 'Le dernier calèu', min: 6, texte: 'Le Vorndi, je pose un calèu de plus que les autres. Personne ne me demande pour qui. Il y avait une maison d’en bas qui n’avait plus personne pour elle. Maintenant elle a moi. Après moi, elle t’aura peut-être.' },
    ],
    questions: [
      { id: 'pl_doy_q1', min: 1, texte: 'Dis-moi. Si ta maison était sous l’eau, tu partirais, ou tu planterais des pieux ?',
        reponses: [
          { label: 'Je planterais des pieux.', amitie: 25, reaction: 'Oui. Tu as ça dans les yeux. Il faudra t’apprendre à parler au bois.' },
          { label: 'Je partirais. Une maison, ça se rebâtit.', amitie: -5, reaction: 'Une maison, oui. Pas ce qu’il y a dedans. Mais tu es jeune.' },
          { label: 'Je ne sais pas. Je n’ai jamais eu de maison à moi.', amitie: 10, reaction: 'Alors cherche. Et quand tu l’auras trouvée, ne la laisse pas à l’eau.' },
        ],
        rappel: ['Tu as des pieux dans les yeux. Je le vois chaque fois.', 'Tu partirais… Tu es toujours là, pourtant.', 'Tu as trouvé ta maison ? Pas encore. Ça viendra.'] },
    ],
    humeurs: { joyeux: ['L’aigue est belle aujourd’hui. On voit loin dedans.', 'La Dauna est contente. Les sègues sont venues d’elles-mêmes.'], triste: ['Le gourg a pris quelque chose, cette nuit. Je ne sais pas quoi.', 'Mes jambes ne veulent plus des planches.'], fatigue: ['J’ai veillé le calèu toute la nuit.', 'Laisse-moi un peu tranquille, petit.'], inquiet: ['Le nèble ne se lève pas. Ce n’est pas bon.', 'Les poissons sautent. Ils fuient quelque chose.'], agace: ['Tu marches trop fort sur mes planches.', 'On ne pose pas de question à une vieille avant midi.'] },
    souvenirs: { cadeau_adore: ['Ton cadeau est sur ma table, près du calèu. Je le regarde le soir.'], aide: ['Les calèus que tu m’as fait avoir ont bien brûlé. Elle les a pris.'], absence: ['Tu ne venais plus. J’ai cru que l’aigue t’avait eu.'], victime: ['On a posé un calèu pour {victime}, cette nuit.'] },
    foi_lignes: ['La Dauna ne demande rien. On lui donne quand même. C’est ça, la foi.', 'Le curé de la ville dit qu’elle n’existe pas. Il n’a jamais passé le gourg dans le nèble.', 'Aëla, Durn, Vesh… Les montagnards parlent des Trois. Nous, on n’en connaît qu’une, et elle est sous nos pieds.'],
    reaction_piete: { anciens: 'Tu portes la Vieille Foi sur toi. Ça se sent. La Dauna aussi le sent.', eglise: 'Tu sens l’encens. Lave-toi avant de marcher sur mes planches.', dessous: 'Tu as parlé à ceux d’en dessous. Ne m’approche pas de trop près.' },
    fete_lignes: ['Aujourd’hui, c’est mon jour. J’ai quatre-vingt-quatre ans et je ne les ai jamais fêtés à terre.'],
    secret: 'Mon grand-père n’est pas mort dans le clocher. Il est descendu le chercher, la campane, quand l’eau était déjà haute. Il a dit qu’il la sonnerait d’en bas, pour qu’on sache où elle est. Les nuits d’orage, écoute bien au-dessus du gourg. C’est lui.',
  },
  planches_passeur: {
    foi: 'anciens', devotion: 1, fete: 7, mythes: ['feux_follets'],
    mythe_intro: ['Je ne suis pas conteur. Mais celle-là, tout le monde la sait, sur l’eau.'],
    histoire: [
      { titre: 'La première traversée', min: 0, texte: 'À douze ans, mon père m’a donné la rame et il s’est assis à l’avant. Il n’a rien dit de toute la traversée. Arrivés, il a dit : « Tu as contourné le gourg sans que je te le dise. Tu es passeur. »' },
      { titre: 'Le tarif', min: 1, texte: 'Trois pièces pour ceux de la ville. Rien pour ceux d’ici. Une chanson pour les enfants. Et pour les morts, rien du tout : ceux-là, on ne les passe pas, ils passent seuls.' },
      { titre: 'L’homme au manteau', min: 3, texte: 'Un soir de nèble, un homme en long manteau m’a demandé de le passer. J’ai dit non, qu’il était tard. Il a souri, et il a marché sur l’aigue jusqu’à l’autre rive. Je ne le raconte pas en ville.' },
      { titre: 'La nau de mon père', min: 5, texte: 'La nau de mon père est au fond, près du clocher. Il l’a coulée lui-même, le jour de sa mort, avec lui dedans. C’était sa volonté. J’ai ramé pour le mener jusque-là.' },
    ],
    questions: [
      { id: 'pl_pas_q1', min: 1, texte: 'Vous savez nager ?',
        reponses: [
          { label: 'Comme un poisson.', amitie: 10, reaction: 'Tant mieux. Ça ne sert à rien au-dessus du gourg, mais tant mieux.' },
          { label: 'Pas du tout.', amitie: 15, reaction: 'Alors restez dans la nau, et ne vous penchez pas. Les gens qui ne savent pas nager sont les meilleurs passagers.' },
          { label: 'Pourquoi, on va tomber ?', amitie: 5, reaction: 'Jamais tombé personne, dans ma nau. Enfin, jamais personne de vivant.' },
        ],
        rappel: ['Le poisson ! Toujours d’attaque pour l’eau ?', 'Toujours pas appris à nager ? Tant mieux. Restez comme vous êtes.', 'On n’est pas tombés. Vous voyez.'] },
    ],
    humeurs: { joyeux: ['L’aigue est plate comme une assiette. Une journée de passeur.', 'Trois sègues dans la nasse. La grand-mère sera contente.'], triste: ['Mon père aurait eu soixante-dix ans aujourd’hui.', 'Personne à passer. Même les gens de la ville ne viennent plus.'], fatigue: ['J’ai ramé tout le jour. Mes épaules me parlent.', 'Les nasses, la nuit… je dors quand je peux.'], inquiet: ['Le gourg a des bulles, ce matin.', 'Le phare s’est allumé, cette nuit. Personne n’y monte.'], agace: ['Ne touchez pas aux rames.', 'Trois pièces. Pas deux.'] },
    souvenirs: { cadeau_adore: ['Votre cadeau est rangé dans la nau, sous le banc. Il a fait trois traversées avec moi.'], aide: ['Le quai tient. Vous l’avez fait tenir.'], absence: ['Vous n’avez pas passé l’aigue depuis longtemps. Vous avez trouvé un autre passeur ? Il n’y en a pas.'], victime: ['{victime}… On l’a passé, une fois. Il ne disait rien.'] },
    foi_lignes: ['La Dauna, je la salue en passant le gourg. Pas plus. Elle n’aime pas qu’on insiste.', 'Je ne vais pas à la messe. Le curé ne vient pas aux Planches, alors je ne vais pas chez lui.'],
    reaction_piete: { anciens: 'Vous avez salué la Dame, vous. Ça se voit à la façon dont vous regardez l’eau.' },
    fete_lignes: ['C’est mon jour ! Je passe tout le monde pour rien, aujourd’hui. Enfin, sauf ceux de la ville.'],
  },
  planches_vanniere: {
    foi: 'anciens', devotion: 2, fete: 23, mythes: ['dame_du_lac'],
    mythe_intro: ['Ma grand-tante la raconte mieux. Mais elle ne la raconte plus.'],
    histoire: [
      { titre: 'Le premier panier', min: 0, texte: 'Mon premier panier, je l’ai tressé à six ans. Il était tordu. Ma mère l’a gardé jusqu’à sa mort. Il est encore au-dessus de mon lit.' },
      { titre: 'Jacques', min: 1, texte: 'Jacques venait de la ville. Il était venu acheter des anguilles, un été, et il est resté. Il ne savait pas nager. Il a appris pour moi. Ça n’a servi à rien.' },
      { titre: 'L’anneau', min: 3, texte: 'Le soir où la nau est revenue seule, je suis allée au gourg et j’ai jeté mon anneau. On dit qu’il faut donner ce qu’on a de plus beau. Je n’avais que ça. Le lendemain, il y avait une anguille morte sur ma porte. Je ne sais pas ce que ça voulait dire.' },
      { titre: 'Ce que je tresse la nuit', min: 5, texte: 'La nuit, je tresse une nasse que personne ne verra. Une nasse assez grande pour un homme. Je la déferai quand je serai guérie. Je ne suis pas guérie.' },
    ],
    humeurs: { joyeux: ['Le jonc est beau cette année, souple comme des cheveux.', 'J’ai vendu trois paniers en ville. Trois !'], triste: ['C’est le jour où Jacques est parti. Chaque mois, le même jour.', 'Le jonc ne tient pas, aujourd’hui. Mes mains non plus.'], fatigue: ['J’ai tressé jusqu’au matin.', 'Mes doigts saignent. Le jonc est coupant, l’automne.'], inquiet: ['Il y a quelqu’un qui marche sur la grève, la nuit. Pas quelqu’un d’ici.', 'Le lac a baissé d’un pied. Ce n’est jamais bon.'], agace: ['Ne marchez pas sur le jonc qui sèche !', 'Je n’ai pas le temps, aujourd’hui.'] },
    souvenirs: { cadeau_adore: ['Votre cadeau est au mur, à côté du panier tordu.'], aide: ['La perle… Je l’ai portée au gourg. J’attends.'], absence: ['Vous revoilà. J’ai cru que vous étiez parti comme Jacques.'], victime: ['{victime}. J’ai tressé la couronne. Elle flotte encore, près du quai.'] },
    foi_lignes: ['Je donne à la Dauna. Elle ne rend pas. Je donne quand même. Qu’est-ce que je ferais d’autre ?'],
    fete_lignes: ['Aujourd’hui, c’est mon jour. Ma grand-tante m’a donné un calèu. Elle ne donne jamais rien.'],
  },
  estive_baile: {
    foi: 'anciens', devotion: 1, fete: 3, mythes: ['bete_des_combes', 'treize_pierres'],
    mythe_intro: ['Assieds-toi près du feu. Plus près. Voilà.', 'Ça, on le raconte aux enfants pour qu’ils restent près de la jasse. Toi, ça te fera du bien aussi.'],
    histoire: [
      { titre: 'Quarante-huit étés', min: 0, texte: 'La première fois que je suis monté, j’avais huit ans. J’ai porté un agneau sur mes épaules tout le chemin, parce que sa mère ne voulait plus de lui. Il est mort en haut. J’ai pleuré. Mon père a dit : « C’est bien, tu le porteras moins lourd, maintenant. »' },
      { titre: 'Le frère', min: 2, texte: 'Mon frère s’appelait Hippolyte. Il chantait mieux que tout le monde. Le soir de 1831 où il n’est pas rentré, on l’a entendu appeler depuis la crête, toute la nuit. Au matin, plus rien. On a cherché trois jours. On a trouvé sa sonnaille, rien d’autre.' },
      { titre: 'Les marques', min: 4, texte: 'Notre marque, c’est la croix à potence. Mon grand-père la taillait déjà. Un jour, sur le rocher de la jasse, j’ai trouvé notre marque taillée de frais, à côté d’une date. La date de ma mort, peut-être. Je ne te dirai pas laquelle.' },
      { titre: 'Ce qu’on laisse au drac', min: 6, texte: 'Chaque été, la dernière nuit avant la descente, on laisse une tomme sur la lauza de la crête. Pour le drac. Le matin, elle n’y est plus. Les jeunes disent que c’est le renard. Les renards ne défont pas les nœuds de la ficelle.' },
    ],
    questions: [
      { id: 'es_bai_q1', min: 1, texte: 'Toi, d’en bas : combien de bêtes tu as ?',
        reponses: [
          { label: 'Quelques-unes, à la ferme.', amitie: 10, reaction: 'Quelques-unes. Tu dis ça comme si ce n’était rien. Une bête, c’est quelqu’un.' },
          { label: 'Aucune pour l’instant.', amitie: 5, reaction: 'Alors tu ne sais pas encore ce que c’est, de compter le soir. Tu apprendras.' },
          { label: 'Je ne les compte pas.', amitie: -15, reaction: 'Tu ne les comptes pas. Alors un jour, il y en aura une de trop, et tu ne le sauras pas.' },
        ],
        rappel: ['Tu les comptes, tes bêtes, maintenant ? Le soir ?', 'Toujours pas de bêtes ? Monte en garder une ici, si tu veux.', 'Tu les comptes, maintenant ? Il vaudrait mieux.'] },
    ],
    humeurs: { joyeux: ['Pas un lop cette nuit. Pas un. Ça n’arrive jamais.', 'L’herbe est bonne, les fea sont grasses. La montagne est contente de nous.'], triste: ['C’est le jour d’Hippolyte. Laisse-moi.', 'Une fea est tombée au ravin. Une bonne.'], fatigue: ['J’ai veillé le lop toute la nuit.', 'Mes jambes sont restées en bas, ce matin.'], inquiet: ['L’aura sent le fer. Il va se passer quelque chose.', 'Les chiens ne mangent pas.'], agace: ['Tu fais peur aux bêtes. Mets-toi là, et ne bouge plus.', 'Pas maintenant.'] },
    souvenirs: { cadeau_adore: ['Ton cadeau, je l’ai montré au feu. Ils n’ont rien dit. C’est bon signe.'], aide: ['Les bêtes ont eu leur sau. Elles te reconnaissent.'], absence: ['Tu es resté en bas longtemps. La montagne t’a oublié. Elle se souviendra.'], victime: ['On a mis une pierre au cairn, pour {victime}.'] },
    foi_lignes: ['On ne prie pas, ici. On compte les bêtes, on salue la montagne, et on laisse une tomme au drac. Ça suffit.', 'Les Treize, sur la crête… Mon père les a vus une fois. Il n’en a jamais reparlé.'],
    reaction_piete: { anciens: 'Tu salues les pierres, toi. Bien.', dessous: 'Tu sens la cave. Ne t’approche pas des bêtes.' },
    fete_lignes: ['Aujourd’hui, on m’a fait une tomme à mon nom. Je la mangerai seul, comme un roi.'],
    secret: 'Le plan où on ne mène pas les bêtes : il y a une porte dans la roche, au-dessus. Une vraie porte, avec des gonds. Mon père l’a vue ouverte, une nuit. Il y avait de la lumière dedans, et quelqu’un qui chantait comme Hippolyte.',
  },
  estive_fromagere: {
    foi: 'eglise', devotion: 1, fete: 15, mythes: ['chasse_volante'],
    mythe_intro: ['Celle-là, ma tante me la racontait en tournant les tommes. Je vous la raconte pareil.'],
    histoire: [
      { titre: 'La cave', min: 0, texte: 'La cave à tommes est creusée sous une grande lauza. Il paraît qu’avant, c’était une tombe. Les tommes y sont bien. Moi aussi, quand il fait chaud.' },
      { titre: 'Ma tante', min: 1, texte: 'Ma tante est morte là-haut, en tournant les tommes. On l’a trouvée assise, une tomme sur les genoux. On a gardé la tomme. Elle était très bonne.' },
      { titre: 'Le mari d’en bas', min: 3, texte: 'Mon mari m’attend de l’autre côté. Il m’écrit une lettre par été, que le colporteur monte jusqu’au col. Il écrit mal. Je relis tout l’hiver.' },
      { titre: 'La femme blanche', min: 5, texte: 'La femme blanche, je l’ai vue de près, une fois. Elle avait mon visage, en plus vieux. Elle tenait une tomme sur ses genoux.' },
    ],
    humeurs: { joyeux: ['Le lait est gras ! Ça va faire de belles tommes.', 'J’ai chanté toute la matinée, et personne ne s’est plaint.'], triste: ['Pas de lettre, cet été. Pas encore.', 'Une tomme a gonflé. Il faut la jeter. Ça me fend le cœur.'], fatigue: ['Traite à l’aube, lait jusqu’à midi, tommes jusqu’au soir…', 'Je dormirais debout, comme les bêtes.'], inquiet: ['Les chiens ont grogné vers la cave. Il n’y avait rien.', 'Le lait ne prend pas. Ça, c’est un signe.'], agace: ['Pas les doigts dans le chaudron !', 'Vous marchez sur mes linges !'] },
    souvenirs: { cadeau_adore: ['Votre miel ! Il en reste un fond. Je le garde pour les jours tristes.'], aide: ['Grâce à vous, les tommes de cet été auront du goût.'], absence: ['Vous revoilà ! J’avais gardé votre tomme. Elle a vieilli. Elle est meilleure.'], victime: ['{victime}… On a gardé sa part, au feu.'] },
    foi_lignes: ['Je dis mes prières, oui. En patois, le Bon Dieu comprend mieux.'],
    fete_lignes: ['C’est ma fête ! Goûtez, goûtez tout, c’est gratuit aujourd’hui. Enfin, presque.'],
  },
  estive_patre: {
    foi: 'aucune', devotion: 0, fete: 11, mythes: ['bete_des_combes'],
    mythe_intro: ['Grand-père me l’a racontée cent fois. Je vous la dis comme lui.'],
    histoire: [
      { titre: 'Né sous la lauza', min: 0, texte: 'Je suis né dans la cabane, pendant l’orage. La foudre est tombée sur la jasse. Aucune bête n’est morte. Ma mère dit que c’est pour ça que je n’ai peur de rien. Elle se trompe.' },
      { titre: 'Deux cent six', min: 1, texte: 'Chaque soir, je compte les fea. Deux cent six. Une fois, j’en ai compté deux cent sept. J’ai recompté trois fois. Deux cent sept. Le matin, deux cent six. Je n’ai rien dit à grand-père.' },
      { titre: 'L’appel', min: 2, texte: 'L’appel du soir, c’est pour dire « on est là, on est vivants ». On appelle, et ceux d’en face répondent. Une fois, personne n’a répondu d’en face. Et quelqu’un a répondu de derrière nous.' },
      { titre: 'En bas', min: 4, texte: 'Je veux voir la ville. Pas pour y rester. Juste pour savoir. Grand-père dit que ceux qui descendent ne remontent pas pareils. Je voudrais savoir comment on remonte.' },
    ],
    questions: [
      { id: 'es_pat_q1', min: 0, texte: 'C’est vrai qu’en bas, les ponts se lèvent la nuit, pour que personne n’entre ?',
        reponses: [
          { label: 'C’est vrai. À neuf heures.', amitie: 15, reaction: 'Alors en bas aussi, il y a des choses qui marchent la nuit. Je croyais que c’était qu’ici.' },
          { label: 'Pour que personne ne sorte, plutôt.', amitie: 20, reaction: 'Pour que personne ne sorte… Je n’y avais pas pensé. Je le dirai au feu.' },
          { label: 'Qui t’a raconté ça ?', amitie: 5, reaction: 'Le colporteur, quand il monte au col. Il raconte beaucoup de choses. Il ment peut-être.' },
        ],
        rappel: ['Les ponts, à neuf heures… J’y pense le soir, en appelant.', 'Pour que personne ne sorte… Grand-père n’a rien dit quand je l’ai répété. Il a regardé la vallée longtemps.', 'Le colporteur est monté, hier. Il a dit que vous existiez. Je le savais.'] },
    ],
    humeurs: { joyeux: ['J’ai vu un aigle attraper un lièvre ! Là, juste là !', 'Grand-père a ri ce matin. Il ne rit jamais.'], triste: ['Une agnelle est morte cette nuit. La plus petite.', 'Personne n’a répondu à l’appel, hier soir.'], fatigue: ['J’ai couru après une fea toute la matinée. Elle a gagné.', 'Les bêtes ne dorment jamais, alors moi non plus.'], inquiet: ['Il y a des traces dans la nèu, là-haut. Pas des traces de bête.', 'Les chiens restent collés à moi, aujourd’hui.'], agace: ['Vous faites peur aux bêtes !', 'Pas maintenant, je compte !'] },
    souvenirs: { cadeau_adore: ['J’ai mis votre cadeau au-dessus de ma paillasse. Je le regarde en m’endormant.'], aide: ['L’image est au-dessus de ma paillasse. La sainte me regarde dormir.'], absence: ['Vous étiez où ? J’ai appelé, le soir, pour vous aussi.'], victime: ['J’ai appelé pour {victime}, hier soir. Personne n’a répondu. C’est normal.'] },
    fete_lignes: ['C’est mon jour ! Grand-père m’a donné une sonnaille à moi. À moi !'],
  },
});

// ============================================================================
//  LES DEUX VILLAGES : la génération (appelée par carte2Gen, avant les lieux
//  perdus ; le réseau des chemins est refait à la fin de carte2Gen)
// ============================================================================
Object.assign(LIEU_NAMES, {
  pl_doyenne: 'la maison de la doyenne', pl_passeur: 'la maison du passeur', pl_vanniere: 'la maison de la vannière', pl_fumoir: 'le fumoir des Planches',
  es_baile: 'la cabane du baïle', es_fromagerie: 'la cabane à fromages', es_patre: 'la cabane du pâtre',
  planches: 'les Planches', planches_greve: 'la grève des Planches', planches_quai: 'le quai des Planches', planches_dame: 'la Dame des Planches',
  estive: 'l’estive du Plan', estive_jasse: 'la jasse', estive_feu: 'le feu de l’estive', estive_pre: 'le pré de l’estive', estive_crete: 'la crête de l’estive', estive_cairn: 'le cairn à la sonnaille', estive_plan: 'le plan d’en haut',
});

// retoucher le relief : fn(x, z, h) rend la nouvelle hauteur du sommet (ou undefined)
function c2Sculpt(w, x0, z0, x1, z1, fn) {
  const c = w.cell, H = w.heights, N = w.N;
  for (let j = Math.max(0, Math.floor(z0 / c)); j <= Math.min(N, Math.ceil(z1 / c)); j++)
    for (let i = Math.max(0, Math.floor(x0 / c)); i <= Math.min(N, Math.ceil(x1 / c)); i++) {
      const k = j * w.W + i, v = fn(i * c, j * c, H[k]);
      if (v !== undefined && v === v) H[k] = v;
    }
}

function c2Villages(G) {
  const w = G.w;
  if (!w || !w.designed || !w.nav) return;
  if (!w.noBuild) w.noBuild = [];
  const n0 = [w.blocks.length, w.props.length, w.inter.length, w.objects.length];
  w.peuples = {};
  try { w.peuples.planches = c2Planches(G); } catch (e) { console.error('carte2 planches', e); }
  try { w.peuples.estive = c2Estive(G); } catch (e) { console.error('carte2 estive', e); }
  w.peuples.n = { blocs: w.blocks.length - n0[0], props: w.props.length - n0[1], inter: w.inter.length - n0[2], objets: w.objects.length - n0[3] };
}

// le réseau des chemins refait (les nouveaux nœuds reliés), les villages habités même s'ils sont à l'écart
function c2PeuplesNav(w) {
  if (!w || !w.nav) return;
  for (const q of w.nav.nodes) delete q.iso;
  finalizeNav(w);
  c2DesIles(w);
}
function c2DesIles(w) {
  const N = w && w.nav;
  if (!N || !N.adj) return;
  const seen = new Set();
  for (let i = 0; i < N.nodes.length; i++) {
    if (seen.has(i) || !/^village:(planches|estive)$/.test(N.nodes[i].tag)) continue;
    const Q = [i]; seen.add(i);
    while (Q.length) { const c = Q.shift(); N.nodes[c].iso = false; for (const e of N.adj[c] || []) if (!seen.has(e.to)) { seen.add(e.to); Q.push(e.to); } }
  }
}
// un sentier : terre battue, arbres ôtés, nœuds tous les 35 m au plus, reliés à la main ; rend les indices des nœuds
function c2Sentier(G, P, tag, largeur) {
  const w = G.w, B = G.B, out = [];
  for (let k = 0; k < P.length; k++) {
    const [x, z] = P[k];
    if (k) {
      const [x0, z0] = P[k - 1], L = Math.hypot(x - x0, z - z0);
      B.paintLine(x0, z0, x, z, largeur || 0.9, M_DIRT);
      for (let d = 0; d <= L; d += 4) G.degager(lerp(x0, x, d / L), lerp(z0, z, d / L), 2.4);
      const n = Math.ceil(L / 35);
      for (let j = 1; j < n; j++) { const q = B.navNode(lerp(x0, x, j / n), lerp(z0, z, j / n), tag); B.navLink(out[out.length - 1], q); out.push(q); }
    }
    const q = B.navNode(x, z, tag);
    if (out.length) B.navLink(out[out.length - 1], q);
    out.push(q);
  }
  return out;
}
// le nœud de chemin le plus proche (pour s'y raccorder)
function c2NoeudProche(w, x, z, max, re) {
  let best = -1, bd = max || 80;
  w.nav.nodes.forEach((q, i) => { if (!re.test(q.tag)) return; const d = Math.hypot(q.x - x, q.z - z); if (d < bd) { bd = d; best = i; } });
  return best;
}

// ---------------------------------------------------------------- les Planches : quatre maisons sur pilotis, un trottoir, un quai
function c2Planches(G) {
  const w = G.w, B = G.B, WL = w.waterLevel, sm = smoothstep;
  const X0 = 931, X1 = 996, ZS = 2058, XJ = 963.5, ZQ = 2033, DZ = 2030.4;
  const deck = WL + 1.3, fond = WL - 1.6, greve = WL + 0.5;
  const W0 = { x: 0, y: 0, z: 0, r: 0 };
  // ---- le relief : le fond sous les pilotis, la berge, la grève, la rampe vers le plateau
  c2Sculpt(w, X0 - 14, 2012, X1 + 14, ZS, (x, z, h) => {
    const ex = Math.max(0, X0 - 3 - x, x - X1 - 3), t = (1 - sm(0, 9, ex)) * sm(2012, 2022, z) * (1 - sm(ZS - 3, ZS - 1, z));
    return t > 0 ? Math.min(h, lerp(h, fond, t)) : undefined;
  });
  c2Sculpt(w, X0 - 9, ZS - 3, X1 + 9, ZS + 31, (x, z, h) => {
    const ex = Math.max(0, X0 - x, x - X1), t = (1 - sm(0, 8, ex)) * (1 - sm(ZS + 24, ZS + 30, z));
    if (t <= 0) return undefined;
    const b = z < ZS + 2 ? lerp(fond, greve, sm(ZS - 1.5, ZS + 2, z)) : greve + (z - ZS - 2) * 0.018;
    return lerp(h, b, t);
  });
  const A = [994, ZS + 22], Bp = [1017, ZS + 36], A0x = A[0], A0z = A[1];
  let hB = 0;
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; hB += w.heightAt(Bp[0] + Math.cos(a) * 5, Bp[1] + Math.sin(a) * 5); }
  hB = clamp(hB / 12, WL + 3, WL + 10);
  const hA = greve + 20 * 0.018;
  c2Sculpt(w, 978, ZS + 8, 1034, ZS + 50, (x, z, h) => {
    const dx = Bp[0] - A[0], dz = Bp[1] - A[1], t = clamp(((x - A[0]) * dx + (z - A[1]) * dz) / (dx * dx + dz * dz), 0, 1);
    const d = Math.hypot(x - A[0] - dx * t, z - A[1] - dz * t), k = 1 - sm(2.2, 5.5, d);
    return k > 0 ? lerp(h, lerp(hA, hB, t), k) : undefined;
  });
  G.degager(963, ZS + 6, 44); G.degager(1006, ZS + 29, 12);
  B.paintRect({ x: (X0 + X1) / 2, z: ZS + 19, r: 0 }, 0, 0, (X1 - X0) / 2 + 3, 12, M_GRASS);
  B.paintRect({ x: (X0 + X1) / 2, z: ZS + 4.5, r: 0 }, 0, 0, (X1 - X0) / 2 + 3, 5, M_SAND);
  B.paintDisk(957, ZS + 14, 7, M_DRY, 3); B.paintDisk(976, ZS + 15, 6, M_DIRT, 3); B.paintDisk(944, ZS + 12, 5, M_SAND, 3);
  B.paintLine(X0 + 3, ZS + 5, X1 - 2, ZS + 5, 1.1, M_DIRT);
  B.paintLine(X1 - 3, ZS + 6, A0x, A0z, 1.2, M_DIRT);
  B.paintLine(XJ, ZS + 5, XJ + 0.5, ZS + 12, 1.0, M_DIRT);
  // ---- les maisons : sur leur plancher, sur pieux, porte vers la grève
  const MAISONS = [['pl_doyenne', 938, 6.4, 5.4], ['pl_vanniere', 951.5, 6, 5.2], ['pl_passeur', 976, 6.4, 5.4], ['pl_fumoir', 989.5, 5.2, 4.6]];
  const pieu = (x, z, top, s) => { const b = w.heightAt(x, z) - 0.5; B.block(W0, x, b, z, s || 0.26, top - b, s || 0.26, M_LOGS); };
  const rampe = (x, wd) => B.block(W0, x, greve - 0.06, ZS + 1.6, wd, deck - greve + 0.06, 4.0, M_PLANKS, Math.PI, 2);
  for (const [key, hx, W, D] of MAISONS) {
    const f = { x: hx, y: deck - 0.05, z: ZS - 4.5 - D / 2, r: Math.PI };
    const n0 = w.blocks.length;
    const Bk = B.building(key, f, W, D, { wall: M_PLANKS, win: M_PLANKS, roof: M_THATCH, roofH: 2.0, found: M_PLANKS, dw: 1.1, dh: 2.05, chimney: key === 'pl_doyenne', noLight: key === 'pl_fumoir' },
      function (bf, W2, D2, Bb) { c2MeublerPlanches.call(this, key, bf, W2, D2, Bb); });
    const Fd = w.blocks[n0];
    if (Fd && Math.abs(Fd.sy - 1.25) < 1e-6) { Fd.y = f.y - 0.3; Fd.sy = 0.35; Fd.sx = W + 1.1; Fd.sz = D + 1.2; }
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [-1, 0], [1, 0]]) { const [px, pz] = B.toWorld(f, sx * (W / 2 + 0.35), sz * (D / 2 + 0.45)); pieu(px, pz, f.y - 0.3, 0.28); }
    const o = w.nav.nodes[Bk.nOut];
    o.x = hx; o.z = ZS + 4.6; Bk.out = [o.x, o.z];
    rampe(hx, 1.7);
  }
  // ---- le trottoir de planches devant les portes, ses pieux ; le quai ; la Dame
  const xa = MAISONS[0][1] - MAISONS[0][2] / 2 - 0.6, xb = MAISONS[3][1] + MAISONS[3][2] / 2 + 0.6;
  B.block(W0, (xa + xb) / 2, deck - 0.3, ZS - 2.45, xb - xa, 0.3, 4.1, M_PLANKS);
  for (let x = xa + 0.3; x <= xb - 0.2; x += 3.2) {
    pieu(x, ZS - 0.65, deck - 0.3);
    if (!MAISONS.some(([, hx, W]) => Math.abs(x - hx) < W / 2 + 0.9)) pieu(x, ZS - 4.3, deck - 0.3);
  }
  B.block(W0, XJ, deck - 0.3, (ZS - 4.5 + ZQ) / 2, 2.0, 0.3, ZS - 4.5 - ZQ, M_PLANKS);
  for (let z = ZQ + 0.5; z < ZS - 4.5; z += 3.4) for (const s of [-0.88, 0.88]) pieu(XJ + s, z, deck - 0.3, 0.24);
  rampe(XJ, 2.0);
  pieu(XJ, DZ, WL + 0.35, 0.42);
  B.prop('c2_dame_bois', XJ, WL + 0.35, DZ, 0);
  B.inter('c2p', 'c2p:dame', XJ, deck + 0.9, ZQ + 1.2, 'La Dame', { a: 'dame' });
  B.prop('c2_cierges_eau', XJ, WL + 0.03, 2023, 0, { R: 7, n: 13 });
  B.prop('c2_cierges_eau', XJ + 0.9, WL + 0.03, DZ - 1.4, 0, { R: 0, n: 1, joueur: 1 });
  // ---- les autres rives, d'où l'on appelle le passeur : le ponton du pêcheur, le pied du phare
  const rives = { planches: [XJ + 1.2, greve + 0.05, ZS + 5.6] };
  const rive = (key, x0, z0) => {
    for (let r = 3; r <= 20; r += 1.5) for (let k = 0; k < 24; k++) {
      const a = k / 24 * TAU, x = x0 + Math.cos(a) * r, z = z0 + Math.sin(a) * r, h = w.heightAt(x, z);
      if (h < WL + 0.35 || !pointFree(w, x, z, 0.5)) continue;
      let eau = false;
      for (let j = 0; j < 8 && !eau; j++) { const b = j / 8 * TAU; if (w.heightAt(x + Math.cos(b) * 4, z + Math.sin(b) * 4) < WL - 0.3) eau = true; }
      if (!eau) continue;
      rives[key] = [x, h, z];
      B.inter('c2p', 'c2p:appel_' + key, x, h + 1.0, z, 'Appeler le passeur', { a: 'appel', ou: key });
      return;
    }
  };
  const iP = c2NoeudProche(w, (w.lm.ponton || {}).x || 0, (w.lm.ponton || {}).z || 0, 30, /^ponton$/);
  if (iP >= 0) rive('ponton', w.nav.nodes[iP].x, w.nav.nodes[iP].z);
  if (w.lm.phare) rive('phare', w.lm.phare.x, w.lm.phare.z);
  // ---- ce qui traîne sur la grève et sur l'eau
  const pt = (id, x, z, r, data, s) => B.prop(id, x, w.heightAt(x, z), z, r || 0, data, s);
  B.prop('barque', XJ - 1.95, WL - 0.05, 2041, 0.05); B.prop('barque', XJ + 1.95, WL - 0.05, 2046.5, -0.04);
  pt('barque', 944.5, ZS + 8.2, 1.25);
  pt('filet', 944, ZS + 13, 0.1); pt('filet', 985.5, ZS + 13.5, -0.15);
  pt('sechoir', 956.5, ZS + 15.5, 0); pt('sechoir', 971, ZS + 16.5, 0.08);
  pt('etabli', 986, ZS + 8.6, Math.PI);
  pt('tas_bois', 933.5, ZS + 6.2, 0.2); pt('tas_bois', 993.2, ZS + 7.2, -0.3);
  for (const [x, dz, r] of [[XJ + 1.9, 5.8, 0.3], [XJ + 2.5, 6.5, 1.2], [940.6, 5.6, 0.5], [953.4, 5.9, 2.1], [986.7, 6.1, 0.9]]) pt('nasse', x, ZS + dz, r);
  B.prop('nasse', XJ + 0.55, deck, ZQ + 3.5, 0.4); B.prop('nasse', XJ - 0.5, deck, ZQ + 4.3, 1.4);
  const feu = [XJ + 0.5, ZS + 12];
  pt('feu_camp', feu[0], feu[1], 0, { lit: false, c2: 'planches' });
  const bancs = [[feu[0] - 3.1, feu[1] + 0.3, Math.PI / 2], [feu[0] + 3.1, feu[1] - 0.2, -Math.PI / 2], [feu[0] + 0.2, feu[1] + 3.2, Math.PI]];
  for (const [x, z, r] of bancs) pt('banc', x, z, r);
  for (const [x, z, r] of [[927.5, 2052, 0.2], [925.5, 2057, 1.1], [929.5, 2047, 2.3], [998.5, 2051, 0.7], [1001, 2046, 1.9], [996.5, 2044.5, 2.8]]) B.prop('c2_roseaux', x, Math.min(WL - 0.4, w.heightAt(x, z)), z, r, { v: 0 });
  pt('c2_roseaux', 993.8, ZS + 3.4, 0.4, { v: 1 }); pt('c2_roseaux', 934.2, ZS + 3.2, -0.3, { v: 1 });
  // ---- le chemin du plateau, l'écriteau
  const E = [Bp[0] + 1.4, Bp[1] - 1.6];
  pt('c2_ecriteau', E[0], E[1], Math.atan2(A[0] - Bp[0], A[1] - Bp[1]));
  B.inter('c2p', 'c2p:pl_ecriteau', E[0], w.heightAt(E[0], E[1]) + 1.3, E[1], 'Lire l’écriteau', { a: 'lire', t: 'pl_ecriteau' });
  // ---- les chemins : la grève, la rampe, le plateau, jusqu'au chemin du marais
  const nA = B.navNode(XJ - 7, ZS + 7.5, 'village:planches');
  B.navNode(XJ, ZS + 4.6, 'planches:quai');
  B.navNode(947, ZS + 17, 'planches:greve'); B.navNode(981, ZS + 18.5, 'planches:greve');
  const S = c2Sentier(G, [[A[0] - 1.5, A[1] - 1.5], Bp, [1044, ZS + 39]], 'planches:sentier', 1.1);
  const nc = c2NoeudProche(w, 1044, ZS + 39, 70, /^chemin$/);
  if (nc >= 0) { const q = w.nav.nodes[nc]; B.paintLine(1044, ZS + 39, q.x, q.z, 1.1, M_DIRT); B.navLink(S[S.length - 1], nc); }
  B.navLink(nA, S[0]);
  // ---- les noms, la place gardée
  B.landmark('planches', 964, ZS + 4, 42, { name: 'les Planches', peuple: 'planches' });
  B.landmark('planches_greve', 964, ZS + 12, 12, { name: 'la grève des Planches' });
  B.landmark('planches_quai', XJ, 2044, 6, { name: 'le quai des Planches' });
  B.landmark('planches_dame', XJ, DZ, 4, { name: 'la Dame des Planches' });
  w.noBuild.push({ x: 966, z: ZS + 8, r: 50, why: 'planches' });
  return { x: 964, z: ZS + 4, deck, greve, XJ, ZS, ZQ, dame: [XJ, DZ], cierges: [XJ, 2023], feu, bancs, greveBox: [X0 + 5, ZS + 6, X1 - 5, ZS + 19], rives };
}
// l'intérieur des maisons des Planches (this : le Builder)
function c2MeublerPlanches(key, f, W, D, Bk) {
  const P = (id, x, y, z, r, data) => this.propRel(f, id, x, y, z, r, data);
  if (key === 'pl_fumoir') {
    P('feu_camp', 0, 0.15, D / 2 - 1.0, 0, { lit: true });
    P('sechoir', 0, 0.15, -0.5, 0); P('sechoir', 0, 0.15, 0.5, 0.02);
    P('tas_bois', W / 2 - 0.7, 0.15, -D / 2 + 1.0, Math.PI / 2);
    return;
  }
  const bedCol = { pl_doyenne: '#3a3a4a', pl_vanniere: '#8a6a4a', pl_passeur: '#4a5a6a' }[key];
  this.bed(f, Bk, -W / 2 + 0.85, D / 2 - 1.3, bedCol);
  P('table', 0.7, 0.15, 0.1, 0); P('chaise', 0.7, 0.15, -0.65, Math.PI); P('chaise', 0.7, 0.15, 0.85, 0);
  this.spot(f, Bk, 'sit', 0.7, -0.65, Math.PI);
  if (key === 'pl_doyenne') {
    P('cheminee', W / 2 - 0.62, 0.15, D / 2 - 1.5, -Math.PI / 2, { lit: true });
    P('etagere', -W / 2 + 0.25, 0.15, -0.6, Math.PI / 2, { kind: 'bocaux' });
    P('bougie', 0.5, 0.9, 0.2, 0); P('bougie', -W / 2 + 0.5, 0.15, D / 2 - 2.3, 0);
    this.spot(f, Bk, 'work', W / 2 - 1.5, D / 2 - 1.4, -Math.PI / 2);
  } else if (key === 'pl_vanniere') {
    P('etabli', W / 2 - 1.2, 0.15, D / 2 - 0.62, Math.PI);
    P('nasse', -W / 2 + 0.6, 0.15, -D / 2 + 0.8, 0.4); P('nasse', -W / 2 + 1.3, 0.15, -D / 2 + 0.7, 1.9); P('sac', -W / 2 + 2.0, 0.15, -D / 2 + 0.6, 0.3);
    P('c2_roseaux', W / 2 - 0.5, 0.15, -D / 2 + 0.6, 0, { v: 1 });
    this.spot(f, Bk, 'work', W / 2 - 1.2, D / 2 - 1.45, Math.PI);
  } else {
    P('tonneau', W / 2 - 0.5, 0.15, D / 2 - 0.5, 0); P('caisse', W / 2 - 0.55, 0.15, -D / 2 + 0.7, 0.2);
    P('nasse', -W / 2 + 0.6, 0.15, -D / 2 + 0.7, 0.8);
    P('cheminee', -W / 2 + 0.62, 0.15, -0.9, Math.PI / 2, { lit: true });
    this.spot(f, Bk, 'work', 0.7, -0.65, Math.PI);
  }
}

// ---------------------------------------------------------------- l'estive : trois cabanes, la jasse, le feu, le pré, le cairn
function c2Estive(G) {
  const w = G.w, B = G.B, WL = w.waterLevel;
  const hMoy = (x, z, r) => { let s = w.heightAt(x, z); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; s += w.heightAt(x + Math.cos(a) * r, z + Math.sin(a) * r); } return s / 9; };
  const pt = (id, x, z, r, data, s) => B.prop(id, x, w.heightAt(x, z), z, r || 0, data, s);
  G.degager(318, 1330, 46);
  // ---- les cabanes : pierre sèche, lauzes, sol de terre
  const CAB = [['es_baile', 299, 1318, 6, 5, -Math.PI / 2], ['es_fromagerie', 313, 1306.5, 5.6, 4.6, Math.PI], ['es_patre', 328.5, 1318, 4.2, 3.8, Math.PI / 2]];
  for (const [key, x, z, W, D, r] of CAB) {
    const y = hMoy(x, z, 3.2), f = { x, y, z, r };
    B.flattenRect(f, W / 2 + 1.4, D / 2 + 1.4, y, 3.5);
    B.building(key, f, W, D, { wall: key === 'es_fromagerie' ? M_PLASTER : M_ROCK, win: key === 'es_fromagerie' ? M_PLASTER : M_ROCK, roof: M_SLATE, roofH: 1.5, found: M_MOSSY, floor: M_DIRT, dw: 1.0, dh: 1.85, chimney: key !== 'es_patre' },
      function (bf, W2, D2, Bb) { c2MeublerEstive.call(this, key, bf, W2, D2, Bb); });
  }
  // ---- le feu, ses bancs
  const fy = hMoy(314, 1323.5, 2.5);
  B.flatten(314, 1323.5, 3.2, fy, 3);
  const feu = [314, 1323.5];
  pt('feu_camp', feu[0], feu[1], 0, { lit: false, c2: 'estive' });
  const bancs = [[feu[0] - 3.1, feu[1] + 0.2, Math.PI / 2], [feu[0] + 0.1, feu[1] + 3.1, Math.PI], [feu[0] + 3.0, feu[1] + 0.4, -Math.PI / 2]];
  for (const [x, z, r] of bancs) pt('banc', x, z, r);
  pt('tas_bois', 303.2, 1311.2, 0.3); pt('c2_billot', 305, 1312.4, 0.4);
  pt('c2_chaudron', 317.5, 1311.6, 0.2, { lit: false });
  pt('sechoir_peaux', 322.6, 1327.5, 0.5); pt('sechoir_peaux', 325.4, 1325.2, 0.35);
  // ---- la jasse : un enclos de pierre sèche, une ouverture vers le feu ; les bêtes
  const J = { x: 303, z: 1344, hx: 7, hz: 5 };
  const mur = (x0, z0, x1, z1) => {
    const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L / 3.5));
    for (let k = 0; k < n; k++) {
      const ax = lerp(x0, x1, k / n), az = lerp(z0, z1, k / n), bx = lerp(x0, x1, (k + 1) / n), bz = lerp(z0, z1, (k + 1) / n);
      const ha = w.heightAt(ax, az), hb = w.heightAt(bx, bz), hm = w.heightAt((ax + bx) / 2, (az + bz) / 2);
      const lo = Math.min(ha, hb, hm) - 0.35, hi = Math.max(ha, hb, hm) + 0.9;
      B.block({ x: (ax + bx) / 2, y: lo, z: (az + bz) / 2, r: Math.atan2(bx - ax, bz - az) }, 0, 0, 0, 0.6, hi - lo, L / n + 0.35, M_MOSSY);
    }
  };
  mur(J.x - J.hx, J.z - J.hz, J.x - 1.5, J.z - J.hz); mur(J.x + 1.5, J.z - J.hz, J.x + J.hx, J.z - J.hz);
  mur(J.x - J.hx, J.z + J.hz, J.x + J.hx, J.z + J.hz); mur(J.x - J.hx, J.z - J.hz, J.x - J.hx, J.z + J.hz); mur(J.x + J.hx, J.z - J.hz, J.x + J.hx, J.z + J.hz);
  pt('c2_sonnailles', J.x + 2.4, J.z - J.hz - 0.9, 0, { v: 0 });
  pt('abreuvoir', J.x - 3.5, J.z + 2.8, 0.1);
  for (let k = 0; k < 4; k++) B.obj('sheep', J.x - 4 + k * 2.6, J.z + (k % 2 ? 1.6 : -1.3));
  // ---- le pré, les pierres à sel ; le rocher aux marques au départ du sentier ; le cairn à la sonnaille
  for (let k = 0; k < 4; k++) B.obj('sheep', 337 + (k % 2) * 5.5, 1333 + ((k / 2) | 0) * 5.5);
  for (const [x, z, r] of [[335.5, 1340.5, 0.3], [344.5, 1335, 1.4], [348, 1343, 2.2]]) pt('c2_pierre_sel', x, z, r);
  pt('c2_marques', 348.5, 1370.5, -2.3, { v: 0 });
  B.inter('c2p', 'c2p:es_marques', 348.5 - Math.sin(-2.3) * 1.2, w.heightAt(348.5, 1370.5) + 1.1, 1370.5 - Math.cos(-2.3) * 1.2, 'Regarder les marques', { a: 'marques' });
  const CA = [288, 1300.5];
  pt('cairn', CA[0], CA[1], 0.4, null, 1.15);
  B.prop('c2_sonnailles', CA[0], w.heightAt(CA[0], CA[1]) + 1.52, CA[1], 0.8, { v: 1 });
  B.inter('c2p', 'c2p:es_cairn', CA[0] + 1.1, w.heightAt(CA[0], CA[1]) + 1.0, CA[1] + 0.8, 'Le cairn', { a: 'cairn' });
  // ---- le sentier : du feu jusqu'au chemin de la hutte, dans la vallée ; un poteau au bout
  const T = [[316, 1330], [330, 1347], [340, 1364], [360, 1377], [380, 1381], [400, 1382], [420, 1382], [445, 1384], [480, 1388], [560, 1392], [640, 1400], [720, 1410], [800, 1420], [880, 1435], [932, 1445]];
  const S = c2Sentier(G, T, 'sentier:estive', 0.9);
  const nc = c2NoeudProche(w, 932, 1445, 60, /^(chemin|hutte_ermite:out)$/);
  if (nc >= 0) { const q = w.nav.nodes[nc]; B.paintLine(932, 1445, q.x, q.z, 0.9, M_DIRT); B.navLink(S[S.length - 1], nc); }
  pt('c2_ecriteau', 929.5, 1443, Math.atan2(880 - 932, 1435 - 1445), { v: 1 });
  B.inter('c2p', 'c2p:es_ecriteau', 929.5, w.heightAt(929.5, 1443) + 1.3, 1443, 'Lire l’écriteau', { a: 'lire', t: 'es_ecriteau' });
  // ---- le plan d'en haut, derrière la crête : l'herbe plus grasse ; contre la pente, une pierre dressée comme une porte
  const PL = [236, 1250];
  G.degager(PL[0], PL[1], 20);
  B.paintDisk(PL[0], PL[1], 17, M_LUSH, 5);
  const Dp = [253.5, 1246], hD = Math.min(w.heightAt(Dp[0] - 1.4, Dp[1]), w.heightAt(Dp[0] - 1.4, Dp[1] - 1), w.heightAt(Dp[0] - 1.4, Dp[1] + 1));
  const fD = { x: Dp[0], y: hD, z: Dp[1], r: -Math.PI / 2 };
  B.block(fD, 0.2, -1.4, -0.4, 3.4, 4.6, 2.6, M_ROCK, 0.08);
  B.block(fD, -1.5, -1.2, -0.7, 1.8, 3.6, 2.2, M_ROCK, -0.35);
  B.block(fD, 1.7, -1.3, -0.9, 1.6, 3.1, 2.0, M_ROCK, 0.45);
  B.block(fD, 0.1, -0.25, 0.93, 1.25, 2.55, 0.16, M_SLATE);
  B.block(fD, 0.1, 2.28, 0.96, 1.8, 0.3, 0.26, M_ROCK);
  { const [x, z] = B.toWorld(fD, 0, 1.9); B.inter('c2p', 'c2p:es_porte', x, hD + 1.2, z, 'La pierre', { a: 'porte' }); }
  // ---- les chemins du camp
  const nA = B.navNode(316.5, 1330.5, 'village:estive');
  B.navLink(nA, S[0]);
  B.navNode(303, 1336.8, 'estive:jasse'); B.navNode(339.5, 1331.5, 'estive:pre');
  // ---- les noms, la place gardée
  B.landmark('estive', 316, 1326, 36, { name: 'l’estive du Plan', peuple: 'estive' });
  B.landmark('estive_jasse', J.x, J.z, 8, { name: 'la jasse' });
  B.landmark('estive_feu', feu[0], feu[1], 5, { name: 'le feu de l’estive' });
  B.landmark('estive_pre', 341, 1338, 11, { name: 'le pré de l’estive' });
  B.landmark('estive_crete', 336, 1296, 9, { name: 'la crête de l’estive' });
  B.landmark('estive_cairn', CA[0], CA[1], 4, { name: 'le cairn à la sonnaille' });
  B.landmark('estive_plan', PL[0], PL[1], 16, { name: 'le plan d’en haut' });
  w.noBuild.push({ x: 316, z: 1328, r: 44, why: 'estive' });
  return { x: 316, z: 1326, feu, bancs, jasse: J, pre: [341, 1338], cairn: CA, chaudron: [317.5, 1311.6], porte: [Dp[0], hD, Dp[1]] };
}
// l'intérieur des cabanes de l'estive (this : le Builder)
function c2MeublerEstive(key, f, W, D, Bk) {
  const P = (id, x, y, z, r, data) => this.propRel(f, id, x, y, z, r, data);
  const bedCol = { es_baile: '#6a5a48', es_fromagerie: '#c8b8a0', es_patre: '#7a6a4a' }[key];
  this.bed(f, Bk, -W / 2 + 0.85, D / 2 - 1.3, bedCol);
  if (key === 'es_patre') {
    P('sac', W / 2 - 0.5, 0.15, D / 2 - 0.5, 0.4); P('c2_sonnailles', W / 2 - 0.6, 0.15, -D / 2 + 0.6, 0, { v: 2 });
    P('banc', 0.35, 0.15, -0.5, Math.PI);
    this.spot(f, Bk, 'sit', 0.35, -0.5, Math.PI);
    return;
  }
  P('table', 0.8, 0.15, 0.2, 0); P('chaise', 0.8, 0.15, -0.55, Math.PI);
  this.spot(f, Bk, 'sit', 0.8, -0.55, Math.PI);
  if (key === 'es_baile') {
    P('cheminee', W / 2 - 0.62, 0.15, D / 2 - 1.5, -Math.PI / 2, { lit: true });
    P('coffre', -W / 2 + 0.6, 0.15, -D / 2 + 0.8, Math.PI / 2);
    this.spot(f, Bk, 'work', 0.8, -0.55, Math.PI);
  } else {
    P('c2_fromages', W / 2 - 0.35, 0.15, 0.3, -Math.PI / 2); P('c2_fromages', -W / 2 + 0.35, 0.15, -D / 2 + 1.1, Math.PI / 2);
    P('baratte', W / 2 - 0.7, 0.15, D / 2 - 0.6, 0);
    this.spot(f, Bk, 'work', W / 2 - 1.4, D / 2 - 0.9, 0);
  }
}
