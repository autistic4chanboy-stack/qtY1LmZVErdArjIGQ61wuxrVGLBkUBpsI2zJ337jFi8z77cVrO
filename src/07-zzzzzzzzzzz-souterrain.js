// ============================================================================
//  LE DESSOUS (agent C3) — matières et modèles du monde souterrain
//  - cinq matières peintes pour la roche d'en bas (calcaire mouillé, calcite,
//    argile, terreau des champignonnières, roche soufrée) : le sol et la voûte
//    des galeries sont des reliefs (11-zzzz9-souterrain0.js) qui les emploient ;
//  - les objets posés d'en bas, en boîtes (le style « 1996 » du jeu) : grille de
//    l'exutoire, entailles, barreaux du puits, os et restes des Murés, concrétions,
//    champignons qui luisent, cristaux, racines, étais de mine, repères des Terrés…
// ============================================================================

// ---------------------------------------------------------------- les matières
function texSoutRoche(seed) {
  const pal = ramp(['#352f29', '#433b33', '#51483e', '#605549', '#6f6354', '#7f7160', '#91826f']);
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed), wor = makeWorley(seed, 5), rnd = mulberry32(seed + 17);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const warp = tileFbm(tn, x / 16, y / 16, 8, 2) * 9;
    let v = 0.46 + (tileFbm(tn, x / 14 + 3, y / 10, 9.1429, 3) - 0.5) * 0.7 + (tn(x / 3, y / 3, 42.6667) - 0.5) * 0.16;
    v += Math.sin((y + warp) * 0.42) * 0.07; // lits de la pierre (horizontaux sur les parois)
    const w = wor(x / TS * 5, y / TS * 5), e = w.f2 - w.f1;
    if (e < 0.022 && tn(x / 8 + 9, y / 8, 16) > 0.45) v -= 0.3; // fissures, çà et là
    pb.set(x, y, rampPick(pal, v, x, y));
  }
  for (let k = 0; k < 60; k++) { const x = (rnd() * TS) | 0, y = (rnd() * TS) | 0; pb.setW(x, y, [190, 180, 158]); if (rnd() < 0.5) pb.setW(x, y + 1, [150, 142, 124]); }
  return pb;
}
function texSoutCalcite(seed) {
  const pal = ramp(['#8a806e', '#9d927e', '#b0a58e', '#c1b69d', '#d0c5ab', '#ddd3ba', '#e8dfc8']);
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const ond = Math.sin((y + tileFbm(tn, x / 12, y / 12, 10.6667, 3) * 26) * 0.55); // coulées, en rides
    const v = 0.5 + ond * 0.16 + (tn(x / 3, y / 3, 42.6667) - 0.5) * 0.22;
    pb.set(x, y, rampPick(pal, v, x, y));
  }
  return pb;
}
function texSoutArgile(seed) {
  const pal = ramp(['#3e3023', '#4c3b2b', '#5a4633', '#69523c', '#785f46', '#886c50']);
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed), rnd = mulberry32(seed + 3);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const v = tileFbm(tn, x / 16, y / 16, 8, 3) * 0.85 + tn(x / 3, y / 3, 42.6667) * 0.12;
    pb.set(x, y, rampPick(pal, v, x, y));
  }
  for (let k = 0; k < 40; k++) { // flaques luisantes, empreintes
    const x = (rnd() * TS) | 0, y = (rnd() * TS) | 0, r = 1 + ((rnd() * 3) | 0);
    for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r) pb.setW(x + i, y + j, j < 0 ? [120, 108, 92] : [52, 42, 32]);
  }
  return pb;
}
function texSoutHumus(seed) {
  const pal = ramp(['#2a211a', '#352a21', '#413328', '#4d3d30', '#5a4838']);
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed), rnd = mulberry32(seed + 5);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const v = tileFbm(tn, x / 10, y / 10, 12.8, 3) * 0.9;
    pb.set(x, y, rampPick(pal, v, x, y));
  }
  for (let k = 0; k < 14; k++) { // filaments pâles, à peine (le mycélium)
    let x = rnd() * TS, y = rnd() * TS, a = rnd() * TAU;
    for (let s = 0; s < 10 + rnd() * 18; s++) { a += (rnd() - 0.5) * 0.9; x += Math.cos(a); y += Math.sin(a); if (rnd() < 0.7) pb.setW(x, y, rnd() < 0.2 ? [118, 112, 94] : [92, 84, 68]); }
  }
  return pb;
}
function texSoutSoufre(seed) {
  const pal = ramp(['#2a2724', '#35312d', '#413c37', '#4e4842', '#5c554e']);
  const jaune = ramp(['#6d5a17', '#8f7a21', '#b39b2c', '#d4bb45']);
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed), wor = makeWorley(seed, 6);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const w = wor(x / TS * 6, y / TS * 6), e = w.f2 - w.f1;
    const cr = tileFbm(tn, x / 9, y / 9, 14.2222, 3);
    let c = rampPick(pal, 0.45 + (cr - 0.5) * 0.6 + (e < 0.06 ? -0.3 : 0), x, y);
    if (cr > 0.64 && e > 0.05) c = rampPick(jaune, (cr - 0.64) * 3.2, x, y);
    pb.set(x, y, c);
  }
  return pb;
}
const M_SROCHE = MATERIALS.push({ id: 'sout_roche', name: 'Roche d’en bas', scale: 3, gen: () => texSoutRoche(611) }) - 1;
const M_SCALCITE = MATERIALS.push({ id: 'sout_calcite', name: 'Calcite', scale: 3, gen: () => texSoutCalcite(612) }) - 1;
const M_SARGILE = MATERIALS.push({ id: 'sout_argile', name: 'Argile', scale: 3, gen: () => texSoutArgile(613) }) - 1;
const M_SHUMUS = MATERIALS.push({ id: 'sout_humus', name: 'Terreau noir', scale: 3, gen: () => texSoutHumus(614) }) - 1;
const M_SSOUFRE = MATERIALS.push({ id: 'sout_soufre', name: 'Roche soufrée', scale: 3, gen: () => texSoutSoufre(615) }) - 1;

