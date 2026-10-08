// ============================================================================
//  BASSE-FOSSE, LA VILLE SOUS LA VILLE, ET LES SECRETS DE LA ZONE (agent V5,
//  quatorzième vague) — les données : textes, objets, butins
//  Peu de mots. Les lieux, les objets et les inscriptions racontent ; rien ne
//  s'explique. L'histoire d'en bas, telle qu'on peut la reconstituer :
//   - le soir où la cendre est tombée sur la Ville Basse, ceux qui restaient
//     sont descendus dans les charniers, sous la ville, par la cave de Joachim
//     Fève, le tonnelier ; ils y ont porté leurs morts et un feu ; ils ont fait
//     des lois pour vivre sans être vus ; ils comptent, chaque soir, les vivants
//     et les morts, pour que le nombre ne change pas ;
//   - en 1839, Auguste de Sorbiers, venu dans la vallée avec une lettre de
//     notaire (« l'unique héritier connu »), a passé la Grande Porte ; ses
//     lettres jalonnent la Zone ; il est descendu, s'est fait compter, a aidé le
//     vieux greffier, puis l'a remplacé ; il a oublié son nom ;
//   - la Cloche du Jour, que l'on sonnait là-haut, a été descendue et fait
//     taire : son battant a été jeté dans un tertre. Le feu du compte ne
//     s'éteint pas, sauf sous « ce qui ne brûle pas » (la cendre des Cendrières).
//  Trois fins (exclusives) : rester et compter (la plume) ; les faire remonter
//  (la Cloche du Jour, à l'aube) ; laisser le compte s'arrêter (la cendre
//  froide sur le feu du compte).
// ============================================================================
// (les noms des lieux : LIEU_NAMES, dans 11-zzzzV5-1-ville.js — la table n'existe pas encore ici)
const V5_LIEUX = {
  v5_basse_fosse: 'Basse-Fosse', v5_tonnellerie: 'la tonnellerie', v5_septieme_degre: 'le Septième Degré', v5_temple: 'le temple des cloches',
  v5_marche: 'le marché d’en bas', v5_bas_quartiers: 'les Bas-Quartiers', v5_tertre_creux: 'le tertre creux', v5_chapelle_muree: 'la chapelle murée',
  v5_ermitage: 'l’ermitage', v5_brasier_mort: 'le brasier mort',
};

