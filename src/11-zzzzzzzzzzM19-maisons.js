// ============================================================================
//  LES MAISONS HABILLÉES (vague M19) : chaque maison bâtie par Builder.house
//  (la ferme, la ville, le hameau, les maisons des lieux-dits, la grange et le
//  poulailler qu'on construit) reçoit, en boîtes de décor :
//  - un soubassement de pierre (un larmier plus mince sur les murs de pierre),
//    ouvert devant la porte ;
//  - aux angles, des chaînes de pierre de taille (murs de pierre, de brique, de
//    crépi) ou des poteaux corniers (colombages, planches, rondins) ;
//  - en ville et sur les maisons à étage : un bandeau entre les étages et une
//    corniche sous l'égout du toit ;
//  - au toit : les rives (planches de rive sur les pignons), le faîtage (tuiles
//    faîtières, faîte de chaume, ligne de plomb sur l'ardoise), la planche
//    d'égout, ou la gouttière de zinc et ses descentes ; des épis de faîtage sur
//    les toits d'ardoise ;
//  - la souche de la cheminée : un bandeau, une dalle, un ou deux pots.
//  La fontaine de la place (Builder.fountain) est habillée de même : la margelle
//  débordante du bassin, les moulures du pilier, le bord de la vasque, la
//  colonnette et sa pomme, quatre becs de bronze et leurs filets d'eau.
//  Le décor ne touche pas au monde : pas de bloc, pas d'objet, pas de tirage, rien
//  pour les collisions ni les abris ; la maison est notée au passage (w.m19M) et
//  son décor est dessiné quand les objets posés le sont (play.buildProps). Une
//  maison dont le toit est caché (blocs masqués, autre version du monde) n'en a pas.
//  Plus bas, les retouches de la vague M19 qui doivent passer après les modules
//  qu'elles reprennent : le niveau de détail au loin (M19LOD, 07-…M19-modeles.js :
//  la caméra donnée au moteur pendant qu'il refait les objets posés et les objets
//  animés ; les bêtes au loin, M19B ; les bêtes hors de la vue, M19Vue) et les
//  roues de la charrette (attelage). (Le chat sauvage, les bêtes qui parlent et
//  les oiseaux du module de la nature, retouchés ici pour les bêtes refaites, ont
//  retrouvé leurs modèles d'avant à la vague 22, avec toutes les bêtes.)
//  Le décor des maisons et de la fontaine n'est dessiné qu'à moins de
//  M19LOD.D.maisons (70 m en qualité moyenne, 35 m en basse) ; au-delà de
//  M19LOD.D.maisonsFin (45 m, 22 m en basse), le décor fin est fondu.
// ============================================================================
{
  const _house = Builder.prototype.house;
  Builder.prototype.house = function (f, W, D, o) {
    o = o || {};
    const B = this.w.blocks, n0 = B.length;
    const res = _house.call(this, f, W, D, o);
    try {
      const roof = o.roof ?? M_THATCH;
      let toit = null;
      for (let i = n0; i < B.length; i++) if (B[i].sh === 1 && B[i].m === roof) { toit = B[i]; break; }
      (this.w.m19M || (this.w.m19M = [])).push({
        f: { x: f.x, y: f.y, z: f.z, r: f.r }, W, D, H: res.H, rh: o.roofH ?? Math.min(3.2, D * 0.5), dx: res.dx, dw: res.dw, dh: res.dh,
        wall: o.wall ?? M_TIMBER, roof, found: o.found ?? M_STONE, chimney: !!o.chimney, toit, R: Math.hypot(W, D) / 2 + 1.5,
      });
    } catch (e) { console.warn('M19 : maisons', e); }
    return res;
  };
  // la fontaine de la place (Builder.fountain) : notée de même, habillée de même
  const _fountain = Builder.prototype.fountain;
  Builder.prototype.fountain = function (f) {
    const B = this.w.blocks, n0 = B.length;
    const res = _fountain.call(this, f);
    try { (this.w.m19F || (this.w.m19F = [])).push({ f: { x: f.x, y: f.y, z: f.z, r: f.r || 0 }, bloc: B[n0] || null }); } catch (e) { console.warn('M19 : fontaine', e); }
    return res;
  };
}

