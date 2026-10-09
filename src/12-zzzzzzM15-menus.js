// ============================================================================
//  LE MENU EN JEU, SIMPLIFIÉ (agent M15)
//  - Tab : quatre onglets — Sacoche, Atelier, Carnet, Wiki — et, dessous, les
//    pages de l'onglet quand il y en a plusieurs (registre : 05-zzzzzzM15) ;
//    ⚙ ouvre les Options, ✕ referme. ← → : onglets ; Maj+← → : pages.
//    Ce fichier s'emballe en DERNIER autour de ui.renderSatchel : les autres
//    emballages remplissent le corps comme avant ; on refait la barre.
//  - Les lettres : on ne lit dans la sacoche que celles qu'on a sur soi ; les
//    autres attendent à la boîte aux lettres (E dessus : les lire, les prendre,
//    les y laisser).
//  - Lire une note, une lettre, une page depuis le menu ramène au menu.
//  - Options : rangées en quatre sections (Image, Son, Commandes, Jeu).
// ============================================================================
{
  const st = document.createElement('style');
  st.id = 'm15-css';
  st.textContent = `
#satchel > .tabs { flex-wrap: nowrap; gap: 2px; padding: 8px 10px 0; }
#satchel > .tabs .m15-o { position: relative; padding: 6px 14px 8px; font-size: 17px; letter-spacing: .02em; white-space: nowrap; }
#satchel > .tabs .m15-o:focus-visible, #satchel .m15-pages button:focus-visible, #m15-boite button:focus-visible { outline: 2px dotted #8a5a2a; outline-offset: 1px; }
#satchel > .tabs .m15-opt { margin-left: auto; font-size: 18px; padding: 4px 10px 8px; color: #6a5436; }
#satchel > .tabs .m15-opt + .x { margin-left: 0; }
#satchel > .tabs sup, #satchel .m15-pages sup { font-size: 10px; color: #f4ead2; background: #8a3a1a; border-radius: 7px; padding: 0 4px; margin-left: 3px; vertical-align: 6px; }
#satchel .m15-pages { display: flex; gap: 4px; padding: 7px 14px 6px; border-bottom: 1px solid rgba(90,70,40,.18); overflow-x: auto; scrollbar-width: none; flex: none; }
#satchel .m15-pages button { flex: none; padding: 3px 11px; background: rgba(255,255,255,.28); border: 1px solid rgba(90,70,40,.28); border-radius: 12px; font-size: 13.5px; color: #4a3a26; cursor: pointer; }
#satchel .m15-pages button.on { background: #8a5a2a; color: #f4ead2; border-color: #8a5a2a; }
#satchel .m15-pages button:hover:not(.on) { background: rgba(255,240,200,.75); }
#satchel > .body { flex: 1; min-height: 0; }
#satchel .m15-vide { margin-top: 18px; }
#m15-boite { width: min(560px, calc(100vw - 24px)); }
#m15-boite .body { min-height: 120px; }
#m15-boite .m15-l { display: flex; gap: 6px; align-items: stretch; margin-bottom: 4px; }
#m15-boite .m15-l .note { flex: 1; margin: 0; }
#m15-boite .m15-l .m15-pr { flex: none; min-width: 74px; padding: 4px 10px; background: rgba(122,74,26,.14); border: 1px solid rgba(122,74,26,.4); border-radius: 3px; color: #5a3a1a; font-size: 13px; cursor: pointer; }
#m15-boite .m15-l .m15-pr:hover { background: rgba(255,240,200,.75); }
#m15-boite .foot { display: flex; justify-content: flex-end; gap: 8px; }
#m15-boite .foot button { padding: 6px 14px; background: #8a5a2a; color: #f4ead2; border: none; border-radius: 3px; font-size: 14px; cursor: pointer; }
#m15-boite .foot button.sec { background: none; color: #5a3a1a; border: 1px solid rgba(90,70,40,.4); }
#dlg-options .cols h4.m15-sec { grid-column: 1 / -1; margin: 16px 0 0; padding-bottom: 3px; color: var(--amber); font-size: 12px; letter-spacing: .14em; font-weight: normal; border-bottom: 1px solid rgba(255,255,255,.08); }
#dlg-options .cols h4.m15-sec:first-child { margin-top: 0; }
@media (max-width: 560px) {
  #satchel { height: calc(100vh - 5vh); margin-bottom: 2vh; }
  #satchel > .tabs { padding: 6px 4px 0; }
  #satchel > .tabs .m15-o { padding: 6px 8px 8px; font-size: 15px; }
  #satchel > .tabs .m15-opt { padding: 4px 6px 8px; }
  #satchel > .body { padding: 8px 10px 14px; }
  #satchel .m15-pages { padding: 6px 8px 5px; }
  #m15-boite .m15-l .m15-pr { min-width: 0; }
}`;
  document.head.appendChild(st);
}