// ---------------------------------------------------------------- les textes
const V5_TEXTES = {
  // l'entrée
  enseigneTitre: 'Une enseigne tombée',
  enseigne: 'Une planche peinte, tombée de sa potence. On y voit encore un tonneau cerclé de fer, et des lettres que la cendre n’a pas tout à fait effacées :\n\nJ. FÈVE — TONNELIER',
  trappeGravats: 'Des gravats, des planches pourries, un cercle de fer rouillé. Dessous, le sol sonne creux.',
  trappeDegager: 'Dégager les gravats',
  trappeDegagee: '(Sous les gravats, une trappe. Un anneau de fer, froid.)',
  trappe: 'Une trappe de chêne. En dessous, des marches de pierre, et l’odeur du vin aigri.',
  trappeDescendre: 'Descendre',
  descente: 'Vous descendez dans la cave…',
  remontee: 'Vous remontez…',
  traitsTitre: 'Des traits, sur le mur',
  traits: 'Des traits gravés au couteau, par paquets de cinq, sur tout un pan de mur. Ils ne s’arrêtent qu’au plafond.\n\nEn dessous, une seule ligne, plus profonde que les autres :\n\nLE SOIR, ON FERME. AU MATIN, ON ROUVRE.',
  portetteFermee: '(La portette ne cède pas. On dirait qu’une barre la tient, de l’autre côté.)',
  portetteMatin: 'La portette du foudre est entrouverte. Derrière, il fait noir, et un air tiède monte, qui sent la pierre.',
  portetteOuverte: 'La portette du foudre est ouverte. Derrière, des marches descendent dans le noir.',
  portettePasser: 'Passer par la portette',
  portetteDedans: 'Une portette de chêne, par où l’on voit la cave. Une barre de fer la tient fermée, de ce côté-ci.',
  portetteLever: 'Lever la barre',
  portetteLevee: '(La barre est levée. La portette restera ouverte.)',
  portetteRepasser: 'Repasser dans la cave',
  passage: 'Vous vous glissez par la portette…',
  barreEntendue: '(Quelque part sous vos pieds, une barre de fer glisse dans ses anneaux.)',
  septiemeTitre: 'Des lettres taillées dans la pierre',
  septieme: 'ICI COMMENCE LE SEPTIÈME DEGRÉ.\nON LE DESCEND SEUL.\nON NE LE REMONTE PAS.',
  // la ville
  arrivee: 'Basse-Fosse',
  necropoleTitre: 'Des mots, entre les crânes',
  necropole: 'Gravé dans l’os d’un front, en lettres serrées :\n\nILS NE SONT PAS PARTIS.\nILS SONT COMPTÉS.',
  loisTitre: 'Une stèle, près de la porte',
  lois: 'CECI EST LA LOI DE BASSE-FOSSE.\n\nI. ICI, ON NE PORTE QUE NOTRE FEU.\nII. ICI, ON NE COURT PAS.\nIII. CE QUI EST POSÉ RESTE POSÉ.\nIV. LES MORTS PASSENT LES PREMIERS.\nV. ON NE REMONTE PAS.\nVI. CHACUN EST COMPTÉ.\n\n(Une septième ligne a été martelée. On ne peut plus la lire.)',
  feu: 'Un feu sans bois, dans une vasque de tuf. Des os dans la cendre, qui ne se consument pas. Il ne chauffe presque pas.',
  feuLanterne: 'Allumer la lanterne à ce feu',
  feuLanterneFait: '(La flamme de la lanterne pâlit, et devient la même que celle de la vasque.)',
  feuCompte: 'Le feu du compte. Il brûle au milieu du temple depuis qu’on compte. Les os, dans la cendre, ne se consument pas.',
  feuCompteEteint: 'La vasque est froide. Dans la cendre, les os sont restés tels qu’ils étaient.',
  feuCendre: 'Jeter la cendre froide sur le feu',
  feuEteint: 'Le feu de la vasque est éteint. La cendre est froide.',
  laisser: 'Laisser',
  partir: 'Partir',
  puitsTitre: 'Le puits des noms',
  puits: 'Une margelle de tuf, une chaîne qui descend. Autour, sur les dalles, de petites pierres plates, gravées d’un nom. On les jette au fond. On n’entend pas tomber les dernières.',
  puitsEcouter: 'Écouter',
  puitsEcoute: '(Rien. Puis, très loin, une pierre qui touche quelque chose. Puis une autre, qui n’est pas tombée.)',
  registreTitre: 'Le registre',
  registre: 'Un livre énorme, ouvert sur un lutrin. Des colonnes de noms, et, en face de chacun, un nombre. Beaucoup de noms sont rayés ; leurs nombres ne le sont pas. En bas de la page, d’une écriture tremblée, le compte du jour.',
  registreCompte: (n) => `Le compte du jour : ${n}.`,
  registreToi: (n) => `Plus haut, dans la marge, votre nom, et le nombre ${n}.`,
  clocheTitre: 'La Cloche du Jour',
  cloche: 'Une cloche immense, posée par terre, la bouche contre la pierre. On l’a descendue de là-haut, il y a longtemps. Elle n’a plus de battant.',
  clocheBattant: 'La Cloche du Jour, posée par terre. Le battant est remis. Elle attend.',
  clocheRemettre: 'Remettre le battant',
  clocheRemis: '(Le battant entre dans son anneau. Il pèse comme un homme.)',
  clocheSonner: 'Sonner la Cloche du Jour',
  clochePasMatin: '(Pas maintenant. Elle sonnait au matin, là-haut.)',
  // les maisons
  niche: 'Une niche creusée dans le mur, garnie de crânes rangés. Derrière eux, de petites choses : ce qu’on garde.',
  nicheVide: '(Il n’y a plus rien derrière les crânes.)',
  nicheFouiller: 'Chercher derrière les crânes',
  vu: 'On vous a vu.',
  // la salle d'avant, les Premiers
  chambreAvantTitre: 'Des mots gravés, sur le mur',
  chambreAvant: 'Gravé à la pointe, à hauteur d’homme :\n\nA. DE S. — 1839\n\nEt dessous, d’une autre main, plus maladroite :\n\nIL A OUBLIÉ. NOUS GARDONS POUR LUI.',
  premiersTitre: 'Des noms',
  premiers: 'Sept noms, gravés en colonne dans le couvercle d’un sarcophage. Des dates qu’on ne sait plus lire.\n\nLe premier nom est JOACHIM FÈVE.\n\nLe dernier n’est gravé qu’à moitié, comme si la main s’était arrêtée.',
  murDissipe: '(Il n’y avait pas de mur.)',
  // l'œil, les lois : ce qu'on entend
  cris: ['Pas compté !', 'Un vivant !', 'Il y a quelqu’un qui n’est pas compté !', 'Là ! Quelqu’un !'],
  crisLoi: { feu: 'Ce feu n’est pas le nôtre !', court: 'On ne court pas !', vol: 'Pose ça !', coup: 'Il a frappé !' },
  gardien: ['Halte.', 'Tu n’es pas d’ici.', 'Montre-toi.', 'On t’a entendu.'],
  gardienPerdu: ['Il est parti.', 'Plus rien.', 'Qu’il reste où il est.'],
  murmures: ['Que le compte soit juste.', 'On ne court pas, ici.', 'Les morts d’abord.', 'Tu sens le dehors.', 'La cloche va sonner.', 'Ne réveille pas les dormeurs.', 'Là-haut, il y a encore le ciel ?', 'Il y a longtemps que personne n’est descendu.', 'Ta lumière n’est pas la nôtre.', 'Mon père est dans le mur de la rue des Cordiers. Il va bien.'],
  murmuresCompte: ['Le quatre cent douzième.', 'Te voilà des nôtres.', 'Le Greffier t’a écrit. Bien.', 'Tu as donné ta dent ? Alors tu es d’ici.'],
  enfant: ['Tu viens d’en haut ?', 'On n’a pas le droit de courir.', 'Moi aussi j’ai donné une dent. Elle était déjà tombée.', 'Le Greffier dit que tu n’existes pas encore.'],
  dormeur: '(Il dort, les mains croisées sur le ventre, comme les morts du mur.)',
  // les fins
  finCompteTitre: 'La plume',
  finRemonteeTitre: 'La Cloche du Jour',
  finExtinctionTitre: 'Le feu du compte',
  epilogueCompte: 'Vous comptez.\n\nChaque soir, à la cloche, les gens d’en bas passent devant le registre, et vous écrivez le nombre. Il ne change pas.\n\nVous ne savez plus très bien depuis quand vous êtes descendu. Quelque part dans une marge, il y a un nom, que vous relisez parfois, pour ne pas l’oublier.',
  epilogueRemontee: 'La Cloche du Jour a sonné, au matin, pour la première fois depuis la cendre.\n\nIls sont remontés par le Septième Degré, un à un, sans courir, les morts d’abord, portés dans des linceuls. Au seuil de la tonnellerie, ils se sont arrêtés, les mains devant les yeux.\n\nPersonne ne sait ce que le Ver a pensé de cela. Les maisons d’en bas sont vides. Les feux brûlent encore.',
  epilogueExtinction: 'Le feu du compte s’est éteint sous la cendre froide. Les autres l’ont suivi, rue après rue.\n\nLes gens d’en bas se sont couchés là où ils étaient, auprès de leurs morts, et ne se sont plus relevés. On n’a plus compté.\n\nBasse-Fosse est noire, et elle se tait.',
};

