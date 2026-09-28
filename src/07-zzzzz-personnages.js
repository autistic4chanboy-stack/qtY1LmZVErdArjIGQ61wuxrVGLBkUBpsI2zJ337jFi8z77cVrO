// ============================================================================
//  PERSONNAGES « FAÇON 1996 » : silhouettes anguleuses et lisibles, comme les
//  premiers jeux d'aventure en polygones (épaules marquées, taille, hanches,
//  membres effilés en deux segments, bottes en biseau, visages taillés,
//  cheveux en volumes, textures peintes simples)
//  - boîtes « effilées » : une forme (TR_FORMES, 63 au plus) déforme la boîte
//    unité dans le vertex shader des modèles ; son numéro voyage dans 6 bits
//    libres du code de texture (bits 18..23 ; matériaux : bits 2..7 des
//    drapeaux). Les autres lecteurs du code (icônes 3D…) l'ignorent sans mal ;
//  - humanRig remplacé : mêmes noms de pièces et mêmes pivots (hips, torso,
//    neck, head, nose, armL/R, handL/R, legL/R, shoeL/R, it0..it2, skirt,
//    coatTail, apron, bustL…) ; nouveaux segments foreL/R (avant-bras, enfant
//    de armL/R ; les mains en dépendent) et shinL/R (bas de jambe, enfant de
//    legL/R ; les chaussures en dépendent). Morphologies reprises : poitrine,
//    hanches, naturistes (sobres), nains (rig.hipY), enfants ;
//  - poseHuman emballé : genoux, coudes, torsion, assis, prière, bras croisés,
//    queue de cheval qui balance ; rigPlus garde les formes et l'état du rig ;
//    addFace (paupières, bouche) suit la tête nouvelle.
// ============================================================================

// ---------------------------------------------------------------- formes effilées
// Boîte unité (x, y, z ∈ [-½, ½]) ; t = y + ½ (0 en bas, 1 en haut) :
//   kx, kz : rétrécissement (k > 0 : le bas vaut 1 - k ; k < 0 : le haut vaut 1 + k)
//   sz     : décalage du bas vers l'avant (+z), en fraction de la profondeur (le haut ne bouge pas)
//   sl     : pente du bas : y du bas += sl · z (sl < 0 : l'avant descend, comme un menton)
const TR_FORMES = { list: [[0, 0, 0, 0]], ok: false };
function trForme(kx, kz, sz, sl) {
  const L = TR_FORMES.list;
  if (L.length >= 64) throw new Error('personnages : trop de formes');
  L.push([kx || 0, kz || 0, sz || 0, sl || 0]);
  return L.length - 1;
}
const TF = {
  // corps
  torseH: trForme(0.33, 0.14, -0.02), torseF: trForme(0.2, 0.1), torseRond: trForme(0.07, -0.16, 0.1), torseE: trForme(0.1, 0.06),
  bassin: trForme(0.34, 0.12), cou: trForme(-0.1, -0.1), col: trForme(-0.16, -0.16),
  cuisse: trForme(0.3, 0.2, 0.03), mollet: trForme(0.42, 0.36, 0.18), botte: trForme(-0.15, -0.46, 0.23),
  bras: trForme(0.24, 0.18), avantBras: trForme(0.34, 0.24), main: trForme(0.12, 0.3, 0.05),
  // tête (face avant verticale : sz = kz / 2)
  teteH: trForme(0.28, 0.3, 0.15, -0.3), teteF: trForme(0.36, 0.3, 0.15, -0.26), teteE: trForme(0.16, 0.2, 0.1, -0.12),
  nez: trForme(-0.5, -0.8, 0.4), arcade: trForme(0.12, -0.8, 0.4), oreille: trForme(0.25, 0.3),
  // cheveux et barbes
  coiffe: trForme(-0.1, -0.1, 0, 0.6), meche: trForme(0.35, 0.25), nappe: trForme(-0.12, 0.2), chignon: trForme(-0.3, -0.3),
  barbe: trForme(0.4, 0.35, 0.12), barbeLongue: trForme(0.62, 0.5, 0.18),
  // vêtements et chapeaux
  jupe: trForme(-0.46, -0.5), robe: trForme(-0.26, -0.34), pan: trForme(-0.14, -0.22), tablier: trForme(-0.12, 0),
  buste: trForme(0.1, -0.6, 0.3, 0.5), calotte: trForme(-0.18, -0.18), calotteH: trForme(-0.07, -0.07), bonnet: trForme(-0.32, -0.32),
  capuche: trForme(-0.14, -0.14, 0, 0.35), pointe: trForme(-0.85, -0.85), voile: trForme(-0.28, -0.25, 0, 0.3), drape: trForme(-0.25, 0),
  // silhouettes pâles
  membrePale: trForme(0.6, 0.6), tetePale: trForme(0.3, 0.2, 0.1, -0.4),
};
// le vertex shader des modèles : la boîte est déformée avant la matrice d'instance,
// la normale suit (cofacteurs de la jacobienne), les faces restent nettes
{
  const L = TR_FORMES.list, f = (v) => v.toFixed(4);
  const glsl = `
const int TRN = ${L.length};
const vec4 TRF[${L.length}] = vec4[${L.length}](${L.map((k) => `vec4(${k.map(f).join(', ')})`).join(', ')});
void trForme(inout vec3 P, inout vec3 N) {
  int c = int(round(iCol.w));
  int i = c >= 0 ? (c >> 18) & 63 : ((-c - 1) >> 9) & 63;
  if (i <= 0 || i >= TRN) return;
  vec4 k = TRF[i];
  float t = P.y + 0.5;
  float fx = 1.0 + k.x * t - max(k.x, 0.0), fz = 1.0 + k.y * t - max(k.y, 0.0);
  vec3 a = vec3(fx, 0.0, 0.0);
  vec3 b = vec3(P.x * k.x, 1.0 - k.w * P.z, P.z * k.y - k.z);
  vec3 d = vec3(0.0, k.w * (1.0 - t), fz);
  N = N.x * cross(b, d) + N.y * cross(d, a) + N.z * cross(a, b);
  P = vec3(P.x * fx, P.y + k.w * (1.0 - t) * P.z, P.z * fz + k.z * (1.0 - t));
}
`;
  const A = 'void main() {\n  vec4 p = vec4(aPos, 1.0);', B = 'vec3 ln = aNrm / s2;';
  if (SH.modelVS.includes(A) && SH.modelVS.includes(B)) {
    SH.modelVS = SH.modelVS.replace(A, glsl + 'void main() {\n  vec3 trP = aPos, trN = aNrm;\n  trForme(trP, trN);\n  vec4 p = vec4(trP, 1.0);').replace(B, 'vec3 ln = trN / s2;');
    TR_FORMES.ok = true;
  } else console.warn('personnages : vertex shader des modèles inattendu — boîtes effilées désactivées');
}
// point déformé (repère de la pièce) d'un point de la boîte unité : même calcul que le shader
function trPoint(s, o, forme, ux, uy, uz) {
  const k = TR_FORMES.list[forme || 0], t = uy + 0.5;
  const fx = 1 + k[0] * t - Math.max(k[0], 0), fz = 1 + k[1] * t - Math.max(k[1], 0);
  return [o[0] + s[0] * ux * fx, o[1] + s[1] * (uy + k[3] * (1 - t) * uz), o[2] + s[2] * (uz * fz + k[2] * (1 - t))];
}

