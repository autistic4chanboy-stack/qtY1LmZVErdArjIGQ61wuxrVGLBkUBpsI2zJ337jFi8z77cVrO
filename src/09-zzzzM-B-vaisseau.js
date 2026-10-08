// ============================================================================
//  LA MUSIQUE (agent M) — LA CITÉ VAISSEAU (groupe « vaisseau » :
//  mondes.actuel() === 'vaisseau', le monde de l'agent G)
//  Compositions originales (agent M) ; voir aussi le prélude BWV 846 de Bach,
//  arrangé pour harpe et cordes (09-zzzzM-3-domaine-public.js).
// ============================================================================

// « Cité dormante » — des accords suspendus, empilés en quartes, que tient une nappe ; le célesta tourne en
// boucle comme une machine qui veille encore ; le verre chante par-dessus, deux fois, la seconde plus haut.
{
  const Em = 'e2 b2 f#3 a3 d4', C = 'c2 g2 d3 e3 a3', Am = 'a1 e2 g2 c3 b3', B4 = 'b1 f#2 e3 a3 c#4';
  const cyc = [Em, Em, C, C, Am, Am, B4, B4];
  const H = [Em, Em, ...cyc, ...cyc, ...cyc, Em, C, Em, Em];
  const v1 = ['( b5/1', 'a5/2 f#5/2', 'g5/1', 'f#5/2 e5/2 )', '( e5/1', 'd5/2 c5/2', 'b4/1', 'a4/2 b4/2 )'];
  const v2 = ['( e6/1', 'd6/2 b5/2', 'c6/1', 'b5/2 a5/2 )', '( a5/1', 'g5/2 e5/2', 'f#5/1', 'e5/1 )'];
  const verre = ['r/1', 'r/1', ...Array(8).fill('r/1'), 'p ' + v1[0], ...v1.slice(1), 'p ' + v2[0], ...v2.slice(1), 'pp ( b5/1', 'g5/1', 'e5/1~', 'e5/1 )'];
  const cel = H.map((c, i) => (i < 2 || i >= 34 ? '-/1' : c));
  MUSIQUE.ajouter({
    id: 'vaisseau_cite', titre: 'Cité dormante', groupe: 'vaisseau', tempo: 60, mesure: '4/4', salle: 'cathedrale', reverb: 0.4, gain: 1.39, pedale: 'aucune',
    voix: {
      v: { inst: 'verre', role: 'chant', notes: musMesures('vaisseau_cite', verre, H) },
      c: { inst: 'celesta', role: 'accomp', oct: 2, vol: 0.55, notes: 'pp ' + musMotif(cel.join(' | '), '1/8 2 3 4 3 2 3 2') },
      n: { inst: 'nappe', role: 'tenue', vol: 0.7, notes: 'pp ' + musMotif(H.join(' | '), '123/1') },
      h: { inst: 'harpe', role: 'accomp', vol: 0.5, notes: 'pp ' + musMotif(H.map((c, i) => (i % 2 === 0 ? c : '-/1')).join(' | '), '&01234/1') },
    },
  });
}

