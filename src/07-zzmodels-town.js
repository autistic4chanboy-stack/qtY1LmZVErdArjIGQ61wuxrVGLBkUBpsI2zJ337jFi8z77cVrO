// ============================================================================
//  DÉCOR DES VILLAGES (3D) : enseignes, panneau d'affichage, terrasse, bacs à
//  fleurs, étals garnis, cordes à linge, potagers, bois empilé, caisses, sacs,
//  charrettes, barre d'attache, monument, drapeau, four à pain, balançoire,
//  filets et séchoirs, nasses, wagonnets, rails, treuil, meule à aiguiser ;
//  tonneau de pluie de la ferme.
// ============================================================================
const PC4 = { iron: rgbf('#4a4c52'), rope: rgbf('#b89a6a'), paper: rgbf('#ece4cc'), stone: rgbf('#a8a498'), dark: [0.08, 0.07, 0.06] };
const _potM = new Float32Array(12), _potL = new Float32Array(12);
// dessine une culture dans un sous-repère (potagers, étals)
function drawCropAt(E, id, dx, dy, dz, k, ripe, vr) {
  const fn = CROP_MODELS[id];
  if (!fn) return;
  _potM.set(E.M);
  m34TR(_potL, dx, dy, dz, 0, (dx * 7 + dz * 3) % TAU, 0);
  m34Mul(E.M, _potM, _potL);
  E.recol = cropRecol(id, vr || 0);
  fn(E, k, ripe, vr ? { vr } : NOC);
  E.recol = null;
  E.M.set(_potM);
}
const ETAL_GOODS = {
  legumes: ['#e87a20', '#8ac058', '#d83020', '#7a1a40', '#f0e060'], fruits: ['#c82828', '#e8c040', '#4a50c8', '#e02030', '#9ac060'],
  fromages: ['#f0d070', '#e8c060', '#f4ecd0', '#d8a040'], tissus: ['#9a3a30', '#3a5a8a', '#c8a060', '#5a7a4a', '#e8e0d0'],
  poteries: ['#b8683a', '#a85a30', '#c87a48'], fleurs: ['#e03040', '#f0d020', '#f080a8', '#9a70d0', '#f4f0ec'], pains: ['#c48846', '#e0a050', '#b87838'],
  poissons: ['#a8b0b8', '#8a9aa0', '#c0c4c8'], minerai: ['#c8743a', '#9aa2ac', '#2a2a2e', '#b87840'],
};
// sous-repère temporaire (translation + rotation) pour dessiner un modèle dans un autre
function subFrame(E, dx, dy, dz, ry, fn) { _potM.set(E.M); m34TR(_potL, dx, dy, dz, 0, ry || 0, 0); m34Mul(E.M, _potM, _potL); fn(); E.M.set(_potM); }

