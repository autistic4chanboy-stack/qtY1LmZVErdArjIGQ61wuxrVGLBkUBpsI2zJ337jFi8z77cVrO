// ============================================================================
//  LES GOBELINS (agent X) : leurs modèles en boîtes (l'avant regarde +z)
//  Des gobelins des contes du XIXᵉ siècle : petits (un mètre, voûtés), maigres,
//  les bras trop longs, la tête trop grosse, le nez crochu, les oreilles en
//  pointe, la peau grise et verdâtre ; vêtus de ce qu'ils ont volé, trop grand
//  pour eux (un gilet, un manteau d'homme, un haut-de-forme cabossé, une chemise
//  de nuit d'enfant…). La nuit, leurs yeux renvoient la lumière.
//  - squelettes : ANIMAL_RIGS.x_gobelin (neuf habits, selon v), x_aieule (la
//    vieille, assise sur le grand tas) ; leur pose : gobPose (11-zzzzX-2-jeu.js
//    les dessine lui-même) ;
//  - objets posés : la vieille souche, la racine polie, le panneau, la pierre
//    griffée, les terriers, et tout le village (cahutes, tas, nids, étal,
//    chandelles, berceau, horloges sans aiguilles…).
//  Tuiles de l'atlas des peaux : 150 à 153 (registre de la vague 14).
// ============================================================================
Object.assign(TL, { gobPeau: 150, gobVisage: 151, gobHaillon: 152, gobVisageDort: 153 });

function gobTuiles(cv) {
  const ctx = cv.getContext('2d');
  const T = (idx, fn) => {
    const img = ctx.createImageData(16, 16), D = img.data;
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      let c = fn(x, y); if (typeof c === 'number') c = [c, c, c];
      const k = (y * 16 + x) * 4;
      D[k] = clamp(Math.round(c[0]), 0, 255); D[k + 1] = clamp(Math.round(c[1]), 0, 255); D[k + 2] = clamp(Math.round(c[2]), 0, 255); D[k + 3] = 255;
    }
    ctx.putImageData(img, (idx % 16) * 16, Math.floor(idx / 16) * 16);
  };
  const N = (x, y, s) => hash2i(x, y, s);
  // la peau : marbrée, des verrues sombres, quelques veines
  const peau = (x, y) => {
    let v = 212 + N(x >> 1, y >> 1, 1501) * 30 - N(x, y, 1502) * 14;
    if (N(x, y, 1503) > 0.93) v -= 58;
    if (N(x, y, 1504) > 0.95) v += 22;
    if ((x + N(1, y, 1505) * 3 | 0) % 7 === 0 && N(x, y >> 2, 1506) > 0.7) v -= 16;
    return v;
  };
  T(TL.gobPeau, peau);
  // le visage : l'arcade lourde, les orbites creuses (les yeux sont des boîtes), les rides, la bouche trop large et ses dents
  const visage = (dort) => (x, y) => {
    let v = peau(x, y) + 8;
    if (y === 4 && x >= 2 && x <= 13) v = 150 + N(x, 4, 1510) * 20;
    if (y === 5 && x >= 2 && x <= 13) v = 185;
    const orb = y >= 5 && y <= 7 && ((x >= 3 && x <= 6) || (x >= 9 && x <= 12));
    if (orb) v = dort ? (y === 6 ? 70 : 160) : 62 + N(x, y, 1511) * 20;
    if (y === 8 && ((x >= 3 && x <= 6) || (x >= 9 && x <= 12))) v = 170;
    if (y === 9 && (x <= 3 || x >= 12)) v = 176;
    if ((y === 7 || y === 8 || y === 9) && (x === 7 || x === 8)) v = 196;
    if (y === 11 && x >= 2 && x <= 13) v = 46;
    if (y === 11 && (x === 4 || x === 6 || x === 9 || x === 11)) v = 236;
    if (y === 12 && (x === 2 || x === 13)) v = 60;
    if (y === 12 && (x === 5 || x === 10)) v = 228;
    if (y === 12 && x >= 3 && x <= 12 && x !== 5 && x !== 10) v = 150;
    if (y >= 13 && N(x, y, 1512) > 0.86) v -= 40;
    return v;
  };
  T(TL.gobVisage, visage(false));
  T(TL.gobVisageDort, visage(true));
  // les haillons : une toile grossière, des pièces, des trous, des points de couture
  T(TL.gobHaillon, (x, y) => {
    let v = 196 + ((x + y) & 1 ? -12 : 6) + N(x, y, 1520) * 22;
    const piece = N(x >> 2, y >> 2, 1521);
    if (piece > 0.72) v -= 34;
    if (piece < 0.1) v += 20;
    if (N(x, y, 1522) > 0.95) v = 40;
    if ((x === ((y * 3) & 15)) && N(1, y, 1523) > 0.5) v -= 50;
    if (y === 15 && N(x, 0, 1524) > 0.5) v -= 60;
    return v;
  });
}
{
  const _bsa = buildSkinAtlas;
  buildSkinAtlas = function () {
    _bsa();
    try { gobTuiles(SKIN.canvas); } catch (e) { console.warn('gobelins : tuiles', e); }
  };
}

// ---------------------------------------------------------------- les couleurs
// (pour les tuiles grises : métal, cire, toile, plain…)
const GOB_C = {
  noir: [0.03, 0.025, 0.02], argent: rgbf('#d0d0da'), laiton: rgbf('#c89a48'), cuivre: rgbf('#c07848'), cire: [0.95, 0.9, 0.78],
  flamme: [1.5, 1.05, 0.45], braise: [1.4, 0.6, 0.2], toile: rgbf('#d6cbb2'), bleu: rgbf('#5a7a9a'), rouge: rgbf('#9a4a3a'), vert: rgbf('#5a7a4a'), os: rgbf('#ddd4ba'),
};
// la peau : grise, verdâtre, terreuse
const GOB_PEAUX = ['#b4bc8a', '#a6b080', '#bab48e', '#c0c09a', '#aab488', '#b6ac8c', '#b8c094', '#a0aa7e', '#c2ba98'];
// ce qu'ils portent (volé, trop grand)
const GOB_HABITS = [
  { top: '#a04a3a', gilet: true, bonnet: '#7a6a8a' },             // un gilet rouge délavé, un bonnet de laine
  { top: '#5a544c', manteau: true },                               // un manteau d'homme, les pans qui traînent
  { top: '#7a7062', chale: '#8a6a7a', jupe: '#6a5a4a' },           // un châle, des jupons
  { top: '#6a6a5e', hautForme: '#3a3840', culotte: '#7a6a52' },    // un haut-de-forme cabossé
  { top: '#e0d8c8', chemise: true },                               // une chemise de nuit d'enfant
  { top: '#a89a74', ficelle: true },                               // une tunique de toile à sac
  { top: '#6a5a4a', capeline: '#c0b090' },                         // une capeline de dame
  { top: '#4a5e86', veste: true },                                 // une veste à boutons de cuivre
  { top: null, cles: true },                                       // presque rien : un pagne, un collier de clés
];

