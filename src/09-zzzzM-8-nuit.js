// ============================================================================
//  LA MUSIQUE (agent M) — LA NUIT (groupe « nuit », partout dans la vallée)
//  Compositions originales (agent M).
// ============================================================================

// « Veilleuse » — si bémol majeur, à quatre temps. Un nocturne : la main gauche s'ouvre en arpèges, la main droite
// chante à mi-voix ; un détour par sol mineur, puis le chant revient et s'éteint comme une lampe qu'on baisse.
{
  const Bb7 = 'bb1 f2 d3 f3 a3', Gm7 = 'g1 d2 bb2 f3 bb3', Eb7 = 'eb2 bb2 g3 bb3 d4', F7 = 'f2 c3 eb3 a3 c4', F4 = 'f2 c3 eb3 f3 bb3', Cm7 = 'c2 g2 eb3 g3 bb3', Dm7 = 'd2 a2 f3 a3 c4', Gm = 'g2 d3 g3 bb3 d4', D7 = 'd2 a2 f#3 a3 c4', Bb = 'bb1 f2 bb2 d3 f3', EbB = 'bb1 bb2 eb3 g3 d4', Bb9 = 'bb1 f2 c3 d3 a3';
  const A1 = [Bb7, Gm7, Eb7, F7, Bb7, Gm7, Cm7, F7], A2 = [Bb7, Gm7, Eb7, F7, Dm7, Gm7, F4, Bb], B = [Gm, Eb7, Cm7, D7, Gm, Eb7, Cm7, F4];
  const H = [Bb7, Bb7, ...A1, ...A2, ...B, ...A2, Eb7, Bb7, EbB, Bb9 + ' @1'];
  const a1 = ['( f5/2 d5/4 c5/4', 'd5/2. bb4/4', 'g4/4 bb4/4 eb5/4 g5/4', 'f5/2 eb5/2 )', '( d5/2 f5/4 bb5/4', 'a5/2 g5/2', 'g5/4 f5/4 eb5/4 d5/4', 'c5/1 )'];
  const a2 = ['( f5/2 d5/4 c5/4', 'd5/2. bb4/4', 'g4/4 bb4/4 eb5/4 g5/4', 'f5/2 a4/2 )', '( d5/2 f5/4 a5/4', 'bb5/2 a5/4 g5/4', 'f5/2 eb5/2', 'd5/1 )'];
  const b = ['mp ( d5/2 g5/4 bb5/4', 'a5/2. g5/4', 'g5/4 f5/4 eb5/4 c5/4', 'd5/2 f#5/2 )', '( < g5/2 bb5/4 d6/4', '> c6/2 bb5/4 g5/4', 'eb5/2 g5/4 f5/4', 'f5/1 )'];
  const m = ['r/1', 'r/1', 'p ' + a1[0], ...a1.slice(1), ...a2, ...b, 'p ' + a2[0], ...a2.slice(1), 'pp ( g5/1', 'f5/1', 'g5/2 eb5/2', 'd5/1 )'];
  MUSIQUE.ajouter({
    id: 'nuit_veilleuse', titre: 'Veilleuse', groupe: 'nuit', tempo: 56, mesure: '4/4', salle: 'salle', reverb: 0.32, gain: 1.0, rubato: 0.03,
    voix: {
      m: { inst: 'piano', role: 'chant', notes: musMesures('nuit_veilleuse', m, H) },
      g: { inst: 'piano', role: 'accomp', dyn: 0.78, notes: 'pp ' + musMotif(H.join(' | '), ['0/8 1 2 3 4 3 2 1', '&01234/1']) },
    },
  });
}

