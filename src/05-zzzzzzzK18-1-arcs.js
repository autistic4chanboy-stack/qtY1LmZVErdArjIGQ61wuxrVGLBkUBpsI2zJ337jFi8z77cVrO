// ============================================================================
//  LES RÉCITS DES PROCHES (K18) — 1. LA BOULANGERIE, LA FORGE, LA PETITE, LES GRAINES
//  Un récit : { id, npc, titre, accroche, etapes, fins, rituel, scenes, monde }.
//  Une étape : { id, titre (le chapitre au carnet), min (amitié de l'habitant), delai (jours après l'étape d'avant),
//    jour (pas avant), si(k) (sinon sautée), att(k) (attendre ; sautée après K18_REGL.attenteMax jours),
//    qui (à qui parler ; l'habitant du récit par défaut), minQui, aller (l'étape se fait en arrivant au lieu),
//    lieu, moment ('nuit'|'aube'|'soir'|'jour'), vu (ce qu'on voit en arrivant), need { objet: n } (garde : ne pas
//    prendre), carnet (l'indice), label (la ligne du dialogue), dlg (les répliques : 'texte' ou ['texte', 'réponse']),
//    attente (s'il manque quelque chose), choix [{ k, label, dlg, fin, cine, lettre, don, argent, voyage, fache }],
//    defaut (le choix retenu si l'étape est sautée), finSaut, cine, lettre { delai, de, titre, texte }, don, argent,
//    voyage [id, jours], fin }. dlg, choix, need, fin, cine peuvent être des fonctions du contexte k
//    (k.ch('arc.etape'), k.fin('arc'), k.fait('arc.etape'), k.vivant(id), k.coeur(id), k.quete(id), k.fem).
//  Une scène : { titre, lieu ('cle' de w.lm | { bld } | { note }), repli, h, musique, angle,
//    gens [{ id | joueur | look, x, z (vers la caméra), cap ('cam'|'dos'|'centre'|'gauche'|'droite'|angle),
//    chemin { de: [x, z], a: [x, z], t0, t1 }, s }], paroles [[qui ('' | '@id' | nom), texte, son]], carte, fin }.
// ============================================================================
// (face : le nom d'une texture de visage, TL[face], lue à la scène)
const K18_LOOKS = {
  blanc: { skin: '#e8ecf0', hair: '#e8ecf0', hairStyle: 'chauve', top: '#e4e8ec', bottom: '#dce0e4', shoe: '#d0d4d8', face: 'blankF', height: 1.5, build: 'mince' },
  lise: { skin: '#d8dee4', hair: '#6a7078', hairStyle: 'long', top: '#c8d0d8', bottom: '#b8c0c8', shoe: '#8a9098', dress: true, face: 'paleF', height: 0.66 },
  jean: { skin: '#d4ae8a', hair: '#3a2c22', hairStyle: 'court', beard: 'moustache', top: '#3a3a40', bottom: '#2c2a2a', shoe: '#1e1a16', hat: 'chapeau', coat: true },
  rose: { skin: '#e2c4aa', hair: '#b8b0a8', hairStyle: 'chignon', top: '#5a4a5a', bottom: '#3e3440', shoe: '#2a2020', dress: true, coat: true, old: true },
  octave: { skin: '#e4c2a2', hair: '#4a3020', hairStyle: 'court', top: '#2a3448', bottom: '#2a2e3a', shoe: '#1a1614', hat: 'casquette', coat: true },
  invite: { skin: '#d8b090', hair: '#5a4030', hairStyle: 'court', top: '#6a5a48', bottom: '#3a3830', shoe: '#2a2018', hat: 'paille' },
  invitee: { skin: '#e4c0a0', hair: '#7a5432', hairStyle: 'chignon', top: '#8a4a3a', bottom: '#4a3a30', shoe: '#2a2018', dress: true, apron: '#e0d8c8' },
};