// ---------------------------------------------------------------- les lettres d'Auguste de Sorbiers (A.)
const V5_LETTRES = {
  v5_lettre_1: { titre: 'Une lettre, pliée en quatre', texte: 'Jour treize.\n\nLes cloches, encore, sous la ville basse. Personne ne les sonne là-haut : il n’y a plus d’église, plus de clocher, plus rien. Je les ai suivies jusqu’aux ruines d’une maison de tonnelier. Il y a une trappe sous les gravats.\n\nJe ne l’ai pas ouverte. Il faisait nuit, et j’ai pensé à la phrase du linteau. Au matin, peut-être.\n\n— A.' },
  v5_lettre_2: { titre: 'Une lettre, tachée de suif', texte: 'Jour vingt-deux.\n\nIls vivent ici. Ils marchent sans lumière et sans bruit, comme des gens qui portent un malade. Ils ne me voient pas, ou ils font semblant ; quand ils m’entendent, ils s’arrêtent, et ils écoutent longtemps.\n\nUne femme m’a dit, sans me regarder : « Tu n’es pas compté. » Puis elle est rentrée chez elle, et j’ai entendu la cloche.\n\nJ’ai dormi dans une maison vide. Il y avait des crânes dans la niche. Ils étaient rangés comme des pots de confiture.\n\n— A.' },
  v5_lettre_3: { titre: 'Une lettre, d’une écriture plus petite', texte: 'Jour quarante, je crois.\n\nJ’ai donné une dent. On me l’a prise avec une pince de fer, dans le temple, devant le feu. Le vieux qui tient le registre a écrit un nombre en face de mon nom, et tout le monde a dit le nombre à voix basse, comme on dit amen.\n\nDepuis, ils me parlent. Le vieux me demande de l’aider à compter. Il ne voit presque plus. J’ai dit oui.\n\nIl y a une cloche, posée par terre au fond du temple, à qui l’on a ôté son battant. Je n’ose pas demander pourquoi.\n\n— A.' },
  v5_lettre_4: { titre: 'Une lettre qui n’a pas de fin', texte: 'Je ne sais plus quel jour.\n\nLe vieux est mort. Ils l’ont mis dans le mur de la rue des Cordiers, avec les autres, et ils m’ont donné sa plume.\n\nJ’écris mon nom ici, pour ne pas l’oublier.\n\nAuguste de Sorbiers.\nAuguste de Sorbiers.\nAuguste de' },
  v5_lettre_notaire: { titre: 'Une lettre de notaire', texte: 'Étude de Maître Delorme, notaire à Valbrume.\n\nMonsieur,\n\nConformément aux dernières volontés de feu M. Hippolyte Garance, dont vous êtes l’unique héritier connu, je vous prie de bien vouloir vous présenter en mon étude, au sujet de la maison dite des Sorbiers et de ses dépendances.\n\nVeuillez agréer, etc.\n\nDelorme, notaire.\n\n(Au dos, au crayon : « Trois avril 1839. Personne ici n’a connu ce Garance. Personne ne s’en étonne. »)' },
};

