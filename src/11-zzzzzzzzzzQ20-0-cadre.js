// ============================================================================
//  LES SCÈNES DES QUÊTES (agent Q20A, vingtième vague) — 0. LE CADRE COMMUN
//  Chaque quête peut avoir ses scènes : trois moments au plus, courts, filmés
//  sur le moteur de l'histoire (h17Cine : on passe en maintenant Espace ou
//  Échap ; la partie est tenue pendant ce temps, le personnage rendu tel quel).
//  - LES MOMENTS : 'demande' (on accepte), 'tournant' (on arrive, on trouve, on
//    a parlé à la bonne personne), 'fin' (on rend la quête) ; une fin à choix a
//    son dénouement à elle : 'fin:0', 'fin:1'… (le choix retenu, Q.choix).
//  - LES DÉCLENCHEURS : tout ce qui passe par quests (les habitants, et les
//    secondes quêtes de Q16 qui y passent aussi) et par q16 (les autres) se
//    déclenche seul : accepter → demande, rendre → fin ; le tournant, quand la
//    quête devient « rendable » (objet trouvé, message porté, lieu veillé…),
//    sauf pour les quêtes où l'on apporte des choses. Les autres sortes de
//    quêtes appellent q20.declencher(id, moment) elles-mêmes.
//  - LA FILE : une scène attend le premier moment calme (ni combat, ni coup
//    reçu depuis peu, ni bête qui charge, ni eau par-dessus la tête, ni chute,
//    ni panneau ouvert, ni peur, ni autre monde ; l'histoire et les récits
//    passent d'abord) ; elle saute si elle n'a plus de sens (la quête a avancé,
//    l'habitant est mort, elle attend depuis trop longtemps).
//  - L'OPTION (Jeu › « Scènes des quêtes ») : Toutes (par défaut), Courtes (la
//    demande et le dénouement, cinq à huit secondes), Aucune.
//  - UNE SCÈNE DÉJÀ VUE ne se rejoue pas ; vue ou sautée, elle rejoint les
//    Souvenirs du carnet (rangée par habitant : 12-zzzzzzzzzzQ20-souvenirs.js).
//  - LES ANCIENNES PARTIES : rien ne s'y rejoue (ce qui est passé rejoint les
//    Souvenirs) ; une quête déjà en cours ne rejoue pas sa demande.
//  - LÉGER : une scène n'est construite qu'au moment de la jouer ; hors scène,
//    rien à chaque image (la file est regardée deux fois par seconde).
//  - Pour les succès : 'prairie:quetescine' sur window, detail { quete, moment,
//    qui, court } ; q20.ecouter(fn).
//  État : farm.s.q20 = { v, fait: { 'id|moment': jour } (passé : vu ou sauté),
//         vus: { 'id|moment': jour } (vraiment vu), heures: { 'id|moment': h },
//         file: [{ id, m, j, h, d }], connus: { id: 1 }, anc: 1 (partie d'avant) }.
//  API (voir le contrat $SP/eq/contrat-v20.md) :
//    q20.scenes(id, { qui, demande(c), tournant(c), fin(c), fins: { k: fn(c) }, delais, etat, tournantSi })
//    q20.declencher(id, moment), q20.construire(id, moment, o), q20.jouer, q20.rejouer, q20.souvenirs(),
//    q20.mode(), q20.ecouter(fn) ; le contexte c d'une scène : la classe Q20Scene (lieux, acteurs, caméras, plans).
// ============================================================================
const Q20_MOMENTS = ['demande', 'tournant', 'fin'];
const Q20_REGL = {
  tick: 0.5,                                        // la file, deux fois par seconde
  calme: 1.5,                                       // secondes de calme avant qu'une scène commence
  danger: 6,                                        // secondes de calme exigées après un coup, une bête qui charge
  delai: { demande: 0.6, tournant: 1.5, fin: 0.6 },  // l'attente après le déclencheur (le panneau fermé d'abord)
  vieux: { demande: 1, tournant: 1, fin: 2 },        // au-delà de tant de jours d'attente, la scène n'a plus de sens
  duree: [8, 20],                                   // un moment, en secondes (version complète)
  court: [5, 8],                                    // un moment, en version courte
};
const Q20_TEXTES = {
  option: 'Scènes des quêtes',
  modes: { toutes: 'Toutes', courtes: 'Courtes', aucune: 'Aucune' },
  moments: { demande: 'La demande', tournant: 'Le tournant', fin: 'Le dénouement' },
  section: 'Les quêtes',
  revoir: 'Revoir',
  pasIci: '(Pas d’ici.)',
};
const Q20_SOUV_KEY = 'prairie.q20souvenirs';
// des silhouettes pour les scènes (Object.assign(Q20_LOOKS, { … }) depuis les tables de scènes ; K18_LOOKS aussi)
const Q20_LOOKS = {};
// les gestes d'un acteur (poseHuman) : un nom, une liste de noms, un objet, ou une fonction (t) → objet
const Q20_GESTES = {
  parle: { talk: 1 }, travaille: { work: 1 }, salue: { wave: 1 }, prie: { pray: 1 }, bras: { cross: 1 }, assis: { sit: 1 },
  peche: { fish: 1 }, porte: { carry: 1 }, tend: { reach: 0.45 }, offre: { reach: 0.2 }, montre: { attack: 0.33 }, peur: { cower: 1 },
  hoche: { nod: 1 }, baisse: { lookP: 0.42 }, leve: { lookP: -0.38 }, penche: { lean: 0.32, lookP: 0.32 }, raide: { pale: 1 },
};
// les sons d'un plan (son: 'cle' ou une fonction)
const Q20_SONS = {
  cloche: () => sound.bell && sound.bell(1), clochette: () => sound.bell && sound.bell(0.3), coups: () => sound.knock && sound.knock(3),
  murmure: () => sound.whisper && sound.whisper(0, 0.45), grondement: () => sound.rumble && sound.rumble(), corbeau: () => sound.crow && sound.crow(0.6),
  enclume: () => sound.anvil && sound.anvil(), piece: () => sound.coin && sound.coin(), page: () => sound.page && sound.page(),
  porte: () => sound.door && sound.door(true), hibou: () => sound.owl && sound.owl(), loup: () => sound.howl && sound.howl(70),
  goutte: () => sound.drip && sound.drip(), eau: () => sound.splash && sound.splash(), cheval: () => sound.animal && sound.animal('horse', 0, 0.7),
  vache: () => sound.animal && sound.animal('cow', 0, 0.7), poule: () => sound.animal && sound.animal('hen', 0, 0.6), quete: () => sound.quest && sound.quest(true),
};

// ============================================================================
//  LE CONTEXTE D'UNE SCÈNE : ce qu'un constructeur reçoit (c), et ses outils
// ============================================================================
class Q20Scene {
  constructor(id, moment, o) {
    o = o || {};
    const D = q20.defs[id] || {}, E = q20.etat(id) || {};
    this.id = id; this.moment = moment; this.def = D;
    this.w = game.world;
    this.q = E.q || null; this.Q = E.Q || null;
    this.choix = o.choix !== undefined ? o.choix : (E.choix !== undefined ? E.choix : null);
    this.qui = D.qui || E.qui || null;
    this.n = (this.qui && npcs.byId[this.qui]) || null;
    this.court = !!o.court; this.rejeu = !!o.rejeu;
    this.h = typeof o.h === 'number' && isFinite(o.h) ? ((o.h % 24) + 24) % 24 : npcs.hour();
    this.ids = new Set();      // les habitants qui jouent : cachés de la vallée le temps de la scène
    this.repli = 0;            // cadrages tombés sur le repli (l'équilibrage les compte)
    this._L = [];              // blocs déjà lus : [{ x, z, r, L }]
    this._rigs = {};
  }
  // ---------------------------------------------------------------- l'heure
  nuit(h) { h = h === undefined ? this.h : h; return h >= 20.2 || h < 5.6; }
  // l'heure d'un moment de la journée ('nuit', 'aube', 'soir', 'jour') ou l'heure du moment, à défaut
  heure(m) { return { nuit: 23.6, aube: 5.9, soir: 19.2, jour: 11, matin: 8.5 }[m] ?? this.h; }

