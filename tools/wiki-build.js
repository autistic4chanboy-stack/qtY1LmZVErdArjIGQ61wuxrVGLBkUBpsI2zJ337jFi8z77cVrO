#!/usr/bin/env node
// ============================================================================
//  LE WIKI DE LA VALLÉE : construit Prairie-Wiki.html, un compagnon HORS JEU
//  (fichier autonome, sans aucune ressource externe, qui s'ouvre dans un
//  navigateur, même en local) : la carte interactive de toute la vallée et
//  les fiches de tout ce que contient le jeu (habitants, objets, recettes,
//  cultures, plantes, arbres, bêtes, poissons, alchimie, livres, langues
//  perdues, semaine, légendes, divinités, lieux…).
//
//    node tools/wiki-build.js                (≈ 1 minute : la vallée est générée)
//    node tools/wiki-build.js --out=chemin/fichier.html --seed=1234
//    node tools/wiki-build.js --dump=base.json   (garde les données extraites)
//    node tools/wiki-build.js --from=base.json   (reconstruit sans régénérer)
//
//  Rien n'est recopié à la main : le jeu est assemblé en mémoire comme le fait
//  build.js (src/NN-*.js, ordre alphabétique), exécuté dans une machine
//  virtuelle Node (DOM simulé, canevas logiciel pour les icônes et les
//  figurines), la vallée est générée, puis les tables du jeu sont lues telles
//  qu'elles sont. Les nouveautés apparaissent donc d'elles-mêmes ; les tables
//  en majuscules qui n'ont pas de section à elles vont dans « Autres tables »,
//  et les propriétés inconnues d'un objet, d'une bête… sont listées sur sa fiche.
//  Les secrets (solutions, lieux cachés, alchimie, fins) restent masqués tant
//  qu'on n'a pas cliqué sur « révéler les secrets ».
// ============================================================================
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const zlib = require('zlib');

const ROOT = path.join(__dirname, '..');
const ARG = (k, d) => { const a = process.argv.find((x) => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const OUT = path.resolve(ARG('out', path.join(ROOT, 'Prairie-Wiki.html')));
const SEED = +ARG('seed', 1234) || 1234;
const T0 = Date.now();
const say = (...a) => console.log(`[${((Date.now() - T0) / 1000).toFixed(1).padStart(6)} s]`, ...a);

// ============================================================================
//  PNG (encodeur minimal : gris, RVB ou RVBA 8 bits, filtres adaptatifs)
// ============================================================================
const CRC_T = (() => { const t = new Int32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c; } return t; })();
function crc32(buf) { let c = -1; for (let i = 0; i < buf.length; i++) c = CRC_T[(c ^ buf[i]) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; }
function pngChunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
// lignes filtrées à la manière du PNG (octet de filtre + données), filtre choisi ligne par ligne
function filterRows(w, h, px, ch) {
  const stride = w * ch, raw = Buffer.alloc((stride + 1) * h), cur = Buffer.alloc(stride);
  const paeth = (a, b, c) => { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); return pa <= pb && pa <= pc ? a : pb <= pc ? b : c; };
  for (let y = 0; y < h; y++) {
    const o = y * stride, prev = y ? o - stride : -1;
    let best = 0, bestSum = Infinity, bestBuf = null;
    for (let f = 0; f < 5; f++) {
      let sum = 0;
      for (let i = 0; i < stride; i++) {
        const x = px[o + i], a = i >= ch ? px[o + i - ch] : 0, b = prev >= 0 ? px[prev + i] : 0, c = prev >= 0 && i >= ch ? px[prev + i - ch] : 0;
        const v = (f === 0 ? x : f === 1 ? x - a : f === 2 ? x - b : f === 3 ? x - ((a + b) >> 1) : x - paeth(a, b, c)) & 255;
        cur[i] = v; sum += v < 128 ? v : 256 - v;
      }
      if (sum < bestSum) { bestSum = sum; best = f; bestBuf = Buffer.from(cur); }
    }
    raw[y * (stride + 1)] = best; bestBuf.copy(raw, y * (stride + 1) + 1);
  }
  return raw;
}
function encodePNG(w, h, px, ch = 4) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = ch === 1 ? 0 : ch === 3 ? 2 : 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), pngChunk('IHDR', ihdr), pngChunk('IDAT', zlib.deflateSync(filterRows(w, h, px, ch), { level: 9, memLevel: 9 })), pngChunk('IEND', Buffer.alloc(0))]);
}
const pngURL = (w, h, px, ch) => 'data:image/png;base64,' + encodePNG(w, h, px, ch).toString('base64');
// grille de données compressée (lignes filtrées + deflate brut) : décodée par la page (inflate maison)
const packGrid = (w, h, px, ch = 1) => ({ w, h, ch, z: zlib.deflateRawSync(filterRows(w, h, px, ch), { level: 9, memLevel: 9 }).toString('base64') });
const packBytes = (buf) => ({ n: buf.byteLength, z: zlib.deflateRawSync(Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength), { level: 9 }).toString('base64') });

// ============================================================================
//  CANEVAS LOGICIEL (juste ce que le jeu utilise pour ses images :
//  putImageData, getImageData, drawImage, fillRect, toDataURL)
// ============================================================================
const URL_TO_CANVAS = new Map(); // adresse data: rendue -> canevas (pour retrouver les pixels d'une icône)
class FakeImageData { constructor(a, b, c) { if (typeof a === 'number') { this.width = a; this.height = b; this.data = new Uint8ClampedArray(a * b * 4); } else { this.data = a; this.width = b; this.height = c ?? (a.length / 4 / b); } } }
function parseColor(s) {
  if (typeof s !== 'string') return [0, 0, 0, 1];
  let m = s.match(/^#([0-9a-f]{3,8})$/i);
  if (m) { let h = m[1]; if (h.length <= 4) h = h.split('').map((c) => c + c).join(''); const n = parseInt(h.slice(0, 6), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255, h.length === 8 ? parseInt(h.slice(6), 16) / 255 : 1]; }
  m = s.match(/^rgba?\(([^)]+)\)$/i);
  if (m) { const p = m[1].split(',').map((x) => parseFloat(x)); return [p[0] | 0, p[1] | 0, p[2] | 0, p.length > 3 ? p[3] : 1]; }
  return [0, 0, 0, 1];
}
class FakeCanvas {
  constructor() { this._w = 300; this._h = 150; this._d = null; this._ctx = null; this.style = {}; }
  get width() { return this._w; } set width(v) { this._w = Math.max(0, v | 0); this._d = null; }
  get height() { return this._h; } set height(v) { this._h = Math.max(0, v | 0); this._d = null; }
  get data() { if (!this._d || this._d.length !== this._w * this._h * 4) this._d = new Uint8ClampedArray(this._w * this._h * 4); return this._d; }
  getContext() { if (!this._ctx) this._ctx = fakeContext(this); return this._ctx; }
  toDataURL() { const u = pngURL(this._w || 1, this._h || 1, this._w && this._h ? this.data : new Uint8ClampedArray(4)); URL_TO_CANVAS.set(u, this); return u; }
  addEventListener() {} removeEventListener() {} setAttribute() {} getBoundingClientRect() { return { left: 0, top: 0, width: this._w, height: this._h }; }
}
function fakeContext(cv) {
  const blend = (D, o, r, g, b, a) => { if (a >= 255) { D[o] = r; D[o + 1] = g; D[o + 2] = b; D[o + 3] = 255; return; } if (a <= 0) return; const k = a / 255, da = D[o + 3] / 255, oa = k + da * (1 - k); D[o] = (r * k + D[o] * da * (1 - k)) / oa; D[o + 1] = (g * k + D[o + 1] * da * (1 - k)) / oa; D[o + 2] = (b * k + D[o + 2] * da * (1 - k)) / oa; D[o + 3] = oa * 255; };
  const ctx = {
    canvas: cv, fillStyle: '#000', strokeStyle: '#000', globalAlpha: 1, imageSmoothingEnabled: false, lineWidth: 1, font: '10px sans-serif',
    putImageData(img, dx, dy) {
      const D = cv.data, W = cv._w, H = cv._h, S = img.data, w = img.width, h = img.height;
      for (let y = 0; y < h; y++) { const Y = y + (dy | 0); if (Y < 0 || Y >= H) continue; for (let x = 0; x < w; x++) { const X = x + (dx | 0); if (X < 0 || X >= W) continue; const s = (y * w + x) * 4, o = (Y * W + X) * 4; D[o] = S[s]; D[o + 1] = S[s + 1]; D[o + 2] = S[s + 2]; D[o + 3] = S[s + 3]; } }
    },
    getImageData(sx, sy, w, h) {
      const D = cv.data, W = cv._w, H = cv._h, out = new Uint8ClampedArray(w * h * 4);
      for (let y = 0; y < h; y++) { const Y = y + sy; if (Y < 0 || Y >= H) continue; for (let x = 0; x < w; x++) { const X = x + sx; if (X < 0 || X >= W) continue; const s = (Y * W + X) * 4, o = (y * w + x) * 4; out[o] = D[s]; out[o + 1] = D[s + 1]; out[o + 2] = D[s + 2]; out[o + 3] = D[s + 3]; } }
      return new FakeImageData(out, w, h);
    },
    createImageData(w, h) { return new FakeImageData(typeof w === 'object' ? w.width : w, typeof w === 'object' ? w.height : h); },
    drawImage(src, ...a) {
      if (!src || !(src instanceof FakeCanvas)) return;
      let sx = 0, sy = 0, sw = src._w, sh = src._h, dx, dy, dw, dh;
      if (a.length <= 4) { [dx, dy, dw = sw, dh = sh] = a; } else { [sx, sy, sw, sh, dx, dy, dw, dh] = a; }
      const S = src.data, SW = src._w, D = cv.data, W = cv._w, H = cv._h, ga = ctx.globalAlpha;
      for (let y = 0; y < Math.round(dh); y++) {
        const Y = Math.round(dy) + y; if (Y < 0 || Y >= H) continue;
        const syy = Math.floor(sy + (y + 0.5) * sh / dh); if (syy < 0 || syy >= src._h) continue;
        for (let x = 0; x < Math.round(dw); x++) {
          const X = Math.round(dx) + x; if (X < 0 || X >= W) continue;
          const sxx = Math.floor(sx + (x + 0.5) * sw / dw); if (sxx < 0 || sxx >= SW) continue;
          const s = (syy * SW + sxx) * 4; blend(D, (Y * W + X) * 4, S[s], S[s + 1], S[s + 2], S[s + 3] * ga);
        }
      }
    },
    fillRect(x, y, w, h) {
      const [r, g, b, al] = parseColor(ctx.fillStyle), D = cv.data, W = cv._w, H = cv._h, a = al * ctx.globalAlpha * 255;
      for (let Y = Math.max(0, Math.round(y)); Y < Math.min(H, Math.round(y + h)); Y++) for (let X = Math.max(0, Math.round(x)); X < Math.min(W, Math.round(x + w)); X++) blend(D, (Y * W + X) * 4, r, g, b, a);
    },
    clearRect(x, y, w, h) { const D = cv.data, W = cv._w, H = cv._h; for (let Y = Math.max(0, Math.round(y)); Y < Math.min(H, Math.round(y + h)); Y++) for (let X = Math.max(0, Math.round(x)); X < Math.min(W, Math.round(x + w)); X++) D.fill(0, (Y * W + X) * 4, (Y * W + X) * 4 + 4); },
    measureText(t) { return { width: String(t).length * 6 }; },
  };
  // le reste (tracés, texte, transformations…) est ignoré sans erreur
  return new Proxy(ctx, { get: (t, k) => (k in t ? t[k] : typeof k === 'string' ? () => {} : undefined), set: (t, k, v) => { t[k] = v; return true; } });
}

// ============================================================================
//  BAC À SABLE : le jeu entier dans une machine virtuelle, DOM simulé
// ============================================================================
function loadGame(log = []) {
  const src = path.join(ROOT, 'src');
  const files = fs.readdirSync(src).filter((f) => /^\d\d-.*\.js$/.test(f)).sort();
  const texts = files.map((f) => [f, fs.readFileSync(path.join(src, f), 'utf8')]);
  const js = texts.map(([f, t]) => `// ---- ${f}\n` + t).join('\n');
  let ctx = makeContext();
  try { vm.runInContext(js, ctx, { filename: 'prairie.js' }); }
  catch (e) {
    // le jeu ne se charge pas d'un bloc dans le bac à sable : on repère le module, puis on charge module par module
    const m = String(e && e.stack).match(/prairie\.js:(\d+)/);
    let where = '';
    if (m) { let line = +m[1], acc = 0; for (const [f, t] of texts) { const n = t.split('\n').length + 1; if (line <= acc + n) { where = ` (${f}, ligne ${line - acc - 1})`; break; } acc += n; } }
    log.push(`le jeu ne se charge pas d’un seul bloc${where} : ${e && e.message} — chargement module par module`);
    ctx = makeContext();
    for (const [f, t] of texts) { try { vm.runInContext('"use strict";\n' + t, ctx, { filename: f }); } catch (e2) { log.push(`module ${f} : ${e2 && e2.message}`); } }
  }
  const run = (code) => vm.runInContext(code, ctx);
  const has = (name) => { try { return run(`typeof ${name} !== 'undefined'`); } catch (e) { return false; } };
  const get = (name) => (has(name) ? run(name) : undefined);
  const call = (fnExpr, ...args) => { ctx.__args = args; try { return run(`(${fnExpr})(...__args)`); } finally { ctx.__args = null; } };
  return { ctx, run, has, get, call, files, texts };
}
function makeContext() {
  const stub = () => new Proxy(function () {}, { get: (t, k) => (k === Symbol.toPrimitive ? () => 0 : k === 'length' ? 0 : k === 'then' ? undefined : stub()), apply: () => stub(), construct: () => stub(), set: () => true });
  const noop = () => {};
  const store = new Map();
  const ctx = {
    console: { log: noop, info: noop, debug: noop, warn: noop, error: (...a) => process.env.WIKI_DEBUG && console.error('[jeu]', ...a) },
    Math, JSON, Date, Object, Array, String, Number, Boolean, Set, Map, WeakMap, WeakSet, Float32Array, Uint8Array, Uint16Array, Int32Array, Uint32Array, Uint8ClampedArray, Float64Array, Int8Array, Int16Array, ArrayBuffer, DataView,
    // (les minuteries gardent le processus en vie : generateValley en attend ; main() finit par process.exit)
    Promise, setTimeout: (f, ms, ...a) => { setTimeout(() => { try { f(...a); } catch (e) { /* ignoré */ } }, Math.min(ms || 0, 50)); return 0; }, clearTimeout: noop, setInterval: () => 0, clearInterval: noop,
    parseInt, parseFloat, isNaN, isFinite, Symbol, Proxy, Reflect, Error, RegExp, TypeError, RangeError, encodeURIComponent, decodeURIComponent, escape, unescape, Intl,
    ImageData: FakeImageData, Image: function () { return stub(); }, Audio: function () { return stub(); }, AudioContext: function () { return stub(); },
    window: null, document: null, navigator: { userAgent: 'node', language: 'fr' }, location: { href: 'file:///wiki', hash: '', search: '' },
    localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) },
    performance: { now: () => Date.now() }, requestAnimationFrame: () => 0, cancelAnimationFrame: noop,
    btoa: (s) => Buffer.from(String(s), 'binary').toString('base64'), atob: (s) => Buffer.from(String(s), 'base64').toString('binary'),
    MutationObserver: function () { return { observe: noop, disconnect: noop }; }, ResizeObserver: function () { return { observe: noop, disconnect: noop }; },
    fetch: () => Promise.reject(new Error('hors ligne')), queueMicrotask: (f) => Promise.resolve().then(f),
  };
  ctx.document = { querySelector: () => stub(), querySelectorAll: () => [], getElementById: () => stub(), getElementsByTagName: () => [], getElementsByClassName: () => [], addEventListener: noop, removeEventListener: noop,
    createElement: (tag) => (String(tag).toLowerCase() === 'canvas' ? new FakeCanvas() : stub()), createElementNS: () => stub(), createTextNode: () => stub(), body: stub(), head: stub(), documentElement: stub(), fonts: { ready: Promise.resolve() }, hidden: false, visibilityState: 'visible', readyState: 'complete', pointerLockElement: null, exitPointerLock: noop };
  // la fenêtre est l'objet global, comme dans un navigateur
  Object.assign(ctx, { addEventListener: noop, removeEventListener: noop, dispatchEvent: noop, devicePixelRatio: 1, innerWidth: 1280, innerHeight: 800, getComputedStyle: () => stub(), matchMedia: () => ({ matches: false, addEventListener: noop, removeEventListener: noop }), speechSynthesis: undefined, open: noop, alert: noop, confirm: () => false, prompt: () => null });
  ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
  vm.createContext(ctx);
  return ctx;
}

