// ============================================================================
//  LE GRAND CERCLE (agent C18) — les modèles (11-zzzzzzzzC18-1-casino.js)
//  Les tables de jeu (roulette et son cylindre qui tourne, vingt-et-un, baccara,
//  passe-dix), le bandit manchot, la caisse grillagée, le bar et ses bouteilles,
//  les lustres (allumés quand le Cercle est ouvert), le piano, la marquise de
//  l'entrée et son enseigne, les hautes fenêtres (dehors et dedans), les tapis,
//  les palmiers en caisse ; à l'étage, la suite Impériale : le lit à baldaquin,
//  la baignoire de cuivre, le paravent, le portrait du baron, la balustrade du
//  balcon. Aucune matière nouvelle (il n'en reste que quatre de libres sur
//  soixante-quatre) : tout ce qui est fin est dessiné en objets posés.
//  L'avant de chaque modèle regarde +z ; l'origine est au sol, au centre.
// ============================================================================
const C18C = {
  acajou: rgbf('#5a2a1c'), acajouF: rgbf('#3e1c12'), tapis: rgbf('#2c6a3e'), tapisF: rgbf('#235834'), rouge: rgbf('#a8241e'), noir: rgbf('#1c1a1a'),
  or: rgbf('#c8a040'), orF: rgbf('#9a7a2a'), laiton: rgbf('#b8933e'), fonte: rgbf('#2e2c2c'), velours: rgbf('#7a1822'), veloursF: rgbf('#5a1018'),
  creme: rgbf('#ece4d0'), marbre: rgbf('#d8d2c8'), cuivre: rgbf('#b8683a'), email: rgbf('#f0ece2'), eau: rgbf('#6a8a9a'), vert: rgbf('#2a5a3a'),
  verre: rgbf('#2a3848'), verreClair: rgbf('#9ab4c0'), bougie: rgbf('#f2ead2'), flamme: rgbf('#ffc860'), feuille: rgbf('#3a6a32'), feuilleF: rgbf('#2a4e24'),
  pierre: rgbf('#d4ccb8'), ivoire: rgbf('#e8e0c8'),
};
// lettres de 3 × 5 (l'enseigne)
const C18_LETTRES = {
  G: ['111', '100', '101', '101', '111'], R: ['110', '101', '110', '101', '101'], A: ['010', '101', '111', '101', '101'], N: ['101', '111', '111', '111', '101'],
  D: ['110', '101', '101', '101', '110'], C: ['111', '100', '100', '100', '111'], E: ['111', '100', '110', '100', '111'], L: ['100', '100', '100', '100', '111'],
};
// les cases de la roulette (ordre du cylindre européen) et leurs couleurs
const C18_CYLINDRE = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const C18_ROUGES = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
// l'état du cylindre (posé par 11-zzzzzzzzC18-2-jeux.js) : angle du plateau, angle et rayon de la bille
const C18_ROUE = { a: 0, b: 0, rb: 0.3, hb: 0.05 };

// un anneau de n boîtes (polygone) : rayon r, épaisseur e, hauteur h, au-dessus de y
function c18Anneau(E, n, r, e, y, h, col, code, a0) {
  const L = 2 * r * Math.tan(Math.PI / n) + 0.01;
  for (let i = 0; i < n; i++) { const a = (a0 || 0) + (i / n) * TAU; E.box(Math.sin(a) * r, y + h / 2, Math.cos(a) * r, L, h, e, col, code, a); }
}
// un disque plein approché (n rayons)
function c18Disque(E, n, r, y, h, col, code) { for (let i = 0; i < n; i++) E.box(0, y + h / 2, 0, r * 2, h, r * 2 * Math.tan(Math.PI / n / 2) * 2.2, col, code, (i / n) * Math.PI); }
// une pile de jetons
function c18Pile(E, x, z, n, col, y) { for (let k = 0; k < n; k++) E.box(x, (y || 0) + 0.012 + k * 0.022, z, 0.07, 0.02, 0.07, k % 2 ? C18C.creme : col, TL.plain, k * 0.4); }
// le pied tourné d'une table (acajou, bague de laiton)
function c18Pied(E, x, z, h) { E.bx(x, 0, z, 0.1, h, 0.1, C18C.acajou, TL.darkwood); E.bx(x, h * 0.3, z, 0.13, 0.05, 0.13, C18C.laiton, TL.metal); E.bx(x, 0, z, 0.14, 0.06, 0.14, C18C.acajouF, TL.darkwood); }
// une carte posée (dos rouge, ou face)
function c18Carte(E, x, z, y, r, face) { E.box(x, y, z, 0.09, 0.006, 0.13, face ? C18C.email : C18C.rouge, TL.paper, r || 0); if (face) E.box(x - 0.02, y + 0.004, z - 0.035, 0.022, 0.003, 0.022, face === 2 ? C18C.rouge : C18C.noir, TL.plain, r || 0); }