  // ---------------------------------------------------------------- les répliques
  // qui : '@' (l'habitant de la quête, par défaut), '@id' (un autre habitant), '' (une pensée), un nom
  dit(texte, qui) {
    let n = this.n, nom = '';
    if (qui === undefined || qui === '@') nom = n ? n.name : '';
    else if (qui && qui[0] === '@') { n = npcs.byId[qui.slice(1)] || null; nom = n ? n.name : ''; }
    else { n = null; nom = qui || ''; }
    let t = String(texte || '');
    try { t = fmtLine(t, n); } catch (e) { /* (hors partie) */ }
    return { texte: t, qui: nom, voix: n ? n.voice || 1 : null };
  }

  // ---------------------------------------------------------------- les lieux
  // le sol sous (x, z) : terrain ou eau ; y donné (les pieds attendus) : un plancher, une marche, un pont aussi
  sol(x, z, y) {
    const w = this.w;
    if (y === undefined) return Math.max(w.heightAt(x, z), w.waterLevel);
    return w.groundAt(x, z, y + 0.5, 0.7);
  }
  pt(x, z, y) { return [x, this.sol(x, z, y), z]; }
  // la maison d'un habitant (ou un bâtiment, par sa clé) : la porte (dehors), le cap vers dehors, les places du dedans
  maison(qui) {
    const w = this.w, d = NPC_BY_ID[qui], k = d ? d.home : qui, B = w.bld && w.bld[k];
    if (!B || !B.out) return null;
    const dx = B.out[0] - B.x, dz = B.out[1] - B.z, L = Math.hypot(dx, dz) || 1, f = [dx / L, dz / L];
    const sp = (nm) => (B.spots && B.spots[nm] ? [B.spots[nm].x, B.y, B.spots[nm].z] : null);
    const self = this;
    return {
      cle: k, B, f, cap: Math.atan2(f[0], f[1]), sol: B.y, nom: (typeof LIEU_NAMES !== 'undefined' && LIEU_NAMES[k]) || B.name || k,
      porte: this.pt(B.out[0], B.out[1]), centre: [B.x, B.y, B.z],
      poste: sp('work'), comptoir: sp('counter'), assis: sp('sit'), lit: sp('bed'),
      // un point du dedans, dans le repère du bâtiment (lx vers la droite, lz vers le fond ; repère de B.f)
      local(lx, lz, dy) { const [x, z] = B.f ? qtW(B.f, lx, lz) : [B.x + lx, B.z + lz]; return [x, self.sol(x, z, B.y + (dy || 0)), z]; },
      // devant la porte, à d mètres dehors (et lat mètres de côté)
      dehors(d, lat) { const x = B.out[0] + f[0] * (d || 0) + f[1] * (lat || 0), z = B.out[1] + f[1] * (d || 0) - f[0] * (lat || 0); return self.pt(x, z); },
    };
  }
  // un lieu-dit (w.lm) ou un bâtiment (w.bld), par sa clé
  lieu(k) {
    const w = this.w, L = w.lm && w.lm[k];
    if (L) { const y = this.sol(L.x, L.z); return { cle: k, x: L.x, z: L.z, y, r: L.r || 10, nom: (typeof LIEU_NAMES !== 'undefined' && LIEU_NAMES[k]) || L.name, P: [L.x, y, L.z], L }; }
    const B = w.bld && w.bld[k];
    if (B) { const y = this.sol(B.x, B.z); return { cle: k, x: B.x, z: B.z, y, r: Math.max(B.W || 6, B.D || 6) / 2 + 2, nom: B.name || k, P: [B.x, y, B.z], B }; }
    return null;
  }
  // l'endroit précis d'une quête 'trouver' (là où l'objet a été posé), ou le centre de son lieu
  cachette() {
    const Q = this.Q, q = this.q, w = this.w;
    // (à la hauteur où quests.spawnFind l'a posé : sur le sol, ou sur la pierre, la marche, le plancher qui s'y trouve)
    if (Q && Q.pos) { const [x, z] = Q.pos; return [x, w.groundAt(x, z, w.heightAt(x, z) + 2, 2.5), z]; }
    const L = q && q.lieu && this.lieu(q.lieu);
    return L ? L.P : null;
  }
  // le bâtiment où se trouve un point (son emprise, au bon étage), ou null
  batiment(P) {
    const w = this.w;
    for (const k in w.bld || {}) {
      const B = w.bld[k];
      if (!B || !B.f || !(B.W > 0) || Math.abs(B.x - P[0]) > 30 || Math.abs(B.z - P[2]) > 30) continue;
      const [lx, lz] = qtL(B.f, P[0], P[2]);
      if (Math.abs(lx) < B.W / 2 - 0.1 && Math.abs(lz) < B.D / 2 - 0.1 && P[1] > B.y - 0.6 && P[1] < B.y + (B.H || 3) + 0.5) return B;
    }
    return null;
  }
  // ---------------------------------------------------------------- de la géométrie
  vers(A, B, k) { return [lerp(A[0], B[0], k), lerp(A[1], B[1], k), lerp(A[2], B[2], k)]; }
  haut(P, dy) { return [P[0], P[1] + dy, P[2]]; }
  cap(A, B) { return Math.atan2(B[0] - A[0], B[2] - A[2]); }
  // à d mètres de P dans la direction cap (et lat mètres sur sa droite), posé au sol (ou au plancher de P)
  devant(P, cap, d, lat, garderY) {
    const x = P[0] + Math.sin(cap) * (d || 0) + Math.cos(cap) * (lat || 0), z = P[2] + Math.cos(cap) * (d || 0) - Math.sin(cap) * (lat || 0);
    return garderY ? [x, P[1], z] : [x, this.sol(x, z, P[1]), z];
  }
  // les blocs autour d'un point (lus une fois par scène et par endroit)
  blocs(P, r) {
    for (const c of this._L) if (Math.hypot(c.x - P[0], c.z - P[2]) + r <= c.r) return c.L;
    const R = Math.max(r, 24), L = qtBlocs(this.w, P[0], P[2], R);
    this._L.push({ x: P[0], z: P[2], r: R, L });
    return L;
  }

