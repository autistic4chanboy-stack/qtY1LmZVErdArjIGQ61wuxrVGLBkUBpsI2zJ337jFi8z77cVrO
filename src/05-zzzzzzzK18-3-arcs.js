// ============================================================================
//  LES RÉCITS DES PROCHES (K18) — 3. LES PONTS, LA MAIRIE, LA POSTE
//  (format : 05-zzzzzzzK18-1-arcs.js)
// ============================================================================

// ============================================================================ LE GARDE
K18_ARCS.push({
  id: 'garde', npc: 'garde', ordre: 9, titre: 'Un chien pour la guérite',
  accroche: 'Le garde voudrait un chien : un gros, qui aboie pour un rien. Comme ça, la nuit, c’est lui qui aurait peur, et le garde n’aurait plus qu’à le rassurer.',
  finDefaut: 'courage',
  etapes: [
    { id: 'chien', titre: 'Trois nuits sans dormir', min: 2, jour: 3, label: 'Vous avez l’air fatigué.',
      carnet: 'Le garde a l’air épuisé. Lui parler.',
      dlg: [
        ['Fatigué ? Moi ? Je suis frais comme un… comme un garde. (Il bâille.) Trois nuits sans dormir.', 'Les pas, sur le pont ?'],
        ['Les pas, sur le pont sud. Je les compte. Quarante-deux pour monter, quarante-deux pour descendre. Si j’avais un chien, c’est lui qui les entendrait, et moi je n’aurais qu’à lui dire « tout doux ». Je saurais très bien dire « tout doux ».', 'Prenez un chien.'],
        'Le maire dit que les chiens sont interdits à la guérite. Article douze. Vous voulez bien lui demander, vous ? Moi, devant lui, je dis « oui, monsieur le maire » avant même qu’il ait parlé.',
      ] },
    { id: 'article', titre: 'L’article douze', qui: 'maire', label: 'Un chien pour le garde',
      carnet: 'Demander au maire si le garde peut avoir un chien à la guérite.',
      dlg: [
        ['Un chien ? À la guérite ? L’article douze de l’arrêté de cinquante-quatre est formel : « aucun animal domestique ne… » (Il s’arrête.) Vous savez quoi ? Je l’ai écrit, l’article douze. Enfin, mon grand-père. Ce qui revient au même, dans cette famille.', '…'],
        '(Il prend sa plume et rature quelque chose dans un registre, en tirant la langue.) Voilà. Les chiens sont autorisés à la guérite, « à condition qu’ils aboient pour la commune ». Dites-le-lui. Et dites-lui de ne pas me remercier : je ne saurais pas quoi faire de ma figure.',
      ] },
    { id: 'portee', titre: 'Une portée au ranch', qui: 'eleveuse', label: 'Un chiot pour le garde ?',
      carnet: 'Trouver un chiot. L’éleveuse a peut-être une portée.',
      dlg: [
        ['Un chiot pour {npc:garde} ? (Elle rit.) Il a peur des poules ! … Bon. J’ai une portée sous l’appentis, des bâtards de berger, gros comme des pains de six livres. Prenez le plus bête. C’est celui qui aboiera le plus.', 'Merci.'],
        '(Elle vous met dans les bras une boule de poils qui sent le lait et la paille.) Il mange tout, il a peur de rien, il pisse partout. Comme un garde, quoi. Enfin, pas comme celui-là.',
      ],
      don: { k18_chiot: 1 } },
    { id: 'nom', titre: 'Comment l’appeler', delai: 0, min: 3, need: (k) => (k.fait('garde.portee') ? { k18_chiot: 1 } : null), label: 'Un chiot, pour la guérite',
      carnet: 'Porter le chiot au garde.',
      attente: 'Un chiot ? Où ça ? (Il regarde vos mains vides, puis derrière vous, plein d’espoir.)',
      dlg: (k) => [
        k.fait('garde.portee') ? ['Pour moi ? Un… pour moi ? (Il le prend comme on prend un nouveau-né, ou une grenade.) Il est chaud. Il est tout chaud.', 'Il faut un nom.']
          : ['(Un chien jaune, tout jeune, est assis devant la guérite. Le colporteur l’a laissé là, dit-il, « en paiement d’un passage ».) Il est à moi, maintenant. Réglementairement. Il est chaud.', 'Il faut un nom.'],
        'Un nom. Un nom de chien de garde. Un nom qui fait peur. Ou un nom qui rassure. Aidez-moi, moi je ne trouve que des numéros de régiment.',
      ],
      choix: [
        { k: 'courage', label: '« Courage ».', dlg: ['Courage. (Il le dit tout bas, puis plus fort.) Courage ! … Il a remué la queue. Il sait déjà son nom. Moi, j’ai mis vingt ans à savoir le mien.'] },
        { k: 'yves', label: '« Yves ». Ça lui va bien.', dlg: ['Yves. (Il devient tout pâle.) Pourquoi Yves ? … Non. Ne dites rien. C’est un bon nom. C’est un bon nom pour quelqu’un qu’on a le droit de garder.'] },
      ], defaut: 'courage' },
    { id: 'quivive', titre: 'Qui vive', delai: 1, min: 5, si: (k) => k.ch('garde.nom') === 'yves', label: 'Comment va Yves ?',
      carnet: 'Demander au garde des nouvelles du chien.',
      dlg: [
        ['Il dort contre ma botte. Il ronfle. (Il le regarde.) Il faut que je vous dise pourquoi j’ai pâli.', 'Je vous écoute.'],
        ['À Madagascar, une nuit de faction, les herbes ont bougé devant le poste. J’ai crié « Qui vive ? » une fois. Une seule. J’avais trop peur pour attendre la réponse, et j’ai tiré.', '…'],
        'C’était Yves Le Goff. Un petit Breton de dix-neuf ans, sorti vomir sa fièvre en silence pour ne réveiller personne. Je n’ai jamais dit son nom à voix haute, depuis. Maintenant, je le dis cinquante fois par jour, et il remue la queue.',
      ],
      cine: 'quivive' },
    { id: 'motdepasse', titre: 'Mon grand', delai: 2, min: 6, label: 'Les nuits sont plus calmes ?',
      carnet: 'Revoir le garde, quelques nuits plus tard.',
      dlg: (k) => [
        ['Calmes ? Le chien aboie pour la commune, comme le dit l’article douze. Mais…', 'Mais ?'],
        ['Il y a un mot de passe, à la guérite. Je dis à tout le monde qu’il n’y en a pas. C’est « mon grand », comme dans les lettres de ma mère. Trois fois cette année, à travers la porte, quelqu’un me l’a donné. Avec sa voix.', '…'],
        'Le chien grogne, quand elle vient. Il grogne et il remue la queue en même temps. Je ne sais pas ce que ça veut dire. Dites-moi ce que je dois faire, vous qui n’avez peur de rien.',
      ],
      choix: [
        { k: 'jamais', label: 'N’ouvrez jamais. Ce n’est pas elle.', fin: 'courage', dlg: ['Pas elle. Non. Ce n’est pas elle. (Il le répète comme un article de règlement.) Je n’ouvrirai pas. Le chien dormira contre la porte. Il a plus de courage que moi, et moins d’imagination.'] },
        { k: 'repondre', label: 'Répondez-lui, sans ouvrir. Dites-lui au revoir.', fin: 'adieu', dlg: ['Répondre… à travers la porte. Lui dire que sa lettre est arrivée, quand même, « retour à l’envoyeur ». Que je l’ai lue. … Oui. La prochaine fois. Et ensuite je n’ouvrirai pas, et elle ne reviendra plus. Je crois que c’est ça qu’elle veut. Je crois que c’est ça, une mère.'],
          lettre: { delai: 2, de: 'Le garde des ponts', titre: 'Rapport de nuit', texte: 'Rapport de nuit. Pont nord. Trois heures dix.\n\nUne voix a donné le mot de passe à travers la porte de la guérite. Le garde soussigné n’a pas ouvert, conformément au règlement.\n\nLe garde soussigné a répondu, ce qui n’est pas prévu au règlement. Il a dit : « Ta lettre est arrivée, maman. Je l’ai lue. » La voix a dit : « C’est bien, mon grand. » Puis plus rien.\n\nChien : calme. Garde : calme. Pour la première fois.\n\nFin du rapport. (Je l’envoie à vous et pas au préfet. Le préfet ne répond jamais.)' } },
      ], defaut: 'jamais' },
  ],
  fins: {
    courage: { titre: 'Un chien pour la commune', resume: 'Un chien dort contre la porte de la guérite et aboie pour la commune, comme le veut l’article douze. Le garde n’ouvre pas. Il dort, un peu.',
      salut: (k) => [k.ch('garde.nom') === 'yves' ? 'Yves a aboyé trois fois, cette nuit. Pour un hérisson. Je lui ai dit « tout doux ». Je dis très bien « tout doux ».' : 'Courage a aboyé trois fois, cette nuit. Pour un hérisson. Je lui ai dit « tout doux ». Je dis très bien « tout doux ».', 'Je dors deux heures d’affilée, maintenant. Le chien veille. C’est réglementaire.'] },
    adieu: { titre: 'Mon grand', resume: 'Le garde a répondu à la voix, à travers la porte, sans ouvrir : « Ta lettre est arrivée, maman. » La voix a dit « c’est bien, mon grand », et n’est plus revenue.',
      salut: ['Elle n’est plus revenue. Je ne sais pas si je suis triste. Je note « calme », dans le rapport. C’est le mot le plus proche.', 'Le chien ne grogne plus, la nuit. Il dort sur le dos. Il a confiance. Moi aussi, un peu.'] },
  },
  rituel: { tous: 8, don: { bougie: 2 }, texte: ['Pour vos nuits. Deux bougies réglementaires. Le règlement n’existe pas, mais les bougies, si.'] },
  scenes: {
    quivive: { titre: 'Qui vive', lieu: 'pont_nord', h: 21.4, musique: 'nuit_claire', angle: 4.6,
      gens: [
        { id: 'garde', x: 0, z: 0, cap: 'dos' },
        { joueur: true, x: 1.4, z: 2.2, cap: 'centre' },
      ],
      paroles: [
        ['', 'Le pont nord, la nuit. Le garde fait sa ronde, sa lanterne à la main, et un chiot dans les bras, faute de savoir le faire marcher au pas.'],
        ['@garde', '(Les herbes bougent, de l’autre côté du fossé. Il lève la lanterne.) Qui vive ?', 'murmure'],
        ['', '(Rien. Le vent. Le chiot dresse une oreille.)'],
        ['@garde', '(Il attend. Longtemps. Il ne pose pas la main sur la hallebarde.) … Qui vive ?'],
        ['', '(De l’autre côté, une petite voix, avec un accent de la mer, très loin : « Ami. » Puis plus rien. Les herbes se couchent, comme si quelqu’un s’était assis.)'],
        ['@garde', '(Il se mouche bruyamment.) Ami. Bien. Passez. Passez, Yves.'],
      ],
      fin: { haut: 'Un chien pour la guérite', titre: 'Qui vive' } },
  },
});

