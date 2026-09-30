// ============================================================================
//  LES ÉVÉNEMENTS : ce qui arrive rarement à la vallée.
//  Un calendrier DÉTERMINISTE (d'après la graine et le jour : un almanach peut le
//  prédire) décide des nuits noires, des jours de grand froid où il neige
//  partout, des jours de soleil écrasant, des tornades (12-zzzD-tornade.js) et
//  des nuits où passe l'homme au long manteau (12-zzzD-tueur.js). Chaque matin,
//  on tire aussi (rarement) un « prodige » : étoiles filantes, aurore, éclipse,
//  grêle, tremblement de terre, mur de brouillard, feux follets, cloches qui
//  sonnent seules, météorite, oiseaux migrateurs, pluie de grenouilles, géant
//  aperçu sur les crêtes. Les habitants en parlent.
//  - nuit noire : ni lune ni étoiles, presque aucune lumière, les lanternes
//    portent moins loin ; des murmures ; une voix appelle (divins.voix) ;
//  - neige partout : flocons et sol blanc dans toute la vallée, froid à gérer ;
//  - soleil écrasant : lumière poussée ; le regarder laisse une tache noire.
//  État sauvegardé : farm.s.ev. Essais : evenements.declencher(id).
// ============================================================================
const EV_BIZ = () => (typeof bizarrerie === 'function' ? bizarrerie() : 1);
// ---------------------------------------------------------------- les fréquences (mesurées par tools/equilibrage/hasard.js)
// Ce qui se tire une fois par jour garde sa fréquence par jour de jeu, quelle que soit la durée d'une journée. Ce qui se
// tire au fil du temps (lavandière, Slender, frissons de la nuit…) passe par hasardHeure : un nombre de fois PAR HEURE
// DE JEU, qui ne dépend ni des images par seconde ni de JOUR_SECONDES.
const EV_FREQ = {
  nuitNoire: 0.1,       // tirage du soir : une nuit noire sur dix environ (jamais deux de suite), dès le quatrième soir
  nuitImprevue: 0.01,   // une nuit noire que l'almanach n'annonce pas : 1 % des soirs × bizarrerie
  soleil: 0.035,        // soleil écrasant : un jour sur vingt-huit
  neige: 0.032,         // neige partout : un jour sur trente
  tornade: 0.15,        // part des jours d'orage ou de canicule qui en font une : une tornade toutes les quatre semaines
  tueur: 0.065,         // l'homme au long manteau : un soir sur quinze × bizarrerie, une fois l'écart passé…
  tueurJour: 13,        // … jamais la première semaine (douze jours)…
  tueurEcart: 20,       // … et jamais deux passages en vingt jours : un toutes les trois semaines environ (il tue
                        // à chaque passage : plus souvent, une longue partie viderait les villages)
};
// heures de jeu écoulées pendant dt secondes réelles, comme dans game.loop : le temps accéléré compte ; en pause, en
// dormant (le sommeil saute les heures, sans tirage), en mourant ou quand le temps s'arrête, rien ne passe
function heuresDeJeu(dt) {
  if (game.mode === 'menu' || game.sleeping || game.dying || (strange.freezeT || 0) > 0) return 0;
  const w = game.world;
  return dt * (game.fastTime ? 60 : 1) * (game.timeScale ?? 1) * 24 / ((w && w.dayLength) || JOUR_SECONDES);
}
// pour un tirage fait toutes les dt secondes réelles : la chance d'un événement qui arrive « parHeure » fois par heure de jeu
function hasardHeure(parHeure, dt) { return parHeure > 0 ? 1 - Math.exp(-parHeure * heuresDeJeu(dt)) : 0; }
// heure « de la nuit » : après minuit, on compte 24, 25… (le jour ne change qu'à 6 h)
const evHH = () => { const h = npcs.hour(); return h < 6 ? h + 24 : h; };

// ---------------------------------------------------------------- ce que disent les habitants
const EV_LIGNES = {
  nuit_noire: {
    avant: ['Les chiens se sont tus au crépuscule. Ce soir, fermez vos volets.', 'Ma chandelle fume sans raison. C’est une nuit noire qui vient, je le sens.', 'Si ce soir vous entendez votre nom dehors, ne répondez pas. Surtout pas.'],
    apres: ['Cette nuit… vous l’avez vue ? Pas une étoile. On aurait dit que le ciel s’était retiré.', 'J’ai entendu murmurer sous ma fenêtre toute la nuit. Je n’ai pas ouvert.', 'Une nuit noire. Ma grand-mère disait que c’est le souffle de quelqu’un.'],
  },
  neige: {
    avant: ['On annonce de la neige. De la neige jusque dans les prés du bas, vous vous rendez compte ?', 'Le froid descend des Monts. Demain, rentrez du bois.'],
    pendant: ['De la neige ! En bas ! Ça n’était pas arrivé depuis que j’étais gamin.', 'Couvrez-vous. Ce froid-là, il tue les imprudents.', 'Rentrez les bêtes, et gardez le feu allumé cette nuit.'],
    apres: ['Vous avez vu cette neige ? Il y en avait jusque sur le lavoir.', 'Les jeunes pousses n’ont pas aimé le froid. Ni mes vieux os.'],
  },
  soleil: {
    avant: ['Demain, il va taper fort. Trop fort. Portez un chapeau, et ne regardez pas le ciel.'],
    pendant: ['Ne regardez pas le soleil aujourd’hui. Il brûle les yeux, et la tache ne s’en va pas.', 'Un soleil pareil, ce n’est pas naturel. Restez à l’ombre.', 'Mon grand-père a regardé le soleil un jour comme celui-ci. Il a vu une tache noire jusqu’à sa mort.'],
    apres: ['Quelle fournaise, hier. Les poules n’ont pas pondu.'],
  },
  tornade: {
    pendant: ['Le ciel est vert ! À la cave, vite !', 'Le vent tourne en rond… Mon Dieu, c’est une trombe !'],
    apres: ['La trombe d’hier a arraché des champs entiers. On a retrouvé une charrette dans un arbre.', 'Vous étiez dehors, pendant la trombe ? Vous avez de la chance d’être entier.'],
  },
  etoiles: {
    pendant: ['Regardez ! Des étoiles qui tombent ! Faites un vœu !', 'Tant d’étoiles filantes… Quelqu’un là-haut a renversé son sac.'],
    apres: ['Cette nuit, il est tombé des étoiles par dizaines. Au matin, il paraît qu’on en trouve la poussière dans l’herbe.', 'Vous avez fait un vœu, cette nuit ? Moi, j’en ai fait tellement que je les ai oubliés.'],
  },
  aurore: {
    pendant: ['Le ciel brûle au nord… en vert ! Qu’est-ce que c’est ?'],
    apres: ['Des lumières vertes dans le ciel, cette nuit. Le curé dit que c’est un signe. Il ne sait pas de quoi.', 'L’aurore du nord, disait mon père. On ne la voit jamais si bas. Jamais.'],
  },
  eclipse: {
    pendant: ['Le soleil s’en va ! En plein jour !', 'Rentrez les enfants ! Le soleil se fait manger !'],
    apres: ['Vous avez vu, hier ? Le soleil s’est éteint en plein midi. Les poules sont allées se coucher.', 'L’éclipse d’hier… Le curé l’avait lue dans un almanach. Il a fait semblant d’être surpris.'],
  },
  grele: {
    pendant: ['À l’abri ! Des grêlons gros comme des noix !'],
    apres: ['La grêle d’hier a haché mes salades. Tout est à refaire.', 'Des grêlons comme des œufs de pigeon. Mon toit s’en souviendra.'],
  },
  seisme: {
    pendant: ['La terre tremble ! Sortez des maisons !', 'Durn se retourne… Que Dieu nous garde.'],
    apres: ['La terre a tremblé, hier. Les vieux disent que c’est Durn qui se retourne dans son sommeil, sous la montagne.', 'Toute ma vaisselle par terre. Et le puits a de l’eau trouble depuis.'],
  },
  brouillard: {
    pendant: ['On n’y voit plus à dix pas. Restez sur le chemin.', 'Ce brouillard est arrivé d’un coup, comme un mur. Je n’aime pas ça.'],
    apres: ['Le brouillard d’hier soir, vous l’avez vu tomber ? Comme un drap qu’on jette.', 'Dans le brouillard, hier, j’ai entendu marcher à côté de moi. Il n’y avait personne.'],
  },
  follets: {
    apres: ['Des feux follets au marais, cette nuit. Ne les suivez jamais… sauf si vous savez ce que vous faites.', 'Les follets, ce sont les âmes des noyés. Ou des lanternes de voleurs. Ça dépend qui raconte.'],
  },
  cloches: {
    pendant: ['Qui sonne les cloches ? Le sonneur est au lit, je l’ai vu !'],
    apres: ['Les cloches ont sonné toutes seules, hier. Le curé a trouvé la corde nouée en haut, là où personne ne monte.', 'Un glas, sans mort. On attend de savoir qui.'],
  },
  meteorite: {
    pendant: ['Une boule de feu ! Elle est tombée derrière les bois !'],
    apres: ['Une pierre est tombée du ciel, cette nuit. On dit qu’elle fume encore. Personne n’ose y aller.', 'Le ciel a craché une pierre. Il y a un trou dans le pré, et plus un brin d’herbe autour.'],
  },
  oiseaux: {
    pendant: ['Regardez ces oies ! Des centaines !'],
    apres: ['Les oies sont passées, hier. Elles partent tôt. Le temps va tourner.', 'Un vol d’oies si grand qu’il a caché le soleil. Mon père disait que ça annonce un deuil. Mon père disait beaucoup de choses.'],
  },
  grenouilles: {
    pendant: ['Il pleut des grenouilles ! Des grenouilles !', 'C’est une plaie d’Égypte, voilà ce que c’est !'],
    apres: ['Il est tombé des grenouilles du ciel, hier. Le curé parle des plaies d’Égypte. Le pêcheur parle d’une trombe sur le lac.', 'J’ai trouvé des grenouilles dans ma soupière. Vivantes.'],
  },
  geant: {
    apres: ['À l’aube, sur les crêtes, quelqu’un a vu marcher un géant. Grand comme trois maisons.', 'Les géants descendent plus bas, cette année. Ils cherchent quelque chose.'],
  },
  divin_aela: {
    apres: ['À l’aube, sur la colline de l’est, j’ai vu une lumière debout. Pas le soleil : il n’était pas levé.', 'Ma grand-mère parlait d’une femme de lumière qui se montre une fois dans une vie. Je croyais que c’était un conte.'],
  },
  divin_durn: {
    apres: ['La montagne a bougé. Je vous jure qu’elle a bougé : elle s’est levée, puis recouchée.', 'Les nains disent que Durn dort sous les Monts. Cette fois, il ne dormait pas.'],
  },
  divin_vesh: {
    apres: ['Cette nuit, les étoiles se sont éteintes. Pas cachées : éteintes. Une par une.', 'Quelque chose de plus noir que la nuit s’est levé à l’horizon. Je n’ai pas dormi.'],
  },
  tueur: {
    apres: ['Un homme en long manteau, cette nuit, près des maisons. Personne ne le connaît. Personne ne l’a revu.', 'On l’a vu partir à l’aube, le manteau trempé jusqu’aux genoux. Il ne reviendra pas, qu’ils disent. Ils n’en savent rien.', 'Depuis cette nuit, je ferme ma porte à double tour. Vous devriez faire pareil.'],
  },
};
// météo annoncée par les habitants (veille) : « neige », « ecrasant »
if (typeof NPC_GENERIC !== 'undefined' && NPC_GENERIC.meteo) {
  NPC_GENERIC.meteo.neige = ['Il va neiger. Partout, pas seulement là-haut. Rentrez du bois.', 'Le ciel est lourd et blanc. Demain, de la neige jusqu’aux prés du bas.'];
  NPC_GENERIC.meteo.ecrasant = ['Demain, le soleil va écraser la vallée. Ne le regardez pas en face.', 'Un soleil de plomb demain. Buvez, et restez à l’ombre à midi.'];
}

