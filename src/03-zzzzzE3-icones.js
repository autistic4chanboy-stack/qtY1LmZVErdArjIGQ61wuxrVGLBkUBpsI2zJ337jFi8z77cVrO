// ============================================================================
//  LES BÊTES DES BOIS ET DU MARAIS (agent E3) : icônes nouvelles (formes
//  « e3_… ») — bois de daim en palette, plume du peintre, aigrettes, sangsue,
//  grand capricorne.
// ============================================================================
{
  const _ip = iconPaint;
  iconPaint = function (shape, c1, c2) {
    if (typeof shape !== 'string' || !shape.startsWith('e3_')) return _ip(shape, c1, c2);
    const kind = shape.slice(3);
    const pb = new PixelBuf(16, 16), P = rampOf(c1 || '#aaaaaa'), Q = rampOf(c2 || '#6a5038');
    const L = (x0, y0, x1, y1, c, w) => drawLine(pb, x0, y0, x1, y1, typeof c === 'string' ? hexc(c) : c, w || 1);
    const px = (x, y, c) => pb.set(Math.round(x), Math.round(y), typeof c === 'string' ? hexc(c) : c);
    switch (kind) {
      case 'bois': { // la palette du daim : une perche, deux andouillers, la pelle dentelée
        L(3, 15, 5, 9, P[1], 2); L(5, 9, 6, 6, P[1], 2);
        L(4, 12, 1, 10, P[2]); L(5, 9, 2, 7, P[2]);
        for (let y = 1; y < 8; y++) for (let x = 6; x < 14 - (y < 3 ? 3 - y : 0); x++) if (x - 6 < 2 + y * 1.2) pb.set(x, y, rampPick(P, 0.95 - (y / 9) - (x - 6) * 0.03, x, y));
        for (const x of [8, 10, 12]) px(x, 0, P[3]);
        L(6, 7, 13, 6, C(P[0], 0.9));
        break;
      }
      case 'plume_fine': // une petite plume raide, pointue
        L(5, 14, 11, 2, Q[0]);
        for (let i = 0; i < 9; i++) { const x = 6 + i * 0.6, y = 12 - i * 1.15; px(x - 1, y, P[2]); px(x + 1, y + 0.4, P[3]); }
        px(11, 2, P[3]); px(10, 3, P[2]);
        break;
      case 'aigrette': // une poignée de longues plumes blanches, effilées
        for (let k = 0; k < 5; k++) {
          const x0 = 7 + k * 0.4, a = -0.9 + k * 0.45;
          for (let i = 0; i < 13; i++) { const x = x0 + Math.sin(a) * i * 0.75 + Math.sin(i * 0.5 + k) * 0.6, y = 15 - i; px(x, y, rampPick(P, 0.95 - i * 0.03, k, i)); if (i % 2) px(x + 1, y, C(P[2], 0.92)); }
        }
        L(7, 15, 9, 13, [150, 130, 110]);
        break;
      case 'sangsue': { // un ver noir, plat, ondulant, rayé de roux
        for (let i = 0; i < 13; i++) {
          const x = 2 + i, y = 8 + Math.sin(i * 0.7) * 2.6, r = i < 2 || i > 11 ? 1 : 1.6;
          for (let dy = -r; dy <= r; dy++) pb.set(x, Math.round(y + dy), dy < -0.5 ? P[3] : dy > 0.5 ? P[0] : P[1]);
          if (i % 3 === 1) px(x, y, Q[2]);
        }
        break;
      }
      case 'capricorne': { // un long scarabée noir, les antennes plus longues que lui
        drawSphere(pb, 8, 10, 2.6, P, 11, { sq: 2 });
        L(8, 6, 8, 15, C(P[0], 0.7));
        drawSphere(pb, 8, 5, 1.6, P, 13);
        for (const s of [-1, 1]) {
          L(8 + s, 4, 8 + s * 4, 1, Q[1]); L(8 + s * 4, 1, 8 + s * 7, 3, Q[1]); L(8 + s * 7, 3, 8 + s * 7, 8, Q[2]);
          for (const y of [8, 10, 12]) L(8 + s * 2, y, 8 + s * 5, y + 1, P[1]);
        }
        px(7, 14, Q[2]); px(9, 14, Q[2]);
        break;
      }
      default: drawSphere(pb, 8, 8, 5, P, 3);
    }
    return pb;
  };
}