// ============================================================================
//  OUTILS
// ============================================================================
const tagOf = (v) => Object.prototype.toString.call(v);
// copie « données » d'une valeur du jeu : sans fonctions, ni cycles, ni tableaux typés ; Set -> tableau, Map -> objet
function jclone(v, depth = 0, stack = []) {
  if (v === null || v === undefined) return null;
  const t = typeof v;
  if (t === 'string' || t === 'boolean') return v;
  if (t === 'number') return Number.isFinite(v) ? v : null;
  if (t !== 'object') return undefined;
  if (depth > 14 || ArrayBuffer.isView(v) || stack.includes(v)) return undefined;
  const tag = tagOf(v);
  if (tag === '[object Promise]' || tag === '[object WeakMap]' || tag === '[object WeakSet]') return undefined;
  stack.push(v);
  let out;
  try {
    if (Array.isArray(v)) out = v.map((x) => { const c = jclone(x, depth + 1, stack); return c === undefined ? null : c; });
    else if (tag === '[object Set]') out = [...v].map((x) => jclone(x, depth + 1, stack)).filter((x) => x !== undefined);
    else if (tag === '[object Map]') { out = {}; for (const [k, x] of v) { const c = jclone(x, depth + 1, stack); if (c !== undefined) out[String(k)] = c; } }
    else { out = {}; for (const k of Object.keys(v)) { let x; try { x = v[k]; } catch (e) { continue; } const c = jclone(x, depth + 1, stack); if (c !== undefined) out[k] = c; } }
  } finally { stack.pop(); }
  return out;
}
// textes « de prose » contenus dans une valeur (pour trier les tables intéressantes)
function proseStats(v) {
  let prose = 0, code = 0, n = 0;
  const walk = (x, d) => {
    if (x == null || d > 8) return;
    if (typeof x === 'string') { n++; if (/(gl_|uniform |vec[234]\(|void main|=>|function\s*\(|#version|precision )/.test(x)) code++; else if (x.length >= 14 && /\s/.test(x) && /[a-zàâçéèêëîïôûùüÿœ]{3}/i.test(x)) prose += x.length; return; }
    if (typeof x !== 'object') return;
    for (const k in x) walk(x[k], d + 1);
  };
  walk(v, 0);
  return { prose, code, n };
}
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const cap = (s) => (s ? String(s)[0].toUpperCase() + String(s).slice(1) : '');
const nfmt = (n) => (typeof n === 'number' ? (Math.round(n * 100) / 100).toString().replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : String(n));
const hours = (h) => { const H = Math.floor(h + 1e-6), M = Math.round((h - H) * 60); return (H % 24) + ' h' + (M ? String(M).padStart(2, '0') : ''); };
const plur = (n, one, many) => nfmt(n) + ' ' + (n > 1 ? many : one);
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const uniq = (a) => [...new Set(a)];
const RAR_DEF = ['commune', 'peu commune', 'rare', 'très rare', 'légendaire'];

// ============================================================================
//  IMAGES : planche d'icônes (cases de 32 px), planche de figurines (rangées)
// ============================================================================
class Shelf {
  constructor(W = 1024) { this.W = W; this.x = 0; this.y = 0; this.rowH = 0; this.list = []; }
  add(cv) {
    const w = cv.width, h = cv.height;
    if (!w || !h) return null;
    if (this.x + w > this.W) { this.x = 0; this.y += this.rowH + 2; this.rowH = 0; }
    const r = [this.x, this.y, w, h];
    this.list.push([r, cv]); this.x += w + 2; this.rowH = Math.max(this.rowH, h);
    return r;
  }
  png() {
    const H = Math.max(1, this.y + this.rowH), out = new Uint8ClampedArray(this.W * H * 4);
    for (const [[x0, y0, w, h], cv] of this.list) { const d = cv.data; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const s = (y * w + x) * 4, o = ((y0 + y) * this.W + x0 + x) * 4; out[o] = d[s]; out[o + 1] = d[s + 1]; out[o + 2] = d[s + 2]; out[o + 3] = d[s + 3]; } }
    return { url: pngURL(this.W, H, out), w: this.W, h: H };
  }
}
// canevas (faux) à partir de pixels
function canvasOf(w, h, data) { const c = new FakeCanvas(); c.width = w; c.height = h; if (data) c.data.set(data); return c; }
// recadre un canevas sur ses pixels non transparents (+ marge)
function trim(cv, pad = 1) {
  const w = cv.width, h = cv.height, d = cv.data;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 < 0) return cv;
  x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(w - 1, x1 + pad); y1 = Math.min(h - 1, y1 + pad);
  const W = x1 - x0 + 1, H = y1 - y0 + 1, out = new Uint8ClampedArray(W * H * 4);
  for (let y = 0; y < H; y++) out.set(d.subarray(((y0 + y) * w + x0) * 4, ((y0 + y) * w + x0 + W) * 4), y * W * 4);
  return canvasOf(W, H, out);
}

// ============================================================================
//  PHASE 1 : EXTRACTION (le jeu tourne dans la machine virtuelle)
// ============================================================================
// tables que les sections dédiées lisent (les autres, si elles contiennent du texte, vont dans « Autres tables »)
const TECH_TABLES = /^(GLSL_|SH$|TEX_|MAX_|CHUNK$|RING$|PC\d*$|NOC$|TL$|WHITE$|M34_ID$|FX_EMIT$|BAYER4$|TAU$|DEG$|TS$|PX_PER_M$|EMISSIVE_A$|SPR_L$|TINT_A$|VM(_W|_H)?$|SKIN|ATLAS$|ICON3D$|PE$|HOOKS$|BUFF$|ROUTINES$|LANG_GLYPHS$|SKY_KEYS$|INT_UNIFORMS$|DEFAULT_SETTINGS$|BIOME_FOG$|MAZE$|UNDER_SLOTS$|TOWN_PROP_R$|PROP_COLL$|PROP_LIGHTS$|APAL$|PAL$|FLORA_PAL$|BARK_PAL$|SPECIES$|VILLAGER_LOOKS$|SLEEVE$|CROP_TPL$|SIGIL_GLYPHS$|SIGIL_COL$|WEATHER_PRESETS$|WEATHER_ICONS$|HAND_ICON$|OBJ_INDEX$|NPC_BY_ID$|INSCR_BY_ID$|MATERIALS$|TERRAIN_MATS$|BLOCK_MATS$|M_[A-Z0-9_]+$|F_[A-Z0-9_]+$|GRID_CELL$|WORLD_FORMAT$|FARM_KEY$|HISTORY_KEY$|ANIMAL_RIGS$|PROP_MODELS$|CROP_MODELS$|PROP_USE(_MORE)?$|ENVERS_SPRITES$|STRANGE_MORE$|BUILDS$|TOOL_DMG$|HORSE_FOOD$|OFFER_VALUE$|MASS$|VALLEY_N$|GEN_VERSION$|VALLEY_GEN$|DESIGN_OFF$|VER_ALL$|VER_ENVERS$|TERRA_STEP$|JOUR_SECONDES$|P_RADIUS$|BAR_DEFAULT$|ALCH_OK$|DYN_PROPS$|FLAMMABLE$|STRIKE_TREES$|TREE_IDS$|SHAPES$|BLOCK_PRESETS$|GRASS_VARIANTS$|SEED_ROTATE$|CROP_FOOD$|OLD_VARS$|TIER_COL$|NAME_[AB]$|WHEN_H$|FIRST_NAMES$|HAND_GROUPS$|BAR_TOKENS$|INT_|SHOP_DOORS$|NPC_NEW$)/;

async function extract() {
  say('assemblage du jeu (src/NN-*.js) dans une machine virtuelle…');
  const log = [];
  const G = loadGame(log);
  const DB = { meta: { built: new Date().toISOString(), seed: SEED, modules: G.files.length }, tables: {}, order: {}, derived: {}, world: {}, images: {}, log };
  const safe = (label, fn, d) => { try { return fn(); } catch (e) { DB.log.push(label + ' : ' + (e && e.message)); say('  ⚠', label, '—', e && e.message); return d; } };
  say(`jeu chargé (${G.files.length} modules)`);

  // ---------------------------------------------------------------- les tables en majuscules
  const seenName = new Set();
  for (const [file, text] of G.texts) {
    for (const m of text.matchAll(/^(?:const|let|var)\s+([A-Z][A-Z0-9_]*)\s*=/gm)) {
      const name = m[1];
      if (seenName.has(name)) continue;
      seenName.add(name);
      if (TECH_TABLES.test(name)) continue;
      const v = safe('table ' + name, () => G.get(name));
      if (v === undefined || v === null || typeof v === 'function' || typeof v !== 'object') continue;
      const c = safe('copie ' + name, () => jclone(v));
      if (c === undefined || c === null) continue;
      DB.tables[name] = { file, v: c };
    }
  }
  // ordre d'insertion de ITEMS (celui du jeu) et prix, noms tels qu'après tous les modules
  say(`${Object.keys(DB.tables).length} tables lues`);

  // ---------------------------------------------------------------- textures, sprites, peaux (pour les images)
  safe('textures', () => G.run('buildMaterialTextures()'));
  safe('sprites', () => G.run('buildSpriteAtlas()'));
  safe('peaux', () => G.run('buildSkinAtlas()'));
  DB.derived.mats = safe('matières', () => G.get('MATERIALS').map((m, i) => ({ i, id: m.id, name: m.name, terrain: !!m.terrain, avg: m.avg ? m.avg.map((x) => Math.round(x)) : null })), []);
  say('textures et sprites prêts');

  // ---------------------------------------------------------------- icônes des objets (celles du jeu : iconURL)
  {
    const ITEMS = G.get('ITEMS') || {};
    const ids = Object.keys(ITEMS), COLS = 32, S = 32, rows = Math.max(1, Math.ceil(ids.length / COLS));
    const sheet = new Uint8ClampedArray(COLS * S * rows * S * 4), index = {};
    let n = 0;
    ids.forEach((id) => {
      const cv = safe('icône ' + id, () => { const u = G.call('(id) => iconURL(id)', id); return u ? URL_TO_CANVAS.get(u) : null; });
      if (!cv || !cv.width) return;
      const i = n++, k = Math.max(1, Math.floor(S / Math.max(cv.width, cv.height))), ox = (i % COLS) * S + Math.floor((S - cv.width * k) / 2), oy = Math.floor(i / COLS) * S + Math.floor((S - cv.height * k) / 2), d = cv.data;
      for (let y = 0; y < cv.height * k; y++) for (let x = 0; x < cv.width * k; x++) { const s = (Math.floor(y / k) * cv.width + Math.floor(x / k)) * 4, o = ((oy + y) * COLS * S + ox + x) * 4; sheet[o] = d[s]; sheet[o + 1] = d[s + 1]; sheet[o + 2] = d[s + 2]; sheet[o + 3] = d[s + 3]; }
      index[id] = i;
    });
    const H = Math.max(1, Math.ceil(n / COLS)) * S;
    DB.images.icons = { url: pngURL(COLS * S, H, sheet.subarray(0, COLS * S * H * 4)), cols: COLS, cell: S, n, index };
    say(`${n} icônes d'objets`);
  }

  // ---------------------------------------------------------------- figurines : habitants, bêtes, apparitions, plantes
  {
    const shelf = new Shelf(1024), fig = {};
    const renderRig = (rigExpr, S) => G.run(`(() => { const rig = ${rigExpr}; const boxes = ICON3D.capture((cap) => { const M = new Float32Array(12); m34Root(M, 0, 0, 0, 0, 1); rig.emit(cap, M, 0); }); return boxes.length ? ICON3D.render(boxes, ${S}) : null; })()`);
    const human = (lookExpr, S, bust) => renderRig(`(() => { const r = humanRig(${lookExpr}); try { poseHuman(r, { t: 0, move: 0 }); } catch (e) {} ${bust ? "for (const q of r.parts) if (/^(leg|shoe|skirt|coatTail|foot|feet|knee|thigh|shin|calf|boot|ankle|toe)/i.test(q.name)) q.hide = true;" : ''} return r; })()`, S);
    for (const d of G.get('NPC_DATA') || []) {
      const L = `Object.assign({}, NPC_BY_ID[${JSON.stringify(d.id)}].look, { held: (typeof NPC_HELD !== 'undefined' && NPC_HELD[${JSON.stringify(d.id)}]) || null, old: (NPC_BY_ID[${JSON.stringify(d.id)}].age || 30) >= 60 })`;
      const full = safe('figurine ' + d.id, () => human(L, 128, false));
      const bust = safe('buste ' + d.id, () => human(L, 64, true));
      fig['pnj:' + d.id] = { full: full ? shelf.add(trim(full)) : null, bust: bust ? shelf.add(trim(bust)) : null };
    }
    // les apparitions (tout ce qui ressemble à une silhouette : …_LOOK)
    for (const name of Object.keys(DB.tables).concat([...seenName]).filter((k, i, a) => /_LOOK$/.test(k) && a.indexOf(k) === i)) {
      const v = G.get(name);
      if (!v || typeof v !== 'object' || !('skin' in v || 'top' in v)) continue;
      const full = safe('figurine ' + name, () => human(name, 128, false));
      if (full) fig['look:' + name] = { full: shelf.add(trim(full)) };
      DB.tables[name] = DB.tables[name] || { file: '', v: jclone(v) };
    }
    // les bêtes (modèles en boîtes)
    for (const k of Object.keys(G.get('CREATURES') || {})) {
      const cv = safe('bête ' + k, () => renderRig(`(() => { const cfg = CREATURES[${JSON.stringify(k)}]; const rig = ANIMAL_RIGS[cfg.rig](1); try { if (rig.kind === 'bird') poseBird(rig, { t: 0, move: 0 }); else poseQuad(rig, { t: 0, move: 0 }); } catch (e) {} return rig; })()`, 96));
      if (cv) fig['an:' + k] = { full: shelf.add(trim(cv)) };
    }
    // plantes, arbres, champignons… (sprites du décor)
    const OT = G.get('OBJ_TYPES') || [];
    OT.forEach((t) => {
      if (!t || !t.spr || !t.spr[0] || t.animal || fig['pl:' + t.id]) return;
      if (!/^(Arbres|Fleurs|Champignons|Végétation|Rochers)$/.test(t.cat || '')) return;
      const s = G.run(`ATLAS.sprites[${JSON.stringify(t.spr[0])}]`);
      if (s && s.canvas && s.canvas.width) fig['pl:' + t.id] = { full: shelf.add(trim(s.canvas, 0)) };
    });
    DB.images.figures = Object.assign(shelf.png(), { index: fig });
    say(`${Object.keys(fig).length} figurines`);
  }

  // ---------------------------------------------------------------- l'écriture des langues perdues (code du jeu embarqué)
  DB.derived.langCode = safe('écriture', () => {
    const parts = [];
    parts.push('const TAU = Math.PI * 2;');
    for (const f of ['mulberry32', 'hashString']) if (G.has(f)) parts.push(G.run(`${f}.toString()`));
    if (G.has('clamp')) parts.push('const clamp = ' + G.run('clamp.toString()') + ';');
    parts.push('const LANG_GLYPHS = {};');
    if (G.has('langWords')) parts.push('const langWords = ' + G.run('langWords.toString()') + ';');
    for (const f of ['langGlyph', 'langCanvas']) if (G.has(f)) parts.push(G.run(`${f}.toString()`));
    return parts.join('\n');
  }, '');

  // ---------------------------------------------------------------- partie neuve : état minimal, puis la vallée
  safe('partie', () => G.run(`farm.s = farm.blank(${SEED}); farm.names = (typeof VALLEY_DESIGN !== 'undefined' && VALLEY_DESIGN.names) ? Object.assign({}, VALLEY_DESIGN.names) : { ville: 'la ville', hameau: 'le hameau' };`));
  DB.derived.names = safe('noms', () => jclone(G.run('farm.names')), { ville: 'la ville', hameau: 'le hameau' });
  DB.derived.valleyGen = safe('version', () => G.get('VALLEY_GEN'), 3);
  DB.derived.jour = safe('journée', () => G.get('JOUR_SECONDES'), null);

  // les routines des douze jours (fonction du jeu : routineDuJour)
  DB.derived.routines = safe('routines', () => G.run(`(() => {
    const out = {}, S = farm.s, d0 = S.day;
    const nJ = typeof SEMAINE !== 'undefined' ? SEMAINE.length : 12;
    for (const d of NPC_DATA) {
      out[d.id] = [];
      for (let k = 0; k < nJ; k++) {
        S.day = k + 1 + 12 * 7;
        let r = null;
        try { r = typeof routineDuJour === 'function' ? routineDuJour({ id: d.id, d, st: { alive: true, name: d.names && d.names[0] } }) : d.schedule; } catch (e) { r = d.schedule; }
        out[d.id].push(JSON.parse(JSON.stringify(r || [])));
      }
    }
    S.day = d0;
    return out;
  })()`), {});
  DB.derived.fishRarete = safe('rareté des poissons', () => (G.has('fishRarete') ? G.run('Object.fromEntries(Object.keys(FISH).map((k) => [k, fishRarete(k)]))') : {}), {});

  say(`génération de la vallée (graine ${SEED}, ≈ 45 s ou davantage si la machine est chargée)…`);
  const w = await G.run(`generateValley(${SEED}, () => {}, typeof VALLEY_GEN !== 'undefined' ? VALLEY_GEN : 3)`);
  G.ctx.__w = w;
  safe('monde courant', () => G.run('game.world = __w; farm.w = __w;'));
  say(`vallée générée : ${w.objects.length} objets, ${w.props.length} objets posés, ${w.blocks.length} blocs`);
  safe('carte', () => extractWorld(G, w, DB));
  say('carte extraite');
  return DB;
}

// ---------------------------------------------------------------- le monde : grilles et tracés de la carte
function extractWorld(G, w, DB) {
  const N = w.N, W1 = w.W, S = w.size, WL = w.waterLevel;
  const W = DB.world;
  W.size = S; W.waterLevel = WL; W.cell = w.cell; W.snowLine = w.snowLine || null; W.n = N;
  // sol (2 m) : matière du sommet + eau (sous le niveau de l'eau)
  const R2 = N, ground = new Uint8Array(R2 * R2);
  for (let j = 0; j < R2; j++) for (let i = 0; i < R2; i++) { const v = j * W1 + i; ground[j * R2 + i] = (w.mats[v] & 63) | (w.heights[v] < WL ? 64 : 0); }
  W.ground = packGrid(R2, R2, ground);
  // relief (4 m) : ombrage (méthode de Horn sur la grille de 2 m) et altitude quantifiée
  const R4 = N >> 1, shade = new Uint8Array(R4 * R4), alt = new Uint8Array(R4 * R4);
  let hmin = 1e9, hmax = -1e9;
  for (let k = 0; k < w.heights.length; k++) { const h = w.heights[k]; if (h < hmin) hmin = h; if (h > hmax) hmax = h; }
  const amin = Math.floor(hmin - WL), amax = Math.ceil(hmax - WL);
  // courbe de quantification : fine dans la vallée, grossière en haute montagne
  const knots = [[amin, 0], [0, Math.min(40, Math.max(8, Math.round(-amin * 2)))], [Math.min(100, amax), 180], [Math.max(amax, 101), 255]];
  const quant = (a) => { for (let k = 1; k < knots.length; k++) if (a <= knots[k][0] || k === knots.length - 1) { const [a0, q0] = knots[k - 1], [a1, q1] = knots[k]; return Math.max(0, Math.min(255, Math.round(q0 + (a - a0) / (a1 - a0 || 1) * (q1 - q0)))); } return 255; };
  const H = (i, j) => w.heights[Math.min(N, Math.max(0, j)) * W1 + Math.min(N, Math.max(0, i))];
  const cell = w.cell, zf = 1.7, L = [-0.55, 0.62, -0.55], Ln = Math.hypot(...L);
  for (let j = 0; j < R4; j++) for (let i = 0; i < R4; i++) {
    const ci = i * 2 + 1, cj = j * 2 + 1;
    const a = H(ci - 1, cj - 1), b = H(ci, cj - 1), c = H(ci + 1, cj - 1), d = H(ci - 1, cj), f = H(ci + 1, cj), g = H(ci - 1, cj + 1), h = H(ci, cj + 1), k = H(ci + 1, cj + 1);
    const dx = ((c + 2 * f + k) - (a + 2 * d + g)) / (8 * cell), dz = ((g + 2 * h + k) - (a + 2 * b + c)) / (8 * cell);
    const nx = -dx * zf, nz = -dz * zf, nl = Math.hypot(nx, 1, nz);
    const s = (nx * L[0] + L[1] + nz * L[2]) / (nl * Ln);
    shade[j * R4 + i] = Math.max(0, Math.min(252, Math.round(s * 255 / 4) * 4)); // par pas de 4 : invisible, et bien plus compact
    const hc = (H(ci, cj) + H(ci + 1, cj) + H(ci, cj + 1) + H(ci + 1, cj + 1)) / 4;
    alt[j * R4 + i] = quant(hc - WL);
  }
  W.shade = packGrid(R4, R4, shade); W.shadeFlat = Math.round(L[1] / Ln * 255);
  W.alt = packGrid(R4, R4, alt); W.altKnots = knots;
  // forêts (4 m) : densité d'arbres lissée
  const OT = G.get('OBJ_TYPES');
  const trees = new Float32Array(R4 * R4);
  const counts = {}, pos = {};
  for (const o of w.objects) {
    const t = OT[o.t]; if (!t) continue;
    counts[t.id] = (counts[t.id] || 0) + 1;
    if (o.gone) continue;
    if (t.cat === 'Arbres') { const i = Math.floor(o.x / S * R4), j = Math.floor(o.z / S * R4); if (i >= 0 && j >= 0 && i < R4 && j < R4) trees[j * R4 + i] += 1; }
    if (/^(Arbres|Fleurs|Champignons|Végétation|Animaux)$/.test(t.cat || '') && t.id !== 'villager') (pos[t.id] || (pos[t.id] = [])).push(Math.round(o.x), Math.round(o.z));
  }
  const blur = (src) => { const out = new Float32Array(src.length); for (let j = 0; j < R4; j++) for (let i = 0; i < R4; i++) { let s = 0, n = 0; for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const x = i + di, y = j + dj; if (x < 0 || y < 0 || x >= R4 || y >= R4) continue; s += src[y * R4 + x]; n++; } out[j * R4 + i] = s / n; } return out; };
  const tb = blur(blur(trees)), forest = new Uint8Array(R4 * R4);
  for (let k = 0; k < tb.length; k++) forest[k] = Math.min(240, Math.round(tb[k] * 300 / 16) * 16);
  W.forest = packGrid(R4, R4, forest);
  W.objCounts = counts;
  // positions des espèces (plafonnées, tirage régulier) : Uint16 x, z en mètres
  {
    const idx = {}, chunks = []; let off = 0;
    for (const id of Object.keys(pos)) {
      const p = pos[id], n = p.length / 2, CAP = 700, step = Math.max(1, n / CAP), arr = [];
      for (let k = 0; k < n && arr.length < CAP * 2; k += step) { const q = Math.floor(k) * 2; arr.push(Math.max(0, Math.min(65535, p[q])), Math.max(0, Math.min(65535, p[q + 1]))); }
      idx[id] = [off, arr.length / 2, n]; chunks.push(...arr); off += arr.length / 2;
    }
    W.species = { idx, data: packBytes(Uint16Array.from(chunks)) };
  }
  // milieux (8 m) : la fonction du jeu (milieuAt), sinon les biomes
  const HAB = G.get('HABITATS') || {};
  const habKeys = Object.keys(HAB);
  const R8 = N >> 2;
  const mil = G.run(`(() => {
    const w = __w, R = ${R8}, S = w.size, keys = ${JSON.stringify(habKeys)}, out = new Uint8Array(R * R);
    const hasM = typeof milieuAt === 'function';
    const biomeKey = { plaine: 'pres', foret: 'foret', marais: 'marais', lande: 'lande', hauteurs: 'alpage', lac: 'berges', ville: 'ville', ferme: 'ferme', bouleaux: 'bouleaux' };
    for (let j = 0; j < R; j++) for (let i = 0; i < R; i++) {
      const x = (i + 0.5) * S / R, z = (j + 0.5) * S / R;
      if (w.heightAt(x, z) < w.waterLevel - 0.2) { out[j * R + i] = 0; continue; }
      let k = null;
      try { k = hasM ? milieuAt(w, x, z) : (w.biome ? biomeKey[BIOMES[w.biome[Math.min(w.biomeW - 1, Math.floor(z / 8)) * w.biomeW + Math.min(w.biomeW - 1, Math.floor(x / 8))]]] : null); } catch (e) { k = null; }
      const q = keys.indexOf(k);
      out[j * R + i] = q < 0 ? 255 : q + 1;
    }
    return out;
  })()`);
  W.milieu = packGrid(R8, R8, Uint8Array.from(mil)); W.milieuKeys = habKeys;

  // ---------------------------------------------------------------- tracés
  const r1 = (v) => Math.round(v * 10) / 10;
  W.lm = Object.values(w.lm || {}).map((L) => ({ key: L.key, name: L.name, x: r1(L.x), z: r1(L.z), y: r1(L.y ?? w.heightAt(L.x, L.z)), r: r1(L.r || 6), secret: !!L.secret, under: !!L.under, fish: L.fish || null }));
  W.bld = Object.values(w.bld || {}).map((B) => ({ key: B.key, name: B.name, x: r1(B.x), z: r1(B.z), y: r1(B.y), W: B.W, D: B.D, rot: B.f ? Math.round(B.f.r * 1000) / 1000 : 0, under: !!B.under }));
  W.nav = { nodes: (w.nav && w.nav.nodes || []).map((q) => [r1(q.x), r1(q.z), q.iso ? 1 : 0, q.tag || '']), edges: (w.nav && w.nav.edges || []).map((e) => (Array.isArray(e) ? [e[0], e[1]] : [e.a, e.b])) };
  W.inter = (w.inter || []).map((it) => ({ kind: it.kind, id: it.id, name: it.name || '', x: r1(it.x), y: r1(it.y ?? 0), z: r1(it.z), data: jclone(it.data ? Object.fromEntries(Object.entries(it.data).filter(([k, v]) => typeof v !== 'object' || v === null || (Array.isArray(v) && v.length < 8 && v.every((x) => typeof x !== 'object')))) : null) }));
  W.props = (w.props || []).filter((p) => !p.gone && (!p.ver || (p.ver & 1))).map((p) => [p.id, r1(p.x), r1(p.z), r1(p.y ?? 0)]);
  W.fishZones = (w.fishZones || []).map((Z) => [r1(Z.x), r1(Z.z), r1(Z.r), Z.kind]);
  W.lakes = (w.lakes || []).map((Z) => [r1(Z.x), r1(Z.z), r1(Z.r), Z.kind || 'lac']);
  W.pools = (w.pools || []).map((p) => [r1(p.x), r1(p.z), r1(p.w), r1(p.d), Math.round((p.r || 0) * 1000) / 1000, p.kind || '', r1(p.y || 0), p.hot ? 1 : 0]);
  W.moat = w.moat ? { x: w.moat.x, z: w.moat.z, inner: w.moat.inner, outer: w.moat.outer } : null;
  W.bridges = (w.bridges || []).map((b) => [b.key || '', r1(b.x), r1(b.z), r1(b.w), r1(b.L), Math.round(b.r * 1000) / 1000]);
  W.crevasses = jclone(w.crevasses || []);
  W.noBuild = (w.noBuild || []).map((z) => [r1(z.x), r1(z.z), r1(z.r), z.why || '']);
  W.secrets = (w.secrets || []).map((s) => ({ id: s.id, kind: s.kind, x: r1(s.x), z: r1(s.z), myth: s.myth || null, relic: s.relic || null, loot: s.loot || null }));
  W.caves = Object.entries(w.caves || {}).map(([k, c]) => ({ key: k, x: r1(c.x), z: r1(c.z) }));
  W.mapBoards = (w.mapBoards || []).map((b) => [b.key, r1(b.x), r1(b.z)]);
  W.herd = w.herdSpot ? [r1(w.herdSpot.x), r1(w.herdSpot.z)] : null;
  W.farmField = w.farm && w.farm.field ? jclone(w.farm.field) : null;
  W.misc = {};
  for (const k of ['temple', 'nains', 'geants', 'sources', 'relais', 'archives', 'maze', 'townInfo', 'abbey', 'scriptorium', 'cellar', 'crypt']) if (w[k]) W.misc[k] = jclone(Object.fromEntries(Object.entries(w[k]).filter(([, v]) => !ArrayBuffer.isView(v))));
  // blocs (bâtiments, murs, ponts…) : empreintes vues de dessus ; ceux enfouis sous le terrain vont aux souterrains
  {
    const mats = DB.derived.mats || [];
    const pal = [], palIdx = new Map();
    const colorOf = (m) => { const a = mats[m] && mats[m].avg ? mats[m].avg : [140, 130, 120]; const key = a.join(','); if (!palIdx.has(key)) { palIdx.set(key, pal.length); pal.push(a); } return palIdx.get(key); };
    const rows = [];
    for (const b of w.blocks) {
      if (b.hidden || (b.ver && !(b.ver & 1))) continue;
      const top = b.y + b.sy, ground = w.heightAt(b.x, b.z);
      const under = !!b.under || top < ground - 0.3;
      rows.push([Math.round(b.x * 10), Math.round(b.z * 10), Math.round(b.sx * 10), Math.round(b.sz * 10), Math.round((b.r || 0) * 1000), Math.round(top * 10), colorOf(b.m), under ? 1 : 0]);
    }
    rows.sort((p, q) => p[5] - q[5]);
    W.blocks = { n: rows.length, pal, data: packBytes(Int16Array.from(rows.flat().map((v) => Math.max(-32768, Math.min(32767, v))))) };
  }
}

// ============================================================================
//  PHASE 2 : LES FICHES (à partir des données extraites seulement)
// ============================================================================
function buildWiki(DB) {
  const T = (name, d) => (DB.tables[name] ? DB.tables[name].v : d);
  const used = new Set(); // tables lues par une section dédiée
  const U = (name, d) => { used.add(name); return T(name, d); };
  const ITEMS = U('ITEMS', {}), CATN = U('ITEM_CAT_NAMES', {}), CROPS = U('CROPS', {}), FISH = U('FISH', {}), RECIPES = U('RECIPES', []);
  const GROUPS = U('ITEM_GROUPS', {}), GROUP_NAMES = U('GROUP_NAMES', {}), STATIONS = U('STATION_NAMES', {}), MACHINES = U('MACHINES', {}), MACHINE_HINT = U('MACHINE_HINT', {});
  const LOOT = U('LOOT', {}), HARVEST = U('HARVEST', {}), VEINS = U('VEINS', []), PREY = U('PREY', {}), OT = U('OBJ_TYPES', []), PLACEABLES = U('PLACEABLES', {});
  const POTIONS = U('POTIONS', {}), ESS = U('ESSENCES', {}), ESSN = U('ESSENCE_NAMES', {}), ESSO = U('ESSENCE_OPP', []), A1 = U('ALCH_SINGLE', {}), A2 = U('ALCH_PAIRS', {}), BUFFN = U('BUFF_NAMES', {});
  const NPCS = U('NPC_DATA', []), LIFE = U('NPC_LIFE', {}), NPC_GEN = U('NPC_GENERIC', {}), QITEMS = U('QUEST_ITEMS', {});
  const MYTHS = U('MYTHS', {}), FAITH = U('FAITH', {}), LORE = U('LORE_TEXT', {}), NOTES = U('LORE_NOTES', []), XNOTES = U('EXTRA_NOTES', []);
  const HAB = U('HABITATS', {}), RAR = U('RARETE', RAR_DEF), PL2 = U('PLANTES2', []), EA = U('ESPECES_ANIMAUX', []), EP = U('ESPECES_PLANTES', []), EAR = U('ESPECES_ARBRES', []);
  const BANALES = new Set(U('PLANTES_BANALES', [])), PLOOK = U('PLANT_LOOK', {}), NA = U('NOTICE_ANIMAUX', {}), NP = U('NOTICE_PLANTES', {}), NAR = U('NOTICE_ARBRES', {}), NPO = U('NOTICE_POISSONS', {});
  const LANG = U('LANGUES', {}), INSC = U('INSCRIPTIONS', []), LIVRES = U('LIVRES', {}), LMARCH = U('LIVRES_MARCHANDS', []), LMAN = U('LIVRES_MANUELS', []);
  const CARTES = U('CARTES_REGIONS', {}), CRAFT_BASE = new Set(U('CRAFT_BASE', [])), LOCKED = new Set(U('LOCKED_RECIPES', [])), LIEUN = U('LIEU_NAMES', {});
  const SEM = U('SEMAINE', []), CRE = U('CREATURES', {}), RELICS = U('RELICS', []), SIGT = U('SIGIL_TEXT', {}), SHRINE = U('SHRINE_TITLE', {}), EVT = U('EVENT_DEFS', []), SLET = U('STRANGE_LETTERS', []);
  const EAUX = U('EAUX', {}), WEATHER = U('WEATHER_NAMES', {}), BIOMEN = U('BIOME_NAMES', {}), MYTH_ORDER = U('MYTH_ORDER', []), NPC_MYTHS = U('NPC_MYTHS', {});
  ['CROP_PRICE', 'SEED_PRICE', 'NPC_HELD', 'TIERS', 'TIER_NAMES', 'LORE_NOTES', 'PLANTES3', 'BIOMES', 'CROPS_MORE', 'MYTH_FALLBACK', 'FAITH_LABEL', 'MARCHANDS', 'BOUTIQUES', 'SIGIL_KINDS', 'VALLEY_DESIGN', 'HOME_OF', 'SIGN_TXT', 'LIFE_MOODS', 'DAY_KIND', 'SEED_BASE', 'BULK_CATS', 'WILD2_KINDS', 'VEG_SETS', 'SHOP_SIGNS', 'ETAL_GOODS', 'TOOLS', 'TERRA_FREE', 'TERRA_WHY', 'HORSE_NAMES_WILD'].forEach((k) => used.add(k));
  const NAMES = DB.derived.names || { ville: 'la ville', hameau: 'le hameau' };
  const W = DB.world;
  const RT = DB.derived.routines || {};
  const FR = DB.derived.fishRarete || {};
  const ICON = DB.images.icons ? DB.images.icons.index : {};
  const FIG = DB.images.figures ? DB.images.figures.index : {};
  const NPC_BY = Object.fromEntries(NPCS.map((d) => [d.id, d]));
  const LM = Object.fromEntries((W.lm || []).map((L) => [L.key, L]));
  const BLD = Object.fromEntries((W.bld || []).map((B) => [B.key, B]));
  const OTI = Object.fromEntries(OT.map((t) => [t.id, t]));
  const INTER = W.inter || [];

  // ---------------------------------------------------------------- pages
  const pages = new Map();
  const P = (id, o) => { let p = pages.get(id); if (!p) { p = { id, t: id, s: '', c: [], i: '', x: 0, h: '', g: '' }; pages.set(id, p); } if (o) Object.assign(p, o); return p; };
  const isSec = (id) => { const p = pages.get(id); return !!(p && p.x); };
  const link = (id, text) => { const p = pages.get(id); const t = text ?? (p ? p.t : id); if (!p) return esc(t); return `<a href="#/p/${encodeURIComponent(id)}"${p.x ? ' class="lsec"' : ''}>${esc(t)}</a>`; };
  const iconOf = (id) => (ICON[id] !== undefined ? `<i class="ic ic-${ICON[id]}"></i>` : '');
  const iname = (id) => (ITEMS[id] ? ITEMS[id].name : id === 'argent' ? 'pièces' : (QITEMS[id] && QITEMS[id].name) || id);
  const IL = (id, n) => { const nm = iname(id); const p = pages.get('it:' + id); const q = n !== undefined && n !== null && n !== '' ? `<small>×${esc(n)}</small>` : ''; if (!p) return `<span class="il">${esc(nm)}${q ? ' ' + q : ''}</span>`; return `<a class="il${p.x ? ' lsec' : ''}" href="#/p/it:${encodeURIComponent(id)}">${iconOf(id)}${esc(nm)}</a>${q ? ' ' + q : ''}`; };
  const groupLink = (k) => (GROUPS[k] ? `<span class="il grp" title="${esc(GROUPS[k].map(iname).join(', '))}">${esc(GROUP_NAMES[k] || k)}</span>` : IL(k));
  const needList = (need) => Object.entries(need || {}).map(([k, n]) => (GROUPS[k] ? groupLink(k) + ` <small>×${n}</small>` : IL(k, n))).join(', ');
  const SEC = (html, note) => (html ? `<div class="sec">${html}</div>${note === false ? '' : `<p class="sec-note">${esc(note || 'Masqué : cliquez sur « révéler les secrets » pour le lire.')}</p>`}` : '');
  const secS = (html) => `<span class="sec">${html}</span>`;
  const npcName = (id) => { const d = NPC_BY[id]; return d ? (d.names && d.names[0] ? d.names[0] + ' ' : '') + (d.surname || '') : id; };
  const npcLink = (id, text) => link('pnj:' + id, text ?? (NPC_BY[id] ? `${(NPC_BY[id].names || [])[0] || ''} ${NPC_BY[id].surname || ''} (${(NPC_BY[id].role || '').toLowerCase()})`.trim() : id));
  const lieuName = (k) => LIEUN[k] || (LM[k] && LM[k].name) || (BLD[k] && BLD[k].name) || k;
  const placeLink = (k, text) => link('li:' + k, text ?? lieuName(k));
  const rarTag = (r) => (r === undefined || r === null ? '' : `<span class="tag r${r}">${esc(RAR[r] || RAR_DEF[r] || r)}</span>`);
  const habList = (hs) => (hs || []).map((h) => `<a class="tag hab" href="#/p/${encodeURIComponent('mil:' + h)}">${esc(HAB[h] || h)}</a>`).join(' ');
  // une réplique du jeu : les gabarits deviennent lisibles (et liés)
  const FILL = (t, who) => esc(String(t ?? '')).replace(/\{(\w+)(?::(\w+))?\}/g, (m, a, b) => {
    if (a === 'npc' && b) return npcLink(b, NPC_BY[b] ? (NPC_BY[b].names || [b])[0] : b);
    if (a === 'lieu' && b) return placeLink(b);
    if (a === 'nom') { const d = who && NPC_BY[who]; return d ? `<span class="ph" title="le prénom change à chaque partie : ${esc((d.names || []).join(', '))}">${esc((d.names || ['…'])[0])}</span>` : '<span class="ph">‹nom›</span>'; }
    if (a === 'ville') return esc(NAMES.ville || 'la ville');
    if (a === 'hameau') return esc(NAMES.hameau || 'le hameau');
    if (a === 'fermier') return '<span class="ph" title="ou votre prénom, quand on vous connaît bien">le nouveau fermier</span>';
    if (a === 'prenom') return '<span class="ph">‹votre prénom›</span>';
    if (a === 'victime') return '<span class="ph">‹la victime›</span>';
    if (a === 'objet') return '<span class="ph">‹ce cadeau›</span>';
    if (a === 'jour') return '<span class="ph">‹jour›</span>';
    return `<span class="ph">‹${esc(a)}›</span>`;
  }).replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
  const para = (t, who) => (t ? `<p>${FILL(t, who)}</p>` : '');
  const quote = (t, who) => `<blockquote>${FILL(t, who)}</blockquote>`;
  const LABELS = {
    intro: 'Première rencontre', greet: 'Salutations', about: 'À propos de soi', rumeurs: 'Rumeurs', etrange: 'Choses étranges', cadeau: 'Cadeaux', nuit: 'La nuit, à sa porte',
    meurtre: 'Face à un meurtrier', disparu: 'Après une disparition', nuitrouge: 'Après une nuit rouge', adieu: 'Pour se quitter', tueur: 'Quand on le soupçonne', indice: 'L’indice',
    matin: 'le matin', jour: 'dans la journée', soir: 'le soir', pluie: 'sous la pluie', orage: 'par l’orage', ami: 'entre amis', froid: 'en froid', peur: 'quand il a peur',
    adore: 'ce qu’il adore', aime: 'ce qu’il aime', neutre: 'le reste', deteste: 'ce qu’il déteste', joyeux: 'joyeux', triste: 'triste', fatigue: 'fatigué', inquiet: 'inquiet', agace: 'agacé',
    cadeau_adore: 'un cadeau adoré', cadeau_deteste: 'un cadeau détesté', aide: 'votre aide', toque_nuit: 'quand on frappe la nuit', coup: 'un coup reçu', absence: 'une longue absence', victime: 'une victime',
    arme: 'une arme à la main', pelle: 'une pelle', potion: 'une potion', animal_mort: 'une bête morte', fleurs: 'des fleurs', poisson: 'un poisson', lanterne_jour: 'une lanterne en plein jour', relique: 'une relique', rien: 'les mains vides',
    travail: 'au travail', repas: 'au repas', priere: 'à la prière', promenade: 'en promenade', eglise: 'l’Église', anciens: 'les Anciens', dessous: 'Ceux d’en dessous',
    offre: 'La demande', accepte: 'Quand on accepte', attente: 'En attendant', recu: 'Le message', fin: 'À la fin', resume: 'En bref', texte: 'Le récit', indice_m: 'Indice', decouverte: 'La découverte',
  };
  const label = (k) => LABELS[k] || cap(String(k).replace(/_/g, ' '));
  // rendu générique d'une valeur (textes, listes, objets imbriqués) ; les objets connus deviennent des liens
  const idLink = (s) => {
    if (typeof s !== 'string' || s.length > 40 || /\s/.test(s)) return null;
    if (ITEMS[s]) return IL(s);
    if (NPC_BY[s]) return npcLink(s);
    if (pages.has('an:' + s)) return link('an:' + s);
    if (pages.has('pl:' + s)) return link('pl:' + s);
    if (pages.has('li:' + s) && (LM[s] || BLD[s])) return placeLink(s);
    return null;
  };
  const tree = (v, depth = 0, who) => {
    if (v === null || v === undefined || v === '') return '';
    if (typeof v === 'string') { const l = idLink(v); return l || (v.length > 60 || /\s/.test(v) ? `<p>${FILL(v, who)}</p>` : `<code>${esc(v)}</code>`); }
    if (typeof v === 'number' || typeof v === 'boolean') return `<code>${esc(typeof v === 'number' ? nfmt(v) : v ? 'oui' : 'non')}</code>`;
    if (Array.isArray(v)) {
      if (!v.length) return '';
      if (v.every((x) => typeof x === 'string' && (x.length > 60 || /\s/.test(x)))) return `<ul class="qs">${v.map((x) => `<li>${FILL(x, who)}</li>`).join('')}</ul>`;
      if (v.every((x) => typeof x !== 'object' || x === null)) return `<p class="inl">${v.map((x) => (typeof x === 'string' ? idLink(x) || esc(x) : `<code>${esc(x)}</code>`)).join(', ')}</p>`;
      if (v.every((x) => Array.isArray(x) && x.every((y) => typeof y !== 'object' || y === null))) return `<table class="t">${v.map((r) => `<tr>${r.map((x) => `<td>${typeof x === 'string' ? idLink(x) || FILL(x, who) : x === null ? '' : esc(typeof x === 'number' ? nfmt(x) : x)}</td>`).join('')}</tr>`).join('')}</table>`;
      return v.map((x) => `<div class="tr-item">${tree(x, depth + 1, who)}</div>`).join('');
    }
    const keys = Object.keys(v);
    if (!keys.length) return '';
    const titleKey = keys.find((k) => /^(titre|title|nom|name)$/.test(k));
    let h = titleKey && typeof v[titleKey] === 'string' ? `<h${Math.min(6, 4 + depth)} class="tt">${esc(v[titleKey])}</h${Math.min(6, 4 + depth)}>` : '';
    const simple = keys.filter((k) => k !== titleKey && (typeof v[k] !== 'object' || v[k] === null) && !(typeof v[k] === 'string' && (v[k].length > 60)));
    const rich = keys.filter((k) => k !== titleKey && !simple.includes(k));
    if (simple.length) h += `<dl class="kv">${simple.map((k) => `<dt>${esc(label(k))}</dt><dd>${tree(v[k], depth + 1, who).replace(/^<p>|<\/p>$/g, '')}</dd>`).join('')}</dl>`;
    for (const k of rich) { const inner = tree(v[k], depth + 1, who); if (inner) h += depth < 2 ? `<h${Math.min(6, 4 + depth)}>${esc(label(k))}</h${Math.min(6, 4 + depth)}>${inner}` : `<div class="sub"><b>${esc(label(k))}</b>${inner}</div>`; }
    return h;
  };
  const dist = (ax, az, bx, bz) => Math.hypot(ax - bx, az - bz);
  const FARM = LM.ferme || { x: W.size / 2, z: W.size / 2 };
  const bearing = (x, z, from = FARM) => {
    const dx = x - from.x, dz = z - from.z, d = Math.hypot(dx, dz);
    if (d < 40) return 'tout près';
    const a = Math.atan2(dx, -dz), dirs = ['nord', 'nord-est', 'est', 'sud-est', 'sud', 'sud-ouest', 'ouest', 'nord-ouest'];
    const k = ((Math.round(a / (Math.PI / 4)) % 8) + 8) % 8;
    return `${d >= 1000 ? nfmt(Math.round(d / 100) / 10) + ' km' : Math.round(d / 10) * 10 + ' m'} au ${dirs[k]}`;
  };
  // le lieu le plus parlant autour d'un point
  const lmSorted = (W.lm || []).slice().sort((a, b) => a.r - b.r);
  const placeAt = (x, z, allowSecret = true) => {
    for (const L of lmSorted) { if (!allowSecret && (L.secret || L.under)) continue; if (L.r > 300) continue; if (dist(L.x, L.z, x, z) <= L.r * 1.15 + 4) return L; }
    let best = null, bd = 1e9;
    for (const L of W.lm || []) { if (!allowSecret && (L.secret || L.under)) continue; const d = dist(L.x, L.z, x, z) - L.r; if (d < bd) { bd = d; best = L; } }
    return best && bd < 220 ? Object.assign({ near: true }, best) : null;
  };
  const whereText = (x, z) => { const L = placeAt(x, z); return L ? (L.near ? 'près de ' : '') + placeLink(L.key) : 'dans la nature'; };
  const mapBtn = (target, text = 'Voir sur la carte') => `<a class="btn map" href="#/carte/${encodeURIComponent(target)}">🗺 ${esc(text)}</a>`;
  const fishSet = (k) => Object.keys(FISH).filter((f) => (FISH[f].where || []).includes(k));

  // ---------------------------------------------------------------- 1) squelettes des fiches (titres, secrets) pour que les liens se résolvent
  const itemIds = Object.keys(ITEMS);
  for (const id of itemIds) { const it = ITEMS[id]; P('it:' + id, { t: it.name || id, s: CATN[it.cat] || cap(it.cat || ''), i: ICON[id] !== undefined ? 'ic:' + ICON[id] : '', c: ['objets'], x: 0 }); }
  for (const d of NPCS) P('pnj:' + d.id, { t: `${(d.names || [])[0] || ''} ${d.surname || ''}`.trim() || d.id, s: d.role || '', c: ['habitants'], i: FIG['pnj:' + d.id] && FIG['pnj:' + d.id].bust ? 'fg:' + FIG['pnj:' + d.id].bust.join(',') : '☺' });
  // plantes et arbres : toutes les espèces de décor « vivantes »
  const floraIds = uniq([...EP.map((e) => e[0]), ...EAR.map((e) => e[0]), ...PL2.map((e) => e[0]), ...OT.filter((t) => /^(Arbres|Fleurs|Champignons|Végétation)$/.test(t.cat || '') && !t.animal).map((t) => t.id)]).filter((id) => OTI[id]);
  const floraInfo = {};
  for (const id of floraIds) {
    const t = OTI[id], e = EP.find((x) => x[0] === id) || EAR.find((x) => x[0] === id), p2 = PL2.find((x) => x[0] === id);
    const hab = e ? e[1] : p2 ? p2[5] : null, rar = e ? e[2] : p2 ? p2[6] : null;
    const tree_ = t.cat === 'Arbres' || !!EAR.find((x) => x[0] === id);
    const onlyUnder = hab && hab.length && hab.every((h) => h === 'souterrain');
    floraInfo[id] = { t, hab, rar, tree: tree_, p2 };
    P('pl:' + id, { t: t.name || id, s: tree_ ? 'Arbre' : t.cat === 'Champignons' ? 'Champignon' : t.cat === 'Végétation' ? 'Végétation' : 'Plante', c: [tree_ ? 'arbres' : 'plantes'], i: FIG['pl:' + id] ? 'fg:' + FIG['pl:' + id].full.join(',') : '✿', x: onlyUnder ? 1 : 0, fig: FIG['pl:' + id] ? FIG['pl:' + id].full : null });
  }
  // bêtes : les créatures du jeu, nommées par le catalogue, sinon par le décor ou les objets
  const animalName = (k) => { const e = EA.find((x) => x[0] === k); if (e) return e[1]; const t = OT.find((o) => o.animal === k); if (t) return t.name; const it = Object.values(ITEMS).find((i) => i.animal === k); if (it) return it.name; return k === 'bete' ? 'La Bête' : cap(k); };
  for (const k of Object.keys(CRE)) {
    const e = EA.find((x) => x[0] === k), c = CRE[k];
    const secret = !!(c.boss) && !e;
    P('an:' + k, { t: animalName(k), s: e ? (e[4] >= 2 ? 'Bête dangereuse' : 'Bête') : c.boss ? 'Créature' : 'Bête', c: ['betes'], i: FIG['an:' + k] ? 'fg:' + FIG['an:' + k].full.join(',') : '🐾', x: secret ? 1 : 0, fig: FIG['an:' + k] ? FIG['an:' + k].full : null });
  }
  for (const k of Object.keys(HAB)) P('mil:' + k, { t: cap(HAB[k]), s: 'Milieu', c: ['milieux'], i: '❦' });
  // lieux : lieux-dits, puis bâtiments qui n'en sont pas
  for (const L of W.lm || []) P('li:' + L.key, { t: cap(L.name), s: L.under ? 'Souterrain' : L.secret ? 'Lieu secret' : L.fish ? 'Eaux' : L.r >= 100 ? 'Contrée' : 'Lieu-dit', c: ['lieux'], i: L.under ? '⛏' : L.secret ? '✧' : L.fish ? '≈' : '⌖', x: L.secret || L.under ? 1 : 0 });
  for (const B of W.bld || []) if (!pages.has('li:' + B.key)) { const nm = /^vide\d*$/.test(B.name) ? 'Maison vide' : B.name; P('li:' + B.key, { t: cap(LIEUN[B.key] || nm), s: B.under ? 'Souterrain' : 'Bâtiment', c: ['lieux'], i: '⌂', x: B.under ? 1 : 0 }); }
  // langues, inscriptions
  for (const k of Object.keys(LANG)) P('lg:' + k, { t: cap(LANG[k].nom || k), s: 'Langue perdue', c: ['langues'], i: 'ᚨ' });
  for (const I of INSC) P('ins:' + I[0], { t: `Inscription « ${I[2].split(' , ')[0]}… »`, s: 'Inscription en ' + ((LANG[I[1]] && LANG[I[1]].nom) || I[1]), c: ['langues'], i: '𐌰' });
  // légendes
  for (const k of Object.keys(MYTHS)) P('my:' + k, { t: MYTHS[k].titre || cap(k), s: 'Légende', c: ['legendes'], i: '☙' });
  for (const k of Object.keys(FAITH)) P('foi:' + k, { t: cap(FAITH[k].nom || k), s: 'Foi', c: ['legendes'], i: '✝' });
  // butins
  for (const k of Object.keys(LOOT)) P('bt:' + k, { t: 'Butin « ' + k.replace(/_/g, ' ') + ' »', s: 'Ce qu’on trouve en fouillant', c: ['butins'], i: '⚱', x: 1 });
  // les jours de la semaine
  SEM.forEach((J, k) => P('sem:' + k, { t: J.nom || 'Jour ' + (k + 1), s: `${k + 1}ᵉ jour de la semaine`, c: ['semaine'], i: String(k + 1) }));

  // ---------------------------------------------------------------- 2) index croisés : d'où viennent les objets, à quoi ils servent
  const SRC = {}, USE = {};
  const addS = (id, o) => { (SRC[id] || (SRC[id] = [])).push(o); };
  const addU = (id, o) => { (USE[id] || (USE[id] = [])).push(o); };
  const expand = (k) => (GROUPS[k] ? GROUPS[k] : [k]);
  for (const d of NPCS) {
    const sh = d.shop;
    if (sh) {
      for (const e of sh.sells || []) { const [id, pr] = Array.isArray(e) ? e : [e, ITEMS[e] && ITEMS[e].price]; addS(id, { k: 'shop', npc: d.id, price: pr, shop: sh.name }); }
      for (const id of sh.buys || []) for (const x of expand(id)) addU(x, { k: 'buy', npc: d.id });
    }
    for (const q of d.quests || []) {
      for (const [id, n] of Object.entries(q.need || {})) for (const x of expand(id)) addU(x, { k: 'quest', npc: d.id, q, n });
      if (q.objet) addU(q.objet, { k: 'questobj', npc: d.id, q });
      if (q.reward && q.reward.objets) for (const [id, n] of Object.entries(q.reward.objets)) addS(id, { k: 'reward', npc: d.id, q, n });
    }
    for (const [lvl, key] of [['adore', 'loves'], ['aime', 'likes'], ['deteste', 'dislikes']]) for (const id of d[key] || []) addU(id, { k: 'gift', npc: d.id, lvl });
  }
  RECIPES.forEach((r, ri) => { addS(r.out, { k: 'recipe', r, ri }); for (const k of Object.keys(r.need || {})) for (const x of expand(k)) addU(x, { k: 'recipe', r, ri, group: GROUPS[k] ? k : null }); });
  for (const [m, list] of Object.entries(MACHINES)) for (const e of list || []) { if (e.out) addS(e.out[0], { k: 'machine', m, e }); for (const k of Object.keys(e.in || {})) for (const x of expand(k)) addU(x, { k: 'machine', m, e, group: GROUPS[k] ? k : null }); }
  for (const [t, L] of Object.entries(LOOT)) for (const e of (L && L.items) || []) addS(e[0], { k: 'loot', t, e });
  for (const [o, h] of Object.entries(HARVEST)) { for (const e of (h && h.drop) || []) addS(e[0], { k: 'harvest', o, e, h }); }
  VEINS.forEach((v, i) => addS(v.item, { k: 'vein', v, i }));
  for (const [c, p] of Object.entries(PREY)) for (const e of (p && p.drop) || []) addS(e[0], { k: 'prey', c, e });
  for (const [c, cr] of Object.entries(CROPS)) { const out = cr.fruit && ITEMS[cr.fruit] ? cr.fruit : ITEMS[c] ? c : null; if (out) addS(out, { k: 'crop', c }); }
  for (const f of Object.keys(FISH)) if (ITEMS[f]) addS(f, { k: 'fish', f });
  for (const [pid, p] of Object.entries(POTIONS)) for (const id of p.need || []) addU(id, { k: 'potion', pid });
  for (const [b, L] of Object.entries(LIVRES)) for (const id of L.recettes || []) addU('__recette:' + id, { k: 'book', b });
  // quêtes « trouver » : l'objet est caché dans un lieu
  for (const d of NPCS) for (const q of d.quests || []) if (q.type === 'trouver' && q.objet) addS(q.objet, { k: 'hidden', npc: d.id, q });
  // coffres du monde, par table de butin
  const lootSpots = {};
  for (const it of INTER) if (it.kind === 'loot' && it.data && it.data.table) (lootSpots[it.data.table] || (lootSpots[it.data.table] = [])).push(it);
  // qui enseigne une recette : quêtes et livres
  const teach = {};
  for (const d of NPCS) for (const q of d.quests || []) if (q.reward && q.reward.recette) (teach[q.reward.recette] || (teach[q.reward.recette] = [])).push({ k: 'quest', npc: d.id, q });
  for (const [b, L] of Object.entries(LIVRES)) for (const id of L.recettes || []) (teach[id] || (teach[id] = [])).push({ k: 'book', b });

  const stationName = (st) => (st ? STATIONS[st] || st : 'à la main, n’importe où');
  const recipeRow = (r) => `<tr><td>${IL(r.out)}${r.n > 1 ? ` <small>×${r.n}</small>` : ''}</td><td>${needList(r.need)}</td><td>${esc(stationName(r.st))}</td></tr>`;
  const lootLine = (t, e) => `${link('bt:' + t)} : ${e[1] || e[2] ? `${e[1] === e[2] ? e[1] : e[1] + ' à ' + e[2]}` : 'objet de quête caché'}${e[3] ? ` <small>(poids ${nfmt(e[3])})</small>` : ''}`;

  // ---------------------------------------------------------------- 3) OBJETS
  const KNOWN_ITEM_KEYS = new Set(['id', 'name', 'cat', 'price', 'ic', 'desc', 'food', 'heal', 'raw', 'poison', 'tool', 'tier', 'place', 'animal', 'potion', 'book', 'wild', 'alch', 'unique', 'questItem', 'crop', 'buy', 'biblio', 'use', 'region', 'passive']);
  for (const id of itemIds) {
    const it = ITEMS[id], p = P('it:' + id);
    const props = [];
    props.push(['Catégorie', esc(CATN[it.cat] || cap(it.cat || '—'))]);
    if (it.price) props.push(['Prix de vente', nfmt(it.price) + ' pièces']);
    if (it.buy) props.push(['Prix d’achat', nfmt(it.buy) + ' pièces']);
    if (it.food) props.push(['Nourrit', '+' + nfmt(it.food)]);
    if (it.heal) props.push([it.heal < 0 ? 'Blesse' : 'Soigne', (it.heal > 0 ? '+' : '') + nfmt(it.heal)]);
    if (it.poison) props.push(['Poison', '<b class="warn">oui</b>']);
    if (it.raw) props.push(['Cru', 'mieux vaut le cuire']);
    if (it.tool) props.push(['Outil', esc(it.tool) + (it.tier !== undefined ? ` (palier ${it.tier + 1})` : '')]);
    if (it.place) props.push(['Se pose', 'oui (objet à poser)']);
    if (it.animal) props.push(['Bête', link('an:' + it.animal)]);
    if (it.crop) props.push(['Culture', IL(CROPS[it.crop] && CROPS[it.crop].fruit && ITEMS[CROPS[it.crop].fruit] ? CROPS[it.crop].fruit : it.crop)]);
    if (it.potion && POTIONS[it.potion]) props.push(['Potion', esc(POTIONS[it.potion].name)]);
    if (it.wild) props.push(['Cueillette sauvage', 'à faire identifier par l’alchimiste']);
    if (it.alch) props.push(['Alchimie', 'sert d’ingrédient']);
    if (it.unique) props.push(['Unique', 'oui']);
    if (it.biblio) props.push(['Bibliothèque', 'se prête, à rendre à temps']);
    if (it.region && CARTES[it.region]) props.push(['Carte', esc(CARTES[it.region].titre)]);
    for (const k of Object.keys(it)) if (!KNOWN_ITEM_KEYS.has(k)) { const v = it[k]; props.push([esc(label(k)), typeof v === 'object' ? tree(v, 2) : esc(typeof v === 'boolean' ? (v ? 'oui' : 'non') : typeof v === 'number' ? nfmt(v) : v)]); }
    let h = `<dl class="kv">${props.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
    if (it.desc) h = `<p class="lead">${FILL(it.desc)}</p>` + h;
    // où le trouver
    const src = SRC[id] || [], rows = [];
    const sh = src.filter((s) => s.k === 'shop');
    if (sh.length) rows.push(['Boutiques', sh.map((s) => `${npcLink(s.npc)} <small>${esc(s.shop || '')}</small> — <b>${nfmt(s.price)}</b> pièces`).join('<br>')]);
    const rc = src.filter((s) => s.k === 'recipe');
    if (rc.length) rows.push(['Fabrication', `<table class="t"><tr><th>Donne</th><th>Il faut</th><th>Où</th></tr>${rc.map((s) => recipeRow(s.r)).join('')}</table>` + (() => {
      const known = CRAFT_BASE.has(id) ? 'Recette connue dès le départ.' : '';
      const tch = (teach[id] || []).map((t) => (t.k === 'quest' ? `quête « ${esc(t.q.title)} » de ${npcLink(t.npc)}` : `livre ${IL('livre_' + t.b)}`));
      return `<p class="note">${known}${tch.length ? ` S’apprend : ${tch.join(' ; ')}.` : ''}${!known && !tch.length ? 'Recette à découvrir en assemblant les bons ingrédients.' : LOCKED.has(id) && !CRAFT_BASE.has(id) ? '' : ''}</p>`;
    })()]);
    const mc = src.filter((s) => s.k === 'machine');
    if (mc.length) rows.push(['Machines', mc.map((s) => `${esc(label(s.m))} : ${needList(s.e.in)} → ${IL(s.e.out[0], s.e.out[1])} <small>en ${nfmt(s.e.h)} h</small>`).join('<br>')]);
    const cr = src.filter((s) => s.k === 'crop');
    if (cr.length) rows.push(['Culture', cr.map((s) => `se cultive (${link('it:' + s.c, CROPS[s.c].name)}) — ${Object.keys(ITEMS).filter((k) => ITEMS[k].crop === s.c).map((k) => IL(k)).join(', ')}`).join('<br>')]);
    const hv = src.filter((s) => s.k === 'harvest');
    if (hv.length) rows.push(['Récolte', hv.map((s) => `${pages.has('pl:' + s.o) ? link('pl:' + s.o) : esc((OTI[s.o] && OTI[s.o].name) || s.o)} <small>(${esc(s.h.tool === 'main' ? 'à la main' : s.h.tool)}${s.e[1] !== undefined ? ', ' + (s.e[1] === s.e[2] ? s.e[1] : s.e[1] + ' à ' + s.e[2]) : ''}${s.e[3] !== undefined ? ', ' + Math.round(s.e[3] * 100) + ' %' : ''})</small>`).join(', ')]);
    const vn = src.filter((s) => s.k === 'vein');
    if (vn.length) rows.push(['Filons', vn.map((s) => `${esc(s.v.name)} <small>(pioche de palier ${(s.v.tier || 0) + 1} au moins)</small>`).join(', ')]);
    const pr = src.filter((s) => s.k === 'prey');
    if (pr.length) rows.push(['Sur les bêtes', pr.map((s) => `${link('an:' + s.c)} <small>(${s.e[1] === s.e[2] ? s.e[1] : s.e[1] + ' à ' + s.e[2]})</small>`).join(', ')]);
    const fs_ = src.filter((s) => s.k === 'fish');
    if (fs_.length) { const F = FISH[id]; rows.push(['Pêche', `${(F.where || []).map((k) => `<a href="#/carte/${encodeURIComponent('eau:' + k)}">${esc(EAUX[k] || k)}</a>`).join(', ')} — ${esc(F.time === 'nuit' ? 'la nuit' : F.time === 'jour' ? 'le jour' : 'à toute heure')}${F.rain ? ', surtout sous la pluie' : ''}${F.moon ? ', les nuits de pleine lune' : ''} ${rarTag(FR[id])}`]); if (NPO[id]) h = `<p class="lead">${FILL(NPO[id])}</p>` + h; }
    const rw = src.filter((s) => s.k === 'reward');
    if (rw.length) rows.push(['Récompense', rw.map((s) => `quête « ${esc(s.q.title)} » de ${npcLink(s.npc)}${s.n > 1 ? ' (×' + s.n + ')' : ''}`).join('<br>')]);
    const hd = src.filter((s) => s.k === 'hidden');
    if (hd.length) rows.push(['Caché', secS(hd.map((s) => `${placeLink(s.q.lieu)} (quête « ${esc(s.q.title)} » de ${npcLink(s.npc)})`).join('<br>')) + '<span class="sec-note">lieu masqué</span>']);
    const lt = src.filter((s) => s.k === 'loot');
    if (lt.length) rows.push(['En fouillant', secS(lt.map((s) => lootLine(s.t, s.e)).join('<br>')) + '<span class="sec-note">masqué (secrets)</span>']);
    if (rows.length) h += `<h3>Où le trouver</h3><dl class="kv wide">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
    // à quoi il sert
    const us = USE[id] || [], urows = [];
    const ur = us.filter((u) => u.k === 'recipe');
    if (ur.length) urows.push(['Recettes', `<table class="t"><tr><th>Donne</th><th>Il faut</th><th>Où</th></tr>${uniq(ur.map((u) => u.ri)).map((ri) => recipeRow(RECIPES[ri])).join('')}</table>`]);
    const um = us.filter((u) => u.k === 'machine');
    if (um.length) urows.push(['Machines', um.map((u) => `${esc(label(u.m))} → ${IL(u.e.out[0], u.e.out[1])}`).join('<br>')]);
    const ub = us.filter((u) => u.k === 'buy');
    if (ub.length) urows.push(['Acheté par', uniq(ub.map((u) => u.npc)).map((n) => npcLink(n)).join(', ')]);
    const uq = us.filter((u) => u.k === 'quest' || u.k === 'questobj');
    if (uq.length) urows.push(['Quêtes', uq.map((u) => `« ${esc(u.q.title)} » (${npcLink(u.npc)})${u.n ? ' ×' + u.n : ''}`).join('<br>')]);
    const ug = us.filter((u) => u.k === 'gift');
    if (ug.length) urows.push(['En cadeau', ug.map((u) => `${npcLink(u.npc)} <small>${u.lvl === 'adore' ? 'adore' : u.lvl === 'aime' ? 'aime' : 'déteste'}</small>`).join(', ')]);
    const up = us.filter((u) => u.k === 'potion');
    if (up.length) urows.push(['Alchimie', secS(up.map((u) => IL(u.pid)).join(', ')) + '<span class="sec-note">masqué (secrets)</span>']);
    if (urows.length) h += `<h3>À quoi il sert</h3><dl class="kv wide">${urows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
    if (ESS[id]) h += SEC(`<h3>Essences cachées</h3><p>${Object.entries(ESS[id]).map(([e, n]) => `<span class="tag ess">${esc(ESSN[e] || e)} ${'●'.repeat(Math.max(1, Math.min(5, n)))}</span>`).join(' ')}</p>`, 'Les essences de cet ingrédient sont masquées (secrets).');
    p.h = h;
    if (it.cat === 'poisson') p.c.push('poissons');
    if (it.potion) p.c.push('alchimie');
    if (it.cat === 'livre' || it.book) p.c.push('livres');
    if (it.crop === undefined && CROPS[id]) p.c.push('cultures');
    if (it.questItem || QITEMS[id]) p.x = 0;
  }

  // ---------------------------------------------------------------- 4) CULTURES (sur la fiche de l'objet récolté)
  const cropRows = [];
  for (const [c, cr] of Object.entries(CROPS)) {
    const out = cr.fruit && ITEMS[cr.fruit] ? cr.fruit : ITEMS[c] ? c : null;
    const seeds = Object.keys(ITEMS).filter((k) => ITEMS[k].crop === c);
    const vars = (cr.vars || []).map((v) => { const tot = cr.vars.reduce((a, b) => a + (b.w || 0), 0) || 1; return `<span class="tag" style="--c:${esc(v.c || '#888')}"><i class="dot"></i>${esc(v.n)} <small>${Math.round((v.w || 0) / tot * 100)} %</small></span>`; }).join(' ');
    const info = `<h3>Au potager</h3><dl class="kv"><dt>Pousse</dt><dd>${nfmt(cr.h)} h de jeu (terre humide)</dd>${cr.regrow ? `<dt>Repousse</dt><dd>toutes les ${nfmt(cr.regrow)} h</dd>` : ''}<dt>Récolte</dt><dd>${cr.yield ? cr.yield[0] + (cr.yield[1] !== cr.yield[0] ? ' à ' + cr.yield[1] : '') : '—'}</dd><dt>Gel</dt><dd>${cr.frost ? 'craint le gel' : 'résiste au gel'}</dd>${cr.night ? '<dt>Nuit</dt><dd>ne pousse que la nuit</dd>' : ''}${cr.giant ? '<dt>Géant</dt><dd>peut devenir géant (récolte × 4)</dd>' : ''}${cr.poison ? '<dt>Poison</dt><dd><b class="warn">oui</b></dd>' : ''}${seeds.length ? `<dt>Graines</dt><dd>${seeds.map((s) => IL(s) + (ITEMS[s].buy ? ` <small>${ITEMS[s].buy} pièces</small>` : '')).join(', ')}</dd>` : ''}</dl>${vars ? `<h4>Variétés</h4><p>${vars}</p>` : ''}`;
    if (out) { const p = P('it:' + out); p.h = info + p.h; if (!p.c.includes('cultures')) p.c.push('cultures'); }
    cropRows.push([c, out, cr, seeds]);
  }

  // ---------------------------------------------------------------- 5) PLANTES ET ARBRES
  for (const id of floraIds) {
    const { t, hab, rar, tree: isTree, p2 } = floraInfo[id], p = P('pl:' + id);
    const hv = HARVEST[id];
    const look = PLOOK[id] || (p2 && PLOOK[p2[4] && p2[4][0]]);
    const notice = NP[id] || NAR[id] || (p2 && NP[p2[4] && p2[4][0]]);
    const n = (W.objCounts || {})[id] || 0;
    let h = '';
    if (notice) h += `<p class="lead">${FILL(notice)}</p>`;
    h += `<dl class="kv">`;
    if (hab) h += `<dt>Milieux</dt><dd>${habList(hab)}</dd>`;
    if (rar !== null && rar !== undefined) h += `<dt>Rareté</dt><dd>${rarTag(rar)}</dd>`;
    h += `<dt>Dans la vallée</dt><dd>${n ? plur(n, 'pied', 'pieds') + (isTree ? '' : '') : 'aucun sur la carte (vient d’ailleurs)'}</dd>`;
    if (hv) {
      h += `<dt>Récolte</dt><dd>${hv.tool === 'main' ? 'à la main' : esc(hv.tool) + (hv.tier ? ` (palier ${hv.tier + 1})` : '')}${hv.hp ? `, ${hv.hp} coups` : ''} : ${(hv.drop || []).map((e) => IL(e[0]) + ` <small>${e[1] === e[2] ? e[1] : e[1] + '–' + e[2]}${e[3] !== undefined ? ', ' + Math.round(e[3] * 100) + ' %' : ''}</small>`).join(', ') || (hv.veins ? 'minerai (selon le filon)' : '—')}${hv.regrow ? ` — repousse en ${hv.regrow} h` : ''}${hv.stump ? ' — laisse une souche' : ''}</dd>`;
    }
    if (p2 && p2[7] && Object.keys(p2[7]).length) h += `<dt>Effets</dt><dd>${p2[7].poison ? '<b class="warn">poison</b> ' : ''}${p2[7].heal ? (p2[7].heal > 0 ? 'soigne +' : 'blesse ') + p2[7].heal + ' ' : ''}${p2[7].food ? 'nourrit +' + p2[7].food : ''}</dd>`;
    const drop0 = hv && hv.drop && hv.drop[0] && hv.drop[0][0];
    if (drop0 && ITEMS[drop0] && ITEMS[drop0].wild && !BANALES.has(drop0)) h += `<dt>Identification</dt><dd>à montrer à l’alchimiste de la ville avant d’en manger</dd>`;
    h += `</dl>`;
    if (look) h += `<h3>Ce qu’on en voit, sans la connaître</h3><p><b>${esc(look[0])}.</b> ${FILL(look[1])}</p>`;
    if (n && W.species && W.species.idx[id]) h += `<p>${mapBtn('pl:' + id, 'Voir les pieds sur la carte')}</p>`;
    p.h = h;
  }

  // ---------------------------------------------------------------- 6) BÊTES
  const DANGER = ['inoffensive', 'se défend', 'dangereuse', 'très dangereuse'];
  const TRAITS = { wild: 'sauvage', night: 'nocturne', nuit: 'nocturne', nightFly: 'vole la nuit', shy: 'farouche', pack: 'chasse en meute', herd: 'vit en troupeau', flock: 'vole en bande', fly: 'vole', water: 'nage', graze: 'broute', charge: 'charge', sneaky: 'rusée', hop: 'bondit', arbre: 'grimpe aux arbres', terrier: 'vit dans un terrier', curl: 'se met en boule', oiseau: 'oiseau', perch: 'se perche', flush: 's’envole d’un coup', city: 'des villes', pet: 'compagnon', stare: 'vous fixe', guard: 'monte la garde', peck: 'picore', root: 'fouille la terre', soar: 'plane', crow: 'corvidé', bite: 'mord', boss: 'monstre', sacre: 'sacrée' };
  for (const [k, c] of Object.entries(CRE)) {
    const p = P('an:' + k), e = EA.find((x) => x[0] === k), notice = NA[k];
    let h = notice ? `<p class="lead">${FILL(notice)}</p>` : '';
    h += '<dl class="kv">';
    if (e) h += `<dt>Milieux</dt><dd>${habList(e[2])}</dd><dt>Rareté</dt><dd>${rarTag(e[3])}</dd><dt>Danger</dt><dd>${esc(DANGER[e[4]] || e[4])}</dd>`;
    const tr = Object.keys(c).filter((q) => TRAITS[q] && c[q]).map((q) => TRAITS[q] + (q === 'sacre' && typeof c[q] === 'string' ? ` (${c[q] === 'dame' ? 'la Dame du lac' : c[q]})` : ''));
    if (tr.length) h += `<dt>Mœurs</dt><dd>${esc(uniq(tr).join(', '))}</dd>`;
    if (c.dmg) h += `<dt>Blessures</dt><dd>jusqu’à ${c.dmg} points par coup</dd>`;
    if (c.run) h += `<dt>Course</dt><dd>${nfmt(c.run)} m/s${c.walk ? ` (au pas ${nfmt(c.walk)} m/s)` : ''}</dd>`;
    if (c.flee) h += `<dt>Fuit à</dt><dd>${nfmt(c.flee)} m</dd>`;
    const pr = PREY[k];
    if (pr) h += `<dt>Vigueur</dt><dd>${pr.hp} points de vie</dd>${(pr.drop || []).length ? `<dt>Dépouille</dt><dd>${pr.drop.map((d) => IL(d[0]) + ` <small>${d[1] === d[2] ? d[1] : d[1] + '–' + d[2]}</small>`).join(', ')}</dd>` : ''}`;
    const buy = Object.keys(ITEMS).filter((i) => ITEMS[i].animal === k);
    if (buy.length) h += `<dt>S’achète</dt><dd>${buy.map((i) => IL(i) + ` <small>${nfmt(ITEMS[i].price)} pièces</small>`).join(', ')}</dd>`;
    const spawn = OT.filter((t) => t.animal === k).map((t) => t.id);
    const n = spawn.reduce((a, s) => a + ((W.objCounts || {})[s] || 0), 0);
    if (n) h += `<dt>Dans la vallée</dt><dd>${plur(n, 'gîte', 'gîtes')} ${spawn.some((s) => W.species && W.species.idx[s]) ? mapBtn('an:' + k, 'où les trouver') : ''}</dd>`;
    h += '</dl>';
    const extra = Object.keys(c).filter((q) => !TRAITS[q] && !['walk', 'run', 'range', 'flee', 'radius', 'idle', 'call', 'solid', 'rig', 'h', 'dmg'].includes(q));
    if (extra.length) h += `<details><summary>Autres caractéristiques</summary><dl class="kv">${extra.map((q) => `<dt>${esc(q)}</dt><dd>${esc(JSON.stringify(c[q]))}</dd>`).join('')}</dl></details>`;
    p.h = h;
    p.g = e ? (e[2].includes('ferme') ? 'À la ferme' : e[2].some((x) => ['rochers', 'neiges', 'alpage', 'sapiniere'].includes(x)) ? 'En montagne' : e[2].some((x) => ['marais', 'berges', 'riviere'].includes(x)) ? 'Au bord de l’eau' : 'Des bois et des prés') : 'Autres';
  }

  // ---------------------------------------------------------------- 7) MILIEUX
  for (const [k, nm] of Object.entries(HAB)) {
    const pls = EP.filter((e) => (e[1] || []).includes(k)).map((e) => e[0]);
    const trs = EAR.filter((e) => (e[1] || []).includes(k)).map((e) => e[0]);
    const ans = EA.filter((e) => (e[2] || []).includes(k));
    const fishes = Object.keys(FISH).filter((f) => (FISH[f].where || []).some((w) => (k === 'riviere' && w === 'riviere') || (k === 'marais' && w === 'marais') || (k === 'berges' && ['lac', 'etang'].includes(w)) || (k === 'souterrain' && w === 'souterrain')));
    const byRar = (ids, get) => ids.slice().sort((a, b) => (get(a) ?? 0) - (get(b) ?? 0));
    let h = `<p class="lead">Ce qui vit dans ${esc(nm)}, de la plus commune à la plus rare des espèces.</p>`;
    h += `<p>${mapBtn('mil:' + k, 'Voir ce milieu sur la carte')}</p>`;
    if (pls.length) h += `<h3>Plantes</h3><ul class="cards">${byRar(pls, (id) => (EP.find((e) => e[0] === id) || [])[2]).map((id) => `<li>${link('pl:' + id)} ${rarTag((EP.find((e) => e[0] === id) || [])[2])}</li>`).join('')}</ul>`;
    if (trs.length) h += `<h3>Arbres</h3><ul class="cards">${trs.map((id) => `<li>${link('pl:' + id)} ${rarTag((EAR.find((e) => e[0] === id) || [])[2])}</li>`).join('')}</ul>`;
    if (ans.length) h += `<h3>Bêtes</h3><ul class="cards">${ans.slice().sort((a, b) => a[3] - b[3]).map((e) => `<li>${link('an:' + e[0])} ${rarTag(e[3])}${e[4] >= 2 ? ' <span class="tag warn">dangereux</span>' : ''}</li>`).join('')}</ul>`;
    if (fishes.length) h += `<h3>Poissons</h3><ul class="cards">${fishes.map((f) => `<li>${IL(f)} ${rarTag(FR[f])}</li>`).join('')}</ul>`;
    P('mil:' + k).h = h;
    if (k === 'souterrain') P('mil:' + k).x = 1;
  }

  // ---------------------------------------------------------------- 8) HABITANTS
  const AREA = { ville: NAMES.ville, hameau: NAMES.hameau, lac: 'le grand lac', foret: 'la forêt', plateau: 'le plateau', nomade: 'sur les routes', sources: 'les Sources', nains: 'sous la montagne' };
  const placeKey = (pl, d) => {
    if (pl === 'home') return { t: 'chez soi', k: d.home };
    if (pl === 'work') return { t: d.work && d.work !== d.home ? 'au travail' : 'à l’ouvrage, chez soi', k: d.work || d.home };
    if (typeof pl === 'string' && pl.startsWith('bld:')) { const b = pl.slice(4), who = NPCS.find((q) => q.home === b); return { t: who ? `chez ${(who.names || [''])[0]} ${who.surname || ''}`.trim() : 'à ' + lieuName(b), k: b }; }
    if (typeof pl === 'string' && pl.startsWith('lieu:')) { const b = pl.slice(5); return { t: lieuName(b), k: b }; }
    const k = pl === 'marche' ? 'marche' : pl === 'champ' ? (d.home || 'ferme') : pl;
    return { t: LIEUN[pl] || (LM[pl] && LM[pl].name) || { champ: 'aux champs', lavoir: 'au lavoir', foret: 'en forêt', lande: 'sur la lande' }[pl] || pl, k };
  };
  const schedText = (S, d) => (S || []).map(([hr, pl]) => { const q = placeKey(pl, d); return `<span class="sch"><b>${hours(hr)}</b> ${pages.has('li:' + q.k) && q.t !== 'chez soi' ? placeLink(q.k, q.t) : esc(q.t)}</span>`; }).join(' ');
  const questHTML = (d, q) => {
    const typ = { apporter: 'apporter', parler: 'aller parler', livrer: 'livrer', trouver: 'retrouver', enquete: 'enquêter' }[q.type] || q.type;
    let h = `<div class="quest"><h4>« ${esc(q.title)} » <small>${esc(typ)}${q.minAmitie ? ` · amitié ${q.minAmitie} au moins` : ''}</small></h4><dl class="kv">`;
    if (q.need) h += `<dt>Il faut</dt><dd>${needList(q.need)}</dd>`;
    if (q.a) h += `<dt>${q.type === 'livrer' ? 'À livrer à' : 'Voir'}</dt><dd>${npcLink(q.a)}${q.objet ? ' — ' + IL(q.objet) : ''}</dd>`;
    else if (q.objet) h += `<dt>Objet</dt><dd>${IL(q.objet)}</dd>`;
    if (q.lieu) h += `<dt>Lieu</dt><dd>${q.type === 'trouver' ? secS(placeLink(q.lieu)) + '<span class="sec-note">masqué</span>' : placeLink(q.lieu)}${q.moment ? ` <small>(${esc(q.moment)})</small>` : ''}</dd>`;
    const rw = q.reward || {};
    const rws = [];
    if (rw.argent) rws.push(`${nfmt(rw.argent)} pièces`);
    if (rw.amitie) rws.push(`amitié +${rw.amitie}`);
    if (rw.recette) rws.push(`la recette : ${IL(rw.recette)}`);
    if (rw.objets) rws.push(Object.entries(rw.objets).map(([k, n]) => IL(k, n)).join(', '));
    for (const k of Object.keys(rw)) if (!['argent', 'amitie', 'recette', 'objets'].includes(k)) rws.push(esc(label(k)) + ' : ' + esc(JSON.stringify(rw[k])));
    if (rws.length) h += `<dt>Récompense</dt><dd>${rws.join(' · ')}</dd>`;
    h += '</dl>';
    const tx = q.texte || {};
    if (tx.offre) h += quote(tx.offre, d.id);
    const rest = Object.keys(tx).filter((k) => k !== 'offre');
    if (rest.length) h += SEC(`<details><summary>La suite de la quête</summary>${rest.map((k) => `<p class="small"><b>${esc(label(k))} :</b> ${FILL(tx[k], k === 'recu' ? q.a : d.id)}</p>`).join('')}</details>`, false);
    return h + '</div>';
  };
  for (const d of NPCS) {
    const p = P('pnj:' + d.id), L = LIFE[d.id] || null, id = d.id;
    const fig = FIG['pnj:' + id];
    let h = '';
    if (fig && fig.full) p.fig = fig.full;
    const names = (d.names || []).join(', ');
    const facts = [];
    facts.push(['Rôle', esc(d.role || '—')]);
    if (names) facts.push(['Prénom', `${esc(names)} <small>(tiré au sort à chaque partie)</small>`]);
    if (d.surname) facts.push(['Nom', esc(d.surname)]);
    if (d.age) facts.push(['Âge', d.age + ' ans']);
    facts.push(['Genre', d.gender === 'f' ? 'femme' : d.gender === 'm' ? 'homme' : esc(d.gender || '—')]);
    if (d.area) facts.push(['Vit', esc(AREA[d.area] || d.area)]);
    if (d.home) facts.push(['Maison', placeLink(d.home)]);
    if (d.work && d.work !== d.home) facts.push(['Travail', placeLink(d.work)]);
    if (d.traits && d.traits.length) facts.push(['Caractère', esc(d.traits.join(', '))]);
    if (d.liens) facts.push(['Liens', Object.entries(d.liens).map(([k, v]) => `${npcLink(k, NPC_BY[k] ? `${(NPC_BY[k].names || [])[0]} ${NPC_BY[k].surname || ''}`.trim() : k)} <small>(${esc(v)})</small>`).join(', ')]);
    if (L && L.foi) facts.push(['Foi', (FAITH[L.foi] ? link('foi:' + L.foi) : esc(L.foi)) + (L.devotion !== undefined ? ` <small>ferveur ${L.devotion}/3</small>` : '')]);
    if (L && L.fete) facts.push(['Fête', `le ${L.fete}ᵉ jour du cycle de 28 jours`]);
    if (d.look && (d.look.nude || d.look.dwarf)) facts.push(['Particularité', esc([d.look.nude ? 'naturiste' : '', d.look.dwarf ? 'nain' : ''].filter(Boolean).join(', '))]);
    if (d.nomade) facts.push(['Nomade', 'va d’un village à l’autre']);
    h += `<dl class="kv">${facts.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
    if (d.lines && d.lines.intro) h += `<h3>Quand on le rencontre</h3>${quote(d.lines.intro, id)}`;
    // cadeaux
    const gifts = [['Adore', d.loves], ['Aime', d.likes], ['Déteste', d.dislikes]].filter(([, a]) => a && a.length);
    if (gifts.length) h += `<h3>Cadeaux</h3><dl class="kv">${gifts.map(([k, a]) => `<dt>${k}</dt><dd>${a.map((x) => IL(x)).join(', ')}</dd>`).join('')}</dl>`;
    // boutique
    if (d.shop) {
      h += `<h3>Boutique : ${esc(d.shop.name || '')}</h3>`;
      if ((d.shop.sells || []).length) h += `<table class="t shop"><tr><th>Vend</th><th>Prix</th></tr>${d.shop.sells.map((e) => { const [x, pr] = Array.isArray(e) ? e : [e, ITEMS[e] && ITEMS[e].price]; return `<tr><td>${IL(x)}</td><td>${nfmt(pr)}</td></tr>`; }).join('')}</table>`;
      if ((d.shop.buys || []).length) h += `<p><b>Achète :</b> ${d.shop.buys.map((x) => (GROUPS[x] ? groupLink(x) : IL(x))).join(', ')}</p>`;
    }
    // quêtes
    if ((d.quests || []).length) h += `<h3>Quêtes</h3>${d.quests.map((q) => questHTML(d, q)).join('')}`;
    // routine et semaine
    if (d.schedule) h += `<h3>Une journée ordinaire</h3><p class="sched">${schedText(d.schedule, d)}</p>`;
    const R = RT[id];
    if (R && R.length && SEM.length) {
      const base = JSON.stringify(d.schedule || []);
      h += `<h3>Sa semaine de ${SEM.length} jours</h3><table class="t week">${R.map((S, k) => `<tr${JSON.stringify(S) === base ? ' class="same"' : ''}><th>${link('sem:' + k, SEM[k] ? SEM[k].nom : 'jour ' + (k + 1))}</th><td>${JSON.stringify(S) === base ? '<small>journée ordinaire</small>' : schedText(S, d)}</td></tr>`).join('')}</table>`;
    }
    // répliques
    if (d.lines) {
      const ln = Object.assign({}, d.lines); delete ln.intro;
      const secretL = {}; for (const k of ['tueur', 'indice']) if (ln[k]) { secretL[k] = ln[k]; delete ln[k]; }
      h += `<h3>Ce qu’on l’entend dire</h3><details><summary>Toutes ses répliques</summary>${tree(ln, 1, id)}</details>`;
      if (Object.keys(secretL).length || d.killer) h += SEC(`<h3>S’il était le tueur…</h3>${d.killer ? '<p><b class="warn">Peut être le tueur masqué</b> (un seul, tiré au sort à chaque partie parmi les habitants possibles).</p>' : ''}${tree(secretL, 1, id)}`, 'Ce qui trahirait le tueur est masqué (secrets).');
    }
    // sa vie
    if (L) {
      const hist = L.histoire || [];
      if (hist.length) h += `<h3>Son histoire</h3><p class="note">Racontée chapitre après chapitre, à mesure qu’on se lie.</p>${hist.map((c) => `<details><summary>${esc(c.titre || '')} <small>(amitié ${c.min || 0})</small></summary>${para(c.texte, id)}</details>`).join('')}`;
      const rest = Object.assign({}, L); for (const k of ['foi', 'devotion', 'fete', 'histoire', 'secret', 'mythes', 'mythe_intro']) delete rest[k];
      if ((L.mythes || []).length) h += `<h3>Ses légendes</h3><p>${L.mythes.map((m) => link('my:' + m)).join(', ')}</p>${(L.mythe_intro || []).map((t) => quote(t, id)).join('')}`;
      if (Object.keys(rest).length) h += `<details><summary>Sa vie : questions, humeurs, souvenirs, conversations…</summary>${tree(rest, 1, id)}</details>`;
      if (L.secret) h += SEC(`<h3>Son secret</h3>${para(L.secret, id)}`, 'Son secret est masqué.');
    }
    const others = Object.keys(d).filter((k) => !['id', 'role', 'gender', 'names', 'surname', 'age', 'area', 'home', 'work', 'traits', 'liens', 'killer', 'look', 'schedule', 'likes', 'loves', 'dislikes', 'shop', 'lines', 'quests', 'nomade'].includes(k));
    if (others.length) h += `<details><summary>Autres données</summary>${tree(Object.fromEntries(others.map((k) => [k, d[k]])), 1, id)}</details>`;
    p.h = h;
    p.g = d.area ? cap(AREA[d.area] || d.area) : 'Ailleurs';
    if (d.look && d.look.dwarf) p.x = 1; // les nains vivent dans un lieu caché
  }

  // ---------------------------------------------------------------- 9) LIVRES
  for (const [b, L] of Object.entries(LIVRES)) {
    const id = 'livre_' + b, p = pages.has('it:' + id) ? P('it:' + id) : P('lv:' + b, { t: L.titre || b, s: 'Livre', c: ['livres'], i: '📖' });
    if (!p.c.includes('livres')) p.c.push('livres');
    let h = `<dl class="kv"><dt>Auteur</dt><dd>${esc(L.auteur || '—')}</dd>`;
    const where = [];
    if (LMARCH.includes(b)) where.push('chez les marchands');
    if (L.biblio) where.push(`à la ${placeLink('bibliotheque', 'grande bibliothèque')} (prêt : à rendre à temps)`);
    if (L.prix) h += `<dt>Prix</dt><dd>${nfmt(L.prix)} pièces</dd>`;
    if (where.length) h += `<dt>Se trouve</dt><dd>${where.join(', ')}</dd>`;
    if (L.recettes && L.recettes.length) h += `<dt>Enseigne</dt><dd>${L.recettes.map((r) => IL(r)).join(', ')}</dd>`;
    if (L.langue) h += `<dt>Langue</dt><dd>${link('lg:' + L.langue)} — ${L.mots >= 999 ? 'tous les mots' : (L.mots || '?') + ' mots'}</dd>`;
    if (L.carte) h += `<dt>Carte</dt><dd>${esc((CARTES[L.carte] && CARTES[L.carte].titre) || L.carte)}</dd>`;
    h += `</dl>`;
    if (L.desc && !p.h.includes(esc(L.desc).slice(0, 30))) h = `<p class="lead">${FILL(L.desc)}</p>` + h;
    const pg = Array.isArray(L.pages) ? L.pages : null;
    if (pg && pg.length) {
      const body = pg.map((q) => `<section class="bookpage"><h4>${esc(q.titre || '')}</h4>${para(q.texte)}</section>`).join('');
      h += `<h3>Les pages</h3>` + (L.secret ? SEC(`<div class="book">${body}</div>`, 'Ce livre révèle un secret : ses pages sont masquées.') : `<div class="book">${body}</div>`);
    } else if (L.gen) {
      const cat = { bestiaire: 'betes', herbier: 'plantes', poissons: 'poissons' }[L.gen];
      h += `<p class="note">Ses pages reprennent les notices des espèces : voir ${cat ? `<a href="#/cat/${cat}">la section de ce wiki</a>` : 'les sections de ce wiki'}.</p>`;
    } else if (L.langue) {
      h += `<p class="note">Un lexique : ${link('lg:' + L.langue)}.</p>`;
    }
    const extra = Object.keys(L).filter((k) => !['titre', 'auteur', 'prix', 'col', 'gen', 'desc', 'pages', 'biblio', 'secret', 'recettes', 'langue', 'mots', 'carte'].includes(k));
    if (extra.length) h += `<details><summary>Autres données</summary>${tree(Object.fromEntries(extra.map((k) => [k, L[k]])), 1)}</details>`;
    p.h = h + p.h;
  }

  // ---------------------------------------------------------------- 10) LANGUES ET INSCRIPTIONS
  const insWhere = {};
  for (const it of INTER) if (it.data && it.data.ins) (insWhere[it.data.ins] || (insWhere[it.data.ins] = [])).push(it);
  for (const [k, L] of Object.entries(LANG)) {
    const lex = Object.entries(L.lex || {}).sort((a, b) => a[0].localeCompare(b[0], 'fr'));
    let h = `<p class="lead">${FILL(L.desc || '')}</p><dl class="kv"><dt>Peuple</dt><dd>${esc(L.peuple || '—')}</dd><dt>Écriture</dt><dd>${esc(L.ecriture || '—')}</dd><dt>Mots connus</dt><dd>${lex.length}</dd></dl>`;
    h += `<h3>Lexique</h3><table class="t lex"><tr><th>Mot</th><th>Graphie</th><th>Sens</th></tr>${lex.map(([m, s]) => `<tr><td><b>${esc(m)}</b></td><td><canvas class="glyph" data-lang="${esc(k)}" data-text="${esc(m)}" data-size="14"></canvas></td><td>${esc(s)}</td></tr>`).join('')}</table>`;
    const ins = INSC.filter((I) => I[1] === k);
    if (ins.length) h += `<h3>Inscriptions</h3><ul class="cards">${ins.map((I) => `<li>${link('ins:' + I[0], I[2])}</li>`).join('')}</ul>`;
    const books = Object.entries(LIVRES).filter(([, b]) => b.langue === k).map(([b]) => IL('livre_' + b));
    if (books.length) h += `<h3>Pour l’apprendre</h3><p>${books.join(', ')}</p>`;
    P('lg:' + k).h = h;
  }
  for (const I of INSC) {
    const [iid, lang, texte, sens, lieu] = I, L = LANG[lang] || {};
    const words = texte.split(/\s+/).filter((x) => x && x !== ',');
    let h = `<div class="inscr"><canvas class="glyph big" data-lang="${esc(lang)}" data-text="${esc(texte)}" data-size="22"></canvas></div>`;
    h += `<dl class="kv"><dt>Langue</dt><dd>${link('lg:' + lang)}</dd><dt>Lettres</dt><dd><i>${esc(texte)}</i></dd>`;
    const spots = insWhere[iid] || [];
    if (lieu || spots.length) h += `<dt>Où</dt><dd>${lieu ? placeLink(lieu) : ''}${spots.length ? (lieu ? ' — ' : '') + spots.map((s) => whereText(s.x, s.z) + ` ${mapBtn('xy:' + Math.round(s.x) + ',' + Math.round(s.z), 'la stèle')}`).join(', ') : ''}</dd>`;
    h += '</dl>';
    h += SEC(`<h3>Traduction</h3><p class="lead">${esc(sens)}</p><h4>Mot à mot</h4><p>${words.map((m) => { const s = (L.lex || {})[m] || (L.lex || {})[m.replace(/^na-/, '')]; return `<span class="gloss"><b>${esc(m)}</b><small>${esc(s ? (m.startsWith('na-') && !(L.lex || {})[m] ? 'de ' + s : s) : '?')}</small></span>`; }).join(' ')}</p>`, 'La traduction est masquée : à vous de la déchiffrer (ou de révéler les secrets).');
    P('ins:' + iid).h = h;
  }

  // ---------------------------------------------------------------- 11) LA SEMAINE
  SEM.forEach((J, k) => {
    const p = P('sem:' + k);
    let h = J.annonce ? `<p class="lead">${esc(J.annonce.replace(/^\(|\)$/g, ''))}</p>` : '';
    const who = [];
    for (const d of NPCS) {
      const S = RT[d.id] && RT[d.id][k];
      if (!S) continue;
      const base = d.schedule || [];
      const ends = S.map((e, i) => (S[i + 1] ? S[i + 1][0] : 24));
      const diff = S.map((e, i) => [e, ends[i]]).filter(([e]) => !base.some((b) => b[0] === e[0] && b[1] === e[1]) && e[1] !== 'home');
      if (diff.length) who.push(`<li>${npcLink(d.id)} : ${diff.map(([e, end]) => `${hours(e[0])}–${hours(end)} ${(() => { const q = placeKey(e[1], d); return pages.has('li:' + q.k) ? placeLink(q.k, q.t) : esc(q.t); })()}`).join(' ; ')}</li>`);
    }
    if (who.length) h += `<h3>Ce jour-là</h3><ul>${who.join('')}</ul>`;
    const extra = Object.keys(J).filter((q) => !['nom', 'cle', 'annonce'].includes(q));
    if (extra.length) h += tree(Object.fromEntries(extra.map((q) => [q, J[q]])), 1);
    p.h = h;
  });

  // ---------------------------------------------------------------- 12) LÉGENDES, FOIS, TEXTES
  for (const [k, M] of Object.entries(MYTHS)) {
    const tellers = Object.entries(LIFE).filter(([, L]) => (L.mythes || []).includes(k)).map(([n]) => npcLink(n));
    let h = M.resume ? `<p class="lead">${FILL(M.resume)}</p>` : '';
    if (tellers.length) h += `<p class="note">Racontée par ${tellers.join(', ')}.</p>`;
    h += para(M.texte);
    const sec = {}; for (const q of ['indice', 'decouverte']) if (M[q]) sec[q] = M[q];
    if (Object.keys(sec).length) h += SEC(Object.entries(sec).map(([q, t]) => `<h3>${q === 'indice' ? 'Ce qu’il faut faire' : 'Ce qu’on trouve'}</h3>${para(t)}`).join(''), 'La solution de la légende est masquée (secrets).');
    const extra = Object.keys(M).filter((q) => !['titre', 'resume', 'texte', 'indice', 'decouverte'].includes(q));
    if (extra.length) h += tree(Object.fromEntries(extra.map((q) => [q, M[q]])), 1);
    P('my:' + k).h = h;
  }
  for (const [k, F] of Object.entries(FAITH)) { const F2 = Object.assign({}, F); delete F2.nom; P('foi:' + k).h = tree(F2, 0); }
  {
    const pub = new Set(['panneaux', 'reliques', 'bornes']);
    for (const [k, v] of Object.entries(LORE)) {
      const id = 'txt:' + k;
      P(id, { t: cap(label(k)), s: 'Textes du monde', c: ['legendes'], i: '✒', x: pub.has(k) ? 0 : 1, h: tree(v, 0) });
    }
    const notes = [].concat(NOTES || [], XNOTES || []);
    if (notes.length) P('txt:notes_trouvees', { t: 'Notes et carnets à trouver', s: 'Textes du monde', c: ['legendes'], i: '✉', x: 1, h: notes.map((n) => `<section class="bookpage"><h4>${esc(n.titre || '')}</h4>${n.lieu ? `<p class="note">${placeLink(n.lieu)}</p>` : ''}${para(n.texte)}</section>`).join('') });
    if (SLET.length) P('txt:lettres', { t: 'Lettres sans signature', s: 'L’étrange', c: ['etrange'], i: '✉', x: 1, h: `<ul class="qs">${SLET.map((t) => `<li>${FILL(t)}</li>`).join('')}</ul>` });
    if (Object.keys(SIGT).length) P('txt:sigles', { t: 'Les signes', s: 'Sigles gravés et posés', c: ['legendes'], i: '✺', h: tree(SIGT, 0) + `<p>${mapBtn('couche:sigles', 'Voir les signes sur la carte')}</p>` });
    if (Object.keys(NPC_GEN).length) P('txt:repliques', { t: 'Répliques de tout le monde', s: 'Ce que disent les habitants', c: ['habitants'], i: '❝', h: tree(NPC_GEN, 0) });
    const WN = T('WEATHER_NAMES', {}), DK = T('DAY_KIND', {});
    if (Object.keys(WN).length) P('txt:meteo', { t: 'Le temps qu’il fait', s: 'Météo de la vallée', c: ['legendes'], i: '☁', h: `<p class="lead">Les temps que la vallée connaît.</p><p>${Object.values(WN).map((n) => `<span class="tag">${esc(n)}</span>`).join(' ')}</p>` + (Object.keys(DK).length ? `<h3>Les journées</h3>${tree(DK, 1)}` : '') });
  }

  // ---------------------------------------------------------------- 13) LES TROIS DIVINITÉS (tout ce qui parle d'Aëla, de Durn et de Vesh)
  {
    const gods = [];
    for (const [k, L] of Object.entries(LANG)) for (const [m, s] of Object.entries(L.lex || {})) if (/^[A-ZÀ-Ý][^\s]+ \(/.test(s)) gods.push({ name: s.split(' (')[0], gloss: s, word: m, lang: k });
    const names = uniq(gods.map((g) => g.name));
    const quotes = [];
    for (const [b, L] of Object.entries(LIVRES)) for (const q of Array.isArray(L.pages) ? L.pages : []) if (names.some((n) => (q.titre || '') === n || (q.texte || '').includes(n))) quotes.push({ b, q, secret: !!L.secret });
    const ins = INSC.filter((I) => names.some((n) => (I[3] || '').includes(n)));
    const divTables = Object.keys(DB.tables).filter((n) => /DIVIN|DIEU|TROIS|GODS?$/.test(n));
    let h = `<p class="lead">Les Aëlim priaient les Trois : ${names.map((n) => `<b>${esc(n)}</b>`).join(', ') || '—'}. Voici tout ce que la vallée en dit.</p>`;
    if (gods.length) h += `<h3>Leurs noms</h3><dl class="kv">${gods.map((g) => `<dt>${esc(g.word)}</dt><dd>${esc(g.gloss)} <small>(${link('lg:' + g.lang)})</small></dd>`).join('')}</dl>`;
    const pubQ = quotes.filter((q) => !q.secret), secQ = quotes.filter((q) => q.secret);
    if (pubQ.length) h += `<h3>Ce qu’en disent les livres</h3>${pubQ.map(({ b, q }) => `<section class="bookpage"><h4>${esc(q.titre || '')} <small>— ${IL('livre_' + b)}</small></h4>${para(q.texte)}</section>`).join('')}`;
    if (secQ.length) h += SEC(`<h3>Les livres interdits</h3>${secQ.map(({ b, q }) => `<section class="bookpage"><h4>${esc(q.titre || '')} <small>— ${IL('livre_' + b)}</small></h4>${para(q.texte)}</section>`).join('')}`, 'Ce que disent les livres de la bibliothèque est masqué (secrets).');
    if (ins.length) h += `<h3>Gravé dans la pierre</h3><ul>${ins.map((I) => `<li>${link('ins:' + I[0], I[2])}</li>`).join('')}</ul>`;
    const alt = INTER.filter((it) => /autel_|dormeur|pierre_trois|statue_dieu|temple/.test(it.kind));
    if (alt.length) h += SEC(`<h3>Au temple</h3><ul>${uniq(alt.map((it) => it.name + '|' + it.kind)).map((s) => `<li>${esc(s.split('|')[0])}</li>`).join('')}</ul><p>${placeLink('temple')}</p>`, 'Le temple est un lieu secret.');
    for (const n of divTables) { used.add(n); h += `<h3>${esc(cap(n.toLowerCase().replace(/_/g, ' ')))}</h3>` + tree(DB.tables[n].v, 1); }
    P('div:trois', { t: 'Les Trois divinités', s: names.join(', '), c: ['legendes'], i: '☉', h });
  }

  // ---------------------------------------------------------------- 14) ALCHIMIE
  {
    const pairs = Object.entries(A2), singles = Object.entries(A1);
    const combos = {};
    for (const [e, pid] of singles) (combos[pid] || (combos[pid] = [])).push([e]);
    for (const [k, pid] of pairs) (combos[pid] || (combos[pid] = [])).push(k.split('+'));
    for (const [pid, Pn] of Object.entries(POTIONS)) {
      if (!pages.has('it:' + pid)) continue;
      const p = P('it:' + pid);
      let h = `<h3>La potion</h3><dl class="kv"><dt>Effet</dt><dd>${FILL(Pn.desc || '—')}</dd>${Pn.h ? `<dt>Durée</dt><dd>${nfmt(Pn.h)} h</dd>` : ''}</dl>`;
      let s = '';
      if (Pn.need && Pn.need.length) s += `<p><b>Recette de l’alambic :</b> ${Pn.need.map((x) => IL(x)).join(' + ')}</p>`;
      if (combos[pid]) s += `<p><b>Essences qui la donnent :</b> ${combos[pid].map((c) => c.map((e) => `<span class="tag ess">${esc(ESSN[e] || e)}</span>`).join(' + ')).join(' · ')}</p>`;
      if (s) h += SEC(`<h3>Comment la faire</h3>${s}`, 'La façon de la faire est masquée (secrets).');
      p.h = h + p.h;
      if (!p.c.includes('alchimie')) p.c.push('alchimie');
    }
    let h = `<p class="lead">L’alchimie se fait à l’aveugle : chaque ingrédient porte des essences cachées ; mêlées, elles s’additionnent, les contraires se mangent, et ce qui domine décide de la potion.</p>`;
    if (ESSO.length) h += `<h3>Les essences et leurs contraires</h3><p>${Object.entries(ESSN).map(([k, n]) => { const o = ESSO.find((q) => q.includes(k)); return `<span class="tag ess">${esc(n)}${o ? ' ↔ ' + esc(ESSN[o[0] === k ? o[1] : o[0]]) : ''}</span>`; }).join(' ')}</p>`;
    h += `<h3>Les potions</h3><ul class="cards">${Object.keys(POTIONS).filter((q) => pages.has('it:' + q)).map((q) => `<li>${IL(q)}</li>`).join('')}</ul>`;
    let s = '';
    if (singles.length) s += `<h3>Une essence seule qui domine</h3><table class="t"><tr><th>Essence</th><th>Potion</th></tr>${singles.map(([e, pid]) => `<tr><td>${esc(ESSN[e] || e)}</td><td>${IL(pid)}</td></tr>`).join('')}</table>`;
    if (pairs.length) s += `<h3>Deux essences fortes ensemble</h3><table class="t"><tr><th>Essences</th><th>Potion</th></tr>${pairs.map(([k, pid]) => `<tr><td>${k.split('+').map((e) => esc(ESSN[e] || e)).join(' + ')}</td><td>${IL(pid)}</td></tr>`).join('')}</table>`;
    const ing = Object.entries(ESS).sort((a, b) => iname(a[0]).localeCompare(iname(b[0]), 'fr'));
    if (ing.length) s += `<h3>Les essences de chaque ingrédient</h3><table class="t"><tr><th>Ingrédient</th>${Object.values(ESSN).map((n) => `<th class="vt">${esc(n)}</th>`).join('')}</tr>${ing.map(([id, e]) => `<tr><td>${IL(id)}</td>${Object.keys(ESSN).map((k) => `<td class="c">${e[k] ? '●'.repeat(e[k]) : ''}</td>`).join('')}</tr>`).join('')}</table>`;
    const classic = Object.entries(POTIONS).filter(([, q]) => q.need && q.need.length);
    if (classic.length) s += `<h3>Les recettes de l’alambic</h3><table class="t"><tr><th>Potion</th><th>Ingrédients</th></tr>${classic.map(([pid, q]) => `<tr><td>${IL(pid)}</td><td>${q.need.map((x) => IL(x)).join(' + ')}</td></tr>`).join('')}</table>`;
    h += SEC(s, 'Les tables d’essences et les combinaisons sont masquées (secrets).');
    if (Object.keys(BUFFN).length) h += `<h3>Les effets qu’on peut ressentir</h3><p>${Object.values(BUFFN).map((n) => `<span class="tag">${esc(n)}</span>`).join(' ')}</p>`;
    P('alch:regles', { t: 'L’alchimie', s: 'Règles, essences, combinaisons', c: ['alchimie'], i: '⚗', h });
  }

  // ---------------------------------------------------------------- 15) BUTINS
  for (const [k, L] of Object.entries(LOOT)) {
    const spots = lootSpots[k] || [];
    let h = `<p>${L.rolls ? `On en tire ${L.rolls[0] === L.rolls[1] ? L.rolls[0] : L.rolls[0] + ' à ' + L.rolls[1]} objets à chaque fouille.` : ''}</p>`;
    const tot = (L.items || []).reduce((a, e) => a + (e[3] || 0), 0) || 1;
    h += `<table class="t"><tr><th>Objet</th><th>Quantité</th><th>Chance</th></tr>${(L.items || []).map((e) => `<tr><td>${IL(e[0])}</td><td>${e[1] || e[2] ? (e[1] === e[2] ? e[1] : e[1] + ' à ' + e[2]) : '<small>caché ici pour une quête</small>'}</td><td>${e[3] ? Math.round(e[3] / tot * 100) + ' %' : '—'}</td></tr>`).join('')}</table>`;
    if (spots.length) {
      const by = {};
      for (const s of spots) { const Lp = placeAt(s.x, s.z); const key = Lp ? Lp.key : '?'; (by[key] || (by[key] = [])).push(s); }
      h += `<h3>Où fouiller</h3><ul>${Object.entries(by).map(([key, a]) => `<li>${key === '?' ? 'dans la nature' : placeLink(key)} ${a.length > 1 ? '×' + a.length : ''} ${mapBtn('xy:' + Math.round(a[0].x) + ',' + Math.round(a[0].z), 'carte')}</li>`).join('')}</ul>`;
    }
    P('bt:' + k).h = h;
  }

  // ---------------------------------------------------------------- 16) LIEUX
  const inRange = (L, x, z, m = 1.1) => dist(L.x, L.z, x, z) <= (L.r || 6) * m + 3;
  const SAFE_INTER = new Set(['bed', 'chest', 'cook', 'water', 'mailbox', 'rentbed', 'bell', 'sign', 'mapboard', 'lire', 'pray', 'benitier', 'alambic', 'book_legends', 'affiche', 'arrivages', 'refuge', 'peche_glace', 'biblio', 'biblio_rayon', 'biblio_vitrine', 'bain', 'alch_table', 'ladder', 'grimper', 'forage', 'water']);
  const regionOf = (x, z) => Object.entries(CARTES).filter(([, C]) => C.x !== undefined && dist(C.x, C.z, x, z) <= C.r).map(([k, C]) => IL('carte_' + k, undefined) || esc(C.titre));
  const allPlaces = [...(W.lm || []).map((L) => ({ key: L.key, L, B: BLD[L.key] || null })), ...(W.bld || []).filter((B) => !LM[B.key]).map((B) => ({ key: B.key, L: null, B }))];
  for (const { key, L, B } of allPlaces) {
    const p = P('li:' + key), X = L || B, x = X.x, z = X.z, r = (L && L.r) || 8;
    let h = '<dl class="kv">';
    h += `<dt>Situation</dt><dd>${key === 'ferme' ? 'la ferme elle-même' : esc(bearing(x, z)) + ' de la ferme'} <small>(x ${Math.round(x)}, z ${Math.round(z)})</small></dd>`;
    const y = L ? L.y : B.y;
    if (y !== undefined && y !== null) h += `<dt>Altitude</dt><dd>${Math.round(y - (W.waterLevel || 0))} m au-dessus de l’eau</dd>`;
    if (L && L.r >= 30) h += `<dt>Étendue</dt><dd>${Math.round(L.r * 2)} m environ</dd>`;
    if (L && L.under) h += `<dt>Sous terre</dt><dd>oui</dd>`;
    if (L && L.secret) h += `<dt>Secret</dt><dd>un lieu caché, qu’on ne trouve qu’en cherchant bien</dd>`;
    const regs = regionOf(x, z);
    if (regs.length) h += `<dt>Sur les cartes</dt><dd>${regs.join(', ')}</dd>`;
    h += '</dl>';
    h += `<p>${mapBtn('li:' + key)}</p>`;
    // qui vit et travaille là
    const live = NPCS.filter((d) => d.home === key || d.work === key || (L && [d.home, d.work].some((b) => BLD[b] && inRange(L, BLD[b].x, BLD[b].z, 1.0) && L.r < 120)));
    if (live.length) h += `<h3>Habitants</h3><ul class="cards">${live.map((d) => `<li>${npcLink(d.id)} <small>${d.home === key || (BLD[d.home] && L && inRange(L, BLD[d.home].x, BLD[d.home].z, 1)) ? 'y habite' : 'y travaille'}</small></li>`).join('')}</ul>`;
    // routines qui y mènent
    const visit = [];
    for (const d of NPCS) {
      const S = RT[d.id] || [];
      S.forEach((day, k) => { for (const [hr, pl] of day) { const q = placeKey(pl, d); if (q.k === key && pl !== 'home' && pl !== 'work') visit.push([d.id, k, hr]); } });
    }
    if (visit.length) { const by = {}; for (const [n, k, hr] of visit) (by[n] || (by[n] = [])).push(`${SEM[k] ? SEM[k].nom : k + 1} ${hours(hr)}`); h += `<h3>Qui y passe</h3><ul>${Object.entries(by).map(([n, a]) => `<li>${npcLink(n)} : ${esc(uniq(a).slice(0, 8).join(', '))}${a.length > 8 ? '…' : ''}</li>`).join('')}</ul>`; }
    // bâtiments dans le lieu
    if (L && L.r >= 10) { const bs = (W.bld || []).filter((b) => b.key !== key && inRange(L, b.x, b.z, 1.0)); if (bs.length) h += `<h3>Bâtiments</h3><ul class="cards">${bs.map((b) => `<li>${placeLink(b.key)}</li>`).join('')}</ul>`; }
    // eaux et poissons
    if (L && L.fish) { const f = fishSet(L.fish); if (f.length) h += `<h3>Pêche : ${esc(EAUX[L.fish] || L.fish)}</h3><ul class="cards">${f.map((q) => `<li>${IL(q)} ${rarTag(FR[q])}</li>`).join('')}</ul>`; }
    // ce qu'on y trouve
    const its = INTER.filter((it) => inRange({ x, z, r }, it.x, it.z, 1.05));
    const pubI = its.filter((it) => SAFE_INTER.has(it.kind)), secI = its.filter((it) => !SAFE_INTER.has(it.kind));
    const lab = (a) => uniq(a.map((it) => it.name || it.kind)).map((n) => { const c = a.filter((it) => (it.name || it.kind) === n).length; return `<li>${esc(n)}${c > 1 ? ' ×' + c : ''}</li>`; }).join('');
    if (pubI.length) h += `<h3>On peut y…</h3><ul class="cols">${lab(pubI)}</ul>`;
    if (secI.length) h += SEC(`<h3>Ce qui s’y cache</h3><ul class="cols">${lab(secI)}</ul>${uniq(secI.filter((it) => it.kind === 'loot' && it.data && it.data.table).map((it) => it.data.table)).map((t) => link('bt:' + t)).join(', ')}`, false);
    const ins = INSC.filter((I) => I[4] === key || (insWhere[I[0]] || []).some((s) => inRange({ x, z, r }, s.x, s.z)));
    if (ins.length) h += `<h3>Inscriptions</h3><ul>${ins.map((I) => `<li>${link('ins:' + I[0], I[2])}</li>`).join('')}</ul>`;
    const qs = NPCS.flatMap((d) => (d.quests || []).filter((q) => q.lieu === key).map((q) => [d, q]));
    if (qs.length) h += `<h3>Quêtes</h3><ul>${qs.map(([d, q]) => `<li>« ${esc(q.title)} » — ${npcLink(d.id)}</li>`).join('')}</ul>`.replace(/^/, qs.some(([, q]) => q.type === 'trouver') ? '' : '');
    // textes attachés
    const lore = LORE[key];
    if (lore) h += SEC(`<h3>Ce qu’on y découvre</h3>${tree(lore, 1)}`, false);
    const pan = LORE.panneaux && LORE.panneaux[key];
    if (pan) h += `<h3>Le panneau</h3>${quote(pan)}`;
    if (SHRINE[key]) h += `<p class="note">Ici : ${esc(SHRINE[key])}.</p>`;
    const secs = (W.secrets || []).filter((s) => inRange({ x, z, r }, s.x, s.z, 1.3));
    if (secs.length) h += SEC(`<h3>Trésor</h3><ul>${secs.map((s) => `<li>${esc(s.kind)} ${s.myth ? '— ' + link('my:' + s.myth) : ''}${s.relic ? ' — ' + IL(s.relic) : ''}</li>`).join('')}</ul>`, false);
    // alentours
    const near = (W.lm || []).filter((o) => o.key !== key && !(o.r > 200) && dist(o.x, o.z, x, z) < 260).sort((a, b) => dist(a.x, a.z, x, z) - dist(b.x, b.z, x, z)).slice(0, 8);
    if (near.length) h += `<h3>Alentours</h3><ul class="cards">${near.map((o) => `<li>${placeLink(o.key)} <small>${Math.round(dist(o.x, o.z, x, z))} m</small></li>`).join('')}</ul>`;
    p.h = h;
    p.map = [Math.round(x), Math.round(z)];
    p.g = L ? (L.under ? 'Sous terre' : L.secret ? 'Lieux secrets' : L.fish ? 'Les eaux' : L.r >= 100 ? 'Contrées' : dist(x, z, (LM.place || FARM).x, (LM.place || FARM).z) < 90 ? cap(NAMES.ville || 'La ville') : 'Lieux-dits') : 'Maisons et bâtiments';
  }

  // ---------------------------------------------------------------- 17) L'ÉTRANGE
  {
    const looks = Object.keys(FIG).filter((k) => k.startsWith('look:'));
    const LNAMES = { KILLER_LOOK: 'Le tueur masqué', FIGURE_LOOK: 'La silhouette noire', MONK_LOOK: 'Le moine sans visage', LADY_LOOK: 'La dame blanche', SOWER_LOOK: 'Le semeur' };
    for (const k of looks) {
      const n = k.slice(5);
      P('ent:' + n, { t: LNAMES[n] || cap(n.replace(/_LOOK$/, '').toLowerCase().replace(/_/g, ' ')), s: 'Apparition', c: ['etrange'], i: 'fg:' + FIG[k].full.join(','), x: 1, fig: FIG[k].full, h: `<p class="note">Une silhouette qu’on croise dans la vallée, quand elle le veut bien.</p>` + (LORE.anomalies && LORE.anomalies[{ MONK_LOOK: 'moine', LADY_LOOK: 'dame', SOWER_LOOK: 'semeur' }[n]] ? tree(LORE.anomalies[{ MONK_LOOK: 'moine', LADY_LOOK: 'dame', SOWER_LOOK: 'semeur' }[n]], 1) : '') });
    }
    if (EVT.length) {
      const WHEN = { matin: 'le matin', jour: 'le jour', nuit: 'la nuit', aube: 'à l’aube' }, LV = ['presque imperceptible', 'discret', 'visible', 'flagrant'];
      const lv = uniq(EVT.map((e) => e.lvl)).sort();
      P('ent:evenements', { t: 'Les manifestations', s: 'Ce qui arrive, peu à peu', c: ['etrange'], i: '☾', x: 1, h: `<p class="lead">Au fil des jours, l’étrange monte par degrés. Chaque soir, une chance qu’il se passe quelque chose.</p>` + lv.map((l) => `<h3>Degré ${l} : ${esc(LV[l] || '')}</h3><p>${EVT.filter((e) => e.lvl === l).map((e) => `<span class="tag">${esc(e.id)} <small>${esc(WHEN[e.when] || e.when || '')}</small></span>`).join(' ')}</p>`).join('') });
    }
    const killers = NPCS.filter((d) => d.killer);
    if (killers.length) P('ent:tueur', { t: 'Qui peut être le tueur ?', s: 'Tiré au sort à chaque partie', c: ['etrange'], i: '🔪', x: 1, h: `<p class="lead">À chaque partie, l’un de ces habitants est le tueur masqué.</p><ul class="cards">${killers.filter((d) => d.id !== 'fillette').map((d) => `<li>${npcLink(d.id)}</li>`).join('')}</ul>` });
  }

  // ---------------------------------------------------------------- 18) CARTES DES RÉGIONS
  for (const [k, C] of Object.entries(CARTES)) {
    const id = 'carte_' + k;
    if (!pages.has('it:' + id)) continue;
    const p = P('it:' + id);
    p.h = `<p>${mapBtn('reg:' + k, 'Voir la région couverte')}</p>` + p.h;
    if (!p.c.includes('cartes')) p.c.push('cartes');
  }

  // ---------------------------------------------------------------- 19) AUTRES TABLES (tout ce qui n'a pas de section)
  const other = [];
  for (const [name, { file, v }] of Object.entries(DB.tables)) {
    if (used.has(name) || /_LOOK$/.test(name)) continue;
    const st = proseStats(v);
    if (st.code || st.prose < 40) continue;
    other.push(name);
    P('tab:' + name, { t: cap(name.toLowerCase().replace(/_/g, ' ')), s: `table ${name} (${file})`, c: ['autres'], i: '▤', h: `<p class="note">Table <code>${esc(name)}</code> du fichier <code>${esc(file)}</code>, affichée telle quelle.</p>` + tree(v, 0) });
  }

  // ---------------------------------------------------------------- catégories
  const byCat = (c) => [...pages.values()].filter((p) => p.c.includes(c)).map((p) => p.id);
  const sortT = (ids) => ids.sort((a, b) => pages.get(a).t.localeCompare(pages.get(b).t, 'fr'));
  const groupBy = (ids, f) => { const g = {}; for (const id of ids) { const k = f(pages.get(id)) || 'Autres'; (g[k] || (g[k] = [])).push(id); } return Object.entries(g).map(([t, a]) => ({ t, ids: sortT(a) })); };
  const itemGroup = (p) => { const id = p.id.slice(3), it = ITEMS[id]; return it ? CATN[it.cat] || cap(it.cat || 'Autres') : 'Autres'; };
  const cats = [
    { id: 'habitants', t: 'Habitants', d: 'Les gens de la vallée : leurs journées, leurs boutiques, leurs quêtes, leurs histoires.', groups: groupBy(byCat('habitants'), (p) => p.g || 'Autres') },
    { id: 'lieux', t: 'Lieux', d: 'Villes, hameaux, lieux-dits, bâtiments, et ce qu’on y trouve.', groups: groupBy(byCat('lieux'), (p) => p.g) },
    { id: 'objets', t: 'Objets', d: 'Tout ce qui se ramasse, s’achète, se fabrique.', groups: groupBy(byCat('objets'), itemGroup) },
    { id: 'recettes', t: 'Recettes', d: 'Ce qui se fabrique, où, et avec quoi.', page: true },
    { id: 'cultures', t: 'Cultures', d: 'Ce qui se sème au potager : temps de pousse, récolte, variétés.', page: true },
    { id: 'plantes', t: 'Plantes sauvages', d: 'Fleurs, herbes et champignons de chaque milieu.', groups: groupBy(byCat('plantes'), (p) => { const f = floraInfo[p.id.slice(3)]; return f && f.rar !== null && f.rar !== undefined ? cap(RAR[f.rar] || '') : 'Sans rareté connue'; }) },
    { id: 'arbres', t: 'Arbres', d: 'Les essences de la vallée.', groups: [{ t: 'Arbres', ids: sortT(byCat('arbres')) }] },
    { id: 'betes', t: 'Bêtes', d: 'Gibier, bêtes des bois, des eaux et des montagnes, et bêtes de ferme.', groups: groupBy(byCat('betes'), (p) => p.g) },
    { id: 'poissons', t: 'Poissons', d: 'Toutes les eaux, toutes les heures, du gardon à la Reine du lac.', groups: groupBy(byCat('poissons'), (p) => cap(RAR[FR[p.id.slice(3)]] || 'Autres')) },
    { id: 'milieux', t: 'Milieux', d: 'Chaque milieu a ses plantes et ses bêtes.', groups: [{ t: 'Milieux', ids: byCat('milieux') }] },
    { id: 'alchimie', t: 'Alchimie', d: 'Les potions, et (en secret) les essences et les combinaisons.', groups: [{ t: 'Règles', ids: ['alch:regles'] }, { t: 'Potions', ids: sortT(byCat('alchimie').filter((i) => i !== 'alch:regles')) }] },
    { id: 'livres', t: 'Livres', d: 'Ceux des marchands et ceux de la grande bibliothèque.', groups: groupBy(byCat('livres'), (p) => { const b = p.id.replace(/^it:livre_/, ''); return LIVRES[b] && LIVRES[b].biblio ? 'La grande bibliothèque' : 'Chez les marchands'; }) },
    { id: 'langues', t: 'Langues perdues', d: 'L’aëlin et le gorrain : lexiques, écritures, inscriptions.', groups: [{ t: 'Langues', ids: byCat('langues').filter((i) => i.startsWith('lg:')) }, { t: 'Inscriptions', ids: byCat('langues').filter((i) => i.startsWith('ins:')) }] },
    { id: 'semaine', t: 'La semaine', d: `${SEM.length} jours, chacun avec son nom et ses habitudes.`, groups: [{ t: 'Les jours', ids: byCat('semaine') }] },
    { id: 'legendes', t: 'Légendes et lore', d: 'Légendes, fois, divinités, signes, textes du monde.', groups: groupBy(byCat('legendes'), (p) => (p.id.startsWith('my:') ? 'Légendes' : p.id.startsWith('foi:') ? 'Les fois' : p.id.startsWith('div:') ? 'Les divinités' : 'Textes')) },
    { id: 'cartes', t: 'Cartes des régions', d: 'Les cartes qu’on achète : jamais toute la vallée.', groups: [{ t: 'Cartes', ids: sortT(byCat('cartes')) }] },
    { id: 'etrange', t: 'L’étrange', d: 'Apparitions, manifestations, lettres… (secrets).', groups: [{ t: 'L’étrange', ids: byCat('etrange') }] },
    { id: 'butins', t: 'Butins', d: 'Ce qu’on trouve en fouillant les coffres et les caches (secrets).', groups: [{ t: 'Tables de butin', ids: sortT(byCat('butins')) }] },
    { id: 'autres', t: 'Autres tables', d: 'Les tables du jeu qui n’ont pas de section à elles, affichées telles quelles.', groups: [{ t: 'Tables', ids: sortT(byCat('autres')) }] },
  ].filter((c) => c.page || c.groups.some((g) => g.ids.length));

  // pages de catégorie à contenu propre : recettes, cultures
  {
    const bySt = {};
    RECIPES.forEach((r) => { (bySt[r.st || ''] || (bySt[r.st || ''] = [])).push(r); });
    let h = `<p class="lead">${RECIPES.length} recettes. Seules les recettes de base sont connues au départ ; les autres s’apprennent (quêtes, livres, habitants) ou se découvrent en assemblant les bons ingrédients.</p>`;
    for (const [st, rs] of Object.entries(bySt)) h += `<h3>${esc(cap(stationName(st || null)))}</h3><table class="t"><tr><th>Donne</th><th>Il faut</th><th>Connue</th></tr>${rs.map((r) => `<tr><td>${IL(r.out)}${r.n > 1 ? ` <small>×${r.n}</small>` : ''}</td><td>${needList(r.need)}</td><td><small>${CRAFT_BASE.has(r.out) ? 'dès le départ' : (teach[r.out] || []).length ? 'à apprendre' : 'à découvrir'}</small></td></tr>`).join('')}</table>`;
    if (Object.keys(MACHINES).length) h += `<h3>Les machines</h3><table class="t"><tr><th>Machine</th><th>On y met</th><th>On obtient</th><th>Temps</th></tr>${Object.entries(MACHINES).flatMap(([m, L]) => (L || []).map((e) => `<tr><td>${esc(label(m))}</td><td>${needList(e.in)}</td><td>${IL(e.out[0], e.out[1])}</td><td>${nfmt(e.h)} h</td></tr>`)).join('')}</table>` + (Object.keys(MACHINE_HINT).length ? `<p class="note">${Object.values(MACHINE_HINT).map(esc).join(' ')}</p>` : '');
    P('cat:recettes', { t: 'Recettes', s: 'Fabrication, cuisine, fonte, machines', c: [], i: '⚒', h });
    let hc = `<p class="lead">${cropRows.length} cultures. Les heures sont des heures de jeu, terre humide.</p><table class="t"><tr><th>Culture</th><th>Pousse</th><th>Repousse</th><th>Récolte</th><th>Graines</th><th>Vente</th></tr>${cropRows.map(([c, out, cr, seeds]) => `<tr><td>${out ? IL(out) : esc(cr.name)}</td><td>${nfmt(cr.h)} h</td><td>${cr.regrow ? nfmt(cr.regrow) + ' h' : '—'}</td><td>${cr.yield ? cr.yield.join('–') : '—'}</td><td>${seeds.map((s) => IL(s) + (ITEMS[s].buy ? ` <small>${ITEMS[s].buy}</small>` : '')).join(' ')}</td><td>${out && ITEMS[out] ? nfmt(ITEMS[out].price) : '—'}</td></tr>`).join('')}</table>`;
    P('cat:cultures', { t: 'Cultures', s: 'Le potager', c: [], i: '🌱', h: hc });
    const fishT = `<table class="t"><tr><th>Poisson</th><th>Eaux</th><th>Heure</th><th>Rareté</th><th>Prix</th></tr>${Object.keys(FISH).filter((f) => ITEMS[f]).sort((a, b) => (FR[a] ?? 0) - (FR[b] ?? 0)).map((f) => `<tr><td>${IL(f)}</td><td>${(FISH[f].where || []).map((k) => esc(EAUX[k] || k)).join(', ')}</td><td>${esc(FISH[f].time || '')}</td><td>${rarTag(FR[f])}</td><td>${nfmt(FISH[f].price)}</td></tr>`).join('')}</table>`;
    P('cat:poissons', { t: 'Poissons', s: 'Tableau de pêche', c: [], i: '🐟', h: `<p class="lead">Où, quand, et combien ils sont rares.</p><p>${mapBtn('couche:peche', 'Les zones de pêche sur la carte')}</p>` + fishT });
  }

  // toutes les quêtes
  {
    const qs = NPCS.flatMap((d) => (d.quests || []).map((q) => [d, q]));
    const typ = { apporter: 'apporter', parler: 'aller parler', livrer: 'livrer', trouver: 'retrouver', enquete: 'enquêter' };
    if (qs.length) {
      P('cat:quetes', { t: 'Quêtes', s: `${qs.length} quêtes`, c: [], i: '✎', h: `<p class="lead">Ce que les habitants vous demandent, à mesure qu’ils vous font confiance.</p><table class="t"><tr><th>Quête</th><th>Qui</th><th>Quoi</th><th>Récompense</th></tr>${qs.map(([d, q]) => `<tr><td>« ${esc(q.title)} »${q.minAmitie ? ` <small>amitié ${q.minAmitie}</small>` : ''}</td><td>${npcLink(d.id)}</td><td>${esc(typ[q.type] || q.type || '')}${q.need ? ' : ' + needList(q.need) : ''}${q.a ? ' → ' + npcLink(q.a) : ''}${q.objet ? ' ' + IL(q.objet) : ''}${q.lieu && q.type !== 'trouver' ? ' — ' + placeLink(q.lieu) : ''}${q.moment ? ` <small>(${esc(q.moment)})</small>` : ''}</td><td>${[q.reward && q.reward.argent ? nfmt(q.reward.argent) + ' pièces' : '', q.reward && q.reward.recette ? 'recette : ' + IL(q.reward.recette) : '', q.reward && q.reward.objets ? Object.entries(q.reward.objets).map(([k, n]) => IL(k, n)).join(', ') : ''].filter(Boolean).join(' · ')}</td></tr>`).join('')}</table>` });
      cats.splice(1, 0, { id: 'quetes', t: 'Quêtes', d: 'Toutes les quêtes des habitants.', page: true });
    }
  }
  // semaine : page d'ensemble
  if (SEM.length) P('cat:semaine', { t: 'La semaine', s: `${SEM.length} jours`, c: [], i: '📅', h: `<p class="lead">Dans la vallée, la semaine compte ${SEM.length} jours${DB.derived.jour ? `, et une journée dure ${Math.round(DB.derived.jour / 60)} minutes` : ''}.</p><table class="t">${SEM.map((J, k) => `<tr><th>${link('sem:' + k)}</th><td>${esc((J.annonce || '').replace(/^\(|\)$/g, ''))}</td></tr>`).join('')}</table>` });

  return { pages: [...pages.values()], cats, other, used: [...used], SAFE_INTER };
}

// ---------------------------------------------------------------- les données de la carte (pour la page)
const PROP_LABELS = {
  poteau_dir: 'Poteau indicateur', panneau_carte: 'Panneau-carte', calvaire: 'Calvaire', croix: 'Croix', pierre_dressee: 'Pierre dressée', dolmen: 'Dolmen', stele: 'Stèle',
  cairn: 'Cairn', pont_bois: 'Pont de bois', tombe: 'Tombe', moulin_ailes: 'Moulin', ponton: 'Ponton', barque: 'Barque', tente: 'Tente', charrette_renversee: 'Charrette renversée',
  feu_camp: 'Feu de camp', statue: 'Statue', monument: 'Monument aux morts', ruche: 'Ruche', four_pain: 'Four à pain', abreuvoir: 'Abreuvoir', lampadaire: 'Réverbère',
  pierre_offrandes: 'Pierre aux offrandes', pierre_dame: 'Pierre de la Dame', pierre_cerf: 'Pierre du Cerf', puits_deco: 'Puits', mat_drapeau: 'Drapeau', balancoire: 'Balançoire',
  trou_glace: 'Trou dans la glace', cascade: 'Cascade', feu_geant: 'Feu des géants', vitrine: 'Vitrine', trophee: 'Trophées', borne: 'Borne', charbonniere: 'Charbonnière', cloche_noyee: 'Cloche noyée',
};
function buildMapData(DB, wiki) {
  const W = DB.world, T = (n, d) => (DB.tables[n] ? DB.tables[n].v : d);
  const NPCS = T('NPC_DATA', []), OT = T('OBJ_TYPES', []), CARTES = T('CARTES_REGIONS', {}), HAB = T('HABITATS', {}), EAUX = T('EAUX', {}), FISH = T('FISH', {}), SIGT = T('SIGIL_TEXT', {});
  const homes = {};
  for (const d of NPCS) for (const b of uniq([d.home, d.work].filter(Boolean))) (homes[b] || (homes[b] = [])).push([d.id, `${(d.names || [])[0] || ''} ${d.surname || ''}`.trim(), d.home === b ? 1 : 0, d.role || '']);
  const SAFE = wiki.SAFE_INTER;
  const poi = (W.inter || []).map((it) => [it.kind, it.name || it.kind, it.x, it.z, SAFE.has(it.kind) ? 0 : 1, it.data ? String(it.data.table || it.data.ins || it.data.kind || it.data.sigle || it.data.faith || it.data.key || '') : '']);
  const spawns = {};
  for (const t of OT) if (t.animal && t.animal !== 'villager') (spawns[t.animal] || (spawns[t.animal] = [])).push(t.id);
  const spNames = {};
  for (const id of Object.keys((W.species && W.species.idx) || {})) spNames[id] = (OT.find((t) => t.id === id) || {}).name || id;
  const regions = Object.entries(CARTES).filter(([, C]) => C.x !== undefined).map(([k, C]) => [k, C.titre, C.x, C.z, C.r]);
  const fishBy = {};
  for (const [f, F] of Object.entries(FISH)) for (const k of F.where || []) (fishBy[k] || (fishBy[k] = [])).push([f, F.name]);
  return {
    size: W.size, wl: W.waterLevel, knots: W.altKnots, shadeFlat: W.shadeFlat, snow: W.snowLine,
    grids: { ground: W.ground, shade: W.shade, alt: W.alt, forest: W.forest, milieu: W.milieu },
    mats: (DB.derived.mats || []).map((m) => [m.id, m.avg]), milieux: (W.milieuKeys || []).map((k) => [k, HAB[k] || k]),
    lm: (W.lm || []).map((L) => [L.key, L.name, L.x, L.z, L.r, (L.secret ? 1 : 0) | (L.under ? 2 : 0), L.fish || '', L.y]),
    bld: (W.bld || []).map((B) => [B.key, /^vide\d*$/.test(B.name) ? 'maison vide' : B.name, B.x, B.z, B.under ? 1 : 0]),
    homes, nav: W.nav, poi, props: (W.props || []).filter((p) => PROP_LABELS[p[0]]).map((p) => [p[0], p[1], p[2]]), propLabels: PROP_LABELS,
    fish: W.fishZones || [], fishBy, eaux: EAUX, lakes: W.lakes || [], pools: W.pools || [], moat: W.moat, bridges: W.bridges || [], crevasses: W.crevasses || [],
    noBuild: W.noBuild || [], secrets: W.secrets || [], caves: W.caves || [], boards: W.mapBoards || [], herd: W.herd, regions,
    blocks: W.blocks, species: W.species, spawns, spNames, sigils: Object.fromEntries(Object.entries(SIGT).map(([k, v]) => [k, (v && v.titre) || k])),
  };
}

// ============================================================================
//  LA PAGE (code exécuté dans le navigateur : recopié tel quel dans le HTML)
// ============================================================================
function CLIENT(D) {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’‘]/g, "'");
  const store = {
    get(k, d) { try { const v = localStorage.getItem('prairie-wiki.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('prairie-wiki.' + k, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ } },
  };
  const PAGES = new Map(D.pages.map((p) => [p.id, p]));
  const CATS = D.cats;
  let reveal = !!store.get('secrets', false);
  const main = $('#main');

  // ---------------------------------------------------------------- icônes (planche) et figurines
  {
    const I = D.icons, st = document.createElement('style');
    let css = `.ic{background-image:url("${I.url}");--cols:${I.cols}}.fg{background-image:url("${D.figures.url}")}`;
    for (let i = 0; i < I.n; i++) css += `.ic-${i}{--x:${i % I.cols};--y:${Math.floor(i / I.cols)}}`;
    st.textContent = css;
    document.head.appendChild(st);
  }
  const figHTML = (r, box, cls = '', maxK = 4) => {
    const [x, y, w, h] = r;
    let k = Math.min(box / w, box / h, maxK);
    if (k >= 1) k = Math.floor(k);
    const FW = D.figures.w, FH = D.figures.h;
    return `<span class="fg ${cls}" style="width:${Math.round(w * k)}px;height:${Math.round(h * k)}px;background-size:${FW * k}px ${FH * k}px;background-position:${-x * k}px ${-y * k}px"></span>`;
  };
  const iconHTML = (i, size) => {
    if (!i) return '';
    if (i.startsWith('ic:')) return `<i class="ic ic-${i.slice(3)}" style="--s:${size}px"></i>`;
    if (i.startsWith('fg:')) return figHTML(i.slice(3).split(',').map(Number), size);
    return `<span class="gi" style="font-size:${Math.round(size * 0.62)}px;width:${size}px;height:${size}px">${esc(i)}</span>`;
  };

  // ---------------------------------------------------------------- secrets
  const setReveal = (v) => {
    reveal = !!v; store.set('secrets', reveal);
    document.body.classList.toggle('reveal', reveal);
    secLabel();
    renderNav();
    route();
  };
  function secLabel() {
    $('#secbtn').setAttribute('aria-pressed', reveal ? 'true' : 'false');
    $('#secbtn').innerHTML = reveal ? '👁 <span class="long">Secrets révélés</span><span class="short">Révélés</span>' : '🔒 <span class="long">Révéler les secrets</span><span class="short">Secrets</span>';
  }
  $('#secbtn').addEventListener('click', () => { if (!reveal && !confirm('Révéler les secrets ? Solutions d’énigmes, lieux cachés, combinaisons d’alchimie, fins… Tout sera visible.')) return; setReveal(!reveal); });
  const visible = (p) => p && (reveal || !p.x);

  // ---------------------------------------------------------------- navigation (catégories)
  function renderNav() {
    $('#nav').innerHTML = `<a class="navmap" href="#/carte">🗺 La carte de la vallée</a>` + CATS.map((c) => {
      const n = c.groups ? c.groups.reduce((a, g) => a + g.ids.filter((id) => visible(PAGES.get(id))).length, 0) : 0;
      if (!n && !c.page && !PAGES.has('cat:' + c.id)) return '';
      if (!reveal && !n && !c.page) return '';
      return `<a href="#/cat/${c.id}" data-cat="${c.id}">${esc(c.t)}${n ? ` <small>${n}</small>` : ''}</a>`;
    }).join('');
  }

  // ---------------------------------------------------------------- vues
  let mode = '';
  const setMode = (m) => { if (mode === m) return; mode = m; document.body.dataset.mode = m; if (m !== 'map') MAP.stop(); };
  const crumbs = (items) => `<nav class="crumbs">${items.map(([t, h]) => (h ? `<a href="${h}">${esc(t)}</a>` : `<span>${esc(t)}</span>`)).join(' › ')}</nav>`;
  const secretNote = '<div class="secret-page"><p>Cette fiche est un <b>secret</b> : un lieu caché, une solution, une chose qu’on découvre en jouant.</p><p><button class="btn" data-reveal>🔒 Révéler les secrets</button></p></div>';
  const card = (p) => `<a class="card${p.x ? ' is-sec' : ''}" href="#/p/${encodeURIComponent(p.id)}">${iconHTML(p.i, 36)}<span class="ct">${esc(p.t)}</span>${p.s ? `<span class="cs">${esc(p.s)}</span>` : ''}</a>`;
  function activeNav(cat) { $$('#nav a').forEach((a) => a.classList.toggle('on', a.dataset.cat === cat || (cat === 'carte' && a.classList.contains('navmap')))); }
  function showHome() {
    setMode('wiki'); activeNav('');
    const total = D.pages.filter(visible).length;
    main.innerHTML = `<article class="pg home">
      <header class="hd"><div><h1>Prairie — le wiki de la vallée</h1><p class="sub">Tout ce que contient la vallée : ses gens, ses bêtes, ses plantes, ses objets, ses langues perdues et ses secrets. ${total} fiches.</p></div></header>
      <p class="lead">Ce compagnon se lit à côté du jeu. Il a été tiré du jeu lui-même, le ${new Date(D.meta.built).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}. Dans le jeu, il n’y a jamais de carte de toute la vallée : ici, si.</p>
      <p><a class="btn big" href="#/carte">🗺 Ouvrir la carte de la vallée</a> ${reveal ? '' : '<button class="btn" data-reveal>🔒 Révéler les secrets</button>'}</p>
      <div class="cats">${CATS.map((c) => { const n = c.groups ? c.groups.reduce((a, g) => a + g.ids.filter((id) => visible(PAGES.get(id))).length, 0) : 0; if (!n && !c.page) return ''; return `<a class="catcard" href="#/cat/${c.id}"><b>${esc(c.t)}</b>${n ? ` <small>${n}</small>` : ''}<span>${esc(c.d || '')}</span></a>`; }).join('')}</div>
      ${D.log && D.log.length ? `<details class="log"><summary>Journal de construction (${D.log.length})</summary><ul>${D.log.map((l) => `<li>${esc(l)}</li>`).join('')}</ul></details>` : ''}
    </article>`;
    window.scrollTo(0, 0);
  }
  function showCat(id) {
    const c = CATS.find((q) => q.id === id);
    const extra = PAGES.get('cat:' + id);
    if (!c && !extra) return showHome();
    setMode('wiki'); activeNav(id);
    let h = crumbs([['Accueil', '#/'], [c ? c.t : extra.t]]) + `<header class="hd"><div><h1>${esc(c ? c.t : extra.t)}</h1>${c && c.d ? `<p class="sub">${esc(c.d)}</p>` : ''}</div></header>`;
    if (c && c.groups) for (const g of c.groups) { const ps = g.ids.map((i) => PAGES.get(i)).filter(visible); if (ps.length) h += `${c.groups.length > 1 ? `<h2>${esc(g.t)} <small>${ps.length}</small></h2>` : ''}<div class="grid">${ps.map(card).join('')}</div>`; }
    if (extra) h += `<div class="catpage">${extra.h}</div>`;
    main.innerHTML = `<article class="pg">${h}</article>`;
    post(main); window.scrollTo(0, 0);
  }
  function showPage(id) {
    const p = PAGES.get(id);
    if (!p) { setMode('wiki'); main.innerHTML = `<article class="pg">${crumbs([['Accueil', '#/']])}<p>Cette fiche n’existe pas : <code>${esc(id)}</code>.</p></article>`; return; }
    setMode('wiki');
    const c = CATS.find((q) => p.c.includes(q.id));
    activeNav(c ? c.id : '');
    main.innerHTML = `<article class="pg${p.x ? ' secret' : ''}">${crumbs([['Accueil', '#/'], ...(c ? [[c.t, '#/cat/' + c.id]] : []), [p.t]])}
      <header class="hd">${p.fig ? `<div class="figbox">${figHTML(p.fig, 150)}</div>` : iconHTML(p.i, 64)}<div><h1>${esc(p.t)}</h1>${p.s ? `<p class="sub">${esc(p.s)}</p>` : ''}${p.x ? '<span class="tag warn">secret</span>' : ''}</div></header>
      ${p.x && !reveal ? secretNote : p.h}</article>`;
    post(main); window.scrollTo(0, 0);
  }
  // après rendu : écritures anciennes, boutons
  function post(root) {
    for (const cv of $$('canvas.glyph', root)) drawGlyph(cv);
  }
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-reveal]'); if (b) { e.preventDefault(); $('#secbtn').click(); } });

  // ---------------------------------------------------------------- écritures des langues perdues (code du jeu)
  let langCanvasFn = null;
  try { langCanvasFn = new Function(D.langCode + '\n;return typeof langCanvas === "function" ? langCanvas : null;')(); } catch (e) { langCanvasFn = null; }
  function drawGlyph(cv) {
    if (!langCanvasFn) { cv.replaceWith(document.createTextNode('')); return; }
    try {
      const src = langCanvasFn(cv.dataset.lang, cv.dataset.text, { size: +cv.dataset.size || 16, bg: 'rgba(0,0,0,0)', ink: '#3b2a1a' });
      cv.width = src.width; cv.height = src.height;
      cv.getContext('2d').drawImage(src, 0, 0);
    } catch (e) { cv.replaceWith(document.createTextNode('')); }
  }

  // ---------------------------------------------------------------- recherche plein texte
  let IDX = null;
  function buildIndex() {
    const tpl = document.createElement('template');
    IDX = D.pages.map((p) => {
      tpl.innerHTML = p.h;
      const full = tpl.content.textContent.replace(/\s+/g, ' ');
      for (const e of tpl.content.querySelectorAll('.sec, .sec-note')) e.remove();
      const pub = tpl.content.textContent.replace(/\s+/g, ' ');
      return { p, title: norm(p.t), sub: norm(p.s), full, pub, nfull: norm(full), npub: norm(pub) };
    });
  }
  const ACC = { a: '[aàâäá]', e: '[eéèêë]', i: '[iîïí]', o: '[oôöó]', u: '[uùûüú]', c: '[cç]', y: '[yÿ]', n: '[nñ]' };
  const termRe = (t) => new RegExp(norm(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/oe/g, '(?:oe|œ)').replace(/ae/g, '(?:ae|æ)').replace(/[aeioucyn]/g, (c) => ACC[c]), 'i');
  function search(q, limit = 300) {
    if (!IDX) buildIndex();
    const terms = norm(q).split(/[\s,;:!?.]+/).filter((t) => t.length > 1 || /\d/.test(t));
    if (!terms.length) return [];
    const out = [];
    for (const e of IDX) {
      if (!visible(e.p)) continue;
      const txt = reveal ? e.nfull : e.npub;
      let score = 0, ok = true;
      for (const t of terms) {
        const inT = e.title.includes(t), inS = e.sub.includes(t), at = txt.indexOf(t);
        if (!inT && !inS && at < 0) { ok = false; break; }
        score += (e.title === t ? 400 : e.title.startsWith(t) ? 200 : inT ? 120 : 0) + (inS ? 30 : 0) + (at >= 0 ? 10 + Math.min(20, txt.split(t).length) : 0);
      }
      if (ok) out.push([score, e]);
    }
    out.sort((a, b) => b[0] - a[0]);
    return out.slice(0, limit).map(([s, e]) => ({ e, terms }));
  }
  function snippet(e, terms) {
    const raw = reveal ? e.full : e.pub, n = reveal ? e.nfull : e.npub;
    let at = -1;
    for (const t of terms) { const k = n.indexOf(t); if (k >= 0 && (at < 0 || k < at)) at = k; }
    if (at < 0) return esc(raw.slice(0, 160)) + (raw.length > 160 ? '…' : '');
    const a = Math.max(0, at - 70), s = raw.slice(a, a + 220);
    let h = '', last = 0;
    try {
      const re = new RegExp(terms.map((t) => termRe(t).source).join('|'), 'gi');
      s.replace(re, (m, off) => { h += esc(s.slice(last, off)) + '<mark>' + esc(m) + '</mark>'; last = off + m.length; return m; });
    } catch (err) { /* motif invalide */ }
    h += esc(s.slice(last));
    return (a ? '…' : '') + h + (a + 220 < raw.length ? '…' : '');
  }
  function showSearch(q) {
    setMode('wiki'); activeNav('');
    const res = search(q);
    main.innerHTML = `<article class="pg">${crumbs([['Accueil', '#/'], ['Recherche']])}<header class="hd"><div><h1>« ${esc(q)} »</h1><p class="sub">${res.length ? res.length + ' fiche' + (res.length > 1 ? 's' : '') : 'Rien trouvé'}${reveal ? '' : ' (hors secrets)'}</p></div></header>
      <ol class="results">${res.map(({ e, terms }) => `<li><a href="#/p/${encodeURIComponent(e.p.id)}">${iconHTML(e.p.i, 24)}<b>${esc(e.p.t)}</b></a> <small>${esc(e.p.s || '')}</small><p>${snippet(e, terms)}</p></li>`).join('')}</ol></article>`;
    $('#q').value = q;
    window.scrollTo(0, 0);
  }
  // suggestions pendant la frappe
  {
    const q = $('#q'), sug = $('#sug');
    let tm = 0, sel = -1;
    const hide = () => { sug.hidden = true; sel = -1; };
    const upd = () => {
      const v = q.value.trim();
      if (v.length < 2) { hide(); return; }
      const r = search(v, 8);
      sug.innerHTML = r.map(({ e }, i) => `<a href="#/p/${encodeURIComponent(e.p.id)}" data-i="${i}">${iconHTML(e.p.i, 20)}<span>${esc(e.p.t)}</span><small>${esc(e.p.s || '')}</small></a>`).join('') + `<a class="all" href="#/cherche/${encodeURIComponent(v)}">Tout chercher : « ${esc(v)} » ↵</a>`;
      sug.hidden = false; sel = -1;
    };
    q.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(upd, 120); });
    q.addEventListener('keydown', (e) => {
      const items = $$('a', sug);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (sug.hidden) upd(); sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % Math.max(1, items.length); items.forEach((a, i) => a.classList.toggle('on', i === sel)); }
      else if (e.key === 'Enter') { e.preventDefault(); const a = items[sel]; location.hash = a ? a.getAttribute('href') : '#/cherche/' + encodeURIComponent(q.value.trim()); hide(); q.blur(); }
      else if (e.key === 'Escape') { hide(); q.blur(); }
    });
    q.addEventListener('blur', () => setTimeout(hide, 180));
    sug.addEventListener('mousedown', (e) => e.preventDefault());
    sug.addEventListener('click', () => { hide(); q.blur(); });
    document.addEventListener('keydown', (e) => { if (e.key === '/' && document.activeElement !== q && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); q.focus(); q.select(); } });
  }

  // ---------------------------------------------------------------- décompression (deflate brut) et lignes filtrées façon PNG
  function b64bytes(s) { const bin = atob(s), n = bin.length, u = new Uint8Array(n); for (let i = 0; i < n; i++) u[i] = bin.charCodeAt(i); return u; }
  const LBASE = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258];
  const LEXT = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
  const DBASE = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577];
  const DEXT = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
  const ORDER = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
  function huff(lengths, off, n) {
    const count = new Uint16Array(16), symbol = new Uint16Array(n), offs = new Uint16Array(16);
    for (let s = 0; s < n; s++) count[lengths[off + s]]++;
    count[0] = 0;
    for (let l = 1; l < 15; l++) offs[l + 1] = offs[l] + count[l];
    for (let s = 0; s < n; s++) if (lengths[off + s]) symbol[offs[lengths[off + s]]++] = s;
    return { count, symbol };
  }
  let FIXED = null;
  function inflateRaw(src, outLen) {
    const out = new Uint8Array(outLen);
    let ip = 0, op = 0, bb = 0, bc = 0;
    const bits = (n) => { while (bc < n) { bb |= (src[ip++] | 0) << bc; bc += 8; } const v = bb & ((1 << n) - 1); bb >>>= n; bc -= n; return v; };
    const decode = (h) => {
      const cnt = h.count, sym = h.symbol;
      let code = 0, first = 0, index = 0;
      for (let len = 1; len < 16; len++) {
        if (bc === 0) { bb = src[ip++] | 0; bc = 8; }
        code |= bb & 1; bb >>>= 1; bc--;
        const c = cnt[len];
        if (code - c < first) return sym[index + (code - first)];
        index += c; first += c; first <<= 1; code <<= 1;
      }
      throw new Error('données compressées illisibles');
    };
    if (!FIXED) { const l = new Uint8Array(288); l.fill(8, 0, 144); l.fill(9, 144, 256); l.fill(7, 256, 280); l.fill(8, 280, 288); const d = new Uint8Array(30).fill(5); FIXED = [huff(l, 0, 288), huff(d, 0, 30)]; }
    let last = 0;
    while (!last) {
      last = bits(1);
      const type = bits(2);
      if (type === 0) {
        bb = 0; bc = 0;
        const len = src[ip] | (src[ip + 1] << 8); ip += 4;
        out.set(src.subarray(ip, ip + len), op); ip += len; op += len;
        continue;
      }
      let lc, dc;
      if (type === 1) [lc, dc] = FIXED;
      else {
        const nlen = bits(5) + 257, ndist = bits(5) + 1, ncode = bits(4) + 4, cl = new Uint8Array(19);
        for (let i = 0; i < ncode; i++) cl[ORDER[i]] = bits(3);
        const cc = huff(cl, 0, 19), L = new Uint8Array(nlen + ndist);
        for (let i = 0; i < nlen + ndist;) {
          const s = decode(cc);
          if (s < 16) L[i++] = s;
          else { let v = 0, rep; if (s === 16) { v = L[i - 1]; rep = 3 + bits(2); } else if (s === 17) rep = 3 + bits(3); else rep = 11 + bits(7); while (rep--) L[i++] = v; }
        }
        lc = huff(L, 0, nlen); dc = huff(L, nlen, ndist);
      }
      for (;;) {
        let s = decode(lc);
        if (s < 256) out[op++] = s;
        else if (s === 256) break;
        else { s -= 257; let len = LBASE[s] + bits(LEXT[s]); const ds = decode(dc); let from = op - (DBASE[ds] + bits(DEXT[ds])); while (len--) out[op++] = out[from++]; }
      }
    }
    return out;
  }
  function unfilter(raw, w, h, ch) {
    const stride = w * ch, out = new Uint8Array(stride * h);
    for (let y = 0; y < h; y++) {
      const f = raw[y * (stride + 1)], ri = y * (stride + 1) + 1, o = y * stride, pr = o - stride;
      for (let x = 0; x < stride; x++) {
        const v = raw[ri + x], a = x >= ch ? out[o + x - ch] : 0, b = y ? out[pr + x] : 0;
        let p = 0;
        if (f === 1) p = a; else if (f === 2) p = b; else if (f === 3) p = (a + b) >> 1;
        else if (f === 4) { const c = y && x >= ch ? out[pr + x - ch] : 0, q = a + b - c, pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c); p = pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
        out[o + x] = (v + p) & 255;
      }
    }
    return out;
  }
  const grid = (g) => ({ w: g.w, h: g.h, d: unfilter(inflateRaw(b64bytes(g.z), (g.w * g.ch + 1) * g.h), g.w, g.h, g.ch) });
  const bytes = (b) => inflateRaw(b64bytes(b.z), b.n);

  // ---------------------------------------------------------------- LA CARTE
  const M = D.map;
  const MAP = {
    ready: false, raf: 0, cv: null, ctx: null, base: null, dpr: 1, cx: M.size / 2, cz: M.size / 2, k: 0.3,
    layers: Object.assign({ relief: 1, eaux: 1, roches: 1, forets: 1, chemins: 1, courbes: 0, milieux: 0, batiments: 1, lieux: 1, habitants: 1, peche: 0, panneaux: 0, details: 1, zones: 0, secrets: 1, souterrains: 1, cachettes: 0, tresors: 1, rares: 0 }, store.get('layers', {})),
    sel: null, hl: null, hover: null, G: null,
    LAYERS: [
      ['Fond', [['relief', 'Relief ombré'], ['eaux', 'Eaux'], ['roches', 'Neige et roches'], ['forets', 'Forêts'], ['courbes', 'Courbes de niveau (10 m)'], ['milieux', 'Milieux (couleurs)']]],
      ['Tracés', [['chemins', 'Chemins'], ['batiments', 'Bâtiments'], ['details', 'Détails (ponts, croix, pierres…)'], ['zones', 'Zones où l’on ne bâtit pas'], ['peche', 'Zones de pêche'], ['panneaux', 'Panneaux et poteaux']]],
      ['Noms', [['lieux', 'Lieux-dits'], ['habitants', 'Maisons des habitants']]],
      ['Secrets', [['secrets', 'Lieux secrets'], ['souterrains', 'Souterrains'], ['tresors', 'Trésors et grottes'], ['cachettes', 'Cachettes, coffres, notes…'], ['rares', 'Plantes rares']], true],
    ],
    // ------------------------------------------------------------ données
    init() {
      if (this.G) return;
      const t0 = performance.now();
      const G = {};
      for (const k of Object.keys(M.grids)) G[k] = grid(M.grids[k]);
      if (M.blocks && M.blocks.n) G.blocks = new Int16Array(bytes(M.blocks.data).buffer);
      if (M.species) G.species = new Uint16Array(bytes(M.species.data).buffer);
      this.G = G;
      // courbe altitude (valeur quantifiée -> mètres)
      const kn = M.knots, lut = new Float32Array(256);
      for (let q = 0; q < 256; q++) { let a = kn[kn.length - 1][0]; for (let i = 1; i < kn.length; i++) if (q <= kn[i][1]) { const [a0, q0] = kn[i - 1], [a1, q1] = kn[i]; a = a0 + (q - q0) / ((q1 - q0) || 1) * (a1 - a0); break; } lut[q] = a; }
      this.altLUT = lut;
      this.homes = M.homes;
      this.sigKeys = new Set(Object.keys(M.sigils || {}));
      this.decodeMs = Math.round(performance.now() - t0);
    },
    altAt(x, z) { const g = this.G.alt, R = g.w, i = Math.max(0, Math.min(R - 1, Math.floor(x / M.size * R))), j = Math.max(0, Math.min(R - 1, Math.floor(z / M.size * R))); return this.altLUT[g.d[j * R + i]]; },
    milAt(x, z) { const g = this.G.milieu, R = g.w, i = Math.max(0, Math.min(R - 1, Math.floor(x / M.size * R))), j = Math.max(0, Math.min(R - 1, Math.floor(z / M.size * R))); const v = g.d[j * R + i]; return v === 0 ? null : v === 255 ? null : M.milieux[v - 1] || null; },
    // ------------------------------------------------------------ le fond (image de 2 m par pixel)
    compose() {
      const t0 = performance.now(), G = this.G, Lr = this.layers;
      const R = G.ground.w, R4 = G.shade.w, S4 = R4 / R, gd = G.ground.d, sh = G.shade.d, al = G.alt.d, fo = G.forest.d, mi = G.milieu.d, RM = G.milieu.w;
      const cv = this.base || (this.base = document.createElement('canvas'));
      cv.width = R; cv.height = R;
      const ctx = cv.getContext('2d'), img = ctx.createImageData(R, R), P = img.data;
      const MC = { grass: [182, 192, 136], lush: [160, 180, 122], flowers: [188, 194, 140], dry: [204, 196, 150], dirt: [194, 160, 114], sand: [224, 208, 166], rock: [170, 162, 150], cobble: [180, 164, 144], snow: [250, 250, 248], ice: [214, 230, 238], cliff: [152, 144, 134] };
      const mats = M.mats.map(([id, avg]) => MC[id] || (avg ? avg.map((v) => Math.min(255, v * 0.6 + 90)) : [190, 190, 160]));
      const kind = M.mats.map(([id]) => id);
      const MILC = { pres: [206, 214, 150], foret: [120, 158, 104], bouleaux: [170, 196, 136], marais: [140, 170, 150], lande: [206, 182, 138], berges: [150, 196, 182], riviere: [132, 178, 200], alpage: [216, 222, 168], neiges: [246, 246, 244], sapiniere: [98, 136, 104], combe: [150, 166, 136], rochers: [178, 170, 156], ville: [206, 170, 140], ferme: [220, 200, 144], souterrain: [140, 122, 106] };
      const milC = M.milieux.map(([k], i) => MILC[k] || [150 + (i * 53) % 90, 150 + (i * 97) % 90, 120 + (i * 31) % 90]);
      const flat = M.shadeFlat / 255, lut = this.altLUT, WATER = [150, 186, 198], DEEP = [98, 138, 162], FOREST = [92, 128, 84], MOUNT = [206, 198, 184];
      const hl = this.hl && this.hl.mil ? this.hl.mil : null;
      const hlIdx = hl ? M.milieux.findIndex(([k]) => k === hl) + 1 : -1;
      const bil = (d, fx, fz) => { const x0 = fx | 0, z0 = fz | 0, x1 = Math.min(R4 - 1, x0 + 1), z1 = Math.min(R4 - 1, z0 + 1), tx = fx - x0, tz = fz - z0; return (d[z0 * R4 + x0] * (1 - tx) + d[z0 * R4 + x1] * tx) * (1 - tz) + (d[z1 * R4 + x0] * (1 - tx) + d[z1 * R4 + x1] * tx) * tz; };
      const altRow = new Float32Array(R + 1), altPrev = new Float32Array(R + 1);
      for (let j = 0; j < R; j++) {
        const fz = Math.max(0, Math.min(R4 - 1.001, j * S4 - 0.25));
        for (let i = 0; i < R; i++) { const fx = Math.max(0, Math.min(R4 - 1.001, i * S4 - 0.25)); const q = bil(al, fx, fz), q0 = q | 0; altRow[i] = lut[q0] + (lut[Math.min(255, q0 + 1)] - lut[q0]) * (q - q0); }
        for (let i = 0; i < R; i++) {
          const o = (j * R + i) * 4, g = gd[j * R + i], m = g & 63, water = g & 64;
          const fx = Math.max(0, Math.min(R4 - 1.001, i * S4 - 0.25));
          const a = altRow[i];
          let r, gg, b;
          if (water && Lr.eaux) { const d = Math.max(0, Math.min(1, -a / 7)); r = WATER[0] + (DEEP[0] - WATER[0]) * d; gg = WATER[1] + (DEEP[1] - WATER[1]) * d; b = WATER[2] + (DEEP[2] - WATER[2]) * d; }
          else {
            const kk = kind[m];
            let c = mats[m] || mats[0];
            if (Lr.milieux) { const v = mi[Math.min(RM - 1, j >> 2) * RM + Math.min(RM - 1, i >> 2)]; c = v && v !== 255 ? milC[v - 1] : [214, 206, 180]; if (hlIdx > 0 && v !== hlIdx) c = [c[0] * 0.5 + 118, c[1] * 0.5 + 114, c[2] * 0.5 + 104]; }
            else {
              if (!Lr.roches && (kk === 'snow' || kk === 'ice' || kk === 'rock' || kk === 'cliff')) c = mats[0];
              if (!Lr.chemins && (kk === 'dirt' || kk === 'cobble')) c = mats[0];
              if (water) c = [206, 200, 176];
            }
            r = c[0]; gg = c[1]; b = c[2];
            if (!Lr.milieux && a > 32 && kk !== 'snow' && kk !== 'ice') { const t = Math.min(0.62, (a - 32) / 70); r += (MOUNT[0] - r) * t; gg += (MOUNT[1] - gg) * t; b += (MOUNT[2] - b) * t; }
            if (Lr.forets) {
              const f = bil(fo, fx, fz) / 255;
              if (f > 0.06) { const t = Math.min(0.72, f * 1.1); r += (FOREST[0] - r) * t; gg += (FOREST[1] - gg) * t; b += (FOREST[2] - b) * t; const hsh = ((i * 73856093) ^ (j * 19349663)) >>> 0; if ((hsh % 1000) / 1000 < f * 0.22) { r *= 0.78; gg *= 0.8; b *= 0.76; } }
            }
          }
          if (Lr.relief) { const s = bil(sh, fx, fz) / 255 / flat, mul = Math.max(0.42, Math.min(1.2, 0.6 + 0.4 * s)); r *= mul; gg *= mul; b *= mul; }
          if (Lr.courbes && j > 0 && i > 0) { const c0 = Math.floor(a / 10), c1 = Math.floor(altRow[i - 1] / 10), c2 = Math.floor(altPrev[i] / 10); if (c0 !== c1 || c0 !== c2) { const major = (c0 !== c1 ? Math.max(c0, c1) : Math.max(c0, c2)) % 5 === 0; const k = major ? 0.7 : 0.86; r *= k; gg *= k * 0.98; b *= k * 0.95; } }
          const n = ((((i * 2654435761) ^ (j * 40503)) >>> 0) % 9) - 4;
          P[o] = r + n; P[o + 1] = gg + n; P[o + 2] = b + n * 0.8; P[o + 3] = 255;
        }
        altPrev.set(altRow);
      }
      ctx.putImageData(img, 0, 0);
      this.composeMs = Math.round(performance.now() - t0);
    },
    // ------------------------------------------------------------ vue
    start(arg) {
      const wrap = $('#mapwrap');
      if (!this.cv) this.build(wrap);
      if (!this.G) { $('#maploading').hidden = false; setTimeout(() => { try { this.init(); this.compose(); } catch (e) { $('#maploading').textContent = 'La carte n’a pas pu être dessinée : ' + e.message; return; } $('#maploading').hidden = true; this.ready = true; this.resize(); this.go(arg); }, 30); return; }
      this.ready = true; this.resize(); this.go(arg);
    },
    stop() { cancelAnimationFrame(this.raf); this.raf = 0; },
    build(wrap) {
      this.cv = $('#map'); this.ctx = this.cv.getContext('2d');
      this.panel();
      window.addEventListener('resize', () => { if (mode === 'map') this.resize(); });
      // glisser, molette, pincer
      const pts = new Map(); let drag = null, moved = 0, pinch = null;
      const cv = this.cv;
      cv.addEventListener('pointerdown', (e) => { cv.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); moved = 0; if (pts.size === 1) drag = [e.clientX, e.clientY, this.cx, this.cz]; if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), k: this.k, mx: (a[0] + b[0]) / 2, my: (a[1] + b[1]) / 2 }; drag = null; } });
      cv.addEventListener('pointermove', (e) => {
        if (!pts.has(e.pointerId)) { this.hoverAt(e.clientX, e.clientY); return; }
        pts.set(e.pointerId, [e.clientX, e.clientY]);
        if (pinch && pts.size >= 2) { const [a, b] = [...pts.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]); this.zoomAt(pinch.mx, pinch.my, pinch.k * d / Math.max(10, pinch.d), true); moved = 99; return; }
        if (drag) { const dx = e.clientX - drag[0], dy = e.clientY - drag[1]; moved = Math.max(moved, Math.abs(dx) + Math.abs(dy)); this.cx = drag[2] - dx / this.k; this.cz = drag[3] - dy / this.k; this.clampView(); this.req(); }
      });
      const up = (e) => { if (!pts.has(e.pointerId)) return; pts.delete(e.pointerId); if (pts.size < 2) pinch = null; if (pts.size === 0) { if (drag && moved < 6) this.click(e.clientX, e.clientY); drag = null; } else if (pts.size === 1) { const [p] = [...pts.values()]; drag = [p[0], p[1], this.cx, this.cz]; } };
      cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
      cv.addEventListener('wheel', (e) => { e.preventDefault(); const f = Math.exp(-Math.sign(e.deltaY) * Math.min(1, Math.abs(e.deltaY) / (e.deltaMode ? 3 : 100)) * 0.35); this.zoomAt(e.clientX, e.clientY, this.k * f); }, { passive: false });
      cv.addEventListener('dblclick', (e) => this.zoomAt(e.clientX, e.clientY, this.k * 2));
      $('#zin').onclick = () => { const r = cv.getBoundingClientRect(); this.zoomAt(r.left + r.width / 2, r.top + r.height / 2, this.k * 1.6); };
      $('#zout').onclick = () => { const r = cv.getBoundingClientRect(); this.zoomAt(r.left + r.width / 2, r.top + r.height / 2, this.k / 1.6); };
      $('#zall').onclick = () => { this.fit(M.size / 2, M.size / 2, M.size / 2); this.hl = null; this.sel = null; this.info(null); this.req(); };
      $('#layerbtn').onclick = () => $('#layers').classList.toggle('open');
      // recherche sur la carte
      const mq = $('#mq'), ms = $('#msug');
      const feats = () => {
        const f = [];
        for (const L of M.lm) if (reveal || !L[5]) f.push({ t: L[1], s: L[5] & 2 ? 'souterrain' : L[5] & 1 ? 'lieu secret' : 'lieu-dit', go: () => this.go('li:' + L[0]) });
        for (const B of M.bld) if (!f.some((q) => norm(q.t) === norm(B[1])) && (reveal || !B[4])) f.push({ t: B[1], s: 'bâtiment', go: () => this.go('li:' + B[0]) });
        for (const [b, a] of Object.entries(M.homes)) for (const [id, nm, home, role] of a) if (home && (reveal || !(PAGES.get('pnj:' + id) || {}).x)) f.push({ t: nm, s: role + ' — sa maison', go: () => this.go('li:' + b) });
        for (const [id, nm] of Object.entries(M.spNames)) { const pg = PAGES.get('pl:' + id); if (pg && visible(pg)) f.push({ t: nm, s: 'où elle pousse', go: () => this.go('pl:' + id) }); }
        for (const [k, a] of Object.entries(M.spawns)) { const pg = PAGES.get('an:' + k); if (pg && visible(pg)) f.push({ t: pg.t, s: 'où la trouver', go: () => this.go('an:' + k) }); }
        return f;
      };
      let list = [];
      mq.addEventListener('input', () => {
        const v = norm(mq.value.trim());
        if (v.length < 2) { ms.hidden = true; return; }
        list = feats().filter((f) => norm(f.t).includes(v)).sort((a, b) => norm(a.t).indexOf(v) - norm(b.t).indexOf(v) || a.t.length - b.t.length).slice(0, 12);
        ms.innerHTML = list.map((f, i) => `<a href="#" data-i="${i}"><span>${esc(f.t)}</span><small>${esc(f.s)}</small></a>`).join('') || '<p>Rien.</p>';
        ms.hidden = false;
      });
      ms.addEventListener('mousedown', (e) => e.preventDefault());
      ms.addEventListener('click', (e) => { const a = e.target.closest('a'); if (!a) return; e.preventDefault(); const f = list[+a.dataset.i]; ms.hidden = true; mq.blur(); if (f) f.go(); });
      mq.addEventListener('keydown', (e) => { if (e.key === 'Enter' && list[0]) { ms.hidden = true; mq.blur(); list[0].go(); } if (e.key === 'Escape') { ms.hidden = true; mq.blur(); } });
      mq.addEventListener('blur', () => setTimeout(() => { ms.hidden = true; }, 150));
    },
    panel() {
      const el = $('#layers');
      el.innerHTML = '<button class="x" aria-label="Fermer">×</button>' + this.LAYERS.map(([t, a, sec]) => `<fieldset class="${sec ? 'secl' : ''}"${sec && !reveal ? ' hidden' : ''}><legend>${esc(t)}</legend>${a.map(([k, n]) => `<label><input type="checkbox" data-l="${k}" ${this.layers[k] ? 'checked' : ''}> ${esc(n)}</label>`).join('')}</fieldset>`).join('') + '<div id="legend"></div>';
      el.querySelector('.x').onclick = () => el.classList.remove('open');
      if (this.panelBound) { this.legend(); return; }
      this.panelBound = true;
      el.addEventListener('change', (e) => {
        const k = e.target.dataset.l; if (!k) return;
        this.layers[k] = e.target.checked ? 1 : 0; store.set('layers', this.layers);
        if (['relief', 'eaux', 'roches', 'forets', 'courbes', 'milieux', 'chemins'].includes(k)) { if (k !== 'milieux' || !e.target.checked) { if (this.hl && this.hl.mil) this.hl = null; } this.compose(); }
        this.legend(); this.req();
      });
      this.legend();
    },
    legend() {
      const el = $('#legend'); if (!el) return;
      el.innerHTML = this.layers.milieux ? `<b>Milieux</b>${M.milieux.map(([k, n]) => `<a href="#/p/${encodeURIComponent('mil:' + k)}" class="lg"><i style="background:${this.milColor(k)}"></i>${esc(n)}</a>`).join('')}` : '';
    },
    milColor(k) { const c = { pres: '#ced696', foret: '#789e68', bouleaux: '#aac488', marais: '#8caa96', lande: '#ceb68a', berges: '#96c4b6', riviere: '#84b2c8', alpage: '#d8dea8', neiges: '#f6f6f4', sapiniere: '#628868', combe: '#96a688', rochers: '#b2aa9c', ville: '#ceaa8c', ferme: '#dcc890', souterrain: '#8c7a6a' }; return c[k] || '#aaa'; },
    resize() {
      const r = this.cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      this.dpr = dpr; this.cv.width = Math.max(1, Math.round(r.width * dpr)); this.cv.height = Math.max(1, Math.round(r.height * dpr));
      this.W = r.width; this.H = r.height;
      if (!this.fitted) { this.fitted = true; this.fit(M.size / 2, M.size * 0.52, M.size * 0.46); }
      this.req();
    },
    fit(x, z, r) { this.cx = x; this.cz = z; this.k = Math.max(0.05, Math.min(12, Math.min(this.W, this.H) / (2 * Math.max(10, r)))); this.clampView(); this.req(); },
    clampView() { const m = M.size; this.cx = Math.max(-m * 0.1, Math.min(m * 1.1, this.cx)); this.cz = Math.max(-m * 0.1, Math.min(m * 1.1, this.cz)); this.k = Math.max(Math.min(this.W, this.H) / (m * 1.4), Math.min(16, this.k)); },
    zoomAt(sx, sy, k) {
      const r = this.cv.getBoundingClientRect(), px = sx - r.left, py = sy - r.top;
      const wx = this.cx + (px - this.W / 2) / this.k, wz = this.cz + (py - this.H / 2) / this.k;
      this.k = k; this.clampView();
      this.cx = wx - (px - this.W / 2) / this.k; this.cz = wz - (py - this.H / 2) / this.k; this.clampView(); this.req();
    },
    toWorld(sx, sy) { const r = this.cv.getBoundingClientRect(); return [this.cx + (sx - r.left - this.W / 2) / this.k, this.cz + (sy - r.top - this.H / 2) / this.k]; },
    toScreen(x, z) { return [(x - this.cx) * this.k + this.W / 2, (z - this.cz) * this.k + this.H / 2]; },
    req() { if (!this.raf && this.ready && mode === 'map') this.raf = requestAnimationFrame(() => { this.raf = 0; this.draw(); }); },
    // aller vers une cible (lien #/carte/…)
    go(arg) {
      this.hl = null; this.sel = null;
      if (!arg) { this.info(null); this.req(); return; }
      const [kind, ...rest] = arg.split(':'); const v = rest.join(':');
      if (kind === 'li') {
        const L = M.lm.find((q) => q[0] === v), B = M.bld.find((q) => q[0] === v);
        const X = L ? { x: L[2], z: L[3], r: L[4] } : B ? { x: B[2], z: B[3], r: 10 } : null;
        if (X) { this.sel = { kind: 'li', key: v, x: X.x, z: X.z, r: X.r }; this.fit(X.x, X.z, Math.max(60, X.r * 2.2)); this.info(this.sel); if (L && reveal && (L[5] & 1)) this.layers.secrets = 1; if (L && reveal && (L[5] & 2)) this.layers.souterrains = 1; }
      } else if (kind === 'pl' || kind === 'an') {
        const ids = kind === 'pl' ? [v] : M.spawns[v] || [];
        const pts = [];
        for (const id of ids) { const e = M.species && M.species.idx[id]; if (!e) continue; for (let i = 0; i < e[1]; i++) pts.push([this.G.species[(e[0] + i) * 2], this.G.species[(e[0] + i) * 2 + 1]]); }
        this.hl = { kind, id: v, pts };
        if (pts.length) { let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (const [x, z] of pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); } this.fit((x0 + x1) / 2, (z0 + z1) / 2, Math.max(120, Math.max(x1 - x0, z1 - z0) / 2 * 1.15)); }
        const pg = PAGES.get((kind === 'pl' ? 'pl:' : 'an:') + v);
        this.info({ kind: 'sp', title: pg ? pg.t : v, n: pts.length, total: kind === 'pl' ? (M.species.idx[v] || [])[2] : ids.reduce((a, id) => a + ((M.species.idx[id] || [])[2] || 0), 0), page: pg ? pg.id : null });
      } else if (kind === 'mil') {
        this.layers.milieux = 1; this.hl = { mil: v }; this.compose(); this.panel();
        const pg = PAGES.get('mil:' + v); this.info({ kind: 'mil', key: v, title: pg ? pg.t : v, page: pg ? pg.id : null });
      } else if (kind === 'eau') {
        this.layers.peche = 1; this.hl = { eau: v }; this.panel();
        const zs = M.fish.filter((f) => f[3] === v); if (zs.length) { const x = zs.reduce((a, f) => a + f[0], 0) / zs.length, z = zs.reduce((a, f) => a + f[1], 0) / zs.length; const r = Math.max(...zs.map((f) => Math.hypot(f[0] - x, f[1] - z) + f[2])); this.fit(x, z, Math.max(80, r)); }
        this.info({ kind: 'eau', key: v, zones: zs.length });
      } else if (kind === 'xy') {
        const [x, z] = v.split(',').map(Number); this.sel = { kind: 'xy', x, z, r: 4 }; this.fit(x, z, 90); this.info({ kind: 'pt', x, z });
      } else if (kind === 'reg') {
        const R = M.regions.find((q) => q[0] === v); if (R) { this.hl = { reg: R }; this.fit(R[2], R[3], R[4] * 1.1); this.info({ kind: 'reg', R }); }
      } else if (kind === 'couche') {
        if (v === 'peche') this.layers.peche = 1; else if (v === 'sigles') this.layers.cachettes = 1; else if (v in this.layers) this.layers[v] = 1;
        this.panel(); this.info(null);
      }
      this.req();
    },
    // ------------------------------------------------------------ dessin
    draw() {
      const c = this.ctx, dpr = this.dpr, W = this.W, H = this.H, k = this.k, L = this.layers;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.fillStyle = '#d9cba6'; c.fillRect(0, 0, W, H);
      const T = (x, z) => [(x - this.cx) * k + W / 2, (z - this.cz) * k + H / 2];
      // fond
      c.setTransform(dpr * k, 0, 0, dpr * k, dpr * (W / 2 - this.cx * k), dpr * (H / 2 - this.cz * k));
      c.imageSmoothingEnabled = k < 3;
      c.drawImage(this.base, 0, 0, M.size, M.size);
      const px = 1 / k; // un pixel écran en mètres
      const vx0 = this.cx - W / 2 / k, vx1 = this.cx + W / 2 / k, vz0 = this.cz - H / 2 / k, vz1 = this.cz + H / 2 / k;
      const inV = (x, z, m = 0) => x > vx0 - m && x < vx1 + m && z > vz0 - m && z < vz1 + m;
      // douves, bassins
      if (L.eaux) {
        c.fillStyle = 'rgba(120,160,180,.85)';
        for (const p of M.pools) { if (p[5] === 'souterrain' || p[5] === 'temple') { if (!(reveal && L.souterrains)) continue; } c.save(); c.translate(p[0], p[1]); c.rotate(-p[4]); c.fillStyle = p[7] ? 'rgba(160,200,196,.9)' : 'rgba(110,150,176,.85)'; c.fillRect(-p[2] / 2, -p[3] / 2, p[2], p[3]); c.restore(); }
      }
      // zones de pêche
      if (L.peche) {
        c.lineWidth = 1.5 * px; c.setLineDash([4 * px, 3 * px]);
        for (const f of M.fish) { const on = !this.hl || !this.hl.eau || this.hl.eau === f[3]; c.strokeStyle = on ? 'rgba(30,80,130,.85)' : 'rgba(30,80,130,.25)'; c.beginPath(); c.arc(f[0], f[1], f[2], 0, Math.PI * 2); c.stroke(); if (on && this.hl && this.hl.eau) { c.fillStyle = 'rgba(60,120,190,.18)'; c.fill(); } }
        c.setLineDash([]);
      }
      // zones où l'on ne bâtit pas
      if (L.zones) { c.lineWidth = 1.5 * px; c.strokeStyle = 'rgba(150,40,30,.6)'; c.fillStyle = 'rgba(150,40,30,.07)'; c.setLineDash([6 * px, 4 * px]); for (const z of M.noBuild) { c.beginPath(); c.arc(z[0], z[1], z[2], 0, Math.PI * 2); c.fill(); c.stroke(); } c.setLineDash([]); }
      // chemins (graphe des habitants)
      if (L.chemins && M.nav) {
        const N = M.nav.nodes;
        c.strokeStyle = 'rgba(110,70,36,.62)'; c.lineWidth = Math.max(1.1 * px, 1.6); c.setLineDash([5 * px, 3 * px]); c.lineCap = 'round';
        c.beginPath();
        for (const [a, b] of M.nav.edges) { const A = N[a], B = N[b]; if (!A || !B || A[2] || B[2]) continue; if (!inV(A[0], A[1], 200) && !inV(B[0], B[1], 200)) continue; if (/:(in|mid)$/.test(A[3]) || /:(in|mid)$/.test(B[3])) continue; c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); }
        c.stroke(); c.setLineDash([]);
      }
      // crevasses
      if (L.roches) { c.strokeStyle = 'rgba(60,70,90,.8)'; c.lineWidth = 1.6 * px; for (const s of M.crevasses) { if (!Array.isArray(s) || s.length < 2) continue; c.beginPath(); c.moveTo(s[0][0], s[0][1]); for (let i = 1; i < s.length; i++) c.lineTo(s[i][0], s[i][1]); c.stroke(); } }
      // bâtiments (blocs vus de dessus)
      const B = this.G.blocks;
      if (L.batiments && B && k > 0.45) {
        const pal = M.blocks.pal.map((a) => `rgb(${Math.round(a[0] * 0.8)},${Math.round(a[1] * 0.78)},${Math.round(a[2] * 0.76)})`);
        c.lineWidth = 0.6 * px; c.strokeStyle = 'rgba(40,28,18,.55)';
        for (let i = 0; i < M.blocks.n; i++) {
          const o = i * 8, x = B[o] / 10, z = B[o + 1] / 10, sx = B[o + 2] / 10, sz = B[o + 3] / 10, r = B[o + 4] / 1000, under = B[o + 7];
          if (under && !(reveal && L.souterrains)) continue;
          if (!inV(x, z, Math.max(sx, sz))) continue;
          if (sx * k < 0.8 && sz * k < 0.8) continue;
          c.save(); c.translate(x, z); c.rotate(-r); c.fillStyle = under ? 'rgba(90,70,110,.45)' : pal[B[o + 6]] || '#8a7a6a'; c.fillRect(-sx / 2, -sz / 2, sx, sz); if (sx * k > 3) c.strokeRect(-sx / 2, -sz / 2, sx, sz); c.restore();
        }
      }
      // ponts-levis
      c.fillStyle = 'rgba(110,80,50,.9)';
      for (const b of M.bridges) { c.save(); c.translate(b[1], b[2]); c.rotate(-b[5]); c.fillRect(-b[3] / 2, -b[4] / 2, b[3], b[4]); c.restore(); }
      // région d'une carte
      if (this.hl && this.hl.reg) { const R = this.hl.reg; c.lineWidth = 3 * px; c.strokeStyle = 'rgba(120,40,20,.75)'; c.setLineDash([10 * px, 6 * px]); c.beginPath(); c.arc(R[2], R[3], R[4], 0, Math.PI * 2); c.stroke(); c.setLineDash([]); }
      // ------------------------------------------------------------ repères (en coordonnées écran)
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      const marks = []; this.marks = marks;
      const dot = (x, z, rr, fill, stroke) => { const [sx, sy] = T(x, z); c.beginPath(); c.arc(sx, sy, rr, 0, Math.PI * 2); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1.2; c.stroke(); } return [sx, sy]; };
      // espèces mises en avant
      if (this.hl && this.hl.pts) { c.fillStyle = this.hl.kind === 'an' ? 'rgba(150,40,20,.9)' : 'rgba(120,30,110,.85)'; for (const [x, z] of this.hl.pts) { if (!inV(x, z, 10)) continue; const [sx, sy] = T(x, z); c.beginPath(); c.arc(sx, sy, Math.max(2.2, Math.min(5, k * 2)), 0, Math.PI * 2); c.fill(); } }
      // plantes rares (secret)
      if (reveal && L.rares && M.rares) { c.fillStyle = 'rgba(150,20,120,.9)'; for (const [x, z] of M.rares) if (inV(x, z)) { const [sx, sy] = T(x, z); c.fillRect(sx - 2, sy - 2, 4, 4); } }
      // détails
      if (L.details && k > 0.9) { c.font = '11px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; for (const p of M.props) { if (!inV(p[1], p[2])) continue; const [sx, sy] = T(p[1], p[2]); c.fillStyle = 'rgba(60,40,24,.85)'; c.fillText(this.sym(p[0]), sx, sy); marks.push({ x: sx, y: sy, r: 6, f: { kind: 'prop', t: M.propLabels[p[0]] || p[0], x: p[1], z: p[2] } }); } }
      // panneaux
      if (L.panneaux) { for (const q of M.poi) { if (q[0] !== 'sign' && q[0] !== 'mapboard') continue; if (!inV(q[2], q[3])) continue; const [sx, sy] = dot(q[2], q[3], 3, '#6a4a2a', '#f2e6c8'); marks.push({ x: sx, y: sy, r: 6, f: { kind: 'poi', t: q[1], x: q[2], z: q[3], p: q } }); } }
      // cachettes (secret)
      if (reveal && L.cachettes) { for (const q of M.poi) { if (!q[4]) continue; if (!inV(q[2], q[3])) continue; const [sx, sy] = dot(q[2], q[3], 3.2, 'rgba(140,30,30,.9)', '#f6e8d0'); marks.push({ x: sx, y: sy, r: 6, f: { kind: 'poi', t: q[1], x: q[2], z: q[3], p: q } }); } }
      // trésors, grottes (secret)
      if (reveal && L.tresors) { for (const s of M.secrets) { const [sx, sy] = dot(s.x, s.z, 5, 'rgba(200,150,20,.95)', '#3a2a10'); marks.push({ x: sx, y: sy, r: 8, f: { kind: 'tresor', t: 'Trésor : ' + s.id, x: s.x, z: s.z, s } }); } for (const s of M.caves) { const [sx, sy] = dot(s.x, s.z, 4.5, 'rgba(60,40,30,.95)', '#f0e0c0'); marks.push({ x: sx, y: sy, r: 8, f: { kind: 'li', key: s.key, x: s.x, z: s.z } }); } }
      // la harde
      if (M.herd && L.lieux && k > 0.18) { const [sx, sy] = T(M.herd[0], M.herd[1]); c.font = 'italic 12px serif'; c.fillStyle = 'rgba(70,50,30,.8)'; c.textAlign = 'center'; c.fillText('~ chevaux sauvages ~', sx, sy); }
      // maisons des habitants
      const labels = [];
      if (L.habitants) for (const [b, a] of Object.entries(M.homes)) {
        const Bd = M.bld.find((q) => q[0] === b); if (!Bd || (Bd[4] && !reveal)) continue;
        if (!inV(Bd[2], Bd[3], 50)) continue;
        const who = a.filter(([id]) => visible(PAGES.get('pnj:' + id)));
        if (!who.length) continue;
        const [sx, sy] = dot(Bd[2], Bd[3], 4, '#8a2a1a', '#fff4dc');
        marks.push({ x: sx, y: sy, r: 8, f: { kind: 'li', key: b, x: Bd[2], z: Bd[3] } });
        if (k > 1.1) labels.push({ x: sx, y: sy + 11, t: who.map((q) => q[1].split(' ')[0]).join(', '), pr: 5, cls: 'npc' });
      }
      // autres bâtiments (de près)
      if (L.batiments && k > 0.9) for (const Bd of M.bld) {
        if (Bd[4] && !(reveal && L.souterrains)) continue;
        if (!inV(Bd[2], Bd[3], 30) || (L.habitants && M.homes[Bd[0]])) continue;
        const [sx, sy] = T(Bd[2], Bd[3]);
        marks.push({ x: sx, y: sy, r: 7, f: { kind: 'li', key: Bd[0], x: Bd[2], z: Bd[3] } });
        if (k > 1.6) labels.push({ x: sx, y: sy, t: Bd[1], pr: 2, cls: 'bld' });
      }
      // lieux-dits
      if (L.lieux || L.secrets || L.souterrains) for (const Lm of M.lm) {
        const sec = Lm[5] & 1, und = Lm[5] & 2;
        if (und ? !(reveal && L.souterrains) : sec ? !(reveal && L.secrets) : !L.lieux) continue;
        const r = Lm[4];
        if (!inV(Lm[2], Lm[3], r + 200)) continue;
        const big = r >= 100, [sx, sy] = T(Lm[2], Lm[3]);
        if (big) { if (k * r > 60 && k < 2.2) labels.push({ x: sx, y: sy, t: Lm[1], pr: 1 + r / 100, cls: 'region' }); marks.push({ x: sx, y: sy, r: 10, f: { kind: 'li', key: Lm[0], x: Lm[2], z: Lm[3] } }); continue; }
        const minK = r >= 30 ? 0.12 : r >= 12 ? 0.3 : 0.55;
        if (k < minK && !(this.sel && this.sel.key === Lm[0])) continue;
        if (und) { c.setLineDash([3, 2]); dot(Lm[2], Lm[3], 5, 'rgba(90,60,120,.35)', 'rgba(70,40,100,.95)'); c.setLineDash([]); }
        else dot(Lm[2], Lm[3], sec ? 4 : r >= 20 ? 4.5 : 3, sec ? 'rgba(170,40,30,.95)' : Lm[6] ? '#2c5a7a' : '#3a2a1a', '#fbf2dc');
        marks.push({ x: sx, y: sy, r: 9, f: { kind: 'li', key: Lm[0], x: Lm[2], z: Lm[3] } });
        labels.push({ x: sx + 7, y: sy, t: Lm[1], pr: 3 + Math.min(3, r / 12), cls: und ? 'under' : sec ? 'secret' : Lm[6] ? 'water' : r >= 25 ? 'town' : 'place', left: true });
      }
      // sélection
      if (this.sel) { const [sx, sy] = T(this.sel.x, this.sel.z); c.strokeStyle = 'rgba(160,30,20,.95)'; c.lineWidth = 2.2; c.beginPath(); c.arc(sx, sy, Math.max(10, (this.sel.r || 6) * k), 0, Math.PI * 2); c.stroke(); }
      // étiquettes (sans chevauchement)
      labels.sort((a, b) => b.pr - a.pr);
      const placed = [];
      for (const l of labels) {
        const f = l.cls === 'region' ? 'italic 600 ' + Math.round(13 + Math.min(8, l.pr * 2)) + 'px Georgia, serif' : l.cls === 'town' ? '600 13px Georgia, serif' : l.cls === 'npc' || l.cls === 'bld' ? '11px Georgia, serif' : 'italic 12px Georgia, serif';
        c.font = f;
        const w = c.measureText(l.t).width, h = 14;
        const x0 = l.left ? l.x : l.x - w / 2, y0 = l.y - h / 2;
        if (placed.some((p) => x0 < p[0] + p[2] && x0 + w > p[0] && y0 < p[1] + p[3] && y0 + h > p[1])) continue;
        placed.push([x0 - 2, y0 - 1, w + 4, h + 2]);
        c.textAlign = 'left'; c.textBaseline = 'middle';
        c.lineWidth = 3; c.strokeStyle = 'rgba(246,238,216,.85)'; c.strokeText(l.t, x0, l.y);
        c.fillStyle = l.cls === 'secret' ? '#8a1e14' : l.cls === 'under' ? '#4a2a6a' : l.cls === 'water' ? '#1e4a6a' : l.cls === 'region' ? 'rgba(60,44,28,.78)' : l.cls === 'npc' ? '#7a2414' : l.cls === 'bld' ? '#4a3826' : '#2a1d12';
        c.fillText(l.t, x0, l.y);
      }
      // échelle
      const target = 120 / k, pw = Math.pow(10, Math.floor(Math.log10(target))), step = [1, 2, 5, 10].map((m) => m * pw).find((s) => s >= target * 0.6) || pw;
      const bw = step * k;
      c.fillStyle = 'rgba(246,238,216,.85)'; c.fillRect(12, H - 34, bw + 16, 24);
      c.fillStyle = '#2a1d12'; c.fillRect(20, H - 18, bw, 3); c.fillRect(20, H - 23, 1.5, 8); c.fillRect(20 + bw - 1.5, H - 23, 1.5, 8);
      c.font = '11px Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText(step >= 1000 ? step / 1000 + ' km' : step + ' m', 20 + bw / 2, H - 22);
      // nord
      c.textAlign = 'center'; c.font = '600 13px Georgia, serif'; c.fillStyle = '#2a1d12'; c.fillText('N', W - 24, 58); c.beginPath(); c.moveTo(W - 24, 62); c.lineTo(W - 29, 76); c.lineTo(W - 24, 72); c.lineTo(W - 19, 76); c.closePath(); c.fill();
    },
    sym(id) { return { poteau_dir: '⇞', panneau_carte: '▦', calvaire: '✝', croix: '✝', pierre_dressee: '▲', dolmen: '⊓', stele: '▮', cairn: '⩓', pont_bois: '═', tombe: '†', moulin_ailes: '✢', ponton: '⊏', barque: '◡', tente: '⛺', feu_camp: '♨', statue: '♜', monument: '♜', ruche: '⬢', four_pain: '⌂', abreuvoir: '▭', lampadaire: '•', puits_deco: '◎', cascade: '≋' }[id] || '·'; },
    // ------------------------------------------------------------ survol, clic, fiche
    hoverAt(sx, sy) {
      if (!this.G) return;
      const [x, z] = this.toWorld(sx, sy);
      const el = $('#mapinfo'); if (!el) return;
      if (x < 0 || z < 0 || x > M.size || z > M.size) { el.textContent = ''; return; }
      const a = this.altAt(x, z), mil = this.milAt(x, z);
      el.textContent = `x ${Math.round(x)} · z ${Math.round(z)} · altitude ${Math.round(a)} m${mil ? ' · ' + mil[1] : ''}`;
      const hit = this.hit(sx, sy);
      this.cv.style.cursor = hit ? 'pointer' : 'grab';
    },
    hit(sx, sy) {
      const r = this.cv.getBoundingClientRect(), x = sx - r.left, y = sy - r.top;
      let best = null, bd = 1e9;
      for (const m of this.marks || []) { const d = Math.hypot(m.x - x, m.y - y); if (d < m.r && d < bd) { bd = d; best = m.f; } }
      return best;
    },
    click(sx, sy) {
      const f = this.hit(sx, sy);
      if (f && f.kind === 'li') { this.sel = { kind: 'li', key: f.key, x: f.x, z: f.z, r: 6 }; this.info(this.sel); this.req(); return; }
      if (f) { this.sel = { kind: 'pt', x: f.x, z: f.z, r: 4 }; this.info(Object.assign({ kind: 'pt' }, f)); this.req(); return; }
      const [x, z] = this.toWorld(sx, sy);
      if (x < 0 || z < 0 || x > M.size || z > M.size) { this.info(null); return; }
      this.sel = { kind: 'pt', x, z, r: 3 }; this.info({ kind: 'pt', x, z }); this.req();
    },
    nearestPlace(x, z) { let best = null, bd = 1e9; for (const L of M.lm) { if ((L[5] && !reveal) || L[4] > 300) continue; const d = Math.hypot(L[2] - x, L[3] - z) - L[4]; if (d < bd) { bd = d; best = L; } } return best && bd < 250 ? [best, Math.max(0, bd)] : null; },
    info(f) {
      const el = $('#mapcard');
      if (!f) { el.hidden = true; return; }
      let h = '';
      const pgLink = (id, t) => { const p = PAGES.get(id); return p && visible(p) ? `<a class="btn" href="#/p/${encodeURIComponent(id)}">${esc(t || 'Ouvrir la fiche')}</a>` : ''; };
      if (f.kind === 'li') {
        const L = M.lm.find((q) => q[0] === f.key), Bd = M.bld.find((q) => q[0] === f.key), p = PAGES.get('li:' + f.key);
        const name = p ? p.t : L ? L[1] : Bd ? Bd[1] : f.key;
        h += `<h3>${esc(name)}</h3><p class="sub">${esc(p ? p.s : '')}</p>`;
        const x = L ? L[2] : Bd[2], z = L ? L[3] : Bd[3];
        const mil = this.milAt(x, z);
        h += `<p>Altitude ${Math.round(this.altAt(x, z))} m${mil ? ` · <a href="#/p/${encodeURIComponent('mil:' + mil[0])}">${esc(mil[1])}</a>` : ''}</p>`;
        const who = (M.homes[f.key] || []).filter(([id]) => visible(PAGES.get('pnj:' + id)));
        if (who.length) h += `<p>${who.map(([id, nm, home, role]) => `<a href="#/p/${encodeURIComponent('pnj:' + id)}">${esc(nm)}</a> <small>${esc(role)}${home ? '' : ' (y travaille)'}</small>`).join('<br>')}</p>`;
        if (L && L[6] && M.fishBy[L[6]]) h += `<p><b>Pêche :</b> ${M.fishBy[L[6]].slice(0, 12).map(([id, n]) => `<a href="#/p/${encodeURIComponent('it:' + id)}">${esc(n)}</a>`).join(', ')}${M.fishBy[L[6]].length > 12 ? '…' : ''}</p>`;
        h += pgLink('li:' + f.key);
      } else if (f.kind === 'sp') {
        h += `<h3>${esc(f.title)}</h3><p>${f.n ? `${f.total} dans la vallée${f.total > f.n ? ` (${f.n} montrés)` : ''}.` : 'Aucune dans la vallée.'}</p>${f.page ? pgLink(f.page) : ''}`;
      } else if (f.kind === 'mil') {
        h += `<h3>${esc(f.title)}</h3><p>Le milieu est mis en avant sur la carte (couche « Milieux »).</p>${f.page ? pgLink(f.page, 'Ses espèces') : ''}`;
      } else if (f.kind === 'eau') {
        const fishes = M.fishBy[f.key] || [];
        h += `<h3>${esc((M.eaux && M.eaux[f.key]) || f.key)}</h3><p>${f.zones} zone${f.zones > 1 ? 's' : ''} de pêche.</p><p>${fishes.map(([id, n]) => `<a href="#/p/${encodeURIComponent('it:' + id)}">${esc(n)}</a>`).join(', ')}</p>`;
      } else if (f.kind === 'reg') {
        h += `<h3>${esc(f.R[1])}</h3><p>La région que montre cette carte (un cercle d’environ ${Math.round(f.R[4] * 2 / 100) / 10} km). La carte achetée, elle, reste approximative.</p>${pgLink('it:carte_' + f.R[0], 'La carte')}`;
      } else {
        const x = f.x, z = f.z, a = this.altAt(x, z), mil = this.milAt(x, z), np = this.nearestPlace(x, z);
        h += `<h3>${esc(f.t || (mil ? mil[1][0].toUpperCase() + mil[1].slice(1) : 'Un point de la vallée'))}</h3>`;
        h += `<p>x ${Math.round(x)} · z ${Math.round(z)} · altitude ${Math.round(a)} m</p>`;
        if (np) h += `<p>${np[1] < 5 ? 'À' : 'Près de'} <a href="#/p/${encodeURIComponent('li:' + np[0][0])}">${esc(np[0][1])}</a>${np[1] >= 5 ? ` <small>(${Math.round(np[1])} m)</small>` : ''}</p>`;
        if (f.p && f.p[5]) { const k2 = f.p[5]; const tgt = PAGES.get('bt:' + k2) || PAGES.get('ins:' + k2); if (tgt && visible(tgt)) h += `<p><a href="#/p/${encodeURIComponent(tgt.id)}">${esc(tgt.t)}</a></p>`; }
        if (mil) {
          const pg = PAGES.get('mil:' + mil[0]);
          if (pg && visible(pg)) {
            const tpl = document.createElement('template'); tpl.innerHTML = pg.h;
            const links = $$('ul.cards a', tpl.content).slice(0, 14).map((a) => a.outerHTML);
            h += `<p><b>Ce qui vit ici (${esc(mil[1])}) :</b> ${links.join(', ')}${links.length >= 14 ? '…' : ''}</p>${pgLink(pg.id, 'Toutes les espèces de ce milieu')}`;
          }
        }
      }
      el.innerHTML = '<button class="x" aria-label="Fermer">×</button>' + h;
      el.querySelector('.x').onclick = () => { el.hidden = true; this.sel = null; this.req(); };
      el.hidden = false;
    },
  };
  function showMap(arg) {
    setMode('map'); activeNav('carte');
    if (MAP.cv) MAP.panel();
    MAP.start(arg);
  }
  setTimeout(() => { try { if (!IDX) buildIndex(); } catch (e) { /* plus tard */ } }, 1500);

  // ---------------------------------------------------------------- routeur
  function route() {
    const h = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
    const i = h.indexOf('/'), kind = i < 0 ? h : h.slice(0, i), arg = i < 0 ? '' : h.slice(i + 1);
    if (kind === 'p') showPage(arg);
    else if (kind === 'cat') showCat(arg);
    else if (kind === 'carte') showMap(arg);
    else if (kind === 'cherche') showSearch(arg);
    else showHome();
  }
  window.addEventListener('hashchange', route);
  secLabel();
  document.body.classList.toggle('reveal', reveal);
  $('#menubtn').addEventListener('click', () => document.body.classList.toggle('navopen'));
  $('#nav').addEventListener('click', (e) => { if (e.target.closest('a')) document.body.classList.remove('navopen'); });
  renderNav();
  route();
  window.PRAIRIE_WIKI = { D, MAP, search, PAGES };
}