// émission : la forme (q.shp) rejoint le code de texture ; la couleur et la texture restent libres
// (la statue du jardin, par exemple, repeint ses pièces en pierre sans perdre leur forme)
Rig.prototype.emit = function (buf, root, flags) {
  const P = this.parts;
  for (let i = 0, n = P.length; i < n; i++) {
    const q = P[i];
    m34TR(_mT, q.p[0], q.p[1], q.p[2], q.r[0], q.r[1], q.r[2]);
    m34Mul(q.W, q.pi < 0 ? root : P[q.pi].W, _mT);
    if (!q.s || q.hide) continue;
    let code = withFlags(q.tex, (q.fl || 0) | flags);
    if (q.shp) code = code < 0 ? code - 512 * q.shp : code | (q.shp << 18);
    buf.box(q.W, q.o[0], q.o[1], q.o[2], q.s[0], q.s[1], q.s[2], q.col, code);
  }
};
// copie avec des pièces en plus : garde tous les champs des pièces (forme…) et du rig (look, kid, hipY, tr…)
// (l'ancienne version perdait rig.hipY : les nains flottaient après l'ajout des paupières)
rigPlus = function (r, extra) {
  const u = r.parts.map((q) => { const c = Object.assign({}, q); delete c.W; delete c.pi; delete c.r; return c; });
  for (const e of extra) u.push(Object.assign({ o: [0, 0, 0] }, e));
  const rr = new Rig(u);
  for (const k of Object.keys(r)) if (!(k in rr)) rr[k] = r[k];
  return rr;
};

