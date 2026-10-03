// ============================================================================
//  LA MUSIQUE (agent M) — LA VILLE ET LE HAMEAU (groupe « village »)
//  Compositions originales (agent M).
// ============================================================================

// « La place du marché » — sol majeur, une valse lente. Le pas tranquille des jours de marché, un peu de
// nostalgie au milieu (mi mineur), et la valse qui revient, plus douce.
{
  const G = 'g2 b3 d4 g4', C7 = 'c3 g3 b3 e4', C = 'c3 g3 c4 e4', GB = 'b2 g3 b3 d4', Bbo = 'bb2 g3 c#4 e4', Am7 = 'a2 g3 c4 e4', D7 = 'd2 f#3 a3 c4', Bm7 = 'b2 f#3 a3 d4', E7 = 'e2 g#3 b3 d4', Em = 'e2 g3 b3 e4', EmD = 'd2 g3 b3 e4', B7 = 'd#2 f#3 a3 b3', CG = 'g2 g3 b3 e4';
  const A = [G, G, C7, C, GB, Bbo, Am7, D7, Am7, D7, Bm7, E7, Am7, D7, G, G], B = [Em, EmD, C, GB, Am7, D7, G, G, Em, B7, Em, C, Am7, D7, G, G];
  const H = [G, G, ...A, ...B, ...A, G, CG, G, G + ' @1'];
  const mA = ['( d5/2.', 'b4/4 c5/4 d5/4', 'e5/2.', 'e5/4 d5/4 c5/4', 'b4/2.', 'c#5/2 e5/4', 'c5/2.', 'a4/2. )',
    '( c5/2.', 'a4/4 b4/4 c5/4', 'd5/2.', 'd5/4 c5/4 b4/4', 'c5/2.', 'e5/2 c5/4', 'b4/2.~', 'b4/2. )'];
  const mB = ['mp ( g5/2 f#5/4', 'e5/2 d5/4', 'e5/2 g5/4', 'd5/2.', 'c5/4 d5/4 e5/4', 'f#5/2 e5/4', 'd5/2.~', 'd5/2. )',
    '( g5/2 f#5/4', 'f#5/2 e5/4', 'e5/2 b4/4', 'c5/2 e5/4', '< a5/2 g5/4', '> f#5/2 c5/4', 'b4/2.~', 'b4/2. )'];
  const m = ['r/2.', 'r/2.', 'p ' + mA[0], ...mA.slice(1), ...mB, 'p ' + mA[0], ...mA.slice(1), 'pp ( d5/2.', 'e5/2.', 'd5/2.~', 'd5/2. )'];
  MUSIQUE.ajouter({
    id: 'village_marche', titre: 'La place du marché', groupe: 'village', tempo: 100, mesure: '3/4', salle: 'chambre', reverb: 0.3, gain: 1.0, respire: 4,
    voix: {
      m: { inst: 'piano', role: 'chant', notes: musMesures('village_marche', m, H) },
      g: { inst: 'piano', role: 'accomp', dyn: 0.8, notes: 'pp ' + musMotif(H.join(' | '), ['0/4 123/4 123/4', '&0123/2.']) },
    },
  });
}

