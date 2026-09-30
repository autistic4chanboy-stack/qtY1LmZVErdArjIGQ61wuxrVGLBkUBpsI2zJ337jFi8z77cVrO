// ============================================================================
//  L'ÉTRANGE, SUITE : de nouvelles apparitions, du discret au flagrant
// ============================================================================
EVENT_DEFS.push(
  { id: 'hurlement', lvl: 0, when: 'nuit' }, { id: 'frappes', lvl: 0, when: 'jour' },
  { id: 'moine', lvl: 1, when: 'soir' }, { id: 'lanterne_lac', lvl: 1, when: 'nuit' }, { id: 'semeur', lvl: 1, when: 'aube' },
  { id: 'trappe', lvl: 1, when: 'matin' }, { id: 'empreintes', lvl: 1, when: 'matin' }, { id: 'cloche_lac', lvl: 1, when: 'nuit' },
  { id: 'chasse', lvl: 2, when: 'nuit' }, { id: 'dame_blanche', lvl: 2, when: 'nuit' }, { id: 'oiseaux_morts', lvl: 2, when: 'matin' },
  { id: 'pluie_rouge', lvl: 3, when: 'jour' },
);
WHEN_H.soir = [18.4, 20.8];
const MONK_LOOK = { skin: '#d8cfc0', hair: '#1a1614', hairStyle: 'chauve', hat: 'capuche', hatCol: '#3a2e24', top: '#3a2e24', bottom: '#2e241c', shoe: '#1a1410', coat: true, face: TL.blankF, height: 1.04, build: 'mince' };
const LADY_LOOK = { skin: '#eeeae4', hair: '#e8e4dc', hairStyle: 'long', hat: 'voile', hatCol: '#f2f0ea', top: '#f2f0ea', bottom: '#f2f0ea', dress: true, shoe: '#e8e4dc', face: TL.blankF, height: 0.98, build: 'mince' };
const SOWER_LOOK = { skin: '#c8a888', hair: '#3a2e24', hairStyle: 'court', hat: 'paille', top: '#6a5a44', bottom: '#4a3c2c', shoe: '#2a2018', face: TL.blankF, height: 1.06, build: 'mince' };
const aline = (k) => { const A = typeof LORE_TEXT !== 'undefined' && LORE_TEXT.anomalies && LORE_TEXT.anomalies[k]; return A && A.length ? fmtLine(pick(A), null) : null; };
const STRANGE_MORE = {
  hurlement() { sound.howl && sound.howl(150); },
  frappes(c) {
    const w = game.world, p = game.player, M = w.lm.mine;
    if (!p.underground && !(M && Math.hypot(p.pos[0] - M.x, p.pos[2] - M.z) < 60)) { this.s.events.push({ id: 'frappes', h: npcs.hour() + 2, done: false }); return; }
    sound.knock && sound.knock(3); setTimeout(() => sound.knock && sound.knock(2), 2200);
  },
  moine(c) {
    const w = game.world, p = game.player, A = w.abbey;
    let x, z;
    if (A && Math.hypot(p.pos[0] - A.x, p.pos[2] - A.z) < 260) { x = A.x + (Math.random() - 0.5) * 6; z = A.z + (Math.random() - 0.5) * 6; }
    else { const a = Math.random() * TAU; x = p.pos[0] + Math.sin(a) * 42; z = p.pos[2] + Math.cos(a) * 42; }
    if (!w.inside(x, z, 20) || w.heightAt(x, z) < w.waterLevel + 0.3) return;
    this.ents.push({ kind: 'figure', mode: 'moine', x, z, y: w.heightAt(x, z), rig: humanRig(MONK_LOOK), t: 0, seenT: 0, life: 200, heading: 0 });
  },
  dame_blanche(c) {
    const w = game.world, p = game.player, N = w.nav;
    let best = null;
    for (const n of N.nodes) { if (n.tag !== 'chemin') continue; const d = Math.hypot(n.x - p.pos[0], n.z - p.pos[2]); if (d > 30 && d < 70 && (!best || d < best.d)) best = { n, d }; }
    if (!best) return;
    this.ents.push({ kind: 'dame', x: best.n.x + 1.5, z: best.n.z, y: w.heightAt(best.n.x + 1.5, best.n.z), rig: humanRig(LADY_LOOK), t: 0, heading: 0, life: 300, spoke: false, seenT: 0 });
  },
  lanterne_lac(c) { const L = game.world.lm.lac; if (!L) return; this.ents.push({ kind: 'lanterne', cx: L.x, cz: L.z, R: L.r * 0.55, a: Math.random() * TAU, x: L.x, y: game.world.waterLevel + 1, z: L.z, t: 0, life: 90, c: [1.0, 0.72, 0.35], r: 9 }); },
  semeur(c) {
    const w = game.world, fm = w.farm, p = game.player;
    const x = (fm.field.x0 + fm.field.x1) / 2 + (Math.random() - 0.5) * 8, z = (fm.field.z0 + fm.field.z1) / 2 + (Math.random() - 0.5) * 6;
    if (Math.hypot(p.pos[0] - x, p.pos[2] - z) > 250) return;
    this.ents.push({ kind: 'figure', mode: 'semeur', x, z, y: w.heightAt(x, z), rig: humanRig(SOWER_LOOK), t: 0, seenT: 0, life: 150, heading: 0 });
  },
  trappe() {
    const w = game.world, q = farm.propByKind('trappe', [w.bld.ferme.x, w.bld.ferme.z], 12), d = w.doors[w.bld.ferme.door];
    if (q) farm.setPropData(q, { open: true });
    if (d && q) for (let k = 0; k < 5; k++) { const t = k / 5, x = lerp(d.x, q.x, t), z = lerp(d.z, q.z, t); farm.addProp({ id: 'traces', x, y: w.bld.ferme.y + 0.02, z, r: Math.atan2(q.x - d.x, q.z - d.z) }); }
  },
  empreintes() {
    const w = game.world, B = w.farm.barn || w.bld.ferme; // sans grange : autour de la maison
    for (let k = 0; k < 10; k++) { const a = k / 10 * TAU, x = B.x + Math.cos(a) * 8, z = B.z + Math.sin(a) * 8; farm.addProp({ id: 'traces', x, y: w.heightAt(x, z) + 0.01, z, r: a + Math.PI / 2, s: 2.2 }); }
  },
  cloche_lac(c) {
    const L = game.world.lm.lac, p = game.player;
    if (!L || Math.hypot(p.pos[0] - L.x, p.pos[2] - L.z) > 260) return;
    sound.bell && sound.bell(0.22);
    setTimeout(() => ui.subtitle('', '(Sous le lac, une cloche. Une seule fois.)', 4), 1500);
  },
  oiseaux_morts() {
    const w = game.world, B = w.bld.ferme;
    for (let k = 0; k < 6; k++) { const x = B.out[0] + (Math.random() - 0.5) * 8, z = B.out[1] - 3 - Math.random() * 10; const e = entities.add(w, 'crow', x, z, { corpse: true }); e.dead = true; e.corpse = true; e.baseY = w.heightAt(x, z); e.y = e.baseY; e.lifeT = 400; e.heading = Math.random() * TAU; }
  },
  pluie_rouge() { this.redRain = 45; sound.rumble && sound.rumble(); },
  chasse(c) {
    const w = game.world, p = game.player;
    if (p.underground || c.insideAny) { this.s.events.push({ id: 'chasse', h: npcs.hour() + 1.5, done: false }); return; }
    const a = Math.random() * TAU, dir = [Math.sin(a), Math.cos(a)], side = [-dir[1], dir[0]], off = (Math.random() - 0.5) * 30;
    const sx = p.pos[0] - dir[0] * 170 + side[0] * off, sz = p.pos[2] - dir[1] * 170 + side[1] * off;
    const riders = [];
    for (let k = 0; k < 6; k++) riders.push({ dx: (Math.random() - 0.5) * 14, dz: -k * 5 - Math.random() * 3, dy: Math.random() * 3, horse: ANIMAL_RIGS.horse(4), rider: paleRig(false), dog: k > 3 });
    this.ents.push({ kind: 'chasse', x: sx, z: sz, y: w.heightAt(sx, sz) + 22, dir, t: 0, life: 16, riders, seenT: 0, marked: false });
    sound.rumble && sound.rumble();
    const t = aline('chasse'); if (t) setTimeout(() => ui.subtitle('', t, 4), 2000);
  },
};
const _strangeRun = strange.run.bind(strange);
strange.run = function (id, c) { if (STRANGE_MORE[id]) return STRANGE_MORE[id].call(this, c || {}); return _strangeRun(id, c); };