// « Berceuse des granges » — mi bémol majeur, à six-huit. On berce ; le foin sent encore le jour. La dernière fois,
// le célesta double l'air à l'octave, très doucement, comme une étoile au-dessus du toit.
{
  const Eb = 'eb2 g3 bb3', Cm7 = 'c2 g3 bb3', Fm7 = 'f2 ab3 c4', BbD = 'd2 f3 bb3', Ab7 = 'ab2 eb3 c4', Bb7 = 'bb1 ab3 d4', Cm = 'c2 g3 c4';
  const A = [Eb, Cm7, Fm7, Eb, Eb, BbD, Ab7, Bb7], B = [Cm, Fm7, Bb7, Eb, Cm, Ab7, Bb7, Eb], Af = [Eb, Cm7, Fm7, Eb, Eb, BbD, Bb7, Eb];
  const H = [Eb, Eb, ...A, ...B, ...Af, Ab7, Eb, Ab7, Eb + ' @1'];
  const a = ['( bb4/4 g4/8 bb4/4 c5/8', 'bb4/4. g4/4. )', '( ab4/4 f4/8 ab4/4 bb4/8', 'g4/4. eb4/4. )', '( bb4/4 g4/8 bb4/4 c5/8', 'd5/4. bb4/4. )', '( c5/4 ab4/8 f4/4 ab4/8', 'g4/4. f4/4. )'];
  const af = [...a.slice(0, 6), '( c5/4 ab4/8 f4/4 d4/8', 'eb4/2. )'];
  const b = ['mp ( eb5/4 d5/8 c5/4 bb4/8', 'c5/4. ab4/4. )', '( bb4/4 ab4/8 g4/4 f4/8', 'g4/4. bb4/4. )', '( eb5/4 d5/8 c5/4 bb4/8', 'ab4/4. c5/4. )', '( bb4/4 g4/8 f4/4 g4/8', 'eb4/2. )'];
  const m = ['r/2.', 'r/2.', 'p ' + a[0], ...a.slice(1), ...b, 'p ' + af[0], ...af.slice(1), 'pp ( c5/2.', 'bb4/2.', 'ab4/4. c5/4.', 'bb4/2. )'];
  const cel = [...Array(18).fill('r/2.'), 'pp ' + af[0], ...af.slice(1), 'r/2.', 'r/2.', 'r/2.', 'r/2.'];
  MUSIQUE.ajouter({
    id: 'nuit_berceuse', titre: 'Berceuse des granges', groupe: 'nuit', tempo: 66, mesure: '6/8', salle: 'chambre', reverb: 0.34, gain: 1.0, rubato: 0.025,
    voix: {
      m: { inst: 'piano', role: 'chant', notes: musMesures('nuit_berceuse', m, H) },
      g: { inst: 'piano', role: 'accomp', dyn: 0.78, notes: 'pp ' + musMotif(H.join(' | '), ['0/4. 12/4.', '&012/2.']) },
      c: { inst: 'celesta', role: 'chant', oct: 1, vol: 0.45, notes: musMesures('nuit_berceuse/célesta', cel, H) },
    },
  });
}

// « Nuit claire » — la bémol majeur, à trois temps. Une nuit sans nuages : la harpe égrène, les cordes chantent
// lentement, et la lune se lève au milieu (fa mineur, puis un ut majeur qui éclaire tout).
{
  const Ab = 'ab2 eb3 ab3 c4', Fm7 = 'f2 c3 eb3 ab3', Db7 = 'db2 ab2 f3 c4', Eb7 = 'eb2 bb2 db3 g3', AbC = 'c2 ab2 eb3 ab3', Bbm7 = 'bb2 f3 ab3 db4', Fm = 'f2 c3 f3 ab3', C7 = 'c2 g2 bb2 e3', Eb4 = 'eb2 bb2 db3 ab3';
  const hA = [Ab, Fm7, Db7, Eb7, AbC, Db7, Bbm7, Eb7], hA2 = [Ab, Fm7, Db7, Eb7, AbC, Db7, Eb7, Ab], hB = [Fm, Db7, Bbm7, C7, Fm, Db7, Bbm7, Eb4];
  const H = [Ab, Ab, ...hA, ...hA2, ...hB, ...hA2, Db7, AbC, Eb7, Ab, Ab + ' @1'];
  const a = ['( c5/2.', 'c5/4 ab4/4 f4/4', 'f4/2 ab4/4', 'g4/2. )', '( ab4/4 c5/4 eb5/4', 'f5/2 c5/4', 'db5/2 c5/4', 'bb4/2. )'];
  const a2 = [...a.slice(0, 4), '( ab4/4 c5/4 eb5/4', 'f5/2 ab5/4', 'g5/4 f5/4 eb5/4', 'ab4/2. )'];
  const b = ['mp ( c5/4 f5/4 ab5/4', 'ab5/2 f5/4', 'f5/2 db5/4', 'e5/2. )', '( < f5/4 ab5/4 c6/4', '> c6/2 ab5/4', 'db5/2 f5/4', 'eb5/2. )'];
  const m = ['r/2.', 'r/2.', 'p ' + a[0], ...a.slice(1), ...a2, ...b, 'p ' + a2[0], ...a2.slice(1), 'pp ( f5/2.', 'eb5/2.', 'db5/2 bb4/4', 'c5/2.~', 'c5/2. )'];
  MUSIQUE.ajouter({
    id: 'nuit_claire', titre: 'Nuit claire', groupe: 'nuit', tempo: 58, mesure: '3/4', salle: 'salle', reverb: 0.36, gain: 1.0, pedale: 'aucune',
    voix: {
      s: { inst: 'cordes', role: 'chant', notes: musMesures('nuit_claire', m, H) },
      h: { inst: 'harpe', role: 'accomp', vol: 0.75, notes: 'pp ' + musMotif(H.join(' | '), ['0/8 1 2 3 2 1', '&0123/2.']) },
    },
  });
}