// ============================================================================ LA BOULANGÈRE
K18_ARCS.push({
  id: 'boulangere', npc: 'boulangere', ordre: 1, titre: 'La place d’Émile',
  accroche: 'Émile est sorti un soir de septembre avec une lanterne. Neuf ans après, il n’a toujours pas de tombe, et elle n’est toujours pas veuve.',
  etapes: [
    { id: 'pierre', titre: 'Pas veuve', min: 3, jour: 3, label: 'Vous comptez la monnaie bien lentement, ce matin.',
      carnet: '{npc:boulangere} a l’air ailleurs, ces temps-ci. Lui parler.',
      dlg: [
        ['Moi ? Lentement ? J’ai la tête dans le pétrin, mon chou, comme d’habitude.', 'Vous avez l’air ailleurs.'],
        ['… Vous avez remarqué ça, vous. Doux Jésus. Bon. Asseyez-vous sur le sac, là. Pas celui-là, il est percé.', 'Je vous écoute.'],
        ['Émile n’a pas de tombe. Neuf ans qu’il est sorti avec sa lanterne, et rien : pas de corps, pas de croix, pas une pierre. Le père {npc:cure} dit qu’on n’enterre pas un homme qu’on n’a pas retrouvé.', '…'],
        ['Alors je ne suis pas veuve. Je suis « la femme d’Émile », comme on dit « la maison d’Émile » : une chose qui attend. Et une chose qui attend, ça n’a pas le droit de…', 'De quoi ?'],
        'De rien. De chanter. De laisser un homme rester un quart d’heure devant son comptoir. Vous voulez bien parler au père {npc:cure}, pour moi ? Moi, devant lui, je pleure, et il me donne des chapelets.',
      ] },
    { id: 'cure', titre: 'Une messe sans corps', qui: 'cure', label: 'Une pierre pour Émile Aubert',
      carnet: 'Demander au père {npc:cure} une tombe pour Émile, qui n’a jamais été retrouvé.',
      dlg: [
        ['Émile Aubert… Oui. J’ai dit sa messe des disparus. La boulangère est restée au fond, debout, comme si elle attendait qu’on l’appelle.', 'Elle voudrait une tombe.'],
        ['Le Rituel ne prévoit pas qu’on enterre un absent, mon enfant. Mais le Rituel a été écrit loin d’ici, par des gens dont les morts restaient où on les avait mis.', 'Alors ?'],
        'Alors il me faut quelque chose de lui, pour la terre. Et une croix. De fer : le bois, ici, les nuits rouges le déterrent. Demandez au forgeron. Oui, à lui. Je sais ce que je vous demande.',
      ] },
    { id: 'place', titre: 'Une place sous le lierre', aller: true, lieu: 'cimetiere', moment: 'soir',
      carnet: 'Chercher au cimetière, un soir, une place pour la croix d’Émile.',
      vu: 'Au fond du cimetière, sous le lierre, une vieille pierre au nom d’Anselme, avec des fleurs fraîches et deux pains. À côté, une place libre, au soleil couchant. C’est là.' },
    { id: 'croix', titre: 'La croix de fer', qui: 'forgeron', need: { lingot_fer: 2 }, label: 'Une croix pour Émile',
      carnet: 'Porter deux lingots de fer au forgeron, pour une croix.',
      attente: 'Une croix ? Il faut du fer. Deux lingots. Le mien est pour les fers à cheval.',
      dlg: [
        ['(Il pose le marteau.) Pour Émile.', 'Pour Émile.'],
        ['Le soir où il est sorti, il m’a fait signe en passant devant la forge. J’aurais pu le suivre. Je suis resté assis.', 'Vous n’y pouviez rien.'],
        ['Vous n’en savez rien. Moi non plus. C’est ça, le pire. (Il prend le fer.)', '…'],
        'Revenez demain. Elle sera droite. Je trempe deux fois. Même pour lui. Surtout pour lui.',
      ] },
    { id: 'terre', titre: 'Ce qu’on met en terre', delai: 1, min: 4, label: 'Pour la tombe d’Émile…',
      carnet: 'Retourner voir {npc:boulangere} : que mettre en terre, à la place d’Émile ?',
      dlg: (k) => [
        k.fait('boulangere.croix') ? ['Il l’a apportée lui-même, ce matin, la croix, enveloppée dans un sac à farine. Il n’a rien dit. Il est resté un quart d’heure. Je ne l’ai pas pressé.', 'Et pour la terre ?']
          : k.vivant('cure') ? ['Le père {npc:cure} plantera une croix de bois. Elle ne tiendra pas. Rien ne tient, ici. On la replantera.', 'Et pour la terre ?']
            : ['Il n’y a plus de curé pour bénir. On plantera une croix de bois, et je dirai la prière moi-même. Je la sais : je l’ai dite neuf ans, tout bas.', 'Et pour la terre ?'],
        ['Il faut quelque chose de lui. J’ai son alliance, dans la boîte à sel. Et j’ai sa chanson, celle qu’il chantait pour faire lever la pâte, que la petite connaît sans l’avoir apprise.', 'Que voulez-vous mettre en terre ?'],
        'Dites-moi, vous. Moi, je n’arrive pas à choisir. Si j’enterre l’anneau, je ne suis plus sa femme. Si je le garde, je le resterai toujours un peu.',
      ],
      choix: [
        { k: 'anneau', label: 'Enterrez l’alliance. Vous avez le droit de vivre.', cine: 'enterrement',
          dlg: ['Le droit de vivre… Vous parlez comme ma mère quand elle avait bu un verre de trop. … Oui. L’anneau. Il ira avec lui, et moi, je resterai avec la petite. Et avec le reste.'] },
        { k: 'chanson', label: 'Gardez l’alliance. Que la petite chante.', cine: 'enterrement',
          dlg: ['La chanson… Oui. Il l’aurait voulu comme ça : qu’on chante, et pas qu’on pleure. Je garde l’anneau. Je le porterai au cou, comme d’autres portent leurs bagues sous la chemise.'] },
      ], defaut: 'chanson' },
    { id: 'apres', titre: 'Après la terre', delai: 1, label: 'Comment allez-vous ?',
      carnet: 'Passer voir {npc:boulangere}, après l’enterrement.',
      dlg: (k) => k.ch('boulangere.terre') === 'anneau' ? [
        ['Bien. Mal. Les deux, mon chou, comme une pâte qui hésite.', 'Je comprends.'],
        ['Ce matin, je me suis surprise à chanter. Faux. Et personne ne m’a regardée de travers : j’étais veuve, j’avais le droit.', '…'],
        'Tenez. La première fournée de la veuve Aubert. Ne riez pas, c’est la meilleure depuis neuf ans.',
      ] : [
        ['Bien, je crois. La petite a chanté sur la tombe, et tout le monde a pleuré, même le curé, même le forgeron, qui a fait semblant d’avoir de la suie dans l’œil.', 'C’était beau.'],
        ['Je porte l’anneau au cou. Il est froid le matin et tiède le soir. Je me dis qu’il me tient compagnie.', '…'],
        'Tenez. Pour vous. Vous avez été là, et ici, être là, c’est ce qui compte.',
      ],
      don: { brioche: 2, pain: 3 },
      fin: (k) => (k.ch('boulangere.terre') === 'anneau' ? 'veuve' : 'chanson') },
  ],
  fins: {
    veuve: { titre: 'Veuve, enfin', resume: 'Émile a une croix au cimetière, et son alliance dort avec lui. {npc:boulangere} chante en pétrissant ; on ne dit plus « la femme d’Émile ».',
      salut: ['Je chante, vous entendez ? Faux, mais je chante. C’est vous qui m’avez rendu ça.', 'Je suis passée au cimetière, ce matin. J’ai dit bonjour à Émile, et puis je suis repartie. Juste bonjour. C’est déjà beaucoup, juste bonjour.'],
      lettre: { delai: 3, de: 'La boulangère', titre: 'Une lettre qui sent le levain', texte: 'Mon chou,\n\nJe n’écris jamais, alors pardonnez les fautes : je mets des virgules comme je mets du sel, à l’œil.\n\nHier soir, j’ai rangé la boîte à sel, et il n’y avait plus rien dedans que du sel. C’est bête. J’ai pleuré dans le pétrin, et le pain de ce matin était parfait. Ma grand-mère disait qu’il faut une larme dans la pâte, une fois dans sa vie.\n\nPassez quand vous voulez. Le pain est toujours chaud pour vous, et moi, je suis toujours là.\n\nVotre boulangère, veuve Aubert (j’aime bien l’écrire).' } },
    chanson: { titre: 'La chanson d’Émile', resume: 'Émile a une croix au cimetière, et sa chanson y a été chantée. {npc:boulangere} porte l’anneau au cou, et elle n’attend plus : elle se souvient.',
      salut: ['La petite chante la chanson d’Émile en pétrissant avec moi. On fait les deux voix. Faux toutes les deux.', 'L’anneau est tiède, ce matin. Il fait beau, alors. Je me trompe rarement.'],
      lettre: { delai: 3, de: 'La boulangère', titre: 'Une lettre qui sent le levain', texte: 'Mon chou,\n\nLa petite m’a demandé hier si papa entendait la chanson, là où il est. J’ai dit oui. Je n’en sais rien. Mais je l’ai dit très fort, et elle a dormi d’un trait.\n\nMerci d’avoir été là. Je ne sais pas dire merci autrement qu’avec du pain, alors venez en chercher.\n\nVotre boulangère.' } },
  },
  rituel: { tous: 6, don: { pain: 2 }, texte: ['Tenez, la miche du jour, la plus dorée. Ne discutez pas, je l’ai faite en chantant, alors elle est un peu de travers.', 'Votre pain ! Je l’ai mis de côté avant que la petite le mange. Elle mange tout ce qui est doré.'] },
  monde: {
    veuve: { boutique: { npc: 'boulangere', vend: [['gateau', 34]] } },
    chanson: { boutique: { npc: 'boulangere', vend: [['gateau', 34]] } },
  },
  scenes: {
    enterrement: { titre: 'Un enterrement sans corps', lieu: 'cimetiere', h: 18.3, musique: 'pd_chopin4', angle: 0.6,
      gens: [
        { id: 'cure', x: 0, z: -1.6, cap: 'cam' },
        { id: 'boulangere', x: -0.55, z: 1.2, cap: 'centre' },
        { id: 'fillette', x: 0.45, z: 1.3, cap: 'centre' },
        { id: 'forgeron', x: 2.4, z: 2.2, cap: 'centre' },
        { joueur: true, x: -2.4, z: 2.4, cap: 'centre' },
      ],
      paroles: (k) => [
        ['', 'Au cimetière de {ville}, un soir de semaine. Une croix neuve, plantée droite, et pas de cercueil.'],
        ['@cure', 'Seigneur, nous ne savons pas où il repose. Vous, vous le savez. Que cela nous suffise.', 'cloche'],
        k.ch('boulangere.terre') === 'anneau'
          ? ['@boulangere', 'Je te rends ton anneau, Émile. Garde-le au chaud. Moi, j’ai la petite. J’ai le four. Et j’ai le droit, maintenant.']
          : ['@fillette', '(Elle chante, un peu faux, la chanson pour faire lever le pain. Personne ne la lui a apprise.)'],
        ['@forgeron', '(Il ne dit rien. Il a ôté sa casquette, et il la tord entre ses mains.)'],
        ['', 'Ce soir-là, à la boulangerie, la pâte a levé sans qu’on lui parle.'],
      ],
      fin: { haut: 'La place d’Émile', titre: 'Un enterrement sans corps' } },
  },
});

