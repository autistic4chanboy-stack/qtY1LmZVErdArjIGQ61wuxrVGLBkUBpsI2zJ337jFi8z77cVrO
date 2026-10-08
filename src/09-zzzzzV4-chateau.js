// ============================================================================
//  LE CHÂTEAU DES HAUTS — HAUTGUET (agent V4) — les sons
//  Des sons courts, programmés d'un coup (pas de nœud qui vive plus de quelques
//  secondes) : les chaînes du pont-levis, le cliquet de la herse, la cloche de la
//  chapelle, les pierres d'un mur creux qui cèdent, la grille de fer, le Guet qui
//  prend. Chacun se place dans l'espace (sound.ici) quand on lui donne une position.
//  API : sound.v4Chaines(pos, dur), v4Herse(pos), v4Cloche(pos, k), v4Pierre(pos),
//        v4Creux(pos), v4Grille(pos), v4Guet(pos), v4Pas(pos) (des pas, loin, dans le vide).
// ============================================================================
Object.assign(SoundEngine.prototype, {
  v4Ici(pos, fn) { if (!this.ok || !this.ctx) return; try { if (pos && this.ici) this.ici(pos, fn); else fn(); } catch (e) { console.error(e); } },
  // le pont-levis qui descend : les chaînes qui filent, le bois qui gémit, le choc du tablier
  v4Chaines(pos, dur) {
    this.v4Ici(pos, () => {
      const t = this.at(0.02), o = this.sfx, R = Math.random, D = dur || 5;
      for (let i = 0; i < D * 9; i++) { const tt = t + i / 9 + R() * 0.04, f = 700 + R() * 700; this.tone(tt, 'triangle', f, f * 0.97, 0.05, 0.018, o, 0.002); if (i % 3 === 0) this.noiseHit(tt, 0.04, 'bandpass', 2600, 3, 0.012, o); }
      this.voice(t + 0.4, 'sawtooth', 70, 52, D * 0.8, 0.02, o, { vib: 2.5, vibDepth: 5, lp: 380 });
      this.noiseHit(t + D, 0.6, 'lowpass', 260, 0.7, 0.16, o, 70, 0.005);
      this.tone(t + D, 'sine', 58, 36, 0.9, 0.12, o, 0.005);
    });
  },
  // la herse qui monte : le cliquet, cran par cran, la chaîne, le fer qui racle
  v4Herse(pos) {
    this.v4Ici(pos, () => {
      const t = this.at(0.02), o = this.sfx, R = Math.random;
      for (let i = 0; i < 16; i++) { const tt = t + i * 0.22 + R() * 0.03; this.noiseHit(tt, 0.03, 'bandpass', 3200, 4, 0.03, o); this.tone(tt, 'square', 1500, 1100, 0.02, 0.008, o, 0.001); }
      this.noiseHit(t, 3.6, 'bandpass', 1300, 2.5, 0.012, o, 1700, 0.4);
      this.tone(t + 3.7, 'triangle', 420, 400, 0.6, 0.02, o, 0.002);
    });
  },
  // la cloche de la chapelle : un coup, long, des partiels inharmoniques
  v4Cloche(pos, k) {
    this.v4Ici(pos, () => {
      const t = this.at(0.02), o = this.lp(4200, this.sfx), v = 0.06 * (k || 1);
      for (const [m, g, d] of [[0.5, 0.7, 7], [1, 1, 6], [1.19, 0.45, 4], [1.5, 0.35, 3.5], [2, 0.3, 3], [2.51, 0.18, 2.2], [3.02, 0.1, 1.6]]) this.tone(t, 'sine', 196 * m, 196 * m * 0.997, d, v * g, o, 0.003);
      this.noiseHit(t, 0.05, 'bandpass', 2400, 2, 0.05 * (k || 1), o);
    });
  },
  // un mur creux qui cède : des pierres qui tombent, un choc sourd, de la poussière
  v4Pierre(pos) {
    this.v4Ici(pos, () => {
      const t = this.at(0.02), o = this.sfx, R = Math.random;
      this.noiseHit(t, 0.5, 'lowpass', 500, 0.8, 0.12, o, 120, 0.004);
      this.tone(t, 'sine', 70, 42, 0.5, 0.08, o, 0.004);
      for (let i = 0; i < 9; i++) this.noiseHit(t + 0.08 + R() * 0.9, 0.06 + R() * 0.08, 'bandpass', 600 + R() * 1400, 1.5, 0.03 + R() * 0.03, o);
    });
  },
  // frapper la pierre : deux coups, et le vide qui répond
  v4Creux(pos) {
    this.v4Ici(pos, () => {
      const t = this.at(0.01), o = this.sfx;
      for (let i = 0; i < 2; i++) { this.noiseHit(t + i * 0.34, 0.08, 'bandpass', 700, 2, 0.06, o); this.tone(t + i * 0.34, 'sine', 160, 120, 0.35, 0.05, o, 0.002); this.tone(t + i * 0.34, 'sine', 330, 300, 0.25, 0.012, o, 0.002); }
    });
  },
  // une grille de fer qu'on tire, des verrous
  v4Grille(pos) {
    this.v4Ici(pos, () => {
      const t = this.at(0.02), o = this.sfx;
      this.noiseHit(t, 0.12, 'bandpass', 2200, 3, 0.04, o); this.noiseHit(t + 0.3, 0.12, 'bandpass', 2000, 3, 0.04, o);
      this.noiseHit(t + 0.6, 1.0, 'bandpass', 1500, 2.5, 0.025, o, 900, 0.1);
      this.tone(t + 1.6, 'triangle', 520, 500, 0.5, 0.03, o, 0.002);
    });
  },
  // le Guet qui prend : un souffle énorme, puis des craquements
  v4Guet(pos) {
    this.v4Ici(pos, () => {
      const t = this.at(0.02), o = this.sfx, R = Math.random;
      this.noiseHit(t, 2.2, 'bandpass', 700, 0.7, 0.1, o, 2400, 0.6);
      this.noiseHit(t + 0.8, 3.0, 'lowpass', 400, 0.7, 0.06, o, 200, 0.5);
      for (let i = 0; i < 18; i++) this.noiseHit(t + 0.6 + R() * 3, 0.02, 'bandpass', 1500 + R() * 2500, 1.4, 0.04, o);
    });
  },
  // des pas, au loin, dans une salle vide (l'ambiance du château, rarement)
  v4Pas(pos) {
    this.v4Ici(pos, () => {
      const t = this.at(0.02), o = this.lp(1600, this.sfx), R = Math.random, n = 3 + Math.floor(R() * 4);
      for (let i = 0; i < n; i++) { const tt = t + i * (0.55 + R() * 0.1); this.noiseHit(tt, 0.07, 'lowpass', 420, 0.8, 0.03, o, 160); this.tone(tt, 'sine', 90, 70, 0.08, 0.012, o, 0.002); }
    });
  },
});
