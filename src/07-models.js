// ============================================================================
//  MODÈLES 3D (boîtes articulées façon 1998) : habitants, animaux, objets
// ============================================================================

// ---------------------------------------------------------------- matrices 3x4 (lignes)
const M34_ID = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0]);
function m34Mul(out, A, B) {
  for (let r = 0; r < 3; r++) {
    const a0 = A[r * 4], a1 = A[r * 4 + 1], a2 = A[r * 4 + 2], a3 = A[r * 4 + 3];
    out[r * 4] = a0 * B[0] + a1 * B[4] + a2 * B[8];
    out[r * 4 + 1] = a0 * B[1] + a1 * B[5] + a2 * B[9];
    out[r * 4 + 2] = a0 * B[2] + a1 * B[6] + a2 * B[10];
    out[r * 4 + 3] = a0 * B[3] + a1 * B[7] + a2 * B[11] + a3;
  }
  return out;
}
// R = Ry * Rx * Rz, puis translation
function m34TR(out, tx, ty, tz, rx, ry, rz) {
  const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry), cz = Math.cos(rz), sz = Math.sin(rz);
  out[0] = cy * cz + sy * sx * sz; out[1] = -cy * sz + sy * sx * cz; out[2] = sy * cx; out[3] = tx;
  out[4] = cx * sz; out[5] = cx * cz; out[6] = -sx; out[7] = ty;
  out[8] = -sy * cz + cy * sx * sz; out[9] = sy * sz + cy * sx * cz; out[10] = cy * cx; out[11] = tz;
  return out;
}
function m34Root(out, x, y, z, heading, s) {
  const c = Math.cos(heading) * s, n = Math.sin(heading) * s;
  out[0] = c; out[1] = 0; out[2] = n; out[3] = x;
  out[4] = 0; out[5] = s; out[6] = 0; out[7] = y;
  out[8] = -n; out[9] = 0; out[10] = c; out[11] = z;
  return out;
}
const _mT = new Float32Array(12), _mT2 = new Float32Array(12);

// ---------------------------------------------------------------- tampon d'instances (16 flottants par boîte)
class InstBuf {
  constructor(cap) { this.cap = cap; this.data = new Float32Array(cap * 16); this.n = 0; }
  reset() { this.n = 0; }
  // M = W * T(o) * S(s)
  box(W, ox, oy, oz, sx, sy, sz, col, code) {
    if (this.n >= this.cap) { const d = new Float32Array(this.cap * 32); d.set(this.data); this.data = d; this.cap *= 2; }
    const D = this.data, k = this.n * 16;
    for (let r = 0; r < 3; r++) {
      const a0 = W[r * 4], a1 = W[r * 4 + 1], a2 = W[r * 4 + 2];
      D[k + r * 4] = a0 * sx; D[k + r * 4 + 1] = a1 * sy; D[k + r * 4 + 2] = a2 * sz;
      D[k + r * 4 + 3] = a0 * ox + a1 * oy + a2 * oz + W[r * 4 + 3];
    }
    D[k + 12] = col[0]; D[k + 13] = col[1]; D[k + 14] = col[2]; D[k + 15] = code;
    this.n++;
  }
}

// Codes de texture : tuile de côté | tuile de face << 8 | drapeaux << 16 ; matériau : -(couche + 1) - 128 * drapeaux
const FX_EMIT = 1, FX_HI = 2;
const tx = (side, front) => side | ((front ?? side) << 8);
const mt = (layer) => -(layer + 1);
function withFlags(code, fl) {
  if (!fl) return code;
  if (code < 0) return code - 128 * fl;
  return code | (fl << 16);
}
const rgbf = (h) => { const c = hexToRgb(h); return [c[0] / 255, c[1] / 255, c[2] / 255]; };
const WHITE = [1, 1, 1];

// ---------------------------------------------------------------- atlas des « peaux » (tuiles 16 px)
const TL = {
  plain: 0, cloth: 1, wool: 2, fur: 3, skin: 4, hair: 5, wood: 6, straw: 7, leather: 8, metal: 9,
  face: 10, faceF: 11, faceOld: 12, faceKid: 13, faceMan: 14, mask: 15, sack: 16, cowF: 17, sheepF: 18, pigF: 19,
  horseF: 20, dogF: 21, deerF: 22, henF: 23, rabbitF: 24, foxF: 25, wolfF: 26, boarF: 27, crowF: 28, catF: 29,
  paleF: 30, blankF: 31, spots: 32, plaid: 33, shirt: 34, stripes: 35, paper: 36, stone: 37, leaves: 38, glass: 39,
  gold: 40, scales: 41, pumpkin: 42, flame: 43, brick: 44, hay: 45, chest: 46, barrel: 47, flowers: 48, comb: 49,
  sign: 50, coat: 51, bread: 52, soil: 53, soilWet: 54, wheat: 55, bark: 56, jack: 57, blood: 58, cabbage: 59,
  corn: 60, carrotTop: 61, darkwood: 62, rope: 63, terracotta: 64, blanket: 65, pillow: 66, iron: 67, coal: 68,
  ember: 69, book: 70, cloth2: 71, fish: 72, eye: 73, stagF: 74, doll: 75, bone: 76,
};
const SKIN = { canvas: null };

