// ============================================================================
//  LES BÊTES DE LA LANDE, DES HAUTEURS ET DU LAC (agent E2) : leurs cris.
//  Synthétisés, courts, doux (sur le bus d'ambiance : le réglage « Ambiance »
//  les règle) ; joués pendant la conduite d'une bête, ils viennent d'elle (son
//  3D, 13-zz-son3d.js) ; sinon on passe la bête (ou une position) en « pos ».
//  Les oiseaux chantent chacun leur tour (sound.oiseauxFin, comme ceux d'avant) :
//  un cri spontané attend qu'aucun autre oiseau ne chante ; un cri d'alarme, non.
// ============================================================================
// durée des cris d'oiseaux (s) : ceux-là attendent leur tour
const E2_CRI_OISEAU = { perdrix: 1.1, bartavelle: 1.0, piegrieche: 0.5, huppe: 0.8, oedicneme: 0.9, busard: 0.7, tetras: 2.6, tichodrome: 0.9, duc: 1.4,
  foulque: 0.2, mouette: 0.5, guignette: 0.6, oie: 0.9, harle: 0.5, cormoran: 0.7, balbuzard: 0.9, gypaete: 0.8 };
Object.assign(SoundEngine.prototype, {
  // e2Cri(sorte, k (0-1 : la distance), pos (facultatif : la bête), alarme (vrai : n'attend pas son tour))
  e2Cri(kind, k, pos, alarme) {
    if (!this.ok || !this.ctx) return false;
    const t = this.at ? this.at() : this.ctx.currentTime + 0.02, v = clamp(k === undefined ? 1 : k, 0, 1), R = Math.random;
    if (v <= 0.01) return false;
    const dur = E2_CRI_OISEAU[kind];
    if (dur !== undefined) {
      if (!alarme && (this.oiseauxFin || 0) > t + 0.3) return false;
      this.oiseauxFin = Math.max(this.oiseauxFin || 0, t + dur);
    }
    const p = pos && !this._scope ? this.pan(pos, this.amb) : this.pan(0, this.amb);
    switch (kind) {
      // ---------------------------------------------------------------- la lande
      case 'calamite': // un roulement sec, comme un grillon trop gros
        this.cri(t, { type: 'sawtooth', dur: 1.4 + R() * 0.5, f: [[0, 1700], [0.5, 1760], [1, 1640]], rug: [15 + R() * 3, 0.9], form: [[1750, 5, 1], [3500, 7, 0.15]], vol: 0.016 * v, lp: 4200, a: 0.06, sus: 0.9 }, p);
        return true;
      case 'perdrix': { // « tchouk-tchouk… tchoukar »
        const f = 1150 + R() * 120;
        for (let i = 0; i < 2; i++) this.cri(t + i * 0.2, { dur: 0.08, f: [[0, f], [1, f * 0.85]], rug: [90, 0.4], form: [[1400, 3, 1], [2600, 5, 0.4]], souffle: [0.2, 2000], vol: 0.03 * v, lp: 4200, a: 0.006 }, p);
        this.cri(t + 0.5, { dur: 0.32, f: [[0, f * 0.9], [0.3, f * 1.15], [1, f * 0.75]], rug: [70, 0.45], form: [[1300, 3, 1], [2500, 5, 0.4]], souffle: [0.2, 2000], vol: 0.032 * v, lp: 4200, a: 0.01 }, p);
        return true;
      }
      case 'bartavelle': { // « tchi-tchi-tchirrr », plus aigre
        const f = 1500 + R() * 150;
        for (let i = 0; i < 3; i++) this.cri(t + i * 0.16, { dur: i < 2 ? 0.06 : 0.38, f: [[0, f], [1, f * (i < 2 ? 0.9 : 0.8)]], rug: [i < 2 ? 100 : 38, 0.55], form: [[1800, 3, 1], [3200, 5, 0.35]], souffle: [0.18, 2600], vol: 0.026 * v, lp: 4500, a: 0.006 }, p);
        return true;
      }
      case 'piegrieche': // un « tchè » rêche, deux ou trois fois
        for (let i = 0, n = 2 + (R() < 0.4 ? 1 : 0); i < n; i++) { this.noiseHit(t + i * 0.16, 0.07, 'bandpass', 3200, 1.6, 0.016 * v, p); this.tone(t + i * 0.16, 'square', 2300, 1900, 0.06, 0.006 * v, p, 0.003); }
        return true;
      case 'huppe': // « oup-oup-oup », bas, comme on souffle dans une bouteille
        for (let i = 0; i < 3; i++) this.voice(t + i * 0.2, 'sine', 560, 520, 0.11, 0.03 * v, p, { lp: 1200 });
        return true;
      case 'oedicneme': // « cour-liii », plaintif, qui monte
        this.voice(t, 'triangle', 1500, 1700, 0.18, 0.02 * v, p, { lp: 3600 });
        this.voice(t + 0.22, 'triangle', 1900, 2500, 0.42, 0.022 * v, p, { vib: 6, vibDepth: 40, lp: 3800 });
        return true;
      case 'busard': // un caquet rapide, rare
        for (let i = 0; i < 5; i++) this.tone(t + i * 0.09, 'triangle', 2300, 2050, 0.06, 0.012 * v, p, 0.004);
        return true;
      case 'genette': // un souffle, un petit grognement sourd
        this.noiseHit(t, 0.35, 'highpass', 2200, 0.8, 0.02 * v, p, 3600);
        this.voice(t + 0.05, 'sawtooth', 190, 150, 0.3, 0.012 * v, p, { lp: 600 });
        return true;
      case 'sphinx': // le cri du sphinx : des petits couinements aigus, secs
        for (let i = 0, n = 3 + ((R() * 3) | 0); i < n; i++) this.tone(t + i * 0.085 + R() * 0.02, 'square', 4600 + R() * 600, 3900, 0.028, 0.01 * v, p, 0.002);
        return true;
      case 'squeak': // un petit campagnol
        for (let i = 0; i < 2; i++) this.tone(t + i * 0.07, 'sine', 3600 + R() * 400, 3300, 0.04, 0.016 * v, p, 0.004);
        return true;
      // ---------------------------------------------------------------- les hauteurs
      case 'tetras': { // la parade : un roucoulement bouillonnant, longtemps
        const f = 520 + R() * 50;
        this.cri(t, { type: 'triangle', dur: 2.4, f: [[0, f], [0.5, f * 1.08], [1, f * 0.95]], rug: [9 + R() * 2, 0.75], form: [[600, 2, 1], [1200, 4, 0.3]], souffle: [0.08, 900], vol: 0.03 * v, lp: 1800, a: 0.2, sus: 0.9 }, p);
        return true;
      }
      case 'tetras_ch': // le « tchou-ich » soufflé du coq
        this.noiseHit(t, 0.5, 'bandpass', 3200, 1.1, 0.04 * v, p, 4400, 0.06);
        return true;
      case 'tichodrome': // des sifflets fins qui montent
        for (let i = 0; i < 3; i++) this.voice(t + i * 0.26, 'sine', 3000 + i * 600, 3400 + i * 700, 0.18, 0.012 * v, p, { lp: 7000 });
        return true;
      case 'duc': { // « ou-hou », grave, qui porte
        const f = 300 + R() * 25;
        this.voice(t, 'sine', f * 1.05, f, 0.32, 0.032 * v, p, { lp: 700 });
        this.voice(t + 0.5, 'sine', f * 0.92, f * 0.85, 0.45, 0.025 * v, p, { lp: 650 });
        return true;
      }
      case 'bec': // le bec qui claque, et un souffle
        for (let i = 0; i < 3; i++) this.noiseHit(t + i * 0.13, 0.012, 'highpass', 2800, 0.9, 0.06 * v, p);
        this.noiseHit(t + 0.45, 0.5, 'bandpass', 2400, 0.9, 0.025 * v, p, 3000, 0.08);
        return true;
      case 'vautour': // un grognement, au festin
        this.cri(t, { dur: 0.5, f: [[0, 170], [1, 130]], rug: [28, 0.6], form: [[500, 2, 1], [1100, 4, 0.3]], souffle: [0.5, 900], vol: 0.03 * v, lp: 1400, a: 0.03 }, p);
        return true;
      case 'gypaete': // un sifflement aigu, très rare
        this.voice(t, 'sine', 2600, 2300, 0.6, 0.008 * v, p, { vib: 9, vibDepth: 30, lp: 5000 });
        return true;
      case 'os': // un os qui éclate sur la pierre, de haut
        this.noiseHit(t, 0.05, 'highpass', 1800, 0.7, 0.09 * v, p);
        this.tone(t, 'triangle', 1200, 500, 0.06, 0.04 * v, p, 0.002);
        for (let i = 0; i < 3; i++) this.noiseHit(t + 0.08 + i * (0.07 + R() * 0.05), 0.03, 'bandpass', 2400 + R() * 800, 1.4, 0.02 * v * (1 - i * 0.25), p);
        return true;
      // ---------------------------------------------------------------- le lac
      case 'foulque': { // « kout », « pitt », sec, un peu métallique
        const f = 820 + R() * 160;
        this.cri(t, { dur: 0.1, f: [[0, f * 1.1], [1, f * 0.8]], rug: [70, 0.3], form: [[1150, 3, 1], [2400, 5, 0.45]], souffle: [0.1, 2000], vol: 0.032 * v, lp: 4200, a: 0.006 }, p);
        if (R() < 0.4) this.cri(t + 0.16, { dur: 0.07, f: [[0, f * 1.3], [1, f]], rug: [70, 0.3], form: [[1500, 3, 1], [2800, 5, 0.4]], vol: 0.026 * v, lp: 4500, a: 0.005 }, p);
        return true;
      }
      case 'eau_course': // une foulque qui court sur l'eau
        for (let i = 0; i < 9; i++) this.noiseHit(t + i * 0.09 + R() * 0.02, 0.06, 'bandpass', 1100 + R() * 500, 0.9, 0.018 * v * (1 - i * 0.07), p);
        return true;
      case 'mouette': { // « krriè », comme on rit
        const n = R() < 0.35 ? 3 : 1;
        for (let i = 0; i < n; i++) { const f = 1350 + R() * 200; this.cri(t + i * 0.28, { dur: i ? 0.14 : 0.36, f: [[0, f * 0.9], [0.25, f * 1.08], [1, f * 0.8]], rug: [55, 0.35], form: [[1600, 3, 1], [3000, 5, 0.3]], souffle: [0.12, 2400], vol: 0.022 * v, lp: 4200, a: 0.015 }, p); }
        return true;
      }
      case 'guignette': // « hi-dii-dii », fin et aigu
        for (let i = 0; i < 3; i++) this.voice(t + i * 0.15, 'sine', i ? 4300 : 3800, i ? 3900 : 4200, 0.09, 0.012 * v, p, { lp: 8000 });
        return true;
      case 'oie': { // « aang-ang-ang », nasal
        const f = 330 + R() * 50;
        for (let i = 0, n = 2 + ((R() * 2) | 0); i < n; i++) this.cri(t + i * 0.26, { dur: i ? 0.17 : 0.26, f: [[0, f], [0.3, f * 1.1], [1, f * 0.92]], rug: [40, 0.25], form: [[850, 3, 1], [1700, 5, 0.5], [2600, 7, 0.15]], souffle: [0.1, 1500], vol: 0.03 * v, lp: 3200, a: 0.02 }, p);
        return true;
      }
      case 'harle': // un « krrr » sourd
        this.cri(t, { dur: 0.32, f: [[0, 300], [1, 260]], rug: [30, 0.7], form: [[700, 3, 1], [1500, 5, 0.3]], vol: 0.028 * v, lp: 1800, a: 0.02 }, p);
        return true;
      case 'cormoran': // des gargouillements graves
        for (let i = 0; i < 3; i++) this.cri(t + i * 0.22, { dur: 0.16, f: [[0, 200 + R() * 40], [1, 160]], rug: [22, 0.7], form: [[450, 3, 1], [1000, 4, 0.3]], souffle: [0.3, 700], vol: 0.02 * v, lp: 1200, a: 0.02 }, p);
        return true;
      case 'balbuzard': // « piou-piou-piou », des sifflets brefs
        for (let i = 0, n = 3 + ((R() * 3) | 0); i < n; i++) this.voice(t + i * 0.16, 'sine', 1900, 1600, 0.1, 0.011 * v, p, { lp: 4000 });
        return true;
      case 'plongeon': // un grand corps qui tombe dans l'eau
        this.noiseHit(t, 0.5, 'lowpass', 1000, 0.6, 0.06 * v, p, 300);
        this.tone(t + 0.02, 'sine', 300, 120, 0.2, 0.02 * v, p, 0.004);
        return true;
      case 'plouf': // un « bloup » (le rat d'eau, le vison qui plonge)
        this.tone(t, 'sine', 600, 300, 0.09, 0.03 * v, p, 0.006); this.noiseHit(t + 0.01, 0.14, 'bandpass', 900, 0.8, 0.025 * v, p);
        return true;
      // ---------------------------------------------------------------- partout
      case 'froissement': this.noiseHit(t, 0.16, 'bandpass', 2400, 1.2, 0.04 * v, p); return true;
      case 'terre': this.noiseHit(t, 0.22, 'lowpass', 600, 0.7, 0.06 * v, p); return true;
      case 'siffle': this.noiseHit(t, 0.55, 'bandpass', 2700, 1, 0.035 * v, p, 3300, 0.05); return true;
      case 'ailes': // un envol lourd (grands oiseaux)
        for (let i = 0, tt = t, per = 0.16; i < 6; i++, tt += per, per *= 0.95) this.noiseHit(tt, 0.1, 'bandpass', 380 + R() * 120, 0.7, 0.04 * v * (1 - i * 0.1), p, 260, 0.03);
        return true;
    }
    return false;
  },
});
