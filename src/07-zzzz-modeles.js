// ============================================================================
//  MODÈLES ET DESSINS EN PLUS
//  - sprites des plantes rares (lys des cimes, mousse des nains, asphodèle,
//    fleur de pierre), icônes des nouveaux objets, le fusil tenu en main ;
//  - objets posés : vitrine, trophée, séchoir, cristaux lumineux, stèles,
//    cascade, bouche de grotte, fente de falaise, pierres des Trois, statues des
//    Trois, le Dormeur, camp des géants, table d'alchimiste, piège à loup,
//    charrette, affiche d'avis de recherche, roue ;
//  - morphologies : poitrine et hanches, naturistes, nains, géants.
// ============================================================================

// ---------------------------------------------------------------- sprites des plantes rares
function spriteWild3(kind, seed) {
  const rnd = mulberry32(seed), W = 22, Hh = kind === 'mousse_nains' ? 12 : 28, pb = new PixelBuf(W, Hh);
  const px = (x, y, c, a) => pb.set(Math.round(x), Math.round(y), c, a);
  const stem = (x, top, col) => drawLine(pb, x, top, x, Hh - 1, col || PAL.stem[1]);
  switch (kind) {
    case 'lys_cimes':
      for (let i = 0; i < 2; i++) { const x = 7 + i * 8, top = 4 + i * 3; stem(x, top); for (let a = 0; a < 6; a++) { const aa = a / 6 * TAU; px(x + Math.cos(aa) * 3, top + Math.sin(aa) * 2, [244, 248, 255]); px(x + Math.cos(aa) * 2, top + Math.sin(aa) * 1.3, [214, 226, 245]); } px(x, top, [240, 210, 90]); drawLine(pb, x - 3, Hh - 6, x, Hh - 10, [60, 120, 70]); }
      break;
    case 'mousse_nains':
      for (let x = 1; x < W - 1; x++) for (let y = Hh - 6; y < Hh; y++) if (rnd() < 0.62 - (Hh - y) * 0.06) px(x, y, rnd() < 0.3 ? [255, 214, 90] : rnd() < 0.5 ? [200, 150, 50] : [150, 110, 40], rnd() < 0.3 ? EMISSIVE_A : 255);
      break;
    case 'asphodele':
      for (let i = 0; i < 3; i++) { const x = 5 + i * 6, top = 3 + rnd() * 5; stem(x, top); for (let b = 0; b < 9; b++) { px(x + (b % 2 ? 1 : -1), top + b * 1.6, [246, 236, 240]); px(x, top + b * 1.6 + 0.8, [210, 140, 170]); } drawLine(pb, x - 2, Hh - 1, x - 4, Hh - 8, [80, 110, 60]); }
      break;
    case 'fleur_temple':
      stem(11, 10, [110, 110, 104]);
      for (let a = 0; a < 8; a++) { const aa = a / 8 * TAU; for (let r = 1; r <= 5; r++) px(11 + Math.cos(aa) * r, 10 + Math.sin(aa) * r * 0.7, r > 3 ? [150, 150, 146] : [120, 120, 118]); }
      px(11, 10, [220, 200, 120], EMISSIVE_A);
      break;
  }
  return pb;
}
{
  const _afs = addFarmSprites;
  addFarmSprites = function (add) {
    _afs(add);
    for (const k of ['lys_cimes', 'mousse_nains', 'asphodele', 'fleur_temple']) add('w3_' + k, spriteWild3(k, 2203 + k.length * 31));
  };
}

