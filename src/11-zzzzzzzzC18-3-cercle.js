// ============================================================================
//  LE GRAND CERCLE (agent C18) — 3. LES GENS, LES PORTES, LA SUITE, LE BARON
//  - Les heures : le Cercle ouvre à six heures du soir et ferme à trois heures
//    du matin. Le portier, Siméon, tient la porte : le droit de cercle (dix
//    pièces la soirée) ou la carte de membre (trois cents, une fois pour
//    toutes) ; on n'entre pas une arme ou un outil à la main.
//  - Les gens (dessinés ici, pas menés par npcs) : la croupière de la roulette,
//    Odile (elle sait des choses qu'elle ne devrait pas savoir), les croupiers
//    du vingt-et-un, du baccara et du passe-dix, la caissière, le barman, le
//    pianiste, la directrice (Madame de Saint-Aure), et les habitués, chacun à
//    ses heures ; après minuit, au bout du bar, un homme en gris.
//  - La suite Impériale, à l'étage : louée pour la nuit (350 pièces, à la
//    caisse ou à la directrice) ou achetée (30 000 pièces, à la directrice) ; le
//    lit (on y dort), la commode (un coffre), la baignoire, le balcon sur la
//    ville ; la porte ferme à clé derrière vous.
//  - Le baron (une petite quête en quatre temps) : le carnet du secrétaire, le
//    registre du portier, la clé de la malle (la directrice), le jeton noir ;
//    après minuit, le jeton sur le zéro, et l'homme en gris peut s'en aller.
//  - Des scènes : la première fois qu'on entre au Cercle, la première fois
//    qu'on entre dans la suite, et la fin du baron (moteur de 11-zzzzzzzH17).
//  - La maison gagne, mais la croupière vous le dit, quand vous perdez trop ;
//    la caisse ne vend pas plus de 1 500 jetons par soirée.
//  État : farm.s.casino (jetons, entrée, membre, achats, nuit, suite, quête…).
//  API : c18 (S(), ouvertHeures(), present(id), dire(id, t), parler(qui),
//  louerSuite(), acheterSuite(), droitSuite(), quete()…).
// ============================================================================
const C18_HEURES = [18, 3];
const C18_ENTREE = 10, C18_CARTE = 300;
const C18_SUITE = { nuit: 350, achat: 30000 };
const C18_ARMES = new Set(['fusil', 'hache', 'hache_acier', 'fourche', 'faux', 'pioche', 'pioche_acier', 'arc', 'arc_if', 'couteau', 'serpe', 'epee', 'gourdin', 'baionnette', 'pelle', 'houe']);

defItem('c18_carte_membre', 'Carte du Grand Cercle', 'quete', 0, ['carte', '#5a1a24'], { desc: 'Un carton gravé d’or, à votre nom. Le portier vous laisse entrer sans rien demander, et vous salue d’un peu plus bas.' });
defItem('c18_carnet', 'Carnet du baron de Lancry', 'quete', 0, ['livre', '#1e1618'], { desc: 'Un carnet de maroquin noir, plein de colonnes de chiffres. En main, un clic : vous le relisez.', c18lire: 'carnet' });
defItem('c18_cle_malle', 'Petite clé de laiton', 'quete', 0, ['cle', '#b8933e'], { desc: 'La clé de la malle du baron, dans la chambre de la suite Impériale. La directrice l’avait gardée dans son corsage.' });
defItem('c18_jeton_noir', 'Jeton noir', 'quete', 0, ['rond', '#151313'], { desc: 'Un jeton d’os noirci, sans valeur gravée. Il est toujours un peu froid, même au fond de la poche.' });
defItem('c18_lettre_baron', 'Lettre du baron', 'quete', 0, ['lettre', '#dccfb2'], { desc: 'Une lettre jamais envoyée, trouvée dans la malle du baron. En main, un clic : vous la relisez.', c18lire: 'lettre' });
defItem('c18_chevaliere', 'Chevalière du baron', 'tresor', 150, ['anneau', '#c8a040'], { desc: 'Une chevalière d’or aux armes effacées. Elle ne veut pas tenir à votre doigt : elle tourne, elle tourne.' });
defItem('c18_cle_suite', 'Clé de la suite Impériale', 'quete', 0, ['cle', '#d8b048'], { desc: 'Une grosse clé dorée, à pompon de soie rouge. La suite Impériale, au Grand Cercle, est à vous.' });

const C18_TEXTES = {
  carnet: ['Le carnet du baron', 'Des colonnes de chiffres, des dates, des numéros. Roulette, toujours. Les mises montent de page en page.\n\n« 3 octobre 1879. Elle a dit dix-sept avant que la bille tombe. Dix-sept est sorti. Je n’ai pas joué le dix-sept : j’ai joué ce qu’elle ne disait pas. Perdu. »\n\n« 11 novembre. Je ne dors plus. Je descends à minuit, je remonte à trois heures. Le portier me salue comme si j’étais nouveau. »\n\n« 13 novembre. Il me reste un jeton, celui que mon père m’a laissé. Je le mettrai sur le zéro. Si le zéro sort, je pars demain par la première diligence. S’il ne sort pas, je reste. Je reste de toute façon. »\n\nLa suite est blanche.', 'E. de L.'],
  lettre: ['Une lettre sans adresse', 'Ma chère Clémence,\n\nOn ne quitte pas cette table. On croit se lever ; on se rassoit. La croupière ne vieillit pas, ou bien je vieillis pour deux.\n\nSi l’on te remet cette lettre, c’est que quelqu’un a ouvert ma malle. Qu’il garde le jeton, qu’il le joue pour moi. Le zéro. Toujours le zéro. Et qu’il ne reste pas au-delà de trois heures.\n\nTon frère, qui t’aime et qui a tout perdu, même l’heure de rentrer.', 'Edgar'],
  registre: ['Le registre du Cercle', 'Un gros registre relié de toile verte, ouvert à une page jaunie. Les noms des membres, d’une belle écriture penchée ; l’heure d’entrée, l’heure de sortie.\n\n« 13 novembre 1879. M. le baron Edgar de Lancry, suite Impériale. Entré : minuit. Sorti : — »\n\nLa ligne suivante est de la même main, la même encre. Elle date de la semaine dernière.', ''],
  regle: ['Le règlement de la suite', 'La suite Impériale se loue à la nuit, ou s’acquiert par acte. Le locataire dispose du salon, de la chambre, du cabinet de toilette et du balcon. Il est prié de ne pas décrocher le portrait.\n\nLe Cercle ferme à trois heures. Après trois heures, la suite reste ouverte à son locataire. Le reste de la maison n’est à personne.', 'La Direction'],
};

