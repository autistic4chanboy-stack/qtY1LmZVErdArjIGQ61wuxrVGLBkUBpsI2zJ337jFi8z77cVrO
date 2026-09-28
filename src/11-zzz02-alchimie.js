// ============================================================================
//  ALCHIMIE (suite)
//  - PLANTES À IDENTIFIER : une plante sauvage (PLANT_LOOK) n'a pour nom que
//    son allure tant que l'alchimiste de la ville ne l'a pas nommée ; il garde
//    un brin pour sa collection, contre quelques pièces (rien pour un ami).
//  - TABLE D'ALCHIMISTE : on y mêle deux à quatre ingrédients, à l'aveugle.
//    Chaque ingrédient porte des ESSENCES cachées ; elles s'additionnent, les
//    contraires (ESSENCE_OPP) se mangent, et ce qui domine décide : une essence
//    seule donne une potion simple (ALCH_SINGLE), deux essences fortes une
//    potion plus rare (ALCH_PAIRS) — si le mélange est assez fort. Trois
//    essences qui se disputent : une mixture (ou un poison, si la Mort s'en
//    mêle). Tout annulé : une bouillie grise. On note ce qu'on a essayé.
//  - LES POTIONS NOUVELLES (effets), les poisons, l'appât empoisonné.
//  - LE CARNET D'ALCHIMIE (onglet « Grimoire » de la sacoche).
//  Sauvegarde : farm.s.alch
// ============================================================================

// ---------------------------------------------------------------- objets et effets en plus
defItem('bouillie', 'Bouillie grise', 'potion', 0, ['fiole', '#8a8478'], { potion: 'bouillie', desc: 'Rien de bon n’en est sorti. Clic : vider la fiole. Clic droit : la boire, si vous y tenez.' });
Object.assign(BUFF_NAMES, {
  chaleur: 'Chaleur', sang_froid: 'Sang-froid', regeneration: 'Régénération', soleil: 'Yeux de soleil', peau_pierre: 'Peau de pierre',
  morts: 'L’oreille des morts', songe: 'Songe',
});

