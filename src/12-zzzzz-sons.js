// ============================================================================
//  SONS AJOUTÉS PAR D'AUTRES MODULES, ADOUCIS (agent C5)
//  Mêmes noms, mêmes paramètres ; seules les variantes trop aiguës ou trop
//  sèches sont refaites (papier froissé, verre brisé, coups de bois, crochets,
//  métal traîné des cauchemars). Le reste passe déjà par les primitives douces.
// ============================================================================
{
  const P = SoundEngine.prototype, _fouille = P.fouille, _coup = P.objetCoup, _casse = P.objetCasse;
  Object.assign(P, {
    fouille(k) {
      if (!this.ok) return;
      const t = this.at(), R = Math.random;
      if (k === 'papier') { for (let i = 0; i < 4; i++) this.jouer(this.tb('page'), t + i * 0.13 + R() * 0.05, 0.03, this.sfx, 0.8 + R() * 0.35); return; }
      if (k === 'verre' || k === 'vaisselle') {
        for (let i = 0; i < 3; i++) { const tt = t + i * 0.16 + R() * 0.05, f = 1800 + R() * 1100; this.tone(tt, 'sine', f, f * 0.97, 0.16, 0.022, null, 0.003); this.tone(tt, 'sine', f * 2.41, f * 2.37, 0.07, 0.005, null, 0.003); }
        this.noiseHit(t, 0.15, 'bandpass', 700, 1.5, 0.05);
        return;
      }
      if (_fouille) return _fouille.call(this, k);
    },
    objetCoup(m, k = 1) {
      if (!this.ok) return;
      if (m === 'bois') { const t = this.at(), R = Math.random; this.jouer(this.tb('coup'), t, 0.09 * k, this.sfx, 0.75 + R() * 0.2); this.tone(t, 'triangle', 180 + R() * 30, 110, 0.07, 0.03 * k); return; }
      if (_coup) return _coup.call(this, m, k);
    },
    objetCasse(m, gros) {
      if (!this.ok) return;
      if (m === 'verre') {
        const t = this.at(), R = Math.random;
        this.noiseHit(t, 0.22, 'bandpass', 2600, 0.8, 0.07, null, 1800);
        for (let i = 0; i < 9; i++) { const f = 1700 + R() * 2300; this.tone(t + i * 0.025 + R() * 0.05, 'sine', f, f * (0.85 + R() * 0.2), 0.06 + R() * 0.12, 0.016, null, 0.002); }
        return;
      }
      if (_casse) return _casse.call(this, m, gros);
    },
    // crochetage : de petits bruits de métal, précis mais pas perçants
    crocCale() { if (!this.ok) return; const t = this.at(); this.tone(t, 'triangle', 1900, 1600, 0.02, 0.03, null, 0.002); this.noiseHit(t + 0.01, 0.02, 'bandpass', 2400, 2, 0.02); },
    crocRate() { if (!this.ok) return; const t = this.at(); for (let i = 0; i < 4; i++) this.noiseHit(t + i * 0.05, 0.05, 'bandpass', 2000 - i * 150, 2.5, 0.04); this.tone(t, 'triangle', 700, 520, 0.05, 0.025); },
    crocCasse() { if (!this.ok) return; const t = this.at(); this.tone(t, 'triangle', 2400, 900, 0.035, 0.05, null, 0.002); this.noiseHit(t, 0.05, 'bandpass', 2600, 1.2, 0.05); this.tone(t + 0.12, 'triangle', 1700, 1680, 0.1, 0.02); },
  });
}
// les autres mondes : leur bus passe par les bruitages (et donc par la réverbération du lieu)
if (typeof MSON !== 'undefined') {
  const _so = MSON.sortie;
  MSON.sortie = function () {
    if (!this.bus && sound.ctx && sound.B) { this.bus = sound.ctx.createGain(); this.bus.gain.value = 0.9; this.bus.connect(sound.B.sfx.inp); }
    return this.bus || _so.call(this);
  };
}
// le métal traîné sur la pierre (cauchemars) : moins de sifflement
if (typeof MSON !== 'undefined') {
  MSON.metal = function (k = 1, dur = 1.2, pan = 0) {
    if (!this.ok) return;
    const t = this.at(), out = this.pan(pan), R = Math.random;
    for (let i = 0; i < 3; i++) sound.noiseHit(t + i * dur / 3, dur / 2.5, 'bandpass', 1700 + R() * 900, 6, 0.06 * k, out, 1300 + R() * 600, 0.08);
    for (let i = 0; i < 8; i++) sound.tone(t + R() * dur, 'triangle', 1800 + R() * 1200, 1500, 0.03, 0.01 * k, out, 0.003);
  };
}
