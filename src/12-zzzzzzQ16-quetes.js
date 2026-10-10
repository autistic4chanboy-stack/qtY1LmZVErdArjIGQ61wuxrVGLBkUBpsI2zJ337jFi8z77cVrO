// ============================================================================
//  DES QUÊTES POUR TOUT LE MONDE (Q16) : les panneaux et le carnet.
//  - ui.choice : pendant qu'un des autres parle (q16.avec), ses lignes de
//    quête se glissent avant la dernière (« Partir »).
//  - Le carnet (onglet Carnet de la sacoche) : les quêtes des autres, avec
//    celles des habitants, dans « En cours » et « Accompli » ; les sortes en
//    plus des habitants ('aller', 'chasse') y ont leur phrase.
// ============================================================================
{
  const _ch = ui.choice.bind(ui);
  ui.choice = function (title, desc, opts) {
    if (typeof q16 !== 'undefined' && (q16.ctx || q16.ctxA)) {
      try { opts = q16.injecter(title, opts); } catch (e) { console.error(e); }
    }
    return _ch(title, desc, opts);
  };
  const _qh = ui.questHint.bind(ui);
  ui.questHint = function (q, Q, nm) {
    if (q && Q && Q.st === 'actif' && (q.type === 'aller' || q.type === 'chasse')) { const g = q16.giverHab(q.id); if (g) return q16.hint(q, Q, g); }
    return _qh(q, Q, nm);
  };
  const _rs = ui.renderSatchel.bind(ui);
  ui.renderSatchel = function () {
    _rs();
    try {
      if (this.satTab !== 'carnet' || !farm.s || typeof document === 'undefined') return;
      const body = document.querySelector('#satchel .body');
      if (!body || body.querySelector('.q16')) return;
      const S = q16.S(), act = [], fait = [];
      for (const id in S.Q) {
        const Q = S.Q[id], q = q16.def(id), key = q16.qui(id);
        if (!q || !key || (Q.st !== 'actif' && Q.st !== 'fait')) continue;
        const P = q16.P(key), nm = q16.nomDe(key);
        const qui = P && P.ou && P.ou !== nm ? nm + ', ' + P.ou : nm;
        const perdu = Q.st === 'actif' && (!q16.vivant(key) || q16.impossible(q, Q));
        const html = `<div class="q q16 ${perdu ? 'perdu' : Q.st}"><b>${esc(q.title)}</b> <span>— ${esc(qui)}</span><div>${esc(q16.hint(q, Q, key))}</div></div>`;
        (Q.st === 'fait' ? fait : act).push(html);
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
    } catch (e) { console.error(e); }
  };
}
// le donneur d'une quête d'habitant (pour le carnet)
q16.giverHab = function (id) { for (const d of NPC_DATA) for (const q of d.quests || []) if (q.id === id) return d.id; return null; };
