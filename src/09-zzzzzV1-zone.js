// ============================================================================
//  LA GRANDE PORTE ET LES TERRES D'AVANT (agent V1) — les sons
//  Peu de nœuds vivants : un souffle de vent tenu (un seul, en fondu) dans la
//  Zone, et des sons courts, rares, programmés d'un coup (grincements lointains,
//  une cloche fêlée très loin, un craquement de bois mort). La Porte : la barre
//  qui retombe, le vantail qui roule, la clé. Le feu de veille. La discrétion :
//  le caillou qui tombe, l'alerte (un souffle bref, pas de musique).
// ============================================================================
const sonV1 = {
  vent: null, prochain: 4,
  ok() { return !!(sound.ok && sound.ctx && sound.B); },
  la(pos, fn) { if (!this.ok()) return; try { if (pos && sound.ici) sound.ici(pos, fn); else fn(); } catch (e) { console.error(e); } },
  // la barre de fer qui retombe (ou qu'on retire) : un coup sourd, puis le fer qui sonne
  barre(pos, fermee, d) {
    const k = clamp(1.2 - (d || 0) / 600, 0.25, 1);
    this.la(pos, () => {
      const t = sound.at(0.02), o = sound.sfx;
      sound.noiseHit(t, 0.35, 'lowpass', 700, 0.8, 0.09 * k, o, 140);
      sound.tone(t, 'sine', 62, 44, 0.9, 0.07 * k, o);
      for (const f of fermee ? [233, 377, 611] : [311, 503]) sound.tone(t + 0.02, 'sine', f, f * 0.995, 1.8, 0.008 * k, o, 0.004);
    });
  },
  // on frappe au vantail : le bois répond à peine
  frappe(pos) { this.la(pos, () => { const t = sound.at(0.01), o = sound.sfx; for (let i = 0; i < 2; i++) { sound.noiseHit(t + i * 0.32, 0.12, 'lowpass', 380, 1.1, 0.07, o, 160); sound.tone(t + i * 0.32, 'sine', 95, 70, 0.25, 0.04, o); } }); },
  // la clé : un raclement de fer, puis un déclic énorme
  cle(pos) {
    this.la(pos, () => {
      const t = sound.at(0.02), o = sound.sfx;
      sound.noiseHit(t, 0.5, 'bandpass', 2400, 4, 0.02, o, 1500);
      sound.noiseHit(t + 0.6, 0.06, 'highpass', 2000, 1, 0.05, o);
      sound.tone(t + 0.62, 'sine', 140, 90, 0.4, 0.06, o);
      sound.noiseHit(t + 0.62, 0.5, 'lowpass', 600, 0.7, 0.06, o, 120);
    });
  },
  // le vantail qui roule sur ses gonds : un long grincement grave
  vantail(pos) {
    this.la(pos, () => {
      const t = sound.at(0.02), o = sound.sfx;
      sound.voice(t, 'sawtooth', 58, 41, 2.6, 0.035, o, { vib: 3, vibDepth: 6, lp: 420, lp2: 260 });
      sound.voice(t + 0.3, 'sawtooth', 120, 96, 1.8, 0.012, o, { vib: 9, vibDepth: 14, lp: 900 });
      sound.noiseHit(t, 2.6, 'lowpass', 300, 0.6, 0.05, o, 120, 0.6);
    });
  },
  // le feu de veille prend : un souffle, des crépitements
  feu(pos) {
    this.la(pos, () => {
      const t = sound.at(0.02), o = sound.sfx;
      sound.noiseHit(t, 0.9, 'bandpass', 900, 0.8, 0.05, o, 2200, 0.25);
      for (let i = 0; i < 9; i++) sound.noiseHit(t + 0.4 + Math.random() * 1.6, 0.02, 'bandpass', 1500 + Math.random() * 2500, 1.4, 0.03, o);
    });
  },
  // un caillou qui tombe et roule (la diversion)
  caillou(pos, dur) {
    this.la(pos, () => {
      const t = sound.at(0.01), o = sound.sfx, k = dur ? 1 : 0.7;
      sound.noiseHit(t, 0.05, 'bandpass', 2600, 2, 0.06 * k, o);
      sound.tone(t, 'sine', 1900, 1500, 0.05, 0.02 * k, o);
      for (let i = 1; i < 4; i++) sound.noiseHit(t + i * 0.11 + Math.random() * 0.04, 0.03, 'bandpass', 2200 + i * 300, 2, 0.03 * k / i, o);
    });
  },
  // une créature vous a vu : un souffle bref et grave, presque rien
  alerte(k) {
    if (!this.ok()) return;
    const t = sound.at(0.01), o = sound.sfx, v = k || 1;
    sound.noiseHit(t, 0.5, 'lowpass', 500, 0.7, 0.05 * v, o, 180, 0.08);
    sound.tone(t, 'sine', 73, 55, 0.7, 0.05 * v, o, 0.03);
  },
  // ------------------------------------------------------------- l'ambiance de la Zone (appelée à la place de celle des milieux)
  ambiance(dt, E) {
    if (!this.ok()) return;
    const c = sound.ctx;
    if (!this.vent) {
      const src = c.createBufferSource(); src.buffer = sound.brown || sound.noise; src.loop = true;
      const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 340; bp.Q.value = 0.7;
      const g = c.createGain(); g.gain.value = 0.0001;
      const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 160; lfo.connect(lg).connect(bp.frequency);
      src.connect(bp).connect(g).connect(sound.B.amb.inp);
      src.start(); lfo.start();
      g.gain.setTargetAtTime(0.05, c.currentTime, 2.5);
      this.vent = { src, g, lfo };
    }
    this.coupeT = 1.5;
    this.prochain -= dt;
    if (this.prochain > 0) return;
    this.prochain = 9 + Math.random() * 18;
    const p = game.player.pos, a = Math.random() * TAU, d = 60 + Math.random() * 120, pos = [p[0] + Math.cos(a) * d, p[1] + 8, p[2] + Math.sin(a) * d];
    const r = Math.random();
    this.la(pos, () => {
      const t = sound.at(0.02), o = sound.B.amb.inp;
      if (r < 0.35) sound.voice(t, 'sawtooth', 150 + Math.random() * 60, 110, 1.2 + Math.random(), 0.006, o, { vib: 6, vibDepth: 18, lp: 700 }); // un grincement de bois
      else if (r < 0.55) for (const [f, k] of [[311, 1], [397, 0.5], [622, 0.25]]) sound.tone(t, 'sine', f, f * 0.996, 4.5, 0.0035 * k, o, 0.01); // une cloche fêlée, très loin
      else if (r < 0.75) sound.noiseHit(t, 0.18, 'lowpass', 900, 0.8, 0.02, o, 300); // du bois mort qui casse
      else sound.voice(t, 'triangle', 92, 70, 2.4, 0.005, o, { vib: 2, vibDepth: 5, lp: 300 }); // une plainte, au loin
    });
  },
  // hors de la Zone : le vent se tait
  update(dt) {
    if (!this.vent) return;
    this.coupeT = (this.coupeT || 0) - dt;
    if (this.coupeT > 0 && zone.dedans) return;
    const V = this.vent, t = sound.ctx.currentTime;
    this.vent = null;
    try { V.g.gain.setTargetAtTime(0.0001, t, 0.8); V.src.stop(t + 4); V.lfo.stop(t + 4); } catch (e) { /* déjà arrêté */ }
  },
};
