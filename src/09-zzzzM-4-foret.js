// ============================================================================
//  LA MUSIQUE (agent M) — LA FORÊT ET LE BOIS DE BOULEAUX (groupe « foret »)
//  Compositions originales (agent M).
// ============================================================================

// « Sous les hêtres » — mi dorien, à six-huit. La main gauche coule en arpèges ; au-dessus, un air de pays, modal,
// qui revient trois fois ; au milieu, une éclaircie en sol.
{
  const Em9 = 'e2 b2 g3 d4', AE = 'e2 c#3 a3 e4', C7 = 'c2 g2 e3 b3', G = 'g2 d3 b3 d4', D = 'd2 a2 f#3 e4', Em = 'e2 b2 g3 b3', A = 'a2 e3 a3 c#4', Am7 = 'a1 e2 c3 g3', Bm7 = 'b1 f#2 d3 a3', B7 = 'b1 f#2 d#3 a3';
  const suite = [Em9, AE,
    Em9, AE, Em9, C7, G, D, Em, A, Em9, AE, Em9, A, C7, D, Em, Em,
    'p ' + C7, D, Am7, Bm7, C7, D, A, B7,
    'pp ' + Em9, AE, Em9, Am7, C7, D, Em, Em,
    'pp ' + Em9, AE, Em9, Em9 + ' @1'];
  MUSIQUE.ajouter({
    id: 'foret_hetres', titre: 'Sous les hêtres', groupe: 'foret', tempo: 69, mesure: '6/8', salle: 'salle', reverb: 0.34, gain: 1.05,
    voix: {
      m: {
        inst: 'piano', role: 'chant',
        notes: 'r/2. | r/2. |' +
          ' p ( b4/4. e5/4. | d5/8 c#5/8 b4/8 a4/4. | b4/4. g4/8 a4/8 b4/8 | e4/2. ) | ( d5/4. e5/8 f#5/8 g5/8 | f#5/4. e5/4. | d5/8 b4/8 a4/8 g4/4. | a4/2. ) |' +
          ' ( b4/4. e5/4. | d5/8 c#5/8 b4/8 a4/4. | b4/4. g4/8 a4/8 b4/8 | d5/4. c#5/4. ) | ( b4/8 a4/8 g4/8 f#4/4. | g4/8 f#4/8 e4/8 d4/4. | e4/2.~ | e4/2. ) |' +
          ' mp ( e5/4. g5/4. | f#5/8 e5/8 d5/8 e5/4. | c5/4. e5/4. | d5/2. ) | ( e5/4. g5/4. | < a5/8 g5/8 f#5/8 e5/4. | > d5/8 c#5/8 b4/8 a4/4. | b4/2. ) |' +
          ' p ( b4/4. e5/4. | d5/8 c#5/8 b4/8 a4/4. | b4/4. g4/8 a4/8 b4/8 | e4/2. ) | ( b4/8 a4/8 g4/8 f#4/4. | g4/8 f#4/8 e4/8 d4/4. | e4/2.~ | e4/2. ) |' +
          ' pp ( b4/4. e5/4. | d5/8 c#5/8 b4/8 a4/4. | b4/2.~ | b4/2. ) |',
      },
      g: { inst: 'piano', role: 'accomp', dyn: 0.9, notes: 'pp ' + musMotif(suite.join(' | '), ['0/8 1 2 3 2 1', '&0123/2.']) },
    },
  });
}

