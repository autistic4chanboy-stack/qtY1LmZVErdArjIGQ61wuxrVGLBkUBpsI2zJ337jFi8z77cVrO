// ============================================================================
//  LES GOBELINS (agent X) : l'étal des prises (à la Gobelinière) et le carnet
//  - l'étal : ce qu'ils ont rapporté ces dernières nuits, rangé par maisons (une
//    rangée par porte) ; on reprend une rangée, ou tout. Ce qu'on reprend à
//    quelqu'un, on peut le lui rendre (11-zzzzX-2-jeu.js : talk) ;
//  - le carnet de la sacoche : « Les Petits » (ce qu'on en sait, sans plus).
// ============================================================================
const gobEtal = {
  styled: false,
  style() {
    if (this.styled || typeof document === 'undefined' || !document.head) return;
    this.styled = true;
    const st = document.createElement('style');
    st.id = 'gob-css';
    st.textContent = '#reader .gob-etal .intro{font-style:italic;color:#5a4a36;margin:0 0 10px}#reader .gob-rang{border-bottom:1px dotted rgba(90,70,40,.35);padding:6px 2px;display:flex;gap:10px;align-items:baseline}'
      + '#reader .gob-rang .qui{min-width:150px;color:#6a4a2e;font-weight:bold}#reader .gob-rang .quoi{flex:1;font-size:14px}#reader .gob-rang button{font:13px Georgia,serif}'
      + '#reader .gob-etal .bas{margin-top:12px;display:flex;gap:8px}#satchel .gob-carnet p{margin:3px 0;font-size:14px;line-height:1.45;color:#4a3a28}#satchel .gob-carnet i{color:#7a5a3a}';
    document.head.appendChild(st);
  },
  // le nom d'une maison (et de qui y vit)
  maison(bld, de) {
    if (bld === 'ferme') return GOB_T.etal.ferme;
    const n = de && npcs.byId ? npcs.byId[de] : null;
    if (n && n.st && n.st.met) return n.name + ' ' + (n.d.surname || '');
    const B = game.world && game.world.bld ? game.world.bld[bld] : null;
    const nom = LIEU_NAMES[bld] || (B && B.name) || '';
    return nom && nom !== bld ? nom : GOB_T.etal.inconnu;
  },
  rangs() {
    const S = gobelins.S(), M = new Map();
    for (const P of S.prises) { const k = (P.bld || '') + '|' + (P.de || ''); if (!M.has(k)) M.set(k, { cle: k, bld: P.bld, de: P.de, L: [] }); M.get(k).L.push(P); }
    return [...M.values()];
  },
  ouvrir() {
    if (!farm.s) return;
    this.style();
    const T = GOB_T.etal, R = this.rangs();
    const quoi = (L) => L.map((P) => P.k === 'argent' ? (P.n > 1 ? `${P.n} pièces` : 'une pièce') : (P.n > 1 ? `${itemName(P.k).toLowerCase()} (${P.n})` : itemName(P.k).toLowerCase())).join(', ');
    const corps = R.length
      ? R.map((r, i) => `<div class="gob-rang"><span class="qui">${esc(this.maison(r.bld, r.de))}</span><span class="quoi">${esc(quoi(r.L))}</span><button data-gobr="${i}">${esc(T.prendre)}</button></div>`).join('')
      : `<p class="hint">${esc(T.vide)}</p>`;
    ui.open('#reader', `<div class="gob-etal"><h3>${esc(T.titre)}</h3><p class="intro">${esc(T.intro)}</p>${corps}<div class="bas">${R.length ? `<button data-gobtout="1">${esc(T.tout)}</button>` : ''}<button class="close">Refermer</button></div></div>`);
    const el = $('#reader');
    el.querySelector('.close').onclick = () => ui.close();
    el.querySelectorAll('[data-gobr]').forEach((b) => (b.onclick = () => { const r = R[+b.dataset.gobr]; if (r) { gobelins.reprendre([r.cle]); ui.subtitle('', T.pris, 2.5); } this.ouvrir(); }));
    const tout = el.querySelector('[data-gobtout]');
    if (tout) tout.onclick = () => { gobelins.reprendre(null); ui.subtitle('', T.pris, 2.5); this.ouvrir(); };
  },
  // le carnet : ce qu'on sait d'eux
  carnetHTML() {
    const S = gobelins.S();
    if (!S || (!S.vus && !S.connu.signe && !S.connu.souche && !S.connu.racine)) return '';
    const C = GOB_T.carnet, L = [];
    if (S.vus) L.push(C.vus(S.vus));
    if (S.vols && S.connu.signe) L.push(C.vols(S.vols));
    if (S.connu.signe) L.push(C.marque);
    if (S.connu.racine) L.push(C.souche);
    if (S.connu.entre) L.push(C.porte);
    if (S.connu.village) L.push(C.village);
    if (S.connu.raccourci) L.push(C.raccourci);
    if (S.pacte > 0 && !S.pacteRompu) L.push(C.pacte);
    if (S.rancune >= 3 && !gobelins.partis()) L.push(C.rancune);
    if (gobelins.partis()) L.push(C.partis);
    if (!L.length) return '';
    return `<h4>${esc(C.titre)}</h4><div class="gob-carnet">${L.map((t) => `<p>${esc(t)}</p>`).join('')}</div>`;
  },
};
HOOKS.load.push(() => {
  if (gobEtal.branche) return;
  gobEtal.branche = true;
  const _rs = ui.renderSatchel.bind(ui);
  ui.renderSatchel = function () {
    _rs();
    try {
      if (this.satTab !== 'carnet' || !farm.s) return;
      const body = $('#satchel .body'), html = gobEtal.carnetHTML();
      if (!body || !html || body.querySelector('.gob-carnet')) return;
      gobEtal.style();
      const last = body.querySelector('p.hint:last-child');
      if (last) last.insertAdjacentHTML('beforebegin', html); else body.insertAdjacentHTML('beforeend', html);
    } catch (e) { console.error('gobelins', e); }
  };
});
