// ============================================================================
//  LES RUNES (agent R15, quinzième vague) — 1. LES DONNÉES
//  Quatre tablettes de pierre : trois quelque part autour de la ferme, de
//  Valbrume et de Clairpré (tirées de la graine de la partie), la quatrième au
//  fond du labyrinthe des Galeries (le Dessous). Chacune porte trois runes.
//  Les quatre trouvées, la pierre s'éveille : on assemble trois runes
//  (un panneau, page « Runes » du menu) :
//   - un DOMAINE (ce sur quoi ça porte), un SIGNE (dans quel sens), une MESURE
//     (combien de temps) : un effet ; une seule fois par jour ; un seul effet
//     durable à la fois ;
//   - la CLÉ et deux runes, devant une dalle scellée : elle s'ouvre (trois
//     dalles : le caveau du bois, dans la vallée ; une niche au fond des
//     Galeries ; un tertre des Terres d'Avant). Chaque dalle porte ses trois
//     runes, dont une effacée.
//  Rien n'est dit : un signe, un son, une lueur. Le sens des runes, c'est au
//  joueur de le trouver (le wiki du jeu garde ses notes).
// ============================================================================

// les runes : sorte (domaine, signe, mesure, cle), le trait (segments dans un carré 0..1, y vers le bas)
const R15_RUNES = {
  orne:  { nom: 'Orne',  sorte: 'domaine', d: 'recolte', segs: [[0.5, 1, 0.5, 0], [0.5, 0.45, 0.15, 0.06], [0.5, 0.45, 0.85, 0.06]] },
  sel:   { nom: 'Sel',   sorte: 'domaine', d: 'chance',  segs: [[0.5, 0.02, 0.88, 0.5], [0.88, 0.5, 0.5, 0.98], [0.5, 0.98, 0.12, 0.5], [0.12, 0.5, 0.5, 0.02], [0.5, 0.36, 0.5, 0.64]] },
  ure:   { nom: 'Ure',   sorte: 'domaine', d: 'peche',   segs: [[0.22, 1, 0.22, 0], [0.22, 0, 0.8, 0.3], [0.8, 0.3, 0.8, 1]] },
  rade:  { nom: 'Rade',  sorte: 'domaine', d: 'pas',     segs: [[0.25, 0, 0.25, 1], [0.25, 0, 0.75, 0.25], [0.75, 0.25, 0.25, 0.5], [0.25, 0.5, 0.8, 1]] },
  ysse:  { nom: 'Ysse',  sorte: 'domaine', d: 'nuit',    segs: [[0.04, 0.5, 0.5, 0.2], [0.5, 0.2, 0.96, 0.5], [0.96, 0.5, 0.5, 0.8], [0.5, 0.8, 0.04, 0.5], [0.5, 0.4, 0.5, 0.6]] },
  hale:  { nom: 'Hâle',  sorte: 'domaine', d: 'faim',    segs: [[0.2, 1, 0.2, 0.32], [0.8, 1, 0.8, 0.32], [0.2, 0.32, 0.5, 0.02], [0.5, 0.02, 0.8, 0.32], [0.2, 0.66, 0.8, 0.66]] },
  aure:  { nom: 'Aure',  sorte: 'signe',   s: 1,         segs: [[0.3, 0, 0.72, 0.4], [0.72, 0.4, 0.28, 0.6], [0.28, 0.6, 0.7, 1]] },
  morne: { nom: 'Morne', sorte: 'signe',   s: -1,        segs: [[0.5, 0, 0.5, 1], [0.5, 0.55, 0.15, 0.94], [0.5, 0.55, 0.85, 0.94]] },
  lone:  { nom: 'Lône',  sorte: 'signe',   s: 0,         segs: [[0.66, 0, 0.36, 0.24], [0.36, 0.24, 0.3, 0.5], [0.3, 0.5, 0.36, 0.76], [0.36, 0.76, 0.66, 1], [0.66, 0, 0.52, 0.5], [0.52, 0.5, 0.66, 1]] },
  ile:   { nom: 'Île',   sorte: 'mesure',  m: 'fil',     segs: [[0.5, 0, 0.5, 1], [0.5, 0.3, 0.74, 0.12]] },
  dar:   { nom: 'Dar',   sorte: 'mesure',  m: 'pierre',  segs: [[0.15, 0, 0.85, 1], [0.85, 0, 0.15, 1], [0.15, 0, 0.15, 1], [0.85, 0, 0.85, 1]] },
  gyve:  { nom: 'Gyve',  sorte: 'cle',                   segs: [[0.15, 0.08, 0.85, 0.92], [0.85, 0.08, 0.15, 0.92], [0.06, 0.5, 0.94, 0.5]] },
};
const R15_ORDRE = ['orne', 'sel', 'ure', 'rade', 'ysse', 'hale', 'aure', 'morne', 'lone', 'ile', 'dar', 'gyve'];
// la tablette du Dessous porte toujours la clé, la mesure longue et le signe de la nuit ; les neuf autres runes se
// partagent les trois tablettes de la vallée (au hasard de la graine)
const R15_DESSOUS = ['gyve', 'dar', 'lone'];

