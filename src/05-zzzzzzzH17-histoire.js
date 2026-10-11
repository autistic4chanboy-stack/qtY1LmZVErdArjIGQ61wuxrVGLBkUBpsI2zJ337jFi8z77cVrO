// ============================================================================
//  L'HISTOIRE (agent H17, dix-septième vague) — 1. LES DONNÉES ET LES TEXTES
//  Une quête principale, de l'arrivée à la ferme jusqu'à une fin : huit
//  chapitres qui tiennent ensemble ce que la vallée avait déjà (la lettre et la
//  tombe d'Anselme, le temple des Trois, les langues perdues, les tablettes de
//  runes, la Grande Porte, les Terres d'Avant, le Guet et le Ver) ; chaque
//  étape se fait avec ce qui existe (lieux, notes, systèmes), rien n'est
//  généré. Deux fins, celles du Ver (V3) : le délivrer (« L'aube »), le tuer
//  (« La cendre ») ; ce qu'on a fait à Basse-Fosse (V5) colore l'épilogue.
//  Le jeu : 11-zzzzzzzH17-2-histoire.js ; le moteur des cinématiques :
//  11-zzzzzzzH17-1-moteur.js ; le carnet et les souvenirs : 12-zzzzzzzH17-carnet.js.
// ============================================================================

// ---------------------------------------------------------------- le titre du jeu (le générique, la carte d'ouverture)
const H17_TITRE_JEU = 'Newy and the Dark Forest';
const H17_HISTOIRE = 'Le Guet';

// ---------------------------------------------------------------- les chapitres
// des : le jour à partir duquel le chapitre s'ouvre (le précédent achevé) ; etapes : { id, texte (le carnet, l'indice à
// l'écran), lieu (clé de w.lm : un lieu qui existe dans toutes les vallées, ou rien) } ; cine : la cinématique qui l'ouvre ;
// resume : ce qu'il en reste au carnet, une fois passé.
const H17_CHAPITRES = [
  { id: 'c1', num: 'I', titre: 'L’héritage', des: 1, cine: 'ouverture',
    resume: 'Le notaire vous a remis les clés de la ferme d’Anselme Varenne. Anselme avait laissé une lettre : fermer la porte à clé chaque soir, et ne pas ouvrir à sa voix.',
    etapes: [
      { id: 'lettre', texte: 'Lire ce qu’Anselme a laissé dans la maison.', lieu: 'ferme' },
      { id: 'nuit', texte: 'Passer une première nuit à la ferme.', lieu: 'ferme' },
    ] },
  { id: 'c2', num: 'II', titre: 'Les traces d’Anselme', des: 2, cine: 'c2',
    resume: 'Au fond du cimetière, une pierre sans date porte son nom : « Il a ouvert la porte. » Sa dernière page parlait du vieux puits, et de ce qui frappe aux portes pour sortir.',
    etapes: [
      { id: 'tombe', texte: 'Trouver où l’on a gravé son nom.', lieu: 'cimetiere' },
      { id: 'page', texte: 'Trouver sa dernière page, au vieux puits.', lieu: 'vieux_puits' },
    ] },
  { id: 'c3', num: 'III', titre: 'Les Trois', des: 4, cine: 'c3',
    resume: 'Derrière la cascade, sous la montagne, la porte des Trois s’est ouverte : Aëla l’Aube, Durn la Pierre, Vesh la Nuit noire. Sur le tombeau des Aëlim, une seule prière : n’ouvre pas la porte.',
    etapes: [
      { id: 'temple', texte: 'Trouver le temple, sous la montagne, derrière l’eau qui tombe.', lieu: 'cascade' },
      { id: 'trois', texte: 'Ouvrir la porte des Trois.', lieu: 'temple' },
    ] },
  { id: 'c4', num: 'IV', titre: 'Les mots d’avant', des: 6, cine: 'c4',
    resume: 'Les pierres de la vallée parlent deux langues que plus personne ne parle. Vous en savez quelques mots : assez pour voir qu’elles parlent toutes d’une porte.',
    etapes: [
      { id: 'pierres', texte: 'Relever trois pierres gravées.' },
      { id: 'mots', texte: 'Apprendre six mots des langues perdues.', lieu: 'bibliotheque' },
    ] },
  { id: 'c5', num: 'V', titre: 'Les pierres qui parlent', des: 8, cine: 'c5',
    resume: 'Les quatre tablettes réunies, la pierre s’est éveillée. Trois signes dans un cercle, et la vallée obéit un peu.',
    etapes: [
      { id: 'tablettes', texte: 'Réunir les quatre tablettes gravées.' },
      { id: 'cercle', texte: 'Assembler trois runes.' },
    ] },
  { id: 'c6', num: 'VI', titre: 'La Grande Porte', des: 10, cine: 'c6',
    resume: 'Au bout de la route de Clairpré, la Grande Porte. Vous l’avez passée, comme Anselme avant vous.',
    etapes: [
      { id: 'aller', texte: 'Aller jusqu’à la Grande Porte, au bout de la route de Clairpré.', lieu: 'grande_porte' },
      { id: 'passer', texte: 'La passer.', lieu: 'grande_porte' },
    ] },
  { id: 'c7', num: 'VII', titre: 'Les Terres d’Avant', des: 10, cine: 'c7',
    resume: 'Derrière la Porte, un pays de cendre, et au-dessus, le Ver. Le carnet du Guet dit pourquoi il veille : « Qu’il garde. Que rien ne sorte. »',
    etapes: [
      { id: 'feu', texte: 'Allumer un feu de veille.' },
      { id: 'carnet', texte: 'Trouver ce qu’a laissé le Guet, sur la crête du nord.' },
    ] },
  { id: 'c8', num: 'VIII', titre: 'Le Guet', des: 10, cine: 'c8',
    resume: 'En haut du Pic, le dernier guetteur tenait encore la clé du collier.',
    etapes: [
      { id: 'cle', texte: 'Prendre la clé du dernier guetteur, en haut du Pic.' },
      { id: 'choix', texte: 'Décider de ce qu’il garde.' },
    ] },
];

