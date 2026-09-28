'use strict';
// ============================================================================
//  UTILITAIRES : maths, aléatoire, bruit, encodage, matrices
// ============================================================================

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const fract = (x) => x - Math.floor(x);

// Générateur pseudo-aléatoire déterministe
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Hash entier 2D -> [0,1)
function hash2i(x, y, seed) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(seed | 0, 144269)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

function hashString(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

// Bruit simplex 2D (graine)
function makeNoise2D(seed) {
  const rnd = mulberry32(seed);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const t = p[i]; p[i] = p[j]; p[j] = t;
  }
  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const GX = [1, -1, 1, -1, 1, -1, 0, 0], GY = [1, 1, -1, -1, 0, 0, 1, -1];
  const F2 = 0.5 * (Math.sqrt(3) - 1), G2 = (3 - Math.sqrt(3)) / 6;
  return function (xin, yin) {
    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s), j = Math.floor(yin + s);
    const t = (i + j) * G2;
    const x0 = xin - (i - t), y0 = yin - (j - t);
    const i1 = x0 > y0 ? 1 : 0, j1 = x0 > y0 ? 0 : 1;
    const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
    const ii = i & 255, jj = j & 255;
    let n = 0;
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 > 0) { const g = perm[ii + perm[jj]] & 7; t0 *= t0; n += t0 * t0 * (GX[g] * x0 + GY[g] * y0); }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 > 0) { const g = perm[ii + i1 + perm[jj + j1]] & 7; t1 *= t1; n += t1 * t1 * (GX[g] * x1 + GY[g] * y1); }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 > 0) { const g = perm[ii + 1 + perm[jj + 1]] & 7; t2 *= t2; n += t2 * t2 * (GX[g] * x2 + GY[g] * y2); }
    return 70 * n;
  };
}

function fbm(noise, x, y, oct, lac = 2, gain = 0.5) {
  let a = 1, f = 1, s = 0, n = 0;
  for (let o = 0; o < oct; o++) {
    s += a * noise(x * f, y * f);
    n += a; a *= gain; f *= lac;
  }
  return s / n;
}

// Bruit de valeur périodique (textures qui se répètent sans couture), [0,1]
function makeTileNoise(seed) {
  return function (x, y, per) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const w = (a) => ((a % per) + per) % per;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = hash2i(w(xi), w(yi), seed), b = hash2i(w(xi + 1), w(yi), seed);
    const c = hash2i(w(xi), w(yi + 1), seed), d = hash2i(w(xi + 1), w(yi + 1), seed);
    return lerp(lerp(a, b, u), lerp(c, d, u), v);
  };
}

function tileFbm(tn, x, y, per, oct) {
  let a = 1, s = 0, n = 0, f = 1;
  for (let o = 0; o < oct; o++) {
    s += a * tn(x * f, y * f, per * f);
    n += a; a *= 0.5; f *= 2;
  }
  return s / n;
}

// Base64 <-> octets
function bytesToB64(u8) {
  let s = '';
  const CH = 0x8000;
  for (let i = 0; i < u8.length; i += CH) s += String.fromCharCode.apply(null, u8.subarray(i, i + CH));
  return btoa(s);
}
function b64ToBytes(b64) {
  const s = atob(b64);
  const u8 = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) u8[i] = s.charCodeAt(i);
  return u8;
}

// ---------------------------------------------------------------------------
//  Matrices 4x4 (colonnes)
// ---------------------------------------------------------------------------
function mat4Perspective(out, fovy, aspect, near, far) {
  const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
  out.fill(0);
  out[0] = f / aspect; out[5] = f;
  out[10] = (far + near) * nf; out[11] = -1;
  out[14] = 2 * far * near * nf;
  return out;
}
function mat4Mul(out, a, b) {
  for (let c = 0; c < 4; c++) {
    const b0 = b[c * 4], b1 = b[c * 4 + 1], b2 = b[c * 4 + 2], b3 = b[c * 4 + 3];
    out[c * 4] = a[0] * b0 + a[4] * b1 + a[8] * b2 + a[12] * b3;
    out[c * 4 + 1] = a[1] * b0 + a[5] * b1 + a[9] * b2 + a[13] * b3;
    out[c * 4 + 2] = a[2] * b0 + a[6] * b1 + a[10] * b2 + a[14] * b3;
    out[c * 4 + 3] = a[3] * b0 + a[7] * b1 + a[11] * b2 + a[15] * b3;
  }
  return out;
}

// Base caméra à partir du lacet / tangage. yaw=0 regarde vers -Z.
function cameraBasis(yaw, pitch) {
  const cp = Math.cos(pitch), sp = Math.sin(pitch), cy = Math.cos(yaw), sy = Math.sin(yaw);
  const f = [-sy * cp, sp, -cy * cp];
  const r = [cy, 0, -sy];
  const u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
  return { f, r, u };
}
function mat4View(out, pos, b) {
  const { f, r, u } = b;
  out[0] = r[0]; out[4] = r[1]; out[8] = r[2]; out[12] = -(r[0] * pos[0] + r[1] * pos[1] + r[2] * pos[2]);
  out[1] = u[0]; out[5] = u[1]; out[9] = u[2]; out[13] = -(u[0] * pos[0] + u[1] * pos[1] + u[2] * pos[2]);
  out[2] = -f[0]; out[6] = -f[1]; out[10] = -f[2]; out[14] = f[0] * pos[0] + f[1] * pos[1] + f[2] * pos[2];
  out[3] = 0; out[7] = 0; out[11] = 0; out[15] = 1;
  return out;
}

// Petits vecteurs
const v3 = {
  len: (a) => Math.hypot(a[0], a[1], a[2]),
  norm: (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  lerp: (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)],
  scale: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
};

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex(c) {
  return '#' + ((1 << 24) | (clamp(c[0] | 0, 0, 255) << 16) | (clamp(c[1] | 0, 0, 255) << 8) | clamp(c[2] | 0, 0, 255)).toString(16).slice(1);
}

// Matrice de Bayer 4x4 (tramage ordonné)
const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const bayer = (x, y) => BAYER4[(y & 3) * 4 + (x & 3)];

// Stockage local sécurisé
const store = {
  get(key, def) {
    try { const v = localStorage.getItem(key); return v == null ? def : JSON.parse(v); } catch (e) { return def; }
  },
  set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch (e) { return false; }
  },
  getRaw(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
  setRaw(key, val) { try { localStorage.setItem(key, val); return true; } catch (e) { return false; } },
  remove(key) { try { localStorage.removeItem(key); } catch (e) { /* ignore */ } },
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