// ============================================================================ LE MAIRE
K18_ARCS.push({
  id: 'maire', npc: 'maire', ordre: 10, titre: 'L’arrêté sans date',
  accroche: 'Le maire garde dans la poche de son gilet un arrêté sans date ni signature. Il signera, dit-il, le soir où les enfants joueront sur la place après le coucher du soleil.',
  finDefaut: 'poche',
  etapes: [
    { id: 'recensement', titre: 'Le compte qui ne tombe pas juste', min: 3, jour: 4, label: 'Vous avez l’air préoccupé, monsieur le maire.',
      carnet: 'Le maire a l’air préoccupé. Lui parler.',
      dlg: [
        ['Préoccupé ? Je suis maire, {fermier}. « Préoccupé » est mon état civil.', 'Qu’y a-t-il ?'],
        'Le recensement ne tombe pas juste. Un habitant de trop, au hameau. Je recompte depuis trois jours. Vous voulez bien aller compter les lits du hameau, vous ? On vous ouvrira : on vous aime bien. Moi, on me cache les enfants.',
      ] },
    { id: 'hameau', titre: 'Compter les lits', aller: true, lieu: 'hameau', moment: 'jour',
      carnet: 'Aller compter les maisons et les lits du hameau, de jour.',
      vu: 'Vous comptez les fenêtres, les cheminées, les lits qu’on vous laisse voir. Le compte tombe juste. Pourtant, en partant, vous croisez une femme en manteau gris que personne ne salue.' },
    { id: 'manteau', titre: 'Un manteau gris', min: 4, label: 'Le compte tombe juste. Mais…',
      carnet: 'Rendre compte au maire.',
      dlg: [
        ['Juste ? Ah ! La commune respire. Mais ? Il y a un « mais ». Il y a toujours un « mais », c’est le mot préféré des administrés.', 'Une femme en manteau gris.'],
        ['Un manteau gris ? (Il pose sa plume.) Vous êtes sûr ? Gris comment ? Gris souris, gris perle, gris… gris comme une patère ?', '…'],
        ['Hélène avait un manteau gris. Le matin où elle est partie, il pendait encore à la patère. Elle est partie sans. En octobre. Qui part sans son manteau, en octobre ?', '…'],
        '(Il se ressaisit, très vite.) Pardon. Le registre dit « départ volontaire ». C’est moi qui l’ai écrit. Je dois respecter le registre. Sinon, qui le fera ?',
      ] },
    { id: 'lettre', titre: 'Rien pour vous, mon oncle', qui: 'postiere', delai: 1, minQui: 4, label: 'Le maire parle d’un manteau gris.',
      carnet: 'La postière est la nièce du maire. Lui parler du manteau gris.',
      dlg: [
        ['(Elle devient très pâle, puis très rouge, ce qui chez elle prend une demi-seconde.) Il vous a parlé du manteau. Il ne parle jamais du manteau.', '…'],
        ['Je vais vous dire une chose que je n’ai dite à personne, et vous allez me détester. Trois jours après cette nuit d’octobre, une lettre sans timbre est arrivée dans le sac. De l’écriture de ma tante. Pour mon oncle.', 'Vous l’avez ouverte.'],
        ['Elle dit qu’elle n’est pas partie : qu’elle est descendue. Qu’on l’appelait du fond du vieux puits, et qu’elle a répondu. Et en bas, souligné deux fois : « Surtout, qu’il ne vienne pas me chercher. »', '…'],
        'Je ne la lui ai jamais donnée : il y serait allé le soir même. Chaque dimanche, il me demande pour rire s’il y a du courrier pour lui. (Elle sort une enveloppe jaunie de son corsage.) Dites-moi ce que je dois en faire. Je n’en peux plus de répondre « rien ».',
      ],
      choix: [
        { k: 'donner', label: 'Donnez-la-lui. C’est sa lettre.', don: { k18_lettre_helene: 1 }, dlg: ['Sa lettre. Oui. Le règlement le dit, d’ailleurs : « toute correspondance sera remise à son destinataire ». Avec vingt ans de retard, mais remise. (Elle vous tend l’enveloppe.) Vous. Moi, je n’y arriverai pas.'] },
        { k: 'bruler', label: 'Brûlez-la. Elle demandait qu’il ne vienne pas.', dlg: ['« Qu’il ne vienne pas. » C’est ce qu’elle voulait. … (Elle ouvre le poêle.) Je la brûle. Et vous ne le saurez jamais, mon oncle. Et vous, vous le saurez toujours. Pardon de vous avoir donné ça à porter.'] },
      ], defaut: 'perdue' },
    { id: 'remise', titre: 'Toute correspondance', delai: 0, need: { k18_lettre_helene: 1 }, si: (k) => k.ch('maire.lettre') === 'donner', label: 'Il y a du courrier pour vous.',
      carnet: 'Remettre au maire la lettre d’Hélène.',
      attente: 'Du courrier ? Vous plaisantez comme ma nièce, le dimanche.',
      dlg: [
        ['Du courrier ? Pour moi ? (Il rit.) Ma nièce vous a eu, avec sa blague du dimanche…', '(Lui tendre l’enveloppe.)'],
        ['(Il reconnaît l’écriture. Il s’assoit. Il lit. Il relit. Il plie la lettre en quatre, puis en huit, et la glisse dans la poche de son gilet, du côté du cœur, à côté d’un autre papier.)', '…'],
        ['« Qu’il ne vienne pas me chercher. » Vingt ans que je cherche. Dans le registre, dans le lac, dans la tour. Elle était juste… en dessous.', 'Qu’allez-vous faire ?'],
        'Ce soir, j’irai au vieux puits. Pas pour descendre : pour lui répondre. Venez. Si je me penche trop, tirez-moi par l’écharpe. Elle est solide : c’est de la soie de la République.',
      ] },
    { id: 'puits', titre: 'Au vieux puits', aller: true, lieu: 'vieux_puits', moment: 'nuit', si: (k) => k.fait('maire.remise'), cine: 'puits_maire',
      carnet: 'Retrouver le maire au vieux puits, la nuit.',
      vu: 'Il est là, l’écharpe tricolore sur son manteau, penché sur la margelle, une lanterne à la main.' },
    { id: 'arrete', titre: 'L’arrêté sans date', delai: 2, min: 6, label: 'Monsieur le maire ?',
      carnet: 'Revoir le maire, quelques jours plus tard.',
      dlg: (k) => [
        k.fait('maire.puits') ? ['Je lui ai répondu. Dans le puits. Je lui ai dit que je ne viendrais pas, puisqu’elle le demandait, et que je l’aimais, puisque je le pensais. L’eau n’a rien répondu. C’est sa façon.', '…']
          : ['Je repense à ce manteau gris. Je crois que je ne saurai jamais. Je crois que c’est le métier de maire : tenir le registre de ce qu’on ne saura jamais.', '…'],
        ['(Il sort de son gilet un papier plié, tout usé.) L’arrêté. Article unique : l’arrêté du 3 mars 1854 est abrogé. Il n’y manque que la date et ma signature. Je me suis promis de signer le soir où les enfants joueraient sur la place après le coucher du soleil.', 'Et ?'],
        k.vivant('fillette') ? 'Hier soir, la petite Aubert jouait à la marelle sur la place, après le coucher du soleil, et sa mère l’a appelée sans crier. Sans crier, {prenom}. Alors je vous le demande : est-ce que je signe ?'
          : 'Il n’y a plus d’enfant dans cette ville, {prenom}. Plus un seul. Alors je vous le demande : est-ce que je signe quand même ?',
      ],
      choix: [
        { k: 'signer', label: 'Signez-le. Ce soir, sur la place.', cine: 'arrete', dlg: ['Ce soir ? Mais les ponts… mais le règlement… (Il se tait.) Ce soir. Sur la place. Devant tout le monde. J’y ajouterai un article, par prudence : les ponts se lèveront encore, tant que le garde aura peur. C’est ça, la sagesse administrative.'] },
        { k: 'attendre', label: 'Gardez-le encore. Le temps n’est pas venu.', fin: 'poche', dlg: ['Pas encore. Vous avez raison. Il y a encore des nuits rouges, et des gens qui frappent. Je le garde du côté du cœur. Un jour, quelqu’un le signera, moi ou un autre. Ce sera un beau jour pour la commune.'] },
      ], defaut: 'attendre', finSaut: 'poche' },
    { id: 'present', titre: 'Vasseur, fils', delai: 2, min: 7, si: (k) => k.ch('maire.arrete') === 'signer', label: 'Que comptez-vous, maintenant ?',
      carnet: 'Revoir le maire, après la signature.',
      dlg: [
        ['Moi. Je me suis compté, hier soir, au registre du tiroir. « Vasseur, {nom}, cinquante-huit ans. Présent. » J’ai mis « présent », comme à l’école.', '…'],
        ['Mon père a écrit, une nuit de cinquante-neuf : « Vasseur, fils. Sept ans. » Il ne l’a jamais rayé. Je l’ai rayé, moi, hier soir. D’un trait. Et j’ai écrit à côté : « Revenu. »', 'Revenu.'],
        'Tenez. Une médaille de la commune. Je l’avais fait frapper pour le préfet, qui ne vient jamais. Vous êtes venu{e}, vous.',
      ],
      don: { k18_medaille: 1 }, argent: 100, fin: 'signe' },
  ],
  fins: {
    signe: { titre: 'Présent', resume: 'Le maire a signé l’arrêté sans date, un soir, sur la place, devant tout le monde (avec un article de prudence pour les ponts). Il s’est inscrit au registre : « Présent. »',
      salut: ['J’ai fait un discours de trois mots, l’autre soir. Le plus beau de ma carrière. On m’a applaudi. Pour de vrai, cette fois.', 'La petite Aubert m’a appris la marelle. J’ai perdu. J’ai fait un arrêté pour contester. Elle l’a déchiré. C’est la démocratie.'],
      lettre: { delai: 1, de: 'Mairie de {ville}', titre: 'Extrait du registre des délibérations', texte: 'Séance du soir, sur la place.\n\nPrésents : la commune.\n\nLe maire a donné lecture d’un arrêté portant abrogation de l’arrêté du 3 mars 1854, sous réserve que les ponts continueront d’être levés à la nuit tant que le garde le jugera bon.\n\nL’arrêté est adopté à l’unanimité des présents, moins une voix, celle du garde, qui s’est abstenu « par prudence ».\n\nLe maire tient à porter au registre que la personne de la vieille ferme était présente, et que sans elle, il n’aurait pas signé.\n\nPour extrait conforme.' } },
    poche: { titre: 'Du côté du cœur', resume: 'L’arrêté sans date est toujours dans la poche du gilet du maire, du côté du cœur. Un jour, quelqu’un le signera.',
      salut: ['Je l’ai toujours sur moi, vous savez. L’arrêté. Il s’use. Je le recopierai, le jour où il ne sera plus lisible. Ou je le signerai. On verra lequel vient d’abord.'] },
  },
  rituel: { tous: 9, don: { vin: 1 }, texte: ['Une bouteille de la cave municipale. Ne demandez pas comment la commune a une cave. Je ne le sais pas moi-même.'] },
  scenes: {
    puits_maire: { titre: 'Une réponse dans le puits', lieu: 'vieux_puits', h: 21.6, musique: 'nuit_veilleuse', angle: 2.7,
      gens: [
        { id: 'maire', x: 0, z: -0.2, cap: 'dos' },
        { joueur: true, x: 1.2, z: 2.0, cap: 'centre' },
      ],
      paroles: [
        ['', 'Le vieux puits, la nuit. Un homme en écharpe tricolore, penché sur la margelle, une lanterne au bout du bras.'],
        ['@maire', 'Hélène. C’est moi. J’ai reçu ta lettre. Avec un peu de retard. Vingt ans. La poste de {ville} est ce qu’elle est.'],
        ['@maire', 'Je ne viendrai pas. Puisque tu le demandes. Je ne t’ai jamais rien refusé, tu le sais. Même pas ça.', 'murmure'],
        ['', '(Très loin, au fond, un bruit d’eau, comme quelqu’un qui pose une tasse dans une soucoupe.)'],
        ['@maire', '(Il se redresse. Il ôte l’écharpe, la plie, la remet.) Bien. Bien. La séance est levée.'],
      ],
      fin: { haut: 'L’arrêté sans date', titre: 'Une réponse dans le puits' } },
    arrete: { titre: 'L’arrêté', lieu: 'place', h: 19.3, musique: 'village_volets', angle: 0.4,
      gens: [
        { id: 'maire', x: 0, z: 0, cap: 'cam' },
        { id: 'fillette', x: -2.0, z: 2.2, cap: 'centre', chemin: { de: [-3.2, 3.0], a: [-1.4, 1.6], t0: 6, t1: 20 } },
        { id: 'boulangere', x: -2.8, z: 3.2, cap: 'centre' },
        { id: 'postiere', x: 1.5, z: 1.8, cap: 'centre' },
        { id: 'garde', x: 2.6, z: 0.6, cap: 'centre' },
        { id: 'cure', x: 1.2, z: -1.4, cap: 'cam' },
        { id: 'aubergiste', x: 3.0, z: 2.6, cap: 'centre' },
        { joueur: true, x: -0.6, z: 3.6, cap: 'centre' },
      ],
      paroles: [
        ['', 'Le soir, sur la place de {ville}. Le soleil vient de se coucher, et personne ne rentre.'],
        ['@maire', 'Mes chers administrés. J’avais préparé un discours de quarante minutes. (Il le déchire.) Je vais faire court.'],
        ['@maire', '(Il signe, sur une table de café. La plume grince. Il date. Il relit. Il lève les yeux.) Restez dehors.', 'cloche'],
        ['@fillette', '(Elle saute à cloche-pied dans la marelle, au crépuscule, et personne ne la rappelle.)'],
        ['@garde', '(Tout bas.) Je lèverai quand même les ponts à neuf heures, monsieur le maire.'],
        ['@maire', 'Je sais, garde. C’est l’article deux. Je l’ai écrit pour vous.'],
      ],
      fin: { haut: 'L’arrêté sans date', titre: 'Présent' } },
  },
});

