// ============================================================================
//  LE DESSOUS — les chemins du retour (agent C3)
//  - le vieux puits de la mine : aux Vieilles Mines, des barreaux montent dans
//    une cheminée jusqu'à la salle de l'éboulement, dans les Galeries (le
//    labyrinthe de la mine). D'en haut, une grosse pierre bouche le trou : elle
//    ne bouge qu'une fois qu'on l'a poussée d'en bas ;
//  - les racines du grand chêne : de la salle des Racines, on grimpe dans les
//    racines jusqu'au pied du grand chêne. D'en haut, le trou entre les racines
//    ne laisse passer qu'une fois qu'on en est sorti ;
//  - les flèches au charbon du géomètre (1872) : sur le sol, de loin en loin,
//    du Hameau d'En-Bas jusqu'au vieux puits, la pointe vers la mine ;
//  - le charbon en main, sous la terre : clic, une flèche au sol vers où l'on
//    regarde ; clic droit tout près d'une flèche : l'effacer.
//  État : farm.s.souterrain.r (sorties ouvertes), farm.s.souterrain.m (marques).
// ============================================================================
// (le vieux puits : une cheminée au-dessus des Vieilles Mines)
const SOUT_PUITS_MINE = [1540.8, 1206];
SOUT_PLAN.cheminees.push([SOUT_PUITS_MINE[0], SOUT_PUITS_MINE[1], 1.35, -62]);

