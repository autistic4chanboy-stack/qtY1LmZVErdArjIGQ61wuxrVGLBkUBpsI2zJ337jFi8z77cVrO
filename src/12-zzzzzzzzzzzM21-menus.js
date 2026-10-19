// ============================================================================
//  LES MENUS, REFAITS (agent M21)
//  Un seul système pour tous les menus, posé PAR-DESSUS ce qui existe : chaque
//  panneau garde son code, ses id et ses classes (le code et les tests s'en
//  servent) ; on ajoute :
//  - le style commun (variables CSS de src/shell.html, feuille #m21-css gardée en
//    dernier dans <head>) : papier, encre, sépia, la police de l'écran titre, une
//    seule croix ✕ en haut à droite, transitions courtes (« Réduire les
//    animations » les coupe) ;
//  - la navigation au clavier seul et à la MANETTE (Gamepad API) dans tous les
//    menus, avec un anneau de focus visible ; mêmes raccourcis partout (Échap
//    ferme, Tab passe d'onglet en onglet, flèches, Entrée) ;
//  - la recherche, le tri et le filtre des longues listes (sacoche, wiki,
//    bestiaire et livres, boutique, coffre), un sommaire « Aller à » des longues
//    pages ; les infobulles d'objets ; le choix des quantités ;
//  - les Options en onglets, l'échelle de l'interface (du petit écran au 4K).
//  Rien à chaque image quand aucun menu n'est ouvert : sans manette, rien du
//  tout ; avec une manette, 10 lectures par seconde (Start, Select), sauf si la
//  pêche le demande (m21.manette.demander). Pas de flou sur la vue 3D.
//  API : m21 (eq/contrat-v21.md, section M21).
// ============================================================================
const m21 = (() => {
  const D = document, H = D.documentElement;
  const $q = (s, r) => (r || D).querySelector(s);
  const $$q = (s, r) => [...(r || D).querySelectorAll(s)];
  const norm = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/œ/g, 'oe').replace(/æ/g, 'ae').replace(/\s+/g, ' ').trim();
  const son = (k) => { try { if (typeof sound !== 'undefined' && sound[k]) sound[k](); } catch (e) { /* rien */ } };
  const sauver = () => { try { store.set('prairie.settings', settings); } catch (e) { /* rien */ } };

  // ================================================================ réglages
  // (dans DEFAULT_SETTINGS aussi : « Réinitialiser » les remet) ; m21Calme : null = comme le système, true / false = choisi
  Object.assign(DEFAULT_SETTINGS, { m21Echelle: 'auto', m21Bulles: true, m21Vibrer: true, m21Calme: null });
  for (const k of ['m21Echelle', 'm21Bulles', 'm21Vibrer', 'm21Calme']) if (settings[k] === undefined) settings[k] = DEFAULT_SETTINGS[k];

  // ================================================================ l'échelle de l'interface
  const ECHELLES = ['auto', 0.75, 0.85, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5];
  let K = 1;
  function kAuto() {
    const h = innerHeight || 800, w = innerWidth || 1280;
    let k = 1;
    if (h < 600 || w < 900) k = Math.max(0.75, Math.min(h / 600, w / 900));
    else if (h > 1200 && w > 1900) k = Math.min(2.5, Math.min(h / 1080, w / 1920) * 0.92);
    return Math.round(k * 20) / 20;
  }
  function appliquerEchelle() {
    const v = settings.m21Echelle;
    K = v === 'auto' || !(+v > 0) ? kAuto() : Math.min(2.5, Math.max(0.5, +v));
    H.style.setProperty('--m21-k', String(K));
    const out = $q('#o-m21-echelle-v');
    if (out) out.textContent = Math.round(K * 100) + ' %';
  }
  function appliquerCalme() {
    const c = settings.m21Calme;
    H.classList.toggle('m21-calme', c === true);
    H.classList.toggle('m21-mouvement', c === false);
  }
  addEventListener('resize', () => { if (settings.m21Echelle === 'auto') appliquerEchelle(); bulle.cacher(); });
  const calme = () => settings.m21Calme === true || (settings.m21Calme !== false && !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches));

  // ---------------------------------------------------------------- vw / vh dans les calques zoomés
  // Le zoom multiplie aussi les vw/vh : toute règle des menus qui en emploie est corrigée une fois (÷ --m21-k),
  // y compris les feuilles injectées plus tard par les modules.
  const ZOOME = /#(paper|menu|subs|toasts|pickups|hotbar|death|m21-|satchel|shop|store|talk|reader|choice|alchemy|alchtable|mapview|butin|commandes|livre|biblio|crochetage|fondterm|r15-runes|m15-boite|wiki15|admin|dlg-)|\.pp-panel|\.dialog|\.w15|\.m15-|\.bu-|\.cm-|\.f2a-|\.m21-/;
  const faites = new WeakSet();
  function corrigerRegles(rules) {
    for (const r of rules) {
      try {
        if (r.cssRules && !r.style) { corrigerRegles(r.cssRules); continue; }
        if (!r.style || faites.has(r)) continue;
        faites.add(r);
        if (!r.selectorText || !ZOOME.test(r.selectorText)) continue;
        const st = r.style;
        for (let i = 0; i < st.length; i++) {
          const p = st[i], v = st.getPropertyValue(p);
          if (!/\dv[hw]\b/.test(v) || v.includes('--m21-k')) continue;
          st.setProperty(p, v.replace(/(-?\d*\.?\d+)v([hw])\b/g, 'calc($1v$2 / var(--m21-k, 1))'), st.getPropertyPriority(p));
        }
      } catch (e) { /* une règle illisible : tant pis */ }
    }
  }
  function corrigerFeuilles() { for (const sh of Array.from(D.styleSheets || [])) { try { corrigerRegles(sh.cssRules || []); } catch (e) { /* rien */ } } }

  // ================================================================ la feuille de style
  const LOUPE = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14'%3E%3Ccircle cx='6' cy='6' r='4.2' fill='none' stroke='%238a5a2a' stroke-width='1.6'/%3E%3Cpath d='M9.2 9.2 13 13' stroke='%238a5a2a' stroke-width='1.8' stroke-linecap='round'/%3E%3C/svg%3E\")";
  const STYLE = `
/* l'échelle : les calques des menus portent le zoom */
#paper, .dialog, #menu, #subs, #toasts, #pickups, #hotbar, #death, #m21-hud { zoom: var(--m21-k, 1); }
#m21-hud { position: fixed; inset: 0; pointer-events: none; z-index: 5; }
.m21-cache { display: none !important; }
@keyframes m21-entre { from { opacity: 0; translate: 0 12px; } to { opacity: 1; translate: 0 0; } }
@keyframes m21-fondu { from { opacity: 0; } to { opacity: 1; } }

/* ---- les panneaux papier */
#paper { background: var(--m21-voile); }
.pp-panel { font-family: var(--m21-police); color: var(--m21-encre); }
.pp-panel:where(:not(#fondterm)) { background-color: var(--m21-papier); border: 1px solid rgba(90,70,40,.38); }
.pp-panel.open { animation: m21-entre var(--m21-duree) var(--m21-courbe) both; }
.pp-panel > .tabs { flex: none; min-height: 50px; gap: 2px; padding: 8px 8px 0 16px; background: linear-gradient(180deg, rgba(120,90,40,.11), rgba(120,90,40,0)); border-bottom: 1px solid var(--m21-trait); }
.pp-panel > .tabs b { font-size: 19px; letter-spacing: .02em; color: var(--m21-encre); }
.pp-panel .tabs button:not(.x) { border-radius: var(--m21-rayon) var(--m21-rayon) 0 0; transition: color var(--m21-duree), background-color var(--m21-duree), border-color var(--m21-duree); }
.pp-panel .tabs button:not(.x):not(.on):hover { color: var(--m21-encre); background: var(--m21-sepia-voile); }
.pp-panel .tabs button.on { color: var(--m21-encre); border-bottom-color: var(--m21-sepia); }
.pp-panel .tabs .x, .pp-panel .m21-x { flex: none; width: 34px; height: 34px; margin: 0 0 7px auto; padding: 0; display: inline-flex; align-items: center; justify-content: center; border: 1px solid transparent; border-radius: 50%; background: none; color: var(--m21-encre-douce); font: 17px/1 var(--m21-police); cursor: pointer; transition: background-color var(--m21-duree), color var(--m21-duree), border-color var(--m21-duree); }
.pp-panel .tabs .x:hover, .pp-panel .m21-x:hover { background: var(--m21-sepia-voile); border-color: var(--m21-trait); color: var(--m21-encre); }
.pp-panel .m21-x { position: absolute; top: 8px; right: 8px; margin: 0; z-index: 3; }
#r15-runes .r15-haut .close { width: 34px; height: 34px; padding: 0; border: 1px solid transparent; border-radius: 50%; background: none; color: var(--m21-encre-douce); font: 17px/1 var(--m21-police); }
#r15-runes .r15-haut .close:hover { background: var(--m21-sepia-voile); border-color: var(--m21-trait); }
.pp-panel .body, .pp-panel .txt, .dialog .box { scrollbar-width: thin; scrollbar-color: rgba(138,90,42,.5) transparent; }
.pp-panel .hint { color: var(--m21-encre-pale); }
.pp-panel .it, .pp-panel .row, .pp-panel .note, .pp-panel .rec button, .pp-panel .close, .pp-panel .opts button { transition: background-color var(--m21-duree), border-color var(--m21-duree), color var(--m21-duree); }
.pp-panel .it:hover, .pp-panel .row:hover:not(:disabled) { border-color: rgba(138,90,42,.55); }
.pp-panel .note:hover { background: rgba(255,240,200,.7); border-color: rgba(138,90,42,.5); }
.pp-panel .rec button:hover:not(:disabled), .pp-panel .close:hover { background: var(--m21-sepia-fonce); }
.pp-panel kbd, .dialog kbd { font: 12px/1.3 var(--m21-police); color: var(--m21-encre-douce); background: var(--m21-papier-clair); border: 1px solid rgba(90,70,40,.4); border-bottom-width: 2px; border-radius: 3px; padding: 0 5px; }
#talk { position: relative; }
#talk .who { padding-right: 40px; }
#choice h3 { padding-right: 34px; }
#reader h3 { padding-right: 30px; }

/* ---- les lignes d'objectif (H17, K18 : au-dessus de la vue) ne passent pas sur un menu ouvert */
:is(#paper.open, #menu.open, .dialog.open) ~ :is(#h17-but, #k18-but) { visibility: hidden !important; }

/* ---- l'anneau de focus (clavier, manette) */
html.m21-clavier :is(#paper, .dialog, #menu, #death) :focus, :is(#paper, .dialog, #death) :focus-visible { outline: 2px solid var(--m21-anneau) !important; outline-offset: 2px !important; box-shadow: 0 0 0 5px rgba(194,112,28,.2); }
html.m21-clavier #paper :is(.it, .row, .note, .rec, .w15-e, .w15-gt, .bu-it, .q, .opts button, .cm-art, .cm-etal, [data-bu], .fiche):focus { outline-offset: -2px !important; }
html.m21-clavier #paper .opts button:focus { background: rgba(138,90,42,.16); color: #1d140a; }
html.m21-clavier #menu nav button:focus { outline: none !important; box-shadow: none; }
#satchel .barcfg .hb-slot[tabindex], #satchel .barcfg .tok[tabindex] { cursor: pointer; }

/* ---- éléments communs */
.m21-btn { padding: 5px 13px; background: rgba(255,255,255,.42); color: var(--m21-encre); border: 1px solid rgba(90,70,40,.42); border-radius: var(--m21-rayon); font: 14px var(--m21-police); cursor: pointer; transition: background-color var(--m21-duree), color var(--m21-duree); }
.m21-btn:hover:not(:disabled) { background: rgba(255,240,200,.92); }
.m21-btn.prim { background: var(--m21-sepia); color: #f4ead2; border-color: var(--m21-sepia-fonce); }
.m21-btn.prim:hover:not(:disabled) { background: var(--m21-sepia-fonce); }
.m21-btn:disabled { opacity: .45; cursor: default; }
.m21-jauge { position: relative; height: 10px; background: var(--m21-papier-fonce); border: 1px solid rgba(90,70,40,.45); border-radius: 6px; overflow: hidden; }
.m21-jauge > i { position: absolute; left: 0; top: 0; bottom: 0; background: var(--m21-sepia); border-radius: 6px; transition: width var(--m21-duree) linear; }
.m21-jauge.rouge > i { background: var(--m21-rouge); } .m21-jauge.vert > i { background: var(--m21-vert); } .m21-jauge.or > i { background: var(--m21-or); }
.m21-jauge.nuit { background: rgba(0,0,0,.45); border-color: rgba(232,192,112,.35); }
.m21-touche { display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; min-width: 1.75em; height: 1.75em; padding: 0 .45em; border: 1px solid rgba(90,70,40,.55); border-bottom-width: 3px; border-radius: 4px; background: var(--m21-papier-clair); color: var(--m21-encre); font: bold .78em/1 var(--m21-police); font-style: normal; vertical-align: .05em; white-space: nowrap; }
.m21-touche.rond { border-radius: 50%; border-width: 1px; padding: 0; width: 1.75em; color: #f6eedb; background: #5a4a36; border-color: rgba(0,0,0,.35); }
.m21-touche.b-A { background: #4f6d36; } .m21-touche.b-B { background: #8a3a2a; } .m21-touche.b-X { background: #3d5c7a; } .m21-touche.b-Y { background: #9a7a2a; }
.m21-touche.long { border-radius: 9px; border-bottom-width: 1px; color: #f6eedb; background: #5a4a36; border-color: rgba(0,0,0,.35); }
.m21-carte { background: var(--m21-papier-clair); border: 1px solid rgba(90,70,40,.4); border-radius: var(--m21-rayon); padding: 10px 12px; box-shadow: inset 0 0 24px rgba(120,90,40,.12); }

/* ---- la barre recherche / tri / filtre, le sommaire */
.m21-outils { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 12px; margin: 2px 0 10px; padding: 6px 8px; background: rgba(255,255,255,.3); border: 1px solid var(--m21-trait); border-radius: var(--m21-rayon); font-size: 13.5px; }
.pp-panel > .m21-outils { flex: none; margin: 8px 16px 0; }
.m21-cherche { flex: 1 1 170px; min-width: 120px; padding: 5px 8px 5px 27px; background: var(--m21-papier-clair) ${LOUPE} no-repeat 8px 50%; border: 1px solid rgba(90,70,40,.42); border-radius: var(--m21-rayon); font: 14px var(--m21-police); color: var(--m21-encre); user-select: text; -webkit-user-select: text; }
.m21-cherche::placeholder { color: var(--m21-encre-pale); font-style: italic; }
.m21-sel { display: inline-flex; align-items: center; gap: 5px; color: var(--m21-encre-douce); font-style: italic; }
.m21-sel select { padding: 4px 6px; background: var(--m21-papier-clair); border: 1px solid rgba(90,70,40,.42); border-radius: var(--m21-rayon); font: 13.5px var(--m21-police); color: var(--m21-encre); font-style: normal; }
.m21-n { margin-left: auto; color: var(--m21-encre-pale); font-style: italic; font-variant-numeric: tabular-nums; }
.m21-sommaire { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 6px; margin: 0 0 8px; font-size: 13px; color: var(--m21-encre-pale); font-style: italic; }
.m21-sommaire button { padding: 2px 10px; background: rgba(255,255,255,.3); border: 1px solid var(--m21-trait); border-radius: 11px; font: 12.5px var(--m21-police); color: var(--m21-encre-douce); font-style: normal; cursor: pointer; }
.m21-sommaire button:hover { background: rgba(255,240,200,.85); color: var(--m21-encre); }
.m21-vide { margin: 10px 2px; font-style: italic; color: var(--m21-encre-pale); }
.m15-pages .m21-ic, .m21-onglets .m21-ic { margin-right: 5px; font-size: .95em; opacity: .85; }

/* ---- la ligne des raccourcis (au clavier et à la manette seulement) */
.m21-aide { display: none; flex: none; flex-wrap: wrap; align-items: center; gap: 4px 14px; padding: 6px 16px 8px; border-top: 1px solid rgba(90,70,40,.18); font: italic 12.5px var(--m21-police); color: var(--m21-encre-pale); }
html.m21-clavier .m21-aide { display: flex; }
.m21-aide > span { white-space: nowrap; display: inline-flex; align-items: center; gap: 4px; }
.m21-aide .m21-touche { font-size: 11px; }
.dialog .m21-aide { margin: 14px -26px -16px; padding: 7px 26px 9px; }
#menu .m21-aide { position: absolute; left: clamp(24px, 8vw, 120px); bottom: 14px; padding: 0; border: 0; color: rgba(239,230,207,.62); }
#death .m21-aide { border: 0; color: #8a8070; }
html.m21-manette #butin .bu-aide { display: none; }

/* ---- l'infobulle d'objet */
#m21-bulle { position: absolute; left: 0; top: 0; z-index: 30; width: max-content; max-width: 300px; padding: 10px 12px 8px; background: var(--m21-papier-clair); color: var(--m21-encre); border: 1px solid rgba(90,70,40,.5); border-radius: var(--m21-rayon); box-shadow: 0 10px 30px rgba(0,0,0,.45), inset 0 0 24px rgba(120,90,40,.14); font: 13.5px/1.4 var(--m21-police); pointer-events: none; opacity: 0; visibility: hidden; transition: opacity var(--m21-duree); }
#m21-bulle.on { opacity: 1; visibility: visible; }
#m21-bulle .m21-b-tete { display: flex; gap: 9px; align-items: center; }
#m21-bulle img { width: 32px; height: 32px; image-rendering: pixelated; flex: none; }
#m21-bulle .m21-b-tete b { display: block; font-weight: normal; font-size: 15.5px; line-height: 1.2; }
#m21-bulle small { color: var(--m21-encre-pale); font-style: italic; font-size: 12px; }
#m21-bulle p { margin: 7px 0 6px; font-style: italic; color: #4a3a22; }
#m21-bulle .m21-b-l { display: flex; justify-content: space-between; gap: 16px; padding-top: 3px; border-top: 1px dotted var(--m21-trait); font-size: 13px; }
#m21-bulle .m21-b-l b { font-weight: normal; color: var(--m21-sepia-fonce); }

/* ---- l'encart des quantités */
.m21-qte-voile { position: absolute; inset: 0; background: rgba(40,30,15,.4); z-index: 8; }
.m21-qte { position: absolute; left: 50%; top: 50%; translate: -50% -50%; z-index: 9; width: min(410px, calc(100% - 28px)); padding: 14px 16px 12px; background: var(--m21-papier-clair); border: 1px solid rgba(90,70,40,.5); border-radius: var(--m21-rayon); box-shadow: 0 12px 34px rgba(0,0,0,.45), inset 0 0 34px rgba(120,90,40,.16); font-size: 14px; color: var(--m21-encre); animation: m21-fondu var(--m21-duree) ease-out both; }
.m21-qte .m21-q-tete { display: flex; gap: 10px; align-items: center; }
.m21-qte .m21-q-tete img { width: 36px; height: 36px; image-rendering: pixelated; flex: none; }
.m21-qte .m21-q-tete b { display: block; font-weight: normal; font-size: 16.5px; line-height: 1.2; }
.m21-qte .m21-q-tete small { color: var(--m21-encre-pale); font-style: italic; font-size: 12.5px; }
.m21-qte .m21-q-ligne { display: flex; align-items: center; gap: 6px; margin: 12px 0 6px; flex-wrap: wrap; }
.m21-qte .m21-q-ligne > span { margin-right: auto; }
.m21-qte .m21-q-n { width: 62px; padding: 4px 2px; text-align: center; font: 16px var(--m21-police); color: var(--m21-encre); background: rgba(255,255,255,.7); border: 1px solid rgba(90,70,40,.42); border-radius: var(--m21-rayon); }
.m21-qte .m21-q-r { width: 100%; margin: 4px 0 6px; accent-color: var(--m21-sepia); }
.m21-qte .m21-q-cases { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin: 12px 0 6px; }
.m21-qte .m21-q-cases button { padding: 6px 0; }
.m21-qte .m21-q-total { display: flex; justify-content: space-between; font-size: 15.5px; padding: 6px 0 2px; border-top: 1px solid var(--m21-trait); }
.m21-qte .m21-q-total b { font-weight: normal; color: var(--m21-sepia-fonce); }
.m21-qte .m21-q-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px; }
.m21-qte .m21-q-aide { margin-top: 8px; font: italic 12px var(--m21-police); color: var(--m21-encre-pale); }

/* ---- la confirmation */
#m21-confirmer { z-index: 25; }
#m21-confirmer .box { width: min(470px, calc(100vw - 32px)); }
#m21-confirmer p { margin: 0 0 4px; font-size: 15.5px; line-height: 1.55; color: var(--m21-encre); }

/* ---- les Options en onglets */
.m21-onglets { display: flex; flex-wrap: wrap; gap: 2px; margin: -2px 0 14px; border-bottom: 1px solid var(--m21-trait); }
.m21-onglets button { padding: 6px 14px 8px; background: none; border: none; border-bottom: 3px solid transparent; border-radius: var(--m21-rayon) var(--m21-rayon) 0 0; font: 16px var(--m21-police); color: var(--m21-encre-douce); cursor: pointer; transition: color var(--m21-duree), background-color var(--m21-duree), border-color var(--m21-duree); }
.m21-onglets button.on { color: var(--m21-encre); border-bottom-color: var(--m21-sepia); }
.m21-onglets button:not(.on):hover { background: var(--m21-sepia-voile); color: var(--m21-encre); }
#dlg-options .box { width: min(700px, calc(100vw - 32px)); }
#dlg-help .box { width: min(920px, calc(100vw - 32px)); }
#dlg-options .cols { min-height: 300px; align-content: start; }
#dlg-options .cols h4.m15-sec { display: none; }
.dialog .m21-note { grid-column: 1 / -1; margin: 6px 0 0; font: italic 13px/1.45 var(--m21-police); color: var(--m21-encre-pale); }

/* ---- les livres : sommaire et recherche */
#livre .m21-livre-outils { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin: 8px 2px 0; color: #e8dcc0; font: italic 13px var(--m21-police); }
#livre .m21-livre-outils select, #livre .m21-livre-outils input { padding: 4px 7px; background: #efe6cf; color: #33291d; border: 1px solid rgba(0,0,0,.35); border-radius: 3px; font: 13.5px var(--m21-police); font-style: normal; }
#livre .m21-livre-outils input { flex: 1 1 160px; padding-left: 27px; background: #efe6cf ${LOUPE} no-repeat 8px 50%; }
#livre .m21-livre-outils .m21-n { color: #d8c8a0; }
#livre .m21-livre-outils .m21-sel { color: #e8dcc0; }
#livre > .m21-x { top: 3px; right: 3px; width: 28px; height: 28px; font-size: 15px; color: #efe6cf; background: rgba(40,20,10,.6); border-color: rgba(239,230,207,.25); }
#livre > .m21-x:hover { background: rgba(40,20,10,.85); color: #fff; }
#livre .fiche.m21-trouve { background: rgba(255,220,120,.4); box-shadow: 0 0 0 2px rgba(194,112,28,.5); border-radius: 3px; }

/* ---- le wiki : tri et filtre */
.w15-tete .m21-sel { font-size: 13px; }

@media (max-width: 620px) {
  .m21-outils { gap: 5px 8px; }
  .m21-sel > span { display: none; }
}
`;
  let feuille = null;
  function installerStyle() {
    if (!feuille) { feuille = D.createElement('style'); feuille.id = 'm21-css'; feuille.textContent = STYLE; }
    if (D.head.lastElementChild !== feuille) D.head.appendChild(feuille);
  }

  // ================================================================ calques, focus
  const FOC = 'button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';
  const visible = (el) => { if (!el.getClientRects().length) return false; const s = getComputedStyle(el); return s.visibility !== 'hidden'; };
  function cibles(L) { return L ? $$q(FOC, L).filter((el) => !el.disabled && el.getAttribute('aria-hidden') !== 'true' && el.dataset.m21Nav !== 'non' && !el.closest('[data-m21-nav="non"], .m21-cache') && visible(el)) : []; }
  // le calque actif : la confirmation, la mort, un dialogue, le panneau (ou son encart), l'écran titre
  function calque() {
    const cf = D.getElementById('m21-confirmer');
    if (cf && cf.classList.contains('open')) return cf.querySelector('.box') || cf;
    const de = D.getElementById('death');
    if (de && de.classList.contains('open')) return de;
    const dl = $$q('.dialog.open').filter((d) => d.id !== 'm21-confirmer').pop();
    if (dl) return dl.querySelector('.box') || dl;
    if (typeof ui !== 'undefined' && ui.panel) {
      const p = $q(ui.panel);
      if (p && p.classList.contains('open')) return p.querySelector('.m21-qte, .bu-encart, .cm-encart') || p;
    }
    const m = D.getElementById('menu');
    if (m && m.classList.contains('open')) return m;
    return null;
  }
  const racine = (L) => (L ? L.closest('.pp-panel, .dialog, #menu, #death') || L : null);
  const signature = (el) => {
    const a = [];
    for (const at of el.attributes) if (at.name.startsWith('data-') && !at.name.startsWith('data-m21')) a.push(at.name + '=' + at.value);
    return el.tagName + (el.id ? '#' + el.id : '') + (a.length ? '[' + a.sort().join(',') + ']' : '|' + (el.className || '') + '|' + (el.textContent || '').trim().slice(0, 40));
  };
  // fait défiler les conteneurs pour montrer l'élément (sans jamais toucher à la page)
  function revele(el) {
    const k = K || 1;
    let p = el.parentElement;
    while (p && p !== D.body && p.id !== 'paper') {
      const s = getComputedStyle(p);
      if (/(auto|scroll)/.test(s.overflowY) && p.scrollHeight > p.clientHeight + 1) {
        const r = el.getBoundingClientRect(), q = p.getBoundingClientRect(), m = 8;
        if (r.top < q.top + m) p.scrollTop -= (q.top + m - r.top) / k;
        else if (r.bottom > q.bottom - m) p.scrollTop += Math.min(r.bottom - q.bottom + m, r.top - q.top - m) / k;
      }
      if (/(auto|scroll)/.test(s.overflowX) && p.scrollWidth > p.clientWidth + 1) {
        const r = el.getBoundingClientRect(), q = p.getBoundingClientRect(), m = 8;
        if (r.left < q.left + m) p.scrollLeft -= (q.left + m - r.left) / k;
        else if (r.right > q.right - m) p.scrollLeft += (r.right - q.right + m) / k;
      }
      p = p.parentElement;
    }
  }
  function focus(el) {
    if (!el) return;
    try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
    revele(el);
  }
  const FERMER = '.x, [data-close], [data-fermer], .m21-x, .m15-opt, .close, [data-cm-fermer]';
  // le premier élément à viser dans un calque
  function premier(L, items) {
    items = items || cibles(L);
    if (!items.length) return null;
    const R = racine(L), mem = nav.mem[R.id || ''];
    if (mem) { const el = items.find((x) => signature(x) === mem.sig); if (el) return el; }
    if (R.id === 'menu') return items.find((x) => x.id === 'm-play') || items[0];
    if (R.id === 'satchel') {
      const b = $q(':scope > .body', R);
      const corps = items.filter((x) => b && b.contains(x) && !x.classList.contains('m21-cherche') && !x.closest('.barcfg, .m21-sommaire, .m21-outils'));
      return corps[0] || items.find((x) => x.classList.contains('on') && x.dataset.m15o) || items[0];
    }
    const opts = items.filter((x) => x.closest('.opts'));
    if (opts.length) return opts[0];
    const corps = items.filter((x) => !x.matches(FERMER) && !x.closest('.tabs, .m21-onglets, .m21-outils, .m21-aide'));
    return corps[0] || items[0];
  }
  // le voisin dans une direction (les centres, l'écart de côté compte double et demi)
  function voisin(cur, items, dir) {
    const r0 = cur.getBoundingClientRect();
    const cx = (r0.left + r0.right) / 2, cy = (r0.top + r0.bottom) / 2;
    let best = null, bs = Infinity;
    for (const el of items) {
      if (el === cur) continue;
      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) continue;
      const x = (r.left + r.right) / 2, y = (r.top + r.bottom) / 2;
      let along, ortho;
      if (dir === 'bas' || dir === 'haut') {
        along = dir === 'bas' ? y - cy : cy - y;
        if (along <= 2 || (dir === 'bas' ? r.top < r0.top + 2 : r.bottom > r0.bottom - 2)) continue;
        ortho = r.right < r0.left ? r0.left - r.right : r.left > r0.right ? r.left - r0.right : 0;
      } else {
        along = dir === 'droite' ? x - cx : cx - x;
        if (along <= 2 || (dir === 'droite' ? r.left < r0.left + 2 : r.right > r0.right - 2)) continue;
        ortho = r.bottom < r0.top ? r0.top - r.bottom : r.top > r0.bottom ? r.top - r0.bottom : 0;
      }
      const sc = along + ortho * 2.5;
      if (sc < bs) { bs = sc; best = el; }
    }
    return best;
  }
  // un conteneur qui défile, autour de l'élément (ou dans le calque)
  function defilant(el, L) {
    let p = el && el.parentElement;
    while (p && L && L.contains(p)) {
      const s = getComputedStyle(p);
      if (/(auto|scroll)/.test(s.overflowY) && p.scrollHeight > p.clientHeight + 1) return p;
      p = p.parentElement;
    }
    if (!L) return null;
    for (const c of $$q('.body, .txt, .bu-liste, .w15-liste, .w15-fiche, .cm-arts, .cm-etals, .spread, .r15-corps', L)) if (c.scrollHeight > c.clientHeight + 1) return c;
    return null;
  }

  // ================================================================ la navigation (clavier seul, manette)
  const nav = {
    clavier: false, mem: {},
    mode(on) {
      if (on === this.clavier) return;
      this.clavier = on;
      H.classList.toggle('m21-clavier', on);
      if (on) { addEventListener('mousemove', souris, true); addEventListener('mousedown', souris, true); }
      else { removeEventListener('mousemove', souris, true); removeEventListener('mousedown', souris, true); manette.marquer(false); }
      majAides();
    },
    deplacer(L, dir) {
      const items = cibles(L), a = D.activeElement;
      if (!items.length) { const c = defilant(null, L); if (c) c.scrollTop += (dir === 'haut' ? -1 : dir === 'bas' ? 1 : 0) * 90; return; }
      const cur = a && L.contains(a) && items.includes(a) ? a : null;
      if (!cur) { focus(premier(L, items)); return; }
      const b = voisin(cur, items, dir);
      if (b) { focus(b); son('click'); return; }
      // rien plus loin : on fait défiler ce qui défile (une lettre, une fiche)
      const c = defilant(cur, L);
      if (c && (dir === 'haut' || dir === 'bas')) c.scrollTop += (dir === 'haut' ? -1 : 1) * 90 / (K || 1);
    },
    suivant(L, d) {
      const items = cibles(L);
      if (!items.length) return;
      const i = items.indexOf(D.activeElement);
      focus(items[i < 0 ? (d > 0 ? 0 : items.length - 1) : (i + d + items.length) % items.length]);
    },
    activer(el, maj) {
      if (!el) return;
      if (maj) { secondaire(el); return; }
      if (el.tagName === 'SELECT') { changerSelect(el, 1, true); return; }
      if (el.tagName === 'INPUT' && el.type === 'range') return;
      el.click();
    },
  };
  function souris(e) {
    if (e.type === 'mousemove' && Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0) < 3) return;
    nav.mode(false);
  }
  function changerSelect(el, d, boucle) {
    const n = el.options.length;
    if (!n) return;
    let i = el.selectedIndex + d;
    if (boucle) i = (i + n) % n; else i = Math.max(0, Math.min(n - 1, i));
    if (i === el.selectedIndex) return;
    el.selectedIndex = i;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    son('click');
  }
  function changerRange(el, d, grand) {
    const v0 = el.value;
    for (let i = 0; i < (grand ? 5 : 1); i++) { if (d > 0) el.stepUp(); else el.stepDown(); }
    if (el.value === v0) return;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
  // les onglets d'un calque : la barre M15 (sacoche), les onglets des Options, une barre .tabs à onglets
  function onglets(L, d) {
    const R = racine(L);
    if (R.id === 'satchel' && typeof menus !== 'undefined') {
      menus.voisin(d, false);
      const on = $q('#satchel .m15-o.on');
      if (on) { nav.mem.satchel = { sig: signature(on) }; focus(on); }
      return true;
    }
    let B = $$q('.m21-onglets button', R);
    if (B.length < 2) B = $$q(':scope > .tabs button', R).filter((b) => !b.matches(FERMER) && (b.dataset.tab || b.dataset.cmTab || b.getAttribute('role') === 'tab' || b.dataset.m15o));
    if (B.length < 2) return false;
    const i = Math.max(0, B.findIndex((b) => b.classList.contains('on')));
    const b = B[(i + d + B.length) % B.length];
    const sig = signature(b);
    b.click();
    const b2 = $$q(FOC, R).find((x) => signature(x) === sig);
    if (b2) focus(b2);
    return true;
  }
  function pages(L, d) {
    const R = racine(L);
    if (R.id === 'satchel' && typeof menus !== 'undefined') { menus.voisin(d, true); const on = $q('#satchel .m15-pages .on'); if (on) { nav.mem.satchel = { sig: signature(on) }; focus(on); } return; }
    if (R.id === 'livre' && typeof livres !== 'undefined') { livres.tourner(d); return; }
    const c = defilant(D.activeElement, L);
    if (c) c.scrollTop += d * c.clientHeight * 0.85;
  }
  // l'action secondaire (Maj+Entrée, clic droit, X) : les quantités, la barre d'outils, sinon Maj+clic
  function secondaire(el) {
    const R = racine(el);
    if (!R) return;
    if (R.id === 'store' && (el.dataset.get || el.dataset.put)) { qteCoffre(el); return; }
    // (la boutique : l'encart du marchand, avec sa quantité — jamais un achat par cinq sans le voir)
    if (R.id === 'shop' && (el.dataset.buy || el.dataset.sell)) { el.click(); return; }
    if (R.id === 'satchel' && (el.dataset.it || el.dataset.tok)) { choisirCase(el.dataset.it || el.dataset.tok); return; }
    if (R.id === 'satchel' && el.dataset.slot !== undefined && typeof bar !== 'undefined') { bar.assign(+el.dataset.slot, null); ui.renderSatchel(); return; }
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, shiftKey: true }));
  }
  const saisieDe = (a) => !!a && (a.tagName === 'TEXTAREA' || a.isContentEditable || (a.tagName === 'INPUT' && /^(text|search|number|email|password|)$/.test(a.type)));

  function clavier(e) {
    if (typeof game === 'undefined' || typeof ui === 'undefined') return;
    const c = e.code, a = D.activeElement;
    // nos encarts d'abord (avant le jeu, qui fermerait le panneau)
    if (qte.el && qte.el.isConnected) { if (qte.clavier(e)) return; }
    else if (qte.el) qte.fermer();
    if (conf.fin && (c === 'Escape')) { e.preventDefault(); e.stopImmediatePropagation(); conf.fin(false); return; }
    const L = calque();
    if (!L) return;
    const navTouche = /^(Arrow|Page|Home$|End$|Tab$|Enter$|NumpadEnter$)/.test(c);
    if (navTouche && e.isTrusted) { nav.mode(true); manette.marquer(false); }
    if (e.defaultPrevented) return;
    const R = racine(L);
    const saisie = saisieDe(a) && L.contains(a);
    // Échap : d'un cran (la recherche, une fiche du wiki) avant de fermer
    if (c === 'Escape') {
      if (saisie) { e.preventDefault(); e.stopImmediatePropagation(); if (a.classList.contains('m21-cherche') && a.value) { a.value = ''; a.dispatchEvent(new Event('input', { bubbles: true })); } else a.blur(); return; }
      // une fiche du wiki ouverte : on revient à la liste (la fiche reste choisie dans la liste)
      const W = typeof decouvertes !== 'undefined' ? decouvertes : null;
      if (W && W.vue && W.vue.id && W.cible && R.contains(W.cible) && $q('.w15-fiche h3', R)) {
        e.preventDefault(); e.stopImmediatePropagation();
        const id = W.vue.id;
        W.vue.id = null; W.rendre(W.cible); son('page');
        const l = $q(`.w15-e[data-w15="${CSS.escape(id)}"]`, R) || $q('.w15-gt', R);
        if (l && nav.clavier) focus(l);
        return;
      }
      return;
    }
    // chercher : Ctrl+F ou /
    if ((c === 'KeyF' && (e.ctrlKey || e.metaKey)) || (c === 'Slash' && !saisie && !e.ctrlKey)) {
      const s = $q('.m21-cherche, .w15-cherche', R);
      if (s && visible(s)) { e.preventDefault(); e.stopImmediatePropagation(); nav.mode(true); focus(s); try { s.select(); } catch (er) { /* rien */ } }
      return;
    }
    if (!navTouche) return;
    if (c === 'Tab') {
      e.preventDefault(); e.stopImmediatePropagation();
      if (saisie || !onglets(L, e.shiftKey ? -1 : 1)) nav.suivant(L, e.shiftKey ? -1 : 1);
      return;
    }
    if (saisie) {
      if (a.closest('.m21-livre-outils') && (c === 'Enter' || c === 'NumpadEnter')) return;   // (le livre : Entrée cherche la page suivante)
      if (c === 'ArrowDown' || ((c === 'Enter' || c === 'NumpadEnter') && (a.classList.contains('m21-cherche') || a.classList.contains('w15-cherche')))) {
        e.preventDefault(); e.stopImmediatePropagation();
        const items = cibles(L), i = items.indexOf(a);
        const apres = items.slice(i + 1).find((x) => !x.closest('.m21-outils, .w15-tete'));
        if (apres) focus(apres);
      } else if (c === 'ArrowUp') { e.preventDefault(); nav.deplacer(L, 'haut'); }
      return;
    }
    if (c === 'PageUp' || c === 'PageDown') { e.preventDefault(); e.stopImmediatePropagation(); pages(L, c === 'PageUp' ? -1 : 1); return; }
    if (c === 'Home' || c === 'End') { const items = cibles(L); if (items.length) { e.preventDefault(); focus(c === 'Home' ? premier(L, items) : items[items.length - 1]); } return; }
    if (c === 'Enter' || c === 'NumpadEnter') {
      if (a && L.contains(a) && a !== L) { e.preventDefault(); e.stopImmediatePropagation(); nav.activer(a, e.shiftKey); }
      else { const p = premier(L); if (p) { e.preventDefault(); focus(p); } }
      return;
    }
    // les flèches
    const dir = { ArrowUp: 'haut', ArrowDown: 'bas', ArrowLeft: 'gauche', ArrowRight: 'droite' }[c];
    if (!dir) return;
    const horiz = dir === 'gauche' || dir === 'droite';
    if (R.hasAttribute('data-m21-fleches') || (R.id === 'livre' && horiz)) return;
    if (horiz && e.shiftKey && R.id === 'satchel') return;          // Maj+← → : les pages (M15)
    if (a && L.contains(a)) {
      if (a.tagName === 'SELECT') { e.preventDefault(); if (horiz) { changerSelect(a, dir === 'droite' ? 1 : -1, false); return; } }
      else if (a.tagName === 'INPUT' && a.type === 'range') { e.preventDefault(); if (horiz) { changerRange(a, dir === 'droite' ? 1 : -1, e.shiftKey); return; } }
    }
    e.preventDefault();
    nav.deplacer(L, dir);
  }
  addEventListener('keydown', (e) => { try { clavier(e); } catch (err) { console.error('m21', err); } }, true);

  // ce qui a le focus : on s'en souvient (pour le retrouver quand le panneau se redessine) ; l'infobulle au clavier
  D.addEventListener('focusin', (e) => {
    const t = e.target;
    if (!t || !t.closest) return;
    const R = t.closest('#paper > .pp-panel, .dialog, #menu, #death');
    if (!R) return;
    if (!t.closest('.m21-qte, .bu-encart, .cm-encart')) nav.mem[R.id || ''] = { sig: signature(t) };
    if (R.id === 'satchel' && typeof ui !== 'undefined' && (t.dataset.it || t.dataset.tok)) ui.satHover = t.dataset.it || t.dataset.tok;
    if (nav.clavier) bulle.viser(t, true);
  }, true);
  D.addEventListener('focusout', (e) => {
    const t = e.target;
    if (t && t.dataset && typeof ui !== 'undefined' && (t.dataset.it || t.dataset.tok) && ui.satHover === (t.dataset.it || t.dataset.tok)) ui.satHover = null;
    if (bulle.cible === t) bulle.cacher();
  }, true);
  // après un redessin (le focus est perdu) : le même élément, ou le premier
  function retrouver() {
    if (!nav.clavier) return;
    const a = D.activeElement;
    if (a && a !== D.body && a.isConnected && visible(a)) return;
    const L = calque();
    if (!L) return;
    const items = cibles(L);
    const R = racine(L), mem = nav.mem[R.id || ''];
    const el = (mem && items.find((x) => signature(x) === mem.sig)) || premier(L, items);
    if (el) focus(el);
  }

  // ================================================================ la manette (Gamepad API)
  const BOUTONS = ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'Select', 'Start', 'L3', 'R3', 'haut', 'bas', 'gauche', 'droite'];
  const DIRS = new Set(['haut', 'bas', 'gauche', 'droite']);
  const manette = {
    n: 0, prec: {}, rep: {}, ecouteurs: new Set(), demandes: new Set(), raf: 0, iv: 0, _active: false, t0: 0,
    connectee() { return this.n > 0; },
    active() { return this._active; },
    marquer(on) { if (on === this._active) return; this._active = on; H.classList.toggle('m21-manette', on); majAides(); },
    pad() {
      let L = [];
      try { L = navigator.getGamepads ? navigator.getGamepads() : []; } catch (e) { return null; }
      let best = null;
      for (const g of L) if (g && g.connected) { if (g.mapping === 'standard') return g; best = best || g; }
      return best;
    },
    etat() {
      const g = this.pad();
      if (!g) return null;
      const b = {};
      BOUTONS.slice(0, 12).forEach((k, i) => { const x = g.buttons[i]; b[k] = x ? (x.value || (x.pressed ? 1 : 0)) : 0; });
      ['haut', 'bas', 'gauche', 'droite'].forEach((k, i) => { const x = g.buttons[12 + i]; b[k] = x && x.pressed ? 1 : 0; });
      return { boutons: b, gauche: [g.axes[0] || 0, g.axes[1] || 0], droite: [g.axes[2] || 0, g.axes[3] || 0] };
    },
    ecouter(fn) { this.ecouteurs.add(fn); return () => this.ecouteurs.delete(fn); },
    demander(cle, on) { if (on) this.demandes.add(cle); else this.demandes.delete(cle); this.boucle(); },
    vibrer(ms, fort = 0.6, faible = 0.3) {
      if (!settings.m21Vibrer) return;
      const g = this.pad(), v = g && g.vibrationActuator;
      try { if (v && v.playEffect) v.playEffect('dual-rumble', { duration: ms, strongMagnitude: fort, weakMagnitude: faible }); } catch (e) { /* rien */ }
    },
    glyphe(b) { return glyphe(b); },
    // la boucle : à chaque image si un menu est ouvert (ou si on la demande), sinon dix fois par seconde
    boucle() {
      const vif = this.n > 0 && (this.demandes.size > 0 || !!calque());
      if (this.n <= 0) { if (this.raf) cancelAnimationFrame(this.raf); if (this.iv) clearInterval(this.iv); this.raf = 0; this.iv = 0; return; }
      if (vif && !this.raf) {
        if (this.iv) { clearInterval(this.iv); this.iv = 0; }
        const f = (t) => { this.raf = 0; this.tick(t); if (this.n > 0 && (this.demandes.size > 0 || calque())) this.raf = requestAnimationFrame(f); else this.boucle(); };
        this.raf = requestAnimationFrame(f);
      } else if (!vif && !this.raf && !this.iv) {
        this.iv = setInterval(() => { this.tick(performance.now()); if (this.demandes.size > 0 || calque()) { clearInterval(this.iv); this.iv = 0; this.boucle(); } }, 100);
      }
    },
    tick(now) {
      const g = this.pad();
      if (!g) return;
      const B = (i) => { const b = g.buttons[i]; return !!b && (b.pressed || b.value > 0.5); };
      const ax = g.axes[0] || 0, ay = g.axes[1] || 0;
      const st = {};
      BOUTONS.slice(0, 12).forEach((k, i) => { st[k] = B(i); });
      st.haut = B(12) || ay < -0.55; st.bas = B(13) || ay > 0.55; st.gauche = B(14) || ax < -0.55; st.droite = B(15) || ax > 0.55;
      const dt = this.t0 ? Math.min(0.1, (now - this.t0) / 1000) : 0.016;
      this.t0 = now;
      for (const k of BOUTONS) {
        if (st[k] !== !!this.prec[k]) {
          for (const fn of this.ecouteurs) { try { fn({ bouton: k, appui: st[k] }); } catch (e) { console.error('m21 manette', e); } }
          if (st[k]) { this.rep[k] = now + 380; this.presser(k); } else delete this.rep[k];
        } else if (st[k] && DIRS.has(k) && now >= (this.rep[k] || Infinity)) { this.rep[k] = now + 110; this.presser(k); }
      }
      this.prec = st;
      // le stick droit fait défiler
      const ry = g.axes[3] || 0;
      if (Math.abs(ry) > 0.25) { const L = calque(); const c = L && defilant(D.activeElement, L); if (c) c.scrollTop += ry * 900 * dt / (K || 1); }
    },
    presser(k) {
      const L = calque();
      if (!L) {
        // en jeu : Start, le menu ; Select, le menu Tab
        if (typeof game === 'undefined' || !game.world || game.dying) return;
        // (pendant la pêche, la manette est au pêcheur : Select n'ouvre rien ; Start met toujours en pause)
        if (k === 'Select' && typeof p21 !== 'undefined' && p21.actif && p21.actif()) return;
        if (k === 'Start') { this.marquer(true); nav.mode(true); touche('Escape'); }
        else if (k === 'Select' && game.kind === 'farm' && game.mode === 'play') { this.marquer(true); nav.mode(true); touche('Tab'); }
        return;
      }
      this.marquer(true);
      nav.mode(true);
      const R = racine(L);
      switch (k) {
        case 'haut': touche('ArrowUp'); break;
        case 'bas': touche('ArrowDown'); break;
        case 'gauche': touche('ArrowLeft'); break;
        case 'droite': touche('ArrowRight'); break;
        case 'A': if (cibles(L).length) touche('Enter'); else touche('Space'); break;
        case 'B': case 'Start': touche('Escape'); break;
        case 'X': touche('Enter', { shift: true }); break;
        case 'Y': { const s = $q('.m21-cherche, .w15-cherche', R); if (s && visible(s)) focus(s); else if (R.id === 'butin') touche('KeyT'); break; }
        case 'LB': touche('Tab', { shift: true }); break;
        case 'RB': touche('Tab'); break;
        case 'LT': touche('PageUp'); break;
        case 'RT': touche('PageDown'); break;
        case 'Select': if (R.id === 'satchel') ui.close(); else touche('Escape'); break;
        default: break;
      }
    },
  };
  const NOMS = { ArrowUp: 'ArrowUp', ArrowDown: 'ArrowDown', ArrowLeft: 'ArrowLeft', ArrowRight: 'ArrowRight', Enter: 'Enter', Escape: 'Escape', Tab: 'Tab', PageUp: 'PageUp', PageDown: 'PageDown', Space: ' ', KeyT: 't', KeyE: 'e' };
  function touche(code, o) {
    o = o || {};
    const a = D.activeElement, t = a && a !== D.body && a.isConnected ? a : D.body;
    const init = { code, key: NOMS[code] || code, shiftKey: !!o.shift, bubbles: true, cancelable: true };
    t.dispatchEvent(new KeyboardEvent('keydown', init));
    (D.activeElement && D.activeElement.isConnected ? D.activeElement : D.body).dispatchEvent(new KeyboardEvent('keyup', init));
  }
  addEventListener('gamepadconnected', () => { manette.n++; manette.boucle(); });
  addEventListener('gamepaddisconnected', () => { manette.n = Math.max(0, manette.n - 1); if (!manette.pad()) manette.n = 0; manette.boucle(); if (!manette.n) manette.marquer(false); });

  // les signes des boutons et des touches
  function glyphe(b) {
    if (b === 'A' || b === 'B' || b === 'X' || b === 'Y') return `<span class="m21-touche rond b-${b}">${b}</span>`;
    if (/^(LB|RB|LT|RT|L3|R3)$/.test(b)) return `<span class="m21-touche long">${b}</span>`;
    if (b === 'Start') return '<span class="m21-touche long">☰</span>';
    if (b === 'Select') return '<span class="m21-touche long">⧉</span>';
    if (b === 'croix') return '<span class="m21-touche">✛</span>';
    return `<span class="m21-touche">${esc(b)}</span>`;
  }
  const NOMS_TOUCHES = { Space: 'Espace', Enter: 'Entrée', Escape: 'Échap', Tab: 'Tab', ShiftLeft: 'Maj', ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', PageUp: 'Pg↑', PageDown: 'Pg↓', Mouse0: 'Clic', Mouse2: 'Clic droit' };
  function nomTouche(code) { if (NOMS_TOUCHES[code]) return NOMS_TOUCHES[code]; const m = /^(Key|Digit|Numpad)(.+)$/.exec(code || ''); return m ? m[2] : String(code || ''); }
  function toucheHTML(code, bouton) { return manette.active() && bouton ? glyphe(bouton) : `<span class="m21-touche">${esc(nomTouche(code))}</span>`; }

  // ================================================================ la ligne des raccourcis
  function aideHTML(R) {
    const M = manette.active();
    const k = (cl, ma) => (M ? ma.split(' ').map(glyphe).join('') : cl.split(' ').map((x) => `<span class="m21-touche">${esc(x)}</span>`).join(''));
    const L = [];
    const tabs = R.id === 'satchel' || $$q('.m21-onglets button', R).length > 1 || $$q(':scope > .tabs button', R).filter((b) => !b.matches(FERMER) && (b.dataset.tab || b.dataset.cmTab)).length > 1;
    L.push([k('↑ ↓ ← →', 'croix'), 'se déplacer']);
    L.push([k('Entrée', 'A'), 'valider']);
    L.push([k('Échap', 'B'), R.id === 'menu' ? 'reprendre' : 'refermer']);
    if (tabs) L.push([k('Tab', 'LB RB'), 'onglets']);
    if (R.id === 'satchel' && $q('.m15-pages', R)) L.push([k('Pg↑ Pg↓', 'LT RT'), 'pages']);
    if (R.id === 'livre') L.push([k('← →', 'LT RT'), 'tourner les pages']);
    if (R.id === 'store') L.push([k('Maj+Entrée', 'X'), 'quantité']);
    if (R.id === 'satchel' && $q('[data-it]', R)) L.push([k('Maj+Entrée', 'X'), 'barre d’outils']);
    if ($q('.m21-cherche, .w15-cherche', R)) L.push([k('Ctrl+F', 'Y'), 'chercher']);
    return L.map(([t, x]) => `<span>${t} ${esc(x)}</span>`).join('');
  }
  function poserAide(R) {
    if (!R || R.id === 'fondterm' || R.id === 'admin') return;
    let a = $q(':scope > .m21-aide', R);
    const html = aideHTML(R);
    if (!a) { a = D.createElement('div'); a.className = 'm21-aide'; a.setAttribute('aria-hidden', 'true'); R.appendChild(a); }
    if (a._h !== html) { a.innerHTML = html; a._h = html; }
  }
  function majAides() {
    const L = calque();
    if (!L) return;
    const R = racine(L);
    if (R.classList.contains('dialog')) poserAide(R.querySelector('.box') || R);
    else poserAide(R);
  }

  // ================================================================ l'infobulle d'objet
  const bulle = {
    el: null, cible: null, t: 0,
    idDe(t) { const d = t.dataset; return d.it || d.buy || d.sell || d.get || d.put || null; },
    viser(t, tout) {
      if (!settings.m21Bulles || !t || !t.dataset) return;
      const id = this.idDe(t);
      if (!(id && typeof ITEMS !== 'undefined' && ITEMS[id]) && !t.dataset.m21Info) { if (this.cible) this.cacher(); return; }
      clearTimeout(this.t);
      if (tout) this.montrer(t); else this.t = setTimeout(() => this.montrer(t), 380);
    },
    montrer(t) {
      if (!t.isConnected || !calque()) return;
      const pap = D.getElementById('paper');
      if (!pap || !pap.contains(t)) return;
      if (!this.el || !this.el.isConnected) { this.el = D.createElement('div'); this.el.id = 'm21-bulle'; this.el.setAttribute('role', 'tooltip'); pap.appendChild(this.el); }
      const id = this.idDe(t);
      this.el.innerHTML = t.dataset.m21Info ? `<p style="margin:0">${esc(t.dataset.m21Info)}</p>` : infoObjet(id, t);
      this.cible = t;
      const k = K || 1, r = t.getBoundingClientRect(), W = innerWidth, Hh = innerHeight;
      this.el.style.left = '0px'; this.el.style.top = '0px';
      const b = this.el.getBoundingClientRect();
      let x = r.right + 10, y = r.top;
      if (x + b.width > W - 8) x = r.left - b.width - 10;
      if (x < 8) { x = Math.max(8, Math.min(W - b.width - 8, r.left)); y = r.bottom + 8; if (y + b.height > Hh - 8) y = r.top - b.height - 8; }
      y = Math.max(8, Math.min(Hh - b.height - 8, y));
      this.el.style.left = (x / k) + 'px'; this.el.style.top = (y / k) + 'px';
      this.el.classList.add('on');
    },
    cacher() { clearTimeout(this.t); this.cible = null; if (this.el) this.el.classList.remove('on'); },
  };
  function infoObjet(id, t) {
    const it = typeof ITEMS !== 'undefined' && ITEMS[id];
    if (!it) return '';
    const cat = (typeof ITEM_CAT_NAMES !== 'undefined' && ITEM_CAT_NAMES[it.cat]) || '';
    let desc = '';
    try { desc = typeof butin !== 'undefined' && butin.description ? butin.description(id) : (it.desc || ''); } catch (e) { desc = it.desc || ''; }
    let n = 0;
    try { n = farm.s ? farm.count(id) : 0; } catch (e) { /* rien */ }
    let rev = 0;
    try { rev = ui.revente ? ui.revente(id) : 0; } catch (e) { /* rien */ }
    const L = [];
    if (t && t.dataset.get !== undefined && typeof ui !== 'undefined' && ui.store && ui.store.store) L.push(['Dans le coffre', ui.store.store[id] || 0]);
    L.push(['Dans la sacoche', n]);
    if (rev > 0) L.push(['Se revend', rev > 1 ? `jusqu’à ${rev} pièces` : 'une pièce']);
    return `<div class="m21-b-tete"><img src="${iconURL(id)}" alt=""><div><b>${esc(itemName(id))}</b>${cat ? `<small>${esc(cat)}</small>` : ''}</div></div>${desc ? `<p>${esc(desc)}</p>` : ''}${L.map(([a, b]) => `<div class="m21-b-l"><span>${esc(a)}</span><b>${esc(String(b))}</b></div>`).join('')}`;
  }

  // ================================================================ l'encart des quantités
  const qte = {
    el: null, voile: null, o: null, k: 1,
    ouvrir(o) {
      const P = typeof ui !== 'undefined' && ui.panel ? $q(ui.panel) : null;
      if (!P) return false;
      this.fermer();
      bulle.cacher();
      this.o = o;
      const min = o.min === undefined ? 1 : o.min, max = Math.max(min, o.max | 0);
      this.k = Math.max(min, Math.min(max, o.valeur === undefined ? 1 : o.valeur));
      const v = D.createElement('div'); v.className = 'm21-qte-voile'; v.onclick = () => this.fermer();
      const d = D.createElement('div'); d.className = 'm21-qte'; d.setAttribute('role', 'dialog');
      const tete = `<div class="m21-q-tete">${o.id ? `<img src="${iconURL(o.id)}" alt="">` : ''}<div><b>${esc(o.titre || (o.id ? itemName(o.id) : ''))}</b>${o.sous ? `<small>${esc(o.sous)}</small>` : ''}</div></div>`;
      if (o.cases) {
        d.innerHTML = `${tete}<div class="m21-q-cases">${o.cases.map((c, i) => `<button class="m21-btn${c.on ? ' prim' : ''}" data-qc="${i}">${esc(c.nom)}</button>`).join('')}</div>
          <div class="m21-q-actions"><button class="m21-btn" data-q="non">Annuler</button></div>`;
        d.querySelectorAll('[data-qc]').forEach((b) => (b.onclick = () => { const c = o.cases[+b.dataset.qc]; this.fermer(); if (c && c.fn) c.fn(); }));
      } else {
        d.innerHTML = `${tete}
          <div class="m21-q-ligne"><span>Combien ?</span><button class="m21-btn" data-q="-" aria-label="Un de moins">−</button><input class="m21-q-n" type="text" inputmode="numeric" value="${this.k}" aria-label="Quantité"><button class="m21-btn" data-q="+" aria-label="Un de plus">+</button><button class="m21-btn" data-q="max">Tout (${max})</button></div>
          <input class="m21-q-r" type="range" min="${min}" max="${max}" step="1" value="${this.k}" aria-label="Quantité" data-m21-nav="non">
          ${o.prix ? '<div class="m21-q-total"><span>Total</span><b></b></div>' : ''}
          <div class="m21-q-actions"><button class="m21-btn" data-q="non">Annuler</button><button class="m21-btn prim" data-q="oui">${esc(o.verbe || 'Valider')}</button></div>
          <div class="m21-q-aide">← → un de plus ou de moins · ↑ ↓ dix · Entrée : valider · Échap : annuler</div>`;
        d.querySelector('[data-q="-"]').onclick = () => this.ajuster(-1);
        d.querySelector('[data-q="+"]').onclick = () => this.ajuster(1);
        d.querySelector('[data-q="max"]').onclick = () => this.poser(max);
        d.querySelector('[data-q="oui"]').onclick = () => this.valider();
        const inp = d.querySelector('.m21-q-n');
        inp.oninput = () => { const x = parseInt(inp.value.replace(/\D/g, ''), 10); if (x > 0) this.poser(x, true); };
        inp.onchange = () => { inp.value = this.k; };
        const rg = d.querySelector('.m21-q-r');
        rg.oninput = () => this.poser(+rg.value);
      }
      d.querySelector('[data-q="non"]').onclick = () => this.fermer();
      P.appendChild(v); P.appendChild(d);
      this.el = d; this.voile = v;
      this.poser(this.k, true);
      son('page');
      const f = d.querySelector('[data-q="oui"]') || d.querySelector('.m21-btn.prim') || d.querySelector('[data-qc]');
      if (f) focus(f);
      return true;
    },
    poser(k, garderSaisie) {
      const o = this.o, d = this.el;
      if (!o || !d || o.cases) return;
      const min = o.min === undefined ? 1 : o.min, max = Math.max(min, o.max | 0);
      this.k = Math.max(min, Math.min(max, Math.round(k)));
      const inp = d.querySelector('.m21-q-n'), rg = d.querySelector('.m21-q-r'), tot = d.querySelector('.m21-q-total b');
      if (inp && !garderSaisie) inp.value = this.k; else if (inp && D.activeElement !== inp) inp.value = this.k;
      if (rg) rg.value = this.k;
      if (tot) { const t = this.k * o.prix; tot.textContent = t > 1 ? `${t} pièces` : t === 1 ? 'Une pièce' : 'Rien'; }
    },
    ajuster(d) { this.poser(this.k + d); son('click'); },
    valider() { const o = this.o, k = this.k; this.fermer(); if (o && o.ok && k > 0) o.ok(k); },
    fermer() {
      if (this.el) this.el.remove();
      if (this.voile) this.voile.remove();
      const ok = !!this.el;
      this.el = null; this.voile = null; this.o = null;
      if (ok && nav.clavier) queueMicrotask(retrouver);
    },
    // ← → ±1, ↑ ↓ ±10, Entrée, Échap ; vrai si la touche est prise
    clavier(e) {
      const c = e.code, a = D.activeElement;
      const prendre = () => { e.preventDefault(); e.stopImmediatePropagation(); };
      if (c === 'Escape') { prendre(); this.fermer(); return true; }
      if (this.o && this.o.cases) {
        if (c === 'Tab' || /^Arrow/.test(c)) { prendre(); nav.mode(true); const B = $$q('button', this.el), i = B.indexOf(a); const d = c === 'ArrowLeft' || c === 'ArrowUp' || (c === 'Tab' && e.shiftKey) ? -1 : 1; focus(B[i < 0 ? 0 : (i + d + B.length) % B.length]); return true; }
        if (c === 'Enter' || c === 'NumpadEnter') { prendre(); if (a && this.el.contains(a)) a.click(); return true; }
        return false;
      }
      const saisie = a && a.classList && a.classList.contains('m21-q-n');
      if (c === 'Enter' || c === 'NumpadEnter') { prendre(); if (a && a.dataset && a.dataset.q === 'non') this.fermer(); else this.valider(); return true; }
      if (c === 'ArrowLeft' || c === 'ArrowRight') { if (saisie && e.isTrusted) return false; prendre(); this.ajuster(c === 'ArrowRight' ? (e.shiftKey ? 10 : 1) : (e.shiftKey ? -10 : -1)); return true; }
      if (c === 'ArrowUp' || c === 'ArrowDown') { prendre(); this.ajuster(c === 'ArrowUp' ? 10 : -10); return true; }
      if (c === 'Tab') { prendre(); nav.mode(true); const B = cibles(this.el), i = B.indexOf(a); focus(B[i < 0 ? 0 : (i + (e.shiftKey ? -1 : 1) + B.length) % B.length]); return true; }
      if (c === 'Home' || c === 'End') { prendre(); this.poser(c === 'Home' ? 0 : 1e9); return true; }
      return false;
    },
  };
  // le coffre : prendre ou déposer un nombre choisi (le bouton d'origine, appelé autant de fois, sans redessiner entre deux)
  function qteCoffre(b) {
    const get = b.dataset.get !== undefined, id = get ? b.dataset.get : b.dataset.put;
    const src = get ? (ui.store && ui.store.store) : farm.s.inv;
    const max = (src && src[id]) || 0, f0 = b.onclick;
    if (!f0 || max <= 0) return;
    if (max === 1) { f0.call(b, { shiftKey: false, ctrlKey: false, preventDefault() {}, stopPropagation() {} }); return; }
    qte.ouvrir({ id, sous: get ? 'Prendre dans le coffre' : 'Déposer', max, valeur: max, verbe: get ? 'Prendre' : 'Déposer', ok: (n) => {
      const R = ui.renderStore;
      ui.renderStore = function () {};
      try {
        if (n >= max) f0.call(b, { shiftKey: true, ctrlKey: false, preventDefault() {}, stopPropagation() {} });
        else for (let i = 0; i < n; i++) f0.call(b, { shiftKey: false, ctrlKey: false, preventDefault() {}, stopPropagation() {} });
      } catch (e) { console.error('m21 coffre', e); } finally { ui.renderStore = R; }
      if (ui.panel === '#store') ui.renderStore();
      son('pop');
    } });
  }
  // la sacoche : mettre un objet dans la barre d'outils (sans glisser)
  function choisirCase(id) {
    if (typeof bar === 'undefined' || !farm.s || !Array.isArray(farm.s.bar)) return;
    const nom = typeof BAR_TOKENS !== 'undefined' && BAR_TOKENS[id] ? BAR_TOKENS[id].name : itemName(id);
    qte.ouvrir({ id: ITEMS[id] ? id : null, titre: nom, sous: 'Dans quelle case de la barre d’outils ?', cases: farm.s.bar.map((tok, i) => ({ nom: String(i + 1), on: tok === id, fn: () => { bar.assign(i, id); ui.renderSatchel(); son('click'); } })) });
  }

  // ================================================================ la confirmation (dans le style du jeu, à la manette)
  const conf = { fin: null };
  function confirmer(o) {
    o = o || {};
    return new Promise((res) => {
      if (conf.fin) conf.fin(false);
      let d = D.getElementById('m21-confirmer');
      if (!d) { d = D.createElement('div'); d.id = 'm21-confirmer'; d.className = 'screen dialog'; D.body.appendChild(d); }
      d.innerHTML = `<div class="box" role="alertdialog"><h2>${esc(o.titre || 'Êtes-vous sûr ?')}</h2>${o.texte ? `<p>${esc(o.texte)}</p>` : ''}<div class="actions"><button data-c="non">${esc(o.non || 'Non')}</button><button class="primary" data-c="oui">${esc(o.oui || 'Oui')}</button></div></div>`;
      d.classList.add('open');
      conf.fin = (v) => { conf.fin = null; d.classList.remove('open'); manette.boucle(); if (nav.clavier) queueMicrotask(retrouver); res(!!v); };
      d.querySelector('[data-c="oui"]').onclick = () => conf.fin && conf.fin(true);
      d.querySelector('[data-c="non"]').onclick = () => conf.fin && conf.fin(false);
      son('click');
      manette.boucle();
      if (nav.clavier) focus(d.querySelector('[data-c="non"]'));
      poserAide(d.querySelector('.box'));
    });
  }

  // ================================================================ recherche, tri, filtre d'une liste
  const ETATS = {};
  function outils(cont, o) {
    if (!cont || !o) return null;
    const items = typeof o.items === 'function' ? o.items(cont) : $$q(o.items, cont);
    if (items.length < (o.min || 0)) return null;
    const cle = o.cle || 'liste';
    const tris = o.tris || [];
    const place = typeof o.place === 'function' ? o.place(cont) : o.place;
    const st = ETATS[cle] || (ETATS[cle] = { q: '', tri: tris[0] ? tris[0].id : '', f: '' });
    const filtres = typeof o.filtres === 'function' ? o.filtres(items) : (o.filtres || []);
    if (st.f && !filtres.some((f) => f.id === st.f)) st.f = '';
    const hote = place ? place.parentNode : cont;
    const vieille = hote && $q(`:scope > .m21-outils[data-m21-cle="${cle}"]`, hote);
    if (vieille) vieille.remove();
    // les titres de groupe (ceux qui précèdent une liste de ces éléments), relevés avant tout déplacement
    const tetes = o.groupes ? $$q(o.groupes, cont).filter((h) => h.nextElementSibling && items.some((el) => h.nextElementSibling.contains(el))) : [];
    const barre = D.createElement('div');
    barre.className = 'm21-outils';
    barre.dataset.m21Cle = cle;
    barre.innerHTML = `<input type="text" class="m21-cherche" role="searchbox" placeholder="${esc(o.placeholder || 'Chercher…')}" value="${esc(st.q)}" aria-label="Chercher" spellcheck="false" autocomplete="off">`
      + (tris.length > 1 ? `<label class="m21-sel"><span>Trier</span><select class="m21-tri" aria-label="Trier">${tris.map((t) => `<option value="${esc(t.id)}"${t.id === st.tri ? ' selected' : ''}>${esc(t.nom)}</option>`).join('')}</select></label>` : '')
      + (filtres.length ? `<label class="m21-sel"><span>Montrer</span><select class="m21-filtre" aria-label="Montrer"><option value="">Tout</option>${filtres.map((f) => `<option value="${esc(f.id)}"${f.id === st.f ? ' selected' : ''}>${esc(f.nom)}</option>`).join('')}</select></label>` : '')
      + '<span class="m21-n"></span>';
    if (place) place.parentNode.insertBefore(barre, place); else cont.insertBefore(barre, cont.firstChild);
    for (const el of items) el._m21t = norm(o.texte ? o.texte(el) : el.textContent);
    // le tri : chaque liste dans son parent, ou toutes à plat dans le premier (o.plat)
    const T = tris.find((t) => t.id === st.tri);
    if (T && T.cle) {
      const val = new Map(items.map((el) => [el, T.cle(el)]));
      const cmp = (a, b) => { const x = val.get(a), y = val.get(b); const r = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'fr'); return T.desc ? -r : r; };
      if (o.plat) {
        const g0 = items[0].parentNode;
        for (const el of items.slice().sort(cmp)) g0.appendChild(el);
        for (const h of tetes) h.classList.add('m21-cache');
      } else {
        // chaque liste reste à sa place dans son parent (on range devant une ancre posée au premier élément)
        const par = new Map();
        for (const el of items) { const p = el.parentNode; if (!par.has(p)) par.set(p, []); par.get(p).push(el); }
        for (const [p, L] of par) {
          const ancre = D.createComment('m21');
          p.insertBefore(ancre, L[0]);
          for (const el of L.slice().sort(cmp)) p.insertBefore(el, ancre);
          ancre.remove();
        }
      }
    }
    const nEl = barre.querySelector('.m21-n');
    let vide = null;
    const appliquer = () => {
      const q = norm(st.q), F = filtres.find((f) => f.id === st.f);
      let n = 0;
      for (const el of items) { const ok = (!q || el._m21t.includes(q)) && (!F || F.test(el)); el.classList.toggle('m21-cache', !ok); if (ok) n++; }
      if (!(T && T.cle && o.plat)) {
        for (const h of tetes) {
          const g = h.nextElementSibling, dans = items.filter((el) => g.contains(el));
          h.classList.toggle('m21-cache', !dans.some((el) => !el.classList.contains('m21-cache')));
        }
      }
      nEl.textContent = q || F ? `${n} / ${items.length}` : String(items.length);
      if (!n && !vide) { vide = D.createElement('p'); vide.className = 'm21-vide'; vide.textContent = 'Rien ne correspond.'; barre.after(vide); }
      else if (n && vide) { vide.remove(); vide = null; }
    };
    const refaire = o.refaire || (() => { if (typeof menus !== 'undefined') menus.rafraichir(); });
    const inp = barre.querySelector('.m21-cherche');
    inp.oninput = () => { st.q = inp.value; appliquer(); };
    inp.onkeydown = (e) => { if (/^Arrow(Left|Right)$/.test(e.code)) e.stopPropagation(); };
    const sel = barre.querySelector('.m21-tri');
    if (sel) sel.onchange = () => { st.tri = sel.value; refaire(); };
    const fil = barre.querySelector('.m21-filtre');
    if (fil) fil.onchange = () => { st.f = fil.value; appliquer(); };
    appliquer();
    return barre;
  }

  // ================================================================ décorer les panneaux (après chaque dessin)
  const LISTES = {
    // la sacoche, page Objets
    sac: {
      cle: 'sac', min: 6, items: (b) => $$q('.grid .it[data-it]', b), groupes: 'h4', plat: true,
      texte: (el) => { const it = ITEMS[el.dataset.it]; return itemName(el.dataset.it) + ' ' + ((it && ITEM_CAT_NAMES[it.cat]) || ''); },
      tris: [
        { id: 'cat', nom: 'Par catégorie' },
        { id: 'nom', nom: 'Par nom', cle: (el) => norm(itemName(el.dataset.it)) },
        { id: 'qte', nom: 'Par nombre', desc: true, cle: (el) => (farm.s && farm.s.inv[el.dataset.it]) || 0 },
        { id: 'prix', nom: 'Par valeur', desc: true, cle: (el) => { const it = ITEMS[el.dataset.it]; return ((it && it.price) || 0) * ((farm.s && farm.s.inv[el.dataset.it]) || 1); } },
      ],
      filtres: (items) => {
        const cats = new Set(items.map((el) => ITEMS[el.dataset.it] && ITEMS[el.dataset.it].cat));
        return Object.keys(ITEM_CAT_NAMES).filter((c) => cats.has(c)).map((c) => ({ id: c, nom: ITEM_CAT_NAMES[c], test: (el) => ITEMS[el.dataset.it] && ITEMS[el.dataset.it].cat === c }));
      },
    },
  };
  // l'établi : ce que l'on sait faire
  LISTES.fab = {
    cle: 'fab', min: 8, items: (b) => $$q(':scope > .rec', b),
    texte: (el) => el.textContent,
    tris: [{ id: 'ordre', nom: 'Dans l’ordre' }, { id: 'nom', nom: 'Par nom', cle: (el) => norm((el.querySelector('b') || el).textContent) }],
    filtres: [{ id: 'possible', nom: 'Faisable maintenant', test: (el) => el.classList.contains('ok') }],
  };
  function decorerMenu(P) {
    const body = $q(':scope > .body', P);
    if (!body || body._m21) return;
    body._m21 = true;
    const id = ui.satTab, page = typeof menus !== 'undefined' && menus.pages[id];
    // la page Objets : outils sous la bourse (avant les catégories)
    if (id === 'sac') {
      const g = $q('.grid', body), h = g && g.previousElementSibling && g.previousElementSibling.tagName === 'H4' ? g.previousElementSibling : g;
      if (h) outils(body, Object.assign({}, LISTES.sac, { place: h }));
      for (const el of $$q('.barcfg [data-slot], .barcfg [data-tok]', body)) if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
    } else if (id === 'fab') {
      const r0 = $q(':scope > .rec', body);
      if (r0) outils(body, Object.assign({}, LISTES.fab, { place: r0 }));
    } else if (page && page.outils) {
      try { outils(body, page.outils); } catch (e) { console.error('m21 outils', e); }
    }
    // une longue page : « Aller à » les titres
    if (!(page && (page.sommaire === false || page.outils)) && id !== 'sac' && id !== 'wiki') {
      const T = $$q('h4', body).filter((h) => !h.closest('.barcfg, .m21-outils, .fiche') && visible(h));
      if (T.length >= 4 && body.scrollHeight > body.clientHeight * 1.4) {
        const s = D.createElement('div');
        s.className = 'm21-sommaire';
        s.innerHTML = '<span>Aller à :</span>' + T.map((h, i) => `<button type="button" data-m21h="${i}">${esc(h.textContent.replace(/\s+/g, ' ').trim().slice(0, 34))}</button>`).join('');
        body.insertBefore(s, body.firstChild);
        s.querySelectorAll('[data-m21h]').forEach((b) => (b.onclick = () => {
          const h = T[+b.dataset.m21h];
          if (!h) return;
          body.scrollTop += (h.getBoundingClientRect().top - body.getBoundingClientRect().top) / (K || 1) - 6;
          if (nav.clavier) { const items = cibles(P), apres = items.find((x) => h.compareDocumentPosition(x) & Node.DOCUMENT_POSITION_FOLLOWING && !s.contains(x)); if (apres) focus(apres); }
        }));
      }
    }
    // la croix : « Refermer (Échap) »
    const x = $q(':scope > .tabs [data-close]', P);
    if (x) x.title = 'Refermer (Échap)';
  }
  function decorerBoutique(P) {
    const body = $q(':scope > .body', P);
    if (!body || body._m21) return;
    body._m21 = true;
    outils(P, { cle: 'boutique', min: 12, place: body, items: (c) => $$q('.row[data-buy], .row[data-sell]', c), refaire: () => ui.renderShop(),
      tris: [{ id: 'ordre', nom: 'Dans l’ordre' }, { id: 'prix', nom: 'Par prix', cle: (el) => +el.dataset.p || 0 }, { id: 'nom', nom: 'Par nom', cle: (el) => norm(el.textContent) }],
      filtres: [{ id: 'moyens', nom: 'Dans mes moyens', test: (el) => !el.dataset.buy || (+el.dataset.p || 0) <= ((farm.s && farm.s.money) || 0) }] });
  }
  function decorerCoffre(P) {
    const body = $q(':scope > .body', P);
    if (!body || body._m21) return;
    body._m21 = true;
    outils(P, { cle: 'coffre', min: 14, place: body, items: (c) => $$q('.it[data-get], .it[data-put]', c), refaire: () => ui.renderStore(),
      tris: [{ id: 'ordre', nom: 'Dans l’ordre' }, { id: 'nom', nom: 'Par nom', cle: (el) => norm(itemName(el.dataset.get || el.dataset.put)) }, { id: 'qte', nom: 'Par nombre', desc: true, cle: (el) => +((el.querySelector('i') || {}).textContent || 0) }] });
  }
  const CROIX = ':scope > .tabs .x, :scope > .tabs [data-close], .r15-haut .close, .ft-head .x, :scope > .m21-x';
  function decorer(P) {
    if (!P || !P.classList.contains('open')) return;
    if (P.id !== 'fondterm' && P.id !== 'admin' && !$q(CROIX, P)) {
      const x = D.createElement('button');
      x.type = 'button'; x.className = 'm21-x'; x.title = 'Refermer (Échap)'; x.setAttribute('aria-label', 'Refermer'); x.textContent = '✕';
      x.onclick = () => ui.close();
      P.appendChild(x);
    }
    // l'infobulle remplace le titre natif des objets
    if (settings.m21Bulles) for (const el of $$q('[data-it][title], [data-buy][title], [data-sell][title], [data-get][title], [data-put][title]', P)) { el.dataset.m21Titre = el.title; el.removeAttribute('title'); }
    if (P.id === 'satchel') decorerMenu(P);
    else if (P.id === 'shop') decorerBoutique(P);
    else if (P.id === 'store') decorerCoffre(P);
    poserAide(P);
  }
  // l'observateur : un panneau redessiné (pas le texte qui s'écrit) → on décore, on retrouve le focus
  let enCours = false;
  function surMutations(recs) {
    if (enCours || typeof ui === 'undefined' || !ui.panel) return;
    const P = $q(ui.panel);
    if (!P || !P.classList.contains('open')) return;
    let utile = false;
    for (const r of recs) { const t = r.target; if (t === P || (t.parentNode === P) || (t.classList && (t.classList.contains('body') || t.classList.contains('opts')))) { utile = true; break; } }
    if (!utile) { if (nav.clavier) retrouver(); return; }
    enCours = true;
    try { decorer(P); retrouver(); } catch (e) { console.error('m21', e); } finally { enCours = false; obsPaper.takeRecords(); }
  }
  const obsPaper = new MutationObserver(surMutations);

  // ================================================================ les Options : onglets, réglages nouveaux
  let optSec = 0;
  function ongletsOptions() {
    const box = $q('#dlg-options .box'), cols = $q('#dlg-options .cols');
    if (!box || !cols) return;
    const secs = [];
    let cur = null;
    for (const el of cols.children) {
      if (el.matches('h4.m15-sec')) { cur = { nom: el.textContent, els: [] }; secs.push(cur); }
      else if (cur) cur.els.push(el);
    }
    if (secs.length < 2) return;
    if (optSec >= secs.length) optSec = 0;
    let barre = $q(':scope > .m21-onglets', box);
    if (!barre) { barre = D.createElement('div'); barre.className = 'm21-onglets'; barre.setAttribute('role', 'tablist'); box.insertBefore(barre, cols); }
    barre.innerHTML = secs.map((s, i) => `<button type="button" role="tab" data-m21sec="${i}" class="${i === optSec ? 'on' : ''}" aria-selected="${i === optSec}">${esc(s.nom)}</button>`).join('');
    secs.forEach((s, i) => { for (const el of s.els) el.classList.toggle('m21-cache', i !== optSec); });
    barre.querySelectorAll('[data-m21sec]').forEach((b) => (b.onclick = () => { optSec = +b.dataset.m21sec; ongletsOptions(); son('page'); }));
  }
  // (les quatre réglages sont dans src/shell.html, où le wiki les lit ; recréés ici s'ils manquaient)
  function installerOptions() {
    const cols = $q('#dlg-options .cols');
    if (!cols || installerOptions.fait) return;
    installerOptions.fait = true;
    if (!$q('#o-m21-echelle')) creerOptions(cols);
    lierOptions();
  }
  function creerOptions(cols) {
    const l1 = D.createElement('label');
    l1.innerHTML = `Taille de l’interface <output id="o-m21-echelle-v"></output><select id="o-m21-echelle">${ECHELLES.map((v) => `<option value="${v}">${v === 'auto' ? 'Automatique (selon l’écran)' : Math.round(v * 100) + ' %'}</option>`).join('')}</select>`;
    const l2 = D.createElement('label'); l2.className = 'row';
    l2.innerHTML = '<input type="checkbox" id="o-m21-calme"> Réduire les animations';
    const l3 = D.createElement('label'); l3.className = 'row';
    l3.innerHTML = '<input type="checkbox" id="o-m21-bulles"> Infobulles des objets';
    const l4 = D.createElement('label'); l4.className = 'row';
    l4.innerHTML = '<input type="checkbox" id="o-m21-vibrer"> Vibrations de la manette';
    cols.append(l1, l2, l3, l4);
  }
  function lierOptions() {
    const se = $q('#o-m21-echelle');
    se.value = String(settings.m21Echelle);
    if (se.selectedIndex < 0) se.value = 'auto';
    se.onchange = () => { settings.m21Echelle = se.value === 'auto' ? 'auto' : +se.value; sauver(); appliquerEchelle(); };
    const sc = $q('#o-m21-calme');
    sc.checked = calme();
    sc.onchange = () => { settings.m21Calme = sc.checked; sauver(); appliquerCalme(); };
    const sb = $q('#o-m21-bulles');
    sb.checked = !!settings.m21Bulles;
    sb.onchange = () => { settings.m21Bulles = sb.checked; sauver(); if (!sb.checked) bulle.cacher(); };
    const sv = $q('#o-m21-vibrer');
    sv.checked = !!settings.m21Vibrer;
    sv.onchange = () => { settings.m21Vibrer = sv.checked; sauver(); if (sv.checked) manette.vibrer(160, 0.5, 0.3); };
    appliquerEchelle();
  }
  // une option d'un autre module, rangée dans une section
  function option(section, el) {
    const cols = $q('#dlg-options .cols');
    if (!cols || !el) return;
    cols.appendChild(el);
    const inp = el.matches('input, select') ? el : el.querySelector('input, select');
    if (inp && inp.id && typeof menus !== 'undefined' && Array.isArray(menus.SECTIONS)) {
      const S = menus.SECTIONS.find(([n]) => n === section);
      if (S && !S[1].includes(inp.id)) S[1].push(inp.id);
    }
  }

  // ================================================================ le wiki : tri et filtre
  const wiki = { tri: 'nom', montrer: '' };
  function brancherWiki() {
    if (typeof decouvertes === 'undefined' || decouvertes._m21) return;
    decouvertes._m21 = true;
    const _c = decouvertes.connues.bind(decouvertes);
    decouvertes.connues = function () {
      const G = _c();
      if (!wiki.montrer && wiki.tri === 'nom') return G;
      const D2 = this.S();
      for (const g in G) {
        let L = G[g];
        if (wiki.montrer) L = L.filter(([id, F]) => { const c = this.complet(id, F); return wiki.montrer === 'fini' ? c : !c; });
        if (wiki.tri === 'recent') L = L.slice().sort((a, b) => (((D2.pages[b[0]] || {}).j || 0) - ((D2.pages[a[0]] || {}).j || 0)) || a[1].titre.localeCompare(b[1].titre, 'fr'));
        else if (wiki.tri === 'afaire') L = L.slice().sort((a, b) => (this.complet(a[0], a[1]) - this.complet(b[0], b[1])) || a[1].titre.localeCompare(b[1].titre, 'fr'));
        G[g] = L;
      }
      return G;
    };
    const _r = decouvertes.rendre.bind(decouvertes);
    decouvertes.rendre = function (el) {
      _r(el);
      try {
        const tete = el && $q('.w15-tete', el);
        if (!tete || $q('.m21-sel', tete)) return;
        const s = D.createElement('span');
        s.innerHTML = `<label class="m21-sel"><span>Trier</span><select class="m21-wtri" aria-label="Trier"><option value="nom">De A à Z</option><option value="recent">Les plus récentes</option><option value="afaire">À compléter d’abord</option></select></label> <label class="m21-sel"><span>Montrer</span><select class="m21-wmontrer" aria-label="Montrer"><option value="">Tout</option><option value="afaire">À compléter</option><option value="fini">Complètes</option></select></label>`;
        const n = $q('.w15-n', tete);
        tete.insertBefore(s, n || null);
        const st = $q('.m21-wtri', s), sm = $q('.m21-wmontrer', s);
        st.value = wiki.tri; sm.value = wiki.montrer;
        st.onchange = () => { wiki.tri = st.value; decouvertes.rendre(el); const b = $q('.m21-wtri', el); if (b && nav.clavier) focus(b); };
        sm.onchange = () => { wiki.montrer = sm.value; decouvertes.rendre(el); const b = $q('.m21-wmontrer', el); if (b && nav.clavier) focus(b); };
      } catch (e) { console.error('m21 wiki', e); }
    };
  }

  // ================================================================ les livres : sommaire et recherche
  const livreEtat = { q: '' };
  function brancherLivres() {
    if (typeof livres === 'undefined' || livres._m21) return;
    livres._m21 = true;
    const _r = livres.rendre.bind(livres);
    livres.rendre = function () {
      _r();
      try {
        const C = this.cur, el = $q('#livre');
        if (!C || !el || C.pages.length < 9 || C.limite !== undefined) return;
        const nav0 = $q(':scope > .nav', el);
        if (!nav0) return;
        const txt = (p) => norm((p.titre || '') + ' ' + String(p.html || p.texte || '').replace(/<[^>]+>/g, ' '));
        const som = [];
        C.pages.forEach((p, i) => { if (i > 0 && p.titre && !/\(suite\)\s*$/.test(p.titre)) som.push([i, p.titre]); });
        const o = D.createElement('div');
        o.className = 'm21-livre-outils';
        o.innerHTML = (som.length > 2 ? `<label class="m21-sel"><span>Sommaire</span><select class="m21-som" aria-label="Sommaire"><option value="">—</option>${som.map(([i, t]) => `<option value="${i}">${esc(t)}</option>`).join('')}</select></label>` : '')
          + `<input type="text" class="m21-cherche" role="searchbox" placeholder="Chercher dans le livre…" value="${esc(livreEtat.q)}" aria-label="Chercher dans le livre" spellcheck="false" autocomplete="off"><span class="m21-n"></span>`;
        el.insertBefore(o, nav0);
        const sel = $q('.m21-som', o);
        if (sel) {
          const cur = som.filter(([i]) => Math.floor(i / 2) <= C.spread).pop();
          if (cur) sel.value = String(cur[0]);
          sel.onchange = () => { const i = +sel.value; if (!(i > 0)) return; C.spread = Math.floor(i / 2); if (!C.opts.surPlace) this.S().marque[C.id] = C.spread; son('page'); this.rendre(); const s2 = $q('#livre .m21-som'); if (s2 && nav.clavier) focus(s2); };
        }
        const inp = $q('.m21-cherche', o), nEl = $q('.m21-n', o);
        const marquer = () => {
          const q = norm(livreEtat.q);
          for (const f of $$q('#livre .fiche')) f.classList.toggle('m21-trouve', !!q && norm(f.textContent).includes(q));
          if (!q) { nEl.textContent = ''; return; }
          const n = C.pages.filter((p) => txt(p).includes(q)).length;
          nEl.textContent = n ? (n > 1 ? `${n} pages` : 'une page') : 'rien';
        };
        const chercher = (d) => {
          const q = norm(livreEtat.q);
          if (!q) return;
          const n = C.pages.length, i0 = C.spread * 2 + (d > 0 ? 2 : -1);
          for (let k = 0; k < n; k++) {
            const i = ((i0 + d * k) % n + n) % n;
            if (i > 0 && txt(C.pages[i]).includes(q)) { if (Math.floor(i / 2) !== C.spread) { C.spread = Math.floor(i / 2); son('page'); this.rendre(); const i2 = $q('#livre .m21-cherche'); if (i2) focus(i2); } return; }
          }
        };
        inp.oninput = () => { livreEtat.q = inp.value; marquer(); };
        inp.onkeydown = (e) => { if (/^Arrow(Left|Right)$/.test(e.code)) e.stopPropagation(); if (e.code === 'Enter' || e.code === 'NumpadEnter') { e.preventDefault(); e.stopPropagation(); chercher(e.shiftKey ? -1 : 1); } };
        marquer();
      } catch (e) { console.error('m21 livre', e); }
    };
  }

  // ================================================================ les crochets : ouvrir, fermer, la manette, le focus
  function apresOuverture() {
    bulle.cacher();
    manette.boucle();
    queueMicrotask(() => {
      try {
        const L = calque();
        if (!L) return;
        const R = racine(L);
        if (R.classList.contains('pp-panel')) decorer(R);
        else majAides();
        if (nav.clavier) { const a = D.activeElement; if (!(a && a !== D.body && L.contains(a))) focus(premier(L)); }
      } catch (e) { console.error('m21', e); }
    });
  }
  function brancherUI() {
    if (typeof ui === 'undefined' || ui._m21) return;
    ui._m21 = true;
    const _open = ui.open.bind(ui);
    ui.open = function (id, html) { qte.fermer(); const r = _open(id, html); apresOuverture(); return r; };
    const _close = ui.close.bind(ui);
    ui.close = function (silent) { qte.fermer(); bulle.cacher(); const r = _close(silent); apresOuverture(); return r; };
    const _od = ui.openDialog.bind(ui);
    ui.openDialog = function (id) {
      const r = _od(id);
      if (id === '#dlg-options') { try { installerOptions(); ongletsOptions(); appliquerEchelle(); const c = $q('#o-m21-calme'); if (c) c.checked = calme(); } catch (e) { console.error('m21 options', e); } }
      const box = $q(id + ' .box');
      if (box) poserAide(box);
      apresOuverture();
      return r;
    };
    const _cd = ui.closeDialogs.bind(ui);
    ui.closeDialogs = function () { if (conf.fin) conf.fin(false); const r = _cd(); apresOuverture(); return r; };
    const _sm = ui.showMenu.bind(ui);
    ui.showMenu = function (show) { const r = _sm(show); if (show) { const m = $q('#menu'); if (m) poserAide(m); } apresOuverture(); return r; };
    const _sd = ui.showDeath.bind(ui);
    ui.showDeath = function (...a) { const r = _sd(...a); const d = $q('#death'); if (d) poserAide(d); apresOuverture(); return r; };
  }

  // la nouvelle partie : la confirmation du jeu (plus de confirm() du navigateur)
  function brancherNouvellePartie() {
    const b = $q('#ng-go');
    if (!b || b._m21) return;
    b._m21 = true;
    let passe = false;
    b.addEventListener('click', (e) => {
      if (passe) { passe = false; return; }
      if (!(typeof farm !== 'undefined' && farm.s && !farm.s.over && farm.s.day > 1)) return;
      e.stopImmediatePropagation(); e.preventDefault();
      confirmer({ titre: 'Nouvelle partie', texte: 'Commencer une nouvelle partie ? La partie en cours sera perdue (la vallée s’en souviendra).', oui: 'Commencer', non: 'Annuler' }).then((oui) => {
        if (!oui) return;
        const c = window.confirm;
        window.confirm = () => true;
        passe = true;
        try { b.click(); } finally { window.confirm = c; passe = false; }
      });
    }, true);
  }

  // ================================================================ mise en place
  function installer() {
    installerStyle();
    corrigerFeuilles();
    appliquerEchelle();
    appliquerCalme();
    new MutationObserver((recs) => {
      let neuf = false;
      for (const r of recs) for (const n of r.addedNodes) if (n.nodeName === 'STYLE' || n.nodeName === 'LINK' || n.nodeType === 3) neuf = true;
      if (!neuf) return;
      corrigerFeuilles();
      installerStyle();
    }).observe(D.head, { childList: true, subtree: true });
    const pap = D.getElementById('paper');
    if (pap) {
      obsPaper.observe(pap, { childList: true, subtree: true });
      // l'infobulle : au survol (souris), délégué
      pap.addEventListener('mouseover', (e) => { const t = e.target.closest && e.target.closest('[data-it], [data-buy], [data-sell], [data-get], [data-put], [data-m21-info]'); if (t && t !== bulle.cible) bulle.viser(t, false); else if (!t && bulle.cible) bulle.cacher(); });
      pap.addEventListener('mouseleave', () => bulle.cacher());
      pap.addEventListener('mousedown', () => bulle.cacher(), true);
      pap.addEventListener('wheel', () => bulle.cacher(), { passive: true, capture: true });
      // le clic droit : les quantités du coffre, la barre d'outils
      pap.addEventListener('contextmenu', (e) => {
        const t = e.target.closest && e.target.closest('#store [data-get], #store [data-put], #satchel .grid [data-it], #satchel [data-tok]');
        if (!t) return;
        e.preventDefault();
        secondaire(t);
      });
    }
    installerOptions();
    brancherUI();
    brancherWiki();
    brancherLivres();
    brancherNouvellePartie();
    // les quatre sections des Options (M15) : une de plus, « Interface »
    try {
      if (typeof menus !== 'undefined' && Array.isArray(menus.SECTIONS) && !menus.SECTIONS.some(([n]) => n === 'Interface')) {
        const J = menus.SECTIONS.findIndex(([n]) => n === 'Jeu');
        menus.SECTIONS.splice(J < 0 ? menus.SECTIONS.length : J, 0, ['Interface', ['o-m21-echelle', 'o-m21-calme', 'o-m21-bulles', 'o-hotbar', 'o-subs', 'o-dot']]);
        for (const [n, L] of menus.SECTIONS) if (n !== 'Interface') for (const id of ['o-hotbar', 'o-subs', 'o-dot']) { const i = L.indexOf(id); if (i >= 0) L.splice(i, 1); }
        const C = menus.SECTIONS.find(([n]) => n === 'Commandes');
        if (C && !C[1].includes('o-m21-vibrer')) C[1].push('o-m21-vibrer');
      }
    } catch (e) { console.error('m21 sections', e); }
  }
  // (hors navigateur — l'équilibrage charge le jeu dans une machine virtuelle sans vrai DOM — rien ne doit casser)
  try { installer(); } catch (e) { console.error('m21 : mise en place', e); }

  return {
    version: 1,
    k: () => K, calme, echelle(v) { settings.m21Echelle = v; sauver(); appliquerEchelle(); },
    outils, infoObjet, option, confirmer,
    quantite: (o) => qte.ouvrir(o),
    touche: toucheHTML, glyphe,
    manette, nav: { focus, premier: (L) => premier(L || calque()), calque, mode: (on) => nav.mode(on) },
    fermerTout() { qte.fermer(); bulle.cacher(); if (conf.fin) conf.fin(false); },
    _interne: { bulle, qte, nav, aideHTML, decorer, retrouver, corrigerFeuilles, ongletsOptions },
  };
})();
