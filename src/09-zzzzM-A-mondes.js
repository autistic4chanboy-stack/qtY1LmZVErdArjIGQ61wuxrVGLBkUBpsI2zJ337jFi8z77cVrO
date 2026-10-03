// ============================================================================
//  LA MUSIQUE (agent M) — LES AUTRES MONDES : le pays des bonbons (« bonbons »),
//  les Ténèbres (« tenebres »), les Enfers (« enfers »). Rien dans le cauchemar.
//  Compositions originales (agent M) ; « Au clair de la lune » est un air
//  populaire français du XVIIIᵉ siècle (domaine public) — c'est l'air que
//  joue, déformée, la boîte à musique de ces mondes (11-zzz70-mondes.js).
// ============================================================================

// ---------------------------------------------------------------- LE PAYS DES BONBONS
// « Au clair de la lune, au pays du sucre » — sol majeur. L'air de la boîte à musique du monde, enfin juste :
// la boîte le chante, le célesta le reprend une octave plus haut pendant que la boîte tient une seconde voix,
// puis la boîte seule, qui ralentit comme un ressort qui se détend.
{
  const hA = ['g2/4 d3+g3+b3/4 d2/4 d3+g3+b3/4', 'g2/4 d3+g3+b3/4 d2/4 d3+f#3+a3/4', 'g2/4 d3+g3+b3/4 d2/4 d3+f#3+c4/4', 'g2/4 d3+g3+b3/4 g2/2'];
  const hB = ['d2/4 a2+d3+f#3/4 a1/4 a2+d3+f#3/4', 'a1/4 a2+c#3+e3/4 e2/4 a2+c#3+g3/4', 'd2/4 a2+d3+f#3/4 a1/4 a2+c#3+g3/4', 'd2/4 a2+d3+f#3/4 d2/2'];
  const air = { A: ['g5/4 g5/4 g5/4 a5/4', 'b5/2 a5/2', 'g5/4 b5/4 a5/4 a5/4', 'g5/1'], B: ['a5/4 a5/4 a5/4 a5/4', 'e5/2 e5/2', 'a5/4 g5/4 f#5/4 e5/4', 'd5/1'] };
  const ph = (L) => ['( ' + L[0], L[1], L[2], L[3] + ' )'];
  const seconde = { A: ['d5/2 e5/2', 'g5/2 f#5/2', 'e5/2 f#5/2', 'g5/1'], B: ['f#5/2 d5/2', 'c#5/2 c#5/2', 'd5/2 c#5/2', 'd5/1'] };
  const H = ['g2/4 d3+g3+b3/4 d2/4 d3+g3+b3/4', 'g2/4 d3+g3+b3/4 d2/4 d3+g3+b3/4', ...hA, ...hA, ...hB, ...hA, ...hA, ...hA, ...hB, ...hA, ...hA, '&g2+d3+g3+b3+d4/1'];
  const r16 = Array(16).fill('r/1');
  const boite = ['r/1', 'r/1', 'mp ' + ph(air.A)[0], ...ph(air.A).slice(1), ...ph(air.A), ...ph(air.B), ...ph(air.A),
    'p ' + seconde.A[0], ...seconde.A.slice(1), ...seconde.A, ...seconde.B, ...seconde.A,
    'p ' + ph(air.A)[0], ...ph(air.A).slice(1), 'r/1'];
  const cel = ['r/1', 'r/1', ...r16, 'mp ' + ph(air.A)[0], ...ph(air.A).slice(1), ...ph(air.A), ...ph(air.B), ...ph(air.A), 'r/1', 'r/1', 'r/1', 'r/1', 'r/1'];
  MUSIQUE.ajouter({
    id: 'bonbons_clair', titre: 'Au clair de la lune, au pays du sucre', groupe: 'bonbons', tempo: 92, mesure: '4/4', salle: 'salle', reverb: 0.3, gain: 1.0, pedale: 'aucune', respire: 4, finRit: 4,
    voix: {
      b: { inst: 'boite', role: 'chant', notes: musMesures('bonbons_clair', boite, H) },
      c: { inst: 'celesta', role: 'chant', oct: 1, vol: 0.85, notes: musMesures('bonbons_clair/célesta', cel, H) },
      h: { inst: 'harpe', role: 'accomp', vol: 0.7, notes: 'p ' + H.join(' | ') + ' |' },
    },
  });
}