SOUT_GEN.push((w, rnd, B) => {
  const S = souterrain;
  S.creuseurs();
  const R = w.soutRetours = { sorties: [] };
  // ------------------------------------------------ le vieux puits de la mine
  if (w.maze) {
    const M = w.maze, C = (ci) => ci * 5 + 2, ex = M.x0 + (C(11) + 1) * M.R - 2.2, ez = M.z0 + (C(11) + 1) * M.R - 1.6;
    const [bx, bz] = SOUT_PUITS_MINE, by = S.floorAt(bx, bz);
    B.prop('sout_barreaux', bx, by, bz - 0.55, 0, { h: 34 }, 1, VER_SOUS);
    B.inter('sout_sortie', 'sout_sortie_mine', bx, by + 1.2, bz - 0.2, 'Les barreaux', { k: 'mine' });
    // en haut : le trou sous les éboulis (sans la marque du souterrain : il est dans les Galeries)
    B.prop('sout_trou', ex, M.y, ez, 0.4, { bouche: 1 });
    R.trou = w.props.length - 1;
    B.inter('sout_trou', 'sout_trou_mine', ex, M.y + 0.6, ez, 'Des éboulis', { k: 'mine' });
    R.sorties.push({ k: 'mine', bas: [bx, by + 0.05, bz + 0.9], haut: [ex + 1.4, M.y + 0.05, ez + 1.2] });
  }
  // ------------------------------------------------ les racines du grand chêne
  const ch = w.lm && w.lm.chene, cm = SOUT_PLAN.cheminees.find((q) => Math.hypot(q[0] - 1760, q[1] - 2374) < 3);
  if (ch && cm) {
    const [cx, cz] = cm, cy = S.floorAt(cx, cz);
    B.prop('sout_echelle_racines', cx, cy, cz - 0.7, 0, { h: 12 }, 1, VER_SOUS);
    B.inter('sout_sortie', 'sout_sortie_chene', cx, cy + 1.2, cz - 0.4, 'Les racines', { k: 'chene' });
    // en haut : un trou entre les racines, au pied de l'arbre
    let hx = null, hz = null;
    for (let k = 0; k < 40 && hx === null; k++) {
      const a = k * 2.39996, d = 3.2 + (k % 5) * 0.6, x = ch.x + Math.cos(a) * d, z = ch.z + Math.sin(a) * d;
      if (w.heightAt(x, z) < w.waterLevel + 0.5 || w.normalAt(x, z)[1] < 0.85) continue;
      if (w.props.some((q) => Math.abs(q.x - x) < 1.6 && Math.abs(q.z - z) < 1.6)) continue;
      if (typeof pointFree === 'function' && !pointFree(w, x, z, 0.9)) continue;
      hx = x; hz = z;
    }
    if (hx !== null) {
      const hy = w.heightAt(hx, hz);
      B.prop('sout_trou', hx, hy - 0.05, hz, rnd() * TAU, { petit: 1 });
      B.inter('sout_trou', 'sout_trou_chene', hx, hy + 0.4, hz, 'Un trou', { k: 'chene' });
      const a = Math.atan2(hx - ch.x, hz - ch.z);
      R.sorties.push({ k: 'chene', bas: [cx, cy + 0.05, cz + 0.8], haut: [hx + Math.sin(a) * 1.3, hy + 0.1, hz + Math.cos(a) * 1.3] });
    }
  }
  // ------------------------------------------------ les flèches du géomètre : du hameau au vieux puits, la pointe vers la mine
  const V = w.soutVillage;
  if (V && w.maze) {
    S.construire();
    const W = SOUT_W, N = SOUT_N, F = S.F, Vt = S.V;
    if (F && Vt) {
      const idx = (x, z) => Math.round(z / SOUT_CELL) * W + Math.round(x / SOUT_CELL);
      const ok = (k) => Vt[k] - F[k] > 1.6 && F[k] > SOUT_WL - 0.4 && F[k] < SOUT_ROCK - 1;
      const dist = new Int32Array(W * W).fill(-1), file = new Int32Array(W * W);
      const s0 = idx(SOUT_PUITS_MINE[0], SOUT_PUITS_MINE[1] + 1);
      let a = 0, b = 0;
      dist[s0] = 0; file[b++] = s0;
      while (a < b) {
        const k = file[a++], i = k % W, j = (k / W) | 0;
        for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const ii = i + di, jj = j + dj;
          if (ii < 0 || jj < 0 || ii > N || jj > N) continue;
          const q = jj * W + ii;
          if (dist[q] >= 0 || !ok(q) || Math.abs(F[q] - F[k]) > 1.2) continue;
          dist[q] = dist[k] + 1; file[b++] = q;
        }
      }
      let k = idx(V.entree[0], V.entree[1]);
      if (dist[k] < 0) { for (let r = 1; r < 6 && dist[k] < 0; r++) for (let dj = -r; dj <= r && dist[k] < 0; dj++) for (let di = -r; di <= r; di++) { const q = k + dj * W + di; if (q >= 0 && q < W * W && dist[q] >= 0) { k = q; break; } } }
      if (dist[k] >= 0) {
        // on descend la pente des distances jusqu'au puits ; une flèche tous les soixante-dix mètres environ
        const pts = [];
        while (dist[k] > 0) {
          const i = k % W, j = (k / W) | 0;
          pts.push([i * SOUT_CELL, j * SOUT_CELL]);
          let best = k;
          for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const q = (j + dj) * W + i + di; if (dist[q] >= 0 && dist[q] < dist[best]) best = q; }
          if (best === k) break;
          k = best;
        }
        let acc = 40, n = 0;
        for (let i = 1; i + 6 < pts.length; i++) {
          acc += SOUT_CELL;
          if (acc < 70) continue;
          const [x, z] = pts[i], [x2, z2] = pts[i + 6];
          const dx = x2 - x, dz = z2 - z, L = Math.hypot(dx, dz) || 1, nx = -dz / L, nz = dx / L;
          // un peu sur le côté du passage
          const side = (n % 2 ? 1 : -1) * 1.1, fx = x + nx * side, fz = z + nz * side;
          if (!S.ouvert(fx, fz, 1.8) || Math.abs(S.floorAt(fx, fz) - S.floorAt(x, z)) > 0.5) continue;
          B.prop('sout_fleche', fx, S.floorAt(fx, fz) + 0.01, fz, Math.atan2(dx, dz), { p: 1 }, undefined, VER_SOUS);
          acc = 0; n++;
        }
        R.fleches = n; R.chemin = pts.length * SOUT_CELL;
      }
    }
  }
});

