// ============================================================================
//  CRÉATURES : animaux de la ferme, gibier, prédateurs, oiseaux (modèles 3D)
//  Chaque espèce a son propre comportement.
// ============================================================================

// walk/run : vitesses ; range : rayon d'errance ; flee : distance d'alerte ; radius : collision
const CREATURES = {
  sheep: { walk: 0.7, run: 3.4, range: 10, flee: 0, radius: 0.4, idle: [2, 8], call: 'sheep', solid: true, graze: true, rig: 'sheep', h: 1.1, herd: true },
  cow: { walk: 0.8, run: 2.8, range: 12, flee: 0, radius: 0.6, idle: [3, 10], call: 'cow', solid: true, graze: true, rig: 'cow', h: 1.5 },
  pig: { walk: 0.7, run: 3.0, range: 8, flee: 0, radius: 0.4, idle: [2, 8], call: 'pig', solid: true, graze: true, rig: 'pig', h: 0.9, root: true },
  horse: { walk: 1.2, run: 6.5, range: 12, flee: 0, radius: 0.6, idle: [3, 9], call: 'horse', solid: true, graze: true, rig: 'horse', h: 2.2 },
  hen: { walk: 0.8, run: 3.4, range: 7, flee: 2.2, radius: 0.15, idle: [1, 4], call: 'hen', rig: 'hen', h: 0.5, peck: true },
  rabbit: { walk: 1.0, run: 7.0, range: 16, flee: 9, radius: 0.15, idle: [1, 5], hop: true, rig: 'rabbit', h: 0.4, wild: true },
  deer: { walk: 1.0, run: 8.5, range: 30, flee: 22, radius: 0.4, idle: [2, 7], solid: true, graze: true, rig: 'deer', h: 1.9, wild: true, shy: true },
  boar: { walk: 0.9, run: 6.5, range: 20, flee: 0, radius: 0.45, idle: [2, 8], solid: true, rig: 'boar', h: 1.0, wild: true, charge: 7, dmg: 18 },
  fox: { walk: 1.3, run: 7.5, range: 26, flee: 12, radius: 0.25, idle: [2, 6], rig: 'fox', h: 0.6, wild: true, night: true, sneaky: true },
  wolf: { walk: 1.4, run: 7.8, range: 40, flee: 0, radius: 0.35, idle: [2, 6], solid: true, rig: 'wolf', h: 0.95, wild: true, pack: true, dmg: 14 },
  duck: { walk: 0.5, run: 1.6, range: 9, flee: 4, radius: 0.2, idle: [2, 6], water: true, call: 'duck', rig: 'duck', h: 0.4 },
  dog: { walk: 1.4, run: 7.2, range: 8, flee: 0, radius: 0.28, idle: [2, 6], rig: 'dog', h: 0.75, pet: true },
  cat: { walk: 0.8, run: 5, range: 10, flee: 3, radius: 0.18, idle: [3, 12], rig: 'cat', h: 0.4, stare: true },
  crow: { fly: true, rig: 'crow', flock: 6, crow: true },
  bird: { fly: true, rig: 'songbird', flock: 7 },
};

function turnToward(a, b, max) {
  const d = ((b - a + Math.PI) % TAU + TAU) % TAU - Math.PI;
  return a + clamp(d, -max, max);
}
function angDiff(a, b) { return ((b - a + Math.PI) % TAU + TAU) % TAU - Math.PI; }

// Dessin d'un squelette à une position (et son ombre)
const _root = new Float32Array(12);
function drawRig(buf, rig, x, y, z, heading, s, flags) {
  m34Root(_root, x, y, z, heading, s || 1);
  rig.emit(buf, _root, flags || 0);
}
function drawRigM(buf, rig, M, flags) { rig.emit(buf, M, flags || 0); }
function drawShadow(buf, x, y, z, r) {
  m34Root(_root, x, y + 0.03, z, 0, 1);
  buf.box(_root, 0, 0, 0, r * 2, 0.02, r * 2, [0, 0, 0], 0);
}