// « Sucre filé » — la majeur, une valse légère. Le célesta tourne, la harpe fait « boum-tchic-tchic », la boîte
// à musique se joint à la danse la deuxième fois.
{
  const A = 'a2 e3 a3 c#4', D = 'd2 f#3 a3 d4', E7 = 'e2 g#3 b3 d4', Fm = 'f#2 a3 c#4 f#4', Bm7 = 'b2 f#3 a3 d4', E = 'e2 g#3 b3 e4';
  const sA = [A, A, D, A, E7, E7, A, E7], sA2 = [A, A, D, A, E7, E7, E7, A], sB = [Fm, Fm, D, E, Bm7, A, E7, E7];
  const H = [A, A, ...sA, ...sA2, ...sB, ...sA2, ...sB, ...sA2, A, D, A, A + ' @1'];
  const mA = ['( c#6/4 e6/4 a6/4', 'g#6/2 e6/4', 'f#6/4 a6/4 d6/4', 'c#6/2. )', '( b5/4 d6/4 g#6/4', 'f#6/2 e6/4', 'c#6/4 e6/4 a5/4', 'b5/2. )'];
  const mA2 = [...mA.slice(0, 6), 'e6/4 d6/4 b5/4', 'a5/2. )'];
  const mB = ['( a5/4 c#6/4 f#6/4', 'e6/2 c#6/4', 'd6/4 f#6/4 a6/4', 'g#6/2. )', '( f#6/4 e6/4 d6/4', 'c#6/2 a5/4', 'b5/4 c#6/4 d6/4', 'e6/2. )'];
  const cel = ['r/2.', 'r/2.', 'mp ' + mA[0], ...mA.slice(1), ...mA2, ...mB, ...mA2, ...mB, ...mA2, 'p ( a6/2.', 'f#6/2.', 'e6/2.~', 'e6/2. )'];
  const boite = [...Array(34).fill('r/2.'), 'p ' + mB[0], ...mB.slice(1), ...Array(12).fill('r/2.')];
  MUSIQUE.ajouter({
    id: 'bonbons_sucre', titre: 'Sucre filé', groupe: 'bonbons', tempo: 116, mesure: '3/4', salle: 'salle', reverb: 0.28, gain: 1.0, pedale: 'aucune',
    voix: {
      c: { inst: 'celesta', role: 'chant', notes: musMesures('bonbons_sucre', cel, H) },
      b: { inst: 'boite', role: 'chant', oct: -1, vol: 0.6, notes: musMesures('bonbons_sucre/boîte', boite, H) },
      h: { inst: 'harpe', role: 'accomp', vol: 0.65, notes: 'pp ' + musMotif(H.join(' | '), ['0/4 123/4 123/4', '&0123/2.']) },
    },
  });
}

