// ============================================================================
//  LES GARDES ET LES CHEVALIERS (agent G1, onzième vague) — les gens, les cabanes
//  « Ajoute d'autres gardes et chevaliers qui protègent les gros villages et la
//  ville ; pas plus de deux gardes pour une ville ou un village ; fais des
//  cabanes de garde. »
//  - VALBRUME (la ville) : le garde des ponts d'aujourd'hui (Grosjean), et le
//    CHEVALIER DU GUET, le vieux titre du chef de la garde de nuit, porté par un
//    ancien cuirassier (cuirasse, casque à crinière, sabre). Il loge au CORPS DE
//    GARDE, de l'autre côté du pont nord : quand les ponts sont levés, c'est lui
//    qui reste avec ceux qui restent dehors (un lit de camp pour le passant).
//  - CLAIRPRÉ (le hameau) : le GARDE CHAMPÊTRE (képi, plaque, tambour, fusil),
//    et le GENDARME À CHEVAL détaché de la préfecture (bicorne, buffleteries,
//    sabre), qui fait aussi la tournée des petits villages qui n'ont personne
//    (les Sources, les Planches, la route du lac, la bibliothèque) ; son cheval
//    reste à l'écurie de la CABANE DE GARDE, à l'entrée du hameau. Le jour, le
//    garde champêtre ; la nuit, le gendarme : l'un dort pendant que l'autre veille.
//  - Pourquoi ces deux-là : Valbrume et Clairpré sont les seuls vrais villages
//    (des rues, une foire, un marché). Les Sources, les Planches, l'estive ont
//    trois foyers chacun et leurs propres coutumes (on n'y veut pas d'uniforme) ;
//    les nains et le Dessous ont leurs lois. Le gendarme y passe, il n'y loge pas.
//  Le jeu des gardes (rondes, interventions, sommation, rébellion) : 11-zzzzC1-gardes-jeu.js.
//  Génération : après tout le reste (emballage de generateValley, après 11-zzzzB2),
//  tirage propre mulberry32(graine ^ 0xC6A2D1) ; on AJOUTE au bout des listes.
// ============================================================================
Object.assign(LIEU_NAMES, { g1_corps_garde: 'le corps de garde du pont nord', g1_cabane_hameau: 'la cabane des gardes' }); // (les tours d'angle ont aussi le leur : 11-zzzzB1-ville.js)

// ---------------------------------------------------------------- la rébellion (refuser de se rendre à un garde)
if (typeof CRIME_DEF !== 'undefined' && !CRIME_DEF.rebellion) CRIME_DEF.rebellion = { prime: 100, grav: 2, oubli: 6, violent: false };
if (typeof PRISON_PEINE !== 'undefined' && PRISON_PEINE.rebellion === undefined) PRISON_PEINE.rebellion = 1;
{
  const _lib = societe.libelle.bind(societe);
  societe.libelle = function (C) { return C && C.type === 'rebellion' ? 'la rébellion contre la garde' : _lib(C); };
}

