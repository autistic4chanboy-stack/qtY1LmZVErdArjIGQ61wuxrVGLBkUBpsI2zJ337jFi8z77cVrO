// ============================================================================
//  LES LIEUX PERDUS : ce qu'on y lit, ce qu'on y trouve, ce qui s'y cache
//  (agent C1 ; la génération et le jeu sont dans 11-zzzz7-carte.js)
//  - C2_TEXTES : inscriptions, plaques, épitaphes, graffitis, ex-voto, devises
//    (en français ; on les lit, on ne les explique pas) ;
//  - de nouvelles inscriptions en aëlin et en gorrain, avec les seuls mots des
//    deux langues : elles se déchiffrent par recoupement, comme les autres ;
//  - des lettres (onglet Lettres de la sacoche), glissées dans les conteneurs ;
//  - des histoires à recouper, dont le bout est une cachette qu'on ne voit
//    qu'une fois l'indice lu (C2_INDICES), et des choses qui n'arrivent qu'à
//    une heure ou un jour de la semaine (C2_SECRETS).
//  Les solutions : scratchpad/eq/solutions-C1.md (pour le coordinateur).
// ============================================================================

// ---------------------------------------------------------------- inscriptions, plaques : id → [titre, texte, ce qu'on voit en plus]
const C2_TEXTES = {
  // croix de peste
  cp1: ['Sur le socle', 'EN L’AN 1631 LA CONTAGION\nPRIT CEUX DU VAL\nON LES MIT ICI SANS CLOCHE NI PRÊTRE\nPASSANT, UN AVE POUR EUX'],
  cp2: ['Sur le socle', '1720\nILS ÉTAIENT QUARANTE-DEUX\nDIEU SEUL SAIT LEURS NOMS'],
  cp3: ['Sur le socle', 'PESTE DE 1631\nNE CREUSEZ PAS', 'Quelqu’un a gratté le « PAS », puis l’a regravé, plus profond.'],
  cp4: ['Sur le socle', 'À LA MÉMOIRE DES GENS DU HAMEAU DES AULNES\nMORTS DE LA FIÈVRE EN SEPTEMBRE 1629\nLE HAMEAU N’A PAS ÉTÉ REBÂTI'],
  cp5: ['Sur le socle', 'ICI REPOSENT CEUX\nQUE LA VILLE N’A PAS VOULU RECEVOIR\n1631', 'Les lettres sont plus nettes que la pierre. On les a repassées au couteau, il n’y a pas longtemps.'],
  // chapelles
  ch1: ['Le linteau', 'SANCTE GENESI ORA PRO NOBIS\nMDLXXXVIII', 'Dessous, plus petit, gravé à la pointe : « Elle sonnait toute seule. »'],
  ch2: ['Le linteau', 'BÂTIE PAR LA CONFRÉRIE DES PÉNITENTS BLANCS\nL’AN 1602\nQUI ENTRE ICI SE TAIT'],
  ch3: ['Le linteau', 'IN MEMORIAM FRATRUM\nQUI IN MONTE PERIERUNT', 'Du latin. Vous le lisez mal.'],
  ch4: ['Le linteau', 'SAINT LOUP GARDE LES BÊTES\nET CEUX QUI LES GARDENT'],
  ch5: ['Le linteau', 'CHAPELLE FERMÉE PAR ORDRE DE MONSEIGNEUR\nLE 3 NOVEMBRE 1791\nNE PAS ROUVRIR', 'Un cadenas rouillé pend encore à un piton. La porte, elle, n’existe plus.'],
  ch6: ['Le linteau', 'IHS\n1644', 'Sous les lettres, quelqu’un a gravé treize petits traits, et les a barrés un à un.'],
  // tombes
  tb1: ['L’épitaphe', 'ICI REPOSE\nJEAN-BAPTISTE MOREL\nCOLPORTEUR\nTROUVÉ SUR CE CHEMIN LE 3 MARS 1847\nIL N’ÉTAIT PAS D’ICI', 'La tombe est mieux tenue que bien d’autres. Quelqu’un y vient.'],
  tb2: ['L’épitaphe', 'À JEANNE ET MARIE VIGNAL\nQUI N’ONT PAS VOULU DESCENDRE\nHIVER 1812'],
  tb3: ['L’épitaphe', 'À L’ENFANT\nQU’ON N’A PAS PU BAPTISER\nIL A VU LE JOUR UNE HEURE', 'Pas de nom. Une petite pierre ronde est posée sur la dalle, comme un jouet.'],
  tb4: ['L’épitaphe', 'ÉTIENNE LAFARGE\nGRENADIER\nRENTRÉ DE RUSSIE À PIED\nMORT À UNE LIEUE DE CHEZ LUI\n1813'],
  tb5: ['L’épitaphe', 'ÉLISE\n1859\nELLE ATTEND', 'Le « ELLE ATTEND » est d’une autre main, plus tard.'],
  tb6: ['L’épitaphe', 'UN ÉTRANGER\nTROUVÉ DANS LA NEIGE\nIL PARLAIT UNE LANGUE QUE PERSONNE NE CONNAISSAIT\nDIEU LE CONNAÎT'],
  // gibets
  gb1: ['La plaque', 'HAUTE JUSTICE DE VALMONT\nQUATRE PILIERS', 'Il n’en reste que deux.'],
  gb2: ['La plaque', 'ICI FUT PENDU LE 9 AOÛT 1703\nPIERRE AUDOUIN DIT LE LOUP\nPOUR LE MEURTRE DE LA FAMILLE RAVEL\nIL S’EST DIT INNOCENT JUSQU’AU BOUT'],
  gb3: ['La plaque', 'PAR ORDRE DU SEIGNEUR\nLES CORPS RESTERONT PENDUS\nJUSQU’À CE QUE LES CORBEAUX EN AIENT FINI'],
  gb4: ['La plaque', 'Le métal est rongé. On ne lit plus qu’une date, 1698, et un mot : « PARDON ».'],
  gb5: ['La plaque', 'LES FOURCHES FURENT ABATTUES EN 1790\nPUIS RELEVÉES EN 1791\nPAR LES MÊMES'],
  // menhirs
  mh1: ['La pierre', 'Une pierre haute comme deux hommes, penchée vers le levant. À son pied, l’herbe ne pousse pas, sur un cercle parfait.'],
  mh2: ['La pierre', 'On a gravé une croix sur la pierre, au burin, sans soin. Dessous, plus anciens, des creux ronds à demi effacés.'],
  mh3: ['La pierre', 'Contre la pierre, des souliers d’enfant, très usés, alignés. Six paires.'],
  mh4: ['La pierre', 'La pierre est tiède sous la main, même à l’ombre, même le matin.'],
  mh5: ['La pierre', 'Une rigole est taillée dans la pierre, du haut vers le bas, et finit dans une cuvette. Il y a de l’eau dans la cuvette. Il n’a pas plu.'],
  mh6: ['La pierre', 'Sur la face nord, des initiales et des dates, des siècles d’amoureux. La plus ancienne dit 1512. La plus récente est d’hier : la pierre est encore blanche au fond des entailles.'],
  // cupules
  cu1: ['Les creux', 'Des creux ronds et lisses, de la taille d’un poing, reliés par des rigoles. L’eau de pluie passe de l’un à l’autre et finit dans le plus grand.'],
  cu2: ['Les creux', 'Dans les creux, des pièces vertes de vieillesse, et un bouton de nacre.'],
  cu3: ['Les creux', 'Treize creux. Vous les avez comptés deux fois.'],
  // bornes
  bo1: ['La borne', 'D’un côté, une fleur de lys. De l’autre, une crosse d’abbé. Dessus, un trait qui sépare les deux.'],
  bo2: ['La borne', '« VALMONT ». Au dos, plus petit : « Ici finit la terre du seigneur. Au-delà, elle est à Dieu, ou à personne. »'],
  bo3: ['La borne', '« B. R. 17 ». Une borne du roi. On l’a déplacée : le trou de l’ancienne est encore là, trois pas plus loin.'],
  bo4: ['La borne', '« MONTREVEL — 1614 — ABB. » Et une main gravée à plat, les doigts écartés, qui montre la montagne.'],
  // fours à chaux
  fc1: ['La pierre gravée', 'FOUR DE LA COMMUNE\n1811\nG. BARRAUD MAÇON', 'La bouche du four est pleine de cendres froides et de pierres cuites.'],
  fc2: ['La pierre gravée', 'FOUR À CHAUX DES MOINES\nNE PAS DORMIR DEVANT LA BOUCHE'],
  fc3: ['La pierre gravée', '1788\nIL A CUIT TROIS JOURS ET TROIS NUITS\nPOUR L’ÉGLISE'],
  fc4: ['La pierre gravée', '« Ici a péri Antoine Rey, chaufournier, tombé dans la chaux vive. 1834. » Plus bas, une autre main : « Il ne l’a pas voulu. »'],
  // glacières
  gl1: ['Le linteau', 'GLACIÈRE DES MOINES DE MONTREVEL\n1734', 'Au fond, dans le noir, un froid qui ne vient pas de la pierre.'],
  gl2: ['Le linteau', 'GLACIÈRE DU CHÂTEAU\nLA GLACE SE COUPE AU LAC NOIR EN JANVIER'],
  gl3: ['Le linteau', '« Ce qu’on met au froid se garde. » La phrase est gravée deux fois, la seconde de travers.'],
  // tours
  to1: ['Les graffitis', 'Des noms, des dates, au couteau. « Jacques, 1789. » « Personne n’est venu. » Et, tout en bas, un visage de profil, bien fait, avec des yeux ouverts partout sur la joue.'],
  to2: ['Les graffitis', 'Un décompte en bâtons, qui couvre toute une pierre. Il s’arrête au milieu d’une ligne.'],
  to3: ['Les graffitis', '« D’ici on voit la vieille ferme. Il y a de la lumière la nuit. Personne n’y habite. » Pas de date.'],
  to4: ['Les graffitis', 'Une carte de la vallée, grattée à la pointe : la ville, le lac, la montagne, et une croix au milieu de nulle part, qu’on a ensuite grattée jusqu’à l’effacer.'],
  to5: ['Les graffitis', '« Vu trois feux sur la montagne. Personne n’y monte l’hiver. » Signé d’un seul mot : « Veilleur ».'],
  // sources
  so1: ['La plaque', 'FONTAINE SAINT-MARTIN\nGUÉRIT LES FIÈVRES DES ENFANTS\nON NE LAVE PAS LE LINGE ICI'],
  so2: ['La plaque', 'SOURCE SAINTE-AGATHE\nPOUR LE LAIT DES MÈRES', 'De petits linges blancs sèchent sur les pierres, pliés avec soin.'],
  so3: ['La plaque', '« Qui boit ici avant le soleil guérit. Qui boit après la lune oublie. » Il n’est pas dit quoi.'],
  so4: ['La plaque', 'FONTAINE AUX FIÈVRES\nTROIS GORGÉES, PAS QUATRE'],
  so5: ['La plaque', 'EAU RENDUE AU CULTE EN 1822\nPAR L’ABBÉ SÉGUR', 'Sous l’inscription, on en a gratté une autre, en colonnes de traits anguleux. Il en reste des morceaux.'],
  // ruchers
  ru1: ['La pierre gravée', 'RUCHER DE L’ABBAYE\nLES ABEILLES SONT À DIEU\nLE MIEL AUX FRÈRES'],
  ru2: ['La pierre gravée', '« On leur dit les morts. » Plus bas, une liste de prénoms, et en face de chacun un petit trait.'],
  ru3: ['La pierre gravée', '« Frère Ambroise a gardé les abeilles cinquante ans. Elles l’ont suivi au cimetière. 1702. »'],
  // cols
  co1: ['Les ex-voto', 'Des plaques de fer-blanc, clouées. « Merci, sainte Vierge, pour mon fils revenu du col. 1838. » « Pour le mulet, qui a tenu. » « Pour ceux d’en face. »'],
  co2: ['Les ex-voto', '« Reconnaissance. » « Reconnaissance. » « Reconnaissance. » Et une seule autre : « Rendez-le. »'],
  co3: ['Les ex-voto', 'Une béquille clouée à la croix, un ruban fané. Une plaque : « Monté avec. Redescendu sans. 1851. »'],
  co4: ['Les ex-voto', '« Au passage des Treize, priez. » Personne n’a écrit pour qui.'],
  co5: ['Les ex-voto', 'Une plaque de cuivre, plus neuve : « Pour la bête qui m’a ramené quand je ne voyais plus. Je ne sais pas ce que c’était. »'],
  // avalanches
  av1: ['Les noms gravés', 'ICI L’AVALANCHE DU 2 FÉVRIER 1821 A PRIS\nPIERRE, ANTOINE ET LE PETIT JEAN ARNAUD\nILS REVENAIENT DE LA FOIRE'],
  av2: ['Les noms gravés', 'MARIE-ROSE CHAPUIS, 17 ANS\nPARTIE CHERCHER LES CHÈVRES\nLE PRINTEMPS L’A RENDUE'],
  av3: ['Les noms gravés', 'SEPT MULETIERS ET LEURS BÊTES\n1778\nLA NEIGE A TOUT GARDÉ'],
  av4: ['Les noms gravés', '« Mon père est là-dessous depuis 1840. Je monte le voir chaque année. L. G. » Les années suivent, gravées une à une, jusqu’à 1861.'],
  // la pierre aux trois croix
  tc1: ['La pierre', 'Trois croix gravées, trois de bois plantées derrière. Sur la pierre, des initiales, « A. V. », une date, 1856, et un mot : « Pardonne ».'],
  tc2: ['La pierre', 'Trois croix. Sous la troisième, on avait gravé un visage de femme. On l’a martelé ensuite, avec soin.'],
  // oratoires (on s'y recueille)
  or1: ['L’oratoire', 'Saint Roch, qui fut soigné par un chien, gardez nos bêtes et nos enfants.', 'Des bouquets secs, et un bol de lait retourné.'],
  or2: ['L’oratoire', 'Notre-Dame des Neiges, priez pour ceux qui passent le col.'],
  or3: ['L’oratoire', 'Une vierge noire, pas plus haute qu’une main. On dit qu’on l’a trouvée dans ce champ en labourant, et qu’elle y est revenue trois fois quand on l’a portée à l’église.'],
  or4: ['L’oratoire', 'Une gerbe de paille tressée, à la place du saint. On l’a changée il y a peu.'],
  or5: ['L’oratoire', 'Saint Christophe, porte-nous de l’autre côté.'],
  or6: ['L’oratoire', 'La niche est vide. Dans la poussière, la trace d’une petite statue. On a fleuri quand même.'],
  // l'arbre aux vœux
  vx1: ['Les billets', '« Que Louis revienne de l’armée. » « Que la vache vêle bien. » « Qu’il ne m’aime plus. » « Pour la pluie. » « Pour que la pluie s’arrête. »'],
  vx2: ['Les billets', '« Guérissez maman. » Le même billet, dix fois, de la même écriture d’enfant, sur dix rubans.'],
  vx3: ['Les billets', '« Rendez-moi ma fille. » Encore, et encore. Un seul billet est d’une autre main : « Elle est bien où elle est. »'],
  vx4: ['Les billets', 'Des bouts de papier délavés. Sur l’un, on lit encore un prénom : « {prenom} ». Rien d’autre.'],
  // devises des cadrans
  devise0: ['', 'L’HEURE PASSE, LA MORT VIENT'],
  devise1: ['', 'VULNERANT OMNES, ULTIMA NECAT'],
  devise2: ['', 'SANS LE SOLEIL JE ME TAIS'],
  devise3: ['', 'JE NE COMPTE QUE LES HEURES CLAIRES'],
  // refuges ruinés
  rf1: ['Le linteau', 'REFUGE DU CLUB DES MARCHEURS\n1848\nQUI ENTRE FERME LA PORTE', 'Il n’y a plus de porte.'],
  rf2: ['Le linteau', '« Ici on a passé onze jours de tempête, à six. On est redescendus à cinq. » Pas de nom.'],
  rf3: ['Le linteau', 'Une croix, et dessous, au couteau : « Ne dormez pas ici les nuits sans étoiles. »'],
  // signaux de la carte
  sg1: ['La plaque de fonte', 'CARTE DE FRANCE\nSIGNAL GÉODÉSIQUE\nN° 212\n1818', 'Quelqu’un a ajouté au couteau, dans le bois du trépied : « 213 ».'],
  sg2: ['La plaque de fonte', 'DÉPÔT DE LA GUERRE\nSIGNAL DE PREMIER ORDRE\nNE PAS DÉPLACER', 'Il a été déplacé : les trous des anciens pieds sont à deux pas.'],
  sg3: ['La plaque de fonte', 'SIGNAL N° 7\nLES INGÉNIEURS NE SONT PAS REDESCENDUS PAR CE CÔTÉ'],
  dame_bois: ['La figure de bois', 'Une femme taillée dans un tronc d’aulne, les mains ouvertes vers l’eau. Des rubans noués aux poignets. À ses pieds, dans la vase, des coquilles rangées en cercle, et une bougie éteinte.'],
};
const C2_TEXTES_POOLS = {
  croix_peste: ['cp1', 'cp2', 'cp3', 'cp4', 'cp5'], chapelle: ['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6'], tombe: ['tb1', 'tb2', 'tb3', 'tb4', 'tb5', 'tb6'],
  gibet: ['gb1', 'gb2', 'gb3', 'gb4', 'gb5'], menhir: ['mh1', 'mh2', 'mh3', 'mh4', 'mh5', 'mh6'], cupules: ['cu1', 'cu2', 'cu3'], borne: ['bo1', 'bo2', 'bo3', 'bo4'],
  four_chaux: ['fc1', 'fc2', 'fc3', 'fc4'], glaciere: ['gl1', 'gl2', 'gl3'], tour: ['to1', 'to2', 'to3', 'to4', 'to5'], source: ['so1', 'so2', 'so3', 'so4', 'so5'],
  rucher: ['ru1', 'ru2', 'ru3'], col: ['co1', 'co2', 'co3', 'co4', 'co5'], avalanche: ['av1', 'av2', 'av3', 'av4'], trois_croix: ['tc1', 'tc2'],
  oratoire: ['or1', 'or2', 'or3', 'or4', 'or5', 'or6'], voeux: ['vx1', 'vx2', 'vx3', 'vx4'], refuge: ['rf1', 'rf2', 'rf3'], signal: ['sg1', 'sg2', 'sg3'],
};

