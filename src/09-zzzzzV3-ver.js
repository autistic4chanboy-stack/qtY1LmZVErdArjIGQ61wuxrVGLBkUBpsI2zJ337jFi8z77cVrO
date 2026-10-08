// ============================================================================
//  LE VER (agent V3) — les sons
//  Tout est placé dans l'espace (sound.ici) et porte loin : la « distance de
//  référence » est grande pour une bête de cette taille (on l'entend à des
//  centaines de mètres, à peine). Des sons courts, programmés d'un coup :
//  - battement : un coup d'aile (un grand drap qu'on secoue, très grave) ;
//  - cri : l'appel lointain, long, rauque, qui descend (il passe) ;
//  - rugit : l'alerte, plus court et plus dur ; grogne : intrigué, tout bas ;
//  - pique : le vent qui siffle quand il fond ; passage : son ombre sur vous ;
//  - feu : le jet (un souffle de forge, des crépitements) ; crepite : l'herbe ;
//  - respire : son souffle quand il est posé ou qu'il dort ; atterrit, envol ;
//  - chaine : le bout de chaîne qui tinte ; collier : le collier qui s'ouvre ;
//  - ferraille, os : le tas qu'on fouille, la clé qu'on prend ; cloche : le Guet ;
//  - ricochet : une balle sur les écailles ; blesse, meurt.
// ============================================================================
const sonV3 = {
  ok() { return !!(sound.ok && sound.ctx && sound.B); },
  // pos : où ; ref : la distance (m) jusqu'à laquelle le son garde toute sa force
  la(pos, ref, fn, dur) { if (!this.ok() || !pos) return; try { sound.ici(pos, fn, { ref: ref || 30, dur: dur || 2 }); } catch (e) { console.error(e); } },
  // ------------------------------------------------------------- le vol
  battement(pos, d, k) {
    k = k || 1;
    if (d > 650) return;
    this.la(pos, 45, () => {
      const t = sound.at(0.01), o = sound.sfx;
      sound.noiseHit(t, 0.55, 'lowpass', 260, 0.9, 0.11 * k, o, 90, 0.12);
      sound.noiseHit(t + 0.05, 0.4, 'bandpass', 520, 0.8, 0.035 * k, o, 220, 0.08);
      sound.tone(t + 0.04, 'sine', 46, 31, 0.45, 0.07 * k, o, 0.03);
    }, 1);
  },
  pique(pos, d) {
    if (d > 900) return;
    this.la(pos, 60, () => {
      const t = sound.at(0.02), o = sound.sfx;
      sound.noiseHit(t, 2.6, 'bandpass', 700, 1.2, 0.05, o, 1900, 0.9);
      sound.noiseHit(t + 0.4, 2.0, 'lowpass', 300, 0.7, 0.05, o, 150, 0.8);
    }, 3);
  },
  passage(pos, d) {
    this.la(pos, 40, () => {
      const t = sound.at(0.01), o = sound.sfx;
      sound.noiseHit(t, 1.8, 'bandpass', 1400, 0.9, 0.06, o, 260, 0.5);
      sound.noiseHit(t + 0.2, 1.6, 'lowpass', 220, 0.7, 0.07, o, 80, 0.4);
    }, 2);
  },
  // ------------------------------------------------------------- la voix
  cri(pos, d) {
    this.la(pos, 160, () => {
      const t = sound.at(0.02), o = sound.sfx;
      sound.cri(t, { dur: 3.4, f: [[0, 92], [0.18, 128], [0.55, 104], [1, 58]], vib: [5.5, 0.03], rug: [27, 0.55], souffle: [0.22, 900],
        form: [[300, 3, 1], [[640, 520], 4, 0.7], [1450, 6, 0.28], [2600, 8, 0.1]], lp: 2600, vol: 0.13, a: 0.25, r: 1.4, sus: 0.8 }, o);
      sound.noiseHit(t + 0.1, 3.2, 'lowpass', 180, 0.7, 0.05, o, 90, 0.6);
    }, 4);
  },
  rugit(pos, d) {
    this.la(pos, 90, () => {
      const t = sound.at(0.02), o = sound.sfx;
      sound.cri(t, { dur: 2.0, f: [[0, 150], [0.15, 225], [0.6, 160], [1, 82]], vib: [7, 0.04], rug: [38, 0.7], souffle: [0.35, 1300],
        form: [[380, 3, 1], [820, 4, 0.8], [1700, 6, 0.35], [3000, 8, 0.12]], lp: 3600, vol: 0.18, a: 0.08, r: 0.8, sus: 0.85 }, o);
      sound.noiseHit(t, 1.6, 'lowpass', 240, 0.7, 0.08, o, 100, 0.2);
    }, 3);
  },
  grogne(pos, d) {
    if (d > 260) return;
    this.la(pos, 25, () => {
      const t = sound.at(0.02), o = sound.sfx;
      sound.voice(t, 'sawtooth', 52, 44, 1.7, 0.06, o, { vib: 9, vibDepth: 4, lp: 360, lp2: 220 });
      sound.noiseHit(t, 1.5, 'lowpass', 300, 0.6, 0.03, o, 160, 0.4);
    }, 2.2);
  },
  blesse(pos, d) {
    this.la(pos, 80, () => {
      const t = sound.at(0.02), o = sound.sfx;
      sound.cri(t, { dur: 1.4, f: [[0, 260], [0.2, 340], [1, 120]], vib: [9, 0.05], rug: [44, 0.6], souffle: [0.3, 1500],
        form: [[460, 3, 1], [1100, 5, 0.6], [2300, 7, 0.25]], lp: 4200, vol: 0.16, a: 0.03, r: 0.6 }, o);
    }, 2);
  },
  meurt(pos, d) {
    this.la(pos, 140, () => {
      const t = sound.at(0.02), o = sound.sfx;
      sound.cri(t, { dur: 5.5, f: [[0, 210], [0.1, 260], [0.5, 120], [1, 40]], vib: [4, 0.06], rug: [24, 0.6], souffle: [0.3, 800],
        form: [[340, 3, 1], [[760, 420], 4, 0.7], [1500, 6, 0.25]], lp: 2800, vol: 0.18, a: 0.1, r: 3, sus: 0.7 }, o);
    }, 6);
  },
  // ------------------------------------------------------------- le feu
  feu(pos, d, dur) {
    dur = dur || 2;
    this.la(pos, 70, () => {
      const t = sound.at(0.01), o = sound.sfx;
      sound.noiseHit(t, dur + 0.4, 'bandpass', 650, 0.6, 0.16, o, 1500, 0.25);
      sound.noiseHit(t, dur + 0.6, 'lowpass', 220, 0.7, 0.14, o, 120, 0.2);
      sound.tone(t, 'sine', 55, 42, dur, 0.06, o, 0.15);
      for (let i = 0; i < 14; i++) sound.noiseHit(t + 0.2 + Math.random() * dur, 0.03, 'bandpass', 1600 + Math.random() * 2600, 1.3, 0.04, o);
    }, dur + 1);
  },
  crepite(pos) {
    this.la(pos, 6, () => {
      const t = sound.at(0.01), o = sound.sfx;
      for (let i = 0; i < 3; i++) sound.noiseHit(t + Math.random() * 0.3, 0.02, 'bandpass', 1800 + Math.random() * 2500, 1.4, 0.025, o);
      sound.noiseHit(t, 0.35, 'bandpass', 700, 0.6, 0.012, o, 900, 0.1);
    }, 0.6);
  },
  // ------------------------------------------------------------- posé, endormi
  respire(pos, d, dort) {
    this.la(pos, 12, () => {
      const t = sound.at(0.02), o = sound.sfx, k = dort ? 1 : 0.7;
      sound.noiseHit(t, 1.3, 'bandpass', 420, 0.8, 0.035 * k, o, 700, 0.6);           // il inspire
      sound.noiseHit(t + 1.4, 1.8, 'lowpass', 260, 0.7, 0.05 * k, o, 140, 0.4);        // il expire
      if (dort) sound.voice(t + 1.4, 'sawtooth', 38, 34, 1.7, 0.03, o, { vib: 14, vibDepth: 3, lp: 220 }); // un ronflement de forge
    }, 3.5);
  },
  atterrit(pos, d, k) {
    k = k || 1;
    this.la(pos, 60, () => {
      const t = sound.at(0.01), o = sound.sfx;
      sound.noiseHit(t, 0.7, 'lowpass', 160, 0.8, 0.2 * k, o, 60, 0.02);
      sound.tone(t, 'sine', 44, 26, 0.8, 0.12 * k, o, 0.01);
      for (let i = 0; i < 8; i++) sound.noiseHit(t + 0.1 + Math.random() * 0.8, 0.05, 'bandpass', 1500 + Math.random() * 1500, 1.5, 0.03, o);
    }, 2);
  },
  envol(pos, d) {
    for (let i = 0; i < 3; i++) setTimeout(() => this.battement(pos, d, 1.4 - i * 0.15), i * 700);
  },
  chaine(pos, d) {
    if (d > 80) return;
    this.la(pos, 10, () => {
      const t = sound.at(0.01), o = sound.sfx;
      for (let i = 0; i < 4; i++) { const f = 900 + Math.random() * 500; sound.tone(t + i * 0.13 + Math.random() * 0.05, 'sine', f, f * 0.99, 0.5, 0.02, o, 0.002); sound.noiseHit(t + i * 0.13, 0.03, 'bandpass', 2500, 2, 0.02, o); }
    }, 1.5);
  },
  // ------------------------------------------------------------- ce qu'on fait
  collier(pos) {
    this.la(pos, 20, () => {
      const t = sound.at(0.02), o = sound.sfx;
      sound.noiseHit(t, 0.4, 'bandpass', 2400, 4, 0.03, o, 1400);                    // la clé tourne
      sound.noiseHit(t + 0.7, 0.06, 'highpass', 1800, 1, 0.06, o);                   // déclic
      for (const f of [220, 347, 513, 811]) sound.tone(t + 0.75, 'sine', f, f * 0.996, 3.2, 0.03, o, 0.003); // le fer qui sonne
      sound.noiseHit(t + 1.5, 0.9, 'lowpass', 300, 0.8, 0.14, o, 90, 0.01);          // il tombe
    }, 4);
  },
  ferraille(pos) {
    this.la(pos, 8, () => {
      const t = sound.at(0.01), o = sound.sfx;
      for (let i = 0; i < 7; i++) { const f = 600 + Math.random() * 1600; sound.tone(t + Math.random() * 0.6, 'sine', f, f * 0.98, 0.25, 0.018, o, 0.002); sound.noiseHit(t + Math.random() * 0.6, 0.06, 'bandpass', 2200, 1.5, 0.03, o); }
    }, 1.2);
  },
  os(pos) {
    this.la(pos, 4, () => {
      const t = sound.at(0.01), o = sound.sfx;
      for (let i = 0; i < 3; i++) sound.noiseHit(t + i * 0.09, 0.03, 'bandpass', 1300 + i * 400, 2, 0.03, o);
    }, 0.6);
  },
  cloche(pos) {
    this.la(pos, 120, () => {
      const t = sound.at(0.02), o = sound.sfx, f = 147;
      for (const [m, a, d] of [[0.5, 0.5, 8], [1, 1, 6], [1.19, 0.45, 4], [1.5, 0.3, 3], [2, 0.42, 3.4], [2.52, 0.16, 2], [3.01, 0.1, 1.5]]) sound.tone(t, 'sine', f * m, f * m * 0.998, d, 0.06 * a, o, 0.003);
      for (const [m, a, d] of [[1, 0.7, 5], [2, 0.3, 3]]) sound.tone(t + 1.9, 'sine', f * m, f * m * 0.998, d, 0.045 * a, o, 0.003);
      sound.noiseHit(t, 0.05, 'bandpass', 1500, 0.9, 0.04, o);
    }, 8);
  },
  ricochet(pos) {
    this.la(pos, 20, () => {
      const t = sound.at(0.01), o = sound.sfx;
      sound.tone(t, 'sine', 2600, 1700, 0.35, 0.04, o, 0.002);
      sound.noiseHit(t, 0.05, 'highpass', 2200, 1, 0.05, o);
      for (const f of [420, 690]) sound.tone(t, 'sine', f, f * 0.99, 0.9, 0.015, o, 0.002);
    }, 1);
  },
};
