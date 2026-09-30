// ============================================================================
//  CE QUE LES MAINS N'OUBLIENT PAS : les recettes apprises survivent à la mort.
//  Fabrication (trouvées en assemblant, lues dans les manuels, apprises des gens
//  de métier), recettes des quêtes et des livres, mélanges d'alchimie qu'on a
//  réussis : tout est gardé hors de la partie (localStorage 'prairie.recettes'),
//  et rendu au fermier suivant dès son arrivée — des gestes qui reviennent.
//  (Rien d'autre ne passe d'une vie à l'autre : ni l'argent, ni les objets.)
//  API : memoireRecettes (garder(), rendre(), nombre()).
// ============================================================================

const RECETTES_KEY = 'prairie.recettes';

const memoireRecettes = {
  lire() { const m = store.get(RECETTES_KEY, null); return m && typeof m === 'object' ? { fab: m.fab || {}, known: m.known || {}, alch: m.alch || {} } : { fab: {}, known: {}, alch: {} }; },
  nombre() { const m = this.lire(); return Object.keys(m.fab).length + Object.keys(m.known).filter((k) => !m.fab[k]).length + Object.keys(m.alch).length; },
  // ce que sait la partie en cours rejoint la mémoire (on n'y retire jamais rien)
  garder() {
    const s = farm.s;
    if (!s) return;
    const m = this.lire();
    let neuf = false;
    const R = (s.savoir && s.savoir.recettes) || {};
    for (const k in R) if (R[k] && !m.fab[k]) { m.fab[k] = R[k] === 'memoire' ? 'memoire' : 'appris'; neuf = true; }
    for (const k in s.known || {}) if (s.known[k] && !m.known[k]) { m.known[k] = 1; neuf = true; }
    const P = (s.alch && s.alch.potions) || {};
    for (const k in P) if (P[k] && P[k].f && !m.alch[k]) { m.alch[k] = { f: 1 }; neuf = true; }
    if (neuf) store.set(RECETTES_KEY, m);
  },
  // la mémoire rejoint la partie en cours ; renvoie le nombre de recettes rendues
  rendre() {
    const s = farm.s;
    if (!s) return 0;
    const m = this.lire();
    let n = 0;
    if (typeof savoir !== 'undefined' && savoir.S) {
      const R = savoir.S().recettes;
      for (const k in m.fab) if (!R[k] && !(typeof CRAFT_BASE !== 'undefined' && CRAFT_BASE.has(k)) && RECIPES.some((r) => r.out === k)) { R[k] = 'memoire'; n++; }
    }
    s.known = s.known || {};
    for (const k in m.known) if (!s.known[k]) { s.known[k] = 1; if (!m.fab[k]) n++; }
    if (typeof alchimie !== 'undefined' && alchimie.S) {
      const P = alchimie.S().potions;
      for (const k in m.alch) if (ITEMS[k] && !(P[k] && P[k].f)) { P[k] = Object.assign(P[k] || {}, { f: s.day, memoire: 1 }); n++; }
    }
    return n;
  },
};

HOOKS.load.push(() => {
  if (!farm.s) return;
  const s = farm.s;
  const n = memoireRecettes.rendre();
  memoireRecettes.garder();
  // une vie nouvelle qui hérite : une pensée, une seule fois
  if (n > 0 && !s.recettesHeritees && (s.run || 1) > 1) {
    s.recettesHeritees = true;
    setTimeout(() => ui.subtitle('', n > 1 ? `(${n} recettes vous reviennent, d’une autre vie.)` : '(Une recette vous revient, d’une autre vie.)', 4), 9000);
  }
  if (!memoireRecettes.branche) {
    memoireRecettes.branche = true;
    // chaque recette apprise est gardée aussitôt ; et à chaque sauvegarde, et à la mort
    if (typeof savoir !== 'undefined' && savoir.onRecette) savoir.onRecette.push(() => memoireRecettes.garder());
    const _save = farm.save.bind(farm);
    farm.save = function (...a) { try { memoireRecettes.garder(); } catch (e) { console.error('recettes', e); } return _save(...a); };
    HOOKS.death.push(() => { try { memoireRecettes.garder(); } catch (e) { console.error('recettes', e); } });
  }
});
// dans la liste des recettes : d'où vient celle-ci
if (typeof fabrication !== 'undefined' && typeof fabrication.source === 'function') {
  const _src = fabrication.source.bind(fabrication);
  fabrication.source = function (out) { const R = typeof savoir !== 'undefined' && savoir.S ? savoir.S().recettes[out] : null; return R === 'memoire' ? 'sue d’une autre vie' : _src(out); };
}