const entities = {
  list: [], byObj: new Map(), n: 0, callT: 3, version: -1, extra: [],

  reset() { this.list = []; this.byObj.clear(); this.version = -1; this.extra = []; },

  // Crée / supprime les créatures selon les points d'apparition présents dans le monde
  sync(w) {
    const alive = new Set();
    for (const o of w.objects) {
      const t = OBJ_TYPES[o.t];
      if (!t.animal || !w.live(o) || t.hidden) continue;
      alive.add(o);
      if (!this.byObj.has(o)) this.byObj.set(o, this.spawnFrom(w, o, t.animal));
    }
    for (const o of [...this.byObj.keys()]) if (!alive.has(o)) this.byObj.delete(o);
    this.list = [];
    for (const arr of this.byObj.values()) for (const e of arr) this.list.push(e);
    for (const e of this.extra) if (!e.removed) this.list.push(e);
    this.version = w.objVersion;
  },
  // Créature ajoutée par le jeu (bêtes du joueur, chien, loups…)
  add(w, kind, x, z, opts = {}) {
    const e = this.make(w, kind, x, z, null, opts);
    this.extra.push(e); this.list.push(e);
    return e;
  },
  remove(e) { e.removed = true; e.dead = true; this.extra = this.extra.filter((q) => q !== e); this.list = this.list.filter((q) => q !== e); },

  make(w, kind, x, z, o, opts = {}) {
    const cfg = CREATURES[kind] || CREATURES.sheep;
    const v = opts.v ?? (o ? o.v : (Math.random() * 4) | 0);
    const rigFn = ANIMAL_RIGS[cfg.rig];
    const e = Object.assign({
      o, kind, cfg, v, rig: rigFn ? rigFn(v, opts.white) : null, h: cfg.h || 1, hx: x, hz: z, x, z, y: 0, heading: Math.random() * TAU,
      state: 'idle', timer: Math.random() * 4, phase: Math.random() * 6, move: 0, run: false, hidden: false, far: false, seed: Math.random() * 100,
      hp: (PREY[kind] || { hp: 20 }).hp, dead: false, stun: 0, grazeT: 0, lookY: 0, attackT: 0, owner: null, scale: opts.scale || 1,
    }, opts);
    e.y = o && o.y !== undefined ? o.y : this.groundY(w, e, x, z);
    return e;
  },
  spawnFrom(w, o, kind) {
    const cfg = CREATURES[kind];
    if (!cfg) return [];
    if (cfg.fly) {
      const baseY = Math.max(w.heightAt(o.x, o.z), w.waterLevel);
      return Array.from({ length: cfg.flock }, () => {
        const e = this.make(w, kind, o.x, o.z, o, { v: (Math.random() * 4) | 0 });
        Object.assign(e, { y: baseY + 25, baseY, flyA: Math.random() * TAU, flyR: 10 + Math.random() * 14, flyH: 18 + Math.random() * 12,
          flyS: (0.22 + Math.random() * 0.18) * (Math.random() < 0.5 ? 1 : -1), scaredT: 0, land: null, landT: 0 });
        return e;
      });
    }
    const e = this.make(w, kind, o.x, o.z, o);
    if (cfg.pack) { // les loups vont par trois
      const arr = [e];
      for (let k = 0; k < 2; k++) arr.push(this.make(w, kind, o.x + (Math.random() - 0.5) * 6, o.z + (Math.random() - 0.5) * 6, o));
      for (const q of arr) q.pack = arr;
      return arr;
    }
    return [e];
  },

  groundY(w, e, x, z) {
    if (e.cfg.water) return w.waterLevel - e.h * 0.25;
    return w.groundAt(x, z, Math.max(e.y ?? -1e9, w.heightAt(x, z)) + 0.6, 0.6);
  },

  update(dt, w, c) {
    for (const e of this.list) {
      if (c.frozen && !e.cfg.fly) { // éditeur : chaque créature reste sur son point d'apparition
        e.x = e.hx; e.z = e.hz; e.state = 'idle'; e.hidden = false; e.move = 0; e.far = false;
        e.y = e.o && e.o.y !== undefined ? e.o.y : this.groundY(w, e, e.x, e.z);
        continue;
      }
      if (e.dead || e.ridden) continue;
      const dx = e.x - c.px, dz = e.z - c.pz, d2 = dx * dx + dz * dz;
      e.far = d2 > 220 * 220 && !e.owner;
      if (e.far) continue;
      e.dist = Math.sqrt(d2);
      if (e.stun > 0) { e.stun -= dt; e.move = 0; continue; }
      if (e.cfg.fly) this.updateBird(e, dt, w, c);
      else this.updateWalker(e, dt, w, c);
    }
    if (!c.frozen) this.calls(dt, c);
  },

  // Dégâts (chasse, prédateurs) : renvoie true si la bête meurt
  damage(e, dmg, fx, fz) {
    if (e.dead) return false;
    e.hp -= dmg;
    e.hurtT = 0.3;
    if (e.hp > 0) {
      if (e.cfg.charge || e.cfg.pack) { e.state = 'charge'; e.timer = 6; e.angry = 20; }
      else if (!e.cfg.fly) this.startFlee(e, fx, fz);
      return false;
    }
    e.dead = true; e.hidden = true;
    return true;
  },
  near(x, z, r, fn) {
    for (const e of this.list) if (!e.dead && !e.far && !e.hidden && Math.hypot(e.x - x, e.z - z) < r) fn(e);
  },
  startFlee(e, fx, fz) {
    e.state = 'flee';
    e.fleeDir = Math.atan2(e.x - fx, e.z - fz) + (Math.random() - 0.5) * 0.8;
    e.timer = 2.5 + Math.random() * 3;
  },
  pickTarget(e, w, r) {
    const cfg = e.cfg, range = r || cfg.range;
    for (let k = 0; k < 6; k++) {
      const a = Math.random() * TAU, rr = Math.sqrt(Math.random()) * range;
      const tx = e.hx + Math.cos(a) * rr, tz = e.hz + Math.sin(a) * rr;
      if (!w.inside(tx, tz, 3)) continue;
      const gh = w.heightAt(tx, tz);
      if (cfg.water ? gh > w.waterLevel - 0.3 : gh < w.waterLevel + 0.2) continue;
      e.tx = tx; e.tz = tz; e.state = 'walk'; e.timer = 25;
      return;
    }
    e.timer = 1;
  },
  goTo(e, x, z, state, run) { e.tx = x; e.tz = z; e.state = state || 'walk'; e.timer = 40; e.runTo = !!run; },

  updateWalker(e, dt, w, c) {
    const cfg = e.cfg;
    e.hurtT = Math.max(0, (e.hurtT || 0) - dt);
    // bêtes de la ferme : rentrent à la grange (ou au poulailler) la nuit et sous l'orage
    if (e.owner && e.shelter && !e.follow) {
      const inside = c.night > 0.55 || c.storm > 0.5;
      if (inside && e.state !== 'shelter' && e.state !== 'sheltered') this.goTo(e, e.shelter.x + (Math.random() - 0.5) * 3, e.shelter.z + (Math.random() - 0.5) * 3, 'shelter');
      else if (!inside && (e.state === 'shelter' || e.state === 'sheltered')) { e.state = 'idle'; e.timer = Math.random() * 20; }
    }
    // comportements propres
    if (cfg.night && c.night < 0.4 && cfg.sneaky && e.dist > 40) { e.hidden = true; return; } // le renard ne sort que la nuit
    e.hidden = false;
    if (cfg.pack) { if (this.wolfAI(e, dt, w, c)) return; }
    else if (cfg.charge) { if (this.boarAI(e, dt, w, c)) return; }
    else if (cfg.pet && e.owner) { if (this.dogAI(e, dt, w, c)) return; }
    if (e.follow) { // cheval appelé ou tenu
      const fd = Math.hypot(c.px - e.x, c.pz - e.z);
      if (fd > 3) this.goTo(e, c.px, c.pz, 'follow', fd > 10); else if (e.state === 'follow') { e.state = 'idle'; e.timer = 2; }
    }
    // fuite
    const alert = cfg.flee ? cfg.flee * (c.crouch ? 0.45 : 1) * (c.sprint ? 1.4 : 1) : 0;
    if (alert && e.dist < alert && e.state !== 'flee' && !e.owner) this.startFlee(e, c.px, c.pz);
    if (cfg.flee && e.owner && e.dist < cfg.flee * 0.8 && c.sprint && e.state !== 'flee') this.startFlee(e, c.px, c.pz);
    if (e.scared) { e.scared = false; this.startFlee(e, e.scareX, e.scareZ); }
    e.timer -= dt;
    let speed = 0;
    if (e.state === 'idle' || e.state === 'sheltered') {
      e.grazeT = cfg.graze ? Math.max(0, Math.sin(c.t * 0.3 + e.seed) * 1.2) : 0;
      if (e.timer <= 0 && e.state === 'idle') this.pickTarget(e, w);
    } else {
      speed = e.state === 'flee' || e.state === 'charge' || e.runTo ? cfg.run : cfg.walk;
      if (e.state === 'follow' && !e.runTo) speed = cfg.walk * 2.2;
      e.grazeT = 0;
      const tdx = (e.tx ?? e.x) - e.x, tdz = (e.tz ?? e.z) - e.z, td = Math.hypot(tdx, tdz);
      if (e.state === 'flee') {
        if (e.timer <= 0) { e.state = 'idle'; e.timer = 1 + Math.random() * 2; speed = 0; }
      } else if (td < 0.6 || e.timer <= 0) {
        if (e.state === 'shelter') { e.state = 'sheltered'; speed = 0; }
        else { e.state = 'idle'; e.timer = lerp(cfg.idle[0], cfg.idle[1], Math.random()); speed = 0; e.runTo = false; }
      }
      if (speed > 0) {
        const want = e.state === 'flee' ? e.fleeDir : Math.atan2(tdx, tdz);
        e.heading = turnToward(e.heading, want, dt * (cfg.hop ? 7 : 4));
        this.stepMove(e, dt, w, speed);
      }
    }
    e.move = lerp(e.move, speed > 0 ? Math.min(1, speed / Math.max(cfg.walk, 0.1)) : 0, Math.min(1, dt * 6));
    e.run = speed > cfg.walk * 1.5;
    e.phase += dt * speed * (cfg.hop ? 3.4 : 2.6) / Math.max(0.5, e.h);
    // regard vers le joueur quand il est tout près
    const want = e.dist < 6 ? angDiff(e.heading, Math.atan2(c.px - e.x, c.pz - e.z)) : 0;
    e.lookY = lerp(e.lookY, e.stareAll ? angDiff(e.heading, Math.atan2(c.px - e.x, c.pz - e.z)) : clamp(want, -0.9, 0.9) * (Math.abs(want) < 1.6 ? 1 : 0), Math.min(1, dt * 3));
  },
  stepMove(e, dt, w, speed) {
    const cfg = e.cfg;
    let nx = e.x + Math.sin(e.heading) * speed * dt, nz = e.z + Math.cos(e.heading) * speed * dt;
    const gh = w.heightAt(nx, nz);
    const bad = cfg.water ? gh > w.waterLevel - 0.25 : gh < w.waterLevel + 0.1;
    if (bad || !w.inside(nx, nz, 3)) {
      if (e.state === 'flee') e.fleeDir += Math.PI * (0.5 + Math.random());
      else { e.state = e.state === 'shelter' ? 'sheltered' : 'idle'; e.timer = 0.5 + Math.random(); }
      return;
    }
    [nx, nz] = w.collideCircle(nx, nz, e.y, e.y + e.h, cfg.radius, 0.45, cfg.radius > 0.2);
    const moved = Math.hypot(nx - e.x, nz - e.z);
    e.stuck = moved < speed * dt * 0.25 ? (e.stuck || 0) + dt : 0;
    if (e.stuck > 1.2) {
      e.stuck = 0;
      if (e.state === 'shelter') { e.x = e.tx; e.z = e.tz; e.y = this.groundY(w, e, e.x, e.z); e.state = 'sheltered'; return; }
      if (e.state === 'follow') { e.heading += (Math.random() - 0.5) * 2; return; }
      e.state = 'idle'; e.timer = 0.5;
    }
    e.x = nx; e.z = nz;
    e.y = this.groundY(w, e, nx, nz);
  },

  // Sanglier : charge si l'on s'approche trop ou si on le blesse
  boarAI(e, dt, w, c) {
    e.angry = Math.max(0, (e.angry || 0) - dt);
    if (e.state !== 'charge' && e.dist < e.cfg.charge && c.alive && !c.inside) { e.state = 'charge'; e.timer = 5; sound.animal('pig', 0, 1); }
    if (e.state !== 'charge') return false;
    e.timer -= dt;
    if (e.timer <= 0 || e.dist > 30 || !c.alive) { this.startFlee(e, c.px, c.pz); return false; }
    e.heading = turnToward(e.heading, Math.atan2(c.px - e.x, c.pz - e.z), dt * 3.5);
    this.stepMove(e, dt, w, e.cfg.run);
    e.move = 1; e.run = true; e.phase += dt * 9;
    e.attackT = Math.max(0, e.attackT - dt);
    if (e.dist < 1.1 && e.attackT <= 0) { e.attackT = 1.5; c.hurt(e.cfg.dmg, e, 'Encorné par un sanglier'); this.startFlee(e, c.px, c.pz); e.timer = 3; }
    return true;
  },
  // Loups : chassent en meute la nuit, encerclent, craignent le feu et la lanterne
  wolfAI(e, dt, w, c) {
    const night = c.night > 0.5;
    if (!night && !e.angry) { if (e.dist < 60) { e.hidden = false; return false; } e.hidden = true; return true; }
    e.hidden = false;
    e.angry = Math.max(0, (e.angry || 0) - dt);
    e.recul = Math.max(0, (e.recul || 0) - dt);
    const fear = c.fire || (c.lantern && e.dist < 9);
    e.attackT = Math.max(0, e.attackT - dt);
    if (fear && e.dist < 14) { this.startFlee(e, c.px, c.pz); e.timer = 3; sound.growl && sound.growl(0.4); return false; }
    if ((e.dist < 45 && c.alive && !c.inside && !c.riding) || e.angry > 0) {
      const k = (e.pack ? e.pack.indexOf(e) : 0) / 3 * TAU + c.t * 0.25;
      // la meute harcèle : après une morsure, le loup recule et tourne quelques secondes avant de revenir, et la meute
      // ne mord qu'un loup à la fois (jamais deux morsures à moins de 1,8 s). Un homme immobile et sans lumière tient
      // une quinzaine de secondes après la première morsure (sept avant) : le temps d'allumer la lanterne ou de fuir
      const circle = (e.dist > 6 && e.attackT < 0.5 && !e.angry) || e.recul > 0;
      const tx = circle ? c.px + Math.sin(k) * 7 : c.px, tz = circle ? c.pz + Math.cos(k) * 7 : c.pz;
      e.heading = turnToward(e.heading, Math.atan2(tx - e.x, tz - e.z), dt * 4);
      const sp = circle ? (e.recul > 0 ? e.cfg.run * 0.7 : e.cfg.walk * 2.4) : e.cfg.run;
      this.stepMove(e, dt, w, sp);
      e.move = 1; e.run = sp > 3; e.phase += dt * sp * 2.2;
      const libre = !e.pack || !e.pack.some((o) => o.mordT > c.t - 1.8);
      if (!circle && e.dist < 1.2 && e.attackT <= 0 && libre) { e.attackT = 2.2; e.mordT = c.t; e.recul = 2 + Math.random() * 2; c.hurt(e.cfg.dmg, e, 'Dévoré par les loups'); }
      if (Math.random() < dt * 0.05 && sound.howl) sound.howl(e.dist);
      return true;
    }
    return false;
  },
  // Chien de la ferme : suit le joueur, aboie après les choses étranges
  dogAI(e, dt, w, c) {
    e.barkT = Math.max(0, (e.barkT || 0) - dt);
    if (e.alarm) { // quelque chose rôde : il fixe la direction et aboie
      e.heading = turnToward(e.heading, Math.atan2(e.alarm.x - e.x, e.alarm.z - e.z), dt * 5);
      e.move = 0;
      if (e.barkT <= 0) { e.barkT = 0.7 + Math.random() * 0.6; sound.bark && sound.bark(clamp(1 - e.dist / 60, 0, 1), (e.x - c.px) * c.right[0] + (e.z - c.pz) * c.right[2]); }
      e.alarm = null;
      return true;
    }
    if (c.night > 0.6 && !c.nearFarm) { if (e.state !== 'shelter' && e.state !== 'sheltered' && e.shelter) this.goTo(e, e.shelter.x, e.shelter.z, 'shelter'); return false; }
    if (c.nearFarm && e.dist > 5 && e.dist < 160 && !c.inside) {
      if (e.dist > 4) { this.goTo(e, c.px + Math.sin(e.seed) * 2, c.pz + Math.cos(e.seed) * 2, 'follow', e.dist > 12); }
      e.hx = c.px; e.hz = c.pz;
    } else if (e.shelter && !c.nearFarm) { e.hx = e.shelter.x; e.hz = e.shelter.z; }
    e.wag = e.dist < 4;
    return false;
  },

  updateBird(e, dt, w, c) {
    const cfg = e.cfg;
    if (e.frozenT > 0) { e.frozenT -= dt; return; }
    if (e.still) { // corbeaux posés en cercle (étrange) : immobiles, puis s'envolent
      e.hidden = false; e.fly = 0; e.peck = false;
      e.circle -= dt;
      if (e.circle <= 0 || e.dist < 7) { e.still = false; e.leaving = 8; sound.crow && sound.crow(0.8); }
      return;
    }
    if (e.leaving !== undefined) { e.leaving -= dt; e.fly = 1; e.y += dt * 6; e.x += Math.sin(e.heading) * dt * 9; e.z += Math.cos(e.heading) * dt * 9; if (e.leaving <= 0) this.remove(e); return; }
    e.hidden = c.night > 0.55 || c.rain > 0.6;
    if (e.hidden) return;
    // corbeaux : se posent sur les champs par beau temps, le matin
    if (cfg.crow && e.land) {
      e.landT -= dt;
      const scare = Math.hypot(c.px - e.x, c.pz - e.z) < 9 || e.landT <= 0 || e.scaredT > 0;
      if (scare) { e.land = null; e.scaredT = 4; sound.crow && sound.crow(0.6); }
      else {
        if (e.y > e.land.y + 0.05) { e.x = lerp(e.x, e.land.x, Math.min(1, dt * 1.5)); e.z = lerp(e.z, e.land.z, Math.min(1, dt * 1.5)); e.y = Math.max(e.land.y, e.y - dt * 6); e.fly = 1; }
        else { e.y = e.land.y; e.fly = 0; e.peck = true; if (e.land.onLand && !e.land.done && e.landT < 6) { e.land.done = true; e.land.onLand(e); } }
        e.phase += dt * 3;
        return;
      }
    }
    e.fly = 1; e.peck = false;
    if (e.scaredT > 0) { e.scaredT -= dt; e.flyR = Math.min(e.flyR + dt * 8, 70); } else e.flyR = Math.max(e.flyR - dt * 0.6, 12);
    e.flyA += e.flyS * dt * (e.scaredT > 0 ? 2.5 : 1);
    const cx = e.hx + Math.sin(c.t * 0.05 + e.seed) * 25, cz = e.hz + Math.cos(c.t * 0.04 + e.seed) * 25;
    const nx = cx + Math.cos(e.flyA) * e.flyR, nz = cz + Math.sin(e.flyA) * e.flyR;
    e.heading = Math.atan2(nx - e.x, nz - e.z);
    e.x = nx; e.z = nz;
    e.y = e.baseY + e.flyH + Math.sin(c.t * 0.7 + e.seed) * 2 + (e.scaredT > 0 ? 8 : 0);
  },

  // Bruit : les créatures proches s'enfuient
  scare(x, z, r) {
    for (const e of this.list) {
      if (e.far || e.hidden || e.dead) continue;
      if (Math.hypot(e.x - x, e.z - z) > r) continue;
      if (e.cfg.fly) e.scaredT = 5;
      else if (!e.cfg.charge && !e.cfg.pack) { e.scared = true; e.scareX = x; e.scareZ = z; }
    }
  },

  // Le joueur ne traverse pas les gros animaux
  pushPlayer(p) {
    for (const e of this.list) {
      if (!e.cfg.solid || e.hidden || e.far || e.dead || e.ridden || Math.abs(p.pos[1] - e.y) > 1.5) continue;
      const dx = p.pos[0] - e.x, dz = p.pos[2] - e.z, d = Math.hypot(dx, dz), min = e.cfg.radius + P_RADIUS;
      if (d < min && d > 1e-4) { p.pos[0] = e.x + dx / d * min; p.pos[2] = e.z + dz / d * min; }
    }
  },

  raycast(o, d, maxDist) {
    let best = null;
    const dh = Math.hypot(d[0], d[2]) || 1e-6;
    for (const e of this.list) {
      if (e.hidden || e.far || e.dead || e.ridden) continue;
      const r = Math.max(0.25, e.cfg.radius * 1.3 + (e.cfg.fly ? 0.2 : 0)), cx = e.x - o[0], cz = e.z - o[2];
      const tc = (cx * d[0] + cz * d[2]) / (dh * dh);
      if (tc < 0 || tc > maxDist) continue;
      const px = d[0] * tc - cx, pz = d[2] * tc - cz;
      if (px * px + pz * pz > r * r) continue;
      const y = o[1] + d[1] * tc;
      if (y < e.y - 0.1 || y > e.y + e.h * e.scale + 0.1) continue;
      if (!best || tc < best.t) best = { t: tc, e, p: [o[0] + d[0] * tc, y, o[2] + d[2] * tc] };
    }
    return best;
  },

  calls(dt, c) {
    this.callT -= dt;
    if (this.callT > 0) return;
    this.callT = 1.2 + Math.random() * 3.5;
    if (c.rain > 0.7 || c.silent) return;
    const near = this.list.filter((e) => e.cfg.call && !e.hidden && !e.far && !e.dead && Math.hypot(e.x - c.px, e.z - c.pz) < 26);
    if (!near.length) return;
    const e = near[(Math.random() * near.length) | 0];
    const dx = e.x - c.px, dz = e.z - c.pz, d = Math.hypot(dx, dz) || 1;
    sound.animal(e.cfg.call, (dx * c.right[0] + dz * c.right[2]) / d, 1 - d / 28);
  },

  // Rendu : squelettes des créatures visibles
  draw(buf, sbuf, cam, maxD, t, flags) {
    const max2 = maxD * maxD;
    for (const e of this.list) {
      if (e.hidden || e.far || (e.dead && !e.corpse) || !e.rig || e.ridden) continue;
      const dx = e.x - cam[0], dz = e.z - cam[2];
      if (dx * dx + dz * dz > max2) continue;
      const st = { move: e.move, phase: e.phase, run: e.run, t, graze: e.grazeT, lookY: e.lookY, wag: e.wag, fly: e.fly, peck: e.peck || (e.cfg.peck && e.move < 0.1 && Math.sin(t * 0.8 + e.seed) > 0.4), seed: e.seed, lie: (e.state === 'sheltered' && e.kind !== 'hen') || e.corpse || e.curledNow, raise: e.raise };
      const r = e.rig;
      if (r.kind === 'bird') poseBird(r, st); else if (r.kind === 'snake') poseSnake(r, st); else poseQuad(r, st);
      const hop = e.cfg.hop ? Math.abs(Math.sin(e.phase)) * 0.12 * e.move : 0;
      let fl = e.hurtT > 0 ? FX_HI : 0;
      if (e.highlight) fl |= FX_HI;
      drawRig(buf, r, e.x, e.y + hop + (st.lie ? -e.h * 0.25 : 0), e.z, e.heading, e.scale, fl | flags);
      if (!e.cfg.fly && sbuf && !e.corpse) drawShadow(sbuf, e.x, e.y, e.z, Math.max(0.2, e.cfg.radius * 1.1) * e.scale);
    }
  },
};
