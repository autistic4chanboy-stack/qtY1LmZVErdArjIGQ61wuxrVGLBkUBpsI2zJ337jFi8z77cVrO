// ============================================================================
//  LES BÊTES DES PRÉS, DE LA FERME ET DE LA VILLE (agent E1) : leurs cris
//  Des tampons calculés une fois (22 050 Hz, quelques variantes), rejoués en
//  3D sur le bus d'ambiance (11-zzzzE1-betes.js : e1.cri). Doux et courts ;
//  les bêtes qui crient le font rarement. Le volume de chaque cri : E1_VOL.
//  (Quand l'agent S a fait le chant d'une espèce — caille, chevêche,
//  petit-duc, buse, crécerelle — la bête visible prend le sien : E1_CHANT_S.)
// ============================================================================
const E1_VOL = {
  e1_crecerelle: 0.05, e1_buse: 0.055, e1_caille: 0.045, e1_vanneau: 0.05, e1_outarde: 0.04, e1_sifflet: 0.03, e1_belette: 0.03, e1_couine: 0.022,
  e1_bourdon: 0.03, e1_stridule: 0.018, e1_cheveche: 0.06, e1_putois: 0.04, e1_lerot: 0.03, e1_rat: 0.026, e1_bergeronnette: 0.04, e1_etourneau: 0.035,
  e1_siffle: 0.03, e1_frelon: 0.035, e1_grillon: 0.022, e1_hirondelle: 0.032, e1_choucas: 0.045, e1_freux: 0.05, e1_pelerin: 0.05, e1_pique: 0.05,
  e1_petit_duc: 0.045, e1_alyte: 0.04, e1_trotte: 0.05, e1_toc: 0.03, e1_froisse: 0.025,
};
// les chants de l'agent S qu'une bête visible reprend, s'ils existent (sinon : le sien)
const E1_CHANT_S = { caille: 's_caille', cheveche: 's_cheveche', petit_duc: 's_petitduc', buse: 's_buse', crecerelle: 's_crecerelle' };
Object.assign(SoundEngine.TAMPONS, {
  // la crécerelle : « kli-kli-kli-kli », aigu, un peu grinçant
  e1_crecerelle: [1.0, (d, sr) => {
    const S = SoundEngine.SYN, R = Math.random, f = 2700 + R() * 300, n = 5 + ((R() * 4) | 0);
    for (let k = 0; k < n; k++) S.note(d, sr, 0.02 + k * 0.105, 0.075, f * 1.06, f * 0.94 - k * 12, 0.5, { h2: 0.25, att: 0.2, dec: 1.4 });
  }],
  // la buse : un long miaulement qui descend, « piiii-ou », un peu enroué
  e1_buse: [1.3, (d, sr) => {
    const S = SoundEngine.SYN, R = Math.random, f = 2300 + R() * 300, b = S.bq('bp', 1800, 1.2, sr);
    S.note(d, sr, 0.03, 1.05, f, f * 0.58, 0.55, { c: 1.6, vib: 9, vd: 0.012, h2: 0.3, att: 0.12, dec: 1.2 });
    S.bruit(d, sr, 0.04, 0.08, 0.5, 0.05, b);
  }],
  // la caille : « paye-tes-dettes » (trois notes vives), précédé d'un murmure grave
  e1_caille: [0.95, (d, sr) => {
    const S = SoundEngine.SYN, R = Math.random, f = 2800 + R() * 250;
    S.note(d, sr, 0.02, 0.09, 900, 820, 0.12, { h2: 0.3 }); S.note(d, sr, 0.14, 0.09, 880, 800, 0.1, { h2: 0.3 });
    S.note(d, sr, 0.36, 0.08, f * 0.9, f, 0.55, { h2: 0.2 });
    S.note(d, sr, 0.6, 0.06, f, f * 1.05, 0.45, { h2: 0.2 }); S.note(d, sr, 0.69, 0.08, f * 1.05, f * 0.92, 0.45, { h2: 0.2 });
  }],
  // le vanneau : « pi-ouit », un sifflement nasillard qui monte et retombe
  e1_vanneau: [0.6, (d, sr) => {
    const S = SoundEngine.SYN, R = Math.random, f = 1300 + R() * 200;
    S.note(d, sr, 0.02, 0.16, f, f * 2.1, 0.5, { c: 0.6, h2: 0.4 });
    S.note(d, sr, 0.17, 0.3, f * 2.1, f * 1.45, 0.45, { c: 1.4, h2: 0.35, vib: 18, vd: 0.02 });
  }],
  // l'outarde : un « prrt » sec, comme un éternuement de bête
  e1_outarde: [0.35, (d, sr) => {
    const S = SoundEngine.SYN, b = S.bq('bp', 1100 + Math.random() * 300, 1.4, sr);
    for (let k = 0; k < 6; k++) S.bruit(d, sr, 0.02 + k * 0.035, 0.003, 0.018, 0.6 * (1 - k / 8), b);
  }],
  // le sifflement des ailes (l'outarde qui s'envole)
  e1_sifflet: [1.2, (d, sr) => {
    const S = SoundEngine.SYN;
    for (let k = 0; k < 9; k++) S.bruit(d, sr, 0.03 + k * 0.12, 0.04, 0.07, 0.35, S.bq('bp', 2600 + Math.sin(k) * 300, 6, sr));
  }],
  // la belette : un trille aigu, une petite colère
  e1_belette: [0.35, (d, sr) => {
    const S = SoundEngine.SYN, f = 3200 + Math.random() * 600;
    for (let k = 0; k < 7; k++) S.note(d, sr, 0.01 + k * 0.04, 0.03, f, f * 0.9, 0.4, { h2: 0.3 });
  }],
  // un couinement (campagnol, rats)
  e1_couine: [0.2, (d, sr) => {
    const S = SoundEngine.SYN, f = 4200 + Math.random() * 1200;
    S.note(d, sr, 0.01, 0.05, f, f * 1.1, 0.5, { h2: 0.15 }); if (Math.random() < 0.6) S.note(d, sr, 0.09, 0.04, f * 1.05, f * 0.95, 0.35);
  }],
  // le vol lourd d'un hanneton (un bourdonnement grave qui passe)
  e1_bourdon: [1.6, (d, sr) => {
    const S = SoundEngine.SYN, f = 105 + Math.random() * 30;
    S.note(d, sr, 0.02, 1.5, f, f * 0.94, 0.5, { h2: 0.7, am: 48, amd: 0.6, vib: 3, vd: 0.03, att: 0.25, dec: 1.2 });
    S.note(d, sr, 0.02, 1.5, f * 3, f * 2.85, 0.12, { am: 48, amd: 0.6, att: 0.25 });
    S.lp1(d, sr, 1600);
  }],
  // la grande sauterelle : un grésillement sec, par rafales
  e1_stridule: [1.5, (d, sr) => {
    const S = SoundEngine.SYN, b = S.bq('bp', 6800, 2.5, sr);
    for (let t = 0.02; t < 1.4; t += 0.075 + Math.random() * 0.02) for (let k = 0; k < 3; k++) S.bruit(d, sr, t + k * 0.012, 0.001, 0.004, 0.5, b);
  }],
  // la chevêche : « kiou », une plainte qui monte puis retombe
  e1_cheveche: [0.75, (d, sr) => {
    const S = SoundEngine.SYN, f = 950 + Math.random() * 120;
    S.note(d, sr, 0.02, 0.5, f, f * 1.35, 0.55, { c: 0.7, h2: 0.25, vib: 6, vd: 0.01 });
    S.note(d, sr, 0.42, 0.2, f * 1.35, f * 1.05, 0.4, { h2: 0.2 });
  }],
  // le putois : un ricanement sourd et un souffle
  e1_putois: [0.7, (d, sr) => {
    const S = SoundEngine.SYN, b = S.bq('bp', 900, 1.5, sr);
    for (let k = 0; k < 5; k++) S.bruit(d, sr, 0.02 + k * 0.07, 0.004, 0.03, 0.5, b);
    S.bruit(d, sr, 0.4, 0.05, 0.12, 0.25, S.bq('hp', 2500, 0.7, sr));
  }],
  // le lérot : des sifflements et des grincements, la nuit
  e1_lerot: [0.9, (d, sr) => {
    const S = SoundEngine.SYN, R = Math.random;
    for (let k = 0; k < 3; k++) { const f = 2800 + R() * 900; S.note(d, sr, 0.02 + k * 0.22, 0.1, f, f * 1.15, 0.4, { h2: 0.2 }); }
    const b = S.bq('bp', 1800, 3, sr);
    for (let k = 0; k < 10; k++) S.bruit(d, sr, 0.1 + k * 0.06, 0.001, 0.006, 0.25, b);
  }],
  // les rats : des petits cris et un grattement
  e1_rat: [0.45, (d, sr) => {
    const S = SoundEngine.SYN, R = Math.random, f = 3200 + R() * 800;
    S.note(d, sr, 0.01, 0.06, f, f * 0.85, 0.45, { h2: 0.4 }); S.note(d, sr, 0.1, 0.05, f * 0.95, f * 0.8, 0.35, { h2: 0.4 });
    const b = S.bq('bp', 2400, 1.5, sr);
    for (let k = 0; k < 6; k++) S.bruit(d, sr, 0.2 + k * 0.035, 0.001, 0.005, 0.25, b);
  }],
  // la bergeronnette : « tsi-litt »
  e1_bergeronnette: [0.4, (d, sr) => {
    const S = SoundEngine.SYN, f = 4600 + Math.random() * 500;
    S.note(d, sr, 0.01, 0.07, f, f * 1.1, 0.5); S.note(d, sr, 0.12, 0.05, f * 1.15, f * 1.3, 0.45); S.note(d, sr, 0.18, 0.07, f * 1.3, f * 1.1, 0.45);
  }],
  // l'étourneau : un bavardage (claquements, sifflets glissés, crécelle)
  e1_etourneau: [1.3, (d, sr) => {
    const S = SoundEngine.SYN, R = Math.random;
    let t = 0.02;
    for (let k = 0; k < 7; k++) {
      const x = R();
      if (x < 0.35) { const f = 2400 + R() * 2400; S.note(d, sr, t, 0.12, f, f * (0.5 + R() * 0.8), 0.4, { h2: 0.3 }); t += 0.15; }
      else if (x < 0.65) { const b = S.bq('bp', 2000 + R() * 2000, 2, sr); for (let j = 0; j < 5; j++) S.bruit(d, sr, t + j * 0.02, 0.001, 0.006, 0.4, b); t += 0.13; }
      else { S.mode(d, sr, t, 1600 + R() * 1500, 0.015, 0.4); t += 0.08; }
    }
  }],
  // un long sifflet glissé (l'étourneau qui imite le berger)
  e1_siffle: [0.9, (d, sr) => {
    const S = SoundEngine.SYN, f = 1900 + Math.random() * 300;
    S.note(d, sr, 0.02, 0.35, f, f * 1.5, 0.5, { c: 0.7 }); S.note(d, sr, 0.42, 0.4, f * 1.5, f * 0.9, 0.5, { c: 1.3 });
  }],
  // un frelon qui passe (plus grave et plus lourd qu'une guêpe)
  e1_frelon: [1.0, (d, sr) => {
    const S = SoundEngine.SYN, f = 130 + Math.random() * 25;
    S.note(d, sr, 0.02, 0.95, f, f * 1.04, 0.45, { h2: 0.9, vib: 4, vd: 0.05, att: 0.25, dec: 1.2 });
    S.note(d, sr, 0.02, 0.95, f * 4, f * 4.1, 0.1, { vib: 4, vd: 0.05, att: 0.25 });
    S.lp1(d, sr, 2200);
  }],
  // le grillon du foyer : de courts trilles doux, réguliers
  e1_grillon: [2.2, (d, sr) => {
    const S = SoundEngine.SYN, f = 4300 + Math.random() * 300;
    for (let t = 0.03; t < 2.0; t += 0.42 + Math.random() * 0.06) for (let p = 0; p < 3; p++) S.note(d, sr, t + p * 0.03, 0.018, f, f * 0.99, 0.5, { att: 0.25, dec: 1.2 });
  }],
  // les hirondelles : un gazouillis roulé, « prrit »
  e1_hirondelle: [0.5, (d, sr) => {
    const S = SoundEngine.SYN, R = Math.random;
    for (let k = 0; k < 2; k++) { const f = 3300 + R() * 600; S.note(d, sr, 0.02 + k * 0.2, 0.13, f, f * 1.08, 0.45, { am: 45, amd: 0.8, h2: 0.2 }); }
  }],
  // le choucas : « tchak », sec et clair
  e1_choucas: [0.45, (d, sr) => {
    const S = SoundEngine.SYN, f = 1150 + Math.random() * 200, b = S.bq('bp', 1700, 1.2, sr);
    S.note(d, sr, 0.01, 0.11, f * 1.15, f * 0.85, 0.55, { h2: 0.6 }); S.bruit(d, sr, 0.01, 0.002, 0.04, 0.12, b);
    if (Math.random() < 0.5) S.note(d, sr, 0.22, 0.1, f * 1.1, f * 0.8, 0.45, { h2: 0.6 });
  }],
  // le freux : « kraah », rauque et nasillard
  e1_freux: [0.6, (d, sr) => {
    const S = SoundEngine.SYN, f = 520 + Math.random() * 90, b = S.bq('bp', 1200, 1, sr);
    S.note(d, sr, 0.02, 0.42, f, f * 0.86, 0.5, { h2: 0.8, am: 35, amd: 0.35 });
    S.bruit(d, sr, 0.03, 0.03, 0.25, 0.18, b);
  }],
  // le pèlerin : « kek-kek-kek », dur
  e1_pelerin: [0.9, (d, sr) => {
    const S = SoundEngine.SYN, f = 1500 + Math.random() * 200, n = 4 + ((Math.random() * 3) | 0);
    for (let k = 0; k < n; k++) S.note(d, sr, 0.02 + k * 0.13, 0.09, f * 1.08, f * 0.9, 0.5, { h2: 0.55 });
  }],
  // l'air qui siffle, un faucon qui pique
  e1_pique: [1.2, (d, sr) => {
    const S = SoundEngine.SYN;
    S.bruit(d, sr, 0.02, 0.6, 0.35, 0.5, S.bq('bp', 1400, 2.2, sr));
    S.note(d, sr, 0.1, 0.8, 900, 1500, 0.08, { att: 0.7 });
  }],
  // le petit-duc : « tiou », doux, toujours le même
  e1_petit_duc: [0.32, (d, sr) => { const S = SoundEngine.SYN, f = 1180 + Math.random() * 40; S.note(d, sr, 0.02, 0.2, f * 1.02, f * 0.96, 0.6, { h2: 0.1, att: 0.25 }); }],
  // l'alyte : une note de flûte, claire (chaque alyte la sienne : voir la hauteur de lecture)
  e1_alyte: [0.3, (d, sr) => { const S = SoundEngine.SYN; S.note(d, sr, 0.02, 0.17, 1700, 1690, 0.6, { att: 0.3, dec: 1.3, h2: 0.04 }); }],
  // une bête qui trotte sur un toit (la fouine) : des petits coups sourds, pressés
  e1_trotte: [0.8, (d, sr) => {
    const S = SoundEngine.SYN, b = S.bq('lp', 420, 0.8, sr);
    for (let t = 0.02, k = 0; t < 0.7; t += 0.06 + Math.random() * 0.03, k++) S.bruit(d, sr, t, 0.002, 0.03, 0.6 * (0.6 + Math.random() * 0.4), b);
  }],
  // un papillon de nuit contre le verre d'un réverbère
  e1_toc: [0.3, (d, sr) => { const S = SoundEngine.SYN; for (let k = 0; k < 2; k++) S.mode(d, sr, 0.02 + k * 0.11, 2400 + Math.random() * 400, 0.008, 0.4); }],
  // un froissement dans l'herbe (une bête qui file)
  e1_froisse: [0.3, (d, sr) => { const S = SoundEngine.SYN; S.bruit(d, sr, 0.01, 0.03, 0.12, 0.6, S.bq('bp', 2600, 0.9, sr)); }],
});
// une boucle : l'essaim autour du nid de frelons (placée, on la rafraîchit tant qu'on est près)
// (par tranches pour la mise en train : une note à la fois ; voir SoundEngine.BOUCLES_PAS)
SoundEngine.BOUCLES_PAS = SoundEngine.BOUCLES_PAS || {};
SoundEngine.BOUCLES_PAS.e1_essaim = function* (d, sr, dur) {
  const S = SoundEngine.SYN, R = Math.random;
  for (let k = 0; k < 7; k++) { yield; const f = 120 + R() * 40, t0 = R() * dur * 0.7; yield* S.noteG(d, sr, t0, 0.8 + R() * 1.2, f, f * (0.96 + R() * 0.08), 0.25, { h2: 0.8, vib: 3 + R() * 3, vd: 0.05, att: 0.3, dec: 1.2 }); }
  yield;
  S.lp1(d, sr, 1800);
};
SoundEngine.BOUCLES.e1_essaim = [3, (d, sr, dur) => { const it = SoundEngine.BOUCLES_PAS.e1_essaim(d, sr, dur); while (!it.next().done) { /* d'un trait */ } }];
SoundEngine.VOL_BOUCLES.e1_essaim = 0.032;
Object.assign(SoundEngine.VOL_OISEAUX, E1_VOL);
// les tampons se calculent avec les autres, en tâche de fond au début de la partie (jamais pendant le jeu)
{
  const _ch = SoundEngine.prototype.chauffer;
  SoundEngine.prototype.chauffer = function () {
    const n = _ch.call(this);
    if (this._chauffe && !this._e1chaud) {
      this._e1chaud = true;
      for (const k of Object.keys(E1_VOL)) for (let i = 0; i < 3; i++) this._chauffe.push(() => this.tb(k, 3, i));
      this._chauffe.push(() => (this.boucleEnFond ? this.boucleEnFond('e1_essaim') : this.boucleTampon && this.boucleTampon('e1_essaim')));
      return this._chauffe.length;
    }
    return n;
  };
}