function buildSkinAtlas() {
  const S = 256, pb = new PixelBuf(S, S);
  const T = (idx, fn) => {
    const ox = (idx % 16) * 16, oy = Math.floor(idx / 16) * 16;
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const c = fn(x, y);
      pb.set(ox + x, oy + y, [clamp(c[0], 0, 255), clamp(c[1], 0, 255), clamp(c[2], 0, 255)]);
    }
  };
  const n = (x, y, s) => hash2i(x, y, s);
  const g = (v) => [v, v, v];
  const mul = (c, k) => [c[0] * k, c[1] * k, c[2] * k];
  T(TL.plain, (x, y) => g(236 + n(x, y, 1) * 16));
  T(TL.cloth, (x, y) => g(222 + ((x + y) & 1 ? -14 : 0) + n(x, y, 2) * 16));
  T(TL.cloth2, (x, y) => g(214 + (x % 4 === 0 ? -22 : 0) + n(x, y, 22) * 18));
  T(TL.wool, (x, y) => g(200 + n(x >> 1, y >> 1, 3) * 46 - ((x * 3 + y * 5) % 7 === 0 ? 26 : 0)));
  T(TL.fur, (x, y) => g(206 + n(x, y >> 2, 4) * 44));
  T(TL.skin, (x, y) => g(246 - n(x, y, 5) * 10));
  T(TL.hair, (x, y) => g(168 + n(x, y >> 3, 6) * 82));
  T(TL.wood, (x, y) => { const v = 0.75 + n(x >> 2, y, 7) * 0.2 + (y % 5 === 0 ? -0.18 : 0); return mul([150, 104, 64], v); });
  T(TL.darkwood, (x, y) => { const v = 0.75 + n(x >> 2, y, 77) * 0.2 + (y % 6 === 0 ? -0.2 : 0); return mul([92, 62, 40], v); });
  T(TL.bark, (x, y) => mul([96, 72, 50], 0.7 + n(x, y >> 2, 78) * 0.4 - (x % 5 === 0 ? 0.15 : 0)));
  T(TL.straw, (x, y) => mul([222, 186, 100], 0.72 + n(x, y >> 1, 8) * 0.35));
  T(TL.hay, (x, y) => mul([214, 184, 96], 0.7 + n(x >> 1, y, 45) * 0.38 - ((x + y) % 9 === 0 ? 0.2 : 0)));
  T(TL.wheat, (x, y) => mul([230, 196, 96], 0.66 + n(x, y >> 2, 55) * 0.4 - (x % 3 === 0 ? 0.2 : 0)));
  T(TL.leather, (x, y) => mul([128, 84, 50], 0.8 + n(x, y, 9) * 0.25));
  T(TL.metal, (x, y) => g(150 + n(x, y, 10) * 40 + (y < 2 ? 40 : 0)));
  T(TL.iron, (x, y) => mul([110, 112, 120], 0.8 + n(x, y, 67) * 0.35));
  T(TL.stone, (x, y) => g(128 + n(x >> 1, y >> 1, 37) * 60 - ((x % 8 === 0 || y % 8 === 0) ? 30 : 0)));
  T(TL.brick, (x, y) => (y % 4 === 3 || (x + (y >> 2) * 4) % 8 === 0 ? [150, 140, 128] : mul([160, 70, 50], 0.85 + n(x, y, 44) * 0.25)));
  T(TL.leaves, (x, y) => mul([70, 120, 50], 0.6 + n(x >> 1, y >> 1, 38) * 0.6));
  T(TL.glass, (x, y) => (x === 0 || y === 0 || x === 15 || y === 15 || x === 8 ? [60, 50, 40] : [255, 220, 140]));
  T(TL.gold, (x, y) => mul([240, 200, 80], 0.75 + n(x, y, 40) * 0.35));
  T(TL.scales, (x, y) => mul([170, 186, 176], 0.75 + (((x + (y & 2)) >> 1) % 2) * 0.15 + n(x, y, 41) * 0.2));
  T(TL.fish, (x, y) => mul([150, 170, 160], 0.7 + (y < 6 ? -0.15 : 0.2) + n(x, y, 72) * 0.2));
  T(TL.pumpkin, (x, y) => mul([230, 120, 30], 0.75 + (x % 4 === 0 ? -0.25 : 0) + n(x, y, 42) * 0.2));
  T(TL.jack, (x, y) => {
    const eye = (y >= 4 && y <= 6 && ((x >= 3 && x <= 5) || (x >= 10 && x <= 12)));
    const mouth = y >= 10 && y <= 11 && x >= 3 && x <= 12 && !((x === 6 || x === 9) && y === 10);
    return eye || mouth ? [255, 200, 70] : mul([230, 120, 30], 0.75 + (x % 4 === 0 ? -0.25 : 0));
  });
  T(TL.flame, (x, y) => mul([255, 190, 80], 0.8 + n(x, y, 43) * 0.3));
  T(TL.ember, (x, y) => (n(x, y, 69) > 0.6 ? [255, 150, 50] : [120, 40, 20]));
  T(TL.coal, (x, y) => g(30 + n(x >> 1, y >> 1, 68) * 40));
  T(TL.chest, (x, y) => {
    if (y === 5 || y === 6) return [70, 70, 76];
    if (x >= 7 && x <= 8 && y >= 4 && y <= 8) return [200, 170, 60];
    return mul([150, 104, 64], 0.75 + n(x >> 2, y, 46) * 0.2 + (y % 4 === 0 ? -0.15 : 0));
  });
  T(TL.barrel, (x, y) => (y === 2 || y === 13 ? [70, 70, 76] : mul([140, 96, 58], 0.75 + (x % 4 === 0 ? -0.2 : 0) + n(x, y, 47) * 0.2)));
  T(TL.flowers, (x, y) => {
    const h = n(x >> 1, y >> 1, 48);
    if (h > 0.8) return [230, 70, 70]; if (h > 0.72) return [240, 220, 80]; if (h > 0.66) return [150, 110, 220];
    return mul([60, 110, 45], 0.7 + n(x, y, 49) * 0.4);
  });
  T(TL.comb, (x, y) => (((x + (y % 2) * 2) % 4 === 0 || y % 3 === 0) ? [160, 110, 30] : [240, 190, 60]));
  T(TL.sign, (x, y) => ((y === 5 || y === 9) && x > 2 && x < 13 && n(x, y, 50) > 0.25 ? [50, 34, 24] : mul([170, 124, 80], 0.8 + n(x >> 2, y, 51) * 0.2)));
  T(TL.coat, (x, y) => g(46 + n(x, y, 51) * 18));
  T(TL.bread, (x, y) => mul([196, 136, 70], 0.8 + n(x, y, 52) * 0.3 - (x % 5 === 0 && y > 3 ? 0.2 : 0)));
  T(TL.soil, (x, y) => mul([96, 68, 44], 0.7 + n(x, y, 53) * 0.3 - (x % 4 === 0 ? 0.22 : 0)));
  T(TL.soilWet, (x, y) => mul([60, 42, 30], 0.7 + n(x, y, 54) * 0.3 - (x % 4 === 0 ? 0.22 : 0)));
  T(TL.cabbage, (x, y) => mul([120, 180, 90], 0.65 + n(x >> 1, y >> 1, 59) * 0.3 + ((x - 8) * (x - 8) + (y - 8) * (y - 8) < 16 ? 0.15 : 0)));
  T(TL.corn, (x, y) => (((x + y) & 1) ? [240, 200, 60] : [220, 170, 40]));
  T(TL.carrotTop, (x, y) => mul([80, 150, 60], 0.6 + n(x, y >> 1, 61) * 0.45));
  T(TL.rope, (x, y) => mul([180, 150, 100], 0.75 + (((x + y) % 4) < 2 ? 0.15 : 0)));
  T(TL.terracotta, (x, y) => mul([190, 100, 60], 0.8 + n(x, y, 64) * 0.2 - (y === 2 ? 0.2 : 0)));
  T(TL.blanket, (x, y) => (((x >> 2) + (y >> 2)) % 2 ? g(250) : g(200)));
  T(TL.pillow, (x, y) => g(240 - n(x, y, 66) * 16));
  T(TL.book, (x, y) => (x % 3 === 2 ? [40, 30, 20] : mul([[150, 50, 40], [60, 90, 140], [70, 120, 60], [150, 120, 60]][(x / 3 | 0) % 4], 0.8 + n(x, y, 70) * 0.2)));
  T(TL.paper, (x, y) => ((y % 3 === 2 && x > 1 && x < 14 && n(x, y, 36) > 0.3) ? [90, 80, 70] : [236, 228, 204]));
  T(TL.plaid, (x, y) => mul((x % 6 < 2 || y % 6 < 2) ? [150, 50, 40] : [200, 170, 120], 0.85 + n(x, y, 33) * 0.2));
  T(TL.stripes, (x, y) => g(x % 4 < 2 ? 238 : 190));
  T(TL.shirt, (x, y) => (x >= 7 && x <= 8 ? g(200) : (x === 9 && y % 4 === 1 ? g(120) : g(226 + n(x, y, 34) * 12))));
  T(TL.spots, (x, y) => (n(x >> 2, y >> 2, 32) > 0.62 ? g(34) : g(242)));
  T(TL.blood, (x, y) => mul([120, 12, 10], 0.7 + n(x, y, 58) * 0.4));
  T(TL.bone, (x, y) => mul([220, 210, 180], 0.8 + n(x, y, 76) * 0.2));
  T(TL.eye, (x, y) => (Math.hypot(x - 7.5, y - 7.5) < 4 ? [255, 250, 240] : [20, 10, 10]));
  // visages (blancs : multipliés par la couleur de peau)
  const face = (kind) => (x, y) => {
    let c = g(246);
    if (kind === 'kid') {
      if (y >= 6 && y <= 8 && (x === 4 || x === 5 || x === 10 || x === 11)) c = (x === 5 || x === 10) && y >= 7 ? g(30) : g(255);
      if (y === 12 && x >= 7 && x <= 8) c = [190, 110, 110];
      if (y === 10 && (x === 3 || x === 12)) c = [255, 205, 205];
      return c;
    }
    if (y === 5 && ((x >= 3 && x <= 5) || (x >= 10 && x <= 12))) c = kind === 'old' ? g(210) : g(110);
    if (y === 7 && (x === 4 || x === 11)) c = g(255);
    if (y === 7 && (x === 5 || x === 10)) c = g(25);
    if (kind === 'f' && y === 6 && (x === 4 || x === 5 || x === 10 || x === 11)) c = g(40);
    if ((y === 9 || y === 10) && (x === 7 || x === 8)) c = g(216);
    if (y === 12 && x >= 6 && x <= 9) c = kind === 'f' ? [200, 90, 90] : [170, 100, 96];
    if (kind === 'old' && (y === 3 || y === 11) && (x === 3 || x === 4 || x === 11 || x === 12)) c = g(200);
    if (kind === 'man' && y >= 11 && y <= 14 && x >= 3 && x <= 12 && n(x, y, 14) > 0.4 && !(y === 12 && x >= 6 && x <= 9)) c = g(196);
    return c;
  };
  T(TL.face, face('m')); T(TL.faceF, face('f')); T(TL.faceOld, face('old')); T(TL.faceKid, face('kid')); T(TL.faceMan, face('man'));
  T(TL.mask, (x, y) => {
    let c = mul([236, 230, 214], 0.9 + n(x, y, 15) * 0.1);
    if ((y === 6 || y === 7) && (x === 4 || x === 5 || x === 10 || x === 11)) c = g(8);
    if (y === 12 && x >= 4 && x <= 11) c = x % 2 ? g(40) : g(180);
    if (n(x >> 1, y >> 1, 115) > 0.88 && y > 8) c = [110, 20, 16];
    return c;
  });
  T(TL.sack, (x, y) => {
    let c = mul([196, 164, 112], 0.8 + n(x, y, 16) * 0.25 - ((x + y) % 2 ? 0.05 : 0));
    const X = (cx, cy) => (Math.abs(x - cx) === Math.abs(y - cy) && Math.abs(x - cx) <= 1);
    if (X(4, 6) || X(11, 6)) c = g(30);
    if (y === 11 && x >= 3 && x <= 12 && (x + 1) % 2) c = g(40);
    if (y === 10 && (x === 3 || x === 12)) c = g(40);
    return c;
  });
  T(TL.paleF, (x, y) => {
    let c = g(250);
    if (y >= 5 && y <= 8 && ((x >= 3 && x <= 5) || (x >= 10 && x <= 12))) c = g(0);
    if (y >= 11 && y <= 14 && x >= 6 && x <= 9) c = g(0);
    return c;
  });
  T(TL.blankF, (x, y) => g(244 - (y === 7 && (x === 5 || x === 10) ? 6 : 0)));
  T(TL.doll, (x, y) => {
    let c = g(250);
    if (y === 6 && (x === 5 || x === 10)) c = g(10);
    if (y === 11 && x >= 7 && x <= 8) c = [200, 60, 60];
    if (y === 8 && (x === 4 || x === 11)) c = [255, 180, 190];
    return c;
  });
  const animalFace = (eyeY, eyes, extra) => (x, y) => {
    let c = g(240 - n(x, y, 17) * 14);
    if (y === eyeY && eyes.includes(x)) c = g(20);
    if (extra) { const e = extra(x, y); if (e) c = e; }
    return c;
  };
  T(TL.cowF, animalFace(5, [2, 13], (x, y) => (y >= 11 && ((x >= 3 && x <= 5) || (x >= 10 && x <= 12)) ? [60, 40, 40] : y >= 10 ? [250, 200, 200] : null)));
  T(TL.sheepF, animalFace(6, [3, 12], (x, y) => (y >= 12 && x >= 6 && x <= 9 ? g(60) : null)));
  T(TL.pigF, animalFace(5, [4, 11], null));
  T(TL.horseF, animalFace(4, [1, 14], (x, y) => (y >= 12 && (x === 5 || x === 10) ? g(40) : null)));
  T(TL.dogF, animalFace(6, [4, 11], (x, y) => (y >= 12 && x >= 7 && x <= 8 ? g(20) : null)));
  T(TL.catF, animalFace(7, [4, 11], (x, y) => (y === 11 && x >= 7 && x <= 8 ? [250, 160, 170] : null)));
  T(TL.deerF, animalFace(5, [2, 13], (x, y) => (y >= 13 && x >= 6 && x <= 9 ? g(30) : null)));
  T(TL.stagF, (x, y) => (y === 5 && (x === 2 || x === 13) ? [255, 60, 40] : g(250)));
  T(TL.henF, animalFace(6, [3, 12], null));
  T(TL.rabbitF, animalFace(6, [3, 12], (x, y) => (y === 11 && x >= 7 && x <= 8 ? [240, 150, 160] : null)));
  T(TL.foxF, animalFace(6, [4, 11], (x, y) => (y >= 10 ? g(255) : null)));
  T(TL.wolfF, (x, y) => (y === 6 && (x === 4 || x === 11) ? [255, 230, 120] : g(236 - n(x, y, 26) * 20)));
  T(TL.boarF, animalFace(5, [3, 12], null));
  T(TL.crowF, animalFace(6, [2, 13], null));
  SKIN.canvas = pb.canvas();
}

// ---------------------------------------------------------------- squelettes articulés
// partie : { name, parent, p:[pivot], s:[taille] | null, o:[décalage de la boîte], col, tex }
class Rig {
  constructor(parts) {
    this.parts = parts;
    this.idx = {};
    parts.forEach((q, i) => {
      this.idx[q.name] = i;
      q.pi = typeof q.parent === 'string' ? this.idx[q.parent] : -1;
      q.r = q.r0 ? q.r0.slice() : [0, 0, 0];
      q.W = new Float32Array(12);
    });
  }
  set(name, rx, ry, rz) {
    const i = this.idx[name];
    if (i === undefined) return;
    const r = this.parts[i].r; r[0] = rx || 0; r[1] = ry || 0; r[2] = rz || 0;
  }
  has(name) { return this.idx[name] !== undefined; }
  part(name) { return this.parts[this.idx[name]]; }
  emit(buf, root, flags) {
    for (const q of this.parts) {
      m34TR(_mT, q.p[0], q.p[1], q.p[2], q.r[0], q.r[1], q.r[2]);
      m34Mul(q.W, q.pi < 0 ? root : this.parts[q.pi].W, _mT);
      if (!q.s || q.hide) continue;
      buf.box(q.W, q.o[0], q.o[1], q.o[2], q.s[0], q.s[1], q.s[2], q.col, withFlags(q.tex, (q.fl || 0) | flags));
    }
  }
}
// Copie d'un squelette avec des parties en plus
function rigPlus(r, extra) {
  const u = r.parts.map((q) => ({ name: q.name, parent: q.parent, p: q.p, s: q.s, o: q.o, col: q.col, tex: q.tex, fl: q.fl, hide: q.hide, r0: q.r0 }));
  for (const e of extra) u.push(Object.assign({ o: [0, 0, 0] }, e));
  const rr = new Rig(u); rr.kind = r.kind; rr.cfg = r.cfg;
  return rr;
}
function rigParts() {
  const P = [];
  const add = (name, parent, p, s, o, col, tex, extra) => { const q = { name, parent, p, s, o: o || [0, 0, 0], col: col || WHITE, tex: tex ?? 0 }; if (extra) Object.assign(q, extra); P.push(q); return q; };
  return { P, add };
}

