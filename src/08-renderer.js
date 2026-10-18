// ============================================================================
//  RENDU : cycle jour/nuit, terrain par morceaux, sprites, herbe, eau, blocs
// ============================================================================

const CHUNK = 32;      // cellules par morceau de terrain
const RING = 3;        // morceaux de montagnes autour du monde
// une valeur d'objet pour la comparer (absente : une valeur que rien d'autre ne prend ; NaN ne s'égale pas lui-même)
const objNum = (v) => (v === undefined || v !== v ? -1e300 : +v);
const TEX_H = 0, TEX_M = 1, TEX_S = 2, TEX_A = 3, TEX_ATLAS = 4, TEX_SCENE = 5, TEX_C = 6, TEX_SKIN = 7, TEX_VM = 8;
// (rendu en HDR : profondeur de la scène, halo, rayons, ombres des nuages ; 14 : source des passes du halo, et unité
// libre pour créer les textures — 12 est celle du dessous, 11-zzzz9-souterrain0.js)
const TEX_DEPTH = 9, TEX_BLOOM = 10, TEX_RAYS = 11, TEX_NUAGES = 13, TEX_SRC = 14;
const MAX_LIGHTS = 12;
// L'Envers : les arbres sont morts, les fleurs ont disparu (null = masqué)
const ENVERS_SPRITES = {
  oak: ['deadtree0', 'deadtree1'], apple: ['deadtree1'], birch: ['deadtree0'], pine: ['deadtree1', 'deadtree0'], bush: ['bones0'], berry: ['bones0'],
  poppies: null, daisies: null, lavender: null, cornflower: null, sunflower: null, tallgrass: null, heather: null, mushroom: ['bones0'], herbs: null,
  giantoak: ['deadtree0'], lilypad: null,
};

// ---------------------------------------------------------------- ciel / lumière selon l'heure
const SKY_KEYS = [
  { e: -0.3, zen: [0.008, 0.012, 0.04], hor: [0.025, 0.04, 0.09], amb: [0.06, 0.075, 0.13], glow: [0, 0, 0] },
  { e: -0.12, zen: [0.035, 0.045, 0.13], hor: [0.17, 0.11, 0.19], amb: [0.09, 0.09, 0.15], glow: [0.22, 0.08, 0.04] },
  { e: 0.0, zen: [0.17, 0.24, 0.47], hor: [0.86, 0.47, 0.3], amb: [0.28, 0.24, 0.29], glow: [0.95, 0.45, 0.15] },
  { e: 0.12, zen: [0.25, 0.44, 0.78], hor: [0.86, 0.73, 0.56], amb: [0.4, 0.4, 0.42], glow: [0.6, 0.34, 0.12] },
  { e: 0.35, zen: [0.2, 0.45, 0.88], hor: [0.62, 0.8, 0.95], amb: [0.46, 0.5, 0.56], glow: [0.25, 0.2, 0.1] },
];
function skyKey(e, field) {
  const K = SKY_KEYS;
  if (e <= K[0].e) return K[0][field];
  for (let i = 0; i < K.length - 1; i++) {
    if (e <= K[i + 1].e) return v3.lerp(K[i][field], K[i + 1][field], smoothstep(K[i].e, K[i + 1].e, e));
  }
  return K[K.length - 1][field];
}

// wx = météo courante {cloud, rain, storm, flash, fog, frost, heat, red, envers} (0..1)
// fogMul : le réglage « Distance du brouillard » des Options (1 = normal ; 0,5 = deux fois plus près ; 2 = deux fois plus loin)
function computeSky(t, viewDist, wx, fogMul = 1) {
  wx = wx || {};
  const o = wx.cloud || 0, rain = wx.rain || 0, storm = wx.storm || 0, flash = wx.flash || 0;
  const fogK = wx.fog || 0, red = wx.red || 0, env = wx.envers || 0, heat = wx.heat || 0;
  const a = (t - 0.25) * TAU;
  const sunDir = v3.norm([Math.cos(a), Math.sin(a) * 0.9, Math.sin(a) * 0.42]);
  const b = a + Math.PI + 0.25;
  const moonDir = v3.norm([Math.cos(b), Math.sin(b) * 0.85, Math.sin(b) * 0.3 + 0.12]);
  const e = sunDir[1];
  const day = smoothstep(-0.04, 0.12, e);
  const night = smoothstep(0.05, -0.15, e);
  const sunK = smoothstep(-0.03, 0.1, e);
  const sunTint = v3.lerp([1.0, 0.5, 0.22], [1.05, 0.98, 0.9], smoothstep(0.0, 0.35, e));
  const gray = (c, k) => { const l = c[0] * 0.3 + c[1] * 0.55 + c[2] * 0.15; return v3.lerp(c, [l, l, l * 1.06], k); };
  const tintR = (c, k, tgt) => v3.lerp(c, v3.scale(tgt, c[0] * 0.3 + c[1] * 0.55 + c[2] * 0.15 + 0.02), k);
  const sunCol = v3.scale(sunTint, sunK * 0.95 * (1 - o * 0.8) * (1 + heat * 0.12) * (1 - env * 0.85));
  const moonTint = v3.lerp([1, 1, 1], [1.25, 0.28, 0.2], Math.max(red, env));
  let moonCol = v3.scale([0.13 * moonTint[0], 0.16 * moonTint[1], 0.25 * moonTint[2]], smoothstep(-0.05, 0.2, moonDir[1]) * night * (1 - o * 0.85) * (1 + red * 0.6));
  let zen = v3.scale(gray(skyKey(e, 'zen'), o * 0.85 + fogK * 0.6), 1 - o * 0.45 - storm * 0.2);
  let hor = v3.scale(gray(skyKey(e, 'hor'), o * 0.8 + fogK * 0.7), 1 - o * 0.35 - storm * 0.2);
  let amb = v3.scale(gray(skyKey(e, 'amb'), o * 0.5), 1 - o * 0.28 - storm * 0.18);
  const glow = v3.scale(skyKey(e, 'glow'), (1 - o * 0.9) * (1 - fogK * 0.7));
  if (heat) hor = v3.lerp(hor, [0.95, 0.82, 0.62], heat * 0.35 * day);
  if (red) {
    zen = tintR(zen, red * 0.9, [2.2, 0.35, 0.3]); hor = tintR(hor, red * 0.9, [2.8, 0.45, 0.35]);
    amb = v3.lerp(amb, v3.scale([1.4, 0.35, 0.3], amb[0] * 0.3 + amb[1] * 0.5 + amb[2] * 0.2), red * 0.8);
  }
  if (env) { zen = v3.lerp(zen, [0.05, 0.0, 0.0], env); hor = v3.lerp(hor, [0.22, 0.03, 0.02], env); amb = v3.lerp(amb, [0.2, 0.07, 0.06], env); moonCol = v3.lerp(moonCol, [0.35, 0.06, 0.04], env); }
  // brume matinale, brouillard
  const mist = Math.max(smoothstep(0.19, 0.24, t) * (1 - smoothstep(0.28, 0.36, t)), fogK * 0.8);
  let fogEnd = lerp(viewDist, viewDist * 0.55, night) * (1 - 0.5 * mist) * (1 - o * 0.2 - rain * 0.35);
  fogEnd = lerp(fogEnd, 46, fogK * 0.92);
  fogEnd = lerp(fogEnd, 85, env);
  let fogStart = fogEnd * lerp(0.3, 0.12, Math.max(night, mist, rain));
  // le brouillard plus près ou plus loin, sans jamais dépasser la distance de vue (au-delà, le bord du monde se verrait)
  if (fogMul !== 1) { fogEnd = Math.min(fogEnd * fogMul, viewDist); fogStart = Math.min(fogStart * fogMul, fogEnd * 0.92); }
  const light = e > -0.02 ? sunDir : moonDir;
  const k = 4 / Math.max(light[1], 0.22);
  const shadowOff = [light[0] * k, light[2] * k];
  const shadowK = (e > -0.02 ? 0.75 * smoothstep(-0.02, 0.15, e) : 0.3 * night) * (1 - o * 0.85);
  let cloudLit = v3.lerp(v3.lerp([0.12, 0.13, 0.2], [1.0, 0.66, 0.46], smoothstep(-0.15, 0.0, e)), [0.97, 0.97, 0.98], smoothstep(0.05, 0.3, e));
  cloudLit = v3.scale(gray(cloudLit, o * 0.6), 1 - o * 0.45 - storm * 0.25);
  if (red) cloudLit = tintR(cloudLit, red * 0.8, [2.2, 0.4, 0.35]);
  let cloudDark = v3.add(v3.scale(cloudLit, 0.62 - o * 0.12), v3.scale(zen, 0.2));
  if (flash > 0) { // éclair
    const f = [flash * 0.85, flash * 0.9, flash * 1.05];
    amb = v3.add(amb, f); zen = v3.add(zen, v3.scale(f, 0.45)); hor = v3.add(hor, v3.scale(f, 0.55));
    cloudLit = v3.add(cloudLit, f); cloudDark = v3.add(cloudDark, v3.scale(f, 0.8));
  }
  let haze = v3.scale(v3.lerp(hor, zen, 0.3), 0.86);
  if (fogK) haze = v3.lerp(haze, v3.scale([0.62, 0.64, 0.66], Math.max(0.08, amb[1] * 1.6)), fogK * 0.8);
  const sunDisk = v3.lerp([1.4, 0.7, 0.35], [1.6, 1.5, 1.25], smoothstep(0.0, 0.3, e));
  // rotation des étoiles autour de l'axe est-ouest
  const r = t * TAU, c = Math.cos(r), s = Math.sin(r);
  const starRot = new Float32Array([1, 0, 0, 0, c, s, 0, -s, c]);
  return {
    t, e, day, night, sunDir, moonDir, sunCol, moonCol, zen, hor, amb, glow,
    fog: [fogStart, fogEnd], mist, shadowOff, shadowK, cloudLit, cloudDark, haze, sunDisk, moonTint,
    stars: smoothstep(-0.02, -0.2, e) * (1 - o) * (1 - fogK) * (1 - env),
    sunVis: smoothstep(-0.06, 0.0, e + 0.03) * (1 - o * 0.92) * (1 - fogK * 0.8) * (1 - env),
    moonVis: lerp(0.3, 1.0, night) * (1 - o * 0.85) * (1 - fogK * 0.7),
    starRot, nightLit: e < 0.03 || o > 0.85 || fogK > 0.8 || env > 0.5 ? 1 : 0,
    cloudCover: o, wet: rain, wind: 1 + storm * 2.5 + o * 0.3, rain, storm, frost: (wx.frost || 0) * (1 - smoothstep(0.3, 0.42, t)),
  };
}

// Géométrie unitaire des formes de blocs (x,z ∈ [-0.5,0.5], y ∈ [0,1]) : [pos, normale] entrelacés
function shapeGeometry(sh) {
  const V = [], I = [];
  const nrm = (a, b, c) => {
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    return v3.norm([u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]);
  };
  const poly = (...p) => {
    const n = nrm(p[0], p[1], p[2]), o = V.length / 6;
    for (const q of p) V.push(q[0], q[1], q[2], n[0], n[1], n[2]);
    for (let i = 1; i + 1 < p.length; i++) I.push(o, o + i, o + i + 1);
  };
  const A = [-0.5, 0, -0.5], B = [0.5, 0, -0.5], Cc = [0.5, 0, 0.5], D = [-0.5, 0, 0.5];
  if (sh === 1) { // toit à deux pans, faîtage selon x
    const R0 = [-0.5, 1, 0], R1 = [0.5, 1, 0];
    poly(A, B, Cc, D); poly(A, R0, R1, B); poly(Cc, R1, R0, D); poly(D, R0, A); poly(B, R1, Cc);
  } else if (sh === 2) { // rampe montant vers +z
    const T0 = [-0.5, 1, 0.5], T1 = [0.5, 1, 0.5];
    poly(A, B, Cc, D); poly(A, T0, T1, B); poly(Cc, T1, T0, D); poly(D, T0, A); poly(B, T1, Cc);
  } else if (sh === 3) { // flèche (pyramide)
    const P = [0, 1, 0];
    poly(A, B, Cc, D); poly(A, P, B); poly(B, P, Cc); poly(Cc, P, D); poly(D, P, A);
  } else { // pavé
    const a2 = [-0.5, 1, -0.5], b2 = [0.5, 1, -0.5], c2 = [0.5, 1, 0.5], d2 = [-0.5, 1, 0.5];
    poly(A, B, Cc, D); poly(d2, c2, b2, a2); poly(A, a2, b2, B); poly(Cc, c2, d2, D); poly(D, d2, a2, A); poly(B, b2, c2, Cc);
  }
  return { v: V, i: I };
}