// « Le manège » — ré majeur, à six-huit. Un manège de foire qui tourne tout seul : la boîte à musique, le piano
// en « boum-tchac » ; la deuxième phrase glisse par des notes voisines (un peu de travers, comme le sucre qui fond),
// et à la fin le ressort se détend.
{
  const D = 'd3 f#3 a3', Bm = 'b2 d3 f#3', G = 'g2 b2 d3', A7 = 'a2 c#3 g3', Dp = 'd3 f#3 a#3', GmD = 'd3 g3 bb3', B7 = 'b2 d#3 a3';
  const s1 = [D, Bm, G, A7, D, Bm, A7, D], s2 = [D, Dp, G, GmD, D, B7, A7, D];
  const H = [D, D, ...s1, ...s2, ...s1, ...s2, D, D + ' @1'];
  const m1 = ['( a5/4 f#5/8 d6/4 a5/8', 'b5/4. f#5/4. )', '( g5/4 b5/8 d6/4 b5/8', 'a5/4. e5/4. )', '( f#5/4 d5/8 a5/4 f#5/8', 'g5/4 f#5/8 d5/4 b4/8 )', '( e5/4 g5/8 c#5/4 e5/8', 'd5/4. r/4. )'];
  const m2 = ['( a5/4 f#5/8 d6/4 a5/8', 'a#5/4. f#5/4. )', '( b5/4 g5/8 d6/4 b5/8', 'bb5/4. g5/4. )', '( a5/4 f#5/8 d5/4 f#5/8', 'a5/4 b5/8 d#5/4 f#5/8 )', '( g5/4 e5/8 c#5/4 a4/8', 'd5/4. r/4. )'];
  const m = ['r/2.', 'r/2.', 'mp ' + m1[0], ...m1.slice(1), ...m2, 'p ' + m1[0], ...m1.slice(1), ...m2, 'pp ( d6/4. a5/4.', 'd5/2. )'];
  MUSIQUE.ajouter({
    id: 'bonbons_manege', titre: 'Le manège', groupe: 'bonbons', tempo: 72, mesure: '6/8', salle: 'salle', reverb: 0.28, gain: 1.0, finRit: 4,
    voix: {
      b: { inst: 'boite', role: 'chant', notes: musMesures('bonbons_manege', m, H) },
      g: { inst: 'piano', role: 'accomp', dyn: 0.7, notes: 'pp ' + musMotif(H.join(' | '), ['0/8 12 12 0 12 12', '&012/2.']) },
    },
  });
}

// ---------------------------------------------------------------- LES TÉNÈBRES
// « Clair de lune noir » — ut mineur, très lent. Le même air, mais au fond d'un puits : en mineur, sous des
// accords sombres et arpégés ; la deuxième fois, c'est le verre qui le chante, comme une voix qui n'est plus là.
{
  const Cm9 = 'c2 g2 eb3 d4', Ab = 'ab1 eb2 c3 g3', G9 = 'g1 d2 b2 f3 ab3', CmB = 'bb1 g2 c3 eb3', Ab7 = 'ab1 eb2 g2 c3', Fm9 = 'f1 c2 ab2 eb3 g3', G7 = 'g1 d2 b2 f3', Fm = 'f1 c2 f2 ab2', G = 'g1 d2 g2 b2';
  const hA1 = [Cm9, Ab, G9, Cm9], hA2 = [CmB, Ab7, Fm9, Cm9], hB = [G7, Fm, G9, G];
  const H = [Cm9, Cm9, ...hA1, ...hA2, ...hB, ...hA1, ...hA1, ...hA2, ...hB, ...hA2, Cm9, Cm9 + ' @1'];
  const A = ['( c5/4 c5/4 c5/4 d5/4', 'eb5/2 d5/2', 'c5/4 eb5/4 d5/4 d5/4', 'c5/1 )'], B = ['( d5/4 d5/4 d5/4 d5/4', 'ab4/2 ab4/2', 'd5/4 c5/4 b4/4 ab4/4', 'g4/1 )'];
  const r16 = Array(16).fill('r/1');
  const piano = ['r/1', 'r/1', 'p ' + A[0], ...A.slice(1), ...A, ...B, ...A, ...r16, 'r/1', 'r/1'];
  const verre = ['r/1', 'r/1', ...r16, 'p ' + A[0], ...A.slice(1), ...A, ...B, ...A, 'r/1', 'r/1'];
  MUSIQUE.ajouter({
    id: 'tenebres_clair', titre: 'Clair de lune noir', groupe: 'tenebres', tempo: 54, mesure: '4/4', salle: 'grotte', reverb: 0.42, gain: 1.0, rubato: 0.03,
    voix: {
      m: { inst: 'piano', role: 'chant', notes: musMesures('tenebres_clair', piano, H) },
      v: { inst: 'verre', role: 'chant', vol: 0.9, notes: musMesures('tenebres_clair/verre', verre, H) },
      g: { inst: 'piano', role: 'accomp', dyn: 0.7, notes: 'pp ' + musMotif(H.join(' | '), ['&0123/1', '&01234/1']) },
    },
  });
}