// ---------------------------------------------------------------- les gens du Cercle
// h : leurs heures (de, à) ; jeu : la table qu'ils tiennent
const C18_GENS = {
  odile: { nom: 'Odile', titre: 'la croupière', role: 'Croupière de la roulette', jeu: 'roulette', h: [18, 3], look: { dress: true, hairStyle: 'chignon', hair: '#16100e', skin: '#ecdcd2', top: '#121012', bottom: '#121012', shoe: '#0e0c0c', build: 'mince' } },
  rigobert: { nom: 'Rigobert', titre: 'le croupier du passe-dix', role: 'Croupier du passe-dix', jeu: 'des', h: [18, 3], look: { coat: true, top: '#1c1a1e', bottom: '#1c1a1e', beard: 'moustache', hair: '#5a4030', build: 'rond' } },
  valentin: { nom: 'Monsieur Valentin', titre: 'le croupier du vingt-et-un', role: 'Croupier du vingt-et-un', jeu: 'vingt', h: [18, 3], look: { coat: true, top: '#18181c', bottom: '#202022', hair: '#2a2420', build: 'mince' } },
  desire: { nom: 'Monsieur Désiré', titre: 'le banquier du baccara', role: 'Banquier du baccara', jeu: 'baccara', h: [18, 3], look: { coat: true, top: '#141418', bottom: '#141418', hair: '#c8c4bc', beard: 'courte', old: true } },
  theodule: { nom: 'Théodule', titre: 'le barman', role: 'Barman du Grand Cercle', h: [18, 3], look: { apron: '#f0ece2', top: '#e8e4dc', bottom: '#1c1a1e', hair: '#3a2a1e', beard: 'moustache' } },
  caissiere: { nom: 'Madame Crozet', titre: 'la caissière', role: 'Caissière du Grand Cercle', h: [18, 3], look: { dress: true, top: '#3a3040', bottom: '#2a2430', hairStyle: 'chignon', hair: '#8a7a6a', old: true, build: 'rond' } },
  directrice: { nom: 'Madame de Saint-Aure', titre: 'la directrice', role: 'Directrice du Grand Cercle', h: [19, 2], look: { dress: true, top: '#4a1424', bottom: '#3a0e1a', hairStyle: 'chignon', hair: '#d8d0c4', build: 'mince', height: 1.02 } },
  portier: { nom: 'Siméon', titre: 'le portier', role: 'Portier du Grand Cercle', h: [18, 3], look: { coat: true, top: '#2a3a5a', bottom: '#1e1e24', hat: 'chapeau', hatCol: '#16161a', old: true, beard: 'courte', hair: '#bab4a8', height: 1.06 } },
  pianiste: { nom: 'Monsieur Ernest', titre: 'le pianiste', role: 'Pianiste du Grand Cercle', h: [19, 1], look: { coat: true, top: '#1e1c1e', bottom: '#1e1c1e', hair: '#e0dcd4', old: true, build: 'mince' } },
  notaire: { nom: 'Maître Bourdaleau', titre: 'un notaire', role: 'Notaire, habitué de la roulette', h: [19, 1], look: { coat: true, top: '#2e2a26', bottom: '#2a2620', hat: 'chapeau', build: 'rond', beard: 'courte', hair: '#7a6a5a' } },
  pelagie: { nom: 'Madame Pélagie', titre: 'une vieille dame', role: 'Habituée du bandit manchot', h: [18, 3], look: { dress: true, old: true, top: '#5a4a5a', bottom: '#3a2e3a', hat: 'voile', hatCol: '#2a2028', build: 'mince', height: 0.94 } },
  capitaine: { nom: 'le capitaine Ravenel', titre: 'un officier', role: 'Officier en demi-solde', h: [21, 3], look: { coat: true, top: '#2a3a6a', bottom: '#8a2a26', beard: 'moustache', hair: '#5a5048' } },
  comtesse: { nom: 'la comtesse', titre: 'une dame voilée', role: 'Joueuse de baccara', h: [22, 2], look: { dress: true, top: '#1a2a3a', bottom: '#1a2a3a', hat: 'voile', hatCol: '#0e0e12', build: 'mince' } },
  coquard: { nom: 'le jeune Coquard', titre: 'un jeune homme', role: 'Fils du minotier', h: [19, 24], look: { top: '#6a5a40', bottom: '#4a3c30', hat: 'casquette', hatCol: '#3a3430', hair: '#c89a50', build: 'mince', height: 0.98 } },
  docteur: { nom: 'le docteur Malzieu', titre: 'un vieux monsieur', role: 'Médecin retiré', h: [20, 2], look: { coat: true, top: '#3a3a3a', bottom: '#2a2a2a', beard: 'longue', hair: '#a8a49a', old: true } },
  gris: { nom: 'l’homme en gris', titre: 'un homme en gris', role: '—', h: [0, 3], look: { coat: true, top: '#7a7a78', bottom: '#6a6a68', skin: '#d8d4cc', hair: '#9a9894', hat: 'chapeau', hatCol: '#5a5a58', build: 'mince', height: 1.04 } },
};
// ce qu'ils disent ({prenom}, {bete}, {ville}, {jour}, {perdu})
const C18_PAROLES = {
  odile: {
    salut: ['Odile. On ne retient pas mon nom, d’habitude. Vous, vous le retiendrez.'],
    ordinaire: ['Vous avez de la terre sous les ongles, {prenom}. De la bonne terre. Elle vous attend.', '{bete} a mangé du chardon, près de la clôture. Elle n’en mourra pas. Pas cette fois.', 'Le dix-sept est fatigué, ce soir. Laissez-le dormir.', 'Je suis à cette table depuis toujours. C’est-à-dire depuis hier soir.', 'On ne gagne pas contre une roue, {prenom}. On gagne contre l’heure.', 'Vous avez laissé une lampe allumée chez vous. Non ? Alors quelqu’un l’a fait pour vous.'],
    faites: ['« Faites vos jeux. »', '« Messieurs, mesdames, faites vos jeux. »', '« Faites vos jeux, {prenom}. »'],
    riennevaplus: ['« Rien ne va plus. »', '« Les jeux sont faits. Rien ne va plus. »'],
    conseil: ['Rentrez, {prenom}. La maison gagne toujours ; c’est écrit au-dessus de la porte, en latin, pour que personne ne le lise.', 'Vous avez perdu {perdu} pièces ce soir. Les poules n’attendent pas, elles.'],
    minuit: ['Après minuit, on ne joue plus tout à fait pour de l’argent.', 'Il est descendu. Ne vous retournez pas.'],
  },
  rigobert: { salut: ['Rigobert, pour vous servir ! Trois dés, deux chances, et la banque prend les brelans. C’est le jeu.'], ordinaire: ['Les dés n’ont pas de mémoire. Moi, si.', 'Passe ou manque, mon brave, c’est la vie entière.'], accueil: ['« Passe ou manque ? Les brelans sont pour la banque ! »'], lance: ['« Les dés roulent ! »', '« Et hop, dans le cornet ! »'], perdu: ['« Brelan… non : manque. La banque ramasse. »', 'La banque ramasse.'] },
  valentin: { salut: ['Valentin. Je donne les cartes, je ne les fabrique pas.'], ordinaire: ['Restez à seize contre un dix, si vous aimez perdre lentement.', 'Le sabot ne finit jamais. Ne cherchez pas à compter.'], accueil: ['« Vingt-et-un. Le croupier tire à seize et sur dix-sept souple. »'], perdu: ['La banque gagne.', 'Une autre ?'] },
  desire: { salut: ['Désiré, banquier. Oui, comme le prénom. Personne ne me désire depuis longtemps.'], ordinaire: ['La cagnotte prend sa part. Sans la cagnotte, il n’y aurait pas de lustres.', 'Le punto, la banque. Choisissez un camp, c’est plus reposant.'], accueil: ['« Punto, banque, égalité. La cagnotte prend sept et demi. »'], donne: ['« Cartes. »'], perdu: ['La banque l’emporte.', 'Ce sera pour la prochaine.'] },
  theodule: { salut: ['Théodule. Si vous avez soif, je suis là ; si vous avez des ennuis, je ne suis pas là.'], ordinaire: ['L’homme du bout du bar ? Quel homme ?', 'Madame la directrice boit du lait chaud. Ne le répétez pas.'], accueil: ['Qu’est-ce que je vous sers ?'], offert: ['Celui-ci est pour la maison. Vous avez assez donné ce soir.'] },
  caissiere: { salut: ['Madame Crozet, à la caisse. Je compte les jetons depuis trente ans ; ils ne me comptent pas.'], ordinaire: ['Un jeton vaut une pièce. Dans ce sens-là comme dans l’autre.'], accueil: ['Bonsoir. Des jetons ? Nous en avons de toutes les couleurs, et ils valent tous la même chose.', 'Bonsoir. On achète, on change, on ne fait pas crédit.'] },
  directrice: { salut: ['Apolline de Saint-Aure. Mon mari a fondé ce Cercle ; je le tiens. On ne dit pas « casino » ici, on dit « le Cercle ».'], ordinaire: ['La suite Impériale ? Elle porte ce nom depuis que l’Empereur ne l’a pas visitée, en cinquante-huit.', 'On joue mieux quand on a bien dîné. On perd mieux aussi.', 'Mon mari disait : « La maison ne triche pas. Elle attend. »'] },
  portier: { salut: ['Siméon, portier. Quarante ans à cette porte, et la porte n’a pas bougé.'], ordinaire: ['Bonsoir. La tenue est correcte, l’humeur aussi. Entrez.', 'Il fait frais. Dedans, il fait toujours la même température. Toujours.'] },
  pianiste: { salut: ['…'], ordinaire: ['(Il joue sans regarder ses mains. Il ne regarde rien.)', '(Il vous adresse un signe de tête, sans manquer une note.)', '« Une valse lente. Toujours la même. On ne me demande jamais autre chose. »'] },
  notaire: { salut: ['Maître Bourdaleau, notaire. Je fais les testaments le jour, je les justifie la nuit.'], ordinaire: ['Le rouge est sorti sept fois. Il sortira donc le noir. C’est mathématique. (Le rouge sort.)', 'Ma femme me croit au conseil de fabrique.'] },
  pelagie: { salut: ['Pélagie. J’ai soixante-dix-neuf ans et cette machine m’en doit trois cents.'], ordinaire: ['Elle va payer, elle va payer. Elle paie toujours à celle qui reste.', 'Trois cloches, en quatre-vingt-trois. Je m’en souviens comme de ma noce.'] },
  capitaine: { salut: ['Ravenel, capitaine. En demi-solde, et en demi-tout, depuis Sedan.'], ordinaire: ['On m’a appris à ne jamais reculer. Au vingt-et-un, c’est un défaut.', 'Seize contre un dix. On tire. Toujours on tire.'] },
  comtesse: { salut: ['(Elle tourne vers vous son voile, sans rien dire.)'], ordinaire: ['« Banque. »', '(Elle pose une plaque noire sur la banque, sans regarder.)', '« Vous êtes nouveau. Les nouveaux gagnent. Une fois. »'] },
  coquard: { salut: ['Coquard. Le fils du minotier. Enfin, le fils du moulin, maintenant que le moulin est vendu.'], ordinaire: ['J’ai mis le pré du bas sur le brelan de six. Il n’est pas sorti. Le pré non plus, d’ailleurs.', 'Demain, je rachète tout. Demain.'] },
  docteur: { salut: ['Malzieu. Docteur, autrefois. Je ne joue plus : je regarde jouer, c’est plus instructif.'], ordinaire: ['Voyez-vous la croupière ? Je l’ai vue en soixante-dix. Elle n’a pas pris une ride. Moi, j’ai pris les siennes.', 'Le jeu est une fièvre. On ne la soigne pas : on attend qu’elle tombe.'] },
  gris: { salut: ['(Il ne répond pas. Il regarde la roulette.)'], ordinaire: ['(Il ne répond pas. Son verre est plein, et il ne boit pas.)'] },
};