// ---------------------------------------------------------------- les trois nouveaux
// (garde : le rôle ; lieu : le village qu'il protège ; veille : quand il est de garde ; courage : 0 (fuit tout) à 1 (rien) ;
// coups : dégâts de son arme au corps à corps ; tir : son fusil, s'il en a un)
const G1_HABITANTS = [
  // ============================================================ le chevalier du guet (Valbrume)
  {
    id: 'chevalier_guet', role: 'Chevalier du guet', gender: 'm', names: ['Hector', 'Aristide', 'Barthélemy'], surname: 'Vauquelin', age: 57, area: 'ville',
    home: 'g1_corps_garde', work: 'g1_corps_garde', traits: ['droit', 'taciturne'], liens: { garde: 'son second', maire: 'supérieur', gendarme: 'rival', aubergiste: 'pension' },
    garde: { lieu: 'valbrume', veille: 'nuit', courage: 1, coups: [24, 32], arme: 'sabre', titre: 'chevalier du guet' },
    look: { skin: '#cda584', hair: '#8c8782', hairStyle: 'court', beard: 'moustache', hat: null, top: '#1f2a46', bottom: '#d4cec0', shoe: '#121010', dress: false, apron: null, height: 1.07, build: 'normal', casque: 'crin', cuirasse: true, sabre: true, ronde: true, belt: '#e8e4d8' },
    schedule: [[0, 'g1:poste'], [6, 'g1:pont'], [7, 'home'], [14, 'auberge'], [15, 'place'], [18.5, 'g1:poste']],
    likes: ['vin', 'viande_grillee', 'pain'], loves: ['eau_de_vie_poire'], dislikes: ['fleur', 'confiture'],
    shop: null,
    lines: {
      intro: '{nom} Vauquelin, chevalier du guet. Le titre est plus vieux que moi, et la ville plus vieille que le titre. La nuit, quand les ponts sont levés, je veille de ce côté-ci des douves. Si la nuit vous prend dehors, frappez au corps de garde : il y a un lit de camp pour qui reste dehors.',
      greet: {
        matin: ['Nuit close. Rien qui se laisse écrire. Je vais dormir.', 'Bonjour, {fermier}. Le guet descend, le jour monte. Chacun son tour.', 'Les ponts sont baissés. Passez. Je vous ai vu venir de loin.'],
        jour: ['On ne dort pas longtemps, à mon âge. On dort bien, c’est déjà ça.', 'La ville est calme. C’est son état ordinaire. C’est la nuit qu’elle ne l’est plus.', 'Je fais le tour de la place. Les gens aiment voir le guet de jour : ça les rassure pour la nuit.'],
        soir: ['La nuit tombe. Je prends le guet. Rentrez, ou restez près de mon feu.', 'Les ponts se lèvent à neuf heures. Après, de ce côté, il n’y a plus que moi.'],
        pluie: ['La pluie sur une cuirasse, ça fait le bruit d’un tambour. On s’y fait, en vingt ans.', 'Temps de chien. Les chiens restent dedans. Le guet, non.'],
        orage: ['À Reichshoffen aussi, il tonnait. Ce n’était pas l’orage.'],
        ami: ['{prenom}. Asseyez-vous près du feu. On n’est pas obligés de parler.', 'Vous avez l’œil, pour un fermier. Je vous prendrais au guet, si j’avais encore un guet.'],
        froid: ['Circulez.', 'Je vous ai à l’œil. Je n’ai que ça à faire, la nuit.'],
        peur: ['Restez où vous êtes. Les mains bien en vue.', 'Un pas de plus, et je tire le sabre. Je ne le rengaine jamais pour rien.'],
      },
      about: [
        'Cuirassier, vingt-deux ans de service. J’ai chargé à Reichshoffen, un après-midi d’août. On était huit cents. On est revenus moins. Le reste de ma vie, je l’ai passé à la nuit.',
        'Chevalier du guet : jadis, le chef de la garde de nuit des villes. La commune a gardé le titre, et l’homme qui va avec. Ça ne lui coûte qu’un lit de camp et du charbon.',
        'Le corps de garde est de ce côté des douves exprès. Quand les ponts sont levés, il faut bien que quelqu’un reste avec ceux qui restent dehors.',
        'On m’avait promis un second. Un sergent, Ferrand. Il est parti à l’heure, d’après le télégraphe. Il n’est jamais arrivé. Je lui garde son lit de camp.',
        'J’écris tout dans le registre. L’heure, le temps, ce que j’ai vu. Quand on écrit, on n’invente pas. Quand on relit, parfois, on se le demande.',
      ],
      rumeurs: [
        '{npc:garde} lève les ponts. Il a peur du noir, il le dit à qui veut l’entendre, et il le fait quand même, tous les soirs. Je n’ai pas connu de soldat plus brave.',
        'Le gendarme du hameau m’a demandé de quel droit je portais un titre aboli. Je lui ai demandé si la nuit, elle, avait été abolie. Il l’a noté.',
        'Les loups ne viennent pas jusqu’aux douves. Ils s’arrêtent à la lisière et ils regardent la ville. Je les regarde aussi. On se connaît.',
        'Certaines nuits, un homme en long manteau passe sur la route du nord. Je ne l’ai jamais vu de face. Je n’y tiens pas.',
        'On dit que la lanterne du phare s’allume toute seule. Je l’ai vue s’allumer. Je n’ai pas vu qui l’allumait. Je n’ai pas écrit « toute seule ».',
      ],
      etrange: [
        'Cette nuit, quelqu’un a marché sur le pont levé. À la verticale. J’ai écrit l’heure : trois heures dix. Je n’ai rien écrit d’autre.',
        'Mon feu s’est couché d’un coup, cette nuit, comme sous un grand vent. Il n’y avait pas de vent.',
        'Il y avait onze lumières sur le lac, à minuit. Ceux des Planches en posent dix.',
        'On a frappé au corps de garde, cette nuit. De l’intérieur. J’étais dehors. J’ai attendu le jour pour ouvrir.',
      ],
      cadeau: {
        adore: 'De la poire… Merci. Je la boirai à la santé de ceux de Reichshoffen. Un doigt chacun : il y en a pour longtemps.',
        aime: 'Merci. Le guet vous en sait gré.',
        neutre: 'Merci. Posez-le sur la table.',
        deteste: 'Gardez cela. Je n’en ai pas l’usage.',
      },
      nuit: 'Le guet ne dort pas. Qu’y a-t-il ?',
      meurtre: 'Vous avez du sang sur vous. Tenez-vous à distance de mon feu, et de moi.',
      disparu: '{victime}. Je l’ai inscrit dans la marge du registre. C’est là qu’on met ceux qu’on n’a pas su garder.',
      nuitrouge: 'Cette nuit, le guet n’a rien vu. Pour la première fois en vingt ans, je n’ai rien écrit. Je ne me souviens pas de la nuit.',
      adieu: ['Allez.', 'Rentrez avant les ponts.'],
      tueur: ['…'], indice: '…',
    },
    quests: [],
  },
  // ============================================================ le garde champêtre (Clairpré)
  {
    id: 'garde_champetre', role: 'Garde champêtre', gender: 'm', names: ['Fulbert', 'Prosper', 'Célestin'], surname: 'Tissier', age: 48, area: 'hameau',
    home: 'g1_cabane_hameau', work: 'g1_cabane_hameau', traits: ['bavard', 'pointilleux'], liens: { eleveuse: 'voisine', gendarme: 'collègue', postiere: 'commère' },
    garde: { lieu: 'clairpre', veille: 'jour', courage: 0.6, coups: [12, 18], arme: 'fusil', tir: { degats: [20, 28], portee: 22, chance: 0.5, cadence: 3.2 }, titre: 'garde champêtre' },
    look: { skin: '#d8a882', hair: '#5a4632', hairStyle: 'court', beard: 'moustache', hat: null, top: '#36456a', bottom: '#4a4034', shoe: '#2a2018', dress: false, apron: null, height: 1.0, build: 'rond', casque: 'kepi', casqueCol: '#26304c', bandeCol: '#8a2a24', plaque: true, fusil: true, ronde: true },
    schedule: [[5.5, 'g1:poste'], [6.5, 'hameau'], [12, 'home'], [13, 'g1:ronde'], [17, 'hameau'], [20, 'g1:poste'], [21, 'home']],
    likes: ['fromage', 'cidre', 'pain'], loves: ['tarte'], dislikes: ['champignon'],
    shop: null,
    lines: {
      intro: 'Halte-là ! … Ah, non, rien, l’habitude. {nom} Tissier, garde champêtre de {hameau}, assermenté. Les chemins, les haies, les bornes, les chèvres qui vont où il ne faut pas : c’est moi. Vous êtes {fermier} ? Je vous ai déjà dans mon carnet. En bien, rassurez-vous. Pour l’instant.',
      greet: {
        matin: ['Bonjour ! Rosée sur les blés, pas de chèvre dans les choux : belle matinée.', 'Le gendarme rentre de sa nuit, je prends ma journée. On se croise, on ne se dit rien. C’est le service.', 'Déjà debout ? Moi aussi. Le procès-verbal se lève tôt.'],
        jour: ['Une borne déplacée, chez Morel. Trois pouces ! Ça ne se fait pas, trois pouces.', 'Vous passez, vous saluez, vous ne marchez pas dans les semis. Parfait. Rien à verbaliser.', 'On a volé une poule à Bastien. Pas à moi, à Bastien. C’est pareil : c’est mon hameau.'],
        soir: ['Le soir, je relis mes procès-verbaux. Il y en a de beaux.', 'Bientôt la relève. Le gendarme fait la nuit. Moi, la nuit, je ne verbalise pas : je dors.'],
        pluie: ['La pluie, ça efface les traces. C’est mauvais pour l’enquête.', 'Mouillé comme une soupe. Le képi tient, c’est l’essentiel.'],
        orage: ['Orage ! Tout le monde à l’abri, les bêtes comprises ! C’est un ordre !'],
        ami: ['Ah, {prenom} ! Venez, je vous lis mon dernier procès-verbal. Une chèvre, un curé et un jardin. Vous allez rire.', 'Entre nous, {fermier}, vous êtes le seul ici qui m’écoute jusqu’au bout.'],
        froid: ['Circulez. J’ai votre nom dans mon carnet, et pas à la bonne page.', 'Je vous ai à l’œil. Les deux, et le carnet.'],
        peur: ['N’avancez pas ! J’ai un fusil ! Et un carnet ! Les deux sont chargés !', 'Reculez ! Au nom de la loi… et du hameau !'],
      },
      about: [
        'Garde champêtre : l’assermentation, le képi, la plaque et le tambour. Le tambour, c’est pour les avis. Les gens n’aiment pas le tambour. Ils l’entendent quand même.',
        'Vingt ans de procès-verbaux. Des chèvres, des haies, des chiens, des bornes. Un seul pour un homme qui marchait sur l’eau de la mare. Je l’ai classé. Je ne savais pas où le ranger.',
        'Ma femme est partie à la ville il y a dix ans. Elle disait que je parlais trop. Depuis, je parle aux bornes. Elles, elles restent.',
        'Le gendarme, c’est la loi de Paris. Moi, c’est la loi du hameau. On s’entend, à condition qu’il ne touche pas à mes chèvres.',
      ],
      rumeurs: [
        '{npc:eleveuse} a de belles bêtes et une grande gueule. Je verbaliserais bien la gueule, mais il n’y a pas d’article.',
        'Le gendarme écrit à la préfecture toutes les semaines. Il n’a jamais eu de réponse. Il continue. C’est un garçon têtu.',
        'Un ours est descendu jusqu’au ranch, il y a deux hivers. J’ai tiré en l’air. Il est parti. Moi aussi. On était d’accord.',
        'Au hameau abandonné, il y a encore une borne au nom du garde d’avant. Il s’appelait comme moi. Je n’aime pas ça.',
        'La foire du Foiredi, c’est mon jour. Les ivrognes, les maquignons, les voleurs de poules : tout le monde se montre. Moi, je note.',
      ],
      etrange: [
        'Cette nuit, une chèvre est entrée dans la cabane. Elle s’est assise sur mon lit, et elle m’a regardé dormir. Je n’ai pas de chèvre.',
        'J’ai dressé procès-verbal contre inconnu, ce matin. Motif : a frappé à toutes les portes du hameau, à trois heures. Signalement : aucun. Pas de traces dans la boue.',
        'Le tambour a résonné tout seul, cette nuit. Un roulement, comme pour un avis. Je n’ai pas entendu l’avis.',
      ],
      cadeau: {
        adore: 'Une tarte ! Pour moi ? Je la consigne au registre, et puis je la mange. Dans cet ordre.',
        aime: 'Ah, merci, merci ! Ça, c’est un cadeau réglementaire.',
        neutre: 'Merci. Je le note.',
        deteste: 'Hum. Je le note aussi. À une autre page.',
      },
      nuit: 'Hein ? Qui frappe ? … Le gendarme est de garde, il est dehors, allez le voir ! Moi, je dors. Procès-verbal de sommeil.',
      meurtre: 'N’approchez pas ! Je dresse procès-verbal, et après je cours chercher le gendarme !',
      disparu: '{victime}… Je l’avais encore dans mon carnet, la semaine dernière. Pour une haie mal taillée. Je raye. Ça me fait quelque chose, de rayer.',
      nuitrouge: 'Je n’ai pas fait de procès-verbal, cette nuit. Il n’y a pas d’article pour ça.',
      adieu: ['Circulez, et respectez les bornes !', 'À la revoyure ! Ne marchez pas dans les semis !'],
      tueur: ['…'], indice: '…',
    },
    quests: [],
  },
  // ============================================================ le gendarme à cheval (Clairpré, et la tournée des petits villages)
  {
    id: 'gendarme', role: 'Gendarme à cheval', gender: 'm', names: ['Théophile', 'Léonce', 'Gaspard'], surname: 'Delcourt', age: 31, area: 'hameau',
    home: 'g1_cabane_hameau', work: 'g1_cabane_hameau', traits: ['sérieux', 'courageux'], liens: { garde_champetre: 'collègue', chevalier_guet: 'rival', maire: 'rapports' },
    garde: { lieu: 'clairpre', veille: 'nuit', courage: 0.9, coups: [22, 30], arme: 'sabre', titre: 'gendarme', tournee: true },
    look: { skin: '#e0bc9a', hair: '#2a2018', hairStyle: 'court', beard: 'moustache', hat: null, top: '#1b2236', bottom: '#2c2e38', shoe: '#0e0c0a', dress: false, apron: null, height: 1.06, build: 'mince', casque: 'bicorne', buffle: true, epaulettes: '#d8d8d0', sabre: true, ronde: true, belt: '#e8e4d8' },
    schedule: [[0, 'g1:poste'], [5.5, 'g1:poste'], [6, 'home'], [12, 'g1:ecurie'], [13, 'g1:tournee'], [18, 'g1:ecurie'], [20, 'hameau'], [21, 'g1:poste']],
    likes: ['pain', 'fromage', 'biere'], loves: ['vin_chaud'], dislikes: ['gnole'],
    shop: null,
    lines: {
      intro: 'Gendarme {nom} Delcourt, brigade de la préfecture, détaché à {hameau}. Je fais aussi la tournée des villages qui n’ont pas de garde : les Sources, les Planches, la route du lac. Si l’on vous vole, si l’on vous menace, venez me trouver. Je prends les plaintes par écrit.',
      greet: {
        matin: ['Nuit sans incident. Je dresse mon rapport et je me couche.', 'Bonjour. Mistral a mangé, moi pas. Dans cet ordre : c’est le règlement.'],
        jour: ['Je rentre de tournée. Les Sources : rien. Les Planches : on ne m’a pas laissé monter sur les planches.', 'Mes respects. Rien à déclarer ?', 'Le pays est calme. Trop, pour un homme qui vient de la ville.'],
        soir: ['Je prends la nuit. Le garde champêtre ronfle déjà, j’en suis sûr.', 'À la nuit, restez sur les chemins. Je ne peux pas être partout.'],
        pluie: ['Le bicorne prend l’eau. Le règlement ne prévoit pas de parapluie.'],
        orage: ['Mistral déteste l’orage. Moi aussi. Ni l’un ni l’autre ne le montre.'],
        ami: ['Vous êtes la seule personne d’ici qui me réponde, {prenom}. Même la préfecture ne le fait pas.', 'Si j’avais un adjoint, je voudrais qu’il vous ressemble. Avec un uniforme.'],
        froid: ['Circulez.', 'J’ai votre signalement. Ne m’obligez pas à m’en servir.'],
        peur: ['Restez où vous êtes. Les mains en évidence.', 'Ne m’approchez pas. Je suis armé, et je sais m’en servir.'],
      },
      about: [
        'On m’a envoyé ici parce que la vallée n’avait pas de gendarme. Le capitaine a dit : « Six mois. » Ça fait deux ans. Je n’ai jamais reçu d’ordre de relève.',
        'J’écris un rapport chaque semaine à la préfecture. Je n’ai jamais eu de réponse. Le courrier part bien, la postière me l’assure. Je continue.',
        'Mistral, c’est mon cheval. Il refuse de passer le gué du moulin, la nuit. De jour, il passe. J’ai cessé de discuter avec lui.',
        'Avant moi, un sergent devait prendre le guet de la ville. Ferrand. À la préfecture, on en parle encore à voix basse. Il n’a jamais pris son poste.',
      ],
      rumeurs: [
        'Le chevalier du guet porte un titre aboli depuis la Révolution. Je le lui ai fait remarquer. Il m’a demandé si la nuit, elle, avait été abolie.',
        'Aux Sources, ils vivent comme au premier jour du monde. Je les salue, ils me saluent. Je garde mon bicorne.',
        'Ceux des Planches ne veulent pas de loi sur l’eau. Ils disent qu’en dessous, il y en a déjà une.',
        '{npc:garde_champetre} parle beaucoup. Mais il connaît chaque borne, chaque haie, chaque nom. Je n’aurais pas tenu deux ans sans lui.',
      ],
      etrange: [
        'Cette nuit, j’ai entendu un cheval au galop sur la route du lac. Mistral était à l’écurie. Il tremblait.',
        'J’ai trouvé dans mon rapport de la semaine une phrase que je n’ai pas écrite. De mon écriture. « Rien à signaler, sauf nous. »',
        'Un homme m’a demandé le chemin de la vieille ferme, à minuit. Je le lui ai indiqué. Il est parti dans l’autre sens.',
      ],
      cadeau: {
        adore: 'Du vin chaud… Comme à la caserne, les nuits de décembre. Merci. Je l’écrirai au rapport : moral relevé.',
        aime: 'Merci. C’est aimable.',
        neutre: 'Merci.',
        deteste: 'Je ne peux pas accepter ceci. Le règlement.',
      },
      nuit: 'Gendarmerie ! Qui frappe ? … Je suis de garde dehors, moi. Si vous frappez à cette porte, c’est que vous ne m’avez pas vu. Ça m’inquiète.',
      meurtre: 'Vous êtes en état d’arrestation. Ne faites pas un geste.',
      disparu: 'J’ai envoyé un rapport pour {victime}. Il ne reviendra pas. Le rapport non plus.',
      nuitrouge: 'Cette nuit, j’ai fait ma ronde, et il n’y avait personne. Ni au hameau, ni sur les routes. J’ai frappé à toutes les portes.',
      adieu: ['Mes respects.', 'Bonne route. Restez sur les chemins.'],
      tueur: ['…'], indice: '…',
    },
    quests: [],
  },
];
for (const d of G1_HABITANTS) {
  if (NPC_DATA.some((q) => q.id === d.id)) continue;
  if (d.look && d.look.fem === undefined) d.look.fem = d.gender === 'f';
  NPC_DATA.push(d);
  NPC_BY_ID[d.id] = d;
}
Object.assign(NPC_HELD, { chevalier_guet: 'sabre', gendarme: 'sabre' });
// le garde d'aujourd'hui est un garde comme les autres (ses répliques, ses quêtes, sa maison, son métier ne changent pas)
if (NPC_BY_ID.garde && !NPC_BY_ID.garde.garde) NPC_BY_ID.garde.garde = { lieu: 'valbrume', veille: 'jour', courage: 0.35, coups: [18, 26], arme: 'pique', titre: 'garde', ancien: true };
const G1_IDS = G1_HABITANTS.map((d) => d.id);

