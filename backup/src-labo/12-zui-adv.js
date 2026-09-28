// ============================================================================
//  INTERFACE (AVENTURE) : terminal, mélangeur, inventaire, notes, HUD
// ============================================================================

Object.assign(ui, {
  termTab: 'missions', mailOpen: null, mixA: 'eau', mixB: 'fleur', iconCache: {},

  setLoading(msg) { $('#loading-text').textContent = msg; },
  fade(fn, text) {
    const f = $('#fade');
    $('#fade-text').textContent = text || '';
    f.classList.add('on');
    setTimeout(() => { try { fn(); } catch (e) { console.error(e); } setTimeout(() => f.classList.remove('on'), 1400); }, 950);
  },
  icon(spr) {
    if (!this.iconCache[spr]) this.iconCache[spr] = ATLAS.sprites[spr].canvas.toDataURL();
    return this.iconCache[spr];
  },
  vialCss(p) { const c = POTIONS[p].color; return `background:rgb(${c[0]},${c[1]},${c[2]});box-shadow:0 0 6px rgba(${c[0]},${c[1]},${c[2]},.6)`; },

  // ------------------------------------------------------------ panneaux
  advOpen(id) {
    this.panel = id;
    $$('.advp').forEach((p) => p.classList.toggle('open', '#' + p.id === id));
    $('#adv-overlay').classList.add('open');
    game.unlock();
    sound.click();
  },
  advClose() {
    if (!this.panel) return;
    this.panel = null;
    $$('.advp').forEach((p) => p.classList.remove('open'));
    $('#adv-overlay').classList.remove('open');
    if (game.mode === 'play') game.lock();
  },
  showNote(text) {
    $('#notep').innerHTML = esc(text) + '<div class="hint">Cliquez ou appuyez sur Échap pour fermer</div>';
    $('#notep').onclick = () => this.advClose();
    this.advOpen('#notep');
  },

  // ------------------------------------------------------------ terminal
  openTerminal(tab) {
    if (tab) this.termTab = tab;
    adv.deliverEmails();
    this.renderTerminal();
    this.advOpen('#term');
  },
  renderTerminal() {
    const s = adv.s, w = game.world, unread = s.emails.filter((e) => !(s.read || {})[e]).length;
    const tabs = [['missions', 'Missions'], ['mail', 'Messages' + (unread ? ' (' + unread + ')' : '')], ['recettes', 'Recettes'], ['boutique', 'Boutique'], ['station', 'Station']];
    let body = '';
    if (this.termTab === 'missions') {
      const ms = s.missions.slice().sort((a, b) => (a.done ? 1 : 0) - (b.done ? 1 : 0));
      body = ms.map((m) => {
        const canDeliver = !m.done && (m.type === 'deliver' || m.type === 'sample' || m.type === 'brew');
        const extra = m.type === 'fuel' && !m.done ? ` [${m.prog}/${m.n}]` : '';
        return `<div class="item ${m.done ? 'done' : ''}"><div><b>${esc(m.title)}${extra}</b> — ${m.reward} cr.<p>${esc(m.desc)}</p></div>${canDeliver ? `<button data-deliver="${m.id}">Livrer</button>` : m.done ? '<span>✔</span>' : ''}</div>`;
      }).join('') || '<p>Aucune mission.</p>';
    } else if (this.termTab === 'mail') {
      body = s.emails.slice().reverse().map((subj) => {
        const e = EMAILS.find((q) => q.subject === subj);
        const open = this.mailOpen === subj, rd = (s.read || {})[subj];
        return `<div class="item mail ${rd ? '' : 'unread'}" data-mail="${esc(subj)}" style="cursor:pointer;display:block"><div><b>${esc(e.subject)}</b> <span style="opacity:.6">— ${esc(e.from)} · jour ${e.day}</span></div>${open ? `<p>${esc(e.body)}</p>` : ''}</div>`;
      }).join('');
    } else if (this.termTab === 'recettes') {
      const known = Object.keys(s.recipes).filter((p) => POTIONS[p]);
      body = `<p>Mélangez deux réactifs au laboratoire de chimie. Recettes découvertes : ${known.length} / ${Object.keys(POTIONS).length}</p>` + known.map((p) => {
        const pair = Object.keys(RECIPES).find((k) => RECIPES[k] === p);
        const how = pair ? pair.split('+').map((r) => ITEMS[r].name).join(' + ') : '—';
        return `<div class="item"><div><span class="vial" style="${this.vialCss(p)}"></span><b>${esc(POTIONS[p].name)}</b><p>${esc(how)}\nBoire : ${esc(POTIONS[p].drink)}\nLancer : ${esc(POTIONS[p].thr)}</p></div></div>`;
      }).join('');
    } else if (this.termTab === 'boutique') {
      body = `<p>Crédits disponibles : <b>${s.credits}</b></p>` + SHOP.map((it) => {
        const owned = it.upgrade && s.upgrades[it.upgrade];
        return `<div class="item"><div><b>${esc(it.name)}</b></div><button data-buy="${it.id}" ${owned || s.credits < it.cost ? 'disabled' : ''}>${owned ? 'Acquis' : it.cost + ' cr.'}</button></div>`;
      }).join('');
    } else {
      const broken = w.adv.relays.filter((r) => s.relays[r.id]).length;
      const gl = glitch.level < 0.25 ? 'faibles' : glitch.level < 0.55 ? 'modérées' : glitch.level < 0.9 ? 'fortes' : 'CRITIQUES';
      body = `<p>Générateur : ${Math.round(s.fuel)} %</p><div class="bar"><div style="width:${s.fuel}%"></div></div>
        <p>Interférences : ${gl} · Relais en panne : ${broken} / ${w.adv.relays.length}</p>` +
        w.adv.relays.map((r) => `<div class="item"><div><b>${esc(r.name)}</b><p>${esc(adv.whereFromLab(r.x, r.z))}</p></div><span>${s.relays[r.id] ? '⚠ HORS LIGNE' : 'OK'}</span></div>`).join('');
    }
    $('#term').innerHTML = `<h2>STATION PRAIRIE-7 <small>Jour ${s.day} · ${clockText(w.time)} · ⚡ ${Math.round(s.fuel)} % · ${s.credits} crédits</small></h2>
      <div class="tabs">${tabs.map(([k, n]) => `<button data-tab="${k}" class="${this.termTab === k ? 'on' : ''}">${n}</button>`).join('')}<button data-close style="margin-left:auto">Fermer ✕</button></div>${body}`;
    $$('#term [data-tab]').forEach((b) => (b.onclick = () => { this.termTab = b.dataset.tab; this.renderTerminal(); sound.click(); }));
    $$('#term [data-close]').forEach((b) => (b.onclick = () => this.advClose()));
    $$('#term [data-deliver]').forEach((b) => (b.onclick = () => { adv.deliver(s.missions.find((m) => m.id === b.dataset.deliver)); this.renderTerminal(); }));
    $$('#term [data-mail]').forEach((b) => (b.onclick = () => {
      const k = b.dataset.mail;
      this.mailOpen = this.mailOpen === k ? null : k;
      (s.read || (s.read = {}))[k] = 1;
      adv.unread = s.emails.some((e) => !s.read[e]);
      this.renderTerminal();
    }));
    $$('#term [data-buy]').forEach((b) => (b.onclick = () => {
      const it = SHOP.find((q) => q.id === b.dataset.buy);
      if (s.credits < it.cost) return;
      s.credits -= it.cost;
      if (it.give) adv.give(it.give[0], it.give[1]);
      if (it.potion) adv.givePotion(it.potion);
      if (it.upgrade) { s.upgrades[it.upgrade] = 1; this.toast('Amélioration : ' + it.name); }
      sound.pop();
      this.renderTerminal();
    }));
  },

  // ------------------------------------------------------------ mélangeur
  openMixer() { this.renderMixer(); this.advOpen('#mixer'); },
  renderMixer() {
    const s = adv.s, res = recipeOf(this.mixA, this.mixB), known = s.recipes[res];
    const need = {}; need[this.mixA] = (need[this.mixA] || 0) + 1; need[this.mixB] = (need[this.mixB] || 0) + 1;
    const ok = Object.keys(need).every((r) => adv.count(r) >= need[r]);
    const opts = (slot) => REAGENTS.map((r) => `<button class="rg ${this[slot] === r ? 'on' : ''}" data-slot="${slot}" data-r="${r}"><img src="${this.icon(ITEMS[r].icon)}" alt=""><span>${esc(ITEMS[r].name)}</span><span>×${adv.count(r)}</span></button>`).join('');
    $('#mixer').innerHTML = `<h2>MÉLANGEUR <small>Deux réactifs → une fiole</small></h2>
      <div class="slots"><div class="slot2"><b>Réactif A</b><div class="opts">${opts('mixA')}</div></div><div class="slot2"><b>Réactif B</b><div class="opts">${opts('mixB')}</div></div></div>
      <div class="result"><div class="pn">${known ? `<span class="vial" style="${this.vialCss(res)}"></span>${esc(POTIONS[res].name)}` : '??? — mélange inconnu'}</div>
      <div class="pd">${known ? 'Boire : ' + esc(POTIONS[res].drink) + '<br>Lancer : ' + esc(POTIONS[res].thr) : 'Expérimentez : le résultat sera noté dans vos recettes.'}</div></div>
      <div style="display:flex;gap:8px;justify-content:flex-end"><button data-close>Fermer</button><button class="primary" data-mix ${ok ? '' : 'disabled'}>Mélanger</button></div>`;
    $$('#mixer [data-slot]').forEach((b) => (b.onclick = () => { this[b.dataset.slot] = b.dataset.r; this.renderMixer(); sound.click(); }));
    $('#mixer [data-close]').onclick = () => this.advClose();
    $('#mixer [data-mix]').onclick = () => {
      for (const r of Object.keys(need)) adv.take(r, need[r]);
      const first = !s.recipes[res];
      s.recipes[res] = 1;
      adv.givePotion(res, 1, true);
      this.toast((first ? 'Nouvelle recette ! ' : '') + 'Vous obtenez : ' + POTIONS[res].name);
      if (sound.ok) { const t = sound.ctx.currentTime; for (let k = 0; k < 5; k++) sound.tone(t + k * 0.07, 'sine', 500 + Math.random() * 700, 300, 0.06, 0.03); }
      this.renderMixer();
    };
  },

  // ------------------------------------------------------------ inventaire
  openInventory() { this.renderInventory(); this.advOpen('#invp'); },
  renderInventory() {
    const s = adv.s;
    const items = Object.keys(ITEMS).filter((k) => s.inv[k] > 0);
    const pots = Object.keys(s.potions);
    $('#invp').innerHTML = `<h2>INVENTAIRE <small>Crédits : ${s.credits} · Jour ${s.day}</small></h2>
      <div class="invgrid">${items.map((k) => `<div class="cell"><img src="${this.icon(ITEMS[k].icon)}" alt=""><div>${esc(ITEMS[k].name)}<br><b>×${s.inv[k]}</b></div></div>`).join('') || '<p>Vide.</p>'}</div>
      <b>Fioles</b> <span style="color:var(--muted);font-size:12px">— cliquez pour l’équiper (touche 4), clic gauche pour lancer, clic droit pour boire</span>
      <div class="plist" style="margin-top:8px">${pots.map((p) => `<button data-p="${p}" class="${s.potionSel === p ? 'on' : ''}"><span class="vial" style="${this.vialCss(p)}"></span><div><b>${esc(POTIONS[p].name)}</b> ×${s.potions[p]}<small>Boire : ${esc(POTIONS[p].drink)} · Lancer : ${esc(POTIONS[p].thr)}</small></div></button>`).join('') || '<p>Aucune fiole.</p>'}</div>
      <div style="display:flex;justify-content:flex-end;margin-top:10px"><button data-close>Fermer (Tab)</button></div>`;
    $$('#invp [data-p]').forEach((b) => (b.onclick = () => { s.potionSel = b.dataset.p; s.tool = 'vial'; this.renderInventory(); sound.click(); }));
    $('#invp [data-close]').onclick = () => this.advClose();
  },

  // ------------------------------------------------------------ HUD aventure
  updateAdvHUD(prompt) {
    const s = adv.s, p = game.player, hud = $('#hud');
    const on = game.kind === 'adventure' && game.mode !== 'menu';
    hud.classList.toggle('adv', on);
    ['#hud-hp', '#hud-tool'].forEach((q) => $(q).classList.toggle('adv-on', on));
    $('#hud-compass').style.display = on ? 'block' : 'none';
    $('#hud-missions').style.display = on ? 'block' : 'none';
    if (!on) { $('#hud-prompt').textContent = ''; $('#hud-hold').style.display = 'none'; $('#hud-fx').textContent = ''; return; }
    $('#hud-ammo').style.display = 'none';
    $('#hud-time').style.left = (22 + $('#hud-hp').offsetWidth + 10) + 'px';
    $('#hud-hpv').textContent = Math.ceil(s.hp);
    $('#hud-hp').classList.toggle('low', s.hp < 30);
    $('#hud-hurt').style.opacity = adv.hurtT > 0 ? Math.min(1, adv.hurtT * 2) : s.hp < 25 ? 0.35 : 0;
    const t = ADV_TOOLS.find((q) => q.id === s.tool);
    $('#hud-tooln').textContent = t.name.toUpperCase();
    if (s.tool === 'revolver') { $('#hud-toolv').textContent = game.weapon.reloadT > 0 ? '…' : game.weapon.ammo; $('#hud-tools').textContent = '/ ' + adv.count('munitions'); }
    else if (s.tool === 'vial') { $('#hud-toolv').textContent = s.potionSel ? '×' + s.potions[s.potionSel] : '—'; $('#hud-tools').textContent = s.potionSel ? POTIONS[s.potionSel].name : 'aucune fiole'; }
    else { $('#hud-toolv').textContent = t.icon; $('#hud-tools').textContent = ''; }
    // boussole (sans carte)
    const heading = ((-p.yaw * 180 / Math.PI) % 360 + 360) % 360;
    const labels = [['N', 0], ['NE', 45], ['E', 90], ['SE', 135], ['S', 180], ['SO', 225], ['O', 270], ['NO', 315]];
    const wpx = $('#hud-compass').clientWidth;
    let html = '';
    for (const [n, a] of labels) {
      let d = ((a - heading + 540) % 360) - 180;
      if (Math.abs(d) > 70) continue;
      html += `<span style="left:${wpx / 2 + d * wpx / 140}px;opacity:${1 - Math.abs(d) / 80}">${n}</span>`;
    }
    for (let a = 15; a < 360; a += 15) if (a % 45) { const d = ((a - heading + 540) % 360) - 180; if (Math.abs(d) < 70) html += `<span style="left:${wpx / 2 + d * wpx / 140}px;opacity:.35">·</span>`; }
    $('#hud-compass-strip').innerHTML = html;
    $('#hud-prompt').innerHTML = prompt || '';
    const h = adv.hold;
    $('#hud-hold').style.display = h ? 'block' : 'none';
    if (h) $('#hud-hold div').style.width = Math.min(100, h.t / h.need * 100) + '%';
    const ms = s.missions.filter((m) => !m.done).slice(0, 4);
    $('#hud-missions').innerHTML = (adv.unread ? '<div>✉ <b>Nouveaux messages</b> au terminal</div>' : '') + ms.map((m) => `<div><b>${esc(m.title.toUpperCase())}</b> · ${esc(m.type === 'fuel' ? `générateur ${m.prog}/${m.n}` : m.type === 'deliver' || m.type === 'sample' ? `${adv.count(m.item)}/${m.n} ${ITEMS[m.item].name.toLowerCase()}` : m.type === 'brew' ? POTIONS[m.potion].name : m.type === 'repair' ? w_name(m.relay) : 'exploration')}</div>`).join('');
    $('#hud-fx').innerHTML = Object.keys(advPlay.effects).filter((k) => POTIONS[k]).map((k) => `<div><span class="vial" style="${this.vialCss(k)};width:8px;height:10px"></span>${esc(POTIONS[k].name)} ${Math.ceil(advPlay.effects[k])} s</div>`).join('');
    if (glitch.clockT > 0) $('#hud-clock').textContent = ['██:██', '66:66', '03:13', '--:--'][(Math.random() * 4) | 0];
  },
});

function w_name(relayId) {
  const r = game.world.adv.relays.find((q) => q.id === relayId);
  return r ? r.name : 'relais';
}
