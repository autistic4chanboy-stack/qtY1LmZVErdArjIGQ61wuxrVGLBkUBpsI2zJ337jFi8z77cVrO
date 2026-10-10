// ============================================================================
//  LE WIKI DANS LE JEU (agent D15) — le panneau des découvertes
//  - decouvertes.rendre(el) : le wiki dans un élément (l'onglet « Wiki » du menu,
//    M15) ; decouvertes.ouvrir(id) : le même, en panneau seul (#wiki15).
//  - À gauche, les pages découvertes, par familles ; à droite, la fiche : ce
//    que l'on sait seulement (le reste : « ??? »). Mode interactif : trois
//    réponses au choix par champ (vert : juste ; rouge barré : faux, et une
//    courte attente ; touches 1 2 3 sur un choix). Mode exact : la bonne
//    information des champs appris. Des notes libres sur chaque page.
//  - Sans l'onglet de M15 (decouvertes.accueilli), un onglet « Wiki » de secours
//    dans la sacoche. La case « Wiki interactif » dans les Options.
//  - Une nouvelle page : une plume, un instant, dans le coin. Pas de texte.
// ============================================================================
const D15_GROUPES = [['betes', 'Bêtes'], ['plantes', 'Plantes'], ['arbres', 'Arbres'], ['objets', 'Objets'], ['livres', 'Livres'], ['lieux', 'Lieux'], ['habitants', 'Habitants'], ['autres', 'Le reste']];

