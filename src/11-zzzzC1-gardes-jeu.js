// ============================================================================
//  LES GARDES ET LES CHEVALIERS — le jeu (agent G1) ; les gens et les cabanes : 11-zzzzC-gardes.js
//  - Un rôle, d.garde ({ lieu, veille, courage, coups, tir }) : Grosjean, le chevalier du guet, le garde
//    champêtre, le gendarme ; deux au plus par lieu (Valbrume : Grosjean et le chevalier ; Clairpré : le
//    garde champêtre et le gendarme). Ce qui valait pour « le garde » vaut pour les gardes : l'alerte,
//    la poursuite, les témoins d'un vol ou d'une fouille, la prime qu'on leur règle, l'arrestation.
//  - Leur semaine : rondes de jour, guet de nuit ; à deux, l'un dort pendant que l'autre veille ; la
//    relève (6 h au pont nord, 21 h à la cabane du hameau) ; le gendarme fait la tournée des petits
//    villages l'après-midi ; le brasero du poste brûle tant qu'on veille.
//  - Les « problèmes » de leur lieu (et un peu autour) : l'homme au long manteau, le tueur masqué, une
//    bête dangereuse près des maisons, un incendie, un cri, un crime : ils accourent. Rien de surhumain :
//    ils arrivent parfois trop tard, ils ont peur, ils meurent (pour de bon).
//  - La SOMMATION : un garde vous rattrape pour un crime que son village connaît, et vous choisissez.
//    Vous rendre (le cachot) ; pour un petit délit, payer la prime sur-le-champ ; refuser : les gardes
//    attaquent, quel que soit le délit, l'autre garde du lieu vient prêter main-forte, et la RÉBELLION
//    s'ajoute à la prime. On fuit (ils lâchent quand on les sème : la prime monte), on se bat (un garde
//    blessé, c'est une agression ; tué, un meurtre), ou l'on se rend plus tard : un garde qui vous a mis
//    à mal vous le redemande. Mis au tapis par un garde, on est arrêté, pas tué — sauf quand on est
//    recherché pour un meurtre (on ne ménage pas un assassin qui se défend).
//  - Se rendre de soi-même : à n'importe quel garde, quand on est recherché (« Je viens me rendre »).
//  État : farm.s.gardes = { v, rebelle, fuites, rendus, payes, assommes, arrets, journal }.
//  API : gardes (liste(), du(lieu), est(n), alerter(x, z, k), sommer(n), refus(n), arreter(n, mode),
//        payerSurLeChamp(n), seRendre(n), journee(n), petitDelit(), zone(lieu)).
// ============================================================================
const G1_PETITS = new Set(['vol', 'braconnage', 'effraction', 'intrusion', 'rebellion']);
const G1_BETES = new Set(['bear', 'boar', 'wolf']);
const G1_BETE_NOMS = { bear: 'un ours', boar: 'un sanglier', wolf: 'des loups' };
// la tournée du gendarme, selon le jour (l'après-midi)
const G1_TOURNEE = { semailles: 'lieu:sources', fer: 'lieu:planches_greve', marche: 'lieu:ponton', lessive: 'lieu:bibliotheque', mere: 'lieu:sources', chasse: 'lieu:relais_chasse', peche: 'lieu:planches_greve', messe: 'hameau', foire: 'hameau', veillee: 'lieu:sources', chome: 'lieu:ferme', morts: 'lieu:calvaire4' };
// ce qu'ils disent (le garde des ponts garde ses mots d'avant pour la sommation)
const G1_DIT = {
  sommation: {
    chevalier_guet: 'Halte. Le guet. Vous me suivez, ou vous me forcez la main.',
    garde_champetre: 'Halte-là ! Garde champêtre ! On ne bouge plus, je dresse procès-verbal !',
    gendarme: 'Gendarmerie. Au nom de la loi, vous êtes en état d’arrestation. Les mains, je vous prie.',
  },
  redemande: {
    garde: 'Rendez-vous, bon sang ! Vous allez y rester, et moi aussi !',
    chevalier_guet: 'Assez. Rendez-vous. Je ne frappe pas un homme à terre.',
    garde_champetre: 'Rendez-vous, nom d’un chien ! Je ne veux pas vous verbaliser mort !',
    gendarme: 'Rendez-vous. C’est la dernière fois que je vous le demande.',
  },
  refus: { garde: 'Vous l’aurez voulu !', chevalier_guet: 'Soit.', garde_champetre: 'Rébellion ! Ça, c’est un autre procès-verbal !', gendarme: 'Comme vous voudrez. Je vous préviens : je sais m’en servir.' },
  repete: { garde: 'Je… je ne le répéterai pas !', chevalier_guet: 'Je ne le répéterai pas.', garde_champetre: 'Je ne le répéterai pas, hein !', gendarme: 'Je ne le répéterai pas.' },
  perdu: {
    garde: ['Je vous retrouverai.', 'Vous ne quitterez pas la vallée.'],
    chevalier_guet: ['Le guet a la mémoire longue.', 'Courez. La nuit, je vous attendrai.'],
    garde_champetre: ['Je connais tous les sentiers ! Tous !', 'Votre signalement sera au tableau ce soir !'],
    gendarme: ['Votre signalement partira ce soir.', 'On se reverra.'],
  },
  paye: { garde: 'C’est réglé. On retire les affiches. Que je ne vous y reprenne pas.', chevalier_guet: 'C’est réglé. Le guet n’a plus rien contre vous. Pour cette fois.', garde_champetre: 'Réglé, et quittancé ! Je raye. Ne marchez plus dans mes semis.', gendarme: 'C’est en règle. Je vous fais un reçu. Ne recommencez pas.' },
  pauvre: { garde: 'Vous n’avez pas de quoi. Alors ce sera le cachot, ou la route. Choisissez.', chevalier_guet: 'Vous n’avez pas de quoi. Alors suivez-moi.', garde_champetre: 'Pas de quoi payer ? Alors c’est le cachot, mon ami. Ou la route, et je vous cours après.', gendarme: 'La somme n’y est pas. Il ne reste que le cachot.' },
  arrete: { garde: 'Au nom de la loi, je vous arrête.', chevalier_guet: 'Le guet vous arrête. Tendez les mains.', garde_champetre: 'Je vous arrête ! Au nom de la loi, et du hameau !', gendarme: 'Je vous arrête. Vous avez le droit de vous taire, et je vous le conseille.' },
  assomme: { garde: 'Il respire. Mon Dieu, il respire. Aidez-moi à le porter.', chevalier_guet: 'Il vivra. Au cachot.', garde_champetre: 'À terre ! Il respire ! Le procès-verbal, ce sera pour après.', gendarme: 'Il respire. Je l’emmène.' },
  assommeF: { garde: 'Elle respire. Mon Dieu, elle respire. Aidez-moi à la porter.', chevalier_guet: 'Elle vivra. Au cachot.', garde_champetre: 'À terre ! Elle respire ! Le procès-verbal, ce sera pour après.', gendarme: 'Elle respire. Je l’emmène.' },
  peur: { garde: 'À l’aide ! Au guet ! Au guet !', garde_champetre: 'Au secours ! Gendarme ! Gendarme !', _: 'À l’aide !' },
  reveil: { garde: 'Hein ? … Quoi ? J’arrive ! J’arrive !', chevalier_guet: 'Le guet est debout.', garde_champetre: 'Hein ? Qu’est-ce que… J’arrive, j’arrive !', gendarme: 'J’arrive.' },
  inconnu: { garde: 'Vous rendre ? Vous ? Pour quoi ? … Ah. Oui. Je vois. Bon. Suivez-moi. Doucement.', chevalier_guet: 'Vous rendre. … Je vois. C’est plus courageux que de courir. Suivez-moi.', garde_champetre: 'Vous rendre ? À moi ? Personne ne s’est jamais rendu à moi ! … Bon. Bon, bon. Suivez-moi.', gendarme: 'Vous venez vous rendre. Je prends note. Suivez-moi, je vous prie.' },
  tueur: { garde: 'Qui va là ? … Halte ! Halte, j’ai dit ! Au guet !', chevalier_guet: 'Halte. Montrez-vous.', garde_champetre: 'Halte-là ! Qui va là ? Je tire !', gendarme: 'Gendarmerie ! Arrêtez-vous !' },
  blesse: { garde: 'Je… je l’ai touché ! Il s’en va ! Il s’en va…', chevalier_guet: 'Touché. Il ne reviendra pas cette nuit.', garde_champetre: 'Touché ! Il file ! Il saigne !', gendarme: 'Il est blessé. Il fuit vers les bois.' },
  bete: { garde: 'Une bête ! Rentrez chez vous ! Rentrez !', chevalier_guet: 'Une bête près des maisons. Rentrez.', garde_champetre: 'Une bête ! Tout le monde dedans ! Je m’en occupe !', gendarme: 'Écartez-vous. Je m’en charge.' },
  abattue: { garde: 'Elle… elle ne bouge plus. C’est fini ?', chevalier_guet: 'C’est fini.', garde_champetre: 'Abattue ! Je le note : une bête nuisible, abattue par le garde champêtre !', gendarme: 'Abattue. Je ferai mon rapport.' },
  feu: { garde: 'Au feu ! Au feu ! De l’eau !', chevalier_guet: 'Au feu. Des seaux, vite.', garde_champetre: 'Au feu ! Les seaux ! Les seaux de la cabane !', gendarme: 'Au feu ! Faites la chaîne !' },
  eteint: { garde: 'C’est éteint. C’est éteint, n’est-ce pas ?', chevalier_guet: 'Éteint.', garde_champetre: 'Éteint ! Procès-verbal d’incendie, contre la foudre !', gendarme: 'C’est éteint.' },
  cri: { garde: 'Qui a crié ? … Qui a crié ?', chevalier_guet: 'Un cri. Par là.', garde_champetre: 'Qui a crié ? Répondez !', gendarme: 'Quelqu’un a crié. Restez où vous êtes.' },
  tir: { garde: 'Qui a tiré ? … Qui a tiré, ici ?', chevalier_guet: 'Un coup de feu. On ne tire pas près des maisons.', garde_champetre: 'Qui a tiré ? Port d’arme dans le hameau ! Ça, c’est un procès-verbal !', gendarme: 'Qui a tiré ? Rangez cette arme.' },
  tard: { garde: 'Trop tard… Encore trop tard.', chevalier_guet: 'Trop tard. Je l’écrirai.', garde_champetre: 'Trop tard… Mon Dieu.', gendarme: 'Trop tard.' },
};
// la relève : ce qu'ils se disent (le joueur à portée de voix)
const G1_RELEVE = {
  valbrume: [
    [['chevalier_guet', 'Ohé, {npc:garde} ! Rien cette nuit.'], ['garde', 'Rien ? Vraiment rien ?'], ['chevalier_guet', 'Rien qui se laisse écrire. Le jour est à vous.']],
    [['garde', 'Monsieur le chevalier ! Vous avez entendu, vers trois heures ?'], ['chevalier_guet', 'J’ai entendu. Je l’ai écrit. Baissez votre pont, {npc:garde}.']],
  ],
  clairpre: [
    [['garde_champetre', 'Rien à signaler, sauf la chèvre de Bastien. Je vous laisse la nuit.'], ['gendarme', 'Je la prends. Dormez.']],
    [['gendarme', 'Vous avez verbalisé qui, aujourd’hui ?'], ['garde_champetre', 'Une borne, une haie, et une chèvre. La même que d’habitude.'], ['gendarme', 'Bonne nuit, Tissier.']],
  ],
};

