// ============================================================================
//  DÉCOR DE LA GRANDE VALLÉE (3D) : ponts de bois sur la rivière, sigles (pierres
//  posées, traces dans la neige, fêlures dans la glace, stèles gravées, mains
//  peintes sur les parois des galeries), cairns, bouches de galerie, étais de
//  mine, trou de pêche dans la glace.
// ============================================================================

// ---------------------------------------------------------------- les signes
// Chaque signe : des traits (points en unités, -1..1, v vers le haut, épaisseur) et des points.
const SIGIL_GLYPHS = (() => {
  const arc = (cx, cy, r, a0, a1, n) => { const p = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return p; };
  const circ = (cx, cy, r, n) => arc(cx, cy, r, 0, TAU, n || Math.max(10, Math.round(r * 30)));
  const wave = (x0, x1, y, amp, n) => { const p = []; for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n; p.push([x, y + Math.sin(i / n * TAU * 1.5) * amp]); } return p; };
  const L = (p, w) => ({ p, w: w || 0.1 });
  const G = {};
  // la Mère : un cercle posé sur une croix (le ventre et la terre)
  G.mere = { l: [L(circ(0, 0.32, 0.4)), L([[0, -0.08], [0, -0.95]]), L([[-0.36, -0.52], [0.36, -0.52]])], d: [[0, 0.32, 0.1]] };
  // la Dame du lac : un croissant au-dessus des vagues
  { const c = []; for (let i = 0; i <= 14; i++) { const t = -1 + 2 * i / 14; c.push([-Math.sqrt(1 - t * t) * 0.55, 0.3 + t * 0.55]); } for (let i = 14; i >= 0; i--) { const t = -1 + 2 * i / 14; c.push([-Math.sqrt(1 - t * t) * 0.22, 0.3 + t * 0.55]); }
    G.dame = { l: [L(c), L(wave(-0.8, 0.8, -0.5, 0.08, 16)), L(wave(-0.6, 0.6, -0.8, 0.07, 12))], d: [[0.3, 0.55, 0.07]] }; }
  // le Cerf : des bois, une lumière entre eux
  { const l = [L(circ(0, -0.62, 0.2, 12)), L(circ(0, 0.42, 0.15, 10))];
    for (const s of [-1, 1]) {
      l.push(L([[s * 0.12, -0.46], [s * 0.34, -0.12], [s * 0.5, 0.22], [s * 0.46, 0.58], [s * 0.3, 0.92]]));
      l.push(L([[s * 0.34, -0.12], [s * 0.66, -0.04]]), L([[s * 0.5, 0.22], [s * 0.82, 0.36]]), L([[s * 0.47, 0.5], [s * 0.72, 0.78]]));
    }
    G.cerf = { l, d: [] }; }
  // Ceux d'en dessous : sous la ligne du sol, un triangle renversé qui s'enracine
  G.dessous = { l: [L([[-0.95, 0.82], [0.95, 0.82]]), L([[-0.7, 0.58], [0.7, 0.58], [0, -0.55], [-0.7, 0.58]]), L([[0, -0.55], [0, -0.95]]), L([[0, -0.55], [-0.34, -0.9]]), L([[0, -0.55], [0.34, -0.9]])], d: [[0, 0.22, 0.1]] };
  // la croix (celtique)
  G.croix = { l: [L([[0, -0.95], [0, 0.92]], 0.13), L([[-0.58, 0.36], [0.58, 0.36]], 0.13), L(circ(0, 0.36, 0.3))], d: [] };
  // les Treize : treize traits autour d'un cercle, une pierre au centre
  { const l = [L(circ(0, 0, 0.34, 14))]; for (let i = 0; i < 13; i++) { const a = i / 13 * TAU + Math.PI / 2; l.push(L([[Math.cos(a) * 0.6, Math.sin(a) * 0.6], [Math.cos(a) * 0.94, Math.sin(a) * 0.94]])); } G.treize = { l, d: [[0, 0, 0.12]] }; }
  // le soleil
  { const l = [L(circ(0, 0, 0.4, 16))]; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; l.push(L([[Math.cos(a) * 0.54, Math.sin(a) * 0.54], [Math.cos(a) * 0.94, Math.sin(a) * 0.94]])); } G.soleil = { l, d: [[0, 0, 0.1]] }; }
  // la spirale (trois tours)
  { const p = []; for (let i = 0; i <= 72; i++) { const a = i / 72 * 3 * TAU, r = 0.06 + 0.88 * i / 72; p.push([Math.cos(a) * r, Math.sin(a) * r]); } G.spirale = { l: [L(p)], d: [] }; }
  // la main ouverte (doigts vers le haut)
  { const l = [];
    for (let y = -0.84; y <= 0.0; y += 0.11) { const hw = 0.33 - Math.max(0, -0.55 - y) * 0.45; l.push(L([[-hw, y], [hw, y]], 0.13)); }
    for (const [x, h] of [[-0.26, 0.58], [-0.09, 0.8], [0.09, 0.74], [0.26, 0.52]]) l.push(L([[x, -0.02], [x, h]], 0.15));
    l.push(L([[0.3, -0.36], [0.72, 0.04]], 0.15));
    G.main = { l, d: [] }; }
  // les cornes : un croissant renversé sur un cercle
  G.corne = { l: [L(circ(0, -0.38, 0.36, 16)), L(arc(0, 0.42, 0.48, Math.PI, TAU, 12)), L([[-0.48, 0.42], [-0.6, 0.82]]), L([[0.48, 0.42], [0.6, 0.82]])], d: [] };
  // le nœud : trois boucles entrelacées dans un cercle
  { const l = [L(circ(0, 0, 0.92, 26))]; for (let i = 0; i < 3; i++) { const a = Math.PI / 2 + i * TAU / 3; l.push(L(circ(Math.cos(a) * 0.3, Math.sin(a) * 0.3, 0.4, 14))); } G.noeud = { l, d: [] }; }
  // l'œil, et ses larmes
  { const up = [], dn = []; for (let i = 0; i <= 14; i++) { const x = -0.92 + 1.84 * i / 14, y = 0.46 * (1 - (x / 0.92) ** 2); up.push([x, y + 0.12]); dn.push([x, -y * 0.9 + 0.12]); }
    G.oeil = { l: [L(up), L(dn), L(circ(0, 0.12, 0.26, 12)), L([[-0.3, -0.28], [-0.36, -0.7]]), L([[0, -0.3], [0, -0.9]]), L([[0.3, -0.28], [0.36, -0.7]])], d: [[0, 0.12, 0.1]] }; }
  return G;
})();
const SIGIL_COL = { pierre: rgbf('#d4cec0'), pierre2: rgbf('#aaa498'), neige: rgbf('#7486a0'), glace: rgbf('#1e3444'), grave: rgbf('#3a3630'), ocre: rgbf('#a8442a'), ocre2: rgbf('#c0602e') };
// hauteur du sol sous un point local de l'objet (les grands signes épousent le terrain)
function propGroundY(o, lx, lz) {
  const w = typeof game !== 'undefined' && game.world;
  if (!w) return 0;
  const c = Math.cos(o.r || 0), s = Math.sin(o.r || 0);
  return w.heightAt(o.x + lx * c + lz * s, o.z - lx * s + lz * c) - o.y;
}
// signe à plat : pierres (sol), traces (neige), fêlures (glace)
function sigilFlat(E, o, g, s, m) {
  const stones = m === 'sol', col = m === 'glace' ? SIGIL_COL.glace : SIGIL_COL.neige;
  const tw = (w) => clamp(w * s, 0.28, 0.9);
  for (const { p, w } of g.l) {
    if (stones) {
      // des pierres blanchies posées tous les 60 cm
      let acc = 0.3;
      for (let i = 1; i < p.length; i++) {
        const [u0, v0] = p[i - 1], [u1, v1] = p[i], seg = Math.hypot(u1 - u0, v1 - v0) * s;
        while (acc <= seg) {
          const f = seg ? acc / seg : 0, x = (u0 + (u1 - u0) * f) * s, z = -(v0 + (v1 - v0) * f) * s, h = hash2i(Math.round(x * 7), Math.round(z * 7), 5);
          const sz = clamp(0.34 + s * 0.04, 0.45, 0.75) * (0.8 + h * 0.4);
          E.bx(x, propGroundY(o, x, z) - 0.06, z, sz, sz * 0.7, sz * 0.85, h > 0.5 ? SIGIL_COL.pierre : lightc(SIGIL_COL.pierre2, 1.1), TL.stone, h * 6);
          acc += 0.6;
        }
        acc -= seg;
      }
      continue;
    }
    // un sillon qui suit le terrain, par morceaux d'un mètre et demi au plus
    for (let i = 1; i < p.length; i++) {
      const [u0, v0] = p[i - 1], [u1, v1] = p[i];
      const X0 = u0 * s, Z0 = -v0 * s, X1 = u1 * s, Z1 = -v1 * s, seg = Math.hypot(X1 - X0, Z1 - Z0), n = Math.max(1, Math.ceil(seg / 1.5));
      for (let k = 0; k < n; k++) {
        const xa = X0 + (X1 - X0) * k / n, za = Z0 + (Z1 - Z0) * k / n, xb = X0 + (X1 - X0) * (k + 1) / n, zb = Z0 + (Z1 - Z0) * (k + 1) / n;
        const ya = propGroundY(o, xa, za), yb = propGroundY(o, xb, zb), len = seg / n;
        E.box((xa + xb) / 2, (ya + yb) / 2 + 0.03, (za + zb) / 2, tw(w), 0.1, len + tw(w) * 0.6, col, TL.plain, Math.atan2(xb - xa, zb - za), -Math.atan2(yb - ya, len));
      }
    }
  }
  for (const [u, v, r] of g.d) {
    const x = u * s, z = -v * s, y = propGroundY(o, x, z);
    if (stones) { E.bx(x, y - 0.1, z, 0.42 + s * 0.02, 0.9 + s * 0.06, 0.32 + s * 0.015, SIGIL_COL.pierre2, TL.stone, 0.4); continue; }
    const d = clamp(r * s * 2, 0.5, 1.8);
    E.bx(x, y - 0.02, z, d, 0.1, d, col, TL.plain); E.bx(x, y - 0.02, z, d, 0.1, d, col, TL.plain, Math.PI / 4);
  }
}
// signe sur un plan vertical (xy local), face vers -z (stèle) ou +z tourné vers -z (paroi)
function sigilWall(E, g, gs, cy, pz, rot, col, col2) {
  const c = Math.cos(rot), sn = Math.sin(rot), P = (u, v) => [(u * c - v * sn) * gs, cy + (u * sn + v * c) * gs];
  let n = 0;
  for (const { p, w } of g.l) for (let i = 1; i < p.length; i++) {
    const [x0, y0] = P(p[i - 1][0], p[i - 1][1]), [x1, y1] = P(p[i][0], p[i][1]), len = Math.hypot(x1 - x0, y1 - y0);
    E.box((x0 + x1) / 2, (y0 + y1) / 2, pz, len + w * gs * 0.7, w * gs, 0.02, col2 && (n++ % 5 === 2) ? col2 : col, TL.plain, 0, 0, Math.atan2(y1 - y0, x1 - x0));
  }
  for (const [u, v, r] of g.d) { const [x, y] = P(u, v); E.box(x, y, pz, r * gs * 2, r * gs * 2, 0.02, col, TL.plain, 0, 0, Math.PI / 4); }
}