// ============================================================================ LE FORGERON
K18_ARCS.push({
  id: 'forgeron', npc: 'forgeron', ordre: 2, titre: 'Trois coups, un temps', finDefaut: (k) => (!k.vivant('boulangere') ? 'tombe' : 'seize'),
  accroche: 'Sous la forge, certaines nuits, on frappe. Trois coups, un temps, trois coups : le signal des mineurs, pour dire « on est vivants ».',
  etapes: [
    { id: 'signal', titre: 'Ce qui frappe sous la forge', min: 3, jour: 4, label: 'Vous avez les yeux rouges.',
      carnet: 'Le forgeron a les yeux rouges. Lui parler.',
      dlg: [
        ['Pas dormi.', 'À cause des coups, sous la forge ?'],
        ['… Qui vous a dit ? Personne. Bon. (Il essuie ses mains, longtemps.)', 'Racontez.'],
        ['Trois coups, un temps, trois coups. Le signal des mineurs, quand la roche les prenait : « on est vivants ». Je l’entends depuis trente ans. Je réponds sur la Vieille. Parfois, on me répond avant que j’aie frappé.', 'Je peux écouter avec vous ?'],
        'Venez une nuit. Pas pour moi. Pour me dire que je ne suis pas fou. Ou que je le suis. Les deux me vont.',
      ] },
    { id: 'nuit', titre: 'Écouter, une nuit', aller: true, lieu: 'forge', moment: 'nuit',
      carnet: 'Écouter, une nuit, devant la forge.',
      vu: 'Sous les dalles de la forge, très loin : trois coups, un temps, trois coups. Puis, tout près, un marteau qui répond sur l’enclume.' },
    { id: 'aveu', titre: 'Le mal de ventre', min: 4, label: 'Je les ai entendus.',
      carnet: 'Dire au forgeron ce que vous avez entendu.',
      dlg: [
        ['Alors je ne suis pas fou. (Il rit, un rire qui ne sert à rien.) C’est presque pire.', 'Qui frappe, à votre avis ?'],
        ['Mon père. Les treize autres. Le trente octobre quatre-vingt, je devais descendre avec lui, pour la première fois. J’ai dit que j’avais mal au ventre.', 'Vous aviez peur.'],
        ['J’avais peur du noir, comme mon cousin. Mon père m’a ébouriffé les cheveux, et il est descendu sans moi. Quatorze cercueils. Le sien était le plus léger.', '…'],
        'Je voudrais leur forger une plaque. Quatorze noms, à l’entrée de la mine, là où la compagnie a cloué ses planches. Il me faut du fer et du charbon. Et des bras pour la porter. Les miens tremblent, quand c’est là-bas.',
      ] },
    { id: 'plaque', titre: 'Quatorze noms', delai: 1, need: { lingot_fer: 3, charbon: 4 }, label: 'Le fer pour la plaque',
      carnet: 'Apporter au forgeron trois lingots de fer et quatre de charbon, pour la plaque des mineurs.',
      attente: 'Trois lingots, quatre de charbon. La plaque doit être épaisse. Les noms ne doivent pas s’user.',
      dlg: [
        ['(Il frappe toute la journée. Le soir, la plaque refroidit dans le sable : quatorze noms, et en bas, plus petit : « Ils ont frappé. Nous n’avons pas répondu. »)', 'C’est juste.'],
        'C’est juste. Demain soir, on la pose, à la mine. Venez. Je ne veux pas y aller seul, et je ne veux personne d’autre.',
      ] },
    { id: 'pose', titre: 'À l’entrée de la mine', aller: true, lieu: 'mine', moment: 'soir', delai: 1, cine: 'mine',
      carnet: 'Retrouver le forgeron à l’entrée de la mine, un soir, pour poser la plaque.',
      vu: 'Il est déjà là, la plaque contre la jambe, un sac de clous à la ceinture.' },
    { id: 'bague', titre: 'La bague de fer', delai: 2, min: 6, label: 'Vous avez dormi ?',
      carnet: 'Revoir le forgeron, quelques jours après la plaque.',
      att: (k) => !!k.fin('boulangere') || !k.vivant('boulangere') || k.coeur('boulangere') >= 2,
      dlg: (k) => {
        const L = [
          ['Comme un sonneur. Personne n’a frappé, depuis. Ni les autres. Je crois qu’ils ont lu.', 'Tant mieux.'],
          ['(Il tire une ficelle de sous sa chemise. Au bout, une bague de fer noir, polie par les années.) Seize ans que je la porte. Forgée en quatre-vingt-quatorze, en fer : je n’avais pas d’or.', 'Pour elle.'],
        ];
        if (!k.vivant('boulangere')) L.push('Pour elle. Elle n’est plus là pour dire non. Je la poserai sur sa tombe. Le fer, ça tient, sur les tombes.');
        else if (k.coeur('boulangere') >= 2) L.push('Pour elle. Mais elle chante pour vous, maintenant. Je l’entends depuis la forge. Ça me va. Ça me va, vraiment. Prenez-la. Le jour venu, donnez-la-lui. Dites que c’est du fer d’ici.');
        else if (k.fin('boulangere') === 'veuve') L.push('Elle a enterré l’anneau d’Émile. Elle chante. Hier, elle m’a laissé rester une demi-heure devant le comptoir. Une demi-heure. Dites-moi ce que je fais.');
        else L.push('Elle porte encore l’anneau d’Émile, au cou. Je ne lutte pas contre un mort. Personne ne gagne contre un mort. Dites-moi ce que je fais.');
        return L;
      },
      choix: (k) => (!k.vivant('boulangere') ? [{ k: 'tombe', label: 'Elle aurait dit oui, je crois.', fin: 'tombe', dlg: ['Peut-être. Peut-être pas. C’est le seul avantage des morts : on peut décider qu’ils auraient dit oui.'] }]
        : k.coeur('boulangere') >= 2 ? [{ k: 'temoin', label: 'Je la lui donnerai. De votre part.', fin: 'temoin', don: { k18_bague_fer: 1 }, dlg: ['Non. Pas de ma part. De la vôtre. Moi, j’ai porté seize ans. C’est assez. Ça pèse, le fer.'] }]
          : [
            { k: 'demande', label: 'Demandez-la. Aujourd’hui.', dlg: ['Aujourd’hui. (Il regarde l’enclume, comme pour lui demander la permission.) Aujourd’hui. Si je ne suis pas revenu dans une heure, c’est que je me suis caché dans le four.'] },
            { k: 'attente', label: 'Gardez-la encore sous la chemise.', fin: 'seize', dlg: ['Encore. Oui. Je sais faire. C’est la seule chose que je sais faire mieux que le fer : attendre.'] },
          ]),
      defaut: 'attente', finSaut: 'seize' },
    { id: 'reponse', titre: 'La réponse', delai: 1, si: (k) => k.ch('forgeron.bague') === 'demande', label: 'Alors ?',
      carnet: 'Le forgeron est allé à la boulangerie avec sa bague. Lui demander.',
      dlg: (k) => (k.fin('boulangere') === 'veuve' ? [
        ['Elle a dit oui.', 'Oui ?'],
        ['(Il le répète, comme pour vérifier que le mot tient.) Oui. Elle a dit : « Il t’en a fallu, du temps, Marchal. » Et puis elle a ri, et elle a pleuré, et moi je tenais la bague.', '…'],
        'La petite est descendue l’escalier en chemise. Elle m’a appelé « docteur des choses », comme d’habitude. Et puis « papa », pour voir. Pour voir. La noce, c’est dans trois jours, à l’église. Bonnefoy fait le repas. Vous serez là. Ce n’est pas une question.',
      ] : [
        ['Elle a dit : « Pas encore. » Pas non. Pas encore.', 'C’est déjà ça.'],
        '(Il remet la ficelle sous sa chemise.) C’est déjà ça. J’ai attendu seize ans. Je sais faire. Et maintenant, je sais qu’elle sait. Ça change tout. Ça ne change rien. Les deux.',
      ]),
      fin: (k) => (k.fin('boulangere') === 'veuve' ? null : 'pasencore') },
    { id: 'noce', titre: 'Les noces de la forge', aller: true, lieu: 'eglise', moment: 'jour', delai: 2, cine: 'noces',
      si: (k) => k.ch('forgeron.bague') === 'demande' && k.fin('boulangere') === 'veuve' && k.vivant('boulangere'),
      carnet: 'Les noces, à l’église, dans la journée. Y être.',
      vu: 'Les cloches sonnent. Sur le parvis, une robe tachée de farine, et un homme qui ne sait pas où mettre ses mains.',
      don: { tarte: 2 }, fin: 'noces' },
  ],
  fins: {
    noces: { titre: 'Les noces de la forge', resume: 'Le forgeron a épousé la boulangère, un matin de cloches. La petite l’appelle « docteur des choses », et parfois « papa », pour voir.',
      salut: ['Je me lève à trois heures et demie, maintenant. Pour le four. Je dors debout. Je n’ai jamais été aussi bien.', 'La petite m’a apporté un moulin à café cassé. Il n’était pas cassé. Elle voulait juste rester à la forge.'],
      lettre: { delai: 2, de: 'Les Marchal', titre: 'Merci', texte: 'Merci d’être venu{e}.\n\nLa robe avait de la farine. La bague était en fer. Le curé s’est trompé de prénom, et Bonnefoy a pleuré dans la sauce. La petite dit que c’est la plus belle noce du monde, et elle en a vu une seule.\n\nVotre gond de grange : je l’ai changé. Ne remerciez pas.\n\n— M., et la boulangère, et la petite (qui a dessiné le cœur en bas).' } },
    pasencore: { titre: 'Pas encore', resume: 'Il a demandé ; elle a répondu « pas encore ». La bague est retournée sous la chemise, plus légère qu’avant.',
      salut: ['Pas encore. Je me le répète en frappant. Ça fait un bon rythme : pas-en-core.', 'Elle m’a gardé un pain, ce matin. Le plus doré. Je l’ai mangé à la forge, lentement.'] },
    seize: { titre: 'Sous la chemise', resume: 'La bague de fer est restée sous sa chemise. Mais les quatorze noms sont à la mine, et personne ne frappe plus sous la forge.',
      salut: ['Personne ne frappe plus. Je dors. C’est étrange, de dormir.', 'La Vieille sonne clair, ces temps-ci. Comme une église.'] },
    temoin: { titre: 'La bague donnée', resume: 'Il vous a donné la bague de fer, pour elle, de votre part. « Ça pèse, le fer. »',
      salut: ['Vous l’avez encore, la bague ? Bien. Elle est mieux sur vous que sous ma chemise.', 'Prenez soin d’elle. Et de la petite. Sinon, j’ai un marteau.'] },
    tombe: { titre: 'Sur sa tombe', resume: 'La bague de fer est sur la tombe de la boulangère. Le fer, ça tient, sur les tombes.',
      salut: ['J’ai poli la bague, sur la tombe. Elle rouillait. Je ne veux pas qu’elle rouille.'] },
  },
  rituel: { tous: 8, don: { lingot_fer: 1 }, texte: ['Tenez. Du fer. Il restait de la plaque. Vous en ferez quelque chose de bien.'] },
  monde: {
    noces: {
      liens: { boulangere: { forgeron: 'époux' }, forgeron: { boulangere: 'épouse', fillette: 'belle-fille' }, fillette: { forgeron: 'beau-père' } },
      discussions: [
        { a: 'forgeron', b: 'boulangere', lignes: [['boulangere', 'Tu as encore de la suie sur le nez, Marchal.'], ['forgeron', 'Et toi, de la farine.'], ['boulangere', 'Alors on est assortis. Viens manger.']] },
        { a: 'fillette', b: 'forgeron', lignes: [['fillette', 'Docteur des choses, ma poupée a perdu un bras.'], ['forgeron', 'Encore ? Donne.'], ['fillette', 'Je l’ai un peu aidée à le perdre.'], ['forgeron', 'Je sais.']] },
      ],
    },
  },
  scenes: {
    mine: { titre: 'Quatorze noms', lieu: 'mine', h: 18.6, musique: 'nuit_veilleuse', angle: 2.2,
      gens: [
        { id: 'forgeron', x: 0, z: -0.6, cap: 'dos' },
        { joueur: true, x: 1.6, z: 0.8, cap: 'centre' },
      ],
      paroles: [
        ['', 'L’entrée de la mine, au soir. Des planches clouées par la compagnie, grises de trente hivers.'],
        ['@forgeron', '(Quatre clous. Il les enfonce d’un coup chacun, sans viser.) Voilà, père. Voilà, les autres.', 'coups'],
        ['@forgeron', '(Il lève le marteau, et frappe trois fois sur la plaque. Un temps. Trois fois.)', 'coups'],
        ['', '(Rien. Le vent dans les planches. Puis, très loin sous la terre, trois coups. Un temps. Et plus rien, cette fois, pour de bon.)', 'grondement'],
        ['@forgeron', 'Ils ont lu. (Il remet sa casquette.) On rentre. Il fait froid, ici. Il a toujours fait froid, ici.'],
      ],
      fin: { haut: 'Trois coups, un temps', titre: 'Quatorze noms' } },
    noces: { titre: 'Les noces de la forge', lieu: 'eglise', repli: 'place', h: 11.2, musique: 'village_dimanche', angle: 3.1,
      gens: [
        { id: 'boulangere', x: -0.45, z: 0, cap: 'cam', chemin: { de: [-0.45, -3], a: [-0.45, 0.8], t0: 4, t1: 14 } },
        { id: 'forgeron', x: 0.45, z: 0, cap: 'cam', chemin: { de: [0.45, -3], a: [0.45, 0.8], t0: 4, t1: 14 } },
        { id: 'fillette', x: -1.4, z: 2.2, cap: 'centre' },
        { id: 'cure', x: 0, z: -2.6, cap: 'cam' },
        { id: 'aubergiste', x: 2.4, z: 2.6, cap: 'centre' },
        { id: 'grainetiere', x: -2.6, z: 3.0, cap: 'centre' },
        { id: 'garde', x: 3.2, z: 1.4, cap: 'centre' },
        { joueur: true, x: 1.3, z: 3.2, cap: 'centre' },
      ],
      paroles: [
        ['', 'Un matin de cloches, à {ville}. Sur le parvis, la moitié de la vallée, en habits du dimanche, un jour de semaine.', 'cloche'],
        ['@cure', 'Je vous déclare unis. Et que ceux qui frappent la nuit l’apprennent : cette maison-là a deux verrous, maintenant.'],
        ['@fillette', '(Elle jette une poignée de farine en l’air, faute de riz. Tout le monde éternue. Personne ne la gronde.)'],
        ['@aubergiste', 'À table ! Il y a du ragoût pour un régiment, et je ne compterai pas les truffes !'],
        ['@forgeron', '(Tout bas, à sa femme.) Seize ans.'],
        ['@boulangere', 'Je sais, Marchal. Je comptais ta monnaie lentement.'],
      ],
      fin: { haut: 'Trois coups, un temps', titre: 'Les noces de la forge' } },
  },
});

