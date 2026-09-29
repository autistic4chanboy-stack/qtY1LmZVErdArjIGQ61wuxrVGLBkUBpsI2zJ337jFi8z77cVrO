// ============================================================================
//  INTERFACE (FERME) : aucun affichage permanent. Panneaux « papier » ouverts
//  à la demande : dialogues, sacoche, carnet, fabrication, boutique, coffres,
//  lettres ; sous-titres des paroles ; écran de mort.
// ============================================================================

const iconURL = (() => {
  const cache = {};
  return (id) => {
    if (cache[id]) return cache[id];
    // objets à poser et bêtes : rendu de leur modèle 3D
    if (ITEMS[id] && (ITEMS[id].place || ITEMS[id].animal || id === 'jeune_pommier')) { const u = ICON3D.url(id); if (u) return (cache[id] = u); }
    const s = ATLAS.sprites['it_' + id];
    if (!s) return '';
    const c = document.createElement('canvas'); c.width = 16; c.height = 16;
    c.getContext('2d').drawImage(s.canvas, 0, 0);
    return (cache[id] = c.toDataURL());
  };
})();
const itemName = (id) => (ITEMS[id] ? ITEMS[id].name : id);

Object.assign(ui, {
  panel: null,

  // ------------------------------------------------------------- chargement / fondu
  setLoading(t) { const el = $('#loading-text'); if (el) el.textContent = t; },
  fade(on, text, ms = 700) {
    const f = $('#fade');
    $('#fade-text').textContent = text || '';
    f.style.transitionDuration = ms + 'ms';
    f.classList.toggle('open', !!on);
    return new Promise((r) => setTimeout(r, ms));
  },
  async fadeMsg(text, sec = 2.5) { await this.fade(true, text, 600); await new Promise((r) => setTimeout(r, sec * 1000)); await this.fade(false, '', 900); },

  // ------------------------------------------------------------- sous-titres (paroles entendues)
  subtitle(name, text, dur = 3) {
    if (!settings.subs) return;
    const box = $('#subs');
    const el = document.createElement('div');
    el.className = 'sub';
    el.innerHTML = (name ? `<b>${esc(name)}</b> — ` : '') + esc(text);
    box.appendChild(el);
    while (box.children.length > 3) box.firstChild.remove();
    setTimeout(() => el.classList.add('out'), dur * 1000);
    setTimeout(() => el.remove(), dur * 1000 + 700);
  },

  // ------------------------------------------------------------- panneaux
  open(id, html) {
    this.close(true);
    const el = $(id);
    if (html !== undefined) el.innerHTML = html;
    el.classList.add('open');
    $('#paper').classList.add('open');
    this.panel = id;
    game.unlock();
    sound.page && sound.page();
  },
  close(silent) {
    if (!this.panel) return;
    const id = this.panel;
    $(id).classList.remove('open');
    $('#paper').classList.remove('open');
    this.panel = null;
    if (id === '#talk') talk.close();
    if (!silent && game.mode === 'play') game.lock();
  },
  advClose() { this.close(); },

  // ------------------------------------------------------------- dialogues
  openTalk(n) {
    const v = talk.open(n);
    this.open('#talk');
    this.renderTalk(v);
  },
  renderTalk(v) {
    if (v === 'keep') return;
    if (!v) { this.close(); return; }
    const el = $('#talk');
    const opts = v.options.length ? v.options : [{ label: '…', act: 'bye' }];
    el.innerHTML = `<div class="who">${esc(v.name)}${v.role ? `<span>${esc(v.role)}</span>` : ''}</div>
      <p class="said"></p>
      <div class="opts">${opts.map((o, i) => `<button data-act="${esc(o.act)}" class="${o.quest ? 'q' : ''}"><kbd>${i + 1}</kbd> ${esc(o.label)}</button>`).join('')}</div>`;
    const p = el.querySelector('.said');
    // texte qui s'écrit
    let i = 0; const txt = v.text;
    clearInterval(this.typeT);
    this.typeT = setInterval(() => { i += 2; p.textContent = txt.slice(0, i); if (i >= txt.length) clearInterval(this.typeT); }, 16);
    p.onclick = () => { clearInterval(this.typeT); p.textContent = txt; };
    el.querySelectorAll('[data-act]').forEach((b) => (b.onclick = () => { clearInterval(this.typeT); this.renderTalk(talk.choose(b.dataset.act)); }));
  },
  talkKey(k) {
    const b = $$('#talk [data-act]')[k - 1];
    if (b) b.click();
  },

  // ------------------------------------------------------------- lecture (notes, lettres, inscriptions)
  read(title, text, sign) {
    this.open('#reader', `<h3>${esc(title)}</h3><div class="txt">${esc(text).replace(/\n/g, '<br>')}</div>${sign ? `<div class="sign">${esc(sign)}</div>` : ''}<button class="close">Refermer</button>`);
    $('#reader .close').onclick = () => this.close();
  },

  // ------------------------------------------------------------- sacoche : objets, carnet, fabrication
  openSatchel(tab) {
    this.satTab = tab || this.satTab || 'sac';
    this.open('#satchel');
    this.renderSatchel();
  },
  renderSatchel() {
    const s = farm.s, tab = this.satTab;
    const tabs = [['sac', 'Sacoche'], ['fab', 'Fabrication'], ['carnet', 'Carnet'], ['legendes', 'Légendes'], ['grimoire', 'Grimoire'], ['lettres', 'Lettres']];
    let body = '';
    if (tab === 'sac') {
      const groups = {};
      for (const id in s.inv) { const it = ITEMS[id]; if (!it) continue; (groups[it.cat] = groups[it.cat] || []).push(id); }
      body = `<div class="purse">Bourse : <b>${s.money}</b> pièces${s.water && farm.bestTool('arrosoir') ? ` · arrosoir ${Math.round(s.water / play.canCap() * 100)} %` : ''}</div>${this.buffsLine()}`;
      for (const cat of Object.keys(ITEM_CAT_NAMES)) {
        if (!groups[cat]) continue;
        body += `<h4>${ITEM_CAT_NAMES[cat]}</h4><div class="grid">` + groups[cat].map((id) => `<button class="it ${s.hand === id ? 'on' : ''}" data-it="${id}" title="${esc(itemName(id) + (ITEMS[id].desc ? ' — ' + ITEMS[id].desc : ''))}"><img src="${iconURL(id)}" alt=""><span>${esc(itemName(id))}</span><i>${s.inv[id]}</i></button>`).join('') + '</div>';
      }
      body += `<p class="hint">Cliquez sur un objet pour le prendre en main.</p>`;
    } else if (tab === 'fab') {
      const near = { etabli: game.nearStation('etabli'), four: game.nearStation('four'), feu: game.nearStation('feu') };
      const list = RECIPES.filter((r) => farm.knows(r.out));
      body = list.map((r, i) => {
        const ok = farm.has(r.need) && (!r.st || near[r.st]);
        const need = Object.keys(r.need).map((k) => `<span class="${farm.count(k) >= r.need[k] ? 'y' : 'n'}">${ITEM_GROUPS[k] ? '' : `<img src="${iconURL(k)}" alt="">`}${r.need[k]} ${esc(ITEM_GROUPS[k] ? GROUP_NAMES[k] : itemName(k))}</span>`).join('');
        return `<div class="rec ${ok ? 'ok' : ''}"><img class="big" src="${iconURL(r.out)}" alt=""><div><b>${esc(itemName(r.out))}${r.n > 1 ? ' ×' + r.n : ''}</b><div class="need">${need}</div>${r.st ? `<div class="st ${near[r.st] ? 'y' : 'n'}">Il faut ${STATION_NAMES[r.st]}${near[r.st] ? ' (à portée)' : ''}</div>` : ''}</div><button data-craft="${RECIPES.indexOf(r)}" ${ok ? '' : 'disabled'}>Fabriquer</button></div>`;
      }).join('');
      const locked = RECIPES.filter((r) => !farm.knows(r.out)).length;
      if (locked) body += `<p class="hint">${locked} plan(s) restent à découvrir auprès des habitants.</p>`;
    } else if (tab === 'carnet') {
      const act = [], done = [];
      for (const d of NPC_DATA) for (const q of d.quests) {
        const Q = s.quests[q.id];
        if (!Q || Q.st === 'refus') continue;
        const who = npcs.byId[d.id], nm = who ? who.name : d.id;
        const line = `<div class="q ${Q.st}"><b>${esc(q.title)}</b> <span>— ${esc(nm)}</span><div>${esc(this.questHint(q, Q, nm))}</div></div>`;
        (Q.st === 'fait' ? done : act).push(line);
      }
      if (s.deliveries && s.deliveries.day === s.day) {
        const left = s.deliveries.list.filter((p) => !p.done);
        if (left.length) act.unshift(`<div class="q actif"><b>Tournée de la poste</b><div>Colis pour : ${left.map((p) => esc(npcs.nameOf(p.to))).join(', ')} — avant six heures du soir.</div></div>`);
      }
      const notes = Object.keys(s.notes).map((id) => { const n = noteText(id); return n ? `<button class="note" data-note="${id}">${esc(n.titre)}</button>` : ''; }).join('');
      const known = npcs.list.filter((n) => n.st.met).map((n) => `<span class="pp">${esc(n.name)} <i>${esc(n.d.role.toLowerCase())}${n.st.alive ? '' : ' — †'}</i></span>`).join('');
      body = `<h4>En cours</h4>${act.join('') || '<p class="hint">Rien pour l’instant. Parlez aux habitants.</p>'}
        ${done.length ? `<h4>Accompli</h4>${done.join('')}` : ''}
        <h4>Gens rencontrés</h4><div class="people">${known || '<p class="hint">Personne encore.</p>'}</div>
        <h4>Notes trouvées</h4><div class="notes">${notes || '<p class="hint">Aucune.</p>'}</div>
        <p class="hint">Jour ${s.day} · ${esc(farm.names.ville)} · ${esc(farm.names.hameau)}</p>`;
    } else if (tab === 'legendes') body = this.legendsBody();
    else if (tab === 'grimoire') body = this.grimoireBody();
    else {
      body = s.mail.slice().reverse().map((m, i) => `<button class="note ${m.read ? '' : 'new'}" data-mail="${s.mail.length - 1 - i}">${esc(m.title)} <span>— ${esc(m.from)}, jour ${m.day}</span></button>`).join('') || '<p class="hint">Aucune lettre.</p>';
    }
    $('#satchel').innerHTML = `<div class="tabs">${tabs.map(([k, n]) => `<button data-tab="${k}" class="${k === tab ? 'on' : ''}">${n}</button>`).join('')}<button class="x" data-close>✕</button></div><div class="body">${body}</div>`;
    $$('#satchel [data-tab]').forEach((b) => (b.onclick = () => { this.satTab = b.dataset.tab; this.renderSatchel(); sound.page && sound.page(); }));
    $('#satchel [data-close]').onclick = () => this.close();
    $$('#satchel [data-it]').forEach((b) => (b.onclick = () => { play.select(b.dataset.it); this.renderSatchel(); }));
    $$('#satchel [data-craft]').forEach((b) => (b.onclick = () => { game.craft(RECIPES[+b.dataset.craft]); this.renderSatchel(); }));
    $$('#satchel [data-note]').forEach((b) => (b.onclick = () => { const n = noteText(b.dataset.note); this.read(n.titre, n.texte); }));
    $$('#satchel [data-mail]').forEach((b) => (b.onclick = () => { const m = s.mail[+b.dataset.mail]; m.read = true; this.read(m.title, m.text, m.from); }));
  },
  questHint(q, Q, nm) {
    if (Q.st === 'fait') return 'Terminé.';
    const L = (k) => LIEU_NAMES[k] || k;
    switch (q.type) {
      case 'apporter': return 'Apporter ' + Object.keys(q.need).map((k) => q.need[k] + ' × ' + itemName(k).toLowerCase() + ` (${farm.count(k)})`).join(', ') + ' à ' + nm + '.';
      case 'livrer': return Q.step ? 'Livré. Retourner voir ' + nm + '.' : 'Remettre « ' + itemName(q.objet) + ' » à ' + npcs.nameOf(q.a) + '.';
      case 'parler': return Q.step ? 'Message transmis. Retourner voir ' + nm + '.' : 'Porter un message à ' + npcs.nameOf(q.a) + '.';
      case 'trouver': return farm.count(q.objet) ? 'Trouvé. Le rapporter à ' + nm + '.' : 'Chercher « ' + itemName(q.objet) + ' » vers ' + L(q.lieu) + '.';
      case 'enquete': return Q.step ? 'Vu de ses yeux. Retourner voir ' + nm + '.' : 'Se rendre ' + (q.moment === 'nuit' ? 'la nuit' : 'à l’aube') + ' vers ' + L(q.lieu) + ' et observer.';
    }
    return '';
  },

  // ------------------------------------------------------------- boutique
  openShop(n) {
    this.shopN = n;
    this.open('#shop');
    this.renderShop();
  },
  // amitié : remise à l'achat, meilleur prix à la vente (niveaux 3 et 6)
  shopK(lvl, buying) { return buying ? (lvl >= 6 ? 0.88 : lvl >= 3 ? 0.95 : 1) : (lvl >= 6 ? 1.1 : lvl >= 3 ? 1.05 : 1); },
  shopPrice(n, id, base, buying) {
    const p = Math.max(1, Math.round(base * this.shopK(npcs.level(n), buying)));
    // garde-fou : on n'achète jamais au prix où l'on pourrait revendre ailleurs (aucun achat-revente gagnant)
    return buying ? Math.max(p, this.revente(id) + 1) : p;
  },
  // le mieux payé pour un objet, tous rachats confondus : la caisse (prix de base, sauf les outils), un marchand qui
  // le rachète (au mieux de l'amitié), le marchand de joie (souvenirs d'ailleurs, 120 %) ; le brocanteur paie moins
  revente(id) {
    const it = ITEMS[id];
    if (!it || !(it.price > 0)) return 0;
    let r = it.cat === 'outil' ? 0 : it.price;
    if (it.cat === 'ailleurs') r = Math.round(it.price * 1.2);
    if (NPC_DATA.some((d) => d.shop && d.shop.buys && (d.shop.buys.includes(id) || (FISH[id] && d.shop.buys.includes('poisson'))))) r = Math.max(r, Math.round(it.price * this.shopK(10, false)));
    return r;
  },
  renderShop() {
    const n = this.shopN, s = farm.s, S = n.d.shop;
    const refuse = npcs.murdererKnown() || n.st.anger > 0 || !n.st.alive;
    const sells = (S.sells || []).filter(([id]) => ITEMS[id]);
    const buys = Object.keys(s.inv).filter((id) => S.buys && S.buys.includes(id) || (S.buys && S.buys.includes('poisson') && FISH[id]));
    const cap = n.d.id === 'eleveuse';
    const bulk = refuse ? [] : buys.filter((id) => BULK_CATS.has(ITEMS[id].cat) || FISH[id]);
    const bulkTotal = bulk.reduce((a, id) => a + this.shopPrice(n, id, ITEMS[id].price, false) * s.inv[id], 0);
    $('#shop').innerHTML = `<div class="tabs"><b>${esc(S.name || n.name)}</b><button class="x" data-close>✕</button></div>
      <div class="body two">
        <div><h4>Acheter</h4>${refuse ? `<p class="said">${esc(fmtLine(pick(NPC_GENERIC.refus), n))}</p>` : sells.map(([id, p]) => {
          const pr = this.shopPrice(n, id, p, true);
          const lockedRec = LOCKED_RECIPES.has(id) && ITEMS[id].place && false;
          return `<button class="row" data-buy="${id}" data-p="${pr}" ${s.money >= pr ? '' : 'disabled'}><img src="${iconURL(id)}" alt=""><span>${esc(itemName(id))}</span><i>${pr}</i></button>`;
        }).join('')}</div>
        <div><h4>Vendre</h4>${refuse || !bulk.length ? '' : `<button class="row all" data-sellall><span>Tout vendre <small>(récoltes, prises, trésors)</small></span><i>${bulkTotal}</i></button>`}${refuse ? '' : buys.map((id) => {
          const pr = this.shopPrice(n, id, ITEMS[id].price, false);
          return `<button class="row" data-sell="${id}" data-p="${pr}"><img src="${iconURL(id)}" alt=""><span>${esc(itemName(id))} <small>×${s.inv[id]}</small></span><i>${pr}</i></button>`;
        }).join('') || '<p class="hint">Rien qui m’intéresse dans votre sac.</p>'}</div>
      </div>
      <div class="foot">Bourse : <b>${s.money}</b> pièces${cap ? ' · les bêtes sont livrées à la ferme le lendemain matin' : ''} · Maj+clic : par 5 · Ctrl+clic : par 20</div>`;
    $('#shop [data-close]').onclick = () => this.close();
    $$('#shop [data-buy]').forEach((b) => (b.onclick = (e) => {
      const id = b.dataset.buy, pr = +b.dataset.p, k = e.ctrlKey ? 20 : e.shiftKey ? 5 : 1;
      for (let i = 0; i < k; i++) {
        if (!farm.pay(pr)) break;
        const it = ITEMS[id];
        if (it.animal) {
          const same = s.animals.filter((a) => a.kind === it.animal).length + s.pending.filter((p) => p.kind === it.animal).length;
          const barn = s.animals.filter((a) => a.kind !== 'hen').length + s.pending.filter((p) => p.kind !== 'hen').length;
          if ((it.animal === 'hen' && same >= 10) || (it.animal !== 'hen' && barn >= 8)) { farm.earn(pr); this.subtitle(n.name, 'Vous n’avez plus de place pour les loger.', 3); break; }
          s.pending.push({ kind: it.animal, day: s.day });
        } else if (ITEMS[id].place && LOCKED_RECIPES.has(id) && !s.known[id]) farm.give(id, 1);
        else farm.give(id, 1);
        sound.coin && sound.coin();
      }
      this.renderShop();
    }));
    $$('#shop [data-sell]').forEach((b) => (b.onclick = (e) => {
      const id = b.dataset.sell, pr = +b.dataset.p, k = e.ctrlKey ? 20 : e.shiftKey ? 5 : 1;
      for (let i = 0; i < k; i++) { if (!farm.take(id, 1)) break; farm.earn(pr); }
      sound.coin && sound.coin();
      this.renderShop();
    }));
    const all = $('#shop [data-sellall]');
    if (all) all.onclick = () => {
      for (const id of bulk) { const k = s.inv[id] || 0; if (k && farm.take(id, k)) farm.earn(this.shopPrice(n, id, ITEMS[id].price, false) * k); }
      sound.coin && sound.coin(); sound.coin && setTimeout(() => sound.coin(), 90);
      this.renderShop();
    };
  },

  // ------------------------------------------------------------- coffre / caisse d'expédition
  openStore(title, store, mode) {
    this.store = { title, store, mode };
    this.open('#store');
    this.renderStore();
  },
  renderStore() {
    const { title, store, mode } = this.store, s = farm.s;
    const grid = (src, attr) => Object.keys(src).filter((id) => src[id] > 0 && ITEMS[id] && (mode !== 'ship' || attr !== 'put' || ITEMS[id].price > 0) && !(attr === 'put' && ITEMS[id].cat === 'outil' && mode === 'ship')).map((id) => `<button class="it" data-${attr}="${id}" title="${esc(itemName(id))}"><img src="${iconURL(id)}" alt=""><span>${esc(itemName(id))}</span><i>${src[id]}</i></button>`).join('');
    const total = mode === 'ship' ? Object.keys(store).reduce((a, id) => a + (ITEMS[id].price || 0) * store[id], 0) : 0;
    $('#store').innerHTML = `<div class="tabs"><b>${esc(title)}</b><button class="x" data-close>✕</button></div>
      <div class="body two"><div><h4>${mode === 'ship' ? 'Dans la caisse' : 'Dans le coffre'}</h4><div class="grid">${grid(store, 'get') || '<p class="hint">Vide.</p>'}</div>${mode === 'ship' ? `<p class="hint">Relevée à l’aube : ${total} pièces.</p>` : ''}</div>
      <div><h4>Dans la sacoche</h4>${mode === 'ship' ? '<button class="row all" data-putall><span>Tout déposer <small>(récoltes, prises, trésors)</small></span></button>' : ''}<div class="grid">${grid(s.inv, 'put')}</div></div></div><div class="foot">Maj+clic : tout déplacer</div>`;
    $('#store [data-close]').onclick = () => this.close();
    $$('#store [data-get]').forEach((b) => (b.onclick = (e) => { const id = b.dataset.get, k = e.shiftKey ? store[id] : 1; store[id] -= k; if (store[id] <= 0) delete store[id]; farm.give(id, k); this.renderStore(); }));
    $$('#store [data-put]').forEach((b) => (b.onclick = (e) => { const id = b.dataset.put, k = e.shiftKey ? s.inv[id] : 1; if (!farm.take(id, k)) return; store[id] = (store[id] || 0) + k; this.renderStore(); }));
    const all = $('#store [data-putall]');
    if (all) all.onclick = () => {
      for (const id of Object.keys(s.inv)) { const it = ITEMS[id]; if (!it || !(it.price > 0) || !(BULK_CATS.has(it.cat) || FISH[id])) continue; const k = s.inv[id]; if (farm.take(id, k)) store[id] = (store[id] || 0) + k; }
      sound.pop(); this.renderStore();
    };
  },

  // ------------------------------------------------------------- mort
  showDeath(cause, day, run) {
    $('#death .cause').textContent = cause;
    $('#death .days').textContent = `Vous avez tenu ${day} jour${day > 1 ? 's' : ''}. Version n° ${run} de la vallée.`;
    $('#death').classList.add('open');
  },
});

