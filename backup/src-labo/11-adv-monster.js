// ============================================================================
//  AVENTURE : le Rôdeur (monstre nocturne) et les glitchs qui s'intensifient
// ============================================================================

// Sons d'horreur (courts, jamais en continu)
Object.assign(SoundEngine.prototype, {
  glitchSnd(k) {
    if (!this.ok) return;
    const t = this.ctx.currentTime;
    for (let i = 0; i < 3 + k * 3; i++) this.tone(t + i * 0.045, 'square', 200 + Math.random() * 1800, 100 + Math.random() * 600, 0.035, 0.025 * Math.min(1.5, k), this.sfx, 0.002);
  },
  creepy() {
    if (!this.ok) return;
    const t = this.ctx.currentTime + 0.05, p = this.pan(Math.random() * 2 - 1, this.amb);
    this.voice(t, 'sawtooth', 180, 90, 2.6, 0.03, p, { vib: 5, vibDepth: 18, lp: 500, lp2: 200 });
  },
  steps(pan, k) {
    if (!this.ok) return;
    const t = this.ctx.currentTime, p = this.pan(pan, this.amb);
    for (let i = 0; i < 3; i++) { this.noiseHit(t + i * 0.55, 0.12, 'lowpass', 380, 0.7, 0.18 * k, p); this.tone(t + i * 0.55, 'sine', 70, 40, 0.14, 0.2 * k, p); }
  },
  scream() {
    if (!this.ok) return;
    const t = this.ctx.currentTime;
    this.voice(t, 'sawtooth', 620, 220, 0.9, 0.16, this.sfx, { vib: 31, vibDepth: 90, bp: 1400, q: 0.8 });
    this.noiseHit(t, 0.5, 'bandpass', 2400, 0.7, 0.2, null, 700);
  },
  heartbeat(k) {
    if (!this.ok) return;
    const t = this.ctx.currentTime;
    this.tone(t, 'sine', 62, 40, 0.14, 0.3 * k); this.tone(t + 0.22, 'sine', 55, 38, 0.16, 0.24 * k);
  },
});

