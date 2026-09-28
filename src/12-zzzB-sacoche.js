// ============================================================================
//  SACOCHE (livres, cartes, langues) :
//  - un livre ou une carte cliqué dans la sacoche se lit ou se déplie aussitôt
//    (et passe en main) ;
//  - le carnet mentionne les emprunts de la grande bibliothèque (et la traque) ;
//  - un onglet « Langues » : les mots connus de l'aëlin et du gorrain, avec leur
//    graphie, et les inscriptions relevées.
// ============================================================================
{
  const _rs = ui.renderSatchel.bind(ui);
  ui.renderSatchel = function () {
    _rs();
    try {
      const tabs = $('#satchel .tabs');
      if (!tabs) return;
      // l'onglet « Langues »
      if (!tabs.querySelector('[data-tab="langues"]')) {
        const b = document.createElement('button');
        b.dataset.tab = 'langues'; b.textContent = 'Langues';
        const x = tabs.querySelector('.x');
        tabs.insertBefore(b, x || null);
      }
      const bl = tabs.querySelector('[data-tab="langues"]');
      bl.classList.toggle('on', this.satTab === 'langues');
      bl.onclick = () => { this.satTab = 'langues'; this.renderSatchel(); sound.page && sound.page(); };
      if (this.satTab === 'langues') {
        tabs.querySelectorAll('[data-tab]').forEach((q) => { if (q !== bl) q.classList.remove('on'); });
        const body = $('#satchel .body');
        if (body) { langues.style(); body.innerHTML = langues.ongletHTML(); langues.lierOnglet(); }
        return;
      }
      // sacoche : livres et cartes s'ouvrent d'un clic
      if (this.satTab === 'sac') {
        $$('#satchel [data-it]').forEach((b) => {
          const id = b.dataset.it, it = ITEMS[id];
          if (!it) return;
          if (it.book) b.onclick = () => { play.select(id); livres.ouvrir(it.book); };
          else if (it.use === 'region') b.onclick = () => { play.select(id); cartes.ouvrir(it.region || 'centre'); };
          else if (it.use === 'tresor') b.onclick = () => { play.select(id); cartes.tresor(); };
        });
      }
      // carnet : les emprunts en cours
      if (this.satTab === 'carnet' && farm.s) {
        const L = biblio.lignesCarnet();
        const h = $('#satchel .body h4');
        if (L.length && h) {
          h.insertAdjacentHTML('afterend', L.join(''));
          const vide = h.parentNode.querySelector(':scope > p.hint');
          if (vide && vide.previousElementSibling && vide.previousElementSibling.classList.contains('q') && /Rien pour l’instant/.test(vide.textContent)) vide.remove();
        }
      }
    } catch (e) { console.error(e); }
  };
}