const gardes = {
  t: 0, tU: 0, tB: 0, L: [], sommation: null, cris: [], coup: null, braseros: [], hooked: false, jcache: new Map(), releve: {}, redemandeT: -1e9,

  // ------------------------------------------------------------------ l'état
  S() {
    const s = farm.s;
    if (!s) return null;
    const S = s.gardes || (s.gardes = {});
    if (!S.v) Object.assign(S, { v: 1, rebelle: null, fuites: 0, rendus: 0, payes: 0, assommes: 0, arrets: 0, journal: [], cheval: null });
    if (!Array.isArray(S.journal)) S.journal = [];
    return S;
  },
  noter(lieu, k, o) {
    const S = this.S();
    if (!S) return;
    S.journal.push(Object.assign({ j: farm.s.day, h: Math.round(npcs.hour() * 10) / 10, lieu, k }, o || {}));
    while (S.journal.length > 40) S.journal.shift();
  },

  // ------------------------------------------------------------------ qui, où
  est(n) { return !!(n && n.d && n.d.garde); },
  nouveau(n) { return !!(n && n.d && n.d.garde && !n.d.garde.ancien); },
  liste() { return this.L; },
  du(lieu) { return this.L.filter((n) => n.d.garde.lieu === lieu); },
  vivant(n) { return !!(n && n.st.alive && !n.vanished && n.state !== 'gone' && n.state !== 'dead'); },
  dort(n) { return !!(n.sleep || n.state === 'sleep'); },
  eveille(n) { return this.vivant(n) && !this.dort(n) && !n.st.malade; },
  nuit() { const h = npcs.hour(); return h >= 20.5 || h < 6; },
  zone(lieu) {
    const w = game.world;
    if (!w) return null;
    if (lieu === 'valbrume') return w.townInfo ? { x: w.townInfo.x, z: w.townInfo.z, r: 80 } : null;
    if (lieu === 'clairpre') return w.lm.hameau ? { x: w.lm.hameau.x, z: w.lm.hameau.z, r: 62 } : null;
    return null;
  },
  lieuDe(x, z, marge) {
    for (const v of ['valbrume', 'clairpre']) { const Z = this.zone(v); if (Z && Math.hypot(x - Z.x, z - Z.z) < Z.r + (marge || 0)) return v; }
    return null;
  },
  lieuW(n) { const w = game.world; return w && w.g1 && w.g1.lieux ? w.g1.lieux[n.d.garde.lieu] : null; },
  nomComplet(n) { return `${n.name} ${n.d.surname}`; },
  titre(n) { return n.st.met ? `${n.name} ${n.d.surname}, ${n.d.role.toLowerCase()}` : n.d.role; },
  dit(k, n) { const T = G1_DIT[k] || {}; const v = T[n.id] ?? T._; return Array.isArray(v) ? pick(v) : v || ''; },
  meurtreConnu() { const R = societe.recherche(); return !!(R && R.meurtre); },
  // un petit délit : rien que du vol, du braconnage, une effraction, une intrusion, une rébellion — et pas trop
  petitDelit() {
    const R = societe.recherche();
    if (!R) return false;
    const A = societe.actifs().filter((C) => societe.connuQuelquePart(C));
    return A.length > 0 && A.every((C) => G1_PETITS.has(C.type)) && R.prime <= 450;
  },
  // ce qu'ils disent ne s'entend que de près (les sous-titres ne disent pas ce qui se crie à l'autre bout du village)
  parle(n, t, dur) {
    if (!n || !t || !game.player) return;
    const p = game.player;
    if (Math.hypot(n.x - p.pos[0], n.z - p.pos[2]) > 40 || !!p.underground !== !!(n.d && n.d.area === 'nains')) return;
    npcs.say(n, t, dur);
  },
  direUneFois(n, k, delai) {
    const D = n.g1dit || (n.g1dit = {});
    if (game.time - (D[k] ?? -1e9) < (delai || 60)) return;
    D[k] = game.time;
    this.parle(n, this.dit(k, n), 2.5);
  },
  // le son d'un geste vient de celui qui le fait (13-zz-son3d.js)
  son(n, fn) {
    let k = null;
    try { if (sound.entrer) k = sound.entrer(n, { att: 'phys', ref: 8, roll: 0.6 }); } catch (e) { k = null; }
    try { fn(); } finally { try { if (k !== null && sound.sortir) sound.sortir(k); } catch (e) { /* rien */ } }
  },

  // ------------------------------------------------------------------ la semaine (11-zzsemaine.js : routineDuJour)
  journee(n) {
    const day = farm.s.day, key = n.id + ':' + day;
    if (this.jcache.has(key)) return this.jcache.get(key);
    const J = cal.jour(day).cle, w = game.world;
    let S;
    if (n.id === 'chevalier_guet') {
      S = [[0, 'g1:ronde'], [1, 'g1:poste'], [2, 'g1:ronde'], [3, 'g1:poste'], [4, 'g1:ronde'], [5, 'g1:pont'], [6.2, 'g1:poste'], [7, 'home'],
        [14, 'auberge'], [15, J === 'marche' ? 'marche' : J === 'morts' ? 'cimetiere' : 'place'], [16.5, J === 'fer' ? 'bld:forge' : 'puits_ville'], [17.5, 'bld:garde'], [18.5, 'place'],
        [19.1, 'g1:pont'], [19.8, 'g1:poste'], [21, 'g1:ronde'], [22, 'g1:poste'], [23, 'g1:ronde']];
    } else if (n.id === 'garde_champetre') {
      S = J === 'foire'
        ? [[5.5, 'g1:poste'], [6.3, 'hameau'], [7.5, 'g1:ronde'], [8.5, 'hameau'], [12, 'home'], [13, 'hameau'], [17, 'g1:ronde'], [18, 'hameau'], [19, 'g1:poste'], [21.5, 'home']]
        : [[5.5, 'g1:poste'], [6.3, 'hameau'], [7.5, 'g1:ronde'], [8.5, 'hameau'], [10, 'bld:ranch'], [11, 'g1:ronde'], [12, 'home'], [13, 'g1:ronde'], [14, 'hameau'], [15, J === 'morts' ? 'cimetiere' : 'g1:ronde'], [17, 'hameau'], [19, 'g1:poste'], [21.5, 'home']];
    } else if (n.id === 'gendarme') {
      let tour = G1_TOURNEE[J] || 'hameau';
      if (tour.startsWith('lieu:') && !(w && w.lm[tour.slice(5)])) tour = 'hameau';
      S = [[0, 'g1:ronde'], [1, 'g1:poste'], [2, 'g1:ronde'], [3, 'g1:poste'], [4, 'g1:ronde'], [5, 'g1:poste'], [6, 'home'], [12, 'g1:ecurie'], [13, tour], [17.5, 'g1:ecurie'], [18.5, 'home'], [20, 'hameau'], [20.6, 'g1:poste'], [22, 'g1:ronde'], [23, 'g1:poste']];
    } else S = (n.d.schedule || [[6, 'home']]).map((e) => e.slice());
    this.jcache.set(key, S);
    if (this.jcache.size > 60) this.jcache.clear();
    return S;
  },
  // les heures de sommeil (de jour pour ceux qui veillent la nuit)
  dortA(n, h) {
    if (n.id === 'chevalier_guet') return h >= 7 && h < 14;
    if (n.id === 'garde_champetre') return h >= 21.5 || h < 5.5;
    if (n.id === 'gendarme') return h >= 6 && h < 12;
    return false;
  },
  // leurs lieux à eux : le poste (devant la cabane), le bout du pont, la ronde, l'écurie ; leur lit, leur chaise
  dest(n, pl, sleep) {
    const w = game.world, B = w.bld[n.d.home], L = this.lieuW(n);
    if (!B) return null;
    if (pl === 'home') {
      const sp = sleep ? B.spots['lit_' + n.id] || B.spots.bed : B.spots['assis_' + n.id] || B.spots.sit;
      return sp ? { node: B.nMid, x: sp.x, z: sp.z, r: sp.r, pose: sleep ? 'lie' : 'sit', bld: B.key, y: sp.y } : null;
    }
    if (typeof pl !== 'string' || !pl.startsWith('g1:')) return null;
    const k = pl.slice(3);
    let P = null, r = null, pose = null;
    if (k === 'poste' && B.spots.poste) { P = B.spots.poste; r = P.r; }
    else if (k === 'ecurie' && B.spots.ecurie) { P = B.spots.ecurie; r = P.r; pose = 'work'; }
    else if (k === 'pont' && L && L.pont) P = { x: L.pont[0], z: L.pont[1] };
    else if (k === 'ronde' && L && L.ronde && L.ronde.length) { const i = (Math.floor(npcs.hour()) + farm.s.day + G1_IDS.indexOf(n.id)) % L.ronde.length; P = { x: L.ronde[i][0] + (Math.random() - 0.5), z: L.ronde[i][1] + (Math.random() - 0.5) }; }
    if (!P) return null;
    const node = k === 'poste' || k === 'ecurie' ? B.nOut : npcs.nearestReach(P.x, P.z, (q) => !/:(in|mid)$/.test(q.tag));
    if (node < 0) return null;
    return { node, x: P.x, z: P.z, r, pose };
  },

  // ------------------------------------------------------------------ voir le recherché, l'alerte
  // (un garde éveillé, qui connaît un crime du fermier, le voit : il vient à lui)
  surveiller() {
    const p = game.player, w = game.world;
    if (p.underground || game.sleeping || societe.arrestation || (typeof prison !== 'undefined' && prison.enPrison())) return;
    for (const n of this.L) {
      if (!this.eveille(n) || n.hunting || n.talking || n.urgence || n.fleeT > 0) continue;
      if ((n.poursuite || 0) > game.time || n.alerte || n.sommeT) continue;
      const dx = p.pos[0] - n.x, dz = p.pos[2] - n.z, d = Math.hypot(dx, dz);
      if (d > 22) continue;
      if (this.nuit() && !game.lantern && d > 12) continue;
      if (d > 4 && !segClear(w, n.x, n.z, p.pos[0], p.pos[2])) continue;
      const face = (dx * Math.sin(n.heading) + dz * Math.cos(n.heading)) / (d || 1);
      if (face < -0.2 && d > 6) continue;
      if (!societe.crimesSus(n).length) continue;
      n.poursuite = game.time + 18; n.vuT = game.time; n.fleeT = 0;
    }
  },
  // l'alerte (un crime, un cri « au voleur », quelqu'un qui vous reconnaît) : les gardes du lieu d'abord, deux au plus
  alerter(x, z, k) {
    if (!farm.s || Math.random() > (k ?? 1)) return false;
    const lieu = this.lieuDe(x, z, 60);
    const C = this.L.filter((g) => this.vivant(g) && !g.st.malade && !g.hunting && !g.talking && !g.urgence && Math.hypot(g.x - x, g.z - z) < 170);
    C.sort((a, b) => ((a.d.garde.lieu === lieu ? 0 : 1) - (b.d.garde.lieu === lieu ? 0 : 1)) || (Math.hypot(a.x - x, a.z - z) - Math.hypot(b.x - x, b.z - z)));
    let nb = 0;
    for (const g of C) {
      if (nb >= 2) break;
      if (this.dort(g)) { if (Math.hypot(g.x - x, g.z - z) > 35 || Math.random() > 0.5) continue; this.reveiller(g); }
      g.alerte = { x, z, t: game.time + 40 }; g.fleeT = 0; nb++;
    }
    return nb > 0;
  },
  reveiller(g) {
    g.sleep = false; g.state = 'idle'; g.reveilT = game.time + 90; g.goal = null;
    gardes.parle(g, this.dit('reveil', g), 2.5);
  },
  // ceux qui ont vu (ou qui sont à quarante mètres) accourent
  temoinsCrime(vus, x, z) {
    for (const g of this.L) {
      if (!this.eveille(g) || g.talking || g.urgence) continue;
      if (!(vus || []).includes(g) && Math.hypot(g.x - x, g.z - z) > 40) continue;
      g.fleeT = 0; g.poursuite = game.time + 18; g.vuT = game.time;
    }
  },
  // l'autre garde du lieu vient prêter main-forte
  appeler(n) {
    const p = game.player;
    for (const m of this.du(n.d.garde.lieu)) {
      if (m === n || !this.vivant(m) || m.st.malade || m.talking || m.urgence) continue;
      const d = Math.hypot(m.x - p.pos[0], m.z - p.pos[2]);
      if (this.dort(m)) { if (d > 90) continue; this.reveiller(m); }
      else if (d > 200) continue;
      m.alerte = { x: p.pos[0], z: p.pos[2], t: game.time + 45 }; m.attaque = true; m.fleeT = 0; m.atkT = Math.max(m.atkT || 0, 1 + Math.random() * 0.6);
    }
  },

  // ------------------------------------------------------------------ la poursuite (remplace societe.poursuivre pour les gardes)
  poursuivre(n, dt, w, c) {
    const p = game.player, dx = p.pos[0] - n.x, dz = p.pos[2] - n.z, d = Math.hypot(dx, dz);
    n.dist = d; n.hurtT = Math.max(0, n.hurtT - dt); n.bubbleT = Math.max(0, n.bubbleT - dt);
    // (un dormeur qu'on a réveillé reste debout le temps de l'affaire)
    if (this.dort(n)) { if ((n.reveilT || 0) > game.time) { n.sleep = false; n.state = 'idle'; } else { this.fin(n); return; } }
    const sus = societe.crimesSus(n);
    if (!sus.length || societe.arrestation || p.underground || game.sleeping || game.dying || (typeof prison !== 'undefined' && prison.enPrison())) { this.fin(n); return; }
    const vu = d < 26 && (d < 5 || segClear(w, n.x, n.z, p.pos[0], p.pos[2]));
    if (vu) { n.poursuite = game.time + 18; n.vuT = game.time; n.alerte = null; }
    // (un autre garde vous voit, tout près : on suit sa voix)
    else if (this.L.some((m) => m !== n && m.st.alive && game.time - (m.vuT || -1e9) < 1.5 && ((m.poursuite || 0) > game.time) && Math.hypot(m.x - n.x, m.z - n.z) < 70)) n.poursuite = Math.max(n.poursuite || 0, game.time + 3);
    let tx, tz;
    if (vu || n.poursuite > game.time) { tx = p.pos[0]; tz = p.pos[2]; }
    else if (n.alerte && n.alerte.t > game.time) { tx = n.alerte.x; tz = n.alerte.z; if (Math.hypot(tx - n.x, tz - n.z) < 3) n.alerte = null; }
    else { this.perdu(n); return; }
    const Sm = this.sommation, face = () => { n.move = lerp(n.move, 0, Math.min(1, dt * 8)); n.run = false; n.heading = turnToward(n.heading, Math.atan2(dx, dz), dt * 6); };
    // le choix est à l'écran : il attend ; un autre garde s'approche et attend aussi
    if (Sm && Sm.ouvert) { if (Sm.n === n || d < 3.2) { face(); return; } this.courir(n, tx, tz, dt, w, 3.2); return; }
    if (n.attaque) { this.combat(n, dt, w, c, d, vu); return; }
    // (il ne passe pas — une clôture, un fossé : il somme de là où il est, à pleine voix)
    const lent = this.progres(n, d);
    if (vu && (d < 2.2 || (d < 16 && lent > 4) || (d < 24 && lent > 8) || (n.sommeT && d < (n.sommeD || 0) + 1.5))) {
      face();
      if (!n.sommeT) { if (this.sommer(n)) { n.sommeT = game.time; n.sommeD = d; } } // (pas de choix à l'écran : il réessaiera)
      else if (Sm && Sm.n === n && Sm.ferme && game.time - Sm.fermeT > 5) this.arreter(n, 'sommation'); // (resté là sans répondre : il vous emmène)
      return;
    }
    // on s'en va après la sommation : c'est un refus
    if (n.sommeT && d > Math.max(5.5, (n.sommeD || 0) + 4)) { this.refus(n, 'fuite'); return; }
    this.courir(n, tx, tz, dt, w, n.sommeT ? 4.6 : 4.1);
    if (!vu && n.poursuite && n.poursuite <= game.time && game.time - (n.vuT || 0) > 12) this.perdu(n);
  },
  // courir vers un point (comme societe.courir, mais un garde qui bute contre une clôture cherche le chemin
  // au lieu de pousser, et garde son chemin quelques secondes au lieu de le recalculer sans cesse)
  courir(n, tx, tz, dt, w, sp) {
    const C = n.g1c || (n.g1c = { t: 0, x: n.x, z: n.z, bloque: 0, tx: 1e9, tz: 1e9, recalc: 0, direct: 0 });
    C.t += dt;
    if (C.t > 0.8) { C.bloque = Math.hypot(n.x - C.x, n.z - C.z) < sp * C.t * 0.3 ? C.bloque + 1 : 0; C.x = n.x; C.z = n.z; C.t = 0; }
    if (C.bloque >= 2 && !n.course) C.direct = game.time + 6; // (tout droit, ça bute : par le chemin, un moment)
    const pres = Math.hypot(tx - n.x, tz - n.z) < 3.5;
    if (pres || (game.time > C.direct && segClear(w, n.x, n.z, tx, tz))) n.course = null;
    else if (!n.course || n.courseI >= n.course.length || Math.hypot(tx - C.tx, tz - C.tz) > 6 || game.time > C.recalc || C.bloque >= 4) {
      const a = societe.noeud(n.x, n.z, n.inside), b = societe.noeud(tx, tz, null), P = a >= 0 && b >= 0 ? npcs.findPath(n, a, b) : null;
      n.course = P && P.length ? P.slice() : null; n.courseI = 0; C.tx = tx; C.tz = tz; C.recalc = game.time + 5;
      if (C.bloque >= 4) C.bloque = 2;
      // (le premier nœud est derrière soi, le second plus près du but : on coupe)
      if (n.course && n.course.length > 1) { const q0 = w.nav.nodes[n.course[0]], q1 = w.nav.nodes[n.course[1]]; if (Math.hypot(q1.x - n.x, q1.z - n.z) < Math.hypot(q1.x - q0.x, q1.z - q0.z) && segClear(w, n.x, n.z, q1.x, q1.z)) n.courseI = 1; }
    }
    let gx = tx, gz = tz;
    if (n.course && n.courseI < n.course.length) {
      const q = w.nav.nodes[n.course[n.courseI]]; gx = q.x; gz = q.z;
      if (Math.hypot(gx - n.x, gz - n.z) < 1.3) n.courseI++;
      if (n.courseI >= n.course.length) n.course = null;
    }
    for (const dr of w.doors) if (Math.abs(dr.x - n.x) < 2 && Math.abs(dr.z - n.z) < 2 && !dr.locked) dr.open = 1;
    n.heading = turnToward(n.heading, Math.atan2(gx - n.x, gz - n.z), dt * 6);
    let nx = n.x + Math.sin(n.heading) * sp * dt, nz = n.z + Math.cos(n.heading) * sp * dt;
    [nx, nz] = w.collideCircle(nx, nz, n.y, n.y + 1.7, 0.28, 0.5, true);
    const g = w.groundAt(nx, nz, n.y + 0.6, 0.6);
    if (g < w.waterLevel - 0.25 && !n.inside) { n.move = lerp(n.move, 0, dt * 6); return; }
    n.x = nx; n.z = nz; n.y = g; n.inside = null; n.state = 'walk';
    n.move = 1; n.run = sp > 3; n.phase += dt * sp * 2.2;
  },
  // s'approche-t-il encore ? (sinon, au bout de quelques secondes, il somme de là où il est, à pleine voix)
  progres(n, d) {
    const P = n.g1p || (n.g1p = { dmin: d, t: game.time });
    if (d < P.dmin - 0.4) { P.dmin = d; P.t = game.time; }
    return game.time - P.t;
  },
  fin(n) {
    societe.finPoursuite(n);
    n.attaque = false; n.g1vise = null; n.peurDite = false; n.g1p = null; n.g1c = null; n.sommeD = 0;
    if (this.sommation && this.sommation.n === n) this.fermerChoix();
  },
  // on l'a semé : la prime monte, une fois par fuite
  perdu(n) {
    const S = this.S(), lieu = n.d.garde.lieu;
    const encore = this.L.some((m) => m !== n && m.attaque && (m.poursuite || 0) > game.time);
    if (n.attaque && S.rebelle && S.rebelle.actif && !S.rebelle.fuite && !encore) {
      S.rebelle.fuite = true; S.fuites = (S.fuites || 0) + 1;
      const C = societe.S().crimes.find((k) => k.id === S.rebelle.C);
      if (C && !C.leve) { C.prime += 50; societe.majAffiches(true); }
      this.noter(lieu, 'fuite', { g: n.id });
    }
    if (n.st.alive && (n.attaque || n.sommeT)) gardes.parle(n, this.dit('perdu', n), 2.5);
    this.fin(n);
    if (S.rebelle && !this.L.some((m) => m.attaque && m.d.garde.lieu === S.rebelle.lieu)) S.rebelle.actif = false;
  },

  // ------------------------------------------------------------------ la sommation : le choix
  ligneSommation(n) {
    if (n.id === 'garde') return farm.s.fem ? 'Au nom de la loi ! Ne bougez plus, madame.' : 'Au nom de la loi ! Ne bougez plus, monsieur.';
    return G1_DIT.sommation[n.id] || 'Au nom de la loi ! Ne bougez plus.';
  },
  sommer(n, mode) {
    const R = societe.recherche(), K = societe.crimesSus(n), s = farm.s;
    if (!R || !K.length || cine.on || game.dying || game.sleeping || societe.arrestation) return false;
    ui.close(true);
    const ligne = mode === 'redemande' ? this.dit('redemande', n) : this.ligneSommation(n);
    gardes.parle(n, ligne, 3);
    const petit = mode !== 'redemande' && this.petitDelit(), prime = R.prime;
    const opts = [{ label: 'Me rendre', fn: () => this.choix(n, 'rendre') }];
    if (petit && s.money >= prime) opts.push({ label: `Payer la prime sur-le-champ (${prime} pièces)`, fn: () => this.choix(n, 'payer') });
    opts.push({ label: 'Refuser', fn: () => this.choix(n, 'refus') });
    const lib = K.map((C) => societe.libelle(C)).join(', ');
    const desc = `« ${fmtLine(ligne, n)} » ${s.fem ? 'Vous êtes recherchée' : 'Vous êtes recherché'} pour ${lib}. Prime : ${prime} pièces.${petit ? ` Vous avez ${s.money} pièces.` : ''}`;
    ui.choice(this.titre(n), desc, opts);
    this.sommation = { n, t: game.time, ouvert: true, mode: mode || 'sommation' };
    return true;
  },
  fermerChoix() {
    if (this.sommation && ui.panel === '#choice') ui.close(true);
    this.sommation = null;
  },
  choix(n, a) {
    this.sommation = null;
    ui.close(a === 'rendre'); // (refuser, payer : on reprend la main)
    if (a === 'rendre') { this.arreter(n, 'rendu'); return; }
    if (a === 'payer') { this.payerSurLeChamp(n); return; }
    this.refus(n, 'choix');
  },
  payerSurLeChamp(n) {
    const r = societe.payer(this.nomComplet(n));
    if (r !== 'ok') { gardes.parle(n, 'Vous n’avez pas de quoi. Alors ce sera le cachot.', 3); setTimeout(() => this.arreter(n, 'rendu'), 1800); return false; }
    const S = this.S();
    S.payes = (S.payes || 0) + 1;
    gardes.parle(n, this.dit('paye', n), 3.5);
    npcs.addAmitie(n, 10);
    this.calme();
    this.noter(n.d.garde.lieu, 'paye', { g: n.id });
    return true;
  },
  calme() {
    const S = this.S();
    for (const m of npcs.list) { societe.finPoursuite(m); m.attaque = false; }
    if (S) S.rebelle = null;
    this.fermerChoix();
  },
  // refuser : la rébellion (une petite prime, une fois par affaire), les coups, la main-forte
  refus(n, comment) {
    const S = this.S(), lieu = n.d.garde.lieu, p = game.player;
    if (this.sommation) this.fermerChoix();
    n.attaque = true; n.sommeT = n.sommeT || game.time; n.poursuite = game.time + 18; n.vuT = game.time; n.fleeT = 0;
    n.atkT = Math.max(n.atkT || 0, 0.5 + Math.random() * 0.5); // (le temps de tirer le sabre)
    gardes.parle(n, this.dit('refus', n), 2.5);
    if (!S.rebelle || !S.rebelle.actif) {
      const tem = [n].concat(this.du(lieu).filter((m) => m !== n && this.eveille(m) && Math.hypot(m.x - p.pos[0], m.z - p.pos[2]) < 30));
      let C = null;
      try { C = societe.crime({ type: 'rebellion', victime: null, x: p.pos[0], z: p.pos[2], temoins: tem, preuve: lieu }); } catch (e) { console.error(e); }
      S.rebelle = { actif: true, lieu, day: farm.s.day, C: C ? C.id : null, fuite: false, comment: comment || '' };
      this.noter(lieu, 'rebellion', { g: n.id });
    }
    this.appeler(n);
  },

  // ------------------------------------------------------------------ les coups
  combat(n, dt, w, c, d, vu) {
    const G = n.d.garde, p = game.player, S = this.S();
    n.atkT = Math.max(0, (n.atkT || 0) - dt); n.g1tirT = Math.max(0, (n.g1tirT || 0) - dt);
    // la peur : un garde peureux, blessé, rompt et appelle
    if (G.courage < 0.5 && (n.hp ?? 100) < 55) {
      if (!n.peurDite) { n.peurDite = true; gardes.parle(n, this.dit('peur', n), 2.5); this.appeler(n); }
      societe.finPoursuite(n); n.attaque = false; n.fleeT = 6; return;
    }
    // il vous a mis à mal : il vous redemande de vous rendre (une fois de temps en temps)
    if (p.hp < 35 && d < 4 && vu && game.time - this.redemandeT > 25 && !cine.on && this.sommer(n, 'redemande')) {
      this.redemandeT = game.time; n.attaque = false; n.sommeT = game.time; n.sommeD = d;
      return;
    }
    // le fusil : de loin
    if (G.tir && vu && d > 4 && d < G.tir.portee) {
      n.move = lerp(n.move, 0, Math.min(1, dt * 8)); n.run = false;
      n.heading = turnToward(n.heading, Math.atan2(p.pos[0] - n.x, p.pos[2] - n.z), dt * 6);
      if (!n.g1vise) { if (n.g1tirT <= 0) { n.g1vise = { t: 0.9, sommation: !n.tirSomme }; this.epauler(n, true); } return; }
      n.g1vise.t -= dt;
      if (n.g1vise.t > 0) return;
      const V = n.g1vise; n.g1vise = null; n.g1tirT = G.tir.cadence; this.epauler(n, false);
      this.tirer(n);
      if (V.sommation) { n.tirSomme = true; gardes.parle(n, 'Halte, ou je tire pour de bon !', 2.5); return; } // (le premier coup, en l'air)
      const chance = G.tir.chance - (p.sprinting ? 0.2 : 0) - d / 120;
      if (Math.random() < chance) this.frapperJoueur(n, G.tir.degats[0] + Math.random() * (G.tir.degats[1] - G.tir.degats[0]), 'Abattu d’un coup de fusil par ' + this.nomCause(n));
      return;
    }
    if (n.g1vise) { n.g1vise = null; this.epauler(n, false); }
    if (d > 1.7) { this.courir(n, p.pos[0], p.pos[2], dt, w, 4.7); return; }
    n.move = lerp(n.move, 0, Math.min(1, dt * 8)); n.run = false;
    n.heading = turnToward(n.heading, Math.atan2(p.pos[0] - n.x, p.pos[2] - n.z), dt * 7);
    if (n.atkT <= 0) {
      n.atkT = 1.35 + Math.random() * 0.5; n.attackAnim = 0.5;
      this.son(n, () => { sound.swish && sound.swish(1.1); });
      this.frapperJoueur(n, G.coups[0] + Math.random() * (G.coups[1] - G.coups[0]), 'Abattu par ' + this.nomCause(n));
    }
  },
  nomCause(n) { return `${n.name} ${n.d.surname}, ${n.d.garde.titre || n.d.role.toLowerCase()}`; },
  // (pendant le coup, gardes.coup dit qui frappe : un coup mortel devient un coup qui assomme, sauf pour un meurtre)
  frapperJoueur(n, dmg, cause) {
    this.coup = n;
    try { play.hurt(Math.round(dmg), n, cause); } finally { this.coup = null; }
  },
  tirer(n) {
    try { if (typeof chasse !== 'undefined' && chasse.sonTir) chasse.sonTir([n.x, n.y + 1.5, n.z]); else sound.shot && sound.shot(); } catch (e) { /* rien */ }
    n.g1flashT = 0.09;
    try { entities.scare(n.x, n.z, 70); } catch (e) { /* rien */ }
  },
  // un garde qu'on frappe : il se défend (ou, peureux et blessé, il fuit et appelle)
  frappe(n) {
    if (!n.st.alive) return;
    n.fleeT = 0;
    const G = n.d.garde;
    if (G.courage < 0.5 && (n.hp ?? 100) < 55) { n.fleeT = 6; n.attaque = false; gardes.parle(n, this.dit('peur', n), 2.5); this.appeler(n); return; }
    if (this.dort(n)) this.reveiller(n);
    n.attaque = true; n.poursuite = game.time + 18; n.vuT = game.time;
    const S = this.S();
    if (!S.rebelle || !S.rebelle.actif) S.rebelle = { actif: true, lieu: G.lieu, day: farm.s.day, C: null, fuite: false, comment: 'coups' };
    this.appeler(n);
  },

  // ------------------------------------------------------------------ l'arrestation
  async arreter(par, mode) {
    if (societe.arrestation || game.dying || game.sleeping) return;
    societe.arrestation = true;
    this.fermerChoix();
    const p = game.player, R = societe.recherche(), S = this.S(), s = farm.s;
    ui.close(true);
    for (const m of npcs.list) { societe.finPoursuite(m); m.attaque = false; }
    for (const e of societe.chasseurs) e.fin = true;
    if (S.rebelle) S.rebelle.actif = false;
    const nom = par.st.met ? par.name : par.d.role;
    try {
      if (mode === 'assomme') {
        S.assommes = (S.assommes || 0) + 1;
        await cine.jouer([
          { dur: 2.2, fondu: 'noir', texte: '(Un coup, et le sol vient à vous.)', debut() { sound.hurt && sound.hurt(20); } },
          { dur: 2.8, fondu: 'noir', texte: this.dit(s.fem ? 'assommeF' : 'assomme', par), qui: nom, debut() { sound.chain && sound.chain(); } },
        ], { passer: false });
      } else {
        // (de loin, il vient à vous : la scène les montre côte à côte)
        const dd = Math.hypot(par.x - p.pos[0], par.z - p.pos[2]);
        if (dd > 2.6 && !par.inside) { const k = 1.4 / dd, x = p.pos[0] + (par.x - p.pos[0]) * k, z = p.pos[2] + (par.z - p.pos[2]) * k; par.x = x; par.z = z; par.y = game.world.groundAt(x, z, p.pos[1] + 0.6, 0.8); par.course = null; }
        par.heading = Math.atan2(p.pos[0] - par.x, p.pos[2] - par.z); par.move = 0; par.run = false;
        const e = p.eyePos(), ax = par.x, az = par.z, a = Math.atan2(ax - p.pos[0], az - p.pos[2]) + 1.5;
        const mid = [(p.pos[0] + ax) / 2, e[1] - 0.25, (p.pos[2] + az) / 2];
        await cine.jouer([
          { dur: 3.2, de: { pos: [mid[0] + Math.sin(a) * 3.4, e[1] + 0.3, mid[2] + Math.cos(a) * 3.4], look: mid }, a: { pos: [mid[0] + Math.sin(a + 0.35) * 2.8, e[1] + 0.15, mid[2] + Math.cos(a + 0.35) * 2.8], look: mid }, texte: this.dit('arrete', par), qui: nom, joueur: true, debut() { sound.chain && sound.chain(); } },
          { dur: 2.4, fondu: 'noir', texte: '(Les fers se referment sur vos poignets.)', debut() { sound.lock && sound.lock(true); } },
        ], { passer: false });
      }
      if (mode === 'rendu') S.rendus = (S.rendus || 0) + 1;
      S.arrets = (S.arrets || 0) + 1;
      this.noter(par.d.garde.lieu, 'arrestation', { g: par.id, m: mode });
      await societe.cachot(R);
    } catch (err) { console.error(err); }
    societe.arrestation = false;
  },
  // se rendre de soi-même à un garde qui ne savait rien : il apprend ce que la vallée sait, et il vous emmène
  seRendre(n) {
    const v = societe.villageDe(n.id);
    for (const C of societe.actifs()) if (societe.connuQuelquePart(C) && v) societe.apprendre(C, v, farm.s.day);
    societe.majAffiches(true);
  },

  // ------------------------------------------------------------------ les « problèmes » : qui accourt, où
  cri(x, z, n, tir) { this.cris.push({ x, z, t: game.time, id: n ? n.id : null, tir: !!tir }); if (this.cris.length > 6) this.cris.shift(); },
  menaces(lieu, Z) {
    const out = [], dans = (x, z, m) => Math.hypot(x - Z.x, z - Z.z) < Z.r + (m || 0);
    const T = typeof tueur !== 'undefined' ? tueur.E : null;
    if (T && T.etat !== 'fuite' && T.etat !== 'tue' && dans(T.x, T.z, 25)) out.push({ type: 'tueur', e: T, x: T.x, z: T.z, tous: true, bruit: true, duree: 90, portee: 150 });
    const K = strange.killerE;
    if (K && K.kind === 'killer' && strange.ents.includes(K) && dans(K.x, K.z, 20)) out.push({ type: 'masque', e: K, x: K.x, z: K.z, tous: true, bruit: true, duree: 60, portee: 140 });
    for (const e of entities.list) {
      if (e.dead || e.hidden || e.far || e.owner || e.removed || !G1_BETES.has(e.kind) || !dans(e.x, e.z, -Z.r * 0.35)) continue;
      out.push({ type: 'bete', e, x: e.x, z: e.z, tous: e.kind === 'bear', duree: 70, portee: 120 });
      break;
    }
    if (typeof vallee !== 'undefined' && vallee.burning && vallee.burning.size) for (const b of vallee.burning.values()) if (dans(b.x, b.z, 15)) { out.push({ type: 'feu', x: b.x, z: b.z, tous: true, bruit: true, duree: 150, portee: 170 }); break; }
    for (const c of this.cris) if (game.time - c.t < 30 && !c.vu && dans(c.x, c.z, 20)) out.push({ type: 'cri', x: c.x, z: c.z, bruit: true, duree: 45, portee: 140, id: c.id, c, tir: c.tir });
    return out;
  },
  urgences() {
    for (const lieu of ['valbrume', 'clairpre']) {
      const Z = this.zone(lieu);
      if (!Z) continue;
      const G = this.du(lieu).filter((g) => this.vivant(g) && !g.st.malade && !g.urgence && !g.talking && !((g.poursuite || 0) > game.time) && !g.sommeT && !g.attaque && !(g.fleeT > 0));
      if (!G.length) continue;
      for (const M of this.menaces(lieu, Z)) {
        for (const g of G) {
          if (g.urgence) continue;
          const d = Math.hypot(g.x - M.x, g.z - M.z), dort = this.dort(g);
          if (d > M.portee || (dort && !(M.bruit && d < 45))) continue;
          if (dort) this.reveiller(g);
          g.urgence = { type: M.type, e: M.e || null, x: M.x, z: M.z, t0: game.time, fin: game.time + M.duree, lieu, id: M.id || null, tir: !!M.tir };
          g.goal = null;
          if (M.c) M.c.vu = true;
          if (M.type === 'bete' || M.type === 'feu') this.direUneFois(g, M.type, 120); // (l'homme, on l'interpelle quand on le voit)
          if (!M.tous) break;
        }
      }
    }
  },
  // l'autre garde du lieu, appelé à l'aide contre la même menace
  renfort(n, U) {
    for (const m of this.du(n.d.garde.lieu)) {
      if (m === n || !this.vivant(m) || m.st.malade || m.urgence || m.talking || m.attaque) continue;
      const d = Math.hypot(m.x - n.x, m.z - n.z);
      if (this.dort(m)) { if (d > 60) continue; this.reveiller(m); } else if (d > 160) continue;
      m.urgence = { type: U.type, e: U.e, x: U.x, z: U.z, t0: game.time, fin: game.time + 60, lieu: U.lieu, id: U.id || null };
      m.goal = null; m.fleeT = 0;
    }
  },
  finUrgence(n) { n.urgence = null; n.run = false; n.goal = null; n.course = null; n.g1vise = null; },
  // (chaque image, pour ceux qui ont une urgence : c'est nous qui les menons)
  agir(n, dt, w, c) {
    const U = n.urgence;
    n.dist = Math.hypot(n.x - c.px, n.z - c.pz); n.hurtT = Math.max(0, n.hurtT - dt); n.bubbleT = Math.max(0, n.bubbleT - dt);
    n.atkT = Math.max(0, (n.atkT || 0) - dt); n.g1tirT = Math.max(0, (n.g1tirT || 0) - dt);
    if (!U || game.time > U.fin || !n.st.alive) { this.finUrgence(n); return; }
    if (this.dort(n)) { n.sleep = false; n.state = 'idle'; }
    try {
      if (U.type === 'tueur' || U.type === 'masque') this.contreTueur(n, U, dt, w);
      else if (U.type === 'bete') this.contreBete(n, U, dt, w);
      else if (U.type === 'feu') this.contreFeu(n, U, dt, w);
      else this.versCri(n, U, dt, w);
    } catch (e) { console.error('G1 : urgence', e); this.finUrgence(n); }
  },
  arret(n, dt, x, z) { n.move = lerp(n.move, 0, Math.min(1, dt * 8)); n.run = false; n.state = 'idle'; if (x !== undefined) n.heading = turnToward(n.heading, Math.atan2(x - n.x, z - n.z), dt * 6); },
  // épauler, comme les chasseurs qui visent (11-zzz30-chasse.js : viser) : les bras devant, le fusil aux mains
  epauler(n, on) {
    if (on) { n.state = 'idle'; if (!n.goal || !n.goal.g1) n.goal = { node: -1, x: n.x, z: n.z, pose: 'fish', g1: true }; }
    else if (n.goal && n.goal.g1) n.goal = null;
  },
  // viser, puis tirer (le garde champêtre) : onTouche() si la balle porte
  viserTirer(n, cx, cz, dt, chance, onTouche) {
    this.arret(n, dt, cx, cz);
    if (!n.g1vise) { if (n.g1tirT <= 0) { n.g1vise = { t: 0.9 }; this.epauler(n, true); } return; }
    n.g1vise.t -= dt;
    if (n.g1vise.t > 0) return;
    n.g1vise = null; n.g1tirT = (n.d.garde.tir && n.d.garde.tir.cadence) || 3; this.epauler(n, false);
    this.tirer(n);
    if (Math.random() < chance) onTouche();
  },
  contreTueur(n, U, dt, w) {
    const masque = U.type === 'masque', E = masque ? strange.killerE : typeof tueur !== 'undefined' ? tueur.E : null;
    if (!E || E !== U.e || (masque && !strange.ents.includes(E))) { this.finUrgence(n); return; }
    if (!masque && E.etat === 'fuite') { if (!U.fini) { U.fini = true; gardes.parle(n, this.dit('blesse', n), 3); } this.finUrgence(n); return; }
    const Z = this.zone(U.lieu);
    if (Z && Math.hypot(E.x - Z.x, E.z - Z.z) > Z.r + 60) { this.finUrgence(n); return; } // (il s'éloigne : on ne quitte pas les maisons)
    const G = n.d.garde, d = Math.hypot(E.x - n.x, E.z - n.z);
    if (!U.dit && d < 30) { U.dit = true; this.direUneFois(n, 'tueur', 120); }
    // la peur : le garde des ponts s'arrête à distance, appelle, et rompt s'il approche
    if (G.courage < 0.5 && d < 14) { this.arret(n, dt, E.x, E.z); if (d < 6) { n.fleeT = 5; gardes.parle(n, this.dit('peur', n), 2.5); this.renfort(n, U); this.finUrgence(n); } return; }
    // le fusil
    if (G.tir && d > 4 && d < 20) { this.viserTirer(n, E.x, E.z, dt, 0.45, () => this.blesserTueur(n, E, masque)); return; }
    if (n.g1vise) { n.g1vise = null; this.epauler(n, false); }
    if (d > 2.2) { this.courir(n, E.x, E.z, dt, w, 4.8); return; } // (la lame porte plus loin que le couperet)
    this.arret(n, dt, E.x, E.z);
    if (U.duel) return;
    U.duel = true; n.attackAnim = 0.5;
    this.son(n, () => { sound.swish && sound.swish(1.2); });
    if (Math.random() < (G.courage >= 0.9 ? 0.7 : 0.5)) this.blesserTueur(n, E, masque);
    else this.tueParTueur(n, E, masque);
  },
  blesserTueur(n, E, masque) {
    if (masque) {
      E.hp = Math.max(10, (E.hp || 120) - 45); E.stagger = 0.8; E.state = 'search';
      E.tgt = [E.x + (E.x - n.x) * 8, E.z + (E.z - n.z) * 8];
      sound.hurtHuman && sound.hurtHuman(0.8);
      puffAt(E.x, E.y + 1.2, E.z, [140, 20, 20], 8, 1.5, false);
    } else tueur.blesser(E, 60);
    gardes.parle(n, this.dit('blesse', n), 3);
    this.noter(n.d.garde.lieu, masque ? 'masque_blesse' : 'tueur_blesse', { g: n.id });
    if (n.urgence) n.urgence.fin = Math.min(n.urgence.fin, game.time + 4);
  },
  tueParTueur(n, E, masque) {
    const w = game.world;
    E.attackAnim = 0.5;
    this.noter(n.d.garde.lieu, 'garde_tue', { g: n.id, par: masque ? 'masque' : 'errant' });
    npcs.kill(n, masque ? 'tueur' : 'errant', []);
    farm.addProp({ id: 'sang', x: n.x + 0.4, y: w.heightAt(n.x, n.z) + 0.01, z: n.z, r: Math.random() * TAU });
    if (masque) { if (strange.s && Array.isArray(strange.s.victims)) strange.s.victims.push(n.id); }
    else { tueur.S().victime = n.id; tueur.partir('meurtre'); }
    const p = game.player;
    if (Math.hypot(n.x - p.pos[0], n.z - p.pos[2]) < 140) setTimeout(() => ui.subtitle('', '(Un cri, dans la nuit. Un seul.)', 4), 600);
  },
  contreBete(n, U, dt, w) {
    const e = U.e, Z = this.zone(U.lieu);
    if (!e || e.removed || e.hidden || e.dead) { if (e && e.dead && !U.fini) { U.fini = true; gardes.parle(n, this.dit('abattue', n), 3); } this.finUrgence(n); return; }
    if (!Z || Math.hypot(e.x - Z.x, e.z - Z.z) > Z.r + 45) { this.finUrgence(n); return; }
    const G = n.d.garde, d = Math.hypot(e.x - n.x, e.z - n.z);
    if (G.courage < 0.5 && e.kind === 'bear' && d < 18) { this.arret(n, dt, e.x, e.z); return; }
    // blessé, on rompt (sauf le chevalier) : on appelle, on court
    if ((n.hp ?? 100) < 40 && G.courage < 0.95) { n.fleeT = 7; this.direUneFois(n, 'peur', 30); this.renfort(n, U); this.finUrgence(n); return; }
    if (G.tir && d > 3 && d < 26) { this.viserTirer(n, e.x, e.z, dt, clamp(0.85 - d / 60, 0.4, 0.85), () => this.toucherBete(n, e, 120 + Math.random() * 70)); return; }
    if (n.g1vise) { n.g1vise = null; this.epauler(n, false); }
    if (d > 1.9) { this.courir(n, e.x, e.z, dt, w, 4.5); return; }
    this.arret(n, dt, e.x, e.z);
    if (n.atkT <= 0) {
      n.atkT = 1.3 + Math.random() * 0.4; n.attackAnim = 0.5;
      this.son(n, () => { sound.swish && sound.swish(1.1); });
      this.toucherBete(n, e, (G.coups[0] + Math.random() * (G.coups[1] - G.coups[0])) * 1.6);
    }
    // les loups mordent qui est à portée (ils ne chassent que le fermier, d'ordinaire)
    if (e.kind === 'wolf' && d < 1.5 && Math.random() < dt * 0.35) npcs.hurt(n, 9 + Math.random() * 6, 'loup');
  },
  toucherBete(n, e, dmg) {
    if (e.dead) return;
    const ch = typeof chasse !== 'undefined' ? chasse : null;
    if (e.kind === 'wolf') { // (un loup touché fuit le garde ; s'il tombe, il tombe)
      e.hp -= dmg; e.hurtT = 0.3;
      if (e.hp <= 0) { e.dead = true; e.hidden = false; if (ch && ch.abattre) ch.abattre(e, n); }
      else entities.startFlee(e, n.x, n.z);
    } else {
      if (ch) ch._src = n;
      const mort = entities.damage(e, dmg, n.x, n.z);
      if (ch) ch._src = null;
      if (mort) { if (ch && ch.abattre) ch.abattre(e, n); }
      else if (ch && typeof CHASSE_DANGER !== 'undefined' && CHASSE_DANGER[e.kind] && !e.furie) ch.furie(e, n);
    }
    puffAt(e.x, e.y + 0.8, e.z, [140, 20, 20], 6, 1.2, false);
    if (e.dead) { this.noter(n.d.garde.lieu, 'bete', { g: n.id, b: e.kind }); if (n.urgence && !n.urgence.fini) { n.urgence.fini = true; gardes.parle(n, this.dit('abattue', n), 3); n.urgence.fin = game.time + 2; } }
  },
  contreFeu(n, U, dt, w) {
    const Z = this.zone(U.lieu);
    let best = null, bd = 1e9;
    if (typeof vallee !== 'undefined' && vallee.burning) for (const b of vallee.burning.values()) { if (Z && Math.hypot(b.x - Z.x, b.z - Z.z) > Z.r + 30) continue; const d = Math.hypot(b.x - n.x, b.z - n.z); if (d < bd) { bd = d; best = b; } }
    if (!best) { if (U.eteints) { gardes.parle(n, this.dit('eteint', n), 3); this.noter(U.lieu, 'feu', { g: n.id }); } this.finUrgence(n); return; }
    if (bd > 2.6) { this.courir(n, best.x, best.z, dt, w, 4.3); return; }
    this.arret(n, dt, best.x, best.z);
    if (n.atkT <= 0) {
      n.atkT = 2.3; n.attackAnim = 0.4;
      for (let k = 0; k < 12; k++) particles.spawn(best.x + (Math.random() - 0.5), best.y + 0.8 + Math.random() * 1.5, best.z + (Math.random() - 0.5), (Math.random() - 0.5), 1.2 + Math.random(), (Math.random() - 0.5), [0.8, 0.82, 0.85, 0.5], 0.25, 1.1, -0.3, false);
      best.water = (best.water || 0) + 1;
      if (best.water >= (best.tree ? 2 : 1)) { vallee.burnOut(best, true); U.eteints = (U.eteints || 0) + 1; }
    }
  },
  versCri(n, U, dt, w) {
    const d = Math.hypot(U.x - n.x, U.z - n.z);
    if (d > 3 && !U.arrive) { this.courir(n, U.x, U.z, dt, w, 4.2); return; }
    if (!U.arrive) {
      U.arrive = game.time;
      const mort = U.id && npcs.byId[U.id] && !npcs.byId[U.id].st.alive;
      gardes.parle(n, this.dit(mort ? 'tard' : U.tir ? 'tir' : 'cri', n), 3);
      if (mort) this.noter(U.lieu, 'cri', { g: n.id, v: U.id });
    }
    n.move = lerp(n.move, 0, Math.min(1, dt * 6)); n.run = false; n.heading += dt * 0.8 * Math.sin(game.time * 0.7);
    if (game.time - U.arrive > 7) this.finUrgence(n);
  },

  // ------------------------------------------------------------------ chaque image
  update(dt, playing) {
    if (!farm.s || !game.world || !this.L.length) return;
    const w = game.world, cam = game.player.pos, nuit = this.nuit();
    // ce qu'ils tiennent : le sabre tiré pour se battre, le fusil aux mains pour tirer, la lanterne la nuit
    for (const n of this.L) {
      const G = n.rig && n.rig.g1;
      n.g1flashT = Math.max(0, (n.g1flashT || 0) - dt);
      if (!G || Math.abs(n.x - cam[0]) > 170 || Math.abs(n.z - cam[2]) > 170) continue;
      const U = n.urgence, lutte = n.attaque || (U && (U.type === 'tueur' || U.type === 'masque' || U.type === 'bete'));
      G.sabre = !!(lutte && n.d.garde.arme === 'sabre');
      G.fusil = !!n.g1vise;
      G.lant = nuit && this.eveille(n) && !n.inside && !G.fusil;
    }
    // le choix refermé sans réponse
    const Sm = this.sommation;
    if (Sm && Sm.ouvert && ui.panel !== '#choice') {
      Sm.ouvert = false; Sm.ferme = true; Sm.fermeT = game.time;
      if (Sm.n && Sm.n.st.alive) gardes.parle(Sm.n, this.dit('repete', Sm.n), 2.5);
    }
    if (Sm && !Sm.ouvert && (!Sm.n || !Sm.n.sommeT || game.time - Sm.fermeT > 30)) this.sommation = null;
    this.t -= dt;
    if (this.t <= 0) { this.t = 0.25; if (playing) this.surveiller(); }
    this.tU -= dt;
    if (this.tU <= 0) { this.tU = 1; this.chaqueSeconde(); }
  },
  chaqueSeconde() {
    const w = game.world, h = npcs.hour();
    for (const n of this.L) {
      n.recoT = game.time + 60; // (un garde ne crie pas « au garde » : il vient)
      if (n.st.alive && !n.attaque && !n.urgence) n.hp = Math.min(100, (n.hp ?? 100) + 0.6);
      const enCours = (n.poursuite || 0) > game.time || (n.alerte && n.alerte.t > game.time) || n.sommeT;
      if (!enCours && n.attaque) this.perdu(n);
      else if (!enCours && n.alerte) n.alerte = null;
      if (enCours || n.attaque || n.urgence) n.murT = Math.max(n.murT || 0, game.time + 20); // (11-zzlife.js : on ne marmonne pas en courant après quelqu'un)
    }
    try { this.urgences(); } catch (e) { console.error('G1 : urgences', e); }
    this.majBraseros(h);
    this.relever(h);
    // le gendarme porte les nouvelles d'un village à l'autre, comme les colporteurs
    const g = npcs.byId.gendarme;
    if (g && g.st.alive && g.state === 'idle' && !g.sleep) {
      const v = societe.villageAt(g.x, g.z, 95);
      if (v && v !== g._village) { g._village = v; try { societe.echanger(g, v); } catch (e) { console.error(e); } }
      else if (!v) g._village = null;
    }
    void w;
  },
  // le brasero du poste brûle tant qu'on veille (de la tombée de la nuit au petit jour)
  majBraseros(h) {
    if (!this.braseros.length) return;
    const w = game.world;
    let change = false;
    for (const B of this.braseros) {
      const veille = this.du(B.lieu).some((n) => this.vivant(n) && n.d.garde.veille === 'nuit');
      const lit = veille && (h >= 19.5 || h < 6.5) && !strange.redNight();
      if (!!(B.q.data && B.q.data.lit) !== lit) { B.q.data = Object.assign({}, B.q.data || {}, { lit }); change = true; }
    }
    if (change) { w.collectLights(); farm.dirtyProps = true; }
  },
  // la relève : deux mots, quand on est là pour les entendre
  relever(h) {
    const s = farm.s, p = game.player;
    const essai = (lieu, h0, h1, a, b, rayon) => {
      if (h < h0 || h >= h1 || s.hours - (this.releve[lieu] ?? -99) < 3) return; // (une fois par relève : la fenêtre du matin enjambe l'aube)
      const A = npcs.byId[a], B2 = npcs.byId[b];
      if (!A || !B2 || !this.eveille(A) || !this.eveille(B2) || A.hunting || B2.hunting || A.urgence || B2.urgence) return;
      if (Math.hypot(A.x - B2.x, A.z - B2.z) > rayon || Math.hypot(A.x - p.pos[0], A.z - p.pos[2]) > 30) return;
      this.releve[lieu] = s.hours;
      const L = G1_RELEVE[lieu][Math.floor(s.hours / 24) % G1_RELEVE[lieu].length];
      L.forEach(([id, t], i) => setTimeout(() => { const m = npcs.byId[id]; if (m && m.st.alive && !game.dying) gardes.parle(m, t, 3.2); }, i * 3300));
    };
    essai('valbrume', 5.6, 6.3, 'chevalier_guet', 'garde', 30);
    essai('clairpre', 20.9, 21.6, 'garde_champetre', 'gendarme', 12);
  },

  // ------------------------------------------------------------------ ce qu'on lit : le registre, les avis
  nomJour(d) { return `${cal.nom(d)} ${d}`; },
  ligneJournal(E) {
    const g = E.g && npcs.byId[E.g], qui = g ? `${g.name} ${g.d.surname}` : 'le garde', s = farm.s, prenom = s.prenom || (s.fem ? 'la fermière' : 'le fermier');
    const fe = s.fem, nuit = E.h >= 20 || E.h < 6, quand = `${nuit ? 'Nuit du' : 'Le'} ${this.nomJour(E.j)}`; // (le jour de la ferme change à l'aube)
    switch (E.k) {
      case 'tueur_blesse': return `${quand} : un homme en long manteau, près des maisons. ${qui} l’a blessé. Il a fui. On ne l’a pas revu.`;
      case 'masque_blesse': return `${quand} : un homme masqué. ${qui} l’a touché. Il s’est sauvé, sans un cri.`;
      case 'garde_tue': return `${quand} : ${qui} est mort au guet. ${E.par === 'masque' ? 'L’homme au masque.' : 'L’homme au long manteau.'} Personne ne l’a vu partir.`;
      case 'bete': return `${quand} : ${G1_BETE_NOMS[E.b] || 'une bête'} près des maisons, abattu${E.b === 'wolf' ? 's' : ''} par ${qui}.`;
      case 'feu': return `${quand} : le feu, tout près. Éteint à la chaîne, avec les seaux.`;
      case 'cri': { const v = E.v && npcs.byId[E.v]; return `${quand} : un cri. ${qui} est allé voir. ${v ? `${v.name} ${v.d.surname}, mort.` : ''} Trop tard.`; }
      case 'rebellion': return `${quand} : ${prenom}, de la vieille ferme, a refusé de suivre ${qui}. Rébellion.`;
      case 'fuite': return `${quand} : ${prenom}, de la vieille ferme, a pris la fuite. Signalement transmis.`;
      case 'arrestation': return E.m === 'assomme' ? `${quand} : ${prenom}, de la vieille ferme, ${fe ? 'mise' : 'mis'} au tapis par ${qui}, ${fe ? 'conduite' : 'conduit'} au cachot.` : `${quand} : ${prenom}, de la vieille ferme, ${E.m === 'rendu' ? (fe ? 's’est rendue' : 's’est rendu') : fe ? 'arrêtée' : 'arrêté'} à ${qui}. Au cachot.`;
      case 'paye': return `${quand} : ${prenom}, de la vieille ferme, a réglé sa prime à ${qui}, sur-le-champ. Quittance.`;
    }
    return '';
  },
  registre(it) {
    const lieu = (it && it.data && it.data.lieu) || 'valbrume', s = farm.s, S = this.S(), out = [];
    const ev = S.journal.filter((E) => E.lieu === lieu);
    const RIEN = lieu === 'valbrume'
      ? ['Ponts levés à neuf heures. Rien à signaler.', 'Brouillard sur les douves. Rien.', 'Les chiens ont aboyé vers une heure. Rien vu.', 'Pluie fine. Rien.', 'Vent d’ouest. Une lumière sur la route du nord, à deux heures, qui ne s’est pas approchée.', 'Rien. Trois heures dix : des pas sur le pont levé. Rien vu.', 'Nuit claire. Rien.']
      : ['Rien à signaler. Une chèvre dans le chemin, rentrée.', 'Ronde de nuit : rien. Le chien de Morel a hurlé à minuit.', 'Haie de Bastien taillée du mauvais côté. Avertissement.', 'Rien. Le tambour a sonné une fois, tout seul. Non consigné.', 'Rien à signaler, sauf la pluie.', 'Borne du chemin du lac : déplacée de trois pouces. Remise.'];
    for (let d = s.day; d > Math.max(0, s.day - 8); d--) {
      const L = ev.filter((E) => E.j === d).map((E) => this.ligneJournal(E)).filter(Boolean);
      if (L.length) out.push(...L);
      else if (d < s.day) out.push(`${lieu === 'valbrume' ? 'Nuit du' : 'Le'} ${this.nomJour(d)} : ${RIEN[hashString(lieu + d) % RIEN.length]}`);
    }
    if (lieu === 'valbrume') out.push('(Plus haut, d’une encre plus ancienne : « Nuit de la levée. Le sergent Ferrand n’a pas paru. Son lit est fait. »)');
    else out.push('(Plus haut, d’une autre main : « Procès-verbal contre inconnu. A marché sur l’eau de la mare. Classé. »)');
    ui.read(lieu === 'valbrume' ? 'Le registre du guet' : 'Le registre des procès-verbaux', out.join('\n\n'));
  },
  avis(it) {
    const lieu = (it && it.data && it.data.lieu) || 'valbrume', s = farm.s, S = this.S(), R = societe.recherche(), paras = [];
    const v = lieu;
    if (R && R.villages.includes(v)) {
      const quoi = societe.actifs().filter((C) => societe.connait(C, v)).map((C) => societe.libelle(C)).join(', ');
      paras.push(s.fem ? `RECHERCHÉE — ${s.prenom || 'la fermière'}, fermière de la vieille ferme, pour ${quoi}. Prime : ${R.prime} pièces. S’adresser aux gardes.` : `RECHERCHÉ — ${s.prenom || 'le fermier'}, fermier de la vieille ferme, pour ${quoi}. Prime : ${R.prime} pièces. S’adresser aux gardes.`);
    }
    const recent = (k, j) => S.journal.some((E) => E.lieu === lieu && E.k === k && s.day - E.j <= j);
    if (recent('tueur_blesse', 6) || recent('garde_tue', 8)) paras.push('AVIS — Un homme en long manteau a été vu, la nuit, près des maisons. Fermez vos portes. Ne sortez pas seul après le coucher du soleil.');
    if (recent('bete', 4)) paras.push('AVIS — Une bête dangereuse a été abattue près des maisons. D’autres peuvent suivre. Tenez les enfants près de vous.');
    const perdus = npcs.list.filter((n) => n.vanished && n.st.alive), SO = societe.S(), morts = npcs.list.filter((n) => !n.st.alive && SO.morts[n.id] && s.day - SO.morts[n.id].day <= 12);
    if (perdus.length) paras.push('AVIS DE RECHERCHE — ' + perdus.map((n) => n.name + ' ' + n.d.surname).join(', ') + '. Toute personne ayant des nouvelles est priée de se présenter aux gardes.');
    if (morts.length) paras.push('AVIS DE DÉCÈS — ' + morts.map((n) => `${n.name} ${n.d.surname} († ${cal.nom(SO.morts[n.id].day)} ${SO.morts[n.id].day})`).join(', ') + '.');
    paras.push(lieu === 'valbrume'
      ? `ARRÊTÉ — Les ponts de ${farm.names.ville} sont levés à neuf heures du soir et baissés à six heures du matin. Qui reste dehors s’adresse au corps de garde. — Le maire.`
      : `AVIS — Les chiens seront tenus à l’attache la nuit. Les chèvres aussi. Il est interdit de déplacer les bornes. — Le garde champêtre de ${farm.names.hameau}.`);
    ui.read('Le tableau des avis', paras.join('\n\n'));
  },

  // ------------------------------------------------------------------ le dialogue avec un garde quand on est recherché
  vueRecherche(n, K) {
    talk.n = n; n.talking = true; n.speakT = 2;
    const R = societe.recherche(), s = farm.s, lib = K.map((C) => societe.libelle(C)).join(', ');
    const prime = R ? R.prime : K.reduce((a, C) => a + C.prime, 0);
    const t = n.id === 'garde'
      ? (s.fem ? `Vous êtes recherchée pour ${lib}. La prime est de ${prime} pièces. Réglez-la, ou suivez-moi.` : `Vous êtes recherché pour ${lib}. La prime est de ${prime} pièces. Réglez-la, ou suivez-moi.`)
      : n.id === 'chevalier_guet' ? `On vous cherche pour ${lib}. ${prime} pièces. Vous les avez, ou vous me suivez.`
        : n.id === 'garde_champetre' ? `Ah ! Vous êtes au tableau, vous ! Pour ${lib}. ${prime} pièces de prime. On règle, ou on me suit, et sans histoires !`
          : `${s.fem ? 'Vous êtes recherchée' : 'Vous êtes recherché'} pour ${lib}. La prime s’élève à ${prime} pièces. Vous pouvez la régler entre mes mains, ou me suivre.`;
    const opts = [{ label: s.money >= prime ? `Payer la prime (${prime} pièces)` : `Payer la prime (${prime} pièces — vous n’en avez que ${s.money})`, act: 'g1:payer', quest: true }];
    opts.push({ label: 'Me rendre', act: 'g1:rendre' });
    opts.push({ label: 'Refuser de le suivre', act: 'g1:refus' });
    return talk.view(t, opts);
  },
  choisir(n, a) {
    const s = farm.s;
    if (a === 'payer') {
      const r = societe.payer(this.nomComplet(n));
      if (r === 'pauvre') return talk.view(this.dit('pauvre', n), [{ label: 'Me rendre', act: 'g1:rendre' }, { label: 'Refuser de le suivre', act: 'g1:refus' }]);
      if (r === 'ok') {
        const S = this.S(); S.payes = (S.payes || 0) + 1;
        npcs.addAmitie(n, 10); this.calme();
        this.noter(n.d.garde.lieu, 'paye', { g: n.id });
      }
      return talk.view(this.dit('paye', n), talk.options());
    }
    if (a === 'rendre') { talk.close(); ui.close(true); setTimeout(() => this.arreter(n, 'rendu'), 200); return null; }
    if (a === 'inconnu') {
      this.seRendre(n);
      talk.close(); ui.close(true);
      gardes.parle(n, this.dit('inconnu', n), 4);
      setTimeout(() => this.arreter(n, 'rendu'), 2400);
      return null;
    }
    if (a === 'refus') { talk.close(); this.refus(n, 'dialogue'); return null; } // (le panneau se ferme : on reprend la main)
    void s;
    return talk.view('…', talk.options());
  },
};