  // ---------------------------------------------------------------- les acteurs
  // o : { cap (vers où il regarde) | face (un point, un acteur, 'camera'), vers (un point où il va), t0, t1 (quand,
  //       en secondes du plan), geste, regard ('camera' : la tête tournée vers l'objectif), s (échelle), tient
  //       (l'outil en main), main (un autre objet en main : 'panier', 'livre', 'lanterne', 'canne', 'baton', 'balai',
  //       'marteau'…), lanterne (une lueur chaude, la nuit), vu (false : pas besoin qu'on le voie) }
  acteur(o) {
    const A = Object.assign({ s: 1, cap: 0 }, o);
    if (A.face && !A.vers && A.face !== 'camera') { const F = A.face.P || A.face; A.cap = Math.atan2(F[0] - A.P[0], F[2] - A.P[2]); }
    if (A.vers && A.capFin === undefined && A.face && A.face !== 'camera') { const F = A.face.P || A.face; A.capFin = Math.atan2(F[0] - A.vers[0], F[2] - A.vers[2]); }
    return A;
  }
  // un habitant (sa silhouette, son outil) : le vrai est caché de la vallée le temps de la scène
  habitant(id, P, o) {
    const n = npcs.byId[id];
    if (!n || !P) return null;
    this.ids.add(id);
    return this.acteur(Object.assign({ k: 'h', id, look: n.look, s: (n.look && n.look.height) || 1, P }, o));
  }
  // le personnage du joueur
  joueur(P, o) {
    const fem = !!(farm.s && farm.s.fem);
    const look = fem ? { skin: '#e2b894', hair: '#5a3a22', hairStyle: 'long', top: '#7a6a58', bottom: '#4a3c30', dress: true, bust: 0.5, hips: 0.5 }
      : { skin: '#dcb08a', hair: '#4a3020', top: '#6a5a48', bottom: '#3a3830', hat: 'paille', beard: 'courte' };
    if (o && o.tient) look.held = o.tient;
    return P ? this.acteur(Object.assign({ k: 'h', joueur: true, look, P }, o, { tient: !!(o && o.tient) })) : null;
  }
  // une silhouette (une allure humanRig, ou le nom d'une allure de K18_LOOKS / Q20_LOOKS)
  gens(look, P, o) {
    let L = typeof look === 'string' ? (Q20_LOOKS[look] || (typeof K18_LOOKS !== 'undefined' && K18_LOOKS[look])) : look;
    if (!L || !P) return null;
    if (typeof L.face === 'string') L = Object.assign({}, L, { face: TL[L.face] });
    return this.acteur(Object.assign({ k: 'h', look: L, s: L.height || 1, P }, o, { tient: !!L.held }));
  }
  // une bête (une clé de ANIMAL_RIGS : 'horse', 'cow', 'hen', 'dog', 'crow'…) ; o.v : sa robe ; o.geste : { graze, lie, wag }
  bete(rig, P, o) {
    if (!ANIMAL_RIGS[rig] || !P) return null;
    return this.acteur(Object.assign({ k: 'b', rig, v: 0, P }, o));
  }
  // une chose : un modèle d'objet posé (PROP_MODELS) ou un dessin (o.dessin(PE, t), dans le repère de la chose) ;
  // o.r : sa rotation, o.s : son échelle, o.lueur : elle luit à peine
  chose(model, P, o) {
    if (!P || (typeof model === 'string' && !PROP_MODELS[model] && !(o && o.dessin))) return null;
    return this.acteur(Object.assign({ k: 'c', model: typeof model === 'string' ? model : null, dessin: typeof model === 'function' ? model : null, P, r: 0, vu: false }, o));
  }
  // la tête (ou le buste, ou le milieu) d'un acteur
  tete(A, dy) {
    const P = A.vers || A.P, s = A.s || 1;
    if (A.k === 'h') return [P[0], P[1] + (A.look && A.look.height ? 1.48 : 1.5) * s * (A.geste === 'assis' ? 0.72 : 1) + (dy || 0), P[2]];
    if (A.k === 'b') { const R = { horse: 1.9, cow: 1.35, sheep: 0.9, pig: 0.6, dog: 0.6, hen: 0.35, duck: 0.3, crow: 0.3, cat: 0.35, deer: 1.5 }; return [P[0], P[1] + (R[A.rig] || 0.8) + (dy || 0), P[2]]; }
    return [P[0], P[1] + 0.12 + (dy || 0), P[2]];
  }