// ============================================================================ LA POSTIÈRE
K18_ARCS.push({
  id: 'postiere', npc: 'postiere', ordre: 11, titre: 'Au dos de la feuille de route',
  accroche: 'Depuis six ans, la postière s’écrit avec le receveur de la gare, dans la marge des feuilles de route. Elle ne l’a jamais vu. Elle n’a jamais passé le pont sud.',
  finDefaut: 'marge',
  etapes: [
    { id: 'marge', titre: 'Dans la marge', min: 3, jour: 6, label: 'Vous souriez à une feuille de route ?',
      carnet: 'La postière sourit toute seule à son guichet. Lui parler.',
      dlg: [
        ['Je ne souris pas ! Je… vérifie l’oblitération. Avec les lèvres. C’est une technique.', 'Bien sûr.'],
        ['Bon. Chaque sac arrive avec sa feuille de route, signée par le receveur de la gare d’en bas. Il y a six ans, au dos, au crayon : « Il fait beau, chez vous ? » J’ai répondu dessous. Depuis, on s’écrit dans la marge.', 'Qui est-ce ?'],
        ['Il s’appelle Octave. Il a une écriture de premier prix, et il fait des fautes exprès pour que je les corrige. Je ne l’ai jamais vu. Personne n’a jamais vu qui apporte le sac, d’ailleurs : il est sur la borne du pont sud, à l’aube, et c’est tout.', '…'],
        'Vous voulez bien guetter, vous ? Un matin. Voir qui pose le sac. Moi, j’ai essayé, mais j’arrive toujours après.',
      ] },
    { id: 'borne', titre: 'La borne du pont sud', aller: true, lieu: 'pont_sud', moment: 'aube',
      carnet: 'Guetter, à l’aube, au pont sud, qui pose le sac du courrier.',
      vu: 'Le sac est déjà là, sur la borne, humide de rosée. Personne sur la route, à perte de vue. Mais dans la boue, des traces de roues, et les sabots de deux chevaux, qui s’arrêtent net au bord du pont.' },
    { id: 'invitation', titre: 'Deux chevaux gris', min: 4, label: 'Il n’y avait personne.',
      carnet: 'Dire à la postière ce que vous avez vu au pont sud.',
      dlg: [
        ['Personne. Bien sûr. (Elle range un timbre qui était déjà rangé.) Des traces de deux chevaux ? Gris, je parie. Papa avait deux chevaux gris.', '…'],
        ['Octave m’a écrit, dans la marge de ce matin. Il m’invite à la gare. Un dimanche. Il dit qu’il mettra sa casquette neuve, et qu’il me reconnaîtra « à la sacoche ».', 'Et vous ?'],
        'La gare, c’est deux jours de route. Par la grand-route. Celle où la voiture jaune est rentrée sans papa. Je n’ai jamais passé le pont sud, depuis.',
      ],
      choix: [
        { k: 'partir', label: 'Allez-y. La route vous doit bien ça.', dlg: ['La route me doit… (Elle rit, un peu trop haut.) Oui. Elle me doit un père, un dimanche, et un receveur à casquette neuve. Je pars après-demain. Le courrier attendra. Il a l’habitude.'] },
        { k: 'monter', label: 'Écrivez-lui de monter, lui.', dlg: ['De monter ? Ici ? Dans la vallée où l’on lève les ponts et où l’eau parle ? … Il est receveur, il n’a peur de rien, il me l’a écrit. On verra bien s’il a peur des ponts. Je lui réponds dans la marge de demain.'] },
      ], defaut: 'monter' },
    { id: 'route', titre: 'La voiture jaune', delai: 2, si: (k) => k.ch('postiere.invitation') === 'partir', label: 'Prête pour la route ?',
      carnet: 'La postière part pour la gare. Aller lui dire au revoir.',
      dlg: [
        ['Prête. J’ai mis ma robe des dimanches, et ma sacoche, pour qu’il me reconnaisse. Je n’ai rien dedans. C’est la première fois de ma vie que je pars avec une sacoche vide.', 'Revenez.'],
        'Si je ne suis pas revenue dans une semaine, ne cherchez pas de trompe pendue à une branche. Cherchez plutôt un receveur à casquette.',
      ],
      voyage: ['postiere', 5], cine: 'voiture' },
    { id: 'gare', titre: 'La gare', delai: 5, si: (k) => k.fait('postiere.route'), label: 'Alors, la gare ?',
      carnet: 'La postière est sur la route. À son retour, aller la voir.',
      dlg: [
        ['Il était là. Casquette neuve, des oreilles comme des anses de soupière, et des mains qui tremblaient plus que les miennes.', 'Et ?'],
        ['On a parlé deux jours. De lettres, évidemment. Il connaît par cœur toutes mes réponses dans la marge. Moi aussi, les siennes. On s’est récité nos lettres comme des fables.', '…'],
        'Il demande sa mutation au bureau de {ville}. Ça prendra un an, l’administration. Un an, ce n’est rien. J’ai attendu six ans dans une marge.',
      ],
      lettre: { delai: 3, de: 'Octave Fayolle, receveur à la gare', titre: 'Au dos d’une feuille de route', texte: '(Au dos d’une feuille de route, au crayon, d’une écriture de premier prix.)\n\nÀ la personne de la vieille ferme, qui a fait passer le pont à Mlle Pichon.\n\nJe vous remercie. Elle a corrigé trois fautes dans ma demande de mutation. Je les avais faites exprès. Elle le sait.\n\nIl fait beau, chez vous ?\n\nO. F.' },
      don: { k18_timbre: 1 }, fin: 'gare' },
    { id: 'pont', titre: 'Un homme en casquette neuve', aller: true, lieu: 'pont_sud', moment: 'soir', delai: 3, cine: 'octave',
      si: (k) => k.ch('postiere.invitation') === 'monter',
      carnet: 'Quelqu’un doit monter de la gare, un soir. Être au pont sud.',
      vu: 'Sur la grand-route, un homme en casquette neuve monte vers le pont sud, une valise à la main. Il s’arrête au bord du tablier, comme les chevaux.' },
    { id: 'noel', titre: 'Il reviendra à Noël', delai: 1, si: (k) => k.fait('postiere.pont'), label: 'Il est monté !',
      carnet: 'Revoir la postière.',
      dlg: [
        ['Il est monté ! Il a traversé le pont, il a regardé le lac, il a dit « tiens, l’eau fait un drôle de bruit », et je l’ai tiré par la manche avant qu’il écoute.', 'Et maintenant ?'],
        ['Il est reparti ce matin, par la première voiture. Il revient à Noël. Il a demandé si la poste de {ville} avait besoin d’un second receveur. Je lui ai dit que la poste de {ville} avait besoin de beaucoup de choses.', '…'],
        'Tenez. Le premier timbre de mon carnet des bonnes nouvelles. Je l’ai décollé pour vous. Il me reste la page.',
      ],
      don: { k18_timbre: 1 }, fin: 'noel' },
  ],
  fins: {
    gare: { titre: 'La gare', resume: 'La postière a passé le pont sud, pour la première fois depuis la voiture jaune. À la gare, un receveur à casquette neuve l’a reconnue à la sacoche. Il demande sa mutation.',
      salut: ['Il m’a écrit dans la marge, ce matin : « Plus que onze mois. » J’ai répondu : « Dix et vingt-neuf jours. » Je corrige toujours.', 'J’ai passé le pont sud ! Je le dis à tout le monde. Ils me regardent comme si j’avais traversé la mer.'] },
    noel: { titre: 'Il reviendra à Noël', resume: 'Octave est monté de la gare, un soir, en casquette neuve. Il a passé le pont, il a écouté l’eau une seconde de trop. Il reviendra à Noël.',
      salut: ['Noël approche. J’ai compté les jours dans la marge. Il compte aussi. On ne tombe jamais sur le même chiffre : c’est notre façon de nous disputer.', 'Le carnet des bonnes nouvelles a une page de plus. Elle est presque pleine.'] },
    marge: { titre: 'Dans la marge', resume: 'La postière et le receveur s’écrivent toujours dans la marge des feuilles de route. Ce n’est pas rien : c’est six ans de « il fait beau chez vous ».',
      salut: ['Toujours rien pour vous. Mais pour moi, si : trois lignes, au crayon. C’est beaucoup, trois lignes.'] },
  },
  rituel: { tous: 8, don: { plume: 2 }, texte: ['Deux plumes, pour écrire. Écrivez à quelqu’un. N’importe qui. Ça fait arriver des choses.'] },
  scenes: {
    voiture: { titre: 'La voiture jaune', lieu: 'pont_sud', h: 5.9, musique: 'pres_matin', angle: 3.0,
      gens: [
        { id: 'postiere', x: 0, z: 0, cap: 'dos', chemin: { de: [0, 2], a: [-0.6, -24], t0: 9, t1: 30 } },
        { joueur: true, x: 1.2, z: 3.4, cap: 'centre' },
      ],
      paroles: [
        ['', 'À l’aube, au pont sud. Une jeune femme en robe des dimanches, une sacoche vide à l’épaule, s’arrête au bord du tablier.'],
        ['@postiere', 'Papa passait ici tous les jeudis. Il sonnait de la trompe en arrivant, et toute la vallée sortait sur la route.'],
        ['@postiere', '(Elle met deux doigts dans sa bouche et siffle, très fort, très faux. Quelque part, un chien répond.) Voilà. Comme ça, on sait que je pars.'],
        ['', '(Elle traverse. Au milieu du pont, elle se retourne une seule fois, et elle fait au revoir avec la sacoche.)'],
      ],
      fin: { haut: 'Au dos de la feuille de route', titre: 'La voiture jaune' } },
    octave: { titre: 'Un homme en casquette neuve', lieu: 'pont_sud', h: 18.9, musique: 'pres_chemin', angle: 3.0,
      gens: [
        { id: 'postiere', x: -0.5, z: 0.2, cap: 'dos' },
        { look: 'octave', x: 0.4, z: -1.2, cap: 'cam', chemin: { de: [0.5, -22], a: [0.4, -1.2], t0: 2, t1: 18 } },
        { joueur: true, x: 1.6, z: 3.2, cap: 'centre' },
      ],
      paroles: [
        ['', 'Le soir, au pont sud. Sur la grand-route, un homme monte à pied, une valise à la main, et une casquette si neuve qu’elle brille.'],
        ['Octave', '(Il s’arrête au bord du tablier, comme les chevaux. Il ôte sa casquette.) Mademoiselle Pichon. Je vous ai reconnue à la sacoche.'],
        ['@postiere', 'Il fait beau, chez vous ?'],
        ['Octave', 'Il fait beau, chez vous.'],
        ['', '(Il traverse le pont. Derrière lui, sur le lac, l’eau fait un drôle de bruit. Elle le tire par la manche avant qu’il écoute.)'],
      ],
      fin: { haut: 'Au dos de la feuille de route', titre: 'Un homme en casquette neuve' } },
  },
});