const alchimie = {
  VRAI: {},          // plantes à identifier : id -> { name, desc } (vrai nom, vraie description)
  onBoire: [],       // fn(id) : une potion vient d'être bue (pour les autres modules)
  agonie: [], carcasses: [], tAppat: 1, tMorts: 4, confirmT: {},
  table: { slots: [null, null, null, null], src: null, busy: false, res: null, msg: '' },

  S() {
    const s = farm.s;
    const A = s.alch || (s.alch = { v: 1 });
    if (!A.essais) A.essais = {};
    if (!A.potions) A.potions = {};
    if (!A.appats) A.appats = [];
    if (!A.seq) A.seq = 0;
    return A;
  },

  // ================================================================ les plantes
  estPlante(id) { return !!(PLANT_LOOK[id] && ITEMS[id] && this.VRAI[id]); },
  inconnue(id) { return this.estPlante(id) && !savoir.planteConnue(id); },
  vraiNom(id) { return this.VRAI[id] ? this.VRAI[id].name : itemName(id); },
  allure(id) { return PLANT_LOOK[id] ? PLANT_LOOK[id][0] : itemName(id); },
  // nom à montrer pour une plante du monde (id OBJ_TYPES) : son allure tant qu'on ne la connaît pas
  nomPlante(objId) {
    const H = HARVEST[objId], it = H && H.drop && H.drop[0] && H.drop[0][0];
    if (it && this.inconnue(it)) return PLANT_LOOK[it][0];
    const T = OBJ_TYPES[OBJ_INDEX[objId]];
    return T ? T.name : objId;
  },
  appliquerNoms() {
    for (const id in this.VRAI) {
      const it = ITEMS[id], V = this.VRAI[id], L = PLANT_LOOK[id];
      const connue = !!farm.s && savoir.planteConnue(id);
      it.name = connue ? V.name : L[0];
      it.desc = connue ? V.desc : L[1];
    }
  },
  portees() { const s = farm.s; return Object.keys(s.inv).filter((id) => s.inv[id] > 0 && this.inconnue(id)); },
  prixNom(n) { const l = npcs.level(n); return l >= 6 ? 0 : l >= 4 ? 5 : l >= 2 ? 10 : 15; },
  prixTout(n, k) { return k * (this.prixNom(n) + 5); },

  // options de dialogue chez l'alchimiste
  optionsDialogue(n) {
    if (!n || n.id !== 'alchimiste' || !n.st.alive) return [];
    const P = this.portees();
    if (!P.length) return [];
    const p = this.prixNom(n);
    const o = [{ label: 'Pouvez-vous me dire ce que c’est ?' + (p ? ` (${p} pièces)` : ''), act: 'alch:nom' }];
    if (P.length >= 2) o.push({ label: `Et tout ce que je porte d’inconnu, d’un coup ? (${this.prixTout(n, P.length)} pièces)`, act: 'alch:tout' });
    return o;
  },
  choisir(n, act) {
    const L = n.d.lines, D = this.DIT;
    if (n.st.anger > 0 || npcs.murdererKnown()) return talk.view(pick(L.greet.froid), talk.options());
    const P = this.portees();
    if (!P.length) return talk.view('Vous n’avez rien sur vous que je ne connaisse. Enfin : rien que vous ne connaissiez déjà.', talk.options());
    if (act === 'alch:nom') {
      const id = P.includes(farm.s.hand) ? farm.s.hand : P[0];
      const prix = this.prixNom(n);
      if (prix && farm.s.money < prix) return talk.view(pick(D.sansArgent)(prix), talk.options());
      if (prix) { farm.pay(prix); sound.coin && sound.coin(); }
      farm.take(id, 1);
      savoir.identifier(id);
      npcs.addAmitie(n, (n.d.loves || []).includes(id) ? 60 : (n.d.likes || []).includes(id) ? 25 : 6);
      sound.page && sound.page();
      const rem = this.REM[id] || `C’est ${this.vraiNom(id).toLowerCase()}.`;
      return talk.view([pick(D.intro), rem, pick(D.garde), prix ? pick(D.prix)(prix) : pick(D.gratuit)].join(' '), talk.options());
    }
    if (act === 'alch:tout') {
      const prix = this.prixTout(n, P.length);
      if (farm.s.money < prix) return talk.view(pick(D.sansArgent)(prix), talk.options());
      farm.pay(prix); sound.coin && sound.coin();
      const noms = [], poisons = [];
      for (const id of P) {
        farm.take(id, 1); savoir.identifier(id);
        noms.push(this.vraiNom(id));
        if (ITEMS[id].poison) poisons.push(this.vraiNom(id).toLowerCase());
        if ((n.d.loves || []).includes(id)) npcs.addAmitie(n, 60);
      }
      npcs.addAmitie(n, 10);
      sound.page && sound.page();
      let t = pick(D.tout) + ' ' + `Voilà ce que vous portiez : ${noms.join(', ')}.`;
      if (poisons.length) t += ' ' + `Et surtout, ne mangez jamais ceci : ${poisons.join(', ')}.`;
      t += ' ' + 'J’en garde un brin de chaque, pour l’herbier. Ne discutez pas.';
      return talk.view(t, talk.options());
    }
    return talk.view('…', talk.options());
  },

  // ================================================================ la table d'alchimiste
  cle(ids) { return ids.filter(Boolean).slice().sort().join('+'); },
  // le mélange : somme des essences, contraires annulés, ce qui domine décide
  calculer(ids) {
    const ALL = Object.keys(ESSENCE_NAMES), S = {};
    for (const e of ALL) S[e] = 0;
    for (const id of ids) { const E = ESSENCES[id]; if (E) for (const e in E) S[e] = (S[e] || 0) + E[e]; }
    for (const [a, b] of ESSENCE_OPP) { const d = S[a] - S[b]; S[a] = Math.max(0, d); S[b] = Math.max(0, -d); }
    const o = ALL.slice().sort((a, b) => S[b] - S[a] || ALL.indexOf(a) - ALL.indexOf(b));
    const [e1, e2, e3] = o, v1 = S[e1], v2 = S[e2], v3 = S[e3];
    const R = { res: 'bouillie', fort: false };
    if (v1 < 2) return R;                                                                            // tout s'est annulé
    R.fort = v1 >= 8;
    if (v3 >= 2 && v3 >= v1 * 0.75) { R.res = S.mort >= 2 ? 'fiole_poison' : 'mixture'; return R; } // trois essences qui se disputent
    let r = ALCH_SINGLE[e1];
    if (v2 >= 2 && v2 >= v1 * 0.5) {                                                                // deux essences fortes
      const p = ALCH_PAIRS[[e1, e2].sort().join('+')];
      if (p === 'mixture') { R.res = S.mort >= 2 ? 'fiole_poison' : 'mixture'; return R; }
      if (p && v1 + v2 >= (this.FORCE[p] || 4)) r = p;                                              // assez fort pour la potion rare
    }
    R.res = ITEMS[r] ? r : 'mixture';
    return R;
  },
  // les fioles d'ingrédients (rosée, eau bénite, venin) reviennent vides
  FIOLES: new Set(['rosee', 'eau_benite', 'venin']),
  ouvrirTable(src) {
    this.css();
    if (!$('#alchtable')) { const d = document.createElement('div'); d.id = 'alchtable'; d.className = 'pp-panel'; $('#paper').appendChild(d); }
    const T = this.table;
    T.src = src || 'ferme'; T.res = null; T.msg = ''; T.busy = false;
    ui.open('#alchtable');
    this.rendreTable();
  },
  rendreTable() {
    const el = $('#alchtable');
    if (!el || !farm.s) return;
    const s = farm.s, T = this.table, A = this.S();
    // les ingrédients qu'on n'a plus sortent du mélange
    const cpt = {};
    T.slots = T.slots.map((k) => { if (!k) return null; cpt[k] = (cpt[k] || 0) + 1; return farm.count(k) >= cpt[k] ? k : null; });
    const used = {};
    for (const k of T.slots) if (k) used[k] = (used[k] || 0) + 1;
    const ings = Object.keys(s.inv).filter((k) => ESSENCES[k] && ITEMS[k] && s.inv[k] > (used[k] || 0)).sort((a, b) => itemName(a).localeCompare(itemName(b)));
    const pris = T.slots.filter(Boolean), cle = this.cle(pris), deja = pris.length >= 2 ? A.essais[cle] : null;
    const fioles = farm.count('fiole');
    const guess = pris.length < 2 ? 'Deux à quatre ingrédients, et une fiole vide. Ce qui en sortira, personne ne le sait d’avance.'
      : deja ? `Vous avez déjà essayé ce mélange : ${this.nomRes(deja.r)}.` : 'Vous n’avez jamais essayé ce mélange.';
    const recents = Object.keys(A.essais).sort((a, b) => (A.essais[b].t || 0) - (A.essais[a].t || 0)).slice(0, 6);
    const titre = T.src === 'echoppe' ? 'La table de l’alchimiste' : 'Table d’alchimiste';
    el.innerHTML = `<div class="tabs"><b>${esc(titre)}</b><button class="x" data-close>✕</button></div>
      <div class="body two">
        <div><h4>Ingrédients</h4><div class="grid">${ings.map((k) => `<button class="it" data-ting="${k}" title="${esc(itemName(k) + (ITEMS[k].desc ? ' — ' + ITEMS[k].desc : ''))}"><img src="${iconURL(k)}" alt=""><span>${esc(itemName(k))}</span><i>${s.inv[k] - (used[k] || 0)}</i></button>`).join('') || '<p class="hint">Rien qui puisse aller sur la table. Des plantes, des champignons, des plumes, des os, des pierres, des poissons… presque tout porte quelque chose.</p>'}</div></div>
        <div><h4>Le mélange</h4>
          <div class="alch-slots">${T.slots.map((k, i) => `<button class="alch-slot" data-tslot="${i}" title="${k ? esc(itemName(k)) + ' — clic : retirer' : 'vide'}">${k ? `<img src="${iconURL(k)}" alt="">` : '<span>+</span>'}</button>`).join('')}</div>
          <p class="alch-guess">${esc(guess)}</p>
          <button class="close brew" data-mix ${pris.length >= 2 && fioles && !T.busy ? '' : 'disabled'}>${T.busy ? 'Ça bout…' : 'Mêler'} <small>(fioles vides : ${fioles})</small></button>
          ${T.msg ? `<p class="alch-guess">${esc(T.msg)}</p>` : ''}
          ${T.res ? `<div class="alch-res"><img src="${iconURL(T.res.id)}" alt=""><span>${esc(T.res.texte)}</span></div>` : ''}
          <h4>Derniers essais</h4>${recents.map((k) => this.ligneEssai(k, A.essais[k])).join('') || '<p class="hint">Aucun. Tout le carnet est à écrire.</p>'}
          <p class="hint">Le carnet complet est dans la sacoche (onglet Grimoire).</p>
        </div>
      </div>`;
    $('#alchtable [data-close]').onclick = () => ui.close();
    $$('#alchtable [data-ting]').forEach((b) => (b.onclick = () => { const i = T.slots.indexOf(null); if (i < 0 || T.busy) return; T.slots[i] = b.dataset.ting; T.res = null; T.msg = ''; sound.tick && sound.tick(); this.rendreTable(); }));
    $$('#alchtable [data-tslot]').forEach((b) => (b.onclick = () => { if (T.busy) return; T.slots[+b.dataset.tslot] = null; T.res = null; sound.tick && sound.tick(); this.rendreTable(); }));
    const mb = $('#alchtable [data-mix]'); if (mb) mb.onclick = () => this.meler();
  },
  nomRes(r) { return r === 'bouillie' ? 'rien de bon' : r === 'mixture' ? 'une mixture douteuse' : itemName(r); },
  ligneEssai(k, E) {
    const ids = k.split('+');
    return `<div class="alc-x"><span>${ids.map((id) => `<img src="${iconURL(id)}" alt="">${esc(itemName(id))}`).join(' + ')}</span> → <b class="${E.r === 'bouillie' || E.r === 'mixture' || E.r === 'fiole_poison' ? 'n' : 'y'}">${esc(this.nomRes(E.r))}</b>${E.n > 1 ? ` <i>×${E.n}</i>` : ''}</div>`;
  },
  meler() {
    const T = this.table, ids = T.slots.filter(Boolean);
    if (ids.length < 2 || T.busy) return;
    const need = {};
    for (const k of ids) need[k] = (need[k] || 0) + 1;
    if (!farm.count('fiole')) { T.msg = 'Il faut une fiole vide pour recueillir ce qui sortira.'; this.rendreTable(); return; }
    T.busy = true; T.res = null; T.msg = '';
    this.rendreTable();
    sound.bubble2 && sound.bubble2();
    setTimeout(() => sound.bubble2 && sound.bubble2(), 650);
    setTimeout(() => {
      T.busy = false;
      if (!farm.s || !farm.count('fiole') || !Object.keys(need).every((k) => farm.count(k) >= need[k])) { if (ui.panel === '#alchtable') this.rendreTable(); return; }
      const s = farm.s, A = this.S();
      for (const k in need) farm.take(k, need[k]);
      let rendues = 0;
      for (const k of ids) if (this.FIOLES.has(k)) rendues++;
      if (rendues) farm.give('fiole', rendues);
      const R = this.calculer(ids);
      const doses = R.fort && R.res !== 'bouillie' && farm.count('fiole') >= 2 ? 2 : 1;
      farm.take('fiole', doses);
      farm.give(R.res, doses);
      const cle = this.cle(ids), neuf = !A.essais[cle];
      const E = A.essais[cle] || (A.essais[cle] = { r: R.res, n: 0, j: s.day });
      E.r = R.res; E.n++; E.j = s.day; E.t = ++A.seq;
      const inedit = !A.potions[R.res];
      if (R.res !== 'bouillie') this.noterPotion(R.res, 'f');
      s.stats.potions = (s.stats.potions || 0) + (R.res === 'bouillie' ? 0 : 1);
      const nom = itemName(R.res) + (doses > 1 ? ' ×2' : '');
      T.res = { id: R.res, texte: R.res === 'bouillie' ? 'Rien de bon : une bouillie grise, sans goût ni couleur.' : R.res === 'mixture' ? 'Ça bout, ça siffle, ça tourne : une mixture douteuse.' : R.res === 'fiole_poison' ? `Un liquide sombre, qui sent l’amande amère : ${nom}.` : `Il en sort : ${nom}.` };
      T.msg = neuf ? (inedit && R.res !== 'bouillie' && R.res !== 'mixture' ? 'Un résultat que vous n’aviez jamais obtenu. Vous le notez au carnet.' : 'Vous notez le mélange au carnet.') : '';
      sound.pop && sound.pop();
      if (R.res === 'fiole_poison' || R.res === 'fiel_noir') sound.hiss && sound.hiss();
      if (T.src === 'echoppe') this.commentaire(R.res);
      if (ui.panel === '#alchtable') this.rendreTable();
    }, 1400);
  },
  commentaire(r) {
    const n = npcs.byId.alchimiste;
    if (!n || !n.st.alive || Math.random() < 0.4) return;
    const D = this.DIT.table;
    const t = r === 'bouillie' ? pick(D.bouillie) : r === 'mixture' ? pick(D.mixture) : (r === 'fiole_poison' || r === 'fiel_noir' || r === 'appat_empoisonne') ? pick(D.poison) : (this.FORCE[r] || 0) >= 6 ? pick(D.rare) : pick(D.bien);
    setTimeout(() => npcs.say(n, t, 3.5), 400);
  },
  // la table de l'échoppe : l'alchimiste doit être vivant, là, et vous tolérer
  tableEchoppe() {
    const n = npcs.byId.alchimiste, p = game.player;
    if (!n || !n.st.alive) { ui.subtitle('', '(Des scellés de cire sur les tiroirs. Personne ne touchera plus aux fioles de l’alchimiste.)', 4); return; }
    const recherche = typeof societe !== 'undefined' && typeof societe.recherche === 'function' && societe.recherche();
    if (npcs.murdererKnown() || recherche || n.st.anger > 0 || (n.st.amitie || 0) < 0) { npcs.say(n, pick(this.DIT.table.refus), 3); return; }
    if (n.state === 'sleep') { ui.subtitle('', '(L’alchimiste dort. Mieux vaut ne pas toucher à ses fioles sans lui.)', 3.5); return; }
    if (n.vanished || Math.hypot(n.x - p.pos[0], n.z - p.pos[2]) > 20) { ui.subtitle('', '(L’alchimiste n’est pas là. Mieux vaut ne pas toucher à ses fioles sans lui.)', 3.5); return; }
    const A = this.S(), lvl = npcs.level(n), prix = lvl >= 6 ? 0 : lvl >= 3 ? 4 : 8;
    if (!prix || A.tableJour === farm.s.day) { this.ouvrirTable('echoppe'); return; }
    ui.choice('La table de l’alchimiste', `${n.name} vous prête sa table pour la journée, contre ${prix} pièces. Les fioles ne sont pas fournies.`, [
      { label: `Payer ${prix} pièces`, fn: () => { if (!farm.pay(prix)) { ui.close(); npcs.say(n, 'Revenez quand vous aurez de quoi. La table ne s’envolera pas.', 3); return; } A.tableJour = farm.s.day; sound.coin && sound.coin(); this.ouvrirTable('echoppe'); } },
      { label: 'Non merci', fn: () => ui.close() },
    ]);
  },

  // ================================================================ le carnet
  noterPotion(id, champ) {
    if (!ITEMS[id]) return;
    const A = this.S(), P = A.potions[id] || (A.potions[id] = {});
    if (champ === 'b') { P.b = P.b || farm.s.day; P.nb = (P.nb || 0) + 1; }
    else P.f = P.f || farm.s.day;
  },
  carnetHTML() {
    const s = farm.s, A = this.S();
    let body = '';
    // plantes nommées
    const toutes = Object.keys(this.VRAI), connues = toutes.filter((id) => savoir.planteConnue(id));
    body += `<h4>Plantes nommées par l’alchimiste (${connues.length} / ${toutes.length})</h4>`;
    body += connues.length ? `<div class="alc-pl">${connues.sort((a, b) => this.vraiNom(a).localeCompare(this.vraiNom(b))).map((id) => `<span title="${esc(PLANT_LOOK[id][1])}"><img src="${iconURL(id)}" alt="">${esc(this.vraiNom(id))} <i>— ${esc(PLANT_LOOK[id][0].toLowerCase())}</i></span>`).join('')}</div>` : '<p class="hint">Aucune. Les plantes sauvages qu’on cueille n’ont pas de nom tant qu’on ne les a pas montrées à l’alchimiste de la ville.</p>';
    const inc = this.portees();
    if (inc.length) body += `<p class="hint">Dans votre sacoche, inconnues : ${inc.map((id) => esc(itemName(id).toLowerCase())).join(', ')}.</p>`;
    // potions
    const ids = new Set(Object.keys(A.potions).filter((id) => ITEMS[id]));
    for (const id in POTIONS) if (alchemy.known(id)) ids.add(id);
    const par = {};
    for (const k in A.essais) { const r = A.essais[k].r; if (!par[r] || (A.essais[k].t || 0) > (A.essais[par[r]].t || 0)) par[r] = k; }
    body += `<h4>Potions (${ids.size})</h4>`;
    body += [...ids].sort((a, b) => itemName(a).localeCompare(itemName(b))).map((id) => {
      const P = A.potions[id] || {}, Po = POTIONS[id];
      const effet = P.b ? (Po ? Po.desc : ITEMS[id].desc || '') : 'Pas encore goûtée : on ne sait pas ce qu’elle fait.';
      const alamb = Po && Po.need && alchemy.known(id) ? `<div class="need">À l’alambic : ${Po.need.map((k) => `<span class="${farm.count(k) ? 'y' : 'n'}"><img src="${iconURL(k)}" alt="">${esc(itemName(k))}</span>`).join('')}</div>` : '';
      const tab = par[id] ? `<div class="need">À la table : ${par[id].split('+').map((k) => `<span class="${farm.count(k) ? 'y' : 'n'}"><img src="${iconURL(k)}" alt="">${esc(itemName(k))}</span>`).join('')}</div>` : '';
      return `<div class="rec"><img class="big" src="${iconURL(id)}" alt=""><div><b>${esc(itemName(id))}</b>${P.nb ? ` <i class="st">bue ${P.nb} fois</i>` : ''}${alamb}${tab}<div class="st">${esc(effet)}</div></div></div>`;
    }).join('') || '<p class="hint">Aucune encore.</p>';
    // expériences
    const ks = Object.keys(A.essais).sort((a, b) => (A.essais[b].t || 0) - (A.essais[a].t || 0));
    body += `<h4>Essais à la table d’alchimiste (${ks.length})</h4>`;
    body += ks.map((k) => this.ligneEssai(k, A.essais[k])).join('') || '<p class="hint">Aucun. L’alchimiste de la ville prête sa table ; on peut aussi en fabriquer une, ou en acheter une.</p>';
    // l'alambic et les pages du frère Anselme (l'ancien grimoire)
    const pages = s.flags.grimoire && typeof LORE_TEXT !== 'undefined' && LORE_TEXT.abbaye && LORE_TEXT.abbaye.grimoire_pages;
    if (pages) body += '<h4>Pages du frère Anselme</h4>' + pages.map((p, i) => `<button class="note" data-page="${i}">Page ${i + 1}</button>`).join('');
    body += '<p class="hint">Chaque chose porte des essences, disent les alchimistes : les contraires se mangent, ce qui domine l’emporte. On ne les voit pas ; on note ce qu’on a mêlé, et ce qui en est sorti. Un alambic suit des recettes ; une table d’alchimiste, non.</p>';
    setTimeout(() => $$('#satchel [data-page]').forEach((b) => (b.onclick = () => ui.read('Grimoire — page ' + (+b.dataset.page + 1), fmtLine(pages[+b.dataset.page], null)))), 0);
    return body;
  },

  // ================================================================ boire
  NOUVELLES: new Set(['fiole_poison', 'potion_chaleur', 'potion_sang_froid', 'potion_regeneration', 'baume_moelle', 'eau_lustrale', 'potion_givre', 'philtre_morts',
    'appat_empoisonne', 'fiel_noir', 'potion_soleil', 'potion_peau_pierre', 'potion_memoire', 'potion_songe', 'bouillie']),
  // renvoie true si la potion est l'une des nôtres (bue ou refusée)
  boire(id) {
    if (!this.NOUVELLES.has(id)) return false;
    const say = (t, d) => ui.subtitle('', '(' + t + ')', d || 3.5);
    if (id === 'appat_empoisonne') { say('De la viande noircie, qui sent l’amande amère. Non. Ça se pose, ça ne se mange pas.'); return true; }
    if ((id === 'fiole_poison' || id === 'fiel_noir') && !(this.confirmT[id] > performance.now())) {
      this.confirmT[id] = performance.now() + 4000;
      say(id === 'fiole_poison' ? 'Ça ne se boit pas. Vous le savez. Si vous y tenez vraiment, recommencez.' : 'Personne ne sait pourquoi on fabrique ça. Si vous y tenez vraiment, recommencez.');
      return true;
    }
    if (!farm.take(id, 1)) return true;
    this.confirmT[id] = 0;
    const P = POTIONS[id] || { col: '#8a8478', h: 0 }, p = game.player, s = farm.s;
    play.eatT = 0.8; play.cool = Math.max(play.cool, 0.6); sound.eat && sound.eat();
    farm.give('fiole', 1);
    alchemy.flashCol = hexToRgb(P.col).map((v) => v / 255); alchemy.flashT = 1.2;
    switch (id) {
      case 'bouillie': play.nausea = Math.max(play.nausea || 0, 4); say('Ça ne sent rien, ça n’a aucun goût, et ça colle aux dents. Au moins, la fiole est vide.'); break;
      case 'potion_chaleur': BUFF.add('chaleur', P.h); say('Un feu doux s’allume au creux du ventre. Le froid peut toujours venir.'); break;
      case 'potion_sang_froid': BUFF.add('sang_froid', P.h); say('Votre cœur ralentit. Vous pourriez regarder n’importe quoi en face, maintenant.'); break;
      case 'potion_regeneration': BUFF.add('regeneration', P.h); corps.panser(); p.hp = Math.min(100, p.hp + 10); say('Ça picote partout où vous avez mal. Les plaies se referment, lentement.'); break;
      case 'baume_moelle':
        if (corps.soignerJambe(true)) { corps.C().attelle = 0; say('Une chaleur de moelle et de suif descend dans la jambe. L’os se ressoude, comme une braise qui se referme.', 4.5); }
        else { p.hp = Math.min(100, p.hp + 10); say('Un goût de suif et de moelle. Vos os vont bien. Ils allaient déjà bien.'); }
        break;
      case 'eau_lustrale':
        // les malédictions (module de l'agent D : malediction) : son emballage d'alchemy.drink lave les petites
        // après la gorgée (malediction.leverPetites) et le dit ; sans ce module, il n'y a rien à laver
        if (typeof malediction === 'undefined') say('L’eau est froide comme une source. Vous vous sentez lavé. Rien ne s’en va : il n’y avait rien.', 4.5);
        break;
      case 'potion_givre':
        if (corps.panser()) say('Un froid bleu court dans vos veines. Le sang se fige dans la plaie.');
        else say('Un froid bleu vous traverse. Vos lèvres gèlent un instant.');
        break;
      case 'philtre_morts': BUFF.add('morts', P.h); this.tMorts = 3; sound.whisper && sound.whisper(0, 0.4); say('Le monde se tait. Puis, derrière le silence, des voix.', 4); break;
      case 'fiole_poison': {
        const A = this.S();
        A.poison = { k: 0.5, t: 240, cause: 'Empoisonné, d’une fiole qu’il ne fallait pas boire' };
        play.hurt(8, null, A.poison.cause); play.nausea = Math.max(play.nausea || 0, 20);
        say('Un goût d’amande amère. Votre gorge se serre. Il faudrait un antidote, et vite.', 4.5);
        break;
      }
      case 'fiel_noir':
        corps.saigner(0.3, 'Le fiel noir, bu jusqu’à la lie');
        play.nausea = Math.max(play.nausea || 0, 30); strange.glitchT = Math.max(strange.glitchT || 0, 1.6);
        sound.whisper && sound.whisper(Math.random() * 2 - 1, 0.7);
        say('C’est noir, épais, et ça remonte. Vous crachez du sang. Beaucoup.', 4.5);
        break;
      case 'potion_soleil': BUFF.add('soleil', P.h); say('Une lumière dorée derrière les paupières. Le monde vous paraît moins cru.'); break;
      case 'potion_peau_pierre': BUFF.add('peau_pierre', P.h); say('Votre peau durcit et grisonne, comme un vieux mur.'); break;
      case 'potion_memoire': say(this.memoire(), 6); break;
      case 'potion_songe': BUFF.add('songe', P.h); say('Vos paupières s’alourdissent. La nuit prochaine, vous rêverez de quelque chose de vrai.', 4); break;
    }
    if (id !== 'bouillie') this.noterPotion(id, 'b');
    for (const fn of this.onBoire) try { fn(id); } catch (e) { console.error(e); }
    void s;
    return true;
  },
  // eau de mémoire : des mots des langues perdues, et les lieux des cartes qu'on porte
  memoire() {
    const w = game.world, dits = [];
    for (const [lang, k] of [['aelin', 6], ['gorrain', 4]]) {
      const L = typeof LANGUES !== 'undefined' && LANGUES[lang];
      if (!L || !L.lex) continue;
      const inc = Object.keys(L.lex).filter((m) => !savoir.motConnu(lang, m));
      for (let i = inc.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [inc[i], inc[j]] = [inc[j], inc[i]]; }
      const pris = inc.slice(0, k);
      if (!pris.length) continue;
      savoir.apprendreMots(lang, pris);
      for (const m of pris.slice(0, 2)) dits.push(`« ${m} », ${L.lex[m]}`);
    }
    let lieux = 0;
    for (const id in farm.s.inv) {
      const it = ITEMS[id];
      if (!it || it.use !== 'region' || !(farm.s.inv[id] > 0) || typeof CARTES_REGIONS === 'undefined') continue;
      const C = CARTES_REGIONS[it.region];
      if (!C) continue;
      for (const k in w.lm) {
        const L = w.lm[k];
        if (lieux >= 4 || L.secret || L.under || savoir.lieuConnu(k) || Math.hypot(L.x - C.x, L.z - C.z) > C.r) continue;
        if (savoir.connaitreLieu(k)) lieux++;
      }
    }
    let t = dits.length ? `Des mots vous reviennent, d’une enfance que vous n’avez pas eue : ${dits.join(' ; ')}…` : 'L’eau a un goût de pierre mouillée. Vous vous souvenez de tout ce que vous saviez déjà.';
    if (lieux) t += ' ' + 'Et des chemins où vous n’êtes jamais allé vous semblent familiers.';
    return t;
  },

  // ================================================================ poisons et appâts
  // Une bête qui mord un appât empoisonné (ou que l'on empoisonne autrement) titube, puis meurt.
  // API pour les autres modules (chasse, pièges) : alchimie.empoisonner(e[, force])
  BETES_APPAT: new Set(['wolf', 'fox', 'boar', 'bear', 'lynx', 'badger', 'martre', 'dog', 'cat', 'hedgehog', 'otter', 'bete']),
  empoisonner(e, force) {
    if (!e || e.dead || e.poison || e.cfg.boss) return false;
    e.poison = { t: (force || 1) * (6 + Math.random() * 8) };
    if (!this.agonie.includes(e)) this.agonie.push(e);
    return true;
  },
  // un piège garni d'un appât empoisonné (objet posé : q.data.appat === 'poison')
  appatDans(q) { return !!(q && q.data && q.data.appat === 'poison'); },
  retirerAppat(q) { if (this.appatDans(q)) farm.setPropData(q, { appat: null }); },
  poserAppat(x, y, z) { this.S().appats.push({ x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100, z: Math.round(z * 100) / 100, r: Math.random() * TAU, j: farm.s.day }); },
  majBetes(dt) {
    for (let i = this.agonie.length - 1; i >= 0; i--) {
      const e = this.agonie[i];
      if (!e || e.dead || e.removed) { this.agonie.splice(i, 1); continue; }
      e.poison.t -= dt;
      if (!(e.stun > 0) && Math.random() < dt * 0.7) e.stun = 0.5 + Math.random() * 0.8; // elle titube
      if (e.poison.t <= 0) { this.agonie.splice(i, 1); this.mourir(e); }
    }
  },
  mourir(e) {
    e.dead = true; e.corpse = true; e.empoisonne = true; e.hidden = false; e.move = 0; e.stun = 0; e.state = 'sheltered';
    this.carcasses.push({ e, kind: e.kind });
    const p = game.player;
    if (Math.hypot(e.x - p.pos[0], e.z - p.pos[2]) < 30) sound.hurtAnimal && sound.hurtAnimal(e.kind);
  },
  depouiller(c) {
    const P = PREY[c.kind], e = c.e, got = [];
    if (P) for (const [item, a, b, pr] of P.drop) {
      if (item === 'viande' || !ITEMS[item]) continue;
      if (pr !== undefined && Math.random() > pr) continue;
      const n = a + Math.floor(Math.random() * (b - a + 1));
      if (n > 0) { farm.give(item, n); play.flyer(item, [e.x, e.y + 0.4, e.z], n); got.push(item); }
    }
    e.corpse = false; e.hidden = true;
    this.carcasses.splice(this.carcasses.indexOf(c), 1);
    sound.pop && sound.pop();
    ui.subtitle('', got.length ? '(La bête a la gueule noire. La viande est perdue ; le reste, non.)' : '(La bête a la gueule noire. Il n’y a rien à en tirer.)', 3);
  },
  majAppats() {
    const A = farm.s.alch;
    if (!A || !A.appats || !A.appats.length) return;
    const p = game.player, d0 = farm.s.day;
    for (let i = A.appats.length - 1; i >= 0; i--) {
      const b = A.appats[i];
      if (d0 - b.j > 5) { A.appats.splice(i, 1); continue; } // il a pourri
      if (Math.hypot(b.x - p.pos[0], b.z - p.pos[2]) > 200) continue;
      for (const e of entities.list) {
        if (e.dead || e.hidden || e.far || e.owner || e.cfg.fly || e.poison || !this.BETES_APPAT.has(e.kind)) continue;
        const d = Math.hypot(e.x - b.x, e.z - b.z);
        if (d < 1.4) { A.appats.splice(i, 1); this.empoisonner(e); if (Math.hypot(b.x - p.pos[0], b.z - p.pos[2]) < 25) sound.growl && sound.growl(0.3); break; }
        if (d < 32 && e.state !== 'flee' && e.state !== 'charge' && e.tx !== b.x) entities.goTo(e, b.x, b.z, 'walk');
      }
    }
  },
  majPoison(dt) {
    const A = farm.s.alch, P = A && A.poison;
    if (!P) return;
    if (BUFF.on('antidote')) { A.poison = null; ui.subtitle('', '(L’antidote brûle, puis apaise. Le poison recule.)', 3); return; }
    const p = game.player;
    P.t -= dt;
    p.hp -= P.k * dt;
    play.nausea = Math.max(play.nausea || 0, 0.8);
    if (p.hp <= 0) { A.poison = null; game.die(P.cause); return; }
    if (P.t <= 0) { A.poison = null; ui.subtitle('', '(Le poison a fini son œuvre. Vous êtes encore là. À peine.)', 3.5); }
  },

  // ================================================================ philtre des morts, songe
  majMorts(dt) {
    this.tMorts -= dt;
    if (this.tMorts > 0) return;
    this.tMorts = 7 + Math.random() * 5;
    const t = this.voixMort();
    if (!t) return;
    sound.whisper && sound.whisper(Math.random() * 2 - 1, 0.6);
    ui.subtitle('', t, 5);
  },
  // l'assassin encore libre, s'il a déjà un nom (sinon null)
  assassin() {
    const S = strange.s;
    if (!S || !S.killer || S.kDead || S.kCaught) return null;
    const n = npcs.byId[S.killer];
    return n && n.st.alive ? n : null;
  },
  voixMort() {
    const s = farm.s, w = game.world, p = game.player, D = this.DIT;
    // près d'une tombe : son mort parle
    const g = (w.inter || []).find((it) => it.kind === 'grave' && it.data && it.data.who && Math.hypot(it.x - p.pos[0], it.z - p.pos[2]) < 12);
    const k = this.assassin();
    const tues = s.dead.filter((d) => npcs.byId[d.id]);
    let d = g ? tues.find((x) => x.id === g.data.who) : null;
    if (!d && tues.length && Math.random() < 0.75) d = pick(tues);
    if (d) {
      if (d.by === 'tueur' && k) return `(${d.name}, tout près de votre oreille : « ${this.TRACES[k.id] || this.TRACES.defaut} »)`;
      if (d.by === 'joueur') return pick(D.morts.joueur)(d.name);
      return pick(D.morts.autre)(d.name);
    }
    return pick(D.morts.vallee);
  },
  rever() {
    const s = farm.s, w = game.world, F = w.farm && w.farm.f, D = this.DIT;
    BUFF.end('songe');
    const cand = [];
    const k = this.assassin();
    if (k && strange.killerPhase() >= 1) cand.push(['tueur', 4]);
    const P = this.portees().concat(Object.keys(this.VRAI).filter((id) => this.inconnue(id) && savoir.vu(this.objetDe(id))));
    if (P.length) cand.push(['plante', 3]);
    const lieux = Object.keys(w.lm || {}).filter((key) => !savoir.lieuConnu(key) && !w.lm[key].under && w.lm[key].name && w.lm[key].name !== key);
    if (lieux.length && F) cand.push(['lieu', 3]);
    let tot = 0; for (const c of cand) tot += c[1];
    let r = Math.random() * tot, choix = 'rien';
    for (const c of cand) { r -= c[1]; if (r <= 0) { choix = c[0]; break; } }
    let t = pick(D.songe.rien);
    if (choix === 'tueur') t = `Vous rêvez d’un masque de toile blanche. Quelqu’un le plie avec soin, et le range. ${this.TRACES[k.id] || this.TRACES.defaut} Au réveil, vous savez que ce rêve était vrai.`;
    else if (choix === 'plante') {
      const id = pick(P);
      t = `Vous rêvez d’un herbier ouvert, éclairé par une bougie. Sur la planche, une plante que vous connaissez de vue : « ${PLANT_LOOK[id][0].toLowerCase()} ». Dessous, d’une écriture fine, un nom : ${this.vraiNom(id)}. Au réveil, vous vous en souvenez parfaitement.`;
      savoir.identifier(id);
    } else if (choix === 'lieu') {
      const key = pick(lieux), L = w.lm[key], n0 = L.name;
      const nom = /^les /i.test(n0) ? 'aux ' + n0.slice(4) : /^le /i.test(n0) ? 'au ' + n0.slice(3) : 'à ' + n0;
      const dx = L.x - F.x, dz = L.z - F.z, dist = Math.hypot(dx, dz);
      const dir = w.cardinal ? w.cardinal(Math.atan2(dx, dz)) : 'le lointain';
      const loin = dist < 250 ? 'un moment' : dist < 650 ? 'longtemps' : 'des heures';
      t = `Vous rêvez que vous quittez la ferme et que vous marchez ${loin}, vers ${dir}. Vous arrivez ${nom}. Tout y est exactement comme ce sera. Au réveil, vous savez que cet endroit existe.`;
      savoir.connaitreLieu(key);
    }
    setTimeout(() => { if (farm.s && !game.dying) ui.read('Un songe', t, 'Noté au réveil, d’une main encore lourde.'); }, 300);
  },
  objetDe(itemId) { for (const t of OBJ_TYPES) { const H = HARVEST[t.id]; if (H && H.drop && H.drop[0] && H.drop[0][0] === itemId) return t.id; } return itemId; },

  // ================================================================ style
  css() {
    if ($('#alchimie-css')) return;
    const st = document.createElement('style');
    st.id = 'alchimie-css';
    st.textContent = `#alchtable { height: min(640px, calc(100vh - 10vh)); }
#alchtable .alch-slots { display: flex; gap: 8px; margin: 6px 0; }
#alchtable .alch-slot { width: 58px; height: 58px; border: 2px dashed rgba(90,70,40,.4); background: rgba(255,255,255,.3); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 22px; color: #8a7a5a; }
#alchtable .alch-slot img { width: 40px; height: 40px; image-rendering: pixelated; }
#alchtable .alch-guess { font-size: 14px; font-style: italic; color: #5a4a36; min-height: 1.4em; margin: 4px 0; }
#alchtable .brew { margin: 4px 0 8px; }
#alchtable .alch-res { display: flex; align-items: center; gap: 8px; padding: 6px 8px; background: rgba(255,230,170,.6); border: 1px solid #8a5a2a; border-radius: 4px; font-size: 15px; margin-bottom: 8px; }
#alchtable .alch-res img { width: 36px; height: 36px; image-rendering: pixelated; }
.pp-panel .alc-x { font-size: 13px; padding: 3px 0; border-bottom: 1px dashed rgba(90,70,40,.2); }
.pp-panel .alc-x img { width: 18px; height: 18px; image-rendering: pixelated; vertical-align: -4px; margin-right: 2px; }
.pp-panel .alc-x i { color: #7a6a52; font-size: 12px; }
.pp-panel .alc-pl { display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: 13px; }
.pp-panel .alc-pl img { width: 18px; height: 18px; image-rendering: pixelated; vertical-align: -4px; margin-right: 3px; }
.pp-panel .alc-pl i { color: #7a6a52; }`;
    document.head.appendChild(st);
  },
};

