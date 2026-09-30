// ============================================================================
//  LE DESSOUS (agent C3, huitième vague) — le moteur du monde souterrain
//  Sous la vallée, à cent vingt ou cent cinquante mètres sous les champs, un
//  réseau de galeries, de salles immenses, de lacs et d'une rivière, plus d'un
//  kilomètre et demi de côté (x 860-2420, z 1045-2580). On y entre par un
//  passage bien caché de Valbrume (voir 11-zzzz9-souterrain1-entree.js).
//  Technique (la vallée reste le monde du jeu : habitants, bêtes, temps, tout
//  continue là-haut) :
//   - le sol et la voûte des galeries sont deux reliefs (grilles de 2 m) calculés
//     depuis un plan dessiné (SOUT_PLAN : salles, galeries, rivière, lacs,
//     piliers, gouffres), par des « creuseurs » : le sol est le plus bas des
//     creuseurs, la voûte le plus haut ; hors des galeries, la roche est pleine ;
//   - dessous, le rendu de la vallée dessine ces reliefs à la place du sien :
//     les textures du relief sont échangées le temps de l'image, et la voûte est
//     dessinée par le même programme que le sol, en miroir (y → −y) ; l'eau d'en
//     bas est le plan d'eau du jeu, abaissé à SOUT_WL ;
//   - le personnage marche sur ce relief (un monde « mandataire » est passé à
//     Player.update : même vallée, autre sol, autre eau) ; ce qui est posé
//     dessous (objets, blocs, plantes) porte le bit VER_SOUS : il n'existe que
//     quand on y est ;
//   - la grille (≈ 20 Mo) n'est calculée qu'à la première descente ; avant, le
//     plan se lit point par point (placement des objets à la génération).
//  API : souterrain (dedans(), floorAt(x, z), vaultAt(x, z), ouvert(x, z, h),
//        zone(x, z), S(), descendre(), remonter(), …). Sauvegarde : farm.s.souterrain.
// ============================================================================
const SOUT_N = 1344, SOUT_CELL = 2, SOUT_W = SOUT_N + 1;
const SOUT_X0 = 840, SOUT_X1 = 2460, SOUT_Z0 = 1020, SOUT_Z1 = 2620;
const SOUT_WL = -150;      // l'eau d'en bas : un seul niveau (lacs, rivière, puits noyés)
const SOUT_ROCK = -24;     // dessus de la roche pleine (hors des galeries)
const SOUT_DEEP = -420;    // « voûte » de la roche pleine (sous le sol : fermé)
const SOUT_VMAX = -34;     // jamais plus haut (la vallée, au plus bas, est à −2)
const SOUT_TOP = -40;      // plus bas que cela, dans la région : on est dessous
const VER_SOUS = 0x2000;   // ce qui n'existe que dessous
const SOUT_GEN = [];       // passes de génération des autres modules : fn(w, rnd, B)