// ---------------------------------------------------------------- les fins (celles du Ver : farm.s.v3.fin)
const H17_FINS = {
  aube: { v3: 'delivre', titre: 'L’aube', cine: 'fin_aube',
    resume: 'Vous avez ouvert le collier. Le Ver s’est levé, vous a regardé, et s’en est allé vers le nord. Il n’y a plus de Guet.' },
  cendre: { v3: 'tue', titre: 'La cendre', cine: 'fin_cendre',
    resume: 'Le Ver est tombé, là-bas, et ne s’est pas relevé. Personne ne garde plus la Porte.' },
};
// ce qu'on a fait à Basse-Fosse (farm.s.v5.fin) : une phrase de plus dans l'épilogue
const H17_V5 = {
  compte: 'En bas, sous la Ville Basse, quelqu’un tient toujours le compte.',
  remontee: 'Ceux d’en bas ont revu le jour. Leur ville est restée vide, ses feux allumés.',
  extinction: 'En bas, sous la Ville Basse, les feux se sont éteints, rue après rue.',
};

// ---------------------------------------------------------------- les cinématiques (titres du carnet « Souvenirs », paroles)
// paroles : [qui, texte, sens] (qui vide : une phrase sans personne ; sens : la phrase est en aëlin, on n'en lit que les
// mots connus — langues.traduire —, le sens entier quand on les connaît tous).
const H17_CINES = {
  ouverture: { titre: 'L’arrivée', chapitre: 'c1',
    paroles: [
      ['', 'La vallée. Les Monts au nord, le grand lac à l’ouest, et la vieille forêt, noire jusqu’en plein midi.'],
      ['', 'Au bout d’un chemin de terre, la vieille ferme des Varenne. Personne n’y a vécu depuis l’hiver dernier.'],
      ['Maître Delorme, notaire', 'Elle est à vous. Avec ses dettes, ses murs, et ce qui vient avec.'],
    ] },
  c2: { titre: 'Les traces d’Anselme', chapitre: 'c2',
    paroles: [
      ['Anselme', 'Si l’on frappe trois fois, n’ouvre pas, même si c’est ma voix.'],
      ['Anselme', 'Surtout si c’est ma voix.'],
    ] },
  c3: { titre: 'Les Trois', chapitre: 'c3',
    paroles: [
      ['Une voix, dans l’eau', 'aela teh , thalen neth mora', 'Aëla est là-bas : le temple, sous la montagne.'],
    ] },
  c4: { titre: 'Les mots d’avant', chapitre: 'c4',
    paroles: [
      ['Gravé dans la pierre', 'o ta , hem na-aelim teh sae , dal nai tora', 'Ô toi : un homme des Aëlim dort ici. N’ouvre pas la porte.'],
    ] },
  c5: { titre: 'Les pierres qui parlent', chapitre: 'c5',
    paroles: [
      ['', 'Quatre pierres, et sur chacune un morceau de la même phrase.'],
    ] },
  c6: { titre: 'La Grande Porte', chapitre: 'c6',
    paroles: [
      ['Le portier qui ne dormait jamais', 'On ne passe pas une porte pour voir.'],
      ['Anselme', 'Si je ne remonte pas, ne viens pas me chercher. Ou viens vite.'],
    ] },
  c7: { titre: 'Les Terres d’Avant', chapitre: 'c7',
    paroles: [
      ['Anselme', 'Ce qui frappe aux portes ne cherche pas à entrer. Il cherche à sortir.'],
    ] },
  c8: { titre: 'Le Guet', chapitre: 'c8',
    paroles: [
      ['Le carnet du Guet', 'Le collier lui mange le cou. Je l’entends gémir, la nuit, quand il croit que personne n’écoute.'],
      ['Le carnet du Guet', 'Je monte la lui ôter pendant qu’il dort. S’il me brûle, tant pis : il aura eu raison.'],
    ] },
  finale: { titre: 'Ce qu’il gardait', chapitre: 'c8',
    paroles: [
      ['', 'Le ciel est vide au-dessus du Pic.'],
    ],
    parolesCendre: [
      ['', 'Il ne s’est pas relevé. Le vent emporte sa cendre vers la Porte.'],
    ] },
  fin_aube: { titre: 'Fin — L’aube', fin: 'aube',
    paroles: [
      ['', 'Au matin, il y avait une écaille noire sur le seuil de la ferme. Elle était encore tiède.'],
      ['Anselme', 'Ne ferme plus ta porte à clé. Laisse-les sortir.'],
      ['', 'Cette nuit-là, et toutes celles d’après, personne ne frappa à la porte.'],
    ] },
  fin_cendre: { titre: 'Fin — La cendre', fin: 'cendre',
    paroles: [
      ['', 'Le soir, il tomba un peu de cendre sur la vallée. Pas beaucoup.'],
      ['', 'Personne ne garde plus la Porte.'],
      ['', 'On frappa trois fois.'],
    ] },
  generique: { titre: 'Le générique' },
};
// l'ordre du carnet « Souvenirs »
const H17_ORDRE_CINES = ['ouverture', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'finale', 'fin_aube', 'fin_cendre', 'generique'];
// les musiques de chaque scène (des morceaux de 09-zzzzM-*)
const H17_MUSIQUES = { ouverture: 'foret_chene', c2: 'nuit_veilleuse', c3: 'eau_reflets', c4: 'lande_bruyeres', c5: 'dessous_cristaux', c6: 'lande_crete', c7: 'dessous_eaux', c8: 'nuit_claire', fin_aube: 'pres_matin', fin_cendre: 'dessous_eaux', generique: 'pd_gymnopedie1' };