// ---------------------------------------------------------------- les vrais noms, mis de côté (les plantes n'ont d'abord que leur allure)
{
  const OBJ_DE = {};
  for (const t of OBJ_TYPES) { const H = HARVEST[t.id]; const it = H && H.drop && H.drop[0] && H.drop[0][0]; if (it && PLANT_LOOK[it] && !OBJ_DE[it]) OBJ_DE[it] = t.id; }
  for (const id in PLANT_LOOK) {
    if (!ITEMS[id]) continue;
    const notice = typeof NOTICE_PLANTES !== 'undefined' && (NOTICE_PLANTES[OBJ_DE[id]] || NOTICE_PLANTES[id]);
    alchimie.VRAI[id] = { name: ITEMS[id].name, desc: ITEMS[id].desc || notice || '' };
  }
  alchimie.appliquerNoms();
}
savoir.onPlante.push((id) => {
  alchimie.appliquerNoms();
  if (alchimie.VRAI[id]) ui.subtitle('', `(Vous savez maintenant ce que c’est : ${alchimie.vraiNom(id)}.)`, 3.5);
});

// ---------------------------------------------------------------- ce que dit l'alchimiste (Fauvel : savant, distrait)
alchimie.REM = {
  ail_ours: 'De l’ail des ours. Ça se mange, ça sent fort, et ça ressemble au colchique comme un frère. Regardez toujours deux fois.',
  muguet: 'Du muguet. Joli, parfumé, et assez de poison dans une clochette pour arrêter un cœur. On l’offre en mai. Je n’ai jamais compris.',
  millepertuis: 'Du millepertuis. Tenez-le contre le jour : les petits trous, vous voyez ? On dit qu’il chasse les démons. Il chasse surtout la mélancolie.',
  valeriane: 'De la valériane. Ça pue, ça endort, et les chats en deviennent fous. La guérisseuse en met partout.',
  sauge: 'De la sauge. « Qui a de la sauge dans son jardin n’a pas besoin de médecin. » C’est faux, mais c’est joli.',
  serpolet: 'Du serpolet, le thym des pauvres. En infusion, contre la toux. Sur un lapin, contre la faim.',
  arnica: 'De l’arnica ! Pour les coups et les bosses. En onguent, surtout pas en tisane : ça vous retournerait le ventre.',
  genepi: 'Du génépi. Les bergers en font une liqueur qui réchauffe jusqu’aux orteils. Je ne vous dirai pas comment. Si, plus tard.',
  joubarbe: 'De la joubarbe. On la met sur les toits contre la foudre. Moi, je la mets sur les brûlures. Ça marche mieux.',
  lichen: 'Du lichen d’Islande. Amer comme un sermon, mais nourrissant. Les rennes en vivent. Vous n’êtes pas un renne.',
  aconit: 'De l’aconit. Lavez-vous les mains. Maintenant. Non, vraiment : maintenant. C’est le plus violent poison de nos montagnes.',
  rossolis: 'Un rossolis ! Une plante qui mange les mouches. La nature a de l’humour, et il est noir.',
  menthe_eau: 'De la menthe aquatique. Fraîche, digeste. Poussée les pieds dans la vase, comme moi dans mes carnets.',
  prele: 'De la prêle. Pleine de silice : on en récure les casseroles. Et on en fait des tisanes pour les os.',
  cresson: 'Du cresson. Ça se mange. Pas celui des mares où boivent les moutons, à cause des douves du foie. Oui, ça existe.',
  girolle: 'Des girolles. Excellentes, dans une omelette. Méfiez-vous de leurs fausses sœurs orange, qui vous feraient passer une mauvaise nuit.',
  cepe: 'Un cèpe. Le roi de la forêt. Si vous en trouvez d’autres, je veux savoir où. Non, ne dites rien. Je comprends.',
  amanite: 'L’amanite tue-mouches. Ne la mangez pas. Certains la mangent quand même, pour voir des choses. Ils les voient, puis on les enterre.',
  trompette: 'Des trompettes-de-la-mort. Le nom est affreux, le goût est divin. La mort, pour une fois, n’y est pour rien.',
  morille: 'Une morille ! Crue, elle rend malade ; cuite, elle rend heureux. C’est toute la morale de la cuisine.',
  lycopode: 'Du lycopode. Secouez-le : cette poudre jaune s’enflamme d’un coup. Les montreurs de foire en font leurs éclairs.',
  belladone_baies: 'Des baies de belladone. Belle dame. Trois baies, et l’on voit tout très grand, puis plus rien du tout. Jetez-les. Non : donnez-les-moi.',
  perce_neige: 'Un perce-neige. Il sort avant tout le monde, par défi. On en tire, dit-on, un remède contre l’oubli.',
  linaigrette: 'De la linaigrette, le coton des tourbières. On en bourrait les oreillers, autrefois. Elle dit qu’il y a de l’eau sous vos pieds. Beaucoup d’eau.',
  ortie: 'De l’ortie. Vous le saviez déjà, je le vois à vos mains. En soupe, elle ne pique plus.',
  tussilage: 'Du tussilage, le pas-d’âne. Les fleurs d’abord, les feuilles après : il fait tout à l’envers. Contre la toux.',
  colchique: 'Du colchique. Les vaches n’y touchent pas : elles sont plus sages que nous. Il tue lentement, et sûrement.',
  digitale: 'De la digitale. Elle arrête le cœur, ou elle le soigne, selon la dose. Toute la médecine est une affaire de dose.',
  orchidee: 'Une orchidée sauvage. Rare. Très rare. Où l’avez-vous… Non. Ne me le dites pas. Je vais la dessiner.',
  reine_pres: 'De la reine-des-prés. Contre la fièvre et les douleurs. Elle sent l’amande, le miel, et un peu l’été.',
  achillee: 'De l’achillée millefeuille. Achille en pansait ses soldats, dit-on. Elle arrête le sang. Gardez-en toujours sur vous.',
  gentiane: 'De la gentiane. Amère à faire pleurer, et c’est pour ça qu’elle soigne. Les meilleures choses sont amères.',
  edelweiss: 'Un edelweiss. On en cueille pour prouver qu’on est allé là-haut. Et parfois, on n’en redescend pas.',
  cynorhodon: 'Des cynorhodons, les fruits de l’églantier. Pleins de vertus, et de poil à gratter. Les enfants le savent.',
  baies_sureau: 'Des baies de sureau. Cuites, en sirop, c’est un remède. Crues, c’est une colique. Toujours cuire.',
  baies_houx: 'Des baies de houx. Ne les mangez pas. Les oiseaux, eux, peuvent. Nous ne sommes pas des oiseaux, malgré nos efforts.',
  fleur_tilleul: 'Des fleurs de tilleul. Pour dormir, pour calmer les nerfs. J’en bois des litres. Ça se voit ?',
  lys_cimes: 'Un lys des cimes ! Il ne fane pas. Personne ne sait pourquoi. Moi non plus. C’est merveilleux, de ne pas savoir.',
  mousse_nains: 'De la mousse des nains. Elle brille dans le noir, voyez. D’où la tenez-vous ? … Alors ils existent.',
  asphodele: 'De l’asphodèle, la fleur des morts. Les anciens en plantaient sur les tombes, pour que les défunts aient de quoi manger.',
  fleur_temple: 'Une fleur de pierre. Je… Asseyez-vous. Non, c’est moi qui dois m’asseoir. On n’en a jamais vu que deux dans cette vallée. Celle-ci fait trois.',
};
alchimie.DIT = {
  intro: [
    '(Il cherche ses lunettes. Elles sont sur son nez.) Voyons, voyons…',
    'Montrez. Non, ne la reniflez pas. Bon. C’est fait.',
    '(Il la tourne à la lumière, la gratte d’un ongle, la goûte du bout de la langue, et crache.)',
    'Hm. Hm, hm. Passez-moi la loupe. Non, l’autre. Merci.',
    'Ah ! Enfin quelqu’un qui cueille au lieu de piétiner.',
  ],
  garde: [
    'Je garde ce brin pour l’herbier. Vous permettez. Vous permettez.',
    'Celui-ci va dans ma collection : c’est le prix de la science, et un peu le mien.',
    'J’en garde un, pour le dessiner. Et pour comparer. Et pour moi.',
  ],
  prix: [(p) => `Ce sera ${p} pièces. La science n’est pas gratuite ; moi, presque.`, (p) => `${p} pièces, s’il vous plaît. Mes fioles ne se remplissent pas toutes seules.`],
  gratuit: ['Pour vous, rien. Ne le répétez pas à mes créanciers.', 'Gardez votre argent : entre amis, la botanique est gratuite.'],
  sansArgent: [(p) => `${p} pièces, et vous ne les avez pas. Revenez. La plante ne s’enfuira pas. Enfin, celle-là, non.`, (p) => `Il me faudrait ${p} pièces. Je sais, je sais. Moi aussi, je suis toujours à court.`],
  tout: [
    'Tout ? Posez tout sur la table. Non, pas sur le chat. (Il travaille longtemps, en marmonnant, en dessinant, en reniflant.)',
    'Tout d’un coup ? Vous êtes pressé, ou vous me flattez. (Il étale vos plantes et les passe une à une sous la loupe.)',
  ],
  table: {
    refus: ['Ne touchez pas à ma table.', 'Pas vous. Pas mes fioles.', 'La table est occupée. Pour vous, elle le sera toujours.'],
    bouillie: ['Tout s’est annulé. C’est aussi un résultat. Notez-le.', 'Rien. Le néant en fiole. J’en ai une étagère pleine.'],
    mixture: ['Ça bout, ça siffle… Je ne boirais pas ça. Je l’ai déjà fait. Je ne le referai pas.', 'Trop de choses à la fois. Les essences se disputent. Comme les gens.'],
    poison: ['Ne respirez pas ça. Ni vous, ni moi.', 'Bouchez-moi ça. Tout de suite. Et lavez-vous les mains.'],
    rare: ['Oh. Oh ! Ça, je ne l’avais jamais réussi. Montrez-moi ce que vous avez mis. Non, ne me montrez pas. Si, montrez.', 'Mon Dieu. Vous avez de la chance, ou du génie. Les deux sont dangereux.'],
    bien: ['Hm. Pas mal. Notez bien ce que vous avez mis.', 'Intéressant. Notez. Toujours noter.', 'Voilà. La science, c’est surtout noter.'],
  },
  morts: {
    joueur: [(n) => `(${n}, dans votre dos : « Pourquoi ? »)`, (n) => `(« Tu sais, toi, pourquoi. » C’est la voix de ${n}.)`],
    autre: [(n) => `(${n} murmure, très loin : « Il fait froid, ici. Il fait toujours froid. »)`, (n) => `(La voix de ${n} : « Dites-leur que je n’ai pas eu peur. Ce n’est pas vrai. Dites-le quand même. »)`, (n) => `(Sous la terre, ${n} prononce votre nom. Une fois.)`],
    vallee: [
      '(Une voix d’enfant, sous vos pieds : « Tu as vu mon chien ? »)',
      '(Des voix, très loin, comptent jusqu’à treize. Puis elles recommencent.)',
      '(Quelqu’un pleure au fond d’un puits. Ce n’est pas de l’eau qui coule.)',
      '(« Anselme… Anselme, remonte… »)',
      '(Un vieil homme récite une recette de pain, se trompe, et recommence.)',
      '(« Ne va pas au col. Ne va pas au col. Ne va pas… »)',
      '(Des soldats parlent d’un siège. L’un d’eux a froid. Il a froid depuis trois cents ans.)',
      '(Une femme chante une berceuse dans une langue que personne ne parle plus.)',
    ],
  },
  songe: {
    rien: [
      'Vous rêvez de la vallée vue d’en haut, la nuit. Treize pierres respirent en cercle. Quelqu’un, en bas, lève la tête et vous regarde. Vous vous réveillez avant de voir son visage.',
      'Vous rêvez de la ferme, exactement comme elle est. Rien ne bouge. C’est ce qui vous réveille : dans le rêve, l’épouvantail ne regardait pas le chemin. Il vous regardait.',
    ],
  },
};
// ce qui reste de l'assassin dans la mémoire des morts (et dans les rêves)
alchimie.TRACES = {
  maire: 'Une écharpe bleu, blanc, rouge, et une belle voix qui parlait bien.',
  boulangere: 'Des mains blanches de farine, et une odeur de pain chaud.',
  forgeron: 'Une odeur de fer chaud et de suie, et des mains dures comme l’enclume.',
  grainetiere: 'Une faucille bien aiguisée, et une odeur de grain et de jute.',
  aubergiste: 'Une odeur de cave et de vin tourné, et un tablier raide.',
  cure: 'Des mots latins, murmurés pendant que ça frappait.',
  postiere: 'Quelqu’un qui savait tout de moi. Tout. Jusqu’à mes lettres.',
  garde: 'Un bruit de chaînes, comme le pont-levis, et la pointe d’une pique.',
  eleveuse: 'Une odeur d’écurie, de cheval et de cuir.',
  pecheur: 'Des mains mouillées, une odeur de vase et d’écailles.',
  guerisseuse: 'Une odeur d’herbes sèches et de tisane amère.',
  defaut: 'Un masque de toile blanche, et derrière, des yeux que je connaissais.',
};
// force minimale (somme des deux essences) des potions rares de la table
alchimie.FORCE = { elixir_souffle: 9, philtre_envers: 7, baume_moelle: 6, eau_lustrale: 6, potion_songe: 6, philtre_morts: 6, potion_memoire: 6, potion_soleil: 6,
  eau_benite: 5, potion_regeneration: 5, potion_peau_pierre: 5, fiel_noir: 5 };

