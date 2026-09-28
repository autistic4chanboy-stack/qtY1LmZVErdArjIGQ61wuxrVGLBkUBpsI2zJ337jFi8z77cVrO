// ============================================================================
//  ICÔNES DES NOUVELLES PLANTES (16 × 16) : racines, bulbes, feuilles, fruits,
//  céréales, aromates, fleurs ; bouquet, selle, chantiers de construction
//  (formes « c2_… » : couleur 1 = la plante, couleur 2 = feuillage ou détail)
// ============================================================================
{
  const _iconPaint = iconPaint;
  iconPaint = function (shape, c1, c2) {
    if (typeof shape !== 'string' || !shape.startsWith('c2_')) return _iconPaint(shape, c1, c2);
    const kind = shape.slice(3);
    const pb = new PixelBuf(16, 16), P = rampOf(c1 || '#aaaaaa'), Q = rampOf(c2 || '#4a9a3a');
    const S = (cx, cy, r, pal, o) => drawSphere(pb, cx, cy, r, pal || P, (cx * 7 + cy * 3) | 0, o || {});
    const L = (x0, y0, x1, y1, c, w) => drawLine(pb, x0, y0, x1, y1, typeof c === 'string' ? hexc(c) : c, w || 1);
    const R = (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) pb.set(x, y, typeof c === 'function' ? c(x, y) : c); };
    const px = (x, y, c) => pb.set(x, y, typeof c === 'string' ? hexc(c) : c);
    const over = (fn) => { for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (pb.alpha(x, y) === 255) { const c = fn(x, y); if (c) pb.set(x, y, c); } };
    const G = rampOf('#4a9a3a'), stem = '#3e7a2e';
    const leaves = (x, y) => { L(x, y, x - 3, y - 4, Q[2], 2); L(x, y, x + 3, y - 4, Q[1], 2); L(x, y, x, y - 5, Q[3]); };
    switch (kind) {
      case 'racine_rond': S(8, 10, 4.8, P); over((x, y) => (y < 8 ? rampPick(Q, 0.85 - (x - 4) * 0.06, x, y) : null)); leaves(8, 5); px(8, 15, [230, 225, 215]); break;
      case 'racine_long':
        for (let y = 4; y <= 15; y++) { const w = 3.3 * Math.pow(1 - (y - 4) / 12, 0.8) + 0.3; for (let x = Math.round(8 - w); x <= Math.round(8 + w); x++) px(x, y, rampPick(P, 0.9 - (x - 8 + w) / (2 * w) * 0.6, x, y)); }
        for (const y of [7, 10, 13]) px(7, y, C(P[1], 0.85));
        leaves(8, 4); break;
      case 'racine_gros': S(8, 10, 5.5, P, { sq: 0.85, noise: 0.35 }); L(4, 13, 2, 15, P[1]); L(12, 13, 14, 15, P[1]); px(8, 15, P[1]); L(7, 6, 5, 1, Q[2]); L(9, 6, 11, 1, Q[2]); L(8, 6, 8, 1, Q[1]); S(5, 1.5, 1.4, Q); S(11, 1.5, 1.4, Q); break;
      case 'topi': S(5.5, 10, 3, P, { noise: 0.4 }); S(10.5, 9, 3.2, P, { noise: 0.4 }); S(8, 12.5, 2.6, P, { noise: 0.4 }); px(4, 9, C(P[0], 0.9)); px(11, 7, C(P[0], 0.9)); px(9, 13, C(P[0], 0.9)); break;
      case 'bulbe': S(8, 10, 5, P, { sq: 0.9 }); for (const x of [6, 10]) for (let y = 7; y < 14; y++) if (pb.alpha(x, y) === 255) px(x, y, C(P[1], 0.9)); L(8, 5, 8, 3, P[1]); L(8, 3, 6, 0, Q[2]); L(8, 3, 10, 0, Q[1]); L(7, 15, 9, 15, [220, 210, 190]); break;
      case 'ail': S(8, 10, 5, P, { sq: 0.85 }); L(6, 7, 6, 14, C(P[1], 0.9)); L(10, 7, 10, 14, C(P[1], 0.9)); L(8, 6, 8, 14, C(P[1], 0.95)); L(8, 5, 8, 1, P[1]); px(7, 15, [200, 190, 170]); px(9, 15, [200, 190, 170]); break;
      case 'echalote': S(5.8, 10, 3.4, P, { sq: 1.25 }); S(10.2, 10, 3.4, P, { sq: 1.25 }); L(6, 6, 5, 2, P[1]); L(10, 6, 11, 2, P[1]); break;
      case 'poireau': R(6, 7, 9, 15, (x, y) => rampPick(rampOf('#e8ecd8'), 0.85 - (x - 6) * 0.12, x, y)); R(6, 5, 9, 6, Q[2]); L(7, 5, 3, 0, Q[2], 2); L(8, 5, 8, 0, Q[1], 2); L(9, 5, 13, 0, Q[3], 2); break;
      case 'salade': S(8, 9, 6, P, { sq: 0.8, noise: 0.3 }); S(8, 8, 3, rampOf(C(P[3], 1.1).map((v) => Math.min(255, v)))); for (let k = 0; k < 6; k++) L(8, 9, 8 + Math.cos(k * 1.05) * 5, 9 + Math.sin(k * 1.05) * 4, C(P[1], 0.85)); break;
      case 'feuille': S(8, 8, 5, P, { sq: 1.35 }); L(8, 2, 8, 14, C(P[3], 1.15)); for (const y of [5, 8, 11]) { L(8, y, 5, y - 2, C(P[3], 1.05)); L(8, y, 11, y - 2, C(P[3], 1.05)); } L(8, 14, 9, 15, P[1]); break;
      case 'blette': L(6, 15, 5, 7, P[2], 2); L(9, 15, 9, 6, P[2], 2); S(5, 4.5, 3, Q, { sq: 1.2 }); S(10.5, 4, 3.2, Q, { sq: 1.2 }); L(5, 7, 5, 2, C(P[2], 1)); L(10, 7, 10, 1, C(P[2], 1)); break;
      case 'rhubarbe': L(5, 15, 6, 6, P[2], 2); L(8, 15, 8, 5, P[1], 2); L(11, 15, 10, 6, P[2], 2); S(8, 4, 5.5, Q, { sq: 0.6 }); break;
      case 'choufleur': S(8, 9.5, 7, Q, { sq: 0.7 }); S(8, 8, 4.6, P, { noise: 0.45 }); for (const [x, y] of [[6, 7], [9, 6], [10, 9], [7, 10]]) px(x, y, C(P[1], 0.85)); break;
      case 'brocoli': L(8, 15, 8, 9, rampOf('#8ab060')[2], 3); S(5, 7, 3, P, { noise: 0.45 }); S(11, 7, 3, P, { noise: 0.45 }); S(8, 5, 3.6, P, { noise: 0.45 }); break;
      case 'artichaut': S(8, 9, 5.5, P, { sq: 1.05 }); for (const y of [6, 9, 12]) { L(5, y - 2, 8, y, C(P[0], 0.9)); L(8, y, 11, y - 2, C(P[0], 0.9)); } L(8, 15, 8, 14, P[1], 2); break;
      case 'asperge': for (const x of [5, 8, 11]) { L(x, 15, x, 4 + (x === 8 ? -1 : 1), P[2], 2); S(x + 0.5, x === 8 ? 3 : 5, 1.4, rampOf(C(P[1], 0.8))); px(x, 9, C(P[1], 0.8)); px(x + 1, 12, C(P[1], 0.8)); } break;
      case 'courgette': thickLine(pb, 3, 12, 13, 4, 4, P, 0.85); L(13, 4, 14, 2, '#6a5a3a', 2); px(2, 13, [240, 200, 60]); px(3, 14, [240, 200, 60]); break;
      case 'concombre': thickLine(pb, 3, 12, 13, 4, 3.5, P, 0.85); for (let k = 0; k < 5; k++) px(4 + k * 2, 11 - k * 1.6, C(P[3], 1.1)); L(13, 4, 14, 3, '#6a5a3a'); break;
      case 'poivron': S(8, 10, 5, P, { sq: 0.95 }); L(6, 6, 6, 14, C(P[1], 0.9)); L(10, 6, 10, 14, C(P[1], 0.9)); L(8, 5, 8, 2, '#3a7a2a', 2); L(6, 5, 10, 5, '#3a7a2a'); break;
      case 'piment': for (let i = 0; i <= 22; i++) { const t = i / 22, x = 5 + t * 6 + Math.sin(t * 3) * 1.2, y = 4 + t * 11, w = 2.4 * (1 - t) + 0.6; for (let k = -w / 2; k <= w / 2; k += 0.5) px(Math.round(x + k), Math.round(y), rampPick(P, 0.8 - k * 0.2, x, y)); } L(3, 4, 7, 3, '#3a7a2a', 2); break;
      case 'aubergine': S(9, 10.5, 4.8, P, { sq: 1.1 }); S(7, 6.5, 3, P); L(4, 4, 8, 4, '#3a6a2a', 2); L(6, 4, 5, 1, '#3a6a2a'); break;
      case 'pois': thickLine(pb, 3, 11, 13, 5, 3.4, P, 0.85); for (const [x, y] of [[5, 9.7], [8, 8.2], [11, 6.7]]) S(x, y, 1.3, rampOf(C(P[3], 1.15).map((v) => Math.min(255, v)))); L(13, 5, 14, 3, '#5a7a3a'); break;
      case 'pasteque': S(8, 9, 6.5, P, { sq: 0.85 }); for (const x0 of [4, 7, 10, 13]) for (let y = 3; y < 15; y++) { const x = x0 + Math.round(Math.sin(y * 0.8)); if (pb.alpha(x, y) === 255) px(x, y, C(P[0], 0.7)); } break;
      case 'courge': S(8, 11.5, 4.6, P); S(8, 6, 2.9, P); L(8, 3, 9, 1, '#6a5a3a', 2); break;
      case 'epi': case 'avoine': {
        const tops = [[5.5, 6], [8, 4], [10.5, 6]];
        for (const [x, y] of tops) L(8, 15, x, y + 1, rampOf('#c8b070')[1]);
        for (const [x, y] of tops) for (let i = 0; i < 4; i++) {
          const yy = y - i * 1.4;
          if (kind === 'avoine') { px(x - 1.5 - i * 0.2, yy + 1, P[2]); px(x + 1.5 + i * 0.2, yy + 1.5, P[3]); px(x, yy, P[2]); }
          else { px(x - 1, yy, P[2]); px(x + 1, yy, P[3]); px(x, yy - 0.6, P[2]); }
        }
        if (c1 && c1.toLowerCase() === '#d8c890') for (const [x, y] of tops) L(x, y - 5, x - 1, y - 8, P[1]);
        break;
      }
      case 'sarrasin': for (const [x, y] of [[5, 9], [9, 8], [7, 12], [11, 11], [6, 5], [10, 4], [3, 12], [12, 7]]) { px(x, y, P[1]); px(x + 1, y, P[2]); px(x, y + 1, P[2]); px(x + 1, y + 1, P[0]); px(x, y - 1, P[3]); } break;
      case 'colza': L(5, 15, 5, 5, stem); L(8, 15, 9, 3, stem); L(11, 15, 11, 6, stem); S(5, 4.5, 2.2, P, { noise: 0.4 }); S(9, 3, 2.4, P, { noise: 0.4 }); S(11.5, 6, 2, P, { noise: 0.4 }); break;
      case 'chanvre': for (let k = -3; k <= 3; k++) { const a = -Math.PI / 2 + k * 0.4, r = 6.5 - Math.abs(k) * 0.9; L(8, 11, 8 + Math.cos(a) * r, 11 + Math.sin(a) * r, P[2 - (k & 1)], 2); } L(8, 11, 8, 15, P[1]); break;
      case 'houblon': S(8, 9, 4.5, P, { sq: 1.3 }); for (const y of [6, 9, 12]) L(5, y, 11, y, C(P[1], 0.9)); L(8, 3, 8, 1, '#5a7a3a'); L(8, 2, 11, 1, '#5a7a3a'); break;
      case 'lentille': S(8, 11, 6, P, { sq: 0.5, noise: 0.5 }); for (let k = 0; k < 14; k++) { const x = 3 + ((k * 37) % 11), y = 8 + ((k * 23) % 6); px(x, y, P[1 + (k % 3)]); } break;
      case 'baie': S(6, 9.5, 3, P, { noise: 0.4 }); S(10, 9.5, 3, P, { noise: 0.4 }); S(8, 12.5, 3, P, { noise: 0.4 }); S(8, 6.5, 2.8, P, { noise: 0.4 }); for (const [x, y] of [[5, 8], [9, 8], [7, 11], [7, 5]]) px(x, y, C(P[3], 1.15).map((v) => Math.min(255, v))); L(8, 4, 11, 1, Q[2], 2); break;
      case 'grappe': L(8, 1, 8, 8, '#5a7a3a'); L(8, 3, 4, 6, '#5a7a3a'); for (const [x, y, r] of [[8, 9, 1.8], [6.5, 11.5, 1.8], [9.5, 12, 1.8], [8, 14.2, 1.7], [4, 7.5, 1.6], [5, 10, 1.5]]) S(x, y, r, P); px(8, 8, C(P[3], 1.2).map((v) => Math.min(255, v))); break;
      case 'raisin': for (const [x, y] of [[5, 5], [8, 5], [11, 5], [6.5, 8], [9.5, 8], [4, 8], [12, 8], [8, 11], [5.5, 11], [10.5, 11], [8, 14]]) S(x, y, 1.8, P); L(9, 1, 8, 3, '#6a5a3a'); S(4, 2.5, 2.2, rampOf('#4a8a3a')); break;
      case 'herbe': L(8, 15, 8, 4, C(P[1], 0.85)); for (const y of [5, 8, 11]) { S(5.5, y, 1.9, P, { sq: 0.6 }); S(10.5, y - 1, 1.9, P, { sq: 0.6 }); } S(8, 3.5, 1.6, P); break;
      case 'fleur': L(8, 10, 8, 15, '#4a8a3a'); L(8, 13, 11, 11, '#4a8a3a'); for (let k = 0; k < 8; k++) S(8 + Math.cos(k * 0.785) * 3.5, 6.5 + Math.sin(k * 0.785) * 3.5, 1.8, P); S(8, 6.5, 1.8, Q); break;
      case 'tulipe': L(8, 10, 8, 15, '#4a8a3a'); L(8, 14, 5, 9, '#5a9a3a', 2); S(8, 6, 3.8, P, { sq: 1.2 }); L(8, 2, 8, 9, C(P[1], 0.9)); px(6, 2, C(P[3], 1.1)); px(10, 2, C(P[3], 1.1)); break;
      case 'rose': L(8, 10, 8, 15, '#3a6a2a'); S(10.5, 12, 1.8, rampOf('#4a8a3a'), { sq: 0.7 }); px(7, 12, [200, 190, 150]); S(8, 6, 4.5, P); L(6, 5, 9, 4, C(P[0], 0.8)); L(9, 4, 10, 7, C(P[0], 0.8)); L(10, 7, 7, 8, C(P[0], 0.8)); break;
      case 'lavande': for (const [x, y] of [[5, 6], [8, 4], [11, 6]]) { L(x, 15, x, y + 3, Q[2]); S(x, y + 1.5, 1.3, P, { sq: 2.2, noise: 0.5 }); } break;
      case 'dahlia': L(8, 12, 8, 15, '#3a7a2a'); S(8, 7, 5, P); S(8, 7, 3, rampOf(C(P[3], 1.1).map((v) => Math.min(255, v)))); for (let k = 0; k < 10; k++) px(8 + Math.cos(k * 0.63) * 4, 7 + Math.sin(k * 0.63) * 4, C(P[1], 0.85)); break;
      case 'belladone': L(8, 1, 8, 6, stem); S(4, 4, 2.2, rampOf('#4a7a3a'), { sq: 0.6 }); for (const [x, y] of [[6, 10], [10, 9], [8, 13]]) { S(x, y, 2.6, P); px(x - 1, y - 1, [210, 210, 230]); } for (const [x, y] of [[6, 7], [10, 6]]) { L(x - 1, y, x + 1, y, G[2]); px(x, y - 1, G[2]); } break;
      case 'bouquet':
        L(6, 9, 8, 15, '#4a8a3a'); L(9, 8, 8, 15, '#3e7a2e'); L(11, 9, 8, 15, '#4a8a3a');
        S(5, 5.5, 2.4, rampOf('#e05070')); S(9, 4, 2.4, rampOf('#f0d040')); S(11.5, 7, 2.2, rampOf('#9a70d0')); S(7, 8, 2.1, rampOf('#f4f0ec'));
        R(7, 12, 9, 13, [232, 220, 192]); break;
      case 'selle':
        R(3, 7, 12, 9, (x, y) => rampPick(P, 0.85 - (y - 7) * 0.15, x, y)); R(11, 4, 12, 7, P[1]); R(3, 5, 4, 7, P[2]);
        L(5, 6, 10, 6, C(P[1], 0.9)); L(7, 10, 7, 12, [150, 150, 158]); R(6, 13, 8, 14, [150, 150, 158]); L(4, 10, 11, 10, Q[1]); break;
      case 'plan': {
        const paper = rampOf('#e8dcc0');
        R(2, 3, 14, 13, (x, y) => rampPick(paper, 0.8 - (x - 2) * 0.02 + (y === 3 ? 0.1 : 0), x, y)); R(1, 2, 2, 14, paper[1]);
        const roof = hexc(c1 || '#8a3a2a');
        L(5, 8, 8, 5, roof); L(8, 5, 11, 8, roof); L(5, 8, 11, 8, roof);
        R(6, 9, 10, 11, C(roof, 0.55).map((v) => v + 90)); px(8, 11, C(roof, 0.6)); px(8, 10, C(roof, 0.6));
        L(4, 12, 12, 12, [120, 110, 90]); break;
      }
      default: S(8, 8, 5, P);
    }
    edgeDarken(pb, 0.85);
    return pb;
  };
}
