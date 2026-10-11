// ============================================================================
//  LES RÉCITS DES PROCHES (agent K18) — 4. LE CARNET
//  - Carnet → « Quêtes » : en tête, les récits commencés (le chapitre en cours
//    et ce qu'il demande, ou leur fin), comme des quêtes.
//  - Carnet → « Proches » : ceux qu'on connaît un peu : ce qu'on est pour eux,
//    un portrait qui s'étoffe avec l'amitié et la fin de leur récit, le dernier
//    souvenir partagé, leurs récits, et leurs scènes à revoir.
// ============================================================================
{
  const st = document.createElement('style');
  st.id = 'k18-css';
  st.textContent = `#satchel .k18 .k18-ch{font-size:11.5px;letter-spacing:.08em;color:#8a6a3a;margin:1px 0 2px}
#satchel .k18-proches .k18-p{padding:8px 2px 10px;border-bottom:1px solid rgba(90,70,40,.16)}
#satchel .k18-proches .k18-p.mort{opacity:.62}
#satchel .k18-proches .k18-t{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px}
#satchel .k18-proches .k18-t i{color:#7a6a50;font-size:13px}
#satchel .k18-proches .k18-niv{margin-left:auto;font-size:12px;color:#8a5a2a}
#satchel .k18-proches .k18-barre{height:3px;margin:4px 0 6px;background:rgba(122,74,26,.14);border-radius:2px;overflow:hidden}
#satchel .k18-proches .k18-barre div{height:100%;background:#a8703a}
#satchel .k18-proches p{margin:3px 0;color:#4a3a26;font-size:13.5px;line-height:1.45}
#satchel .k18-proches .k18-s{font-size:12.5px;color:#7a6a50;font-style:italic}
#satchel .k18-proches .k18-a{font-size:12.5px;color:#5a4a30;margin-top:3px}
#satchel .k18-proches .k18-rv{margin:4px 6px 0 0;padding:1px 9px;background:rgba(122,74,26,.12);border:1px solid rgba(122,74,26,.4);border-radius:10px;color:#5a3a1a;font-size:12px;cursor:pointer}
#satchel .k18-proches .k18-rv:hover{background:rgba(255,240,200,.75)}`;
  document.head.appendChild(st);
}