Object.assign(menus, {
  der: {},           // dernière page vue de chaque onglet
  // la page à montrer pour un identifiant demandé (page invisible ou inconnue : la première visible de son onglet)
  resoudre(id) {
    let p = this.pages[id];
    if (p && this.vis(p)) return id;
    const o = p ? p.onglet : (this.ONGLETS.some(([k]) => k === id) ? id : 'sac');
    const L = this.liste(o);
    if (L.length) return (this.der[o] && L.find((q) => q.id === this.der[o]) || L[0]).id;
    return 'sac';
  },
  ongletsVisibles() { return this.ONGLETS.filter(([k]) => this.liste(k).length); },
  allerOnglet(o) { const L = this.liste(o); if (!L.length) return; ui.satTab = this.der[o] && L.find((q) => q.id === this.der[o]) ? this.der[o] : L[0].id; ui.renderSatchel(); sound.page && sound.page(); },
  allerPage(id) { ui.satTab = id; ui.renderSatchel(); sound.page && sound.page(); },
  // ← → (d = ±1) : l'onglet voisin ; avec Maj : la page voisine
  voisin(d, page) {
    const cur = ui.satTab, o = this.ongletDe(cur);
    if (page) { const L = this.liste(o), i = L.findIndex((q) => q.id === cur); if (L.length > 1) this.allerPage(L[(i + d + L.length) % L.length].id); return; }
    const O = this.ongletsVisibles(), i = O.findIndex(([k]) => k === o);
    if (O.length > 1) this.allerOnglet(O[(i + d + O.length) % O.length][0]);
  },
  nMarque(o) { return this.liste(o).reduce((n, p) => n + (+this.marques[p.id] || 0), 0); },
  // la barre : les onglets, puis les pages de l'onglet
  barre(el, id) {
    const o = this.ongletDe(id), sup = (n) => (n ? `<sup>${n}</sup>` : '');
    const tabs = el.querySelector(':scope > .tabs');
    if (!tabs) return;
    tabs.classList.add('m15-tabs');
    tabs.setAttribute('role', 'tablist');
    tabs.innerHTML = this.ongletsVisibles().map(([k, n]) => `<button class="m15-o${k === o ? ' on' : ''}" data-m15o="${k}" role="tab" aria-selected="${k === o}">${esc(n)}${sup(this.nMarque(k))}</button>`).join('')
      + `<button class="m15-opt" data-m15opt title="Options" aria-label="Options">⚙</button><button class="x" data-close title="Refermer (Tab)" aria-label="Refermer">✕</button>`;
    let pg = el.querySelector(':scope > .m15-pages');
    const L = this.liste(o);
    if (L.length > 1) {
      if (!pg) { pg = document.createElement('div'); pg.className = 'm15-pages'; tabs.after(pg); }
      pg.innerHTML = L.map((p) => `<button data-m15p="${p.id}" class="${p.id === id ? 'on' : ''}">${esc(p.titre || p.id)}${sup(this.marques[p.id])}</button>`).join('');
      const on = pg.querySelector('.on');
      if (on && on.scrollIntoView && pg.scrollWidth > pg.clientWidth) pg.scrollLeft = Math.max(0, on.offsetLeft - 20);
    } else if (pg) pg.remove();
    tabs.querySelectorAll('[data-m15o]').forEach((b) => (b.onclick = () => this.allerOnglet(b.dataset.m15o)));
    if (pg) pg.querySelectorAll('[data-m15p]').forEach((b) => (b.onclick = () => this.allerPage(b.dataset.m15p)));
    tabs.querySelector('[data-close]').onclick = () => ui.close();
    tabs.querySelector('[data-m15opt]').onclick = () => this.options();
  },
  options() {
    ui.close(true);
    if (typeof game !== 'undefined' && game.pause) game.pause();
    ui.openDialog('#dlg-options');
  },

  // ---------------------------------------------------------------- les lettres
  surSoi() { return farm.s && Array.isArray(farm.s.mail) ? farm.s.mail.map((m, i) => [m, i]).filter(([m]) => m && m.sur) : []; },
  dansBoite() { return farm.s && Array.isArray(farm.s.mail) ? farm.s.mail.map((m, i) => [m, i]).filter(([m]) => m && !m.sur) : []; },
  ligneLettre(m, i, attr) { return `<button class="note ${m.read ? '' : 'new'}" ${attr}="${i}">${esc(m.title)} <span>— ${esc(m.from)}, jour ${m.day}</span></button>`; },
  lireLettre(i) {
    const s = farm.s, m = s && s.mail[i];
    if (!m) return;
    m.read = true;
    ui.read(m.title, m.text, m.from);
    // la lettre de Marie Lemarié (quête t2) : ses trois choix tant qu'on n'a rien décidé
    try {
      if (m.tq === 't2' && !m.tqFin && typeof quetes !== 'undefined' && typeof qtBoutons === 'function') {
        const q = quetes.q('t2');
        if (q && (q.st === '' || q.st === 'propose')) qtBoutons('t2', QT_QUETES.t2.propose);
      }
    } catch (e) { console.error(e); }
  },
  // la page Lettres de la sacoche : seulement celles qu'on a sur soi (+ les papiers trouvés, déjà dans le corps)
  pageLettres(body) {
    body.querySelectorAll('[data-mail]').forEach((b) => b.remove());
    body.querySelectorAll(':scope > p.hint').forEach((p) => p.remove());
    const L = this.surSoi().reverse();
    const box = document.createElement('div');
    box.className = 'm15-lettres';
    box.innerHTML = L.map(([m, i]) => this.ligneLettre(m, i, 'data-m15l')).join('');
    body.insertBefore(box, body.firstChild);
    box.querySelectorAll('[data-m15l]').forEach((b) => (b.onclick = () => this.lireLettre(+b.dataset.m15l)));
    if (!L.length && !body.querySelector('.f2-papiers')) body.insertAdjacentHTML('beforeend', '<p class="hint m15-vide">Aucune lettre sur vous.</p>');
  },
  // la boîte aux lettres de la ferme
  boite() {
    if (!farm.s) return;
    if (!$('#m15-boite')) { const d = document.createElement('div'); d.id = 'm15-boite'; d.className = 'pp-panel'; $('#paper').appendChild(d); }
    const B = this.dansBoite().reverse(), S = this.surSoi().reverse();
    const ligne = ([m, i], quoi) => `<div class="m15-l">${this.ligneLettre(m, i, 'data-m15b')}<button class="m15-pr" data-m15${quoi}="${i}">${quoi === 'pr' ? 'Prendre' : 'Laisser'}</button></div>`;
    let body = B.map((x) => ligne(x, 'pr')).join('') || '<p class="hint">Vide.</p>';
    if (S.length) body += `<h4>Sur vous</h4>` + S.map((x) => ligne(x, 'la')).join('');
    const foot = `<div class="foot">${B.length > 1 ? '<button data-m15tout>Tout prendre</button>' : ''}<button class="sec" data-close>Refermer</button></div>`;
    const html = `<div class="tabs"><b>La boîte aux lettres</b><button class="x" data-close aria-label="Refermer">✕</button></div><div class="body">${body}</div>${foot}`;
    if (ui.panel === '#m15-boite') { const el = $('#m15-boite'), y = el.querySelector('.body') ? el.querySelector('.body').scrollTop : 0; el.innerHTML = html; el.querySelector('.body').scrollTop = y; }
    else ui.open('#m15-boite', html);
    const el = $('#m15-boite');
    el.querySelectorAll('[data-close]').forEach((b) => (b.onclick = () => ui.close()));
    el.querySelectorAll('[data-m15b]').forEach((b) => (b.onclick = () => this.lireLettre(+b.dataset.m15b)));
    el.querySelectorAll('[data-m15pr]').forEach((b) => (b.onclick = () => { const m = farm.s.mail[+b.dataset.m15pr]; if (m) m.sur = true; sound.page && sound.page(); this.boite(); }));
    el.querySelectorAll('[data-m15la]').forEach((b) => (b.onclick = () => { const m = farm.s.mail[+b.dataset.m15la]; if (m) m.sur = false; sound.page && sound.page(); this.boite(); }));
    const t = el.querySelector('[data-m15tout]');
    if (t) t.onclick = () => { for (const [m] of this.dansBoite()) m.sur = true; sound.page && sound.page(); this.boite(); };
  },
  boiteKey(k) { const b = $$('#m15-boite [data-m15b]')[k - 1]; if (b) b.click(); },

  // ---------------------------------------------------------------- les options, en sections
  SECTIONS: [
    ['Image', ['o-fov', 'o-pixel', 'o-view', 'o-fog', 'o-grass', 'o-gamma', 'o-dither', 'o-bands', 'o-fps']],
    ['Son', ['o-volume', 'o-amb', 'o-musique-vol', 'o-musique', 'o-son3d', 'o-subs']],
    ['Commandes', ['o-sens', 'o-invert', 'o-hotbar', 'o-dot']],
    ['Jeu', ['o-lang', 'o-wiki']],
  ],
  rangerOptions() {
    const cols = $('#dlg-options .cols');
    if (!cols) return;
    cols.querySelectorAll(':scope > h4.m15-sec').forEach((h) => h.remove());
    const items = [...cols.children];
    const cle = (el) => { const i = el.querySelector('input, select'); return i ? i.id : ''; };
    const pris = new Set(), ordre = [];
    this.SECTIONS.forEach(([titre, ids], si) => {
      const L = [];
      for (const id of ids) { const el = items.find((x) => cle(x) === id); if (el && !pris.has(el)) { pris.add(el); L.push(el); } }
      if (si === this.SECTIONS.length - 1) for (const el of items) if (!pris.has(el)) { pris.add(el); L.push(el); }
      if (L.length) ordre.push([titre, L]);
    });
    for (const [titre, L] of ordre) {
      const h = document.createElement('h4');
      h.className = 'm15-sec';
      h.textContent = titre;
      cols.appendChild(h);
      for (const el of L) cols.appendChild(el);
    }
  },
});

