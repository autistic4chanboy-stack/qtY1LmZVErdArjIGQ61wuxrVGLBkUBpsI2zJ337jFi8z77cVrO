// ============================================================================
//  CE QU'ON RAMASSE : une courte liste discrète à droite de l'écran
//  (« +3 Tomates — Noire de Crimée », « +45 pièces »), avec l'icône et le total
//  dans la sacoche ; elle s'efface d'elle-même. Les mêmes objets ramassés
//  d'affilée s'additionnent sur la même ligne. Rien pendant les achats ni la
//  fabrication (le panneau ouvert le montre déjà).
// ============================================================================
const feed = {
  el: null, rows: [],
  push(id, n, note) {
    if (!(n > 0) || ui.panel || !game.started || game.mode !== 'play' || game.dying) return;
    const el = this.el || (this.el = $('#pickups'));
    if (!el) return;
    const now = performance.now();
    let r = this.rows.find((q) => q.id === id && q.note === (note || '') && !q.fading && now - q.t < 3500);
    if (r) {
      r.n += n; r.t = now; this.render(r);
      r.div.classList.remove('bump'); void r.div.offsetWidth; r.div.classList.add('bump');
      return;
    }
    r = { id, n, note: note || '', t: now, div: document.createElement('div') };
    r.div.className = 'pk';
    this.render(r);
    el.appendChild(r.div);
    this.rows.push(r);
    while (this.rows.filter((q) => !q.fading).length > 6) this.fade(this.rows.find((q) => !q.fading));
  },
  render(r) {
    const money = r.id === 'argent';
    const name = money ? (r.n > 1 ? 'pièces' : 'pièce') : itemName(r.id);
    const total = money ? farm.s.money : farm.count(r.id);
    r.div.innerHTML = `<img src="${iconURL(money ? 'vieille_piece' : r.id)}" alt=""><span><b>+${r.n}</b> ${esc(name)}${r.note ? ` <i>${esc(r.note)}</i>` : ''}</span><small>${money ? total + ' en bourse' : '×' + total}</small>`;
  },
  fade(r) {
    if (!r || r.fading) return;
    r.fading = true;
    r.div.classList.add('out');
    setTimeout(() => { r.div.remove(); this.rows = this.rows.filter((q) => q !== r); }, 650);
  },
  update() {
    const el = this.el || (this.el = $('#pickups'));
    if (!el) return;
    el.classList.toggle('hid', !!ui.panel || game.mode !== 'play');
    const now = performance.now();
    for (const r of this.rows) if (!r.fading && now - r.t > 3400) this.fade(r);
  },
  clear() { for (const r of this.rows) r.div.remove(); this.rows = []; },
};
{
  const _give = farm.give.bind(farm);
  farm.give = function (id, n = 1) {
    _give(id, n);
    if (n > 0 && this.s && typeof game !== 'undefined' && game.world) feed.push(id, n, (typeof play !== 'undefined' && play.feedNote) || '');
  };
  const _earn = farm.earn.bind(farm);
  farm.earn = function (n) {
    _earn(n);
    if (n > 0 && typeof game !== 'undefined' && game.world) feed.push('argent', n, '');
  };
}
HOOKS.update.push(() => feed.update());
HOOKS.load.push(() => feed.clear());