// ---------------------------------------------------------------- leur vie (11-zzlife.js)
Object.assign(NPC_LIFE, {
  chevalier_guet: {
    foi: 'eglise', devotion: 1, fete: 6, mythes: [],
    histoire: [
      { titre: 'Le six août', min: 0, texte: 'On dit Reichshoffen. C’était à Morsbronn, dans les houblons et les vignes. On nous a lancés à travers un village plein de fusils : des murs, des haies, des fossés. Les chevaux tombaient dans les houblons. J’avais vingt et un ans. Le soir, j’ai compté ceux qui restaient, comme on compte les heures la nuit, pour tenir.' },
      { titre: 'Le registre', min: 1, texte: 'J’ai commencé le registre la première nuit, ici. L’heure, le temps, ce que j’ai vu. Un registre ne ment pas : si l’on écrit tout, on n’a pas besoin de se souvenir. Il y a des nuits que je relis pour être sûr qu’elles ont eu lieu.' },
      { titre: 'Le lit de Ferrand', min: 3, texte: 'Le sergent Ferrand devait arriver un Primedi. J’ai fait le lit de camp, j’ai mis une seconde gamelle. Le télégraphe a dit qu’il était parti à l’heure. Depuis, certaines nuits, quelqu’un dort dans son lit. Pas lui. La couverture est tiède au matin, du côté du mur.' },
      { titre: 'Ce que je garde', min: 5, texte: 'Les gens croient que je garde la ville. Je garde le dehors. Ce n’est pas la même chose, {prenom}. La ville se garde toute seule, avec ses ponts. Le dehors, il faut quelqu’un pour le regarder en face.' },
    ],
    humeurs: {
      joyeux: ['Nuit claire. Pas une ombre de trop. Ça arrive.', 'L’aubergiste m’a gardé une part de ragoût. À mon âge, c’est une décoration.'],
      triste: ['Le six août approche. Je ne dors pas, la semaine du six août.', 'J’ai relu les noms, cette nuit. Je les sais par cœur. Je les relis quand même.'],
      fatigue: ['Deux nuits de pluie. La cuirasse a rouillé avant moi.', 'Je n’ai pas fermé l’œil. Le guet, c’est ça.'],
      inquiet: ['Mon feu a mal pris, hier soir. Le bois était sec.', 'Les chiens de la ville ont aboyé toute la nuit vers le nord. Vers moi.'],
      agace: ['Le gendarme est encore venu me parler de règlement. J’ai écouté. Ça m’a fait une veille.', 'On a renversé mon brasero. Pas le vent. Le vent ne renverse pas les choses en les reposant droites.'],
    },
    souvenirs: {
      absence: ['Je ne vous voyais plus passer. Je l’ai écrit : « Le fermier ne passe plus. » Ça fait une ligne triste.'],
      victime: ['J’ai écrit son nom dans la marge. C’est là qu’on met ceux qu’on n’a pas su garder.'],
      coup: ['Vous avez levé la main sur le guet. Je ne l’oublierai pas. Je ne vous en veux pas : j’ai tout écrit.'],
    },
    foi_lignes: ['Je vais à la messe quand je ne dors pas. Ce n’est pas souvent. Le curé me pardonne : il sait ce que c’est, de veiller.'],
    fete_lignes: ['Le six. Je ne fête rien, ce jour-là. Je bois un doigt de poire par homme. Ça fait beaucoup de doigts.'],
    secret: 'Il y a une page du registre que je n’ai pas écrite. La nuit de la Saint-Jean, l’an dernier : « Trois heures. Le chevalier dort. Nous veillons. » C’est mon écriture. Je ne dormais pas.',
  },
  garde_champetre: {
    foi: 'eglise', devotion: 2, fete: 14, mythes: [],
    histoire: [
      { titre: 'L’assermentation', min: 0, texte: 'J’ai prêté serment devant le juge de paix, la main levée, le képi sous le bras. Mon père était maréchal-ferrant ; il a pleuré. Il disait qu’un garde champêtre, c’est un homme qui marche toute sa vie pour les autres. Il avait raison : j’ai usé onze paires de souliers.' },
      { titre: 'Le procès-verbal de la mare', min: 1, texte: 'Un soir d’octobre, un homme marchait sur la mare de Bastien. Sur l’eau. Il allait d’un bord à l’autre, les mains dans le dos, comme on fait les cent pas. J’ai dressé procès-verbal : « traversée de mare hors des passages prévus ». Je ne savais pas quoi écrire d’autre. Le lendemain, la mare était gelée. On était en octobre.' },
      { titre: 'Le garde d’avant', min: 3, texte: 'Le garde d’avant s’appelait Tissier, comme moi. Pas de la famille. Il a disparu un hiver, en faisant sa tournée du hameau abandonné. On a retrouvé son tambour sur la borne, les baguettes posées en croix. Le tambour, c’est celui que j’ai. Il est meilleur que le mien.' },
    ],
    humeurs: {
      joyeux: ['Trois procès-verbaux avant midi ! Une journée de grande activité.', 'La foire approche. J’ai ciré la plaque.'],
      triste: ['Ma femme m’a écrit. Une ligne. « Tu parles encore trop ? » J’ai répondu quatre pages.'],
      fatigue: ['La chèvre de Bastien m’a fait courir toute la matinée. Je l’ai verbalisée. Elle s’en fiche.'],
      inquiet: ['Les bornes du hameau abandonné ont bougé. Toutes. Du même côté.', 'Le tambour sonne creux, ce matin. Comme s’il y avait quelque chose dedans.'],
      agace: ['On a encore taillé la haie de Morel du mauvais côté. C’est de la provocation.'],
    },
    souvenirs: {
      absence: ['Vous revoilà ! Je vous avais marqué « disparu » dans le carnet. Je raye. Avec plaisir.'],
      victime: ['On l’a enterré. J’ai fait battre le tambour, un seul roulement. Ça se fait, chez nous.'],
      coup: ['Coups et blessures sur agent assermenté. Je l’ai écrit en lettres capitales.'],
    },
    foi_lignes: ['Je vais à la messe de la ville, l’Orédi, quand la chèvre de Bastien me le permet.'],
    fete_lignes: ['C’est la Saint-Fulbert, ou presque. Personne ne le sait. Je le dis à tout le monde.'],
    secret: 'Dans le carnet, il y a une page à mon nom. Pas de mon écriture. « Tissier, garde champêtre. À verbaliser. » La date est en blanc.',
  },
  gendarme: {
    foi: 'eglise', devotion: 1, fete: 19, mythes: [],
    histoire: [
      { titre: 'La brigade', min: 0, texte: 'J’ai fait l’école de la gendarmerie à Melun. On nous apprenait le Code, l’équitation, le pansage, et à ne jamais montrer qu’on a peur. On ne nous apprenait pas ce qu’il faut faire quand on a peur quand même. Je l’ai appris ici.' },
      { titre: 'Les rapports', min: 1, texte: 'Chaque semaine, j’envoie un rapport. Chaque semaine, rien. Une fois, une seule, une enveloppe est revenue, avec le cachet de la préfecture. Dedans, mon propre rapport, plié, et dessous, d’une écriture que je ne connais pas : « Reçu. Restez. »' },
      { titre: 'Le gué du moulin', min: 3, texte: 'Mistral refuse le gué du moulin, la nuit. Une fois, je l’ai forcé. Au milieu de l’eau, il s’est arrêté net, et j’ai vu pourquoi : il y avait une main, sous la surface, ouverte, posée à plat sur le fond. Une main propre. Je suis passé par le pont des Saules, depuis.' },
    ],
    humeurs: {
      joyeux: ['Rapport terminé, cheval pansé, rien à signaler. Une bonne journée de gendarme.'],
      triste: ['Ma mère m’écrit de la ville. Elle croit que je reviens au printemps. Je ne lui ai pas dit le contraire.'],
      fatigue: ['La tournée des Sources, à pied, sous la pluie. Mistral regardait par la fenêtre de l’écurie.'],
      inquiet: ['On a sellé Mistral, cette nuit. Pas moi. La selle était chaude.', 'Le garde champêtre ne parle plus depuis ce matin. C’est la première fois.'],
      agace: ['Le chevalier du guet m’a salué à l’ancienne, la main sur la garde. Je crois qu’il se moque de moi.'],
    },
    souvenirs: {
      absence: ['Je vous ai cherché sur ma tournée. Je l’ai écrit dans le rapport. Personne ne le lira.'],
      victime: ['J’ai dressé le constat. Ce n’est pas la première fois. Je n’ai jamais eu de réponse.'],
      coup: ['Outrage et violences à agent de la force publique. Je ne l’oublierai pas, et le Code non plus.'],
    },
    foi_lignes: ['Je crois en Dieu et au Code. Le Code, au moins, je l’ai lu en entier.'],
    fete_lignes: ['Mon anniversaire. J’ai reçu une lettre de ma mère. Elle a deux mois de retard. Elle est datée d’aujourd’hui.'],
    secret: 'Je n’ai jamais vu le capitaine qui m’a envoyé ici. Mon ordre de mission était déjà signé quand on me l’a donné. La signature, c’est la mienne.',
  },
});

