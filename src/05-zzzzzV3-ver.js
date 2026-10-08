// ============================================================================
//  LE VER (agent V3, quatorzième vague) — données
//  Le dragon des Terres d'Avant : « le Ver », comme disent les livres de la
//  bibliothèque. Une grande bête ailée, noire, très vieille, qu'un seigneur du
//  château des Hauts a liée par un collier de fer et à qui il a donné, le soir
//  où la cendre est tombée, un dernier ordre : « Qu'il garde. Que rien ne
//  sorte. » Elle garde encore. Le jour, elle fait ses rondes au-dessus de la
//  Zone et se pose sur ses perchoirs ; la nuit, elle dort dans son aire, au
//  sommet du Pic, la tête tournée vers la Porte. Ce qui bouge à découvert, elle
//  le brûle. On lui échappe en se cachant : sous un toit, sous terre, dans les
//  herbes hautes, dans l'ombre, la nuit.
//  Fins : la délivrer (ouvrir son collier, la nuit, pendant qu'elle dort, avec
//  la clé restée dans la main du dernier guetteur) ; la tuer (presque
//  impossible : un seul endroit où elle saigne, sous l'aile gauche, là où un
//  carreau de baliste est resté planté).
//  Le reste (comportement, regard, feu, ombre, sons, aire) : 07-, 09-, 11-zzzzV3.
// ============================================================================

// ---------------------------------------------------------------- réglages (une seule table : l'équilibrage les lit)
const V3 = {
  // le vol (m, m/s)
  vitesse: 31, vitessePique: 44, vitesseCherche: 22,
  altitude: 88,         // au-dessus du relief, en ronde
  altitudeCherche: 46,  // quand il cherche
  altitudeFeu: 15,      // la tête, au-dessus du sol, quand il crache
  virage: 0.5,          // rad/s en ronde (rayon d'environ 60 m)
  // le regard (m) : de jour, de nuit (la lune), la lanterne se voit de loin
  vueJour: 190, vueNuit: 70, vueLanterne: 250,
  ouiePerche: 2.2, ouieVol: 0.7, ouieDort: 1.5,
  soupconVite: 0.55,    // vitesse de montée du soupçon (furtif)
  oubli: 0.1, memoire: 28,
  // le feu
  feuPortee: 40,        // longueur du jet (m)
  feuDegats: 48,        // PV par seconde au cœur du jet
  feuBord: 20,          // PV par seconde sur le sol en feu, au bord
  feuApres: 7,          // PV par seconde, on brûle encore un peu (une seconde et demie)
  passesMax: 3,         // passes d'attaque à la suite, au plus
  // les heures (de jeu)
  heures: { reveil: 4.6, envol: 6.6, retour: 19.4, coucher: 21.4 },
  // la ronde : posé sur un perchoir (secondes réelles)
  pose: [38, 85],
  // la blessure (tuer)
  pv: 1500,             // seulement sous l'aile gauche (le carreau)
  guerison: 2,          // jours pour guérir tout à fait
  // l'herbe qui brûle (la Zone seulement)
  brulePar: 140,        // objets qui brûlent au plus pour une attaque
  repousse: 4,          // jours avant que l'herbe brûlée repousse
};

// ---------------------------------------------------------------- noms des lieux
const V3_LIEUX = { v3_aire: 'l’Aire', v3_loge: 'la loge du Guet' };

