// ============================================================================
//  LE CHÂTEAU DES HAUTS — HAUTGUET (agent V4, quatorzième vague) — données
//  Le château du site « chateau » de la Zone (V1), sur le grand replat des Hauts.
//  Ce qu'on en sait se lit sur place : un registre, des lignes gravées, des tombes,
//  une lettre ; deux voix (le vieil homme du treuil, la Dame derrière sa porte).
//  Les sires de Hautguet tenaient le Guet, le grand fanal du donjon : tant qu'il
//  brûlait, la ville d'en bas dormait. Une nuit, il s'est éteint ; le Ver est
//  descendu sur la Ville Basse ; ceux d'en bas sont montés aux Hauts avec des
//  torches ; le sire a gardé le pont levé. Le reste, on le trouve.
//  Clés (objets) : v4_cle_poterne, v4_cle_chapelle (la sacristie), v4_cle_donjon,
//  v4_cle_tour (la Dame), v4_trousseau (les cachots) ; et v4_registre, v4_anneau,
//  v4_lettre_dame. Butins : LOOT.v4_*. Textes : V4_TEXTES, V4_LIRE, V4_THIBAUD, V4_DAME.
// ============================================================================
const V4_NOM = 'Hautguet';

// ---------------------------------------------------------------- les lieux (lieux-dits de la Zone : savoir, la mort, les cartes)
const V4_LIEUX = {
  v4_chateau: 'le château de Hautguet', v4_chatelet: 'le châtelet de Hautguet', v4_basse_cour: 'la basse-cour de Hautguet',
  v4_cour: 'la haute cour de Hautguet', v4_cuisines: 'les cuisines de Hautguet', v4_grand_salle: 'la grand-salle de Hautguet',
  v4_logis: 'le logis de Hautguet', v4_chapelle: 'la chapelle de Hautguet', v4_crypte: 'la crypte de Hautguet',
  v4_donjon: 'le donjon de Hautguet', v4_tour_dame: 'la tour de la Dame', v4_cachots: 'les cachots de Hautguet',
  v4_souterrain: 'le souterrain de Hautguet', v4_charnier: 'le charnier de Hautguet', v4_cimetiere: 'le cimetière de Hautguet',
  v4_fosse: 'la fosse du donjon', v4_cave: 'la cave des cuisines',
};
// (inscrits dans LIEU_NAMES par 11-zzzzV4-1-plan.js : LIEU_NAMES est défini plus loin, en 06)

// ---------------------------------------------------------------- les clés et les objets de l'histoire
defItem('v4_cle_poterne', 'Clé de la poterne', 'quete', 0, ['cle', '#3a3a40'], { unique: true, desc: 'Une clé courte et noire, au panneton usé. Elle était pendue au clou du portier, avec une étiquette de cuir : « poterne de l’est ».' });
defItem('v4_cle_chapelle', 'Clé de la sacristie', 'quete', 0, ['cle', '#8a7a5a'], { unique: true, desc: 'Une clé ouvragée, une croix dans l’anneau. La cuisinière la gardait dans sa huche, entre deux torchons.' });
defItem('v4_cle_donjon', 'Grande clé du donjon', 'quete', 0, ['cle', '#5a5a62'], { unique: true, desc: 'Une clé longue comme l’avant-bras, lourde. Le sénéchal l’avait emportée avec lui sous la chapelle.' });
defItem('v4_cle_tour', 'Petite clé de la tour', 'quete', 0, ['cle', '#b09a60'], { unique: true, desc: 'Une petite clé tiède, comme si une main venait de la lâcher.' });
defItem('v4_trousseau', 'Trousseau du geôlier', 'quete', 0, ['cle', '#4e4a44'], { unique: true, desc: 'Sept clés sur un anneau de fer. Elles sentent la rouille et la paille mouillée.' });
defItem('v4_registre', 'Registre du portier', 'quete', 0, ['livre', '#5a4030'], { unique: true, desc: 'Le registre de la porte de Hautguet, tenu par Gaucher, portier. Clic : le lire.' });
defItem('v4_lettre_dame', 'Lettre de dame Ysolde', 'quete', 0, ['lettre', '#d8ccb0'], { unique: true, desc: 'Une lettre pliée en quatre, adressée « à qui ouvrira ». Clic : la lire.' });
defItem('v4_anneau', 'Anneau de Hautguet', 'tresor', 160, ['anneau', '#c8a040'], { unique: true, desc: 'Un anneau d’or, lourd, un fanal gravé sur le chaton. Il a laissé une marque pâle au doigt d’un mort.' });

