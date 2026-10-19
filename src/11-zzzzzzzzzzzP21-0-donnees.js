// ============================================================================
//  LA PÊCHE À QTE (agent P21, vingt et unième vague) — 0. LES DONNÉES ET LE MOTEUR
//  - Les réglages (P21_REGL), la façon de se battre de chaque espèce (P21_STYLES,
//    P21_ESPECES : taille et poids tirés selon l'espèce), les appâts (P21_APPATS),
//    les textes (P21_TEXTES).
//  - Le moteur du combat (p21Moteur) : pur, sans DOM ni farm.s ; le jeu
//    (11-zzzzzzzzzzzP21-1-peche.js) le fait avancer à chaque image, et
//    l'équilibrage (tools/equilibrage/P21.js) le rejoue avec des joueurs simulés.
//  - Le tirage de la prise (p21Tirage) : la copie exacte de celui de
//    play.catchFish, pour savoir AU FERRAGE quel poisson on va remonter (le
//    combat en dépend) ; play.catchFish reçoit ensuite les deux tirages faits
//    d'avance (F.u) et reste la fonction qui choisit et donne la prise.
// ============================================================================

// ---------------------------------------------------------------- réglages
const P21_REGL = {
  // l'attente (s) avant la vraie touche : (a + hasard × b) × vitesse de la canne × coin × appât
  attente: [7, 13.6],
  coin: 0.65,              // dans un coin à poissons, ça mord plus vite
  appat: 0.85,             // un appât, quel qu'il soit : un peu plus vite aussi
  leurres: [0, 3],         // petites touches (le bouchon frémit) pendant l'attente
  annonce: 0.55,           // s : le bouchon s'enfonce une fois, puis plonge
  // le ferrage : la fenêtre (s) après la plongée du bouchon ; trop tôt (pendant un frémissement, ou l'annonce), le
  // poisson part ; trop tard aussi
  fenetre: { complete: 0.75, simplifiee: 1.5, auto: 2.2 },
  reprise: [3, 8],         // après un ferrage manqué : la touche suivante vient au bout de (s)
  tardAppat: 0.5,          // trop tard : il emporte l'appât une fois sur deux (aide complète)
  // le lancer
  lancer: { min: 4, max: 17, charge: 1.05 }, // m ; s pour remplir la jauge (puis elle redescend, aide complète)
  vol: [0.32, 0.62],       // s : le bouchon en l'air (près / loin)
  // le combat
  moulinet: 3.0,           // m/s de fil repris quand rien ne tire
  casse: { complete: 0.4, simplifiee: 0.9 },  // s dans le rouge avant que la ligne casse
  montee: 1.8,             // la tension ne monte pas plus vite que cela (par seconde) : la canne plie
  mou: 3.0,                // s sans mouliner (ligne molle) avant que le poisson se décroche
  fil: 32,                 // m de fil : au-delà, la ligne casse
  invite: 1.0,             // s pour répondre à une invite (les plus vifs : moins, voir P21_STYLES)
  sautDecroche: 0.35,      // un saut manqué (canne pas baissée) : il se décroche une fois sur trois
  bord: 1.0,               // m : au bord, on le sort (ou l'épuisette)
  epuisette: { kg: 1.2, fenetre: 1.4 },
  // la canne : la tension monte moins avec une bonne canne (« fast », pour l'attente, reste celui de l'objet)
  tenue: { canne: 1, canne_fer: 0.75, canne_dame: 0.6 },
  rare: 0.5,               // poids w sous lequel une espèce est rare : les appâts n'y touchent pas
  prise: 1.6,              // s : le poisson montré en main
  // le poisson qui s'échappe revient mordre à la touche suivante (au même endroit, le même jour) : la rareté ne change
  // pas en espérance
};

