// ============================================================================
//  LES CRÉATURES DES TERRES D'AVANT (agent V2) — leurs cris
//  Synthétisés (source douce → formants, bruits filtrés), courts, programmés
//  d'un coup ; placés sur la bête (sound.ici) et atténués par la distance.
//  sound.v2Cri(espece, cri, pos, k) : pos [x, y, z] (ou rien : au centre),
//  k 0..1.5 (la force). Les comportements les espacent (11-zzzzV2-1-moteur.js).
// ============================================================================
Object.assign(SoundEngine.prototype, {
  v2Cri(esp, cri, pos, k) {
    if (!this.ok) return;
    const f = () => { try { this.v2Son(esp, cri, clamp(k === undefined ? 1 : k, 0, 1.5)); } catch (e) { console.error('v2Cri', esp, cri, e); } };
    if (pos && this.ici) this.ici(pos, f, { ref: 3 }); else f();
  },
  v2Son(esp, cri, v) {
    const t = this.at(0.01), o = this.sfx, R = Math.random;
    const coup = () => { this.noiseHit(t, 0.08, 'lowpass', 900, 0.8, 0.05 * v, o, 300); this.tone(t, 'sine', 120, 70, 0.12, 0.03 * v, o); };
    switch (esp + ':' + cri) {
      // ------------------------------------------------------------ les garous
      case 'v2_garou:hurle': // un hurlement de loup qui se casse, à la fin, comme une voix d'homme
        this.cri(t, { dur: 2.6, f: [[0, 310], [0.25, 470], [0.7, 440], [0.85, 300], [1, 180]], vib: [5, 0.012], form: [[[520, 760, 430], 4, 1], [1250, 6, 0.35], [2600, 8, 0.12]], souffle: [0.2, 1200], vol: 0.05 * v, lp: 3200, a: 0.25, r: 0.9 }, o);
        this.cri(t + 2.0, { dur: 0.9, f: [[0, 190], [1, 140]], rug: [32, 0.5], form: [[380, 3, 1], [900, 5, 0.4]], vol: 0.025 * v, lp: 1800, a: 0.05 }, o);
        return;
      case 'v2_garou:grogne':
        this.cri(t, { dur: 1.2 + R() * 0.4, f: [[0, 78], [0.5, 92], [1, 70]], rug: [26, 0.75], form: [[300, 2.5, 1], [700, 4, 0.5], [1500, 6, 0.15]], souffle: [0.3, 500], vol: 0.06 * v, lp: 1500, a: 0.12 }, o);
        return;
      case 'v2_garou:mord':
        this.noiseHit(t, 0.06, 'bandpass', 1800, 2, 0.08 * v, o);
        this.cri(t, { dur: 0.5, f: [[0, 140], [0.3, 180], [1, 90]], rug: [40, 0.8], form: [[420, 3, 1], [1100, 5, 0.5]], souffle: [0.4, 900], vol: 0.07 * v, lp: 2200, a: 0.02 }, o);
        return;
      case 'v2_garou:souffle': // il flaire : deux, trois reniflements
        for (let i = 0, n = 2 + ((R() * 2) | 0); i < n; i++) this.noiseHit(t + i * 0.22, 0.12, 'bandpass', 1600 + R() * 400, 1.6, 0.03 * v, o, 900, 0.03);
        return;
      case 'v2_garou:meurt':
        this.cri(t, { dur: 1.4, f: [[0, 520], [0.2, 600], [1, 230]], vib: [7, 0.02], form: [[700, 5, 1], [1600, 7, 0.3]], vol: 0.04 * v, lp: 2800, a: 0.03 }, o);
        return;
      // ------------------------------------------------------------ les mange-morts
      case 'v2_charognard:ricane': // des jappements qui ressemblent à des rires
        for (let i = 0, n = 3 + ((R() * 4) | 0); i < n; i++) this.cri(t + i * (0.13 + R() * 0.05), { dur: 0.1, f: [[0, 900 + R() * 200], [1, 600]], form: [[1200, 4, 1], [2600, 6, 0.4]], souffle: [0.2, 2000], vol: 0.028 * v, lp: 3800, a: 0.008 }, o);
        return;
      case 'v2_charognard:renifle':
        for (let i = 0; i < 4; i++) this.noiseHit(t + i * 0.13, 0.07, 'bandpass', 2200, 2, 0.02 * v, o, 1400, 0.015);
        return;
      case 'v2_charognard:mord':
        this.noiseHit(t, 0.05, 'bandpass', 2400, 2.5, 0.07 * v, o);
        this.cri(t + 0.02, { dur: 0.3, f: [[0, 600], [1, 380]], rug: [55, 0.6], form: [[900, 3, 1], [2100, 5, 0.4]], vol: 0.04 * v, lp: 3000, a: 0.01 }, o);
        return;
      case 'v2_charognard:meurt':
        this.cri(t, { dur: 0.7, f: [[0, 1100], [1, 420]], form: [[1300, 4, 1]], vol: 0.03 * v, lp: 3500, a: 0.01 }, o);
        return;
      // ------------------------------------------------------------ les pendus
      case 'v2_pendu:grince': // la corde sous le poids, sur la branche
        this.voice(t, 'sawtooth', 170 + R() * 40, 150, 0.9 + R() * 0.6, 0.012 * v, o, { vib: 7, vibDepth: 14, lp: 900, bp: 600, q: 1.2 });
        return;
      case 'v2_pendu:tombe':
        this.noiseHit(t, 0.12, 'highpass', 2500, 1, 0.03 * v, o); // la corde qui casse
        this.noiseHit(t + 0.32, 0.25, 'lowpass', 500, 0.8, 0.09 * v, o, 120); // le corps au sol
        this.tone(t + 0.32, 'sine', 90, 50, 0.3, 0.05 * v, o);
        return;
      case 'v2_pendu:rale':
        this.cri(t, { dur: 1.1, f: [[0, 95], [1, 80]], rug: [18, 0.9], form: [[500, 2, 1], [1300, 3, 0.6]], souffle: [0.6, 900], vol: 0.03 * v, lp: 1600, a: 0.15 }, o);
        return;
      // ------------------------------------------------------------ l'écoutant
      case 'v2_ecoutant:clic': // il claque de la langue, et il écoute la réponse des murs
        for (let i = 0, n = 2 + ((R() * 3) | 0); i < n; i++) { this.noiseHit(t + i * 0.09, 0.012, 'bandpass', 3200 + R() * 600, 4, 0.05 * v, o); this.tone(t + i * 0.09, 'sine', 2600, 2400, 0.015, 0.012 * v, o, 0.002); }
        return;
      case 'v2_ecoutant:cri':
        this.cri(t, { dur: 1.3, f: [[0, 420], [0.15, 900], [0.6, 820], [1, 400]], vib: [9, 0.03], form: [[[700, 1000], 3, 1], [2100, 5, 0.5], [3400, 8, 0.2]], souffle: [0.5, 2500], vol: 0.07 * v, lp: 4500, a: 0.05 }, o);
        return;
      case 'v2_ecoutant:meurt':
        this.cri(t, { dur: 1.8, f: [[0, 600], [1, 120]], vib: [4, 0.04], form: [[800, 3, 1], [1900, 5, 0.3]], souffle: [0.4, 1800], vol: 0.04 * v, lp: 3000, a: 0.04 }, o);
        return;
      // ------------------------------------------------------------ les gargouilles
      case 'v2_gargouille:pierre': // la tête qui tourne : pierre contre pierre
        this.noiseHit(t, 0.6 + R() * 0.4, 'bandpass', 380, 1.4, 0.022 * v, o, 300, 0.15);
        return;
      case 'v2_gargouille:cri': // un cri aigu qui sonne comme dans une église vide
        this.cri(t, { dur: 1.6, f: [[0, 1500], [0.2, 2100], [1, 1100]], rug: [70, 0.5], form: [[[1800, 2400], 6, 1], [3500, 8, 0.4]], souffle: [0.35, 3000], vol: 0.06 * v, lp: 5200, a: 0.03 }, o);
        this.cri(t + 0.08, { dur: 1.5, f: [[0, 1490], [1, 1080]], rug: [64, 0.5], form: [[2000, 6, 1]], vol: 0.025 * v, lp: 5000, a: 0.03 }, o);
        return;
      case 'v2_gargouille:ailes':
        for (let i = 0; i < 4; i++) this.noiseHit(t + i * 0.24, 0.16, 'lowpass', 700, 0.8, 0.04 * v, o, 250, 0.05);
        return;
      case 'v2_gargouille:brise':
        this.noiseHit(t, 0.4, 'lowpass', 1600, 0.7, 0.08 * v, o, 400);
        for (let i = 1; i < 6; i++) this.noiseHit(t + i * 0.07 + R() * 0.05, 0.05, 'bandpass', 1800 + R() * 1200, 2, 0.03 * v, o);
        return;
      // ------------------------------------------------------------ les stryges
      case 'v2_stryge:soupir': // « hou… » : un soupir de femme, au loin, au-dessus
        this.cri(t, { dur: 1.4, f: [[0, 420], [0.3, 470], [1, 330]], vib: [3, 0.02], form: [[[600, 450], 4, 1], [1100, 6, 0.2]], souffle: [0.5, 900], vol: 0.03 * v, lp: 1800, a: 0.3, r: 0.6 }, o);
        return;
      case 'v2_stryge:cri':
        this.cri(t, { dur: 0.9, f: [[0, 2300], [0.4, 2800], [1, 1500]], rug: [90, 0.45], form: [[2600, 5, 1], [4200, 8, 0.3]], souffle: [0.6, 3500], vol: 0.05 * v, lp: 6000, a: 0.02 }, o);
        return;
      case 'v2_stryge:ailes':
        for (let i = 0; i < 3; i++) this.noiseHit(t + i * 0.2, 0.12, 'lowpass', 900, 0.8, 0.025 * v, o, 300, 0.04);
        return;
      // ------------------------------------------------------------ le basilic
      case 'v2_basilic:chant': // le chant d'un coq, rauque et faux
        this.cri(t, { dur: 1.5, f: [[0, 520], [0.15, 760], [0.45, 700], [0.6, 820], [1, 480]], rug: [38, 0.55], form: [[[900, 1300, 800], 5, 1], [2300, 7, 0.4]], souffle: [0.3, 2200], vol: 0.04 * v, lp: 3600, a: 0.04 }, o);
        return;
      case 'v2_basilic:siffle':
        this.noiseHit(t, 0.9, 'highpass', 3200, 0.9, 0.05 * v, o, 4200, 0.08);
        return;
      case 'v2_basilic:pierre': // ce qui devient pierre : un craquement sec, puis un long grain de sable
        this.noiseHit(t, 0.08, 'bandpass', 2600, 2, 0.07 * v, o);
        this.noiseHit(t + 0.08, 1.4, 'bandpass', 1400, 0.9, 0.03 * v, o, 500, 0.3);
        return;
      // ------------------------------------------------------------ la tarasque
      case 'v2_tarasque:ronfle': // une respiration de forge, très basse
        this.noiseHit(t, 1.6, 'bandpass', 300, 0.8, 0.07 * v, o, 170, 0.6); // (assez haut pour qu'un petit haut-parleur l'entende)
        this.tone(t + 0.2, 'sine', 78, 64, 1.3, 0.025 * v, o, 0.4);
        return;
      case 'v2_tarasque:rugit':
        this.cri(t, { dur: 2.4, f: [[0, 60], [0.25, 95], [1, 52]], rug: [22, 0.8], form: [[[260, 380, 240], 2, 1], [700, 4, 0.5], [1500, 6, 0.15]], souffle: [0.5, 600], vol: 0.11 * v, lp: 1500, a: 0.2 }, o);
        this.tone(t, 'sine', 38, 30, 2.2, 0.05 * v, o, 0.2);
        return;
      case 'v2_tarasque:pas':
        this.noiseHit(t, 0.3, 'lowpass', 420, 0.8, 0.1 * v, o, 90);
        this.tone(t, 'sine', 70, 40, 0.35, 0.06 * v, o);
        return;
      case 'v2_tarasque:meurt':
        this.cri(t, { dur: 3.2, f: [[0, 80], [0.2, 100], [1, 34]], rug: [14, 0.8], form: [[300, 2, 1], [650, 4, 0.4]], souffle: [0.6, 400], vol: 0.09 * v, lp: 1200, a: 0.1 }, o);
        return;
      // ------------------------------------------------------------ la chimère
      case 'v2_chimere:rugit':
        this.cri(t, { dur: 1.6, f: [[0, 110], [0.3, 160], [1, 90]], rug: [30, 0.7], form: [[[420, 600, 380], 3, 1], [1100, 4, 0.5], [2200, 6, 0.15]], souffle: [0.4, 800], vol: 0.09 * v, lp: 2400, a: 0.08 }, o);
        return;
      case 'v2_chimere:bele': // le bouc, d'une voix qui se trompe
        this.cri(t, { dur: 1.1, f: [[0, 330], [1, 300]], vib: [9, 0.06], form: [[[700, 1000], 5, 1], [1900, 7, 0.4]], vol: 0.04 * v, lp: 3000, a: 0.04 }, o);
        return;
      case 'v2_chimere:siffle':
        this.noiseHit(t, 0.7, 'highpass', 3600, 0.8, 0.045 * v, o, 4800, 0.06);
        return;
      case 'v2_chimere:feu': // un souffle de forge
        this.noiseHit(t, 1.2, 'bandpass', 700, 0.6, 0.08 * v, o, 2400, 0.12);
        for (let i = 0; i < 8; i++) this.noiseHit(t + 0.2 + R() * 1.0, 0.02, 'bandpass', 1800 + R() * 2000, 1.4, 0.03 * v, o);
        return;
      case 'v2_chimere:meurt':
        this.cri(t, { dur: 2.2, f: [[0, 160], [1, 60]], rug: [20, 0.6], form: [[500, 3, 1], [1200, 5, 0.3]], souffle: [0.5, 700], vol: 0.07 * v, lp: 2000, a: 0.06 }, o);
        return;
      // ------------------------------------------------------------ la vouivre
      case 'v2_vouivre:chant': // un sifflement doux et long, presque un chant, au-dessus de l'eau
        this.cri(t, { type: 'triangle', dur: 2.8, f: [[0, 880], [0.3, 1175], [0.55, 990], [1, 740]], vib: [5, 0.008], form: [[[1000, 1300, 900], 3, 1], [2600, 6, 0.2]], vol: 0.03 * v, lp: 4000, a: 0.4, r: 1.0 }, o);
        return;
      case 'v2_vouivre:siffle':
        this.noiseHit(t, 1.0, 'highpass', 2800, 0.8, 0.05 * v, o, 3800, 0.1);
        return;
      case 'v2_vouivre:eau':
        this.noiseHit(t, 0.5, 'lowpass', 1200, 0.7, 0.06 * v, o, 400);
        for (let i = 0; i < 5; i++) this.noiseHit(t + 0.1 + R() * 0.5, 0.06, 'bandpass', 1500 + R() * 1500, 2, 0.02 * v, o);
        return;
      case 'v2_vouivre:cri': // privée de sa pierre : un cri strident, long
        this.cri(t, { dur: 2.6, f: [[0, 1300], [0.2, 1900], [0.5, 1500], [1, 900]], rug: [60, 0.45], vib: [6, 0.03], form: [[[1600, 2200, 1400], 5, 1], [3600, 8, 0.35]], souffle: [0.5, 3000], vol: 0.07 * v, lp: 5500, a: 0.05 }, o);
        return;
      case 'v2_vouivre:meurt':
        this.cri(t, { dur: 3.0, f: [[0, 1100], [1, 300]], vib: [4, 0.03], form: [[1300, 4, 1], [2800, 6, 0.3]], vol: 0.05 * v, lp: 4000, a: 0.05 }, o);
        return;
      // ------------------------------------------------------------ les noyés
      case 'v2_noye:voix': // une voix qui appelle, de sous l'eau : un nom, peut-être le vôtre
        for (let i = 0; i < 2; i++) this.cri(t + i * 0.55, { dur: 0.45, f: [[0, 240 + R() * 30], [1, 200]], vib: [4, 0.02], form: [[[650, 420], 6, 1], [[1100, 900], 7, 0.5], [2500, 8, 0.15]], souffle: [0.8, 1400], vol: 0.016 * v, lp: 1700, a: 0.08 }, o);
        return;
      case 'v2_noye:bulles':
        for (let i = 0; i < 6; i++) this.tone(t + i * 0.09 + R() * 0.05, 'sine', 300 + R() * 300, 600 + R() * 400, 0.05, 0.012 * v, o, 0.005);
        return;
      case 'v2_noye:clapote':
        this.noiseHit(t, 0.25, 'lowpass', 1400, 0.7, 0.05 * v, o, 500);
        this.noiseHit(t + 0.3, 0.2, 'lowpass', 1100, 0.7, 0.04 * v, o, 400);
        return;
      // ------------------------------------------------------------ les korrigans
      case 'v2_korrigan:ronde': { // des petites voix qui chantent les jours, en canon
        const notes = [523, 587, 659, 587, 523, 494, 523, 587];
        notes.forEach((f, i) => this.cri(t + i * 0.32, { dur: 0.28, f: [[0, f * 1.5], [1, f * 1.45]], form: [[[800, 600], 5, 1], [2400, 7, 0.4]], vol: 0.018 * v, lp: 4200, a: 0.02 }, o));
        notes.forEach((f, i) => this.cri(t + 0.16 + i * 0.32, { dur: 0.22, f: [[0, f * 1.12], [1, f * 1.1]], form: [[[1000, 700], 5, 1]], vol: 0.01 * v, lp: 4200, a: 0.02 }, o));
        return;
      }
      case 'v2_korrigan:rire':
        for (let i = 0, n = 5 + ((R() * 4) | 0); i < n; i++) this.cri(t + i * 0.11, { dur: 0.09, f: [[0, 700 + R() * 300], [1, 600]], form: [[1300, 5, 1], [2800, 7, 0.3]], vol: 0.02 * v, lp: 4500, a: 0.008 }, o);
        return;
      case 'v2_korrigan:cri':
        this.cri(t, { dur: 0.8, f: [[0, 1500], [1, 2200]], rug: [50, 0.4], form: [[1800, 5, 1], [3200, 7, 0.4]], vol: 0.05 * v, lp: 5000, a: 0.02 }, o);
        return;
      // ------------------------------------------------------------ le cerf-aux-mains
      case 'v2_cerf:souffle':
        this.noiseHit(t, 0.7, 'bandpass', 700, 0.8, 0.025 * v, o, 400, 0.2);
        return;
      case 'v2_cerf:doigts': // ses bois : des doigts d'os qui se touchent
        for (let i = 0; i < 4; i++) { this.noiseHit(t + i * 0.07, 0.012, 'bandpass', 2900 + i * 150, 5, 0.025 * v, o); this.tone(t + i * 0.07, 'sine', 2100, 1900, 0.03, 0.006 * v, o, 0.002); }
        return;
      // ------------------------------------------------------------ le chien gris
      case 'v2_chien:grogne': // tout bas, pour vous seul
        this.cri(t, { dur: 1.0, f: [[0, 95], [1, 85]], rug: [30, 0.7], form: [[350, 3, 1], [800, 4, 0.3]], vol: 0.022 * v, lp: 1200, a: 0.12 }, o);
        return;
      case 'v2_chien:gemit':
        this.cri(t, { dur: 0.9, f: [[0, 700], [0.5, 900], [1, 650]], vib: [6, 0.02], form: [[[900, 1100], 6, 1], [2200, 7, 0.2]], vol: 0.016 * v, lp: 3000, a: 0.08 }, o);
        return;
      case 'v2_chien:aboie':
        this.cri(t, { dur: 0.22, f: [[0, 380], [1, 300]], rug: [40, 0.3], form: [[[700, 900], 3, 1], [1700, 5, 0.4]], souffle: [0.4, 1200], vol: 0.06 * v, lp: 3200, a: 0.01 }, o);
        return;
      // ------------------------------------------------------------ les sans-visage
      case 'v2_sans_visage:bele': // un bêlement à bouche fermée
        this.cri(t, { dur: 0.9, f: [[0, 230], [1, 210]], vib: [7, 0.05], form: [[[420, 380], 6, 1], [900, 8, 0.25]], vol: 0.025 * v, lp: 900, a: 0.06 }, o);
        return;
      case 'v2_sans_visage:cloche': // la clochette fêlée du troupeau
        for (const [fq, kk] of [[1240, 1], [1610, 0.5], [2470, 0.25]]) this.tone(t, 'sine', fq, fq * 0.995, 1.6, 0.008 * kk * v, o, 0.004);
        return;
      // ------------------------------------------------------------ les coups
      case 'pierre:coup': this.noiseHit(t, 0.1, 'bandpass', 2400, 1.5, 0.06 * v, o); this.tone(t, 'sine', 1800, 1700, 0.08, 0.01 * v, o); return;
      default: coup();
    }
  },
});
