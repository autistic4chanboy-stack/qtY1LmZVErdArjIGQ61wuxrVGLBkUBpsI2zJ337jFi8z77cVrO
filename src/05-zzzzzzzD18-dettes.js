// ============================================================================
//  LES DETTES DE LA FERME (agent D18, dix-huitième vague) — 1. LES DONNÉES
//  « Elle est à vous. Avec ses dettes, ses murs, et ce qui vient avec. » (le
//  notaire, à l'arrivée : 05-zzzzzzzH17-histoire.js). La succession Varenne est
//  grevée : huit termes, de plus en plus lourds, à verser à l'étude de Maître
//  Delorme, notaire — dans la boîte de l'étude, sur la porte close de la
//  maison Delorme, ou par mandat à la poste. Chaque terme acquitté libère une
//  part du legs, et l'étude fait exécuter les travaux qu'Anselme avait
//  commandés de son vivant : la ferme s'agrandit, se pare, devient un domaine.
//  Le retard coûte (pénalités bornées, saisies, scellés sur les privilèges),
//  il ne tue pas : on peut toujours payer, et la saisie paie une part du terme.
//  Le jeu : 11-zzzzzzzzD18-1-dettes.js ; les travaux : 11-zzzzzzzzD18-2-travaux.js ;
//  le carnet : 12-zzzzzzzzD18-carnet.js ; l'équilibrage : tools/equilibrage/D18.js.
// ============================================================================

// ---------------------------------------------------------------- les termes
// montant : le terme (intérêts compris) ; delai : jours pour le régler, à compter du jour où il s'ouvre (le terme
// précédent acquitté) ; titre : les travaux qu'il paie ; avantage : ce qu'ils apportent (une phrase, le carnet).
// (équilibrage : tools/equilibrage/D18.js — chaque terme vaut une à quatre journées de revenu du moment)
const D18_TERMES = [
  { montant: 500, delai: 18, titre: 'Le toit d’ardoise', bas: 'Un toit qui ne fuit plus.',
    avantage: 'On dort mieux sous un toit sec : la nuit à la ferme soigne davantage.' },
  { montant: 1000, delai: 12, titre: 'La cour pavée', bas: 'Des pavés, des réverbères, une pompe.',
    avantage: 'Une pompe près du champ : l’arrosoir s’y remplit.' },
  { montant: 1800, delai: 15, titre: 'La maison de pierre', bas: 'Des murs de pierre, des vitres, un perron.',
    avantage: 'Une armoire de plus dans la maison.' },
  { montant: 3000, delai: 15, titre: 'Le verger', bas: 'Six pommiers, deux ruches.',
    avantage: 'Des pommes et du miel, sans rien semer.' },
  { montant: 4500, delai: 18, titre: 'L’aile neuve', bas: 'Une chambre, à l’est.',
    avantage: 'Une chambre et un coffre : les nuits soignent encore mieux.' },
  { montant: 6500, delai: 18, titre: 'La serre', bas: 'Une serre de verre, des arroseurs.',
    avantage: 'Deux arroseurs de fer gardent le champ humide.' },
  { montant: 9000, delai: 24, titre: 'Les dépendances', bas: 'Une écurie, une fontaine, des toits d’ardoise.',
    avantage: 'Les bêtes se plaisent à la ferme ; la fontaine donne de l’eau.' },
  { montant: 12500, delai: 30, titre: 'Le domaine', bas: 'Un étage, une aile, des murets.',
    avantage: 'Un domaine a bonne réputation : la coopérative paie un peu mieux.' },
];
// le retard : la mise en demeure ajoute « demeure » au terme (une part de son montant), chaque semaine de plus « semaine »,
// jamais plus de « plafond » en tout ; la saisie vient « saisie » jours après l'échéance, puis toutes les « reprise »
// journées, trois fois au plus par terme ; elle emporte des marchandises pour « part » du terme au plus, vendues à
// la criée « criee » de leur prix (ce qu'elle rapporte est déduit du terme). Une ancienne partie a « grace » jours.
const D18_RETARD = { rappel: 5, demeure: 0.08, semaine: 0.05, plafond: 0.25, saisie: 6, reprise: 12, saisies: 3, part: 0.2, criee: 0.75, grace: 24, mandat: 3 };
// ce que la saisie peut emporter (jamais un outil, une clé, un livre, un trésor ni un objet de quête)
const D18_SAISISSABLE = ['culture', 'produit', 'cueillette', 'chasse', 'materiau', 'nourriture', 'poisson'];
// les avantages, et le terme qui les apporte (dettes18.avantage(k))
const D18_AVANTAGES = { lit: 1, pompe: 2, armoire: 3, verger: 4, chambre: 5, arroseurs: 6, ecurie: 7, reputation: 8 };
const D18_BONUS = { lit: 10, chambre: 10, ecurie: 0.03, reputation: 0.05 };

