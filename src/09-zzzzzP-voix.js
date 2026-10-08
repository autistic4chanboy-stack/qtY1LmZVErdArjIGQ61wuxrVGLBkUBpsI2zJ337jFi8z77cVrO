// ============================================================================
//  DES BÊTES À QUI L'ON PEUT PARLER (agent P) : leurs voix. Un petit cri de
//  bête au début de chaque réplique (synthétisé, doux, jamais deux fois pareil),
//  venu de la bête elle-même (son 3D) ; et les bruits de leur fuite.
//  sound.bpVoix(id, pos, k) ; sound.bpFuite(id, pos)
// ============================================================================
Object.assign(SoundEngine.prototype, {
  bpVoix(id, pos, k = 1) {
    if (!this.ok) return;
    const jouer = () => {
      const t = this.at(0.01), R = Math.random, p = this.pan(0);
      switch (id) {
        case 'chat': { // un « mrrou » de vieux matou, roulé
          const f = 360 + R() * 60, du = 0.32 + R() * 0.12;
          this.cri(t, { dur: du, f: [[0, f * 0.9], [0.35, f * 1.25], [1, f * 0.95]], vib: [6, 0.02], rug: [26 + R() * 6, 0.4], form: [[850, 4, 1], [2100, 6, 0.35], [3300, 8, 0.08]], souffle: [0.04, 1800], vol: 0.06 * k, lp: 4200, a: 0.03 }, p);
          break;
        }
        case 'hulotte': { // « hou… » puis un trémolo, très bas
          this.voice(t, 'sine', 392, 370, 0.42, 0.05 * k, p, { vib: 5, vibDepth: 4, lp: 1200 });
          for (let i = 0; i < 3; i++) this.voice(t + 0.62 + i * 0.13, 'sine', 360 - i * 6, 340 - i * 6, 0.12, 0.035 * k * (1 - i * 0.2), p, { lp: 1100 });
          break;
        }
        case 'crapaud': { // deux coassements graves, rugueux
          for (let i = 0, n = 1 + (R() < 0.6 ? 1 : 0); i <= n; i++) {
            const f = 150 + R() * 25;
            this.cri(t + i * 0.3, { type: 'square', dur: 0.22, f: [[0, f * 1.1], [1, f * 0.85]], rug: [42 + R() * 10, 0.7], form: [[420, 3, 1], [950, 4, 0.3]], souffle: [0.08, 600], vol: 0.09 * k, lp: 1800, a: 0.02 }, p);
          }
          break;
        }
        case 'corbeau': { // « krrok », grave, parfois deux
          for (let i = 0, n = R() < 0.5 ? 1 : 0; i <= n; i++) {
            const f = 430 + R() * 70;
            this.cri(t + i * 0.32, { dur: 0.2 + R() * 0.05, f: [[0, f * 1.12], [0.4, f], [1, f * 0.82]], rug: [68 + R() * 10, 0.6], form: [[1000, 3, 1], [2300, 5, 0.35]], souffle: [0.22, 1500], vol: 0.055 * k, lp: 3400, a: 0.012 }, p);
          }
          break;
        }
        case 'renarde': { // un jappement, puis un petit gémissement
          this.cri(t, { dur: 0.11, f: [[0, 980], [1, 720]], rug: [55, 0.4], form: [[1300, 3, 1], [2600, 5, 0.3]], souffle: [0.25, 2000], vol: 0.045 * k, lp: 4000, a: 0.006 }, p);
          this.voice(t + 0.2, 'triangle', 1050, 820, 0.32, 0.016 * k, p, { vib: 7, vibDepth: 30, bp: 1200, q: 2 });
          break;
        }
        case 'chevre': { // un bêlement fêlé, et la sonnaille
          const f = 400 + R() * 50;
          this.cri(t, { dur: 0.48, f: [[0, f], [0.2, f * 1.08], [1, f * 0.86]], vib: [10.5, 0.05], rug: [10.5, 0.62], form: [[780, 5, 1], [1850, 7, 0.5], [2900, 9, 0.14]], souffle: [0.07, 2200], vol: 0.07 * k, lp: 4200 }, p);
          for (const [m, a] of [[1, 1], [1.37, 0.5], [2.11, 0.25]]) this.tone(t + 0.55, 'sine', 1240 * m, 1236 * m, 1.3 / m, 0.012 * k * a, p, 0.004);
          break;
        }
        case 'carpe': { // des bulles, puis un « bloup » grave
          for (let i = 0; i < 4; i++) this.tone(t + i * 0.07 + R() * 0.04, 'sine', 260 + R() * 200, 520 + R() * 160, 0.05, 0.014 * k, p, 0.006);
          this.tone(t + 0.32, 'sine', 150, 92, 0.22, 0.05 * k, p, 0.01);
          this.noiseHit(t + 0.32, 0.12, 'lowpass', 700, 0.8, 0.02 * k, p, 300);
          break;
        }
        case 'cheval': { // un hennissement grave et doux, l'ébrouement
          this.noiseHit(t, 0.35, 'lowpass', 900, 0.7, 0.03 * k, p, 300, 0.05);
          const f = 150 + R() * 20;
          this.cri(t + 0.28, { dur: 0.5, f: [[0, f], [0.3, f * 1.35], [1, f * 0.9]], vib: [9, 0.04], rug: [17, 0.45], form: [[480, 3, 1], [1050, 4, 0.4], [2100, 6, 0.1]], souffle: [0.06, 900], vol: 0.08 * k, lp: 2600 }, p);
          break;
        }
      }
    };
    try { if (pos && this.ici) this.ici(pos, jouer); else jouer(); } catch (e) { console.error(e); }
  },
  // les bruits du départ : un envol, un plouf au fond du puits, une plongée, des sabots
  bpFuite(id, pos) {
    if (!this.ok) return;
    const jouer = () => {
      const t = this.at(0.01), p = this.pan(0);
      if (id === 'hulotte') this.noiseHit(t, 0.5, 'lowpass', 500, 0.6, 0.012, p, 250, 0.1); // (presque rien : la hulotte vole sans bruit)
      else if (id === 'corbeau') for (let i = 0, tt = t, per = 0.11; i < 7; i++, tt += per, per *= 0.95) this.noiseHit(tt, 0.07, 'bandpass', 420 + Math.random() * 160, 0.9, 0.05 * (1 - i * 0.08), p, 300, 0.015);
      else if (id === 'crapaud') { this.noiseHit(t + 1.1, 0.25, 'lowpass', 900, 0.8, 0.05, p, 300); this.tone(t + 1.1, 'sine', 300, 120, 0.15, 0.03, p); this.noiseHit(t + 1.6, 0.3, 'lowpass', 600, 0.8, 0.02, p, 250); }
      else if (id === 'carpe') { this.noiseHit(t, 0.35, 'bandpass', 1100, 0.8, 0.05, p, 500, 0.02); this.tone(t + 0.05, 'sine', 180, 90, 0.2, 0.03, p); }
      else if (id === 'cheval') for (let i = 0; i < 6; i++) this.noiseHit(t + i * 0.24 + (i % 2) * 0.07, 0.06, 'lowpass', 380, 1, 0.06, p, 160);
      else if (id === 'chevre') { for (let i = 0; i < 4; i++) this.noiseHit(t + i * 0.16, 0.04, 'bandpass', 1400, 1.2, 0.025, p, 900); for (const m of [1, 1.37]) this.tone(t + 0.1, 'sine', 1240 * m, 1236 * m, 1.1 / m, 0.012, p, 0.004); }
      else for (let i = 0; i < 5; i++) this.noiseHit(t + i * 0.09, 0.05, 'highpass', 2600, 0.7, 0.012, p, 1800); // (des feuilles froissées)
    };
    try { if (pos && this.ici) this.ici(pos, jouer); else jouer(); } catch (e) { console.error(e); }
  },
});
