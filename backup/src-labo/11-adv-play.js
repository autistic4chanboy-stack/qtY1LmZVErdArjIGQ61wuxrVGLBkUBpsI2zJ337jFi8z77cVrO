// ============================================================================
//  AVENTURE : outils (hache, pioche, revolver), récolte, chasse, potions
// ============================================================================

const advPlay = {
  swingT: 0, hitDone: false, effects: {}, projectiles: [], zones: [], warnT: 0, flashT: 0, shakeT: 0,

  reset() { this.effects = {}; this.projectiles = []; this.zones = []; this.swingT = 0; },
  has(e) { return this.effects[e] > 0; },

  // ------------------------------------------------------------ outils
  selectTool(id) {
    if (adv.s.tool === id && id === 'vial') return this.cyclePotion(1);
    adv.s.tool = id; this.swingT = 0; sound.click();
    if (id === 'vial' && !adv.s.potionSel) ui.toast('Aucune fiole : mélangez-en au laboratoire.');
  },
  cyclePotion(dir) {
    const keys = Object.keys(adv.s.potions);
    if (!keys.length) { adv.s.potionSel = null; return; }
    const i = keys.indexOf(adv.s.potionSel);
    adv.s.potionSel = keys[((i < 0 ? 0 : i + dir) % keys.length + keys.length) % keys.length];
    ui.toast('Fiole : ' + POTIONS[adv.s.potionSel].name + ' ×' + adv.s.potions[adv.s.potionSel]);
  },
  primary(eye, basis) { // clic gauche maintenu
    const tool = adv.s.tool;
    if (tool === 'axe' || tool === 'pick' || tool === 'hands') {
      if (this.swingT <= 0) { this.swingT = tool === 'hands' ? 0.35 : 0.5; this.hitDone = false; }
    } else if (tool === 'vial') {
      if (this.swingT <= 0 && adv.s.potionSel) { this.throwVial(adv.s.potionSel, eye, basis.f); this.swingT = 0.6; }
    }
  },
  secondary() { // clic droit : boire la fiole choisie
    if (adv.s.tool === 'vial' && adv.s.potionSel && this.swingT <= 0) { this.drink(adv.s.potionSel); this.swingT = 0.8; }
  },
  meleeHit(eye, dir) {
    const w = game.world, tool = adv.s.tool, reach = 2.8, force = this.has('force') ? 3 : 1;
    let best = null;
    const oh = w.raycastObjects(eye, dir, reach, true);
    if (oh) best = { t: oh.t, kind: 'obj', o: oh.obj, p: [oh.x, oh.y, oh.z] };
    const eh = entities.raycast(eye, dir, reach);
    if (eh && (!best || eh.t < best.t)) best = { t: eh.t, kind: 'ent', e: eh.e, p: eh.p };
    const mh = monster.raycast(eye, dir, reach);
    if (mh && (!best || mh.t < best.t)) best = { t: mh.t, kind: 'mon', p: mh.p };
    const bh = w.raycastBlocks(eye, dir, reach);
    if (bh && (!best || bh.t < best.t)) best = { t: bh.t, kind: 'blk', b: bh.block, idx: bh.idx, p: [eye[0] + dir[0] * bh.t, eye[1] + dir[1] * bh.t, eye[2] + dir[2] * bh.t] };
    const th = w.raycastTerrain(eye, dir, reach);
    if (th && (!best || th.t < best.t)) best = { t: th.t, kind: 'ter', p: [th.x, th.y, th.z] };
    if (!best) return;
    const [x, y, z] = best.p;
    if (best.kind === 'obj') this.harvest(best.o, tool, x, y, z, force);
    else if (best.kind === 'ent') { puffAt(x, y, z, [150, 40, 40], 6, 2, false); this.hurtCreature(best.e, (tool === 'hands' ? 1 : 2) * force, eye); sound.impact('soft'); }
    else if (best.kind === 'mon') { monster.hit(2 * force); sound.impact('soft'); }
    else if (best.kind === 'blk') {
      puffAt(x, y, z, MATERIALS[best.b.m].avg, 6, 2, true); sound.impact('hard');
      if (tool === 'pick' && best.b.m === M_ORE) {
        const n = adv.s.ore[best.idx] = (adv.s.ore[best.idx] | 0) + 1;
        adv.dropLoot([['minerai', force, force]], x, y - 0.5, z);
        if (Math.random() < 0.15) adv.dropLoot([['cristal', 1, 1]], x, y - 0.5, z);
        if (n >= 4) { best.b.m = M_ROCK; w.blocksDirty = true; ui.toast('Ce filon est épuisé.'); }
      }
    } else { puffAt(x, y + 0.05, z, MATERIALS[w.matAt(x, z)].avg, 6, 1.6, false); sound.impact('soft'); }
  },
  harvest(o, tool, x, y, z, force) {
    const w = game.world, t = OBJ_TYPES[o.t], H = HARVEST[t.id];
    const hard = t.id === 'rock' || t.id === 'stones' || t.id === 'orepile' || t.id === 'crystal';
    puffAt(x, y, z, hard ? [130, 130, 135] : t.cat === 'Arbres' ? [110, 80, 50] : [80, 140, 60], 7, 2.2, hard);
    sound.impact(hard ? 'hard' : 'soft');
    if (!H || tool === 'hands' || (H.tool !== tool && H.tool !== 'hands')) {
      if (H && H.tool !== 'hands' && (this.warnT -= 1) < 0) { this.warnT = 3; ui.toast(H.tool === 'axe' ? 'Il faut une hache.' : 'Il faut une pioche.'); }
      return;
    }
    o.hp = (o.hp ?? H.hp) - force;
    if (o.hp > 0) return;
    this.consume(o, H);
    if (t.cat === 'Arbres') { sound.land(1); ui.toast('L’arbre est abattu.'); }
  },
  consume(o, H) { // ressource épuisée : butin + souche ou disparition (mémorisé dans la sauvegarde)
    const w = game.world, i = w.objects.indexOf(o);
    adv.dropLoot(H.drop, o.x, w.objectY(o), o.z);
    let delta = 'gone';
    if (H.stump) { o.t = OBJ_INDEX.stump; o.h = 0.9; o.v = 0; delta = 'stump'; } else o.gone = true;
    o.hp = undefined;
    if (i >= 0 && i < adv.genCount) adv.s.deltas[i] = delta;
    else { const a = adv.s.added.findIndex((q) => Math.abs(q[1] - o.x) < 0.01 && Math.abs(q[2] - o.z) < 0.01); if (a >= 0) { if (delta === 'gone') adv.s.added.splice(a, 1); else adv.s.added[a] = ['stump', o.x, o.z, 0.9]; } }
    w.objectsDirty = true; w.grid = null; w.shadeDirty = true; w.shadeRegion = [o.x - 12, o.z - 12, o.x + 12, o.z + 12];
  },
  pickByHand(o) {
    const H = HARVEST[OBJ_TYPES[o.t].id];
    if (!H) return;
    this.consume(o, H);
    sound.pop();
  },
  hurtCreature(e, dmg, from) {
    if (entities.damage(e, dmg, from[0], from[2])) {
      const P = PREY[e.kind];
      if (P) adv.dropLoot(P.drop, e.x, e.y, e.z);
      const i = game.world.objects.indexOf(e.o);
      if (i >= 0 && e.kind !== 'bird') { adv.s.killed[i] = adv.s.day; e.o.gone = true; game.world.objectsDirty = true; }
      puffAt(e.x, e.y + e.h * 0.5, e.z, [140, 30, 30], 12, 2.5, false);
    }
  },
  addObject(id, x, z, h) {
    const w = game.world;
    if (!w.inside(x, z, 2) || w.heightAt(x, z) < w.waterLevel + 0.2) return;
    const T = OBJ_TYPES[OBJ_INDEX[id]];
    h = h || lerp(T.h[0], T.h[1], Math.random());
    w.objects.push({ t: OBJ_INDEX[id], x, z, h, f: Math.random() < 0.5 ? 1 : 0, v: 0 });
    adv.s.added.push([id, Math.round(x * 100) / 100, Math.round(z * 100) / 100, Math.round(h * 100) / 100]);
    w.objectsDirty = true; w.grid = null; w.shadeDirty = true; w.shadeRegion = [x - 12, z - 12, x + 12, z + 12];
  },

  // ------------------------------------------------------------ potions : boire
  drink(id) {
    if (!adv.takePotion(id)) return;
    const P = POTIONS[id], e = this.effects, p = game.player, w = game.world;
    adv.s.recipes[id] = 1;
    sound.tone && sound.ok && sound.tone(sound.ctx.currentTime, 'sine', 300, 180, 0.25, 0.08);
    if (P.dur) e[id] = P.dur;
    switch (id) {
      case 'eau': adv.heal(5); break;
      case 'soin': adv.heal(40); break;
      case 'regen': adv.heal(60); break;
      case 'fusee': this.flashT = 1.2; break;
      case 'geant': delete e.petit; break;
      case 'petit': delete e.geant; break;
      case 'retour': this.teleport(w.spawn.x, w.spawn.z, w.adv.lab.frame.y + 0.2); break;
      case 'quantique': {
        for (let k = 0; k < 40; k++) {
          const a = Math.random() * TAU, d = 120 + Math.random() * 260, x = p.pos[0] + Math.cos(a) * d, z = p.pos[2] + Math.sin(a) * d;
          if (w.inside(x, z, 30) && w.heightAt(x, z) > w.waterLevel + 0.5) { this.teleport(x, z); break; }
        }
        break;
      }
      case 'feu': adv.hurt(20); e.brulure = 3; break;
      case 'explosion': adv.hurt(45); this.shakeT = 1; this.boom(p.pos[0], p.pos[1] + 1, p.pos[2], 0.6, true); break;
      case 'poison': adv.hurt(10); break;
      case 'sommeil': if (w.time >= 0.79 || w.time < 0.23) adv.sleep(); else { e.boue = 12; ui.toast('Vous somnolez… mais il fait encore jour.'); } break;
      case 'appel': monster.summon(true); break;
      case 'rupture': {
        glitch.burst(3);
        const pois = w.pois.filter((q) => q.kind !== 'lab');
        const q = pois[(Math.random() * pois.length) | 0];
        if (q) this.teleport(q.x + 6, q.z + 6);
        break;
      }
    }
    ui.toast('Vous buvez : ' + P.name + ' — ' + P.drink);
  },
  teleport(x, z, y) {
    const w = game.world, p = game.player;
    p.pos = [x, y ?? w.groundAt(x, z, w.heightAt(x, z) + 1, 0.6), z];
    p.vel = [0, 0, 0];
    glitch.burst(0.8);
    game.renderer.activeCenter = null;
  },

  // ------------------------------------------------------------ potions : lancer
  throwVial(id, eye, dir) {
    if (!adv.takePotion(id)) return;
    const v = 17;
    this.projectiles.push({ id, x: eye[0] + dir[0] * 0.6, y: eye[1] + dir[1] * 0.6 - 0.15, z: eye[2] + dir[2] * 0.6, vx: dir[0] * v, vy: dir[1] * v + 3, vz: dir[2] * v, t: 0 });
    if (sound.ok) sound.noiseHit(sound.ctx.currentTime, 0.18, 'bandpass', 900, 1, 0.05, null, 400);
  },
  updateProjectiles(dt) {
    const w = game.world;
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const q = this.projectiles[i], col = POTIONS[q.id].color;
      q.t += dt;
      const steps = 3;
      let hit = false;
      for (let s = 0; s < steps && !hit; s++) {
        const h = dt / steps;
        q.vy -= 14 * h;
        const nx = q.x + q.vx * h, ny = q.y + q.vy * h, nz = q.z + q.vz * h;
        const seg = [nx - q.x, ny - q.y, nz - q.z], L = Math.hypot(...seg) || 1e-6, d = seg.map((v) => v / L);
        const bh = w.raycastBlocks([q.x, q.y, q.z], d, L);
        const oh = w.raycastObjects([q.x, q.y, q.z], d, L, false);
        let e = null;
        entities.near(nx, nz, 1.0, (en) => { if (!en.hidden && ny > en.y && ny < en.y + en.h * en.scaleK) e = en; });
        if (bh || oh || e || ny < w.heightAt(nx, nz) || q.t > 6 || monster.near(nx, ny, nz, 1.2)) {
          const tt = bh ? bh.t : oh ? oh.t : L;
          q.x += d[0] * tt; q.y += d[1] * tt; q.z += d[2] * tt;
          if (ny < w.heightAt(nx, nz)) q.y = w.heightAt(q.x, q.z) + 0.1;
          hit = true;
        } else { q.x = nx; q.y = ny; q.z = nz; }
      }
      particles.spawn(q.x, q.y, q.z, 0, 0, 0, [col[0] / 255, col[1] / 255, col[2] / 255, 1], 0.07, 0.25, 0, true);
      if (hit) { this.projectiles.splice(i, 1); this.splash(q.id, q.x, q.y, q.z); }
    }
  },
  splash(id, x, y, z) {
    const w = game.world, P = POTIONS[id], c = P.color.map((v) => v / 255);
    for (let k = 0; k < 40; k++) particles.spawn(x, y + 0.2, z, (Math.random() - 0.5) * 7, Math.random() * 5, (Math.random() - 0.5) * 7, [c[0], c[1], c[2], 1], 0.09, 0.5 + Math.random() * 0.6, 10, true);
    for (let k = 0; k < 8; k++) particles.spawn(x, y, z, (Math.random() - 0.5) * 4, 1 + Math.random() * 3, (Math.random() - 0.5) * 4, [0.85, 0.95, 1, 1], 0.05, 0.4, 12, true);
    if (sound.ok) { const t = sound.ctx.currentTime; sound.noiseHit(t, 0.08, 'highpass', 3000, 1, 0.12); sound.tone(t, 'triangle', 2200, 1400, 0.06, 0.05); }
    adv.s.recipes[id] = 1;
    const R = 6;
    const eachEnt = (r, fn) => entities.near(x, z, r, fn);
    switch (id) {
      case 'soin': case 'regen': case 'croissance': {
        const n = id === 'regen' ? 22 : id === 'croissance' ? 14 : 6;
        for (let k = 0; k < n; k++) { const a = Math.random() * TAU, d = Math.sqrt(Math.random()) * (id === 'regen' ? 7 : 4); this.addObject(['poppies', 'daisies', 'lavender', 'cornflower', 'sunflower'][(Math.random() * 5) | 0], x + Math.cos(a) * d, z + Math.sin(a) * d); }
        eachEnt(R, (e) => { e.hp = (PREY[e.kind] || { hp: 3 }).hp; });
        break;
      }
      case 'sylve': for (let k = 0; k < 4; k++) { const a = Math.random() * TAU, d = 2 + Math.random() * 5; this.addObject(Math.random() < 0.6 ? 'oak' : 'birch', x + Math.cos(a) * d, z + Math.sin(a) * d); } break;
      case 'chronos': { // la végétation coupée repousse
        w.objects.forEach((o, i) => {
          if (Math.hypot(o.x - x, o.z - z) > 10) return;
          const g = OBJ_TYPES[o.t];
          if (o.gone && !g.animal && i < adv.genCount && adv.s.deltas[i] === 'gone') { o.gone = false; delete adv.s.deltas[i]; }
        });
        w.objectsDirty = true; w.grid = null; w.shadeDirty = true; w.shadeRegion = [x - 14, z - 14, x + 14, z + 14];
        break;
      }
      case 'vitesse': eachEnt(10, (e) => { e.speedK = 2.5; e.speedT = 12; entities.startFlee(e, x, z); }); break;
      case 'bond': eachEnt(R, (e) => { e.levT = 2.5; }); if (Math.hypot(game.player.pos[0] - x, game.player.pos[2] - z) < 4) { game.player.vel[1] = 13; game.player.onGround = false; } break;
      case 'levitation': eachEnt(R, (e) => { e.levT = 12; }); break;
      case 'lumiere': this.zones.push({ kind: 'light', x, y: y + 1.2, z, r: 16, c: [0.7, 0.95, 1.1], t: 240 }); break;
      case 'fusee': this.zones.push({ kind: 'light', x, y: y + 2, z, r: 45, c: [2.2, 2.1, 1.8], t: 60 }); monster.repel(x, z, 60); break;
      case 'vision': case 'voile': this.zones.push({ kind: 'smoke', x, y, z, t: 20, col: id === 'vision' ? [0.3, 0.8, 0.35, 0.5] : [0.8, 0.82, 0.9, 0.45] }); break;
      case 'geant': eachEnt(R, (e) => { e.scaleK = 2.2; e.scaleT = 40; }); break;
      case 'petit': eachEnt(R, (e) => { e.scaleK = 0.4; e.scaleT = 40; }); break;
      case 'retour': case 'quantique': eachEnt(R, (e) => {
        const a = Math.random() * TAU, d = 60 + Math.random() * 120, nx = e.x + Math.cos(a) * d, nz = e.z + Math.sin(a) * d;
        if (w.inside(nx, nz, 20) && w.heightAt(nx, nz) > w.waterLevel + 0.3) { e.x = nx; e.z = nz; e.hx = nx; e.hz = nz; e.y = w.heightAt(nx, nz); }
      }); glitch.burst(0.4); break;
      case 'feu': this.fire(x, y, z); break;
      case 'explosion': this.boom(x, y, z, 1, false); break;
      case 'givre': eachEnt(R, (e) => { e.stun = 18; }); monster.freeze(x, z, 8, 10); for (let k = 0; k < 30; k++) particles.spawn(x + (Math.random() - 0.5) * 8, y + Math.random() * 2, z + (Math.random() - 0.5) * 8, 0, 0.3, 0, [0.85, 0.95, 1, 1], 0.08, 3, -0.05, true); break;
      case 'poison': this.zones.push({ kind: 'smoke', x, y, z, t: 12, col: [0.55, 0.75, 0.15, 0.55] }); eachEnt(R + 2, (e) => this.hurtCreature(e, 10, [x, y, z])); break;
      case 'force': eachEnt(8, (e) => { e.levT = 1; entities.startFlee(e, x, z); }); this.shakeT = 0.4; break;
      case 'chaos': case 'rupture': this.zones.push({ kind: 'glitch', x, y, z, r: id === 'rupture' ? 30 : 15, t: id === 'rupture' ? 40 : 25 }); if (id === 'rupture') { glitch.burst(2); for (let k = 0; k < 6; k++) this.addTemp('missing', x + (Math.random() - 0.5) * 14, z + (Math.random() - 0.5) * 14, 25); } break;
      case 'sommeil': eachEnt(R + 2, (e) => { e.sleepT = 30; }); break;
      case 'ralenti': eachEnt(R + 2, (e) => { e.speedK = 0.3; e.speedT = 20; }); monster.freeze(x, z, 8, 4); break;
      case 'repulsif': this.zones.push({ kind: 'repel', x, y, z, r: 14, t: 120 }); monster.repel(x, z, 30); break;
      case 'appat': eachEnt(60, (e) => { e.lure = { x, z, t: 40 }; }); break;
      case 'appel': monster.summon(false, x, z); break;
      case 'boue': case 'eau': default: break;
    }
  },
  addTemp(id, x, z, life) {
    const w = game.world;
    const o = { t: OBJ_INDEX[id], x, z, h: 1, f: 0, v: 0, y: w.heightAt(x, z) + 0.2 + Math.random() * 2 };
    w.objects.push(o); w.objectsDirty = true;
    this.zones.push({ kind: 'temp', o, t: life });
  },
  fire(x, y, z) {
    const w = game.world;
    this.zones.push({ kind: 'fire', x, y, z, r: 5, t: 18 });
    this.zones.push({ kind: 'light', x, y: y + 1, z, r: 18, c: [1.6, 0.7, 0.25], t: 18, flicker: true });
    w.objects.forEach((o) => {
      if (o.gone || Math.hypot(o.x - x, o.z - z) > 6) return;
      const t = OBJ_TYPES[o.t];
      if (t.cat === 'Arbres' && t.id !== 'deadtree' && t.id !== 'giantoak') { const i = w.objects.indexOf(o); o.t = OBJ_INDEX.deadtree; o.v = 0; if (i < adv.genCount) adv.s.deltas[i] = 'deadtree'; }
      else if (['bush', 'berry', 'tallgrass', 'fern', 'poppies', 'daisies', 'lavender', 'cornflower', 'sunflower', 'heather', 'wheat', 'mushroom'].includes(t.id)) this.consume(o, { drop: [] });
    });
    w.objectsDirty = true; w.grid = null; w.shadeDirty = true; w.shadeRegion = [x - 12, z - 12, x + 12, z + 12];
    entities.near(x, z, 7, (e) => this.hurtCreature(e, 6, [x, y, z]));
    monster.burn(x, z, 7);
    if (Math.hypot(game.player.pos[0] - x, game.player.pos[2] - z) < 3) adv.hurt(15);
  },
  boom(x, y, z, k, self) {
    const w = game.world, p = game.player;
    for (let i = 0; i < 70; i++) particles.spawn(x, y + 0.3, z, (Math.random() - 0.5) * 16, Math.random() * 12, (Math.random() - 0.5) * 16, i % 3 ? [1, 0.6, 0.2, 1] : [0.3, 0.28, 0.26, 1], 0.14, 0.6 + Math.random() * 0.8, 12, i % 3 !== 0);
    this.zones.push({ kind: 'light', x, y: y + 1, z, r: 30, c: [3, 1.8, 0.8], t: 0.35 });
    if (sound.ok) { const t = sound.ctx.currentTime; sound.noiseHit(t, 0.9, 'lowpass', 2500, 0.7, 0.6, null, 90); sound.tone(t, 'sine', 90, 30, 0.8, 0.8); }
    this.shakeT = 0.8;
    if (self) return;
    if (y - w.heightAt(x, z) < 1.5) {
      adv.s.craters.push([Math.round(x * 10) / 10, Math.round(z * 10) / 10, 4.5, 1.8]);
      adv.crater(w, x, z, 4.5, 1.8);
    }
    w.objects.forEach((o) => {
      if (o.gone || Math.hypot(o.x - x, o.z - z) > 5) return;
      const t = OBJ_TYPES[o.t];
      if (!t.animal && (t.cat !== 'Arbres' || t.id === 'deadtree') && !t.light && t.cat !== 'Laboratoire') this.consume(o, HARVEST[t.id] || { drop: [] });
    });
    entities.near(x, z, 7, (e) => this.hurtCreature(e, 8, [x, y, z]));
    monster.burn(x, z, 8);
    const d = Math.hypot(p.pos[0] - x, p.pos[2] - z);
    if (d < 6) { adv.hurt(Math.round(40 * (1 - d / 6))); p.vel[1] = 7; p.onGround = false; }
  },

  // ------------------------------------------------------------ mise à jour
  update(dt, eye, basis) {
    const e = this.effects, p = game.player;
    for (const k in e) { e[k] -= dt; if (e[k] <= 0) delete e[k]; }
    if (this.has('regen')) adv.heal(2 * dt);
    if (this.has('poison')) adv.hurt(3 * dt);
    const scale = this.has('geant') ? 2 : this.has('petit') ? 0.35 : 1;
    p.mods.scale = lerp(p.mods.scale, scale, Math.min(1, dt * 3));
    p.mods.speed = (this.has('vitesse') ? 1.8 : 1) * (this.has('givre') ? 0.45 : 1) * (adv.s.upgrades.bottes ? 1.15 : 1);
    p.mods.jump = this.has('bond') ? 2.2 : 1;
    p.mods.grav = this.has('levitation') ? -0.35 : this.has('bond') ? 0.5 : 1;
    if (this.has('appat')) entities.near(p.pos[0], p.pos[2], 30, (en) => { en.lure = { x: p.pos[0], z: p.pos[2], t: 2 }; });
    this.flashT = Math.max(0, this.flashT - dt);
    this.shakeT = Math.max(0, this.shakeT - dt);
    // outils : impact au milieu du geste
    if (this.swingT > 0) {
      const tool = adv.s.tool, total = tool === 'hands' ? 0.35 : tool === 'vial' ? 0.6 : 0.5;
      this.swingT -= dt;
      if (!this.hitDone && total - this.swingT > 0.18 && (tool === 'axe' || tool === 'pick' || tool === 'hands')) {
        this.hitDone = true;
        this.meleeHit(eye, basis.f);
      }
    }
    this.updateProjectiles(dt);
    for (let i = this.zones.length - 1; i >= 0; i--) {
      const z = this.zones[i];
      z.t -= dt;
      if (z.kind === 'fire' && Math.random() < dt * 40) particles.spawn(z.x + (Math.random() - 0.5) * z.r * 1.6, z.y + Math.random(), z.z + (Math.random() - 0.5) * z.r * 1.6, 0, 1.5 + Math.random() * 2, 0, [1, 0.5 + Math.random() * 0.3, 0.15, 1], 0.12, 0.8, -1, true);
      if (z.kind === 'smoke' && Math.random() < dt * 25) particles.spawn(z.x + (Math.random() - 0.5) * 7, z.y + Math.random() * 1.5, z.z + (Math.random() - 0.5) * 7, 0, 0.4, 0, z.col, 0.6, 2.5, -0.02, false);
      if (z.t <= 0) {
        if (z.kind === 'temp') { const w = game.world, k = w.objects.indexOf(z.o); if (k >= adv.genCount) { w.objects.splice(k, 1); w.objectsDirty = true; w.grid = null; } }
        this.zones.splice(i, 1);
      }
    }
  },
  // lumières dynamiques des potions (+ luminescence du joueur)
  lights(eye) {
    const L = [];
    for (const z of this.zones) if (z.kind === 'light') {
      const k = z.flicker ? 0.8 + Math.random() * 0.3 : Math.min(1, z.t / 2);
      L.push({ x: z.x, y: z.y, z: z.z, r: z.r, c: v3.scale(z.c, k), d: Math.hypot(z.x - eye[0], z.z - eye[2]) });
    }
    if (this.has('lumiere')) L.push({ x: eye[0], y: eye[1] + 0.3, z: eye[2], r: 14, c: [0.7, 0.95, 1.1], d: 0 });
    return L;
  },
  glitchZone(x, z) {
    let g = 0;
    for (const q of this.zones) if (q.kind === 'glitch') { const d = Math.hypot(q.x - x, q.z - z); if (d < q.r) g = Math.max(g, 1 - d / q.r); }
    return g;
  },
  repelled(x, z) { return this.zones.some((q) => q.kind === 'repel' && Math.hypot(q.x - x, q.z - z) < q.r); },

  // arme / outil en main
  viewModel(p) {
    const tool = adv.s.tool;
    if (tool === 'revolver') return null;
    if (tool === 'hands') return { hide: true };
    if (tool === 'vial') {
      if (!adv.s.potionSel) return { hide: true };
      const c = POTIONS[adv.s.potionSel].color;
      const lift = this.swingT > 0 ? Math.sin((1 - this.swingT / 0.7) * Math.PI) * 0.12 : 0;
      return { spr: 'vm_vial', frame: 0, ox: 0, oy: -lift, tint: [c[0] / 255 * 1.4, c[1] / 255 * 1.4, c[2] / 255 * 1.4] };
    }
    const k = this.swingT > 0 ? 1 - this.swingT / 0.5 : 0;
    const arc = Math.sin(k * Math.PI);
    return { spr: tool === 'axe' ? 'vm_axe' : 'vm_pick', frame: k > 0.22 && k < 0.7 ? 1 : 0, ox: -arc * 0.12, oy: -arc * 0.1 };
  },
};
