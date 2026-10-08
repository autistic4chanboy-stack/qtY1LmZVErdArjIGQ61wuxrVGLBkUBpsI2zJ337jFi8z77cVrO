// ============================================================================
//  LES RUNES (agent R15, quinzième vague) — 4. LE PANNEAU
//  Page « Runes » du menu (M15 : onglet Atelier) ; seul (#r15-runes, un
//  ui.open) devant une dalle, ou sans le menu de M15. Presque sans mots :
//  les quatre tablettes (les signes de celles qu'on a), les runes connues,
//  le cercle (trois places), « Assembler ». Devant une dalle : ses signes au-
//  dessus du cercle. La réponse : une lueur, un son ; ou un coup mat.
// ============================================================================
const runesUI = {
  choix: [], mode: null, porte: null, etat: '', nouvelle: -1,
  svg(id, cls, efface) {
    const g = R15_RUNES[id];
    if (!g) return '';
    const L = g.segs.map((s, n) => (efface && n % 2) ? '' : `<line x1="${s[0] * 80 + 10}" y1="${s[1] * 80 + 10}" x2="${s[2] * 80 + 10}" y2="${s[3] * 80 + 10}"/>`).join('');
    return `<svg class="r15g ${cls || ''}" viewBox="0 0 100 100" aria-hidden="true">${L}</svg>`;
  },
  css() {
    if (document.getElementById('r15-css')) return;
    const st = document.createElement('style');
    st.id = 'r15-css';
    st.textContent = `
.r15 { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 6px 4px 10px; }
.r15 .r15g { width: 100%; height: 100%; stroke: #3a2e22; stroke-width: 7; stroke-linecap: round; fill: none; }
.r15 .r15tabs { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
.r15 .r15tab { width: 54px; height: 72px; border-radius: 6px 6px 3px 3px; background: linear-gradient(#9c968a, #7f796e); box-shadow: inset 0 0 8px rgba(0,0,0,.35);
  display: flex; flex-direction: column; justify-content: space-evenly; align-items: center; padding: 4px 0; }
.r15 .r15tab.vide { background: none; border: 2px dashed rgba(90,70,40,.35); box-shadow: none; }
.r15 .r15tab .r15g { width: 18px; height: 18px; stroke: #2c2620; stroke-width: 9; }
.r15 .r15tab.neuve { animation: r15neuve 2.2s ease-out; }
@keyframes r15neuve { 0% { box-shadow: 0 0 0 rgba(255,220,150,0), inset 0 0 8px rgba(0,0,0,.35); } 30% { box-shadow: 0 0 26px rgba(255,220,150,.95), inset 0 0 8px rgba(0,0,0,.35); } 100% { box-shadow: 0 0 0 rgba(255,220,150,0), inset 0 0 8px rgba(0,0,0,.35); } }
.r15 .r15porte { display: flex; gap: 8px; padding: 8px 14px; border-radius: 4px; background: linear-gradient(#8f897e, #77716a); }
.r15 .r15porte .r15g { width: 40px; height: 40px; stroke: #2a241e; stroke-width: 8; }
.r15 .r15porte .r15g.efface { stroke: #5d574f; opacity: .7; }
.r15 .r15cercle { position: relative; width: min(230px, 62vw); aspect-ratio: 1; border-radius: 50%; border: 3px solid #6f5a3e;
  background: radial-gradient(circle, #efe6cf 0%, #ddd0b2 70%, #cdbd9a 100%); transition: box-shadow .5s, filter .5s; }
.r15 .r15cercle.dort { filter: grayscale(1) opacity(.5); }
.r15 .r15cercle.prend { animation: r15prend 1.8s ease-out; }
.r15 .r15cercle.non { animation: r15non .45s; }
@keyframes r15prend { 0% { box-shadow: 0 0 0 rgba(255,214,140,0); } 25% { box-shadow: 0 0 48px 12px rgba(255,214,140,.95); } 100% { box-shadow: 0 0 0 rgba(255,214,140,0); } }
@keyframes r15non { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-7px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(3px); } }
.r15 .r15place { position: absolute; width: 27%; aspect-ratio: 1; border-radius: 50%; border: 2px solid rgba(90,70,40,.45); background: rgba(255,250,235,.5);
  transform: translate(-50%, -50%); padding: 5%; box-sizing: border-box; cursor: pointer; }
.r15 .r15place:focus-visible, .r15 .r15rune:focus-visible, .r15 .r15ok:focus-visible { outline: 2px solid #8a5a2a; outline-offset: 2px; }
.r15 .r15place.p0 { left: 50%; top: 20%; } .r15 .r15place.p1 { left: 24%; top: 66%; } .r15 .r15place.p2 { left: 76%; top: 66%; }
.r15 .r15ok { position: absolute; left: 50%; top: 52%; transform: translate(-50%, -50%); font-size: 15px; padding: 6px 12px; border-radius: 3px;
  border: 1px solid #8a6a40; background: #f3ead2; color: #3d2e1c; cursor: pointer; }
.r15 .r15ok:disabled { opacity: .45; cursor: default; }
.r15 .r15runes { display: grid; grid-template-columns: repeat(6, 46px); gap: 8px; justify-content: center; }
@media (max-width: 420px) { .r15 .r15runes { grid-template-columns: repeat(4, 46px); } }
.r15 .r15rune { width: 46px; height: 46px; padding: 6px; border-radius: 4px; border: 1px solid rgba(90,70,40,.4); background: #f5eedb; cursor: pointer; }
.r15 .r15rune.pris { opacity: .35; }
.r15 .r15rune:disabled { cursor: default; }
.r15 .r15actifs { display: flex; gap: 10px; min-height: 26px; }
.r15 .r15actifs .r15g { width: 24px; height: 24px; stroke: #8a5a2a; filter: drop-shadow(0 0 4px rgba(255,200,120,.9)); }
#r15-runes .r15-haut { display: flex; justify-content: flex-end; padding: 8px 10px 0; }
#r15-runes .r15-haut button { background: none; border: none; font-size: 20px; color: #6a5436; cursor: pointer; }
#r15-runes .r15-corps { overflow-y: auto; padding: 0 14px 12px; }
`;
    document.head.appendChild(st);
  },
  // le corps (une chaîne HTML)
  html() {
    const S = runes.S(), T = runes.tablettes(), K = runes.connues(), eveil = runes.eveillee(), P = this.porte ? R15_PORTES[this.porte] : null;
    const tabs = T.map((t) => t.trouvee
      ? `<div class="r15tab${this.nouvelle === t.i ? ' neuve' : ''}">${t.runes.map((r) => this.svg(r)).join('')}</div>`
      : '<div class="r15tab vide"></div>').join('');
    const porte = P ? `<div class="r15porte">${P.runes.map((r) => this.svg(r, r === P.efface ? 'efface' : '', r === P.efface)).join('')}</div>` : '';
    const jour = !P && S.j === (farm.s && farm.s.day);
    const dort = !eveil || jour;
    const places = [0, 1, 2].map((i) => `<button class="r15place p${i}" data-place="${i}" aria-label="Place ${i + 1}">${this.choix[i] ? this.svg(this.choix[i]) : ''}</button>`).join('');
    const pret = this.choix.filter(Boolean).length === 3 && !dort;
    const ok = `<button class="r15ok" ${pret ? '' : 'disabled'}${jour && eveil ? ' title="Pas avant demain."' : ''}>Assembler</button>`;
    const cercle = `<div class="r15cercle${dort ? ' dort' : ''}${this.etat ? ' ' + this.etat : ''}">${places}${ok}</div>`;
    const lst = K.map((r) => `<button class="r15rune${this.choix.includes(r) ? ' pris' : ''}" data-rune="${r}" title="${esc(R15_RUNES[r].nom)}" ${eveil ? '' : 'disabled'}>${this.svg(r)}</button>`).join('');
    const act = P ? '' : `<div class="r15actifs">${runes.actifs().map((E) => `<span title="${esc(R15_RUNES[E.r] ? R15_RUNES[E.r].nom : '')}" style="opacity:${clamp(0.35 + E.reste / 24, 0.35, 1).toFixed(2)}">${this.svg(E.r)}</span>`).join('')}</div>`;
    return `<div class="r15">${porte}<div class="r15tabs">${tabs}</div>${cercle}${act}<div class="r15runes">${lst}</div></div>`;
  },
  brancher(el) {
    if (!el) return;
    el.querySelectorAll('[data-rune]').forEach((b) => (b.onclick = () => {
      const r = b.dataset.rune;
      const j = this.choix.indexOf(r);
      if (j >= 0) this.choix[j] = null;
      else { const k = [0, 1, 2].find((i) => !this.choix[i]); if (k === undefined) return; this.choix[k] = r; }
      sound.click && sound.click();
      this.etat = ''; this.redessiner();
    }));
    el.querySelectorAll('[data-place]').forEach((b) => (b.onclick = () => { this.choix[+b.dataset.place] = null; this.etat = ''; this.redessiner(); }));
    const ok = el.querySelector('.r15ok');
    if (ok) ok.onclick = () => this.assembler();
  },
  assembler() {
    const ids = this.choix.slice(0, 3);
    if (ids.filter(Boolean).length !== 3) return;
    const res = runes.assembler(ids, this.porte);
    if (res.r === 'effet') { this.etat = 'prend'; this.choix = []; }
    else if (res.r === 'porte') { this.etat = 'prend'; this.choix = []; this.redessiner(); setTimeout(() => { if (ui.panel === '#r15-runes') ui.close(); }, 1100); return; }
    else { this.etat = 'non'; try { sound.r15Sourd && sound.r15Sourd(); } catch (e) { /* */ } if (res.r !== 'jour') this.choix = []; }
    this.redessiner();
    setTimeout(() => { if (this.etat) { this.etat = ''; } }, 1900);
  },
  // redessiner là où l'on est : le panneau seul, ou la page du menu
  redessiner() {
    if (ui.panel === '#r15-runes') { const el = document.querySelector('#r15-runes .r15-corps'); if (el) { el.innerHTML = this.html(); this.brancher(el); } return; }
    const root = ui.panel === '#satchel' ? document.querySelector('#satchel .r15') : null;
    if (!root) return;
    const par = root.parentElement;
    root.outerHTML = this.html();
    this.brancher(par);
  },
  ouvrir(o) {
    o = o || {};
    this.css();
    this.porte = o.porte || null; this.etat = ''; this.choix = []; this.nouvelle = o.nouvelle === undefined ? -1 : o.nouvelle;
    if (!this.porte && typeof menus !== 'undefined' && menus.ouvrir && menus.page) { menus.ouvrir('runes'); setTimeout(() => { this.nouvelle = -1; }, 2500); return; }
    let el = document.getElementById('r15-runes');
    if (!el) { el = document.createElement('div'); el.id = 'r15-runes'; el.className = 'pp-panel'; document.getElementById('paper').appendChild(el); }
    ui.open('#r15-runes', '<div class="r15-haut"><button class="close" aria-label="Fermer">✕</button></div><div class="r15-corps"></div>');
    el.querySelector('.close').onclick = () => ui.close();
    this.redessiner();
    setTimeout(() => { this.nouvelle = -1; }, 2500);
  },
};
// la page du menu (M15) ; sans le menu de M15 : le panneau seul, depuis le carnet
if (typeof menus !== 'undefined' && menus.page) {
  menus.page({
    id: 'runes', onglet: 'atelier', titre: 'Runes', ordre: 30,
    visible: () => !!(farm.s && runes.nTablettes() > 0),
    rendre: () => { runesUI.css(); runesUI.porte = null; return runesUI.html(); },
    apres: (body) => { runesUI.brancher(body); try { menus.marque && menus.marque('runes', 0); } catch (e) { /* */ } },
  });
} else {
  const _rs = ui.renderSatchel.bind(ui);
  ui.renderSatchel = function () {
    _rs();
    try {
      if (this.satTab !== 'carnet' || !farm.s || !runes.nTablettes()) return;
      const body = document.querySelector('#satchel .body');
      if (!body || body.querySelector('.r15-lien')) return;
      body.insertAdjacentHTML('afterbegin', '<p class="r15-lien"><button>Les runes</button></p>');
      body.querySelector('.r15-lien button').onclick = () => runesUI.ouvrir({});
    } catch (e) { console.error(e); }
  };
}
// le wiki du jeu (D15) : la fiche « Les runes » (sys:runes) et ses champs
try {
  if (typeof decouvertes !== 'undefined' && decouvertes.ajouterChamps) {
    const LIEUX = { ferme: 'près de la ferme', valbrume: 'aux abords de Valbrume', clairpre: 'autour de Clairpré', dessous: 'au fond des Galeries' };
    const SENS = { orne: 'ce qui pousse', sel: 'la chance', ure: 'ce qui mord à la ligne', rade: 'le pas', ysse: 'la nuit', hale: 'la faim',
      aure: 'le bon sens', morne: 'l’envers d’Aure', lone: 'Aure la nuit, Morne le jour', ile: 'une demi-journée', dar: 'sept jours', gyve: 'ouvre les dalles' };
    decouvertes.ajouterChamps('sys:runes', () => {
      const L = [];
      for (const t of runes.tablettes()) L.push({ k: 'tablette' + (t.i + 1), nom: 'Tablette ' + (t.i + 1), val: LIEUX[t.lieu] || '' });
      L.push({ k: 'eveil', nom: 'Les quatre', val: 'la pierre s’éveille' });
      for (const r of R15_ORDRE) L.push({ k: r, nom: R15_RUNES[r].nom, val: SENS[r] });
      return L;
    });
  }
} catch (e) { console.error('runes', e); }