const M19M = {
  sombre: rgbf('#4a3626'), zinc: rgbf('#8a9096'), plomb: rgbf('#4e5258'), fer: rgbf('#2e2e33'), pot: rgbf('#b8683a'),
  // le décor d'une maison (repère de la maison : la porte regarde -z, le sol à y = 0) ; mi (à mi-distance : au-delà de
  // M19LOD.D.maisonsFin) : les chaînes d'angle fondues en deux longues pierres par angle, les descentes sans leur col
  // de cygne, pas d'épis de faîtage (le décor fin ne se voit plus ; 34 boîtes au lieu de 82 pour une maison de ville)
  dessiner(E, M, mi) {
    const { W, D, H, rh, wall, roof } = M, hw = W / 2, hd = D / 2;
    const pierreMur = wall === M_STONE || wall === M_MOSSY || wall === M_ROCK || wall === M_STONEWIN;
    const bois = wall === M_TIMBER || wall === M_TIMBERWIN || wall === M_PLANKS || wall === M_LOGS;
    const ville = !bois || H > 3.2;
    const P = mt(M_STONE), clair = [1.3, 1.26, 1.16], v = hash2i(Math.round(M.f.x), Math.round(M.f.z), 19);
    const bx = (x, y0, z, sx, sy, sz, col, code) => E.bx(x, y0, z, sx, sy, sz, col, code);
    // ---- soubassement (pas sous les maisons montées sur planches : roulottes, cabanes sur pilotis)
    if (M.found === M_STONE || M.found === M_MOSSY) {
      const h = pierreMur ? 0.32 : 0.55, e = pierreMur ? 0.05 : 0.08, y0 = -0.3, col = pierreMur ? [0.86, 0.84, 0.8] : [0.92, 0.9, 0.86];
      const dl = M.dx - M.dw / 2 - 0.14, dr = M.dx + M.dw / 2 + 0.14;
      if (dl > -hw) bx((-hw - e + dl) / 2, y0, -hd - e / 2 + 0.04, dl + hw + e, h - y0, e + 0.08, col, P);
      if (dr < hw) bx((dr + hw + e) / 2, y0, -hd - e / 2 + 0.04, hw + e - dr, h - y0, e + 0.08, col, P);
      bx(0, y0, hd + e / 2 - 0.04, W + 2 * e, h - y0, e + 0.08, col, P);
      for (const s of [-1, 1]) bx(s * (hw + e / 2 - 0.04), y0, 0, e + 0.08, h - y0, D, col, P);
    }
    // ---- angles : chaînes de pierre de taille, ou poteaux corniers
    if (bois) {
      const c = v3.scale(M19M.sombre, 0.9 + v * 0.2), w2 = wall === M_LOGS ? 0.3 : 0.22;
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) bx(sx * (hw - w2 / 2 + 0.04), 0, sz * (hd - w2 / 2 + 0.04), w2, H, w2, c, TL.darkwood);
    } else if (mi) {
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        bx(sx * (hw - 0.31 + 0.035), 0, sz * (hd - 0.165 + 0.035), 0.62, H - 0.025, 0.33, clair, P);
        bx(sx * (hw - 0.165 + 0.035), 0, sz * (hd - 0.31 + 0.035), 0.33, H - 0.025, 0.62, clair, P);
      }
    } else {
      const n = Math.max(2, Math.floor(H / 0.5)), hh = H / n;
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (let k = 0; k < n; k++) {
        const long = (k + (sx * sz > 0 ? 0 : 1)) % 2 === 0, lx = long ? 0.62 : 0.33, lz = long ? 0.33 : 0.62;
        bx(sx * (hw - lx / 2 + 0.035), k * hh, sz * (hd - lz / 2 + 0.035), lx, hh - 0.025, lz, clair, P);
      }
    }
    // ---- bandeau entre les étages, corniche sous l'égout (pierre, brique, crépi ; maisons à étage)
    if (!bois || H > 3.2) {
      // (sur les colombages, le bandeau est la sablière de l'étage : une poutre)
      const corn = bois ? M19M.sombre : [1.22, 1.18, 1.1], cc = bois ? TL.darkwood : P;
      if (H > 3.2) for (let y = 2.85; y < H - 1; y += 2.75) { bx(0, y, -hd - 0.02, W + 0.08, 0.16, 0.12, corn, cc); bx(0, y, hd + 0.02, W + 0.08, 0.16, 0.12, corn, cc); for (const s of [-1, 1]) bx(s * (hw + 0.02), y, 0, 0.12, 0.16, D + 0.08, corn, cc); }
      if (!bois) for (const s of [-1, 1]) { bx(0, H - 0.22, s * (hd + 0.03), W + 0.14, 0.2, 0.16, corn, P); bx(0, H - 0.08, s * (hd + 0.08), W + 0.24, 0.08, 0.16, corn, P); }
    }
    // ---- le toit : rives sur les pignons, égout (planche ou gouttière), faîtage, épis
    const hx = hw + 0.45, hz = hd + 0.5, a = Math.atan2(rh, hz), L = Math.hypot(rh, hz);
    const chaume = roof === M_THATCH, ardoise = roof === M_SLATE, tuiles = roof === M_ROOF;
    const rive = chaume ? v3.scale(M19M.sombre, 1.1) : M19M.sombre;
    for (const s of [-1, 1]) {
      E.box(s * (hx + 0.03), H + rh / 2 + 0.03, -hz / 2, 0.06, 0.2, L + 0.06, rive, TL.darkwood, 0, -a, 0);
      E.box(s * (hx + 0.03), H + rh / 2 + 0.03, hz / 2, 0.06, 0.2, L + 0.06, rive, TL.darkwood, 0, a, 0);
    }
    if (ville && (ardoise || tuiles)) {
      // gouttière de zinc et deux descentes (col de cygne contre le mur, puis droit au sol)
      for (const s of [-1, 1]) E.box(0, H - 0.04, s * (hz + 0.02), W + 0.95, 0.1, 0.13, M19M.zinc, TL.metal);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        const x = sx * (hw - 0.22), zw = sz * (hd + 0.07);
        bx(x, 0.05, zw, 0.08, H - 0.45, 0.08, M19M.zinc, TL.metal);
        if (mi) continue;
        const dz = sz * (hz - hd - 0.07), dy = 0.42;
        E.box(x, H - 0.4 + dy / 2 - 0.02, zw + dz / 2, 0.08, Math.hypot(dz, dy), 0.08, M19M.zinc, TL.metal, 0, Math.atan2(dz, dy), 0);
      }
    } else {
      for (const s of [-1, 1]) E.box(0, H - 0.03, s * (hz + 0.02), W + 0.95, 0.15, 0.05, rive, TL.darkwood);
    }
    if (chaume) {
      E.box(0, H + rh - 0.02, 0, W + 1.0, 0.26, 0.5, [0.7, 0.66, 0.6], mt(M_THATCH));
      E.box(0, H + rh + 0.06, 0, W + 1.06, 0.12, 0.3, [0.62, 0.58, 0.52], mt(M_THATCH));
    } else if (ardoise) {
      E.box(0, H + rh, 0, W + 0.98, 0.12, 0.12, M19M.plomb, TL.metal, 0, Math.PI / 4);
      if (!mi) for (const s of [-1, 1]) { bx(s * (hx - 0.05), H + rh, 0, 0.07, 0.42, 0.07, M19M.fer, TL.iron); E.box(s * (hx - 0.05), H + rh + 0.46, 0, 0.11, 0.11, 0.11, M19M.fer, TL.iron, Math.PI / 4, Math.PI / 4); }
    } else {
      E.box(0, H + rh, 0, W + 0.98, 0.17, 0.17, tuiles ? [0.82, 0.74, 0.7] : [0.8, 0.8, 0.8], mt(roof), 0, Math.PI / 4);
    }
    // ---- la souche de la cheminée : un bandeau, une dalle, des pots
    if (M.chimney) {
      const x = hw - 1.1, z = D / 5, top = H - 0.2 + rh + 0.9;
      bx(x, top - 0.34, z, 0.8, 0.09, 0.8, [0.9, 0.86, 0.82], P);
      bx(x, top, z, 0.86, 0.09, 0.86, [0.88, 0.85, 0.8], P);
      bx(x - 0.13, top + 0.09, z, 0.17, 0.26, 0.17, M19M.pot, m19F(TL.terracotta, TF.pTronc));
      if (v > 0.5) bx(x + 0.15, top + 0.09, z + 0.05, 0.15, 0.2, 0.15, M19M.pot, m19F(TL.terracotta, TF.pTronc));
    }
  },
  // la fontaine (repère de la fontaine ; bassin de 5 m, murs de 0,45 m jusqu'à 0,7 m, l'eau à 0,36 m, le pilier de
  // 0,8 m jusqu'à 1,9 m, la vasque de 1,9 m jusqu'à 2,25 m) : la margelle débordante, les moulures du pilier, le bord
  // de la vasque, la colonnette et sa pomme, quatre becs de bronze et leurs filets d'eau
  fontaine(E) {
    const P = mt(M_STONE), C = [1.2, 1.16, 1.08], C2 = [1.06, 1.03, 0.97], Wt = mt(M_WATERB), eau = [0.85, 0.95, 1.05], bronze = [0.62, 0.5, 0.3];
    E.bx(0, 0.7, -2.275, 5.12, 0.1, 0.57, C, P); E.bx(0, 0.7, 2.275, 5.12, 0.1, 0.57, C, P);
    E.bx(-2.275, 0.7, 0, 0.57, 0.1, 3.98, C, P); E.bx(2.275, 0.7, 0, 0.57, 0.1, 3.98, C, P);
    E.bx(0, 0.3, 0, 1.06, 0.24, 1.06, C2, P); E.bx(0, 1.12, 0, 0.9, 0.08, 0.9, C2, P); E.bx(0, 1.72, 0, 1.16, 0.18, 1.16, C, P);
    E.bx(0, 2.25, -0.9, 1.96, 0.09, 0.16, C, P); E.bx(0, 2.25, 0.9, 1.96, 0.09, 0.16, C, P);
    E.bx(-0.9, 2.25, 0, 0.16, 0.09, 1.64, C, P); E.bx(0.9, 2.25, 0, 0.16, 0.09, 1.64, C, P);
    E.bx(0, 2.25, 0, 0.26, 0.55, 0.26, C2, P); E.bx(0, 2.8, 0, 0.38, 0.06, 0.38, C, P);
    E.box(0, 3.0, 0, 0.24, 0.24, 0.24, C2, P, Math.PI / 4, 0.62);
    for (const [sx, sz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      E.box(sx * 1.06, 2.1, sz * 1.06, sx ? 0.24 : 0.06, 0.06, sz ? 0.24 : 0.06, bronze, TL.metal);
      E.bx(sx * 1.19, 0.34, sz * 1.19, 0.05, 1.74, 0.05, eau, Wt);
    }
  },
  // les maisons proches (rayon R) : leur décor, dans le tampon des objets posés
  dessinerTout(buf, cam, R) {
    const w = game.world, L = (w && w.m19M) || [], F = (w && w.m19F) || [];
    if (!L.length && !F.length) return 0;
    if (typeof souterrain !== 'undefined' && souterrain.actif) return 0;
    PE.buf = buf; PE.fl = 0; PE.tint = null; PE.recol = null;
    let n = 0;
    const R2 = R * R;
    // (au-delà de M19LOD.D.maisons, pas de décor : la maison seule, comme avant ; le battement évite les va-et-vient)
    const vu = (t, f, M) => {
      if (t && (t.hidden || (t.ver && !(t.ver & w.curVer)))) return false;
      const dx = f.x - cam[0], dz = f.z - cam[2];
      return dx * dx + dz * dz <= R2 && !M19LOD.loinXZ(cam, f.x, f.z, M19LOD.D.maisons, M);
    };
    for (const M of L) {
      if (!vu(M.toit, M.f, M)) continue;
      PE.frame(M.f.x, M.f.y, M.f.z, M.f.r, 1);
      // (à mi-distance, le décor fin fondu : l'état du battement est gardé sur M.f)
      try { M19M.dessiner(PE, M, M19LOD.loinXZ(cam, M.f.x, M.f.z, M19LOD.D.maisonsFin, M.f)); n++; } catch (e) { console.error('M19 : décor', e); }
    }
    for (const M of F) {
      if (!vu(M.bloc, M.f, M)) continue;
      PE.frame(M.f.x, M.f.y, M.f.z, M.f.r, 1);
      try { M19M.fontaine(PE); n++; } catch (e) { console.error('M19 : fontaine', e); }
    }
    return n;
  },
};
// le dessin : quand le moteur reconstruit les objets posés (quand on s'est déplacé, ou que quelque chose change)
{
  // (la caméra est connue du niveau de détail le temps de refaire les objets posés et les cultures)
  const _bp = play.buildProps.bind(play);
  play.buildProps = function (cam, sky) {
    const buf = this.propBuf, v0 = buf ? buf.ver : 0, c = this.propCenter;
    // (le détail de près se décide quand les objets sont refaits : refaits tous les M19LOD.pas() mètres, pas 30)
    if (c && cam && !M19LOD.force) { const P = M19LOD.pas(), dx = cam[0] - c[0], dz = cam[2] - c[1]; if (P < 30 && dx * dx + dz * dz >= P * P) this.propCenter = null; }
    M19LOD.cam = cam;
    try {
      const r = _bp(cam, sky);
      if (buf && buf.ver !== v0 && farm.on) {
        try { if (M19M.dessinerTout(buf, cam, (this.propR || 200) + 20)) buf.ver = (buf.ver || 0) + 1; } catch (e) { console.error('M19 : maisons', e); }
      }
      return r;
    } finally { M19LOD.cam = null; }
  };
  // et le temps des objets animés (ailes du moulin, charrettes…), refaits à chaque image
  const _bd = play.buildDynamic;
  play.buildDynamic = function (cam) {
    M19LOD.cam = cam;
    try { return _bd.apply(this, arguments); } finally { M19LOD.cam = null; }
  };
}

