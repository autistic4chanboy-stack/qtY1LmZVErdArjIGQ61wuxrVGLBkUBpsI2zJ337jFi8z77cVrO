// ============================================================================
//  SPRITES DES NOUVELLES PLANTES (une par espèce, chacune dans son milieu) :
//  ail des ours, muguet, millepertuis, valériane, sauge, serpolet, arnica, génépi,
//  joubarbe, lichen, aconit, rossolis, menthe aquatique, prêle, cresson, girolle,
//  cèpe, amanite, trompette-de-la-mort, morille, lycopode, belladone, perce-neige,
//  linaigrette, ortie, tussilage, colchique
// ============================================================================
function spriteWild2(kind, seed) {
  const rnd = mulberry32(seed);
  const size = { valeriane: [24, 34], sauge: [22, 28], aconit: [22, 36], prele: [22, 30], belladone: [26, 30], linaigrette: [22, 30], ortie: [26, 30], lycopode: [28, 14], lichen: [24, 12], joubarbe: [22, 12], serpolet: [26, 12], cresson: [26, 12], rossolis: [20, 12], morille: [16, 18], cepe: [18, 18], amanite: [18, 18], girolle: [20, 14], trompette: [20, 16] }[kind] || [24, 22];
  const [W, H] = size, pb = new PixelBuf(W, H);
  const px = (x, y, c) => pb.set(Math.round(x), Math.round(y), c);
  const stem = (x, top, lean = 0, col) => drawLine(pb, x + lean, top, x, H - 1, col || PAL.stem[1 + ((rnd() * 2) | 0)]);
  const leaves = (n, col, y0) => { for (let i = 0; i < n; i++) { const x = 2 + rnd() * (W - 4), y = (y0 ?? H - 5) + rnd() * 3; px(x, y, col); px(x + 1, y, col.map((v) => v * 0.85)); px(x, y - 1, col.map((v) => v * 1.1)); } };
  const cap = (x, y, r, c1, c2, stemC) => { // chapeau de champignon
    for (let yy = H - 1; yy > y; yy--) { px(x, yy, stemC); px(x + 1, yy, stemC.map((v) => v * 0.85)); }
    for (let dy = 0; dy <= r * 0.8; dy++) for (let dx = -r; dx <= r; dx++) if (dx * dx / (r * r) + dy * dy / (r * r * 0.64) <= 1) px(x + dx, y - dy + r * 0.3, dy < 1 ? c2 : c1);
  };
  switch (kind) {
    case 'ail_ours': leaves(8, [60, 140, 60]); for (let i = 0; i < 4; i++) { const x = 4 + i * 5 + rnd() * 2, top = 5 + rnd() * 6; stem(x, top); for (let a = 0; a < 7; a++) px(x + Math.cos(a) * 2, top + Math.sin(a) * 1.4, [248, 248, 240]); } break;
    case 'muguet': for (let i = 0; i < 3; i++) { const x = 5 + i * 6; drawLine(pb, x - 2, 8, x - 1, H - 1, [50, 120, 60]); drawLine(pb, x + 2, 7, x + 1, H - 1, [40, 110, 50]); stem(x, 5 + rnd() * 3, 1); for (let b = 0; b < 4; b++) { px(x + 2, 7 + b * 2.4, [250, 250, 244]); px(x + 3, 8 + b * 2.4, [236, 236, 228]); } } break;
    case 'millepertuis': for (let i = 0; i < 5; i++) { const x = 3 + i * 4.5 + rnd(), top = 3 + rnd() * 6; stem(x, top); for (const [dx, dy] of [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]]) px(x + dx, top + dy, dx || dy ? [250, 210, 40] : [220, 140, 20]); if (rnd() < 0.6) px(x + 2, top + 3, [245, 200, 50]); } break;
    case 'valeriane': for (let i = 0; i < 4; i++) { const x = 4 + i * 5.5, top = 2 + rnd() * 6; stem(x, top); for (let k = 0; k < 12; k++) px(x + (rnd() - 0.5) * 7, top + rnd() * 4, rnd() < 0.5 ? [240, 190, 210] : [250, 225, 235]); } leaves(6, [60, 120, 50], H - 8); break;
    case 'sauge': for (let i = 0; i < 5; i++) { const x = 3 + i * 4 + rnd(), top = 3 + rnd() * 6; stem(x, top, 0, [110, 130, 100]); for (let b = 0; b < 6; b++) px(x + (b % 2 ? 1 : -1), top + b * 1.5, [140, 100, 200]); } leaves(10, [150, 170, 140], H - 6); break;
    case 'serpolet': for (let x = 1; x < W - 1; x++) for (let y = H - 5; y < H; y++) if (rnd() < 0.55) px(x, y, rnd() < 0.4 ? [200, 110, 170] : rnd() < 0.5 ? [80, 110, 60] : [110, 140, 80]); break;
    case 'arnica': for (let i = 0; i < 4; i++) { const x = 4 + i * 5 + rnd(), top = 4 + rnd() * 7; stem(x, top); for (let a = 0; a < 10; a++) px(x + Math.cos(a * 0.63) * 2.2, top + Math.sin(a * 0.63) * 1.6, [250, 190, 30]); px(x, top, [210, 120, 20]); } leaves(6, [70, 120, 50]); break;
    case 'genepi': for (let i = 0; i < 7; i++) { const x = 3 + rnd() * (W - 6), top = 8 + rnd() * 6; stem(x, top, 0, [170, 180, 170]); px(x, top, [230, 210, 60]); px(x, top + 1, [200, 190, 80]); } for (let x = 2; x < W - 2; x++) if (rnd() < 0.7) px(x, H - 2 - rnd() * 3, [180, 190, 180]); break;
    case 'joubarbe': for (let i = 0; i < 3; i++) { const cx = 4 + i * 7, cy = H - 4; for (let a = 0; a < 10; a++) for (let r = 1; r <= 3; r++) px(cx + Math.cos(a * 0.63) * r, cy + Math.sin(a * 0.63) * r * 0.6, r === 3 ? [150, 60, 70] : [90, 140, 90]); px(cx, cy, [60, 110, 70]); } break;
    case 'lichen': for (let x = 1; x < W - 1; x++) for (let y = H - 6; y < H; y++) if (rnd() < 0.5 - (H - y) * 0.05) px(x, y, rnd() < 0.5 ? [170, 180, 150] : [140, 150, 120]); break;
    case 'aconit': for (let i = 0; i < 3; i++) { const x = 5 + i * 6 + rnd(), top = 2 + rnd() * 5; stem(x, top); for (let b = 0; b < 8; b++) { px(x - 1, top + b * 2, [60, 70, 190]); px(x, top + b * 2 - 1, [80, 90, 220]); px(x + 1, top + b * 2, [40, 50, 150]); } } leaves(6, [40, 100, 50], H - 7); break;
    case 'rossolis': for (let i = 0; i < 4; i++) { const cx = 3 + i * 4.5, cy = H - 3; for (let a = 0; a < 6; a++) { px(cx + Math.cos(a) * 2, cy + Math.sin(a) * 1, [180, 40, 40]); px(cx + Math.cos(a) * 2.6, cy + Math.sin(a) * 1.3 - 1, [250, 220, 220]); } } break;
    case 'menthe_eau': for (let i = 0; i < 5; i++) { const x = 3 + i * 4.5 + rnd(), top = 4 + rnd() * 7; stem(x, top); for (let a = 0; a < 6; a++) px(x + Math.cos(a) * 1.4, top + Math.sin(a) * 1.4, [200, 170, 230]); px(x - 1, top + 5, [60, 130, 60]); px(x + 1, top + 6, [60, 130, 60]); } break;
    case 'prele': for (let i = 0; i < 7; i++) { const x = 2 + rnd() * (W - 4), top = 2 + rnd() * 10; drawLine(pb, x, top, x, H - 1, [90, 150, 80]); for (let y = top + 2; y < H - 1; y += 3) { px(x - 1, y, [60, 110, 50]); px(x + 1, y, [60, 110, 50]); px(x, y, [40, 60, 40]); } } break;
    case 'cresson': for (let x = 1; x < W - 1; x++) for (let y = H - 6; y < H; y++) if (rnd() < 0.5) px(x, y, rnd() < 0.15 ? [245, 245, 240] : rnd() < 0.5 ? [50, 120, 50] : [80, 150, 70]); break;
    case 'girolle': for (let i = 0; i < 3; i++) { const x = 4 + i * 6, y = H - 6 - rnd() * 3; for (let yy = y; yy < H; yy++) px(x, yy, [230, 160, 50]); for (let dx = -3; dx <= 3; dx++) { px(x + dx, y - Math.abs(dx) * 0.3, [245, 175, 60]); px(x + dx, y + 1, [210, 140, 40]); } } break;
    case 'cepe': cap(8, 7, 5, [120, 70, 40], [150, 95, 55], [230, 220, 190]); if (rnd() < 1) cap(13, 11, 3, [130, 80, 45], [160, 100, 60], [225, 215, 185]); break;
    case 'amanite': cap(8, 7, 5, [220, 40, 30], [240, 70, 50], [245, 245, 238]); for (let k = 0; k < 7; k++) px(4 + rnd() * 9, 4 + rnd() * 4, [250, 250, 245]); cap(14, 12, 2.5, [210, 40, 30], [235, 60, 45], [240, 240, 232]); break;
    case 'trompette': for (let i = 0; i < 4; i++) { const x = 3 + i * 4.5, y = H - 9 - rnd() * 4; for (let yy = y; yy < H; yy++) { const w = Math.max(0, (H - yy) < 3 ? 0 : (yy - y) < 3 ? 2 - (yy - y) * 0.5 : 0.5); for (let dx = -w; dx <= w; dx++) px(x + dx, yy, [40, 34, 40]); } px(x, y, [70, 60, 70]); } break;
    case 'morille': for (let i = 0; i < 2; i++) { const x = 5 + i * 6, y = 4 + rnd() * 3; for (let yy = y + 7; yy < H; yy++) { px(x, yy, [230, 220, 190]); px(x + 1, yy, [220, 210, 180]); } for (let yy = y; yy < y + 8; yy++) for (let dx = -2; dx <= 2; dx++) px(x + dx + 0.5, yy, ((yy + dx) & 1) ? [150, 120, 80] : [100, 80, 50]); } break;
    case 'lycopode': for (let i = 0; i < 5; i++) { let x = 2 + rnd() * (W - 4), y = H - 2; for (let k = 0; k < 8; k++) { px(x, y, [50, 110, 50]); px(x, y - 1, [70, 140, 60]); x += (rnd() - 0.3) * 2; y -= rnd() < 0.3 ? 1 : 0; } drawLine(pb, x, y, x, y - 3, [200, 190, 90]); } break;
    case 'belladone': { const bsh = []; for (let k = 0; k < 5; k++) bsh.push({ x: 6 + rnd() * (W - 12), y: 6 + rnd() * (H - 14), r: 5 + rnd() * 3 }); drawCanopy(pb, bsh, ramp(['#1a3414', '#24461a', '#305a22']), seed, { noise: 0.4, bottomDark: 0.4 }); specks(pb, rnd, 8, [[90, 40, 90], [120, 60, 110]], 2, 2, W - 2, H - 6); specks(pb, rnd, 10, [[20, 16, 24]], 2, 4, W - 2, H - 6); break; }
    case 'perce_neige': for (let i = 0; i < 4; i++) { const x = 4 + i * 5 + rnd(), top = 5 + rnd() * 6; drawLine(pb, x - 1, top + 3, x - 1, H - 1, [60, 130, 80]); stem(x, top); px(x + 1, top + 1, [250, 250, 250]); px(x + 1, top + 2, [240, 244, 240]); px(x + 2, top + 2, [230, 236, 230]); px(x + 1, top + 3, [120, 200, 120]); } break;
    case 'linaigrette': for (let i = 0; i < 6; i++) { const x = 2 + rnd() * (W - 4), top = 3 + rnd() * 8; stem(x, top, (rnd() - 0.5) * 2, [120, 140, 80]); for (let k = 0; k < 6; k++) px(x + (rnd() - 0.5) * 3, top - 1 + rnd() * 3, [252, 252, 248]); } break;
    case 'ortie': for (let i = 0; i < 5; i++) { const x = 3 + i * 5 + rnd(), top = 2 + rnd() * 6; stem(x, top, 0, [60, 100, 50]); for (let y = top + 1; y < H - 2; y += 3) { px(x - 1, y, [50, 110, 50]); px(x - 2, y + 1, [40, 90, 40]); px(x + 1, y + 1, [50, 110, 50]); px(x + 2, y + 2, [40, 90, 40]); } } break;
    case 'tussilage': leaves(6, [80, 130, 70]); for (let i = 0; i < 5; i++) { const x = 3 + i * 4.5 + rnd(), top = 6 + rnd() * 8; stem(x, top, 0, [150, 110, 80]); for (let a = 0; a < 10; a++) px(x + Math.cos(a * 0.63) * 2, top + Math.sin(a * 0.63) * 1.4, [250, 200, 40]); px(x, top, [240, 170, 30]); } break;
    case 'colchique': for (let i = 0; i < 5; i++) { const x = 3 + i * 4.5 + rnd(), top = 7 + rnd() * 7; drawLine(pb, x, top + 4, x, H - 1, [240, 230, 230]); for (let b = 0; b < 4; b++) { px(x - 1, top + b, [200, 130, 200]); px(x, top + b, [220, 150, 220]); px(x + 1, top + b, [190, 120, 190]); } } break;
    default: stem(W / 2, 4); px(W / 2, 4, [240, 240, 240]);
  }
  return pb;
}
const WILD2_KINDS = ['ail_ours', 'muguet', 'millepertuis', 'valeriane', 'sauge', 'serpolet', 'arnica', 'genepi', 'joubarbe', 'lichen', 'aconit', 'rossolis', 'menthe_eau', 'prele', 'cresson',
  'girolle', 'cepe', 'amanite', 'trompette', 'morille', 'lycopode', 'belladone', 'perce_neige', 'linaigrette', 'ortie', 'tussilage', 'colchique'];
{
  const _afs = addFarmSprites;
  addFarmSprites = function (add) {
    _afs(add);
    WILD2_KINDS.forEach((k, i) => add('w2_' + k, spriteWild2(k, 1301 + i * 17)));
  };
}