function noteText(id) {
  if (id === 'N0') return { titre: 'Lettre de Maître Delorme, notaire', texte: NOTARY_LETTER() };
  const i = +String(id).slice(1);
  if (String(id)[0] === 'M') return (typeof LORE_TEXT !== 'undefined' && LORE_TEXT.notes && LORE_TEXT.notes[i]) || null;
  if (String(id)[0] === 'X') return (typeof EXTRA_NOTES !== 'undefined' && EXTRA_NOTES[i]) || null;
  return LORE_NOTES[i] || null;
}
function NOTARY_LETTER() {
  const s = farm.s;
  return `Madame, Monsieur,

Conformément aux dernières volontés de feu Anselme Varenne, dont vous êtes l’unique héritier connu, je vous remets les clés de la vieille ferme et de ses terres.

Vous trouverez dans la maison de quoi débuter : une houe, un arrosoir, une hache et une pioche de pierre, quelques graines et une lanterne. Le puits est devant la maison ; la grange et le poulailler attendent des bêtes. La ville de ${farm.names.ville} se trouve au bout du chemin : on y vend des graines, on y achète vos récoltes, et la poste cherche toujours quelqu’un pour porter ses colis. Déposez ce que vous voulez vendre dans la caisse devant la maison : la coopérative la relève chaque matin.

Les ponts-levis de la ville sont relevés chaque soir à neuf heures ; ne vous laissez pas surprendre dehors. Les gens d’ici ferment leur porte à clé la nuit. Je vous conseille d’en faire autant.

Veuillez agréer, etc.

Maître Delorme, notaire à ${farm.names.ville}.

P.-S. Feu M. Varenne tenait à ce que l’épouvantail reste face au chemin. Je vous transmets sa demande sans la comprendre.`;
}