// ---------------------------------------------------------------- les pierres gravées nouvelles (les mots des deux langues, rien d'autre)
// (lieu : null — 11-zzz22-langues.js ne leur cherche pas de place ; la génération les grave sur les pierres des lieux)
{
  const L = [
    ['g_c2_kran', 'gorrain', 'kran hak bul , tuk gor gar', 'Des os d’homme dessous ; la pierre debout garde.'],
    ['g_c2_ulv', 'gorrain', 'hol ulv , ta vok gar', 'La nuit, le loup ; toi, garde le feu.'],
    ['g_c2_brek', 'gorrain', 'tunn gor ruk , nuk brek', 'La pierre lourde marche ; ne la casse pas.'],
    ['g_c2_skaa', 'gorrain', 'skaa dun , mor dunn , hak mek', 'Le ciel haut, la montagne grande, l’homme petit.'],
    ['g_c2_kuv', 'gorrain', 'kuv gor-gor , olm zogga , ma-ma hum', 'Cercle de pierres : la lune va, nous dormons.'],
    ['g_c2_rag', 'gorrain', 'rag bul gor , lokka , ta zog nuk', 'L’eau sous la pierre : regarde, et toi, ne va pas.'],
    ['g_c2_trek', 'gorrain', 'trek gor tuk , ulm dek hal', 'Trois pierres debout : deux géants sont morts.'],
    ['g_c2_vogga', 'gorrain', 'vogga aal , hol ulv , ek hak ruk', 'Le soleil, la lumière ; la nuit, le loup ; un homme marche.'],
    ['a_c2_rath', 'aelin', 'rath na-eldim , teh ma eth', 'Le chemin des anciens, ici et là-bas.'],
    ['a_c2_ser', 'aelin', 'ser na-aela , ior ven', 'L’eau d’Aëla : l’enfant vit.'],
    ['a_c2_oth', 'aelin', 'ael nai fal , oth sae', 'La lumière ne tombe pas ; la mort dort.'],
    ['a_c2_vael', 'aelin', 'vael mora ulen , hem rath', 'Le vent de la montagne se tait ; l’homme, le chemin.'],
    ['a_c2_sil', 'aelin', 'sil neth thal , ne tor rhua', 'L’argent sous la pierre : celui qui ouvre, rends.'],
    ['a_c2_hal', 'aelin', 'hal na-ila , ul', 'La maison de la femme. Silence.'],
  ];
  for (const [id, lang, texte, sens] of L) {
    if (INSCR_BY_ID[id]) continue;
    INSCRIPTIONS.push([id, lang, texte, sens, null]);
    INSCR_BY_ID[id] = { id, lang, texte, sens, lieu: null };
  }
}
const C2_INS_POOLS = {
  gorrain: ['g_c2_kran', 'g_c2_ulv', 'g_c2_brek', 'g_c2_skaa', 'g_c2_kuv', 'g_c2_rag', 'g_c2_trek', 'g_c2_vogga'],
  aelin: ['a_c2_rath', 'a_c2_ser', 'a_c2_oth', 'a_c2_vael', 'a_c2_sil', 'a_c2_hal'],
};