// ---------------------------------------------------------------- leurs poches, leurs cris (11-zzz90-vol.js), leurs papiers (11-zzz98-fouilles.js)
Object.assign(VOL_POCHES, {
  chevalier_guet: { b: [12, 34], m: ['bougie', 'pain'], p: ['tabatiere', 'montre'] },
  garde_champetre: { b: [6, 20], m: ['plume', 'pain'], p: ['couteau_poche', 'tabatiere'] },
  gendarme: { b: [10, 28], m: ['plume', 'bougie'], p: ['montre'] },
});
Object.assign(VOL_CRIS, {
  chevalier_guet: 'La main dans la poche du guet. Vous avez du cœur, ou pas de tête.',
  garde_champetre: 'Ah ! Tentative de vol sur agent assermenté ! Ça, c’est un procès-verbal de première classe !',
  gendarme: 'Vous faites les poches d’un gendarme ? Vous êtes en état d’arrestation.',
});
const G1_PAPIERS = {
  g1_reichshoffen: { pool: 'g1_guet', t: 'Une lettre jaunie', x: 'Mon fils,\n\nOn nous dit que le régiment a chargé et qu’il n’en reste presque rien. On ne nous dit pas qui. Ta mère allume une bougie chaque soir à la fenêtre. Écris-nous, même une ligne.\n\n(Au dos, au crayon, d’une main plus jeune : « Vivant. Le cheval, non. »)' },
  g1_ferrand: { pool: 'g1_guet', t: 'Brouillon de rapport', x: 'Rapport du chevalier du guet au maire de {ville}. Objet : le sergent Ferrand.\n\nLe sergent n’a pas paru. Son lit de camp est fait. Sa gamelle est sur la table.\n\nNuit du Vorndi : on a frappé au corps de garde, trois coups, à l’heure où il devait arriver. J’ai demandé le nom. On m’a répondu « Ferrand ». J’ai demandé le mot du guet. On ne m’a pas répondu.\n\n(Le rapport n’a jamais été envoyé.)' },
  g1_ordonnance: { pool: 'g1_guet', t: 'Ordonnance sur le guet', x: 'Article premier. Le guet veille de la levée des ponts à leur abaissement.\nArticle deux. Il ne répond à aucune voix venue des douves.\nArticle trois. Il tient registre.\nArticle quatre. Si le guet vient à manquer, le dernier qui l’a vu vivant prend la garde.\n\nSceau de la ville, cire noire. L’année est effacée.' },
  g1_pv_chevre: { pool: 'g1_champetre', t: 'Procès-verbal', x: 'Le Lavedi, à six heures, nous, garde champêtre de {hameau}, assermenté, avons constaté qu’une chèvre appartenant au sieur Bastien se trouvait dans le potager du sieur Morel, où elle mangeait les choux. Interpellée, elle n’a rien voulu entendre.\n\nAmende : un franc. Payée en fromage.' },
  g1_pv_inconnu: { pool: 'g1_champetre', t: 'Procès-verbal contre inconnu', x: 'Nuit du Vorndi, trois heures. Avons entendu frapper à toutes les portes du hameau, l’une après l’autre, en commençant par la nôtre. Sorti avec la lanterne. Personne. Pas de traces dans la boue.\n\nMotif retenu : tapage nocturne.\n\nEn marge, d’une autre encre : « Il a frappé aussi à la porte de la cabane. De l’intérieur. »' },
  g1_rapport: { pool: 'g1_champetre', t: 'Rapport à la préfecture (copie)', x: 'Brigadier,\n\nJe vous rends compte que la tournée de la semaine s’est faite sans incident, sauf ce qui suit. Aux Planches, on m’a refusé l’accès. Aux Sources, on m’a offert un bain. Sur la route du lac, à minuit, un cavalier m’a croisé sans lanterne ; son cheval ne faisait aucun bruit.\n\nJe réitère ma demande de relève.\n\n(Au-dessous, d’une autre écriture : « Reçu. Restez. »)', s: 'Gendarme Delcourt' },
};
for (const id in G1_PAPIERS) { if (F2_PAPIERS[id]) continue; F2_PAPIERS[id] = G1_PAPIERS[id]; (F2_POOLS[G1_PAPIERS[id].pool] || (F2_POOLS[G1_PAPIERS[id].pool] = [])).push(id); }
// les lits de camp (11-zzz95-sommeil.js : demi-largeur, demi-longueur, hauteur du dessus)
LIT_TAILLE.g1_lit_camp = [0.4, 0.95, 0.45];
// celui qui vous trouve dans son lit
const G1_LIT_DECOUVERT = {
  chevalier_guet: 'Mon lit de camp. Celui du passant est juste à côté, vous l’avez manqué. Debout. Et estimez-vous heureux que ce soit moi.',
  garde_champetre: 'Dans mon lit ! Violation de domicile sur la personne d’un agent assermenté ! Dehors ! Je verbalise demain !',
  gendarme: 'Vous êtes dans mon lit. Je vous prie d’en sortir. Je prendrai votre déposition dehors.',
};

