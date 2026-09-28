// ============================================================================
//  LA CHARRETTE ATTELÉE
//  À cheval (ou à dos d'âne), un harnais dans la sacoche : on regarde sa
//  charrette, E, et on l'attelle. Elle suit le cheval comme une vraie
//  remorque (brancards, roues qui tournent, relief), on va moins vite.
//  Pied à terre, le cheval attend, attelé ; E sur la charrette : son
//  chargement (capacité limitée), ou la dételer. Un cheval qu'on ramène à
//  l'écurie pour la nuit est dételé : la charrette reste où elle est.
//  Sauvegarde : farm.s.attelage { on, cid, aid, hh } ; la charrette elle-même
//  est un objet posé (farm.s.props, dont on tient la copie à jour).
// ============================================================================

const ATTELAGE = { L: 3.2, cap: 240, vitesse: 0.72, vitesseChargee: 0.6, voie: 1.72, roue: 0.5, braque: 1.3 };

const attelage = {
  e: null, q: null, anim: null, dernier: null,
  S() { const s = farm.s; return s.attelage || (s.attelage = { on: false, cid: null, aid: null, hh: 0 }); },
  // une charrette du joueur (pas celles des villes, qui sont au décor)
  aMoi(q) { const w = game.world; return !!q && q.id === 'charrette' && w.props.indexOf(q) >= farm.genProps; },
  // identifiant stable, rangé dans ses données (donc sauvegardé avec elle)
  cid(q) {
    if (!q.data || !q.data.cid) farm.setPropData(q, { cid: 'ch' + Date.now().toString(36) + ((Math.random() * 1e4) | 0), items: (q.data && q.data.items) || {} });
    if (!q.data.items) farm.setPropData(q, { items: {} });
    return q.data.cid;
  },
  parCid(cid) { const w = game.world; return cid ? w.props.find((q) => q.id === 'charrette' && q.data && q.data.cid === cid && w.live(q)) || null : null; },
  copie(q) { const cid = q.data && q.data.cid; return cid ? farm.s.props.find((p) => p.id === 'charrette' && p.data && p.data.cid === cid) || null : null; },
  cheval() {
    const A = this.S();
    if (!A.aid) return null;
    if (this.e && !this.e.removed && !this.e.dead && this.e.aid === A.aid) return this.e;
    this.e = entities.extra.find((e) => e.owner && e.aid === A.aid && !e.removed && !e.dead) || null;
    return this.e;
  },
  attele() { return !!this.S().on; },
  charge(q) { const I = q && q.data && q.data.items; return I ? Object.values(I).reduce((a, n) => a + (n > 0 ? n : 0), 0) : 0; },
  // monté, c'est le cavalier qui donne la position et le cap du cheval
  pose(e) {
    const p = game.player;
    if (p.riding === e) return { x: p.pos[0], y: p.pos[1], z: p.pos[2], h: p.yaw + Math.PI };
    return { x: e.x, y: e.y, z: e.z, h: e.heading };
  },
  // l'assiette d'une charrette arrêtée : elle suit le terrain
  assiette(q) {
    const w = game.world, fx = Math.sin(q.r || 0), fz = Math.cos(q.r || 0), rx = Math.cos(q.r || 0), rz = -Math.sin(q.r || 0);
    const y = w.groundAt(q.x, q.z, q.y + 0.6, 0.8);
    const yF = w.groundAt(q.x + fx * 1.3, q.z + fz * 1.3, y + 0.8, 0.8), yB = w.groundAt(q.x - fx * 1.3, q.z - fz * 1.3, y + 0.8, 0.8);
    const yR = w.groundAt(q.x + rx * 0.86, q.z + rz * 0.86, y + 0.8, 0.8), yL = w.groundAt(q.x - rx * 0.86, q.z - rz * 0.86, y + 0.8, 0.8);
    q.y = y;
    q.tilt = [-clamp(Math.atan2(yF - yB, 2.6), -0.5, 0.5), clamp(Math.atan2(yR - yL, ATTELAGE.voie), -0.5, 0.5)];
  },
  // la copie sauvegardée suit la charrette
  sauverPos(q) { const c = this.copie(q); if (c) { c.x = Math.round(q.x * 100) / 100; c.y = Math.round(q.y * 100) / 100; c.z = Math.round(q.z * 100) / 100; c.r = Math.round(q.r * 1000) / 1000; } },

  // ------------------------------------------------------------- atteler, dételer
  // E à cheval : si l'on regarde une de ses charrettes, tout près, on l'attelle
  essayer() {
    const p = game.player, e = p.riding, A = this.S(), w = game.world;
    if (!e || !e.owner || (e.kind !== 'horse' && e.kind !== 'donkey')) return false;
    if (typeof horses !== 'undefined' && horses.rodeo) return false;
    if (A.on) return false; // déjà attelée : E fait descendre, le cheval attend
    const eye = p.eyePos(), f = cameraBasis(p.yaw, p.pitch).f, fh = Math.hypot(f[0], f[2]) || 1;
    let best = null, bd = 6.5;
    for (const q of w.props) {
      if (q.id !== 'charrette' || !w.live(q) || !this.aMoi(q)) continue;
      const dx = q.x - eye[0], dz = q.z - eye[2], d = Math.hypot(dx, dz);
      if (d > bd || (dx * f[0] + dz * f[2]) / ((d || 1) * fh) < 0.45) continue;
      best = q; bd = d;
    }
    if (!best) return false;
    if (!farm.count('harnais')) { ui.subtitle('', '(Il faudrait un harnais pour atteler la charrette.)', 3); sound.click && sound.click(); return true; }
    this.atteler(best, e);
    return true;
  },
  atteler(q, e) {
    const A = this.S(), w = game.world;
    if (A.on) this.deteler(true);
    A.on = true; A.cid = this.cid(q); A.aid = e.aid;
    this.e = e; this.q = q; this.dernier = null; this.dernierH = null;
    removePropCollider(w, q); w.grid = null;
    farm.setPropData(q, { hitched: 1 });
    this.anim = { t: 0, x0: q.x, z0: q.z };
    sound.equip && sound.equip(); sound.chain && sound.chain();
    sound.animal && sound.animal(e.kind === 'donkey' ? 'donkey' : 'horse', 0, 0.45);
    ui.subtitle('', e.kind === 'donkey' ? '(Vous passez le harnais à l’âne, bouclez les sangles, glissez les brancards. La charrette est attelée.)' : '(Vous passez le harnais, bouclez les sangles, glissez les brancards. La charrette est attelée.)', 4);
    return true;
  },
  deteler(silencieux) {
    const A = this.S(), w = game.world, q = this.q || this.parCid(A.cid);
    A.on = false;
    if (q) {
      farm.setPropData(q, { hitched: 0 });
      this.assiette(q);
      this.sauverPos(q);
      removePropCollider(w, q); addPropCollider(w, q); w.grid = null;
    }
    this.e = null; this.q = null; this.anim = null; this.dernier = null; this.dernierH = null;
    if (!silencieux) { ui.subtitle('', '(Vous dételez. Les brancards retombent dans l’herbe.)', 3); sound.place && sound.place(); }
  },
  // E sur la charrette, pied à terre : son chargement (ou la dételer)
  utiliser(q) {
    if (!this.aMoi(q)) { ui.subtitle('', '(Ce n’est pas votre charrette.)', 2); return; }
    const A = this.S();
    if (A.on && this.q === q) {
      ui.choice('La charrette', 'Elle est attelée.', [
        { label: 'Voir le chargement', fn: () => this.ouvrir(q) },
        { label: 'Dételer', fn: () => { ui.close(); this.deteler(); } },
        { label: 'Laisser', fn: () => ui.close() },
      ]);
      return;
    }
    this.ouvrir(q);
  },
  ouvrir(q) {
    this.cid(q);
    ui.openStore('Charrette', q.data.items, 'charrette');
    if (ui.store) ui.store.cart = q;
  },

  // ------------------------------------------------------------- chaque image : la remorque
  update(dt) {
    const A = this.S(), w = game.world, p = game.player;
    if (!A.on) return;
    let q = this.q;
    if (!q || q.gone || w.props.indexOf(q) < 0) q = this.q = this.parCid(A.cid);
    if (!q) { A.on = false; this.e = null; return; }
    const e = this.cheval();
    if (!e) { this.deteler(true); return; } // la bête n'est plus là (perdue, morte, dans l'Envers…)
    const P = this.pose(e);
    // un saut (nuit à l'écurie, échelle, téléportation) : on dételle, la charrette reste où elle est
    if (this.dernier && Math.hypot(P.x - this.dernier[0], P.z - this.dernier[1]) > 8) { this.deteler(true); return; }
    this.dernier = [P.x, P.z];
    const L = ATTELAGE.L, fx = Math.sin(P.h), fz = Math.cos(P.h);
    const hx = P.x + fx * 0.35, hz = P.z + fz * 0.35; // point d'attache, entre les épaules
    const pas = this.dernierH ? Math.hypot(hx - this.dernierH[0], hz - this.dernierH[1]) : 0;
    this.dernierH = [hx, hz];
    let ax, az;
    if (this.anim) {
      // à l'attelage, la charrette vient se placer derrière la bête
      const k = Math.min(1, (this.anim.t += dt) / 0.6), s = k * k * (3 - 2 * k);
      ax = lerp(this.anim.x0, hx - fx * L, s); az = lerp(this.anim.z0, hz - fz * L, s);
      if (k >= 1) this.anim = null;
    } else {
      // remorque : l'essieu reste à L du point d'attache, dans l'axe des brancards
      let dx = hx - q.x, dz = hz - q.z;
      const d = Math.hypot(dx, dz) || 1e-3;
      let cx = dx / d, cz = dz / d;
      // les brancards ne braquent pas au-delà d'un certain angle : en avançant, la charrette pivote avec la bête
      // (sur place, quand le cavalier regarde derrière lui, elle ne bouge pas)
      const ang = Math.atan2(cx * fz - cz * fx, cx * fx + cz * fz);
      if (Math.abs(ang) > ATTELAGE.braque && pas > 0) {
        const rot = Math.sign(ang) * Math.min(Math.abs(ang) - ATTELAGE.braque, pas / L * 3), c = Math.cos(rot), sn = Math.sin(rot);
        const nx = cx * c - cz * sn, nz = cx * sn + cz * c; cx = nx; cz = nz;
      }
      ax = hx - cx * L; az = hz - cz * L;
    }
    const r = Math.atan2(hx - ax, hz - az);
    // les roues tournent selon le chemin parcouru (en avant ou en arrière)
    const avance = (ax - q.x) * Math.sin(r) + (az - q.z) * Math.cos(r);
    q.roue = ((q.roue || 0) + avance / ATTELAGE.roue) % TAU;
    // le relief : hauteur de l'essieu, tangage (vers la bête), roulis (d'une roue à l'autre)
    const y = w.groundAt(ax, az, (q.y || P.y) + 0.8, 0.8), yH = w.groundAt(hx, hz, P.y + 0.8, 0.8);
    const rx = Math.cos(r), rz = -Math.sin(r);
    const yR = w.groundAt(ax + rx * 0.86, az + rz * 0.86, y + 0.8, 0.8), yL = w.groundAt(ax - rx * 0.86, az - rz * 0.86, y + 0.8, 0.8);
    q.x = ax; q.z = az; q.y = y; q.r = r;
    q.tilt = [-clamp(Math.atan2(yH - y, L), -0.6, 0.6), clamp(Math.atan2(yR - yL, ATTELAGE.voie), -0.5, 0.5)];
    this.sauverPos(q);
    // on va moins vite (plus encore chargée) ; le trot reste possible, pas le grand galop
    if (p.riding === e) p.mods.speed *= this.charge(q) > 0 ? ATTELAGE.vitesseChargee : ATTELAGE.vitesse;
    // un peu de bruit : les roues sur les cailloux, le bois qui grince
    const v = Math.abs(avance) / Math.max(dt, 1e-3);
    this.bruitT = (this.bruitT || 0) - dt * v;
    if (this.bruitT <= 0) { this.bruitT = 2.2 + Math.random() * 2; if (sound.ok && v > 0.5) { const t = sound.ctx.currentTime + 0.01; sound.noiseHit(t, 0.08, 'lowpass', 500, 0.8, 0.05, null); if (Math.random() < 0.3) sound.voice(t + 0.05, 'sawtooth', 220, 180, 0.25, 0.008, sound.sfx, { lp: 700 }); } }
  },
  // le collier sur les épaules de la bête, les traits jusqu'au bout des brancards
  dessiner(buf) {
    const A = this.S();
    if (!A.on || !this.q) return;
    const e = this.cheval();
    if (!e) return;
    const P = this.pose(e), q = this.q, don = e.kind === 'donkey', sc = e.scale || 1;
    PE.buf = buf;
    const cuir = rgbf('#4a3020'), corde = rgbf('#8a6a44');
    PE.frame(P.x, P.y, P.z, P.h, sc);
    PE.box(0, don ? 1.2 : 1.5, don ? 0.52 : 0.7, don ? 0.5 : 0.62, 0.52, 0.16, cuir, TL.leather, 0, -0.45);
    PE.box(0, don ? 0.95 : 1.2, don ? 0.1 : 0.15, don ? 0.52 : 0.66, 0.1, 0.12, cuir, TL.leather);
    // repères du monde : bouts des brancards (charrette) et flancs du collier (bête)
    const M = attelage._M || (attelage._M = new Float32Array(12));
    m34TR(M, q.x, q.y, q.z, (q.tilt && q.tilt[0]) || 0, q.r || 0, (q.tilt && q.tilt[1]) || 0);
    const W = (m, lx, ly, lz) => [m[0] * lx + m[1] * ly + m[2] * lz + m[3], m[4] * lx + m[5] * ly + m[6] * lz + m[7], m[8] * lx + m[9] * ly + m[10] * lz + m[11]];
    const H = attelage._H || (attelage._H = new Float32Array(12));
    m34Root(H, P.x, P.y, P.z, P.h, sc);
    for (const s of [-1, 1]) {
      const a = W(M, s * 0.5, 0.74, 3.3), b = W(H, s * (don ? 0.26 : 0.32), don ? 1.15 : 1.42, don ? 0.45 : 0.62);
      this.ligne(a, b, 0.035, corde, TL.rope);
    }
  },
  ligne(a, b, ep, col, tex) {
    const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], L = Math.hypot(dx, dy, dz);
    if (L < 0.01) return;
    PE.frame((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, Math.atan2(dx, dz), 1);
    PE.box(0, 0, 0, ep, ep, L, col, tex, 0, -Math.atan2(dy, Math.hypot(dx, dz)));
  },
  // avant d'écrire la sauvegarde : la monture et le cheval attelé sont là où ils sont
  avantSauvegarde() {
    const p = game.player, s = farm.s;
    if (!s) return;
    const e = p.riding;
    if (e && e.owner && e.aid) { const a = s.animals.find((q) => q.id === e.aid); if (a) { a.x = Math.round(p.pos[0] * 100) / 100; a.z = Math.round(p.pos[2] * 100) / 100; } }
    const A = this.S();
    if (A.on) {
      const h = this.cheval();
      if (h) { const P = this.pose(h); A.hh = Math.round(P.h * 1000) / 1000; if (p.riding !== h) { const a = s.animals.find((q) => q.id === A.aid); if (a) { a.x = Math.round(h.x * 100) / 100; a.z = Math.round(h.z * 100) / 100; } } }
      if (this.q) this.sauverPos(this.q);
    }
  },
  charger() {
    const A = this.S(), w = game.world;
    this.e = null; this.q = null; this.anim = null; this.dernier = null; this.dernierH = null;
    for (const q of w.props) if (q.id === 'charrette' && this.aMoi(q)) { if (q.data && q.data.hitched && !(A.on && q.data.cid === A.cid)) farm.setPropData(q, { hitched: 0 }); this.assiette(q); }
    if (A.on) {
      const q = this.parCid(A.cid), e = this.cheval();
      if (q && e) { this.q = q; removePropCollider(w, q); w.grid = null; if (A.hh !== undefined) e.heading = A.hh; farm.setPropData(q, { hitched: 1 }); }
      else { A.on = false; if (q) farm.setPropData(q, { hitched: 0 }); }
    }
  },
};

