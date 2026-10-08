// ============================================================================
//  LES GOBELINS (agent X, vague 14) : les données et les textes
//  Une nichée de gobelins vit sous la vallée, dans la Gobelinière : un village
//  creusé sous une vieille souche, au fond des bois, plein de ce qu'ils ont pris
//  depuis des générations. La nuit, ils sortent par des terriers près des
//  maisons, passent à travers les murs, prennent dans les coffres et les
//  meubles, et rentrent. Ils restent loin des hommes ; qui les voit les fait
//  fuir hors de sa vue ; bloqués, ils passent à travers les murs.
//  (génération : 11-zzzzX-1-gen.js ; le jeu : 11-zzzzX-2-jeu.js ; modèles :
//  07-zzzzzzzzzzzzX-gobelins.js ; sons : 09-zzzzzX-gobelins.js ; créature :
//  10-zzzzzX-gobelins.js ; l'étal et le carnet : 12-zzzzzX-gobelins.js)
// ============================================================================

// ---------------------------------------------------------------- objets
defItem('gob_dent', 'Dent de gobelin', 'tresor', 6, ['croc', '#d8cfa8'], { desc: 'Longue, jaune, la racine noire. Pas tout à fait une dent d’enfant, pas tout à fait une dent de bête.' });
defItem('gob_trousseau', 'Trousseau rouillé', 'tresor', 9, ['cle', '#8a6a4a'], { desc: 'Un anneau de fer où pendent des dizaines de clés dépareillées. Certaines portent encore une étiquette : « grenier », « cave », « chambre du petit ». Elles n’ouvrent plus rien : les serrures ont changé depuis longtemps.' });
defItem('gob_hochet', 'Hochet d’argent', 'tresor', 30, ['rond', '#d4d4dc'], { desc: 'Un hochet à grelots, mordillé. Sur le manche, un prénom à moitié effacé : « …ette, 1821 ».' });
defItem('gob_alliance', 'Alliance gravée', 'tresor', 38, ['anneau', '#e0c060'], { desc: 'À l’intérieur, deux initiales et une date : « J. M. — 1788 ». L’or est mince d’un côté : elle a été portée longtemps.' });
defItem('gob_bonnet', 'Bonnet de baptême', 'tresor', 4, ['sachet', '#f0ece0'], { desc: 'Un petit bonnet de lin brodé de blanc. Lavé, repassé, plié avec soin. Par qui ?' });
defItem('gob_chiffons', 'Chiffons de gobelin', 'materiau', 1, ['tas', '#6a5a48'], { desc: 'Ce qui reste d’eux au matin : des chiffons cousus de travers, qui sentent le suif et la cave.' });
defItem('gob_couronne', 'Couronne de cuillères', 'tresor', 64, ['couronne', '#c8c8d0'], { desc: 'Des cuillères d’argent tordues, liées au fil de laiton en une couronne. Elle est tiède, et elle le reste.' });

// ---------------------------------------------------------------- ce qu'on tire d'un tas (une poignée)
// (un petit tas : trois poignées d'une cinquantaine de pièces ; le grand tas : trois poignées d'environ cent trente :
// tout le trésor de la Gobelinière vaut quatre journées de travail du début — voir tools/equilibrage/X.js)
Object.assign(LOOT, {
  gob_tas: { rolls: [2, 4], items: [['argent', 3, 14, 4], ['vieille_piece', 1, 2, 3], ['cuillere_argent', 1, 1, 2], ['de_coudre', 1, 1, 1.5], ['boutons_nacre', 1, 1, 1.5], ['ruban', 1, 1, 1], ['bougeoir', 1, 1, 0.8], ['besicles', 1, 1, 0.7], ['montre', 1, 1, 0.25], ['bijou', 1, 1, 0.35], ['tabatiere', 1, 1, 0.4], ['couteau_poche', 1, 1, 0.6], ['bobine_fil', 1, 2, 1], ['clous', 1, 3, 1], ['timbres', 1, 1, 0.6], ['image_pieuse', 1, 1, 0.6], ['jeu_cartes', 1, 1, 0.4], ['bille', 1, 3, 1], ['figurine', 1, 1, 0.4], ['mouchoir_brode', 1, 1, 1], ['gob_alliance', 1, 1, 0.12], ['gob_hochet', 1, 1, 0.1], ['gob_trousseau', 1, 1, 0.2], ['gob_bonnet', 1, 1, 0.15]] },
  gob_grand_tas: { rolls: [3, 5], items: [['argent', 10, 30, 4], ['vieille_piece', 1, 3, 3], ['cuillere_argent', 1, 2, 2], ['bougeoir', 1, 1, 1.4], ['bijou', 1, 1, 1.2], ['montre', 1, 1, 0.8], ['medaillon_portrait', 1, 1, 0.8], ['tabatiere', 1, 1, 1], ['besicles', 1, 1, 0.6], ['eau_cologne', 1, 1, 0.5], ['calice_etain', 1, 1, 0.3], ['gob_alliance', 1, 1, 0.35], ['gob_hochet', 1, 1, 0.3]] },
});

