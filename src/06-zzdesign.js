// ============================================================================
//  LA VALLÉE DESSINÉE (carte par défaut, version 3 du générateur, 3 km de côté) :
//  relief, rivière, lacs, marais, forêts, lieux et chemins placés à la main. La
//  vallée est la même à chaque partie ; seuls les habitants, le temps et
//  l'étrange changent. Le générateur (06-zgen-valley.js) lit ce plan au lieu de
//  tirer les emplacements au hasard. Coordonnées en mètres (0..3072), nord = -z.
//
//  Le cœur (décrit en coordonnées « cœur », décalées de OFF) : la ferme sur une
//  butte, face à la ville fortifiée 500 m au nord ; la rivière descend des
//  contreforts, passe à l'ouest de la ville (un pont sur la route du lac) et se
//  jette dans le grand lac ; le lac s'écoule dans le marais. Vieille forêt au
//  nord-ouest (guérisseuse, cercle de pierres, chapelle), lande et plateau au
//  nord-est (abbaye, château, dolmen, tour de guet), bois de bouleaux à l'est,
//  hameau et prairies au sud-est (chevaux sauvages), forêt du sud (hameau
//  abandonné). Au nord, derrière les contreforts : la Combe Perdue et son lac
//  noir, puis les Monts Blancs enneigés, le glacier et ses crevasses, un lac
//  gelé, un refuge au col. Forêts sombres à l'ouest et à l'est.
// ============================================================================
const DESIGN_OFF = [512, 900];
const VALLEY_DESIGN = {
  seed: 20260928, WL: 4, base: 6.8, N: 1536, snowLine: 74,
  names: { ville: 'Valbrume', hameau: 'Clairpré' },
  // -------------------------------------------------- le cœur (coordonnées décalées de DESIGN_OFF)
  core: {
    ridges: [
      { pts: [[348, 220], [528, 185], [718, 220], [888, 200], [1068, 175], [1268, 210], [1468, 180], [1648, 130]], w: 150, h: 44, rug: 18 }, // contreforts du nord
    ],
    plateaus: [{ x: 1610, z: 560, rx: 330, rz: 250, h: 21, edge: 0.4 }],
    // collines : x, z, rayon, hauteur (négatif : creux), raideur
    hills: [
      [1000, 1250, 175, 3.2, 1], [870, 1092, 80, 12, 1.2], [1165, 905, 55, 6, 1.1], [640, 612, 72, 11, 1.1], [1240, 1470, 58, 5, 1],
      [1720, 402, 85, 15, 1.3], [1810, 690, 48, 15, 1.6], [430, 520, 125, 7, 1], [300, 395, 110, 11, 1], [560, 360, 95, 8, 1], [405, 705, 90, 6, 1],
      [940, 292, 72, 27, 1.7], [1180, 318, 62, 20, 1.7], [1885, 782, 52, 17, 1.7], [248, 1040, 44, 13, 1.6], [1300, 1742, 55, 15, 1.7],
      [1560, 1330, 120, 3, 1], [1680, 1480, 160, 2.5, 1],
      [990, 190, 80, -8, 1], // col des contreforts (passage vers la Combe Perdue)
      // buttes de l'ouest (derrière le phare), du sud et de l'est
      [190, 700, 110, 17, 1.1], [228, 905, 95, 22, 1.2], [180, 1180, 120, 15, 1.1], [236, 1330, 80, 12, 1.2],
      [480, 1800, 130, 16, 1.1], [820, 1835, 110, 21, 1.2], [1130, 1790, 140, 14, 1], [1500, 1815, 120, 18, 1.2], [1780, 1730, 100, 15, 1.2],
      [1915, 860, 95, 16, 1.2], [1890, 1130, 110, 13, 1.1], [1905, 1420, 90, 17, 1.2], [1850, 1620, 95, 12, 1.1],
    ],
    lakes: [{ x: 500, z: 985, r: 118, depth: 6 }, { x: 428, z: 1100, r: 70, depth: 3.5, lobe: true }],
    ponds: [{ x: 1592, z: 1262, r: 26, depth: 3 }, { x: 470, z: 762, r: 22, depth: 2.5 }],
    rivers: [
      { pts: [[735, 350], [770, 470], [820, 570], [860, 660], [872, 740], [860, 810], [815, 875], [745, 925], [660, 952], [612, 962]], w: 6.5, fp: 40, fish: true },
      { pts: [[418, 1152], [396, 1222], [362, 1290], [338, 1330]], w: 3.6, fp: 16 },
    ],
    swamp: { x: 330, z: 1345 },
    sites: {
      farm: { x: 1000, z: 1256, y: 12.5 }, town: { x: 1060, z: 700 }, hamlet: { x: 1500, z: 1160 },
      fisher: { x: 614, z: 1074 }, lighthouse: { x: 372, z: 936 }, hut: { x: 432, z: 540 }, mill: { x: 870, z: 1092 },
      mine: { x: 940, z: 350, dir: Math.PI }, stoneCircle: { x: 640, z: 612 }, chapel: { x: 562, z: 352 },
      ghostHamlet: { x: 790, z: 1616 }, watchtower: { x: 1810, z: 690 }, ruins: { x: 1792, z: 1186 },
      giantOak: { x: 1240, z: 1470 }, cemetery: { x: 1165, z: 905 }, swampShack: { x: 318, z: 1398 },
    },
    roads: [
      { pts: [[1000, 1220], [1008, 1150], [1030, 985], [1046, 900], [1058, 800], [1060, 759]], w: 1.8 },
      { pts: [[1030, 985], [1150, 1010], [1280, 1062], [1400, 1120], [1488, 1156]], w: 1.6 },
      { pts: [[1060, 759], [960, 788], [902, 803], [848, 818], [800, 848], [722, 928], [684, 985], [640, 1045]], w: 1.4 },
      { pts: [[1060, 641], [1050, 560], [1012, 470], [962, 392], [944, 362]], w: 1.4 },
      { pts: [[1050, 560], [1160, 520], [1280, 482], [1396, 452], [1560, 430], [1702, 412]], w: 1.2 },
      { pts: [[800, 848], [768, 798], [702, 722], [652, 662], [560, 604], [446, 548]], w: 0.95, wig: 4 },
      { pts: [[652, 662], [642, 626]], w: 0.8 },
      { pts: [[446, 548], [482, 452], [548, 368]], w: 0.7, wig: 4 },
      { pts: [[1006, 1160], [944, 1122], [884, 1098]], w: 1.1 },
      { pts: [[1046, 900], [1110, 904], [1150, 905]], w: 1.2 },
      { pts: [[1000, 1292], [952, 1392], [884, 1478], [822, 1560], [796, 1604]], w: 0.8, wig: 5 },
      { pts: [[640, 1045], [575, 1180], [500, 1270], [420, 1350], [336, 1398]], w: 0.8, wig: 4 },
      { pts: [[1488, 1156], [1620, 1172], [1780, 1184]], w: 0.8, wig: 4 },
    ],
    zones: {
      forest: [
        [470, 520, 330, 300, 0.56], [640, 770, 150, 110, 0.42], [1000, 330, 720, 115, 0.36],
        [880, 1720, 560, 190, 0.52], [1420, 1760, 300, 150, 0.46], [260, 1100, 70, 190, 0.3],
        [1720, 1000, 170, 130, 0.46, true], [1880, 1300, 70, 180, 0.3],
        [1128, 1182, 48, 40, 0.34], [878, 1302, 60, 50, 0.34], [1352, 856, 46, 40, 0.3], [1170, 1330, 36, 30, 0.3], [1420, 1010, 40, 34, 0.3],
      ],
      clear: [[640, 612, 44], [432, 540, 22], [562, 352, 20], [1240, 1470, 26], [790, 1616, 40], [1700, 996, 16]],
      moist: [[330, 1345, 115, 95, 0.55], [500, 985, 160, 150, 0.3], [428, 1100, 110, 100, 0.32], [1592, 1262, 50, 50, 0.3]],
      dry: [[1610, 600, 300, 230, -0.48]],
      rough: [[1000, 250, 800, 150, 0.55], [1610, 560, 330, 250, 0.22], [210, 950, 90, 320, 0.3], [1100, 1810, 700, 110, 0.3]],
      flowers: [[1500, 1250, 220, 160], [1000, 1360, 180, 90], [1240, 1470, 90, 70], [660, 1250, 120, 90], [1300, 700, 120, 90]],
      rocks: [[1118, 1352, 40, 30], [872, 1172, 34, 28], [1330, 980, 30, 26], [760, 390, 60, 50], [1560, 640, 90, 70]],
    },
    wonders: {
      clairiere: [1700, 996], source: [930, 1500], cercle_fees: [382, 722], dolmen: [1650, 578], menhirs: [1490, 640],
      abbaye: [1400, 452], chateau: [1720, 402], charbonniere: [1020, 1682], bergerie: [1580, 760], tombe_lise: [880, 1562],
      grotte_cristaux: [1180, 372, Math.PI], antre: [1862, 826, Math.atan2(23, -44)], grotte_contrebandiers: [286, 1040, -Math.PI / 2], grotte_peinte: [1300, 1688, 0],
    },
    herd: [1690, 1420],
  },
  // -------------------------------------------------- le nord, l'ouest et l'est (coordonnées absolues)
  wild: {
    // la vallée habitable : un contour ; au-dehors (contour tordu par le bruit), la montagne monte sur « band »
    // mètres jusqu'à l'enveloppe des sommets (très hauts au nord, moyens à l'ouest et à l'est, plus bas au sud)
    valley: {
      outline: [
        [560, 1250], [700, 1190], [900, 1175], [1100, 1165], [1300, 1175], [1470, 1185], [1640, 1180], [1820, 1200], [2000, 1210], [2180, 1180], [2350, 1150], [2470, 1180],
        [2560, 1300], [2640, 1480], [2580, 1680], [2640, 1900], [2780, 1990], [2800, 2140], [2690, 2240], [2690, 2400], [2590, 2560],
        [2450, 2690], [2250, 2750], [2050, 2660], [1850, 2760], [1650, 2690], [1450, 2780], [1250, 2690], [1050, 2700], [860, 2610],
        [700, 2520], [540, 2440], [430, 2300], [480, 2150], [590, 2080], [520, 1900], [580, 1700], [470, 1520], [460, 1380],
      ],
      north: [[0, 170], [400, 200], [800, 180], [1150, 215], [1500, 200], [1750, 225], [2050, 235], [2350, 205], [2700, 220], [3072, 180]],
      side: 72, south: 50, bandN: 850, band: 380, rugN: 76, rug: 36,
    },
    ridges: [
      { pts: [[1330, 240], [1318, 440], [1352, 640]], w: 125, h: 52, rug: 22 }, // arête ouest du glacier
      { pts: [[1990, 240], [2012, 440], [1984, 660]], w: 125, h: 52, rug: 22 }, // arête est du glacier
      { pts: [[2236, 330], [2248, 700]], w: 95, h: 46, rug: 18 }, // murs du cirque
      { pts: [[2532, 330], [2520, 700]], w: 95, h: 46, rug: 18 },
    ],
    // entailles : le terrain est abaissé (jamais relevé) jusqu'à un profil donné point par point, murs de chaque côté
    cuts: [
      { pts: [[1470, 1232], [1498, 1160], [1502, 1090], [1482, 1030], [1458, 985]], top: [9, 15, 21, 14, 8], w: 60, wall: 34 }, // le col des Treize
    ],
    // cuvettes et replats : la hauteur tend vers une cible (glacier incliné, cirque, combe en cuvette)
    basins: [
      { x: 1660, z: 500, rx: 335, rz: 122, h: 118, tilt: 0.14, undul: 4, warp: 0.5, k0: 0.72, k1: 1.12 }, // le glacier
      { x: 2380, z: 610, rx: 82, rz: 82, h: 90, rim: 22, k0: 1.0, k1: 1.75 }, // le lac gelé
      { x: 1320, z: 880, rx: 250, rz: 140, h: 1.6, bowl: 13, undul: 2.5, warp: 0.45, k0: 0.6, k1: 1.2 }, // la Combe Perdue
      { x: 1602, z: 656, rx: 30, rz: 24, h: 116, k0: 0.55, k1: 1.35 }, // le replat du refuge
      // les noues : des prés bas au bord de la rivière, que les crues recouvrent
      { x: 1438, z: 1690, rx: 52, rz: 84, h: 0.75, undul: 0.25, k0: 0.45, k1: 1.25 },
      { x: 1196, z: 1792, rx: 74, rz: 42, h: 0.8, undul: 0.25, k0: 0.45, k1: 1.25 },
      { x: 1318, z: 1476, rx: 46, rz: 60, h: 0.85, undul: 0.25, k0: 0.45, k1: 1.25 },
    ],
    hills: [
      [560, 1650, 150, 10, 1], [470, 2250, 160, 12, 1], [2620, 1650, 150, 10, 1], [2600, 2350, 170, 12, 1], // bosses des forêts
    ],
    // glacier : surface aplanie (hauteur au-dessus de l'eau) ; lac gelé (surface de glace)
    glacier: { x: 1660, z: 500, rx: 335, rz: 122, h: 118 },
    crevasses: [
      [[1400, 475], [1465, 463]], [[1480, 515], [1565, 500]], [[1430, 552], [1505, 562]], [[1585, 455], [1650, 467]],
      [[1605, 545], [1690, 527]], [[1705, 475], [1790, 490]], [[1725, 560], [1800, 550]], [[1812, 515], [1885, 503]],
      [[1535, 430], [1600, 420]], [[1855, 460], [1912, 474]], [[1650, 588], [1705, 596]], [[1455, 438], [1500, 425]],
    ],
    frozen: { x: 2380, z: 610, r: 82, h: 90 },
    lakes: [{ x: 1300, z: 872, r: 62, depth: 5, kind: 'lac_noir' }],
    // la piste du col : de la mine à la Combe Perdue, puis au refuge, en lacets (terrassée)
    // (repères : la mine, le haut du col, le fond de la Combe, le refuge ; la pente est régulière entre deux repères)
    trail: [[1452, 1238], [1478, 1205], [1500, 1150], [1502, 1090], [1482, 1030], [1458, 988], [1480, 940], [1560, 905], [1500, 858], [1585, 815], [1520, 772], [1600, 728], [1556, 690], [1600, 664]],
    trailAnchors: [0, 3, 6, 13],
    refuge: { x: 1600, z: 650 },
    zones: {
      forest: [
        [1300, 880, 170, 110, 0.4], [560, 1650, 260, 520, 0.5], [470, 2350, 230, 360, 0.46], [2630, 1700, 230, 500, 0.52], [2600, 2400, 220, 330, 0.48],
        [900, 800, 300, 120, 0.3], [2100, 820, 300, 130, 0.3],
      ],
      rough: [[1550, 450, 1350, 280, 0.62], [300, 1750, 180, 800, 0.3], [2800, 1750, 180, 800, 0.3]],
      dry: [[2250, 1300, 200, 160, -0.35]],
    },
  },
  // sigles gravés, peints ou tracés : [x, z, sorte, taille, manière]
  sigils: [
    [1500, 1082, 'treize', 5, 'sol'], [1700, 508, 'spirale', 16, 'neige'], [2380, 610, 'oeil', 10, 'glace'], [1626, 664, 'main', 1.4, 'stele'],
    [1540, 1885, 'croix', 1.2, 'stele'], [1285, 1700, 'soleil', 4, 'sol'], [2212, 1896, 'cerf', 1.2, 'stele'], [1020, 1990, 'dame', 1.2, 'stele'],
    [2162, 1478, 'dessous', 3.5, 'sol'], [1300, 2516, 'noeud', 1.2, 'stele'], [2322, 1590, 'oeil', 1.2, 'stele'], [1392, 2596, 'corne', 3, 'sol'],
    [1580, 2275, 'mere', 1.2, 'stele'], [620, 1720, 'corne', 1.3, 'stele'], [2600, 1760, 'spirale', 3, 'sol'], [470, 2300, 'dessous', 1.2, 'stele'],
    [1180, 1500, 'soleil', 1.2, 'stele'], [1350, 905, 'dame', 3, 'sol'],
  ],
};