  // ---------------------------------------------------------------- les caméras
  // Une caméra : { de: { pos, look }, a: { pos, look }, dedans: clé du bâtiment | null, vise: [points à voir] }.
  // Dehors : jamais dans un mur, sous un toit ni dans l'herbe, et rien entre elle et ce qu'elle vise (relief, murs,
  // troncs) ; on tourne autour de la cible jusqu'à trouver ; dedans : dans la pièce, sous le plafond, hors des meubles.
  //
  // un point libre d'où l'on voit T : à d mètres (puis un peu plus près, un peu plus loin), haut mètres au-dessus du
  // sol, en partant de l'angle a0 (la direction de T vers la caméra) ; o.aussi : d'autres points à voir aussi
  cherche(T, d, haut, a0, o) {
    o = o || {};
    // (o.ign : [x, z] d'un arbre qu'on montre — le grand chêne : son tronc ne cache pas ce qu'on vise)
    const ign0 = qtScenes.ign;
    if (o.ign) qtScenes.ign = o.ign;
    try { return this.cherche0(T, d, haut, a0, o); } finally { qtScenes.ign = ign0; }
  }
  cherche0(T, d, haut, a0, o) {
    const w = this.w, L = this.blocs(T, d * 1.6 + 12), n = o.n || 32, pas = o.pas || TAU / 32;
    const Ds = o.ds || [d, d * 0.82, d * 1.22, d * 1.5, d * 0.66];
    // (deux passes : dehors, à l'air libre ; puis, pour un lieu couvert sans bâtiment — une chapelle, un moulin, le
    // phare —, sous un toit, pourvu qu'on ne soit pas dans un mur)
    for (const toit of o.toit === false ? [false] : [false, true]) {
      for (let k = 0; k < n; k++) {
        const a = a0 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * pas;
        for (const dd of Ds) {
          const x = T[0] + Math.sin(a) * dd, z = T[2] + Math.cos(a) * dd;
          if (!w.inside(x, z, 6)) continue;
          const P = [x, Math.max(this.sol(x, z, toit ? T[1] - 0.2 : undefined) + haut, o.min !== undefined ? o.min : -1e9), z];
          try {
            if (toit ? (P[1] < this.sol(x, z) + 0.9 || qtDansBloc(L, P, 0.3) || this.batiment(P)) : !qtScenes.libreDehors(w, L, P)) continue;
            if (!qtScenes.voit(w, L, P, T, o.stop ?? 0.35)) continue;
            if (o.aussi && !o.aussi.every((Q) => qtScenes.voit(w, L, P, Q, 0.35))) continue;
          } catch (e) { continue; }
          return { P, a, d: dd, toit };
        }
      }
    }
    this.repli++;
    return { P: [T[0] + Math.sin(a0) * d, Math.max(T[1], this.sol(T[0], T[2])) + haut + 8, T[2] + Math.cos(a0) * d], a: a0, d, repli: true };
  }
  // un second point de caméra (le travelling) : k vers la cible, glisse mètres de côté, monte mètres plus haut ;
  // il doit être libre lui aussi (sinon la caméra reste fixe)
  glisse(P, T, o) {
    o = o || {};
    const k = o.recul !== undefined ? o.recul : 0.12, g = o.glisse || 0, m = o.monte || 0;
    if (!k && !g && !m) return P;
    const dx = T[0] - P[0], dz = T[2] - P[2], D = Math.hypot(dx, dz) || 1, rx = dz / D, rz = -dx / D;
    const Q = [P[0] + dx * k + rx * g, P[1] + (T[1] - P[1]) * k * 0.3 + m, P[2] + dz * k + rz * g];
    const w = this.w, L = this.blocs(T, D + 12);
    try {
      if (o.dedans) { const B = o.dedans; if (!qtScenes.dansPiece(w, { bld: B.key }, Q) || qtDansBloc(L, Q, 0.22)) return P; }
      else if (o.toit) { if (qtDansBloc(L, Q, 0.3) || Q[1] < this.sol(Q[0], Q[2]) + 0.9 || !qtScenes.voit(w, L, Q, T, o.stop ?? 0.35)) return P; }
      else { if (!qtScenes.libreDehors(w, L, Q) || !qtScenes.voit(w, L, Q, T, o.stop ?? 0.35)) return P; }
    } catch (e) { return P; }
    return Q;
  }
  // sur un acteur, à hauteur d'homme : o.d (3,2 m), o.cote (l'angle depuis son regard : 0 = de face), o.haut,
  // o.buste (viser plus bas), o.avec (un autre acteur ou un point à garder dans le champ : plan à deux), o.recul…
  camActeur(A, o) {
    o = o || {};
    if (!A) return null;
    let T = o.vise || this.tete(A, o.buste ? -0.42 : 0);
    if (o.avec) { const B = o.avec.k ? this.tete(o.avec, -0.2) : o.avec; T = this.vers(T, B, o.k ?? 0.5); }
    const cap = A.vers ? (A.capFin ?? A.cap) : A.cap, a0 = (cap || 0) + (o.cote ?? 0.45);
    const Bt = this.batiment(A.vers || A.P);
    if (Bt) return this.camDedans(Bt, T, Object.assign({ pref: a0, d: o.d || 2.5 }, o));
    const R = this.cherche(T, o.d || 3.2, o.haut ?? 1.6, a0, { aussi: o.aussi, stop: 0.3, ign: o.ign });
    const P2 = this.glisse(R.P, T, Object.assign({}, o, { toit: R.toit }));
    return { de: { pos: R.P, look: T }, a: { pos: P2, look: o.vise2 || T }, dedans: null, vise: [T], repli: !!R.repli, toit: !!R.toit };
  }
  // un lieu, de loin : L (un lieu de c.lieu, une clé, ou un point) ; o.d (sinon : selon sa taille), o.haut, o.a
  // (l'angle d'où l'on regarde ; sinon : la lumière de côté), o.dy (hauteur visée), o.recul, o.monte, o.glisse,
  // o.stop (le regard s'arrête à tant de mètres de la cible : ses abords ; sinon, selon sa taille)
  camLieu(Lx, o) {
    o = o || {};
    const L = typeof Lx === 'string' ? this.lieu(Lx) : Lx;
    if (!L) return null;
    const C = Array.isArray(L) ? this.haut(L, o.dy ?? 1.2) : [L.x, L.y + (o.dy ?? 1.2), L.z];
    const r = Array.isArray(L) ? 8 : L.r || 10;
    const d = o.d || clamp(r * 1.7 + 8, 14, 46), haut = o.haut ?? clamp(d * 0.2, 2.2, 9);
    let a0 = o.a;
    if (a0 === undefined) {
      // (le soleil de côté, un peu de face : la lumière modèle le lieu)
      try { const sky = computeSky((o.heure ?? this.h) / 24, 300, {}); a0 = Math.atan2(-sky.sunDir[0], -sky.sunDir[2]) + 1.25; } catch (e) { a0 = 0.6; }
    }
    // (on vise le cœur du lieu : un moulin, une tour, le milieu d'une place ; le regard s'arrête à ses abords)
    const stop = o.stop ?? (Array.isArray(L) ? 1.0 : clamp(r * 0.45, 1.2, 8));
    const R = this.cherche(C, d, haut, a0, { aussi: o.aussi, ign: o.ign, stop, ds: [d, d * 0.85, d * 1.2, d * 0.7, d * 1.45] });
    const T2 = o.vise2 || C;
    const P2 = this.glisse(R.P, T2, { recul: o.recul ?? 0.14, glisse: o.glisse, monte: o.monte, toit: R.toit, stop });
    return { de: { pos: R.P, look: C }, a: { pos: P2, look: T2 }, dedans: null, vise: [C], repli: !!R.repli, toit: !!R.toit };
  }
  // une chose, de près (un objet posé, l'endroit d'une trouvaille) : o.d (1,8 m), o.haut (au-dessus du sol), o.a
  camChose(P, o) {
    o = o || {};
    if (!P) return null;
    const T = this.haut(P, o.dy ?? 0.1), Bt = this.batiment(P);
    if (Bt) return this.camDedans(Bt, T, Object.assign({ pref: o.a ?? 0, d: o.d || 1.6, he: o.he ?? 1.35 }, o));
    // (au-dessus de l'herbe : 0,95 m au moins)
    const d = o.d || 1.9, R = this.cherche(T, d, Math.max(0.95, o.haut ?? 1.15), o.a ?? 0.8, { stop: 0.15, ign: o.ign, ds: [d, d * 1.3, d * 0.7, d * 1.7, d * 0.5, d * 2.2] });
    const P2 = this.glisse(R.P, T, { recul: o.recul ?? 0.18, glisse: o.glisse, monte: o.monte, toit: R.toit });
    return { de: { pos: R.P, look: T }, a: { pos: P2, look: T }, dedans: null, vise: [T], repli: !!R.repli, toit: !!R.toit };
  }
  // dedans : une caméra dans la pièce du bâtiment B (ou sa clé), qui voit T ; o.pref (l'angle voulu), o.d, o.he
  camDedans(Bk, T, o) {
    o = o || {};
    const w = this.w, B = typeof Bk === 'string' ? w.bld[Bk] : Bk;
    if (!B || !T) return null;
    const lieu = { bld: B.key }, y0 = B.y, he = o.he ?? 1.6;
    const L = this.blocs(T, 16), props = qtProps(w, T[0], T[2], 12);
    const d0 = o.d || 2.5, dmin = o.dmin || 0.9, dmax = o.dmax || Math.max(d0 + 1.6, 4.4), a0 = o.pref ?? 0;
    let best = null;
    for (let k = 0; k < 36; k++) {
      const a = a0 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * TAU / 36, dir = [Math.sin(a), 0, Math.cos(a)];
      const O = [T[0], y0 + he, T[2]];
      let hit = null;
      try { hit = qtRayon(w, L, O, dir, dmax + 0.6); } catch (e) { hit = null; }
      const dm = Math.min((hit ? hit.t : dmax + 0.6) - 0.45, dmax);
      if (dm < dmin) continue;
      for (const dd of [Math.min(d0, dm), (Math.min(d0, dm) + dmin) / 2, dm]) {
        const P = [O[0] + dir[0] * dd, O[1], O[2] + dir[2] * dd];
        try {
          if (!qtScenes.dansPiece(w, lieu, P) || qtDansBloc(L, P, 0.25) || !qtSousToit(w, L, P) || !qtScenes.horsMeubles(w, P, y0, props)) continue;
          const v = [T[0] - P[0], T[1] - P[1], T[2] - P[2]], dv = Math.hypot(v[0], v[1], v[2]) || 1;
          if (qtRayon(w, L, P, [v[0] / dv, v[1] / dv, v[2] / dv], dv - 0.25)) continue;
        } catch (e) { continue; }
        const sc = -Math.abs(dd - d0) - Math.abs(angDiff(a, a0)) * (o.kp ?? 0.7);
        if (!best || sc > best.sc) best = { sc, P, a };
        break;
      }
    }
    if (!best) { this.repli++; const P = [T[0] + Math.sin(a0) * 1.2, y0 + he, T[2] + Math.cos(a0) * 1.2]; return { de: { pos: P, look: T }, a: { pos: P, look: T }, dedans: B.key, vise: [T], repli: true }; }
    const P2 = this.glisse(best.P, T, { recul: o.recul ?? 0.1, glisse: o.glisse, dedans: B });
    return { de: { pos: best.P, look: T }, a: { pos: P2, look: o.vise2 || T }, dedans: B.key, vise: [T] };
  }
  // un chemin de caméra donné (des clés { pos, look }) : chaque clé est contrôlée (repli : la première, fixe)
  camChemin(cles, o) {
    o = o || {};
    const w = this.w, ok = cles.filter((c) => {
      try { const L = this.blocs(c.look, Math.hypot(c.look[0] - c.pos[0], c.look[2] - c.pos[2]) + 10); return qtScenes.libreDehors(w, L, c.pos); } catch (e) { return false; }
    });
    if (ok.length >= 2) return { chemin: ok, dedans: null, vise: [ok[ok.length - 1].look] };
    this.repli++;
    const c = ok[0] || cles[0];
    return { de: c, a: c, dedans: null, vise: [c.look], repli: true };
  }
  // une vue vers le ciel ou au loin depuis un point (la lune, une lumière) : P (où l'on se tient), T (ce qu'on regarde)
  camRegard(P, T, o) {
    o = o || {};
    const Q = [P[0], Math.max(P[1], this.sol(P[0], P[2])) + (o.haut ?? 1.6), P[2]];
    const L = this.blocs(Q, 14);
    let ok = true;
    try { ok = qtScenes.libreDehors(this.w, L, Q); } catch (e) { ok = false; }
    if (!ok) return this.camLieu(T, { d: o.d || 12 });
    const Q2 = this.glisse(Q, T, { recul: o.recul ?? 0.06, monte: o.monte });
    return { de: { pos: Q, look: T }, a: { pos: Q2, look: o.vise2 || T }, dedans: null, vise: [] };
  }