// ---------------------------------------------------------------- le squelette
function gobRig(v, aieule) {
  const { P, add } = rigParts();
  const A = aieule ? { top: '#6a5e50', chale: '#7a6a5a', jupe: '#5a5048' } : GOB_HABITS[((v | 0) % GOB_HABITS.length + GOB_HABITS.length) % GOB_HABITS.length];
  const peau = rgbf(aieule ? '#d0d0c0' : GOB_PEAUX[((v | 0) % GOB_PEAUX.length + GOB_PEAUX.length) % GOB_PEAUX.length]);
  const peauS = v3.scale(peau, 0.8), ongle = v3.scale(peau, 0.55);
  const habit = A.top ? rgbf(A.top) : peau, habT = A.top ? TL.gobHaillon : TL.gobPeau;
  const H = aieule ? 0.36 : 0.27;                                  // la tête
  const kB = aieule ? 1.15 : 1;                                     // le corps
  add('hips', null, [0, 0.42, 0], null);
  // les jambes, maigres ; les pieds, longs et nus
  for (const [s, L] of [[-1, 'L'], [1, 'R']]) {
    add('leg' + L, 'hips', [s * 0.065 * kB, 0, 0], [0.068 * kB, 0.42, 0.072 * kB], [0, -0.21, 0], A.culotte ? rgbf(A.culotte) : peau, A.culotte ? TL.gobHaillon : TL.gobPeau);
    add('pied' + L, 'leg' + L, [0, -0.405, 0.045], [0.085, 0.035, 0.185], [0, 0, 0], peauS, TL.gobPeau);
  }
  // le tronc, petit et bossu ; le ventre en avant
  add('torso', 'hips', [0, 0, 0], [0.22 * kB, 0.32, 0.16 * kB], [0, 0.16, 0], habit, habT);
  const nu = A.chemise ? false : (A.gilet || A.cles);
  add('ventre', 'torso', [0, 0.07, 0.07 * kB], [0.17 * kB, 0.13, 0.05], [0, 0, 0], nu ? peau : habit, nu ? TL.gobPeau : habT);
  add('bosse', 'torso', [0, 0.25, -0.075 * kB], [0.18 * kB, 0.12, 0.07], [0, 0, 0], habit, habT);
  if (A.manteau) add('pans', 'hips', [0, 0.05, -0.02], [0.27, 0.5, 0.2], [0, -0.21, 0], habit, TL.gobHaillon);
  if (A.chemise) add('chemise', 'hips', [0, 0.04, 0], [0.26, 0.36, 0.19], [0, -0.14, 0], habit, TL.gobHaillon);
  if (A.jupe) add('jupe', 'hips', [0, 0.04, 0], [0.27, 0.3, 0.2], [0, -0.13, 0], rgbf(A.jupe), TL.gobHaillon);
  if (A.chale) add('chale', 'torso', [0, 0.27, 0], [0.3 * kB, 0.14, 0.21 * kB], [0, -0.02, 0], rgbf(A.chale), TL.gobHaillon);
  if (A.ficelle) add('ficelle', 'torso', [0, 0.04, 0], [0.235, 0.025, 0.175], [0, 0, 0], rgbf('#c8b888'), TL.rope);
  if (A.cles) {
    add('pagne', 'hips', [0, 0.03, 0], [0.2, 0.1, 0.17], [0, -0.03, 0], rgbf('#5a4a3a'), TL.gobHaillon);
    for (let k = 0; k < 5; k++) add('cle' + k, 'torso', [(k - 2) * 0.035, 0.24 - Math.abs(k - 2) * 0.02, 0.085], [0.014, 0.05, 0.008], [0, -0.025, 0], GOB_C.laiton, TL.metal);
  }
  if (A.veste) for (let k = 0; k < 3; k++) add('bouton' + k, 'torso', [0.035, 0.08 + k * 0.08, 0.083], [0.018, 0.018, 0.008], [0, 0, 0], GOB_C.laiton, TL.metal);
  // le cou, la tête
  add('neck', 'torso', [0, 0.31, 0.03], [0.06, 0.06, 0.06], [0, 0.02, 0], peau, TL.gobPeau);
  const fy = H * 0.92, fz = H * 0.46;
  add('head', 'neck', [0, 0.04, 0.03], [H, fy, H * 0.92], [0, fy / 2, 0], peau, tx(TL.gobPeau, TL.gobVisage));
  // les yeux (ils renvoient la lumière, la nuit), l'arcade, le nez crochu, le menton en galoche
  const yeux = aieule ? [0.86, 0.86, 0.8] : [0.93, 0.82, 0.32];
  for (const [s, L] of [[-1, 'G'], [1, 'D']]) add('oeil' + L, 'head', [s * H * 0.188, fy * 0.594, fz + 0.004], [H * 0.13, H * 0.1, 0.01], [0, 0, 0], yeux, TL.plain);
  add('arcade', 'head', [0, fy * 0.73, fz + 0.012], [H * 0.82, H * 0.08, 0.035], [0, 0, 0], peauS, TL.gobPeau);
  const nez = add('nez', 'head', [0, fy * 0.52, fz], [H * 0.19, H * 0.2, H * 0.5], [0, 0, H * 0.24], v3.scale(peau, 0.94), TL.gobPeau);
  nez.r0 = [0.42, 0, 0]; nez.r = nez.r0.slice();
  add('nezBout', 'nez', [0, -0.01, H * 0.47], [H * 0.17, H * 0.26, H * 0.15], [0, -H * 0.09, 0], v3.scale(peau, 0.86), TL.gobPeau);
  add('menton', 'head', [0, fy * 0.08, fz - 0.01], [H * 0.36, H * 0.17, H * 0.2], [0, 0, 0.02], peau, TL.gobPeau);
  // les oreilles, longues, en pointe (celles de la vieille pendent)
  for (const [s, L] of [[-1, 'G'], [1, 'D']]) {
    const o = add('oreille' + L, 'head', [s * H * 0.48, fy * 0.6, -0.02], [H * (aieule ? 0.8 : 0.56), H * 0.3, 0.024], [s * H * (aieule ? 0.38 : 0.27), 0, 0], peau, TL.gobPeau);
    o.r0 = aieule ? [0, s * 0.5, s * -0.85] : [0, s * 0.95, s * 0.32]; o.r = o.r0.slice();
    add('pointe' + L, 'oreille' + L, [s * H * (aieule ? 0.76 : 0.54), H * 0.02, 0], [H * 0.32, H * 0.14, 0.02], [s * H * 0.15, 0, 0], peauS, TL.gobPeau);
    add('lobe' + L, 'oreille' + L, [s * H * 0.12, -H * 0.13, 0], [H * 0.2, H * 0.1, 0.022], [0, 0, 0], peauS, TL.gobPeau);
  }
  // quelques mèches (grises ou noires)
  const poil = rgbf(aieule ? '#d8d4c8' : ['#2a2622', '#5a5650', '#3a3028'][(v | 0) % 3]);
  add('meche0', 'head', [-H * 0.15, fy + 0.005, -H * 0.15], [H * 0.18, 0.05, H * 0.3], [0, 0.02, 0], poil, TL.hair);
  add('meche1', 'head', [H * 0.2, fy - 0.01, -H * 0.3], [H * 0.12, 0.08, H * 0.16], [0, 0.02, 0], poil, TL.hair);
  // ce qu'il porte sur la tête
  if (A.bonnet) {
    add('bonnet', 'head', [0, fy - 0.01, -0.005], [H * 1.03, 0.085, H * 0.97], [0, 0.04, 0], rgbf(A.bonnet), TL.wool);
    add('bonnetBout', 'head', [0, fy + 0.06, -H * 0.45], [0.075, 0.075, 0.13], [0, -0.03, -0.05], rgbf(A.bonnet), TL.wool);
  }
  if (A.hautForme) {
    const b = add('bord', 'head', [0, fy - 0.005, 0], [H * 1.18, 0.022, H * 1.12], [0, 0, 0], rgbf(A.hautForme), TL.cloth); b.r0 = [0.06, 0, 0.18]; b.r = b.r0.slice();
    add('forme', 'bord', [0, 0.01, 0], [H * 0.68, 0.26, H * 0.64], [0, 0.13, 0], rgbf(A.hautForme), TL.cloth);
  }
  if (A.capeline) {
    add('capeline', 'head', [0, fy * 0.5, -0.01], [H * 1.2, fy * 1.15, H * 1.05], [0, 0.025, -0.02], rgbf(A.capeline), TL.straw);
    add('ruban', 'head', [0, fy * 0.1, fz - 0.06], [H * 1.22, 0.025, 0.04], [0, 0, 0], rgbf('#6a3040'), TL.cloth);
  }
  if (aieule) for (let k = 0; k < 9; k++) { // la couronne de cuillères tordues
    const a = (k / 9) * TAU, c = add('cuiller' + k, 'head', [Math.sin(a) * H * 0.42, fy + 0.005, Math.cos(a) * H * 0.42], [0.022, 0.1, 0.012], [0, 0.05, 0], GOB_C.argent, TL.metal);
    c.r0 = [Math.cos(a) * 0.35, a, -Math.sin(a) * 0.35 + (k % 2 ? 0.2 : -0.1)]; c.r = c.r0.slice();
  }
  // les bras, trop longs ; les mains aux doigts longs
  const manche = A.manteau || A.veste ? habit : peau, mancheT = A.manteau || A.veste ? TL.gobHaillon : TL.gobPeau;
  for (const [s, L] of [[-1, 'L'], [1, 'R']]) {
    add('arm' + L, 'torso', [s * (0.11 * kB + 0.03), 0.29, 0.01], [0.055, A.manteau ? 0.54 : 0.5, 0.06], [0, A.manteau ? -0.27 : -0.25, 0], manche, mancheT);
    add('hand' + L, 'arm' + L, [0, -0.5, 0.01], [0.07, 0.07, 0.05], [0, -0.03, 0], peau, TL.gobPeau);
    add('doigts' + L, 'hand' + L, [0, -0.065, 0.012], [0.072, 0.1, 0.022], [0, -0.05, 0], ongle, TL.gobPeau);
  }
  // le butin, sur le dos (caché quand il n'en porte pas)
  const sac = add('butin', 'torso', [0, 0.18, -0.15], [0.2, 0.22, 0.14], [0, 0, 0], rgbf('#6a5438'), TL.sack);
  sac.hide = true;
  const r = new Rig(P);
  r.kind = 'gob'; r.gob = true; r.aieule = !!aieule; r.H = H;
  return r;
}
Object.assign(ANIMAL_RIGS, {
  x_gobelin: (v) => gobRig(v, false),
  x_aieule: () => gobRig(0, true),
});

