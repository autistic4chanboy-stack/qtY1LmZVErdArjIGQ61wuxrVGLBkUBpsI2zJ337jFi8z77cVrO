// ============================================================================
//  LA MUSIQUE (agent M) — LA LANDE ET LES HAUTEURS (groupe « lande »)
//  Compositions originales (agent M).
// ============================================================================

// « Les bruyères » — mi éolien, à trois temps. Un air de berger à la flûte, que le vent emporte ; le piano tient
// des quintes à vide et quelques notes, comme la pierre et la bruyère ; au milieu, le piano reprend seul, en sol.
{
  const Em5 = 'e2 b2 e3 b3', Em = 'e2 b2 g3 b3', C7 = 'c2 g2 e3 b3', D = 'd2 a2 f#3 a3', G = 'g2 d3 b3 d4', Bm = 'b1 f#2 d3 f#3', Am7 = 'a1 e2 c3 g3', Em7 = 'e2 b2 d3 g3', GB = 'b1 g2 d3 g3', D2 = 'd2 a2 e3 a3', C11 = 'c2 g2 e3 f#3';
  const H = [Em5, Em5,
    Em5, C7, D, Em, G, Bm, Am7, Em, C7, D, Em7, C7, GB, Em, D2, Em,
    G, D, C7, GB, Am7, C11, Em, D,
    C7, D, Em7, C7, GB, Em, D2, Em,
    Em, C7, Em5, Em5 + ' @1'];
  const fl = ['r/2.', 'r/2.',
    'mp ( b4/2 d5/4', 'e5/2.', 'd5/4 b4/4 a4/4', 'b4/2. )', '( g4/4 a4/4 b4/4', 'd5/2 b4/4', 'a4/4 g4/4 e4/4', 'e4/2. )',
    '( e5/2 g5/4', 'a5/2.', 'g5/4 e5/4 d5/4', 'e5/2. )', '( d5/4 b4/4 a4/4', 'b4/2 g4/4', 'a4/2.', 'e4/2. )',
    'r/2.', 'r/2.', 'r/2.', 'r/2.', 'r/2.', 'r/2.', 'r/2.', 'r/2.',
    'p ( e5/2 g5/4', 'a5/2.', 'g5/4 e5/4 d5/4', 'e5/2. )', '( d5/4 b4/4 a4/4', 'b4/2 g4/4', 'a4/2.', 'e4/2. )',
    'pp ( e5/2.', 'b4/2.', 'e4/2.~', 'e4/2. )'];
  const pi = ['r/2.', 'r/2.', 'r/2.', 'r/2.', 'r/2.', 'r/2.', 'r/2.', 'r/2.', 'r/2.', 'r/2.', 'r/2.', 'r/2.', 'r/2.', 'r/2.', 'r/2.', 'r/2.', 'r/2.', 'r/2.',
    'p ( r/4 d5/4 e5/4', 'g5/2 f#5/4', 'e5/2 d5/4', 'b4/2. )', '( r/4 c5/4 d5/4', 'e5/2 f#5/4', 'g5/2.', 'f#5/2. )',
    'r/2.', 'r/2.', 'r/2.', 'r/2.', 'r/2.', 'r/2.', 'r/2.', 'r/2.', 'r/2.', 'r/2.', 'r/2.', 'r/2.'];
  MUSIQUE.ajouter({
    id: 'lande_bruyeres', titre: 'Les bruyères', groupe: 'lande', aussi: ['pres'], tempo: 60, mesure: '3/4', salle: 'salle', reverb: 0.38, gain: 1.0,
    voix: {
      fl: { inst: 'flute', role: 'chant', notes: musMesures('lande_bruyeres', fl, H) },
      m: { inst: 'piano', role: 'chant', notes: musMesures('lande_bruyeres', pi, H) },
      g: { inst: 'piano', role: 'accomp', dyn: 0.85, notes: 'pp ' + musMotif(H.join(' | '), ['01/4 2/4 3/4', '&0123/2.']) },
    },
  });
}

// « La crête » — ré lydien, à quatre temps, large. Des accords arpégés qui montent comme le terrain, un chant qui
// passe par le sol dièse (la lumière d'en haut) ; une cloche, très loin, au début et à la fin.
{
  const D7 = 'd2 a2 e3 f#3 c#4', ED = 'd2 a2 e3 g#3 b3', Bm7 = 'b1 f#2 d3 a3 d4', G7 = 'g1 d2 b2 f#3 a3', Em7 = 'e2 b2 d3 g3 b3', A4 = 'a1 e2 g3 b3 d4', Fm7 = 'f#2 c#3 e3 a3 c#4', DA = 'a1 a2 d3 f#3 a3', A7 = 'a1 e2 g3 c#4 e4';
  const A1 = [D7, ED, D7, ED, Bm7, G7, Em7, A4], A2 = [D7, ED, D7, ED, Bm7, G7, A4, 'd2 a2 e3 f#3 a3'], B = [Fm7, Bm7, G7, DA, G7, Em7, A4, A7];
  const H = [D7, ED, ...A1, ...A2, ...B, ...A2, D7, ED, D7, D7];
  const m = ['r/1', 'r/1',
    'p ( f#5/2. a5/4', 'g#5/1', 'f#5/2 e5/4 c#5/4', 'e5/1 )', '( d5/2. f#5/4', 'b5/2 a5/4 g5/4', 'f#5/2 e5/2', 'e5/1 )',
    '( f#5/2. a5/4', 'g#5/1', 'a5/2 b5/4 c#6/4', 'b5/1 )', '( d6/2. c#6/4', 'b5/2 a5/4 g5/4', 'f#5/2 e5/2', 'd5/1 )',
    'mp ( c#5/2. e5/4', 'd5/2 f#5/2', 'b5/2. a5/4', 'a5/1 )', '( < g5/2 b5/2', 'e5/2 g5/4 b5/4', '> a5/2 d5/2', 'c#5/1 )',
    'p ( f#5/2. a5/4', 'g#5/1', 'a5/2 b5/4 c#6/4', 'b5/1 )', '( d6/2. c#6/4', 'b5/2 a5/4 g5/4', 'f#5/2 e5/2', 'd5/1 )',
    'pp ( f#5/1', 'g#5/1', 'a5/1~', 'a5/1 )'];
  MUSIQUE.ajouter({
    id: 'lande_crete', titre: 'La crête', groupe: 'lande', tempo: 56, mesure: '4/4', salle: 'cathedrale', reverb: 0.3, gain: 0.9,
    voix: {
      m: { inst: 'piano', role: 'chant', notes: musMesures('lande_crete', m, H) },
      g: { inst: 'piano', role: 'accomp', dyn: 0.8, notes: 'pp ' + musMotif(H.join(' | '), '&01234/1') },
      k: { inst: 'cloche', role: 'accomp', vol: 0.5, notes: 'pp d4/1 | r/1 |' + musRep(' r/1 |', 32) + ' r/1 | r/1 | d4/1 | r/1 |' },
    },
  });
}