// ============================================================================
//  GÉNÉRATION : le corps de garde du pont nord, la cabane des gardes du hameau
// ============================================================================
const g1W = (f, lx, lz) => { const c = Math.cos(f.r), s = Math.sin(f.r); return [f.x + lx * c + lz * s, f.z - lx * s + lz * c]; };
const g1L = (f, x, z) => { const c = Math.cos(f.r), s = Math.sin(f.r), dx = x - f.x, dz = z - f.z; return [dx * c - dz * s, dx * s + dz * c]; };
// le repère d'une construction dont la porte (−z local) regarde dans la direction (dx, dz)
const g1Repere = (x, z, dx, dz) => ({ x, y: 0, z, r: Math.atan2(-dx, -dz) });

// un rectangle local R = [x0, x1, z0, z1] du repère f est-il libre ? → { hmin, hmax, hmoy } ou null
function g1Libre(w, f, R) {
  const World_ = World, N = w.nav, pts = [];
  let hmin = 1e9, hmax = -1e9, hs = 0;
  for (let lx = R[0]; lx <= R[1] + 1e-6; lx += 0.5) for (let lz = R[2]; lz <= R[3] + 1e-6; lz += 0.5) {
    const [x, z] = g1W(f, lx, lz);
    if (!w.inside(x, z, 30)) return null;
    const h = w.heightAt(x, z);
    if (h < w.waterLevel + 0.5) return null;
    if (h < hmin) hmin = h;
    if (h > hmax) hmax = h;
    hs += h; pts.push([x, z]);
  }
  if (hmax - hmin > 1.5) return null;
  const dedans = (x, z, m) => { const [lx, lz] = g1L(f, x, z); return lx > R[0] - m && lx < R[1] + m && lz > R[2] - m && lz < R[3] + m; };
  // les blocs (murs, toits, collisions des objets posés), de la cave jusqu'à huit mètres au-dessus
  for (const [x, z] of pts) {
    let hit = false;
    w.query(x, z, 0.6, null, (b) => {
      if (hit || b.under || b.y > hmax + 8 || b.y + b.sy < hmin - 0.3) return;
      const [bx, bz] = World_.blockLocal(b, x, z);
      if (Math.abs(bx) < b.sx / 2 + 0.3 && Math.abs(bz) < b.sz / 2 + 0.3) hit = true;
    });
    if (hit) return null;
  }
  // les objets posés, les interactions, les portes, les lieux-dits secrets
  for (const q of w.props) if (Math.abs(q.x - f.x) < 30 && Math.abs(q.z - f.z) < 30 && dedans(q.x, q.z, 0.6)) return null;
  for (const it of w.inter || []) if (Math.abs(it.x - f.x) < 30 && Math.abs(it.z - f.z) < 30 && dedans(it.x, it.z, 0.6)) return null;
  for (const d of w.doors) if (Math.abs(d.x - f.x) < 30 && Math.abs(d.z - f.z) < 30 && dedans(d.x, d.z, 1.0)) return null;
  for (const k in w.lm) { const L = w.lm[k]; if (L && L.secret && Math.hypot(L.x - f.x, L.z - f.z) < 25) return null; }
  // les chemins des habitants : aucun nœud dedans, aucune arête qui le traverse (à 2,5 m près)
  for (const q of N.nodes) if (Math.abs(q.x - f.x) < 30 && Math.abs(q.z - f.z) < 30 && dedans(q.x, q.z, 1.2)) return null;
  const rr = Math.hypot(R[1] - R[0], R[3] - R[2]) / 2 + 4, cx = (R[0] + R[1]) / 2, cz = (R[2] + R[3]) / 2, [wx, wz] = g1W(f, cx, cz);
  for (const [a, b] of N.edges) {
    const A = N.nodes[a], Bn = N.nodes[b];
    if (!A || !Bn) continue;
    const L = Math.hypot(Bn.x - A.x, Bn.z - A.z), dx = Bn.x - A.x, dz = Bn.z - A.z;
    const t = clamp(((wx - A.x) * dx + (wz - A.z) * dz) / (L * L || 1), 0, 1);
    if (Math.hypot(A.x + dx * t - wx, A.z + dz * t - wz) > rr) continue;
    const n = Math.max(2, Math.ceil(L / 0.5));
    for (let k = 0; k <= n; k++) if (dedans(A.x + dx * k / n, A.z + dz * k / n, 2.5)) return null;
  }
  return { hmin, hmax, hmoy: hs / pts.length };
}

