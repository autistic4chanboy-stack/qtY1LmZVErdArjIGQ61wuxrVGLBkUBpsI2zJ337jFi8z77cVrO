// ============================================================================
//  LES RUNES (agent R15, quinzième vague) — les sons
//  Courts, programmés d'un coup (aucun nœud ne vit plus de quelques secondes).
//  API : sound.r15Pierre(pos) (une tablette qu'on soulève : la pierre qui racle,
//        une note sourde), r15Eveil(pos, k) (les runes qui prennent : un bourdon
//        grave et des harmoniques de verre qui montent puis s'éteignent),
//        r15Dalle(pos) (une dalle qui s'enfonce : la pierre qui frotte, le choc),
//        r15Sourd() (rien ne prend : un coup mat).
// ============================================================================
Object.assign(SoundEngine.prototype, {
  r15Ici(pos, fn) { if (!this.ok || !this.ctx) return; try { if (pos && this.ici) this.ici(pos, fn); else fn(); } catch (e) { console.error(e); } },
  r15Pierre(pos) {
    this.r15Ici(pos, () => {
      const t = this.at(0.02), o = this.sfx;
      this.noiseHit(t, 0.35, 'bandpass', 900, 1.2, 0.05, o, 500, 0.02);
      this.noiseHit(t + 0.32, 0.12, 'lowpass', 380, 0.8, 0.07, o, 160, 0.004);
      this.tone(t + 0.32, 'sine', 110, 96, 0.5, 0.05, o, 0.004);
      this.tone(t + 0.5, 'sine', 392, 390, 1.8, 0.012, this.lp(2400, o), 0.02);
      this.tone(t + 0.5, 'sine', 587, 585, 1.4, 0.006, this.lp(2400, o), 0.02);
    });
  },
  r15Eveil(pos, k) {
    this.r15Ici(pos, () => {
      const t = this.at(0.02), o = this.lp(3200, this.sfx), v = 0.05 * (k || 1);
      this.voice(t, 'sawtooth', 55, 55, 2.6, v * 0.35, o, { vib: 0.6, vibDepth: 1.5, lp: 260 });
      this.tone(t, 'sine', 110, 110, 2.8, v * 0.6, o, 0.25);
      for (const [f, d, g] of [[440, 0.15, 0.35], [659, 0.45, 0.25], [880, 0.75, 0.2], [1318, 1.05, 0.12]]) this.tone(t + d, 'sine', f, f * 1.002, 2.0, v * g, o, 0.12);
      this.noiseHit(t, 1.6, 'bandpass', 2400, 4, v * 0.12, o, 3600, 0.5);
    });
  },
  r15Dalle(pos) {
    this.r15Ici(pos, () => {
      const t = this.at(0.02), o = this.sfx, R = Math.random;
      this.noiseHit(t, 2.5, 'lowpass', 420, 0.9, 0.08, o, 180, 0.3);
      this.noiseHit(t, 2.4, 'bandpass', 900, 1.5, 0.025, o, 600, 0.2);
      this.voice(t + 0.1, 'sawtooth', 48, 40, 2.3, 0.025, o, { vib: 3, vibDepth: 3, lp: 220 });
      for (let i = 0; i < 10; i++) this.noiseHit(t + 0.2 + R() * 2.2, 0.05 + R() * 0.06, 'bandpass', 700 + R() * 1500, 1.4, 0.015 + R() * 0.02, o);
      this.noiseHit(t + 2.55, 0.5, 'lowpass', 300, 0.7, 0.14, o, 80, 0.004);
      this.tone(t + 2.55, 'sine', 62, 38, 0.7, 0.1, o, 0.004);
    });
  },
  r15Sourd() {
    this.r15Ici(null, () => {
      const t = this.at(0.01), o = this.sfx;
      this.noiseHit(t, 0.18, 'lowpass', 300, 0.8, 0.07, o, 120, 0.003);
      this.tone(t, 'sine', 90, 60, 0.3, 0.06, o, 0.003);
    });
  },
});
