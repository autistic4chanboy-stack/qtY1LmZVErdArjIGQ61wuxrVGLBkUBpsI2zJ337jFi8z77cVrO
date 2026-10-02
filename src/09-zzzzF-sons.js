// ============================================================================
//  LES SONS DU HASARD DE LA VALLÉE (agent F, douzième vague) : ce qu'on entend
//  pendant les événements nouveaux (11-zzzzF-*.js). Tout est synthétisé, court,
//  DOUX, programmé d'un coup sur l'horloge WebAudio (rien à chaque image) ; placé
//  dans le monde par sound.ici(pos, …) quand l'événement a une source.
//  Les volumes restent sous ceux des sons du jeu (cloche 0,06, cris 0,1).
// ============================================================================
Object.assign(SoundEngine.prototype, {
  // sortie d'un son d'événement : la source placée (portée « ici »), sinon le centre
  _hfOut(dest) { return this.pan(0, dest || this.sfx); },

  // ---------------------------------------------------------------- le ciel
  // le feu Saint-Elme : un grésillement sec, par petites salves
  hfGresille(k = 1) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, out = this._hfOut(this.amb);
    for (let i = 0, tt = t; i < 26; i++, tt += 0.03 + R() * 0.07) this.noiseHit(tt, 0.012 + R() * 0.02, 'highpass', 3800 + R() * 2500, 0.7, 0.02 * k * (0.5 + R()), out);
    this.noiseHit(t, 1.6, 'bandpass', 5200, 1.4, 0.006 * k, out, 4200, 0.3);
  },
  // la foudre sur un arbre : le coup sec tout près, le bois qui éclate
  hfFoudre(k = 1) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, out = this._hfOut(this.sfx);
    this.noiseHit(t, 0.09, 'highpass', 1800, 0.6, 0.16 * k, out);
    this.noiseHit(t + 0.01, 0.5, 'lowpass', 900, 0.7, 0.12 * k, out, 200, 0.01);
    for (let i = 0; i < 9; i++) this.noiseHit(t + 0.05 + i * 0.03 + R() * 0.03, 0.04, 'bandpass', 900 + R() * 1400, 1.5, 0.05 * k, out);
    this.tone(t + 0.02, 'sine', 70, 34, 1.4, 0.09 * k, out, 0.01);
  },
  // un drap qui claque au vent
  hfDrap(k = 1) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, out = this._hfOut(this.amb);
    for (let i = 0, tt = t; i < 5; i++, tt += 0.11 + R() * 0.12) this.noiseHit(tt, 0.06 + R() * 0.04, 'bandpass', 500 + R() * 400, 0.9, 0.03 * k, out, 300, 0.008);
  },

  // ---------------------------------------------------------------- les bêtes
  // la cigogne claque du bec : une crécelle de bois, qui s'emballe puis ralentit
  hfClaquement(k = 1) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, out = this._hfOut(this.amb), n = 18 + ((R() * 10) | 0);
    for (let i = 0, tt = t; i < n; i++) {
      const u = i / n, per = 0.105 - 0.05 * Math.sin(u * Math.PI);
      this.noiseHit(tt, 0.014, 'bandpass', 1500 + R() * 500, 4, 0.05 * k, out);
      this.tone(tt, 'triangle', 720 + R() * 80, 640, 0.02, 0.012 * k, out, 0.001);
      tt += per;
    }
  },
  // le cerf qui brame : un râle grave, qui monte et se casse
  hfBrame(k = 1) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, out = this._hfOut(this.amb), f = 95 + R() * 25, du = 1.4 + R() * 0.8;
    this.cri(t, { dur: du, f: [[0, f], [0.25, f * 1.55], [0.7, f * 1.4], [1, f * 0.8]], rug: [32 + R() * 10, 0.55], vib: [5, 0.02], form: [[[320, 520, 420], 3, 1], [[800, 1100, 900], 5, 0.5], [2100, 7, 0.12]], souffle: [0.35, 700], vol: 0.13 * k, lp: 2200, a: 0.12, r: du * 0.3 }, out);
    for (let i = 0, tt = t + du + 0.25; i < 2 + ((R() * 2) | 0); i++, tt += 0.5 + R() * 0.2) this.cri(tt, { dur: 0.32, f: [[0, f * 1.1], [1, f * 0.85]], rug: [30, 0.6], form: [[400, 3, 1], [900, 5, 0.4]], souffle: [0.4, 600], vol: 0.09 * k, lp: 1800, a: 0.03 }, out);
  },
  // deux bois de cerf qui s'entrechoquent
  hfBois(k = 1) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, out = this._hfOut(this.sfx);
    for (let i = 0, tt = t; i < 2 + ((R() * 3) | 0); i++, tt += 0.07 + R() * 0.12) { this.noiseHit(tt, 0.03, 'bandpass', 1300 + R() * 1200, 2.5, 0.07 * k, out); this.tone(tt, 'sine', 180 + R() * 60, 120, 0.06, 0.03 * k, out, 0.002); }
  },
  // un grand vol d'oiseaux : le froissement des ailes qui passe, et le babil
  hfNuee(k = 1) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, out = this._hfOut(this.amb);
    this.noiseHit(t, 2.2, 'bandpass', 700, 0.7, 0.03 * k, out, 1300, 0.7);
    for (let i = 0; i < 24; i++) { const tt = t + R() * 2.2, f = 2600 + R() * 2600; this.tone(tt, 'sine', f, f * (0.8 + R() * 0.4), 0.03 + R() * 0.04, 0.005 * k, out, 0.003); }
  },
  // des hirondelles qui gazouillent en passant
  hfHirondelle(k = 1) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, out = this._hfOut(this.amb);
    for (let i = 0, tt = t; i < 6 + ((R() * 6) | 0); i++, tt += 0.05 + R() * 0.07) { const f = 3200 + R() * 1800; this.tone(tt, 'sine', f, f * (R() < 0.5 ? 1.25 : 0.8), 0.04 + R() * 0.03, 0.012 * k, out, 0.004); }
  },
  // le chevreuil pris : un cri bref, aigu, plaintif
  hfChevreuil(k = 1) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, out = this._hfOut(this.amb);
    for (let i = 0, tt = t; i < 2; i++, tt += 0.55 + R() * 0.2) { const f = 820 + R() * 120; this.cri(tt, { dur: 0.32, f: [[0, f], [0.3, f * 1.3], [1, f * 0.7]], vib: [11, 0.04], rug: [25, 0.25], form: [[1100, 3, 1], [2300, 5, 0.3]], souffle: [0.2, 1500], vol: 0.07 * k, lp: 3600 }, out); }
  },
  // un essaim : le bourdonnement grave, qui enfle et retombe
  hfEssaim(k = 1) {
    if (!this.ok) return;
    const c = this.ctx, t = this.at(), R = Math.random, out = this._hfOut(this.amb), du = 2.6;
    for (const f of [205 + R() * 10, 232 + R() * 10, 248 + R() * 8]) {
      const o = c.createOscillator(); this.setWave(o, 'sawtooth'); o.frequency.setValueAtTime(f, t); o.frequency.linearRampToValueAtTime(f * (0.97 + R() * 0.06), t + du);
      const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 0.8;
      const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.006 * k, t + 0.8); g.gain.linearRampToValueAtTime(0.0055 * k, t + du - 0.8); g.gain.linearRampToValueAtTime(0.0001, t + du);
      o.connect(bp).connect(g).connect(out); o.start(t); o.stop(t + du + 0.05);
    }
    this.mark(out, t + du + 0.05);
  },
  // un renardeau qui glapit
  hfGlapir(k = 1) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, out = this._hfOut(this.amb);
    for (let i = 0, tt = t; i < 2 + ((R() * 3) | 0); i++, tt += 0.16 + R() * 0.1) { const f = 1100 + R() * 300; this.cri(tt, { dur: 0.09, f: [[0, f], [0.4, f * 1.15], [1, f * 0.75]], form: [[1400, 3, 1], [2800, 5, 0.3]], souffle: [0.2, 2000], vol: 0.045 * k, lp: 4000, a: 0.006 }, out); }
  },
});