// ---------------------------------------------------------------- outils
function segDist(x, z, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1, t = clamp(((x - ax) * dx + (z - az) * dz) / L2, 0, 1);
  return Math.hypot(x - (ax + dx * t), z - (az + dz * t));
}
function polyDist(x, z, pts) { let d = 1e9; for (let i = 1; i < pts.length; i++) d = Math.min(d, segDist(x, z, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1])); return d; }
function polyBox(pts, m) { let x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9; for (const [x, z] of pts) { x0 = Math.min(x0, x); z0 = Math.min(z0, z); x1 = Math.max(x1, x); z1 = Math.max(z1, z); } return [x0 - m, z0 - m, x1 + m, z1 + m]; }
// intersection de deux segments (ou null)
function segCross(a, b, c, d) {
  const r = [b[0] - a[0], b[1] - a[1]], s = [d[0] - c[0], d[1] - c[1]], den = r[0] * s[1] - r[1] * s[0];
  if (Math.abs(den) < 1e-9) return null;
  const t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / den, u = ((c[0] - a[0]) * r[1] - (c[1] - a[1]) * r[0]) / den;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? [a[0] + r[0] * t, a[1] + r[1] * t] : null;
}

// Le plan complet en coordonnées absolues (une seule fois)
function designPrepare(D) {
  if (D.P) return D.P;
  const [ox, oz] = DESIGN_OFF, C = D.core, Wd = D.wild;
  const mv = (p) => [p[0] + ox, p[1] + oz, ...p.slice(2)];
  const mvPts = (pts) => pts.map(mv);
  const mvObj = (o) => Object.assign({}, o, { x: o.x + ox, z: o.z + oz });
  const P = {
    ridges: [...C.ridges.map((R) => Object.assign({}, R, { pts: mvPts(R.pts) })), ...Wd.ridges], valley: Wd.valley, basins: Wd.basins, cuts: Wd.cuts,
    plateaus: C.plateaus.map(mvObj),
    hills: [...C.hills.map(mv), ...Wd.hills],
    lakes: [...C.lakes.map(mvObj), ...Wd.lakes],
    ponds: C.ponds.map(mvObj),
    rivers: C.rivers.map((R) => Object.assign({}, R, { pts: mvPts(R.pts) })),
    swamp: mvObj(C.swamp),
    sites: {}, roads: C.roads.map((R) => Object.assign({}, R, { pts: mvPts(R.pts) })),
    zones: {}, wonders: {}, herd: mv(C.herd),
    glacier: Wd.glacier, crevasses: Wd.crevasses, frozen: Wd.frozen, trail: Wd.trail, trailAnchors: Wd.trailAnchors, refuge: Wd.refuge, sigils: D.sigils,
  };
  for (const k in C.sites) P.sites[k] = mvObj(C.sites[k]);
  for (const k in C.wonders) P.wonders[k] = mv(C.wonders[k]);
  for (const k in C.zones) P.zones[k] = C.zones[k].map((z) => (k === 'clear' ? mv(z) : mv(z)));
  for (const k in Wd.zones) P.zones[k] = (P.zones[k] || []).concat(Wd.zones[k]);
  P.ridges.forEach((R, i) => { R.box = polyBox(R.pts, R.w + 90); R.k = i * 7.31; });
  // ponts : là où un chemin coupe une rivière
  P.bridges = [];
  for (const R of P.roads) for (let i = 1; i < R.pts.length; i++) for (const V of P.rivers) for (let j = 1; j < V.pts.length; j++) {
    const X = segCross(R.pts[i - 1], R.pts[i], V.pts[j - 1], V.pts[j]);
    if (X) P.bridges.push({ x: X[0], z: X[1], r: Math.atan2(R.pts[i][0] - R.pts[i - 1][0], R.pts[i][1] - R.pts[i - 1][1]), L: 2 * (V.w + 9), w: 3.2 });
  }
  D.P = P;
  return P;
}