// ---------------------------------------------------------------- les objets (ceux qui racontent, ceux du troc, ceux des fins)
defItem('v5_lettre_1', 'Lettre d’A. (jour treize)', 'tresor', 0, ['lettre', '#d8cca8'], { desc: 'Une lettre pliée en quatre, signée d’une initiale. En main, un clic : vous la relisez.', v5lire: true });
defItem('v5_lettre_2', 'Lettre d’A. (jour vingt-deux)', 'tresor', 0, ['lettre', '#cfc29a'], { desc: 'Une lettre tachée de suif, signée d’une initiale. En main, un clic : vous la relisez.', v5lire: true });
defItem('v5_lettre_3', 'Lettre d’A. (jour quarante)', 'tresor', 0, ['lettre', '#c8b88c'], { desc: 'Une lettre d’une écriture de plus en plus petite. En main, un clic : vous la relisez.', v5lire: true });
defItem('v5_lettre_4', 'Lettre d’A. (sans date)', 'tresor', 0, ['lettre', '#bfae82'], { desc: 'Une lettre qui n’a pas de fin. En main, un clic : vous la relisez.', v5lire: true });
defItem('v5_lettre_notaire', 'Lettre de notaire (1839)', 'tresor', 0, ['lettre', '#e6dcc0'], { desc: 'Une lettre de Maître Delorme, notaire à Valbrume, adressée à un « unique héritier connu ». La même formule que la vôtre. En main, un clic : vous la relisez.', v5lire: true });
defItem('v5_livre_feve', 'Livre de comptes du tonnelier', 'tresor', 2, ['livre', '#5a3a24'], { desc: 'Le livre de comptes de Joachim Fève : des barriques, des cercles, des fûts livrés au château. En main, un clic : vous le feuilletez.', v5lire: true });
defItem('v5_jeton', 'Jeton d’os', 'quete', 0, ['rond', '#e4dcc4'], { desc: 'Un jeton taillé dans un os, gravé d’un nombre : le vôtre. Là-dessous, cela veut dire que vous existez.' });
defItem('v5_pain_racines', 'Pain de racines', 'nourriture', 2, ['pain', '#6a5440'], { food: 12, heal: 3, desc: 'Un pain lourd et gris, fait de racines pilées et de champignons d’en bas. Il a le goût de la cave.' });
defItem('v5_linceul', 'Linceul', 'tresor', 6, ['sac', '#d8d4ca'], { desc: 'Un linceul de lin gris, tissé en bas. Tenu en main, sur la tête, on ressemble à ceux qu’on porte au mur : les gens d’en bas s’écartent sans regarder.' });
defItem('v5_battant', 'Battant de cloche', 'quete', 0, ['fer', '#5a5a60'], { desc: 'Un battant de fer forgé, long comme un bras, terminé par une boule. Il manque à une cloche, quelque part.' });
defItem('v5_cendre_froide', 'Cendre froide', 'quete', 0, ['sachet', '#8a8682'], { desc: 'Une poignée de la cendre du brasier mort des Cendrières, nouée dans un mouchoir. Elle est froide comme de la neige, et elle ne brûle pas.' });
defItem('v5_plume', 'Plume du Greffier', 'quete', 0, ['plume', '#2a2826'], { desc: 'Une plume taillée, noire d’encre jusqu’au milieu. Elle a compté plus de morts qu’il n’y en a dans la vallée.' });
defItem('v5_couronne_cire', 'Couronne de cire', 'tresor', 18, ['couronne', '#d8c890'], { desc: 'Une couronne de cire jaune, moulée sur une tête. Les rois des tertres en portaient une : l’or, on le gardait pour les vivants.' });
defItem('v5_dents_lait', 'Dents de lait sur un fil', 'tresor', 3, ['larme', '#f0ece0'], { desc: 'Sept dents de lait percées, enfilées sur un fil de lin. Ici, on ne jette rien de ce qui vient de quelqu’un.' });
defItem('v5_chapelet_dents', 'Chapelet de dents', 'tresor', 8, ['chapelet', '#e8e0c8'], { desc: 'Un chapelet dont les grains sont des dents. On en a compté trente-deux, puis on a cessé de compter.' });
defItem('v5_sceau_ville', 'Sceau de la Ville Basse', 'tresor', 40, ['sceau', '#8a6a3a'], { desc: 'Un sceau de bronze. La ville avait un nom : le sceau l’a gardé, à l’envers, et la cendre l’a bouché.' });
defItem('v5_cerceau', 'Cerceau', 'tresor', 1, ['anneau', '#8a6a44'], { desc: 'Un cerceau d’enfant, sans sa baguette. En bas, les enfants n’ont pas le droit de courir.' });
defItem('v5_masque_cire', 'Masque de cire', 'tresor', 22, ['masque', '#e0d4b0'], { desc: 'Un masque de cire, moulé sur le visage d’un mort pour qu’on se souvienne de lui. Celui-ci a souri en mourant.' });
defItem('v5_cloche_muette', 'Clochette muette', 'tresor', 4, ['clochettes', '#9a7a3a'], { desc: 'Une clochette de bronze dont on a limé le battant. On l’a fait taire, comme l’autre.' });
defItem('v5_bague_os', 'Bague d’os', 'tresor', 5, ['anneau', '#e4dcc4'], { desc: 'Une bague taillée dans un os, à la taille d’un doigt de femme. On s’y marie, en bas, avec ce qu’on a.' });
defItem('v5_carnet_ermite', 'Carnet de l’ermite', 'tresor', 2, ['livre', '#3a3026'], { desc: 'Un carnet de toile cirée, gonflé d’humidité. Un homme a regardé passer le Ver pendant des années. En main, un clic : vous le feuilletez.', v5lire: true });

