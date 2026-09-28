// ============================================================================
//  CRÉATURES : animaux et villageois (IA simple, sprites orientés façon Doom)
// ============================================================================

const CREATURES = {
  sheep: { walk: 0.7, run: 3.2, range: 9, flee: 0, radius: 0.4, idle: [2, 8], call: 'sheep', solid: true },
  cow: { walk: 0.8, run: 2.8, range: 11, flee: 0, radius: 0.6, idle: [3, 10], call: 'cow', solid: true },
  pig: { walk: 0.7, run: 3.0, range: 7, flee: 0, radius: 0.4, idle: [2, 8], call: 'pig', solid: true },
  horse: { walk: 1.1, run: 6.0, range: 12, flee: 0, radius: 0.6, idle: [3, 9], call: 'horse', solid: true },
  hen: { walk: 0.8, run: 3.2, range: 7, flee: 2.5, radius: 0.15, idle: [1, 4], call: 'hen' },
  rabbit: { walk: 1.0, run: 7.0, range: 16, flee: 8, radius: 0.15, idle: [1, 5], hop: true },
  deer: { walk: 1.0, run: 8.0, range: 28, flee: 20, radius: 0.4, idle: [2, 7], solid: true },
  duck: { walk: 0.5, run: 1.6, range: 9, flee: 4, radius: 0.2, idle: [2, 6], water: true, call: 'duck' },
  bird: { fly: true },
  villager: { walk: 1.25, run: 3.4, range: 22, flee: 0, radius: 0.3, idle: [2, 9], human: true, solid: true },
};

function turnToward(a, b, max) {
  const d = ((b - a + Math.PI) % TAU + TAU) % TAU - Math.PI;
  return a + clamp(d, -max, max);
}

