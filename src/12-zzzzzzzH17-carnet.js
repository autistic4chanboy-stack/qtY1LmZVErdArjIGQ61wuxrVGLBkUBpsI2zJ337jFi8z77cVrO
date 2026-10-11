// ============================================================================
//  L'HISTOIRE (agent H17) — 4. LE CARNET ET LES SOUVENIRS
//  - Menu (Tab) → Carnet → « Histoire » : le chapitre en cours et ce qui reste
//    à faire, les chapitres passés (une phrase chacun, et « Revoir » leur
//    scène), la fin.
//  - Carnet → « Souvenirs » : les scènes déjà vues (de cette vie et des
//    autres), à revoir. Aussi depuis les Options (section Jeu).
// ============================================================================
{
  const st = document.createElement('style');
  st.id = 'h17-carnet-css';
  st.textContent = `#satchel .h17 h4{margin:14px 0 6px}
#satchel .h17 h4:first-child{margin-top:4px}
#satchel .h17 .h17-et{margin:3px 0 3px 4px;color:#4a3a26}
#satchel .h17 .h17-et.fait{color:#8a7a60;text-decoration:line-through}
#satchel .h17 .h17-et::before{content:'· ';color:#8a5a2a}
#satchel .h17 .h17-et.fait::before{content:'✓ ';text-decoration:none}
#satchel .h17 .q .h17-rv,#satchel .h17-souv .h17-rv{float:right;margin-left:8px;padding:1px 9px;background:rgba(122,74,26,.12);border:1px solid rgba(122,74,26,.4);border-radius:10px;color:#5a3a1a;font-size:12px;cursor:pointer}
#satchel .h17 .q .h17-rv:hover,#satchel .h17-souv .h17-rv:hover{background:rgba(255,240,200,.75)}
#satchel .h17-souv .s{display:flex;justify-content:space-between;align-items:center;padding:5px 2px;border-bottom:1px solid rgba(90,70,40,.14)}
#dlg-options .h17-opt button{padding:4px 12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.18);border-radius:3px;color:inherit;font:inherit;cursor:pointer}`;
  document.head.appendChild(st);
}

const histoireCarnet = {
  rendre() {
    const H = histoire.S();
    if (!H) return '';
    const parts = ['<div class="h17">'];
    const rv = (k) => (k && histoire.souvenirs().includes(k) ? `<button class="h17-rv" data-h17r="${k}">${esc(H17_TEXTES.revoir)}</button>` : '');
    if (H.fin) {
      const F = H17_FINS[H.fin];
      parts.push(`<h4>${esc(H17_TEXTES.fin + ' — ' + F.titre)}</h4><div class="q fait">${rv(F.cine)}<div>${esc(F.resume)}</div></div><p class="hint">${esc(H17_TEXTES.finie)}</p>`);
    } else {
      const C = histoire.chapitre();
      if (C) {
        parts.push(`<h4>${esc(H17_TEXTES.chapitre + ' ' + C.num + ' — ' + C.titre)}</h4>`);
        if (!histoire.ouvert(C.id)) parts.push(`<p class="hint">${esc(H17_TEXTES.attente)}</p>`);
        else for (const E of C.etapes) parts.push(`<div class="h17-et${histoire.faite(C.id, E.id) ? ' fait' : ''}">${esc(E.texte)}</div>`);
      }
    }
    const passes = H17_CHAPITRES.filter((C) => H.fini[C.id]);
    const restes = H.fin ? H17_CHAPITRES.filter((C) => !H.fini[C.id] && H.ouv[C.id]) : [];
    if (passes.length || restes.length) {
      parts.push(`<h4>${esc(H17_TEXTES.passes)}</h4>`);
      for (const C of passes.slice().reverse()) parts.push(`<div class="q fait">${rv(C.cine)}<b>${esc(H17_TEXTES.chapitre + ' ' + C.num + ' — ' + C.titre)}</b><div>${esc(C.resume)}</div></div>`);
      for (const C of restes) parts.push(`<div class="q perdu"><b>${esc(H17_TEXTES.chapitre + ' ' + C.num + ' — ' + C.titre)}</b><div>${esc(H17_TEXTES.sansRegard)}</div></div>`);
    }
    parts.push('</div>');
    return parts.join('');
  },
  souvenirs() {
    const L = histoire.souvenirs();
    if (!L.length) return `<p class="hint m15-vide">${esc(H17_TEXTES.aucun)}</p>`;
    return '<div class="h17-souv">' + L.map((k) => `<div class="s"><span>${esc((H17_CINES[k] && H17_CINES[k].titre) || k)}</span><button class="h17-rv" data-h17r="${k}">${esc(H17_TEXTES.revoir)}</button></div>`).join('') + '</div>';
  },
  brancher(body) {
    body.querySelectorAll('[data-h17r]').forEach((b) => (b.onclick = () => { const k = b.dataset.h17r; ui.close(true); setTimeout(() => histoire.rejouer(k), 60); }));
  },
};
menus.page({ id: 'histoire', onglet: 'carnet', titre: H17_TEXTES.page, ordre: 5, visible: () => !!farm.s, rendre: () => histoireCarnet.rendre(), apres: (body) => histoireCarnet.brancher(body) });
menus.page({ id: 'souvenirs', onglet: 'carnet', titre: H17_TEXTES.souvenirs, ordre: 95, visible: () => !!farm.s && histoire.souvenirs().length > 0, rendre: () => histoireCarnet.souvenirs(), apres: (body) => histoireCarnet.brancher(body) });

// ---------------------------------------------------------------- les Options : « Revoir les cinématiques »
{
  const _init = ui.init.bind(ui);
  ui.init = function () {
    const r = _init();
    try {
      const cols = $('#dlg-options .cols');
      if (cols && !$('#o-souvenirs')) {
        const l = document.createElement('label');
        l.className = 'row h17-opt';
        l.innerHTML = `<button type="button" id="o-souvenirs">${esc(H17_TEXTES.optionsSouvenirs)}</button>`;
        cols.appendChild(l);
        $('#o-souvenirs').onclick = (e) => {
          e.preventDefault();
          if (!farm.s || game.kind !== 'farm' || !game.started) return;
          ui.closeDialogs();
          if (game.mode === 'menu') game.enter(game.prevMode && game.prevMode !== 'menu' ? game.prevMode : 'play');
          setTimeout(() => menus.ouvrir('souvenirs'), 30);
        };
      }
    } catch (e) { console.error('histoire : options', e); }
    return r;
  };
}
