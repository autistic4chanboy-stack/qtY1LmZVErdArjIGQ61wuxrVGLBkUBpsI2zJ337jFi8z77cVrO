// ============================================================================
//  CHANTIERS DE LA FERME : la nouvelle ferme n'a qu'une maison et un champ.
//  Grange, poulailler, atelier (établi + four) et puits se construisent : on
//  tient le chantier en main (acheté ou fabriqué), des piquets et une ficelle
//  montrent l'emprise (verte si l'endroit convient), clic gauche pour bâtir,
//  clic droit pour tourner. La journée passe ; le terrain est aplani.
//  Sauvegarde : liste des constructions (rebâties au chargement).
// ============================================================================
const BUILDS = {
  grange: { W: 12, D: 9, front: 2.5, le: 'la grange', max: 1, build(B, w, f) {
    B.house(f, 12, 9, { wall: M_PLANKS, win: M_PLANKS, roof: M_ROOF, dw: 3.6, dh: 3.2, found: M_STONE, floor: M_DIRT });
    B.propRel(f, 'mangeoire', -3, 0.15, 3.6, 0, { fill: 1 });
    B.interRel(f, 'feeder', 'mangeoire_grange', -3, 0.6, 3.1, 'Mettre du foin');
    B.propRel(f, 'abreuvoir', 2.5, 0.15, 3.6, 0);
    B.propRel(f, 'botte_foin', 4.6, 0.15, 1.5, 0.3); B.propRel(f, 'botte_foin', 4.8, 0.75, 1.3, 0.1); B.propRel(f, 'botte_foin', -4.6, 0.15, -2.8, 1.5);
    B.propRel(f, 'lanterne_suspendue', -5.4, 0.15, -3.6, 0);
    w.farm.barn = { x: f.x, z: f.z, y: f.y + 0.15, f, W: 12, D: 9, door: B.toWorld(f, 0, -4.5 - 2) };
  } },
  poulailler: { W: 4.2, D: 3.6, front: 1.6, le: 'le poulailler', max: 1, build(B, w, f) {
    const cres = B.house(f, 4.2, 3.6, { wall: M_PLANKS, win: M_PLANKS, roof: M_ROOF, dw: 1.0, dh: 1.5, roofH: 1.4, floors: 1, found: M_STONE, floor: M_DIRT });
    const cd = B.door(f, cres, 'poulailler', {});
    B.propRel(f, 'botte_foin', 1.2, 0.15, 1.0, 0, null, 0.8);
    w.farm.coop = { x: f.x, z: f.z, y: f.y + 0.15, f, door: cd, nest: B.toWorld(f, -1.2, 1.0) };
  } },
  atelier: { W: 6.4, D: 5.4, front: 1.2, le: 'l’atelier', max: 1, build(B, w, f) {
    B.block(f, 0, -0.3, 0, 6.4, 0.45, 5.4, M_STONE);
    B.block(f, 0, 0, 2.55, 6.2, 2.8, 0.3, M_PLANKS); B.block(f, -3.05, 0, 0, 0.3, 2.8, 5.2, M_PLANKS); B.block(f, 3.05, 0, 0, 0.3, 2.8, 5.2, M_PLANKS);
    B.block(f, -3.0, 0, -2.5, 0.25, 2.8, 0.25, M_LOGS); B.block(f, 3.0, 0, -2.5, 0.25, 2.8, 0.25, M_LOGS);
    B.block(f, 0, 2.8, 0.2, 7.0, 0.3, 6.2, M_ROOF, 0, 2);
    B.propRel(f, 'etabli', -1.2, 0.15, 1.7, Math.PI); B.interRel(f, 'station', 'etabli_atelier', -1.2, 1.0, 1.1, "Travailler à l'établi", { st: 'etabli' });
    B.propRel(f, 'four', 1.8, 0.15, 1.6, Math.PI, { lit: false }); B.interRel(f, 'station', 'four_atelier', 1.8, 0.8, 0.9, 'Utiliser le four', { st: 'four' });
    B.propRel(f, 'tonneau', -2.3, 0.15, -1.5, 0);
  } },
  puits: { W: 1.8, D: 1.8, front: 0.6, le: 'le puits', max: 2, build(B, w, f, n) {
    B.well(f);
    B.inter('water', 'puits_construit' + n, f.x, f.y + 1, f.z, "Puiser de l'eau");
  } },
};
const builds = {
  rot: 0, ghost: null, checkT: 0,
  _res: null,
  reserved(w) { return this._res && this._res.length === w.W * w.W ? this._res : (this._res = new Uint8Array(w.W * w.W)); },
  // au chargement : on rebâtit ce qui a été construit
  apply(w) { (farm.s.builds || []).forEach((b, n) => this.make(w, b, n, false)); },
  make(w, b, n, fresh) {
    const K = BUILDS[b.kind];
    if (!K) return;
    const B = new Builder(w, mulberry32(7 + n), this.reserved(w));
    const f = { x: b.x, y: b.y, z: b.z, r: b.r }, nP = w.props.length;
    K.build(B, w, f, n);
    for (let i = nP; i < w.props.length; i++) w.props[i].bld = b.kind;
    w.blocksDirty = true; w.grid = null; w.coverDirty = true; w.shadeDirty = true; w.shadeRegion = [f.x - 16, f.z - 16, f.x + 16, f.z + 16];
    farm.dirtyProps = true;
    if (fresh) { const c = w.cell, R = Math.hypot(K.W, K.D) / 2 + 3; w.markMats(Math.floor((f.x - R) / c), Math.floor((f.z - R) / c), Math.ceil((f.x + R) / c), Math.ceil((f.z + R) / c)); w.collectLights(); }
  },
  count(kind) { return (farm.s.builds || []).filter((b) => b.kind === kind).length; },
  has(kind) { const fm = game.world.farm; return kind === 'grange' ? !!fm.barn : kind === 'poulailler' ? !!fm.coop : this.count(kind) > 0; },
  // emprise : rectangle local [x0, x1] × [z0, z1] (l'avant, côté porte, en -z)
  rect(K) { return [-K.W / 2 - 0.4, K.W / 2 + 0.4, -K.D / 2 - K.front, K.D / 2 + 0.4]; },
  // ---------------------------------------------------------------- piquets : où bâtir ?
  updateGhost(eye, f) {
    const s = farm.s, it = ITEMS[s.hand];
    if (!it || !it.build || !BUILDS[it.build]) { this.ghost = null; return; }
    const w = game.world, K = BUILDS[it.build], p = game.player;
    const th = w.raycastTerrain(eye, f, 18);
    if (!th) { this.ghost = null; return; }
    const r = this.rot + Math.round(p.yaw / (Math.PI / 2)) * Math.PI / 2 + Math.PI;
    const fx = -Math.sin(p.yaw), fz = -Math.cos(p.yaw), fl = Math.hypot(fx, fz) || 1;
    const x = Math.round((th.x + fx / fl * (K.D / 2 + K.front * 0.5)) * 2) / 2, z = Math.round((th.z + fz / fl * (K.D / 2 + K.front * 0.5)) * 2) / 2;
    const g = this.ghost;
    if (g && g.kind === it.build && g.x === x && g.z === z && g.r === r && performance.now() < this.checkT) return;
    this.checkT = performance.now() + 250;
    this.ghost = Object.assign({ kind: it.build, x, z, r }, this.check(w, K, it.build, x, z, r));
  },
  check(w, K, kind, x, z, r) {
    const s = farm.s, fm = w.farm, f = { x, z, r }, [x0, x1, z0, z1] = this.rect(K);
    const L = (lx, lz) => { const c = Math.cos(r), sn = Math.sin(r); return [x + lx * c + lz * sn, z - lx * sn + lz * c]; };
    const local = (px, pz) => { const c = Math.cos(r), sn = Math.sin(r), dx = px - x, dz = pz - z; return [dx * c - dz * sn, dx * sn + dz * c]; };
    const bad = (why, y) => ({ ok: false, why, y: y ?? w.heightAt(x, z) });
    if ((kind === 'grange' || kind === 'poulailler') && this.has(kind)) return bad(kind === 'grange' ? '(Vous avez déjà une grange.)' : '(Vous avez déjà un poulailler.)');
    if (this.count(kind) >= K.max) return bad('(Vous en avez déjà construit ' + (K.max > 1 ? 'assez.)' : 'un.)'));
    { const P = interditDeBatir(x, z, Math.max(K.W || 0, K.D || 0) / 2); if (P) return bad(P.why ? '(On ne bâtit pas ici : ' + P.why + '.)' : '(Pas ici.)'); }
    if (game.player.underground) return bad('(Pas sous terre.)');
    // relief
    let mn = 1e9, mx = -1e9, sum = 0, n = 0;
    for (let lz = z0; lz <= z1 + 0.01; lz += 1) for (let lx = x0; lx <= x1 + 0.01; lx += 1) { const [px, pz] = L(lx, lz), h = w.heightAt(px, pz); mn = Math.min(mn, h); mx = Math.max(mx, h); sum += h; n++; }
    const y = Math.round(sum / n * 100) / 100;
    if (mn < w.waterLevel + 0.3) return bad('(Le sol est trop humide ici.)', y);
    if (mx - mn > 2.4) return bad('(Le terrain est trop en pente.)', y);
    // obstacles : bâtiments, murets, arbres, rochers
    let hit = null;
    for (let lz = z0; lz <= z1 + 0.01 && !hit; lz += 1) for (let lx = x0; lx <= x1 + 0.01 && !hit; lx += 1) {
      const [px, pz] = L(lx, lz);
      w.query(px, pz, 0.7, (o) => { if (!hit && o && w.live(o) && Math.hypot(o.x - px, o.z - pz) < 0.9) hit = '(Un arbre ou une pierre gêne.)'; }, (b) => {
        if (hit || b.under || b.y > y + 3 || b.y + b.sy < y - 1.5) return;
        const [bx, bz] = World.blockLocal(b, px, pz);
        if (Math.abs(bx) < b.sx / 2 + 0.3 && Math.abs(bz) < b.sz / 2 + 0.3) hit = '(Une construction ou un objet gêne.)';
      });
    }
    if (hit) return bad(hit, y);
    for (const q of w.props) { if (!w.live(q) || TERRA_FREE.has(q.id)) continue; const [lx, lz] = local(q.x, q.z); if (lx > x0 - 0.3 && lx < x1 + 0.3 && lz > z0 - 0.3 && lz < z1 + 0.3 && Math.abs(q.y - y) < 3) return bad('(Il y a quelque chose de posé là.)', y); }
    for (const k in s.crops) { const c = s.crops[k]; if (!c.c && !c.tree) continue; const i = k.indexOf(','), [lx, lz] = local(+k.slice(0, i) + 0.5, +k.slice(i + 1) + 0.5); if (lx > x0 - 0.5 && lx < x1 + 0.5 && lz > z0 - 0.5 && lz < z1 + 0.5) return bad('(Des cultures poussent là.)', y); }
    // chemins des habitants
    const N = w.nav;
    for (const e of N.edges) { const A = N.nodes[e[0]], C = N.nodes[e[1]]; if (!A || !C) continue; for (let t = 0; t <= 1.001; t += 0.1) { const [lx, lz] = local(A.x + (C.x - A.x) * t, A.z + (C.z - A.z) * t); if (lx > x0 - 1 && lx < x1 + 1 && lz > z0 - 1 && lz < z1 + 1) return bad('(Ça couperait le chemin.)', y); } }
    const p = game.player, [plx, plz] = local(p.pos[0], p.pos[2]);
    if (plx > x0 - 0.5 && plx < x1 + 0.5 && plz > z0 - 0.5 && plz < z1 + 0.5) return bad('(Reculez un peu : vous êtes sur l’emprise.)', y);
    return { ok: true, why: '', y, f };
  },
  // ---------------------------------------------------------------- bâtir
  async place() {
    const g = this.ghost, s = farm.s, w = game.world;
    if (!g) return;
    if (!g.ok) { sound.click(); ui.subtitle('', g.why, 2.5); return; }
    const K = BUILDS[g.kind], item = s.hand;
    if (!farm.take(item, 1)) return;
    this.ghost = null;
    game.sleeping = true;
    await ui.fade(true, `Vous passez la journée à bâtir ${K.le}…`, 900);
    this.flatten(w, K, g);
    const b = { kind: g.kind, x: g.x, z: g.z, y: g.y, r: Math.round(g.r * 1e4) / 1e4 };
    s.builds = s.builds || [];
    s.builds.push(b);
    this.make(w, b, s.builds.length - 1, true);
    const h = npcs.hour(), adv = h >= 20.5 || h < 5 ? 0.5 : clamp(20.5 - h, 0.5, 5);
    w.time += adv / 24; game.lastT = w.time; game.skipHours(adv);
    game.player.food = Math.max(0, game.player.food - adv * 3);
    if (npcs.snap) npcs.snap(w);
    game.syncAnimals();
    farm.save();
    await new Promise((r) => setTimeout(r, 900));
    await ui.fade(false, '', 900);
    game.sleeping = false;
    sound.place();
  },
  // le terrain est aplani sous la construction (enregistré comme la pelle)
  flatten(w, K, g) {
    const s = farm.s, T = s.terra || (s.terra = {}), [x0, x1, z0, z1] = this.rect(K), c = w.cell, R = Math.hypot(K.W, K.D) / 2 + K.front + 4;
    const i0 = Math.max(0, Math.floor((g.x - R) / c)), i1 = Math.min(w.N, Math.ceil((g.x + R) / c)), j0 = Math.max(0, Math.floor((g.z - R) / c)), j1 = Math.min(w.N, Math.ceil((g.z + R) / c));
    const cs = Math.cos(g.r), sn = Math.sin(g.r);
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const dx = i * c - g.x, dz = j * c - g.z, lx = dx * cs - dz * sn, lz = dx * sn + dz * cs;
      const d = Math.max(x0 - lx, lx - x1, z0 - lz, lz - z1, 0), t = d <= 0.8 ? 1 : 1 - smoothstep(0.8, 3.2, d);
      if (t <= 0) continue;
      const k = j * w.W + i, h = w.heights[k], nh = lerp(h, g.y, t), dh = nh - h;
      if (Math.abs(dh) < 0.005) continue;
      w.heights[k] = nh;
      const v = Math.round(((T[k] || 0) + dh) * 100) / 100;
      if (Math.abs(v) < 0.005) delete T[k]; else T[k] = v;
    }
    w.markHeights(i0, j0, i1, j1);
    // herbes et fleurs sous l'emprise : arrachées
    const w2 = game.world;
    w2.objects.forEach((o, idx) => {
      if (o.gone || Math.abs(o.x - g.x) > R || Math.abs(o.z - g.z) > R) return;
      const dx = o.x - g.x, dz = o.z - g.z, lx = dx * cs - dz * sn, lz = dx * sn + dz * cs;
      if (lx > x0 - 0.2 && lx < x1 + 0.2 && lz > z0 - 0.2 && lz < z1 + 0.2 && !OBJ_TYPES[o.t].animal) { o.gone = true; s.removed[idx] = 1; }
    });
    for (const k in s.crops) { const cr = s.crops[k]; if (cr.c || cr.tree) continue; const i = k.indexOf(','), dx = +k.slice(0, i) + 0.5 - g.x, dz = +k.slice(i + 1) + 0.5 - g.z, lx = dx * cs - dz * sn, lz = dx * sn + dz * cs; if (lx > x0 - 0.5 && lx < x1 + 0.5 && lz > z0 - 0.5 && lz < z1 + 0.5) delete s.crops[k]; }
    w2.objectsDirty = true; w2.grid = null;
  },
  // ---------------------------------------------------------------- dessin : piquets, ficelle et gabarit lumineux du bâtiment
  draw(buf) {
    const g = this.ghost;
    if (!g) return;
    const w = game.world, K = BUILDS[g.kind], cs = Math.cos(g.r), sn = Math.sin(g.r);
    const L = (lx, lz) => [g.x + lx * cs + lz * sn, g.z - lx * sn + lz * cs];
    const col = g.ok ? [0.45, 1.25, 0.5] : [1.45, 0.35, 0.3], H = { grange: 3.4, poulailler: 1.9, atelier: 2.9, puits: 1.3 }[g.kind] || 2.5;
    PE.buf = buf; PE.fl = FX_EMIT;
    const seg = (x0, y0, z0, x1, y1, z1, t) => {
      const len = Math.hypot(x1 - x0, y1 - y0, z1 - z0) || 0.01;
      PE.frame((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, 0, 1);
      PE.box(0, 0, 0, t, t, len, col, TL.plain, Math.atan2(x1 - x0, z1 - z0), -Math.asin((y1 - y0) / len));
    };
    const bx0 = -K.W / 2, bx1 = K.W / 2, bz0 = -K.D / 2, bz1 = K.D / 2, top = g.y + H;
    const C = [[bx0, bz0], [bx1, bz0], [bx1, bz1], [bx0, bz1]];
    for (let k = 0; k < 4; k++) {
      const [ax, az] = C[k], [cx, cz] = C[(k + 1) % 4], [xa, za] = L(ax, az), [xb, zb] = L(cx, cz);
      seg(xa, Math.min(g.y, w.heightAt(xa, za)), za, xa, top, za, 0.07); // arête verticale
      seg(xa, top, za, xb, top, zb, 0.05); // arête du haut
      // ficelle au ras du sol (suit le terrain)
      const n = Math.max(1, Math.round(Math.hypot(xb - xa, zb - za)));
      for (let i = 0; i < n; i++) { const t0 = i / n, t1 = (i + 1) / n, x0 = xa + (xb - xa) * t0, z0 = za + (zb - za) * t0, x1 = xa + (xb - xa) * t1, z1 = za + (zb - za) * t1; seg(x0, w.heightAt(x0, z0) + 0.35, z0, x1, w.heightAt(x1, z1) + 0.35, z1, 0.04); }
    }
    // la porte
    const dw = g.kind === 'grange' ? 1.8 : g.kind === 'poulailler' ? 0.5 : g.kind === 'puits' ? 0 : 0.9, dh = Math.min(H - 0.3, g.kind === 'grange' ? 3.2 : g.kind === 'poulailler' ? 1.5 : 2.2);
    if (dw) { const [xa, za] = L(-dw, bz0 - 0.05), [xb, zb] = L(dw, bz0 - 0.05); seg(xa, g.y, za, xa, g.y + dh, za, 0.08); seg(xb, g.y, zb, xb, g.y + dh, zb, 0.08); seg(xa, g.y + dh, za, xb, g.y + dh, zb, 0.08); }
    PE.fl = 0;
  },
};