// ---------------------------------------------------------------- objets
defItem('v3_ecaille', 'Écaille du Ver', 'tresor', 90, ['tablette', '#2a2622'], { desc: 'Une écaille noire, grande comme un bouclier de fantassin, et légère comme du bois sec. Elle reste tiède longtemps.' });
defItem('v3_dent', 'Dent du Ver', 'tresor', 120, ['croc', '#d8ccb0'], { desc: 'Une dent longue comme un avant-bras, jaunie, ébréchée à la pointe.' });
defItem('v3_cle_collier', 'Clé du collier', 'quete', 0, ['cle', '#2e2a26'], { unique: true, desc: 'Une grosse clé noire, plus longue qu’une main. L’anneau est usé, comme si on l’avait longtemps portée à la ceinture.' });
defItem('v3_carnet', 'Carnet du Guet', 'quete', 0, ['livre', '#5a4030'], { unique: true, desc: 'Un carnet relié de cuir, gonflé d’humidité. Les premières pages sont d’une écriture soignée ; les dernières, non.' });
defItem('v3_coeur', 'Cœur du Ver', 'tresor', 400, ['gemme', '#7a1810'], { unique: true, desc: 'Il est encore chaud. Il le sera encore longtemps.' });
// ce qu'il garde : ce qu'il a pris à ceux qui sont venus (de vieilles choses, peu d'argent ; la Zone ne rend pas riche)
LOOT.v3_tas = { rolls: [2, 3], items: [['vieille_piece', 2, 5, 6], ['bijou', 1, 1, 2], ['relique', 1, 1, 1.4], ['gemme', 1, 1, 0.8], ['lingot_or', 1, 1, 0.6], ['argent', 15, 60, 3], ['v3_dent', 1, 1, 0.35], ['tesson', 1, 2, 1.5]] };