// ============================================================================ LA PETITE
K18_ARCS.push({
  id: 'fillette', npc: 'fillette', ordre: 3, titre: 'Le monsieur blanc',
  accroche: 'Près du vieux puits, un monsieur tout blanc, sans vraiment de visage, dit à la petite que son papa l’attend en bas. Il veut une réponse.',
  etapes: [
    { id: 'tresors', titre: 'La boîte à sucre', min: 2, jour: 3, label: 'Tu as l’air d’avoir un secret.',
      carnet: 'La petite Aubert a l’air d’avoir un secret. Lui parler.',
      dlg: [
        ['Moi ? Non. Enfin, si. Mais c’est un secret, alors ça compte pas.', 'Tu peux me le dire.'],
        ['Tu le répètes pas à maman ? Croix de bois, croix de fer ?', 'Croix de bois, croix de fer.'],
        ['(Elle ouvre une vieille boîte à sucre au couvercle qui grince : un caillou rond, une plume de geai, une dent, un dessin, un bouton de veste.) Le bouton, c’est papa. Le reste, c’est moi.', 'Et le secret ?'],
        ['Lise dit que le monsieur blanc veut une réponse. Bientôt. Il dit que papa m’attend en bas, dans la maison à l’envers, et qu’il pétrit en chantant ma chanson. Moi, je sais pas quoi répondre. Toi, tu sais : t’es une grande personne.', '…'],
        'Tu peux demander à la dame de la forêt ? Elle sait des choses sur Lise. Plus que moi. Et elle a pas peur des questions.',
      ] },
    { id: 'clochette', titre: 'Une clochette à la cheville', qui: 'guerisseuse', label: 'La petite Aubert et le monsieur blanc',
      carnet: 'Demander à la guérisseuse ce qu’elle sait du « monsieur blanc ».',
      dlg: [
        ['(Elle pose son pilon. Elle ne dit rien pendant si longtemps que vous croyez qu’elle n’a pas entendu.)', 'Il veut une réponse. Bientôt.'],
        ['En soixante-dix, une mère est venue me voir, pour sa petite Lise, qui marchait en dormant vers le vieux puits. Je lui ai donné de quoi dormir une nuit, et une clochette pour la cheville de l’enfant.', 'Et ?'],
        ['Et la mère a dormi. On a retrouvé la clochette sur la margelle. Pas Lise.', '…'],
        '(Elle vous tend une clochette de laiton, sur un cordon neuf.) Pas pour la cheville. Pour toi. Si tu veilles, tu l’entendras sonner avant d’entendre les pas. C’est tout ce que j’ai appris en soixante ans : il ne faut pas que ce soit la mère qui dorme.',
      ],
      don: { k18_clochette: 1 } },
    { id: 'secret', titre: 'Croix de bois, croix de fer', delai: 1, min: 3, label: 'J’ai parlé à la dame de la forêt.',
      carnet: 'Revenir voir la petite. Lui dire, ou pas.',
      dlg: [
        ['Alors ? Elle a dit quoi ? Elle a dit que Lise ment ? Lise ment jamais. Enfin, presque.', '…'],
        'Tu fais ta tête de quand tu vas dire une chose de grande personne.',
      ],
      choix: [
        { k: 'mere', label: 'Je vais en parler à ta mère.', fache: ['fillette', 2],
          dlg: ['T’avais promis ! Croix de bois, croix de fer ! … T’es comme les autres.', '(Elle referme la boîte à sucre, et elle ne vous regarde plus.)'] },
        { k: 'veille', label: 'Je garde le secret. Mais une nuit, je veillerai avec toi.',
          dlg: ['Toute la nuit ? Même quand il fait noir noir ?', 'Alors d’accord. Si t’entends une clochette, c’est que c’est l’heure. Le monsieur blanc vient au vieux puits. Pas au nôtre : à l’autre, le vieux.'] },
      ], defaut: 'mere' },
    { id: 'mere', titre: 'Ce qu’une mère doit savoir', qui: 'boulangere', si: (k) => k.ch('fillette.secret') === 'mere', label: 'C’est au sujet de la petite…',
      carnet: 'Parler à la boulangère du « monsieur blanc ».',
      dlg: [
        ['(Elle écoute sans vous interrompre, ce qui ne lui est jamais arrivé. Ses mains continuent de pétrir toutes seules.)', '…'],
        ['Le monsieur blanc. Doux Jésus. Elle m’en a parlé à quatre ans, et j’ai cru à un rêve de fièvre.', 'Elle ne doit pas dormir seule.'],
        ['Elle ne dormira plus seule. Je mettrai mon matelas en travers de sa porte, comme ma grand-mère faisait contre les loups. Elle me détestera une semaine. Elle me détestera vivante.', 'Elle m’en veut aussi.'],
        'C’est comme ça, les mères, mon chou : on remercie et on en veut dans la même fournée. Merci. Et je vous en veux un peu. Laissez-lui quelques jours.',
      ] },
    { id: 'veille', titre: 'La nuit de la clochette', aller: true, lieu: 'vieux_puits', moment: 'nuit', delai: 1, cine: 'puits',
      si: (k) => k.ch('fillette.secret') === 'veille',
      carnet: 'Veiller une nuit près du vieux puits, avec la clochette.',
      vu: 'Une clochette sonne, quelque part, sans vent. Puis des pieds nus, dans l’herbe mouillée.' },
    { id: 'lise', titre: 'Dire au revoir à Lise', delai: 2, min: 4, label: 'Comment vas-tu ?',
      carnet: 'Revoir la petite, quelques jours après.',
      dlg: (k) => (k.ch('fillette.secret') === 'veille' ? [
        ['Je me souviens pas bien. Je dormais, et puis il y avait l’herbe froide, et ta main. Ta main, elle était chaude.', 'Et le monsieur blanc ?'],
        ['Il a rien dit. Il est resté là-bas, tout grand. Et puis il est parti en marchant à l’envers. Comme s’il rembobinait.', '…'],
        'Lise dit qu’elle peut plus venir, maintenant. Qu’il faut lui dire au revoir, sur sa tombe. Tu viens avec moi ? Il faut des fleurs. Trois. Les morts aiment pas les gros bouquets, ça les gêne.',
      ] : !k.vivant('boulangere') ? [
        ['Je dors avec la lumière, maintenant. Personne a le droit d’éteindre. C’est la règle de la maison.', 'Tu m’en veux encore ?'],
        ['Un petit peu. Pas beaucoup. T’avais raison de vouloir le dire à maman. Elle a eu le temps de savoir.', '…'],
        'Lise dit qu’elle peut plus venir, à cause de la lumière. Il faut lui dire au revoir, sur sa tombe. Tu viens ? Il faut trois fleurs. Pas plus. Les morts aiment pas les gros bouquets.',
      ] : [
        ['Maman dort devant ma porte. Elle ronfle. Comme un ours. Un gros ours qui sent le pain.', 'Tu m’en veux encore ?'],
        ['Un petit peu. Pas beaucoup. Je t’ai mis dans ma boîte quand même. Ton nom, sur un papier. À côté du bouton.', '…'],
        'Lise dit qu’elle peut plus venir, à cause de maman qui ronfle. Il faut lui dire au revoir, sur sa tombe. Tu viens ? Il faut trois fleurs. Pas plus. Les morts aiment pas les gros bouquets.',
      ]) },
    { id: 'aurevoir', titre: 'Trois fleurs', need: { fleur: 3 }, label: 'Les fleurs pour Lise', cine: 'lise',
      carnet: 'Apporter trois fleurs à la petite, pour dire au revoir à Lise.',
      attente: 'Trois fleurs. Pas deux, pas quatre. Trois, c’est le bon chiffre pour les morts.',
      dlg: [
        ['(Elle les compte, deux fois.) Trois. C’est bien. On y va. Tu me tiens la main ? Pas parce que j’ai peur. Pour Lise. Elle aime voir les gens se tenir la main.', 'On y va.'],
      ],
      lettre: { delai: 2, de: 'La petite Aubert', titre: 'Un dessin', texte: '(Un dessin aux crayons de couleur. Une maison, un four qui fume, une grande personne aux bras très longs qui tient une lanterne, une dame ronde qui chante — on voit les notes — et, tout petit, dans un coin, une fille pâle qui fait au revoir de la main.)\n\nEn bas, d’une écriture qui penche :\n« Pour toi. C’est toi qui tiens la lanterne. Lise est contente. Moi aussi. »' },
      don: { k18_dessin: 1 },
      fin: (k) => (k.ch('fillette.secret') === 'veille' ? 'veillee' : 'mere') },
  ],
  fins: {
    veillee: { titre: 'La nuit de la clochette', resume: 'Une nuit, vous avez tenu la main de la petite au bord du vieux puits. Le monsieur blanc est reparti à reculons. Lise a eu ses trois fleurs.',
      salut: ['J’ai rêvé de la clochette, cette nuit. Elle sonnait pour rien. C’était bien, de sonner pour rien.', 'Je garde le secret de la nuit. Même à maman. Croix de bois, croix de fer. Toi aussi, hein ?'] },
    mere: { titre: 'Un matelas en travers de la porte', resume: 'La boulangère dort en travers de la porte de sa fille. La petite vous en a voulu une semaine, et puis elle a mis votre nom dans sa boîte à trésors.',
      salut: ['Maman ronfle toujours devant ma porte. Moi, je dors super bien. Lui dis pas.', 'Je t’en veux plus du tout. Enfin, le mardi un peu.'] },
  },
  rituel: { tous: 7, don: { fleur: 2 }, texte: ['Tiens ! Des fleurs. Deux. Pas trois : trois, c’est pour les morts.', 'J’ai cueilli ça pour toi. Lise a aidé. Enfin, elle a regardé.'] },
  scenes: {
    puits: { titre: 'La nuit de la clochette', lieu: 'vieux_puits', h: 21.3, musique: 'nuit_berceuse', angle: 4.0,
      gens: [
        { id: 'fillette', x: 0, z: 0, cap: 'dos', chemin: { de: [-1.2, 6], a: [0, 1.4], t0: 2, t1: 16 } },
        { look: 'blanc', x: 0.6, z: -9, cap: 'cam', chemin: { de: [0.6, -9], a: [0.6, -14], t0: 30, t1: 44 } },
        { joueur: true, x: -1.0, z: 2.6, cap: 'centre', chemin: { de: [-3.5, 7], a: [-0.7, 2.0], t0: 14, t1: 24 } },
      ],
      paroles: [
        ['', 'Le vieux puits, la nuit. Une clochette sonne, sans vent, à la ceinture de quelqu’un qui ne dort pas.', 'clochette'],
        ['@fillette', '(Elle marche pieds nus dans l’herbe mouillée, en chemise, les yeux ouverts. Elle ne vous voit pas.)'],
        ['', '(Au-delà de la margelle, quelque chose de très grand et de très blanc attend, immobile, sans vraiment de visage.)', 'murmure'],
        ['', '(Vous lui prenez la main. Elle est glacée. Elle s’arrête. La chose blanche penche la tête, comme pour comprendre.)'],
        ['@fillette', '(Tout bas, sans se réveiller.) Pas ce soir, monsieur. Pas ce soir.'],
        ['', '(La chose blanche recule. À reculons, sans se retourner, comme on rembobine un fil.)'],
      ],
      fin: { haut: 'Le monsieur blanc', titre: 'La nuit de la clochette' } },
    lise: { titre: 'Trois fleurs pour Lise', lieu: 'tombe_lise', repli: 'puits_ville', h: 6.4, musique: 'pd_gymnopedie2', angle: 1.2,
      gens: [
        { id: 'fillette', x: -0.3, z: 0.9, cap: 'centre' },
        { joueur: true, x: 0.7, z: 1.4, cap: 'centre' },
        { look: 'lise', x: 0.2, z: -2.4, cap: 'cam' },
      ],
      paroles: [
        ['', 'À l’aube. Une petite tombe que les ronces n’ont jamais prise.'],
        ['@fillette', '(Elle pose les trois fleurs, une par une, en les comptant tout haut.) Une. Deux. Trois. Voilà, Lise. C’est pour dire au revoir.'],
        ['Lise', '(Une petite fille pâle, mouillée, assise sur le bord de la pierre. Elle sourit.) Tu sens le pain chaud. Ça fait longtemps.'],
        ['@fillette', 'Tu reviendras plus ?'],
        (k) => ['Lise', k.ch('fillette.secret') === 'veille' ? 'Non. Ta grande personne a la main chaude. Le monsieur blanc n’aime pas les mains chaudes. (Elle fait au revoir de la main.)' : 'Non. Chez toi, on veille, maintenant. On ne peut plus entrer. C’est bien. (Elle fait au revoir de la main.)'],
        ['', '(Quand le soleil touche la pierre, il n’y a plus que trois fleurs, et la rosée.)'],
      ],
      fin: { haut: 'Le monsieur blanc', titre: 'Trois fleurs pour Lise' } },
  },
});