const c18 = {
  rigs: {}, presT: 0, presC: {}, majT: 0, ambT: 4, pianoT: 12, lumOuv: null, nivJ: null, anim: null,
  // ------------------------------------------------------------- l'état
  S() {
    const s = typeof farm !== 'undefined' && farm.s;
    if (!s) return null;
    let S = s.casino;
    if (!S || typeof S !== 'object') S = s.casino = {};
    if (!(S.jetons >= 0)) S.jetons = 0;
    if (!S.suite || typeof S.suite !== 'object') S.suite = {};
    if (!S.suite.coffre || typeof S.suite.coffre !== 'object') S.suite.coffre = {};
    if (!S.vus || typeof S.vus !== 'object') S.vus = {};
    if (!S.quete || typeof S.quete !== 'object') S.quete = { e: 0 };
    return S;
  },
  C() { const w = game.world; return w && w.c18 && w.bld && w.bld.casino ? w.c18 : null; },
  W(lx, ly, lz) { const C = this.C(); if (!C) return [0, 0, 0]; const [x, z] = b1W(C.f, lx, lz); return [x, C.f.y + ly, z]; },
  heure() { return typeof npcs !== 'undefined' && npcs.hour ? npcs.hour() : 12; },
  nuitCle() { const s = farm.s, h = this.heure(); return h >= 12 ? s.day : s.day - 1; },
  dans(h, a, b) { return a <= b ? h >= a && h < b : h >= a || h < b; },
  ouvertHeures() { return this.dans(this.heure(), C18_HEURES[0], C18_HEURES[1]); },
  // ------------------------------------------------------------- qui est là
  present(id) {
    const G = C18_GENS[id], h = this.heure();
    if (!G || !this.C()) return false;
    if (id === 'gris') return this.grisLa();
    return this.dans(h, G.h[0], G.h[1]);
  },
  grisLa() {
    const S = this.S();
    if (!S || S.quete.e >= 5 || this.cineGris) return false;
    const h = this.heure();
    if (!(h >= 0 && h < 3)) return false;
    // il n'est là que de loin
    const p = game.player.pos, P = this.posGens('gris');
    return !!P && Math.hypot(p[0] - P[0], p[2] - P[2]) > 3.6;
  },
  grisHeure() { const S = this.S(), h = this.heure(); return !!S && S.quete.e < 5 && !this.cineGris && h >= 0 && h < 3; },
  // le grand escalier, d'un trait (comme l'échelle de meunier de 11-zzzzB1-ville.js : on voit les marches passer)
  monter(it) {
    const d = it.data, p = game.player;
    if (typeof b1 === 'undefined' || b1.anim || game.sleeping || game.dying || p.riding || (typeof cine !== 'undefined' && cine.on) || !d || !d.to) return;
    const haut = d.sens === 'haut', A = haut ? d.pied : d.haut, Bv = haut ? d.haut : d.pied;
    const d0 = Math.hypot(A[0] - p.pos[0], A[2] - p.pos[2]);
    b1.anim = {
      t: 0, sonY: A[1], i: 0, yaw0: p.yaw, pitch0: p.pitch,
      segs: [
        { a: null, b: A, dur: clamp(0.2 + d0 * 0.35, 0.2, 0.9), yaw: d.yaw, pitch: haut ? 0.12 : -0.2 },
        { a: null, b: Bv, dur: 2.4, yaw: d.yaw, pitch: haut ? 0.1 : -0.18, barreaux: true },
        { a: null, b: d.to, dur: 0.5, yaw: d.yaw, pitch: 0 },
      ],
    };
    game.sleeping = true; p.vel = [0, 0, 0];
  },
  croupierDe(jeu) { for (const k in C18_GENS) if (C18_GENS[k].jeu === jeu) return k; return null; },
  croupierLa(jeu) { const k = this.croupierDe(jeu); return !k || this.present(k); },
  pelagieLa() { return this.present('pelagie'); },
  posGens(id) { const C = this.C(), g = C && C.gens[id]; return g ? this.W(g.lx, C18_Y.sol, g.lz) : null; },
  posJeu(jeu) { const g = this.C() && this.C().gens[this.croupierDe(jeu) || 'odile']; return g ? this.W(g.lx, 1.5, g.lz) : null; },
  nomDe(id) { const G = C18_GENS[id], S = this.S(); if (!G) return ''; return S && S.vus['p:' + id] ? G.nom.charAt(0).toUpperCase() + G.nom.slice(1) : G.titre.charAt(0).toUpperCase() + G.titre.slice(1); },
  // une phrase de quelqu'un (les mots remplacés)
  replique(id, cle) {
    const P = C18_PAROLES[id], L = P && (P[cle] || P.ordinaire);
    return L ? this.fmt(pick(L)) : '';
  },
  fmt(t) {
    const s = farm.s, S = this.S();
    const betes = (s.animals || []).filter((a) => !a.dead && a.name).map((a) => a.name);
    const perdu = S && S.nuit && S.nuit.k === this.nuitCle() ? Math.max(0, -S.nuit.net) : 0;
    return String(t).replace(/\{prenom\}/g, s.prenom || (s.fem ? 'madame' : 'monsieur')).replace(/\{bete\}/g, betes.length ? pick(betes) : 'Votre chien').replace(/\{ville\}/g, (farm.names && farm.names.ville) || 'la ville').replace(/\{jour\}/g, s.day).replace(/\{perdu\}/g, perdu);
  },
  dire(id, texte, dur) { ui.subtitle(id ? this.nomDe(id) : '', texte, dur || 3.5); },
  voix(id, pos) { try { if (sound.whisper) sound.whisper(0, 0.25); } catch (e) { /* rien */ } void id; void pos; },
  decouvrir(id, k) { try { if (typeof decouvertes !== 'undefined' && decouvertes.voir) { if (k && decouvertes.apprendre) decouvertes.apprendre(id, k); else decouvertes.voir(id, k); } } catch (e) { console.error('C18 découvertes', e); } },
  // ------------------------------------------------------------- les comptes d'une soirée
  nuit() { const S = this.S(), k = this.nuitCle(); if (!S.nuit || S.nuit.k !== k) S.nuit = { k, net: 0, mise: 0 }; return S.nuit; },
  compter(n) { const N = this.nuit(); N.net += n; },
  coup(jeu, mise, rendu, res) {
    const S = this.S(), N = this.nuit();
    S.mises = (S.mises || 0) + mise; S.rendus = (S.rendus || 0) + rendu; S.coups = (S.coups || 0) + 1;
    const J = (S.parJeu || (S.parJeu = {}))[jeu] || (S.parJeu[jeu] = { m: 0, r: 0, n: 0 });
    J.m += mise; J.r += rendu; J.n++;
    N.mise += mise;
    if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(rendu > mise ? 0.4 : -0.15, 'jeu', 1.2);
    this.decouvrir('li:casino', 'jeux');
    // la croupière vous le dit, quand vous perdez trop (une fois par soirée)
    if (N.net <= -400 && !N.conseil && this.present('odile')) { N.conseil = 1; setTimeout(() => this.dire('odile', this.replique('odile', 'conseil'), 6), 1800); }
    void res;
  },
  odileDevine() {
    const N = this.nuit(), h = this.heure();
    if (N.devine || !(h >= 0 && h < 3) || Math.random() > 0.3) return false;
    N.devine = 1;
    return true;
  },
  // ------------------------------------------------------------- où est le joueur
  local() { const C = this.C(); if (!C) return null; const p = game.player.pos, [lx, lz] = b1L(C.f, p[0], p[2]); return { lx, lz, y: p[1] - C.f.y }; },
  dedans() { const L = this.local(); return !!L && Math.abs(L.lx) < C18_LOT.W / 2 && Math.abs(L.lz) < C18_LOT.D / 2 && L.y > -0.5 && L.y < 8.3; },
  dansSalle() { const L = this.local(); return this.dedans() && L.y < 3; },
  dansSuite() { const L = this.local(); return this.dedans() && L.y > C18_Y.etage - 0.6 && L.lx < C18_ESC.x0 - 0.1; },
  // ------------------------------------------------------------- la suite : à qui elle est
  droitSuite() { const S = this.S(); return !!S && (S.suite.proprio || S.suite.loue === this.nuitCle()); },
  suiteLouable() { const S = this.S(); return !!S && !S.suite.proprio && S.suite.loue !== this.nuitCle() && this.ouvertHeures(); },
  louerSuite(par) {
    const S = this.S();
    if (!this.suiteLouable()) { ui.close(); return; }
    if (!farm.pay(C18_SUITE.nuit)) { ui.close(); this.dire(par, 'La suite est à trois cent cinquante pièces la nuit. Le prix ne se discute pas ; il se paie.', 4); return; }
    S.suite.loue = this.nuitCle(); S.suite.locations = (S.suite.locations || 0) + 1;
    sound.coin && sound.coin(); setTimeout(() => sound.lock && sound.lock(false), 250);
    ui.close();
    this.dire(par, par === 'directrice' ? 'La suite est à vous jusqu’à midi. Le grand escalier, au fond à droite. Le portrait ne mord pas.' : 'Voilà la clé. La suite est à vous jusqu’à demain midi. Le grand escalier, au fond à droite.', 5);
    this.majPortes();
  },
  acheterSuite() {
    const S = this.S(), s = farm.s;
    if (S.suite.proprio) { ui.close(); return; }
    if (!farm.pay(C18_SUITE.achat)) { ui.close(); this.dire('directrice', 'Trente mille pièces, comptant. Revenez quand votre bas de laine aura grossi.', 4); return; }
    S.suite.proprio = true; S.suite.jour = s.day;
    if (!farm.count('c18_cle_suite')) farm.give('c18_cle_suite', 1);
    sound.coin && sound.coin();
    ui.close();
    farm.mail('Le Grand Cercle', 'Acte de vente — la suite Impériale', `Par-devant notaire, Madame Apolline de Saint-Aure, directrice du Grand Cercle de ${(farm.names && farm.names.ville) || 'la ville'}, vend à ${s.prenom || 'l’occupant de la vieille ferme'}, qui accepte, la suite dite Impériale, au premier étage du Cercle, avec son mobilier, son balcon et son portrait, pour la somme de ${C18_SUITE.achat} pièces, payée comptant.\n\nL’acquéreur y entre à toute heure. Il ne pourra exiger du Cercle qu’il reste ouvert au-delà de trois heures.\n\nMaître Bourdaleau, témoin. (Il a signé sans lever les yeux de la roulette.)`);
    this.dire('directrice', 'Félicitations. Vous êtes le second propriétaire de cette suite. Le premier ne l’a jamais quittée.', 5);
    this.majPortes();
  },
  // ------------------------------------------------------------- les portes
  majPortes() {
    const C = this.C(), w = game.world;
    if (!C || !farm.s) return;
    const S = this.S(), inside = this.dedans(), p = game.player.pos;
    const E = w.doors[C.portes.entree], U = w.doors[C.portes.suite], Bl = w.doors[C.portes.balcon];
    if (E) {
      const ok = inside || S.suite.proprio || S.suite.loue === this.nuitCle() || (this.ouvertHeures() && (S.entree === this.nuitCle() || S.membre));
      E.locked = !ok; E.forced = false;
      const dE = Math.hypot(p[0] - E.x, p[2] - E.z);
      if (!ok && E.open && dE > 2) { E.open = 0; }
      // le portier vous ouvre quand vous arrivez ou repartez, et referme quand vous êtes loin
      if (ok && this.present('portier') && dE < 3.2 && !E.open && !E.playerClosed) { E.open = 1; sound.door && sound.door(true); }
      else if (E.open && dE > 7 && this.present('portier')) E.open = 0;
      if (dE > 7) E.playerClosed = false;
    }
    if (U) {
      const ok = this.droitSuite() || this.dansSuite();
      U.locked = !ok;
      if (!ok && U.open && Math.hypot(p[0] - U.x, p[2] - U.z) > 2) U.open = 0;
    }
    if (Bl) Bl.locked = false;
  },
  // E sur une porte du Cercle
  porte(dr, suite) {
    const C = this.C();
    if (dr.c18 === 'entree' && dr.locked) {
      if (this.dedans()) { dr.locked = false; dr.open = 1; sound.door(true); return true; }
      if (!this.ouvertHeures()) { ui.read('Une plaque de cuivre', `Grand Cercle de ${(farm.names && farm.names.ville) || 'la ville'}\nfondé en 1852\n\nOuvert de six heures du soir à trois heures du matin.\nTenue correcte exigée.\nLa maison ne fait pas crédit.`, ''); return true; }
      this.portier(dr); return true;
    }
    if (dr.c18 === 'suite' && dr.locked) {
      if (this.dansSuite()) { dr.locked = false; dr.open = 1; sound.door(true); return true; }
      ui.subtitle('', '(La porte de la suite Impériale. Fermée à clé : une serrure anglaise, à gorges, qu’on ne crochète pas. La clé est en bas, chez la directrice.)', 4);
      return true;
    }
    void C; void suite;
    return false;
  },
  // ------------------------------------------------------------- le portier
  armeEnMain() { const id = farm.s.hand; return id && (C18_ARMES.has(id) || (ITEMS[id] && /fusil|arc|epee|lance|sabre/.test(id))) ? id : null; },
  portier(dr) {
    const S = this.S(), s = farm.s;
    if (!this.present('portier')) { ui.subtitle('', '(Personne à la porte.)', 2.5); return; }
    this.rencontrer('portier');
    const ouvrir = () => { const d = dr || game.world.doors[this.C().portes.entree]; if (d) { d.locked = false; d.open = 1; sound.door(true); } };
    const arme = this.armeEnMain();
    if (arme) { this.dire('portier', `On n’entre pas au Cercle avec ${itemName(arme).toLowerCase()} à la main. Rangez-moi ça.`, 4); return; }
    if (S.suite.proprio || S.membre || S.entree === this.nuitCle() || S.suite.loue === this.nuitCle()) {
      S.entree = this.nuitCle();
      const salut = S.suite.proprio ? (s.fem ? 'Madame est chez elle.' : 'Monsieur est chez lui.') : pick(['Bonne soirée.', 'Bonsoir. Les tables sont chaudes.', 'Entrez. Il fait bon, dedans.']);
      if (S.quete.e === 1) { ui.choice(this.nomDe('portier'), salut, [{ label: 'Demander au portier s’il a connu le baron de Lancry', fn: () => this.queteRegistre() }, { label: 'Entrer', fn: () => { ui.close(); ouvrir(); this.majPortes(); } }]); return; }
      this.dire('portier', salut, 2.5);
      if (!this.dedans()) ouvrir();
      this.majPortes(); return;
    }
    const opts = [];
    if (s.money >= C18_ENTREE) opts.push({ label: `Payer le droit de cercle (${C18_ENTREE} pièces)`, fn: () => { if (!farm.pay(C18_ENTREE)) return ui.close(); S.entree = this.nuitCle(); sound.coin && sound.coin(); ui.close(); this.dire('portier', 'Merci. Bonne soirée. La caisse est à gauche en entrant.', 3); ouvrir(); this.majPortes(); } });
    if (s.money >= C18_CARTE) opts.push({ label: `Prendre la carte de membre (${C18_CARTE} pièces, pour toujours)`, fn: () => { if (!farm.pay(C18_CARTE)) return ui.close(); S.membre = true; S.entree = this.nuitCle(); farm.give('c18_carte_membre', 1); sound.coin && sound.coin(); ui.close(); this.dire('portier', 'Bienvenue au Cercle. Votre carte. Je ne vous la demanderai plus : je vous reconnaîtrai.', 4); ouvrir(); this.majPortes(); } });
    if (S.quete.e === 1) opts.push({ label: 'Demander au portier s’il a connu le baron de Lancry', fn: () => this.queteRegistre() });
    opts.push({ label: 'Repartir', fn: () => ui.close() });
    ui.choice(this.nomDe('portier'), this.fmt(S.vus['p:portier'] > 1 ? 'Bonsoir. Le droit de cercle est de dix pièces pour la soirée. Les membres entrent sans payer.' : 'Bonsoir. Siméon, portier du Grand Cercle. Le droit de cercle est de dix pièces pour la soirée ; la carte de membre, trois cents, une fois pour toutes.'), opts);
  },
  rencontrer(id) {
    const S = this.S();
    S.vus['p:' + id] = (S.vus['p:' + id] || 0) + 1;
    this.decouvrir('pnj:c18_' + id, 'metier');
  },
  // ------------------------------------------------------------- parler
  parler(qui) {
    const S = this.S();
    if (!this.present(qui)) { if (qui === 'gris') ui.subtitle('', '(Le tabouret est vide. Le verre, à moitié plein, est encore tiède.)', 3.5); return; }
    const premier = !S.vus['p:' + qui];
    this.rencontrer(qui);
    if (qui === 'portier') return this.portier(null);
    if (qui === 'directrice') return this.directrice();
    if (qui === 'odile' && S.quete.e === 4) return this.odileJeton();
    if (qui === 'caissiere') { if (premier) this.dire(qui, this.replique(qui, 'salut'), 5); else c18Jeux.caisse(); return; }
    if (qui === 'theodule' && !premier) return c18Jeux.bar();
    const h = this.heure();
    let t = premier ? this.replique(qui, 'salut') : this.replique(qui, 'ordinaire');
    if (qui === 'odile' && !premier && h >= 0 && h < 3 && Math.random() < 0.4) t = this.replique('odile', 'minuit');
    if (qui === 'odile' && !premier && S.quete.e >= 1 && S.quete.e < 4 && Math.random() < 0.5) t = 'Le baron ? Il jouait le zéro. Il le joue encore. Demandez à Siméon, il tient le registre.';
    if (qui === 'gris') { S.quete.vuGris = 1; }
    this.dire(qui, this.fmt(t), Math.min(7, 2.5 + t.length / 28));
  },
  directrice() {
    const S = this.S(), s = farm.s, opts = [];
    if (this.suiteLouable()) opts.push({ label: `Louer la suite Impériale pour la nuit (${C18_SUITE.nuit} pièces)`, fn: () => this.louerSuite('directrice') });
    if (!S.suite.proprio) opts.push({ label: `Acheter la suite Impériale (${C18_SUITE.achat} pièces)`, fn: () => (s.money >= C18_SUITE.achat ? ui.choice(this.nomDe('directrice'), 'Trente mille pièces, et la suite est à vous : le salon, la chambre, la salle de bains, le balcon, et le portrait. On ne revend pas une suite Impériale. Vous êtes sûr ?', [{ label: 'Signer l’acte', fn: () => this.acheterSuite() }, { label: 'Réfléchir encore', fn: () => ui.close() }]) : (ui.close(), this.dire('directrice', 'Trente mille pièces, comptant. On ne loue pas un rêve à crédit.', 4))) });
    if (S.quete.e === 2) opts.push({ label: 'Parler de la malle du baron', fn: () => this.queteCle() });
    opts.push({ label: 'Lui souhaiter une bonne soirée', fn: () => ui.close() });
    const first = (S.vus['p:directrice'] || 0) <= 1;
    ui.choice(this.nomDe('directrice'), this.fmt(first ? C18_PAROLES.directrice.salut[0] : this.replique('directrice', 'ordinaire')), opts);
  },
  // ------------------------------------------------------------- la suite : le lit, la commode, le bain, le balcon, les papiers
  suite(quoi) {
    const S = this.S(), a = this.droitSuite();
    switch (quoi) {
      case 'lit':
        if (!a) { ui.subtitle('', '(Un lit pour un empereur. Pas pour vous, pas ce soir : la suite n’est pas à vous.)', 3.5); return; }
        S.suite.coucher = farm.s.day;
        game.trySleep('location');
        return;
      case 'coffre':
        if (!a) { ui.subtitle('', '(Les tiroirs sont fermés à clé.)', 2.5); return; }
        ui.openStore('La commode de la suite', S.suite.coffre, 'chest');
        return;
      case 'bain': return this.bain(a);
      case 'balcon': return this.balcon();
      case 'secretaire': return this.queteCarnet(a);
      case 'malle': return this.queteMalle(a);
      case 'portrait':
        ui.read('Le portrait', S.quete.e >= 5 ? 'Un cadre doré, une toile sombre, un fauteuil vide. Sur le petit cartouche de cuivre : « M. le baron E. de Lancry, 1879 ». Il n’y a plus personne dans le tableau.\n\nVous êtes presque sûr qu’il y avait quelqu’un.' : 'Un homme en noir, maigre, la moustache cirée, assis de trois quarts. Dans la main gauche, entre deux doigts, un jeton noir. Sur le cartouche de cuivre : « M. le baron E. de Lancry, 1879 ».\n\nLe peintre a mis trop de blanc dans les yeux. On dirait qu’il regarde la porte.', '');
        return;
    }
  },
  bain(a) {
    const C = this.C(), w = game.world;
    if (!a) { ui.subtitle('', '(La baignoire de cuivre brille. Ce n’est pas votre baignoire.)', 3); return; }
    const S = this.S();
    if (S.suite.bain === farm.s.day) { ui.subtitle('', '(Vous avez déjà pris votre bain aujourd’hui. La peau des doigts s’en souvient.)', 3); return; }
    S.suite.bain = farm.s.day;
    const q = C && w.props[C.baignoire];
    (async () => {
      if (q) { q.data = Object.assign({}, q.data, { eau: true }); farm.dirtyProps = true; }
      try { sound.splash && sound.splash(); } catch (e) { /* rien */ }
      await ui.fade(true, 'L’eau est si chaude que vous manquez de vous endormir.', 900);
      await new Promise((r) => setTimeout(r, 1500));
      if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(2, 'un bain chaud', 4);
      const p = game.player; if (p) p.hp = Math.min(100, (p.hp || 0) + 15);
      await ui.fade(false, '', 900);
      if (q) setTimeout(() => { q.data = Object.assign({}, q.data, { eau: false }); farm.dirtyProps = true; }, 30000);
      if (S.quete.e < 5 && this.heure() >= 0 && this.heure() < 5 && Math.random() < 0.5) ui.subtitle('', '(Sur la buée du miroir, un zéro. Vous ne l’avez pas tracé.)', 5);
    })();
  },
  balcon() {
    const C = this.C(), T = game.world.townInfo;
    if (!C || !T || typeof h17Cine === 'undefined') return;
    const y = C.f.y + C18_Y.etage + 1.6, a = this.W(0, C18_Y.etage + 1.65, -C18_LOT.D / 2 - 0.9), cible = [T.x, C.f.y + 2.5, T.z];
    const h = this.heure(), nuit = h >= 20 || h < 6;
    const t = nuit ? (this.ouvertHeures() ? 'En bas, les fiacres qu’on n’entend pas, les rires sous la marquise. Les réverbères de la grand-rue, jusqu’à la place. Au-delà des remparts, le noir.' : 'La ville dort. Une seule fenêtre allumée, là-bas, du côté du rempart nord. Elle s’éteint quand vous la regardez.') : 'La grand-rue, le marché, la fontaine de la place, les toits d’ardoise et de tuiles. Plus loin, au-dessus des remparts, la vallée.';
    h17Cine.jouer([{ dur: 7, de: { pos: a, look: cible }, a: { pos: [a[0] - 0.3, y + 0.15, a[2] + 0.4], look: [cible[0], cible[1] + 3, cible[2]] }, texte: t }], { passer: true });
  },
  // ------------------------------------------------------------- LE BARON (la quête)
  queteCarnet(a) {
    const S = this.S();
    if (!a) { ui.subtitle('', '(Le secrétaire est fermé. Le locataire de la suite en a l’usage.)', 3); return; }
    if (S.quete.e === 0) {
      S.quete.e = 1; S.quete.j = farm.s.day;
      farm.give('c18_carnet', 1);
      sound.page && sound.page();
      this.lire('carnet');
      this.decouvrir('sys:c18_baron');
      return;
    }
    ui.read(...C18_TEXTES.regle);
  },
  queteRegistre() {
    const S = this.S();
    S.quete.e = 2;
    ui.close();
    this.dire('portier', 'Le baron ? (Il ouvre le registre sans chercher la page.) Je tenais déjà la porte. Madame Odile tenait déjà la roulette. Voyez vous-même.', 5);
    setTimeout(() => ui.read(...C18_TEXTES.registre), 1600);
    setTimeout(() => { if (!ui.panel) this.dire('portier', 'Sa malle est restée là-haut. Madame la directrice a la clé. Elle ne s’en sépare pas.', 5); }, 9000);
  },
  queteCle() {
    const S = this.S();
    if (!(S.suite.locations > 0 || S.suite.proprio)) { ui.close(); this.dire('directrice', 'La malle du baron est dans la chambre de la suite. Je ne donne pas la clé aux gens qui ne dorment pas là-haut.', 5); return; }
    S.quete.e = 3;
    farm.give('c18_cle_malle', 1);
    ui.close();
    this.dire('directrice', 'Tenez. Je la porte sur moi depuis que mon mari est mort, et lui depuis soixante-dix-neuf. Si vous l’ouvrez, ne me dites pas ce qu’il y a dedans.', 6);
  },
  queteMalle(a) {
    const S = this.S(), C = this.C(), w = game.world;
    if (!a && S.quete.e < 3) { ui.subtitle('', '(Une malle de voyage cerclée de laiton, aux initiales E. L. Fermée à clé.)', 3.5); return; }
    if (S.quete.e < 3) { ui.subtitle('', '(Une malle de voyage cerclée de laiton, aux initiales E. L. Fermée à clé. Le portier saura peut-être à qui elle était.)', 4); if (S.quete.e === 0) S.quete.vuMalle = 1; return; }
    if (S.quete.e === 3) {
      if (!farm.count('c18_cle_malle')) { ui.subtitle('', '(Fermée à clé.)', 2.5); return; }
      farm.take('c18_cle_malle', 1);
      S.quete.e = 4; S.quete.malle = 1;
      const q = C && w.props[C.malle]; if (q) { q.data = Object.assign({}, q.data, { ouverte: true }); farm.dirtyProps = true; }
      sound.lock && sound.lock(false);
      farm.give('c18_jeton_noir', 1); farm.give('c18_lettre_baron', 1);
      setTimeout(() => this.lire('lettre'), 600);
      return;
    }
    ui.subtitle('', '(La malle est vide. Elle sent le tabac froid et la lavande.)', 3);
  },
  odileJeton() {
    const S = this.S(), h = this.heure();
    if (!farm.count('c18_jeton_noir')) { this.dire('odile', 'Vous avez perdu son jeton ? Non. On ne le perd pas. Cherchez dans vos poches.', 4); return; }
    if (!(h >= 0 && h < 3)) { this.dire('odile', 'Pas maintenant. Il ne descend qu’après minuit.', 3.5); return; }
    ui.choice(this.nomDe('odile'), 'Odile regarde le jeton noir dans votre main. Elle ne sourit pas.\n\n« Sur le zéro, n’est-ce pas. Comme lui. »', [
      { label: 'Poser le jeton noir sur le zéro', fn: () => { ui.close(); this.finBaron(); } },
      { label: 'Garder le jeton', fn: () => { ui.close(); this.dire('odile', 'Comme vous voudrez. Il attendra. Il sait attendre.', 3.5); } },
    ]);
  },
  finBaron() {
    const S = this.S(), C = this.C();
    if (!C || S.quete.e !== 4) return;
    farm.take('c18_jeton_noir', 1);
    const W = (lx, ly, lz) => this.W(lx, ly, lz), yS = C18_Y.sol;
    const Ogd = C.gens.odile, Gg = C.gens.gris;
    const fin = () => {
      S.quete.e = 5; S.quete.fin = farm.s.day;
      farm.give('c18_chevaliere', 1);
      this.cineGris = false;
      const w = game.world, q = w.props.find((p) => p.id === 'c18_portrait');
      if (q) { q.data = Object.assign({}, q.data, { vide: true }); farm.dirtyProps = true; }
      this.decouvrir('sys:c18_baron', 'fin');
      setTimeout(() => this.dire('odile', 'Il a laissé ceci sur le tapis. Pour vous. Moi, je n’en ai pas besoin : je reste.', 5), 800);
    };
    this.cineGris = true;
    const tourner = (t) => { C18_ROUE.a = -t * 2.2; C18_ROUE.b = t * 6.5; C18_ROUE.rb = t < 4 ? 0.4 : 0.3; };
    const plans = [
      { dur: 5, de: { pos: W(0.5, 1.7, 1.2), look: W(Gg.lx, 1.45, Gg.lz) }, a: { pos: W(-0.6, 1.65, 2.4), look: W(Gg.lx, 1.5, Gg.lz) }, texte: 'Au bout du bar, l’homme en gris pose son verre. Pour la première fois, il se retourne.', figurants: [{ look: C18_GENS.gris.look, de: W(Gg.lx, yS, Gg.lz), cap: C.f.r + Math.PI }] },
      { dur: 5.5, de: { pos: W(-0.6, 1.9, -4.2), look: W(-2.32, 1.0, -2.6) }, a: { pos: W(-1.6, 1.6, -3.8), look: W(-2.32, 0.95, -2.6) }, texte: '« Le zéro, monsieur le baron. Comme toujours. »', qui: this.nomDe('odile'), chaque: tourner, figurants: [{ look: C18_GENS.odile.look, de: W(Ogd.lx, yS, Ogd.lz), cap: C.f.r + Math.PI }, { look: C18_GENS.gris.look, de: W(-0.8, yS, -0.9), cap: C.f.r + Math.PI * 0.8 }] },
      { dur: 4, de: { pos: W(-2.0, 1.4, -3.3), look: W(-2.32, 0.92, -2.6) }, a: { pos: W(-2.15, 1.3, -3.1), look: W(-2.32, 0.92, -2.6) }, texte: 'La bille hésite, longtemps. Elle tombe dans la case verte.', chaque: (t) => { C18_ROUE.a = -(5.5 + t) * 2.2 * Math.max(0.05, 1 - t / 3); C18_ROUE.rb = 0.3; C18_ROUE.b = C18_ROUE.a; }, debut: () => { sound.c18 && sound.c18('bille', null, 0.8); } },
      { dur: 6, de: { pos: W(2.5, 2.2, -4.5), look: W(6.9, 2.0, 0.5) }, a: { pos: W(3.5, 2.8, -4.0), look: W(6.9, 4.0, 3.5) }, texte: 'Il ramasse son chapeau, et monte le grand escalier sans faire craquer une marche. En haut, la porte de la suite ne s’ouvre pas. Il n’est plus là.', figurants: [{ look: C18_GENS.gris.look, de: W(6.95, yS, -2.4), a: W(6.95, C18_Y.etage, 4.9) }] },
      { dur: 5, de: { pos: W(-1.2, 1.7, -4.0), look: W(Ogd.lx, 1.55, Ogd.lz) }, a: { pos: W(-1.6, 1.65, -3.6), look: W(Ogd.lx, 1.6, Ogd.lz) }, texte: '« Il a perdu. Il va pouvoir partir. Merci. »', qui: this.nomDe('odile'), figurants: [{ look: C18_GENS.odile.look, de: W(Ogd.lx, yS, Ogd.lz), cap: C.f.r + Math.PI }] },
    ];
    if (typeof h17Cine !== 'undefined') h17Cine.jouer(plans, { apres: fin, passer: true });
    else fin();
  },
  lire(cle) { const T = C18_TEXTES[cle]; if (T) ui.read(T[0], T[1], T[2]); },
  // ------------------------------------------------------------- les scènes d'arrivée
  cineCercle() {
    const S = this.S(), C = this.C();
    if (!C || typeof h17Cine === 'undefined') { S.vus.cercle = 1; return; }
    S.vus.cercle = 1;
    const W = (lx, ly, lz) => this.W(lx, ly, lz), O = C.gens.odile, yS = C18_Y.sol;
    const ville = (farm.names && farm.names.ville) || 'la ville';
    h17Cine.jouer([
      { dur: 6.5, chemin: [{ pos: W(0, 3.9, -6.6), look: W(-1.2, 1.2, -2.6) }, { pos: W(-2.6, 3.6, -3.5), look: W(-1.5, 1.4, 1.5) }, { pos: W(-3.4, 3.2, -1.0), look: W(-1.5, 1.2, 4.5) }], texte: `Le Grand Cercle de ${ville}, fondé en 1852 « pour l’agrément des honnêtes gens », dit la plaque de cuivre. Les lustres sont allumés. On n’y voit aucune horloge.` },
      { dur: 5.5, de: { pos: W(-0.4, 1.75, -4.6), look: W(O.lx, 1.55, O.lz) }, a: { pos: W(-1.4, 1.7, -3.9), look: W(O.lx, 1.6, O.lz) }, texte: '« Faites vos jeux. Vous êtes en retard, ce soir. On vous attendait plus tôt. »', qui: C18_GENS.odile.titre.charAt(0).toUpperCase() + C18_GENS.odile.titre.slice(1), figurants: [] },
      { dur: 6, chemin: [{ pos: W(1.5, 2.2, -1.0), look: W(6.9, 2.0, -1.5) }, { pos: W(3.0, 2.6, 0.5), look: W(6.9, 4.4, 4.0) }], texte: 'Au fond, le grand escalier monte à la suite Impériale. On ne la loue qu’aux gens qui ne demandent pas le prix.', qui: '' },
    ], { passer: true });
    this.decouvrir('li:casino', 'heures');
    void yS;
  },
  cineSuite() {
    const S = this.S(), C = this.C();
    if (!C || typeof h17Cine === 'undefined') { S.vus.suite = 1; return; }
    S.vus.suite = 1;
    const W = (lx, ly, lz) => this.W(lx, ly, lz), yE = C18_Y.etage;
    h17Cine.jouer([
      { dur: 6.5, chemin: [{ pos: W(4.6, yE + 1.7, 3.0), look: W(-1.0, yE + 1.1, -3.6) }, { pos: W(2.2, yE + 1.8, -1.6), look: W(-2.0, yE + 1.0, -5.5) }, { pos: W(0.6, yE + 1.7, -4.6), look: W(0, yE + 1.4, -12) }], texte: 'La suite Impériale. L’Empereur n’y a jamais dormi. Le baron de Lancry, si : onze ans, sans jamais rendre la clé.' },
      { dur: 5.5, de: { pos: W(-1.4, yE + 1.7, -3.2), look: W(-2.3, yE + 2.2, 0) }, a: { pos: W(-2.0, yE + 1.85, -2.2), look: W(-2.3, yE + 2.25, 0) }, texte: S.quete.e >= 5 ? 'Le cadre est vide. Personne ne se souvient de ce qu’il y avait dedans.' : 'Personne n’a jamais décroché son portrait. Personne n’a jamais essayé.' },
    ], { passer: true });
    this.decouvrir('li:casino', 'suite');
  },
  // ------------------------------------------------------------- les lumières et les fenêtres
  majLumieres(force) {
    const C = this.C(), w = game.world;
    if (!C) return;
    const ouv = this.ouvertHeures(), h = this.heure(), soir = h >= 17 || h < 7;
    const k = (ouv ? 1 : 0) + (soir ? 2 : 0);
    if (!force && k === this.lumOuv) return;
    this.lumOuv = k;
    for (const i of C.lustres) { const q = w.props[i]; if (q) q.data = Object.assign({}, q.data, { lit: ouv }); }
    const qs = w.props[C.lustreSuite]; if (qs) qs.data = Object.assign({}, qs.data, { lit: soir });
    for (const i of C.fenetres) { const q = w.props[i]; if (q && !(q.data && q.data.dedans)) q.data = Object.assign({}, q.data, { lit: ouv && soir && q.y - C.f.y < 3 }); }
    farm.dirtyProps = true;
    try { w.collectLights(); } catch (e) { /* rien */ }
  },
  // les bougies des lustres qui se couchent (après minuit, une fois par soirée, parfois)
  vacille() {
    const C = this.C(), w = game.world, N = this.nuit();
    if (!C || N.vacille) return;
    N.vacille = 1;
    for (const i of C.lustres) { const q = w.props[i]; if (q) q.data = Object.assign({}, q.data, { lit: false }); }
    farm.dirtyProps = true; w.collectLights();
    ui.subtitle('', '(Toutes les flammes des lustres se couchent du même côté, comme sous un souffle. Personne n’a ouvert la porte.)', 5);
    setTimeout(() => this.majLumieres(true), 1400);
  },
  // ------------------------------------------------------------- les gens, dessinés
  rig(id) { return this.rigs[id] || (this.rigs[id] = humanRig(C18_GENS[id].look)); },
  dessiner(buf, sbuf, cam, t) {
    const C = this.C();
    if (!C || !farm.s) return;
    const p = cam || game.player.pos;
    if (Math.abs(p[0] - C.f.x) > 45 || Math.abs(p[2] - C.f.z) > 45) return;
    const pl = game.player.pos;
    for (const id in C.gens) {
      if (!C18_GENS[id] || !this.present(id)) continue;
      if (this.cineGris && (id === 'gris' || (typeof cine !== 'undefined' && cine.on && id === 'odile'))) continue;
      const g = C.gens[id], [x, y, z] = this.W(g.lx, C18_Y.sol, g.lz), r = this.rig(id);
      const ph = (id.charCodeAt(0) + id.length * 7) % 10;
      const d = Math.hypot(pl[0] - x, pl[2] - z);
      let cap = C.f.r + g.rr;
      // le regard suit le joueur quand il est près (la tête seulement)
      let look = 0;
      if (d < 4.5 && id !== 'gris' && id !== 'pianiste') { const a = Math.atan2(pl[0] - x, pl[2] - z); look = clamp(angDiff(cap, a), -0.8, 0.8); }
      const work = (id === 'odile' || id === 'valentin' || id === 'desire' || id === 'rigobert') && Math.sin(t * 0.7 + ph) > 0.85;
      poseHuman(r, { move: 0, t: t + ph, lookY: look, sit: !!g.assis, work: work || (id === 'pianiste' && this.present('pianiste')) });
      drawRig(buf, r, x, y + (Math.sin(t * 1.3 + ph) * 0.004), z, cap, 1, 0);
      if (sbuf) drawShadow(sbuf, x, y, z, 0.32);
    }
  },
  // ------------------------------------------------------------- la rumeur, le piano, et ce qui arrive après minuit
  ambiance(dt) {
    const C = this.C(), p = game.player.pos;
    if (!C) return;
    const d = Math.hypot(p[0] - C.f.x, p[2] - C.f.z), ouv = this.ouvertHeures(), h = this.heure();
    this.ambT -= dt; this.pianoT -= dt;
    if (ouv && d < 26 && this.ambT <= 0) { this.ambT = 2.2 + Math.random() * 3; sound.c18 && sound.c18('rumeur', this.W(Math.random() * 8 - 4, 1.5, Math.random() * 8 - 4), this.dedans() ? 1 : 0.4); }
    if (d < 30 && this.pianoT <= 0) {
      this.pianoT = 28 + Math.random() * 20;
      if (this.present('pianiste')) sound.c18 && sound.c18('piano', this.W(4.4, 1.2, C18_LOT.D / 2 - 0.9), this.dedans() ? 1 : 0.35);
      // le piano qu'on entend, Cercle fermé, entre trois et cinq heures (une fois par nuit, parfois)
      else if (h >= 3 && h < 5 && !this.dedans()) { const N = this.nuit(); if (!N.piano && Math.random() < 0.4) { N.piano = 1; sound.c18 && sound.c18('piano', this.W(4.4, 1.2, C18_LOT.D / 2 - 0.9), 0.5); } }
    }
    if (ouv && h >= 0 && h < 3 && this.dansSalle() && Math.random() < dt / 90) this.vacille();
  },
  // ------------------------------------------------------------- chaque image
  update(dt) {
    const C = this.C();
    if (!C || !farm.s || game.dying) return;
    this.majT -= dt;
    if (this.majT <= 0) {
      this.majT = 0.5;
      this.majPortes(); this.majLumieres(false);
      const S = this.S();
      const libre = !ui.panel && !(typeof cine !== 'undefined' && cine.on) && !game.sleeping;
      if (libre && !S.vus.cercle && this.ouvertHeures() && this.dansSalle()) this.cineCercle();
      else if (libre && !S.vus.suite && this.dansSuite()) this.cineSuite();
      if (this.dedans()) this.decouvrir('li:casino');
      // trois heures : on ferme (dit une fois, si l'on est dans la salle)
      const N = this.nuit(), h = this.heure();
      if (h >= 2.85 && h < 3 && this.dansSalle() && !N.ferme) { N.ferme = 1; this.dire('directrice', 'Mesdames, messieurs, le Cercle ferme. Les jeux sont faits. À demain.', 4); }
    }
    this.ambiance(dt);
  },
  charger() {
    this.rigs = {}; this.lumOuv = null; this.cineGris = false; this.majT = 0;
    if (!farm.s) return;
    const S = this.S(), C = this.C(), w = game.world;
    if (C) {
      const q = C.malle >= 0 && w.props[C.malle]; if (q && S.quete.malle) q.data = Object.assign({}, q.data, { ouverte: true });
      if (S.quete.e >= 5) { const pr = w.props.find((p) => p.id === 'c18_portrait'); if (pr) pr.data = Object.assign({}, pr.data, { vide: true }); }
      this.majLumieres(true); this.majPortes();
    }
    if (game._c18) return;
    game._c18 = true;
    // les portes du Cercle : la porte d'entrée (le portier), la porte de la suite (la clé de la directrice)
    const _ud = game.useDoor.bind(game);
    game.useDoor = function (dr) { if (dr && dr.c18 && c18.porte(dr)) return; return _ud(dr); };
    // (les portes des habitants se ferment la nuit : celles du Cercle suivent ses heures, et c'est le portier qui les ouvre)
    const _upd = npcs.updateDoors.bind(npcs);
    npcs.updateDoors = function (w, instant) {
      const C = c18.C(), garde = [];
      if (C && w === game.world) for (const k in C.portes) { const d = w.doors[C.portes[k]]; if (d) garde.push([d, d.open, d.locked]); }
      const r = _upd(w, instant);
      for (const [d, o, l] of garde) { d.open = o; d.locked = l; }
      try { c18.majPortes(); } catch (e) { console.error('C18 portes', e); }
      return r;
    };
    // après une nuit dans la suite : ce que la nuit a laissé
    const _sl = game.sleep.bind(game);
    game.sleep = async function (where) {
      const S0 = c18.S(), dansSuite = c18.dansSuite() && c18.droitSuite(), d0 = farm.s && farm.s.day;
      const r = await _sl(where);
      try {
        if (dansSuite && farm.s && farm.s.day > d0) {
          S0.suite.nuits = (S0.suite.nuits || 0) + 1;
          const msg = S0.quete.e < 5 ? pick(['(Cette nuit, dans le salon, quelqu’un a tourné les pages d’un carnet. Longtemps.)', '(À trois heures, on a frappé trois petits coups à la porte de la suite. Personne dans l’escalier.)', '(Vous avez dormi comme un empereur. Un empereur qui rêve de roulette.)']) : pick(['(Vous avez dormi comme un empereur.)', '(Un sommeil de velours. Pas un bruit dans la maison.)']);
          setTimeout(() => { if (!ui.panel && !game.dying) ui.subtitle('', msg, 5); }, 2800);
        }
      } catch (e) { console.error('C18 sommeil', e); }
      return r;
    };
  },
};

