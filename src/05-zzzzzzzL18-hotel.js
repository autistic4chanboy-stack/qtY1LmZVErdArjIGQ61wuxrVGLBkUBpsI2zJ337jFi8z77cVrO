// ============================================================================
//  LE GRAND HÔTEL DES CIMES (agent L18, dix-huitième vague) — 1. LES DONNÉES ET LES TEXTES
//  Un palace de la Belle Époque bâti en 1868 sur le replat des monts de l'Est,
//  au-dessus du château, par une compagnie lyonnaise qui croyait au tourisme des
//  cimes ; on y monte par un funiculaire (1882), ou dans la voiture de l'hôtel.
//  On peut s'y faire engager comme concierge : chaque jour, un service à la loge
//  (les clients demandent ; on porte, on cherche, on arrange, on se tait), une
//  paie, des pourboires, une réputation qui fait venir de meilleurs clients.
//  Quatre histoires, avec des gens qu'on finit par aimer :
//   - « Lucien » : la comtesse Hortense de Saint-Aubin cherche son fils, entré
//     dans la vallée il y a deux étés, et qui n'en est pas redescendu ;
//   - « Firmin veut voir Paris » : le groom de quinze ans, orphelin de Clairpré ;
//   - « La symphonie de la vallée » : Casimir Wolański, compositeur exilé, qui ne
//     peut plus marcher, écrit sa dernière œuvre avec les sons qu'on lui rapporte ;
//   - « La treize » : la chambre qui n'existe pas, la treizième sonnette, le
//     chef Mercadier et son plateau, et l'homme du col des Treize (1854).
//  Rien ne contredit l'histoire de la vallée (le Guet, la Porte, le Ver) : on
//  en entend parler, on en voit le bord, et c'est tout.
//  Le jeu : 11-zzzzzzzL18-*.js ; le carnet : 12-zzzzzzzL18-carnet.js.
// ============================================================================
const L18_NOM = 'le Grand Hôtel des Cimes';

// ---------------------------------------------------------------- les objets
defItem('l18_clefs', 'Les clefs croisées', 'quete', 0, ['cle', '#d8b050'], { unique: true, desc: 'Deux petites clefs d’or croisées, à épingler au revers : l’insigne des concierges. Celles-ci ont été portées par Gaspard pendant trente ans. Le métal est usé à l’endroit où l’on pose le pouce.' });
defItem('l18_cle_aile', 'Clé de l’aile Nord', 'quete', 0, ['cle', '#4e4a44'], { unique: true, desc: 'Une clé longue et noire, une étiquette de carton jaunie : « Aile N. — ne pas ouvrir ». Quelqu’un a ajouté au crayon : « sauf pour le plateau ».' });
defItem('l18_valise', 'Valise d’un client', 'quete', 0, ['sac', '#5a3a24'], { desc: 'Une valise de cuir, une étiquette au nom d’un client et au numéro de sa chambre. Elle pèse ce que pèsent les vacances.' });
defItem('l18_pli', 'Pli cacheté', 'quete', 0, ['lettre', '#e8e0cc'], { desc: 'Une enveloppe de l’hôtel, cachetée de cire. On ne lit pas le courrier des clients.' });
defItem('l18_bouteille', 'Bouteille de la cave', 'quete', 0, ['bouteille', '#3a4a2a'], { desc: 'Une bouteille poussiéreuse, sortie de la cave du Grand Hôtel. L’étiquette est presque effacée.' });
defItem('l18_draps', 'Draps de l’hôtel', 'quete', 0, ['colis', '#e8e4d8'], { desc: 'Une pile de draps repassés, brodés d’un C et d’un sapin.' });
defItem('l18_epicerie', 'Pot de la réserve', 'quete', 0, ['pot', '#c8a050'], { desc: 'Un pot de grès de la réserve de l’hôtel : confiture de myrtilles, ou miel de sapin, selon l’étiquette.' });
defItem('l18_objet_perdu', 'Objet perdu', 'quete', 0, ['anneau', '#c8a048'], { desc: 'Un objet qu’un client a égaré dans l’hôtel. Il le reconnaîtra.' });
defItem('l18_lettre_comtesse', 'Lettre de la comtesse', 'quete', 0, ['lettre', '#d8c8e8'], { desc: 'Une lettre parfumée à la violette, adressée à « Monsieur le Préfet ». Elle en écrit une chaque matin.' });
defItem('l18_croquis', 'Le croquis de Lucien', 'quete', 0, ['carte', '#c8b890'], { unique: true, desc: 'Une feuille arrachée à un carnet de géologue : la Grande Porte, dessinée avec soin, les statues, les braseros. En bas : « J’y serai à la Saint-Jean. L. » Clic : le regarder.' });
defItem('l18_montre', 'La montre de Lucien', 'quete', 0, ['montre', '#c8a048'], { unique: true, desc: 'Une montre d’argent, arrêtée à quatre heures dix. Dans le couvercle : « À Lucien, pour ses vingt ans. Ta mère. »' });
defItem('l18_derniere_lettre', 'La dernière lettre', 'quete', 0, ['lettre', '#d8c8e8'], { unique: true, desc: 'La lettre de la comtesse à son fils. Elle ne l’a pas cachetée. On ne la lit pas.' });
defItem('l18_boite', 'La boîte de Firmin', 'quete', 0, ['pot', '#b84030'], { unique: true, desc: 'Une boîte de biscuits en fer, rouge et or. Dedans, des sous, onze cartes postales de Paris, et un ticket de tramway qu’il n’a jamais utilisé.' });
defItem('l18_recommandation', 'Lettre de recommandation', 'quete', 0, ['lettre', '#e8e0cc'], { unique: true, desc: '« Le soussigné, directeur du Grand Hôtel des Cimes, certifie que le jeune Firmin Lebrun… » La signature de M. Brissac, et, en dessous, la vôtre.' });
defItem('l18_carnet', 'Le carnet de Wolański', 'quete', 0, ['livre', '#3a3a5a'], { unique: true, desc: 'Un carnet de musique à couverture noire. Des portées vides, et en tête de chaque page un mot : « L’eau », « Les cloches », « Le vent », « Le silence ». Clic : le lire.' });
defItem('l18_partition', 'La symphonie de la vallée', 'quete', 0, ['livre', '#5a2a24'], { unique: true, desc: 'Le manuscrit, relié de rouge : « La Vallée, symphonie en quatre mouvements. Au concierge du Grand Hôtel des Cimes, qui a écouté pour moi. — C. W. »' });
defItem('l18_cheval', 'Le petit cheval de bois', 'quete', 0, ['figurine', '#8a6a44'], { unique: true, desc: 'Un cheval taillé au couteau dans du pin, pas plus grand qu’une main. Un ruban rouge noué au cou, raide de glace. Il était sous la neige, au milieu de la spirale.' });
defItem('l18_registre54', 'La page de 1854', 'quete', 0, ['lettre', '#c8b890'], { unique: true, desc: 'Une page du recensement de 1854, recopiée par le chef : treize noms montés au col, douze barrés à l’encre bleue. Le treizième n’est pas barré. Clic : la relire.' });

