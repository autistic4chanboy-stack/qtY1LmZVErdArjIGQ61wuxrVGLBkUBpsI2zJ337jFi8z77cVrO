// ============================================================================
//  LES RÉCITS DES PROCHES (agent K18) — 2. LE MOTEUR
//  - Chaque récit (K18_ARCS) avance d'étape en étape : une étape s'ouvre quand
//    l'habitant est assez ami (min), que son jour est venu (delai, jour) et que
//    ce qu'elle attend est là (att) ; elle se fait en parlant à quelqu'un (une
//    ligne « … » de plus dans son dialogue, des répliques, parfois un choix),
//    ou en allant quelque part (aller, lieu, moment). Ce qui est fait d'avance
//    compte ; un choix est retenu (k.ch) et colore la suite.
//  - Sans impasse : l'habitant du récit meurt (ou est emmené) : le récit
//    s'achève (« deuil », « parti ») ; celui à qui il fallait parler n'est plus :
//    l'étape est sautée (son choix par défaut) ; une étape qui attend un autre
//    récit plus de K18_REGL.attenteMax jours est sautée.
//  - Les suites : lettres à la boîte (quelques jours après), cadeaux, voyages
//    (l'habitant part quelques jours sur la route), scènes (moteur H17, au
//    premier moment tranquille), et ce qui change dans la vallée à la fin d'un
//    récit (liens, conversations entre eux, une boutique, la lumière du phare).
//  - Les saluts : selon l'amitié, le dernier cadeau, la dernière quête, la
//    suite d'une quête d'avant, la ferme, le temps, une partie d'avant, la fin
//    d'un récit, et un cadeau rituel de temps en temps ; les proches viennent
//    parfois voir la ferme l'après-midi (un mot à la boîte si l'on n'y est pas).
//  État : farm.s.k18 = { v, A: { arc: { e, o, j, d: { étape: jour | -1 }, ch: { étape: choix }, l: { étape: 1 },
//         fin, finJ, vus: { scène: jour } } }, courrier: [{ j, de, titre, texte, arc }], voyage: { id: { de, a } },
//         file: [[arc, scène]], vus: { scène: jour }, apres: { quête: 1 }, rit: { arc: jour }, visite, vies: { id: 1 } }
//  API : k18 (S, D, A, etape, courante, faire, lieuVu, finir, jouer, rejouer, ctx, proches, souvenirs, test).
// ============================================================================
const K18_REGL = { attenteMax: 18, visiteEcart: 5, visiteNiveau: 6, visiteChance: 0.5, salut: 0.55, voyageMax: 12 };
const K18_HEURES = { nuit: (h) => h >= 21.5 || h < 4, aube: (h) => h >= 4.5 && h < 7.5, soir: (h) => h >= 18 && h < 21.5, jour: (h) => h >= 7.5 && h < 18 };
const K18_LIENS0 = {}; // les liens d'origine (NPC_DATA), rendus à chaque chargement
const K18_DISC = [];   // les conversations ajoutées (retirées à chaque chargement)