// ============================================================================
//  STYLE (parchemin)
// ============================================================================
const CSS = `
:root { --paper: #f1e7cf; --paper2: #e8dcbd; --ink: #2b2016; --ink2: #5a4631; --red: #8a2a1a; --line: rgba(90,60,30,.25); --card: #f7efdb; --blue: #1e4a6a; --hl: #f3d58a; }
* { box-sizing: border-box; }
[hidden] { display: none !important; }
html { scroll-padding-top: 64px; }
body { margin: 0; color: var(--ink); background: var(--paper2); font: 16px/1.55 "Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, "Times New Roman", serif; }
body::before { content: ''; position: fixed; inset: 0; pointer-events: none; z-index: -1; background: radial-gradient(ellipse at 30% 20%, rgba(255,250,235,.7), transparent 60%), radial-gradient(ellipse at 80% 90%, rgba(170,130,70,.18), transparent 55%), var(--paper2); }
a { color: #6a2d12; text-decoration: none; border-bottom: 1px dotted rgba(106,45,18,.45); }
a:hover { color: #a0381a; border-bottom-style: solid; }
a.btn, button.btn { display: inline-flex; align-items: center; gap: .35em; border: 1px solid rgba(90,60,30,.45); background: linear-gradient(#fbf4e2, #eadbb8); color: var(--ink); border-radius: 4px; padding: .28em .75em; font: inherit; font-size: .92em; cursor: pointer; box-shadow: 0 1px 0 rgba(255,255,255,.6) inset, 0 1px 2px rgba(60,40,20,.2); }
a.btn:hover, button.btn:hover { background: linear-gradient(#fff8e8, #f0e2c2); }
a.btn.big { font-size: 1.1em; padding: .5em 1.1em; }
#top { position: sticky; top: 0; z-index: 20; display: flex; align-items: center; gap: 12px; padding: 8px 16px; background: linear-gradient(#3b2a1c, #2c1f14); color: #f3e6c6; box-shadow: 0 2px 8px rgba(0,0,0,.3); }
#top .title { font-variant: small-caps; letter-spacing: .06em; font-size: 1.15em; white-space: nowrap; color: #f6e7c1; border: 0; }
#top .title small { color: #c9b287; font-variant: normal; letter-spacing: 0; font-style: italic; }
#top .sp { flex: 1; }
#top .search { position: relative; flex: 0 1 380px; }
#q { width: 100%; padding: 6px 10px; border-radius: 4px; border: 1px solid #7a6040; background: #f6ecd3; color: var(--ink); font: inherit; font-size: .95em; }
#sug { position: absolute; left: 0; right: 0; top: 100%; margin-top: 4px; background: var(--card); border: 1px solid var(--line); border-radius: 4px; box-shadow: 0 6px 18px rgba(40,25,10,.3); z-index: 30; max-height: 70vh; overflow: auto; }
#sug a { display: flex; align-items: center; gap: 8px; padding: 5px 10px; border: 0; color: var(--ink); }
#sug a small { margin-left: auto; color: var(--ink2); font-style: italic; }
#sug a.on, #sug a:hover { background: var(--hl); }
#sug a.all { font-style: italic; border-top: 1px solid var(--line); }
#secbtn { white-space: nowrap; }
body.reveal #secbtn { background: linear-gradient(#f3d58a, #d9b25c); }
#menubtn { display: none; background: none; border: 1px solid #7a6040; color: #f3e6c6; border-radius: 4px; padding: 4px 9px; font-size: 1.1em; cursor: pointer; }
#wrap { display: flex; min-height: calc(100vh - 52px); }
#nav { flex: 0 0 230px; padding: 16px 10px 40px 16px; position: sticky; top: 52px; align-self: flex-start; max-height: calc(100vh - 52px); overflow: auto; }
#nav a { display: flex; justify-content: space-between; padding: 4px 10px; border: 0; border-radius: 3px; color: var(--ink); }
#nav a small { color: var(--ink2); font-size: .8em; }
#nav a.on, #nav a:hover { background: rgba(160,110,50,.15); }
#nav a.navmap { font-weight: 600; margin-bottom: 8px; border: 1px solid var(--line); background: rgba(255,250,235,.5); }
#main { flex: 1; min-width: 0; padding: 18px 28px 60px; }
.pg { max-width: 980px; background: var(--paper); border: 1px solid var(--line); box-shadow: 0 1px 0 #fff8 inset, 0 3px 14px rgba(70,45,20,.14); padding: 22px 34px 34px; border-radius: 3px; position: relative; }
.pg::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse at 50% 0%, transparent 60%, rgba(150,110,60,.07)); }
.crumbs { font-size: .85em; color: var(--ink2); margin-bottom: 8px; }
.crumbs a { border: 0; }
.hd { display: flex; gap: 18px; align-items: center; border-bottom: 1px solid var(--line); padding-bottom: 12px; margin-bottom: 14px; }
.hd h1 { margin: 0; font-size: 1.85em; line-height: 1.15; font-weight: 600; letter-spacing: .01em; }
.hd .sub { margin: 3px 0 0; color: var(--ink2); font-style: italic; }
.figbox { flex: 0 0 auto; display: flex; align-items: flex-end; justify-content: center; min-width: 90px; padding: 6px 10px; background: radial-gradient(ellipse at 50% 85%, rgba(120,90,50,.2), transparent 60%); }
h2 { font-size: 1.3em; margin: 1.4em 0 .5em; font-variant: small-caps; letter-spacing: .04em; border-bottom: 1px solid var(--line); }
h2 small { font-variant: normal; color: var(--ink2); font-size: .7em; }
h3 { font-size: 1.12em; margin: 1.3em 0 .45em; color: #4a3220; font-variant: small-caps; letter-spacing: .04em; }
h4 { font-size: 1em; margin: 1em 0 .3em; }
p.lead { font-size: 1.08em; font-style: italic; color: #3e2d1e; }
p.note { color: var(--ink2); font-size: .92em; font-style: italic; }
dl.kv { display: grid; grid-template-columns: max-content 1fr; gap: 3px 16px; margin: .6em 0; }
dl.kv.wide { grid-template-columns: 150px 1fr; }
dl.kv dt { color: var(--ink2); font-variant: small-caps; letter-spacing: .03em; }
dl.kv dd { margin: 0; }
table.t { border-collapse: collapse; margin: .5em 0 1em; font-size: .94em; width: 100%; }
table.t th, table.t td { border-bottom: 1px solid var(--line); padding: 4px 8px; text-align: left; vertical-align: top; }
table.t th { font-variant: small-caps; color: var(--ink2); font-weight: 600; }
table.t tr.same td { color: var(--ink2); }
table.t td.c { text-align: center; color: #7a3a1a; letter-spacing: -.1em; }
table.t th.vt { writing-mode: vertical-rl; transform: rotate(180deg); font-size: .8em; padding: 6px 2px; }
table.shop { width: auto; min-width: 50%; }
blockquote { margin: .6em 0 .8em; padding: .35em 1em; border-left: 3px solid rgba(138,42,26,.45); background: rgba(255,250,235,.5); font-style: italic; }
ul.qs { padding-left: 1.2em; } ul.qs li { margin: .25em 0; font-style: italic; }
ul.qs li::marker { content: '« '; color: var(--red); }
ul.cards { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 6px 14px; }
ul.cols { columns: 2 220px; }
.inl { margin: .3em 0; }
details { margin: .5em 0; border: 1px solid var(--line); border-radius: 3px; padding: 4px 12px; background: rgba(255,250,235,.35); }
details > summary { cursor: pointer; font-variant: small-caps; letter-spacing: .03em; color: #4a3220; }
details[open] > summary { margin-bottom: 6px; }
.sub { margin: .3em 0 .6em 1em; }
.tag { display: inline-block; font-size: .78em; padding: 0 .5em; border-radius: 9px; border: 1px solid var(--line); background: rgba(255,250,235,.7); color: var(--ink2); font-style: normal; white-space: nowrap; border-bottom-style: solid; }
.tag .dot { display: inline-block; width: .7em; height: .7em; border-radius: 50%; background: var(--c); margin-right: .3em; vertical-align: -1px; border: 1px solid rgba(0,0,0,.2); }
.tag.r0 { color: #4a5a2a; } .tag.r1 { color: #2a5a6a; } .tag.r2 { color: #6a3a8a; background: #efe3f0; } .tag.r3 { color: #8a2a1a; background: #f6dcd2; } .tag.r4 { color: #fff; background: #8a5a10; border-color: #6a4008; }
.tag.warn, b.warn { color: #9a1e10; }
.tag.ess { color: #5a2a6a; }
.tag.hab { color: #3a5a2a; }
.ph { border-bottom: 1px dashed rgba(90,60,30,.5); color: #5a3a20; cursor: help; }
code { font-family: Consolas, "Courier New", monospace; font-size: .86em; background: rgba(120,90,50,.1); padding: 0 .3em; border-radius: 3px; }
.ic { display: inline-block; width: var(--s, 16px); height: var(--s, 16px); background-size: calc(var(--cols) * var(--s, 16px)) auto; background-position: calc(var(--x) * -1 * var(--s, 16px)) calc(var(--y) * -1 * var(--s, 16px)); image-rendering: pixelated; vertical-align: -3px; margin-right: 3px; flex: 0 0 auto; }
.fg { display: inline-block; image-rendering: pixelated; background-repeat: no-repeat; flex: 0 0 auto; }
.gi { display: inline-flex; align-items: center; justify-content: center; flex: 0 0 auto; color: #6a3a1a; font-family: "Segoe UI Symbol", "Noto Sans Symbols", "DejaVu Sans", serif; }
a.il { white-space: nowrap; }
.grp { border-bottom: 1px dashed rgba(90,60,30,.5); cursor: help; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 8px; margin: .5em 0 1.2em; }
a.card { display: grid; grid-template-columns: 40px 1fr; grid-template-rows: auto auto; column-gap: 8px; align-items: center; padding: 6px 8px; border: 1px solid var(--line); border-radius: 4px; background: var(--card); color: var(--ink); min-height: 50px; }
a.card:hover { background: #fff7e2; border-color: rgba(138,42,26,.4); }
a.card > .ic, a.card > .fg, a.card > .gi { grid-row: 1 / 3; justify-self: center; }
a.card .ct { font-weight: 600; line-height: 1.2; }
a.card .cs { font-size: .8em; color: var(--ink2); font-style: italic; line-height: 1.2; }
a.card.is-sec { border-style: dashed; border-color: rgba(138,42,26,.5); }
.cats { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 10px; margin-top: 1em; }
a.catcard { display: block; padding: 10px 14px; border: 1px solid var(--line); border-radius: 4px; background: var(--card); color: var(--ink); }
a.catcard b { font-variant: small-caps; font-size: 1.1em; letter-spacing: .03em; }
a.catcard small { color: var(--ink2); }
a.catcard span { display: block; font-size: .88em; color: var(--ink2); font-style: italic; }
a.catcard:hover { background: #fff7e2; }
.quest { border-top: 1px dotted var(--line); padding-top: 4px; }
.quest h4 small { font-weight: normal; color: var(--ink2); font-style: italic; }
p.small { font-size: .92em; }
.sched .sch { display: inline-block; margin: 0 10px 2px 0; }
.sched .sch b, table.week .sch b { font-variant-numeric: tabular-nums; color: #6a3a1a; font-weight: 600; }
table.week .sch { display: inline-block; margin-right: 10px; }
.book { border: 1px solid var(--line); background: #fbf5e4; padding: 6px 18px; border-radius: 2px; box-shadow: 2px 2px 0 rgba(90,60,30,.12); }
section.bookpage { margin: .4em 0 1em; }
section.bookpage h4 { font-variant: small-caps; letter-spacing: .04em; margin-bottom: .2em; }
.inscr { background: #d8ccb0; border: 1px solid rgba(60,40,20,.35); border-radius: 3px; display: inline-block; padding: 8px 12px; margin: 4px 0 10px; box-shadow: inset 0 0 12px rgba(60,40,20,.25); }
canvas.glyph { vertical-align: middle; image-rendering: auto; }
.gloss { display: inline-flex; flex-direction: column; align-items: center; margin: 0 6px 6px 0; padding: 2px 6px; border: 1px solid var(--line); border-radius: 3px; background: rgba(255,250,235,.6); }
.gloss small { color: var(--ink2); font-style: italic; }
table.lex td { vertical-align: middle; }
mark { background: var(--hl); color: inherit; padding: 0 1px; }
ol.results { padding-left: 1.4em; }
ol.results li { margin: .5em 0 .9em; }
ol.results li p { margin: .2em 0 0; font-size: .92em; color: #3e2d1e; }
ol.results a { display: inline-flex; align-items: center; gap: 6px; }
.sec { display: none; }
body.reveal .sec { display: revert; }
body.reveal span.sec { display: inline; }
body.reveal .sec-note { display: none; }
.sec-note { color: #8a4a2a; font-style: italic; font-size: .88em; }
p.sec-note { border: 1px dashed rgba(138,42,26,.35); padding: 4px 10px; border-radius: 3px; background: rgba(255,240,225,.5); }
span.sec-note { margin-left: .3em; }
body:not(.reveal) a.lsec { color: inherit; border: 0; pointer-events: none; }
.secret-page { border: 1px dashed rgba(138,42,26,.5); padding: 12px 18px; background: rgba(255,240,225,.5); }
details.log { margin-top: 2em; font-size: .85em; }
.tt { margin-bottom: .2em; }
.tr-item { border-top: 1px dotted var(--line); padding-top: .3em; }
/* ------------------------------------------------ la carte */
body[data-mode="map"] { height: 100vh; height: 100dvh; display: flex; flex-direction: column; overflow: hidden; }
body[data-mode="map"] #wrap { flex: 1 1 auto; min-height: 0; }
#mapwrap { display: none; position: relative; flex: 1; min-width: 0; }
body[data-mode="map"] #mapwrap { display: block; }
.short { display: none; }
body[data-mode="map"] #main, body[data-mode="map"] #nav { display: none; }
#map { width: 100%; height: 100%; display: block; touch-action: none; cursor: grab; background: #d9cba6; }
#maptools { position: absolute; top: 12px; left: 12px; display: flex; gap: 6px; align-items: flex-start; z-index: 5; flex-wrap: wrap; max-width: calc(100% - 24px); }
#maptools .mq { position: relative; }
#mq { width: 250px; max-width: 60vw; padding: 6px 10px; border: 1px solid rgba(90,60,30,.5); border-radius: 4px; background: #f8f0dc; font: inherit; font-size: .95em; }
#msug { position: absolute; top: 100%; left: 0; width: 320px; max-width: 80vw; margin-top: 3px; background: var(--card); border: 1px solid var(--line); border-radius: 4px; box-shadow: 0 6px 18px rgba(40,25,10,.3); max-height: 60vh; overflow: auto; }
#msug a { display: flex; gap: 8px; justify-content: space-between; padding: 5px 10px; border: 0; color: var(--ink); }
#msug a small { color: var(--ink2); font-style: italic; }
#msug a:hover { background: var(--hl); }
#msug p { margin: 6px 10px; }
#maptools button { min-width: 34px; justify-content: center; }
#layers { position: absolute; top: 56px; left: 12px; z-index: 6; background: var(--card); border: 1px solid rgba(90,60,30,.4); border-radius: 4px; padding: 8px 12px 10px; box-shadow: 0 4px 14px rgba(40,25,10,.25); display: none; max-height: calc(100% - 80px); overflow: auto; font-size: .92em; width: 280px; max-width: calc(100% - 24px); }
#layers.open { display: block; }
#layers fieldset { border: 0; border-top: 1px solid var(--line); margin: 6px 0 0; padding: 4px 0 0; }
#layers legend { font-variant: small-caps; color: var(--ink2); padding: 0 4px 0 0; }
#layers fieldset.secl legend { color: var(--red); }
#layers label { display: block; cursor: pointer; padding: 1px 0; }
#layers .x, #mapcard .x { float: right; border: 0; background: none; font-size: 1.3em; line-height: 1; cursor: pointer; color: var(--ink2); }
#legend b { display: block; margin-top: 8px; font-variant: small-caps; color: var(--ink2); }
#legend a.lg { display: flex; align-items: center; gap: 6px; border: 0; color: var(--ink); font-size: .92em; }
#legend a.lg i { width: 14px; height: 10px; border: 1px solid rgba(0,0,0,.25); display: inline-block; }
#mapcard { position: absolute; left: 12px; bottom: 44px; z-index: 5; width: 340px; max-width: calc(100% - 24px); max-height: 55%; overflow: auto; background: var(--card); border: 1px solid rgba(90,60,30,.45); border-radius: 4px; padding: 8px 14px 12px; box-shadow: 0 4px 14px rgba(40,25,10,.3); }
#mapcard h3 { margin: 4px 0 0; }
#mapcard p { margin: .35em 0; font-size: .93em; }
#mapcard .sub { margin: 0 0 .3em; color: var(--ink2); font-style: italic; }
#mapinfo { position: absolute; right: 12px; bottom: 10px; z-index: 4; background: rgba(246,238,216,.88); border: 1px solid var(--line); border-radius: 3px; padding: 2px 8px; font-size: .82em; color: var(--ink2); pointer-events: none; }
#maploading { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-style: italic; font-size: 1.1em; color: var(--ink2); background: rgba(217,203,166,.85); z-index: 8; }
@media (max-width: 820px) {
  #top { gap: 8px; padding: 8px 12px; flex-wrap: wrap; }
  #top .title small { display: none; }
  #top .search { order: 5; flex: 1 1 100%; }
  #menubtn { display: inline-block; }
  #secbtn { font-size: .82em; padding: .25em .5em; }
  #nav { position: fixed; top: 0; left: 0; bottom: 0; z-index: 40; background: var(--paper); box-shadow: 4px 0 18px rgba(0,0,0,.35); transform: translateX(-105%); transition: transform .2s; max-height: none; width: 250px; padding-top: 18px; }
  body.navopen #nav { transform: none; }
  body[data-mode="map"].navopen #nav { display: block; }
  #main { padding: 10px 8px 40px; }
  .pg { padding: 14px 14px 24px; }
  .hd { flex-wrap: wrap; gap: 10px; }
  .hd h1 { font-size: 1.45em; }
  dl.kv, dl.kv.wide { grid-template-columns: 1fr; gap: 0 0; }
  dl.kv dd { margin-bottom: 6px; }
  table.t { display: block; overflow-x: auto; }
  #mapcard { bottom: 36px; max-height: 45%; }
  .long { display: none; } .short { display: inline; }
  #maptools #zin, #maptools #zout { display: none; }
}
@media print { #top, #nav { display: none; } .sec { display: revert; } }
`;