// ---------------------------------------------------------------- les rangs, la réputation, la paie
// rep : 0 à 100 ; rang : le premier dont le seuil est atteint (en partant d'en haut)
const L18_RANGS = [
  { id: 'stagiaire', nom: 'concierge stagiaire', rep: 0, gage: 70 },
  { id: 'concierge', nom: 'concierge', rep: 25, gage: 95 },
  { id: 'chef', nom: 'chef concierge', rep: 55, gage: 125 },
  { id: 'clefs', nom: 'chef concierge aux clefs d’or', rep: 85, gage: 150 },
];
const L18_REGL = {
  service: { debut: 7, fin: 19, duree: 5 },     // on prend son service entre 7 h et 19 h ; il dure cinq heures
  demande: { premier: 0.25, ecart: [0.6, 1.0], max: 6, attente: 1.2 }, // en heures de jeu (une heure : 50 s)
  pourboire: [6, 38],                            // le pourboire d'une demande bien faite (avant la réputation)
  repBien: [2, 4], repMal: 3, repSecret: 5,       // réputation gagnée, perdue
  demiGage: 0.5,                                 // un service quitté avant l'heure : la moitié des gages
  voiture: 6, funiculaire: 2,                    // prix d'une course
  vallee: 30,                                    // une commission dans la vallée : jusqu'au soir du lendemain (heures)
};