// les réglages (l'équilibrage tools/equilibrage/R15.js les lit)
const R15_REGL = {
  tablettes: 4,            // la pierre ne s'éveille qu'avec les quatre
  parJour: 1,              // un assemblage d'effet par jour (les dalles : autant d'essais qu'on veut)
  filH: 12,                // h : un effet passager (Île)
  darJ: 7,                 // jours : un effet durable (Dar) ; un seul durable à la fois (le nouveau remplace l'ancien)
  nuit: [20, 6],           // h : Lône est d'un côté la nuit, de l'autre le jour
  recolte: [1.3, 0.75],    // pousse des cultures (×) : faveur, défaveur
  chance: [0.5, 0.5],      // part des fouilles tirées deux fois ; part des fouilles maigres
  peche: [0.6, 0.35],      // la touche vient plus vite (attente −60 %) ; plus lentement (+35 %)
  pecheFuite: 0.35,        // défaveur : une prise sur trois se décroche
  pas: [1.12, 0.9],        // allure (×)
  nuitAmb: [0.6, 0.72],    // la nuit : un peu plus claire (part de l'œil de chouette) ; plus noire (× la lumière ambiante)
  faim: [0.3, 0.35],       // la faim : 30 % plus lente ; 35 % plus rapide
};

// les dalles scellées : où, les trois runes (la deuxième, effacée sur la pierre), le butin
const R15_PORTES = {
  caveau: { monde: 'vallee',  runes: ['gyve', 'hale', 'lone'], efface: 'lone', table: 'r15_caveau', lieu: 'r15_caveau' },
  niche:  { monde: 'dessous', runes: ['gyve', 'ysse', 'morne'], efface: 'morne', table: 'r15_niche' },
  tertre: { monde: 'zone',    runes: ['gyve', 'rade', 'dar'],  efface: 'rade', table: 'r15_tertre', lieu: 'r15_tertre' },
};

// les butins des dalles : [objet, min, max, poids] (une fois pour toutes)
Object.assign(LOOT, {
  r15_caveau: { rolls: [3, 4], items: [['vieille_piece', 3, 6, 5], ['relique', 1, 1, 2], ['gemme', 1, 2, 2], ['perle', 1, 1, 1], ['lingot_or', 1, 2, 1.5], ['argent', 60, 140, 3]] },
  r15_niche: { rolls: [3, 4], items: [['minerai_or', 2, 4, 4], ['gemme', 1, 2, 3], ['fossile', 1, 2, 2], ['relique', 1, 1, 1.5], ['lingot_or', 1, 2, 2], ['argent', 50, 120, 3]] },
  r15_tertre: { rolls: [3, 4], items: [['vieille_piece', 4, 8, 4], ['relique', 1, 2, 2.5], ['gemme', 1, 3, 2.5], ['perle', 1, 2, 1.5], ['lingot_or', 1, 2, 1.5], ['argent', 60, 140, 3]] },
});