  // ---------------------------------------------------------------- les plans
  // o : { dur, cam, acteurs, dit: [texte, qui] | c.dit(…), heure, lum (lumières en plus), son, court (gardé dans la
  //       version courte), carte, chaque(t, dt), debut(), fin() }
  plan(o) {
    o = o || {};
    const cam = o.cam || {}, P = { dur: o.dur || 5, texte: '', qui: '' };
    if (cam.chemin) P.chemin = cam.chemin; else if (cam.de) { P.de = cam.de; P.a = cam.a || cam.de; }
    let voix = null;
    if (o.dit) { const D = Array.isArray(o.dit) ? this.dit(o.dit[0], o.dit[1]) : o.dit; P.texte = D.texte; P.qui = D.qui; voix = D.voix; }
    if (o.carte) P.carte = o.carte;
    const heure = o.heure ?? this.h, dedans = cam.dedans || null, acteurs = (o.acteurs || []).filter(Boolean);
    const lum = this.lumieres(heure, cam, acteurs, o.lum);
    const son = typeof o.son === 'function' ? o.son : o.son && Q20_SONS[o.son];
    P._q20 = { acteurs, heure, dedans, lum, vise: cam.vise || [], court: !!o.court, repli: !!cam.repli, toit: !!cam.toit, son: !!son };
    P.debut = () => {
      if (typeof qtScenes !== 'undefined') qtScenes.lumiere({ h: heure, dedans: !!dedans, lum });
      if (q20._passe) return;
      if (son) try { son(); } catch (e) { /* rien */ }
      if (voix && P.texte && sound.mumble) try { sound.mumble(voix, Math.min(60, P.texte.length), 0, 0.75); } catch (e) { /* rien */ }
      if (o.debut) try { o.debut(); } catch (e) { console.error(e); }
    };
    if (o.chaque) P.chaque = (t, dt) => { if (!q20._passe) o.chaque(t, dt); };
    if (o.fin) P.fin = o.fin;
    return P;
  }
  // un plan noir (un temps, un passage)
  noir(dur, de) { const P = { dur: dur || 0.8, fondu: 'noir', texte: '', qui: '' }; if (de) P.de = de; return P; }
  // les lumières d'un plan : dedans, une lueur sur ce qu'on montre et une douce derrière la caméra ; dehors la nuit, la
  // lune sur ce qu'on montre ; au soir, un reste de jour ; une lanterne tenue (ou o.lanterne) éclaire autour d'elle
  lumieres(h, cam, acteurs, extra) {
    const nuit = this.nuit(h), out = [];
    const T = (cam.vise && cam.vise[0]) || (cam.de && cam.de.look) || (cam.chemin && cam.chemin[0].look);
    const Pc = (cam.de && cam.de.pos) || (cam.chemin && cam.chemin[0].pos);
    if (cam.dedans) {
      if (T) out.push(nuit ? { x: T[0], y: T[1] + 0.5, z: T[2], r: 4.8, c: [0.85, 0.54, 0.27], d: 0 } : { x: T[0], y: T[1] + 0.6, z: T[2], r: 5.5, c: [0.95, 0.77, 0.52], d: 0 });
      if (Pc) out.push({ x: Pc[0], y: Pc[1] + 0.3, z: Pc[2], r: nuit ? 4.5 : 6.5, c: nuit ? [0.28, 0.21, 0.15] : [0.46, 0.45, 0.43], d: 0 });
    } else if (nuit) {
      if (T) out.push({ x: T[0], y: T[1] + 2.2, z: T[2], r: 11, c: [0.22, 0.25, 0.34], d: 0 });
    } else if (h >= 17.6 || h < 6.6) {
      if (T) out.push({ x: T[0], y: T[1] + 2.4, z: T[2], r: 9, c: [0.3, 0.27, 0.25], d: 0 });
    }
    for (const A of acteurs || []) if (A.lanterne || A.main === 'lanterne' || (A.look && A.look.held === 'lanterne' && A.tient !== false)) {
      const P = A.vers || A.P;
      out.push({ x: P[0], y: P[1] + 1.25, z: P[2], r: nuit ? 7.5 : 4.5, c: [1.0, 0.72, 0.38], d: 0 });
    }
    return out.concat((extra || []).filter(Boolean));
  }
  // une lumière en plus : P, r (rayon), c (couleur ; une flamme par défaut)
  lueur(P, r, c, dy) { return P ? { x: P[0], y: P[1] + (dy ?? 1), z: P[2], r: r || 6, c: c || [1.0, 0.68, 0.34], d: 0 } : null; }
}