// le chemin du réseau (A*, généré : pas de portes ni de ponts à juger) d'un nœud à un autre
function g1Chemin(w, a, b) {
  const N = w.nav;
  if (a < 0 || b < 0 || !N.adj) return null;
  const g = new Map([[a, 0]]), came = new Map(), open = new Set([a]), H = (i) => Math.hypot(N.nodes[i].x - N.nodes[b].x, N.nodes[i].z - N.nodes[b].z);
  let it = 0;
  while (open.size && it++ < 20000) {
    let cur = -1, bf = 1e18;
    for (const i of open) { const f = g.get(i) + H(i); if (f < bf) { bf = f; cur = i; } }
    if (cur === b) { const P = [cur]; let c = cur; while (came.has(c)) { c = came.get(c); P.unshift(c); } return P; }
    open.delete(cur);
    for (const e of N.adj[cur] || []) {
      const ng = g.get(cur) + e.d;
      if (ng < (g.get(e.to) ?? 1e18)) { g.set(e.to, ng); came.set(e.to, cur); open.add(e.to); }
    }
  }
  return null;
}
function g1Noeud(w, x, z, filtre) {
  let best = -1, bd = 1e9;
  w.nav.nodes.forEach((q, i) => { if (q.iso || /:(in|mid)$/.test(q.tag) || (filtre && !filtre(q, i))) return; const d = Math.hypot(q.x - x, q.z - z); if (d < bd) { bd = d; best = i; } });
  return best;
}

// une construction : le bâtiment (Builder.building : maison, porte, nœuds, w.bld), sol aplani, broussailles ôtées
function g1Batir(w, B, key, f, W, D, o, emprise, nObj0) {
  // le sol : aplani sur toute l'emprise (et un peu autour)
  const [ex, ez] = g1W(f, (emprise[0] + emprise[1]) / 2, (emprise[2] + emprise[3]) / 2);
  const fe = { x: ex, z: ez, r: f.r }, hw = (emprise[1] - emprise[0]) / 2 + 0.4, hd = (emprise[3] - emprise[2]) / 2 + 0.4;
  B.flattenRect(fe, hw, hd, f.y, 2.5);
  f.y = w.heightAt(f.x, f.z);
  // ce qui pousse là (arbres, buissons, herbes) s'en va ; les bêtes et les choses posées restent
  const R = Math.hypot(hw, hd) + 3;
  for (let i = 0; i < nObj0; i++) {
    const ob = w.objects[i];
    if (ob.gone || Math.abs(ob.x - ex) > R || Math.abs(ob.z - ez) > R) continue;
    const T = OBJ_TYPES[ob.t];
    if (!T || T.animal || (typeof C2_GARDE !== 'undefined' && C2_GARDE.has(T.id))) continue;
    const [lx, lz] = g1L(fe, ob.x, ob.z);
    if (Math.abs(lx) > hw + 2.5 || Math.abs(lz) > hd + 2.5) continue;
    ob.gone = true; ob.cleared = true;
  }
  w.objectsDirty = true;
  return B.building(key, f, W, D, o, null);
}

// le choix d'un emplacement : des candidats, le premier libre selon l'ordre de préférence
function g1Choisir(w, cands, R) {
  for (const c of cands) {
    const L = g1Libre(w, c, R);
    if (L) { c.y = L.hmoy; return c; }
  }
  return null;
}

