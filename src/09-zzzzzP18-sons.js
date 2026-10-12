// ============================================================================
//  LES CASCADES ET LES COINS DE PARADIS (agent P18) — LES SONS ET LA MUSIQUE
//  - « chute » : une boucle placée (sound.source), le grondement d'une chute
//    d'eau : un souffle large et grave qui ne s'arrête pas, qui ondule à peine,
//    l'eau qui claque dessus par éclats ; atténuée avec la distance, assourdie
//    quand le relief la cache (voir 11-zzzzzzzP18-3-jeu.js) ;
//  - deux morceaux pour les coins de paradis (groupe « paradis ») : ils viennent
//    sans trop attendre quand on s'y trouve. Compositions originales (agent P18).
// ============================================================================
{
  const gen = function* (d, sr, D) {
    const R = Math.random, S = SoundEngine.SYN, n = d.length;
    const lo = S.bq('lp', 180, 0.6, sr), mid = S.bq('bp', 520, 0.6, sr), hi = S.bq('bp', 1700, 0.7, sr), air = S.bq('hp', 3200, 0.6, sr);
    let m1 = 0.7, m2 = 0.6, v1 = 0, v2 = 0, br = 0;
    for (let i = 0; i < n; i++) {
      if ((i & BOUCLE_TRANCHE) === 0) yield;
      if (i % 64 === 0) { v1 += (R() - 0.5) * 0.04 - v1 * 0.02; v2 += (R() - 0.5) * 0.12 - v2 * 0.05; m1 = clamp(m1 + v1 * 0.1, 0.55, 1); m2 = clamp(m2 + v2 * 0.1, 0.3, 1); }
      const x = R() * 2 - 1;
      br = 0.985 * br + x * 0.12; // un fond brun, très grave
      d[i] += lo(br) * 1.6 * m1 + mid(x) * 0.42 * m1 + hi(x) * 0.12 * m2 + air(x) * 0.035 * m2;
    }
    // les éclats : de l'eau qui frappe l'eau
    for (let k = 0, N = Math.floor(D * 36); k < N; k++) { if ((k & 15) === 0) yield; S.bruit(d, sr, R() * (D - 0.05), 0.002, 0.01 + R() * 0.03, 0.06 + R() * 0.1, S.bq('bp', 600 + R() * 2600, 0.9, sr)); }
  };
  SoundEngine.BOUCLES_PAS.chute = gen;
  SoundEngine.BOUCLES.chute = [8, boucleGen(gen)];
  SoundEngine.VOL_BOUCLES.chute = 0.16;
}

// ---------------------------------------------------------------- la musique des coins de paradis
// « Le pré clos » — sol majeur, à trois temps, léger. La harpe tourne en croches ; le piano chante une ligne simple
// qui monte et redescend, comme on revient d'une promenade.
{
  const G = 'g2 d3 g3 b3 d4', C9 = 'c3 g3 c4 d4 e4', Em7 = 'e2 b2 e3 g3 d4', D = 'd2 a2 d3 f#3 a3', Am7 = 'a2 e3 g3 c4 e4', C = 'c2 g2 c3 e3 g3';
  const A = [G, C9, Em7, D, G, C9, Am7, D], B = [Em7, C, G, D, Em7, C, Am7, D], A2 = [G, C9, Em7, D, C9, D, G, G];
  const suite = ['pp ' + A.join(' | '), 'p ' + B.join(' | '), 'pp ' + A2.slice(0, 7).join(' | '), G + ' @1'].join(' | ');
  MUSIQUE.ajouter({
    id: 'paradis_pre', titre: 'Le pré clos', groupe: 'paradis', tempo: 72, mesure: '3/4', salle: 'salle', reverb: 0.3, gain: 1.05,
    voix: {
      m: {
        inst: 'piano', role: 'chant',
        notes: ' p ( d5/4 b4/4 d5/4 | e5/2 d5/4 | b4/2 g4/4 | a4/2. ) | ( d5/4 b4/4 d5/4 | g5/2 e5/4 | e5/4 d5/4 c5/4 | d5/2. ) |' +
          ' mp ( b4/4 c5/4 d5/4 | e5/2 g5/4 | d5/2 b4/4 | a4/2. ) | ( b4/4 c5/4 d5/4 | e5/2 c5/4 | c5/4 b4/4 a4/4 | a4/2. ) |' +
          ' p ( d5/4 b4/4 d5/4 | e5/2 d5/4 | b4/2 g4/4 | a4/2. ) | pp ( g4/4 a4/4 c5/4 | b4/2 a4/4 | g4/2.~ | g4/2. ) |',
      },
      h: { inst: 'harpe', role: 'accomp', dyn: 0.8, notes: musMotif(suite, ['0/8 1 2 3 4 3', '&01234/2.']) },
    },
  });
}
// « L'eau tiède » — ré majeur, à quatre temps, très lent. Les cordes tiennent l'air comme de la vapeur ; le célesta
// laisse tomber des gouttes ; le piano dit trois mots, puis se tait.
{
  const D9 = 'd2 a2 e3 f#3 a3', Bm7 = 'b1 f#2 d3 f#3 a3', Gmaj7 = 'g1 d2 d3 f#3 b3', A4 = 'a1 e2 d3 e3 a3', A = 'a1 e2 c#3 e3 a3', Em9 = 'e2 b2 d3 f#3 g3', D = 'd2 a2 d3 f#3 a3';
  const tout = ['pp ' + D9, Bm7, Gmaj7, A4, D9, Bm7, Em9, A, 'p ' + Gmaj7, D9, Em9, A4, 'pp ' + D9, Bm7, Gmaj7, A4, D, D].join(' | ');
  MUSIQUE.ajouter({
    id: 'paradis_eau', titre: 'L’eau tiède', groupe: 'paradis', tempo: 56, mesure: '4/4', salle: 'salle', reverb: 0.42, gain: 1.05,
    voix: {
      m: {
        inst: 'piano', role: 'chant',
        notes: 'r/1 | r/1 | p ( f#5/2. e5/4 | e5/1 ) | ( f#5/2 a5/2 | d5/1 ) | ( b4/2 d5/4 e5/4 | c#5/1 ) |' +
          ' mp ( d5/2. b4/4 | a4/1 ) | ( b4/2 d5/4 f#5/4 | e5/1 ) | pp ( f#5/2. e5/4 | d5/1 ) | ( b4/2 a4/2 | a4/1 ) | ( f#4/1~ | f#4/1 ) |',
      },
      s: { inst: 'cordes', role: 'tenue', vol: 0.7, notes: musMotif(tout, '1234/1') },
      b: { inst: 'piano', role: 'basse', dyn: 0.75, notes: musMotif(tout, '0/1') },
      c: {
        inst: 'celesta', role: 'accomp', vol: 0.65,
        notes: 'r/1 | pp r/2 a5/8 f#6/8 e6/4 | r/1 | r/1 | r/2 d6/8 a6/8 f#6/4 | r/1 | r/1 | r/1 |' +
          ' r/1 | r/2 a5/8 e6/8 d6/4 | r/1 | r/1 | r/1 | r/2 f#5/8 d6/8 c#6/4 | r/1 | r/1 | r/1 | r/1 |',
      },
    },
  });
}
