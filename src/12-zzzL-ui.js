// ============================================================================
//  INTERFACE (agent L) : le rang des merveilles (nom en or : légendaire ; en
//  violet : mythique) dans la sacoche, les coffres, la barre et la liste de ce
//  qu'on ramasse ; l'onglet « Trésors » de la sacoche ; le terminal de la
//  Fondation ; les pages griffonnées.
// ============================================================================
{
  const st = document.createElement('style');
  const rgb = (h) => hexToRgb(h).join(',');
  let css = '';
  for (const id of LEG_ORDRE) {
    const R = LEG_RANGS[LEGENDAIRES[id].rang], sel = (a) => `#satchel [data-${a}="${id}"], #store [data-${a}="${id}"], #shop [data-${a}="${id}"]`;
    css += `${['it', 'put', 'take', 'sell'].map(sel).join(', ')} { border-color: ${R.col}; box-shadow: 0 0 7px rgba(${rgb(R.vif.length === 7 ? R.vif : R.col)},.55), inset 0 0 6px rgba(${rgb(R.vif)},.25); }\n`;
    css += `${['it', 'put', 'take', 'sell'].map((a) => sel(a).split(', ').map((s) => s + ' span').join(', ')).join(', ')} { color: ${R.col}; font-weight: bold; text-shadow: 0 0 6px rgba(${rgb(R.vif)},.55); }\n`;
  }
  css += `
.leg-l { color: #9a6c06; } .leg-m { color: #7428b8; }
#reader h3.leg-l { color: #9a6c06; text-shadow: 0 0 10px rgba(242,200,90,.6); } #reader h3.leg-m { color: #7428b8; text-shadow: 0 0 10px rgba(207,156,255,.7); }
.leg-carte { display: flex; gap: 12px; align-items: flex-start; margin: 4px 0 12px; }
.leg-carte img { width: 48px; height: 48px; image-rendering: pixelated; flex: none; filter: drop-shadow(0 0 6px rgba(242,200,90,.9)); }
.leg-carte.leg-m img { filter: drop-shadow(0 0 6px rgba(207,156,255,.95)); }
.leg-carte .leg-nom { font-size: 17px; } .leg-carte.leg-l .leg-nom { color: #9a6c06; } .leg-carte.leg-m .leg-nom { color: #7428b8; }
.leg-carte .leg-rang { margin-left: 8px; font-size: 12px; font-style: italic; letter-spacing: .06em; color: #7a6a52; }
.leg-carte p { margin: 5px 0 0; } .leg-hist { font-size: 14px; line-height: 1.55; } .leg-pouv { font-size: 13px; font-style: italic; color: #4a3a22; } .leg-orig { font-size: 12px; color: #7a6a52; }
.pp-panel .leg-legende { font-size: 12px; color: #7a6a52; font-style: italic; margin: 2px 0 10px; }
.pk.leg-l b, .pk.leg-l span { color: #f2c85a !important; text-shadow: 0 0 6px rgba(242,200,90,.8), 0 1px 2px #000; }
.pk.leg-m b, .pk.leg-m span { color: #cf9cff !important; text-shadow: 0 0 6px rgba(207,156,255,.85), 0 1px 2px #000; }
.pk.leg-l { border-color: rgba(242,200,90,.6); } .pk.leg-m { border-color: rgba(207,156,255,.6); }
#hotbar .hb-name.leg-l { color: #f2c85a; text-shadow: 0 0 8px rgba(242,200,90,.9), 0 1px 3px #000; }
#hotbar .hb-name.leg-m { color: #cf9cff; text-shadow: 0 0 8px rgba(207,156,255,.95), 0 1px 3px #000; }
#reader img.sl-page { display: block; width: 250px; max-width: 70vw; margin: 4px auto 10px; box-shadow: 0 4px 16px rgba(0,0,0,.45); transform: rotate(-1.4deg); }
#reader .sl-album { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin-bottom: 8px; }
#reader img.sl-page.petit { width: 104px; margin: 0; transform: rotate(0.8deg); }
#fondterm { width: min(920px, calc(100vw - 24px)); margin-bottom: 5vh; background: #040a06; color: #8fe8a0; font-family: 'Courier New', Courier, monospace; border: 1px solid #1f4a2a; border-radius: 6px;
  box-shadow: 0 0 40px rgba(60,255,140,.18), 0 18px 50px rgba(0,0,0,.75), inset 0 0 80px rgba(40,160,80,.12); }
#fondterm::before { opacity: 1; background: repeating-linear-gradient(0deg, rgba(0,0,0,.28) 0 1px, transparent 1px 3px); z-index: 1; }
#fondterm .ft-head { display: flex; justify-content: space-between; align-items: center; padding: 8px 14px; border-bottom: 1px solid #1f4a2a; color: #c8ffd4; letter-spacing: .08em; font-size: 12px; text-shadow: 0 0 6px rgba(120,255,160,.6); }
#fondterm .ft-head .x { background: none; border: none; color: #8fe8a0; font-size: 16px; cursor: pointer; position: relative; z-index: 2; }
#fondterm .ft-body { display: flex; min-height: 280px; max-height: 66vh; }
#fondterm .ft-liste { width: 240px; flex: none; overflow-y: auto; border-right: 1px solid #1f4a2a; padding: 6px; position: relative; z-index: 2; scrollbar-width: thin; }
#fondterm .ft-liste button { display: block; width: 100%; text-align: left; background: none; border: none; color: #8fe8a0; font: 13px 'Courier New', Courier, monospace; padding: 5px 6px; cursor: pointer; border-radius: 3px; }
#fondterm .ft-liste button small { display: block; color: #5aa870; font-size: 11px; }
#fondterm .ft-liste button.on, #fondterm .ft-liste button:hover { background: rgba(80,255,140,.12); color: #e0ffe8; }
#fondterm .ft-doc { flex: 1; overflow-y: auto; padding: 10px 18px 14px; font-size: 14px; line-height: 1.5; text-shadow: 0 0 4px rgba(120,255,160,.35); position: relative; z-index: 2; scrollbar-width: thin; }
#fondterm h5 { margin: 0 0 4px; font-size: 16px; color: #e0ffe8; letter-spacing: .04em; }
#fondterm h6 { margin: 12px 0 2px; font-size: 12px; color: #c8ffd4; text-transform: uppercase; letter-spacing: .08em; }
#fondterm p { margin: 0 0 6px; } #fondterm .ft-cl b { color: #ffd070; }
#fondterm .ft-foot { padding: 6px 14px; border-top: 1px solid #1f4a2a; font-size: 11px; color: #5aa870; letter-spacing: .06em; }
#fondterm .ft-cur { animation: ftBlink 1s steps(1) infinite; } @keyframes ftBlink { 50% { opacity: 0; } }
`;
  st.textContent = css;
  document.head.appendChild(st);
}
// ---------------------------------------------------------------- l'onglet « Trésors » de la sacoche
{
  const _rs = ui.renderSatchel.bind(ui);
  ui.renderSatchel = function () {
    _rs();
    if (!farm.s) return;
    const found = legendaires.list();
    if (!found.length && this.satTab !== 'tresors') return;
    const tabs = $('#satchel .tabs');
    if (!tabs) return;
    let b = tabs.querySelector('[data-tab="tresors"]');
    if (!b) { b = document.createElement('button'); b.dataset.tab = 'tresors'; b.textContent = 'Trésors'; tabs.insertBefore(b, tabs.querySelector('.x')); }
    b.onclick = () => { this.satTab = 'tresors'; this.renderSatchel(); sound.page && sound.page(); };
    if (this.satTab !== 'tresors') { b.classList.remove('on'); return; }
    tabs.querySelectorAll('button').forEach((q) => q.classList.toggle('on', q === b));
    const body = $('#satchel .body');
    if (!body) return;
    const reste = legendaires.possibles().length - found.length;
    body.innerHTML = `<div class="leg-legende">Les merveilles de la vallée : chacune est unique. <span class="leg-l">En or</span> : légendaire · <span class="leg-m">en violet</span> : mythique.</div>` +
      (found.length ? found.map((id) => legendaires.carte(id)).join('') : '<p class="hint">Aucune encore.</p>') +
      `<p class="hint">${found.length} merveille${found.length > 1 ? 's' : ''} trouvée${found.length > 1 ? 's' : ''}.${reste > 0 ? ' D’autres, dit-on, dorment encore quelque part dans la vallée.' : ' On ne raconte plus rien d’autre.'} Bouton droit, une merveille en main : la contempler.</p>`;
  };
}
// ---------------------------------------------------------------- la liste de ce qu'on ramasse, la barre d'outils
{
  const _render = feed.render.bind(feed);
  feed.render = function (r) {
    _render(r);
    const L = LEGENDAIRES[r.id];
    if (L) r.div.classList.add(L.rang === 'mythique' ? 'leg-m' : 'leg-l');
  };
  const _br = bar.render.bind(bar);
  bar.render = function (force) {
    _br(force);
    const el = this.el && this.el.querySelector('.hb-name');
    if (!el || !farm.s) return;
    const L = LEGENDAIRES[farm.s.hand];
    el.classList.toggle('leg-l', !!L && L.rang === 'legendaire');
    el.classList.toggle('leg-m', !!L && L.rang === 'mythique');
  };
}
