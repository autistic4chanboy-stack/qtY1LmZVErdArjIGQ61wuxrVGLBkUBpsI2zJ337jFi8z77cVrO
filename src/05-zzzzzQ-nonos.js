// ============================================================================
//  LE NONOS DU CHIEN (agent Q, treizième vague) : les données et les textes.
//  Une quête principale, facultative : le chien de la ferme a perdu son vieil
//  os ; cinq lieux tirés au hasard au début de la quête, chacun montré par un
//  souvenir (une cinématique) ; un indice à chercher sur place ; au bout, le
//  terrier d'un vieux renard, et le nonos. Le jeu : 11-zzzzQ-1-nonos.js,
//  11-zzzzQ-2-scenes.js ; le carnet : 12-zzzzzQ-nonos.js.
// ============================================================================
defItem('nonos', 'Le nonos du chien', 'quete', 0, ['os', '#d8c8a4'], { desc: 'Un vieil os de bœuf, poli par les dents, noirci à un bout. Il sent le chien.' });

// ---------------------------------------------------------------- les lieux possibles
// clé : type c2 (11-zzzz7-carte.js) ou nom de lieu-dit (w.lm) ; look : hauteur de ce qu'on regarde (m) ;
// ph : [allure, détail] (l'allure reste au carnet : une phrase vague ; le détail ne passe qu'en cinématique)
const NONOS_TYPES = {
  // les croix
  calvaire: { look: 2.2, ph: [['Une croix de bois au croisement de deux chemins.', 'L’herbe est couchée tout autour, comme si quelqu’un s’y était agenouillé longtemps.'],
    ['Une croix plantée au bord d’un chemin, plus haute que les haies.', 'Le bois est fendu par les gels. Personne ne passe.']] },
  croix_peste: { look: 1.8, ph: [['Une croix de pierre au milieu des herbes, seule.', 'On l’a dressée pour des morts qu’on n’a pas voulu garder au village.']] },
  calvaire_trois: { look: 2.4, ph: [['Trois croix sur une butte, la plus haute au milieu.', 'Le vent siffle entre elles.']] },
  oratoire: { look: 1.6, ph: [['Une petite niche de pierre au bord d’un chemin, une statue dedans.', 'Des fleurs séchées, une bougie consumée jusqu’au bout.']] },
  // les chapelles, les morts
  chapelle_ruine: { look: 3.2, ph: [['Une petite chapelle aux murs gris, la porte ouverte sur le noir.', 'Le toit s’est effondré à moitié ; le jour entre par le haut.'],
    ['Un pignon de pierre, et pas de cloche dans le clocheton.', 'Les orties montent jusqu’aux fenêtres.']] },
  chapelle: { look: 3.5, ph: [['Une chapelle abandonnée à l’orée des bois.', 'La porte ne ferme plus. Le vent entre et sort.']] },
  tombe_isolee: { look: 0.9, ph: [['Une tombe seule, loin de tout cimetière.', 'Le nom est effacé. Quelqu’un vient pourtant arracher l’herbe.']] },
  cimetiere: { look: 1.4, ph: [['Des tombes penchées derrière un petit mur.', 'Les croix de fer ont rouillé. Un corbeau se tient sur l’une d’elles.']] },
  lanterne_morts: { look: 3.5, ph: [['Une haute colonne de pierre, creuse en haut, comme une lanterne éteinte.', 'On y allumait un feu pour les morts. La suie est encore là.']] },
  gibet: { look: 2.6, ph: [['Des poteaux sur une butte, et une poutre en travers.', 'Rien n’y pend plus. Les corbeaux y reviennent quand même.']] },
  // les pierres
  menhir: { look: 2.0, ph: [['Une pierre debout, plus haute qu’un homme, seule dans l’herbe.', 'Le lichen la ronge. Elle penche un peu, depuis toujours.']] },
  cromlech: { look: 1.4, ph: [['Des pierres dressées en rond, comme des gens qui se tiennent la main.', 'Au milieu, l’herbe ne pousse pas.']] },
  pierre_cupules: { look: 0.8, ph: [['Une grande pierre plate, creusée de petites coupes.', 'L’eau de pluie y reste, et les oiseaux viennent y boire.']] },
  dolmen_petit: { look: 1.2, ph: [['Une grosse dalle posée sur des pierres, comme une table pour des géants.', 'Dessous, il fait noir, et ça sent la terre.']] },
  pierre_branlante: { look: 1.6, ph: [['Un gros rocher posé en équilibre sur un autre.', 'On dirait qu’un souffle suffirait à le faire tomber.']] },
  borne_ancienne: { look: 0.8, ph: [['Une vieille borne au bord d’un champ, gravée de lettres usées.', 'Les lettres sont si usées qu’on les lirait du bout des doigts.']] },
  menhirs: { look: 2.2, ph: [['Des pierres levées, debout dans la lande comme des femmes en deuil.', 'Le vent ne fait aucun bruit entre elles.']] },
  dolmen: { look: 1.6, ph: [['Une immense dalle posée sur des pierres, au haut d’une pente.', 'Dessous, il fait noir.']] },
  cercle: { look: 1.6, ph: [['Un cercle de pierres sur une hauteur.', 'Elles sont tièdes, même à l’ombre.']] },
  // le feu, la suie
  loge_charbonnier: { look: 1.8, ph: [['Une hutte de perches et de mottes, dans une clairière noire de suie.', 'L’odeur du feu froid colle à tout.']] },
  charbonniere: { look: 1.6, ph: [['Une clairière noire, une meule de terre qui fume encore.', 'Les troncs, autour, sont gris de cendre.']] },
  four_chaux: { look: 2.2, ph: [['Un four de pierre, trapu, la gueule noircie.', 'La terre est blanche tout autour.']] },
  // les bois
  cabane_bucheron: { look: 2.0, ph: [['Une cabane de rondins à la lisière du bois.', 'Ça sent la sciure et la résine.']] },
  cabane_perchee: { look: 3.5, ph: [['Une cabane dans un arbre, une échelle qui pend.', 'Les planches craquent au vent.']] },
  affut: { look: 3.0, ph: [['Une petite plate-forme de planches, perchée dans les branches.', 'Quelqu’un a guetté là, longtemps. Ça sent le tabac froid.']] },
  glaciere: { look: 1.4, ph: [['Une butte de terre ronde, avec une porte basse.', 'Il en sort un souffle froid, même en plein jour.']] },
  maison_forestiere: { look: 2.6, ph: [['Une maison basse au milieu des arbres, les volets fermés.', 'Une cheminée, et pas de fumée.']] },
  fosse_loups: { look: 0.6, ph: [['Un trou rond dans le sol, bordé de pierres, entre les arbres.', 'Il y a eu des loups, ici. Il y en a peut-être encore.']] },
  // les ruines, les maisons vides
  ferme_brulee: { look: 2.4, ph: [['Des murs noircis, sans toit, au milieu des ronces.', 'La cheminée tient encore debout, seule.']] },
  bergerie_ruine: { look: 1.6, ph: [['Une longue bergerie de pierre sèche, sans toit.', 'Il y traîne encore une odeur de laine et de suint.']] },
  borie: { look: 1.8, ph: [['Une cabane ronde en pierres sèches, coiffée en pointe.', 'La porte est si basse qu’il faut se courber.']] },
  moulin_ruine: { look: 4.5, ph: [['Une tour ronde sur une butte, des ailes brisées.', 'Il n’y a plus de toit ; les corneilles entrent par le haut.']] },
  tour_ruine: { look: 5.0, ph: [['Une tour éventrée, debout sur une hauteur.', 'Les pierres tombées font un tas à son pied.']] },
  hameau_abandonne: { look: 2.4, ph: [['Des maisons vides, des portes qui battent.', 'Un puits au milieu, et personne pour y tirer l’eau.']] },
  ruines: { look: 2.2, ph: [['De vieux murs écroulés, dans l’herbe haute.', 'Une arche tient encore, on ne sait comment.']] },
  bergerie: { look: 2.2, ph: [['Une bergerie de pierre au flanc d’une combe.', 'Des clochettes, quelque part. Puis plus rien.']] },
  // les camps, les charrettes
  camp_abandonne: { look: 0.9, ph: [['Un foyer éteint, des pierres en rond, une toile déchirée.', 'Ceux qui dormaient là sont partis vite.']] },
  campement: { look: 1.0, ph: [['Un foyer éteint sous une toile déchirée.', 'Ceux qui dormaient là sont partis vite. Ils ont laissé une gamelle.']] },
  charrette_abandonnee: { look: 1.0, ph: [['Une charrette renversée, une roue en l’air.', 'Les ronces l’ont prise par les ridelles.']] },
  galerie_prospecteur: { look: 1.6, ph: [['Une bouche noire au flanc d’une colline, étayée de bois.', 'Un courant d’air froid en sort, qui sent la pierre mouillée.']] },
  // l'eau
  source_sacree: { look: 0.8, ph: [['Une fontaine dans la pierre, des pièces au fond de l’eau.', 'L’eau est si claire qu’on ne la voit pas.']] },
  source: { look: 0.9, ph: [['Une source entre des pierres, des rubans noués au-dessus.', 'Les rubans sont décolorés ; certains sont tout neufs.']] },
  puits_perdu: { look: 0.9, ph: [['Une margelle de pierre au milieu de nulle part.', 'On n’entend pas l’eau, au fond.']] },
  lavoir: { look: 1.6, ph: [['Un toit sur des piliers, et de l’eau dessous.', 'Les pierres à laver sont usées en creux.']] },
  pont: { look: 1.2, ph: [['Un pont de pierre au-dessus de l’eau lente.', 'Sous l’arche, l’ombre est verte et froide.']] },
  ponton: { look: 0.6, ph: [['Un ponton de planches sur l’eau calme.', 'Une barque cogne doucement contre les pieux.']] },
  ponton_ruine: { look: 0.6, ph: [['Des planches pourries qui avancent sur l’eau.', 'L’eau clapote entre les pieux.']] },
  barque_echouee: { look: 0.7, ph: [['Une barque retournée sur la berge, le ventre au ciel.', 'Les roseaux bruissent tout autour.']] },
  cabane_pecheur: { look: 2.0, ph: [['Une cabane de planches au bord de l’eau, des filets qui sèchent.', 'Ça sent la vase et le poisson.']] },
  phare: { look: 7.0, ph: [['Une tour blanche au bord du grand lac.', 'La lanterne est éteinte, en plein jour.']] },
  // les arbres, les jardins
  arbre_offrandes: { look: 4.0, ph: [['Un vieil arbre seul, des choses accrochées à l’écorce.', 'Des clous, des chiffons, des rubans. Des vœux, peut-être.']] },
  chene: { look: 9.0, ph: [['Un chêne si vieux qu’on le croirait mort.', 'Ses racines sortent de terre comme des doigts.']] },
  rucher: { look: 0.9, ph: [['Des ruches de paille alignées contre un mur bas.', 'Pas une abeille. Le silence bourdonne quand même.']] },
  jardin_clos: { look: 1.2, ph: [['Un jardin clos de murs, retourné à la friche.', 'Au milieu, une pierre ronde qui ne marque plus aucune heure.']] },
  pigeonnier: { look: 3.0, ph: [['Une petite tour percée de trous, au milieu d’un pré.', 'Des plumes partout dans l’herbe, et pas un roucoulement.']] },
  // les moulins
  moulin: { look: 6.0, ph: [['De grandes ailes immobiles, au-dessus des prés.', 'La toile est déchirée ; elle bat un peu, au vent.']] },
  tour: { look: 5.0, ph: [['Une tour de bois sur une hauteur, une échelle qui monte.', 'D’en haut, on doit voir loin.']] },
};
// les lieux-dits nommés (w.lm) qui peuvent servir : clé (ou préfixe suivi de chiffres) → type ci-dessus
const NONOS_LM = {
  moulin: 'moulin', chene: 'chene', source: 'source', cimetiere: 'cimetiere', hameau_abandonne: 'hameau_abandonne', charbonniere: 'charbonniere',
  cabane_pecheur: 'cabane_pecheur', ponton: 'ponton', lavoir: 'lavoir', ruines: 'ruines', menhirs: 'menhirs', dolmen: 'dolmen', cercle: 'cercle',
  bergerie: 'bergerie', tour: 'tour', phare: 'phare', chapelle: 'chapelle',
};
const NONOS_LM_PREFIXES = [[/^calvaire\d+$/, 'calvaire'], [/^campement\d+$/, 'campement'], [/^pont_riviere\d*$/, 'pont']];