Object.assign(PROP_MODELS, {
  // ------------------------------------------------------------- la table de roulette (le cylindre est un objet animé à part)
  c18_roulette(E) {
    for (const [x, z] of [[-1.45, -0.62], [1.45, -0.62], [-1.45, 0.62], [1.45, 0.62]]) c18Pied(E, x, z, 0.8);
    E.bx(0, 0.8, 0, 3.3, 0.08, 1.6, C18C.acajou, TL.darkwood);
    E.bx(0, 0.84, 0, 3.4, 0.06, 1.7, C18C.acajouF, TL.darkwood);
    E.bx(0, 0.885, 0, 3.15, 0.012, 1.45, C18C.tapis, TL.cloth);
    // le tableau des mises : le zéro, trois rangées de douze, les douzaines, les chances simples
    E.bx(-1.42, 0.895, -0.05, 0.16, 0.006, 0.66, C18C.vert, TL.plain);
    for (let c = 0; c < 12; c++) for (let r = 0; r < 3; r++) {
      const n = c * 3 + 3 - r, x = -1.25 + c * 0.15, z = -0.27 + r * 0.22;
      E.bx(x + 0.075, 0.895, z, 0.13, 0.006, 0.19, C18_ROUGES.has(n) ? C18C.rouge : C18C.noir, TL.plain);
    }
    for (let d = 0; d < 3; d++) E.bx(-1.25 + d * 0.6 + 0.3, 0.895, 0.43, 0.56, 0.006, 0.14, C18C.tapisF, TL.plain);
    for (let k = 0; k < 6; k++) E.bx(-1.25 + k * 0.3 + 0.15, 0.895, 0.6, 0.27, 0.006, 0.12, k === 2 ? C18C.rouge : k === 3 ? C18C.noir : C18C.tapisF, TL.plain);
    // la cuvette du cylindre (le plateau tourne à part : c18_cylindre)
    c18Anneau(E, 16, 0.5, 0.08, 0.9, 0.12, C18C.acajou, TL.darkwood);
    E.bx(1.12, 0.9, 0, 0.9, 0.02, 0.9, C18C.acajouF, TL.darkwood);
    // le râteau du croupier, des jetons
    E.box(0.2, 0.91, 0.62, 0.9, 0.012, 0.02, C18C.acajou, TL.wood, 0.3); E.box(-0.22, 0.91, 0.75, 0.2, 0.012, 0.04, C18C.acajou, TL.wood, 0.3);
    c18Pile(E, 0.9, 0.62, 6, C18C.rouge, 0.89); c18Pile(E, 0.78, 0.66, 4, C18C.vert, 0.89); c18Pile(E, 0.68, 0.6, 8, C18C.noir, 0.89);
  },
  // le cylindre de la roulette : il tourne (C18_ROUE), la bille court sur la piste
  c18_cylindre(E, o) {
    const R = C18_ROUE, y = 0.92;
    E.bx(0, y, 0, 0.84, 0.03, 0.84, C18C.acajouF, TL.darkwood);
    for (let i = 0; i < 37; i++) {
      const n = C18_CYLINDRE[i], a = R.a + (i / 37) * TAU, r = 0.3;
      E.box(Math.sin(a) * r, y + 0.04, Math.cos(a) * r, 0.05, 0.012, 0.1, n === 0 ? C18C.vert : C18_ROUGES.has(n) ? C18C.rouge : C18C.noir, TL.plain, a);
      E.box(Math.sin(a + Math.PI / 37) * r, y + 0.05, Math.cos(a + Math.PI / 37) * r, 0.006, 0.03, 0.1, C18C.laiton, TL.metal, a);
    }
    E.box(0, y + 0.05, 0, 0.3, 0.04, 0.3, C18C.acajou, TL.darkwood, R.a); E.box(0, y + 0.05, 0, 0.3, 0.04, 0.3, C18C.acajou, TL.darkwood, R.a + Math.PI / 4);
    E.box(0, y + 0.12, 0, 0.04, 0.12, 0.04, C18C.laiton, TL.metal);
    for (let k = 0; k < 4; k++) { const a = R.a + k * Math.PI / 2; E.box(Math.sin(a) * 0.08, y + 0.17, Math.cos(a) * 0.08, 0.02, 0.02, 0.14, C18C.laiton, TL.metal, a); }
    E.box(Math.sin(R.b) * R.rb, y + R.hb + 0.04, Math.cos(R.b) * R.rb, 0.028, 0.028, 0.028, C18C.ivoire, TL.plain);
  },
  // ------------------------------------------------------------- le vingt-et-un : une table en demi-lune (le croupier côté plat, en +z)
  c18_table21(E) {
    for (const [x, z] of [[-0.9, 0.25], [0.9, 0.25], [0, -0.5]]) c18Pied(E, x, z, 0.8);
    for (let i = 0; i < 9; i++) {
      const dz = i * 0.13, w = 2 * Math.sqrt(Math.max(0.1, 1.21 - dz * dz));
      E.bx(0, 0.8, 0.45 - dz, w, 0.08, 0.14, C18C.acajou, TL.darkwood);
      E.bx(0, 0.88, 0.45 - dz, Math.max(0.4, w - 0.16), 0.012, 0.14, C18C.tapis, TL.cloth);
    }
    // les places des joueurs (des cases dessinées), le sabot, les jetons de la banque
    for (let k = -2; k <= 2; k++) E.box(k * 0.36, 0.893, -0.38 + Math.abs(k) * 0.08, 0.16, 0.004, 0.12, C18C.creme, TL.plain, -k * 0.25);
    E.bx(0.75, 0.89, 0.32, 0.16, 0.12, 0.26, C18C.acajouF, TL.darkwood); E.box(0.75, 1.0, 0.2, 0.12, 0.02, 0.06, C18C.rouge, TL.paper, 0, -0.5);
    for (let k = 0; k < 5; k++) c18Pile(E, -0.5 + k * 0.1, 0.32, 5 + (k % 3), [C18C.rouge, C18C.noir, C18C.vert, C18C.or, C18C.rouge][k], 0.89);
    c18Carte(E, -0.05, 0.05, 0.895, 0.1, 1); c18Carte(E, 0.07, 0.07, 0.895, -0.15, 2);
  },
  // ------------------------------------------------------------- le baccara : la grande table ovale, le sabot, la cagnotte
  c18_baccara(E) {
    for (const [x, z] of [[-1.1, -0.4], [1.1, -0.4], [-1.1, 0.4], [1.1, 0.4]]) c18Pied(E, x, z, 0.8);
    for (let i = 0; i < 7; i++) { const t = (i - 3) / 3.4, w = 2.9 * Math.sqrt(1 - t * t); E.bx(0, 0.8, t * 0.72, w, 0.08, 0.22, C18C.acajou, TL.darkwood); E.bx(0, 0.88, t * 0.72, w - 0.16, 0.012, 0.22, C18C.tapis, TL.cloth); }
    // les trois cases : punto, banco, égalité
    E.bx(-0.55, 0.893, -0.1, 0.5, 0.004, 0.3, C18C.creme, TL.plain); E.bx(0.55, 0.893, -0.1, 0.5, 0.004, 0.3, C18C.creme, TL.plain); E.bx(0, 0.893, -0.3, 0.36, 0.004, 0.16, C18C.or, TL.plain);
    E.bx(0, 0.893, 0.3, 0.25, 0.1, 0.18, C18C.acajouF, TL.darkwood); // la cagnotte (une fente dans la table)
    E.bx(-0.9, 0.89, 0.25, 0.18, 0.13, 0.3, C18C.acajouF, TL.darkwood); E.box(-0.9, 1.01, 0.12, 0.13, 0.02, 0.07, C18C.rouge, TL.paper, 0, -0.5);
    c18Carte(E, -0.3, 0.05, 0.895, 0.1, 1); c18Carte(E, -0.18, 0.06, 0.895, 0.05, 2); c18Carte(E, 0.3, 0.06, 0.895, -0.1, 1); c18Carte(E, 0.42, 0.04, 0.895, -0.05, 2);
    c18Pile(E, 0.9, 0.3, 7, C18C.noir, 0.89); c18Pile(E, 0.78, 0.33, 5, C18C.rouge, 0.89);
  },
  // ------------------------------------------------------------- le passe-dix : une table à rebords, le cornet, trois dés
  c18_des(E) {
    for (const [x, z] of [[-0.85, -0.45], [0.85, -0.45], [-0.85, 0.45], [0.85, 0.45]]) c18Pied(E, x, z, 0.78);
    E.bx(0, 0.78, 0, 1.9, 0.08, 1.1, C18C.acajou, TL.darkwood);
    E.bx(0, 0.86, 0, 1.7, 0.01, 0.9, C18C.tapis, TL.cloth);
    for (const s of [-1, 1]) { E.bx(0, 0.86, s * 0.5, 1.9, 0.14, 0.1, C18C.acajouF, TL.darkwood); E.bx(s * 0.9, 0.86, 0, 0.1, 0.14, 1.1, C18C.acajouF, TL.darkwood); }
    E.bx(-0.45, 0.873, -0.15, 0.6, 0.004, 0.3, C18C.creme, TL.plain); E.bx(0.45, 0.873, -0.15, 0.6, 0.004, 0.3, C18C.creme, TL.plain); E.bx(0, 0.873, 0.18, 0.4, 0.004, 0.2, C18C.or, TL.plain);
    E.bx(0.62, 0.87, 0.25, 0.12, 0.18, 0.12, C18C.noir, TL.leather);
    for (const [x, z, r] of [[-0.1, 0.1, 0.2], [0.02, 0.06, 0.9], [0.12, 0.14, 0.4]]) E.box(x, 0.9, z, 0.05, 0.05, 0.05, C18C.ivoire, TL.plain, r);
    E.box(0.3, 0.875, -0.3, 0.8, 0.02, 0.025, C18C.acajou, TL.wood, 0.4); // le bâton du croupier
  },
  // ------------------------------------------------------------- le bandit manchot (une machine de fonte venue d'Amérique)
  c18_bandit(E, o) {
    const lev = (o.data && o.data.lev) || 0;
    E.bx(0, 0, 0, 0.5, 0.75, 0.42, C18C.acajou, TL.darkwood);
    E.bx(0, 0.75, 0, 0.56, 0.08, 0.48, C18C.acajouF, TL.darkwood);
    E.bx(0, 0.83, -0.02, 0.5, 0.72, 0.4, C18C.fonte, TL.iron);
    E.box(0, 1.6, -0.02, 0.5, 0.16, 0.4, C18C.fonte, TL.iron, 0, 0.2); // (le dôme)
    for (const s of [-1, 1]) E.bx(s * 0.25, 0.83, 0.17, 0.04, 0.72, 0.04, C18C.or, TL.gold);
    E.bx(0, 1.48, 0.19, 0.46, 0.05, 0.02, C18C.or, TL.gold); E.bx(0, 0.86, 0.19, 0.46, 0.04, 0.02, C18C.or, TL.gold);
    // la fenêtre : trois rouleaux (une cloche, un cœur, un fer à cheval)
    E.bx(0, 1.12, 0.185, 0.38, 0.2, 0.02, C18C.email, TL.plain);
    const sym = [C18C.or, C18C.rouge, C18C.fonte];
    for (let k = 0; k < 3; k++) { E.bx(-0.12 + k * 0.12, 1.17, 0.198, 0.06, 0.08, 0.006, sym[k], TL.plain); E.bx(-0.06 + k * 0.12, 1.12, 0.198, 0.008, 0.2, 0.008, C18C.fonte, TL.iron); }
    E.bx(0, 0.98, 0.2, 0.14, 0.04, 0.04, C18C.laiton, TL.metal); // la fente des jetons
    E.bx(0, 0.88, 0.22, 0.24, 0.05, 0.08, C18C.laiton, TL.metal); // le bac
    // le bras, sur le côté droit
    E.bx(0.28, 1.1, 0, 0.06, 0.1, 0.1, C18C.laiton, TL.metal);
    E.box(0.33, 1.1 + Math.cos(lev) * 0.22, Math.sin(lev) * 0.22, 0.035, 0.44, 0.035, C18C.laiton, TL.metal, 0, lev);
    E.box(0.33, 1.1 + Math.cos(lev) * 0.45, Math.sin(lev) * 0.45, 0.08, 0.08, 0.08, C18C.rouge, TL.plain);
  },
  // ------------------------------------------------------------- la caisse : un comptoir et sa grille de laiton (le guichet en +z)
  c18_caisse(E) {
    E.bx(0, 0, 0, 2.2, 1.05, 0.6, C18C.acajou, TL.darkwood);
    E.bx(0, 1.05, 0, 2.3, 0.06, 0.7, C18C.marbre, TL.stone);
    for (let k = 0; k < 15; k++) { const x = -1.05 + k * 0.15; if (Math.abs(x) < 0.25) continue; E.bx(x, 1.11, 0.25, 0.025, 1.2, 0.025, C18C.laiton, TL.metal); }
    E.bx(0, 2.31, 0.25, 2.2, 0.08, 0.06, C18C.laiton, TL.metal); E.bx(0, 1.62, 0.25, 0.5, 0.04, 0.05, C18C.laiton, TL.metal);
    E.bx(0, 2.39, 0.22, 1.1, 0.26, 0.04, C18C.noir, TL.darkwood); E.bx(0, 2.44, 0.245, 0.9, 0.12, 0.01, C18C.or, TL.gold); // la plaque « CAISSE »
    E.bx(0, 1.11, -0.1, 0.5, 0.02, 0.3, C18C.vert, TL.cloth);
    c18Pile(E, -0.15, -0.15, 9, C18C.rouge, 1.11); c18Pile(E, -0.02, -0.18, 6, C18C.noir, 1.11); c18Pile(E, 0.12, -0.14, 11, C18C.or, 1.11);
  },
  // ------------------------------------------------------------- le bar : comptoir à dessus de marbre, barre de laiton (data.L : la longueur)
  c18_bar(E, o) {
    const L = (o.data && o.data.L) || 4;
    E.bx(0, 0, 0, L, 1.05, 0.6, C18C.acajou, TL.darkwood);
    for (let x = -L / 2 + 0.4; x < L / 2 - 0.2; x += 0.8) E.bx(x, 0.2, 0.305, 0.5, 0.65, 0.01, C18C.acajouF, TL.darkwood);
    E.bx(0, 1.05, 0.02, L + 0.1, 0.06, 0.72, C18C.marbre, TL.stone);
    E.bx(0, 0.15, 0.42, L, 0.04, 0.04, C18C.laiton, TL.metal);
    for (let x = -L / 2 + 0.3; x < L / 2; x += 1.1) E.bx(x, 0, 0.42, 0.03, 0.15, 0.03, C18C.laiton, TL.metal);
    // des verres, une carafe
    for (const [x, z] of [[-1.1, 0.1], [-0.2, 0.15], [0.9, 0.05]]) { E.bx(x, 1.11, z, 0.05, 0.09, 0.05, C18C.verreClair, TL.glass); E.bx(x, 1.11, z, 0.035, 0.04, 0.035, C18C.or, TL.plain); }
    E.bx(0.4, 1.11, 0, 0.1, 0.24, 0.1, C18C.verreClair, TL.glass);
  },
  // les bouteilles au mur, derrière le bar (data.L)
  c18_bouteilles(E, o) {
    const L = (o.data && o.data.L) || 4;
    E.fl = FX_EMIT; E.bx(0, 1.2, 0.0, L - 0.3, 1.3, 0.02, rgbf('#4a5560'), TL.plain); E.fl = 0; // le miroir
    for (const y of [1.25, 1.75, 2.25]) E.bx(0, y, 0.12, L, 0.04, 0.24, C18C.acajou, TL.darkwood);
    E.bx(0, 2.6, 0.08, L + 0.1, 0.12, 0.3, C18C.acajouF, TL.darkwood);
    const cols = ['#2a5a2a', '#6a1a24', '#c89a40', '#e8e0c8', '#3a2a1a', '#7a9a3a', '#4a2a5a'];
    let k = 0;
    for (const y of [1.29, 1.79, 2.29]) for (let x = -L / 2 + 0.2; x < L / 2 - 0.1; x += 0.17) {
      const c = rgbf(cols[(k * 5 + 3) % cols.length]), h = 0.26 + ((k * 7) % 5) * 0.03;
      E.bx(x, y, 0.12, 0.07, h, 0.07, c, TL.glass); E.bx(x, y + h, 0.12, 0.03, 0.07, 0.03, c, TL.glass); k++;
    }
  },
  // ------------------------------------------------------------- le lustre (pendu au plafond : l'origine est au plafond, data.h la chaîne)
  c18_lustre(E, o) {
    const h = (o.data && o.data.h) || 0.9, lit = !!(o.data && o.data.lit);
    E.box(0, -h / 2, 0, 0.03, h, 0.03, C18C.laiton, TL.metal);
    E.box(0, -0.04, 0, 0.3, 0.06, 0.3, C18C.or, TL.gold);
    const y = -h - 0.2;
    E.box(0, y + 0.1, 0, 0.12, 0.4, 0.12, C18C.or, TL.gold);
    c18Anneau(E, 10, 0.55, 0.05, y, 0.06, C18C.or, TL.gold);
    c18Anneau(E, 8, 0.32, 0.04, y + 0.3, 0.05, C18C.or, TL.gold);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * TAU, x = Math.sin(a) * 0.55, z = Math.cos(a) * 0.55;
      E.box(x * 0.5, y + 0.03, z * 0.5, 0.02, 0.02, 0.55, C18C.or, TL.gold, a);
      E.bx(x, y + 0.06, z, 0.035, 0.14, 0.035, C18C.bougie, TL.plain);
      if (lit) { E.fl = FX_EMIT; E.bx(x, y + 0.2, z, 0.025, 0.05, 0.025, C18C.flamme, TL.flame); E.fl = 0; }
      E.box(x * 0.97, y - 0.12, z * 0.97, 0.03, 0.14, 0.03, C18C.verreClair, TL.glass, a); // les pendeloques
    }
    for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + 0.3; E.box(Math.sin(a) * 0.32, y + 0.2, Math.cos(a) * 0.32, 0.025, 0.12, 0.025, C18C.verreClair, TL.glass); }
    E.box(0, y - 0.3, 0, 0.08, 0.2, 0.08, C18C.verreClair, TL.glass, 0.4);
  },
  // ------------------------------------------------------------- le piano droit (le pianiste ne joue que la nuit, quand on ne le regarde pas)
  c18_piano(E) {
    E.bx(0, 0, 0, 1.5, 1.3, 0.6, C18C.noir, TL.darkwood);
    E.bx(0, 0.7, 0.32, 1.45, 0.06, 0.32, C18C.noir, TL.darkwood);
    E.bx(0, 0.74, 0.3, 1.3, 0.025, 0.2, C18C.ivoire, TL.plain);
    for (let k = 0; k < 18; k++) if (k % 7 !== 2 && k % 7 !== 6) E.bx(-0.6 + k * 0.071 + 0.035, 0.765, 0.25, 0.03, 0.025, 0.11, C18C.noir, TL.plain);
    E.bx(0, 0, 0.3, 0.06, 0.7, 0.06, C18C.noir, TL.darkwood);
    for (const s of [-0.5, 0.5]) { E.bx(s, 1.3, 0.1, 0.08, 0.2, 0.08, C18C.laiton, TL.metal); E.bx(s, 1.5, 0.1, 0.05, 0.08, 0.05, C18C.bougie, TL.plain); }
    E.box(0, 1.0, 0.27, 0.5, 0.3, 0.02, C18C.creme, TL.paper, 0, -0.2);
  },
  c18_tabouret(E) { E.bx(0, 0, 0, 0.06, 0.48, 0.06, C18C.noir, TL.darkwood); E.bx(0, 0, 0, 0.3, 0.04, 0.3, C18C.noir, TL.darkwood); E.bx(0, 0.48, 0, 0.38, 0.08, 0.38, C18C.velours, TL.cloth); },
  // ------------------------------------------------------------- un guéridon (table ronde à pied central) et ses verres
  c18_gueridon(E, o) {
    E.bx(0, 0, 0, 0.4, 0.05, 0.4, C18C.acajouF, TL.darkwood); E.bx(0, 0, 0, 0.07, 0.72, 0.07, C18C.acajou, TL.darkwood);
    c18Disque(E, 6, 0.36, 0.72, 0.04, C18C.marbre, TL.stone);
    if (!(o.data && o.data.vide)) { E.bx(0.1, 0.76, 0.05, 0.05, 0.1, 0.05, C18C.verreClair, TL.glass); E.bx(-0.12, 0.76, -0.04, 0.06, 0.2, 0.06, rgbf('#2a5a2a'), TL.glass); }
  },
  // ------------------------------------------------------------- un grand tapis (data.w, data.d) à bordure
  c18_tapis(E, o) {
    const w = (o.data && o.data.w) || 4, d = (o.data && o.data.d) || 3, c = rgbf((o.data && o.data.c) || '#6a1a20');
    E.bx(0, -0.005, 0, w, 0.02, d, c, TL.blanket);
    E.bx(0, 0.0, 0, w - 0.3, 0.02, d - 0.3, rgbf('#c8a050'), TL.cloth);
    E.bx(0, 0.005, 0, w - 0.4, 0.02, d - 0.4, c, TL.plaid);
    E.box(0, 0.017, 0, Math.min(w, d) * 0.4, 0.005, Math.min(w, d) * 0.4, rgbf('#c8a050'), TL.cloth, Math.PI / 4);
  },
  // ------------------------------------------------------------- un palmier (ou un oranger) dans sa caisse
  c18_palmier(E, o) {
    E.bx(0, 0, 0, 0.6, 0.55, 0.6, rgbf('#3a5a4a'), TL.wood); for (const s of [-1, 1]) for (const t of [-1, 1]) E.bx(s * 0.28, 0, t * 0.28, 0.07, 0.6, 0.07, C18C.or, TL.gold);
    E.bx(0, 0.55, 0, 0.5, 0.03, 0.5, rgbf('#3a2a1a'), TL.soil);
    E.bx(0, 0.55, 0, 0.09, 1.1, 0.09, rgbf('#6a5030'), TL.bark);
    for (let i = 0; i < 7; i++) { const a = (i / 7) * TAU; E.box(Math.sin(a) * 0.38, 1.6, Math.cos(a) * 0.38, 0.22, 0.03, 0.85, i % 2 ? C18C.feuille : C18C.feuilleF, TL.leaves, a, -0.45); }
    if (o.data && o.data.oranges) for (let i = 0; i < 5; i++) { const a = i * 1.3; E.box(Math.sin(a) * 0.25, 1.35 + (i % 2) * 0.15, Math.cos(a) * 0.25, 0.07, 0.07, 0.07, rgbf('#e88a20'), TL.plain); }
  },
  // ------------------------------------------------------------- une haute fenêtre (posée contre un mur : data.w, data.h ; data.dedans : le côté intérieur, avec ses rideaux)
  c18_fenetre(E, o) {
    const D = o.data || {}, w = D.w || 1.2, h = D.h || 2.6, nuit = !!D.lit;
    E.bx(0, -0.1, 0.0, w + 0.3, 0.12, 0.14, D.dedans ? C18C.creme : C18C.pierre, TL.stone);            // l'appui
    for (const s of [-1, 1]) E.bx(s * (w / 2 + 0.08), 0, 0.0, 0.16, h, 0.1, D.dedans ? C18C.creme : C18C.pierre, TL.stone);
    E.bx(0, h, 0.0, w + 0.32, 0.18, 0.12, D.dedans ? C18C.creme : C18C.pierre, TL.stone);
    if (!D.dedans) E.bx(0, h + 0.02, 0.04, 0.22, 0.26, 0.1, C18C.pierre, TL.stone);               // la clé de voûte
    if (nuit) E.fl = FX_EMIT;
    E.bx(0, 0.02, 0.0, w, h - 0.04, 0.03, nuit ? rgbf('#c89a50') : C18C.verre, TL.glass);
    E.fl = 0;
    E.bx(0, 0, 0.02, 0.05, h, 0.03, C18C.creme, TL.wood);
    for (let y = h / 4; y < h - 0.1; y += h / 4) E.bx(0, y, 0.02, w, 0.04, 0.03, C18C.creme, TL.wood);
    if (D.dedans) for (const s of [-1, 1]) {
      E.bx(s * (w / 2 + 0.28), -0.1, 0.06, 0.38, h + 0.4, 0.06, C18C.velours, TL.cloth);
      E.bx(s * (w / 2 + 0.28), h * 0.45, 0.1, 0.42, 0.06, 0.04, C18C.or, TL.gold);
    }
    if (D.dedans) E.bx(0, h + 0.18, 0.08, w + 1.2, 0.22, 0.1, C18C.veloursF, TL.cloth);
  },
  // ------------------------------------------------------------- la marquise de l'entrée : fer et verre, deux colonnes de fonte (data.w : la largeur)
  c18_marquise(E, o) {
    const w = (o.data && o.data.w) || 3.6, p = 1.8, y = 3.05;
    for (const s of [-1, 1]) { E.bx(s * (w / 2 - 0.2), 0, p - 0.25, 0.12, y, 0.12, C18C.fonte, TL.iron); E.bx(s * (w / 2 - 0.2), 0, p - 0.25, 0.22, 0.14, 0.22, C18C.fonte, TL.iron); E.bx(s * (w / 2 - 0.2), y - 0.25, p - 0.25, 0.2, 0.1, 0.2, C18C.or, TL.gold); }
    E.box(0, y + 0.18, p / 2, w, 0.04, p, C18C.verreClair, TL.glass, 0, -0.12);
    E.box(0, y + 0.1, p - 0.02, w + 0.1, 0.16, 0.06, C18C.fonte, TL.iron);
    for (let x = -w / 2; x <= w / 2 + 0.01; x += w / 6) E.box(x, y + 0.2, p / 2, 0.04, 0.05, p, C18C.fonte, TL.iron, 0, -0.12);
    for (let x = -w / 2 + 0.15; x < w / 2; x += 0.3) E.bx(x, y - 0.08, p - 0.02, 0.1, 0.1, 0.02, C18C.fonte, TL.iron);
  },
  // l'enseigne au-dessus de la porte : « GRAND CERCLE » en lettres d'or sur fond noir
  c18_enseigne(E) {
    const txt = 'GRAND CERCLE', px = 0.045, L = txt.length * 4 * px;
    E.bx(0, 0, 0, L + 0.3, 0.42, 0.06, C18C.noir, TL.darkwood);
    E.bx(0, -0.03, 0.0, L + 0.38, 0.04, 0.08, C18C.or, TL.gold); E.bx(0, 0.41, 0, L + 0.38, 0.04, 0.08, C18C.or, TL.gold);
    let x0 = -L / 2 + px;
    for (const ch of txt) {
      const G = C18_LETTRES[ch];
      if (G) for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) if (G[r][c] === '1') E.bx(x0 + c * px, 0.32 - r * px, 0.035, px * 0.9, px * 0.9, 0.012, C18C.or, TL.gold);
      x0 += 4 * px;
    }
  },
  // ------------------------------------------------------------- la balustrade du balcon (data.L, le long de x)
  c18_balustrade(E, o) {
    const L = (o.data && o.data.L) || 3;
    E.bx(0, 0.95, 0, L, 0.06, 0.08, C18C.fonte, TL.iron); E.bx(0, 0.08, 0, L, 0.04, 0.06, C18C.fonte, TL.iron);
    for (let x = -L / 2; x <= L / 2 + 0.01; x += 0.14) E.bx(x, 0.08, 0, 0.02, 0.87, 0.02, C18C.fonte, TL.iron);
    for (let x = -L / 2 + 0.35; x < L / 2; x += 0.7) E.box(x, 0.55, 0, 0.18, 0.18, 0.015, C18C.or, TL.gold, 0, 0, Math.PI / 4);
  },
  // la rampe de l'escalier : une main courante qui monte le long de z (data.L : la longueur, data.h : la hauteur gravie)
  c18_rampe(E, o) {
    const L = (o.data && o.data.L) || 6, h = (o.data && o.data.h) || 4.6, a = Math.atan2(h, L), n = Math.ceil(L / 0.42);
    E.box(0, h / 2 + 0.92, L / 2, 0.07, 0.07, Math.hypot(L, h), C18C.acajou, TL.darkwood, 0, -a);
    for (let i = 0; i < n; i++) { const z = (i + 0.5) * L / n, y = (i + 1) * h / n; E.bx(0, y - h / n, z, 0.035, 0.92 + h / n * 0.5, 0.035, C18C.laiton, TL.metal); }
    E.bx(0, 0, 0.05, 0.12, 1.05, 0.12, C18C.acajou, TL.darkwood); E.box(0, 1.1, 0.05, 0.13, 0.13, 0.13, C18C.laiton, TL.metal);
  },
  // ------------------------------------------------------------- à l'étage : le lit à baldaquin (la tête en -z)
  c18_lit(E) {
    E.bx(0, 0, 0, 1.9, 0.5, 2.2, C18C.acajou, TL.darkwood);
    E.bx(0, 0.5, 0.05, 1.8, 0.18, 2.05, C18C.creme, TL.blanket);
    E.bx(0, 0.62, 0.35, 1.84, 0.1, 1.4, C18C.velours, TL.blanket);
    for (const s of [-0.45, 0.45]) E.bx(s, 0.66, -0.75, 0.7, 0.16, 0.38, C18C.email, TL.pillow);
    E.bx(0, 0.5, -1.08, 1.9, 1.0, 0.08, C18C.acajou, TL.darkwood); E.bx(0, 1.5, -1.08, 1.6, 0.18, 0.1, C18C.or, TL.gold);
    for (const [x, z] of [[-0.92, -1.08], [0.92, -1.08], [-0.92, 1.08], [0.92, 1.08]]) { E.bx(x, 0, z, 0.1, 2.5, 0.1, C18C.acajou, TL.darkwood); E.bx(x, 2.5, z, 0.14, 0.12, 0.14, C18C.or, TL.gold); }
    E.bx(0, 2.45, 0, 2.0, 0.12, 2.3, C18C.velours, TL.cloth); // le ciel de lit
    for (const s of [-1, 1]) { E.bx(s * 0.98, 0.9, 0.9, 0.08, 1.55, 0.4, C18C.veloursF, TL.cloth); E.bx(s * 0.98, 0.9, -0.85, 0.08, 1.55, 0.4, C18C.veloursF, TL.cloth); }
    E.bx(0, 1.6, -1.12, 2.0, 0.85, 0.05, C18C.veloursF, TL.cloth);
  },
  // la baignoire de cuivre à pieds de lion (data.eau : remplie)
  c18_baignoire(E, o) {
    for (const [x, z] of [[-0.6, -0.25], [0.6, -0.25], [-0.6, 0.25], [0.6, 0.25]]) E.bx(x, 0, z, 0.1, 0.16, 0.1, C18C.or, TL.gold);
    E.bx(0, 0.14, 0, 1.6, 0.12, 0.6, C18C.cuivre, TL.metal);
    for (const s of [-1, 1]) { E.bx(0, 0.24, s * 0.33, 1.7, 0.42, 0.06, C18C.cuivre, TL.metal); E.bx(s * 0.83, 0.24, 0, 0.06, 0.42, 0.66, C18C.cuivre, TL.metal); }
    E.bx(0, 0.62, 0.0, 1.76, 0.04, 0.76, C18C.cuivre, TL.metal);
    E.bx(0, 0.26, 0, 1.6, 0.02, 0.6, C18C.email, TL.plain);
    if (o.data && o.data.eau) E.bx(0, 0.5, 0, 1.6, 0.02, 0.6, C18C.eau, TL.plain);
    E.bx(-0.85, 0.62, 0, 0.06, 0.32, 0.06, C18C.laiton, TL.metal); E.box(-0.78, 0.92, 0, 0.16, 0.04, 0.04, C18C.laiton, TL.metal);
  },
  // un paravent à trois feuilles
  c18_paravent(E) {
    for (let k = -1; k <= 1; k++) { const a = k * 0.35; E.box(k * 0.52, 0.85, Math.abs(k) * -0.12, 0.55, 1.7, 0.04, C18C.creme, TL.cloth, a); E.box(k * 0.52, 1.72, Math.abs(k) * -0.12, 0.6, 0.05, 0.06, C18C.acajou, TL.darkwood, a); }
    E.box(-0.52, 1.1, 0.0, 0.3, 0.3, 0.05, rgbf('#7a9a6a'), TL.leaves, 0.35); E.box(0.0, 0.7, 0.03, 0.3, 0.3, 0.05, rgbf('#b87a8a'), TL.flowers);
  },
  // le portrait du baron (un cadre doré, un homme en noir, un jeton dans la main ; data.voile : drapé de noir)
  c18_portrait(E, o) {
    const voile = !!(o.data && o.data.voile);
    E.bx(0, 0, 0, 1.0, 1.35, 0.06, C18C.or, TL.gold);
    E.bx(0, 0.08, 0.02, 0.84, 1.19, 0.04, rgbf('#2a2620'), TL.plain);
    E.bx(0, 0.08, 0.04, 0.5, 0.75, 0.01, rgbf('#141210'), TL.plain);
    E.bx(0, 0.82, 0.045, 0.2, 0.24, 0.01, rgbf('#d8b898'), TL.plain);
    E.bx(0, 1.03, 0.046, 0.22, 0.06, 0.01, rgbf('#2a1e18'), TL.plain);
    E.bx(-0.05, 0.92, 0.05, 0.03, 0.02, 0.005, C18C.noir, TL.plain); E.bx(0.05, 0.92, 0.05, 0.03, 0.02, 0.005, C18C.noir, TL.plain);
    E.bx(0.18, 0.45, 0.05, 0.05, 0.05, 0.005, C18C.noir, TL.plain);
    if (voile) E.bx(0, -0.05, 0.08, 1.1, 1.45, 0.03, C18C.noir, TL.cloth);
  },
  // un coffre de voyage cerclé de laiton (la malle du baron : data.ouverte)
  c18_malle(E, o) {
    const ouv = !!(o.data && o.data.ouverte);
    E.bx(0, 0, 0, 1.0, 0.5, 0.56, rgbf('#3a2a22'), TL.leather);
    for (const x of [-0.42, 0, 0.42]) E.bx(x, 0, 0, 0.05, 0.52, 0.58, C18C.laiton, TL.metal);
    if (ouv) E.box(0, 0.78, -0.3, 1.02, 0.56, 0.08, rgbf('#3a2a22'), TL.leather, 0, -0.2);
    else E.bx(0, 0.5, 0, 1.02, 0.14, 0.58, rgbf('#3a2a22'), TL.leather);
    E.bx(0, 0.42, 0.29, 0.1, 0.12, 0.02, C18C.laiton, TL.metal);
  },
  // la colonne de l'escalier (un pilier gainé de stuc, chapiteau doré)
  c18_colonne(E, o) {
    const h = (o.data && o.data.h) || 4.4;
    E.bx(0, 0, 0, 0.42, 0.25, 0.42, C18C.marbre, TL.stone); E.bx(0, 0.25, 0, 0.3, h - 0.55, 0.3, C18C.creme, TL.stone);
    E.bx(0, h - 0.3, 0, 0.44, 0.3, 0.44, C18C.or, TL.gold);
  },
});
Object.assign(PROP_COLL, {
  c18_roulette: [1.7, 0.85, 0.95], c18_table21: [1.2, 0.62, 0.95], c18_baccara: [1.5, 0.8, 0.95], c18_des: [0.95, 0.55, 1.0], c18_bandit: [0.3, 0.24, 1.7],
  c18_caisse: [1.15, 0.35, 2.5], c18_bar: null, c18_piano: [0.75, 0.32, 1.3], c18_gueridon: [0.2, 0.2, 0.8], c18_palmier: [0.3, 0.3, 1.2],
  c18_lit: [0.95, 1.1, 0.7], c18_baignoire: [0.85, 0.35, 0.65], c18_paravent: [0.8, 0.15, 1.7], c18_malle: [0.5, 0.28, 0.6], c18_colonne: [0.21, 0.21, 4.4],
  c18_tabouret: null, c18_tapis: null, c18_fenetre: null, c18_marquise: null, c18_enseigne: null, c18_balustrade: null, c18_rampe: null, c18_lustre: null,
  c18_bouteilles: null, c18_portrait: null, c18_cylindre: null,
});
Object.assign(PROP_LIGHTS, {
  c18_lustre: { c: [1.0, 0.76, 0.46], r: 11, y: -1.1, lit: true, flicker: true },
});
