// ============================================================================
//  LA SOCIÉTÉ DE LA VALLÉE
//  - La mort d'un habitant est définitive : ses quêtes sont perdues (carnet :
//    « † — ne pourra plus se faire »), celles qui passaient par lui échouent,
//    sa maison est mise sous scellés, son commerce est repris par un autre, la
//    nouvelle court de village en village (répliques « disparu », faire-part).
//    Rares morts d'autres causes : maladie (qu'un remède peut guérir),
//    accident de métier, vieillesse.
//  - Crimes et avis de recherche : ce que voient les témoins est su dans leur
//    village ; les nouvelles voyagent (postière, garde, colporteurs) ; une prime
//    est mise sur la tête du fermier ; des affiches « RECHERCHÉ » sont clouées
//    dans les villages qui savent ; on y refuse de vous parler et de commercer,
//    on fuit, on appelle le garde, qui somme, arrête (le cachot) ou frappe ;
//    de rares chasseurs de primes rôdent. La prime se paie au garde, au maire,
//    au guichet de la mairie, ou s'oublie après un long temps sans récidive.
//  État sauvegardé : farm.s.soc (et farm.s.rep.crimes / infamy, déjà là).
//  API : societe.crime({ type, victime, x, z, temoins, preuve }) ;
//        societe.recherche() → { prime, crimes, villages, … } ou null ;
//        societe.villageDe(id), societe.remplacant(id), societe.lever(raison),
//        societe.echanger(npc, village) (nouvelles portées par un colporteur).
// ============================================================================
const SOC_VILLAGES = ['valbrume', 'clairpre', 'sources', 'plateau', 'nains'];
// gravité, prime de base, jours sans récidive avant l'oubli
const CRIME_DEF = {
  meurtre: { prime: 350, grav: 10, oubli: 45, violent: true },
  agression: { prime: 60, grav: 3, oubli: 12, violent: true },
  vol: { prime: 45, grav: 2, oubli: 10, violent: false },
  braconnage: { prime: 30, grav: 1, oubli: 8, violent: false },
  profanation: { prime: 140, grav: 5, oubli: 25, violent: false },
};
// causes de mort (faire-part, nouvelles) : [masculin, féminin]
const SOC_CAUSES = {
  joueur: ['retrouvé sans vie', 'retrouvée sans vie'],
  tueur: ['assassiné dans la nuit', 'assassinée dans la nuit'],
  masque: ['mort sous le masque de l’assassin', 'morte sous le masque de l’assassin'],
  maladie: ['emporté par la fièvre', 'emportée par la fièvre'],
  vieillesse: ['éteint dans son sommeil, à un âge vénérable', 'éteinte dans son sommeil, à un âge vénérable'],
  noyade: ['noyé au grand lac', 'noyée au grand lac'],
  forge: ['mort d’un accident à la forge', 'morte d’un accident à la forge'],
  chasse: ['mort d’un accident de chasse', 'morte d’un accident de chasse'],
  ruade: ['tué par un cheval emballé', 'tuée par un cheval emballé'],
  chute: ['mort d’une mauvaise chute', 'morte d’une mauvaise chute'],
  route: ['mort sur la route, au fond d’un ravin', 'morte sur la route, au fond d’un ravin'],
  ours: ['tué par un ours', 'tuée par un ours'],
  loup: ['tué par les loups', 'tuée par les loups'],
  froid: ['mort de froid', 'morte de froid'],
  foudre: ['foudroyé', 'foudroyée'],
  tornade: ['emporté par la tornade', 'emportée par la tornade'],
  chasseur: ['tué d’un coup de fusil perdu', 'tuée d’un coup de fusil perdu'],
  inconnu: ['retrouvé mort', 'retrouvée morte'],
};
// quand un commerçant meurt, un autre reprend l'essentiel de son commerce (le premier vivant de la liste)
const SOC_REPRISE = {
  boulangere: [['aubergiste', ['pain', 'brioche', 'tarte']], ['colporteuse', ['pain']], ['naturiste_a', ['pain']]],
  grainetiere: [['colporteuse', ['graines_ble', 'graines_carotte', 'graines_patate', 'graines_chou', 'graines_mais', 'houe', 'arrosoir', 'seau', 'foin', 'faux', 'cloture']], ['eleveuse', ['graines_ble', 'graines_carotte', 'graines_patate', 'houe', 'arrosoir', 'seau']], ['colporteur', ['graines_ble', 'graines_carotte', 'houe', 'arrosoir']]],
  forgeron: [['nain_forgeronne', ['hache_pierre', 'pioche_pierre', 'hache_fer', 'pioche_fer', 'marteau', 'lingot_fer', 'lingot_cuivre']], ['colporteur', ['hache_pierre', 'pioche_pierre', 'marteau', 'lingot_fer', 'lanterne']], ['chasseur', ['piege', 'arc', 'fleche']]],
  aubergiste: [['boulangere', ['soupe', 'fromage']], ['naturiste_a', ['fromage']], ['colporteuse', ['fromage']]],
  eleveuse: [['grainetiere', ['poule', 'foin']], ['colporteur', ['poule', 'mouton', 'cochon', 'vache', 'cheval']], ['colporteuse', ['poule', 'mouton']]],
  pecheur: [['colporteur', ['canne', 'piege']], ['chasseur', ['canne']], ['forgeron', ['canne']]],
  guerisseuse: [['alchimiste', ['herbes', 'champignon', 'fiole', 'rosee', 'potion_soin', 'antidote']], ['naturiste_a', ['herbes', 'reine_pres']], ['colporteuse', ['herbes', 'fiole', 'bandage']]],
  alchimiste: [['guerisseuse', ['fiole', 'bandage', 'potion_soin', 'antidote', 'table_alchimie', 'livre_herbier']], ['colporteuse', ['fiole', 'bandage', 'potion_soin']], ['libraire', ['livre_herbier']]],
  libraire: [['colporteur', ['livre_bestiaire', 'livre_herbier', 'livre_poissons', 'livre_sciences', 'livre_manuel_menuisier', 'livre_manuel_jardin', 'carte_est', 'carte_nord', 'carte_monts']], ['colporteuse', ['livre_bestiaire', 'livre_herbier', 'livre_sciences']]],
  chasseur: [['forgeron', ['cartouche', 'piege', 'piege_loup', 'arc', 'fleche']], ['colporteur', ['cartouche', 'piege_loup', 'appeau']]],
  colporteur: [['colporteuse', ['livre_bestiaire', 'livre_herbier', 'livre_manuel_forgeron', 'livre_manuel_charron', 'livre_manuel_chasse', 'carte_centre', 'carte_ouest', 'carte_sud', 'harnais', 'roue', 'lanterne']], ['libraire', ['carte_centre', 'carte_ouest', 'carte_sud']]],
  colporteuse: [['colporteur', ['toile', 'bandage', 'attelle', 'fiole', 'sel', 'carte_nord', 'carte_est', 'graines_basilic', 'graines_lavande', 'livre_manuel_cuisine', 'appeau']], ['alchimiste', ['bandage', 'attelle', 'fiole', 'sel']]],
  nain_forgeronne: [['colporteur', ['lentille', 'lunette']], ['forgeron', ['canon_fusil', 'pioche_acier', 'hache_acier', 'lingot_acier']]],
  naturiste_a: [['colporteuse', ['huile', 'miel', 'reine_pres']], ['guerisseuse', ['miel', 'reine_pres']]],
  postiere: [['colporteur', ['carte_vallee']]],
  maire: [['libraire', ['vieille_piece']], ['colporteur', ['vieille_piece']]],
};
// qui reprend le métier (identification des plantes, soins…) quand quelqu'un n'est plus là
const SOC_SUCCESSION = {
  alchimiste: ['guerisseuse', 'naturiste_b', 'libraire'], guerisseuse: ['naturiste_b', 'alchimiste'], naturiste_b: ['guerisseuse', 'alchimiste'],
  garde: ['maire', 'cure'], maire: ['cure', 'postiere'], postiere: ['maire', 'colporteur'], libraire: ['cure', 'alchimiste'], cure: ['maire'],
  forgeron: ['nain_forgeronne', 'colporteur'], boulangere: ['aubergiste'], grainetiere: ['colporteuse', 'eleveuse'], eleveuse: ['grainetiere', 'colporteur'],
  pecheur: ['colporteur', 'chasseur'], chasseur: ['forgeron', 'garde'], colporteur: ['colporteuse'], colporteuse: ['colporteur'],
};
// remèdes qu'on peut offrir à un malade
const SOC_REMEDES = ['potion_soin', 'potion_regeneration', 'infusion', 'antidote', 'baume_moelle', 'eau_lustrale', 'reine_pres', 'herbes'];
const SOC_MALADE = [
  '(Une toux sèche.) Ce n’est rien. Un mauvais froid, qui ne veut pas partir.',
  '(Le front brûlant, la voix faible.) Je me reposerai demain. Ou après-demain.',
  'La fièvre. Elle monte le soir et redescend le matin. Comme une marée.',
  '(Les mains tremblent sur la couverture.) Si vous aviez un remède… je ne dirais pas non.',
  'On m’a dit de rester au chaud. Alors je reste au chaud. Et j’attends.',
];
const SOC_NOUVELLES_MORT = [
  'Vous savez pour {victime} ? Toute la vallée en parle.',
  '(À voix basse.) {victime}… On ne s’y fait pas.',
  'On a enterré {victime}. Il y avait du monde. Il n’y avait pas assez de monde.',
  'Depuis {victime}, je ferme ma porte deux fois.',
];
// allure des chasseurs de primes
const SOC_CHASSEUR_LOOK = { skin: '#c8a080', hair: '#2a221a', hairStyle: 'court', beard: 'courte', hat: 'chapeau', hatCol: '#1e1a16', top: '#2e2a26', bottom: '#26221e', shoe: '#1a1410', coat: true, build: 'normal', height: 1.03, held: 'baton' };

