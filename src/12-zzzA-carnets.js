// ============================================================================
//  SACOCHE (agent A) : l'onglet « Fabrication » devient l'établi d'assemblage
//  (11-zzz03-fabrication.js) ; l'onglet « Grimoire » devient le carnet
//  d'alchimie : plantes nommées, potions (leurs effets, une fois bues), essais
//  à la table d'alchimiste (11-zzz02-alchimie.js).
// ============================================================================
ui.grimoireBody = function () { alchimie.css(); return alchimie.carnetHTML(); };
{
  const _render = ui.renderSatchel.bind(ui);
  ui.renderSatchel = function () {
    _render();
    if (this.satTab !== 'fab') return;
    const body = $('#satchel .body');
    if (body) fabrication.rendre(body);
  };
}