// ---------------------------------------------------------------- les façons de se battre
// F : force ; S : endurance (s de moulinet sous tension pour l'épuiser) ; freq : coups par seconde ; coups : [coup, poids] ;
// invite : la fenêtre des invites (s) ; phases (légendaires) : [[au-dessus de cette endurance, freq, coups]…]
const P21_STYLES = {
  fretin:    { F: 0.28, S: 1.0, freq: 0.3, coups: [['secoue', 1]] },
  perche:    { F: 0.50, S: 2.6, freq: 0.5, coups: [['secoue', 2], ['cote', 2], ['file', 1]] },
  carpe:     { F: 0.72, S: 6.0, freq: 0.38, coups: [['file', 4], ['cote', 2], ['plonge', 1]] },
  truite:    { F: 0.58, S: 3.4, freq: 0.55, coups: [['saut', 3], ['file', 2], ['cote', 1]] },
  saumon:    { F: 0.85, S: 8.0, freq: 0.5, coups: [['saut', 3], ['file', 3], ['cote', 1]] },
  brochet:   { F: 0.95, S: 4.2, freq: 0.62, invite: 0.95, coups: [['secoue', 3], ['file', 2], ['saut', 1], ['cote', 1]] },
  anguille:  { F: 0.55, S: 3.4, freq: 0.6, coups: [['tortille', 4], ['plonge', 1]] },
  silure:    { F: 1.10, S: 8.0, freq: 0.32, coups: [['plonge', 3], ['file', 2], ['secoue', 1]] },
  ecrevisse: { F: 0.22, S: 0.9, freq: 0.35, coups: [['recule', 1]] },
  aveugle:   { F: 0.45, S: 3.0, freq: 0.35, coups: [['plonge', 2], ['cote', 1]] },
  lune:      { F: 0.80, S: 9.0, freq: 0.45, coups: [['saut', 2], ['file', 2]] },
  esturgeon: { F: 1.35, S: 14, freq: 0.32, invite: 1.0, coups: [['plonge', 3], ['file', 2]] },
  // les légendaires : chacun son combat
  reine:     { F: 1.15, S: 20, invite: 0.9, phases: [[0.66, 0.45, [['file', 3], ['cote', 2]]], [0.33, 0.6, [['tourne', 3], ['cote', 1]]], [0, 0.5, [['plonge', 2], ['file', 1]]]] },
  vieux:     { F: 1.5, S: 24, invite: 0.95, phases: [[0.6, 0.35, [['plonge', 3], ['file', 2]]], [0.25, 0.3, [['cale', 3], ['plonge', 1]]], [0, 0.45, [['file', 2], ['secoue', 1]]]] },
  notaire:   { F: 1.3, S: 14, invite: 0.8, freq: 0.75, coups: [['secoue', 3], ['saut', 2], ['file', 2], ['cote', 1]] },
  ancien:    { F: 0.95, S: 16, invite: 0.75, freq: 0.5, coups: [['suite', 3], ['plonge', 1], ['file', 1]] },
  // ce qui n'est pas un poisson : un poids mort
  herbes:    { F: 0.15, S: 0, freq: 0, coups: [], mort: true },
  coffre:    { F: 0.55, S: 0, freq: 0, coups: [], mort: true },
  perle:     { F: 0.12, S: 0, freq: 0, coups: [], mort: true },
};
// les coups : durée (s), force (× F), invite (direction à presser : g gauche, d droite, h lever, b baisser)
const P21_COUPS = {
  nage:     { dur: [0, 0], k: 0.5 },
  file:     { dur: [1.2, 2.2], k: 1.6 },
  cote:     { dur: [1.0, 1.0], k: 1.0, invite: 'cote' },
  plonge:   { dur: [1.4, 1.4], k: 1.25, invite: 'h' },
  saut:     { dur: [0.9, 0.9], k: 0.3, invite: 'b', pic: 0.5 },
  secoue:   { dur: [0.8, 1.1], k: 0.95, osc: 0.6 },
  tortille: { dur: [1.7, 1.7], k: 0.9, suite: 2, alterne: true },
  recule:   { dur: [1.0, 1.0], k: 0.7 },
  cale:     { dur: [3.0, 3.0], k: 0.95, cale: true },
  tourne:   { dur: [2.4, 2.4], k: 1.0, suite: 3, alterne: true },
  suite:    { dur: [2.2, 2.2], k: 0.8, suite: 3 },
};
// id : [façon de se battre, cm min, cm max, kg min, kg max]
const P21_ESPECES = {
  vairon: ['fretin', 5, 10, 0.004, 0.02], ablette: ['fretin', 10, 18, 0.01, 0.05], goujon: ['fretin', 9, 16, 0.015, 0.06],
  loche: ['fretin', 7, 12, 0.008, 0.025], chabot: ['fretin', 8, 14, 0.01, 0.035], vandoise: ['fretin', 15, 28, 0.05, 0.25],
  gardon: ['fretin', 12, 30, 0.05, 0.5], rotengle: ['fretin', 15, 32, 0.08, 0.6], gremille: ['fretin', 10, 20, 0.03, 0.15],
  blennie: ['fretin', 8, 15, 0.02, 0.08], poisson_source: ['fretin', 15, 30, 0.1, 0.6],
  perche: ['perche', 15, 42, 0.1, 1.6], chevesne: ['perche', 25, 58, 0.3, 2.8],
  carpe: ['carpe', 40, 90, 1.5, 16], carpe_miroir: ['carpe', 45, 85, 2, 14], carassin: ['carpe', 15, 35, 0.2, 1.2],
  breme: ['carpe', 30, 62, 0.5, 4], tanche: ['carpe', 25, 55, 0.4, 3], barbeau: ['carpe', 30, 72, 0.5, 4.5],
  truite: ['truite', 25, 55, 0.25, 2.5], truite_arc: ['truite', 25, 60, 0.3, 3], ombre: ['truite', 25, 45, 0.2, 1.2],
  omble: ['truite', 25, 55, 0.3, 2.5], lavaret: ['truite', 25, 55, 0.3, 2], saumon: ['saumon', 60, 110, 3, 12],
  brochet: ['brochet', 45, 110, 0.9, 10], sandre: ['brochet', 40, 85, 0.8, 6],
  anguille: ['anguille', 40, 100, 0.2, 2], lamproie: ['anguille', 30, 50, 0.1, 0.35], anguille_argent: ['anguille', 50, 100, 0.3, 2],
  silure: ['silure', 70, 200, 3, 40], poisson_chat: ['silure', 20, 40, 0.2, 1], lotte: ['silure', 30, 65, 0.4, 3],
  ecrevisse: ['ecrevisse', 8, 14, 0.03, 0.12], ecrevisse_aveugle: ['ecrevisse', 7, 12, 0.02, 0.08],
  poisson_aveugle: ['aveugle', 12, 25, 0.1, 0.5], poisson_roche: ['aveugle', 20, 40, 0.3, 2], truite_pierre: ['aveugle', 25, 50, 0.3, 2],
  poisson_lune: ['lune', 40, 80, 2, 8], esturgeon: ['esturgeon', 100, 220, 10, 60],
  reine_lac: ['reine', 92, 120, 18, 30], vieux_silure: ['vieux', 210, 280, 45, 95], brochet_douves: ['notaire', 120, 142, 12, 20],
  poisson_ancien: ['ancien', 50, 75, 5, 12],
  // ce qui n'est pas un poisson
  fibre: ['herbes', 20, 60, 0.05, 0.2], coffre_peche: ['coffre', 30, 50, 4, 9], perle: ['perle', 6, 10, 0.05, 0.12],
};