// ---------------------------------------------------------------- les prodiges (au plus un par jour, rarement)
// peut(P, d) : possible ce jour-là (P : programme météo) ; heure(P, r) : heure de début (heures ≥ 24 : après minuit)
const PRODIGES = {
  etoiles: { poids: 3, etrange: 0, peut: (P) => evCiel(P, 22.5, 'clair'), heure: (P, r) => 22 + r * 3, duree: 3 },
  aurore: { poids: 1.6, etrange: 1, peut: (P) => evCiel(P, 22, 'clair'), heure: (P, r) => 21.5 + r * 4, duree: 3.2 },
  eclipse: { poids: 1, etrange: 0, peut: (P) => evCiel(P, 12, 'clair') || evCiel(P, 12, 'nuageux'), heure: (P, r) => 10.5 + r * 4.5, duree: 2.2 },
  grele: { poids: 1.6, etrange: 0, peut: (P) => P.rain, heure: (P, r) => evPluieHeure(P, r), duree: 1.4 },
  seisme: { poids: 1.4, etrange: 1, peut: () => true, heure: (P, r) => 8 + r * 14, duree: 0.6 },
  brouillard: { poids: 1.8, etrange: 0, peut: (P) => !P.storm, heure: (P, r) => 16 + r * 4, duree: 3.5 },
  follets: { poids: 1.4, etrange: 1, peut: (P) => !P.storm, heure: (P, r) => 21.5 + r * 3, duree: 5 },
  cloches: { poids: 1.1, etrange: 1, peut: () => true, heure: (P, r) => 18.2 + r * 2.4, duree: 1.2 },
  meteorite: { poids: 0.9, etrange: 0, peut: (P) => evCiel(P, 23, 'clair') || evCiel(P, 23, 'nuageux'), heure: (P, r) => 22 + r * 4, duree: 0.5 },
  oiseaux: { poids: 2, etrange: 0, peut: (P) => !P.storm, heure: (P, r) => 8 + r * 9, duree: 1.4 },
  grenouilles: { poids: 0.9, etrange: 1, peut: (P) => P.rain && !P.storm, heure: (P, r) => evPluieHeure(P, r), duree: 1 },
  geant: { poids: 0.9, etrange: 1, peut: () => true, heure: (P, r) => 6.05 + r * 0.8, duree: 1.8 },
};
// l'état du ciel à une heure donnée d'un programme météo
function evEtat(P, h) { h = h % 24; let st = P.plan[0][1]; for (const [hr, x] of P.plan) if (h >= hr) st = x; return st; }
function evCiel(P, h, k) { const st = evEtat(P, h); return k === 'clair' ? st === 'clear' || st === 'frost' || st === 'heat' : st === 'cloudy'; }
function evPluieHeure(P, r) { const e = P.plan.find(([h, x]) => (x === 'rain' || x === 'storm') && h < 20); return e ? Math.max(8, e[0]) + 0.3 + r * 1.2 : 12 + r * 4; }