// ---------------------------------------------------------------- icônes des nouveaux objets
{
  const _ip = iconPaint;
  iconPaint = function (shape, c1, c2) {
    const pb = new PixelBuf(16, 16), P = rampOf(c1 || '#aaaaaa');
    const L = (x0, y0, x1, y1, c, w) => drawLine(pb, x0, y0, x1, y1, typeof c === 'string' ? hexToRgb(c) : c, w || 1);
    const R = (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) pb.set(x, y, typeof c === 'string' ? hexToRgb(c) : c); };
    switch (shape) {
      case 'fusil': L(1, 11, 11, 5, [70, 70, 78], 2); L(9, 6, 15, 3, [60, 60, 66]); R(3, 8, 6, 9, [40, 40, 44]); L(1, 12, 4, 14, [110, 70, 40], 2); L(4, 12, 7, 10, [120, 80, 44], 2); R(5, 5, 9, 6, [30, 30, 34]); return pb;
      case 'cartouche': R(6, 3, 9, 12, [200, 60, 40]); R(6, 12, 9, 14, [200, 170, 70]); L(6, 3, 9, 3, [150, 40, 30]); return pb;
      case 'canon': L(2, 13, 14, 2, [90, 92, 100], 2); L(3, 13, 14, 3, [150, 152, 160]); return pb;
      case 'lunette': L(2, 11, 13, 4, [50, 50, 56], 3); pb.set(13, 4, [180, 220, 240]); pb.set(2, 11, [160, 200, 220]); L(7, 8, 8, 11, [120, 90, 50]); return pb;
      case 'roue': for (let a = 0; a < 40; a++) { const t = a / 40 * TAU; pb.set(Math.round(8 + Math.cos(t) * 6), Math.round(8 + Math.sin(t) * 6), [110, 80, 50]); pb.set(Math.round(8 + Math.cos(t) * 6.6), Math.round(8 + Math.sin(t) * 6.6), [70, 70, 76]); } for (let k = 0; k < 6; k++) { const t = k / 6 * TAU; L(8, 8, Math.round(8 + Math.cos(t) * 5), Math.round(8 + Math.sin(t) * 5), [140, 100, 60]); } R(7, 7, 8, 8, [60, 60, 60]); return pb;
      case 'attelle': R(4, 2, 5, 14, [190, 160, 110]); R(10, 2, 11, 14, [190, 160, 110]); for (const y of [4, 8, 12]) L(3, y, 12, y, [236, 232, 220]); return pb;
      case 'bandage': for (let y = 4; y < 13; y++) for (let x = 3; x < 13; x++) if ((x - 8) * (x - 8) + (y - 8.5) * (y - 8.5) < 22) pb.set(x, y, (x + y) % 3 ? [240, 236, 226] : [214, 208, 196]); R(7, 7, 9, 9, [200, 40, 40]); return pb;
    }
    return _ip(shape, c1, c2);
  };
}

// ---------------------------------------------------------------- le fusil tenu en main (repos, visée, tir)
function vmRifle(pose) {
  const pb = new PixelBuf(VM_W, VM_H), steel = ramp(['#2a2c30', '#3e4148', '#5a5e68', '#7e8490']), wood = ramp(['#4a2c16', '#6a4222', '#8a5a30', '#a8743e']);
  const up = pose === 1 ? -12 : 0, kick = pose === 2 ? 6 : 0;
  // crosse et fût
  fillPoly(pb, [[118, 92 + kick], [96, 80 + up + kick], [64, 64 + up + kick], [58, 70 + up + kick], [88, 90 + kick], [120, 100]], wood, (x, y) => 0.55 + (x - 60) * 0.004);
  // canon
  thickLine(pb, 64, 66 + up + kick, 12, 42 + up + kick, 4, steel, 0.7);
  // lunette
  thickLine(pb, 84, 66 + up + kick, 54, 52 + up + kick, 6, steel, 0.5);
  drawSphere(pb, 54, 52 + up + kick, 3.5, ramp(['#305060', '#70a0b8', '#c0e0f0']), 3);
  // mains
  drawSphere(pb, 70, 70 + up + kick, 8, SKIN_HAND, 2, { sq: 0.8 });
  fillPoly(pb, [[62, 76 + up + kick], [30, 100], [0, 100], [0, 88], [56, 66 + up + kick]], SLEEVE, () => 0.7);
  vmArm(pb, 104, 90 + kick);
  drawSphere(pb, 102, 88 + kick, 9, SKIN_HAND, 5, { sq: 0.9 });
  if (pose === 2) for (let k = 0; k < 14; k++) pb.set(10 - (k % 4), 40 + (k >> 2) - 2, [255, 220, 120], EMISSIVE_A);
  edgeDarken(pb, 0.8);
  return pb;
}
{
  const _bvm = buildViewModels;
  buildViewModels = function () { _bvm(); VM.fusil = [vmRifle(0), vmRifle(1), vmRifle(2)]; };
}