// ---------------------------------------------------------------- les gens de l'hôtel
// look : allure (humanRig) ; horaire : [heure, place (w.l18.places) ou nœud ('n:…'), pose ('debout'|'assis'|'travail'|'dort'|'absent')]
const L18_GENS = {
  directeur: {
    nom: 'M. Anatole Brissac', court: 'M. Brissac', role: 'directeur du Grand Hôtel', h: true,
    look: { skin: '#e2bea0', hair: '#9a9288', hairStyle: 'court', beard: 'moustache', top: '#24242a', bottom: '#1e1e22', shoe: '#141414', coat: true, build: 'rond' },
    bio: 'Lyonnais, cinquante-deux ans. Il a dirigé un hôtel à Nice, un autre à Vichy, et celui-ci depuis dix-neuf ans. Il tient l’hôtel comme on tient un navire : tout doit briller, rien ne doit se savoir. Il a peur du scandale, des créanciers, et d’une seule porte.',
    traits: ['méticuleux', 'inquiet', 'fier de sa maison'],
    horaire: [[7, 'bureau', 'assis'], [9, 'n:hall', 'debout'], [10.5, 'bureau', 'assis'], [12.5, 'maitre_hotel', 'debout'], [14, 'bureau', 'assis'], [17, 'terrasse_d', 'debout'], [19, 'maitre_hotel', 'debout'], [21, 'salon_bar', 'debout'], [23, 'ch_221', 'dort']],
  },
  gaspard: {
    nom: 'Gaspard Morel', court: 'Gaspard', role: 'veilleur de nuit, ancien chef concierge', h: true,
    look: { skin: '#d8b498', hair: '#e0dcd4', hairStyle: 'court', beard: 'courte', top: '#3a2a44', bottom: '#2a2228', shoe: '#1a1414', coat: true, old: true, build: 'mince' },
    bio: 'Soixante-et-onze ans. Entré groom à l’ouverture, en 1868 ; chef concierge pendant trente ans ; aujourd’hui veilleur de nuit, « parce qu’on ne sait pas dormir quand on a veillé toute sa vie ». Veuf de Mathilde, la lingère. Il sait où sont toutes les clés de l’hôtel, sauf une qu’il a jetée.',
    traits: ['patient', 'malicieux', 'mélancolique'],
    horaire: [[0, 'veilleur', 'assis'], [6.5, 'loge', 'debout'], [13, 'ch_m4', 'dort'], [19.5, 'salon_lecture', 'assis'], [21, 'veilleur', 'assis']],
  },
  firmin: {
    nom: 'Firmin Lebrun', court: 'Firmin', role: 'groom', h: true,
    look: { skin: '#e8c4a4', hair: '#8a5a2a', hairStyle: 'court', top: '#8a2424', bottom: '#2a2a34', shoe: '#1a1a1a', hat: 'casquette', hatCol: '#8a2424', height: 0.86, build: 'mince' },
    bio: 'Quinze ans, orphelin de Clairpré, monté à l’hôtel à douze avec un baluchon et une lettre du curé. Porte les valises plus lourdes que lui. Collectionne les cartes postales de Paris ; il connaît par cœur le plan des Grands Boulevards et n’a jamais vu un tramway.',
    traits: ['vif', 'bavard', 'courageux quand il ne réfléchit pas'],
    horaire: [[6.5, 'n:entree', 'debout'], [12, 'chef', 'debout'], [12.7, 'n:entree', 'debout'], [16, 'n:cour_n', 'debout'], [17, 'n:entree', 'debout'], [21.5, 'ch_m2', 'dort']],
  },
  chef: {
    nom: 'Auguste Mercadier', court: 'le chef Mercadier', role: 'chef de cuisine', h: true,
    look: { skin: '#d4a080', hair: '#3a2a20', hairStyle: 'court', beard: 'moustache', top: '#f0ece2', bottom: '#2a2a2a', shoe: '#1a1a1a', apron: '#f4f0e8', hat: 'bonnet', hatCol: '#f4f0e8', build: 'rond' },
    bio: 'Quarante-quatre ans, né dans la vallée, d’une famille du hameau qu’on a abandonné. Formé à Paris, au Café Anglais, rentré au pays sans dire pourquoi. Il crie en cuisine et chante en épluchant. Chaque soir, à onze heures, il prépare un plateau de plus que de clients.',
    traits: ['bourru', 'tendre', 'fidèle'],
    horaire: [[6, 'chef', 'travail'], [15, 'n:potager_c', 'debout'], [16.5, 'chef', 'travail'], [22.6, 'n:service', 'debout'], [23.2, 'n:aile_porte', 'debout'], [23.6, 'ch_m3', 'dort']],
  },
  odile: {
    nom: 'Mlle Odile Fauvel', court: 'Mlle Fauvel', role: 'gouvernante', h: false,
    look: { skin: '#e6c8b0', hair: '#2a2420', hairStyle: 'chignon', dress: true, top: '#2a2a30', bottom: '#24242a', shoe: '#141414', apron: '#e8e4d8', build: 'mince' },
    bio: 'Trente-six ans. Elle compte les draps, les serviettes, les femmes de chambre et les fautes d’orthographe des menus. Le soir, dans sa chambre, elle écrit des poèmes qu’elle ne montre à personne.',
    traits: ['sévère', 'exacte', 'secrètement romanesque'],
    horaire: [[7, 'lingerie', 'travail'], [10, 'n:c1_0', 'debout'], [12, 'lingerie', 'travail'], [14, 'n:c2_0', 'debout'], [16.5, 'lingerie', 'travail'], [21, 'ch_m5', 'dort']],
  },
  cocher: {
    nom: 'Baptiste', court: 'Baptiste', role: 'cocher', h: true,
    look: { skin: '#c89878', hair: '#5a4a3a', hairStyle: 'court', beard: 'courte', top: '#2e4a38', bottom: '#3a3228', shoe: '#2a1a10', hat: 'chapeau', hatCol: '#1e1e1e', coat: true },
    bio: 'Le cocher de l’hôtel. Il connaît chaque ornière entre Valbrume et les Cimes, et le nom des trois chevaux qui se relaient. Il parle peu, sauf aux chevaux.',
    traits: ['taiseux', 'sûr', 'lève-tôt'],
    horaire: [[5, 'cocher', 'debout'], [21.5, 'cocher', 'dort']],
  },
  joseph: {
    nom: 'Joseph Pellissier', court: 'Joseph', role: 'mécanicien du funiculaire', h: true,
    look: { skin: '#d0a888', hair: '#4a3a2a', hairStyle: 'court', top: '#3a4a5a', bottom: '#2a323a', shoe: '#1a1a1a', hat: 'casquette', hatCol: '#2a323a' },
    bio: 'Le mécanicien du funiculaire, savoyard, fier de son câble comme d’un enfant. Il graisse les poulies en sifflant La Marseillaise trop lentement.',
    traits: ['fier', 'précis', 'jovial'],
    horaire: [[6, 'n:funi_haut', 'debout'], [21, 'n:funi_haut', 'absent']],
  },
  comtesse: {
    nom: 'La comtesse de Saint-Aubin', court: 'la comtesse', prenom: 'Hortense', role: 'cliente de la chambre 108', h: false,
    look: { skin: '#ecd4c4', hair: '#c8c4c0', hairStyle: 'chignon', dress: true, top: '#2a2030', bottom: '#241c2a', shoe: '#141014', hat: 'voile', hatCol: '#1a161e', old: true, build: 'mince' },
    bio: 'Hortense de Saint-Aubin, soixante-et-un ans, veuve d’un officier de marine. Son fils Lucien, géologue, est venu lever la carte des Monts il y a deux étés ; il n’est pas redescendu. Depuis, elle loge au 108, écrit chaque matin au préfet, et passe ses soirées à la longue-vue.',
    traits: ['digne', 'acérée', 'seule'],
    horaire: [[7.5, 'ch_108', 'assis'], [8.5, 'resto_00', 'assis'], [10, 'salon_canape', 'assis'], [12.5, 'resto_00', 'assis'], [14, 'ch_108', 'assis'], [17, 'longue_vue', 'debout'], [19.5, 'resto_00', 'assis'], [21, 'salon_canape2', 'assis'], [22.5, 'ch_108', 'dort']],
  },
  wolanski: {
    nom: 'Casimir Wolański', court: 'M. Wolański', role: 'compositeur, client de la chambre 208', h: true,
    look: { skin: '#e4c8b4', hair: '#b8b0a8', hairStyle: 'long', beard: 'courte', top: '#1e2430', bottom: '#1a1e26', shoe: '#141414', coat: true, held: 'canne', build: 'mince', old: true },
    bio: 'Cinquante-sept ans, né à Lublin, exilé depuis l’insurrection de 1863 : Paris, Genève, Vienne, des pensions de famille. Phtisique, il ne peut plus marcher loin. Il est monté aux Cimes « pour respirer, ou pour finir », et pour écrire une dernière symphonie qu’il n’arrive pas à commencer.',
    traits: ['irascible', 'drôle', 'déraciné'],
    horaire: [[9, 'ch_208', 'assis'], [11, 'balcon2', 'debout'], [12.5, 'resto_10', 'assis'], [14, 'ch_208', 'dort'], [16, 'terrasse_t2', 'assis'], [18, 'salon_lecture', 'assis'], [19.5, 'resto_11', 'assis'], [21, 'piano', 'assis'], [0.5, 'ch_208', 'dort']],
  },
  treize: {
    nom: 'Étienne Rouvière', court: 'l’homme de la treize', role: 'berger, monté au col des Treize en 1854', h: true,
    look: { skin: '#c8ccd0', hair: '#d8dcdc', hairStyle: 'long', beard: 'longue', top: '#5a5248', bottom: '#4a443c', shoe: '#2a241e', coat: true, hat: 'chapeau', hatCol: '#3a342e', build: 'mince' },
    bio: 'Étienne Rouvière, berger de l’estive, trente-huit ans en 1854. Il est monté au col avec douze autres pour chercher la petite Mariette, qui s’était perdue dans la neige. Douze sont redescendus. On le recense encore chaque année.',
    traits: ['doux', 'obstiné', 'froid'],
    horaire: [[0, 'treize', 'assis']],
  },
  maitre: {
    nom: 'M. Lucas', court: 'M. Lucas', role: 'maître d’hôtel', h: true,
    look: { skin: '#e0bca0', hair: '#1a1a1a', hairStyle: 'court', beard: 'moustache', top: '#141418', bottom: '#141418', shoe: '#0a0a0a', coat: true },
    bio: 'Le maître d’hôtel : une serviette sur le bras, un sourire qu’on ne lui a jamais vu enlever.',
    traits: ['impeccable'],
    horaire: [[7, 'maitre_hotel', 'debout'], [22.5, 'maitre_hotel', 'absent']],
  },
};
const L18_ORDRE_GENS = ['directeur', 'gaspard', 'firmin', 'chef', 'odile', 'cocher', 'joseph', 'maitre', 'comtesse', 'wolanski', 'treize'];