// ---------------------------------------------------------------- textures peintes (tuiles 16 px de l'atlas des peaux)
Object.assign(TL, {
  trVisH: 200, trVisF: 201, trVisV: 202, trVisVF: 203, trVisE: 204, trPeau: 205, trMain: 206, trTissu: 207, trChemise: 208,
  trManteau: 209, trCorsage: 210, trCeinture: 211, trPantalon: 212, trBotte: 213, trBotteF: 214, trCheveux: 215, trTresse: 216,
  trJupe: 217, trTablier: 218, trSourcils: 219, trBarbe: 220, trPans: 221, trSourcilsF: 222,
});
function trPaintTiles(cv) {
  const ctx = cv.getContext('2d'), img = ctx.getImageData(0, 0, cv.width, cv.height), D = img.data, W = cv.width;
  const T = (idx, fn) => {
    const ox = (idx % 16) * 16, oy = Math.floor(idx / 16) * 16;
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      let c = fn(x, y); if (typeof c === 'number') c = [c, c, c];
      const k = ((oy + y) * W + ox + x) * 4;
      D[k] = clamp(c[0], 0, 255); D[k + 1] = clamp(c[1], 0, 255); D[k + 2] = clamp(c[2], 0, 255); D[k + 3] = 255;
    }
  };
  const N = (x, y, s) => hash2i(x, y, s);
  // visages : yeux au rang 7, bouche au rang 12 (les paupières et la bouche animées s'y posent)
  const visage = (kind) => (x, y) => {
    const fem = kind === 'f' || kind === 'vf', old = kind === 'v' || kind === 'vf', kid = kind === 'e';
    const ex = x <= 7 ? x : 15 - x; // colonnes en miroir
    let v = 244 + N(x, y, 911) * 6 - (y > 12 ? (y - 12) * 4 : 0);
    if (ex === 0) v -= 22; else if (ex === 1) v -= 9;
    if (y >= 12 && ex <= 2) v -= 10;
    if (y === 15) v -= 24;
    let c = v;
    if (kid) {
      if (y === 5 && (ex === 4 || ex === 5)) c = 182;
      if ((y === 6 || y === 7) && (ex === 4 || ex === 5)) c = 255;
      if (y === 7 && ex === 5) c = [50, 42, 38];
      if (y === 6 && ex === 5) c = [84, 70, 62];
      if (y === 10 && ex === 3) c = [255, 198, 196];
      if (y === 10 && ex === 7) c = 214;
      if (y === 12 && ex === 7) c = [206, 110, 110];
      return c;
    }
    if (y === 5 && ex >= 3 && ex <= 6) c = fem ? (ex === 3 ? 158 : 100) : old ? 172 : 76;
    if (y === 4 && ex >= 4 && ex <= 6 && !fem) c = old ? 200 : 130;
    if (y === 4 && fem && ex === 4) c = 156;
    if (y === 6 && ex >= 3 && ex <= 6) c = fem ? (ex === 3 ? 126 : 66) : 204;
    if (y === 7) { if (ex === 3) c = 186; else if (ex === 4) c = 255; else if (ex === 5) c = [52, 44, 40]; else if (ex === 6) c = 248; }
    if (y === 8 && ex >= 3 && ex <= 6) c = old ? 206 : 228;
    if (y >= 8 && y <= 10 && ex === 6) c = v - 14;
    if (y === 10 && ex === 7) c = 170;
    if (fem && y === 10 && ex === 3) c = [252, 206, 198];
    if (y === 11 && ex === 7) c = v - 10;
    if (y === 12 && ex >= 5) c = ex === 5 ? 208 : fem ? [206, 98, 96] : [180, 110, 102];
    if (y === 13 && ex >= 6) c = fem ? 234 : 224;
    if (old) {
      if ((y === 2 || y === 3) && ex >= 4 && (x + y) % 3 === 0) c = 214;
      if ((y === 7 || y === 8) && ex === 2) c = 208;
      if (y >= 10 && y <= 12 && ex === 4) c = 216;
    }
    if (y === 14 && ex >= 6) c = v + 8;
    return c;
  };
  T(TL.trVisH, visage('h')); T(TL.trVisF, visage('f')); T(TL.trVisV, visage('v')); T(TL.trVisVF, visage('vf')); T(TL.trVisE, visage('e'));
  // peau ombrée (plus claire en haut), main en moufle, arcades avec sourcils
  T(TL.trPeau, (x, y) => 250 - y * 1.7 + N(x, y, 921) * 6 - (x === 0 || x === 15 ? 8 : 0));
  T(TL.trMain, (x, y) => 246 - y * 1.4 + N(x, y, 922) * 5 - (y >= 9 && (x === 4 || x === 8 || x === 12) ? 40 : 0) - (y === 15 ? 18 : 0));
  T(TL.trSourcils, (x, y) => (y >= 8 && y <= 14 && x !== 7 && x !== 8 ? 82 + N(x, y, 925) * 20 : 238));
  T(TL.trSourcilsF, (x, y) => (y >= 10 && y <= 13 && x >= 2 && x <= 13 && x !== 7 && x !== 8 ? 110 + N(x, y, 926) * 20 : 240));
  // étoffes : plis, ourlet sombre ; chemise (col, boutons) ; manteau (revers, boutons) ; corsage (laçage)
  const tissu = (x, y, s) => 232 - y * 1.1 + N(x, y, s) * 12 - (N(x, 0, s + 1) > 0.72 && y > 1 && y < 14 ? 16 : 0) - (y === 15 ? 24 : 0) + (y === 0 ? 8 : 0);
  T(TL.trTissu, (x, y) => tissu(x, y, 923));
  T(TL.trChemise, (x, y) => {
    const d = Math.abs(x - 7.5);
    if (y <= 3 && d < 4.5 - y && d > 3.5 - y) return 252; // col
    if (y <= 2 && d < 3.5 - y) return 176;                 // encolure
    if (x === 7 && y >= 3) return 214;                      // patte
    if (x === 8 && (y === 6 || y === 9 || y === 12)) return 118; // boutons
    return tissu(x, y, 927);
  });
  T(TL.trManteau, (x, y) => {
    const e = 2 + y * 0.72, f = 13 - y * 0.72;
    if (y <= 7 && (Math.abs(x - e) < 0.6 || Math.abs(x - f) < 0.6)) return 246; // bords des revers
    if (y <= 7 && (x < e || x > f) && x > 0 && x < 15) return 176;           // revers
    if ((x === 5 || x === 10) && (y === 9 || y === 12)) return [236, 214, 150]; // boutons
    if (x === 7 || x === 8) return 196 + N(x, y, 928) * 8;
    return 214 - y * 0.8 + N(x, y, 929) * 10 - (x === 0 || x === 15 ? 16 : 0);
  });
  T(TL.trCorsage, (x, y) => {
    if (y <= 2 && x >= 5 && x <= 10) return 184;
    if (y >= 3 && y <= 12 && (x === 7 || x === 8)) return ((x + y) & 1) ? 250 : 150;
    if (y >= 14) return 190;
    return tissu(x, y, 930);
  });
  T(TL.trCeinture, (x, y) => {
    if (x >= 5 && x <= 10 && y >= 3 && y <= 12) return (x === 5 || x === 10 || y === 3 || y === 12) ? [236, 220, 170] : 150;
    return 176 + N(x, y, 931) * 20 - (y === 0 || y === 15 ? 30 : 0);
  });
  T(TL.trPantalon, (x, y) => (x === 7 ? 240 : x === 8 ? 206 : 224 - y * 0.6 + N(x, y, 932) * 10) - (y >= 14 ? 22 : 0));
  T(TL.trBotte, (x, y) => (y >= 13 ? 66 + N(x, y, 933) * 10 : y <= 1 ? 236 : 206 - y * 1.6 + N(x, y, 934) * 14));
  T(TL.trBotteF, (x, y) => {
    if (y >= 13) return 66 + N(x, y, 935) * 10;
    if (x >= 6 && x <= 9 && y >= 2 && y <= 9) return ((x + y) & 1) ? 246 : 140; // lacets
    return (y >= 10 ? 226 : 206 - y * 1.2) + N(x, y, 936) * 12;
  });
  // cheveux : mèches verticales, plus sombres en bas ; tresse en chevrons ; barbe grossière
  T(TL.trCheveux, (x, y) => 196 + N(x, y >> 2, 937) * 50 - (N(x, 1, 938) > 0.72 ? 34 : 0) - (y > 11 ? (y - 11) * 9 : 0));
  T(TL.trTresse, (x, y) => (((x + (y % 4 < 2 ? y : 4 - y)) & 3) < 2 ? 236 : 164) - (y % 4 === 3 ? 20 : 0));
  T(TL.trBarbe, (x, y) => 210 + N(x >> 1, y >> 2, 939) * 44 - y * 2.2);
  // jupe plissée avec ourlet, tablier (poche), pans de manteau (fente)
  T(TL.trJupe, (x, y) => (y === 13 || y === 14 ? 196 : y === 15 ? 236 : 222 - y * 0.8 + (x % 4 === 0 ? -28 : x % 4 === 1 ? 10 : 0) + N(x, y, 940) * 8));
  T(TL.trTablier, (x, y) => ((y >= 8 && y <= 12 && x >= 4 && x <= 11 && (x === 4 || x === 11 || y === 8 || y === 12)) ? 206 : y >= 14 ? 214 : 242 - y * 0.6 + N(x, y, 941) * 6));
  T(TL.trPans, (x, y) => (x === 7 || x === 8 ? 128 : 214 - y * 0.9 + N(x, y, 942) * 10 - (x === 0 || x === 15 ? 16 : 0)));
  ctx.putImageData(img, 0, 0);
}
{
  const _bsa = buildSkinAtlas;
  buildSkinAtlas = function () {
    _bsa();
    try { trPaintTiles(SKIN.canvas); } catch (e) { console.warn('personnages : tuiles', e); }
  };
}

// ---------------------------------------------------------------- le squelette
// sexe des habitants (les looks ne le disent pas ; la soutane du curé n'est pas une robe de femme)
for (const d of NPC_DATA) if (d.look && d.gender && d.look.fem === undefined) d.look.fem = d.gender === 'f';