const monster = {
  state: 'none', x: 0, y: 0, z: 0, heading: 0, timer: 30, frame: 0, frameT: 0, hp: 12, stun: 0, attackT: 0,
  lookT: 0, repelT: 0, summoned: false, stepT: 0, beatT: 0, soundT: 20, visible: false,

  phase() { const d = adv.s.day; return this.summoned ? 3 : d < 3 ? 0 : d === 3 ? 1 : d < 6 ? 2 : 3; },
  reset() { this.state = 'none'; this.visible = false; this.timer = 25 + Math.random() * 30; this.summoned = false; },
  vanish(t) {
    if (this.visible) { glitch.burst(0.9); for (let k = 0; k < 25; k++) particles.spawn(this.x, this.y + Math.random() * 2.6, this.z, (Math.random() - 0.5) * 3, Math.random() * 2, (Math.random() - 0.5) * 3, [0.05, 0.05, 0.07, 1], 0.12, 1.2, -0.3, false); }
    this.visible = false; this.state = 'none'; this.timer = t;
  },
  spawnAround(px, pz, dMin, dMax, dirA, spread) {
    const w = game.world;
    for (let k = 0; k < 30; k++) {
      const a = dirA + (Math.random() - 0.5) * spread, d = lerp(dMin, dMax, Math.random());
      const x = px + Math.sin(a) * d, z = pz - Math.cos(a) * d;
      if (!w.inside(x, z, 10) || w.heightAt(x, z) < w.waterLevel + 0.2 || w.covered(x, w.heightAt(x, z) + 1, z)) continue;
      this.x = x; this.z = z; this.y = w.heightAt(x, z); this.visible = true; this.hp = 12; this.stun = 0;
      return true;
    }
    return false;
  },
  summon(drunk, x, z) {
    const s = game.world.time, night = s > 0.8 || s < 0.22;
    if (!night) { this.summoned = true; ui.toast(drunk ? 'Quelque chose vous a entendu… Il viendra ce soir.' : 'La fiole se brise. Rien… pour l’instant.'); return; }
    this.summoned = true;
    const p = game.player;
    if (this.spawnAround(x ?? p.pos[0], z ?? p.pos[2], 30, 45, Math.random() * TAU, TAU)) { this.state = 'hunt'; glitch.burst(1.5); sound.creepy(); }
  },

  update(dt, c) {
    const w = game.world, p = game.player, ph = this.phase();
    this.stun = Math.max(0, this.stun - dt);
    this.repelT = Math.max(0, this.repelT - dt);
    this.attackT = Math.max(0, this.attackT - dt);
    const night = c.night > 0.6;
    if (!night) { if (this.visible) this.vanish(30); this.summoned = false; return; }
    if (ph === 0) return;
    // phase 1 : on ne fait que l'entendre
    this.soundT -= dt;
    if (this.soundT <= 0) {
      this.soundT = 25 + Math.random() * 35;
      if (!this.visible) { if (Math.random() < 0.5) sound.creepy(); else sound.steps(Math.random() * 2 - 1, 0.6); }
    }
    if (ph === 1) return;
    const dx = this.x - p.pos[0], dz = this.z - p.pos[2], dist = Math.hypot(dx, dz);
    // est-il regardé ?
    const toM = v3.norm([dx, this.y + 2 - c.eye[1], dz]);
    const look = v3.dot(toM, c.fwd);
    const watched = this.visible && look > 0.94 && dist < 160;
    const lit = watched && c.flashlight && dist < 32 * (adv.s.upgrades.lampe ? 2 : 1);
    if (!this.visible) {
      this.timer -= dt;
      if (this.timer > 0) return;
      const fwdA = Math.atan2(c.fwd[0], -c.fwd[2]);
      if (ph === 2) { if (this.spawnAround(p.pos[0], p.pos[2], 70, 110, fwdA, 2.4)) { this.state = 'watch'; this.lookT = 0; } else this.timer = 10; }
      else if (this.spawnAround(p.pos[0], p.pos[2], 90, 140, fwdA + Math.PI, 2.4)) { this.state = 'hunt'; sound.steps(0, 0.4); }
      else this.timer = 10;
      return;
    }
    this.heading = Math.atan2(-dx, -dz);
    // rencontre : battements de cœur, glitchs
    this.beatT -= dt;
    if (this.beatT <= 0 && dist < 60) { this.beatT = lerp(0.45, 1.3, dist / 60); sound.heartbeat(1 - dist / 70); }
    const safeLab = adv.power && Math.hypot(p.pos[0] - w.adv.lab.x, p.pos[2] - w.adv.lab.z) < 40;
    const inside = w.covered(p.pos[0], p.pos[1] + 1, p.pos[2]);
    const keepAway = c.repulsif || this.repelT > 0 ? 60 : safeLab ? 38 : inside ? 12 : 0;
    if (this.state === 'watch') {
      if (watched) this.lookT += dt;
      if (dist < 38 || this.lookT > 2.5 || lit) this.vanish(60 + Math.random() * 60);
      return;
    }
    // chasse
    if (this.stun > 0) { this.frame = 0; return; }
    let speed = 0;
    if (c.invisible) speed = 0.6; // il ne vous trouve pas : il erre
    else if (lit) { speed = -3.5; if ((this.lookT += dt) > 1.5) { this.vanish(40 + Math.random() * 40); return; } }
    else if (keepAway && dist < keepAway) speed = -2;
    else if (watched) speed = dist < 20 ? 0.9 : 0.35;
    else speed = dist < 26 ? 5.2 : 2.4;
    if (!lit) this.lookT = Math.max(0, this.lookT - dt);
    if (c.invisible) this.heading += (Math.random() - 0.5) * dt * 2;
    const nx = this.x + Math.sin(this.heading) * speed * dt, nz = this.z + Math.cos(this.heading) * speed * dt;
    if (!w.covered(nx, w.heightAt(nx, nz) + 1.5, nz) && !advPlay.repelled(nx, nz)) { this.x = nx; this.z = nz; }
    this.y = w.heightAt(this.x, this.z);
    if (Math.abs(speed) > 0.1) {
      this.frameT += dt * Math.abs(speed) * 0.9; this.frame = Math.floor(this.frameT) % 2;
      this.stepT -= dt * Math.abs(speed);
      if (this.stepT <= 0 && dist < 50) { this.stepT = 2.2; const r = game.renderer.lastBasis; sound.steps(r ? clamp((dx * r.r[0] + dz * r.r[2]) / (dist || 1), -1, 1) : 0, 0.3 * (1 - dist / 55)); }
    }
    if (dist < 1.9 && !c.invisible && !inside && this.attackT <= 0) { // attaque
      this.attackT = 1.2;
      sound.scream();
      glitch.burst(2.5);
      adv.hurt(35);
      p.vel[0] -= dx / (dist || 1) * 8; p.vel[2] -= dz / (dist || 1) * 8; p.vel[1] = 4;
      setTimeout(() => this.vanish(40 + Math.random() * 30), 450);
    }
    if (dist > 220) this.vanish(20);
  },
  hit(dmg) {
    if (!this.visible) return;
    this.hp -= dmg; this.stun = 0.8;
    glitch.burst(0.7);
    if (this.hp <= 0) { sound.scream(); this.vanish(90 + Math.random() * 60); ui.toast('Le Rôdeur s’est dissipé… pour cette fois.'); }
    else if (Math.random() < 0.5) this.vanish(45 + Math.random() * 45);
  },
  burn(x, z, r) { if (this.visible && Math.hypot(this.x - x, this.z - z) < r) this.hit(6); },
  freeze(x, z, r, t) { if (this.visible && Math.hypot(this.x - x, this.z - z) < r) this.stun = t; },
  repel(x, z, r) { if (this.visible && Math.hypot(this.x - x, this.z - z) < r) this.vanish(60); this.repelT = 30; },
  near(x, y, z, r) { return this.visible && Math.hypot(this.x - x, this.z - z) < r && y > this.y && y < this.y + 2.8; },
  raycast(o, d, maxDist) {
    if (!this.visible) return null;
    const dh = Math.hypot(d[0], d[2]) || 1e-6, cx = this.x - o[0], cz = this.z - o[2];
    const tc = (cx * d[0] + cz * d[2]) / (dh * dh);
    if (tc < 0 || tc > maxDist) return null;
    const px = d[0] * tc - cx, pz = d[2] * tc - cz;
    if (px * px + pz * pz > 0.45 * 0.45) return null;
    const y = o[1] + d[1] * tc;
    if (y < this.y || y > this.y + 2.8) return null;
    return { t: tc, p: [o[0] + d[0] * tc, y, o[2] + d[2] * tc] };
  },
  appendInstance(D, k, cam, right) {
    if (!this.visible || k >= 2047) return k;
    const s = ATLAS.sprites.monster, dx = this.x - cam[0], dz = this.z - cam[2];
    let rel = ((Math.atan2(-dx, -dz) - this.heading) % TAU + TAU) % TAU;
    if (rel > Math.PI) rel -= TAU;
    const ar = Math.abs(rel), view = ar < Math.PI / 4 ? 1 : ar > Math.PI * 0.75 ? 2 : 0;
    const f = this.attackT > 0.6 ? 6 : view * 2 + this.frame;
    const flip = view === 0 && Math.sin(this.heading) * right[0] + Math.cos(this.heading) * right[2] < 0 ? 1 : 0;
    const fw = s.u1 - s.u0, o = k * 13, jit = glitch.level > 0.5 && Math.random() < 0.08 ? (Math.random() - 0.5) * 0.6 : 0;
    D[o] = this.x + jit; D[o + 1] = this.y; D[o + 2] = this.z; D[o + 3] = 2.8 * s.aspect; D[o + 4] = 2.8;
    D[o + 5] = s.u0 + fw * f; D[o + 6] = s.v0; D[o + 7] = s.u1 + fw * f; D[o + 8] = s.v1;
    D[o + 9] = 0; D[o + 10] = 1; D[o + 11] = 0; D[o + 12] = flip;
    return k + 1;
  },
};