// ---------------------------------------------------------------- les appâts (des objets du jeu)
// esp : les espèces qu'il attire (× k, prises aux autres espèces communes : les rares ne bougent pas)
const P21_APPATS = {
  vers: { k: 1.8, esp: ['perche', 'truite', 'anguille', 'tanche', 'gardon', 'barbeau', 'goujon', 'chevesne', 'ombre', 'gremille', 'loche'] },
  pain: { k: 1.8, esp: ['carpe', 'gardon', 'rotengle', 'breme', 'chevesne', 'carassin', 'ablette', 'carpe_miroir', 'vandoise'] },
  mais: { k: 2.2, esp: ['carpe', 'carpe_miroir', 'tanche', 'breme', 'carassin'] },
  sauterelle: { k: 1.6, esp: ['truite', 'truite_arc', 'ombre', 'chevesne', 'vandoise', 'omble'] },
  hanneton: { k: 1.8, esp: ['chevesne', 'truite', 'truite_arc', 'ombre'] },
  viande: { k: 1.8, esp: ['silure', 'anguille', 'poisson_chat', 'lotte', 'brochet', 'sandre', 'lamproie', 'ecrevisse'] },
  vairon: { k: 2.0, esp: ['brochet', 'sandre', 'perche', 'silure', 'lotte'], vif: true },
  ablette: { k: 2.0, esp: ['brochet', 'sandre', 'perche', 'silure'], vif: true },
  goujon: { k: 2.0, esp: ['brochet', 'sandre', 'perche', 'barbeau'], vif: true },
  grillon_pale: { k: 1.8, esp: ['poisson_aveugle', 'truite_pierre', 'ecrevisse_aveugle', 'poisson_roche', 'anguille_argent'] },
};
const P21_APPATS_ORDRE = ['vers', 'pain', 'mais', 'sauterelle', 'hanneton', 'viande', 'vairon', 'ablette', 'goujon', 'grillon_pale'];