function trHumanRig(look) {
  look = look || {};
  const { P, add } = rigParts();
  const A = (name, parent, p, s, o, col, tex, shp, extra) => { const q = add(name, parent, p, s, o, col, tex, extra); if (shp) q.shp = shp; return q; };
  const nude = !!look.nude, dwarf = !!look.dwarf, kid = !dwarf && (look.height || 1) < 0.8, old = !!look.old;
  const hs = look.hairStyle || 'court';
  const fem = look.fem ?? !!((look.dress && !look.beard) || (look.bust || 0) > 0.05 || (!look.beard && ['long', 'chignon', 'queue'].includes(hs)));
  const b = look.build || 'normal', rond = b === 'rond', mince = b === 'mince';
  const bust = fem && !kid ? clamp(look.bust ?? 0.3, 0, 1.4) : 0, hipK = fem && !kid ? clamp(look.hips ?? 0.35, 0, 1.4) : 0;
  const skin = rgbf(look.skin || '#e0b896'), hair = rgbf(look.hair || '#4a3020');
  const topC = nude ? skin : rgbf(look.top || '#6a5a48'), botC = nude ? skin : rgbf(look.bottom || '#4a3c30');
  const shoeC = nude ? v3.scale(skin, 0.96) : rgbf(look.shoe || '#2a2018');
  const dress = !nude && !!look.dress, coat = !nude && !!look.coat, apronC = !nude && look.apron ? rgbf(look.apron) : null;
  const hat = nude && look.hat === 'capuche' ? null : look.hat, hood = !nude && (hat === 'capuche' || !!look.hood);
  const skinT = TL.trPeau, clothT = nude ? skinT : TL.trTissu;
  const Wk = dwarf ? 1.28 : kid ? 1.08 : 1;            // épaisseur des membres
  const LL = dwarf ? 0.6 : 1, LA = dwarf ? 0.86 : 1, TH = dwarf ? 0.9 : 1;

  // ---- bassin, jambes, bottes
  const LT = 0.44 * LL, LS = 0.4 * LL, hipY = LT + LS + 0.04;
  let pw = fem ? 0.36 + 0.045 * hipK : rond ? 0.39 : mince ? 0.31 : 0.34, pd = fem ? 0.24 + 0.03 * hipK : rond ? 0.28 : 0.23;
  if (kid) { pw = 0.35; pd = 0.23; }
  if (dwarf) { pw *= 1.28; pd *= 1.3; }
  const thW = (fem ? 0.17 + 0.02 * hipK : rond ? 0.185 : mince ? 0.15 : 0.165) * Wk, thD = (fem ? 0.185 : 0.18) * Wk;
  const legX = Math.max(0.085, pw / 2 - thW / 2 + 0.012);
  add('hips', null, [0, 0.88, 0], null);
  A('pelvis', 'hips', [0, 0, 0], [pw, 0.21, pd], [0, -0.025, 0], botC, tx(clothT, nude ? skinT : TL.trPantalon), TF.bassin);
  const shW = (fem ? 0.12 : 0.135) * Wk, shD = 0.15 * Wk, bW = (fem ? 0.12 : 0.135) * Wk * (nude ? 0.92 : 1), bL = (dwarf ? 0.3 : 0.27) * (nude ? 0.95 : 1);
  const stock = dress ? v3.scale(botC, 0.5) : botC; // bas des jambes sous une robe : des bas sombres
  for (const [s, L] of [[-1, 'L'], [1, 'R']]) {
    A('leg' + L, 'hips', [s * legX, 0, 0], [thW, LT + 0.04, thD], [0, -LT / 2, 0.004], botC, tx(clothT, nude ? skinT : TL.trPantalon), TF.cuisse);
    A('shin' + L, 'leg' + L, [0, -LT, 0], [shW, LS + 0.03, shD], [0, -LS / 2 + 0.005, -0.004], stock, tx(clothT, nude ? skinT : TL.trPantalon), TF.mollet);
    A('shoe' + L, 'shin' + L, [0, -LS, 0], [bW, 0.13, bL], [0, 0.025, 0.013], shoeC, nude ? skinT : tx(TL.trBotte, TL.trBotteF), TF.botte);
  }

  // ---- torse (buste en V), ceinture, poitrine, cou, trapèzes
  const tH = 0.62 * TH;
  let tw, td, fT;
  if (kid) { tw = 0.4; td = 0.23; fT = TF.torseE; }
  else if (fem) { tw = rond ? 0.43 : mince ? 0.37 : 0.39; td = rond ? 0.26 : 0.22; fT = rond ? TF.torseRond : TF.torseF; }
  else { tw = rond ? 0.5 : mince ? 0.42 : 0.46; td = rond ? 0.3 : mince ? 0.22 : 0.245; fT = rond ? TF.torseRond : TF.torseH; }
  if (dwarf) { tw *= 1.26; td *= 1.3; }
  const kT = TR_FORMES.list[fT], tS = [tw, tH - 0.02, td], tO = [0, 0.02 + (tH - 0.02) / 2, 0];
  const chestAt = (y) => {
    const t = clamp((y - 0.02) / (tH - 0.02), 0, 1), fx = 1 + kT[0] * t - Math.max(kT[0], 0), fz = 1 + kT[1] * t - Math.max(kT[1], 0);
    return { w: tw * fx, zf: td * (0.5 * fz + kT[2] * (1 - t)), zb: td * (-0.5 * fz + kT[2] * (1 - t)) };
  };
  const frontT = nude ? skinT : coat ? TL.trManteau : dress && fem ? TL.trCorsage : TL.trChemise;
  A('torso', 'hips', [0, 0, 0], tS, tO, topC, tx(nude ? skinT : TL.trTissu, frontT), fT);
  if (!nude && !dress && !coat) { // ceinture : enveloppe le haut du bassin et le bas du torse
    const c0 = chestAt(0.07), zF = Math.max(c0.zf, pd / 2) + 0.014, zB = Math.min(c0.zb, -pd / 2) - 0.014;
    A('ceinture', 'torso', [0, 0.07, (zF + zB) / 2], [Math.max(c0.w, pw) + 0.024, 0.06, zF - zB], [0, 0, 0], rgbf(look.belt || '#3a2a1c'), tx(TL.leather, TL.trCeinture));
  }
  if (bust > 0.05) { // poitrine : un seul volume en pente douce, de toute la largeur du buste (sobre)
    const bh = 0.15 + 0.04 * bust, bd = 0.016 + 0.03 * bust, y0 = 0.32 * TH, c = chestAt(y0 + bh * 0.6), ct = chestAt(y0 + bh);
    A('bustL', 'torso', [0, y0 + bh / 2, c.zf + 0.2 * bd - 0.006], [ct.w + 0.006, bh, bd], [0, 0, 0], topC, nude ? skinT : TL.trTissu, TF.buste);
  }
  const nW = (fem ? 0.092 : kid ? 0.1 : 0.108) * (dwarf ? 1.3 : 1);
  A('neck', 'torso', [0, tH, 0], [nW, 0.165, nW], [0, 0.0575, -0.01], skin, skinT, TF.cou);
  if (coat) A('col', 'torso', [0, tH + 0.012, -0.012], [nW + 0.085, 0.07, nW + 0.075], [0, 0, 0], v3.scale(topC, 0.82), TL.coat, TF.col);
  {
    const c = chestAt(tH - 0.02), tl = (c.w - nW) / 2 + 0.01;
    for (const s of [-1, 1]) A(s < 0 ? 'trapL' : 'trapR', 'torso', [s * (nW / 2 + tl / 2 - 0.012), tH - 0.004, (c.zf + c.zb) / 2 - 0.004], [tl, fem ? 0.05 : 0.065, (c.zf - c.zb) * 0.62], [0, 0, 0], topC, clothT, 0, { r0: [0, 0, -s * (fem ? 0.26 : 0.34)] });
  }

  // ---- tête : boîte à mâchoire, nez en coin, arcades, pommettes, oreilles
  const H = dwarf ? 0.3 : kid ? 0.31 : fem ? 0.262 : 0.272;
  const fH = kid ? TF.teteE : fem ? TF.teteF : TF.teteH, kH = TR_FORMES.list[fH];
  const drop = -kH[3] / 2, hh = 1.04 * H / (1 + drop), oy = (0.5 + drop) * hh - 0.012;
  const yTop = oy + hh / 2, yChin = oy - (0.5 + drop) * hh, zf = H / 2, rowH = (yTop - yChin) / 16;
  const rowY = (r) => yChin + (1 - (r + 0.5) / 16) * (yTop - yChin);
  const halfW = (r) => { const t = 1 - (r + 0.5) / 16; return H / 2 * (1 + kH[0] * t - Math.max(kH[0], 0)); };
  const faceT = look.face ?? (kid ? TL.trVisE : old ? (fem ? TL.trVisVF : TL.trVisV) : fem ? TL.trVisF : TL.trVisH);
  A('head', 'neck', [0, 0.07, 0.006], [H, hh, H], [0, oy, 0], skin, tx(skinT, faceT), fH);
  const skinD = v3.scale(skin, 0.94);
  const nd = kid ? 0.026 : fem ? 0.028 : 0.032;
  A('nose', 'head', [0, rowY(9.3), zf + 0.1 * nd - 0.002], [kid ? 0.038 : fem ? 0.04 : 0.047, rowH * (kid ? 3.4 : 4.4), nd], [0, 0, 0], skinD, skinT, TF.nez);
  if (!kid) { // arcades (les sourcils y sont peints) et pommettes : des facettes à 45° aux coins du visage
    const bd = fem ? 0.011 : 0.017;
    A('arcade', 'head', [0, rowY(5), zf + 0.1 * bd - 0.002], [halfW(5) * 1.7, rowH * 2.2, bd], [0, 0, 0], skinD, tx(skinT, fem ? TL.trSourcilsF : TL.trSourcils), TF.arcade);
    const pc = fem ? 0.026 : 0.03;
    for (const s of [-1, 1]) A(s < 0 ? 'pommetteL' : 'pommetteR', 'head', [s * (halfW(9.5) - 0.013), rowY(9.5), zf - 0.013], [pc, rowH * 2.6, pc], [0, 0, 0], skin, skinT, 0, { r0: [0, Math.PI / 4, 0] });
  }
  const longHair = hs === 'long', veil = hat === 'voile';
  if (!longHair && !hood && !veil) for (const s of [-1, 1]) A(s < 0 ? 'oreilleL' : 'oreilleR', 'head', [s * (halfW(8) + 0.008), rowY(8), -0.012], [0.024, rowH * 3.6, 0.046], [0, 0, 0], skinD, skinT, TF.oreille);

  // ---- cheveux en volumes : calotte (le visage reste libre : sa face avant est derrière le front)
  const hairT = hs === 'boucle' ? TL.wool : TL.trCheveux;
  const cW = H + 0.04, cD = H + 0.03, cZ = zf - 0.005 - cD / 2, hairTop = yTop + 0.024;
  const shellH = (hairTop - rowY(4.2)) / (0.5 + 0.5 - 0.6 * 0.5); // bord avant aux tempes (pente 0.6)
  let tail = false;
  if (!hood && !veil && hs !== 'chauve') {
    const big = hs === 'boucle' ? 0.03 : 0;
    A('hairTop', 'head', [0, hairTop + big * 0.5 - (shellH + big) / 2, cZ - big * 0.5], [cW + big, shellH + big, cD + big], [0, 0, 0], hair, hairT, TF.coiffe);
    if (hs === 'boucle') A('curls', 'head', [0, hairTop - (shellH + 0.02) / 2 + 0.005, cZ - 0.03], [cW * 0.8, shellH + 0.02, cD * 0.8], [0, 0, 0], v3.scale(hair, 0.92), TL.wool, TF.coiffe, { r0: [0, Math.PI / 4, 0] });
    // frange : la lisière des cheveux sur le haut du front
    if (!hat || hat === 'casquette') A('frange', 'head', [0, yTop - rowH * 1.1, zf + 0.004], [halfW(1) * 2 + 0.006, rowH * 2.4, 0.014], [0, 0, 0], hair, hairT, 0);
  }
  if (longHair) {
    // nappe dans le dos et mèches qui encadrent le visage (visibles aussi sous une capuche)
    if (!hood && !veil) A('hairBack', 'head', [0, yTop - 0.01, -(H / 2 + 0.028)], [H + 0.03, 0.44, 0.05], [0, -0.22, 0], hair, TL.trCheveux, TF.nappe, { r0: [0.06, 0, 0] });
    for (const s of [-1, 1]) A(s < 0 ? 'hairSideL' : 'hairSideR', 'head', [s * (halfW(4) + 0.016), rowY(3.5), -0.012], [0.034, 0.27, H * 0.62], [0, -0.13, 0], hair, TL.trCheveux, TF.meche);
  }
  if (!hood && !veil) {
    if (hs === 'chignon') {
      const y = yTop - 0.075, z = -(H / 2 + 0.05);
      A('bun', 'head', [0, y, z], [0.12, 0.12, 0.1], [0, 0, 0], hair, TL.trCheveux, 0);
      A('bun2', 'head', [0, y, z - 0.004], [0.12, 0.12, 0.094], [0, 0, 0], v3.scale(hair, 0.9), TL.trCheveux, 0, { r0: [0, 0, Math.PI / 4] });
    }
    if (hs === 'queue') { // queue de cheval tressée, en trois segments qui balancent
      tail = true;
      const z = -(H / 2 + 0.035), y = yTop - 0.07;
      A('tieQ', 'head', [0, y + 0.012, z + 0.006], [0.06, 0.03, 0.05], [0, 0, 0], v3.scale(hair, 0.55), TL.leather, 0);
      A('tail', 'head', [0, y, z], [0.07, 0.15, 0.055], [0, -0.065, 0], hair, TL.trTresse, TF.meche);
      A('tail2', 'tail', [0, -0.125, 0], [0.058, 0.14, 0.048], [0, -0.06, 0], hair, TL.trTresse, TF.meche);
      A('tail3', 'tail2', [0, -0.115, 0], [0.046, 0.13, 0.04], [0, -0.055, 0], hair, TL.trTresse, TF.meche);
    }
    if (hs === 'chauve') { // couronne de cheveux autour du crâne (l'arrière suit la pente de la nuque)
      for (const s of [-1, 1]) A(s < 0 ? 'fringeL' : 'fringeR', 'head', [s * (halfW(6) + 0.01), rowY(6.5), -0.04], [0.03, rowH * 4.5, H * 0.52], [0, 0, 0], hair, TL.trCheveux, TF.meche);
      const t = 1 - 7 / 16, zb = H * (-0.5 * (1 + kH[1] * t - Math.max(kH[1], 0)) + kH[2] * (1 - t));
      A('fringeB', 'head', [0, rowY(6.5), zb - 0.01], [H * 0.86, rowH * 4.5, 0.03], [0, 0, 0], hair, TL.trCheveux, TF.meche, { r0: [-Math.atan2((kH[1] / 2 + kH[2]) * H, hh), 0, 0] });
    }
  }

  // ---- barbes
  if (look.beard === 'courte' || look.beard === 'longue') {
    const lg = look.beard === 'longue', bh = lg ? 0.24 : 0.105, bd = H * (lg ? 0.52 : 0.6), ytop = rowY(11.2);
    const f = lg ? TF.barbeLongue : TF.barbe, k = TR_FORMES.list[f];
    A('beard', 'head', [0, ytop - bh / 2, zf + 0.012 - bd * (0.5 * (1 - k[1]) + k[2])], [halfW(12) * 2 + 0.03, bh, bd], [0, 0, 0], hair, TL.trBarbe, f);
    A('moustache', 'head', [0, rowY(11.7), zf + 0.014], [H * 0.36, 0.026, 0.028], [0, 0, 0], hair, TL.trBarbe, TF.meche);
  } else if (look.beard === 'moustache') {
    A('beard', 'head', [0, rowY(11.7), zf + 0.014], [H * 0.5, 0.03, 0.03], [0, 0, 0], hair, TL.trBarbe, TF.meche);
  }

  // ---- coiffures (chapeaux, capuches, voiles)
  const y0 = yTop - 0.02;
  if (hat === 'paille') {
    const st = rgbf('#d8c07a');
    A('brim', 'head', [0, y0, 0], [0.52, 0.022, 0.52], [0, 0, 0], st, TL.straw);
    A('crown', 'head', [0, y0 + 0.07, -0.004], [0.31, 0.13, 0.31], [0, 0, 0], st, TL.straw, TF.calotte);
    A('band', 'head', [0, y0 + 0.024, -0.004], [0.312, 0.028, 0.312], [0, 0, 0], rgbf('#7a4a2a'), TL.cloth);
  } else if (hat === 'chapeau') {
    const hc = rgbf(look.hatCol || '#2a2624');
    A('brim', 'head', [0, y0, 0], [0.44, 0.02, 0.44], [0, 0, 0], hc, TL.cloth);
    A('crown', 'head', [0, y0 + 0.095, -0.004], [0.3, 0.18, 0.3], [0, 0, 0], hc, TL.cloth, TF.calotteH);
    A('band', 'head', [0, y0 + 0.026, -0.004], [0.304, 0.032, 0.304], [0, 0, 0], v3.scale(hc, 0.5), TL.leather);
  } else if (hat === 'casquette') {
    const hc = rgbf(look.hatCol || '#4a4640');
    A('cap', 'head', [0, yTop + 0.02, cZ], [cW + 0.014, 0.09, cD + 0.014], [0, 0, 0], hc, TL.cloth, TF.bonnet);
    A('visor', 'head', [0, yTop - 0.026, zf + 0.045], [H * 0.8, 0.016, 0.11], [0, 0, 0], v3.scale(hc, 0.85), TL.cloth, 0, { r0: [0.16, 0, 0] });
  } else if (hat === 'bonnet') {
    const hc = rgbf(look.hatCol || '#8a3a30');
    A('bonnet', 'head', [0, yTop + 0.035, cZ], [cW + 0.014, 0.14, cD + 0.014], [0, 0, 0], hc, TL.wool, TF.bonnet);
    A('bonnetB', 'head', [0, yTop - 0.036, cZ], [cW + 0.026, 0.05, cD + 0.026], [0, 0, 0], v3.scale(hc, 0.86), TL.wool);
  } else if (hood) { // capuche : une calotte qui encadre le visage (sa face avant est derrière lui) et une pointe
    const hc = rgbf(look.hatCol || look.top || '#3a3530'), Hh = yTop + 0.05 - (yChin + 0.03), Hd = H + 0.1;
    A('hoodT', 'head', [0, yChin + 0.03 + Hh / 2, zf - 0.012 - Hd / 2], [H + 0.11, Hh, Hd], [0, 0, 0], hc, TL.coat, TF.capuche);
    A('hoodP', 'hoodT', [0, Hh / 2 - 0.02, -0.03], [H * 0.78, 0.17, H * 0.8], [0, 0.085, 0], hc, TL.coat, TF.pointe, { r0: [-0.42, 0, 0] });
    A('hoodB', 'head', [0, yChin + 0.05, -(H / 2 + 0.02)], [H + 0.16, 0.3, 0.05], [0, -0.14, 0], hc, TL.coat, TF.drape, { r0: [0.18, 0, 0] });
  } else if (veil) {
    const vc = rgbf(look.hatCol || '#2a2630'), Vh = 1.04 * H + 0.05, Vd = H + 0.08;
    A('veilT', 'head', [0, yChin + Vh / 2 + 0.05, zf - 0.02 - Vd / 2], [H + 0.07, Vh, Vd], [0, 0, 0], vc, TL.cloth, TF.voile);
    A('veilB', 'head', [0, yTop - 0.03, -(H / 2 + 0.03)], [H + 0.1, 0.56, 0.035], [0, -0.27, 0], vc, TL.cloth, TF.drape, { r0: [0.1, 0, 0] });
  }

  // ---- bras en deux segments, mains en moufles
  const aW = (fem ? 0.1 : rond ? 0.135 : 0.12) * Wk, LU = 0.29 * LA, LF = 0.28 * LA, ys = tH - 0.045;
  const sx = chestAt(ys).w / 2 + aW / 2 - 0.018;
  for (const [s, L] of [[-1, 'L'], [1, 'R']]) {
    A('arm' + L, 'torso', [s * sx, ys, 0], [aW, LU + 0.05, aW + 0.01], [0, -LU / 2 + 0.015, 0], topC, clothT, TF.bras);
    A('fore' + L, 'arm' + L, [0, -LU, 0], [aW * 0.86, LF + 0.03, aW * 0.86 + 0.01], [0, -LF / 2 + 0.005, 0], topC, clothT, TF.avantBras);
    A('hand' + L, 'fore' + L, [0, -LF, 0], [(fem ? 0.06 : 0.066) * Wk, 0.12 * (dwarf ? 1.1 : 1), 0.095 * Wk], [0, -0.045, 0.008], skin, TL.trMain, TF.main);
  }

  // ---- robe (évasée), manteau (pans évasés), tablier
  let skirt = false, apronTilt = 0;
  if (dress) {
    skirt = true;
    const skH = 0.09 + hipY - 0.14, skW = (fem ? 0.66 + 0.06 * hipK : 0.52) * (dwarf ? 1.2 : 1), skD = (fem ? 0.55 + 0.04 * hipK : 0.44) * (dwarf ? 1.2 : 1);
    A('skirt', 'hips', [0, 0.09, 0], [skW, skH, skD], [0, -skH / 2, 0], botC, TL.trJupe, fem ? TF.jupe : TF.robe);
    // assis : la jupe couvre les genoux et retombe devant (cachées debout)
    A('skirtLap', 'hips', [0, 0.01, 0], [skW * 0.78, 0.24, LT + 0.08], [0, 0, LT / 2 - 0.02], botC, TL.trJupe, 0, { hide: true });
    A('skirtFall', 'hips', [0, 0.1, LT + 0.07], [skW * 0.78, hipY - 0.37, 0.05], [0, -(hipY - 0.37) / 2, 0], botC, TL.trJupe, TF.tablier, { hide: true });
    if (apronC) {
      const k = TR_FORMES.list[fem ? TF.jupe : TF.robe], L = skH * 0.86;
      const zTop = skD * 0.5 * (1 + k[1]), zBot = skD * 0.5 * (1 + k[1] * 0.14);
      apronTilt = -Math.atan2(zBot - zTop, L);
      A('apronLow', 'hips', [0, 0.07, zTop + 0.012], [skW * 0.5, L, 0.02], [0, -L / 2, 0], apronC, TL.trTablier, TF.tablier, { r0: [apronTilt, 0, 0] });
    }
  } else if (apronC) {
    const L = LT + 0.12;
    apronTilt = -0.06;
    A('apronLow', 'hips', [0, 0.08, pd / 2 + 0.02], [pw * 0.92, L, 0.02], [0, -L / 2, 0], apronC, TL.trTablier, TF.tablier, { r0: [apronTilt, 0, 0] });
  }
  if (apronC) { // assis : le tablier posé sur les genoux (caché debout)
    const w = dress ? (fem ? 0.66 : 0.52) * 0.5 : pw * 0.92;
    A('apronSit', 'hips', [0, dress ? 0.142 : 0.1, 0.02], [w, 0.02, LT + 0.02], [0, 0, LT / 2], apronC, TL.trTablier, 0, { hide: true });
  }
  if (apronC) { // bavette sur la poitrine, qui suit la pente du torse (sous la poitrine s'il y en a une)
    const ya = 0.08, yb = bust > 0.05 ? 0.33 * TH - 0.01 : tH * 0.72, ca = chestAt(ya), cb = chestAt(yb);
    A('apron', 'torso', [0, (ya + yb) / 2, (ca.zf + cb.zf) / 2 + 0.012], [cb.w * 0.62, yb - ya, 0.02], [0, 0, 0], apronC, TL.trTablier, TF.tablier, { r0: [Math.atan2(cb.zf - ca.zf, yb - ya), 0, 0] });
  }
  if (coat) { // pans évasés (la fente est peinte devant) ; assis, un rabat sur les genoux
    const L = hipY * 0.72, cw = pw + 0.2, cd = pd + 0.24, cc = v3.scale(topC, 0.96);
    A('coatTail', 'hips', [0, 0.08, -0.01], [cw, L, cd], [0, -L / 2, 0], cc, tx(TL.coat, TL.trPans), TF.pan);
    A('coatLap', 'hips', [0, 0.02, 0], [cw * 0.9, 0.22, LT + 0.06], [0, 0, LT / 2 - 0.03], cc, TL.coat, 0, { hide: true });
  }

  // ---- objet tenu (main droite), comme avant
  const held = look.held;
  if (held === 'marteau') {
    add('it0', 'handR', [0, -0.03, 0.05], [0.04, 0.04, 0.34], [0, 0, 0.12], rgbf('#8a6a44'), TL.wood);
    add('it1', 'handR', [0, -0.03, 0.3], [0.1, 0.14, 0.08], [0, 0, 0], rgbf('#5a5c62'), TL.iron);
  } else if (held === 'couperet') {
    add('it0', 'handR', [0, -0.03, 0.05], [0.04, 0.04, 0.16], [0, 0, 0.05], rgbf('#3a2a1e'), TL.wood);
    add('it1', 'handR', [0, -0.03, 0.26], [0.02, 0.2, 0.24], [0, -0.04, 0], rgbf('#9aa0a8'), TL.metal);
    add('it2', 'handR', [0.012, -0.08, 0.26], [0.01, 0.08, 0.2], [0, 0, 0], [0.5, 0.05, 0.04], TL.blood);
  } else if (held === 'canne') {
    add('it0', 'handR', [0, -0.03, 0.05], [0.025, 0.025, 1.6], [0, 0, 0.75], rgbf('#7a5a3a'), TL.wood, { r0: [-0.9, 0, 0] });
  } else if (held === 'panier') {
    add('it0', 'handL', [0, -0.12, 0.02], [0.3, 0.16, 0.22], [0, 0, 0], rgbf('#c09a60'), TL.straw);
  } else if (held === 'livre') {
    add('it0', 'handR', [0, -0.02, 0.08], [0.16, 0.2, 0.04], [0, 0, 0], rgbf('#6a2a24'), TL.leather);
  } else if (held === 'lanterne') {
    add('it0', 'handL', [0, -0.15, 0.02], [0.13, 0.18, 0.13], [0, 0, 0], [1, 0.9, 0.7], TL.glass, { fl: FX_EMIT });
  } else if (held === 'baton') {
    add('it0', 'handR', [0, -0.03, 0.02], [0.035, 1.3, 0.035], [0, 0.35, 0], rgbf('#6a4a2e'), TL.wood);
  } else if (held === 'balai') {
    add('it0', 'handR', [0, -0.03, 0.02], [0.03, 1.2, 0.03], [0, 0.2, 0], rgbf('#8a6a44'), TL.wood);
    add('it1', 'handR', [0, -0.45, 0.02], [0.18, 0.28, 0.08], [0, 0, 0], rgbf('#c8a868'), TL.straw);
  } else if (held === 'hallebarde') {
    add('it0', 'handR', [0, -0.03, 0.02], [0.04, 2.1, 0.04], [0, 0.55, 0], rgbf('#5a4a36'), TL.wood);
    add('it1', 'handR', [0, 1.55, 0.06], [0.03, 0.3, 0.16], [0, 0, 0], rgbf('#9aa0a8'), TL.metal);
  }

  const rig = new Rig(P);
  rig.kind = 'human'; rig.look = look; rig.kid = kid;
  if (Math.abs(hipY - 0.88) > 1e-3) rig.hipY = hipY;
  rig.tr = {
    LT, LS, hipY, skirt, coat, dress, fem, old, kid, dwarf, tail,
    face: { eyeY: rowY(7), mouthY: rowY(12), zf, lidW: halfW(7) * 1.64, mouthW: H * 0.26, rowH },
  };
  return rig;
}
humanRig = function (look) { return trHumanRig(look); };