// ---------------------------------------------------------------- le portrait vidé (le modèle prend data.vide)
{
  const _pm = PROP_MODELS.c18_portrait;
  PROP_MODELS.c18_portrait = function (E, o, T) {
    if (!(o.data && o.data.vide)) return _pm(E, o, T);
    E.bx(0, 0, 0, 1.0, 1.35, 0.06, C18C.or, TL.gold);
    E.bx(0, 0.08, 0.02, 0.84, 1.19, 0.04, rgbf('#2a2620'), TL.plain);
    E.bx(0, 0.3, 0.04, 0.4, 0.4, 0.01, rgbf('#3a2a22'), TL.plain); // (le fauteuil vide)
  };
}

// ---------------------------------------------------------------- les pages du wiki (les découvertes)
if (typeof decouvertes !== 'undefined' && decouvertes.declarer) {
  for (const id in C18_GENS) {
    if (id === 'gris') continue;
    const G = C18_GENS[id];
    decouvertes.declarer('pnj:c18_' + id, { titre: G.nom.charAt(0).toUpperCase() + G.nom.slice(1), sous: G.role, icone: '☺', groupe: 'habitants', lead: '', champs: [{ k: 'metier', nom: 'Ce qu’on y fait', val: G.role + ', au Grand Cercle', test: (g) => d15Cite(g, [G.role, 'cercle', 'casino']) }] });
  }
  decouvertes.declarer('pnj:c18_gris', { titre: 'L’homme en gris', sous: 'Au bout du bar', icone: '☺', groupe: 'habitants', lead: 'On ne le voit qu’après minuit, et de loin.', champs: [] });
  for (const [k, t, l] of [['roulette', 'La roulette', 'Un seul zéro. Plein à trente-cinq pour un, chances simples à un pour un, douzaines à deux pour un.'], ['vingt', 'Le vingt-et-un', 'Le croupier tire à seize et sur dix-sept souple ; le naturel paie six pour cinq ; on double sur deux cartes.'], ['baccara', 'Le baccara', 'Punto ou banque, payés un pour un, cagnotte déduite (sept et demi pour cent) ; l’égalité, dix pour un.'], ['des', 'Le passe-dix', 'Trois dés : passe (onze et plus) ou manque (dix et moins), les brelans pour la banque ; le brelan, trente-trois pour un ; « sur un point », payé par dé.'], ['bandit', 'Le bandit manchot', 'Une machine américaine, un jeton de cinq : trois cloches, quarante jetons ; trois étoiles, vingt-cinq ; trois fers, vingt.']]) {
    decouvertes.declarer('sys:c18_' + k, { titre: t, sous: 'Jeu du Grand Cercle', icone: '♣', groupe: 'autres', lead: l, champs: [] });
  }
  decouvertes.declarer('sys:c18_baron', { titre: 'Le baron de la suite Impériale', sous: 'Le Grand Cercle', icone: '✧', groupe: 'autres', lead: 'Le baron Edgar de Lancry entra au Cercle le 13 novembre 1879, à minuit. Le registre ne dit pas qu’il en soit sorti.', champs: [{ k: 'fin', nom: 'Ce qu’il voulait', val: 'jouer son dernier jeton sur le zéro', test: (g) => d15Un(g, ['zero', 'jeton', 'roulette']) }] });
  if (decouvertes.ajouterChamps) decouvertes.ajouterChamps('li:casino', () => [
    { k: 'heures', nom: 'Ouvert', val: 'de six heures du soir à trois heures du matin', test: (g) => d15Un(g, ['soir', 'nuit', 'six heures', '18']) },
    { k: 'jeux', nom: 'Ce qu’on y joue', val: 'la roulette, le vingt-et-un, le baccara, le passe-dix, le bandit manchot', test: (g) => d15Cite(g, ['roulette', 'vingt-et-un', 'baccara', 'passe-dix', 'bandit manchot']) },
    { k: 'suite', nom: 'À l’étage', val: 'la suite Impériale (350 pièces la nuit, 30 000 à l’achat)', test: (g) => d15Un(g, ['suite', 'imperiale', 'chambre', 'etage']) },
  ]);
}