const evenements = {
  force: {}, actifs: {}, noirK: 0, neigeK: 0, soleilK: 0, voix: null, _plans: new Map(),

  // ------------------------------------------------------------ état sauvegardé (farm.s.ev)
  S() {
    const s = farm.s;
    const S = s.ev || (s.ev = {});
    if (!S.faits || typeof S.faits !== 'object') S.faits = {};
    if (!Array.isArray(S.recents)) S.recents = [];
    if (!S.nuit || typeof S.nuit !== 'object') S.nuit = {};
    if (!S.tache || typeof S.tache !== 'object') S.tache = { a: 0, r: 0 };
    if (typeof S.neigeSol !== 'number') S.neigeSol = 0;
    if (!S.tueur || typeof S.tueur !== 'object') S.tueur = { dernier: -99 };
    if (!S.esprit || typeof S.esprit !== 'object') S.esprit = { dernier: -99, n: 0 };
    if (!S.tornade || typeof S.tornade !== 'object') S.tornade = { dernier: -99 };
    return S;
  },

  // ------------------------------------------------------------ le calendrier (déterministe)
  alea(d, k) { const s = farm.s; return mulberry32((hash2i(d, k * 7717 + 13, ((s ? s.seed : 1) >>> 0) ^ 0x5bd1e995) * 4294967296) >>> 0)(); },
  // programme météo « d'origine » (avant neige, soleil écrasant…) : pour les tornades
  planBase(d) {
    const key = (farm.s ? farm.s.seed : 0) + ':' + d;
    let P = this._plans.get(key);
    if (!P) { P = EV_PLAN0(farm.s ? farm.s.seed : 0, d); this._plans.set(key, P); if (this._plans.size > 200) this._plans.clear(); }
    return P;
  },
  // les nuits noires : environ une nuit sur dix (avec les imprévues), jamais deux de suite, jamais avant le quatrième soir
  nuitNoireBrute(d) { return d >= 4 && this.alea(d, 1) < EV_FREQ.nuitNoire; },
  nuitNoire(d) { if (d === undefined) d = farm.s ? farm.s.day : 1; return this.nuitNoireBrute(d) && !this.nuitNoireBrute(d - 1); },
  // une nuit noire que l'almanach n'annonce pas (tirée au soir, selon l'esprit du personnage ; jamais deux de suite)
  chanceImprevue(d) {
    if (d === undefined) d = farm.s ? farm.s.day : 1;
    if (d < 4 || this.nuitNoire(d) || this.nuitNoire(d - 1) || this.nuitNoire(d + 1) || (farm.s && this.S().nuit.imprevue === d - 1)) return 0;
    return EV_FREQ.nuitImprevue * EV_BIZ();
  },
  // les jours de neige (grand froid) et de soleil écrasant
  soleil(d) { if (d === undefined) d = farm.s ? farm.s.day : 1; return d >= 3 && this.alea(d, 3) < EV_FREQ.soleil; },
  neige(d) { if (d === undefined) d = farm.s ? farm.s.day : 1; return d >= 4 && this.alea(d, 2) < EV_FREQ.neige && !this.soleil(d); },
  // la tornade : un jour d'orage ou de canicule, très rarement (heure de formation, ou null) ; jamais deux en douze jours
  tornadeBrute(d) {
    if (d < 6 || this.soleil(d) || this.neige(d)) return null;
    const P = this.planBase(d);
    if (!P.storm && !P.heat) return null;
    if (this.alea(d, 4) >= EV_FREQ.tornade) return null;
    const r = this.alea(d, 9);
    if (P.storm) { const e = P.plan.find(([, x]) => x === 'storm'); return Math.min(21, (e ? e[0] : 14) + 0.4 + r * 1.6); }
    return 15.5 + r * 2.5;
  },
  tornade(d) {
    if (d === undefined) d = farm.s ? farm.s.day : 1;
    const t = this.tornadeBrute(d);
    if (t === null) return null;
    for (let k = 1; k <= 12; k++) if (this.tornadeBrute(d - k) !== null) return null;
    return t;
  },
  // l'homme au long manteau : pas avant le treizième soir (jamais la première semaine), jamais une nuit noire, jamais deux
  // passages en vingt jours (on compte depuis son dernier passage : plus d'esprit sombre, plus de soirs tirés, donc plus
  // de passages — une règle sur les seuls tirages le rendait au contraire plus rare)
  tueurBrut(d) { return d >= EV_FREQ.tueurJour && this.alea(d, 5) < EV_FREQ.tueur * EV_BIZ(); },
  tueur(d) {
    if (d === undefined) d = farm.s ? farm.s.day : 1;
    return this.tueurBrut(d) && !this.nuitNoire(d) && d - this.S().tueur.dernier >= EV_FREQ.tueurEcart;
  },
  // le prodige du jour (tiré une fois par jour : la bizarrerie du moment en change la fréquence)
  prodige(d) {
    if (d === undefined) d = farm.s ? farm.s.day : 1;
    if (d < 3) return null;
    const S = this.S();
    if (S.prodige && S.prodige.d === d) return S.prodige.id ? S.prodige : null;
    const biz = EV_BIZ();
    let out = { d, id: null };
    if (this.alea(d, 6) < 0.22 * Math.min(2.2, 0.7 + biz * 0.3)) {
      const P = weather.dayPlan(farm.s.seed, d);
      // les prodiges étranges (géant, séisme, cloches…) attendent le quatrième jour
      const pool = Object.keys(PRODIGES).filter((id) => PRODIGES[id].peut(P, d) && (d >= 4 || !PRODIGES[id].etrange));
      let tot = 0;
      for (const id of pool) tot += PRODIGES[id].poids * (PRODIGES[id].etrange ? biz : 1);
      let r = this.alea(d, 7) * tot;
      for (const id of pool) { r -= PRODIGES[id].poids * (PRODIGES[id].etrange ? biz : 1); if (r <= 0) { out = { d, id, h: PRODIGES[id].heure(P, this.alea(d, 8)) }; break; } }
    }
    S.prodige = out;
    return out.id ? out : null;
  },
  // tout ce qu'on sait d'un jour (pour un almanach, un devin…)
  jour(d) {
    if (d === undefined) d = farm.s ? farm.s.day : 1;
    return { d, nuitNoire: this.nuitNoire(d), neige: this.neige(d), soleil: this.soleil(d), tornade: this.tornade(d), tueur: this.tueur(d) };
  },
  // ce qu'un almanach peut annoncer pour les n jours à venir : [{ jour, quoi, texte }]
  almanach(n) {
    const out = [], d0 = farm.s ? farm.s.day : 1;
    for (let d = d0; d < d0 + (n || 24); d++) {
      if (this.nuitNoire(d)) out.push({ jour: d, quoi: 'nuit_noire', texte: 'Nuit noire : ni lune ni étoiles. Fermer les volets, garder une lumière, ne pas répondre.' });
      if (this.neige(d)) out.push({ jour: d, quoi: 'neige', texte: 'Grand froid : la neige descend jusque dans les prés. Rentrer du bois.' });
      if (this.soleil(d)) out.push({ jour: d, quoi: 'soleil', texte: 'Soleil de plomb : ne pas le regarder en face.' });
    }
    return out;
  },

  // ------------------------------------------------------------ ce qui est en cours
  nuitNoireCe() { const S = this.S(), d = farm.s.day; return !!(this.force.nuit_noire || this.nuitNoire(d) || S.nuit.imprevue === d); },
  jourNeige() { return !!(this.force.neige || this.neige(farm.s.day)); },
  jourSoleil() { return !!(this.force.soleil || this.soleil(farm.s.day)); },
  actif(id) { if (id === 'nuit_noire') return this.noirK > 0.5; if (id === 'neige') return this.neigeK > 0.05; if (id === 'soleil') return this.soleilK > 0.3; return !!this.actifs[id]; },
  dehors() { const p = game.player, w = game.world, e = p.eyePos(); return !p.underground && !w.covered(e[0], e[1], e[2]) && !strange.inEnvers(); },
  // on retient ce qui s'est passé (les habitants en parlent pendant deux jours)
  retenir(id) {
    const S = this.S(), d = farm.s.day;
    S.recents = S.recents.filter((r) => r.d >= d - 3 && r.id !== id);
    S.recents.push({ id, d });
    S.vus = S.vus || {}; S.vus[id] = (S.vus[id] || 0) + 1;
  },
  // les habitants proches réagissent
  reagir(id, quand) {
    const L = EV_LIGNES[id] && (EV_LIGNES[id][quand || 'pendant'] || EV_LIGNES[id].pendant);
    if (!L || !L.length) return;
    const p = game.player.pos;
    const near = npcs.list.filter((n) => n.st.alive && !n.vanished && !n.hunting && n.state !== 'sleep' && n.state !== 'dead' && n.state !== 'gone' && !n.talking && Math.hypot(n.x - p[0], n.z - p[2]) < 60);
    near.sort(() => Math.random() - 0.5);
    near.slice(0, 2).forEach((n, i) => setTimeout(() => { if (n.st.alive && !game.dying) npcs.say(n, pick(L), 3.5); }, 1500 + i * 3200 + Math.random() * 1500));
  },
  // une ligne à dire, pour qui en parle (événement récent, ou annonce du lendemain)
  ligne() {
    if (!farm.s) return null;
    const S = this.S(), d = farm.s.day;
    const cur = [];
    if (this.jourNeige() && EV_LIGNES.neige.pendant) cur.push(['neige', 'pendant']);
    if (this.jourSoleil()) cur.push(['soleil', 'pendant']);
    if (cur.length && Math.random() < 0.7) { const [k, q] = pick(cur); return pick(EV_LIGNES[k][q]); }
    const rec = S.recents.filter((r) => r.d >= d - 2 && EV_LIGNES[r.id] && EV_LIGNES[r.id].apres && (r.d < d || npcs.hour() > 6));
    if (rec.length) { const r = rec[rec.length - 1]; return pick(EV_LIGNES[r.id].apres); }
    if (this.nuitNoire(d) && npcs.hour() > 14) return pick(EV_LIGNES.nuit_noire.avant);
    if (this.neige(d + 1) && npcs.hour() > 12) return pick(EV_LIGNES.neige.avant);
    if (this.soleil(d + 1) && npcs.hour() > 12) return pick(EV_LIGNES.soleil.avant);
    return null;
  },

  // ------------------------------------------------------------ pour les essais (et les autres modules)
  declencher(id, opts) {
    if (!farm.s) return false;
    if (id === 'nuit_noire' || id === 'neige' || id === 'soleil') { this.force[id] = true; return true; }
    if (id === 'tornade') return typeof tornade !== 'undefined' ? tornade.lancer(opts) : false;
    if (id === 'tueur') return typeof tueur !== 'undefined' ? tueur.lancer(opts) : false;
    if (id === 'esprit') return typeof lavandiere !== 'undefined' ? lavandiere.surgir(true) : false;
    if (PRODIGES[id]) return this.lancer(id, opts);
    return false;
  },
  fin(id) {
    if (id === 'nuit_noire' || id === 'neige' || id === 'soleil') { delete this.force[id]; return; }
    const E = this.actifs[id];
    if (E) this.arreter(E);
  },

  // ------------------------------------------------------------ les prodiges
  lancer(id, opts) {
    if (this.actifs[id]) return false;
    const D = PRODIGES[id], fx = EV_FX[id];
    if (!D || !fx) return false;
    const E = Object.assign({ id, t: 0, h0: farm.s.hours, duree: D.duree }, opts || {});
    this.actifs[id] = E;
    this.S().faits[id + ':' + farm.s.day] = 1;
    this.retenir(id);
    try { if (fx.debut) fx.debut.call(this, E); } catch (e) { console.error(e); }
    return true;
  },
  arreter(E) {
    const fx = EV_FX[E.id];
    delete this.actifs[E.id];
    try { if (fx && fx.fin) fx.fin.call(this, E); } catch (e) { console.error(e); }
  },

  // ------------------------------------------------------------ chaque image
  update(dt, eye, basis, sky, playing) {
    const s = farm.s;
    if (!s || game.mode === 'menu' || game.dying || !game.world) return;
    const S = this.S(), w = game.world, p = game.player, hh = evHH(), envers = strange.inEnvers();
    // --- programme : une fois par seconde
    this.progT = (this.progT || 0) - dt;
    if (this.progT <= 0 && !game.sleeping) {
      this.progT = 1;
      const d = s.day;
      // une nuit noire non prédite (rarissime, selon l'esprit du personnage)
      if (hh >= 19 && hh < 19.6 && S.nuit.tirage !== d) { S.nuit.tirage = d; if (Math.random() < this.chanceImprevue(d)) S.nuit.imprevue = d; }
      // le prodige du jour
      const P = this.prodige(d);
      if (P && !S.faits[P.id + ':' + d] && hh >= P.h && hh < P.h + 2.5 && !envers) this.lancer(P.id);
    }
    // --- les prodiges en cours
    for (const id in this.actifs) {
      const E = this.actifs[id], fx = EV_FX[id];
      E.t += dt;
      E.k = clamp((s.hours - E.h0) / E.duree, 0, 1);
      try { if (fx.update) fx.update.call(this, E, dt, eye, basis, sky); } catch (e) { console.error(e); }
      if (E.k >= 1 || E.stop) this.arreter(E);
    }
    // --- nuit noire
    const noire = this.nuitNoireCe() && !envers && !strange.redNight();
    const plein = S.nuit.debut === s.day && hh >= 19.8;
    const tgt = noire ? (plein ? 1 : smoothstep(19.8, 21, hh)) * (1 - smoothstep(28.6, 29.8, hh)) : 0;
    this.noirK += (tgt - this.noirK) * Math.min(1, dt * 0.35);
    if (this.noirK < 0.002) this.noirK = 0;
    evNuitNoire.update(dt, eye, basis, sky);
    // --- neige partout
    evNeige.update(dt, eye, basis, sky);
    // --- soleil écrasant
    evSoleil.update(dt, eye, basis, sky);
  },
  sky(sky) {
    if (!farm.s || !game.world) return;
    evNeige.sky(sky); evSoleil.sky(sky); evNuitNoire.sky(sky);
    for (const id in this.actifs) { const fx = EV_FX[id]; if (fx.sky) try { fx.sky.call(this, this.actifs[id], sky); } catch (e) { console.error(e); } }
  },
  fx(fx, tint, sky) {
    if (!farm.s) return;
    evNuitNoire.fx(fx, tint); evSoleil.fx(fx, tint, sky);
    for (const id in this.actifs) { const f = EV_FX[id]; if (f.fx) f.fx.call(this, this.actifs[id], fx, tint); }
  },
  draw(buf, sbuf, cam, t) {
    if (!farm.s) return;
    for (const id in this.actifs) { const f = EV_FX[id]; if (f.draw) try { f.draw.call(this, this.actifs[id], buf, sbuf, cam, t); } catch (e) { console.error(e); } }
    evDessinPoussiere(buf, cam, t);
  },
  lights(eye) {
    const L = [];
    if (!farm.s) return L;
    for (const id in this.actifs) { const f = EV_FX[id]; if (f.lights) for (const l of f.lights.call(this, this.actifs[id], eye) || []) L.push(l); }
    const Pd = this.S().poussiere;
    if (Pd && Pd.jour === farm.s.day && npcs.hour() < 14) L.push({ x: Pd.x, y: Pd.y + 0.4, z: Pd.z, r: 5, c: [0.55, 0.62, 1.1], d: Math.hypot(Pd.x - eye[0], Pd.z - eye[2]) });
    return L;
  },
  // nouvelle partie / partie chargée
  load(saved) {
    this.actifs = {}; this.force = {}; this.noirK = 0; this.neigeK = 0; this.soleilK = 0; this.voix = null; this._plans.clear();
    if (!farm.s) return;
    const S = this.S();
    if (!saved) { farm.s.ev = null; this.S(); }
    evNeige.stareT = 0;
    evPoserInter();
  },
  // chaque matin
  jourNouveau() {
    const S = this.S(), d = farm.s.day;
    S.recents = S.recents.filter((r) => r.d >= d - 3);
    for (const k in S.faits) { const j = +k.slice(k.indexOf(':') + 1); if (j < d - 2) delete S.faits[k]; }
    delete this.force.nuit_noire;
    this.prodige(d);
    // la poussière d'étoiles de la nuit : on la trouve au matin
    if (S.poussiere && S.poussiere.jour < d) S.poussiere = null;
    // les pierres tombées du ciel refroidissent
    let froid = false;
    for (const q of game.world.props) if (q.id === 'ev_cratere' && q.data && q.data.lit && q.data.jour < d - 1) { farm.setPropData(q, { lit: false }); froid = true; }
    if (froid) game.world.collectLights();
    evPoserInter();
    // annonces du matin
    setTimeout(() => {
      if (game.dying || !farm.s) return;
      if (this.jourNeige()) ui.subtitle('', '(Un froid à fendre les pierres, ce matin.)', 4);
      else if (this.jourSoleil()) ui.subtitle('', '(Le soleil tape déjà comme à midi.)', 4);
    }, 7800);
  },
};
// le programme météo d'avant nos retouches (renseigné plus bas, quand on emballe weather.dayPlan)
let EV_PLAN0 = (seed, d) => weather.dayPlan(seed, d);