// « Hublots » — des accords majeurs à sept qui tournent par tierces (do, la bémol, mi, do) : à chaque fois, une
// note reste et le reste du monde change autour d'elle, comme une étoile vue par des hublots successifs.
{
  const C = 'c2 g3 b3 e4', Ab = 'ab1 g3 c4 eb4', E = 'e2 g#3 b3 e4', G4 = 'g2 f3 c4 d4', F = 'f2 a3 c4 e4', Db = 'db2 ab3 c4 f4', A = 'a1 g#3 c#4 e4', Bb = 'bb1 a3 d4 f4', Gb = 'gb1 f3 bb3 db4', D = 'd2 a3 c#4 f#4';
  const hA = [C, C, Ab, Ab, E, E, C, G4], hB = [F, Db, A, F, Bb, Gb, D, G4];
  const H = [C, C, ...hA, ...hA, ...hB, ...hA, C, Ab, E, C + ' @1'];
  const a1 = ['( g5/2.', 'e5/4 b5/4 g5/4', 'g5/2.', 'c6/4 eb5/4 g5/4 )', '( b5/2.', 'g#5/4 e5/4 d#5/4', 'e5/2.', 'd5/2 f5/4 )'];
  const a2 = ['( g5/2.', 'b5/4 e6/4 g5/4', 'c6/2.', 'eb6/4 c6/4 g5/4 )', '( g#5/2.', 'b5/4 d#6/4 e6/4', 'e6/4 d6/4 b5/4', 'c6/2. )'];
  const b = ['mp ( a5/2.', 'ab5/2 f5/4', 'g#5/2 e5/4', 'a5/2 c6/4 )', '( < d6/2 a5/4', 'bb5/2 f5/4', '> f#5/2 a5/4', 'g5/2. )'];
  const m = ['r/2.', 'r/2.', 'p ' + a1[0], ...a1.slice(1), ...a2, ...b, 'p ' + a2[0], ...a2.slice(1), 'pp ( g5/2.', 'g5/2.', 'b5/2.~', 'b5/2. )'];
  const ver = [...Array(10).fill('r/2.'), 'pp ' + a2[0], ...a2.slice(1), ...Array(8).fill('r/2.'), 'pp ' + a2[0], ...a2.slice(1), ...Array(4).fill('r/2.')];
  MUSIQUE.ajouter({
    id: 'vaisseau_hublots', titre: 'Hublots', groupe: 'vaisseau', tempo: 63, mesure: '3/4', salle: 'cathedrale', reverb: 0.34, gain: 1.37,
    voix: {
      m: { inst: 'piano', role: 'chant', notes: musMesures('vaisseau_hublots', m, H) },
      v: { inst: 'verre', role: 'chant', oct: 1, vol: 0.55, notes: musMesures('vaisseau_hublots/verre', ver, H) },
      g: { inst: 'piano', role: 'accomp', dyn: 0.78, notes: 'pp ' + musMotif(H.join(' | '), ['0/4 123/2', '&0123/2.']) },
    },
  });
}

// « Les jardins suspendus » — fa dièse majeur, à six-huit, sur les seules touches noires (pentatonique) : les
// serres où quelque chose pousse encore sans personne. La harpe goutte, le célesta chante, les cordes respirent
// la deuxième fois.
{
  const Fs = 'f#2 c#3 g#3 a#3', Dm7 = 'd#2 a#2 c#3 f#3', B = 'b2 f#3 a#3 d#4', C4 = 'c#2 g#2 f#3 b3', Gm7 = 'g#2 d#3 f#3 b3', FC = 'c#2 g#2 f#3 a#3';
  const hA = [Fs, Dm7, B, FC, Fs, Dm7, B, Fs], hB = [Gm7, B, Dm7, C4, Gm7, B, Dm7, C4];
  const H = [Fs, Fs, ...hA, ...hA, ...hB, ...hA, Fs, Fs + ' @1'];
  const a = ['( a#5/4. c#6/4.', 'd#6/4. c#6/8 a#5/8 g#5/8', 'f#5/2.', 'g#5/4. a#5/4. )', '( c#6/4. d#6/4.', 'f#6/4. d#6/8 c#6/8 a#5/8', 'c#6/2.', 'a#5/2. )'];
  const b = ['mp ( d#6/4. b5/4.', 'a#5/4. f#5/4.', 'g#5/4. a#5/8 c#6/8 d#6/8', 'c#6/2. )', '( d#6/4. f#6/4.', 'd#6/4. b5/4.', '< a#5/4. c#6/8 d#6/8 f#6/8', '> g#6/2. )'];
  const m = ['r/2.', 'r/2.', 'p ' + a[0], ...a.slice(1), ...a, ...b, 'p ' + a[0], ...a.slice(1), 'pp ( a#5/2.~', 'a#5/2. )'];
  const cordes = H.map((c, i) => (i >= 10 && i < 18) || (i >= 26 && i < 34) ? c : '-/2.');
  MUSIQUE.ajouter({
    id: 'vaisseau_jardins', titre: 'Les jardins suspendus', groupe: 'vaisseau', tempo: 72, mesure: '6/8', salle: 'cathedrale', reverb: 0.34, gain: 1.27, pedale: 'aucune',
    voix: {
      c: { inst: 'celesta', role: 'chant', notes: musMesures('vaisseau_jardins', m, H) },
      h: { inst: 'harpe', role: 'accomp', vol: 0.6, notes: 'pp ' + musMotif(H.join(' | '), ['0/8 1 2 3 2 1', '&0123/2.']) },
      s: { inst: 'cordes', role: 'tenue', oct: 1, vol: 0.5, notes: 'pp ' + musMotif(cordes.join(' | '), '123/2.') },
    },
  });
}
