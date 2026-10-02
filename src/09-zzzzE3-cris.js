// ============================================================================
//  LES BÊTES DES BOIS ET DU MARAIS (agent E3) : leurs cris — synthétisés, doux,
//  rares (les comportements les espacent : 11-zzzzE3-betes.js). Chaque cri est
//  placé sur la bête (son 3D : this.pan(bête, …)) et passe par le bus de
//  l'ambiance. Les oiseaux qu'on n'entend que de loin (sans bête) sont à
//  l'agent S ; le chœur des rainettes aussi (ici : une rainette, de près).
//  sound.e3Cri(kind, position, k) — k : 0..1 (la distance, déjà comptée).
// ============================================================================
Object.assign(SoundEngine.prototype, {
  e3Cri(kind, pos, k) {
    if (!this.ok) return;
    const t = this.at ? this.at() : this.ctx.currentTime + 0.02, v = clamp(k === undefined ? 1 : k, 0, 1.5), R = Math.random;
    // les oiseaux chantent chacun leur tour (ceux qui reviennent d'eux-mêmes attendent qu'un autre se taise)
    const dur = E3_CRI_OISEAU[kind];
    if (dur !== undefined) {
      if ((this.oiseauxFin || 0) > t + 0.3 && E3_CRI_PATIENT.has(kind)) return;
      this.oiseauxFin = Math.max(this.oiseauxFin || 0, t + dur);
    }
    const p = this.pan(pos || 0, this.amb);
    switch (kind) {
      case 'raire': // le daim mâle : un grognement rauque, deux ou trois fois
        for (let i = 0, n = 2 + ((R() * 2) | 0); i < n; i++) this.cri(t + i * (0.75 + R() * 0.2), { dur: 0.45 + R() * 0.1, f: [[0, 92], [0.3, 108], [1, 78]], rug: [28, 0.6], form: [[340, 3, 1], [820, 4, 0.35]], souffle: [0.35, 600], vol: 0.07 * v, lp: 1300, a: 0.04 }, p);
        return;
      case 'kiak': // l'autour : « kia-kia-kia »
        for (let i = 0; i < 5; i++) this.voice(t + i * 0.14, 'sawtooth', 1320 - i * 20, 1150, 0.09, 0.028 * v, p, { bp: 1700, q: 2 });
        return;
      case 'pic_noir': // le cri plaintif du pic noir, qui traîne
        this.voice(t, 'triangle', 1550, 1500, 0.08, 0.02 * v, p, { bp: 1600, q: 1.2 });
        this.voice(t + 0.14, 'triangle', 1500, 1180, 0.65, 0.026 * v, p, { vib: 6, vibDepth: 12, bp: 1400, q: 1.2 });
        return;
      case 'pic_noir_vol': // en vol : « krri-krri-krri »
        for (let i = 0; i < 4; i++) this.voice(t + i * 0.22, 'sawtooth', 1100, 980, 0.13, 0.024 * v, p, { vib: 45, vibDepth: 60, bp: 1300, q: 1.4 });
        return;
      case 'tambour_noir': // un long roulement, grave
        for (let i = 0; i < 17; i++) this.noiseHit(t + i * 0.085, 0.03, 'bandpass', 650, 3, 0.05 * v * (1 - i / 26), p);
        return;
      case 'tambour_epeiche': // bref et sec
        for (let i = 0; i < 12; i++) this.noiseHit(t + i * 0.048, 0.02, 'bandpass', 1050, 3, 0.04 * v * (1 - i / 16), p);
        return;
      case 'kik': for (let i = 0, n = 1 + ((R() * 2) | 0); i < n; i++) this.tone(t + i * 0.3, 'square', 2400, 2100, 0.035, 0.016 * v, p, 0.003); return;
      case 'croule': // la bécasse à la croule : trois grognements, puis « pssit »
        for (let i = 0; i < 3; i++) this.voice(t + i * 0.2, 'sawtooth', 185, 150, 0.15, 0.025 * v, p, { vib: 25, vibDepth: 40, bp: 600, q: 1.5 });
        this.tone(t + 0.75, 'sine', 4600, 3800, 0.07, 0.012 * v, p, 0.004); this.noiseHit(t + 0.75, 0.06, 'highpass', 5000, 0.8, 0.008 * v, p);
        return;
      case 'cigogne': // la cigogne noire : un sifflement doux, deux notes
        this.voice(t, 'sine', 900, 1300, 0.25, 0.018 * v, p, { lp: 2200 }); this.voice(t + 0.3, 'sine', 1300, 920, 0.22, 0.016 * v, p, { lp: 2200 });
        return;
      case 'sonneur': // le sonneur : « ouh… ouh… ouh », une cloche fêlée très douce
        for (let i = 0, n = 3 + ((R() * 3) | 0); i < n; i++) { const f = 470 + R() * 30; this.tone(t + i * (1.05 + R() * 0.2), 'sine', f, f * 0.96, 0.17, 0.022 * v, p, 0.035); this.tone(t + i * (1.05 + R() * 0.2), 'sine', f * 2.4, f * 2.3, 0.08, 0.003 * v, p, 0.02); }
        return;
      case 'siffle': this.noiseHit(t, 0.4, 'bandpass', 2600, 1, 0.03 * v, p, 3100, 0.04); return;
      case 'bourdon': this.voice(t, 'sawtooth', 165, 150, 1.3, 0.012 * v, p, { vib: 9, vibDepth: 6, bp: 400, q: 2 }); return;
      case 'grince': for (let i = 0; i < 6; i++) this.noiseHit(t + i * 0.08, 0.03, 'bandpass', 3000, 2, 0.014 * v, p); return;
      case 'oreillard': for (let i = 0; i < 2; i++) this.tone(t + i * 0.06, 'sine', 7000, 6200, 0.02, 0.005 * v, p, 0.003); return;
      case 'gelinotte': // un sifflement si fin qu'on le prend pour un insecte
        this.tone(t, 'sine', 7300, 7050, 0.5, 0.008 * v, p, 0.02);
        for (let i = 0; i < 3; i++) this.tone(t + 0.62 + i * 0.12, 'sine', 6900, 6600, 0.06, 0.007 * v, p, 0.005);
        return;
      case 'bondree': // « pi-u-u », mélodieux
        this.voice(t, 'sine', 1250, 900, 0.36, 0.022 * v, p, { lp: 2600 });
        for (let i = 0; i < 2; i++) this.voice(t + 0.45 + i * 0.26, 'sine', 1050, 820, 0.2, 0.016 * v, p, { lp: 2400 });
        return;
      case 'hou': this.voice(t, 'sine', 385, 360, 0.3, 0.035 * v, p, { lp: 800 }); return;
      case 'claque': for (let i = 0; i < 2; i++) this.noiseHit(t + i * 0.12, 0.03, 'lowpass', 900, 0.7, 0.045 * v, p); return;
      case 'musaraigne': for (let i = 0; i < 8; i++) this.tone(t + i * 0.05 + R() * 0.02, 'sine', 6000 + R() * 1500, 5600, 0.025, 0.005 * v, p, 0.003); return;
      case 'muscardin': for (let i = 0; i < 2; i++) this.tone(t + i * 0.09, 'sine', 4000, 3500, 0.05, 0.007 * v, p, 0.004); return;
      case 'rousse': for (let i = 0; i < 2; i++) this.voice(t + i * 0.7, 'sawtooth', 260, 238, 0.5, 0.016 * v, p, { vib: 18, vibDepth: 18, lp: 700 }); return;
      case 'busard': this.voice(t, 'sawtooth', 1400, 1000, 0.4, 0.018 * v, p, { bp: 1500, q: 1.5 }); return;
      case 'couac': // le bihoreau : « couac », rauque
        this.cri(t, { dur: 0.22, f: [[0, 520], [0.3, 560], [1, 420]], rug: [60, 0.5], form: [[900, 3, 1], [1700, 5, 0.4]], souffle: [0.3, 1200], vol: 0.075 * v, lp: 2800, a: 0.015 }, p);
        return;
      case 'aigrette': this.cri(t, { dur: 0.35, f: [[0, 300], [1, 240]], rug: [50, 0.6], form: [[700, 3, 1], [1400, 4, 0.3]], souffle: [0.3, 900], vol: 0.055 * v, lp: 2400 }, p); return;
      case 'rale': // le râle : un cri de goret qu'on égorge, puis des grognements
        this.voice(t, 'sawtooth', 1700, 900, 0.5, 0.028 * v, p, { vib: 14, vibDepth: 70, bp: 1900, q: 1.2 });
        for (let i = 0, n = 2 + ((R() * 3) | 0); i < n; i++) this.voice(t + 0.6 + i * 0.16, 'sawtooth', 300, 240, 0.08, 0.02 * v, p, { bp: 800, q: 1.5 });
        return;
      case 'scaap': this.voice(t, 'sawtooth', 900, 700, 0.12, 0.032 * v, p, { vib: 80, vibDepth: 120, bp: 1500, q: 1.3 }); return;
      case 'chevre': // la bécassine qui tombe : ses plumes de queue bêlent
        this.cri(t, { dur: 1.6, f: [[0, 380], [1, 470]], rug: [11, 0.9], form: [[480, 2, 1], [950, 3, 0.3]], souffle: [0.5, 900], vol: 0.045 * v, lp: 1600, a: 0.2, r: 0.4 }, p);
        return;
      case 'kurruk': if (R() < 0.6) this.voice(t, 'sawtooth', 720, 600, 0.18, 0.028 * v, p, { vib: 40, vibDepth: 50, bp: 1200, q: 1.5 }); else for (let i = 0; i < 2; i++) this.voice(t + i * 0.16, 'sawtooth', 1100, 1000, 0.05, 0.022 * v, p, { bp: 1400, q: 1.5 }); return;
      case 'rainette': for (let i = 0, n = 6 + ((R() * 5) | 0); i < n; i++) { this.tone(t + i * 0.085, 'square', 1150, 1050, 0.03, 0.011 * v, p, 0.003); this.noiseHit(t + i * 0.085, 0.025, 'bandpass', 2200, 2, 0.008 * v, p); } return;
      case 'crossope': for (let i = 0; i < 3; i++) this.tone(t + i * 0.05, 'sine', 7600, 7000, 0.02, 0.005 * v, p, 0.003); return;
      case 'froissement': this.noiseHit(t, 0.14, 'bandpass', 2200, 1.2, 0.02 * v, p); return;
      case 'plouf': this.tone(t, 'sine', 620, 320, 0.09, 0.01 * v, p, 0.006); this.noiseHit(t + 0.01, 0.14, 'bandpass', 900, 0.8, 0.008 * v, p); return;
    }
  },
});
// les cris d'oiseaux (et leur durée, s) ; ceux qui reviennent d'eux-mêmes attendent qu'aucun autre oiseau ne chante
const E3_CRI_OISEAU = { kiak: 0.8, pic_noir: 0.8, pic_noir_vol: 0.9, kik: 0.4, croule: 0.9, cigogne: 0.55, gelinotte: 1.0, bondree: 1.0, hou: 0.35, busard: 0.4, couac: 0.25, aigrette: 0.35, rale: 1.2, scaap: 0.15, kurruk: 0.35 };
const E3_CRI_PATIENT = new Set(['pic_noir', 'kik', 'cigogne', 'gelinotte', 'bondree', 'hou', 'busard', 'couac', 'rale', 'kurruk', 'croule']);