// ============================================================================
//  LES BÊTES AU LOIN (vague M19) : les bêtes sont posées et dessinées à chaque
//  image ; au-delà de M19LOD.D.betes (40 m en qualité moyenne, 20 m en basse),
//  celles à corps d'oiseau (e1Oiseau : les oiseaux des bêtes E1, E2, E3) ne
//  calculent et n'émettent que leur silhouette. (Les quadrupèdes d'avant, revenus
//  à la vague 22, n'ont pas besoin de ce tri : ils ont peu de boîtes, autant que
//  les bêtes refaites au loin, et ne changent pas avec la distance.) La table :
//  - oiseaux : le tronc, le cou, la tête, la queue, les pattes, les ailes (en vol),
//    et les deux plus longues pièces parmi les grandes (ailes repliées, ventre…) ;
//    les yeux, le bec, les petits détails ne sont plus calculés ;
//  - (quadrupèdes à pattes en deux segments, s'il en revenait : le tronc, le cou,
//    la tête, la queue, la selle, quatre pattes d'une seule boîte, et les deux plus
//    longues pièces parmi les grandes).
// ============================================================================
const M19B = {
  R: new Float32Array(12),
  // les tables, rangées à part (le squelette n'est pas touché : sa forme pour le moteur JS ne change pas en route)
  T: new WeakMap(),
  OISEAU: /^(body|neckB?|head|tail|legF[LR]|wing[LR])$/,
  QUAD: /^(body|neck|head|tail|leg[FB][LR]|saddle|blanketS)$/,
  PETITES: /^(leg[FB][LR][bh]|tail[bc]|oeil|pupille)/,
  // { F, FS, FO } : F[i] : 1 = émise au loin, 2 = posée seulement (un ancêtre d'une pièce émise), 4 = patte d'une
  // seule boîte (sa hauteur et son décalage au loin : FS[i], FO[i]) ; null : rien à gagner
  table(r) {
    const P = r.parts, n = P.length;
    if (n < 12) return null;
    let S = 0;
    for (const q of P) if (q.s && !q.hide) S = Math.max(S, q.s[0], q.s[1], q.s[2]);
    const F = new Uint8Array(n), FS = new Float32Array(n), FO = new Float32Array(n), oiseau = r.kind === 'bird', L = (q) => Math.max(q.s[0], q.s[1], q.s[2]), autres = [];
    for (let i = 0; i < n; i++) {
      const q = P[i];
      if (!q.s) continue;
      if ((oiseau ? this.OISEAU : this.QUAD).test(q.name)) F[i] = 1;
      else if (!q.hide && !this.PETITES.test(q.name) && L(q) >= S * 0.25) autres.push(i);
    }
    autres.sort((a, b) => L(P[b]) - L(P[a]));
    for (const i of autres.slice(0, 2)) F[i] = 1;
    if (!oiseau) {
      // les pattes : la cuisse descend jusqu'au bas du canon (genou droit, au loin cela ne se voit pas)
      for (let i = 0; i < n; i++) {
        const q = P[i];
        if (!(F[i] & 1) || !/^leg[FB][LR]$/.test(q.name)) continue;
        const j = r.idx[q.name + 'b'];
        if (j === undefined || !P[j].s) continue;
        const haut = q.o[1] + q.s[1] / 2, bas = P[j].p[1] + P[j].o[1] - P[j].s[1] / 2;
        FS[i] = haut - bas; FO[i] = (haut + bas) / 2; F[i] |= 4;
      }
    }
    let nb = 0;
    for (let i = 0; i < n; i++) if (F[i] & 1) nb++;
    if (nb > n - 3) return null;
    for (let i = 0; i < n; i++) if (F[i] & 1) for (let j = P[i].pi; j >= 0; j = P[j].pi) { if (F[j] & 2) break; F[j] |= 2; }
    return { F, FS, FO };
  },
  // comme Rig.emit (m19Emettre, 07-…M19-modeles.js : les formes effilées, les pièces sans rotation), pour les
  // pièces de la table seulement
  emettre(r, T, buf, root, flags) {
    const P = r.parts, F = T.F, FS = T.FS, FO = T.FO, fr = Math.fround;
    for (let i = 0, n = P.length; i < n; i++) {
      const f = F[i];
      if (!f) continue;
      const q = P[i], rr = q.r, p = q.p, W = q.W, A = q.pi < 0 ? root : P[q.pi].W;
      if (rr[0] === 0 && rr[1] === 0 && rr[2] === 0) {
        const px = fr(p[0]), py = fr(p[1]), pz = fr(p[2]);
        W[0] = A[0]; W[1] = A[1]; W[2] = A[2]; W[3] = A[0] * px + A[1] * py + A[2] * pz + A[3];
        W[4] = A[4]; W[5] = A[5]; W[6] = A[6]; W[7] = A[4] * px + A[5] * py + A[6] * pz + A[7];
        W[8] = A[8]; W[9] = A[9]; W[10] = A[10]; W[11] = A[8] * px + A[9] * py + A[10] * pz + A[11];
      } else {
        m34TR(_mT, p[0], p[1], p[2], rr[0], rr[1], rr[2]);
        m34Mul(W, A, _mT);
      }
      if (!(f & 1) || !q.s || q.hide) continue;
      let code = withFlags(q.tex, (q.fl || 0) | flags);
      if (q.shp) code = code < 0 ? code - 512 * q.shp : code | (q.shp << 18);
      if (f & 4) buf.box(q.W, q.o[0], FO[i], q.o[2], q.s[0], FS[i], q.s[2], q.col, code);
      else buf.box(q.W, q.o[0], q.o[1], q.o[2], q.s[0], q.s[1], q.s[2], q.col, code);
    }
  },
};
// ============================================================================
//  LES BÊTES HORS DE LA VUE (vague M19) : le jeu pose et dessine à chaque image
//  toutes les bêtes à moins de 90 m, celles qui sont derrière soi comme les
//  autres. Celles du gabarit des quadrupèdes, des oiseaux de la basse-cour et des
//  bois (rig.trieVue : 07-…M19-modeles.js) et celles à corps d'oiseau qui sont hors
//  du champ de la vue ne sont plus ni posées ni dessinées. Le champ : la
//  diagonale de l'image d'avant (le rendu), élargie de 20° (la vue tourne d'une
//  image à l'autre) et de la taille de la bête ; la vue des yeux du joueur compte
//  aussi. On garde toujours celles à moins de 8 m, les dépouilles, le chien qui
//  ronge son os (l'os suit sa tête), les bêtes montées. On ne trie pas quand la
//  caméra n'est pas aux yeux du joueur (cinématique, lunette, caméra déplacée,
//  vue qui a tourné de plus de 30° depuis l'image d'avant).
//  Le dessin (et les modules qui l'emballent : ombres, visions…) parcourt alors
//  la liste triée : les bêtes au-delà de la distance de dessin (que le jeu ne
//  dessine pas) n'y sont pas, celles du monde entier ne sont plus passées en
//  revue cinq fois par image.
// ============================================================================
const M19Vue = {
  L: [], laissees: 0,
  // la liste des bêtes à dessiner (réutilisée : rien n'est alloué), ou null si on ne trie pas
  trier(list, cam, maxD) {
    const R = game.renderer, p = game.player, VP = R && R.viewProj, PR = R && R.proj;
    if (!VP || !PR || !(PR[0] > 0) || !(PR[5] > 0) || !p || !cam || M19LOD.force || !(maxD > 0)) return null;
    if ((typeof cine !== 'undefined' && cine.on) || (typeof camLibre !== 'undefined' && camLibre.on)) return null;
    if (typeof chasse !== 'undefined' && chasse.f && chasse.f.lunette) return null;
    const eye = p.eyePos();
    if (Math.abs(eye[0] - cam[0]) + Math.abs(eye[1] - cam[1]) + Math.abs(eye[2] - cam[2]) > 0.6) return null;
    // l'axe de la vue d'avant (4e ligne de la matrice vue-projection : la profondeur), celui des yeux du joueur
    const fx = VP[3], fy = VP[7], fz = VP[11];
    const pit = p.pitch + (p.kickPitch || 0), cp = Math.cos(pit), gx = -Math.sin(p.yaw) * cp, gy = Math.sin(pit), gz = -Math.cos(p.yaw) * cp;
    if (fx * gx + fy * gy + fz * gz < 0.86) return null;
    const a = Math.min(1.45, Math.atan(Math.hypot(1 / PR[0], 1 / PR[5])) + 0.35), ca = Math.cos(a), sa = Math.sin(a);
    const L = this.L, m2 = maxD * maxD;
    // (la liste garde sa place d'une image à l'autre : remplie par indice, puis coupée à sa longueur — la vider puis la
    // remplir la faisait refaire à chaque image ; parcours par indice : rien n'est alloué)
    let n = 0, m = 0;
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      // (au-delà de la distance de dessin : le jeu ne la dessine pas, comme avant)
      const ex = e.x - cam[0], ez = e.z - cam[2];
      if (ex * ex + ez * ez > m2) continue;
      const r = e.rig;
      if (r && (r.trieVue || r.e1P === 'oiseau') && !e.corpse && !e.ronge && !e.ridden && !e.hidden) {
        const k = e.scale || 1, h = (e.h || 1) * k, R0 = ((e.cfg && e.cfg.radius) || 0.5) * 2 * k + h * 0.5 + 1.5;
        const vx = e.x - cam[0], vy = e.y + h * 0.5 - cam[1], vz = e.z - cam[2], d = Math.sqrt(vx * vx + vy * vy + vz * vz);
        if (d > Math.max(8, R0 + 2)) {
          const sr = R0 / d, cl = (ca * Math.sqrt(1 - sr * sr) - sa * sr) * d; // d · cos(a + asin(R0 / d))
          if (vx * fx + vy * fy + vz * fz < cl && vx * gx + vy * gy + vz * gz < cl) { n++; continue; }
        }
      }
      L[m++] = e;
    }
    L.length = m;
    this.laissees = n;
    return L.length < list.length ? L : null;
  },
};
// les oiseaux que la vague M19 avait refaits en corps d'oiseau (et que ce tri écartait) ont retrouvé leurs modèles
// d'avant à la vague 22 : ils sont marqués comme les quadrupèdes (rig.trieVue), sans rien changer à leur modèle
{
  const OISEAUX = ['hen', 'goose', 'duck', 'farmduck', 'crow', 'songbird', 'pigeon', 'heron', 'stork', 'swan', 'pheasant', 'partridge', 'owl', 'magpie',
    'pic_vert', 'coucou', 'geai', 'alouette', 'effraie', 'cincle', 'grebe', 'butor'];
  for (const id of OISEAUX) {
    const _f = ANIMAL_RIGS[id];
    if (_f) ANIMAL_RIGS[id] = function (...a) { const r = _f.apply(this, a); if (r && r.kind === 'bird') r.trieVue = true; return r; };
  }
}
{
  const _ed = entities.draw;
  entities.draw = function (buf, sbuf, cam, maxD) {
    M19LOD.camE = cam;
    const L0 = this.list, V = Array.isArray(L0) ? M19Vue.trier(L0, cam, maxD) : null, nV = V ? V.length : 0;
    if (V) this.list = V;
    try { return _ed.apply(this, arguments); } finally {
      M19LOD.camE = null;
      // (une bête ajoutée pendant le dessin rejoint la vraie liste)
      if (V && this.list === V) { for (let i = nV; i < V.length; i++) L0.push(V[i]); this.list = L0; }
    }
  };
  const _dr = drawRig;
  drawRig = function (buf, rig, x, y, z, heading, s, flags) {
    if (rig && rig.e1P === 'oiseau' && (M19LOD.camE || M19LOD.force) && M19LOD.loinXZ(M19LOD.camE, x, z, M19LOD.D.betes, rig)) {
      let T = M19B.T.get(rig);
      if (T === undefined) { T = M19B.table(rig); M19B.T.set(rig, T); }
      if (T) { m34Root(M19B.R, x, y, z, heading, s || 1); M19B.emettre(rig, T, buf, M19B.R, flags || 0); return; }
    }
    return _dr(buf, rig, x, y, z, heading, s, flags);
  };
}