// ---------------------------------------------------------------- dialogue : l'alchimiste nomme les plantes
{
  const _options = talk.options.bind(talk);
  talk.options = function () {
    const opts = _options(), extra = alchimie.optionsDialogue(this.n);
    if (extra.length) { const i = opts.findIndex((o) => o.act === 'bye'); opts.splice(i >= 0 ? i : opts.length, 0, ...extra); }
    return opts;
  };
  const _choose = talk.choose.bind(talk);
  talk.choose = function (act) {
    if (typeof act === 'string' && act.startsWith('alch:') && this.n) return alchimie.choisir(this.n, act);
    return _choose(act);
  };
}

// quand on rapporte des plantes à qui les demandait, on apprend leur nom
{
  const _complete = quests.complete.bind(quests);
  quests.complete = function (q, n) {
    const ids = q && q.type === 'apporter' && q.need ? Object.keys(q.need).filter((k) => alchimie.inconnue(k)) : [];
    const r = _complete(q, n);
    for (const k of ids) savoir.identifier(k);
    return r;
  };
}

// ---------------------------------------------------------------- la table : dans l'échoppe (inter + objet), et celle qu'on pose à la ferme
PROP_USE_MORE.table_alchimie = 1;
HOOKS.inter.alch_table = () => alchimie.tableEchoppe();
HOOKS.propPre.table_alchimie = (q) => {
  const i = game.world.props.indexOf(q);
  if (i >= 0 && i < farm.genProps) alchimie.tableEchoppe(); // celle de l'échoppe
  else alchimie.ouvrirTable('ferme');
  return true;
};