// ---------------------------------------------------------------- objets posés
const PC5 = { stone: rgbf('#9a968c'), dark: rgbf('#3a3840'), gold: rgbf('#d0b060'), crystal: [0.6, 0.85, 1.2], water: rgbf('#6a9ab8') };
Object.assign(PROP_MODELS, {
  vitrine(E, o) {
    E.bx(0, 0, 0, 1.2, 0.8, 0.6, WHITE, TL.darkwood);
    E.fl = FX_EMIT; E.bx(0, 0.8, 0, 1.1, 0.7, 0.5, [0.55, 0.62, 0.66], TL.glass); E.fl = 0;
    E.bx(0, 0.86, 0, 0.12, 0.2, 0.12, [0.62, 0.62, 0.6], TL.stone); E.bx(0, 1.06, 0, 0.22, 0.05, 0.22, [0.62, 0.62, 0.6], TL.stone);
    E.bx(0, 1.5, 0, 1.24, 0.05, 0.64, WHITE, TL.darkwood);
  },
  trophee(E) { E.bx(0, 0, 0, 0.5, 0.6, 0.06, WHITE, TL.darkwood); E.box(0, 0.35, 0.12, 0.2, 0.22, 0.25, rgbf('#9a6a3e'), TL.fur); for (const s of [-1, 1]) { E.box(s * 0.12, 0.55, 0.14, 0.04, 0.4, 0.04, rgbf('#cbb894'), TL.bone, 0, 0, s * 0.5); E.box(s * 0.2, 0.72, 0.14, 0.03, 0.2, 0.03, rgbf('#cbb894'), TL.bone, 0, 0, s * 1.1); } },
  sechoir_peaux(E) { for (const s of [-0.8, 0.8]) E.bx(s, 0, 0, 0.1, 1.8, 0.1, WHITE, TL.darkwood); E.bx(0, 1.7, 0, 1.8, 0.08, 0.08, WHITE, TL.wood); E.bx(-0.35, 0.8, 0, 0.6, 0.9, 0.03, rgbf('#8a5a34'), TL.leather); E.bx(0.35, 0.9, 0, 0.5, 0.8, 0.03, rgbf('#c8652a'), TL.fur); },
  roue_deco(E) { E.box(0, 0.45, 0, 0.08, 0.9, 0.9, WHITE, TL.darkwood); E.box(0, 0.45, 0, 0.1, 0.9, 0.9, WHITE, TL.darkwood, Math.PI / 4); },
  cristal_lumineux(E, o) {
    E.bx(0, 0, 0, 0.7, 0.25, 0.6, WHITE, TL.stone);
    E.fl = FX_EMIT;
    E.box(0, 0.7, 0, 0.22, 1.1, 0.22, PC5.crystal, TL.glass, 0.3, 0.1, 0.12);
    E.box(0.2, 0.45, 0.1, 0.14, 0.7, 0.14, PC5.crystal, TL.glass, 0.8, -0.3, 0.2);
    E.box(-0.18, 0.4, -0.08, 0.12, 0.55, 0.12, PC5.crystal, TL.glass, 1.4, 0.25, -0.2);
    E.fl = 0;
  },
  stele(E, o) {
    E.bx(0, 0, 0, 0.9, 1.9, 0.28, PC5.stone, TL.stone); E.bx(0, 1.9, 0, 0.7, 0.2, 0.28, PC5.stone, TL.stone);
    const aelin = o.data && INSCR_BY_ID[o.data.ins] && INSCR_BY_ID[o.data.ins].lang === 'aelin';
    for (let k = 0; k < 6; k++) E.bx(aelin ? -0.25 + k * 0.1 : -0.3 + (k % 3) * 0.3, aelin ? 0.5 : 0.6 + ((k / 3) | 0) * 0.5, 0.145, aelin ? 0.03 : 0.12, aelin ? 1.1 : 0.12, 0.01, [0.25, 0.22, 0.2], 0);
  },
  cascade(E, o, t) {
    const s = t ? t.t : 0;
    E.fl = FX_EMIT;
    for (let k = 0; k < 5; k++) { const y = 5.5 - ((s * 3.2 + k * 1.3) % 6); E.bx(-1.1 + k * 0.55, Math.max(0, y), 0.9, 0.45, Math.min(1.4, 6 - Math.max(0, y)), 0.08, [0.55, 0.7, 0.85], TL.glass); }
    E.fl = 0;
    E.bx(0, 5.6, 0.6, 3.4, 0.4, 0.8, WHITE, mt(M_ROCK));
    E.bx(0, -0.05, 1.8, 4, 0.1, 2.2, PC5.water, TL.plain);
  },
  grotte_bouche(E) { E.bx(0, 0, 0, 3.6, 3.4, 0.6, [0.05, 0.05, 0.06], 0); for (const s of [-1, 1]) E.bx(s * 2.1, -0.2, 0.1, 1.0, 4.2, 1.4, WHITE, mt(M_ROCK)); E.bx(0, 3.3, 0.1, 5.2, 1.2, 1.4, WHITE, mt(M_ROCK)); },
  fente_falaise(E) { E.bx(0, 0, 0, 0.5, 2.4, 0.4, [0.03, 0.03, 0.04], 0); E.bx(0, 1.0, 0.05, 0.7, 0.35, 0.35, [0.03, 0.03, 0.04], 0); for (const s of [-1, 1]) E.bx(s * 0.8, -0.3, 0.1, 1.1, 3.2, 0.6, WHITE, mt(M_ROCK)); },
  pierre_trois(E, o) {
    const k = o.data && o.data.k, c = k === 'aela' ? [1.2, 1.05, 0.7] : k === 'durn' ? [0.75, 0.72, 0.68] : [0.35, 0.3, 0.45];
    E.bx(0, 0, 0, 1.0, 1.3, 1.0, PC5.stone, TL.stone);
    E.fl = o.data && o.data.lit ? FX_EMIT : 0; E.bx(0, 1.3, 0, 0.7, 0.18, 0.7, c, TL.stone); E.fl = 0;
    E.bx(0, 0.55, 0.505, 0.4, 0.4, 0.02, c, 0);
  },
  statue_dieu(E, o) { // les Trois, taillés dans la pierre (quatre fois la taille d'un homme)
    const k = o.data && o.data.k, S = 4, c = k === 'aela' ? rgbf('#c8c0a8') : k === 'durn' ? rgbf('#8a8680') : rgbf('#4a4650');
    E.bx(0, 0, 0, 1.6 * S * 0.5, 0.5, 1.2 * S * 0.5, c, TL.stone);
    E.bx(0, 0.5, 0, 0.9 * S * 0.5, 2.6 * S * 0.5, 0.55 * S * 0.5, c, TL.stone);          // robe
    E.bx(0, 0.5 + 2.6 * S * 0.5, 0, 0.62 * S * 0.5, 0.9 * S * 0.5, 0.42 * S * 0.5, c, TL.stone); // buste
    E.bx(0, 0.5 + 3.5 * S * 0.5, 0, 0.34 * S * 0.5, 0.38 * S * 0.5, 0.34 * S * 0.5, c, TL.stone); // tête
    if (k === 'aela') { E.fl = FX_EMIT; E.box(0, 0.5 + 3.8 * S * 0.5, -0.4, 1.8, 1.8, 0.08, [1.3, 1.15, 0.7], TL.gold); E.fl = 0; for (const s of [-1, 1]) E.box(s * 1.1, 6.4, 0.1, 0.3, 2.2, 0.3, c, TL.stone, 0, 0, s * -2.4); }
    else if (k === 'durn') { for (const s of [-1, 1]) E.box(s * 0.95, 4.6, 0.3, 0.34, 1.6, 0.34, c, TL.stone, 0, 0.7, 0); E.bx(0, 7.5, 0, 1.0, 0.25, 1.0, c, TL.stone); }
    else { E.box(0, 7.4, -0.1, 0.9, 1.0, 0.9, [0.1, 0.1, 0.12], TL.coat); for (const s of [-1, 1]) E.box(s * 0.7, 4.2, 0.2, 0.25, 2.4, 0.25, c, TL.stone, 0, 0.2, s * 0.15); }
  },
  dormeur(E) { // Durn qui dort : une statue couchée de quatorze mètres
    const c = rgbf('#7a7670');
    E.bx(0, 0, 0, 7, 1.2, 16, WHITE, mt(M_STONE));
    E.bx(0, 1.2, 1.5, 4.4, 2.4, 8, c, TL.stone);  // corps
    E.bx(0, 1.2, -5.2, 3.4, 1.6, 5.2, c, TL.stone); // jambes
    E.bx(0, 1.4, 7.2, 2.2, 2.2, 2.4, c, TL.stone);  // tête
    E.bx(0, 3.4, 7.2, 1.4, 0.3, 1.6, c, TL.stone);  // nez
    for (const s of [-1, 1]) E.bx(s * 2.6, 1.2, 2.5, 0.9, 1.0, 6.5, c, TL.stone);
  },
  feu_geant(E, o, t) {
    for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; E.bx(Math.cos(a) * 2.2, 0, Math.sin(a) * 2.2, 0.9, 0.7, 0.9, WHITE, TL.stone, a); }
    for (let k = 0; k < 3; k++) E.box(0, 0.4, 0, 3.4, 0.5, 0.5, WHITE, TL.bark, k * 1.05);
    const f = t ? 1 + Math.sin(t.t * 7 + o.x) * 0.1 : 1;
    E.fl = FX_EMIT; E.bx(0, 0.4, 0, 1.4, 2.2 * f, 1.4, [1.3, 0.75, 0.3], TL.flame, t ? t.t * 2 : 0); E.bx(0, 0.4, 0, 0.8, 3.2 * f, 0.8, [1.4, 1.05, 0.5], TL.flame, 0.7); E.fl = 0;
  },
  os_geant(E) { E.box(0, 0.25, 0, 0.5, 0.5, 4.2, WHITE, TL.bone, 0.3); E.bx(0.6, 0, 2.0, 1.0, 0.9, 1.0, WHITE, TL.bone); E.bx(-0.3, 0, -2.0, 0.9, 0.8, 0.9, WHITE, TL.bone); },
  lit_geant(E) { for (let k = 0; k < 6; k++) E.bx(-2.5 + k * 1.0, 0, 0, 0.9, 0.9, 11, WHITE, TL.bark); E.bx(0, 0.9, 0, 5.6, 0.3, 10, rgbf('#8a6a44'), TL.fur); },
  table_alchimie(E) {
    E.bx(0, 0.82, 0, 1.6, 0.1, 0.8, WHITE, TL.darkwood); for (const [x, z] of [[-0.7, -0.32], [0.7, -0.32], [-0.7, 0.32], [0.7, 0.32]]) E.bx(x, 0, z, 0.1, 0.82, 0.1, WHITE, TL.darkwood);
    E.bx(-0.45, 0.92, 0, 0.3, 0.35, 0.3, rgbf('#b87333'), TL.metal); E.bx(-0.45, 1.27, 0, 0.08, 0.3, 0.08, rgbf('#b87333'), TL.metal);
    E.fl = FX_EMIT; for (const [x, c] of [[0.1, [0.4, 1, 0.5]], [0.3, [0.9, 0.4, 1]], [0.5, [1, 0.6, 0.3]]]) E.bx(x, 0.92, -0.15, 0.1, 0.22, 0.1, c, TL.glass); E.fl = 0;
    E.bx(0.3, 0.92, 0.2, 0.36, 0.05, 0.26, WHITE, TL.paper);
  },
  piege_loup(E, o) {
    const shut = o.data && o.data.shut;
    E.bx(0, 0, 0, 0.7, 0.04, 0.7, PC.iron, TL.iron);
    for (const s of [-1, 1]) { const a = shut ? s * 0.05 : s * 1.35; E.box(s * (shut ? 0.03 : 0.25), shut ? 0.2 : 0.06, 0, 0.04, 0.38, 0.64, PC.iron, TL.iron, 0, 0, a); for (let k = -2; k <= 2; k++) E.box(s * (shut ? 0.06 : 0.42), shut ? 0.36 : 0.08, k * 0.12, 0.03, 0.08, 0.03, [0.8, 0.8, 0.85], TL.metal, 0, 0, a); }
    E.bx(0, 0.04, 0, 0.18, 0.03, 0.18, rgbf('#8a6a44'), TL.wood);
    if (o.data && o.data.prise) E.bx(0, 0.05, 0.1, 0.3, 0.25, 0.5, rgbf('#6e6a66'), TL.fur);
  },
  charrette(E, o) {
    E.bx(0, 0.75, 0, 1.5, 0.12, 2.6, WHITE, TL.wood);
    for (const s of [-1, 1]) E.bx(s * 0.72, 0.87, 0, 0.08, 0.5, 2.6, WHITE, TL.darkwood);
    E.bx(0, 0.87, -1.26, 1.5, 0.5, 0.08, WHITE, TL.darkwood); E.bx(0, 0.87, 1.26, 1.5, 0.5, 0.08, WHITE, TL.darkwood);
    for (const s of [-1, 1]) { E.box(s * 0.86, 0.5, 0, 0.1, 1.0, 1.0, WHITE, TL.darkwood); E.box(s * 0.86, 0.5, 0, 0.12, 1.0, 1.0, WHITE, TL.darkwood, 0, Math.PI / 4); }
    E.bx(0, 0.4, 0, 1.8, 0.1, 0.1, PC.iron, TL.iron);
    for (const s of [-0.5, 0.5]) E.box(s, 0.72, 2.2, 0.08, 0.08, 2.0, WHITE, TL.wood, 0, o.data && o.data.hitched ? 0 : -0.22);
    if (o.data && o.data.load) E.bx(0, 0.87, 0, 1.2, 0.45, 2.1, rgbf('#c8a868'), TL.hay);
  },
  echelle_bois(E, o) { PROP_MODELS.echelle(E, { data: { h: 3.2 } }); },
  affiche_recherche(E, o) { E.bx(0, 0, 0, 0.62, 0.84, 0.02, rgbf('#e8dcb8'), TL.paper); E.bx(0, 0.3, 0.012, 0.3, 0.3, 0.005, [0.35, 0.3, 0.26], 0); E.bx(0, 0.72, 0.012, 0.5, 0.06, 0.005, [0.6, 0.1, 0.08], 0); },
  lanterne_grande(E, o, t) { PROP_MODELS.lanterne_sol(E, o, t); },
});