function g1Generer(w, seed) {
  if (!w || !w.designed || !w.townInfo || !w.nav || !w.nav.adj || !w.bld) return;
  const rnd = mulberry32((((seed | 0) ^ 0xC6A2D1) >>> 0));
  const B = new Builder(w, rnd, new Uint8Array(w.W * w.W));
  const T = w.townInfo, nObj0 = w.objects.length;
  w.g1 = { lieux: {} };
  const ronde = (cx, cz, pts) => pts.filter(([x, z]) => w.inside(x, z, 30) && w.heightAt(x, z) > w.waterLevel + 0.4 && pointFree(w, x, z, 0.6)).map(([x, z]) => [Math.round(x * 10) / 10, Math.round(z * 10) / 10]);

  // ============================================================ VALBRUME : le corps de garde, au bout du pont nord
  try {
    const br = (w.bridges || []).find((b) => b.key === 'pont_nord');
    if (br) {
      const ox = br.x + Math.sin(br.r) * (br.L + 1.5), oz = br.z + Math.cos(br.r) * (br.L + 1.5); // le bout du tablier, côté dehors
      const ux = Math.sin(br.r), uz = Math.cos(br.r), vx = uz, vz = -ux;  // u : vers le dehors ; v : de côté
      const W = 5.6, D = 4.4, R = [-W / 2 - 1.0, W / 2 + 2.6, -D / 2 - 2.6, D / 2 + 0.8];
      const cands = [];
      for (const av of [11, 13, 15, 17, 20]) for (const lat of [8.5, 10, 12]) for (const s of [1, -1]) {
        const x = ox + ux * av + vx * s * lat, z = oz + uz * av + vz * s * lat;
        cands.push(g1Repere(x, z, -vx * s, -vz * s)); // la porte regarde la route
      }
      const f = g1Choisir(w, cands, R);
      if (f) {
        const key = 'g1_corps_garde';
        const Bk = g1Batir(w, B, key, f, W, D, { wall: M_STONE, win: M_STONEWIN, roof: M_SLATE, noLight: true, dw: 1.2, dh: 2.25, roofH: 1.9 }, R, nObj0);
        g1MeublerGuet(w, B, Bk, f, W, D);
        w.grid = null;
        // la guérite, au bout du pont (côté de la cabane), ouverte vers la route
        const s = Math.sign(g1L({ x: ox, z: oz, r: Math.atan2(ux, uz) }, f.x, f.z)[0]) || 1;
        // (le premier endroit sec et libre, au bout du tablier, du côté de la cabane d'abord)
        // (hors du chemin, loin du poteau indicateur et des arbres)
        guerite: for (const ss of [s, -s]) for (const av of [1.6, 2.6, 3.6, 4.6]) for (const lat of [3.6, 4.4, 5.2]) {
          const gx = ox + ux * av + vx * ss * lat, gz = oz + uz * av + vz * ss * lat;
          if (!pointFree(w, gx, gz, 0.7) || Math.abs(w.heightAt(gx, gz) - w.heightAt(ox, oz)) > 0.8) continue;
          if (!g1Libre(w, g1Repere(gx, gz, 1, 0), [-0.7, 0.7, -0.7, 0.7])) continue;
          if (w.props.some((q) => Math.abs(q.x - gx) < 3 && Math.abs(q.z - gz) < 3 && Math.hypot(q.x - gx, q.z - gz) < 2.6)) continue;
          let gene = false;
          w.query(gx, gz, 1.6, (o) => { if (!gene && o && !o.gone && Math.hypot(o.x - gx, o.z - gz) < 1.4 && OBJ_TYPES[o.t] && !OBJ_TYPES[o.t].animal) gene = true; }, null);
          if (gene) continue;
          B.prop('g1_guerite', gx, w.heightAt(gx, gz), gz, Math.atan2(-vx * ss, -vz * ss));
          break guerite;
        }
        const ext = (lx, lz) => g1W(f, lx, lz);
        const pont = [ox + ux * 2.2 - vx * s * 0.2, oz + uz * 2.2 - vz * s * 0.2];
        // la ronde de nuit : le long des douves, du côté du dehors (le nord), et sur la route
        const pts = ronde(ox, oz, [[ox + ux * 6 + vx * 26, oz + uz * 6 + vz * 26], [ox + ux * 26, oz + uz * 26], [ox + ux * 6 - vx * 26, oz + uz * 6 - vz * 26], [ox + ux * 6 + vx * 44, oz + uz * 6 + vz * 44], [ox + ux * 6 - vx * 44, oz + uz * 6 - vz * 44]]);
        w.g1.lieux.valbrume = { key, f: { x: f.x, y: f.y, z: f.z, r: f.r }, W, D, pont, ronde: pts, poste: Bk.spots.poste, ext: ext(0, -D / 2 - 3) };
        B.landmark(key, Bk.out[0], Bk.out[1], 8);
      }
    }
  } catch (e) { console.error('G1 : le corps de garde', e); }

  // ============================================================ CLAIRPRÉ : la cabane des gardes, à l'entrée du hameau
  try {
    const Hm = w.lm.hameau;
    if (Hm) {
      // la route qui vient de la ville : le chemin du réseau, du hameau jusqu'au pont sud
      const a0 = g1Noeud(w, Hm.x, Hm.z, (q) => q.tag === 'hameau'), a = a0 >= 0 ? a0 : g1Noeud(w, Hm.x, Hm.z);
      const gS = T.gS || [T.x, T.z + 60];
      const b = g1Noeud(w, gS[0], gS[1]);
      const P = g1Chemin(w, a, b) || [];
      const pts = P.map((i) => w.nav.nodes[i]);
      const cands = [];
      const W = 5.4, D = 4.2, R = [-W / 2 - 4.0, W / 2 + 2.6, -D / 2 - 2.6, D / 2 + 0.9];
      for (let k = 1; k < pts.length; k++) {
        const q = pts[k], q0 = pts[k - 1], d = Math.hypot(q.x - Hm.x, q.z - Hm.z);
        if (d < 22) continue;
        if (d > 70) break;
        const L = Math.hypot(q.x - q0.x, q.z - q0.z) || 1, ux = (q.x - q0.x) / L, uz = (q.z - q0.z) / L, vx = uz, vz = -ux;
        for (const t of [0, 0.35, 0.7]) for (const lat of [8, 9.5, 11]) for (const s of [1, -1]) {
          const x = lerp(q0.x, q.x, t) + vx * s * lat, z = lerp(q0.z, q.z, t) + vz * s * lat;
          if (Math.hypot(x - Hm.x, z - Hm.z) < 20) continue;
          cands.push(g1Repere(x, z, -vx * s, -vz * s));
        }
      }
      // (sans chemin trouvé : du côté de la ville, à trente mètres)
      if (!cands.length) {
        const dx = T.x - Hm.x, dz = T.z - Hm.z, L = Math.hypot(dx, dz) || 1, ux = dx / L, uz = dz / L;
        for (const av of [30, 36, 42]) for (const lat of [8, 10]) for (const s of [1, -1]) cands.push(g1Repere(Hm.x + ux * av + uz * s * lat, Hm.z + uz * av - ux * s * lat, -uz * s, ux * s));
      }
      const f = g1Choisir(w, cands, R);
      if (f) {
        const key = 'g1_cabane_hameau';
        const Bk = g1Batir(w, B, key, f, W, D, { wall: M_LOGS, win: M_TIMBERWIN, roof: M_ROOF, noLight: true, dw: 1.2, dh: 2.25, roofH: 1.8 }, R, nObj0);
        g1MeublerHameau(w, B, Bk, f, W, D);
        w.grid = null;
        const P2 = ronde(Hm.x, Hm.z, [0, 1, 2, 3, 4].map((k) => { const a2 = Math.atan2(f.x - Hm.x, f.z - Hm.z) + 0.6 + k * TAU / 5, r2 = 34 + (k % 2) * 8; return [Hm.x + Math.sin(a2) * r2, Hm.z + Math.cos(a2) * r2]; }));
        w.g1.lieux.clairpre = { key, f: { x: f.x, y: f.y, z: f.z, r: f.r }, W, D, ronde: P2, poste: Bk.spots.poste, ecurie: Bk.spots.ecurie, cheval: Bk.spots.cheval };
        B.landmark(key, Bk.out[0], Bk.out[1], 8);
      }
    }
  } catch (e) { console.error('G1 : la cabane du hameau', e); }

  // ============================================================ les chemins : les portes des cabanes rejoignent le réseau
  try {
    if (w.g1.lieux.valbrume || w.g1.lieux.clairpre) {
      const N = w.nav;
      for (const q of N.nodes) delete q.iso;
      finalizeNav(w);
      const seen = new Set();
      for (let i = 0; i < N.nodes.length; i++) {
        if (!/^village:/.test(N.nodes[i].tag)) continue;
        const Q = [i]; seen.add(i);
        while (Q.length) { const c = Q.shift(); N.nodes[c].iso = false; for (const e of N.adj[c]) if (!seen.has(e.to)) { seen.add(e.to); Q.push(e.to); } }
      }
    }
  } catch (e) { console.error('G1 : les chemins', e); }
  w.grid = null;
}

