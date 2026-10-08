// ============================================================================
//  LE NONOS DU CHIEN (agent Q) : le carnet (sacoche, onglet Carnet).
//  « Quête principale — facultative » en tête des quêtes : une phrase vague par
//  lieu entrevu (jamais son nom ni le chemin), ce qu'on a trouvé, et un bouton
//  pour revoir chaque souvenir.
// ============================================================================
function nonosCarnetHTML() {
  const S = farm.s && farm.s.nonos;
  if (!S || !(S.e >= 1) || !Array.isArray(S.L) || S.L.length < NONOS_N) return '';
  if (!document.getElementById('q-carnet-css')) {
    const st = document.createElement('style');
    st.id = 'q-carnet-css';
    st.textContent = `#satchel .q-nonos .souv{display:flex;align-items:baseline;gap:8px;margin-top:4px}
#satchel .q-nonos .souv i{flex:1;font-style:italic;color:#5a4a36}
#satchel .q-nonos .souv button{flex:none;padding:2px 9px;font-size:12px;background:rgba(122,74,26,.14);border:1px solid rgba(122,74,26,.4);border-radius:3px;color:#5a3a1a}
#satchel .q-nonos .souv button:hover{background:rgba(255,240,200,.75)}
#satchel .q-nonos .tr{font-size:12px;color:#7a6a52;margin-left:10px}`;
    document.head.appendChild(st);
  }
  const nom = (farm.s.dog && farm.s.dog.name) || 'Le chien', C = NONOS_CARNET;
  const vus = S.e >= 6 ? NONOS_N : S.e, fait = !!S.rendu, mort = S.fin === 'mort';
  let h = `<div class="q ${fait ? 'fait' : 'actif'} q-nonos"><b>${esc(C.titre(nom))}</b><div>${esc(C.intro(nom, S.j0 || farm.s.day))}</div>`;
  for (let i = 1; i <= vus; i++) {
    const L = S.L[i - 1], T = NONOS_TYPES[L.t], ph = T && T.ph ? T.ph[(L.v | 0) % T.ph.length] : null;
    h += `<div class="souv"><i>« ${esc(ph ? ph[0] : '…')} »</i><button data-q-revoir="${i}">${esc(C.revoir)}</button></div>`;
    if (S.tr[i - 1] && i < NONOS_N) h += `<div class="tr">${esc(C.trouve)} : ${esc(NONOS_INDICES[i - 1].court)}.</div>`;
  }
  if (mort) h += `<div>${esc(C.mort(nom))}</div>`;
  else if (fait) h += `<div>${esc(C.rendu(nom))}</div>`;
  else if (S.e >= 6) h += `<div>${esc(C.retrouve(nom))}</div>`;
  else h += `<div>${esc(C.chercher(nom))}</div>`;
  return `<h4>${esc(C.section)}</h4>${h}</div>`;
}
{
  const _rs = ui.renderSatchel.bind(ui);
  ui.renderSatchel = function () {
    _rs();
    try {
      if (this.satTab !== 'carnet' || !farm.s) return;
      const body = document.querySelector('#satchel .body');
      if (!body || body.querySelector('.q-nonos')) return;
      const html = nonosCarnetHTML();
      if (!html) return;
      const h4 = [...body.querySelectorAll(':scope > h4')].find((x) => x.textContent.trim() === 'En cours');
      if (h4) h4.insertAdjacentHTML('beforebegin', html); else body.insertAdjacentHTML('afterbegin', html);
      body.querySelectorAll('[data-q-revoir]').forEach((b) => (b.onclick = () => { const i = +b.dataset.qRevoir; ui.close(); setTimeout(() => nonos.revoir(i), 60); }));
    } catch (e) { console.error(e); }
  };
}