// ---------------------------------------------------------------- butins (la Zone ne rend pas riche ; le trésor du donjon, un peu)
Object.assign(LOOT, {
  v4_coffre: { rolls: [1, 3], items: [['vieille_piece', 1, 4, 5], ['argent', 6, 30, 3], ['bougie', 1, 3, 3], ['cire', 1, 1, 1.5], ['toile', 1, 2, 2], ['bijou', 1, 1, 0.6], ['cuillere_argent', 1, 1, 0.8]] },
  v4_armoire: { rolls: [1, 2], items: [['toile', 1, 2, 3], ['laine', 1, 2, 2], ['bougie', 1, 2, 3], ['boutons_nacre', 1, 1, 1], ['vieille_piece', 1, 2, 1.5], ['image_pieuse', 1, 1, 0.8]] },
  v4_soldat: { rolls: [1, 2], items: [['vieille_piece', 1, 2, 4], ['fleche_fer', 2, 5, 2], ['corde', 1, 1, 2], ['tabac', 1, 1, 1], ['couteau_poche', 1, 1, 0.5], ['bougie', 1, 1, 2], ['argent', 2, 12, 1.5]] },
  v4_cuisine: { rolls: [1, 2], items: [['sel', 1, 2, 4], ['bougie', 1, 2, 3], ['tesson', 1, 2, 3], ['cuillere_argent', 1, 1, 0.8], ['huile', 1, 1, 0.6], ['cire', 1, 1, 1]] },
  v4_cachot: { rolls: [1, 1], items: [['os', 1, 2, 4], ['tesson', 1, 1, 3], ['vieille_piece', 1, 1, 1.2], ['corde', 1, 1, 1], ['meche_cheveux', 1, 1, 0.6], ['figurine', 1, 1, 0.4]] },
  v4_crypte: { rolls: [2, 3], items: [['vieille_piece', 2, 4, 5], ['bougie', 1, 3, 3], ['cire', 1, 2, 2], ['relique', 1, 1, 0.9], ['bijou', 1, 1, 0.8], ['argent', 10, 40, 2]] },
  v4_recoin: { rolls: [1, 2], items: [['vieille_piece', 1, 3, 5], ['tesson', 1, 2, 3], ['bougie', 1, 2, 3], ['bijou', 1, 1, 0.6], ['figurine', 1, 1, 0.7], ['argent', 5, 30, 2.5], ['geode', 1, 1, 0.5], ['relique', 1, 1, 0.3]] },
  v4_tresor: { rolls: [4, 6], items: [['vieille_piece', 3, 8, 5], ['argent', 30, 90, 4], ['bijou', 1, 2, 2.5], ['gemme', 1, 1, 1.4], ['relique', 1, 1, 0.8], ['cuillere_argent', 1, 2, 1.2]] },
});