// ---------------------------------------------------------------- le plan
// salles : [clé, x, z, rx, rz, rot, sol, voûte (hauteur au centre), mat. sol, mat. voûte, { und, bowl }]
// galeries : [clé, [[x, z, sol, demi-largeur, hauteur], …], mat. sol, mat. voûte, { und }]
// rivière : [[x, z, demi-largeur]…] (le lit sous l'eau, deux berges) ; lacs : [clé, x, z, rx, rz, rot, fond, voûte]
const SOUT_PLAN = {
  salles: [
    ['seuil', 1575, 1640, 17, 12, 0.3, -118, 9, 'roche', 'roche', { und: 0.5, bowl: 2.5 }],
    ['nef', 1880, 1540, 170, 85, 0.12, -128, 56, 'humus', 'roche', { und: 3.5, bowl: 7 }],
    ['cristal_a', 1725, 1290, 36, 26, 0.5, -108, 12, 'calcite', 'calcite', { und: 1 }],
    ['cristal_b', 1785, 1245, 26, 20, -0.4, -106, 10, 'calcite', 'calcite', { und: 0.8 }],
    ['cristal_c', 1690, 1215, 22, 18, 0.2, -104, 9, 'calcite', 'calcite', { und: 0.8 }],
    ['souffle', 1600, 1160, 48, 34, -0.3, -100, 14, 'soufre', 'soufre', { und: 1.5 }],
    ['gouffres', 2240, 1680, 72, 52, 0.4, -70, 30, 'roche', 'roche', { und: 1.2, bowl: 4 }],
    ['echos', 2385, 1765, 32, 28, 0, -76, 32, 'roche', 'roche', { und: 1 }],
    ['hameau', 2085, 2190, 62, 46, 0.2, -146, 22, 'humus', 'roche', { und: 1.2, bowl: 3 }],
    ['dormeurs', 1690, 1812, 22, 18, 0.6, -112, 12, 'calcite', 'calcite', { und: 0.6 }],
    ['racines', 1752, 2365, 30, 24, 0.3, -50, 13, 'argile', 'roche', { und: 0.8 }],
    ['ruines', 1262, 2330, 96, 66, -0.15, -141, 38, 'roche', 'roche', { und: 4.5, bowl: 4 }],
    ['orgues', 1482, 2540, 50, 36, 0.1, -118, 20, 'calcite', 'calcite', { und: 1.4 }],
  ],
  lacs: [
    ['lac', 1060, 1900, 200, 150, -0.2, -186, 46],
    ['lac_tiede', 2155, 2262, 70, 54, 0.3, -168, 20],
  ],
  riviere: [[1482, 1046, 6], [1472, 1110, 9], [1442, 1200, 10], [1420, 1300, 11], [1396, 1420, 11], [1376, 1520, 11], [1360, 1620, 12], [1346, 1700, 12], [1302, 1780, 12], [1232, 1842, 13], [1170, 1880, 14], [1122, 1900, 16]],
  galeries: [
    ['murés', [[1585, 1632, -118, 3.2, 5], [1610, 1596, -119, 3.4, 5.5], [1660, 1570, -121, 3.6, 6], [1715, 1552, -124, 4, 7], [1740, 1547, -126, 6, 10]], 'roche', 'roche'],
    ['vers_riviere', [[1565, 1648, -118, 3.2, 5.5], [1510, 1665, -125, 3.2, 5.5], [1450, 1675, -135, 3.4, 6], [1395, 1672, -145, 4, 7], [1368, 1668, -148.4, 4.5, 8]], 'roche', 'roche'],
    ['longue', [[1580, 1652, -118, 3.4, 6], [1576, 1760, -121, 3.5, 6], [1561, 1880, -124, 3.5, 6], [1546, 2000, -127, 3.8, 6.5], [1590, 2110, -131, 3.8, 6.5], [1700, 2170, -136, 4, 7], [1850, 2200, -141, 4, 7], [1990, 2200, -145, 4.5, 8], [2035, 2196, -146, 5, 10]], 'roche', 'roche'],
    ['vers_cristal', [[1848, 1472, -127, 4.5, 9], [1800, 1390, -118, 4, 8], [1760, 1330, -111, 4, 8], [1735, 1300, -108, 5, 9]], 'roche', 'roche'],
    ['cristal_ab', [[1745, 1276, -108, 3, 6], [1775, 1252, -106, 3, 6]], 'calcite', 'calcite'],
    ['cristal_ac', [[1712, 1270, -108, 3.4, 6], [1695, 1230, -104, 3.4, 5.5]], 'calcite', 'calcite'],
    ['vers_souffle', [[1680, 1205, -104, 3.2, 6], [1640, 1180, -102, 3.5, 6], [1615, 1168, -100, 4, 8]], 'roche', 'soufre'],
    ['fissure', [[1592, 1135, -100, 2.8, 5], [1580, 1095, -96, 2.6, 4], [1570, 1062, -93, 2.2, 3.2]], 'soufre', 'soufre', { lisse: true }],
    ['mines', [[1562, 1168, -100, 3, 4.5], [1532, 1180, -99, 2.8, 3.4], [1507, 1195, -98, 2.8, 3.4], [1492, 1226, -98, 2.8, 3.4], [1482, 1262, -99, 2.8, 3.4]], 'roche', 'roche', { lisse: true }],
    ['mines_n', [[1507, 1195, -98, 2.6, 3.2], [1516, 1152, -97, 2.6, 3.2], [1536, 1124, -96, 2.6, 3.2]], 'roche', 'roche', { lisse: true }],
    ['mines_s', [[1532, 1180, -99, 2.6, 3.2], [1548, 1228, -98, 2.6, 3.2], [1538, 1262, -98, 2.6, 3.2]], 'roche', 'roche', { lisse: true }],
    ['mines_riviere', [[1482, 1262, -99, 2.8, 4], [1464, 1292, -111, 3.2, 5], [1449, 1330, -127, 3.4, 5.5], [1434, 1350, -145, 3.5, 6], [1418, 1356, -148.4, 3.8, 7]], 'roche', 'roche'],
    ['vers_gouffres', [[2040, 1570, -126, 5, 10], [2100, 1600, -110, 4.5, 9], [2150, 1630, -92, 4, 8], [2190, 1655, -74, 4.5, 10]], 'roche', 'roche'],
    ['vers_echos', [[2295, 1700, -70, 3.5, 7], [2345, 1735, -74, 3.5, 7], [2365, 1752, -76, 4, 10]], 'roche', 'roche'],
    ['descente', [[2250, 1722, -72, 4, 8], [2250, 1820, -90, 4, 8], [2230, 1940, -112, 4, 8], [2180, 2060, -132, 4.5, 9], [2130, 2140, -144, 5, 10]], 'roche', 'roche'],
    ['chatiere', [[1578, 1762, -121, 3.4, 3.5], [1600, 1772, -119.5, 3.4, 1.6], [1628, 1786, -117, 3.4, 1.55], [1652, 1799, -115, 3.4, 2.8], [1672, 1806, -113, 3.6, 6]], 'calcite', 'calcite', { lisse: true }],
    ['vers_racines', [[1700, 2170, -136, 3.4, 6], [1660, 2230, -118, 3.2, 6], [1700, 2280, -100, 3.2, 6], [1760, 2272, -85, 3.2, 6], [1790, 2320, -68, 3.2, 6], [1766, 2350, -54, 4, 8]], 'roche', 'roche'],
    ['vers_ruines', [[1725, 2372, -52, 3.5, 6], [1640, 2400, -70, 3.5, 6], [1560, 2420, -92, 3.5, 6], [1480, 2400, -112, 3.5, 6], [1400, 2370, -130, 4, 7], [1345, 2345, -140, 5, 9]], 'roche', 'roche'],
    ['ruines_lac', [[1215, 2275, -142, 4, 8], [1170, 2180, -146, 4, 7], [1130, 2090, -148, 4, 8], [1100, 2040, -149, 5, 10]], 'roche', 'roche'],
    ['vers_orgues', [[1480, 2400, -112, 3.2, 6], [1485, 2460, -115, 3.2, 6], [1482, 2510, -118, 4, 8]], 'calcite', 'calcite'],
  ],
  // piliers (la roche pleine du sol à la voûte) : [x, z, r]
  piliers: [
    [1800, 1522, 6], [1852, 1582, 9], [1932, 1500, 7], [1992, 1562, 5], [1762, 1560, 4], [1902, 1606, 6], [2012, 1508, 8], [1960, 1590, 3], [1830, 1500, 3],
    [1240, 2300, 7], [1300, 2350, 5], [1180, 2330, 6], [1330, 2300, 3],
    [2240, 1720, 4], [2095, 2168, 3], [1490, 2548, 4], [1462, 2530, 2.5],
  ],
  // gouffres : [x, z, r, fond]
  gouffres: [[2226, 1672, 15, -140], [2272, 1702, 10, -138], [2198, 1648, 8, -205], [2395, 1772, 7, -150]],
  // îlots (le sol remonte au-dessus de l'eau) : [x, z, r, sommet]
  ilots: [[1010, 1878, 26, -146.5], [2170, 2275, 9, -148.3]],
  // cheminées (la voûte monte) : [x, z, r, sommet]
  cheminees: [[1573, 1633, 1.6, -50], [1760, 2374, 2.2, -36]],
};
const SOUT_MAT = { roche: M_SROCHE, calcite: M_SCALCITE, argile: M_SARGILE, humus: M_SHUMUS, soufre: M_SSOUFRE };
const SOUT_ZONES = {
  seuil: 'le Seuil', nef: 'la Grande Nef', cristal_a: 'les Cristallières', cristal_b: 'les Cristallières', cristal_c: 'les Cristallières', souffle: 'le Souffle',
  gouffres: 'les Gouffres', echos: 'la Salle des Échos', hameau: 'le Hameau d’En-Bas', dormeurs: 'la Chambre des Gouttes', racines: 'les Racines',
  ruines: 'la Ville engloutie', orgues: 'les Orgues', lac: 'la Mer muette', lac_tiede: 'le Lac tiède', riviere: 'la Rivière noire', mines: 'les Vieilles Mines',
};
for (const k in SOUT_ZONES) LIEU_NAMES['sout_' + k] = SOUT_ZONES[k];