// « Le bois blanc » — ré majeur, à trois temps, pour harpe et flûte. Les bouleaux : la lumière passe à travers,
// la harpe égrène, la flûte tient de longues notes, comme un oiseau qui ne se presse pas.
{
  const Dm9 = 'd2 a2 f#3 c#4', EmD = 'd2 b2 g3 e4', Bm7 = 'b2 f#3 a3 d4', G7 = 'g2 d3 f#3 b3', Em7 = 'e2 b2 g3 d4', A4 = 'a2 e3 g3 d4', A7 = 'a2 e3 g3 c#4', D = 'd2 a2 f#3 a3', Fm7 = 'f#2 c#3 e3 a3', DF = 'f#2 d3 a3 c#4';
  const A1 = [Dm9, EmD, Dm9, EmD, Bm7, G7, Em7, A4], A2 = [Dm9, EmD, Dm9, EmD, Bm7, G7, A4, D], B = [G7, Fm7, Em7, DF, G7, Fm7, Em7, A7];
  const suite = ['pp ' + Dm9, EmD, 'p ' + A1.join(' | '), A2.join(' | '), B.join(' | '), A2.join(' | '), 'pp ' + Dm9, EmD, Dm9 + ' @1'];
  MUSIQUE.ajouter({
    id: 'foret_bouleaux', titre: 'Le bois blanc', groupe: 'foret', aussi: ['lande'], tempo: 76, mesure: '3/4', salle: 'salle', reverb: 0.36, gain: 0.67, pedale: 'aucune',
    voix: {
      fl: {
        inst: 'flute', role: 'chant',
        notes: 'r/2. | r/2. |' +
          ' mp ( f#5/2. | e5/4 d5/4 e5/4 | a5/2. | g5/4 f#5/4 e5/4 ) | ( f#5/2 d5/4 | b4/2 d5/4 | e5/2. | e5/2 r/4 ) |' +
          ' ( f#5/2. | e5/4 d5/4 e5/4 | b5/2 a5/4 | g5/4 f#5/4 e5/4 ) | ( d5/2 f#5/4 | g5/2 b5/4 | a5/2 g5/4 | f#5/2 r/4 ) |' +
          ' ( b5/2. | a5/2 f#5/4 | g5/2 e5/4 | f#5/2 r/4 ) | ( < b5/4 a5/4 g5/4 | a5/4 f#5/4 c#5/4 | > e5/2 d5/4 | c#5/2 r/4 ) |' +
          ' p ( f#5/2. | e5/4 d5/4 e5/4 | b5/2 a5/4 | g5/4 f#5/4 e5/4 ) | ( d5/2 f#5/4 | g5/2 b5/4 | a5/2 g5/4 | f#5/2. ) |' +
          ' pp ( a5/2. | f#5/2.~ | f#5/2. ) |',
      },
      h: { inst: 'harpe', role: 'accomp', vol: 0.65, notes: musMotif(suite.join(' | '), ['0/8 1 2 3 2 1', '&0123/2.']) },
    },
  });
}

// « La clairière » — do majeur et la mineur, à quatre temps, piano et cordes. Un endroit où le bois s'ouvre :
// les cordes tiennent l'accord, le piano chante peu, la basse marche doucement.
{
  const Am9 = 'a2 e3 c4 b3', F7 = 'f2 c3 g3 a3', CE = 'e2 g3 c4 e4', G = 'g2 d3 b3 d4', Dm7 = 'd2 a2 f3 c4', E4 = 'e2 b2 a3 e4', Em7 = 'e2 b2 g3 d4', C = 'c2 g2 e3 g3', F = 'f2 c3 a3 c4', Am = 'a2 e3 a3 c4', C7 = 'c2 g2 e3 b3', E7 = 'e2 b2 g#3 d4';
  const A1 = [Am9, F7, CE, G, Am9, F7, Dm7, E4], A2 = [Am9, F7, CE, G, F7, Em7, Dm7 + ' @1', C], B = [F, G, Em7, Am, Dm7, G, C7, E7], coda = [F7, C, F7, C];
  const tenue = musMotif(['pp ' + Am9, F7, 'p ' + A1.join(' | '), A2.join(' | '), 'mp ' + B.join(' | '), 'p ' + A2.join(' | '), 'pp ' + coda.join(' | ')].join(' | '), ['0123/1', '0123/2 r/2']);
  // la basse du piano : basse, quinte, dixième
  const basse = (ch) => ch.split(' | ').map((c) => c.replace(/^(\S+) (\S+) (\S+) (\S+)( @1)?$/, '$1 $2 $3')).join(' | ');
  MUSIQUE.ajouter({
    id: 'foret_clairiere', titre: 'La clairière', groupe: 'foret', aussi: ['pres'], tempo: 60, mesure: '4/4', salle: 'salle', reverb: 0.3, gain: 0.68,
    voix: {
      m: {
        inst: 'piano', role: 'chant',
        notes: 'r/1 | r/1 |' +
          ' p ( e5/2. d5/4 | c5/2 a4/2 | g4/2. c5/4 | d5/1 ) | ( e5/2. g5/4 | a5/2 f5/4 e5/4 | d5/2 c5/4 d5/4 | e5/1 ) |' +
          ' ( e5/2. d5/4 | c5/2 a4/2 | g4/2. c5/4 | d5/2 b4/2 ) | ( a4/2 c5/4 f5/4 | e5/2 g5/2 | f5/4 e5/4 d5/4 c5/4 | c5/1 ) |' +
          ' mp ( a5/2 g5/4 f5/4 | g5/2 d5/2 | e5/2 b4/4 d5/4 | c5/2. e5/4 ) | ( < f5/2 e5/4 d5/4 | d5/2 b4/2 | > e5/2 g5/4 b5/4 | g#5/1 ) |' +
          ' p ( e5/2. d5/4 | c5/2 a4/2 | g4/2. c5/4 | d5/2 b4/2 ) | ( a4/2 c5/4 f5/4 | e5/2 g5/2 | f5/4 e5/4 d5/4 c5/4 | c5/1 ) |' +
          ' pp ( a4/1 | g4/1 | a4/2 c5/2 | c5/1 ) |',
      },
      b: { inst: 'piano', role: 'basse', dyn: 0.85, notes: musMotif(basse(['pp ' + Am9, F7, 'p ' + A1.join(' | '), A2.join(' | ').replace(' @1', ''), 'mp ' + B.join(' | '), 'p ' + A2.join(' | ').replace(' @1', ''), 'pp ' + coda.join(' | ')].join(' | ')), '0/4. 1/8 2/2') },
      s: { inst: 'cordes', role: 'tenue', vol: 0.8, notes: tenue.replaceAll('d2+a2+f3+c4/2 r/2', 'd2+a2+f3+c4/2 g2+d3+f3+c4/2') },
    },
  });
}