// ce qu'on lit en cliquant (l'objet en main)
const V5_LECTURES = Object.assign({}, V5_LETTRES, {
  v5_livre_feve: { titre: 'Le livre de comptes de Joachim Fève', texte: 'Des colonnes de chiffres, d’une écriture appliquée. Douze barriques pour le château. Quarante cercles de fer. Un foudre de trois mètres, « pour la cave, pour moi ». Des fûts livrés, des fûts payés, d’autres non.\n\nLa dernière page n’a pas de chiffres :\n\n« Fermé le soir. La cendre tombe. Les miens sont descendus, avec les morts de la rue et le feu de l’église. Je rouvrirai au matin, pour ceux qui viendront après. Je compterai ceux qui passent. »' },
  v5_carnet_ermite: { titre: 'Le carnet de l’ermite', texte: 'Il passe deux fois le jour, une fois la nuit. Le matin, il vient de la montagne ; le soir, il y retourne. La nuit, je ne le vois pas : je l’entends, et la paille du toit bouge.\n\nIl ne regarde jamais en bas, sous les pierres. Il regarde ce qui bouge.\n\nJ’ai compté. En onze ans, il ne s’est posé que trois fois sur la Ville Basse. Les trois fois, c’était au-dessus de la tonnellerie. Il écoutait.\n\n(Les pages suivantes sont collées par l’humidité.)' },
});