// ---------------------------------------------------------------- les lettres (onglet Lettres de la sacoche)
Object.assign(F2_PAPIERS, {
  // les loges des charbonniers
  c2_charb1: { t: 'Un billet plié en quatre', x: 'Cousin,\n\nLa vente se tiendra à la loge du Grand Hêtre, la nuit de la Saint-Thibaut. Viens avec le bois, le sel et l’eau. Ne réponds à personne qui ne te donne pas le mot.\n\nLe mot est le même que l’an passé. Tu le sais.', s: 'Un Bon Cousin' },
  c2_charb2: { t: 'Un compte de charbon', x: 'Meule du Chassedi : quatorze sacs. Vendu à la forge : onze. Mangé par la pluie : deux. Donné à la vieille des Aulnes : un.\n\nMeule du Vorndi : pas allumée. On n’allume pas le Vorndi.' },
  c2_charb3: { t: 'Une lettre de femme', x: 'Mon homme,\n\nLe petit tousse depuis la Saint-Jean. La guérisseuse dit que c’est le froid des bois. Reviens avant l’hiver, ou fais-nous monter, que je voie au moins où tu dors.\n\nOn dit en ville que les charbonniers ne sont pas chrétiens. J’ai dit que tu fais ta prière comme tout le monde. C’est vrai, dis ?', s: 'Ta Madeleine' },
  c2_charb4: { t: 'Une feuille arrachée', x: 'Autour de la meule, il faut veiller. Le feu doit couver sans flamber. Si la meule s’éventre, c’est que quelqu’un a marché dessus.\n\nCette nuit, la meule s’est éventrée. Il n’y avait personne. Il y avait des traces.' },
  c2_charb5: { t: 'Un bout de papier gras', x: 'Si tu montes à la loge, siffle deux fois bas et une fois haut. Sinon on ne t’ouvre pas.' },
  // les cabanes de bûcherons
  c2_buch1: { t: 'Une lettre', x: 'Frère,\n\nLe marchand de bois de la ville paie moins que l’an passé. Il dit que tout le monde vend. Moi je dis qu’il ment.\n\nJ’ai marqué les chênes du fond, ceux près de la pierre. Personne ne veut les abattre. On dit qu’ils sont à quelqu’un.', s: 'Joseph' },
  c2_buch2: { t: 'Des encoches, et trois lignes', x: 'Hêtre : six. Chêne : deux. Sapin : onze.\nLe grand chêne : non.\nLe grand chêne : non.\nLe grand chêne : NON.' },
  c2_buch3: { t: 'Une lettre jamais envoyée', x: 'Ma chère mère,\n\nIci on dort dans la cabane à trois. On entend la forêt la nuit. Pas les bêtes : la forêt. Le vieux dit qu’elle compte les arbres qu’on lui prend.\n\nJe vous envoie deux francs. Il en manque un : je l’ai laissé sur la souche du grand chêne, comme les autres. Ici tout le monde le fait.' },
  c2_buch4: { t: 'Un reçu', x: 'Reçu de Monsieur le garde, pour la coupe du bois des Aulnes, douze francs.\n\nLe garde a dit de ne pas couper après la brune. Il n’a pas dit pourquoi.' },
  // les bergeries
  c2_berg2: { t: 'Un compte de brebis', x: 'Montées : deux cent douze. Descendues : deux cent quatre. Mangées par le loup : trois. Tombées : deux. Perdues : trois.\n\nPerdues, ça ne veut rien dire. On les a comptées au matin : elles n’étaient pas là. Au soir, il y en avait une de plus. Pas à nous.' },
  c2_berg3: { t: 'Une lettre', x: 'Pâtre,\n\nNe laisse jamais le troupeau coucher au Plan des Morts. Même par beau temps. Même si l’herbe y est grasse. Surtout si l’herbe y est grasse.', s: 'Le baïle' },
  c2_berg4: { t: 'Un papier plié', x: 'À la Saint-Jean, on allumera le feu sur la crête, comme toujours. Ceux d’en bas le verront. Ceux d’en haut aussi.' },
  // les affûts
  c2_chas1: { t: 'Un carnet de chasse', x: 'Cerf blanc vu trois fois cette année. Jamais tiré. On ne tire pas le cerf blanc.\n\nSanglier blessé le 12, perdu dans les ronces. Retrouvé le 14, mort, les yeux mangés. Pas par les corbeaux.' },
  c2_chas2: { t: 'Un carnet', x: 'Affût du soir : rien. Affût du matin : rien. La forêt se tait depuis trois jours, même les merles.\n\nQuand la forêt se tait, c’est qu’elle regarde autre chose que vous. Mon père disait ça. Il est mort à l’affût, les yeux ouverts.' },
  c2_chas3: { t: 'Une page', x: 'Passage des bêtes : au gué, à l’aube. Le loup passe la nuit. L’autre chose passe entre les deux, quand il ne fait ni jour ni nuit. Je ne l’ai jamais vue. Je l’ai sentie passer.' },
  // la cabane perchée
  c2_enf1: { t: 'Une lettre d’enfant', x: 'Si tu trouves ma cabane tu peux prendre les billes mais pas le couteau de papa. C’est à moi. Si tu le prends je le saurai.', s: 'Paul, neuf ans et demi' },
  c2_enf2: { t: 'Une lettre d’enfant', x: 'Il y a quelqu’un qui monte à l’échelle la nuit. Je fais semblant de dormir. Il reste en haut de l’échelle, il regarde, il redescend. Il sent le mouillé.\n\nJe ne l’ai pas dit à maman.', s: 'Paul' },
  c2_enf3: { t: 'Une page de cahier', x: 'Aujourd’hui j’ai donné mon pain à la dame du lac. Elle ne l’a pas mangé. Elle a dit merci quand même. Elle a une voix comme quand on met la tête dans le baquet.' },
  // les moulins
  c2_moul1: { t: 'Une lettre du meunier', x: 'Monsieur le Maire,\n\nLe moulin ne tourne plus depuis que les ailes ont brûlé. On a dit que c’était la foudre. Il n’y avait pas d’orage.\n\nJe vous demande la permission de ne pas le rebâtir.', s: 'Barthélemy Roux, meunier' },
  c2_moul2: { t: 'Une reconnaissance de dette', x: 'Doit Roux, meunier, au sieur de Valmont, la mouture de trois ans. Le meunier dit qu’il paiera quand le vent reviendra.\n\nLe vent n’est pas revenu.' },
  c2_moul3: { t: 'Un billet', x: 'Ne va pas au moulin la nuit du Vorndi. Il tourne. Sans ailes, il tourne.' },
  // les bivouacs
  c2_camp1: { t: 'Une page de journal', x: 'Troisième jour dans la vallée. Personne ne veut nous vendre de pain. On nous regarde comme si on venait de très loin. On vient de Lyon.\n\nLa nuit, au bivouac, quelqu’un a tourné autour du feu. Pas de traces au matin.' },
  c2_camp2: { t: 'Une lettre de roulier', x: 'Patron,\n\nLa charrette est cassée, les chevaux sont partis. Je reste avec la marchandise. Si je ne suis pas là quand vous viendrez, ne me cherchez pas au lac.', s: 'Fernand' },
  c2_camp3: { t: 'Un billet de colporteur', x: 'Almanachs : douze. Images : quarante. Aiguilles : deux paquets. Vendu à Clairpré : rien. On m’a dit d’attendre le Foiredi. Je n’attendrai pas.' },
  c2_camp4: { t: 'Une page', x: 'Ici on dort mal. Les chiens des fermes aboient vers la montagne toute la nuit. Le garçon de l’auberge dit qu’ils aboient toujours, qu’on s’habitue.' },
  // les charrettes
  c2_char1: { t: 'Une lettre de voiture', x: 'Lettre de voiture.\nExpéditeur : maison Fabre, fondeurs, Grenoble.\nDestinataire : Monsieur le curé de la vallée.\nContenu : une cloche de bronze, deux cent douze livres, baptisée Marie-Genès.\nArrivée : ', s: 'La case est restée blanche.' },
  c2_char2: { t: 'Un papier', x: 'Le rémouleur est passé le lundi. Il a aiguisé tous les couteaux du hameau. Le mardi, il était reparti, et tous les couteaux étaient émoussés.' },
  c2_char3: { t: 'Une facture', x: 'Doit la ferme Varenne : un soc de charrue, deux fers, une chaîne. Payé : non. « Il paiera à la moisson. »', s: 'D’une autre encre, par-dessus : il n’y a pas eu de moisson.' },
  // les galeries de prospecteurs
  c2_pros1: { t: 'Un carnet de prospecteur', x: 'Filon de plomb argentifère, maigre. Continué la galerie de trente pas. Au bout, la roche sonne creux.\n\nMuré le fond. Je n’aime pas ce qu’on entend derrière.' },
  c2_pros2: { t: 'Une lettre', x: 'Mon associé est parti avec les mulets et la poudre. Il me reste le pic, la lampe, et le chant.\n\nLe chant vient du fond de la galerie, à la tombée de la nuit. C’est l’eau, sûrement. C’est l’eau.' },
  c2_pros3: { t: 'Une concession', x: 'Concession de mine accordée au sieur Martel pour trente ans, à condition de ne pas creuser sous la montagne au-delà de la marque.', s: 'En marge, au crayon : « Quelle marque ? »' },
  // les pigeonniers
  c2_pig1: { t: 'Un message roulé', x: 'Tout va bien. Ne venez pas.' },
  c2_pig2: { t: 'Un message roulé', x: 'Le colombier est au seigneur. Les pigeons aussi. Et ce qu’ils mangent dans nos champs aussi.', s: 'Les gens du hameau, 1789' },
  c2_pig3: { t: 'Un message roulé', x: 'Ils sont arrivés. Ils sont treize. Ne répondez pas.' },
  // les caches des contrebandiers
  c2_contr1: { t: 'Un billet dans une fente', x: 'Sel : six sacs. Tabac : deux ballots. Dentelle : rien, les douaniers l’ont prise au col.\n\nOn repassera par la cheminée quand la neige tiendra. Pas avant.' },
  c2_contr2: { t: 'Un billet dans une fente', x: 'Si tu lis ça, tu n’es pas des nôtres. Prends le tabac, laisse le reste. On saura.' },
  // barques, maisons forestières, fermes brûlées
  c2_pech1: { t: 'Un carnet de pêche', x: 'Anguilles : sept. Brochet : un.\n\nSur la rive des Planches, les gens du lac m’ont regardé pêcher sans rien dire. Une femme a versé du lait dans l’eau quand j’ai remonté le brochet.' },
  c2_pech2: { t: 'Un billet cloué', x: 'Cette barque n’est à personne. Elle est à celui qui la ramène.' },
  c2_for1: { t: 'Le registre du garde des bois', x: 'Coupes permises : bois des Aulnes, bois du Sud. Coupes défendues : le vieux bois, et la parcelle autour de la pierre.\n\nDélits : quatre. Le quatrième : des arbres abattus de nuit, dans la parcelle de la pierre. Pas de souches. Pas de copeaux. Des troncs couchés, comme endormis.' },
  c2_for2: { t: 'Une lettre au garde', x: 'Monsieur le garde,\n\nVous nous avez trop regardés. On vous a vu à la vente. Oubliez ce que vous avez vu, et on vous oubliera aussi.\n\nC’est un conseil de cousin.' },
  c2_fer1: { t: 'Une lettre brûlée aux bords', x: '… le feu a pris dans la grange, puis dans la maison. On a sorti les enfants. On n’a pas pu sortir la grand-mère : elle ne voulait pas. Elle disait qu’on l’attendait.\n\nNous partons pour la ville. Ne nous écrivez pas.', s: 'Les Chabert' },
  c2_fer2: { t: 'Un bail', x: 'Bail à ferme, pour neuf ans, de la ferme dite des Aulnes, au sieur Chabert. Le bailleur ne répond ni des incendies, ni des loups, ni de ce qui descend de la montagne.' },
  c2_fer3: { t: 'Une page d’almanach', x: 'L’almanach de 1848, déchiré. Une seule prédiction est cochée, au crayon : « Un feu sans foudre. »' },
  // les histoires (posées à part, voir C2_HISTOIRES)
  c2_morel: { t: 'Un carnet de colporteur', x: 'Doit Aubert : douze sous. Payé.\nDoit la veuve Rey : trois francs. Payé en œufs.\nDoit V. : quarante francs, pour la montre d’argent. Ne veut pas payer. Dit qu’il paiera au four, là où personne ne passe.\n\nJ’y vais demain matin.', s: 'J.-B. M.' },
  c2_vignal: { t: 'Une lettre au crayon', x: 'Nous ne descendrons pas. La vache ne passera pas l’hiver en bas ; elle n’a jamais connu que la montagne, et nous non plus.\n\nSi on vient nous chercher, dites que nous sommes parties avec les autres. Ce ne sera pas un mensonge : nous partirons, un jour.\n\nL’argent est où grand-père le mettait. Derrière la pierre qui a un trou, dans la cabane ronde.', s: 'Jeanne et Marie' },
  c2_gele1: { t: 'Une lettre gelée', x: 'Si on me trouve : je suis Louis Varenne, le frère d’Anselme. Je suis monté chercher ce qu’il a caché, puisqu’il ne voulait pas le dire. Il fait très froid. Je vais m’asseoir un moment.\n\nDites à Anselme que je ne lui en veux pas.' },
  c2_anselme: { t: 'Des lettres liées d’un ruban', x: 'Un paquet de lettres, toutes de la même main de femme, toutes adressées à « A. V., à la ferme ». La dernière dit seulement :\n\n« Ne m’attends plus. Mets ce que tu gardais pour nous deux sous les trois croix, et n’y pense plus. Moi, j’y penserai pour deux. »', s: 'Signé d’une initiale : « É. »' },
});
const C2_LETTRES_POOLS = {
  charbonnier: ['c2_charb1', 'c2_charb2', 'c2_charb3', 'c2_charb4', 'c2_charb5'], bucheron: ['c2_buch1', 'c2_buch2', 'c2_buch3', 'c2_buch4'],
  berger: ['c2_berg2', 'c2_berg3', 'c2_berg4'], chasseur: ['c2_chas1', 'c2_chas2', 'c2_chas3'], enfant: ['c2_enf1', 'c2_enf2', 'c2_enf3'],
  moulin: ['c2_moul1', 'c2_moul2', 'c2_moul3'], camp: ['c2_camp1', 'c2_camp2', 'c2_camp3', 'c2_camp4'], charrette: ['c2_char1', 'c2_char2', 'c2_char3'],
  prospecteur: ['c2_pros1', 'c2_pros2', 'c2_pros3'], pigeon: ['c2_pig1', 'c2_pig2', 'c2_pig3'], gele: ['c2_gele1'], pecheur: ['c2_pech1', 'c2_pech2'],
  forestier: ['c2_for1', 'c2_for2'], ferme: ['c2_fer1', 'c2_fer2', 'c2_fer3'], contrebande: ['c2_contr1', 'c2_contr2'],
};