// ---------------------------------------------------------------- textes (peu de mots : les lieux racontent)
const V3_TEXTES = {
  // l'aire
  anneauTitre: 'Un anneau de fer, scellé dans le roc',
  anneau: 'QU’IL GARDE.\nQUE RIEN NE SORTE.\nQUE NUL NE LE DÉLIE.',
  anneauVoir: 'Un anneau de fer haut comme un homme, scellé dans le roc par du plomb. Le bout d’une chaîne y pend, rompu ; chaque maillon est gros comme un tonneau. Des mots sont gravés dans la pierre, dessous.',
  tasTitre: 'Le tas',
  tas: 'Des épées tordues, des casques, des boucles de ceinture, des pièces d’une frappe que personne ne connaît. Et des os, beaucoup d’os. Tout cela est noirci, et tiède.',
  tasFouiller: 'Fouiller (cela fera du bruit)',
  tasVide: 'Il ne reste que des os et du fer fondu.',
  resteTitre: 'Le dernier guetteur',
  reste: 'Un homme, ou ce qu’il en reste, assis contre le roc, tout près de l’endroit où le Ver se couche. Ses os ne sont pas noircis. Une grosse clé noire est restée dans sa main.',
  resteSans: 'Un homme, ou ce qu’il en reste, assis contre le roc. Sa main est ouverte, maintenant.',
  resteCle: 'Prendre la clé',
  collierTitre: 'Le collier',
  collier: 'Un collier de fer, large comme une roue de charrette, a mangé la chair du cou. Une serrure, grosse comme un poing, pend dessous.',
  collierSans: '(Il faudrait la clé.)',
  collierOuvrir: 'Tourner la clé',
  collierOuvert: 'Le collier, ouvert, dans la cendre. Il est plus lourd que trois hommes.',
  // la chaîne du Guet (le seul chemin jusqu'à l'aire : le sentier finit au pied de la roche)
  chaineTitre: 'La chaîne du Guet',
  chaine: 'Une chaîne de fer pend de là-haut, fixée à la roche par des crampons. Ses maillons sont usés au même endroit, comme si des mains y étaient passées des milliers de fois. Sous le premier crampon, des mots taillés : LE GUET MONTE. NUL AUTRE NE MONTE.',
  chaineHaut: 'La chaîne descend le long de la roche, jusqu’au sentier.',
  chaineMonter: 'Monter',
  chaineDescendre: 'Descendre',
  monte: 'Vous montez, maillon après maillon. Le fer est froid ; il chante un peu quand le vent passe.',
  descend: 'Vous redescendez le long de la chaîne.',
  // les perchoirs
  borneTitre: 'Une borne, des anneaux de fer à hauteur d’homme',
  borne: 'ICI L’ON ATTACHAIT CE QU’ON LUI DEVAIT.\n\nDessous, des lettres plus récentes, grattées avec une pointe :\nOn ne lui doit plus rien. Il se sert.',
  balisteTitre: 'Une grande arbalète de rempart, renversée',
  baliste: 'L’arc est brisé, la corde a pourri. Sur le fût, des mots taillés au couteau :\n\nUN SEUL CARREAU. IL EST ENTRÉ SOUS L’AILE GAUCHE.\nIL Y EST ENCORE.',
  compteTitre: 'Des encoches dans une pierre plate',
  compte: 'Il passe au-dessus du bois deux fois le jour, au matin et au soir. Jamais la nuit.\nJ’ai cessé de compter à mille.',
  heaumeTitre: 'Un heaume',
  heaume: 'Un heaume, à demi fondu. Le fer a coulé comme de la cire, puis s’est figé. Dedans, il n’y a rien.',
  griffesTitre: 'Des entailles dans le roc',
  griffes: 'Des entailles profondes dans la pierre, par quatre, chacune longue comme un homme couché.',
  ecaille: 'Ramasser l’écaille',
  // la loge du Guet
  clocheTitre: 'La cloche du Guet',
  cloche: 'Une cloche de bronze verdi, pendue à un portique de chêne. La corde est neuve, ou presque : quelqu’un l’a remplacée, il n’y a pas si longtemps.',
  clocheSonner: 'Sonner la cloche',
  clocheNuit: '(La cloche résonne longtemps dans le noir. Rien ne répond.)',
  carnetTitre: 'Un carnet, sur la paillasse',
  carnetPrendre: 'Prendre le carnet',
  carnet: [
    'Nous étions douze au Guet. Nous montions la viande, nous sonnions la cloche, et il rentrait. On ne nous demandait rien d’autre.',
    'Le soir où la cendre est tombée, le seigneur est monté lui-même jusqu’au Pic. Il a dit : « Qu’il garde. Que rien ne sorte. » Nous avons répété les mots, comme on nous l’avait appris.',
    'Ceux de la Ville Basse ont voulu passer la Porte. Il a fait ce qu’on lui avait dit.',
    'Nous ne sommes plus que trois. La viande manque. Il mange ce qu’il trouve.',
    'Le château ne répond plus. Personne ne monte. Personne ne descend.',
    'À la cloche, il rentre encore. C’est la seule chose qu’il n’a pas oubliée.',
    'Le collier lui mange le cou. Je l’entends gémir, la nuit, quand il croit que personne n’écoute.',
    'Je suis seul. La clé du collier est à ma ceinture. Je monte la lui ôter pendant qu’il dort. S’il me brûle, tant pis : il aura eu raison.',
  ],
  carnetSigne: '(La dernière page est blanche, sauf une tache.)',
  // le Ver mort
  corpsTitre: 'Le Ver',
  corps: 'Il est couché sur le flanc, les ailes ouvertes comme des voiles tombées. La chaleur monte encore de lui, et une odeur de forge éteinte.',
  corpsCoeur: 'Prendre le cœur',
  corpsEcaille: 'Arracher une écaille',
  corpsDent: 'Arracher une dent',
  corpsRien: '(Il n’y a plus rien à prendre. Il n’y a plus que lui.)',
  // pensées (rares)
  premiere: '(Ce n’est pas un nuage.)',
  delivre: '(Il ne s’est pas retourné.)',
  tue: '(Le silence, après, est plus grand que lui.)',
  ricochet: '(La balle a sonné sur lui comme sur une cloche.)',
  cadeau: 'Sur le seuil, ce matin, une écaille noire, grande comme un bouclier. Elle est encore tiède.',
  mort: 'Brûlé par le Ver',
};

// ---------------------------------------------------------------- ce qu'on en dit dans la vallée (de loin, sans rien dire)
const V3_RUMEURS = {
  chasseur: ['Par temps clair, au-dessus des monts de l’est, j’ai vu une ombre glisser sur les nuages. Trop grande pour un aigle. Beaucoup trop grande.'],
  aubergiste: ['Les vieux disaient qu’on entend parfois, derrière la Porte, comme un orage qui respire.'],
  cure: ['Les vieux registres parlent d’un « Ver » qui gardait des terres, quelque part. Je ne sais pas si c’est une image. Je préfère que ce soit une image.'],
};
const V3_RUMEURS_TOUS = ['Mon grand-père disait : si un jour tu passes la Porte, marche à l’ombre.'];