// ---------------------------------------------------------------- ce qu'on lit (titre, texte, signature) : inscriptions, notes, tombes
const V4_LIRE = {
  borne: ['Une borne, au bord du fossé', 'HAUTGUET.\nICI L’ON VEILLE, POUR QUE LA VILLE DORME.'],
  os_pont: ['Contre le pont', 'Des os, en tas, du côté du fossé. Des souliers, une poupée de chiffon. Le bois du pont est griffé jusqu’à hauteur d’homme.'],
  caserne: ['Gravé dans le bois d’un châlit', 'NOUS ÉTIONS AU REMPART. NOUS AVONS VU LES TORCHES MONTER LES DEGRÉS.\nNOUS AVONS REGARDÉ.'],
  ecurie: ['Sur une poutre, au couteau', 'L’hiver d’après, on a mangé les chevaux.\nPuis le cuir des selles.'],
  cuisine: ['Des comptes à la craie, près de l’âtre', 'Pain : quarante.\nPain : trente.\nPain : douze.\nPain : quatre.\nPain : un, pour la tour. Que le sire n’en sache rien.'],
  table: ['Au couteau, dans le bois de la grande table, à la place du sire', '« Le pont restera levé. »\n\nDessous, d’une autre main : « Elle ne vous le pardonnera pas. »'],
  chapelle: ['Une feuille, sur le lutrin', 'Nous avons prié pour qu’il passe au large.\nIl est passé au large de nous.\nSeigneur, pardonnez-nous d’avoir été exaucés.', 'Frère Anselme'],
  tombe_guerin: ['Un tombeau, le plus vieux', 'GUÉRIN, PREMIER DE HAUTGUET.\nIL ALLUMA LE GUET.'],
  tombe_aymeric: ['Un tombeau', 'AYMERIC DE HAUTGUET.\nIL NE LE LAISSA JAMAIS S’ÉTEINDRE.'],
  tombe_aymon: ['Un tombeau, le dernier', 'AYMON DE HAUTGUET.\n\nIl n’y a pas de seconde ligne. Le tombeau est vide.'],
  senechal: ['Dans la main du mort, une feuille', 'Le sire a enfermé la dame dans sa tour, pour qu’elle ne descende pas au treuil.\nJ’ai enfermé le sire dans son donjon, pour qu’il ne redescende plus.\nJe garde la clé ici, avec ses pères. Dieu fera le reste.', 'Hugues, sénéchal'],
  cachot: ['Gratté dans la pierre, au fond de la cellule', 'J. F., TONNELIER, DE LA VILLE BASSE.\nJ’AI FRAPPÉ À LA POTERNE POUR QU’ON LES LAISSE ENTRER.\nON M’A FAIT ENTRER, MOI.'],
  geolier: ['Une planche clouée au mur, à la craie', 'Prisonniers : un.\nNourriture : ce qui reste.\nOrdre : ne pas l’écouter.'],
  guet: ['Gravé sur le fût du Guet', 'TANT QUE LE GUET BRÛLE, LA VILLE DORT.'],
  aymon: ['Sous la main du mort, une feuille roulée', 'Je l’ai enfermée pour qu’elle ne descende pas au treuil.\nOn m’a enfermé pour que je ne descende plus. C’est juste.\nLe Guet restera éteint. Il n’y a plus personne en bas à qui dire de dormir.'],
  charnier: ['Sur le linteau du charnier', 'ICI CEUX DU FOSSÉ QU’ON A PU RAMASSER.'],
  cimetiere: ['Une pierre, à l’entrée du cimetière', 'ICI LES GENS DU CHÂTEAU.\nLES AUTRES SONT AU FOSSÉ.'],
  puits: ['Sur la margelle du puits', 'NE PUISEZ PAS APRÈS LA NUIT TOMBÉE.'],
  trappe: ['Gravé sur l’anneau de la trappe', 'ON N’Y DESCEND QU’UNE FOIS.'],
  poterne: ['Gravé dans le linteau de la poterne', 'PAR ICI SORTENT CEUX QU’ON NE VOIT PAS SORTIR.'],
  cave: ['Au charbon, sur un tonneau vide', 'Pour la tour : un pain par le guichet, après minuit. Frapper deux fois.\nElle ne prend plus le pain depuis la Toussaint. Elle parle encore.'],
  tour_pied: ['Au pied de l’escalier de la tour, gravé petit', 'AUDE, NEUF ANS.'],
  souterrain: ['Gratté sur la grille', 'ELLE NE S’OUVRE QUE DE CE CÔTÉ. POUR NOUS, C’ÉTAIT ASSEZ.'],
  chatelet: ['Peint au-dessus du treuil, presque effacé', 'LE PONT NE SE BAISSE QUE SUR L’ORDRE DU SIRE.'],
};
// le registre du portier (l'objet v4_registre : clic pour le lire)
const V4_REGISTRE = 'Entré : le charretier de la Ville Basse, avec le sel. Sorti le soir.\nEntrés : deux moines des Tertres. Sortis le lendemain.\nSorties : dame Aude, avec sa nourrice, pour la foire d’en bas. Le matin.\nEntré : frère Anselme, revenu des Tertres.\n\n(Une page plus loin, d’une autre main, très serrée.)\nLa cendre tombe sur la ville. Le Guet ne brûle pas.\nOn monte les Degrés avec des torches.\nOrdre du sire : le pont reste levé.\nIls sont au fossé. Ils appellent par leurs noms.\nLe pont reste levé.\n\n(La dernière ligne.)\nJe ne note plus les entrées. Il n’en vient plus.';
const V4_LETTRE_DAME = 'À qui ouvrira.\n\nAude est descendue à la foire avec sa nourrice, le matin du jour de la cendre. Je l’ai regardée descendre les Degrés depuis ma fenêtre, jusqu’à ce que la brume la prenne.\nLe soir, j’ai vu les torches monter. J’ai entendu sa voix au fossé, ou j’ai cru l’entendre. Il n’a pas voulu baisser le pont. Il a fermé ma porte, et il a emporté la clé.\nSi le pont est baissé quand tu liras ceci, alors je peux dormir.';