// ---------------------------------------------------------------- les creuseurs
const SOUT_NW = makeNoise2D(0x50b1), SOUT_NF = makeNoise2D(0x50b2), SOUT_NV = makeNoise2D(0x50b3);
// petites stalactites : une pointe de voûte, çà et là (par sommet de grille)
function soutPointe(x, z, cl) {
  if (cl < 3.2) return 0;
  const h = hash2i(Math.round(x * 0.5), Math.round(z * 0.5), 77);
  return h > 0.935 ? 0.6 + (h - 0.935) * 26 : 0;
}
const SOUT_EV = {
  // galerie : segment A → B, largeur, sol, hauteur interpolés ; coupe en voûte (arc), sol en cuvette
  tube(c, x, z, S) {
    const dx = c.bx - c.ax, dz = c.bz - c.az, L2 = dx * dx + dz * dz || 1;
    let t = ((x - c.ax) * dx + (z - c.az) * dz) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t;
    const qx = c.ax + dx * t, qz = c.az + dz * t, d = Math.hypot(x - qx, z - qz);
    const rr = (c.ar + (c.br - c.ar) * t) * (1 + 0.2 * SOUT_NW(x * 0.06, z * 0.06) + 0.07 * SOUT_NW(x * 0.2 + 17, z * 0.2));
    if (d >= rr) return false;
    const u = d / rr;
    const y = c.ay + (c.by - c.ay) * t + SOUT_NF(x * 0.025, z * 0.025) * c.und + SOUT_NF(x * 0.11, z * 0.11) * 0.22;
    const cl = (c.ac + (c.bc - c.ac) * t) * (1 + (c.lisse ? 0.04 : 0.14) * SOUT_NV(x * 0.05, z * 0.05));
    S.f = y + (c.lisse ? 0.7 : 2.4) * u * u * u * u;
    S.v = y + cl * Math.sqrt(1 - u * u) + (c.lisse ? SOUT_NV(x * 0.14, z * 0.14) * 0.05 : SOUT_NV(x * 0.14, z * 0.14) * 0.45 - soutPointe(x, z, cl));
    S.fm = c.fm; S.vm = c.vm;
    return true;
  },
  // salle : ellipse aux bords irréguliers, sol ondulé, voûte en coupole
  salle(c, x, z, S) {
    const ex = x - c.cx, ez = z - c.cz, lx = ex * c.co - ez * c.si, lz = ex * c.si + ez * c.co;
    const k = Math.hypot(lx / c.rx, lz / c.rz) / (1 + 0.14 * SOUT_NW(x * 0.03, z * 0.03) + 0.06 * SOUT_NW(x * 0.09 + 5, z * 0.09));
    if (k >= 1) return false;
    const y = c.y + SOUT_NF(x * 0.02 + 3, z * 0.02) * c.und * (1 - k * k) + SOUT_NF(x * 0.1, z * 0.1) * 0.3;
    const cl = c.cl * (0.82 + 0.18 * SOUT_NV(x * 0.03, z * 0.03));
    S.f = y + c.bowl * k * k * k * k;
    S.v = y + cl * Math.sqrt(1 - k * k) + SOUT_NV(x * 0.12, z * 0.12) * 0.9 - soutPointe(x, z, cl);
    S.fm = c.fm; S.vm = c.vm;
    return true;
  },
  // lac : le fond descend sous l'eau, la voûte s'élève au-dessus
  lac(c, x, z, S) {
    const ex = x - c.cx, ez = z - c.cz, lx = ex * c.co - ez * c.si, lz = ex * c.si + ez * c.co;
    const k = Math.hypot(lx / c.rx, lz / c.rz) / (1 + 0.12 * SOUT_NW(x * 0.02 + 9, z * 0.02) + 0.05 * SOUT_NW(x * 0.08, z * 0.08 + 3));
    if (k >= 1) return false;
    const rive = SOUT_WL + 1.1 + SOUT_NF(x * 0.05, z * 0.05) * 0.4;
    S.f = lerp(c.fond, rive, smoothstep(0.35, 0.93, k)) + SOUT_NF(x * 0.03, z * 0.03 + 7) * 2 * (1 - k) + 3 * Math.pow(k, 10);
    const cl = c.cl * (0.8 + 0.2 * SOUT_NV(x * 0.02, z * 0.02 + 4));
    S.v = SOUT_WL + 1 + cl * Math.sqrt(1 - k * k) + SOUT_NV(x * 0.12, z * 0.12) * 1.1 - soutPointe(x, z, cl);
    S.fm = k > 0.7 ? M_SARGILE : M_SROCHE; S.vm = M_SROCHE;
    return true;
  },
  // rivière : un lit sous l'eau entre deux berges
  riviere(c, x, z, S) {
    const dx = c.bx - c.ax, dz = c.bz - c.az, L2 = dx * dx + dz * dz || 1;
    let t = ((x - c.ax) * dx + (z - c.az) * dz) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t;
    const qx = c.ax + dx * t, qz = c.az + dz * t, d = Math.hypot(x - qx, z - qz);
    const rr = (c.ar + (c.br - c.ar) * t) * (1 + 0.12 * SOUT_NW(x * 0.05, z * 0.05));
    if (d >= rr) return false;
    const u = d / rr, lit = 0.42 + 0.08 * SOUT_NW(x * 0.04 + 11, z * 0.04);
    const berge = SOUT_WL + 1.25 + SOUT_NF(x * 0.07, z * 0.07) * 0.35;
    S.f = lerp(SOUT_WL - 3.2, berge, smoothstep(lit - 0.1, lit + 0.06, u)) + 2.4 * Math.pow(u, 6);
    const cl = 11 * (0.85 + 0.25 * SOUT_NV(x * 0.03, z * 0.03));
    S.v = berge + cl * Math.sqrt(1 - u * u) + SOUT_NV(x * 0.13, z * 0.13) * 0.8 - soutPointe(x, z, cl);
    S.fm = u < lit ? M_SROCHE : M_SARGILE; S.vm = M_SROCHE;
    return true;
  },
};
// retouches, après les creuseurs (dans l'ordre) : gouffre, îlot, cheminée, pilier
const SOUT_POST = {
  gouffre(c, x, z, F, V, k) {
    if (V[k] - F[k] < 0.5) return;
    const d = Math.hypot(x - c.cx, z - c.cz) / (c.r * (1 + 0.18 * SOUT_NW(x * 0.1, z * 0.1 + 2)));
    if (d >= 1) return;
    F[k] = Math.min(F[k], lerp(c.fond + SOUT_NF(x * 0.2, z * 0.2) * 2, F[k], smoothstep(0.7, 1, d)));
  },
  ilot(c, x, z, F, V, k) {
    const d = Math.hypot(x - c.cx, z - c.cz) / (c.r * (1 + 0.15 * SOUT_NW(x * 0.08 + 4, z * 0.08)));
    if (d >= 1.4) return;
    F[k] = Math.max(F[k], c.top - d * d * 3.2 + SOUT_NF(x * 0.15, z * 0.15) * 0.3);
  },
  cheminee(c, x, z, F, V, k) {
    const d = Math.hypot(x - c.cx, z - c.cz);
    if (d >= c.r + 2.2 || V[k] - F[k] < 0.5) return;
    V[k] = Math.max(V[k], lerp(c.top, V[k], smoothstep(c.r, c.r + 2.2, d)));
  },
  pilier(c, x, z, F, V, k) {
    const d = Math.hypot(x - c.cx, z - c.cz) / (c.r * (1 + 0.2 * SOUT_NW(x * 0.15, z * 0.15 + 8)));
    if (d >= 1) return;
    F[k] = SOUT_ROCK; V[k] = SOUT_DEEP;
  },
};

