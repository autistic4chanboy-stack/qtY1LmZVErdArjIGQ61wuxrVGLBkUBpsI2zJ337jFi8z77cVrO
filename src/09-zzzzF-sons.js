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
});