// ---------------------------------------------------------------- les objets des histoires
defItem('montre_morel', 'Montre d’argent', 'tresor', 70, ['montre', '#c8c8d0'], { desc: 'Une montre de poche, en argent. Au dos, gravé : « J.-B. M. ». Elle s’est arrêtée à six heures et quart.' });
defItem('bague_vignal', 'Bague de fiançailles', 'tresor', 55, ['anneau', '#d0b060'], { desc: 'Un anneau d’or fin, usé d’un côté. À l’intérieur : « J. V. — pour quand tu descendras ».' });
defItem('medaille_genes', 'Médaille de saint Genès', 'tresor', 40, ['medaillon', '#b89850'], { desc: 'Une médaille de bronze, un saint qui tient une cloche. Elle est tiède, comme si on venait de la tenir.' });

// ---------------------------------------------------------------- les indices : ce qu'on lit → la cachette qui apparaît
// (C2_CLES : les lectures qu'il faut en plus, le cas échéant)
const C2_INDICES = { c2_morel: 'morel', c2_vignal: 'vignal', 'registre:0': 'trois_croix', c2_anselme: 'trois_croix' };
const C2_CLES = {};
// le registre du sommet (quatre carnets différents selon les cairns)
const C2_REGISTRES = [
  ['Pierre Arnaud, guide, 1802. Beau temps. On voit le lac.', 'A. V., 1831. Première fois.', 'Les deux Chapuis, 1847. Vu les Treize sur la crête. Ne sommes pas restés.', 'A. V., 1856. Je ne remonterai plus. Elle est en bas, sous la pierre aux trois croix.'],
  ['L’abbé Ségur et deux enfants de chœur, 1822. Nous avons chanté le Te Deum. Le vent a emporté les mots.', 'Un Anglais, 1836. Il a écrit trois lignes dans sa langue, et dessiné un soleil noir.', 'A. V., 1844. La lettre n’est pas venue.'],
  ['Martel, prospecteur, 1829. Rien à gratter ici que du ciel.', 'Une ligne sans nom, sans date : « Il y a quelqu’un sur l’autre sommet qui écrit en même temps que moi. »', 'A. V., 1838. Elle a dit oui.'],
  ['Les guides Arnaud, père et fils, 1819.', 'Barthélemy Roux, meunier, 1840. Monté voir d’où vient le vent. Il ne vient de nulle part.', 'Louis V., 1857. Je cherche ce que mon frère a caché. Il n’est pas ici.'],
];
// les marques des familles d'estive (rochers aux marques) : remplacées par celles des gens de l'estive (11-zzzz7-carte3-peuples.js)
const C2_MARQUES = [
  'Une croix à potence, taillée profond. Dessous, cinq traits, puis trois, puis un.',
  'Deux traits croisés en X, comme une fourche. Dessous, un rond, et des encoches serrées.',
  'Trois barres, l’une sur l’autre. Tout autour, des initiales plus récentes.',
  'Un bâton avec deux branches, comme un arbre sans feuilles. Des dizaines d’encoches à côté.',
  'Six points en cercle. Au milieu, rien.',
  'Un trait droit et deux obliques : une flèche, ou un sapin. À côté, une date ancienne.',
];