// « Cendres » — si bémol mineur, à trois temps. Ce qui reste quand le feu est passé : une ligne simple, des
// accords à demi-voix, un fa majeur qui s'ouvre à la fin de chaque phrase comme une porte sur rien.
{
  const Bbm = 'bb1 f3 db4', Gb7 = 'gb1 f3 bb3', Ebm9 = 'eb2 gb3 db4', F4 = 'f2 eb3 bb3', Db7 = 'db2 ab3 c4', Gb11 = 'gb1 f3 c4', F = 'f1 c3 a3', F7 = 'f1 eb3 a3', Db = 'db2 f3 ab3', AbC = 'c2 eb3 ab3', FmAb = 'ab1 f3 c4', DbF = 'f2 ab3 db4', Ebm7 = 'eb2 db3 gb3';
  const hA = [Bbm, Gb7, Ebm9, F4, Bbm, Db7, Gb11, F], hA2 = [Bbm, Gb7, Ebm9, F4, Bbm, Gb7, F7, Bbm], hB = [Db, AbC, Bbm, FmAb, Gb7, DbF, Ebm7, F7];
  const H = [Bbm, Bbm, ...hA, ...hA2, ...hB, ...hA2, Gb7, F, Bbm, Bbm + ' @1'];
  const a = ['( f5/2.', 'f5/4 db5/4 bb4/4', 'gb5/2.', 'f5/2 eb5/4 )', '( db5/2 c5/4', 'db5/4 f5/4 ab5/4', 'c6/2 bb5/4', 'a5/2. )'];
  const a2 = [...a.slice(0, 4), '( db5/2 c5/4', 'bb4/4 db5/4 f5/4', 'gb5/2 f5/4', 'bb4/2. )'];
  const b = ['mp ( ab5/2 f5/4', 'eb5/2 c5/4', 'db5/2.', 'c5/2. )', '( < bb4/4 db5/4 gb5/4', 'f5/2 ab5/4', '> gb5/4 f5/4 eb5/4', 'c5/2. )'];
  const m = ['r/2.', 'r/2.', 'p ' + a[0], ...a.slice(1), ...a2, ...b, 'p ' + a2[0], ...a2.slice(1), 'pp ( gb5/2.', 'f5/2.', 'db5/2.~', 'db5/2. )'];
  MUSIQUE.ajouter({
    id: 'tenebres_cendres', titre: 'Cendres', groupe: 'tenebres', tempo: 54, mesure: '3/4', salle: 'grotte', reverb: 0.38, gain: 1.0, rubato: 0.03,
    voix: {
      m: { inst: 'piano', role: 'chant', notes: musMesures('tenebres_cendres', m, H) },
      g: { inst: 'piano', role: 'accomp', dyn: 0.75, notes: 'pp ' + musMotif(H.join(' | '), ['0/4 12/2', '&012/2.']) },
      s: { inst: 'cordes', role: 'tenue', oct: 1, vol: 0.45, notes: 'pp ' + musMotif(H.join(' | ').replace(' @1', ''), '0/2.') },
    },
  });
}

