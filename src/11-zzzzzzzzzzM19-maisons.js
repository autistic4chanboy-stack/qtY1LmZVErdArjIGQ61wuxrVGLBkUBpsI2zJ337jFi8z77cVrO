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
//  Le décor ne touche pas au monde : pas de bloc, pas d'objet, pas de tirage, rien
//  pour les collisions ni les abris ; la maison est notée au passage (w.m19M) et
//  son décor est dessiné quand les objets posés le sont (play.buildProps). Une
//  maison dont le toit est caché (blocs masqués, autre version du monde) n'en a pas.
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
}

const M19M = {
  sombre: rgbf('#4a3626'), zinc: rgbf('#8a9096'), plomb: rgbf('#4e5258'), fer: rgbf('#2e2e33'), pot: rgbf('#b8683a'),
  // le décor d'une maison (repère de la maison : la porte regarde -z, le sol à y = 0)
  dessiner(E, M) {
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
    } else {
      const n = Math.max(2, Math.floor(H / 0.5)), hh = H / n;
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (let k = 0; k < n; k++) {
        const long = (k + (sx * sz > 0 ? 0 : 1)) % 2 === 0, lx = long ? 0.62 : 0.36, lz = long ? 0.36 : 0.62;
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
      for (const s of [-1, 1]) { bx(s * (hx - 0.05), H + rh, 0, 0.07, 0.42, 0.07, M19M.fer, TL.iron); E.box(s * (hx - 0.05), H + rh + 0.46, 0, 0.11, 0.11, 0.11, M19M.fer, TL.iron, Math.PI / 4, Math.PI / 4); }
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
  // les maisons proches (rayon R) : leur décor, dans le tampon des objets posés
  dessinerTout(buf, cam, R) {
    const w = game.world, L = w && w.m19M;
    if (!L || !L.length) return 0;
    if (typeof souterrain !== 'undefined' && souterrain.actif) return 0;
    PE.buf = buf; PE.fl = 0; PE.tint = null; PE.recol = null;
    let n = 0;
    const R2 = R * R;
    for (const M of L) {
      const t = M.toit;
      if (t && (t.hidden || (t.ver && !(t.ver & w.curVer)))) continue;
      const dx = M.f.x - cam[0], dz = M.f.z - cam[2];
      if (dx * dx + dz * dz > R2) continue;
      PE.frame(M.f.x, M.f.y, M.f.z, M.f.r, 1);
      try { M19M.dessiner(PE, M); n++; } catch (e) { console.error('M19 : décor', e); }
    }
    return n;
  },
};
// le dessin : quand le moteur reconstruit les objets posés (tous les 30 m, ou quand quelque chose change)
{
  const _bp = play.buildProps.bind(play);
  play.buildProps = function (cam, sky) {
    const buf = this.propBuf, v0 = buf ? buf.ver : 0;
    const r = _bp(cam, sky);
    if (buf && buf.ver !== v0 && farm.on) {
      try { if (M19M.dessinerTout(buf, cam, (this.propR || 200) + 20)) buf.ver = (buf.ver || 0) + 1; } catch (e) { console.error('M19 : maisons', e); }
    }
    return r;
  };
}

// ============================================================================
//  LES ROUES DE LA CHARRETTE (vague M19) : la charrette (attelage) dessine
//  chaque roue en deux carrés croisés, une étoile vue de profil ; on les remplace
//  au passage par une vraie roue (jante en huit pièces, huit rayons, moyeu),
//  qui tourne du même angle. Le reste du modèle ne change pas.
// ============================================================================
{
  const _ch = PROP_MODELS.charrette;
  if (_ch) PROP_MODELS.charrette = function (E, o, t) {
    const box = E.box;
    E.box = function (cx, cy, cz, sx, sy, sz, col, code, ry, rx, rz) {
      if (sy === 1.0 && sz === 1.0 && cy === 0.5 && Math.abs(Math.abs(cx) - 0.86) < 1e-6 && (sx === 0.1 || sx === 0.12)) {
        if (sx === 0.1) m19Roue(this, cx, cy, cz, 0.5, 0.1, rx || 0, col, 4);
        return;
      }
      return box.call(this, cx, cy, cz, sx, sy, sz, col, code, ry, rx, rz);
    };
    try { return _ch.call(this, E, o, t); } finally { E.box = box; }
  };
}

// ============================================================================
//  LE CHAT SAUVAGE (vague M19) : il est fait d'un chat domestique grossi, et sa
//  queue d'avant (une seule boîte) avait son bout noir à 0,4 m du pivot ; avec
//  la queue en deux segments, le bout va au bout du second, la queue est épaisse
//  d'un bout à l'autre et portée basse, presque à l'horizontale.
// ============================================================================
{
  const _cs = ANIMAL_RIGS.chat_sauvage;
  if (_cs) ANIMAL_RIGS.chat_sauvage = function (...a) {
    const r = _cs.apply(this, a);
    try {
      const tb = r.part('tailb'), bt = r.part('bout'), tq = r.part('tail');
      if (tb && bt && tq) {
        tq.s = [tq.s[0], Math.abs(tb.p[1]) + 0.012, tq.s[2]]; tq.o = [0, -tq.s[1] / 2 + 0.006, tq.o[2]];
        tb.s = [tq.s[0] * 0.95, tb.s[1], tq.s[2] * 0.95];
        bt.parent = 'tailb'; bt.pi = r.idx.tailb; bt.p = [0, -tb.s[1] + 0.03, 0];
      }
      if (r.q2) r.q2.tl = 0.9;
    } catch (e) { console.warn('M19 : chat sauvage', e); }
    return r;
  };
}