// ---------------------------------------------------------------- le modèle : roues qui tournent, assiette, chargement
DYN_PROPS.add('charrette');
PROP_MODELS.charrette = function (E, o) {
  const d = o.data || {};
  if (o.tilt) m34TR(E.M, o.x, o.y, o.z, o.tilt[0], o.r || 0, o.tilt[1]);
  const hi = typeof game !== 'undefined' && game.hiProp === o;
  if (hi) E.fl = FX_HI;
  // plateau et ridelles
  E.bx(0, 0.75, 0, 1.5, 0.12, 2.6, WHITE, TL.wood);
  for (const s of [-1, 1]) E.bx(s * 0.72, 0.87, 0, 0.08, 0.45, 2.6, WHITE, TL.darkwood);
  E.bx(0, 0.87, -1.26, 1.5, 0.45, 0.08, WHITE, TL.darkwood); E.bx(0, 0.87, 1.26, 1.5, 0.45, 0.08, WHITE, TL.darkwood);
  for (const z of [-0.9, 0, 0.9]) E.bx(0, 0.62, z, 1.4, 0.1, 0.1, WHITE, TL.darkwood);
  // essieu et roues (elles tournent en roulant)
  const a = o.roue || 0;
  E.box(0, 0.5, 0, 1.9, 0.1, 0.1, PC.iron, TL.iron);
  for (const s of [-1, 1]) {
    E.box(s * 0.86, 0.5, 0, 0.1, 1.0, 1.0, WHITE, TL.darkwood, 0, a);
    E.box(s * 0.86, 0.5, 0, 0.12, 1.0, 1.0, WHITE, TL.darkwood, 0, a + Math.PI / 4);
    E.box(s * 0.93, 0.5, 0, 0.06, 0.2, 0.2, PC.iron, TL.iron, 0, a);
  }
  // brancards : à l'horizontale, attelée ; posés dans l'herbe, sinon
  for (const s of [-0.5, 0.5]) { if (d.hitched) E.box(s, 0.74, 2.25, 0.08, 0.08, 2.1, WHITE, TL.wood); else E.box(s, 0.45, 2.2, 0.08, 0.08, 2.1, WHITE, TL.wood, 0, 0.4); }
  if (d.hitched) E.box(0, 0.74, 1.45, 1.1, 0.07, 0.07, WHITE, TL.darkwood);
  // chargement : celui des villes (foin, tonneaux, caisses), ou ce qu'on y a mis
  const k = d.k, n = d.load || 0;
  if (k === 'foin') { E.bx(0, 0.81, 0.1, 1.3, 0.6, 2.3, WHITE, TL.hay); E.bx(0, 1.41, 0.1, 1.0, 0.3, 1.8, WHITE, TL.hay, 0.05); }
  else if (k === 'tonneaux') { for (const [x, z] of [[-0.33, -0.6], [0.33, -0.6], [0, 0.5]]) E.bx(x, 0.81, z, 0.55, 0.75, 0.55, WHITE, TL.barrel); }
  else if (k) { E.bx(-0.28, 0.81, 0.3, 0.6, 0.5, 0.6, WHITE, mt(M_CRATE)); E.bx(0.32, 0.81, -0.5, 0.5, 0.42, 0.5, WHITE, mt(M_CRATE)); E.bx(0.25, 0.81, 0.7, 0.45, 0.6, 0.3, rgbf('#c8b088'), TL.cloth); }
  else if (n > 0) {
    E.bx(-0.3, 0.81, -0.7, 0.55, 0.42, 0.7, rgbf('#c8b088'), TL.sack);
    if (n > 20) E.bx(0.32, 0.81, -0.6, 0.55, 0.5, 0.55, WHITE, mt(M_CRATE));
    if (n > 60) E.bx(0, 0.81, 0.45, 1.2, 0.45, 1.0, WHITE, TL.hay);
    if (n > 140) { E.bx(-0.3, 1.23, -0.7, 0.5, 0.35, 0.6, rgbf('#b8a078'), TL.sack); E.bx(0.25, 1.26, 0.4, 0.5, 0.4, 0.5, WHITE, TL.barrel); }
  }
  if (hi) E.fl = 0;
};