// ---------------------------------------------------------------- les indices (le même ordre à chaque partie)
const NONOS_INDICES = [
  { id: 'poils', court: 'des poils roux', texte: (nom) => `(Une touffe de poils roux, accrochée à une ronce. Ce ne sont pas ceux de ${nom}.)` },
  { id: 'os_poulet', court: 'un os de poulet rongé', texte: () => '(Un os de poulet, rongé net. Quelque chose s’est arrêté ici pour manger.)' },
  { id: 'empreintes', court: 'des empreintes étroites', texte: () => '(Des empreintes dans la terre molle, plus étroites que celles d’un chien, posées l’une devant l’autre.)' },
  { id: 'ruban', court: 'un ruban mâchonné', texte: () => '(Un ruban rouge, mâchonné. Il n’a pas été perdu ici : on l’a porté jusque-là.)' },
  { id: 'terrier', court: 'un terrier', texte: () => '' },
];

// ---------------------------------------------------------------- les scènes
const NONOS_TXT = {
  debut: [
    (nom) => `Depuis le matin, ${nom} tourne en rond. Il gratte la terre, renifle, gémit, et recommence.`,
    () => 'Le vieil os qu’il traînait partout, celui qu’il gardait entre ses pattes pour dormir, n’est plus là.',
    () => 'Il vous regarde. Puis il lève le nez, et flaire le vent.',
  ],
  // le noir avant chaque souvenir (1 à 5)
  avant: [
    'Une odeur de bête passe dans le vent. Une image vient avec elle.',
    'L’odeur, encore. Une autre image vient avec elle.',
    'La piste continue. Vous la voyez avant de la suivre.',
    'L’odeur est plus fraîche.',
    'Une dernière image. Ça sent le terrier.',
  ],
  terrier: [
    'Un terrier, creusé sous une motte. Devant l’entrée, des choses qu’un renard n’a rien à faire de garder : une cuillère, un grelot, un petit gant de laine.',
    (nom) => `Et le nonos de ${nom}, rongé au bout par d’autres dents que les siennes.`,
    'Un vieux renard au museau gris vous regarde le prendre. Il ne s’enfuit pas. Il s’en va sans se presser, comme on quitte une table.',
  ],
  retour: [
    (nom) => `${nom} le reconnaît avant même que vous l’ayez sorti de la sacoche.`,
    () => 'Il le prend tout doucement, comme on prend un œuf, et l’emporte sans se retourner.',
    () => 'Il se couche, l’os entre les pattes, et le mâchonne longtemps, les yeux mi-clos.',
  ],
};
// le carnet
const NONOS_CARNET = {
  section: 'Quête principale — facultative',
  titre: (nom) => `Le nonos de ${nom}`,
  intro: (nom, j) => `Depuis le jour ${j}, ${nom} cherche le vieil os qu’il traînait partout. Quelque chose l’a emporté.`,
  chercher: (nom) => `Il faut trouver cet endroit, et chercher sur place. ${nom} a bon nez, s’il vous suit.`,
  trouve: 'Trouvé là-bas',
  retrouve: (nom) => `Le nonos est dans votre sacoche. ${nom} l’attend.`,
  rendu: (nom) => `${nom} a retrouvé son nonos. Il le garde près de sa niche, et réclame deux fois moins souvent à manger.`,
  mort: (nom) => `${nom} n’est plus là pour le chercher. Les images, elles, sont restées.`,
  revoir: 'Revoir',
};
