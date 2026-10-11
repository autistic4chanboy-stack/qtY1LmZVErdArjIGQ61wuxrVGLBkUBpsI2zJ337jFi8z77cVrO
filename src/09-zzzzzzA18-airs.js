// ============================================================================
//  LES AIRS (A18) — 1. LE COMPOSITEUR, LES RÉPERTOIRES, LES SÉANCES
//  Les musiciens de la vallée (le violoneux de la place, celui des noces, le
//  fifre des saltimbanques, les vielleux, le petit Savoyard, les chanteurs,
//  le pianiste du Cercle) jouent les airs de leur temps et de leur pays :
//  bourrées, rigaudons, gavottes, branles, marches, rondes, et les danses à la
//  mode depuis 1840 (polka, scottish, mazurka, valse) ; des complaintes, des
//  cantiques, des berceuses. Chaque air est composé ici d'une graine (le
//  monde, le musicien, le numéro de l'air) : la même graine, le même air.
//  La forme : deux parties de huit mesures (A, B), chacune jouée deux fois
//  (AABB), ouverte la première fois (demi-cadence sur la dominante), fermée la
//  seconde (cadence parfaite) ; les complaintes et les cantiques en couplets
//  (A ouverte, B fermée). Une harmonie de musique populaire (I, IV, V ; les
//  modes : majeur, mineur, dorien, mixolydien), une carrure (la quatrième
//  mesure respire, la huitième conclut), un motif d'une mesure repris,
//  transposé sur l'accord suivant (marche), varié ; l'ambitus de
//  l'instrument ; des ornements (petites notes, trilles aux cadences, doubles
//  cordes du violon sur les cordes à vide, liaisons) ; une reprise variée.
//  Trois airs du domaine public dont on est sûr : « Au clair de la lune »,
//  « Ah ! vous dirai-je, maman », « Frère Jacques ».
//  Une séance : trois à six airs, jamais deux fois le même de suite, des
//  pauses de quatre à quinze secondes, parfois un long repos, l'instrument
//  qu'on accorde ; l'humeur selon l'heure (vif le jour et les jours de fête,
//  complaintes au crépuscule).
//  API : AIRS18.composer(style, graine, inst), AIRS18.connu(nom, inst),
//  AIRS18.repertoire(graine, musicien), new AIRS18.Session(musicien, graine),
//  AIRS18.accord(inst, graine). (On les joue : 09-zzzzzzA18-jeu.js ; on les
//  donne aux musiciens : 11-zzzzzzzzzA18-musiciens.js.)
//  Notes rendues : { m (midi | null), d (temps, à la noire), v (0..1), l (lié à
//  la suivante), g (petite note, midi), tr (trille), ds (double corde, midi),
//  f (fin de phrase), gl (glissé d'accord, cents) }.
// ============================================================================
const AIRS18 = (() => {
  // ---------------------------------------------------------------- hasard, outils
  const alea = (s) => { let a = s >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const hache = (...a) => { let h = 2166136261 >>> 0; for (const x of a) { const s = String(x); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } h = Math.imul(h ^ 0x5bd1, 16777619) >>> 0; } return h >>> 0; };
  const tirer = (R, L) => { let tot = 0; for (const x of L) tot += Math.max(0, x[1]); let r = R() * tot; for (const x of L) { r -= Math.max(0, x[1]); if (r <= 0) return x[0]; } return L[L.length - 1][0]; };
  const entre = (R, a, b) => a + R() * (b - a);
  const mod7 = (x) => ((x % 7) + 7) % 7;

  // ---------------------------------------------------------------- les modes, les accords
  const MODES = { maj: [0, 2, 4, 5, 7, 9, 11], min: [0, 2, 3, 5, 7, 8, 10], dor: [0, 2, 3, 5, 7, 9, 10], mix: [0, 2, 4, 5, 7, 9, 10] };
  // un degré (entier, 0 = la tonique, 7 = son octave) → demi-tons au-dessus de la tonique
  const demi = (mode, d) => { const S = MODES[mode], o = Math.floor(d / 7); return 12 * o + S[d - 7 * o]; };
  // d est-il une note de l'accord de fondamentale r (degrés) ?
  const dansAccord = (d, r) => { const k = mod7(d - r); return k === 0 || k === 2 || k === 4; };

  // ---------------------------------------------------------------- les instruments (ambitus, tons)
  // bas, haut : midi ; tons : [tonique midi, mode, poids]
  const INST = {
    violon: { bas: 55, haut: 88, tons: [[67, 'maj', 4], [62, 'maj', 4], [69, 'maj', 3], [64, 'min', 2], [69, 'dor', 2], [62, 'dor', 1.5], [69, 'min', 1.5], [67, 'mix', 1], [60, 'maj', 0.8]] },
    fifre: { bas: 74, haut: 95, tons: [[74, 'maj', 4], [79, 'maj', 3], [76, 'dor', 1], [81, 'mix', 1], [76, 'min', 1]] },
    vielle: { bas: 67, haut: 86, tons: [[67, 'maj', 4], [72, 'maj', 3], [67, 'mix', 2], [67, 'dor', 2], [72, 'mix', 1]] },
    voix: { bas: 60, haut: 77, tons: [[65, 'maj', 3], [67, 'maj', 3], [62, 'maj', 2], [64, 'min', 1.5], [69, 'min', 1.5], [62, 'dor', 1]] },
    piano: { bas: 60, haut: 89, tons: [[60, 'maj', 3], [65, 'maj', 3], [67, 'maj', 3], [62, 'maj', 2], [70, 'maj', 1.5], [69, 'min', 1.5], [62, 'min', 1.5]] },
  };

  // ---------------------------------------------------------------- les styles
  // mes : la mesure ; bar : sa longueur (noires) ; temps : les temps (positions), fort : les positions fortes ;
  // bpm : noires par minute ; cel : les cellules rythmiques d'une mesure (durées, négatif = silence) et leur poids ;
  // demi, fin : les mesures de cadence ; levee : l'anacrouse (noires) ; modes : [mode, poids] (le mode du ton tiré
  // l'emporte s'il est permis) ; forme : 'AABB' (danses) ou 'AB' (couplets) ; lie : la part des liaisons (violon) ;
  // vif : danse vive (l'humeur) ; acc : l'accent de la mesure (positions)
  const STYLES = {
    bourree: { nom: 'bourrée', mes: '3/8', bar: 1.5, temps: [0, 0.5, 1], fort: [0], bpm: [150, 172], levee: 0.5, forme: 'AABB', vif: 1, lie: 0.45, acc: [0],
      cel: [[[0.5, 0.5, 0.5], 3], [[0.75, 0.25, 0.5], 3], [[1, 0.5], 2], [[0.5, 1], 1], [[0.25, 0.25, 0.5, 0.5], 1.5], [[0.5, 0.25, 0.25, 0.5], 1]],
      demi: [[1, 0.5], [0.5, 1], [1.5]], fin: [[1, -0.5], [1.5]], modes: [['maj', 4], ['dor', 1.5], ['mix', 1.5], ['min', 1]] },
    rigaudon: { nom: 'rigaudon', mes: '2/4', bar: 2, temps: [0, 1], fort: [0], bpm: [114, 132], levee: 0.5, forme: 'AABB', vif: 1, lie: 0.35, acc: [0, 1],
      cel: [[[0.5, 0.5, 0.5, 0.5], 4], [[1, 0.5, 0.5], 2], [[0.5, 0.5, 1], 2], [[0.25, 0.25, 0.5, 0.5, 0.5], 1.5], [[0.75, 0.25, 0.5, 0.5], 1.5]],
      demi: [[1, 1], [0.5, 0.5, 1]], fin: [[1, -1], [0.5, 0.5, 1]], modes: [['maj', 5], ['mix', 1]] },
    polka: { nom: 'polka', mes: '2/4', bar: 2, temps: [0, 1], fort: [0], bpm: [104, 120], levee: 0.5, forme: 'AABB', vif: 1, lie: 0.4, acc: [0, 1],
      cel: [[[0.5, 0.25, 0.25, 0.5, 0.5], 3], [[0.25, 0.25, 0.5, 0.5, 0.5], 2], [[0.5, 0.5, 0.5, 0.5], 3], [[0.75, 0.25, 0.5, 0.5], 2], [[1, 0.5, 0.5], 1.5], [[0.5, 0.5, 1], 1.5]],
      demi: [[1, 1], [0.5, 0.5, 1]], fin: [[1, -1], [0.5, 0.5, 1]], modes: [['maj', 5], ['min', 0.6]] },
    scottish: { nom: 'scottish', mes: '4/4', bar: 4, temps: [0, 1, 2, 3], fort: [0, 2], bpm: [126, 144], levee: 1, forme: 'AABB', vif: 1, lie: 0.35, acc: [0, 2],
      cel: [[[0.75, 0.25, 0.75, 0.25, 1, 1], 3], [[0.75, 0.25, 0.75, 0.25, 0.75, 0.25, 0.75, 0.25], 2], [[1, 1, 0.75, 0.25, 1], 2], [[0.75, 0.25, 1, 0.75, 0.25, 1], 2], [[2, 0.75, 0.25, 1], 1]],
      demi: [[1, 1, 2], [0.75, 0.25, 1, 2]], fin: [[1, 1, 1, -1], [2, -2]], modes: [['maj', 5], ['dor', 1]] },
    mazurka: { nom: 'mazurka', mes: '3/4', bar: 3, temps: [0, 1, 2], fort: [0], bpm: [128, 150], levee: 0, forme: 'AABB', vif: 0.6, lie: 0.4, acc: [0, 1],
      cel: [[[0.75, 0.25, 1, 1], 3], [[0.5, 0.5, 1, 1], 2.5], [[1, 0.5, 0.5, 1], 2], [[1, 1, 1], 2], [[1.5, 0.5, 1], 1.5], [[0.25, 0.25, 0.5, 1, 1], 1]],
      demi: [[2, 1], [1, 2]], fin: [[2, -1], [3]], modes: [['maj', 3], ['min', 2], ['dor', 1]] },
    valse: { nom: 'valse', mes: '3/4', bar: 3, temps: [0, 1, 2], fort: [0], bpm: [150, 176], levee: 0, forme: 'AABB', vif: 0.5, lie: 0.5, acc: [0],
      cel: [[[1, 1, 1], 3], [[2, 1], 2.5], [[1.5, 0.5, 1], 2], [[1, 0.5, 0.5, 1], 1.5], [[0.5, 0.5, 0.5, 0.5, 1], 1], [[3], 1]],
      demi: [[3], [2, 1]], fin: [[3], [2, -1]], modes: [['maj', 4], ['min', 1.5]] },
    marche: { nom: 'marche', mes: '2/4', bar: 2, temps: [0, 1], fort: [0], bpm: [104, 116], levee: 0.5, forme: 'AABB', vif: 1, lie: 0.2, acc: [0],
      cel: [[[0.75, 0.25, 0.5, 0.5], 3], [[0.75, 0.25, 1], 2], [[0.5, 0.5, 0.5, 0.5], 2], [[1, 0.5, 0.5], 2], [[1, 1], 1.5], [[0.5, 0.25, 0.25, 1], 1]],
      demi: [[1, 1], [0.75, 0.25, 1]], fin: [[1, -1], [2]], modes: [['maj', 6], ['mix', 0.5]] },
    gavotte: { nom: 'gavotte', mes: '4/4', bar: 4, temps: [0, 1, 2, 3], fort: [0, 2], bpm: [104, 122], levee: 1, forme: 'AABB', vif: 1, lie: 0.3, acc: [0, 2],
      cel: [[[0.5, 0.5, 1, 0.5, 0.5, 1], 3], [[1, 0.5, 0.5, 1, 1], 2], [[0.5, 0.5, 0.5, 0.5, 1, 1], 2], [[1, 1, 1, 1], 2], [[1.5, 0.5, 1, 1], 1.5]],
      demi: [[2, 2], [1, 1, 2]], fin: [[2, -2], [1, 1, 1, -1]], modes: [['maj', 3], ['dor', 2], ['min', 1.5]] },
    branle: { nom: 'branle', mes: '6/8', bar: 3, temps: [0, 1.5], fort: [0], bpm: [150, 168], levee: 0.5, forme: 'AABB', vif: 1, lie: 0.3, acc: [0, 1.5],
      cel: [[[1, 0.5, 1, 0.5], 3], [[1.5, 1.5], 1.5], [[0.5, 0.5, 0.5, 1, 0.5], 2], [[1, 0.5, 1.5], 2], [[0.5, 0.5, 0.5, 0.5, 0.5, 0.5], 1.5], [[1.5, 1, 0.5], 1]],
      demi: [[1.5, 1.5], [1, 0.5, 1.5]], fin: [[1.5, -1.5], [3]], modes: [['maj', 3], ['dor', 2], ['mix', 1.5], ['min', 1]] },
    ronde: { nom: 'ronde', mes: '2/4', bar: 2, temps: [0, 1], fort: [0], bpm: [100, 116], levee: 0, forme: 'AABB', vif: 1, lie: 0.2, acc: [0],
      cel: [[[0.5, 0.5, 0.5, 0.5], 3], [[1, 1], 2], [[0.5, 0.5, 1], 2.5], [[1, 0.5, 0.5], 2]],
      demi: [[1, 1], [2]], fin: [[2], [1, -1]], modes: [['maj', 1]] },
    complainte: { nom: 'complainte', mes: '3/4', bar: 3, temps: [0, 1, 2], fort: [0], bpm: [58, 72], levee: 1, forme: 'AB', vif: 0, lie: 0.65, acc: [0], lent: true,
      cel: [[[2, 1], 3], [[1, 1, 1], 2], [[1.5, 0.5, 1], 2], [[1, 2], 1.5], [[1, 0.5, 0.5, 1], 1], [[3], 0.6]],
      demi: [[3], [2, 1]], fin: [[3]], modes: [['min', 3], ['dor', 3], ['maj', 1]] },
    complainte4: { nom: 'complainte', mes: '4/4', bar: 4, temps: [0, 1, 2, 3], fort: [0, 2], bpm: [60, 76], levee: 1, forme: 'AB', vif: 0, lie: 0.65, acc: [0], lent: true,
      cel: [[[2, 1, 1], 2], [[1, 1, 2], 2], [[1.5, 0.5, 1, 1], 2], [[1, 1, 1, 1], 2], [[2, 2], 1.5], [[3, 1], 1]],
      demi: [[4], [2, 2]], fin: [[4], [3, -1]], modes: [['min', 3], ['dor', 3], ['maj', 1]] },
    cantique: { nom: 'cantique', mes: '4/4', bar: 4, temps: [0, 1, 2, 3], fort: [0, 2], bpm: [76, 92], levee: 0, forme: 'AB', vif: 0, lie: 0.3, acc: [0], lent: true,
      cel: [[[1, 1, 1, 1], 3], [[2, 1, 1], 2], [[1, 1, 2], 2], [[1.5, 0.5, 1, 1], 1], [[2, 2], 1]],
      demi: [[2, 2], [4]], fin: [[4], [3, -1]], modes: [['maj', 4], ['min', 1]] },
    noel: { nom: 'noël', mes: '3/4', bar: 3, temps: [0, 1, 2], fort: [0], bpm: [96, 112], levee: 1, forme: 'AB', vif: 0.4, lie: 0.3, acc: [0],
      cel: [[[1, 1, 1], 3], [[2, 1], 2], [[1.5, 0.5, 1], 1.5], [[1, 0.5, 0.5, 1], 1]],
      demi: [[3], [2, 1]], fin: [[3], [2, -1]], modes: [['maj', 3], ['dor', 1]] },
    berceuse: { nom: 'berceuse', mes: '6/8', bar: 3, temps: [0, 1.5], fort: [0], bpm: [72, 84], levee: 0.5, forme: 'AB', vif: 0, lie: 0.6, acc: [0], lent: true,
      cel: [[[1, 0.5, 1, 0.5], 3], [[1.5, 1.5], 2], [[1, 0.5, 1.5], 2], [[3], 1]],
      demi: [[3], [1.5, 1.5]], fin: [[3]], modes: [['maj', 2], ['min', 2], ['dor', 1]] },
  };

  // ---------------------------------------------------------------- l'harmonie (un accord par mesure, deux à la cadence)
  // les six mesures communes, puis la fin ouverte (sur la dominante) ou fermée (sur la tonique)
  const PLANS = {
    maj: {
      A: [[0, 0, 3, 4, 0, 3], [0, 4, 0, 4, 0, 3], [0, 3, 0, 4, 0, 3], [0, 0, 4, 4, 0, 0], [0, 3, 4, 0, 0, 3]],
      B: [[4, 4, 0, 0, 3, 0], [3, 0, 4, 0, 3, 0], [4, 0, 4, 0, 3, 0], [3, 3, 0, 0, 4, 0], [5, 3, 0, 4, 3, 0]],
      ouvert: [[[3, 4], [4]], [[1, 4], [4]], [[0, 4], [4]]], ferme: [[[4], [0]], [[3, 4], [0]], [[1, 4], [0]]],
    },
    min: {
      A: [[0, 0, 6, 6, 0, 0], [0, 6, 0, 4, 0, 6], [0, 3, 0, 6, 0, 3], [0, 0, 4, 4, 0, 6]],
      B: [[2, 6, 0, 4, 2, 6], [6, 6, 0, 0, 2, 6], [3, 3, 0, 0, 6, 6], [2, 2, 6, 6, 3, 0]],
      ouvert: [[[3, 4], [4]], [[6], [4]], [[0], [4]]], ferme: [[[4], [0]], [[6], [0]], [[3, 4], [0]]],
    },
    mix: {
      A: [[0, 0, 6, 6, 0, 0], [0, 6, 0, 6, 0, 3], [0, 3, 0, 6, 0, 0]],
      B: [[6, 6, 0, 0, 6, 3], [3, 3, 0, 0, 6, 6], [6, 3, 0, 4, 6, 3]],
      ouvert: [[[0], [6]], [[3], [6]], [[0, 6], [4]]], ferme: [[[6], [0]], [[4], [0]], [[3, 6], [0]]],
    },
  };
  PLANS.dor = PLANS.min;

  // ---------------------------------------------------------------- les mélodies
  // le poids d'une position dans la mesure : 1 le premier temps, 0,7 les temps forts, 0,5 les autres temps, 0,25 le reste
  const poids = (S, p) => (p < 1e-6 ? 1 : S.fort.some((x) => Math.abs(x - p) < 1e-6) ? 0.7 : S.temps.some((x) => Math.abs(x - p) < 1e-6) ? 0.5 : 0.25);
  // l'accord qui sonne à la position p d'une mesure d'accords A (un ou deux : le second à mi-mesure, aux deux tiers
  // dans une mesure à trois temps)
  const accordA = (S, A, p) => (A.length < 2 ? A[0] : p >= (S.temps.length === 3 ? S.bar * 2 / 3 : S.bar / 2) - 1e-6 ? A[1] : A[0]);
  // la note de l'accord r la plus proche de cible, entre lo et hi, en préférant (dir) un côté
  function procheAccord(r, cible, lo, hi, dir) {
    let best = null, bd = 1e9;
    for (let d = lo; d <= hi; d++) if (dansAccord(d, r)) { const e = Math.abs(d - cible) + (dir && Math.sign(d - cible) === -dir ? 0.4 : 0); if (e < bd) { bd = e; best = d; } }
    return best === null ? clampD(cible, lo, hi) : best;
  }
  const clampD = (d, lo, hi) => { while (d < lo) d += 7; while (d > hi) d -= 7; return d < lo ? lo : d; };

  // le contour d'une partie (degrés visés au premier temps de chaque mesure) : A part du médium, monte, revient ;
  // B plus haut
  const CONTOURS = {
    A: [[2, 3, 4, 2, 4, 5, 3, 0], [0, 2, 4, 4, 2, 4, 1, 0], [4, 4, 5, 4, 2, 3, 1, 0], [2, 4, 3, 1, 2, 4, 2, 0]],
    B: [[4, 5, 6, 4, 5, 7, 4, 2], [7, 6, 5, 4, 7, 5, 4, 2], [5, 7, 6, 4, 5, 6, 3, 2], [4, 6, 7, 5, 4, 5, 3, 2]],
  };

  // composer une partie (8 mesures : 6 communes + 2 fins) ; X : l'état (hasard, style, ambitus, dernière note)
  function partie(X, lettre) {
    const { R, S } = X;
    const P = PLANS[X.mode];
    const H6 = (lettre === 'A' ? P.A : P.B)[(R() * (lettre === 'A' ? P.A : P.B).length) | 0];
    const ouv = P.ouvert[(R() * P.ouvert.length) | 0], fer = P.ferme[(R() * P.ferme.length) | 0];
    const C0 = CONTOURS[lettre][(R() * CONTOURS[lettre].length) | 0], dec = lettre === 'B' ? X.decB : 0;
    const cont = C0.map((d) => d + dec);
    // le motif : une cellule (pas une cadence), et le rôle de chaque mesure (M motif, m motif transposé, x libre,
    // h la respiration de la quatrième mesure)
    const celM = tirer(R, S.cel);
    const roles = tirer(R, [[['M', 'm', 'x', 'h', 'M', 'm'], 4], [['M', 'm', 'M', 'x', 'M', 'm'], 2], [['M', 'x', 'm', 'h', 'M', 'x'], 2], [['M', 'M', 'x', 'h', 'M', 'm'], 1.5]]);
    const mes = [];
    let motif = null, rM = 0;
    const faire = (b, A, role, cad) => {
      // la cellule
      let cel;
      if (cad === 'h') cel = S.demi[(R() * S.demi.length) | 0];
      else if (cad === 'f') cel = S.fin[(R() * S.fin.length) | 0];
      else if (role === 'M' || (role === 'm' && R() < 0.8)) cel = celM;
      else { cel = tirer(R, S.cel); if (cel === celM && R() < 0.6) cel = tirer(R, S.cel); }
      const notes = [];
      let p = 0;
      const copie = (role === 'M' || role === 'm') && motif && cel === celM && !cad;
      const r0 = A[0];
      // le point de départ : une note de l'accord près du contour et de la note d'avant
      // (au début d'une partie, le contour l'emporte : la partie B part plus haut ; ensuite, la note d'avant)
      const wp = X.prev === null ? 0 : b === 0 ? 0.35 : 1.5, cible = (cont[b] + (X.prev === null ? 0 : X.prev) * wp) / (1 + wp);
      let d0;
      if (copie) {
        // le motif transposé de la différence des fondamentales (marche harmonique), à l'octave la plus proche
        const t = motif[0] + (r0 - rM), mn = Math.min(...motif) - motif[0], mx = Math.max(...motif) - motif[0];
        // (l'octave : près du contour, sans trop s'éloigner de la note d'avant)
        const ok = [t - 7, t, t + 7].filter((c) => c + mn >= X.lo && c + mx <= X.hi), pr = X.prev === null ? cible : X.prev;
        const cout = (c) => Math.abs(c - cible) + 0.8 * Math.max(0, Math.abs(c - pr) - 4);
        d0 = ok.length ? ok.reduce((a, c) => (cout(c) < cout(a) ? c : a)) : procheAccord(r0, cible, X.lo, X.hi);
        if (Math.abs(d0 - pr) > 7) d0 = procheAccord(r0, pr + Math.sign(d0 - pr) * 3, X.lo, X.hi);
      } else d0 = procheAccord(r0, cible, X.lo, X.hi);
      let d = d0;
      const nN = cel.filter((x) => x > 0).length;
      let k = 0;
      for (let i = 0; i < cel.length; i++) {
        const du = Math.abs(cel[i]), rest = cel[i] < 0, w = poids(S, p), r = accordA(S, A, p);
        if (rest) { notes.push({ d: null, du, p, w }); p += du; continue; }
        if (k === 0) d = d0;
        else if (copie && motif[k] !== undefined) d = d0 + (motif[k] - motif[0]);
        else {
          // un mouvement : par degré conjoint le plus souvent, vers la cible de la mesure suivante
          const vers = b < 7 ? cont[b + 1] : cont[b], sens = Math.sign(vers - d) || (R() < 0.5 ? 1 : -1);
          const q = R();
          let pas = q < 0.62 ? 1 : q < 0.82 ? 2 : q < 0.9 ? 0 : 3 + ((R() * 2) | 0);
          // (pas trois fois la même note)
          if (pas === 0 && notes.length >= 1 && X.saut === 0) pas = 1;
          // après un saut, on revient par degré dans l'autre sens
          if (X.saut && Math.abs(X.saut) >= 3) { d -= Math.sign(X.saut); }
          else d += pas * (R() < 0.78 ? sens : -sens);
        }
        // les temps forts portent une note de l'accord (les autres temps, souvent : une note de passage y reste permise)
        if ((w >= 0.7 || (w >= 0.5 && R() < 0.55)) && !dansAccord(d, r)) { const up = d + 1, dn = d - 1; d = dansAccord(up, r) && (R() < 0.5 || !dansAccord(dn, r)) ? up : dansAccord(dn, r) ? dn : procheAccord(r, d, X.lo, X.hi); }
        // dans l'ambitus : on repart dans l'autre sens plutôt que de sauter d'une octave
        if (d > X.hi || d < X.lo) { const pr = X.prev === null ? d : X.prev; d = 2 * pr - d; if (d > X.hi || d < X.lo) d = procheAccord(r, pr, X.lo, X.hi); }
        // pas de triton (quarte augmentée, quinte diminuée) d'une note à l'autre
        if (X.prev !== null && Math.abs(demi(X.mode, d) - demi(X.mode, X.prev)) === 6) { const a = d + (d > X.prev ? -1 : 1); d = a >= X.lo && a <= X.hi ? a : d + (d > X.prev ? 1 : -1); }
        // la dernière note d'une cadence
        if (cad && k === nN - 1) {
          if (cad === 'f') { d = [0, 7, -7, 14].filter((x) => x >= X.lo - 1 && x <= X.hi + 1).reduce((a, c) => (Math.abs(c - (X.prev ?? c)) < Math.abs(a - (X.prev ?? a)) ? c : a)); }
          else {
            const rr = A[A.length - 1], pr = X.prev === null ? cont[b] : X.prev;
            d = procheAccord(rr, pr, X.lo, X.hi);
            // (une demi-cadence qui bouge : pas la note d'avant)
            if (d === X.prev || (rr === 4 && R() < 0.5)) { const sens = R() < 0.5 ? 1 : -1; const e = procheAccord(rr, pr + sens * 1.5, X.lo, X.hi, sens); if (e !== X.prev) d = e; }
          }
        }
        // l'avant-dernière note d'une cadence finale : un degré au-dessus ou au-dessous de la tonique (dans la mesure de
        // la cadence, ou à la fin de celle d'avant)
        if ((cad === 'f' && k === nN - 2) || (cad === 'p' && k === nN - 1)) {
          const rr = r, C = [-1, 1, 6, 8, 13].filter((x) => x >= X.lo && x <= X.hi && (cad === 'f' || dansAccord(x, rr)));
          if (C.length) d = C.reduce((a, c) => (Math.abs(c - d) < Math.abs(a - d) ? c : a));
        }
        X.saut = X.prev === null ? 0 : d - X.prev;
        notes.push({ d, du, p, w, r });
        X.prev = d; p += du; k++;
      }
      if (role === 'M' && !motif && !cad) { motif = notes.filter((n) => n.d !== null).map((n) => n.d); rM = r0; }
      return { notes, A, cad };
    };
    for (let b = 0; b < 6; b++) { const role = roles[b]; mes.push(faire(b, [H6[b]], role === 'h' ? 'x' : role, role === 'h' ? 'h' : null)); }
    const prev6 = X.prev, saut6 = X.saut;
    // la fin ouverte : (pré-cadence) puis la demi-cadence ; la fin fermée : (dominante) puis la tonique
    const o7 = faire(6, ouv[0], 'x', null), o8 = faire(7, ouv[1], 'x', 'h');
    X.prev = prev6; X.saut = saut6;
    // (la note qui précède la tonique : la sensible ou le deuxième degré, si l'accord le permet)
    const f7 = faire(6, fer[0], 'x', 'p');
    const f8 = faire(7, fer[1], 'x', 'f');
    return { lettre, communes: mes, ouvert: [o7, o8], ferme: [f7, f8] };
  }

  // ---------------------------------------------------------------- d'une partie à des notes rendues
  // une mesure (degrés) → notes { d, du, w, cad, f, r }
  function aplatir(mesures) {
    const L = [];
    mesures.forEach((M, i) => {
      const c = M.cad === 'h' || M.cad === 'f', fin = M.notes.length - 1 - (M.notes[M.notes.length - 1].d === null ? 1 : 0);
      M.notes.forEach((n, j) => L.push(Object.assign({}, n, { cad: c ? j >= fin - 1 : M.cad === 'p' && j === fin, f: c && j === fin, bar: i })));
    });
    return L;
  }
  // l'anacrouse : remplace le silence de la fin de la phrase d'avant (ou se met devant l'air) par une ou deux notes qui
  // montent vers la première note
  function levee(X, L, vers, place) {
    const n = place >= 1 && X.R() < 0.5 ? 2 : 1, du = place / n, out = [];
    for (let i = n; i >= 1; i--) out.push({ d: vers - i * (X.R() < 0.75 ? 1 : -1), du, w: 0.25, lev: true });
    return out;
  }

  // les ornements d'un passage (selon l'instrument) ; force : 0..1 (la reprise en a plus)
  function orner(X, L, force) {
    const { R, inst } = X;
    for (let i = 0; i < L.length; i++) {
      const n = L[i], nx = L[i + 1];
      if (n.d === null) continue;
      // trille sur l'avant-dernière note d'une cadence finale (assez longue)
      if (n.cad && !n.f && n.du >= 0.5 && (inst === 'violon' || inst === 'fifre' || inst === 'piano') && R() < 0.35 + 0.3 * force) n.tr = true;
      // petite note (le degré au-dessus) sur un temps fort assez long
      else if (n.w >= 0.5 && n.du >= 0.5 && !n.f && inst !== 'voix' && R() < (inst === 'fifre' ? 0.14 : inst === 'vielle' ? 0.1 : 0.07) + 0.12 * force) n.g = n.d + 1;
      // la reprise : une note longue sur un temps faible se divise (broderie), une tierce se remplit (note de passage)
      if (force > 0 && !n.cad && nx && nx.d !== null && R() < 0.25 * force) {
        const ec = nx.d - n.d;
        if (Math.abs(ec) === 2 && n.du >= 0.5 && n.du <= 1) { L.splice(i + 1, 0, Object.assign({}, n, { d: n.d + Math.sign(ec), du: n.du / 2, w: 0.25, g: undefined, tr: false })); n.du /= 2; i++; }
        else if (ec === 0 && n.du >= 1 && n.du <= 2) { L.splice(i + 1, 0, Object.assign({}, n, { d: n.d + 1, du: n.du / 2, w: 0.25, g: undefined, tr: false })); n.du /= 2; i++; }
      }
    }
  }
  // les liaisons (l'archet, le souffle) : deux notes conjointes brèves sur un temps faible ; les petites valeurs
  function lier(X, L, part) {
    const { R } = X;
    for (let i = 0; i < L.length - 1; i++) {
      const a = L[i], b = L[i + 1];
      if (a.d === null || b.d === null || a.f) continue;
      const conj = Math.abs(b.d - a.d) <= 1;
      if ((a.du <= 0.25 && R() < 0.7) || (conj && a.du <= 0.5 && b.w < 0.7 && R() < part) || (X.S.lent && conj && b.w < 0.7 && R() < part)) a.l = true;
    }
  }
  // les doubles cordes du violon : une corde à vide (sol 3, ré 4, la 4, mi 5) sous une note longue de l'accord
  const VIDES = [55, 62, 69, 76];
  function doubles(X, notes, force) {
    const { R } = X;
    for (const n of notes) {
      if (n.m === null || n.du < 0.75) continue;
      const p = n.f ? 0.7 : n.w >= 1 ? 0.1 + 0.15 * force : 0;
      if (!p || R() >= p) continue;
      for (const s of VIDES) { const e = n.m - s; if (e >= 3 && e <= 12 && e !== 6 && e !== 10 && e !== 11 && e !== 1 && e !== 2 && n.r !== undefined && dansAccord(X.degDe(s), n.r)) { n.ds = s; break; } }
    }
  }

  // ---------------------------------------------------------------- composer un air
  // style (une clé de STYLES), graine (entier), inst (violon, fifre, vielle, voix, piano) ; o : { ton, mode }
  function composer(style, graine, inst, o) {
    o = o || {};
    const S = STYLES[style] || STYLES.bourree, R = alea(hache('air', style, graine, inst));
    const I = INST[inst] || INST.violon;
    // le ton : celui de l'instrument, dans un mode permis par le style
    const tons = I.tons.filter(([, m]) => S.modes.some(([mm]) => mm === m)).map(([t, m, w]) => [[t, m], w * (S.modes.find(([mm]) => mm === m)[1])]);
    const [ton, mode] = o.ton ? [o.ton, o.mode || 'maj'] : tirer(R, tons.length ? tons : [[[I.tons[0][0], 'maj'], 1]]);
    // l'ambitus en degrés autour de la tonique
    const degDe = (m) => { let best = 0, be = 1e9; for (let d = -14; d <= 21; d++) { const e = Math.abs(ton + demi(mode, d) - m); if (e < be) { be = e; best = d; } } return best; };
    const lo = Math.max(degDe(I.bas + 1), -4), hi = Math.min(degDe(I.haut - 2), inst === 'voix' ? 9 : 11);
    const X = { R, S, inst, mode, ton, lo, hi, prev: null, saut: 0, decB: hi >= 9 ? 2 : 1, degDe };
    const A = partie(X, 'A');
    // (la partie B part de la fin de A : la tonique)
    X.prev = X.prev === null ? null : [0, 7].reduce((a, c) => (Math.abs(c - X.prev) < Math.abs(a - X.prev) ? c : a));
    const B = partie(X, 'B');
    const bpm = Math.round(entre(R, S.bpm[0], S.bpm[1]));
    const lie = S.lie * (inst === 'violon' ? 1 : inst === 'vielle' ? 0.2 : inst === 'piano' ? 0.5 : 0.7);
    // l'ordre : AABB (danses) ou AB (couplets) ; une, deux ou trois fois selon la durée (40 à 90 s)
    const bloc = (P, fin) => aplatir(P.communes.concat(fin === 'o' ? P.ouvert : P.ferme));
    const tour = S.forme === 'AABB' ? [[A, 'o'], [A, 'f'], [B, 'o'], [B, 'f']] : [[A, 'o'], [B, 'f']];
    const dTour = tour.length * 8 * S.bar * 60 / bpm;
    let tours = Math.max(1, Math.round(62 / dTour));
    while (tours > 1 && dTour * tours > 92) tours--;
    while (dTour * tours < 38 && tours < 4) tours++;
    const L = [], sections = [];
    for (let k = 0; k < tours; k++) {
      for (const [P, fin] of tour) {
        const seg = bloc(P, fin).map((n) => Object.assign({}, n));
        // la reprise : ornée, variée ; la partie B du violon parfois à l'octave
        orner(X, seg, k > 0 ? 0.6 + 0.2 * k : (P === B ? 0.15 : 0));
        const avant = L.filter((n) => n.d !== null).pop(), d0s = seg.find((n) => n.d !== null);
        if (k > 0 && inst === 'violon' && P === B && seg.every((n) => n.d === null || n.d + 7 <= X.hi) && (!avant || !d0s || Math.abs(d0s.d + 7 - avant.d) <= 7) && R() < 0.35) for (const n of seg) { if (n.d !== null) n.d += 7; if (n.g !== undefined) n.g += 7; }
        // l'anacrouse, dans le silence de la fin d'avant (ou devant l'air)
        if (S.levee && seg[0] && seg[0].d !== null && (R() < 0.75 || (k === 0 && L.length === 0))) {
          const last = L[L.length - 1];
          if (!L.length) L.push(...levee(X, L, seg[0].d, S.levee));
          else if (last && last.d === null && last.du >= S.levee) { last.du -= S.levee; if (last.du < 1e-6) L.pop(); L.push(...levee(X, L, seg[0].d, S.levee)); }
        }
        sections.push({ i: L.length, nom: P.lettre + (fin === 'o' ? '1' : '2'), tour: k });
        L.push(...seg);
      }
    }
    // la dernière note : tenue (point d'orgue) ; un ralenti sur les deux dernières mesures des airs lents
    const fin = L.length - 1;
    if (L[fin] && L[fin].d === null) L.pop();
    const der = L[L.length - 1];
    if (der) { der.du = Math.max(der.du, S.bar * (S.lent ? 1 : 0.67)) * 1.3; der.f = true; }
    lier(X, L, lie);
    // en midi, avec les nuances
    const nb = L.length, notes = [];
    let pos = 0;
    for (let i = 0; i < nb; i++) {
      const n = L[i];
      let m = null;
      if (n.d !== null) {
        m = ton + demi(mode, n.d);
        // la sensible en mineur, sur la dominante
        if (mode === 'min' && mod7(n.d) === 6 && n.r === 4) m += 1;
      }
      // les nuances : le temps fort, l'accent du style, la phrase qui s'enfle puis se pose, un rien de hasard
      const ph = n.bar !== undefined ? n.bar / 7 : 0.5, arc = 0.85 + 0.15 * Math.sin(Math.PI * Math.min(1, ph * 1.2));
      const acc = S.acc.some((a) => n.p !== undefined && Math.abs(n.p - a) < 1e-6) ? 0.12 : 0;
      const v = Math.min(1, Math.max(0.3, (0.62 + 0.18 * (n.w || 0.25) + acc) * arc * (n.f ? 0.92 : 1) + (R() - 0.5) * 0.06));
      const N = { m, d: n.du, v: +v.toFixed(3) };
      if (n.l) N.l = 1;
      if (n.g !== undefined && m !== null) N.g = ton + demi(mode, n.g) + (mode === 'min' && mod7(n.g) === 6 && n.r === 4 ? 1 : 0);
      if (n.tr) N.tr = 1;
      if (n.f) N.f = 1;
      if (n.r !== undefined) N.r = n.r;
      if (n.w !== undefined) N.w = n.w;
      notes.push(N);
      pos += n.du;
    }
    if (inst === 'violon') doubles(X, notes.map((N, i) => Object.assign(N, { du: N.d, f: N.f, w: N.w, r: N.r })), tours > 1 ? 0.5 : 0);
    for (const N of notes) { delete N.du; if (N.f === undefined) delete N.f; }
    // les fins de partie (pour s'arrêter proprement, pour le tambour)
    let t = 0; const debut = [];
    for (let i = 0; i < notes.length; i++) { debut.push(t); t += notes[i].d; }
    const secs = sections.map((s) => ({ t: debut[Math.min(s.i, debut.length - 1)], nom: s.nom, tour: s.tour }));
    // (l'anacrouse du début fait commencer la première mesure un peu après le début)
    const t0 = L.length && L[0].lev ? L.filter((n, i) => i < 3 && n.lev).reduce((a, n) => a + n.du, 0) : 0;
    return { cle: style + ':' + graine, style, nom: S.nom, inst, mesure: S.mes, bar: S.bar, temps: S.temps, bpm, ton, mode, lent: !!S.lent, vif: S.vif, forme: S.forme, tours, notes, sections: secs, t0, beats: t, duree: t * 60 / bpm };
  }

  // ---------------------------------------------------------------- trois airs du domaine public (des notes sûres)
  // [degrés (majeur, 0 = tonique), durées (noires)] ; la forme se rejoue deux fois (la seconde ornée)
  const CONNUS = {
    // « Au clair de la lune » (AABA, à quatre temps)
    clair_lune: { nom: 'Au clair de la lune', bpm: 96, bar: 4, forme: [
      [[0, 0, 0, 1, 2, 1, 0, 2, 1, 1, 0], [1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 4]],
      [[0, 0, 0, 1, 2, 1, 0, 2, 1, 1, 0], [1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 4]],
      [[1, 1, 1, 1, -2, -2, 1, 0, -1, -2, -3], [1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 4]],
      [[0, 0, 0, 1, 2, 1, 0, 2, 1, 1, 0], [1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 4]]] },
    // « Ah ! vous dirai-je, maman » (ABA)
    vous_dirai: { nom: 'Ah ! vous dirai-je, maman', bpm: 100, bar: 4, forme: [
      [[0, 0, 4, 4, 5, 5, 4, 3, 3, 2, 2, 1, 1, 0], [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2]],
      [[4, 4, 3, 3, 2, 2, 1, 4, 4, 3, 3, 2, 2, 1], [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2]],
      [[0, 0, 4, 4, 5, 5, 4, 3, 3, 2, 2, 1, 1, 0], [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2]]] },
    // « Frère Jacques »
    frere_jacques: { nom: 'Frère Jacques', bpm: 104, bar: 4, forme: [
      [[0, 1, 2, 0, 0, 1, 2, 0], [1, 1, 1, 1, 1, 1, 1, 1]],
      [[2, 3, 4, 2, 3, 4], [1, 1, 2, 1, 1, 2]],
      [[4, 5, 4, 3, 2, 0, 4, 5, 4, 3, 2, 0], [0.5, 0.5, 0.5, 0.5, 1, 1, 0.5, 0.5, 0.5, 0.5, 1, 1]],
      [[0, -3, 0, 0, -3, 0], [1, 1, 2, 1, 1, 2]]] },
  };
  function connu(nom, inst, graine) {
    const K = CONNUS[nom];
    if (!K) return null;
    const I = INST[inst] || INST.violon, R = alea(hache('connu', nom, graine || 0, inst));
    // la tonique : celle d'un ton majeur de l'instrument où l'air tient (« Au clair de la lune » descend une quarte sous
    // la tonique) ; sinon, une octave plus haut
    let lo = 99, hi = -99;
    for (const [ds] of K.forme) for (const d of ds) { lo = Math.min(lo, d); hi = Math.max(hi, d + 1); }
    const tient = (t) => t + demi('maj', lo) >= I.bas && t + demi('maj', hi) <= I.haut;
    const tons = I.tons.filter(([, m]) => m === 'maj').map(([t]) => t), ok = tons.filter(tient).concat(tons.map((t) => t + 12).filter(tient));
    const ton = ok.length ? ok[(R() * ok.length) | 0] : tons[0] || 67;
    const X = { R, inst, S: { lent: false } }, notes = [], secs = [];
    let t = 0;
    for (let k = 0; k < 2; k++) for (const [ds, du] of K.forme) {
      secs.push({ t, nom: 'P', tour: k });
      const L = ds.map((d, i) => ({ d, du: du[i], w: 0.5, cad: i >= ds.length - 2, f: i === ds.length - 1 }));
      orner(X, L, k ? 0.5 : 0);
      for (const n of L) { const m = ton + demi('maj', n.d); const N = { m, d: n.du, v: 0.7 + (n.f ? -0.05 : 0) + (R() - 0.5) * 0.06 }; if (n.g !== undefined) N.g = ton + demi('maj', n.g); if (n.tr) N.tr = 1; if (n.f) N.f = 1; notes.push(N); t += n.du; }
    }
    notes[notes.length - 1].d *= 1.4;
    t += notes[notes.length - 1].d * (0.4 / 1.4);
    return { cle: 'connu:' + nom, style: 'connu', nom: K.nom, inst, mesure: '4/4', bar: K.bar, temps: [0, 1, 2, 3], bpm: K.bpm, ton, mode: 'maj', lent: false, vif: 0.5, forme: 'connu', tours: 2, notes, sections: secs, t0: 0, beats: t, duree: t * 60 / K.bpm };
  }

  // ---------------------------------------------------------------- l'accord de l'instrument (avant de jouer)
  // le violon : chaque corde seule, puis les quintes à deux cordes (la-mi, ré-la, sol-ré), la quinte d'abord un peu
  // fausse qui se règle (gl : cents au départ) ; un petit trait pour finir. La vielle : la roue qui tourne sur les
  // bourdons, la trompette qui grince deux fois.
  function accord(inst, graine) {
    const R = alea(hache('accord', inst, graine));
    if (inst === 'vielle') return { cle: 'accord', style: 'accord', inst, bpm: 60, bar: 1, temps: [0], notes: [{ m: 67, d: 2.2, v: 0.5 }, { m: null, d: 0.6 }, { m: 67, d: 1.6, v: 0.6 }, { m: 74, d: 1.2, v: 0.55 }], sections: [{ t: 0, nom: 'accord' }], t0: 0, beats: 5.6, duree: 5.6, accord: true };
    const notes = [];
    const fausse = () => (R() < 0.5 ? -1 : 1) * (12 + R() * 22);
    notes.push({ m: 69, d: 1.1, v: 0.55, gl: fausse() }, { m: null, d: 0.35 });
    for (const [a, b] of [[69, 76], [62, 69], [55, 62]]) { if (R() < 0.85) notes.push({ m: b, ds: a, d: 1.5 + R() * 0.6, v: 0.6, gl: fausse() }, { m: null, d: 0.3 + R() * 0.3 }); }
    if (R() < 0.7) notes.push({ m: 69, ds: 76, d: 1.2, v: 0.62 }, { m: null, d: 0.4 });
    // un petit trait (une gamme qui monte, deux notes liées)
    const g = R() < 0.5 ? [67, 69, 71, 72, 74] : [62, 64, 66, 67, 69];
    for (let i = 0; i < g.length; i++) notes.push({ m: g[i], d: 0.25, v: 0.6, l: i % 2 ? 0 : 1 });
    notes.push({ m: g[g.length - 1] + (R() < 0.5 ? 0 : -2), d: 0.8, v: 0.55, f: 1 });
    const beats = notes.reduce((a, n) => a + n.d, 0);
    return { cle: 'accord', style: 'accord', inst, bpm: 60, bar: 1, temps: [0], notes, sections: [{ t: 0, nom: 'accord' }], t0: 0, beats, duree: beats, accord: true };
  }

  // ---------------------------------------------------------------- les répertoires des musiciens
  // styles : [style, combien] ; connus : les airs du domaine public qu'il sait (rarement joués) ; vifs/lents : l'humeur
  const REPERTOIRES = {
    violoneux: { inst: 'violon', styles: [['bourree', 3], ['rigaudon', 1], ['polka', 2], ['scottish', 1], ['mazurka', 2], ['valse', 2], ['marche', 1], ['branle', 1], ['gavotte', 1], ['complainte', 2], ['complainte4', 1]], connus: [['clair_lune', 0.3]], accord: 0.6, pauses: [4, 15], set: [3, 6], repos: [60, 150], reposP: 0.45 },
    noce: { inst: 'violon', styles: [['marche', 3], ['bourree', 2], ['polka', 2], ['valse', 1], ['rigaudon', 1], ['mazurka', 1], ['branle', 1]], connus: [], accord: 0, pauses: [3, 8], set: [4, 8], repos: [20, 40], reposP: 0.2 },
    fifre: { inst: 'fifre', styles: [['marche', 3], ['rigaudon', 2], ['polka', 2], ['branle', 1], ['gavotte', 1], ['bourree', 1], ['ronde', 1]], connus: [['frere_jacques', 0.2]], accord: 0, pauses: [4, 12], set: [3, 5], repos: [25, 50], reposP: 0.3 },
    vielleux: { inst: 'vielle', styles: [['bourree', 3], ['complainte', 2], ['mazurka', 1], ['scottish', 1], ['valse', 1], ['branle', 1], ['gavotte', 1], ['complainte4', 1]], connus: [], accord: 0.4, pauses: [5, 15], set: [3, 6], repos: [60, 150], reposP: 0.35 },
    savoyard: { inst: 'vielle', styles: [['ronde', 2], ['complainte', 1], ['valse', 1], ['bourree', 1]], connus: [['vous_dirai', 1], ['clair_lune', 1], ['frere_jacques', 0.6]], accord: 0.2, pauses: [5, 14], set: [3, 5], repos: [30, 70], reposP: 0.3 },
    pelerins: { inst: 'voix', styles: [['cantique', 4], ['noel', 1]], connus: [], accord: 0, pauses: [6, 15], set: [3, 6], repos: [30, 60], reposP: 0.25 },
    puits: { inst: 'voix', styles: [['berceuse', 3]], connus: [], accord: 0, pauses: [3, 8], set: [2, 4], repos: [15, 30], reposP: 0.2 },
    requiem: { inst: 'voix', styles: [['complainte4', 2], ['cantique', 1]], connus: [], accord: 0, pauses: [2, 6], set: [2, 4], repos: [10, 20], reposP: 0.1 },
    // la litanie de la procession : des formules (on les donne à la séance : o.extra)
    litanie: { inst: 'voix', styles: [], connus: [], accord: 0, pauses: [1, 4], set: [4, 8], repos: [6, 12], reposP: 0.1 },
    pianiste: { inst: 'piano', styles: [['valse', 4], ['mazurka', 2], ['polka', 2], ['scottish', 1], ['complainte4', 1], ['gavotte', 1]], connus: [], accord: 0, pauses: [6, 15], set: [3, 6], repos: [60, 180], reposP: 0.4 },
  };
  // le répertoire d'un musicien (graine : le monde) : [{ cle, style, graine, inst } …] (les airs se composent à la demande)
  function repertoire(graine, musicien) {
    const P = REPERTOIRES[musicien] || REPERTOIRES.violoneux, L = [];
    for (const [st, n] of P.styles) for (let i = 0; i < n; i++) L.push({ cle: st + ':' + hache(graine, musicien, st, i), style: st, graine: hache(graine, musicien, st, i), inst: P.inst, poids: 1 });
    for (const [nom, w] of P.connus || []) L.push({ cle: 'connu:' + nom, style: 'connu', nom, inst: P.inst, poids: w, graine: hache(graine, musicien, nom) });
    return L;
  }
  const CACHE = new Map();
  // l'air d'une entrée de répertoire (composé une fois, gardé)
  function air(e) {
    if (e.air) return e.air;
    let A = CACHE.get(e.cle + '|' + e.inst);
    if (A) return A;
    A = e.style === 'connu' ? connu(e.nom, e.inst, e.graine) : composer(e.style, e.graine, e.inst);
    if (CACHE.size > 160) CACHE.delete(CACHE.keys().next().value);
    CACHE.set(e.cle + '|' + e.inst, A);
    return A;
  }

  // ---------------------------------------------------------------- l'humeur (heure, fête) → poids des styles
  // h : l'heure ; fete : jour de fête ou de marché ; soir : crépuscule ; nuit
  function humeur(st, h, fete) {
    const S = STYLES[st];
    const vif = st === 'connu' ? 0.5 : S ? S.vif : 0.5, lent = st === 'connu' ? 0 : S && S.lent ? 1 : 0;
    const jour = h >= 7 && h < 17, soir = h >= 17 && h < 21.5, nuit = h >= 21.5 || h < 5;
    let w = 1;
    if (jour) w *= 1 + 0.5 * vif - 0.6 * lent;
    if (soir) w *= 1 - 0.3 * vif + 0.9 * lent + (st === 'valse' || st === 'mazurka' ? 0.5 : 0);
    if (nuit) w *= 0.6 + 1.6 * lent;
    if (fete) w *= 1 + 0.6 * vif - 0.5 * lent;
    return Math.max(0.05, w);
  }

  // ---------------------------------------------------------------- une séance
  // Elle dit ce que fait le musicien, une chose après l'autre : { type: 'air', air } | { type: 'pause', d } |
  // { type: 'accord', air } | { type: 'repos', d }. ctx : { h (heure), fete } ; demander(style) : l'air suivant
  // sera de ce style (une complainte pour qui a donné une pièce)
  class Session {
    constructor(musicien, graine, o) {
      this.P = REPERTOIRES[musicien] || REPERTOIRES.violoneux;
      this.musicien = musicien; this.rep = repertoire(graine, musicien).concat((o && o.extra) || []);
      this.attente = null;
      this.R = alea(hache('seance', musicien, graine, (o && o.jour) || 0));
      this.hist = []; this.nSet = 0; this.set = this.tailleSet(); this.etat = null; this.demande = null; this.n = 0;
      this.debut = !(o && o.sansAccord);
    }
    tailleSet() { const [a, b] = this.P.set; return a + ((this.R() * (b - a + 1)) | 0); }
    demander(style) { this.demande = style; }
    // le prochain air (jamais celui d'avant ; ceux des quatre derniers rarement)
    choisir(ctx) {
      const R = this.R, h = ctx && ctx.h !== undefined ? ctx.h : 12, fete = !!(ctx && ctx.fete);
      let L = this.rep.filter((e) => e.cle !== this.hist[this.hist.length - 1]);
      if (!L.length) L = this.rep;
      if (this.demande) { const D = L.filter((e) => e.style.startsWith(this.demande)); if (D.length) L = D; this.demande = null; }
      const W = L.map((e) => { const k = this.hist.lastIndexOf(e.cle), recent = k >= 0 && this.hist.length - k <= 4 ? 0.12 : 1; return [e, e.poids * humeur(e.style, h, fete) * recent]; });
      const e = tirer(R, W);
      this.hist.push(e.cle);
      if (this.hist.length > 30) this.hist.shift();
      return air(e);
    }
    // remettre une chose pour la prochaine fois (on l'a tirée trop tôt)
    remettre(x) { this.attente = x; }
    suivant(ctx) {
      if (this.attente) { const x = this.attente; this.attente = null; this.etat = x; return x; }
      const R = this.R, P = this.P;
      const prev = this.etat;
      let x;
      if (this.debut) { this.debut = false; x = P.accord && R() < P.accord ? { type: 'accord', air: accord(P.inst, (R() * 1e9) | 0) } : { type: 'air', air: this.choisir(ctx) }; }
      else if (prev && prev.type === 'air') {
        this.nSet++;
        if (this.nSet >= this.set) { this.nSet = 0; this.set = this.tailleSet(); x = R() < P.reposP ? { type: 'repos', d: entre(R, P.repos[0], P.repos[1]) } : { type: 'pause', d: entre(R, P.pauses[0] + 3, P.pauses[1] + 6) }; }
        else x = { type: 'pause', d: entre(R, P.pauses[0], P.pauses[1]) };
      } else if (prev && (prev.type === 'repos') && P.accord && R() < P.accord) x = { type: 'accord', air: accord(P.inst, (R() * 1e9) | 0) };
      else if (prev && prev.type === 'pause' && P.accord && R() < P.accord * 0.15) x = { type: 'accord', air: accord(P.inst, (R() * 1e9) | 0) };
      else x = { type: 'air', air: this.choisir(ctx) };
      if (x.type === 'accord' && prev && prev.type === 'accord') x = { type: 'air', air: this.choisir(ctx) };
      this.etat = x; this.n++;
      return x;
    }
  }

  // composer d'avance, en tâche de fond : le prochain air pas encore composé d'une liste (un par appel) ; false : tous prêts
  function prechauffer(rep) { for (const e of rep) { if (e.air || CACHE.has(e.cle + '|' + e.inst)) continue; air(e); return true; } return false; }
  // un air d'avant (notes [[midi | null, temps]…], un tempo) en air d'ici ; o : { nom, bar, lent }
  function depuisNotes(notes, bpm, inst, o) {
    o = o || {};
    const N = notes.map(([m, d]) => ({ m: m === null || m === undefined ? null : m, d, v: 0.7, w: 0.5 }));
    const der = N.filter((n) => n.m !== null).pop(); if (der) der.f = 1;
    const beats = N.reduce((a, n) => a + n.d, 0);
    return { cle: 'ancien:' + (o.nom || ''), style: 'ancien', nom: o.nom || '', inst, mesure: '4/4', bar: o.bar || 4, temps: [0, 1, 2, 3], bpm, lent: o.lent !== false, vif: 0, forme: 'ancien', tours: 1, notes: N, sections: [{ t: 0, nom: 'A', tour: 0 }], t0: 0, beats, duree: beats * 60 / bpm };
  }
  // le même air, transposé (demi-tons) : la voix d'en dessous
  function transposer(A, k) { return Object.assign({}, A, { notes: A.notes.map((n) => Object.assign({}, n, { m: n.m === null ? null : n.m + k, g: n.g ? n.g + k : n.g, ds: undefined })) }); }

  return { composer, connu, accord, repertoire, air, prechauffer, Session, STYLES, INST, REPERTOIRES, MODES, demi, hache, alea, humeur, depuisNotes, transposer };
})();
