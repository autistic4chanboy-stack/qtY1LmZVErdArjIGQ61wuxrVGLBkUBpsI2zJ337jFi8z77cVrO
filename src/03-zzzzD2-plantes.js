// ============================================================================
//  LES PLANTES DE LA FORÊT, DES BOULEAUX, DU MARAIS ET DU LAC (agent D2) :
//  icônes nouvelles (formes « d2_… ») et sprites du décor (« d2_<type> »),
//  billboards pixelisés dans le style des plantes d'avant (03-zzzz-sprites-nature).
//  Données : 05-zzzzzD2-plantes.js.
// ============================================================================
{
  const _ip = iconPaint;
  iconPaint = function (shape, c1, c2) {
    if (typeof shape !== 'string' || !shape.startsWith('d2_')) return _ip(shape, c1, c2);
    const kind = shape.slice(3);
    const pb = new PixelBuf(16, 16), P = rampOf(c1 || '#aaaaaa'), Q = rampOf(c2 || '#4a9a3a');
    const S = (cx, cy, r, pal, o) => drawSphere(pb, cx, cy, r, pal || P, (cx * 7 + cy * 3) | 0, o || {});
    const L = (x0, y0, x1, y1, c, w) => drawLine(pb, x0, y0, x1, y1, typeof c === 'string' ? hexc(c) : c, w || 1);
    const px = (x, y, c) => pb.set(x, y, typeof c === 'string' ? hexc(c) : c);
    const G = rampOf('#4a8a3a');
    switch (kind) {
      case 'lierre': // trois feuilles à pointes, une grappe de baies noires
        L(2, 15, 12, 2, '#5a4a30');
        for (const [x, y] of [[4, 11], [9, 7], [5, 5]]) { S(x, y, 2.6, P, { sq: 0.9 }); px(x, y - 3, P[2]); px(x - 3, y, P[1]); px(x + 3, y, P[1]); L(x, y + 1, x, y - 1, C(P[3], 1.2)); }
        for (const [x, y] of [[12, 4], [13, 6], [11, 6], [12, 7]]) S(x, y, 1.1, Q);
        break;
      case 'oreille': // une oreille brune, translucide, veinée
        S(8, 8, 6, P, { sq: 1.15, noise: 0.3 }); S(9, 8.5, 3.6, rampOf(C(P[1], 0.7))); for (const [a, b] of [[6, 5], [7, 11], [10, 4]]) L(9, 8, a, b, C(P[3], 1.1));
        break;
      case 'cornet': // le cornet pâle et son doigt violet
        for (let y = 2; y < 15; y++) { const w = y < 4 ? 1 : y < 12 ? 2 + (y - 4) * 0.45 : 5 - (y - 12); for (let x = Math.round(8 - w); x <= Math.round(8 + w); x++) px(x, y, rampPick(P, 0.85 - (x - 8 + w) / (2 * w + 1) * 0.5, x, y)); }
        L(8, 5, 8, 11, Q[1], 2); px(8, 4, Q[2]); L(8, 15, 8, 13, '#3e7a2e');
        break;
      case 'langue': // une langue de chair rouge
        for (let y = 3; y < 14; y++) { const t = (y - 3) / 11, w = 3 + Math.sin(t * Math.PI) * 2.5; for (let x = Math.round(8 - w); x <= Math.round(8 + w); x++) px(x, y, rampPick(P, 0.9 - t * 0.4 - Math.abs(x - 8) * 0.05, x, y)); }
        for (const [x, y] of [[7, 6], [9, 9], [6, 11], [10, 5]]) px(x, y, C(P[3], 1.15).map((v) => Math.min(255, v)));
        L(6, 14, 10, 14, Q[1]);
        break;
      case 'turban': // le bulbe d'or en écailles, et une fleur en turban
        S(8, 11, 4.2, rampOf('#e0b030'), { sq: 0.95 }); for (const [x, y] of [[6, 10], [10, 10], [8, 8], [8, 13]]) px(x, y, [170, 120, 30]);
        L(8, 7, 8, 3, '#3e7a2e'); for (const [dx, dy] of [[-3, -1], [3, -1], [-2, 1], [2, 1]]) L(8, 3, 8 + dx, 3 + dy, P[2]); px(8, 2, P[3]); px(7, 3, Q[1]); px(9, 4, Q[1]);
        break;
      case 'oronge': // chapeau orange, lamelles jaunes, volve blanche
        L(8, 9, 8, 13, '#f0d040', 2); S(8, 6.5, 5.5, P, { sq: 0.6, flatBottom: 0.4 }); for (let x = 4; x < 13; x++) px(x, 8, [240, 200, 50]);
        S(8.5, 14, 3.2, Q, { sq: 0.6 });
        break;
      case 'sabot': // le sabot jaune et les rubans bruns
        L(3, 3, 7, 7, Q[2], 2); L(13, 3, 9, 7, Q[1], 2); L(8, 2, 8, 6, Q[1]); L(6, 14, 8, 11, '#3e7a2e');
        S(8.5, 10, 3.8, P, { sq: 0.85 }); px(8, 8, C(P[0], 0.8)); px(9, 8, C(P[0], 0.8));
        break;
      case 'gui': // rameaux fourchus, feuilles par deux, baies blanches
        L(8, 15, 8, 10, '#6a7a3a'); L(8, 10, 4, 6, '#6a7a3a'); L(8, 10, 12, 6, '#6a7a3a');
        for (const [x, y, s] of [[4, 6, -1], [12, 6, 1]]) { L(x, y, x + s * 3, y - 4, P[2], 2); L(x, y, x - s, y - 5, P[1], 2); }
        for (const [x, y] of [[8, 9], [7, 10], [4, 7], [12, 7], [9, 10]]) S(x, y, 1.1, Q);
        break;
      case 'amadou': // un sabot gris, zoné, sa face blanche dessous
        for (let y = 4; y < 13; y++) { const w = 6 - Math.abs(y - 9) * 0.45; for (let x = Math.round(8 - w); x <= Math.round(8 + w); x++) px(x, y, rampPick(P, 0.85 - (y - 4) * 0.06 + ((y % 3) === 0 ? -0.25 : 0), x, y)); }
        L(3, 12, 13, 12, [220, 210, 190]); L(4, 13, 12, 13, [190, 180, 160]);
        break;
      case 'etoile': // une étoile blanche à sept branches
        L(8, 15, 8, 9, '#3e7a2e'); for (let k = 0; k < 7; k++) { const a = k / 7 * TAU - Math.PI / 2; L(8, 7, 8 + Math.cos(a) * 5, 7 + Math.sin(a) * 5, P[2 + (k & 1)]); } S(8, 7, 1.4, rampOf('#f0d040'));
        for (const [dx, dy] of [[-4, 4], [4, 4]]) L(8, 11, 8 + dx, 11 + dy, Q[2], 2);
        break;
      case 'jumelles': // deux clochettes roses pendues côte à côte
        L(8, 15, 8, 6, '#5a7a3a'); L(8, 6, 5, 4, '#5a7a3a'); L(8, 6, 11, 4, '#5a7a3a');
        for (const x of [5, 11]) { S(x, 7.5, 2.4, P, { sq: 1.2 }); px(x, 10, C(P[0], 0.8)); }
        break;
      case 'jonc': // une botte de tiges liée d'un brin
        for (let k = 0; k < 7; k++) L(4 + k * 1.3, 15, 6 + k * 0.7, 1, P[1 + (k % 3)]);
        L(4, 9, 12, 9, Q[1], 1); L(4, 10, 12, 10, Q[2], 1);
        break;
      case 'navet': // des racines en fuseaux, le suc jaune
        for (const [x0, a] of [[5, -0.3], [8, 0], [11, 0.3]]) for (let y = 4; y < 15; y++) { const t = (y - 4) / 11, w = 1.8 * Math.sin(Math.min(1, t * 1.4) * Math.PI * 0.9) + 0.3; const cx = x0 + a * (y - 4); for (let x = Math.round(cx - w); x <= Math.round(cx + w); x++) px(x, y, rampPick(P, 0.85 - (x - cx + w) / (2 * w + 1) * 0.5, x, y)); }
        L(8, 4, 8, 1, '#4a8a3a'); L(8, 2, 5, 0, '#4a8a3a'); px(8, 7, Q[2]); px(5, 9, Q[2]); px(11, 8, Q[2]);
        break;
      case 'cuillere': // une feuille en cuillère, et la hampe
        S(6, 9, 4, P, { sq: 1.4 }); L(6, 14, 6, 15, P[1]); L(6, 4, 6, 13, C(P[3], 1.1));
        L(11, 15, 11, 3, '#5a7a3a'); L(11, 7, 14, 4, '#5a7a3a'); L(11, 9, 8, 6, '#5a7a3a'); for (const [x, y] of [[11, 2], [14, 3], [8, 5], [13, 6]]) px(x, y, Q[3]);
        break;
      case 'macre': // la noix noire à quatre cornes
        S(8, 9, 4, P, { sq: 0.9 }); for (const [dx, dy] of [[-6, -3], [6, -3], [-5, 4], [5, 4]]) L(8 + dx * 0.5, 9 + dy * 0.4, 8 + dx, 9 + dy, Q[2], 1); L(8, 5, 8, 3, Q[1]); px(7, 7, C(P[3], 1.3).map((v) => Math.min(255, v)));
        break;
      case 'damier': // une cloche penchée en damier
        L(5, 15, 6, 6, '#5a7a3a'); L(6, 6, 9, 4, '#5a7a3a');
        for (let y = 5; y < 14; y++) { const w = 1 + (y - 5) * 0.45; for (let x = Math.round(10 - w); x <= Math.round(10 + w); x++) px(x, y, ((x + y) & 1) ? Q[3] : P[1 + ((x * 3 + y) % 2)]); }
        break;
      case 'pate': // des cubes blancs poudrés
        for (const [x0, y0] of [[2, 8], [8, 9], [5, 3]]) { for (let y = y0; y < y0 + 5; y++) for (let x = x0; x < x0 + 6; x++) px(x, y, rampPick(P, 0.95 - (y - y0) * 0.08 - (x - x0) * 0.03, x, y)); L(x0, y0, x0 + 5, y0, [255, 255, 252]); }
        break;
      default: S(8, 8, 5, P);
    }
    return pb;
  };
}