// ---------------------------------------------------------------- la météo : neige partout, soleil écrasant
{
  const _plan = weather.dayPlan.bind(weather);
  EV_PLAN0 = _plan;
  weather.dayPlan = function (seed, day) {
    const P = _plan(seed, day);
    if (!farm.s || farm.s.seed !== seed) return P;
    const E = evenements;
    if (E.soleil(day)) {
      P.plan = [[0, 'heat']]; P.kind = 'ecrasant'; P.heat = true; P.rain = false; P.storm = false; P.dry = false; P.frost = false; P.ecrasant = true;
    } else if (E.neige(day)) {
      const r = mulberry32(seed * 131 + day * 17)();
      const a = 6.5 + r * 2.5, b = a + 3.5 + r * 2, c = b + 1 + r, e = c + 3 + r * 2;
      P.plan = [[0, 'cloudy'], [a, 'rain'], [b, 'cloudy'], [c, 'rain'], [Math.min(23.5, e), 'cloudy']];
      P.kind = 'neige'; P.rain = true; P.storm = false; P.heat = false; P.dry = false; P.neige = true;
    }
    // le lendemain de la neige : gel au petit matin (les jeunes pousses fragiles y restent)
    if (!P.neige && !P.ecrasant && E.neige(day - 1) && !P.frost) {
      const st95 = evEtat(P, 9.5);
      P.frost = true; P.plan = [[0, 'frost'], [9.5, st95 === 'frost' ? 'clear' : st95], ...P.plan.filter(([h]) => h > 9.5)];
      if (P.kind === 'soleil') P.kind = 'gel';
    }
    return P;
  };
}