// ============================================================================
//  LES ROUES DE LA CHARRETTE (vague M19) : la charrette (attelage) dessine
//  chaque roue en deux carrés croisés, une étoile vue de profil ; on les remplace
//  au passage par une vraie roue (jante en huit pièces, huit rayons, moyeu),
//  qui tourne du même angle. Le reste du modèle ne change pas.
// ============================================================================
// (dessinée à chaque image : la boîte de remplacement est faite une fois ; au loin, les roues d'avant)
{
  const _ch = PROP_MODELS.charrette;
  let boxAvant = null;
  const boxRoues = function (cx, cy, cz, sx, sy, sz, col, code, ry, rx, rz) {
    if (sy === 1.0 && sz === 1.0 && cy === 0.5 && Math.abs(Math.abs(cx) - 0.86) < 1e-6 && (sx === 0.1 || sx === 0.12)) {
      if (sx === 0.1) m19Roue(this, cx, cy, cz, 0.5, 0.1, rx || 0, col, 4);
      return;
    }
    return boxAvant.call(this, cx, cy, cz, sx, sy, sz, col, code, ry, rx, rz);
  };
  if (_ch) PROP_MODELS.charrette = function (E, o, t) {
    if (boxAvant || M19LOD.loin(E, o, M19LOD.D.objets)) return _ch.call(this, E, o, t);
    boxAvant = E.box; E.box = boxRoues;
    try { return _ch.call(this, E, o, t); } finally { E.box = boxAvant; boxAvant = null; }
  };
}