// ---------------------------------------------------------------- l'emballage (le dernier) de la sacoche
{
  const _rs = ui.renderSatchel.bind(ui);
  ui.renderSatchel = function () {
    if (!farm.s) return _rs();
    const id = menus.resoudre(this.satTab || 'sac');
    this.satTab = id;
    _rs();
    try {
      const el = $('#satchel'), body = el && el.querySelector(':scope > .body');
      if (!el || !body) return;
      const P = menus.pages[id];
      if (P && P.rendre) {
        body.innerHTML = '';
        const h = P.rendre(body);
        if (typeof h === 'string') body.innerHTML = h;
        if (P.apres) P.apres(body);
      }
      if (id === 'lettres') menus.pageLettres(body);
      menus.barre(el, id);
      if (menus.dernier !== id) body.scrollTop = 0;
      menus.dernier = id;
      menus.der[menus.ongletDe(id)] = id;
    } catch (e) { console.error(e); }
  };
}

// ---------------------------------------------------------------- le Wiki de D15 (s'il est là)
if (typeof decouvertes !== 'undefined') {
  decouvertes.accueilli = true;
  if (!menus.pages.wiki) menus.page({ id: 'wiki', onglet: 'wiki', titre: 'Wiki', ordre: 10, rendre: (body) => { decouvertes.rendre(body); } });
}

