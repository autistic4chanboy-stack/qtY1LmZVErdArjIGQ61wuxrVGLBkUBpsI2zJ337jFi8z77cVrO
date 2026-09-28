// ============================================================================
//  SONS EN PLUS : cris des nouvelles bêtes, pelle, alambic, prière
//  (toujours courts et discrets ; aucune musique, aucune boucle)
// ============================================================================
const _animalCall = SoundEngine.prototype.animal;
Object.assign(SoundEngine.prototype, {
  animal(kind, pan, k) {
    if (!this.ok) return;
    const t = this.ctx.currentTime + 0.02, p = this.pan(pan || 0, this.amb), v = clamp(k, 0, 1);
    switch (kind) {
      case 'goat': this.voice(t, 'sawtooth', 460, 400, 0.45, 0.04 * v, p, { vib: 12, vibDepth: 40, bp: 1400, q: 2 }); return;
      case 'donkey': for (let i = 0; i < 3; i++) { this.voice(t + i * 0.55, 'sawtooth', 720, 520, 0.28, 0.04 * v, p, { bp: 1100, q: 1.4 }); this.voice(t + i * 0.55 + 0.28, 'sawtooth', 190, 150, 0.26, 0.05 * v, p, { bp: 500, q: 1.2 }); } return;
      case 'goose': for (let i = 0; i < 2; i++) this.voice(t + i * 0.22, 'square', 520, 430, 0.16, 0.035 * v, p, { bp: 900, q: 2.5 }); return;
      case 'heron': this.voice(t, 'sawtooth', 300, 180, 0.35, 0.03 * v, p, { bp: 700, q: 1.5 }); return;
      case 'pheasant': for (let i = 0; i < 2; i++) this.voice(t + i * 0.18, 'square', 900, 700, 0.1, 0.03 * v, p, { bp: 1500, q: 2 }); return;
      case 'magpie': for (let i = 0; i < 5; i++) this.voice(t + i * 0.07, 'square', 1500 + Math.random() * 300, 1200, 0.05, 0.02 * v, p, { bp: 2000, q: 2 }); return;
      case 'frog': this.frog && this.frog(v); return;
    }
    return _animalCall.call(this, kind, pan, k);
  },
  flutter(k = 1, pan = 0) { if (!this.ok) return; const t = this.at(), p = this.pan(clamp(pan / 10, -0.9, 0.9)); for (let i = 0; i < 6; i++) this.noiseHit(t + i * 0.05, 0.04, 'bandpass', 700 + i * 60, 1.2, 0.03 * k, p); },
  squeak() { if (!this.ok) return; const t = this.at(), p = this.pan(Math.random() * 2 - 1, this.amb); for (let i = 0; i < 2; i++) this.tone(t + i * 0.06, 'sine', 5200, 6000, 0.02, 0.006, p); },
  hiss() { if (!this.ok) return; this.noiseHit(this.at(), 0.5, 'highpass', 3000, 0.8, 0.03, null, 5000); },
  whistleMarmot() { if (!this.ok) return; const t = this.at(), p = this.pan(Math.random() * 1.6 - 0.8, this.amb); this.tone(t, 'sine', 2600, 2300, 0.18, 0.02, p); },
  shovel(k = 1) { if (!this.ok) return; const t = this.at(); this.noiseHit(t, 0.1, 'lowpass', 700, 0.8, 0.14 * k); this.noiseHit(t + 0.08, 0.14, 'bandpass', 1800, 1.2, 0.04 * k); this.tone(t, 'sine', 120, 70, 0.08, 0.1 * k); },
  shovelHit() { if (!this.ok) return; const t = this.at(); this.tone(t, 'triangle', 1300, 900, 0.06, 0.05); this.noiseHit(t, 0.05, 'bandpass', 2400, 2, 0.05); },
  bubble2() { if (!this.ok) return; const t = this.at(); for (let i = 0; i < 5; i++) this.tone(t + i * 0.09 + Math.random() * 0.05, 'sine', 260 + Math.random() * 240, 520, 0.05, 0.012); },
  scream2() { if (!this.ok) return; const t = this.at(); this.voice(t, 'sawtooth', 1500, 900, 0.7, 0.03, this.lp(3000), { vib: 31, vibDepth: 120, bp: 1800, q: 1 }); },
  candle() { if (!this.ok) return; this.noiseHit(this.at(), 0.3, 'bandpass', 900, 0.8, 0.012, null, 300); },
  wind1() { if (!this.ok) return; this.noiseHit(this.at(), 1.8, 'lowpass', 500, 0.6, 0.05, this.amb, 180); },
  rumble() { if (!this.ok) return; const t = this.at(); this.tone(t, 'sine', 48, 38, 2.2, 0.12, this.amb, 0.4); this.noiseHit(t, 1.6, 'lowpass', 180, 0.6, 0.12, this.amb, 60); },
  splashBig() { if (!this.ok) return; const t = this.at(); this.noiseHit(t, 0.7, 'lowpass', 1400, 0.6, 0.25, null, 200); },
});