// ---------------------------------------------------------------- le générique (des rôles, pas de noms)
const H17_GENERIQUE = [
  ['titre', H17_TITRE_JEU],
  ['', 'Une histoire de la vallée'],
  ['role', 'Écriture, conception et programmation'],
  ['', 'ceux qui ont bâti la vallée'],
  ['role', 'Musique'],
  ['', 'des airs écrits pour la vallée,'],
  ['', 'et des pièces du domaine public : Erik Satie, Frédéric Chopin, Jean-Sébastien Bach'],
  ['role', 'Sons et voix'],
  ['', 'faits dans le jeu, note à note'],
  ['role', 'La Fondation SCP'],
  ['', 'création collective, sous licence CC BY-SA 3.0'],
  ['role', 'Et vous'],
  ['', 'qui avez repris la ferme'],
  ['fin', 'Merci d’avoir joué.'],
];

// ---------------------------------------------------------------- les petits mots du jeu
const H17_TEXTES = {
  page: 'Histoire',
  souvenirs: 'Souvenirs',
  chapitre: 'Chapitre',
  enCours: 'En cours',
  passes: 'Les chapitres passés',
  attente: '(La suite viendra, dans quelques jours.)',
  revoir: 'Revoir',
  fin: 'Fin',
  finie: 'L’histoire est finie. La ferme, elle, continue.',
  aucun: 'Aucun souvenir pour l’instant.',
  passer: 'Maintenir Espace ou Échap : passer',
  optionsSouvenirs: 'Revoir les cinématiques (Souvenirs)',
  sansRegard: '(Ce chapitre est resté en arrière.)',
};