// ============================================================================
//  LE CADRE : inscription, déclencheurs, file, option, souvenirs, événement
// ============================================================================
const q20 = {
  defs: {}, ordre: [], auditeurs: [], t: 0.5, calmeT: 0, dangerT: 0, joue: null, caches: [], auto: false, _passe: false, _err: {},

  // ------------------------------------------------------------- inscrire les scènes d'une quête
  // def : { qui (l'habitant : clé de NPC_DATA ou de Q16_PNJ ; le classement des Souvenirs), titre (sinon : celui de la
  //   quête), demande(c), tournant(c), fin(c), fins: { 0: fn, 1: fn… } (les fins à choix), delais: { moment: s },
  //   etat() (pour une quête qui ne passe ni par quests ni par q16 : { q, Q, qui, actif, fini, pret, choix }),
  //   tournantSi(E) (quand le tournant se joue, à la place de « la quête devient rendable ») }
  // Chaque constructeur reçoit le contexte c (Q20Scene) et rend une liste de plans (c.plan…), ou null.
  scenes(id, def) {
    if (!id || !def) return;
    if (!this.defs[id]) this.ordre.push(id);
    this.defs[id] = Object.assign(this.defs[id] || {}, def);
  },
  def(id) { return this.defs[id] || null; },
  cle(id, m) { return id + '|' + m; },
  // le constructeur d'un moment ('fin:k' : celui de la fin à choix, ou la fin commune)
  constructeur(id, m) {
    const D = this.defs[id];
    if (!D) return null;
    if (m.startsWith('fin:')) { const k = m.slice(4); return (D.fins && D.fins[k]) || D.fin || null; }
    return typeof D[m] === 'function' ? D[m] : null;
  },
  moments(id) {
    const D = this.defs[id], out = [];
    if (!D) return out;
    for (const m of Q20_MOMENTS) if (typeof D[m] === 'function') out.push(m);
    for (const k in D.fins || {}) out.push('fin:' + k);
    return out;
  },

  // ------------------------------------------------------------- l'état sauvegardé
  S() {
    const s = farm.s;
    if (!s) return null;
    const S = s.q20 && typeof s.q20 === 'object' ? s.q20 : (s.q20 = { v: 1 });
    for (const k of ['fait', 'vus', 'heures', 'connus']) if (!S[k] || typeof S[k] !== 'object') S[k] = {};
    if (!Array.isArray(S.file)) S.file = [];
    return S;
  },
  // l'état d'une quête, d'où qu'elle vienne : { q, Q, qui, actif, fini, pret (rendable), choix }
  etat(id) {
    const D = this.defs[id];
    if (D && typeof D.etat === 'function') { try { return D.etat() || null; } catch (e) { return null; } }
    if (!farm.s) return null;
    try {
      const q = quests.byId(id);
      if (q) {
        const Q = (farm.s.quests && farm.s.quests[id]) || null;
        const actif = !!(Q && Q.st === 'actif');
        return { q, Q, qui: quests.giver(id), actif, fini: !!(Q && Q.st === 'fait'), pret: actif && quests.canComplete(q), choix: Q && Q.choix !== undefined ? Q.choix : null };
      }
      if (typeof q16 !== 'undefined' && q16.def) {
        const q2 = q16.def(id);
        if (q2) {
          const Q = q16.Q(id), actif = !!(Q && Q.st === 'actif');
          return { q: q2, Q, qui: q16.qui(id), actif, fini: !!(Q && Q.st === 'fait'), pret: actif && q16.peutFinir(q2, Q), choix: Q && Q.choix !== undefined ? Q.choix : null };
        }
      }
    } catch (e) { return null; }
    return null;
  },
  // la fin d'une quête : celle du choix retenu, si elle a la sienne
  resoudre(id, m) {
    if (m !== 'fin') return m;
    const D = this.defs[id], E = this.etat(id);
    if (D && D.fins && E && E.choix !== null && E.choix !== undefined && D.fins[E.choix]) return 'fin:' + E.choix;
    return 'fin';
  },

  // ------------------------------------------------------------- l'option (Jeu › « Scènes des quêtes »)
  mode() {
    const v = typeof settings !== 'undefined' && settings.quetesCine;
    return v === 'courtes' || v === 'aucune' ? v : 'toutes';
  },
  reglerMode(v) {
    if (typeof settings === 'undefined') return;
    settings.quetesCine = v === 'courtes' || v === 'aucune' ? v : 'toutes';
    try { store.set('prairie.settings', settings); } catch (e) { /* rien */ }
  },

  // ------------------------------------------------------------- déclencher un moment (il attend son tour dans la file)
  // o.delai : secondes à attendre d'abord (sinon : celui de la quête, ou celui du moment)
  declencher(id, m, o) {
    o = o || {};
    if (!farm.s || !this.defs[id]) return false;
    const base = m.split(':')[0];
    const D = this.defs[id];
    if (!Q20_MOMENTS.includes(base)) return false;
    if (m === 'fin' ? !(D.fin || (D.fins && Object.keys(D.fins).length)) : !this.constructeur(id, m)) return false;
    const S = this.S();
    if (S.fait[this.cle(id, m)] || S.file.some((e) => e.id === id && e.m === m)) return false;
    // un moment plus avancé de la même quête : les précédents qui attendent n'ont plus de sens (ils rejoignent les souvenirs)
    const rang = Q20_MOMENTS.indexOf(base);
    for (let i = S.file.length - 1; i >= 0; i--) {
      const e = S.file[i];
      if (e.id === id && Q20_MOMENTS.indexOf(e.m.split(':')[0]) < rang) { S.file.splice(i, 1); this.souvenir(id, this.resoudre(id, e.m), e.h); }
    }
    const d = o.delai ?? (D.delais && D.delais[base]) ?? Q20_REGL.delai[base] ?? 1;
    S.file.push({ id, m, j: farm.s.day, h: Math.round(npcs.hour() * 100) / 100, d });
    return true;
  },

  // ------------------------------------------------------------- un moment calme ?
  dansVallee() {
    return !!(typeof h17 !== 'undefined' && h17.monde() && !(typeof zone !== 'undefined' && zone.dedans) && !(game.player && game.player.underground)
      && !(typeof mondes !== 'undefined' && mondes.actuel && mondes.actuel()));
  },
  // ce qui empêche une scène, maintenant (null : rien) — pour les essais, la raison
  empeche() {
    const p = game.player, w = game.world;
    if (!game.started || game.mode !== 'play' || game.dying || game.sleeping || !p || !w || (farm.s && farm.s.over)) return 'partie';
    if (cine.on || (typeof h17Cine !== 'undefined' && h17Cine.on)) return 'scène';
    if (typeof navigator !== 'undefined' && navigator.webdriver && !this.auto && !(typeof h17Cine !== 'undefined' && h17Cine.auto)) return 'essai';
    if (ui.panel || (typeof talk !== 'undefined' && talk.n)) return 'panneau';
    const f = typeof document !== 'undefined' && $('#fade');
    if (f && f.classList.contains('open')) return 'fondu';
    if (typeof corps !== 'undefined' && corps.hisse) return 'hissé';
    if (!this.dansVallee()) return 'ailleurs';
    // l'histoire et les récits passent d'abord
    try {
      const H = histoire.S();
      if (H && (H.file.length || H.aVoir || histoire.joue)) return 'histoire';
      if (typeof k18 !== 'undefined' && k18.S && (k18.S().file || []).length) return 'récits';
    } catch (e) { /* rien */ }
    // l'eau, la chute
    const eye = p.eyePos();
    if (p.swimming || (eye[1] < w.waterLevel + 0.1 && w.heightAt(eye[0], eye[2]) < w.waterLevel) || (p.breath !== undefined && p.breath < 0.98)) return 'eau';
    if (!p.onGround && !p.swimming && !p.riding && Math.abs((p.vel && p.vel[1]) || 0) > 0.8) return 'chute';
    // un danger : coup reçu, peur, bête qui charge, habitant qui attaque, chose qui traque
    if (this.dangerT > 0) return 'danger';
    if (this.menace()) { this.dangerT = Q20_REGL.danger; return 'danger'; }
    return null;
  },
  menace() {
    const p = game.player, px = p.pos[0], pz = p.pos[2];
    if (typeof play !== 'undefined' && play.hurtFlash > 0.02) return true;
    if (typeof strange !== 'undefined') { try { if (strange.fear > 0.15 || strange.inEnvers() || strange.redNight() || strange.freezeT > 0) return true; } catch (e) { /* rien */ } }
    if (typeof evenements !== 'undefined' && evenements.noirK > 0.3) return true;
    if (typeof entities !== 'undefined' && entities.list) for (const e of entities.list) {
      if (!e || e.dead || Math.abs(e.x - px) > 45 || Math.abs(e.z - pz) > 45) continue;
      if (e.state === 'charge' || e.angry > 0) return true;
      if (e.cfg && e.cfg.pack && !e.hidden && Math.hypot(e.x - px, e.z - pz) < 40) return true;
    }
    for (const n of npcs.list) if (n.attaque || (n.poursuite && n.poursuite > game.time)) return true;
    try { if (typeof creaturesV2 !== 'undefined' && (creaturesV2.vivantes || []).some((e) => !e.mort && e.mode === 'chasse' && e.dist < 90)) return true; } catch (e) { /* rien */ }
    try { if (typeof biblio !== 'undefined' && biblio.E && biblio.E.st && biblio.E.st !== 'absent') return true; } catch (e) { /* rien */ }
    try { if (typeof furtif !== 'undefined' && (furtif.max || 0) >= 1) return true; } catch (e) { /* rien */ }
    return false;
  },
  // une scène qui attend a-t-elle encore un sens ? (la quête au bon point, l'habitant vivant, pas trop vieille)
  aSens(e, m) {
    const E = this.etat(e.id), base = m.split(':')[0];
    if (!E) return false;
    if (E.qui && NPC_BY_ID[E.qui] && !npcs.alive(E.qui)) return false;
    if (typeof q16 !== 'undefined' && E.qui && !NPC_BY_ID[E.qui] && q16.vivant && !q16.vivant(E.qui)) return false;
    if (base === 'fin' ? !E.fini : !E.actif) return false;
    if (farm.s.day - (e.j || 0) > (Q20_REGL.vieux[base] ?? 1)) return false;
    return true;
  },

  // ------------------------------------------------------------- chaque image (presque rien hors scène)
  update(dt) {
    if (!farm.s || !game.started) return;
    if (this.dangerT > 0) this.dangerT -= dt;
    if (cine.on) return;
    if (this.joue) { this.montrer(); this.joue = null; }
    this.t -= dt;
    if (this.t > 0) return;
    this.t = Q20_REGL.tick;
    try { this.guetter(); this.avancer(Q20_REGL.tick); } catch (e) { if (!this._err.u) { this._err.u = true; console.error('q20', e); } }
  },
  // les tournants : une quête en cours devient rendable (une fois)
  guetter() {
    const S = this.S(), s = farm.s;
    const voir = (id) => {
      const D = this.defs[id];
      if (!D || typeof D.tournant !== 'function' || S.fait[this.cle(id, 'tournant')] || S.file.some((e) => e.id === id)) return;
      const E = this.etat(id);
      if (!E || !E.actif) return;
      const ok = typeof D.tournantSi === 'function' ? !!D.tournantSi(E) : (E.pret && !(E.q && E.q.type === 'apporter'));
      if (ok) this.declencher(id, 'tournant');
    };
    for (const id in s.quests || {}) if (s.quests[id] && s.quests[id].st === 'actif') voir(id);
    if (typeof q16 !== 'undefined' && s.q16 && s.q16.Q) for (const id in s.q16.Q) if (s.q16.Q[id] && s.q16.Q[id].st === 'actif') voir(id);
    for (const id of this.ordre) if (this.defs[id].etat) voir(id);
  },
  // la file : les délais, ce qui n'a plus de sens, ce que l'option écarte ; la première scène au premier moment calme
  avancer(dt) {
    const S = this.S();
    if (!S.file.length) { this.calmeT = 0; return; }
    for (const e of S.file) if (e.d > 0) e.d -= dt;
    const mode = this.mode();
    for (let i = 0; i < S.file.length; i++) {
      const e = S.file[i];
      if (e.d > 0) continue;
      const m = this.resoudre(e.id, e.m), base = m.split(':')[0];
      if (mode === 'aucune' || (mode === 'courtes' && base === 'tournant') || !this.aSens(e, m) || !this.constructeur(e.id, m)) {
        S.file.splice(i, 1); i--;
        if (this.constructeur(e.id, m)) this.souvenir(e.id, m, e.h);
        continue;
      }
      if (this.empeche()) { this.calmeT = 0; return; }
      this.calmeT += dt;
      if (this.calmeT < Q20_REGL.calme) return;
      S.file.splice(i, 1);
      this.calmeT = 0;
      this.jouer(e.id, m, { h: e.h, court: mode === 'courtes' });
      return;
    }
  },

  // ------------------------------------------------------------- construire une scène (au moment de la jouer)
  // o : { court, rejeu, h (l'heure du moment), choix } → { plans, ids, duree, moment, court } ou null
  construire(id, m, o) {
    o = o || {};
    const f = this.constructeur(id, m);
    if (!f || !game.world || !game.player) return null;
    const kc = m.startsWith('fin:') ? m.slice(4) : null;
    const c = new Q20Scene(id, m, { court: o.court, rejeu: o.rejeu, h: o.h, choix: kc !== null ? (isNaN(+kc) ? kc : +kc) : o.choix });
    let L = null;
    try { L = f(c); } catch (e) { console.error('q20 : scène ' + id + ' ' + m, e); L = null; }
    if (L && !Array.isArray(L) && Array.isArray(L.plans)) L = L.plans;
    if (!Array.isArray(L)) return null;
    let plans = L.filter((P) => P && (P.de || P.chemin || P.fondu));
    if (!plans.some((P) => P._q20)) return null;
    if (c.court) plans = this.raccourcir(plans);
    const der = plans[plans.length - 1], fin = der.chemin ? der.chemin[der.chemin.length - 1] : der.a || der.de;
    const vue = h17.joueur(), P0 = plans.find((P) => P._q20);
    const ouv = { dur: c.court ? 0.4 : 0.6, de: vue, fondu: 'noir', texte: '', qui: '', debut: () => { if (P0) qtScenes.lumiere({ h: P0._q20.heure, dedans: !!P0._q20.dedans, lum: P0._q20.lum }); } };
    const ferm = { dur: c.court ? 0.5 : 0.8, de: fin || vue, fondu: 'noir', texte: '', qui: '' };
    plans = [ouv, ...plans, ferm];
    const duree = plans.reduce((a, P) => a + (P.dur || 0), 0);
    return { plans, ids: [...c.ids], duree, moment: m, court: c.court, repli: c.repli, ctx: c };
  },
  // la version courte : la demande et le dénouement en cinq à huit secondes (un ou deux plans, ceux qui parlent)
  raccourcir(L) {
    const vrais = L.filter((P) => P._q20 && !P.fondu);
    let K = vrais.filter((P) => P._q20.court);
    if (!K.length) { const T = vrais.filter((P) => P.texte); K = T.length ? [T[0], T[T.length - 1]] : vrais.slice(0, 1); }
    K = [...new Set(K)];
    if (K.length > 2) K = [K[0], K[K.length - 1]];
    if (!K.length) return L.slice(0, 1);
    // (le corps : de 4,1 à 7,1 secondes, avec l'ouverture et la fermeture, de 5 à 8)
    const total = K.length === 1 ? 5.4 : 6.4, s0 = K.reduce((a, P) => a + P.dur, 0) || 1;
    return K.map((P) => Object.assign({}, P, { dur: clamp(P.dur * total / s0, 2.8, 5.4), chaque: undefined }));
  },

  // ------------------------------------------------------------- jouer
  jouer(id, m, o) {
    o = o || {};
    const S = this.S();
    let sc = null;
    try { sc = this.construire(id, m, o); } catch (e) { console.error('q20 : scène ' + id + ' ' + m, e); sc = null; }
    const k = this.cle(id, m);
    if (!o.rejeu) {
      this.souvenir(id, m, o.h);
      if (sc) { const prem = !S.vus[k]; S.vus[k] = farm.s.day; if (prem) this.dire({ quete: id, moment: m, qui: (sc.ctx && sc.ctx.qui) || null, court: !!sc.court }); }
    }
    if (!sc) return Promise.resolve(false);
    this.joue = { id, m, rejeu: !!o.rejeu };
    this.cacher(sc.ids);
    const apres = () => { this.montrer(); this.joue = null; };
    return h17Cine.jouer(sc.plans, { cle: 'q20:' + id + ':' + m, apres });
  },
  // revoir depuis les Souvenirs : rien ne change dans la partie
  rejouer(id, m) {
    if (cine.on || !this.constructeur(id, m)) return Promise.resolve(false);
    if (!this.dansVallee()) { ui.subtitle('', Q20_TEXTES.pasIci, 3); return Promise.resolve(false); }
    ui.close(true);
    const S = this.S(), h = S && S.heures[this.cle(id, m)];
    return this.jouer(id, m, { rejeu: true, h: typeof h === 'number' ? h : undefined });
  },
  // les habitants qui jouent : les vrais sont cachés le temps de la scène
  cacher(ids) {
    this.caches = [];
    for (const id of ids || []) { const n = npcs.byId[id]; if (n && !n.vanished) { n.vanished = true; this.caches.push(id); } }
  },
  montrer() {
    for (const id of this.caches) { const n = npcs.byId[id]; if (n) n.vanished = false; }
    this.caches = [];
  },

  // ------------------------------------------------------------- les souvenirs
  souvenir(id, m, h) {
    const S = this.S();
    if (!S) return;
    const k = this.cle(id, m);
    if (!S.fait[k]) S.fait[k] = farm.s.day || 1;
    if (typeof h === 'number' && isFinite(h) && S.heures[k] === undefined) S.heures[k] = Math.round(h * 100) / 100;
    try { const G = store.get(Q20_SOUV_KEY, {}) || {}; if (!G[k]) { G[k] = 1; store.set(Q20_SOUV_KEY, G); } } catch (e) { /* rien */ }
  },
  // les scènes à revoir : [{ id, m, qui, k }] (de cette partie et des autres), dans l'ordre des quêtes
  souvenirs() {
    const S = this.S(), G = (() => { try { return store.get(Q20_SOUV_KEY, {}) || {}; } catch (e) { return {}; } })();
    const out = [];
    for (const id of this.ordre) for (const m of this.moments(id)) {
      const k = this.cle(id, m);
      if ((S && S.fait[k]) || G[k]) out.push({ id, m, k, qui: this.quiDe(id) });
    }
    return out;
  },
  quiDe(id) { const D = this.defs[id]; if (D && D.qui) return D.qui; const E = this.etat(id); return (E && E.qui) || null; },
  titreDe(id) { const D = this.defs[id]; if (D && D.titre) return D.titre; const E = this.etat(id); return (E && E.q && E.q.title) || id; },
  // le nom de qui a donné la quête (pour les Souvenirs)
  nomDe(qui) {
    if (!qui) return '';
    const n = npcs.byId[qui];
    if (n) return n.name + (n.d && n.d.surname ? ' ' + n.d.surname : '') + (n.d && n.d.role ? ' — ' + n.d.role.toLowerCase() : '');
    try { if (typeof q16 !== 'undefined' && q16.titre) return q16.titre(qui) || qui; } catch (e) { /* rien */ }
    return qui;
  },
  libelle(m) {
    if (Q20_TEXTES.moments[m]) return Q20_TEXTES.moments[m];
    if (m.startsWith('fin:')) return Q20_TEXTES.moments.fin;
    return m;
  },

  // ------------------------------------------------------------- une partie d'avant (ou des scènes inscrites depuis) : rien ne se rejoue
  reprendre(id) {
    const E = this.etat(id);
    if (!E || !E.Q) return;
    if (E.fini) {
      for (const m of ['demande', 'tournant']) if (this.constructeur(id, m)) this.souvenir(id, m);
      const f = this.resoudre(id, 'fin');
      if (this.constructeur(id, f)) this.souvenir(id, f);
    } else if (E.actif) {
      if (this.constructeur(id, 'demande')) this.souvenir(id, 'demande');
      if (E.pret && this.constructeur(id, 'tournant')) this.souvenir(id, 'tournant');
    }
  },

  // ------------------------------------------------------------- pour les succès
  ecouter(fn) { if (typeof fn === 'function') this.auditeurs.push(fn); },
  dire(d) {
    for (const fn of this.auditeurs) try { fn(d); } catch (e) { console.error(e); }
    try { if (typeof window !== 'undefined' && window.dispatchEvent && typeof CustomEvent === 'function') window.dispatchEvent(new CustomEvent('prairie:quetescine', { detail: d })); } catch (e) { /* rien */ }
  },

  // ------------------------------------------------------------- les acteurs, dessinés pendant leur plan
  rig(A) {
    if (A.id && !A.joueur && !A.main) { const n = npcs.byId[A.id]; if (n && n.rig) return n.rig; }
    const look = A.main ? Object.assign({}, A.look || {}, { held: A.main }) : A.look || {};
    const k = (A.k === 'b' ? 'b:' + A.rig + ':' + (A.v || 0) : 'h:') + JSON.stringify(look);
    const R = this._rigs || (this._rigs = {});
    if (!R[k]) R[k] = A.k === 'b' ? ANIMAL_RIGS[A.rig](A.v || 0, A.white) : humanRig(look);
    return R[k];
  },
  geste(A, tp) {
    let g = A.geste;
    if (typeof g === 'function') { try { g = g(tp); } catch (e) { g = null; } }
    if (!g) return {};
    if (typeof g === 'string') return Q20_GESTES[g] || {};
    if (Array.isArray(g)) return Object.assign({}, ...g.map((x) => (typeof x === 'string' ? Q20_GESTES[x] || {} : x || {})));
    return g;
  },
  dessiner(buf, sbuf, cam, t) {
    const P = cine.plans && cine.plans[cine.i], D = P && P._q20;
    if (!D || !D.acteurs.length) return;
    const tp = cine.t, dur = P.dur || 3, w = game.world;
    for (const A of D.acteurs) {
      try {
        let x = A.P[0], y = A.P[1], z = A.P[2], cap = A.cap || 0, mv = 0;
        if (A.vers) {
          const t0 = A.t0 || 0, t1 = A.t1 !== undefined ? A.t1 : dur, u = clamp((tp - t0) / Math.max(0.3, t1 - t0), 0, 1);
          x = lerp(A.P[0], A.vers[0], u); z = lerp(A.P[2], A.vers[2], u);
          y = A.k === 'c' || A.vol ? lerp(A.P[1], A.vers[1], u) : w.groundAt(x, z, lerp(A.P[1], A.vers[1], u) + 0.3, 0.6);
          if (u > 0 && u < 1) { mv = 1; cap = Math.atan2(A.vers[0] - A.P[0], A.vers[2] - A.P[2]); } else if (u >= 1 && A.capFin !== undefined) cap = A.capFin;
        }
        if (A.face === 'camera' && !mv && cam) cap = Math.atan2(cam[0] - x, cam[2] - z);
        if (A.k === 'c') {
          PE.buf = buf; PE.fl = A.lueur ? FX_HI : 0;
          PE.frame(x, y, z, (A.r || 0) + (A.tourne ? tp * A.tourne : 0), A.s || 1);
          if (A.dessin) A.dessin(PE, tp, t);
          else PROP_MODELS[A.model](PE, A.prop || (A.prop = { id: A.model, x, y, z, r: A.r || 0, s: A.s || 1, data: A.data || {} }), { night: !!(qtScenes.mem && qtScenes.mem.sky && qtScenes.mem.sky.nightLit), t, wind: t * 0.07, hour: D.heure });
          PE.fl = 0;
          continue;
        }
        const r = this.rig(A), st = Object.assign({ move: mv, phase: mv ? tp * (A.k === 'b' ? 4.2 : 5.2) : 0, t, lookY: 0 }, this.geste(A, tp));
        if (A.regard === 'camera' && cam) st.lookY = clamp(angDiff(cap, Math.atan2(cam[0] - x, cam[2] - z)), -1.1, 1.1);
        if (A.k === 'b') {
          if (['hen', 'duck', 'crow', 'songbird', 'pigeon'].includes(A.rig) && typeof poseBird === 'function') poseBird(r, st); else poseQuad(r, st);
          drawRig(buf, r, x, y, z, cap, A.s || 1, 0);
          if (sbuf) drawShadow(sbuf, x, y, z, A.rig === 'horse' || A.rig === 'cow' ? 0.7 : 0.35);
          continue;
        }
        poseHuman(r, st);
        const it = r.part && r.part('it0');
        if (it) { const vu = !!(A.tient || A.main); it.hide = !vu; const it1 = r.part('it1'); if (it1) it1.hide = !vu; }
        drawRig(buf, r, x, y, z, cap, A.s || 1, 0);
        if (sbuf) drawShadow(sbuf, x, y, z, 0.34 * (A.s || 1));
      } catch (e) { if (!this._err.d) { this._err.d = true; console.error('q20 : acteur', e); } }
    }
  },
};
if (typeof window !== 'undefined') window.prairieQuetesCine = q20;