// ---------------------------------------------------------------- branchements
HOOKS.inter.c18_jeu = (it) => c18Jeux.ouvrir(it.data.jeu, it);
HOOKS.inter.c18_caisse = () => { c18.rencontrer('caissiere'); c18Jeux.caisse(); };
HOOKS.inter.c18_bar = () => { c18.rencontrer('theodule'); c18Jeux.bar(); };
HOOKS.inter.c18_parler = (it) => c18.parler(it.data.qui);
HOOKS.inter.c18_suite = (it) => c18.suite(it.data.quoi);
HOOKS.inter.c18_escalier = (it) => c18.monter(it);
HOOKS.interVis.c18_parler = (it) => (it.data.qui === 'gris' ? c18.grisHeure() : c18.present(it.data.qui));
HOOKS.interVis.c18_jeu = (it) => c18.ouvertHeures() && (it.data.jeu === 'bandit' || c18.croupierLa(it.data.jeu));
HOOKS.interVis.c18_caisse = () => c18.ouvertHeures();
HOOKS.interVis.c18_bar = () => c18.ouvertHeures();
HOOKS.interVis.c18_escalier = (it) => { const d = it.data, y = game.player.pos[1]; return d.sens === 'haut' ? y < d.haut[1] - 1.0 : y > d.haut[1] - 0.8; };
if (typeof fouilles !== 'undefined' && fouilles.etiquettes) {
  fouilles.etiquettes.c18_parler = (it) => esc(c18.nomDe(it.data.qui));
  for (const k of ['c18_jeu', 'c18_caisse', 'c18_bar', 'c18_suite', 'c18_escalier']) fouilles.etiquettes[k] = (it) => esc(it.name || '');
}
HOOKS.primary.push((eye, basis, held, it, id) => { if (held || !it || !it.c18lire) return false; c18.lire(it.c18lire); return true; });
HOOKS.update.push((dt) => { try { c18.update(dt); } catch (e) { console.error('C18', e); } });
HOOKS.draw.push((buf, sbuf, cam, t) => { try { c18.dessiner(buf, sbuf, cam, t); } catch (e) { console.error('C18 dessin', e); } });
HOOKS.load.push(() => c18.charger());
