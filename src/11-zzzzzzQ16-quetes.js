// ============================================================================
//  DES QUÊTES POUR TOUT LE MONDE (Q16) : le jeu. Données : 05-zzzzzzQ16-quetes.js.
//  - Les habitants : leurs nouvelles quêtes rejoignent d.quests ; on leur
//    apprend deux sortes de plus ('aller', 'chasse'), les fins à choix, et les
//    remises et messages venus des autres (« Remettre : … »).
//  - Les autres (Q16_PNJ, les anonymes de Basse-Fosse) : leurs quêtes passent
//    par LEUR dialogue — une ligne de plus dans leur panneau (« Avez-vous
//    besoin d'aide ? », « « Titre » », « Remettre : … ») ; ceux qui ne parlent
//    que par sous-titres (le voiturier, le crieur, les gens d'en bas) ouvrent un
//    panneau, seulement quand il y a quelque chose (une proposition : une fois
//    par jour, refusée ou non).
//  État : farm.s.q16 = { v, Q: { id: { st ('actif'|'fait'|'refus'), day, step, pos, base, choix, done } }, vu: { clé: jour } }
//  API : q16 (S, P, cles, def, options, proposer, accepter, finir, peutFinir, progres, hint, stats).
// ============================================================================
// ---------------------------------------------------------------- les habitants : leurs quêtes en plus
for (const id in Q16_HABITANTS) {
  const d = NPC_BY_ID[id];
  if (!d) continue;
  if (!Array.isArray(d.quests)) d.quests = [];
  for (const q of Q16_HABITANTS[id]) if (!d.quests.some((x) => x.id === q.id)) d.quests.push(q);
}