Object.assign(PROP_MODELS, {
  // ------------------------------------------------------------ pont de bois en dos d'âne (données : longueur, largeur, hauteurs au-dessus de l'eau)
  pont_bois(E, o) {
    const d = o.data || {}, L = d.L || 20, W = d.w || 3.2, a = d.a ?? 0.5, b = d.b ?? 0.5, t = d.t ?? 1.6, hw = W / 2;
    const prof = (u) => lerp(t, u < 0.5 ? a : b, Math.pow(Math.abs(u - 0.5) * 2, 2.2));
    const n = Math.max(8, Math.ceil(L / 0.8));
    for (let i = 0; i < n; i++) {
      const u0 = i / n, u1 = (i + 1) / n, y0 = prof(u0), y1 = prof(u1), z0 = -L / 2 + u0 * L, z1 = -L / 2 + u1 * L;
      const len = Math.hypot(z1 - z0, y1 - y0), rx = -Math.atan2(y1 - y0, z1 - z0), zc = (z0 + z1) / 2, yc = (y0 + y1) / 2;
      E.box(0, yc - 0.06, zc, W, 0.12, len + 0.03, i % 3 === 1 ? [0.84, 0.8, 0.76] : i % 3 === 2 ? [0.94, 0.9, 0.86] : WHITE, TL.wood, 0, rx);
      for (const s of [-1, 1]) {
        E.box(s * (hw - 0.16), yc - 0.26, zc, 0.2, 0.26, len + 0.03, WHITE, TL.darkwood, 0, rx);
        E.box(s * (hw + 0.02), yc + 0.96, zc, 0.1, 0.09, len + 0.03, WHITE, TL.wood, 0, rx);
        E.box(s * (hw + 0.02), yc + 0.45, zc, 0.06, 0.06, len + 0.03, WHITE, TL.darkwood, 0, rx);
      }
    }
    const np = Math.max(2, Math.round(L / 2.2));
    for (let k = 0; k <= np; k++) {
      const u = k / np, z = -L / 2 + u * L, y = prof(u);
      for (const s of [-1, 1]) {
        E.bx(s * (hw + 0.02), y - 0.12, z, 0.14, 1.16, 0.14, WHITE, TL.darkwood);
        if (k > 0 && k < np && k % 2 === 0) E.bx(s * (hw - 0.22), -2.4, z, 0.28, y + 2.4 - 0.34, 0.28, WHITE, TL.bark);
      }
      if (k > 0 && k < np && k % 2 === 0) E.box(0, -0.25, z, W - 0.3, 0.2, 0.22, WHITE, TL.darkwood); // moise
    }
  },
  // ------------------------------------------------------------ sigle (data : k = signe, m = manière, s = taille, dir = sens d'une main peinte)
  sigle(E, o) {
    const d = o.data || {}, g = SIGIL_GLYPHS[d.k] || SIGIL_GLYPHS.soleil, s = d.s || 1, m = d.m || 'stele';
    if (m === 'sol' || m === 'neige' || m === 'glace') { sigilFlat(E, o, g, s, m); return; }
    if (m === 'paroi') { sigilWall(E, g, s, 0, 0.13, -Math.PI / 2 + (d.dir || 0), SIGIL_COL.ocre, SIGIL_COL.ocre2); return; }
    // stèle : une dalle dressée, le signe gravé sur la face avant
    const W = 0.9 * s, Hh = 1.7 * s, T = 0.28 * s, h = hash2i(Math.round(o.x), Math.round(o.z), 9);
    E.bx(0, -0.3, 0, W, Hh + 0.3 - 0.12 * s, T, [0.62 + h * 0.08, 0.6 + h * 0.06, 0.56], TL.stone, 0, 0, (h - 0.5) * 0.06);
    E.bx(0, Hh - 0.14 * s, 0, W * 0.82, 0.16 * s, T * 0.94, [0.6, 0.58, 0.55], TL.stone, 0, 0, (h - 0.5) * 0.06);
    E.bx(0, -0.1, 0, W * 1.35, 0.2, T * 2.2, [0.5, 0.48, 0.45], TL.stone, 0.2); // socle
    sigilWall(E, g, 0.33 * s, 0.95 * s, -T / 2 - 0.006, 0, SIGIL_COL.grave);
    if (d.k === 'mere' || d.k === 'dame' || d.k === 'cerf') for (let i = 0; i < 3; i++) E.bx(-0.3 * s + i * 0.3 * s, 0, -T - 0.18, 0.1, 0.06, 0.1, i === 1 ? rgbf('#c8a040') : rgbf('#e8e0d0'), TL.plain); // offrandes
  },
  // ------------------------------------------------------------ cairn de la piste
  cairn(E, o) {
    const h = hash2i(Math.round(o.x), Math.round(o.z), 11);
    let y = -0.1;
    const S = [[0.95, 0.36], [0.78, 0.32], [0.62, 0.3], [0.48, 0.26], [0.36, 0.22], [0.24, 0.18]];
    for (let i = 0; i < S.length; i++) {
      const [s, t] = S[i], c = 0.52 + ((i * 37 + Math.round(h * 100)) % 7) * 0.035;
      E.bx(Math.sin(i * 2.3 + h * 6) * 0.05, y, Math.cos(i * 1.7 + h) * 0.05, s, t, s * 0.84, [c, c * 0.98, c * 0.94], TL.stone, i * 0.9 + h * 3, (i % 2 - 0.5) * 0.08);
      y += t * 0.9;
    }
  },
  // ------------------------------------------------------------ bouche de galerie (puits boisé) ou faille (data.petite)
  bouche_mine(E, o) {
    if (o.data && o.data.petite) {
      E.bx(0, -0.05, 0, 0.7, 0.07, 2.2, [0.02, 0.02, 0.02], TL.plain);
      for (const s of [-1, 1]) {
        E.bx(s * 0.95, -0.4, 0, 1.2, 2.6, 2.6, [0.55, 0.54, 0.52], TL.stone, s * 0.12, 0, s * 0.18);
        E.bx(s * 0.8, -0.3, 1.5 * s, 0.8, 0.7, 0.9, [0.5, 0.49, 0.47], TL.stone, s);
      }
      E.bx(0.3, 0, -1.4, 0.4, 0.25, 0.35, [0.5, 0.49, 0.47], TL.stone, 0.7);
      return;
    }
    E.bx(0, -0.35, 0, 2.6, 0.45, 2.6, [0.55, 0.53, 0.5], TL.stone); // margelle
    E.bx(0, 0.06, 0, 1.7, 0.06, 1.7, [0.015, 0.015, 0.015], TL.plain); // le trou
    for (const s of [-1, 1]) { E.bx(s * 1.0, 0.04, 0, 0.3, 0.26, 2.3, WHITE, TL.bark); E.bx(0, 0.04, s * 1.0, 2.3, 0.26, 0.3, WHITE, TL.bark); }
    for (const s of [-1, 1]) { // chevalement
      E.box(s * 1.15, 1.6, -0.55, 0.16, 3.3, 0.16, WHITE, TL.darkwood, 0, 0.33); E.box(s * 1.15, 1.6, 0.55, 0.16, 3.3, 0.16, WHITE, TL.darkwood, 0, -0.33);
      E.box(s * 0.28, 0.9, 0, 0.07, 1.9, 0.07, WHITE, TL.wood); // montants d'échelle
    }
    E.box(0, 3.15, 0, 2.6, 0.2, 0.2, WHITE, TL.darkwood);
    E.box(0, 2.9, 0, 0.1, 0.62, 0.62, PC4.iron, TL.iron); E.box(0, 2.9, 0, 0.1, 0.62, 0.62, PC4.iron, TL.iron, 0, 0.785);
    E.bx(0, 0.1, 0.2, 0.03, 2.75, 0.03, PC4.rope, TL.plain);
    for (let y = 0.3; y < 1.8; y += 0.36) E.bx(0, y, 0, 0.56, 0.05, 0.05, WHITE, TL.darkwood);
    E.bx(1.7, 0, -1.2, 0.09, 1.4, 0.09, WHITE, TL.darkwood); E.bx(1.7, 1.0, -1.25, 0.7, 0.36, 0.05, WHITE, TL.sign);
  },
  // ------------------------------------------------------------ étai de galerie (en travers d'un couloir de trois mètres)
  etai(E) {
    const H = MAZE.Hc;
    for (const s of [-1, 1]) { E.bx(s * 1.36, 0, 0, 0.22, H - 0.28, 0.22, WHITE, TL.bark); E.box(s * 1.1, H - 0.62, 0, 0.12, 0.66, 0.12, WHITE, TL.darkwood, 0, 0, s * 0.72); }
    E.bx(0, H - 0.3, 0, 2.96, 0.28, 0.26, WHITE, TL.darkwood);
  },
  // ------------------------------------------------------------ trou de pêche dans la glace
  trou_glace(E) {
    E.bx(0, -0.02, 0, 1.2, 0.05, 1.2, [0.03, 0.08, 0.12], TL.plain); E.bx(0, -0.02, 0, 1.2, 0.05, 1.2, [0.03, 0.08, 0.12], TL.plain, Math.PI / 4);
    for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; E.bx(Math.cos(a) * 1.0, -0.04, Math.sin(a) * 1.0, 0.42, 0.14 + (i % 3) * 0.06, 0.3, [0.78, 0.9, 0.97], TL.plain, a); }
    E.bx(1.6, 0, 0.4, 0.38, 0.4, 0.38, WHITE, TL.wood); // tabouret
    E.bx(-1.5, 0, 0.7, 0.34, 0.36, 0.34, PC4.iron, TL.iron); E.bx(-1.5, 0.3, 0.7, 0.28, 0.04, 0.28, [0.2, 0.3, 0.36], TL.plain); // seau
    E.box(0.9, 0.35, -0.9, 0.03, 0.03, 1.6, WHITE, TL.wood, 0.7, -0.35); // canne posée
  },
});
Object.assign(PROP_COLL, { pont_bois: null, sigle: null, cairn: [0.45, 0.4, 1.3], bouche_mine: null, etai: null, trou_glace: null });