// ============================================================================
//  BRANCHEMENTS (au chargement du module : ces objets existent déjà)
// ============================================================================
// ---------------------------------------------------------------- la semaine de chacun (par-dessus 11-zzz52-routines.js)
{
  const _rdj = routineDuJour;
  routineDuJour = function (n) {
    if (n && n.d && G1_IDS.includes(n.d.id) && farm.s && game.world) return gardes.journee(n);
    return _rdj(n);
  };
}
if (typeof massGoer === 'function') {
  const _mg = massGoer;
  massGoer = function (n) { return n && G1_IDS.includes(n.id) ? false : _mg(n); };
}
// ---------------------------------------------------------------- sans leur cabane (une vallée d'avant la vallée dessinée), ils ne sont pas là
{
  const _init = npcs.init.bind(npcs);
  npcs.init = function (w, s) {
    const sans = G1_HABITANTS.filter((d) => !(w && w.bld && w.bld[d.home]));
    if (!sans.length) return _init(w, s);
    const retires = [];
    for (const d of sans) { const i = NPC_DATA.indexOf(d); if (i >= 0) retires.push([i, NPC_DATA.splice(i, 1)[0]]); }
    try { return _init(w, s); } finally { for (const [i, d] of retires.reverse()) NPC_DATA.splice(i, 0, d); }
  };
}
// ---------------------------------------------------------------- la société : l'alerte, la panique, la poursuite, l'arrestation, la prime
{
  societe.alerterGarde = function (x, z, k) { return gardes.alerter(x, z, k); };
  const _pan = societe.panique.bind(societe);
  societe.panique = function (x, z, tem) {
    _pan(x, z, (tem || []).filter((m) => !gardes.est(m))); // (un garde ne crie pas « au secours » : il vient)
    for (const m of tem || []) if (gardes.est(m) && m.st.alive) { m.fleeT = 0; if (gardes.eveille(m)) { m.poursuite = game.time + 18; m.vuT = game.time; } }
  };
  const _pours = societe.poursuivre.bind(societe);
  societe.poursuivre = function (n, dt, w, c) { if (gardes.est(n)) return gardes.poursuivre(n, dt, w, c); return _pours(n, dt, w, c); };
  const _arr = societe.arreter.bind(societe);
  societe.arreter = function (par) { if (gardes.est(par)) return gardes.arreter(par, 'sommation'); return _arr(par); };
  const _vr = societe.vueRecherche.bind(societe);
  societe.vueRecherche = function (n, K) { if (gardes.est(n)) return gardes.vueRecherche(n, K); return _vr(n, K); };
  // lever la main sur un garde coûte ce qu'il en coûte pour Grosjean (11-zzz50-societe.js : prixDe, garde, maire, curé)
  const _px = societe.prixDe.bind(societe);
  societe.prixDe = function (type, vic) { const p = _px(type, vic); return vic && gardes.nouveau(vic) ? p + (type === 'meurtre' ? 400 : 60) : p; };
  // les nouveaux gardes ne fuient pas l'assassin connu : ils viennent à lui
  const _host = npcs.hostile.bind(npcs);
  npcs.hostile = function (n) { if (gardes.nouveau(n)) return false; return _host(n); };
}
// ---------------------------------------------------------------- les urgences : c'est nous qui menons les gardes qui accourent
{
  const _upd = npcs.update.bind(npcs);
  npcs.update = function (dt, w, c) {
    const U = [];
    for (const n of gardes.L) if (n.urgence && !n.hunting && n.st.alive && !n.vanished && !n.talking) { n.hunting = true; U.push(n); }
    try { _upd(dt, w, c); } finally { for (const n of U) n.hunting = false; }
    for (const n of U) gardes.agir(n, dt, w, c);
  };
}
// ---------------------------------------------------------------- les coups, les cris, les morts
{
  const _hurt = npcs.hurt.bind(npcs);
  npcs.hurt = function (n, dmg, by) {
    const avant = !!(n && n.st && n.st.alive);
    _hurt(n, dmg, by);
    if (!farm.s || !avant || !game.world) return;
    if (by !== 'joueur') { gardes.cri(n.x, n.z, n); return; }
    if (gardes.est(n) && n.st.alive) gardes.frappe(n);
    gardes.temoinsCrime(npcs.witnesses(n.x, n.z, n).concat([n]), n.x, n.z);
  };
  const _kill = npcs.kill.bind(npcs);
  npcs.kill = function (n, by, wit) {
    const avant = !!(n && n.st && n.st.alive);
    _kill(n, by, wit);
    if (!farm.s || !avant || !game.world || (n.st && n.st.alive)) return;
    if (by !== 'joueur') gardes.cri(n.x, n.z, n);
    if (gardes.est(n)) { n.urgence = null; n.attaque = false; if (gardes.sommation && gardes.sommation.n === n) gardes.fermerChoix(); }
  };
}
// ---------------------------------------------------------------- vols, fouilles, objets pris : les gardes témoins (ou tout près) accourent
{
  const _vp = vol.pris.bind(vol);
  vol.pris = function (n, tem) {
    _vp(n, tem);
    if (gardes.est(n) && n.st.alive) { n.fleeT = 0; n.poursuite = game.time + 18; n.vuT = game.time; }
    gardes.temoinsCrime(tem || [n], n.x, n.z);
  };
  const _vc = vol.chance.bind(vol);
  vol.chance = function (n) { const k = _vc(n); return gardes.nouveau(n) ? clamp(k - 0.2, 0.03, 0.9) : k; };
  const _fp = fouilles.pris.bind(fouilles);
  fouilles.pris = function (it, own, vus, cri) { _fp(it, own, vus, cri); const p = game.player; gardes.temoinsCrime(vus || [], p.pos[0], p.pos[2]); };
  const _os = objets.surpris.bind(objets);
  objets.surpris = function (type, acte, own, vus, pos, L, prof) { _os(type, acte, own, vus, pos, L, prof); gardes.temoinsCrime(vus || [], pos[0], pos[2]); };
}
// ---------------------------------------------------------------- un coup de feu près des maisons (11-zzz30-chasse.js : bruitDeTir)
if (typeof chasse !== 'undefined' && chasse.bruitDeTir) {
  const _bt = chasse.bruitDeTir.bind(chasse);
  chasse.bruitDeTir = function (pos) {
    const avant = new Map(gardes.L.map((n) => [n, n.fleeT || 0]));
    _bt(pos);
    if (!farm.s) return;
    for (const n of gardes.L) if (gardes.nouveau(n) && (n.fleeT || 0) > avant.get(n)) n.fleeT = avant.get(n); // (un garde ne fuit pas un coup de feu)
    // (ils viennent voir ; sauf si Grosjean, tout près, a déjà crié son « On ne tire pas en ville »)
    const g = npcs.byId.garde, gronde = g && g.st.alive && !g.vanished && !g.sleep && Math.hypot(g.x - pos[0], g.z - pos[2]) < 80;
    if (!gronde && gardes.lieuDe(pos[0], pos[2], 30)) gardes.cri(pos[0], pos[2], null, true);
  };
}
// ---------------------------------------------------------------- le registre, les avis
HOOKS.inter.g1_registre = (it) => gardes.registre(it);
HOOKS.inter.g1_avis = (it) => gardes.avis(it);
// ---------------------------------------------------------------- chaque image, chaque matin, la lumière des lanternes et des coups de feu
HOOKS.update.push((dt, eye, basis, sky, playing) => { if (farm.s) gardes.update(dt, playing); });
HOOKS.day.push(() => {
  if (!farm.s) return;
  gardes.jcache.clear();
  for (const n of gardes.L) { n.hp = 100; n.peurDite = false; n.tirSomme = false; }
  const S = gardes.S();
  if (S.rebelle && !S.rebelle.actif && farm.s.day - S.rebelle.day > 2) S.rebelle = null;
});
HOOKS.lights.push((eye) => {
  const L = [];
  for (const n of gardes.L) {
    const d = Math.hypot(n.x - eye[0], n.z - eye[2]);
    if (d > 110 || n.state === 'gone') continue;
    if (n.g1flashT > 0) L.push({ x: n.x, y: n.y + 1.5, z: n.z, r: 12, c: [1.6, 1.2, 0.7], d });
    else if (n.rig && n.rig.g1 && n.rig.g1.lant && n.state !== 'dead') L.push({ x: n.x + Math.sin(n.heading + 1.4) * 0.3, y: n.y + 0.75, z: n.z + Math.cos(n.heading + 1.4) * 0.3, r: 7.5, c: [1.05, 0.8, 0.48], d });
  }
  return L;
});