// ---------------------------------------------------------------- les histoires : où poser les morceaux (à la génération, après le catalogue)
const C2_HISTOIRES = [
  // le colporteur Morel : sa tombe, son carnet dans un bivouac, sa boîte dans les cendres d'un four à chaux
  { id: 'morel', textes: [['tombe_isolee', 'tb1']], lettres: [['camp_abandonne', 'c2_morel']], cache: { type: 'four_chaux', label: 'Fouiller les cendres de la bouche du four', lx: 0, lz: 2.4, plus: [['montre_morel', 1]], pelle: 0 } },
  // les sœurs Vignal : leur tombe, leur lettre dans une bergerie, leur argent dans une borie
  { id: 'vignal', textes: [['tombe_isolee', 'tb2']], lettres: [['bergerie_ruine', 'c2_vignal']], cache: { type: 'borie', label: 'Passer la main derrière la pierre percée', lx: -1.3, lz: 1.5, plus: [['bague_vignal', 1]], pelle: 0 } },
  // Anselme Varenne : le registre des sommets, le frère gelé, les lettres d'É. ; la cachette sous les trois croix (posée par le lieu)
  { id: 'trois_croix', textes: [['chapelle_ruine', 'ch1'], ['calvaire_trois', 'tc1']], lettres: [['corps_gele', 'c2_gele1'], ['ferme_brulee', 'c2_anselme']], plus: [['bijou', 1]] },
];
function c2PoserHistoires(G) {
  const { w, B } = G, L = G.lieux;
  const deType = (t) => L.filter((q) => q.t === t);
  const interDe = (q, a) => w.inter.filter((it) => it.kind === 'c2' && it.data && it.data.l === q.i && (!a || it.data.a === a));
  for (const H of C2_HISTOIRES) {
    // les textes imposés (la tombe, le linteau)
    for (const [t, txt] of H.textes || []) {
      const q = deType(t)[0];
      if (!q) continue;
      const it = interDe(q, 'lire')[0] || interDe(q, 'prier')[0];
      if (it) it.data.txt = txt;
    }
    // les lettres : dans le conteneur du lieu, ou posées à part
    for (const [t, pap] of H.lettres || []) {
      const cands = deType(t);
      const q = cands[0];
      if (!q) continue;
      const b = interDe(q, 'butin')[0];
      if (b) b.data.pap = pap;
      else { const [x, z] = [q.x + Math.sin(q.r) * 1.4, q.z + Math.cos(q.r) * 1.4]; B.inter('c2', 'c2:' + q.i + ':h' + H.id, x, w.heightAt(x, z) + 0.35, z, 'Ramasser le papier', { l: q.i, a: 'lettre', pap }); }
    }
    // la cachette
    if (H.cache) {
      const q = deType(H.cache.type)[0];
      if (!q) continue;
      const f = { x: q.x, y: q.y, z: q.z, r: q.r }, [x, z] = B.toWorld(f, H.cache.lx, H.cache.lz);
      B.inter('c2', 'c2:' + q.i + ':' + H.id, x, w.heightAt(x, z) + 0.45, z, H.cache.label, { l: q.i, a: 'cache', table: 'c2_t_histoire', cle: H.id, pelle: H.cache.pelle ?? 1, plus: H.cache.plus || null });
    } else if (H.plus) {
      for (const it of w.inter) if (it.kind === 'c2' && it.data && it.data.a === 'cache' && it.data.cle === H.id) it.data.plus = H.plus;
    }
  }
}

