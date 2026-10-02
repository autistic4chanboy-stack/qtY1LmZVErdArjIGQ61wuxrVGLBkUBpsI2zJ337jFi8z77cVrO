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
    id: 'eau_reflets', titre: 'Reflets', groupe: 'eau', tempo: 58, mesure: '3/4', salle: 'salle', reverb: 0.36, gain: 1.0,
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
  const Am9 = 'a1 e2 e3 g3 b3 c4', F11 = 'f1 c2 e3 a3 b3 c4', Dm9 = 'd2 a2 f3 a3 c4 e4', E4 = 'e2 b2 a3 b3 d4 e4', E7 = 'e2 b2 g#3 b3 d4 e4', Bb11 = 'bb1 f2 d3 f3 a3 e4', C7 = 'c2 g2 e3 g3 b3 d4', GB = 'b1 g2 d3 g3 a3 d4', F7 = 'f1 c2 e3 a3 c4 g4', Am = 'a1 e2 e3 a3 b3 c4';
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