// ---------------------------------------------------------------- les modèles (boîtes)
const SPC = {
  roche: rgbf('#5a5248'), rocheS: rgbf('#3e3831'), calc: rgbf('#cfc3a4'), calcS: rgbf('#a89c82'), os: [0.86, 0.82, 0.72],
  fer: rgbf('#4a3e36'), rouille: rgbf('#6e4a32'), bois: rgbf('#5a4430'), boisS: rgbf('#3e2e20'), corde: rgbf('#8a7a5a'),
  pied: rgbf('#d8d2c0'), chapeau: [0.35, 0.95, 0.85], chapeauB: [0.5, 0.75, 1.15], cristal: [0.8, 0.88, 1.0], racine: rgbf('#4a3a2a'),
};
const soutH = (o, k) => hash2i(Math.round(o.x * 7), Math.round(o.z * 7), k || 1);
Object.assign(PROP_MODELS, {
  // la grille de l'exutoire, dans son arche de pierre (au pied de la tour, à fleur d'eau) ; data.ouverte : la barre est levée
  sout_grille(E, o) {
    const ouv = o.data && o.data.ouverte;
    E.bx(-0.95, -0.5, 0, 0.4, 2.1, 0.5, SPC.roche, TL.stone); E.bx(0.95, -0.5, 0, 0.4, 2.1, 0.5, SPC.roche, TL.stone);
    E.bx(0, 1.35, 0, 2.3, 0.45, 0.5, SPC.roche, TL.stone);
    E.bx(0, -0.5, -0.05, 1.5, 1.85, 0.1, [0.02, 0.02, 0.02], 0); // le noir, derrière
    const dx = ouv ? 0.55 : 0;
    for (let k = 0; k < 6; k++) E.bx(-0.62 + k * 0.25 + dx, -0.45, 0.12, 0.06, 1.75, 0.06, SPC.rouille, TL.iron);
    for (const y of [0.1, 0.8]) E.bx(dx, y, 0.14, 1.4, 0.07, 0.05, SPC.fer, TL.iron);
    if (!ouv) E.bx(0, 0.42, 0.2, 1.8, 0.1, 0.08, SPC.fer, TL.iron); // la barre
    else E.box(0.95, 0.9, 0.22, 0.1, 1.6, 0.08, SPC.fer, TL.iron, 0, 0, 0.1);
  },
  // trois entailles verticales, taillées dans la pierre (le signe de ceux d'en bas)
  sout_entailles(E) { for (let k = 0; k < 3; k++) E.bx(-0.09 + k * 0.09, 0, 0, 0.035, 0.34 - (k === 1 ? 0 : 0.06), 0.02, [0.09, 0.08, 0.07], 0); },
  // le puits des Murés : une margelle éboulée, et des barreaux de fer qui descendent dans le noir
  sout_puits(E) {
    for (let k = 0; k < 9; k++) { const a = k / 9 * TAU; E.box(Math.cos(a) * 1.05, 0.14 + (k % 3) * 0.05, Math.sin(a) * 1.05, 0.62, 0.28 + (k % 3) * 0.1, 0.34, SPC.roche, TL.stone, -a); }
    E.bx(0, -0.02, 0, 1.7, 0.03, 1.7, [0.01, 0.01, 0.01], 0);
    for (let k = 0; k < 6; k++) E.bx(0, -0.3 - k * 0.42, -0.78, 0.5, 0.05, 0.05, SPC.rouille, TL.iron);
  },
  // barreaux scellés dans la paroi (data.h : hauteur)
  sout_barreaux(E, o) {
    const h = (o.data && o.data.h) || 4, n = Math.max(2, Math.round(h / 0.42));
    for (let k = 0; k < n; k++) { E.bx(0, 0.2 + k * 0.42, 0, 0.52, 0.05, 0.05, SPC.rouille, TL.iron); for (const s of [-0.24, 0.24]) E.bx(s, 0.2 + k * 0.42, -0.1, 0.05, 0.05, 0.2, SPC.fer, TL.iron); }
  },
  sout_os(E, o) {
    const v = soutH(o, 3) * 10;
    for (let k = 0; k < 6; k++) E.box(Math.cos(k * 2.3 + v) * 0.35, 0.04 + (k % 3) * 0.05, Math.sin(k * 1.7 + v) * 0.3, 0.46, 0.06, 0.06, SPC.os, TL.bone, k * 1.3 + v);
    E.box(0.12, 0.1, 0.05, 0.2, 0.18, 0.2, SPC.os, TL.bone, v);
  },
  // une corbeille d'osier, vide depuis longtemps
  sout_panier(E) {
    E.bx(0, 0, 0, 0.5, 0.26, 0.38, rgbf('#6a5436'), TL.straw);
    E.bx(0, 0.02, 0, 0.42, 0.25, 0.3, [0.08, 0.06, 0.05], 0);
    E.box(0, 0.4, 0, 0.04, 0.34, 0.04, rgbf('#6a5436'), TL.straw, 0, 0, 0);
  },
  sout_bougie(E) { E.bx(0, 0, 0, 0.07, 0.07, 0.07, [0.8, 0.76, 0.66], TL.plain); E.bx(0, 0, 0, 0.13, 0.015, 0.13, [0.62, 0.58, 0.5], TL.plain); },
  // concrétions : o.s (taille), o.data.v (forme)
  sout_stalag(E, o) {
    const v = soutH(o, 5), h = 0.9 + v * 1.6, n = 8;
    let y = 0, w = 0.4 + v * 0.22;
    for (let k = 0; k < n; k++) { const hh = h / n, c = k > 5 ? SPC.calc : k > 2 ? [0.74, 0.69, 0.6] : SPC.calcS; E.bx((soutH(o, k + 9) - 0.5) * 0.04 * k, y, 0, w, hh + 0.02, w * 0.9, c, mt(M_SCALCITE), k * 0.52 + v * 3); y += hh; w *= 0.82; }
  },
  sout_stalac(E, o) {
    const v = soutH(o, 6), h = 0.7 + v * 2.2, n = 7;
    let y = 0, w = 0.32 + v * 0.18;
    for (let k = 0; k < n; k++) { const hh = h / n; E.bx(0, -y - hh, 0, w, hh + 0.02, w * 0.9, k < 2 ? SPC.calcS : k > 4 ? SPC.calc : [0.74, 0.69, 0.6], mt(M_SCALCITE), k * 0.61 + v * 2); y += hh; w *= 0.78; }
  },
  sout_eboulis(E, o) {
    const v = soutH(o, 7) * 10;
    for (let k = 0; k < 7; k++) E.box(Math.cos(k * 2.1 + v) * (0.3 + (k % 3) * 0.25), 0.1 + (k % 2) * 0.1, Math.sin(k * 1.9 + v) * (0.3 + (k % 4) * 0.2), 0.36 + (k % 3) * 0.14, 0.26 + (k % 2) * 0.12, 0.34 + (k % 4) * 0.08, SPC.roche, mt(M_SROCHE), k + v, k * 0.3);
  },
  // champignons qui luisent (chapeaux émissifs) ; data.b : bleus
  sout_champi(E, o, t) {
    if (o.data && o.data.pris) return;
    const v = soutH(o, 8) * 10, bleu = o.data && o.data.b, T = t ? t.t || 0 : 0;
    for (let k = 0; k < 5; k++) {
      const a = k * 2.4 + v, r = k ? 0.18 + (k % 3) * 0.12 : 0, h = 0.14 + ((k * 7 + v * 3) % 5) * 0.05;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      E.bx(x, 0, z, 0.035, h, 0.035, SPC.pied, TL.plain);
      E.fl = FX_EMIT;
      const p = 0.8 + Math.sin(T * 0.7 + k + v) * 0.12, c = bleu ? SPC.chapeauB : SPC.chapeau;
      E.bx(x, h, z, 0.12 + (k === 0 ? 0.06 : 0), 0.04, 0.12 + (k === 0 ? 0.06 : 0), [c[0] * p, c[1] * p, c[2] * p], TL.plain);
      E.fl = 0;
    }
  },
  // un grand champignon (les forêts de la Nef) : pied pâle, chapeau bombé, lamelles qui luisent par-dessous, points luisants dessus
  sout_champi_grand(E, o) {
    const v = soutH(o, 11), h = 1.8 + v * 2.4, R = 0.9 + v * 1.1, rr = v * 5, pw = 0.26 + v * 0.14;
    for (let k = 0; k < 4; k++) E.bx(Math.sin(k * 1.7 + rr) * 0.04, k * h / 4, 0, pw * (1 - k * 0.08), h / 4 + 0.02, pw * (1 - k * 0.08), SPC.pied, TL.plain, rr + k * 0.3);
    E.bx(0, h * 0.72, 0, pw * 2.2, 0.08, pw * 2.2, rgbf('#bcb6a4'), TL.plain, rr); // l'anneau
    E.fl = FX_EMIT; E.bx(0, h - 0.06, 0, R * 1.9, 0.07, R * 1.9, [0.22, 0.75, 0.7], TL.plain, rr); E.fl = 0;
    E.bx(0, h, 0, R * 2, 0.22, R * 2, rgbf('#4a3e5a'), TL.plain, rr);
    E.bx(0, h + 0.2, 0, R * 1.6, 0.2, R * 1.6, rgbf('#54466a'), TL.plain, rr + 0.35);
    E.bx(0, h + 0.38, 0, R * 1.05, 0.16, R * 1.05, rgbf('#5e4e74'), TL.plain, rr + 0.7);
    E.fl = FX_EMIT;
    for (let k = 0; k < 5; k++) { const a = k * 1.3 + rr, d = R * (0.35 + (k % 3) * 0.18); E.bx(Math.cos(a) * d, h + 0.21 + (k % 2) * 0.18, Math.sin(a) * d, 0.09, 0.03, 0.09, [0.4, 0.95, 0.85], TL.plain); }
    E.fl = 0;
  },
  // des vers luisants à la voûte : un semis de points pâles (le ciel d'en bas)
  sout_vers(E, o, t) {
    const v = soutH(o, 14) * 10, T = t ? t.t || 0 : 0;
    E.fl = FX_EMIT;
    for (let k = 0; k < 14; k++) {
      const a = k * 2.39996 + v, d = Math.sqrt(k / 14) * 2.2, p = 0.55 + 0.45 * Math.sin(T * (0.3 + (k % 5) * 0.11) + k * 1.7 + v);
      E.bx(Math.cos(a) * d, -0.04 - (k % 4) * 0.12, Math.sin(a) * d, 0.035, 0.035 + (k % 3) * 0.04, 0.035, [0.45 * p, 0.95 * p, 0.8 * p], TL.plain);
    }
    E.fl = 0;
  },
  // cristaux de roche (o.s : taille) : des prismes pâles, pointus, qui luisent faiblement à la lanterne ; data.c : teinte
  sout_cristal(E, o) {
    const v = soutH(o, 12) * 10, tint = [[0.78, 0.9, 1.05], [0.9, 0.8, 1.05], [1.05, 0.92, 0.72]][((v * 7) | 0) % 3];
    for (let k = 0; k < 7; k++) {
      const a = k * 1.9 + v, tilt = k ? 0.22 + (k % 3) * 0.16 : 0.05, h = k ? 0.45 + ((k * 5 + v) % 4) * 0.3 : 1.4 + (v % 1) * 0.6, w = k ? 0.13 + (k % 2) * 0.05 : 0.24;
      const cx = k ? Math.cos(a) * 0.16 : 0, cz = k ? Math.sin(a) * 0.16 : 0, rx = Math.cos(a) * tilt, rz = Math.sin(a) * tilt;
      E.fl = FX_EMIT;
      const g = k % 2 ? 0.55 : 0.75;
      E.box(cx, h / 2, cz, w, h, w, [tint[0] * g, tint[1] * g, tint[2] * g], TL.glass, a, rx, rz);
      E.box(cx + Math.sin(rz) * -h * 0.5, h + 0.05, cz + Math.sin(rx) * h * 0.5, w * 0.6, 0.16, w * 0.6, [tint[0] * 0.95, tint[1] * 0.95, tint[2] * 0.95], TL.plain, a + 0.78, rx, rz);
      E.fl = 0;
    }
  },
  sout_racines(E, o) {
    const v = soutH(o, 13) * 10, n = 5 + ((v * 3) | 0) % 4;
    for (let k = 0; k < n; k++) { const x = Math.cos(k * 2.3 + v) * 0.7, z = Math.sin(k * 1.7 + v) * 0.7, L = 1.2 + ((k * 3 + v) % 5) * 0.5; E.box(x, -L / 2, z, 0.07 + (k % 2) * 0.05, L, 0.07, SPC.racine, TL.bark, k, 0.12 * Math.sin(k + v), 0.1 * Math.cos(k * 2 + v)); }
  },
  // étai de mine (deux montants, un chapeau), bois noirci
  sout_etai(E) {
    for (const s of [-1.3, 1.3]) E.bx(s, 0, 0, 0.22, 2.5, 0.22, SPC.bois, TL.darkwood);
    E.bx(0, 2.5, 0, 3.0, 0.24, 0.26, SPC.bois, TL.darkwood);
    E.box(-1.05, 2.25, 0, 0.12, 0.6, 0.12, SPC.boisS, TL.darkwood, 0, 0, 0.8); E.box(1.05, 2.25, 0, 0.12, 0.6, 0.12, SPC.boisS, TL.darkwood, 0, 0, -0.8);
  },
  // repère de ceux d'en bas : pierres empilées, la plus haute entaillée (data.n : nombre d'entailles, data.d : direction)
  sout_cairn(E, o) {
    const n = (o.data && o.data.n) || 1;
    E.bx(0, 0, 0, 0.5, 0.22, 0.44, SPC.roche, mt(M_SROCHE), 0.3); E.bx(0.03, 0.22, 0, 0.38, 0.2, 0.34, SPC.roche, mt(M_SROCHE), 1.1); E.bx(0, 0.42, 0.02, 0.26, 0.26, 0.2, SPC.rocheS, mt(M_SROCHE), 0.6);
    for (let k = 0; k < n; k++) E.bx(-0.07 * (n - 1) / 2 + k * 0.07, 0.48, 0.115, 0.025, 0.14, 0.012, [0.85, 0.82, 0.74], 0);
  },
  // ---- ce qui se cueille, ce qui se casse (data.pris : cueilli ; data.n : ce qui reste d'un filon)
  // un filon : des éclats de minerai dans la roche (data.m : galene, magnetite, soufre, salpetre, luisante, cristal)
  sout_filon(E, o) {
    const m = (o.data && o.data.m) || 'galene', n = o.data && o.data.n !== undefined ? o.data.n : 4, v = soutH(o, 15) * 10;
    E.bx(0, 0, 0, 1.1, 0.34, 0.8, SPC.rocheS, mt(M_SROCHE), v);
    E.bx(0.1, 0.3, -0.05, 0.8, 0.28, 0.6, SPC.roche, mt(M_SROCHE), v + 0.5);
    const C = { galene: [[0.46, 0.5, 0.58], TL.iron], magnetite: [[0.13, 0.12, 0.14], TL.iron], soufre: [[0.9, 0.78, 0.22], TL.plain], salpetre: [[0.92, 0.9, 0.86], TL.plain], luisante: [[0.45, 0.95, 0.8], TL.plain], cristal: [[0.82, 0.9, 1], TL.glass] }[m] || [[0.5, 0.5, 0.5], 0];
    const nb = Math.max(0, Math.min(6, n + 2));
    for (let k = 0; k < nb; k++) {
      const a = k * 2.1 + v, x = Math.cos(a) * 0.32, z = Math.sin(a) * 0.24, big = m === 'cristal' ? 0.12 : 0.18;
      if (m === 'luisante' || m === 'cristal') E.fl = FX_EMIT;
      if (m === 'cristal') E.box(x, 0.55, z, big, 0.4, big, C[0], C[1], a, 0.3 * Math.cos(a), 0.3 * Math.sin(a));
      else E.box(x, 0.36 + (k % 2) * 0.12, z, big + (k % 3) * 0.05, 0.12 + (k % 2) * 0.06, big, m === 'luisante' ? [C[0][0] * 0.8, C[0][1] * 0.8, C[0][2] * 0.8] : C[0], C[1], a, 0.4, 0.2);
      E.fl = 0;
    }
  },
  // pied-de-pierre : champignons blancs, durs, sur l'argile des rives
  sout_pied_pierre(E, o) {
    if (o.data && o.data.pris) return;
    const v = soutH(o, 16) * 10;
    for (let k = 0; k < 4; k++) { const a = k * 1.7 + v, d = k ? 0.14 + (k % 2) * 0.1 : 0, h = 0.1 + ((k + v) % 3) * 0.04; E.bx(Math.cos(a) * d, 0, Math.sin(a) * d, 0.06, h, 0.06, [0.86, 0.84, 0.78], TL.plain); E.bx(Math.cos(a) * d, h, Math.sin(a) * d, 0.16, 0.06, 0.16, [0.92, 0.9, 0.84], TL.plain, a); }
  },
  // mousse luisante : des coussins verts qui luisent, au pied des parois
  sout_mousse(E, o, t) {
    if (o.data && o.data.pris) return;
    const v = soutH(o, 17) * 10;
    E.fl = FX_EMIT;
    for (let k = 0; k < 5; k++) { const a = k * 1.3 + v, d = k ? 0.2 + (k % 3) * 0.12 : 0; E.bx(Math.cos(a) * d, 0, Math.sin(a) * d, 0.3 - (k % 2) * 0.08, 0.05 + (k % 2) * 0.03, 0.26, [0.16, 0.62, 0.4], TL.leaves, a); }
    E.fl = 0;
  },
  // lichen d'argent, sur une pierre
  sout_lichen(E, o) {
    const v = soutH(o, 18) * 10, pris = o.data && o.data.pris;
    E.bx(0, 0, 0, 0.7, 0.36, 0.5, SPC.roche, mt(M_SROCHE), v);
    if (!pris) for (let k = 0; k < 4; k++) E.bx(-0.2 + k * 0.13, 0.36, (k % 2) * 0.1 - 0.05, 0.16, 0.02, 0.14, [0.78, 0.8, 0.84], TL.plain, v + k);
  },
  // fougère pâle (sous le puits de jour)
  sout_fougere(E, o) {
    if (o.data && o.data.pris) return;
    const v = soutH(o, 19) * 10;
    for (let k = 0; k < 7; k++) { const a = k / 7 * TAU + v; E.box(Math.cos(a) * 0.22, 0.2, Math.sin(a) * 0.22, 0.1, 0.02, 0.5, [0.74, 0.8, 0.64], TL.leaves, -a + Math.PI / 2, -0.6); }
  },
  // algue blanche, à fleur d'eau tiède
  sout_algue(E, o, t) {
    if (o.data && o.data.pris) return;
    const v = soutH(o, 20) * 10, T = t ? t.t || 0 : 0;
    for (let k = 0; k < 6; k++) { const a = k * 1.1 + v, d = 0.1 + (k % 3) * 0.15; E.box(Math.cos(a) * d, 0.02, Math.sin(a) * d, 0.08, 0.02, 0.42, [0.9, 0.9, 0.84], TL.plain, a + Math.sin(T * 0.5 + k) * 0.2); }
  },
  // chapeau-de-suie : champignons noirs, poudrés de jaune, près des souffles chauds
  sout_suie(E, o) {
    if (o.data && o.data.pris) return;
    const v = soutH(o, 21) * 10;
    for (let k = 0; k < 3; k++) { const a = k * 2.2 + v, d = k ? 0.16 : 0, h = 0.14 + k * 0.03; E.bx(Math.cos(a) * d, 0, Math.sin(a) * d, 0.05, h, 0.05, [0.2, 0.18, 0.16], TL.plain); E.bx(Math.cos(a) * d, h, Math.sin(a) * d, 0.2, 0.08, 0.2, [0.12, 0.1, 0.1], TL.plain, a); E.bx(Math.cos(a) * d, h + 0.08, Math.sin(a) * d, 0.12, 0.01, 0.12, [0.7, 0.62, 0.2], TL.plain, a); }
  },
  // un tas de guano, sous les voûtes où dorment les chauves-souris
  sout_guano(E, o) {
    const n = o.data && o.data.pris ? 0.35 : 1, v = soutH(o, 22) * 10;
    E.bx(0, 0, 0, 1.2 * n + 0.2, 0.16 * n, 0.9 * n + 0.2, [0.3, 0.26, 0.2], TL.soil, v);
    if (n > 0.5) E.bx(0.1, 0.14, 0, 0.7, 0.12, 0.5, [0.36, 0.3, 0.22], TL.soil, v + 0.6);
  },
  // une vasque de calcite où l'eau goutte (et roule parfois une perle)
  sout_vasque(E, o) {
    const pris = o.data && o.data.pris;
    for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; E.box(Math.cos(a) * 0.5, 0.08, Math.sin(a) * 0.5, 0.36, 0.16, 0.14, SPC.calc, mt(M_SCALCITE), -a + Math.PI / 2); }
    E.bx(0, 0.02, 0, 0.84, 0.08, 0.84, [0.3, 0.42, 0.44], TL.glass);
    if (!pris) { E.fl = FX_EMIT; E.bx(0.12, 0.1, -0.05, 0.07, 0.07, 0.07, [0.95, 0.93, 0.86], TL.plain); E.fl = 0; }
  },
  // un fil de lin tendu, noué à un piquet (le fil d'Ariane de quelqu'un d'autre)
  sout_piquet(E) { E.bx(0, 0, 0, 0.06, 0.5, 0.06, SPC.boisS, TL.darkwood); E.box(0, 0.42, 0, 0.1, 0.06, 0.1, [0.8, 0.76, 0.64], TL.rope, 0.4); },
});
Object.assign(PROP_LIGHTS, {
  sout_champi: { c: [0.16, 0.62, 0.55], r: 5.5, y: 0.35 },
  sout_champi_grand: { c: [0.22, 0.72, 0.64], r: 11, y: 1.4 },
  sout_cristal: { c: [0.38, 0.46, 0.72], r: 4.5, y: 0.9 },
  sout_mousse: { c: [0.1, 0.42, 0.28], r: 4, y: 0.2 },
});
Object.assign(PROP_COLL, {
  sout_stalag: [0.28, 0.28, 1.6], sout_champi_grand: [0.2, 0.2, 2.4], sout_cairn: [0.26, 0.24, 0.7], sout_filon: [0.5, 0.36, 0.6], sout_lichen: [0.32, 0.22, 0.36],
});