// ---------------------------------------------------------------- les réglages
const GOB_REGL = {
  nichee: 9,                    // gobelins (sans l'Aïeule)
  partir: 6,                    // tués au-delà desquels la nichée quitte la vallée
  vols: [1, 2],                 // vols par nuit, sans la rancune (au plus 3 avec elle)
  sortie: [21.5, 4.5],          // ils sortent entre ces heures
  porte: [22, 4],               // le panneau de la souche ne cède qu'à ces heures (ils sont dehors)
  vitesse: { rode: 1.0, marche: 1.55, course: 6.4, mur: 0.7 },
  // jusqu'où le joueur les distingue (m) : le jour ; la nuit, à la lune, à la lanterne, sous une lumière (lampadaire, feu)
  vue: { jour: 75, nuit: 12, lune: 18, lanterne: 14, lumiere: 32 },
  homme: 15,                    // m : la distance qu'ils gardent avec les hommes, tant qu'ils ne sont pas vus
  regard: 0.35,                 // s : regardés tant de temps, ils se savent vus
  paraitre: 125,                // m : un gobelin dehors prend corps sous cette distance du joueur
  quitter: 175,                 // m : et redevient une idée au-delà
  rodeurs: { periode: 18, nuit: 0.16, brune: 0.05, jour: 0.01 }, // chance, toutes les « période » secondes, d'en croiser un
  poignees: 3,                  // poignées par tas
  etal: 30,                     // objets gardés sur l'étal des prises (au-delà, les plus vieux vont aux tas)
  rancuneMax: 12,
};