// ---------------------------------------------------------------- les clients de passage (ceux qui demandent)
// chacun : nom, allure, ce qu'il aime (pour les conseils), un mot à son arrivée ; le niveau (réputation minimale)
const L18_CLIENTS = [
  { id: 'c_peintre', nom: 'M. Léon Arbaud', qui: 'un peintre de Lyon', gout: 'eau', niv: 0, look: { hair: '#5a3a24', beard: 'courte', top: '#6a5a3a', bottom: '#3a3228', hat: 'chapeau', hatCol: '#5a4a3a' }, mot: 'Je cherche la lumière de cinq heures. Il paraît qu’ici elle dure.' },
  { id: 'c_veuve', nom: 'Mme Delphine Roux', qui: 'une veuve de Grenoble', gout: 'priere', niv: 0, look: { dress: true, hairStyle: 'chignon', hair: '#6a6460', top: '#2a2a2a', bottom: '#222222', hat: 'voile' }, mot: 'Mon mari aimait la montagne. Moi, je n’ai jamais aimé que mon mari.' },
  { id: 'c_voyageur', nom: 'M. Prosper Bonnefoy', qui: 'un voyageur de commerce', gout: 'bourg', niv: 0, look: { hair: '#2a2420', beard: 'moustache', top: '#4a4a52', bottom: '#3a3a42', hat: 'chapeau', build: 'rond' }, mot: 'Des boutons, des rubans, des agrafes : toute la mercerie de Saint-Étienne, et pas un client là-haut !' },
  { id: 'c_famille', nom: 'Mme Blanche Morand', qui: 'une mère de famille', gout: 'facile', niv: 0, look: { dress: true, hairStyle: 'long', hair: '#8a5a2a', top: '#5a6a8a', bottom: '#4a5a7a' }, mot: 'Trois enfants, un mari qui pêche, et moi qui voudrais une heure de silence.' },
  { id: 'c_etudiant', nom: 'M. Gaston Pujol', qui: 'un étudiant en botanique', gout: 'fleurs', niv: 0, look: { hair: '#3a2a1a', top: '#5a6a4a', bottom: '#3a3a2a', hat: 'casquette', build: 'mince' }, mot: 'L’herbier de Montpellier n’a pas une seule plante de vos Monts. Pas une !' },
  { id: 'c_alpiniste', nom: 'Mr. Edward Hale', qui: 'un alpiniste anglais', gout: 'cimes', niv: 10, look: { hair: '#b8904a', beard: 'courte', top: '#6a4a2a', bottom: '#4a3a2a', hat: 'casquette', hatCol: '#6a4a2a' }, mot: 'I mean — je veux dire : vos glaciers sont-ils… comment dit-on… gravis ?' },
  { id: 'c_banquier', nom: 'M. Ernest Vallier', qui: 'un banquier parisien', gout: 'calme', niv: 20, look: { hair: '#4a4a4a', beard: 'moustache', top: '#1a1a22', bottom: '#1a1a22', coat: true, build: 'rond', hat: 'chapeau' }, mot: 'On m’a prescrit l’air des cimes. Le médecin ne m’a pas dit d’en profiter.' },
  { id: 'c_cantatrice', nom: 'Mlle Rosa Malvezzi', qui: 'une cantatrice de l’Opéra', gout: 'ruines', niv: 25, look: { dress: true, hairStyle: 'boucle', hair: '#1a1210', top: '#7a1a2a', bottom: '#6a1a24' }, mot: 'Je chante Lucia dans trois semaines. Il me faut un endroit qui fasse peur, pour la scène de la folie.' },
  { id: 'c_general', nom: 'le général de Kerlan', qui: 'un général à la retraite', gout: 'histoire', niv: 35, look: { old: true, hair: '#e0dcd4', beard: 'moustache', top: '#2a3a5a', bottom: '#8a2a24', coat: true, build: 'rond' }, mot: 'J’ai fait Sébastopol. Je ne ferai pas votre funiculaire deux fois par jour.' },
  { id: 'c_archeologue', nom: 'Mme Irène Saulnier', qui: 'une archéologue', gout: 'pierres', niv: 45, look: { dress: true, hairStyle: 'chignon', hair: '#5a4a3a', top: '#6a5a44', bottom: '#4a4034', hat: 'paille' }, mot: 'Vos pierres levées ne sont dans aucun inventaire. Je compte bien réparer cette injustice.' },
  { id: 'c_poete', nom: 'M. Aurélien Daguerre', qui: 'un poète symboliste', gout: 'nuit', niv: 60, look: { hair: '#1a1a1a', hairStyle: 'long', top: '#1a1420', bottom: '#1a1420', coat: true, build: 'mince' }, mot: 'Je suis venu entendre ce qui ne se dit pas. On m’a dit que vos nuits parlent.' },
  { id: 'c_princesse', nom: 'la princesse Obolenska', qui: 'une princesse russe', gout: 'luxe', niv: 75, look: { dress: true, hairStyle: 'chignon', hair: '#d8c8a0', top: '#e8e0f0', bottom: '#c8c0d8', hat: 'voile', hatCol: '#e8e0f0' }, mot: 'À Saint-Pétersbourg, on dit que vous êtes le meilleur concierge entre Lyon et Turin. Prouvez-le.' },
];