const glitch = {
  level: 0, burstT: 0, burstK: 0, seed: 0, eventT: 20, invertT: 0, clockT: 0, freezeT: 0, silenceT: 0,
  burst(k) { this.burstT = Math.max(this.burstT, 0.3 + k * 0.25); this.burstK = Math.max(this.burstK, k); this.seed = Math.random() * 100; sound.glitchSnd(k); },
  update(dt, c) {
    const s = adv.s, w = game.world, p = game.player;
    const broken = Object.values(s.relays).filter(Boolean).length;
    let L = clamp((s.day - 1) * 0.09, 0, 0.75) + broken * 0.04;
    for (const m of w.adv.monoliths) { const d = Math.hypot(m.x - p.pos[0], m.z - p.pos[2]); if (d < 70) L += (1 - d / 70) * 0.6; }
    if (monster.visible) { const d = Math.hypot(monster.x - p.pos[0], monster.z - p.pos[2]); if (d < 60) L += (1 - d / 60) * 0.7; }
    L += advPlay.glitchZone(p.pos[0], p.pos[2]) * 0.8 + (advPlay.has('chaos') ? 0.5 : 0);
    this.level = L;
    this.burstT = Math.max(0, this.burstT - dt);
    if (this.burstT <= 0) this.burstK = 0;
    this.invertT = Math.max(0, this.invertT - dt);
    this.clockT = Math.max(0, this.clockT - dt);
    this.eventT -= dt;
    if (this.eventT <= 0) {
      this.eventT = lerp(45, 5, clamp(L, 0, 1)) * (0.5 + Math.random());
      if (L > 0.1) this.randomEvent(L, c);
    }
    if (Math.random() < dt * 3) this.seed = Math.random() * 100;
  },
  randomEvent(L, c) {
    const r = Math.random(), p = game.player, w = game.world;
    if (r < 0.35) this.burst(0.3 + L * 0.6);
    else if (r < 0.5 && L > 0.3) { this.invertT = 0.12; sound.glitchSnd(0.4); }
    else if (r < 0.62 && L > 0.2) this.clockT = 2.5;
    else if (r < 0.74 && L > 0.35) { const a = Math.random() * TAU, d = 8 + Math.random() * 20; advPlay.addTemp('missing', p.pos[0] + Math.cos(a) * d, p.pos[2] + Math.sin(a) * d, 6 + Math.random() * 8); }
    else if (r < 0.84 && L > 0.25) { entities.near(p.pos[0], p.pos[2], 60, (e) => { e.stun = Math.max(e.stun, 3 + Math.random() * 4); }); this.burst(0.3); }
    else if (r < 0.93 && L > 0.3 && c.night > 0.5) sound.steps(Math.random() < 0.5 ? -0.8 : 0.8, 0.5);
    else if (L > 0.45) { this.burst(1.2); ui.toast(['IL TE VOIT', 'rentre à la maison', 'ERR:R 0x0000DAY', 'tu es là ?'][(Math.random() * 4) | 0], 'err'); }
  },
  uniforms() {
    const b = this.burstT > 0 ? this.burstK : 0, L = this.level;
    const ambient = L > 0.25 ? (L - 0.25) * 0.25 : 0;
    return {
      glitch: [Math.min(1, b * 0.8 + ambient * (Math.random() < 0.1 ? 3 : 0.3)), Math.min(1, b * 0.6 + (advPlay.has('chaos') ? 0.4 : 0)), Math.min(1, b * 0.7 + (L > 0.6 && Math.random() < 0.03 ? 0.8 : 0)), this.invertT > 0 ? 1 : 0],
      seed: this.seed,
    };
  },
};