Object.assign(PROP_COLL, {
  vitrine: [0.6, 0.3, 1.5], sechoir_peaux: [0.9, 0.1, 1.8], cristal_lumineux: [0.35, 0.3, 1.2], stele: [0.45, 0.14, 2.1], pierre_trois: [0.5, 0.5, 1.45],
  statue_dieu: [1.6, 1.2, 8], dormeur: [3.5, 8, 4.6], os_geant: [0.6, 2.1, 0.9], lit_geant: [2.8, 5.5, 1.2], table_alchimie: [0.8, 0.4, 1.0], charrette: [0.8, 1.35, 1.0],
  fente_falaise: [1.4, 0.4, 3], grotte_bouche: [2.6, 0.7, 4.4],
});
Object.assign(PROP_LIGHTS, {
  cristal_lumineux: { c: [0.45, 0.75, 1.1], r: 11, y: 0.9 },
  feu_geant: { c: [1.0, 0.5, 0.2], r: 22, y: 1.8, flicker: true },
  vitrine: { c: [0.8, 0.8, 0.7], r: 3, y: 1.1 },
});
for (const id of ['piege_loup', 'charrette', 'table_alchimie', 'echelle_bois']) if (!ITEMS[id].ic || ITEMS[id].ic[0] === 'objet') ITEMS[id].ic = ['objet', id];