// ---------------------------------------------------------------- l'alambic : ne pas lister les potions sans recette (need: null)
{
  const _render = alchemy.render.bind(alchemy);
  alchemy.render = function () {
    const k = this.known;
    this.known = (id) => !!(POTIONS[id] && POTIONS[id].need) && k.call(this, id);
    try { return _render(); } finally { this.known = k; }
  };
}

// ---------------------------------------------------------------- boire (toutes les potions se notent au carnet)
{
  const _drink = alchemy.drink.bind(alchemy);
  alchemy.drink = function (id) {
    if (alchimie.boire(id)) return;
    const avant = farm.count(id);
    _drink(id);
    if (farm.count(id) < avant) {
      alchimie.noterPotion(id, 'b');
      for (const fn of alchimie.onBoire) try { fn(id); } catch (e) { console.error(e); }
    }
  };
}
// clics : poison sur la viande, appât à poser, bouillie à vider (avant le « boire » de l'alchimie)
HOOKS.primary.unshift((eye, basis, held, it, id) => {
  if (typeof cine !== 'undefined' && cine.on) return false;
  if (id !== 'fiole_poison' && id !== 'appat_empoisonne' && id !== 'bouillie') return false;
  if (held) return true;
  play.cool = 0.5;
  const say = (t) => ui.subtitle('', '(' + t + ')', 3);
  if (id === 'bouillie') {
    farm.take('bouillie', 1); farm.give('fiole', 1); sound.pour && sound.pour();
    say('Vous videz la bouillie dans l’herbe. L’herbe n’en veut pas non plus.');
    return true;
  }
  if (id === 'fiole_poison') {
    if (!farm.count('viande')) { say('Versé sur de la viande, ça ferait un appât. Il vous faudrait de la viande.'); return true; }
    farm.take('viande', 1); farm.take('fiole_poison', 1); farm.give('appat_empoisonne', 1); farm.give('fiole', 1);
    sound.pour && sound.pour();
    say('Vous versez le poison sur la viande. Elle noircit, lentement.');
    return true;
  }
  // l'appât : dans un piège qu'on regarde (piège à lapins, piège à loup posé), sinon par terre
  const t = game.target, w = game.world;
  const q = t && t.kind === 'prop' && (t.q.id === 'piege' || t.q.id === 'piege_loup') ? t.q : t && t.kind === 'hook' && t.piege && t.piege.id === 'piege_loup' ? t.piege : null;
  if (q) {
    if (alchimie.appatDans(q)) { say('Il y a déjà un appât dans ce piège.'); return true; }
    farm.take('appat_empoisonne', 1); farm.setPropData(q, { appat: 'poison' }); sound.place && sound.place();
    say('Vous posez l’appât dans le piège. Ce qui le mordra ne s’en relèvera pas.');
    return true;
  }
  const c = play.cellAt(eye, basis.f);
  if (!c || c.t > 3.2 || w.heightAt(c.x, c.z) < w.waterLevel) { say('Il faudrait le poser par terre, là où passent les bêtes.'); return true; }
  farm.take('appat_empoisonne', 1);
  alchimie.poserAppat(c.x + (Math.random() - 0.5) * 0.3, w.groundAt(c.x, c.z, c.y + 0.5, 1), c.z + (Math.random() - 0.5) * 0.3);
  sound.place && sound.place();
  say('Vous posez l’appât dans l’herbe. Les bêtes le sentiront de loin.');
  return true;
});
HOOKS.secondary.unshift((eye, basis, it, id) => {
  if (typeof cine !== 'undefined' && cine.on) return false;
  if (id !== 'appat_empoisonne') return false;
  alchimie.boire(id);
  return true;
});