// ---------------------------------------------------------------- le vieil homme du treuil (Thibaud), au châtelet
const V4_THIBAUD = {
  titre: 'Un vieil homme, près du treuil',
  premier: 'Un vieil homme est assis près du treuil, une couverture sur les épaules. Il ne se lève pas. « Vous venez d’en bas. Personne ne vient d’en bas. »',
  revoir: ['Le vieil homme lève à peine la tête. « Encore vous. »', 'Le vieil homme regarde le treuil, pas vous.', '« Vous avez entendu ? Non. Moi non plus. Il ne vient jamais rien. »'],
  qui: '« Thibaud. J’étais au treuil, cette nuit-là. J’y suis encore. »',
  quoi: '« Le Guet s’est éteint. Le Ver est descendu sur la ville. Ils sont montés avec des torches, toute la nuit. Le sire a dit : le pont reste levé. J’ai obéi. »',
  treuil: '« N’y touchez pas. S’il baisse, ils monteront tous. Ils attendent au fossé. Ils attendent depuis si longtemps. »',
  dame: '« La dame ? Elle est dans sa tour. Le sire a fermé sa porte, cette nuit-là, pour qu’elle ne vienne pas ici. Pour qu’elle ne vienne pas au treuil. »',
  guet: '« Le Guet, il faut de l’huile. Beaucoup. Il n’y en a plus. Il n’y a plus personne pour le monter, de toute façon. »',
  baisse: '« Vous l’avez baissé. » Le vieil homme se lève, pour la première fois, et regarde par la meurtrière. Longtemps. « Personne ne monte. Vous voyez ? Personne. »',
  apres: 'Le vieil homme n’est plus près du treuil. Sa couverture est pliée sur le banc.',
  bout: 'Le vieil homme est assis au bout du pont, face aux Degrés. Il ne respire plus. Il a l’air d’attendre encore.',
};
// ---------------------------------------------------------------- la Dame, derrière la porte de sa tour (dame Ysolde)
const V4_DAME = {
  titre: 'La porte de la tour',
  muette: 'Une porte de chêne, fermée à clé. Derrière, très haut, quelque chose bouge, puis plus rien.',
  premier: 'Une voix de femme, de très haut, à travers la porte. « Qui est là ? … Ce n’est pas son pas. Ce n’est pas le pas d’Aymon. »',
  pontLeve: '« Le pont. Est-il toujours levé ? … Alors ils sont encore au fossé. »',
  pontBaisse: '« On a baissé le pont. J’ai entendu les chaînes. … Je les entends monter. Merci. »',
  cle: '« Il a gardé la clé. Il l’a emportée là-haut, au donjon. Il ne redescendra pas. Il ne peut plus. »',
  aCle: '« Tu as la clé. Je l’entends tinter. Ouvre, si tu veux. Il n’y a plus ici qu’une vieille femme. »',
  aude: '« Aude. Elle avait neuf ans. Elle voulait voir la foire. »',
  guet: '« Le Guet brûle. Je le vois sur le mur, par la fente de la porte. La ville peut dormir. »',
  silence: 'Derrière la porte, plus rien. Pas même le vent.',
};
// ---------------------------------------------------------------- pensées et petits textes (peu)
const V4_TEXTES = {
  arrivee: '(Des tours, dans la brume. Pas une lumière.)',
  pontLeve: 'Le pont-levis est levé. De ce côté, ni corde ni chaîne : on ne le baisse que de l’intérieur.',
  treuilTitre: 'Le treuil du pont-levis',
  treuilDesc: 'Un tambour de chêne, des chaînes grosses comme le poignet. Le cliquet tient tout le poids du pont.',
  treuilBaisser: 'Lever le cliquet, laisser descendre le pont',
  treuilFait: 'Le pont est baissé. Les chaînes pendent.',
  herseTitre: 'Le treuil de la herse',
  herseDesc: 'Une roue à rayons, une chaîne qui monte dans la voûte. La herse attend en bas, de tout son poids.',
  herseLever: 'Tourner la roue',
  herseFait: 'La herse est levée. Le cliquet la tient.',
  herseDehors: '(Une herse de fer, scellée dans la voûte. Le treuil est de l’autre côté.)',
  barreTitre: 'Une porte barrée',
  barreDedans: 'Une barre de chêne dans deux crochets de fer, de ce côté-ci.',
  barreLever: 'Ôter la barre',
  barreDehors: '(La porte ne bouge pas. Elle est barrée de l’autre côté.)',
  ferme: '(Fermée à clé.)',
  cleTourne: '(La clé tourne.)',
  cleNon: '(Fermée à clé. Aucune de vos clés n’y entre.)',
  murCreux: '(Le mur sonne creux.)',
  murFrapper: 'Frapper la pierre',
  murTombe: '(Les pierres cèdent d’un coup. Derrière, il fait noir et sec.)',
  murOutil: '(Il faudrait une pioche, ou un marteau.)',
  echelleHaut: 'Une échelle, tirée en haut du mur et couchée sur le chemin de ronde. Quelqu’un ne voulait pas qu’on monte.',
  echellePousser: 'Faire glisser l’échelle par-dessus le bord',
  echelleBas: '(Il y avait une échelle ici : on voit les marques dans la pierre. On l’a tirée d’en haut.)',
  trappeTitre: 'Une trappe dans le plancher',
  trappeDesc: 'Une trappe de chêne, un anneau de fer. Dessous, un trou, et le noir.',
  trappeOuvrir: 'Soulever la trappe',
  trappeOuverte: 'La trappe est ouverte. Une corde pourrie pend dans le noir, nouée à l’anneau. Elle vous descendra. Elle ne vous remontera pas.',
  trappeDescendre: 'Descendre à la corde',
  fosse: 'La corde casse sous vos mains, au dernier mètre.',
  boyau: 'Un trou dans la paroi, à ras du sol, d’où monte un air humide. Une rigole de pierre s’y enfonce.',
  boyauEntrer: 'Se glisser dans le trou',
  boyauTexte: 'Vous rampez longtemps, dans le noir et l’eau froide.',
  conduit: 'Une bouche de pierre au pied du mur, noire, qui sent encore. Le conduit monte droit dans l’épaisseur de la muraille.',
  conduitMonter: 'Monter dans le conduit',
  conduitTexte: 'Vous montez dans le conduit, les genoux et les coudes contre la pierre.',
  conduitDescendre: 'Redescendre par le conduit',
  grilleTitre: 'Une grille dans le sol',
  grilleDedans: 'Une grille de fer, scellée par deux verrous de ce côté-ci. Au-dessus, de l’air, un peu de jour.',
  grilleOuvrir: 'Tirer les verrous et pousser la grille',
  grilleDehors: '(Une grille dans les dalles, fermée par-dessous.)',
  monter: 'Monter l’escalier',
  descendre: 'Descendre l’escalier',
  vis: 'L’escalier à vis',
  murEsc: 'L’escalier dans le mur',
  echelle: 'L’échelle',
  puitsDesc: 'Le puits de la haute cour. Une corde neuve, presque, pend au treuil. Tout au fond, pas d’eau : une lueur de pierre sèche.',
  puitsDescendre: 'Descendre à la corde',
  puitsRemonter: 'Remonter à la corde',
  cloche: 'La corde de la cloche',
  clocheDesc: 'La corde de la cloche pend jusqu’au sol, raide de poussière. Une seule fois, et tout le château l’entendra.',
  clocheTirer: 'Tirer la corde',
  guetTitre: 'Le Guet',
  guetDesc: 'Une corbeille de fer, grande comme une charrette, sur un fût de pierre. Des cendres froides, très vieilles. Le fanal est vide.',
  guetHuile: 'Il faudrait de l’huile. Beaucoup : trois jarres au moins.',
  guetAllumer: 'Verser l’huile et allumer le Guet',
  guetAllume: 'Le Guet prend, lentement, puis d’un coup. Toute la Zone, en bas, doit le voir.',
  guetBrule: 'Le Guet brûle. Il brûlera longtemps.',
  coffreVide: '(Il n’y a plus rien.)',
  fini: 'Hautguet se tait. Pour la première fois, le silence ressemble à du sommeil.',
};
