// ============================================================================
//  LES SCÈNES DES QUÊTES (agent Q20A) — 2. LES SOUVENIRS ET L'OPTION
//  - Carnet → « Souvenirs » : après les scènes de l'histoire, celles des
//    quêtes, rangées par habitant (son nom, puis chaque quête et ses moments :
//    la demande, le tournant, le dénouement), chacune avec « Revoir ».
//  - Options › Jeu : « Scènes des quêtes » : Toutes, Courtes, Aucune.
// ============================================================================
{
  const st = document.createElement('style');
  st.id = 'q20-css';
  st.textContent = `#satchel .q20-souv h4{margin:16px 0 4px;font-size:14px;color:#5a3a1a}
#satchel .q20-souv .q20-qui{margin:10px 0 2px;font-weight:bold;color:#4a3a26}
#satchel .q20-souv .q20-q{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:4px 2px 4px 10px;border-bottom:1px solid rgba(90,70,40,.12)}
#satchel .q20-souv .q20-q span{flex:1}
#satchel .q20-souv .q20-m{display:flex;flex-wrap:wrap;gap:4px;justify-content:flex-end}
#satchel .q20-souv .h17-rv{float:none;margin:0;padding:1px 9px;background:rgba(122,74,26,.12);border:1px solid rgba(122,74,26,.4);border-radius:10px;color:#5a3a1a;font-size:12px;cursor:pointer}
#satchel .q20-souv .h17-rv:hover{background:rgba(255,240,200,.75)}`;
  document.head.appendChild(st);
}

const q20Carnet = {
  // les souvenirs des quêtes, rangés par habitant (dans l'ordre des habitants, puis des quêtes)
  rendre() {
    const L = q20.souvenirs();
    if (!L.length) return '';
    const parQui = new Map();
    for (const s of L) { const k = s.qui || '?'; if (!parQui.has(k)) parQui.set(k, new Map()); const M = parQui.get(k); if (!M.has(s.id)) M.set(s.id, []); M.get(s.id).push(s); }
    const rang = (k) => { const i = NPC_DATA.findIndex((d) => d.id === k); return i < 0 ? 1000 : i; };
    const quis = [...parQui.keys()].sort((a, b) => rang(a) - rang(b));
    const parts = ['<div class="q20-souv">', `<h4>${esc(Q20_TEXTES.section)}</h4>`];
    for (const qui of quis) {
      parts.push(`<div class="q20-qui">${esc(q20.nomDe(qui))}</div>`);
      for (const [id, ms] of parQui.get(qui)) {
        const fins = ms.filter((s) => s.m.startsWith('fin')).length;
        const btn = ms.map((s, i) => {
          let lib = q20.libelle(s.m);
          if (fins > 1 && s.m.startsWith('fin:')) lib += ' (' + (ms.filter((x) => x.m.startsWith('fin')).indexOf(s) + 1) + ')';
          return `<button class="h17-rv" data-q20r="${esc(s.id)}" data-q20m="${esc(s.m)}" title="${esc(Q20_TEXTES.revoir)}">${esc(lib)}</button>`;
        }).join('');
        parts.push(`<div class="q20-q"><span>« ${esc(q20.titreDe(id))} »</span><div class="q20-m">${btn}</div></div>`);
      }
    }
    parts.push('</div>');
    return parts.join('');
  },
  brancher(body) {
    body.querySelectorAll('[data-q20r]').forEach((b) => (b.onclick = () => { const id = b.dataset.q20r, m = b.dataset.q20m; ui.close(true); setTimeout(() => q20.rejouer(id, m), 60); }));
  },
};

// ---------------------------------------------------------------- la page « Souvenirs » : l'histoire, puis les quêtes
{
  const P = menus.pages.souvenirs || {};
  const vis0 = P.visible, rendre0 = P.rendre, apres0 = P.apres;
  const histVis = () => { try { return vis0 ? !!vis0() : false; } catch (e) { return false; } };
  menus.page({
    id: 'souvenirs', onglet: 'carnet', titre: P.titre || 'Souvenirs', ordre: P.ordre ?? 95,
    visible: () => !!farm.s && (histVis() || q20.souvenirs().length > 0),
    rendre: (body) => {
      let h = '';
      if (histVis() && rendre0) { const r = rendre0(body); if (typeof r === 'string') h += r; }
      return h + q20Carnet.rendre();
    },
    apres: (body) => { if (apres0) apres0(body); q20Carnet.brancher(body); },
  });
}

// ---------------------------------------------------------------- les Options : « Scènes des quêtes » (section Jeu)
{
  const _init = ui.init.bind(ui);
  ui.init = function () {
    const r = _init();
    try {
      const cols = $('#dlg-options .cols');
      if (cols && !$('#o-quetescine')) {
        const l = document.createElement('label');
        l.className = 'row';
        const M = Q20_TEXTES.modes;
        l.innerHTML = `${esc(Q20_TEXTES.option)} <select id="o-quetescine"><option value="toutes">${esc(M.toutes)}</option><option value="courtes">${esc(M.courtes)}</option><option value="aucune">${esc(M.aucune)}</option></select>`;
        cols.appendChild(l);
        const s = $('#o-quetescine');
        s.value = q20.mode();
        s.onchange = () => { q20.reglerMode(s.value); sound.click && sound.click(); };
        // (l'option rendue à chaque ouverture des Options)
        const dlg = $('#dlg-options');
        if (dlg && typeof MutationObserver === 'function') new MutationObserver(() => { const e = $('#o-quetescine'); if (e && e.value !== q20.mode()) e.value = q20.mode(); }).observe(dlg, { attributes: true, attributeFilter: ['class', 'open', 'style'] });
      }
    } catch (e) { console.error('q20 : options', e); }
    return r;
  };
}