// ---------------------------------------------------------------- les conseils : un goût → les bons lieux (clés de w.lm), et la phrase du client
const L18_GOUTS = {
  eau: { bons: ['lac', 'phare', 'cascade', 'ponton'], dit: 'Où peindre l’eau, au soleil couchant ?' },
  priere: { bons: ['eglise', 'chapelle', 'cimetiere'], dit: 'Où puis-je prier, ou seulement m’asseoir avec mes morts ?' },
  bourg: { bons: ['marche', 'place', 'auberge', 'hameau'], dit: 'Où sont les gens qui achètent ? Un marché, une place, une auberge ?' },
  facile: { bons: ['lac', 'moulin', 'ponton', 'chene'], dit: 'Une promenade sans danger, pour trois enfants qui courent partout ?' },
  fleurs: { bons: ['estive', 'clairiere', 'foret', 'marais'], dit: 'Où trouver des plantes que personne n’a encore décrites ?' },
  cimes: { bons: ['refuge', 'glacier', 'col', 'combe'], dit: 'Le plus haut, le plus froid, le plus difficile : où ?' },
  calme: { bons: ['chene', 'clairiere', 'source', 'lac'], dit: 'Un endroit où personne ne me parlera d’argent ?' },
  ruines: { bons: ['chateau', 'hameau_abandonne', 'ruines', 'abbaye'], dit: 'Un endroit qui fasse peur, mais où l’on revient vivant ?' },
  histoire: { bons: ['chateau', 'tour', 'abbaye', 'ruines'], dit: 'De vieilles pierres qui ont vu la guerre ?' },
  pierres: { bons: ['cercle', 'dolmen', 'menhirs', 'pierre_dame'], dit: 'Des pierres levées, des tables de géants, des cercles ?' },
  nuit: { bons: ['cercle', 'cimetiere', 'vieux_puits', 'marais'], dit: 'Où la nuit est-elle la plus… bavarde ?' },
  luxe: { bons: ['bibliotheque', 'eglise', 'chateau', 'abbaye'], dit: 'Qu’y a-t-il ici qui mérite qu’on le voie deux fois ?' },
};