// ---------------------------------------------------------------- les textes (français ; le coordinateur traduit)
const P21_TEXTES = {
  option: 'Aide à la pêche',
  aides: { complete: 'Complète', simplifiee: 'Simplifiée', auto: 'Automatique' },
  aideDesc: {
    complete: 'Le lancer dosé, le ferrage au bon moment, la tension et les invites du combat.',
    simplifiee: 'Des fenêtres larges, sans invites pendant le combat.',
    auto: 'Comme avant : on lance, on ferre quand ça plonge, le poisson vient.',
  },
  // la première fois, une canne en main
  aide1: 'Maintenez le clic pour doser le lancer, relâchez pour envoyer la ligne. Clic droit : l’appât.',
  aide2: 'Quand le bouchon plonge, ferrez (clic). Puis moulinez (clic maintenu) sans casser la ligne.',
  // le HUD
  lancer: 'Lancer',
  ferrez: 'Ferrez !',
  mouliner: 'Moulinez',
  lacher: 'Lâchez du fil !',
  tension: 'Tension',
  endurance: 'Le poisson',
  dist: (m) => `${m} m`,
  invites: { g: 'Tirez à gauche', d: 'Tirez à droite', h: 'Levez la canne', b: 'Baissez la canne', e: 'L’épuisette !' },
  coups: { file: 'Il file !', cote: 'Il part de côté.', plonge: 'Il plonge.', saut: 'Il saute !', secoue: 'Il secoue la tête.', tortille: 'Il se tortille.',
    recule: 'Ça recule.', cale: 'Il se cale au fond. Tenez bon.', tourne: 'Elle tourne autour de la ligne.', suite: 'L’eau se trouble.', epuise: 'Il s’épuise.' },
  // les fins
  tot: 'Trop tôt.',
  tard: 'Trop tard.',
  tardAppat: 'Trop tard. L’appât est parti avec lui.',
  casse: 'La ligne a cassé.',
  casseAppat: 'La ligne a cassé. L’appât est perdu.',
  decroche: 'Il s’est décroché.',
  loin: 'Il a pris tout le fil.',
  revenant: '(Il est encore là, quelque part sous l’eau.)',
  sol: '(Pas d’eau là-bas.)',
  // la prise
  record: 'Record !',
  nouvelle: 'Première prise',
  taille: (cm, kg) => `${cm} cm · ${kg}`,
  kg: (kg) => (kg >= 1 ? `${(Math.round(kg * 10) / 10).toLocaleString('fr-FR')} kg` : `${Math.max(1, Math.round(kg * 1000))} g`),
  // l'appât
  appat: (nom, n) => `Appât : ${nom} (${n})`,
  sansAppat: 'Sans appât',
  appatFini: (nom) => `(Plus de ${nom}.)`,
  // la glace
  glaceCanne: '(Il faudrait une canne à pêche.)',
  glaceDescend: 'Vous laissez filer la ligne dans le trou.',
  // le carnet
  page: 'Pêche',
  carnetTitre: 'Carnet de pêche',
  carnetVide: 'Rien de pris pour l’instant. Le carnet attend sa première ligne.',
  carnetPrises: (n, e, t) => `${n} prise${n > 1 ? 's' : ''}, ${e} espèce${e > 1 ? 's' : ''} sur ${t}.`,
  carnetJamais: (n) => `${n} espèce${n > 1 ? 's' : ''} encore jamais prise${n > 1 ? 's' : ''}.`,
  carnetVues: 'Vues, jamais pesées',
  carnetEspeces: 'Espèces prises',
  carnetPertes: (c, d) => `Lignes cassées : ${c}. Décrochés : ${d}.`,
  carnetAppat: 'Appât',
  carnetCanne: 'Canne',
  carnetAide: 'Aide',
  carnetQuand: (j, h) => `jour ${j}, ${h}`,
  carnetN: (n) => `× ${n}`,
  carnetRecord: 'Record',
  carnetOu: 'Où',
  carnetConcours: (kg) => `Concours du jour : votre prise la plus lourde, ${kg}.`,
  carnetWiki: 'Fiche',
  heures: ['la nuit', 'à l’aube', 'le matin', 'à midi', 'l’après-midi', 'le soir', 'la nuit'],
  // le concours (par le poids)
  concoursRegle: 'Concours de pêche, chaque Pêchedi. Inscriptions au ponton, de six heures à midi (cinq pièces). Ce qu’on tire du lac jusqu’à quatre heures compte ; on présente sa prise la plus lourde, pesée au ponton, entre quatre heures et huit heures du soir.\n\nPremier prix : cinquante pièces et un coffre de pêcheur. Deuxième : vingt-cinq pièces. Troisième : des vers, beaucoup de vers.',
  concoursPour: (nom, kg) => `(Pour le concours : ${nom}, ${kg}. Votre prise la plus lourde.)`,
  concoursAttente: (nom, kg) => `(Votre prise la plus lourde, pour l’instant : ${nom}, ${kg}. On pèse à quatre heures.)`,
  concoursRien: '(Rien de pris pour l’instant. Il reste jusqu’à quatre heures.)',
  concoursBilan: (moi, L) => `${moi ? 'Votre prise la plus lourde : ' + moi + '.' : 'Vous n’avez rien présenté.'}\n\nLa pesée : ${L}.`,
  // les fiches du wiki
  champEaux: 'Où il mord',
  champHeure: 'Quand il mord',
  champAppat: 'Ce qui le fait mordre',
  champCombat: 'Au bout de la ligne',
  heureVal: { jour: 'le jour', nuit: 'la nuit', tout: 'à toute heure' },
  lune: ', les nuits de lune',
  combats: {
    fretin: 'Il se laisse remonter.', perche: 'Il secoue la tête et part de côté.', carpe: 'Elle file loin, longtemps.',
    truite: 'Elle saute hors de l’eau.', saumon: 'Il saute, et file.', brochet: 'Il se débat violemment.',
    anguille: 'Elle se tortille de droite et de gauche.', silure: 'Il plonge, lourd.', ecrevisse: 'Elle recule.',
    aveugle: 'Il tire vers le fond.', lune: 'Il glisse et saute, sans bruit.', esturgeon: 'Il plonge et ne lâche rien.',
    reine: 'Elle file, tourne, puis sonde.', vieux: 'Il se cale au fond.', notaire: 'Il saute et secoue la tête, rageur.',
    ancien: 'Il tire en suites, comme on frappe à une porte.',
  },
};

