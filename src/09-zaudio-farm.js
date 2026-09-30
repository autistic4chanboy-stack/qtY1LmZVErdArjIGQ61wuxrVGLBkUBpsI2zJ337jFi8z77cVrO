// ============================================================================
//  AUDIO (FERME) : cloche, portes, voix des habitants, bêtes, pêche, arc,
//  horreur discrète. Mêmes noms et mêmes paramètres qu'avant ; sons adoucis,
//  variés d'une fois à l'autre, placés dans le monde quand on sait d'où ils
//  viennent (portée sound.ici, ou position passée à la place du « pan »).
//  (Les ambiances par milieu sont dans 09-zzzaudio-scene.js.)
// ============================================================================

Object.assign(SoundEngine.prototype, {
  // bruit enveloppé à attaque lente (souffles, froissements) : noiseHit(…, att)
  souffle(t, dur, type, f, q, vol, out, f1, att) { this.noiseHit(t, dur, type, f, q, vol, out, f1, att); },
  // la cloche de l'église, au clocher (si on sait où il est)
  clocher() {
    try {
      const w = game.world;
      if (!w || !w.inter) return null;
      if (this._clo && this._clo.w === w) return this._clo.p;
      const it = w.inter.find((i) => i.kind === 'bell'), B = w.bld && w.bld.eglise;
      const p = it ? [it.x, (it.y || (B ? B.y : 0)) + 9, it.z] : B ? [B.x, B.y + 11, B.z] : null;
      this._clo = { w, p };
      return p;
    } catch (e) { return null; }
  },
  forgePos() {
    try { const B = game.world.bld.forge; return B ? [B.x, B.y + 1.2, B.z] : null; } catch (e) { return null; }
  },

  // ---------------------------------------------------------------- cloche de l'église (partiels d'une vraie cloche, battements lents)
  bell(k = 1) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, P = this._scope ? null : this.clocher();
    const out = this.lp(3200, P ? this.emit(P, this.B.amb.inp, { att: 'aucune', dur: 7.5 }) : this.amb);
    const f = 196 * (0.995 + R() * 0.01), v = 0.06 * k;
    for (const [m, a, d] of [[0.5, 0.5, 6.5], [0.5025, 0.28, 6], [1, 1, 4.6], [1.0035, 0.35, 4.2], [1.19, 0.45, 3.2], [1.5, 0.28, 2.4], [2, 0.42, 2.8], [2.52, 0.16, 1.6], [2.99, 0.12, 1.2], [4.02, 0.06, 0.8]]) this.tone(t, 'sine', f * m, f * m * 0.9985, d, v * a, out, 0.003);
    this.noiseHit(t, 0.04, 'bandpass', 1700, 0.9, 0.03 * k, out);
  },
  // ---------------------------------------------------------------- portes, serrures
  door(open) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random;
    if (open) {
      if (R() < 0.8) this.voice(t, 'sawtooth', 190 + R() * 60, 130 + R() * 30, 0.32 + R() * 0.22, 0.035, this.sfx, { bp: 850 + R() * 400, q: 3, vib: 15 + R() * 8, vibDepth: 16, lp: 2400 });
      this.jouer(this.tb('toc'), t + 0.015, 0.1, this.sfx, 1.35 + R() * 0.2);
    } else {
      this.jouer(this.tb('toc'), t + 0.1, 0.045, this.sfx, 0.8 + R() * 0.1);
      this.jouer(this.tb('coup'), t + 0.12, 0.015, this.sfx, 1.6 + R() * 0.2);
    }
  },
  lock(on) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random;
    this.jouer(this.tb('coup'), t, 0.1, this.sfx, (on ? 2.2 : 1.9) + R() * 0.1);
    this.jouer(this.tb('coup'), t + 0.06, 0.085, this.sfx, (on ? 2.6 : 2.3) + R() * 0.1);
    this.tone(t + 0.06, 'triangle', on ? 1500 : 1300, on ? 1350 : 1180, 0.05, 0.01);
  },
  knock(n = 3) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random;
    for (let i = 0, tt = t; i < n; i++, tt += 0.28 + R() * 0.07) this.jouer(this.tb('toc'), tt, 0.15 * (i === n - 1 ? 0.85 : 1) * (0.9 + R() * 0.2), this.sfx, 0.93 + R() * 0.12);
  },
  chain() {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, out = this.lp(3800, this.amb);
    for (let i = 0; i < 14; i++) { const tt = t + i * 0.1 + R() * 0.05, f = 1100 + R() * 900; this.tone(tt, 'triangle', f, f * 0.98, 0.06, 0.024, out, 0.002); this.tone(tt, 'sine', f * 2.7, f * 2.66, 0.035, 0.008, out, 0.002); }
  },
  scratch() { if (!this.ok) return; const t = this.at(), R = Math.random; for (let i = 0; i < 6; i++) this.noiseHit(t + i * 0.09 + R() * 0.02, 0.08, 'bandpass', 1500 + i * 70, 2, 0.08, null, 1300, 0.01); },

  // ---------------------------------------------------------------- voix : un murmure qui ressemble à des mots (formants, intonation), sans mots
  mumble(pitch = 1, len = 30, pan = 0, vol = 1) {
    if (!this.ok) return;
    const c = this.ctx, R = Math.random, n = clamp(Math.round(len / 9), 2, 9), t = this.at();
    const out = this._scope ? this.voix : this.pan(clamp(pan / 8, -0.8, 0.8), this.voix);
    const f0 = 150 * pitch * (0.96 + R() * 0.08), peak = 0.095 * vol;
    const osc = c.createOscillator(); this.setWave(osc, 'sawtooth');
    const mk = (f, q, a) => { const b = c.createBiquadFilter(), g = c.createGain(); b.type = 'bandpass'; b.frequency.value = f; b.Q.value = q; g.gain.value = a; osc.connect(b).connect(g); return [b, g]; };
    const [F1, g1] = mk(600, 5, 1), [F2, g2] = mk(1500, 8, 0.55), [, g3] = mk(2600, 10, 0.12);
    const env = c.createGain(), lpf = c.createBiquadFilter();
    lpf.type = 'lowpass'; lpf.frequency.value = 3400; lpf.Q.value = 0.5;
    g1.connect(lpf); g2.connect(lpf); g3.connect(lpf); lpf.connect(env).connect(out);
    env.gain.value = 0; env.gain.setValueAtTime(0.0001, t);
    osc.frequency.setValueAtTime(f0 * 1.05, t);
    const V = [[750, 1250], [450, 1900], [300, 2250], [500, 900], [350, 800], [600, 1650], [520, 1500]];
    const question = R() < 0.25;
    let tt = t + 0.01;
    for (let i = 0; i < n; i++) {
      const du = 0.1 + R() * 0.07, v = V[(R() * V.length) | 0], acc = i === 0 ? 1 : 0.6 + R() * 0.4;
      F1.frequency.setTargetAtTime(v[0] * (0.94 + R() * 0.12), tt, 0.02);
      F2.frequency.setTargetAtTime(v[1] * (0.94 + R() * 0.12), tt, 0.025);
      const fin = question && i === n - 1 ? 1.25 : 1;
      osc.frequency.linearRampToValueAtTime(f0 * (1.05 - 0.15 * i / n) * (0.95 + R() * 0.1) * fin, tt + du * 0.6);
      env.gain.linearRampToValueAtTime(peak * acc, tt + 0.03);
      env.gain.linearRampToValueAtTime(peak * acc * 0.7, tt + du - 0.025);
      env.gain.linearRampToValueAtTime(peak * 0.1, tt + du);
      if (R() < 0.45) this.noiseHit(Math.max(t, tt - 0.012), 0.035, 'bandpass', R() < 0.5 ? 2800 : 1300, 1.2, peak * 0.05, out);
      tt += du + R() * 0.035;
    }
    env.gain.linearRampToValueAtTime(0.0001, tt + 0.06);
    osc.start(t); osc.stop(tt + 0.1);
    this.mark(out, tt + 0.1);
  },
  hurtHuman(pitch = 1) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, f = 210 * pitch * (0.93 + R() * 0.14);
    this.cri(t, { dur: 0.3 + R() * 0.1, f: [[0, f * 1.15], [0.3, f], [1, f * 0.72]], rug: [30, 0.25], form: [[700, 5, 1], [1150, 7, 0.6], [2600, 9, 0.15]], souffle: [0.12, 1400], vol: 0.27, lp: 3200, a: 0.012 }, this.voix);
  },
  scream(pitch = 1) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, f = 420 * pitch * (0.94 + R() * 0.12), du = 1.0 + R() * 0.3;
    const out = this.lp(3000, this._scope ? this.voix : this.amb);
    this.cri(t, { dur: du, f: [[0, f * 0.9], [0.12, f * 1.25], [0.6, f * 1.1], [1, f * 0.7]], vib: [5.5, 0.025], rug: [42, 0.3], form: [[850, 5, 1], [1250, 6, 0.7], [2700, 8, 0.25]], souffle: [0.1, 1800], vol: 0.2, lp: 3000, a: 0.05 }, out);
  },
  // ---------------------------------------------------------------- joueur (au centre, tout près)
  hurt(dmg) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, fem = typeof farm !== 'undefined' && farm.s && farm.s.fem, f = (fem ? 250 : 150) * (0.94 + R() * 0.12);
    this.tone(t, 'sine', 120, 55, 0.2, 0.16, null, 0.004);
    this.cri(t + 0.01, { dur: 0.22 + R() * 0.06, f: [[0, f * 1.1], [1, f * 0.8]], rug: [30, 0.3], form: [[600, 5, 1], [1100, 7, 0.5]], souffle: [0.2, 1200], vol: 0.24, lp: 2500, a: 0.01 }, this.sfx);
  },
  breath(k) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random;
    this.noiseHit(t, 0.42, 'bandpass', 950 + R() * 150, 0.9, 0.054 * k, null, 1300, 0.16);
    this.noiseHit(t + 0.5, 0.48, 'bandpass', 640 + R() * 80, 0.9, 0.047 * k, null, 420, 0.06);
  },
  eat() {
    if (!this.ok) return;
    const t = this.at(), R = Math.random;
    for (let i = 0; i < 3; i++) { const tt = t + i * 0.17 + R() * 0.03; this.jouer(this.tb('croque'), tt, 0.027, this.sfx, 0.85 + R() * 0.3); this.tone(tt, 'sine', 140, 90, 0.05, 0.008); }
  },
  equip() { if (!this.ok) return; const t = this.at(); this.noiseHit(t, 0.1, 'bandpass', 1300, 0.8, 0.12, null, 900, 0.02); this.tone(t + 0.04, 'triangle', 2100, 2000, 0.04, 0.02); },
  swish(k = 1) { if (!this.ok) return; this.noiseHit(this.at(), 0.2, 'bandpass', 650, 1.1, 0.115 * k, null, 1900, 0.06); },
  pop2() { this.pop(); },
  tick() { if (!this.ok) return; this.tone(this.at(), 'sine', 1500, 1350, 0.025, 0.06, this.ui, 0.002); },
  coin() { if (!this.ok) return; this.jouer(this.tb('pieces'), this.at(), 0.065, this.ui, 0.95 + Math.random() * 0.1); },
  quest(done) {
    if (!this.ok) return;
    const t = this.at(), f = done ? [523.25, 659.25, 783.99] : [440, 554.37];
    f.forEach((x, i) => { const tt = t + i * 0.13; this.tone(tt, 'sine', x, x, 0.9, 0.028, this.sfx, 0.004); this.tone(tt, 'sine', x * 2, x * 2, 0.45, 0.007, this.sfx, 0.004); this.tone(tt, 'triangle', x, x, 0.22, 0.01, this.sfx, 0.006); });
  },
  page() { if (!this.ok) return; this.jouer(this.tb('page'), this.at(), 0.044, this.ui, 0.9 + Math.random() * 0.2); },
  // ---------------------------------------------------------------- travaux
  dig(k = 1) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random;
    this.jouer(this.tb('terre'), t, 0.09 * k, this.sfx, 0.7 + R() * 0.15);
    this.noiseHit(t + 0.02, 0.14, 'bandpass', 1000, 0.9, 0.011 * k, null, 600);
    this.tone(t, 'sine', 90, 55, 0.1, 0.028 * k);
  },
  plant() { if (!this.ok) return; const t = this.at(); this.jouer(this.tb('terre'), t, 0.087, this.sfx, 1.05 + Math.random() * 0.15); this.noiseHit(t, 0.08, 'lowpass', 700, 0.8, 0.019); },
  pour() {
    if (!this.ok) return;
    const t = this.at(), R = Math.random;
    this.noiseHit(t, 0.36, 'bandpass', 1000, 0.8, 0.066, null, 700, 0.03);
    for (let i = 0; i < 7; i++) { const f = 500 + R() * 700; this.tone(t + i * 0.045 + R() * 0.02, 'sine', f, f * 1.6, 0.04, 0.023); }
  },
  scythe() { if (!this.ok) return; const t = this.at(); this.noiseHit(t, 0.28, 'bandpass', 1300, 0.9, 0.035, null, 2600, 0.05); this.jouer(this.tb('herbe'), t + 0.12, 0.03, this.sfx, 1.2); },
  place() { if (!this.ok) return; const t = this.at(); this.jouer(this.tb('coup'), t, 0.16, this.sfx, 0.75 + Math.random() * 0.1); this.tone(t, 'sine', 150, 90, 0.07, 0.13); },
  // couvercle qui grince puis objets qui s'entrechoquent
  lootOpen() {
    if (!this.ok) return;
    const t = this.at(), R = Math.random;
    this.voice(t, 'sawtooth', 240, 180, 0.22, 0.008, this.sfx, { bp: 900, q: 3, vib: 14, vibDepth: 10 });
    this.jouer(this.tb('coup'), t + 0.18, 0.05, this.sfx, 0.9 + R() * 0.2);
    this.tone(t + 0.26, 'triangle', 1400, 1380, 0.07, 0.008);
  },
  // feuillage secoué
  shake() { if (!this.ok) return; const t = this.at(); for (let i = 0; i < 4; i++) this.noiseHit(t + i * 0.07, 0.15, 'bandpass', 1300 + i * 150, 0.7, 0.05, null, 900, 0.02); },
  treeFall() {
    if (!this.ok) return;
    const t = this.at(), R = Math.random;
    this.voice(t, 'sawtooth', 90, 50, 1.2, 0.02, this.sfx, { lp: 320, vib: 6, vibDepth: 4 });
    for (let i = 0; i < 6; i++) this.jouer(this.tb('coup'), t + 0.3 + R() * 0.8, 0.025 + R() * 0.025, this.sfx, 0.6 + R() * 0.5);
    this.noiseHit(t + 1.1, 0.55, 'lowpass', 300, 0.7, 0.15);
    this.tone(t + 1.1, 'sine', 70, 38, 0.4, 0.12, null, 0.01);
  },
  // ---------------------------------------------------------------- pêche et arc
  cast() { if (!this.ok) return; const t = this.at(); this.noiseHit(t, 0.22, 'bandpass', 1200, 0.9, 0.035, null, 2400, 0.05); this.jouer(this.tb('goutte'), t + 0.45, 0.02, this.sfx, 0.55); this.noiseHit(t + 0.45, 0.2, 'lowpass', 900, 0.7, 0.015); },
  bite() { if (!this.ok) return; const t = this.at(); this.jouer(this.tb('goutte'), t, 0.05, this.sfx, 0.5 + Math.random() * 0.1); this.noiseHit(t, 0.12, 'lowpass', 1000, 0.7, 0.033); },
  reel(k = 1) { if (!this.ok) return; const t = this.at(); for (let i = 0; i < 8; i++) this.tone(t + i * 0.035, 'triangle', 1400, 1300, 0.014, 0.025 * k, null, 0.002); },
  catchFish() { if (!this.ok) return; const t = this.at(); this.splash(); this.tone(t + 0.1, 'triangle', 660, 990, 0.18, 0.03); },
  bowDraw() { if (!this.ok) return; this.voice(this.at(), 'sawtooth', 110, 170, 0.6, 0.009, this.sfx, { lp: 600 }); },
  bowShot() {
    if (!this.ok) return;
    const t = this.at();
    this.tone(t, 'triangle', 220, 95, 0.14, 0.2);
    this.voice(t, 'sawtooth', 180, 140, 0.12, 0.025, this.sfx, { lp: 1200 });
    this.noiseHit(t, 0.2, 'bandpass', 1500, 0.8, 0.08, null, 600, 0.02);
  },
  // ---------------------------------------------------------------- bêtes
  hoof(mat, speed) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, dur = mat === 'hard';
    for (let i = 0; i < 2; i++) this.jouer(this.tb('sabot'), t + i * (0.085 + R() * 0.015), 0.09 * (i ? 0.8 : 1), this.sfx, (dur ? 1.2 : 0.8) + R() * 0.1);
    if (!dur) this.jouer(this.tb('terre'), t, 0.05, this.sfx, 0.9);
  },
  whistle() { if (!this.ok) return; const t = this.at(); this.voice(t, 'sine', 1700, 2300, 0.25, 0.027, this.sfx, { vib: 6, vibDepth: 14 }); this.voice(t + 0.3, 'sine', 2300, 1650, 0.35, 0.027, this.sfx, { vib: 6, vibDepth: 14 }); },
  bark(k = 1, pan = 0) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, p = this._scope ? this.sfx : this.pan(clamp(pan / 20, -0.9, 0.9)), f = 380 + R() * 90;
    this.cri(t, { dur: 0.13 + R() * 0.05, f: [[0, f * 1.1], [0.3, f * 1.2], [1, f * 0.7]], rug: [60, 0.35], form: [[800, 3, 1], [1500, 5, 0.5], [2500, 7, 0.15]], souffle: [0.35, 1200], vol: 0.22 * k, lp: 3500, a: 0.006 }, p);
  },
  growl(k = 1) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, f = 78 + R() * 22, du = 0.7 + R() * 0.3;
    this.cri(t, { dur: du, f: [[0, f], [0.5, f * 1.12], [1, f * 0.9]], rug: [24 + R() * 8, 0.6], form: [[300, 2, 1], [800, 4, 0.4]], souffle: [0.4, 500], vol: 0.18 * k, lp: 1300, a: 0.08 }, this.sfx);
  },
  howl(d = 50) {
    if (!this.ok) return;
    const k = clamp(1 - d / 150, 0.1, 1), t = this.at(), R = Math.random, f = 360 + R() * 60, du = 1.8 + R() * 0.8;
    const out = this.lp(1800, this._scope ? this.amb : this.emit(this.virt(R() * 2 - 1, 60 + d, R() < 0.5), this.B.amb.inp, { att: 'aucune', dur: du + 0.5 }));
    this.cri(t, { type: 'triangle', dur: du, f: [[0, f], [0.2, f * 1.45], [0.75, f * 1.35], [1, f * 0.9]], vib: [5, 0.015], form: [[700, 2, 1], [1400, 4, 0.3]], souffle: [0.05, 1000], vol: 0.06 * k, lp: 1800, a: 0.25, r: du * 0.4 }, out);
  },
  crow(k = 1) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, p = this._scope ? this.amb : this.pan(R() * 2 - 1, this.amb);
    for (let i = 0, n = 2 + ((R() * 2) | 0); i < n; i++) { const f = 560 + R() * 80; this.cri(t + i * (0.28 + R() * 0.08), { dur: 0.2 + R() * 0.06, f: [[0, f], [0.3, f * 1.08], [1, f * 0.8]], rug: [70, 0.5], form: [[1100, 3, 1], [1900, 5, 0.45]], souffle: [0.25, 1500], vol: 0.13 * k, lp: 3200, a: 0.015 }, p); }
  },
  hurtAnimal(kind) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, gros = kind === 'cow' || kind === 'horse' || kind === 'boar' || kind === 'bear' || kind === 'deer', f = (gros ? 300 : 520) * (0.9 + R() * 0.2);
    this.cri(t, { dur: 0.28, f: [[0, f], [0.2, f * 1.15], [1, f * 0.6]], vib: [9, 0.03], rug: [35, 0.3], form: [[gros ? 800 : 1100, 3, 1], [2200, 5, 0.3]], souffle: [0.15, 1500], vol: 0.15, lp: 3500 }, this.sfx);
  },
  frog(k = 1) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, p = this._scope ? this.amb : this.pan(R() * 2 - 1, this.amb);
    for (let i = 0, n = 1 + ((R() * 2) | 0); i < n; i++) this.jouer(this.tb('grenouille', 6), t + i * (0.26 + R() * 0.1), 0.05 * k, p, 0.9 + R() * 0.2);
  },
  woodpecker() { if (!this.ok) return; const p = this._scope ? this.amb : this.pan(Math.random() * 2 - 1, this.amb); this.jouer(this.tb('pic', 4), this.at(), 0.045, p, 0.95 + Math.random() * 0.1); },
  lap(k = 1) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, p = this._scope ? this.amb : this.pan(R() * 2 - 1, this.amb);
    this.noiseHit(t, 0.5, 'lowpass', 420, 0.7, 0.035 * k, p, 180, 0.12);
    if (R() < 0.6) this.jouer(this.tb('goutte'), t + 0.1 + R() * 0.2, 0.012 * k, p, 0.6 + R() * 0.3);
  },
  bubble() { if (!this.ok) return; const t = this.at(), p = this._scope ? this.amb : this.pan(Math.random() * 2 - 1, this.amb); this.tone(t, 'sine', 300 + Math.random() * 200, 700, 0.06, 0.014, p, 0.006); },
  eagle() {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, p = this._scope ? this.amb : this.pan(R() * 2 - 1, this.amb);
    this.cri(t, { type: 'triangle', dur: 0.9, f: [[0, 1650], [0.2, 1750], [1, 1250]], vib: [11, 0.03], form: [[1600, 1.5, 1], [3200, 3, 0.2]], vol: 0.024, lp: 3500, a: 0.04 }, p);
  },
  drip() { if (!this.ok) return; const p = this._scope ? this.amb : this.pan(Math.random() * 2 - 1, this.amb); this.jouer(this.tb('goutte'), this.at(), 0.045, p, 0.85 + Math.random() * 0.35); },
  // le marteau sur l'enclume (à la forge, si on sait où elle est)
  anvil() {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, P = this._scope ? null : this.forgePos();
    const out = this.lp(4500, P ? this.emit(P, this.B.amb.inp, { ref: 4, dur: 2.5 }) : this.amb);
    for (let i = 0, n = 2 + ((R() * 3) | 0); i < n; i++) {
      const tt = t + i * (0.42 + R() * 0.08), f = 1150 + R() * 60, a = i === n - 1 ? 0.6 : 1;
      this.tone(tt, 'sine', f, f, 0.55, 0.024 * a, out, 0.002); this.tone(tt, 'sine', f * 2.76, f * 2.76, 0.25, 0.01 * a, out, 0.002); this.tone(tt, 'sine', 420, 400, 0.12, 0.02 * a, out, 0.002);
      this.noiseHit(tt, 0.02, 'bandpass', 2500, 1, 0.025 * a, out);
    }
  },
  // ---------------------------------------------------------------- horreur (courts, jamais en boucle)
  glitchSnd(k) {
    if (!this.ok) return;
    const t = this.ctx.currentTime, R = Math.random;
    for (let i = 0; i < 3 + k * 3; i++) this.tone(t + i * 0.045, 'square', 200 + R() * 1400, 100 + R() * 500, 0.035, 0.025 * Math.min(1.5, k), this.sfx, 0.003);
    this.noiseHit(t, 0.08 + 0.05 * k, 'bandpass', 1200, 0.8, 0.02 * k);
  },
  // chuchotement : vient de derrière (plus souvent), tout près ; pan 0 : dans la tête
  whisper(pan = 0, k = 0.5) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random;
    let out = this.amb;
    if (!this._scope && pan && this.L.ok && this.son3d) out = this.emit(this.virt(clamp(pan, -1, 1), 1.3, R() < 0.6), this.B.amb.inp, { att: 'aucune', dur: 2 });
    else if (!this._scope && pan) out = this.pan(pan, this.amb);
    const V = [[700, 1200], [400, 2000], [300, 2300], [500, 900], [600, 1700]];
    for (let i = 0, n = 5 + ((R() * 3) | 0); i < n; i++) {
      const tt = t + i * (0.12 + R() * 0.06), v = V[(R() * V.length) | 0];
      this.noiseHit(tt, 0.12, 'bandpass', v[1], 3, 0.02 * k, out, v[1] * 0.9, 0.03);
      this.noiseHit(tt, 0.12, 'bandpass', v[0], 3, 0.018 * k, out, v[0] * 1.05, 0.03);
      if (R() < 0.3) this.noiseHit(Math.max(t, tt - 0.03), 0.06, 'bandpass', 3600, 1.5, 0.006 * k, out, 3200, 0.015);
    }
    this.voice(t, 'sine', 180, 140, 0.8, 0.007 * k, out, { lp: 400 });
  },
  heartbeat(k) {
    if (!this.ok) return;
    const t = this.ctx.currentTime + 0.005;
    this.tone(t, 'sine', 60, 40, 0.16, 0.18 * k, this.sfx, 0.008); this.noiseHit(t, 0.08, 'lowpass', 160, 0.7, 0.056 * k);
    this.tone(t + 0.22, 'sine', 54, 38, 0.18, 0.14 * k, this.sfx, 0.008); this.noiseHit(t + 0.22, 0.08, 'lowpass', 140, 0.7, 0.04 * k);
  },
  steps1(k, pan) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, out = this._scope ? this.sfx : this.pan(clamp(pan / 15, -0.9, 0.9));
    this.jouer(this.tb(R() < 0.5 ? 'terre' : 'herbe'), t, 0.14 * k, out, 0.72 + R() * 0.08);
    this.tone(t, 'sine', 70, 40, 0.14, 0.045 * k, out, 0.006);
  },
  stab() { if (!this.ok) return; const t = this.at(); this.noiseHit(t, 0.1, 'bandpass', 900, 1, 0.13); this.noiseHit(t + 0.01, 0.15, 'lowpass', 500, 0.7, 0.12); this.tone(t, 'sine', 90, 40, 0.3, 0.26); },
  redNight() {
    if (!this.ok) return;
    const t = this.at(), out = this.lp(500, this.amb);
    this.voice(t, 'sine', 55, 52, 6, 0.05, out); this.voice(t + 0.5, 'sine', 82, 78, 5, 0.03, out);
    this.voice(t + 1.2, 'triangle', 110, 104, 4.5, 0.008, this.lp(700, this.amb), { vib: 0.3, vibDepth: 2 });
  },
  enversShift(on) { if (!this.ok) return; const t = this.at(); this.voice(t, 'sawtooth', on ? 400 : 60, on ? 60 : 400, 1.2, 0.04, this.lp(900)); },
  silence(sec) {
    if (!this.ctx) return;
    const g = this.B.amb.inp.gain, t = this.ctx.currentTime;
    g.cancelScheduledValues(t); g.setTargetAtTime(0, t, 0.2);
    clearTimeout(this._silT);
    this._silT = setTimeout(() => this.setAmbient(this.ambVolume), sec * 1000);
  },
});
