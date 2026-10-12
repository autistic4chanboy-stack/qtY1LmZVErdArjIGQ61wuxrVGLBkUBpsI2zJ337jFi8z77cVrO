// ============================================================================
//  LA VERSION DE BUREAU (S17, Steam) : trois petites choses, sûres partout.
//  - Menu : « Quitter » (seulement dans l'application de bureau, quand
//    window.steamBridge existe) : enregistre la partie, puis quitte.
//  - Options › Image : « Plein écran » (le pont dans l'application, sinon
//    l'API Fullscreen du navigateur) et « Qualité graphique » : quatre préréglages
//    (pixelisation, distance de vue, brouillard, herbe) ; « Personnalisée » dès
//    qu'on touche un de ces réglages à la main.
//  Textes FR/EN tenus ici (translate="no"), comme le choix de la langue.
// ============================================================================
const bureau = (() => {
  const B = () => (typeof window !== 'undefined' && window.steamBridge) || null;
  // i18n est déclaré plus loin dans le même script (14-i18n.js) : avant lui, on lit le réglage
  const en = () => { try { return i18n.lang === 'en'; } catch (e) { return typeof settings !== 'undefined' && settings.lang === 'en'; } };
  const TXT = {
    quitter: ['Quitter', 'Quit'],
    pe: ['Plein écran', 'Fullscreen'],
    qualite: ['Qualité graphique', 'Graphics quality'],
    perso: ['Personnalisée', 'Custom'],
    basse: ['Basse (machines modestes)', 'Low (modest computers)'],
    moyenne: ['Moyenne (par défaut)', 'Medium (default)'],
    haute: ['Haute', 'High'],
    tres: ['Très haute', 'Very high'],
  };
  const t = (k) => TXT[k][en() ? 1 : 0];
  // pixel (lignes), viewDist (m), fogDist (×), grassDist (m), effets (0 à 3 : les effets de lumière et d'image, voir
  // 07-shaders.js — Basse garde le rendu d'avant, qui ne coûte rien de plus)
  const PRESETS = {
    basse: { pixel: 270, viewDist: 220, fogDist: 0.8, grassDist: 20, effets: 0 },
    moyenne: { pixel: 270, viewDist: 340, fogDist: 1, grassDist: 40, effets: 1 },
    haute: { pixel: 360, viewDist: 500, fogDist: 1.3, grassDist: 60, effets: 2 },
    tres: { pixel: 540, viewDist: 500, fogDist: 1.6, grassDist: 80, effets: 3 },
  };
  const CTRL = { pixel: 'o-pixel', viewDist: 'o-view', fogDist: 'o-fog', grassDist: 'o-grass', effets: 'o-effets' };
  // (réglages d'avant les effets : un préréglage choisi alors garde ses effets)
  try {
    const avant = typeof store !== 'undefined' ? store.get('prairie.settings', null) : null;
    if (avant && avant.effets === undefined && typeof settings !== 'undefined') {
      for (const k in PRESETS) { const P = PRESETS[k]; if (['pixel', 'viewDist', 'fogDist', 'grassDist'].every((c) => Math.abs((+avant[c] || 0) - P[c]) < 1e-6)) { settings.effets = P.effets; break; } }
    }
  } catch (e) { /* rien */ }
  const $id = (id) => document.getElementById(id);

  // ---------------------------------------------------------------- le plein écran
  function estPE() {
    const b = B();
    if (b && typeof b.isFullscreen === 'function') { try { return b.isFullscreen(); } catch (e) { return false; } }
    return !!document.fullscreenElement;
  }
  function pleinEcran(on) {
    const b = B();
    if (b && typeof b.setFullscreen === 'function') { b.setFullscreen(!!on); return; }
    try {
      if (on && !document.fullscreenElement && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
      else if (!on && document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
    } catch (e) { /* refusé */ }
  }

  // ---------------------------------------------------------------- la qualité
  function presetActuel() {
    if (typeof settings === 'undefined') return 'perso';
    for (const k in PRESETS) {
      const P = PRESETS[k];
      if (Object.keys(P).every((c) => Math.abs((+settings[c] || 0) - P[c]) < 1e-6)) return k;
    }
    return 'perso';
  }
  function appliquer(k) {
    const P = PRESETS[k];
    if (!P || typeof settings === 'undefined') return;
    try { effetsMarquer(); } catch (e) { /* rien */ }
    for (const c in P) {
      const el = $id(CTRL[c]);
      if (el) { el.value = String(P[c]); el.dispatchEvent(new Event('change')); } else settings[c] = P[c];
    }
    try { store.set('prairie.settings', settings); if (typeof game !== 'undefined' && game.applySettings) game.applySettings(); } catch (e) { /* rien */ }
  }

  // ---------------------------------------------------------------- l'interface
  function textes() {
    const q = $id('m-quit');
    if (q) q.textContent = t('quitter');
    const lp = $id('s17-pe-l');
    if (lp) lp.textContent = ' ' + t('pe');
    const lq = $id('s17-q-l');
    if (lq) lq.textContent = t('qualite') + ' ';
    const s = $id('o-qualite');
    if (s) for (const o of s.options) o.textContent = t(o.value);
  }
  function majOptions() {
    const c = $id('o-plein'), s = $id('o-qualite');
    if (c) c.checked = estPE();
    if (s) s.value = presetActuel();
  }
  function installer() {
    // le bouton Quitter (application de bureau seulement)
    const nav = document.querySelector('#menu nav');
    if (nav && B() && typeof B().quit === 'function' && !$id('m-quit')) {
      const sep = document.createElement('div');
      sep.className = 'sep';
      const b = document.createElement('button');
      b.id = 'm-quit';
      b.setAttribute('translate', 'no');
      b.onclick = () => {
        try { if (typeof game !== 'undefined' && game.world && game.started) game.save(true); } catch (e) { console.error(e); }
        try { B().quit(); } catch (e) { /* rien */ }
      };
      nav.appendChild(sep);
      nav.appendChild(b);
    }
    // les options
    const cols = document.querySelector('#dlg-options .cols');
    if (cols && !$id('o-plein')) {
      const l = document.createElement('label');
      l.className = 'row';
      l.setAttribute('translate', 'no');
      l.innerHTML = '<input type="checkbox" id="o-plein"><span id="s17-pe-l"></span>';
      cols.appendChild(l);
      $id('o-plein').onchange = (e) => pleinEcran(e.target.checked);
    }
    if (cols && !$id('o-qualite')) {
      const l = document.createElement('label');
      l.setAttribute('translate', 'no');
      l.innerHTML = '<span id="s17-q-l"></span><select id="o-qualite">' + ['perso', 'basse', 'moyenne', 'haute', 'tres'].map((k) => `<option value="${k}"></option>`).join('') + '</select>';
      cols.appendChild(l);
      $id('o-qualite').onchange = (e) => { appliquer(e.target.value); majOptions(); };
      for (const id of Object.values(CTRL)) { const el = $id(id); if (el) el.addEventListener('change', () => { const s = $id('o-qualite'); if (s) s.value = presetActuel(); }); }
    }
    // ranger : dans la section « Image » (M15)
    try {
      if (typeof menus !== 'undefined' && Array.isArray(menus.SECTIONS)) {
        const img = menus.SECTIONS.find(([n]) => n === 'Image');
        if (img) for (const id of ['o-qualite', 'o-plein']) if (!img[1].includes(id)) img[1].splice(id === 'o-qualite' ? 0 : img[1].length, 0, id);
      }
    } catch (e) { /* rien */ }
    document.addEventListener('fullscreenchange', majOptions);
    const b = B();
    if (b && typeof b.onFullscreen === 'function') b.onFullscreen(majOptions);
    textes();
  }
  installer();
  window.addEventListener('DOMContentLoaded', () => {
    try { if (Array.isArray(i18n.onChange)) i18n.onChange.push(textes); } catch (e) { /* rien */ }
    textes(); majOptions();
  });
  // à chaque ouverture des Options : l'état réel (F11 a pu passer par là)
  try {
    if (typeof ui !== 'undefined' && ui.openDialog) {
      const _od = ui.openDialog.bind(ui);
      ui.openDialog = function (id) { if (id === '#dlg-options') { try { textes(); majOptions(); } catch (e) { /* rien */ } } return _od(id); };
    }
  } catch (e) { /* rien */ }

  return { PRESETS, presetActuel, appliquer, pleinEcran, estPE };
})();