// ---------------------------------------------------------------- les demandes (le service à la loge)
// type : ce qu'il faut faire ; texte : ce que dit le client ({lieu}, {objet}, {ch} : chambre) ; ok : ce qu'il dit après
const L18_DEMANDES = {
  bagages: { titre: 'Monter les bagages', textes: ['Mes malles sont restées au pied de l’escalier. Chambre {ch}, je vous prie.', 'Ce garçon a disparu avec la moitié de mes bagages, et vous laisse l’autre. Chambre {ch}.', 'Ma valise, chambre {ch}. Doucement : il y a des bocaux.'], ok: ['Parfait. Vous ne l’avez pas secouée, au moins ?', 'Merci. Le garçon d’ici serait bien inspiré de vous imiter.', 'Ah ! Tout est là.'] },
  lettre: { titre: 'Porter un pli', textes: ['Ce pli doit arriver chambre {ch} sans passer par aucune autre main que la vôtre.', 'Pour la chambre {ch}. Et si l’on vous demande de qui c’est, vous ne savez pas.'], ok: ['Vous êtes un ange discret.', 'Merci. Oubliez-le, maintenant.'] },
  reserve: { titre: 'Chercher à la réserve', textes: ['Une bouteille de la cave, pour ce soir. La plus vieille que vous trouverez.', 'Des draps propres, je vous prie : ceux-ci sentent la naphtaline.', 'Un pot de confiture de myrtilles, de la réserve. On m’en a parlé jusqu’à Lyon.'], ok: ['Voilà qui fait plaisir.', 'Vous êtes descendu aux caves pour moi ? Je suis confus.'] },
  vallee: { titre: 'Une commission dans la vallée', textes: ['On m’a parlé de {objet}. Pourriez-vous m’en trouver, d’ici demain soir ?', 'Il me faudrait {objet}, de la vallée. Rien ne presse… jusqu’à demain soir.'], ok: ['Exactement ce que je voulais !', 'Vous êtes descendu jusqu’en bas ? Pour moi ?'] },
  voiture: { titre: 'Faire atteler', textes: ['Faites atteler pour moi, je descends à Valbrume après le déjeuner.', 'Une voiture, s’il vous plaît. Je ne remonterai pas dans ce funiculaire.'], ok: ['Baptiste m’attend déjà ? Merveilleux.'] },
  perdu: { titre: 'Un objet perdu', textes: ['J’ai perdu {objet}. La dernière fois que je l’ai eu, c’était {lieu}.', 'Mon {objet} ! Je l’avais {lieu}, j’en suis sûr. Ou presque sûr.'], ok: ['Vous l’avez retrouvé ! Où était-il ?', 'Oh, merci. C’était un cadeau.'] },
  dispute: { titre: 'Apaiser une querelle', textes: ['Il y a deux messieurs qui se disputent {lieu}. Faites quelque chose, je vous en prie.'], ok: ['Le calme est revenu. Comment avez-vous fait ?'] },
  secret: { titre: 'Garder un secret', textes: ['Si quelqu’un vous demande où j’étais hier soir, j’étais dans ma chambre. N’est-ce pas ?'], ok: ['Je savais que je pouvais compter sur vous.'] },
  diner: { titre: 'Arranger un dîner', textes: ['Je voudrais un dîner, ce soir, pour une personne qui compte. {gout}', 'Un dîner aux chandelles. Quelque chose de simple, mais qui dise beaucoup. {gout}'], ok: ['Le chef a fait des merveilles. Et vous aussi.'] },
  conseil: { titre: 'Donner un conseil', textes: ['{dit}'], ok: ['Je vais y aller dès demain.', 'C’est exactement ce qu’il me fallait.'] },
};
// ce qu'on peut demander dans la vallée (des choses qui existent : on les trouve, on les achète, on les pêche)
const L18_VALLEE = ['miel', 'fromage', 'edelweiss', 'truite', 'omble', 'morille', 'bouquet', 'oeuf', 'confiture', 'beurre', 'tisane', 'liqueur_gentiane', 'cidre', 'framboise', 'myrtille', 'gentiane', 'muguet', 'rose', 'lait'];
// les objets perdus, et où (des places de w.l18.places, avec la façon de le dire)
const L18_PERDUS = [['une broche de jais', 'broche'], ['un lorgnon d’écaille', 'lorgnon'], ['un gant de chevreau', 'gant'], ['un éventail de nacre', 'eventail'], ['une montre de dame', 'montre'], ['un carnet de croquis', 'carnet']];
const L18_OU = [['salon_lecture', 'au salon, près des livres'], ['piano', 'au salon, près du piano'], ['terrasse_g', 'sur la terrasse'], ['longue_vue', 'à la longue-vue'], ['bal_piano', 'dans la salle de bal'], ['resto_21', 'à la salle à manger'], ['salon_bar', 'au bar']];
// les querelles : ce que veut chacun, les trois réponses (la bonne d'abord, mélangées au jeu)
const L18_QUERELLES = [
  { de: 'la fenêtre', a: 'L’un veut la fenêtre ouverte, l’autre fermée : il fait trop chaud, il fait trop froid.', rep: ['Offrir un châle à l’un, et la table près de la fenêtre à l’autre.', 'Fermer la fenêtre : le client a toujours raison.', 'Leur demander de se taire, ou de sortir.'] },
  { de: 'le piano', a: 'L’un joue du piano, l’autre lit et ne supporte pas Chopin à dix heures du matin.', rep: ['Proposer le salon de lecture au lecteur, avec un café offert, et le piano jusqu’à midi au pianiste.', 'Fermer le piano à clé.', 'Dire au lecteur que Chopin fait du bien.'] },
  { de: 'une table', a: 'Deux familles se disputent la table près de la cheminée, réservée « depuis toujours » par chacune.', rep: ['Leur offrir la terrasse au soleil, avec le dessert de la maison, et tirer au sort la cheminée pour demain.', 'Donner la table au plus riche.', 'Laisser le maître d’hôtel se débrouiller.'] },
  { de: 'une partie de whist', a: 'Le général accuse un banquier d’avoir triché au whist ; le banquier parle de duel.', rep: ['Annoncer que la partie est déclarée nulle par la maison, et offrir une revanche au billard, demain.', 'Donner raison au général : il a fait Sébastopol.', 'Leur prêter deux pistolets.'] },
];
// les secrets : qui vient vous demander, et ce qu'il offre
const L18_SECRETS = [
  { qui: 'le directeur', dit: 'Le client de la {ch} prétend qu’il était dans sa chambre hier soir. Vous l’avez vu ?', paie: 30 },
  { qui: 'une dame en noir', dit: 'Mon mari logeait au {ch}. Était-il seul, hier soir ? Je saurai être reconnaissante.', paie: 60 },
  { qui: 'un journaliste du Petit Dauphinois', dit: 'Le client du {ch}, c’est bien lui, n’est-ce pas ? Un mot, et vous aurez cent sous.', paie: 50 },
];
// les dîners : le goût dit par le client → le bon menu (et deux autres)
const L18_DINERS = [
  { gout: 'Elle n’aime que ce qui vient d’ici.', bon: 'Truite du lac au beurre de l’alpage, morilles, tarte aux myrtilles', autres: ['Huîtres de Marennes, champagne', 'Consommé, homard à l’américaine'] },
  { gout: 'Il a l’estomac d’un oiseau, et l’orgueil d’un aigle.', bon: 'Un consommé clair, une caille, des sorbets ; et beaucoup d’argenterie', autres: ['Potée de montagne', 'Fondue au fromage de la vallée'] },
  { gout: 'Nous fêtons trente ans de mariage ; il ne s’en souvient pas.', bon: 'Le menu de leur noce, retrouvé au registre de 1859, servi sans un mot', autres: ['Un gâteau en forme de cœur', 'Le menu du jour, avec une bougie'] },
  { gout: 'C’est un ancien soldat. Il a eu faim, en 70.', bon: 'Une soupe, du pain chaud, un rôti, du vin : beaucoup, et simple', autres: ['Des mignardises', 'Un menu léger'] },
];