// ---------------------------------------------------------------- les lettres
const D18_SIGNE = 'Maître Delorme, notaire';
const D18_HUISSIER = 'Maître Fouquet, huissier';
const D18_LETTRES = {
  // {n} : le numéro du terme, en lettres ; {m} : le montant ; {j} : le jour de l'échéance ; {t} : les travaux
  echeancier: (v) => `Madame, Monsieur,\n\nLa succession de feu Anselme Varenne est grevée d’une dette ancienne, que je suis chargé de recouvrer. Elle se règle en huit termes. Le premier, de ${v.m} pièces, est dû le ${v.j}.\n\nVous le verserez à l’étude : la boîte est ${v.ou}. La poste prend aussi les mandats.\n\nFeu M. Varenne a laissé une instruction : chaque terme acquitté, l’étude fera exécuter les travaux qu’il avait commandés pour sa ferme. Le premier paie ${v.t}.\n\nVeuillez agréer, etc.\n\n${D18_SIGNE}`,
  grace: (v) => `Madame, Monsieur,\n\nEn classant les papiers de la succession Varenne, mon clerc a retrouvé une dette ancienne, que je suis chargé de recouvrer. Elle se règle en huit termes. Compte tenu du retard, qui est le nôtre, le premier, de ${v.m} pièces, ne sera dû que le ${v.j}.\n\nVous le verserez à l’étude : la boîte est ${v.ou}. La poste prend aussi les mandats.\n\nChaque terme acquitté, l’étude fera exécuter les travaux que feu M. Varenne avait commandés pour sa ferme.\n\nVeuillez agréer, etc.\n\n${D18_SIGNE}`,
  quittance: (v) => `Reçu la somme de ${v.m} pièces, pour le ${v.n} terme de la succession Varenne.\n\nConformément aux volontés du défunt, les ouvriers passeront demain matin : ${v.t}.\n\n${v.suite}\n\n${D18_SIGNE}`,
  suite: (v) => `Le ${v.n} terme, de ${v.m} pièces, sera dû le ${v.j}.`,
  rappel: (v) => `Madame, Monsieur,\n\nJe me permets de vous rappeler que le ${v.n} terme de la succession Varenne, ${v.m} pièces, tombe le ${v.j}.\n\n${D18_SIGNE}`,
  demeure: (v) => `Madame, Monsieur,\n\nLe ${v.n} terme n’a pas été réglé à son échéance. Je vous mets en demeure de le verser sans délai. Une pénalité de ${v.p} pièces s’y ajoute : il est désormais de ${v.m} pièces.\n\nSans règlement d’ici ${v.d} jours, je devrai confier le dossier à l’huissier.\n\n${D18_SIGNE}`,
  penalite: (v) => `Madame, Monsieur,\n\nLe ${v.n} terme n’est toujours pas réglé. La pénalité s’alourdit de ${v.p} pièces : ${v.m} pièces en tout.\n\n${D18_SIGNE}`,
  saisie: (v) => `Procès-verbal de saisie.\n\nCe jour, à la requête de l’étude Delorme, nous nous sommes transportés à la ferme Varenne et avons saisi : ${v.objets}. Vendu à la criée pour ${v.r} pièces, déduites du ${v.n} terme. Reste dû : ${v.m} pièces.\n\nLes scellés sont posés sur les privilèges du domaine jusqu’à complet paiement.\n\n${D18_HUISSIER}`,
  saisieVide: (v) => `Procès-verbal de carence.\n\nCe jour, à la requête de l’étude Delorme, nous nous sommes transportés à la ferme Varenne. Nous n’y avons rien trouvé qui vaille d’être saisi. Reste dû : ${v.m} pièces.\n\nLes scellés sont posés sur les privilèges du domaine jusqu’à complet paiement.\n\n${D18_HUISSIER}`,
  scellesLeves: () => `Madame, Monsieur,\n\nVotre règlement nous est parvenu. Les scellés sont levés.\n\n${D18_SIGNE}`,
  mainlevee: (v) => `Acte de mainlevée.\n\nReçu la somme de ${v.m} pièces, pour le huitième et dernier terme de la succession Varenne. La ferme, ses terres et ses murs sont quittes de toute dette. Les ouvriers passeront demain matin.\n\nL’étude vous remercie.\n\n${D18_SIGNE}\n\nP.-S. Les travaux que vous avez vus s’élever, feu M. Varenne les avait commandés il y a quarante ans. Personne avant vous n’était allé plus loin que le troisième terme.`,
  deplace: (v) => `Madame, Monsieur,\n\nPour faire place aux travaux, mes ouvriers ont déplacé de quelques pas : ${v.objets}. Rien n’a été abîmé.\n\n${D18_SIGNE}`,
};
const D18_NUMS = ['premier', 'deuxième', 'troisième', 'quatrième', 'cinquième', 'sixième', 'septième', 'huitième'];