// ============================================================================
//  LES BRANCHEMENTS
// ============================================================================
// les déclencheurs : accepter → la demande, rendre → le dénouement (les habitants, et ce qui passe par quests)
{
  const _acc = quests.accept.bind(quests);
  quests.accept = function (q, n) {
    const r = _acc(q, n);
    try { if (q && q20.defs[q.id]) q20.declencher(q.id, 'demande'); } catch (e) { console.error('q20', e); }
    return r;
  };
  const _cp = quests.complete.bind(quests);
  quests.complete = function (q, n) {
    const r = _cp(q, n);
    // (la fin à choix : Q.choix est posé juste après, il est lu au moment de jouer)
    try { if (q && q20.defs[q.id]) q20.declencher(q.id, 'fin'); } catch (e) { console.error('q20', e); }
    return r;
  };
}
// les autres (Q16 : la diseuse, le violoneux, Basse-Fosse…) : leurs quêtes passent par q16.accepter et q16.finir
if (typeof q16 !== 'undefined') {
  const _ac = q16.accepter.bind(q16);
  q16.accepter = function (id) {
    const r = _ac(id);
    try { if (r && q20.defs[id]) q20.declencher(id, 'demande'); } catch (e) { console.error('q20', e); }
    return r;
  };
  const _fi = q16.finir.bind(q16);
  q16.finir = function (id, ci) {
    const r = _fi(id, ci);
    try { if (r && q20.defs[id]) q20.declencher(id, 'fin'); } catch (e) { console.error('q20', e); }
    return r;
  };
}
// passer une scène (Espace, Échap) : les plans restants ne font ni son ni voix
{
  const _pa = cine.passer.bind(cine);
  cine.passer = function () { q20._passe = true; try { return _pa(); } finally { q20._passe = false; } };
}
HOOKS.update.push((dt) => q20.update(dt));
HOOKS.draw.push((buf, sbuf, cam, t) => { if (q20.joue && cine.on) q20.dessiner(buf, sbuf, cam, t); });
// au chargement : une partie d'avant, ou des quêtes dont les scènes viennent d'être inscrites — rien ne se rejoue
HOOKS.load.push((saved) => {
  q20.joue = null; q20.caches = []; q20.t = 2; q20.calmeT = 0; q20.dangerT = 0;
  if (!farm.s) return;
  const neuve = !farm.s.q20, S = q20.S();
  if (saved && neuve) S.anc = 1;
  for (const id of q20.ordre) {
    if (S.connus[id]) continue;
    if (saved) { try { q20.reprendre(id); } catch (e) { console.error('q20 : reprise ' + id, e); } }
    S.connus[id] = 1;
  }
  // (des scènes qui attendaient depuis trop longtemps : elles rejoignent les souvenirs)
  S.file = S.file.filter((e) => {
    if (!q20.defs[e.id]) return false;
    if (farm.s.day - (e.j || 0) <= (Q20_REGL.vieux[e.m.split(':')[0]] ?? 1)) return true;
    q20.souvenir(e.id, q20.resoudre(e.id, e.m), e.h);
    return false;
  });
});