// ---------------------------------------------------------------- humains
// look : { skin, hair, hairStyle, beard, hat, top, bottom, dress, apron, height, build, face?, held?, coat? }
function humanRig(look) {
  const { P, add } = rigParts();
  const skin = rgbf(look.skin || '#e0b896'), hair = rgbf(look.hair || '#4a3020'), top = rgbf(look.top || '#6a5a48');
  const bot = rgbf(look.bottom || '#4a3c30'), shoe = rgbf(look.shoe || '#2a2018');
  const b = look.build || 'normal', tw = b === 'rond' ? 0.5 : b === 'mince' ? 0.37 : 0.43, td = b === 'rond' ? 0.3 : b === 'mince' ? 0.2 : 0.23;
  const kid = (look.height || 1) < 0.8;
  const faceT = look.face ?? (kid ? TL.faceKid : look.old ? TL.faceOld : look.dress ? TL.faceF : look.beard ? TL.faceMan : TL.face);
  const head = kid ? 0.31 : 0.27;
  add('hips', null, [0, 0.88, 0], null);
  add('legL', 'hips', [-0.1, 0, 0], [0.15, 0.86, 0.17], [0, -0.43, 0], bot, TL.cloth);
  add('legR', 'hips', [0.1, 0, 0], [0.15, 0.86, 0.17], [0, -0.43, 0], bot, TL.cloth);
  add('shoeL', 'legL', [0, -0.84, 0.03], [0.16, 0.08, 0.25], [0, 0, 0], shoe, TL.leather);
  add('shoeR', 'legR', [0, -0.84, 0.03], [0.16, 0.08, 0.25], [0, 0, 0], shoe, TL.leather);
  add('torso', 'hips', [0, 0, 0], [tw, 0.62, td], [0, 0.31, 0], top, tx(look.coat ? TL.coat : TL.cloth, look.coat ? TL.coat : TL.shirt));
  if (look.dress) add('skirt', 'hips', [0, 0.05, 0], [tw + 0.1, 0.72, td + 0.16], [0, -0.33, 0], bot, TL.cloth2);
  if (look.coat) add('coatTail', 'hips', [0, 0.05, 0], [tw + 0.06, 0.8, td + 0.1], [0, -0.38, 0], top, TL.coat);
  if (look.apron) add('apron', 'torso', [0, 0.02, td / 2 + 0.012], [tw * 0.78, 0.82, 0.02], [0, -0.05, 0], rgbf(look.apron), TL.cloth);
  add('neck', 'torso', [0, 0.62, 0], [0.12, 0.05, 0.12], [0, 0.02, 0], skin, TL.skin);
  add('head', 'neck', [0, 0.04, 0], [head, head * 1.04, head], [0, head * 0.52, 0], skin, tx(TL.skin, faceT));
  const H = head, hy = head * 0.52; // centre de la tête (repère de la tête)
  add('nose', 'head', [0, hy - 0.02, H / 2 + 0.015], [0.05, 0.06, 0.035], [0, 0, 0], v3.scale(skin, 0.92), TL.skin);
  const hs = look.hairStyle || 'court';
  if (hs !== 'chauve' && !look.hood) {
    add('hairTop', 'head', [0, hy + H * 0.52, 0], [H + 0.025, 0.06, H + 0.025], [0, 0, 0], hair, TL.hair);
    const backH = hs === 'long' ? 0.42 : hs === 'boucle' ? 0.26 : 0.18;
    add('hairBack', 'head', [0, hy + H * 0.52, -H / 2 - 0.012], [H + 0.025, backH, 0.05], [0, -backH / 2, 0], hair, TL.hair);
    add('hairSideL', 'head', [-H / 2 - 0.012, hy + H * 0.52, -0.03], [0.04, hs === 'long' ? 0.3 : 0.12, H * 0.7], [0, hs === 'long' ? -0.15 : -0.06, 0], hair, TL.hair);
    add('hairSideR', 'head', [H / 2 + 0.012, hy + H * 0.52, -0.03], [0.04, hs === 'long' ? 0.3 : 0.12, H * 0.7], [0, hs === 'long' ? -0.15 : -0.06, 0], hair, TL.hair);
    if (hs === 'chignon') add('bun', 'head', [0, hy + H * 0.45, -H / 2 - 0.05], [0.13, 0.13, 0.11], [0, 0, 0], hair, TL.hair);
    if (hs === 'queue') add('tail', 'head', [0, hy + H * 0.3, -H / 2 - 0.04], [0.07, 0.28, 0.06], [0, -0.12, 0], hair, TL.hair);
    if (hs === 'boucle') add('curls', 'head', [0, hy + H * 0.56, 0], [H + 0.07, 0.08, H + 0.07], [0, 0, 0], hair, TL.wool);
  } else if (hs === 'chauve') {
    add('fringeL', 'head', [-H / 2 - 0.01, hy + 0.02, -0.03], [0.03, 0.1, H * 0.6], [0, 0, 0], hair, TL.hair);
    add('fringeR', 'head', [H / 2 + 0.01, hy + 0.02, -0.03], [0.03, 0.1, H * 0.6], [0, 0, 0], hair, TL.hair);
  }
  if (look.beard === 'courte') add('beard', 'head', [0, hy - H * 0.3, H / 2 + 0.01], [H * 0.85, 0.1, 0.05], [0, 0, 0], hair, TL.hair);
  if (look.beard === 'longue') add('beard', 'head', [0, hy - H * 0.3, H / 2 + 0.015], [H * 0.85, 0.26, 0.06], [0, -0.07, 0], hair, TL.hair);
  if (look.beard === 'moustache') add('beard', 'head', [0, hy - 0.055, H / 2 + 0.02], [0.15, 0.035, 0.03], [0, 0, 0], hair, TL.hair);
  const hat = look.hat;
  const top0 = hy + H * 0.52 + 0.03;
  if (hat === 'paille') {
    add('brim', 'head', [0, top0, 0], [0.5, 0.03, 0.5], [0, 0, 0], rgbf('#d8c07a'), TL.straw);
    add('crown', 'head', [0, top0 + 0.06, 0], [0.28, 0.1, 0.28], [0, 0, 0], rgbf('#d8c07a'), TL.straw);
  } else if (hat === 'casquette') {
    add('cap', 'head', [0, top0 + 0.01, 0], [H + 0.03, 0.07, H + 0.03], [0, 0, 0], rgbf(look.hatCol || '#4a4640'), TL.cloth);
    add('visor', 'head', [0, top0 - 0.02, H / 2 + 0.06], [H * 0.9, 0.02, 0.12], [0, 0, 0], rgbf(look.hatCol || '#4a4640'), TL.cloth);
  } else if (hat === 'bonnet') {
    add('bonnet', 'head', [0, top0 + 0.02, -0.01], [H + 0.04, 0.13, H + 0.04], [0, 0, 0], rgbf(look.hatCol || '#8a3a30'), TL.wool);
  } else if (hat === 'chapeau') {
    add('brim', 'head', [0, top0, 0], [0.44, 0.025, 0.44], [0, 0, 0], rgbf(look.hatCol || '#2a2624'), TL.cloth);
    add('crown', 'head', [0, top0 + 0.09, 0], [0.27, 0.16, 0.27], [0, 0, 0], rgbf(look.hatCol || '#2a2624'), TL.cloth);
  } else if (hat === 'capuche' || look.hood) {
    const hc = rgbf(look.hatCol || look.top || '#3a3530');
    add('hoodT', 'head', [0, top0 - 0.005, -0.01], [H + 0.07, 0.05, H + 0.08], [0, 0, 0], hc, TL.coat);
    add('hoodB', 'head', [0, hy, -H / 2 - 0.04], [H + 0.07, H + 0.1, 0.05], [0, 0, 0], hc, TL.coat);
    add('hoodL', 'head', [-H / 2 - 0.035, hy, 0], [0.04, H + 0.08, H + 0.06], [0, 0, 0], hc, TL.coat);
    add('hoodR', 'head', [H / 2 + 0.035, hy, 0], [0.04, H + 0.08, H + 0.06], [0, 0, 0], hc, TL.coat);
  } else if (hat === 'voile') {
    const vc = rgbf(look.hatCol || '#2a2630');
    add('veilT', 'head', [0, top0 - 0.01, -0.01], [H + 0.05, 0.04, H + 0.06], [0, 0, 0], vc, TL.cloth);
    add('veilB', 'head', [0, hy - 0.05, -H / 2 - 0.035], [H + 0.08, H + 0.3, 0.04], [0, 0, 0], vc, TL.cloth);
  }
  const armW = kid ? 0.11 : 0.12;
  add('armL', 'torso', [-(tw / 2 + armW / 2 + 0.005), 0.58, 0], [armW, 0.6, 0.13], [0, -0.28, 0], top, TL.cloth);
  add('armR', 'torso', [tw / 2 + armW / 2 + 0.005, 0.58, 0], [armW, 0.6, 0.13], [0, -0.28, 0], top, TL.cloth);
  add('handL', 'armL', [0, -0.6, 0], [0.1, 0.1, 0.11], [0, -0.02, 0], skin, TL.skin);
  add('handR', 'armR', [0, -0.6, 0], [0.1, 0.1, 0.11], [0, -0.02, 0], skin, TL.skin);
  // objet tenu (main droite)
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
  return rig;
}

// Entité étrange : longue silhouette pâle (ou très grande pour le Veilleur)
function paleRig(tall) {
  const { P, add } = rigParts();
  const c = tall ? [0.1, 0.1, 0.12] : [0.93, 0.92, 0.9];
  const L = tall ? 2.2 : 1.2;
  add('hips', null, [0, L, 0], null);
  add('legL', 'hips', [-0.08, 0, 0], [0.09, L, 0.1], [0, -L / 2, 0], c, TL.skin);
  add('legR', 'hips', [0.08, 0, 0], [0.09, L, 0.1], [0, -L / 2, 0], c, TL.skin);
  add('torso', 'hips', [0, 0, 0], [0.3, L * 0.62, 0.16], [0, L * 0.31, 0], c, TL.skin);
  add('neck', 'torso', [0, L * 0.62, 0], [0.07, 0.14, 0.07], [0, 0.07, 0], c, TL.skin);
  add('head', 'neck', [0, 0.13, 0], [0.22, 0.3, 0.22], [0, 0.15, 0], c, tx(TL.skin, tall ? TL.eye : TL.paleF), tall ? { fl: 0 } : null);
  add('armL', 'torso', [-0.19, L * 0.6, 0], [0.07, L * 0.95, 0.08], [0, -L * 0.47, 0], c, TL.skin);
  add('armR', 'torso', [0.19, L * 0.6, 0], [0.07, L * 0.95, 0.08], [0, -L * 0.47, 0], c, TL.skin);
  const r = new Rig(P); r.kind = 'human'; r.pale = true;
  return r;
}

// ---------------------------------------------------------------- animaux (avant = +z)
function quadRig(o) {
  const { P, add } = rigParts();
  const c = o.col, c2 = o.col2 || c, dark = o.dark || v3.scale(c, 0.35);
  add('body', null, [0, o.bodyY, 0], o.body, [0, 0, 0], c, o.bodyTex ?? TL.fur);
  const [lw, lh] = o.leg, lx = o.body[0] / 2 - lw / 2 - 0.01, lz = o.body[2] / 2 - lw / 2 - (o.legIn || 0.06);
  const ly = -o.body[1] / 2 + 0.06;
  for (const [n, sx, sz] of [['legFL', -1, 1], ['legFR', 1, 1], ['legBL', -1, -1], ['legBR', 1, -1]]) {
    add(n, 'body', [sx * lx, ly, sz * lz], [lw, lh, lw * (o.legD || 1)], [0, -lh / 2, 0], o.legCol || c2, o.legTex ?? o.bodyTex ?? TL.fur);
    if (o.hoof) add(n + 'h', n, [0, -lh + 0.03, 0.01], [lw + 0.01, 0.07, lw * (o.legD || 1) + 0.02], [0, 0, 0], dark, TL.leather);
  }
  add('neck', 'body', [0, o.neck[1], o.body[2] / 2 - 0.05], o.neckS || null, o.neckO || [0, 0, 0], c, o.bodyTex ?? TL.fur);
  add('head', 'neck', o.headP || [0, 0, 0.02], o.head, [0, 0, o.head[2] / 2], o.headCol || c, tx(o.headTex ?? TL.fur, o.face));
  if (o.snout) add('snout', 'head', [0, o.snout[3] || -o.head[1] * 0.18, o.head[2]], [o.snout[0], o.snout[1], o.snout[2]], [0, 0, o.snout[2] / 2], o.snoutCol || c, o.snoutTex ?? TL.skin);
  if (o.ears) for (const s of [-1, 1]) add(s < 0 ? 'earL' : 'earR', 'head', [s * (o.head[0] / 2 + o.ears[0] / 2 - 0.02), o.head[1] / 2 - 0.01, o.head[2] * 0.25], o.ears, [0, o.ears[1] / 2, 0], o.earCol || c, TL.fur);
  if (o.horns) for (const s of [-1, 1]) add(s < 0 ? 'hornL' : 'hornR', 'head', [s * (o.head[0] / 2), o.head[1] / 2 - 0.03, o.head[2] * 0.3], [0.14, 0.05, 0.05], [s * 0.07, 0.03, 0], rgbf('#e0d6b8'), TL.bone);
  if (o.tail) add('tail', 'body', [0, o.body[1] / 2 - 0.08, -o.body[2] / 2], o.tail, [0, -o.tail[1] / 2, -o.tail[2] / 2], o.tailCol || c, TL.fur);
  const rig = new Rig(P);
  rig.kind = 'quad'; rig.cfg = o;
  return rig;
}