const K18_ROMAINS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const k18Carnet = {
  nom(id) { const n = npcs.byId[id]; return n ? n.name : id; },
  // une ligne de récit, pour la page des quêtes
  ligne(D) {
    const A = k18.S().A[D.id], n = npcs.byId[D.npc];
    if (!A || !k18.commence(D.id) || A.fin === 'avant') return null;
    const faites = D.etapes.filter((E) => A.d[E.id] > 0).length;
    const tete = `<b>${esc(D.titre)}</b> <span>— ${esc(this.nom(D.npc))}</span>`;
    if (A.fin === 'deuil' || A.fin === 'parti') {
      const f = n && n.d.gender === 'f';
      const t = A.fin === 'parti' ? `— ne pourra plus se poursuivre : ${this.nom(D.npc)} a été emmené${f ? 'e' : ''} à la préfecture.` : `† — ${this.nom(D.npc)} n’est plus. Le récit s’arrête au chapitre ${K18_ROMAINS[Math.min(11, faites)] || faites + 1}.`;
      return { st: 'perdu', html: `<div class="q k18 perdu">${tete}<div>${esc(t)}</div></div>` };
    }
    if (A.fin) {
      const F = D.fins[A.fin] || {};
      return { st: 'fait', html: `<div class="q k18 fait">${tete}<div class="k18-ch">${esc(K18_TEXTES.fini + ' — ' + (F.titre || ''))}</div><div>${esc(k18.f(F.resume || '', n))}</div></div>` };
    }
    const E = D.etapes[A.e], ouverte = !!k18.courante(D);
    let indice = K18_TEXTES.attente;
    if (k18.voyage(D.npc)) indice = k18.f(this.nom(D.npc) + ' est ' + K18_TEXTES.enRoute.replace('{e}', n && n.d.gender === 'f' ? 'e' : '') + '.', n);
    else if (ouverte && E) indice = k18.f(E.carnet || E.titre, n);
    const ch = E ? `${K18_TEXTES.chapitre} ${K18_ROMAINS[Math.min(11, faites)] || faites + 1}${ouverte ? ' · ' + E.titre : ''}` : '';
    return { st: 'actif', html: `<div class="q k18 actif">${tete}<div class="k18-ch">${esc(ch)}</div><div>${esc(indice)}</div></div>` };
  },
  // la page des quêtes : les récits en tête de « En cours » et d'« Accompli »
  quetes(body) {
    const act = [], fait = [];
    for (const D of K18_ARCS.slice().sort((a, b) => (a.ordre || 0) - (b.ordre || 0))) {
      const L = this.ligne(D);
      if (!L) continue;
      (L.st === 'actif' ? act : fait).push(L.html);
    }
    if (!act.length && !fait.length) return;
    const box = document.createElement('div');
    box.className = 'k18-recits';
    box.innerHTML = `<h4>${esc(K18_TEXTES.recits)}</h4>` + act.join('') + fait.join('');
    body.insertBefore(box, body.firstChild);
  },
  // la page des proches
  proches() {
    const L = k18.proches();
    if (!L.length) return `<p class="hint m15-vide">${esc(K18_TEXTES.aucun)}</p>`;
    const parts = ['<div class="k18-proches">'];
    for (const { n, lvl, arcs } of L) {
      const vivant = n.st.alive, f = n.d.gender === 'f';
      const etat = !vivant ? (n.st.gone === 'prison' ? k18.f(K18_TEXTES.parti.replace('{e}', f ? 'e' : ''), n) : K18_TEXTES.deuil) : k18.voyage(n.id) ? K18_TEXTES.enRoute.replace('{e}', f ? 'e' : '') : k18.niveauNom(lvl);
      parts.push(`<div class="k18-p${vivant ? '' : ' mort'}"><div class="k18-t"><b>${esc(n.name + ' ' + n.d.surname)}</b><i>${esc(n.d.role.toLowerCase())}</i><span class="k18-niv">${esc(etat)}</span></div>`);
      if (vivant) parts.push(`<div class="k18-barre"><div style="width:${Math.round(clamp((n.st.amitie || 0) / 1000, 0, 1) * 100)}%"></div></div>`);
      for (const t of k18.portrait(n)) parts.push(`<p>${esc(t)}</p>`);
      const sv = k18.dernierSouvenir(n);
      if (sv) parts.push(`<p class="k18-s">${esc(K18_TEXTES.souvenir + ', ' + sv)}</p>`);
      for (const D of arcs) {
        const A = k18.S().A[D.id];
        const faites = D.etapes.filter((E) => A.d[E.id] > 0).length;
        const ou = A.fin ? (D.fins[A.fin] ? K18_TEXTES.fini + ' — ' + D.fins[A.fin].titre : K18_TEXTES.fini) : K18_TEXTES.chapitre + ' ' + (K18_ROMAINS[Math.min(11, faites)] || faites + 1);
        parts.push(`<div class="k18-a">${esc(K18_TEXTES.recit + ' : « ' + D.titre + ' » · ' + ou)}</div>`);
        const vus = Object.keys(A.vus || {}).filter((k) => D.scenes && D.scenes[k]);
        if (vus.length) parts.push('<div>' + vus.map((k) => `<button class="k18-rv" data-k18r="${esc(k)}">${esc(K18_TEXTES.revoir + ' : ' + D.scenes[k].titre)}</button>`).join('') + '</div>');
      }
      parts.push('</div>');
    }
    parts.push('</div>');
    return parts.join('');
  },
  brancher(body) {
    body.querySelectorAll('[data-k18r]').forEach((b) => (b.onclick = () => { const k = b.dataset.k18r; ui.close(true); setTimeout(() => k18.rejouer(k), 60); }));
  },
};
menus.page({ id: 'proches', onglet: 'carnet', titre: K18_TEXTES.proches, ordre: 12, visible: () => !!farm.s, rendre: () => k18Carnet.proches(), apres: (body) => k18Carnet.brancher(body) });
{
  const _rs = ui.renderSatchel.bind(ui);
  ui.renderSatchel = function () {
    _rs();
    try {
      if (this.satTab !== 'carnet' || !farm.s || typeof document === 'undefined') return;
      const body = document.querySelector('#satchel > .body');
      if (body && !body.querySelector('.k18-recits')) k18Carnet.quetes(body);
    } catch (e) { console.error('récits : carnet', e); }
  };
}