Object.assign(PROP_MODELS, {
  tonneau_pluie(E) {
    E.bx(0, 0, 0, 0.62, 0.95, 0.62, WHITE, TL.barrel); E.bx(0, 0.03, 0, 0.62, 0.9, 0.62, WHITE, TL.barrel, Math.PI / 4);
    E.bx(0, 0.93, 0, 0.52, 0.025, 0.52, [0.3, 0.45, 0.55], TL.plain);
    E.bx(-0.36, 0.9, 0, 0.08, 1.95, 0.08, [0.45, 0.45, 0.48], TL.metal); E.box(-0.22, 1.0, 0, 0.28, 0.06, 0.07, [0.45, 0.45, 0.48], TL.metal);
  },
  // enseigne suspendue (o.data.k : pain, fer, graine, lettre, chope, mairie, garde)
  enseigne(E, o) {
    const k = (o.data && o.data.k) || 'pain';
    E.box(0, 2.95, -0.45, 0.05, 0.05, 0.9, PC4.iron, TL.iron); E.box(0, 2.72, -0.08, 0.04, 0.5, 0.04, PC4.iron, TL.iron, 0, 0.8);
    for (const z of [-0.28, -0.82]) E.bx(0, 2.62, z, 0.015, 0.33, 0.015, PC4.iron, TL.plain);
    E.bx(0, 1.98, -0.55, 0.06, 0.66, 0.74, WHITE, TL.darkwood);
    E.bx(0, 2.02, -0.55, 0.07, 0.58, 0.66, WHITE, TL.wood);
    for (const s of [-1, 1]) {
      const x = s * 0.045;
      switch (k) {
        case 'pain': E.box(x, 2.32, -0.55, 0.02, 0.14, 0.44, rgbf('#c48846'), TL.plain, 0, 0.35); E.box(x, 2.12, -0.55, 0.02, 0.1, 0.3, rgbf('#e0a050'), TL.plain); break;
        case 'fer': E.box(x, 2.34, -0.55, 0.02, 0.1, 0.4, PC4.iron, TL.plain); E.box(x, 2.2, -0.55, 0.02, 0.18, 0.14, PC4.iron, TL.plain); E.box(x, 2.08, -0.55, 0.02, 0.06, 0.3, PC4.iron, TL.plain); break;
        case 'graine': for (const dz of [-0.12, 0, 0.12]) { E.box(x, 2.18, -0.55 + dz, 0.02, 0.3, 0.025, rgbf('#8a9a3a'), TL.plain, 0, dz * 2); E.box(x, 2.38, -0.55 + dz * 1.5, 0.02, 0.1, 0.05, rgbf('#e0c060'), TL.plain); } break;
        case 'lettre': E.box(x, 2.25, -0.55, 0.02, 0.3, 0.44, PC4.paper, TL.plain); E.box(x * 1.2, 2.25, -0.55, 0.02, 0.07, 0.07, rgbf('#b02020'), TL.plain); break;
        case 'chope': E.box(x, 2.22, -0.58, 0.02, 0.32, 0.22, rgbf('#e0b040'), TL.plain); E.box(x, 2.4, -0.58, 0.02, 0.07, 0.24, PC4.paper, TL.plain); E.box(x, 2.22, -0.42, 0.02, 0.18, 0.06, rgbf('#a88030'), TL.plain); break;
        case 'mairie': E.box(x, 2.25, -0.72, 0.02, 0.32, 0.14, rgbf('#2a4aa0'), TL.plain); E.box(x, 2.25, -0.58, 0.02, 0.32, 0.14, PC4.paper, TL.plain); E.box(x, 2.25, -0.44, 0.02, 0.32, 0.14, rgbf('#c02a2a'), TL.plain); break;
        case 'garde': E.box(x, 2.28, -0.55, 0.02, 0.28, 0.08, PC4.iron, TL.plain); E.box(x, 2.14, -0.55, 0.02, 0.1, 0.24, PC4.iron, TL.plain); break;
        default: break;
      }
    }
  },
  panneau_affichage(E) {
    for (const s of [-0.72, 0.72]) E.bx(s, 0, 0, 0.09, 2.15, 0.09, WHITE, TL.darkwood);
    E.bx(0, 0.85, 0, 1.6, 1.05, 0.07, WHITE, TL.darkwood); E.bx(0, 0.9, -0.01, 1.45, 0.95, 0.07, rgbf('#a88a64'), TL.wood);
    E.box(0, 2.1, 0, 1.85, 0.07, 0.4, WHITE, TL.darkwood, 0, 0.2);
    for (const [x, y, w, h, c] of [[-0.45, 1.45, 0.34, 0.4, PC4.paper], [0.05, 1.5, 0.3, 0.3, rgbf('#e8d8a8')], [0.48, 1.4, 0.36, 0.44, PC4.paper], [-0.4, 1.0, 0.4, 0.3, rgbf('#f0e8d8')], [0.2, 1.02, 0.28, 0.36, rgbf('#d8c8b0')]]) {
      E.box(x, y, -0.05, w, h, 0.01, c, TL.paper); E.box(x, y + h / 2 - 0.03, -0.058, 0.03, 0.03, 0.01, rgbf('#b02020'), TL.plain);
    }
  },
  parasol(E, o) {
    const c = rgbf((o.data && o.data.c) || '#b83a30');
    E.bx(0, 0, 0, 0.05, 2.25, 0.05, WHITE, TL.wood); E.bx(0, 0, 0, 0.4, 0.06, 0.4, PC4.iron, TL.iron);
    E.box(0, 2.18, 0, 2.1, 0.06, 2.1, c, TL.stripes); E.box(0, 2.28, 0, 1.3, 0.1, 1.3, c, TL.stripes, 0.785); E.box(0, 2.36, 0, 0.5, 0.08, 0.5, c, TL.plain);
  },
  bac_fleurs(E, o) {
    const c = rgbf((o.data && o.data.c) || '#e03040');
    E.bx(0, 0, 0, 1.0, 0.2, 0.24, WHITE, TL.wood); E.bx(0, 0.2, 0, 0.94, 0.12, 0.2, WHITE, TL.flowers);
    for (let i = 0; i < 5; i++) E.box(-0.4 + i * 0.2, 0.36, (i % 2 ? 0.04 : -0.04), 0.07, 0.07, 0.07, i % 2 ? c : lightc(c, 1.15), TL.plain, i);
    E.box(-0.2, 0.18, -0.13, 0.05, 0.22, 0.02, rgbf('#4a8a3a'), TL.plain, 0, 0.3); E.box(0.3, 0.16, -0.13, 0.05, 0.2, 0.02, rgbf('#4a8a3a'), TL.plain, 0, 0.3);
  },
  // marchandises posées sur un étal (o.data.k)
  etal(E, o) {
    const k = (o.data && o.data.k) || 'legumes', G = ETAL_GOODS[k] || ETAL_GOODS.legumes;
    for (let i = 0; i < 4; i++) {
      const x = -1.0 + i * 0.66, c = rgbf(G[i % G.length]);
      if (k === 'fromages') { E.bx(x, 0, 0, 0.38, 0.14, 0.38, c, TL.plain); E.bx(x + 0.05, 0.14, 0.02, 0.3, 0.12, 0.3, c, TL.plain, 0.4); continue; }
      if (k === 'tissus') { for (let j = 0; j < 3; j++) E.bx(x, j * 0.07, 0, 0.5, 0.07, 0.38, rgbf(G[(i + j) % G.length]), TL.cloth); continue; }
      if (k === 'poteries') { E.bx(x - 0.1, 0, 0, 0.24, 0.3, 0.24, c, TL.terracotta); E.bx(x - 0.1, 0.3, 0, 0.16, 0.06, 0.16, c, TL.terracotta); E.bx(x + 0.17, 0, 0.05, 0.2, 0.18, 0.2, c, TL.terracotta); continue; }
      if (k === 'pains') { for (let j = 0; j < 3; j++) E.box(x - 0.15 + j * 0.15, 0.06, 0, 0.12, 0.1, 0.34, c, TL.bread, 0, 0, 0.1 * j); continue; }
      if (k === 'poissons') { E.bx(x, 0, 0, 0.55, 0.05, 0.42, [0.8, 0.88, 0.95], TL.plain); for (let j = 0; j < 3; j++) E.box(x, 0.07, -0.12 + j * 0.12, 0.42, 0.05, 0.08, c, TL.fish); continue; }
      E.bx(x, 0, 0, 0.55, 0.12, 0.42, WHITE, TL.wood);
      for (let j = 0; j < 6; j++) E.box(x - 0.17 + (j % 3) * 0.17, 0.15, -0.09 + (j >> 1 & 1) * 0.18, k === 'fleurs' ? 0.08 : 0.13, k === 'fleurs' ? 0.2 : 0.11, k === 'fleurs' ? 0.08 : 0.13, j % 2 ? c : lightc(c, 0.9), TL.plain, j);
    }
  },
  // étal complet (poteaux, auvent rayé, table garnie)
  etal_complet(E, o) {
    const c = rgbf((o.data && o.data.c) || '#b83a30'), k = (o.data && o.data.k) || 'legumes';
    for (const [x, z] of [[-1.35, -0.85], [1.35, -0.85], [-1.35, 0.85], [1.35, 0.85]]) E.bx(x, 0, z, 0.1, z < 0 ? 2.2 : 2.45, 0.1, WHITE, TL.wood);
    E.box(0, 2.36, 0, 3.0, 0.07, 2.1, c, TL.stripes, 0, -0.12);
    for (let i = 0; i < 6; i++) E.box(-1.25 + i * 0.5, 2.18, -1.07, 0.5, 0.18, 0.02, i % 2 ? c : [0.95, 0.93, 0.88], TL.cloth, 0, 0.12);
    E.bx(0, 0, -0.45, 2.6, 0.85, 0.75, WHITE, TL.wood); E.bx(0, 0, 0.55, 2.4, 0.45, 0.5, WHITE, mt(M_CRATE));
    subFrame(E, 0, 0.85, -0.45, 0, () => PROP_MODELS.etal(E, { data: { k } }));
  },
  corde_linge(E, o, t) {
    for (const s of [-1.8, 1.8]) E.bx(s, 0, 0, 0.07, 1.95, 0.07, WHITE, TL.wood);
    E.bx(0, 1.84, 0, 3.6, 0.015, 0.015, PC4.rope, TL.plain);
    const C = ['#e8e4d8', '#6a8ab0', '#c84a3a', '#f0ece0', '#8a9a5a'], sw = t ? t.wind : 0;
    for (let i = 0; i < 5; i++) {
      const x = -1.35 + i * 0.68, w = i % 2 ? 0.5 : 0.62, h = i % 2 ? 0.5 : 0.75, a = Math.sin((t ? t.t : 0) * 1.6 + i * 1.3 + sw) * 0.12;
      E.box(x, 1.84 - h / 2 * Math.cos(a), -h / 2 * Math.sin(a), w, h, 0.02, rgbf(C[(i + ((o.x * 3) | 0)) % C.length]), TL.cloth, 0, a);
      E.box(x - w * 0.35, 1.86, 0, 0.03, 0.06, 0.03, WHITE, TL.wood); E.box(x + w * 0.35, 1.86, 0, 0.03, 0.06, 0.03, WHITE, TL.wood);
    }
  },
  // potager (o.data.c : cultures ; o.data.k : pousse)
  potager(E, o) {
    const D = o.data || {}, cs = D.c || ['chou', 'carotte', 'laitue'], W = 2.4, P = 1.6;
    for (const [x, z, sx, sz] of [[0, -P / 2, W, 0.08], [0, P / 2, W, 0.08], [-W / 2, 0, 0.08, P], [W / 2, 0, 0.08, P]]) E.bx(x, 0, z, sx, 0.18, sz, WHITE, TL.darkwood);
    E.bx(0, 0, 0, W - 0.1, 0.12, P - 0.1, WHITE, TL.soil);
    for (let i = 0; i < 6; i++) { const x = -0.8 + (i % 3) * 0.8, z = i < 3 ? -0.4 : 0.4, id = cs[i % cs.length], k = clamp((D.k ?? 0.85) - (i % 2) * 0.15, 0.2, 1); drawCropAt(E, id, x, 0.12, z, k, k > 0.9, ((o.x * 7 + i) | 0) % 3 === 0 ? 1 : 0); }
  },
  tas_bois(E) {
    for (let r = 0; r < 3; r++) for (let i = 0; i < 5 - r; i++) E.box(-0.44 + i * 0.22 + r * 0.11, 0.1 + r * 0.19, 0, 0.2, 0.2, 1.0, WHITE, TL.bark, 0, 0, (i + r) * 0.4);
    for (const s of [-0.62, 0.62]) E.bx(s, 0, 0, 0.06, 0.7, 0.06, WHITE, TL.darkwood);
  },
  caisses(E, o) {
    const G = ETAL_GOODS[(o.data && o.data.k) || 'legumes'] || ETAL_GOODS.legumes;
    E.bx(-0.3, 0, 0, 0.6, 0.45, 0.5, WHITE, TL.wood); E.bx(0.35, 0, 0.05, 0.6, 0.45, 0.5, WHITE, TL.wood, 0.2); E.bx(0, 0.45, 0, 0.6, 0.45, 0.5, WHITE, TL.wood, -0.1);
    for (let j = 0; j < 6; j++) E.box(-0.18 + (j % 3) * 0.18, 0.95, -0.1 + (j >> 1 & 1) * 0.2, 0.14, 0.12, 0.14, rgbf(G[j % G.length]), TL.plain, j);
  },
  sacs(E) {
    for (const [x, z, r] of [[-0.3, 0, 0.2], [0.25, 0.08, -0.3], [0, -0.3, 0.9]]) { E.bx(x, 0, z, 0.45, 0.6, 0.3, rgbf('#c8b088'), TL.cloth, r); E.bx(x, 0.6, z, 0.2, 0.08, 0.15, rgbf('#8a6a3a'), TL.rope, r); }
    E.box(0.1, 0.38, 0.3, 0.45, 0.3, 0.6, rgbf('#b8a078'), TL.cloth, 0.3, 0, 1.35);
  },
  charrette(E, o) {
    const k = (o.data && o.data.k) || 'foin';
    E.bx(0, 0.5, 0, 1.3, 0.1, 1.8, WHITE, TL.wood);
    for (const s of [-0.66, 0.66]) E.bx(s, 0.6, 0, 0.05, 0.3, 1.8, WHITE, TL.darkwood);
    for (const s of [-0.72, 0.72]) { E.box(s, 0.45, 0.1, 0.08, 0.72, 0.72, WHITE, TL.darkwood); E.box(s, 0.45, 0.1, 0.08, 0.72, 0.72, WHITE, TL.darkwood, 0, 0.785); E.box(s * 1.04, 0.45, 0.1, 0.05, 0.14, 0.14, PC4.iron, TL.iron); }
    for (const s of [-0.4, 0.4]) E.box(s, 0.42, -1.45, 0.07, 0.07, 1.3, WHITE, TL.wood, 0, -0.12);
    if (k === 'foin') { E.bx(0, 0.6, 0.1, 1.2, 0.55, 1.5, WHITE, TL.hay); E.bx(0, 1.15, 0.1, 0.9, 0.3, 1.2, WHITE, TL.hay, 0.05); }
    else if (k === 'tonneaux') { for (const [x, z] of [[-0.3, -0.4], [0.3, -0.4], [0, 0.45]]) { E.bx(x, 0.6, z, 0.5, 0.7, 0.5, WHITE, TL.barrel); } }
    else { E.bx(-0.25, 0.6, 0.2, 0.6, 0.5, 0.6, WHITE, mt(M_CRATE)); E.bx(0.3, 0.6, -0.4, 0.5, 0.4, 0.5, WHITE, mt(M_CRATE)); E.bx(0.2, 0.6, 0.5, 0.45, 0.6, 0.3, rgbf('#c8b088'), TL.cloth); }
  },
  poteau_attache(E) {
    for (const s of [-0.95, 0.95]) E.bx(s, 0, 0, 0.12, 1.15, 0.12, WHITE, TL.darkwood);
    E.bx(0, 1.0, 0, 2.1, 0.1, 0.1, WHITE, TL.wood);
    for (const s of [-0.4, 0.4]) E.box(s, 0.9, -0.07, 0.12, 0.12, 0.02, PC4.iron, TL.iron, 0, 0, 0.785);
  },
  monument(E) {
    E.bx(0, 0, 0, 1.9, 0.3, 1.9, WHITE, TL.stone); E.bx(0, 0.3, 0, 1.4, 0.3, 1.4, WHITE, TL.stone);
    E.bx(0, 0.6, 0, 0.7, 1.9, 0.7, WHITE, TL.stone); E.bx(0, 2.5, 0, 0.5, 0.6, 0.5, WHITE, TL.stone); E.box(0, 3.2, 0, 0.36, 0.36, 0.36, WHITE, TL.stone, 0.785, 0.785);
    E.bx(0, 1.1, -0.36, 0.5, 0.7, 0.03, rgbf('#3a3a36'), TL.plain);
    for (let i = 0; i < 4; i++) E.bx(0, 1.25 + i * 0.13, -0.38, 0.36, 0.02, 0.01, rgbf('#c8b870'), TL.plain);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; E.box(Math.cos(a) * 0.22, 0.95 + Math.sin(a) * 0.22, -0.4, 0.09, 0.09, 0.05, rgbf('#3a6a2a'), TL.leaves, 0, 0, a); }
  },
  mat_drapeau(E, o, t) {
    E.bx(0, 0, 0, 0.5, 0.25, 0.5, WHITE, TL.stone); E.bx(0, 0.25, 0, 0.08, 6.5, 0.08, rgbf('#d8d4c8'), TL.plain); E.box(0, 6.8, 0, 0.14, 0.14, 0.14, rgbf('#c8a040'), TL.gold);
    const C = [rgbf('#2a4aa0'), rgbf('#f0ece4'), rgbf('#c02a2a')], tt = t ? t.t : 0;
    for (let i = 0; i < 6; i++) {
      const a0 = Math.sin(tt * 3 + i * 0.9) * 0.25 * (i / 6), x = 0.12 + i * 0.22, z = Math.sin(tt * 3 + i * 0.9 - 0.8) * 0.08 * i;
      E.box(x, 6.1, z, 0.23, 0.9, 0.02, C[Math.min(2, (i / 2) | 0)], TL.cloth, a0);
    }
  },
  four_pain(E) {
    E.bx(0, 0, 0, 1.9, 0.8, 1.9, WHITE, TL.stone);
    E.bx(0, 0.8, 0.05, 1.7, 0.45, 1.7, WHITE, TL.brick); E.bx(0, 1.25, 0.05, 1.3, 0.35, 1.3, WHITE, TL.brick); E.bx(0, 1.6, 0.05, 0.8, 0.25, 0.8, WHITE, TL.brick);
    E.bx(0, 0.85, -0.83, 0.55, 0.45, 0.06, [0.06, 0.05, 0.05], TL.plain); E.box(0, 1.33, -0.84, 0.7, 0.1, 0.1, WHITE, TL.stone);
    E.bx(0.45, 1.55, 0.45, 0.25, 0.7, 0.25, WHITE, TL.brick);
    E.bx(1.2, 0, -0.4, 0.3, 0.9, 0.9, WHITE, TL.bark); // fagots
  },
  balancoire(E, o, t) {
    for (const s of [-0.9, 0.9]) { E.box(s, 1.1, -0.35, 0.08, 2.3, 0.08, WHITE, TL.wood, 0, 0.3); E.box(s, 1.1, 0.35, 0.08, 2.3, 0.08, WHITE, TL.wood, 0, -0.3); }
    E.bx(0, 2.18, 0, 2.0, 0.1, 0.1, WHITE, TL.wood);
    const D = o.data || {}, a = Math.sin((t ? t.t : 0) * 1.25) * (D.hante ? 0.4 : 0.04), L = 1.7, cy = 2.18;
    for (const s of [-0.28, 0.28]) E.box(s, cy - L / 2 * Math.cos(a), L / 2 * Math.sin(a), 0.02, L, 0.02, PC4.rope, TL.plain, 0, -a);
    E.box(0, cy - L * Math.cos(a), L * Math.sin(a), 0.65, 0.05, 0.28, WHITE, TL.wood, 0, -a);
  },
  filet(E) {
    for (const s of [-1.3, 1.3]) E.bx(s, 0, 0, 0.08, 2.0, 0.08, WHITE, TL.wood);
    E.bx(0, 1.9, 0, 2.7, 0.05, 0.05, WHITE, TL.wood);
    for (let i = 0; i < 9; i++) E.bx(-1.2 + i * 0.3, 0.6, 0.02, 0.012, 1.3, 0.012, rgbf('#8a8a70'), TL.plain);
    for (let j = 0; j < 6; j++) E.bx(0, 0.65 + j * 0.22, 0.02, 2.5, 0.012, 0.012, rgbf('#8a8a70'), TL.plain);
    for (let i = 0; i < 5; i++) E.box(-1.0 + i * 0.5, 1.85, 0.05, 0.1, 0.08, 0.08, rgbf('#d8a040'), TL.plain);
  },
  sechoir(E) {
    for (const s of [-1.1, 1.1]) E.bx(s, 0, 0, 0.08, 1.8, 0.08, WHITE, TL.wood);
    for (const y of [1.2, 1.7]) { E.bx(0, y, 0, 2.3, 0.05, 0.05, WHITE, TL.wood); for (let i = 0; i < 6; i++) E.box(-0.9 + i * 0.36, y - 0.2, 0, 0.06, 0.32, 0.12, rgbf(i % 2 ? '#a8a090' : '#8a8070'), TL.fish, 0, 0, 0.1); }
  },
  nasse(E) {
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; E.bx(Math.cos(a) * 0.22, 0, Math.sin(a) * 0.22, 0.02, 0.45, 0.02, rgbf('#6a5a40'), TL.plain); }
    for (const y of [0.02, 0.22, 0.43]) E.bx(0, y, 0, 0.46, 0.02, 0.46, rgbf('#6a5a40'), TL.plain, 0.5);
    E.bx(0, 0.02, 0, 0.44, 0.02, 0.44, rgbf('#5a4a34'), TL.plain);
  },
  wagonnet(E, o) {
    E.bx(0, 0.25, 0, 0.9, 0.55, 1.2, PC4.iron, TL.iron); E.bx(0, 0.78, 0, 0.95, 0.06, 1.25, rgbf('#3a3a40'), TL.iron);
    for (const [x, z] of [[-0.42, -0.4], [0.42, -0.4], [-0.42, 0.4], [0.42, 0.4]]) E.box(x, 0.18, z, 0.08, 0.3, 0.3, [0.2, 0.2, 0.22], TL.iron, 0, 0.785);
    const ore = (o.data && o.data.ore) || '#3a3a40';
    for (let j = 0; j < 7; j++) E.box(-0.25 + (j % 3) * 0.25, 0.86 + (j % 2) * 0.06, -0.35 + (j >> 1) * 0.22, 0.2, 0.16, 0.2, rgbf(j % 3 ? ore : '#2a2a2e'), TL.coal, j);
  },
  rails(E) {
    for (const s of [-0.38, 0.38]) E.bx(s, 0.06, 0, 0.06, 0.06, 3.0, rgbf('#5a5a60'), TL.iron);
    for (let z = -1.3; z <= 1.31; z += 0.52) E.bx(0, 0, z, 1.0, 0.07, 0.16, WHITE, TL.darkwood);
  },
  treuil(E) {
    for (const s of [-0.55, 0.55]) { E.box(s, 0.7, -0.25, 0.1, 1.5, 0.1, WHITE, TL.wood, 0, 0.35); E.box(s, 0.7, 0.25, 0.1, 1.5, 0.1, WHITE, TL.wood, 0, -0.35); }
    E.box(0, 1.25, 0, 1.2, 0.3, 0.3, WHITE, TL.darkwood); E.box(0, 1.25, 0, 1.2, 0.3, 0.3, WHITE, TL.darkwood, 0, 0.785);
    E.box(0.68, 1.25, 0, 0.05, 0.05, 0.4, PC4.iron, TL.iron); E.box(0.72, 1.05, 0.18, 0.05, 0.4, 0.05, PC4.iron, TL.iron);
    E.box(0, 0.7, -0.12, 0.03, 1.1, 0.03, PC4.rope, TL.plain);
  },
  meule_aiguiser(E) {
    for (const s of [-0.28, 0.28]) E.bx(s, 0, 0, 0.08, 0.75, 0.5, WHITE, TL.darkwood);
    E.box(0, 0.75, 0, 0.14, 0.62, 0.62, PC4.stone, TL.stone); E.box(0, 0.75, 0, 0.14, 0.62, 0.62, PC4.stone, TL.stone, 0, 0.785);
    E.box(0.35, 0.75, 0, 0.3, 0.04, 0.04, PC4.iron, TL.iron); E.bx(0, 0.02, -0.45, 0.35, 0.05, 0.4, WHITE, TL.wood);
  },
  fers_rack(E) {
    E.bx(0, 1.2, 0, 1.0, 0.6, 0.05, WHITE, TL.darkwood);
    for (let i = 0; i < 4; i++) { const x = -0.34 + i * 0.23; E.box(x - 0.06, 1.5, -0.04, 0.03, 0.16, 0.02, PC4.iron, TL.iron); E.box(x + 0.06, 1.5, -0.04, 0.03, 0.16, 0.02, PC4.iron, TL.iron); E.box(x, 1.42, -0.04, 0.15, 0.03, 0.02, PC4.iron, TL.iron); }
  },
  boite_poste(E) {
    E.bx(0, 0, 0, 0.09, 1.05, 0.09, rgbf('#2a3a2a'), TL.iron); E.bx(0, 1.05, 0, 0.38, 0.48, 0.28, rgbf('#2a4a3a'), TL.iron);
    E.box(0, 1.53, 0, 0.42, 0.06, 0.32, rgbf('#2a4a3a'), TL.iron); E.bx(0, 1.35, -0.145, 0.2, 0.03, 0.01, [0.05, 0.05, 0.05], TL.plain); E.bx(0, 1.15, -0.145, 0.16, 0.1, 0.01, rgbf('#c8a040'), TL.gold);
  },
  cage_poules(E) {
    E.bx(0, 0, 0, 1.4, 0.06, 1.0, WHITE, TL.wood);
    for (let i = 0; i < 6; i++) E.bx(-0.65 + i * 0.26, 0.06, -0.48, 0.02, 0.6, 0.02, WHITE, TL.wood);
    for (let i = 0; i < 6; i++) E.bx(-0.65 + i * 0.26, 0.06, 0.48, 0.02, 0.6, 0.02, WHITE, TL.wood);
    E.bx(0, 0.66, 0, 1.44, 0.05, 1.04, WHITE, TL.wood); E.bx(0, 0.06, 0, 1.36, 0.08, 0.96, WHITE, TL.hay);
  },
});
Object.assign(PROP_COLL, {
  tonneau_pluie: [0.33, 0.33, 0.95], enseigne: null, panneau_affichage: [0.8, 0.1, 2.1], parasol: [0.06, 0.06, 2.2], bac_fleurs: null, etal: null,
  corde_linge: null, potager: null, tas_bois: [0.65, 0.55, 0.7], caisses: [0.65, 0.35, 0.9], sacs: [0.5, 0.35, 0.6], charrette: [0.75, 1.0, 1.2],
  poteau_attache: [1.05, 0.08, 1.15], monument: [0.95, 0.95, 3.2], mat_drapeau: [0.25, 0.25, 6.8], four_pain: [0.95, 0.95, 1.8], balancoire: null,
  filet: null, sechoir: null, nasse: [0.24, 0.24, 0.45], wagonnet: [0.48, 0.62, 0.9], rails: null, treuil: [0.6, 0.35, 1.5], meule_aiguiser: [0.35, 0.3, 1.0],
  fers_rack: null, boite_poste: [0.2, 0.15, 1.55], cage_poules: [0.7, 0.5, 0.7], etal_complet: [1.45, 0.95, 2.3],
});
