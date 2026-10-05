// ============================================================================
//  LES BÊTES DES PRÉS, DE LA FERME ET DE LA VILLE (agent E1) : icônes des
//  objets nouveaux (formes « e1_… ») : la sauterelle, le grand paon, l'escargot,
//  la toile roulée, le nid de frelons.
// ============================================================================
{
  const _ip = iconPaint;
  iconPaint = function (shape, c1, c2) {
    if (typeof shape !== 'string' || !shape.startsWith('e1_')) return _ip(shape, c1, c2);
    const kind = shape.slice(3);
    const pb = new PixelBuf(16, 16), P = rampOf(c1 || '#aaaaaa'), Q = rampOf(c2 || '#555555');
    const S = (cx, cy, r, pal, o) => drawSphere(pb, cx, cy, r, pal || P, (cx * 7 + cy * 3) | 0, o || {});
    const L = (x0, y0, x1, y1, c, w) => drawLine(pb, x0, y0, x1, y1, typeof c === 'string' ? hexc(c) : c, w || 1);
    const px = (x, y, c) => pb.set(Math.round(x), Math.round(y), typeof c === 'string' ? hexc(c) : c);
    switch (kind) {
      case 'sauterelle': // un long corps vert, les grandes pattes pliées, les antennes
        for (let x = 3; x < 13; x++) { px(x, 9, P[2]); px(x, 8, P[3]); px(x, 10, P[1]); }
        S(13, 8.5, 1.6, P);
        L(13, 7, 4, 1, Q[2]); L(14, 7, 8, 0, Q[2]);
        L(8, 10, 5, 4, P[1], 2); L(5, 4, 2, 13, P[1]);
        L(11, 10, 12, 14, Q[1]); L(9, 10, 9, 14, Q[1]);
        px(14, 8, [20, 20, 20]);
        break;
      case 'paon': { // un papillon de nuit gris-brun, un œil sur chaque aile
        for (const s of [-1, 1]) for (let dy = -5; dy <= 5; dy++) for (let dx = 1; dx <= 7; dx++) {
          const hi = dy < 0 ? (dx * dx) / 49 + (dy * dy) / 30 : (dx * dx) / 36 + (dy * dy) / 26;
          if (hi > 1) continue;
          pb.set(8 + s * dx - (s < 0 ? 1 : 0), 8 + dy, hi > 0.78 ? C(P[0], 0.9) : rampPick(P, 0.9 - hi * 0.45, dx, dy));
        }
        for (const [x, y] of [[3, 5], [12, 5], [4, 11], [11, 11]]) { px(x, y, Q[2]); px(x + 1, y, Q[2]); px(x, y + 1, [20, 16, 14]); px(x + 1, y + 1, [20, 16, 14]); px(x + 1, y, [236, 230, 220]); }
        L(7, 3, 7, 13, [70, 56, 46]); L(8, 3, 8, 13, [90, 72, 58]);
        break;
      }
      case 'escargot': // la coquille en spirale, le pied, les cornes
        for (let x = 1; x < 15; x++) px(x, 13, C(Q[2], 1.1));
        for (let x = 2; x < 13; x++) px(x, 12, Q[2]);
        S(8, 8, 4.6, P);
        for (let a = 0; a < 18; a++) { const t = a / 18 * TAU * 1.6, r = 3.8 - a * 0.19; px(8 + Math.cos(t) * r, 8 + Math.sin(t) * r, P[0]); }
        L(13, 12, 14, 8, Q[2]); L(12, 12, 12, 9, Q[2]); px(14, 7, [40, 30, 26]); px(12, 8, [40, 30, 26]);
        break;
      case 'toile': { // une boule de fils gris pâle
        for (let k = 0; k < 40; k++) { const a = k * 2.39996, r = Math.sqrt(k / 40) * 5.5; px(8 + Math.cos(a) * r, 8 + Math.sin(a) * r, k % 3 ? P[2] : P[3]); }
        for (let k = 0; k < 6; k++) L(8, 8, 8 + Math.cos(k) * 6, 8 + Math.sin(k) * 6, k % 2 ? P[1] : Q[2]);
        break;
      }
      case 'guepier': // une boule de papier en couches, l'entrée en dessous
        L(8, 0, 8, 2, [90, 70, 50], 2);
        S(8, 8.5, 6, P, { sq: 1.15 });
        for (let y = 4; y < 14; y += 2) for (let x = 3; x < 14; x++) if (Math.hypot(x - 8, (y - 8.5) * 0.87) < 5.6) px(x, y, Q[2]);
        px(8, 14, [30, 24, 18]); px(7, 14, [30, 24, 18]);
        break;
      default: S(8, 8, 5, P);
    }
    return pb;
  };
}