// « Le vieux chêne » — ré mineur (dorien), un choral à quatre voix, comme on en chantait sous les grands arbres :
// deux phrases, la seconde qui descend pas à pas jusqu'à un ré majeur ; la deuxième fois, les cordes chantent le
// dessus avec le piano.
{
  const choral = ['d3+d4+f4+a4/2 e3+g3+c4+g4/2', 'f3+a3+c4+f4/2 d3+a3+d4+a4/2', 'g2+g3+d4+b4/2 f2+a3+d4+a4/2', 'a2+e3+d4+a4/2 a2+e3+c#4+a4/2',
    'bb2+d4+f4+d5/2 a2+a3+f4+c5/2', 'g2+bb3+d4+bb4/2 f2+f3+d4+a4/2', 'c3+g3+e4+g4/2 d3+f3+d4+f4/2', 'a2+g3+c#4+e4/2 d2+f#3+a3+d4/2'];
  const dessus = ['( a4/2 g4/2', 'f4/2 a4/2', 'b4/2 a4/2', 'a4/1 )', '( d5/2 c5/2', 'bb4/2 a4/2', 'g4/2 f4/2', 'e4/2 d4/2 )'];
  const H = ['d2+a2/1', 'd2+a2/1', ...choral, ...choral, 'bb2+f3+d4+bb4/2 a2+e3+c#4+a4/2', 'd2+a2+f#3+d4/1'];
  const s = ['r/1', 'r/1', ...Array(8).fill('r/1'), 'p ' + dessus[0], ...dessus.slice(1), 'r/1', 'r/1'];
  MUSIQUE.ajouter({
    id: 'foret_chene', titre: 'Le vieux chêne', groupe: 'foret', tempo: 50, mesure: '4/4', salle: 'salle', reverb: 0.36, gain: 1.16, pedale: 'demi', respire: 4, finRit: 2,
    voix: {
      p: { inst: 'piano', role: 'chant', notes: 'pp ' + musMesures('foret_chene', ['d2+a2/1', 'd2+a2/1', 'p ' + choral[0], ...choral.slice(1), 'pp ' + choral[0], ...choral.slice(1), 'bb2+f3+d4+bb4/2 a2+e3+c#4+a4/2', 'd2+a2+f#3+d4/1'], H) },
      s: { inst: 'cordes', role: 'chant', vol: 0.75, notes: musMesures('foret_chene/cordes', s, H) },
    },
  });
}
