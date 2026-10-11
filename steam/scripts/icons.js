// L'icône du jeu (pixel art 32 × 32, agrandie sans flou) : node scripts/icons.js
//  build/icon.png (1024), build/icons/<n>x<n>.png (Linux), build/icon.ico (Windows),
//  build/icon.icns (macOS), store/community_icon_184.png, store/client_icon_32.png,
//  store/client_icon.ico (Steamworks : icônes de la communauté et du client).
// Une lanterne allumée au bord de la forêt sombre, la lune, deux yeux entre les sapins.
'use strict';
const fs = require('fs');
const path = require('path');
const { encodePNG, image, scale, encodeICO, encodeICNS } = require('./png');

const ROOT = path.join(__dirname, '..');
const N = 32;

function dessiner() {
  const img = image(N, N), d = img.data;
  const set = (x, y, c, a = 255) => {
    if (x < 0 || y < 0 || x >= N || y >= N) return;
    const i = (y * N + x) * 4;
    if (a >= 255) { d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255; return; }
    const t = a / 255;
    d[i] = d[i] * (1 - t) + c[0] * t; d[i + 1] = d[i + 1] * (1 - t) + c[1] * t; d[i + 2] = d[i + 2] * (1 - t) + c[2] * t; d[i + 3] = 255;
  };
  // le ciel de nuit
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const t = y / N;
    set(x, y, [12 + 18 * t, 18 + 22 * t, 34 + 6 * t]);
  }
  // des étoiles
  for (const [x, y] of [[4, 3], [9, 6], [13, 2], [19, 4], [28, 12], [6, 9], [16, 8]]) set(x, y, [170, 180, 200], 200);
  // la lune
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const a = Math.hypot(x + 0.5 - 24.5, y + 0.5 - 7.5), b = Math.hypot(x + 0.5 - 26.3, y + 0.5 - 6.2);
    if (a < 4 && b > 3.4) set(x, y, [236, 230, 196]);
  }
  // les sapins : deux rangs
  const sapin = (cx, base, h, w, c) => {
    for (let y = 0; y < h; y++) {
      const yy = base - y, half = Math.round((1 - y / h) * w * (0.75 + 0.25 * ((y % 3) === 0 ? 1 : 0)));
      for (let x = -half; x <= half; x++) set(cx + x, yy, c);
    }
    set(cx, base + 1, c); set(cx, base + 2, c);
  };
  for (const [cx, h, w] of [[2, 16, 4], [8, 19, 4], [13, 14, 3], [21, 17, 4], [27, 20, 5], [31, 15, 3]]) sapin(cx, 26, h, w, [20, 34, 30]);
  for (const [cx, h, w] of [[0, 20, 5], [5, 22, 5], [26, 22, 5], [31, 19, 4]]) sapin(cx, 28, h, w, [8, 14, 12]);
  // le sol
  for (let y = 28; y < N; y++) for (let x = 0; x < N; x++) set(x, y, [10, 16, 12]);
  // deux yeux rouges entre les sapins
  set(4, 20, [230, 40, 30]); set(6, 20, [230, 40, 30]);
  // le halo de la lanterne
  const LX = 16, LY = 21;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const r = Math.hypot(x + 0.5 - LX, y + 0.5 - LY);
    if (r < 11) set(x, y, [255, 180, 80], Math.round(150 * Math.pow(1 - r / 11, 2)));
  }
  // la lanterne
  const C = { noir: [24, 18, 14], fer: [70, 60, 52], flamme: [255, 236, 170], verre: [255, 190, 90] };
  for (const [x, y] of [[15, 13], [16, 13], [14, 14], [17, 14]]) set(x, y, C.noir); // l'anse
  for (let x = 13; x <= 18; x++) { set(x, 15, C.fer); set(x, 24, C.fer); }
  for (let x = 14; x <= 17; x++) set(x, 16, C.noir);
  for (let y = 17; y <= 23; y++) { set(13, y, C.noir); set(18, y, C.noir); for (let x = 14; x <= 17; x++) set(x, y, C.verre); }
  for (const [x, y] of [[15, 19], [16, 19], [15, 20], [16, 20], [15, 21], [16, 21], [16, 18]]) set(x, y, C.flamme);
  for (let x = 14; x <= 17; x++) set(x, 25, C.noir);
  // les coins arrondis (transparents), comme une tuile
  const coin = [[0, 0], [1, 0], [0, 1]];
  for (const [x, y] of coin) for (const [X, Y] of [[x, y], [N - 1 - x, y], [x, N - 1 - y], [N - 1 - x, N - 1 - y]]) d[(Y * N + X) * 4 + 3] = 0;
  return img;
}

const base = dessiner();
const png = (S) => encodePNG(scale(base, S, S));
const B = path.join(ROOT, 'build');
fs.mkdirSync(path.join(B, 'icons'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'store'), { recursive: true });
fs.writeFileSync(path.join(B, 'icon.png'), png(1024));
for (const S of [16, 32, 48, 64, 128, 256, 512]) fs.writeFileSync(path.join(B, 'icons', `${S}x${S}.png`), png(S));
fs.writeFileSync(path.join(B, 'icon.ico'), encodeICO([256, 128, 64, 48, 32, 16].map((size) => ({ size, png: png(size) }))));
fs.writeFileSync(path.join(B, 'icon.icns'), encodeICNS([128, 256, 512, 1024].map((size) => ({ size, png: png(size) }))));
fs.writeFileSync(path.join(ROOT, 'store', 'community_icon_184.png'), png(184));
fs.writeFileSync(path.join(ROOT, 'store', 'client_icon_32.png'), png(32));
fs.writeFileSync(path.join(ROOT, 'store', 'client_icon.ico'), encodeICO([32, 16].map((size) => ({ size, png: png(size) }))));
console.log('icônes écrites : build/icon.png, build/icons/, build/icon.ico, build/icon.icns, store/community_icon_184.png, store/client_icon_32.png, store/client_icon.ico');