const ANIMAL_RIGS = {
  cow: (v) => {
    const r = quadRig({ col: [1, 1, 1], body: [0.74, 0.7, 1.45], bodyY: 1.05, bodyTex: TL.spots, leg: [0.17, 0.78], hoof: true, legTex: TL.spots,
      neck: [0, 0.22], head: [0.4, 0.4, 0.48], face: TL.cowF, headTex: TL.fur, ears: [0.14, 0.08, 0.1], horns: true,
      snout: [0.34, 0.22, 0.12, -0.08], snoutCol: rgbf('#e8b0a8'), tail: [0.06, 0.72, 0.06] });
    return rigPlus(r, [{ name: 'udder', parent: 'body', p: [0, -0.4, -0.3], s: [0.28, 0.14, 0.32], col: rgbf('#e8b0a8'), tex: TL.skin }]);
  },
  sheep: () => quadRig({ col: rgbf('#ece6d8'), body: [0.62, 0.56, 0.9], bodyY: 0.78, bodyTex: TL.wool, leg: [0.11, 0.52], legCol: rgbf('#3a342e'), legTex: TL.fur,
    neck: [0, 0.14], head: [0.26, 0.3, 0.32], headCol: rgbf('#3a342e'), face: TL.sheepF, ears: [0.12, 0.05, 0.08], earCol: rgbf('#3a342e'), tail: [0.12, 0.14, 0.08] }),
  pig: () => quadRig({ col: rgbf('#e8a6a8'), body: [0.52, 0.46, 0.95], bodyY: 0.58, bodyTex: TL.skin, leg: [0.12, 0.36], legTex: TL.skin,
    neck: [0, 0.02], head: [0.36, 0.34, 0.3], face: TL.pigF, headTex: TL.skin, snout: [0.18, 0.13, 0.08, -0.05], snoutCol: rgbf('#d88c90'), ears: [0.12, 0.1, 0.05], tail: [0.05, 0.12, 0.05] }),
  horse: (v) => {
    const cols = ['#6b4226', '#3a2a1e', '#a88a64', '#e8e0d0', '#2a2220'];
    const c = rgbf(cols[(v || 0) % cols.length]);
    const r = quadRig({ col: c, body: [0.6, 0.7, 1.55], bodyY: 1.35, leg: [0.16, 1.02], hoof: true, dark: [0.12, 0.1, 0.08],
      neck: [0, 0.2], neckS: [0.3, 0.8, 0.36], neckO: [0, 0.36, 0.06], headP: [0, 0.74, 0.1], head: [0.28, 0.3, 0.62], face: TL.horseF,
      ears: [0.07, 0.12, 0.06], tail: [0.12, 0.82, 0.12], tailCol: v3.scale(c, 0.45) });
    return rigPlus(r, [
      { name: 'mane', parent: 'neck', p: [0, 0.38, -0.13], s: [0.08, 0.84, 0.14], col: v3.scale(c, 0.45), tex: TL.hair },
      { name: 'saddle', parent: 'body', p: [0, 0.37, 0.08], s: [0.64, 0.08, 0.58], col: rgbf('#5a3a24'), tex: TL.leather, hide: true },
      { name: 'blanketS', parent: 'body', p: [0, 0.3, 0.08], s: [0.66, 0.1, 0.7], col: rgbf('#8a2a24'), tex: TL.cloth, hide: true },
    ]);
  },
  deer: (v, white) => {
    const c = white ? [0.96, 0.96, 0.94] : rgbf('#9a6a3e');
    const r = quadRig({ col: c, body: [0.46, 0.55, 1.2], bodyY: 1.12, leg: [0.1, 0.86], hoof: true,
      neck: [0, 0.18], neckS: [0.2, 0.55, 0.24], neckO: [0, 0.24, 0.04], headP: [0, 0.5, 0.06], head: [0.22, 0.24, 0.4], face: white ? TL.stagF : TL.deerF,
      ears: [0.1, 0.1, 0.04], tail: [0.1, 0.14, 0.05], tailCol: [1, 1, 1] });
    const u = [];
    if (white || (v | 0) % 2 === 0) { // bois
      const ac = white ? [0.95, 0.95, 0.92] : rgbf('#cbb894');
      for (const s of [-1, 1]) {
        u.push({ name: 'ant' + s, parent: 'head', p: [s * 0.07, 0.12, 0.1], s: [0.04, 0.42, 0.04], o: [0, 0.2, 0], col: ac, tex: TL.bone, r0: [-0.2, 0, s * 0.35] });
        u.push({ name: 'antb' + s, parent: 'ant' + s, p: [0, 0.26, 0], s: [0.03, 0.2, 0.03], o: [0, 0.1, 0], col: ac, tex: TL.bone, r0: [0.5, 0, s * 0.2] });
      }
    }
    return rigPlus(r, u);
  },
  boar: () => {
    const r = quadRig({ col: rgbf('#4a3a2e'), body: [0.5, 0.56, 1.0], bodyY: 0.62, leg: [0.12, 0.38], hoof: true,
      neck: [0, 0.05], head: [0.36, 0.4, 0.42], face: TL.boarF, snout: [0.2, 0.15, 0.08, -0.08], snoutCol: rgbf('#6a5048'), ears: [0.1, 0.1, 0.05], tail: [0.04, 0.2, 0.04] });
    const u = [];
    for (const s of [-1, 1]) u.push({ name: 'tusk' + s, parent: 'snout', p: [s * 0.1, 0, 0.04], s: [0.03, 0.09, 0.03], o: [0, 0.04, 0], col: [0.95, 0.92, 0.85], tex: TL.bone });
    u.push({ name: 'ridge', parent: 'body', p: [0, 0.3, 0.1], s: [0.1, 0.08, 0.8], col: rgbf('#2a2018'), tex: TL.hair });
    return rigPlus(r, u);
  },
  dog: (v) => {
    const cols = ['#b08450', '#3a302a', '#e8dcc8', '#8a5a34'];
    return quadRig({ col: rgbf(cols[(v || 0) % 4]), body: [0.3, 0.32, 0.72], bodyY: 0.52, leg: [0.1, 0.36],
      neck: [0, 0.12], head: [0.26, 0.26, 0.26], face: TL.dogF, snout: [0.14, 0.11, 0.14, -0.05], ears: [0.07, 0.13, 0.04], tail: [0.05, 0.3, 0.05] });
  },
  cat: (v) => quadRig({ col: rgbf(['#2a2624', '#e0a060', '#9a9aa0'][(v || 0) % 3]), body: [0.2, 0.2, 0.46], bodyY: 0.3, leg: [0.07, 0.22],
    neck: [0, 0.08], head: [0.18, 0.16, 0.16], face: TL.catF, ears: [0.05, 0.08, 0.03], tail: [0.04, 0.38, 0.04] }),
  rabbit: () => quadRig({ col: rgbf('#9a8672'), body: [0.2, 0.2, 0.3], bodyY: 0.18, leg: [0.06, 0.1],
    neck: [0, 0.1], head: [0.15, 0.15, 0.16], face: TL.rabbitF, ears: [0.04, 0.17, 0.03], tail: [0.07, 0.07, 0.05], tailCol: [1, 1, 1] }),
  fox: () => quadRig({ col: rgbf('#c8652a'), body: [0.24, 0.24, 0.6], bodyY: 0.38, leg: [0.07, 0.28], legCol: rgbf('#2a1e18'),
    neck: [0, 0.1], head: [0.2, 0.18, 0.2], face: TL.foxF, snout: [0.1, 0.08, 0.12, -0.04], ears: [0.06, 0.1, 0.03], tail: [0.12, 0.12, 0.46], tailCol: rgbf('#c8652a') }),
  wolf: () => quadRig({ col: rgbf('#6e6a66'), body: [0.34, 0.36, 0.95], bodyY: 0.62, leg: [0.1, 0.46],
    neck: [0, 0.12], head: [0.28, 0.26, 0.28], face: TL.wolfF, snout: [0.14, 0.12, 0.2, -0.05], ears: [0.07, 0.12, 0.04], tail: [0.1, 0.1, 0.42] }),
  hen: (v) => {
    const c = v % 2 ? rgbf('#9a5a2c') : rgbf('#f2ede2');
    const { P, add } = rigParts();
    add('body', null, [0, 0.28, 0], [0.24, 0.24, 0.32], [0, 0, 0], c, TL.fur);
    add('neck', 'body', [0, 0.1, 0.12], null);
    add('head', 'neck', [0, 0.02, 0], [0.13, 0.15, 0.13], [0, 0.07, 0.03], c, tx(TL.fur, TL.henF));
    add('beak', 'head', [0, 0.07, 0.1], [0.05, 0.04, 0.07], [0, 0, 0], rgbf('#e8b030'), TL.plain);
    add('comb', 'head', [0, 0.16, 0.03], [0.03, 0.06, 0.1], [0, 0, 0], rgbf('#d02a20'), TL.plain);
    add('wattle', 'head', [0, 0.02, 0.09], [0.03, 0.05, 0.03], [0, 0, 0], rgbf('#d02a20'), TL.plain);
    add('legFL', 'body', [-0.05, -0.1, 0], [0.03, 0.16, 0.03], [0, -0.08, 0], rgbf('#e8b030'), TL.plain);
    add('legFR', 'body', [0.05, -0.1, 0], [0.03, 0.16, 0.03], [0, -0.08, 0], rgbf('#e8b030'), TL.plain);
    add('tail', 'body', [0, 0.08, -0.15], [0.14, 0.16, 0.08], [0, 0.06, -0.03], c, TL.fur);
    add('wingL', 'body', [-0.125, 0.04, 0], [0.02, 0.14, 0.22], [0, -0.04, 0], v3.scale(c, 0.9), TL.fur);
    add('wingR', 'body', [0.125, 0.04, 0], [0.02, 0.14, 0.22], [0, -0.04, 0], v3.scale(c, 0.9), TL.fur);
    const r = new Rig(P); r.kind = 'bird'; return r;
  },
  duck: () => {
    const { P, add } = rigParts();
    const c = rgbf('#8a6a4a');
    add('body', null, [0, 0.16, 0], [0.22, 0.18, 0.34], [0, 0, 0], c, TL.fur);
    add('neck', 'body', [0, 0.08, 0.14], null);
    add('head', 'neck', [0, 0.02, 0], [0.12, 0.13, 0.14], [0, 0.07, 0.02], rgbf('#2a6a3a'), tx(TL.fur, TL.henF));
    add('beak', 'head', [0, 0.05, 0.1], [0.08, 0.03, 0.09], [0, 0, 0], rgbf('#e8a030'), TL.plain);
    add('tail', 'body', [0, 0.06, -0.17], [0.1, 0.06, 0.08], [0, 0, 0], c, TL.fur);
    add('wingL', 'body', [-0.115, 0.03, 0], [0.02, 0.12, 0.24], [0, 0, 0], v3.scale(c, 0.8), TL.fur);
    add('wingR', 'body', [0.115, 0.03, 0], [0.02, 0.12, 0.24], [0, 0, 0], v3.scale(c, 0.8), TL.fur);
    const r = new Rig(P); r.kind = 'bird'; return r;
  },
  crow: () => {
    const { P, add } = rigParts();
    const c = [0.1, 0.1, 0.12];
    add('body', null, [0, 0.14, 0], [0.13, 0.13, 0.26], [0, 0, 0], c, TL.fur);
    add('neck', 'body', [0, 0.06, 0.12], null);
    add('head', 'neck', [0, 0.02, 0], [0.1, 0.1, 0.11], [0, 0.04, 0.02], c, tx(TL.fur, TL.crowF));
    add('beak', 'head', [0, 0.04, 0.08], [0.04, 0.03, 0.08], [0, 0, 0], [0.18, 0.18, 0.2], TL.plain);
    add('tail', 'body', [0, 0.02, -0.14], [0.08, 0.02, 0.14], [0, 0, -0.06], c, TL.fur);
    add('wingL', 'body', [-0.065, 0.04, 0], [0.3, 0.02, 0.17], [-0.15, 0, 0], c, TL.fur);
    add('wingR', 'body', [0.065, 0.04, 0], [0.3, 0.02, 0.17], [0.15, 0, 0], c, TL.fur);
    add('legFL', 'body', [-0.03, -0.06, 0], [0.02, 0.08, 0.02], [0, -0.04, 0], [0.2, 0.2, 0.2], TL.plain);
    add('legFR', 'body', [0.03, -0.06, 0], [0.02, 0.08, 0.02], [0, -0.04, 0], [0.2, 0.2, 0.2], TL.plain);
    const r = new Rig(P); r.kind = 'bird'; return r;
  },
  songbird: (v) => {
    const r = ANIMAL_RIGS.crow();
    const cols = [[0.5, 0.35, 0.25], [0.3, 0.4, 0.7], [0.8, 0.6, 0.2], [0.55, 0.5, 0.45]];
    for (const q of r.parts) if (q.s) q.col = q.name === 'beak' ? [0.3, 0.25, 0.2] : cols[(v || 0) % 4];
    return r;
  },
  fish: () => {
    const { P, add } = rigParts();
    add('body', null, [0, 0, 0], [0.1, 0.16, 0.42], [0, 0, 0], rgbf('#7a8a80'), TL.scales);
    add('tail', 'body', [0, 0, -0.2], [0.02, 0.18, 0.14], [0, 0, -0.06], rgbf('#6a7a70'), TL.scales);
    const r = new Rig(P); r.kind = 'fish'; return r;
  },
};

