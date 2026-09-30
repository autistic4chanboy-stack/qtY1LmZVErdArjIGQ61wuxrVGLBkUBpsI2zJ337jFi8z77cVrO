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

// ---------------------------------------------------------------- les plantes nouvelles (billboards pixelisés)
function spriteNature(kind, seed) {
  const rnd = mulberry32(seed);
  const TAILLE = {
    paquerette: [22, 10], oseille: [22, 26], plantain: [24, 16], barbe_bouc: [22, 34], cardamine: [22, 24], verveine: [22, 32], mouron: [22, 8],
    bouillon_blanc: [18, 44], armoise: [26, 38], coprin: [16, 20], jusquiame: [24, 30], datura: [26, 32], chelidoine: [24, 26], rue: [22, 24],
    anemone: [24, 14], pervenche: [24, 10], sceau_salomon: [28, 26], parisette: [18, 20], oxalis: [22, 8], asperule: [22, 14], fraisier_bois: [22, 10],
    ronce: [32, 26], mousse: [22, 8], usnee: [18, 18], herbe_egaree: [20, 20], pied_mouton: [18, 14], coulemelle: [24, 36], bolet_satan: [18, 16],
    vesse_loup: [16, 10], phalloide: [16, 18], populage: [24, 14], salicaire: [22, 36], massette: [20, 48], menyanthe: [22, 16], sphaigne: [24, 8],
    consoude: [26, 28], genet: [30, 40], pulsatille: [18, 14], euphraise: [22, 10], absinthe: [24, 24], soldanelle: [18, 10], saxifrage: [22, 8],
    nigritelle: [14, 16], ancolie: [22, 28], airelle: [22, 12], chardon_bleu: [22, 30],
  }[kind] || [22, 22];
  const [W, H] = TAILLE, pb = new PixelBuf(W, H);
  const px = (x, y, c, a) => pb.set(Math.round(x), Math.round(y), c, a);
  const V = [[40, 100, 40], [52, 118, 46], [66, 136, 54], [84, 150, 64]]; // verts
  const vert = (k) => V[Math.max(0, Math.min(3, k | 0))];
  const tige = (x, top, lean = 0, col) => drawLine(pb, x + lean, top, x, H - 1, col || PAL.stem[1 + ((rnd() * 2) | 0)]);
  const feuilles = (n, col, y0, h = 3) => { for (let i = 0; i < n; i++) { const x = 1 + rnd() * (W - 2), y = (y0 ?? H - 4) + rnd() * h; px(x, y, col); px(x + 1, y, col.map((v) => v * 0.82)); px(x, y - 1, col.map((v) => Math.min(255, v * 1.12))); } };
  const tapis = (y0, fn) => { for (let x = 1; x < W - 1; x++) for (let y = y0; y < H; y++) { const c = fn(x, y); if (c) px(x, y, c); } };
  const fleur = (x, y, r, col, coeur, n = 6) => { for (let a = 0; a < n; a++) { const t = a / n * TAU + rnd() * 0.3; px(x + Math.cos(t) * r, y + Math.sin(t) * r * 0.8, col); } if (coeur) px(x, y, coeur); };
  const cloche = (x, y, col, h = 2) => { for (let k = 0; k < h; k++) { px(x, y + k, col); px(x + 1, y + k, col.map((v) => v * 0.8)); } px(x - 1, y + h, col.map((v) => v * 0.9)); px(x + 2, y + h, col.map((v) => v * 0.75)); };
  const epi = (x, top, len, c1, c2) => { for (let k = 0; k < len; k++) { px(x + (k % 2 ? 1 : 0), top + k, k % 3 ? c1 : c2); if (k % 2 === 0) px(x - 1, top + k, c2); } };
  const chapeau = (x, y, r, c1, c2, pied, hPied) => { // champignon
    for (let yy = y; yy < Math.min(H, y + (hPied || H)); yy++) { px(x, yy, pied); px(x + 1, yy, pied.map((v) => v * 0.85)); }
    for (let dy = 0; dy <= r * 0.8; dy++) for (let dx = -r; dx <= r; dx++) if (dx * dx / (r * r) + dy * dy / (r * r * 0.64) <= 1) px(x + dx + 0.5, y - dy + r * 0.3, dy < 1 ? c2 : c1);
  };
  switch (kind) {
    // ---- prés, chemins
    case 'paquerette': feuilles(8, vert(1), H - 3, 2); for (let i = 0; i < 6; i++) { const x = 2 + i * 3.3 + rnd(), y = H - 4 - rnd() * 3; tige(x, y); fleur(x, y, 1.2, [250, 250, 244], [240, 190, 40], 7); } break;
    case 'oseille': for (let i = 0; i < 7; i++) { const x = 2 + rnd() * (W - 4), top = H - 6 - rnd() * 6; drawLine(pb, x, top, x + (rnd() - 0.5) * 3, H - 1, vert(2)); px(x, top, vert(3)); px(x + 1, top + 1, vert(2)); }
      for (let i = 0; i < 3; i++) { const x = 4 + i * 6 + rnd() * 2, top = 2 + rnd() * 5; tige(x, top); for (let k = 0; k < 8; k += 2) px(x + (k % 4 ? 1 : -1), top + k, [150, 60, 40]); } break;
    case 'plantain': for (let i = 0; i < 6; i++) { const a = -0.9 + i * 0.36; for (let r = 0; r < 8; r++) { const x = W / 2 + Math.sin(a) * r * 1.3, y = H - 1 - r * 0.5; px(x, y, vert(r > 5 ? 3 : 2)); if (r % 3 === 1) px(x, y - 1, vert(1)); } }
      for (let i = 0; i < 3; i++) { const x = 6 + i * 6, top = 1 + rnd() * 3; drawLine(pb, x, top + 3, x, H - 3, [110, 120, 70]); for (let k = 0; k < 4; k++) px(x, top + k, [90, 70, 50]); } break;
    case 'barbe_bouc': { feuilles(6, vert(1), H - 6, 4); tige(7, 10, 1); fleur(8, 10, 2, [250, 210, 50], [220, 170, 30], 10); tige(15, 6, -1);
      for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) if (dx * dx + dy * dy <= 16 && rnd() < 0.8) px(15 + dx, 6 + dy, dx * dx + dy * dy > 9 ? [200, 200, 196] : [230, 230, 226]); break; }
    case 'cardamine': for (let i = 0; i < 4; i++) { const x = 3 + i * 5 + rnd(), top = 3 + rnd() * 7; tige(x, top); for (let k = 0; k < 4; k++) { const fx = x + (rnd() - 0.5) * 4, fy = top + rnd() * 3; px(fx, fy, [236, 222, 246]); px(fx + 1, fy, [214, 196, 232]); } } feuilles(5, vert(2), H - 4, 2); break;
    case 'verveine': for (let i = 0; i < 5; i++) { let x = 3 + i * 4 + rnd(), y = H - 1; const top = 2 + rnd() * 8; drawLine(pb, x, top, x, y, [80, 110, 60]); drawLine(pb, x, top + 6, x + 3, top + 3, [80, 110, 60]); for (const [bx, by] of [[x, top], [x + 3, top + 3]]) for (let k = 0; k < 3; k++) px(bx + (k % 2), by - k, [190, 160, 220]); } break;
    case 'mouron': tapis(H - 4, (x, y) => (rnd() < 0.5 ? vert(1 + (rnd() * 2) | 0) : null)); for (let i = 0; i < 9; i++) px(1 + rnd() * (W - 2), H - 3 - rnd() * 2, rnd() < 0.7 ? [230, 90, 40] : [120, 40, 70]); break;
    case 'bouillon_blanc': { // grandes feuilles laineuses au pied, et la chandelle
      const lai = ramp(['#7a8470', '#98a28c', '#b4bca8', '#ccd2c0']);
      for (const [cx, cy, r] of [[5, H - 3, 3.4], [W - 6, H - 3, 3.2], [W / 2, H - 5, 3]]) drawSphere(pb, cx, cy, r, lai, seed + cx, { sq: 0.55, noise: 0.35 });
      for (let y = 3; y < H - 6; y++) { const w = y < H - 18 ? 1.4 : 0.8; for (let dx = -w; dx <= w; dx++) px(W / 2 + dx, y, rampPick(lai, 0.8 - dx * 0.1, dx, y)); if (y < H - 16 && rnd() < 0.7) px(W / 2 + (rnd() < 0.5 ? -2 : 2), y, rnd() < 0.8 ? [248, 214, 60] : [230, 190, 40]); }
      break;
    }
    case 'armoise': { // touffes irrégulières, vert sombre et argent
      for (let i = 0; i < 6; i++) { const x = 2 + rnd() * (W - 4), top = 2 + rnd() * 10; drawLine(pb, x, top, x + (rnd() - 0.5) * 3, H - 1, [110, 86, 74]); }
      const bsh = []; for (let k = 0; k < 7; k++) bsh.push({ x: 3 + rnd() * (W - 6), y: 8 + rnd() * (H - 14), r: 2.5 + rnd() * 2.5 });
      drawCanopy(pb, bsh, ramp(['#23361f', '#34482c', '#4a5e40', '#8a9486']), seed, { noise: 0.6, bottomDark: 0.2, holes: 1.4 });
      specks(pb, rnd, 26, [[190, 196, 186], [170, 176, 168]], 1, 6, W - 1, H - 2); specks(pb, rnd, 10, [[150, 120, 90]], 1, 2, W - 1, 12);
      break;
    }
    case 'coprin': for (let i = 0; i < 3; i++) { const x = 3 + i * 5, top = 2 + rnd() * 5, hc = 8 + rnd() * 3;
      for (let y = top; y < H; y++) { const cap = y < top + hc; const w = cap ? 2 - Math.abs(y - top - hc * 0.45) / hc * 1.2 : 0.5; for (let dx = -w; dx <= w; dx++) px(x + dx, y, cap ? (y > top + hc - 2 ? [60, 55, 55] : ((y + dx) & 1) ? [236, 232, 222] : [214, 208, 196]) : [240, 236, 228]); } } break;
    // ---- décombres
    case 'jusquiame': { // larges feuilles poisseuses, fleurs couleur de vieux papier au cœur violet
      const gl = ramp(['#3a4a2e', '#4e6040', '#667a54', '#8a9a74']);
      for (let k = 0; k < 7; k++) drawSphere(pb, 3 + rnd() * (W - 6), 10 + rnd() * (H - 13), 2.4 + rnd() * 1.6, gl, seed + k, { sq: 0.6, noise: 0.4 });
      for (let k = 0; k < 4; k++) { const x = 4 + k * 5 + rnd() * 2, top = 2 + rnd() * 6; tige(x, top, 0, [90, 110, 70]); fleur(x, top, 1.5, [226, 214, 160], [70, 30, 60], 7); px(x + 1, top + 1, [110, 50, 90]); px(x, top + 1, [140, 90, 120]); }
      break;
    }
    case 'datura': feuilles(10, vert(1), H - 10, 8); for (let k = 0; k < 3; k++) { const x = 5 + k * 7 + rnd(), top = 3 + rnd() * 6; tige(x, top + 4);
      if (k === 1) { for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (dx * dx + dy * dy <= 5) px(x + dx, top + 2 + dy, (dx + dy) & 1 ? [90, 130, 60] : [60, 100, 40]); for (const [dx, dy] of [[-3, 0], [3, 1], [0, -3], [1, 4]]) px(x + dx, top + 2 + dy, [210, 220, 190]); }
      else for (let t = 0; t < 6; t++) { const w = t < 3 ? 0 : t - 2; for (let dx = -w; dx <= w; dx++) px(x + dx, top + t, [246, 246, 240]); } } break;
    case 'chelidoine': for (let k = 0; k < 4; k++) { const x = 3 + k * 5 + rnd() * 2, top = 3 + rnd() * 7; tige(x, top, (rnd() - 0.5) * 2, [110, 140, 90]); for (const [dx, dy] of [[0, 0], [3, 2]]) { px(x + dx, top + dy, [248, 206, 30]); px(x + dx + 1, top + dy, [236, 190, 20]); px(x + dx, top + dy - 1, [250, 220, 60]); } }
      feuilles(10, [110, 150, 110], H - 9, 7); break;
    case 'rue': for (let i = 0; i < 16; i++) { const x = 2 + rnd() * (W - 4), y = 6 + rnd() * (H - 7); px(x, y, [130, 160, 160]); px(x + 1, y, [110, 140, 142]); px(x, y + 1, [100, 128, 130]); } for (let i = 0; i < 6; i++) px(3 + rnd() * (W - 6), 3 + rnd() * 5, [236, 210, 70]); drawLine(pb, W / 2, 5, W / 2, H - 1, [100, 120, 110]); break;
    // ---- sous-bois
    case 'anemone': feuilles(8, vert(1), H - 4, 3); for (let i = 0; i < 6; i++) { const x = 2 + i * 3.6 + rnd(), top = 3 + rnd() * 5; tige(x, top); fleur(x, top, 1.4, rnd() < 0.3 ? [246, 226, 236] : [250, 250, 246], [240, 200, 60], 6); } break;
    case 'pervenche': tapis(H - 4, (x, y) => (rnd() < 0.45 ? (rnd() < 0.5 ? [40, 90, 40] : [60, 110, 50]) : null)); for (let i = 0; i < 5; i++) { const x = 2 + rnd() * (W - 4), y = H - 5 - rnd() * 2; fleur(x, y, 1.1, [100, 110, 220], [240, 240, 250], 5); } break;
    case 'sceau_salomon': for (let k = 0; k < 3; k++) { // une tige qui monte puis s'arque ; dessous, les clochettes par deux
      const x0 = 2 + k * 8 + rnd() * 2, hmax = 16 + rnd() * 6; let x = x0, y = H - 1;
      for (let t = 1; t <= 20; t++) {
        const u = t / 20, nx = x0 + u * 11, ny = H - 1 - hmax * Math.sin(u * Math.PI * 0.85);
        drawLine(pb, x, y, nx, ny, [70, 120, 60]);
        if (u > 0.3 && t % 3 === 0) { px(nx - 1, ny - 1, vert(3)); px(nx, ny - 1, vert(2)); px(nx + 1, ny - 1, vert(3)); cloche(nx, ny + 1, [240, 242, 228], 2); px(nx, ny + 3, [120, 170, 110]); }
        x = nx; y = ny;
      }
    } break;
    case 'parisette': { drawLine(pb, W / 2, 7, W / 2, H - 1, [90, 130, 70]); for (const [dx, dy] of [[-6, 1], [6, 1], [-3, -1], [3, 3]]) drawLine(pb, W / 2, 9, W / 2 + dx, 9 + dy, vert(3), 2);
      drawSphere(pb, W / 2, 4, 2.4, ramp(['#0a0a1a', '#1a1a3a', '#303060', '#6a6aa0']), seed); px(W / 2 - 1, 3, [180, 180, 220]); break; }
    case 'oxalis': for (let i = 0; i < 8; i++) { const x = 2 + rnd() * (W - 4), y = H - 3 - rnd() * 3; for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1]]) px(x + dx, y + dy, [110, 180, 90]); drawLine(pb, x, y + 1, x, H - 1, [90, 140, 70]); } for (let i = 0; i < 3; i++) fleur(3 + rnd() * (W - 6), H - 6 - rnd() * 1, 0.8, [250, 246, 246], [220, 170, 190], 5); break;
    case 'asperule': for (let i = 0; i < 6; i++) { // des étoiles de feuilles étagées, un nuage de fleurs blanches
      const x = 2 + rnd() * (W - 4), top = 2 + rnd() * 5; tige(x, top);
      for (let y = top + 3 + rnd() * 2; y < H - 1; y += 3 + rnd() * 2) for (let a = 0; a < 6; a++) px(x + Math.cos(a * 1.05 + y) * 2, y + Math.sin(a * 1.05 + y) * 0.6, vert(a % 2 ? 3 : 2));
      for (let k = 0; k < 4; k++) px(x + (rnd() - 0.5) * 3, top + rnd() * 2, [250, 250, 246]);
    } break;
    case 'fraisier_bois': for (let i = 0; i < 6; i++) { const x = 2 + rnd() * (W - 4), y = H - 3 - rnd() * 3; for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [-1, -1], [1, -1]]) px(x + dx, y + dy, vert(2)); drawLine(pb, x, y + 1, x, H - 1, vert(1)); }
      for (let i = 0; i < 4; i++) { const x = 3 + rnd() * (W - 6), y = H - 3 - rnd() * 3; px(x, y, [220, 30, 40]); px(x, y + 1, [180, 20, 30]); } fleur(5 + rnd() * 10, H - 6, 0.9, [250, 250, 244], [240, 200, 60], 5); break;
    case 'ronce': { const bsh = []; for (let k = 0; k < 6; k++) bsh.push({ x: 5 + rnd() * (W - 10), y: 8 + rnd() * (H - 14), r: 4.5 + rnd() * 3 }); drawCanopy(pb, bsh, ramp(['#18300e', '#244416', '#30581e', '#3c6a26']), seed, { noise: 0.45, bottomDark: 0.35 });
      for (let k = 0; k < 4; k++) { const x0 = 3 + rnd() * (W - 6); drawLine(pb, x0, H - 1, x0 + (rnd() - 0.5) * 12, 3 + rnd() * 8, [110, 60, 60]); }
      specks(pb, rnd, 12, [[30, 16, 36], [40, 20, 50]], 3, 4, W - 3, H - 6); specks(pb, rnd, 6, [[190, 30, 40]], 3, 4, W - 3, H - 6); break; }
    case 'mousse': tapis(H - 5, (x, y) => { const k = Math.sin(x * 0.9) * 1.2 + (H - 1 - y); return k < 3.4 && rnd() < 0.85 ? vert(1 + ((x * 7 + y * 3) % 3)) : null; }); break;
    case 'usnee': for (let i = 0; i < 9; i++) { let x = 4 + rnd() * (W - 8), y = H - 1 - rnd() * 4; for (let k = 0; k < 10; k++) { px(x, y, rnd() < 0.5 ? [170, 186, 150] : [140, 156, 124]); x += (rnd() - 0.5) * 2; y -= rnd() < 0.7 ? 1 : 0; } } break;
    case 'herbe_egaree': for (let i = 0; i < 16; i++) { const x0 = 4 + rnd() * (W - 8), top = 1 + rnd() * 8; drawLine(pb, x0 + (rnd() - 0.5) * 5, top, x0, H - 1, rnd() < 0.5 ? [70, 170, 70] : [90, 186, 80]); } break;
    // ---- champignons
    case 'pied_mouton': for (let i = 0; i < 3; i++) { const x = 3 + i * 5.5, y = H - 7 - rnd() * 3; chapeau(x, y, 2.6 + rnd(), [226, 196, 150], [240, 214, 170], [236, 224, 200]); px(x - 1, y + 1, [200, 170, 120]); } break;
    case 'coulemelle': { const x = W / 2; for (let y = 8; y < H; y++) { px(x, y, (y & 3) ? [210, 196, 170] : [150, 120, 90]); px(x + 1, y, [190, 176, 150]); } px(x - 1, 16, [240, 236, 226]); px(x + 2, 16, [220, 214, 200]);
      for (let dx = -10; dx <= 10; dx++) { const h = Math.round(4 - Math.abs(dx) * 0.35); for (let y = 7 - h; y <= 7; y++) px(x + dx, y, (dx * 3 + y * 5) % 7 === 0 ? [110, 80, 60] : [214, 196, 168]); } px(x, 2, [110, 80, 60]); px(x + 1, 2, [110, 80, 60]); break; }
    case 'bolet_satan': chapeau(8, 7, 6, [214, 210, 196], [230, 226, 214], [200, 40, 40], 9); for (let y = 9; y < H; y++) { px(7, y, [210, 50, 40]); px(10, y, [180, 40, 36]); } for (let x = 4; x < 13; x++) px(x, 8, [220, 60, 40]); break;
    case 'vesse_loup': for (const [x, r] of [[5, 3], [11, 2.4]]) { drawSphere(pb, x, H - r - 0.5, r, ramp(['#b8b0a0', '#dcd6c8', '#f0ece2', '#fcfaf4']), seed + x, { noise: 0.2 }); px(x - 1, H - r - 1, [200, 192, 176]); } break;
    case 'phalloide': chapeau(8, 7, 5, [206, 214, 182], [222, 228, 200], [244, 244, 236], 11); px(7, 11, [236, 236, 226]); px(10, 11, [236, 236, 226]); for (let x = 6; x < 12; x++) px(x, H - 1, [236, 232, 220]); px(5, H - 2, [220, 216, 204]); px(11, H - 2, [220, 216, 204]); break;
    // ---- eaux
    case 'populage': for (let i = 0; i < 6; i++) { const x = 2 + rnd() * (W - 4), y = H - 3 - rnd() * 2; drawSphere(pb, x, y, 1.8, ramp(['#1e4a18', '#2e6a24', '#4a8a34', '#6aa84a']), seed + i, { sq: 0.7 }); }
      for (let i = 0; i < 4; i++) { const x = 3 + i * 5.5 + rnd(), top = 2 + rnd() * 4; tige(x, top); fleur(x, top, 1.6, [250, 214, 30], [210, 150, 20], 6); px(x, top, [250, 230, 90]); } break;
    case 'salicaire': for (let i = 0; i < 4; i++) { const x = 3 + i * 5 + rnd(), top = 2 + rnd() * 8; tige(x, top + 8); epi(x, top, 12, [200, 60, 150], [160, 40, 120]); } feuilles(6, vert(1), H - 10, 8); break;
    case 'massette': for (let i = 0; i < 10; i++) { const x0 = 2 + rnd() * (W - 4); drawLine(pb, x0 + (rnd() - 0.5) * 4, 6 + rnd() * 10, x0, H - 1, vert(1 + (i % 3))); }
      for (let i = 0; i < 3; i++) { const x = 5 + i * 5, top = 2 + rnd() * 6; drawLine(pb, x, top, x, H - 1, [110, 130, 80]); for (let k = 3; k < 11; k++) { px(x, top + k, [110, 70, 40]); px(x + 1, top + k, [90, 56, 32]); } } break;
    case 'menyanthe': for (let i = 0; i < 5; i++) { const x = 2 + rnd() * (W - 4), y = H - 3 - rnd() * 2; for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1]]) { px(x + dx * 1.5, y + dy, vert(2)); px(x + dx * 1.5 + 1, y + dy, vert(1)); } }
      for (let i = 0; i < 3; i++) { const x = 4 + i * 6 + rnd(), top = 2 + rnd() * 3; tige(x, top); for (let k = 0; k < 5; k++) { const fx = x + (rnd() - 0.5) * 4, fy = top + rnd() * 4; px(fx, fy, [250, 238, 240]); if (rnd() < 0.4) px(fx + 1, fy, [230, 170, 190]); } } break;
    case 'sphaigne': tapis(H - 5, (x, y) => (rnd() < 0.8 ? (rnd() < 0.25 ? [170, 110, 90] : rnd() < 0.6 ? [150, 186, 110] : [120, 160, 90]) : null)); break;
    case 'consoude': for (let i = 0; i < 6; i++) { const x = 3 + rnd() * (W - 6), y = H - 4 - rnd() * 8; for (let k = 0; k < 4; k++) { px(x + k - 2, y + (k % 2), [70, 110, 60]); px(x + k - 2, y + 1, [56, 94, 48]); } drawLine(pb, x, y + 1, x, H - 1, [70, 100, 60]); }
      for (let i = 0; i < 3; i++) { const x = 5 + i * 7 + rnd(), top = 2 + rnd() * 5; tige(x, top); for (let k = 0; k < 3; k++) cloche(x + 1 + k, top + k * 2, [150, 90, 170], 2); } break;
    // ---- lande
    case 'genet': for (let i = 0; i < 14; i++) { const x0 = W / 2 + (rnd() - 0.5) * 8, top = 2 + rnd() * 16; drawLine(pb, x0 + (rnd() - 0.5) * 20, top, x0, H - 1, rnd() < 0.5 ? [60, 110, 40] : [80, 130, 50]); }
      specks(pb, rnd, 60, [[250, 214, 30], [240, 196, 20], [250, 230, 80]], 1, 1, W - 1, H - 8); break;
    case 'pulsatille': for (let i = 0; i < 3; i++) { const x = 4 + i * 5 + rnd(), top = 3 + rnd() * 4; drawLine(pb, x, top + 2, x, H - 1, [180, 186, 176]); for (let k = 0; k < 3; k++) { px(x - 1 + k, top + k, [120, 70, 170]); px(x - 1 + k, top + k + 1, [100, 56, 150]); } px(x + 1, top + 3, [240, 200, 40]); } feuilles(5, [150, 170, 140], H - 3, 2); break;
    case 'euphraise': feuilles(8, vert(1), H - 4, 3); for (let i = 0; i < 8; i++) { const x = 2 + rnd() * (W - 4), y = H - 4 - rnd() * 3; px(x, y, [250, 250, 246]); px(x + 1, y, [200, 160, 230]); px(x, y + 1, [240, 200, 50]); } break;
    case 'absinthe': { // un buisson d'argent, plumeux
      const bsh = []; for (let k = 0; k < 8; k++) bsh.push({ x: 3 + rnd() * (W - 6), y: 6 + rnd() * (H - 10), r: 2.5 + rnd() * 2.8 });
      drawCanopy(pb, bsh, ramp(['#6a7466', '#8a9486', '#aab2a4', '#ccd2c6']), seed, { noise: 0.7, bottomDark: 0.25, holes: 1.5 });
      specks(pb, rnd, 14, [[220, 200, 90], [200, 180, 80]], 2, 2, W - 2, 10); for (let i = 0; i < 4; i++) drawLine(pb, 5 + rnd() * (W - 10), H - 6, 5 + rnd() * (W - 10), H - 1, [120, 130, 110]);
      break;
    }
    // ---- hauteurs
    case 'soldanelle': for (let x = 1; x < W - 1; x++) if (rnd() < 0.7) px(x, H - 1, [240, 244, 250]); for (let i = 0; i < 4; i++) { const x = 3 + i * 4 + rnd(), top = 1 + rnd() * 3; tige(x, top + 2); cloche(x, top, [170, 130, 230], 3); px(x - 1, top + 3, [210, 180, 250]); px(x + 2, top + 3, [210, 180, 250]); } break;
    case 'saxifrage': for (let i = 0; i < 5; i++) { const cx = 3 + i * 4, cy = H - 2; for (let a = 0; a < 8; a++) px(cx + Math.cos(a * 0.8) * 1.6, cy + Math.sin(a * 0.8) * 0.8, vert(2)); px(cx, cy, vert(1)); } for (let i = 0; i < 5; i++) { const x = 2 + rnd() * (W - 4), y = H - 5 - rnd() * 2; fleur(x, y, 0.9, [250, 250, 244], [220, 60, 50], 5); } break;
    case 'nigritelle': for (let i = 0; i < 5; i++) drawLine(pb, 3 + rnd() * 8, H - 1, 3 + rnd() * 8, H - 6, vert(1)); drawLine(pb, W / 2, 5, W / 2, H - 1, [70, 100, 50]);
      for (let y = 1; y < 7; y++) for (let dx = -1; dx <= 1; dx++) px(W / 2 + dx, y, (dx + y) & 1 ? [90, 16, 30] : [60, 10, 20]); break;
    case 'ancolie': feuilles(8, [80, 120, 110], H - 8, 6); for (let i = 0; i < 3; i++) { const x = 4 + i * 7 + rnd(), top = 3 + rnd() * 6; tige(x, top - 1, 1); for (let k = 0; k < 3; k++) { px(x - 1 + k, top + 2, [70, 100, 220]); px(x - 1 + k, top + 3, [50, 80, 200]); } px(x, top + 1, [240, 240, 250]); px(x - 2, top, [60, 90, 210]); px(x + 2, top, [60, 90, 210]); } break;
    case 'airelle': { const bsh = []; for (let k = 0; k < 4; k++) bsh.push({ x: 4 + rnd() * (W - 8), y: 5 + rnd() * 4, r: 3.5 + rnd() * 1.5 }); drawCanopy(pb, bsh, ramp(['#16361a', '#1e4a22', '#2a5e2c']), seed, { noise: 0.4 }); specks(pb, rnd, 9, [[210, 30, 40], [180, 20, 30]], 2, 2, W - 2, H - 2); break; }
    case 'chardon_bleu': { const x = W / 2; drawLine(pb, x, 8, x, H - 1, [110, 140, 190], 2); for (let y = 12; y < H - 2; y += 4) { drawLine(pb, x, y, x - 5, y - 2, [130, 160, 210]); drawLine(pb, x + 1, y + 1, x + 6, y - 1, [110, 140, 190]); }
      for (let a = 0; a < 12; a++) { const t = a / 12 * TAU; drawLine(pb, x, 6, x + Math.cos(t) * 6, 6 + Math.sin(t) * 3.2, [150, 180, 230]); } drawSphere(pb, x + 0.5, 4, 2.6, ramp(['#2a3a80', '#4060b0', '#6a90d8', '#a0c0f0']), seed, { sq: 1.3 }); break; }
    default: tige(W / 2, 4); px(W / 2, 4, [240, 240, 240]);
  }
  if (kind !== 'mousse' && kind !== 'sphaigne' && kind !== 'mouron') edgeDarken(pb, 0.8);
  return pb;
}
{
  const _afs = addFarmSprites;
  addFarmSprites = function (add) {
    _afs(add);
    if (typeof NAT_PLANTES !== 'undefined') NAT_PLANTES.forEach((P, i) => add('w4_' + P.o, spriteNature(P.o, 7311 + i * 29)));
  };
}