// Cube unitaire (centré) : position, normale, UV par face (vues de l'extérieur, sens trigonométrique)
function cubeGeometry() {
  const F = [
    [[0, 0, 1], [[-0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5]]],
    [[0, 0, -1], [[0.5, -0.5, -0.5], [-0.5, -0.5, -0.5], [-0.5, 0.5, -0.5], [0.5, 0.5, -0.5]]],
    [[1, 0, 0], [[0.5, -0.5, 0.5], [0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [0.5, 0.5, 0.5]]],
    [[-1, 0, 0], [[-0.5, -0.5, -0.5], [-0.5, -0.5, 0.5], [-0.5, 0.5, 0.5], [-0.5, 0.5, -0.5]]],
    [[0, 1, 0], [[-0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, -0.5], [-0.5, 0.5, -0.5]]],
    [[0, -1, 0], [[-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [-0.5, -0.5, 0.5]]],
  ];
  const UV = [[0, 0], [1, 0], [1, 1], [0, 1]], V = [], I = [];
  F.forEach(([n, c], f) => {
    c.forEach((p, k) => V.push(p[0], p[1], p[2], n[0], n[1], n[2], UV[k][0], UV[k][1]));
    I.push(f * 4, f * 4 + 1, f * 4 + 2, f * 4, f * 4 + 2, f * 4 + 3);
  });
  return { v: new Float32Array(V), i: new Uint16Array(I) };
}

// ---------------------------------------------------------------- la qualité des effets
// Choisie par l'utilisateur (Options : effets ou qualité graphique) ; sinon par la machine : la première fois, une
// machine sans vraie carte graphique (rendu logiciel, textures minuscules) prend la qualité Basse, les autres la
// Moyenne (jamais plus d'office) ; en jeu, si les images peinent vraiment, le garde-fou descend d'un cran
// (Renderer.garde)
function rendLogiciel() {
  try {
    const e = gl.getExtension('WEBGL_debug_renderer_info');
    return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(String(e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)));
  } catch (e) { return false; }
}
function effetsChoisis() { return typeof store !== 'undefined' && !!store.get('prairie.effetsAuto', null); }
function effetsMarquer() { if (typeof store !== 'undefined') store.set('prairie.effetsAuto', 1); }
// une machine faible : le préréglage Basse s'il n'y a pas encore de réglages à soi (sinon les effets seulement : la
// distance de vue, l'herbe… restent ceux du joueur)
function qualiteFaible() {
  if (typeof settings === 'undefined') return;
  let neuf = false;
  try { neuf = !store.get('prairie.settings', null); } catch (e) { /* rien */ }
  const P = typeof bureau !== 'undefined' && bureau.PRESETS ? bureau.PRESETS.basse : null;
  if (neuf && P) Object.assign(settings, P); else settings.effets = 0;
  try { store.set('prairie.settings', settings); } catch (e) { /* rien */ }
}
// (des zéros, pour les uniformes des effets quand ils sont éteints)
const REND_Z2 = new Float32Array(2), REND_Z3 = new Float32Array(3), REND_Z4 = new Float32Array(4);
// (et les autres valeurs par défaut des passes, faites une fois)
const REND_UN3 = new Float32Array([1, 1, 1]), REND_JAUNE = new Float32Array([1, 1, 0]), REND_NEIGE = new Float32Array([0.9, 0.92, 0.95]);
const REND_VM = { aspect: VM_W / VM_H, u0: 0, v0: 0, u1: 1, v1: 1 };
// les préréglages, du plus léger au plus riche (le garde-fou descend d'un cran)
const REND_PRESETS = ['basse', 'moyenne', 'haute', 'tres'];
// l'étalonnage (Renderer.ambiance) : teinte des ombres (G[0-2]) et des lumières (G[4-6]) vers une autre, de k
function gradeMix(G, o0, o1, o2, l0, l1, l2, k) {
  k = clamp(k, 0, 1);
  G[0] += (o0 - G[0]) * k; G[1] += (o1 - G[1]) * k; G[2] += (o2 - G[2]) * k;
  G[4] += (l0 - G[4]) * k; G[5] += (l1 - G[5]) * k; G[6] += (l2 - G[6]) * k;
}

// ---------------------------------------------------------------- moteur de rendu
const INT_UNIFORMS = new Set(['uN', 'uNumLights', 'uGridN', 'uCoverW']);

class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.target = null;
    this.res = [320, 200];
    this.scale = 4;
    this.pixelTarget = 270;
    this.world = null;
    this.view = new Float32Array(16);
    this.proj = new Float32Array(16);
    this.viewProj = new Float32Array(16);
    this.objCount = 0;
    this.blockCount = 0;
    this.stats = { chunks: 0 };
    // les programmes de chaque qualité (compilés une fois), ceux des nappes des cascades, les qualités refusées par la
    // carte, la compilation en cours (en douce) et ce qui reste à faire
    this.variantes = []; this.p18Var = []; this.echec = []; this.pre = null; this.preOrdre = null;
    // (préparés une fois : rien de neuf à chaque image)
    this.skyU = { uSunDisk: null, uSunVis: 0, uCloudLit: null, uCloudDark: null, uCloudCover: 0, uCloudT: 0 };
    this.gardeE = { t: 0, n: 0, s: 0, lent: 0, phase: 0, avant: 0, preset: '', repos: 0, off: false };
  }

  init() {
    const t0 = performance.now();
    // la qualité des effets (settings.effets : 0 Basse … 3 Très haute) ; une machine faible, sans choix enregistré :
    // Basse (rendu logiciel, sans vraie carte graphique ; ou des textures minuscules)
    this.logiciel = rendLogiciel();
    this.faible = this.logiciel || (gl.getParameter(gl.MAX_TEXTURE_SIZE) | 0) < 4096;
    if (this.faible && !effetsChoisis()) qualiteFaible();
    const q = typeof settings !== 'undefined' && settings.effets !== undefined ? settings.effets : 1;
    this.q = clamp(q | 0, 0, 3);
    GL_DEFINES = Renderer.defs(this.q);
    // (EXT_color_buffer_float : une image en virgule flottante ; sans elle, l'image HDR se replie en 8 bits)
    // (EXT_color_buffer_half_float suffit sur certaines cartes mobiles ; la complétude du tampon tranche de toute façon)
    this.hdrOk = !!(gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float'));
    glParallele(); // (demandée avant de compiler : la carte peut alors compiler plusieurs programmes à la fois)
    try { this.progs = this.variante(this.q); } catch (e) {
      if (!this.q) throw e;
      console.error('rendu : effets indisponibles sur cette carte, retour au rendu simple', e);
      this.echec[this.q] = true;
      this.q = 0; GL_DEFINES = ''; this.progs = this.variante(0);
    }
    this.compileMs = performance.now() - t0;
    // les autres qualités : plus tard, quand la machine ne fait rien
    this.precompiler();
    // textures communes
    gl.activeTexture(gl.TEXTURE0 + TEX_A);
    this.texArray = glTexArray(MATERIALS.map((m) => m.canvas), TS);
    gl.activeTexture(gl.TEXTURE0 + TEX_ATLAS);
    this.atlasTex = glTexFromCanvas(ATLAS.canvas, {});
    gl.activeTexture(gl.TEXTURE0 + TEX_SKIN);
    this.skinTex = glTexFromCanvas(SKIN.canvas, {});
    gl.activeTexture(gl.TEXTURE0 + TEX_VM);
    this.vmCanvas = document.createElement('canvas'); this.vmCanvas.width = 128; this.vmCanvas.height = 128;
    this.vmTex = glTexFromCanvas(this.vmCanvas, {});

    // maillage d'un morceau de terrain
    const V = CHUNK + 1, grid = new Float32Array(V * V * 2), idx = new Uint16Array(CHUNK * CHUNK * 6);
    for (let j = 0; j < V; j++) for (let i = 0; i < V; i++) { grid[(j * V + i) * 2] = i; grid[(j * V + i) * 2 + 1] = j; }
    let k = 0;
    for (let j = 0; j < CHUNK; j++) for (let i = 0; i < CHUNK; i++) {
      const a = j * V + i, b = a + 1, c = a + V, d = c + 1;
      idx[k++] = a; idx[k++] = c; idx[k++] = b; idx[k++] = b; idx[k++] = c; idx[k++] = d;
    }
    this.terrainVAO = gl.createVertexArray();
    gl.bindVertexArray(this.terrainVAO);
    glBuffer(gl.ARRAY_BUFFER, grid);
    glAttrib(0, 2, 8, 0, 0);
    this.chunkInstBuf = glBuffer(gl.ARRAY_BUFFER, new Float32Array(2 * 4096), gl.DYNAMIC_DRAW);
    glAttrib(1, 2, 8, 0, 1);
    glBuffer(gl.ELEMENT_ARRAY_BUFFER, idx);
    this.chunkIndexCount = idx.length;

    // quad des sprites
    const quad = new Float32Array([-0.5, 0, 0.5, 0, -0.5, 1, 0.5, 1]);
    this.spriteVAO = gl.createVertexArray();
    gl.bindVertexArray(this.spriteVAO);
    glBuffer(gl.ARRAY_BUFFER, quad);
    glAttrib(0, 2, 8, 0, 0);
    this.objBuf = glBuffer(gl.ARRAY_BUFFER, new Float32Array(13), gl.DYNAMIC_DRAW);
    const st = 13 * 4;
    glAttrib(1, 3, st, 0, 1); glAttrib(2, 2, st, 12, 1); glAttrib(3, 4, st, 20, 1); glAttrib(4, 4, st, 36, 1);

    this.grassVAO = gl.createVertexArray();
    gl.bindVertexArray(this.grassVAO);
    glBuffer(gl.ARRAY_BUFFER, quad);
    glAttrib(0, 2, 8, 0, 0);

    // créatures (sprites dynamiques, même format que les objets)
    this.entVAO = gl.createVertexArray();
    gl.bindVertexArray(this.entVAO);
    glBuffer(gl.ARRAY_BUFFER, quad);
    glAttrib(0, 2, 8, 0, 0);
    this.entBuf = glBuffer(gl.ARRAY_BUFFER, new Float32Array(2048 * 13), gl.DYNAMIC_DRAW);
    glAttrib(1, 3, st, 0, 1); glAttrib(2, 2, st, 12, 1); glAttrib(3, 4, st, 20, 1); glAttrib(4, 4, st, 36, 1);

    // blocs : une géométrie (et un tampon d'instances) par forme, plus une pour l'aperçu
    const mkShape = (sh) => {
      const g = shapeGeometry(sh), vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      glBuffer(gl.ARRAY_BUFFER, new Float32Array(g.v));
      glAttrib(0, 3, 24, 0, 0); glAttrib(1, 3, 24, 12, 0);
      const ib = glBuffer(gl.ARRAY_BUFFER, new Float32Array(8), gl.DYNAMIC_DRAW);
      glAttrib(2, 3, 32, 0, 1); glAttrib(3, 3, 32, 12, 1); glAttrib(4, 2, 32, 24, 1);
      glBuffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(g.i));
      return { vao, ib, idx: g.i.length, n: 0 };
    };
    this.shapes = SHAPES.map((_, sh) => mkShape(sh));
    this.ghosts = SHAPES.map((_, sh) => mkShape(sh));

    // modèles 3D : cube instancié (objets posés, créatures, ombres)
    const cube = cubeGeometry();
    const mkModel = () => {
      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      glBuffer(gl.ARRAY_BUFFER, cube.v);
      glAttrib(0, 3, 32, 0, 0); glAttrib(1, 3, 32, 12, 0); glAttrib(2, 2, 32, 24, 0);
      const ib = glBuffer(gl.ARRAY_BUFFER, new Float32Array(16), gl.DYNAMIC_DRAW);
      glAttrib(3, 4, 64, 0, 1); glAttrib(4, 4, 64, 16, 1); glAttrib(5, 4, 64, 32, 1); glAttrib(6, 4, 64, 48, 1);
      glBuffer(gl.ELEMENT_ARRAY_BUFFER, cube.i);
      return { vao, ib, n: 0, ver: -1 };
    };
    this.mProps = mkModel(); this.mDyn = mkModel(); this.mShadow = mkModel();

    // particules
    this.partData = new Float32Array(1024 * 8);
    this.partVAO = gl.createVertexArray();
    gl.bindVertexArray(this.partVAO);
    this.partBuf = glBuffer(gl.ARRAY_BUFFER, this.partData, gl.DYNAMIC_DRAW);
    glAttrib(0, 3, 32, 0, 0); glAttrib(1, 4, 32, 12, 0); glAttrib(2, 1, 32, 28, 0);

    this.emptyVAO = gl.createVertexArray();
    gl.bindVertexArray(null);

    // uniformes constants
    this.matInfo = new Float32Array(128);
    MATERIALS.forEach((m, i) => { this.matInfo[i * 2] = m.scale; this.matInfo[i * 2 + 1] = m.fit ? 1 : 0; });
    this.gUV = new Float32Array(48); this.gSize = new Float32Array(24);
    GRASS_VARIANTS.forEach(([id, h], i) => {
      const s = ATLAS.sprites[id];
      this.gUV.set([s.u0, s.v0, s.u1, s.v1], i * 4);
      this.gSize.set([h * s.aspect, h], i * 2);
    });
  }

  // ---------------------------------------------------------------- programmes (selon la qualité)
  // Chaque qualité a ses programmes, compilés une fois : celle du moment au démarrage, les autres ensuite, quand la
  // machine ne fait rien (precompiler) ; changer de qualité ne fait que prendre les siens (rien n'est recompilé en jeu).
  static defs(q) { return q ? '#define QUALITE ' + q + '\n' : ''; }
  static listeProgs(q) {
    const L = [
      ['terrain', SH.terrainVS, SH.terrainFS], ['sky', SH.fullVS, SH.skyFS], ['sprite', SH.spriteVS, SH.spriteFS], ['grass', SH.grassVS, SH.grassFS],
      ['water', SH.waterVS, SH.waterFS], ['block', SH.blockVS, SH.blockFS], ['model', SH.modelVS, SH.modelFS], ['part', SH.partVS, SH.partFS],
      ['flies', SH.fliesVS, SH.fliesFS], ['gun', SH.gunVS, SH.gunFS], ['post', SH.postVS, SH.postFS], ['rain', SH.rainVS, SH.rainFS], ['snow', SH.snowVS, SH.snowFS],
    ];
    // l'image en HDR, rendue à l'écran ; les ombres des nuages (Moyenne et plus) ; le halo et les rayons (Haute et plus)
    if (q >= 1) L.push(['resolve', SH.postVS, SH.resolveFS], ['nuages', SH.postVS, SH.nuagesFS]);
    if (q >= 2) L.push(['bloomDown', SH.postVS, SH.bloomDownFS], ['bloomUp', SH.postVS, SH.bloomUpFS], ['rays', SH.postVS, SH.raysFS]);
    return L;
  }
  // lancer tous les programmes d'une qualité, sans rien attendre (p18 : aussi l'eau des nappes des cascades, que les
  // cascades compilent elles-mêmes pour la qualité du démarrage)
  lancer(q, p18) {
    const d = Renderer.defs(q), L = Renderer.listeProgs(q).map(([n, vs, fs]) => glProgramLancer(vs, fs, n, d));
    if (p18 && typeof P18_EAU_FS !== 'undefined') L.push(glProgramLancer(P18_EAU_VS, P18_EAU_FS, 'p18eau', d));
    return { q, L, i: 0, progs: {} };
  }
  // finir le programme suivant d'une qualité lancée (il attend la carte s'il n'est pas prêt)
  finirUn(V) {
    const pr = glProgramFinir(V.L[V.i]);
    V.L[V.i++] = null;
    Renderer.lierUnites(pr);
    if (pr.name === 'p18eau') this.p18Var[V.q] = pr; else V.progs[pr.name] = pr;
    if (V.i >= V.L.length) { this.variantes[V.q] = V.progs; return true; }
    return false;
  }
  abandonner(V) {
    for (let i = V.i; i < V.L.length; i++) { const L = V.L[i]; if (L) { gl.deleteProgram(L.p); gl.deleteShader(L.v); gl.deleteShader(L.f); } }
    for (const k in V.progs) gl.deleteProgram(V.progs[k].p);
    this.echec[V.q] = true;
  }
  // les programmes d'une qualité : déjà là, ou finis tout de suite (ceux qu'on compilait en douce), ou compilés
  variante(q) {
    if (this.variantes[q]) return this.variantes[q];
    if (this.echec[q]) throw new Error('qualité ' + q + ' refusée par la carte');
    let V = this.pre;
    if (V && V.q === q) this.pre = null;
    else V = this.lancer(q, !!this.progs);
    try { while (!this.finirUn(V)); } catch (e) { this.abandonner(V); throw e; }
    return V.progs;
  }
  // les autres qualités, en douce (quand la machine ne fait rien, après le démarrage) : d'abord celles du dessous (le
  // garde-fou y descend), puis celles du dessus si la carte compile sans se faire attendre (KHR_parallel_shader_compile ;
  // pas sur une machine faible : on n'y montera pas). Avec l'extension, on ne prend que les programmes prêts ; sans, un
  // seul à chaque fois, et seulement quand la carte a eu le temps de les compiler (sinon on l'attendrait).
  precompiler() {
    if (this.preOrdre) return;
    const par = !!glParallele(), O = this.preOrdre = [];
    for (let k = this.q - 1; k >= 0; k--) O.push(k);
    if (!this.faible && par) for (let k = this.q + 1; k <= 3; k++) O.push(k);
    if (!O.length) return;
    const attendre = (f) => { if (typeof requestIdleCallback === 'function') requestIdleCallback(f, { timeout: 4000 }); else setTimeout(f, 400); };
    const pas = (dl) => {
      try {
        if (!this.pre) {
          while (O.length && (this.variantes[O[0]] || this.echec[O[0]])) O.shift();
          if (!O.length) return;
          this.pre = this.lancer(O.shift(), true); this.preT = performance.now();
        } else if (par || performance.now() - this.preT > 4000) {
          const V = this.pre;
          do {
            if (par && !glProgramPret(V.L[V.i])) break;
            if (this.finirUn(V)) { this.pre = null; break; }
          } while (par && dl && dl.timeRemaining() > 3);
        }
      } catch (e) { if (this.pre) { this.abandonner(this.pre); this.pre = null; } }
      attendre(pas);
    };
    setTimeout(() => attendre(pas), 2500);
  }
  // (fini ? pour les mesures)
  precompileFini() { return !this.pre && (!this.preOrdre || this.preOrdre.every((k) => this.variantes[k] || this.echec[k])); }
  // les unités de texture de chaque programme (fixes : les textures restent attachées à leur unité)
  static lierUnites(pr) {
    gl.useProgram(pr.p);
    const set = (n, v) => { if (pr.u[n]) gl.uniform1i(pr.u[n], v); };
    set('uHeight', TEX_H); set('uMat', TEX_M); set('uShade', TEX_S); set('uTex', TEX_A); set('uAtlas', TEX_ATLAS); set('uScene', TEX_SCENE); set('uCover', TEX_C);
    set('uSkin', TEX_SKIN); set('uVM', TEX_VM); set('uDepth', TEX_DEPTH); set('uBloom', TEX_BLOOM); set('uRays', TEX_RAYS); set('uNuages', TEX_NUAGES); set('uSrc', TEX_SRC);
  }
  // changer la qualité des effets : on prend ses programmes (et ceux des nappes des cascades, tirées de l'eau du jeu)
  qualite(q) {
    q = clamp(q | 0, 0, 3);
    if (q === this.q || !this.progs || this.echec[q]) return;
    let P;
    try { P = this.variante(q); } catch (e) { console.error('rendu : qualité ' + q + ' indisponible', e); return; }
    const q0 = this.q;
    this.q = q; this.progs = P; GL_DEFINES = Renderer.defs(q);
    try {
      if (typeof p18Rendu !== 'undefined' && p18Rendu.prog) {
        if (!this.p18Var[q0]) this.p18Var[q0] = p18Rendu.prog;
        else if (this.p18Var[q0] !== p18Rendu.prog) gl.deleteProgram(p18Rendu.prog.p); // (un doublon : les cascades l'ont compilé elles-mêmes)
        if (!this.p18Var[q]) { const p = glProgram(P18_EAU_VS, P18_EAU_FS, 'p18eau', Renderer.defs(q)); Renderer.lierUnites(p); this.p18Var[q] = p; }
        p18Rendu.prog = this.p18Var[q];
      }
    } catch (e) { console.error('rendu : nappes des cascades', e); }
    this.libererCibles();
    this.amb19 = null;
  }
  libererCibles() {
    for (const k of ['target', 'ldr', 'rays']) { if (this[k]) glDeleteTarget(this[k]); this[k] = null; }
    if (this.bloom) for (const t of this.bloom) glDeleteTarget(t);
    this.bloom = null; this.cibleCle = ''; this.uR = null;
  }

  // ---------------------------------------------------------------- monde
  setWorld(w) {
    this.world = w;
    const W = w.W;
    for (const t of [this.hTex, this.mTex, this.sTex]) if (t) gl.deleteTexture(t);
    gl.activeTexture(gl.TEXTURE0 + TEX_H);
    this.hTex = glDataTex(W, W, 'R32F', w.heights, false);
    gl.activeTexture(gl.TEXTURE0 + TEX_M);
    this.mTex = glDataTex(W, W, 'R8', w.mats, false);
    w.computeShade();
    gl.activeTexture(gl.TEXTURE0 + TEX_S);
    this.sTex = glDataTex(W, W, 'R8', w.shade, true);
    if (this.cTex) gl.deleteTexture(this.cTex);
    w.computeCover();
    gl.activeTexture(gl.TEXTURE0 + TEX_C);
    this.cTex = glDataTex(w.coverW, w.coverW, 'R32F', w.cover, false);
    w.dirtyHeights = null; w.dirtyMats = null;
    w.objectsDirty = true; w.blocksDirty = true;
    // morceaux
    const nc = Math.ceil(w.N / CHUNK);
    this.chunks = [];
    for (let cz = -RING; cz < nc + RING; cz++) for (let cx = -RING; cx < nc + RING; cx++) {
      this.chunks.push({ cx, cz, x: cx * CHUNK, z: cz * CHUNK, inside: cx >= 0 && cz >= 0 && cx < nc && cz < nc, minH: 0, maxH: 0 });
    }
    this.nc = nc;
    this.updateChunkBounds(0, 0, w.N, w.N);
  }

  updateChunkBounds(i0, j0, i1, j1) {
    const w = this.world;
    let gmin = Infinity, gmax = -Infinity;
    for (let k = 0; k < w.heights.length; k += 7) { const h = w.heights[k]; if (h < gmin) gmin = h; if (h > gmax) gmax = h; }
    for (const c of this.chunks) {
      if (!c.inside) {
        const d = Math.max(-c.x - CHUNK, c.x - w.N, -c.z - CHUNK, c.z - w.N, 0) + CHUNK;
        c.minH = gmin - 5; c.maxH = gmax + d * w.cell * 0.8 + d * d * 0.004 * w.cell + 10;
        continue;
      }
      if (c.x > i1 || c.z > j1 || c.x + CHUNK < i0 || c.z + CHUNK < j0) continue;
      let mn = Infinity, mx = -Infinity;
      for (let j = c.z; j <= Math.min(w.N, c.z + CHUNK); j++) for (let i = c.x; i <= Math.min(w.N, c.x + CHUNK); i++) {
        const h = w.heights[j * w.W + i];
        if (h < mn) mn = h; if (h > mx) mx = h;
      }
      c.minH = mn; c.maxH = mx;
    }
  }

  syncWorld() {
    const w = this.world;
    if (w.dirtyHeights) {
      const [i0, j0, i1, j1] = w.dirtyHeights;
      // le relief a bougé : la hauteur des objets de cette zone est à revoir (patchObjects)
      const c = w.cell, z0 = [i0 * c - c, j0 * c - c, i1 * c + c, j1 * c + c], H = this.objHReg;
      this.objHReg = H ? [Math.min(H[0], z0[0]), Math.min(H[1], z0[1]), Math.max(H[2], z0[2]), Math.max(H[3], z0[3])] : z0;
      gl.activeTexture(gl.TEXTURE0 + TEX_H);
      glDataTexRegion(this.hTex, w.W, 'R32F', w.heights, i0, j0, i1, j1);
      this.updateChunkBounds(i0, j0, i1, j1);
      w.dirtyHeights = null;
    }
    if (w.dirtyMats) {
      const [i0, j0, i1, j1] = w.dirtyMats;
      gl.activeTexture(gl.TEXTURE0 + TEX_M);
      glDataTexRegion(this.mTex, w.W, 'R8', w.mats, i0, j0, i1, j1);
      w.dirtyMats = null;
    }
    if (w.shadeDirty) {
      const [i0, j0, i1, j1] = w.computeShade(w.shadeRegion);
      w.shadeRegion = null;
      gl.activeTexture(gl.TEXTURE0 + TEX_S);
      glDataTexRegion(this.sTex, w.W, 'R8', w.shade, i0, j0, i1, j1);
    }
    if (w.coverDirty) this.uploadCover();
    if (w.objectsDirty) {
      if (!this.patchObjects()) this.buildObjects();
      w.collectLights(); w.objectsDirty = false; w.objVersion = (w.objVersion || 0) + 1;
      if (w._chg) w._chg.r.clear();
    } else if (w._chg && w._chg.r.size) {
      // quelques objets changés (w.objetChange) : eux seuls ; les lumières et les bêtes seulement s'ils en sont
      const L = [...w._chg.r], G = this.objSig;
      w._chg.r.clear();
      let lum = false, bete = false;
      for (const i of L) {
        const o = w.objects[i], t0 = G && i < G.n ? OBJ_TYPES[G.t[i]] : null, t1 = o ? OBJ_TYPES[o.t] : null;
        if ((t0 && t0.light) || (t1 && t1.light)) lum = true;
        if ((t0 && t0.animal) || (t1 && t1.animal) || !t0) bete = true;
      }
      if (!this.patchObjects(L)) { this.buildObjects(); lum = bete = true; }
      if (lum) w.collectLights();
      if (bete) w.objVersion = (w.objVersion || 0) + 1;
    }
    if (w.blocksDirty) { this.buildBlocks(); w.blocksDirty = false; }
  }

  // Tous les objets statiques sont préparés ici ; seuls ceux proches de la caméra sont envoyés au GPU
  buildObjects() {
    const w = this.world, N = w.objects.length, cap = N + 256 + (N >> 5);
    const data = new Float32Array(cap * 13), xz = new Float32Array(cap * 2);
    const env = w.sprMap || (w.envers ? ENVERS_SPRITES : null); // sprMap : autres mondes (bonbons, ténèbres)
    const slot = this.objSlot = new Int32Array(cap).fill(-1);
    this.objAll = data; this.objXZ = xz; this.objCap = cap;
    // ce qui a servi à préparer chaque objet : une cueillette ou une repousse ne refait que l'objet changé (patchObjects)
    const G = this.objSig = { objs: w.objects, n: N, env, live: new Uint8Array(cap), t: new Int32Array(cap), v: new Float64Array(cap), x: new Float64Array(cap), z: new Float64Array(cap), h: new Float64Array(cap), y: new Float64Array(cap), fx: new Float64Array(cap), f: new Float64Array(cap) };
    let n = 0;
    for (let oi = 0; oi < N; oi++) {
      const o = w.objects[oi];
      this.objSigSet(G, oi, o);
      if (this.objWrite(o, n, env)) { slot[oi] = n; n++; }
    }
    this.objTotal = n;
    this.objActive = new Float32Array(cap * 13);
    this.objHReg = null;
    this.activeCenter = null;
  }
  // un objet dans le tampon (case sl) ; false s'il ne se dessine pas (créature, disparu, absent de ce monde-ci)
  objWrite(o, sl, env) {
    const w = this.world, t = OBJ_TYPES[o.t];
    if (t.animal || !w.live(o)) return false; // les créatures sont dessinées à part
    let sid = t.spr[o.v % t.spr.length];
    if (env) { const m = env[t.id]; if (m === null) return false; if (m) sid = m[o.v % m.length]; }
    const data = this.objAll, xz = this.objXZ, s = ATLAS.sprites[sid];
    const y = w.objectY(o) - o.h * (o.y !== undefined ? 0 : t.sink);
    let k = sl * 13;
    xz[sl * 2] = o.x; xz[sl * 2 + 1] = o.z;
    data[k++] = o.x; data[k++] = y; data[k++] = o.z;
    data[k++] = o.h * s.aspect; data[k++] = o.h;
    data[k++] = s.u0; data[k++] = s.v0; data[k++] = s.u1; data[k++] = s.v1;
    data[k++] = t.sway; data[k++] = s.frames; data[k++] = (t.flags || 0) | (o.fx || 0); data[k++] = o.f;
    return true;
  }
  objSigSet(G, i, o) {
    G.live[i] = this.world.live(o) ? 1 : 0; G.t[i] = o.t; G.v[i] = objNum(o.v); G.x[i] = o.x; G.z[i] = o.z; G.h[i] = objNum(o.h);
    G.y[i] = objNum(o.y); G.fx[i] = o.fx || 0; G.f[i] = objNum(o.f);
  }
  // Mise à jour sans tout reconstruire : seuls les objets dont quelque chose a changé (disparu, revenu, déplacé,
  // changé de sorte ou de taille) sont refaits ; les nouveaux prennent une case libre au bout. false : il faut tout
  // reconstruire (liste remplacée ou raccourcie, relief changé, autre monde, plus de place).
  patchObjects(liste) {
    const w = this.world, G = this.objSig, objs = w.objects, N = objs.length;
    const env = w.sprMap || (w.envers ? ENVERS_SPRITES : null);
    if (!G || !this.objAll || G.objs !== objs || N < G.n || N > this.objCap || G.env !== env) return false;
    const H = this.objHReg;
    if (H) liste = null; // (le relief a changé quelque part : on regarde tout, et on refait les objets de la zone)
    const slot = this.objSlot, xz = this.objXZ, data = this.objAll;
    let n = this.objTotal, ch = 0;
    const L = liste ? liste.slice() : null;
    if (L) for (let i = G.n; i < N; i++) L.push(i); // (les objets ajoutés au bout)
    const nn = L ? L.length : N;
    for (let q = 0; q < nn; q++) {
      const i = L ? L[q] : q;
      if (i < 0 || i >= N) continue;
      const o = objs[i];
      if (i < G.n && G.live[i] === (w.live(o) ? 1 : 0) && G.t[i] === o.t && G.v[i] === objNum(o.v) && G.x[i] === o.x && G.z[i] === o.z && G.h[i] === objNum(o.h)
        && G.y[i] === objNum(o.y) && G.fx[i] === (o.fx || 0) && G.f[i] === objNum(o.f) && !(H && o.x >= H[0] && o.x <= H[2] && o.z >= H[1] && o.z <= H[3])) continue;
      ch++;
      this.objSigSet(G, i, o);
      const sl = slot[i];
      if (sl >= 0) {
        if (!this.objWrite(o, sl, env)) { data[sl * 13 + 3] = 0; data[sl * 13 + 4] = 0; xz[sl * 2] = 1e9; xz[sl * 2 + 1] = 1e9; } // caché (sa case reste)
      } else if (n < this.objCap && this.objWrite(o, n, env)) { slot[i] = n; n++; }
      else if (n >= this.objCap) return false;
    }
    G.n = N; this.objTotal = n; this.objHReg = null;
    if (ch) this.activeCenter = null;
    return true;
  }
  // marque d'un objet (8 : il brûle) sans tout reconstruire
  objFlag(i, fx) {
    const w = this.world, o = w.objects[i];
    if (!o) return;
    o.fx = fx;
    const sl = this.objSlot ? this.objSlot[i] : -1;
    if (sl < 0 || !this.objAll) return;
    this.objAll[sl * 13 + 11] = (OBJ_TYPES[o.t].flags || 0) | fx;
    this.activeCenter = null;
  }
  updateActiveObjects(cam, R) {
    const xz = this.objXZ, all = this.objAll, act = this.objActive, R2 = R * R;
    let n = 0;
    for (let i = 0; i < this.objTotal; i++) {
      const dx = xz[i * 2] - cam[0], dz = xz[i * 2 + 1] - cam[2];
      if (dx * dx + dz * dz > R2) continue;
      for (let j = i * 13, k = n * 13, e = j + 13; j < e; j++, k++) act[k] = all[j]; // (sans une vue neuve par objet)
      n++;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.objBuf);
    gl.bufferData(gl.ARRAY_BUFFER, act.subarray(0, Math.max(1, n) * 13), gl.DYNAMIC_DRAW);
    this.objCount = n;
    this.activeCenter = [cam[0], cam[2]];
  }

  buildBlocks() {
    const w = this.world;
    const vis = w.blocks.filter((b) => !b.hidden && (!b.ver || (b.ver & w.curVer)));
    this.blockCount = vis.length;
    this.shapes.forEach((S, sh) => {
      const list = vis.filter((b) => (b.sh | 0) === sh);
      const data = new Float32Array(Math.max(1, list.length) * 8);
      list.forEach((b, i) => data.set([b.x, b.y, b.z, b.sx, b.sy, b.sz, b.r, b.m], i * 8));
      gl.bindBuffer(gl.ARRAY_BUFFER, S.ib);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
      S.n = list.length;
    });
  }

  uploadCover(cx, cz) {
    const w = this.world;
    w.computeCover(cx, cz);
    gl.activeTexture(gl.TEXTURE0 + TEX_C);
    glDataTexRegion(this.cTex, w.coverW, 'R32F', w.cover, 0, 0, w.coverW - 1, w.coverW - 1);
  }

  // ---------------------------------------------------------------- taille
  resize(pixelTarget) {
    this.pixelTarget = pixelTarget;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = Math.max(1, Math.floor(this.canvas.clientWidth * dpr)), H = Math.max(1, Math.floor(this.canvas.clientHeight * dpr));
    if (this.canvas.width !== W || this.canvas.height !== H) { this.canvas.width = W; this.canvas.height = H; }
    const scale = Math.max(1, Math.round(H / pixelTarget));
    const rw = Math.ceil(W / scale), rh = Math.ceil(H / scale);
    const cle = rw + 'x' + rh + ':' + this.q;
    if (!this.target || this.cibleCle !== cle) this.allouerCibles(rw, rh, cle);
    this.scale = scale;
    this.res = [rw, rh];
  }
  // les images intermédiaires : Basse, celle d'avant (8 bits) ; au-dessus, la scène en HDR (16 bits flottants, ou 8 bits
  // si la carte ne sait pas y dessiner) avec sa profondeur lisible, l'image rendue (8 bits, lissée : l'agrandissement
  // adoucit le bord de ses gros pixels), la chaîne du halo et les rayons (Haute et plus). Avec elles, les uniformes de
  // leurs passes (rien de neuf à chaque image) et ce qu'elles pèsent (memCibles, en octets)
  allouerCibles(rw, rh, cle) {
    this.libererCibles();
    this.cibleCle = cle;
    if (!this.q) { gl.activeTexture(gl.TEXTURE0 + TEX_SCENE); this.target = glTarget(rw, rh); this.hdr = false; this.memCibles = rw * rh * 8; return; }
    gl.activeTexture(gl.TEXTURE0 + TEX_SRC);
    for (const fmt of this.hdrOk ? ['RGBA16F', 'RGBA8'] : ['RGBA8']) {
      const t = glTargetEx(rw, rh, { fmt, linear: true, depth: 'tex' });
      if (t.ok) { this.target = t; break; }
      glDeleteTarget(t);
    }
    if (!this.target) this.target = glTargetEx(rw, rh, { fmt: 'RGBA8', linear: true, depth: 'rb' });
    this.hdr = this.target.fmt !== 'RGBA8';
    this.ldr = glTargetEx(rw, rh, { fmt: 'RGBA8', linear: true });
    let mem = rw * rh * ((this.hdr ? 8 : 4) + 4 + 4);
    const f = (...a) => new Float32Array(a);
    const R = this.uR = {
      res: { uRes: f(rw, rh), uExpo: 1, uGradeA: f(1, 1, 1, 1), uGradeB: f(1, 1, 1, 1), uGradeC: f(0, 0, 0, 0), uPostK: f(0, 0, 0, 0), uRaysCol: f(0, 0, 0), uNearFar: f(0.06, 300), uGlare: f(0, 0, 0, 0), uGlareCol: f(0, 0, 0) },
      down: [], up: [], rays: null,
    };
    if (this.q >= 2) {
      const bf = this.hdr ? 'RGBA16F' : 'RGBA8';
      this.bloom = [];
      let w = rw, h = rh, src = this.target;
      for (let i = 0; i < (this.q >= 3 ? 5 : 4); i++) {
        w = Math.max(2, w >> 1); h = Math.max(2, h >> 1);
        const b = glTargetEx(w, h, { fmt: bf, linear: true });
        this.bloom.push(b);
        mem += w * h * (this.hdr ? 8 : 4);
        // (seuil doux au premier pas : au-dessus du blanc en HDR ; en 8 bits, les très clairs seulement)
        R.down.push({ uTexel: f(1 / src.w, 1 / src.h), uDstRes: f(w, h), uSeuil: f(this.hdr ? 1.05 : 0.88, this.hdr ? 0.45 : 0.12, i === 0 ? 1 : 0) });
        src = b;
      }
      for (let i = 1; i < this.bloom.length; i++) { const s = this.bloom[i], d = this.bloom[i - 1]; R.up[i] = { uTexel: f(1 / s.w, 1 / s.h), uDstRes: f(d.w, d.h), uK: 1 }; }
      // les rayons : au quart de l'image en Haute, à la moitié en Très haute (des rayons, c'est flou : ça ne se voit pas)
      const k = this.q >= 3 ? 1 : 2;
      this.rays = glTargetEx(Math.max(2, rw >> k), Math.max(2, rh >> k), { fmt: 'RGBA8', linear: true });
      mem += this.rays.w * this.rays.h * 4;
      R.rays = { uDstRes: f(this.rays.w, this.rays.h), uSunUV: f(0, 0, 1) };
    }
    this.memCibles = mem;
  }

  // ---------------------------------------------------------------- uniformes
  // (le programme pris par use() garde la dernière valeur envoyée de chaque uniforme : une valeur qui n'a pas changé —
  // à la précision de la carte — n'est pas renvoyée ; un programme pris autrement, par gl.useProgram, envoie tout)
  setU(pr, name, v) {
    const loc = pr.u[name];
    if (loc === undefined || loc === null) return;
    const C = this._lie === pr ? pr.cv || (pr.cv = new Map()) : null;
    if (typeof v === 'number') {
      if (C) { if (C.get(name) === v) return; C.set(name, v); }
      if (INT_UNIFORMS.has(name)) gl.uniform1i(loc, v); else gl.uniform1f(loc, v);
      return;
    }
    let f;
    switch (name) {
      case 'uViewProj': f = 0; break;
      case 'uStarRot': f = 1; break;
      case 'uLights': case 'uGUV': f = 4; break;
      case 'uLightCols': f = 3; break;
      case 'uGSize': case 'uMatInfo': f = 2; break;
      default: f = v.length; if (f !== 2 && f !== 3 && f !== 4) return;
    }
    if (C) {
      const n = v.length;
      let c = C.get(name);
      if (c && typeof c !== 'number' && c.length === n) {
        let i = 0;
        while (i < n && c[i] === Math.fround(v[i])) i++;
        if (i === n) return;
      } else { c = new Float32Array(n); C.set(name, c); }
      c.set(v);
    }
    switch (f) {
      case 0: gl.uniformMatrix4fv(loc, false, v); return;
      case 1: gl.uniformMatrix3fv(loc, false, v); return;
      case 2: gl.uniform2fv(loc, v); return;
      case 3: gl.uniform3fv(loc, v); return;
      case 4: gl.uniform4fv(loc, v);
    }
  }
  use(pr, U) {
    gl.useProgram(pr.p);
    this._lie = pr;
    for (const k in U) this.setU(pr, k, U[k]);
  }

  // ---------------------------------------------------------------- image
  render(F) {
    const w = this.world, sky = F.sky, cam = F.cam;
    if (!this.target) this.resize(this.pixelTarget || 270); // (la qualité vient de changer : les images sont à refaire)
    this.syncWorld();
    // fenêtre de la carte des abris et objets actifs : suivent la caméra
    if (!w.coverO || Math.hypot(cam.pos[0] - (w.coverO[0] + 128), cam.pos[2] - (w.coverO[1] + 128)) > 64) this.uploadCover(cam.pos[0], cam.pos[2]);
    // (le rayon suit le brouillard, qui bouge un peu à chaque image : on garde une marge, sinon on refaisait la liste
    // de tous les objets du monde à chaque image)
    const activeR = sky.fog[1] + 90;
    if (!this.activeCenter || Math.hypot(cam.pos[0] - this.activeCenter[0], cam.pos[2] - this.activeCenter[1]) > 40 || !(activeR <= this.activeR) || activeR < this.activeR - 30) {
      this.activeR = activeR + 12;
      this.updateActiveObjects(cam.pos, this.activeR);
    }
    const [rw, rh] = this.res;
    const aspect = rw / rh;
    const fovY = Math.min(2 * Math.atan(Math.tan(cam.fovX / 2) / aspect), cam.fovX * 0.95);
    const far = sky.fog[1] + 80;
    mat4Perspective(this.proj, fovY, aspect, 0.06, far);
    const basis = cameraBasis(cam.yaw, cam.pitch);
    mat4View(this.view, cam.pos, basis);
    mat4Mul(this.viewProj, this.proj, this.view);
    const tanY = Math.tan(fovY / 2), tanX = tanY * aspect;
    const pxScale = rh / (2 * tanY);

    // Moyenne et plus : lumière du ciel et du sol, brume, vent, ombres des nuages, éclair (voir ambiance ; ses uniformes
    // sont toujours les mêmes tableaux, et des zéros quand les effets sont éteints : les programmes de Basse les ignorent)
    const A = this.q >= 1 ? this.ambiance(F, sky, basis) : null, AU = A ? A.U : null;
    // (les objets d'uniformes de chaque passe sont gardés d'une image à l'autre : les mêmes clés, les valeurs de l'image)
    const U = this._U || (this._U = {});
    U.uViewProj = this.viewProj; U.uCamPos = cam.pos; U.uCamPosV = cam.pos; U.uCamFwd = basis.f; U.uCamRight = basis.r;
    U.uSunDir = sky.sunDir; U.uSunCol = sky.sunCol; U.uMoonDir = AU ? AU.uMoonDir : sky.moonDir; U.uMoonCol = AU ? AU.uMoonCol : sky.moonCol;
    U.uAmbient = sky.amb; U.uAmbientV = sky.amb; U.uZenith = sky.zen; U.uHorizon = sky.hor; U.uGlow = sky.glow; U.uHaze = AU ? AU.uHaze : sky.haze; U.uFog = sky.fog;
    U.uLights = F.lights.pos; U.uLightCols = F.lights.col; U.uNumLights = F.lights.n; U.uFlash = F.flash;
    U.uBands = F.bands; U.uTime = F.time; U.uTimeV = F.time; U.uShadowK = sky.shadowK; U.uShadowOff = sky.shadowOff;
    U.uN = w.N; U.uCell = w.cell; U.uWater = w.waterLevel; U.uWaterV = w.waterLevel; U.uNightLit = sky.nightLit;
    U.uWet = sky.wet; U.uWindV = sky.wind; U.uCoverW = w.coverW; U.uCoverO = w.coverO; U.uPowerV = F.power === undefined ? 1 : F.power; U.uFrost = sky.frost || 0;
    U.uAmbSky = AU ? AU.uAmbSky : REND_Z3; U.uAmbGround = AU ? AU.uAmbGround : REND_Z3; U.uMist = AU ? AU.uMist : REND_Z4; U.uSunGlowC = AU ? AU.uSunGlowC : REND_Z4;
    U.uSpec = AU ? AU.uSpec : 0; U.uWindD = AU ? AU.uWindD : REND_Z2; U.uNuagesO = AU ? AU.uNuagesO : REND_Z4;
    const PU = this._pu || (this._pu = { tan: new Float32Array(2), rect: new Float32Array(4), res: new Float32Array(2) });
    const passe = (nom, a, b) => { const o = PU[nom] || (PU[nom] = {}); Object.assign(o, a); if (b) Object.assign(o, b); return o; };
    // les nuages du ciel (aussi pour l'eau, qui les reflète)
    const skyU = this.skyU;
    skyU.uSunDisk = sky.sunDisk; skyU.uSunVis = sky.sunVis; skyU.uCloudLit = sky.cloudLit; skyU.uCloudDark = sky.cloudDark;
    skyU.uCloudCover = sky.cloudCover; skyU.uCloudT = F.cloudT ?? F.time;
    if (A) this.passeNuages(A);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.target.fb);
    gl.viewport(0, 0, rw, rh);
    gl.clear(gl.DEPTH_BUFFER_BIT);

    // ciel
    gl.disable(gl.DEPTH_TEST); gl.depthMask(false); gl.disable(gl.BLEND); gl.disable(gl.CULL_FACE);
    { const o = passe('sky', U, skyU);
      PU.tan[0] = tanX; PU.tan[1] = tanY;
      o.uCamR = basis.r; o.uCamU = basis.u; o.uTan = PU.tan; o.uStars = sky.stars; o.uPixAng = 2 * tanY / rh; o.uStarRot = sky.starRot;
      o.uMoonVis = sky.moonVis; o.uMoonTint = sky.moonTint || REND_UN3; o.uMoon2 = F.moon2 || 0; o.uMoonDir = sky.moonDir; o.uMoonCol = sky.moonCol;
      this.use(this.progs.sky, o); }
    gl.bindVertexArray(this.emptyVAO);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.enable(gl.DEPTH_TEST); gl.depthMask(true); gl.depthFunc(gl.LEQUAL);

    // terrain
    gl.enable(gl.CULL_FACE);
    const vis = this.visibleChunks(cam.pos, basis, tanX, tanY, far);
    { const o = passe('terrain', U); o.uBrush = F.brush || REND_Z4; o.uBrushCol = F.brushCol || REND_JAUNE; this.use(this.progs.terrain, o); }
    gl.bindVertexArray(this.terrainVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.chunkInstBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, vis.data, 0, vis.n * 2);
    gl.drawElementsInstanced(gl.TRIANGLES, this.chunkIndexCount, gl.UNSIGNED_SHORT, 0, vis.n);
    this.stats.chunks = vis.n;

    // blocs (une passe par forme)
    if (this.blockCount) {
      const o = passe('block', U); o.uMatInfo = this.matInfo; o.uGhost = REND_Z4;
      this.use(this.progs.block, o);
      for (let k = 0; k < this.shapes.length; k++) {
        const S = this.shapes[k];
        if (!S.n) continue;
        gl.bindVertexArray(S.vao);
        gl.drawElementsInstanced(gl.TRIANGLES, S.idx, gl.UNSIGNED_SHORT, 0, S.n);
      }
    }

    // modèles 3D (objets posés puis créatures, portes, ponts)
    if ((F.props && F.props.n) || (F.dyn && F.dyn.n)) {
      const o = passe('model', U); o.uMatInfo = this.matInfo; o.uShadowPass = 0; o.uShadowA = 0;
      this.use(this.progs.model, o);
      this.dessinModele(this.mProps, F.props, false);
      this.dessinModele(this.mDyn, F.dyn, true);
    }
    gl.disable(gl.CULL_FACE);

    // objets
    if (this.objCount) {
      this.use(this.progs.sprite, U);
      gl.bindVertexArray(this.spriteVAO);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, this.objCount);
    }
    // créatures (animaux, villageois)
    if (F.ents && F.ents.n) {
      this.use(this.progs.sprite, U);
      gl.bindVertexArray(this.entVAO);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.entBuf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, F.ents.data, 0, F.ents.n * 13);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, F.ents.n);
    }

    // herbe
    if (F.grass) {
      const o = passe('grass', U); o.uGridN = F.grass.n; o.uSpacing = F.grass.spacing; o.uRadius = F.grass.radius; o.uGUV = this.gUV; o.uGSize = this.gSize;
      this.use(this.progs.grass, o);
      gl.bindVertexArray(this.grassVAO);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, F.grass.n * F.grass.n);
    }

    // eau
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);
    // ombres des créatures (disques sombres au sol)
    if (F.shadows && F.shadows.n) {
      gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(-2, -4);
      const o = passe('ombres', U); o.uMatInfo = this.matInfo; o.uShadowPass = 1; o.uShadowA = F.shadowA ?? 0.3;
      this.use(this.progs.model, o);
      this.dessinModele(this.mShadow, F.shadows, true);
      gl.disable(gl.POLYGON_OFFSET_FILL);
    }
    const S = w.size, m = 400;
    { const o = passe('water', U, skyU); PU.rect[0] = -m; PU.rect[1] = -m; PU.rect[2] = S + m; PU.rect[3] = S + m; o.uRect = PU.rect; this.use(this.progs.water, o); }
    gl.bindVertexArray(this.emptyVAO);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // particules
    if (F.particles && F.particles.n) {
      const o = passe('part', U); o.uPxScale = pxScale;
      this.use(this.progs.part, o);
      gl.bindVertexArray(this.partVAO);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.partBuf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, F.particles.data, 0, F.particles.n * 8);
      gl.drawArrays(gl.POINTS, 0, F.particles.n);
    }
    // papillons (jour) / lucioles (nuit) : ni les uns ni les autres sous la pluie ou la neige (ils s'en vont un à un
    // quand elle arrive, et reviennent de même)
    gl.bindVertexArray(this.emptyVAO);
    const fliesK = 1 - smoothstep(0.06, 0.4, Math.max(F.rain || 0, F.snow || 0));
    if (sky.day > 0.3 && fliesK > 0.01) {
      gl.disable(gl.BLEND); gl.depthMask(true);
      const o = passe('papillons', U); o.uMode = 1; o.uAmount = sky.day; o.uPxScale = pxScale;
      this.use(this.progs.flies, o);
      gl.drawArrays(gl.POINTS, 0, Math.round(110 * fliesK));
      gl.enable(gl.BLEND); gl.depthMask(false);
    }
    if (sky.night > 0.05 && fliesK > 0.01) {
      gl.blendFunc(gl.ONE, gl.ONE);
      const o = passe('lucioles', U); o.uMode = 0; o.uAmount = sky.night; o.uPxScale = pxScale;
      this.use(this.progs.flies, o);
      gl.drawArrays(gl.POINTS, 0, Math.round(380 * fliesK));
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }

    // pluie
    if (F.rain > 0.01) {
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      const o = passe('rain', U); o.uRainWind = F.rainWind; o.uRainCol = F.rainCol;
      this.use(this.progs.rain, o);
      gl.bindVertexArray(this.emptyVAO);
      gl.drawArrays(gl.LINES, 0, Math.floor(2600 * F.rain) * 2);
    }
    // neige
    if (F.snow > 0.01) {
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      const o = passe('snow', U); o.uRainWind = F.rainWind; o.uSnowCol = F.snowCol || REND_NEIGE; o.uPxScale = pxScale;
      this.use(this.progs.snow, o);
      gl.bindVertexArray(this.emptyVAO);
      gl.drawArrays(gl.POINTS, 0, Math.floor(3200 * Math.min(1, F.snow)));
    }

    // bloc fantôme (éditeur)
    if (F.ghost) {
      const b = F.ghost.b, G = this.ghosts[b.sh | 0];
      gl.bindBuffer(gl.ARRAY_BUFFER, G.ib);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([b.x, b.y, b.z, b.sx, b.sy, b.sz, b.r, b.m]), gl.DYNAMIC_DRAW);
      this.use(this.progs.block, Object.assign({}, U, { uMatInfo: this.matInfo, uGhost: F.ghost.col }));
      gl.bindVertexArray(G.vao);
      gl.drawElementsInstanced(gl.TRIANGLES, G.idx, gl.UNSIGNED_SHORT, 0, 1);
    }
    gl.depthMask(true);
    gl.disable(gl.BLEND);

    // arme
    // objet en main (à droite) et lanterne (main gauche)
    if (F.gunL) this.dessinMain(F.gunL, true, F, rw, rh);
    if (F.gun) this.dessinMain(F.gun, false, F, rw, rh);

    // Moyenne et plus : l'image HDR rendue (halo, rayons, flou des cinématiques, exposition, courbe, étalonnage)
    gl.disable(gl.DEPTH_TEST);
    let image = this.target.tex;
    if (A && this.ldr) { this.rendre(A, F, rw, rh); image = this.ldr.tex; }

    // post-traitement vers l'écran
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.activeTexture(gl.TEXTURE0 + TEX_SCENE);
    gl.bindTexture(gl.TEXTURE_2D, image);
    { const o = PU.post || (PU.post = {});
      PU.res[0] = rw; PU.res[1] = rh;
      o.uRes = PU.res; o.uScale = this.scale; o.uLevels = F.levels; o.uUnder = F.underwater ? 1 : 0; o.uTimeP = F.time;
      o.uGamma = F.gamma; o.uTint = F.tint || REND_Z4; o.uGlitch = F.glitch || REND_Z4; o.uSeed = F.seed || 0; o.uFx = F.fx || REND_Z4; o.uFx2 = F.fx2 || REND_Z4;
      o.uGrain = this.grain ? 0.075 : 0;
      this.use(this.progs.post, o); }
    gl.bindVertexArray(this.emptyVAO);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
    gl.enable(gl.DEPTH_TEST);
    this.lastBasis = basis; this.lastTan = [tanX, tanY];
    this._lie = null; // (hors de l'image, un programme se reprend toujours par use())
    this.garde();
  }

  // un tampon de modèles (cube instancié) : envoyé s'il a changé (toujours pour ceux qui changent à chaque image), dessiné
  dessinModele(M, buf, always) {
    if (!buf) return;
    if (always || M.ver !== buf.ver) { gl.bindBuffer(gl.ARRAY_BUFFER, M.ib); gl.bufferData(gl.ARRAY_BUFFER, buf.data.subarray(0, Math.max(1, buf.n) * 16), gl.DYNAMIC_DRAW); M.ver = buf.ver; M.n = buf.n; }
    if (!M.n) return;
    gl.bindVertexArray(M.vao);
    gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0, M.n);
  }
  // l'objet en main (à droite) ou la lanterne (main gauche)
  dessinMain(g, left, F, rw, rh) {
    gl.disable(gl.DEPTH_TEST);
    const vm = !!g.vm, s = vm ? REND_VM : ATLAS.sprites[g.spr];
    const unit = Math.min(rh, rw * 0.75);
    const hPx = unit * 0.54 * (g.scale || 1), wPx = hPx * s.aspect;
    const cx = left ? rw * 0.5 - unit * 0.52 + g.ox * unit : rw * 0.5 + unit * 0.17 + g.ox * unit, by = -unit * 0.03 + g.oy * unit;
    const x0 = cx - wPx / 2, x1 = cx + wPx / 2, y0 = by, y1 = by + hPx;
    const fw = s.u1 - s.u0, f = vm ? 0 : g.frame;
    if (vm && g.dirty) { gl.activeTexture(gl.TEXTURE0 + TEX_VM); gl.bindTexture(gl.TEXTURE_2D, this.vmTex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, g.canvas); g.dirty = false; }
    const H = this._mains || (this._mains = [0, 1].map(() => ({ uRect: new Float32Array(4), uUV: new Float32Array(4), uLight: null, uBandsG: 0, uTintG: null, uUseVM: 0 })));
    const o = H[left ? 0 : 1], R = o.uRect, V = o.uUV;
    R[0] = x0 / rw * 2 - 1; R[1] = y0 / rh * 2 - 1; R[2] = x1 / rw * 2 - 1; R[3] = y1 / rh * 2 - 1;
    V[0] = s.u0 + fw * f; V[1] = s.v0; V[2] = s.u1 + fw * f; V[3] = s.v1;
    o.uLight = g.light; o.uBandsG = F.bands; o.uTintG = g.tint || REND_UN3; o.uUseVM = vm ? 1 : 0;
    this.use(this.progs.gun, o);
    gl.bindVertexArray(this.emptyVAO);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.enable(gl.DEPTH_TEST);
  }

  // ---------------------------------------------------------------- ambiance (Moyenne et plus) : ce que l'image demande
  // à chaque instant, calculé une fois ici (pas une valeur de jeu : sky.amb, sky.sunCol… restent ceux du jeu) ; écrit
  // d'une image à l'autre dans les mêmes tableaux (rien de neuf à chaque image)
  static nouvelleAmbiance() {
    const f = (n) => new Float32Array(n);
    return {
      expo: 1, dof: 0, probeT: 0, enclos: 0, ferme: false, biome: '', pret: false, grade: f(9), G: new Float64Array(9),
      nuages: { ox: 0, oz: 0, T: 640, seuil: 0.5, k: 0, derive: f(2), age: 99, fait: false },
      U: { uAmbSky: f(3), uAmbGround: f(3), uMoonDir: f(3), uMoonCol: f(3), uHaze: f(3), uMist: f(4), uSunGlowC: f(4), uSpec: 1, uWindD: f(2), uNuagesO: f(4) },
    };
  }
  ambiance(F, sky, basis) {
    const now = performance.now(), dt = clamp(this.ambT ? (now - this.ambT) / 1000 : 0.016, 0, 0.25);
    this.ambT = now;
    const w = this.world, cam = F.cam.pos, q = this.q;
    const sous = typeof souterrain !== 'undefined' && !!souterrain.actif;
    const A = this.amb19 || (this.amb19 = Renderer.nouvelleAmbiance()), U = A.U, G = A.G;
    const amb = sky.amb, sun = sky.sunCol, zen = sky.zen, hor = sky.hor, mc = sky.moonCol;
    const e = sky.e === undefined ? 0.5 : sky.e, nuit = smoothstep(-0.1, -0.28, e);
    // la lumière du ciel (teintée par le ciel) et celle renvoyée par le sol (chaude, un peu du soleil ; le jour, assez
    // pour que les ombres ne soient pas dures ; la nuit reste noire)
    const s0 = zen[0] * 0.65 + hor[0] * 0.35, s1 = zen[1] * 0.65 + hor[1] * 0.35, s2 = zen[2] * 0.65 + hor[2] * 0.35;
    const sl = Math.max(s0 * 0.3 + s1 * 0.55 + s2 * 0.15, 1e-3);
    U.uAmbSky[0] = amb[0] * lerp(1, clamp(s0 / sl, 0.6, 1.5), 0.32);
    U.uAmbSky[1] = amb[1] * lerp(1, clamp(s1 / sl, 0.6, 1.5), 0.32);
    U.uAmbSky[2] = amb[2] * lerp(1, clamp(s2 / sl, 0.6, 1.5), 0.32);
    const kb = 1.15 - 0.15 * nuit;
    U.uAmbGround[0] = amb[0] * 0.36 * kb + sun[0] * 0.05; U.uAmbGround[1] = amb[1] * 0.33 * kb + sun[1] * 0.045; U.uAmbGround[2] = amb[2] * 0.25 * kb + sun[2] * 0.028;
    // l'œil : il s'habitue au noir d'une maison (lentement), à la lumière en sortant (vite) ; pas la nuit dehors
    // (le lieu se regarde cinq fois par seconde : l'abri autour de soi, le pays)
    if ((A.probeT -= dt) <= 0) {
      A.probeT = 0.2;
      let n = 0;
      if (!sous && w.covered(cam[0], cam[1], cam[2])) {
        n = 1;
        for (let k = 0; k < 8; k++) {
          const c = Math.cos(k * Math.PI / 4), s = Math.sin(k * Math.PI / 4);
          if (w.covered(cam[0] + c * 2.5, cam[1], cam[2] + s * 2.5)) n++;
          if (w.covered(cam[0] + c * 5, cam[1], cam[2] + s * 5)) n++;
        }
        n /= 17;
      }
      A.enclos = n;
      A.ferme = !sous && typeof game !== 'undefined' && !!game.biomeAt && game.kind === 'farm';
      A.biome = A.ferme ? game.biomeAt(cam) : '';
    }
    let cible = 1 + A.enclos * (0.22 + 0.58 * sky.day);
    if (sous) cible = 1.22;
    if (F.underwater) cible = 1.08;
    A.expo += (cible - A.expo) * (1 - Math.exp(-dt / (cible > A.expo ? 1.5 : 0.45)));
    // l'étalonnage : l'heure (aube et soir dorés, heure bleue, nuit froide et pâle), le temps, le lieu ; G : teinte des
    // ombres (0-2), saturation (3), teinte des lumières (4-6), contraste (7), relèvement des noirs (8). Doux : l'image
    // ne doit pas durcir le jeu (peu de contraste en plus, des noirs à peine relevés, sauf la nuit qui reste noire ; la
    // saturation compense ce que l'agrandissement lisse ôte aux couleurs)
    const W = typeof weather !== 'undefined' && weather.cur ? weather.cur : null;
    const wRain = W ? W.rain || 0 : 0, wCloud = W ? W.cloud || 0 : 0, wStorm = W ? W.storm || 0 : 0;
    const gold = smoothstep(0.34, 0.07, e) * smoothstep(-0.06, 0.03, e), bleu = smoothstep(0.04, -0.05, e) * smoothstep(-0.3, -0.1, e);
    let sat = 1.07, con = 1.02;
    G[0] = 0.97; G[1] = 0.99; G[2] = 1.04; G[4] = 1.03; G[5] = 1.01; G[6] = 0.97;
    gradeMix(G, 0.93, 0.96, 1.09, 1.1, 0.99, 0.85, gold); sat = lerp(sat, 1.13, gold); con = lerp(con, 1.05, gold);
    gradeMix(G, 0.9, 0.95, 1.13, 0.99, 0.96, 1.05, bleu); sat = lerp(sat, 0.95, bleu); con = lerp(con, 1.0, bleu);
    gradeMix(G, 0.88, 0.96, 1.16, 0.93, 0.98, 1.08, nuit); sat = lerp(sat, 0.74, nuit); con = lerp(con, 1.0, nuit);
    const gris = Math.max(wRain, clamp((wCloud - 0.55) * 2.2, 0, 1));
    sat *= 1 - 0.22 * gris; con -= 0.04 * gris;
    gradeMix(G, 0.98, 1.0, 1.03, 0.98, 1.0, 1.02, gris * 0.6);
    if (wStorm) { con += 0.03 * wStorm; gradeMix(G, G[0], G[1], G[2], 0.94, 0.98, 1.06, wStorm * 0.5); }
    let brume = sky.mist || 0;
    sat *= 1 - 0.12 * brume; con -= 0.04 * brume;
    // les nuits rouges et les nuits noires : une brume basse qui rampe au ras des prés (sa couleur est celle du ciel)
    // (et, les nuits claires, un voile léger dans les creux)
    const fx = F.fx || REND_Z4, fx2 = F.fx2 || REND_Z4;
    const noire = typeof evenements !== 'undefined' && evenements.noirK ? evenements.noirK : 0;
    if (!sous) brume = Math.max(brume, (fx[1] || 0) * 0.75, noire * 0.6, (sky.night || 0) * 0.3 * (1 - wRain));
    const b = A.biome;
    if (b === 'foret' || b === 'bouleaux') { G[0] *= 0.97; G[1] *= 1.03; G[2] *= 0.98; }
    else if (b === 'marais') { sat *= 0.88; G[1] *= 1.02; G[2] *= 0.95; }
    if (A.ferme && w.snowLine && cam[1] > w.snowLine - 25) { con += 0.02; G[0] *= 0.97; G[1] *= 0.99; G[2] *= 1.05; }
    if (sous) { sat = 0.88; con = 1.02; G[0] = 0.92; G[1] = 0.96; G[2] = 1.1; G[4] = 1.05; G[5] = 1.0; G[6] = 0.93; }
    if (typeof zone !== 'undefined' && zone.dedans) { sat *= 0.84; G[4] *= 1.02; G[5] *= 1.02; G[6] *= 0.93; }
    // nuits rouges, l'Envers, les autres mondes : leur couleur est la leur (l'étalonnage s'efface)
    const neutre = clamp(Math.max(fx[1], fx[3], fx2[0], fx2[1], fx2[2], fx2[3]) * 1.5, 0, 1);
    if (neutre > 0) { sat = lerp(sat, 1, neutre); con = lerp(con, 1, neutre); gradeMix(G, 1, 1, 1, 1, 1, 1, neutre); }
    G[3] = sat; G[7] = con;
    G[8] = 0.01 * (1 - nuit) * (1 - neutre) * (sous ? 0.5 : 1);
    const g = A.grade;
    if (!A.pret) { A.pret = true; for (let i = 0; i < 9; i++) g[i] = G[i]; }
    const kg = 1 - Math.exp(-dt / 1.8);
    for (let i = 0; i < 9; i++) g[i] += (G[i] - g[i]) * kg;
    // la brume des vallées, la perspective aérienne, le soleil dans la brume (la brume du matin est une brume claire :
    // elle prend la lumière)
    U.uSunGlowC[0] = sun[0] + mc[0] * 0.6; U.uSunGlowC[1] = sun[1] + mc[1] * 0.6; U.uSunGlowC[2] = sun[2] + mc[2] * 0.6; U.uSunGlowC[3] = 0.24 + 0.6 * brume;
    const hz = sky.haze, H = U.uHaze, bh = brume > 0 && !sous ? brume : 0;
    for (let i = 0; i < 3; i++) H[i] = hz[i] + (hz[i] * 0.12 + sun[i] * 0.07) * bh;
    U.uMist[0] = w.waterLevel + 1.5; U.uMist[1] = sous ? 0 : 0.026 * brume; U.uMist[2] = 1 / 9; U.uMist[3] = sous ? 0 : 1 / 700;
    U.uSpec = 1;
    // le vent (sa direction : celle de l'orage, sinon une brise qui tourne lentement)
    const wa = typeof weather !== 'undefined' && weather.windAngle !== undefined ? weather.windAngle : 0.6;
    U.uWindD[0] = Math.cos(wa); U.uWindD[1] = Math.sin(wa);
    // les ombres des nuages (pas sous terre, pas par ciel couvert : le soleil y est déjà voilé) ; la carte suit la
    // caméra par pas de 5 m (passeNuages)
    const o = sky.cloudCover || 0, N = A.nuages, ct = F.cloudT ?? F.time;
    N.k = sous ? 0 : 0.46 * smoothstep(0.02, 0.14, o) * (1 - smoothstep(0.74, 0.96, o)) * smoothstep(-0.02, 0.15, e);
    N.ox = Math.floor((cam[0] - N.T / 2) / 5) * 5; N.oz = Math.floor((cam[2] - N.T / 2) / 5) * 5;
    N.seuil = 0.56 - o * 0.34; N.derive[0] = ct * 0.019; N.derive[1] = ct * 0.0072;
    U.uNuagesO[3] = N.k;
    // l'éclair : une lumière blanche venue d'en haut, le temps d'un éclat (la lune est cachée par l'orage)
    const md = U.uMoonDir, mo = U.uMoonCol, sd = sky.moonDir;
    md[0] = sd[0]; md[1] = sd[1]; md[2] = sd[2]; mo[0] = mc[0]; mo[1] = mc[1]; mo[2] = mc[2];
    const fl = typeof weather !== 'undefined' && !sous ? weather.flash || 0 : 0;
    if (fl > 0.02 && F.rain > 0.05) {
      const x = Math.cos(wa + 1.3) * 0.4, z = Math.sin(wa + 1.3) * 0.4, l = Math.sqrt(x * x + 0.7225 + z * z);
      md[0] = x / l; md[1] = 0.85 / l; md[2] = z / l;
      mo[0] += 0.78 * fl * 0.7; mo[1] += 0.84 * fl * 0.7; mo[2] += fl * 0.7;
    }
    // le flou des cinématiques (Haute et plus), qui vient doucement
    const cineOn = typeof cine !== 'undefined' && cine.on;
    A.dof += ((cineOn && q >= 2 ? 1 : 0) - A.dof) * (1 - Math.exp(-dt / 0.5));
    return A;
  }
  // la carte des ombres de nuages autour de la caméra (128 × 128, 5 m par point) : refaite quand la caméra change de
  // case, sinon une image sur quatre (les nuages dérivent de quelques centimètres par image)
  passeNuages(A) {
    const N = A.nuages, U = A.U;
    if (!this.nuagesT) {
      gl.activeTexture(gl.TEXTURE0 + TEX_SRC);
      this.nuagesT = glTargetEx(128, 128, { fmt: 'RGBA8', linear: true });
      this.uNuagesPasse = { uDstRes: new Float32Array([128, 128]), uNuagesP: new Float32Array(4), uDerive: null };
    }
    gl.activeTexture(gl.TEXTURE0 + TEX_NUAGES);
    if (N.k <= 0) { N.fait = false; gl.bindTexture(gl.TEXTURE_2D, this.nuagesT.tex); return; }
    if (N.fait && ++N.age < 4 && U.uNuagesO[0] === N.ox && U.uNuagesO[1] === N.oz) { gl.bindTexture(gl.TEXTURE_2D, this.nuagesT.tex); return; }
    N.fait = true; N.age = 0;
    U.uNuagesO[0] = N.ox; U.uNuagesO[1] = N.oz; U.uNuagesO[2] = 1 / N.T;
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.nuagesT.fb);
    gl.viewport(0, 0, 128, 128);
    gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND); gl.disable(gl.CULL_FACE);
    const P = this.uNuagesPasse;
    P.uNuagesP[0] = N.ox; P.uNuagesP[1] = N.oz; P.uNuagesP[2] = N.T; P.uNuagesP[3] = N.seuil; P.uDerive = N.derive;
    this.use(this.progs.nuages, P);
    gl.bindVertexArray(this.emptyVAO);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindTexture(gl.TEXTURE_2D, this.nuagesT.tex);
  }
  // une passe plein écran vers une cible
  plein(pr, U, cible) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, cible ? cible.fb : null);
    gl.viewport(0, 0, cible.w, cible.h);
    this.use(pr, U);
    gl.bindVertexArray(this.emptyVAO);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  // de l'image HDR à l'image rendue (Moyenne et plus) ; les uniformes des passes sont ceux préparés avec les images
  rendre(A, F, rw, rh) {
    const sky = F.sky, q = this.q, T = this.target, R = this.uR, RU = R.res;
    gl.disable(gl.BLEND); gl.disable(gl.CULL_FACE); gl.depthMask(false);
    let bloomK = 0, raysK = 0;
    const depthOk = !!T.depthTex;
    // le soleil à l'écran : bas, dans le champ (ou juste à côté), pas sous un ciel couvert ni sous terre
    let soleil = 0, su = 0, sv = 0;
    const sd = sky.sunDir, VP = this.viewProj, sous = typeof souterrain !== 'undefined' && souterrain.actif;
    const cw = VP[3] * sd[0] + VP[7] * sd[1] + VP[11] * sd[2];
    if (depthOk && cw > 0.05 && !sous && sky.sunVis > 0.05) {
      su = (VP[0] * sd[0] + VP[4] * sd[1] + VP[8] * sd[2]) / cw * 0.5 + 0.5; sv = (VP[1] * sd[0] + VP[5] * sd[1] + VP[9] * sd[2]) / cw * 0.5 + 0.5;
      const dans = 1 - smoothstep(0.25, 0.75, Math.max(Math.abs(su - 0.5), Math.abs(sv - 0.5)) - 0.5);
      const e = sky.e === undefined ? 0.5 : sky.e;
      soleil = dans * sky.sunVis * (0.35 + 0.65 * smoothstep(0.45, 0.05, e)) * (1 - 0.85 * (sky.cloudCover || 0)) * (0.8 + 0.6 * (sky.mist || 0));
    }
    const s = sky.sunCol, sc0 = s[0] * 0.55 + 0.04, sc1 = s[1] * 0.5 + 0.035, sc2 = s[2] * 0.42 + 0.03;
    const Gl = RU.uGlare, Gc = RU.uGlareCol;
    Gl[2] = 0;
    if (q === 1 && soleil > 0.01) { Gl[0] = su; Gl[1] = sv; Gl[2] = soleil * 0.9; Gl[3] = rw / rh; Gc[0] = sc0; Gc[1] = sc1; Gc[2] = sc2; }
    if (q >= 2 && this.bloom) {
      // le halo : seuil doux, quatre ou cinq marches vers le bas, puis la remontée (ajoutée marche à marche)
      const B = this.bloom;
      gl.activeTexture(gl.TEXTURE0 + TEX_SRC);
      let src = T;
      for (let i = 0; i < B.length; i++) {
        gl.bindTexture(gl.TEXTURE_2D, src.tex);
        this.plein(this.progs.bloomDown, R.down[i], B[i]);
        src = B[i];
      }
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
      for (let i = B.length - 1; i > 0; i--) {
        gl.bindTexture(gl.TEXTURE_2D, B[i].tex);
        this.plein(this.progs.bloomUp, R.up[i], B[i - 1]);
      }
      gl.disable(gl.BLEND);
      bloomK = q >= 3 ? 0.075 : 0.065;
      // les rayons du soleil, à travers les feuillages et entre les toits
      if (this.rays && soleil > 0.01) {
        gl.activeTexture(gl.TEXTURE0 + TEX_DEPTH); gl.bindTexture(gl.TEXTURE_2D, T.depthTex);
        const ru = R.rays.uSunUV;
        ru[0] = su; ru[1] = sv; ru[2] = rw / rh;
        this.plein(this.progs.rays, R.rays, this.rays);
        raysK = soleil * (q >= 3 ? 0.5 : 0.42);
        RU.uRaysCol[0] = sc0; RU.uRaysCol[1] = sc1; RU.uRaysCol[2] = sc2;
      }
      gl.activeTexture(gl.TEXTURE0 + TEX_BLOOM); gl.bindTexture(gl.TEXTURE_2D, B[0].tex);
      gl.activeTexture(gl.TEXTURE0 + TEX_RAYS); gl.bindTexture(gl.TEXTURE_2D, raysK > 0 ? this.rays.tex : null);
    }
    if (depthOk) { gl.activeTexture(gl.TEXTURE0 + TEX_DEPTH); gl.bindTexture(gl.TEXTURE_2D, T.depthTex); }
    gl.activeTexture(gl.TEXTURE0 + TEX_SCENE); gl.bindTexture(gl.TEXTURE_2D, T.tex);
    const g = A.grade, GA = RU.uGradeA, GB = RU.uGradeB, K = RU.uPostK;
    RU.uExpo = A.expo;
    GA[0] = g[0]; GA[1] = g[1]; GA[2] = g[2]; GA[3] = g[3]; GB[0] = g[4]; GB[1] = g[5]; GB[2] = g[6]; GB[3] = g[7]; RU.uGradeC[0] = g[8];
    // halo, rayons, flou des cinématiques, anticrénelage (Haute et plus)
    K[0] = bloomK; K[1] = raysK; K[2] = depthOk && A.dof > 0.02 ? (q >= 3 ? 5 : 4) * A.dof : 0; K[3] = q >= 2 ? 1 : 0;
    RU.uNearFar[1] = sky.fog[1] + 80;
    this.plein(this.progs.resolve, RU, this.ldr);
    gl.depthMask(true);
  }

  // ---------------------------------------------------------------- le garde-fou : en jeu, si les images peinent
  // vraiment (plus de 25 ms en moyenne pendant quatre secondes, la plupart lentes), un cran de qualité en moins ; et
  // seulement si la qualité suit un préréglage que le joueur n'a pas choisi. Si cela n'aide pas (l'image est bridée
  // ailleurs : écran à 30 Hz, économie d'énergie, le processeur), on remet comme avant et l'on n'y touche plus.
  // Un mot seulement à qui a gardé tous les textes (« Moins de texte » éteint).
  // (une image de plus d'une seconde ne compte pas : une pause, un chargement ; celles d'un quart de seconde à une
  // seconde comptent — une machine qui ne fait que quatre images par seconde ou moins est justement celle à soulager)
  garde() {
    const G = this.gardeE;
    if (G.off) return;
    const now = performance.now(), d = G.t ? now - G.t : 0;
    G.t = now;
    if (d <= 0 || d > 1000 || now < G.repos || typeof game === 'undefined' || game.mode !== 'play' || game.sleeping || document.hidden || (typeof cine !== 'undefined' && cine.on)) return;
    G.n++; G.s += d; if (d > 25) G.lent++;
    if (G.s < 4000) return;
    const moy = G.s / G.n, lent = G.lent / G.n;
    G.n = 0; G.s = 0; G.lent = 0;
    if (G.phase === 1) {
      G.phase = 0;
      if (moy > G.avant * 0.88) { this.presetAuto(G.preset); G.off = true; return; }
    }
    if (moy <= 25 || lent < 0.5) return;
    if (typeof bureau === 'undefined' || !bureau.presetActuel || effetsChoisis()) { G.off = true; return; }
    const i = REND_PRESETS.indexOf(bureau.presetActuel());
    if (i <= 0) { G.off = true; return; } // réglages à soi, ou déjà Basse
    G.avant = moy; G.preset = REND_PRESETS[i]; G.phase = 1; G.repos = now + 2500;
    this.presetAuto(REND_PRESETS[i - 1]);
    try { if (typeof texte !== 'undefined' && !texte.actif() && typeof ui !== 'undefined' && ui.toast) ui.toast('Qualité graphique abaissée : la machine peinait.'); } catch (e) { /* rien */ }
  }
  // un préréglage posé par le garde-fou : enregistré, mais pas compté comme un choix du joueur
  presetAuto(k) {
    try { if (typeof bureau !== 'undefined' && bureau.appliquer) bureau.appliquer(k, true); } catch (e) { /* rien */ }
  }

  visibleChunks(pos, b, tanX, tanY, far) {
    if (!this.visData) this.visData = new Float32Array(this.chunks.length * 2);
    const cell = this.world.cell;
    const hx = Math.atan(tanX), hy = Math.atan(tanY);
    const planes = [
      v3.add(v3.scale(b.r, Math.cos(hx)), v3.scale(b.f, -Math.sin(hx))),
      v3.add(v3.scale(b.r, -Math.cos(hx)), v3.scale(b.f, -Math.sin(hx))),
      v3.add(v3.scale(b.u, Math.cos(hy)), v3.scale(b.f, -Math.sin(hy))),
      v3.add(v3.scale(b.u, -Math.cos(hy)), v3.scale(b.f, -Math.sin(hy))),
    ];
    let n = 0;
    const half = CHUNK * cell / 2, h2 = half * half * 2.0002;
    const [p0, p1, p2, p3] = planes;
    for (const c of this.chunks) {
      const cx = c.x * cell + half - pos[0], cz = c.z * cell + half - pos[2];
      const cy = (c.minH + c.maxH) / 2 - pos[1];
      const eh = (c.maxH - c.minH) / 2, r = Math.sqrt(h2 + eh * eh);
      // (Math.sqrt plutôt que Math.hypot : bien plus rapide, et c'est fait pour chaque morceau à chaque image)
      if (Math.sqrt(cx * cx + cy * cy + cz * cz) - r > far) continue;
      if (p0[0] * cx + p0[1] * cy + p0[2] * cz > r || p1[0] * cx + p1[1] * cy + p1[2] * cz > r || p2[0] * cx + p2[1] * cy + p2[2] * cz > r || p3[0] * cx + p3[1] * cy + p3[2] * cz > r) continue;
      this.visData[n * 2] = c.x; this.visData[n * 2 + 1] = c.z;
      n++;
    }
    return { data: this.visData, n };
  }

  // Rayon depuis un point de l'écran (coordonnées normalisées -1..1)
  screenRay(ndcX, ndcY) {
    const b = this.lastBasis, t = this.lastTan;
    if (!b) return null;
    return v3.norm([
      b.f[0] + b.r[0] * ndcX * t[0] + b.u[0] * ndcY * t[1],
      b.f[1] + b.r[1] * ndcX * t[0] + b.u[1] * ndcY * t[1],
      b.f[2] + b.r[2] * ndcX * t[0] + b.u[2] * ndcY * t[1],
    ]);
  }
}