const q16 = {
  ctx: null, ctxA: null, t: 0, _gen: null, _genSeed: null, _idx: null,

  S() {
    const s = farm.s;
    if (!s.q16 || typeof s.q16 !== 'object') s.q16 = { v: 1, Q: {} };
    if (!s.q16.Q || typeof s.q16.Q !== 'object') s.q16.Q = {};
    if (!s.q16.vu || typeof s.q16.vu !== 'object') s.q16.vu = {};
    return s.q16;
  },
  // les anonymes de Basse-Fosse : un modèle chacun, toujours le même pour une partie
  generer() {
    const seed = (farm.s && farm.s.seed) | 0;
    if (this._gen && this._genSeed === seed) return this._gen;
    const G = {};
    for (const A of Q16_V5_ANONYMES) {
      const M = q16Modele(seed, A);
      G['v5:' + A.id] = { nom: A.nom, ou: 'Basse-Fosse', v5: A.id, anonyme: true, quetes: [Object.assign({}, M, { id: 'q16_v5_' + A.id })] };
    }
    this._gen = G; this._genSeed = seed; this._idx = null;
    return G;
  },
  P(key) { return Q16_PNJ[key] || this.generer()[key] || null; },
  cles() { return Object.keys(Q16_PNJ).concat(Object.keys(this.generer())); },
  index() {
    this.generer();
    if (this._idx) return this._idx;
    const I = {};
    for (const key of this.cles()) for (const q of this.P(key).quetes) I[q.id] = { q, key };
    return (this._idx = I);
  },
  def(id) { const r = this.index()[id]; return r ? r.q : null; },
  qui(id) { const r = this.index()[id]; return r ? r.key : null; },
  Q(id) { return this.S().Q[id] || null; },
  f(t) { try { return fmtLine(t, null); } catch (e) { return String(t || ''); } },
  cap(t) { return t ? t.charAt(0).toUpperCase() + t.slice(1) : t; },

  // ------------------------------------------------------------- qui est qui
  nomDe(key) {
    if (NPC_BY_ID[key]) return npcs.nameOf(key);
    const P = this.P(key);
    if (!P) return key;
    if (P.bete && typeof betesParlantes !== 'undefined') { try { return betesParlantes.titre(P.bete); } catch (e) { /* rien */ } }
    if (P.sout) { const e = this.soutE(P.sout); if (e) { try { return soutTerres.nom(e); } catch (er) { /* rien */ } } }
    return this.cap(P.nom);
  },
  soutE(k) { try { return (soutTerres.list || []).find((e) => e.k === k) || null; } catch (e) { return null; } },
  v5E(id) { try { return (habitantsV5.L || []).find((e) => e.id === id) || null; } catch (e) { return null; } },
  // vivant (ou encore là) : sinon ses quêtes sont perdues
  vivant(key) {
    if (NPC_BY_ID[key]) return npcs.alive(key);
    const P = this.P(key);
    if (!P) return false;
    try {
      if (P.bete) return !betesParlantes.S().morts.some((m) => m.id === P.bete);
      if (P.v5) { const S = catacombesV5.S(); return !(S.morts && S.morts[P.v5]) && S.fin !== 'remontee' && S.fin !== 'extinction' && !(P.v5 === 'greffier' && S.fin === 'compte'); }
      if (P.sout) return !(soutTerres.S().mort || {})[P.sout];
      if (key === 'aieule') { const S = gobelins.S(); return !(S && S.aieule > 0) && !gobelins.partis(); }
      if (key === 'thibaud') { const T = chateauV4.S().thibaud; return !(T && (T.etat === 'bout' || T.etat === 'parti')); }
      if (key === 'dame') { const D = chateauV4.S().dame; return !(D && D.fin); }
    } catch (e) { /* un monde pas encore chargé : on ne sait pas, on dit oui */ }
    return true;
  },
  // peut-on lui parler de ça, maintenant (compté chez ceux d'en bas, admis au Dessous…)
  peut(key) {
    const P = this.P(key);
    if (!P || !farm.s || !this.vivant(key)) return false;
    try {
      if (P.v5) { const e = this.v5E(P.v5); return !habitantsV5.etranger() && !(e && (e.mort || e.couche || e.pose === 'couche')); }
      if (P.sout) return soutTerres.admis();
      if (P.bete) return !betesParlantes.muet(P.bete);
    } catch (e) { return false; }
    return true;
  },
  titre(key) {
    const P = this.P(key);
    try {
      if (key === 'dame') return V4_DAME.titre;
      if (key === 'thibaud') return V4_THIBAUD.titre;
      if (key === 'aieule') return GOB_T.aieule.titre;
      if (key === 'veilleuse') return 'La veilleuse';
      if (key === 'diseuse') return 'Mère Ysaure';
      if (key === 'violoneux' && typeof ACT_NOMS !== 'undefined') return ACT_NOMS.violon;
      if (key === 'crieur' && typeof ACT_NOMS !== 'undefined') return ACT_NOMS.crieur;
    } catch (e) { /* rien */ }
    return this.nomDe(key) || (P && this.cap(P.nom)) || '';
  },
  // dire, dans le panneau de celui qui parle
  dire(key, texte, opts) {
    const P = this.P(key), t = this.f(texte);
    if (P && P.bete && typeof betesParlantes !== 'undefined') { betesParlantes.dire(P.bete, t, opts); return; }
    ui.choice(this.titre(key), t, opts);
  },
  partir(key) {
    const P = this.P(key);
    if (P && P.bete && typeof betesParlantes !== 'undefined') return { label: BP_MOTS.bye, fn: () => betesParlantes.quitter(P.bete) };
    return { label: 'Partir', fn: () => ui.close() };
  },

  // ------------------------------------------------------------- les quêtes
  // impossible : le destinataire n'est plus (et rien n'a encore été remis)
  impossible(q, Q) {
    if ((q.type === 'livrer' || q.type === 'parler') && q.a && !(Q && Q.step)) return !this.vivant(q.a);
    return false;
  },
  prochaine(key) {
    const P = this.P(key), S = this.S(), s = farm.s;
    if (!P) return null;
    for (const q of P.quetes) {
      const Q = S.Q[q.id];
      if (Q && Q.st === 'fait') continue;
      if (Q && Q.st === 'actif') return null;
      if (this.impossible(q, Q)) continue;
      if (q.apres && !(S.Q[q.apres] && S.Q[q.apres].st === 'fait')) return null;
      if (P.bete && !this.serviceRendu(P.bete)) return null;
      if (Q && Q.st === 'refus' && Q.day === s.day) return null;
      return q;
    }
    return null;
  },
  serviceRendu(id) { try { return betesParlantes.B(id).sv === 2; } catch (e) { return false; } },
  tableau(k) { try { return (chasse.S().tableau || {})[k] || 0; } catch (e) { return 0; } },
  progres(q, Q) { return Math.max(0, this.tableau(q.bete) - ((Q && Q.base) || 0)); },
  peutFinir(q, Q) {
    if (!Q || Q.st !== 'actif') return false;
    switch (q.type) {
      case 'apporter': return farm.has(q.need);
      case 'trouver': return farm.count(q.objet) > 0;
      case 'chasse': return this.progres(q, Q) >= (q.n || 1);
      default: return (Q.step || 0) >= 1;
    }
  },
  // les choix d'une quête qu'on peut finir, ou bien les lignes de son panneau
  options(key) {
    if (!farm.s || !this.peut(key)) return [];
    const S = this.S(), O = [], P = this.P(key);
    // ce qu'on lui apporte de la part d'un autre
    for (const id in S.Q) {
      const Q = S.Q[id], q = this.def(id);
      if (!q || Q.st !== 'actif' || Q.step || q.a !== key) continue;
      if (q.type === 'livrer' && farm.count(q.objet)) O.push({ label: 'Remettre : ' + itemName(q.objet), quest: true, fn: () => this.remettre(key, id) });
      if (q.type === 'parler') O.push({ label: 'Un message de ' + this.nomDe(this.qui(id)), quest: true, fn: () => this.remettre(key, id) });
    }
    // sa quête en cours, ou celle qu'il propose
    const act = P.quetes.find((q) => { const Q = S.Q[q.id]; return Q && Q.st === 'actif'; });
    if (act) O.push({ label: '« ' + act.title + ' »', quest: true, fn: () => this.rapport(key, act) });
    else { const q = this.prochaine(key); if (q) O.push({ label: P.aide || 'Avez-vous besoin d’aide ?', offre: true, fn: () => this.proposer(key, q) }); }
    return O;
  },
  proposer(key, q) {
    this.S().vu[key] = farm.s.day;
    this.dire(key, q.texte.offre, [
      { label: 'D’accord, je m’en charge', fn: () => { this.accepter(q.id); this.dire(key, q.texte.accepte, [this.partir(key)]); } },
      { label: 'Pas maintenant', fn: () => { this.S().Q[q.id] = { st: 'refus', day: farm.s.day }; const L = this.partir(key); L.fn(); } },
    ]);
  },
  accepter(id) {
    const q = this.def(id);
    if (!q) return false;
    const s = farm.s, Q = this.S().Q[id] = { st: 'actif', day: s.day, step: 0 };
    if (q.type === 'livrer' && q.objet) farm.give(q.objet, 1);
    if (q.type === 'chasse') Q.base = this.tableau(q.bete);
    if (q.type === 'trouver') { this.placer(q, Q); this.poser(q, Q); }
    sound.quest && sound.quest();
    return true;
  },
  // l'objet à trouver : un endroit au hasard dans le lieu, hors de l'eau (comme pour les habitants)
  placer(q, Q) {
    const w = game.world, L = (w.lm && (w.lm[q.lieu] || w.lm.ferme)) || { x: 0, z: 0, r: 10 };
    for (let k = 0; k < 60; k++) {
      const a = Math.random() * TAU, d = (L.r || 10) * (0.3 + Math.random() * 0.6), x = L.x + Math.cos(a) * d, z = L.z + Math.sin(a) * d;
      if (w.heightAt(x, z) < w.waterLevel + 0.3) continue;
      Q.pos = [Math.round(x * 10) / 10, Math.round(z * 10) / 10];
      break;
    }
    if (!Q.pos) Q.pos = [L.x + 2, L.z + 2];
  },
  poser(q, Q) {
    if (!Q.pos || farm.count(q.objet)) return;
    try { quests.spawnFind(q, Q); } catch (e) { console.error(e); }
  },
  rapport(key, q) {
    const Q = this.Q(q.id);
    if (!this.peutFinir(q, Q)) { this.dire(key, q.texte.attente, [this.partir(key)]); return; }
    if (q.choix && q.choix.length) {
      this.dire(key, q.texte.fin, q.choix.map((c, i) => ({ label: c.label, fn: () => { this.finir(q.id, i); this.dire(key, c.texte, [this.partir(key)]); } })));
      return;
    }
    this.finir(q.id);
    this.dire(key, q.texte.fin, [this.partir(key)]);
  },
  finir(id, ci) {
    const q = this.def(id), Q = this.Q(id), s = farm.s;
    if (!q || !this.peutFinir(q, Q)) return false;
    const C = q.choix && q.choix[ci | 0];
    if (q.type === 'apporter' && !q.garde) for (const k in q.need) farm.take(k, q.need[k]);
    if (q.type === 'trouver' && !(C && C.garde)) farm.take(q.objet, 1);
    Q.st = 'fait'; Q.done = s.day;
    if (C) Q.choix = ci | 0;
    const R = (C ? C.reward : q.reward) || {};
    if (R.argent) { farm.earn(R.argent); sound.coin && sound.coin(); }
    if (R.objets) for (const k in R.objets) if (ITEMS[k] && R.objets[k] > 0) farm.give(k, R.objets[k]);
    const P = this.P(this.qui(id));
    if (P && P.bete) { try { betesParlantes.B(P.bete).conf += 2; } catch (e) { /* rien */ } }
    if (s.rep) s.rep.hero = (s.rep.hero || 0) + 1;
    sound.quest && sound.quest(true);
    return true;
  },
  // remettre un objet, porter un message, à celui qui le reçoit (un des autres)
  remettre(key, id) {
    const q = this.def(id), Q = this.Q(id);
    if (!q || !Q || Q.step) return;
    if (q.type === 'livrer' && !farm.take(q.objet, 1)) return;
    Q.step = 1;
    this.dire(key, q.texte.recu, [this.partir(key)]);
  },

  // ------------------------------------------------------------- dans le panneau des autres
  // pendant fn, le premier panneau (ui.choice) de celui qui parle reçoit les lignes des quêtes ; o.titre et o.delai :
  // un panneau qui s'ouvre un peu plus tard (la Dame) ; o.repli : sans panneau, en ouvrir un s'il y a quelque chose
  avec(key, fn, o) {
    const c0 = this.ctx, c = this.ctx = { key, fait: false };
    if (o && o.delai) this.ctxA = { key, titre: o.titre, jusqua: Date.now() + o.delai };
    let r;
    try { r = fn(); } finally { this.ctx = c0; }
    if (o && o.repli && !c.fait && !(ui.panel === '#choice')) this.devant(key);
    return r;
  },
  // les lignes, glissées avant la dernière (« Partir »)
  injecter(title, opts) {
    let c = this.ctx;
    if (!c || c.fait) {
      const A = this.ctxA;
      if (!A || Date.now() > A.jusqua || (A.titre && A.titre !== title)) return opts;
      this.ctxA = null; c = { key: A.key };
    }
    c.fait = true;
    if (!Array.isArray(opts)) return opts;
    let O = [];
    try { O = this.options(c.key); } catch (e) { console.error(e); }
    if (!O.length) return opts;
    const out = opts.slice();
    out.splice(Math.max(0, out.length - 1), 0, ...O.map(({ label, fn }) => ({ label, fn })));
    return out;
  },
  // un panneau pour ceux qui ne parlent qu'en sous-titres : seulement s'il y a quelque chose ; une proposition, une
  // fois par jour ; suite : une ligne de plus (le crieur : « Écouter les nouvelles »)
  devant(key, suite) {
    const O = this.options(key);
    if (!O.length) return false;
    const S = this.S(), offres = O.filter((o) => o.offre), autres = O.filter((o) => !o.offre);
    if (!autres.length) {
      if (S.vu[key] === farm.s.day) return false;
      const q = this.prochaine(key);
      if (!q) return false;
      this.proposer(key, q);
      return true;
    }
    const opts = autres.concat(offres).map(({ label, fn }) => ({ label, fn }));
    if (suite) opts.push(suite);
    opts.push(this.partir(key));
    ui.choice(this.titre(key), '', opts);
    return true;
  },

  // ------------------------------------------------------------- se rendre quelque part (les autres, et 'aller' des habitants)
  heureOk(m, h) {
    if (m === 'nuit') return h >= 21.5 || h < 4;
    if (m === 'aube') return h >= 4.5 && h < 7.5;
    if (m === 'soir') return h >= 18 && h < 21.5;
    return true;
  },
  surPlace(q, Q, p, h, w) {
    const L = w.lm && w.lm[q.lieu];
    if (!L) return false;
    if (!this.heureOk(q.moment, h)) { Q.stay = 0; return false; }
    if (Math.hypot(p.pos[0] - L.x, p.pos[2] - L.z) < Math.max(12, Math.min(L.r || 0, 40))) {
      Q.stay = (Q.stay || 0) + 1;
      if (Q.stay >= (q.type === 'enquete' ? 6 : 2)) {
        Q.step = 1; Q.stay = 0;
        if (q.texte && q.texte.vu) ui.subtitle('', this.f(q.texte.vu), 5);
        else if (q.type === 'enquete' && typeof strange !== 'undefined') strange.glitchT = Math.max(strange.glitchT || 0, 0.6);
        sound.quest && sound.quest();
        return true;
      }
    } else Q.stay = 0;
    return false;
  },
  update(dt) {
    if (!farm.s || !game.world || !game.player) return;
    this.t -= dt;
    if (this.t > 0) return;
    this.t = 1;
    // (dans la Zone, la cité, une vision : les lieux de la vallée ne sont pas là)
    if ((typeof zone !== 'undefined' && zone.dedans) || (typeof mondes !== 'undefined' && mondes.cur)) return;
    const s = farm.s, p = game.player, w = game.world, h = npcs.hour();
    for (const id in Q16_HABITANTS) for (const q of Q16_HABITANTS[id]) {
      if (q.type !== 'aller') continue;
      const Q = s.quests[q.id];
      if (Q && Q.st === 'actif' && !Q.step) this.surPlace(q, Q, p, h, w);
    }
    const S = this.S();
    for (const id in S.Q) {
      const Q = S.Q[id];
      if (Q.st !== 'actif' || Q.step) continue;
      const q = this.def(id);
      if (q && (q.type === 'aller' || q.type === 'enquete')) this.surPlace(q, Q, p, h, w);
    }
  },

  // ------------------------------------------------------------- le carnet
  hint(q, Q, key) {
    const nm = this.nomDe(key), L = (k) => LIEU_NAMES[k] || k;
    if (Q.st === 'fait') return 'Terminé.';
    if (!this.vivant(key) || this.impossible(q, Q)) return '† — ne pourra plus se faire.';
    const quand = q.moment === 'nuit' ? 'la nuit' : q.moment === 'aube' ? 'à l’aube' : q.moment === 'soir' ? 'le soir' : '';
    switch (q.type) {
      case 'apporter': return 'Apporter ' + Object.keys(q.need).map((k) => q.need[k] + ' × ' + (typeof ITEM_GROUPS !== 'undefined' && ITEM_GROUPS[k] ? GROUP_NAMES[k] : itemName(k).toLowerCase()) + ` (${farm.count(k)})`).join(', ') + ' à ' + nm + '.';
      case 'livrer': return Q.step ? 'Remis. Retourner voir ' + nm + '.' : 'Remettre « ' + itemName(q.objet) + ' » à ' + this.nomDe(q.a) + '.';
      case 'parler': return Q.step ? 'Message transmis. Retourner voir ' + nm + '.' : 'Porter un message à ' + this.nomDe(q.a) + '.';
      case 'trouver': return farm.count(q.objet) ? 'Trouvé. Le rapporter à ' + nm + '.' : 'Chercher « ' + itemName(q.objet) + ' » vers ' + L(q.lieu) + '.';
      case 'chasse': { const n = q.n || 1, k = Math.min(n, this.progres(q, Q)); return k >= n ? 'Fait. Retourner voir ' + nm + '.' : 'Abattre ' + ((typeof CHASSE_NOMS !== 'undefined' && CHASSE_NOMS[q.bete]) || q.bete) + ` (${k}/${n}).`; }
      case 'aller': case 'enquete': return Q.step ? 'Vu. Retourner voir ' + nm + '.' : 'Se rendre ' + (quand ? quand + ' ' : '') + 'vers ' + L(q.lieu) + (q.type === 'enquete' ? ' et observer.' : '.');
    }
    return '';
  },
  // pour les essais et l'équilibrage : qui a combien de quêtes
  stats() {
    const out = {};
    for (const d of NPC_DATA) out[d.id] = (d.quests || []).length;
    // une bête qui parle : son service (11-zzzzP-betes.js), plus la quête d'ici s'il y en a une
    if (typeof BP_ORDRE !== 'undefined') for (const id of BP_ORDRE) out['bete:' + id] = (BP_BETES[id] && BP_BETES[id].service ? 1 : 0);
    for (const key of this.cles()) out[key] = (out[key] || 0) + this.P(key).quetes.length;
    return out;
  },
};

