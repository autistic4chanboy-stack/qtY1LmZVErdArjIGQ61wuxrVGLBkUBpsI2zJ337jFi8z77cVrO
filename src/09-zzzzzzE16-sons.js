// ============================================================================
//  CLINS D'ŒIL (agent E16, seizième vague) — les sons
//  Tout est fait avec le moteur du jeu (tone, voice, noiseHit) : des allusions,
//  jamais des copies. Courts, programmés d'un coup (pas de nœud qui dure).
//  API : sound.e16(nom, pos, k) — nom : anneau, toupie, fuite, tuyau, siffle,
//  pouf, alerte, coin, fee, feu, frappe, sirene, fraise, pieces, esprits, chant,
//  melancolie, roule, fantomes, waka, korobeiniki, harmonica, etoile, livre,
//  fanfare, helice, rire, froid.
// ============================================================================
Object.assign(SoundEngine.prototype, {
  e16(nom, pos, k) {
    if (!this.ok || !this.ctx) return;
    const f = this['e16_' + nom];
    if (!f) return;
    try { if (pos && this.ici) this.ici(pos, () => f.call(this, k || 1)); else f.call(this, k || 1); } catch (e) { console.error('e16 son', nom, e); }
  },
  // Sonic : l'anneau qu'on ramasse (deux notes claires, la seconde qui tinte)
  e16_anneau(k) {
    const t = this.at(0.005), o = this.sfx;
    this.tone(t, 'triangle', 1319, 1319, 0.07, 0.05 * k, o, 0.002);
    this.tone(t + 0.065, 'triangle', 1976, 1976, 0.45, 0.045 * k, o, 0.002);
    this.tone(t + 0.065, 'sine', 3951, 3951, 0.3, 0.012 * k, o, 0.002);
  },
  // la boule qui tourne sur place avant de partir
  e16_toupie(k) {
    const t = this.at(0.01), o = this.sfx;
    for (let i = 0; i < 3; i++) {
      this.tone(t + i * 0.22, 'sawtooth', 160 + i * 40, 900 + i * 120, 0.2, 0.025 * k, this.lp(2600, o), 0.004);
      this.noiseHit(t + i * 0.22, 0.2, 'bandpass', 900, 2, 0.03 * k, o, 3200);
    }
  },
  // un souffle qui file
  e16_fuite(k) {
    const t = this.at(0.01), o = this.sfx;
    this.noiseHit(t, 0.55, 'bandpass', 2600, 1.4, 0.06 * k, o, 500, 0.03);
    this.tone(t, 'sine', 700, 180, 0.4, 0.02 * k, o, 0.01);
  },
  // Super Mario Bros. : descendre dans le tuyau (trois glissements qui descendent)
  e16_tuyau(k) {
    const t = this.at(0.01), o = this.lp(2400, this.sfx);
    for (let i = 0; i < 3; i++) this.tone(t + i * 0.16, 'square', 620 - i * 90, 300 - i * 50, 0.14, 0.03 * k, o, 0.004);
  },
  // Minecraft : le sifflement qui enfle
  e16_siffle(k) {
    const t = this.at(0.01), o = this.sfx;
    this.noiseHit(t, 1.5, 'highpass', 3000, 0.7, 0.05 * k, o, 5200, 1.2);
    this.noiseHit(t, 1.5, 'bandpass', 5000, 3, 0.02 * k, o, 6500, 1.3);
  },
  // un nuage qui crève, sans flamme
  e16_pouf(k) {
    const t = this.at(0.01), o = this.sfx;
    this.noiseHit(t, 0.7, 'lowpass', 900, 0.8, 0.12 * k, o, 120, 0.01);
    this.tone(t, 'sine', 90, 45, 0.5, 0.08 * k, o, 0.004);
  },
  // Metal Gear Solid : le « ! » (un coup de métal aigu)
  e16_alerte(k) {
    const t = this.at(0.005), o = this.sfx;
    this.tone(t, 'sawtooth', 1480, 1470, 0.25, 0.035 * k, o, 0.002);
    this.tone(t, 'sawtooth', 2217, 2200, 0.25, 0.02 * k, o, 0.002);
    this.noiseHit(t, 0.08, 'highpass', 4000, 0.7, 0.04 * k, o);
  },
  // Final Fantasy : le cri du grand oiseau jaune
  e16_coin(k) {
    const t = this.at(0.01);
    this.voice(t, 'sawtooth', 700, 1100, 0.12, 0.05 * k, this.sfx, { bp: 1400, q: 2, lp: 3600 });
    this.voice(t + 0.12, 'sawtooth', 1100, 650, 0.2, 0.05 * k, this.sfx, { bp: 1200, q: 2, lp: 3200, vib: 18, vibDepth: 30 });
  },
  // The Legend of Zelda : la petite fée (deux clochettes)
  e16_fee(k) {
    const t = this.at(0.01), o = this.sfx;
    for (const [d, f] of [[0, 1760], [0.14, 2349], [0.42, 1760], [0.56, 2349]]) { this.tone(t + d, 'sine', f, f, 0.35, 0.03 * k, o, 0.002); this.tone(t + d, 'sine', f * 2, f * 2, 0.15, 0.006 * k, o, 0.002); }
    this.noiseHit(t, 0.8, 'highpass', 6000, 0.7, 0.01 * k, o, 8000, 0.2);
  },
  // Dark Souls : le feu qui prend (un souffle sourd, une braise qui gronde)
  e16_feu(k) {
    const t = this.at(0.01), o = this.sfx;
    this.noiseHit(t, 1.2, 'lowpass', 300, 0.8, 0.12 * k, o, 1600, 0.25);
    this.noiseHit(t + 0.2, 1.4, 'bandpass', 900, 1, 0.04 * k, o, 300, 0.3);
    this.tone(t, 'sine', 55, 70, 1.6, 0.06 * k, o, 0.3);
    for (let i = 0; i < 6; i++) this.noiseHit(t + 0.4 + Math.random() * 1.2, 0.03, 'highpass', 3000, 0.7, 0.02 * k, o);
  },
  // Resident Evil : la machine à écrire (des frappes, puis la clochette)
  e16_frappe(k) {
    const t = this.at(0.01), o = this.sfx;
    let d = 0;
    for (let i = 0; i < 9; i++) { d += 0.09 + Math.random() * 0.1; this.noiseHit(t + d, 0.03, 'bandpass', 2600 + Math.random() * 900, 2, 0.06 * k, o); this.tone(t + d, 'sine', 180, 120, 0.03, 0.03 * k, o, 0.001); }
    this.tone(t + d + 0.25, 'sine', 2637, 2637, 0.9, 0.03 * k, o, 0.002);
    this.tone(t + d + 0.25, 'sine', 5274, 5274, 0.4, 0.006 * k, o, 0.002);
  },
  // Silent Hill : une sirène, très loin (montée, tenue, descente)
  e16_sirene(k) {
    const t = this.at(0.05), o = this.lp(1400, this.sfx);
    this.voice(t, 'sawtooth', 220, 620, 3.5, 0.02 * k, o, { lp: 1200, vib: 0.3, vibDepth: 4 });
    this.voice(t + 3.4, 'sawtooth', 620, 600, 2.5, 0.02 * k, o, { lp: 1200 });
    this.voice(t + 5.8, 'sawtooth', 600, 160, 4, 0.02 * k, o, { lp: 1000 });
  },
  // Celeste : la fraise (quatre notes qui montent)
  e16_fraise(k) {
    const t = this.at(0.01), o = this.sfx;
    [1047, 1319, 1568, 2093].forEach((f, i) => this.tone(t + i * 0.08, 'triangle', f, f, 0.3, 0.035 * k, o, 0.003));
  },
  // Shovel Knight : la pelle qui fait sonner des pièces
  e16_pieces(k) {
    const t = this.at(0.01), o = this.sfx;
    [2093, 2637, 3136, 2637, 3520].forEach((f, i) => this.tone(t + i * 0.055, 'square', f, f, 0.08, 0.018 * k, o, 0.002));
  },
  // Stardew Valley : de petits esprits (des gouttes de notes)
  e16_esprits(k) {
    const t = this.at(0.01), o = this.sfx, G = [784, 880, 1047, 1175, 1319, 1568];
    for (let i = 0; i < 5; i++) { const f = G[(Math.random() * G.length) | 0]; this.tone(t + i * 0.13 + Math.random() * 0.05, 'sine', f, f * 1.01, 0.25, 0.025 * k, o, 0.003); }
  },
  // Journey : un appel chanté
  e16_chant(k) {
    const t = this.at(0.01);
    this.voice(t, 'triangle', 660, 990, 0.5, 0.04 * k, this.sfx, { vib: 6, vibDepth: 8, lp: 3000 });
    this.voice(t + 0.45, 'sine', 990, 880, 0.9, 0.03 * k, this.sfx, { vib: 5, vibDepth: 6 });
  },
  // Hollow Knight : quelques notes tristes
  e16_melancolie(k) {
    const t = this.at(0.02), o = this.lp(2000, this.sfx);
    [[0, 440], [0.6, 523], [1.2, 659], [1.8, 587], [2.6, 440]].forEach(([d, f]) => this.tone(t + d, 'triangle', f, f, 1.1, 0.025 * k, o, 0.02));
  },
  // Donkey Kong : un tonneau qui roule (un coup de bois)
  e16_roule(k) {
    const t = this.at(0.005), o = this.sfx;
    this.noiseHit(t, 0.12, 'lowpass', 260, 0.9, 0.08 * k, o, 120);
    this.tone(t, 'sine', 95, 70, 0.1, 0.05 * k, o, 0.003);
  },
  // Pac-Man : les fantômes (une sirène qui ondule)
  e16_fantomes(k) {
    const t = this.at(0.01), o = this.lp(2200, this.sfx);
    for (let i = 0; i < 2; i++) { this.tone(t + i * 0.4, 'triangle', 420, 640, 0.2, 0.025 * k, o, 0.01); this.tone(t + i * 0.4 + 0.2, 'triangle', 640, 420, 0.2, 0.025 * k, o, 0.01); }
  },
  e16_waka(k) {
    const t = this.at(0.005), o = this.sfx;
    this.tone(t, 'triangle', 320, 560, 0.1, 0.04 * k, o, 0.003);
    this.tone(t + 0.12, 'triangle', 560, 320, 0.1, 0.04 * k, o, 0.003);
  },
  // Tetris : Korobeiniki, une chanson de colporteur russe (domaine public), fredonnée
  e16_korobeiniki(k) {
    const t = this.at(0.05), o = this.lp(1800, this.sfx);
    const N = { A3: 220, B3: 247, C4: 262, D4: 294, E4: 330 };
    const air = [['E4', 2], ['B3', 1], ['C4', 1], ['D4', 2], ['C4', 1], ['B3', 1], ['A3', 2], ['A3', 1], ['C4', 1], ['E4', 2], ['D4', 1], ['C4', 1], ['B3', 3], ['C4', 1], ['D4', 2], ['E4', 2], ['C4', 2], ['A3', 2], ['A3', 3]];
    const q = 0.2;
    let d = 0;
    for (const [n, l] of air) { this.voice(t + d, 'sawtooth', N[n], N[n], l * q * 0.95, 0.02 * k, o, { lp: 900, vib: 5, vibDepth: 2.5 }); d += l * q; }
  },
  // Outer Wilds : un harmonica, près d'un feu (un petit air quelconque)
  e16_harmonica(k) {
    const t = this.at(0.05), o = this.lp(2600, this.sfx);
    [[0, 523, 0.5], [0.5, 587, 0.3], [0.8, 659, 0.8], [1.7, 587, 0.4], [2.1, 523, 1.2]].forEach(([d, f, l]) => {
      this.voice(t + d, 'square', f, f, l, 0.018 * k, o, { lp: 1800, vib: 6, vibDepth: 5 });
      this.voice(t + d, 'square', f * 1.5, f * 1.5, l, 0.008 * k, o, { lp: 1800 });
    });
  },
  // Undertale : la petite étoile (un éclat)
  e16_etoile(k) {
    const t = this.at(0.01), o = this.sfx;
    this.tone(t, 'square', 1568, 1568, 0.06, 0.025 * k, o, 0.002);
    this.tone(t + 0.07, 'square', 2093, 2093, 0.25, 0.025 * k, o, 0.002);
  },
  // Myst : le livre (un souffle qui s'ouvre, une note qui monte)
  e16_livre(k) {
    const t = this.at(0.01), o = this.sfx;
    this.noiseHit(t, 1.4, 'bandpass', 400, 1.2, 0.06 * k, o, 3000, 0.6);
    this.tone(t + 0.2, 'sine', 220, 880, 1.2, 0.03 * k, o, 0.3);
  },
  // un objet tiré, une trouvaille (un arpège montant, rien de connu)
  e16_fanfare(k) {
    const t = this.at(0.01), o = this.sfx;
    [[0, 392], [0.12, 494], [0.24, 587], [0.36, 784]].forEach(([d, f], i) => this.tone(t + d, 'triangle', f, f, i === 3 ? 0.9 : 0.14, 0.04 * k, o, 0.003));
  },
  // Rayman : la mèche qui tourne comme une hélice
  e16_helice(k) {
    const t = this.at(0.01), o = this.sfx;
    for (let i = 0; i < 14; i++) this.noiseHit(t + i * 0.07, 0.05, 'bandpass', 700, 1.5, 0.03 * k, o);
    this.tone(t, 'sine', 300, 600, 1, 0.012 * k, o, 0.1);
  },
  // un petit rire (le fantôme timide, la fillette)
  e16_rire(k) {
    const t = this.at(0.01);
    for (let i = 0; i < 4; i++) this.voice(t + i * 0.11, 'sawtooth', 520 - i * 25, 460 - i * 25, 0.09, 0.025 * k, this.sfx, { bp: 1300, q: 2, lp: 3000 });
  },
  // un froid qui passe à travers soi
  e16_froid(k) {
    const t = this.at(0.01), o = this.sfx;
    this.noiseHit(t, 1.2, 'bandpass', 1800, 3, 0.04 * k, o, 400, 0.4);
    this.tone(t, 'sine', 1200, 600, 1.1, 0.012 * k, o, 0.2);
  },
});