// ---------------------------------------------------------------- les butins
LOOT.v5_maison = { rolls: [0, 2], items: [['v5_pain_racines', 1, 1, 3], ['bougie', 1, 2, 3], ['os', 1, 2, 2], ['vieille_piece', 1, 1, 1.2], ['tesson', 1, 1, 1], ['v5_dents_lait', 1, 1, 0.3], ['v5_bague_os', 1, 1, 0.35], ['v5_chapelet_dents', 1, 1, 0.25], ['v5_cerceau', 1, 1, 0.2], ['v5_cloche_muette', 1, 1, 0.15]] };
LOOT.v5_caveau = { rolls: [1, 2], items: [['vieille_piece', 1, 1, 2], ['bougie', 1, 2, 3], ['tesson', 1, 2, 3], ['os', 1, 3, 3], ['argent', 4, 16, 2], ['v5_chapelet_dents', 1, 1, 0.6], ['relique', 1, 1, 0.15]] };

// ---------------------------------------------------------------- le troc de la Marchande : ce qui a vu le jour, contre ce qui vient d'en bas
// (valeur de ce qu'elle prend, en « jours » ; prix de ce qu'elle donne)
const V5_TROC_PREND = { pain: 2, sel: 2, pomme: 1, vin: 2, fromage: 3, oeuf: 1, miel: 3, bougie: 1, lait: 1, viande: 2, brioche: 3, tarte: 3, fleur: 1 };
const V5_TROC_DONNE = [
  { id: 'v5_pain_racines', prix: 1 },
  { id: 'v5_linceul', prix: 4 },
  { id: 'v5_dire', prix: 2 },
];