// ---------------------------------------------------------------- le tirage (copie de play.catchFish, en pur)
const p21Tirage = {
  // l'espèce, sa façon de se battre, sa taille
  espece(id) {
    if (P21_ESPECES[id]) return P21_ESPECES[id];
    // une espèce ajoutée plus tard : une perche de sa taille (le prix dit à peu près la taille)
    const p = (typeof ITEMS !== 'undefined' && ITEMS[id] && ITEMS[id].price) || 6, k = Math.min(4, Math.max(0.5, p / 10));
    return ['perche', 15 * k, 40 * k, 0.1 * k * k, 1.5 * k * k];
  },
  style(id) { return P21_STYLES[this.espece(id)[0]] || P21_STYLES.perche; },
  // la taille : la plupart moyens, quelques gros (rnd : une fonction 0..1)
  mesure(id, rnd) {
    const E = this.espece(id), R = rnd || Math.random;
    const s = Math.pow(R(), 1.45) * 0.92 + (R() < 0.04 ? 0.08 : R() * 0.08);
    const cm = E[1] + (E[2] - E[1]) * s;
    const kg = E[3] + (E[4] - E[3]) * Math.pow(s, 2.5);
    return { s, cm: Math.round(cm), kg: Math.round(kg * 1000) / 1000 };
  },
  // les candidats de play.catchFish : même ordre, mêmes filtres
  candidats(zone, nuit, lune) {
    return Object.keys(FISH).filter((k) => {
      const q = FISH[k];
      if (!q.where.includes(zone)) return false;
      if (q.time === 'jour' && nuit) return false;
      if (q.time === 'nuit' && !nuit) return false;
      if (q.moon && !lune) return false;
      return true;
    });
  },
  // les poids w que verra play.catchFish une fois l'appât posé (FISH[k].w modifiés le temps de l'appel) : { k: w }
  poidsAppat(cand, appat) {
    const A = appat && P21_APPATS[appat], out = {};
    for (const k of cand) out[k] = FISH[k].w;
    if (!A) return out;
    const com = cand.filter((k) => FISH[k].w >= P21_REGL.rare);
    const W0 = com.reduce((a, k) => a + FISH[k].w, 0);
    if (!com.some((k) => A.esp.includes(k)) || !(W0 > 0)) return out;
    let W1 = 0;
    for (const k of com) { out[k] = FISH[k].w * (A.esp.includes(k) ? A.k : 1); W1 += out[k]; }
    for (const k of com) out[k] *= W0 / W1;
    return out;
  },
  // les poids du tirage (o : { zone, nuit, lune, pluie, appat, dame }) → { cand, w: [..], tot }
  table(o) {
    const cand = this.candidats(o.zone, o.nuit, o.lune), P = this.poidsAppat(cand, o.appat);
    const w = cand.map((k) => { let x = P[k]; if (o.dame && x < 2) x *= 3; return x * (FISH[k].rain && o.pluie ? 3 : 1); });
    return { cand, w, tot: w.reduce((a, b) => a + b, 0) };
  },
  // ce que donnera play.catchFish avec ces deux tirages (u0 : l'espèce ; u1 : herbes, coffre, perle)
  predire(o, u0, u1) {
    const T = this.table(o);
    if (!T.cand.length) return null;
    let r = u0 * T.tot, pick = T.cand[0];
    for (let i = 0; i < T.cand.length; i++) { r -= T.w[i]; if (r <= 0) { pick = T.cand[i]; break; } }
    if (u1 < 0.05) return 'fibre';
    if (u1 < 0.06) return 'coffre_peche';
    if (u1 < 0.075 && o.zone === 'lac') return 'perle';
    return pick;
  },
  // u0 qui fait tomber le tirage sur cette espèce (le poisson qui revient), ou null
  viser(o, id) {
    const T = this.table(o), i = T.cand.indexOf(id);
    if (i < 0 || !(T.w[i] > 0)) return null;
    let c0 = 0;
    for (let j = 0; j < i; j++) c0 += T.w[j];
    return (c0 + T.w[i] / 2) / T.tot;
  },
};