// ---------------------------------------------------------------- comportements des nouvelles apparitions
const _eFigure = strange.E_figure.bind(strange);
strange.E_figure = function (e, dt, c) {
  if (e.mode !== 'moine' && e.mode !== 'semeur') return _eFigure(e, dt, c);
  const p = game.player, d = Math.hypot(e.x - p.pos[0], e.z - p.pos[2]);
  e.heading = e.mode === 'semeur' ? e.heading + dt * 0.3 : Math.atan2(p.pos[0] - e.x, p.pos[2] - e.z);
  const vis = this.seen(e, c);
  if (vis) { e.seenT += dt; this.fear = Math.max(this.fear, clamp(1 - d / 50, 0, 1) * 0.4); if (!e.said && e.mode === 'moine' && e.seenT > 1.5) { e.said = true; const t = aline('moine'); if (t) ui.subtitle('', t, 4); } }
  if (e.mode === 'semeur') { e.move = 1; e.phase = (e.phase || 0) + dt * 2; if (Math.random() < dt * 3) particles.spawn(e.x, e.y + 1.0, e.z, (Math.random() - 0.5), 0.2, (Math.random() - 0.5), [0.6, 0.5, 0.3, 1], 0.03, 1, 6, false); }
  if (d < (e.mode === 'moine' ? 14 : 18) || (vis && e.seenT > (e.mode === 'moine' ? 8 : 4))) {
    sound.glitchSnd && sound.glitchSnd(0.3); this.glitchT = 0.3;
    if (e.mode === 'semeur') sowerGift(e);
    return false;
  }
  return e.t < e.life;
};
function sowerGift(e) {
  const s = farm.s, crops = Object.keys(CROPS).filter((k) => k !== 'pommier');
  let n = 0;
  for (const k in s.crops) { const c = s.crops[k]; if (c.c || n >= 5) continue; c.c = crops[(Math.random() * crops.length) | 0]; c.g = 0; c.st = -1; n++; }
  farm.dirtyProps = true;
  if (n) { const t = aline('semeur'); setTimeout(() => ui.subtitle('', t || '(Dans le champ, des rangs que vous n’avez pas semés.)', 4), 800); }
}
strange.E_dame = function (e, dt, c) {
  const p = game.player, d = Math.hypot(e.x - p.pos[0], e.z - p.pos[2]);
  e.heading = turnToward(e.heading, Math.atan2(p.pos[0] - e.x, p.pos[2] - e.z), dt * 2);
  const vis = this.seen(e, c);
  if (vis) e.seenT += dt;
  if (!e.spoke && d < 9) { e.spoke = true; e.unseen = 0; sound.whisper && sound.whisper(0, 0.4); ui.subtitle('???', aline('dame_blanche') || 'Pardon… Le hameau, c’est bien par là ?', 4.5); }
  if (e.spoke) { e.unseen = vis ? 0 : (e.unseen || 0) + dt; if (e.unseen > 1.2) { sound.wind1 && sound.wind1(); return false; } }
  if (d < 2.2) { this.glitchT = 0.6; sound.wind1 && sound.wind1(); return false; }
  return e.t < e.life && c.night > 0.3;
};
strange.E_lanterne = function (e, dt, c) {
  const p = game.player;
  e.a += dt * 0.12; e.x = e.cx + Math.cos(e.a) * e.R; e.z = e.cz + Math.sin(e.a) * e.R; e.y = game.world.waterLevel + 1.0 + Math.sin(e.t * 1.7) * 0.08;
  if (Math.hypot(e.x - p.pos[0], e.z - p.pos[2]) < 25) return false;
  return e.t < e.life && c.night > 0.3;
};
strange.E_chasse = function (e, dt, c) {
  const p = game.player, w = game.world;
  e.x += e.dir[0] * dt * 22; e.z += e.dir[1] * dt * 22;
  e.y = Math.max(w.heightAt(e.x, e.z), w.waterLevel) + 20;
  const d = Math.hypot(e.x - p.pos[0], e.z - p.pos[2]);
  if (d < 90) { e.stepT = (e.stepT || 0) - dt; if (e.stepT <= 0) { e.stepT = 0.28; sound.hoof && sound.hoof('hard', 12); } if (Math.random() < dt * 0.6) sound.howl && sound.howl(d); }
  const vis = this.seen(e, c, e.y + 1);
  if (vis && p.crouch < 0.5) e.seenT += dt; else e.seenT = Math.max(0, e.seenT - dt * 0.5);
  this.fear = Math.max(this.fear, clamp(1 - d / 120, 0, 1) * 0.8);
  if (!e.marked && e.seenT > 2.4) {
    e.marked = true; this.glitchT = 1.2; play.hurt(28, e, 'Emporté par la Chasse volante');
    ui.subtitle('', '(Un cavalier a tourné la tête vers vous.)', 4);
  }
  if (e.t >= e.life) {
    if (!farm.s.flags.got_relique_fer && !farm.s.flags.ferMesnie) { const x = p.pos[0] + e.dir[0] * 25, z = p.pos[2] + e.dir[1] * 25; if (w.heightAt(x, z) > w.waterLevel + 0.5) { farm.s.flags.ferMesnie = [Math.round(x), Math.round(z)]; spawnFer(farm.s.flags.ferMesnie); } }
    return false;
  }
  return true;
};
// rendu : la chasse (chevaux et cavaliers pâles), la dame, la lanterne
const _strangeDraw = strange.draw.bind(strange);
strange.draw = function (buf, sbuf, cam, t) {
  _strangeDraw(buf, sbuf, cam, t);
  for (const e of this.ents) {
    if (e.kind === 'chasse') {
      const h = Math.atan2(e.dir[0], e.dir[1]);
      for (const r of e.riders) {
        const x = e.x + e.dir[0] * r.dz + e.dir[1] * r.dx, z = e.z + e.dir[1] * r.dz - e.dir[0] * r.dx, y = e.y + r.dy + Math.sin(t * 3 + r.dx) * 0.6;
        poseQuad(r.horse, { move: 1, phase: t * 9 + r.dx, run: true, t, lookP: 0.2 });
        for (const q of r.horse.parts) if (q.s) q.col = [0.3, 0.36, 0.46];
        drawRig(buf, r.horse, x, y, z, h, 1, FX_EMIT);
        if (!r.dog) { poseHuman(r.rider, { move: 0, t, pale: true, sit: true }); drawRig(buf, r.rider, x, y + 1.05, z + 0, h, 0.9, FX_EMIT); }
      }
    } else if (e.kind === 'lanterne') {
      PE.buf = buf; PE.frame(e.x, e.y, e.z, e.t * 0.3, 1);
      PE.bx(0, -0.3, 0, 0.9, 0.1, 1.6, [0.3, 0.22, 0.14], TL.darkwood);
      PE.fl = FX_EMIT; PE.bx(0, 0, 0, 0.16, 0.24, 0.16, [1.5, 1.1, 0.5], TL.glass); PE.fl = 0;
    }
  }
};
const _strangeLights = strange.lights.bind(strange);
strange.lights = function (eye) {
  const L = _strangeLights(eye);
  for (const e of this.ents) if (e.kind === 'lanterne') L.push({ x: e.x, y: e.y, z: e.z, r: e.r, c: v3.scale(e.c, 1 + Math.sin(e.t * 7) * 0.1), d: Math.hypot(e.x - eye[0], e.z - eye[2]) });
  return L;
};
// la dame blanche n'est pas visée comme une créature ordinaire
const _strangeRay = strange.raycast.bind(strange);
strange.raycast = function (o, d, max) { const h = _strangeRay(o, d, max); return h && (h.s.kind === 'dame' || h.s.kind === 'chasse') ? null : h; };
// pluie de sang : le monde rougit
HOOKS.update.push((dt) => { if (strange.redRain > 0) { strange.redRain -= dt; weather.cur.rain = Math.max(weather.cur.rain, 0.7); } });
HOOKS.fx.push((fx, tint) => { if (strange.redRain > 0) { const k = Math.min(1, strange.redRain / 5, (45 - strange.redRain) / 4); tint[0] = 0.7; tint[1] = 0.05; tint[2] = 0.04; tint[3] = Math.max(tint[3], 0.28 * k); } });
// la tombe de Lise apaisée : la fenêtre du hameau reste noire
const _stage = strange.stage.bind(strange);
strange.stage = function (lieu, moment) { if (lieu === 'hameau_abandonne' && farm.s.flags.liseApaisee) { this.run('murmure', {}); return; } return _stage(lieu, moment); };