// ---------------------------------------------------------------- la NUIT NOIRE
const evNuitNoire = {
  whT: 6, subT: 25, dit: 0, cineFaite: -1,
  update(dt, eye, basis, sky) {
    const E = evenements, k = E.noirK, S = E.S(), p = game.player, s = farm.s;
    if (k <= 0.01) { E.voix = null; return; }
    const w = game.world, hh = evHH();
    // le début : la lune s'éteint, puis les étoiles (une courte scène, si l'on est dehors)
    if (k > 0.25 && S.nuit.debut !== s.day && !game.sleeping && !cine.on && !ui.panel) {
      S.nuit.debut = s.day;
      if (E.dehors() && typeof cinematiques !== 'undefined') cinematiques.nuitNoire();
      else ui.subtitle('', '(Dehors, la nuit est devenue noire.)', 4);
    }
    // la voix : quelque part dans le noir, à une trentaine de pas ; elle se déplace quand on s'éloigne
    if (!E.voix && k > 0.6 && S.nuit.tu !== s.day && S.nuit.repondu !== s.day && !p.underground) E.voix = evNuitNoire.placerVoix(28 + Math.random() * 14);
    const V = E.voix;
    if (V) {
      const d = Math.hypot(V.x - p.pos[0], V.z - p.pos[2]);
      if (d > 70 || p.underground) E.voix = evNuitNoire.placerVoix(30 + Math.random() * 10);
      // une brume froide, là où elle attend
      if (d < 40 && Math.random() < dt * 5) particles.spawn(V.x + (Math.random() - 0.5) * 1.2, V.y + 0.3 + Math.random() * 1.6, V.z + (Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 0.3, 0.15, (Math.random() - 0.5) * 0.3, [0.06, 0.05, 0.1, 0.35], 0.4, 2.5, 0, false);
      if (d < 7 && !V.vu && !ui.panel) { V.vu = true; ui.subtitle('', '(Quelqu’un respire, tout près.)', 3.5); }
    }
    // les murmures (spatialisés : ils viennent de la voix, ou de partout)
    this.whT -= dt * (0.6 + 0.4 * EV_BIZ());
    if (this.whT <= 0 && k > 0.5) {
      const Vd = V ? Math.hypot(V.x - p.pos[0], V.z - p.pos[2]) : 99;
      this.whT = (Vd < 12 ? 2.5 : 7) + Math.random() * 9;
      let pan = Math.random() * 2 - 1, vol = 0.35 + Math.random() * 0.25;
      if (V) {
        const a = Math.atan2(V.x - eye[0], V.z - eye[2]), f = Math.atan2(basis.r[0], basis.r[2]);
        pan = clamp(Math.sin(a - f + Math.PI / 2), -1, 1) * 0.9;
        vol = clamp(1.15 - Vd / 45, 0.25, 1.1);
      }
      if (p.underground) vol *= 0.3;
      sound.whisper && sound.whisper(pan, vol);
      if (Math.random() < 0.3) setTimeout(() => sound.whisper && sound.whisper(-pan * 0.6, vol * 0.7), 700);
    }
    this.subT -= dt;
    if (this.subT <= 0 && k > 0.6 && !p.underground) {
      this.subT = 28 + Math.random() * 30 / EV_BIZ();
      const nom = s.prenom || (s.fem ? 'Jeanne' : 'Jean');
      const Vd = V ? Math.hypot(V.x - p.pos[0], V.z - p.pos[2]) : 99;
      const L = Vd < 10
        ? [`(… « ${nom} » …)`, `(… « ${nom}, viens » …)`]
        : ['(… quelqu’un murmure votre nom …)', '(… votre nom, encore, dans le noir …)'];
      ui.subtitle('', pick(L), 4);
    }
    // on a peur, dans le noir
    if (!game.world.covered(eye[0], eye[1], eye[2]) && !game.lantern) strange.fear = Math.max(strange.fear || 0, 0.18 * k);
    void w; void hh;
  },
  placerVoix(r) {
    const p = game.player, w = game.world;
    for (let k = 0; k < 16; k++) {
      const a = Math.random() * TAU, x = p.pos[0] + Math.sin(a) * r, z = p.pos[2] + Math.cos(a) * r;
      if (!w.inside(x, z, 20) || w.heightAt(x, z) < w.waterLevel + 0.3) continue;
      const y = w.groundAt(x, z, w.heightAt(x, z) + 1, 0.6);
      if (w.covered(x, y + 1, z)) continue;
      return { x, y, z, vu: false };
    }
    return null;
  },
  sky(sky) {
    const k = evenements.noirK;
    if (k <= 0) return;
    const d = 1 - 0.86 * k;
    sky.moonCol = v3.scale(sky.moonCol, 1 - 0.97 * k); sky.moonVis *= 1 - k; sky.stars *= 1 - k;
    sky.amb = v3.scale(sky.amb, 1 - 0.8 * k); sky.zen = v3.scale(sky.zen, d); sky.hor = v3.scale(sky.hor, d); sky.haze = v3.scale(sky.haze, d);
    sky.cloudLit = v3.scale(sky.cloudLit, d); sky.cloudDark = v3.scale(sky.cloudDark, d); sky.glow = v3.scale(sky.glow, d);
    sky.fog = [sky.fog[0] * (1 - 0.6 * k), lerp(sky.fog[1], Math.min(sky.fog[1], 70), k)];
    sky.nightLit = 1;
  },
  fx(fx, tint) { const k = evenements.noirK; if (k > 0) fx[0] = Math.max(fx[0], 0.22 * k); },
};
// la voix : on peut lui répondre (touche E, tout près, dans le noir)
HOOKS.target.push((eye, f, cand) => {
  const V = evenements.voix;
  if (!V || evenements.noirK < 0.5) return;
  const dx = V.x - eye[0], dy = V.y + 1.2 - eye[1], dz = V.z - eye[2], d = Math.hypot(dx, dy, dz);
  if (d > 2.8) return;
  if ((dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1) < 0.6) return;
  cand({ kind: 'hook', use: () => { if (typeof divins !== 'undefined') divins.voix(); } }, d);
});
// les lanternes (et toutes les lumières) portent moins loin
HOOKS.load.push(() => {
  if (game._evLights) return;
  game._evLights = true;
  const _gl = game.gatherLights.bind(game);
  game.gatherLights = function (eye, basis) {
    const r = _gl(eye, basis);
    const k = evenements.noirK;
    if (k > 0 && r && r.pos) {
      for (let i = 0; i < r.n; i++) { r.pos[i * 4 + 3] *= 1 - 0.45 * k; r.col[i * 3] *= 1 - 0.25 * k; r.col[i * 3 + 1] *= 1 - 0.25 * k; r.col[i * 3 + 2] *= 1 - 0.25 * k; }
      if (r.gunLight) r.gunLight = r.gunLight.map((v) => v * (1 - 0.5 * k));
    }
    return r;
  };
});
// une nuit noire chasse la nuit rouge (l'almanach doit rester juste)
{
  const _nd = strange.newDay.bind(strange);
  strange.newDay = function (info) { const r = _nd(info); if (this.s && farm.s && evenements.nuitNoire(farm.s.day)) this.s.redTonight = false; return r; };
}

// ---------------------------------------------------------------- NEIGE PARTOUT
const evNeige = {
  coldAcc: 0, dit: -1, souffleT: 0, stareT: 0,
  update(dt, eye, basis, sky) {
    const E = evenements, S = E.S(), s = farm.s, p = game.player, w = game.world, c = weather.cur;
    const jour = E.jourNeige();
    if (E.force.neige) { c.cloud = Math.max(c.cloud, 0.88); c.heat = 0; c.storm = Math.min(c.storm, 0.2); }
    // flocons : la « pluie » devient neige, dans toute la vallée
    let k = 0;
    if (jour && !p.underground && !strange.inEnvers()) k = E.force.neige ? 0.85 : clamp(c.rain * 1.25, 0, 1);
    E.neigeK += (k - E.neigeK) * Math.min(1, dt * 0.5);
    if (E.neigeK > 0.02) { vallee.snowK = Math.max(vallee.snowK, E.neigeK); vallee.rainK = 0; }
    // le sol blanchit pendant qu'il neige, fond lentement ensuite (heures de jeu)
    const dH = dt * (game.fastTime ? 60 : 1) * game.timeScale * 24 / w.dayLength;
    if (E.neigeK > 0.05) S.neigeSol = Math.min(1, S.neigeSol + dH * 0.16 * E.neigeK);
    else if (S.neigeSol > 0) S.neigeSol = Math.max(0, S.neigeSol - dH * (jour ? 0.02 : c.heat > 0.5 ? 0.15 : 0.06));
    if (!jour) { this.coldAcc = 0; return; }
    // on l'annonce quand elle commence à tomber
    if (E.neigeK > 0.2 && this.dit !== s.day && E.dehors()) { this.dit = s.day; evenements.retenir('neige'); evenements.reagir('neige'); }
    // le froid : comme en montagne (faim plus vite ; la nuit, ou sous la neige, sans feu ni toit, il tue)
    const inside = w.covered(eye[0], eye[1], eye[2]) || p.underground;
    if (inside) { this.coldAcc = 0; return; }
    if (!game.sleeping && game.mode === 'play') p.food = Math.max(0, p.food - dt / w.dayLength * 55);
    const h = npcs.hour(), nuit = h >= 19 || h < 7;
    const chaud = game.nearFire(p.pos) || vallee.fireNear > 0.6 || BUFF.on('chaleur') || BUFF.on('potion_chaleur') || farm.s.inv.manteau_fourrure;
    // l'haleine fume
    this.souffleT -= dt;
    if (this.souffleT <= 0) { this.souffleT = 2.2 + Math.random(); const f = basis.f; particles.spawn(eye[0] + f[0] * 0.45, eye[1] - 0.12, eye[2] + f[2] * 0.45, f[0] * 0.3, 0.12, f[2] * 0.3, [0.9, 0.92, 0.95, 0.35], 0.12, 1.4, -0.05, false); particles.list[particles.list.length - 1].grow = 2; }
    if ((nuit || E.neigeK > 0.6) && !chaud && !game.sleeping && !cine.on) {
      this.coldAcc += dt;
      if (this.coldAcc > 1 && this.cold1 !== s.day) { this.cold1 = s.day; ui.subtitle('', '(Le froid vous mord les doigts.)', 3.5); }
      // 3 PV toutes les 6 s (25 PV par heure de jeu) : quatre heures dehors, la nuit, pour en mourir
      if (this.coldAcc > 14) { this.coldAcc = 8; const pn = strange.placeName(p.pos); play.hurt(3, null, 'Mort de froid, un jour de neige' + (pn ? ' — ' + pn : '')); }
    } else this.coldAcc = Math.max(0, this.coldAcc - dt * 2);
  },
  sky(sky) {
    const E = evenements, S = E.S(), k = E.neigeK, g = S.neigeSol;
    if (g > 0.01) sky.frost = Math.max(sky.frost || 0, Math.min(1.6, g * 1.6));
    if (k > 0.02) {
      sky.wet = Math.min(sky.wet, 0.1);
      sky.haze = v3.lerp(sky.haze, v3.scale([0.78, 0.8, 0.84], Math.max(0.1, sky.amb[1] * 1.5)), 0.35 * k);
      sky.fog = [sky.fog[0], sky.fog[1] * (1 - 0.35 * k)];
    }
  },
};

// ---------------------------------------------------------------- LE SOLEIL ÉCRASANT (et la tache noire)
const evSoleil = {
  stareT: 0, voitT: 0, glare: 0, el: null, dit: -1, warn: 0,
  update(dt, eye, basis, sky) {
    const E = evenements, S = E.S(), s = farm.s, p = game.player;
    const on = E.jourSoleil() && !strange.inEnvers();
    E.soleilK += ((on ? 1 : 0) - E.soleilK) * Math.min(1, dt * 0.3);
    if (E.force.soleil) { const c = weather.cur; c.cloud = Math.min(c.cloud, 0.05); c.rain = 0; c.storm = 0; c.fog = 0; c.heat = Math.max(c.heat, 1); }
    const T = S.tache;
    // la tache s'estompe très lentement (heures de jeu)
    const dH = dt * (game.fastTime ? 60 : 1) * game.timeScale * 24 / game.world.dayLength;
    if (T.a > 0) { T.a = Math.max(0, T.a - dH / 22); T.r = Math.max(0, T.r - dH * 0.5); if (T.a <= 0) { T.a = 0; T.r = 0; } }
    // regarder le soleil
    this.glare = 0;
    const protege = BUFF.on('soleil') || BUFF.on('potion_soleil');
    if (E.soleilK > 0.3 && sky && sky.day > 0.3 && sky.e > 0.04 && !p.underground && game.mode === 'play' && !game.sleeping && !cine.on && !ui.panel) {
      const c = v3.dot(basis.f, sky.sunDir);
      if (c > 0.9) {
        // le soleil est-il bien visible (pas derrière un toit, une colline) ? on vérifie de temps en temps
        this.voitT -= dt;
        if (this.voitT <= 0) { this.voitT = 0.3; const w = game.world; this.visible = !w.covered(eye[0], eye[1], eye[2]) && !w.raycastBlocks(eye, sky.sunDir, 60) && !w.raycastTerrain(eye, sky.sunDir, 400); }
      } else this.visible = false;
      if (this.visible && c > 0.9) this.glare = clamp((c - 0.9) / 0.09, 0, 1) * sky.sunVis;
      if (this.visible && c > 0.985 && sky.sunVis > 0.4) {
        this.stareT += dt;
        if (this.stareT > 1.3 && this.warn !== Math.floor(s.hours)) { this.warn = Math.floor(s.hours); ui.subtitle('', protege ? '(La potion vous protège.)' : '(Le soleil vous brûle les yeux.)', 2.5); }
        if (this.stareT > 2.5 && !protege) {
          const first = T.a < 0.01;
          T.a = Math.min(0.96, T.a + dt * 0.9);
          T.r = Math.min(34, Math.max(T.r, 5 + (this.stareT - 2.5) * 5));
          if (first) sound.hurt && sound.hurt(5);
        }
      } else this.stareT = Math.max(0, this.stareT - dt * 3);
    } else this.stareT = Math.max(0, this.stareT - dt * 3);
    // la chaleur : on s'épuise au soleil, à midi
    if (on) {
      const h = npcs.hour(), w = game.world;
      if (h > 10.5 && h < 17 && !w.covered(eye[0], eye[1], eye[2]) && !p.underground && game.mode === 'play' && !game.sleeping) {
        p.food = Math.max(0, p.food - dt / w.dayLength * 25);
        if (p.sprinting) p.stamina = Math.max(0, p.stamina - dt * 0.03);
        if (this.dit !== s.day && h > 11) { this.dit = s.day; evenements.retenir('soleil'); evenements.reagir('soleil'); }
      }
    }
    this.dom();
  },
  dom() {
    const T = evenements.S().tache;
    if (!this.el) {
      const st = document.createElement('style');
      st.textContent = '#ev-tache{position:fixed;left:50%;top:50%;border-radius:50%;pointer-events:none;z-index:2;transform:translate(-50%,-50%);display:none;filter:blur(3px);background:radial-gradient(circle,rgba(6,3,10,1) 0%,rgba(8,4,12,.94) 34%,rgba(18,10,22,.62) 55%,rgba(30,20,30,.2) 66%,rgba(0,0,0,0) 72%)}';
      document.head.appendChild(st);
      this.el = document.createElement('div'); this.el.id = 'ev-tache';
      document.body.appendChild(this.el);
    }
    const show = T.a > 0.01 && game.mode === 'play' && !game.dying && farm.s && !farm.s.over;
    if (show !== this.shown) { this.shown = show; this.el.style.display = show ? 'block' : 'none'; }
    if (!show) return;
    const r = Math.max(2, T.r) * (1 + Math.sin(game.time * 0.7) * 0.02);
    this.el.style.width = this.el.style.height = (r * 2).toFixed(2) + 'vmin';
    this.el.style.opacity = Math.min(1, T.a).toFixed(3);
  },
  effacer() { const T = evenements.S().tache; T.a = 0; T.r = 0; this.stareT = 0; this.dom(); },
  sky(sky) {
    const k = evenements.soleilK;
    if (k <= 0.01) return;
    const d = k * sky.day;
    if (d <= 0) return;
    sky.sunCol = v3.scale(sky.sunCol, 1 + 0.6 * d);
    sky.amb = v3.add(v3.scale(sky.amb, 1 + 0.2 * d), v3.scale([0.07, 0.06, 0.03], d));
    sky.hor = v3.lerp(sky.hor, [1.02, 0.96, 0.84], 0.45 * d);
    sky.zen = v3.lerp(sky.zen, [0.55, 0.66, 0.84], 0.4 * d);
    sky.haze = v3.lerp(sky.haze, [0.98, 0.94, 0.84], 0.35 * d);
    sky.sunDisk = v3.scale(sky.sunDisk, 1 + 1.4 * d);
    sky.glow = v3.scale(sky.glow, 1 + d);
  },
  fx(fx, tint, sky) {
    const k = evenements.soleilK * (sky ? sky.day : 1);
    if (k <= 0.01 && this.glare <= 0) return;
    const a = 0.05 * k + this.glare * 0.4;
    if (a > tint[3]) { tint[0] = 1; tint[1] = 0.97; tint[2] = 0.86; tint[3] = a; }
  },
};

// ---------------------------------------------------------------- les prodiges : effets
// point sur un dôme autour de la caméra (les choses du ciel restent en deçà du brouillard)
function evDome(cam, az, el, R) { const c = Math.cos(el); return [cam[0] + Math.sin(az) * c * R, cam[1] + Math.sin(el) * R, cam[2] + Math.cos(az) * c * R]; }
function evSol(x, z) { const w = game.world; return Math.max(w.heightAt(x, z), w.waterLevel); }
// un point de terre ferme, dégagé, à une certaine distance du joueur
function evPointLibre(r0, r1, opts) {
  const w = game.world, p = game.player.pos;
  opts = opts || {};
  for (let k = 0; k < 40; k++) {
    const a = opts.a !== undefined ? opts.a + (Math.random() - 0.5) * 0.8 : Math.random() * TAU, r = r0 + Math.random() * (r1 - r0);
    const x = p[0] + Math.sin(a) * r, z = p[2] + Math.cos(a) * r;
    if (!w.inside(x, z, 40) || w.heightAt(x, z) < w.waterLevel + 0.6) continue;
    if (opts.libre !== false && typeof interditDeBatir === 'function' && interditDeBatir(x, z, 4)) continue;
    if (w.normalAt(x, z)[1] < 0.85) continue;
    return { x, z, y: w.heightAt(x, z) };
  }
  return null;
}
const EV_FX = {
  // ---- une pluie d'étoiles filantes
  etoiles: {
    debut(E) {
      E.traits = []; E.spawnT = 0;
      this.reagir('etoiles');
      // au matin, on trouvera de la poussière d'étoile quelque part près de la ferme
      const w = game.world, F = w.farm.f;
      for (let k = 0; k < 30; k++) {
        const a = Math.random() * TAU, r = 25 + Math.random() * 80, x = F.x + Math.sin(a) * r, z = F.z + Math.cos(a) * r;
        if (w.heightAt(x, z) < w.waterLevel + 0.5 || w.normalAt(x, z)[1] < 0.9 || farm.crop(x, z)) continue;
        this.S().poussiere = { x, z, y: w.heightAt(x, z), jour: farm.s.day + 1 };
        break;
      }
    },
    update(E, dt, eye) {
      E.spawnT -= dt;
      if (E.spawnT <= 0 && E.k < 0.95) {
        E.spawnT = 0.25 + Math.random() * 1.1;
        const az = Math.random() * TAU, el = 0.5 + Math.random() * 0.55, R = 62;
        const d = [Math.sin(az + 1.3 + Math.random()) * 0.8, -0.35 - Math.random() * 0.3, Math.cos(az + 1.3 + Math.random()) * 0.8];
        const L = Math.hypot(...d);
        E.traits.push({ p: evDome(eye, az, el, R), v: d.map((x) => x / L * 45), t: 0, life: 0.6 + Math.random() * 0.7, len: 9 + Math.random() * 8 });
      }
      for (const T of E.traits) {
        T.t += dt; T.p = [T.p[0] + T.v[0] * dt, T.p[1] + T.v[1] * dt, T.p[2] + T.v[2] * dt];
        if (Math.random() < dt * 30) particles.spawn(T.p[0], T.p[1], T.p[2], T.v[0] * 0.05, T.v[1] * 0.05, T.v[2] * 0.05, [0.9, 0.95, 1.2, 0.8], 0.35, 0.5, 0, true);
      }
      E.traits = E.traits.filter((T) => T.t < T.life);
    },
    sky(E, sky) { sky.stars = Math.max(sky.stars, sky.night * 0.9); },
    draw(E, buf) {
      if (game.player.underground) return;
      PE.buf = buf; PE.fl = FX_EMIT; PE.frame(0, 0, 0, 0, 1);
      for (const T of E.traits) {
        const f = 1 - T.t / T.life, L = Math.hypot(...T.v), n = T.v.map((x) => x / L);
        const ry = Math.atan2(n[0], n[2]), rx = -Math.atan2(n[1], Math.hypot(n[0], n[2]));
        PE.box(T.p[0] - n[0] * T.len * 0.15, T.p[1] - n[1] * T.len * 0.15, T.p[2] - n[2] * T.len * 0.15, 0.45, 0.45, T.len * 0.3, [2.2 * f + 0.3, 2.2 * f + 0.3, 2.4 * f + 0.5], TL.plain, ry, rx);
        PE.box(T.p[0] - n[0] * T.len * 0.6, T.p[1] - n[1] * T.len * 0.6, T.p[2] - n[2] * T.len * 0.6, 0.25, 0.25, T.len * 0.8, [0.9 * f + 0.2, 1.0 * f + 0.25, 1.4 * f + 0.35], TL.plain, ry, rx);
      }
      PE.fl = 0;
    },
  },
  // ---- l'aurore : des voiles verts et violets au nord
  aurore: {
    debut(E) { E.ph = Math.random() * 10; this.reagir('aurore'); },
    update(E, dt, eye) {
      if (game.player.underground) return;
      const k = Math.min(1, E.k * 6, (1 - E.k) * 5);
      // des rayons verticaux, serrés, qui ondulent : des voiles
      const n = Math.floor(dt * 26 * k + Math.random());
      for (let i = 0; i < n; i++) {
        const u = Math.random(), az = Math.PI + (u - 0.5) * 2.4, band = Math.sin(u * 9 + game.time * 0.25 + E.ph) * 0.1;
        const el0 = 0.36 + band, R = 66, h = 5 + ((Math.random() * 5) | 0);
        const g = Math.random(), col = g < 0.72 ? [0.2, 1.05, 0.5, 0.1] : g < 0.9 ? [0.25, 0.75, 0.9, 0.09] : [0.75, 0.3, 0.95, 0.09];
        for (let j = 0; j < h; j++) {
          const p = evDome(eye, az, el0 + j * 0.045, R), c = j < 2 ? col : [col[0] * 0.8, col[1] * 0.85, col[2], col[3] * (1 - j / (h + 2))];
          particles.spawn(p[0], p[1], p[2], 0, -0.3, 0, c, 1.1 + Math.random() * 0.5, 1.6 + Math.random() * 0.8, 0, true);
        }
      }
    },
    sky(E, sky) {
      const k = Math.min(1, E.k * 6, (1 - E.k) * 5) * sky.night;
      if (k <= 0) return;
      sky.amb = v3.add(sky.amb, v3.scale([0.02, 0.07, 0.04], k)); sky.hor = v3.add(sky.hor, v3.scale([0.02, 0.09, 0.05], k)); sky.haze = v3.add(sky.haze, v3.scale([0.01, 0.05, 0.03], k));
    },
  },
  // ---- l'éclipse
  eclipse: {
    debut(E) { E.dit = false; sound.silence && sound.silence(40); this.reagir('eclipse'); },
    update(E) {
      const k = this.eclipseK(E);
      if (k > 0.6 && !E.dit) { E.dit = true; sound.howl && sound.howl(80); }
    },
    sky(E, sky) {
      const k = this.eclipseK(E);
      if (k <= 0) return;
      const d = 1 - 0.9 * k;
      sky.sunCol = v3.scale(sky.sunCol, 1 - 0.96 * k); sky.amb = v3.scale(sky.amb, 1 - 0.82 * k); sky.zen = v3.scale(sky.zen, d); sky.hor = v3.lerp(v3.scale(sky.hor, d), [0.5, 0.25, 0.12], 0.25 * k);
      sky.haze = v3.scale(sky.haze, d); sky.glow = v3.scale(sky.glow, 1 - k); sky.cloudLit = v3.scale(sky.cloudLit, d); sky.cloudDark = v3.scale(sky.cloudDark, d);
      sky.stars = Math.max(sky.stars, 0.8 * smoothstep(0.55, 1, k)); sky.sunDisk = v3.lerp(sky.sunDisk, [0.02, 0.02, 0.03], k); sky.nightLit = k > 0.6 ? 1 : sky.nightLit;
      sky.shadowK *= 1 - k;
    },
  },
  // ---- la grêle
  grele: {
    debut(E) {
      E.tapT = 0; E.hurtT = 0;
      // les jeunes pousses sont hachées
      let n = 0;
      for (const k in farm.s.crops) { const c = farm.s.crops[k]; if (c.c && !c.dead && !c.tree && CROPS[c.c] && c.g < CROPS[c.c].h * 0.6 && Math.random() < 0.3) { c.dead = true; n++; } }
      if (n) farm.dirtyProps = true;
      this.reagir('grele');
      entities.scare(game.player.pos[0], game.player.pos[2], 80);
    },
    update(E, dt, eye) {
      const p = game.player, w = game.world;
      if (p.underground) return;
      weather.cur.rain = Math.max(weather.cur.rain, 0.6);
      const k = Math.min(1, E.k * 8, (1 - E.k) * 6);
      for (let i = 0; i < dt * 140 * k; i++) {
        const a = Math.random() * TAU, r = Math.random() * 16, x = eye[0] + Math.sin(a) * r, z = eye[2] + Math.cos(a) * r, y = eye[1] + 6 + Math.random() * 6;
        if (w.covered(x, y - 6, z)) continue;
        particles.spawn(x, y, z, (Math.random() - 0.5) * 0.6, -14 - Math.random() * 4, (Math.random() - 0.5) * 0.6, [0.92, 0.95, 1, 0.95], 0.05, 0.7, 6, false);
      }
      E.tapT -= dt;
      if (E.tapT <= 0 && sound.ok) { E.tapT = 0.05; const t = sound.at(); for (let i = 0; i < 3; i++) sound.noiseHit(t + Math.random() * 0.05, 0.02, 'bandpass', 2200 + Math.random() * 2600, 3, 0.012 * k, sound.amb); }
      // un grêlon qui fait mal toutes les 3,2 s : une vingtaine de PV si l'on reste dehors toute l'averse
      if (!w.covered(eye[0], eye[1], eye[2]) && !game.sleeping) { E.hurtT += dt; if (E.hurtT > 3.2) { E.hurtT = 0; play.hurt(1, null, 'Lapidé par la grêle'); } }
    },
  },
  // ---- le tremblement de terre : Durn se retourne
  seisme: {
    debut(E) {
      sound.rumble && sound.rumble(); setTimeout(() => sound.rumble && sound.rumble(), 1600);
      this.reagir('seisme');
      entities.scare(game.player.pos[0], game.player.pos[2], 200);
      for (const e of entities.list) if (e.kind === 'dog' && e.owner) sound.bark && sound.bark(1, 0);
      // rarement, on voit Durn lui-même se lever sur la montagne (une fois dans une vie, comme Aëla et Vesh)
      if (typeof divins !== 'undefined' && !divins.S().durn.vu && Math.random() < divins.chanceDurn()) setTimeout(() => divins.apparaitre('durn'), 4200);
    },
    update(E, dt, eye) {
      const k = Math.sin(clamp(E.k, 0, 1) * Math.PI);
      game.shakeT = Math.max(game.shakeT || 0, 0.25 + k * 0.8);
      if (Math.random() < dt * 20 * k) { const a = Math.random() * TAU, r = 2 + Math.random() * 12; particles.spawn(eye[0] + Math.sin(a) * r, evSol(eye[0] + Math.sin(a) * r, eye[2] + Math.cos(a) * r) + 0.1, eye[2] + Math.cos(a) * r, (Math.random() - 0.5), 0.6 + Math.random(), (Math.random() - 0.5), [0.55, 0.5, 0.42, 0.5], 0.25, 1.5, 0.5, false); }
    },
  },
  // ---- le mur de brouillard
  brouillard: {
    debut(E) { this.reagir('brouillard'); E.voixT = 20; },
    update(E, dt) {
      const k = this.brouillardK(E);
      weather.cur.fog = Math.max(weather.cur.fog, k);
      E.voixT -= dt;
      if (E.voixT <= 0 && k > 0.8) { E.voixT = 30 + Math.random() * 40; if (Math.random() < 0.3 * EV_BIZ()) { sound.whisper && sound.whisper(Math.random() * 2 - 1, 0.5); setTimeout(() => ui.subtitle('???', pick(['… par ici…', '… reste sur le chemin…', '… tu entends les pas ? ce sont les tiens…']), 3), 1200); } else sound.steps1 && sound.steps1(0.3, (Math.random() - 0.5) * 20); }
    },
    sky(E, sky) { const k = this.brouillardK(E); if (k > 0) sky.fog = [lerp(sky.fog[0], 2, k), lerp(sky.fog[1], 20, k)]; },
  },
  // ---- les feux follets du marais : ils mènent quelque part
  follets: {
    debut(E) {
      const w = game.world, L = w.lm.marais;
      E.feux = [];
      if (!L) { E.stop = true; return; }
      // une cache : là où finit la file des feux
      let bx = L.x, bz = L.z;
      for (let k = 0; k < 40; k++) { const a = Math.random() * TAU, r = L.r * (0.3 + Math.random() * 0.6), x = L.x + Math.sin(a) * r, z = L.z + Math.cos(a) * r; if (w.heightAt(x, z) > w.waterLevel + 0.25) { bx = x; bz = z; break; } }
      const a0 = Math.random() * TAU;
      for (let i = 0; i < 7; i++) { const t = i / 6, x = bx + Math.sin(a0) * (1 - t) * 60, z = bz + Math.cos(a0) * (1 - t) * 60; E.feux.push({ x, z, bx: x, bz: z, y: evSol(x, z) + 0.9, ph: Math.random() * 6, i }); }
      E.cache = { x: bx, z: bz };
      const p = game.player.pos;
    },
    update(E, dt) {
      const p = game.player;
      for (const F of E.feux) {
        F.y = evSol(F.x, F.z) + 0.8 + Math.sin(game.time * 1.4 + F.ph) * 0.25;
        F.x = F.bx + Math.sin(game.time * 0.4 + F.ph) * 0.8; F.z = F.bz + Math.cos(game.time * 0.33 + F.ph) * 0.8;
        if (!F.eteint && Math.hypot(F.x - p.pos[0], F.z - p.pos[2]) < 5) { F.eteint = true; sound.whisper && sound.whisper(0, 0.2); }
      }
      // le dernier feu s'enfonce dans la terre : il y a quelque chose, là
      const last = E.feux[E.feux.length - 1];
      if (last && last.eteint && !E.trouve) {
        E.trouve = true;
        const S = this.S(), w = game.world;
        S.follets = { x: E.cache.x, z: E.cache.z, id: 'follets_' + farm.s.day };
        evPoserInter();
        particles.spawn(E.cache.x, evSol(E.cache.x, E.cache.z) + 0.3, E.cache.z, 0, 1.5, 0, [0.4, 0.9, 1.2, 0.8], 0.3, 1.5, -0.5, true);
        ui.subtitle('', '(La terre, là, a été remuée il y a longtemps.)', 4);
        void w;
      }
      if (npcs.hour() > 5 && npcs.hour() < 19) E.stop = true;
    },
    draw(E, buf) {
      PE.buf = buf; PE.fl = FX_EMIT;
      for (const F of E.feux) { if (F.eteint) continue; PE.frame(F.x, F.y, F.z, game.time + F.ph, 1); PE.box(0, 0, 0, 0.2, 0.2, 0.2, [0.55, 1.15, 1.5], TL.plain, game.time * 2, game.time); }
      PE.fl = 0;
    },
    lights(E, eye) {
      const L = [];
      for (const F of E.feux) if (!F.eteint) { const d = Math.hypot(F.x - eye[0], F.z - eye[2]); if (d < 140) L.push({ x: F.x, y: F.y, z: F.z, r: 6, c: [0.25, 0.75, 1.0], d }); }
      L.sort((a, b) => a.d - b.d);
      return L.slice(0, 3);
    },
    fin(E) { if (E.feux) for (const F of E.feux) F.eteint = true; },
  },
  // ---- les cloches qui sonnent seules (un glas, lent)
  cloches: {
    debut(E) {
      E.n = 0; E.t0 = 0;
      const T = game.world.townInfo, p = game.player.pos;
      E.k = 0; E.vol = T ? clamp(1 - Math.hypot(p[0] - T.x, p[2] - T.z) / 1000, 0.08, 1) : 0.3;
      this.reagir('cloches');
    },
    update(E, dt) { E.t0 -= dt; if (E.t0 <= 0 && E.n < 9) { E.t0 = 3.2; E.n++; sound.bell && sound.bell(E.vol); } if (E.n >= 9 && E.t0 <= 0) E.stop = true; },
  },
  // ---- la météorite : une boule de feu, un trou dans un pré, de la poussière d'étoile
  meteorite: {
    debut(E) {
      const pt = evPointLibre(140, 380);
      if (!pt) { E.stop = true; return; }
      E.cible = pt; E.phase = 0; E.t0 = 0;
      const az = Math.random() * TAU;
      E.depart = [pt.x + Math.sin(az) * 700, pt.y + 420, pt.z + Math.cos(az) * 700];
      this.reagir('meteorite');
    },
    update(E, dt) {
      E.t0 += dt;
      const T = 5;
      if (E.phase === 0) {
        const f = Math.min(1, E.t0 / T);
        E.pos = [lerp(E.depart[0], E.cible.x, f), lerp(E.depart[1], E.cible.y, f), lerp(E.depart[2], E.cible.z, f)];
        if (Math.random() < dt * 40) particles.spawn(E.pos[0], E.pos[1], E.pos[2], (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, [1.2, 0.6, 0.2, 0.9], 1.2, 2.5, 0, true);
        if (f >= 1) {
          E.phase = 1;
          const p = game.player.pos, d = Math.hypot(E.cible.x - p[0], E.cible.z - p[2]);
          weather.flash = Math.max(weather.flash, 1.2); sound.thunder && sound.thunder(clamp(1.2 - d / 500, 0.4, 1)); sound.rumble && sound.rumble();
          game.shakeT = Math.max(game.shakeT || 0, d < 200 ? 0.8 : 0.35);
          entities.scare(E.cible.x, E.cible.z, 120);
          const q = farm.addProp({ id: 'ev_cratere', x: E.cible.x, y: E.cible.y, z: E.cible.z, r: Math.random() * TAU, data: { jour: farm.s.day, h: farm.s.hours, lit: true } });
          void q;
          game.world.collectLights();
          evPoserInter();
          for (let k = 0; k < 40; k++) particles.spawn(E.cible.x, E.cible.y + 1, E.cible.z, (Math.random() - 0.5) * 14, Math.random() * 12, (Math.random() - 0.5) * 14, [1.2, 0.7, 0.3, 1], 0.3, 1 + Math.random(), 9, true);
          E.stop = true;
        }
      }
    },
    draw(E, buf, sbuf, cam) {
      if (!E.pos || E.phase !== 0) return;
      // on la dessine sur le dôme du ciel, dans la direction où elle est
      const dx = E.pos[0] - cam[0], dy = E.pos[1] - cam[1], dz = E.pos[2] - cam[2], d = Math.hypot(dx, dy, dz) || 1, R = Math.min(d, 90);
      const px = cam[0] + dx / d * R, py = cam[1] + dy / d * R, pz = cam[2] + dz / d * R, s = 1.2 * R / 90 + 0.3;
      PE.buf = buf; PE.fl = FX_EMIT; PE.frame(px, py, pz, game.time * 3, 1);
      PE.box(0, 0, 0, s, s, s, [2.2, 1.4, 0.6], TL.plain, game.time * 5, game.time * 3);
      PE.box(0, 0, 0, s * 1.6, s * 0.5, s * 0.5, [1.6, 0.7, 0.25], TL.plain, game.time * 2);
      PE.fl = 0;
    },
    lights(E, eye) { return E.pos && E.phase === 0 ? [{ x: E.pos[0], y: E.pos[1], z: E.pos[2], r: 260, c: [1.2, 0.7, 0.35], d: 0 }] : []; },
  },
  // ---- un grand vol d'oiseaux migrateurs
  oiseaux: {
    debut(E) {
      const p = game.player.pos, a = Math.random() * TAU;
      E.dir = [Math.sin(a), Math.cos(a)];
      E.vols = [];
      for (let v = 0; v < 3; v++) {
        const off = (v - 1) * 34 + (Math.random() - 0.5) * 10, n = 11 + ((Math.random() * 9) | 0);
        const x0 = p[0] - E.dir[0] * 150 + E.dir[1] * off, z0 = p[2] - E.dir[1] * 150 - E.dir[0] * off;
        E.vols.push({ x: x0 - E.dir[0] * v * 40, z: z0 - E.dir[1] * v * 40, h: 34 + Math.random() * 14, n });
      }
      E.cri = 0;
      this.reagir('oiseaux');
    },
    update(E, dt) {
      for (const V of E.vols) { V.x += E.dir[0] * 12 * dt; V.z += E.dir[1] * 12 * dt; }
      E.cri -= dt;
      if (E.cri <= 0) { E.cri = 0.8 + Math.random() * 1.5; const p = game.player.pos, V = E.vols[(Math.random() * E.vols.length) | 0], d = Math.hypot(V.x - p[0], V.z - p[2]); if (d < 220) sound.animal && sound.animal('duck', clamp((V.x - p[0]) / 60, -1, 1), clamp(0.9 - d / 250, 0.05, 0.6)); }
    },
    draw(E, buf, sbuf, cam, t) {
      PE.buf = buf; PE.fl = 0;
      const h = Math.atan2(E.dir[0], E.dir[1]);
      for (const V of E.vols) {
        const y0 = evSol(V.x, V.z) + V.h;
        for (let i = 0; i < V.n; i++) {
          const side = i % 2 ? 1 : -1, rank = Math.ceil(i / 2);
          const x = V.x - E.dir[0] * rank * 2.6 + E.dir[1] * side * rank * 2.2, z = V.z - E.dir[1] * rank * 2.6 - E.dir[0] * side * rank * 2.2;
          const dx = x - cam[0], dz = z - cam[2];
          if (dx * dx + dz * dz > 250 * 250) continue;
          const fl = Math.sin(t * 7 + i * 0.7) * 0.5;
          PE.frame(x, Math.max(y0, cam[1] + 25) + Math.sin(i) * 0.5, z, h, 1.6);
          PE.box(0, 0, 0, 0.22, 0.2, 0.9, [0.22, 0.2, 0.18], TL.fur);
          PE.box(-0.5, 0.05, 0, 0.9, 0.04, 0.34, [0.3, 0.28, 0.26], TL.fur, 0, 0, fl);
          PE.box(0.5, 0.05, 0, 0.9, 0.04, 0.34, [0.3, 0.28, 0.26], TL.fur, 0, 0, -fl);
        }
      }
    },
  },
  // ---- la pluie de grenouilles
  grenouilles: {
    debut(E) {
      E.chute = []; E.spawnT = 0; E.n = 0;
      this.reagir('grenouilles');
    },
    update(E, dt, eye) {
      const w = game.world, p = game.player;
      E.spawnT -= dt;
      if (E.spawnT <= 0 && E.n < 45 && !p.underground) {
        E.spawnT = 0.15 + Math.random() * 0.4; E.n++;
        const a = Math.random() * TAU, r = 2 + Math.random() * 22, x = eye[0] + Math.sin(a) * r, z = eye[2] + Math.cos(a) * r;
        if (!w.covered(x, eye[1] + 3, z)) E.chute.push({ x, z, y: eye[1] + 16 + Math.random() * 6, vy: -6, rot: Math.random() * TAU });
      }
      for (const F of E.chute) {
        F.vy -= 20 * dt; F.y += F.vy * dt; F.rot += dt * 8;
        const g = w.groundAt(F.x, F.z, F.y + 0.5, 0.5);
        if (F.y <= g) {
          F.done = true;
          if (g < w.waterLevel) { splashAt(F.x, w.waterLevel, F.z); continue; }
          sound.frog && Math.random() < 0.4 && sound.frog(0.6);
          puffAt(F.x, g + 0.05, F.z, [70, 110, 50], 4, 0.8, false);
          const e = entities.add(w, 'frog', F.x, F.z, {}); e.lifeT = 150 + Math.random() * 60; e.scared = true; e.scareX = F.x + (Math.random() - 0.5); e.scareZ = F.z + (Math.random() - 0.5);
          if (Math.hypot(F.x - p.pos[0], F.z - p.pos[2]) < 0.8 && !game.sleeping) play.hurt(1, null, 'Assommé par une grenouille tombée du ciel');
        }
      }
      E.chute = E.chute.filter((F) => !F.done);
    },
    draw(E, buf) {
      PE.buf = buf; PE.fl = 0;
      for (const F of E.chute) { PE.frame(F.x, F.y, F.z, F.rot, 1); PE.box(0, 0, 0, 0.14, 0.08, 0.18, [0.32, 0.5, 0.22], TL.skin, 0, F.rot); PE.box(0, -0.04, 0.08, 0.2, 0.03, 0.05, [0.3, 0.45, 0.2], TL.skin); }
    },
  },
  // ---- un géant aperçu sur les crêtes, à l'aube
  geant: {
    debut(E) {
      const w = game.world, p = game.player.pos;
      let best = null;
      // sur une crête, du côté du soleil levant (sa silhouette se découpe sur le ciel clair)
      for (let k = 0; k < 48; k++) {
        const a = Math.PI / 2 + (k / 48 - 0.5) * 2.6, r = 130 + (k % 3) * 35, x = p[0] + Math.sin(a) * r, z = p[2] + Math.cos(a) * r;
        if (!w.inside(x, z, 30)) continue;
        const h = w.heightAt(x, z);
        if (h < w.waterLevel + 1) continue;
        const sc = h - p[1] + (Math.random() * 6);
        if (!best || sc > best.sc) best = { x, z, a, sc };
      }
      if (!best || game.player.underground) { E.stop = true; return; }
      E.x = best.x; E.z = best.z; E.heading = best.a + Math.PI / 2 * (Math.random() < 0.5 ? 1 : -1); E.phase = 0;
      E.rig = humanRig({ skin: '#8a7a68', hair: '#3a3028', hairStyle: 'long', beard: 'longue', top: '#5a4a38', bottom: '#4a3c2e', shoe: '#2a2018', coat: true, build: 'rond', face: TL.faceOld });
      E.vu = false;
    },
    update(E, dt, eye, basis) {
      if (!E.rig) return;
      const w = game.world;
      E.x += Math.sin(E.heading) * 1.6 * dt; E.z += Math.cos(E.heading) * 1.6 * dt; E.y = w.heightAt(E.x, E.z) - 0.5; E.phase += dt * 1.1;
      if (!E.vu && game.mode === 'play') {
        const dx = E.x - eye[0], dz = E.z - eye[2], d = Math.hypot(dx, dz);
        if ((dx * basis.f[0] + dz * basis.f[2]) / d > 0.85 && !game.world.covered(eye[0], eye[1], eye[2])) {
          E.vu = true; this.retenir('geant');
          sound.rumble && sound.rumble();
        }
      }
    },
    sky(E, sky) { if (E.rig) { const d = Math.hypot(E.x - game.player.pos[0], E.z - game.player.pos[2]); sky.fog = [Math.max(sky.fog[0], d * 0.45), Math.max(sky.fog[1], d * 1.35)]; } },
    draw(E, buf, sbuf, cam, t) {
      if (!E.rig) return;
      const k = Math.min(1, E.k * 8, (1 - E.k) * 6);
      if (k <= 0.02) return;
      poseHuman(E.rig, { move: 1, phase: E.phase, t, lookY: 0 });
      drawRig(buf, E.rig, E.x, E.y - (1 - k) * 20, E.z, E.heading, 9, 0);
    },
  },
};
// l'intensité de l'éclipse et du brouillard (montée, palier, descente)
evenements.eclipseK = (E) => smoothstep(0, 0.3, E.k) * (1 - smoothstep(0.65, 1, E.k));
evenements.brouillardK = (E) => smoothstep(0, 0.12, E.k) * (1 - smoothstep(0.8, 1, E.k));

// ---------------------------------------------------------------- le cratère de la météorite (objet posé, sauvegardé)
PROP_MODELS.ev_cratere = function (E, o) {
  const frais = o.data && farm.s && o.data.jour >= farm.s.day - 1;
  E.bx(0, -0.1, 0, 6.4, 0.14, 6.4, [0.2, 0.17, 0.14], mt(M_DIRT));
  E.bx(0, -0.06, 0, 4.2, 0.14, 4.2, [0.12, 0.1, 0.09], mt(M_DIRT), 0.4);
  for (let k = 0; k < 11; k++) { const a = k / 11 * TAU + (k % 3) * 0.2, r = 3.1 + (k % 2) * 0.5; E.bx(Math.cos(a) * r, -0.1, Math.sin(a) * r, 0.7 + (k % 3) * 0.2, 0.35 + (k % 2) * 0.2, 0.6, [0.5, 0.46, 0.42], mt(M_ROCK), a); }
  E.fl = frais ? FX_EMIT : 0;
  E.bx(0, -0.05, 0, 0.8, 0.55, 0.7, frais ? [1.1, 0.55, 0.2] : [0.25, 0.22, 0.24], frais ? TL.ember : TL.stone, 0.6);
  E.fl = 0;
};
PROP_LIGHTS.ev_cratere = { c: [0.9, 0.45, 0.15], r: 6, y: 0.6, lit: true };
HOOKS.inter.ev_cratere = (it) => {
  const w = game.world, q = w.props.find((p) => p.id === 'ev_cratere' && Math.hypot(p.x - it.x, p.z - it.z) < 0.5);
  if (!q) return;
  const d = q.data || {};
  if (d.pris) { ui.subtitle('', '(Il ne reste que la pierre, trop lourde pour vous.)', 3); return; }
  if (farm.s.hours - (d.h || 0) < 2.5) { ui.subtitle('', '(La pierre est encore brûlante.)', 2.5); return; }
  farm.setPropData(q, { pris: 1 });
  const n = 2 + ((Math.random() * 2) | 0);
  farm.give('poussiere_etoile', n); play.flyer('poussiere_etoile', [it.x, it.y + 0.3, it.z], n);
  if (Math.random() < 0.5) { farm.give('gemme', 1); play.flyer('gemme', [it.x, it.y + 0.3, it.z], 1); }
  sound.pop && sound.pop();
  it.name = '';
};
// ---------------------------------------------------------------- ce qu'on trouve après coup (poussière d'étoile, cache des follets, cratères)
LOOT.follets = { rolls: [2, 3], items: [['vieille_piece', 2, 6, 4], ['bijou', 1, 1, 2], ['argent', 30, 110, 3], ['perle', 1, 1, 1], ['gemme', 1, 1, 1]] };
function evPoserInter() {
  const w = game.world, s = farm.s;
  if (!w || !s) return;
  const S = evenements.S();
  w.inter = (w.inter || []).filter((it) => !it.ev);
  const Pd = S.poussiere;
  if (Pd && Pd.jour === s.day) w.inter.push({ kind: 'ev_poussiere', id: 'ev_poussiere', ev: true, x: Pd.x, y: Pd.y + 0.3, z: Pd.z, name: 'Ramasser', data: {} });
  const F = S.follets;
  if (F && !s.flags['dug_' + F.id]) w.inter.push({ kind: 'dig', id: F.id, ev: true, x: F.x, y: evSol(F.x, F.z) + 0.3, z: F.z, name: 'Creuser', data: { loot: 'follets' } });
  for (const q of w.props) if (q.id === 'ev_cratere' && !q.gone) w.inter.push({ kind: 'ev_cratere', id: 'ev_cratere_' + Math.round(q.x) + '_' + Math.round(q.z), ev: true, x: q.x, y: q.y + 0.6, z: q.z, name: 'Regarder la pierre tombée', data: {} });
}
HOOKS.interVis.ev_poussiere = () => { const Pd = evenements.S().poussiere; return !!(Pd && Pd.jour === farm.s.day && npcs.hour() < 14); };
HOOKS.inter.ev_poussiere = (it) => {
  const S = evenements.S();
  if (!S.poussiere) return;
  S.poussiere = null;
  farm.give('poussiere_etoile', 1); play.flyer('poussiere_etoile', [it.x, it.y, it.z], 1); sound.pop && sound.pop();
  game.world.inter = game.world.inter.filter((i) => i !== it);
};
function evDessinPoussiere(buf, cam, t) {
  const Pd = evenements.S().poussiere;
  if (!Pd || Pd.jour !== farm.s.day || npcs.hour() >= 14) return;
  if (Math.hypot(Pd.x - cam[0], Pd.z - cam[2]) > 80) return;
  PE.buf = buf; PE.fl = FX_EMIT;
  for (let k = 0; k < 5; k++) { const a = t * 0.8 + k * 1.3; PE.frame(Pd.x + Math.cos(a) * 0.25, Pd.y + 0.08 + (k % 2) * 0.05, Pd.z + Math.sin(a) * 0.25, a, 1); PE.box(0, 0, 0, 0.06, 0.06, 0.06, [1.2, 1.3, 1.8], TL.plain, a); }
  PE.fl = 0;
}

// ---------------------------------------------------------------- les habitants en parlent
HOOKS.load.push(() => {
  if (game._evTalk) return;
  game._evTalk = true;
  const _choose = talk.choose.bind(talk);
  talk.choose = function (act) {
    if (act === 'chat' && this.n && this.n.d.id !== 'fillette' && Math.random() < 0.45) { const L = evenements.ligne(); if (L) return this.view(L, this.options()); }
    return _choose(act);
  };
  const _sg = npcs.shortGreet.bind(npcs);
  npcs.shortGreet = function (n) { if (Math.random() < 0.3) { const L = evenements.ligne(); if (L) return fmtLine(L, n); } return _sg(n); };
});

// ---------------------------------------------------------------- branchements
HOOKS.load.push((saved) => evenements.load(saved));
HOOKS.update.push((dt, eye, basis, sky, playing) => evenements.update(dt, eye, basis, sky, playing));
HOOKS.sky.push((sky) => evenements.sky(sky));
HOOKS.fx.push((fx, tint, sky) => evenements.fx(fx, tint, sky));
HOOKS.draw.push((buf, sbuf, cam, t) => evenements.draw(buf, sbuf, cam, t));
HOOKS.lights.push((eye) => evenements.lights(eye));
HOOKS.day.push(() => evenements.jourNouveau());
