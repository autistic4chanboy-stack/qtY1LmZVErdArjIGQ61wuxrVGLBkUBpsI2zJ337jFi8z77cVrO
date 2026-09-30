// ============================================================================
//  PENSÉES : moins dire.
//  Le personnage ne commente pas ce qui se voit ou s'entend déjà, ni ses propres
//  gestes. Une règle à connaître (une durée, une portée, un usage) se dit une
//  seule fois par vie, jamais à chaque fois :
//    penser.une(clé, texte, durée)  -> true si la pensée vient d'être dite
//    penser.deja(clé)                -> déjà dite dans cette vie ?
//  Un avertissement qui peut revenir ne se répète pas trop vite :
//    penser.pas(clé, secondes, texte, durée) -> dit la pensée si la même clé n'a
//    rien dit depuis tant de secondes (temps réel, non sauvegardé).
//  Chaque appel est une décision prise à la main : pas de filtre global.
//  État sauvegardé : farm.s.pensees = { clé: jour où la pensée est venue }.
// ============================================================================
const penser = {
  _t: {},
  S() {
    const s = farm.s;
    if (!s) return null;
    if (!s.pensees || typeof s.pensees !== 'object') s.pensees = {};
    return s.pensees;
  },
  deja(k) { const P = farm.s && farm.s.pensees; return !!(P && P[k]); },
  une(k, texte, dur) {
    const P = this.S();
    if (!P || P[k]) return false;
    P[k] = farm.s.day || 1;
    ui.subtitle('', texte, dur || 3);
    return true;
  },
  pas(k, sec, texte, dur) {
    const t = performance.now() / 1000;
    if (this._t[k] !== undefined && t - this._t[k] < sec) return false;
    this._t[k] = t;
    ui.subtitle('', texte, dur || 3);
    return true;
  },
};
