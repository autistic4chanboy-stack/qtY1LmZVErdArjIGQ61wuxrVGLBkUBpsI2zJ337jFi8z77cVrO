// ============================================================================
//  BASSE-FOSSE (agent V5) — les sons
//  Peu de nœuds vivants : rien qui dure, des sons courts programmés d'un coup.
//   - les cloches des offices (bronze grave, partiels inharmoniques, longue
//     queue), étouffées quand on les entend d'en haut, à travers la terre ;
//   - le tocsin (coups rapides, plus aigus) quand la ville s'alarme ;
//   - les gouttes, les os qui glissent, un murmure qui compte (souffle filtré) ;
//   - la barre de la portette, la trappe qu'on dégage, la dent qu'on arrache,
//     le mur qui se dissipe (un souffle qui s'éteint).
//  Tout passe par sound.ici(pos, …) quand le son a une place (son 3D du jeu).
// ============================================================================
const sonV5 = {
  ok() { return !!(sound.ok && sound.ctx && sound.B); },
  la(pos, fn) { if (!this.ok()) return; try { if (pos && sound.ici) sound.ici(pos, fn); else fn(); } catch (e) { console.error(e); } },
  // une cloche : f la fondamentale, k le volume, etouffe (0..1 : de la terre entre elle et nous)
  cloche(pos, f, k, etouffe) {
    this.la(pos, () => {
      const t = sound.at(0.02), e = etouffe || 0;
      const out = e > 0 ? sound.lp(lerp(2400, 380, e), sound.sfx) : sound.sfx;
      const v = (k || 1) * (1 - e * 0.55);
      // partiels d'une cloche de bronze : hum, prime, tierce mineure, quinte, octave nominale
      for (const [r, a, d] of [[0.5, 0.5, 7], [1, 1, 5.5], [1.183, 0.55, 4.2], [1.506, 0.35, 3.2], [2.0, 0.4, 2.6], [2.66, 0.16, 1.6]]) sound.tone(t, 'sine', f * r, f * r * 0.998, d, 0.022 * a * v, out, 0.004);
      sound.noiseHit(t, 0.06, 'bandpass', f * 4, 2, 0.02 * v, out);
    });
  },
  // l'office : trois, cinq ou sept coups espacés (n), deux cloches
  office(pos, n, etouffe) {
    if (!this.ok()) return;
    for (let i = 0; i < n; i++) setTimeout(() => this.cloche(pos, i % 2 ? 196 : 174.6, 1, etouffe), i * 2300);
  },
  // le tocsin : des coups rapides, une seule cloche, plus aiguë
  tocsin(pos, n) {
    if (!this.ok()) return;
    for (let i = 0; i < (n || 8); i++) setTimeout(() => this.cloche(pos, 233, 0.75, 0), i * 520);
  },
  // la Cloche du Jour : énorme, grave, longue
  grandeCloche(pos) {
    this.la(pos, () => {
      const t = sound.at(0.02), o = sound.sfx;
      for (const [r, a, d] of [[0.5, 0.6, 12], [1, 1, 9], [1.2, 0.5, 7], [1.5, 0.3, 5], [2, 0.35, 4], [2.5, 0.12, 3]]) sound.tone(t, 'sine', 98 * r, 98 * r * 0.997, d, 0.04 * a, o, 0.006);
      sound.noiseHit(t, 0.12, 'lowpass', 900, 0.8, 0.05, o, 200);
    });
  },
  // une goutte qui tombe dans une flaque, quelque part
  goutte(pos) {
    this.la(pos, () => {
      const t = sound.at(0.01), o = sound.B.amb.inp, f = 900 + Math.random() * 900;
      sound.tone(t, 'sine', f, f * 1.9, 0.05, 0.01, o, 0.002);
      sound.tone(t + 0.04, 'sine', f * 0.6, f * 0.9, 0.08, 0.004, o, 0.003);
    });
  },
  // des os qui glissent dans un mur
  os(pos) {
    this.la(pos, () => {
      const t = sound.at(0.01), o = sound.B.amb.inp;
      for (let i = 0; i < 4; i++) sound.noiseHit(t + i * 0.07 + Math.random() * 0.05, 0.03, 'bandpass', 1800 + Math.random() * 1500, 3, 0.012 / (i + 1), o);
    });
  },
  // un murmure qui compte, très bas (on ne distingue pas les mots)
  murmure(pos) {
    this.la(pos, () => {
      const t = sound.at(0.02), o = sound.B.amb.inp;
      for (let i = 0; i < 5; i++) {
        const d = 0.32 + Math.random() * 0.2;
        sound.noiseHit(t + i * 0.55, d, 'bandpass', 520 + Math.random() * 260, 3.5, 0.008, o, 380, d * 0.4);
        sound.voice(t + i * 0.55, 'triangle', 118 + Math.random() * 10, 110, d, 0.0016, o, { lp: 500 });
      }
    });
  },
  // la barre de la portette qui glisse dans ses anneaux
  barre(pos) {
    this.la(pos, () => {
      const t = sound.at(0.02), o = sound.sfx;
      sound.noiseHit(t, 0.7, 'bandpass', 1400, 2.5, 0.025, o, 900, 0.1);
      sound.noiseHit(t + 0.72, 0.08, 'lowpass', 800, 1, 0.05, o);
      sound.tone(t + 0.72, 'sine', 160, 110, 0.3, 0.03, o);
    });
  },
  // les gravats qu'on dégage
  gravats(pos) {
    this.la(pos, () => {
      const t = sound.at(0.01), o = sound.sfx;
      for (let i = 0; i < 9; i++) sound.noiseHit(t + i * 0.18 + Math.random() * 0.1, 0.09, 'lowpass', 900 + Math.random() * 700, 0.9, 0.035, o, 300);
    });
  },
  // la dent : un craquement sec, puis rien
  dent() {
    if (!this.ok()) return;
    const t = sound.at(0.02), o = sound.sfx;
    sound.noiseHit(t, 0.04, 'highpass', 2600, 1, 0.06, o);
    sound.noiseHit(t + 0.03, 0.12, 'bandpass', 1300, 4, 0.04, o, 700);
    sound.tone(t + 0.02, 'sine', 420, 240, 0.12, 0.02, o);
  },
  // un mur qui n'était pas là : un souffle qui s'éteint, des grains
  illusion(pos) {
    this.la(pos, () => {
      const t = sound.at(0.01), o = sound.sfx;
      sound.noiseHit(t, 1.6, 'bandpass', 700, 0.9, 0.035, o, 140, 0.25);
      for (let i = 0; i < 10; i++) sound.noiseHit(t + 0.1 + Math.random() * 1.2, 0.02, 'highpass', 3000 + Math.random() * 3000, 1, 0.008, o);
    });
  },
  // un pas traînant (les gens d'en bas ne courent pas)
  pas(pos, k) {
    this.la(pos, () => {
      const t = sound.at(0.01), o = sound.sfx;
      sound.noiseHit(t, 0.16, 'lowpass', 600, 0.7, 0.012 * (k || 1), o, 260, 0.05);
    });
  },
  // un cri d'alarme (une voix, rauque, brève)
  cri(pos, aigu) {
    this.la(pos, () => {
      const t = sound.at(0.01), o = sound.sfx, f = aigu ? 330 : 190;
      sound.voice(t, 'sawtooth', f, f * 1.25, 0.22, 0.03, o, { vib: 7, vibDepth: 12, lp: 1600 });
      sound.voice(t + 0.24, 'sawtooth', f * 1.2, f * 0.8, 0.45, 0.026, o, { vib: 5, vibDepth: 18, lp: 1300, lp2: 600 });
    });
  },
};