// bruit « en crêtes » (multifractal) : arêtes vives, vallons entre elles ; renvoie environ -0,3..0,7
function ridgedMF(noise, x, z) {
  let sum = 0, amp = 0.55, wgt = 1, f = 1;
  for (let o = 0; o < 4; o++) {
    let s = 1 - Math.abs(noise(x * f + o * 19.3, z * f - o * 7.9));
    s *= s; s *= wgt; wgt = Math.min(1, s * 1.8);
    sum += s * amp; amp *= 0.48; f *= 2.03;
  }
  return sum - 0.3;
}
// Relief dessiné (avant lacs, rivières, crevasses) : d'abord des champs lisses sur une grille de 8 m (fond de
// vallée, montagnes autour du contour, arêtes et collines dessinées), puis à chaque sommet le détail des
// montagnes (crêtes, éperons dans le sens de la pente) et les cuvettes (glacier, lac gelé, Combe Perdue).
function designTerrain(D, NW, cell, nA, nB, nC, nD) {
  const P = D.P, WL = D.WL, S = (NW - 1) * cell, G = 8, n = Math.ceil(S / G) + 1, V = P.valley, O = V.outline;
  const mk = () => new Float32Array(n * n);
  const F = { base: mk(), dist: mk(), a: mk(), aN: mk(), aH: mk(), aI: mk() };
  const lin = (arr, v) => { if (v <= arr[0][0]) return arr[0][1]; for (let i = 1; i < arr.length; i++) if (v <= arr[i][0]) { const [a0, b0] = arr[i - 1], [a1, b1] = arr[i]; return b0 + (b1 - b0) * (v - a0) / (a1 - a0); } return arr[arr.length - 1][1]; };
  const warpX = (x, z) => x + fbm(nB, x / 460 + 3.1, z / 460 - 1.7, 2) * 75, warpZ = (x, z) => z + fbm(nC, x / 460 - 5.3, z / 460 + 2.9, 2) * 75;
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const x = i * G, z = j * G, k = j * n + i, wx = warpX(x, z), wz = warpZ(x, z);
    let h = WL + D.base + fbm(nA, x / 640, z / 640, 3) * 5 + fbm(nB, x / 240, z / 240, 3) * 3 + fbm(nC, x / 90, z / 90, 2) * 0.8;
    // les montagnes autour de la vallée : distance (signée) au contour, tordu en grand
    let best = 1e9, inside = false;
    for (let q = 0, p0 = O.length - 1; q < O.length; p0 = q++) {
      const [ax, az] = O[p0], [bx, bz] = O[q];
      if ((az > wz) !== (bz > wz) && wx < ax + (bx - ax) * (wz - az) / (bz - az)) inside = !inside;
      const dd = segDist(wx, wz, ax, az, bx, bz);
      if (dd < best) best = dd;
    }
    const d = (inside ? -best : best) + fbm(nA, x / 700 + 9.1, z / 700 - 4.4, 2) * 110;
    F.dist[k] = d;
    const north = smoothstep(1400, 800, z), band = lerp(V.band, V.bandN, north);
    let aI = 2.4;
    if (d > -160) {
      const pk = lerp(lerp(V.side, V.south, smoothstep(2200, 2700, z)), lin(V.north, x), north) * (0.82 + 0.36 * (0.5 + 0.5 * fbm(nD, x / 340 + 5.1, z / 340, 2)));
      h += Math.pow(smoothstep(-60, band, d), 1.25) * pk;
      F.a[k] = lerp(V.rug, V.rugN, north) * smoothstep(-160, band * 0.6, d);
      aI = Math.max(aI, F.a[k] * 0.3);
    }
    // arêtes et crêtes dessinées (tracé tordu, sommets et cols le long de la crête)
    for (const R of P.ridges) {
      const rx = R.exact ? x : wx, rz = R.exact ? z : wz;
      if (rx < R.box[0] || rz < R.box[1] || rx > R.box[2] || rz > R.box[3]) continue;
      const t = polyDist(rx, rz, R.pts) / R.w;
      if (t >= 1) continue;
      const prof = Math.pow(1 - t * t, 1.7), along = R.flat ? 1 : 0.6 + 0.8 * (0.5 + 0.5 * fbm(nD, wx / (R.w * 1.4) + R.k, wz / (R.w * 1.4), 2));
      h += R.h * prof * along;
      aI = Math.max(aI, (R.rug || R.h * 0.3) * Math.sqrt(prof));
    }
    for (const Q of P.plateaus) {
      const t = Math.hypot((x + (wx - x) * 0.5 - Q.x) / Q.rx, (z + (wz - z) * 0.5 - Q.z) / Q.rz);
      if (t >= 1.15) continue;
      h += Q.h * (1 - smoothstep(1 - Q.edge, 1.15, t)) * (0.9 + 0.2 * fbm(nB, x / 90, z / 90, 2));
    }
    // collines (légèrement tordues : pas de dômes parfaits ; celles des lieux restent en place)
    const hx0 = x + (wx - x) * 0.3, hz0 = z + (wz - z) * 0.3;
    for (const [hx, hz, r, hh, sharp] of P.hills) {
      const dx = hx0 - hx, dz = hz0 - hz;
      if (Math.abs(dx) > r || Math.abs(dz) > r) continue;
      const t = Math.hypot(dx, dz) / r * (1 + fbm(nC, x / 60 + hx, z / 60, 2) * 0.18);
      if (t >= 1) continue;
      const pr = Math.pow(1 - t * t, 2 * (sharp || 1));
      h += hh * pr;
      if (hh > 0) aI = Math.max(aI, hh * 0.4 * Math.sqrt(pr));
    }
    // entailles (col) : on abaisse jusqu'au profil
    for (const C of P.cuts) {
      let bd = 1e9, bh = 0;
      for (let q = 1; q < C.pts.length; q++) {
        const [ax, az] = C.pts[q - 1], [bx, bz] = C.pts[q], dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz, t = clamp(((x - ax) * dx + (z - az) * dz) / L2, 0, 1), dd = Math.hypot(x - ax - dx * t, z - az - dz * t);
        if (dd < bd) { bd = dd; bh = lerp(C.top[q - 1], C.top[q], t); }
      }
      if (bd < C.w * 1.6) { const tgt = WL + bh + (bd / C.w) * (bd / C.w) * C.wall; if (tgt < h) { h = tgt; aI = Math.min(aI, 3); } }
    }
    F.base[k] = h; F.aI[k] = aI;
  }
  // sens des éperons : la pente du champ de distance (lissée), pour que les crêtes descendent vers la vallée
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const k = j * n + i, a = F.a[k];
    if (a <= 0) continue;
    const i0 = Math.max(0, i - 3), i1 = Math.min(n - 1, i + 3), j0 = Math.max(0, j - 3), j1 = Math.min(n - 1, j + 3);
    const gx = (F.dist[j * n + i1] - F.dist[j * n + i0]) / (i1 - i0), gz = (F.dist[j1 * n + i] - F.dist[j0 * n + i]) / (j1 - j0), L = Math.hypot(gx, gz) || 1;
    F.aN[k] = a * (gz / L) * (gz / L); F.aH[k] = a * (gx / L) * (gx / L);
  }
  const blur = (A, r) => { // flou en boîte, séparable : pas de coutures entre deux versants
    const T = new Float32Array(n * n), m = 2 * r + 1;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { let acc = 0; for (let q = -r; q <= r; q++) acc += A[j * n + clamp(i + q, 0, n - 1)]; T[j * n + i] = acc / m; }
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { let acc = 0; for (let q = -r; q <= r; q++) acc += T[clamp(j + q, 0, n - 1) * n + i]; A[j * n + i] = acc / m; }
  };
  blur(F.aN, 4); blur(F.aH, 4);
  P.mtn = { n, G, dist: F.dist }; // pour la végétation : où commence la montagne
  // chaque sommet
  const out = new Float32Array(NW * NW), BS = P.basins;
  for (let j = 0; j < NW; j++) {
    const z = j * cell, gz = Math.min(z / G, n - 1.001), j0 = Math.floor(gz), fz = gz - j0;
    for (let i = 0; i < NW; i++) {
      const x = i * cell, gx = Math.min(x / G, n - 1.001), i0 = Math.floor(gx), fx = gx - i0;
      const k00 = j0 * n + i0, k10 = k00 + 1, k01 = k00 + n, k11 = k01 + 1;
      const w00 = (1 - fx) * (1 - fz), w10 = fx * (1 - fz), w01 = (1 - fx) * fz, w11 = fx * fz;
      const smp = (A) => A[k00] * w00 + A[k10] * w10 + A[k01] * w01 + A[k11] * w11;
      let h = smp(F.base) + fbm(nC, x / 36, z / 36, 2) * 0.35;
      const aN = smp(F.aN), aH = smp(F.aH), aI = smp(F.aI);
      let wx = x, wz = z;
      if (aN > 0.05 || aH > 0.05 || aI > 0.05) { wx = warpX(x, z); wz = warpZ(x, z); }
      if (aN > 0.05) h += aN * ridgedMF(nD, wx / 165, wz / 300);
      if (aH > 0.05) h += aH * ridgedMF(nA, wx / 300, wz / 165);
      if (aI > 0.05) h += aI * ridgedMF(nB, wx / 175, wz / 175);
      // cuvettes : le glacier (incliné vers le sud), le lac gelé, la Combe Perdue
      for (const Bs of BS) {
        if (Math.abs(x - Bs.x) > Bs.rx * Bs.k1 + 60 || Math.abs(z - Bs.z) > Bs.rz * Bs.k1 + 60) continue;
        const qx = Bs.warp ? x + (wx - x) * Bs.warp : x, qz = Bs.warp ? z + (wz - z) * Bs.warp : z;
        const t = Math.hypot((qx - Bs.x) / Bs.rx, (qz - Bs.z) / Bs.rz);
        if (t >= Bs.k1) continue;
        const kk = 1 - smoothstep(Bs.k0, Bs.k1, t);
        const tgt = WL + Bs.h + (Bs.tilt ? (Bs.z - z) * Bs.tilt : 0) + (Bs.bowl ? t * t * Bs.bowl : 0) + (Bs.rim ? Math.max(0, t - 1) * Bs.rim : 0)
          + (Bs.undul ? fbm(nB, x / 130 + 2.2, z / 130, 2) * Bs.undul : 0) + fbm(nC, x / 60, z / 60, 2) * 1.2;
        h = lerp(h, tgt, kk);
      }
      out[j * NW + i] = h;
    }
  }
  return out;
}
// Distance au contour de la vallée (positive dans la montagne), après designTerrain
function designMountain(D, x, z) {
  const M = D.P && D.P.mtn;
  if (!M) return -1e3;
  const gx = clamp(x / M.G, 0, M.n - 1.001), gz = clamp(z / M.G, 0, M.n - 1.001), i = Math.floor(gx), j = Math.floor(gz), fx = gx - i, fz = gz - j, A = M.dist, n = M.n;
  return (A[j * n + i] * (1 - fx) + A[j * n + i + 1] * fx) * (1 - fz) + (A[(j + 1) * n + i] * (1 - fx) + A[(j + 1) * n + i + 1] * fx) * fz;
}
// Champs (humidité, forêt, relief, bouleaux, fleurs, rochers) : grilles de 8 m
function designFields(D, S, nE) {
  const P = D.P, G = 8, n = Math.ceil(S / G) + 1;
  const mk = () => new Float32Array(n * n);
  const F = { forest: mk(), moist: mk(), rough: mk(), birch: mk(), flowers: mk(), rocks: mk() };
  const soft = (x, z, cx, cz, rx, rz) => { const dx = (x - cx) / rx, dz = (z - cz) / rz; if (dx > 1.2 || dx < -1.2 || dz > 1.2 || dz < -1.2) return 0; return 1 - smoothstep(0.55, 1.0, Math.hypot(dx, dz)); };
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const x = i * G, z = j * G, k = j * n + i, wob = fbm(nE, x / 110, z / 110, 3) * 0.14;
    let f = 0, b = 0;
    for (const [cx, cz, rx, rz, v, birch] of P.zones.forest) { const s = soft(x, z, cx, cz, rx * (1 + wob), rz * (1 + wob)) * v; if (s > f) f = s; if (birch && s > 0.1) b = Math.max(b, s / v); }
    for (const [cx, cz, r] of P.zones.clear) { const d = Math.hypot(x - cx, z - cz); if (d < r * 1.25) f -= (1 - smoothstep(r * 0.7, r * 1.25, d)) * 0.8; }
    F.forest[k] = f + wob * 0.6 - 0.02;
    F.birch[k] = b;
    let m = 0;
    for (const [cx, cz, rx, rz, v] of P.zones.moist) m = Math.max(m, soft(x, z, cx, cz, rx, rz) * v);
    for (const R of P.rivers) { const d = polyDist(x, z, R.pts); if (d < R.w + 14) m = Math.max(m, 0.3 * (1 - smoothstep(R.w, R.w + 14, d))); }
    for (const [cx, cz, rx, rz, v] of P.zones.dry) m = Math.min(m, soft(x, z, cx, cz, rx, rz) * v);
    F.moist[k] = m + wob * 0.4;
    let r = 0;
    for (const [cx, cz, rx, rz, v] of P.zones.rough) r = Math.max(r, soft(x, z, cx, cz, rx, rz) * v);
    F.rough[k] = r;
    let fl = 0;
    for (const [cx, cz, rx, rz] of P.zones.flowers) fl = Math.max(fl, soft(x, z, cx, cz, rx, rz));
    F.flowers[k] = fl;
    let ro = 0;
    for (const [cx, cz, rx, rz] of P.zones.rocks) ro = Math.max(ro, soft(x, z, cx, cz, rx, rz));
    F.rocks[k] = ro;
  }
  const sample = (A) => (x, z) => {
    const gx = clamp(x / G, 0, n - 1.001), gz = clamp(z / G, 0, n - 1.001), i = Math.floor(gx), j = Math.floor(gz), fx = gx - i, fz = gz - j;
    const a = A[j * n + i], b = A[j * n + i + 1], c = A[(j + 1) * n + i], d = A[(j + 1) * n + i + 1];
    return (a * (1 - fx) + b * fx) * (1 - fz) + (c * (1 - fx) + d * fx) * fz;
  };
  return { forest: sample(F.forest), moist: sample(F.moist), rough: sample(F.rough), birch: sample(F.birch), flowers: sample(F.flowers), rocks: sample(F.rocks) };
}
// Rivières : lit sous le niveau de l'eau, berges basses (plaine inondable)
function designRivers(D, H, forVerts) {
  const WL = D.WL;
  for (const R of D.P.rivers) {
    const box = polyBox(R.pts, R.w + R.fp + 4);
    forVerts((box[0] + box[2]) / 2, (box[1] + box[3]) / 2, Math.hypot(box[2] - box[0], box[3] - box[1]) / 2, (i, j, k, x, z) => {
      const d = polyDist(x, z, R.pts);
      if (d > R.w + R.fp) return;
      const t = d < R.w ? WL - 0.25 - 1.5 * (1 - (d / R.w) * (d / R.w)) : WL + 0.55 + Math.pow((d - R.w) / R.fp, 2) * 6.5;
      if (t < H[k]) H[k] = t;
    });
  }
}
// Crevasses : fentes profondes dans le glacier (plus profondes au milieu, qui remontent aux deux bouts)
function designCrevasses(D, H, M, forVerts) {
  for (const [[ax, az], [bx, bz]] of D.P.crevasses) {
    const L = Math.hypot(bx - ax, bz - az), depth = 12 + (L % 11);
    forVerts((ax + bx) / 2, (az + bz) / 2, L / 2 + 6, (i, j, k, x, z) => {
      const dx = bx - ax, dz = bz - az, t = clamp(((x - ax) * dx + (z - az) * dz) / (L * L), 0, 1), d = Math.hypot(x - (ax + dx * t), z - (az + dz * t));
      const halfW = 2.2 * Math.sin(Math.PI * clamp(t, 0.02, 0.98)) + 0.4;
      if (d > halfW + 2.2) return;
      const prof = depth * Math.pow(Math.sin(Math.PI * t), 0.7);
      if (d < halfW) { H[k] -= prof * (1 - (d / halfW) * 0.3); M[k] = M_ICE; }
      else M[k] = M_ICE; // lèvres de glace
    });
  }
}
// Chemins dessinés : terre battue, nœuds de navigation (les carrefours partagent le même nœud),
// piste du col terrassée à flanc de montagne, ponts de bois sur la rivière
function designRoadsBuild(D, w, B, ctx) {
  const P = D.P, WL = D.WL, H = w.heights, made = [];
  const nodeAt = (x, z) => { for (const q of made) if (Math.hypot(q.x - x, q.z - z) < 2.5) return q.i; const i = B.navNode(x, z, 'chemin'); made.push({ x, z, i }); return i; };
  const road = (pts, width, wig) => {
    let last = -1, acc = 0, prev = null;
    for (let s = 1; s < pts.length; s++) {
      const [ax, az] = pts[s - 1], [bx, bz] = pts[s], L = Math.hypot(bx - ax, bz - az) || 1, n = Math.max(1, Math.ceil(L / 5));
      const nx = -(bz - az) / L, nz = (bx - ax) / L;
      for (let k = s === 1 ? 0 : 1; k <= n; k++) {
        const t = k / n, off = wig ? Math.sin(t * Math.PI) * ctx.nA(t * 3 + ax * 0.013, az * 0.013) * wig : 0;
        const p = { x: ax + (bx - ax) * t + nx * off, z: az + (bz - az) * t + nz * off };
        if (prev) { B.paintLine(prev.x, prev.z, p.x, p.z, width, M_DIRT); acc += Math.hypot(p.x - prev.x, p.z - prev.z); }
        if (!prev || k === n || acc > 18) { const ni = k === n || !prev ? nodeAt(p.x, p.z) : B.navNode(p.x, p.z, 'chemin'); if (last >= 0 && last !== ni) B.navLink(last, ni, 'road'); last = ni; acc = 0; }
        prev = p;
      }
    }
  };
  // piste terrassée : le sol suit une pente régulière le long de chaque lacet
  const bench = (pts, halfW, anchors) => {
    const hs = pts.map(([x, z]) => w.heightAt(x, z));
    if (anchors) { // pente régulière entre deux repères
      const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
      for (let a = 1; a < anchors.length; a++) { const i0 = anchors[a - 1], i1 = anchors[a]; for (let i = i0 + 1; i < i1; i++) hs[i] = lerp(hs[i0], hs[i1], (cum[i] - cum[i0]) / (cum[i1] - cum[i0])); }
    }
    for (let s = 1; s < pts.length; s++) {
      const [ax, az] = pts[s - 1], [bx, bz] = pts[s], L = Math.hypot(bx - ax, bz - az) || 1, ha = hs[s - 1], hb = hs[s];
      B.forVerts((ax + bx) / 2, (az + bz) / 2, L / 2 + halfW + 5, (i, j, k, x, z) => {
        const dx = bx - ax, dz = bz - az, t = clamp(((x - ax) * dx + (z - az) * dz) / (L * L), 0, 1), d = Math.hypot(x - (ax + dx * t), z - (az + dz * t));
        if (d > halfW + 5) return;
        H[k] = lerp(H[k], lerp(ha, hb, t), 1 - smoothstep(halfW, halfW + 5, d));
      });
    }
    w.markHeights(0, 0, w.N, w.N);
  };
  for (const R of P.roads) road(R.pts, R.w, R.wig || 0);
  // la cabane du pêcheur est au ras de l'eau : un chemin en pente douce descend du chemin du lac
  const FH = w.bld.cabane_pecheur;
  if (FH) {
    const o = w.nav.nodes[FH.nOut];
    let best = null, bd = 1e9;
    for (const R of P.roads) for (const [x, z] of R.pts) { const d = Math.hypot(x - o.x, z - o.z); if (d < bd) { bd = d; best = [x, z]; } }
    if (best && bd < 140) { const ux = (best[0] - o.x) / bd, uz = (best[1] - o.z) / bd, pts = [best, [o.x + ux * 1.5, o.z + uz * 1.5]]; bench(pts, 1.8); road(pts, 0.9, 0); }
  }
  bench(P.trail, 2.4, P.trailAnchors);
  road(P.trail, 1.0, 0);
  P.bridges.forEach((b, i) => designBridge(w, B, b, D, i));
}
// Pont de bois en dos d'âne : un tablier (blocs invisibles sur lesquels on marche) et le modèle 3D
function designBridge(w, B, br, D, nb) {
  const WL = D.WL, L = br.L, f = { x: br.x, y: WL, z: br.z, r: br.r };
  const [ax, az] = B.toWorld(f, 0, -L / 2), [bx, bz] = B.toWorld(f, 0, L / 2);
  const ha = Math.max(w.heightAt(ax, az), WL + 0.3), hb = Math.max(w.heightAt(bx, bz), WL + 0.3), top = Math.max(ha, hb, WL + 1.2) + 0.45;
  const prof = (t) => lerp(top, t < 0.5 ? ha : hb, Math.pow(Math.abs(t - 0.5) * 2, 2.2));
  const n = Math.ceil(L), hw = br.w / 2;
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n, y = prof(t), lz = -L / 2 + (i + 0.5) * L / n, [x, z] = B.toWorld(f, 0, lz);
    w.blocks.push({ x, y: y - 0.3, z, sx: br.w, sy: 0.3, sz: L / n + 0.06, r: br.r, m: M_PLANKS, sh: 0, hidden: true });
    for (const s of [-1, 1]) { const [rx, rz] = B.toWorld(f, s * (hw + 0.06), lz); w.blocks.push({ x: rx, y, z: rz, sx: 0.14, sy: 1.0, sz: L / n + 0.06, r: br.r, m: M_LOGS, sh: 0, hidden: true }); }
  }
  B.prop('pont_bois', br.x, WL, br.z, br.r, { L, w: br.w, a: +(ha - WL).toFixed(2), b: +(hb - WL).toFixed(2), t: +(top - WL).toFixed(2) });
  B.landmark('pont_riviere' + (nb ? Math.min(nb, 5) : ''), br.x, br.z, 10);
}
