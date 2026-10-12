// ============================================================================
//  LES GROTTES DE LA CHUTE (agent P18) — 3. LE RÉSEAU SOUS LES MONTS DE L'OUEST
//  Le moteur du Dessous (11-zzzz9-souterrain0.js) creuse son sol et sa voûte
//  d'après des « creuseurs » ; on lui en ajoute (salles, galeries, un lac, une
//  rivière en gradins, des vasques), après les siens et loin d'eux (x < 760 ;
//  le Dessous commence à x 840) : sa grille, son rendu, la marche, l'eau d'en bas
//  servent tels quels. Aucune galerie ne relie les deux réseaux (au bout, un
//  éboulis : derrière, on entend la Mer muette).
//  Ici : les creuseurs (une fois, à la première lecture du plan), quelques
//  boyaux tirés au sort (graine fixe), la décoration et ce qu'on trouve (bit
//  VER_SOUS : n'existe que dessous), les repères vers la sortie, les nids.
//  API : p18Grotte (creuseurs(), dans(x, z), salle(x, z), graphe(), garnir(w, B, rnd)).
// ============================================================================

// ---------------------------------------------------------------- deux sortes de creuseurs en plus
// la rivière en gradins : un lit sous l'eau (niveau du tronçon), une berge en pente douce pour marcher
SOUT_EV.p18torrent = function (c, x, z, S) {
  const dx = c.bx - c.ax, dz = c.bz - c.az, L2 = dx * dx + dz * dz || 1;
  let t = ((x - c.ax) * dx + (z - c.az) * dz) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t;
  const qx = c.ax + dx * t, qz = c.az + dz * t, d = Math.hypot(x - qx, z - qz);
  const rr = c.r * (1 + 0.12 * SOUT_NW(x * 0.05, z * 0.05));
  if (d >= rr) return false;
  const u = d / rr, lit = 0.46 + 0.06 * SOUT_NW(x * 0.04 + 11, z * 0.04);
  const berge = lerp(c.ya, c.yb, t) + SOUT_NF(x * 0.07, z * 0.07) * 0.25;
  S.f = lerp(c.eau - 1.4, berge, smoothstep(lit - 0.1, lit + 0.08, u)) + 2.2 * Math.pow(u, 6);
  const cl = 9 * (0.85 + 0.25 * SOUT_NV(x * 0.03, z * 0.03));
  S.v = berge + cl * Math.sqrt(1 - u * u) + SOUT_NV(x * 0.13, z * 0.13) * 0.7 - soutPointe(x, z, cl);
  S.fm = u < lit ? M_SROCHE : M_SARGILE; S.vm = M_SROCHE;
  return true;
};
// une vasque de calcite (les gours) : un rebord relevé, de l'eau dedans
SOUT_POST.p18gour = function (c, x, z, F, V, k) {
  if (V[k] - F[k] < 0.5) return;
  const d = Math.hypot(x - c.cx, z - c.cz) / (c.r * (1 + 0.12 * SOUT_NW(x * 0.2, z * 0.2 + 5)));
  if (d >= 1.25) return;
  if (d < 0.86) F[k] = Math.max(F[k] - 0.2, c.eau - 0.7);
  else F[k] = Math.max(F[k], lerp(c.eau + 0.22, F[k], smoothstep(1.02, 1.25, d)));
};

const P18_MAT = { roche: M_SROCHE, calcite: M_SCALCITE, argile: M_SARGILE, humus: M_SHUMUS, soufre: M_SSOUFRE };

