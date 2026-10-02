// ============================================================================
//  CINQUANTE PLANTES NOUVELLES (agent D1) : sprites du décor (« d1_<id> ») et
//  icônes nouvelles (formes « d1_… » : ombelle, tête hérissée, langue-de-
//  serpent, homme-pendu, fougère, genièvre, cheveux du diable, lunaire, bulbe
//  en filet). Données : 05-zzzzzD1-plantes.js ; jeu : 11-zzzzD1-plantes.js.
// ============================================================================
{
  const _ip = iconPaint;
  iconPaint = function (shape, c1, c2) {
    if (typeof shape !== 'string' || !shape.startsWith('d1_')) return _ip(shape, c1, c2);
    const kind = shape.slice(3);
    const pb = new PixelBuf(16, 16), P = rampOf(c1 || '#aaaaaa'), Q = rampOf(c2 || '#4a9a3a');
    const S = (cx, cy, r, pal, o) => drawSphere(pb, cx, cy, r, pal || P, (cx * 7 + cy * 3) | 0, o || {});
    const L = (x0, y0, x1, y1, c, w) => drawLine(pb, x0, y0, x1, y1, typeof c === 'string' ? hexc(c) : c, w || 1);
    const px = (x, y, c) => pb.set(x, y, typeof c === 'string' ? hexc(c) : c);
    switch (kind) {
      case 'ombelle': // une tige, des rayons, une ombelle plate de fleurs (c1), la tige (c2)
        L(8, 15, 8, 7, Q[1], 2);
        for (let k = -3; k <= 3; k++) L(8, 7, 8 + k * 2, 3 + Math.abs(k) * 0.4, Q[2]);
        for (let x = 1; x <= 15; x++) for (let y = 1; y <= 4; y++) if (((x * 5 + y * 3) % 4) && Math.abs(x - 8) <= 7 - (y === 1 ? 2 : 0)) px(x, y + Math.abs(x - 8) * 0.15, P[2 + ((x + y) & 1)]);
        px(5, 10, Q[3]); px(4, 11, Q[2]); px(11, 11, Q[3]); px(12, 12, Q[2]);
        break;
      case 'capitule': // une tête ovale hérissée (c1) cerclée (c2), sur sa tige
        L(8, 15, 8, 10, [110, 130, 80], 2);
        S(8, 6, 4.2, P, { sq: 1.25, noise: 0.5 });
        for (const [x, y] of [[5, 3], [11, 3], [4, 7], [12, 7], [6, 10], [10, 10], [8, 1]]) px(x, y, C(P[0], 0.8));
        for (let x = 4; x <= 12; x++) px(x, 8, Q[(x & 1) + 1]);
        L(3, 12, 6, 9, [120, 140, 90]); L(13, 12, 10, 9, [120, 140, 90]);
        break;
      case 'langue': // une feuille unique (c1) et l'épi crénelé (c2)
        S(7, 10, 4, P, { sq: 1.5 }); L(7, 15, 7, 6, C(P[0], 0.85));
        for (let y = 1; y <= 8; y++) { px(9, y, Q[2]); px(10, y, (y & 1) ? Q[3] : Q[1]); }
        L(9, 9, 8, 15, Q[1]);
        break;
      case 'pendu': // un épi de petits hommes pendus (c1), bordés de brun (c2)
        L(8, 15, 8, 1, [120, 140, 80]);
        for (let k = 0; k < 4; k++) {
          const y = 2 + k * 3, x = (k & 1) ? 10 : 5;
          px(x, y, Q[2]); px(x, y + 1, P[2]); px(x - 1, y + 1, P[1]); px(x + 1, y + 1, P[1]); px(x, y + 2, P[3]); px(x - 1, y + 3, P[2]); px(x + 1, y + 3, P[2]);
          L(8, y, x, y, [120, 140, 80]);
        }
        break;
      case 'fougere': // une petite fougère : tiges (c2), folioles (c1)
        for (const [x0, a] of [[5, -0.5], [8, 0], [11, 0.5]]) {
          L(8, 15, x0 + a * 6, 2, Q[1]);
          for (let t = 0.2; t < 0.95; t += 0.16) { const x = lerp(8, x0 + a * 6, t), y = lerp(15, 2, t); S(x - 1.4, y, 1.1, P); S(x + 1.4, y + 0.5, 1.1, P); }
        }
        break;
      case 'genievre': // un rameau d'aiguilles (c2) et des baies poudrées (c1)
        L(2, 14, 13, 3, [110, 80, 50], 2);
        for (let t = 0; t <= 1; t += 0.1) { const x = lerp(2, 13, t), y = lerp(14, 3, t); L(x, y, x - 2, y - 2, Q[2]); L(x, y, x + 2, y + 1, Q[1]); }
        for (const [x, y] of [[6, 11], [9, 9], [11, 11], [7, 7], [12, 6]]) { S(x, y, 1.9, P); px(x - 1, y - 1, [170, 180, 200]); }
        break;
      case 'fils': // un écheveau de fils rouges (c1) et de petites boules blanches (c2)
        for (let k = 0; k < 7; k++) { let x = 2 + k * 2, y = 14; for (let i = 0; i < 14; i++) { px(x, y, P[1 + ((i + k) % 3)]); x += Math.sin(i * 1.3 + k) * 1.2; y -= 0.9; } }
        for (const [x, y] of [[5, 6], [10, 4], [8, 9], [12, 9]]) S(x, y, 1.3, Q);
        break;
      case 'lune': // une feuille en croissants (c1), l'épi doré (c2)
        L(6, 15, 6, 6, [110, 130, 80]);
        for (let k = 0; k < 4; k++) { const y = 6 + k * 2.2; for (const s of [-1, 1]) { S(6 + s * 2.6, y, 1.7, P, { sq: 0.7 }); px(6 + s * 3.5, y + 1, C(P[0], 0.8)); } }
        L(11, 15, 11, 7, [120, 130, 80]);
        for (let y = 1; y <= 7; y++) { px(10 + (y & 1), y, Q[2 + (y & 1)]); px(12 - (y & 1), y, Q[1]); }
        break;
      case 'bulbe': // le bulbe vêtu de tuniques en filet (c1), les feuilles (c2)
        S(8, 11, 4.6, P, { sq: 1.05 });
        for (let y = 7; y <= 15; y++) for (let x = 3; x <= 13; x++) if (pb.alpha(x, y) === 255 && ((x + y) % 3 === 0 || (x - y + 30) % 3 === 0)) px(x, y, C(P[0], 0.75));
        L(8, 7, 5, 0, Q[2], 2); L(8, 7, 11, 1, Q[1], 2); L(8, 7, 8, 2, Q[3]);
        break;
      default: S(8, 8, 5, P);
    }
    return pb;
  };
}