// ---------------------------------------------------------------- effets en cours
HOOKS.update.push((dt, eye, basis, sky, playing) => {
  if (!farm.s || !playing) return;
  const p = game.player;
  if (BUFF.on('regeneration')) { if (p.hp < 100) p.hp = Math.min(100, p.hp + dt * 0.45); const C = corps.C(); if (C.saigne > 0) C.saigne = Math.max(0, C.saigne - dt * 0.04); }
  alchimie.majPoison(dt);
  if (alchimie.agonie.length) alchimie.majBetes(dt);
  alchimie.tAppat -= dt;
  if (alchimie.tAppat <= 0) { alchimie.tAppat = 1; alchimie.majAppats(); }
  if (BUFF.on('morts')) alchimie.majMorts(dt);
});
// potion de soleil : l'éclat du jour adouci, et une lueur dorée la nuit
HOOKS.sky.push((sky) => {
  if (!BUFF.on('soleil')) return;
  if (sky.night > 0.2) {
    const k = sky.night;
    sky.amb = v3.add(sky.amb, v3.scale([0.13, 0.11, 0.06], k));
    sky.fog = [sky.fog[0], Math.max(sky.fog[1], 150)];
  } else { sky.sunDisk = v3.scale(sky.sunDisk, 0.6); sky.sunCol = v3.scale(sky.sunCol, 0.9); }
});
HOOKS.fx.push((fx, tint) => {
  if (alchemy.flashT > 0) return;
  if (BUFF.on('morts')) { tint[0] = 0.35; tint[1] = 0.45; tint[2] = 0.4; tint[3] = Math.max(tint[3], 0.12); }
  else if (BUFF.on('peau_pierre') && tint[3] < 0.05) { tint[0] = 0.5; tint[1] = 0.5; tint[2] = 0.48; tint[3] = 0.05; }
});
// peau de pierre : les coups portent deux fois moins
{
  const _hurt = play.hurt.bind(play);
  play.hurt = function (dmg, src, cause) { if (dmg > 0 && BUFF.on('peau_pierre')) dmg *= 0.5; return _hurt(dmg, src, cause); };
}
// sang-froid : la peur retombe, les murmures s'éloignent
{
  const _su = strange.update.bind(strange);
  strange.update = function (dt, c) { const r = _su(dt, c); if (BUFF.on('sang_froid')) this.fear *= 0.25; return r; };
  const _wh = sound.whisper.bind(sound);
  sound.whisper = function (pan, k) { return _wh(pan, (k === undefined ? 0.5 : k) * (BUFF.on('sang_froid') ? 0.3 : 1)); };
}
// chaleur : le froid des hauteurs ne mord plus
{
  const _vu = vallee.update.bind(vallee);
  vallee.update = function (...a) {
    if (!BUFF.on('chaleur') || typeof game === 'undefined') return _vu(...a);
    const nf = game.nearFire;
    game.nearFire = () => true;
    try { return _vu(...a); } finally { game.nearFire = nf; }
  };
}

