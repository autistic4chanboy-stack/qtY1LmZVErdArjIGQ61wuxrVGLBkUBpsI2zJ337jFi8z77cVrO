// ============================================================================
//  LES CRÉATURES DES TERRES D'AVANT (agent V2) — le carnet : « Derrière la Porte »
//  Dans l'onglet Carnet de la sacoche, une section qui n'apparaît qu'après la
//  première bête vue : pour chaque espèce rencontrée, ce qu'on en a compris
//  (une ligne quand on l'a vue, une autre quand on lui a échappé ou qu'on a
//  compris son heure, une dernière quand c'est fini). Des mots du personnage,
//  courts ; rien qu'il n'ait vu lui-même.
// ============================================================================
function v2CarnetHTML() {
  if (!farm.s || !farm.s.v2) return '';
  const S = creaturesV2.S(), L = [];
  for (const id of V2_ORDRE) {
    const n = S.notes[id];
    if (n === undefined) continue;
    const D = V2_ESPECES[id], T = V2_CARNET[id] || [];
    const lignes = T.slice(0, Math.min(T.length, n + 1)).map((t) => esc(t)).join(' ');
    const mort = D.unique && S.uniques[id] ? ' <i>' + esc(D.fem ? 'Morte.' : 'Mort.') + '</i>' : '';
    L.push(`<p><b>${esc(D.titre)}</b> — ${lignes}${mort}</p>`);
  }
  if (!L.length) return '';
  return `<h4>${esc(V2_CARNET_TITRE)}</h4><div class="v2-carnet">${L.join('')}</div>`;
}
{
  const _rs = ui.renderSatchel.bind(ui);
  ui.renderSatchel = function () {
    _rs();
    try {
      if (this.satTab !== 'carnet' || !farm.s) return;
      const body = document.querySelector('#satchel .body');
      if (!body || body.querySelector('.v2-carnet')) return;
      const html = v2CarnetHTML();
      if (!html) return;
      if (!document.getElementById('v2-css')) {
        const st = document.createElement('style');
        st.id = 'v2-css';
        st.textContent = '#satchel .v2-carnet p{margin:3px 0;font-size:14px;line-height:1.45;color:#4a3a28}#satchel .v2-carnet i{color:#7a3a2a}';
        document.head.appendChild(st);
      }
      const last = body.querySelector('p.hint:last-child');
      if (last) last.insertAdjacentHTML('beforebegin', html); else body.insertAdjacentHTML('beforeend', html);
    } catch (e) { console.error(e); }
  };
}
// les rumeurs de la vallée (rares, de biais)
{
  for (const id in V2_RUMEURS) {
    const d = NPC_DATA.find((x) => x.id === id);
    if (d && d.lines && Array.isArray(d.lines.rumeurs)) for (const t of V2_RUMEURS[id]) if (!d.lines.rumeurs.includes(t)) d.lines.rumeurs.push(t);
  }
}