// ============================================================================
//  ASSEMBLAGE DU FICHIER HTML
// ============================================================================
function writeHTML(DB) {
  say('fiches du wiki…');
  const wiki = buildWiki(DB);
  const map = buildMapData(DB, wiki);
  // plantes rares (rareté ≥ 2) : positions pour la couche secrète
  {
    const T = (n, d) => (DB.tables[n] ? DB.tables[n].v : d);
    const EP = T('ESPECES_PLANTES', []), W = DB.world;
    const rareIds = EP.filter((e) => (e[2] || 0) >= 2).map((e) => e[0]);
    if (W.species && W.species.idx) {
      const raw = zlib.inflateRawSync(Buffer.from(W.species.data.z, 'base64'));
      const all = new Uint16Array(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength));
      const pts = [];
      for (const id of rareIds) { const e = W.species.idx[id]; if (!e) continue; for (let i = 0; i < e[1]; i++) pts.push([all[(e[0] + i) * 2], all[(e[0] + i) * 2 + 1]]); }
      map.rares = pts;
    }
  }
  const D = {
    meta: DB.meta, log: DB.log, cats: wiki.cats,
    pages: wiki.pages.map((p) => { const o = { id: p.id, t: p.t, s: p.s, c: p.c, i: p.i, h: p.h }; if (p.x) o.x = 1; if (p.fig) o.fig = p.fig; return o; }),
    icons: { url: DB.images.icons.url, cols: DB.images.icons.cols, n: DB.images.icons.n },
    figures: { url: DB.images.figures.url, w: DB.images.figures.w, h: DB.images.figures.h },
    langCode: DB.derived.langCode || '', map,
  };
  const json = JSON.stringify(D).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Prairie — le wiki de la vallée</title>