// Épouvantail (objet posé ou entité vivante)
function scarecrowRig(v) {
  const { P, add } = rigParts();
  const shirt = [rgbf('#8a3a30'), rgbf('#3a5a8a'), rgbf('#5a6a3a')][(v || 0) % 3];
  add('pole', null, [0, 0, 0], [0.09, 2.05, 0.09], [0, 1.02, 0], rgbf('#6a4a30'), TL.wood);
  add('torso', null, [0, 1.25, 0], [0.46, 0.55, 0.22], [0, 0.22, 0], shirt, TL.plaid);
  add('bar', 'torso', [0, 0.42, 0], [1.25, 0.07, 0.07], [0, 0, 0], rgbf('#6a4a30'), TL.wood);
  add('armL', 'torso', [-0.23, 0.42, 0], [0.42, 0.14, 0.15], [-0.21, 0, 0], shirt, TL.plaid);
  add('armR', 'torso', [0.23, 0.42, 0], [0.42, 0.14, 0.15], [0.21, 0, 0], shirt, TL.plaid);
  add('strawL', 'armL', [-0.44, 0, 0], [0.08, 0.16, 0.1], [0, -0.04, 0], rgbf('#d8b870'), TL.straw);
  add('strawR', 'armR', [0.44, 0, 0], [0.08, 0.16, 0.1], [0, -0.04, 0], rgbf('#d8b870'), TL.straw);
  add('neck', 'torso', [0, 0.55, 0], null);
  add('head', 'neck', [0, 0, 0], [0.3, 0.34, 0.3], [0, 0.17, 0], [1, 1, 1], tx(TL.sack, TL.sack));
  add('brim', 'head', [0, 0.35, 0], [0.52, 0.03, 0.52], [0, 0, 0], rgbf('#b89a5a'), TL.straw);
  add('crown', 'head', [0, 0.41, 0], [0.28, 0.11, 0.28], [0, 0, 0], rgbf('#b89a5a'), TL.straw);
  const r = new Rig(P); r.kind = 'scare'; return r;
}

// ---------------------------------------------------------------- poses
function poseHuman(rig, st) {
  const mv = st.move || 0, ph = st.phase || 0, run = st.run ? 1 : 0;
  const amp = (0.5 + run * 0.35) * mv;
  const sw = Math.sin(ph) * amp;
  rig.set('legL', sw, 0, 0); rig.set('legR', -sw, 0, 0);
  const bob = Math.abs(Math.cos(ph)) * 0.03 * mv;
  rig.part('hips').p[1] = 0.88 + bob - (st.sit ? 0.42 : 0);
  let aL = -sw * 0.8, aR = sw * 0.8;
  let zL = 0.06, zR = -0.06;
  if (st.sit) { rig.set('legL', -1.5, 0, 0); rig.set('legR', -1.5, 0, 0); }
  if (st.work) { const k = Math.sin(st.t * 7); aR = -1.4 - k * 0.7; }
  if (st.wave) { aR = -2.6 + Math.sin(st.t * 9) * 0.3; zR = 0.3; }
  if (st.fish) { aR = -0.9; aL = -0.7; }
  if (st.carry) { aL = -0.5; }
  if (st.reach) { aR = -1.5 - st.reach * 0.6; aL = -1.5 - st.reach * 0.6; }
  if (st.cower) { aL = -2.4; aR = -2.4; zL = 0.5; zR = -0.5; }
  if (st.cross) { aL = -1.0; aR = -1.0; zL = 0.95; zR = -0.95; }
  if (st.pray) { aL = -1.25; aR = -1.25; zL = 0.3; zR = -0.3; }
  if (st.pale) { aL = -0.05; aR = -0.05; }
  if (st.attack) { aR = -2.5 + st.attack * 3; }
  rig.set('armL', aL, 0, zL); rig.set('armR', aR, 0, zR);
  rig.set('torso', (st.lean || 0) + run * 0.12, 0, 0);
  const talk = st.talk ? Math.sin(st.t * 11) * 0.05 : 0;
  rig.set('head', (st.lookP || 0) + talk + (st.nod ? Math.sin(st.t * 3) * 0.15 : 0), clamp(st.lookY || 0, -1.2, 1.2), st.tilt || 0);
}
function poseQuad(rig, st) {
  const mv = st.move || 0, ph = st.phase || 0;
  const a = (st.run ? 0.75 : 0.45) * mv;
  const s = Math.sin(ph) * a, c = st.run ? Math.sin(ph + 0.9) * a : -s;
  rig.set('legFL', s, 0, 0); rig.set('legBR', s, 0, 0);
  rig.set('legFR', c, 0, 0); rig.set('legBL', c, 0, 0);
  const graze = st.graze || 0;
  const cfg = rig.cfg || {};
  rig.set('neck', (cfg.neckS ? -0.55 : 0) + graze * (cfg.neckS ? 1.4 : 0.9) + (st.lookP || 0), clamp(st.lookY || 0, -0.9, 0.9), 0);
  rig.set('head', cfg.neckS ? 0.55 - graze * 0.3 : graze * 0.3, 0, 0);
  rig.set('tail', (st.wag ? 0.2 : 0.35) + (st.wag ? 0 : Math.sin(st.t * 1.3) * 0.08), st.wag ? Math.sin(st.t * 14) * 0.6 : 0, 0);
  if (st.lie) { rig.set('legFL', -1.3, 0, 0); rig.set('legFR', -1.3, 0, 0); rig.set('legBL', 1.3, 0, 0); rig.set('legBR', 1.3, 0, 0); }
}
function poseBird(rig, st) {
  const fly = st.fly || 0;
  const flap = fly ? Math.sin(st.t * 22 + (st.seed || 0)) * 0.9 : (st.flapT > 0 ? Math.sin(st.t * 30) * 0.6 : 0);
  rig.set('wingL', 0, 0, fly ? flap : 0.02 - flap * 0.5); rig.set('wingR', 0, 0, fly ? -flap : -0.02 + flap * 0.5);
  const peck = st.peck ? Math.max(0, Math.sin(st.t * 9)) * 0.9 : 0;
  rig.set('neck', peck, clamp(st.lookY || 0, -1, 1), 0);
  const s = Math.sin(st.phase || 0) * 0.6 * (st.move || 0);
  rig.set('legFL', s, 0, 0); rig.set('legFR', -s, 0, 0);
}

// ---------------------------------------------------------------- objets posés (modèles statiques)
const PE = {
  buf: null, M: new Float32Array(12), fl: 0, _L: new Float32Array(12), _O: new Float32Array(12),
  // boîte au centre (cx, cy, cz) du repère de l'objet, rotation propre (ry, rx, rz)
  box(cx, cy, cz, sx, sy, sz, col, code, ry, rx, rz) {
    m34TR(this._L, cx, cy, cz, rx || 0, ry || 0, rz || 0);
    m34Mul(this._O, this.M, this._L);
    this.buf.box(this._O, 0, 0, 0, sx, sy, sz, col, withFlags(code, this.fl));
  },
  // boîte posée au sol (y = bas de la boîte)
  bx(cx, y0, cz, sx, sy, sz, col, code, ry, rx, rz) { this.box(cx, y0 + sy / 2, cz, sx, sy, sz, col, code, ry, rx, rz); },
  frame(x, y, z, r, s) { m34Root(this.M, x, y, z, r || 0, s || 1); },
};
const PC = { wood: rgbf('#b48a5a'), dwood: rgbf('#6a4a30'), iron: rgbf('#50535a'), stone: rgbf('#9a968c'), straw: rgbf('#d8c07a'),
  red: rgbf('#9a3024'), white: [1, 1, 1], green: rgbf('#4a7a3a'), soil: [1, 1, 1] };