// ---------------------------------------------------------------- morphologies : poitrine, hanches, naturistes, nains, géants
{
  const _humanRig = humanRig;
  humanRig = function (look) {
    look = look || {};
    const dwarf = !!look.dwarf, nude = !!look.nude;
    const L2 = Object.assign({}, look);
    if (dwarf) { L2.height = 1; if (L2.face === undefined) L2.face = look.dress ? TL.faceF : look.beard ? TL.faceMan : TL.faceOld; }
    if (nude) { L2.coat = false; L2.apron = null; L2.dress = false; L2.shoe = look.skin; if (L2.hat === 'capuche') L2.hat = null; }
    const r = _humanRig(L2);
    const skin = rgbf(look.skin || '#e0b896');
    if (nude) for (const q of r.parts) {
      if (!q.s) continue;
      if (['torso', 'legL', 'legR', 'armL', 'armR', 'shoeL', 'shoeR'].includes(q.name)) { q.col = skin; q.tex = TL.skin; }
    }
    const P = [];
    const torso = r.part('torso'), tw = torso.s[0], td = torso.s[2];
    // poitrine
    const bust = look.bust || 0;
    if (bust > 0.05) {
      const bc = nude ? skin : torso.col, bw = tw * 0.36, bh = 0.1 + 0.07 * bust, bd = 0.035 + 0.085 * bust;
      for (const s of [-1, 1]) P.push({ name: s < 0 ? 'bustL' : 'bustR', parent: 'torso', p: [s * tw * 0.2, 0.43, td / 2 + bd / 2 - 0.012], s: [bw, bh, bd], col: bc, tex: nude ? TL.skin : TL.cloth });
    }
    // hanches (fesses) : sous une robe, la jupe s'arrondit
    const hips = look.hips || 0;
    if (hips > 0.05) {
      const sk = r.part('skirt');
      if (sk && !nude) { sk.s = [sk.s[0] + hips * 0.08, sk.s[1], sk.s[2] + hips * 0.1]; }
      else {
        const hc = nude ? skin : r.part('legL').col, hd = 0.04 + 0.08 * hips;
        P.push({ name: 'fesses', parent: 'hips', p: [0, -0.04, -td / 2 - hd / 2 + 0.03], s: [tw * (0.86 + hips * 0.1), 0.16 + 0.06 * hips, hd], col: hc, tex: nude ? TL.skin : TL.cloth });
      }
    }
    let rig = P.length ? rigPlus(r, P) : r;
    rig.kind = 'human'; rig.look = look; rig.kid = r.kid;
    // nains : jambes courtes, torse large, grosse tête
    if (dwarf) {
      const k = 0.6;
      for (const n of ['legL', 'legR']) { const q = rig.part(n); q.s = [q.s[0] * 1.35, q.s[1] * k, q.s[2] * 1.3]; q.o = [0, q.o[1] * k, 0]; }
      for (const n of ['shoeL', 'shoeR']) { const q = rig.part(n); q.p = [q.p[0], q.p[1] * k, q.p[2]]; q.s = [q.s[0] * 1.3, q.s[1], q.s[2] * 1.2]; }
      for (const n of ['legL', 'legR']) { const q = rig.part(n); q.p = [q.p[0] * 1.5, q.p[1], q.p[2]]; }
      const tq = rig.part('torso'); tq.s = [tq.s[0] * 1.3, tq.s[1] * 0.92, tq.s[2] * 1.35];
      for (const n of ['armL', 'armR']) { const q = rig.part(n); q.p = [q.p[0] * 1.3, q.p[1] * 0.92, q.p[2]]; q.s = [q.s[0] * 1.3, q.s[1] * 0.85, q.s[2] * 1.2]; q.o = [0, q.o[1] * 0.85, 0]; }
      for (const n of ['handL', 'handR']) { const q = rig.part(n); q.p = [q.p[0], q.p[1] * 0.85, q.p[2]]; }
      const hd = rig.part('head'); if (hd) { hd.s = hd.s.map((v) => v * 1.18); }
      rig.hipY = 0.88 * k + 0.02;
    }
    return rig;
  };
  const _poseHuman = poseHuman;
  poseHuman = function (rig, st) { _poseHuman(rig, st); if (rig.hipY !== undefined) rig.part('hips').p[1] += rig.hipY - 0.88; };
}