<meta name="description" content="Compagnon hors jeu de Prairie : carte interactive de la vallée et fiches de tout ce qu'elle contient.">
<style>${CSS}</style>
</head>
<body data-mode="wiki">
<header id="top">
  <button id="menubtn" aria-label="Sections">☰</button>
  <a class="title" href="#/">Prairie <small>— le wiki de la vallée</small></a>
  <div class="search"><input id="q" type="search" placeholder="Chercher (touche /) : un nom, un mot, une réplique…" autocomplete="off" aria-label="Chercher"><div id="sug" hidden></div></div>
  <span class="sp"></span>
  <a class="btn" href="#/carte">🗺 Carte</a>
  <button id="secbtn" class="btn" aria-pressed="false">🔒 Révéler les secrets</button>
</header>
<div id="wrap">
  <nav id="nav" aria-label="Sections"></nav>
  <main id="main"></main>
  <div id="mapwrap">
    <canvas id="map" aria-label="Carte de la vallée"></canvas>
    <div id="maptools"><div class="mq"><input id="mq" type="search" placeholder="Chercher sur la carte…" autocomplete="off"><div id="msug" hidden></div></div><button class="btn" id="layerbtn" title="Couches">☰ Couches</button><button class="btn" id="zin" title="Zoomer">+</button><button class="btn" id="zout" title="Dézoomer">−</button><button class="btn" id="zall" title="Toute la vallée">⤢</button></div>
    <div id="layers"></div>
    <div id="mapcard" hidden></div>
    <div id="mapinfo"></div>
    <div id="maploading" hidden>La vallée se dessine…</div>
  </div>
