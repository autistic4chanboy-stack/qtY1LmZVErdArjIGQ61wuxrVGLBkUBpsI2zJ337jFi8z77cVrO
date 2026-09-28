// ============================================================================
//  POINTS D'ACCROCHE : les systèmes ajoutés (pelle, alchimie, prières,
//  légendes, bêtes, vie des habitants…) s'y branchent sans toucher au cœur
// ============================================================================
const HOOKS = {
  interPre: {},   // kind -> fn(it) : true si géré (remplace le comportement d'origine)
  inter: {},      // kind -> fn(it) : interactions nouvelles
  interVis: {},   // kind -> fn(it) : false pour ne pas proposer l'interaction (encore cachée)
  propPre: {},    // id d'objet posé -> fn(q) : true si géré
  target: [],     // fn(eye, f, cand) : ajoute des cibles pour la touche E
  update: [],     // fn(dt, eye, basis, sky, playing) : chaque image (ferme)
  day: [],        // fn() : nouveau jour (après le reste)
  load: [],       // fn(saved) : partie chargée ou commencée
  draw: [],       // fn(dynBuf, shadowBuf, cam, t) : modèles dynamiques
  lights: [],     // fn(eye) -> [{x,y,z,r,c,d}]
  sky: [],        // fn(sky) : retouche du ciel / de la lumière avant le rendu
  fx: [],         // fn(fx, tint, sky) : effets d'écran
  primary: [],    // fn(eye, basis, held, item, id) : clic gauche — true si géré
  secondary: [],  // fn(eye, basis, item, id) : clic droit — true si géré
  death: [],      // fn(cause) : true pour empêcher la mort
};
// Objets posés utilisables avec E (fusionné dans PROP_USE)
const PROP_USE_MORE = {};
// Effets en cours (potions, bénédictions) : remplacé par le module d'alchimie
const BUFF = { on: () => false };