// ---------------------------------------------------------------- accroches
HOOKS.primary.push((eye, basis, held, it) => {
  if (!it || !it.build) return false;
  if (!held) builds.place();
  play.cool = 0.4;
  return true;
});
HOOKS.secondary.push((eye, basis, it) => {
  if (!it || !it.build) return false;
  builds.rot += Math.PI / 2; builds.checkT = 0; sound.click();
  return true;
});
HOOKS.update.push((dt, eye, basis, sky, playing) => { if (playing) builds.updateGhost(eye, basis.f); else builds.ghost = null; });
HOOKS.draw.push((buf) => builds.draw(buf));
HOOKS.load.push(() => {
  builds.ghost = null;
  if (builds.hooked) return;
  builds.hooked = true;
  // on ne démonte pas au marteau ce qui fait partie d'un bâtiment
  const _dis = play.dismantle.bind(play);
  play.dismantle = function (q) { if (q && q.bld) { sound.impact('hard'); return; } return _dis(q); };
  // bêtes : il faut de quoi les loger
  const _render = ui.renderShop.bind(ui);
  ui.renderShop = function () {
    _render();
    const fm = game.world && game.world.farm;
    if (!fm) return;
    for (const b of $$('#shop [data-buy]')) {
      const it = ITEMS[b.dataset.buy];
      if (!it || !it.animal) continue;
      const small = ['hen', 'farmduck', 'goose', 'farmrabbit'].includes(it.animal);
      if (small ? fm.coop : fm.barn) continue;
      b.disabled = true;
      const sp = b.querySelector('span');
      if (sp) sp.innerHTML += ` <small>(il vous faut ${small ? 'un poulailler' : 'une grange'})</small>`;
    }
  };
});