// ---------------------------------------------------------------- le corps de garde (repère du bâtiment : x le long de la façade, la porte en −z)
function g1MeublerGuet(w, B, Bk, f, W, D) {
  const y = 0.15, P = (id, lx, lz, rr, data, dy) => B.propRel(f, id, lx, y + (dy || 0), lz, rr || 0, data);
  const spot = (name, lx, lz, rr, dy) => { const [x, z] = g1W(f, lx, lz); Bk.spots[name] = { x, y: f.y + (dy ?? y), z, r: f.r + (rr || 0) }; };
  // les deux lits de camp, contre le mur du fond (le traversin vers le mur) : le sien, celui du passant
  P('g1_lit_camp', -1.95, 0.85, Math.PI, { col: '#4a4e3e' });
  P('g1_lit_camp', -1.05, 0.85, Math.PI, { col: '#6a5a46', passant: true, nu: true });
  spot('bed', -1.95, 0.85, Math.PI, y + 0.45); spot('lit_chevalier_guet', -1.95, 0.85, Math.PI, y + 0.45); spot('lit_passant', -1.05, 0.85, Math.PI, y + 0.45);
  // la table, le registre, la lampe ; la cheminée au fond à droite
  P('table', 1.35, -0.25, 0);
  P('chaise', 1.35, -1.0, Math.PI); P('chaise', 0.5, -0.25, Math.PI / 2);
  spot('sit', 1.35, -1.0, 0); spot('assis_chevalier_guet', 1.35, -1.0, 0);
  P('g1_registre', 1.15, -0.2, 0.2, null, 0.79);
  P('b1_lampe', 1.75, 0.05, 0, null, 0.79);
  B.interRel(f, 'g1_registre', 'g1_registre_guet', 1.15, y + 1.0, -0.25, 'Lire le registre du guet', { lieu: 'valbrume' });
  P('cheminee', 1.6, 1.62, Math.PI, { lit: true });
  B.block(f, 1.6, 2.7, 1.75, 0.7, 2.4, 0.7, M_BRICK); // (le conduit, juste au-dessus du foyer : celui de Builder.house tomberait au milieu de la pièce)
  P('g1_cuirasse_pose', 2.25, 0.55, -Math.PI / 2);
  P('b1_ratelier', 2.38, -1.05, -Math.PI / 2);
  P('g1_seaux', 0.95, -1.88, 0);
  P('b1_patere', -2.43, -0.9, Math.PI / 2, { col: '#1f2a46' });
  // le coffre du guet (on le fouille : c'est voler le guet)
  const mal = P('malle', -1.75, -1.55, 0, { vide: false });
  const idF = 'f2:g1:guet:coffre', [ix, iz] = g1W(f, -1.75, -1.0);
  mal.f2 = idF;
  B.inter('f2', idF, ix, f.y + y + 0.55, iz, 'Ouvrir le coffre du guet', { t: 'malle', own: 'chevalier_guet', bld: Bk.key, lieu: 'maison', table: 'f2_coffre_garde', lock: 2, pool: 'g1_guet' });
  // dehors : le brasero, le banc, le tableau des avis, la lanterne
  P('brasero', 1.85, -3.5, 0, { lit: false }, -0.15);
  P('banc', -1.3, -2.72, Math.PI, null, -0.15);
  P('g1_tableau', 1.55, -2.24, Math.PI, null, 1.05);
  P('lanterne_suspendue', -2.95, -2.95, 0, null, -0.15);
  B.interRel(f, 'g1_avis', 'g1_avis_guet', 1.55, y + 1.5, -2.7, 'Lire les avis', { lieu: 'valbrume' });
  spot('poste', 1.0, -3.95, Math.PI, 0); // debout près du feu, face à la route
}

// ---------------------------------------------------------------- la cabane des gardes du hameau (et son écurie, à gauche)
function g1MeublerHameau(w, B, Bk, f, W, D) {
  const y = 0.15, P = (id, lx, lz, rr, data, dy) => B.propRel(f, id, lx, y + (dy || 0), lz, rr || 0, data);
  const spot = (name, lx, lz, rr, dy) => { const [x, z] = g1W(f, lx, lz); Bk.spots[name] = { x, y: f.y + (dy ?? y), z, r: f.r + (rr || 0) }; };
  P('g1_lit_camp', -1.85, 0.75, Math.PI, { col: '#5a5e4e' });
  P('g1_lit_camp', -0.95, 0.75, Math.PI, { col: '#2c3450' });
  spot('bed', -1.85, 0.75, Math.PI, y + 0.45); spot('lit_garde_champetre', -1.85, 0.75, Math.PI, y + 0.45); spot('lit_gendarme', -0.95, 0.75, Math.PI, y + 0.45);
  P('table', 1.25, -0.3, 0);
  P('chaise', 1.25, -1.05, Math.PI); P('chaise', 0.4, -0.3, Math.PI / 2);
  spot('sit', 1.25, -1.05, 0); spot('assis_garde_champetre', 1.25, -1.05, 0); spot('assis_gendarme', 0.4, -0.3, -Math.PI / 2);
  P('g1_registre', 1.05, -0.25, -0.15, null, 0.79);
  P('b1_lampe', 1.7, 0.0, 0, null, 0.79);
  B.interRel(f, 'g1_registre', 'g1_registre_hameau', 1.05, y + 1.0, -0.3, 'Lire le registre des procès-verbaux', { lieu: 'clairpre' });
  P('g1_poele', 1.95, 1.35, Math.PI, { h: 4.4, lit: true });
  P('b1_ratelier', 0.35, 1.68, Math.PI);
  P('g1_tambour', 2.1, 0.35, 0.4);
  P('g1_seaux', 0.95, -1.78, 0);
  P('b1_patere', -2.33, -0.85, Math.PI / 2, { col: '#1b2236', chapeau: true });
  const mal = P('malle', -1.65, -1.45, 0, { vide: false });
  const idF = 'f2:g1:hameau:coffre';
  mal.f2 = idF;
  B.inter('f2', idF, g1W(f, -1.65, -0.9)[0], f.y + y + 0.55, g1W(f, -1.65, -0.9)[1], 'Ouvrir le coffre des gardes', { t: 'malle', own: 'garde_champetre', bld: Bk.key, lieu: 'maison', table: 'f2_coffre_garde', lock: 2, pool: 'g1_champetre' });
  // dehors : le brasero du gendarme, le banc, le tableau des avis, la lanterne
  P('brasero', 1.8, -3.4, 0, { lit: false }, -0.15);
  P('banc', -0.6, -2.62, Math.PI, null, -0.15);
  P('g1_tableau', 1.45, -2.14, Math.PI, null, 1.05);
  P('lanterne_suspendue', 2.85, -2.7, Math.PI, null, -0.15);
  B.interRel(f, 'g1_avis', 'g1_avis_hameau', 1.45, y + 1.5, -2.6, 'Lire les avis', { lieu: 'clairpre' });
  spot('poste', 1.0, -3.85, Math.PI, 0);
  // l'écurie : un appentis contre le mur de gauche (−x), un toit qui descend vers le dehors, quatre poteaux
  const X0 = -W / 2 - 3.2, X1 = -W / 2 - 0.05, Z0 = -1.7, Z1 = 1.7, yb = f.y;
  for (const [lx, lz] of [[X0 + 0.1, Z0 + 0.1], [X0 + 0.1, Z1 - 0.1]]) B.block(f, lx, 0, lz, 0.16, 2.25, 0.16, M_LOGS);
  B.block(f, (X0 + X1) / 2, 2.25, 0, Z1 - Z0 + 0.5, 0.65, X1 - X0 + 0.3, M_ROOF, Math.PI / 2, 2);
  B.block(f, (X0 + X1) / 2, -0.05, 0, X1 - X0, 0.1, Z1 - Z0, M_PLANKS);
  P('mangeoire', X1 - 0.4, 0, Math.PI / 2, { fill: 1 }, -0.15);
  P('botte_foin', X0 + 0.7, -1.05, 0.3, null, -0.15);
  P('g1_selle', X0 + 0.65, 1.05, Math.PI / 2, null, -0.15);
  P('poteau_attache', X0 - 0.9, 0, Math.PI / 2, null, -0.15);
  spot('ecurie', X0 - 0.4, -0.6, Math.PI / 2, 0); // devant l'écurie, à panser le cheval
  spot('cheval', (X0 + X1) / 2 - 0.2, 0, Math.PI / 2, 0);
  void yb;
}

// ---------------------------------------------------------------- la passe de génération, après tout le reste
{
  const _gv = generateValley;
  generateValley = async function (seed, progress, gen) {
    const w = await _gv(seed, progress, gen);
    if (w && w.designed) { try { g1Generer(w, w.seed || seed); } catch (e) { console.error('G1 : les cabanes de garde', e); } }
    return w;
  };
}