const entities = {
  list: [], byObj: new Map(), data: new Float32Array(2048 * 13), n: 0, callT: 3, version: -1,

  reset() { this.list = []; this.byObj.clear(); this.version = -1; },

  // Crée / supprime les créatures selon les points d'apparition présents dans le monde
  sync(w) {
    const alive = new Set();
    for (const o of w.objects) {
      const t = OBJ_TYPES[o.t];
      if (!t.animal || o.gone || t.hidden) continue;
      alive.add(o);
      if (!this.byObj.has(o)) this.byObj.set(o, this.spawn(w, o, t));
    }
    for (const o of [...this.byObj.keys()]) if (!alive.has(o)) this.byObj.delete(o);
    this.list = [];
    for (const arr of this.byObj.values()) for (const e of arr) this.list.push(e);
    this.version = w.objVersion;
  },

  groundY(w, e, x, z) {
    if (e.cfg.water) return w.waterLevel - e.h * 0.28;
    return w.groundAt(x, z, Math.max(e.y ?? -1e9, w.heightAt(x, z)) + 0.6, 0.6);
  },

  spawn(w, o, t) {
    const kind = t.animal, cfg = CREATURES[kind], spr = ATLAS.sprites[t.spr[o.v % t.spr.length]];
    const base = { o, kind, cfg, spr, h: o.h, w: o.h * spr.aspect, hx: o.x, hz: o.z, x: o.x, z: o.z, heading: Math.random() * TAU,
      state: 'idle', timer: Math.random() * 4, frame: 0, frameT: 0, moving: false, hidden: false, far: false, seed: Math.random() * 100,
      hp: (PREY[kind] || { hp: 3 }).hp, dead: false, stun: 0, sleepT: 0, scaleK: 1, scaleT: 0, levT: 0, yOff: 0, lure: null, speedK: 1, speedT: 0 };
    if (cfg.fly) {
      const baseY = Math.max(w.heightAt(o.x, o.z), w.waterLevel);
      return Array.from({ length: 7 }, () => ({ ...base, y: baseY + 25, baseY, flyA: Math.random() * TAU, flyR: 10 + Math.random() * 14,
        flyH: 20 + Math.random() * 14, flyS: (0.22 + Math.random() * 0.18) * (Math.random() < 0.5 ? 1 : -1), seed: Math.random() * 100, scaredT: 0 }));
    }
    const e = { ...base, y: undefined };
    e.y = o.y !== undefined ? o.y : this.groundY(w, e, o.x, o.z);
    return [e];
  },

  update(dt, w, c) {
    for (const e of this.list) {
      if (c.frozen && !e.cfg.fly) { // éditeur : chaque créature reste sur son point d'apparition
        e.x = e.hx; e.z = e.hz; e.state = 'idle'; e.hidden = false; e.moving = false; e.frame = 0; e.far = false;
        e.y = e.o.y !== undefined ? e.o.y : this.groundY(w, e, e.x, e.z);
        continue;
      }
      if (e.dead) continue;
      const dx = e.x - c.px, dz = e.z - c.pz, d2 = dx * dx + dz * dz;
      e.far = d2 > 250 * 250;
      if (e.far) continue;
      // effets de potions
      if (e.scaleT > 0) { e.scaleT -= dt; if (e.scaleT <= 0) e.scaleK = 1; }
      if (e.speedT > 0) { e.speedT -= dt; if (e.speedT <= 0) e.speedK = 1; }
      if (e.levT > 0) { e.levT -= dt; e.yOff = Math.min(e.yOff + dt * 1.6, 5); } else if (e.yOff > 0) e.yOff = Math.max(0, e.yOff - dt * 4);
      if (e.lure && (e.lure.t -= dt) > 0 && !e.cfg.fly) { e.state = 'walk'; e.tx = e.lure.x; e.tz = e.lure.z; e.timer = 5; } else e.lure = null;
      if (e.stun > 0 || e.sleepT > 0) { e.stun = Math.max(0, e.stun - dt); e.sleepT = Math.max(0, e.sleepT - dt); e.moving = false; e.frame = 0; continue; }
      if (e.cfg.fly) this.updateBird(e, dt, w, c);
      else this.updateWalker(e, dt * e.speedK, w, c, Math.sqrt(d2));
    }
    if (!c.frozen) this.calls(dt, c);
  },

  // Dégâts (chasse) : renvoie true si la bête meurt
  damage(e, dmg, fx, fz) {
    if (e.dead) return false;
    e.hp -= dmg;
    e.stun = 0; e.sleepT = 0;
    if (e.hp > 0) { if (!e.cfg.fly) this.startFlee(e, fx, fz); return false; }
    e.dead = true; e.hidden = true;
    return true;
  },
  near(x, z, r, fn) {
    for (const e of this.list) if (!e.dead && !e.far && Math.hypot(e.x - x, e.z - z) < r) fn(e);
  },

  startFlee(e, fx, fz) {
    e.state = 'flee';
    e.fleeDir = Math.atan2(e.x - fx, e.z - fz) + (Math.random() - 0.5) * 0.8;
    e.timer = 2.5 + Math.random() * 2.5;
  },

  pickTarget(e, w) {
    const cfg = e.cfg;
    for (let k = 0; k < 6; k++) {
      const a = Math.random() * TAU, r = Math.sqrt(Math.random()) * cfg.range;
      const tx = e.hx + Math.cos(a) * r, tz = e.hz + Math.sin(a) * r;
      if (!w.inside(tx, tz, 3)) continue;
      const gh = w.heightAt(tx, tz);
      if (cfg.water ? gh > w.waterLevel - 0.3 : gh < w.waterLevel + 0.2) continue;
      e.tx = tx; e.tz = tz; e.state = 'walk'; e.timer = 25;
      return;
    }
    e.timer = 1;
  },

  updateWalker(e, dt, w, c, dist) {
    const cfg = e.cfg;
    if (cfg.human) { // les villageois rentrent chez eux la nuit et sous l'orage
      if (c.night > 0.6 || c.rain > 0.65) { if (e.state !== 'home') { e.state = 'home'; e.tx = e.hx; e.tz = e.hz; e.timer = 60; } }
      else if (e.state === 'home') { e.hidden = false; e.state = 'idle'; e.timer = Math.random() * 3; }
    }
    if (e.hidden && e.state !== 'home') e.hidden = false;
    if (cfg.flee && dist < cfg.flee && e.state !== 'flee' && !e.hidden) this.startFlee(e, c.px, c.pz);
    if (e.scared) { e.scared = false; if (!e.hidden) this.startFlee(e, e.scareX, e.scareZ); }
    e.timer -= dt;
    let speed = 0;
    if (e.state === 'idle') {
      if (e.timer <= 0) this.pickTarget(e, w);
    } else if (!e.hidden) {
      speed = e.state === 'flee' ? cfg.run : cfg.walk;
      const tdx = (e.tx ?? e.x) - e.x, tdz = (e.tz ?? e.z) - e.z, td = Math.hypot(tdx, tdz);
      if (e.state === 'flee') {
        if (e.timer <= 0) { e.state = 'idle'; e.timer = 1 + Math.random() * 2; speed = 0; }
      } else if (td < 0.5 || e.timer <= 0) {
        if (e.state === 'home') { e.hidden = true; speed = 0; }
        else { e.state = 'idle'; e.timer = lerp(cfg.idle[0], cfg.idle[1], Math.random()); speed = 0; }
      }
      if (speed > 0) {
        const want = e.state === 'flee' ? e.fleeDir : Math.atan2(tdx, tdz);
        e.heading = turnToward(e.heading, want, dt * 4);
        let nx = e.x + Math.sin(e.heading) * speed * dt, nz = e.z + Math.cos(e.heading) * speed * dt;
        const gh = w.heightAt(nx, nz);
        const bad = cfg.water ? gh > w.waterLevel - 0.25 : gh < w.waterLevel + 0.15;
        if (bad || !w.inside(nx, nz, 3)) {
          if (e.state === 'flee') e.fleeDir += Math.PI * (0.5 + Math.random());
          else { e.state = 'idle'; e.timer = 0.5 + Math.random(); }
          speed = 0;
        } else {
          [nx, nz] = w.collideCircle(nx, nz, e.y, e.y + e.h, cfg.radius, 0.45, cfg.radius > 0.2);
          const moved = Math.hypot(nx - e.x, nz - e.z);
          e.stuck = moved < speed * dt * 0.25 ? (e.stuck || 0) + dt : 0;
          if (e.stuck > 1.2) { e.stuck = 0; if (e.state === 'home') e.hidden = true; else { e.state = 'idle'; e.timer = 0.5; } }
          e.x = nx; e.z = nz;
          e.y = this.groundY(w, e, nx, nz);
        }
      }
    }
    e.moving = speed > 0;
    if (e.moving) { e.frameT += dt * speed * (cfg.hop ? 2.4 : 1.8); e.frame = Math.floor(e.frameT) % 2; } else e.frame = 0;
  },

  updateBird(e, dt, w, c) {
    e.hidden = c.night > 0.55 || c.rain > 0.6;
    if (e.hidden) return;
    if (e.scaredT > 0) { e.scaredT -= dt; e.flyR = Math.min(e.flyR + dt * 8, 70); } else e.flyR = Math.max(e.flyR - dt * 0.6, 12);
    e.flyA += e.flyS * dt * (e.scaredT > 0 ? 2.5 : 1);
    const cx = e.hx + Math.sin(c.t * 0.05 + e.seed) * 25, cz = e.hz + Math.cos(c.t * 0.04 + e.seed) * 25;
    e.x = cx + Math.cos(e.flyA) * e.flyR; e.z = cz + Math.sin(e.flyA) * e.flyR;
    e.y = e.baseY + e.flyH + Math.sin(c.t * 0.7 + e.seed) * 2 + (e.scaredT > 0 ? 8 : 0);
    e.frameT += dt * 7; e.frame = Math.floor(e.frameT) % 2; e.moving = true;
  },

  // Coup de feu ou bruit : les créatures proches s'enfuient
  scare(x, z, r) {
    for (const e of this.list) {
      if (e.far || e.hidden) continue;
      if (Math.hypot(e.x - x, e.z - z) > r) continue;
      if (e.cfg.fly) e.scaredT = 5;
      else { e.scared = true; e.scareX = x; e.scareZ = z; }
    }
  },

  // Le joueur ne traverse pas les gros animaux ni les villageois
  pushPlayer(p) {
    for (const e of this.list) {
      if (!e.cfg.solid || e.hidden || e.far || Math.abs(p.pos[1] - e.y) > 1.5) continue;
      const dx = p.pos[0] - e.x, dz = p.pos[2] - e.z, d = Math.hypot(dx, dz), min = e.cfg.radius + P_RADIUS;
      if (d < min && d > 1e-4) { p.pos[0] = e.x + dx / d * min; p.pos[2] = e.z + dz / d * min; }
    }
  },

  raycast(o, d, maxDist) {
    let best = null;
    const dh = Math.hypot(d[0], d[2]) || 1e-6;
    for (const e of this.list) {
      if (e.hidden || e.far) continue;
      const r = Math.max(0.25, e.w * 0.35), cx = e.x - o[0], cz = e.z - o[2];
      const tc = (cx * d[0] + cz * d[2]) / (dh * dh);
      if (tc < 0 || tc > maxDist) continue;
      const px = d[0] * tc - cx, pz = d[2] * tc - cz;
      if (px * px + pz * pz > r * r) continue;
      const y = o[1] + d[1] * tc;
      if (y < e.y || y > e.y + e.h) continue;
      if (!best || tc < best.t) best = { t: tc, e, p: [o[0] + d[0] * tc, y, o[2] + d[2] * tc] };
    }
    return best;
  },

  calls(dt, c) {
    this.callT -= dt;
    if (this.callT > 0) return;
    this.callT = 1.2 + Math.random() * 3.5;
    if (c.rain > 0.7) return;
    const near = this.list.filter((e) => e.cfg.call && !e.hidden && !e.far && Math.hypot(e.x - c.px, e.z - c.pz) < 26);
    if (!near.length) return;
    const e = near[(Math.random() * near.length) | 0];
    const dx = e.x - c.px, dz = e.z - c.pz, d = Math.hypot(dx, dz) || 1;
    sound.animal(e.cfg.call, (dx * c.right[0] + dz * c.right[2]) / d, 1 - d / 28);
  },

  // Instances de sprites : vue de face / de dos / de profil selon l'angle caméra (comme dans Doom)
  buildInstances(cam, right, maxD) {
    const D = this.data, max2 = maxD * maxD;
    let k = 0;
    for (const e of this.list) {
      if (e.hidden || e.far || e.dead || k >= 2047) continue;
      const dx = e.x - cam[0], dz = e.z - cam[2];
      if (dx * dx + dz * dz > max2) continue;
      const s = e.spr;
      let f = e.frame, flip = 0;
      if (s.frames >= 6) {
        let rel = ((Math.atan2(-dx, -dz) - e.heading) % TAU + TAU) % TAU;
        if (rel > Math.PI) rel -= TAU;
        const ar = Math.abs(rel);
        const view = ar < Math.PI / 4 ? 1 : ar > Math.PI * 0.75 ? 2 : 0;
        f = view * 2 + (e.moving ? e.frame : 0);
        if (view === 0) flip = Math.sin(e.heading) * right[0] + Math.cos(e.heading) * right[2] < 0 ? 1 : 0;
      }
      const fw = s.u1 - s.u0, o = k * 13;
      D[o] = e.x; D[o + 1] = e.y + e.yOff; D[o + 2] = e.z; D[o + 3] = e.w * e.scaleK; D[o + 4] = e.h * e.scaleK;
      D[o + 5] = s.u0 + fw * f; D[o + 6] = s.v0; D[o + 7] = s.u1 + fw * f; D[o + 8] = s.v1;
      D[o + 9] = 0; D[o + 10] = 1; D[o + 11] = 0; D[o + 12] = flip;
      k++;
    }
    this.n = k;
    return this;
  },
};