// Modèles : fn(E, o, t) avec o = { x, y, z, r, s, v, data }
const PROP_MODELS = {
  coffre(E) { E.bx(0, 0, 0, 0.9, 0.48, 0.56, WHITE, tx(TL.wood, TL.chest)); E.bx(0, 0.48, 0, 0.94, 0.14, 0.6, WHITE, TL.wood); E.bx(0, 0.2, 0.285, 0.08, 0.14, 0.02, rgbf('#d0b040'), TL.gold); },
  caisse_expedition(E, o) {
    E.bx(0, 0, 0, 1.3, 0.7, 0.85, WHITE, TL.wood);
    E.box(0, 0.78, -0.1, 1.34, 0.08, 0.9, WHITE, TL.darkwood, 0, -0.35);
    if (o.data && o.data.full) E.bx(0, 0.66, 0.2, 0.9, 0.1, 0.3, rgbf('#c89a50'), TL.hay);
  },
  banc(E) { E.bx(0, 0.42, 0, 1.6, 0.07, 0.42, WHITE, TL.wood); for (const s of [-0.7, 0.7]) { E.bx(s, 0, 0.12, 0.08, 0.42, 0.08, WHITE, TL.darkwood); E.bx(s, 0, -0.14, 0.08, 0.9, 0.08, WHITE, TL.darkwood); } E.bx(0, 0.62, -0.17, 1.6, 0.26, 0.05, WHITE, TL.wood); },
  table(E) { E.bx(0, 0.72, 0, 1.4, 0.07, 0.86, WHITE, TL.wood); for (const [x, z] of [[-0.62, -0.36], [0.62, -0.36], [-0.62, 0.36], [0.62, 0.36]]) E.bx(x, 0, z, 0.08, 0.72, 0.08, WHITE, TL.darkwood); },
  chaise(E) { E.bx(0, 0.43, 0, 0.44, 0.05, 0.44, WHITE, TL.wood); for (const [x, z] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) E.bx(x, 0, z, 0.05, 0.43, 0.05, WHITE, TL.darkwood); E.bx(0, 0.48, -0.2, 0.44, 0.5, 0.05, WHITE, TL.wood); },
  tonneau(E) { E.bx(0, 0, 0, 0.58, 0.9, 0.58, WHITE, TL.barrel); E.bx(0, 0.03, 0, 0.58, 0.84, 0.58, WHITE, TL.barrel, Math.PI / 4); },
  ruche(E) {
    E.bx(0, 0, 0, 0.5, 0.28, 0.5, WHITE, TL.darkwood);
    for (let k = 0; k < 3; k++) E.bx(0, 0.28 + k * 0.24, 0, 0.56 - k * 0.02, 0.23, 0.56 - k * 0.02, k === 1 ? rgbf('#f0d070') : WHITE, k === 1 ? TL.comb : TL.wood);
    E.bx(0, 1.0, 0, 0.68, 0.07, 0.68, WHITE, TL.darkwood); E.bx(0, 0.3, 0.29, 0.14, 0.04, 0.02, [0.1, 0.1, 0.1], 0);
  },
  nichoir(E) {
    E.bx(0, 0, 0, 0.08, 1.8, 0.08, WHITE, TL.darkwood); E.bx(0, 1.8, 0, 0.3, 0.3, 0.3, WHITE, TL.wood);
    E.box(-0.1, 2.16, 0, 0.26, 0.03, 0.36, WHITE, TL.darkwood, 0, 0, 0.7); E.box(0.1, 2.16, 0, 0.26, 0.03, 0.36, WHITE, TL.darkwood, 0, 0, -0.7);
    E.box(0, 1.98, 0.155, 0.08, 0.08, 0.01, [0.05, 0.05, 0.05], 0);
  },
  mangeoire(E, o) { E.bx(0, 0, 0, 1.4, 0.35, 0.46, WHITE, TL.wood); if (!o.data || o.data.fill !== 0) E.bx(0, 0.3, 0, 1.28, 0.06, 0.36, WHITE, TL.hay); },
  abreuvoir(E) { E.bx(0, 0, 0, 1.5, 0.4, 0.5, rgbf('#9a968c'), TL.stone); E.bx(0, 0.3, 0, 1.36, 0.06, 0.36, rgbf('#4a6a7a'), TL.plain); },
  epouvantail() { /* rendu par squelette (voir buildProps) */ },
  panneau(E) { E.bx(0, 0, 0, 0.1, 1.55, 0.1, WHITE, TL.darkwood); E.bx(0, 1.15, 0.06, 0.9, 0.38, 0.05, WHITE, TL.sign); },
  lampadaire(E, o, t) {
    E.bx(0, 0, 0, 0.22, 0.2, 0.22, PC.iron, TL.iron); E.bx(0, 0.2, 0, 0.1, 2.9, 0.1, PC.iron, TL.iron);
    E.bx(0, 3.1, 0, 0.3, 0.05, 0.3, PC.iron, TL.iron);
    const lit = t && t.night;
    E.fl = lit ? FX_EMIT : 0; E.bx(0, 2.75, 0, 0.24, 0.34, 0.24, lit ? [1.2, 1, 0.7] : [0.5, 0.45, 0.4], TL.glass); E.fl = 0;
    E.box(0, 3.2, 0, 0.26, 0.06, 0.26, PC.iron, TL.iron, Math.PI / 4);
  },
  pot_fleurs(E, o) { E.bx(0, 0, 0, 0.42, 0.34, 0.42, WHITE, TL.terracotta); E.bx(0, 0.34, 0, 0.36, 0.18, 0.36, WHITE, TL.flowers); },
  parterre(E) { E.bx(0, 0, 0, 1.9, 0.18, 0.95, WHITE, TL.darkwood); E.bx(0, 0.02, 0, 1.78, 0.2, 0.83, WHITE, TL.flowers); E.bx(-0.5, 0.2, 0, 0.3, 0.16, 0.3, WHITE, TL.flowers); E.bx(0.45, 0.2, 0.1, 0.3, 0.14, 0.3, WHITE, TL.flowers); },
  allee(E) { E.bx(0, -0.02, 0, 0.98, 0.07, 0.98, WHITE, mt(M_COBBLE)); },
  dalle(E) { E.bx(0, -0.02, 0, 0.98, 0.07, 0.98, WHITE, mt(M_STONE)); },
  plancher(E) { E.bx(0, -0.02, 0, 0.98, 0.07, 0.98, WHITE, mt(M_PLANKS)); },
  statue(E, o) {
    E.bx(0, 0, 0, 0.8, 0.8, 0.8, WHITE, TL.stone);
    // la silhouette est rendue par un squelette de pierre (voir buildProps)
  },
  girouette(E, o, t) {
    E.bx(0, 0, 0, 0.08, 2.4, 0.08, PC.iron, TL.iron);
    const a = t ? t.wind : 0;
    E.box(0, 2.45, 0, 0.06, 0.06, 0.8, rgbf('#b87333'), TL.metal, a); E.box(Math.sin(a) * 0.4, 2.45, Math.cos(a) * 0.4, 0.2, 0.2, 0.03, rgbf('#b87333'), TL.metal, a);
    E.box(0, 2.3, 0, 0.5, 0.03, 0.03, PC.iron, TL.iron); E.box(0, 2.3, 0, 0.03, 0.03, 0.5, PC.iron, TL.iron);
  },
  brouette(E) { E.bx(0, 0.35, 0, 0.6, 0.3, 0.9, WHITE, TL.wood); E.box(0, 0.2, 0.5, 0.06, 0.36, 0.36, PC.iron, TL.iron); for (const s of [-0.22, 0.22]) E.box(s, 0.45, -0.7, 0.05, 0.05, 0.8, WHITE, TL.darkwood, 0, 0.2); },
  botte_foin(E) { E.bx(0, 0, 0, 1.0, 0.6, 0.6, WHITE, TL.hay); E.bx(-0.25, 0, 0, 0.03, 0.61, 0.61, rgbf('#8a6a3a'), TL.rope); E.bx(0.25, 0, 0, 0.03, 0.61, 0.61, rgbf('#8a6a3a'), TL.rope); },
  arche_fleurie(E) { for (const s of [-0.9, 0.9]) { E.bx(s, 0, 0, 0.12, 2.3, 0.12, WHITE, TL.wood); E.bx(s, 0.3, 0, 0.2, 1.8, 0.2, WHITE, TL.leaves); } E.bx(0, 2.3, 0, 2.0, 0.12, 0.2, WHITE, TL.wood); E.bx(0, 2.35, 0, 2.1, 0.25, 0.3, WHITE, TL.flowers); },
  puits_deco(E) {
    for (const [x, z, sx, sz] of [[0, -0.6, 1.4, 0.2], [0, 0.6, 1.4, 0.2], [-0.6, 0, 0.2, 1.0], [0.6, 0, 0.2, 1.0]]) E.bx(x, 0, z, sx, 0.75, sz, WHITE, TL.stone);
    E.bx(0, 0.2, 0, 1.0, 0.05, 1.0, rgbf('#2a4a5a'), TL.plain);
    for (const s of [-0.62, 0.62]) E.bx(s, 0.75, 0, 0.1, 1.3, 0.1, WHITE, TL.darkwood);
    E.box(0, 2.1, -0.35, 1.6, 0.05, 0.85, WHITE, mt(M_THATCH), 0, 0.6); E.box(0, 2.1, 0.35, 1.6, 0.05, 0.85, WHITE, mt(M_THATCH), 0, -0.6);
    E.box(0, 1.6, 0, 1.3, 0.08, 0.08, WHITE, TL.wood);
  },
  cloture(E) { for (const s of [-1, 1]) E.bx(s, 0, 0, 0.12, 1.1, 0.12, WHITE, TL.darkwood); E.bx(0, 0.4, 0, 2.0, 0.08, 0.05, WHITE, TL.wood); E.bx(0, 0.8, 0, 2.0, 0.08, 0.05, WHITE, TL.wood); },
  cloture_pierre(E) { E.bx(0, 0, 0, 2.0, 0.8, 0.35, WHITE, mt(M_MOSSY)); },
  haie(E) { E.bx(0, 0, 0, 2.0, 1.2, 0.7, WHITE, TL.leaves); E.bx(0, 1.1, 0, 1.8, 0.2, 0.5, WHITE, TL.leaves); },
  portillon(E, o) {
    for (const s of [-1, 1]) E.bx(s, 0, 0, 0.14, 1.25, 0.14, WHITE, TL.darkwood);
    const a = o.data && o.data.open ? -1.4 : 0;
    const L = E._O, M0 = new Float32Array(E.M);
    m34TR(E._L, -0.93, 0, 0, 0, a, 0); m34Mul(E.M, M0, E._L);
    E.bx(0.93, 0.35, 0, 1.8, 0.07, 0.05, WHITE, TL.wood); E.bx(0.93, 0.8, 0, 1.8, 0.07, 0.05, WHITE, TL.wood);
    E.box(0.93, 0.6, 0, 1.9, 0.06, 0.05, WHITE, TL.wood, 0, 0, 0.3);
    E.M.set(M0);
  },
  feu_camp(E, o, t) {
    for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; E.bx(Math.cos(a) * 0.55, 0, Math.sin(a) * 0.55, 0.22, 0.18, 0.22, WHITE, TL.stone, a); }
    E.box(0, 0.12, 0, 0.9, 0.12, 0.12, WHITE, TL.bark, 0.5); E.box(0, 0.12, 0, 0.9, 0.12, 0.12, WHITE, TL.bark, -0.6);
    if (!o.data || o.data.lit !== false) { const f = t ? 1 + Math.sin(t.t * 13 + o.x) * 0.12 : 1; E.fl = FX_EMIT; E.bx(0, 0.12, 0, 0.3, 0.45 * f, 0.3, [1.3, 0.8, 0.3], TL.flame, t ? t.t * 3 : 0); E.bx(0, 0.12, 0, 0.18, 0.7 * f, 0.18, [1.4, 1.1, 0.5], TL.flame, 0.7); E.fl = 0; }
  },
  niche(E) { E.bx(0, 0, 0, 0.9, 0.7, 1.0, WHITE, TL.wood); E.box(-0.25, 0.85, 0, 0.62, 0.06, 1.1, rgbf('#9a3024'), mt(M_ROOF), 0, 0, 0.75); E.box(0.25, 0.85, 0, 0.62, 0.06, 1.1, rgbf('#9a3024'), mt(M_ROOF), 0, 0, -0.75); E.bx(0, 0.02, 0.501, 0.4, 0.45, 0.01, [0.04, 0.04, 0.04], 0); },
  etabli(E) {
    E.bx(0, 0.82, 0, 1.8, 0.1, 0.8, WHITE, TL.wood); for (const [x, z] of [[-0.8, -0.32], [0.8, -0.32], [-0.8, 0.32], [0.8, 0.32]]) E.bx(x, 0, z, 0.1, 0.82, 0.1, WHITE, TL.darkwood);
    E.bx(0, 0.2, 0, 1.6, 0.05, 0.7, WHITE, TL.darkwood); E.bx(0.6, 0.92, 0.2, 0.2, 0.15, 0.15, PC.iron, TL.iron);
    E.box(-0.4, 0.94, 0.1, 0.4, 0.04, 0.05, WHITE, TL.wood, 0.4); E.box(-0.25, 0.95, 0.12, 0.1, 0.06, 0.12, PC.iron, TL.iron, 0.4);
    E.bx(0, 0.92, -0.35, 1.8, 0.8, 0.06, WHITE, TL.darkwood);
  },
  four(E, o, t) {
    E.bx(0, 0, 0, 1.2, 1.1, 1.1, WHITE, TL.brick); E.bx(0, 1.1, 0, 1.0, 0.25, 0.9, WHITE, TL.brick); E.bx(0.3, 1.35, -0.2, 0.35, 1.0, 0.35, WHITE, TL.brick);
    const lit = o.data && o.data.lit; E.fl = lit ? FX_EMIT : 0; E.bx(0, 0.25, 0.53, 0.5, 0.45, 0.05, lit ? [1.3, 0.7, 0.3] : [0.08, 0.06, 0.05], lit ? TL.ember : 0); E.fl = 0;
  },
  boite_lettres(E, o) {
    E.bx(0, 0, 0, 0.09, 1.05, 0.09, WHITE, TL.darkwood); E.bx(0, 1.05, 0, 0.3, 0.28, 0.5, rgbf('#3a5a8a'), TL.metal);
    const up = o.data && o.data.mail; E.box(0.17, up ? 1.45 : 1.2, -0.1, 0.02, up ? 0.3 : 0.06, up ? 0.06 : 0.3, rgbf('#c03020'), TL.plain);
  },
  lit(E, o) {
    const c = o.data && o.data.col ? rgbf(o.data.col) : rgbf('#6a8ab0');
    E.bx(0, 0, 0, 1.05, 0.35, 2.05, WHITE, TL.darkwood); E.bx(0, 0.35, 0.05, 0.95, 0.14, 1.9, WHITE, TL.pillow);
    E.bx(0, 0.45, -0.75, 0.6, 0.12, 0.35, WHITE, TL.pillow); E.bx(0, 0.47, 0.25, 0.98, 0.06, 1.35, c, TL.blanket); E.bx(0, 0, -1.0, 1.05, 0.9, 0.08, WHITE, TL.darkwood);
  },
  enclume(E) { E.bx(0, 0, 0, 0.45, 0.4, 0.45, WHITE, TL.darkwood); E.bx(0, 0.4, 0, 0.28, 0.18, 0.5, PC.iron, TL.iron); E.bx(0, 0.58, 0, 0.3, 0.14, 0.8, PC.iron, TL.iron); },
  etagere(E, o) { E.bx(0, 0, 0, 1.4, 1.9, 0.08, WHITE, TL.darkwood); for (const y of [0.1, 0.65, 1.2, 1.75]) E.bx(0, y, 0.2, 1.4, 0.05, 0.4, WHITE, TL.wood); for (const s of [-0.68, 0.68]) E.bx(s, 0, 0.2, 0.05, 1.9, 0.4, WHITE, TL.darkwood); const k = o.data && o.data.kind; const itc = k === 'pain' ? TL.bread : k === 'livres' ? TL.book : k === 'bocaux' ? TL.glass : TL.barrel; for (const y of [0.7, 1.25]) E.bx(0, y, 0.2, 1.2, 0.3, 0.3, WHITE, itc); },
  comptoir(E) { E.bx(0, 0, 0, 2.4, 1.0, 0.7, WHITE, TL.darkwood); E.bx(0, 1.0, 0, 2.5, 0.06, 0.8, WHITE, TL.wood); },
  cheminee(E, o, t) {
    E.bx(0, 0, 0, 1.6, 1.3, 0.7, WHITE, TL.stone); E.bx(0, 1.3, -0.05, 1.3, 1.5, 0.5, WHITE, TL.stone);
    E.bx(0, 0.1, 0.25, 0.9, 0.7, 0.3, [0.05, 0.04, 0.04], 0);
    if (!o.data || o.data.lit !== false) { const f = t ? 1 + Math.sin(t.t * 11 + o.z) * 0.15 : 1; E.fl = FX_EMIT; E.bx(0, 0.1, 0.25, 0.5, 0.35 * f, 0.2, [1.4, 0.8, 0.3], TL.flame); E.fl = 0; }
  },
  citrouille(E, o, t) { const lit = t && t.night; E.fl = lit ? FX_EMIT : 0; E.bx(0, 0, 0, 0.5, 0.4, 0.5, lit ? [1.2, 0.9, 0.7] : WHITE, tx(TL.pumpkin, TL.jack)); E.fl = 0; E.bx(0, 0.4, 0, 0.06, 0.1, 0.06, rgbf('#4a6a2a'), TL.plain); },
  tombe(E, o) { E.bx(0, 0, 0, 0.6, 0.9, 0.16, WHITE, TL.stone); E.bx(0, 0.9, 0, 0.44, 0.12, 0.16, WHITE, TL.stone); E.bx(0, 0, 0.55, 0.62, 0.08, 1.0, WHITE, mt(M_DIRT)); },
  tombe_neuve(E, o) { E.bx(0, 0, 0, 0.1, 1.1, 0.1, WHITE, TL.wood); E.bx(0, 0.72, 0, 0.55, 0.1, 0.1, WHITE, TL.wood); E.bx(0, 0, 0.55, 0.7, 0.16, 1.1, WHITE, mt(M_DIRT)); },
  croix(E) { E.bx(0, 0, 0, 0.16, 1.6, 0.16, WHITE, TL.stone); E.bx(0, 1.05, 0, 0.8, 0.16, 0.16, WHITE, TL.stone); },
  poupee(E) { E.bx(0, 0, 0, 0.16, 0.2, 0.1, rgbf('#9a3a4a'), TL.cloth); E.bx(0, 0.2, 0, 0.14, 0.14, 0.12, WHITE, tx(TL.skin, TL.doll)); E.bx(0, 0.33, -0.01, 0.15, 0.04, 0.13, rgbf('#3a2a1a'), TL.hair); },
  cage(E) { for (const [x, z] of [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]]) E.bx(x, 0, z, 0.04, 0.8, 0.04, PC.iron, TL.iron); E.bx(0, 0.8, 0, 0.66, 0.04, 0.66, PC.iron, TL.iron); },
  piege(E, o) { E.bx(0, 0, 0, 0.5, 0.05, 0.5, WHITE, TL.wood); for (const s of [-0.22, 0.22]) E.box(s, 0.12, 0, 0.04, 0.26, 0.5, WHITE, TL.darkwood, 0, 0, s * 2); if (o.data && o.data.prise) E.bx(0, 0.05, 0, 0.18, 0.16, 0.3, rgbf('#9a8672'), TL.fur); },
  meule(E) { E.bx(0, 0, 0, 2.2, 1.0, 2.2, WHITE, TL.hay); E.bx(0, 1.0, 0, 1.6, 0.7, 1.6, WHITE, TL.hay); E.bx(0, 1.7, 0, 0.9, 0.4, 0.9, WHITE, TL.hay); },
  pierre_dressee(E) { E.bx(0, -0.3, 0, 0.8, 3.4, 0.5, WHITE, mt(M_MOSSY)); },
  caisse(E) { E.bx(0, 0, 0, 0.8, 0.8, 0.8, WHITE, mt(M_CRATE)); },
  sac(E) { E.bx(0, 0, 0, 0.45, 0.6, 0.3, rgbf('#c8b088'), TL.cloth); E.bx(0, 0.6, 0, 0.2, 0.08, 0.15, rgbf('#8a6a3a'), TL.rope); },
  jarre(E) { E.bx(0, 0, 0, 0.4, 0.55, 0.4, WHITE, TL.terracotta); E.bx(0, 0.55, 0, 0.26, 0.1, 0.26, WHITE, TL.terracotta); },
  pain_etal(E) { E.bx(0, 0, 0, 0.5, 0.18, 0.3, WHITE, TL.bread); },
  livre(E) { E.bx(0, 0, 0, 0.32, 0.05, 0.24, rgbf('#6a2a24'), TL.leather); E.bx(0, 0.05, 0, 0.3, 0.02, 0.22, WHITE, TL.paper); },
  lettre(E) { E.bx(0, 0, 0, 0.3, 0.01, 0.2, WHITE, TL.paper); },
  figurine(E) { E.bx(0, 0, 0, 0.1, 0.18, 0.08, rgbf('#8a6a44'), TL.wood); E.bx(0, 0.18, 0, 0.09, 0.09, 0.08, rgbf('#8a6a44'), TL.wood); },
  coffre_enterre(E) { E.bx(0, 0, 0, 0.5, 0.04, 0.5, WHITE, mt(M_DIRT)); E.box(0, 0.03, 0, 0.5, 0.02, 0.08, rgbf('#6a6a6a'), TL.stone, 0.78); E.box(0, 0.03, 0, 0.5, 0.02, 0.08, rgbf('#6a6a6a'), TL.stone, -0.78); },
  ossements(E) { E.box(0, 0.03, 0, 0.5, 0.05, 0.06, WHITE, TL.bone, 0.4); E.box(0.1, 0.03, 0.1, 0.4, 0.05, 0.05, WHITE, TL.bone, -0.6); E.bx(-0.2, 0, -0.1, 0.16, 0.14, 0.18, WHITE, TL.bone); },
  sang(E) { E.box(0, 0.015, 0, 0.9, 0.01, 0.7, [0.45, 0.03, 0.03], TL.blood, 0.3); E.box(0.4, 0.015, 0.5, 0.3, 0.01, 0.5, [0.45, 0.03, 0.03], TL.blood, 1.1); },
  traces(E) { for (let k = 0; k < 6; k++) E.box((k % 2 ? 0.12 : -0.12), 0.012, k * 0.7, 0.12, 0.01, 0.26, [0.25, 0.18, 0.12], 0); },
  bougie(E, o, t) { E.bx(0, 0, 0, 0.05, 0.14, 0.05, [0.95, 0.92, 0.85], TL.plain); E.fl = FX_EMIT; E.bx(0, 0.14, 0, 0.03, 0.05 + (t ? Math.sin(t.t * 17 + o.x) * 0.01 : 0), 0.03, [1.5, 1.1, 0.5], TL.flame); E.fl = 0; },
  lanterne_sol(E, o, t) { E.bx(0, 0, 0, 0.2, 0.05, 0.2, PC.iron, TL.iron); E.fl = FX_EMIT; E.bx(0, 0.05, 0, 0.16, 0.24, 0.16, [1.2, 1, 0.7], TL.glass); E.fl = 0; E.bx(0, 0.29, 0, 0.2, 0.04, 0.2, PC.iron, TL.iron); },
  ponton(E, o) { const L = (o.data && o.data.L) || 10; E.bx(0, -0.1, L / 2, 1.8, 0.14, L, WHITE, mt(M_PLANKS)); for (let k = 1; k <= L; k += 2.5) for (const s of [-0.8, 0.8]) E.bx(s, -2, k, 0.16, 2.0, 0.16, WHITE, TL.darkwood); },
  barque(E) { E.bx(0, 0, 0, 1.1, 0.35, 3.0, WHITE, TL.wood); E.bx(0, 0.05, 0, 0.9, 0.34, 2.7, [0.3, 0.25, 0.2], TL.darkwood); E.bx(0, 0.28, 0, 1.1, 0.05, 0.25, WHITE, TL.wood); },
  moulin_ailes(E, o, t) {
    const a = (t ? t.t * 0.4 : 0) * ((o.data && o.data.stop) ? 0 : 1) + (o.data && o.data.phase || 0);
    for (let k = 0; k < 4; k++) {
      const b = a + k * Math.PI / 2;
      E.box(Math.sin(b) * 4.2, Math.cos(b) * 4.2, 0, 0.3, 8.6, 0.15, WHITE, TL.darkwood, 0, 0, -b);
      E.box(Math.sin(b) * 4.6 + Math.cos(b) * 0.55, Math.cos(b) * 4.6 - Math.sin(b) * 0.55, 0.05, 1.0, 6.4, 0.04, rgbf('#e8dcc0'), TL.cloth, 0, 0, -b);
    }
    E.box(0, 0, -0.2, 0.6, 0.6, 0.8, WHITE, TL.darkwood);
  },
  cloche(E) { E.bx(0, 0, 0, 0.9, 0.8, 0.9, rgbf('#a88a40'), TL.gold); E.bx(0, 0.8, 0, 0.5, 0.2, 0.5, rgbf('#a88a40'), TL.gold); },
  sapling(E, o) { E.bx(0, 0, 0, 0.08, 1.1, 0.08, WHITE, TL.bark); E.bx(0, 0.8, 0, 0.5, 0.5, 0.5, WHITE, TL.leaves); E.bx(0, 1.05, 0, 0.3, 0.3, 0.3, WHITE, TL.leaves, 0.7); },
  miroir(E, o, t) { E.bx(0, 0, 0, 0.9, 1.9, 0.1, WHITE, TL.darkwood); E.fl = FX_EMIT; E.bx(0, 0.1, 0.03, 0.72, 1.7, 0.06, [0.25, 0.28, 0.35], TL.plain); E.fl = 0; },
  autel(E) { E.bx(0, 0, 0, 1.6, 0.9, 0.8, WHITE, TL.stone); E.bx(0, 0.9, 0, 1.7, 0.1, 0.9, WHITE, TL.stone); },
  echelle(E, o) { const h = (o.data && o.data.h) || 3; for (const s of [-0.28, 0.28]) E.bx(s, 0, 0, 0.07, h, 0.07, WHITE, TL.wood); for (let y = 0.3; y < h - 0.1; y += 0.38) E.bx(0, y, 0, 0.56, 0.05, 0.05, WHITE, TL.darkwood); },
  trappe(E, o) { const open = o.data && o.data.open; if (open) E.box(0, 0.5, -0.5, 1.0, 1.0, 0.06, WHITE, TL.wood); else E.bx(0, 0, 0, 1.0, 0.06, 1.0, WHITE, TL.wood); if (!open) E.bx(0.3, 0.06, 0, 0.1, 0.03, 0.2, PC.iron, TL.iron); else E.bx(0, -0.02, 0, 0.96, 0.03, 0.96, [0.02, 0.02, 0.02], 0); },
};

