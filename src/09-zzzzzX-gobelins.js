// ============================================================================
//  LES GOBELINS (agent X) : leurs bruits. Rares, courts, venus d'eux (son 3D).
//  sound.gobRire(pos, k)     un petit rire étouffé, à plusieurs souffles
//  sound.gobPas(pos, k)      des pieds nus qui détalent, des ongles sur le bois
//  sound.gobCri(pos, k)      le cri aigu (pris, blessé, l'alerte au village)
//  sound.gobMur(pos, k)      un gobelin qui passe dans un mur : le bois qui craque,
//                            quelque chose de mouillé, un gémissement très bas
//  sound.gobFouille(pos, k)  il fouille : un froissement, des tintements
//  sound.gobTrappe(pos, k)   la racine, le panneau : du bois mouillé qui cède, la terre qui retombe
//  sound.gobVoix(pos, k)     des mots volés, dits avec une voix volée (on n'entend que le murmure)
// ============================================================================
Object.assign(SoundEngine.prototype, {
  _gob(pos, fn) { if (!this.ok) return; try { if (pos && this.ici) this.ici(pos, fn); else fn(); } catch (e) { console.error(e); } },
  gobRire(pos, k = 1) {
    this._gob(pos, () => {
      const t = this.at(0.01), R = Math.random, p = this.pan(0), n = 3 + ((R() * 3) | 0), f0 = 620 + R() * 160;
      for (let i = 0; i < n; i++) {
        const tt = t + i * (0.085 + R() * 0.03), f = f0 * (1 - i * 0.05) * (0.97 + R() * 0.06);
        this.cri(tt, { type: 'triangle', dur: 0.07 + R() * 0.03, f: [[0, f * 1.06], [1, f * 0.9]], rug: [38 + R() * 10, 0.35], form: [[1100, 4, 1], [2500, 6, 0.4]], souffle: [0.35, 2600], vol: 0.032 * k * (1 - i * 0.12), lp: 4600, a: 0.006 }, p);
      }
      this.noiseHit(t + n * 0.1, 0.25, 'bandpass', 2400, 1.2, 0.006 * k, p, 1800, 0.05);
    });
  },
  gobPas(pos, k = 1) {
    this._gob(pos, () => {
      const t = this.at(0.005), R = Math.random, p = this.pan(0);
      for (let i = 0; i < 6; i++) {
        const tt = t + i * (0.075 + R() * 0.02);
        this.noiseHit(tt, 0.035, 'bandpass', 900 + R() * 400, 1.4, 0.03 * k, p, 600);
        if (i % 2) this.noiseHit(tt + 0.012, 0.02, 'highpass', 3800, 1, 0.008 * k, p, 3000);
      }
    });
  },
  gobCri(pos, k = 1) {
    this._gob(pos, () => {
      const t = this.at(0.01), R = Math.random, p = this.pan(0), f = 1250 + R() * 200;
      this.cri(t, { dur: 0.55 + R() * 0.15, f: [[0, f], [0.25, f * 1.45], [0.7, f * 1.2], [1, f * 0.6]], vib: [11, 0.035], rug: [64, 0.5], form: [[1700, 4, 1], [3200, 6, 0.45], [900, 3, 0.3]], souffle: [0.25, 3000], vol: 0.06 * k, lp: 5200, a: 0.01 }, p);
      this.cri(t + 0.04, { type: 'square', dur: 0.4, f: [[0, f * 0.51], [1, f * 0.33]], rug: [40, 0.6], form: [[700, 3, 1], [1400, 4, 0.4]], vol: 0.022 * k, lp: 2600, a: 0.01 }, p);
    });
  },
  gobMur(pos, k = 1) {
    this._gob(pos, () => {
      const t = this.at(0.01), R = Math.random, p = this.pan(0);
      // le bois (ou la pierre) qui craque, lentement, plusieurs fois
      for (let i = 0; i < 4; i++) this.voice(t + i * 0.26 + R() * 0.06, 'sawtooth', 95 + R() * 40, 60 + R() * 20, 0.22, 0.03 * k, p, { bp: 520 + R() * 260, q: 4, lp: 1800 });
      // quelque chose de mouillé, qui se déchire
      for (let i = 0; i < 16; i++) this.noiseHit(t + 0.1 + i * 0.065 + R() * 0.03, 0.03, 'bandpass', 1600 + R() * 2200, 2.2, 0.018 * k, p, 900);
      // et, en dessous, un gémissement très bas
      this.voice(t + 0.05, 'sine', 120, 82, 1.3, 0.035 * k, p, { vib: 4, vibDepth: 6, lp: 600 });
      this.noiseHit(t + 0.9, 0.5, 'lowpass', 400, 0.8, 0.03 * k, p, 160, 0.06);
    });
  },
  gobFouille(pos, k = 1) {
    this._gob(pos, () => {
      const t = this.at(0.01), R = Math.random, p = this.pan(0);
      this.noiseHit(t, 0.32, 'bandpass', 1500 + R() * 600, 1.0, 0.022 * k, p, 900, 0.06);
      for (let i = 0; i < 3; i++) {
        const tt = t + 0.08 + i * 0.13 + R() * 0.05, f = 2300 + R() * 1600;
        this.tone(tt, 'sine', f, f * 0.995, 0.12, 0.012 * k, p, 0.002);
        this.tone(tt, 'sine', f * 2.76, f * 2.74, 0.06, 0.004 * k, p, 0.002);
      }
    });
  },
  gobTrappe(pos, k = 1) {
    this._gob(pos, () => {
      const t = this.at(0.01), R = Math.random, p = this.pan(0);
      this.voice(t, 'sawtooth', 70, 48, 0.6, 0.05 * k, p, { bp: 380, q: 3, lp: 1200 });
      this.noiseHit(t + 0.05, 0.35, 'lowpass', 700, 0.9, 0.05 * k, p, 250, 0.03);
      for (let i = 0; i < 9; i++) this.noiseHit(t + 0.35 + i * 0.07 + R() * 0.05, 0.05, 'lowpass', 1100 + R() * 600, 0.9, 0.02 * k, p, 500);
    });
  },
  gobVoix(pos, k = 1) {
    this._gob(pos, () => { this.mumble && this.mumble(1.55 + Math.random() * 0.4, 18 + Math.random() * 14, 0, 0.55 * k); });
  },
});