// ---------------------------------------------------------------- les plantes (billboards pixelisés)
function spriteD1(kind, seed, variante) {
  const rnd = mulberry32(seed);
  const TAILLE = {
    chicoree: [24, 40], gaillet_jaune: [24, 26], rhinanthe: [22, 22], berce: [32, 48], cardere: [24, 48], saponaire: [24, 26], tanaisie: [26, 36],
    ophioglosse: [14, 12], oeillet_superbe: [22, 22], homme_pendu: [16, 26],
    bon_henri: [22, 22], mouron_blanc: [22, 8], bourse_pasteur: [20, 22], bardane: [30, 34], pensee_champs: [20, 10], nielle: [22, 32], grande_cigue: [30, 48],
    bryone: [30, 30], ivraie: [22, 30], adonis: [20, 16],
    parietaire: [24, 20], cymbalaire: [24, 10], orpin_acre: [22, 8], capillaire: [18, 12], giroflee: [22, 26], bourrache: [26, 26], melisse: [24, 22],
    laitue_vireuse: [20, 44], ceterach: [18, 8], orobanche: [14, 22],
    genestrole: [24, 18], viperine: [20, 34], genevrier: [22, 48], polygala: [22, 8], petite_centauree: [20, 18], betoine: [20, 28], pied_chat: [22, 10],
    cuscute: [26, 10], immortelle: [20, 18], botryche: [12, 12],
    veratre: [26, 40], rumex_alpin: [30, 24], gentiane_jaune: [24, 44], dryade: [24, 8], carline: [22, 8], trolle: [20, 26], auricule: [18, 12],
    renoncule_glaciers: [18, 10], ail_victorial: [20, 26], nard_celtique: [16, 8],
  }[kind] || [22, 22];
  const [W, H] = TAILLE, pb = new PixelBuf(W, H);
  const px = (x, y, c, a) => pb.set(Math.round(x), Math.round(y), c, a);
  const V = [[40, 100, 40], [52, 118, 46], [66, 136, 54], [84, 150, 64]]; // verts
  const vert = (k) => V[Math.max(0, Math.min(3, k | 0))];
  const sombre = (c, k) => c.map((v) => v * k);
  const clair = (c, k) => c.map((v) => Math.min(255, v * k));
  const tige = (x, top, lean = 0, col) => drawLine(pb, x + lean, top, x, H - 1, col || PAL.stem[1 + ((rnd() * 2) | 0)]);
  const feuilles = (n, col, y0, h = 3) => { for (let i = 0; i < n; i++) { const x = 1 + rnd() * (W - 2), y = (y0 ?? H - 4) + rnd() * h; px(x, y, col); px(x + 1, y, sombre(col, 0.82)); px(x, y - 1, clair(col, 1.12)); } };
  const tapis = (y0, fn) => { for (let x = 1; x < W - 1; x++) for (let y = y0; y < H; y++) { const c = fn(x, y); if (c) px(x, y, c); } };
  const fleur = (x, y, r, col, coeur, n = 6) => { for (let a = 0; a < n; a++) { const t = a / n * TAU + rnd() * 0.3; px(x + Math.cos(t) * r, y + Math.sin(t) * r * 0.8, col); } if (coeur) px(x, y, coeur); };
  const etoile = (x, y, col, coeur) => { px(x, y, coeur || col); px(x - 1, y, col); px(x + 1, y, col); px(x, y - 1, col); px(x, y + 1, sombre(col, 0.85)); };
  const epi = (x, top, len, c1, c2) => { for (let k = 0; k < len; k++) { px(x + (k % 2 ? 1 : 0), top + k, k % 3 ? c1 : c2); if (k % 2 === 0) px(x - 1, top + k, c2); } };
  const feuille = (x0, y0, x1, y1, w, col) => { // une feuille en fuseau, de (x0, y0) à (x1, y1)
    const n = Math.max(2, Math.hypot(x1 - x0, y1 - y0) | 0);
    for (let i = 0; i <= n; i++) { const t = i / n, x = lerp(x0, x1, t), y = lerp(y0, y1, t), ww = Math.sin(t * Math.PI) * w; for (let k = -ww; k <= ww; k += 0.5) px(x + k * 0.3, y + k, k < 0 ? clair(col, 1.1) : col); }
  };
  const ombelle = (x, y, r, col, n) => { // une ombelle plate (rayons, puis les fleurs en dôme aplati)
    for (let k = 0; k < n; k++) { const t = (k / (n - 1) - 0.5) * 2; drawLine(pb, x, y + 2, x + t * r, y, [110, 130, 80]); }
    for (let dx = -r - 1; dx <= r + 1; dx++) for (let dy = -2; dy <= 0; dy++) if (rnd() < (dy === -2 ? 0.45 : 0.85) && Math.abs(dx) <= r + 1 - (dy === -2 ? 2 : 0)) px(x + dx, y + dy, rnd() < 0.2 ? sombre(col, 0.86) : col);
  };
  const roche = (n) => { for (let i = 0; i < n; i++) { const x = 2 + rnd() * (W - 4), r = 1.2 + rnd() * 1.6; drawSphere(pb, x, H - r * 0.6, r, PAL.rock, seed + i * 7, { sq: 0.6, noise: 0.3 }); } };
  switch (kind) {
    // ======================================================== les prés
    case 'chicoree': { // rosette de feuilles au pied, tiges raides et rameuses, fleurs bleu ciel le long des tiges
      feuilles(8, vert(2), H - 4, 3);
      for (let i = 0; i < 3; i++) {
        const x0 = 6 + i * 6 + rnd() * 2, top = 2 + rnd() * 8; drawLine(pb, x0 + (rnd() - 0.5) * 2, top, x0, H - 2, [96, 130, 84]);
        for (let y = top + 2; y < H - 8; y += 4 + rnd() * 3) {
          const s = rnd() < 0.5 ? -1 : 1, bx = x0 + s * (3 + rnd() * 3), by = y - 2 - rnd() * 2;
          drawLine(pb, x0, y, bx, by, [104, 136, 90]);
          if (rnd() < 0.85) fleur(bx, by, 1.2, [120, 160, 240], [70, 100, 200], 6);
        }
        fleur(x0, top, 1.3, [130, 170, 246], [70, 100, 200], 7);
      }
      break;
    }
    case 'gaillet_jaune': {
      for (let i = 0; i < 9; i++) { const x = 2 + rnd() * (W - 4), top = 3 + rnd() * 8; drawLine(pb, x + (rnd() - 0.5) * 3, top, x, H - 1, [86, 120, 60]); for (let y = top + 4; y < H - 2; y += 3) { px(x - 1, y, vert(2)); px(x + 1, y, vert(1)); } }
      for (let i = 0; i < 70; i++) { const x = 2 + rnd() * (W - 4), y = 1 + rnd() * 10 + Math.abs(x - W / 2) * 0.2; px(x, y, rnd() < 0.6 ? [246, 214, 40] : rnd() < 0.5 ? [226, 186, 30] : [252, 232, 90]); }
      break;
    }
    case 'rhinanthe': {
      feuilles(6, vert(1), H - 5, 4);
      for (let i = 0; i < 4; i++) {
        const x = 3 + i * 5 + rnd() * 1.5, top = 2 + rnd() * 5; tige(x, top, 0, [110, 120, 60]);
        for (let k = 0; k < 3; k++) { const y = top + k * 4; px(x + 1, y, [190, 196, 120]); px(x + 1, y + 1, [170, 178, 104]); px(x + 2, y + 1, [150, 160, 92]); px(x + 2, y, [246, 214, 40]); px(x + 3, y - 1, [240, 200, 30]); }
      }
      break;
    }
    case 'berce': { // grandes feuilles lobées au pied, tiges creuses, ombelles blanches
      const bsh = []; for (let k = 0; k < 5; k++) bsh.push({ x: 5 + rnd() * (W - 10), y: H - 9 + rnd() * 4, r: 3.5 + rnd() * 2.5 });
      drawCanopy(pb, bsh, ramp(['#2a4a1e', '#3a6028', '#4c7632', '#628c40']), seed, { noise: 0.5, bottomDark: 0.25, holes: 1.6 });
      for (let i = 0; i < 3; i++) {
        const x = 7 + i * 9 + (rnd() - 0.5) * 3, top = 4 + rnd() * 10;
        drawLine(pb, x, top + 2, x + (rnd() - 0.5) * 2, H - 4, [120, 130, 80]); drawLine(pb, x + 1, top + 4, x + 1, H - 6, [96, 106, 66]);
        if (rnd() < 0.6) px(x, top + 10, [120, 70, 80]);
        ombelle(x, top, 4 + rnd() * 1.5, [244, 242, 232], 7);
      }
      break;
    }
    case 'cardere': { // tige raide, coupes de feuilles, têtes ovales hérissées cerclées de mauve
      for (let i = 0; i < 2; i++) {
        const x = 7 + i * 10 + rnd() * 2, top = 3 + rnd() * 8;
        drawLine(pb, x, top + 6, x, H - 1, [120, 140, 84], 2);
        for (let y = top + 14; y < H - 3; y += 7) { feuille(x, y, x - 6, y - 4, 1.4, [96, 130, 70]); feuille(x + 1, y, x + 7, y - 4, 1.4, [86, 120, 62]); }
        for (let dy = 0; dy < 8; dy++) for (let dx = -2; dx <= 2; dx++) { if (Math.abs(dx) === 2 && (dy < 1 || dy > 6)) continue; px(x + dx, top + dy, ((dx + dy) & 1) ? [150, 140, 96] : [116, 120, 76]); }
        for (let dx = -3; dx <= 3; dx++) px(x + dx, top + 4, rnd() < 0.7 ? [180, 140, 210] : [150, 110, 190]);
        px(x, top - 1, [130, 130, 90]); drawLine(pb, x - 2, top + 8, x - 5, top + 3, [120, 140, 90]); drawLine(pb, x + 2, top + 8, x + 5, top + 4, [120, 140, 90]);
      }
      break;
    }
    case 'saponaire': {
      feuilles(8, vert(2), H - 9, 7);
      for (let i = 0; i < 5; i++) {
        const x = 3 + i * 4.5 + rnd(), top = 3 + rnd() * 6; tige(x, top + 2);
        for (let k = 0; k < 4; k++) { const fx = x + (rnd() - 0.5) * 5, fy = top + rnd() * 3; fleur(fx, fy, 1, [246, 206, 216], [230, 170, 186], 5); }
      }
      break;
    }
    case 'tanaisie': { // feuillage de fougère, corymbes de boutons jaunes plats
      for (let i = 0; i < 5; i++) {
        const x = 3 + i * 5 + rnd() * 2, top = 4 + rnd() * 6;
        drawLine(pb, x, top, x + (rnd() - 0.5) * 2, H - 1, [86, 110, 60]);
        for (let y = top + 5; y < H - 2; y += 3 + ((rnd() * 2) | 0)) {
          const s = rnd() < 0.5 ? -1 : 1;
          drawLine(pb, x, y, x + s * 4, y - 2, vert(2));
          px(x + s * 2, y - 2, vert(3)); px(x + s * 3, y, vert(1)); px(x + s * 4, y - 3, vert(3)); px(x + s, y - 2, vert(1));
        }
      }
      for (let k = 0; k < 4; k++) { const cx = 4 + k * 6 + rnd() * 2, cy = 3 + rnd() * 5; for (let j = 0; j < 7; j++) { const x = cx + (rnd() - 0.5) * 6, y = cy + rnd() * 1.6; px(x, y, [246, 200, 30]); px(x + 1, y, [226, 176, 20]); px(x, y - 1, [250, 220, 70]); } }
      break;
    }
    case 'ophioglosse': {
      for (let y = 4; y < H; y++) { const w = Math.sin((y - 3) / (H - 3) * Math.PI) * 3.2; for (let dx = -w; dx <= w; dx++) px(5 + dx, y, dx < 0 ? [96, 160, 70] : [74, 136, 56]); }
      drawLine(pb, 5, 4, 5, H - 1, [60, 110, 46]);
      drawLine(pb, 9, 0, 9, H - 1, [120, 140, 80]); for (let y = 0; y < 5; y++) { px(9, y, [200, 190, 100]); px(10, y, (y & 1) ? [180, 170, 80] : [214, 204, 120]); }
      break;
    }
    case 'oeillet_superbe': {
      for (let i = 0; i < 6; i++) { const x = 2 + rnd() * (W - 4), top = 4 + rnd() * 7; drawLine(pb, x, top, x + (rnd() - 0.5) * 2, H - 1, [110, 140, 120]); px(x - 1, top + 6, [130, 160, 140]); }
      for (let i = 0; i < 4; i++) { const x = 3 + i * 5 + rnd() * 2, y = 3 + rnd() * 6; for (let a = 0; a < 10; a++) { const t = a / 10 * TAU, r = 1.4 + rnd() * 1.4; px(x + Math.cos(t) * r, y + Math.sin(t) * r * 0.7, rnd() < 0.7 ? [246, 206, 232] : [226, 176, 214]); } px(x, y, [200, 120, 170]); }
      break;
    }
    case 'homme_pendu': { // épi de petits hommes jaune verdâtre bordés de brun
      for (let i = 0; i < 6; i++) drawLine(pb, 3 + rnd() * 10, H - 1, 4 + rnd() * 8, H - 5, vert(2));
      for (let s = 0; s < 2; s++) {
        const x0 = 5 + s * 6, top = 1 + s * 3;
        drawLine(pb, x0, top, x0, H - 1, [110, 136, 76]);
        for (let k = 0; k < 6; k++) {
          const y = top + k * 2.8, x = x0 + ((k & 1) ? 1 : -2);
          px(x, y, [150, 110, 50]); px(x, y + 1, [210, 200, 100]); px(x - 1, y + 1, [190, 180, 80]); px(x + 1, y + 1, [190, 180, 80]); px(x, y + 2, [200, 190, 96]); px(x - 1, y + 3, [140, 100, 50]); px(x + 1, y + 3, [170, 150, 70]);
        }
      }
      break;
    }
    // ======================================================== la ferme
    case 'bon_henri': { // des feuilles en fer de flèche, farineuses, et des épis de petites boules vertes
      for (let i = 0; i < 3; i++) { const x = 5 + i * 6 + rnd(), top = 1 + rnd() * 4; drawLine(pb, x, top, x, H - 1, [90, 120, 70]); for (let k = 0; k < 8; k++) px(x + ((k & 1) ? 1 : -1), top + k, (k & 2) ? [130, 160, 96] : [108, 140, 80]); }
      for (let i = 0; i < 8; i++) {
        const x = 3 + rnd() * (W - 6), y = H - 3 - rnd() * 10;
        for (let k = 0; k < 5; k++) { const ww = k < 4 ? k * 0.7 : 1.4; for (let dx = -ww; dx <= ww; dx++) px(x + dx, y + k, dx < 0 ? [96, 150, 76] : [78, 128, 62]); }
        px(x - 2, y + 5, [78, 128, 62]); px(x + 2, y + 5, [70, 116, 56]); px(x, y + 1, [170, 196, 150]); px(x, y + 3, [150, 180, 130]);
      }
      break;
    }
    case 'mouron_blanc': tapis(H - 5, (x, y) => (rnd() < 0.7 ? (rnd() < 0.5 ? [90, 170, 70] : [70, 146, 56]) : null)); for (let i = 0; i < 8; i++) etoile(2 + rnd() * (W - 4), H - 4 - rnd() * 2, [250, 250, 246], [230, 230, 220]); break;
    case 'bourse_pasteur': { // une rosette de feuilles découpées ; des tiges grêles et leurs petites bourses en cœur
      for (let a = 0; a < 8; a++) { const t = a / 8 * Math.PI; feuille(W / 2, H - 1, W / 2 + Math.cos(t) * 9, H - 2 - Math.sin(t) * 2.5, 1.3, a & 1 ? [76, 130, 60] : [92, 146, 70]); }
      for (let i = 0; i < 4; i++) {
        const x = 4 + i * 4 + rnd(), top = 1 + rnd() * 5; drawLine(pb, x, top, x + (rnd() - 0.5) * 2, H - 3, [100, 136, 76]);
        for (let y = top + 3; y < H - 5; y += 3) { const s = (y & 2) ? 1 : -1; drawLine(pb, x, y, x + s * 2, y - 1, [110, 146, 80]); px(x + s * 2, y - 1, [150, 196, 100]); px(x + s * 3, y - 1, [140, 186, 92]); px(x + s * 2, y, [124, 170, 84]); px(x + s * 3, y - 2, [124, 170, 84]); }
        px(x, top, [250, 250, 244]); px(x + 1, top, [236, 236, 230]); px(x, top - 1, [244, 244, 236]);
      }
      break;
    }
    case 'bardane': { // de très grandes feuilles, des têtes violettes accrocheuses
      const bsh = []; for (let k = 0; k < 6; k++) bsh.push({ x: 5 + rnd() * (W - 10), y: H - 10 + rnd() * 6, r: 4.5 + rnd() * 3, sq: 0.7 });
      drawCanopy(pb, bsh, ramp(['#1e3a16', '#2a4e1e', '#3a6428', '#4e7a34']), seed, { noise: 0.4, bottomDark: 0.3, holes: 1.2 });
      for (let i = 0; i < 3; i++) { const x = 6 + i * 8 + rnd() * 2, top = 2 + rnd() * 6; drawLine(pb, x, top + 2, x + (rnd() - 0.5) * 3, H - 10, [110, 80, 70]); for (const [dx, dy] of [[0, 0], [3, 2], [-3, 3]]) { drawSphere(pb, x + dx, top + dy, 1.5, ramp(['#4a5a2a', '#6a7a3a', '#8a9a4a']), seed + dx, {}); px(x + dx, top + dy - 1, [170, 70, 150]); px(x + dx + 1, top + dy - 1, [150, 60, 130]); } }
      break;
    }
    case 'pensee_champs': feuilles(8, vert(2), H - 4, 3); for (let i = 0; i < 5; i++) { const x = 2 + i * 4 + rnd(), y = H - 5 - rnd() * 3; tige(x, y + 1); px(x - 1, y - 1, [150, 110, 200]); px(x + 1, y - 1, [130, 90, 190]); px(x - 1, y + 1, [244, 240, 210]); px(x + 1, y + 1, [244, 240, 210]); px(x, y + 1, [240, 236, 200]); px(x, y, [240, 200, 50]); } break;
    case 'nielle': {
      for (let i = 0; i < 5; i++) { const x = 3 + i * 4 + rnd(), top = 3 + rnd() * 10; drawLine(pb, x, top, x + (rnd() - 0.5) * 2, H - 1, [130, 150, 120]); px(x + 1, top + 8, [140, 160, 130]); }
      for (let i = 0; i < 3; i++) { const x = 4 + i * 7 + rnd() * 2, y = 3 + rnd() * 8; for (let a = 0; a < 5; a++) { const t = a / 5 * TAU - Math.PI / 2; drawLine(pb, x, y, x + Math.cos(t) * 4, y + Math.sin(t) * 3, [100, 140, 80]); } fleur(x, y, 1.5, [176, 50, 120], [90, 20, 50], 8); px(x, y, [60, 20, 40]); }
      break;
    }
    case 'grande_cigue': { // feuilles très découpées, tige lisse tachée de pourpre, ombelles blanches
      for (let i = 0; i < 26; i++) { const x = 2 + rnd() * (W - 4), y = 16 + rnd() * (H - 18); px(x, y, rnd() < 0.5 ? [60, 110, 50] : [76, 130, 60]); px(x + 1, y - 1, [90, 146, 70]); }
      for (let i = 0; i < 3; i++) {
        const x = 6 + i * 9 + (rnd() - 0.5) * 3, top = 3 + rnd() * 10;
        drawLine(pb, x, top + 2, x, H - 1, [126, 150, 140]); drawLine(pb, x + 1, top + 3, x + 1, H - 1, [104, 128, 120]);
        for (let y = top + 6; y < H - 2; y += 3 + ((rnd() * 3) | 0)) px(x + (rnd() < 0.5 ? 0 : 1), y, [130, 40, 70]);
        ombelle(x, top, 4 + rnd() * 2, [246, 246, 238], 8);
        if (rnd() < 0.7) ombelle(x + (rnd() < 0.5 ? -4 : 4), top + 7, 2.5, [240, 240, 232], 5);
      }
      break;
    }
    case 'bryone': { // une liane : feuilles de vigne, vrilles, grappes de baies rouges
      for (let i = 0; i < 5; i++) { let x = 2 + rnd() * (W - 4), y = H - 1; for (let k = 0; k < 16; k++) { const nx = x + (rnd() - 0.5) * 4, ny = y - 1 - rnd() * 1.4; drawLine(pb, x, y, nx, ny, [90, 130, 60]); x = nx; y = ny; if (k % 4 === 2) { drawSphere(pb, x, y, 1.9, ramp(['#2e5a22', '#3e7030', '#52883e']), seed + k + i * 20, { sq: 0.8 }); } if (k % 5 === 4) { px(x + 1, y - 1, [120, 160, 80]); px(x + 2, y - 2, [120, 160, 80]); px(x + 3, y - 1, [120, 160, 80]); } } }
      specks(pb, rnd, 18, [[210, 30, 30], [180, 20, 24], [236, 70, 50]], 2, 3, W - 2, H - 6);
      break;
    }
    case 'ivraie': {
      for (let i = 0; i < 9; i++) { const x0 = 2 + rnd() * (W - 4); drawLine(pb, x0 + (rnd() - 0.5) * 6, 8 + rnd() * 10, x0, H - 1, vert(1 + (i % 3))); }
      for (let i = 0; i < 4; i++) { const x = 4 + i * 4.5 + rnd(), top = 1 + rnd() * 5; drawLine(pb, x, top, x, H - 1, [150, 150, 90]); for (let k = 0; k < 9; k += 2) { const s = (k & 2) ? 1 : -1; px(x + s, top + k, [196, 190, 120]); px(x + s * 2, top + k - 1, [176, 170, 104]); } }
      break;
    }
    case 'adonis': {
      for (let i = 0; i < 14; i++) { const x = 2 + rnd() * (W - 4), top = 6 + rnd() * 6; drawLine(pb, x, top, x + (rnd() - 0.5) * 3, H - 1, rnd() < 0.5 ? [70, 130, 60] : [90, 150, 70]); px(x - 1, top + 1, [100, 160, 80]); px(x + 1, top + 2, [80, 140, 60]); }
      for (let i = 0; i < 3; i++) { const x = 4 + i * 6 + rnd() * 2, y = 3 + rnd() * 4; fleur(x, y, 1.6, [236, 24, 24], null, 8); px(x, y, [30, 10, 10]); px(x + 1, y, [40, 14, 14]); }
      break;
    }
    // ======================================================== la ville
    case 'parietaire': {
      for (let i = 0; i < 7; i++) {
        const x0 = 2 + rnd() * (W - 4), top = 3 + rnd() * 8; let x = x0, y = H - 1;
        for (let k = 0; k < 10 && y > top; k++) { const nx = x + (rnd() - 0.5) * 2.4, ny = y - 1.6; drawLine(pb, x, y, nx, ny, [150, 80, 70]); x = nx; y = ny; if (k % 2) { px(x - 1, y, vert(2)); px(x + 1, y + 1, vert(1)); px(x + 2, y, vert(2)); } else { px(x, y - 1, [150, 170, 110]); px(x + 1, y - 1, [130, 150, 100]); } }
      }
      break;
    }
    case 'cymbalaire': {
      for (let i = 0; i < 6; i++) { let x = 2 + rnd() * (W - 4), y = H - 1; for (let k = 0; k < 6; k++) { const nx = x + (rnd() - 0.5) * 4, ny = y - rnd() * 1.2; drawLine(pb, x, y, nx, ny, [110, 90, 100]); x = nx; y = ny; px(x, y - 1, vert(2)); px(x + 1, y - 1, vert(3)); } }
      for (let i = 0; i < 7; i++) { const x = 2 + rnd() * (W - 4), y = H - 3 - rnd() * 5; px(x, y, [196, 170, 236]); px(x + 1, y, [176, 150, 220]); px(x, y + 1, [240, 214, 70]); }
      break;
    }
    case 'orpin_acre': tapis(H - 4, (x, y) => (rnd() < 0.85 ? (rnd() < 0.5 ? [120, 160, 70] : [150, 180, 80]) : null)); for (let i = 0; i < 9; i++) etoile(2 + rnd() * (W - 4), H - 4 - rnd() * 2, [250, 222, 40], [230, 190, 20]); break;
    case 'capillaire': {
      for (let i = 0; i < 7; i++) {
        const a = -1.1 + i * 0.37 + (rnd() - 0.5) * 0.2, len = 7 + rnd() * 4, x1 = W / 2 + Math.sin(a) * len, y1 = H - 1 - Math.cos(a) * len;
        drawLine(pb, W / 2, H - 1, x1, y1, [30, 22, 18]);
        for (let t = 0.25; t <= 1; t += 0.15) { const x = lerp(W / 2, x1, t), y = lerp(H - 1, y1, t); px(x - 1, y, vert(2)); px(x + 1, y, vert(3)); }
      }
      break;
    }
    case 'giroflee': {
      feuilles(10, [80, 120, 70], H - 12, 9);
      for (let i = 0; i < 4; i++) { const x = 3 + i * 5 + rnd(), top = 2 + rnd() * 5; tige(x, top + 2, 0, [90, 116, 70]); for (let k = 0; k < 5; k++) { const fx = x + (rnd() - 0.5) * 4, fy = top + rnd() * 4; px(fx, fy, rnd() < 0.6 ? [236, 170, 30] : [180, 90, 30]); px(fx + 1, fy, [210, 140, 26]); } }
      break;
    }
    case 'bourrache': {
      const bsh = []; for (let k = 0; k < 5; k++) bsh.push({ x: 4 + rnd() * (W - 8), y: H - 8 + rnd() * 4, r: 3 + rnd() * 2, sq: 0.8 });
      drawCanopy(pb, bsh, ramp(['#3a5a3a', '#4e7050', '#6a8a68', '#90a88c']), seed, { noise: 0.5, bottomDark: 0.2 });
      for (let i = 0; i < 4; i++) { const x = 4 + i * 6 + rnd() * 2, top = 2 + rnd() * 6; drawLine(pb, x, top, x, H - 7, [120, 140, 120]); for (let k = 0; k < 3; k++) { const fx = x + (k - 1) * 2, fy = top + 1 + rnd() * 2; etoile(fx, fy, [80, 110, 236], [20, 20, 40]); } }
      break;
    }
    case 'melisse': {
      const bsh = []; for (let k = 0; k < 7; k++) bsh.push({ x: 4 + rnd() * (W - 8), y: 7 + rnd() * (H - 11), r: 3 + rnd() * 2 });
      drawCanopy(pb, bsh, ramp(['#2e5a1e', '#3e7228', '#528a34', '#6aa444']), seed, { noise: 0.55, bottomDark: 0.3, holes: 1.3 });
      specks(pb, rnd, 12, [[244, 244, 236], [226, 230, 210]], 2, 3, W - 2, H - 4); specks(pb, rnd, 14, [[120, 170, 80]], 2, 3, W - 2, H - 4);
      break;
    }
    case 'laitue_vireuse': {
      drawLine(pb, W / 2, 6, W / 2, H - 1, [150, 170, 160], 2);
      for (let y = 14; y < H - 2; y += 5) { feuille(W / 2, y, W / 2 - 7, y - 3, 1.8, [130, 166, 150]); feuille(W / 2 + 1, y + 2, W / 2 + 8, y - 1, 1.8, [110, 146, 132]); }
      for (let k = 0; k < 6; k++) { const a = -1 + k * 0.4; drawLine(pb, W / 2, 7, W / 2 + Math.sin(a) * 6, 2 + Math.abs(a) * 2, [150, 170, 150]); px(W / 2 + Math.sin(a) * 6, 1 + Math.abs(a) * 2, [240, 230, 140]); }
      break;
    }
    case 'ceterach': for (let i = 0; i < 6; i++) { const a = -1.2 + i * 0.48, len = 4 + rnd() * 3; for (let t = 0; t <= len; t += 0.8) { const x = W / 2 + Math.sin(a) * t * 1.6, y = H - 1 - Math.cos(a) * t; px(x, y, vert(2)); px(x + 1, y, t > len - 1.5 ? [190, 130, 60] : vert(1)); px(x, y + 1, [170, 110, 50]); } } break;
    case 'orobanche': {
      for (let s = 0; s < 2; s++) {
        const x = 4 + s * 6, top = 1 + s * 4;
        for (let y = top; y < H; y++) { px(x, y, [200, 160, 140]); px(x + 1, y, [176, 136, 120]); }
        for (let y = top; y < H - 6; y += 2) { px(x - 1, y, [190, 130, 150]); px(x + 2, y + 1, [160, 110, 140]); px(x - 1, y + 1, [150, 100, 120]); }
      }
      break;
    }
    // ======================================================== la lande
    case 'genestrole': {
      for (let i = 0; i < 12; i++) { const x0 = W / 2 + (rnd() - 0.5) * 10, top = 3 + rnd() * 8; drawLine(pb, x0 + (rnd() - 0.5) * 12, top, x0, H - 1, rnd() < 0.5 ? [60, 110, 40] : [76, 126, 50]); }
      specks(pb, rnd, 40, [[250, 210, 30], [240, 190, 20], [252, 226, 80]], 1, 1, W - 1, H - 6);
      break;
    }
    case 'viperine': {
      for (let i = 0; i < 2; i++) {
        const x = 6 + i * 8 + rnd() * 2, top = 2 + rnd() * 6;
        drawLine(pb, x, top, x, H - 1, [100, 120, 80]); for (let y = top + 10; y < H - 1; y += 2) px(x + ((y & 2) ? 1 : -1), y, [140, 60, 60]);
        for (let k = 0; k < 12; k++) { const y = top + k * 1.3, s = (k & 1) ? 1 : -1; px(x + s, y, k < 3 ? [230, 130, 170] : [70, 100, 230]); px(x + s * 2, y, k < 3 ? [210, 110, 150] : [60, 80, 210]); if (k > 3 && k % 3 === 0) px(x + s * 3, y - 1, [200, 50, 60]); }
      }
      feuilles(8, [90, 120, 80], H - 6, 4);
      break;
    }
    case 'genevrier': { // un petit cyprès bleu-vert, sombre, piqueté de baies
      const bsh = []; for (let k = 0; k < 9; k++) { const t = k / 8; bsh.push({ x: W / 2 + (rnd() - 0.5) * 6 * (1 - t * 0.5), y: H - 8 - t * (H - 14), r: 5.5 - t * 3 + rnd() * 1.2, sq: 1.25 }); }
      drawCanopy(pb, bsh, ramp(['#14281e', '#1c3828', '#284a34', '#36604a']), seed, { noise: 0.55, bottomDark: 0.15, holes: 1.6 });
      drawLine(pb, W / 2, H - 4, W / 2, H - 1, [80, 60, 40], 2);
      specks(pb, rnd, 12, [[60, 76, 120], [80, 96, 140], [110, 120, 160]], 3, 6, W - 3, H - 6);
      break;
    }
    case 'polygala': tapis(H - 4, (x, y) => (rnd() < 0.45 ? vert(1 + (rnd() * 2) | 0) : null)); for (let i = 0; i < 8; i++) { const x = 2 + rnd() * (W - 4), y = H - 4 - rnd() * 3, c = rnd() < 0.6 ? [80, 110, 236] : rnd() < 0.5 ? [236, 120, 170] : [240, 240, 240]; px(x, y, c); px(x + 1, y, sombre(c, 0.85)); px(x, y - 1, clair(c, 1.1)); } break;
    case 'petite_centauree': {
      feuilles(6, vert(2), H - 3, 2);
      for (let i = 0; i < 3; i++) { const x = 5 + i * 5 + rnd(), top = 4 + rnd() * 4; tige(x, top + 1); drawLine(pb, x, top + 3, x - 3, top, vert(2)); drawLine(pb, x, top + 3, x + 3, top + 1, vert(2)); for (const [dx, dy] of [[0, 0], [-3, -1], [3, 0]]) etoile(x + dx, top + dy, [236, 120, 160], [240, 210, 60]); }
      break;
    }
    case 'betoine': {
      for (let a = 0; a < 6; a++) { const t = a / 6 * Math.PI; feuille(W / 2, H - 1, W / 2 + Math.cos(t) * 8, H - 2 - Math.sin(t) * 3, 1.2, [70, 116, 54]); }
      for (let i = 0; i < 2; i++) { const x = 7 + i * 6, top = 2 + rnd() * 5; drawLine(pb, x, top + 5, x, H - 3, [90, 116, 70]); for (let y = top; y < top + 7; y++) { px(x - 1, y, (y & 1) ? [176, 60, 150] : [150, 40, 130]); px(x, y, [196, 80, 170]); px(x + 1, y, [150, 44, 126]); } }
      break;
    }
    case 'pied_chat': tapis(H - 3, (x, y) => (rnd() < 0.7 ? (rnd() < 0.5 ? [176, 186, 170] : [150, 160, 146]) : null)); for (let i = 0; i < 4; i++) { const x = 3 + i * 5 + rnd(), y = 2 + rnd() * 3; drawLine(pb, x, y, x, H - 2, [170, 176, 160]); drawSphere(pb, x, y, 1.6, rnd() < 0.6 ? ramp(['#c08098', '#e0a8bc', '#f4d0dc']) : ramp(['#c8c8c0', '#e8e8e0', '#fafaf4']), seed + i, {}); } break;
    case 'cuscute': {
      for (let i = 0; i < 10; i++) { const x = 1 + rnd() * (W - 2), y = H - 1 - rnd() * 6; px(x, y, rnd() < 0.5 ? [150, 90, 140] : [60, 90, 50]); }
      for (let k = 0; k < 9; k++) { let x = 1 + rnd() * (W - 2), y = H - 2 - rnd() * 5; for (let i = 0; i < 12; i++) { px(x, y, rnd() < 0.6 ? [224, 80, 70] : [240, 140, 120]); x += Math.cos(i * 1.7 + k) * 1.4; y += Math.sin(i * 1.3 + k * 2) * 0.9; y = Math.max(1, Math.min(H - 1, y)); } }
      for (let i = 0; i < 5; i++) { const x = 2 + rnd() * (W - 4), y = 2 + rnd() * (H - 4); px(x, y, [246, 240, 232]); px(x + 1, y, [230, 224, 214]); }
      break;
    }
    case 'immortelle': {
      for (let i = 0; i < 5; i++) { const x = 3 + i * 3.6 + rnd(), top = 3 + rnd() * 5; drawLine(pb, x, top, x + (rnd() - 0.5) * 2, H - 1, [170, 176, 160]); px(x - 1, top + 6, [180, 186, 170]); }
      for (let i = 0; i < 5; i++) { const cx = 3 + i * 3.6, cy = 2 + rnd() * 4; for (let j = 0; j < 5; j++) { const x = cx + (rnd() - 0.5) * 4, y = cy + (rnd() - 0.5) * 2; px(x, y, rnd() < 0.6 ? [244, 196, 30] : [226, 160, 20]); px(x, y - 1, [252, 226, 90]); } }
      break;
    }
    case 'botryche': {
      drawLine(pb, 4, 3, 4, H - 1, [110, 140, 80]);
      for (let k = 0; k < 4; k++) { const y = 3 + k * 2; for (const s of [-1, 1]) { px(4 + s, y, [130, 176, 96]); px(4 + s * 2, y, [110, 160, 80]); px(4 + s * 2, y + 1, [96, 140, 70]); } }
      drawLine(pb, 8, 0, 8, H - 1, [140, 150, 90]); for (let y = 0; y < 6; y++) { px(8, y, [226, 196, 80]); px(9, y, (y & 1) ? [200, 170, 60] : [240, 214, 100]); }
      break;
    }
    // ======================================================== les hauteurs
    case 'veratre':
    case 'gentiane_jaune': { // les deux se ressemblent : grandes feuilles plissées le long d'une tige épaisse
      const gent = kind === 'gentiane_jaune', x = W / 2;
      drawLine(pb, x, 4, x, H - 1, gent ? [130, 160, 120] : [120, 150, 100], 2);
      for (let k = 0; k < (gent ? 6 : 8); k++) {
        // la gentiane : par deux, face à face ; le vérâtre : une à une, tout autour de la tige (et plus larges, plissées)
        const y = H - 3 - k * (gent ? 6 : 4.4), s = gent ? 1 : (k & 1 ? 1 : -1), len = gent ? 9 - k * 0.9 : 10 - k * 0.8;
        const col = gent ? [96, 140, 120] : (k % 3 === 2 ? [96, 140, 84] : [116, 162, 98]);
        if (gent) { feuille(x, y, x - len, y - 3, 2.2, col); feuille(x + 1, y, x + 1 + len, y - 3, 2.2, sombre(col, 0.9)); } else {
          feuille(x + (s > 0 ? 1 : 0), y, x + s * len, y - 5, 3.4, col);
          for (let t = 0.25; t < 0.85; t += 0.3) px(x + s * len * t + (s > 0 ? 1 : 0), y - 5 * t, sombre(col, 0.72)); // les plis
        }
        if (gent && k < 4) { const L = [x - len * 0.4, y - 1]; px(L[0], L[1], sombre(col, 0.7)); px(L[0] + len * 0.8, L[1], sombre(col, 0.7)); }
        if (gent && k >= 2 && k <= 4) for (let j = 0; j < 5; j++) px(x + (j - 2) * 1.2, y - 2 - (j & 1), [246, 200, 30]);
      }
      if (!gent) for (let k = 0; k < 7; k++) { const a = -0.9 + k * 0.3; drawLine(pb, x, 6, x + Math.sin(a) * 5, 1 + Math.abs(a) * 2, [170, 180, 140]); px(x + Math.sin(a) * 5, Math.abs(a) * 2, [220, 226, 196]); }
      else for (let j = 0; j < 4; j++) px(x - 1 + j * 0.7, 3 - (j & 1), [246, 206, 40]);
      break;
    }
    case 'rumex_alpin': {
      for (let i = 0; i < 6; i++) { const x = 4 + rnd() * (W - 8), y = H - 6 - rnd() * 8; drawLine(pb, x, y + 2, x + (rnd() - 0.5) * 3, H - 1, [150, 70, 60]); drawSphere(pb, x, y, 4 + rnd() * 1.5, ramp(['#1e4a18', '#2a5e20', '#3a7428', '#4e8a34']), seed + i * 13, { sq: 0.75, noise: 0.3 }); drawLine(pb, x, y - 3, x, y + 3, [130, 160, 100]); }
      for (let i = 0; i < 2; i++) { const x = 8 + i * 14, top = 1 + rnd() * 3; drawLine(pb, x, top, x, H - 8, [140, 80, 60]); for (let k = 0; k < 7; k++) px(x + ((k & 1) ? 1 : -1), top + k, [170, 80, 50]); }
      break;
    }
    case 'dryade': tapis(H - 3, (x, y) => (rnd() < 0.75 ? (rnd() < 0.5 ? [50, 90, 50] : [70, 110, 60]) : null)); for (let i = 0; i < 4; i++) { const x = 3 + i * 5.5 + rnd(), y = H - 5 - rnd() * 1.5; tige(x, y + 1); fleur(x, y, 1.6, [250, 250, 244], [240, 200, 50], 8); px(x, y, [236, 190, 40]); } if (rnd() < 0.8) { const x = W - 4, y = H - 6; for (let k = 0; k < 5; k++) px(x + Math.cos(k) * 1.5, y - k * 0.5, [226, 226, 216]); } break;
    case 'carline': {
      for (let a = 0; a < 10; a++) { const t = a / 10 * TAU; drawLine(pb, W / 2, H - 2, W / 2 + Math.cos(t) * 9, H - 2 + Math.sin(t) * 2, (a & 1) ? [70, 100, 60] : [90, 120, 70]); px(W / 2 + Math.cos(t) * 10, H - 2 + Math.sin(t) * 2 - 1, [190, 190, 160]); }
      if (variante) { for (let dy = 0; dy < 4; dy++) for (let dx = -2; dx <= 2; dx++) if (Math.abs(dx) < 3 - dy * 0.5) px(W / 2 + dx, H - 3 - dy, (dx + dy) & 1 ? [214, 210, 196] : [186, 182, 168]); }
      else { for (let a = 0; a < 18; a++) { const t = a / 18 * TAU; drawLine(pb, W / 2, H - 4, W / 2 + Math.cos(t) * 6, H - 4 + Math.sin(t) * 2.4, a & 1 ? [236, 232, 220] : [212, 208, 196]); } drawSphere(pb, W / 2, H - 4, 2.2, ramp(['#8a6a3a', '#b08a50', '#d0aa6a']), seed, { sq: 0.6 }); }
      break;
    }
    case 'trolle': {
      for (let i = 0; i < 5; i++) { const x = 3 + rnd() * (W - 6), y = H - 4 - rnd() * 4; for (let a = 0; a < 5; a++) { const t = -Math.PI / 2 + (a - 2) * 0.5; drawLine(pb, x, y + 2, x + Math.cos(t) * 3, y + 2 + Math.sin(t) * 2.5, vert(2)); } }
      for (let i = 0; i < 3; i++) { const x = 4 + i * 6 + rnd() * 2, top = 2 + rnd() * 6; tige(x, top + 2); drawSphere(pb, x, top, 2.2, ramp(['#c0a020', '#e4c830', '#f4e070', '#fcf0a8']), seed + i, {}); }
      break;
    }
    case 'auricule': {
      for (let a = 0; a < 7; a++) { const t = Math.PI * (0.1 + a * 0.13); feuille(W / 2, H - 1, W / 2 + Math.cos(t) * 7, H - 2 - Math.sin(t) * 3, 1.6, [160, 180, 150]); }
      drawLine(pb, W / 2, 3, W / 2, H - 3, [140, 160, 130]);
      for (let k = 0; k < 5; k++) { const x = W / 2 + (k - 2) * 1.8, y = 2 + Math.abs(k - 2) * 0.8; fleur(x, y, 1, [246, 226, 60], [200, 160, 30], 5); }
      break;
    }
    case 'renoncule_glaciers': roche(4); for (let i = 0; i < 6; i++) { const x = 3 + rnd() * (W - 6), y = H - 3 - rnd() * 2; px(x, y, [40, 80, 50]); px(x + 1, y, [56, 100, 60]); } for (let i = 0; i < 3; i++) { const x = 4 + i * 5 + rnd(), y = 2 + rnd() * 3; tige(x, y + 1); fleur(x, y, 1.4, i === 1 ? [240, 190, 200] : [250, 246, 244], [240, 200, 60], 5); } break;
    case 'ail_victorial': {
      for (let i = 0; i < 4; i++) { const x = 5 + rnd() * (W - 10), s = rnd() < 0.5 ? -1 : 1; feuille(x, H - 1, x + s * (4 + rnd() * 3), H - 10 - rnd() * 6, 1.8, [80, 136, 70]); }
      for (let i = 0; i < 2; i++) { const x = 7 + i * 6, top = 2 + rnd() * 4; drawLine(pb, x, top + 2, x, H - 1, [110, 140, 90]); drawSphere(pb, x, top, 2.4, ramp(['#a0a888', '#c4ccae', '#e4ead2']), seed + i, { noise: 0.5 }); }
      break;
    }
    case 'nard_celtique': for (let a = 0; a < 8; a++) { const t = a / 8 * Math.PI; feuille(W / 2, H - 1, W / 2 + Math.cos(t) * 6, H - 2 - Math.sin(t) * 2.5, 1, [140, 150, 130]); } drawLine(pb, W / 2, 2, W / 2, H - 2, [130, 130, 100]); for (let k = 0; k < 4; k++) px(W / 2 + (k - 1.5), 1 + (k & 1), [220, 200, 110]); break;
    default: tige(W / 2, 4); px(W / 2, 4, [240, 240, 240]);
  }
  if (!['mouron_blanc', 'orpin_acre', 'polygala', 'pied_chat', 'dryade', 'cuscute'].includes(kind)) edgeDarken(pb, 0.8);
  return pb;
}
{
  const _afs = addFarmSprites;
  addFarmSprites = function (add) {
    _afs(add);
    if (typeof D1_PLANTES === 'undefined') return;
    D1_PLANTES.forEach((P, i) => add('d1_' + P.o, spriteD1(P.o, 8117 + i * 31)));
    // la carline fermée (temps de pluie)
    add('d1_carline_f', spriteD1('carline', 8117 + D1_PLANTES.findIndex((P) => P.o === 'carline') * 31, true));
  };
}