// ---------------------------------------------------------------- monter, descendre
const soutRetours = {
  R() { const S = souterrain.S(); return S.r || (S.r = {}); },
  sortie(k) { const w = game.world; return w && w.soutRetours && w.soutRetours.sorties.find((q) => q.k === k); },
  async monter(it) {
    const k = it.data && it.data.k, s = this.sortie(k);
    if (!s || this.passe) return;
    const p = game.player;
    if (p.legBroken || (typeof corps !== 'undefined' && corps.jambeCassee && corps.jambeCassee())) { ui.subtitle('', '(Pas avec cette jambe.)', 2.5); return; }
    this.passe = true;
    const R = this.R(), premier = !R[k];
    const txt = k === 'mine' ? (premier ? 'Les barreaux montent dans le noir, rongés, certains descellés. Tout en haut, une pierre bouche le passage. Vous poussez. Elle bascule.' : 'Les barreaux, la cheminée, la pierre que vous aviez poussée.') : (premier ? 'Vous montez dans les racines, longtemps, la terre dans les yeux. Puis une odeur d’herbe, et le jour, ou ce qui en reste.' : 'Les racines, la terre, et l’herbe.');
    try {
      await ui.fade(true, txt, 900);
      await new Promise((r) => setTimeout(r, premier ? 2600 : 1200));
      R[k] = R[k] || farm.s.day;
      p.pos = s.haut.slice(); p.vel = [0, 0, 0];
      if (k === 'mine') { const w = game.world, q = w.soutRetours && w.props[w.soutRetours.trou]; if (q) farm.setPropData(q, { bouche: 0 }); }
      await ui.fade(false, '', 900);
    } finally { this.passe = false; }
  },
  async descendre(it) {
    const k = it.data && it.data.k, s = this.sortie(k);
    if (!s || this.passe) return;
    const R = this.R();
    if (!R[k]) { ui.subtitle('', k === 'mine' ? '(Des éboulis, et dessous une grosse pierre. Il en sort un souffle froid. Elle ne bouge pas d’ici.)' : '(Entre deux racines, un trou où passe à peine le bras. Il en sort de l’air froid, qui sent la cave.)', 4); return; }
    this.passe = true;
    try {
      await ui.fade(true, k === 'mine' ? 'La pierre, la cheminée, les barreaux froids.' : 'Vous vous glissez entre les racines, les pieds d’abord.', 800);
      await new Promise((r) => setTimeout(r, 1200));
      const p = game.player; p.pos = s.bas.slice(); p.vel = [0, 0, 0];
      await ui.fade(false, '', 900);
    } finally { this.passe = false; }
  },
};
HOOKS.inter.sout_sortie = (it) => soutRetours.monter(it);
HOOKS.inter.sout_trou = (it) => soutRetours.descendre(it);
HOOKS.load.push(() => {
  const w = game.world;
  souterrain.sorties = (w && w.soutRetours && w.soutRetours.sorties) || [];
  soutRetours.passe = false;
  if (!farm.s || !w || !w.soutRetours) return;
  const q = w.props[w.soutRetours.trou];
  if (q && soutRetours.R().mine) q.data = Object.assign({}, q.data, { bouche: 0 });
});

