// ============================================================================
//  LA NATURE (agent C2) : icônes nouvelles (formes « n2_… » : bûches d'un bois,
//  manche, bâton, clochettes, ombrelle, bolet, boule, massette, papillon,
//  filet, insectes) et sprites des plantes nouvelles (« w4_… »).
// ============================================================================
{
  const _ip = iconPaint;
  iconPaint = function (shape, c1, c2) {
    if (typeof shape !== 'string' || !shape.startsWith('n2_')) return _ip(shape, c1, c2);
    const kind = shape.slice(3);
    const pb = new PixelBuf(16, 16), P = rampOf(c1 || '#aaaaaa'), Q = rampOf(c2 || '#4a9a3a');
    const S = (cx, cy, r, pal, o) => drawSphere(pb, cx, cy, r, pal || P, (cx * 7 + cy * 3) | 0, o || {});
    const L = (x0, y0, x1, y1, c, w) => drawLine(pb, x0, y0, x1, y1, typeof c === 'string' ? hexc(c) : c, w || 1);
    const px = (x, y, c) => pb.set(x, y, typeof c === 'string' ? hexc(c) : c);
    switch (kind) {
      case 'buche': { // deux bûches : l'écorce (c1), le bois de bout (c2)
        for (const [y0, x0, x1] of [[8, 1, 12], [3, 3, 13]]) {
          for (let y = y0; y < y0 + 5; y++) for (let x = x0; x < x1; x++) pb.set(x, y, rampPick(P, 0.75 - (y - y0) * 0.09 + (hash2i(x >> 1, y, 5) - 0.5) * 0.35, x, y));
          S(x1, y0 + 2.2, 2.6, Q);
          px(x1, y0 + 2, C(Q[0], 0.9));
        }
        break;
      }
      case 'manche': L(3, 14, 13, 2, P[2], 2); L(4, 14, 13, 3, P[1]); px(13, 2, P[3]); px(3, 14, C(P[0], 0.8)); break;
      case 'baton': L(5, 15, 11, 0, P[2], 2); L(6, 15, 11, 1, P[1]); px(11, 0, P[3]); px(8, 7, C(P[0], 0.9)); break;
      case 'clochettes': // tige arquée, clochettes pendantes (c1 : les fleurs)
        L(3, 15, 5, 5, '#3e7a2e'); L(5, 5, 11, 3, '#3e7a2e');
        for (const [x, y] of [[6, 7], [9, 6], [12, 6]]) { L(x, y - 2, x, y, '#3e7a2e'); S(x, y + 1.6, 1.9, P, { sq: 1.2 }); px(x, y + 3, C(P[0], 0.8)); }
        break;
      case 'parasol': // grand champignon en ombrelle
        L(8, 6, 8, 15, [226, 216, 196], 2); L(7, 10, 10, 10, [200, 190, 170]);
        for (let x = 1; x < 15; x++) { const h = Math.round(3 - Math.abs(x - 7.5) * 0.35); for (let y = 5 - h; y <= 5; y++) pb.set(x, y, rampPick(P, 0.85 - (y - 2) * 0.1, x, y)); }
        for (const [x, y] of [[4, 4], [7, 3], [10, 4], [12, 5], [6, 5]]) px(x, y, Q[1]);
        break;
      case 'bolet': // chapeau pâle, pied renflé rouge
        S(8, 12, 3.2, Q, { sq: 1.1 }); S(8, 6, 6, P, { sq: 0.6, flatBottom: 0.3 }); for (let x = 4; x < 13; x++) px(x, 8, C(Q[1], 1.1)); break;
      case 'boule': S(8, 10, 5.5, P, { sq: 0.9, noise: 0.25 }); for (const [x, y] of [[6, 7], [9, 8], [7, 10], [10, 11], [5, 11]]) px(x, y, C(P[3], 1.05)); L(7, 15, 9, 15, [120, 110, 90]); break;
      case 'massette': L(8, 15, 8, 1, '#5a7a3a'); for (let y = 4; y < 11; y++) for (let x = 6; x < 11; x++) pb.set(x, y, rampPick(P, 0.8 - (x - 6) * 0.12, x, y)); L(5, 15, 3, 6, '#6a8a4a'); L(11, 15, 13, 7, '#6a8a4a'); break;
      case 'papillon': { // ailes (c1), bordure (c2)
        for (const s of [-1, 1]) {
          for (let dy = -5; dy <= 4; dy++) for (let dx = 1; dx <= 6; dx++) {
            const hi = dy < 0 ? (dx * dx) / 36 + (dy * dy) / 25 : (dx * dx) / 20 + (dy * dy) / 16;
            if (hi > 1) continue;
            pb.set(8 + s * dx - (s < 0 ? 1 : 0), 8 + dy, hi > 0.72 ? Q[1] : rampPick(P, 0.95 - hi * 0.4, dx, dy));
          }
        }
        L(7, 4, 7, 12, [40, 30, 20]); L(8, 4, 8, 12, [60, 45, 25]); px(6, 2, [40, 30, 20]); px(9, 2, [40, 30, 20]);
        break;
      }
      case 'filet': // cercle de bois au bout d'un manche, et la poche
        L(2, 15, 8, 8, [150, 110, 60], 2);
        for (let a = 0; a < 24; a++) px(10 + Math.cos(a / 24 * TAU) * 4.5, 5 + Math.sin(a / 24 * TAU) * 4.5, [130, 95, 55]);
        for (let y = 2; y < 10; y++) for (let x = 7; x < 14; x++) if (((x + y) & 1) && Math.hypot(x - 10, y - 5) < 4) px(x, y, [236, 232, 220]);
        break;
      case 'insecte': // coléoptère (c1 : élytres, c2 : pattes et mandibules)
        S(8, 9, 4, P, { sq: 1.4 }); L(8, 4, 8, 14, C(P[0], 0.7)); S(8, 4, 2, Q);
        for (const s of [-1, 1]) { L(8 + s * 2, 3, 8 + s * 4, 0, Q[2]); for (const y of [7, 9, 11]) L(8 + s * 3, y, 8 + s * 6, y + 1, Q[1]); }
        break;
      case 'mante': L(8, 2, 8, 13, P[2], 2); L(8, 5, 5, 3, P[1]); L(8, 5, 11, 3, P[1]); L(9, 9, 13, 14, P[1]); L(8, 9, 4, 14, P[1]); S(8.5, 2, 1.6, P); break;
      default: S(8, 8, 5, P);
    }
    return pb;
  };
}