// ---------------------------------------------------------------- le moteur du combat (pur)
// creer({ id, kg, s, aide, canne, D, rnd }) → C ; pas(C, dt, { mouline, dir }) ; C.fin : null | 'prise' | 'casse' |
// 'decroche' | 'loin'. Directions : 'g' gauche, 'd' droite, 'h' lever, 'b' baisser, 'e' l'épuisette.
const p21Moteur = {
  creer(o) {
    const R = P21_REGL, E = p21Tirage.espece(o.id), st = P21_STYLES[E[0]] || P21_STYLES.perche;
    const s = o.s ?? 0.4, aide = o.aide || 'complete';
    const C = {
      id: o.id, style: E[0], st, kg: o.kg || E[3], s, aide, rnd: o.rnd || Math.random,
      F: st.F * (0.8 + 0.4 * s), S: st.S * (0.7 + 0.6 * s),
      tenue: (R.tenue[o.canne] ?? 1) * (aide === 'simplifiee' ? 0.85 : 1),
      T: 0.3, E: st.mort ? 0 : 1, D: o.D || 10, D0: o.D || 10, side: 0, sideV: 0, prof: 0.5,
      coup: { k: 'nage', t: 0, dur: 0 }, coupT: 0.6 + (o.rnd || Math.random)() * 0.8,
      invite: null, file: [], nInv: 0, nOk: 0, nRate: 0, breakT: 0, mouT: 0, t: 0, fin: null,
      epuisette: null, saut: 0, sautMax: 0, evts: [], bolte: 0, auto: aide === 'auto',
    };
    if (C.auto) C.dureeAuto = 1.0 + 0.6 * Math.log2(1 + C.kg) + (st.mort ? 0.4 : 0);
    return C;
  },
  // la phase (légendaires) : [freq, coups]
  phase(C) {
    const st = C.st;
    if (!st.phases) return [st.freq || 0, st.coups || []];
    for (const [e, f, L] of st.phases) if (C.E >= e) return [f, L];
    const last = st.phases[st.phases.length - 1];
    return [last[1], last[2]];
  },
  choisir(C, L) {
    const tot = L.reduce((a, q) => a + q[1], 0);
    let r = C.rnd() * tot;
    for (const [k, w] of L) { r -= w; if (r <= 0) return k; }
    return L[0][0];
  },
  // un coup du poisson : il commence
  lancerCoup(C, k) {
    const K = P21_COUPS[k] || P21_COUPS.nage;
    C.coup = { k, t: 0, dur: K.dur[0] + C.rnd() * (K.dur[1] - K.dur[0]) };
    C.evts.push({ e: 'coup', k });
    if (k === 'cote') { C.sideV = C.side > 0.2 ? -1 : C.side < -0.2 ? 1 : (C.rnd() < 0.5 ? -1 : 1); }
    if (k === 'saut') { C.saut = 0.8; C.sautMax = 0.8; C.evts.push({ e: 'saut' }); }
    if (k === 'plonge') C.prof = 1.8;
    // les invites : une seule, ou une suite
    const inv = [];
    if (K.invite === 'cote') inv.push(C.sideV < 0 ? 'd' : 'g');   // il part à gauche : on tire à droite
    else if (K.invite) inv.push(K.invite);
    if (K.suite) {
      let d = C.rnd() < 0.5 ? 'g' : 'd';
      for (let i = 0; i < K.suite; i++) {
        if (K.alterne) { inv.push(d); d = d === 'g' ? 'd' : 'g'; } else inv.push(['g', 'd', 'h', 'b'][Math.floor(C.rnd() * 4)]);
      }
    }
    C.file = inv;
    this.inviteSuivante(C);
  },
  inviteSuivante(C) {
    if (!C.file.length) { C.invite = null; return; }
    const dir = C.file.shift(), dur = (C.st.invite || P21_REGL.invite) * (P21_COUPS[C.coup.k] && P21_COUPS[C.coup.k].suite ? 0.8 : 1);
    C.nInv++;
    if (C.aide !== 'complete') { // aide simplifiée : pas d'invites ; le coup est paré à moitié
      C.E = Math.max(0, C.E - 0.05); C.nOk++; C.evts.push({ e: 'pare', dir });
      if (C.file.length) this.inviteSuivante(C); else C.invite = null;
      return;
    }
    C.invite = { dir, t: 0, dur };
    C.evts.push({ e: 'invite', dir, dur });
  },
  reussir(C) {
    const I = C.invite;
    C.nOk++;
    C.E = Math.max(0, C.E - (C.st.phases ? 0.07 : 0.12));
    C.evts.push({ e: 'ok', dir: I.dir });
    if (C.file.length) { this.inviteSuivante(C); return; }
    C.invite = null;
    C.coup.dur = Math.min(C.coup.dur, C.coup.t + 0.25); // il renonce
  },
  rater(C, mauvais) {
    const I = C.invite, pic = (P21_COUPS[C.coup.k] && P21_COUPS[C.coup.k].pic) || 0.4;
    C.nRate++;
    C.T += pic; C.D += 1.2; C.E = Math.min(1, C.E + 0.04);
    C.evts.push({ e: 'rate', dir: I.dir, mauvais: !!mauvais });
    C.file.length = 0; C.invite = null;
    if (C.coup.k === 'saut' && C.rnd() < P21_REGL.sautDecroche) { C.fin = 'decroche'; C.evts.push({ e: 'secoue' }); }
  },
  pas(C, dt, inp) {
    if (C.fin) return C;
    const R = P21_REGL, mouline = !!(inp && inp.mouline), dir = inp && inp.dir;
    C.t += dt;
    // aide automatique : il vient tout seul
    if (C.auto) {
      const k = Math.min(1, C.t / C.dureeAuto);
      C.D = C.D0 * (1 - k); C.T = 0.38 + 0.08 * Math.sin(C.t * 9); C.E = Math.max(0, 1 - k * 1.3);
      if (k >= 1) C.fin = 'prise';
      return C;
    }
    // l'épuisette
    if (C.epuisette) {
      const P = C.epuisette;
      P.t += dt; C.T = 0.2; C.prof = 0;
      if (dir === 'e') { C.fin = 'prise'; C.evts.push({ e: 'epuisette', ok: true }); return C; }
      if (P.t > P.dur) { C.epuisette = null; C.E = 0.35; C.D = 3.2; C.evts.push({ e: 'epuisette', ok: false }); this.lancerCoup(C, 'file'); }
      return C;
    }
    // les coups du poisson
    const c = C.coup;
    c.t += dt;
    if (c.k !== 'nage' && c.t >= c.dur && !C.invite) { C.coup = { k: 'nage', t: 0, dur: 0 }; C.prof = 0.5; C.sideV = 0; }
    if (C.E > 0 && C.coup.k === 'nage' && !C.st.mort) {
      C.coupT -= dt;
      const [freq, L] = this.phase(C);
      if (C.coupT <= 0 && freq > 0 && L.length) { this.lancerCoup(C, this.choisir(C, L)); C.coupT = (1 / freq) * (0.6 + C.rnd() * 0.8); }
    }
    // l'invite en cours
    if (C.invite) {
      C.invite.t += dt;
      if (dir && dir !== 'e') { if (dir === C.invite.dir) this.reussir(C); else this.rater(C, true); }
      else if (C.invite && C.invite.t >= C.invite.dur) this.rater(C, false);
      if (C.fin) return C;
    }
    // la force du poisson
    const K = P21_COUPS[C.coup.k] || P21_COUPS.nage;
    let k = K.k;
    if (K.osc) k += K.osc * Math.sin(C.t * 16);
    if (C.saut > 0) { C.saut -= dt; k = 0.15; if (C.saut <= 0) { C.evts.push({ e: 'replonge' }); } }
    let pull = C.st.mort ? C.F * 0.6 : C.E <= 0 ? 0.12 * C.F : C.F * k * (0.35 + 0.65 * C.E);
    if (C.E <= 0 && !C.st.mort && C.coup.k !== 'nage') pull = C.F * 0.5;
    // la tension visée
    let Tt = mouline ? 0.22 + pull * 0.7 * C.tenue : 0.08 + pull * 0.22 * C.tenue;
    if (C.D >= R.fil) Tt = 1.3;
    // (la canne plie : la tension monte vite, mais pas d'un coup ; elle retombe dès qu'on lâche)
    const dT = (Tt - C.T) * Math.min(1, dt * (Tt > C.T ? 8 : 10));
    C.T += dT > 0 ? Math.min(dT, R.montee * dt) : dT;
    C.T = Math.max(0, Math.min(1.35, C.T));
    // le fil : repris, ou pris
    if (mouline && !(K.cale && C.E > 0)) C.D -= R.moulinet * Math.max(0, 1 - pull * 0.7) * dt;
    else if (!mouline) C.D += Math.max(0, pull - 0.35) * 2.6 * dt;
    C.D = Math.max(0.3, C.D);
    // de côté
    if (C.sideV) C.side = Math.max(-1, Math.min(1, C.side + C.sideV * dt * 1.4));
    else C.side *= Math.exp(-dt * 0.6);
    // l'endurance : elle fond sous la tension
    if (C.E > 0 && !C.st.mort) {
      let d = mouline && C.T >= 0.25 ? (0.55 + C.T) : 0.2;
      if (K.cale) d = mouline && C.T >= 0.55 && C.T < 0.95 ? 1.2 : 0;
      C.E = Math.max(0, C.E - dt / C.S * d);
      if (C.E <= 0) { C.evts.push({ e: 'epuise' }); C.file.length = 0; C.invite = null; C.coup = { k: 'nage', t: 0, dur: 0 }; }
    }
    // la casse
    if (C.T >= 1) { C.breakT += dt; if (C.breakT >= (R.casse[C.aide] || R.casse.complete)) { C.fin = C.D >= R.fil ? 'loin' : 'casse'; return C; } }
    else C.breakT = Math.max(0, C.breakT - dt * 1.5);
    // la ligne molle
    const actif = ['file', 'plonge', 'saut', 'cale'].includes(C.coup.k);
    if (!mouline && C.E > 0.05 && !actif && !C.st.mort) { C.mouT += dt; if (C.mouT >= R.mou) { C.fin = 'decroche'; return C; } }
    else C.mouT = Math.max(0, C.mouT - dt * 2);
    // au bord
    if (C.D <= R.bord) {
      if (C.E > 0.3 && !C.st.mort) { if (C.t > C.bolte) { C.bolte = C.t + 2; C.D = 2.2; this.lancerCoup(C, 'file'); } }
      else if (C.kg >= R.epuisette.kg && C.aide === 'complete' && !C.st.mort) { C.epuisette = { t: 0, dur: R.epuisette.fenetre }; C.evts.push({ e: 'invite', dir: 'e', dur: R.epuisette.fenetre }); }
      else C.fin = 'prise';
    }
    return C;
  },
};