// ============================================================================ LA GRAINETIÈRE
K18_ARCS.push({
  id: 'grainetiere', npc: 'grainetiere', ordre: 4, titre: 'Quarante citrouilles',
  accroche: 'Pendant quarante ans, Anselme a posé une citrouille sur le seuil de la grainetière, chaque automne, sans un mot. Le seuil est vide, maintenant.',
  etapes: [
    { id: 'seuil', titre: 'Un seuil vide', min: 4, jour: 5, label: 'Votre seuil est bien vide, ce matin.',
      carnet: 'La grainetière regarde son seuil. Lui parler.',
      dlg: [
        ['Vide. Comme tous les automnes, depuis qu’il est parti.', 'Qui ?'],
        ['Anselme. Pendant quarante ans, une citrouille sur mon seuil, chaque automne. Sans un mot, sans une carte. Je les ai toutes mangées, en soupe, en gratin, en confiture, par rage. La dernière, je l’ai gardée jusqu’à ce qu’elle pourrisse.', 'Je peux en faire pousser une.'],
        'Vous ? … Faites. Je ne vous dirai pas merci : on ne remercie pas une citrouille. Posez-la sur le seuil, et partez avant que je vous voie.',
      ] },
    { id: 'citrouille', titre: 'La quarante et unième', need: { citrouille: 1 }, label: 'La citrouille',
      carnet: 'Faire pousser une citrouille, et la porter à la grainetière.',
      attente: 'Une citrouille. Ronde. Pas une courge : je vois la différence d’ici.',
      dlg: [
        ['(Elle regarde la citrouille longtemps. Puis vos mains.)', '…'],
        ['Vous avez ses mains. Ne me regardez pas comme ça : je sais que c’est impossible. Je regarde les mains de tout le monde, c’est mon métier : c’est avec ça qu’on sème.', 'Dites-moi.'],
        ['Il y a eu un petit. À moi, à lui. Né la nuit du neuf mars soixante et onze, sous une lune rouge. Mon père a dit qu’un enfant né cette nuit-là serait compté en trop, et il l’a donné à des charbonniers qui descendaient vers la plaine. Je ne l’ai tenu qu’une nuit. Anselme n’a jamais su.', 'Vous voulez le retrouver.'],
        'Je veux savoir s’il a eu froid. C’est tout. Les charbonniers campaient là-haut, à la charbonnière. Il en reste peut-être une trace. Moi, mes genoux ne montent plus.',
      ] },
    { id: 'charbonniere', titre: 'Une trace à la charbonnière', aller: true, lieu: 'charbonniere', moment: 'jour',
      carnet: 'Chercher une trace des charbonniers de soixante et onze, à la charbonnière.',
      vu: 'Sur une souche noircie, des initiales taillées au couteau et une date : « G. — mars 71 ». En dessous, plus petit, un berceau grossièrement gravé.' },
    { id: 'garnier', titre: 'Ceux de Garnier', qui: 'guerisseuse', label: 'Les charbonniers de soixante et onze',
      carnet: 'Demander à la guérisseuse qui étaient les charbonniers de soixante et onze.',
      dlg: [
        ['« G. » ? Garnier. Les charbonniers de la forêt, c’étaient toujours les Garnier, de père en fils, depuis Mathusalem.', 'Vous les connaissiez ?'],
        ['(Elle se tait. Elle porte la main à son visage, comme pour y chercher quelque chose.) Je connaissais un Garnier. Étienne. Il était revenu, au printemps soixante et onze, avec ses frères. Il n’est pas venu me voir.', 'Et un enfant ?'],
        ['Il a écrit, une fois, depuis Saint-Étienne. Une seule lettre. Il disait qu’ils avaient « un petit de plus, tombé du ciel, qui ne pleure jamais ». Je ne savais pas de quoi il parlait. Je crois que je le sais, maintenant.', '…'],
        'Va voir la postière : elle sait écrire aux mairies d’en bas. Et dis à la grainetière que l’enfant n’a pas eu froid. Les charbonniers ont toujours chaud. C’est leur métier.',
      ] },
    { id: 'ecrire', titre: 'Une lettre pour Saint-Étienne', qui: 'postiere', label: 'Écrire à la mairie de Saint-Étienne',
      carnet: 'Faire écrire la postière à la mairie de Saint-Étienne, au sujet d’un Garnier né en mars soixante et onze.',
      dlg: [
        ['Saint-Étienne ! Une vraie lettre, pour une vraie mairie, avec une vraie réponse ? Asseyez-vous. Non, debout, c’est plus solennel.', 'Un enfant recueilli par les Garnier, en mars soixante et onze.'],
        ['(Elle écrit vite, de sa belle écriture penchée, et relit à voix haute en articulant.) « …un enfant recueilli par la famille Garnier, charbonniers, au printemps 1871… » C’est pour la grainetière, hein ? Ne dites rien. Je ne dirai rien. Pour une fois.', 'Merci.'],
        'Six jours, si les trains sont gentils. La réponse arrivera dans votre boîte. Je la timbrerai moi-même, au retour. Enfin, elle sera déjà timbrée. Je la regarderai très fort.',
      ],
      lettre: { delai: 5, de: 'Mairie de Saint-Étienne, état civil', titre: 'Réponse à votre demande', texte: 'Madame, Monsieur,\n\nEn réponse à votre lettre, nous avons l’honneur de vous faire connaître qu’il figure à nos registres un Jean Garnier, inscrit au printemps 1871 comme « enfant trouvé, recueilli par Garnier, Étienne, charbonnier », sans indication de parents.\n\nLedit Jean Garnier, dit « le Tombé », charbonnier puis contremaître aux mines de Roche-la-Molière, est marié et père de trois enfants. Il demeure rue de la Montat, en notre commune.\n\nVeuillez agréer l’expression de notre considération distinguée.\n\nPour le maire, le secrétaire.' } },
    { id: 'reponse', titre: 'Il n’a pas eu froid', delai: 5, min: 5, label: 'Des nouvelles de Saint-Étienne',
      carnet: 'Attendre la réponse de Saint-Étienne, puis retourner voir la grainetière.',
      dlg: (k) => [
        k.fait('grainetiere.ecrire') ? ['(Elle lit la lettre deux fois. La deuxième fois, ses lèvres bougent.) Jean. Ils l’ont appelé Jean. « Le Tombé. » Contremaître. Trois enfants. Rue de la Montat.', '…']
          : ['On n’a pas pu écrire. Ce n’est rien. Les Garnier l’ont gardé au chaud, la dame de la forêt l’a dit : c’est déjà ça. C’est déjà tout.', '…'],
        ['Trois enfants. Ça me fait… ça me fait grand-mère, {prenom}. À cinquante-huit ans, grand-mère de trois inconnus à Saint-Étienne.', 'Et maintenant ?'],
        'Je lui écris ? Qu’est-ce que je lui dis ? « Pardon, je t’ai donné à des charbonniers parce que mon père comptait les lits » ? Il a sa vie. Une vie chaude.',
      ],
      choix: [
        { k: 'ecrire', label: 'Écrivez-lui. Il a le droit de savoir.', dlg: ['Le droit… Vous avez raison. Il a au moins le droit de me détester. Je lui écris ce soir, avec mon écriture de comptoir. Il saura que je suis une femme qui compte juste.'] },
        { k: 'paix', label: 'Laissez-le en paix. Envoyez-lui des graines.', dlg: ['Des graines… Oui. Les meilleures, celles du tiroir du bas. Un sachet, sans nom. Il les sèmera, ou pas. S’il les sème, quelque chose de moi poussera là-bas, et il ne le saura jamais. Ça me va. Ça me va très bien.'] },
      ], defaut: 'paix' },
    { id: 'jean', titre: 'Un homme sur la route', aller: true, lieu: 'graineterie', moment: 'soir', delai: 5, cine: 'retrouvailles',
      si: (k) => k.ch('grainetiere.reponse') === 'ecrire',
      carnet: 'Quelqu’un doit venir à la graineterie, un soir. Y être.',
      vu: 'Devant la graineterie, un homme d’une quarantaine d’années, le chapeau à la main. Il a des mains de charbonnier.' },
    { id: 'apres', titre: 'Le tiroir du bas', delai: 1, label: (k) => (k.ch('grainetiere.reponse') === 'ecrire' ? 'Alors, Jean ?' : 'Vous avez envoyé les graines ?'),
      carnet: 'Revoir la grainetière.',
      dlg: (k) => (k.ch('grainetiere.reponse') === 'ecrire' ? [
        ['Il est reparti ce matin, par la première voiture. Il reviendra à la Toussaint, avec les petits. Il a dit « madame », tout le temps. Et puis, à la voiture, il a dit autre chose.', 'Quoi ?'],
        ['(Elle ne répète pas le mot. Elle sourit dans le vide, en pesant des lentilles que personne n’a demandées.)', '…'],
        'Il a les mains d’Anselme. Je vous l’avais dit. Les vôtres aussi, un peu. Ne cherchez pas à comprendre : moi, j’ai renoncé. Tenez. Le tiroir du bas. Ne les vendez pas : semez-les.',
      ] : [
        ['Ce matin. Un sachet de citrouilles, des meilleures. Sans nom, sans un mot. Je l’ai porté moi-même à la poste. La petite Pichon n’a rien demandé. C’est un miracle.', 'Et vous ?'],
        ['Moi, je compte. Combien de jours pour qu’un sachet arrive à Saint-Étienne. Combien pour qu’on sème. Combien pour qu’une citrouille lève. Je serai morte avant la troisième récolte, et ce sera très bien.', '…'],
        'Tenez. Le tiroir du bas, pour vous aussi. Ne les vendez pas : semez-les. Et l’automne venu, vous savez sur quel seuil les poser.',
      ]),
      don: { graines_citrouille: 5, graines_melon: 3 },
      fin: (k) => (k.ch('grainetiere.reponse') === 'ecrire' ? 'retrouvailles' : 'graines') },
  ],
  fins: {
    retrouvailles: { titre: 'Le Tombé', resume: 'Jean Garnier, dit « le Tombé », est monté de Saint-Étienne un soir, le chapeau à la main. Il reviendra à la Toussaint, avec trois enfants.',
      salut: ['Jean m’a écrit. Deux lignes. Il fait des fautes. Je les ai corrigées au crayon, et puis j’ai gommé. On ne corrige pas son fils. Si. Un peu.', 'La Toussaint approche. J’ai compté les sacs de lentilles trois fois. Je compte quand j’ai peur. Et quand je suis heureuse, je compte aussi.'],
      lettre: { delai: 4, de: 'Jean Garnier, rue de la Montat', titre: 'À la personne de la vieille ferme', texte: 'Madame, Monsieur,\n\nMa mère (je l’écris, c’est la première fois) m’a dit que c’est vous qui avez trouvé la souche à la charbonnière. Mon père Étienne m’y avait mené une fois, petit, et il m’avait montré le berceau gravé sans rien dire. Je croyais que c’était le mien, et c’était le mien.\n\nJ’ai semé, chez nous, des graines qu’on m’envoyait sans nom depuis des années. Je sais d’où elles viennent, maintenant.\n\nRespectueusement,\nJean Garnier, dit le Tombé.' } },
    graines: { titre: 'Le tiroir du bas', resume: 'Un sachet de graines est parti pour Saint-Étienne, sans nom. Quelque chose d’elle poussera là-bas, et il ne le saura jamais.',
      salut: ['J’ai rêvé d’un champ de citrouilles, à Saint-Étienne. Il n’y a pas de champs, à Saint-Étienne. C’est un rêve, voilà tout.', 'Le tiroir du bas est presque vide. Ce n’est pas grave. Il s’est vidé dans le bon sens.'] },
  },
  rituel: { tous: 7, don: { graines_citrouille: 2 }, texte: ['Tenez. Deux graines de citrouille. Pour le seuil de quelqu’un. Vous saurez lequel.'] },
  monde: {
    retrouvailles: { boutique: { npc: 'grainetiere', vend: [['graines_melon', 18]] } },
    graines: { boutique: { npc: 'grainetiere', vend: [['graines_melon', 18]] } },
  },
  scenes: {
    retrouvailles: { titre: 'Le Tombé', lieu: { bld: 'graineterie' }, repli: 'place', h: 18.7, musique: 'pd_gymnopedie1',
      gens: [
        { id: 'grainetiere', x: 0, z: -0.4, cap: 'cam' },
        { look: 'jean', x: 0.3, z: 2.0, cap: 'dos', chemin: { de: [5.5, 13], a: [0.3, 2.0], t0: 3, t1: 18 } },
        { joueur: true, x: -3.0, z: 3.4, cap: 'centre' },
      ],
      paroles: [
        ['', 'Un soir, devant la graineterie. La grainetière fait sa caisse sur le seuil, comme elle ne l’a jamais fait.'],
        ['', '(Sur la route, un homme monte à pied, le chapeau à la main. Il a les épaules de quelqu’un qui a porté du charbon.)'],
        ['Jean Garnier', 'Bonsoir, madame. On m’a dit que… que vous vendiez des graines de citrouille.'],
        ['@grainetiere', '(Elle repose le crayon. Elle regarde ses mains, longtemps.) Les meilleures sont dans le tiroir du bas. Entrez. Essuyez vos pieds. Tu essuies tes pieds.'],
        ['', '(Il entre. La porte reste ouverte, et on entend, pour la première fois depuis des années, la grainetière rire.)'],
      ],
      fin: { haut: 'Quarante citrouilles', titre: 'Le Tombé' } },
  },
});