Object.assign(decouvertes, {
  vue: { id: null, filtre: '', groupe: null }, cible: null, rendreT: null,

  // l'icône : une image (objets) ou un signe
  icone(F) { const i = F.icone || '✧'; return /^(data:|blob:|https?:|\/)/.test(i) ? `<img src="${i}" alt="">` : `<span class="g">${esc(i)}</span>`; },
  // la liste des pages connues, rangées
  connues() {
    const D = this.S(), ids = D.tout ? this.catalogue() : Object.keys(D.pages);
    const G = {};
    for (const id of ids) { const F = this.ficheCache(id); (G[F.groupe] || (G[F.groupe] = [])).push([id, F]); }
    for (const g in G) G[g].sort((a, b) => a[1].titre.localeCompare(b[1].titre, 'fr'));
    return G;
  },
  totaux() {
    if (this._tot && this._totOf === this.cat) return this._tot;
    const T = {};
    for (const id of this.catalogue()) { const g = this.ficheCache(id).groupe; T[g] = (T[g] || 0) + 1; }
    this._tot = T; this._totOf = this.cat;
    return T;
  },

  // ------------------------------------------------------------- le rendu
  rendre(el) {
    if (!el) return;
    this.style();
    if (this.nouveaux) { this.nouveaux = 0; if (typeof menus !== 'undefined' && menus.marque) try { menus.marque('wiki', 0); } catch (e) { /* */ } }
    this.cible = el;
    const fa = document.activeElement, foc = fa && el.contains(fa) && fa.dataset ? (fa.dataset.w15c ? `[data-w15c="${fa.dataset.w15c}"][data-w15o="${fa.dataset.w15o}"]` : fa.dataset.w15 ? `[data-w15="${fa.dataset.w15}"]` : fa.dataset.w15g ? `[data-w15g="${fa.dataset.w15g}"]` : null) : null;
    const D = this.S(), G = this.connues(), T = this.totaux(), f = d15Norme(this.vue.filtre);
    const n = Object.values(G).reduce((a, L) => a + L.length, 0);
    if (this.vue.id && !this.connu(this.vue.id)) this.vue.id = null;
    let liste = '';
    for (const [g, nom] of D15_GROUPES) {
      const L = (G[g] || []).filter(([, F]) => !f || d15Norme(F.titre).includes(f));
      if (!L.length && !(G[g] || []).length) continue;
      const ouvert = f || this.vue.groupe === g || (this.vue.id && L.some(([id]) => id === this.vue.id));
      liste += `<div class="w15-g${ouvert ? ' ouvert' : ''}"><button class="w15-gt" data-w15g="${g}">${esc(nom)}<small>${(G[g] || []).length} / ${T[g] || (G[g] || []).length}</small></button>`;
      if (ouvert) liste += `<div class="w15-gl">${L.map(([id, F]) => `<button class="w15-e${id === this.vue.id ? ' on' : ''}${this.complet(id, F) ? ' fini' : ''}" data-w15="${esc(id)}">${this.icone(F)}<span>${esc(F.titre)}</span></button>`).join('')}</div>`;
      liste += '</div>';
    }
    if (!n) liste = '<p class="hint">Rien encore.</p>';
    el.innerHTML = `<div class="w15${this.vue.id ? ' a-fiche' : ''}"><div class="w15-tete"><input type="search" class="w15-cherche" placeholder="Chercher…" value="${esc(this.vue.filtre)}"><span class="w15-n">${n}</span></div>
      <div class="w15-cols"><nav class="w15-liste">${liste}</nav><article class="w15-fiche">${this.vue.id ? this.ficheHTML(this.vue.id) : '<p class="hint w15-vide">✎</p>'}</article></div></div>`;
    this.brancher(el);
    if (foc) { let b = null; try { b = el.querySelector(foc); } catch (e) { /* */ } if (b && !b.disabled) b.focus({ preventScroll: true }); }
  },
  complet(id, F) { return F.champs.length > 0 && F.champs.every((c) => this.sait(id, c.k) && (this.mode() === 'exact' || ((this.S().valides[id] || {})[c.k] === true))); },
  ficheHTML(id) {
    const D = this.S(), F = this.ficheCache(id), P = D.pages[id], N = D.notes[id] || {}, V = D.valides[id] || {}, inter = D.mode === 'interactif';
    const tousSus = F.champs.every((c) => this.sait(id, c.k));
    let h = `<button class="w15-retour" data-w15retour>‹</button><h3>${this.icone(F)} ${esc(F.titre)}</h3>`;
    const sous = [F.sous, P ? `jour ${P.j}` : ''].filter(Boolean).join(' · ');
    if (sous) h += `<div class="w15-sous">${esc(sous)}</div>`;
    if (F.lead && (!F.leadFin || tousSus)) h += `<p class="w15-lead">${esc(fmtLineSur(F.lead))}</p>`;
    if (F.champs.length) {
      h += '<dl class="w15-ch">';
      for (const c of F.champs) {
        const su = this.sait(id, c.k);
        h += `<dt>${esc(c.nom)}</dt>`;
        if (!su) { h += '<dd class="inc">???</dd>'; continue; }
        if (!inter) { h += `<dd class="ex">${esc(c.val)}</dd>`; continue; }
        const O = this.options(id, c.k);
        if (V[c.k] === true || O.length < 2) { h += `<dd class="${V[c.k] === true ? 'ok' : 'ex'}"><span>${esc(c.val)}</span></dd>`; continue; }
        const B = this.barres(id, c.k).map(d15Norme), att = this.attend(id, c.k) > 0;
        h += `<dd class="qcm${B.length ? ' non' : ''}">` + O.map((o, i) => { const x = B.includes(d15Norme(o)); return `<button class="w15-o${x ? ' faux' : att ? ' att' : ''}" data-w15c="${esc(c.k)}" data-w15o="${i}"${x || att ? ' aria-disabled="true"' : ''}>${esc(o)}</button>`; }).join('') + '</dd>';
      }
      h += '</dl>';
    }
    h += `<textarea class="w15-notes" maxlength="600" placeholder="Vos notes" data-w15notes>${esc(N._ || '')}</textarea>`;
    return h;
  },
  brancher(el) {
    const on = (sel, fn) => el.querySelectorAll(sel).forEach((b) => (b.onclick = (e) => fn(b, e)));
    const redessiner = () => { this.rendre(el); };
    on('[data-w15g]', (b) => { const g = b.dataset.w15g; this.vue.groupe = this.vue.groupe === g ? null : g; if (this.vue.groupe !== g && this.vue.id && this.ficheCache(this.vue.id).groupe === g) this.vue.id = null; redessiner(); sound.click && sound.click(); });
    on('[data-w15]', (b) => { this.vue.id = b.dataset.w15; this.vue.groupe = this.ficheCache(this.vue.id).groupe; redessiner(); sound.page && sound.page(); });
    on('[data-w15retour]', () => { this.vue.id = null; redessiner(); });
    const choisir = (k, i) => {
      const id = this.vue.id, o = this.options(id, k)[i];
      if (!id || o === undefined) return;
      const ok = this.choisir(id, k, o);
      if (ok === null) return;
      if (ok) { sound.pop && sound.pop(); } else { sound.click && sound.click(); }
      redessiner();
      // le clavier : on reste sur le champ (faux), ou l'on passe au champ suivant (juste)
      const b = ok ? el.querySelector('.w15-o') : el.querySelector(`[data-w15c="${k}"][data-w15o="${i}"]`);
      if (b) b.focus({ preventScroll: true });
      if (!ok) { clearTimeout(this.attT); this.attT = setTimeout(() => { if (el.isConnected && el.querySelector('.w15')) this.rendre(el); }, this.attend(id, k) + 50); }
    };
    on('[data-w15c]', (b) => choisir(b.dataset.w15c, +b.dataset.w15o));
    el.querySelectorAll('[data-w15c]').forEach((b) => {
      b.onkeydown = (e) => { const m = /^(?:Digit|Numpad)([1-3])$/.exec(e.code); if (m && !e.repeat) { e.preventDefault(); e.stopPropagation(); const q = el.querySelector(`[data-w15c="${b.dataset.w15c}"][data-w15o="${+m[1] - 1}"]`); if (q) choisir(b.dataset.w15c, +m[1] - 1); } };
    });
    const ta = el.querySelector('[data-w15notes]');
    if (ta) { ta.onkeydown = (e) => { e.stopPropagation(); if (e.key === 'Escape') ta.blur(); }; ta.onchange = () => { const id = this.vue.id; if (id) this.note(id, '_', ta.value.slice(0, 600)); }; }
    const inp = el.querySelector('.w15-cherche');
    if (inp) {
      inp.oninput = () => { this.vue.filtre = inp.value; clearTimeout(this.tf); this.tf = setTimeout(() => { this.rendre(el); const i2 = el.querySelector('.w15-cherche'); if (i2) { i2.focus(); i2.setSelectionRange(i2.value.length, i2.value.length); } }, 200); };
      inp.onkeydown = (e) => { e.stopPropagation(); if (e.key === 'Escape') inp.blur(); };
    }
  },
  // ce qui change pendant que le wiki est ouvert : on redessine (sauf si l'on écrit)
  surChange() {
    const el = this.cible;
    if (!el || !el.isConnected || !el.offsetParent) return;
    const a = document.activeElement;
    if (a && el.contains(a) && /^(INPUT|TEXTAREA)$/.test(a.tagName)) return;
    clearTimeout(this.rendreT);
    this.rendreT = setTimeout(() => { if (el.isConnected && el.querySelector('.w15')) this.rendre(el); }, 400);
  },

  // ------------------------------------------------------------- le panneau seul
  ouvrir(id) {
    if (!game.world || game.kind !== 'farm' || !farm.s) return;
    if (!$('#wiki15')) { const d = document.createElement('div'); d.id = 'wiki15'; d.className = 'pp-panel'; $('#paper').appendChild(d); }
    if (id && this.connu(id)) { this.vue.id = id; this.vue.groupe = this.ficheCache(id).groupe; }
    ui.open('#wiki15', '<div class="tabs"><b>Wiki</b><button class="x" data-fermer title="Fermer">✕</button></div><div class="body"></div>');
    $('#wiki15 [data-fermer]').onclick = () => ui.close();
    this.rendre($('#wiki15 .body'));
  },

  // ------------------------------------------------------------- la case des Options
  caseOptions(hote) {
    const box = hote || $('#dlg-options .cols') || $('#dlg-options .box');
    if (!box) return;
    let c = $('#o-wiki');
    if (!c) {
      const lab = document.createElement('label');
      lab.className = 'row';
      lab.innerHTML = '<input type="checkbox" id="o-wiki"> Wiki interactif';
      const apres = $('#o-fps') && $('#o-fps').closest('label');
      if (apres && apres.parentNode && !hote) apres.parentNode.insertBefore(lab, apres.nextSibling); else box.appendChild(lab);
      c = $('#o-wiki');
      c.onchange = () => { const m = c.checked ? 'interactif' : 'exact'; store.set(D15_MODE, m); if (farm.s) this.reglerMode(m); };
    }
    c.checked = (farm.s ? this.mode() : store.get(D15_MODE, 'interactif')) !== 'exact';
  },

  // ------------------------------------------------------------- la plume (nouvelle page)
  plume() {
    const t = performance.now();
    if (t - (this.plumeT || 0) < 1500) return;
    this.plumeT = t;
    let e = $('#w15-plume');
    if (!e) { e = document.createElement('div'); e.id = 'w15-plume'; e.textContent = '✎'; document.body.appendChild(e); this.style(); }
    e.classList.remove('vu'); void e.offsetWidth; e.classList.add('vu');
  },

  style() {
    if ($('#w15-css')) return;
    const st = document.createElement('style');
    st.id = 'w15-css';
    st.textContent = `#wiki15{height:min(640px,calc(100vh - 10vh))}
#wiki15 .body{flex:1;min-height:0;display:flex;flex-direction:column}
.w15{display:flex;flex-direction:column;min-height:0;height:100%}
.w15-tete{display:flex;gap:8px;align-items:center;margin:0 0 8px}
.w15-cherche{flex:1;min-width:0;padding:4px 8px;font:inherit;font-size:14px;background:rgba(255,250,235,.7);border:1px solid rgba(90,70,40,.35);color:#2d2216}
.w15-n{color:#7a6a52;font-size:13px;min-width:2em;text-align:right}
.w15-cols{display:grid;grid-template-columns:minmax(180px,34%) 1fr;gap:14px;min-height:0;flex:1}
.w15-liste{overflow-y:auto;scrollbar-width:thin;min-height:0;max-height:100%;padding-right:4px}
.w15-fiche{overflow-y:auto;scrollbar-width:thin;min-height:0;max-height:100%;padding:0 4px 8px}
.w15-gt{display:flex;width:100%;justify-content:space-between;align-items:baseline;background:none;border:none;border-bottom:1px solid rgba(90,70,40,.2);padding:6px 2px;font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:#7a5e3a;text-align:left;cursor:pointer}
.w15-gt small{letter-spacing:0;text-transform:none;color:#9a8a6a;font-size:12px}
.w15-g.ouvert .w15-gt{color:#3d2e1c}
.w15-gl{display:flex;flex-direction:column;gap:2px;margin:4px 0 8px}
.w15-e{display:flex;align-items:center;gap:6px;padding:3px 6px;background:none;border:1px solid transparent;border-radius:3px;text-align:left;font-size:14px;color:#33291d;cursor:pointer}
.w15-e:hover{background:rgba(255,255,255,.3)}
.w15-e.on{border-color:#8a5a2a;background:rgba(255,230,170,.55)}
.w15-e.fini span{color:#2f6a2a}
.w15-e img,.w15-fiche h3 img{width:20px;height:20px;image-rendering:pixelated;object-fit:contain;flex:none}
.w15-e .g,.w15-fiche h3 .g{display:inline-block;width:20px;text-align:center;flex:none;color:#6a5436}
.w15-e span:last-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.w15-fiche h3{display:flex;align-items:center;gap:8px;margin:2px 0 2px}
.w15-fiche h3 img{width:28px;height:28px}
.w15-sous{color:#7a6a52;font-size:13px;font-style:italic;margin-bottom:8px}
.w15-lead{margin:6px 0 10px;line-height:1.45;color:#3a2e20}
.w15-ch{display:grid;grid-template-columns:auto 1fr;gap:6px 12px;align-items:center;margin:8px 0 12px}
.w15-ch dt{color:#6a5436;font-size:13px}
.w15-ch dd{margin:0;display:flex;gap:6px;align-items:center;min-width:0}
.w15-ch dd.inc{color:#9a8a6a;letter-spacing:.1em}
.w15-ch dd.ex{color:#2d2216}
.w15-ch dd.ok span{color:#2f6a2a;font-weight:bold}
.w15-ch dd.qcm{flex-wrap:wrap;gap:5px}
.w15-o{flex:0 1 auto;max-width:100%;padding:3px 9px;font:inherit;font-size:13.5px;line-height:1.3;text-align:left;background:rgba(255,250,235,.75);border:1px solid rgba(90,70,40,.35);border-radius:3px;color:#2d2216;cursor:pointer}
.w15-o:hover:not([aria-disabled]){background:rgba(255,236,190,.95);border-color:#8a5a2a}
.w15-o:focus-visible{outline:2px dotted #8a5a2a;outline-offset:1px}
.w15-o[aria-disabled]{cursor:default}
.w15-o.att{opacity:.55}
.w15-o.faux{color:#9a3a2a;text-decoration:line-through;background:rgba(200,120,100,.12);border-color:rgba(150,60,40,.4)}
.w15-notes{width:100%;box-sizing:border-box;min-height:64px;resize:vertical;padding:6px;font:inherit;font-size:14px;font-style:italic;background:rgba(255,250,235,.5);border:1px dashed rgba(90,70,40,.35);color:#4a3e2e}
.w15-retour{display:none}
.w15-vide{font-size:32px;text-align:center;margin-top:20%;opacity:.35}
@media (max-width:640px){
 .w15-cols{grid-template-columns:1fr}
 .w15.a-fiche .w15-liste{display:none}
 .w15:not(.a-fiche) .w15-fiche{display:none}
 .w15-retour{display:inline-block;background:none;border:none;font-size:22px;color:#6a5436;padding:0 6px 0 0;cursor:pointer;float:left}
 .w15-ch{grid-template-columns:1fr}
}
#w15-plume{position:fixed;right:18px;bottom:18px;z-index:7;font-size:22px;color:#f4ead2;text-shadow:0 1px 3px rgba(0,0,0,.6);opacity:0;pointer-events:none}
#w15-plume.vu{animation:w15plume 2.4s ease-out}
@keyframes w15plume{0%{opacity:0;transform:translateY(6px)}15%{opacity:.85;transform:none}70%{opacity:.6}100%{opacity:0;transform:translateY(-4px)}}`;
    document.head.appendChild(st);
  },
});
// la notice : quelques textes ont des {mots} à remplir (le nom d'un lieu…)
function fmtLineSur(t) { try { return typeof fmtLine === 'function' ? fmtLine(String(t), null) : String(t); } catch (e) { return String(t).replace(/\{[^}]*\}/g, '…'); } }

