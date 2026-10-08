// ============================================================================
//  LA CLÉ DE LA GRANDE PORTE, EN MAIN (agent Y, quatorzième vague)
//  Le poing serre l'anneau ; la tige monte en biais vers la gauche ; le panneton,
//  au bout, porte ses dents fines comme un peigne. Du fer noir, poli aux arêtes.
//  (VM[cle_grande_porte] : deux images identiques, la clé ne frappe pas.)
// ============================================================================
function y2VmCle() {
  const pb = new PixelBuf(VM_W, VM_H);
  const fer = ramp(['#050505', '#0b0a09', '#121110', '#1a1917', '#252320', '#34312c']);
  const gx = 86, gy = 84;
  vmArm(pb, gx, gy);
  // l'anneau, sous le poing : un ovale ajouré qui dépasse en bas à droite
  for (let a = 0; a < 90; a++) {
    const t = a / 90 * Math.PI * 2;
    for (let r = 7; r <= 10; r += 0.5) {
      const x = Math.round(gx + 9 + Math.cos(t) * r * 0.9), y = Math.round(gy + 10 + Math.sin(t) * r);
      pb.set(x, y, rampPick(fer, 0.45 + Math.cos(t + 0.8) * 0.3 + (r > 9 ? -0.15 : 0.1), x, y));
    }
  }
  // la tige, la bague
  const x0 = gx - 4, y0 = gy - 5, x1 = 32, y1 = 22;
  thickLine(pb, x0, y0, x1, y1, 5.5, fer, 0.7);
  const L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L, px = uy, py = -ux;   // (px, py) : vers le bas-gauche de la tige
  const Q = (t, u) => [x0 + ux * t + px * u, y0 + uy * t + py * u];
  for (let u = -4; u <= 4; u += 0.5) { const [x, y] = Q(14, u); pb.set(Math.round(x), Math.round(y), fer[3]); const [x2, y2] = Q(15.5, u); pb.set(Math.round(x2), Math.round(y2), fer[1]); }
  // le panneton : un bloc qui pend sous le bout de la tige, entaillé de dents
  const t0 = L - 18, t1 = L - 1;
  fillPoly(pb, [Q(t0, 1), Q(t1, 1), Q(t1, 16), Q(t0, 16)], fer, (x, y) => 0.55 - ((x + y) % 7 === 0 ? 0.12 : 0));
  for (let k = 0; k < 6; k++) { const t = t0 + 2 + k * 2.7; for (let u = 10; u <= 16.5; u += 0.5) { const [x, y] = Q(t, u); pb.set(Math.round(x), Math.round(y), [0, 0, 0], 0); } }
  for (let t = t0; t <= t1; t += 0.5) { const [x, y] = Q(t, 1); pb.set(Math.round(x), Math.round(y), [106, 100, 90]); }
  for (let t = 3; t < t0; t += 0.5) { const [x, y] = Q(t, -2.6); pb.set(Math.round(x), Math.round(y), [118, 112, 100]); }   // l'arête de la tige, qui prend la lumière
  // un peu de rouille
  for (const t of [20, 31, 44]) { const [x, y] = Q(t, 0); pb.set(Math.round(x), Math.round(y), [110, 66, 38]); }
  vmFist(pb, gx, gy);
  edgeDarken(pb, 0.8);
  return pb;
}
{
  const _bvm = buildViewModels;
  buildViewModels = function () {
    _bvm();
    try { const f = y2VmCle(); VM[Y2_CLE] = [f, f]; } catch (e) { console.error(e); }
  };
}
