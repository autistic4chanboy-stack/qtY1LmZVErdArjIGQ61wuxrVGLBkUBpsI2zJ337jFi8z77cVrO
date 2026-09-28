// ============================================================================
//  ENTRÉES, JOUEUR (déplacement, collisions, nage, vol), ARME, PARTICULES
// ============================================================================

const input = {
  keys: new Set(),
  dx: 0, dy: 0, wheel: 0,
  buttons: 0,
  clicked: 0,   // boutons pressés depuis la dernière image (masque)
  locked: false,
  mx: 0, my: 0, // position souris (px écran)
  down(code) { return this.keys.has(code); },
  consume() { this.dx = 0; this.dy = 0; this.wheel = 0; this.clicked = 0; },
};

const P_RADIUS = 0.33, EYE = 1.62, EYE_CROUCH = 0.95, BODY = 1.8, BODY_CROUCH = 1.1;

class Player {
  constructor() {
    this.pos = [0, 0, 0]; this.vel = [0, 0, 0];
    this.yaw = 0; this.pitch = 0;
    this.onGround = false; this.crouch = 0; this.fly = false;
    this.eyeOffset = 0; this.bobPhase = 0; this.bobAmp = 0; this.stepDist = 0;
    this.swimming = false; this.wading = false; this.onBlock = null;
    this.kickPitch = 0; this.jumpHeld = false; this.fallSpeed = 0;
    this.mods = { speed: 1, jump: 1, grav: 1, scale: 1 }; // effets de potions
  }
  spawnAt(w) {
    this.pos = [w.spawn.x, w.groundAt(w.spawn.x, w.spawn.z, w.spawn.y + 0.5, 0.6), w.spawn.z];
    this.vel = [0, 0, 0]; this.yaw = w.spawn.yaw; this.pitch = 0;
  }
  eyePos() {
    const eh = lerp(EYE, EYE_CROUCH, this.crouch) * this.mods.scale;
    const by = Math.sin(this.bobPhase * 2) * 0.045 * this.bobAmp;
    return [this.pos[0], this.pos[1] + eh + this.eyeOffset + by, this.pos[2]];
  }
  bodyH() { return lerp(BODY, BODY_CROUCH, this.crouch) * this.mods.scale; }

