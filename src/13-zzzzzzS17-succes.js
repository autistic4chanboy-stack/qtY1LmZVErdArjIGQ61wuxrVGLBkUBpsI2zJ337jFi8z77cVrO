// ============================================================================
//  LES SUCCÈS (S17, la version Steam)
//  - Une liste de succès (identifiants Steam, mêmes noms que steam/achievements.json,
//    où sont leurs titres et descriptions FR/EN) ; chacun a sa règle, lue dans
//    l'état de la partie (farm.s…) toutes les 3 s pendant qu'on joue à la ferme
//    (rien à chaque image, rien dans le mode création), ou un événement.
//  - Débloquer : noté dans le stockage local (« prairie.succes » : { api: date }),
//    envoyé à Steam par window.steamBridge.achievement(api) quand il existe
//    (la version de bureau) ; dans un navigateur : rien d'autre (pas d'affichage).
//    Au démarrage, ceux déjà notés sont renvoyés au pont (Steam les ignore s'il
//    les a déjà : utile si l'on a joué hors ligne).
//  - Événements écoutés (window) :
//      prairie:succes   { api }                    débloque ce succès (pour d'autres modules)
//      prairie:histoire { chapitre, etape, fin?, termine? }   l'histoire principale :
//          un chapitre N annoncé débloque les chapitres d'avant (N-1…) ; termine: true
//          (ou etape === 'fin') débloque le chapitre N ; fin: 'a' | 'b' | … une fin
//      prairie:histoire-fin / prairie:fin { fin }  une fin de l'histoire
//    Émis : prairie:succes-debloque { api } (après chaque nouveau succès).
//  - Statistiques Steam (facultatives, si définies dans Steamworks) : JOURS_MAX,
//    QUETES_FINIES, RECOLTES (entiers qui ne font que monter).
//  API : succes (LISTE, HISTOIRE, debloque(api), estDebloque(api), liste(), verifier(),
//        nQuetes(), nPages(prefixe))
// ============================================================================
const succes = (() => {
  const CLE = 'prairie.succes';
  const PERIODE = 3000;
  const st = () => (typeof farm !== 'undefined' && farm.s) || null;
  const nb = (o) => (o && typeof o === 'object' ? Object.keys(o).length : 0);
  const num = (v) => (typeof v === 'number' && isFinite(v) ? v : 0);

  // ---------------------------------------------------------------- les comptes
  function nPages(prefixe) {
    const s = st(), D = s && s.decouvertes, P = D && D.pages;
    if (!P || typeof P !== 'object') return 0;
    let n = 0;
    for (const k in P) if (!prefixe || k.startsWith(prefixe)) n++;
    return n;
  }
  function nQuetes() {
    const s = st();
    if (!s) return 0;
    let n = 0;
    const compter = (Q, faits) => { if (Q && typeof Q === 'object') for (const k in Q) { const q = Q[k]; if (q && faits.includes(q.st)) n++; } };
    compter(s.quests, ['fait']);                      // les quêtes des habitants (et leurs suites)
    compter(s.q16 && s.q16.Q, ['fait']);              // celles des autres (Q16)
    compter(s.quetes && s.quetes.Q, ['fini']);        // les grandes quêtes (T)
    return n;
  }
  const zone = () => { const s = st(); return (s && s.zone) || {}; };
  const runesS = () => { const s = st(); return (s && s.runes) || {}; };

  // ---------------------------------------------------------------- la liste (même ordre que steam/achievements.json)
  // [api, règle(s) → vrai quand c'est gagné] ; règle null : seulement par événement
  const LISTE = [
    // la ferme
    ['NEWY_PREMIERE_RECOLTE', (s) => num(s.stats && s.stats.crops) >= 1],
    ['NEWY_CENT_RECOLTES', (s) => num(s.stats && s.stats.crops) >= 100],
    ['NEWY_PREMIERE_VENTE', (s) => num(s.stats && s.stats.sold) >= 1],
    ['NEWY_ECONOMIES', (s) => num(s.stats && s.stats.earned) >= 10000],
    ['NEWY_PREMIER_ANIMAL', (s) => Array.isArray(s.animals) && s.animals.length >= 1],
    ['NEWY_PREMIER_POISSON', (s) => num(s.stats && s.stats.fish) >= 1],
    ['NEWY_PECHEUR', (s) => num(s.stats && s.stats.fish) >= 25],
    ['NEWY_POTION', (s) => num(s.stats && s.stats.potions) >= 1],
    // tenir
    ['NEWY_PREMIERE_NUIT', (s) => num(s.day) >= 2],
    ['NEWY_SEMAINE', (s) => num(s.day) >= 8],
    ['NEWY_TRENTE_JOURS', (s) => num(s.day) >= 31],
    ['NEWY_CENT_JOURS', (s) => num(s.day) >= 101],
    ['NEWY_MORT', null], // HOOKS.death
    // le carnet
    ['NEWY_BETES_10', () => nPages('an:') >= 10],
    ['NEWY_BETES_40', () => nPages('an:') >= 40],
    ['NEWY_PLANTES_25', () => nPages('pl:') >= 25],
    ['NEWY_HABITANTS_20', () => nPages('pnj:') >= 20],
    // les runes et la Grande Porte
    ['NEWY_PREMIERE_TABLETTE', () => nb(runesS().t) >= 1],
    ['NEWY_TOUTES_LES_TABLETTES', () => nb(runesS().t) >= ((typeof R15_REGL !== 'undefined' && R15_REGL.tablettes) || 4)],
    ['NEWY_PREMIER_ASSEMBLAGE', () => num(runesS().n) >= 1],
    ['NEWY_DALLE', () => nb(runesS().p) >= 1],
    ['NEWY_GRANDE_PORTE', () => num(zone().entrees) >= 1],
    ['NEWY_TERRES_FEU', () => nb(zone().feux) >= 1],
    // les gens
    ['NEWY_QUETE_1', () => nQuetes() >= 1],
    ['NEWY_QUETES_10', () => nQuetes() >= 10],
    ['NEWY_QUETES_25', () => nQuetes() >= 25],
    ['NEWY_FOYER', (s) => !!(s.coeur && s.coeur.foyer)],
    ['NEWY_TUEUR', (s) => !!(s.strange && s.strange.kCaught)],
    ['NEWY_AUTRE_MONDE', (s) => nb(s.mondes && s.mondes.vus) >= 1],
    // l'histoire principale (événements prairie:histoire)
    ['NEWY_HISTOIRE_CH1', null],
    ['NEWY_HISTOIRE_CH2', null],
    ['NEWY_HISTOIRE_CH3', null],
    ['NEWY_HISTOIRE_CH4', null],
    ['NEWY_HISTOIRE_FIN', null],
    ['NEWY_HISTOIRE_FIN_A', null],
    ['NEWY_HISTOIRE_FIN_B', null],
  ];
  const IDS = new Set(LISTE.map(([a]) => a));
  // l'histoire : numéro de chapitre → succès ; fin → succès (en plus de NEWY_HISTOIRE_FIN)
  const HISTOIRE = {
    chapitres: { 1: 'NEWY_HISTOIRE_CH1', 2: 'NEWY_HISTOIRE_CH2', 3: 'NEWY_HISTOIRE_CH3', 4: 'NEWY_HISTOIRE_CH4' },
    fins: { a: 'NEWY_HISTOIRE_FIN_A', b: 'NEWY_HISTOIRE_FIN_B' },
    fin: 'NEWY_HISTOIRE_FIN',
  };

  // ---------------------------------------------------------------- l'état
  let gagnes = null;
  function lire() {
    if (gagnes) return gagnes;
    let g = null;
    try { g = JSON.parse(localStorage.getItem(CLE) || 'null'); } catch (e) { g = null; }
    gagnes = g && typeof g === 'object' && !Array.isArray(g) ? g : {};
    return gagnes;
  }
  function ecrire() { try { localStorage.setItem(CLE, JSON.stringify(gagnes || {})); } catch (e) { /* stockage indisponible */ } }
  const pont = () => (typeof window !== 'undefined' && window.steamBridge) || null;

  function debloque(api) {
    if (!IDS.has(api)) return false;
    const g = lire();
    const neuf = !g[api];
    if (neuf) { g[api] = Date.now(); ecrire(); }
    const b = pont();
    if (b && typeof b.achievement === 'function') { try { b.achievement(api); } catch (e) { /* rien */ } }
    if (neuf) { try { window.dispatchEvent(new CustomEvent('prairie:succes-debloque', { detail: { api } })); } catch (e) { /* rien */ } }
    return neuf;
  }

  // ---------------------------------------------------------------- les vérifications
  let statsVues = {};
  function stats(s) {
    const b = pont();
    if (!b || typeof b.stat !== 'function') return;
    const V = { JOURS_MAX: num(s.day), QUETES_FINIES: nQuetes(), RECOLTES: num(s.stats && s.stats.crops) };
    for (const k in V) if (V[k] > (statsVues[k] || 0)) { statsVues[k] = V[k]; try { b.stat(k, V[k]); } catch (e) { /* rien */ } }
  }
  function enJeu() {
    try {
      return typeof game !== 'undefined' && game.kind === 'farm' && game.started && !!st() && !st().over;
    } catch (e) { return false; }
  }
  function verifier() {
    if (!enJeu()) return 0;
    const s = st(), g = lire();
    let n = 0;
    for (const [api, regle] of LISTE) {
      if (!regle || g[api]) continue;
      let ok = false;
      try { ok = !!regle(s); } catch (e) { ok = false; }
      if (ok && debloque(api)) n++;
    }
    try { stats(s); } catch (e) { /* rien */ }
    return n;
  }

  // ---------------------------------------------------------------- les événements
  function surHistoire(d) {
    if (!d || typeof d !== 'object') return;
    const c = parseInt(d.chapitre, 10);
    if (c > 0) {
      for (let k = 1; k < c; k++) if (HISTOIRE.chapitres[k]) debloque(HISTOIRE.chapitres[k]);
      if ((d.termine === true || d.etape === 'fin') && HISTOIRE.chapitres[c]) debloque(HISTOIRE.chapitres[c]);
    }
    if (d.fin) surFin(d);
  }
  function surFin(d) {
    for (const k in HISTOIRE.chapitres) debloque(HISTOIRE.chapitres[k]);
    debloque(HISTOIRE.fin);
    const f = d && d.fin != null ? String(d.fin).toLowerCase() : '';
    if (HISTOIRE.fins[f]) debloque(HISTOIRE.fins[f]);
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('prairie:succes', (e) => { if (e && e.detail && typeof e.detail.api === 'string') debloque(e.detail.api); });
    window.addEventListener('prairie:histoire', (e) => { try { surHistoire(e && e.detail); } catch (err) { /* rien */ } });
    window.addEventListener('prairie:histoire-fin', (e) => { try { surFin((e && e.detail) || {}); } catch (err) { /* rien */ } });
    window.addEventListener('prairie:fin', (e) => { try { surFin((e && e.detail) || {}); } catch (err) { /* rien */ } });
  }
  if (typeof HOOKS !== 'undefined' && Array.isArray(HOOKS.death)) {
    HOOKS.death.push(() => { try { if (typeof game === 'undefined' || game.kind === 'farm') debloque('NEWY_MORT'); } catch (e) { /* rien */ } return false; });
  }

  // ---------------------------------------------------------------- le départ
  setInterval(verifier, PERIODE);
  setTimeout(() => {
    const b = pont();
    if (b && typeof b.achievement === 'function') for (const api in lire()) if (IDS.has(api)) { try { b.achievement(api); } catch (e) { /* rien */ } }
  }, 4000);

  return {
    LISTE, HISTOIRE, IDS, debloque, verifier, nQuetes, nPages,
    estDebloque: (api) => !!lire()[api],
    liste: () => Object.keys(lire()).filter((a) => IDS.has(a)),
  };
})();
