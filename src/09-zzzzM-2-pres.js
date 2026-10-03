// ============================================================================
//  LA MUSIQUE (agent M) — LES PRÉS ET LA FERME (groupe « pres »)
//  Compositions originales (agent M), sauf mention.
// ============================================================================

// « Le pré du matin » — fa majeur, à trois temps, lent et clair. Une gymnopédie de plein air : la basse et
// l'accord, et au-dessus une ligne qui s'étire ; un passage en ré mineur, puis le retour, plus bas, qui s'éteint.
MUSIQUE.ajouter({
  id: 'pres_matin', titre: 'Le pré du matin', groupe: 'pres', tempo: 66, mesure: '3/4', salle: 'salle', reverb: 0.3,
  voix: {
    m: {
      inst: 'piano', role: 'chant',
      notes: 'r/2. | r/2. |' +
        ' p ( r/4 e5/4 f5/4 | a5/2. | a5/4 g5/4 f5/4 | e5/2. ) | ( d5/4 e5/4 f5/4 | g5/2 f5/4 | e5/2. | c5/2. ) |' +
        ' ( r/4 e5/4 f5/4 | a5/2. | c6/4 bb5/4 a5/4 | g5/2 f5/4 ) | ( d5/4 f5/4 a5/4 | g5/2 e5/4 | f5/2.~ | f5/2. ) |' +
        ' mp ( r/4 f5/4 g5/4 | < a5/2 g5/4 | f5/2 e5/4 | > d5/2. ) | ( r/4 f5/4 g5/4 | < bb5/2 a5/4 | g5/4 f5/4 e5/4 | > e5/2. ) |' +
        ' p ( r/4 e5/4 f5/4 | a5/2. | a5/4 g5/4 f5/4 | e5/2. ) | ( d5/4 f5/4 a5/4 | g5/2 e5/4 | f5/2.~ | f5/2. ) |' +
        ' pp ( r/4 d5/4 f5/4 | e5/2. | d5/2 c5/4 | c5/2.~ | c5/2. ) |',
    },
    g: {
      inst: 'piano', role: 'accomp',
      notes: musMotif(
        'pp f2 a3 c4 e4 | bb1 a3 d4 f4 |' +
        ' p f2 a3 c4 g4 | bb1 a3 d4 f4 | f2 a3 c4 g4 | d2 a3 c4 f4 | bb1 a3 d4 f4 | g2 bb3 d4 f4 | a2 g3 c4 e4 | c2 bb3 c4 f4 |' +
        ' f2 a3 c4 g4 | bb1 a3 d4 f4 | f2 a3 c4 g4 | g2 bb3 d4 f4 | bb1 a3 d4 f4 | c2 bb3 c4 e4 | f2 a3 c4 g4 | f2 bb3 d4 f4 |' +
        ' mp d2 a3 d4 f4 | c2 a3 d4 f4 | bb1 a3 d4 f4 | a1 g3 d4 e4 | d2 a3 d4 f4 | g2 bb3 d4 f4 | e2 g3 bb3 c4 | a1 g3 c#4 e4 |' +
        ' p f2 a3 c4 g4 | bb1 a3 d4 f4 | f2 a3 c4 g4 | d2 a3 c4 f4 | bb1 a3 d4 f4 | c2 bb3 c4 e4 | f2 a3 c4 g4 | f2 a3 c4 g4 |' +
        ' pp bb1 a3 d4 f4 | f2 a3 c4 g4 | f2 bb3 d4 g4 | f2 a3 c4 g4 | f2 a3 c4 f4', '0/4 123/2'),
    },
  },
});

