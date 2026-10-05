// ============================================================================
//  LES BÊTES DE LA LANDE, DES HAUTEURS ET DU LAC (agent E2) : icônes « e2_… »
//  (plume à bout coloré, plume en lyre, peau tachée, sphinx tête-de-mort,
//  apollon). Les objets : 05-zzzzzE2-betes.js.
// ============================================================================
{
  const _ip = iconPaint;
  iconPaint = function (shape, c1, c2) {
    if (typeof shape !== 'string' || !shape.startsWith('e2_')) return _ip(shape, c1, c2);
    const kind = shape.slice(3);
    const pb = new PixelBuf(16, 16), P = rampOf(c1 || '#aaaaaa'), Q = rampOf(c2 || '#202020');
    const S = (cx, cy, r, pal, o) => drawSphere(pb, cx, cy, r, pal || P, (cx * 7 + cy * 3) | 0, o || {});
    const L = (x0, y0, x1, y1, c, w) => drawLine(pb, x0, y0, x1, y1, typeof c === 'string' ? hexc(c) : c, w || 1);
    const px = (x, y, c) => pb.set(Math.round(x), Math.round(y), typeof c === 'string' ? hexc(c) : c);
    switch (kind) {
      case 'plume': { // une plume en diagonale, le bout (c2) d'une autre couleur
        L(3, 14, 13, 2, C(P[0], 0.8));
        for (let i = 0; i < 9; i++) {
          const bout = i >= 6;
          L(4 + i, 12 - i, 1 + i, 9 - i * 1.1, bout ? Q[2] : P[2]);
          L(4 + i, 12 - i, 7 + i, 13 - i * 1.1, bout ? Q[3] : P[3]);
        }
        px(13, 2, Q[1]);
        break;
      }
      case 'lyre': { // une plume noire recourbée en crosse
        let x = 4, y = 14;
        for (let i = 0; i < 12; i++) {
          const a = -1.25 + i * 0.16, nx = x + Math.cos(a) * 1.05, ny = y + Math.sin(a) * 1.05 - 0.05;
          L(x, y, nx, ny, P[2], 2); px(nx + 1, ny, Q[2]);
          x = nx; y = ny;
        }
        for (let i = 0; i < 4; i++) px(x + 1 + i * 0.6, y + 1 + i * 0.4, Q[3]);
        L(3, 15, 4, 14, [200, 196, 186]);
        break;
      }
      case 'peau': { // une peau étendue, tachée (c2) ; la queue annelée
        fillPoly(pb, [[3, 3], [12, 2], [14, 6], [13, 12], [9, 14], [4, 13], [2, 8]], P, () => 0.6);
        for (const [x, y] of [[5, 5], [9, 4], [11, 8], [6, 9], [9, 11], [4, 11]]) { px(x, y, Q[1]); px(x + 1, y, Q[2]); }
        for (let i = 0; i < 4; i++) { px(13 + i * 0.5, 12 + i, i % 2 ? Q[1] : P[3]); }
        break;
      }
      case 'sphinx': { // ailes brunes repliées en toit, abdomen rayé de jaune, la tête de mort sur le dos
        for (const s of [-1, 1]) for (let dy = -3; dy <= 6; dy++) for (let dx = 1; dx <= 6; dx++) {
          if (dx > 6 - Math.max(0, dy - 1) * 0.6 || (dy < -1 && dx > 4)) continue;
          px(8 + s * dx - (s < 0 ? 1 : 0), 7 + dy, rampPick(P, 0.85 - (dx + dy) * 0.04, dx, dy));
        }
        for (let y = 7; y < 15; y++) { px(7, y, y % 2 ? Q[2] : [30, 24, 20]); px(8, y, y % 2 ? Q[3] : [40, 32, 26]); }
        S(7.5, 5, 2.1, rampOf('#e8dcb0'));
        px(7, 5, [30, 22, 18]); px(8, 5, [30, 22, 18]); px(7.5, 6.4, [60, 46, 36]);
        L(7, 2, 5, 0, [60, 46, 36]); L(8, 2, 10, 0, [60, 46, 36]);
        break;
      }
      case 'apollon': { // ailes blanches, taches noires, deux yeux rouges cerclés de noir
        for (const s of [-1, 1]) {
          for (let dy = -5; dy <= 4; dy++) for (let dx = 1; dx <= 6; dx++) {
            const hi = dy < 0 ? (dx * dx) / 36 + (dy * dy) / 25 : (dx * dx) / 20 + (dy * dy) / 16;
            if (hi > 1) continue;
            px(8 + s * dx - (s < 0 ? 1 : 0), 8 + dy, hi > 0.8 ? [180, 178, 172] : rampPick(P, 0.95 - hi * 0.3, dx, dy));
          }
          const ex = 8 + s * 3 - (s < 0 ? 1 : 0);
          px(ex, 10, Q[2]); px(ex + s, 10, [30, 26, 24]); px(ex, 11, [30, 26, 24]);
          px(8 + s * 2 - (s < 0 ? 1 : 0), 5, [40, 36, 34]); px(8 + s * 4 - (s < 0 ? 1 : 0), 4, [40, 36, 34]);
        }
        L(7, 4, 7, 12, [40, 34, 30]); L(8, 4, 8, 12, [56, 48, 40]); px(6, 2, [40, 30, 20]); px(9, 2, [40, 30, 20]);
        break;
      }
      default: S(8, 8, 5, P);
    }
    return pb;
  };
}