const k18 = {
  t: 0, pretT: 0, auto: false, dlg: null, joue: null, sceneT: 0, caches: [], indiceT: 0, _err: {},
  // ------------------------------------------------------------- l'état
  S() {
    const s = farm.s;
    if (!s) return null;
    let S = s.k18;
    if (!S || typeof S !== 'object' || Array.isArray(S)) S = s.k18 = { v: 1 };
    for (const k of ['A', 'voyage', 'vus', 'apres', 'rit', 'vies']) if (!S[k] || typeof S[k] !== 'object' || Array.isArray(S[k])) S[k] = {};
    for (const k of ['courrier', 'file']) if (!Array.isArray(S[k])) S[k] = [];
    if (!S.visite || typeof S.visite !== 'object') S.visite = { j: 0, last: 0 };
    return S;
  },
  D(id) { return K18_ARCS.find((D) => D.id === id) || null; },
  A(id) {
    const S = this.S();
    let A = S.A[id];
    if (!A || typeof A !== 'object') A = S.A[id] = {};
    for (const k of ['d', 'ch', 'l', 'vus']) if (!A[k] || typeof A[k] !== 'object' || Array.isArray(A[k])) A[k] = {};
    if (typeof A.e !== 'number' || !(A.e >= 0)) A.e = 0;
    if (A.fin === undefined) A.fin = null;
    return A;
  },
  commence(id) { const A = this.S().A[id]; return !!(A && (A.o || A.fin && A.fin !== 'avant' || Object.keys(A.d || {}).length)); },
  // ------------------------------------------------------------- le contexte des fonctions des récits
  ctx() {
    const self = this;
    return {
      ch(ref) { const [a, e] = String(ref).split('.'); const A = self.S().A[a]; return (A && A.ch && A.ch[e]) || null; },
      fait(ref) { const [a, e] = String(ref).split('.'); const A = self.S().A[a]; return !!(A && A.d && A.d[e] > 0); },
      fin(a) { const A = self.S().A[a]; return (A && A.fin && A.fin !== 'avant') ? A.fin : null; },
      commence(a) { return self.commence(a); },
      vivant(id) { return self.vivant(id); },
      niveau(id) { const n = npcs.byId[id]; return n ? npcs.level(n) : 0; },
      coeur(id) { try { return typeof sentiments !== 'undefined' && sentiments.etape ? sentiments.etape(id) || 0 : 0; } catch (e) { return 0; } },
      quete(id) { const Q = farm.s.quests && farm.s.quests[id]; return !!(Q && Q.st === 'fait'); },
      fem: !!(farm.s && farm.s.fem),
    };
  },
  val(v, k) {
    if (typeof v !== 'function') return v === undefined ? null : v;
    try { return v(k || this.ctx()); } catch (e) { if (!this._err.val) { this._err.val = 1; console.error('récits', e); } return null; }
  },
  vrai(f, k) { return !!this.val(f, k); },
  liste(v, k) { const L = this.val(v, k); return Array.isArray(L) ? L.filter(Boolean) : []; },
  // ------------------------------------------------------------- les gens
  vivant(id) { const n = npcs.byId && npcs.byId[id]; return !!(n && n.st && n.st.alive); },
  voyage(id) { const S = this.S(), V = S && S.voyage[id]; return !!(V && farm.s.day < V.a); },
  qui(D, E) { return E.qui || D.npc; },
  raison(id) { const n = npcs.byId[id]; return n && n.st && n.st.gone === 'prison' ? 'parti' : 'deuil'; },
  // ------------------------------------------------------------- textes
  f(t, n) {
    if (typeof t !== 'string') return '';
    let r = t;
    try { r = fmtLine(t, n || null); } catch (e) { r = t; }
    const fem = !!(farm.s && farm.s.fem);
    return r.replace(/\{e\}/g, fem ? 'e' : '').replace(/\{m:([^|}]*)\|([^}]*)\}/g, (_, a, b) => (fem ? b : a));
  },
  // ------------------------------------------------------------- les étapes
  // prête : l'amitié, le jour, personne sur la route
  pret(D, E) {
    const s = farm.s, A = this.A(D.id), n = npcs.byId[D.npc];
    if (!n || npcs.level(n) < (E.min || 0)) return false;
    if (s.day < (A.j || 0) + (E.delai || 0) || s.day < (E.jour || 0)) return false;
    const qui = this.qui(D, E), nq = npcs.byId[qui];
    if (E.minQui && nq && npcs.level(nq) < E.minQui) return false;
    if (this.voyage(D.npc) || (!E.aller && this.voyage(qui))) return false;
    return true;
  },
  // l'étape en cours, si elle est ouverte (sinon null)
  courante(D) {
    if (typeof D === 'string') D = this.D(D);
    if (!D || !farm.s) return null;
    const A = this.A(D.id);
    if (A.fin) return null;
    const E = D.etapes[A.e];
    if (!E || A.d[E.id] !== undefined || !A.o || !this.pret(D, E)) return null;
    if (E.att && !this.vrai(E.att)) return null;
    return E;
  },
  etape(id) { const D = this.D(id), A = D && this.A(id); return D && !A.fin ? D.etapes[A.e] || null : null; },
  // avancer (une fois par seconde, et après chaque étape)
  tick(o) {
    const S = this.S(), s = farm.s;
    if (!S || s.over || !npcs.list || !npcs.list.length) return;
    o = o || {};
    const k = this.ctx();
    for (const D of K18_ARCS) {
      const A = this.A(D.id);
      if (A.fin) continue;
      if (!this.vivant(D.npc)) {
        if (this.commence(D.id)) this.finir(D, this.raison(D.npc), o);
        else { A.fin = 'avant'; A.finJ = s.day; }
        continue;
      }
      for (let garde = 0; garde <= D.etapes.length; garde++) {
        const E = D.etapes[A.e];
        if (!E) { this.finir(D, this.val(D.finDefaut, k) || Object.keys(D.fins)[0], o); break; }
        if (A.d[E.id] !== undefined) { A.e++; continue; }
        if (E.si && !this.vrai(E.si, k)) { A.d[E.id] = -1; A.o = 0; A.e++; continue; }
        const qui = this.qui(D, E);
        if (qui !== D.npc && !E.aller && !this.vivant(qui)) { this.sauter(D, E, k, o); if (A.fin) break; continue; }
        if (!this.pret(D, E)) break;
        if (!A.o) { A.o = s.day; if (!o.silence && !(E.att && !this.vrai(E.att, k))) this.indice(D, E); }
        if (E.att && !this.vrai(E.att, k)) {
          if (s.day - A.o > K18_REGL.attenteMax) { this.sauter(D, E, k, o); if (A.fin) break; continue; }
          break;
        }
        break;
      }
    }
    // les lettres arrivées
    for (let i = 0; i < S.courrier.length; i++) {
      const c = S.courrier[i];
      if (!c || s.day < c.j) continue;
      S.courrier.splice(i--, 1);
      try { farm.mail(c.de, c.titre, c.texte, { k18: c.arc || 1 }); } catch (e) { console.error(e); }
    }
    // les voyages finis
    for (const id in S.voyage) {
      const V = S.voyage[id], n = npcs.byId[id];
      if (!n || !n.st.alive || s.day >= V.a || V.a - V.de > K18_REGL.voyageMax) {
        delete S.voyage[id];
        if (n && n.vanished) { n.vanished = false; try { npcs.snap(game.world); } catch (e) { /* rien */ } }
      }
    }
  },
  // une étape sautée (la personne n'est plus là, l'attente a trop duré) : son choix par défaut, sa fin s'il y en a
  sauter(D, E, k, o) {
    const A = this.A(D.id);
    A.d[E.id] = -1; A.o = 0; A.e++;
    const L = this.liste(E.choix, k);
    if (L.length || E.defaut) A.ch[E.id] = E.defaut || L[0].k;
    if (E.finSaut) this.finir(D, E.finSaut, o);
  },
  // ------------------------------------------------------------- faire l'étape en cours (dialogue achevé, lieu atteint)
  faire(arcId, ci, o) {
    const D = this.D(arcId), E = D && this.courante(D);
    if (!E) return false;
    const k = this.ctx(), A = this.A(D.id), s = farm.s;
    const need = this.val(E.need, k);
    if (need && !E.garde && !farm.has(need)) return false;
    const L = this.liste(E.choix, k);
    const C = L.length ? L[Math.max(0, Math.min(L.length - 1, ci | 0))] : null;
    if (need && !E.garde) for (const it in need) farm.take(it, need[it]);
    A.d[E.id] = s.day; A.j = s.day; A.o = 0; A.e++;
    if (C) A.ch[E.id] = C.k;
    const n = npcs.byId[D.npc];
    for (const X of [E, C]) if (X) this.suites(D, X, k);
    if (n) { npcs.addAmitie(n, 25); npcs.remember(n, 'recit', { arc: D.id, e: E.id }); }
    const q = this.qui(D, E);
    if (q !== D.npc && npcs.byId[q]) npcs.addAmitie(npcs.byId[q], 15);
    const k2 = this.ctx();
    const cine = this.val(C && C.cine, k2) || this.val(E.cine, k2);
    if (cine && !(o && o.sansScene)) this.aVoir(D.id, cine);
    else if (cine) this.vu(D.id, cine);
    const fin = this.val(C && C.fin, k2) || this.val(E.fin, k2);
    if (fin) this.finir(D, fin);
    this.dire('etape', { arc: D.id, etape: E.id, choix: C ? C.k : null });
    try { sound.quest && sound.quest(true); } catch (e) { /* rien */ }
    this.tick({ silence: !!(o && o.silence) });
    return true;
  },
  // ce qu'une étape (ou un choix) laisse : cadeaux, argent, lettre, voyage, fâcherie
  suites(D, X, k) {
    const s = farm.s, n = npcs.byId[D.npc];
    const don = this.val(X.don, k);
    if (don) for (const it in don) if (ITEMS[it] && don[it] > 0) farm.give(it, don[it]);
    if (X.argent > 0) { farm.earn(Math.min(250, X.argent)); try { sound.coin && sound.coin(); } catch (e) { /* rien */ } }
    const L = this.val(X.lettre, k);
    if (L && L.texte) this.S().courrier.push({ j: s.day + Math.max(1, L.delai || 1), de: this.f(L.de || (n ? n.name : ''), n), titre: this.f(L.titre || '', n), texte: this.f(L.texte, n), arc: D.id });
    if (Array.isArray(X.voyage)) { const [id, j] = X.voyage; if (npcs.byId[id]) this.S().voyage[id] = { de: s.day, a: s.day + Math.max(1, Math.min(K18_REGL.voyageMax, j | 0)) }; }
    if (Array.isArray(X.fache)) { const m = npcs.byId[X.fache[0]]; if (m) m.st.anger = Math.max(m.st.anger || 0, X.fache[1] | 0); }
  },
  finir(D, f, o) {
    if (typeof D === 'string') D = this.D(D);
    const A = this.A(D.id), s = farm.s;
    if (A.fin && A.fin !== 'avant') return;
    A.fin = f || 'deuil'; A.finJ = s.day; A.o = 0;
    const F = D.fins && D.fins[A.fin], n = npcs.byId[D.npc];
    if (F && F.lettre && !(o && o.silence)) { const k = this.ctx(); this.suites(D, { lettre: F.lettre }, k); }
    this.dire('fin', { arc: D.id, fin: A.fin });
    this.appliquer();
  },
  // le lieu d'une étape atteint (dans la vallée)
  lieuVu(arcId) {
    const D = this.D(arcId), E = D && this.courante(D);
    if (!E || !E.lieu) return false;
    const A = this.A(D.id);
    const need = this.val(E.need);
    if (E.aller && need && !E.garde && !farm.has(need)) return false;
    A.l[E.id] = 1;
    if (E.vu) { try { ui.subtitle('', this.f(E.vu, npcs.byId[D.npc]), 7); } catch (e) { /* rien */ } }
    if (E.aller) this.faire(D.id);
    return true;
  },
  heureOk(m, h) { const f = K18_HEURES[m]; return !f || f(h); },
  lieux() {
    if (!game.world || !game.player || (typeof zone !== 'undefined' && zone.dedans) || (typeof mondes !== 'undefined' && mondes.cur) || game.player.underground) return;
    const w = game.world, p = game.player, h = npcs.hour();
    if (!w.lm) return;
    for (const D of K18_ARCS) {
      const E = this.courante(D);
      if (!E || !E.lieu) continue;
      const A = this.A(D.id);
      if (A.l[E.id]) continue;
      const L = w.lm[E.lieu];
      if (!L) { A.l[E.id] = 1; if (E.aller) this.faire(D.id); continue; }
      if (!this.heureOk(E.moment, h)) { E._stay = 0; continue; }
      if (Math.hypot(p.pos[0] - L.x, p.pos[2] - L.z) < Math.max(12, Math.min(L.r || 0, 40))) {
        E._stay = (E._stay || 0) + 1;
        if (E._stay >= 2) {
          E._stay = 0;
          const need = this.val(E.need);
          if (E.aller && need && !farm.has(need)) {
            if (E._manque !== farm.s.day) { E._manque = farm.s.day; ui.subtitle('', '(Il vous manque quelque chose : ' + Object.keys(need).map((it) => itemName(it).toLowerCase()).join(', ') + '.)', 4); }
            continue;
          }
          this.lieuVu(D.id);
        }
      } else E._stay = 0;
    }
  },
  // ------------------------------------------------------------- l'indice discret à l'écran
  indice(D, E) { this.indiceA = [D.id, E.id]; this.indiceT = 1.6; },
  montrerIndice() {
    const r = this.indiceA;
    this.indiceA = null;
    if (!r || typeof document === 'undefined' || cine.on) return;
    const D = this.D(r[0]), E = D && D.etapes.find((x) => x.id === r[1]);
    if (!E) return;
    let el = $('#k18-but');
    if (!el) {
      const st = document.createElement('style');
      st.textContent = `#k18-but{position:fixed;left:22px;top:96px;max-width:min(420px,70vw);color:#e8e0cc;font:13px/1.4 Georgia,serif;text-shadow:0 1px 2px #000;opacity:0;transition:opacity 1.2s;pointer-events:none;z-index:20}
#k18-but.on{opacity:.85}#k18-but small{display:block;font-size:10.5px;letter-spacing:.22em;text-transform:uppercase;color:#c8a878}
body.cine #k18-but{visibility:hidden}`;
      document.head.appendChild(st);
      el = document.createElement('div');
      el.id = 'k18-but';
      document.body.appendChild(el);
    }
    const n = npcs.byId[D.npc];
    el.innerHTML = `<small>${esc(K18_TEXTES.recit + ' · ' + D.titre)}</small>${esc(this.f(E.carnet || E.titre, n))}`;
    el.classList.add('on');
    clearTimeout(this._butT);
    this._butT = setTimeout(() => el.classList.remove('on'), 7000);
  },
  // ------------------------------------------------------------- les dialogues
  // les lignes « … » de ceux à qui une étape demande de parler
  lignes(n) {
    const out = [];
    if (!n || !farm.s) return out;
    for (const D of K18_ARCS) {
      const E = this.courante(D);
      if (!E || E.aller || this.qui(D, E) !== n.id) continue;
      const A = this.A(D.id);
      if (E.lieu && !A.l[E.id] && game.world && game.world.lm && game.world.lm[E.lieu]) continue;
      out.push({ label: '« ' + this.f(this.val(E.label) || E.titre, n) + ' »', act: 'k18:o:' + D.id, quest: true });
    }
    return out;
  },
  // une réplique : 'texte' ou ['texte', 'réponse']
  page(L, i, n) { const x = L[i]; return Array.isArray(x) ? [this.f(x[0], n), x[1] ? this.f(x[1], n) : null] : [this.f(String(x || ''), n), null]; },
  choisir(tk, act) {
    const n = tk.n, s = farm.s;
    const parts = act.split(':');
    if (parts[1] === 'o') {
      const D = this.D(parts[2]), E = D && this.courante(D);
      if (!E || this.qui(D, E) !== n.id) return tk.view('…', tk.options());
      const k = this.ctx(), need = this.val(E.need, k);
      if (need && !E.garde && !farm.has(need)) return tk.view(this.f(E.attente || 'Il vous manque encore ' + Object.keys(need).map((it) => need[it] + ' × ' + itemName(it).toLowerCase()).join(', ') + '.', n), tk.options());
      const pages = this.liste(E.dlg, k);
      this.dlg = { arc: D.id, e: E.id, pages: pages.length ? pages : ['…'], i: 0, ph: 'd', n: n.id };
      return this.montrer(tk);
    }
    const G = this.dlg;
    if (!G || G.n !== n.id) return tk.view('…', tk.options());
    if (parts[1] === 'n') { G.i++; return this.montrer(tk); }
    if (parts[1] === 'c') {
      const D = this.D(G.arc), E = D && this.courante(D);
      if (!E || E.id !== G.e) { this.dlg = null; return tk.view('…', tk.options()); }
      const L = this.liste(E.choix, this.ctx()), ci = Math.max(0, Math.min(L.length - 1, parts[2] | 0)), C = L[ci];
      if (!this.faire(D.id, ci)) { this.dlg = null; return tk.view(this.f(E.attente || '…', n), tk.options()); }
      const R = C ? this.liste(C.dlg, this.ctx()) : [];
      if (!R.length) { this.dlg = null; return tk.view('…', tk.options()); }
      this.dlg = { arc: D.id, e: E.id, pages: R, i: 0, ph: 'r', n: n.id };
      return this.montrer(tk);
    }
    return tk.view('…', tk.options());
  },
  montrer(tk) {
    const G = this.dlg, n = tk.n;
    const [txt, rep] = this.page(G.pages, G.i, n);
    if (G.i < G.pages.length - 1) return tk.view(txt, [{ label: rep || '…', act: 'k18:n', quest: true }]);
    if (G.ph === 'd') {
      const D = this.D(G.arc), E = D && this.courante(D);
      if (!E || E.id !== G.e) { this.dlg = null; return tk.view(txt, tk.options()); }
      const L = this.liste(E.choix, this.ctx());
      if (L.length) return tk.view(txt, L.map((c, i) => ({ label: this.f(c.label, n), act: 'k18:c:' + i, quest: true })));
      this.dlg = null;
      this.faire(D.id, 0);
      return tk.view(txt, tk.options());
    }
    this.dlg = null;
    return tk.view(txt, tk.options());
  },
  // ------------------------------------------------------------- les scènes
  aVoir(arc, cle) { const S = this.S(); if (!S.file.some((x) => x[1] === cle)) S.file.push([arc, cle]); this.pretT = Math.max(this.pretT, 1.2); },
  vu(arc, cle) { const S = this.S(), A = this.A(arc); if (!A.vus[cle]) A.vus[cle] = farm.s.day; if (!S.vus[cle]) S.vus[cle] = farm.s.day; },
  scene(cle) { for (const D of K18_ARCS) if (D.scenes && D.scenes[cle]) return [D, D.scenes[cle]]; return null; },
  dansVallee() { return !!(h17.monde() && !(typeof zone !== 'undefined' && zone.dedans) && !(game.player && game.player.underground)); },
  peutJouer() {
    if (typeof histoire === 'undefined' || !histoire.peutJouer('k18')) return false;
    if (typeof navigator !== 'undefined' && navigator.webdriver && !this.auto && !h17Cine.auto) return false;
    if (!this.dansVallee()) return false;
    // l'histoire passe d'abord
    const H = histoire.S();
    if (H && (H.file.length || (H.aVoir && histoire.peutJouer(H.aVoir)) || histoire.joue)) return false;
    if (this.dlg || talk.n) return false;
    return true;
  },
  jouer(cle, rejeu) {
    const r = this.scene(cle);
    if (!r) return Promise.resolve(false);
    const [D] = r;
    let sc = null;
    try { sc = k18Scenes.construire(cle, this.ctx()); } catch (e) { console.error('récits : scène ' + cle, e); sc = null; }
    if (!rejeu) this.vu(D.id, cle);
    if (!sc) return Promise.resolve(false);
    this.joue = cle; this.sceneT = 0;
    this.cacher(sc.ids || []);
    this.dire('cinematique', { arc: D.id, cine: cle });
    const apres = () => { this.joue = null; this.montrerTous(); };
    return h17Cine.jouer(sc.plans, Object.assign({}, sc.opts, { cle: 'k18:' + cle, apres }));
  },
  rejouer(cle) {
    if (cine.on || !this.scene(cle)) return Promise.resolve(false);
    if (!this.dansVallee()) { ui.subtitle('', '(Pas d’ici.)', 3); return Promise.resolve(false); }
    ui.close(true);
    return this.jouer(cle, true);
  },
  souvenirs() { const S = this.S(); return S ? Object.keys(S.vus).filter((k) => this.scene(k)) : []; },
  // les habitants qui jouent dans une scène : on cache les vrais pendant ce temps
  cacher(ids) { this.caches = []; for (const id of ids) { const n = npcs.byId[id]; if (n && n.st.alive && !n.vanished) { n.vanished = true; this.caches.push(id); } } },
  montrerTous() { for (const id of this.caches) { const n = npcs.byId[id]; if (n && !this.voyage(id)) n.vanished = false; } this.caches = []; },
  // ------------------------------------------------------------- ce qui change dans la vallée
  appliquer() {
    if (!farm.s) return;
    const S = this.S();
    // les liens d'origine, puis ceux des fins
    for (const d of NPC_DATA) { if (!(d.id in K18_LIENS0)) K18_LIENS0[d.id] = Object.assign({}, d.liens || {}); d.liens = Object.assign({}, K18_LIENS0[d.id]); }
    // les conversations ajoutées
    if (typeof NPC_LIFE !== 'undefined') {
      for (const x of K18_DISC.splice(0)) { const L = NPC_LIFE[x.a]; if (L && L.discussions) { const i = L.discussions.indexOf(x.o); if (i >= 0) L.discussions.splice(i, 1); } }
    }
    this.boutiques = [];
    this.phare = false;
    for (const D of K18_ARCS) {
      const A = S.A[D.id], M = A && A.fin && D.monde && D.monde[A.fin];
      if (!M) continue;
      if (M.liens) for (const a in M.liens) { const d = NPC_BY_ID[a]; if (d && this.vivant(a)) for (const b in M.liens[a]) if (this.vivant(b)) d.liens[b] = M.liens[a][b]; }
      if (M.discussions && typeof NPC_LIFE !== 'undefined') for (const x of M.discussions) {
        const L = NPC_LIFE[x.a];
        if (!L || !this.vivant(x.a) || !this.vivant(x.b)) continue;
        if (!Array.isArray(L.discussions)) L.discussions = [];
        const o = { avec: x.b, lignes: x.lignes };
        L.discussions.push(o); K18_DISC.push({ a: x.a, o });
      }
      if (M.boutique) this.boutiques.push(M.boutique);
      if (M.phare) this.phare = true;
    }
  },
  // ------------------------------------------------------------- les saluts
  niveauNom(lvl) { let t = K18_NIVEAUX[0][1]; for (const [m, x] of K18_NIVEAUX) if (lvl >= m) t = x; return t; },
  // un salut à la place du salut ordinaire (ou null)
  salut(n) {
    const s = farm.s, S = this.S(), V = K18_VOIX[n.id], lvl = npcs.level(n), st = n.st;
    const k = this.ctx();
    // le cadeau rituel d'un récit achevé
    for (const D of K18_ARCS) {
      if (D.npc !== n.id || !D.rituel) continue;
      const A = S.A[D.id];
      if (!A || !A.fin || ['deuil', 'parti', 'avant'].includes(A.fin) || lvl < 4) continue;
      const last = S.rit[D.id] || A.finJ || 0;
      if (s.day - last < (D.rituel.tous || 7)) continue;
      S.rit[D.id] = s.day;
      const don = D.rituel.don || {};
      for (const it in don) if (ITEMS[it] && don[it] > 0) farm.give(it, Math.min(5, don[it]));
      return pick(this.liste(D.rituel.texte, k));
    }
    // la suite d'une quête d'avant (une fois, de un à six jours après)
    for (const q of n.d.quests || []) {
      const Q = s.quests && s.quests[q.id], t = K18_APRES[q.id];
      if (!t || !Q || Q.st !== 'fait' || S.apres[q.id]) continue;
      const dj = s.day - (Q.done || s.day);
      if (dj >= 1 && dj <= 6) { S.apres[q.id] = s.day; return t; }
      if (dj > 6) S.apres[q.id] = -1;
    }
    if (Math.random() > K18_REGL.salut) return null;
    // la fin d'un récit
    for (const D of K18_ARCS) {
      if (D.npc !== n.id) continue;
      const A = S.A[D.id], F = A && A.fin && D.fins && D.fins[A.fin];
      if (F && F.salut && Math.random() < 0.5) { const L = this.liste(F.salut, k); if (L.length) return pick(L); }
    }
    if (!V) return null;
    // une partie d'avant : une fois par habitant
    if ((s.run || 1) > 1 && V.vies && !S.vies[n.id] && lvl >= 2) { S.vies[n.id] = s.day; return V.vies; }
    // le dernier cadeau, la dernière quête (récents)
    const mem = (st.mem || []).slice().reverse();
    const c = mem.find((m) => m.t === 'cadeau' && m.item && s.day - m.day <= 6 && m.k !== 'deteste' && !m.k18);
    if (c && V.cadeau && Math.random() < 0.45) { c.k18 = 1; return V.cadeau.replace('{objet}', itemName(c.item).toLowerCase()); }
    const a = mem.find((m) => m.t === 'aide' && m.q && s.day - m.day <= 10 && !m.k18);
    if (a && V.quete && Math.random() < 0.4) { const q = quests.byId(a.q); if (q) { a.k18 = 1; return V.quete.replace('{quete}', q.title); } }
    // le temps, la ferme
    const r = Math.random();
    if (r < 0.2 && typeof weather !== 'undefined' && weather.cur) {
      if (weather.cur.frost > 0.4 && V.gel) return V.gel;
      if (weather.cur.rain > 0.4 && V.pluie) return V.pluie;
    }
    if (r < 0.32 && V.ferme && lvl >= 3 && ((s.stats && s.stats.crops > 15) || (s.animals && s.animals.length > 2))) return V.ferme;
    // selon l'amitié
    if (lvl >= 6 && V.proche) return pick(V.proche);
    if (lvl >= 3 && V.ami && Math.random() < 0.6) return pick(V.ami);
    return null;
  },
  // ------------------------------------------------------------- les visites à la ferme
  candidatsVisite() {
    const S = this.S();
    let foyer = null;
    try { foyer = typeof sentiments !== 'undefined' && sentiments.S() ? sentiments.S().foyer : null; } catch (e) { foyer = null; }
    return npcs.list.filter((n) => K18_VOIX[n.id] && n.st.alive && n.st.met && !n.vanished && npcs.level(n) >= K18_REGL.visiteNiveau && !(n.st.anger > 0) && !n.st.malade
      && n.id !== foyer && !this.voyage(n.id) && !(typeof strange !== 'undefined' && strange.isKiller && strange.isKiller(n.id) && strange.killerPhase() >= 1) && !S.voyage[n.id]);
  },
  planVisite() {
    const S = this.S(), s = farm.s, V = S.visite;
    if (V.j === s.day) return;
    S.visite = { j: s.day, last: V.last || 0, id: null };
    if (s.day - (V.last || 0) < K18_REGL.visiteEcart) return;
    if (typeof navigator !== 'undefined' && navigator.webdriver && !this.auto) return;
    const rnd = mulberry32(((s.seed | 0) * 31 + s.day * 977) >>> 0);
    if (rnd() > K18_REGL.visiteChance) return;
    const C = this.candidatsVisite();
    if (!C.length) return;
    const n = C[(rnd() * C.length) | 0], h0 = 12.5 + rnd() * 1.5;
    Object.assign(S.visite, { id: n.id, h0, h1: h0 + 3.5, fait: 0 }); // (le temps de venir à pied depuis la ville)
  },
  visiteDe(n, h) { const V = this.S().visite; return !!(V && V.id === n.id && V.j === farm.s.day && !V.fait && h >= V.h0 && h < V.h1 && n.st.alive && !(n.st.anger > 0)); },
  visites() {
    const S = this.S(), V = S.visite, s = farm.s;
    if (!V || !V.id || V.j !== s.day || V.fait) return;
    const n = npcs.byId[V.id], h = npcs.hour();
    if (!n || !n.st.alive) { V.fait = 3; return; }
    const W = K18_VOIX[n.id], p = game.player;
    if (h >= V.h0 && h < V.h1 + 0.5 && !n.talking && !n.vanished && Math.hypot(n.x - p.pos[0], n.z - p.pos[2]) < 6 && !cine.on) {
      V.fait = 1; V.last = s.day;
      npcs.say(n, this.f(pick(W.visite), n), 6);
      n.waveT = 1.6;
      for (const it in W.don || {}) if (ITEMS[it] && W.don[it] > 0) farm.give(it, Math.min(4, W.don[it]));
      npcs.addAmitie(n, 10);
      npcs.remember(n, 'visite');
      this.dire('visite', { qui: n.id });
      return;
    }
    if (h >= V.h1 + 0.5) {
      V.fait = 2; V.last = s.day;
      try { farm.mail(n.name + ' ' + n.d.surname, this.f(K18_TEXTES.passer.replace('{e}', n.d.gender === 'f' ? 'e' : ''), n), this.f(W.absent, n), { k18: 'visite' }); } catch (e) { console.error(e); }
    }
  },
  // ------------------------------------------------------------- les proches (pour le carnet)
  proches() {
    const out = [];
    for (const n of npcs.list || []) {
      if (!n.st.met) continue;
      const lvl = npcs.level(n), arcs = K18_ARCS.filter((D) => D.npc === n.id && this.commence(D.id));
      if (lvl < 2 && !arcs.length) continue;
      out.push({ n, lvl, arcs });
    }
    return out.sort((a, b) => (b.n.st.alive - a.n.st.alive) || (b.n.st.amitie || 0) - (a.n.st.amitie || 0));
  },
  portrait(n) {
    const P = K18_PORTRAITS[n.id], lvl = npcs.level(n), out = [];
    if (P) { let t = P[0][1]; for (const [m, x] of P) if (lvl >= m) t = x; out.push(t); }
    else out.push(n.d.role + (n.d.traits && n.d.traits.length ? ' : ' + n.d.traits.join(', ') + '.' : '.'));
    for (const D of K18_ARCS) {
      const A = this.S().A[D.id];
      if (D.npc !== n.id || !A || !A.fin || A.fin === 'avant') continue;
      const F = D.fins && D.fins[A.fin];
      if (F && F.resume) out.push(F.resume);
    }
    return out.map((t) => this.f(t, n));
  },
  dernierSouvenir(n) {
    const m = (n.st.mem || []).slice().reverse().find((x) => ['cadeau', 'aide', 'recit', 'visite'].includes(x.t));
    if (!m) return null;
    const j = 'jour ' + m.day;
    if (m.t === 'cadeau' && m.item) return j + ' : vous lui avez offert ' + itemName(m.item).toLowerCase() + '.';
    if (m.t === 'aide' && m.q) { const q = quests.byId(m.q); return j + ' : « ' + (q ? q.title : m.q) + ' ».'; }
    if (m.t === 'recit' && m.arc) { const D = this.D(m.arc), E = D && D.etapes.find((x) => x.id === m.e); return j + ' : ' + (E ? E.titre : D ? D.titre : '') + '.'; }
    if (m.t === 'visite') return j + ' : visite à la ferme.';
    return null;
  },
  // ------------------------------------------------------------- pour les succès et les essais
  dire(type, o) {
    const d = Object.assign({ type }, o || {});
    try { if (typeof window !== 'undefined' && window.dispatchEvent && typeof CustomEvent === 'function') window.dispatchEvent(new CustomEvent('prairie:recits', { detail: d })); } catch (e) { /* rien */ }
  },
  // ------------------------------------------------------------- chaque image
  update(dt) {
    if (!farm.s || !game.started || !npcs.list || !npcs.list.length) return;
    this.t -= dt;
    if (this.t <= 0) {
      this.t = 1;
      this.tick();
      this.planVisite();
      if (game.mode === 'play') { this.lieux(); this.visites(); }
    }
    // ceux qui sont sur la route ne sont pas là
    const S = this.S();
    for (const id in S.voyage) { const n = npcs.byId[id]; if (n && n.st.alive && !n.talking && !cine.on && this.voyage(id)) n.vanished = true; }
    if (this.indiceT > 0 && !cine.on) { this.indiceT -= dt; if (this.indiceT <= 0) this.montrerIndice(); }
    if (cine.on) { if (this.joue) this.sceneT += dt; return; }
    if (this.joue) { this.joue = null; this.montrerTous(); }
    if (this.pretT > 0) { this.pretT -= dt; return; }
    if (S.file.length && this.peutJouer()) { const [, cle] = S.file.shift(); this.jouer(cle); }
  },
};
if (typeof window !== 'undefined') window.prairieRecits = k18;

