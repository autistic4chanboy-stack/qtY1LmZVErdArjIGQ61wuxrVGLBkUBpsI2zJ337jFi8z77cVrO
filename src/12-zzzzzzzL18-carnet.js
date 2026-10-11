// ============================================================================
//  LE GRAND HÔTEL DES CIMES (agent L18) — 6. LE CARNET ET LE WIKI
//  - Menu (Tab) → Carnet → « Le Grand Hôtel » : le rang et la réputation, le
//    service du jour, les commissions en cours (et leur échéance), les histoires
//    (l'étape en cours, celles d'avant, la fin), les gens de l'hôtel (ce qu'on
//    est l'un pour l'autre), les scènes vues (« Revoir »).
//  - Carnet → « Quêtes » : les histoires de l'hôtel parmi les autres quêtes
//    (« En cours », « Accompli »), comme celles des habitants.
//  - Le wiki (D15) : une fiche pour chacun des gens de l'hôtel (métier, demeure,
//    caractère : appris en leur parlant, chez eux, en devenant proches) et une
//    pour l'hôtel lui-même (sys:l18_hotel).
// ============================================================================
{
  const st = document.createElement('style');
  st.id = 'l18-carnet-css';
  st.textContent = `#satchel .l18 h4{margin:14px 0 6px}#satchel .l18 h4:first-child{margin-top:4px}
#satchel .l18 .l18-rep{height:6px;background:rgba(90,70,40,.18);border-radius:3px;margin:4px 0 8px;overflow:hidden}
#satchel .l18 .l18-rep i{display:block;height:100%;background:#a8803a}
#satchel .l18 .l18-et{margin:3px 0 3px 4px;color:#4a3a26}
#satchel .l18 .l18-et.fait{color:#8a7a60;text-decoration:line-through}
#satchel .l18 .l18-et::before{content:'· ';color:#8a5a2a}
#satchel .l18 .l18-et.fait::before{content:'✓ ';text-decoration:none}
#satchel .l18 .l18-g{display:flex;justify-content:space-between;padding:3px 2px;border-bottom:1px solid rgba(90,70,40,.12)}
#satchel .l18 .l18-g span{color:#8a7a60;font-style:italic}
#satchel .l18 .l18-rv{float:right;margin-left:8px;padding:1px 9px;background:rgba(122,74,26,.12);border:1px solid rgba(122,74,26,.4);border-radius:10px;color:#5a3a1a;font-size:12px;cursor:pointer}
#satchel .l18 .l18-rv:hover{background:rgba(255,240,200,.75)}`;
  document.head.appendChild(st);
}