// ---------------------------------------------------------------- les marques au charbon
const soutMarques = {
  L() { const S = souterrain.S(); return S.m || (S.m = []); },
  // le point du sol visé (à moins de 4 m)
  vise(eye, f) {
    const S = souterrain;
    for (let t = 0.4; t < 4; t += 0.1) { const x = eye[0] + f[0] * t, y = eye[1] + f[1] * t, z = eye[2] + f[2] * t; if (y <= S.floorAt(x, z) + 0.02) return [x, S.floorAt(x, z), z]; }
    return null;
  },
  tracer(eye, f) {
    const q = this.vise(eye, f);
    if (!q) return false;
    const L = this.L(), p = game.player;
    if (L.length >= 300) L.shift();
    L.push([+q[0].toFixed(2), +q[1].toFixed(2), +q[2].toFixed(2), +Math.atan2(-Math.sin(p.yaw), -Math.cos(p.yaw)).toFixed(3)]);
    this.n = (this.n || 0) + 1;
    if (this.n % 12 === 0) farm.take('charbon', 1);
    sound.dig && sound.dig(0.15);
    return true;
  },
  effacer(eye, f) {
    const q = this.vise(eye, f), L = this.L();
    if (!q) return false;
    let bi = -1, bd = 0.9;
    L.forEach((m, i) => { const d = Math.hypot(m[0] - q[0], m[2] - q[2]); if (d < bd) { bd = d; bi = i; } });
    if (bi < 0) return false;
    L.splice(bi, 1); sound.click && sound.click();
    return true;
  },
  _M: new Float32Array(12), _L: new Float32Array(12), _O: new Float32Array(12),
  dessiner(buf, sbuf, cam) {
    if (!souterrain.actif || !farm.s) return;
    const L = this.L(), c = [0.05, 0.05, 0.05];
    for (const [x, y, z, r] of L) {
      if (Math.abs(x - cam[0]) > 45 || Math.abs(z - cam[2]) > 45) continue;
      m34Root(this._M, x, y + 0.012, z, r, 1);
      for (const [cx, cz, sx, sz, ry] of [[0, -0.12, 0.09, 0.85, 0], [0.11, 0.18, 0.08, 0.42, -0.62], [-0.11, 0.18, 0.08, 0.42, 0.62]]) {
        m34TR(this._L, cx, 0, cz, 0, ry, 0); m34Mul(this._O, this._M, this._L);
        buf.box(this._O, 0, 0, 0, sx, 0.012, sz, c, 0);
      }
    }
  },
};
// ---------------------------------------------------------------- le nom du lieu, quand on y entre (pas de carte : c'est tout ce qu'on a)
const soutLieu = {
  el: null, der: null, t: 0,
  montrer(nom) {
    if (!this.el) {
      const st = document.createElement('style');
      st.textContent = '#sout-lieu{position:fixed;left:0;right:0;top:17%;text-align:center;pointer-events:none;font:italic 22px Georgia,serif;letter-spacing:.06em;color:rgba(222,212,190,.9);text-shadow:0 0 8px #000,0 0 3px #000;opacity:0;transition:opacity 1.2s;z-index:5}#sout-lieu.on{opacity:1}';
      document.head.appendChild(st);
      this.el = document.createElement('div'); this.el.id = 'sout-lieu'; document.body.appendChild(this.el);
    }
    this.el.textContent = nom.charAt(0).toUpperCase() + nom.slice(1);
    this.el.classList.add('on');
    clearTimeout(this.to); this.to = setTimeout(() => this.el && this.el.classList.remove('on'), 3200);
  },
  update(dt) {
    const S = souterrain;
    if (!S.actif || !farm.s) { this.der = null; return; }
    this.t -= dt;
    if (this.t > 0) return;
    this.t = 0.6;
    const p = game.player;
    let k = S.salleIci(p.pos[0], p.pos[2]);
    if (!k) { const z = S.zone(p.pos[0], p.pos[2]); if (z === 'mines' || z === 'riviere') k = z; }
    if (!k || k === this.der) return;
    const nom = k === 'hameau' ? LIEU_NAMES.sout_hameau_c : SOUT_ZONES[k];
    this.der = k;
    if (nom && game.mode === 'play') this.montrer(nom);
  },
};
HOOKS.update.push((dt) => soutLieu.update(dt));
HOOKS.load.push(() => { soutLieu.der = null; });
// ---------------------------------------------------------------- le jour, par la cheminée des Racines (la fougère pâle y pousse)
HOOKS.lights.push((eye) => {
  if (!souterrain.actif || !farm.s) return [];
  const c = SOUT_PLAN.cheminees.find((q) => Math.hypot(q[0] - 1760, q[1] - 2374) < 3);
  if (!c || Math.hypot(eye[0] - c[0], eye[2] - c[1]) > 60) return [];
  const t = (game.world && typeof game.world.time === "number" ? game.world.time : farm.s.time) || 0, j = clamp(Math.min((t - 0.26) / 0.06, (0.76 - t) / 0.06), 0, 1);
  if (j <= 0) return [];
  return [{ x: c[0], y: souterrain.floorAt(c[0], c[1]) + 7, z: c[1], r: 20, c: [0.32 * j, 0.34 * j, 0.37 * j], d: 0.01 }];
});
HOOKS.primary.push((eye, basis, held, it, id) => { if (held || id !== 'charbon' || !souterrain.actif) return false; soutMarques.tracer(eye, basis.f); play.cool = 0.35; return true; });
HOOKS.secondary.push((eye, basis, it, id) => { if (id !== 'charbon' || !souterrain.actif) return false; soutMarques.effacer(eye, basis.f); return true; });
HOOKS.draw.push((buf, sbuf, cam) => soutMarques.dessiner(buf, sbuf, cam));