// ---------------------------------------------------------------- les secrets (à leur heure, à leur jour)
const C2_SECRETS = {
  // la cloche fêlée des chapelles : la nuit du Vorndi, entre deux et quatre heures, elle ne sonne plus faux
  cloche(it, K) {
    const L = K.lieu(it), h = K.heure(), J = cal.jour(farm.s.day).cle, S = K.S();
    if (!L || L.t !== 'chapelle_ruine' || J !== 'morts' || h < 2.5 || h >= 4.5) return false;
    sound.bell && sound.bell(0.9);
    setTimeout(() => sound.bell && sound.bell(0.5), 1400);
    if (S.vus['genes' + L.i]) { ui.subtitle('', '(Elle sonne juste. Longtemps.)', 3); return true; }
    S.vus['genes' + L.i] = farm.s.day;
    if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-0.8, 'cloche', 1);
    setTimeout(() => {
      ui.subtitle('', '(La cloche sonne juste. Au pied de l’autel, les bougies se sont allumées. Sur la dalle, entre elles, quelque chose brille.)', 5.5);
      farm.give('medaille_genes', 1); play.flyer && play.flyer('medaille_genes', [it.x, it.y, it.z], 1); sound.pop && sound.pop();
    }, 2600);
    return true;
  },
  // un conteneur dont la cachette est d'une histoire : ce qu'elle garde en plus
  cache(it, K) {
    const d = it.data || {};
    if (!d.plus || !d.plus.length) return false;
    if (d.pelle !== 0 && !farm.count('pelle')) { ui.subtitle('', '(Il faudrait une pelle.)', 2.5); return true; }
    const S = K.S();
    if (d.pelle !== 0) { sound.dig && sound.dig(1); setTimeout(() => sound.dig && sound.dig(0.9), 380); }
    const plus = d.plus, table = d.table;
    K.a_butin(it, Object.assign({}, d, { un: 1 }), {
      titre: d.pelle === 0 ? 'Ce qu’on y avait laissé' : 'Ce que la terre gardait',
      objets: () => rollLoot(table).concat(plus.map((e) => e.slice())),
      onFerme: () => { if (!butin.reste(it.id)) S.creuse[it.id] = farm.s.day; },
    });
    return true;
  },
  // la lanterne des morts allumée la nuit du Vorndi
  lanterneAllumee(it, K) {
    if (cal.jour(K.nuit()).cle !== 'morts') return;
    setTimeout(() => { sound.whisper && sound.whisper(0.3, 0.35); ui.subtitle('', '(Les flammes de la vallée se couchent toutes du même côté, vers la montagne. Puis se relèvent.)', 4.5); }, 1800);
  },
};
// le registre du sommet : un carnet sur quatre dit où est la pierre aux trois croix
carte2.lignesRegistre = (L) => C2_REGISTRES[(L ? L.i : 0) % C2_REGISTRES.length];