// ---------------------------------------------------------------- les habitants : 'aller', 'chasse', les fins à choix, les remises
{
  const _sf = quests.spawnFind.bind(quests);
  quests.spawnFind = function (q, Q) {
    _sf(q, Q);
    const f = q && Q16_PROP[q.objet];
    if (f) { const p = game.world.props.find((x) => x.questFind === q.id); if (p) { p.id = f; farm.dirtyProps = true; } }
  };
  const _acc = quests.accept.bind(quests);
  quests.accept = function (q, n) {
    _acc(q, n);
    const Q = farm.s.quests[q.id];
    if (q.type === 'chasse' && Q) Q.base = q16.tableau(q.bete);
  };
  const _cc = quests.canComplete.bind(quests);
  quests.canComplete = function (q) {
    if (q && (q.type === 'aller' || q.type === 'chasse')) {
      const Q = farm.s.quests[q.id];
      if (!Q || Q.st !== 'actif') return false;
      return q.type === 'aller' ? (Q.step || 0) >= 1 : q16.progres(q, Q) >= (q.n || 1);
    }
    return _cc(q);
  };
  const _opt = talk.options.bind(talk);
  talk.options = function () {
    const n = this.n, opts = _opt();
    if (!n || !farm.s) return opts;
    const S = q16.S(), extra = [];
    for (const id in S.Q) {
      const Q = S.Q[id], q = q16.def(id);
      if (!q || Q.st !== 'actif' || Q.step || q.a !== n.id) continue;
      if (q.type === 'livrer' && farm.count(q.objet)) extra.push({ label: 'Remettre : ' + itemName(q.objet), act: 'q16r:' + id, quest: true });
      if (q.type === 'parler') extra.push({ label: 'Un message de ' + q16.nomDe(q16.qui(id)), act: 'q16r:' + id, quest: true });
    }
    if (extra.length) { const i = opts.findIndex((o) => o.act === 'bye'); opts.splice(i >= 0 ? i : opts.length, 0, ...extra); }
    return opts;
  };
  const _ch = talk.choose.bind(talk);
  talk.choose = function (act) {
    const n = this.n;
    if (n && typeof act === 'string') {
      if (act.startsWith('q16r:')) {
        const id = act.slice(5), q = q16.def(id), Q = q16.Q(id);
        if (!q || !Q || Q.st !== 'actif' || Q.step) return this.view('…', this.options());
        if (q.type === 'livrer' && !farm.take(q.objet, 1)) return this.view('…', this.options());
        Q.step = 1;
        npcs.addAmitie(n, 20);
        return this.view(q.texte.recu, this.options());
      }
      if (act.startsWith('q:')) {
        const q = n.d.quests.find((x) => x.id === act.slice(2));
        if (q && q.choix && quests.canComplete(q)) return this.view(q.texte.fin, q.choix.map((c, i) => ({ label: c.label, act: 'q16c:' + q.id + ':' + i, quest: true })));
      }
      if (act.startsWith('q16c:')) {
        const [, id, k] = act.split(':'), q = n.d.quests.find((x) => x.id === id), c = q && q.choix && q.choix[+k];
        if (!c || !quests.canComplete(q)) return this.view('…', this.options());
        const R0 = q.reward;
        q.reward = c.reward || {};
        try { quests.complete(q, n); } finally { q.reward = R0; }
        farm.s.quests[q.id].choix = +k;
        return this.view(c.texte, this.options());
      }
    }
    return _ch(act);
  };
}