// Collision des objets posés : [demi-largeur x, demi-profondeur z, hauteur] ou null (pas de collision)
const PROP_COLL = {
  coffre: [0.45, 0.28, 0.6], caisse_expedition: [0.65, 0.43, 0.8], banc: [0.8, 0.22, 0.5], table: [0.7, 0.43, 0.8], chaise: null,
  tonneau: [0.3, 0.3, 0.9], ruche: [0.28, 0.28, 1.0], nichoir: [0.08, 0.08, 2], mangeoire: [0.7, 0.23, 0.4], abreuvoir: [0.75, 0.25, 0.4],
  epouvantail: [0.08, 0.08, 2], panneau: [0.08, 0.08, 1.6], lampadaire: [0.12, 0.12, 3], pot_fleurs: [0.21, 0.21, 0.4], statue: [0.4, 0.4, 2.2],
  girouette: [0.06, 0.06, 2.4], brouette: [0.3, 0.6, 0.6], botte_foin: [0.5, 0.3, 0.6], arche_fleurie: null, puits_deco: [0.7, 0.7, 0.8],
  cloture: [1.0, 0.08, 1.1], cloture_pierre: [1.0, 0.18, 0.8], haie: [1.0, 0.35, 1.3], portillon: null, niche: [0.45, 0.5, 0.8], etabli: [0.9, 0.4, 0.9], four: [0.6, 0.55, 1.3],
  boite_lettres: [0.1, 0.1, 1.2], lit: [0.52, 1.02, 0.5], enclume: [0.25, 0.4, 0.7], etagere: [0.7, 0.3, 1.9], comptoir: [1.2, 0.35, 1.05],
  cheminee: [0.8, 0.35, 2.5], tombe: [0.3, 0.1, 1.0], croix: [0.1, 0.1, 1.6], meule: [1.1, 1.1, 2], pierre_dressee: [0.4, 0.25, 3], caisse: [0.4, 0.4, 0.8],
  autel: [0.8, 0.4, 1.0], barque: [0.55, 1.5, 0.4], miroir: [0.45, 0.06, 1.9], cloche: [0.45, 0.45, 1], jarre: [0.2, 0.2, 0.6], sac: [0.2, 0.15, 0.6],
};