  update(dt, w, c) {
    const fx = -Math.sin(this.yaw), fz = -Math.cos(this.yaw), rx = Math.cos(this.yaw), rz = -Math.sin(this.yaw);
    this.eyeOffset *= Math.exp(-dt * 14);
    this.kickPitch *= Math.exp(-dt * 9);
    if (this.fly) return this.updateFly(dt, w, c, fx, fz, rx, rz);

    this.crouch = clamp(this.crouch + (c.down ? 1 : -1) * dt * 6, 0, 1);
    if (!c.down && this.crouch > 0) { // se relever seulement s'il y a la place
      const needed = BODY;
      let blocked = false;
      w.query(this.pos[0], this.pos[2], 1, null, (b) => {
        const [lx, lz] = World.blockLocal(b, this.pos[0], this.pos[2]);
        if (Math.abs(lx) < b.sx / 2 + P_RADIUS && Math.abs(lz) < b.sz / 2 + P_RADIUS && b.y > this.pos[1] + 0.3 && b.y < this.pos[1] + needed) blocked = true;
      });
      if (blocked) this.crouch = Math.min(1, this.crouch + dt * 6);
    }

    const wl = w.waterLevel;
    this.swimming = this.pos[1] < wl - 1.15;
    this.wading = !this.swimming && this.pos[1] < wl - 0.2;
    let speed = c.sprint && !this.crouch ? 8.2 : 4.6;
    if (this.crouch > 0.5) speed = 2.2;
    if (this.swimming) speed = 3.2; else if (this.wading) speed *= 0.72;
    speed *= this.mods.speed * (0.6 + 0.4 * Math.min(this.mods.scale, 1.6));

    let wx = fx * c.fwd + rx * c.right, wz = fz * c.fwd + rz * c.right;
    const wl2 = Math.hypot(wx, wz);
    if (wl2 > 1) { wx /= wl2; wz /= wl2; }
    const k = this.onGround || this.swimming ? 12 : 2.2;
    const a = Math.min(1, dt * k);
    this.vel[0] += (wx * speed - this.vel[0]) * a;
    this.vel[2] += (wz * speed - this.vel[2]) * a;

    if (this.swimming) {
      let target = wl - 1.35 + Math.sin(performance.now() / 600) * 0.04;
      if (c.up) target = wl - 1.0;
      if (c.down) target = this.pos[1] - 2;
      this.vel[1] += ((target - this.pos[1]) * 5 - this.vel[1] * 2.5) * dt;
    } else {
      this.vel[1] -= 20 * this.mods.grav * dt;
      if (this.mods.grav < 0) this.vel[1] = Math.min(this.vel[1], 2.5);
      if (c.up && this.onGround && !this.jumpHeld) {
        this.vel[1] = 6.6 * this.mods.jump; this.onGround = false; this.jumpHeld = true;
      }
    }
    if (!c.up) this.jumpHeld = false;

    // déplacement horizontal + collisions
    const stepUp = this.onGround || this.swimming ? 0.55 : 0.3;
    let nx = this.pos[0] + this.vel[0] * dt, nz = this.pos[2] + this.vel[2] * dt;
    [nx, nz] = this.collide(w, nx, nz, stepUp);
    const m = 1.0;
    nx = clamp(nx, m, w.size - m); nz = clamp(nz, m, w.size - m);
    const moved = Math.hypot(nx - this.pos[0], nz - this.pos[2]);
    this.pos[0] = nx; this.pos[2] = nz;

    // vertical
    const feet = this.pos[1];
    let ny = feet + this.vel[1] * dt;
    const ground = w.groundAt(nx, nz, feet, stepUp);
    const wasGround = this.onGround;
    if (this.vel[1] > 0) { // plafond
      const top = ny + this.bodyH();
      w.query(nx, nz, 1, null, (b) => {
        if (b.y < feet + this.bodyH() - 0.05 || b.y > top) return;
        const [lx, lz] = World.blockLocal(b, nx, nz);
        if (Math.abs(lx) < b.sx / 2 + P_RADIUS * 0.7 && Math.abs(lz) < b.sz / 2 + P_RADIUS * 0.7) { ny = b.y - this.bodyH(); this.vel[1] = 0; }
      });
    }
    if (ny <= ground) {
      if (!wasGround && this.vel[1] < -7) sound.land(clamp(-this.vel[1] / 14, 0.3, 1));
      if (ground - feet > 0.05 && ground - feet <= stepUp && wasGround) this.eyeOffset -= ground - feet;
      ny = ground; this.vel[1] = 0; this.onGround = true;
    } else if (wasGround && this.vel[1] <= 0 && ny - ground < 0.45 && !this.swimming) {
      ny = ground; this.vel[1] = 0; this.onGround = true; // colle aux pentes
    } else this.onGround = false;
    if (feet >= wl - 0.3 && ny < wl - 0.3 && this.vel[1] < -4) { sound.splash(); splashAt(nx, wl, nz); }
    this.pos[1] = ny;

    // balancement + pas
    const hs = Math.hypot(this.vel[0], this.vel[2]);
    const moving = (this.onGround || this.swimming) && hs > 0.5;
    this.bobAmp = lerp(this.bobAmp, moving ? Math.min(hs / 7, 1.2) : 0, Math.min(1, dt * 8));
    if (moving) {
      this.bobPhase += moved * 1.45;
      this.stepDist += moved;
      if (this.stepDist > (c.sprint ? 2.6 : 2.0)) {
        this.stepDist = 0;
        sound.step(this.surfaceKind(w), hs);
      }
    }
  }

  updateFly(dt, w, c, fx, fz, rx, rz) {
    const cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
    const speed = c.sprint ? 42 : 14;
    const tx = (fx * cp * c.fwd + rx * c.right) * speed;
    const tz = (fz * cp * c.fwd + rz * c.right) * speed;
    const ty = (sp * c.fwd + (c.up ? 1 : 0) - (c.down ? 1 : 0)) * speed;
    const a = Math.min(1, dt * 8);
    this.vel[0] += (tx - this.vel[0]) * a; this.vel[1] += (ty - this.vel[1]) * a; this.vel[2] += (tz - this.vel[2]) * a;
    this.pos[0] = clamp(this.pos[0] + this.vel[0] * dt, 0.5, w.size - 0.5);
    this.pos[2] = clamp(this.pos[2] + this.vel[2] * dt, 0.5, w.size - 0.5);
    const g = w.heightAt(this.pos[0], this.pos[2]);
    this.pos[1] = clamp(this.pos[1] + this.vel[1] * dt, g + 0.2 - EYE, g + 400);
    this.bobAmp = 0; this.crouch = 0; this.onGround = false; this.swimming = false;
  }

