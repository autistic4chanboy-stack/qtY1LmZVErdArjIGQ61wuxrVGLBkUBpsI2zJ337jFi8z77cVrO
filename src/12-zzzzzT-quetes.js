// ============================================================================
//  LES QUÊTES PRINCIPALES À LIEUX PRÉCIS (agent T) : le carnet (sacoche).
//  - Onglet Carnet : « Quêtes principales », juste après le nonos du chien
//    (agent Q) ou en tête des quêtes : celles qu'on vous a proposées (s'en
//    occuper, jamais), celles en cours (le lieu de l'étape, nommé ; une phrase ;
//    l'heure s'il en faut une ; « Revoir » chaque lieu déjà montré ;
//    abandonner), les abandonnées (reprendre), les achevées (leur fin), celles
//    qu'on a refusées ou qui sont perdues.
//  - Onglet Lettres : la lettre de Marie Lemarié se lit avec ses trois choix.
//  - Onglet Sacoche : la lettre de Léonie et le registre de Ménard se relisent
//    d'un clic.
// ============================================================================
function qtCarnetStyle() {
  if (typeof document === 'undefined' || document.getElementById('t-carnet-css')) return;
  const st = document.createElement('style');
  st.id = 't-carnet-css';
  st.textContent = `#satchel .t-quetes .q{margin-bottom:8px}
#satchel .t-quetes .q i.qui{font-style:normal;color:#7a6a52;font-size:13px}
#satchel .t-quetes .tl{margin-top:3px;color:#4a3a26}
#satchel .t-quetes .tl b{font-weight:normal;color:#6a4a26}
#satchel .t-quetes .ph{font-style:italic;color:#5a4a36}
#satchel .t-quetes .et{display:flex;align-items:baseline;gap:8px;margin-top:2px;font-size:13px;color:#7a6a52}
#satchel .t-quetes .et span{flex:1}
#satchel .t-quetes .bt{display:flex;gap:6px;flex-wrap:wrap;margin-top:4px}
#satchel .t-quetes button{flex:none;padding:2px 9px;font-size:12px;background:rgba(122,74,26,.14);border:1px solid rgba(122,74,26,.4);border-radius:3px;color:#5a3a1a;cursor:pointer}
#satchel .t-quetes button:hover{background:rgba(255,240,200,.75)}
#satchel .t-quetes h5{margin:8px 0 3px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#8a7a5e;font-weight:normal}`;
  document.head.appendChild(st);
}
function qtCarnetHTML() {
  const S = quetes.S();
  if (!S) return '';
  const C = QT_CARNET, groupes = { propose: [], actif: [], abandon: [], fini: [], autre: [] };
  for (const id of QT_ORDRE) {
    const q = S.Q[id], D = QT_QUETES[id];
    if (!q.st) continue;
    const tete = `<b>${esc(D.titre)}</b> <i class="qui">— ${esc(D.quiNom)}</i>`;
    const revoir = (max) => { let h = ''; for (let i = 0; i <= max; i++) h += `<div class="et"><span>${esc(D.etapes[i].nom)}</span><button data-tq-revoir="${id}:${i + 1}">${esc(C.revoir)}</button></div>`; return h; };
    if (q.st === 'propose') groupes.propose.push(`<div class="q actif">${tete}<div class="ph">${esc(D.propose.resume)}</div><div class="bt"><button data-tq-oui="${id}">${esc(C.accepter)}</button><button data-tq-non="${id}">${esc(C.jamais)}</button></div></div>`);
    else if (q.st === 'actif') {
      const E = D.etapes[q.e], quand = E.quand === 'nuit' ? ' ' + C.nuit : E.quand === 'aube' ? ' ' + C.aube : '';
      groupes.actif.push(`<div class="q actif">${tete}<div class="tl">${esc(C.lieu)} (${q.e + 1}/${D.etapes.length}) : <b>${esc(E.nom)}</b>.</div><div class="ph">${esc(E.carnet + quand)}</div>${revoir(q.e)}<div class="bt"><button data-tq-ab="${id}">${esc(C.abandonner)}</button></div></div>`);
    } else if (q.st === 'abandon') groupes.abandon.push(`<div class="q">${tete}<div class="ph">${esc(C.abandonnee)} ${esc(C.lieu)} : ${esc(D.etapes[q.e].nom)}.</div><div class="bt"><button data-tq-rep="${id}">${esc(C.reprendre)}</button></div></div>`);
    else if (q.st === 'fini') { const F = D.fin.choix.find((c) => c.k === q.fin); groupes.fini.push(`<div class="q fait">${tete}<div class="ph">${esc(F ? F.carnet : '')}</div>${revoir(D.etapes.length - 1)}</div>`); }
    else if (q.st === 'jamais') groupes.autre.push(`<div class="q">${tete}<div class="ph">${esc(C.refusee)}</div></div>`);
    else if (q.st === 'perdue') groupes.autre.push(`<div class="q">${tete}<div class="ph">${esc(C.perdue)}</div></div>`);
  }
  const blocs = [[C.proposees, groupes.propose], [C.enCours, groupes.actif], [C.abandonnees, groupes.abandon], [C.finies, groupes.fini], [C.laissees, groupes.autre]].filter(([, L]) => L.length);
  if (!blocs.length) return '';
  return `<h4>${esc(C.section)}</h4><div class="t-quetes">${blocs.map(([t, L]) => `<h5>${esc(t)}</h5>${L.join('')}`).join('')}</div>`;
}
{
  const _rs = ui.renderSatchel.bind(ui);
  ui.renderSatchel = function () {
    _rs();
    try {
      if (!farm.s || typeof document === 'undefined') return;
      const body = document.querySelector('#satchel .body');
      if (!body) return;
      // le carnet : la rubrique des quêtes principales
      if (this.satTab === 'carnet' && !body.querySelector('.t-quetes')) {
        const html = qtCarnetHTML();
        if (html) {
          qtCarnetStyle();
          const nonos = body.querySelector('.q-nonos');
          const h4 = [...body.querySelectorAll(':scope > h4')].find((x) => x.textContent.trim() === 'En cours');
          if (nonos) nonos.insertAdjacentHTML('afterend', html);
          else if (h4) h4.insertAdjacentHTML('beforebegin', html);
          else body.insertAdjacentHTML('afterbegin', html);
          const re = () => { if (ui.panel === '#satchel') ui.renderSatchel(); };
          body.querySelectorAll('[data-tq-oui]').forEach((b) => (b.onclick = () => { const id = b.dataset.tqOui; ui.close(); quetes.accepter(id); }));
          body.querySelectorAll('[data-tq-non]').forEach((b) => (b.onclick = () => { quetes.jamais(b.dataset.tqNon); re(); }));
          body.querySelectorAll('[data-tq-rep]').forEach((b) => (b.onclick = () => { const id = b.dataset.tqRep; ui.close(); quetes.reprendre(id); }));
          body.querySelectorAll('[data-tq-ab]').forEach((b) => (b.onclick = () => {
            const id = b.dataset.tqAb;
            ui.choice(QT_QUETES[id].titre, QT_CARNET.confirme, [
              { label: QT_CARNET.abandonner, fn: () => { quetes.abandonner(id); ui.openSatchel('carnet'); } },
              { label: 'Non', fn: () => ui.openSatchel('carnet') },
            ]);
          }));
          body.querySelectorAll('[data-tq-revoir]').forEach((b) => (b.onclick = () => { const [id, i] = b.dataset.tqRevoir.split(':'); ui.close(); setTimeout(() => quetes.revoir(id, +i), 60); }));
        }
      }
      // les lettres : celle de Marie Lemarié, avec ses trois choix tant qu'on n'a rien décidé
      if (this.satTab === 'lettres') {
        const s = farm.s;
        body.querySelectorAll('[data-mail]').forEach((b) => {
          const m = s.mail[+b.dataset.mail];
          if (!m || m.tq !== 't2' || m.tqFin) return;
          b.onclick = () => {
            m.read = true;
            ui.read(m.title, m.text, m.from);
            const q = quetes.q('t2');
            if (q && (q.st === '' || q.st === 'propose')) qtBoutons('t2', QT_QUETES.t2.propose);
          };
        });
      }
      // la sacoche : ce qui se relit d'un clic
      if (this.satTab === 'sac') {
        body.querySelectorAll('[data-it]').forEach((b) => {
          const id = b.dataset.it;
          if (id === 't_lettre_leonie' || id === 't_registre_menard') b.onclick = () => { play.select(id); quetes.relire(id); };
        });
      }
    } catch (e) { console.error(e); }
  };
}