// ---------------------------------------------------------------- la pose
// st : { move, phase, t, mode ('marche', 'rode', 'course', 'fouille', 'dort', 'mur', 'tenu', 'assis', 'cache', 'guet', 'mort'),
//        lookY, lookP, seed, nuit (0..1), sac } ; renvoie le décalage vertical du corps
function gobPose(r, st) {
  const mv = st.move || 0, ph = st.phase || 0, t = st.t || 0, sd = st.seed || 0, m = st.mode || 'marche';
  const sw = Math.sin(ph), cw = Math.cos(ph);
  let hipY = 0.42, lean = 0.45, legA = sw * 0.62 * mv, legB = -legA, armA = -sw * 0.55 * mv - 0.15, armB = sw * 0.55 * mv - 0.15, armZ = 0.08;
  let headP = -0.3, headY = clamp(st.lookY || 0, -1.3, 1.3), headR = 0, dy = 0;
  if (m === 'rode' || m === 'cache') {
    hipY = 0.33; lean = 0.75; headP = -0.62; legA = sw * 0.45 * mv - 0.35; legB = -sw * 0.45 * mv - 0.35;
    armA = -0.75 - sw * 0.3 * mv; armB = -0.75 + sw * 0.3 * mv; armZ = 0.12;
    if (m === 'cache') { hipY = 0.27; lean = 0.95; headP = -0.85; legA = legB = -0.9; armA = armB = -0.6; }
  } else if (m === 'course') {
    // il court à quatre pattes : le dos presque à l'horizontale, les bras qui griffent le sol
    hipY = 0.36; lean = 1.18; headP = -1.05;
    legA = Math.sin(ph) * 0.95; legB = Math.sin(ph + 0.6) * 0.95;
    armA = -1.3 + Math.sin(ph + Math.PI) * 0.8; armB = -1.3 + Math.sin(ph + Math.PI + 0.6) * 0.8; armZ = 0.1;
    dy = Math.abs(cw) * 0.05;
  } else if (m === 'fouille') {
    hipY = 0.3; lean = 0.95; headP = -0.7; legA = legB = -0.95;
    armA = -1.25 + Math.sin(t * 9 + sd) * 0.35; armB = -1.25 + Math.sin(t * 9 + sd + 2.1) * 0.35; armZ = 0.05;
    headY = Math.sin(t * 1.3 + sd) * 0.4;
  } else if (m === 'mur') {
    // il entre dans le mur : les bras devant lui, enfoncés dans la pierre, la tête rentrée
    hipY = 0.4; lean = 0.25; headP = 0.25; legA = Math.sin(t * 7) * 0.25; legB = -legA;
    armA = -1.45 + Math.sin(t * 13 + sd) * 0.12; armB = -1.5 + Math.sin(t * 11 + sd) * 0.12; armZ = 0.02; headR = Math.sin(t * 17) * 0.12;
  } else if (m === 'tenu') {
    hipY = 0.42; lean = 0.05; headP = 0.1; legA = Math.sin(t * 6) * 0.3; legB = Math.sin(t * 6 + 1.7) * 0.3;
    armA = -0.2 + Math.sin(t * 5) * 0.2; armB = -0.25 + Math.sin(t * 5 + 1) * 0.2; armZ = 0.35;
  } else if (m === 'assis') {
    hipY = 0.3; lean = 0.35; headP = -0.2 + Math.sin(t * 0.4 + sd) * 0.05; legA = legB = -1.45;
    armA = -0.85 + Math.sin(t * 0.7) * 0.05; armB = -0.9; armZ = 0.2;
  } else if (m === 'guet') {
    hipY = 0.39; lean = 0.5; headP = -0.42 + Math.sin(t * 2.3 + sd) * 0.08; armA = -0.45; armB = -0.35; legA = legB = -0.12;
  } else if (m === 'dort' || m === 'mort') {
    hipY = 0.42; lean = 0.6; headP = 0.35; legA = -1.4; legB = -1.25; armA = -1.1; armB = -0.9; armZ = 0.35;
  } else if (mv < 0.05) {
    // à l'arrêt : il renifle, il tourne la tête
    headP = -0.25 + Math.sin(t * 3.1 + sd) * 0.05;
    armA = -0.2; armB = -0.25;
  }
  r.part('hips').p[1] = hipY + dy;
  r.set('legL', legA, 0, 0); r.set('legR', legB, 0, 0);
  r.set('piedL', -legA * 0.4 + (lean > 0.9 ? 0.3 : 0), 0, 0); r.set('piedR', -legB * 0.4 + (lean > 0.9 ? 0.3 : 0), 0, 0);
  r.set('torso', lean, 0, 0);
  r.set('armL', armA, 0, armZ); r.set('armR', armB, 0, -armZ);
  r.set('handL', m === 'course' ? 0.6 : 0, 0, 0); r.set('handR', m === 'course' ? 0.6 : 0, 0, 0);
  r.set('doigtsL', m === 'fouille' || m === 'course' ? 0.5 : 0.15, 0, 0); r.set('doigtsR', m === 'fouille' || m === 'course' ? 0.5 : 0.15, 0, 0);
  r.set('head', headP + (st.lookP || 0), headY, headR);
  // les oreilles frémissent ; couchées quand il fuit ; celles de la vieille pendent
  const ow = Math.sin(t * 7 + sd) * (Math.sin(t * 0.9 + sd) > 0.7 ? 0.18 : 0.03);
  for (const [s, L] of [[-1, 'G'], [1, 'D']]) {
    const q = r.part('oreille' + L);
    if (!q || !q.r0) continue;
    const plat = m === 'course' || m === 'mur' ? 0.45 : 0;
    q.r[0] = q.r0[0]; q.r[1] = q.r0[1] + s * plat; q.r[2] = q.r0[2] - s * plat * 0.6 + (r.aieule ? 0 : s * ow);
  }
  // les yeux luisent la nuit (pas ceux qui dorment, ni les morts)
  const luit = (st.nuit || 0) > 0.45 && m !== 'dort' && m !== 'mort';
  // (la nuit, l'œil qui renvoie la lumière paraît plus grand que l'œil : deux points dans le noir, de loin)
  for (const n of ['oeilG', 'oeilD']) {
    const q = r.part(n);
    if (!q) continue;
    if (!q.s0) q.s0 = q.s.slice();
    const kE = luit ? 1.7 : 1;
    q.s[0] = q.s0[0] * kE; q.s[1] = q.s0[1] * kE;
    q.fl = luit ? FX_EMIT : 0; q.hide = m === 'dort' || m === 'mort';
  }
  const tete = r.part('head');
  if (tete) tete.tex = tx(TL.gobPeau, m === 'dort' || m === 'mort' ? TL.gobVisageDort : TL.gobVisage);
  const sac = r.part('butin'); if (sac) sac.hide = !st.sac;
  return 0;
}