  collide(w, x, z, stepUp) {
    return w.collideCircle(x, z, this.pos[1], this.pos[1] + this.bodyH(), P_RADIUS, stepUp);
  }

  surfaceKind(w) {
    if (this.wading || this.swimming) return 'water';
    const x = this.pos[0], z = this.pos[2];
    let blockMat = -1;
    w.query(x, z, 1, null, (b) => {
      const [lx, lz] = World.blockLocal(b, x, z);
      if (Math.abs(b.y + b.sy - this.pos[1]) < 0.08 && Math.abs(lx) <= b.sx / 2 + 0.2 && Math.abs(lz) <= b.sz / 2 + 0.2) blockMat = b.m;
    });
    const m = blockMat >= 0 ? blockMat : w.matAt(x, z);
    if (m === M_PLANKS || m === M_LOGS || m === M_CRATE) return 'wood';
    if (m === M_DIRT || m === M_SAND) return 'soft';
    if (m === M_ROCK || m === M_COBBLE || m >= M_STONE) return 'hard';
    return 'grass';
  }
}

// ---------------------------------------------------------------------------
//  Particules (impacts, étincelles, fumée, éclaboussures)
// ---------------------------------------------------------------------------
const particles = {
  list: [],
  data: new Float32Array(1024 * 8),
  n: 0,
  spawn(x, y, z, vx, vy, vz, col, size, life, grav, emissive) {
    if (this.list.length >= 1000) this.list.shift();
    this.list.push({ x, y, z, vx, vy, vz, col, size, life, max: life, grav, emissive });
  },
  update(dt, light) {
    let k = 0;
    const L = this.list;
    for (let i = L.length - 1; i >= 0; i--) {
      const p = L[i];
      p.life -= dt;
      if (p.life <= 0) { L.splice(i, 1); continue; }
      p.vy -= p.grav * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      const t = p.life / p.max;
      const lc = p.emissive ? [1.2, 1.2, 1.2] : light;
      const d = this.data, o = k * 8;
      d[o] = p.x; d[o + 1] = p.y; d[o + 2] = p.z;
      d[o + 3] = p.col[0] * lc[0]; d[o + 4] = p.col[1] * lc[1]; d[o + 5] = p.col[2] * lc[2];
      d[o + 6] = p.col[3] * (p.emissive ? Math.min(1, t * 2) : Math.min(1, t * 3));
      d[o + 7] = p.size * (p.grow ? 1 + (1 - t) * p.grow : 1);
      k++;
    }
    this.n = k;
  },
};

function puffAt(x, y, z, col, n, spread, hard) {
  for (let i = 0; i < n; i++) {
    const c = [col[0] / 255 * (0.8 + Math.random() * 0.4), col[1] / 255 * (0.8 + Math.random() * 0.4), col[2] / 255 * (0.8 + Math.random() * 0.4), 1];
    particles.spawn(x, y, z, (Math.random() - 0.5) * spread, Math.random() * spread * 1.2, (Math.random() - 0.5) * spread, c, 0.07 + Math.random() * 0.06, 0.4 + Math.random() * 0.5, 9, false);
  }
  if (hard) for (let i = 0; i < 4; i++) particles.spawn(x, y, z, (Math.random() - 0.5) * 6, Math.random() * 5, (Math.random() - 0.5) * 6, [1, 0.8, 0.4, 1], 0.04, 0.2 + Math.random() * 0.2, 12, true);
}
function splashAt(x, y, z) {
  for (let i = 0; i < 24; i++) {
    const a = Math.random() * TAU, s = 1 + Math.random() * 2.5;
    particles.spawn(x, y + 0.05, z, Math.cos(a) * s, 2 + Math.random() * 3, Math.sin(a) * s, [0.75, 0.85, 0.95, 0.9], 0.08, 0.6 + Math.random() * 0.4, 12, false);
  }
}