// ---------------------------------------------------------------- lire depuis un menu ramène au menu
{
  const _open = ui.open.bind(ui), _close = ui.close.bind(ui);
  ui.open = function (id, html) {
    const de = this.panel;
    _open(id, html);
    if (id === '#reader' && (de === '#satchel' || de === '#m15-boite')) this.m15Retour = de === '#satchel' ? () => this.openSatchel() : () => menus.boite();
  };
  ui.close = function (silent) {
    const was = this.panel, r = this.m15Retour;
    this.m15Retour = null;
    const choix = was === '#reader' && document.querySelector('#reader .t-choix');
    _close(silent);
    if (!silent && was === '#reader' && r && !choix && farm.s && !farm.s.over) r();
  };
}

// ---------------------------------------------------------------- la boîte aux lettres (E dessus)
HOOKS.inter.mailbox = () => {
  const mb = game.world && game.world.farm && game.world.farm.mailbox;
  if (mb) farm.setPropData(mb, { mail: false });
  menus.boite();
};

// ---------------------------------------------------------------- les options
{
  const _od = ui.openDialog.bind(ui);
  ui.openDialog = function (id) {
    if (id === '#dlg-options') { try { menus.rangerOptions(); } catch (e) { console.error(e); } }
    return _od(id);
  };
}

// ---------------------------------------------------------------- le clavier
// (en capture : E qui referme la boîte ne doit pas, au relâché, la rouvrir)
window.addEventListener('keydown', (e) => {
  if (typeof game === 'undefined' || game.kind !== 'farm' || game.mode === 'menu') return;
  const a = document.activeElement;
  if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.tagName === 'SELECT' || a.isContentEditable)) return;
  if (ui.panel === '#satchel' && (e.code === 'ArrowLeft' || e.code === 'ArrowRight')) {
    e.preventDefault();
    menus.voisin(e.code === 'ArrowLeft' ? -1 : 1, e.shiftKey);
  } else if (ui.panel === '#m15-boite') {
    if (e.code === 'KeyE') { e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat) { menus.eAvale = true; ui.close(); } }
    else if (/^Digit[1-9]$/.test(e.code) && !e.repeat) { e.stopImmediatePropagation(); menus.boiteKey(+e.code.slice(5)); }
  }
}, true);
window.addEventListener('keyup', (e) => {
  if (e.code === 'KeyE' && menus.eAvale) { menus.eAvale = false; e.stopImmediatePropagation(); }
}, true);