const p18Grotte = {
  _L: null, _post: null, _br: null,
  // ------------------------------------------------------------ dans la boîte des grottes ?
  dans(x, z) { const B = P18_GROTTE.boite; return x > B[0] && x < B[2] && z > B[1] && z < B[3]; },
  // la salle (ou le lac) où l'on est vraiment (dans l'ellipse), sinon le torrent, sinon null
  salle(x, z) {
    if (!this.dans(x, z)) return null;
    for (const L of [P18_GROTTE.salles, P18_GROTTE.lacs]) for (const [key, cx, cz, rx, rz, rot] of L) {
      const co = Math.cos(rot || 0), si = Math.sin(rot || 0), dx = x - cx, dz = z - cz, lx = dx * co - dz * si, lz = dx * si + dz * co;
      if ((lx / rx) * (lx / rx) + (lz / rz) * (lz / rz) < 1.1) return key;
    }
    const T = P18_GROTTE.torrent;
    for (let i = 0; i + 1 < T.length; i++) { const [ax, az, , ar] = T[i], [bx, bz] = T[i + 1]; const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz, t = clamp(((x - ax) * dx + (z - az) * dz) / L2, 0, 1); if (Math.hypot(x - ax - dx * t, z - az - dz * t) < ar * 1.3) return 'torrent'; }
    return null;
  },

  // ------------------------------------------------------------ les creuseurs (comme le moteur les veut)
  creuseurs() {
    if (this._L) return { L: this._L, post: this._post };
    const P = P18_GROTTE, L = [], post = [];
    const box = (c, x0, z0, x1, z1) => { c.x0 = x0; c.z0 = z0; c.x1 = x1; c.z1 = z1; c.p18 = 1; return c; };
    for (const [key, x, z, rx, rz, rot, y, cl, fm, vm, o] of P.salles) {
      const R = Math.max(rx, rz) * 1.25;
      L.push(box({ k: 'salle', key: 'p18_' + key, cx: x, cz: z, rx, rz, co: Math.cos(rot), si: Math.sin(rot), y, cl, fm: P18_MAT[fm], vm: P18_MAT[vm], und: (o && o.und) || 0.6, bowl: (o && o.bowl) || 3 }, x - R, z - R, x + R, z + R));
    }
    for (const [key, x, z, rx, rz, rot, fond, cl] of P.lacs) {
      const R = Math.max(rx, rz) * 1.2;
      L.push(box({ k: 'lac', key: 'p18_' + key, cx: x, cz: z, rx, rz, co: Math.cos(rot), si: Math.sin(rot), fond, cl }, x - R, z - R, x + R, z + R));
    }
    // la rivière en gradins : chaque tronçon recoupé en marches de dix mètres au plus
    for (const s of this.torrent()) {
      const R = s.r * 1.2;
      L.push(box({ k: 'p18torrent', key: 'p18_torrent', ax: s.ax, az: s.az, bx: s.bx, bz: s.bz, ya: s.ya, yb: s.yb, eau: s.eau, r: s.r }, Math.min(s.ax, s.bx) - R, Math.min(s.az, s.bz) - R, Math.max(s.ax, s.bx) + R, Math.max(s.az, s.bz) + R));
    }
    // les galeries : leurs bouts prennent la hauteur du sol qu'ils trouvent dans une salle (comme celles du Dessous)
    const S0 = {}, bases = L.slice();
    const sol = (x, z) => { let f = null; for (const c of bases) if (x >= c.x0 && x <= c.x1 && z >= c.z0 && z <= c.z1 && SOUT_EV[c.k](c, x, z, S0)) f = f === null ? S0.f : Math.min(f, S0.f); return f; };
    const tubes = (key, pts, fm, vm, o) => {
      pts = pts.map((q) => q.slice());
      for (const i of [0, pts.length - 1]) { const f = sol(pts[i][0], pts[i][1]); if (f !== null) pts[i][2] = Math.max(SOUT_WL + 1.1, f + 0.05); }
      for (let i = 0; i + 1 < pts.length; i++) {
        const [ax, az, ay, ar, ac] = pts[i], [bx, bz, by, br, bc] = pts[i + 1], R = Math.max(ar, br) * 1.35;
        L.push(box({ k: 'tube', key: 'p18_' + key, ax, az, ay, ar, ac, bx, bz, by, br, bc, fm, vm, und: (o && o.und) || 0.5, lisse: !!(o && o.lisse) }, Math.min(ax, bx) - R, Math.min(az, bz) - R, Math.max(ax, bx) + R, Math.max(az, bz) + R));
      }
      return pts;
    };
    // un bout de galerie dans une salle (ou le lac) : vers le point voisin, aux huit dixièmes du bord
    const bout = (k, vers, q, mod) => {
      const Q = P.salles.find((s) => s[0] === k) || P.lacs.find((s) => s[0] === k);
      const [, cx, cz, rx, rz, rot] = Q, co = Math.cos(rot), si = Math.sin(rot);
      const dx = vers[0] - cx, dz = vers[1] - cz, d = Math.hypot(dx, dz) || 1, ux = dx / d, uz = dz / d;
      const lx = ux * co - uz * si, lz = ux * si + uz * co, qq = Math.hypot(lx / rx, lz / rz), s = (q || 0.8) / qq;
      return [cx + ux * s, cz + uz * s, 0, mod[3], mod[4]];
    };
    this._gal = P.galeries.map(([key, a, b, mid, fm, vm, o]) => {
      const A = bout(a, mid[0], P.lacs.some((s) => s[0] === a) ? 0.86 : 0.8, mid[0]), Z = bout(b, mid[mid.length - 1], P.lacs.some((s) => s[0] === b) ? 0.86 : 0.8, mid[mid.length - 1]);
      return [key, tubes(key, [A, ...mid, Z], P18_MAT[fm], P18_MAT[vm], o), a, b];
    });
    for (const c of L) if (!bases.includes(c)) bases.push(c);
    // des boyaux de traverse, tirés au sort (graine fixe) : jamais à travers une autre galerie, jamais hors de la boîte
    this._br = [];
    const rnd = mulberry32(0x18b07a00), src = this._gal.filter(([k]) => !['g_sanctuaire'].includes(k));
    for (let n = 0; n < 40 && this._br.length < 16; n++) {
      const [, pts] = src[(rnd() * src.length) | 0], i = (rnd() * (pts.length - 1)) | 0, t = 0.25 + rnd() * 0.5;
      const A = pts[i], B = pts[i + 1];
      const x0 = lerp(A[0], B[0], t), z0 = lerp(A[1], B[1], t), y0 = lerp(A[2], B[2], t);
      const dir = Math.atan2(B[0] - A[0], B[1] - A[1]) + (rnd() < 0.5 ? 1 : -1) * (1.0 + rnd() * 0.8);
      const len = 26 + rnd() * 50, segs = 2 + ((rnd() * 2) | 0), Q = [[x0, z0, y0, 2.4, 4.2]];
      let x = x0, z = z0, y = y0, a = dir, ok = true;
      for (let s = 0; s < segs; s++) {
        a += (rnd() - 0.5) * 0.8;
        const l = len / segs; x += Math.sin(a) * l; z += Math.cos(a) * l; y += (rnd() - 0.5) * l * 0.12;
        if (!this.dans(x, z) || !this.dans(x + Math.sin(a) * 12, z + Math.cos(a) * 12)) { ok = false; break; }
        Q.push([x, z, Math.max(SOUT_WL + 2, Math.min(y, SOUT_VMAX - 14)), 1.9 + rnd() * 1.2, 2.6 + rnd() * 2.6]);
      }
      if (!ok || Q.length < 2) continue;
      // rien ne doit couper une autre galerie, une salle, le lac ou la rivière (on part de la galerie, on n'y revient pas)
      let bad = false;
      for (let s = 0; s + 1 < Q.length && !bad; s++) {
        const P0 = Q[s], P1 = Q[s + 1], l = Math.hypot(P1[0] - P0[0], P1[1] - P0[1]);
        for (let u = s ? 0 : 9; u <= l + 6 && !bad; u += 3) { const xx = lerp(P0[0], P1[0], Math.min(1, u / l)), zz = lerp(P0[1], P1[1], Math.min(1, u / l)); if (sol(xx, zz) !== null) bad = true; }
      }
      // ni trop près d'un boyau déjà tiré
      for (const b of this._br) if (!bad) for (const q of b.pts) for (const r of Q) if (Math.hypot(q[0] - r[0], q[1] - r[1]) < 14) bad = true;
      if (bad) continue;
      const fin = Q[Q.length - 1], k = 'boyau' + this._br.length;
      const salleFin = rnd() < 0.5 ? [fin[0], fin[1], fin[2], 5 + rnd() * 5, 4 + rnd() * 4] : null;
      tubes(k, Q, M_SROCHE, M_SROCHE, null);
      if (salleFin) { const [sx, sz, sy, sr, scl] = salleFin; L.push(box({ k: 'salle', key: 'p18_' + k + '_s', cx: sx, cz: sz, rx: sr, rz: sr * (0.7 + hash2i(sx | 0, sz | 0, 3) * 0.5), co: 1, si: 0, y: sy, cl: scl, fm: M_SROCHE, vm: M_SROCHE, und: 0.5, bowl: 2 }, sx - sr * 1.3, sz - sr * 1.3, sx + sr * 1.3, sz + sr * 1.3)); }
      this._br.push({ key: k, pts: Q, fin: salleFin });
      for (const c of L) if (!bases.includes(c)) bases.push(c);
    }
    // retouches : la cheminée de l'aven, le gouffre du puits, les piliers, l'îlot du lac, les vasques (gours, Tonnerre)
    for (const [x, z, r, top] of P.cheminees) post.push(box({ k: 'cheminee', cx: x, cz: z, r, top }, x - r - 3, z - r - 3, x + r + 3, z + r + 3));
    for (const [x, z, r, fond] of P.gouffres) post.push(box({ k: 'gouffre', cx: x, cz: z, r, fond }, x - r * 1.3, z - r * 1.3, x + r * 1.3, z + r * 1.3));
    for (const [x, z, r, top] of P.ilots) post.push(box({ k: 'ilot', cx: x, cz: z, r, top }, x - r * 1.7, z - r * 1.7, x + r * 1.7, z + r * 1.7));
    for (const [x, z, r] of P.piliers) post.push(box({ k: 'pilier', cx: x, cz: z, r }, x - r * 1.25, z - r * 1.25, x + r * 1.25, z + r * 1.25));
    for (const [x, z, r, eau] of P.gours) post.push(box({ k: 'p18gour', cx: x, cz: z, r, eau }, x - r * 1.3, z - r * 1.3, x + r * 1.3, z + r * 1.3));
    const V = this.vasque();
    post.push(box({ k: 'gouffre', cx: V.x, cz: V.z, r: V.r, fond: V.eau - 1.6 }, V.x - V.r * 1.3, V.z - V.r * 1.3, V.x + V.r * 1.3, V.z + V.r * 1.3));
    this._L = L; this._post = post;
    return { L, post };
  },
  // la vasque au pied de la chute du Tonnerre (l'eau qui tombe de la voûte)
  vasque() { const T = P18_GROTTE.torrent[0], Q = P18_GROTTE.salles.find((q) => q[0] === 'tonnerre'); return { x: T[0] - 6, z: T[1] - 13, r: 6.5, eau: Q[6] - 0.35 }; },
  // les tronçons de la rivière (des marches de dix mètres au plus) : { ax, az, bx, bz, ya, yb (berge), eau, r }
  torrent() {
    if (this._tr) return this._tr;
    const T = P18_GROTTE.torrent, out = [];
    for (let i = 0; i + 1 < T.length; i++) {
      const [ax, az, ya, ar] = T[i], [bx, bz, yb, br] = T[i + 1], l = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.ceil(l / 10));
      for (let s = 0; s < n; s++) {
        const t0 = s / n, t1 = (s + 1) / n, y0 = lerp(ya, yb, t0), y1 = lerp(ya, yb, t1);
        out.push({ ax: lerp(ax, bx, t0), az: lerp(az, bz, t0), bx: lerp(ax, bx, t1), bz: lerp(az, bz, t1), ya: y0, yb: y1, eau: Math.max(SOUT_WL, y1 - 0.75), r: lerp(ar, br, t0) });
      }
    }
    return (this._tr = out);
  },
  // ------------------------------------------------------------ dans le moteur : après ses creuseurs, les nôtres
  injecter(S) {
    const { L, post } = this.creuseurs();
    const n0 = S._cv.length, p0 = S._post.length;
    for (const c of L) S._cv.push(c);
    for (const c of post) S._post.push(c);
    const BK = S.BK, bw = S._bw, bk = S._bk;
    const add = (list, idx, c) => {
      for (let j = Math.max(0, Math.floor(c.z0 / BK)); j <= Math.min(bw - 1, Math.floor(c.z1 / BK)); j++) for (let i = Math.max(0, Math.floor(c.x0 / BK)); i <= Math.min(bw - 1, Math.floor(c.x1 / BK)); i++) {
        const q = j * bw + i; (bk[q] || (bk[q] = [[], []]))[list].push(idx);
      }
    };
    L.forEach((c, i) => add(0, n0 + i, c)); post.forEach((c, i) => add(1, p0 + i, c));
  },

  // ------------------------------------------------------------ le graphe des salles (pour les flèches, le carnet, la vérification)
  // { noeuds: { clé: [x, z] }, liens: [[a, b, galerie]] } — une galerie relie les deux salles où tombent ses bouts
  graphe() {
    if (this._g) return this._g;
    this.creuseurs();
    const N = {};
    for (const [k, x, z] of P18_GROTTE.salles) N[k] = [x, z];
    for (const [k, x, z] of P18_GROTTE.lacs) N[k] = [x, z];
    N.torrent = [P18_GROTTE.torrent[4][0], P18_GROTTE.torrent[4][1]];
    const liens = [];
    for (const [k, , a, b] of this._gal) liens.push([a, b, k]);
    liens.push(['tonnerre', 'torrent', 'torrent'], ['torrent', 'lac', 'torrent']);
    return (this._g = { noeuds: N, liens });
  },
  // le chemin le plus court (en salles) d'une salle vers le vestibule : la salle suivante
  versSortie(k) {
    const G = this.graphe(), D = { vestibule: 0 }, Q = ['vestibule'];
    while (Q.length) { const a = Q.shift(); for (const [p, q] of G.liens) { const b = p === a ? q : q === a ? p : null; if (b && D[b] === undefined) { D[b] = D[a] + 1; Q.push(b); } } }
    let best = null;
    for (const [p, q, g] of G.liens) { const b = p === k ? q : q === k ? p : null; if (b && D[b] !== undefined && (best === null || D[b] < D[best[0]])) best = [b, g]; }
    return best;
  },

  // ------------------------------------------------------------ la décoration et ce qu'on trouve (à la génération)
  garnir(w, B, rnd) {
    const S = souterrain;
    S.creuseurs();
    const P = P18_GROTTE, R = { props0: w.props.length, inter0: w.inter.length, nids: [], trouvailles: [], peintures: [], signes: [], fleches: 0, cueillettes: 0, eaux: 0, objets: 0 };
    const WR = w.p18;
    const pose = (id, x, z, r, data, s, plafond, y) => B.prop(id, x, y !== undefined ? y : plafond ? S.vaultAt(x, z) : S.floorAt(x, z), z, r, data, s, VER_SOUS);
    // la paroi la plus proche dans la direction a, depuis (x, z) : sa distance (ou null)
    const paroi = (x, z, a, max) => { for (let d = 0.3; d < (max || 6); d += 0.2) if (!ouvert(x + Math.cos(a) * d, z + Math.sin(a) * d, 1.2)) return d; return null; };
    const ouvert = (x, z, h) => S.ouvert(x, z, h || 1.6);
    const pris = [];
    const loin = (x, z, d) => { for (const q of pris) if (Math.abs(q[0] - x) < d && Math.abs(q[1] - z) < d && Math.hypot(q[0] - x, q[1] - z) < d) return false; return true; };
    // une place convenable (au sol, au sec, à plat), près d'un mur ou non
    const place = (x, z, o) => {
      o = o || {};
      if (!ouvert(x, z, o.h || 1.8)) return false;
      const f = S.floorAt(x, z);
      if (f < SOUT_WL + 0.4 || this.mouille(x, z, f)) return false;
      for (let a = 0; a < 6; a++) { const b = a / 6 * TAU, xx = x + Math.cos(b) * (o.r || 0.9), zz = z + Math.sin(b) * (o.r || 0.9); if (!ouvert(xx, zz, 1.2) || Math.abs(S.floorAt(xx, zz) - f) > 0.9) return false; }
      if (o.mur) { let m = null; for (let a = 0; a < 12 && m === null; a++) { const b = a / 12 * TAU; if (!ouvert(x + Math.cos(b) * 2.6, z + Math.sin(b) * 2.6, 1.2)) m = b; } if (m === null) return false; return m; }
      return true;
    };
    // des points tirés dans une salle
    const dansSalle = (key, n, f) => {
      const Q = P.salles.find((q) => q[0] === key) || P.lacs.find((q) => q[0] === key);
      if (!Q) return 0;
      const [, cx, cz, rx, rz, rot] = Q, co = Math.cos(rot), si = Math.sin(rot);
      let m = 0;
      for (let t = 0; t < n * 18 && m < n; t++) {
        const a = rnd() * TAU, r = Math.sqrt(rnd()) * 0.95, lx = Math.cos(a) * r * rx, lz = Math.sin(a) * r * rz;
        const x = cx + lx * co + lz * si, z = cz - lx * si + lz * co;
        if (f(x, z)) m++;
      }
      return m;
    };
    const cueille = (id, x, z, r, data, s, plafond) => { const q = pose(id, x, z, r, Object.assign({ k: 'p18c' + R.cueillettes++ }, data), s, plafond); (w.soutCueillettes || (w.soutCueillettes = [])).push(w.props.length - 1); pris.push([x, z]); return q; };
    const deco = (key, id, n, o) => dansSalle(key, n, (x, z) => {
      o = o || {};
      if (!loin(x, z, o.loin || 2.2)) return false;
      if (o.plafond) { if (!ouvert(x, z, o.h || 3.2)) return false; if (S.vaultAt(x, z) - S.floorAt(x, z) > (o.hmax || 40)) return false; }
      else { const m = place(x, z, o); if (m === false) return false; }
      if (o.cueille) cueille(id, x, z, rnd() * TAU, o.data && o.data(), o.s && o.s(), o.plafond);
      else { pose(id, x, z, rnd() * TAU, o.data && o.data(), o.s && o.s(), o.plafond); pris.push([x, z]); }
      return true;
    });
    // ---- les salles
    deco('vestibule', 'sout_stalac', 8, { plafond: true }); deco('vestibule', 'sout_stalag', 3, { r: 1.2 });
    deco('mains', 'sout_stalac', 5, { plafond: true });
    deco('cristaux', 'sout_cristal', 44, { mur: true, loin: 1.3, s: () => 0.7 + rnd() * 1.1 }); deco('cristaux', 'sout_stalac', 10, { plafond: true });
    deco('cristaux', 'sout_filon', 4, { mur: true, cueille: true, data: () => ({ it: 'cristal_roche', m: 'cristal', n: 3 + ((rnd() * 2) | 0) }) });
    deco('puits', 'sout_os', 3, {}); deco('puits', 'sout_stalac', 6, { plafond: true }); deco('puits', 'sout_filon', 2, { mur: true, cueille: true, data: () => ({ it: 'galene', m: 'galene', n: 3 }) });
    deco('aven', 'sout_fougere', 12, { cueille: true, loin: 1.4, data: () => ({ it: 'fougere_pale', every: 3 }) }); deco('aven', 'sout_mousse', 16, { mur: true, cueille: true, loin: 1.4, data: () => ({ it: 'mousse_luisante', every: 4 }) });
    deco('tonnerre', 'sout_stalac', 12, { plafond: true, hmax: 60 }); deco('tonnerre', 'sout_eboulis', 5, { mur: true });
    deco('fossiles', 'p18_ammonite', 12, { mur: true, loin: 2.6 }); deco('fossiles', 'sout_stalac', 6, { plafond: true });
    deco('cathedrale', 'sout_stalag', 34, { r: 1.4, s: () => 1.2 + rnd() * 2.2 }); deco('cathedrale', 'sout_stalac', 26, { plafond: true, hmax: 70 });
    deco('cathedrale', 'sout_guano', 10, { cueille: true, data: () => ({ it: 'guano', every: 4 }) });
    deco('sanctuaire', 'sout_stalac', 4, { plafond: true });
    deco('lac', 'sout_champi', 46, { mur: false, cueille: true, loin: 1.6, data: () => Object.assign({ it: 'champi_lumineux', every: 3 }, rnd() < 0.35 ? { b: 1 } : {}) });
    deco('lac', 'sout_champi_grand', 12, { r: 2.2, h: 5.5, loin: 4 }); deco('lac', 'sout_pied_pierre', 8, { cueille: true, data: () => ({ it: 'pied_pierre', every: 3 }) });
    deco('gours', 'sout_stalac', 12, { plafond: true }); deco('gours', 'sout_stalag', 8, { r: 1.2 });
    deco('draperies', 'sout_stalag', 46, { r: 1.2, s: () => 1.3 + rnd() * 1.6 }); deco('draperies', 'p18_draperie', 10, { plafond: true, hmax: 30 }); deco('draperies', 'sout_colonne', 5, { r: 1.6, h: 6 });
    deco('eboulis', 'sout_stalac', 4, { plafond: true });
    // les boyaux : au bout, parfois un filon ou des os
    for (const b of this._br) {
      if (!b.fin) continue;
      const [x, z] = b.fin;
      const u = rnd();
      if (u < 0.35) { if (place(x, z) !== false) cueille('sout_filon', x, z, rnd() * TAU, { it: u < 0.15 ? 'magnetite' : 'galene', m: u < 0.15 ? 'magnetite' : 'galene', n: 3 }); }
      else if (u < 0.6) { if (place(x, z) !== false) { pose('sout_os', x, z, rnd() * TAU); pris.push([x, z]); } }
      else if (u < 0.8) { if (place(x, z) !== false) cueille('sout_mousse', x, z, rnd() * TAU, { it: 'mousse_luisante', every: 4 }); }
    }
    // ---- les peintures (sur la paroi la plus proche) et la porte du Sanctuaire
    for (const [k, salle, txt] of P18_PEINTURES) {
      const Q = P.salles.find((q) => q[0] === salle);
      for (let t = 0; t < 60; t++) {
        const a = rnd() * TAU, r = 0.55 + rnd() * 0.3, x = Q[1] + Math.cos(a) * Q[3] * r, z = Q[2] + Math.sin(a) * Q[4] * r;
        if (!loin(x, z, 4)) continue;
        const m = place(x, z, { mur: true, h: 2.6 });
        if (m === false || m === true) continue;
        // face à la salle (dos au mur) ; la peinture contre le mur
        const dw = paroi(x, z, m, 4), f = S.floorAt(x, z);
        if (dw === null) continue;
        const wx = x + Math.cos(m) * (dw - 0.12), wz = z + Math.sin(m) * (dw - 0.12);
        pose('p18_peinture', wx, wz, Math.atan2(-Math.cos(m), -Math.sin(m)), { k }, undefined, false, f);
        B.inter('p18_peinture', 'p18_peint_' + k, x + Math.cos(m) * (dw - 0.8), f + 1.5, z + Math.sin(m) * (dw - 0.8), 'Regarder la peinture', { k, txt });
        R.peintures.push(k); pris.push([x, z]);
        break;
      }
    }
    // l'ocre (dans la Galerie des Mains) : on en gratte un peu, une fois par jour
    dansSalle('mains', 1, (x, z) => { const m = place(x, z, { mur: true }); if (m === false || m === true || !loin(x, z, 3)) return false; const dw = paroi(x, z, m, 4); if (dw === null) return false; const f = S.floorAt(x, z); pose('p18_ocre', x + Math.cos(m) * (dw - 0.1), z + Math.sin(m) * (dw - 0.1), Math.atan2(-Math.cos(m), -Math.sin(m)), null, undefined, false, f); B.inter('p18_ocre', 'p18_ocre', x + Math.cos(m) * (dw - 0.7), f + 0.9, z + Math.sin(m) * (dw - 0.7), 'Gratter l’ocre', {}); pris.push([x, z]); return true; });
    {
      const [px, pz, pw, ph] = P.porte, f = S.floorAt(px, pz);
      // la dalle en travers de la galerie (sa face avant tournée vers la cathédrale)
      const gs = this._gal.find(([k]) => k === 'g_sanctuaire')[1], gx = gs[gs.length - 1][0] - gs[0][0], gz = gs[gs.length - 1][1] - gs[0][1];
      const pr = Math.atan2(-gx, -gz);
      const nb = w.blocks.length;
      B.block({ x: px, y: f - 0.4, z: pz, r: pr }, 0, 0, 0, pw, ph + 0.4, 0.9, M_SROCHE);
      Object.assign(w.blocks[nb], { ver: VER_SOUS, p18Porte: true, under: true });
      R.porte = nb;
      // les trois signes, sur la paroi devant la porte (côté cathédrale)
      const fx = Math.cos(pr), fz = -Math.sin(pr); // le long de la dalle
      const nx = Math.sin(pr), nz = Math.cos(pr);  // vers la cathédrale (devant)
      P18_SIGNES.forEach((k, i) => {
        const o = (i - 1) * 1.6, x = px + fx * o + nx * 0.55, z = pz + fz * o + nz * 0.55;
        pose('p18_signe', x, z, pr, { k });
        B.inter('p18_signe', 'p18_signe_' + k, x + nx * 0.4, f + 1.4, z + nz * 0.4, 'Poser la main dans le creux', { k, i });
        R.signes.push(k);
      });
      // le coffre du Sanctuaire
      const Sq = P.salles.find((q) => q[0] === 'sanctuaire'), cx = Sq[1] - 4, cz = Sq[2] + 3;
      pose('coffre_vieux', cx, cz, Math.PI * 0.75, { vide: false });
      B.inter('p18_tresor', 'p18_tresor', cx, S.floorAt(cx, cz) + 0.6, cz, 'Ouvrir le coffre', { prop: w.props.length - 1 });
      R.trouvailles.push({ id: 'p18_tresor', items: [['fossile', 1], ['perle_caverne', 2], ['cristal_roche', 3], ['argent', 120]] });
    }
    // ---- les trouvailles d'une fois (des fossiles détachés, des perles au fond des gours)
    const trouve = (id, key, item, n, label) => dansSalle(key, n, (x, z) => {
      if (!loin(x, z, 4) || place(x, z, { mur: true }) === false) return false;
      const f = S.floorAt(x, z), tid = 'p18_t' + R.trouvailles.length;
      pose(id, x, z, rnd() * TAU, { t: tid });
      B.inter('p18_trouve', tid, x, f + 0.4, z, label, { item, prop: w.props.length - 1 });
      R.trouvailles.push({ id: tid, items: [[item, 1]] }); pris.push([x, z]);
      return true;
    });
    trouve('p18_fossile', 'fossiles', 'fossile', 3, 'Détacher le fossile');
    trouve('p18_fossile', 'cathedrale', 'fossile', 1, 'Détacher le fossile');
    // des perles au fond des gours (les vasques de calcite)
    for (const [x, z, r] of P.gours.slice(0, 3)) cueille('sout_vasque', x + r * 0.2, z - r * 0.15, rnd() * TAU, { it: 'perle_caverne', every: 0 });
    // ---- les filons et les cristaux qu'on casse (objets du jeu, posés au sol d'en bas)
    const objet = (id, x, z, extra) => { B.obj(id, x, z, undefined, Object.assign({ y: S.floorAt(x, z), ver: VER_SOUS }, extra || {})); R.objets++; };
    dansSalle('cristaux', 5, (x, z) => { if (!loin(x, z, 3) || place(x, z, { mur: true }) === false) return false; objet('crystal', x, z, { h: 1.2, v: 0 }); pris.push([x, z]); return true; });
    dansSalle('puits', 2, (x, z) => { if (!loin(x, z, 3) || place(x, z, { mur: true }) === false) return false; objet('vein', x, z, { h: 1.1, v: 2 }); pris.push([x, z]); return true; });
    dansSalle('draperies', 3, (x, z) => { if (!loin(x, z, 3) || place(x, z, { mur: true }) === false) return false; objet('vein', x, z, { h: 1.1, v: 1 }); pris.push([x, z]); return true; });
    // ---- les sorties : l'arrivée (le Vestibule), les racines de l'aven, l'éboulis du bout
    {
      const [ax, , az] = P.arrivee;
      pose('sout_cairn', ax + 4, az + 3.2, 0.3, { n: 3 });
      B.inter('p18_sortie', 'p18_sortie', ax + 4.5, S.floorAt(ax + 4.5, az) + 1.2, az, 'Remonter vers la chute', {});
      { const dw = paroi(ax, az, 0, 14); if (dw !== null) pose('p18_jour', ax + dw - 0.1, az, -Math.PI / 2, null, undefined, false, S.floorAt(ax, az)); } // une lueur pâle au bout du vestibule (le dehors, loin)
      R.sortie = [ax + 4.5, S.floorAt(ax + 4.5, az), az];
      // le carnet d'un géologue, posé sur une pierre (le seul « plan » qu'on aura, au début)
      const cx = ax - 4, cz = az - 3.5, cf = S.floorAt(cx, cz);
      pose('p18_pierre_carnet', cx, cz, 0.6);
      B.inter('p18_carnet', 'p18_carnet', cx, cf + 0.9, cz, 'Lire le carnet laissé là', {});
    }
    {
      const [cx, cz] = P.cheminees[0], f = S.floorAt(cx + 2.4, cz);
      pose('sout_echelle_racines', cx + 2.6, cz, -Math.PI / 2, { h: 12 });
      B.inter('p18_racines', 'p18_racines', cx + 2.2, f + 1.2, cz, 'Grimper aux racines', {});
      pose('p18_rayon', cx, cz, 0); // le jour qui tombe de l'aven
      // dehors : le trou de l'aven, au milieu des arbres
      const hy = w.heightAt(cx, cz);
      B.prop('p18_aven', cx, hy - 0.1, cz, 0, null, 1);
      B.inter('p18_aven', 'p18_aven', cx + 3.4, hy + 0.6, cz, 'Regarder dans le trou', {});
      B.landmark('p18_aven', cx, cz, 8, { p18: 'aven', secret: true });
      R.aven = { bas: [cx + 2.2, f + 0.05, cz], haut: [cx + 4.2, hy + 0.1, cz] };
    }
    {
      const [bx, bz] = P.bout, f = S.floorAt(bx - 3, bz);
      for (let k = 0; k < 7; k++) { const a = (k / 7 - 0.5) * 2.4, x = bx + Math.cos(a) * 3, z = bz + Math.sin(a) * 4.5; B.prop('sout_eboulis', x, S.floorAt(x, z) - 0.2, z, rnd() * TAU, null, 2.4 + rnd() * 1.4, VER_SOUS); }
      B.inter('p18_eboulis', 'p18_eboulis', bx - 3, f + 1.2, bz, 'Écouter derrière l’éboulis', {});
    }
    // ---- les repères vers la sortie : dans chaque salle, un cairn et une flèche peinte vers la galerie qui ramène
    const G = this.graphe();
    for (const k in G.noeuds) {
      if (k === 'vestibule' || k === 'torrent') continue;
      const v = this.versSortie(k);
      if (!v) continue;
      const g = this._gal.find(([gk]) => gk === v[1]);
      if (!g) continue;
      const pts = g[1], p0 = this.salle(pts[0][0], pts[0][1]) === k ? pts[0] : pts[pts.length - 1], p1 = p0 === pts[0] ? pts[1] : pts[pts.length - 2];
      const a = Math.atan2(p1[0] - p0[0], p1[1] - p0[1]);
      for (let t = 0; t < 12; t++) {
        const x = p0[0] - Math.sin(a) * (4 + t * 0.8) + Math.cos(a) * 2.6, z = p0[1] - Math.cos(a) * (4 + t * 0.8) - Math.sin(a) * 2.6;
        if (place(x, z) === false) continue;
        pose('sout_cairn', x, z, a, { n: 1 });
        pose('p18_fleche', x + Math.sin(a) * 1.6, z + Math.cos(a) * 1.6, a);
        R.fleches++; pris.push([x, z]);
        break;
      }
    }
    // ---- les nids (chauves-souris sous la grande voûte, protées et écrevisses au lac, grillons dans les galeries)
    for (const [k, n] of [['cathedrale', 5], ['tonnerre', 1], ['draperies', 1]]) dansSalle(k, n, (x, z) => { if (!ouvert(x, z, 8)) return false; R.nids.push(['chauve', x, Math.min(S.vaultAt(x, z) - 2, S.floorAt(x, z) + 14), z, 4 + ((rnd() * 5) | 0)]); return true; });
    {
      const [, cx, cz, rx, rz, rot] = P.lacs[0], co = Math.cos(rot), si = Math.sin(rot);
      for (let i = 0; i < 26; i++) { const a = rnd() * TAU, q = 0.82 + rnd() * 0.2, lx = Math.cos(a) * rx * q, lz = Math.sin(a) * rz * q, x = cx + lx * co + lz * si, z = cz - lx * si + lz * co, f = S.floorAt(x, z); if (f < SOUT_WL - 0.35 && f > SOUT_WL - 1.6) R.nids.push([rnd() < 0.5 ? 'protee' : 'ecrevisse', x, f, z, 2 + ((rnd() * 2) | 0)]); }
    }
    for (const [key, pts] of this._gal) for (let i = 0; i + 1 < pts.length; i++) { const A = pts[i], Bq = pts[i + 1], t = rnd(), x = lerp(A[0], Bq[0], t), z = lerp(A[1], Bq[1], t); if (rnd() < 0.4 && ouvert(x, z, 2)) R.nids.push([rnd() < 0.15 ? 'scolopendre' : 'grillon', x, S.floorAt(x, z), z, rnd() < 0.15 ? 1 : 3 + ((rnd() * 4) | 0)]); }
    // ---- les eaux d'en bas qui ne sont pas au niveau du Dessous : les gours, la vasque du Tonnerre, la rivière en gradins
    for (const [x, z, r, eau] of P.gours) { p18Gen.nappe(WR, x, z, r * 1.1, r * 1.1, 0, eau, { sous: 1, prof: 1.4 }); R.eaux++; }
    { const V = this.vasque(); p18Gen.nappe(WR, V.x, V.z, V.r * 1.15, V.r * 1.15, 0, V.eau, { sous: 1, prof: 2.2 }); R.eaux++; R.vasque = V; }
    const tr = this.torrent();
    for (let i = 0; i < tr.length; i++) {
      const s = tr[i];
      if (s.eau <= SOUT_WL + 0.05) continue;
      const L = Math.hypot(s.bx - s.ax, s.bz - s.az), a = Math.atan2(s.bz - s.az, s.bx - s.ax);
      p18Gen.nappe(WR, (s.ax + s.bx) / 2, (s.az + s.bz) / 2, L / 2 + 0.2, s.r * 0.75, a, s.eau, { sous: 1, prof: 1.7 }); R.eaux++;
      const n = tr[i + 1];
      if (n && s.eau - n.eau > 0.35) WR.minis.push({ x: s.bx, z: s.bz, a, y0: s.eau, y1: n.eau, l: s.r * 0.9, k: 'torrent', sous: 1 });
    }
    // la chute du Tonnerre : l'eau de la perte, qui tombe de la voûte dans la vasque
    { const V = R.vasque, top = S.vaultAt(V.x, V.z); WR.chutes.push({ k: 'tonnerre', sorte: 'ruban', x: V.x, z: V.z - 1, a: Math.PI / 2, y0: top - 0.2, y1: V.eau, l: 3.2, sous: 1, bassin: { x: V.x, z: V.z, rx: V.r, rz: V.r, rot: 0, y: V.eau, r: V.r } }); }
    // ---- les lieux (on ne les apprend qu'en y entrant : voir le jeu)
    for (const [key, cx, cz, rx, rz] of P.salles) B.landmark('p18g_' + key, cx, cz, Math.max(rx, rz), { under: true, secret: true, y: S.floorAt(cx, cz), p18: 'salle' });
    for (const [key, cx, cz, rx, rz] of P.lacs) B.landmark('p18g_' + key, cx, cz, Math.max(rx, rz), { under: true, secret: true, y: SOUT_WL, p18: 'salle' });
    B.landmark('p18g_torrent', P.torrent[4][0], P.torrent[4][1], 40, { under: true, secret: true, y: P.torrent[4][2], p18: 'salle' });
    B.landmark('p18_grotte', 380, 1850, 300, { under: true, secret: true, y: -100, p18: 'grotte' });
    R.props = w.props.length - R.props0; R.inter = w.inter.length - R.inter0;
    return R;
  },
  // un point au bord de l'eau d'une vasque ou d'un gradin (on n'y pose rien)
  mouille(x, z, f) {
    for (const [gx, gz, r, eau] of P18_GROTTE.gours) if (Math.hypot(x - gx, z - gz) < r * 1.3 && f < eau + 0.3) return true;
    const V = this.vasque(); if (Math.hypot(x - V.x, z - V.z) < V.r * 1.35) return true;
    for (const s of this.torrent()) { const [d] = p18TSeg(x, z, s.ax, s.az, s.bx, s.bz); if (d < s.r * 0.75 && f < s.eau + 0.4) return true; }
    return false;
  },
};
function p18TSeg(x, z, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1, t = clamp(((x - ax) * dx + (z - az) * dz) / L2, 0, 1);
  return [Math.hypot(x - (ax + dx * t), z - (az + dz * t)), t];
}

// ---------------------------------------------------------------- dans le moteur du Dessous : nos creuseurs, après les siens
{
  const _cr = souterrain.creuseurs;
  souterrain.creuseurs = function () {
    const neuf = !this._cv;
    const r = _cr.call(this);
    if (neuf && this._cv && !this._p18) { this._p18 = true; try { p18Grotte.injecter(this); } catch (e) { console.error('P18 creuseurs', e); } }
    return this._cv || r;
  };
}
