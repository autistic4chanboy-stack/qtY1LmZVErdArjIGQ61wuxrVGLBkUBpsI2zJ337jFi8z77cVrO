// ============================================================================
//  AUDIO (FERME) : cloche, portes, voix des habitants, bêtes, pêche, arc,
//  horreur discrète, ambiances propres à chaque biome (jamais de souffle continu)
// ============================================================================

Object.assign(SoundEngine.prototype, {
  // ---------------------------------------------------------------- utilitaires
  at(delay) { return this.ctx.currentTime + (delay || 0) + 0.01; },
  lp(freq, dest) { const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq; f.connect(dest || this.sfx); return f; },

  // ---------------------------------------------------------------- cloche de l'église (sons partiels, longue résonance)
  bell(k = 1) {
    if (!this.ok) return;
    const t = this.at(), out = this.lp(2400, this.amb), v = 0.07 * k;
    for (const [f, a, d] of [[220, 1, 4.5], [440, 0.5, 3], [528, 0.35, 2.4], [660, 0.25, 2], [880, 0.12, 1.4]]) this.tone(t, 'sine', f, f * 0.998, d, v * a, out, 0.004);
  },
  // ---------------------------------------------------------------- portes, serrures
  door(open) { if (!this.ok) return; const t = this.at(); this.voice(t, 'sawtooth', open ? 180 : 240, open ? 120 : 160, open ? 0.35 : 0.18, 0.018, this.sfx, { lp: 700 }); this.noiseHit(t + (open ? 0.3 : 0.12), 0.06, 'lowpass', 500, 0.8, 0.12); },
  lock(on) { if (!this.ok) return; const t = this.at(); this.tone(t, 'square', on ? 900 : 700, on ? 600 : 1000, 0.03, 0.04); this.noiseHit(t + 0.05, 0.03, 'bandpass', 2400, 2, 0.06); },
  knock(n = 3) { if (!this.ok) return; const t = this.at(); for (let i = 0; i < n; i++) { this.noiseHit(t + i * 0.32, 0.07, 'lowpass', 420, 0.8, 0.3); this.tone(t + i * 0.32, 'sine', 120, 70, 0.08, 0.25); } },
  chain() { if (!this.ok) return; const t = this.at(), out = this.lp(1800, this.amb); for (let i = 0; i < 14; i++) this.tone(t + i * 0.12, 'square', 700 + Math.random() * 300, 500, 0.04, 0.012, out); },
  scratch() { if (!this.ok) return; const t = this.at(); for (let i = 0; i < 6; i++) this.noiseHit(t + i * 0.09, 0.08, 'bandpass', 1800 + i * 90, 3, 0.03); },
  // ---------------------------------------------------------------- voix : murmure syllabique (pas de mots)
  mumble(pitch = 1, len = 30, pan = 0, vol = 1) {
    if (!this.ok) return;
    const n = clamp(Math.round(len / 9), 2, 9), t = this.at(), p = this.pan(clamp(pan / 8, -0.8, 0.8));
    const base = 150 * pitch;
    for (let i = 0; i < n; i++) {
      const st = t + i * (0.11 + Math.random() * 0.05), f = base * (0.9 + Math.random() * 0.35);
      this.voice(st, 'triangle', f, f * (0.85 + Math.random() * 0.3), 0.09 + Math.random() * 0.05, 0.022 * vol, p, { bp: 900 * pitch, q: 1.4 });
    }
  },
  hurtHuman(pitch = 1) { if (!this.ok) return; const t = this.at(); this.voice(t, 'sawtooth', 320 * pitch, 180 * pitch, 0.35, 0.06, this.sfx, { bp: 900, q: 1 }); },
  scream(pitch = 1) {
    if (!this.ok) return;
    const t = this.at(), out = this.lp(2600, this.amb);
    this.voice(t, 'sawtooth', 700 * pitch, 260 * pitch, 1.1, 0.06, out, { vib: 29, vibDepth: 70, bp: 1300, q: 0.8 });
  },
  // ---------------------------------------------------------------- joueur
  hurt(dmg) { if (!this.ok) return; const t = this.at(); this.tone(t, 'sine', 130, 60, 0.2, 0.25); this.voice(t, 'sawtooth', 210, 140, 0.25, 0.05, this.sfx, { bp: 700, q: 1.2 }); },
  breath(k) { if (!this.ok) return; const t = this.at(); this.noiseHit(t, 0.35, 'bandpass', 700, 1.5, 0.025 * k); this.noiseHit(t + 0.4, 0.3, 'bandpass', 520, 1.5, 0.02 * k); },
  eat() { if (!this.ok) return; const t = this.at(); for (let i = 0; i < 3; i++) this.noiseHit(t + i * 0.16, 0.05, 'bandpass', 1300, 2, 0.06); },
  equip() { if (!this.ok) return; this.noiseHit(this.at(), 0.05, 'bandpass', 1800, 1.5, 0.04); },
  swish(k = 1) { if (!this.ok) return; this.noiseHit(this.at(), 0.16, 'bandpass', 1400, 1.2, 0.05 * k, null, 500); },
  pop2() { this.pop(); },
  tick() { if (!this.ok) return; this.tone(this.at(), 'sine', 1500, 1900, 0.03, 0.025); },
  coin() { if (!this.ok) return; const t = this.at(); this.tone(t, 'triangle', 1900, 1900, 0.08, 0.05); this.tone(t + 0.07, 'triangle', 2500, 2500, 0.14, 0.05); },
  quest(done) { if (!this.ok) return; const t = this.at(); const f = done ? [523, 659, 784] : [440, 554]; f.forEach((x, i) => this.tone(t + i * 0.12, 'triangle', x, x, 0.3, 0.04)); },
  page() { if (!this.ok) return; this.noiseHit(this.at(), 0.18, 'bandpass', 3200, 0.8, 0.03, null, 1400); },
  // ---------------------------------------------------------------- travaux
  dig(k = 1) { if (!this.ok) return; const t = this.at(); this.noiseHit(t, 0.12, 'lowpass', 500, 0.9, 0.16 * k); this.tone(t, 'sine', 90, 55, 0.1, 0.12 * k); },
  plant() { if (!this.ok) return; this.noiseHit(this.at(), 0.08, 'lowpass', 700, 0.8, 0.07); },
  pour() { if (!this.ok) return; const t = this.at(); for (let i = 0; i < 6; i++) this.tone(t + i * 0.04, 'sine', 900 + Math.random() * 900, 600, 0.05, 0.012); },
  scythe() { if (!this.ok) return; this.noiseHit(this.at(), 0.25, 'bandpass', 2600, 0.8, 0.05, null, 1200); },
  place() { if (!this.ok) return; const t = this.at(); this.noiseHit(t, 0.06, 'lowpass', 600, 0.8, 0.12); this.tone(t, 'sine', 160, 90, 0.07, 0.12); },
  // couvercle qui grince puis objets qui s'entrechoquent
  lootOpen() { if (!this.ok) return; const t = this.at(); this.voice(t, 'sawtooth', 240, 180, 0.22, 0.012, this.sfx, { bp: 900, q: 3 }); this.noiseHit(t + 0.18, 0.08, 'lowpass', 900, 0.8, 0.08); this.tone(t + 0.26, 'triangle', 1400, 1400, 0.06, 0.02); },
  // feuillage secoué
  shake() { if (!this.ok) return; const t = this.at(); for (let i = 0; i < 4; i++) this.noiseHit(t + i * 0.07, 0.12, 'bandpass', 2200 + i * 200, 0.7, 0.03, null, 900); },
  treeFall() { if (!this.ok) return; const t = this.at(); this.voice(t, 'sawtooth', 90, 50, 1.2, 0.03, this.sfx, { lp: 300 }); this.noiseHit(t + 1.1, 0.5, 'lowpass', 300, 0.7, 0.25); },
  // ---------------------------------------------------------------- pêche et arc
  cast() { if (!this.ok) return; const t = this.at(); this.noiseHit(t, 0.2, 'bandpass', 2400, 0.8, 0.04, null, 900); this.noiseHit(t + 0.45, 0.2, 'lowpass', 900, 0.7, 0.07); },
  bite() { if (!this.ok) return; const t = this.at(); this.noiseHit(t, 0.12, 'lowpass', 1100, 0.7, 0.12); this.tone(t, 'sine', 300, 150, 0.08, 0.06); },
  reel(k = 1) { if (!this.ok) return; const t = this.at(); for (let i = 0; i < 8; i++) this.tone(t + i * 0.035, 'square', 1500, 1400, 0.012, 0.012 * k); },
  catchFish() { if (!this.ok) return; const t = this.at(); this.splash(); this.tone(t + 0.1, 'triangle', 660, 990, 0.18, 0.04); },
  bowDraw() { if (!this.ok) return; this.voice(this.at(), 'sawtooth', 110, 170, 0.6, 0.015, this.sfx, { lp: 600 }); },
  bowShot() { if (!this.ok) return; const t = this.at(); this.tone(t, 'triangle', 220, 90, 0.12, 0.12); this.noiseHit(t, 0.18, 'bandpass', 2000, 0.8, 0.05, null, 700); },
  // ---------------------------------------------------------------- bêtes
  hoof(mat, speed) { if (!this.ok) return; const t = this.at(), v = 0.07; for (let i = 0; i < 2; i++) { this.tone(t + i * 0.09, 'sine', 140, 70, 0.06, v); this.noiseHit(t + i * 0.09, 0.04, 'lowpass', mat === 'hard' ? 1800 : 600, 1, v * 0.6); } },
  whistle() { if (!this.ok) return; const t = this.at(); this.tone(t, 'sine', 1800, 2400, 0.25, 0.05); this.tone(t + 0.3, 'sine', 2400, 1700, 0.35, 0.05); },
  bark(k = 1, pan = 0) { if (!this.ok) return; const t = this.at(), p = this.pan(clamp(pan / 20, -0.9, 0.9)); this.voice(t, 'sawtooth', 420, 260, 0.13, 0.05 * k, p, { bp: 900, q: 1.3 }); },
  growl(k = 1) { if (!this.ok) return; this.voice(this.at(), 'sawtooth', 90, 70, 0.8, 0.04 * k, this.sfx, { vib: 23, vibDepth: 12, lp: 500 }); },
  howl(d = 50) { if (!this.ok) return; const k = clamp(1 - d / 150, 0.1, 1), t = this.at(); this.voice(t, 'sine', 380, 560, 1.6, 0.03 * k, this.lp(1500, this.amb), { vib: 5, vibDepth: 12 }); },
  crow(k = 1) { if (!this.ok) return; const t = this.at(), p = this.pan(Math.random() * 2 - 1, this.amb); for (let i = 0; i < 2 + (Math.random() * 2 | 0); i++) this.voice(t + i * 0.28, 'sawtooth', 620, 480, 0.2, 0.035 * k, p, { bp: 1100, q: 2 }); },
  hurtAnimal(kind) { if (!this.ok) return; this.voice(this.at(), 'sawtooth', 520, 300, 0.25, 0.05, this.sfx, { bp: 1200, q: 1.5 }); },
  frog(k = 1) { if (!this.ok) return; const t = this.at(), p = this.pan(Math.random() * 2 - 1, this.amb); for (let i = 0; i < 2; i++) this.voice(t + i * 0.14, 'square', 190, 150, 0.09, 0.012 * k, p, { bp: 600, q: 3 }); },
  woodpecker() { if (!this.ok) return; const t = this.at(), p = this.pan(Math.random() * 2 - 1, this.amb); for (let i = 0; i < 12; i++) this.noiseHit(t + i * 0.055, 0.015, 'bandpass', 1500, 3, 0.02, p); },
  lap(k = 1) { if (!this.ok) return; const t = this.at(), p = this.pan(Math.random() * 2 - 1, this.amb); this.noiseHit(t, 0.4, 'lowpass', 380, 0.7, 0.03 * k, p, 180); },
  bubble() { if (!this.ok) return; const t = this.at(), p = this.pan(Math.random() * 2 - 1, this.amb); this.tone(t, 'sine', 300 + Math.random() * 200, 700, 0.06, 0.012, p); },
  eagle() { if (!this.ok) return; this.voice(this.at(), 'sine', 1800, 1300, 0.9, 0.012, this.pan(Math.random() * 2 - 1, this.amb), { vib: 11, vibDepth: 60 }); },
  drip() { if (!this.ok) return; const t = this.at(), f = 900 + Math.random() * 900; this.tone(t, 'sine', f, f * 1.6, 0.05, 0.03, this.pan(Math.random() * 2 - 1, this.amb)); },
  anvil() { if (!this.ok) return; const t = this.at(); for (const f of [1500, 2300, 3100]) this.tone(t, 'sine', f, f, 0.5, 0.012, this.lp(3500, this.amb)); },
  // ---------------------------------------------------------------- horreur (courts, jamais en boucle)
  glitchSnd(k) {
    if (!this.ok) return;
    const t = this.ctx.currentTime;
    for (let i = 0; i < 3 + k * 3; i++) this.tone(t + i * 0.045, 'square', 200 + Math.random() * 1800, 100 + Math.random() * 600, 0.035, 0.02 * Math.min(1.5, k), this.sfx, 0.002);
  },
  whisper(pan = 0, k = 0.5) {
    if (!this.ok) return;
    const t = this.at(), p = this.pan(pan, this.amb);
    for (let i = 0; i < 5; i++) this.noiseHit(t + i * 0.13, 0.1, 'bandpass', 1600 + Math.random() * 1400, 4, 0.012 * k, p);
    this.voice(t, 'sine', 180, 140, 0.8, 0.008 * k, p, { lp: 400 });
  },
  heartbeat(k) {
    if (!this.ok) return;
    const t = this.ctx.currentTime;
    this.tone(t, 'sine', 62, 40, 0.14, 0.3 * k); this.tone(t + 0.22, 'sine', 55, 38, 0.16, 0.24 * k);
  },
  steps1(k, pan) {
    if (!this.ok) return;
    const t = this.at(), p = this.pan(clamp(pan / 15, -0.9, 0.9));
    this.noiseHit(t, 0.12, 'lowpass', 380, 0.7, 0.16 * k, p); this.tone(t, 'sine', 70, 40, 0.14, 0.18 * k, p);
  },
  stab() { if (!this.ok) return; const t = this.at(); this.noiseHit(t, 0.12, 'bandpass', 1800, 1.2, 0.2); this.tone(t, 'sine', 90, 40, 0.3, 0.3); },
  redNight() { if (!this.ok) return; const t = this.at(), out = this.lp(500, this.amb); this.voice(t, 'sine', 55, 52, 6, 0.05, out); this.voice(t + 0.5, 'sine', 82, 78, 5, 0.03, out); },
  enversShift(on) { if (!this.ok) return; const t = this.at(); this.voice(t, 'sawtooth', on ? 400 : 60, on ? 60 : 400, 1.2, 0.04, this.lp(900)); },
  silence(sec) { if (!this.ctx) return; this.amb.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2); setTimeout(() => this.setAmbient(this.ambVolume), sec * 1000); },

  // ---------------------------------------------------------------- ambiance par biome
  // E : { biome, day, night, rain, inside, under, envers, red, town, tension }
  biomeAmb(dt, E) {
    if (!this.ok) return;
    this.bT = (this.bT || 2) - dt;
    if (this.bT > 0) return;
    this.bT = 1.2 + Math.random() * 2.5;
    const r = Math.random(), calm = E.rain < 0.4;
    if (E.envers) { if (r < 0.3) this.whisper(Math.random() * 2 - 1, 0.35); else if (r < 0.45) this.voice(this.at(), 'sine', 48, 46, 4, 0.03, this.lp(300, this.amb)); return; }
    if (E.under) { if (r < 0.5) this.drip(); return; }
    if (E.red) { if (r < 0.12) this.whisper(Math.random() * 2 - 1, 0.25); return; }
    switch (E.biome) {
      case 'foret': case 'bouleaux':
        if (E.day > 0.5 && calm && r < 0.12) this.woodpecker();
        if (E.night > 0.5 && r < 0.05) this.owl();
        break;
      case 'marais':
        if (r < 0.45) this.frog(E.night > 0.5 ? 1 : 0.6);
        if (r > 0.8) this.bubble();
        break;
      case 'lac':
        if (r < 0.5) this.lap(0.8);
        if (E.day > 0.5 && r > 0.93) this.animal('duck', Math.random() * 2 - 1, 0.5);
        break;
      case 'hauteurs':
        if (E.day > 0.5 && calm && r < 0.06) this.eagle();
        break;
      case 'ville':
        if (E.day > 0.5 && !E.inside && r < 0.18) this.mumble(0.8 + Math.random() * 0.8, 20, (Math.random() - 0.5) * 12, 0.35);
        if (E.day > 0.5 && r > 0.92 && E.forge) this.anvil();
        break;
    }
  },
});
