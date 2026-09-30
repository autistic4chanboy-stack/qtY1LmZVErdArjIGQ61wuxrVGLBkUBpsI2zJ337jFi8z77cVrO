// ============================================================================
//  SONS EN PLUS : cris des nouvelles bêtes, pelle, alambic, prière
//  (toujours courts et discrets ; aucune musique, aucune boucle)
// ============================================================================
const _animalCall = SoundEngine.prototype.animal;
Object.assign(SoundEngine.prototype, {
  animal(kind, pan, k) {
    if (!this.ok) return;
    const t = this.ctx.currentTime + 0.02, v = clamp(k, 0, 1), R = Math.random;
    const P = () => this.pan(pan || 0, this.amb);
    switch (kind) {
      case 'goat': { const f = 380 + R() * 80, vr = 9 + R() * 3; this.cri(t, { dur: 0.4 + R() * 0.2, f: [[0, f], [0.2, f * 1.06], [1, f * 0.9]], vib: [vr, 0.04], rug: [vr, 0.55], form: [[800, 5, 1], [1900, 7, 0.55], [2900, 9, 0.15]], souffle: [0.06, 2200], vol: 0.125 * v, lp: 4200 }, P()); return; }
      case 'donkey': {
        const p = P();
        for (let i = 0, tt = t; i < 3; i++, tt += 0.62 + R() * 0.08) {
          this.cri(tt, { dur: 0.3, f: [[0, 640], [1, 880]], form: [[1200, 3, 1], [2400, 5, 0.4]], souffle: [0.35, 1600], vol: 0.1 * v, lp: 3500, a: 0.04 }, p);
          this.cri(tt + 0.3, { dur: 0.32, f: [[0, 230], [1, 165]], rug: [26, 0.5], form: [[500, 3, 1], [1100, 5, 0.5]], souffle: [0.2, 800], vol: 0.19 * v, lp: 2500, a: 0.03 }, p);
        }
        return;
      }
      case 'goose': { const p = P(); for (let i = 0, n = 2 + ((R() * 2) | 0), tt = t; i < n; i++, tt += 0.22 + R() * 0.08) { const f = 380 + R() * 60; this.cri(tt, { type: 'square', dur: 0.18, f: [[0, f], [0.5, f * 1.08], [1, f * 0.92]], rug: [45, 0.35], form: [[900, 5, 1], [2000, 7, 0.45]], vol: 0.21 * v, lp: 3400, a: 0.015 }, p); } return; }
      case 'heron': this.cri(t, { dur: 0.35, f: [[0, 230], [1, 170]], rug: [48, 0.8], form: [[600, 3, 1], [1500, 4, 0.45]], souffle: [0.3, 1200], vol: 0.2 * v, lp: 2800, a: 0.02 }, P()); return;
      case 'pheasant': {
        const p = P();
        for (let i = 0; i < 2; i++) this.cri(t + i * 0.19, { type: 'square', dur: 0.12, f: [[0, 1080], [1, 840]], form: [[1400, 3, 1], [2800, 5, 0.35]], vol: 0.06 * v, lp: 3800, a: 0.008 }, p);
        this.flutter(0.5 * v, 0);
        return;
      }
      case 'magpie': { const p = P(); for (let i = 0, n = 6 + ((R() * 4) | 0); i < n; i++) this.cri(t + i * (0.075 + R() * 0.02), { dur: 0.055, f: [[0, 1300], [1, 1000]], rug: [90, 0.6], form: [[1600, 2, 1], [3000, 3, 0.35]], souffle: [0.5, 2000], vol: 0.08 * v, lp: 3800, a: 0.006 }, p); return; }
      case 'frog': this.frog && this.frog(v); return;
    }
    return _animalCall.call(this, kind, pan, k);
  },
  // battements d'ailes : un envol (de plus en plus vite)
  flutter(k = 1, pan = 0) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, p = this._scope ? this.sfx : this.pan(clamp(pan / 10, -0.9, 0.9));
    for (let i = 0, tt = t, per = 0.075; i < 8; i++, tt += per, per *= 0.93) this.noiseHit(tt, 0.05, 'bandpass', 650 + R() * 250, 0.8, 0.035 * k * (1 - i * 0.07), p, 450, 0.012);
  },
  squeak() { if (!this.ok) return; const t = this.at(), p = this._scope ? this.amb : this.pan(Math.random() * 2 - 1, this.amb); for (let i = 0; i < 2; i++) this.tone(t + i * 0.06, 'sine', 3200 + Math.random() * 500, 3700, 0.025, 0.012, p, 0.004); },
  hiss() { if (!this.ok) return; this.noiseHit(this.at(), 0.5, 'bandpass', 2600, 1, 0.07, null, 3200, 0.05); },
  whistleMarmot() { if (!this.ok) return; const t = this.at(), p = this._scope ? this.amb : this.pan(Math.random() * 1.6 - 0.8, this.amb); this.voice(t, 'sine', 2500, 2250, 0.18, 0.015, p, { vib: 20, vibDepth: 25 }); },
  shovel(k = 1) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random;
    this.jouer(this.tb('terre'), t, 0.066 * k, this.sfx, 0.72 + R() * 0.12);
    this.noiseHit(t + 0.08, 0.14, 'bandpass', 1500, 1.2, 0.008 * k, null, 1100);
    this.tone(t, 'sine', 120, 70, 0.08, 0.018 * k);
  },
  shovelHit() { if (!this.ok) return; const t = this.at(); this.jouer(this.tb('coup'), t, 0.26, this.sfx, 2.1 + Math.random() * 0.2); this.tone(t, 'sine', 1350, 1300, 0.12, 0.05, null, 0.002); },
  bubble2() { if (!this.ok) return; const t = this.at(), R = Math.random; for (let i = 0; i < 5; i++) this.tone(t + i * 0.09 + R() * 0.05, 'sine', 260 + R() * 240, 520, 0.05, 0.014, null, 0.006); },
  // la mandragore : un cri trop aigu, qui ne ressemble à rien de vivant (mais sans percer l'oreille)
  scream2() {
    if (!this.ok) return;
    const t = this.at();
    this.cri(t, { dur: 0.75, f: [[0, 1400], [0.3, 1550], [1, 900]], vib: [31, 0.07], rug: [55, 0.4], form: [[1600, 2, 1], [3000, 3, 0.3]], souffle: [0.15, 2500], vol: 0.05, lp: 3000, a: 0.03 }, this.lp(3000));
  },
  candle() { if (!this.ok) return; this.noiseHit(this.at(), 0.3, 'bandpass', 700, 0.8, 0.012, null, 300, 0.05); },
  // un coup de vent qui passe d'un côté à l'autre
  wind1() {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, s = R() < 0.5 ? -1 : 1, t0 = this.ctx.currentTime, du = 1.9;
    let out = this.amb;
    if (!this._scope && this.L.ok) {
      const L = this.L, a0 = Math.atan2(L.f[2], L.f[0]) + s * 1.3;
      out = this.emit(this.virt(0, 1), this.B.amb.inp, { att: 'aucune', dur: du + 0.3, suivre: () => { const u = clamp((this.ctx.currentTime - t0) / du, 0, 1), a = a0 - s * 2.6 * u; return [this.L.x + Math.cos(a) * 9, this.L.y + 2, this.L.z + Math.sin(a) * 9]; } });
    }
    this.noiseHit(t, du, 'lowpass', 520, 0.6, 0.05, out, 190, 0.45);
  },
  rumble() { if (!this.ok) return; const t = this.at(); this.tone(t, 'sine', 48, 38, 2.2, 0.12, this.amb, 0.4); this.noiseHit(t, 1.6, 'lowpass', 180, 0.6, 0.12, this.amb, 60, 0.3); },
  splashBig() { if (!this.ok) return; const t = this.at(); this.jouer(this.tb('plouf', 5), t, 0.11, this.sfx, 0.7 + Math.random() * 0.1); this.tone(t, 'sine', 80, 45, 0.3, 0.025, null, 0.01); },
});