const societe = {
  ctx: null, ctxShop: false, spots: null, chasseurs: [], arrestation: false, sigAff: '', t: 0,

  // ------------------------------------------------------------------ état
  S() {
    const s = farm.s;
    let S = s.soc;
    if (!S) S = s.soc = {};
    if (!S.crimes) Object.assign(S, { v: 1, n: 0, crimes: [], morts: {}, derniere: 0, natMorts: 0, natDernier: 0, chasseurJour: 0, prevu: null, visite: 0, convoque: 0 });
    if (!S.morts) S.morts = {};
    return S;
  },
  // anciennes parties : les meurtres déjà inscrits dans farm.s.rep.crimes deviennent des crimes connus
  migrer() {
    const s = farm.s, S = this.S(), R = s.rep || (s.rep = { crimes: [], infamy: 0, hero: 0 });
    for (const k of R.crimes || []) {
      if (k.soc) continue;
      const type = CRIME_DEF[k.type] ? k.type : 'meurtre';
      const C = { id: 'k' + (++S.n), type, victime: k.victim || null, x: 0, z: 0, day: k.day || s.day, h: 12, prime: CRIME_DEF[type].prime, temoins: [], connu: {}, porte: {}, leve: k.killer ? 'justice' : null, lieu: this.villageDe(k.victim) || 'valbrume' };
      if (k.known && !C.leve) C.connu[C.lieu] = C.day;
      S.crimes.push(C); k.soc = C.id;
      S.derniere = Math.max(S.derniere || 0, C.day);
    }
    for (const d of s.dead || []) if (!S.morts[d.id]) S.morts[d.id] = { day: d.day, cause: d.by || 'inconnu', v: this.villageDe(d.id), annonce: true };
  },

  // ------------------------------------------------------------------ villages
  villageDe(id) {
    const d = NPC_BY_ID[id];
    if (!d || d.nomade) return null;
    return { ville: 'valbrume', lac: 'valbrume', foret: 'valbrume', hameau: 'clairpre', sources: 'sources', plateau: 'plateau', nains: 'nains' }[d.area] || 'valbrume';
  },
  centre(v) {
    const w = game.world, T = w.townInfo, lm = w.lm;
    if (v === 'valbrume') return T ? { x: T.x, z: T.z, r: 75 } : null;
    if (v === 'clairpre') return lm.hameau ? { x: lm.hameau.x, z: lm.hameau.z, r: 60 } : null;
    if (v === 'sources') return w.sources ? { x: w.sources.x, z: w.sources.z, r: 45 } : null;
    if (v === 'plateau') return lm.bibliotheque ? { x: lm.bibliotheque.x, z: lm.bibliotheque.z, r: 40 } : null;
    if (v === 'nains') return w.nains ? { x: w.nains.hall.x, z: w.nains.hall.z, r: 30, under: true } : null;
    return null;
  },
  // le village le plus proche d'un point (pour un crime sans témoin, ou un colporteur arrivé)
  villageAt(x, z, max) {
    let best = null, bd = max || 1e9;
    for (const v of SOC_VILLAGES) {
      const C = this.centre(v);
      if (!C) continue;
      const d = Math.hypot(C.x - x, C.z - z);
      if (d < bd) { bd = d; best = v; }
    }
    return best || (max ? null : 'valbrume');
  },
  nom(v) { return v === 'valbrume' ? farm.names.ville : v === 'clairpre' ? farm.names.hameau : v === 'sources' ? 'les Sources' : v === 'plateau' ? 'la grande bibliothèque' : 'les halles d’en bas'; },
  nomA(v) { return v === 'valbrume' ? `à ${farm.names.ville}` : v === 'clairpre' ? `à ${farm.names.hameau}` : v === 'sources' ? 'aux Sources' : v === 'plateau' ? 'à la grande bibliothèque' : 'chez les nains'; },
  nomComplet(id) { const n = npcs.byId[id]; return n ? n.name + ' ' + n.d.surname : id; },
  fem(id) { const d = NPC_BY_ID[id]; return !!(d && d.gender === 'f'); },

  // ------------------------------------------------------------------ savoir des villages
  connait(C, v) { return !!v && C.connu[v] !== undefined && C.connu[v] <= farm.s.day; },
  connuDepuis(C, v, k) { return C.connu[v] !== undefined && C.connu[v] <= farm.s.day - k; },
  connuQuelquePart(C) { return SOC_VILLAGES.some((v) => this.connait(C, v)); },
  apprendre(C, v, day) {
    if (!v || C.leve) return false;
    if (C.connu[v] !== undefined && C.connu[v] <= day) return false;
    const neuf = !this.connuQuelquePart(C);
    C.connu[v] = day;
    if (neuf) {
      const R = farm.s.rep;
      R.infamy = (R.infamy || 0) + CRIME_DEF[C.type].grav;
      const k = (R.crimes || []).find((e) => e.soc === C.id);
      if (k) k.known = true;
      // la famille, les amis de la victime ne pardonnent pas
      if (C.victime && C.type === 'meurtre') { const d = NPC_BY_ID[C.victime]; for (const id in (d && d.liens) || {}) { const m = npcs.byId[id]; if (m && m.st.alive) { npcs.addAmitie(m, -220); m.st.anger = Math.max(m.st.anger || 0, 20); } } }
    }
    return true;
  },
  npcSait(n, C) {
    if (!n || !C) return false;
    if (C.temoins.includes(n.id)) return true;
    if (n.d.nomade) return C.porte[n.id] !== undefined && C.porte[n.id] <= farm.s.day;
    return this.connait(C, this.villageDe(n.id));
  },
  actifs() { return this.S().crimes.filter((C) => !C.leve); },
  crimesSus(n) { return this.actifs().filter((C) => this.npcSait(n, C)); },
  redoute(n) { return this.crimesSus(n).some((C) => C.type === 'meurtre'); },
  recherche() {
    if (!farm.s) return null;
    const A = this.actifs().filter((C) => this.connuQuelquePart(C));
    if (!A.length) return null;
    return {
      prime: A.reduce((a, C) => a + C.prime, 0),
      crimes: A.map((C) => ({ type: C.type, victime: C.victime, jour: C.day, prime: C.prime })),
      villages: SOC_VILLAGES.filter((v) => A.some((C) => this.connait(C, v))),
      violent: A.some((C) => CRIME_DEF[C.type].violent), meurtre: A.some((C) => C.type === 'meurtre'),
    };
  },
  libelle(C) {
    const nm = C.victime ? this.nomComplet(C.victime) : null, el = nm && /^[aeiouyàâéèêëîïôöûüh]/i.test(nm);
    switch (C.type) {
      case 'meurtre': return nm ? (el ? `le meurtre d’${nm}` : `le meurtre de ${nm}`) : 'un meurtre';
      case 'agression': return nm ? (el ? `l’agression d’${nm}` : `l’agression de ${nm}`) : 'une agression';
      case 'vol': return C.detail === 'betail' ? 'le vol d’une bête' : 'un vol';
      case 'braconnage': return 'du braconnage';
      case 'profanation': return C.detail === 'cimetiere' ? 'la profanation du cimetière' : 'une profanation';
    }
    return C.type;
  },
  prixDe(type, vic) {
    const S = this.S(), def = CRIME_DEF[type];
    const avant = S.crimes.filter((k) => k.leve !== 'justice' && k.leve !== 'remplace').length;
    let p = def.prime * Math.min(2, 1 + avant * 0.25);
    if (vic && ['garde', 'maire', 'cure'].includes(vic.id)) p += type === 'meurtre' ? 150 : 25;
    if (vic && vic.id === 'fillette') p += type === 'meurtre' ? 400 : 60;
    return Math.round(p / 5) * 5;
  },

  // ------------------------------------------------------------------ l'API : un crime
  crime(o) {
    if (!o || !CRIME_DEF[o.type] || !farm.s || !game.world) return null;
    const s = farm.s, S = this.S(), def = CRIME_DEF[o.type], p = game.player;
    const x = o.x ?? p.pos[0], z = o.z ?? p.pos[2];
    const vic = o.victime && npcs.byId[o.victime] ? npcs.byId[o.victime] : null;
    let tem = Array.isArray(o.temoins) ? o.temoins.map((t) => (typeof t === 'string' ? npcs.byId[t] : t)).filter((m) => m && m.st && m.st.alive) : npcs.witnesses(x, z, vic);
    if (vic && vic.st.alive && !tem.includes(vic) && !vic.sleep) tem.push(vic); // la victime sait qui l'a frappée
    let C = o.victime ? S.crimes.find((k) => !k.leve && k.type === o.type && k.victime === o.victime && k.day === s.day) : null;
    if (!C) {
      // le meurtre remplace l'agression du même jour sur la même victime
      if (o.type === 'meurtre' && vic) {
        const old = S.crimes.filter((k) => k.type === 'agression' && k.victime === vic.id && k.day === s.day && !k.leve);
        for (const k of old) { if (!tem.length) tem = k.temoins.map((id) => npcs.byId[id]).filter((m) => m && m.st.alive); k.leve = 'remplace'; }
      }
      C = { id: 'k' + (++S.n), type: o.type, victime: o.victime || null, detail: o.detail || null, x: Math.round(x), z: Math.round(z), day: s.day, h: Math.round(npcs.hour() * 10) / 10, prime: this.prixDe(o.type, vic), temoins: [], connu: {}, porte: {}, leve: null, lieu: (vic && this.villageDe(vic.id)) || this.villageAt(x, z) };
      S.crimes.push(C);
      const R = s.rep;
      const k = o.type === 'meurtre' && vic ? (R.crimes || []).slice().reverse().find((e) => e.victim === vic.id && !e.soc) : null;
      if (k) k.soc = C.id; else (R.crimes || (R.crimes = [])).push({ victim: C.victime, day: s.day, known: false, type: o.type, soc: C.id });
    }
    S.derniere = s.day;
    for (const m of tem) {
      if (!C.temoins.includes(m.id)) C.temoins.push(m.id);
      if (m.d.nomade) { if (C.porte[m.id] === undefined) C.porte[m.id] = s.day; }
      else this.apprendre(C, this.villageDe(m.id), s.day);
      npcs.remember(m, 'crime', { type: o.type, victim: C.victime });
      npcs.addAmitie(m, -def.grav * 12);
    }
    if (o.preuve) this.apprendre(C, typeof o.preuve === 'string' ? o.preuve : C.lieu, s.day);
    if (tem.length && def.violent) this.panique(x, z, tem);
    else if (tem.length) this.alerterGarde(x, z, 0.6);
    this.majAffiches(true);
    return C;
  },
  // les témoins fuient en criant, et l'on court chercher le garde
  panique(x, z, tem) {
    let cri = false;
    for (const m of tem) {
      if (!m.st.alive || m.d.id === 'garde' || m.d.area === 'nains') continue;
      if (Math.hypot(m.x - x, m.z - z) < 18) { m.fleeT = 7; m.talking = false; if (!cri) { cri = true; npcs.say(m, pick(['Au secours ! À l’assassin !', 'Au secours ! Au garde !', 'Il l’a frappé ! Au garde !']), 3); } }
    }
    this.alerterGarde(x, z, 1);
  },
  alerterGarde(x, z, k) {
    const g = npcs.byId.garde;
    if (!g || !g.st.alive || g.sleep || g.vanished || g.hunting || g.st.malade || Math.random() > (k ?? 1)) return false;
    if (Math.hypot(g.x - x, g.z - z) > 170) return false;
    g.alerte = { x, z, t: game.time + 40 };
    return true;
  },
  lever(raison, filtre) {
    let n = 0;
    for (const C of this.actifs()) if (!filtre || filtre(C)) { C.leve = raison; C.leveJour = farm.s.day; n++; }
    for (const m of npcs.list) { m.poursuite = 0; m.alerte = null; m.sommeT = 0; m.attaque = false; }
    this.majAffiches(true);
    return n;
  },
  payer(par) {
    const R = this.recherche();
    if (!R) return 'rien';
    if (!farm.pay(R.prime)) return 'pauvre';
    sound.coin && sound.coin(); setTimeout(() => sound.coin && sound.coin(), 120);
    this.lever('payee', (C) => this.connuQuelquePart(C));
    farm.mail(npcs.alive('maire') ? 'La mairie de ' + farm.names.ville : 'Le greffe de ' + farm.names.ville, 'Quittance', `Reçu de ${farm.s.prenom || 'l’intéressé'}, de la vieille ferme, la somme de ${R.prime} pièces, montant de la prime mise sur sa tête.\n\nLes avis de recherche sont retirés. L’affaire est close. Elle ne sera pas oubliée pour autant.\n\n${par ? 'Reçu par ' + par + '.' : 'Pour la commune.'}`);
    return 'ok';
  },
  // nouvelles échangées par un colporteur arrivé dans un village (il dit ce qu'il sait, il écoute)
  echanger(n, v) {
    if (!n || !v || !n.st.alive) return;
    const d = farm.s.day;
    for (const C of this.actifs()) {
      if (this.connait(C, v) && C.porte[n.id] === undefined) C.porte[n.id] = d;
      else if (C.porte[n.id] !== undefined && C.porte[n.id] <= d && !this.connait(C, v)) { this.apprendre(C, v, d); this.majAffiches(true); }
    }
  },

  // ------------------------------------------------------------------ la mort d'un habitant
  surMort(n, cause) {
    const s = farm.s, S = this.S(), d = s.day;
    S.morts[n.id] = { day: d, h: Math.round(npcs.hour() * 10) / 10, cause, v: this.villageDe(n.id), annonce: false };
    n.st.malade = null;
    this.verrouiller(n);
    // les colis du jour pour ce destinataire ne partiront plus
    if (s.deliveries && s.deliveries.day === d) {
      const L = s.deliveries.list.filter((q) => !q.done && q.to === n.id);
      for (const q of L) { q.done = true; q.mort = true; farm.take('colis', 1); }
    }
    // ses proches sont en deuil
    for (const id in n.d.liens || {}) { const m = npcs.byId[id]; if (m && m.st.alive) m.st.deuilDe = { id: n.id, day: d }; }
  },
  // ses quêtes sont perdues ; celles qui passaient par lui échouent
  verrouiller(n, raison) {
    const s = farm.s, w = game.world;
    for (const D of NPC_DATA) for (const q of D.quests) {
      const Q = s.quests[q.id];
      if (!Q || Q.st !== 'actif') continue;
      let why = null;
      if (D.id === n.id) why = 'mort';
      else if ((q.type === 'livrer' || q.type === 'parler') && q.a === n.id && !Q.step) why = 'via';
      if (!why) continue;
      Q.st = 'perdu'; Q.perdu = s.day; Q.pourquoi = why; Q.qui = n.id; if (raison) Q.raison = raison;
      if (q.type === 'trouver') { // l'objet à trouver ne sert plus à personne : on ne le fait plus apparaître
        const it = (w.inter || []).find((i) => i.id === 'quete_' + q.id);
        if (it) w.inter.splice(w.inter.indexOf(it), 1);
        const pi = w.props.findIndex((p) => p.questFind === q.id);
        if (pi >= farm.genProps) { w.props.splice(pi, 1); farm.dirtyProps = true; }
      }
    }
  },
  // une quête qu'on ne peut plus proposer (destinataire mort)
  impossible(q) {
    if ((q.type === 'livrer' || q.type === 'parler') && q.a && !npcs.alive(q.a)) return true;
    return false;
  },
  causeTexte(id, cause) {
    const f = this.fem(id) ? 1 : 0, S = this.S();
    if (cause === 'joueur') {
      const C = S.crimes.find((k) => k.type === 'meurtre' && k.victime === id);
      if (C && this.connuQuelquePart(C)) return f ? `tuée par ${farm.s.prenom || 'quelqu’un'}, de la vieille ferme` : `tué par ${farm.s.prenom || 'quelqu’un'}, de la vieille ferme`;
    }
    return (SOC_CAUSES[cause] || SOC_CAUSES.inconnu)[f];
  },
  // cet habitant sait-il déjà la mort de tel autre ?
  saitMort(n, id) {
    const M = this.S().morts[id];
    if (!M || id === n.id) return false;
    if (M.day < farm.s.day) return n.d.area !== 'nains' || farm.s.day - M.day >= 3;
    return n.d.nomade || this.villageDe(n.id) === M.v;
  },
  // la mort dont il vous parlera (la plus récente qu'il n'a pas encore évoquée)
  deuilAParler(n) {
    const S = this.S(), s = farm.s;
    n.st.deuils = n.st.deuils || {};
    let best = null;
    for (const id in S.morts) {
      const M = S.morts[id];
      if (s.day - M.day > 6 || n.st.deuils[id] || !this.saitMort(n, id)) continue;
      if (!best || M.day > S.morts[best].day) best = id;
    }
    return best;
  },

  // ------------------------------------------------------------------ morts rares : maladie, accident, vieillesse
  exclus(n) {
    return !n.st.alive || n.vanished || n.hunting || ['fillette', 'libraire', 'nain_ancien', 'nain_forgeronne'].includes(n.id) || (strange.isKiller(n.id) && strange.killerPhase() >= 1);
  },
  mortNaturelle(n, cause, ou) {
    const w = game.world, B = w.bld[n.d.home], W = w.bld[n.d.work] || B;
    let x = n.x, z = n.z, y = n.y, r = n.heading;
    const pt = (px, pz) => { x = px; z = pz; y = w.groundAt(px, pz, w.heightAt(px, pz) + 1.2, 0.8); };
    if (ou === 'lit' && B && B.spots.bed) { const b = B.spots.bed; x = b.x; z = b.z; y = b.y; r = b.r; }
    else if (ou === 'travail' && W) { const sp = W.spots.work || W.spots.sit; if (sp) { x = sp.x; z = sp.z; y = sp.y; r = sp.r; } else { const q = w.nav.nodes[W.nMid]; pt(q.x, q.z); } }
    else if (ou === 'ponton' && w.lm.ponton) { const L = w.lm.ponton; for (let k = 0; k < 20; k++) { const a = k / 20 * TAU, px = L.x + Math.cos(a) * 9, pz = L.z + Math.sin(a) * 9; if (w.heightAt(px, pz) > w.waterLevel + 0.1) { pt(px, pz); break; } } }
    else if (ou === 'foret' && w.relais) { const q = w.nav.nodes.find((m) => m.tag === 'chasse') || { x: w.relais.x + 12, z: w.relais.z + 12 }; pt(q.x + 3, q.z + 2); }
    else if (ou === 'route') { const T = w.townInfo, H = w.lm.hameau; if (T && H) { const q = npcs.nearestNode(lerp(T.x, H.x, 0.55), lerp(T.z, H.z, 0.55)); if (q >= 0) pt(w.nav.nodes[q].x + 2, w.nav.nodes[q].z + 2); } }
    n.x = x; n.z = z; n.y = y; n.heading = r; n.path = []; n.goal = null;
    this._silence = true;
    try { npcs.kill(n, cause, []); } finally { this._silence = false; }
    const S = this.S(); S.natMorts = (S.natMorts || 0) + 1; S.natDernier = farm.s.day;
  },
  jourMaladies() {
    const s = farm.s, S = this.S(), d = s.day, R = Math.random;
    const vivants = npcs.list.filter((n) => !this.exclus(n));
    const peutMourir = (S.natMorts || 0) < 3 && d - (S.natDernier || -99) >= 10 && d >= 8;
    // les malades : on guérit, ou non
    for (const n of npcs.list) {
      const M = n.st.malade;
      if (!M) continue;
      if (!n.st.alive) { n.st.malade = null; continue; }
      const k = d - M.depuis;
      if (M.soigne) { n.st.malade = null; npcs.remember(n, 'gueri'); continue; }
      if (M.grave && k >= 2 && peutMourir && R() < 0.3) { this.mortNaturelle(n, 'maladie', 'lit'); continue; }
      if ((!M.grave && k >= 2 && R() < 0.5) || k >= 7) n.st.malade = null;
    }
    if (d < 6) return;
    // une fièvre (plus souvent par temps froid ou pluvieux)
    const pM = 0.012 + (weather.cur.rain > 0.4 ? 0.006 : 0) + (weather.cur.frost > 0.3 ? 0.006 : 0);
    if (!npcs.list.some((n) => n.st.malade) && R() < pM) {
      const C = vivants.filter((n) => !n.d.nomade || R() < 0.3);
      const n = C.length ? C[(R() * C.length) | 0] : null;
      if (n) n.st.malade = { depuis: d, grave: R() < (n.d.age >= 55 ? 0.55 : 0.35) };
    }
    if (!peutMourir) return;
    // un accident de métier (la veille au soir), très rare
    const hier = d - 1;
    const ACC = {
      pecheur: ['noyade', 'ponton', () => weather.cur.storm > 0.3 || weather.cur.rain > 0.5 || cal.is('peche', hier)],
      forgeron: ['forge', 'travail', () => cal.is('fer', hier)],
      chasseur: ['chasse', 'foret', () => cal.is('chasse', hier)],
      eleveuse: ['ruade', 'travail', () => true],
      colporteur: ['route', 'route', () => true],
      colporteuse: ['route', 'route', () => true],
      aubergiste: ['chute', 'travail', () => cal.is('veillee', hier)],
    };
    if (R() < 0.0035) {
      const C = vivants.filter((n) => ACC[n.id] && ACC[n.id][2]());
      const n = C.length ? C[(R() * C.length) | 0] : null;
      if (n) { this.mortNaturelle(n, ACC[n.id][0], ACC[n.id][1]); return; }
    }
    // l'âge
    for (const n of vivants) if ((n.d.age || 0) >= 70 && n.d.age < 120 && R() < 0.0025) { this.mortNaturelle(n, 'vieillesse', 'lit'); return; }
  },

  // ------------------------------------------------------------------ chaque matin
  jour() {
    const s = farm.s, S = this.S(), d = s.day;
    const vivant = (id) => npcs.alive(id) && !npcs.byId[id].st.malade;
    // 1) les nouvelles voyagent
    for (const C of this.actifs()) {
      const lien = (a, b, k) => { if (this.connuDepuis(C, a, k)) this.apprendre(C, b, d); if (this.connuDepuis(C, b, k)) this.apprendre(C, a, d); };
      if (vivant('postiere')) lien('valbrume', 'clairpre', 1); // la tournée de la poste
      if ((vivant('garde') || vivant('maire')) && this.connuDepuis(C, 'valbrume', 2)) for (const v of ['clairpre', 'sources', 'plateau']) this.apprendre(C, v, d); // le signalement est placardé
      if (vivant('eleveuse') && cal.is('marche', d - 1)) lien('clairpre', 'valbrume', 0); // le marché de la ville
      if (vivant('naturiste_a') && cal.is('foire', d - 1)) lien('sources', 'clairpre', 0); // la foire du hameau
      if (vivant('libraire') && (cal.is('messe', d - 1) || cal.is('chome', d - 1))) lien('plateau', 'valbrume', 0);
      if (this.connuDepuis(C, 'sources', 1) && Math.random() < 0.3) this.apprendre(C, 'nains', d); // ceux d'en bas écoutent sous les bassins
      // un meurtre sans témoin : parfois, le garde remonte la piste jusqu'à la vieille ferme
      if (C.type === 'meurtre' && !C.enquete && d - C.day >= 1 && !this.connuQuelquePart(C)) {
        C.enquete = 1;
        if (vivant('garde') && Math.random() < 0.18) { this.apprendre(C, C.lieu, d); farm.mail(npcs.byId.garde.name + ' ' + npcs.byId.garde.d.surname, 'Des traces', `On a relevé des traces de pas autour du corps de ${this.nomComplet(C.victime)}. Elles mènent à la vieille ferme.\n\nJe viendrai vous voir.`); }
      }
    }
    // 2) l'oubli : un long temps sans récidive
    const calme = d - (S.derniere || 0);
    for (const C of this.actifs()) if (calme >= CRIME_DEF[C.type].oubli) { C.leve = 'prescrite'; C.leveJour = d; }
    // 3) faire-part
    for (const id in S.morts) {
      const M = S.morts[id], n = npcs.byId[id];
      if (M.annonce || M.day >= d || !n) continue;
      M.annonce = true;
      if (n.d.area === 'nains') continue; // ceux d'en bas gravent leurs morts dans la pierre, la mairie n'en sait rien
      const f = this.fem(id), sig = npcs.alive('maire') ? 'La mairie de ' + farm.names.ville : npcs.alive('cure') ? 'Le presbytère' : 'Une main inconnue';
      const civ = (n.d.age || 30) < 16 ? (f ? 'La petite' : 'Le petit') : f ? 'Madame' : 'Monsieur';
      farm.mail(sig, 'Avis de décès', `${civ} ${this.nomComplet(id)}, ${n.d.role.toLowerCase()}, ${this.causeTexte(id, M.cause)} le ${cal.nom(M.day)} ${M.day}.\n\nL’inhumation a eu lieu ce matin, au cimetière de ${farm.names.ville}.\n\n« Il n’y a pas de retour, dans cette vallée. On le sait tous. »`);
    }
    // 4) maladies, accidents, vieillesse ; ceux qu'on a emmenés (l'assassin démasqué) ne reviendront pas non plus
    this.jourMaladies();
    S.partis = S.partis || {};
    for (const n of npcs.list) if (!n.st.alive && !S.morts[n.id] && !S.partis[n.id]) { S.partis[n.id] = d; this.verrouiller(n, 'prison'); }
    // 5) prime : un chasseur de primes, parfois ; le garde passe à la ferme
    const R = this.recherche();
    S.prevu = null;
    if (R && R.prime >= 150 && d - (S.chasseurJour || 0) >= 3 && Math.random() < clamp(0.07 + R.prime / 4000, 0, 0.25)) S.prevu = { day: d, h: 9 + Math.random() * 8 };
    if (R && R.villages.includes('valbrume') && R.prime >= 90 && vivant('garde') && d - (S.visite || 0) >= 3) S.visite = d;
    for (const n of npcs.list) { if (n.st.deuilDe && d - n.st.deuilDe.day > 6) n.st.deuilDe = null; }
    this.majAffiches(true);
  },
  // le garde vient chercher le fermier à la ferme (9 h – 11 h, les jours de visite)
  visiteFerme(h) { const S = this.S(); return S.visite === farm.s.day && h >= 9 && h < 11 && !!this.recherche(); },

  // ------------------------------------------------------------------ chaque image : garde, fuites, affiches, chasseurs
  update(dt, playing) {
    if (!farm.s || !game.world || game.dying) return;
    const S = this.S(), p = game.player, h = npcs.hour();
    this.t -= dt;
    if (this.t <= 0) {
      this.t = 0.5;
      const R = this.recherche();
      if (R && playing) {
        // on vous reconnaît : on s'écarte, on appelle le garde
        for (const n of npcs.list) {
          if (!n.st.alive || n.vanished || n.hunting || n.talking || n.sleep || n.d.id === 'garde' || n.d.area === 'nains') continue;
          if (n.dist > 16 || (n.recoT || 0) > game.time) continue;
          if (!this.crimesSus(n).length) continue;
          if (n.dist > 6 && !segClear(game.world, n.x, n.z, p.pos[0], p.pos[2])) continue;
          n.recoT = game.time + 50;
          if (this.redoute(n)) { if (!(n.fleeT > 0)) { n.fleeT = 6; npcs.say(n, pick(['Au garde ! C’est l’assassin !', 'N’approchez pas !', 'Au secours !']), 2.5); } }
          else npcs.say(n, pick(['C’est ' + (farm.s.prenom || 'le fermier') + ', de l’affiche…', 'Je vous ai reconnu. Ne restez pas là.', 'Le garde vous cherche, vous savez.']), 3);
          this.alerterGarde(p.pos[0], p.pos[2], this.redoute(n) ? 1 : 0.5);
        }
      }
      // le garde est venu à la ferme et ne vous a pas trouvé : une convocation
      const g = npcs.byId.garde, fm = game.world.lm.ferme;
      if (g && fm && S.visite === farm.s.day && S.convoque !== farm.s.day && h >= 10.5 && h < 11 && Math.hypot(g.x - fm.x, g.z - fm.z) < 40 && Math.hypot(p.pos[0] - fm.x, p.pos[2] - fm.z) > 60 && R) {
        S.convoque = farm.s.day;
        { const quoi = this.actifs().filter((C) => this.connuQuelquePart(C)).map((C) => this.libelle(C)).join(', ');
          farm.mail(g.name + ' ' + g.d.surname + ', garde', 'Convocation', farm.s.fem
            ? `Je suis passé à la vieille ferme ce matin. Personne.\n\nVous êtes recherchée pour ${quoi}. La prime est de ${R.prime} pièces.\n\nPrésentez-vous à la mairie pour la régler. Sinon, je reviendrai. Et je ne viendrai pas seul.`
            : `Je suis passé à la vieille ferme ce matin. Personne.\n\nVous êtes recherché pour ${quoi}. La prime est de ${R.prime} pièces.\n\nPrésentez-vous à la mairie pour la régler. Sinon, je reviendrai. Et je ne viendrai pas seul.`); }
      }
      this.majAffiches(false);
    }
    this.majChasseurs(dt, h);
  },
  // le garde qui poursuit : sommation, arrestation, ou coups s'il s'agit d'un sang versé
  poursuivre(n, dt, w, c) {
    const p = game.player, dx = p.pos[0] - n.x, dz = p.pos[2] - n.z, d = Math.hypot(dx, dz);
    n.dist = d; n.hurtT = Math.max(0, n.hurtT - dt); n.bubbleT = Math.max(0, n.bubbleT - dt);
    const sus = this.crimesSus(n);
    if (!sus.length || this.arrestation || p.underground || game.sleeping) { this.finPoursuite(n); return; }
    const vu = d < 26 && (d < 5 || segClear(w, n.x, n.z, p.pos[0], p.pos[2]));
    if (vu) { n.poursuite = game.time + 18; n.vuT = game.time; n.alerte = null; }
    const violent = sus.some((C) => CRIME_DEF[C.type].violent);
    let tx, tz;
    if (vu || n.poursuite > game.time) { tx = p.pos[0]; tz = p.pos[2]; }
    else if (n.alerte && n.alerte.t > game.time) { tx = n.alerte.x; tz = n.alerte.z; if (Math.hypot(tx - n.x, tz - n.z) < 3) n.alerte = null; }
    else { this.finPoursuite(n); return; }
    if (n.attaque && violent && d < 22) { if (_socGuardAttack(n, dt, w, c)) return; }
    if (vu && d < 2.1) {
      n.move = lerp(n.move, 0, Math.min(1, dt * 8)); n.run = false;
      n.heading = turnToward(n.heading, Math.atan2(dx, dz), dt * 6);
      if (!n.sommeT) { n.sommeT = game.time; npcs.say(n, farm.s.fem ? 'Au nom de la loi ! Ne bougez plus, madame.' : 'Au nom de la loi ! Ne bougez plus, monsieur.', 3); }
      else if (game.time - n.sommeT > 2.8) this.arreter(n);
      return;
    }
    if (n.sommeT && d > 5.5) { if (violent) { n.attaque = true; if (!n.menaceT) { n.menaceT = 1; npcs.say(n, 'Vous l’aurez voulu !', 2.5); } } else if (!n.criT) { n.criT = 1; npcs.say(n, 'Arrêtez-vous !', 2); } }
    this.courir(n, tx, tz, dt, w, n.sommeT ? 4.6 : 4.1);
    if (!vu && n.poursuite && n.poursuite <= game.time && game.time - (n.vuT || 0) > 12) { npcs.say(n, pick(['Je vous retrouverai.', 'Vous ne quitterez pas la vallée.']), 2.5); this.finPoursuite(n); }
  },
  // nœud de départ d'un trajet : dans un bâtiment, son nœud du milieu ; dehors, le plus proche qu'on atteint en ligne droite
  noeud(x, z, inside) {
    const w = game.world;
    let key = inside;
    if (!key) for (const k in w.bld) { const B = w.bld[k]; if (!B.f || B.under) continue; const [lx, lz] = World.blockLocal({ x: B.f.x, z: B.f.z, r: B.f.r }, x, z); if (Math.abs(lx) < B.W / 2 && Math.abs(lz) < B.D / 2) { key = k; break; } }
    if (key && w.bld[key]) return w.bld[key].nMid;
    return npcs.nearestReach(x, z, (q) => !/:(in|mid)$/.test(q.tag));
  },
  finPoursuite(n) { n.poursuite = 0; n.alerte = null; n.sommeT = 0; n.attaque = false; n.menaceT = 0; n.criT = 0; n.run = false; n.goal = null; n.course = null; },
  // courir vers un point : en ligne droite si c'est dégagé, sinon de nœud en nœud ; jamais dans l'eau
  courir(n, tx, tz, dt, w, sp) {
    if (!n.courseT || game.time > n.courseT) {
      n.courseT = game.time + 1.2;
      if (Math.hypot(tx - n.x, tz - n.z) < 4 || segClear(w, n.x, n.z, tx, tz)) n.course = null;
      else {
        const a = this.noeud(n.x, n.z, n.inside), b = this.noeud(tx, tz, null), P = a >= 0 && b >= 0 ? npcs.findPath(n, a, b) : null;
        n.course = P ? P.slice() : null; n.courseI = 0;
      }
    }
    let gx = tx, gz = tz;
    if (n.course && n.courseI < n.course.length) {
      const q = w.nav.nodes[n.course[n.courseI]]; gx = q.x; gz = q.z;
      if (Math.hypot(gx - n.x, gz - n.z) < 1.3) n.courseI++;
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

  // ------------------------------------------------------------------ l'arrestation et le cachot
  async arreter(par) {
    if (this.arrestation || game.dying || game.sleeping) return;
    this.arrestation = true;
    const p = game.player, R = this.recherche();
    ui.close(true);
    for (const m of npcs.list) this.finPoursuite(m);
    for (const e of this.chasseurs) e.fin = true;
    const garde = !!(par && par.st);
    const nom = garde ? (par.st.met ? par.name : 'Le garde') : 'Le chasseur de primes';
    const e = p.eyePos(), ax = par ? par.x : p.pos[0] + 1, az = par ? par.z : p.pos[2] + 1;
    const a = Math.atan2(ax - p.pos[0], az - p.pos[2]) + 1.5;
    const mid = [(p.pos[0] + ax) / 2, e[1] - 0.25, (p.pos[2] + az) / 2];
    try {
      await cine.jouer([
        { dur: 3.2, de: { pos: [mid[0] + Math.sin(a) * 3.4, e[1] + 0.3, mid[2] + Math.cos(a) * 3.4], look: mid }, a: { pos: [mid[0] + Math.sin(a + 0.35) * 2.8, e[1] + 0.15, mid[2] + Math.cos(a + 0.35) * 2.8], look: mid }, texte: garde ? 'Au nom de la loi, je vous arrête.' : 'Doucement. Tu vaux plus vivant que mort.', qui: nom, joueur: true, debut() { sound.chain && sound.chain(); } },
        { dur: 2.4, fondu: 'noir', texte: '(Les fers se referment sur vos poignets.)', debut() { sound.lock && sound.lock(true); } },
      ], { passer: false });
      await this.cachot(R);
    } catch (err) { console.error(err); }
    this.arrestation = false;
  },
  async cachot(R) {
    const s = farm.s, w = game.world, p = game.player;
    const prime = R ? R.prime : 0, paye = Math.min(s.money, prime), manque = prime - paye;
    const jours = clamp((R && R.meurtre ? 3 : R && R.violent ? 2 : 1) + Math.ceil(manque / 150), 1, 5);
    game.sleeping = true;
    await ui.fade(true, `On vous enferme au cachot, sous la maison du garde de ${farm.names.ville}.`, 1200);
    await new Promise((r) => setTimeout(r, 1400));
    s.money -= paye;
    for (let k = 0; k < jours; k++) {
      game.skipHours(((0.25 - w.time + 1) % 1) * 24);
      w.time = 0.25; game.dayStart(); game.lastT = w.time;
      $('#fade-text').textContent = k + 1 < jours ? `Jour ${s.day}. La paille, le pain sec, la cruche d’eau.` : `Jour ${s.day}. La porte s’ouvre.`;
      await new Promise((r) => setTimeout(r, 1300));
    }
    this.lever('cachot', (C) => this.connuQuelquePart(C));
    const B = w.bld.garde;
    if (B) { p.pos = [B.out[0], w.groundAt(B.out[0], B.out[1], w.heightAt(B.out[0], B.out[1]) + 1, 1.5) + 0.02, B.out[1]]; p.yaw = B.f.r + Math.PI; }
    p.vel = [0, 0, 0]; p.hp = Math.max(p.hp, 55); p.food = Math.max(p.food, 35);
    w.time = 0.3; game.lastT = w.time;
    npcs.snap(w);
    farm.mail(npcs.alive('garde') ? npcs.byId.garde.name + ' ' + npcs.byId.garde.d.surname + ', garde' : 'Le greffe de ' + farm.names.ville, 'Levée d’écrou', `${farm.s.prenom || 'Le détenu'}, de la vieille ferme, a été ${farm.s.fem ? 'relâchée' : 'relâché'} ce matin après ${jours} ${jours > 1 ? 'jours' : 'jour'} de cachot.${paye ? `\n\nSomme saisie au profit de la commune : ${paye} pièces.` : ''}\n\nLa prime est levée. Qu’on ne vous y reprenne pas.`);
    farm.save();
    await ui.fade(false, '', 1200);
    game.sleeping = false;
    ui.subtitle('', paye ? `(On vous rend vos affaires. Il manque ${paye} pièces à votre bourse.)` : '(On vous rend vos affaires. Votre dette est payée en jours de cachot.)', 5);
  },

  // ------------------------------------------------------------------ les affiches « RECHERCHÉ »
  // emplacements : panneaux et façades de chaque village (calculés au chargement)
  calculerSpots() {
    const w = game.world, out = { valbrume: [], clairpre: [], sources: [], plateau: [], nains: [] };
    const facade = (key, cote) => {
      const B = w.bld[key];
      if (!B || !B.f || B.under) return null;
      const lx = cote * (B.W / 2 - 0.95), [x, z] = new Builder(w, Math.random, new Uint8Array(1)).toWorld(B.f, lx, -B.D / 2 - 0.04);
      return { x, y: B.f.y + 1.25, z, r: B.f.r + Math.PI };
    };
    const push = (v, sp) => { if (sp) out[v].push(sp); };
    const T = w.town2 && w.town2.board;
    if (T) {
      const pa = w.props.find((q) => q.id === 'panneau_affichage' && Math.hypot(q.x - T[0], q.z - T[1]) < 1);
      if (pa) { const c = Math.cos(pa.r), sn = Math.sin(pa.r), lx = 0.42, lz = -0.07; out.valbrume.push({ x: pa.x + lx * c + lz * sn, y: pa.y + 1.02, z: pa.z - lx * sn + lz * c, r: pa.r + Math.PI }); }
    }
    push('valbrume', facade('mairie', -1)); push('valbrume', facade('auberge', -1)); push('valbrume', facade('garde', 1));
    push('clairpre', facade('maison_hameau_a', -1)); push('clairpre', facade('ranch', 1)); push('clairpre', facade('maison_hameau_b', 1));
    push('sources', facade('source_b', -1)); push('sources', facade('source_a', 1));
    push('plateau', facade('bibliotheque', -1)); push('plateau', facade('bibliotheque', 1));
    if (w.nains) { const H = w.nains.hall; out.nains.push({ x: H.x, y: H.y + 1.25, z: H.z - 8 - 0.74, r: Math.PI }); out.nains.push({ x: H.x - 12, y: H.y + 1.25, z: H.z - 8 - 0.74, r: Math.PI }); }
    this.spots = out;
  },
  majAffiches(force) {
    const w = game.world;
    if (!w || !farm.s) return;
    if (!this.spots) this.calculerSpots();
    const R = this.recherche(), sig = R ? R.villages.join(',') + ':' + R.prime : '';
    if (!force && sig === this.sigAff && this.affW === w) return;
    this.sigAff = sig; this.affW = w;
    // on retire les anciennes, on cloue les nouvelles
    w.props = w.props.filter((q) => !q.avis);
    w.inter = (w.inter || []).filter((i) => i.kind !== 'avis_recherche');
    if (R) for (const v of R.villages) (this.spots[v] || []).forEach((sp, i) => {
      w.props.push({ id: 'affiche_recherche', x: sp.x, y: sp.y, z: sp.z, r: sp.r, avis: v });
      w.inter.push({ kind: 'avis_recherche', id: 'avis_' + v + i, x: sp.x, y: sp.y + 0.45, z: sp.z, name: 'Lire l’avis de recherche', data: { v } });
    });
    farm.dirtyProps = true;
  },
  lireAffiche(it) {
    const R = this.recherche(), v = it && it.data && it.data.v;
    if (!R) { ui.subtitle('', '(Une affiche déchirée. On l’a arrachée.)', 2.5); return; }
    this.styles();
    const s = farm.s, A = this.actifs().filter((C) => this.connait(C, v || R.villages[0]) || (!v && this.connuQuelquePart(C)));
    const L = (A.length ? A : this.actifs().filter((C) => this.connuQuelquePart(C))).map((C) => this.libelle(C));
    const j = Math.min(...this.actifs().filter((C) => this.connait(C, v)).map((C) => C.connu[v]).concat([s.day]));
    ui.open('#reader', `<div class="avis"><div class="avis-t">${s.fem ? 'RECHERCHÉE' : 'RECHERCHÉ'}</div>
      <img class="avis-p" src="${this.portrait()}" alt="">
      <div class="avis-n">${esc(s.prenom || (s.fem ? 'Jeanne' : 'Jean'))}</div>
      <div class="avis-q">${s.fem ? 'fermière de la vieille ferme' : 'fermier de la vieille ferme'}</div>
      <div class="avis-c">${esc(`Pour ${L.join(', ')}.`)}</div>
      <div class="avis-m">PRIME : ${R.prime} pièces</div>
      <div class="avis-s">${esc(`Quiconque ${s.fem ? 'l’aperçoit' : 'l’aperçoit'} est prié d’avertir le garde. La prime peut être réglée à la mairie de ${farm.names.ville}.`)}</div>
      <div class="avis-d">${esc(`Placardé le ${cal.nom(j)} ${j}, ${this.nomA(v || R.villages[0])}.`)}</div></div><button class="close">Refermer</button>`);
    $('#reader .close').onclick = () => ui.close();
  },
  styles() {
    if (this.styled) return;
    this.styled = true;
    const st = document.createElement('style');
    st.textContent = `.avis{text-align:center;font-family:Georgia,serif;color:#2a1e12}
.avis-t{font-size:34px;letter-spacing:.18em;color:#7a1a10;border-bottom:2px solid #7a1a10;margin:0 20% 10px;padding-bottom:2px}
.avis-p{width:132px;height:154px;image-rendering:auto;border:1px solid #6a5a40;box-shadow:0 1px 3px rgba(0,0,0,.25);margin:4px auto 8px;display:block;background:#e8dcb8}
.avis-n{font-size:24px;letter-spacing:.06em}.avis-q{font-style:italic;color:#5a4a36;margin-bottom:8px}
.avis-c{font-size:15px;margin:6px 0}.avis-m{font-size:22px;color:#7a1a10;margin:10px 0 6px;letter-spacing:.05em}
.avis-s{font-size:13px;color:#4a3a28;margin:4px 8%}.avis-d{font-size:12px;color:#7a6a52;font-style:italic;margin-top:8px}
#satchel .q.perdu{opacity:.72}#satchel .q.perdu b{text-decoration:line-through}
#satchel .q.recherche{border-left:3px solid #7a1a10;padding-left:8px}#satchel .q.recherche b{color:#7a1a10}`;
    document.head.appendChild(st);
  },
  // un portrait sommaire, au fusain, d'après ce qu'on a vu du fermier
  portrait() {
    const s = farm.s, key = s.seed + ':' + (s.fem ? 1 : 0) + ':' + (s.prenom || '');
    if (this.portraitK === key && this.portraitU) return this.portraitU;
    const W = 132, H = 154, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const g = cv.getContext('2d'), rnd = mulberry32(hashString(key));
    g.fillStyle = '#e8dcb8'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(90,70,40,${rnd() * 0.06})`; g.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 2, 1); }
    const enc = (a) => { g.strokeStyle = `rgba(34,28,22,${a})`; };
    const ligne = (pts, a, lw) => { enc(a); g.lineWidth = lw || 1.2; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x + (rnd() - 0.5) * 0.8, y + (rnd() - 0.5) * 0.8) : g.moveTo(x, y))); g.stroke(); };
    const cx = W / 2, cy = 70, fw = 30 + rnd() * 5, fh = 40 + rnd() * 4;
    // épaules, cou
    ligne([[14, H], [26, 122], [cx - 14, 110], [cx - 11, cy + fh - 6]], 0.8, 1.6); ligne([[W - 14, H], [W - 26, 122], [cx + 14, 110], [cx + 11, cy + fh - 6]], 0.8, 1.6);
    // visage (ovale repassé plusieurs fois)
    for (let k = 0; k < 3; k++) { enc(0.55); g.lineWidth = 1.3; g.beginPath(); g.ellipse(cx + (rnd() - 0.5), cy + (rnd() - 0.5), fw * (0.97 + rnd() * 0.05), fh * (0.97 + rnd() * 0.05), 0, 0, TAU); g.stroke(); }
    // ombre (hachures sur un côté)
    for (let y = cy - fh * 0.7; y < cy + fh * 0.8; y += 3) ligne([[cx + fw * 0.45, y], [cx + fw * 0.9, y - 6]], 0.25, 1);
    // yeux, sourcils, nez, bouche
    const ey = cy - 6, ex = 11 + rnd() * 2;
    for (const sx of [-1, 1]) { ligne([[cx + sx * ex - 6, ey], [cx + sx * ex, ey - 2.5], [cx + sx * ex + 6, ey]], 0.9, 1.3); g.fillStyle = 'rgba(30,24,18,.9)'; g.beginPath(); g.arc(cx + sx * ex, ey + 0.5, 1.8, 0, TAU); g.fill(); ligne([[cx + sx * ex - 7, ey - 7], [cx + sx * ex + 6, ey - 8.5 + sx]], 0.85, 2); }
    ligne([[cx - 1, ey + 2], [cx - 4, cy + 12], [cx + 3, cy + 14]], 0.75, 1.3);
    ligne([[cx - 9, cy + 23], [cx, cy + 24 + rnd() * 2], [cx + 9, cy + 23]], 0.85, 1.5);
    if (s.fem) {
      // longs cheveux, raie au milieu
      for (let k = 0; k < 16; k++) { const t = k / 15, side = k % 2 ? 1 : -1; ligne([[cx + side * 2, cy - fh - 2], [cx + side * (fw * 0.9 + 4 * t), cy - fh * 0.5], [cx + side * (fw + 5 + 6 * t), cy + 20], [cx + side * (fw + 2 + 10 * t), cy + 52 + 10 * t]], 0.6, 1.3); }
      ligne([[cx - fw * 0.8, cy - fh * 0.55], [cx, cy - fh - 1], [cx + fw * 0.8, cy - fh * 0.55]], 0.7, 2);
    } else {
      // chapeau de paille, barbe courte
      ligne([[cx - fw - 18, cy - fh + 12], [cx + fw + 18, cy - fh + 10]], 0.9, 2.4);
      ligne([[cx - fw + 4, cy - fh + 11], [cx - fw + 8, cy - fh - 16], [cx + fw - 8, cy - fh - 17], [cx + fw - 4, cy - fh + 10]], 0.85, 2);
      for (let y = cy - fh - 12; y < cy - fh + 8; y += 3.5) ligne([[cx - fw + 9, y], [cx + fw - 9, y + 1]], 0.25, 1);
      for (let k = 0; k < 40; k++) { const a = Math.PI * (0.15 + rnd() * 0.7), r = fh * (0.78 + rnd() * 0.22); const x = cx + Math.cos(a) * fw * 0.95, y = cy + Math.sin(a) * r; ligne([[x, y], [x + (rnd() - 0.5) * 2, y + 3 + rnd() * 2]], 0.55, 1); }
    }
    this.portraitK = key; this.portraitU = cv.toDataURL();
    return this.portraitU;
  },

  // ------------------------------------------------------------------ les chasseurs de primes
  majChasseurs(dt, h) {
    const S = this.S(), p = game.player, w = game.world, R = this.recherche();
    // l'arrivée d'un chasseur, le jour prévu, quand on est dehors, loin des villes
    const P = S.prevu;
    if (P && P.day === farm.s.day && h >= P.h && h < 20 && !this.chasseurs.length && R && !p.underground && !game.sleeping && !strange.inEnvers()) {
      const T = w.townInfo, dehors = !T || Math.hypot(p.pos[0] - T.x, p.pos[2] - T.z) > 90;
      if (dehors && !w.covered(...p.eyePos())) {
        for (let k = 0; k < 24; k++) {
          const a = p.yaw + Math.PI + (Math.random() - 0.5) * 2.2, r = 95 + Math.random() * 35;
          const x = p.pos[0] - Math.sin(a) * r, z = p.pos[2] - Math.cos(a) * r;
          if (!w.inside(x, z, 20) || !pointFree(w, x, z, 0.5) || interditDeBatir(x, z)) continue;
          this.chasseurs.push({ soc: 'chasseur', x, z, y: w.heightAt(x, z), heading: 0, hp: 90, move: 0, phase: 0, t: 0, tirT: 3, rig: humanRig(SOC_CHASSEUR_LOOK), cri: false, fin: false });
          S.prevu = null; S.chasseurJour = farm.s.day;
          break;
        }
      }
    }
    for (let i = this.chasseurs.length - 1; i >= 0; i--) {
      const e = this.chasseurs[i];
      e.t += dt; e.stagger = Math.max(0, (e.stagger || 0) - dt); e.attackAnim = Math.max(0, (e.attackAnim || 0) - dt);
      const dx = p.pos[0] - e.x, dz = p.pos[2] - e.z, d = Math.hypot(dx, dz);
      if (e.mort) { e.mortT = (e.mortT || 0) + dt; if (e.mortT > 40 && d > 50) this.chasseurs.splice(i, 1); continue; }
      if (e.fin || !R || h >= 21 || h < 6 || d > 260) { if (d > 90 || e.fin) this.chasseurs.splice(i, 1); else { e.heading = turnToward(e.heading, Math.atan2(-dx, -dz), dt * 3); this.pasDe(e, 2.4, dt, w); } continue; }
      const eye = [e.x, e.y + 1.6, e.z], pe = p.eyePos(), L = Math.hypot(pe[0] - eye[0], pe[1] - eye[1], pe[2] - eye[2]) || 1;
      const vu = d < 80 && !w.raycastBlocks(eye, [(pe[0] - eye[0]) / L, (pe[1] - eye[1]) / L, (pe[2] - eye[2]) / L], L) && !(w.covered(...pe) && game.doorsShutAround(p.pos));
      if (vu && !e.cri && d < 60) { e.cri = true; ui.subtitle('Le chasseur de primes', `${farm.s.prenom || 'Toi'} ! Ta tête vaut ${R.prime} pièces. Rends-toi, et il ne t’arrivera rien.`, 5); }
      e.heading = turnToward(e.heading, Math.atan2(dx, dz), dt * 4);
      const tirer = R.violent;
      if (tirer) {
        if (d > 24 || !vu) this.pasDe(e, d > 50 ? 3.6 : 2.2, dt, w); else e.move = lerp(e.move, 0, dt * 5);
        e.tirT -= dt;
        if (vu && d < 38 && e.tirT <= 0 && e.stagger <= 0) {
          e.tirT = 2.6 + Math.random(); e.attackAnim = 0.4; sound.shot && sound.shot();
          const chance = 0.6 - (p.sprinting ? 0.2 : 0) - (p.crouch > 0.5 ? 0.15 : 0) - d / 120;
          if (Math.random() < chance) play.hurt(24, e, 'Abattu par un chasseur de primes');
          else ui.subtitle('', '(Une balle siffle tout près.)', 1.5);
        }
      } else {
        if (d > 1.5) this.pasDe(e, d > 30 ? 3.8 : 3.2, dt, w);
        else if (!game.sleeping) { this.arreter(e); }
      }
    }
  },
  pasDe(e, sp, dt, w) {
    let nx = e.x + Math.sin(e.heading) * sp * dt, nz = e.z + Math.cos(e.heading) * sp * dt;
    [nx, nz] = w.collideCircle(nx, nz, e.y, e.y + 1.8, 0.3, 0.55, true);
    const g = w.groundAt(nx, nz, e.y + 0.6, 0.6);
    if (g < w.waterLevel - 0.2) return;
    e.x = nx; e.z = nz; e.y = g; e.move = 1; e.run = sp > 3; e.phase += dt * sp * 2.2;
  },
  toucher(e, dmg) {
    if (e.mort) return;
    e.hp -= dmg; e.stagger = 0.5; sound.hurtHuman && sound.hurtHuman(0.85);
    puffAt(e.x, e.y + 1.2, e.z, [140, 20, 20], 8, 1.5, false);
    if (e.hp <= 0) {
      e.mort = true; e.move = 0; sound.scream && sound.scream(0.9);
      const n = 40 + ((Math.random() * 80) | 0); farm.earn(n); sound.coin && sound.coin();
      farm.give('cartouche', 3 + ((Math.random() * 4) | 0)); play.flyer('cartouche', [e.x, e.y + 0.6, e.z], 3);
      ui.subtitle('', `(L’homme s’effondre. Dans sa poche, ${n} pièces, et l’affiche à votre nom, pliée en quatre.)`, 5);
    } else if (!e.cri) e.cri = true;
  },
  draw(buf, sbuf, cam, t) {
    for (const e of this.chasseurs) {
      if (Math.abs(e.x - cam[0]) > 150 || Math.abs(e.z - cam[2]) > 150) continue;
      if (e.mort) {
        const M = new Float32Array(12), R0 = new Float32Array(12), TR = new Float32Array(12);
        poseHuman(e.rig, { move: 0, t, lookY: 0 });
        m34Root(R0, e.x, e.y + 0.15, e.z, e.heading, 1); m34TR(TR, 0, 0, -0.9, Math.PI / 2, 0, 0); m34Mul(M, R0, TR); drawRigM(buf, e.rig, M, 0);
        continue;
      }
      poseHuman(e.rig, { move: e.move, phase: e.phase, run: e.run, t, attack: e.attackAnim > 0 ? e.attackAnim / 0.4 : 0, lookY: 0 });
      drawRig(buf, e.rig, e.x, e.y, e.z, e.heading, 1, e.stagger > 0 ? FX_HI : 0);
      if (sbuf) drawShadow(sbuf, e.x, e.y, e.z, 0.33);
    }
  },
  raycast(o, d, maxDist) {
    let best = null;
    const dh = Math.hypot(d[0], d[2]) || 1e-6;
    for (const e of this.chasseurs) {
      if (e.mort) continue;
      const cx = e.x - o[0], cz = e.z - o[2], tc = (cx * d[0] + cz * d[2]) / (dh * dh);
      if (tc < 0 || tc > maxDist) continue;
      const px = d[0] * tc - cx, pz = d[2] * tc - cz;
      if (px * px + pz * pz > 0.42 * 0.42) continue;
      const y = o[1] + d[1] * tc;
      if (y < e.y - 0.1 || y > e.y + 2.0) continue;
      if (!best || tc < best.t) best = { t: tc, s: e, p: [o[0] + d[0] * tc, y, o[2] + d[2] * tc] };
    }
    return best;
  },

  // ------------------------------------------------------------------ un autre reprend le commerce, le métier
  remplacant(id) {
    for (const k of SOC_SUCCESSION[id] || []) if (npcs.alive(k)) return k;
    return null;
  },
  reprises(n) {
    const out = [];
    for (const mort in SOC_REPRISE) {
      if (npcs.alive(mort) || !npcs.byId[mort]) continue;
      const L = SOC_REPRISE[mort].find(([id]) => npcs.alive(id) && npcs.byId[id].d.shop);
      if (!L || L[0] !== n.id) continue;
      for (const it of L[1]) if (ITEMS[it]) out.push(it);
    }
    return out;
  },
  prixBase(id) {
    for (const D of NPC_DATA) if (D.shop) { const e = (D.shop.sells || []).find(([k]) => k === id); if (e && e[1] > 0) return e[1]; }
    return Math.max(1, (ITEMS[id] && ITEMS[id].price) || 10);
  },
  // (nouvelles) ce qu'un colporteur ou la postière racontent
  nouvelles(n) {
    const S = this.S(), s = farm.s, out = [];
    for (const id in S.morts) {
      const M = S.morts[id], m = npcs.byId[id];
      if (!m || s.day - M.day > 8 || !this.saitMort(n, id)) continue;
      const f = this.fem(id);
      out.push(f ? `${this.nomComplet(id)}, ${m.d.role.toLowerCase()}, est morte le ${cal.nom(M.day)}. ${this.causeTexte(id, M.cause).replace(/^./, (c) => c.toUpperCase())}, à ce qu’on dit.` : `${this.nomComplet(id)}, ${m.d.role.toLowerCase()}, est mort le ${cal.nom(M.day)}. ${this.causeTexte(id, M.cause).replace(/^./, (c) => c.toUpperCase())}, à ce qu’on dit.`);
    }
    for (const m of npcs.list) if (m.st.alive && m.st.malade && m !== n) out.push(this.fem(m.id) ? `${m.name} est malade, ${this.nomA(this.villageDe(m.id) || 'valbrume')}. La fièvre. On lui porte du bouillon.` : `${m.name} est malade, ${this.nomA(this.villageDe(m.id) || 'valbrume')}. La fièvre. On lui porte du bouillon.`);
    const K = this.crimesSus(n);
    if (K.length) {
      const R = this.recherche();
      out.push(`On placarde votre portrait ${R.villages.map((v) => this.nomA(v)).join(', ')}. ${R.prime} pièces. Moi, je vends des cartes, je ne vends personne.`);
    }
    const P = ['Des bergers ont vu un géant sur les crêtes de l’est, à l’aube. Il regardait le soleil se lever.', 'Aux Sources, l’eau a encore fumé toute la nuit. Le docteur dit que c’est bon signe.', 'À la bibliothèque, on rend ses livres à l’heure. Toujours.', 'Le marché de la ville a été maigre. Le prochain sera meilleur, on dit ça à chaque fois.', 'On a entendu frapper dans la falaise, du côté de la Combe. Trois coups, un coup, trois coups.'];
    if (out.length < 3) out.push(P[(s.day + n.id.length) % P.length]);
    return out.slice(0, 3);
  },
};
let _socGuardAttack = null;

// ============================================================================
//  BRANCHEMENTS
// ============================================================================
// ---------------------------------------------------------------- mort, blessure, reconnaissance
{
  const _kill = npcs.kill.bind(npcs);
  npcs.kill = function (n, by, wit) {
    if (!n || !n.st || !n.st.alive) return;
    const sc = sound.scream;
    if (societe._silence) sound.scream = () => {};
    try { _kill(n, by, wit || []); } finally { sound.scream = sc; }
    if (!farm.s) return;
    societe.surMort(n, by || 'inconnu');
    if (by === 'joueur') {
      // l'assassin démasqué (masque en main, ou déjà révélé) : justice est faite
      const juste = strange.isKiller(n.id) && (farm.s.flags.killerRevealed === n.id || farm.count('masque') > 0);
      if (juste) { const S = societe.S(); S.crimes.push({ id: 'k' + (++S.n), type: 'meurtre', victime: n.id, x: Math.round(n.x), z: Math.round(n.z), day: farm.s.day, h: 0, prime: 0, temoins: [], connu: {}, porte: {}, leve: 'justice', lieu: societe.villageDe(n.id) }); farm.s.flags.killerRevealed = n.id; }
      else societe.crime({ type: 'meurtre', victime: n.id, x: n.x, z: n.z, temoins: wit || [] });
    }
  };
  const _hurt = npcs.hurt.bind(npcs);
  npcs.hurt = function (n, dmg, by) {
    const vivant = n && n.st && n.st.alive;
    _hurt(n, dmg, by);
    if (vivant && by === 'joueur' && n.st.alive && farm.s) societe.crime({ type: 'agression', victime: n.id, x: n.x, z: n.z });
  };
  // « le meurtrier est connu » : seulement là où on le sait, et tant que la prime court
  npcs.murdererKnown = function () {
    const n = societe.ctx;
    if (!farm.s) return false;
    if (n) {
      if (!societe.ctxShop) return societe.redoute(n);
      const K = societe.crimesSus(n);
      return n.d.nomade ? K.some((C) => CRIME_DEF[C.type].violent) : K.length > 0;
    }
    const R = societe.recherche();
    return !!(R && R.meurtre);
  };
  npcs.hostile = function (n) {
    if (!n.st.alive || n.talking || !farm.s) return false;
    const K = societe.crimesSus(n);
    if (!K.length) return false;
    return n.d.id === 'garde' ? !n.st.malade : K.some((C) => C.type === 'meurtre');
  };
  _socGuardAttack = npcs.guardAttack.bind(npcs);
  // le garde : sommation d'abord (on peut se rendre), les coups ensuite
  npcs.guardAttack = function (n, dt, w, c) {
    if (!n.poursuite || n.poursuite < game.time) { n.poursuite = game.time + 18; n.vuT = game.time; }
    return true;
  };
  // pendant une poursuite, c'est la société qui mène le garde (la routine attend)
  const _upd = npcs.update.bind(npcs);
  npcs.update = function (dt, w, c) {
    const P = [];
    for (const n of this.list) if (!n.hunting && !n.vanished && n.st.alive && !n.talking && ((n.poursuite || 0) > game.time || (n.alerte && n.alerte.t > game.time) || n.sommeT)) { n.hunting = true; P.push(n); }
    try { _upd(dt, w, c); } finally { for (const n of P) n.hunting = false; }
    for (const n of P) societe.poursuivre(n, dt, w, c);
  };
  const _sg = npcs.shortGreet.bind(npcs);
  npcs.shortGreet = function (n) {
    const c0 = societe.ctx; societe.ctx = n;
    try {
      if (farm.s && n.st.malade && Math.random() < 0.6) return pick(SOC_MALADE);
      if (farm.s && Math.random() < 0.25) { const id = Object.keys(societe.S().morts).find((k) => farm.s.day - societe.S().morts[k].day <= 3 && societe.saitMort(n, k)); if (id) return fmtLine(pick(SOC_NOUVELLES_MORT), n, { victime: societe.nomComplet(id) }); }
      return _sg(n);
    } finally { societe.ctx = c0; }
  };
  // la maison d'un mort : scellés (sauf les lieux publics)
  const _doors = npcs.updateDoors.bind(npcs);
  npcs.updateDoors = function (w, instant) {
    _doors(w, instant);
    if (!farm.s || strange.redNight()) return;
    const S = societe.S();
    for (const dr of w.doors) {
      dr.scelle = false;
      if (!dr.bld || ['ferme', 'poulailler', 'bibliotheque', 'mairie', 'eglise'].includes(dr.bld)) continue;
      const own = this.list.filter((n) => n.d.home === dr.bld);
      if (!own.length || own.some((n) => n.st.alive)) continue;
      if (own.every((n) => S.morts[n.id] && S.morts[n.id].day >= farm.s.day)) continue; // le jour même : on n'a pas encore scellé
      dr.forced = false; dr.scelle = true; dr.locked = true;
      if (dr.open && !this.someoneInDoor(dr)) dr.open = 0;
      if (instant) dr.a = dr.open ? 1.5 : 0;
    }
  };
  const _knock = npcs.knock.bind(npcs);
  npcs.knock = function (dr) {
    if (dr.scelle) {
      if (game.insideBuilding(dr.bld)) { dr.locked = false; dr.open = 1; sound.lock && sound.lock(false); sound.door && sound.door(true); ui.subtitle('', '(Vous tirez le verrou de l’intérieur.)', 2.5); return; }
      sound.knock && sound.knock(2); ui.subtitle('', '(Des scellés de cire noire barrent la porte. Personne ne répondra plus ici.)', 3.5); return;
    }
    // (l'habitant répond au bout de 1,4 s : on lui prête ce qu'il sait juste à ce moment-là)
    const own = this.list.find((n) => n.d.home === dr.bld && n.st.alive && !n.vanished && !n.hunting) || null;
    let c0 = null;
    setTimeout(() => { c0 = societe.ctx; societe.ctx = own; }, 1395);
    setTimeout(() => { societe.ctx = c0; }, 1405);
    return _knock(dr);
  };
}
// ---------------------------------------------------------------- le panneau de la place : les morts n'y sont plus « recherchés », le fermier si
if (HOOKS.inter.affiche) {
  const _aff = HOOKS.inter.affiche;
  HOOKS.inter.affiche = (it) => {
    _aff(it);
    const el = $('#reader .txt');
    if (!el || !farm.s) return;
    const S = societe.S(), paras = el.innerHTML.split('<br><br>');
    const i = paras.findIndex((t) => t.startsWith('AVIS DE RECHERCHE'));
    if (i >= 0) {
      const perdus = npcs.list.filter((n) => n.vanished && n.st.alive), morts = npcs.list.filter((n) => !n.st.alive && S.morts[n.id] && farm.s.day - S.morts[n.id].day <= 12);
      const rep = [];
      if (perdus.length) rep.push(esc('AVIS DE RECHERCHE — ' + perdus.map((n) => n.name + ' ' + n.d.surname).join(', ') + '. Toute personne ayant des nouvelles est priée de se présenter au garde.'));
      if (morts.length) rep.push(esc('AVIS DE DÉCÈS — ' + morts.map((n) => `${n.name} ${n.d.surname} († ${cal.nom(S.morts[n.id].day)} ${S.morts[n.id].day})`).join(', ') + '. Priez pour eux.'));
      paras.splice(i, 1, ...rep);
    }
    const R = societe.recherche();
    if (R && R.villages.includes('valbrume')) { const quoi = societe.actifs().filter((C) => societe.connait(C, 'valbrume')).map((C) => societe.libelle(C)).join(', ');
      paras.unshift(esc(farm.s.fem ? `RECHERCHÉE — ${farm.s.prenom || 'la fermière'}, fermière de la vieille ferme, pour ${quoi}. Prime : ${R.prime} pièces. S’adresser au garde.` : `RECHERCHÉ — ${farm.s.prenom || 'le fermier'}, fermier de la vieille ferme, pour ${quoi}. Prime : ${R.prime} pièces. S’adresser au garde.`)); }
    el.innerHTML = paras.join('<br><br>');
  };
}
// ---------------------------------------------------------------- bêtes d'autrui, cimetière profané
{
  const DOMESTIQUES = new Set(['hen', 'cow', 'sheep', 'pig', 'goat', 'cat', 'donkey', 'goose', 'duck', 'rabbit', 'dog']);
  const _hc = play.hurtCreature.bind(play);
  play.hurtCreature = function (e, dmg, eye) {
    const vivant = !e.dead;
    _hc(e, dmg, eye);
    if (!vivant || !e.dead || e.owner || !farm.s) return;
    const Z = interditDeBatir(e.x, e.z);
    if (!Z) return;
    if (DOMESTIQUES.has(e.kind)) societe.crime({ type: 'vol', x: e.x, z: e.z, detail: 'betail' });
    else if (!e.cfg || !e.cfg.hostile) societe.crime({ type: 'braconnage', x: e.x, z: e.z });
  };
  const _hole = dig.hole.bind(dig);
  dig.hole = function (x, z, save) {
    _hole(x, z, save);
    const C = game.world.lm && game.world.lm.cimetiere;
    if (save && C && Math.hypot(x - C.x, z - C.z) < C.r + 6) {
      const tem = npcs.witnesses(x, z);
      if (tem.length) { societe.crime({ type: 'profanation', x, z, detail: 'cimetiere', temoins: tem }); npcs.say(tem[0], pick(['Vous creusez dans le cimetière ?! Au garde !', 'Sacrilège ! On ne touche pas aux morts !']), 3); }
    }
  };
}
// ---------------------------------------------------------------- les chasseurs de primes se touchent comme les autres ombres
{
  const _ray = strange.raycast.bind(strange);
  strange.raycast = function (o, d, max) {
    const a = _ray(o, d, max), b = societe.raycast(o, d, a ? a.t : max);
    return b && (!a || b.t < a.t) ? b : a;
  };
  const _hit = strange.hit.bind(strange);
  strange.hit = function (e, dmg, from) { if (e && e.soc === 'chasseur') return societe.toucher(e, dmg); return _hit(e, dmg, from); };
}
// ---------------------------------------------------------------- quêtes : on ne propose plus l'impossible
{
  talk.nextQuest = function () {
    const n = this.n, s = farm.s, lvl = npcs.level(n);
    for (const q of n.d.quests) {
      const Q = s.quests[q.id];
      if (Q && (Q.st === 'fait' || Q.st === 'perdu')) continue;
      if (Q && Q.st === 'actif') return null;
      if (societe.impossible(q)) continue;
      if ((q.minAmitie || 0) > lvl) return null;
      if (Q && Q.st === 'refus' && Q.day === s.day) return null;
      return q;
    }
    return null;
  };
}

// ---------------------------------------------------------------- chargement : dialogues, boutique, carnet (en dernier : par-dessus les autres)
HOOKS.load.push((saved) => {
  societe.S(); societe.migrer();
  societe.spots = null; societe.chasseurs = []; societe.arrestation = false; societe.sigAff = '';
  for (const n of npcs.list) { n.poursuite = 0; n.alerte = null; n.sommeT = 0; n.attaque = false; }
  // le guichet de la mairie (on y règle la prime, même sans maire)
  const w = game.world, B = w.bld.mairie;
  if (B && !(w.inter || []).some((i) => i.id === 'guichet_mairie')) {
    const sp = B.spots.work || w.nav.nodes[B.nMid];
    w.inter.push({ kind: 'guichet_mairie', id: 'guichet_mairie', x: sp.x, y: B.y + 1.1, z: sp.z, name: 'Le guichet de la mairie', data: {} });
  }
  societe.majAffiches(true);
  if (societe.hooked) return;
  societe.hooked = true;
  // ---- dialogues
  const _open = talk.open.bind(talk);
  talk.open = function (n) {
    const c0 = societe.ctx; societe.ctx = n;
    try {
      const K = farm.s ? societe.crimesSus(n) : [];
      if (K.length && (n.d.id === 'garde' || n.d.id === 'maire')) return societe.vueRecherche(n, K);
      // (les colporteurs ne refusent que le sang : pour le reste, ils commercent, et ils en parlent)
      if (K.length && !(n.d.nomade && !K.some((C) => CRIME_DEF[C.type].violent))) {
        this.n = n; n.talking = true; n.speakT = 2;
        const L = n.d.lines, meurtre = K.some((C) => C.type === 'meurtre');
        const ami = !meurtre && npcs.level(n) >= 8;
        const t = meurtre ? (Math.random() < 0.5 ? L.meurtre : pick(L.greet.peur)) : ami ? 'Je ne devrais pas vous parler. Il y a une affiche à votre nom. Réglez ça, je vous en prie.' : pick(L.greet.froid);
        return this.view(t, [{ label: 'Partir', act: 'bye' }]);
      }
      const met = n.st.met, d0 = n.st.deuil;
      const v = _open(n);
      if (!v || !farm.s) return v;
      n.st.deuils = n.st.deuils || {};
      if (n.st.deuil !== d0 && n.st.deuil) n.st.deuils[n.st.deuil] = farm.s.day;
      else if (met && !(n.st.anger > 0)) {
        const id = societe.deuilAParler(n);
        if (id && n.d.lines.disparu) { n.st.deuils[id] = farm.s.day; n.st.deuil = id; v.text = fmtLine(n.d.lines.disparu, n, { victime: societe.nomComplet(id) }); n.speakT = Math.min(6, 1 + v.text.length * 0.04); }
        else if (n.st.malade) { v.text = fmtLine(pick(SOC_MALADE), n); n.speakT = Math.min(6, 1 + v.text.length * 0.04); }
      }
      return v;
    } finally { societe.ctx = c0; }
  };
  const _options = talk.options.bind(talk);
  talk.options = function () {
    const n = this.n, opts = _options();
    if (!n || !farm.s) return opts;
    const i = opts.findIndex((o) => o.act === 'bye'), extra = [];
    if (n.d.nomade || n.d.id === 'postiere') extra.push({ label: 'Quelles nouvelles ?', act: 'soc:nouvelles' });
    if (n.st.malade && SOC_REMEDES.some((k) => farm.count(k))) extra.push({ label: 'Vous offrir un remède', act: 'soc:remede', quest: true });
    if (societe.crimesSus(n).length && (n.d.id === 'garde' || n.d.id === 'maire')) extra.push({ label: 'Au sujet de la prime…', act: 'soc:prime', quest: true });
    opts.splice(i >= 0 ? i : opts.length, 0, ...extra);
    return opts;
  };
  const _choose = talk.choose.bind(talk);
  talk.choose = function (act) {
    const n = this.n;
    if (n && typeof act === 'string' && act.startsWith('soc:')) return societe.choisir(n, act.slice(4));
    return _choose(act);
  };
  // ---- boutiques : refus, reprises
  const _rs = ui.renderShop.bind(ui);
  ui.renderShop = function () {
    const n = this.shopN, S = n && n.d.shop;
    if (!S) return _rs();
    const c0 = societe.ctx, cs = societe.ctxShop, sells0 = S.sells;
    societe.ctx = n; societe.ctxShop = true;
    const plus = societe.reprises(n).filter((id) => !sells0.some(([k]) => k === id)).map((id) => [id, Math.round(societe.prixBase(id) * 1.2)]);
    if (plus.length) S.sells = sells0.concat(plus);
    try { return _rs(); } finally { S.sells = sells0; societe.ctx = c0; societe.ctxShop = cs; }
  };
  // ---- carnet : quêtes perdues, avis de recherche, gens rencontrés
  const _qh = ui.questHint.bind(ui);
  ui.questHint = function (q, Q, nm) {
    if (Q && Q.st === 'perdu') {
      const m = npcs.byId[Q.qui], f = m && m.d.gender === 'f', who = m ? m.name : nm;
      if (Q.raison === 'prison') return f ? `— ne pourra plus se faire : ${who} a été emmenée à la préfecture.` : `— ne pourra plus se faire : ${who} a été emmené à la préfecture.`;
      return f ? `† — ne pourra plus se faire : ${who} est morte.` : `† — ne pourra plus se faire : ${who} est mort.`;
    }
    return _qh(q, Q, nm);
  };
  const _rsat = ui.renderSatchel.bind(ui);
  ui.renderSatchel = function () {
    _rsat();
    if (this.satTab !== 'carnet' || !farm.s) return;
    societe.styles();
    const body = $('#satchel .body');
    if (!body) return;
    const h4s = Array.from(body.querySelectorAll('h4'));
    const gens = h4s.find((h) => /Gens rencontr/.test(h.textContent));
    const perdus = Array.from(body.querySelectorAll('.q.perdu'));
    if (perdus.length && gens) {
      const h = document.createElement('h4'); h.textContent = 'Perdu à jamais';
      body.insertBefore(h, gens);
      for (const el of perdus) body.insertBefore(el, gens);
    }
    const R = societe.recherche();
    if (R) {
      const d = document.createElement('div'); d.className = 'q recherche';
      d.innerHTML = `<b>${esc('Avis de recherche')}</b><div>${esc(`Prime : ${R.prime} pièces. Affiches ${R.villages.map((v) => societe.nomA(v)).join(', ')}. Pour ${societe.actifs().filter((C) => societe.connuQuelquePart(C)).map((C) => societe.libelle(C)).join(', ')}.`)}</div><div class="hint">${esc('On la règle au garde, au maire ou au guichet de la mairie. Ou l’on attend, longtemps, sans rien faire de mal.')}</div>`;
      body.insertBefore(d, body.firstChild);
    }
    const pp = body.querySelector('.people');
    if (pp) {
      const known = npcs.list.filter((n) => n.st.met);
      if (known.length) pp.innerHTML = known.map((n) => {
        const M = societe.S().morts[n.id], f = n.d.gender === 'f';
        const etat = !n.st.alive ? (M ? ` — † ${cal.nom(M.day)} ${M.day}` : ' — †') : n.st.malade ? (f ? ' — malade, alitée' : ' — malade, alité') : '';
        return `<span class="pp">${esc(n.name)} <i>${esc(n.d.role.toLowerCase() + etat)}</i></span>`;
      }).join('');
    }
  };
});
// ---------------------------------------------------------------- le garde, le maire : la prime
societe.vueRecherche = function (n, K) {
  talk.n = n; n.talking = true; n.speakT = 2;
  const R = this.recherche(), s = farm.s, lib = K.map((C) => this.libelle(C)).join(', ');
  const prime = R ? R.prime : K.reduce((a, C) => a + C.prime, 0);
  const t = n.d.id === 'garde'
    ? (s.fem ? `Vous êtes recherchée pour ${lib}. La prime est de ${prime} pièces. Réglez-la, ou suivez-moi.` : `Vous êtes recherché pour ${lib}. La prime est de ${prime} pièces. Réglez-la, ou suivez-moi.`)
    : `On a placardé votre portrait pour ${lib}. ${prime} pièces, c’est le prix. Réglez-le à la mairie, et l’affaire sera close. Close, pas oubliée.`;
  const opts = [{ label: s.money >= prime ? `Payer la prime (${prime} pièces)` : `Payer la prime (${prime} pièces — vous n’en avez que ${s.money})`, act: 'soc:payer', quest: true }];
  if (n.d.id === 'garde') opts.push({ label: 'Me rendre', act: 'soc:rendre' });
  opts.push({ label: 'Partir', act: 'soc:partir' });
  return talk.view(t, opts);
};
societe.choisir = function (n, a) {
  const s = farm.s;
  if (a === 'nouvelles') { const L = this.nouvelles(n); return talk.view(L.join(' '), talk.options()); }
  if (a === 'prime') return this.vueRecherche(n, this.crimesSus(n));
  if (a === 'payer') {
    const r = this.payer(n.name + ' ' + n.d.surname);
    if (r === 'pauvre') return talk.view(n.d.id === 'garde' ? 'Vous n’avez pas de quoi. Alors ce sera le cachot, ou la route. Choisissez.' : 'Il vous manque de l’argent. La commune ne fait pas crédit aux gens comme vous.', [{ label: n.d.id === 'garde' ? 'Me rendre' : 'Partir', act: n.d.id === 'garde' ? 'soc:rendre' : 'soc:partir' }, { label: 'Partir', act: 'soc:partir' }]);
    npcs.addAmitie(n, 10);
    return talk.view(n.d.id === 'garde' ? 'C’est réglé. On retire les affiches. Que je ne vous y reprenne pas.' : 'Bien. L’argent ira à ceux qui ont souffert. On décroche les affiches. Pour cette fois.', talk.options());
  }
  if (a === 'rendre') { talk.close(); ui.close(true); setTimeout(() => this.arreter(n), 200); return null; }
  if (a === 'partir') {
    if (n.d.id === 'garde' && this.crimesSus(n).length) { n.poursuite = game.time + 18; n.vuT = game.time; n.sommeT = game.time - 1.5; if (this.crimesSus(n).some((C) => CRIME_DEF[C.type].violent)) npcs.say(n, 'Ne faites pas un pas de plus.', 2.5); }
    talk.close(); return null;
  }
  if (a === 'remede') {
    const id = SOC_REMEDES.find((k) => farm.count(k));
    if (!id || !n.st.malade) return talk.view('…', talk.options());
    farm.take(id, 1); n.st.malade.soigne = true; npcs.addAmitie(n, 80); npcs.remember(n, 'soigne');
    sound.quest && sound.quest(true);
    return talk.view(`(${itemName(id)}.) … Ça brûle, et puis ça fait du bien. Merci. Je crois que demain, je serai debout.`, talk.options());
  }
  return talk.view('…', talk.options());
};
// ---------------------------------------------------------------- interactions, chaque jour, chaque image, dessin
HOOKS.inter.avis_recherche = (it) => societe.lireAffiche(it);
HOOKS.interVis.guichet_mairie = () => !!(farm.s && societe.recherche());
HOOKS.inter.guichet_mairie = () => {
  const R = societe.recherche(), h = npcs.hour();
  if (!R) { ui.subtitle('', '(Le guichet. Personne ne vous attend.)', 2); return; }
  if (h < 8 || h >= 18) { ui.subtitle('', '(Le guichet est fermé. Une pancarte : « de huit heures à six heures ».)', 3); return; }
  const qui = npcs.alive('maire') ? npcs.byId.maire.name + ' ' + npcs.byId.maire.d.surname : 'le commis';
  ui.choice('Le guichet de la mairie', `Prime due : ${R.prime} pièces. Vous avez ${farm.s.money} pièces.`, [
    { label: `Payer la prime (${R.prime} pièces)`, fn: () => { const r = societe.payer(qui); ui.close(); ui.subtitle('', r === 'ok' ? '(Le commis compte les pièces deux fois, les range, et tamponne un reçu sans vous regarder.)' : '(Vous n’avez pas de quoi payer.)', 4); } },
    { label: 'Partir', fn: () => ui.close() },
  ]);
};
HOOKS.day.push(() => { if (farm.s) societe.jour(); });
HOOKS.update.push((dt, eye, basis, sky, playing) => { if (farm.s) societe.update(dt, playing); });
HOOKS.draw.push((buf, sbuf, cam, t) => { if (societe.chasseurs.length) societe.draw(buf, sbuf, cam, t); });
// on se rend au chasseur de primes (E)
HOOKS.target.push((eye, f, cand) => {
  for (const e of societe.chasseurs) {
    if (e.mort) continue;
    const dx = e.x - eye[0], dz = e.z - eye[2], d = Math.hypot(dx, dz);
    if (d > 2.6 || (dx * f[0] + dz * f[2]) / (d || 1) < 0.6) continue;
    cand({ kind: 'hook', use: () => societe.arreter(e) }, d);
  }
});