// ---------------------------------------------------------------- les quatre histoires
// etapes : { id, texte (le carnet), lieu (clé de w.lm, ou rien), quand (fenêtre d'heures [h0, h1], ou rien) }
// (le déroulé, les choix et les paroles sont dans 11-zzzzzzzL18-4-histoires.js, qui lit L18_PAROLES)
const L18_ARCS = {
  lucien: {
    titre: 'Lucien', qui: 'comtesse', rep: 10,
    resume: 'La comtesse de Saint-Aubin cherche son fils, monté lever la carte des Monts il y a deux étés.',
    etapes: [
      { id: 'poste', texte: 'Porter la lettre de la comtesse à la poste de Valbrume.', lieu: 'poste' },
      { id: 'auberge', texte: 'Demander à l’auberge si quelqu’un se souvient de Lucien.', lieu: 'auberge' },
      { id: 'bibliotheque', texte: 'Chercher la trace de Lucien à la bibliothèque.', lieu: 'bibliotheque' },
      { id: 'porte', texte: 'Aller à la Grande Porte, au bout de la route de Clairpré.', lieu: 'grande_porte' },
      { id: 'montre', texte: 'Rapporter la montre à la comtesse, sur la terrasse, au coucher du soleil.', quand: [16.5, 21.5] },
      { id: 'seuil', texte: 'Porter sa dernière lettre jusqu’à la Grande Porte : sur le seuil, ou de l’autre côté.', lieu: 'grande_porte' },
      { id: 'adieu', texte: 'Revoir la comtesse, au matin.', quand: [6, 11] },
    ] },
  firmin: {
    titre: 'Firmin veut voir Paris', qui: 'firmin', rep: 0,
    resume: 'Firmin, le groom, rêve des Grands Boulevards. Il lui manque une boîte, une lettre, et du courage.',
    etapes: [
      { id: 'boite', texte: 'Retrouver la boîte de Firmin (Mlle Fauvel range tout ce qui traîne).' },
      { id: 'examen', texte: 'Faire réciter à Firmin ce qu’un groom doit savoir.' },
      { id: 'lettre', texte: 'Obtenir du directeur une lettre de recommandation pour Firmin.' },
      { id: 'aile', texte: 'Firmin est entré dans l’aile Nord, cette nuit. Aller le chercher.', quand: [22, 4] },
      { id: 'choix', texte: 'Parler à Firmin de Paris, une dernière fois.' },
      { id: 'fin', texte: 'Être là pour la fin de l’histoire de Firmin, au matin.', quand: [6, 10] },
    ] },
  symphonie: {
    titre: 'La symphonie de la vallée', qui: 'wolanski', rep: 20,
    resume: 'Casimir Wolański ne peut plus marcher. Il écrira sa dernière symphonie avec les sons que vous lui rapporterez.',
    etapes: [
      { id: 'eau', texte: 'L’eau : écouter la cascade, à l’aube.', lieu: 'cascade', quand: [4.5, 8.5] },
      { id: 'cloches', texte: 'Les cloches : écouter l’église de Valbrume sonner midi.', lieu: 'eglise', quand: [11.5, 12.6] },
      { id: 'vent', texte: 'Le vent : écouter le col des Treize, la nuit.', lieu: 'col', quand: [21, 4] },
      { id: 'silence', texte: 'Le silence : écouter le cercle de pierres, à minuit.', lieu: 'cercle', quand: [23.4, 0.8] },
      { id: 'ecrire', texte: 'Rendre le carnet à M. Wolański.' },
      { id: 'preparer', texte: 'Préparer le concert : le directeur, le chef, Gaspard.' },
      { id: 'concert', texte: 'Le concert, dans la salle de bal, à neuf heures du soir.', quand: [20.5, 23.5] },
    ] },
  treize: {
    titre: 'La treize', qui: 'gaspard', rep: 35,
    resume: 'Une sonnette de trop au tableau, une chambre qui n’existe pas, et un plateau qui monte chaque soir dans l’aile fermée.',
    etapes: [
      { id: 'sonnette', texte: 'Entendre sonner la treizième sonnette, la nuit, à la loge.', quand: [22, 3] },
      { id: 'registre', texte: 'Lire les vieilles pages du registre des voyageurs.' },
      { id: 'plateau', texte: 'Être dans le couloir de service à onze heures du soir.', quand: [22.5, 23.9] },
      { id: 'porte', texte: 'Frapper à la porte de la treize.' },
      { id: 'glacier', texte: 'Chercher, au glacier des Treize, ce que la neige a gardé de Mariette.', lieu: 'glacier', quand: [4.5, 10] },
      { id: 'rendre', texte: 'Revenir à la treize.' },
      { id: 'fin', texte: 'Voir le matin se lever sur ce que vous avez décidé.', quand: [5, 9] },
    ] },
};
const L18_ORDRE_ARCS = ['firmin', 'lucien', 'symphonie', 'treize'];