decouvertes.ecoute.push((id, k, page) => {
  if (!page || decouvertes.S().tout) return;
  if (game.mode === 'play' && !ui.panel) decouvertes.plume();
  decouvertes.nouveaux = (decouvertes.nouveaux || 0) + 1;
  if (typeof menus !== 'undefined' && menus.marque) try { menus.marque('wiki', decouvertes.nouveaux); } catch (e) { /* */ }
});

// ---------------------------------------------------------------- l'onglet « Wiki » du menu (M15), ou, sans lui, un onglet de secours dans la sacoche
if (typeof menus !== 'undefined' && menus.page) {
  decouvertes.accueilli = true;
  menus.page({ id: 'wiki', onglet: 'wiki', titre: 'Wiki', ordre: 10, rendre: (body) => { decouvertes.rendre(body); } });
}
{
  const _rs = ui.renderSatchel.bind(ui);
  ui.renderSatchel = function () {
    _rs();
    if (decouvertes.accueilli) return;
    try {
      const tabs = $('#satchel .tabs');
      if (!tabs) return;
      let b = tabs.querySelector('[data-tab="wiki15"]');
      if (!b) { b = document.createElement('button'); b.dataset.tab = 'wiki15'; b.textContent = 'Wiki'; const x = tabs.querySelector('.x'); tabs.insertBefore(b, x || null); }
      b.classList.toggle('on', this.satTab === 'wiki15');
      b.onclick = () => { this.satTab = 'wiki15'; this.renderSatchel(); sound.page && sound.page(); };
      if (this.satTab === 'wiki15') {
        tabs.querySelectorAll('[data-tab]').forEach((q) => { if (q !== b) q.classList.remove('on'); });
        const body = $('#satchel .body');
        if (body) decouvertes.rendre(body);
      }
    } catch (e) { console.error(e); }
  };
}

HOOKS.load.push(() => { try { decouvertes.caseOptions(); } catch (e) { console.error(e); } });
try { decouvertes.caseOptions(); } catch (e) { /* la page n'est pas encore là */ }