</div>
<noscript><p style="padding:2em">Ce wiki a besoin de JavaScript.</p></noscript>
<script id="wiki-data" type="application/json">${json}</script>
<script>
(${CLIENT.toString()})(JSON.parse(document.getElementById('wiki-data').textContent));
</script>
</body>
</html>
`;
  if (/<\/script/i.test(json) || /<\/script/i.test(CLIENT.toString())) throw new Error('les données contiennent « </script » : le fichier serait cassé');
  fs.writeFileSync(OUT, html);
  const kb = (s) => Math.round(Buffer.byteLength(s) / 1024);
  say(`écrit ${path.relative(process.cwd(), OUT) || OUT} : ${kb(html)} Ko (fiches ${kb(JSON.stringify(D.pages))} Ko, carte ${kb(JSON.stringify(map))} Ko, icônes ${kb(D.icons.url)} Ko, figurines ${kb(D.figures.url)} Ko) — ${D.pages.length} fiches, ${wiki.cats.length} sections, ${wiki.other.length} « autres tables »`);
  return { D, wiki };
}

async function main() {
  const from = ARG('from', null), dump = ARG('dump', null);
  let DB;
  if (from) { DB = JSON.parse(fs.readFileSync(from, 'utf8')); say('données relues : ' + from); }
  else DB = await extract();
  if (dump) { fs.writeFileSync(dump, JSON.stringify(DB)); say('données gardées : ' + dump); }
  writeHTML(DB);
  if (DB.log.length) say(`${DB.log.length} avertissement(s) :\n  - ` + DB.log.slice(0, 40).join('\n  - '));
  say('terminé');
}

module.exports = { encodePNG, pngURL, packGrid, packBytes, FakeCanvas, loadGame, URL_TO_CANVAS, jclone, extract, buildWiki, writeHTML, CLIENT };
if (require.main === module) main().then(() => process.exit(0), (e) => { console.error(e && e.stack || e); process.exit(1); });
