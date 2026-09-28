// ============================================================================
//  CORPS ET ESPRIT : quelques lignes vagues en tête du carnet (sacoche) — l'état
//  d'esprit, le chien, la boisson. Jamais de jauge ni de chiffre.
// ============================================================================
function carnetCorpsEsprit() {
  const s = farm.s;
  if (!s) return '';
  if (!document.getElementById('h-carnet-css')) {
    const st = document.createElement('style');
    st.id = 'h-carnet-css';
    st.textContent = `#satchel .h-carnet{margin:0 0 10px;padding:6px 10px;border-left:2px solid rgba(90,70,40,.35);font-style:italic;color:#5a4a36;font-size:14px;line-height:1.5}
#satchel .h-carnet p{margin:2px 0}`;
    document.head.appendChild(st);
  }
  const L = [esprit.ligneCarnet()];
  if (s.dog) {
    const C = s.chien, nom = s.dog.name || 'Le chien';
    if (!s.dog.alive) L.push(C && C.mort && C.mort.enterre === true ? `${nom} dort sous un petit tertre. La gamelle reste vide.` : `${nom} n’est plus là.`);
    else {
      const k = chien.stade();
      if (k >= 3) L.push(`${nom} ne se lève plus. Il faudrait le nourrir, vite.`);
      else if (k === 2) L.push(`${nom} a maigri. Il ne réclame même plus.`);
      else if (k === 1) L.push(`${nom} réclame à manger.`);
    }
  }
  const A = s.alcool;
  if (A) {
    if (alcool.gueule()) L.push('La tête vous lance. Vous avez trop bu, hier.');
    else if (A.comas) L.push('Vous vous êtes déjà réveillé par terre, sans savoir comment.');
  }
  return `<div class="h-carnet">${L.map((t) => `<p>${esc(t)}</p>`).join('')}</div>`;
}
{
  const _render = ui.renderSatchel.bind(ui);
  ui.renderSatchel = function () {
    _render();
    if (this.satTab !== 'carnet' || !farm.s) return;
    const body = document.querySelector('#satchel .body');
    if (body && !body.querySelector('.h-carnet')) body.insertAdjacentHTML('afterbegin', carnetCorpsEsprit());
  };
}
