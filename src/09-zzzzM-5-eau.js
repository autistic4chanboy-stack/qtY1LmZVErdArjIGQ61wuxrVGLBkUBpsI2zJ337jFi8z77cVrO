// ============================================================================
//  LA MUSIQUE (agent M) — LE MARAIS ET LE BORD DU LAC (groupe « eau »)
//  Compositions originales (agent M).
// ============================================================================

// « Reflets » — ré bémol majeur, à trois temps. La main gauche ondoie en triolets (six notes qui montent, trois
// qui redescendent) ; la main droite chante au-dessus de l'eau ; au milieu, un sol bémol à la quarte augmentée,
// comme une lumière qui tremble à la surface.
{
  const Db = 'db2 ab2 eb3 f3 ab3 c4', Gb = 'gb2 db3 f3 ab3 bb3 db4', Bbm = 'bb1 f2 c3 db3 f3 ab3', Ebm = 'eb2 bb2 f3 gb3 bb3 db4', Ab11 = 'ab2 eb3 gb3 bb3 db4 eb4', Ab7 = 'ab2 eb3 gb3 ab3 c4 eb4', Gb11 = 'gb2 db3 f3 ab3 bb3 c4', Co = 'c2 gb2 bb2 eb3 gb3 bb3', F4 = 'f2 c3 eb3 f3 bb3 c4';
  const A1 = [Db, Gb, Db, Gb, Bbm, Ebm, Ab11, Ab11], A2 = [Db, Gb, Db, Gb, Bbm, Ebm, Ab7, Db], B = [Bbm, Gb11, Bbm, Gb11, Ebm, Co, F4, Ab11];
  const suite = ['pp ' + Db, Gb, 'p ' + A1.join(' | '), A2.join(' | '), 'p ' + B.join(' | '), 'p ' + A2.join(' | '), 'pp ' + Db, Gb, Db, Db + ' @1'];
  MUSIQUE.ajouter({
    id: 'eau_reflets', titre: 'Reflets', groupe: 'eau', aussi: ['nuit'], tempo: 58, mesure: '3/4', salle: 'salle', reverb: 0.36, gain: 1.0,
    voix: {
      m: {
        inst: 'piano', role: 'chant',
        notes: 'r/2. | r/2. |' +
          ' p ( f5/2 eb5/4 | db5/2 bb4/4 | c5/2 ab4/4 | bb4/2. ) | ( f5/2 ab5/4 | gb5/2 f5/4 | eb5/2 db5/4 | eb5/2. ) |' +
          ' ( f5/2 eb5/4 | db5/2 bb4/4 | c5/2 ab4/4 | bb4/2. ) | ( f5/2 ab5/4 | gb5/2 f5/4 | eb5/4 db5/4 c5/4 | db5/2. ) |' +
          ' mp ( db5/2 c5/4 | bb4/2. | db5/4 f5/4 ab5/4 | < c6/2. ) | ( > bb5/2 ab5/4 | gb5/2 eb5/4 | f5/2. | eb5/2. ) |' +
          ' p ( f5/2 eb5/4 | db5/2 bb4/4 | c5/2 ab4/4 | bb4/2. ) | ( f5/2 ab5/4 | gb5/2 f5/4 | eb5/4 db5/4 c5/4 | db5/2. ) |' +
          ' pp ( f5/2. | db5/2. | c5/2.~ | c5/2. ) |',
      },
      g: { inst: 'piano', role: 'accomp', dyn: 0.82, notes: musMotif(suite.join(' | '), ['0/8t 1 2 3 4 5 4 3 2', '&012345/2.']) },
    },
  });
}

// « Le marais au soir » — la mineur, à quatre temps, très lent. Les cordes tiennent la brume ; la basse ne bouge
// presque pas ; le piano dit peu de chose ; de loin en loin, trois notes de célesta, comme des feux follets.
{
  // basse, quinte (main gauche) ; puis les quatre notes des cordes
  const Am9 = 'a1 e2 e3 g3 c4 e4', F11 = 'f1 c2 f3 a3 c4 e4', Dm9 = 'd2 a2 d3 f3 a3 c4', E4 = 'e2 b2 a3 b3 d4 e4', E7 = 'e2 b2 g#3 b3 d4 e4', Bb11 = 'bb1 f2 d3 f3 a3 c4', C7 = 'c2 g2 e3 g3 b3 d4', GB = 'b1 g2 d3 g3 a3 d4', F7 = 'f1 c2 e3 a3 c4 g4', Am = 'a1 e2 e3 a3 c4 e4';
  const A1 = [Am9, Am9, F11, F11, Dm9, Dm9, E4, E7], A2 = [Am9, Am9, F11, F11, Dm9, Bb11, E4, Am9], B = [C7, C7, GB, GB, F7, F7, E4, E7], A3 = [Am9, Am9, F11, F11, Dm9, Bb11, E4, Am];
  const tout = ['pp ' + Am9, Am9, A1.join(' | '), A2.join(' | '), B.join(' | '), A3.join(' | '), Am, Am].join(' | ');
  MUSIQUE.ajouter({
    id: 'eau_marais', titre: 'Le marais au soir', groupe: 'eau', tempo: 54, mesure: '4/4', salle: 'salle', reverb: 0.4, gain: 1.0,
    voix: {
      m: {
        inst: 'piano', role: 'chant',
        notes: 'r/1 | r/1 |' +
          ' p ( e5/2. d5/4 | c5/1 | b4/2 c5/4 d5/4 | e5/1 ) | ( f5/2. e5/4 | d5/2 c5/2 | b4/1 | g#4/1 ) |' +
          ' ( e5/2. d5/4 | c5/1 | b4/2 c5/4 d5/4 | e5/2 g5/2 ) | ( f5/2. e5/4 | d5/2 f5/2 | e5/2 d5/2 | c5/1 ) |' +
          ' mp ( g5/2. e5/4 | b5/2 g5/2 | a5/2. g5/4 | d5/1 ) | ( < c5/2 e5/4 a5/4 | g5/2 f5/2 | > e5/1 | g#5/2 e5/2 ) |' +
          ' p ( e5/2. d5/4 | c5/1 | b4/2 c5/4 d5/4 | e5/1 ) | ( f5/2. e5/4 | d5/2 f5/2 | e5/2 b4/2 | a4/1~ | a4/1 ) | r/1 |',
      },
      b: { inst: 'piano', role: 'basse', dyn: 0.8, notes: musMotif(tout, '01/1') },
      s: { inst: 'cordes', role: 'tenue', vol: 0.75, notes: musMotif(tout, '2345/1') },
      c: {
        inst: 'celesta', role: 'accomp', vol: 0.7,
        notes: 'r/1 | r/1 | r/1 | r/1 | r/1 | pp r/2 c6/8 e6/8 b6/4 | r/1 | r/1 | r/1 | r/1 |' +
          ' r/1 | r/1 | r/1 | r/2 c6/8 e6/8 b6/4 | r/1 | r/1 | r/1 | r/1 |' +
          ' r/1 | r/1 | r/1 | r/2 d6/8 a6/8 g6/4 | r/1 | r/1 | r/1 | r/2 b5/8 e6/8 d6/4 |' +
          ' r/1 | r/1 | r/1 | r/2 c6/8 e6/8 b6/4 | r/1 | r/1 | r/1 | r/1 | r/2 e6/8 b6/8 a6/4 | r/1 |',
      },
    },
  });
}