// ---------------------------------------------------------------- les textes
const GOB_T = {
  // les plaintes du lendemain (le volé, quand on lui parle)
  plaintes: {
    maire: 'On est entré à la mairie cette nuit. Les portes étaient fermées : je les ai fermées moi-même. Il manque des choses, et il y a de la suie sur le cuir du sous-main. De petites traces. Comme des doigts.',
    boulangere: 'La nuit dernière, on a pris chez moi. Rien de cassé, la porte au verrou. Et sur la farine du pétrin, des empreintes de pieds nus. Petits. Ma fille dormait. Je vous jure qu’elle dormait.',
    fillette: 'Ils ont pris ma bille bleue. Ceux d’en dessous. Maman dit qu’il n’y a personne en dessous. Mais ils ont laissé une plume à la place, et ce n’est pas une plume d’ici.',
    forgeron: 'Quelqu’un est venu dans ma forge cette nuit. Pas par la porte : j’avais mis la barre. Il manque des clous. Et les braises étaient remuées, comme si on avait mis les mains dedans.',
    grainetiere: 'Il me manque de la monnaie dans le tiroir. Le tiroir était fermé à clé. Et ce matin, la boutique sentait la chandelle. Je n’ai pas allumé de chandelle.',
    aubergiste: 'Cette nuit, on a goûté à tous mes tonneaux. Tous. Un petit verre dans chacun, comme pour comparer. Les verres étaient lavés et rangés. Je n’aime pas ça du tout.',
    cure: 'On a pris dans la sacristie, cette nuit. Il y avait de la cire de cierge par terre, en petits tas, bien alignés. Comme si quelqu’un avait compté.',
    postiere: 'On a fouillé mes casiers cette nuit. Pas une lettre de prise : rien que les cachets de cire, décollés un à un, proprement. Qui fait une chose pareille ?',
    garde: 'Je ne dors jamais, d’ordinaire. Cette nuit, j’ai dormi comme une pierre. Au matin, il manquait des affaires, et il y avait de la boue sur le plancher. Pas des pas d’homme.',
    eleveuse: 'Les bêtes ont crié cette nuit, toutes ensemble, puis plus rien. Ce matin il manquait des affaires dans la maison, et la crinière de la jument était tressée. Serrée, en petites tresses.',
    pecheur: 'On a fouillé mon coffre cette nuit. Sur le sable, devant la cabane, il y avait des pas. Ils venaient du bois, et ils y retournaient. De tout petits pas.',
    guerisseuse: 'Ils sont venus. Ils ont pris mes racines et laissé les herbes. Ils ne se trompent jamais, eux. Ne vous inquiétez pas pour moi : on se connaît depuis longtemps.',
    alchimiste: 'On a ouvert mes tiroirs cette nuit. Rien de forcé. Il manque les plus petits flacons. Et sur la table, un rond de suie bien net, comme une signature.',
    chasseur: 'On a fouillé ma maison cette nuit. Les chiens n’ont pas aboyé. Ils se sont cachés sous la table, et ils n’en sont sortis qu’au jour.',
    _: [
      'On est entré chez moi cette nuit. Les verrous étaient tirés, les volets fermés. Il manque des choses. Et il y a de la suie sur le bois, à hauteur de genou.',
      'Il me manque des affaires. Rien de cassé. Juste… pris. Et cette odeur de suif, ce matin, partout.',
      'Cette nuit, j’ai entendu fouiller dans la pièce à côté. Je n’ai pas bougé. Je ne sais pas pourquoi je n’ai pas bougé. Au matin, il manquait des choses.',
    ],
  },
  // ce qu'on dit d'eux, sans les nommer (ou à peine) : ajouté aux rumeurs des habitants
  rumeurs: {
    aubergiste: 'Il me manque une cuillère chaque mois. Pas deux. Une. Comme un loyer qu’on payerait à quelqu’un.',
    guerisseuse: 'Les Petits ? Ils n’aiment pas qu’on les regarde, et ils n’aiment pas l’eau qui court. Pour voir leurs portes, ma grand-mère disait qu’il faut se mettre à leur hauteur. Je ne l’ai jamais fait. Je ne me mets à genoux devant personne.',
    chasseur: 'J’ai vu des empreintes dans la boue, au bois du sud. Des pieds d’enfant, nus, en plein hiver. Elles allaient vers les arbres morts, et elles n’en revenaient pas.',
    forgeron: 'Les anciens clouaient un fer au-dessus de la porte, les branches en haut. Pas pour la chance : contre ceux qui passent à travers. Je ne crois pas à ces choses. Mais j’en ai cloué un.',
    fillette: 'Il y a un petit vieux qui regarde par la fenêtre de l’écurie, la nuit. Il est plus petit que moi. Il a des yeux comme le chat, et il sourit avec trop de dents.',
    cure: 'Ma mère laissait une écuelle de lait sur l’appui de la fenêtre, les nuits sans lune. Pour les Petits. Elle disait qu’on ne les nourrit pas : on les paie. Je l’ai grondée pour ça. Elle n’a jamais été volée.',
    garde: 'Des maisons visitées, portes fermées, rien de forcé. Je ne crois pas aux esprits, je crois aux serrures. Et les serrures ne me disent rien.',
    planches_doyenne: 'Quand j’étais petite, on disait qu’ils sortent tous la nuit, même les vieux. Qu’ils laissent leur maison ouverte derrière eux. Qui irait voler des voleurs ?',
    grainetiere: 'On dit qu’ils marquent ce qu’ils ont visité. Trois griffes et un rond. Ma mère grattait la marque au couteau et mettait du sel dessus.',
    eleveuse: 'Ma jument a la crinière tressée, certains matins. De petites tresses serrées, qu’on ne défait qu’aux ciseaux. Les anciens disent que c’est leur façon de dire : nous sommes passés.',
    postiere: 'Les cachets de cire disparaissent. Rien que les cachets. On les décolle proprement et on laisse la lettre. Je ne sais pas ce qu’on en fait. Je préfère ne pas le savoir.',
    maire: 'On me parle de vols, la nuit, dans des maisons fermées. J’ai fait changer trois serrures. Il manque toujours des choses. Je n’en parle pas au conseil : ils riraient.',
    libraire: 'Il y a un vieux mot dans les registres de la paroisse : « gobelins ». Toujours au bas d’une page, d’une autre encre, comme si on l’avait ajouté la nuit.',
  },
  // ce qu'ils disent : des mots volés, avec les voix de ceux à qui ils les ont pris
  mots: ['Ferme la porte.', 'Qui est là ?', 'Ce n’est rien. Rendors-toi.', 'Il fait froid, ce soir.', 'Où est-ce que j’ai mis mes lunettes ?', 'Encore un peu de soupe ?', 'Je t’ai vu.', 'Chut.', 'Maman ?', 'Le pain sera prêt à six heures.', 'Reposez ça.', 'C’est à moi.', 'Bonne nuit.', 'Encore une.', 'Ne regarde pas.', 'On ne vole pas.'],
  // les pensées (rares)
  penses: {
    premier: '(Un enfant ? Non. Pas un enfant.)',
    mur: '(Il est entré dans le mur. Pas derrière : dedans.)',
    marque: '(Trois griffes et un rond.)',
    alarme: '(Ils sont entrés dans les murs. Tous. On les entend encore, derrière la pierre.)',
    chambre: '(Ça sent le suif, la cave, et quelque chose de plus vieux.)',
    racines: '(Une racine, plus lisse que les autres. Polie, comme une rampe d’escalier.)',
  },
  // E : ce qu'on fait (étiquettes sous le réticule)
  lab: {
    attraper: 'Attraper', corps: 'Le corps', chiffons: 'Les chiffons',
    racine: 'Tirer la racine polie', trappe: 'Soulever le panneau', remonter: 'Remonter par les racines',
    tas: 'Fouiller le tas', grandTas: 'Fouiller le grand tas', tasVide: 'Un tas', etal: 'Ce qu’ils ont pris dans la vallée',
    barre: 'Lever la barre', terrier: 'Regarder dans le trou', terrierOuvert: 'Se glisser dans le terrier',
    marque: 'Examiner la pierre griffée', aieule: 'La vieille', nid: 'Un nid de chiffons', lache: 'Ramasser',
    souche: 'La vieille souche', offrande: 'Déposer une offrande', couronne: 'Reposer la couronne sur le tas',
  },
  // ce qu'on voit, ce qu'on entend
  dit: {
    souche: '(Un chêne mort, ouvert par la foudre il y a longtemps. Le creux sent la cave.)',
    racineTiree: '(Quelque chose cède sous la souche, avec un bruit de bois mouillé.)',
    trappeJour: '(Le panneau ne bouge pas. Par une fente, une lueur de chandelle, tout en bas. Et une respiration, lente, régulière.)',
    trappeBarree: '(De l’autre côté, on tire une barre. Vite. Puis plus rien.)',
    entrer: 'Le panneau cède. En dessous, des racines comme des barreaux, et une odeur de suif.',
    remonter: 'Vous remontez entre les racines.',
    barre: 'La barre est lourde, polie par de petites mains. Derrière : de la terre, des racines, puis l’air de la nuit.',
    terrier: '(Un trou, trop petit pour un homme. Il en monte une odeur de suif et de cave.)',
    terrierGlisser: 'Vous vous glissez dans la terre, à plat ventre, longtemps.',
    marque: 'Trois entailles courtes, côte à côte, et un rond creusé dessous. Faites par une main petite, avec quelque chose de dur. Il y a longtemps, et puis encore, récemment, par-dessus.',
    marqueMeuble: 'Trois entailles courtes et un rond, griffés dans le bois, à hauteur de genou. La sciure est fraîche.',
    tasVide: '(Il n’en reste que de la poussière et des épingles tordues.)',
    nid: '(Des chiffons, des plumes, des cheveux. C’est encore tiède.)',
    etalVide: '(Des planches sur deux tréteaux. Vides, pour l’instant.)',
    tenuTitre: 'Le gobelin',
    tenuDesc: 'Il ne pèse presque rien. Il sent le suif et la cave. Il ne se débat pas : il vous regarde, et ses yeux ne cillent pas.',
    lacher: '(Il file entre vos jambes, et le noir le prend.)',
    rendre: '(Il ouvre la main. Puis il vous mord, jusqu’au sang, et il n’est plus là.)',
    rendreRien: '(Il n’a rien. Il vous mord, jusqu’au sang, et il n’est plus là.)',
    tuerMains: '(Il ne crie qu’une fois. Ses ongles sont des ongles d’enfant.)',
    tuerArme: '(Il tombe sans un cri. Puis, très loin, sous la terre, quelqu’un se met à pleurer.)',
    chiffons: '(Il ne reste de lui qu’un tas de chiffons cousus de travers, qui sentent le suif.)',
    echappe: '(Il glisse entre vos doigts comme un poisson.)',
    partis: '(Cette nuit, très loin sous la terre, on a chanté. Puis plus rien.)',
    cadeau: '(Sur le seuil, ce matin : {objet}. Posé bien droit, sur une feuille de chou.)',
    volFerme: [
      '(Le coffre a été ouvert cette nuit. Il manque des choses. Sur le couvercle, trois petites traces de doigts noirs.)',
      '(Quelqu’un est entré cette nuit. La porte est restée fermée. Sur le plancher, des empreintes de pieds nus, toutes petites, qui vont droit au coffre, puis droit au mur.)',
    ],
    vengeance: [
      '(Ce matin, devant la porte, une rangée de cailloux, bien alignés. Il y en a autant que de choses que vous leur avez prises.)',
      '(Le chien a gémi toute la nuit, le museau tourné vers le mur du fond.)',
      '(Sur la vitre, de l’extérieur, la marque d’une petite main. Cinq doigts trop longs.)',
    ],
    offrande: '(Vous posez {objet} au creux de la souche. Rien ne bouge. Mais au matin, il n’y sera plus.)',
    offrandePrise: '(L’offrande a disparu. À sa place, un caillou blanc, bien rond.)',
    couronne: '(Vous reposez la couronne de cuillères au sommet du tas, là où elle était assise. Très loin dans les parois, quelque chose cesse de gratter.)',
  },
  // l'Aïeule
  aieule: {
    titre: 'La vieille',
    desc: 'Elle est assise tout en haut du tas, les jambes perdues dans l’argent. Ses yeux sont blancs. Quand elle parle, c’est avec des voix qui ne sont pas la sienne.',
    salut: '« Tu es entré. » (Une voix de femme, d’ici, que vous avez déjà entendue.) « Personne n’entre. »',
    salutTue: '« Tu as tué. » (Une voix d’enfant.) « Nous nous en souviendrons. Plus longtemps que toi. »',
    salutPris: '« Tu as pris. » (Votre propre voix.) « Nous prendrons. »',
    salutPacte: '« Rien de chez toi. » (Une voix d’homme, très calme.) « Rien de chez nous. Tu te souviens. »',
    pourquoi: '« On prend ce que vous ne regardez plus. » (Une voix de vieille.) « Une cuillère. Une bille. Un nom. » (Une voix d’enfant.) « Vous ne vous en apercevez qu’après. C’est pour ça qu’on le prend. »',
    pacte: '« Rien de chez toi. » (Une voix d’homme, très calme.) « Rien de chez nous. » Elle tend une main aux doigts trop longs. Quand vous la touchez, elle est froide comme une pierre de cave.',
    pacteRefus: '« Tu as déjà pris. » Elle ne tend pas la main.',
    rendu: '« Tout revient. » Elle ne compte pas. Elle sait.',
    rien: '« … » Elle écoute quelque chose, très loin au-dessus.',
    optPourquoi: 'Que prenez-vous, et pourquoi ?', optPacte: 'Proposer un marché', optRendre: 'Lui rendre ce que vous avez pris', optPartir: 'Partir',
    morte: '(Elle ne bouge plus. Les chandelles, une à une, s’éteignent toutes seules.)',
  },
  // ce qu'on lit dans la Gobelinière
  objets: {
    berceau: ['Un berceau', 'Un berceau de bois peint, très ancien, la peinture écaillée. Dedans, un bonnet de baptême plié avec soin, et une poupée de paille qui a le visage tourné vers le mur.'],
    cles: ['Les clés', 'Un anneau de fer, gros comme une roue, où pendent des centaines de clés. Certaines portent encore une étiquette : « grenier », « cave », « chambre du petit ». Elles n’ouvrent plus rien. Eux les gardent quand même.'],
    horloges: ['Les horloges', 'Une dizaine d’horloges et de montres, accrochées ou posées. Aucune n’a d’aiguilles. Elles battent toutes, pourtant, chacune à son pas.'],
    cloche: ['La cloche', 'Une petite cloche de bronze, fêlée, posée à l’envers et pleine d’alliances. Sur le bord, une date à moitié limée : « 17… ».'],
    souliers: ['Les souliers', 'Des souliers. Des dizaines. Jamais deux pareils.'],
    miroir: ['Le miroir', 'Un grand miroir au tain piqué, tourné contre la paroi. On l’a retourné exprès.'],
    lettres: ['Les lettres', 'Une liasse de lettres jamais ouvertes, tenues par un ruban. Les cachets ont été décollés, tous. Ils sont rangés à part, dans une boîte, par couleurs.'],
  },
  // l'étal des prises (12-zzzzzX)
  etal: {
    titre: 'Ce qu’ils ont pris dans la vallée',
    intro: 'Sur des planches posées sur deux tréteaux, ce qu’ils ont rapporté ces dernières nuits, rangé par maisons. Une rangée par porte.',
    vide: 'Rien encore. Les planches attendent.',
    prendre: 'Reprendre', tout: 'Tout reprendre', ferme: 'chez vous', inconnu: 'une maison',
    pris: '(Vous reprenez ce qui avait été pris.)',
  },
  // ce que disent ceux à qui l'on rend ce qui leur avait été pris
  rendre: {
    opt: 'Ce qu’on vous a pris…',
    merci: ['{objets} ! Où l’avez-vous… Non. Ne me dites pas. Je ne veux pas savoir. Merci.', 'C’est à moi, ça. {objets}. Je croyais ne jamais les revoir. Merci… Vous les avez trouvés où ?', '{objets}… Vous êtes allé les chercher là où je pense ? Taisez-vous. Merci. Taisez-vous.'],
  },
  // le carnet de la sacoche
  carnet: {
    titre: 'Les Petits',
    vus: (n) => n > 1 ? `Vous en avez aperçu ${n}, toujours de loin, toujours le temps d’un regard.` : 'Vous en avez aperçu un, le temps d’un regard.',
    vols: (n) => n > 1 ? `${n} maisons visitées la nuit, depuis votre arrivée, dont on vous a parlé.` : 'Une maison visitée la nuit, dont on vous a parlé.',
    marque: 'Trois griffes et un rond : leur marque.',
    souche: 'La vieille souche, au fond des bois : ils passent dessous.',
    porte: 'Le panneau ne cède que la nuit, quand ils sont dehors.',
    village: 'Leur village, sous la terre : la Gobelinière.',
    raccourci: 'Un terrier près de la ferme mène chez eux.',
    pacte: 'Un marché avec la vieille : rien de chez vous, rien de chez eux.',
    rancune: 'Ils vous en veulent.',
    partis: 'Ils sont partis.',
  },
};