// « Les volets bleus » — do majeur, à six-huit. Une boîte à musique derrière une fenêtre : un air d'enfant, deux
// fois, et le piano qui berce dessous.
{
  const C = 'c3 g3 e4', F = 'f2 a3 c4', Dm7 = 'd3 c4 f4', G = 'g2 b3 d4', G7 = 'g2 f3 b3', Em = 'e3 g3 b3', Am = 'a2 c4 e4', D4 = 'd3 g3 c4';
  const T = [C, F, Dm7, G, C, F, G7, C, Em, G, Am, D4, C, F, G7, C];
  const H = [C, C, ...T, ...T, C, C + ' @1'];
  const air = ['( e6/4 d6/8 c6/4 g5/8', 'a5/4 c6/8 g5/4.', 'f5/4 a5/8 g5/4 e5/8', 'd5/4. r/4. )', '( e6/4 d6/8 c6/4 g5/8', 'a5/4 c6/8 g5/4 e5/8', 'f5/4 d5/8 e5/4 d5/8', 'c5/4. r/4. )',
    '( g5/4 a5/8 b5/4 c6/8', 'd6/4. b5/4.', 'c6/4 b5/8 a5/4 g5/8', 'a5/4. g5/4. )', '( e6/4 d6/8 c6/4 g5/8', 'a5/4 c6/8 g5/4 e5/8', 'f5/4 d5/8 e5/4 d5/8', 'c5/4. r/4. )'];
  const m = ['r/2.', 'r/2.', 'mp ' + air[0], ...air.slice(1), 'p ' + air[0], ...air.slice(1), 'pp ( g5/4. e5/4.', 'c5/2. )'];
  MUSIQUE.ajouter({
    id: 'village_volets', titre: 'Les volets bleus', groupe: 'village', tempo: 66, mesure: '6/8', salle: 'chambre', reverb: 0.32, gain: 1.0,
    voix: {
      b: { inst: 'boite', role: 'chant', notes: musMesures('village_volets', m, H) },
      g: { inst: 'piano', role: 'accomp', dyn: 0.75, notes: 'pp ' + musMotif(H.join(' | '), ['0/4. 12/4.', '&012/2.']) },
    },
  });
}

// « Dimanche » — fa majeur, à trois temps, comme un cantique qu'on fredonne en rentrant de la messe ; la cloche,
// au début et à la fin.
{
  const F = 'f2 a3 c4', CE = 'e2 g3 c4', Dm = 'd2 f3 a3', Gm7 = 'g2 f3 bb3', FC = 'c3 f3 a3', C7 = 'c3 g3 bb3', Bb = 'bb1 f3 bb3', FA = 'a2 f3 c4', Gm = 'g2 d3 bb3', C = 'c3 e3 g3', Am = 'a2 e3 c4';
  const hA = [F, CE, Dm, Gm7, FC, C7, F, F], hA2 = [F, CE, Dm, Gm7, C7, F, C7, F], hB = [Bb, FA, Gm, C, Am, Dm, Gm7, C7];
  const H = [F, F, ...hA, ...hA2, ...hB, ...hA2, Bb, FA, C7, F + ' @1'];
  const a = ['( a4/4 c5/4 f5/4', 'e5/2 c5/4', 'd5/4 f5/4 a5/4', 'g5/2 f5/4 )', '( f5/4 e5/4 d5/4', 'c5/2 bb4/4', 'a4/2 c5/4', 'f4/2. )'];
  const a2 = [...a.slice(0, 4), '( e5/4 g5/4 bb5/4', 'a5/2 g5/4', 'f5/2 e5/4', 'f5/2. )'];
  const b = ['mp ( d5/4 f5/4 bb5/4', 'a5/2 f5/4', 'g5/4 bb5/4 d6/4', 'c6/2 g5/4 )', '( < a5/4 c6/4 e5/4', '> f5/2 d5/4', 'bb4/4 d5/4 g5/4', 'g5/2 e5/4 )'];
  const m = ['r/2.', 'r/2.', 'p ' + a[0], ...a.slice(1), ...a2, ...b, 'p ' + a2[0], ...a2.slice(1), 'pp ( f5/2.', 'f5/2.', 'e5/2 g5/4', 'f5/2. )'];
  const k = ['pp f3/2.', 'r/2.', ...Array(32).fill('r/2.'), 'r/2.', 'r/2.', 'r/2.', 'f3/2.'];
  MUSIQUE.ajouter({
    id: 'village_dimanche', titre: 'Dimanche', groupe: 'village', tempo: 84, mesure: '3/4', salle: 'salle', reverb: 0.32, gain: 1.0,
    voix: {
      m: { inst: 'piano', role: 'chant', notes: musMesures('village_dimanche', m, H) },
      g: { inst: 'piano', role: 'accomp', dyn: 0.78, notes: 'pp ' + musMotif(H.join(' | '), ['0/4 12/4 12/4', '&012/2.']) },
      k: { inst: 'cloche', role: 'accomp', vol: 0.45, notes: musMesures('village_dimanche/cloche', k, H) },
    },
  });
}