// ---------------------------------------------------------------- cultures (3D)
// stage 0..4 (4 = mûr) ; fonction de dessin dans un repère centré sur la case (1 m)
const CROP_MODELS = {
  ble(E, k, ripe) { const c = ripe ? [1, 1, 1] : [0.55, 0.95, 0.45]; const h = 0.15 + k * 0.85; for (let i = 0; i < 9; i++) { const x = (i % 3 - 1) * 0.25 + ((i * 7) % 3 - 1) * 0.04, z = ((i / 3 | 0) - 1) * 0.25; E.bx(x, 0, z, 0.035, h, 0.035, c, TL.wheat); if (ripe) E.bx(x, h - 0.02, z, 0.06, 0.16, 0.06, c, TL.wheat); } },
  carotte(E, k, ripe) { for (let i = 0; i < 4; i++) { const x = (i % 2 - 0.5) * 0.4, z = ((i >> 1) - 0.5) * 0.4; E.bx(x, 0, z, 0.1 + k * 0.08, 0.1 + k * 0.28, 0.1 + k * 0.08, WHITE, TL.carrotTop, i); if (ripe) E.bx(x, -0.02, z, 0.1, 0.06, 0.1, rgbf('#e87a20'), TL.plain); } },
  patate(E, k, ripe) { E.bx(0, 0, 0, 0.3 + k * 0.25, 0.12 + k * 0.28, 0.3 + k * 0.25, WHITE, TL.carrotTop); E.bx(0, 0.1 + k * 0.2, 0, 0.2 + k * 0.2, 0.1 + k * 0.12, 0.2 + k * 0.2, WHITE, TL.leaves, 0.6); if (ripe) for (const s of [-0.2, 0.2]) E.bx(s, 0, 0.3, 0.12, 0.08, 0.1, rgbf('#b89060'), TL.plain); },
  chou(E, k) { const s = 0.15 + k * 0.14; E.bx(0, 0, 0, s, s * 0.85, s, WHITE, TL.cabbage); E.bx(0, 0, 0, s * 1.3, s * 0.35, s * 1.3, [0.7, 1, 0.7], TL.cabbage, 0.78); },
  tomate(E, k, ripe) { E.bx(0, 0, 0, 0.04, 1.1, 0.04, WHITE, TL.wood); E.bx(0, 0, 0, 0.15 + k * 0.12, 0.2 + k * 0.2, 0.15 + k * 0.12, WHITE, TL.leaves); if (k > 0.5) E.bx(0, 0.35, 0, 0.3, 0.3 + k * 0.1, 0.3, WHITE, TL.leaves, 0.7); if (ripe) for (const [x, y, z] of [[0.14, 0.4, 0.1], [-0.12, 0.55, 0.12], [0.05, 0.62, -0.15], [-0.1, 0.3, -0.1]]) E.bx(x, y, z, 0.09, 0.09, 0.09, rgbf('#d83020'), TL.plain); },
  citrouille(E, k, ripe) { E.bx(0, 0, 0, 0.7, 0.08, 0.7, WHITE, TL.leaves); E.bx(0.2, 0, 0.2, 0.3, 0.15, 0.3, WHITE, TL.leaves, 0.5); if (k > 0.4) { const s = 0.12 + k * 0.38; E.bx(-0.05, 0, -0.05, s, s * 0.8, s, ripe ? WHITE : [0.7, 0.9, 0.5], TL.pumpkin); } },
  mais(E, k, ripe) { const h = 0.2 + k * 1.6; for (const [x, z] of [[-0.2, -0.2], [0.2, 0.15], [-0.1, 0.25]]) { E.bx(x, 0, z, 0.06, h, 0.06, [0.6, 0.9, 0.4], TL.carrotTop); E.box(x, h * 0.6, z, 0.5 * k, 0.03, 0.1, [0.6, 0.9, 0.4], TL.leaves, x * 5, 0, 0.4); if (ripe) E.bx(x + 0.06, h * 0.5, z, 0.08, 0.22, 0.08, WHITE, TL.corn); } },
  fraise(E, k, ripe) { E.bx(0, 0, 0, 0.3 + k * 0.3, 0.1 + k * 0.1, 0.3 + k * 0.3, WHITE, TL.leaves); if (ripe) for (const [x, z] of [[0.2, 0.1], [-0.15, 0.2], [0.05, -0.2]]) E.bx(x, 0.05, z, 0.07, 0.07, 0.07, rgbf('#e02030'), TL.plain); },
  tournesol(E, k, ripe) { const h = 0.2 + k * 1.7; E.bx(0, 0, 0, 0.07, h, 0.07, [0.5, 0.8, 0.35], TL.carrotTop); E.box(0.12, h * 0.5, 0, 0.25, 0.03, 0.16, WHITE, TL.leaves, 0, 0, 0.3); if (k > 0.6) { E.box(0, h + 0.05, 0.05, 0.45 * k, 0.45 * k, 0.05, rgbf('#f0c020'), TL.plain, 0, -0.3); E.box(0, h + 0.05, 0.08, 0.22 * k, 0.22 * k, 0.05, rgbf('#5a3a20'), TL.plain, 0, -0.3); } },
  pommier(E, k, ripe) { E.bx(0, 0, 0, 0.08 + k * 0.1, 0.6 + k * 1.2, 0.08 + k * 0.1, WHITE, TL.bark); const s = 0.4 + k * 1.4; E.bx(0, 0.6 + k * 1.1, 0, s, s * 0.8, s, WHITE, TL.leaves); if (ripe) for (let i = 0; i < 6; i++) E.bx(Math.sin(i * 2.1) * s * 0.52, 0.8 + k * 1.1 + (i % 3) * 0.3, Math.cos(i * 2.1) * s * 0.52, 0.1, 0.1, 0.1, rgbf('#c82020'), TL.plain); },
  mort(E) { E.bx(0, 0, 0, 0.3, 0.08, 0.3, rgbf('#6a5a3a'), TL.straw); E.box(0.05, 0.05, 0, 0.3, 0.03, 0.05, rgbf('#5a4a30'), TL.straw, 0.6); },
};

// ---------------------------------------------------------------- portes et ponts-levis (rendu dynamique)
function emitDoor(buf, d, fl) {
  // d : {x, y, z, r (orientation de la façade), w, h, a (angle d'ouverture), m?}
  const M = PE.M;
  m34Root(M, d.x, d.y, d.z, d.r, 1);
  // charnière côté gauche (x local = -w/2), rotation vers l'intérieur (+z local)
  m34TR(PE._L, -d.w / 2, 0, 0, 0, -d.a, 0);
  m34Mul(_mT2, M, PE._L);
  PE.M.set(_mT2);
  PE.buf = buf; PE.fl = fl || 0;
  PE.bx(d.w / 2, 0, 0, d.w - 0.04, d.h - 0.03, 0.07, WHITE, mt(d.m ?? M_PLANKS));
  PE.bx(d.w / 2, d.h * 0.5, 0.04, d.w * 0.7, 0.07, 0.02, WHITE, TL.darkwood);
  PE.bx(d.w - 0.16, d.h * 0.45, 0.05, 0.05, 0.05, 0.04, PC.iron, TL.iron);
  PE.fl = 0;
}
function emitBridge(buf, b) {
  // b : {x, y, z (charnière), r (direction vers l'extérieur), w, L, a (0 = baissé, PI/2 = levé)}
  const M = PE.M;
  m34Root(M, b.x, b.y, b.z, b.r, 1);
  m34TR(PE._L, 0, 0, 0, -b.a, 0, 0);
  m34Mul(_mT2, M, PE._L);
  PE.M.set(_mT2); PE.buf = buf; PE.fl = 0;
  PE.box(0, -0.12, b.L / 2, b.w, 0.24, b.L, WHITE, mt(M_PLANKS));
  for (const s of [-1, 1]) PE.box(s * (b.w / 2 - 0.1), 0.02, b.L / 2, 0.14, 0.12, b.L, WHITE, TL.darkwood);
  for (let k = 1; k < b.L; k += 1.6) PE.box(0, 0.01, k, b.w - 0.1, 0.05, 0.14, [0.8, 0.8, 0.8], TL.darkwood);
  // chaînes : du bout du pont vers le haut de la porte
  const ey = Math.sin(b.a) * b.L, ez = Math.cos(b.a) * b.L;
  m34Root(M, b.x, b.y, b.z, b.r, 1);
  for (const s of [-1, 1]) {
    const x = s * (b.w / 2 - 0.1), y0 = ey, z0 = ez, y1 = b.chainY || 5.2, z1 = 0.2;
    const len = Math.hypot(y1 - y0, z1 - z0), ang = Math.atan2(z1 - z0, y1 - y0);
    PE.box(x, (y0 + y1) / 2, (z0 + z1) / 2, 0.05, len, 0.05, [0.3, 0.3, 0.32], TL.iron, 0, ang);
  }
}
