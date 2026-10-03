// ============================================================================
//  LA MUSIQUE (agent M) — LE DESSOUS (groupe « dessous » : sous la terre)
//  Compositions originales (agent M).
// ============================================================================

// « Les eaux sans soleil » — ut dièse mineur, à quatre temps, très lent, dans une grotte. Une basse qui tombe
// comme une goutte, les cordes qui tiennent l'ombre, un chant grave au piano ; de loin en loin, deux notes de
// célesta, tout en haut, comme de l'eau qui tombe de la voûte.
{
  const Cm9 = 'c#2 e3 g#3 b3 d#4', A7 = 'a1 e3 g#3 c#4 e4', Cm = 'c#2 e3 g#3 c#4 e4', Fm9 = 'f#1 c#3 e3 a3 c#4', A11 = 'a1 e3 g#3 c#4 d#4', B4 = 'b1 f#3 b3 e4 f#4', G4 = 'g#1 d#3 f#3 c#4 d#4', Fm = 'f#1 c#3 f#3 a3 c#4', G7 = 'g#1 d#3 f#3 b#3 d#4', E7 = 'e2 b2 d#3 g#3 b3', BD = 'd#2 f#3 b3 d#4 f#4', Cm7 = 'c#2 g#3 b3 e4 g#4';
  const A1 = [Cm9, A7, Cm, Fm9, Cm, A11, B4, G4], A2 = [Cm9, A7, Cm, Fm9, Fm, G7, Cm, Cm], B = [E7, BD, Cm7, A7, E7, BD, A7, G7];
  const H = [Cm9, Cm9, ...A1, ...A2, ...B, ...A2, Cm9, A7, Cm9, Cm9];
  const a1 = ['( g#4/1', 'e4/2. d#4/4', 'c#4/1', 'a3/2 b3/2 )', '( c#4/2. e4/4', 'd#4/2 c#4/2', 'b3/1', 'g#3/1 )'];
  const a2 = ['( g#4/1', 'e4/2. d#4/4', 'c#4/1', 'a4/2 g#4/2 )', '( f#4/2. e4/4', 'd#4/2 b#3/2', 'c#4/1~', 'c#4/1 )'];
  const b = ['p ( b4/1', 'f#4/2. a4/4', 'g#4/1', 'e4/1 )', '( < b4/2. c#5/4', '> d#5/2 f#4/2', 'e4/2 c#4/2', 'b#3/1 )'];
  const m = ['r/1', 'r/1', 'pp ' + a1[0], ...a1.slice(1), ...a2, ...b, 'pp ' + a2[0], ...a2.slice(1), '( g#4/1', 'e4/1', 'c#4/1~', 'c#4/1 )'];
  const goutte = H.map((c, i) => (i % 4 === 3 && i > 2 ? c + ' @1' : '-/1'));
  MUSIQUE.ajouter({
    id: 'dessous_eaux', titre: 'Les eaux sans soleil', groupe: 'dessous', aussi: ['tenebres'], tempo: 50, mesure: '4/4', salle: 'grotte', reverb: 0.42, gain: 1.0,
    voix: {
      m: { inst: 'piano', role: 'chant', oct: 1, notes: musMesures('dessous_eaux', m, H) },
      b: { inst: 'piano', role: 'basse', dyn: 0.75, notes: 'pp ' + musMotif(H.join(' | '), '0/1') },
      s: { inst: 'cordes', role: 'tenue', vol: 0.7, notes: 'pp ' + musMotif(H.join(' | '), '1234/1') },
      c: { inst: 'celesta', role: 'accomp', oct: 2, vol: 0.5, notes: 'pp ' + musMotif(goutte.join(' | '), ['-', 'r/2 4/8 r/8 3/4']) },
    },
  });
}

// « Cristaux » — mi lydien, à trois temps. Les salles de cristal : la harpe égrène, le célesta chante clair, le verre
// tient de longues notes ; au milieu, un do majeur inattendu, comme une facette qui renvoie une autre lumière.
{
  const E = 'e2 b2 g#3 d#4', FE = 'e2 c#3 f#3 a#3', Cm7 = 'c#2 g#2 e3 b3', Gm7 = 'g#2 d#3 f#3 b3', A7 = 'a2 e3 a3 c#4', B4 = 'b2 f#3 a3 e4', EG = 'g#2 b2 e3 b3', Fm7 = 'f#2 c#3 e3 a3', AB = 'b2 a3 c#4 e4', C7 = 'c3 g3 e4 g4';
  const A1 = [E, FE, E, FE, Cm7, Gm7, A7, B4], A2 = [E, FE, E, FE, Cm7, Gm7, A7, E], B = [Gm7, Cm7, A7, EG, Fm7, AB, C7, B4];
  const H = [E, FE, ...A1, ...A2, ...B, ...A2, E, FE, E, E + ' @1'];
  const a1 = ['( g#5/2 a#5/4', 'c#6/2.', 'd#6/4 c#6/4 b5/4', 'a#5/2. )', '( g#5/4 b5/4 e6/4', 'd#6/2 b5/4', 'c#6/4 b5/4 a5/4', 'f#5/2. )'];
  const a2 = ['( g#5/2 a#5/4', 'c#6/2.', 'd#6/4 c#6/4 b5/4', 'a#5/2. )', '( g#5/4 b5/4 e6/4', 'f#6/2 d#6/4', 'e6/4 c#6/4 a5/4', 'g#5/2. )'];
  const b = ['mp ( d#6/2 b5/4', 'e6/2 g#5/4', 'a5/4 c#6/4 e6/4', 'g#6/2. )', '( f#6/2 e6/4', 'c#6/2 b5/4', '< b5/4 c6/4 e6/4', '> f#6/2. )'];
  const m = ['r/2.', 'r/2.', 'p ' + a1[0], ...a1.slice(1), ...a2, ...b, 'p ' + a2[0], ...a2.slice(1), 'pp ( g#5/2.', 'a#5/2.', 'b5/2.~', 'b5/2. )'];
  const verre = H.map((c, i) => (i % 2 === 0 && i >= 2 && i < 34 ? c : '-/2.'));
  MUSIQUE.ajouter({
    id: 'dessous_cristaux', titre: 'Cristaux', groupe: 'dessous', tempo: 72, mesure: '3/4', salle: 'grotte', reverb: 0.4, gain: 1.0, pedale: 'aucune',
    voix: {
      c: { inst: 'celesta', role: 'chant', notes: musMesures('dessous_cristaux', m, H) },
      h: { inst: 'harpe', role: 'accomp', vol: 0.6, notes: 'pp ' + musMotif(H.join(' | '), ['0/8 1 2 3 2 1', '&0123/2.']) },
      v: { inst: 'verre', role: 'tenue', oct: 1, vol: 0.7, notes: 'pp ' + musMotif(verre.join(' | '), '23/2.') },
    },
  });
}