const hotelCarnet = {
  amitie(n) { return n >= 70 ? 'un ami' : n >= 40 ? 'de la confiance' : n >= 15 ? 'de la sympathie' : n > 0 ? 'on se salue' : '—'; },
  // la phrase d'une commission, au carnet
  commission(c) {
    const nom = hotelService.nomClient(c.client), h = c.echeance ? ` (avant ${c.type === 'vallee' ? 'demain soir' : hotelService.hFmt((c.echeance - farm.s.hours) + hotel18.heure())})` : '';
    const quoi = {
      bagages: `Monter la valise de ${nom}, chambre ${c.ch}.`, lettre: `Porter le pli de ${nom}, chambre ${c.ch}.`,
      reserve: `Chercher ${hotelService.objetDe(c)} à la cave pour ${nom}, et le remettre à la loge.`, vallee: `Rapporter ${hotelService.article(c.objet)} de la vallée pour ${nom}, à la loge.`,
      voiture: `Faire atteler pour ${nom} : Baptiste, à la remise.`, perdu: `Retrouver ${c.objetNom} de ${nom}, ${c.ouNom}${c.trouve ? ' (trouvé : à la loge)' : ''}.`,
      dispute: 'Apaiser une querelle.', secret: `Le secret de ${nom}.`, diner: `Un dîner pour ${nom} : voir le chef.`,
    }[c.type] || '';
    return quoi + (c.type === 'secret' ? '' : h);
  },
  // les scènes d'une histoire (pour « Revoir »)
  CINES: { lucien: ['montre', 'comtesse_fin'], firmin: ['aile', 'firmin_depart', 'firmin_reste'], symphonie: ['concert'], treize: ['plateau', 'treize_porte', 'treize_fin'] },
  FINS: {
    lucien: { reste: 'La comtesse est restée au 108. Le soir, à la longue-vue, elle tient compagnie à son fils.', part: 'La comtesse est rentrée à Paris faire graver une date sur un caveau. Elle vous a remercié de ne pas lui avoir menti.' },
    firmin: { paris: 'Firmin est parti pour Paris, avec sa boîte et sa lettre. Il porte les valises des lords au Grand Hôtel du boulevard des Capucines.', reste: 'Firmin est resté : votre second, à la loge, une petite clef de laiton au revers.' },
    symphonie: { reste: 'La symphonie a été jouée tout entière, le quatrième mouvement aussi. M. Wolański est resté aux Cimes ; il le joue le soir, très bas.', vienne: 'La symphonie a été jouée, et le quatrième mouvement laissé au silence. M. Wolański est parti pour Vienne ; il reviendra le chercher.' },
    treize: { descendu: 'Étienne Rouvière est redescendu, au lever du jour, par le chemin des mulets. La treizième sonnette n’a plus de battant.', veille: 'Étienne Rouvière veille le col, à la fenêtre de la treize ; le chef monte deux plateaux, le soir.' },
  },
  rendre() {
    const S = hotel18.S(), V = hotel18.V();
    const P = ['<div class="l18">'];
    if (!S.embauche) {
      P.push(`<p class="hint">${esc(S.cines.arrivee ? L18_TEXTES.pasEmbauche : L18_TEXTES.aucun)}</p>`);
    } else {
      const R = hotel18.rang();
      P.push(`<h4>${esc(R.nom.charAt(0).toUpperCase() + R.nom.slice(1))}</h4><div class="l18-rep"><i style="width:${Math.round(S.rep)}%"></i></div>`);
      P.push(`<div class="hint">${S.stats.services} service${S.stats.services > 1 ? 's' : ''}, ${S.stats.faites} demande${S.stats.faites > 1 ? 's' : ''} satisfaite${S.stats.faites > 1 ? 's' : ''}, ${S.stats.pourboires + S.stats.gages} pièces gagnées à la loge.</div>`);
      const sv = S.service;
      if (sv && sv.jour === farm.s.day && !sv.fini) P.push(`<h4>${esc(L18_TEXTES.service)}</h4><div class="l18-et">Jusqu’à ${esc(hotelService.hFmt(sv.finH))}. ${S.demandes.filter((d) => d.etat === 'attend').length ? 'On vous attend à la loge.' : ''}</div>`);
      const C = S.commissions.filter((c) => c.etat === 'accepte');
      if (C.length) { P.push(`<h4>${esc(L18_TEXTES.commissions)}</h4>`); for (const c of C) P.push(`<div class="l18-et">${esc(this.commission(c))}</div>`); }
    }
    // les histoires
    const ids = L18_ORDRE_ARCS.filter((id) => S.arcs[id]);
    if (ids.length) {
      P.push(`<h4>${esc(L18_TEXTES.histoires)}</h4>`);
      for (const id of ids) {
        const A = hotelHistoires.A(id), D = L18_ARCS[id];
        const rv = (this.CINES[id] || []).filter((k) => hotelScenes.souvenirs().includes(k)).map((k) => `<button class="l18-rv" data-l18r="${k}">${esc(L18_TEXTES.revoir)}</button>`).join('');
        P.push(`<div class="q ${A.fin ? 'fait' : 'actif'}">${rv}<b>${esc(D.titre)}</b> <span>— ${esc(L18_GENS[D.qui].court)}</span><div>${esc(A.fin ? (this.FINS[id] && this.FINS[id][A.fin]) || D.resume : D.resume)}</div>`);
        if (!A.fin) for (const E of D.etapes) { if (!A.faits[E.id] && E !== hotelHistoires.etape(id) && !(id === 'symphonie' && ['eau', 'cloches', 'vent', 'silence'].includes(E.id))) continue; P.push(`<div class="l18-et${A.faits[E.id] ? ' fait' : ''}">${esc(E.texte)}</div>`); }
        P.push('</div>');
      }
    }
    // les gens
    if (V && (S.embauche || S.cines.arrivee)) {
      const L = L18_ORDRE_GENS.filter((id) => S.parle[id]);
      if (L.length) { P.push('<h4>Les gens de l’hôtel</h4>'); for (const id of L) P.push(`<div class="l18-g"><b>${esc(L18_GENS[id].nom)}</b><span>${esc(this.amitie(hotel18.ami(id)))}</span></div>`); }
    }
    // les scènes vues
    const sv2 = hotelScenes.souvenirs();
    if (sv2.length) {
      P.push('<h4>Souvenirs de l’hôtel</h4>');
      for (const k of sv2) P.push(`<div class="l18-g"><b>${esc(L18_CINES[k].titre)}</b><button class="l18-rv" data-l18r="${k}">${esc(L18_TEXTES.revoir)}</button></div>`);
    }
    P.push('</div>');
    return P.join('');
  },
  brancher(body) { body.querySelectorAll('[data-l18r]').forEach((b) => (b.onclick = () => { const k = b.dataset.l18r; ui.close(true); setTimeout(() => hotelScenes.rejouer(k), 60); })); },
};
menus.page({ id: 'l18', onglet: 'carnet', titre: L18_TEXTES.page, ordre: 40, visible: () => !!farm.s && (hotel18.S().embauche !== null || !!hotel18.S().cines.arrivee), rendre: () => hotelCarnet.rendre(), apres: (body) => hotelCarnet.brancher(body) });