// « Le lac au matin » — sol majeur, une barcarolle à six-huit : la main gauche berce comme une barque, la main
// droite chante en tierces et en sixtes, deux voix qui ne se quittent pas ; au milieu, un peu de vent (si mineur).
{
  const G = 'g2 d3 g3 b3', CG = 'g2 c3 e3 g3', Em = 'e2 b2 e3 g3', Am7 = 'a2 e3 g3 c4', D7 = 'd2 a2 c3 f#3', A7 = 'a2 e3 g3 c#4', D = 'd2 a2 d3 f#3', Bm = 'b1 f#2 b2 d3', Am = 'a2 e3 a3 c4', C = 'c2 g2 c3 e3';
  const hA1 = [G, G, CG, G, Em, Am7, D7, G], hA2 = [G, G, CG, G, Em, A7, D, D7], hB = [Bm, Em, Am, D7, G, C, A7, D7];
  const H = [G, G, ...hA1, ...hA2, ...hB, ...hA1, G, G + ' @1'];
  const h1 = ['( b5/4. a5/8 g5/8 a5/8', 'b5/2.', 'c6/4. b5/8 a5/8 g5/8', 'b5/2. )', '( g5/4. f#5/8 e5/8 f#5/8', 'e5/4. a5/4.', 'f#5/4. e5/8 d5/8 e5/8', 'd5/2. )'];
  const b1 = ['g5/4. f#5/8 e5/8 f#5/8', 'g5/2.', 'e5/4. d5/8 c5/8 b4/8', 'g5/2.', 'e5/4. d5/8 c5/8 d5/8', 'c5/4. e5/4.', 'd5/4. c5/8 b4/8 c5/8', 'b4/2.'];
  const h2 = [...h1.slice(0, 4), '( g5/4. b5/8 e6/8 d6/8', 'c#6/2.', 'a5/4. b5/8 c6/8 a5/8', 'f#5/2. )'];
  const b2 = [...b1.slice(0, 4), 'e5/4. g5/8 b5/8 b5/8', 'a5/2.', 'f#5/4. g5/8 a5/8 f#5/8', 'd5/2.'];
  const mB = ['mp ( d6/4. c#6/8 b5/8 c#6/8', 'd6/4. g5/4.', 'c6/4. b5/8 a5/8 b5/8', 'c6/4. f#5/4. )', '( < b5/4. a5/8 g5/8 a5/8', 'e6/4. c6/4.', '> c#6/4. e6/8 d6/8 c#6/8', 'c6/2. )'];
  const bB = ['b5/4. a5/8 g5/8 a5/8', 'b5/4. e5/4.', 'a5/4. g5/8 f#5/8 g5/8', 'a5/4. d5/4.', 'g5/4. f#5/8 e5/8 f#5/8', 'g5/4. e5/4.', 'a5/4. c#6/8 b5/8 a5/8', 'a5/2.'];
  const haut = ['r/2.', 'r/2.', 'p ' + h1[0], ...h1.slice(1), ...h2, ...mB, 'p ' + h1[0], ...h1.slice(1), 'pp ( d6/2.~', 'd6/2. )'];
  const bas = ['r/2.', 'r/2.', 'p ' + b1[0], ...b1.slice(1), ...b2, 'mp ' + bB[0], ...bB.slice(1), 'p ' + b1[0], ...b1.slice(1), 'pp b5/2.~', 'b5/2.'];
  MUSIQUE.ajouter({
    id: 'eau_lac', titre: 'Le lac au matin', groupe: 'eau', tempo: 66, mesure: '6/8', salle: 'salle', reverb: 0.32, gain: 1.0,
    voix: {
      m: { inst: 'piano', role: 'chant', notes: musMesures('eau_lac', haut, H) },
      t: { inst: 'piano', role: 'accomp', dyn: 0.72, notes: musMesures('eau_lac/tierces', bas, H) },
      g: { inst: 'piano', role: 'accomp', dyn: 0.78, notes: 'pp ' + musMotif(H.join(' | '), ['0/8 2 3 1 2 3', '&0123/2.']) },
    },
  });
}