// ============================================================================
//  AU CHARGEMENT : les gardes, les braseros, le cheval ; les branchements qui demandent game
// ============================================================================
HOOKS.load.push(() => {
  const w = game.world, S = gardes.S();
  gardes.L = npcs.list.filter((n) => gardes.est(n));
  gardes.sommation = null; gardes.cris = []; gardes.coup = null; gardes.jcache.clear(); gardes.releve = {}; gardes.redemandeT = -1e9;
  for (const n of gardes.L) { n.urgence = null; n.attaque = false; n.g1vise = null; n.hp = 100; n.reveilT = 0; n.peurDite = false; n.tirSomme = false; }
  if (S.rebelle) S.rebelle.actif = false;
  // les braseros des postes
  gardes.braseros = [];
  if (w && w.g1 && w.g1.lieux) for (const lieu in w.g1.lieux) {
    const P = w.g1.lieux[lieu].poste;
    if (!P) continue;
    const q = w.props.find((x) => x.id === 'brasero' && Math.hypot(x.x - P.x, x.z - P.z) < 3);
    if (q) gardes.braseros.push({ q, lieu });
  }
  if (typeof DYN_PROPS !== 'undefined') DYN_PROPS.add('brasero');
  if (typeof SoundEngine !== 'undefined' && SoundEngine.FEUX && SoundEngine.FEUX.g1_poele === undefined) SoundEngine.FEUX.g1_poele = 0.6;
  // Mistral, le cheval du gendarme, à l'écurie
  const Lc = w && w.g1 && w.g1.lieux && w.g1.lieux.clairpre;
  if (Lc && Lc.cheval && S.cheval !== 'mort' && !entities.extra.some((e) => e.g1Cheval)) {
    const C = Lc.cheval;
    try { entities.add(w, 'horse', C.x, C.z, { v: 3, g1Cheval: true, hx: C.x, hz: C.z, heading: C.r, cfg: Object.assign({}, CREATURES.horse, { range: 1.0, idle: [6, 16], flee: 0 }) }); } catch (e) { console.error('G1 : le cheval', e); }
  }
  if (gardes.hooked) return;
  gardes.hooked = true;
  // ---- leurs lieux (le poste, le pont, la ronde, l'écurie), leur lit, leur chaise
  const _dest = npcs.dest.bind(npcs);
  npcs.dest = function (n, pl, sleep) {
    if (gardes.nouveau(n) && farm.s) { try { const D = gardes.dest(n, pl, sleep); if (D && D.node >= 0) return D; } catch (e) { console.error('G1 : dest', e); } }
    if (typeof pl === 'string' && pl.startsWith('g1:')) pl = 'home';
    return _dest(n, pl, sleep);
  };
  // ---- ceux qui veillent la nuit dorment le jour
  const _sp = npcs.schedulePlace.bind(npcs);
  npcs.schedulePlace = function (n, h) {
    const r = _sp(n, h);
    if (!farm.s || !gardes.nouveau(n) || !r || r.place !== 'home') return r;
    const dort = gardes.dortA(n, h) || !!n.st.malade && (h < 8 || h >= 20.5);
    return dort === !!r.sleep ? r : { place: 'home', sleep: dort };
  };
  // ---- un coup de garde qui serait mortel assomme (sauf pour un meurtre)
  const _die = game.die.bind(game);
  game.die = function (cause) {
    const g = gardes.coup;
    if (g && farm.s && !game.dying && !gardes.meurtreConnu()) {
      gardes.coup = null;
      game.player.hp = 6;
      gardes.arreter(g, 'assomme');
      return Promise.resolve();
    }
    return _die(cause);
  };
  // ---- le cheval du gendarme : on le flatte, on ne le monte pas
  const _use = game.useAnimal.bind(game);
  game.useAnimal = function (e) {
    if (e && e.g1Cheval) { sound.animal && sound.animal('horse', 0, 0.5); ui.subtitle('', '(Le cheval du gendarme. Il se laisse flatter l’encolure, pas plus.)', 3); return; }
    return _use(e);
  };
  const _hc = play.hurtCreature.bind(play);
  play.hurtCreature = function (e, dmg, eye) { const r = _hc(e, dmg, eye); if (e && e.g1Cheval && e.dead && farm.s) gardes.S().cheval = 'mort'; return r; };
  // ---- les lits : celui du passant est à qui le prend ; celui qui vous trouve dans le sien
  const _info = sommeil.infoLit.bind(sommeil);
  sommeil.infoLit = function (q) { const I = _info(q); if (q && q.data && q.data.passant) return { cat: 'public', bld: I.bld }; return I; };
  const _dec = sommeil.decouvert.bind(sommeil);
  sommeil.decouvert = function (n, I, quand) {
    const t = n && G1_LIT_DECOUVERT[n.id];
    if (!t) return _dec(n, I, quand);
    const A = LIT_DECOUVERT.autre, M = LIT_DECOUVERT.matin;
    LIT_DECOUVERT.autre = [t]; LIT_DECOUVERT.matin = [t];
    try { return _dec(n, I, quand); } finally { LIT_DECOUVERT.autre = A; LIT_DECOUVERT.matin = M; }
  };
  // ---- le dialogue : recherché, on parle prime ; se rendre de soi-même ; l'assassin ; les nouvelles du gendarme
  const _open = talk.open.bind(talk);
  talk.open = function (n) {
    if (farm.s && gardes.est(n)) { const K = societe.crimesSus(n); if (K.length) return gardes.vueRecherche(n, K); }
    return _open(n);
  };
  const _options = talk.options.bind(talk);
  talk.options = function () {
    const n = this.n, opts = _options();
    if (!n || !farm.s || !gardes.est(n)) return opts;
    const i = opts.findIndex((o) => o.act === 'bye'), extra = [];
    if (societe.recherche() && !societe.crimesSus(n).length) extra.push({ label: 'Je viens me rendre', act: 'g1:inconnu', quest: true });
    if (gardes.nouveau(n) && strange.killerActive() && !opts.some((o) => o.act === 'accuse')) extra.push({ label: 'Je sais qui est l’assassin…', act: 'accuse' });
    if (n.id === 'gendarme' && !opts.some((o) => o.act === 'soc:nouvelles')) extra.push({ label: 'Quelles nouvelles ?', act: 'soc:nouvelles' });
    opts.splice(i >= 0 ? i : opts.length, 0, ...extra);
    return opts;
  };
  const _choose = talk.choose.bind(talk);
  talk.choose = function (act) {
    const n = this.n;
    if (n && typeof act === 'string' && act.startsWith('g1:')) return gardes.choisir(n, act.slice(3));
    return _choose(act);
  };
});