// ---------------------------------------------------------------- Carnet → Quêtes : les histoires de l'hôtel parmi les autres
{
  const _rs = ui.renderSatchel.bind(ui);
  ui.renderSatchel = function () {
    _rs();
    try {
      if (this.satTab !== 'carnet' || !farm.s || typeof document === 'undefined') return;
      const body = document.querySelector('#satchel .body');
      if (!body || body.querySelector('.l18q')) return;
      const S = hotel18.S(), act = [], fait = [];
      for (const id of L18_ORDRE_ARCS) {
        const A = S.arcs[id] && hotelHistoires.A(id);
        if (!A) continue;
        const D = L18_ARCS[id], E = hotelHistoires.etape(id);
        const txt = A.fin ? (hotelCarnet.FINS[id] && hotelCarnet.FINS[id][A.fin]) || D.resume : E ? E.texte : D.resume;
        const html = `<div class="q l18q ${A.fin ? 'fait' : 'actif'}"><b>${esc(D.titre)}</b> <span>— ${esc(L18_GENS[D.qui].court)}, au Grand Hôtel</span><div>${esc(txt)}</div></div>`;
        (A.fin ? fait : act).push(html);
      }
      if (!act.length && !fait.length) return;
      const h4s = [...body.querySelectorAll(':scope > h4')];
      const enCours = h4s.find((h) => h.textContent.trim() === 'En cours');
      let accompli = h4s.find((h) => h.textContent.trim() === 'Accompli');
      const gens = h4s.find((h) => /Gens rencontr/.test(h.textContent));
      if (act.length && enCours) {
        const vide = enCours.nextElementSibling;
        if (vide && vide.classList.contains('hint')) vide.remove();
        let apres = enCours;
        while (apres.nextElementSibling && apres.nextElementSibling.classList.contains('q')) apres = apres.nextElementSibling;
        apres.insertAdjacentHTML('afterend', act.join(''));
      }
      if (fait.length) {
        if (!accompli && gens) { gens.insertAdjacentHTML('beforebegin', '<h4>Accompli</h4>'); accompli = gens.previousElementSibling; }
        if (accompli) {
          let apres = accompli;
          while (apres.nextElementSibling && apres.nextElementSibling.classList.contains('q')) apres = apres.nextElementSibling;
          apres.insertAdjacentHTML('afterend', fait.join(''));
        }
      }
    } catch (e) { console.error('L18 carnet', e); }
  };
}