// « Les yeux fermés » — des accords majeurs à la quarte augmentée qui glissent d'un ton à l'autre, sans appui :
// on ne sait plus où est le bas. Le célesta chante d'abord, puis le verre ; la nappe tient le fond.
{
  const C = 'c2 g2 e3 b3 f#4', D = 'd2 a2 f#3 c#4 g#4', Bb = 'bb1 f2 d3 a3 e4', Ab = 'ab1 eb2 c3 g3 d4', E = 'e2 b2 g#3 d#4 a#4';
  const h1 = [C, D, C, Bb, Ab, Bb, C, C], h2 = [C, D, E, D, C, Bb, Ab, C];
  const H = [C, C, ...h1, ...h2, ...h1, ...h2, C, C + ' @1'];
  const m1 = ['( e6/2 f#6/2', 'f#6/2 e6/2', 'd6/1', 'd6/2 c6/2 )', '( c6/2 bb5/2', 'a5/1', 'b5/2 f#6/2', 'e6/1 )'];
  const m2 = ['( e6/2 f#6/2', 'a6/2 g#6/2', 'g#6/2 f#6/2', 'e6/2 c#6/2 )', '( b5/1', 'a5/2 f5/2', 'g5/2 eb5/2', 'e5/1 )'];
  const r16 = Array(16).fill('r/1');
  const cel = ['r/1', 'r/1', 'p ' + m1[0], ...m1.slice(1), ...m2, ...r16, 'r/1', 'r/1'];
  const ver = ['r/1', 'r/1', ...r16, 'p ' + m1[0], ...m1.slice(1), ...m2, 'r/1', 'r/1'];
  MUSIQUE.ajouter({
    id: 'tenebres_yeux', titre: 'Les yeux fermés', groupe: 'tenebres', tempo: 58, mesure: '4/4', salle: 'cathedrale', reverb: 0.36, gain: 1.0, pedale: 'mesure',
    voix: {
      c: { inst: 'celesta', role: 'chant', notes: musMesures('tenebres_yeux', cel, H) },
      v: { inst: 'verre', role: 'chant', oct: -1, vol: 0.9, notes: musMesures('tenebres_yeux/verre', ver, H) },
      g: { inst: 'piano', role: 'accomp', dyn: 0.65, notes: 'pp ' + musMotif(H.join(' | '), ['&01234/1', '&01234/1']) },
      n: { inst: 'nappe', role: 'tenue', vol: 0.8, notes: 'pp ' + musMotif(H.join(' | ').replace(' @1', ''), '123/1') },
    },
  });
}

// ---------------------------------------------------------------- LES ENFERS
// « Les portes » — ré mineur, un choral d'orgue très lent, à demi-voix ; une cloche grave, de loin en loin. La
// deuxième fois, les cordes chantent au-dessus.
{
  const ch = ['d3+f3+a3+f4/2 c3+f3+a3+e4/2', 'bb2+f3+bb3+d4/2 bb2+g3+bb3+d4/2', 'a2+e3+a3+c#4/1', 'd3+f3+a3+d4/1',
    'f2+c3+f3+a4/2 e2+c3+g3+g4/2', 'd2+a2+f3+f4/2 c2+a2+e3+e4/2', 'bb1+bb2+f3+d4/2 a1+a2+e3+c#4/2', 'd2+a2+f3+d4/1'];
  const H = ['d2+a2+d3/1', 'd2+a2+d3/1', ...ch, ...ch, 'd2+a2+f3+d4/1', 'd2+a2+f#3+d4/1'];
  const cordes = ['r/1', 'r/1', ...Array(8).fill('r/1'), 'p ( f5/2 e5/2', 'd5/1', 'c#5/1', 'd5/1 )', '( a5/2 g5/2', 'f5/2 e5/2', 'd5/2 c#5/2', 'd5/1 )', 'r/1', 'r/1'];
  const cloche = ['pp d3/1', 'r/1', 'd3/1', 'r/1', 'r/1', 'r/1', 'a2/1', 'r/1', 'r/1', 'r/1', 'd3/1', 'r/1', 'r/1', 'r/1', 'a2/1', 'r/1', 'r/1', 'r/1', 'd3/1', 'r/1'];
  MUSIQUE.ajouter({
    id: 'enfers_portes', titre: 'Les portes', groupe: 'enfers', tempo: 44, mesure: '4/4', salle: 'cathedrale', reverb: 0.4, gain: 1.0, finRit: 2,
    voix: {
      o: { inst: 'orgue', role: 'tenue', notes: 'pp ' + musMesures('enfers_portes', H, H) },
      s: { inst: 'cordes', role: 'chant', vol: 0.9, notes: musMesures('enfers_portes/cordes', cordes, H) },
      k: { inst: 'cloche', role: 'accomp', vol: 0.55, notes: musMesures('enfers_portes/cloche', cloche, H) },
    },
  });
}