// ---------------------------------------------------------------- les objets posés
// (les tuiles colorées — bois, écorce, terre, feuilles, or — se teintent à peine ; les tuiles grises prennent la couleur)
const gobR = (o, k) => hash2i(Math.round(o.x * 10) + k * 7, Math.round(o.z * 10) - k * 13, 977 + k);
const GOB_REFLET = [0.62, 0.58, 0.5]; // (les reflets : de l'or, sans lumière propre, à peine)
const GOB_GT = { blanc: WHITE, sombre: [0.66, 0.64, 0.62], clair: [1.18, 1.12, 1.05], mort: [1.75, 2.05, 2.5], gris: [1.95, 2.3, 2.75], laitonT: [0.92, 0.76, 0.56], argentT: [0.8, 0.8, 0.86] };
Object.assign(PROP_MODELS, {
  // la vieille souche : un chêne mort, ouvert par la foudre (creux, l'écorce en couronne brisée), ses racines
  gob_souche(E, o) {
    const H = [2.05, 1.5, 2.3, 1.15, 1.75, 0.85, 1.55, 2.15];
    for (let k = 0; k < 8; k++) {
      const a = k * Math.PI / 4, h = H[k];
      E.bx(Math.cos(a) * 0.74, 0, Math.sin(a) * 0.74, 0.66, h, 0.34, k % 2 ? GOB_GT.mort : GOB_GT.gris, TL.bark, Math.PI / 2 - a);
      E.bx(Math.cos(a) * 0.74, h, Math.sin(a) * 0.74, 0.4, 0.18 + (k % 3) * 0.12, 0.2, GOB_GT.mort, TL.bark, Math.PI / 2 - a + 0.3, 0.25, 0.1);
    }
    E.bx(0, 0, 0, 1.15, 0.06, 1.15, GOB_C.noir, TL.plain);
    E.bx(0, 0.06, 0.15, 0.7, 0.04, 0.5, GOB_GT.sombre, TL.soil);
    for (let k = 0; k < 7; k++) {
      const a = k * TAU / 7 + 0.3, L = 1.3 + (k % 3) * 0.35;
      E.box(Math.cos(a) * (0.9 + L / 2), 0.08, Math.sin(a) * (0.9 + L / 2), 0.26, 0.2, L, GOB_GT.mort, TL.bark, Math.PI / 2 - a, -0.12);
    }
    // des champignons en console, de la mousse
    E.bx(0.55, 0.9, -0.55, 0.32, 0.05, 0.22, rgbf('#c8a070'), TL.plain, 0.8);
    E.bx(0.6, 1.25, -0.5, 0.24, 0.05, 0.18, rgbf('#b89060'), TL.plain, 0.8);
    E.bx(-0.75, 0.45, 0.35, 0.28, 0.05, 0.2, rgbf('#d0b080'), TL.plain, -0.4);
    E.bx(-0.4, 0, -0.85, 0.7, 0.12, 0.5, GOB_GT.blanc, TL.leaves, 0.4);
  },
  // la racine polie : une boucle de racine, plus claire et lisse que les autres
  gob_racine(E, o) {
    const c = (o.data && o.data.tiree) ? GOB_GT.sombre : GOB_GT.clair;
    E.box(-0.2, 0.08, 0, 0.11, 0.24, 0.11, c, TL.wood, 0, 0, 0.5);
    E.box(0.03, 0.22, 0, 0.36, 0.1, 0.11, c, TL.wood);
    E.box(0.25, 0.08, 0, 0.11, 0.24, 0.11, c, TL.wood, 0, 0, -0.5);
  },
  // le panneau : une vieille porte peinte en bleu, à demi enterrée entre les racines ; levée quand on y descend
  gob_trappe(E, o) {
    if (o.data && o.data.cachee) { E.bx(0, -0.01, 0, 0.9, 0.05, 1.2, GOB_GT.blanc, TL.soil); E.bx(0.1, 0.03, -0.1, 0.6, 0.04, 0.8, GOB_GT.blanc, TL.leaves, 0.3); return; }
    const ouv = o.data && o.data.ouverte;
    E.bx(0, -0.02, 0, 0.86, 0.04, 1.16, GOB_C.noir, TL.plain);
    if (ouv) {
      E.box(0, 0.42, -0.62, 0.82, 1.1, 0.05, GOB_C.bleu, TL.porteBois ?? TL.plain, 0, -0.35, 0);
      for (let k = 0; k < 3; k++) E.box(-0.3 + k * 0.3, -0.35, 0.1 - k * 0.2, 0.08, 0.7, 0.08, GOB_GT.blanc, TL.bark, 0, 0.3 * (k - 1), 0.2);
    } else {
      E.bx(0, 0.01, 0, 0.82, 0.05, 1.1, GOB_C.bleu, TL.porteBois ?? TL.plain);
      E.bx(0.3, 0.06, 0.32, 0.12, 0.02, 0.06, GOB_C.laiton, TL.metal);
      E.bx(-0.2, 0.06, -0.3, 0.5, 0.05, 0.4, GOB_GT.blanc, TL.soil, 0.3);
      E.bx(0.25, 0.06, 0.05, 0.3, 0.04, 0.5, GOB_GT.blanc, TL.leaves, -0.2);
    }
    E.box(-0.5, 0.08, 0, 0.14, 0.14, 1.4, GOB_GT.mort, TL.bark, 0.1);
  },
  // la pierre griffée : trois entailles et un rond
  gob_marque(E, o) {
    E.bx(0, 0, 0, 0.46, 0.13, 0.36, GOB_GT.blanc, mt(M_STONE), 0.2);
    for (let k = 0; k < 3; k++) E.bx(-0.07 + k * 0.07, 0.13, 0.04, 0.018, 0.006, 0.13, [0.12, 0.1, 0.09], TL.plain, 0.12);
    for (let k = 0; k < 6; k++) { const a = k * TAU / 6; E.bx(Math.cos(a) * 0.045, 0.13, -0.09 + Math.sin(a) * 0.045, 0.022, 0.006, 0.022, [0.12, 0.1, 0.09], TL.plain, a); }
  },
  // un terrier : une petite butte de terre retournée, et dedans, la gueule noire d'un trou ; deux racines par-dessus
  gob_terrier(E, o) {
    const m = mt(M_DIRT);
    E.bx(0, -0.08, 0.12, 1.1, 0.34, 0.85, WHITE, m, 0.15);
    E.bx(0.05, -0.08, 0.28, 0.75, 0.52, 0.55, WHITE, m, -0.2);
    E.bx(0, -0.06, -0.2, 0.46, 0.36, 0.34, GOB_C.noir, TL.plain);
    E.bx(0, -0.04, -0.52, 0.7, 0.05, 0.42, WHITE, m, 0.3);
    E.bx(0.3, -0.02, -0.45, 0.22, 0.08, 0.16, WHITE, m, 0.9);
    E.box(0, 0.4, 0.08, 0.08, 0.08, 0.95, GOB_GT.mort, TL.bark, 0.2, -0.15);
    E.box(0.2, 0.33, 0.1, 0.06, 0.06, 0.75, GOB_GT.mort, TL.bark, -0.6, -0.1);
  },
  // une cahute : un bric-à-brac de planches, de volets, de portes volées, un drap pour rideau
  gob_cahute(E, o) {
    const v = (o.v | 0) % 5, W = 2.2, D = 1.8, Hh = 1.55 + v * 0.06;
    const pan = [rgbf('#7a6a52'), rgbf('#5a6a7a'), GOB_C.bleu, GOB_C.rouge, GOB_C.vert][v];
    for (const [x, z] of [[-W / 2, -D / 2], [W / 2, -D / 2], [-W / 2, D / 2], [W / 2, D / 2]]) E.bx(x, 0, z, 0.08, Hh + 0.1, 0.08, GOB_GT.blanc, TL.darkwood);
    E.bx(0, 0, D / 2, W, Hh, 0.06, GOB_GT.blanc, TL.wood);                          // le fond : des planches
    E.bx(-W / 2, 0, 0, 0.06, Hh * 0.95, D, pan, TL.porteBois ?? TL.plain);     // un côté : une porte couchée
    E.bx(W / 2, 0, 0, 0.06, Hh * 0.9, D, rgbf('#b8a888'), TL.porteBasPanneau ?? TL.plain); // l'autre : un volet
    E.bx(-W / 2 + 0.45, 0, -D / 2, 0.9, Hh, 0.05, GOB_GT.sombre, TL.wood);         // devant, à gauche
    E.bx(W / 2 - 0.35, 0, -D / 2, 0.7, Hh, 0.05, GOB_GT.blanc, TL.wood);
    E.bx(0.05, 0.25, -D / 2 - 0.01, 0.62, Hh - 0.25, 0.02, GOB_C.toile, TL.cloth);  // le rideau : un drap volé
    E.box(0, Hh + 0.12, 0, W + 0.4, 0.06, D + 0.4, GOB_GT.sombre, TL.wood, 0, 0.12, v % 2 ? 0.08 : -0.06); // le toit, de travers
    E.bx(v % 2 ? 0.6 : -0.7, Hh + 0.16, 0.2, 0.5, 0.18, 0.4, rgbf('#a08a64'), TL.cloth2);
    if (v === 1 || v === 3) E.box(W / 2 + 0.06, 0.45, 0.3, 0.06, 0.9, 0.9, GOB_GT.blanc, TL.darkwood, 0, 0, 0.1); // une roue de charrette contre le mur
    if (v === 2) E.bx(-W / 2 - 0.04, Hh * 0.55, -0.2, 0.03, 0.22, 0.22, GOB_C.laiton, TL.metal);     // un heurtoir
  },
  // un tas : des pièces, de l'argenterie, du laiton ; et ce qui dépasse. Il baisse à chaque poignée (data.n)
  gob_tas(E, o) {
    const n = (o.data && o.data.n) | 0, k = Math.max(0.12, 1 - n * 0.3), v = (o.v | 0);
    if (n >= 3) { E.bx(0, 0, 0, 0.9, 0.04, 0.8, GOB_GT.sombre, TL.soil); E.bx(0.1, 0.03, 0.1, 0.12, 0.012, 0.06, GOB_C.argent, TL.metal, 0.6); return; }
    E.bx(0, 0, 0, 1.5 * Math.sqrt(k), 0.28 * k, 1.3 * Math.sqrt(k), GOB_GT.blanc, TL.gold);
    E.bx(0.08, 0.28 * k, -0.05, 1.0 * Math.sqrt(k), 0.24 * k, 0.85 * Math.sqrt(k), GOB_C.argent, TL.metal, 0.4);
    E.bx(-0.05, 0.52 * k, 0.02, 0.55 * Math.sqrt(k), 0.18 * k, 0.5 * Math.sqrt(k), GOB_GT.laitonT, TL.gold, 0.9);
    const h = 0.7 * k, R = (i) => gobR(o, i);
    if (n < 2) {
      E.bx(0.25, h - 0.1, 0.1, 0.05, 0.42, 0.05, GOB_C.laiton, TL.metal, 0, 0.25, 0.15);           // un bougeoir
      E.bx(0.3, h + 0.28, 0.0, 0.1, 0.03, 0.1, GOB_C.laiton, TL.metal);
      E.box(-0.35, h * 0.7, 0.2, 0.25, 0.3, 0.12, GOB_GT.blanc, TL.darkwood, R(1) * 2, 0.4);           // une pendule
      E.box(-0.35, h * 0.7 + 0.02, 0.27, 0.16, 0.16, 0.01, [0.92, 0.9, 0.82], TL.plain, R(1) * 2, 0.4);
    }
    for (let i = 0; i < 6 - n * 2; i++) E.box((R(i + 3) - 0.5) * 1.1 * k, h * (0.3 + R(i + 9) * 0.5), (R(i + 5) - 0.5) * 0.9 * k, 0.03, 0.012, 0.2, GOB_C.argent, TL.metal, R(i + 7) * 6, 0.3, 0.2); // des cuillères
    if (v % 3 === 0 && n === 0) E.box(-0.1, h + 0.05, -0.3, 0.12, 0.2, 0.08, rgbf('#e0d0b0'), TL.doll, 0.4, -0.5); // une poupée, la tête en bas
    if (v % 3 === 1 && n === 0) E.box(0.4, h * 0.6, -0.25, 0.22, 0.22, 0.02, GOB_GT.blanc, TL.gold, 0.7, 0.6);       // un cadre doré
    if (v % 3 === 2 && n === 0) E.box(0.1, h + 0.02, 0.3, 0.2, 0.14, 0.14, GOB_C.cuivre, TL.metal, 0.3);           // une théière
    // l'or qui accroche la lueur des chandelles
    E.fl = FX_EMIT;
    for (let i = 0; i < 5 - n * 2; i++) E.bx((R(i + 30) - 0.5) * 1.0 * k, 0.28 * k + R(i + 34) * 0.3 * k, (R(i + 38) - 0.5) * 0.8 * k, 0.05, 0.012, 0.05, GOB_REFLET, TL.gold, R(i + 42) * 3);
    E.fl = 0;
  },
  // le grand tas : une butte d'or et d'argent, des générations de vols ; la vieille siège tout en haut
  gob_grand_tas(E, o) {
    const n = (o.data && o.data.n) | 0, k = Math.max(0.45, 1 - n * 0.16), R = (i) => gobR(o, i);
    E.bx(0, 0, 0, 4.6, 0.5, 3.6, GOB_GT.blanc, TL.gold);
    E.bx(0.1, 0.5, 0.2, 3.6, 0.45 * k + 0.05, 2.8, GOB_C.argent, TL.metal, 0.12);
    E.bx(0.0, 0.95 * k + 0.05, 0.35, 2.4, 0.45 * k, 1.9, GOB_GT.blanc, TL.gold, -0.08);
    E.bx(0.05, 1.35 * k + 0.05, 0.5, 1.4, 0.25, 1.2, GOB_GT.laitonT, TL.gold, 0.2);
    for (let i = 0; i < 18 - n * 4; i++) {
      const a = R(i) * TAU, rr = 0.6 + R(i + 40) * 1.5, y = 0.35 + R(i + 80) * 0.9 * k, kind = i % 6;
      const x = Math.cos(a) * rr, z = Math.sin(a) * rr * 0.75;
      if (kind === 0) E.box(x, y, z, 0.05, 0.4, 0.05, GOB_C.laiton, TL.metal, a, 0.3, 0.2);                    // chandeliers
      else if (kind === 1) E.box(x, y, z, 0.03, 0.012, 0.22, GOB_C.argent, TL.metal, a, 0.2, 0.3);              // cuillères
      else if (kind === 2) E.box(x, y + 0.1, z, 0.26, 0.3, 0.12, GOB_GT.blanc, TL.darkwood, a, 0.35);               // pendules
      else if (kind === 3) E.box(x, y + 0.05, z, 0.2, 0.15, 0.15, GOB_C.cuivre, TL.metal, a);                     // théières, chaudrons
      else if (kind === 4) E.box(x, y + 0.08, z, 0.34, 0.26, 0.03, GOB_GT.blanc, TL.gold, a, 0.5);                    // cadres
      else E.box(x, y, z, 0.1, 0.05, 0.2, [0.55, 0.45, 0.4], TL.leather, a, 0.2);                                 // souliers
    }
    E.box(-1.7, 0.9, -0.9, 0.06, 1.6, 0.06, GOB_GT.blanc, TL.darkwood, 0.3, 0.4, 0.3);                               // un pied de chaise, un manche de faux
    E.box(1.8, 0.7, -0.6, 0.5, 0.06, 0.06, GOB_C.laiton, TL.metal, 0.7, 0.2, 0.5);
    // l'or qui accroche la lueur des chandelles
    E.fl = FX_EMIT;
    for (let i = 0; i < 14 - n * 3; i++) {
      const a = R(i + 60) * TAU, rr = 0.4 + R(i + 100) * 1.6, y = R(i + 140) < 0.5 ? 0.5 : 0.95 * k + 0.05;
      E.bx(Math.cos(a) * rr, y, Math.sin(a) * rr * 0.7, 0.06, 0.012, 0.06, GOB_REFLET, TL.gold, a);
    }
    E.fl = 0;
  },
  // ce qui traîne par terre, autour des tas : des pièces, une cuillère, un bouton
  gob_eparpille(E, o) {
    for (let k = 0; k < 9; k++) {
      const a = gobR(o, k) * TAU, r = 0.2 + gobR(o, k + 20) * 1.1, c = k % 3 === 0 ? GOB_C.argent : GOB_C.laiton;
      E.bx(Math.cos(a) * r, 0, Math.sin(a) * r, k % 4 === 1 ? 0.03 : 0.07, 0.012, k % 4 === 1 ? 0.2 : 0.07, c, TL.metal, a);
    }
  },
  // le siège de la vieille : un dossier de banc d'église, un coussin de velours
  gob_siege(E, o) {
    E.bx(0, 0, 0, 0.8, 0.3, 0.6, GOB_GT.blanc, TL.darkwood);
    E.bx(0, 0.3, 0.02, 0.72, 0.08, 0.55, rgbf('#9a3a3a'), TL.cloth);
    E.bx(0, 0.3, -0.28, 0.82, 1.15, 0.08, GOB_GT.blanc, TL.meuSculpte ?? TL.darkwood);
    E.bx(0, 1.45, -0.28, 0.4, 0.22, 0.08, GOB_GT.blanc, TL.meuSculpte ?? TL.darkwood);
    for (const s of [-1, 1]) E.bx(s * 0.38, 0.3, -0.05, 0.06, 0.35, 0.5, GOB_GT.blanc, TL.darkwood);
  },
  // un nid : des chiffons, des plumes, des cheveux
  gob_nid(E, o) {
    const C = [rgbf('#8a7a62'), rgbf('#a8987a'), rgbf('#7a6a7a'), rgbf('#9a8a6a'), rgbf('#c0b298')];
    for (let k = 0; k < 7; k++) { const a = k * TAU / 7 + gobR(o, k); E.bx(Math.cos(a) * 0.38, 0, Math.sin(a) * 0.3, 0.42, 0.14 + (k % 3) * 0.03, 0.22, C[k % 5], TL.gobHaillon, Math.PI / 2 - a); }
    E.bx(0, 0, 0, 0.6, 0.06, 0.45, C[2], TL.gobHaillon);
    E.bx(0.15, 0.08, 0.05, 0.12, 0.012, 0.03, [0.92, 0.9, 0.86], TL.plain, 0.5);
    E.bx(-0.1, 0.07, -0.08, 0.1, 0.012, 0.025, [0.3, 0.3, 0.32], TL.plain, 1.4);
  },
  // le berceau, très ancien ; un bonnet dedans, une poupée de paille tournée vers le mur
  gob_berceau(E, o) {
    const c = rgbf('#8a9ab0');
    for (const s of [-1, 1]) E.box(0, 0.06, s * 0.3, 0.95, 0.06, 0.06, GOB_GT.blanc, TL.darkwood, 0, 0, 0);
    E.bx(0, 0.1, 0, 0.9, 0.06, 0.5, c, TL.cloth2);
    for (const s of [-1, 1]) { E.bx(0, 0.1, s * 0.25, 0.9, 0.42, 0.04, c, TL.cloth2); E.bx(s * 0.45, 0.1, 0, 0.04, s < 0 ? 0.62 : 0.45, 0.5, c, TL.cloth2); }
    E.bx(0.2, 0.16, 0, 0.18, 0.08, 0.16, rgbf('#f0ece0'), TL.cloth);
    E.box(-0.2, 0.25, 0.1, 0.1, 0.2, 0.08, GOB_GT.blanc, TL.straw, Math.PI, 0.2);
  },
  // l'étal des prises : des planches sur deux tréteaux ; dessus, ce qu'ils ont rapporté (data.items : couleurs)
  gob_etal(E, o) {
    E.bx(0, 0.72, 0, 2.3, 0.05, 0.8, GOB_GT.blanc, TL.wood);
    for (const s of [-1, 1]) { E.box(s * 0.95, 0.36, 0.25, 0.06, 0.78, 0.06, GOB_GT.blanc, TL.darkwood, 0, -0.25); E.box(s * 0.95, 0.36, -0.25, 0.06, 0.78, 0.06, GOB_GT.blanc, TL.darkwood, 0, 0.25); }
    const L = (o.data && o.data.items) || [];
    for (let i = 0; i < Math.min(L.length, 30); i++) {
      const row = Math.floor(i / 10), col = i % 10, c = typeof L[i] === 'string' ? rgbf(L[i]) : GOB_C.argent;
      E.bx(-1.0 + col * 0.22, 0.77, -0.25 + row * 0.25, 0.1, 0.05 + (i % 3) * 0.02, 0.08, c, TL.plain, (i % 4) * 0.4);
    }
  },
  // des chandelles volées : de toutes les tailles, à demi fondues
  gob_chandelles(E, o) {
    const n = 3 + ((o.v | 0) % 4), lit = !(o.data && o.data.lit === false);
    E.bx(0, 0, 0, 0.3, 0.03, 0.3, GOB_C.laiton, TL.metal);
    for (let k = 0; k < n; k++) {
      const a = k * TAU / n + gobR(o, k), r = 0.06 + (k % 2) * 0.05, h = 0.1 + gobR(o, k + 9) * 0.22, x = Math.cos(a) * r, z = Math.sin(a) * r;
      E.bx(x, 0.03, z, 0.045, h, 0.045, GOB_C.cire, TL.plain);
      E.bx(x + 0.01, 0.03, z, 0.06, 0.03, 0.06, GOB_C.cire, TL.plain);
      if (lit) { E.fl = FX_EMIT; E.bx(x, 0.03 + h, z, 0.025, 0.05, 0.025, GOB_C.flamme, TL.flame); E.fl = 0; }
    }
  },
  // la marmite volée, sur trois pierres, au-dessus des braises
  gob_marmite(E, o) {
    for (let k = 0; k < 3; k++) { const a = k * TAU / 3; E.bx(Math.cos(a) * 0.32, 0, Math.sin(a) * 0.32, 0.22, 0.18, 0.2, GOB_GT.blanc, mt(M_STONE), a); }
    const lit = !(o.data && o.data.lit === false);
    E.fl = lit ? FX_EMIT : 0; E.bx(0, 0, 0, 0.42, 0.06, 0.42, lit ? GOB_C.braise : [0.1, 0.08, 0.07], lit ? TL.ember : TL.coal); E.fl = 0;
    E.bx(0, 0.18, 0, 0.5, 0.36, 0.5, [0.45, 0.45, 0.48], TL.iron);
    E.bx(0, 0.54, 0, 0.56, 0.04, 0.56, [0.55, 0.55, 0.58], TL.iron);
    E.bx(0, 0.5, 0, 0.44, 0.02, 0.44, rgbf('#6a5a3a'), TL.plain);
  },
  // un rocher (les parois ne sont pas droites) ; une stalactite (posée au plafond, elle pend)
  gob_rocher(E, o) {
    const R = (i) => gobR(o, i), m = mt(typeof M_SROCHE !== 'undefined' ? M_SROCHE : M_ROCK);
    E.bx(0, -0.1, 0, 1.4, 0.9 + R(3) * 0.5, 1.1, WHITE, m, R(1) * 3);
    E.bx(0.25 - R(4) * 0.5, 0.5 + R(5) * 0.4, 0.1, 0.9, 0.6 + R(6) * 0.5, 0.8, WHITE, m, R(2) * 3 + 0.5);
  },
  gob_stalactite(E, o) {
    const L = 0.6 + gobR(o, 1) * 1.1, m = mt(typeof M_SROCHE !== 'undefined' ? M_SROCHE : M_ROCK);
    E.bx(0, -L * 0.5, 0, 0.35, L * 0.5, 0.3, WHITE, m, 0.4);
    E.bx(0, -L, 0, 0.16, L * 0.5, 0.14, WHITE, m, 0.9);
  },
  // des racines qui pendent du plafond (l'arrivée) ; on y remonte comme à une échelle
  gob_racines(E, o) {
    for (let k = 0; k < 9; k++) {
      const x = (gobR(o, k) - 0.5) * 1.3, z = (gobR(o, k + 20) - 0.5) * 1.0, L = 0.6 + gobR(o, k + 40) * 1.6;
      E.bx(x, 2.4 - L, z, 0.06 + (k % 3) * 0.03, L, 0.06 + (k % 2) * 0.03, GOB_GT.blanc, TL.bark, k);
    }
    for (let k = 0; k < 5; k++) E.box(-0.05, 0.3 + k * 0.42, 0.45, 0.6, 0.07, 0.07, GOB_GT.clair, TL.wood, 0, 0, (k % 2 ? 0.1 : -0.1));
  },
  // ce qu'on lit : la cloche pleine d'alliances, les horloges sans aiguilles, les clés, les souliers, le miroir, les lettres
  gob_cloche(E, o) {
    E.bx(0, 0, 0, 0.5, 0.06, 0.5, rgbf('#8a6a3a'), TL.metal);
    E.bx(0, 0.06, 0, 0.42, 0.32, 0.42, rgbf('#a8823e'), TL.metal, 0.785);
    for (let k = 0; k < 7; k++) E.bx((gobR(o, k) - 0.5) * 0.26, 0.38, (gobR(o, k + 7) - 0.5) * 0.26, 0.04, 0.012, 0.04, GOB_GT.blanc, TL.gold);
  },
  gob_horloges(E, o) {
    for (let k = 0; k < 7; k++) {
      const x = (k % 4) * 0.42 - 0.6, y = 0.6 + Math.floor(k / 4) * 0.55 + gobR(o, k) * 0.15, s = 0.22 + gobR(o, k + 8) * 0.14;
      E.bx(x, y, 0, s + 0.06, s + 0.06, 0.06, k % 2 ? GOB_GT.blanc : GOB_C.laiton, k % 2 ? TL.darkwood : TL.metal);
      E.bx(x, y + 0.03, 0.035, s, s, 0.01, [0.92, 0.9, 0.82], TL.plain);
    }
  },
  gob_cles(E, o) {
    for (let k = 0; k < 24; k++) { const a = k / 24 * TAU; E.box(Math.cos(a) * 0.45, 1.2 + Math.sin(a) * 0.45, 0, 0.05, 0.05, 0.05, [0.7, 0.66, 0.6], TL.iron); }
    for (let k = 0; k < 30; k++) { const a = k / 30 * Math.PI + Math.PI, L = 0.1 + gobR(o, k) * 0.12; E.box(Math.cos(a) * 0.45, 1.2 + Math.sin(a) * 0.45 - L / 2, 0.02, 0.025, L, 0.012, k % 3 ? rgbf('#8a7a62') : GOB_C.laiton, TL.metal); }
    E.bx(0, 1.62, -0.02, 0.06, 0.1, 0.06, GOB_GT.blanc, TL.darkwood);
  },
  gob_souliers(E, o) {
    const C = [[0.35, 0.3, 0.28], [0.6, 0.5, 0.42], [0.7, 0.4, 0.36], [0.45, 0.45, 0.45], [0.66, 0.56, 0.4], [0.9, 0.8, 0.66]];
    for (let k = 0; k < 16; k++) { const a = gobR(o, k) * TAU, r = gobR(o, k + 30) * 0.5; E.box(Math.cos(a) * r, 0.05 + (k % 4) * 0.07, Math.sin(a) * r, 0.11, 0.08, 0.24, C[k % 6], TL.leather, a, (k % 3) * 0.3); }
  },
  gob_miroir(E, o) {
    E.bx(0, 0, 0, 1.0, 1.9, 0.08, GOB_GT.laitonT, TL.gold, 0, 0.12);
    E.bx(0, 0.05, -0.05, 0.86, 1.8, 0.03, GOB_GT.blanc, TL.darkwood, 0, 0.12);
  },
  gob_lettres(E, o) {
    E.bx(0, 0, 0, 0.6, 0.4, 0.45, GOB_GT.blanc, TL.chest);
    for (let k = 0; k < 6; k++) E.bx((k % 2 - 0.5) * 0.12, 0.4 + k * 0.025, 0, 0.22, 0.022, 0.15, WHITE, TL.paper, (k % 3 - 1) * 0.15);
    E.bx(0, 0.42, 0, 0.03, 0.15, 0.17, rgbf('#8a2a30'), TL.cloth);
  },
  // le panneau du raccourci : des planches, une lourde barre qui le tient fermé de l'intérieur
  gob_panneau(E, o) {
    const ouv = o.data && o.data.ouvert;
    E.bx(0, 0, -0.06, 1.3, 1.3, 0.1, ouv ? GOB_C.noir : GOB_GT.blanc, ouv ? TL.plain : TL.soil);   // (ouvert : le noir du boyau derrière)
    if (ouv) E.box(-0.6, 0.6, 0.45, 0.06, 1.15, 0.9, GOB_GT.blanc, TL.wood);                     // le panneau rabattu contre la paroi
    else E.bx(0, 0.05, 0.02, 1.05, 1.15, 0.06, GOB_GT.blanc, TL.wood);
    if (ouv) E.box(0.55, 0.35, 0.12, 0.1, 0.7, 0.1, GOB_GT.blanc, TL.darkwood, 0, 0, 0.25);       // la barre, posée de côté
    else { E.bx(0, 0.58, 0.1, 1.3, 0.1, 0.1, GOB_GT.blanc, TL.darkwood); for (const s of [-1, 1]) E.bx(s * 0.6, 0.5, 0.12, 0.08, 0.26, 0.12, GOB_GT.blanc, TL.bark); }
  },
});
// collisions des objets posés : [demi-largeur, demi-profondeur, hauteur]
Object.assign(PROP_COLL, {
  gob_souche: [1.0, 1.0, 1.8], gob_cahute: [1.12, 0.92, 1.7], gob_tas: [0.72, 0.62, 0.55], gob_grand_tas: [2.3, 1.8, 1.4],
  gob_etal: [1.15, 0.42, 0.8], gob_berceau: [0.47, 0.27, 0.55], gob_marmite: [0.4, 0.4, 0.6], gob_rocher: [0.75, 0.6, 1.0],
  gob_cloche: [0.25, 0.25, 0.4], gob_souliers: [0.45, 0.45, 0.25], gob_lettres: [0.3, 0.23, 0.45], gob_siege: [0.42, 0.32, 1.5],
});
// lumières : les chandelles, la marmite
Object.assign(PROP_LIGHTS, {
  gob_chandelles: { c: [1.25, 0.82, 0.4], r: 12, y: 0.35, flicker: true },
  gob_marmite: { c: [1.3, 0.62, 0.26], r: 13, y: 0.4, flicker: true },
});