// ---------------------------------------------------------------- paupières et bouche : sur la tête nouvelle
{
  const _addFace = addFace;
  addFace = function (n) {
    const F = n && n.rig && n.rig.tr && n.rig.tr.face;
    if (!F) return _addFace(n);
    if (n.faceParts || !n.rig.has('head')) return;
    n.faceParts = true;
    const skin = v3.scale(rgbf(n.look.skin || '#e0b896'), 0.93);
    n.rig = rigPlus(n.rig, [
      { name: 'paupiere', parent: 'head', p: [0, F.eyeY, F.zf + 0.004], s: [F.lidW, F.rowH * 2.6, 0.006], col: skin, tex: TL.skin, hide: true },
      { name: 'bouche', parent: 'head', p: [0, F.mouthY, F.zf + 0.004], s: [F.mouthW, F.rowH * 1.5, 0.006], col: [0.28, 0.08, 0.08], tex: TL.plain, hide: true },
    ]);
  };
}

// ---------------------------------------------------------------- poses : genoux, coudes, torsion, gestes
{
  const _pose = poseHuman;
  poseHuman = function (rig, st) {
    _pose(rig, st);
    const T = rig.tr;
    if (!T) return;
    const P = rig.parts, I = rig.idx, R = (n) => (I[n] === undefined ? null : P[I[n]].r);
    const mv = st.move || 0, ph = st.phase || 0, run = st.run ? 1 : 0, t = st.t || 0;
    const amp = (0.5 + run * 0.35) * mv, sw = Math.sin(ph) * amp;
    // jambes : pas plus court dans une robe, genou qui plie pendant le retour de la jambe
    if (T.skirt && !st.sit) { R('legL')[0] *= 0.72; R('legR')[0] *= 0.72; }
    let kL = 0.05, kR = 0.05;
    if (mv > 0.01) {
      const a = (0.75 + run * 0.85) * mv;
      kL += Math.max(0, -Math.cos(ph + 0.35)) * a;
      kR += Math.max(0, Math.cos(ph + 0.35)) * a;
    }
    if (st.sit) {
      kL = kR = 1.45;
      if (T.dwarf) P[I.hips].p[1] = 0.46; // les nains s'assoient au bord du banc, les pieds ballants
    }
    rig.set('shinL', kL, 0, 0); rig.set('shinR', kR, 0, 0);
    // coudes (négatif : l'avant-bras vient devant)
    let eL = -0.16, eR = -0.16;
    if (mv > 0.01) { eL -= Math.max(0, sw) * 0.55 + run * 1.15 * mv; eR -= Math.max(0, -sw) * 0.55 + run * 1.15 * mv; }
    if (st.work) { eR = -0.3 - Math.max(0, Math.sin(t * 7)) * 0.4; eL = -0.35; }
    if (st.wave) eR = -0.35 - (0.5 + 0.5 * Math.sin(t * 9)) * 0.45;
    if (st.fish) { eL = -0.5; eR = -0.35; }
    if (st.carry) eL = -1.3;
    if (st.reach) eL = eR = -0.1;
    if (st.cower) eL = eR = -1.9;
    if (st.attack) eR = -0.15;
    if (st.talk && !st.work && !st.wave && !st.fish && !st.cross && !st.pray && !mv) eR -= 0.18 + 0.2 * Math.sin(t * 2.3);
    if (st.pale) eL = eR = 0;
    if (st.cross) {
      rig.set('armL', -0.3, 0, 0.16); rig.set('armR', -0.28, 0, -0.16);
      rig.set('foreL', -1.3, 1.2, 0); rig.set('foreR', -1.16, -1.2, 0);
    } else if (st.pray) {
      rig.set('armL', -0.42, 0, 0.12); rig.set('armR', -0.42, 0, -0.12);
      rig.set('foreL', -1.6, 0.62, 0); rig.set('foreR', -1.6, -0.62, 0);
    } else {
      if (st.sit && !st.carry && !st.fish && !st.work) { rig.set('armL', -0.36, 0, 0.05); rig.set('armR', -0.36, 0, -0.05); eL = eR = -0.78; }
      rig.set('foreL', eL, 0, 0); rig.set('foreR', eR, 0, 0);
    }
    // torsion du buste et du bassin à la marche ; les vieux se voûtent un peu
    if (mv > 0.01) { R('torso')[1] = -sw * 0.14; rig.set('pelvis', 0, sw * 0.1, 0); } else rig.set('pelvis', 0, 0, 0);
    if (T.old && !st.sit) { R('torso')[0] += 0.08; R('head')[0] -= 0.06; }
    // robe : assis, elle couvre les genoux ; tablier posé sur les genoux
    if (T.skirt) {
      P[I.skirt].hide = !!st.sit; P[I.skirtLap].hide = P[I.skirtFall].hide = !st.sit;
      if (!st.sit) rig.set('skirt', 0, sw * 0.08, 0);
    }
    if (I.apronLow !== undefined) { P[I.apronLow].hide = !!st.sit; P[I.apronSit].hide = !st.sit; }
    if (T.coat) { P[I.coatTail].hide = !!st.sit; P[I.coatLap].hide = !st.sit; if (!st.sit) { R('legL')[0] *= 0.82; R('legR')[0] *= 0.82; } }
    // queue de cheval : elle balance, et vole derrière à la course
    if (T.tail) {
      rig.set('tail', 0.1 + run * 0.55 * mv + Math.abs(sw) * 0.25 + Math.sin(t * 1.3) * 0.03, 0, Math.sin(ph) * 0.1 * mv);
      rig.set('tail2', 0.06 + run * 0.18 * mv, 0, Math.sin(ph - 0.6) * 0.08 * mv);
      rig.set('tail3', 0.05, 0, 0);
    }
  };
}

// ---------------------------------------------------------------- silhouettes pâles : membres effilés en pointe
{
  const _pale = paleRig;
  paleRig = function (tall) {
    const r = _pale(tall), S = { legL: TF.membrePale, legR: TF.membrePale, armL: TF.membrePale, armR: TF.membrePale, torso: TF.torseH, head: TF.tetePale };
    for (const q of r.parts) if (S[q.name]) q.shp = S[q.name];
    return r;
  };
}
