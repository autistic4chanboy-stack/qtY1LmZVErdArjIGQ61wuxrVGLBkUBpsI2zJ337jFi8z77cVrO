// ============================================================================
//  LES SONS DU CAMBRIOLAGE (agent U, vague 14) : tout près, tout bas.
//  sound.uSouffle(pos, k, ronfle, trouble) : le souffle d'un dormeur (un ronflement chez certains ; « trouble » :
//    il dort mal, le souffle s'accroche) ; sound.uDraps(pos, k) : il se retourne (les draps, le bois du lit) ;
//    sound.uGrince(pos, k) : une latte qui grince ; sound.uChute(pos, k, sorte) : un objet qui tombe (« metal » : un
//    bougeoir qui roule, « bois », « verre ») ; sound.uMurmure(pos, voix) : il parle en dormant.
//  Chaque son vient de sa place (son 3D, 13-zz-son3d.js) ; pos : un habitant, ou [x, y, z].
// ============================================================================
Object.assign(SoundEngine.prototype, {
  _uIci(pos, fn, ref) { try { if (pos && this.ici) this.ici(pos, fn, { att: 'phys', ref: ref || 2.5, roll: 1 }); else fn(); } catch (e) { console.error(e); } },
  uSouffle(pos, k = 1, ronfle = false, trouble = false) {
    if (!this.ok) return;
    this._uIci(pos, () => {
      const t = this.at(0.01), R = Math.random, p = this.pan(0), du = (trouble ? 0.7 : 1.05) + R() * 0.25;
      // l'inspiration : un souffle doux, qui monte
      this.noiseHit(t, du, 'bandpass', 520 + R() * 120, 0.8, 0.04 * k, p, 760, du * 0.55);
      if (ronfle) {
        // le ronflement : un grondement grave, haché (le voile du palais), sous l'inspiration
        const f = 62 + R() * 18;
        this.cri(t + du * 0.25, { type: 'sawtooth', dur: du * 0.7, f: [[0, f * 0.9], [0.5, f], [1, f * 0.85]], rug: [24 + R() * 10, 0.75], form: [[260, 2, 1], [520, 3, 0.35]], souffle: [0.18, 420], vol: 0.048 * k, lp: 700, a: du * 0.25 }, p);
      }
      // l'expiration, plus longue, plus basse ; un accroc quand il dort mal
      const t2 = t + du + (trouble ? 0.15 : 0.35) + R() * 0.2, du2 = (trouble ? 0.6 : 1.3) + R() * 0.3;
      this.noiseHit(t2, du2, 'bandpass', 380 + R() * 80, 0.8, 0.032 * k, p, 240, du2 * 0.2);
      if (trouble && R() < 0.5) this.noiseHit(t2 + du2 * 0.4, 0.09, 'bandpass', 900, 1.2, 0.024 * k, p, 700, 0.02);
    }, 2);
  },
  uDraps(pos, k = 1) {
    if (!this.ok) return;
    this._uIci(pos, () => {
      const t = this.at(0.01), R = Math.random, p = this.pan(0);
      for (let i = 0, n = 3 + ((R() * 3) | 0); i < n; i++) this.noiseHit(t + i * 0.11 + R() * 0.06, 0.14 + R() * 0.12, 'highpass', 1800 + R() * 900, 0.7, 0.029 * k, p, 1300, 0.04);
      // le bois du lit, sous le poids qui se déplace
      const f = 210 + R() * 80;
      this.voice(t + 0.12 + R() * 0.1, 'triangle', f, f * (1.15 + R() * 0.2), 0.16 + R() * 0.08, 0.016 * k, p, { vib: 38 + R() * 20, vibDepth: 18, bp: 700, q: 3 });
    }, 2.5);
  },
  uGrince(pos, k = 1) {
    if (!this.ok) return;
    this._uIci(pos, () => {
      const t = this.at(0.01), R = Math.random, p = this.pan(0), f = 150 + R() * 70, du = 0.22 + R() * 0.22;
      // la latte : un frottement de bois qui chante un peu, puis le bruit sourd du poids
      this.cri(t, { type: 'sawtooth', dur: du, f: [[0, f], [0.6, f * (1.25 + R() * 0.2)], [1, f * 1.1]], rug: [55 + R() * 25, 0.55], form: [[620 + R() * 200, 5, 1], [1450, 7, 0.3]], souffle: [0.1, 1100], vol: 0.05 * k, lp: 2600, a: 0.03 }, p);
      this.tone(t, 'sine', 95, 70, 0.12, 0.032 * k, p, 0.006);
    }, 3);
  },
  uChute(pos, k = 1, sorte = 'metal') {
    if (!this.ok) return;
    this._uIci(pos, () => {
      const t = this.at(0.01), R = Math.random, p = this.pan(0);
      // le choc sur le plancher
      this.noiseHit(t, 0.12, 'lowpass', 700, 0.8, 0.16 * k, p, 250);
      this.tone(t, 'sine', 130, 60, 0.18, 0.11 * k, p, 0.003);
      if (sorte === 'verre') { for (let i = 0; i < 6; i++) this.noiseHit(t + 0.02 + i * 0.03 + R() * 0.03, 0.05, 'highpass', 4200 + R() * 1500, 1.5, 0.055 * k * (1 - i * 0.12), p, 3600, 0.003); return; }
      if (sorte === 'bois') { for (let i = 1; i < 3; i++) this.noiseHit(t + i * 0.13, 0.07, 'lowpass', 600, 0.8, 0.07 * k / i, p, 300); return; }
      // le métal : il rebondit, il sonne, il roule
      for (let i = 0; i < 4; i++) {
        const tt = t + 0.16 * (1 - Math.pow(0.6, i + 1)) / 0.4 + R() * 0.02, a = 0.06 * k * Math.pow(0.55, i);
        for (const [m, q] of [[1, 1], [1.51, 0.6], [2.27, 0.35]]) this.tone(tt, 'sine', 1150 * m, 1140 * m, 0.35 / (i + 1), a * q, p, 0.002);
      }
      for (let i = 0; i < 9; i++) this.noiseHit(t + 0.5 + i * 0.07, 0.06, 'bandpass', 1300 + R() * 300, 2, 0.014 * k * (1 - i / 10), p, 1200, 0.01);
    }, 5);
  },
  uMurmure(pos, voix = 1) {
    if (!this.ok) return;
    this._uIci(pos, () => this.mumble(voix * 0.95, 12 + Math.random() * 10, 0, 0.48), 2);
  },
});