// ---------------------------------------------------------------- le décor (billboards)
function spriteD2(kind, seed) {
  const rnd = mulberry32(seed);
  const TAILLE = {
    lierre: [26, 34], oreille_judas: [24, 14], sanicle: [22, 20], gouet: [22, 22], fragon: [24, 26], langue_boeuf: [20, 18], martagon: [20, 40],
    oronge: [20, 14], sabot_venus: [20, 24], gui_chene: [20, 16],
    amadouvier: [16, 42], bolet_rude: [18, 16], paxille: [20, 12], tormentille: [22, 10], germandree: [22, 24], verge_or: [20, 30], lactaire: [18, 12],
    pyrole: [18, 16], trientale: [20, 12], linnee: [22, 8],
    jonc: [20, 30], lycope: [20, 28], lysimaque: [22, 34], pediculaire: [20, 14], gratiole: [20, 14], grassette: [16, 10], canneberge: [24, 8],
    oenanthe: [24, 34], narthecie: [18, 14], oeil_bouc: [18, 10],
    scirpe: [18, 52], plantain_eau: [22, 28], eupatoire: [24, 38], nuphar: [24, 10], scrofulaire: [20, 36], guimauve_off: [22, 34], macre: [22, 8],
    acore: [20, 30], fritillaire: [18, 16], lobelie: [16, 18],
  }[kind] || [22, 22];
  const [W, H] = TAILLE, pb = new PixelBuf(W, H);
  const px = (x, y, c, a) => pb.set(Math.round(x), Math.round(y), c, a);
  const V = [[40, 100, 40], [52, 118, 46], [66, 136, 54], [84, 150, 64]]; // verts (comme les plantes d'avant)
  const vert = (k) => V[Math.max(0, Math.min(3, k | 0))];
  const sombre = [[22, 58, 26], [30, 74, 32], [42, 92, 40], [64, 118, 56]]; // vert de lierre, luisant
  const tige = (x, top, lean = 0, col) => drawLine(pb, x + lean, top, x, H - 1, col || PAL.stem[1 + ((rnd() * 2) | 0)]);
  const feuilles = (n, col, y0, h = 3) => { for (let i = 0; i < n; i++) { const x = 1 + rnd() * (W - 2), y = (y0 ?? H - 4) + rnd() * h; px(x, y, col); px(x + 1, y, col.map((v) => v * 0.82)); px(x, y - 1, col.map((v) => Math.min(255, v * 1.12))); } };
  const tapis = (y0, fn) => { for (let x = 1; x < W - 1; x++) for (let y = y0; y < H; y++) { const c = fn(x, y); if (c) px(x, y, c); } };
  const fleur = (x, y, r, col, coeur, n = 6) => { for (let a = 0; a < n; a++) { const t = a / n * TAU + rnd() * 0.3; px(x + Math.cos(t) * r, y + Math.sin(t) * r * 0.8, col); } if (coeur) px(x, y, coeur); };
  const cloche = (x, y, col, h = 2) => { for (let k = 0; k < h; k++) { px(x, y + k, col); px(x + 1, y + k, col.map((v) => v * 0.8)); } px(x - 1, y + h, col.map((v) => v * 0.9)); px(x + 2, y + h, col.map((v) => v * 0.75)); };
  const chapeau = (x, y, r, c1, c2, pied, hPied) => { // un champignon
    for (let yy = y; yy < Math.min(H, y + (hPied || H)); yy++) { px(x, yy, pied); px(x + 1, yy, pied.map((v) => v * 0.85)); }
    for (let dy = 0; dy <= r * 0.8; dy++) for (let dx = -r; dx <= r; dx++) if (dx * dx / (r * r) + dy * dy / (r * r * 0.64) <= 1) px(x + dx + 0.5, y - dy + r * 0.3, dy < 1 ? c2 : c1);
  };
  const ombelle = (x, y, r, col) => { for (let a = -r; a <= r; a++) { const yy = y + Math.abs(a) * 0.25; drawLine(pb, x, y + 3, x + a, yy, [90, 130, 70]); px(x + a, yy - 1, col); px(x + a, yy - 2, col.map((v) => v * 0.92)); if (rnd() < 0.5) px(x + a, yy - 3, col); } };
  switch (kind) {
    // ======================================================== la forêt
    case 'lierre': { // des tiges qui grimpent, des feuilles luisantes à pointes, des baies noires en haut
      for (let k = 0; k < 4; k++) { let x = 4 + k * 5 + rnd() * 3, y = H - 1; while (y > 3 + rnd() * 6) { const nx = x + (rnd() - 0.5) * 2.4; drawLine(pb, x, y, nx, y - 2, [96, 84, 62]); x = nx; y -= 2; } }
      for (let i = 0; i < 46; i++) {
        const y = 2 + Math.pow(rnd(), 0.7) * (H - 3), wy = 4 + (y / H) * (W - 8), x = W / 2 + (rnd() - 0.5) * wy * 1.6, c = sombre[(rnd() * 3) | 0];
        px(x, y, c); px(x - 1, y + 1, c); px(x + 1, y + 1, c); px(x, y + 1, c.map((v) => v * 0.85)); if (rnd() < 0.5) px(x, y - 1, c); if (rnd() < 0.4) px(x - 1, y, sombre[3]);
      }
      for (let i = 0; i < 3; i++) { const x = 5 + rnd() * (W - 10), y = 3 + rnd() * 6; for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1], [-1, 1]]) px(x + dx, y + dy, rnd() < 0.7 ? [24, 22, 34] : [50, 46, 70]); }
      break;
    }
    case 'oreille_judas': { // une branche morte, et dessus, des oreilles brunes
      drawLine(pb, 1, H - 2, W - 2, H - 6, [110, 100, 88], 2); drawLine(pb, 1, H - 1, W - 2, H - 5, [80, 72, 62]); drawLine(pb, 8, H - 4, 12, H - 9, [96, 88, 76]);
      for (const [x, y, r] of [[6, H - 6, 2.6], [11, H - 8, 3], [16, H - 8, 2.4], [19, H - 9, 2], [12, H - 11, 1.8]]) {
        drawSphere(pb, x, y, r, ramp(['#3a1e14', '#5a3024', '#7a4632', '#985e44']), seed + x, { sq: 0.8, noise: 0.35 });
        px(x, y, [50, 26, 20]); px(x - 1, y + 1, [60, 32, 24]);
      }
      break;
    }
    case 'sanicle': { // feuilles en main lustrées au pied, petites boules de fleurs
      for (let i = 0; i < 6; i++) { const cx = 3 + rnd() * (W - 6), cy = H - 3 - rnd() * 3; for (let a = 0; a < 5; a++) { const t = -Math.PI / 2 + (a - 2) * 0.55; drawLine(pb, cx, cy + 1, cx + Math.cos(t) * 2.6, cy + Math.sin(t) * 1.8, sombre[1 + (a & 1)]); } px(cx, cy, sombre[3]); }
      for (let i = 0; i < 4; i++) { const x = 3 + i * 5 + rnd() * 2, top = 2 + rnd() * 6; tige(x, top, (rnd() - 0.5) * 3, [70, 100, 60]); for (const [dx, dy] of [[0, 0], [-2, 1], [2, 1]]) { px(x + dx, top + dy, [244, 230, 236]); px(x + dx + 1, top + dy, [224, 196, 210]); px(x + dx, top + dy - 1, [250, 244, 246]); } }
      break;
    }
    case 'gouet': { // feuilles en fer de flèche tachées de noir ; un cornet pâle et son doigt pourpre
      for (const [cx, cy, s] of [[5, H - 6, -1], [W - 6, H - 7, 1], [W / 2 - 2, H - 9, 1]]) {
        for (let k = 0; k < 7; k++) { const w = 3.2 - Math.abs(k - 2.5) * 0.7; for (let dx = -w; dx <= w; dx++) px(cx + dx + s * k * 0.2, cy - k + 3, rampPick(ramp(['#244a1c', '#2e6224', '#3c7a2c', '#54943a']), 0.7 - dx * 0.1, k, dx)); }
        drawLine(pb, cx, cy + 3, cx + s, H - 1, [70, 100, 50]);
      }
      specks(pb, rnd, 9, [[30, 26, 30], [40, 30, 40]], 1, H - 14, W - 1, H - 2);
      { const x = W / 2 + 2, top = 3; for (let y = top; y < top + 11; y++) { const w = y < top + 2 ? 0.5 : 1.5 + (y - top) * 0.12; for (let dx = -w; dx <= w; dx++) px(x + dx, y, (dx < -w + 0.8) ? [150, 168, 110] : [196, 206, 150]); } for (let y = top + 3; y < top + 8; y++) px(x, y, [110, 40, 60]); px(x, top + 2, [130, 50, 70]); drawLine(pb, x, top + 11, x, H - 1, [90, 120, 70]); }
      break;
    }
    case 'fragon': { // petit buisson raide, vert sombre, piquant ; des baies rouges posées sur les rameaux
      for (let k = 0; k < 9; k++) { const x0 = W / 2 + (rnd() - 0.5) * 8; drawLine(pb, x0, H - 1, x0 + (rnd() - 0.5) * 16, 2 + rnd() * 10, [56, 90, 44]); }
      for (let i = 0; i < 40; i++) { const x = 2 + rnd() * (W - 4), y = 2 + rnd() * (H - 6), c = sombre[(rnd() * 3) | 0]; px(x, y, c); px(x + 1, y - 1, c); px(x + 2, y - 2, [180, 190, 140]); }
      specks(pb, rnd, 7, [[200, 24, 24], [170, 16, 20]], 3, 3, W - 3, H - 6);
      break;
    }
    case 'langue_boeuf': { // une racine de chêne et un pan d'écorce ; dessus, la langue rouge qui avance, plate, le dessous crème
      for (let x = 0; x < 7; x++) for (let y = 2 + x * 0.6; y < H; y++) px(x, y, rampPick(PAL.bark, 0.5 + (hash2i(x, y >> 1, seed) - 0.5) * 0.5 - x * 0.03, x, y));
      for (let x = 0; x < W; x++) { const h = 2 + Math.max(0, 5 - x * 0.45) + Math.sin(x * 0.9) * 0.6; for (let y = H - h; y < H; y++) px(x, y, rampPick(PAL.bark, 0.45 + (hash2i(x, y, seed + 2) - 0.5) * 0.4, x, y)); }
      const chair = ramp(['#4a0e0e', '#6a1818', '#8a2622', '#a63c34', '#c0584a']);
      for (let x = 5; x < W - 1; x++) { const t = (x - 5) / (W - 6), yh = 7 + t * 1.5, e = 3.6 * Math.sqrt(Math.max(0, 1 - t * t * 0.85)); for (let y = Math.round(yh - e); y <= Math.round(yh + e * 0.7); y++) px(x, y, rampPick(chair, 0.9 - (y - yh + e) / (2 * e) * 0.55 - t * 0.12, x, y)); for (let k = 0; k < 2; k++) px(x, Math.round(yh + e * 0.7) + 1 + k, k ? [200, 170, 130] : [226, 200, 160]); }
      specks(pb, rnd, 7, [[200, 110, 100], [176, 84, 74]], 7, 5, W - 3, 10);
      break;
    }
    case 'martagon': { // une tige raide, des feuilles en anneau, des turbans roses tachetés
      const x = W / 2; drawLine(pb, x, 6, x, H - 1, [70, 110, 50]);
      for (const y of [H - 16, H - 12]) for (let a = -5; a <= 5; a++) if (a) { px(x + a, y + Math.abs(a) * 0.3, vert(2 + (a & 1))); }
      for (const [dx, dy] of [[-5, 4], [4, 2], [-2, 8], [5, 10], [0, 1]]) {
        const fx = x + dx, fy = dy + 2;
        drawLine(pb, x, fy - 2, fx, fy, [70, 110, 50]);
        for (const [ex, ey] of [[-2, -1], [2, -1], [-1, 0], [1, 0], [0, 1], [-2, 1], [2, 1]]) px(fx + ex, fy + ey, [206, 110, 160]);
        px(fx - 2, fy - 2, [220, 140, 180]); px(fx + 2, fy - 2, [190, 96, 146]);
        px(fx, fy + 2, [220, 120, 40]); px(fx - 1, fy + 3, [200, 100, 30]); px(fx + 1, fy + 3, [200, 100, 30]);
        px(fx - 1, fy, [90, 20, 60]); px(fx + 1, fy - 1, [90, 20, 60]);
      }
      break;
    }
    case 'oronge': { // une oronge ouverte et un œuf qui se fend
      chapeau(6, 5, 5, [240, 120, 24], [250, 150, 40], [240, 210, 70], 8); for (let x = 2; x < 11; x++) px(x, 7, [246, 210, 70]);
      for (let x = 3; x < 10; x++) for (let y = H - 3; y < H; y++) if (Math.abs(x - 6.5) < 3.2) px(x, y, [244, 240, 228]);
      drawSphere(pb, 15, H - 4, 3.6, ramp(['#c8c0b0', '#e4ded2', '#f6f2ea', '#fffdf8']), seed, { sq: 1.15 });
      for (let x = 13; x < 18; x++) px(x, H - 7, [244, 120, 30]); px(14, H - 8, [244, 130, 36]); px(15, H - 8, [250, 140, 40]); px(16, H - 8, [230, 110, 26]);
      break;
    }
    case 'sabot_venus': { // de larges feuilles nervurées ; le sabot jaune entre quatre rubans bruns
      for (const [cx, s] of [[5, -1], [W - 6, 1]]) for (let k = 0; k < 10; k++) { const y = H - 1 - k, w = 2.4 * Math.sin((k + 1) / 11 * Math.PI); for (let dx = -w; dx <= w; dx++) px(cx + dx + s * k * 0.25, y, (Math.round(dx) === 0) ? vert(1) : vert(2 + (k & 1))); }
      const x = W / 2; drawLine(pb, x, 8, x, H - 1, [70, 110, 50]);
      drawLine(pb, x, 6, x - 6, 2, [110, 60, 40]); drawLine(pb, x, 6, x + 6, 3, [96, 50, 34]); drawLine(pb, x, 5, x, 0, [120, 66, 44]); drawLine(pb, x, 7, x + 3, 11, [100, 56, 38]);
      for (const [ex, ey] of [[-4, 3], [3, 1], [5, 4]]) px(x + ex, ey, [140, 90, 60]);
      drawSphere(pb, x + 0.5, 9.5, 3.2, ramp(['#a07a10', '#d0a818', '#f0cc30', '#fae070']), seed, { sq: 0.9 });
      px(x, 8, [120, 80, 20]); px(x + 1, 8, [120, 80, 20]); px(x - 1, 10, [250, 240, 160]);
      break;
    }
    case 'gui_chene': { // une touffe tombée : rameaux fourchus vert-jaune, feuilles par deux, baies blanches
      const cx = W / 2, cy = H - 7;
      for (let k = 0; k < 14; k++) { const a = rnd() * TAU, r = 3 + rnd() * 5; const x1 = cx + Math.cos(a) * r, y1 = cy + Math.sin(a) * r * 0.75; drawLine(pb, cx, cy, x1, y1, [120, 130, 60]); px(x1, y1, [160, 180, 70]); px(x1 + 1, y1, [140, 160, 60]); px(x1 - 1, y1 - 1, [176, 196, 90]); }
      for (let i = 0; i < 9; i++) { const x = cx + (rnd() - 0.5) * 8, y = cy + (rnd() - 0.5) * 5; px(x, y, [244, 244, 236]); px(x + 1, y, [220, 222, 210]); }
      for (let x = 2; x < W - 2; x++) if (rnd() < 0.5) px(x, H - 1, [70, 60, 40]);
      break;
    }
    // ======================================================== le bois de bouleaux
    case 'amadouvier': { // un chicot de bouleau mort, cassé net, et ses sabots gris étagés
      const x0 = W / 2 - 3;
      for (let y = 3; y < H; y++) for (let x = x0; x < x0 + 6; x++) { if (y < 6 && x - x0 > 2 + (y - 3)) continue; const u = (x - x0) / 5; let c = rampPick(PAL.birchBark, 0.75 - u * 0.5 + (hash2i(x, y >> 1, seed) - 0.5) * 0.3, x, y); if (hash2i(x >> 1, y, seed + 4) > 0.84) c = [40, 36, 34]; px(x, y, c); }
      for (let y = 7; y < H - 4; y += 3) if (rnd() < 0.7) for (let x = x0; x < x0 + 6; x++) if (rnd() < 0.6) px(x, y, [50, 44, 40]);
      const gris = ramp(['#4a443c', '#6a6258', '#8a8274', '#a8a092', '#c4bcac']);
      for (const [y, s, w] of [[12, -1, 5], [17, 1, 5], [23, -1, 6], [28, 1, 4], [33, -1, 4]]) {
        for (let k = 0; k < 4; k++) { const ww = w * (1 - k * 0.18); for (let d = 0; d < ww; d++) px(s < 0 ? x0 - d : x0 + 5 + d, y + k, rampPick(gris, 0.85 - k * 0.15 - (k === 0 ? 0 : 0.05), d, y)); }
        for (let d = 0; d < w - 1; d++) px(s < 0 ? x0 - d : x0 + 5 + d, y + 4, [214, 204, 186]);
      }
      break;
    }
    case 'bolet_rude': { // chapeau brun, long pied blanc piqueté de noir
      for (const [x, y, r, hp] of [[6, 5, 4.4, 11], [13, 8, 3.6, 8]]) {
        for (let yy = y + 1; yy < H; yy++) { px(x, yy, [236, 230, 218]); px(x + 1, yy, [214, 206, 192]); if ((yy * 7 + x) % 3 === 0) px(x + ((yy & 1) ? 1 : 0), yy, [40, 34, 30]); }
        chapeau(x, y, r, [140, 100, 62], [168, 126, 82], [236, 230, 218], 1);
      }
      break;
    }
    case 'paxille': { // des entonnoirs bruns, le creux sombre, le bord enroulé dessous
      const brun = ramp(['#5a3a20', '#7a5232', '#98683e', '#b4824e']);
      for (const [x, y, r] of [[5, 4, 4], [13, 3, 4.5], [17, 6, 3]]) {
        for (let yy = y + 3; yy < H; yy++) { px(x, yy, [150, 112, 70]); px(x + 1, yy, [124, 92, 58]); }
        for (let row = 0; row < 4; row++) { const hw = r * (1 - row * 0.2); for (let dx = -hw; dx <= hw; dx++) px(x + dx + 0.5, y + row, rampPick(brun, 0.85 - row * 0.18 - dx * 0.03, dx, row)); }
        for (let dx = -r + 1; dx <= r - 1; dx++) px(x + dx + 0.5, y, Math.abs(dx) < r * 0.55 ? [70, 46, 26] : [176, 132, 84]);
        px(x - r + 0.5, y + 1, [86, 58, 34]); px(x + r + 0.5, y + 1, [86, 58, 34]);
      }
      break;
    }
    case 'tormentille': { // feuilles par trois, petites fleurs jaunes à quatre pétales
      feuilles(9, vert(1), H - 4, 3);
      for (let i = 0; i < 6; i++) { const x = 2 + i * 3.4 + rnd(), top = 1 + rnd() * 4; drawLine(pb, x, top + 1, x + (rnd() - 0.5) * 3, H - 1, [90, 120, 60]); for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) px(x + dx, top + dy, [246, 214, 40]); px(x, top, [210, 150, 30]); }
      break;
    }
    case 'germandree': { // tiges raides, feuilles ridées ; épis de fleurs pâles d'un seul côté
      for (let i = 0; i < 5; i++) {
        const x = 3 + i * 4 + rnd(), top = 2 + rnd() * 6; drawLine(pb, x, top, x, H - 1, [90, 110, 60]);
        for (let y = top + 9; y < H - 1; y += 3) { px(x - 1, y, [90, 130, 70]); px(x - 2, y, [80, 120, 62]); px(x + 1, y, [100, 140, 76]); px(x + 2, y + 1, [86, 124, 66]); }
        for (let k = 0; k < 8; k++) px(x + 1, top + k, k % 2 ? [226, 222, 150] : [206, 204, 130]);
      }
      break;
    }
    case 'verge_or': { // des tiges droites et leur panache jaune d'or
      for (let i = 0; i < 4; i++) {
        const x = 3 + i * 4.5 + rnd(), top = 2 + rnd() * 5; drawLine(pb, x, top + 6, x, H - 1, [80, 110, 50]);
        for (let y = top + 9; y < H - 2; y += 4) { drawLine(pb, x, y, x - 3, y - 1, vert(2)); drawLine(pb, x, y + 1, x + 3, y, vert(1)); }
        for (let k = 0; k < 9; k++) { const y = top + k; px(x + (k % 2 ? 1 : -1) * (1 + (k > 4 ? 1 : 0)), y, [246, 200, 30]); px(x, y, k % 3 ? [240, 190, 20] : [250, 220, 70]); }
      }
      break;
    }
    case 'lactaire': { // chapeau rose zoné, bord frangé de laine blanche
      for (const [x, y, r] of [[6, 6, 4.2], [13, 7, 3.4]]) {
        for (let yy = y + 1; yy < H; yy++) { px(x, yy, [236, 214, 200]); px(x + 1, yy, [214, 192, 178]); }
        for (let dy = 0; dy <= r * 0.7; dy++) for (let dx = -r; dx <= r; dx++) if (dx * dx / (r * r) + dy * dy / (r * r * 0.49) <= 1) { const d = Math.hypot(dx, dy * 1.4); px(x + dx + 0.5, y - dy + 1, (Math.round(d) % 2) ? [226, 150, 136] : [240, 176, 160]); }
        for (let dx = -r; dx <= r; dx++) if (rnd() < 0.8) px(x + dx + 0.5, y + 1 + (rnd() < 0.5 ? 1 : 0), [250, 246, 240]);
      }
      break;
    }
    case 'pyrole': { // rosette de feuilles rondes luisantes ; une hampe de clochettes blanches
      for (let i = 0; i < 5; i++) drawSphere(pb, 3 + i * 3.2 + rnd(), H - 2.5, 2.2, ramp(['#1e4a20', '#2a6228', '#3c7a34', '#6aa060']), seed + i, { sq: 0.6 });
      const x = W / 2; drawLine(pb, x, 3, x, H - 3, [110, 120, 80]);
      for (let k = 0; k < 4; k++) { const y = 3 + k * 2.4, s = k % 2 ? 1 : -1; cloche(x + s * 2 - (s < 0 ? 1 : 0), y, [246, 244, 236], 2); px(x + s * 2, y + 3, [210, 160, 160]); }
      break;
    }
    case 'trientale': { // trois tiges grêles, une collerette de feuilles, une étoile blanche au-dessus
      for (let i = 0; i < 3; i++) {
        const x = 4 + i * 6 + rnd() * 2, top = 2 + rnd() * 2; drawLine(pb, x, top + 2, x, H - 1, [80, 110, 60]);
        const yl = top + 5; for (let a = -4; a <= 4; a++) if (a) px(x + a, yl + Math.abs(a) * 0.25, vert(2 + (a & 1)));
        for (let a = 0; a < 7; a++) { const t = a / 7 * TAU; px(x + Math.cos(t) * 1.6, top + Math.sin(t) * 1.2, [250, 250, 246]); } px(x, top, [240, 220, 120]);
      }
      break;
    }
    case 'linnee': { // la mousse, des fils, des paires de clochettes roses
      tapis(H - 2, (x, y) => (rnd() < 0.7 ? vert(1 + ((x * 3 + y) % 2)) : null));
      for (let i = 0; i < 4; i++) { const x = 3 + i * 5 + rnd() * 2; drawLine(pb, x, 2, x, H - 2, [110, 100, 70]); for (const s of [-1, 1]) { px(x + s, 2, [110, 100, 70]); px(x + s * 2, 3, [240, 170, 196]); px(x + s * 2, 4, [220, 140, 170]); } }
      break;
    }
    // ======================================================== le marais
    case 'jonc': { // une touffe serrée de tiges rondes ; des glomérules bruns sur le côté
      for (let i = 0; i < 22; i++) { const x0 = W / 2 + (rnd() - 0.5) * 7; const x1 = x0 + (rnd() - 0.5) * 14, top = 1 + rnd() * 8; drawLine(pb, x1, top, x0, H - 1, vert(1 + (i % 3))); if (rnd() < 0.35) { const t = 0.25 + rnd() * 0.2, gx = x1 + (x0 - x1) * t, gy = top + (H - 1 - top) * t; px(gx + 1, gy, [150, 120, 70]); px(gx + 1, gy + 1, [130, 100, 60]); px(gx + 2, gy, [160, 130, 80]); } }
      break;
    }
    case 'lycope': { // tiges carrées, feuilles très dentées, anneaux de fleurs blanches
      for (let i = 0; i < 4; i++) {
        const x = 3 + i * 4.5 + rnd(), top = 2 + rnd() * 6; drawLine(pb, x, top, x, H - 1, [80, 100, 60]);
        for (let y = top + 2 + rnd() * 2; y < H - 2; y += 3 + rnd() * 3) { for (const s of [-1, 1]) { drawLine(pb, x, y, x + s * (3 + rnd() * 2), y - 1 - rnd(), vert(2)); px(x + s * 2, y - 2, vert(3)); px(x + s * 3, y, vert(1)); } px(x - 1, y + 1, [244, 244, 240]); px(x + 1, y + 1, [236, 230, 236]); }
      }
      break;
    }
    case 'lysimaque': { // haute touffe ; grappes de coupes jaunes au sommet
      for (let i = 0; i < 4; i++) {
        const x = 3 + i * 5 + rnd(), top = 2 + rnd() * 7; drawLine(pb, x, top + 4, x, H - 1, [70, 100, 50]);
        for (let y = top + 8 + rnd() * 3; y < H - 2; y += 3 + rnd() * 3) { drawLine(pb, x, y, x - 3, y - 1, vert(2)); drawLine(pb, x, y, x + 3, y - 1, vert(2)); drawLine(pb, x, y + 1, x + 1, y + 3, vert(1)); }
        for (const [dx, dy] of [[0, 0], [-2, 2], [2, 1], [-1, 4], [1, 5], [-3, 5], [3, 4]]) { px(x + dx, top + dy, [250, 214, 30]); px(x + dx + 1, top + dy, [230, 180, 20]); }
      }
      break;
    }
    case 'pediculaire': { // tiges rougeâtres, feuilles en fougère, fleurs roses en casque
      for (let i = 0; i < 4; i++) {
        const x = 3 + i * 4.5 + rnd(), top = 2 + rnd() * 3; drawLine(pb, x, top, x, H - 1, [130, 70, 60]);
        for (let y = top + 5; y < H - 1; y += 2) { px(x - 2, y, [80, 110, 60]); px(x - 1, y, [96, 120, 70]); px(x + 1, y, [96, 120, 70]); px(x + 2, y - 1, [80, 110, 60]); }
        for (let k = 0; k < 3; k++) { px(x + (k % 2), top + k * 1.5, [216, 110, 160]); px(x + 1 + (k % 2), top + k * 1.5, [190, 80, 140]); px(x - 1 + (k % 2), top + k * 1.5 + 1, [230, 140, 180]); }
      }
      break;
    }
    case 'gratiole': { // tiges dressées, feuilles opposées, fleurs en tube blanches veinées de violet
      for (let i = 0; i < 4; i++) {
        const x = 3 + i * 4.5 + rnd(), top = 2 + rnd() * 3; drawLine(pb, x, top, x, H - 1, [80, 110, 60]);
        for (let y = top + 2; y < H - 1; y += 3) { px(x - 1, y, vert(2)); px(x - 2, y + 1, vert(1)); px(x + 1, y, vert(2)); px(x + 2, y + 1, vert(1)); if (y < H - 4) { px(x + 2, y - 1, [246, 242, 246]); px(x + 3, y - 1, [200, 170, 220]); } }
      }
      break;
    }
    case 'grassette': { // une rosette vert-jaune posée à plat ; une fleur violette seule
      for (let a = 0; a < 7; a++) { const t = a / 7 * TAU; for (let r = 0; r < 5; r++) px(W / 2 + Math.cos(t) * r * 1.3, H - 2 + Math.sin(t) * r * 0.35, r > 3 ? [150, 180, 80] : [170, 196, 96]); }
      specks(pb, rnd, 3, [[30, 30, 30]], 3, H - 3, W - 3, H - 1);
      drawLine(pb, W / 2, 2, W / 2, H - 3, [110, 130, 80]); for (const [dx, dy] of [[0, 0], [1, 0], [-1, 1], [1, 1], [0, 1], [2, 2]]) px(W / 2 + dx, 1 + dy, [120, 80, 200]); px(W / 2 - 1, 1, [150, 110, 220]);
      break;
    }
    case 'canneberge': { // la sphaigne, des fils, des baies rouges
      tapis(H - 3, (x, y) => (rnd() < 0.85 ? (rnd() < 0.2 ? [170, 100, 90] : rnd() < 0.6 ? [150, 180, 106] : [120, 156, 88]) : null));
      for (let i = 0; i < 6; i++) { const x = 2 + rnd() * (W - 4), y = H - 4 - rnd() * 2; drawLine(pb, x - 3, y + 2, x, y, [110, 70, 50]); px(x, y, [200, 24, 36]); px(x + 1, y, [170, 16, 30]); px(x, y - 1, [226, 70, 70]); px(x + 1, y + 1, [150, 10, 24]); }
      break;
    }
    case 'oenanthe': { // grandes tiges creuses, feuilles fines, ombelles blanches ; une racine en fuseau qui dépasse
      for (let i = 0; i < 3; i++) {
        const x = 5 + i * 7 + rnd() * 2, top = 3 + rnd() * 6; drawLine(pb, x, top + 3, x, H - 1, [110, 140, 90], 2);
        for (let y = top + 10; y < H - 3; y += 4) { drawLine(pb, x, y, x - 4, y - 3, vert(2)); drawLine(pb, x + 1, y + 1, x + 5, y - 2, vert(1)); px(x - 3, y - 3, vert(3)); px(x + 4, y - 3, vert(3)); }
        ombelle(x, top, 4, [244, 244, 236]);
      }
      for (let k = 0; k < 4; k++) { px(3 + k, H - 2 + (k > 1 ? 1 : 0), [236, 226, 196]); px(3 + k, H - 3, [220, 200, 150]); } px(4, H - 3, [230, 170, 40]);
      break;
    }
    case 'narthecie': { // des éventails de feuilles, des épis d'étoiles jaunes sur des tiges orangées
      for (let i = 0; i < 4; i++) { const x = 3 + i * 4 + rnd(); for (const s of [-1, 0, 1]) drawLine(pb, x, H - 1, x + s * 2, H - 6, vert(1 + (s + 1))); }
      for (let i = 0; i < 3; i++) { const x = 4 + i * 5 + rnd(), top = 1 + rnd() * 3; drawLine(pb, x, top + 2, x, H - 1, [200, 110, 40]); for (let k = 0; k < 4; k++) { const y = top + k * 1.6; px(x - 1, y, [246, 210, 40]); px(x + 1, y, [246, 200, 30]); px(x, y - 1, [250, 226, 80]); } }
      break;
    }
    case 'oeil_bouc': { // la mousse mouillée ; des fleurs jaunes piquetées d'orange sur des tiges rougeâtres
      tapis(H - 2, (x, y) => (rnd() < 0.8 ? (rnd() < 0.5 ? [120, 156, 90] : [96, 136, 76]) : null));
      for (let i = 0; i < 3; i++) { const x = 4 + i * 5 + rnd() * 2, top = 2 + rnd() * 2; drawLine(pb, x, top + 1, x, H - 2, [160, 80, 60]); for (let a = 0; a < 5; a++) { const t = a / 5 * TAU - Math.PI / 2; px(x + Math.cos(t) * 1.5, top + Math.sin(t) * 1.2, [250, 214, 30]); } px(x, top, [230, 110, 30]); px(x + 1, top - 1, [230, 110, 30]); }
      break;
    }
    // ======================================================== le bord du lac
    case 'scirpe': { // de hautes tiges rondes, vert sombre, des épillets bruns près du sommet
      for (let i = 0; i < 16; i++) { const x0 = W / 2 + (rnd() - 0.5) * 8, x1 = x0 + (rnd() - 0.5) * 9, top = 1 + rnd() * 10; drawLine(pb, x1, top, x0, H - 1, i % 3 ? [46, 92, 50] : [60, 110, 60]); if (rnd() < 0.5) { const gy = top + 3 + rnd() * 3, gx = x1 + (x0 - x1) * ((gy - top) / (H - top)); for (const [dx, dy] of [[1, 0], [2, 1], [1, 1], [2, -1]]) px(gx + dx, gy + dy, [130, 96, 56]); } }
      break;
    }
    case 'plantain_eau': { // feuilles en cuillère dressées ; une hampe en candélabre de fleurs minuscules
      for (const [cx, s] of [[4, -1], [W - 6, 1], [W / 2 - 3, 0]]) { const top = H - 12 - rnd() * 3; drawLine(pb, cx + 2, H - 1, cx + 2 + s, top + 6, [80, 120, 60]); for (let k = 0; k < 7; k++) { const w = 2.6 * Math.sin((k + 1) / 8 * Math.PI); for (let dx = -w; dx <= w; dx++) px(cx + 2 + s + dx, top + k, Math.round(dx) === 0 ? vert(1) : vert(2 + (k & 1))); } }
      { const x = W / 2 + 3; drawLine(pb, x, 2, x, H - 1, [100, 130, 80]); for (const y of [4, 9, 14]) for (const s of [-1, 1]) { const ex = x + s * (6 - y * 0.25), ey = y - 2; drawLine(pb, x, y, ex, ey, [100, 130, 80]); px(ex, ey - 1, [250, 246, 246]); px(ex + s, ey, [240, 220, 230]); } px(x, 1, [250, 246, 246]); }
      break;
    }
    case 'eupatoire': { // hautes tiges rougeâtres, feuilles en trois ; bouquets plats rose sale au sommet
      for (let i = 0; i < 4; i++) {
        const x = 4 + i * 5 + rnd(), top = 3 + rnd() * 5; drawLine(pb, x, top + 2, x, H - 1, [120, 70, 60]);
        for (let y = top + 6 + rnd() * 3; y < H - 2; y += 4 + rnd() * 3) for (const s of [-1, 1]) { drawLine(pb, x, y, x + s * (3 + rnd() * 2), y - 2, vert(2)); drawLine(pb, x, y, x + s * 3, y + 1, vert(1)); }
        for (let dx = -3; dx <= 3; dx++) { px(x + dx, top + Math.abs(dx) * 0.3, [212, 150, 166]); px(x + dx, top + 1 + Math.abs(dx) * 0.3, [190, 126, 146]); if (rnd() < 0.5) px(x + dx, top - 1, [226, 170, 184]); }
      }
      break;
    }
    case 'nuphar': { // feuilles en cœur posées sur l'eau, des boules jaunes au-dessus
      const leaf = ramp(['#1a4418', '#245e22', '#327a2e', '#4a903e']);
      for (const [cx, cy, r] of [[6, 7, 4.5], [17, 7, 5], [12, 8, 3.5]]) { drawSphere(pb, cx, cy, r, leaf, cx + seed, { sq: 0.4 }); px(cx, cy - 1, [20, 50, 20]); }
      for (const [x, y] of [[9, 3], [16, 2]]) { drawLine(pb, x, y + 2, x, 7, [70, 110, 50]); drawSphere(pb, x + 0.5, y + 0.5, 1.9, ramp(['#b08010', '#e0b018', '#f8d030', '#fcec80']), seed + x, { sq: 0.9 }); }
      break;
    }
    case 'scrofulaire': { // haute tige carrée, feuilles opposées ; petites fleurs brun-rouge en panicule
      for (let i = 0; i < 3; i++) {
        const x = 4 + i * 6 + rnd() * 2, top = 2 + rnd() * 5; drawLine(pb, x, top + 4, x, H - 1, [80, 100, 56]); drawLine(pb, x + 1, top + 12, x + 1, H - 1, [70, 90, 50]);
        for (let y = top + 13; y < H - 2; y += 5) for (const s of [-1, 1]) { drawLine(pb, x, y, x + s * 4, y - 2, vert(2)); px(x + s * 3, y - 1, vert(1)); }
        for (let k = 0; k < 6; k++) { const fx = x + (rnd() - 0.5) * 6, fy = top + rnd() * 7; drawLine(pb, x, fy + 2, fx, fy, [90, 100, 60]); px(fx, fy, [140, 40, 30]); px(fx + 1, fy, [110, 30, 24]); }
      }
      break;
    }
    case 'guimauve_off': { // grandes feuilles grises de velours ; fleurs rose très pâle le long des tiges
      const gris = ramp(['#5a6a58', '#788a74', '#96a690', '#b4c0ae']);
      for (let i = 0; i < 3; i++) {
        const x = 4 + i * 6 + rnd() * 2, top = 2 + rnd() * 5; drawLine(pb, x, top, x, H - 1, [110, 124, 100]);
        for (let y = top + 6; y < H - 2; y += 5) for (const s of [-1, 1]) drawSphere(pb, x + s * 3, y, 2.2, gris, seed + y + s, { sq: 0.7, noise: 0.3 });
        for (let y = top; y < top + 14; y += 3) { const s = (y >> 1) % 2 ? 1 : -1; px(x + s * 2, y, [246, 226, 230]); px(x + s * 2 + 1, y, [236, 206, 214]); px(x + s * 2, y + 1, [250, 236, 240]); }
      }
      break;
    }
    case 'macre': { // des rosettes de feuilles en losange, à plat sur l'eau
      for (const [cx, cy] of [[6, 5], [16, 4], [11, 6]]) for (let a = 0; a < 8; a++) { const t = a / 8 * TAU; const x = cx + Math.cos(t) * 3.4, y = cy + Math.sin(t) * 1.4; px(x, y, [60, 100, 50]); px(x + 1, y, [80, 120, 60]); px(cx + Math.cos(t) * 1.7, cy + Math.sin(t) * 0.7, [110, 70, 50]); }
      px(11, 5, [250, 250, 244]); px(6, 4, [250, 250, 244]);
      break;
    }
    case 'acore': { // des feuilles en épée, ondulées ; un épi vert de travers
      for (let i = 0; i < 9; i++) { const x0 = W / 2 + (rnd() - 0.5) * 6, x1 = x0 + (rnd() - 0.5) * 12, top = 1 + rnd() * 8; drawLine(pb, x1, top, x0, H - 1, vert(1 + (i % 3))); drawLine(pb, x1 + 1, top + 2, x0 + 1, H - 1, vert(2)); }
      { const x = W / 2 + 1, y = H - 14; for (let k = 0; k < 6; k++) { px(x + 1 + k * 0.6, y - k, [150, 160, 80]); px(x + 2 + k * 0.6, y - k, [130, 140, 70]); } }
      break;
    }
    case 'fritillaire': { // tiges minces, cloches penchées en damier pourpre
      for (let i = 0; i < 3; i++) {
        const x = 3 + i * 5.5 + rnd(), top = 2 + rnd() * 3; drawLine(pb, x, top, x, H - 1, [90, 120, 80]); drawLine(pb, x, top, x + 2, top + 1, [90, 120, 80]);
        for (let y = top + 2; y < top + 7; y++) { const w = 0.5 + (y - top - 2) * 0.5; for (let dx = -w; dx <= w; dx++) px(x + 2 + dx, y, ((Math.round(dx) + y) & 1) ? [230, 214, 228] : [120, 40, 90]); }
        drawLine(pb, x, H - 5, x - 3, H - 9, vert(2));
      }
      break;
    }
    case 'lobelie': { // des hampes nues sortant de l'eau, quelques clochettes lilas
      for (let i = 0; i < 3; i++) { const x = 3 + i * 5 + rnd() * 2, top = 1 + rnd() * 4; drawLine(pb, x, top, x, H - 1, [110, 140, 100]); for (let k = 0; k < 3; k++) { const y = top + k * 3, s = k % 2 ? 1 : -1; px(x + s, y, [204, 190, 236]); px(x + s, y + 1, [180, 166, 220]); px(x + s * 2, y + 1, [214, 204, 244]); } }
      break;
    }
    default: tige(W / 2, 4); px(W / 2, 4, [240, 240, 240]);
  }
  if (!['linnee', 'canneberge', 'nuphar', 'macre', 'oeil_bouc'].includes(kind)) edgeDarken(pb, 0.8);
  return pb;
}
{
  const _afs = addFarmSprites;
  addFarmSprites = function (add) {
    _afs(add);
    if (typeof D2_PLANTES !== 'undefined') D2_PLANTES.forEach((P, i) => add('d2_' + P.o, spriteD2(P.o, 8111 + i * 31)));
  };
}