// « Les foins » — ré majeur, à quatre temps. Un jour de fenaison : la main gauche roule en croches, la basse
// descend pas à pas, le chant monte et redescend comme une fourche qui lance le foin ; les cordes entrent au
// milieu, à peine.
{
  const D = 'd2 a2 d3 f#3', AC = 'c#2 a2 c#3 e3', Bm = 'b1 f#2 b2 d3', FmA = 'a1 f#2 a2 c#3', G = 'g1 d2 g2 b2', DF = 'f#1 d2 f#2 a2', Em7 = 'e2 b2 d3 g3', A7 = 'a1 e2 g2 c#3', Fm7 = 'f#1 c#2 e2 a2', Bm7 = 'b1 f#2 a2 d3', D7 = 'd2 a2 c#3 f#3';
  const hA = [D, AC, Bm, FmA, G, DF, Em7, A7], hA2 = [D, AC, Bm, FmA, G, DF, Em7, D], hB = [G, A7, Fm7, Bm7, Em7, A7, D7, A7];
  const H = [D, D, ...hA, ...hA2, ...hB, ...hA2, G, DF, A7, D + ' @1'];
  const a = ['( f#5/2 e5/4 d5/4', 'e5/2 c#5/2', 'd5/4 f#5/4 b5/4 a5/4', 'a5/2 f#5/2 )', '( g5/4 f#5/4 e5/4 d5/4', 'f#5/2 a5/2', 'g5/4 e5/4 b4/4 c#5/4', 'e5/1 )'];
  const a2 = [...a.slice(0, 4), '( g5/4 f#5/4 e5/4 d5/4', 'f#5/2 a5/4 d6/4', 'b5/4 g5/4 e5/4 c#5/4', 'd5/1 )'];
  const b = ['mp ( b5/2 a5/4 g5/4', 'a5/2 e5/2', 'f#5/2 a5/4 c#6/4', 'd6/2 b5/2 )', '( < g5/4 a5/4 b5/4 g5/4', '> e5/2 c#5/4 e5/4', 'f#5/1', 'e5/2 c#5/2 )'];
  const m = ['r/1', 'r/1', 'p ' + a[0], ...a.slice(1), ...a2, ...b, 'p ' + a2[0], ...a2.slice(1), 'pp ( b4/2 d5/2', 'a4/2 f#5/2', 'e5/2 c#5/2', 'd5/1 )'];
  const cordes = H.map((c, i) => (i >= 18 && i < 34 ? c.replace(' @1', '') : '-/1'));
  MUSIQUE.ajouter({
    id: 'pres_foins', titre: 'Les foins', groupe: 'pres', tempo: 76, mesure: '4/4', salle: 'salle', reverb: 0.3, gain: 1.0,
    voix: {
      m: { inst: 'piano', role: 'chant', notes: musMesures('pres_foins', m, H) },
      g: { inst: 'piano', role: 'accomp', dyn: 0.78, notes: 'pp ' + musMotif(H.join(' | '), ['0/8 1 2 1 3 1 2 1', '&0123/1']) },
      s: { inst: 'cordes', role: 'tenue', oct: 1, vol: 0.6, notes: 'pp ' + musMotif(cordes.join(' | '), '123/1') },
    },
  });
}

// « Le chemin creux » — la mineur et do majeur, à cinq temps (trois plus deux), comme un pas qui boite un peu
// dans les ornières. Un air qui hésite, se reprend, et finit par s'asseoir au bord du chemin.
{
  const Am = 'a2 e3 c4', F = 'f2 c3 a3', C = 'c3 g3 e4', G = 'g2 d3 b3', Dm7 = 'd3 a3 c4', E7 = 'e2 d3 g#3', Em = 'e2 b2 g3', E4 = 'e2 b2 a3';
  const hA = [Am, F, C, G, Am, F, Dm7, E7], hA2 = [Am, F, C, G, Am, F, E7, Am], hB = [F, G, Em, Am, F, G, E4, E7];
  const H = [Am, Am, ...hA, ...hA2, ...hB, ...hA2, Am, F, E7, Am + ' @1'];
  const a = ['( e5/4 a5/4 g5/4 e5/2', 'f5/4 e5/4 c5/4 a4/2', 'g4/4 c5/4 e5/4 g5/2', 'f5/4 e5/4 d5/4 b4/2 )', '( e5/4 a5/4 b5/4 c6/2', 'a5/4 f5/4 e5/4 c5/2', 'd5/4 f5/4 a5/4 c6/4 b5/4', 'g#5/2. e5/2 )'];
  const a2 = [...a.slice(0, 6), 'd5/4 f5/4 b4/2 g#4/4', 'a4/2. r/2 )'];
  const b = ['mp ( c6/4 a5/4 f5/4 c5/2', 'd5/4 g5/4 b5/4 d6/2', 'b5/4 g5/4 e5/4 b4/2', 'c5/4 e5/4 a5/4 c6/2 )', '( < a5/4 c6/4 f6/4 e6/2', '> d6/4 b5/4 g5/4 d5/2', 'e5/4 a5/4 b5/4 e5/2', 'e5/2. d5/4 b4/4 )'];
  const m = ['r/1 r/4', 'r/1 r/4', 'p ' + a[0], ...a.slice(1), ...a2, ...b, 'p ' + a2[0], ...a2.slice(1), 'pp ( e5/4 a5/4 g5/4 e5/2', 'f5/4 e5/4 c5/4 a4/2', 'b4/4 e5/4 g#4/4 b4/2', 'a4/1 r/4 )'];
  MUSIQUE.ajouter({
    id: 'pres_chemin', titre: 'Le chemin creux', groupe: 'pres', tempo: 84, mesure: '5/4', salle: 'salle', reverb: 0.3, gain: 1.0, temps: 1,
    voix: {
      m: { inst: 'piano', role: 'chant', notes: musMesures('pres_chemin', m, H) },
      g: { inst: 'piano', role: 'accomp', dyn: 0.78, notes: 'pp ' + musMotif(H.join(' | '), ['0/4 12/4 12/4 0/4 12/4', '&012/1 r/4']) },
    },
  });
}
