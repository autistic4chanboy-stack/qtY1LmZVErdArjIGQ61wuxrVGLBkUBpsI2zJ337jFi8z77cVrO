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
//  qu'elles reprennent : les roues de la charrette (attelage), le chat sauvage et
//  les oiseaux du module de la nature.
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
    const vu = (t, f) => {
      if (t && (t.hidden || (t.ver && !(t.ver & w.curVer)))) return false;
      const dx = f.x - cam[0], dz = f.z - cam[2];
      return dx * dx + dz * dz <= R2;
    };
    for (const M of L) {
      if (!vu(M.toit, M.f)) continue;
      PE.frame(M.f.x, M.f.y, M.f.z, M.f.r, 1);
      try { M19M.dessiner(PE, M); n++; } catch (e) { console.error('M19 : décor', e); }
    }
    for (const M of F) {
      if (!vu(M.bloc, M.f)) continue;
      PE.frame(M.f.x, M.f.y, M.f.z, M.f.r, 1);
      try { M19M.fontaine(PE); n++; } catch (e) { console.error('M19 : fontaine', e); }
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

// ============================================================================
//  LES BÊTES QUI PARLENT (vague M19) : Tibert, Hermeline et Bayard sont faits du
//  gabarit des quadrupèdes, et leurs détails étaient posés pour des pattes et des
//  queues d'une seule boîte : le bout de la queue va au bout du second segment,
//  les fanons de Bayard au bas des canons (ils suivent le genou), le moignon
//  d'Hermeline au bout de son canon, à la place de la patte qui lui manque.
// ============================================================================
{
  // une pièce rattachée à une autre (qui la précède dans la liste : les pièces en plus sont au bout)
  const reprendre = (r, n, par, p) => { const q = r.part(n); if (!q || r.idx[par] === undefined || r.idx[par] > r.idx[n]) return null; q.parent = par; q.pi = r.idx[par]; q.p = p; return q; };
  const bout = (r) => {
    const tb = r.part('tailb');
    if (!tb) return;
    const flat = tb.s[2] > tb.s[1];
    reprendre(r, 'bout', 'tailb', flat ? [0, 0, -tb.s[2] + 0.03] : [0, -tb.s[1] + 0.025, 0]);
  };
  const W = (id, fn) => {
    const _f = ANIMAL_RIGS[id];
    if (_f) ANIMAL_RIGS[id] = function (...a) { const r = _f.apply(this, a); try { fn(r); } catch (e) { console.warn('M19 : ' + id, e); } return r; };
  };
  W('p_chat', bout);
  W('p_renarde', (r) => {
    bout(r);
    const lo = r.part('legFLb');
    if (lo && reprendre(r, 'moignon', 'legFLb', [0, -(lo.s[1] - 0.03) + 0.02, 0.004])) { const pw = r.part('legFLh'); if (pw) pw.hide = true; }
  });
  W('p_cheval', (r) => {
    for (const n of ['legFL', 'legFR', 'legBL', 'legBR']) { const lo = r.part(n + 'b'); if (lo) reprendre(r, 'fanon' + n, n + 'b', [0, -(lo.s[1] - 0.03) + 0.14, 0]); }
  });
}

// ============================================================================
//  LES OISEAUX DES BOIS, DES PRÉS ET DES EAUX (vague M19) : ceux du module de la
//  nature (11-zzzz8) étaient faits d'une boîte, de deux planches et de deux
//  bâtons ; les voici avec les corps d'oiseau (ailes repliées au repos,
//  déployées en vol, yeux, plumes). Mêmes noms, mêmes tailles ; les pièces que
//  les comportements font bouger (neckB, head, wingL/R) sont là. La grue garde
//  son modèle (ses poses de vol lui sont propres).
// ============================================================================
Object.assign(ANIMAL_RIGS, {
  // pic vert : vert, croupion jaune, calotte rouge, moustache noire, long bec
  pic_vert: () => {
    const body = [0.08, 0.11, 0.16], head = [0.058, 0.06, 0.068];
    return e1Oiseau({
      body, bodyY: 0.1, dos: rgbf('#6a9a40'), bodyTex: TL.m19Plumes, ventre: rgbf('#c8d090'), ventreS: 0.6, head, headCol: rgbf('#7aaa48'), beak: [0.012, 0.012, 0.05], beakCol: rgbf('#5a5a50'), beakY: 0.42,
      tail: [0.05, 0.012, 0.07], tailCol: rgbf('#4a6a2a'), tailUp: -0.3, wing: [0.2, 0.01, 0.09], wingCol: rgbf('#5a8a34'), wingTip: rgbf('#3a3a2a'), pliCol: rgbf('#5a8a34'), pliL: 0.85,
      leg: [0.012, 0.04], legCol: rgbf('#6a6a60'), droit: -0.5, batF: 12, batA: 0.85,
      plus: [...e1Yeux(head, [0.95, 0.95, 0.9], 1.0, 0.6, 0.6),
        { name: 'calotte', parent: 'head', p: [0, head[1] * 0.95, -head[2] * 0.05], s: [head[0] * 0.8, head[1] * 0.18, head[2] * 0.9], col: rgbf('#d02a20'), tex: TL.fur },
        { name: 'moustL', parent: 'head', p: [-head[0] / 2 - 0.001, head[1] * 0.25, head[2] * 0.45], s: [0.003, head[1] * 0.16, head[2] * 0.4], col: rgbf('#1a1a1a'), tex: TL.plain },
        { name: 'moustR', parent: 'head', p: [head[0] / 2 + 0.001, head[1] * 0.25, head[2] * 0.45], s: [0.003, head[1] * 0.16, head[2] * 0.4], col: rgbf('#1a1a1a'), tex: TL.plain },
        { name: 'croupion', parent: 'body', p: [0, body[1] * 0.42, -body[2] * 0.38], s: [body[0] * 0.8, 0.012, body[2] * 0.25], col: rgbf('#d8d040'), tex: TL.fur }],
    });
  },
  // coucou : gris, ventre barré, longue queue, ailes pointues, l'œil cerclé de jaune
  coucou: () => {
    const body = [0.07, 0.08, 0.16], head = [0.05, 0.05, 0.058];
    return e1Oiseau({
      body, bodyY: 0.1, dos: rgbf('#8a8e94'), bodyTex: TL.m19Plumes, ventre: rgbf('#d8d8d0'), ventreTex: TL.stripes, ventreS: 0.6, head, headCol: rgbf('#8a8e94'), beak: [0.012, 0.01, 0.022], beakCol: rgbf('#3a3a30'),
      tail: [0.04, 0.012, 0.14], tailCol: rgbf('#5a5e64'), wing: [0.22, 0.01, 0.08], wingCol: rgbf('#7a7e84'), wingTip: rgbf('#4a4e54'), pliCol: rgbf('#6a6e74'), pliL: 1.05,
      leg: [0.01, 0.03], legCol: rgbf('#d8b040'), batF: 11, batA: 0.75,
      plus: [...e1Yeux(head, [0.95, 0.75, 0.15], 1.0, 0.6, 0.6)],
    });
  },
  // geai des chênes : rose-brun, moustache noire, queue noire, croupion blanc, le miroir bleu barré sur l'aile
  geai: () => {
    const body = [0.09, 0.1, 0.18], head = [0.065, 0.065, 0.07];
    return e1Oiseau({
      body, bodyY: 0.11, dos: rgbf('#b09080'), bodyTex: TL.m19Plumes, ventre: rgbf('#c8aa98'), ventreS: 0.6, head, headCol: rgbf('#c0a090'), beak: [0.014, 0.014, 0.028], beakCol: rgbf('#2a2a2a'),
      tail: [0.05, 0.012, 0.1], tailCol: rgbf('#141416'), wing: [0.26, 0.012, 0.11], wingCol: rgbf('#2a2a2e'), miroir: rgbf('#3a6ad0'), dessous: rgbf('#8a7a70'), pliCol: rgbf('#6a5a50'), pliL: 0.9,
      leg: [0.012, 0.05], legCol: rgbf('#a08070'), batF: 12, batA: 0.85,
      plus: [...e1Yeux(head, [0.85, 0.85, 0.95], 1.0, 0.6, 0.6),
        { name: 'moustache', parent: 'head', p: [0, head[1] * 0.2, head[2] * 0.5], s: [head[0] * 1.06, head[1] * 0.14, head[2] * 0.3], col: rgbf('#141416'), tex: TL.plain },
        { name: 'miroirL', parent: 'pliL', p: [-0.007, 0.006, 0.01], s: [0.004, body[1] * 0.22, body[2] * 0.22], col: rgbf('#3a6ad0'), tex: TL.stripes },
        { name: 'miroirR', parent: 'pliR', p: [0.007, 0.006, 0.01], s: [0.004, body[1] * 0.22, body[2] * 0.22], col: rgbf('#3a6ad0'), tex: TL.stripes },
        { name: 'croupion', parent: 'body', p: [0, body[1] * 0.3, -body[2] * 0.46], s: [body[0] * 0.7, body[1] * 0.4, 0.012], col: rgbf('#f2f0ec'), tex: TL.fur }],
    });
  },
  // alouette des champs : brun strié, ventre clair, une petite huppe
  alouette: () => {
    const body = [0.07, 0.07, 0.14], head = [0.05, 0.05, 0.055];
    return e1Oiseau({
      body, bodyY: 0.08, dos: rgbf('#9a8060'), bodyTex: TL.m19Plumes, ventre: rgbf('#d8c8a8'), ventreS: 0.6, head, headCol: rgbf('#9a8060'), beak: [0.01, 0.01, 0.018], beakCol: rgbf('#8a8070'),
      tail: [0.04, 0.01, 0.07], tailCol: rgbf('#6a5440'), wing: [0.17, 0.008, 0.07], wingCol: rgbf('#8a7050'), pliCol: rgbf('#86704e'), pliL: 0.9, leg: [0.009, 0.035], legCol: rgbf('#c0a080'), batF: 20, batA: 0.9,
      plus: [...e1Yeux(head, [0.12, 0.1, 0.08], 1.0, 0.6, 0.6), ...e1Taches('body', 7, body[0], body[1], body[2], rgbf('#4a3a28'), 91),
        { name: 'huppe', parent: 'head', p: [0, head[1], -head[2] * 0.05], s: [0.014, 0.022, 0.028], o: [0, 0.008, 0], col: rgbf('#7a6048'), tex: TL.fur, r0: [-0.5, 0, 0] }],
    });
  },
  // effraie des clochers : dos doré, dessous et face blancs, disque en cœur, yeux noirs, posée droite
  effraie: () => {
    const body = [0.2, 0.28, 0.19], head = [0.17, 0.15, 0.14];
    return e1Oiseau({
      body, bodyY: 0.22, dos: rgbf('#d8b880'), bodyTex: TL.m19Plumes, ventre: rgbf('#f4f0e8'), ventreS: 0.78, head, headCol: rgbf('#d8b880'), headTex: TL.m19Plumes, face: TL.catF,
      beak: [0.02, 0.026, 0.016], beakCol: rgbf('#e8d8c0'), beakY: 0.3, tail: [0.1, 0.014, 0.06], tailCol: rgbf('#d0b080'), tailUp: 0.4,
      wing: [0.5, 0.016, 0.22], wingCol: rgbf('#d0b080'), dessous: rgbf('#f4f0e8'), pliCol: rgbf('#c8a874'), leg: [0.025, 0.08], legCol: rgbf('#f0ece0'), chouette: true, batF: 6, batA: 0.6,
      plus: [{ name: 'disque', parent: 'head', p: [0, head[1] * 0.42, head[2] * 0.7 + 0.001], s: [head[0] * 0.92, head[1] * 0.8, 0.004], col: rgbf('#f6f2ea'), tex: TL.plain },
        { name: 'arete', parent: 'head', p: [0, head[1] * 0.42, head[2] * 0.7 + 0.003], s: [0.006, head[1] * 0.62, 0.003], col: rgbf('#c8a070'), tex: TL.plain },
        ...e1Yeux(head, [0.06, 0.05, 0.05], 1.2, 0.5, 0.55, head[0] * 0.2),
        ...e1Taches('body', 8, body[0], body[1], body[2], [0.5, 0.45, 0.42], 92)],
    });
  },
  // cincle plongeur : brun sombre, la bavette blanche, la tête chocolat, la queue relevée
  cincle: () => {
    const body = [0.07, 0.07, 0.11], head = [0.05, 0.05, 0.052];
    return e1Oiseau({
      body, bodyY: 0.08, dos: rgbf('#3a2a24'), bodyTex: TL.m19Plumes, head, headCol: rgbf('#5a3a2a'), beak: [0.01, 0.01, 0.018], beakCol: [0.1, 0.1, 0.1],
      tail: [0.035, 0.01, 0.04], tailCol: rgbf('#2a201c'), tailUp: 0.6, wing: [0.14, 0.008, 0.06], wingCol: rgbf('#2e2420'), pliCol: rgbf('#33261f'), pliL: 0.9, leg: [0.011, 0.04], legCol: rgbf('#8a7a60'), batF: 22, batA: 0.9,
      plus: [...e1Yeux(head, [0.12, 0.1, 0.08], 1.0, 0.6, 0.6),
        { name: 'bavette', parent: 'body', p: [0, body[1] * 0.12, body[2] * 0.47], s: [body[0] * 0.86, body[1] * 0.6, 0.012], col: [0.95, 0.95, 0.92], tex: TL.fur }],
    });
  },
  // grèbe huppé : posé bas sur l'eau, cou et face blancs, huppe noire, collerette rousse, bec rosé
  grebe: () => {
    const body = [0.14, 0.1, 0.3], head = [0.05, 0.05, 0.07], blanc = [0.95, 0.95, 0.93];
    return e1Oiseau({
      body, bodyY: 0.1, dos: rgbf('#6a5a4a'), bodyTex: TL.m19Plumes, ventre: blanc, ventreS: 0.55, head, headCol: blanc, neck: [0.04, 0.16, 0.04], neckR: [-0.15, 0, 0], neckCol: blanc,
      beak: [0.012, 0.012, 0.06], beakCol: rgbf('#c07070'), beakY: 0.4, tail: [0.04, 0.02, 0.02], tailCol: rgbf('#5a4a3a'), wing: [0.24, 0.01, 0.1], wingCol: rgbf('#5a4a3a'), dessous: blanc,
      pliCol: rgbf('#5e4e3e'), pliL: 0.8, leg: [0.01, 0.01], legCol: rgbf('#5a6a40'), batF: 14, batA: 0.8,
      plus: [...e1Yeux(head, [0.8, 0.2, 0.15], 0.9, 0.6, 0.6),
        { name: 'crete', parent: 'head', p: [0, head[1] * 0.98, -head[2] * 0.12], s: [head[0] * 0.8, head[1] * 0.5, head[2] * 0.6], col: [0.1, 0.08, 0.07], tex: TL.fur },
        { name: 'collerette', parent: 'head', p: [0, head[1] * 0.25, -head[2] * 0.1], s: [head[0] * 1.5, head[1] * 0.6, head[2] * 0.6], col: rgbf('#c86030'), tex: TL.fur }],
    });
  },
  // butor étoilé : roux strié de brun, cou épais, bec jaunâtre, pattes vertes ; il se fige le bec au ciel
  butor: () => {
    const body = [0.18, 0.22, 0.3], head = [0.07, 0.07, 0.09];
    return e1Oiseau({
      body, bodyY: 0.4, dos: rgbf('#9a7a4a'), bodyTex: TL.m19Plumes, ventre: rgbf('#c8a870'), ventreTex: TL.stripes, ventreS: 0.6, head, headCol: rgbf('#7a5a34'),
      neck: [0.07, 0.22, 0.07], neckR: [0.1, 0, 0], neckCol: rgbf('#b8945a'), beak: [0.022, 0.022, 0.12], beakCol: rgbf('#c8b050'), beakY: 0.4,
      tail: [0.08, 0.02, 0.06], tailCol: rgbf('#8a6a40'), wing: [0.5, 0.016, 0.22], wingCol: rgbf('#9a7a4a'), wingTip: rgbf('#5a4a34'), pliCol: rgbf('#8e7044'), pliL: 0.95,
      leg: [0.022, 0.3], legCol: rgbf('#8a9a40'), batF: 5, batA: 0.55,
      plus: [...e1Yeux(head, [0.95, 0.85, 0.2], 0.9, 0.62, 0.6), ...e1Taches('body', 8, body[0], body[1], body[2], rgbf('#3a2a1a'), 93),
        { name: 'calotte', parent: 'head', p: [0, head[1] * 0.92, 0], s: [head[0] * 1.02, head[1] * 0.2, head[2] * 0.9], col: rgbf('#2a2018'), tex: TL.fur }],
    });
  },
});