// « Le fleuve de braise » — ut dièse phrygien. Une main gauche qui roule sans fin (le ré naturel, une demi-marche
// au-dessus de la tonique, qui brûle un peu) ; par-dessus, les cordes chantent grave et lent.
{
  const Cm = 'c#2 g#2 c#3 d3', A = 'a1 e2 a2 b2', Fm = 'f#1 c#2 f#2 a2', G = 'g#1 d#2 g#2 a2';
  const cyc = [Cm, Cm, A, A, Fm, Fm, G, G];
  const H = [Cm, Cm, ...cyc, ...cyc, ...cyc, Cm, Cm + ' @1'];
  const c1 = ['( g#3/1', 'e4/2 d4/2', 'c#4/1', 'e4/2 g#4/2 )', '( f#4/1', 'a4/2 g#4/4 f#4/4', 'e4/1', 'd#4/1 )'];
  const c2 = ['( c#5/1', 'b4/2 a4/2', 'a4/1', 'g#4/2 e4/2 )', '( f#4/2. g#4/4', 'a4/2 c#5/2', 'b#4/1', 'g#4/1 )'];
  const s = ['r/1', 'r/1', 'p ' + c1[0], ...c1.slice(1), 'mp ' + c2[0], ...c2.slice(1), 'pp ' + c1[0], ...c1.slice(1), 'c#4/1~', 'c#4/1'];
  const k = ['pp c#3/1', 'r/1', ...[0, 1, 2].flatMap(() => ['c#3/1', ...Array(7).fill('r/1')]), 'r/1', 'r/1'];
  MUSIQUE.ajouter({
    id: 'enfers_fleuve', titre: 'Le fleuve de braise', groupe: 'enfers', tempo: 58, mesure: '4/4', salle: 'grotte', reverb: 0.36, gain: 1.0, pedale: 'demi',
    voix: {
      s: { inst: 'cordes', role: 'chant', notes: musMesures('enfers_fleuve', s, H) },
      g: { inst: 'piano', role: 'accomp', dyn: 0.7, notes: 'pp ' + musMotif(H.join(' | '), ['0/8 1 2 1 3 1 2 1', '&0123/1']) },
      k: { inst: 'cloche', role: 'accomp', vol: 0.45, notes: musMesures('enfers_fleuve/cloche', k, H) },
    },
  });
}

// « Descente » — sol mineur, à trois temps. Une basse qui descend d'un demi-ton à chaque mesure (sol, fa dièse,
// fa, mi, mi bémol, ré), quatre fois ; l'orgue tient les accords, les cordes chantent ; et la dernière mesure,
// contre toute attente, est en sol majeur.
{
  const cyc = ['g2+g3+bb3+d4/2.', 'f#2+f#3+a3+d4/2.', 'f2+f3+bb3+d4/2.', 'e2+e3+g3+c4/2.', 'eb2+eb3+g3+bb3/2.', 'd2+d3+f#3+a3/2.'];
  const H = [...cyc, ...cyc, ...cyc, ...cyc, 'g2+g3+bb3+d4/2.', 'g2+d3+g3+b3/2.'];
  const c1 = ['( d5/2.', 'c5/2 a4/4', 'bb4/2.', 'g4/2 c5/4', 'bb4/2 g4/4', 'f#4/2. )'];
  const c2 = ['( g5/2 f5/4', 'f#5/2 d5/4', 'f5/2 d5/4', 'e5/2 g5/4', 'g5/4 f5/4 eb5/4', 'd5/2. )'];
  const c3 = ['( bb5/2.', 'a5/2 f#5/4', 'bb5/4 a5/4 f5/4', 'g5/2 e5/4', 'g5/2 bb5/4', 'a5/2. )'];
  const s = ['p ' + c1[0], ...c1.slice(1), 'mp ' + c2[0], ...c2.slice(1), '< ' + c3[0], ...c3.slice(1, 3), '> ' + c3[3], ...c3.slice(4), 'pp ' + c1[0], ...c1.slice(1), 'g4/2.~', 'g4/2.'];
  MUSIQUE.ajouter({
    id: 'enfers_descente', titre: 'Descente', groupe: 'enfers', tempo: 50, mesure: '3/4', salle: 'cathedrale', reverb: 0.36, gain: 1.0, finRit: 2,
    voix: {
      o: { inst: 'orgue', role: 'tenue', notes: 'pp ' + musMesures('enfers_descente', H, H) },
      s: { inst: 'cordes', role: 'chant', notes: musMesures('enfers_descente/cordes', s, H) },
    },
  });
}
