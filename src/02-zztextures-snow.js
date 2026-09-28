// ============================================================================
//  NEIGE ET GLACE : deux sols en plus (montagnes, glacier, lac gelé, crevasses) ;
//  FALAISE : la roche en strates des pentes raides (projetée à la verticale)
// ============================================================================
const M_SNOW = 33, M_ICE = 34, M_CLIFF = 35;
function texSnow(seed) {
  const pal = ramp(['#b8c2cc', '#c8d1da', '#d6dee6', '#e2e8ee', '#edf1f5', '#f6f8fa']);
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed), rnd = mulberry32(seed + 3);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const drift = Math.sin((x * 0.7 + y + tileFbm(tn, x / 20, y / 20, 6.4, 2) * 18) * (TAU / 32)) * 0.08;
    const v = 0.62 + drift + (tn(x / 3, y / 3, 42.67) - 0.5) * 0.28;
    pb.set(x, y, rampPick(pal, v, x, y));
  }
  for (let k = 0; k < 90; k++) pb.setW(rnd() * TS, rnd() * TS, [255, 255, 255]); // éclats
  for (let k = 0; k < 40; k++) pb.setW(rnd() * TS, rnd() * TS, pal[0]);
  return pb;
}
function texIce(seed) {
  const pal = ramp(['#4f7d97', '#6594ad', '#7dabc2', '#97c1d4', '#b3d6e4', '#d2eaf2']);
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed), wor = makeWorley(seed, 4);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const w = wor(x / TS * 4, y / TS * 4);
    let v = 0.58 + (tn(x / 10, y / 10, 12.8) - 0.5) * 0.35;
    if (w.f2 - w.f1 < 0.035) v = 0.95; // fêlures blanches
    else if (w.f2 - w.f1 < 0.07) v -= 0.18;
    pb.set(x, y, rampPick(pal, v, x, y));
  }
  return pb;
}
// strates horizontales, diaclases verticales, rebords éclairés
function texCliff(seed) {
  const pal = ramp(['#302f2c', '#3e3c38', '#4c4a45', '#5c5953', '#6d6a63', '#807c74', '#948f86', '#a8a398']);
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed), rnd = mulberry32(seed + 9);
  const layers = [];
  for (let y = 0; y < TS;) { const t = Math.min(TS - y, 7 + ((rnd() * 18) | 0)); layers.push({ y0: y, t, tone: 0.3 + rnd() * 0.42, joints: Array.from({ length: 2 + ((rnd() * 4) | 0) }, () => (rnd() * TS) | 0) }); y += t; }
  for (const L of layers) for (let y = L.y0; y < L.y0 + L.t; y++) for (let x = 0; x < TS; x++) {
    const ly = y - L.y0;
    let v = L.tone + (tileFbm(tn, x / 10, y / 4, 12.8, 3) - 0.5) * 0.38 + (tn(x / 2, y / 6, 64) - 0.5) * 0.1;
    if (ly === 0) v -= 0.3; // joint de strate
    else if (ly === 1) v += 0.14; // rebord éclairé
    else if (ly === L.t - 1) v -= 0.1;
    for (const jx of L.joints) { const dx = Math.abs(((x - jx + TS * 1.5) % TS) - TS / 2); if (dx < 0.8 + (ly % 3 === 0 ? 0.6 : 0)) v -= 0.28; else if (dx < 1.8) v += 0.05; }
    pb.set(x, y, rampPick(pal, v, x, y));
  }
  return pb;
}
MATERIALS.push(
  { id: 'snow', name: 'Neige', terrain: true, scale: 4, gen: () => texSnow(44) },
  { id: 'ice', name: 'Glace', terrain: true, scale: 4, gen: () => texIce(45) },
  { id: 'cliff', name: 'Falaise', terrain: true, scale: 4, gen: () => texCliff(46) },
);
TERRAIN_MATS.push(M_SNOW, M_ICE, M_CLIFF);