// ---------------------------------------------------------------- les cinématiques (titres des souvenirs, paroles)
const L18_CINES = {
  arrivee: { titre: 'Le Grand Hôtel des Cimes', paroles: [
    ['', 'Sur le replat des monts de l’Est, au-dessus du château, un palace que personne n’attendait.'],
    ['', 'Bâti en 1868 par des Lyonnais qui croyaient à l’air des cimes. Le funiculaire est venu en 1882.'],
    ['Gaspard', 'Entrez donc. On ne mord pas. Pas le jour.'],
  ] },
  embauche: { titre: 'Les clefs croisées', paroles: [
    ['M. Brissac', 'Le dernier concierge est parti un matin sans prévenir. Tâchez de prévenir.'],
    ['Gaspard', 'Je les ai portées trente ans. Elles ne pèsent rien, et elles pèsent tout.'],
  ] },
  terrasse: { titre: 'La terrasse au couchant', paroles: [
    ['', 'La vallée entière, d’un regard : le château, les toits de Valbrume, le lac qui prend la couleur du ciel.'],
    ['La comtesse', 'Le soir, on voit tout. C’est même pour cela qu’on monte si haut : pour tout voir, sauf ce qu’on cherche.'],
  ] },
  bal: { titre: 'Le bal du Veilledi', paroles: [
    ['', 'Le Veilledi, on ouvre la salle de bal. Les lustres, les valses, les robes qui tournent.'],
    ['Gaspard', 'Regardez-les danser. Dans cent ans, il ne restera que la valse.'],
  ] },
  funiculaire: { titre: 'Le funiculaire', paroles: [
    ['Joseph', 'Cent quatre-vingts mètres de voie, vingt-deux pour cent de pente, et pas un accident. Tenez-vous quand même.'],
  ] },
  voiture: { titre: 'La voiture des Cimes', paroles: [
    ['Baptiste', 'Hue.'],
  ] },
  aile: { titre: 'L’aile Nord', paroles: [
    ['', 'Fermée depuis l’hiver 1871. Les draps sur les meubles, la poussière comme une neige d’intérieur.'],
    ['', 'Au bout du couloir du premier, une porte sans numéro.'],
  ] },
  montre: { titre: 'La montre de Lucien', paroles: [
    ['La comtesse', 'Quatre heures dix. Il était toujours en retard ; il disait que c’était la faute de la montre.'],
    ['La comtesse', 'Ne me mentez pas. Je suis trop vieille pour qu’on me ménage.'],
  ] },
  comtesse_fin: { titre: 'Le départ de la comtesse', paroles: [] },
  firmin_depart: { titre: 'Firmin s’en va', paroles: [
    ['Firmin', 'Je vous écrirai ! Avec des timbres de Paris !'],
    ['Gaspard', 'J’avais quinze ans, moi aussi, quand je suis monté. Je n’ai jamais su redescendre. Lui, il saura.'],
  ] },
  firmin_reste: { titre: 'Firmin reste', paroles: [
    ['Firmin', 'Paris, ça ne bouge pas. Ça m’attendra.'],
    ['Gaspard', 'Un second, à la loge. Le premier depuis 1890. Je vais finir par croire que j’ai bien fait de rester.'],
  ] },
  concert: { titre: 'La symphonie de la vallée', paroles: [] },
  plateau: { titre: 'Le plateau de onze heures', paroles: [
    ['', 'Onze heures. Le chef Mercadier, un plateau couvert dans les mains, ouvre la porte de l’aile avec sa clé à lui.'],
  ] },
  treize_porte: { titre: 'La porte sans numéro', paroles: [
    ['Une voix, derrière la porte', 'Vous n’êtes pas Auguste. Auguste frappe deux fois, et il ne parle pas.'],
  ] },
  treize_fin: { titre: 'Le treizième', paroles: [] },
};
const L18_ORDRE_CINES = ['arrivee', 'funiculaire', 'voiture', 'embauche', 'terrasse', 'bal', 'aile', 'plateau', 'treize_porte', 'montre', 'comtesse_fin', 'concert', 'firmin_depart', 'firmin_reste', 'treize_fin'];
// les musiques (morceaux de MUSIQUE) des scènes
const L18_MUSIQUES = {
  arrivee: 'l18_valse', embauche: 'village_dimanche', terrasse: 'pd_gymnopedie1', bal: 'l18_valse', funiculaire: 'pres_chemin', voiture: 'pres_chemin', aile: 'nuit_veilleuse',
  montre: 'pd_chopin4', comtesse_fin: 'pres_matin', concert: 'l18_symphonie', firmin_depart: 'pres_matin', firmin_reste: 'village_volets', plateau: 'nuit_claire', treize_porte: 'tenebres_yeux', treize_fin: 'pd_chopin6',
};

// ---------------------------------------------------------------- les petits textes de l'écran et des lieux
const L18_TEXTES = {
  page: 'Le Grand Hôtel', service: 'En service', passe: 'Passées', commissions: 'Commissions', histoires: 'Histoires de l’hôtel', revoir: 'Revoir',
  aucun: 'Rien encore. Le Grand Hôtel des Cimes est sur le replat des monts de l’Est ; le funiculaire part d’en bas, au bout de la route du château.',
  pasEmbauche: 'Vous n’êtes pas du personnel. M. Brissac, le directeur, cherche un concierge.',
  occupee: ['(Une voix derrière la porte : « Occupé ! »)', '(On ronfle, derrière.)', '(Un écriteau « Ne pas déranger », de travers.)', '(Personne ne répond.)'],
  sansTreize: '(Les numéros sautent de 112 à 114. Il n’y a pas de 13 dans cet hôtel.)',
  aileFermee: '(La porte de l’aile Nord est fermée à clé. On a vissé dessus une plaque de laiton : « Aile fermée ». La poignée est froide.)',
  aileCondamnee: '(Une porte condamnée, au bout du couloir. Derrière, l’aile Nord. On sent un courant d’air glacé sous la porte.)',
  treizeFermee: '(La porte n’a pas de numéro. Elle est fermée à clé, et la serrure est givrée.)',
  funiPrix: 'La course : deux pièces.', voiturePrix: 'La course jusqu’aux Cimes : six pièces.', pasDArgent: '(Vous n’avez pas de quoi payer la course.)',
  funiNuit: '(Le funiculaire ne monte pas la nuit. Joseph dort. Le chemin muletier, à côté, monte toujours.)',
  voitureNuit: '(Baptiste ne fait pas monter les chevaux la nuit. Revenez au matin.)',
  poteauBas: 'GRAND HÔTEL DES CIMES ⇧ funiculaire, 180 m · chemin muletier\nVALBRUME ⇦ par la route du château',
  poteauChateau: 'GRAND HÔTEL DES CIMES ⇨ 450 m, puis le funiculaire',
  poteauArret: 'VOITURE DES CIMES — départ à toute heure du jour, sur demande au cocher.',
};