const souterrain = {
  // ---------------------------------------------------------------- le plan en creuseurs
  _cv: null, _post: null, _bk: null, BK: 64,
  creuseurs() {
    if (this._cv) return this._cv;
    const P = SOUT_PLAN, L = [], post = [], BR = this.branches();
    const box = (c, x0, z0, x1, z1) => { c.x0 = x0; c.z0 = z0; c.x1 = x1; c.z1 = z1; return c; };
    for (const [key, x, z, rx, rz, rot, y, cl, fm, vm, o] of P.salles) {
      const R = Math.max(rx, rz) * 1.25;
      L.push(box({ k: 'salle', key, cx: x, cz: z, rx, rz, co: Math.cos(rot), si: Math.sin(rot), y, cl, fm: SOUT_MAT[fm], vm: SOUT_MAT[vm], und: (o && o.und) || 0.6, bowl: (o && o.bowl) || 3 }, x - R, z - R, x + R, z + R));
    }
    for (const [key, x, z, rx, rz, rot, fond, cl] of P.lacs) {
      const R = Math.max(rx, rz) * 1.2;
      L.push(box({ k: 'lac', key, cx: x, cz: z, rx, rz, co: Math.cos(rot), si: Math.sin(rot), fond, cl }, x - R, z - R, x + R, z + R));
    }
    for (let i = 0; i + 1 < P.riviere.length; i++) {
      const [ax, az, ar] = P.riviere[i], [bx, bz, br] = P.riviere[i + 1], R = Math.max(ar, br) * 1.2;
      L.push(box({ k: 'riviere', key: 'riviere', ax, az, ar, bx, bz, br }, Math.min(ax, bx) - R, Math.min(az, bz) - R, Math.max(ax, bx) + R, Math.max(az, bz) + R));
    }
    // les bouts de galerie qui débouchent dans une salle, un lac ou sur la rivière prennent la hauteur du sol qu'ils y trouvent
    const S0 = {}, bases = L.slice();
    const sol = (x, z) => { let f = null; for (const c of bases) if (x >= c.x0 && x <= c.x1 && z >= c.z0 && z <= c.z1 && SOUT_EV[c.k](c, x, z, S0)) f = f === null ? S0.f : Math.min(f, S0.f); return f; };
    // (un bout resté juste au bord d'une salle y est prolongé jusqu'à y entrer franchement)
    const entrer = (q) => {
      if (sol(q[0], q[1]) !== null) return;
      for (const c of bases) {
        if (c.k !== 'salle' && c.k !== 'lac') continue;
        const d = Math.hypot(c.cx - q[0], c.cz - q[1]);
        if (d > Math.max(c.rx, c.rz) * 1.15) continue;
        const ux = (c.cx - q[0]) / d, uz = (c.cz - q[1]) / d;
        for (let s = 1; s < 50; s++) if (SOUT_EV[c.k](c, q[0] + ux * s, q[1] + uz * s, S0)) { q[0] += ux * (s + 5); q[1] += uz * (s + 5); return; }
      }
    };
    const tubes = (key, pts, fm, vm, o) => {
      pts = pts.map((q) => q.slice());
      for (const i of [0, pts.length - 1]) { if (o && o.snap === false) continue; entrer(pts[i]); const f = sol(pts[i][0], pts[i][1]); if (f !== null) pts[i][2] = Math.max(SOUT_WL + 1.1, f + 0.05); }
      for (let i = 0; i + 1 < pts.length; i++) {
        const [ax, az, ay, ar, ac] = pts[i], [bx, bz, by, br, bc] = pts[i + 1], R = Math.max(ar, br) * 1.35;
        L.push(box({ k: 'tube', key, ax, az, ay, ar, ac, bx, bz, by, br, bc, fm, vm, und: (o && o.und) || 0.5, lisse: !!(o && o.lisse) }, Math.min(ax, bx) - R, Math.min(az, bz) - R, Math.max(ax, bx) + R, Math.max(az, bz) + R));
      }
      return pts;
    };
    for (const g of P.galeries) g[1] = tubes(g[0], g[1], SOUT_MAT[g[2]], SOUT_MAT[g[3]], g[4]);
    bases.length = 0; for (const c of L) bases.push(c);
    // les boyaux : pas de traverse d'une autre galerie (un fossé ou une marche infranchissable)
    this._brOk = [];
    for (const b of BR) {
      const n0 = L.length;
      let bad = false;
      for (let i = 0; i + 1 < b.pts.length && !bad; i++) {
        const A = b.pts[i], Bq = b.pts[i + 1], len = Math.hypot(Bq[0] - A[0], Bq[1] - A[1]);
        for (let s = i ? 0 : 10; s <= len && !bad; s += 3) { const x = lerp(A[0], Bq[0], s / len), z = lerp(A[1], Bq[1], s / len), f = sol(x, z); if (f !== null) bad = true; }
      }
      if (bad) continue;
      if (b.fin) { const [x, z, , r] = b.fin; for (let a = 0; a < 6 && b.fin; a++) if (sol(x + Math.cos(a) * r * 1.3, z + Math.sin(a) * r * 1.3) !== null) b.fin = null; }
      tubes(b.key, b.pts, M_SROCHE, M_SROCHE, null);
      this._brOk.push(b);
      if (b.fin) { const [x, z, y, r, cl] = b.fin; L.push(box({ k: 'salle', key: b.key + '_s', cx: x, cz: z, rx: r, rz: r * (0.7 + hash2i(x | 0, z | 0, 3) * 0.5), co: 1, si: 0, y, cl, fm: M_SROCHE, vm: M_SROCHE, und: 0.6, bowl: 2.2 }, x - r * 1.3, z - r * 1.3, x + r * 1.3, z + r * 1.3)); }
      for (let q = n0; q < L.length; q++) bases.push(L[q]);
    }
    for (const [x, z, r, fond] of P.gouffres) post.push(box({ k: 'gouffre', cx: x, cz: z, r, fond }, x - r * 1.3, z - r * 1.3, x + r * 1.3, z + r * 1.3));
    for (const [x, z, r, top] of P.ilots) post.push(box({ k: 'ilot', cx: x, cz: z, r, top }, x - r * 1.7, z - r * 1.7, x + r * 1.7, z + r * 1.7));
    for (const [x, z, r, top] of P.cheminees) post.push(box({ k: 'cheminee', cx: x, cz: z, r, top }, x - r - 3, z - r - 3, x + r + 3, z + r + 3));
    for (const [x, z, r] of P.piliers) post.push(box({ k: 'pilier', cx: x, cz: z, r }, x - r * 1.25, z - r * 1.25, x + r * 1.25, z + r * 1.25));
    this._cv = L; this._post = post;
    // seaux de 64 m : quels creuseurs touchent quel carré (les points se calculent sans la grille)
    const BK = this.BK, bw = Math.ceil((SOUT_N * SOUT_CELL) / BK) + 1, bk = new Array(bw * bw);
    const add = (list, idx, c) => {
      for (let j = Math.max(0, Math.floor(c.z0 / BK)); j <= Math.min(bw - 1, Math.floor(c.z1 / BK)); j++) for (let i = Math.max(0, Math.floor(c.x0 / BK)); i <= Math.min(bw - 1, Math.floor(c.x1 / BK)); i++) {
        const q = j * bw + i; (bk[q] || (bk[q] = [[], []]))[list].push(idx);
      }
    };
    L.forEach((c, i) => add(0, i, c)); post.forEach((c, i) => add(1, i, c));
    this._bk = bk; this._bw = bw;
    return L;
  },
  // les galeries de traverse : des boyaux tirés au hasard (graine fixe) le long des grandes galeries
  branches() {
    if (this._br) return this._br;
    const rnd = mulberry32(0x50b7a11e), out = [];
    const src = SOUT_PLAN.galeries.filter((g) => !['chatiere', 'fissure', 'mines_n', 'mines_s', 'mines_o', 'cristal_ab', 'cristal_ac'].includes(g[0]));
    for (let n = 0; n < 64; n++) {
      const g = src[(rnd() * src.length) | 0], pts = g[1], i = (rnd() * (pts.length - 1)) | 0, t = 0.2 + rnd() * 0.6;
      const A = pts[i], B = pts[i + 1];
      const x0 = lerp(A[0], B[0], t), z0 = lerp(A[1], B[1], t), y0 = lerp(A[2], B[2], t), r0 = lerp(A[3], B[3], t);
      const dir = Math.atan2(B[0] - A[0], B[1] - A[1]) + (rnd() < 0.5 ? 1 : -1) * (0.9 + rnd() * 0.9);
      const len = 30 + rnd() * 90, segs = 2 + ((rnd() * 3) | 0), P = [[x0, z0, y0, Math.min(r0, 2.6), 4.5]];
      let x = x0, z = z0, y = y0, a = dir, ok = true;
      for (let s = 0; s < segs; s++) {
        a += (rnd() - 0.5) * 0.9;
        const l = len / segs; x += Math.sin(a) * l; z += Math.cos(a) * l; y += (rnd() - 0.5) * l * 0.16;
        if (x < SOUT_X0 + 30 || x > SOUT_X1 - 30 || z < SOUT_Z0 + 30 || z > SOUT_Z1 - 30) { ok = false; break; }
        P.push([x, z, Math.max(SOUT_WL + 1.4, Math.min(y, SOUT_VMAX - 12)), 2 + rnd() * 1.8, 2.6 + rnd() * 3.6]);
      }
      if (!ok || P.length < 2) continue;
      const fin = P[P.length - 1];
      out.push({ key: 'boyau' + n, pts: P, fin: rnd() < 0.45 ? [fin[0], fin[1], fin[2], 5 + rnd() * 7, 4 + rnd() * 6] : null });
    }
    return (this._br = out);
  },
  // ---------------------------------------------------------------- un sommet de la grille (i, j) : sol, voûte, matières
  _S: { f: 0, v: 0, fm: 0, vm: 0 },
  _o: { F: new Float32Array(1), V: new Float32Array(1) },
  sommet(i, j, out) {
    if (this.F) { const k = j * SOUT_W + i; out.f = this.F[k]; out.v = this.V[k]; out.fm = this.FM[k]; out.vm = this.VM[k]; return out; }
    this.creuseurs();
    const x = i * SOUT_CELL, z = j * SOUT_CELL, S = this._S;
    let f = SOUT_ROCK, v = SOUT_DEEP, fm = M_SROCHE, vm = M_SROCHE;
    const bq = this._bk[Math.min(this._bw - 1, Math.floor(z / this.BK)) * this._bw + Math.min(this._bw - 1, Math.floor(x / this.BK))];
    if (bq) {
      for (const ci of bq[0]) {
        const c = this._cv[ci];
        if (x < c.x0 || x > c.x1 || z < c.z0 || z > c.z1 || !SOUT_EV[c.k](c, x, z, S)) continue;
        if (S.f < f) { f = S.f; fm = S.fm; }
        if (S.v > v) { v = S.v; vm = S.vm; }
      }
      const o = this._o; o.F[0] = f; o.V[0] = v;
      for (const ci of bq[1]) { const c = this._post[ci]; if (x >= c.x0 && x <= c.x1 && z >= c.z0 && z <= c.z1) SOUT_POST[c.k](c, x, z, o.F, o.V, 0); }
      f = o.F[0]; v = o.V[0];
    }
    if (v > SOUT_VMAX) v = SOUT_VMAX;
    if (v - f < 0.3) { f = SOUT_ROCK; v = SOUT_DEEP; }
    out.f = f; out.v = v; out.fm = fm; out.vm = vm;
    return out;
  },
  // ---------------------------------------------------------------- la grille entière (à la première descente)
  construire() {
    if (this.F) return;
    const t0 = performance.now();
    const W = SOUT_W, F = new Float32Array(W * W), V = new Float32Array(W * W), FM = new Uint8Array(W * W), VM = new Uint8Array(W * W);
    F.fill(SOUT_ROCK); V.fill(SOUT_DEEP); FM.fill(M_SROCHE); VM.fill(M_SROCHE);
    const L = this.creuseurs(), S = this._S, C = SOUT_CELL;
    for (const c of L) {
      const ev = SOUT_EV[c.k];
      const i0 = Math.max(0, Math.ceil(c.x0 / C)), i1 = Math.min(SOUT_N, Math.floor(c.x1 / C)), j0 = Math.max(0, Math.ceil(c.z0 / C)), j1 = Math.min(SOUT_N, Math.floor(c.z1 / C));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        if (!ev(c, i * C, j * C, S)) continue;
        const k = j * W + i;
        if (S.f < F[k]) { F[k] = S.f; FM[k] = S.fm; }
        if (S.v > V[k]) { V[k] = S.v; VM[k] = S.vm; }
      }
    }
    for (const c of this._post) {
      const fn = SOUT_POST[c.k];
      const i0 = Math.max(0, Math.ceil(c.x0 / C)), i1 = Math.min(SOUT_N, Math.floor(c.x1 / C)), j0 = Math.max(0, Math.ceil(c.z0 / C)), j1 = Math.min(SOUT_N, Math.floor(c.z1 / C));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) fn(c, i * C, j * C, F, V, j * W + i);
    }
    for (let k = 0; k < F.length; k++) {
      if (V[k] > SOUT_VMAX) V[k] = SOUT_VMAX;
      if (V[k] - F[k] < 0.3) { F[k] = SOUT_ROCK; V[k] = SOUT_DEEP; }
    }
    this.F = F; this.V = V; this.FM = FM; this.VM = VM;
    this.dureeGrille = Math.round(performance.now() - t0);
  },
  // ---------------------------------------------------------------- lectures (même triangulation que le maillage)
  _q: [{ f: 0, v: 0, fm: 0, vm: 0 }, { f: 0, v: 0, fm: 0, vm: 0 }, { f: 0, v: 0, fm: 0, vm: 0 }, { f: 0, v: 0, fm: 0, vm: 0 }],
  interp(x, z, key) {
    const gx = clamp(x / SOUT_CELL, 0, SOUT_N - 1e-4), gz = clamp(z / SOUT_CELL, 0, SOUT_N - 1e-4);
    const i = Math.floor(gx), j = Math.floor(gz), fx = gx - i, fz = gz - j;
    let ha, hb, hc, hd;
    if (this.F) {
      const A = key === 'f' ? this.F : this.V, k = j * SOUT_W + i;
      ha = A[k]; hb = A[k + 1]; hc = A[k + SOUT_W]; hd = A[k + SOUT_W + 1];
    } else {
      const q = this._q;
      ha = this.sommet(i, j, q[0])[key]; hb = this.sommet(i + 1, j, q[1])[key]; hc = this.sommet(i, j + 1, q[2])[key]; hd = this.sommet(i + 1, j + 1, q[3])[key];
    }
    if (fx + fz <= 1) return ha + (hb - ha) * fx + (hc - ha) * fz;
    return hd + (hc - hd) * (1 - fx) + (hb - hd) * (1 - fz);
  },
  floorAt(x, z) { return this.interp(x, z, 'f'); },
  vaultAt(x, z) { return this.interp(x, z, 'v'); },
  matAt(x, z) {
    const i = clamp(Math.round(x / SOUT_CELL), 0, SOUT_N), j = clamp(Math.round(z / SOUT_CELL), 0, SOUT_N);
    if (this.FM) return this.FM[j * SOUT_W + i];
    return this.sommet(i, j, this._q[0]).fm;
  },
  // de la place pour un corps de hauteur h (sol libre, voûte au-dessus)
  ouvert(x, z, h) { const f = this.floorAt(x, z); return f < SOUT_ROCK - 1 && this.vaultAt(x, z) - f > (h || 1.9); },
  normalAt(x, z) { const e = 1; return v3.norm([this.floorAt(x - e, z) - this.floorAt(x + e, z), 2 * e, this.floorAt(x, z - e) - this.floorAt(x, z + e)]); },
  dansRegion(x, z) { return x > SOUT_X0 && x < SOUT_X1 && z > SOUT_Z0 && z < SOUT_Z1; },
  // la zone du plan la plus proche (pour les noms de lieux)
  zone(x, z) {
    let best = null, bd = 1e9;
    for (const [key, cx, cz, rx, rz] of SOUT_PLAN.salles) { if (/^boyau/.test(key)) continue; const d = Math.hypot(x - cx, z - cz) / Math.max(rx, rz); if (d < bd) { bd = d; best = key; } }
    for (const [key, cx, cz, rx, rz] of SOUT_PLAN.lacs) { const d = Math.hypot(x - cx, z - cz) / Math.max(rx, rz); if (d < bd) { bd = d; best = key; } }
    for (const [cx, cz, r] of SOUT_PLAN.riviere) { const d = Math.hypot(x - cx, z - cz) / (r * 4); if (d < bd) { bd = d; best = 'riviere'; } }
    if (Math.hypot(x - 1518, z - 1200) < 80 && bd > 0.8) best = 'mines';
    return bd < 2.2 ? best : null;
  },
  nomLieu(x, z) { const k = this.zone(x, z); return k ? SOUT_ZONES[k] : 'les galeries d’en bas'; },

  // ---------------------------------------------------------------- état sauvegardé
  S() {
    const s = farm.s;
    if (!s) return { vu: {} };
    const S = s.souterrain || (s.souterrain = {});
    if (!S.vu) S.vu = {}; if (!S.pris) S.pris = {}; if (!S.f) S.f = {};
    return S;
  },
  // ---------------------------------------------------------------- dessous ou pas
  actif: false,
  dedans(pos) {
    if (game.kind !== 'farm' || !farm.s) return false;
    pos = pos || game.player.pos;
    return pos[1] < SOUT_TOP && this.dansRegion(pos[0], pos[2]);
  },
  // ---------------------------------------------------------------- le monde « mandataire » : la vallée, avec le sol et l'eau d'en bas
  monde(w) {
    if (this._m && this._mw === w) return this._m;
    const S = this;
    const O = {
      waterLevel: SOUT_WL,
      heightAt: (x, z) => S.floorAt(x, z),
      matAt: (x, z) => S.matAt(x, z),
      normalAt: (x, z) => S.normalAt(x, z),
      objectY: (o) => (o.y !== undefined ? o.y : w.heightAt(o.x, o.z)),
      covered: () => false,
      query: (x, z, r, a, b) => w.query(x, z, r, a, b),
      groundAt(x, z, feetY, stepUp, margin) { return World.prototype.groundAt.call(S._m, x, z, feetY, stepUp, margin); },
      raycastTerrain(o, d, max) { return World.prototype.raycastTerrain.call(S._m, o, d, max); },
      collideCircle(x, z, feet, head, radius, stepUp, withObjects, ignoreDoors) {
        let [nx, nz] = World.prototype.collideCircle.call(S._m, x, z, feet, head, radius, stepUp, withObjects, ignoreDoors);
        const need = head - feet, D = S.depart;
        if (D && !S.passe(nx, nz, feet, need)) {
          if (S.passe(nx, D[1], feet, need)) nz = D[1]; else if (S.passe(D[0], nz, feet, need)) nx = D[0]; else { nx = D[0]; nz = D[1]; }
        }
        return [nx, nz];
      },
    };
    this._mw = w;
    this._m = new Proxy(w, {
      get(t, k) { if (Object.prototype.hasOwnProperty.call(O, k)) return O[k]; return t[k]; },
      set(t, k, v) { t[k] = v; return true; },
    });
    return this._m;
  },
  // un corps de hauteur `need`, les pieds à `feet`, tient-il en (x, z) ? (la voûte, ou la roche pleine)
  passe(x, z, feet, need) {
    const f = this.floorAt(x, z);
    if (f > SOUT_ROCK - 1) return false;
    return this.vaultAt(x, z) - Math.max(f, feet) > need - 0.05;
  },
  // la fonction fn, le temps de son appel, voit le monde d'en bas (noyade, flèches, pêche…)
  avecMonde(fn) {
    if (!this.actif) return fn();
    const g = game.world;
    game.world = this.monde(g);
    try { return fn(); } finally { game.world = g; }
  },
  sousLEau(p) { return p[1] < SOUT_WL && this.floorAt(p[0], p[2]) < SOUT_WL; },

  // ---------------------------------------------------------------- entrer, sortir (le mode « dessous »)
  basculer(on) {
    const w = game.world;
    if (!w || this.actif === on) return;
    this.actif = on;
    if (on) { this.construire(); this.depart = null; }
    this.appliquerVer();
    npcs.vanishAll && npcs.vanishAll(on || strange.redNight() || strange.inEnvers());
    if (on) { const S = this.S(); S.descentes = (S.descentes || 0) + 1; }
    this.kCiel = on ? 1 : 0;
    MSON && (on ? MSON.drone('souterrain', [41.2, 55, 61.7], 0.035, 'sine', 180) : MSON.stopDrone('souterrain'));
    if (game.renderer) game.renderer.activeCenter = null;
    for (const fn of this.aBascule) try { fn(on); } catch (e) { console.error(e); }
  },
  aBascule: [],
  appliquerVer() {
    const w = game.world;
    if (!w) return;
    const on = this.actif, has = !!(w.curVer & VER_SOUS);
    if (on === has) return;
    w.curVer = on ? w.curVer | VER_SOUS : w.curVer & ~VER_SOUS;
    w.objectsDirty = true; w.blocksDirty = true; w.grid = null; w.coverDirty = true;
    farm.dirtyProps = true;
  },

  // ---------------------------------------------------------------- chaque image
  update(dt, eye, basis, sky, playing) {
    const on = this.dedans();
    if (on !== this.actif) this.basculer(on);
    if (!on) return;
    this.appliquerVer();
    const p = game.player, S = this.S();
    // dernier endroit sûr (pour s'en sortir si l'on se trouve pris dans la roche)
    if (p.onGround && !p.swimming && this.ouvert(p.pos[0], p.pos[2], 1.05)) this.bon = p.pos.slice();
    const z = this.zone(p.pos[0], p.pos[2]);
    if (z) { if (!S.vu[z]) S.vu[z] = farm.s.day; if (savoir && savoir.connaitreLieu) savoir.connaitreLieu('sout_' + z); }
    for (const fn of this.aChaqueImage) try { fn(dt, eye, basis, sky, playing); } catch (e) { console.error(e); }
  },
  aChaqueImage: [],
  // après le pas du personnage : la voûte, la roche, et « dessous » pour le reste de l'image
  apres(p) {
    const x = p.pos[0], z = p.pos[2], f = this.floorAt(x, z), vt = this.vaultAt(x, z);
    if (f > SOUT_ROCK - 1 || (p.pos[1] < f - 1.5 && !p.swimming)) { // pris dans la roche : on revient où l'on était
      if (this.bon) { p.pos = this.bon.slice(); p.vel = [0, 0, 0]; }
    } else {
      if (vt - Math.max(f, p.pos[1]) < 1.86 && !p.riding) p.crouch = Math.max(p.crouch, 1); // un boyau bas : on se baisse
      const top = p.pos[1] + p.bodyH();
      if (top > vt - 0.04) { if (p.vel[1] > 0) p.vel[1] = 0; p.pos[1] = Math.max(f, vt - 0.04 - p.bodyH()); }
    }
    p.underground = true;
  },

  // ---------------------------------------------------------------- le ciel d'en bas : il n'y en a pas
  ciel(sky) {
    const N = [0, 0, 0];
    sky.zen = [0.003, 0.003, 0.004]; sky.hor = [0.004, 0.004, 0.005]; sky.glow = N; sky.haze = [0.004, 0.0035, 0.004];
    sky.amb = [0.016, 0.017, 0.021]; sky.sunCol = N; sky.moonCol = N; sky.cloudLit = N; sky.cloudDark = N;
    sky.stars = 0; sky.sunVis = 0; sky.moonVis = 0; sky.cloudCover = 0; sky.mist = 0; sky.shadowK = 0; sky.nightLit = 1; sky.wet = 0; sky.frost = 0;
    sky.fog = [5, 78];
    if (this.cielFx) this.cielFx(sky);
  },

  // ---------------------------------------------------------------- rendu (installé une fois)
  gl: null,
  installer() {
    if (this.installe) return;
    this.installe = true;
    const R = game.renderer, S = this;
    const _render = R.render.bind(R), _use = R.use.bind(R), _vis = R.visibleChunks.bind(R), _uao = R.updateActiveObjects.bind(R);
    this._use = _use;
    R.render = function (F) {
      if (!(S.actif && game.kind === 'farm' && S.F)) return _render(F);
      const G = S.texturer(this);
      if (!G) return _render(F);
      this.syncWorld();
      S.lier(G.hF, G.mF, G.sF);
      S.image = { vault: false, terrain: false, U: null, n: 0 };
      F.grass = null; F.rain = 0; F.snow = 0; F.moon2 = 0; F.underwater = S.sousLEau(F.cam.pos);
      try { return _render(F); } finally { S.image = null; S.lier(this.hTex, this.mTex, this.sTex); }
    };
    R.use = function (pr, U) {
      const im = S.image;
      if (!im) return _use(pr, U);
      const O = Object.assign({}, U, S.gl.ovr);
      if (pr === this.progs.terrain) { im.U = O; im.terrain = true; return _use(pr, O); }
      if (im.terrain && !im.vault) { im.vault = true; try { S.voute(this, im); } catch (e) { console.error(e); } }
      return _use(pr, O);
    };
    R.visibleChunks = function (pos, b, tanX, tanY, far) { if (S.image) return S.morceaux(pos, b, tanX, tanY, far); return _vis(pos, b, tanX, tanY, far); };
    // dessous, on ne dessine que les plantes et objets d'en bas (ceux de là-haut sont à cent mètres dans la roche)
    R.updateActiveObjects = function (cam, Rr) {
      if (!S.actif) return _uao(cam, Rr);
      const xz = this.objXZ, all = this.objAll, act = this.objActive, R2 = Rr * Rr;
      let n = 0;
      for (let i = 0; i < this.objTotal; i++) {
        const dx = xz[i * 2] - cam[0], dz = xz[i * 2 + 1] - cam[2];
        if (dx * dx + dz * dz > R2 || all[i * 13 + 1] > SOUT_TOP) continue;
        act.set(all.subarray(i * 13, i * 13 + 13), n * 13); n++;
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, this.objBuf);
      gl.bufferData(gl.ARRAY_BUFFER, act.subarray(0, Math.max(1, n) * 13), gl.DYNAMIC_DRAW);
      this.objCount = n; this.activeCenter = [cam[0], cam[2]];
    };
  },
  // textures des deux reliefs (créées à la première image dessous)
  texturer(R) {
    if (this.gl) return this.gl;
    if (!this.F) return null;
    const U = 12, W = SOUT_W;
    gl.activeTexture(gl.TEXTURE0 + U);
    const neg = new Float32Array(this.V.length);
    for (let k = 0; k < neg.length; k++) neg[k] = -this.V[k];
    const G = {
      hF: glDataTex(W, W, 'R32F', this.F, false), mF: glDataTex(W, W, 'R8', this.FM, false),
      hV: glDataTex(W, W, 'R32F', neg, false), mV: glDataTex(W, W, 'R8', this.VM, false),
      sF: glDataTex(W, W, 'R8', new Uint8Array(W * W), true),
      ovr: { uN: SOUT_N, uCell: SOUT_CELL, uWater: SOUT_WL, uWaterV: SOUT_WL, uCoverW: 0, uFrost: 0, uWet: 0 },
      vp: new Float32Array(16), lum: new Float32Array(MAX_LIGHTS * 4),
    };
    // les morceaux (32 × 32 cellules) qui ont du vide : leurs hauteurs extrêmes (sol et voûte)
    const nc = Math.ceil(SOUT_N / CHUNK), ch = [];
    for (let cz = 0; cz < nc; cz++) for (let cx = 0; cx < nc; cx++) {
      let mn = 1e9, mx = -1e9, open = false;
      for (let j = cz * CHUNK; j <= Math.min(SOUT_N, cz * CHUNK + CHUNK); j++) for (let i = cx * CHUNK; i <= Math.min(SOUT_N, cx * CHUNK + CHUNK); i++) {
        const k = j * W + i;
        if (this.V[k] - this.F[k] > 0.3) { open = true; if (this.F[k] < mn) mn = this.F[k]; if (this.V[k] > mx) mx = this.V[k]; }
      }
      if (open) ch.push({ x: cx * CHUNK, z: cz * CHUNK, minH: mn - 2, maxH: Math.min(SOUT_ROCK, mx + 2) });
    }
    G.chunks = ch; G.vis = new Float32Array(Math.max(2, ch.length * 2));
    this.gl = G;
    return G;
  },
  lier(h, m, s) {
    gl.activeTexture(gl.TEXTURE0 + TEX_H); gl.bindTexture(gl.TEXTURE_2D, h);
    gl.activeTexture(gl.TEXTURE0 + TEX_M); gl.bindTexture(gl.TEXTURE_2D, m);
    gl.activeTexture(gl.TEXTURE0 + TEX_S); gl.bindTexture(gl.TEXTURE_2D, s);
  },
  morceaux(pos, b, tanX, tanY, far) {
    const G = this.gl, cell = SOUT_CELL, half = CHUNK * cell / 2;
    const hx = Math.atan(tanX), hy = Math.atan(tanY);
    const planes = [
      v3.add(v3.scale(b.r, Math.cos(hx)), v3.scale(b.f, -Math.sin(hx))), v3.add(v3.scale(b.r, -Math.cos(hx)), v3.scale(b.f, -Math.sin(hx))),
      v3.add(v3.scale(b.u, Math.cos(hy)), v3.scale(b.f, -Math.sin(hy))), v3.add(v3.scale(b.u, -Math.cos(hy)), v3.scale(b.f, -Math.sin(hy))),
    ];
    let n = 0;
    for (const c of G.chunks) {
      const cx = c.x * cell + half - pos[0], cz = c.z * cell + half - pos[2], cy = (c.minH + c.maxH) / 2 - pos[1];
      const r = Math.hypot(half * 1.4143, (c.maxH - c.minH) / 2), d = Math.hypot(cx, cy, cz);
      if (d - r > far) continue;
      let out = false;
      for (const p of planes) if (p[0] * cx + p[1] * cy + p[2] * cz > r) { out = true; break; }
      if (out) continue;
      G.vis[n * 2] = c.x; G.vis[n * 2 + 1] = c.z; n++;
    }
    if (this.image) this.image.n = n;
    return { data: G.vis, n };
  },
  // la voûte : le relief d'en haut, dessiné par le programme du sol, en miroir (y → −y)
  voute(R, im) {
    const G = this.gl, U = im.U;
    if (!U || !im.n) return;
    const VP = G.vp; VP.set(U.uViewProj); VP[4] = -VP[4]; VP[5] = -VP[5]; VP[6] = -VP[6]; VP[7] = -VP[7];
    const L = G.lum; L.set(U.uLights); for (let i = 0; i < MAX_LIGHTS; i++) L[i * 4 + 1] = -L[i * 4 + 1];
    const c = U.uCamPos, sd = U.uSunDir, md = U.uMoonDir;
    const O = Object.assign({}, U, { uViewProj: VP, uCamPos: [c[0], -c[1], c[2]], uLights: L, uWater: -1e5, uSunDir: [sd[0], -sd[1], sd[2]], uMoonDir: [md[0], -md[1], md[2]], uShadowK: 0, uBrush: [0, 0, 0, 0] });
    this.lier(G.hV, G.mV, G.sF);
    this._use(R.progs.terrain, O);
    gl.bindVertexArray(R.terrainVAO);
    gl.enable(gl.CULL_FACE); gl.frontFace(gl.CW);
    gl.drawElementsInstanced(gl.TRIANGLES, R.chunkIndexCount, gl.UNSIGNED_SHORT, 0, im.n);
    gl.frontFace(gl.CCW);
    this.lier(G.hF, G.mF, G.sF);
  },
};

