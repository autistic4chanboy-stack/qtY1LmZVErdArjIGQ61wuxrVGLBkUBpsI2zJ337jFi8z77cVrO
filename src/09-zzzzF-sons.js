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

  // des poussins qui piaillent
  hfPiou(k = 1) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, out = this._hfOut(this.amb);
    for (let i = 0, tt = t; i < 5 + ((R() * 5) | 0); i++, tt += 0.09 + R() * 0.15) { const f = 3400 + R() * 900; this.tone(tt, 'sine', f, f * 0.8, 0.07, 0.01 * k, out, 0.004); }
  },
  // un sanglier qui fouille et grogne
  hfGrogne(k = 1) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, out = this._hfOut(this.amb);
    for (let i = 0, tt = t; i < 2 + ((R() * 3) | 0); i++, tt += 0.22 + R() * 0.2) { const f = 70 + R() * 25; this.cri(tt, { type: 'square', dur: 0.16 + R() * 0.1, f: [[0, f * 1.1], [1, f * 0.85]], rug: [34 + R() * 10, 0.7], form: [[380, 3, 1], [900, 5, 0.35]], souffle: [0.45, 600], vol: 0.11 * k, lp: 1800, a: 0.02 }, out); }
  },

  // ---------------------------------------------------------------- la musique des gens (violon, vielle, fifre, voix, tambour, cloches)
  // un air : notes = [[midi | null, durée en temps], …] ; o = { bpm, timbre, vol, bourdon: [midi…], bus } ; renvoie sa durée (s)
  hfAir(notes, o) {
    if (!this.ok) return 0;
    o = o || {};
    const t0 = this.at(0.03), spb = 60 / (o.bpm || 120), out = this._hfOut(o.bus === 'amb' ? this.amb : this.sfx), v = o.vol || 0.05;
    const jeu = this['_hf_' + (o.timbre || 'violon')] || this._hf_violon;
    let t = t0;
    for (const [m, d] of notes) {
      const du = d * spb;
      if (m !== null && m !== undefined) jeu.call(this, t, 440 * Math.pow(2, (m - 69) / 12), du, v, out, o);
      t += du;
    }
    // le bourdon de la vielle (deux cordes graves tenues), le chien qui grince en rythme
    if (o.bourdon) for (const m of o.bourdon) this.cri(t0, { type: 'sawtooth', dur: t - t0 + 0.2, f: [[0, 440 * Math.pow(2, (m - 69) / 12)], [1, 440 * Math.pow(2, (m - 69) / 12)]], form: [[600, 2, 1], [1500, 4, 0.5], [3000, 6, 0.2]], vol: v * 0.35, lp: 3500, a: 0.15, r: 0.25, sus: 1 }, out);
    if (o.chien) for (let tt = t0; tt < t; tt += spb) this.noiseHit(tt, 0.05, 'bandpass', 1800, 2, v * 0.25, out);
    this.mark(out, t + 0.5);
    return t - t0;
  },
  _hf_violon(t, f, du, v, out) { this.cri(t, { type: 'sawtooth', dur: Math.max(0.12, du * 0.94), f: [[0, f * 0.995], [0.15, f], [1, f]], vib: [5.6, 0.006], form: [[480, 2, 1], [1150, 3, 0.75], [2600, 4, 0.35]], souffle: [0.03, 3000], vol: v, lp: 5200, a: Math.min(0.06, du * 0.3), r: du * 0.3, sus: 0.85 }, out); },
  _hf_vielle(t, f, du, v, out) { this.cri(t, { type: 'sawtooth', dur: Math.max(0.1, du * 0.98), f: [[0, f], [1, f]], vib: [5, 0.003], form: [[700, 3, 1], [1600, 5, 0.9], [3200, 6, 0.4]], vol: v, lp: 4200, a: 0.02, r: du * 0.15, sus: 0.95 }, out); },
  _hf_fifre(t, f, du, v, out) { this.cri(t, { type: 'triangle', dur: Math.max(0.08, du * 0.85), f: [[0, f * 1.01], [0.1, f], [1, f]], vib: [6, 0.004], form: [[f * 1.0, 2, 1], [f * 2, 3, 0.2]], souffle: [0.12, f * 2], vol: v, lp: 6000, a: 0.02, r: du * 0.25, sus: 0.9 }, out); },
  _hf_voix(t, f, du, v, out, o) {
    const V = o.voyelle === 'o' ? [[450, 6, 1], [800, 8, 0.5], [2830, 10, 0.12]] : o.voyelle === 'ou' ? [[320, 6, 1], [700, 8, 0.3], [2700, 10, 0.08]] : [[750, 6, 1], [1150, 8, 0.55], [2850, 10, 0.15]];
    this.cri(t, { type: 'sawtooth', dur: Math.max(0.2, du * 1.02), f: [[0, f * 0.99], [0.12, f], [1, f]], vib: [5, 0.008], form: V, souffle: [0.04, 1800], vol: v, lp: 3600, a: Math.min(0.15, du * 0.35), r: du * 0.3, sus: 0.85 }, out);
  },
  _hf_cloche(t, f, du, v, out) {
    for (const [m, a, d] of [[0.5, 0.45, 4.5], [1, 1, 3.2], [1.19, 0.4, 2.4], [1.5, 0.25, 1.8], [2, 0.35, 2], [2.52, 0.12, 1.2], [3, 0.08, 0.9]]) this.tone(t, 'sine', f * m, f * m * 0.998, d * Math.min(1, 0.4 + du), v * a, out, 0.002);
    this.noiseHit(t, 0.03, 'bandpass', f * 4, 1, v * 0.4, out);
  },
  // le tambour : g = grosse caisse, c = caisse claire, '.' = silence ; un temps par lettre
  hfTambour(motif, o) {
    if (!this.ok) return 0;
    o = o || {};
    const t0 = this.at(0.03), spb = 60 / (o.bpm || 120) / 2, out = this._hfOut(this.sfx), v = o.vol || 0.06;
    let t = t0;
    for (const ch of motif) {
      if (ch === 'g') { this.tone(t, 'sine', 120, 60, 0.25, v, out, 0.003); this.noiseHit(t, 0.06, 'lowpass', 400, 0.7, v * 0.5, out); }
      else if (ch === 'c') { this.noiseHit(t, 0.12, 'bandpass', 2200, 0.8, v * 0.7, out); this.tone(t, 'triangle', 220, 180, 0.06, v * 0.3, out, 0.002); }
      else if (ch === 'r') { for (let i = 0; i < 4; i++) this.noiseHit(t + i * spb / 4, 0.05, 'bandpass', 2400, 0.8, v * 0.45, out); }
      t += spb;
    }
    this.mark(out, t + 0.3);
    return t - t0;
  },
  // une cloche d'église d'une hauteur donnée (le glas, le baptême, le tocsin)
  hfCloche(f = 196, k = 1) {
    if (!this.ok) return;
    const t = this.at(), out = this._hfOut(this.amb);
    this._hf_cloche(t, f, 1.5, 0.05 * k, out);
    this.mark(out, t + 5);
  },
  // ---------------------------------------------------------------- les gens
  // un enfant qui pleure : des sanglots hachés
  hfSanglot(k = 1) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, out = this._hfOut(this.voix);
    for (let i = 0, tt = t; i < 3 + ((R() * 3) | 0); i++, tt += 0.28 + R() * 0.25) { const f = 420 + R() * 80; this.cri(tt, { dur: 0.22 + R() * 0.1, f: [[0, f * 1.15], [0.4, f * 1.25], [1, f * 0.8]], vib: [9, 0.03], form: [[700, 4, 1], [1300, 6, 0.4], [2800, 8, 0.1]], souffle: [0.5, 1600], vol: 0.05 * k, lp: 3200, a: 0.02 }, out); }
  },
  // une femme appelle quelqu'un, au loin : deux syllabes tenues, qui retombent
  hfAppel(k = 1) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, out = this._hfOut(this.voix), f = 330 + R() * 40;
    this.cri(t, { dur: 0.35, f: [[0, f], [1, f * 1.08]], vib: [5, 0.01], form: [[450, 5, 1], [850, 7, 0.45], [2800, 9, 0.1]], souffle: [0.08, 1500], vol: 0.07 * k, lp: 3200, a: 0.04 }, out);
    this.cri(t + 0.4, { dur: 0.8, f: [[0, f * 1.12], [0.3, f * 1.15], [1, f * 0.82]], vib: [5, 0.012], form: [[650, 5, 1], [1100, 7, 0.5], [2800, 9, 0.12]], souffle: [0.08, 1500], vol: 0.075 * k, lp: 3200, a: 0.05, r: 0.4 }, out);
  },
  // la foule qui parle (des voix mêlées, sans mots)
  hfFoule(k = 1, n = 4) {
    if (!this.ok) return;
    const R = Math.random;
    for (let i = 0; i < n; i++) this.mumble(0.8 + R() * 0.7, 20 + R() * 40, (R() - 0.5) * 6, 0.3 * k);
  },
  // des coups de poing, un juron étouffé
  hfCoups(k = 1) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, out = this._hfOut(this.sfx);
    for (let i = 0, tt = t; i < 2 + ((R() * 2) | 0); i++, tt += 0.25 + R() * 0.3) { this.tone(tt, 'sine', 110, 55, 0.12, 0.08 * k, out, 0.002); this.noiseHit(tt, 0.05, 'lowpass', 700, 0.7, 0.05 * k, out); }
  },
  // le charivari : casseroles, chaudrons, une corne, des cris
  hfCharivari(k = 1) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, out = this._hfOut(this.sfx);
    for (let i = 0; i < 16; i++) {
      const tt = t + i * 0.19 + R() * 0.06, f = 600 + R() * 900;
      this.noiseHit(tt, 0.08, 'bandpass', 2600 + R() * 1500, 2, 0.04 * k, out);
      for (const m of [1, 1.47, 2.09, 2.76]) this.tone(tt, 'sine', f * m, f * m * 0.99, 0.25 + R() * 0.2, 0.006 * k, out, 0.001);
    }
    this.cri(t + 0.5, { type: 'sawtooth', dur: 1.1, f: [[0, 220], [0.3, 240], [1, 200]], form: [[600, 3, 1], [1300, 5, 0.5]], souffle: [0.3, 900], vol: 0.04 * k, lp: 2400, a: 0.05 }, out);
  },
  // ---------------------------------------------------------------- les routes
  // les sonnailles d'un troupeau : des cloches de tôle, désaccordées, qui se chevauchent
  hfSonnailles(k = 1, n = 10) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, out = this._hfOut(this.amb);
    for (let i = 0; i < n; i++) {
      const tt = t + R() * 2.4, f = 900 + R() * 900;
      for (const [m, a] of [[1, 1], [1.53, 0.5], [2.21, 0.3], [3.1, 0.15]]) this.tone(tt, 'sine', f * m, f * m * 0.995, 0.25 + R() * 0.3, 0.006 * k * a, out, 0.001);
      this.noiseHit(tt, 0.02, 'bandpass', f * 2, 2, 0.008 * k, out);
    }
  },
  // la clochette du rémouleur
  hfClochette(k = 1) {
    if (!this.ok) return;
    const t = this.at(), out = this._hfOut(this.sfx);
    for (let i = 0; i < 6; i++) { const tt = t + i * 0.16, f = 1900 + (i % 2) * 140; for (const [m, a] of [[1, 1], [2.4, 0.4], [3.9, 0.15]]) this.tone(tt, 'sine', f * m, f * m, 0.35, 0.012 * k * a, out, 0.001); }
  },
  // la meule qui crisse sur une lame
  hfMeule(k = 1) {
    if (!this.ok) return;
    const t = this.at(), out = this._hfOut(this.sfx);
    this.noiseHit(t, 1.6, 'bandpass', 3800, 3, 0.025 * k, out, 4600, 0.15);
    this.noiseHit(t, 1.6, 'bandpass', 900, 1.2, 0.012 * k, out, 1100, 0.2);
  },
  // le pas cadencé d'une troupe
  hfPas(k = 1, n = 8, bpm = 110) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, out = this._hfOut(this.amb), sp = 60 / bpm;
    for (let i = 0; i < n; i++) for (let j = 0; j < 3; j++) this.noiseHit(t + i * sp + R() * 0.03, 0.06, 'lowpass', 500, 0.7, 0.02 * k, out);
  },
  // le feu qui ronfle et craque
  hfFeu(k = 1) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, out = this._hfOut(this.amb);
    this.noiseHit(t, 2.6, 'lowpass', 420, 0.6, 0.05 * k, out, 300, 0.6);
    for (let i = 0; i < 14; i++) this.noiseHit(t + R() * 2.5, 0.02, 'bandpass', 1500 + R() * 2500, 1.5, 0.05 * k * R(), out);
  },
});