// ---------------------------------------------------------------- les textes du jeu (peu : l'essentiel passe par les lettres)
const D18_TEXTES = {
  page: 'La ferme',
  boite: 'La boîte de l’étude',
  plaque: 'Une plaque de cuivre, ternie : « Maître Delorme, notaire. Règlements par la boîte. » La maison derrière a ses volets clos.',
  rien: 'Rien n’est dû. La ferme est quitte.',
  payer: (m) => `Glisser le terme dans la boîte (${m} pièces)`,
  verser: (m) => `Glisser ce que j’ai (${m} pièces)`,
  laisser: 'Laisser',
  pauvre: '(Votre bourse est vide.)',
  verse: (m, r) => r > 0 ? `(Vous glissez ${m} pièces dans la fente. Il reste ${r} pièces à verser.)` : `(Vous glissez ${m} pièces dans la fente. Quelque part dans la maison close, une plume gratte.)`,
  mandatOpt: 'Un mandat pour l’étude Delorme',
  mandatTexte: (m, f) => `Un mandat pour l’étude ? Ils sont où, ces gens-là ? On n’a jamais vu personne y entrer. Mais les mandats partent, et les quittances reviennent. ${m} pièces, plus ${f} de frais.`,
  mandatTout: (m) => `Envoyer le terme (${m} pièces)`,
  mandatPart: (m) => `Envoyer ce que j’ai (${m} pièces)`,
  mandatFait: 'C’est parti. Moi, je ne touche pas à ce courrier-là plus que nécessaire.',
  mandatPauvre: 'Il vous faut au moins de quoi payer les frais.',
  mandatRien: 'L’étude ? Elle ne vous réclame plus rien. Vous êtes bien le premier.',
  travaux: '(Des ouvriers sont passés à la ferme.)',
  huissiers: 'Les huissiers',
  huissiersBas: 'Ils emportent ce qui se vend.',
  ferme: 'La ferme Varenne',
  terme: 'Terme',
  du: 'Dû',
  echeance: 'Échéance',
  retard: 'En retard',
  scelles: 'Scellés sur les privilèges',
  fait: 'Travaux faits',
  prochain: 'Le terme suivant paiera',
  ouvriers: 'Les ouvriers viendront demain matin.',
  ou: (o) => `Se règle dans la boîte de l’étude (${o}) ou par mandat à la poste.`,
  quitte: 'Quitte de toute dette.',
};