// ---------------------------------------------------------------- le wiki : les gens de l'hôtel, l'hôtel
try {
  if (typeof decouvertes !== 'undefined' && decouvertes.declarer) {
    for (const id of L18_ORDRE_GENS) {
      const G = L18_GENS[id];
      const ou = id === 'treize' ? 'la treize, dans l’aile Nord' : ['comtesse', 'wolanski'].includes(id) ? 'le Grand Hôtel des Cimes (chambre ' + (id === 'comtesse' ? '108' : '208') + ')' : 'le Grand Hôtel des Cimes';
      decouvertes.declarer('pnj:l18_' + id, {
        titre: G.nom, sous: G.role, icone: '☺', groupe: 'habitants', lead: G.bio,
        champs: [
          { k: 'metier', nom: 'Métier', val: G.role, test: (g) => d15Cite(g, [G.role]) },
          { k: 'demeure', nom: 'Où il vit', val: ou, test: (g) => d15Cite(g, ['hôtel', 'Cimes', ou]) },
          { k: 'caractere', nom: 'Son caractère', val: (G.traits || []).join(', '), test: (g) => d15Cite(g, G.traits || []) },
        ],
      });
    }
    decouvertes.declarer('sys:l18_hotel', {
      titre: 'Le Grand Hôtel des Cimes', sous: 'Palace des monts de l’Est', icone: '⌂', groupe: 'lieux',
      lead: 'Un palace de 1868 sur le replat des monts de l’Est, au-dessus du château : un funiculaire depuis la vallée, une salle de bal, une terrasse sur toute la vallée, une aile fermée depuis l’hiver 1871. On peut s’y faire engager comme concierge.',
      champs: [
        { k: 'acces', nom: 'Comment on y monte', val: 'le funiculaire (au bout de la route du château), le chemin des mulets, la voiture des Cimes (à la fourche au nord de Valbrume)', test: (g) => d15Cite(g, ['funiculaire', 'voiture', 'chemin']) },
        { k: 'metier', nom: 'Le métier de concierge', val: 'un service par jour à la loge (de 7 h à 19 h, cinq heures) : les clients demandent, on porte, on cherche, on arrange, on se tait ; des gages, des pourboires, une réputation', test: (g) => d15Cite(g, ['loge', 'service', 'pourboire', 'clients']) },
        { k: 'histoires', nom: 'Ses histoires', val: 'Lucien ; Firmin veut voir Paris ; la symphonie de la vallée ; la treize', test: (g) => d15Cite(g, ['Lucien', 'Firmin', 'symphonie', 'treize']) },
        { k: 'treize', nom: 'Ce qu’il n’y a pas', val: 'une chambre 13', test: (g) => /13|treize/i.test(g) },
      ],
    });
  }
} catch (e) { console.error('L18 wiki', e); }
// la fiche de l'hôtel s'apprend en y venant, en s'y faisant engager, en lisant le poteau ; « ce qu'il n'y a pas », au tableau des sonnettes
HOOKS.update.push(() => {
  const S = hotel18.S();
  if (!farm.s || hotelCarnet._vu === farm.s) return;
  if (S.cines.arrivee) { hotelCarnet._vu = farm.s; hotel18.voir('sys:l18_hotel', 'acces'); }
});
{
  const _s = hotelService.sonnettes.bind(hotelService);
  hotelService.sonnettes = function () { hotel18.voir('sys:l18_hotel', 'treize'); return _s(); };
}
// ---------------------------------------------------------------- la musique : dans l'hôtel, les airs de l'hôtel (le piano du salon)
if (typeof musique !== 'undefined' && musique.zone) {
  const _z = musique.zone.bind(musique);
  musique.zone = function () {
    const z = _z();
    try { if (z && z.g !== 'dessous' && !(typeof cine !== 'undefined' && cine.on) && hotel18.dedans()) return { g: 'hotel', cle: 'hotel' }; } catch (e) { /* */ }
    return z;
  };
}