// ---------------------------------------------------------------------------
//  Arme (pistolet, tir instantané)
// ---------------------------------------------------------------------------
class Weapon {
  constructor() { this.mag = 12; this.ammo = 12; this.cool = 0; this.flashT = 0; this.reloadT = 0; this.kick = 0; this.lower = 0; }
  update(dt) {
    this.cool = Math.max(0, this.cool - dt);
    this.flashT = Math.max(0, this.flashT - dt);
    this.kick *= Math.exp(-dt * 12);
    if (this.reloadT > 0) {
      const before = this.reloadT;
      this.reloadT = Math.max(0, this.reloadT - dt);
      if (before > 0.55 && this.reloadT <= 0.55) {
        if (adv.on) { const got = Math.min(this.mag - this.ammo, adv.count('munitions')); adv.take('munitions', got); this.ammo += got; }
        else this.ammo = this.mag;
      }
    }
    const r = this.reloadT > 0 ? Math.sin((1 - this.reloadT / 1.1) * Math.PI) : 0;
    this.lower = r;
  }
  reload() {
    if (this.reloadT > 0 || this.ammo === this.mag) return;
    if (adv.on && adv.count('munitions') <= 0) { ui.toast('Plus de munitions (boutique du terminal).', 'err'); return; }
    this.reloadT = 1.1; sound.reload();
  }
  tryFire() {
    if (this.cool > 0 || this.reloadT > 0) return false;
    if (this.ammo <= 0) { sound.dryFire(); this.cool = 0.3; this.reload(); return false; }
    this.ammo--; this.cool = 0.26; this.flashT = 0.07; this.kick = 1;
    sound.shot();
    return true;
  }
}

function fireHitscan(w, eye, yaw, pitch) {
  const s = 0.006;
  const b = cameraBasis(yaw + (Math.random() - 0.5) * s, pitch + (Math.random() - 0.5) * s);
  const d = b.f;
  let best = null;
  const th = w.raycastTerrain(eye, d, 250);
  if (th) best = { t: th.t, kind: 'terrain', p: [th.x, th.y, th.z] };
  const bh = w.raycastBlocks(eye, d, best ? best.t : 250);
  if (bh && (!best || bh.t < best.t)) best = { t: bh.t, kind: 'block', block: bh.block, p: [eye[0] + d[0] * bh.t, eye[1] + d[1] * bh.t, eye[2] + d[2] * bh.t], n: bh.n };
  const oh = w.raycastObjects(eye, d, best ? best.t : 250, false);
  if (oh && (!best || oh.t < best.t)) best = { t: oh.t, kind: 'object', obj: oh.obj, p: [oh.x, oh.y, oh.z] };
  const eh = entities.raycast(eye, d, best ? best.t : 250);
  if (eh && (!best || eh.t < best.t)) best = { t: eh.t, kind: 'creature', e: eh.e, p: eh.p };
  const mh = adv.on ? monster.raycast(eye, d, best ? best.t : 250) : null;
  if (mh && (!best || mh.t < best.t)) best = { t: mh.t, kind: 'monster', p: mh.p };
  entities.scare(eye[0], eye[2], 45);
  if (!best) return;
  if (best.kind === 'monster') { puffAt(best.p[0], best.p[1], best.p[2], [20, 20, 26], 12, 2, false); monster.hit(3); return; }
  if (best.kind === 'creature') { // en création elles s'enfuient ; en aventure c'est la chasse
    puffAt(best.p[0], best.p[1], best.p[2], adv.on ? [150, 30, 30] : [200, 200, 200], 6, 1.5, false);
    if (adv.on) advPlay.hurtCreature(best.e, 3, eye); else entities.scare(best.p[0], best.p[2], 12);
    return;
  }
  const [x, y, z] = best.p;
  if (y < w.waterLevel && eye[1] > w.waterLevel) {
    const tw = (w.waterLevel - eye[1]) / d[1];
    splashAt(eye[0] + d[0] * tw, w.waterLevel, eye[2] + d[2] * tw);
    return;
  }
  if (best.kind === 'terrain') { puffAt(x, y + 0.05, z, MATERIALS[w.matAt(x, z)].avg, 10, 2.2, false); sound.impact('soft'); }
  else if (best.kind === 'block') {
    puffAt(x + best.n[0] * 0.05, y + best.n[1] * 0.05, z + best.n[2] * 0.05, MATERIALS[best.block.m].avg, 8, 2.5, true); sound.impact('hard');
  } else {
    const t = OBJ_TYPES[best.obj.t];
    const col = t.id === 'rock' || t.id === 'stones' ? [120, 120, 125] : t.cat === 'Arbres' ? (y - w.objectY(best.obj) > 2.5 ? [70, 120, 50] : [90, 64, 40]) : [80, 140, 60];
    puffAt(x, y, z, col, 10, 2.4, t.id === 'rock' || t.id === 'lamp'); sound.impact(t.id === 'rock' ? 'hard' : 'soft');
  }
}