// ---------------------------------------------------------------- les dialogues (installés au chargement, après les autres)
k18.installer = function () {
  if (k18.hooked) return;
  k18.hooked = true;
  const _open = talk.open.bind(talk);
  talk.open = function (n) {
    const s = farm.s, st = n && n.st;
    k18.dlg = null;
    const special = !s || !st || !st.met || npcs.murdererKnown() || st.anger > 0 || (strange.wasRedNight() && st.redSeen !== s.day)
      || (s.dead.length && s.dead[s.dead.length - 1].day >= s.day - 2 && st.deuil !== s.dead[s.dead.length - 1].id && s.dead[s.dead.length - 1].id !== n.id)
      || (typeof societe !== 'undefined' && societe.crimesSus && societe.crimesSus(n).length) || st.malade;
    const v = _open(n);
    try {
      if (!special && v && v.text && this.n === n) {
        const t = k18.salut(n);
        if (t) { v.text = k18.f(t, n); n.speakT = Math.min(6, 1 + v.text.length * 0.04); }
      }
    } catch (e) { if (!k18._err.salut) { k18._err.salut = 1; console.error('récits : salut', e); } }
    return v;
  };
  const _options = talk.options.bind(talk);
  talk.options = function () {
    const opts = _options();
    try {
      const n = this.n;
      if (!n || !farm.s || npcs.murdererKnown()) return opts;
      const L = k18.lignes(n);
      if (L.length) { const i = opts.findIndex((o) => o.act === 'bye'); opts.splice(i >= 0 ? i : opts.length, 0, ...L); }
    } catch (e) { console.error('récits : options', e); }
    return opts;
  };
  const _choose = talk.choose.bind(talk);
  talk.choose = function (act) {
    if (typeof act === 'string' && act.startsWith('k18:') && this.n) {
      try { return k18.choisir(this, act); } catch (e) { console.error('récits : dialogue', e); k18.dlg = null; return this.view('…', this.options()); }
    }
    if (act === 'bye') k18.dlg = null;
    return _choose(act);
  };
  const _close = talk.close.bind(talk);
  talk.close = function (keep) { if (!keep) k18.dlg = null; return _close(keep); };
  // les visites : l'emploi du temps
  const _sp = npcs.schedulePlace.bind(npcs);
  npcs.schedulePlace = function (n, h) {
    try { if (farm.s && k18.visiteDe(n, h)) return { place: 'lieu:ferme', sleep: false }; } catch (e) { /* rien */ }
    return _sp(n, h);
  };
  // les boutiques qui changent
  const _rs = ui.renderShop.bind(ui);
  ui.renderShop = function () {
    const n = this.shopN, S = n && n.d.shop;
    const plus = S && (k18.boutiques || []).filter((B) => B.npc === n.id).flatMap((B) => B.vend).filter(([id]) => ITEMS[id] && !S.sells.some(([x]) => x === id));
    if (!plus || !plus.length) return _rs();
    const s0 = S.sells;
    S.sells = s0.concat(plus);
    try { return _rs(); } finally { S.sells = s0; }
  };
  // marié(e)s entre eux : on ne les courtise plus
  if (typeof sentiments !== 'undefined' && sentiments.candidat) {
    const _cand = sentiments.candidat.bind(sentiments);
    sentiments.candidat = function (n) {
      try {
        if (n && farm.s) {
          const S = k18.S();
          const pris = (a, f) => S.A[a] && S.A[a].fin === f;
          if ((n.d.id === 'boulangere' || n.d.id === 'forgeron') && pris('forgeron', 'noces')) return false;
          if ((n.d.id === 'eleveuse' || n.d.id === 'garde') && pris('eleveuse', 'ensemble')) return false;
        }
      } catch (e) { /* rien */ }
      return _cand(n);
    };
  }
};
HOOKS.load.push(() => k18.installer());
// au chargement : l'état, ce qui a changé dans la vallée, les voyages en cours ; une ancienne partie reprend sans rien rejouer
HOOKS.load.push((saved) => {
  k18.dlg = null; k18.joue = null; k18.caches = []; k18.t = 0.5; k18.pretT = 3; k18.indiceT = 0; k18.indiceA = null;
  if (!farm.s) return;
  k18.S();
  try { k18.appliquer(); } catch (e) { console.error('récits : appliquer', e); }
  if (npcs.list && npcs.list.length) { try { k18.tick({ silence: true }); } catch (e) { console.error('récits : reprise', e); } }
});
HOOKS.update.push(Object.assign((dt) => { try { k18.update(dt); } catch (e) { if (!k18._err.update) { k18._err.update = 1; console.error('récits', e); } } }, { zone: true }));
// la lumière du phare (Rose est revenue)
HOOKS.lights.push((eye) => {
  if (!k18.phare || !game.world || !game.world.lm || !game.world.lm.phare) return [];
  const h = npcs.hour();
  if (!(h >= 19 || h < 5.5)) return [];
  const L = game.world.lm.phare, y = game.world.heightAt(L.x, L.z) + 17.8;
  return [{ x: L.x, y, z: L.z, r: 26, c: [1.0, 0.82, 0.5], d: Math.hypot(L.x - eye[0], y - eye[1], L.z - eye[2]) }];
});