// ---------------------------------------------------------------- appâts posés, bêtes empoisonnées
HOOKS.draw.push((buf) => {
  const A = farm.s && farm.s.alch;
  if (!A || !A.appats || !A.appats.length) return;
  const p = game.player;
  PE.buf = buf; PE.fl = 0;
  for (const b of A.appats) {
    if (Math.hypot(b.x - p.pos[0], b.z - p.pos[2]) > 70) continue;
    PE.frame(b.x, b.y, b.z, b.r || 0, 1);
    PE.bx(0, 0, 0, 0.24, 0.08, 0.16, rgbf('#6a1c14'), TL.blood);
    PE.bx(0.05, 0.06, 0.01, 0.12, 0.05, 0.09, rgbf('#3a1010'), TL.blood, 0.4);
  }
});
HOOKS.target.push((eye, f, cand) => {
  for (const c of alchimie.carcasses) {
    const e = c.e, dx = e.x - eye[0], dy = e.y + 0.3 - eye[1], dz = e.z - eye[2], d = Math.hypot(dx, dy, dz);
    if (d > 2.6 || (dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1) < 0.7) continue;
    cand({ kind: 'hook', use: () => alchimie.depouiller(c) }, d);
  }
});
// le piège à lapins garni d'un appât : au matin, une bête y est morte
HOOKS.day.push(() => {
  const w = game.world;
  for (const q of w.props) if (q.id === 'piege' && !q.gone && alchimie.appatDans(q) && !(q.data && q.data.prise)) farm.setPropData(q, { prise: 'poison', appat: null });
});
{
  const _pp = HOOKS.propPre.piege;
  HOOKS.propPre.piege = (q) => {
    if (q.data && q.data.prise === 'poison') {
      farm.setPropData(q, { prise: 0 });
      farm.give('fourrure', 1); play.flyer('fourrure', [q.x, q.y + 0.3, q.z], 1);
      if (Math.random() < 0.5) farm.give('cuir', 1);
      sound.pop && sound.pop();
      ui.subtitle('', '(Une martre, raide, la gueule noire. La viande est perdue ; la fourrure, non.)', 3.5);
      return true;
    }
    return _pp ? _pp(q) : false;
  };
}

// ---------------------------------------------------------------- au chargement
let alchimieBranchee = false;
HOOKS.load.push(() => {
  const A = alchimie.S();
  alchimie.appliquerNoms();
  alchimie.agonie = []; alchimie.carcasses = []; alchimie.confirmT = {};
  alchimie.table.slots = [null, null, null, null]; alchimie.table.res = null;
  if (A.poison && !(A.poison.t > 0)) A.poison = null;
  if (alchimieBranchee) return;
  alchimieBranchee = true;
  // potion de songe : le rêve vient au prochain sommeil
  const _sleep = game.sleep.bind(game);
  game.sleep = async function (where) {
    const songe = BUFF.on('songe');
    const r = await _sleep(where);
    if (songe && farm.s && !farm.s.over && !game.dying && !game.sleeping) alchimie.rever();
    return r;
  };
});