// ---------------------------------------------------------------- les accroches
// le personnage : dessous, il marche sur le sol d'en bas (la vallée au-dessus n'a plus de sol pour lui)
{
  const _pu = Player.prototype.update;
  Player.prototype.update = function (dt, w, c) {
    if (this !== game.player || this.fly || !souterrain.dedans(this.pos)) return _pu.call(this, dt, w, c);
    const S = souterrain;
    if (!S.actif) S.basculer(true);
    S.depart = [this.pos[0], this.pos[2]];
    try { return _pu.call(this, dt, S.monde(w), c); } finally { S.depart = null; S.apres(this); }
  };
}
// noyade, flèches, pêche : l'eau et le sol d'en bas
{
  const _ub = play.updateBody.bind(play);
  play.updateBody = function (dt) { return souterrain.avecMonde(() => _ub(dt)); };
  const _ua = play.updateArrows.bind(play);
  play.updateArrows = function (dt) { return souterrain.avecMonde(() => _ua(dt)); };
}
// ce qui rôde là-haut n'atteint pas ceux d'en bas (bêtes, habitants, l'étrange : leur y est celui de la vallée)
{
  const _hurt = play.hurt.bind(play);
  play.hurt = function (dmg, src, cause) {
    if (souterrain.actif && src && !src.sout && typeof src.y === 'number' && Math.abs(src.y - game.player.pos[1]) > 8) return;
    return _hurt(dmg, src, cause);
  };
  const _pn = strange.placeName.bind(strange);
  strange.placeName = function (p) { if (souterrain.actif && p && p[1] < SOUT_TOP && souterrain.dansRegion(p[0], p[2])) return souterrain.nomLieu(p[0], p[2]); return _pn(p); };
}
// les habitants et les bêtes de la vallée ne « voient » pas le personnage à travers cent mètres de roche
{
  const _nu = npcs.update.bind(npcs);
  npcs.update = function (dt, w, c) { if (souterrain.actif) c = Object.assign({}, c, { px: -1e5, pz: -1e5, visible: () => false }); return _nu(dt, w, c); };
  const _eu = entities.update.bind(entities);
  entities.update = function (dt, w, c) { if (souterrain.actif && game.kind === 'farm') c = Object.assign({}, c, { px: -1e5, pz: -1e5 }); return _eu(dt, w, c); };
  const _pp = entities.pushPlayer.bind(entities);
  entities.pushPlayer = function (p) { if (souterrain.actif) return; return _pp(p); };
  const _ed = entities.draw.bind(entities);
  entities.draw = function (buf, sbuf, cam, maxD, t, flags) { if (souterrain.actif && game.kind === 'farm') return; return _ed(buf, sbuf, cam, maxD, t, flags); };
  const _nd = npcs.draw.bind(npcs);
  npcs.draw = function (buf, sbuf, cam, t, maxD) { if (souterrain.actif) return; return _nd(buf, sbuf, cam, t, maxD); };
}
// les sons de la vallée se taisent (oiseaux, grillons) ; dessous, l'eau qui goutte
{
  const _su = sound.update.bind(sound);
  sound.update = function (dt, E) { if (souterrain.actif && game.kind === 'farm') E = Object.assign({}, E, { day: 0, night: 0, rain: 0, storm: 0, inside: true }); return _su(dt, E); };
}
// les objets posés de là-haut ne se dessinent pas dessous (et inversement : voir VER_SOUS)
{
  const _bp = play.buildProps.bind(play);
  play.buildProps = function (cam, sky) {
    const w = game.world;
    if (!souterrain.actif || !w) return _bp(cam, sky);
    const all = w.props;
    if (!souterrain._pr || souterrain._prN !== all.length || farm.dirtyProps) { souterrain._pr = all.filter((q) => q.y < SOUT_TOP + 8); souterrain._prN = all.length; }
    w.props = souterrain._pr;
    try { return _bp(cam, sky); } finally { w.props = all; }
  };
}
HOOKS.update.push((dt, eye, basis, sky, playing) => { if (farm.s) souterrain.update(dt, eye, basis, sky, playing); });
HOOKS.sky.push((sky) => { if (souterrain.actif) souterrain.ciel(sky); });
HOOKS.load.push((saved) => {
  souterrain.installer();
  souterrain.actif = false; souterrain.bon = null; souterrain._pr = null; souterrain.image = null;
  const w = game.world;
  if (w && (w.curVer & VER_SOUS)) w.curVer &= ~VER_SOUS;
  souterrain.S();
  // la vallée : sous elle, pas de toit (les maisons de là-haut ne couvrent pas les galeries)
  if (w && !w.__soutCov) {
    w.__soutCov = true;
    const _cov = w.covered.bind(w);
    w.covered = function (x, y, z) { if (y < SOUT_TOP && souterrain.dansRegion(x, z)) return false; return _cov(x, y, z); };
  }
  if (souterrain.dedans()) souterrain.basculer(true);
});

// ---------------------------------------------------------------- la génération : après tout le reste (passes des modules suivants)
{
  const _gv = generateValley;
  generateValley = async function (seed, progress, gen) {
    const w = await _gv(seed, progress, gen);
    if (w.designed && SOUT_GEN.length) {
      try {
        if (progress) progress('Sous la vallée…');
        const rnd = mulberry32(((seed | 0) ^ 0x50b7e77a) >>> 0), B = new Builder(w, rnd, new Uint8Array(w.W * w.W));
        for (const fn of SOUT_GEN) fn(w, rnd, B);
      } catch (e) { console.error('souterrain', e); }
    }
    return w;
  };
}