// ---------------------------------------------------------------- branchements
{
  // une charrette posée : un identifiant et un chargement vide
  const _add = farm.addProp.bind(farm);
  farm.addProp = function (p) {
    if (p && p.id === 'charrette' && !(p.data && p.data.cid)) p.data = Object.assign({ cid: 'ch' + Date.now().toString(36) + ((Math.random() * 1e4) | 0), items: {} }, p.data || {});
    const q = _add(p);
    if (q && q.id === 'charrette') attelage.assiette(q);
    return q;
  };
  // attelé et pas monté, le cheval attend (il broute) ; sifflé, il vient, et la charrette suit
  const _uw = entities.updateWalker.bind(entities);
  entities.updateWalker = function (e, dt, w, c) {
    if (e.owner && farm.s && e.aid && !e.ridden && !e.follow) {
      const A = farm.s.attelage;
      if (A && A.on && A.aid === e.aid) {
        e.state = 'idle'; e.timer = 5; e.run = false;
        e.move = lerp(e.move || 0, 0, Math.min(1, dt * 6));
        e.grazeT = Math.max(0, Math.sin(c.t * 0.3 + e.seed) * 1.2);
        e.lookY = lerp(e.lookY || 0, 0, Math.min(1, dt * 2));
        return;
      }
    }
    return _uw(e, dt, w, c);
  };
}
PROP_USE_MORE.charrette = 1;
HOOKS.propPre.charrette = (q) => { attelage.utiliser(q); return true; };
HOOKS.update.push((dt) => { if (farm.s && game.world) attelage.update(dt); });
HOOKS.draw.push((buf) => attelage.dessiner(buf));
let attelageHooksOn = false;
HOOKS.load.push(() => {
  if (!attelageHooksOn) {
    attelageHooksOn = true;
    // E à cheval, en regardant sa charrette : on l'attelle (sinon, on descend, comme d'habitude)
    const _int = game.interact.bind(game);
    game.interact = function () {
      if (this.player.riding && !(typeof cine !== 'undefined' && cine.on) && attelage.essayer()) return;
      return _int();
    };
    // le chargement : une capacité limitée
    const _rs = ui.renderStore.bind(ui);
    ui.renderStore = function () {
      _rs();
      const S = this.store;
      if (!S || S.mode !== 'charrette') return;
      const store = S.store, s = farm.s, cap = ATTELAGE.cap;
      const total = () => Object.values(store).reduce((a, n) => a + (n > 0 ? n : 0), 0);
      const n = total();
      const h = $('#store .body h4');
      if (h) h.textContent = `Dans la charrette (${n} / ${cap})`;
      $$('#store [data-put]').forEach((b) => (b.onclick = (ev) => {
        const id = b.dataset.put, place = cap - total();
        if (place <= 0) { sound.click && sound.click(); ui.subtitle('', '(La charrette est pleine.)', 2); return; }
        const k = Math.min(ev.shiftKey ? s.inv[id] || 0 : 1, place);
        if (!(k > 0) || !farm.take(id, k)) return;
        store[id] = (store[id] || 0) + k;
        this.renderStore();
      }));
      if (S.cart && S.cart.data) S.cart.data.load = n;
    };
    // on ne démonte pas au marteau une charrette attelée, ni une charrette pleine
    const _dis = play.dismantle.bind(play);
    play.dismantle = function (q) {
      if (q && q.id === 'charrette') {
        if (attelage.attele() && attelage.q === q) { sound.impact && sound.impact('wood'); ui.subtitle('', '(Dételez-la d’abord.)', 2); return; }
        if (attelage.charge(q) > 0) { sound.impact && sound.impact('wood'); ui.subtitle('', '(Videz-la d’abord.)', 2); return; }
      }
      return _dis(q);
    };
    // la sauvegarde retient où sont la monture, le cheval attelé et la charrette
    const _save = farm.save.bind(farm);
    farm.save = function () { try { attelage.avantSauvegarde(); } catch (err) { console.error(err); } return _save(); };
  }
  attelage.charger();
});