// ---------------------------------------------------------------- les autres : leurs panneaux
{
  const env = (obj, nom, key, o) => {
    if (!obj || typeof obj[nom] !== 'function') return;
    const f = obj[nom];
    obj[nom] = function (...a) {
      const k = typeof key === 'function' ? key.apply(this, a) : key;
      if (!k || !farm.s) return f.apply(this, a);
      return q16.avec(k, () => f.apply(this, a), o);
    };
  };
  if (typeof activites !== 'undefined') {
    env(activites, 'diseuse', 'diseuse', { repli: true });
    env(activites, 'pourboire', 'violoneux', { repli: true });
    // le crieur ne parle qu'en tambour : ce qu'on a à lui dire passe avant les nouvelles
    const _ln = activites.lireNouvelles;
    activites.lireNouvelles = function (...a) {
      if (farm.s && q16.devant('crieur', { label: 'Écouter les nouvelles', fn: () => _ln.apply(activites, a) })) return;
      return _ln.apply(this, a);
    };
  }
  if (typeof commandes !== 'undefined') {
    const _cp = commandes.parler;
    commandes.parler = function (...a) { const r = _cp.apply(this, a); if (farm.s && this.tour) q16.devant('voiturier'); return r; };
  }
  if (typeof pilules !== 'undefined') env(pilules, 'boutique', 'marchand_joie');
  if (typeof MONDES !== 'undefined' && MONDES.bonbons) env(MONDES.bonbons, 'audience', 'roi_sucre');
  if (typeof gobelins !== 'undefined') env(gobelins, 'parlerAieule', 'aieule');
  if (typeof chateauV4 !== 'undefined') {
    env(chateauV4, 'parlerThibaud', 'thibaud');
    env(chateauV4, 'parlerDame', 'dame', { titre: typeof V4_DAME !== 'undefined' ? V4_DAME.titre : null, delai: 2500 });
  }
  if (typeof vgCite !== 'undefined') env(vgCite, 'parler', 'veilleuse');
  if (typeof soutTerres !== 'undefined') env(soutTerres, 'panneau', (e) => (e && e.k ? 'sout:' + e.k : null));
  if (typeof habitantsV5 !== 'undefined') {
    env(habitantsV5, 'greffier', 'v5:greffier');
    env(habitantsV5, 'marchande', (e) => (e && e.id ? 'v5:' + e.id : null));
    const _hp = habitantsV5.parler;
    habitantsV5.parler = function (e) {
      const r = _hp.apply(this, arguments);
      if (farm.s && e && e.role !== 'greffier' && e.role !== 'marchande' && ui.panel !== '#choice') q16.devant('v5:' + e.id);
      return r;
    };
  }
  if (typeof betesParlantes !== 'undefined') {
    const _bo = betesParlantes.options;
    betesParlantes.options = function (id) {
      const O = _bo.apply(this, arguments);
      if (!farm.s || !Q16_PNJ['bete:' + id]) return O;
      const X = q16.options('bete:' + id);
      if (X.length) O.splice(Math.max(0, O.length - 1), 0, ...X.map(({ label, fn }) => ({ label, fn })));
      return O;
    };
  }
}

HOOKS.update.push((dt) => { try { q16.update(dt); } catch (e) { console.error('q16', e); } });
HOOKS.load.push(() => {
  q16.ctx = null; q16.ctxA = null; q16.t = 0; q16._gen = null; q16._idx = null;
  if (!farm.s || !game.world) return;
  const S = q16.S();
  // les objets à trouver des quêtes en cours, posés de nouveau (le monde est régénéré au chargement)
  for (const id in S.Q) {
    const Q = S.Q[id], q = q16.def(id);
    if (q && Q.st === 'actif' && q.type === 'trouver' && Q.pos && !farm.count(q.objet)) q16.poser(q, Q);
  }
});
