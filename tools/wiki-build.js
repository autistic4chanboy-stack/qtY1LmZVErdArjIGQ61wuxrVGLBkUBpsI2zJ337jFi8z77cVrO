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
//
//  Les systèmes nouveaux (modules 11-zzz*, 12-zzz* : corps et esprit, ce qu'on
//  mange, le chien, l'alcool, la fabrication, la chasse, la société, les lieux,
//  les routines, les événements, les Trois, les malédictions, les autres
//  mondes, les merveilles…) ont leurs sections (fiches « sys: », « ev: »,
//  « eff: », « monde: »…, section 20). Chaque fiche se compose de l'en-tête du
//  module (le résumé qu'en fait le code, débarrassé du code), de ses tables et
//  du commentaire qui les précède, et de ce que le jeu calcule lui-même dans la
//  machine virtuelle : fréquences du calendrier, blessures des chutes mesurées,
//  seuils lus dans le code, routines des douze jours, catalogue de la
//  bibliothèque. Un module nouveau sans fiche dédiée (la prison, le vol à la
//  tire, les sentiments…) en reçoit une d'office, avec ses tables ; les objets
//  et les bêtes des nouveautés ont leur fiche ordinaire, reliée à ces sections.
//  La vie de la vallée (dormir, louer, acheter et meubler, la terre, crocheter,
//  les portes, fouiller, casser, les morts, les activités) est mesurée dans le
//  jeu lui-même (vieProbe : heures d'ouverture quart d'heure par quart
//  d'heure, limites du jour, gains et effets d'un geste, lettres du bail, lits,
//  portes et objets d'une partie neuve) ; la fiche « L'équilibrage » reprend la
//  section du README et les chiffres que portent les tables.
//  Les figurines utilisent les personnages « façon 1996 » (boîtes effilées).
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
const TECH_TABLES = /^(GLSL_|SH$|TEX_|MAX_|CHUNK$|RING$|PC\d*$|NOC$|TL$|WHITE$|M34_ID$|FX_EMIT$|BAYER4$|TAU$|DEG$|TS$|PX_PER_M$|EMISSIVE_A$|SPR_L$|TINT_A$|VM(_W|_H)?$|SKIN|ATLAS$|ICON3D$|PE$|HOOKS$|BUFF$|ROUTINES$|LANG_GLYPHS$|SKY_KEYS$|INT_UNIFORMS$|DEFAULT_SETTINGS$|BIOME_FOG$|MAZE$|UNDER_SLOTS$|TOWN_PROP_R$|PROP_COLL$|PROP_LIGHTS$|APAL$|PAL$|FLORA_PAL$|BARK_PAL$|SPECIES$|VILLAGER_LOOKS$|SLEEVE$|CROP_TPL$|SIGIL_GLYPHS$|SIGIL_COL$|WEATHER_PRESETS$|WEATHER_ICONS$|HAND_ICON$|OBJ_INDEX$|NPC_BY_ID$|INSCR_BY_ID$|MATERIALS$|TERRAIN_MATS$|BLOCK_MATS$|M_[A-Z0-9_]+$|F_[A-Z0-9_]+$|GRID_CELL$|WORLD_FORMAT$|FARM_KEY$|HISTORY_KEY$|ANIMAL_RIGS$|PROP_MODELS$|CROP_MODELS$|PROP_USE(_MORE)?$|ENVERS_SPRITES$|STRANGE_MORE$|BUILDS$|TOOL_DMG$|HORSE_FOOD$|OFFER_VALUE$|MASS$|VALLEY_N$|GEN_VERSION$|VALLEY_GEN$|DESIGN_OFF$|VER_ALL$|VER_ENVERS$|TERRA_STEP$|JOUR_SECONDES$|P_RADIUS$|BAR_DEFAULT$|ALCH_OK$|DYN_PROPS$|FLAMMABLE$|STRIKE_TREES$|TREE_IDS$|SHAPES$|BLOCK_PRESETS$|GRASS_VARIANTS$|SEED_ROTATE$|CROP_FOOD$|OLD_VARS$|TIER_COL$|NAME_[AB]$|WHEN_H$|FIRST_NAMES$|HAND_GROUPS$|BAR_TOKENS$|INT_|SHOP_DOORS$|NPC_NEW$|TR_FORMES$|TF$|MONDES_(SPR|PAL|RIGS|IDX|FOND)$|PCF$|BB$|TNM$|CM$|ENF$|MSON$|IA_MONDE$|EV_FX$|LEG_VM_ALIAS$|I18N_)/;

// ---------------------------------------------------------------- les modules des nouveautés (systèmes : corps, esprit, chasse, société…)
// Ce qu'on garde d'un module : son en-tête (le résumé du système), ses tables et le commentaire qui les
// précède, ses constantes simples, ses objets (« const chasse = { … } »), ses sections, les commentaires des
// méthodes, les objets qu'il crée (defItem) et les répliques de cinématiques (« texte: … »).
const SYS_FILE = /^(11-zzz|12-zzz|07-zzzzz)/;
function parseModule(text) {
  const L = text.split('\n');
  const out = { head: [], tables: {}, scal: {}, objs: [], items: [], secs: [], blocks: [], mdocs: {}, mtexts: {} };
  let i = 0;
  // en-tête : le premier bloc de commentaires (entre les lignes de « ==== »)
  while (i < L.length && /^\s*\/\//.test(L[i])) {
    const s = L[i].replace(/^\s*\/\/ ?/, '').replace(/\s+$/, '');
    if (/^={8,}$/.test(s.trim())) { if (out.head.length) break; } else out.head.push(s);
    i++;
  }
  const isSep = (s) => /^[-=]{6,}\s*$/.test(s.trim());
  // le commentaire juste au-dessus d'une ligne (les lignes de tirets portent parfois un titre)
  const docAbove = (j) => {
    const a = [];
    for (let k = j - 1; k >= 0; k--) {
      const m = L[k].match(/^\s*\/\/ ?(.*)$/);
      if (!m) break;
      const t = m[1].trim();
      if (isSep(t)) break;
      if (/^[-=]{6,}/.test(t)) { const tt = t.replace(/^[-=\s]+/, '').trim(); if (tt && !a.length) a.unshift(tt); break; }
      a.unshift(t);
    }
    return a.join(' ').replace(/\s+/g, ' ').trim();
  };
  const inline = (s) => { const m = s.match(/^[^'"`]*?[;,{\]]\s*\/\/\s*(.+)$/); return m ? m[1].trim() : ''; };
  let method = null;
  for (let j = 0; j < L.length; j++) {
    const s = L[j];
    let m = s.match(/^(?:const|let|var)\s+([A-Z][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (m) {
      const doc = [docAbove(j), inline(s)].filter(Boolean).join(' — ');
      if (!out.tables[m[1]]) out.tables[m[1]] = { line: j + 1, doc };
      const v = m[2].match(/^(-?\d[\d_.]*|'[^']*'|true|false)\s*;/);
      if (v) out.scal[m[1]] = { v: v[1].startsWith("'") ? v[1].slice(1, -1) : v[1] === 'true' ? true : v[1] === 'false' ? false : +v[1].replace(/_/g, ''), doc };
    }
    m = s.match(/^const ([a-z][A-Za-z0-9_$]*)\s*=\s*\{/);
    if (m && !out.objs.includes(m[1])) out.objs.push(m[1]);
    for (const d of s.matchAll(/defItem\(\s*'([a-z0-9_]+)'/g)) if (!out.items.includes(d[1])) out.items.push(d[1]);
    m = s.match(/^(\s*)\/\/ -{6,}\s*(\S.*)$/);
    if (m) out.secs.push([m[1].length, m[2].trim(), j + 1]);
    if (/^\s*\/\/ ={8,}/.test(s) && j > i) {
      const b = [];
      for (let k = j + 1; k < L.length && /^\s*\/\//.test(L[k]) && !/^\s*\/\/ ={8,}/.test(L[k]); k++) b.push(L[k].replace(/^\s*\/\/ ?/, '').trim());
      if (b.length) out.blocks.push({ line: j + 1, text: b.join(' ').replace(/\s+/g, ' ') });
    }
    m = s.match(/^( {2,4})([a-zA-Z_$][\w$]*)\s*(?:\(([^)]*)\)\s*\{|:\s*(?:function\b|\([^)]*\)\s*=>|[a-z]\w*\s*=>))/);
    if (m && !/^(if|for|while|switch|return|catch|function)$/.test(m[2])) {
      method = m[2];
      const doc = docAbove(j);
      if (doc && !out.mdocs[method]) out.mdocs[method] = doc;
    }
    if (method) for (const t of s.matchAll(/\btexte:\s*(['`])((?:\\.|(?!\1).)*)\1/g)) (out.mtexts[method] || (out.mtexts[method] = [])).push(t[2].replace(/\$\{\s*([a-zA-Z_]+)[^}]*\}/g, '{$1}'));
  }
  return out;
}
// découpe « a, b(c, d), 'e, f' » en arguments de premier niveau
function splitArgs(s) {
  const out = []; let depth = 0, q = null, cur = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { cur += c; if (c === '\\') { cur += s[++i] || ''; continue; } if (c === q) q = null; continue; }
    if (c === "'" || c === '"' || c === '`') { q = c; cur += c; continue; }
    if (c === '(' || c === '[' || c === '{') depth++;
    if (c === ')' || c === ']' || c === '}') { if (depth === 0) { out.push(cur.trim()); return { args: out, end: i }; } depth--; }
    if (c === ',' && depth === 0) { out.push(cur.trim()); cur = ''; continue; }
    cur += c;
  }
  out.push(cur.trim());
  return { args: out, end: s.length };
}
// les systèmes : tout ce que les sections « nouveautés » lisent (le jeu tourne ; une partie neuve est prête)
function extractSystems(G, DB) {
  const S = DB.derived.sys = { files: {}, objs: {}, figs: {} };
  const safe = (label, fn, d) => { try { return fn(); } catch (e) { DB.log.push('systèmes, ' + label + ' : ' + (e && e.message)); return d; } };
  const J = (expr) => jclone(G.run(expr));
  for (const [file, text] of G.texts) {
    if (!SYS_FILE.test(file)) continue;
    const M = S.files[file] = parseModule(text);
    // les tables des objets du module (propriétés en majuscules : chasse.XXX, fabrication.LECONS…)
    for (const o of M.objs) {
      const props = safe('objet ' + o, () => J(`(() => { const o = ${o}, out = {}; for (const k of Object.keys(o)) if (/^[A-Z][A-Z0-9_]*$/.test(k)) out[k] = o[k]; return out; })()`), {});
      if (props && Object.keys(props).length) S.objs[o] = { file, props };
    }
  }
  // (modules attendus plus tard, s'ils manquent : rien)
  S.present = Object.keys(S.files);
  // les vrais noms des plantes (le jeu ne montre que leur allure tant qu'on ne les a pas fait nommer)
  S.vrai = safe('vrais noms', () => J(`(() => { if (typeof alchimie === 'undefined' || !alchimie.VRAI) return null; const o = {}; for (const id in alchimie.VRAI) o[id] = { name: alchimie.VRAI[id].name, desc: alchimie.VRAI[id].desc, allure: PLANT_LOOK[id] ? PLANT_LOOK[id][0] : '', allureDesc: PLANT_LOOK[id] ? PLANT_LOOK[id][1] : '' }; return o; })()`), null);
  if (S.vrai && DB.tables.ITEMS) for (const [id, v] of Object.entries(S.vrai)) { const it = DB.tables.ITEMS.v[id]; if (it && v.name) { it.name = v.name; if (v.desc) it.desc = v.desc; } }
  // le catalogue de la grande bibliothèque et le prix des emprunts
  S.biblioCat = safe('catalogue', () => J(`(() => typeof biblio === 'undefined' || !biblio.catalogue ? null : biblio.catalogue().map((e) => ({ item: e.item, titre: e.titre, auteur: e.auteur, genre: e.genre, base: e.base, prix: [1, 3, 7].map((j) => [j, biblio.prix(e, j)]) })))()`), null);
  // l'étrange selon l'esprit : la courbe de bizarrerie()
  S.bizarre = safe('bizarrerie', () => J(`(() => { if (typeof esprit === 'undefined') return null; const f = esprit.niveau, out = []; try { for (const v of [100, 85, 70, 55, 40, 25, 10, 0]) { esprit.niveau = () => v; out.push([v, Math.round(bizarrerie() * 100) / 100]); } } finally { esprit.niveau = f; } return out; })()`), null);
  // le calendrier des événements (déterministe) : fréquences sur une longue suite de jours, et l'almanach
  S.calendrier = safe('calendrier', () => J(`(() => {
    if (typeof evenements === 'undefined') return null;
    const N = 1200, out = { jours: N, ev: {}, prodiges: {}, almanach: {} };
    const f = (k, fn) => { let n = 0, first = 0; for (let d = 1; d <= N; d++) { let r = false; try { r = fn(d); } catch (e) { r = false; } if (r !== false && r !== null && r !== undefined) { n++; if (!first) first = d; } } out.ev[k] = { n, first }; };
    f('nuit_noire', (d) => evenements.nuitNoire(d) || false);
    f('neige', (d) => evenements.neige(d) || false);
    f('soleil', (d) => evenements.soleil(d) || false);
    f('tornade', (d) => evenements.tornade(d));
    f('tueur', (d) => evenements.tueur(d) || false);
    for (let d = 1; d <= N; d++) { let p = null; try { p = evenements.prodige(d); } catch (e) { p = null; } if (p && p.id) out.prodiges[p.id] = (out.prodiges[p.id] || 0) + 1; }
    try { const s = farm.s, d0 = s.day; s.day = 1; for (const a of evenements.almanach(N)) if (!out.almanach[a.quoi]) out.almanach[a.quoi] = a.texte; s.day = d0; } catch (e) {}
    try { farm.s.ev = undefined; } catch (e) {}
    return out;
  })()`), null);
  // la lavandière : son sens de torsion change-t-il d'une partie à l'autre ?
  S.lavSens = safe('lavandière', () => G.run(`(() => { if (typeof lavandiere === 'undefined' || !lavandiere.sens) return null; const s0 = farm.s.seed, r = new Set(); for (const sd of [1, 2, 3, 4, 77, 1234]) { farm.s.seed = sd; r.add(lavandiere.sens()); } farm.s.seed = s0; return r.size > 1 ? 'varie' : [...r][0]; })()`), null);
  // les chutes : blessures et risques mesurés (en appelant corps.chute, le hasard contrôlé)
  S.chutes = safe('chutes', () => J(`(() => {
    if (typeof corps === 'undefined' || !corps.chute) return null;
    const g0 = game.player, h0 = play.hurt, c0 = corps.casserJambe, s0 = corps.saigner, r0 = Math.random, b0 = BUFF.on, rows = [];
    try {
      game.player = { riding: false, wading: false, pos: [0, 0, 0], vel: [0, 0, 0] };
      BUFF.on = () => false;
      const essai = (v, R) => { let dmg = 0, casse = false, saigne = 0, cause = ''; Math.random = () => R; play.hurt = (d, src, c) => { dmg += d; cause = c || cause; }; corps.casserJambe = () => { casse = true; }; corps.saigner = (k) => { saigne = k; }; corps.chute(v); return { dmg, casse, saigne, cause }; };
      const proba = (v, key) => { if (!essai(v, 0)[key]) return 0; let a = 0, b = 1; for (let i = 0; i < 14; i++) { const m = (a + b) / 2; if (essai(v, m)[key]) a = m; else b = m; } return Math.round(a * 100) / 100; };
      for (const v of [9, 10.5, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 25, 28]) { const e = essai(v, 0.9999); rows.push({ v, dmg: Math.round(e.dmg * 10) / 10, cause: e.cause || essai(v, 0).cause, casse: proba(v, 'casse'), saigne: proba(v, 'saigne'), debit: essai(v, 0).saigne }); }
    } finally { game.player = g0; play.hurt = h0; corps.casserJambe = c0; corps.saigner = s0; Math.random = r0; BUFF.on = b0; }
    return rows;
  })()`), null);
  // la gravité du personnage (pour traduire une vitesse de chute en hauteur)
  S.gravite = safe('gravité', () => { for (const [, t] of G.texts) { const m = t.match(/vel\[1\] -= (\d+(?:\.\d+)?) \* this\.mods\.grav/); if (m) return +m[1]; } return null; }, null);
  // ce qui fait monter ou baisser l'esprit : tous les appels à esprit.changer(…) du jeu
  S.changes = [];
  for (const [file, text] of G.texts) {
    for (const m of text.matchAll(/\b(esprit|this)\.changer\(/g)) {
      if (m[1] === 'this' && !/esprit/.test(file)) continue;
      const a = splitArgs(text.slice(m.index + m[0].length)).args;
      if (a.length < 2 || a[0] === 'delta') continue;
      const line = text.slice(0, m.index).split('\n').length;
      S.changes.push({ file, line, delta: a[0], raison: a[1], plafond: a[2] || null });
    }
  }
  // les commandes du jeu (menu « Commandes » de src/shell.html)
  S.commandes = safe('commandes', () => {
    const html = fs.readFileSync(path.join(ROOT, 'src', 'shell.html'), 'utf8');
    const m = html.match(/<div id="dlg-help"[\s\S]*?<div class="keys">([\s\S]*?)<\/div>\s*<div class="actions">/);
    if (!m) return null;
    const groups = [];
    for (const part of m[1].split(/<h4>/).slice(1)) {
      const t = part.slice(0, part.indexOf('</h4>')).trim();
      const rows = [...part.matchAll(/<div><span>([\s\S]*?)<\/span><span>([\s\S]*?)<\/span><\/div>/g)].map((r) => [r[1].trim(), r[2].trim()]);
      groups.push({ t, rows });
    }
    return groups;
  }, null);
  // les bêtes des autres mondes : leur module, leur nom (celui qu'on leur donne en jeu, sinon leur clé)
  S.betesMonde = safe('bêtes des autres mondes', () => {
    const BM = G.get('BETES_MONDE') || {}, out = {};
    for (const k of Object.keys(BM)) {
      let file = '', nom = '';
      for (const [f, t] of G.texts) {
        if (!SYS_FILE.test(f)) continue;
        const at = t.search(new RegExp('(^|[\\s{,])' + k + '\\s*[:=]\\s*\\{\\s*rig:|BETES_MONDE\\.' + k + '\\s*=\\s*\\{'));
        if (at < 0) continue;
        file = f;
        const seg = t.slice(at, at + 2500).split(/\n\s{0,2}[a-z_]+:\s*\{\s*rig:|\n\}\);|\n\};/)[0];
        const sp = seg.match(/ui\.subtitle\('([^'(][^']*)'/);
        if (sp) nom = sp[1];
        // une définition à part (« BETES_MONDE.x = { ») : le commentaire de section juste au-dessus la nomme
        const pre = t.slice(0, at).split('\n'), last = (pre[pre.length - 2] || '').match(/^\s*\/\/ -{4,}\s*(\S.*)$/);
        if (!nom && last && /BETES_MONDE\./.test(t.slice(at, at + 40))) nom = last[1].trim();
        break;
      }
      out[k] = { file, nom, d: jclone(BM[k]) };
    }
    return out;
  }, {});
  // les bêtes du monde des bonbons, etc. : les plantes qu'on y cueille (TYPES = [['objet', modèle, hauteur]…])
  S.plantesMonde = {};
  for (const [file, text] of G.texts) {
    if (!/^11-zzz7/.test(file)) continue;
    const ids = [...text.matchAll(/\[\s*'([a-z0-9_]+)'\s*,\s*[A-Z]{2,4}\.[a-zA-Z]+\s*,\s*[\d.]+\s*\]/g)].map((m) => m[1]);
    if (ids.length) S.plantesMonde[file] = uniq(ids);
  }
  // le rythme des nains, et le silence entre les groupes
  for (const [file, text] of G.texts) {
    const m = text.match(/groupes\.join\('-'\) === '([\d-]+)'/);
    if (m) { S.rythme = m[1]; const s = text.match(/F\[i\] - F\[i - 1\] > ([\d.]+)/); S.rythmeSilence = s ? +s[1] : null; S.rythmeFile = file; }
  }
  // quelques seuils lus dans le code (s'ils ont changé de forme, on s'en passe)
  const grab = (file, re) => { const t = (G.texts.find(([f]) => f === file) || [])[1] || ''; const m = t.match(re); return m ? m.slice(1).map(Number) : null; };
  S.seuils = {
    ivresse: grab('11-zzz63-alcool.js', /niv = g >= ([\d.]+) \? 3 : g >= ([\d.]+) \? 2 : g >= ([\d.]+) \? 1/),
    faim: grab('11-zzz60-esprit.js', /f < ([\d.]+) \? 3 : f < ([\d.]+) \? 2 : f < ([\d.]+) \? 1/),
    pensees: grab('11-zzz60-esprit.js', /v < (\d+) \? ESPRIT_PENSEES\.tres_bas : v < (\d+) \? ESPRIT_PENSEES\.bas : v >= (\d+)/),
    voile: grab('11-zzz60-esprit.js', /!on \|\| v >= (\d+) \? 1/),
    jambe: grab('11-zzz00-socle.js', /C\.jambe = Math\.max\(C\.jambe, s\.hours \+ (\d+)\)/),
    attelle: grab('11-zzz00-socle.js', /Math\.min\(C\.jambe, s\.hours \+ (\d+)\)/),
    boite: grab('11-zzz00-socle.js', /attelle \? ([\d.]+) : ([\d.]+)\)/),
    egratignure: grab('11-zzz00-socle.js', /if \(C\.saigne < ([\d.]+)\) C\.saigne = Math\.max\(0, C\.saigne - dt \* ([\d.]+)\)/),
    lecons: grab('11-zzz03-fabrication.js', /const prix = lvl >= (\d+) \? 0 : base/),
    chienMort: grab('11-zzz62-chien.js', /if \(h >= (\d+)\) \{ this\.mourir\('faim'\)/),
    chienStades: grab('11-zzz62-chien.js', /h >= (\d+) \? 3 : h >= (\d+) \? 2 : h >= (\d+) \? 1/),
  };
  // ce que l'esprit laisse voir, et à partir de quand (« // murmures » puis « if (v < 40) »)
  {
    const t = (G.texts.find(([f]) => f === '11-zzz60-esprit.js') || [])[1] || '';
    S.signes = [...t.matchAll(/\/\/ ([^\n]+)\n\s*if \(v < (\d+)\) \{/g)].map((m) => [m[1].trim(), +m[2]]);
  }
  // où joue-t-on une cinématique ?
  S.cineUses = {};
  for (const [file, text] of G.texts) { const n = (text.match(/\bcine\.jouer\(/g) || []).length + (/^11-zzz44/.test(file) ? 0 : (text.match(/\bcinematiques\.[a-zA-Z]+\(/g) || []).length); if (n && SYS_FILE.test(file)) S.cineUses[file] = n; }
  // la valeur des constantes simples des modules (lues telles quelles)
  S.scal = {};
  for (const M of Object.values(S.files)) for (const [k, o] of Object.entries(M.scal)) S.scal[k] = o;
  return S;
}
// les routines de la semaine (après la génération : les lieux doivent exister)
function extractRoutines(G) {
  return G.run(`(() => {
    const out = {}, S = farm.s, d0 = S.day;
    try { if (typeof ROUTINES !== 'undefined' && ROUTINES.clear) ROUTINES.clear(); } catch (e) {}
    try { if (typeof routines !== 'undefined' && routines.cache && routines.cache.clear) routines.cache.clear(); } catch (e) {}
    const nJ = typeof SEMAINE !== 'undefined' ? SEMAINE.length : 12;
    let ok = 0;
    for (const d of NPC_DATA) {
      out[d.id] = [];
      for (let k = 0; k < nJ; k++) {
        S.day = k + 1 + 12 * 7;
        let r = null;
        try { r = typeof routineDuJour === 'function' ? routineDuJour({ id: d.id, d, st: { alive: true, name: d.names && d.names[0] } }) : d.schedule; ok++; } catch (e) { r = d.schedule; }
        out[d.id].push(JSON.parse(JSON.stringify(r || [])));
      }
    }
    S.day = d0;
    return ok ? out : null;
  })()`);
}

// ---------------------------------------------------------------- la vie de la vallée : ce que font les nouveautés, mesuré dans le jeu
// Exécuté DANS la machine virtuelle, la vallée générée (aucune variable de ce fichier n'y est visible) : on appelle les
// fonctions du jeu (qui dort dans quel lit, quelle serrure a quelle porte, ce qui se casse, quand ouvre la tente de la
// diseuse, ce que rapporte un concours…) en remplaçant, le temps d'un appel, ce qui montrerait quelque chose à l'écran.
function vieProbe() {
  const out = { err: [] }, w = game.world, s = farm.s;
  const r1 = (v) => Math.round(v * 10) / 10, r2 = (v) => Math.round(v * 100) / 100;
  const ok = (k, fn) => { try { const v = fn(); if (v !== undefined) out[k] = v; } catch (e) { out.err.push(k + ' : ' + (e && e.message)); } };
  const rnd0 = Math.random, st0 = globalThis.setTimeout, si0 = globalThis.setInterval;
  const seq = (a, rest) => { let i = 0; return () => (i < a.length ? a[i++] : rest === undefined ? 0.5 : rest); };
  // les habitants (chacun à sa place de la journée), le fermier, les objets générés
  ok('init', () => {
    if (!game.player) game.player = { pos: [0, 0, 0], vel: [0, 0, 0], yaw: 0, hp: 100, food: 80, stamina: 1 };
    if (!s.npcs) s.npcs = {};
    if (!s.quests) s.quests = {};
    if (!s.flags) s.flags = {};
    try { npcs.init(w, s); } catch (e) { out.err.push('habitants : ' + (e && e.message)); }
    farm.genProps = w.props.length;
    try { if (typeof butin !== 'undefined' && butin.indexer) butin.indexer(); } catch (e) { out.err.push('butin : ' + (e && e.message)); }
    return npcs.list.length;
  });
  // le jour et la nuit : le soleil du jeu (computeSky), minute par minute
  ok('ciel', () => {
    const up = (h) => computeSky(((h % 24) + 24) % 24 / 24, 200, {}).sunDir[1] > 0;
    let lever = null, coucher = null;
    for (let m = 1; m <= 24 * 60; m++) { const a = up((m - 1) / 60), b = up(m / 60); if (!a && b) lever = m / 60; if (a && !b) coucher = m / 60; }
    return { lever, coucher, jour: typeof JOUR_SECONDES !== 'undefined' ? JOUR_SECONDES : null, dayLength: w.dayLength || null };
  });
  // la pluie : le programme météo du jeu (weather.dayPlan) sur deux mille jours
  ok('pluie', () => {
    if (typeof weather === 'undefined' || !weather.dayPlan) return undefined;
    const N = 2000, o = { jours: N, pluie: 0, orage: 0, gel: 0, canicule: 0, heures: 0 };
    for (let d = 2; d < N + 2; d++) {
      const P = weather.dayPlan(s.seed || 1234, d);
      if (P.rain) o.pluie++; if (P.storm) o.orage++; if (P.frost) o.gel++; if (P.heat) o.canicule++;
      const L = P.plan;
      for (let i = 0; i < L.length; i++) { const a = L[i][0], b = i + 1 < L.length ? L[i + 1][0] : 24; if (L[i][1] === 'rain' || L[i][1] === 'storm') o.heures += Math.max(0, Math.min(24, b) - a); }
    }
    o.heures = r2(o.heures / (N * 24));
    return o;
  });
  // les serrures (CROC_* : une seule déclaration, que la lecture des tables ne voit pas toute) et les outils (TOOL_DMG)
  ok('crocT', () => (typeof CROC_ZONE === 'undefined' ? undefined : { pins: CROC_PINS, zone: CROC_ZONE, vit: CROC_VIT, casse: CROC_CASSE }));
  ok('outils', () => ({ dmg: typeof TOOL_DMG !== 'undefined' ? TOOL_DMG : null, extra: typeof OBJ_DMG !== 'undefined' ? OBJ_DMG : null }));
  // acheter une maison de la commune : le prix, la revente
  ok('achat', () => (typeof meubles === 'undefined' || !meubles.prixAchat ? undefined : Object.keys(LOC_MAISONS).map((k) => [k, meubles.prixAchat(k), meubles.prixRevente ? meubles.prixRevente(k) : null])));
  // la fatigue : les stades selon les heures de veille (et avec la vigueur), et leur force
  ok('fatigue', () => {
    if (typeof sommeil === 'undefined') return undefined;
    const V0 = sommeil.veille, B0 = BUFF.on;
    let V = 0, vig = false;
    sommeil.veille = () => V; BUFF.on = (id) => vig && id === 'vigueur';
    try {
      const seuils = (flag) => { vig = flag; const o = []; let st = -1; for (V = 0; V <= 80; V += 0.25) { const x = sommeil.stade(); if (x !== st) { o.push([x, V]); st = x; } } return o; };
      const a = seuils(false), b = seuils(true);
      vig = false;
      const k = []; for (V = 0; V <= 60; V += 1) k.push([V, r2(sommeil.k())]);
      return { seuils: a, vigueur: b, k };
    } finally { sommeil.veille = V0; BUFF.on = B0; }
  });
  // les lits de la vallée : à qui ils sont (sommeil.infoLit)
  ok('lits', () => (typeof sommeil === 'undefined' ? undefined : w.props.filter((q) => !q.gone && LIT_TAILLE[q.id]).map((q) => {
    let I = null; try { I = sommeil.infoLit(q); } catch (e) { I = null; }
    return [q.id, r1(q.x), r1(q.z), I ? I.cat : '?', (I && I.bld) || null, I && I.n ? I.n.id : null];
  })));
  // les portes : leur allure, leur serrure, leur solidité à la hache, à qui elles sont
  ok('portes', () => w.doors.map((dr, i) => {
    const o = { i, bld: dr.bld || null, x: r1(dr.x), z: r1(dr.z), w: r1(dr.w || 0), h: r1(dr.h || 0) };
    if (dr.poterne) o.poterne = 1;
    if (dr.deco) o.deco = 1;
    try { const S = PORTES.style(dr); o.st = S.st; o.pierre = S.pierre ? 1 : 0; o.double = S.double ? 1 : 0; } catch (e) { /* rien */ }
    try { if (!dr.poterne) o.diff = crochetage.difficulte(dr); } catch (e) { /* rien */ }
    try { o.sol = objets.porteInterdite(dr) ? 0 : objets.porteSolidite(dr); } catch (e) { /* rien */ }
    try { const L = objets.lieuBld(dr.bld); o.lieu = L.t; o.own = L.own ? L.own.id : null; o.crime = objets.typeCrime('porte', L, null); } catch (e) { /* rien */ }
    try { o.nom = crochetage.nomPorte(dr); } catch (e) { /* rien */ }
    return o;
  }));
  // ce qui se casse et se ramasse, objet par objet : protégé ou non (et pourquoi), où, et le crime que ce serait
  ok('objets', () => {
    if (typeof objets === 'undefined') return undefined;
    const agg = {}, add = (o, k) => { o[k] = (o[k] || 0) + 1; };
    for (const q of w.props) {
      if (q.gone || !(OBJ_CASSE[q.id] || OBJ_RAMASSE[q.id])) continue;
      if (w.live && !w.live(q)) continue; // (les objets d'une autre version de la vallée : l'envers…)
      const A = agg[q.id] || (agg[q.id] = { n: 0, casse: 0, ramasse: 0, prot: {}, lieux: {}, crimes: {} });
      A.n++;
      let P = null;
      try { P = objets.profil(q); } catch (e) { P = null; }
      if (!P) { add(A.prot, 'erreur'); continue; }
      if (P.protege === 'erreur') { try { P = objets.calculer(q); } catch (e) { A.err = A.err || String((e && e.message) || e).slice(0, 160); } }
      if (P.protege) { add(A.prot, String(P.protege).split(' :')[0]); continue; }
      if (P.casse) A.casse++;
      try { if (objets.ramassable(q, P)) A.ramasse++; } catch (e) { /* rien */ }
      try {
        const L = objets.lieu(q.x, q.y + 0.3, q.z, OBJ_COMMUNS.has(q.id));
        add(A.lieux, L.t);
        const c = objets.typeCrime(P.casse ? 'casse' : 'ramasse', L, P.casse && P.casse.opt.prof);
        if (c) add(A.crimes, c);
      } catch (e) { /* rien */ }
    }
    return agg;
  });
  // les fouilles : en combien de jours chaque endroit se remplit (fouilles.refill : les maisons des disparus plus lentement)
  ok('refill', () => { const o = {}; for (const it of w.inter) if (it.kind === 'f2') { try { o[it.id] = fouilles.refill(it); } catch (e) { /* rien */ } } return o; });
  // la poterne : ce qu'on en voit des deux côtés, le jour, la nuit, et quand elle se referme
  ok('poterne', () => {
    const P = w.poterne;
    if (!P || typeof poterne === 'undefined') return null;
    const dr = w.doors[P.door], subs = [], sub0 = ui.subtitle, H0 = npcs.hour, pos0 = game.player.pos, vue0 = s.flags.poterneVue;
    let H = 12;
    npcs.hour = () => H; ui.subtitle = (a, t) => subs.push(t); globalThis.setTimeout = (f) => { try { f(); } catch (e) { /* rien */ } return 0; };
    try {
      const at = (p) => { game.player.pos = [p[0], (P.y || 0) + 0.1, p[1]]; };
      const tour = (fn) => { subs.length = 0; fn(); return subs.slice(); };
      delete s.flags.poterneVue;
      const dehors = tour(() => { dr.open = 0; at(P.dehors); poterne.utiliser(dr); });
      const jour = tour(() => { dr.open = 0; at(P.dedans); H = 12; poterne.utiliser(dr); });
      const nuit = tour(() => { dr.open = 0; at(P.dedans); H = 23; poterne.utiliser(dr); });
      const ferme = tour(() => { dr.open = 1; at(P.dehors); poterne.update(); });
      return { x: r1(P.x), z: r1(P.z), dehors, jour, nuit, ferme };
    } finally { npcs.hour = H0; ui.subtitle = sub0; globalThis.setTimeout = st0; game.player.pos = pos0; s.flags.poterneVue = vue0; dr.open = 0; dr.locked = true; }
  });
  // le crochetage : ce que dit la porte selon sa serrure, et sans crochets
  ok('crochet', () => {
    if (typeof crochetage === 'undefined') return undefined;
    const cap = [], c0 = ui.choice, s0 = ui.subtitle, n0 = farm.count;
    ui.choice = (t, d, o) => cap.push([t, d, (o || []).map((x) => x.label)]); ui.subtitle = (a, t) => cap.push(['', t]);
    try {
      const o = { menus: {}, sans: null };
      for (let d = 1; d <= 5; d++) {
        const dr = w.doors.find((q) => !q.poterne && !q.deco && q.bld && crochetage.difficulte(q) === d);
        if (!dr) continue;
        cap.length = 0; farm.count = () => 1;
        crochetage.menuPorte(dr, () => {});
        o.menus[d] = cap[0] || null;
      }
      cap.length = 0; farm.count = () => 0;
      crochetage.jeu = null; crochetage.tenter({ difficulte: 2 });
      o.sans = cap[0] ? cap[0][1] : null;
      return o;
    } finally { ui.choice = c0; ui.subtitle = s0; farm.count = n0; crochetage.jeu = null; }
  });
  // louer : les écriteaux, le mot du maire, et un bail mené jusqu'au bout sans payer (les lettres, jour après jour)
  ok('location', () => {
    if (typeof locations === 'undefined') return undefined;
    const o = { ecriteaux: {}, maire: null, bail: null }, cap = [], mails = [];
    const c0 = ui.choice, m0 = farm.mail, d0 = s.day, money0 = s.money, loc0 = s.location, inv0 = Object.assign({}, s.inv);
    ui.choice = (t, d, opts) => cap.push([t, d, (opts || []).map((x) => x.label)]);
    farm.mail = (from, sujet, texte) => mails.push([s.day, from, sujet, texte]);
    globalThis.setTimeout = () => 0;
    try {
      s.location = undefined;
      for (const k of Object.keys(LOC_MAISONS)) { if (!locations.existe(k)) continue; cap.length = 0; locations.ecriteau(k); o.ecriteaux[k] = cap[0] || null; }
      o.maire = locations.texteMaire();
      const k = Object.keys(LOC_MAISONS).find((q) => locations.existe(q));
      if (k) {
        s.money = 1e6;
        const j0 = s.day;
        locations.louer(k);
        for (let d = j0 + 1; d <= j0 + 40 && locations.bail(k); d++) { s.day = d; locations.jour(); }
        o.bail = { k, lettres: mails.map(([j, f, t, x]) => [j - j0, f, t, x]) };
      }
      return o;
    } finally { ui.choice = c0; farm.mail = m0; globalThis.setTimeout = st0; s.day = d0; s.money = money0; s.location = loc0; s.inv = inv0; try { locations.appliquerPortes(true); } catch (e) { /* rien */ } }
  });
  // les morts qui restent au sol : les stades, ce qu'en pense le fermier, ce qu'on dit en les trouvant, les fosses, les poches
  ok('depouilles', () => {
    if (typeof depouilles === 'undefined') return undefined;
    const D = depouilles, d0 = s.day, o = { stades: {}, pensees: {}, fosses: {}, tombes: {}, reactions: [], poches: {} };
    const say0 = npcs.say, read0 = ui.read, t0 = game.time, pos0 = game.player.pos, lines = [], reads = [];
    npcs.say = (n, t) => lines.push([n && n.id, t]); ui.read = (t, x, sg) => reads.push([t, x, sg]);
    try {
      for (const t of ['npc', 'geant']) { const L = []; for (let dd = 0; dd <= 16; dd++) { s.day = 100; L.push(D.stade({ j: 100 - dd, t })); } o.stades[t] = L; }
      s.day = 100;
      const cas = { homme: { t: 'npc', qui: 'forgeron' }, femme: { t: 'npc', qui: 'boulangere' }, enfant: { t: 'npc', qui: 'fillette' }, chien: { t: 'chien', nom: '{chien}' }, fermier: { t: 'fermier' }, chasseur: { t: 'chasseur' }, geant: { t: 'geant', fem: 0 } };
      for (const [k, rec] of Object.entries(cas)) o.pensees[k] = [0, 1, 2, 3].map((st) => { try { return D.pensee(Object.assign({ id: 'w' + k }, rec), st, k === 'fermier'); } catch (e) { return null; } });
      for (const mode of ['la', 'dehors', 'traine', 'pierres']) o.fosses[mode] = [D.texteFosse({ t: 'npc' }, { mode }, 0, false), D.texteFosse({ t: 'npc' }, { mode }, 0, true)];
      o.fosses.os = [D.texteFosse({ t: 'npc' }, { mode: 'la' }, 3, false), D.texteFosse({ t: 'npc' }, { mode: 'pierres' }, 3, false)];
      o.fosses.chien = [D.texteFosse({ t: 'chien', nom: '{chien}' }, { mode: 'la' }, 0, false), D.texteFosse({ t: 'chien', nom: '{chien}' }, { mode: 'la' }, 3, false)];
      for (const [k, data] of [['fermier', { t: 'fermier', nom: '{prenom}', run: 3 }], ['inconnu', { t: 'npc', j: 40 }], ['habitant', { t: 'npc', nom: '{nom}', j: 40 }]]) { reads.length = 0; try { D.lireTombe({ data }); } catch (e) { /* rien */ } o.tombes[k] = reads[0] || null; }
      // ce qu'ils disent en trouvant un corps
      game.time = 1000;
      const essais = [['cure', { t: 'npc', qui: 'forgeron' }, 0], ['garde', { t: 'npc', qui: 'forgeron' }, 0], ['fillette', { t: 'npc', qui: 'boulangere' }, 0], ['fillette', { t: 'npc', qui: 'forgeron' }, 0], ['fillette', { t: 'npc', qui: 'forgeron' }, 3], ['grainetiere', { t: 'chien', nom: '{chien}' }, 0], ['grainetiere', { t: 'fermier' }, 0], ['grainetiere', { t: 'chasseur' }, 0], ['grainetiere', { t: 'npc', qui: 'forgeron' }, 2], ['grainetiere', { t: 'npc', qui: 'forgeron' }, 3], ['forgeron', { t: 'npc', qui: 'boulangere' }, 0], ['aubergiste', { t: 'npc', qui: 'forgeron' }, 0]];
      for (const [who, rec, st] of essais) {
        const n = npcs.byId[who];
        if (!n) continue;
        D.dit = -99;
        const R = Object.assign({ id: 'r' + o.reactions.length, j: 100 - st, x: n.x + 1, y: n.y || 0, z: n.z }, rec);
        game.player.pos = [n.x, n.y || 0, n.z];
        const k = lines.length;
        Math.random = seq([0.9, 0.1]);
        try { D.reagir(n, R, 1); } catch (e) { /* rien */ } finally { Math.random = rnd0; }
        n._dep = null;
        if (lines.length > k) { let t = lines[lines.length - 1][1]; const m = rec.qui && npcs.byId[rec.qui]; if (m && m.name) t = t.split(m.name).join('{npc:' + rec.qui + '}'); o.reactions.push([who, rec.t, rec.qui || null, st, t]); }
      }
      // les poches : le tirage du jeu, sur quatre cents morts de chaque sorte
      const mesure = (t, qui) => {
        const P = t === 'npc' ? ((typeof VOL_POCHES !== 'undefined' && VOL_POCHES[qui]) || DEP_POCHES[qui] || DEP_POCHES._) : t === 'chasseur' ? DEP_CHASSEUR : DEP_GEANT;
        let n = 0, pieces = 0, objs = 0, perso = 0, rare = 0;
        for (let i = 0; i < 400; i++) {
          const L = D.tirer({ id: 'p' + i + qui, t, qui }); n++;
          let p = 0, r = 0;
          for (const [k, c] of L) { if (k === 'argent') pieces += c; else { objs += c; if ((P.p || []).includes(k)) p = 1; if ((P.r || []).includes(k)) r = 1; } }
          perso += p; rare += r;
        }
        return { pieces: r1(pieces / n), objets: r2(objs / n), perso: r2(perso / n), rare: r2(rare / n), nu: !!P.nu };
      };
      for (const d of NPC_DATA) { try { o.poches[d.id] = mesure('npc', d.id); } catch (e) { /* rien */ } }
      try { o.poches._chasseur = mesure('chasseur', 'chasseur'); o.poches._geant = mesure('geant', 'geant'); } catch (e) { /* rien */ }
      return o;
    } finally { s.day = d0; npcs.say = say0; ui.read = read0; game.time = t0; game.player.pos = pos0; Math.random = rnd0; }
  });
  // les activités : quand elles sont ouvertes (heure par heure, les douze jours), combien de fois par jour, les mises,
  // ce qu'elles rapportent et ce qu'elles font (amitié, mentalité)
  ok('act', () => {
    if (typeof activites === 'undefined') return undefined;
    const A = activites, R = { fen: {}, lim: {}, fx: {}, mises: {}, regles: {}, txt: {} };
    const calls = [], SV = [];
    let H = 12, inv = {}, lastOpts = [];
    const rec = (...a) => { calls.push(a); };
    const stub = (o, k, f) => { if (!o) return; SV.push([o, k, o[k], Object.prototype.hasOwnProperty.call(o, k)]); o[k] = f; };
    stub(npcs, 'hour', () => H);
    stub(ui, 'subtitle', (who, t) => rec('sub', who, t));
    stub(ui, 'choice', (t, d, o) => { lastOpts = o || []; rec('choice', t, d, lastOpts.map((x) => x.label)); });
    stub(ui, 'read', (t, x, sg) => rec('read', t, x, sg));
    stub(ui, 'open', (id) => rec('open', id));
    stub(ui, 'close', () => {});
    stub(npcs, 'say', (n, t) => rec('say', n && n.id, t));
    stub(npcs, 'addAmitie', (n, k) => rec('ami', n && n.id, k));
    stub(npcs, 'remember', () => {});
    stub(talk, 'view', (t) => { rec('view', t); return t; });
    stub(farm, 'pay', (m) => { rec('pay', m); if (s.money >= m) { s.money -= m; return true; } return false; });
    stub(farm, 'earn', (m) => { rec('earn', m); s.money += m; });
    stub(farm, 'give', (id, n) => rec('give', id, n));
    stub(farm, 'take', (id, n) => { rec('take', id, n); return true; });
    stub(farm, 'count', (id) => inv[id] || 0);
    stub(farm, 'bestTool', (k) => (inv['@' + k] ? { tool: k } : null));
    if (typeof esprit !== 'undefined') stub(esprit, 'changer', (d, r) => rec('esprit', r2(d), r));
    stub(BUFF, 'add', (id, h) => rec('buff', id, h));
    if (typeof faith !== 'undefined') stub(faith, 'add', (k, n) => rec('foi', k, n));
    if (typeof cine !== 'undefined') stub(cine, 'jouer', () => { rec('cine'); return Promise.resolve(); });
    stub(play, 'hurt', (d) => rec('hurt', d));
    stub(play, 'flyer', () => {});
    stub(globalThis, 'setTimeout', () => 0);
    stub(globalThis, 'setInterval', () => 0);
    stub(globalThis, 'addEventListener', () => {});
    const day0 = s.day, money0 = s.money, act0 = s.activites, hours0 = s.hours, sky0 = game.sky, time0 = game.time, hp0 = game.player.hp, hand0 = s.hand;
    game.sky = Object.assign({}, game.sky || {}, { wet: 0, day: 1 });
    const N = npcs.byId.forgeron || npcs.list.find((n) => n.st.alive && (n.d.age || 30) >= 16);
    const setDay = (k, wk) => { s.day = k + 1 + 12 * (wk === undefined ? 8 : wk); s.hours = s.day * 24 + H; };
    const dayOf = (cle) => Math.max(0, SEMAINE.findIndex((J) => J.cle === cle));
    const reset = () => { s.activites = null; s.money = 1000; calls.length = 0; lastOpts = []; };
    const has = (k, f) => calls.some((c) => c[0] === k && (!f || f(c)));
    const gains = () => calls.filter((c) => /^(ami|esprit|earn|pay|give|take|buff|hurt|foi)$/.test(c[0])).map((c) => c.slice());
    const HS = []; for (let h = 0; h < 24; h += 0.25) HS.push(h);
    const spans = (row) => { const o = []; let a = null; row.forEach((v, i) => { if (v && a === null) a = HS[i]; if (!v && a !== null) { o.push([a, HS[i]]); a = null; } }); if (a !== null) o.push([a, 24]); return o; };
    const essai = (fn) => { try { fn(); } catch (e) { rec('err', String(e && e.message)); } };
    const fen = (name, fn, open, setup) => {
      const days = [];
      for (let k = 0; k < SEMAINE.length; k++) {
        const row = [];
        for (const h of HS) { H = h; setDay(k); reset(); A.quilles = null; if (setup) setup(k, h); essai(fn); row.push(open() ? 1 : 0); }
        days.push(spans(row));
      }
      R.fen[name] = days;
    };
    const ouvert1 = (name) => { const F = R.fen[name] || []; for (let k = 0; k < F.length; k++) if (F[k].length) return [k, (F[k][0][0] + F[k][0][1]) / 2]; return [0, 12]; };
    const lim = (name, key, fn, open, jour) => {
      const [k, h] = jour || ouvert1(name);
      for (let i = 0; i <= 12; i++) { H = h; setDay(k); reset(); A.quilles = null; s.activites = { jour: s.day, fait: { [key]: i }, tombes: {} }; essai(fn); if (!open()) { R.lim[name] = i; return; } }
      R.lim[name] = null;
    };
    const proba = (prefix, fn, pred, setup) => {
      const at = (x) => { reset(); if (setup) setup(); Math.random = seq(prefix.concat([x]), 0.5); try { fn(); } catch (e) { /* rien */ } finally { Math.random = rnd0; } return pred(); };
      if (!at(0)) return 0;
      if (at(0.9999999)) return 1;
      let a = 0, b = 1;
      for (let i = 0; i < 20; i++) { const m = (a + b) / 2; if (at(m)) a = m; else b = m; }
      return Math.round(a * 1000) / 1000;
    };
    const fx = (name, fn, setup) => { reset(); if (setup) setup(); essai(fn); R.fx[name] = gains(); return calls.slice(); };
    try {
      let flag = false;
      // ---- quand (les douze jours, quart d'heure par quart d'heure)
      fen('des', () => A.jouerDes(N, 'des'), () => has('choice'));
      fen('cartes', () => A.jouerDes(N, 'cartes'), () => has('choice'));
      fen('veillee', () => A.veillee(), () => has('read'));
      fen('diseuse', () => A.diseuse(), () => has('choice'));
      fen('crieur', () => { flag = !!A.crieurPresent(); }, () => flag);
      fen('violon', () => { flag = !!A.violonPresent(); }, () => flag);
      fen('clocher', () => A.clocher(), () => has('cine'));
      fen('quilles', () => A.quillesJouer(), () => has('choice'));
      fen('tombola', () => A.tombola(), () => has('choice'));
      fen('tir', () => A.tir(), () => has('open'));
      fen('peche', () => A.peche(), () => has('pay'));
      fen('peche_jury', () => A.peche(), () => !!(s.activites && s.activites.peche && s.activites.peche.fini) && !has('sub'), () => { s.activites = { jour: s.day, fait: {}, tombes: {}, peche: { j: s.day, best: { id: 'carpe', prix: 999 }, fini: false } }; });
      fen('marche', () => { flag = !!A.marcheOuvert(); }, () => flag);
      // ---- combien de fois par jour
      lim('des', 'des', () => A.jouerDes(N, 'des'), () => has('choice'));
      lim('cartes', 'cartes', () => A.jouerDes(N, 'cartes'), () => has('choice'));
      lim('quilles', 'quilles', () => A.quillesJouer(), () => has('choice'));
      lim('veillee', 'veillee', () => A.veillee(), () => has('read'));
      lim('diseuse', 'diseuse', () => A.diseuse(), () => has('choice'));
      lim('clocher', 'clocher', () => A.clocher(), () => has('cine'));
      lim('voeu', 'voeu', () => A.voeu(), () => has('choice'), [0, 12]);
      lim('cierge', 'cierge', () => A.cierge(), () => has('choice'), [0, 12]);
      lim('tournee', 'tournee', () => A.tournee(npcs.byId.aubergiste || N), () => has('pay'), [0, 20]);
      lim('bras', 'bras:' + N.id, () => A.brasDeFer(N), () => has('open'), [0, 12]);
      // ---- les mises, les règles telles que les dit le jeu
      const panneau = (name, fn, k, h, have) => { H = h; setDay(k); reset(); inv = have || {}; essai(fn); inv = {}; const c = calls.find((q) => q[0] === 'choice' || q[0] === 'read'); R.mises[name] = c ? { titre: c[1], texte: c[2], opts: c[3] || null } : null; return calls.slice(); };
      { const [k, h] = ouvert1('des'); panneau('des', () => A.jouerDes(N, 'des'), k, h); panneau('des_pipes', () => A.jouerDes(N, 'des'), k, h, { des_pipes: 1 }); panneau('cartes', () => A.jouerDes(N, 'cartes'), k, h); }
      { const [k, h] = ouvert1('diseuse'); panneau('diseuse', () => A.diseuse(), k, h); if (lastOpts[0]) { const o = lastOpts[0]; calls.length = 0; essai(() => o.fn()); R.fx.diseuse = gains(); const r = calls.find((q) => q[0] === 'read'); R.txt.diseuse = r ? [r[1], r[2], r[3]] : null; } }
      panneau('voeu', () => A.voeu(), 0, 12);
      const voeux = lastOpts.slice();
      panneau('cierge', () => A.cierge(), 0, 12);
      const cierges = lastOpts.slice();
      { const [k, h] = ouvert1('quilles'); panneau('quilles', () => A.quillesJouer(), k, h); }
      { const [k, h] = ouvert1('tombola'); panneau('tombola', () => A.tombola(), k, h); }
      { const [k] = ouvert1('tir'); panneau('tir_ferme', () => A.tir(), (k + 1) % SEMAINE.length, 12); }
      { const [k] = ouvert1('peche'); panneau('peche_ferme', () => A.peche(), (k + 1) % SEMAINE.length, 12); }
      { const [k] = ouvert1('diseuse'); panneau('diseuse_ferme', () => A.diseuse(), (k + 1) % SEMAINE.length, 3); }
      { const [k] = ouvert1('tombola'); panneau('tombola_ferme', () => A.tombola(), (k + 1) % SEMAINE.length, 12); }
      // ---- les dés, le vingt-et-un : ce que rapporte une partie
      H = 20; setDay(dayOf('veillee'));
      fx('des_gagne', () => { Math.random = seq([0.99, 0.99, 0.99, 0, 0, 0]); try { A.lancerDes(N, 10, false); } finally { Math.random = rnd0; } });
      fx('des_perd', () => { Math.random = seq([0, 0, 0, 0.99, 0.99, 0.99]); try { A.lancerDes(N, 10, false); } finally { Math.random = rnd0; } });
      fx('des_triche', () => { Math.random = seq([0.99, 0.99, 0.99, 0.99, 0.99, 0.99, 0, 0, 0, 0]); try { A.lancerDes(N, 10, true); } finally { Math.random = rnd0; } });
      R.regles.triche = proba([0.99, 0.99, 0.99, 0.99, 0.99, 0.99, 0, 0, 0], () => A.lancerDes(N, 10, true), () => !!(s.activites && s.activites.tricheur !== undefined));
      const C = (v) => ({ v, c: '♠' });
      fx('cartes_gagne', () => A.fin21({ n: N, m: 10, moi: [C('10'), C('9')], lui: [C('10'), C('7')] }));
      fx('cartes_21', () => A.fin21({ n: N, m: 10, moi: [C('A'), C('R')], lui: [C('10'), C('7')] }));
      fx('cartes_egal', () => A.fin21({ n: N, m: 10, moi: [C('10'), C('7')], lui: [C('10'), C('7')] }));
      fx('cartes_perd', () => A.fin21({ n: N, m: 10, moi: [C('10'), C('6')], lui: [C('10'), C('8')] }));
      // ---- le bras de fer, la tournée, la veillée
      fx('bras_gagne', () => A.finBras({ n: N }, true));
      fx('bras_perd', () => A.finBras({ n: N }, false));
      R.regles.bras = Object.fromEntries(Object.entries(ACT_BRAS).map(([k, v]) => [k, v.f]));
      {
        const J0 = A.joueurs, au = npcs.byId.aubergiste || N, autres = npcs.list.filter((n) => n !== au && n.st.alive);
        R.regles.tournee = [];
        try {
          for (const nb of [0, 1, 2, 3, 5, 8]) { A.joueurs = () => autres.slice(0, nb); reset(); H = 20; essai(() => A.tournee(au)); const p = calls.find((c) => c[0] === 'pay'); R.regles.tournee.push([nb, p ? p[1] : null]); }
          A.joueurs = () => [N]; H = 20; fx('tournee', () => A.tournee(au));
          A.joueurs = () => [N]; H = 20; setDay(dayOf('veillee')); fx('veillee', () => A.veillee());
          R.txt.contes = [];
          for (let wk = 0; wk < ACT_CONTES.length; wk++) { H = 20; setDay(dayOf('veillee'), wk); reset(); essai(() => A.veillee()); const c = calls.find((q) => q[0] === 'read'); R.txt.contes.push([s.day, c ? c[1] : null]); }
        } finally { if (J0 === undefined) delete A.joueurs; else A.joueurs = J0; }
      }
      // ---- le puits aux souhaits, la diseuse, les cierges, les tombes
      H = 12; setDay(0);
      R.fx.voeux = voeux.filter((o, i) => i < voeux.length - 1).map((o) => { reset(); game.player.hp = 50; Math.random = seq([0.5]); try { o.fn(); } catch (e) { /* rien */ } finally { Math.random = rnd0; } const g = gains(); if (game.player.hp !== 50) g.push(['pv', game.player.hp - 50]); const sb = calls.find((c) => c[0] === 'sub'); return [o.label, g, sb ? sb[2] : null]; });
      if (voeux[0]) {
        R.regles.voeuRefus = proba([], () => voeux[0].fn(), () => has('earn'));
        R.regles.voeuAutre = proba([], () => voeux[0].fn(), () => !has('buff'));
      }
      R.fx.cierges = cierges.filter((o, i) => i < cierges.length - 1).slice(0, 1).map((o) => { reset(); essai(() => o.fn()); return [o.label, gains()]; });
      inv = { bouquet: 1 }; s.hand = null;
      setDay(0); fx('fleurir', () => A.fleurir('wiki0', 0, 0, 0));
      setDay(dayOf('morts')); fx('fleurir_morts', () => A.fleurir('wiki1', 0, 0, 0));
      inv = {};
      // ---- les quilles : mille lancers de la première boule, pour chaque visée
      {
        const QN = 1500, Q0 = () => ({ actif: true, lancer: 1, total: 0, debout: A.QUILLES.map(() => true), anim: A.QUILLES.map(() => ({ a: 0, t0: -1, dir: 0 })), boule: null });
        R.regles.quilles = [-1, 0, 1].map((vise) => { let tot = 0, neuf = 0; for (let i = 0; i < QN; i++) { A.quilles = Q0(); A.lancerBoule(vise); tot += A.quilles.total; if (A.quilles.total === 9) neuf++; } return [vise, r2(tot / QN), Math.round(neuf / QN * 1000) / 1000]; });
        setDay(dayOf('foire')); H = 12;
        fx('quilles_9', () => { A.quilles = Object.assign(Q0(), { total: 9 }); A.finQuilles(); });
        fx('quilles_7', () => { A.quilles = Object.assign(Q0(), { total: 7, lancer: 2 }); A.finQuilles(); });
        A.quilles = null;
      }
      // ---- le four banal
      {
        const four = (cle, have) => { H = 10; setDay(dayOf(cle)); reset(); inv = have; essai(() => A.four()); const F = s.activites && s.activites.four; const r = { prises: calls.filter((c) => c[0] === 'take').map((c) => [c[1], c[2]]), out: F ? F.out : null, delai: F ? r2(F.pret - s.hours) : null }; inv = {}; return r; };
        R.regles.four = { pain: four('semailles', { farine: 5, bois: 5 }), brioche: four('semailles', { farine: 5, bois: 5, beurre: 1, oeuf: 1 }), foire: four('foire', { farine: 5 }), sansBois: four('semailles', { farine: 5 }), sansFarine: four('semailles', { farine: 1, bois: 5 }) };
      }
      // ---- la tombola
      {
        const [k, h] = ouvert1('tombola'); H = h; setDay(k); reset();
        essai(() => A.tombola());
        let n = 0;
        while (lastOpts.length > 1 && n < 10) { const o = lastOpts[0]; lastOpts = []; essai(() => o.fn()); n++; }
        const p = calls.find((c) => c[0] === 'pay');
        R.regles.tombola = { max: n, billet: p ? p[1] : null, tirage: A.TIRAGE_H, lots: A.LOTS };
      }
      // ---- le concours de tir : les prix selon le rang, les habitués, la main qui tremble
      {
        const S0 = A.scoresPNJ, own0 = Object.prototype.hasOwnProperty.call(A, 'scoresPNJ');
        let noms = null;
        R.regles.tir = { prix: [], noms: null, inscription: null, amp: [] };
        try {
          for (let rang = 1; rang <= 4; rang++) {
            H = 10; setDay(dayOf('chasse')); reset();
            A.scoresPNJ = (k, L) => { noms = L; return L.map(([id], i) => [id, i < rang - 1 ? 99 : -1]); };
            essai(() => A.finTir({ coups: [[0, 0], [0, 0], [0, 0]] }));
            R.regles.tir.prix.push([rang, calls.filter((c) => c[0] === 'earn' || c[0] === 'give').map((c) => c.slice())]);
          }
        } finally { if (own0) A.scoresPNJ = S0; else delete A.scoresPNJ; }
        R.regles.tir.noms = noms;
        const [k, h] = ouvert1('tir'); H = h; setDay(k); reset(); essai(() => A.tir());
        const p = calls.find((c) => c[0] === 'pay'); R.regles.tir.inscription = p ? p[1] : null;
        for (const [t, have] of [['main', {}], ['arc', { '@arc': 1 }], ['fusil', { '@fusil': 1 }]]) { inv = have; reset(); A.tirEtat = null; essai(() => A.jeuTir()); R.regles.tir.amp.push([t, A.tirEtat ? r2(A.tirEtat.amp) : null]); inv = {}; }
      }
      // ---- le concours de pêche
      {
        const P0 = A.prisesPNJ, own0 = Object.prototype.hasOwnProperty.call(A, 'prisesPNJ');
        let noms = null;
        R.regles.peche = { prix: [], noms: null, inscription: null };
        try {
          for (let rang = 1; rang <= 4; rang++) {
            H = 17; setDay(dayOf('peche')); reset();
            s.activites = { jour: s.day, fait: {}, tombes: {}, peche: { j: s.day, best: { id: 'carpe', prix: 500 }, fini: false } };
            A.prisesPNJ = (k, L) => { noms = L; return L.map(([id], i) => [id, i < rang - 1 ? 1e6 : 0]); };
            essai(() => A.peche());
            R.regles.peche.prix.push([rang, calls.filter((c) => c[0] === 'earn' || c[0] === 'give').map((c) => c.slice())]);
          }
        } finally { if (own0) A.prisesPNJ = P0; else delete A.prisesPNJ; }
        R.regles.peche.noms = noms;
        const [k, h] = ouvert1('peche'); H = h; setDay(k); reset(); essai(() => A.peche());
        const p = calls.find((c) => c[0] === 'pay'); R.regles.peche.inscription = p ? p[1] : null;
      }
      // ---- les petits travaux de la mairie, sur quatre semaines
      {
        const TJ = {};
        for (let d = 1; d <= 48; d++) { s.day = d; let L = []; try { L = A.travauxDuJour(); } catch (e) { L = []; } for (const j of L) (TJ[j.t] || (TJ[j.t] = [])).push([j.pay, j.txt, j.need || null, j.n || null, j.to || null]); }
        R.regles.travaux = TJ;
        setDay(0); H = 12; fx('travaux', () => A.payer({ i: 0, pay: 30 }));
      }
      // ---- les étals du Marchedi : ce qu'ils proposent, semaine après semaine
      R.regles.etals = (typeof ACT_ETALS !== 'undefined' ? ACT_ETALS : []).map((E) => { const sem = []; for (let wk = 0; wk < 4; wk++) { s.day = 12 * wk + 3; try { sem.push(A.offre(E)); } catch (e) { sem.push([]); } } return [E.id, sem]; });
      // ---- le crieur : les nouvelles d'un jour (la veille du grand marché)
      { H = 8.2; setDay(Math.max(0, dayOf('marche') - 1)); reset(); try { R.txt.crieur = A.nouvelles(); } catch (e) { R.txt.crieur = null; } }
      // ---- le violoneux : le pourboire
      { H = 11; setDay(0); reset(); essai(() => A.pourboire()); const o = lastOpts.slice(); R.txt.violon = calls.find((c) => c[0] === 'choice') || null; R.fx.violon = o.length > 1 ? (reset(), essai(() => o[0].fn()), gains()) : null; }
    } finally {
      for (const [o, k, v, own] of SV.reverse()) { if (own) o[k] = v; else delete o[k]; }
      Math.random = rnd0; globalThis.setTimeout = st0; globalThis.setInterval = si0;
      s.day = day0; s.money = money0; s.activites = act0; s.hours = hours0; game.sky = sky0; game.time = time0; game.player.hp = hp0; s.hand = hand0; A.quilles = null; A.tirEtat = null; A.brasEtat = null;
    }
    return R;
  });
  Math.random = rnd0; globalThis.setTimeout = st0; globalThis.setInterval = si0;
  return out;
}
// ce que le code dit en toutes lettres (seuils, facteurs, délais) : lu dans les modules, là où aucune table ne le porte
function vieTextes(G) {
  const txt = (re) => { for (const [f, t] of G.texts) { if (!/^(11|07)-/.test(f)) continue; const m = t.match(re); if (m) return m.slice(1); } return null; };
  const L = (s) => s.split(',').map((x) => +x.trim());
  const R = {};
  const g = (k, re, f) => { const m = txt(re); R[k] = m ? (f ? f(m) : m.map((x) => (/^-?\d+(?:\.\d+)?$/.test(x) ? +x : x))) : null; };
  // le sommeil
  g('endurance', /const f = \[([\d., ]+)\]\[st\];\s*\n\s*p\.stamina/, (m) => L(m[0]));
  g('fatigueRythme', /const rate = \(\[([\d., ]+)\]\[st\]\) \+ Math\.max\(0, this\.eff\(\) - (\d+)\) \* ([\d.]+)/, (m) => [L(m[0]), +m[1], +m[2]]);
  g('fatiguePlafond', /esprit\.changer\(-rate \* dh, 'fatigue', (\d+)\)/);
  g('coupsDurs', /delta \*= \[([\d., ]+)\]\[st\]/, (m) => L(m[0]));
  g('pensees', /this\.pensT = \[([\d., ]+)\]\[st\]/, (m) => L(m[0]));
  g('etrangeFatigue', /b \* \(1 \+ ([\d.]+) \* sommeil\.k\(\)\)/);
  g('murmures', /if \(actif && st >= (\d)\) \{\s*this\.murmT -= dt/);
  g('silhouette', /if \(st >= (\d) && typeof esprit !== 'undefined' && esprit\.silhouette\)/);
  g('microSommeil', /const micro = st >= (\d) && Math\.random\(\) < ([\d.]+)/);
  g('dormirJour', /if \(h >= ([\d.]+) && h < ([\d.]+)\) \{\s*const c = sommeil\.ctx;\s*ui\.choice\('([^']+)', '([^']+)'/);
  g('aubergeJour', /if \(h > (\d+) && h < (\d+)\) \{\s*if \(!farm\.pay\((\d+)\)\) return this\.view\('([^']+)'/);
  g('aubergeSoir', /\{ label: 'Louer une chambre \((\d+) pièces\)', act: 'rent' \}/);
  g('litProteste', /npcs\.addAmitie\(debout, (-?\d+)\)/);
  g('litDecouvert', /npcs\.addAmitie\(qui, ami \? (-?\d+) : mere \? (-?\d+) : (-?\d+)\)/);
  g('litAmi', /const ami = npcs\.level\(qui\) >= (\d+) && !mere/);
  // la location
  g('bailEcheance', /echeance: s\.day \+ (\d+), du: 0/);
  g('bailRappel', /retard >= (\d+) && !B\.rappel/);
  g('bailExpulsion', /if \(retard >= (\d+)\) \{ this\.expulser\(k\)/);
  // le crochetage
  g('crocRetombe', /if \(J\.d >= (\d) && J\.i > 0 && Math\.random\(\) < \[([\d., ]+)\]\[J\.d - 1\]\)/, (m) => [+m[0], L(m[1])]);
  g('crocParJeu', /if \(S\.casses >= (\d+)\) \{ S\.casses = 0; farm\.take\('crochets', 1\)/);
  g('crocEntend', /if \(dd > (\d+)\) continue;\s*const dort = m\.state === 'sleep' \|\| m\.sleep, chezLui = m\.id === J\.o\.proprietaire \|\| dd < (\d+);\s*const pch = dort \? \(chezLui \? ([\d.]+) : ([\d.]+)\) \* b : m\.inside \? \(chezLui \? ([\d.]+) : ([\d.]+)\) \* b : dd < (\d+) \? ([\d.]+) \* b : ([\d.]+) \* b/);
  g('crocBruit', /P\.ok = true; P\.pos = 0\.5; J\.i\+\+; sound\.crocCale && sound\.crocCale\(\);\s*this\.bruit\(([\d.]+)\)[\s\S]{0,400}?this\.bruit\((\d+)\)[\s\S]{0,700}?this\.bruit\(([\d.]+)\)/);
  g('crocVoit', /if \(dd > (\d+) \|\| !\(dd < (\d+) \|\| segClear[\s\S]{0,300}?const k = face > ([\d.-]+) \? 1 : face > ([\d.-]+) \? ([\d.]+) : ([\d.]+);\s*if \(Math\.random\(\) < \(nuit \? ([\d.]+) : ([\d.]+)\) \* \(dd < (\d+) \? (\d+) : 1\) \* k\)/);
  g('crocMains', /k \*= 1 - ([\d.]+) \* sommeil\.k\(\);[\s\S]{0,200}?alcool\.S\(\)\.g > (\d+)\) k \*= ([\d.]+)/);
  g('crocOuverte', /dr\.crocheteT = game\.time \+ (\d+);\s*setTimeout/);
  g('crocEsprit', /esprit\.changer\((-?\d+), 'effraction', \d+\)/);
  // ramasser et casser
  g('portesRepar', /s\.day - S\.portes\[i\]\.j >= (\d+)/);
  g('debris', /S\.debris = S\.debris\.filter\(\(D\) => s\.day - D\.j < (\d+)\)/);
  g('tas', /S\.tas = S\.tas\.filter\(\(T\) => s\.day - T\.j < (\d+)/);
  g('coupsEntaille', /for \(const k in S\.pv\) if \(s\.day - S\.pv\[k\]\.j >= (\d+)\) delete/);
  g('porteBois', /if \(Math\.random\(\) < ([\d.]+)\) \{ farm\.give\('bois', 1\)[\s\S]{0,160}?if \(Math\.random\(\) < ([\d.]+)\) \{ farm\.give\('ferraille', 1\)/);
  g('casseAmitie', /npcs\.addAmitie\(own, acte === 'ramasse' \|\| acte === 'tas' \? (-?\d+) : (-?\d+)\)/);
  g('casseReprise', /this\.alertes\[o\.cle\] = game\.time \+ (\d+);/);
  g('forceDouble', /const dmg = base \* k \* \(BUFF\.on\('force'\) \? (\d+) : 1\);\s*const S = this\.S\(\), key = P\.cle/);
  // les fouilles
  g('refillAbandon', /Math\.max\((\d+), r \* (\d+)\)/);
  g('volAmitie', /if \(own\) \{ npcs\.addAmitie\(own, (-?\d+)\); own\.st\.anger/);
  g('plainteJours', /for \(const id in S\.plaintes\) if \(s\.day - S\.plaintes\[id\] > (\d+)\) delete S\.plaintes\[id\];/);
  // les dépouilles
  g('enterrerHeures', /this\.avancer\(chienRec \? ([\d.]+) : ([\d.]+)\)/);
  g('merci', /for \(const m of vus\) npcs\.addAmitie\(m, (\d+)\);\s*const mort = this\.npc\(rec\);[\s\S]{0,200}?npcs\.addAmitie\(m, (\d+)\); npcs\.remember\(m, 'enterre'/);
  g('fermierAge', /const age = (\d+) \+ Math\.max\(0, s\.run - E\.run - 1\) \* (\d+);/);
  g('nouvelleJours', /return j !== undefined && d - j <= (\d+);/);
  // les activités
  g('croupier', /while \(this\.valeur\(P\.lui\) < (\d+)\) P\.lui\.push/);
  g('cibleScore', /Math\.max\(0, (\d+) - Math\.floor\(Math\.hypot\(x, y\) \* (\d+)\)\)/);
  g('tirageSur', /const n = 1 \+ \(\(rnd\(\) \* (\d+)\) \| 0\); if \(!L\.includes\(n\)\) L\.push\(n\);/);
  g('brocante', /if \(vendus < (\d+)\) for \(const id of T\) \{\s*const prix = Math\.max\(1, Math\.round\(ITEMS\[id\]\.price \* ([\d.]+)\)\)/);
  g('ecoute', /if \(A\.ecoute >= (\d+) && !this\.fait\('ecoute1'\)\)[\s\S]{0,300}?if \(A\.ecoute >= (\d+) && !this\.fait\('ecoute2'\)\)/);
  g('pecheJury', /if \(h < (\d+)\) \{ ui\.subtitle\('', P\.best \?[\s\S]{0,400}?if \(h >= (\d+)\) \{ ui\.subtitle\('', '\(Trop tard : le jury/);
  g('conteSemaine', /const C = ACT_CONTES\[Math\.floor\(farm\.s\.day \/ (\d+)\) % ACT_CONTES\.length\]/);
  return R;
}
// la vie de la vallée : les mesures, les textes du code, et les figurines des portes et des meubles
function extractVie(G, DB, FIGS) {
  const V = G.run(`(${vieProbe.toString()})()`);
  const vie = DB.derived.vie = jclone(V) || {};
  for (const e of vie.err || []) DB.log.push('vie de la vallée, ' + e);
  delete vie.err;
  vie.re = vieTextes(G);
  if (!FIGS || !G.has('ICON3D')) return;
  const { shelf, fig } = FIGS;
  const addCv = (key, expr) => { try { const cv = G.run(expr); if (cv) fig[key] = { full: shelf.add(trim(cv)) }; } catch (e) { DB.log.push('figurine ' + key + ' : ' + (e && e.message)); } };
  // une porte de chaque sorte, prise dans la vallée (vue du dehors, fermée)
  const vues = new Set();
  for (const d of vie.portes || []) {
    if (!d.st || vues.has(d.st) || d.deco) continue;
    vues.add(d.st);
    addCv('porte:' + d.st, `(() => { const d0 = game.world.doors[${d.i}]; const d = Object.assign({}, d0, { r: d0.r + Math.PI, a: 0, open: 0, _st: null, casse: false }); PORTES.cam = [d.x, d.y, d.z]; const boxes = ICON3D.capture((cap) => emitDoor(cap, d, 0)); return boxes.length ? ICON3D.render(boxes, 96) : null; })()`);
  }
  if (!vues.has('eglise')) addCv('porte:eglise', `(() => { const d = { x: 0, y: 0, z: 0, r: Math.PI, w: 1.94, h: 3.14, a: 0, open: 0, style: 'eglise', deco: true }; PORTES.cam = [0, 0, 0]; const boxes = ICON3D.capture((cap) => emitDoor(cap, d, 0)); return boxes.length ? ICON3D.render(boxes, 96) : null; })()`);
  // les meubles qu'on fouille, ceux des maisons à louer, des activités, les lits, les tertres
  const P = ['armoire', 'commode', 'buffet', 'malle', 'secretaire', 'coffre_fort', 'apothicaire', 'casier_tri', 'petrin', 'coffre_outils', 'poubelle', 'tronc', 'boite_tresors', 'sellerie', 'coffre_nain', 'jambons',
    'etagere', 'tonneau', 'caisse', 'sac', 'wagonnet', 'coffre_vieux', 'coffre_loc', 'ecriteau_louer', 'porte_cierges', 'quilles_piste', 'cible', 'tente_diseuse', 'stand_tombola', 'lit', 'paillasse', 'lit_geant', 'tertre'];
  const one = (id, data, key, S) => addCv(key, `(() => { const id = ${JSON.stringify(id)}; if (!PROP_MODELS[id]) return null; const o = { id, x: 0, y: 0, z: 0, r: 0, s: 1, data: Object.assign({ lit: true, fill: 1, open: false, m: null, vide: false, items: {} }, ${JSON.stringify(data)}) }; const T = { t: 1.3, hour: 12, night: 0, day: 1, wind: 0.3, rain: 0 }; const boxes = ICON3D.capture((cap) => { PE.buf = cap; PE.fl = 0; PE.frame(0, 0, 0, 0, 1); PROP_MODELS[id](PE, o, T); }); return boxes.length ? ICON3D.render(boxes, ${S}) : null; })()`);
  for (const id of P) one(id, {}, 'prop:' + id, /^(quilles_piste|tente_diseuse|lit_geant)$/.test(id) ? 96 : 72);
  one('tertre', { pierre: 1 }, 'prop:tertre_pierres', 72);
  // les arroseurs, et les meubles qu'on pose chez soi (leur modèle : l'objet posé qui les porte)
  for (const id of ['arroseur', 'arroseur_fer']) one(id, {}, 'prop:' + id, 72);
  const MB = G.get('MEUBLES');
  if (MB && typeof MB === 'object') for (const [id, M] of Object.entries(MB)) {
    const pid = G.run(`(() => { const it = ITEMS[${JSON.stringify(id)}]; return (it && it.place) || ${JSON.stringify(id)}; })()`);
    if (!fig['prop:' + pid]) one(pid, M.data || {}, 'prop:' + pid, 72);
    if (pid !== id && fig['prop:' + pid]) fig['meuble:' + id] = fig['prop:' + pid];
  }
}

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
  let FIGS = null;
  {
    const shelf = new Shelf(1024), fig = {};
    // les personnages « façon 1996 » ont des boîtes effilées (TR_FORMES), que le vertex shader déforme : le rendu
    // des icônes les ignore ; pour les figurines, on applique la même déformation aux coins des boîtes
    const renderOrig = safe('boîtes effilées', () => G.run(`(() => {
      if (typeof TR_FORMES === 'undefined' || !TR_FORMES.list || TR_FORMES.list.length < 2 || typeof ICON3D === 'undefined') return false;
      const src = ICON3D.render.toString(), A = 'const corner = (u, v, w) => [';
      if (!src.includes(A)) return false;
      const patched = src.replace(A, 'const __shp = (() => { const c = bx.code | 0, i = c >= 0 ? (c >> 18) & 63 : ((-c - 1) >> 9) & 63; return i > 0 && i < TR_FORMES.list.length ? TR_FORMES.list[i] : null; })();\\n      const corner = (u0, v0, w0) => { if (!__shp) return __corner(u0, v0, w0); const k = __shp, t = v0 + 0.5, fx = 1 + k[0] * t - Math.max(k[0], 0), fz = 1 + k[1] * t - Math.max(k[1], 0); return __corner(u0 * fx, v0 + k[3] * (1 - t) * w0, w0 * fz + k[2] * (1 - t)); };\\n      const __corner = (u, v, w) => [');
      globalThis.__renderOrig = ICON3D.render;
      ICON3D.render = (0, eval)('({' + patched + '})').render;
      return true;
    })()`), false);
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
    // les silhouettes des nouveautés : les Trois, les géants, les bêtes des autres mondes, l'Homme long, les chercheurs
    {
      const DL = G.get('DIV_LOOK');
      if (DL && typeof DL === 'object') for (const k of Object.keys(DL)) { const cv = safe('figurine ' + k, () => human(`DIV_LOOK[${JSON.stringify(k)}]`, 128, false)); if (cv) fig['div:' + k] = { full: shelf.add(trim(cv)) }; }
      const GL = G.get('GEANT_LOOKS');
      if (Array.isArray(GL)) GL.forEach((_, i) => { const cv = safe('géant ' + i, () => human(`GEANT_LOOKS[${i}]`, 128, false)); if (cv) fig['geant:' + i] = { full: shelf.add(trim(cv)) }; });
      const BM = G.get('BETES_MONDE');
      if (BM) for (const k of Object.keys(BM)) {
        const cv = safe('bête ' + k, () => renderRig(`(() => { const d = BETES_MONDE[${JSON.stringify(k)}]; const rig = d.rig(0, { fem: false }); const e = { move: 0, phase: 0, id: 1, dist: 99, x: 0, y: 0, z: 0, heading: 0, state: 'idle', d }; const st = { t: 0, move: 0, phase: 0 }; try { if (d.pose) d.pose(e, rig, 0, st); else if (rig.kind === 'bird') poseBird(rig, st); else if (rig.parts.some((q) => q.name === 'torso')) poseHuman(rig, st); else poseQuad(rig, st); } catch (err) {} return rig; })()`, 96));
        if (cv) fig['bm:' + k] = { full: shelf.add(trim(cv)) };
      }
      if (G.has('slenderModele')) { const cv = safe('homme long', () => G.run(`(() => { const boxes = ICON3D.capture((cap) => { PE.buf = cap; PE.fl = 0; PE.frame(0, 0, 0, 0, 1); slenderModele(PE, 0, false); }); return boxes.length ? ICON3D.render(boxes, 128) : null; })()`)); if (cv) fig['slender'] = { full: shelf.add(trim(cv)) }; }
      const FC = G.get('FOND_CHERCHEURS');
      if (Array.isArray(FC) && G.has('rigChercheur')) FC.forEach((c, i) => { const cv = safe('chercheur ' + i, () => renderRig(`(() => { const r = rigChercheur(FOND_CHERCHEURS[${i}].col); try { poseChercheur(r, 0, 0, 0, false); } catch (e) {} return r; })()`, 96)); if (cv) fig['chercheur:' + i] = { full: shelf.add(trim(cv)) }; });
    }
    // les nouveautés de la vie de la vallée : les morts qui restent au sol, à chacun de leurs stades (le fermier, un géant,
    // le chien), et les silhouettes des activités (crieur, violoneux, diseuse, marchands du Marchedi)
    if (G.has('depouilles') && G.has('ICON3D')) {
      const dep = (key, rec, st, S) => { const cv = safe('dépouille ' + key, () => G.run(`(() => { const R = depouilles.construire(${JSON.stringify(rec)}, ${st}); if (!R || !R.rig) return null; const boxes = ICON3D.capture((cap) => R.rig.emit(cap, R.M, 0)); return boxes.length ? ICON3D.render(boxes, ${S}) : null; })()`)); if (cv) fig[key] = { full: shelf.add(trim(cv)) }; };
      for (let st = 0; st <= 3; st++) dep('dep:fermier:' + st, { id: 'wiki', t: 'fermier', x: 0, y: 0, z: 0, r: 0, pose: 'dos' }, st, 112);
      dep('dep:geant:0', { id: 'wiki-g', t: 'geant', i: 0, s: 4.4, x: 0, y: 0, z: 0, r: 0, pose: 'dos' }, 0, 140);
      dep('dep:chien:0', { id: 'wiki-c', t: 'chien', x: 0, y: 0, z: 0, r: 0, pose: 'cote' }, 0, 80);
      dep('dep:chien:3', { id: 'wiki-c', t: 'chien', x: 0, y: 0, z: 0, r: 0, pose: 'cote' }, 3, 80);
    }
    {
      const AL = G.get('ACT_LOOKS');
      if (AL && typeof AL === 'object') for (const k of Object.keys(AL)) { const cv = safe('figurine ' + k, () => human(`ACT_LOOKS[${JSON.stringify(k)}]`, 128, false)); if (cv) fig['act:' + k] = { full: shelf.add(trim(cv)) }; }
      const AE = G.get('ACT_ETALS');
      if (Array.isArray(AE)) AE.forEach((E, i) => { if (!E || !E.look) return; const cv = safe('figurine ' + E.id, () => human(`ACT_ETALS[${i}].look`, 128, false)); if (cv) fig['etal:' + E.id] = { full: shelf.add(trim(cv)) }; });
    }
    if (renderOrig) safe('rendu d’origine', () => G.run('ICON3D.render = globalThis.__renderOrig'));
    // (la planche se ferme après la génération de la vallée : les portes et les meubles s'y ajoutent, voir extractVie)
    FIGS = { shelf, fig, renderOrig };
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
  safe('systèmes', () => extractSystems(G, DB));
  say(`systèmes lus : ${Object.keys((DB.derived.sys || {}).files || {}).length} modules des nouveautés`);

  say(`génération de la vallée (graine ${SEED}, ≈ 45 s ou davantage si la machine est chargée)…`);
  const w = await G.run(`generateValley(${SEED}, () => {}, typeof VALLEY_GEN !== 'undefined' ? VALLEY_GEN : 3)`);
  G.ctx.__w = w;
  safe('monde courant', () => G.run('game.world = __w; farm.w = __w;'));
  say(`vallée générée : ${w.objects.length} objets, ${w.props.length} objets posés, ${w.blocks.length} blocs`);
  safe('carte', () => extractWorld(G, w, DB));
  say('carte extraite');
  // les semaines de chacun, maintenant que les lieux existent (la première lecture n'a que les journées ordinaires)
  { const R = safe('routines (vallée)', () => extractRoutines(G), null); if (R) DB.derived.routines = R; }
  // la vie de la vallée (lits, portes et serrures, fouilles, objets, activités, dépouilles, bail) : mesurée dans le jeu
  safe('vie de la vallée', () => extractVie(G, DB, FIGS));
  // l'équilibrage : la section du README qui le raconte (convertie en fiche)
  DB.derived.equilibrage = safe('README (équilibrage)', () => { const md = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8'), a = md.search(/^## Équilibrage\s*$/m); if (a < 0) return null; const b = md.slice(a + 5).search(/^## /m); return md.slice(a, b < 0 ? undefined : a + 5 + b); }, null);
  say('vie de la vallée mesurée');
  // la planche des figurines (les portes et les meubles s'y sont ajoutés)
  if (FIGS) {
    DB.images.figures = Object.assign(FIGS.shelf.png(), { index: FIGS.fig });
    say(`${Object.keys(FIGS.fig).length} figurines${FIGS.renderOrig ? ' (boîtes effilées façon 1996)' : ''}`);
  }
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
  for (const k of ['temple', 'nains', 'geants', 'sources', 'relais', 'archives', 'maze', 'townInfo', 'abbey', 'scriptorium', 'cellar', 'crypt', 'act', 'poterne', 'locations', 'caveAuberge', 'fouilles2', 'butin', 'prison']) if (w[k]) W.misc[k] = jclone(Object.fromEntries(Object.entries(w[k]).filter(([, v]) => !ArrayBuffer.isView(v))));
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
  const LALIAS = U('LIEU_ALIAS', {});
  // les accents des mots du jeu (les clés du code n'en ont pas : « fievre » → « fièvre »)
  const ACCENTS = (() => {
    const cnt = new Map();
    // (seulement dans la prose : les identifiants comme « nausee » n'ont pas d'espace)
    const add = (s) => { for (const w of String(s).match(/[A-Za-zÀ-ÖØ-öø-ÿœŒ]+/g) || []) { const lw = w.toLowerCase(), n = lw.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/œ/g, 'oe'); const m = cnt.get(n) || new Map(); m.set(lw, (m.get(lw) || 0) + 1); cnt.set(n, m); } };
    const walk = (x, d) => { if (x == null || d > 9) return; if (typeof x === 'string') { if (x.length > 3 && /\s/.test(x)) add(x); return; } if (typeof x === 'object') for (const k in x) walk(x[k], d + 1); };
    for (const t of Object.values(DB.tables)) walk(t.v, 0);
    for (const M of Object.values((DB.derived.sys || {}).files || {})) add(M.head.join(' '));
    const out = new Map();
    for (const [n, m] of cnt) out.set(n, [...m.entries()].sort((a, b) => b[1] - a[1])[0][0]);
    return out;
  })();
  const accent = (w) => ACCENTS.get(String(w).toLowerCase()) || w;
  // une clé du code, lisible : « bassin_soir » → « bassin soir », « fievre » → « fièvre »
  const humanKey = (k) => String(k || '').split(/[_\s]+/).filter(Boolean).map(accent).join(' ');

  // ---------------------------------------------------------------- pages
  const pages = new Map();
  const P = (id, o) => { let p = pages.get(id); if (!p) { p = { id, t: id, s: '', c: [], i: '', x: 0, h: '', g: '' }; pages.set(id, p); } if (o) Object.assign(p, o); return p; };
  const isSec = (id) => { const p = pages.get(id); return !!(p && p.x); };
  const link = (id, text) => { const p = pages.get(id); const t = text ?? (p ? p.t : id); if (!p) return esc(t); return `<a href="#/p/${encodeURIComponent(id)}"${p.x ? ' class="lsec"' : ''}>${esc(t)}</a>`; };
  // liens différés vers une fiche qui n'existe pas encore (résolus à la fin, section 20)
  const lk = (id, text) => `\u0002${id}\u0003${text === undefined || text === null ? '' : encodeURIComponent(text)}\u0004`;
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
  // (les tables des modules nouveaux : des clés lisibles, sans les intitulés propres aux répliques)
  let plainLabels = false;
  const label = (k) => (!plainLabels && LABELS[k]) || cap(plainLabels ? humanKey(k) : String(k).replace(/_/g, ' '));
  const plainTree = (v, d, who) => { plainLabels = true; try { return tree(v, d, who); } finally { plainLabels = false; } };
  // le nom d'une machine (l'objet posé qui la porte)
  const machName = (m) => (PLACEABLES[m] && PLACEABLES[m].name) || (ITEMS[m] && ITEMS[m].name) || label(m);
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
  const KNOWN_ITEM_KEYS = new Set(['id', 'name', 'cat', 'price', 'ic', 'desc', 'food', 'heal', 'raw', 'poison', 'tool', 'tier', 'place', 'animal', 'potion', 'book', 'wild', 'alch', 'unique', 'questItem', 'crop', 'buy', 'biblio', 'use', 'region', 'passive', 'legend', 'alcool']);
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
    if (it.alcool) props.push(['Alcool', `${nfmt(it.alcool)} ${it.alcool > 1 ? 'unités' : 'unité'} ${lk('sys:alcool', '(l’alcool)')}`]);
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
    if (mc.length) rows.push(['Machines', mc.map((s) => `${esc(machName(s.m))} : ${needList(s.e.in)} → ${IL(s.e.out[0], s.e.out[1])} <small>en ${nfmt(s.e.h)} h</small>`).join('<br>')]);
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
    if (um.length) urows.push(['Machines', um.map((u) => `${esc(machName(u.m))} → ${IL(u.e.out[0], u.e.out[1])}`).join('<br>')]);
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
    if (typeof pl === 'string' && pl.startsWith('lieu:')) { const b = LALIAS[pl.slice(5)] || pl.slice(5); return { t: lieuName(b), k: b }; }
    // lieux des routines nouvelles : les Sources, les halles des nains, la messe, un point précis
    if (typeof pl === 'string' && (pl === 'bains' || pl.startsWith('sources:'))) { const k = LALIAS.bains || 'sources', sub = pl === 'bains' ? 'bains' : pl.slice(8); return { t: `${lieuName(k)} (${humanKey(sub)})`, k }; }
    if (typeof pl === 'string' && pl.startsWith('nain:')) { const k = LM.nains ? 'nains' : Object.keys(LM).find((q) => /nain/.test(q)) || 'nains'; return { t: `sous la montagne (${humanKey(pl.slice(5))})`, k }; }
    if (pl === 'messe') return { t: 'à la messe', k: 'eglise' };
    if (typeof pl === 'string' && pl.startsWith('pt:')) return { t: 'quelque part, en chemin', k: '' };
    const k = pl === 'marche' ? 'marche' : pl === 'champ' ? (d.home || 'ferme') : LALIAS[pl] || pl;
    return { t: LIEUN[pl] || (LM[pl] && LM[pl].name) || { champ: 'aux champs', lavoir: 'au lavoir', foret: 'en forêt', lande: 'sur la lande' }[pl] || pl, k };
  };
  // (une routine peut compter deux étapes à la même heure : seule la dernière compte)
  const schedText = (S, d) => (S || []).filter((e, i, a) => !(a[i + 1] && a[i + 1][0] === e[0])).map(([hr, pl]) => { const q = placeKey(pl, d); return `<span class="sch"><b>${hours(hr)}</b> ${pages.has('li:' + q.k) && q.t !== 'chez soi' ? placeLink(q.k, q.t) : esc(q.t)}</span>`; }).join(' ');
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
  // (la vie des villes : les endroits à fouiller, les activités, les écriteaux se voient ; pas les cachettes ni ce qui est sous terre)
  const CAVE_A = W.misc && W.misc.caveAuberge;
  const sousTerre = (it) => !!((it.data && (it.data.bld === 'cave' || (BLD[it.data.bld] && BLD[it.data.bld].under))) || (CAVE_A && Math.abs(it.x - CAVE_A.x) < 20 && Math.abs(it.z - CAVE_A.z) < 20) || (W.lm || []).some((L) => L.under && dist(L.x, L.z, it.x, it.z) <= (L.r || 10) * 1.1 + 3) || !placeAt(it.x, it.z));
  const safeInter = (it) => SAFE_INTER.has(it.kind) || /^f2a_/.test(it.kind) || it.kind === 'louer' || (it.kind === 'f2' && !!it.data && it.data.t !== 'cache' && !sousTerre(it));
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
    const pubI = its.filter(safeInter), secI = its.filter((it) => !safeInter(it));
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
    // (les silhouettes des modules des nouveautés sont montrées sur les fiches de leurs systèmes)
    const looks = Object.keys(FIG).filter((k) => k.startsWith('look:') && !(DB.tables[k.slice(5)] && SYS_FILE.test(DB.tables[k.slice(5)].file || '')));
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

  // ---------------------------------------------------------------- 20) LES NOUVEAUTÉS : les systèmes (modules 11-zzz*, 12-zzz*)
  // Chaque système a ses fiches, tirées de l'en-tête de son module (le résumé qu'en fait le code), de ses tables
  // et du commentaire qui les précède, et de ce que le jeu calcule lui-même (fréquences, seuils, blessures).
  const SYS = DB.derived.sys || { files: {}, objs: {} };
  const MF = SYS.files || {};
  const SYSP = [], MODPAGE = {}, NEWCATS = [];
  const SP = (id, o, file) => { const p = P(id, Object.assign({ x: 0 }, o)); if (!SYSP.includes(id)) SYSP.push(id); for (const f of [].concat(file || [])) if (MF[f] && !MODPAGE[f]) MODPAGE[f] = id; return p; };
  const OB = (o, k, d) => (SYS.objs && SYS.objs[o] && SYS.objs[o].props && SYS.objs[o].props[k] !== undefined ? SYS.objs[o].props[k] : d);
  const docOf = (name) => { for (const M of Object.values(MF)) if (M.tables && M.tables[name]) return M.tables[name].doc || ''; return ''; };
  const scal = (k, d) => (SYS.scal && SYS.scal[k] ? SYS.scal[k].v : d);
  const fileHas = (re) => Object.keys(MF).find((f) => re.test(f)) || null;
  const FIGW = DB.images.figures ? DB.images.figures.w : 1, FIGH = DB.images.figures ? DB.images.figures.h : 1;
  const figRect = (key) => (FIG[key] ? FIG[key].full : null);
  const figInline = (r, box = 110, capt = '', href = '') => {
    if (!r) return '';
    const [x, y, w, h] = r;
    let k = Math.min(box / w, box / h, 4); if (k >= 1) k = Math.floor(k);
    const span = `<span class="fg" style="width:${Math.round(w * k)}px;height:${Math.round(h * k)}px;background-size:${Math.round(FIGW * k)}px ${Math.round(FIGH * k)}px;background-position:${-Math.round(x * k)}px ${-Math.round(y * k)}px"></span>`;
    return `<figure class="sysfig">${href ? `<a href="${href}">${span}</a>` : span}${capt ? `<figcaption>${capt}</figcaption>` : ''}</figure>`;
  };
  const pct = (p) => (p >= 0.995 ? 'toujours' : p > 0 && p < 0.01 ? 'moins de 1 %' : Math.round(p * 100) + ' %');
  const dur = (s) => { s = Math.round(s); if (s < 60) return s + ' s'; const m = Math.floor(s / 60), r = s % 60; return m + ' min' + (r ? ' ' + String(r).padStart(2, '0') : ''); };
  const span2 = (a, b, f = (v) => v) => (a === b || b === undefined ? f(a) : `${f(a)} à ${f(b)}`);
  const ILs = (ids) => (ids || []).filter(Boolean).map((x) => IL(x)).join(', ');
  const tagList = (a) => (a || []).map((x) => `<span class="tag">${esc(x)}</span>`).join(' ');
  const quotes = (a, who) => (a && a.length ? `<ul class="qs">${a.filter(Boolean).map((t) => `<li>${FILL(String(t).replace(/^\(([^()]*)\)$/, '$1'), who)}</li>`).join('')}</ul>` : '');
  const bold1 = (s) => cap(String(s || ''));
  // ---- le texte des en-têtes : on garde la prose, on ôte le code (appels, chemins, clés, fichiers)
  const CODEISH = /[a-z]\.[a-zA-Z_(]|[a-zA-Z]_[a-zA-Z]|[a-zA-Z]\(|[a-z][A-Z]|\.js\b|zzz|\bfarm\b|=>|\bAPI\b|\bagent [A-Z]\b|\bHOOKS\b|[{}|]|\blicence\b|\b(?:inter|kind|data|strange|cine|true|false|null|BUFF|id)\b/;
  const CODETOK = /(?:^|[\s(:])(?:[A-Za-z_$][\w$]*\.[A-Za-z_$][\w$]*|[a-z]+[A-Z]\w*\(|\w+\([^()\s]*\))/;
  // découpe une phrase en propositions (« ; » et « . ») hors des parenthèses
  const clauses = (t) => {
    const out = []; let d = 0, cur = '';
    for (let i = 0; i < t.length; i++) {
      const c = t[i]; cur += c;
      if (c === '(') d++; else if (c === ')') d = Math.max(0, d - 1);
      else if (!d && (c === ';' || c === '.') && (t[i + 1] === ' ' || i === t.length - 1)) { out.push(cur); cur = ''; }
    }
    if (cur.trim()) out.push(cur);
    return out;
  };
  const cleanText = (s) => {
    let t = ' ' + String(s || '') + ' ';
    t = t.replace(/https?:\/\/\S+/g, ' ');
    // les propositions « Essais : … », « État : … », « API : … », « Sauvegarde : … »
    t = clauses(t).filter((c) => !/^\s*(Essais|État sauvegardé|État|Etat|API|Sauvegarde)\b[^:]*:/.test(c)).join('');
    // parenthèses qui ne contiennent que du code (de l'intérieur vers l'extérieur ; celles qu'on garde sont mises de côté)
    for (let k = 0; k < 5; k++) t = t.replace(/\s*\(([^()]*)\)/g, (m, c) => (CODEISH.test(c) || !c.replace(/[\s,;:—–-]/g, '') ? '' : m.replace('(', '\u2045').replace(/\)$/, '\u2046')));
    t = t.replace(/\u2045/g, '(').replace(/\u2046/g, ')');
    // les propositions qui parlent encore en code : on garde ce qui précède « : », sinon rien
    t = clauses(t).map((c) => { if (!CODETOK.test(c)) return c; const j = c.search(/\s:\s/); const pre = j > 20 ? c.slice(0, j) : ''; return pre && !CODETOK.test(pre) ? pre + (/;\s*$/.test(c) ? ' ;' : '.') + ' ' : ''; }).join('');
    t = t.replace(/[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)+(?:\([^()]*\))?/g, (m) => (/^(?:etc|cf|M|Mme|St)\./.test(m) ? m : ' '));
    t = t.replace(/\b[A-Z][A-Z0-9]*_[A-Z0-9_]+\b/g, ' ').replace(/\b[A-Z]{3,}\b/g, (w) => (DB.tables[w] || w === 'BUFF' ? ' ' : w)).replace(/'[a-z_]+'/g, ' ').replace(/\b\d\d-zzz[\w*-]*(?:\.js)?/g, ' ').replace(/\b[a-z]+:(?=[\s,)])/g, ' ');
    t = t.replace(/,?\s*voir\s*\)/g, ')').replace(/\(\s*[,;:]\s*/g, '(').replace(/\s*[:;,]\s*\)/g, ')').replace(/\(\s*[,;:—–-]*\s*\)/g, '').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')');
    t = t.replace(/\s+([,.)])/g, '$1').replace(/([,;:])\s*(?=[,;.])/g, '').replace(/(?<!\.)\.\.(?!\.)/g, '.').replace(/\s{2,}/g, ' ').replace(/^[\s.,;:—–-]+/, '');
    return t.trim();
  };
  // les mots en capitales (titres dans le texte) redeviennent des mots ; « E », « G », « SCP » restent
  const decap = (t) => String(t).split(/(«[^»]*»)/).map((seg, i) => {
    if (i % 2) return seg;
    const toks = seg.split(/(\s+)/);
    const letters = (w) => (w || '').replace(/[^A-Za-zÀ-ÖØ-öø-ÿœŒ]/g, '');
    const isCap = (w) => { const L = letters(w); return L.length >= 1 && L === L.toUpperCase() && L !== L.toLowerCase(); };
    return toks.map((w, j) => {
      if (j % 2 || !isCap(w)) return w;
      const L = letters(w), adj = (j >= 2 && isCap(toks[j - 2]) && letters(toks[j - 2]).length > 1) || (j + 2 < toks.length && isCap(toks[j + 2]) && letters(toks[j + 2]).length > 1);
      return L.length >= 4 || (adj && L.length > 1) || (adj && /^[AÀ]$/.test(L)) ? w.toLowerCase() : w;
    }).join('');
  }).join('');
  const CAPW = "(?:[A-ZÀ-ÖØ-ÞŒ][’'])?[A-ZÀ-ÖØ-ÞŒ0-9][A-ZÀ-ÖØ-ÞŒ0-9’'-]*";
  const TITLE_RE = new RegExp('^(' + CAPW + '(?:\\s+' + CAPW + ')*)(?:\\s*\\(([^()]{0,60})\\))?\\s*(?:[.:—–]\\s*|$|(?=\\())');
  const DROP = /^(API|État|Etat|Sauvegarde|Essais|Données|Branchements|Probabilité par nuit|C['’]est une entité|mondes\.|\(la mécanique)/;
  const headParts = (file) => {
    const M = MF[file];
    if (!M || !M.head.length) return { title: '', sub: '', parts: [] };
    const H = M.head.slice();
    let title = '', sub = '';
    { // le titre (en capitales), une parenthèse ou une courte proposition qui le suit : le sous-titre
      const first = H[0].trim(), m = first.match(TITLE_RE);
      if (m && /[A-ZÀ-Ý]{3,}/.test(m[1])) {
        title = m[1].trim();
        if (m[2] && !/^(agent [A-Z]|\d+)$/.test(m[2].trim()) && !CODEISH.test(cleanText(m[2]).replace(/\s:$/, ''))) sub = cleanText(m[2]).replace(/\s*[:;,]$/, '');
        let rest = first.slice(m[0].length).trim();
        const next = (H[1] || '').trim();
        const short = rest.match(/^([^.;:()]{3,42})\.\s+(\S.*)$/);
        if (!rest) H.shift();
        else if (short && !sub) { sub = short[1]; H[0] = ' ' + short[2]; }
        else if (!/[.,;:(]$/.test(rest) && (/^[A-ZÀ-Ý-]/.test(next) || !next) && !/\(/.test(rest)) { sub = sub || rest.replace(/^[—–-]\s*/, ''); H.shift(); }
        else H[0] = ' ' + rest;
      }
    }
    const parts = []; let cur = null, drop = -1, dropOpen = false;
    for (const raw of H) {
      const ind = raw.length - raw.trimStart().length, t = raw.trim();
      if (!t) { cur = null; drop = -1; dropOpen = false; continue; }
      // une ligne de code (« API : … ») se prolonge tant qu'elle ne finit pas par un point
      if (drop >= 0 && (ind > drop || dropOpen)) { dropOpen = !/\.$/.test(t); continue; }
      drop = -1; dropOpen = false;
      if (DROP.test(t.replace(/^- /, ''))) { drop = ind; dropOpen = !/\.$/.test(t); cur = null; continue; }
      if (/^- /.test(t)) { cur = { b: true, t: t.slice(2), ind }; parts.push(cur); continue; }
      if (cur && (cur.b ? ind > cur.ind : ind >= cur.ind)) { cur.t += ' ' + t; continue; }
      cur = { b: false, t, ind }; parts.push(cur);
    }
    for (const q of parts) {
      let t = cleanText(q.t);
      if (t.startsWith('(')) { let d = 0, j = -1; for (let i = 0; i < t.length; i++) { if (t[i] === '(') d++; else if (t[i] === ')' && --d === 0) { j = i; break; } } if (j > 0) t = t.slice(1, j) + (/^\s*[.;:,]/.test(t.slice(j + 1)) ? '' : '.') + t.slice(j + 1); }
      // un intitulé en capitales en tête d'un point : en gras
      const hm = q.b && t.match(new RegExp('^(' + CAPW + '(?:\\s+' + CAPW + ')*)\\s*:\\s*'));
      q.head = hm && hm[1].length > 3 ? cap(hm[1].toLowerCase()) : '';
      if (q.head) t = t.slice(hm[0].length);
      q.t = cap(decap(t).replace(/\s+([.,])/g, '$1').trim().replace(/\s*;$/, q.b ? '' : '.'));
    }
    return { title: title ? cap(decap(title).toLowerCase()) : '', sub: sub ? decap(cleanText(sub)) : '', parts: parts.filter((q) => q.t && q.t.replace(/[^A-Za-zÀ-ÿ]/g, '').length > 2) };
  };
  // l'introduction d'une fiche : le résumé du module (o.secret : ce qui doit rester caché ; o.only / o.skip : filtres)
  const intro = (file, o = {}) => {
    const { parts } = headParts(file);
    const key = (q) => (q.head ? q.head + ' : ' : '') + q.t;
    let ps = parts;
    if (o.only) ps = ps.filter((q) => o.only.test(key(q)));
    if (o.skip) ps = ps.filter((q) => !o.skip.test(key(q)));
    if (!ps.length) return '';
    let h = '', ul = [];
    const flush = () => { if (ul.length) { h += `<ul class="sysl">${ul.join('')}</ul>`; ul = []; } };
    ps.forEach((q, i) => {
      const body = (q.head ? `<b>${esc(q.head)}</b> : ` : '') + esc(q.t);
      const secret = o.all || (o.secret && o.secret.test(key(q)));
      if (q.b) { ul.push(secret ? `<li class="sec">${body}</li><li class="sec-note">(un point masqué : secrets)</li>` : `<li>${body}</li>`); return; }
      flush();
      const para = i === 0 && !o.nolead ? `<p class="lead">${body}</p>` : `<p>${body}</p>`;
      h += secret ? SEC(para, 'Une partie du texte est masquée (secrets).') : para;
    });
    flush();
    return h;
  };
  // les tables d'un module qui n'ont pas eu de rendu dédié : affichées telles quelles, avec leur commentaire
  const tableTitle = (n, doc) => { const d = doc ? cleanText(doc).split(/\s[:(—]|\s\[/)[0].trim() : ''; return cap(d && d.length <= 70 ? d : humanKey(n.toLowerCase())); };
  const restTables = (file, title = 'Autres données du module') => {
    const M = MF[file];
    if (!M) return '';
    const names = Object.keys(M.tables).filter((n) => DB.tables[n] && !used.has(n) && !TECH_TABLES.test(n) && !/_LOOKS?$/.test(n) && DB.tables[n].file === file);
    const keep = names.filter((n) => { const st = proseStats(DB.tables[n].v); return !st.code && st.prose >= 40; });
    for (const n of names) used.add(n);
    if (!keep.length) return '';
    return `<details><summary>${esc(title)}</summary>${keep.map((n) => `<h4>${esc(tableTitle(n, M.tables[n].doc))}</h4>${M.tables[n].doc ? `<p class="note">${esc(cap(cleanText(M.tables[n].doc)))}</p>` : ''}${plainTree(DB.tables[n].v, 2)}`).join('')}</details>`;
  };
  // une fiche d'effet (nourriture) ou de chose nommée par une clé : son nom lisible
  const BUFFN2 = T('BUFF_NAMES', {});
  const FILE = {
    socle: fileHas(/^11-zzz00/), alch: fileHas(/^11-zzz02/), fab: fileHas(/^11-zzz03/), livres: fileHas(/^11-zzz20/), biblio: fileHas(/^11-zzz21/), langues: fileHas(/^11-zzz22/), cartes: fileHas(/^11-zzz23/),
    chasse: fileHas(/^11-zzz30/), attelage: fileHas(/^11-zzz31/), ev: fileHas(/^11-zzz40/), divins: fileHas(/^11-zzz41/), mal: fileHas(/^11-zzz42/), temple: fileHas(/^11-zzz43/), cine: fileHas(/^11-zzz44/),
    soc: fileHas(/^11-zzz50/), lieux: fileHas(/^11-zzz51/), routines: fileHas(/^11-zzz52/), esprit: fileHas(/^11-zzz60/), nourr: fileHas(/^11-zzz61/), chien: fileHas(/^11-zzz62/), alcool: fileHas(/^11-zzz63/),
    mondes: fileHas(/^11-zzz70/), bonbons: fileHas(/^11-zzz71/), tenebres: fileHas(/^11-zzz72/), cauchemar: fileHas(/^11-zzz73/), enfers: fileHas(/^11-zzz74/), leg: fileHas(/^11-zzz80/), slender: fileHas(/^11-zzz81/), fondation: fileHas(/^11-zzz82/),
    tornade: fileHas(/^12-zzzD-tornade/), tueur: fileHas(/^12-zzzD-tueur/), lavandiere: fileHas(/^12-zzzD-esprit/), perso: fileHas(/^07-zzzzz-/), mondesModeles: fileHas(/^07-zzzzzz-/),
    vol: fileHas(/^11-zzz90/), prison: fileHas(/^11-zzz91/), sentiments: fileHas(/^11-zzz92/),
  };
  const subOf = (file) => headParts(file).sub;
  // liens différés : les fiches nouvelles se citent entre elles, dans n'importe quel ordre (résolus à la fin)
  const modRef = (file) => (file ? lk('@mod:' + file) : '');
  const SE = SYS.seuils || {};
  const freq = (n, N) => (!n ? 'pas une fois' : n * 1.5 >= N ? 'presque chaque jour' : `environ un jour sur ${nfmt(Math.round(N / n))}`);
  const JOUR = DB.derived.jour || scal('JOUR_SECONDES', null);
  const hJeu = (h) => (JOUR ? `${nfmt(h)} h de jeu (${dur(h * JOUR / 24)} réelles)` : `${nfmt(h)} h de jeu`);

  // ==== CORPS ET ESPRIT ====
  // ---- le temps : la journée, la semaine, le calendrier
  if (JOUR || SEM.length) {
    let h = `<p class="lead">Dans la vallée, une journée entière dure ${JOUR ? nfmt(Math.round(JOUR / 6) / 10) + ' minutes' : '—'} de temps réel${JOUR ? ` : une heure de jeu passe en ${nfmt(Math.round(JOUR / 24 * 10) / 10)} secondes` : ''}. La semaine compte ${SEM.length} jours, chacun avec son nom et ses habitudes.</p>`;
    if (SEM.length) h += `<table class="t">${SEM.map((D, k) => `<tr><th>${link('sem:' + k)}</th><td>${esc((D.annonce || '').replace(/^\(|\)$/g, ''))}</td></tr>`).join('')}</table>`;
    const C = SYS.calendrier;
    if (C && C.ev) {
      const EVN = { nuit_noire: 'Nuits noires', neige: 'Neige partout', soleil: 'Soleil écrasant', tornade: 'Tornades', tueur: 'L’homme au long manteau' };
      h += `<h3>Ce que réserve le calendrier</h3><p class="note">Le calendrier des événements rares se tire de la graine de la partie : un almanach peut le prédire. Fréquences mesurées sur ${nfmt(C.jours)} jours.</p><table class="t"><tr><th>Événement</th><th>Fréquence</th><th>Au plus tôt</th></tr>${Object.entries(C.ev).map(([k, e]) => `<tr><td>${lk('ev:' + k, EVN[k] || cap(humanKey(k)))}</td><td>${esc(freq(e.n, C.jours))} <small>(${e.n} fois)</small></td><td>${e.first ? 'jour ' + e.first : '—'}</td></tr>`).join('')}</table>`;
      const np = Object.values(C.prodiges || {}).reduce((a, b) => a + b, 0);
      if (np) h += `<p>Et ${lk('ev:prodiges', 'un prodige')} ${esc(freq(np, C.jours))}.</p>`;
    }
    SP('sys:journee', { t: 'Le temps qui passe', s: `Journées de ${JOUR ? nfmt(Math.round(JOUR / 6) / 10) + ' minutes' : '…'}, semaine de ${SEM.length} jours`, c: ['semaine'], i: '⌛', h }, FILE.socle);
  }
  // ---- le corps : chutes, fractures, saignements, pentes
  if (FILE.socle) {
    const g = SYS.gravite || 20, C = SYS.chutes || [];
    let h = `<p class="lead">Le corps se blesse : une chute trop haute fait mal, peut casser une jambe ou ouvrir une plaie ; on meurt d’un coup, ou petit à petit, en perdant son sang.</p>`;
    const rows = C.filter((r, i) => r.dmg > 0 || (C[i + 1] && C[i + 1].dmg > 0));
    if (rows.length) {
      h += `<h3>Les chutes</h3><table class="t"><tr><th>Hauteur</th><th>Vitesse</th><th>Blessure</th><th>Jambe cassée</th><th>Plaie qui saigne</th></tr>${rows.map((r) => `<tr><td>≈ ${nfmt(Math.round(r.v * r.v / (2 * g) * 10) / 10)} m</td><td>${nfmt(r.v)} m/s</td><td>${r.dmg ? plur(Math.round(r.dmg), 'point de vie', 'points de vie') : 'rien'}</td><td>${r.casse ? pct(r.casse) : '—'}</td><td>${r.saigne ? pct(r.saigne) + (r.debit ? ` <small>(${nfmt(Math.round(r.debit * 100) / 100)} point/s)</small>` : '') : '—'}</td></tr>`).join('')}</table>`;
      const causes = uniq(C.map((r) => r.cause).filter(Boolean));
      if (causes.length) h += `<p class="note">Sur l’avis de décès : ${causes.map((c) => `« ${esc(c)} »`).join(', ')}. (Mesuré en faisant tomber le personnage, dans le jeu lui-même ; la hauteur suppose une chute libre.)</p>`;
    }
    const j = SE.jambe && SE.jambe[0], at = SE.attelle && SE.attelle[0], bo = SE.boite;
    if (j) h += `<h3>La jambe cassée</h3><p>Elle se remet en ${hJeu(j)}${at ? ` ; avec une ${ITEMS.attelle ? IL('attelle') : 'attelle'}, en ${hJeu(at)} au plus` : ''}. En attendant, on boite${bo ? ` : ${Math.round(bo[1] * 100)} % de sa vitesse (${Math.round(bo[0] * 100)} % avec l’attelle)` : ''}, sans courir ni sauter, et la douleur revient par moments. Une seconde chute sur la jambe cassée blesse encore.</p>`;
    {
      const eg = SE.egratignure, doc = (MF[FILE.socle].mdocs || {}).saigner, dm = doc && doc.match(/\(([^()]+)\)/);
      h += `<h3>Le sang</h3><p>Une plaie fait perdre des points de vie chaque seconde${dm ? ` <small>(${esc(dm[1].replace(/(\d)\.(\d)/g, '$1,$2'))})</small>` : ''}. ${eg ? `Sous ${nfmt(eg[0])} point par seconde, elle se referme d’elle-même, lentement ; au-delà, il faut la panser.` : ''} ${ITEMS.bandage ? `Un ${IL('bandage')} arrête le sang.` : ''} On en meurt petit à petit : « mort de ses blessures, lentement ».</p>`;
    }
    const pm = OB('corps', 'PENTE_MAX'), pc = OB('corps', 'PENTE_CHEMIN'), pg = OB('corps', 'PENTE_GLISSE');
    const deg = (t) => Math.round(Math.atan(t) * 180 / Math.PI) + '°';
    if (pm) h += `<h3>Les pentes</h3><dl class="kv"><dt>Trop raide</dt><dd>au-delà de ${deg(pm)}, on ne monte plus</dd>${pc ? `<dt>Sur un chemin</dt><dd>de terre ou de pavés, on grimpe jusqu’à ${deg(pc)} (des marches y sont taillées)</dd>` : ''}${pg ? `<dt>On glisse</dt><dd>au-delà de ${deg(pg)}</dd>` : ''}</dl>`;
    const lad = INTER.filter((it) => it.kind === 'grimper');
    if (lad.length) h += `<h3>Les échelles des douves</h3><p>${plur(lad.length, 'échelle', 'échelles')} de fer dans les douves de ${esc(NAMES.ville || 'la ville')} : <kbd>E</kbd> pour se hisser jusqu’en haut. Avec une jambe cassée, on glisse souvent des barreaux. ${W.moat ? mapBtn('xy:' + Math.round(W.moat.x) + ',' + Math.round(W.moat.z), 'les douves') : ''}</p>`;
    SP('sys:corps', { t: 'Le corps', s: 'Chutes, jambe cassée, saignements, pentes', c: ['corps'], i: '✚', h }, FILE.socle);
  }
  // ---- où l'on ne bâtit pas
  if ((W.noBuild || []).length) {
    const Z = W.noBuild.slice().sort((a, b) => b[2] - a[2]);
    let h = `<p class="lead">La plupart des endroits se bâtissent. Pas les villes, les villages ni les lieux saints : on n’y construit pas, on n’y laboure pas, on n’y pose rien. ${plur(Z.length, 'zone protégée', 'zones protégées')}.</p><p>${mapBtn('couche:zones', 'Les zones sur la carte')}</p>`;
    // la zone porte le nom d'un lieu : on la relie à sa fiche quand un lieu (proche) porte ce nom
    const nn = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/^(le|la|les|l['’])\s*/, '').replace(/[^a-z ]/g, '').trim();
    const named = (why, x, z) => { const w = nn(why); if (!w) return null; const c = [...(W.lm || []), ...(W.bld || [])].filter((L) => { const n = nn(L.name); return n && (n === w || n.startsWith(w + ' ') || w.startsWith(n + ' ')) && dist(L.x, L.z, x, z) < 400; }); return c.sort((a, b) => dist(a.x, a.z, x, z) - dist(b.x, b.z, x, z))[0] || null; };
    h += `<table class="t"><tr><th>Zone</th><th>Rayon</th><th></th></tr>${Z.map(([x, z, r, why]) => { const L = named(why, x, z); return `<tr><td>${L && pages.has('li:' + L.key) ? placeLink(L.key, cap(why)) : esc(cap(why || ''))}</td><td>${Math.round(r)} m</td><td>${mapBtn('xy:' + Math.round(x) + ',' + Math.round(z), 'carte')}</td></tr>`; }).join('')}</table>`;
    SP('sys:batir', { t: 'Où l’on ne bâtit pas', s: 'Villes, villages et lieux saints', c: ['lieux'], i: '⛔', h, g: 'Règles de la vallée' });
  }
  // ---- la sacoche, le carnet, ce que le personnage sait
  {
    const files = [FILE.fab ? fileHas(/^12-zzzA/) : null, fileHas(/^12-zzzB/), fileHas(/^12-zzzL/), fileHas(/^12-zzzH/)].filter(Boolean);
    let h = FILE.socle ? intro(FILE.socle, { only: /personnage connaît|ce que le personnage/i, nolead: true }) : '';
    if (h) h = `<p class="lead">Le personnage retient ce qu’il a vu et appris ; la sacoche (<kbd>Tab</kbd>) et son carnet le gardent.</p>` + h;
    for (const f of files) { const x = intro(f, { nolead: true }), HP = headParts(f); if (x) h += `<h3>${esc(cap((HP.title || 'La sacoche') + (HP.sub ? ' : ' + HP.sub : '')))}</h3>${x}`; }
    if (h) SP('sys:savoir', { t: 'La sacoche et le carnet', s: 'Ce que le personnage sait', c: ['corps'], i: '🎒', h }, files);
  }
  // ---- la mentalité
  const changeRows = (SYS.changes || []).map((c) => {
    const raison = ((c.raison.match(/'([^']*)'/) || [])[1] || c.raison).trim() + (/\+/.test(c.raison) ? ' …' : '');
    const e = c.delta.trim();
    const branches = e.includes('?') ? e.slice(e.indexOf('?') + 1) : e;
    const nums = (branches.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
    let sign = /^-/.test(e) ? -1 : nums.length && nums.every((n) => n < 0) ? -1 : nums.length && nums.every((n) => n > 0) ? 1 : 0;
    const mags = uniq(nums.map((n) => Math.abs(n))).sort((a, b) => a - b);
    const per = /\bdh\b/.test(e) ? ' par heure' : /\bmorts\b/.test(e) ? ' par mort' : '';
    const how = /A\.k\b/.test(e) ? ' (selon la dose)' : /durete/.test(e) ? ' (et plus, selon l’abus)' : /fear/.test(e) ? ' (selon la peur)' : '';
    const sg = sign < 0 ? '−' : sign > 0 ? '+' : '±';
    const val = mags.length ? (mags.length > 1 ? `${sg}${nfmt(mags[0])} à ${sg}${nfmt(mags[mags.length - 1])}` : sg + nfmt(mags[0])) + per + how : 'variable';
    const pl = c.plafond && /^[\d.]+$/.test(c.plafond) ? +c.plafond : null;
    return { raison, sign, val, pl, file: c.file, mag: mags.length ? mags[mags.length - 1] : 0 };
  });
  if (FILE.esprit) {
    let h = intro(FILE.esprit);
    const dep = scal('ESPRIT_DEPART'), bj = scal('ESPRIT_BAISSE_JOUR'), hj = scal('ESPRIT_HAUSSE_JOUR');
    h += `<dl class="kv">${dep !== undefined ? `<dt>Au départ</dt><dd>${dep} sur 100 — jamais affichée</dd>` : ''}${bj ? `<dt>Baisse au plus</dt><dd>${bj} points par jour, toutes raisons confondues</dd>` : ''}${hj ? `<dt>Remonte au plus</dt><dd>${hj} points par jour</dd>` : ''}</dl>`;
    const tab = (rows) => `<table class="t"><tr><th>Quoi</th><th>Effet</th><th>Plafond du jour</th><th>Voir</th></tr>${rows.map((r) => `<tr><td>${esc(cap(r.raison))}</td><td>${esc(r.val)}</td><td>${r.pl ? nfmt(r.pl) : '—'}</td><td><small>${r.file === FILE.esprit ? '' : modRef(r.file)}</small></td></tr>`).join('')}</table>`;
    const dn = changeRows.filter((r) => r.sign < 0).sort((a, b) => b.mag - a.mag), up = changeRows.filter((r) => r.sign > 0).sort((a, b) => b.mag - a.mag), var_ = changeRows.filter((r) => !r.sign);
    if (dn.length) h += `<h3>Ce qui la fait baisser</h3>` + tab(dn);
    if (up.length) h += `<h3>Ce qui la fait remonter</h3>` + tab(up);
    if (var_.length) h += `<h3>Selon les cas</h3>` + tab(var_);
    // ce qu'on en voit
    const EP = U('ESPRIT_PENSEES', {}), EC = U('ESPRIT_CARNET', []), FP = U('FAIM_PHRASES', {});
    const md = MF[FILE.esprit].mdocs || {};
    const sig = [];
    if (SE.voile) sig.push([SE.voile[0], cleanText(md.voile || 'les couleurs s’éteignent un peu')]);
    for (const [t, v] of SYS.signes || []) sig.push([v, t]);
    if (SE.pensees) { sig.push([SE.pensees[1], 'des pensées sombres, de temps en temps']); sig.push([SE.pensees[0], 'des pensées très sombres']); }
    if (sig.length) h += `<h3>Ce qu’on en voit</h3><table class="t">${sig.sort((a, b) => b[0] - a[0]).map(([v, t]) => `<tr><th>sous ${v}</th><td>${esc(cap(t))}</td></tr>`).join('')}${SE.pensees ? `<tr><th>au-dessus de ${SE.pensees[2]}</th><td>des pensées heureuses, parfois</td></tr>` : ''}</table>`;
    if (EP.haut || EP.bas || EP.tres_bas) h += `<h3>Les pensées</h3>${EP.haut ? `<h4>Quand tout va bien</h4>${quotes(EP.haut)}` : ''}${EP.bas ? `<h4>Quand elle baisse</h4>${quotes(EP.bas)}` : ''}${EP.tres_bas ? `<h4>Quand elle s’effondre</h4>${quotes(EP.tres_bas)}` : ''}`;
    if (EP.descend || EP.remonte) h += `<h3>Les seuils franchis</h3><table class="t">${Object.entries(EP.descend || {}).sort((a, b) => b[0] - a[0]).map(([v, t]) => `<tr><th>passe sous ${v}</th><td>${FILL(t.replace(/^\(|\)$/g, ''))}</td></tr>`).join('')}${Object.entries(EP.remonte || {}).sort((a, b) => a[0] - b[0]).map(([v, t]) => `<tr><th>remonte à ${v}</th><td>${FILL(t.replace(/^\(|\)$/g, ''))}</td></tr>`).join('')}</table>`;
    if (EP.agite || EP.repose) h += `<h3>Le sommeil</h3>${EP.agite ? `<h4>Agité</h4>${quotes(EP.agite)}` : ''}${EP.repose ? `<h4>Reposé</h4>${quotes(EP.repose)}` : ''}${EP.ventre_vide ? `<h4>Le ventre vide</h4>${quotes([EP.ventre_vide])}` : ''}`;
    if (EC.length) h += `<h3>Ce que dit le carnet</h3><p class="note">Jamais un chiffre : une ligne, en tête du carnet.</p><table class="t">${EC.map(([v, t]) => `<tr><th>${v >= 0 ? 'au-dessus de ' + v : 'plus bas encore'}</th><td>${FILL(t)}</td></tr>`).join('')}</table>`;
    if (SYS.bizarre && SYS.bizarre.length) {
      const b = (MF[FILE.esprit].blocks || []).find((x) => /bizarrerie|étrange/i.test(x.text));
      h += `<h3>L’étrange suit l’esprit</h3>${b ? `<p>${esc(cap(decap(cleanText(b.text))))}</p>` : ''}<p class="note">Les hasards de l’étrange (nuits rouges, apparitions, événements, prodiges…) sont multipliés :</p><table class="t"><tr><th>Mentalité</th>${SYS.bizarre.map(([v]) => `<td>${v}</td>`).join('')}</tr><tr><th>L’étrange</th>${SYS.bizarre.map(([, x]) => `<td>×${nfmt(x)}</td>`).join('')}</tr></table>`;
    }
    if (Object.keys(FP).length) {
      const fs2 = SE.faim || [];
      h += `<h3>La faim</h3><p>Le ventre vide fait battre le cœur et coupe le souffle : l’endurance s’effondre, puis le cœur cogne.</p><table class="t">${[['creux', fs2[2]], ['faim', fs2[1]], ['famine', fs2[0]]].filter(([k]) => FP[k]).map(([k, v]) => `<tr><th>${v !== undefined ? 'nourriture sous ' + v : esc(k)}</th><td>${quotes(FP[k])}</td></tr>`).join('')}</table>`;
    }
    SP('sys:esprit', { t: 'La mentalité', s: 'L’esprit du personnage, qu’on ne voit jamais', c: ['corps'], i: '☁', h }, FILE.esprit);
  }
  // ---- ce qu'on mange : les effets
  const EF = T('EFFETS', {}), AE = T('ALIMENTS_EFFETS', {});
  const effName = (k) => { const e = EF[k]; if (e && e.buff && BUFFN2[e.buff]) return BUFFN2[e.buff]; return cap(humanKey(k)); };
  const effLine = (r) => {
    const [k, p, d0, d1, I, u0, u1] = r, e = EF[k] || {};
    const du = u0 ? span2(u0, u1, dur) : e.dur ? span2(e.dur[0], e.dur[1], dur) : '';
    return `${lk('eff:' + k, effName(k))} <small>${pct(p)}${d0 !== undefined ? `, après ${span2(d0, d1, dur)}` : ''}${I ? `, force ${I}` : ''}${du && !e.instant ? `, pendant ${du}` : ''}</small>`;
  };
  if (FILE.nourr && Object.keys(EF).length) {
    U('EFFETS'); U('ALIMENTS_EFFETS');
    const AG = U('ALIMENTS_GENERIQUES', {}), MN = U('MAL_NUIT', {});
    let h = intro(FILE.nourr);
    const doc = docOf('ALIMENTS_EFFETS');
    if (doc) h += `<p class="note">Pour chaque effet : la chance qu’il arrive, le délai avant qu’il se déclare, sa force et sa durée (en temps réel).</p>`;
    const ids = Object.keys(AE).sort((a, b) => iname(a).localeCompare(iname(b), 'fr'));
    h += `<h3>Aliment par aliment</h3><table class="t"><tr><th>Ce qu’on mange</th><th>Ce que ça peut faire</th><th>S’il tue</th></tr>${ids.map((id) => `<tr><td>${IL(id)}${ITEMS[id] && ITEMS[id].raw ? ' <span class="tag">cru</span>' : ''}</td><td>${(AE[id].r || []).map(effLine).join('<br>')}</td><td><small>${AE[id].c ? 'empoisonné par ' + esc(AE[id].c) : ''}</small></td></tr>`).join('')}</table>`;
    if (Object.keys(AG).length) h += `<h3>Tout ce qui est cru</h3><table class="t">${Object.entries(AG).map(([k, a]) => `<tr><th>${esc(cap(a.c || humanKey(k)))}</th><td>${(a.r || []).map(effLine).join('<br>')}</td></tr>`).join('')}</table>`;
    if (Object.keys(MN).length) h += `<h3>La nuit d’après</h3><p>S’endormir malade gâte la nuit :</p>${quotes(Object.values(MN))}`;
    h += `<h3>Les effets</h3><ul class="cards">${Object.keys(EF).map((k) => `<li>${lk('eff:' + k, effName(k))}</li>`).join('')}</ul>`;
    SP('sys:nourriture', { t: 'Ce qu’on mange', s: 'Plantes, baies, champignons, viandes, poissons : leurs effets', c: ['corps'], i: '🍄', h }, FILE.nourr);
    for (const [k, e] of Object.entries(EF)) {
      let x = `<dl class="kv"><dt>Durée</dt><dd>${e.instant ? 'immédiat' : e.dur ? span2(e.dur[0], e.dur[1], dur) + ' (temps réel)' : '—'}</dd>${e.buff && BUFFN2[e.buff] !== effName(k) ? `<dt>Même effet que</dt><dd>${esc(BUFFN2[e.buff] || e.buff)} <small>(comme une potion)</small></dd>` : ''}${e.mal ? `<dt>La nuit d’après</dt><dd>${FILL(String(MN[e.mal] || '').replace(/^\(|\)$/g, ''))}</dd>` : ''}</dl>`;
      if (e.debut) x += `<h3>Ce qu’on ressent</h3>${quotes([].concat(e.debut))}`;
      if (e.fin) x += `<h3>Quand ça passe</h3>${quotes([e.fin])}`;
      const by = [];
      for (const [id, a] of Object.entries(AE)) for (const r of a.r || []) if (r[0] === k) by.push([id, r]);
      for (const [id, a] of Object.entries(AG)) for (const r of a.r || []) if (r[0] === k) by.push(['@' + (a.c || id), r]);
      if (by.length) x += `<h3>Ce qui le provoque</h3><table class="t">${by.sort((a, b) => b[1][1] - a[1][1]).map(([id, r]) => `<tr><td>${id.startsWith('@') ? esc(cap(id.slice(1))) : IL(id)}</td><td>${pct(r[1])}${r[2] !== undefined ? `, après ${span2(r[2], r[3], dur)}` : ''}</td></tr>`).join('')}</table>`;
      x += `<p>${lk('sys:nourriture', 'Tout ce qu’on mange')}</p>`;
      SP('eff:' + k, { t: effName(k), s: 'Effet de ce qu’on mange', c: ['corps'], i: '✺', h: x, g: 'Effets' });
    }
  }
  // ---- le chien
  if (FILE.chien) {
    const CR = U('CHIEN_REPAS', {}), CN = U('CHIEN_NOMS', []);
    let h = intro(FILE.chien);
    if (FIG['an:dog']) h = figInline(figRect('an:dog'), 90, '', '#/p/an%3Adog') + h;
    const md = MF[FILE.chien].mdocs || {}, st = SE.chienStades, mort = SE.chienMort;
    if (st || md.stade) h += `<h3>La faim du chien</h3>${st ? `<table class="t"><tr><th>${st[2]} h sans manger</th><td>il a faim : il gémit, il réclame</td></tr><tr><th>${st[1]} h</th><td>il maigrit</td></tr><tr><th>${st[0]} h</th><td>il se couche et ne se relève plus</td></tr>${mort ? `<tr><th>${mort[0]} h</th><td><b class="warn">il meurt</b></td></tr>` : ''}</table>` : `<p>${esc(cleanText(md.stade))}</p>`}<p class="note">Des heures de jeu : ${JOUR ? `${mort ? mort[0] : 72} h, c’est ${dur((mort ? mort[0] : 72) * JOUR / 24)} de temps réel` : ''}.</p>`;
    if (Object.keys(CR).length) h += `<h3>Ce qui le nourrit</h3><p class="note">${esc(cleanText(docOf('CHIEN_REPAS')) || 'Heures de ventre plein.')}</p><table class="t"><tr><th>À manger</th><th>Ventre plein</th></tr>${Object.entries(CR).sort((a, b) => b[1] - a[1]).map(([id, n]) => `<tr><td>${IL(id)}</td><td>${n} h</td></tr>`).join('')}</table>`;
    const its = MF[FILE.chien].items.filter((i) => ITEMS[i]);
    if (its.length) h += `<h3>Pour le chien</h3><p>${ILs(its)}</p>`;
    const ch = changeRows.filter((r) => r.file === FILE.chien);
    if (ch.length) h += `<h3>Sur le moral de son maître</h3><ul>${ch.map((r) => `<li>${esc(cap(r.raison))} : ${esc(r.val)}</li>`).join('')}</ul>`;
    if (CN.length) h += `<h3>Des noms de chien</h3><p>${tagList(CN)}</p>`;
    SP('sys:chien', { t: 'Le chien', s: 'Le nourrir, le commander, le garder en vie', c: ['corps'], i: '🐕', h }, FILE.chien);
  }
  // ---- l'alcool
  if (FILE.alcool) {
    const AL = U('ALCOOLS', []), AP = U('ALCOOL_PALIERS', []);
    let h = intro(FILE.alcool);
    const how = (id) => {
      const out = [];
      for (const [m, list] of Object.entries(MACHINES)) for (const e of list || []) if (e.out && e.out[0] === id) out.push(`${esc(machName(m))} : ${needList(e.in)} <small>(${nfmt(e.h)} h)</small>`);
      for (const r of RECIPES) if (r.out === id) out.push(`${esc(cap(stationName(r.st)))} : ${needList(r.need)}`);
      for (const s of (SRC[id] || []).filter((q) => q.k === 'shop')) out.push(`chez ${npcLink(s.npc)} <small>${nfmt(s.price)} pièces</small>`);
      return uniq(out);
    };
    if (AL.length) h += `<h3>Les boissons</h3><table class="t"><tr><th>Boisson</th><th>Force</th><th>Comment l’avoir</th><th>Ce qu’elle fait aussi</th></tr>${AL.map((id) => `<tr><td>${IL(id)}</td><td>${ITEMS[id] && ITEMS[id].alcool ? nfmt(ITEMS[id].alcool) + ' ' + (ITEMS[id].alcool > 1 ? 'unités' : 'unité') : ''}</td><td><small>${how(id).join('<br>')}</small></td><td>${AE[id] ? (AE[id].r || []).map(effLine).join('<br>') : ''}</td></tr>`).join('')}</table>`;
    const iv = SE.ivresse;
    if (iv || AP.length) h += `<h3>L’ivresse</h3><table class="t">${AP.map((ph, i) => (ph ? `<tr><th>${iv ? `${nfmt(iv[3 - i])} unités dans le sang` : 'palier ' + i}</th><td>${quotes([].concat(ph))}</td></tr>` : '')).join('')}${scal('ALCOOL_COMA') ? `<tr><th>${nfmt(scal('ALCOOL_COMA'))} unités</th><td><b class="warn">${esc(cleanText(SYS.scal.ALCOOL_COMA.doc || 'on tombe'))}</b> : le coma, parfois mortel</td></tr>` : ''}</table>`;
    if (scal('ALCOOL_ELIM')) h += `<p class="note">Le corps élimine ${nfmt(scal('ALCOOL_ELIM'))} unité par seconde réelle : une chope (1 unité) passe en ${dur(1 / scal('ALCOOL_ELIM'))}.</p>`;
    if (MACHINES.alambic_cru) h += `<h3>L’alambic du bouilleur de cru</h3><p>${IL('alambic_cru')} ${MACHINE_HINT.alambic_cru ? '— ' + esc(MACHINE_HINT.alambic_cru) : ''}</p><table class="t"><tr><th>On y met</th><th>On obtient</th><th>Temps</th></tr>${MACHINES.alambic_cru.map((e) => `<tr><td>${needList(e.in)}</td><td>${IL(e.out[0], e.out[1])}</td><td>${nfmt(e.h)} h</td></tr>`).join('')}</table>`;
    SP('sys:alcool', { t: 'L’alcool', s: 'Boissons, alambic, ivresse, gueule de bois', c: ['corps'], i: '🍷', h }, FILE.alcool);
  }

  // ==== FABRICATION ET ALCHIMIE ====
  if (FILE.fab) {
    let h = intro(FILE.fab);
    const base = [...CRAFT_BASE].filter((id) => ITEMS[id]);
    if (base.length) h += `<h3>Connues dès le départ</h3><p>${ILs(base.sort((a, b) => iname(a).localeCompare(iname(b), 'fr')))}</p>`;
    const LEC = OB('fabrication', 'LECONS', {});
    if (Object.keys(LEC).length) {
      const free = SE.lecons && SE.lecons[0];
      h += `<h3>Les gens de métier</h3><p class="note">Une leçon par jour et par habitant, quand on se connaît assez${free ? ` ; à l’amitié ${free}, ils n’en demandent plus rien` : ''}.</p><table class="t"><tr><th>Qui</th><th>Enseigne</th><th>Amitié</th><th>Prix</th></tr>${Object.entries(LEC).map(([n, list]) => (list || []).map((e, i) => `<tr>${i === 0 ? `<td rowspan="${list.length}">${npcLink(n)}</td>` : ''}<td>${IL(e[0])}</td><td>${e[1] || 0}</td><td>${e[2] ? nfmt(e[2]) + ' pièces' : 'rien'}</td></tr>`).join('')).join('')}</table>`;
    }
    const books = Object.entries(LIVRES).filter(([, L]) => (L.recettes || []).length);
    if (books.length) h += `<h3>Les livres qui enseignent</h3><ul>${books.map(([b, L]) => `<li>${IL('livre_' + b)} : ${ILs(L.recettes)}</li>`).join('')}</ul>`;
    const qr = NPCS.flatMap((d) => (d.quests || []).filter((q) => q.reward && q.reward.recette).map((q) => [d, q]));
    if (qr.length) h += `<h3>En récompense</h3><ul>${qr.map(([d, q]) => `<li>${IL(q.reward.recette)} : quête « ${esc(q.title)} » de ${npcLink(d.id)}</li>`).join('')}</ul>`;
    h += `<p>${link('cat:recettes', 'Toutes les recettes')}</p>`;
    SP('sys:fabrication', { t: 'L’établi d’assemblage', s: 'Fabriquer sans liste : assembler, découvrir, retenir', c: ['recettes'], i: '⚒', h }, FILE.fab);
  }
  if (FILE.alch) {
    const V = SYS.vrai || {}, REM = OB('alchimie', 'REM', {}), DIT = OB('alchimie', 'DIT', {});
    if (Object.keys(V).length) {
      let h = intro(FILE.alch, { only: /identifier|allure|nommée|nom/i });
      h += `<p class="note">Tant qu’elle n’a pas été nommée, une plante cueillie ne porte que son allure : on ne sait pas ce qu’on mange.</p>`;
      const ids = Object.keys(V).sort((a, b) => V[a].name.localeCompare(V[b].name, 'fr'));
      h += `<table class="t"><tr><th>Ce qu’on en voit</th><th>Ce que c’est</th><th>Ce qu’en dit l’alchimiste</th></tr>${ids.map((id) => `<tr><td><b>${esc(V[id].allure)}</b><br><small>${FILL(V[id].allureDesc || '')}</small></td><td>${IL(id)}</td><td><small>${REM[id] ? FILL(REM[id]) : ''}</small></td></tr>`).join('')}</table>`;
      if (DIT.intro) h += `<h3>L’alchimiste, au travail</h3>${quotes(DIT.intro, 'alchimiste')}`;
      SP('sys:identification', { t: 'Les plantes à faire nommer', s: 'L’alchimiste de la ville les identifie', c: ['alchimie'], i: '🔍', h }, FILE.alch);
      // sur la fiche de chaque plante : son allure
      for (const id of ids) if (pages.has('it:' + id)) { const p = P('it:' + id); p.h = `<p class="note">Sans l’avoir fait nommer, on n’en connaît que l’allure : <b>${esc(V[id].allure)}</b>. ${lk('sys:identification', 'Les plantes à faire nommer')}</p>` + (REM[id] ? `<h3>Ce qu’en dit l’alchimiste</h3>${quote(REM[id], 'alchimiste')}` : '') + p.h; }
    }
    let h = intro(FILE.alch, { skip: /identifier|allure|nommée/i });
    const NV = [].concat(OB('alchimie', 'NOUVELLES', [])).filter((id) => ITEMS[id] || POTIONS[id]);
    if (NV.length) h += `<h3>Les potions nouvelles</h3><table class="t"><tr><th>Potion</th><th>Effet</th><th>Durée</th></tr>${NV.map((id) => `<tr><td>${IL(id)}</td><td>${FILL((POTIONS[id] && POTIONS[id].desc) || (ITEMS[id] && ITEMS[id].desc) || '')}</td><td>${POTIONS[id] && POTIONS[id].h ? nfmt(POTIONS[id].h) + ' h' : '—'}</td></tr>`).join('')}</table>`;
    const FO = OB('alchimie', 'FORCE', {}), BA = OB('alchimie', 'BETES_APPAT', []), TR = OB('alchimie', 'TRACES', {});
    let s = '';
    if (Object.keys(FO).length) s += `<h3>La force qu’il faut</h3><p class="note">Les potions rares de la table ne sortent que si les deux essences dominantes, ensemble, pèsent au moins :</p><table class="t">${Object.entries(FO).sort((a, b) => b[1] - a[1]).map(([id, n]) => `<tr><td>${IL(id)}</td><td>${n}</td></tr>`).join('')}</table>`;
    if (BA.length) s += `<h3>L’appât empoisonné attire</h3><p>${BA.map((k) => (pages.has('an:' + k) ? link('an:' + k) : esc(k))).join(', ')}</p>`;
    if (Object.keys(TR).length) s += `<h3>Ce que les morts se rappellent de leur assassin</h3><p class="note">Le philtre des morts, ou un rêve, en laisse deviner autant :</p><table class="t">${Object.entries(TR).map(([n, t]) => `<tr><th>${n === 'defaut' ? 'les autres' : npcLink(n)}</th><td>${FILL(t)}</td></tr>`).join('')}</table>`;
    if (s) h += SEC(s, 'Les seuils de la table, les appâts et les souvenirs des morts sont masqués (secrets).');
    h += `<p>${link('alch:regles', 'Les essences et leurs combinaisons')} <small>(secrets)</small></p>`;
    SP('sys:table-alchimie', { t: 'La table d’alchimiste', s: 'Mêler à l’aveugle, noter ce qu’on a essayé', c: ['alchimie'], i: '⚗', h }, FILE.alch);
  }

  // ==== CHASSE ET ATTELAGE ====
  if (FILE.chasse) {
    const F = U('CHASSE_FUSIL', {}), GI = U('CHASSE_GIBIER', []), DG = U('CHASSE_DANGER', {}), BO = U('CHASSE_BONUS', {}), PR = U('CHASSE_PRISES', {}), GR = U('CHASSE_GROS', []), NO = U('CHASSE_NOMS', {});
    U('CHASSE_VEGETATION'); U('CHASSE_CALME');
    const an = (k) => (pages.has('an:' + k) ? link('an:' + k, cap(NO[k] ? NO[k].replace(/^(le|la|l’|les) ?/, '') : animalName(k))) : esc(NO[k] || k));
    let h = intro(FILE.chasse, { only: /fusil|dépouille|appeau/i });
    if (Object.keys(F).length) {
      const L = { portee: ['Portée', (v) => v + ' m'], degats: ['Dégâts au corps', (v) => v + ' points'], rearme: ['Réarmer', (v) => nfmt(v) + ' s'], zoom: ['Grossissement de la lunette', (v) => '×' + nfmt(Math.round(1 / v * 10) / 10)] };
      h += `<h3>Le fusil à lunette</h3><dl class="kv">${Object.entries(F).filter(([k]) => L[k]).map(([k, v]) => `<dt>${esc(L[k][0])}</dt><dd>${esc(L[k][1](v))}</dd>`).join('')}</dl>${docOf('CHASSE_FUSIL') ? `<p class="note">${esc(cap(cleanText(docOf('CHASSE_FUSIL'))))}.</p>` : ''}<p>${ILs(['fusil', 'cartouche', 'lunette', 'canon_fusil'].filter((i) => ITEMS[i]))}</p>`;
    }
    if (Object.keys(BO).length) h += `<h3>Les dépouilles</h3><p class="note">${esc(cap(cleanText(docOf('CHASSE_BONUS')) || 'En plus de ce que donne la bête'))} :</p><table class="t">${Object.entries(BO).map(([k, a]) => `<tr><th>${an(k)}</th><td>${a.map((e) => IL(e[0]) + ` <small>${span2(e[1], e[2])}${e[3] ? ', ' + pct(e[3]) : ''}</small>`).join(', ')}</td></tr>`).join('')}</table>`;
    if (GR.length) h += `<h3>Le gros gibier</h3><p>${GR.map(an).join(', ')}</p>`;
    SP('sys:chasse', { t: 'La chasse au fusil', s: 'Viser, tirer, dépecer', c: ['chasse'], i: '⌖', h }, FILE.chasse);
    let hp = intro(FILE.chasse, { only: /pièges à loup/i });
    if (Object.keys(PR).length) hp += `<h3>Ce qui se prend, la nuit</h3><p class="note">${esc(cap(cleanText(docOf('CHASSE_PRISES'))))}.</p><table class="t">${Object.entries(PR).map(([m, a]) => `<tr><th>${HAB[m] ? `<a class="tag hab" href="#/p/${encodeURIComponent('mil:' + m)}">${esc(HAB[m])}</a>` : esc(m)}</th><td>${a.map(an).join(', ')}</td></tr>`).join('')}</table>`;
    if (ITEMS.piege_loup) hp = `<p>${IL('piege_loup')}</p>` + hp;
    SP('sys:pieges', { t: 'Les pièges à loup', s: 'Pour les bêtes… et pour qui ne regarde pas où il marche', c: ['chasse'], i: '⚙', h: hp }, FILE.chasse);
    let hd = intro(FILE.chasse, { only: /dangereuses|ours|sanglier/i });
    if (Object.keys(DG).length) {
      const LBL = { alerte: ['Vous remarque à', (v) => v + ' m'], proche: ['Trop près', (v) => v + ' m'], patience: ['Patience', (v) => v + ' s'], surprise: ['Surprise à', (v) => v + ' m'], pSurprise: ['Charge si surpris', pct], pProche: ['Charge si on reste trop près', pct], pPetits: ['Charge si ses petits sont là', pct], pBlesse: ['Charge s’il est blessé', pct], pChasseur: ['Charge pendant les battues', pct], portee: ['Portée de ses coups', (v) => nfmt(v) + ' m'], degats: ['Blessure', (v) => span2(v[0], v[1]) + ' points'], saigne: ['Saignement', (v) => span2(v[0], v[1], nfmt) + ' point/s'], coupsMax: ['Coups, au plus', (v) => v], cause: ['Sur l’avis de décès', (v) => '« ' + v + ' »'] };
      for (const [k, d] of Object.entries(DG)) hd += `<h3>${an(k)}</h3>${figInline(figRect('an:' + k), 90)}<dl class="kv">${Object.entries(d).map(([q, v]) => `<dt>${esc((LBL[q] || [humanKey(q)])[0])}</dt><dd>${esc((LBL[q] ? LBL[q][1] : (x) => JSON.stringify(x))(v))}</dd>`).join('')}</dl>`;
    }
    SP('sys:dangers', { t: 'Les bêtes dangereuses', s: 'Elles n’attaquent que menacées', c: ['chasse'], i: '⚠', h: hd }, FILE.chasse);
    let hc = intro(FILE.chasse, { only: /chasseurs|chassedi|accident/i });
    if (GI.length) hc += `<h3>Le gibier des battues</h3><p class="note">${esc(cap(cleanText(docOf('CHASSE_GIBIER'))))}.</p><p>${GI.map(an).join(', ')}</p>`;
    if (ITEMS.brassard_rouge) hc += `<h3>Pour ne pas être pris pour un chevreuil</h3><p>${IL('brassard_rouge')} — ${FILL(ITEMS.brassard_rouge.desc || '')}</p>`;
    if (SEM.some((J) => J.cle === 'chasse')) hc += `<p>Le jour de la chasse : ${link('sem:' + SEM.findIndex((J) => J.cle === 'chasse'))}.</p>`;
    hc += (NPC_BY.chasseur ? `<p>${npcLink('chasseur')}</p>` : '');
    SP('sys:chasseurs', { t: 'Les chasseurs du Chassedi', s: 'Battues, coups de feu au loin, et parfois l’accident', c: ['chasse'], i: '🎯', h: hc }, FILE.chasse);
  }
  if (FILE.attelage) {
    const A = U('ATTELAGE', {});
    let h = intro(FILE.attelage);
    const L = { cap: ['Chargement', (v) => v + ' objets au plus'], vitesse: ['Allure, attelé', (v) => Math.round(v * 100) + ' % de celle du cheval'], vitesseChargee: ['Allure, chargé', (v) => Math.round(v * 100) + ' %'] };
    const rows = Object.entries(A).filter(([k]) => L[k]);
    if (rows.length) h += `<dl class="kv">${rows.map(([k, v]) => `<dt>${L[k][0]}</dt><dd>${esc(L[k][1](v))}</dd>`).join('')}</dl>`;
    const its = ['harnais', 'charrette', 'roue', 'selle'].filter((i) => ITEMS[i]);
    if (its.length) h += `<h3>Ce qu’il faut</h3><p>${ILs(its)}</p>`;
    if (pages.has('an:horse')) h += `<p>${link('an:horse')}${pages.has('an:donkey') ? ', ' + link('an:donkey') : ''}</p>`;
    SP('sys:attelage', { t: 'La charrette attelée', s: 'Un cheval, un harnais, une charrette', c: ['chasse'], i: '🛒', h }, FILE.attelage);
  }

  // ==== LIVRES, BIBLIOTHÈQUE, CARTES, LANGUES ====
  if (FILE.livres) {
    const h = intro(FILE.livres);
    if (h) SP('sys:livres', { t: 'Lire', s: 'Le lecteur de livres', c: ['livres'], i: '📖', h: h + `<p>${link('cat:livres', 'Tous les livres')}</p>` }, FILE.livres);
  }
  if (FILE.biblio) {
    const B = U('BIBLIO', {});
    let h = intro(FILE.biblio, { secret: /rayonnage du fond|archives|passage/i });
    const sr = figRect('look:SORCIER_LOOK');
    if (sr) h = figInline(sr, 110, 'Le sorcier') + h;
    const CAT = SYS.biblioCat || [];
    if (CAT.length) {
      const pub = CAT.filter((e) => e.genre !== 'Réserve'), res = CAT.filter((e) => e.genre === 'Réserve');
      const tab = (a) => `<table class="t"><tr><th>Titre</th><th>Rayon</th>${(a[0].prix || []).map(([j]) => `<th>${j} ${j > 1 ? 'jours' : 'jour'}</th>`).join('')}</tr>${a.map((e) => `<tr><td>${IL(e.item)}</td><td><small>${esc(e.genre)}</small></td>${(e.prix || []).map(([, p]) => `<td>${nfmt(p)}</td>`).join('')}</tr>`).join('')}</table>`;
      h += `<h3>Emprunter</h3><p class="note">Payé d’avance, à rendre avant ${B.heure ? B.heure + ' h' : 'la fermeture'} le dernier jour${B.max ? ` ; ${B.max} emprunts à la fois, au plus` : ''}. Prix en pièces.</p>` + tab(pub);
      if (res.length) h += SEC(`<h3>La réserve</h3>${tab(res)}`, 'La réserve de la bibliothèque est masquée (secrets).');
    }
    if ((B.saints || []).length) h += `<h3>La terre bénite</h3><p class="note">Là où le sorcier n’entre pas :</p><ul class="cards">${B.saints.map(([k, r]) => `<li>${pages.has('li:' + k) ? placeLink(k) : esc(k)} <small>${r} m</small></li>`).join('')}</ul>`;
    if ((B.phrases || []).length) {
      const lang = LANG.aelin ? 'aelin' : Object.keys(LANG)[0];
      const gloss = (t) => t.split(/\s+/).filter((m) => m && m !== ',').map((m) => { const s = ((LANG[lang] || {}).lex || {})[m] || ((LANG[lang] || {}).lex || {})[m.replace(/^na-/, '')]; return `<span class="gloss"><b>${esc(m)}</b><small>${esc(s || '?')}</small></span>`; }).join(' ');
      h += `<h3>Ce que murmure le sorcier</h3>${B.phrases.map((t) => `<div class="inscr"><canvas class="glyph" data-lang="${esc(lang)}" data-text="${esc(t)}" data-size="16"></canvas><p><i>${esc(t)}</i></p>${SEC(`<p>${gloss(t)}</p>`, false)}</div>`).join('')}<p class="sec-note">Le mot à mot est masqué (secrets).</p>`;
    }
    if (pages.has('li:bibliotheque')) h += `<p>${placeLink('bibliotheque')} · ${NPC_BY.libraire ? npcLink('libraire') : ''}</p>`;
    SP('sys:bibliotheque', { t: 'La grande bibliothèque', s: 'Emprunter, rendre à temps… ou le sorcier', c: ['livres'], i: '🏛', h }, FILE.biblio);
  }
  if (FILE.cartes) {
    const SYM = U('CARTES_SYM', {}), ZO = U('CARTES_ZONES', []), VI = U('CARTES_VILLE', []);
    U('CARTES_CONIF');
    let h = intro(FILE.cartes);
    const bySym = {};
    for (const [k, s] of Object.entries(SYM)) (bySym[s] || (bySym[s] = [])).push(k);
    if (Object.keys(bySym).length) h += `<h3>Les symboles</h3><p class="note">Un lieu ne figure sur une carte que si le personnage le connaît, à une place approximative.</p><table class="t">${Object.entries(bySym).map(([s, ks]) => `<tr><th>${esc(humanKey(s))}</th><td>${ks.map((k) => (pages.has('li:' + k) ? placeLink(k) : esc(humanKey(k)))).join(', ')}</td></tr>`).join('')}</table>`;
    if (ZO.length) h += `<h3>Les étendues dessinées</h3><p>${ZO.map((k) => (pages.has('li:' + k) ? placeLink(k) : esc(humanKey(k)))).join(', ')}</p>`;
    if (VI.length) h += `<h3>Sur le panneau de la ville</h3><p>${VI.map((k) => (pages.has('li:' + k) ? placeLink(k) : esc(humanKey(k)))).join(', ')}</p>`;
    h += `<h3>Les cartes à acheter</h3><ul class="cards">${Object.keys(CARTES).filter((k) => ITEMS['carte_' + k]).map((k) => `<li>${IL('carte_' + k)}</li>`).join('')}</ul>`;
    SP('sys:cartes', { t: 'Les cartes approximatives', s: 'Jamais la vallée entière', c: ['cartes'], i: '🗺', h }, FILE.cartes);
  }
  if (FILE.langues) {
    let h = intro(FILE.langues);
    const NM = T('NAINS_MOTS', {});
    if (Object.keys(LANG).length) h += `<h3>Les langues</h3><ul class="cards">${Object.keys(LANG).map((k) => `<li>${link('lg:' + k)}</li>`).join('')}</ul>`;
    if (Object.keys(NM).length) { used.add('NAINS_MOTS'); h += SEC(`<h3>Ce que les nains enseignent</h3>${Object.entries(NM).map(([lg, ws]) => `<p><b>${LANG[lg] ? link('lg:' + lg) : esc(lg)}</b> : ${ws.map((w) => `<span class="tag">${esc(w)}</span>`).join(' ')}</p>`).join('')}`, 'Les mots que les nains enseignent sont masqués (secrets).'); }
    const GM = T('GEANTS_MOTS', []);
    if (GM.length) { used.add('GEANTS_MOTS'); h += `<h3>Les mots des géants</h3><p>${GM.map((w) => `<span class="tag">${esc(w)}</span>`).join(' ')}</p>`; }
    SP('sys:langues', { t: 'Apprendre les langues perdues', s: 'Pierres gravées, lexiques, leçons', c: ['langues'], i: 'ᚨ', h }, FILE.langues);
  }

  // ==== SOCIÉTÉ ====
  const sayPair = (a, lang) => { // [texte en langue perdue, sens] (ou [langue, texte, sens])
    const [lg, t, s] = a.length >= 3 ? a : [lang || null, a[0], a[1]];
    return `<div class="say">${lg && LANG[lg] ? `<canvas class="glyph" data-lang="${esc(lg)}" data-text="${esc(t)}" data-size="10"></canvas>` : ''}<p><i>${esc(t)}</i>${lg && LANG[lg] ? ` <small>(${link('lg:' + lg)})</small>` : ''}<br>${esc(s || '')}</p></div>`;
  };
  if (FILE.soc) {
    const CD = U('CRIME_DEF', {}), VG = U('SOC_VILLAGES', []), CA = U('SOC_CAUSES', {}), MA = U('SOC_MALADE', []), RE = U('SOC_REMEDES', []), NM = U('SOC_NOUVELLES_MORT', []), SU = U('SOC_SUCCESSION', {}), RP = U('SOC_REPRISE', {});
    U('SOC_CHASSEUR_LOOK');
    let h = intro(FILE.soc, { only: /mort|définitive|scellés/i });
    if (Object.keys(CA).length) h += `<h3>Comment on meurt, dans la vallée</h3><p class="note">Ce qu’en dit le faire-part.</p><table class="t">${Object.entries(CA).map(([k, v]) => `<tr><th>${esc(humanKey(k))}</th><td>${esc([].concat(v)[0] || '')}</td></tr>`).join('')}</table>`;
    if (MA.length) h += `<h3>La maladie</h3>${quotes(MA)}${RE.length ? `<p>Ce qui peut guérir un malade : ${ILs(RE)}.</p>` : ''}`;
    if (NM.length) h += `<h3>Les nouvelles vont vite</h3>${quotes(NM)}`;
    if (Object.keys(SU).length) h += `<h3>Qui reprend quoi</h3><p class="note">Quand un habitant meurt, son rôle passe à un autre, et son commerce est repris.</p><table class="t"><tr><th>Mort</th><th>Remplacé par</th><th>Commerce repris</th></tr>${Object.keys(Object.assign({}, SU, RP)).map((n) => `<tr><td>${NPC_BY[n] ? npcLink(n) : esc(n)}</td><td>${(SU[n] || []).map((x) => (NPC_BY[x] ? npcLink(x) : esc(x))).join(', ')}</td><td>${(RP[n] || []).map(([who, its]) => `${NPC_BY[who] ? npcLink(who) : esc(who)} <small>(${its.slice(0, 6).map(iname).join(', ')}${its.length > 6 ? '…' : ''})</small>`).join('<br>')}</td></tr>`).join('')}</table>`;
    SP('sys:morts', { t: 'La mort des habitants', s: 'Définitive : quêtes perdues, commerce repris', c: ['societe'], i: '✝', h }, FILE.soc);
    let hc = intro(FILE.soc, { only: /crime|prime|recherch|témoin/i });
    const sc = figRect('look:SOC_CHASSEUR_LOOK');
    if (sc) hc = figInline(sc, 110, 'Un chasseur de primes') + hc;
    if (Object.keys(CD).length) hc += `<h3>Les crimes</h3><table class="t"><tr><th>Crime</th><th>Prime</th><th>Gravité</th><th>Oublié après</th><th></th></tr>${Object.entries(CD).map(([k, d]) => `<tr><td>${esc(cap(humanKey(k)))}</td><td>${d.prime ? nfmt(d.prime) + ' pièces' : '—'}</td><td>${d.grav || '—'}</td><td>${d.oubli ? d.oubli + ' jours sans récidive' : '—'}</td><td><small>${d.violent ? 'violent' : ''}</small></td></tr>`).join('')}</table>`;
    if (VG.length) hc += `<h3>Les villages qui se parlent</h3><p>${VG.map((k) => (pages.has('li:' + k) ? placeLink(k) : esc(k === 'nains' ? 'les nains' : cap(humanKey(k))))).join(', ')}</p>`;
    if (ITEMS.affiche_recherche || PLACEABLES.affiche_recherche) hc += `<p>${IL('affiche_recherche')}</p>`;
    SP('sys:crimes', { t: 'Crimes et avis de recherche', s: 'Témoins, primes, affiches, chasseurs de primes', c: ['societe'], i: '⚖', h: hc }, FILE.soc);
  }
  if (FILE.lieux) {
    // les Sources
    let hs = intro(FILE.lieux, { only: /sources/i });
    const nat = NPCS.filter((d) => d.area === 'sources' || (d.look && d.look.nude));
    if (nat.length) hs += `<h3>Les gens des Sources</h3><ul class="cards">${nat.map((d) => `<li>${npcLink(d.id)}</li>`).join('')}</ul>`;
    if (BUFFN2.bains) hs += `<p>Au sortir du bain : <span class="tag">${esc(BUFFN2.bains)}</span></p>`;
    if (pages.has('li:sources')) hs += `<p>${placeLink('sources')} ${mapBtn('li:sources')}</p>`;
    SP('sys:sources', { t: 'Les Sources', s: 'L’eau chaude de la montagne', c: ['societe'], i: '♨', h: hs }, FILE.lieux);
    // les nains (lieu caché)
    const NP = U('NAINS_PHRASES', []);
    let hn = intro(FILE.lieux, { only: /nains/i, secret: /frapper|coups|sifflet|rythme/i });
    if (SYS.rythme) hn += SEC(`<h3>Le rythme</h3><p>Frapper à la fente de la falaise : ${SYS.rythme.split('-').map((n) => `<b>${n}</b> ${+n > 1 ? 'coups' : 'coup'}`).join(', puis ')}${SYS.rythmeSilence ? `, avec un silence de plus de ${nfmt(SYS.rythmeSilence)} s entre les groupes` : ''}. ${ITEMS.sifflet_argent ? `Le ${IL('sifflet_argent')}, soufflé devant la fente, frappe à votre place.` : ''}</p>`, 'Le rythme à frapper est masqué (secrets).');
    const dw = NPCS.filter((d) => d.look && d.look.dwarf);
    if (dw.length) hn += `<h3>Les nains</h3><ul class="cards">${dw.map((d) => `<li>${npcLink(d.id)}</li>`).join('')}</ul>`;
    if (NP.length) hn += `<h3>Ce qu’ils disent</h3>${NP.map((a) => sayPair(a)).join('')}`;
    SP('sys:nains', { t: 'Le village caché des nains', s: 'Sous la montagne, derrière une fente de la falaise', c: ['societe'], i: '⛏', x: 1, h: hn }, FILE.lieux);
    // les géants, et chacun d'eux
    const GP = U('GEANTS_PHRASES', []), GD = U('GEANTS_DON', []), GC = U('GEANTS_COLERE', []), GA = U('GEANTS_AUBE', []), GN = U('GEANT_NOMS', []), GT = U('GEANT_TAILLES', []);
    U('GEANT_LOOKS');
    let hg = intro(FILE.lieux, { only: /géants/i });
    if (GN.length) hg += `<div class="figrow">${GN.map((n, i) => figInline(figRect('geant:' + i), 120, esc(n), '#/p/' + encodeURIComponent('geant:' + i))).join('')}</div>`;
    const lg = LANG.gorrain ? 'gorrain' : null;
    if (GP.length) hg += `<h3>Ce qu’ils disent</h3>${GP.map((a) => sayPair(a, lg)).join('')}`;
    if (GD.length) hg += `<h3>Quand on leur porte à manger</h3>${GD.map((a) => sayPair(a, lg)).join('')}`;
    if (GA.length) hg += `<h3>À l’aube, sur la crête</h3>${GA.map((a) => sayPair(a, lg)).join('')}`;
    if (GC.length) hg += `<h3>Quand on les frappe</h3>${GC.map((a) => sayPair(a, lg)).join('')}`;
    if (pages.has('li:geants')) hg += `<p>${placeLink('geants')}</p>`;
    SP('sys:geants', { t: 'Les géants', s: GN.length ? `${GN.length} géants, à leur camp des hauteurs` : 'Les géants des hauteurs', c: ['societe'], i: '⛰', h: hg }, FILE.lieux);
    GN.forEach((n, i) => {
      const r = figRect('geant:' + i);
      SP('geant:' + i, { t: n, s: 'Géant', c: ['habitants'], g: 'Les géants', i: r ? 'fg:' + r.join(',') : '⛰', fig: r, h: `<dl class="kv"><dt>Taille</dt><dd>${GT[i] ? nfmt(GT[i]) + ' fois la taille d’un homme' : '—'}</dd><dt>Parle</dt><dd>${lg ? link('lg:' + lg) : 'une vieille langue'}, lentement</dd></dl><p>${lk('sys:geants', 'Les géants')}</p>` });
    });
  }
  if (FILE.routines) {
    U('ROUTINE_JOURS'); U('ROUTINE_BASES'); U('LIEUX_PROMENADE');
    const TO = U('TOURNEES', {}), HO = U('HOTTES', {});
    let h = intro(FILE.routines);
    // la grille : chaque habitant, chaque jour (ce qui change de sa journée ordinaire)
    const short = (pl, d) => { const q = placeKey(pl, d); return pages.has('li:' + q.k) && q.t !== 'chez soi' ? placeLink(q.k, q.t) : esc(q.t); };
    if (SEM.length && Object.keys(RT).length) {
      h += `<h3>Qui fait quoi, chaque jour</h3><p class="note">Ce qui change de la journée ordinaire de chacun (heures de jeu) ; « · » : une journée comme les autres. Chaque fiche d’habitant détaille sa semaine.</p><div class="scrollx"><table class="t week-grid"><tr><th></th>${SEM.map((J, k) => `<th>${link('sem:' + k, J.nom)}</th>`).join('')}</tr>${NPCS.map((d) => {
        const R = RT[d.id] || [], base = JSON.stringify(d.schedule || []);
        const cells = SEM.map((J, k) => {
          const S = R[k] || [];
          if (!S.length || JSON.stringify(S) === base) return '<td class="c">·</td>';
          const ends = S.map((e, i) => (S[i + 1] ? S[i + 1][0] : 24));
          // ce qui sort de l'ordinaire : un lieu où il ne va pas d'habitude (ni chez lui, ni au travail)
          const usual = new Set((d.schedule || []).map((b) => b[1]).concat(['home', 'work']));
          const diff = S.map((e, i) => [e, ends[i]]).filter(([e, end]) => !usual.has(e[1]) && end - e[0] > 0.05);
          return `<td>${diff.length ? diff.map(([e, end]) => `<small>${hours(e[0])}–${hours(end)}</small> ${short(e[1], d)}`).join('<br>') : '<span class="c">·</span>'}</td>`;
        }).join('');
        return `<tr><th>${npcLink(d.id, `${(d.names || [])[0] || ''} ${d.surname || ''}`.trim())}</th>${cells}</tr>`;
      }).join('')}</table></div>`;
    }
    SP('sys:routines', { t: 'La semaine de chacun', s: `${SEM.length} jours, et chacun les siens`, c: ['semaine'], i: '📅', h }, FILE.routines);
    if (Object.keys(TO).length || Object.keys(HO).length) {
      let hc = intro(FILE.routines, { only: /colporteur/i });
      for (const [n, T2] of Object.entries(TO)) hc += `<h3>La tournée : ${npcLink(n)}</h3><table class="t">${SEM.map((J, k) => T2[J.cle] ? `<tr><th>${link('sem:' + k)}</th><td>${short(T2[J.cle], NPC_BY[n] || {})}</td></tr>` : '').join('')}</table>`;
      for (const [n, H2] of Object.entries(HO)) {
        hc += `<h3>La hotte : ${npcLink(n)}</h3>${(H2.fonds || []).length ? `<p><b>Toujours :</b> ${ILs(H2.fonds)}</p>` : ''}`;
        if (H2.ici) hc += `<table class="t"><tr><th>Où</th><th>En plus</th></tr>${Object.entries(H2.ici).map(([pl, a]) => `<tr><td>${short(pl, NPC_BY[n] || {})}</td><td>${a.map(([id, pr]) => IL(id) + (pr ? ` <small>${nfmt(pr)}</small>` : '')).join(', ')}</td></tr>`).join('')}</table>`;
      }
      SP('sys:colporteurs', { t: 'Les colporteurs', s: 'D’un village à l’autre, selon le jour', c: ['societe'], i: '🎒', h: hc }, FILE.routines);
    }
  }

  // ==== ÉVÉNEMENTS ET DIVINITÉS ====
  const EVL = T('EV_LIGNES', {});
  const CAL = SYS.calendrier || null;
  const linesOf = (k) => { const L = EVL[k]; if (!L) return ''; used.add('EV_LIGNES'); return `<h3>Ce qu’en disent les habitants</h3>${[['avant', 'La veille'], ['pendant', 'Sur le moment'], ['apres', 'Le lendemain']].filter(([q]) => (L[q] || []).length).map(([q, t]) => `<h4>${t}</h4>${quotes(L[q])}`).join('')}`; };
  const cineOf = (name) => { const M = FILE.cine && MF[FILE.cine]; if (!M || !M.mdocs[name]) return ''; return `<p class="note">Une cinématique : ${esc(cleanText(M.mdocs[name]))}. ${lk('sys:cinematiques', 'Les cinématiques')}</p>`; };
  const calOf = (k) => { if (!CAL || !CAL.ev[k]) return ''; const e = CAL.ev[k], M = FILE.ev && MF[FILE.ev]; const md = M && (M.mdocs[{ nuit_noire: 'nuitNoireBrute', tornade: 'tornadeBrute', tueur: 'tueurBrut' }[k]] || ''); return `<dl class="kv"><dt>Fréquence</dt><dd>${esc(freq(e.n, CAL.jours))} <small>(${e.n} fois en ${nfmt(CAL.jours)} jours${e.first ? ', la première au jour ' + e.first : ''})</small></dd>${md ? `<dt>La règle</dt><dd>${esc(cap(cleanText(md)))}</dd>` : ''}${CAL.almanach && CAL.almanach[k] ? `<dt>L’almanach dit</dt><dd>« ${esc(CAL.almanach[k])} »</dd>` : ''}</dl>`; };
  if (FILE.ev) {
    const PD = U('PRODIGES', {});
    U('EV_FX');
    const parts = headParts(FILE.ev).parts;
    const bullet = (re) => parts.filter((q) => q.b && re.test(q.head + ' ' + q.t)).map((q) => `<p class="lead">${esc(q.t)}</p>`).join('');
    const evs = [
      ['nuit_noire', 'Les nuits noires', 'Ni lune ni étoiles, et des murmures', '☾', /nuit noire/i, 'nuitNoire', FILE.ev],
      ['neige', 'La neige partout', 'Les jours de grand froid', '❄', /neige/i, null, FILE.ev],
      ['soleil', 'Le soleil écrasant', 'Le regarder laisse une tache noire', '☀', /soleil/i, null, FILE.ev],
      ['tornade', 'Les tornades', 'Très rares, un jour d’orage ou de canicule', '🌪', null, 'tornade', FILE.tornade],
      ['tueur', 'L’homme au long manteau', 'Le tueur errant : une nuit, un seul mort', '🗡', null, 'tueur', FILE.tueur],
    ];
    for (const [k, t, s, i, re, cn, file] of evs) {
      if (!file) continue;
      let h = re ? bullet(re) : intro(file);
      if (k === 'tueur') { const r = figRect('look:TUEUR_LOOK'); if (r) h = figInline(r, 120, 'L’homme au long manteau') + h; const TL2 = U('TUEUR_LIEUX', []); U('TUEUR_LOOK'); if (TL2.length) { const seen = new Set(); h += `<h3>Où il rôde</h3><p>${TL2.filter((q) => { const n = lieuName(q); if (seen.has(n)) return false; seen.add(n); return true; }).map((q) => (pages.has('li:' + q) ? placeLink(q) : esc(humanKey(q)))).join(', ')}</p>`; } }
      h += calOf(k) + (cn ? cineOf(cn) : '') + linesOf(k);
      if (k === 'tueur' && pages.has('ent:tueur')) h += `<p class="note">Rien à voir avec ${link('ent:tueur', 'le tueur masqué caché parmi les habitants')}.</p>`;
      SP('ev:' + k, { t, s, c: ['evenements'], i, h, g: 'Événements rares' }, file);
    }
    // les prodiges
    const pk = Object.keys(PD);
    if (pk.length) {
      // leurs noms : l'énumération de l'en-tête, dans le même ordre, si elle compte autant d'éléments
      let noms = {};
      {
        const txt = parts.map((q) => q.t).join(' ');
        const m = txt.match(/prodige\W*:\s*([^.]+)\./i);
        if (m) {
          const L2 = m[1].split(/,\s*|\s+et\s+/).map((x) => x.trim()).filter(Boolean);
          const n4 = (x) => x.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().slice(0, 4);
          if (L2.length === pk.length && pk.filter((k, i) => L2[i].toLowerCase().split(/\s+/).some((w) => n4(w) === n4(k))).length >= pk.length / 2) pk.forEach((k, i) => { noms[k] = cap(L2[i]); });
        }
      }
      const nomP = (k) => noms[k] || cap(humanKey(k));
      const tot = Object.values((CAL && CAL.prodiges) || {}).reduce((a, b) => a + b, 0);
      let h = bullet(/prodige/i) || `<p class="lead">Chaque matin, on tire (rarement) un prodige.</p>`;
      h += `<table class="t"><tr><th>Prodige</th><th>Fréquence</th><th>Dure</th><th></th></tr>${pk.map((k) => `<tr><td>${lk('pr:' + k, nomP(k))}</td><td>${CAL && CAL.prodiges ? esc(freq(CAL.prodiges[k] || 0, CAL.jours)) : '—'}</td><td>${PD[k].duree ? nfmt(PD[k].duree) + ' h' : '—'}</td><td><small>${PD[k].etrange ? 'étrange : plus fréquent quand l’esprit s’assombrit' : ''}</small></td></tr>`).join('')}</table>`;
      if (tot && CAL) h += `<p class="note">En tout, un prodige ${esc(freq(tot, CAL.jours))} (${tot} en ${nfmt(CAL.jours)} jours).</p>`;
      SP('ev:prodiges', { t: 'Les prodiges', s: 'Étoiles filantes, éclipses, cloches qui sonnent seules…', c: ['evenements'], i: '✶', h, g: 'Événements rares' }, FILE.ev);
      for (const k of pk) SP('pr:' + k, { t: nomP(k), s: 'Prodige', c: ['evenements'], i: '✶', g: 'Les prodiges', h: `<dl class="kv"><dt>Fréquence</dt><dd>${CAL && CAL.prodiges ? esc(freq(CAL.prodiges[k] || 0, CAL.jours)) : '—'}</dd><dt>Dure</dt><dd>${PD[k].duree ? nfmt(PD[k].duree) + ' h de jeu' : '—'}</dd>${PD[k].etrange ? '<dt>Étrange</dt><dd>oui : plus fréquent quand la mentalité s’assombrit</dd>' : ''}</dl>` + linesOf(k) + `<p>${lk('ev:prodiges', 'Tous les prodiges')}</p>` });
    }
  }
  // ---- les Trois
  if (FILE.divins) {
    const DN = U('DIV_NOMS', {}), DP = U('DIV_PAROLES', {}), DR = U('DIV_REVES', []);
    U('DIV_LOOK');
    let h = intro(FILE.divins);
    h += `<div class="figrow">${Object.keys(DN).map((k) => figInline(figRect('div:' + k), 120, esc(DN[k]), '#/p/' + encodeURIComponent('dieu:' + k))).join('')}</div>`;
    h += `<p>${link('div:trois', 'Ce que la vallée dit des Trois')}</p>`;
    SP('sys:divins', { t: 'Les Trois viennent sur le monde', s: 'Apparitions, rêves, voix, pactes', c: ['evenements'], i: '☉', h, g: 'Les Trois' }, FILE.divins);
    const lang = LANG.aelin ? 'aelin' : null;
    for (const [k, nom] of Object.entries(DN)) {
      const r = figRect('div:' + k);
      let x = '';
      const par = Object.entries(DP).filter(([q]) => q.startsWith(k + '_'));
      if (par.length) x += `<h3>Ses paroles</h3><p class="note">Les Trois parlent aëlin ; le personnage n’en comprend que les mots qu’il connaît.</p>${par.map(([q, a]) => `<h4>${esc(cap(humanKey(q.slice(k.length + 1))))}</h4>${sayPair(a, lang)}`).join('')}`;
      const rv = DR.filter((d) => d.qui === k);
      if (rv.length) x += `<h3>Les rêves</h3>${rv.map((d) => `<blockquote>${FILL(d.t)}${(d.mots || []).length ? ` <small>(mot appris : ${d.mots.map((m) => `<b>${esc(m)}</b>`).join(', ')})</small>` : ''}</blockquote>`).join('')}`;
      x += cineOf(k);
      const bl = { aela: 'aube', durn: 'pierre' }[k];
      if (bl && BUFFN2[bl]) x += `<p>Sa bénédiction : <span class="tag">${esc(BUFFN2[bl])}</span></p>`;
      x += linesOf('divin_' + k);
      x += `<p>${lk('sys:divins', 'Les Trois viennent sur le monde')} · ${link('div:trois', 'Les Trois dans les livres et les pierres')}</p>`;
      SP('dieu:' + k, { t: nom, s: 'L’une des Trois divinités', c: ['evenements'], g: 'Les Trois', i: r ? 'fg:' + r.join(',') : '☉', fig: r, h: x });
    }
  }
  // ---- les malédictions
  if (FILE.mal) {
    const ML = U('MALEDICTIONS', {}), MC = U('MAL_CAUSES', {}), PG = U('MAL_PRIX_GUERISSEUSE', []);
    U('MAL_OMBRE_LOOK');
    const parts = headParts(FILE.mal).parts;
    const rem = parts.find((q) => /^Remèdes/i.test(q.t) || /remèdes/i.test(q.head));
    let h = intro(FILE.mal, { skip: /^(Causes|Remèdes)/i });
    h += `<table class="t"><tr><th>Malédiction</th><th>Ce qu’on en voit</th></tr>${Object.entries(ML).map(([k, m]) => `<tr><td>${lk('mal:' + k, m.nom || cap(humanKey(k)))}<br><small>${m.grave ? 'mortelle' : m.petite ? 'petite' : 'grande'}</small></td><td>${FILL(m.signes || '')}</td></tr>`).join('')}</table>`;
    if (Object.keys(MC).length) h += `<h3>Ce qui les attire</h3><table class="t"><tr><th>La faute</th><th>La malédiction</th><th>Réparer</th></tr>${Object.values(MC).map((c) => `<tr><td>${FILL(c.faute || '')}</td><td>${ML[c.mal] ? lk('mal:' + c.mal, ML[c.mal].nom) : esc(c.mal || '')}</td><td>${FILL(c.reparer || '')}</td></tr>`).join('')}</table>`;
    if (rem) h += `<h3>Les remèdes</h3><p>${esc(rem.t.replace(/^Remèdes\s*:\s*/i, ''))}</p>`;
    if (PG.length) h += `<p>La guérisseuse demande, en échange, l’une de ces choses : ${ILs(PG)}.</p>`;
    SP('sys:maledictions', { t: 'Les malédictions', s: 'Ce qui les attire, ce qui les lève', c: ['evenements'], i: '☠', h, g: 'Malédictions' }, FILE.mal);
    for (const [k, m] of Object.entries(ML)) {
      let x = `<p class="lead">${FILL(m.signes || '')}</p><dl class="kv"><dt>Sorte</dt><dd>${m.grave ? '<b class="warn">mortelle, si on ne la lève pas</b>' : m.petite ? 'petite : l’eau lustrale la lève' : 'grande'}</dd></dl>`;
      const cs = Object.values(MC).filter((c) => c.mal === k);
      if (cs.length) x += `<h3>Ce qui l’attire</h3><ul>${cs.map((c) => `<li>${FILL(c.faute || '')}${c.reparer ? ` <small>Réparer : ${FILL(c.reparer)}</small>` : ''}</li>`).join('')}</ul>`;
      if (k === 'ombre') { const r = figRect('look:MAL_OMBRE_LOOK'); if (r) x = figInline(r, 110, 'L’ombre') + x; x += cineOf('ombre'); }
      if (ITEMS.eau_lustrale && m.petite) x += `<p>${IL('eau_lustrale')}</p>`;
      x += `<p>${lk('sys:maledictions', 'Toutes les malédictions')}</p>`;
      SP('mal:' + k, { t: m.nom || cap(humanKey(k)), s: 'Malédiction', c: ['evenements'], g: 'Malédictions', i: '☠', h: x });
    }
  }
  // ---- le temple (secret)
  if (FILE.temple) {
    const OR = U('TPL_ORDRE', []), TB = U('TPL_TOMBEAU', []);
    let h = intro(FILE.temple, { all: false });
    if (OR.length) h += `<h3>La porte des Trois</h3><p>Toucher les trois pierres dans l’ordre : ${OR.map((k) => (pages.has('dieu:' + k) ? link('dieu:' + k) : esc(cap(k)))).join(', puis ')}.</p>`;
    if (TB.length) h += `<h3>Sur le tombeau</h3>${sayPair(TB, LANG.aelin ? 'aelin' : null)}`;
    h += cineOf('templeOuverture') + cineOf('durnEveil');
    if (pages.has('li:temple')) h += `<p>${placeLink('temple')}</p>`;
    SP('sys:temple', { t: 'Le temple sous la montagne', s: 'Derrière la cascade où naît la rivière', c: ['evenements'], g: 'Lieux sacrés', i: '⛩', x: 1, h }, FILE.temple);
  }
  // ---- les cinématiques
  if (FILE.cine) {
    const M = MF[FILE.cine];
    let h = intro(FILE.cine);
    const SECRET_CINE = /temple|dormeur|réveille|ombre|rattrap/i;
    const names = Object.keys(M.mdocs).filter((n) => M.mtexts[n] || /^[a-z]/.test(n));
    h += `<h3>Les scènes</h3><ul class="sysl">${names.map((n) => { const d = cleanText(M.mdocs[n]); const tx = M.mtexts[n] || []; const body = `<b>${esc(cap(d))}</b>${tx.length ? quotes(tx) : ''}`; return SECRET_CINE.test(d) ? `<li class="sec">${body}</li><li class="sec-note">(une scène masquée : secrets)</li>` : `<li>${body}</li>`; }).join('')}</ul>`;
    const uses = Object.entries(SYS.cineUses || {}).filter(([f]) => f !== FILE.cine && f !== FILE.socle);
    if (uses.length) h += `<h3>Et encore</h3><p>D’autres scènes filmées : ${uses.map(([f, n]) => `${modRef(f)} <small>(${n})</small>`).join(', ')}.</p>`;
    SP('sys:cinematiques', { t: 'Les cinématiques', s: 'Courtes ; Espace pour passer', c: ['evenements'], g: 'Les cinématiques', i: '🎬', h }, FILE.cine);
  }
  // ---- l'esprit du lavoir (secret)
  if (FILE.lavandiere) {
    let h = intro(FILE.lavandiere, { secret: /secret|tord|sens/i });
    if (SYS.lavSens) h += SEC(`<p>Le sens dans lequel tordre ${SYS.lavSens === 'varie' ? 'change d’une partie à l’autre : les vieux du village le disent à qui a déjà vu son visage.' : 'est toujours le même : à main ' + esc(SYS.lavSens) + '.'}</p>`, 'Comment l’apaiser : masqué (secrets).');
    if (pages.has('li:lavoir')) h += `<p>${placeLink('lavoir')}</p>`;
    SP('ev:lavandiere', { t: 'La lavandière de nuit', s: 'L’esprit secret du lavoir', c: ['evenements'], g: 'Événements rares', i: '🌫', x: 1, h }, FILE.lavandiere);
  }

  // ==== AUTRES MONDES ====
  const MOND = T('MONDES', {});
  const BMs = SYS.betesMonde || {};
  const monFile = { bonbons: FILE.bonbons, tenebres: FILE.tenebres, cauchemar: FILE.cauchemar, enfers: FILE.enfers };
  const worldOf = (f) => Object.keys(monFile).find((k) => monFile[k] && monFile[k] === f) || null;
  const mondeTitre = (k) => cap((MOND[k] && MOND[k].titre) || humanKey(k));
  if (Object.keys(BMs).length) {
    used.add('BETES_MONDE');
    for (const [k, B] of Object.entries(BMs)) {
      const d = B.d || {}, wk = worldOf(B.file), r = figRect('bm:' + k);
      const nom = B.nom ? cap(B.nom.replace(/^(un|une)\s+/i, '')) : cap(humanKey(k));
      const touch = d.intouchable || d.hp >= 999;
      let x = `<dl class="kv">${wk ? `<dt>Monde</dt><dd>${lk('monde:' + wk, mondeTitre(wk))}</dd>` : ''}<dt>Vigueur</dt><dd>${touch ? 'on ne peut pas lui faire de mal' : d.hp + ' points de vie'}</dd>`;
      if (d.vitesse && (d.vitesse[0] || d.vitesse[1])) x += `<dt>Allure</dt><dd>${nfmt(d.vitesse[0])} m/s au pas, ${nfmt(d.vitesse[1])} m/s à la course</dd>`;
      if (d.degats) x += `<dt>Blessure</dt><dd>jusqu’à ${d.degats} points par coup${d.cadence ? `, un coup toutes les ${nfmt(d.cadence)} s` : ''}</dd>`;
      if (d.vue) x += `<dt>Vous voit</dt><dd>à ${d.vue} m${d.perd ? `, vous perd à ${d.perd} m` : ''}</dd>`;
      if (d.fuite) x += `<dt>Fuit</dt><dd>quand on approche à ${d.fuite} m</dd>`;
      if ((d.butin || []).length) x += `<dt>Ce qu’elle laisse</dt><dd>${d.butin.map((e) => IL(e[0]) + ` <small>${span2(e[1], e[2])}</small>`).join(', ')}</dd>`;
      if (d.cause) x += `<dt>Sur l’avis de décès</dt><dd>« ${esc(d.cause)} »</dd>`;
      x += '</dl>';
      if (d.fantome) x += `<p class="note">Une ombre : elle n’a pas de corps.</p>`;
      SP('an:m:' + k, { t: nom, s: wk ? 'Bête ' + mondeTitre(wk).replace(/^Les /, 'des ').replace(/^Le /, 'du ').replace(/^La /, 'de la ').replace(/^L[’'](?=\S)/, 'de l’') : 'Bête d’un autre monde', c: ['betes'], g: 'Des autres mondes', i: r ? 'fg:' + r.join(',') : '🐾', fig: r, h: x });
    }
  }
  if (FILE.mondes) {
    let h = intro(FILE.mondes);
    h += `<ul class="cards">${Object.keys(monFile).filter((k) => monFile[k]).map((k) => `<li>${lk('monde:' + k, mondeTitre(k))}</li>`).join('')}</ul>`;
    SP('sys:mondes', { t: 'Les autres mondes', s: 'La vallée vue autrement, et ce qui est dessous', c: ['mondes'], i: '◐', h }, [FILE.mondes, FILE.mondesModeles]);
  }
  for (const [wk, f] of Object.entries(monFile)) {
    if (!f) continue;
    const M = MF[f];
    let h = intro(f);
    const its = M.items.filter((i) => ITEMS[i]);
    const plantes = ((SYS.plantesMonde || {})[f] || []).filter((i) => ITEMS[i]);
    const betes = Object.entries(BMs).filter(([, B]) => B.file === f).map(([k]) => k);
    const lieux = M.secs.filter(([ind, t]) => ind > 0 && !/plantes|bêtes|chaque image|branchement|par terre|marchand/i.test(t)).map(([, t]) => cap(t));
    if (lieux.length) h += `<h3>Ce qui s’y dresse</h3><ul>${lieux.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;
    if (plantes.length) h += `<h3>Ce qu’on y cueille</h3><p>${ILs(plantes)}</p>`;
    if (betes.length) h += `<h3>Ce qui y vit</h3><div class="figrow">${betes.map((k) => figInline(figRect('bm:' + k), 90, lk('an:m:' + k), '#/p/' + encodeURIComponent('an:m:' + k))).join('')}</div>`;
    if (its.length) h += `<h3>Les objets de ce monde</h3><p>${ILs(its)}</p>`;
    const ret = Object.keys(M.tables).filter((n) => /_RETOUR$/.test(n) && DB.tables[n]);
    for (const n of ret) { const R = U(n, {}); h += `<h3>Au retour dans la vallée</h3><p class="note">Ce qu’on en rapporte devient :</p><table class="t">${Object.entries(R).map(([a, b]) => `<tr><td>${IL(a)}</td><td>${b ? (b === a ? 'reste ce qu’il est' : IL(b)) : 'disparaît'}</td></tr>`).join('')}</table>`; }
    if (wk === 'enfers') {
      const ST = U('ENFERS_STELES', []), AM = U('ENFERS_AMES', []), SN = U('ENFERS_SANS_NOM', []), DA = U('ENFERS_DAMNES', []);
      let s = '';
      if (ST.length) s += `<h3>Les stèles</h3>${ST.map(([t, x]) => `<section class="bookpage"><h4>${esc(t)}</h4>${para(x)}</section>`).join('')}`;
      if (AM.length) s += `<h3>Ce que disent les âmes des victimes</h3>${quotes(AM)}`;
      if (SN.length) s += `<h3>Les victimes sans nom</h3>${quotes(SN)}`;
      if (DA.length) s += `<h3>Les damnés</h3>${quotes(DA)}`;
      if (s) h += SEC(s, 'Ce qu’on lit et ce qu’on entend aux Enfers est masqué (secrets).');
    }
    h += restTables(f);
    const ttl = mondeTitre(wk);
    SP('monde:' + wk, { t: ttl, s: subOf(f) || (MOND[wk] && MOND[wk].aPart ? 'Un monde à part' : 'La vallée, vue autrement'), c: ['mondes'], i: { bonbons: '🍬', tenebres: '🜏', cauchemar: '☾', enfers: '🜂' }[wk] || '◐', h }, f);
  }

  // ==== MERVEILLES ET MYSTÈRES ====
  if (FILE.leg) {
    const LG = U('LEGENDAIRES', {}), LR = U('LEG_RANGS', {}), LO = U('LEG_ORDRE', []), LF = U('LEG_FORGE', {});
    const order = uniq([...LO, ...Object.keys(LG)]).filter((id) => LG[id]);
    let h = intro(FILE.leg);
    for (const [rk, R] of Object.entries(LR)) {
      const ids = order.filter((id) => LG[id].rang === rk);
      if (ids.length) h += `<h3 style="color:${esc(R.col || '')}">${esc(ids.length > 1 ? String(R.nom || rk).split(' ').map((w) => w + 's').join(' ') : R.nom || rk)}</h3><ul class="cards">${ids.map((id) => `<li>${IL(id)}</li>`).join('')}</ul>`;
    }
    SP('sys:legendaires', { t: 'Objets légendaires et mythiques', s: `${order.length} merveilles, un seul exemplaire par partie`, c: ['merveilles'], i: '✦', h }, FILE.leg);
    for (const id of order) {
      if (!pages.has('it:' + id)) continue;
      const L = LG[id], R = LR[L.rang] || {}, p = P('it:' + id);
      let x = `<p><span class="tag leg" style="color:${esc(R.col || '')};border-color:${esc(R.col || '')}">${esc(R.nom || L.rang)}</span></p>`;
      if (L.histoire) x += `<h3>Son histoire</h3>${para(L.histoire)}`;
      if (L.pouvoir) x += `<h3>Son pouvoir</h3>${para(L.pouvoir)}`;
      const s = (L.origine ? `<h3>D’où il vient</h3>${para(L.origine)}` : '') + (L.indice ? `<h3>Comment le trouver</h3>${para(L.indice)}` : '') + (LF[id] ? `<h3>À la forge</h3><p>${needList(LF[id].need)}</p>${LF[id].dit ? quote(LF[id].dit, 'nain_forgeronne') : ''}${LF[id].fait ? quote(LF[id].fait, 'nain_forgeronne') : ''}` : '');
      if (s) x += SEC(s, 'D’où il vient et comment l’obtenir : masqué (secrets).');
      p.h = x + (L.pouvoir && ITEMS[id] && ITEMS[id].desc && ITEMS[id].desc.includes(L.pouvoir.slice(0, 40)) ? p.h.replace(/^<p class="lead">[\s\S]*?<\/p>/, '') : p.h);
      if (!p.c.includes('merveilles')) p.c.push('merveilles');
      p.g = R.nom ? String(R.nom).split(' ').map((w) => w + 's').join(' ') : 'Merveilles';
    }
  }
  const clause = (f) => { const q = headParts(f).parts[0]; return q ? cap(q.t.split(/[,:;(]/)[0].trim()) : ''; };
  if (FILE.slender) {
    const SPG = U('SLENDER_PAGES', []), r = figRect('slender');
    let h = intro(FILE.slender);
    if (SPG.length) h += SEC(`<h3>Les pages griffonnées</h3><div class="book">${SPG.map((pg, i) => `<section class="bookpage"><h4>Page ${i + 1}</h4><p>${(pg.lignes || []).map(esc).join('<br>')}</p>${pg.dessin ? `<p class="note">un dessin : ${esc(humanKey(pg.dessin))}</p>` : ''}</section>`).join('')}</div>`, 'Les pages sont masquées (secrets).');
    if (ITEMS.page_griffonnee) h += `<p>${IL('page_griffonnee')}</p>`;
    SP('sys:slender', { t: 'L’Homme long', s: clause(FILE.slender) || 'Dans les bois', c: ['merveilles'], g: 'Mystères', i: r ? 'fg:' + r.join(',') : '☗', fig: r, h }, FILE.slender);
  }
  if (FILE.fondation) {
    const FD = U('FOND_DOSSIERS', []), FJ = U('FOND_JOURNAUX', {}), FT = U('FOND_TXT', {}), FCH = U('FOND_CHERCHEURS', []), FCA = U('FOND_CASIERS', {});
    let h = intro(FILE.fondation);
    const headTxt = MF[FILE.fondation].head.join(' ').replace(/\s+/g, ' ');
    const lic = headTxt.match(/\((La Fondation SCP[^)]*?CC BY-SA[^)]*?)\)/);
    if (lic) { const url = (lic[1].match(/https?:\/\/[^\s)—]+/) || [])[0]; h += `<p class="note licence">${esc(lic[1].replace(/\s*:\s*https?:\/\/[^\s)—]+/, '').replace(/\s+—\s+/, ' — '))}${url ? ` — <a href="${esc(url)}" rel="noopener">${esc(url.replace(/^https?:\/\//, ''))}</a>` : ''}</p>`; }
    if (FCH.length) h += `<h3>Les chercheurs</h3><div class="figrow">${FCH.map((c, i) => figInline(figRect('chercheur:' + i), 90, `${esc(c.nom || '')}<br><small>${esc(c.titre || '')}</small>`)).join('')}</div>`;
    if (FD.length) h += `<h3>Les dossiers de confinement</h3><ul class="cards">${FD.map((D) => `<li>${lk('scp:' + D.id, `${D.id} — ${D.titre}`)}</li>`).join('')}</ul>`;
    let s = '';
    if (Object.keys(FT).length) s += `<h3>Plaques et notes</h3>${Object.values(FT).map((a) => `<section class="bookpage"><h4>${esc(a[0] || '')}</h4>${para(a[1] || '')}${a[2] ? `<p class="note">${esc(a[2])}</p>` : ''}</section>`).join('')}`;
    if (Object.keys(FJ).length) s += `<h3>Les journaux</h3>${Object.values(FJ).map((J2) => `<section class="bookpage"><h4>${esc(J2.titre || '')}</h4>${(J2.s || []).map(([t, x]) => `<p><b>${esc(t)}</b> — ${FILL(x)}</p>`).join('')}</section>`).join('')}`;
    if (Object.keys(FCA).length) s += `<h3>Dans les casiers</h3><table class="t">${Object.entries(FCA).map(([k, a]) => `<tr><th>${esc(humanKey(k))}</th><td>${a.map(([id, n]) => IL(id, n)).join(', ')}</td></tr>`).join('')}</table>`;
    if (s) h += SEC(s, 'Ce qu’on lit dans le complexe est masqué (secrets).');
    const its = MF[FILE.fondation].items.filter((i) => ITEMS[i]);
    if (its.length) h += `<h3>Objets d’un autre temps</h3><p>${ILs(its)}</p>`;
    SP('sys:fondation', { t: 'La Fondation', s: clause(FILE.fondation) || 'Un poste avancé sous la lande', c: ['merveilles'], g: 'Mystères', i: '▣', h }, FILE.fondation);
    for (const D of FD) SP('scp:' + D.id, { t: `${D.id} — ${D.titre}`, s: `Dossier de confinement · classe ${D.classe || '?'}`, c: ['merveilles'], g: 'Dossiers de la Fondation', i: '▣', x: 1, h: `<dl class="kv"><dt>Désignation</dt><dd>SCP-${esc(D.id)}</dd><dt>Classe</dt><dd>${esc(D.classe || '—')}</dd></dl>${(D.s || []).map(([t, x]) => `<h3>${esc(t)}</h3>${para(x)}`).join('')}<p>${lk('sys:fondation', 'La Fondation')}</p>` });
  }

  // ==== LA VIE DE LA VALLÉE : dormir, louer, acheter et meubler, crocheter, les portes, fouiller, ramasser et casser,
  // les morts qui restent au sol, les activités, la terre, l'équilibrage (mesuré dans le jeu : DB.derived.vie) ====
  const VIE = DB.derived.vie || {}, RE = VIE.re || {};
  const FV = {
    sommeil: fileHas(/^11-zzz95/), location: fileHas(/^11-zzz96/), croc: fileHas(/^11-zzz97/), fouilles: fileHas(/^11-zzz98/), activites: fileHas(/^11-zzz99/),
    butin: fileHas(/^11-zzzz1-/), objets: fileHas(/^11-zzzz2-/), depouilles: fileHas(/^11-zzzz3-/), meubles: fileHas(/^11-zzzz4-meubles/), terre: fileHas(/^11-zzzz4-ferme/),
    portes: fileHas(/^07-zzzzzzz-portes/), meublesModeles: fileHas(/^07-zzzzzzzz-/),
  };
  const LOC = T('LOC_MAISONS', {}), CRIMES = T('CRIME_DEF', {});
  // ce que la carte montre de la vie des villes : maisons à louer et poterne, activités, endroits à fouiller
  const VIE_MAP = { louer: [], poterne: null, act: [], f2: [] };
  const reelle =(h) => (JOUR ? dur(h * JOUR / 24) : '');
  const hj = (h) => `${nfmt(h)} h de jeu${JOUR ? ` <small>(${esc(reelle(h))} réelles)</small>` : ''}`;
  const bldNom = (k) => (LOC[k] && LOC[k].nom) || (k === 'cave' ? 'la cave de l’auberge' : k === 'grange' ? 'la grange du ranch' : lieuName(k));
  // (un lieu secret ou souterrain ne se nomme qu'une fois les secrets révélés)
  const secPlace = (k) => !!((LM[k] && (LM[k].secret || LM[k].under)) || (BLD[k] && BLD[k].under));
  const bldLink = (k, t) => { if (!k) return ''; const x = pages.has('li:' + k) ? placeLink(k, cap(t ?? bldNom(k))) : esc(cap(t ?? bldNom(k))); return secPlace(k) ? secS(x) : x; };
  const ouPub = (x, z) => {
    const L = placeAt(x, z); if (!L) return 'dans la nature';
    const nm = lieuName(L.key), m = L.near ? nm.match(/^(les?) (.*)$/i) : null;
    const t = !L.near ? placeLink(L.key) : m ? (m[1].toLowerCase() === 'le' ? 'près du ' : 'près des ') + placeLink(L.key, m[2]) : 'près de ' + placeLink(L.key);
    return L.secret || L.under ? secS(t) : t;
  };
  const figK = (key, box, capt, href) => figInline(figRect(key), box, capt, href);
  const semNom = (k) => (SEM[k] ? SEM[k].nom : 'jour ' + (k + 1));
  const plage = (L) => L.map(([a, b]) => (a <= 0 && b >= 24 ? 'à toute heure' : `de ${hours(a)} à ${hours(b)}`)).join(' et ');
  const liste = (a) => (a.length > 1 ? a.slice(0, -1).join(', ') + ' et ' + a[a.length - 1] : a[0] || '');
  // les heures d'ouverture mesurées (les douze jours) : « le Marchedi et le Vorndi, de 9 h à 19 h »
  const leJ = (k) => (/^[aeiouyéèêàâîôœ]/i.test(semNom(k)) ? 'l’' : 'le ') + semNom(k);
  const jours = (ks) => (ks.length <= 3 ? liste(ks.map(leJ)) : leJ(ks[0]) + ', ' + liste(ks.slice(1).map(semNom)));
  const fenTexte = (F) => {
    if (!F || !F.length) return '';
    const by = new Map();
    F.forEach((L, k) => { if (!L.length) return; const key = JSON.stringify(L); if (!by.has(key)) by.set(key, []); by.get(key).push(k); });
    if (!by.size) return 'jamais';
    return [...by.entries()].map(([key, ks]) => {
      const hors = F.map((_, k) => k).filter((k) => !ks.includes(k));
      const q = !hors.length ? 'tous les jours' : hors.length <= 3 && ks.length > hors.length ? `tous les jours sauf ${jours(hors)}` : jours(ks);
      return `${q}, ${plage(JSON.parse(key))}`;
    }).join(' ; ');
  };
  const pieces = (n) => plur(n, 'pièce', 'pièces');
  const signe = (v) => (v > 0 ? '+' : v < 0 ? '−' : '') + nfmt(Math.abs(v));
  // les effets d'un geste mesuré (amitié, mentalité, argent, objets, effets, blessure, foi)
  const fxTexte = (L) => {
    if (!L || !L.length) return '<small>rien</small>';
    const out = [], ami = {};
    for (const c of L) {
      if (c[0] === 'ami') { ami[c[2]] = ami[c[2]] || []; ami[c[2]].push(c[1]); continue; }
      if (c[0] === 'esprit') out.push(`mentalité ${signe(c[1])}`);
      else if (c[0] === 'earn') out.push(`on reçoit ${pieces(c[1])}`);
      else if (c[0] === 'pay') out.push(`on paie ${pieces(c[1])}`);
      else if (c[0] === 'give') out.push(`on reçoit ${IL(c[1], c[2] > 1 ? c[2] : undefined)}`);
      else if (c[0] === 'take') out.push(`on donne ${IL(c[1], c[2] > 1 ? c[2] : undefined)}`);
      else if (c[0] === 'buff') out.push(`<span class="tag">${esc(BUFFN2[c[1]] || humanKey(c[1]))}</span> ${hj(c[2])}`);
      else if (c[0] === 'hurt') out.push(`${c[1]} points de vie perdus`);
      else if (c[0] === 'pv') out.push(`${signe(c[1])} points de vie`);
      else if (c[0] === 'foi') out.push(`foi ${signe(c[2])} <small>(${esc(humanKey(c[1]))})</small>`);
    }
    for (const [k, ids] of Object.entries(ami)) out.unshift(`amitié ${signe(+k)} <small>(${uniq(ids).map((id) => (NPC_BY[id] ? npcLink(id, npcName(id)) : esc(id))).join(', ')})</small>`);
    return out.join(' · ');
  };
  const gain = (L, k) => (L || []).filter((c) => c[0] === k).reduce((a, c) => a + (c[1] || 0), 0);
  const quotesP = (a, who) => quotes((a || []).map((t) => String(t).replace(/^\(|\)$/g, '')), who);
  // un endroit du monde : là où il est, et le bouton de la carte
  const ouTexte = (x, z) => `${ouPub(x, z)} ${mapBtn('xy:' + Math.round(x) + ',' + Math.round(z), 'carte')}`;
  const nomNPC = (id) => (NPC_BY[id] ? npcLink(id, npcName(id)) : esc(humanKey(id)));
  const pct0 = (p) => (p === null || p === undefined ? '—' : Math.round(p * 100) + ' %');
  const TOOLD = (VIE.outils && VIE.outils.dmg) || null, TIERS_ = T('TIERS', ['pierre', 'cuivre', 'fer', 'acier']), TIERN = T('TIER_NAMES', {});
  const coups = (pv, kind, k = 1) => { const d = TOOLD && TOOLD[kind]; if (!d || !k) return null; return (Array.isArray(d) ? d : [d]).map((v) => Math.ceil(pv / (v * k))); };
  const catsVie = (c) => ({ c: [c] });

  // ---- le temps qui passe : la fiche de la journée reçoit le jour et la nuit du soleil du jeu
  {
    // (le soleil passe l'horizon entre deux minutes mesurées : à cinq minutes près)
    const C0 = VIE.ciel, p = pages.get('sys:journee');
    const CI = C0 && C0.lever !== null && C0.coucher !== null ? Object.assign({}, C0, { lever: Math.round(C0.lever * 12) / 12, coucher: Math.round(C0.coucher * 12) / 12 }) : C0;
    if (p && CI && CI.lever !== null && CI.coucher !== null && JOUR) {
      const jourH = CI.coucher - CI.lever, min = (h) => nfmt(Math.round(h * JOUR / 24 / 6) / 10) + ' minutes';
      let x = `<p class="lead">Dans la vallée, une journée entière dure ${nfmt(Math.round(JOUR / 6) / 10)} minutes de temps réel : le soleil se lève à ${hours(CI.lever)} et se couche à ${hours(CI.coucher)}, soit ${min(jourH)} de jour et ${min(24 - jourH)} de nuit. Une heure de jeu passe en ${nfmt(Math.round(JOUR / 24 * 10) / 10)} secondes. La semaine compte ${SEM.length} jours, chacun avec son nom et ses habitudes.</p>`;
      x += `<table class="t"><tr><th>Dans la vallée</th><th>En temps réel</th></tr>${[[1, 'une heure'], [6, 'une matinée (6 heures)'], [jourH, `le jour (de ${hours(CI.lever)} à ${hours(CI.coucher)})`], [24 - jourH, 'la nuit'], [24, 'une journée'], [24 * SEM.length, `une semaine de ${SEM.length} jours`]].map(([h, t]) => `<tr><td>${esc(t)}</td><td>${esc(reelle(h))}</td></tr>`).join('')}</table>`;
      x += `<p class="note">Le soleil est celui du jeu (sa hauteur minute par minute) ; la durée, la constante de la journée.${FV.sommeil ? ` Se coucher mène au lendemain matin : ${lk('sys:sommeil', 'dormir, et la fatigue')}.` : ''}</p>`;
      p.h = p.h.replace(/^<p class="lead">[\s\S]*?<\/p>/, x);
      p.s = `Journées de ${nfmt(Math.round(JOUR / 6) / 10)} minutes (${min(jourH)} de jour, ${min(24 - jourH)} de nuit), semaine de ${SEM.length} jours`;
    }
  }

  // ---- dormir, et la fatigue
  if (FV.sommeil) {
    const FP = U('FATIGUE_PENSEES', []), FE = U('FATIGUE_ENTREE', []), LD = U('LIT_DECOUVERT', {}), LP = U('LIT_PROTESTE', []);
    U('LIT_TAILLE'); U('LIT_INTERS'); U('LOC_CLES');
    const F = VIE.fatigue || {}, S = F.seuils || [];
    let h = intro(FV.sommeil, { skip: /génération nouvelle/i });
    h = `<div class="figrow">${['lit', 'paillasse', 'lit_geant'].map((id) => figK('prop:' + id, 70)).join('')}</div>` + h;
    if (S.length > 1) {
      const vig = F.vigueur || [], dv = vig[1] && S[1] ? vig[1][1] - S[1][1] : 0;
      const E = RE.endurance, FR = RE.fatigueRythme, CD = RE.coupsDurs, ms = RE.microSommeil;
      h += `<h3>La fatigue, heure après heure</h3><p class="note">Les heures passées debout depuis le dernier réveil (heures de jeu). Dormir remet tout à zéro${dv ? ` ; la ${lk('eff:vigueur', 'vigueur')} repousse la fatigue de ${plur(dv, 'heure', 'heures')}` : ''}.</p><table class="t"><tr><th>Debout depuis</th><th>Ce que pense le personnage</th><th>Ce que ça fait</th></tr>${S.filter(([st]) => st > 0).map(([st, v]) => {
        const fx = [];
        if (E && E[st] !== undefined && E[st] < 1) fx.push(`l’endurance revient à ${Math.round(E[st] * 100)} %`);
        if (FR && FR[0][st]) fx.push(`la mentalité baisse de ${nfmt(FR[0][st])} par heure`);
        if (CD && CD[st] > 1) fx.push(`les coups durs pèsent ×${nfmt(CD[st])}`);
        if (st >= 2) fx.push('paupières lourdes, clignements lents');
        if (RE.murmures && st >= RE.murmures[0]) fx.push('vue voilée, murmures');
        if (RE.silhouette && st >= RE.silhouette[0]) fx.push('une silhouette au coin de l’œil');
        if (ms && st >= ms[0]) fx.push(`les yeux se ferment tout seuls, une seconde (${pct(ms[1])} des clignements)`);
        return `<tr><th>${hj(v)}</th><td>${FE[st] ? `<i>${FILL(String(FE[st]).replace(/^\(|\)$/g, ''))}</i>` : ''}</td><td>${fx.map(esc).join(' ; ')}</td></tr>`;
      }).join('')}</table>`;
      if (FR) h += `<p>La mentalité s’use deux fois par seconde, au prorata des heures de jeu, et plus encore au-delà de ${FR[1]} h debout (${nfmt(FR[2])} de plus par heure)${RE.fatiguePlafond ? ` ; pas plus de ${RE.fatiguePlafond[0]} points par jour` : ''}. ${lk('sys:esprit', 'La mentalité')}.</p>`;
      if (RE.etrangeFatigue && F.k) { const k1 = (F.k.find(([, k]) => k >= 1) || [])[0], k0 = (F.k.find(([, k]) => k > 0) || [])[0]; h += `<p>L’étrange suit la fatigue : ses hasards sont multipliés jusqu’à ×${nfmt(1 + RE.etrangeFatigue[0])}${k0 !== undefined && k1 !== undefined ? `, à partir de ${k0 - 1} h debout, au plus fort à ${k1} h` : ''}.</p>`; }
      if (FP.some((a) => a && a.length)) h += `<details><summary>Toutes les pensées de la fatigue</summary>${FP.map((a, st) => (a && a.length ? `<h4>Stade ${st}</h4>${quotesP(a)}` : '')).join('')}</details>`;
    }
    const DJ = RE.dormirJour, AJ = RE.aubergeJour, AS = RE.aubergeSoir;
    h += `<h3>Se coucher</h3><p>On dort à toute heure, et l’on se réveille le lendemain matin.${DJ ? ` De ${hours(DJ[0])} à ${hours(DJ[1])}, le jeu le demande d’abord :` : ''}</p>${DJ ? quote(DJ[3]) : ''}${AS ? `<p>À ${placeLink('auberge', 'l’auberge')}, une chambre se loue ${pieces(AS[0])} la nuit${AJ ? ` ; le jour aussi (de ${hours(AJ[0])} à ${hours(AJ[1])}, ${pieces(AJ[2])}) : « ${esc(AJ[3])} »` : ''}.${FV.location ? ` Pour la semaine : ${lk('sys:location', 'louer une maison')}.` : ''}</p>` : ''}`;
    // les lits de la vallée
    const LI = VIE.lits || [];
    if (LI.length) {
      const CAT = { ferme: 'Chez vous, à la ferme', location: 'Une maison louée ou achetée', conjoint: 'Chez l’être aimé', public: 'Refuges et relais : à tout le monde', vide: 'Maisons vides, lits abandonnés', mort: 'Chez un habitant mort', autrui: 'Chez quelqu’un', cachot: 'Au cachot', geant: 'Chez les géants' };
      const by = {};
      for (const [id, x, z, c, bld, own] of LI) (by[c] || (by[c] = [])).push({ id, x, z, bld, own });
      h += `<h3>Les lits de la vallée</h3><p class="note">${plur(LI.length, 'lit', 'lits')} (lits, paillasses, lit des géants), classés comme le jeu les voit dans une partie neuve. <kbd>E</kbd> sur un lit : « Dormir ici ».</p><table class="t"><tr><th>À qui</th><th>Combien</th><th>Où</th></tr>${Object.entries(by).map(([c, L]) => `<tr><td>${esc(CAT[c] || cap(humanKey(c)))}</td><td>${L.length}</td><td>${uniq(L.map((q) => (q.own && c === 'autrui' ? nomNPC(q.own) + ' <small>(' + bldLink(q.bld) + ')</small>' : q.bld ? bldLink(q.bld) : ouPub(q.x, q.z)))).join(', ')}</td></tr>`).join('')}</table>`;
    }
    // dans le lit de quelqu'un
    const LDc = RE.litDecouvert, amiN = RE.litAmi ? RE.litAmi[0] : null;
    h += `<h3>Dans le lit de quelqu’un</h3><p>S’il est là et réveillé, il proteste${RE.litProteste ? ` (amitié ${signe(RE.litProteste[0])})` : ''} :</p>${quotes(LP)}<p>S’il rentre pendant la nuit, ou s’il dort dans la pièce, il vous trouve au réveil${LDc ? ` : amitié ${signe(LDc[2])}${amiN !== null ? ` (${signe(LDc[0])} pour un ami, à partir de l’amitié ${amiN})` : ''}, ${signe(LDc[1])} si c’est le lit de la fillette et que sa mère vous trouve` : ''}, une ${CRIMES.intrusion ? `intrusion (prime ${pieces(CRIMES.intrusion.prime)})` : 'intrusion'}, et dehors.</p>`;
    if (Object.keys(LD).length) h += `<details><summary>Ce qu’ils disent en vous trouvant</summary>${Object.entries(LD).map(([k, v]) => `<h4>${esc({ ami: 'Un ami', autre: 'Un autre', matin: 'Au matin', enfant: 'Dans le lit de la fillette', garde: 'Le garde' }[k] || cap(humanKey(k)))}</h4>${quotes([].concat(v))}`).join('')}</details>`;
    SP('sys:sommeil', { t: 'Dormir, et la fatigue', s: 'Se coucher à toute heure, les lits de la vallée, les heures sans sommeil', c: ['maisons', 'corps'], i: '☾', h, g: 'Dormir et se loger' }, FV.sommeil);
  }

  // ---- louer une maison (et l'acheter : 11-zzzz4-meubles.js)
  if (FV.location && Object.keys(LOC).length) {
    U('LOC_MAISONS');
    const LO = VIE.location || {}, ACH = Object.fromEntries((VIE.achat || []).map(([k, a, r]) => [k, [a, r]]));
    const KN = new Set(['nom', 'court', 'rue', 'loyer', 'cle', 'desc']);
    let h = `<div class="figrow">${figK('prop:ecriteau_louer', 70, 'L’écriteau')}${figK('prop:coffre_loc', 60, 'Le coffre')}</div>` + intro(FV.location);
    h += `<h3>Les maisons de la commune</h3><table class="t"><tr><th>Maison</th><th>Où</th><th>Loyer (${SEM.length} jours)</th><th>La nuit</th>${Object.keys(ACH).length ? '<th>À acheter</th><th>Revendue</th>' : ''}<th>Clé</th></tr>${Object.entries(LOC).map(([k, M]) => `<tr><td>${bldLink(k, M.nom)}</td><td>${esc(M.rue || '')}</td><td>${pieces(M.loyer)}</td><td><small>${nfmt(Math.round(M.loyer / SEM.length * 10) / 10)}</small></td>${Object.keys(ACH).length ? `<td>${ACH[k] ? pieces(ACH[k][0]) : '—'}</td><td>${ACH[k] && ACH[k][1] !== null ? pieces(ACH[k][1]) : '—'}</td>` : ''}<td>${M.cle && ITEMS[M.cle] ? IL(M.cle) : ''}</td></tr>`).join('')}</table>`;
    h += Object.entries(LOC).map(([k, M]) => `<h4>${esc(cap(M.nom))} ${BLD[k] ? mapBtn('li:' + k, 'carte') : ''}</h4>${M.desc ? `<p>${FILL(M.desc)}</p>` : ''}${Object.keys(M).filter((q) => !KN.has(q)).length ? `<dl class="kv">${Object.keys(M).filter((q) => !KN.has(q)).map((q) => `<dt>${esc(/prix|achat|vente/i.test(q) ? 'Prix d’achat' : cap(humanKey(q)))}</dt><dd>${typeof M[q] === 'number' ? pieces(M[q]) : tree(M[q], 2)}</dd>`).join('')}</dl>` : ''}`).join('');
    const E0 = Object.values(LO.ecriteaux || {}).find(Boolean);
    if (E0) h += `<h3>L’écriteau</h3><p class="note">Ce qu’on lit devant la maison (<kbd>E</kbd>) :</p>${quote(E0[1])}<p>${(E0[2] || []).map((t) => `<span class="tag">${esc(t)}</span>`).join(' ')}</p>`;
    if (LO.maire) h += `<h3>Chez le maire</h3><p>${NPC_BY.maire ? npcLink('maire') : 'Le maire'}, « Les maisons à louer » :</p>${quote(LO.maire, 'maire')}`;
    const B = LO.bail;
    if (B && B.lettres && B.lettres.length) {
      const R = RE.bailRappel, X = RE.bailExpulsion;
      h += `<h3>Le bail, jour après jour</h3><p class="note">Un bail mené dans le jeu sans payer le loyer suivant : les lettres arrivent au courrier${R && X ? ` (rappel ${R[0]} jours après l’échéance, expulsion au ${X[0]}ᵉ)` : ''}. Le coffre est saisi : on reprend ses affaires à la mairie contre la dette.</p><table class="t"><tr><th>Jour</th><th>Lettre</th></tr>${B.lettres.map(([j, from, sujet, texte]) => `<tr><td>${j === 0 ? 'le jour même' : 'jour ' + j}</td><td><details><summary>${esc(sujet)} <small>— ${esc(String(from).replace(/ de .*$/, ''))}</small></summary>${para(texte)}</details></td></tr>`).join('')}</table>`;
    }
    if (FV.meubles) h += `<p>${lk('sys:meubles', 'Acheter une maison, et la meubler')}</p>`;
    h += `<p>${mapBtn('couche:louer', 'Les maisons à louer sur la carte')}</p>`;
    const LP = (W.misc && W.misc.locations) || {};
    for (const [k, M] of Object.entries(LOC)) {
      const X = BLD[k] || (LP[k] && LP[k].ecriteau ? { x: LP[k].ecriteau[0], z: LP[k].ecriteau[2] } : null);
      if (X) VIE_MAP.louer.push([k, cap(M.nom), Math.round(X.x * 10) / 10, Math.round(X.z * 10) / 10, `À louer : ${M.loyer} pièces la semaine${ACH[k] ? `, ou ${ACH[k][0]} à acheter` : ''}`, 'sys:location']);
    }
    SP('sys:location', { t: 'Louer une maison', s: `Trois maisons en ville, à la semaine de ${SEM.length} jours`, c: ['maisons'], i: '⌂', h, g: 'Dormir et se loger' }, FV.location);
  }

  // ---- acheter une maison, et la meubler
  if (FV.meubles) {
    const MB = U('MEUBLES', {}); U('MEU_PLATS'); U('MEU_BLOQUE_TOUT'); U('MEUBLES_GARDE');
    const ACH = VIE.achat || [], SEMA = scal('MEU_SEMAINES');
    let h = `<div class="figrow">${Object.keys(MB).map((id) => { const pid = ITEMS[id] && ITEMS[id].place ? ITEMS[id].place : id; return figK(FIG['meuble:' + id] ? 'meuble:' + id : 'prop:' + pid, 56, esc(MB[id].nom || iname(id)), pages.has('it:' + id) ? '#/p/' + encodeURIComponent('it:' + id) : ''); }).join('')}</div>` + intro(FV.meubles);
    if (ACH.length) h += `<h3>Le prix d’une maison</h3><p class="note">${SEMA ? `${SEMA} semaines de loyer, comptant ; ` : ''}la commune la reprend à moitié prix. Un bail en cours se change en achat.</p><table class="t"><tr><th>Maison</th><th>Loyer</th><th>À acheter</th><th>Revendue</th></tr>${ACH.map(([k, a, r]) => `<tr><td>${bldLink(k)}</td><td>${LOC[k] ? pieces(LOC[k].loyer) : '—'}</td><td>${pieces(a)}</td><td>${r !== null ? pieces(r) : '—'}</td></tr>`).join('')}</table>`;
    const usage = (M) => [M.lit ? 'on y dort' : '', M.range ? 'on y range' : '', M.lampe ? 's’allume et s’éteint' : '', M.heure ? 'sonne les heures' : '', M.mur ? 's’accroche au mur' : '', M.plat ? 'se pose à plat' : '', M.dedans ? 'à l’intérieur seulement' : ''].filter(Boolean).join(', ');
    h += `<h3>Les meubles</h3><table class="t"><tr><th>Meuble</th><th>Garde-meuble</th><th>Caisse</th><th>Ce qu’il fait</th><th>À l’établi</th></tr>${Object.entries(MB).map(([id, M]) => `<tr><td>${ITEMS[id] ? IL(id) : esc(M.nom || id)}</td><td>${M.vente ? pieces(M.vente) : '—'}</td><td><small>${M.prix ? pieces(M.prix) : '—'}</small></td><td><small>${esc(usage(M))}</small></td><td><small>${M.recette ? needList(M.recette) : '—'}</small></td></tr>`).join('')}</table><p class="note">Le garde-meuble est au grenier de la mairie (${NPC_BY.maire ? npcLink('maire') : 'le maire'}) ; « Caisse » : ce qu’en rend la caisse d’expédition. Les recettes de l’établi se trouvent en assemblant, dans les livres et auprès des gens de métier.</p>`;
    const livres = Object.entries(LIVRES).filter(([, L]) => (L.recettes || []).some((r) => MB[r]));
    if (livres.length) h += `<p>Pour apprendre : ${livres.map(([b]) => IL('livre_' + b)).join(', ')}.</p>`;
    const AE = T('ACT_ETALS', []), bro = AE.find((E) => E.id === 'brocanteur');
    const occ = bro ? (bro.vend || []).filter(([id]) => MB[id]) : [];
    if (occ.length) h += `<p>D’occasion, le Marchedi, chez ${esc(bro.nom)} : ${occ.map(([id, p]) => `${IL(id)} <small>${pieces(p)}</small>`).join(', ')}.</p>`;
    SP('sys:meubles', { t: 'Acheter et meubler sa maison', s: 'Les maisons de la commune, le garde-meuble du maire, les meubles à poser', c: ['maisons'], i: '🪑', h, g: 'Dormir et se loger' }, [FV.meubles, FV.meublesModeles]);
  }

  // ---- la terre et l'arrosage
  {
    const TE = T('TERRE', null);
    if (TE && (FV.terre || TE.humide)) {
      used.add('TERRE');
      let h = FV.terre ? intro(FV.terre) : '';
      const doc = docOf('TERRE') || '';
      const jr = (v) => (JOUR && v % 24 === 0 ? plur(v / 24, 'jour', 'jours') + ` <small>(${esc(reelle(v))} réelles)</small>` : hj(v));
      const lead = TE.humide && TE.seche ? `La terre se soigne comme une bête de trait : arrosée, ou sous la pluie, elle reste humide ${jr(TE.humide)} ; sans eau, la culture tient encore ${jr(TE.seche)}, puis elle meurt${TE.fatigue ? ` ; ${TE.fatigue[0]} récoltes sans engrais, et elle s’épuise` : ''}.` : doc ? esc(cap(cleanText(doc))) : '';
      if (lead) h = `<p class="lead">${lead}</p>` + h.replace(/^<p class="lead">/, '<p>');
      const rows = [];
      if (TE.humide) rows.push(['Arrosée, ou sous la pluie', `la terre reste humide ${hj(TE.humide)}`]);
      if (TE.seche) rows.push(['Sans eau', `la culture tient encore ${hj(TE.seche)}, puis elle meurt ; une case labourée laissée vide redevient de l’herbe`]);
      if (TE.chaleur) rows.push(['La canicule', `sèche la terre ${nfmt(TE.chaleur)} fois plus vite`]);
      if (TE.fatigue && TE.lenteur) rows.push(['Une terre qui s’épuise', TE.fatigue.map((n, i) => `après ${n} récoltes sans engrais, la culture pousse ${TE.lenteur[i + 1] === 0.5 ? 'deux fois' : TE.lenteur[i + 1] === 0.25 ? 'quatre fois' : '×' + nfmt(1 / TE.lenteur[i + 1])} moins vite`).join(' ; ')]);
      if (TE.jachere) rows.push(['La jachère', `chaque ${hj(TE.jachere)} sous l’herbe efface une récolte du compte`]);
      h += `<h3>Les règles de la terre</h3><dl class="kv wide">${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${v}</dd>`).join('')}</dl>`;
      const eng = Object.keys(ITEMS).filter((id) => ITEMS[id].fert);
      if (eng.length) h += `<h3>L’engrais</h3><ul>${eng.map((id) => `<li>${IL(id)} — ${FILL(ITEMS[id].desc || '')}</li>`).join('')}</ul>`;
      const spr = Object.entries(PLACEABLES).filter(([, P]) => P.sprinkler);
      if (spr.length) h += `<h3>Les arroseurs</h3><div class="figrow">${spr.map(([id]) => figK('prop:' + id, 64)).join('')}</div><table class="t"><tr><th>Arroseur</th><th>Portée</th><th>Cases arrosées</th><th>Prix</th></tr>${spr.map(([id, P]) => `<tr><td>${ITEMS[id] ? IL(id) : esc(P.name)}</td><td>${plur(P.sprinkler, 'case', 'cases')} autour</td><td>${2 * P.sprinkler + 1} × ${2 * P.sprinkler + 1} (${(2 * P.sprinkler + 1) ** 2})</td><td>${P.price ? pieces(P.price) : '—'}</td></tr>`).join('')}</table><p class="note">Toutes les demi-heures, les cases à portée restent humides comme à l’arrosoir. Le carré arrosé se voit quand on tient un arroseur, ou qu’on en regarde un.</p>`;
      const PL = VIE.pluie;
      if (PL) h += `<h3>La pluie</h3><p>Mesuré sur ${nfmt(PL.jours)} jours du programme météo du jeu : il pleut ${freq(PL.pluie, PL.jours)} (${pct0(PL.pluie / PL.jours)} des jours, dont ${pct0(PL.orage / PL.jours)} d’orage), environ une heure sur ${nfmt(Math.round(1 / (PL.heures || 1)))} ; gel au petit matin ${pct0(PL.gel / PL.jours)} des jours, canicule ${pct0(PL.canicule / PL.jours)}. Sous la pluie, papillons et lucioles s’en vont.</p>`;
      const G = NPC_BY.grainetiere, rum = G && G.lines && G.lines.rumeurs ? G.lines.rumeurs.filter((t) => /\b(la terre|une terre|engrais|arros\w*|récoltes?)\b/i.test(t)) : [];
      if (rum.length) h += `<h3>Ce qu’en dit la grainetière</h3>${quotes(rum, 'grainetiere')}`;
      h += `<p>${link('cat:cultures', 'Les cultures')} · ${link('sys:journee', 'Le temps qui passe')}</p>`;
      SP('sys:terre', { t: 'La terre et l’arrosage', s: 'Humide deux jours, la culture perdue deux jours après, la terre qui s’épuise, l’engrais, les arroseurs', c: ['cultures'], i: '🌧', h }, FV.terre);
    }
  }

  // ---- crocheter
  const CT = VIE.crocT || null, CS = T('CROC_SERRURE', []);
  const PO = VIE.portes || [];
  const f2 = INTER.filter((it) => it.kind === 'f2' || it.kind === 'f2_trappe');
  if (FV.croc) {
    U('CROC_SERRURE'); U('CROC_PINS');
    const CR = VIE.crochet || {};
    let h = intro(FV.croc, { skip: /poterne/i });
    const SRCc = (SRC.crochets || []).filter((q) => q.k === 'shop');
    h += `<p>${ITEMS.crochets ? IL('crochets') : ''}${SRCc.length ? ` : ${SRCc.map((q) => `${npcLink(q.npc)} <small>${pieces(q.price)}</small>`).join(', ')}` : ''}${RECIPES.some((r) => r.out === 'crochets') ? ` ; à l’établi : ${needList(RECIPES.find((r) => r.out === 'crochets').need)}` : ''}.${RE.crocParJeu ? ` ${RE.crocParJeu[0]} crochets par jeu.` : ''}</p>`;
    if (CR.sans) h += quote(String(CR.sans).replace(/^\(|\)$/g, ''));
    const PC = (CT && CT.pins) || T('CROC_PINS', []);
    if (CS.length) {
      const rt = RE.crocRetombe;
      h += `<h3>Les serrures</h3><p class="note">Plus la serrure est bonne, plus il y a de goupilles, plus elles vont vite, et plus la fenêtre pour les caler est courte (temps passé sur la ligne, à chaque passage). Un raté fait du bruit, peut casser un crochet, et sur une bonne serrure faire retomber la goupille d’avant.</p><table class="t"><tr><th></th><th>Serrure</th><th>Goupilles</th><th>Fenêtre</th><th>Crochet cassé</th><th>Goupille qui retombe</th><th>Dans la vallée</th></tr>${CS.map((nm, i) => {
        const d = i + 1, dr = PO.filter((q) => q.diff === d && !q.deco && !q.poterne), mb = f2.filter((it) => it.data && it.data.lock === d);
        const win = CT && CT.zone && CT.vit ? `${nfmt(Math.round(CT.zone[i] / CT.vit[i] * 100) / 100)} s` : '—';
        return `<tr><td>${d}</td><td>${esc(nm)}</td><td>${PC[i] ?? '—'}</td><td>${win}</td><td>${CT && CT.casse ? pct0(CT.casse[i]) : '—'}</td><td>${rt && d >= rt[0] ? pct0(rt[1][i]) : '—'}</td><td><small>${[dr.length ? plur(dr.length, 'porte', 'portes') : '', mb.length ? plur(mb.length, 'meuble', 'meubles') : ''].filter(Boolean).join(', ')}</small></td></tr>`;
      }).join('')}</table>`;
      const M = CR.menus && Object.values(CR.menus).find(Boolean);
      if (M) h += `<p class="note">Devant une porte fermée à clé :</p>${quote(M[1])}<p>${(M[2] || []).map((t) => `<span class="tag">${esc(t)}</span>`).join(' ')}</p>`;
    }
    const EN = RE.crocEntend, VO = RE.crocVoit, BR = RE.crocBruit, MA = RE.crocMains;
    let b = '';
    if (EN) b += `<li>Le bruit porte à ${EN[0]} m. Pour chaque point de bruit, un habitant qui dort l’entend ${pct0(EN[2])} des fois s’il est chez lui (ou à moins de ${EN[1]} m), ${pct0(EN[3])} sinon ; éveillé, dans une maison : ${pct0(EN[4])} chez lui, ${pct0(EN[5])} ailleurs ; dehors : ${pct0(EN[7])} à moins de ${EN[6]} m, ${pct0(EN[8])} plus loin.</li>`;
    if (BR) b += `<li>Une goupille calée fait ${nfmt(BR[0])} point de bruit, un raté ${nfmt(BR[1])}, un crochet qui casse ${nfmt(BR[2])} de plus.</li>`;
    if (VO) b += `<li>Un passant qui vous voit (à moins de ${VO[0]} m, sans mur entre vous, ou à moins de ${VO[1]} m) vous surprend, chaque demi-seconde, ${pct0(VO[7])} des fois le jour, ${pct0(VO[6])} la nuit, ${VO[9]} fois plus à moins de ${VO[8]} m ; de côté ${pct0(VO[4])} de ces chances, de dos ${pct0(VO[5])}.</li>`;
    if (MA) b += `<li>Fatigué, les mains tremblent : la fenêtre rétrécit jusqu’à ${pct0(MA[0])} ; ivre, de ${pct0(1 - MA[2])}.</li>`;
    if (b) h += `<h3>Le bruit, les témoins</h3><ul>${b}</ul>`;
    const EF = CRIMES.effraction;
    h += `<h3>Pris</h3><p>Vu ou entendu : ${EF ? `une effraction (prime ${pieces(EF.prime)}, oubliée après ${EF.oubli} jours sans récidive)` : 'une effraction'}${RE.crocEsprit ? `, mentalité ${signe(RE.crocEsprit[0])}` : ''}. Réussi : la porte s’ouvre${RE.crocOuverte ? `, et reste déverrouillée ${RE.crocOuverte[0]} s` : ''} ; de l’intérieur d’une maison, une porte fermée à clé s’ouvre au verrou.</p><p>${lk('sys:portes', 'Les portes de la vallée')} · ${lk('sys:poterne', 'La poterne')} · ${lk('sys:crimes', 'Crimes et avis de recherche')}</p>`;
    SP('sys:crochetage', { t: 'Crocheter une serrure', s: 'Les goupilles, le bruit, les passants', c: ['maisons'], i: '🗝', h, g: 'Portes et serrures' }, FV.croc);
    // ---- la poterne
    const PT = VIE.poterne;
    if (PT || LM.poterne) {
      let hp = figK('porte:poterne', 90, 'La poterne, côté douves') + intro(FV.croc, { only: /poterne/i });
      if (PT) hp += `<h3>Des deux côtés</h3><dl class="kv wide"><dt>Du dehors</dt><dd>${quotesP(PT.dehors)}</dd><dt>De la ville, le jour</dt><dd>${quotesP(PT.jour)}</dd><dt>La nuit</dt><dd>${quotesP(PT.nuit)}</dd><dt>Derrière soi</dt><dd>${quotesP(PT.ferme)}</dd></dl>`;
      const PX = (W.misc && W.misc.poterne) || LM.poterne || null;
      if (PX) VIE_MAP.poterne = [Math.round(PX.x * 10) / 10, Math.round(PX.z * 10) / 10, 'La poterne', 'sys:poterne'];
      hp += `<p>On remonte des douves par ${lk('sys:corps', 'les échelles de fer')}. ${LM.poterne ? placeLink('poterne') + ' ' + mapBtn('li:poterne') : PX ? ouTexte(PX.x, PX.z) : ''}</p>`;
      SP('sys:poterne', { t: 'La poterne', s: 'Une porte basse dans le rempart est : on sort, on ne rentre pas', c: ['maisons'], i: '🚪', h: hp, g: 'Portes et serrures' });
    }
  }
  // ---- les portes
  if (FV.portes && PO.length) {
    U('PORTE_COUL'); U('PORTE_PEINTURES'); U('PORTE_STYLE_BLD'); U('PORTE_TEINTE');
    const STN = { ferme: 'de ferme, à écharpe', rustique: 'rustique', ville: 'de ville, à panneaux peints', boutique: 'de boutique, vitrée', auberge: 'de l’auberge, cloutée', mairie: 'de la mairie', garde: 'du garde, à judas', forge: 'de la forge', roulotte: 'de roulotte', double: 'à deux battants', eglise: 'de l’église', poterne: 'la poterne' };
    const sts = uniq(PO.filter((d) => d.st).map((d) => d.st).concat(FIG['porte:eglise'] ? ['eglise'] : []));
    let h = `<div class="figrow">${sts.map((st) => figK('porte:' + st, 90, esc(cap(STN[st] || humanKey(st))))).join('')}</div>` + intro(FV.portes);
    const hache = (sol) => { const c = coups(sol, 'hache'); return c ? c.map((n, i) => `<span title="hache ${esc(TIERN[TIERS_[i]] || '')}">${n}</span>`).join(' / ') : '—'; };
    const vraies = PO.filter((d) => !d.deco && d.bld);
    h += `<h3>Les portes, une à une</h3><p class="note">${plur(vraies.length, 'porte', 'portes')} qui s’ouvrent (sans compter les portes de décor). Coups de hache pour l’enfoncer : de pierre / de cuivre / de fer / d’acier. Une porte enfoncée reste ouverte${RE.portesRepar ? ` ${RE.portesRepar[0]} jours, le temps que l’habitant la fasse réparer` : ''}.</p><table class="t"><tr><th>Porte</th><th>Sorte</th><th>Serrure</th><th>Hache</th><th>À qui</th><th>La forcer</th></tr>${vraies.map((d) => `<tr><td>${bldLink(d.bld)}${vraies.filter((q) => q.bld === d.bld).length > 1 ? ` <small>${vraies.filter((q) => q.bld === d.bld).indexOf(d) + 1}</small>` : ''}</td><td><small>${esc(STN[d.st] || d.st || '')}${d.pierre ? ', encadrement de pierre' : ''}</small></td><td>${d.poterne ? '<small>ne s’ouvre que de l’intérieur</small>' : d.diff ? `${d.diff} <small>(${esc(CS[d.diff - 1] || '')})</small>` : '—'}</td><td>${d.sol ? hache(d.sol) : '<small>ne se force pas</small>'}</td><td>${d.own ? nomNPC(d.own) : `<small>${esc({ commune: 'la commune', abandon: 'personne', ferme: 'vous' }[d.lieu] || d.lieu || '')}</small>`}</td><td><small>${d.sol ? (d.crime ? esc(d.crime) + (CRIMES[d.crime] ? ` (${pieces(CRIMES[d.crime].prime)})` : '') : 'rien') : ''}</small></td></tr>`).join('')}</table>`;
    h += `<p>${lk('sys:crochetage', 'Crocheter une serrure')} · ${lk('sys:casser', 'Ramasser et casser')}</p>`;
    SP('sys:portes', { t: 'Les portes de la vallée', s: 'Leur allure, leur serrure, leur solidité', c: ['maisons'], i: '🚪', h, g: 'Portes et serrures' }, FV.portes);
  }

  // ---- fouiller
  const F2T = T('F2_TYPES', {});
  const f2Nom = (t) => { const B = T('BU_TITRES', {}); return B[t] || cap(String((F2T[t] && F2T[t].lab) || humanKey(t)).replace(/^(Fouiller|Ouvrir|Forcer|Chaparder dans|Chaparder à|Chaparder|Plonger la main dans|Remplir|Décrocher|Descendre à) ?/, '')); };
  const f2Lieux = { maison: 'chez quelqu’un', eglise: 'à l’église', abandon: 'chez les disparus', public: 'à la commune, dans la rue', rebut: 'aux ordures', libre: 'à personne' };
  if (FV.fouilles) {
    const OBJ = U('F2_OBJETS', []), CA = U('F2_CACHES', {}), PA = U('F2_PAPIERS', {}), CRI = U('F2_CRIS', {}), PL = U('F2_PLAINTES', {});
    const TEM = [U('F2_TEMOIN', []), U('F2_TEMOIN_PUBLIC', []), U('F2_TEMOIN_REBUT', []), U('F2_TEMOIN_ABANDON', []), U('F2_TEMOIN_MORT', [])], VI = U('F2_VIDES', []);
    U('F2_TYPES'); U('F2_POOLS');
    const spots = INTER.filter((it) => it.kind === 'f2' && it.data);
    const vus = spots.filter((it) => it.data.t !== 'cache');
    const RF = VIE.refill || {};
    for (const it of spots) VIE_MAP.f2.push([Math.round(it.x * 10) / 10, Math.round(it.z * 10) / 10, f2Nom(it.data.t), it.data.t === 'cache' ? 1 : 0, sousTerre(it) ? 1 : 0, f2Lieux[it.data.lieu] || '']);
    let h = intro(FV.fouilles);
    h += `<p class="note">${plur(vus.length, 'endroit', 'endroits')} à fouiller dans une partie neuve (et des cachettes que seuls certains papiers révèlent). <kbd>E</kbd> : on fouille quelques secondes, puis ${FV.butin ? lk('sys:butin', 'le menu de butin') : 'le butin'} s’ouvre. ${mapBtn('couche:fouilles', 'Les endroits sur la carte')}</p>`;
    // les meubles et ce qu'on y trouve
    const types = Object.keys(F2T).filter((t) => t !== 'cache');
    const cnt = (t) => spots.filter((it) => it.data.t === t).length;
    const figT = { tiroir: 'comptoir', tonneaux: 'tonneau', sacs_grain: 'sac', coffre_peche: 'malle', coffre_chasse: 'malle', coffre_roulotte: 'malle', sacristie: 'armoire', bu_etagere: 'etagere', bu_tiroir: 'table', bu_tonneau: 'tonneau', bu_caisse: 'caisse', bu_caisses: 'caisse', bu_sac: 'sac', bu_wagonnet: 'wagonnet', bu_coffre: 'coffre_vieux', cave_tonneaux: 'tonneau', cave_jambons: 'jambons', cave_caisse: 'caisse' };
    h += `<h3>Les meubles, et ce qu’on y trouve</h3><table class="t"><tr><th></th><th>Endroit</th><th>Butin</th><th>Fouille</th><th>Papier</th><th>Se remplit</th><th>Dans la vallée</th></tr>${types.map((t) => { const Y = F2T[t], pid = FIG['prop:' + t] ? t : figT[t]; return `<tr><td>${pid && FIG['prop:' + pid] ? figInline(figRect('prop:' + pid), 30) : ''}</td><td>${esc(f2Nom(t))}</td><td>${Y.table && pages.has('bt:' + Y.table) ? link('bt:' + Y.table, humanKey(Y.table.replace(/^(f2|bu)_/, ''))) : '<small>selon le lieu</small>'}</td><td>${nfmt(Y.d)} s</td><td>${Y.p ? pct0(Y.p) : '—'}</td><td>${Y.r >= 9999 ? 'jamais' : plur(Y.r, 'jour', 'jours')}</td><td>${cnt(t) || '—'}</td></tr>`; }).join('')}</table>${RE.refillAbandon ? `<p class="note">Chez les disparus et chez les morts, personne ne regarnit les armoires : ${RE.refillAbandon[1]} fois plus lentement, et jamais moins de ${RE.refillAbandon[0]} jours. Les tables de butin sont des secrets (révéler).</p>` : ''}`;
    // par lieu
    const by = {};
    for (const it of vus) { const k = it.data.bld || ('@' + ((placeAt(it.x, it.z) || {}).key || '?')); (by[k] || (by[k] = [])).push(it); }
    const ligne = (L) => uniq(L.map((it) => it.data.t)).map((t) => { const a = L.filter((it) => it.data.t === t), lk2 = a.find((it) => it.data.lock), n2 = a.length; return `${esc(f2Nom(t))}${n2 > 1 ? ' ×' + n2 : ''}${lk2 ? ` <small title="fermé à clé">🔒${lk2.data.lock}${lk2.data.cle && ITEMS[lk2.data.cle] ? ' ' + IL(lk2.data.cle) : ''}</small>` : ''}`; }).join(', ');
    h += `<h3>Où fouiller</h3><table class="t"><tr><th>Lieu</th><th>Chez</th><th>Ce qu’on y fouille</th><th>Se remplit</th></tr>${Object.entries(by).sort((a, b) => b[1].length - a[1].length).map(([k, L]) => { const own = uniq(L.map((it) => it.data.own).filter(Boolean)); const rf = uniq(L.map((it) => RF[it.id]).filter((v) => v !== undefined)).sort((a, b) => a - b); return `<tr${secPlace(k.replace(/^@/, '')) || k === '@?' ? ' class="sec"' : ''}><td>${k.startsWith('@') ? (k === '@?' ? 'dans la nature' : placeLink(k.slice(1))) : bldLink(k)}</td><td>${own.length ? own.map(nomNPC).join(', ') : `<small>${esc(uniq(L.map((it) => f2Lieux[it.data.lieu] || it.data.lieu)).join(', '))}</small>`}</td><td>${ligne(L)}</td><td><small>${rf.length ? (rf[0] === rf[rf.length - 1] ? plur(rf[0], 'jour', 'jours') : `${rf[0]} à ${rf[rf.length - 1]} jours`) : ''}</small></td></tr>`; }).join('')}</table>`;
    // chez qui c'est voler
    const nb = (l) => vus.filter((it) => it.data.lieu === l).length, V = CRIMES.vol;
    h += `<h3>Voler, ou pas</h3><ul><li>Chez quelqu’un, dans un commerce, à l’église (${nb('maison') + nb('eglise')}) : c’est un vol. Vu : ${V ? `vol (prime ${pieces(V.prime)})` : 'un vol'}${RE.volAmitie ? `, amitié ${signe(RE.volAmitie[0])} avec le propriétaire` : ''}, le garde accourt ; pas vu : le lendemain, il se plaint, et les objets pris chez lui se reconnaissent.</li><li>Chez les disparus (${nb('abandon')}) : pas un vol, mais les voisins n’aiment pas ça.</li><li>À la commune, dans la rue (${nb('public')}) : vol si l’on vous voit ; aux ordures (${nb('rebut')}) : une remarque ; ailleurs (${nb('libre')}) : à personne.</li></ul>`;
    const vides = VI.concat(...Object.values(F2T).map((Y) => Y.vides || []));
    h += `<details><summary>Ce qu’on entend : les témoins, les propriétaires, les plaintes du lendemain</summary><h4>Les témoins</h4>${quotes([].concat(...TEM))}<h4>Le propriétaire qui vous surprend</h4><table class="t">${Object.entries(CRI).map(([k, v]) => `<tr><th>${k === '_' ? 'les autres' : nomNPC(k)}</th><td>${quotes([].concat(v), k)}</td></tr>`).join('')}</table><h4>Le lendemain</h4><table class="t">${Object.entries(PL).map(([k, v]) => `<tr><th>${k === '_' ? 'les autres' : nomNPC(k)}</th><td>${quotes([].concat(v), k)}</td></tr>`).join('')}</table>${vides.length ? `<h4>Vide</h4>${quotesP(uniq(vides))}` : ''}</details>`;
    const cles = ['cle_bureau', 'cle_cave'].filter((id) => ITEMS[id]);
    if (cles.length) h += `<h3>Les clés</h3><p>${cles.map((id) => IL(id)).join(', ')} : sans elles, il faut ${lk('sys:crochetage', 'crocheter')}.${W.misc && W.misc.caveAuberge ? ` La cave de l’auberge s’ouvre par une trappe fermée à clé.` : ''}</p>`;
    if (OBJ.length) h += `<h3>Les objets du quotidien</h3><p>${ILs(OBJ.map((o) => o[0]).filter((id) => ITEMS[id]))}</p>`;
    // les cachettes et les papiers (secrets)
    const pools = {};
    for (const [id, P] of Object.entries(PA)) (pools[P.pool || '_'] || (pools[P.pool || '_'] = [])).push([id, P]);
    const poolNom = (p) => (p === '_' ? 'Trouvé dans une cachette' : NPC_BY[p] ? `Chez ${npcName(p)}` : p === 'tri' ? 'Les casiers du tri, à la poste' : p === 'boite' ? 'La boîte aux lettres' : p === 'rebut' ? 'Les poubelles' : p === 'cave' ? 'La cave de l’auberge' : p === 'morel' ? 'La maison Morel' : p === 'bastien' ? 'La maison Bastien' : cap(bldNom(p)));
    let s = `<h3>Les cachettes</h3><table class="t"><tr><th>Cachette</th><th>Ce qu’il y a</th><th>Révélée par</th></tr>${Object.entries(CA).map(([c, C]) => `<tr><td>${esc(cap(C.nom))}${C.own ? ` <small>(${nomNPC(C.own)})</small>` : ''}</td><td>${(C.lots || []).map(([id, n]) => (id === 'argent' ? pieces(n) : IL(id, n > 1 ? n : undefined))).join(', ')}${C.papier && PA[C.papier] ? ` ; ${esc(PA[C.papier].t)}` : ''}</td><td>${Object.entries(PA).filter(([, P]) => P.cache === c).map(([, P]) => `« ${esc(P.t)} »`).join(', ')}</td></tr>`).join('')}</table>`;
    s += `<h3>Les papiers</h3><p class="note">${plur(Object.keys(PA).length, 'papier', 'papiers')}, qu’on relit dans la sacoche (onglet Lettres).</p>${Object.entries(pools).map(([p, L]) => `<details><summary>${esc(poolNom(p))} <small>(${L.length})</small></summary>${L.map(([id, P]) => `<section class="bookpage"><h4>${esc(P.t)}${P.cache ? ' <small>— révèle une cachette</small>' : ''}</h4>${para(P.x)}${P.s ? `<p class="note">${FILL(P.s)}</p>` : ''}</section>`).join('')}</details>`).join('')}`;
    h += SEC(s, 'Les cachettes et les papiers (leurs textes complets) sont masqués : révélez les secrets pour les lire.');
    SP('sys:fouilles', { t: 'Fouiller', s: 'Armoires, commodes, tiroirs-caisses, étals, cachettes : ce qu’on y trouve, et chez qui', c: ['fouilles'], i: '🔎', h, g: 'Fouiller' }, FV.fouilles);
  }
  // ---- le menu de butin
  if (FV.butin) {
    const BC = U('BU_CATS', {}), BO = U('BU_OUTILS', {}), BE = U('BU_ETAGERE_BLD', {}), SO = U('BU_SOUPCON', []), SP2 = U('BU_SOUPCON_PROPRIO', []);
    ['BU_MEUBLES', 'BU_CONTENEURS', 'BU_MAIN', 'BU_TITRES', 'BU_TITRES_LAB', 'BU_TITRES_PROPS'].forEach((k) => used.add(k));
    let h = intro(FV.butin);
    if (Object.keys(BE).length) h += `<h3>Les étagères, selon la maison</h3><table class="t">${Object.entries(BE).map(([k, t]) => `<tr><td>${bldLink(k)}</td><td>${pages.has('bt:' + t) ? link('bt:' + t, humanKey(t.replace(/^(f2|bu)_/, ''))) : esc(t)}</td></tr>`).join('')}</table>`;
    if (SO.length || SP2.length) h += `<h3>Ouvrir sans rien prendre, sous les yeux de quelqu’un</h3>${quotes(SO)}${SP2.length ? `<p>Le propriétaire :</p>${quotes(SP2)}` : ''}`;
    if (Object.keys(BC).length) h += `<details><summary>Ce que dit le menu, selon la sorte d’objet</summary><table class="t">${Object.entries(BC).map(([k, v]) => `<tr><th>${esc(CATN[k] || cap(humanKey(k)))}</th><td>${FILL(v)}</td></tr>`).join('')}</table></details>`;
    if (Object.keys(BO).length) h += `<details><summary>Et des outils</summary><table class="t">${Object.entries(BO).map(([k, v]) => `<tr><th>${esc(cap(humanKey(k)))}</th><td>${FILL(v)}</td></tr>`).join('')}</table></details>`;
    h += `<p>${lk('sys:fouilles', 'Fouiller')} · ${lk('sys:casser', 'Ramasser et casser')}</p>`;
    SP('sys:butin', { t: 'Le menu de butin', s: 'Choisir ce qu’on prend ; la boutique', c: ['fouilles'], i: '🧺', h, g: 'Fouiller' }, FV.butin);
  }
  // ---- ramasser et casser
  if (FV.objets) {
    const OM = U('OBJ_MAT', {}), OC = U('OBJ_CASSE', {}), OR = U('OBJ_RAMASSE', {}), OJ = U('OBJ_JAMAIS', []), OCR = U('OBJ_CRIS', {}), OPL = U('OBJ_PLAINTES', {}), OPE = U('OBJ_PENSEES', {});
    ['OBJ_OUTILS', 'OBJ_DMG', 'OBJ_KINDS_PROTEGES', 'OBJ_COMMUNS', 'OBJ_CLES_SURES', 'OBJ_TOMBES', 'OBJ_TEMOIN_ABANDON', 'OBJ_TEMOIN_MORT', 'OBJ_M', 'OBJ_MODELES'].forEach((k) => used.add(k));
    const VO = VIE.objets || {};
    const pn = (id) => (PLACEABLES[id] && PLACEABLES[id].name) || (ITEMS[id] && ITEMS[id].name) || T('BU_TITRES_PROPS', {})[id] || PROP_LABELS[id] || cap(humanKey(id));
    let h = intro(FV.objets);
    const MATN = { bois: 'Le bois', pierre: 'La pierre', metal: 'Le métal', poterie: 'La poterie', verre: 'Le verre', paille: 'La paille', tissu: 'La toile' };
    h += `<h3>Les matières</h3><table class="t"><tr><th>Matière</th><th>L’outil</th><th>Sinon</th></tr>${Object.entries(OM).map(([k, M]) => `<tr><td>${esc(MATN[k] || cap(k))}</td><td>${M.tout ? 'n’importe quel outil, ou le marteau' : Object.entries(M.k || {}).map(([o, f]) => `${esc(o)}${f !== 1 ? ` <small>(×${nfmt(f)})</small>` : ''}`).join(', ')}</td><td>${M.besoin ? `<i>${FILL(M.besoin.replace(/^\(|\)$/g, ''))}</i>` : ''}</td></tr>`).join('')}</table>`;
    const outil = (mat) => (mat === 'bois' ? 'hache' : mat === 'pierre' || mat === 'metal' ? 'pioche' : null);
    const tot = (id) => VO[id] || null;
    const grp = {};
    for (const [id, C] of Object.entries(OC)) (grp[C[0]] || (grp[C[0]] = [])).push([id, C]);
    h += `<h3>Ce qui se casse</h3><p class="note">Coups avec l’outil de pierre / de cuivre / de fer / d’acier (sous l’effet de la force, deux fois moins). « Dans la vallée » : combien il y en a dans une partie neuve, et combien se cassent vraiment (les autres portent une quête, un mécanisme, une fouille…).${RE.coupsEntaille ? ` Une entaille s’efface après ${RE.coupsEntaille[0]} jours.` : ''}</p>${Object.entries(grp).map(([mat, L]) => `<h4>${esc(MATN[mat] || cap(mat))}${outil(mat) ? ` <small>— ${esc(outil(mat))}</small>` : ''}</h4><table class="t"><tr><th>Objet</th><th>Solidité</th><th>Coups</th><th>On récupère</th><th>Dans la vallée</th></tr>${L.sort((a, b) => a[1][1] - b[1][1]).map(([id, C]) => { const o = C[3] || {}, t = tot(id), cs = outil(mat) ? coups(C[1], outil(mat), (OM[mat] && OM[mat].k && OM[mat].k[outil(mat)]) || 1) : null, mt = OM[mat] && OM[mat].tout && TOOLD && TOOLD.marteau ? Math.ceil(C[1] / TOOLD.marteau) : 0; return `<tr><td>${esc(pn(id))}${o.lourd ? ' <small>lourd</small>' : ''}${o.prof ? ' <span class="tag warn">profanation</span>' : ''}${o.tier ? ` <small>pioche ${esc(TIERN[TIERS_[o.tier]] || '')} au moins</small>` : ''}</td><td>${C[1]}</td><td><small>${cs ? cs.map((n, i) => (o.tier && i < o.tier ? '—' : n)).join(' / ') : mt ? `${plur(mt, 'coup', 'coups')} de marteau` : '—'}</small></td><td><small>${(C[2] || []).map(([it, a, b, p]) => `${IL(it)} ${a === b ? a : a + '–' + b}${p !== undefined ? ` (${pct0(p)})` : ''}`).join(', ')}</small></td><td><small>${t ? `${t.n}${t.casse !== t.n ? ` (${t.casse} cassables)` : ''}` : '—'}</small></td></tr>`; }).join('')}</table>`).join('')}`;
    h += `<h3>Ce qui se ramasse</h3><table class="t"><tr><th>Objet</th><th>Devient</th><th>Dans la vallée</th></tr>${Object.entries(OR).map(([id, R]) => { const t = tot(id); return `<tr><td>${esc(pn(id))}</td><td>${ITEMS[R.item] ? IL(R.item, R.n) : esc(R.item)} <small>« ${esc(R.lab || '')} »</small></td><td><small>${t ? `${t.n}${t.ramasse !== t.n ? ` (${t.ramasse} à prendre)` : ''}` : '—'}</small></td></tr>`; }).join('')}</table>`;
    // à qui c'est : les crimes, mesurés objet par objet
    const cr = {}, li = {}, pr = {};
    for (const A of Object.values(VO)) { for (const [k, n] of Object.entries(A.crimes || {})) cr[k] = (cr[k] || 0) + n; for (const [k, n] of Object.entries(A.lieux || {})) li[k] = (li[k] || 0) + n; for (const [k, n] of Object.entries(A.prot || {})) pr[k] = (pr[k] || 0) + n; }
    const LIEUX = { maison: 'chez quelqu’un', commerce: 'dans un commerce', abords: 'devant chez quelqu’un (moins de 4 m de ses murs)', commune: 'une maison de la commune', public: 'en ville, à la commune', cimetiere: 'au cimetière', abandon: 'chez les disparus', mort: 'chez un mort', ferme: 'chez vous', nature: 'dans la nature' };
    h += `<h3>À qui c’est</h3><p>Casser chez quelqu’un, c’est une effraction${CRIMES.effraction ? ` (${pieces(CRIMES.effraction.prime)})` : ''} ; devant chez lui, dans un commerce, en ville, un vol${CRIMES.vol ? ` (${pieces(CRIMES.vol.prime)})` : ''} ; une tombe, une croix, un calvaire, une profanation${CRIMES.profanation ? ` (${pieces(CRIMES.profanation.prime)})` : ''}, et la malédiction qui va avec. On entend les coups de hache, même en dormant. Pas vu : la plainte du lendemain.${RE.casseAmitie ? ` Pris : amitié ${signe(RE.casseAmitie[1])} (${signe(RE.casseAmitie[0])} pour ce qu’on ramasse).` : ''}</p>`;
    if (Object.keys(li).length) h += `<table class="t"><tr><th>Où sont les objets (partie neuve)</th><th>Combien</th></tr>${Object.entries(li).sort((a, b) => b[1] - a[1]).map(([k, n]) => `<tr><td>${esc(LIEUX[k] || k)}</td><td>${n}</td></tr>`).join('')}</table>`;
    const PRN = { erreur: 'indéterminé (le calcul du jeu échoue)', mécanisme: 'une quête ou un mécanisme', marqué: 'un autre module s’en sert (quête, étal, fouille…)', usage: 'une interaction y tient', attaché: 'une interaction y est attachée', zone: 'au cachot ou au temple', travaux: 'les bancs de la place (les petits travaux)', cachette: 'une cachette', 'lit de la ferme': 'le lit de la ferme', dynamique: 'posé en cours de partie', inconnu: 'inconnu', joueur: 'posé par vous' };
    if (Object.keys(pr).length) h += `<details><summary>Ce qui ne se casse pas (${Object.values(pr).reduce((a, b) => a + b, 0)} objets dans une partie neuve)</summary><table class="t">${Object.entries(pr).sort((a, b) => b[1] - a[1]).map(([k, n]) => `<tr><td>${esc(PRN[k] || k)}</td><td>${n}</td></tr>`).join('')}</table><p class="note">Jamais : ${esc(OJ.map(pn).join(', '))}.</p></details>`;
    if (Object.keys(OPE).length) h += `<h3>Ce qu’on pense</h3>${quotesP(Object.values(OPE))}`;
    h += `<details><summary>Les cris, les plaintes du lendemain</summary>${Object.entries(OCR).map(([k, v]) => `<h4>${esc({ casse: 'On casse chez quelqu’un', dehors: 'On casse devant chez lui', porte: 'On enfonce une porte', vol: 'On prend chez lui', volDehors: 'On prend devant chez lui', profane: 'Une profanation' }[k] || humanKey(k))}</h4>${quotes([].concat(...Object.values(v)))}`).join('')}<h4>Le lendemain</h4>${quotes([].concat(...Object.values(OPL)))}</details>`;
    const its = MF[FV.objets].items.filter((i) => ITEMS[i]);
    if (its.length) h += `<h3>Ce qu’on en rapporte</h3><p>${ILs(its)}</p>`;
    h += `<p>${lk('sys:portes', 'Les portes')} · ${lk('sys:fouilles', 'Fouiller')} · ${lk('sys:maledictions', 'Les malédictions')}</p>`;
    SP('sys:casser', { t: 'Ramasser et casser', s: 'Le bon outil, la solidité, ce qu’on récupère, et à qui c’était', c: ['fouilles'], i: '🪓', h, g: 'Ramasser et casser' }, FV.objets);
  }
  // ---- les morts qui restent au sol
  if (FV.depouilles) {
    const DP = U('DEP_POCHES', {}), DC = U('DEP_CHASSEUR', {}), DG = U('DEP_GEANT', {}), CRIS = U('DEP_CRIS', []), PEUR = U('DEP_PEUR', []), MERCI = U('DEP_MERCI', []);
    ['DEP_KEY', 'DEP_OS', 'DEP_L', 'DEP_ROLL', 'DEP_CORE', 'DEP_CORE_CHIEN', 'DEP_FERMIER', 'DEP_FERMIERE', 'DEP_HOSTILE'].forEach((k) => used.add(k));
    const VP = T('VOL_POCHES', {}), D = VIE.depouilles || {};
    const STN = ['le jour même', 'couleur de cire', 'des restes', 'des os'];
    let h = `<div class="figrow">${[0, 1, 2, 3].map((st) => figK('dep:fermier:' + st, 120, esc(cap(STN[st])))).join('')}</div>` + intro(FV.depouilles);
    const ST = D.stades || {};
    const ord = (n) => (n === 1 ? '1ᵉʳ' : n + 'ᵉ');
    const plages = (L) => { const o = [0, 1, 2, 3].map(() => []); (L || []).forEach((st, d) => o[st] && o[st].push(d)); return o.map((a) => (!a.length ? '—' : a[0] === 0 && a.length === 1 ? 'le jour même' : a[a.length - 1] === (L.length - 1) ? `à partir du ${ord(a[0])} jour` : a[0] === a[a.length - 1] ? `le ${ord(a[0])} jour` : `du ${ord(a[0])} au ${ord(a[a.length - 1])} jour`)); };
    if (ST.npc) { const a = plages(ST.npc), g = plages(ST.geant); h += `<h3>Les jours qui passent</h3><table class="t"><tr><th>Stade</th><th>Un mort, le chien</th><th>Un géant</th><th>Ce qu’en pense le fermier</th></tr>${[0, 1, 2, 3].map((st) => `<tr><th>${esc(cap(STN[st]))}</th><td>${esc(a[st])}</td><td>${esc(g[st])}</td><td>${D.pensees && D.pensees.homme && D.pensees.homme[st] ? `<i>${FILL(String(D.pensees.homme[st]).replace(/^\(|\)$/g, ''))}</i>` : ''}</td></tr>`).join('')}</table><p class="note">Le jour, des mouches et des corbeaux. Mesuré avec la fonction du jeu (jours après la mort).</p>`; }
    if (D.pensees) h += `<details><summary>Ce qu’en pense le fermier, selon le mort</summary><table class="t">${Object.entries(D.pensees).map(([k, a]) => `<tr><th>${esc({ homme: 'Un homme', femme: 'Une femme', enfant: 'Une enfant', chien: 'Le chien', fermier: 'Le fermier d’avant', chasseur: 'Le chasseur de primes', geant: 'Un géant' }[k] || k)}</th><td>${quotesP(uniq((a || []).filter(Boolean)))}</td></tr>`).join('')}</table></details>`;
    // fouiller les poches
    const PM = D.poches || {};
    const pochesRow = (id, P, M) => `<tr><td>${id.startsWith('_') ? esc({ _chasseur: 'Un chasseur de primes', _geant: 'Un géant (sa besace)' }[id] || id) : nomNPC(id)}</td><td>${P.nu ? '<small>rien : aux Sources, on ne porte rien</small>' : [P.b && P.b[1] ? `${P.b[0]}–${P.b[1]} pièces` : '', (P.m || []).length ? ILs(P.m) : '', (P.p || []).length ? `parfois ${ILs(P.p)}` : '', (P.r || []).length ? `rarement ${ILs(P.r)}` : ''].filter(Boolean).join(' ; ')}</td><td><small>${M ? `${nfmt(M.pieces)} pièces, ${nfmt(M.objets)} objets` : ''}</small></td></tr>`;
    const lignes = NPCS.map((d) => [d.id, VP[d.id] || DP[d.id] || DP._ || {}]).filter(([, P]) => P);
    h += `<h3>Fouiller ses poches</h3><p><kbd>E</kbd> sur le corps. Sous les yeux d’un habitant, c’est une profanation${CRIMES.profanation ? ` (prime ${pieces(CRIMES.profanation.prime)})` : ''}. ${PM._chasseur ? `Mesuré sur quatre cents morts : un objet personnel ${pct0((PM.forgeron || PM._chasseur).perso)} des fois, un objet rare ${pct0(Math.max(...Object.values(PM).map((m) => m.rare || 0)))} au plus.` : ''}</p><details><summary>Ce que chacun a sur lui</summary><table class="t"><tr><th>Qui</th><th>Dans ses poches</th><th>En moyenne</th></tr>${lignes.map(([id, P]) => pochesRow(id, P, PM[id])).join('')}${pochesRow('_chasseur', DC, PM._chasseur)}${pochesRow('_geant', DG, PM._geant)}</table></details>`;
    // enterrer
    const FO = D.fosses || {}, EH = RE.enterrerHeures, ME = RE.merci;
    h += `<h3>Enterrer</h3><div class="figrow">${figK('prop:tertre', 64, 'Un tertre')}${figK('prop:tertre_pierres', 64, 'Un tas de pierres')}</div><p>Avec une pelle (le chien, à mains nues)${EH ? `, en ${plur(EH[1], 'heure', 'heures')} de jeu (${plur(EH[0], 'heure', 'heures')} pour le chien)` : ''}. Ceux qui voient remercient${ME ? ` (amitié +${ME[0]}, +${ME[1]} pour ceux qui l’aimaient)` : ''}. On ne relève pas les morts dans la vallée : leur nom est gravé au cimetière, sur une tombe vide.</p>`;
    if (Object.keys(FO).length) h += `<table class="t">${[['la', 'Là où il est tombé'], ['dehors', 'Mort dans une maison'], ['traine', 'Le sol trop dur'], ['pierres', 'Sur la pierre, sous terre'], ['os', 'Des os'], ['chien', 'Le chien']].filter(([k]) => FO[k]).map(([k, t]) => `<tr><th>${esc(t)}</th><td>${quotesP(uniq(FO[k]))}</td></tr>`).join('')}</table>`;
    const TB = D.tombes || {};
    if (TB.fermier || TB.habitant) h += `<p class="note">Sur la croix de bois (<kbd>E</kbd>) :</p>${[TB.habitant, TB.fermier].filter(Boolean).map((r) => quote(r[1])).join('')}`;
    // ce qu'ils disent
    if ((D.reactions || []).length) h += `<h3>Ceux qui trouvent un corps</h3><p>Ils s’arrêtent, se signent, reculent ; la nouvelle court${RE.nouvelleJours ? ` (${RE.nouvelleJours[0]} jours)` : ''}.</p><table class="t">${D.reactions.map(([who, t, qui, st, txt]) => `<tr><th>${nomNPC(who)}</th><td><small>${t === 'npc' ? `devant ${qui ? nomNPC(qui) : 'un mort'}` : esc({ chien: 'devant le chien', fermier: 'devant le fermier d’avant', chasseur: 'devant un chasseur de primes' }[t] || t)}${st ? `, ${esc(STN[st])}` : ''}</small><br><i>${FILL(txt)}</i></td></tr>`).join('')}</table>`;
    h += `<details><summary>La peur, la colère, la reconnaissance</summary><h4>En le voyant</h4>${quotes(PEUR)}<h4>Qui fouille un mort</h4>${quotes(CRIS)}<h4>Qui l’enterre</h4>${quotes(MERCI)}</details>`;
    const FA = RE.fermierAge;
    h += `<h3>Le fermier d’avant</h3><p>Celui qui est mort dans une partie précédente attend le suivant, là où il est tombé${FA ? ` (depuis ${FA[0]} jours, et ${FA[1]} de plus par vie écoulée)` : ''}, avec ce qu’il avait en poche ; dans sa veste, la même lettre du notaire que la vôtre. Enterré, son tertre reste pour ceux qui viennent après.</p>`;
    h += `<h3>Les géants</h3><div class="figrow">${figK('dep:geant:0', 150, 'Un géant abattu')}</div><p>Un géant abattu passe par les mêmes jours, deux fois plus lentement ; sa besace se fouille ; on ne l’enterre pas. ${lk('sys:geants', 'Les géants')}</p>`;
    h += `<div class="figrow">${figK('dep:chien:0', 70, 'Le chien')}${figK('dep:chien:3', 70, 'Des os')}</div><p>${lk('sys:chien', 'Le chien')} · ${lk('sys:morts', 'La mort des habitants')}</p>`;
    SP('sys:depouilles', { t: 'Les morts qui restent au sol', s: 'Les jours qui passent, les poches, enterrer', c: ['fouilles'], i: '⚰', h, g: 'Les morts' }, FV.depouilles);
  }

  // ---- les activités des villes et villages
  if (FV.activites) {
    const AC = VIE.act || {}, FEN = AC.fen || {}, LIM = AC.lim || {}, FX = AC.fx || {}, RG = AC.regles || {}, TX = AC.txt || {}, MI = AC.mises || {};
    const ACT = (k) => U(k, null);
    const JEU = ACT('ACT_JEU') || {}, TRI = ACT('ACT_TRICHE') || [], BRAS = ACT('ACT_BRAS') || {}, TOUR = ACT('ACT_TOURNEE') || [], CONTES = ACT('ACT_CONTES') || [], APP = ACT('ACT_APPORTER') || [], LIV = ACT('ACT_LIVRER') || [];
    const VOE = ACT('ACT_VOEU') || {}, MASQ = ACT('ACT_MASQUE') || {}, ARC = ACT('ACT_ARCANES') || [], DIS = ACT('ACT_DISEUSE') || {}, PERDU = ACT('ACT_PERDU') || [], VIO = ACT('ACT_VIOLON') || [], EPI = ACT('ACT_EPITAPHES') || [], TIR = ACT('ACT_TIR') || {}, PEC = ACT('ACT_PECHE') || {}, ETA = ACT('ACT_ETALS') || [], NOMS = ACT('ACT_NOMS') || {};
    U('ACT_LOOKS'); U('ACT_AIRS');
    const act = (W.misc && W.misc.act) || {};
    const at = (kind) => INTER.filter((it) => it.kind === kind);
    const ou = (kinds, spot) => { const L = [].concat(...kinds.map(at)); if (L.length) return ouTexte(L[0].x, L[0].z) + (L.length > 1 ? ` <small>(${L.length})</small>` : ''); if (spot && act[spot]) { const S = Array.isArray(act[spot]) ? act[spot][0] : act[spot]; if (S && isFinite(S.x)) return ouTexte(S.x, S.z); } return ''; };
    const par = (k, un, plus) => (LIM[k] === null || LIM[k] === undefined ? '' : LIM[k] === 1 ? un : `${LIM[k]} ${plus}`);
    const regle = (t) => String(t || '').replace(/^Contre [^.]+\.\s*/, '').replace(/\s*Vous avez \d+ pièces\.?$/, '');
    const lines = (TBL, keys) => `<table class="t">${Object.entries(TBL).map(([k, v]) => `<tr><th>${k === '_' ? 'les autres' : nomNPC(k)}</th><td>${keys.filter((q) => v[q]).map((q) => `<p class="small"><b>${esc({ oui: 'Oui', gagne: 'Il gagne', perd: 'Il perd', refus: 'Non' }[q])} :</b> <i>${FILL(v[q], k)}</i></p>`).join('')}</td></tr>`).join('')}</table>`;
    const D = [];
    const A = (k, t, i, ouH, quand, prix, limite, body, extra) => D.push({ k, t, i, ou: ouH, quand, prix, limite, body, s: extra });
    // les dés, le vingt-et-un
    {
      const g = gain(FX.des_gagne, 'earn');
      A('des', 'Les dés : le passe-dix', '⚀', ou(['f2a_des']), fenTexte(FEN.des), MI.des && MI.des.opts ? MI.des.opts.filter((o) => /\d/.test(o)).map((o) => (o.match(/\d+/) || [''])[0]).join(', ') + ' pièces' : '', par('des', 'une partie par jour', 'parties par jour'),
        `${MI.des ? `<p>${esc(regle(MI.des.texte))}</p>` : ''}<p>Contre un habitué de l’auberge. Gagné : ${g ? `${pieces(g)} pour une mise de 10` : 'le double de la mise'} ; égalité : chacun reprend sa mise ; perdu : la mise. En gagnant : ${fxTexte((FX.des_gagne || []).filter((c) => c[0] !== 'earn' && c[0] !== 'pay'))} ; en perdant : ${fxTexte((FX.des_perd || []).filter((c) => c[0] !== 'earn' && c[0] !== 'pay'))}.</p>${MI.des_pipes && MI.des_pipes.opts ? `<h3>Avec vos dés à vous</h3><p>${ITEMS.des_pipes ? IL('des_pipes') : ''} : ${MI.des_pipes.opts.filter((o) => /dés/.test(o)).map(esc).join(', ')}. Un dé pipé tire deux fois et garde le meilleur. On s’en aperçoit ${RG.triche !== undefined ? pct(RG.triche) + ' des fois' : 'parfois'} : ${fxTexte((FX.des_triche || []).filter((c) => (c[0] === 'ami' || c[0] === 'esprit') && c[1] < 0))}, et plus personne ne joue avec vous pendant quelques jours.</p>${quotes(TRI)}` : ''}<details><summary>Ce qu’ils disent en jouant</summary>${lines(JEU, ['oui', 'gagne', 'perd', 'refus'])}</details>`);
      A('cartes', 'Le vingt-et-un', '♠', ou(['f2a_cartes']), fenTexte(FEN.cartes), MI.cartes && MI.cartes.opts ? MI.cartes.opts.filter((o) => /\d/.test(o)).map((o) => (o.match(/\d+/) || [''])[0]).join(', ') + ' pièces' : '', par('cartes', 'une main par jour', 'mains par jour'),
        `${MI.cartes ? `<p>${esc(regle(MI.cartes.texte))}</p>` : ''}<p>${RE.croupier ? `L’habitant tire jusqu’à ${RE.croupier[0]}. ` : ''}Pour une mise de 10 : gagné, on reçoit ${pieces(gain(FX.cartes_gagne, 'earn'))} ; vingt et un d’entrée, ${pieces(gain(FX.cartes_21, 'earn'))} ; égalité, ${pieces(gain(FX.cartes_egal, 'earn'))} (la mise) ; perdu, rien.</p>`);
    }
    // le bras de fer, la tournée
    A('bras', 'Le bras de fer', '✊', 'avec ceux qui le proposent (en parlant)', 'quand on les croise', '', par('bras', 'une fois par jour et par adversaire', 'fois par jour'),
      `<p>Poussez vite, plusieurs fois (clic, <kbd>E</kbd> ou <kbd>Espace</kbd>) : amenez son poing jusqu’à la table. On pousse plus fort le ventre plein, moins la jambe cassée ou ivre.</p><p>Gagné : ${fxTexte(FX.bras_gagne)}. Perdu : ${fxTexte(FX.bras_perd)}.</p><table class="t"><tr><th>Adversaire</th><th>Force</th><th>Ce qu’il dit</th></tr>${Object.entries(BRAS).map(([k, v]) => `<tr><td>${k === '_' ? 'les autres' : nomNPC(k)}</td><td>${nfmt(v.f || 1)}</td><td>${['oui', 'gagne', 'perd'].filter((q) => v[q]).map((q) => `<i>${FILL(v[q], k)}</i>`).join('<br>')}</td></tr>`).join('')}</table>`);
    A('tournee', 'La tournée', '🍺', NPC_BY.aubergiste ? `à l’auberge, ${npcLink('aubergiste')}` : 'à l’auberge', 'quand l’auberge est ouverte', (RG.tournee || []).length ? `${pieces(RG.tournee[0][1])} et plus` : '', par('tournee', 'une par jour', 'par jour'),
      `${(RG.tournee || []).length ? `<table class="t"><tr><th>Buveurs dans la salle</th>${RG.tournee.map(([n]) => `<td>${n}</td>`).join('')}</tr><tr><th>Prix</th>${RG.tournee.map(([, p]) => `<td>${p ?? '—'}</td>`).join('')}</tr></table>` : ''}<p>${fxTexte(FX.tournee)}. Un bavard, le verre levé, lâche une rumeur.</p>${quotes(TOUR)}`);
    // la veillée
    {
      const CO = TX.contes || [];
      A('veillee', 'La veillée du Veilledi', '🔥', ou(['f2a_veillee']), fenTexte(FEN.veillee), 'rien', par('veillee', 'un conte par soir', 'contes'),
        `<p>Au coin du feu de l’auberge, le plus vieux de la salle conte. ${fxTexte(FX.veillee)}.${RE.conteSemaine ? ` Un conte par semaine de ${RE.conteSemaine[0]} jours, toujours dans le même ordre.` : ''}</p>${CO.length ? `<table class="t"><tr><th>Veillée</th><th>Le conte</th></tr>${CO.map(([j, t]) => `<tr><td>jour ${j}</td><td>${esc(t || '')}</td></tr>`).join('')}</table>` : ''}<h3>Les contes</h3>${CONTES.map((C) => `<section class="bookpage"><h4>${esc(C.t)}</h4>${para(C.x)}</section>`).join('')}`);
    }
    // les petits travaux
    {
      const TJ = RG.travaux || {}, TN = { apporter: 'Apporter', livrer: 'Livrer un pli', reparer: 'Réparer un banc', balayer: 'Balayer le parvis' };
      A('travaux', 'Les petits travaux de la mairie', '📜', ou(['f2a_travaux']), 'à toute heure', 'payés par la commune', 'trois papiers par jour',
        `<p>Le tableau de la mairie : trois papiers punaisés chaque jour. ${fxTexte((FX.travaux || []).filter((c) => c[0] !== 'earn'))} à chaque travail fait.</p>${Object.keys(TJ).length ? `<table class="t"><tr><th>Travail</th><th>Payé</th><th>Sur quatre semaines</th></tr>${Object.entries(TJ).map(([t, L]) => { const ps = L.map((q) => q[0]); return `<tr><td>${esc(TN[t] || cap(humanKey(t)))}</td><td>${Math.min(...ps) === Math.max(...ps) ? pieces(ps[0]) : `${Math.min(...ps)} à ${Math.max(...ps)} pièces`}</td><td>${L.length} fois</td></tr>`; }).join('')}</table>` : ''}${APP.length ? `<details><summary>Ce qu’on demande d’apporter</summary><table class="t">${APP.map(([id, n, txt, pay]) => `<tr><td>${GROUPS[id] ? groupLink(id) : IL(id)} ×${n}</td><td><i>${FILL(txt)}</i></td><td>${pieces(pay)}</td></tr>`).join('')}</table>${LIV.length ? `<h4>Les plis à livrer</h4>${quotes(LIV.map((t) => t.replace('{npc}', '‹un habitant›')))}` : ''}</details>` : ''}${ITEMS.pli_mairie ? `<p>${IL('pli_mairie')}</p>` : ''}`);
    }
    // le puits aux souhaits
    {
      const VX = FX.voeux || [], rf = RG.voeuRefus, au = RG.voeuAutre;
      A('voeu', 'Le puits aux souhaits', '◎', ou(['f2a_voeu']), 'à toute heure', gain(VX[0] && VX[0][1], 'pay') ? pieces(gain(VX[0][1], 'pay')) : 'une pièce', par('voeu', 'un vœu par jour', 'vœux'),
        `${VX.length ? `<table class="t"><tr><th>Le vœu</th><th>Ce qu’il fait</th><th>Ce qu’on entend</th></tr>${VX.map(([l, g, sb]) => `<tr><td>${esc(l)}</td><td>${fxTexte(g.filter((c) => c[0] !== 'pay'))}</td><td><i>${sb ? FILL(String(sb).replace(/^\(|\)$/g, '')) : ''}</i></td></tr>`).join('')}</table>` : ''}${rf !== undefined ? `<p>${pct(rf)} des fois, le puits rend la pièce :</p>${quote(String(VOE.refus || '').replace(/^\(|\)$/g, ''))}${au !== undefined && au > rf && VOE.nom ? `<p>Et ${pct(Math.round((au - rf) * 1000) / 1000)} des fois :</p>${quote(String(VOE.nom).replace(/^\(|\)$/g, ''))}` : ''}` : ''}`);
    }
    // la diseuse
    A('diseuse', 'La diseuse de bonne aventure', '🔮', ou(['f2a_diseuse']), fenTexte(FEN.diseuse), gain(FX.diseuse, 'pay') ? pieces(gain(FX.diseuse, 'pay')) : '', par('diseuse', 'une fois par jour', 'fois'),
      `<div class="figrow">${figK('act:diseuse', 110, esc(NOMS.diseuse || ''))}${figK('prop:tente_diseuse', 90)}</div><p>Trois cartes : ce que l’almanach des événements prépare (nuit noire, tueur errant, neige, soleil, tornade), ce qui vous concerne, le temps de demain ; sinon, une arcane.</p>${(DIS.accueil || []).length ? quotes(DIS.accueil) : ''}${TX.diseuse ? `<details><summary>Une lecture (partie neuve)</summary>${para(TX.diseuse[1])}</details>` : ''}${ARC.length ? `<h3>Les arcanes</h3><table class="t">${ARC.map(([t, x]) => `<tr><th>${esc(t)}</th><td><i>${FILL(x)}</i></td></tr>`).join('')}</table>` : ''}${Object.keys(MASQ).length ? SEC(`<h3>Le Masque</h3><p>Quand le tueur masqué est à l’œuvre, la diseuse voit ce qu’il porte :</p><table class="t">${Object.entries(MASQ).map(([k, v]) => `<tr><th>${nomNPC(k)}</th><td><i>${esc(v)}</i></td></tr>`).join('')}</table>`, 'Ce que la diseuse voit du tueur est masqué (secrets).') : ''}`);
    // le crieur, le violoneux
    A('crieur', 'Le crieur public', '📣', ou([], 'crieur'), fenTexte(FEN.crieur), 'rien', 'deux fois par jour',
      `<div class="figrow">${figK('act:crieur', 110, esc(NOMS.crieur || ''))}</div><p>Il crie les nouvelles quand on passe : le jour, l’annonce, le temps de demain, ce qui se prépare, les décès, les avis de recherche, un objet perdu, une rumeur.</p>${(TX.crieur || []).length ? `<details><summary>Les nouvelles d’un jour</summary>${quotes(TX.crieur)}</details>` : ''}${PERDU.length ? `<h3>Perdu, trouvé</h3>${quotes(PERDU)}` : ''}`);
    A('violon', 'Le violoneux', '🎻', ou([], 'violon'), fenTexte(FEN.violon), 'une pièce, si l’on veut', '',
      `<div class="figrow">${figK('act:violon', 110, esc(NOMS.violon || ''))}</div><p>L’écouter apaise${RE.ecoute ? ` : ${RE.ecoute[0]} s puis ${RE.ecoute[1]} s à moins de neuf mètres, la mentalité remonte` : ''}. Un pourboire : ${fxTexte(FX.violon)}.</p>${quotes(VIO)}`);
    // le clocher, les cierges, les tombes
    A('clocher', 'Le clocher', '🔔', ou(['f2a_clocher']), fenTexte(FEN.clocher), 'rien', par('clocher', 'une fois par jour', 'fois'),
      '<p>Cent douze marches, puis la vue : la ville, la vallée, les Monts, et quelque chose d’inquiétant au loin (une courte scène). De là-haut, on repère quelques lieux qu’on ne connaissait pas.</p>');
    A('cierges', 'Les cierges', '🕯', ou(['f2a_cierge']), 'à toute heure', gain((FX.cierges || [])[0] && FX.cierges[0][1], 'pay') ? pieces(gain(FX.cierges[0][1], 'pay')) : '', par('cierge', 'un par jour', 'par jour'),
      `<div class="figrow">${figK('prop:porte_cierges', 70)}</div>${MI.cierge && MI.cierge.opts ? `<p>${MI.cierge.opts.map((o) => `<span class="tag">${esc(o)}</span>`).join(' ')}</p>` : ''}${(FX.cierges || []).length ? `<p>${fxTexte(FX.cierges[0][1].filter((c) => c[0] !== 'pay'))}.</p>` : ''}`);
    A('tombes', 'Les vieilles tombes', '✝', ou(['f2a_tombe']), 'à toute heure', 'une fleur', 'chaque tombe, une fois par jour',
      `<p>Au cimetière de la ville : lire l’épitaphe, fleurir la tombe. ${fxTexte(FX.fleurir)} ; le Vorndi, jour des morts : ${fxTexte(FX.fleurir_morts)}.</p>${quotes(EPI)}${OB('activites', 'FLEURS', []).length ? `<p class="note">Ce qui fleurit une tombe : ${ILs(OB('activites', 'FLEURS', []).filter((id) => ITEMS[id]))}.</p>` : ''}`);
    // les étals du Marchedi
    A('etals', 'Les étals du Marchedi', '⚖', ou([], 'vendeurs'), fenTexte(FEN.marche), '', '',
      `<div class="figrow">${ETA.map((E) => figK('etal:' + E.id, 100, esc(cap(E.nom)))).join('')}</div>${ETA.map((E) => { const off = ((RG.etals || []).find(([id]) => id === E.id) || [])[1] || []; return `<h3>${esc(cap(E.nom))}</h3>${quote(E.accueil)}<p>${plur(E.n, 'article', 'articles')} par semaine, parmi : ${(E.vend || []).map(([id, p]) => `${IL(id)} <small>${pieces(p)}</small>`).join(', ')}.${E.achete && RE.brocante ? ` Il rachète les curiosités ${pct0(RE.brocante[1])} de leur prix, ${RE.brocante[0]} par jour.` : ''}</p>${off.length ? `<p class="note">Les quatre premières semaines : ${off.map((L, i) => `<b>${i + 1}</b> ${L.map(([id]) => iname(id)).join(', ')}`).join(' · ')}.</p>` : ''}`; }).join('')}`);
    // Clairpré : les quilles, le four, la tombola
    {
      const Q = RG.quilles || [];
      A('quilles', 'Les quilles', '🎳', ou(['f2a_quilles']), fenTexte(FEN.quilles), 'rien', par('quilles', 'une partie par jour', 'parties par jour'),
        `<div class="figrow">${figK('prop:quilles_piste', 110)}</div><p>Deux boules pour neuf quilles. Les neuf d’un coup : ${fxTexte(FX.quilles_9)}.</p>${Q.length ? `<table class="t"><tr><th>Première boule</th><th>Quilles tombées</th><th>Les neuf d’un coup</th></tr>${Q.map(([v, m, p]) => `<tr><td>${v < 0 ? 'à gauche' : v > 0 ? 'à droite' : 'au milieu'}</td><td>${nfmt(m)} en moyenne</td><td>${pct(p)}</td></tr>`).join('')}</table><p class="note">Mesuré en lançant la boule mille cinq cents fois dans le jeu.</p>` : ''}`);
      const FO = RG.four || {}, fo = (o) => (o && o.out ? `${IL(o.out[0], o.out[1])}${o.prises.length ? ` <small>(${o.prises.map(([id, n]) => IL(id, n)).join(', ')})</small>` : ''}${o.delai ? ` <small>en ${plur(o.delai, 'heure', 'heures')}</small>` : ''}` : '');
      A('four', 'Le four banal', '🍞', ou(['f2a_four']), 'à toute heure', 'de la farine et une bûche', 'une fournée par jour',
        `<table class="t">${[['Une fournée', FO.pain], ['Avec du beurre et un œuf', FO.brioche], ['Jour de foire (le four est chaud)', FO.foire]].filter(([, o]) => o && o.out).map(([t, o]) => `<tr><th>${esc(t)}</th><td>${fo(o)}</td></tr>`).join('')}</table>`);
      const TB = RG.tombola || {};
      const val = (TB.lots || []).reduce((a, [id, n]) => a + ((ITEMS[id] && ITEMS[id].price) || 0) * n, 0), sur = RE.tirageSur ? RE.tirageSur[0] : null;
      A('tombola', 'La tombola du Foiredi', '🎟', ou(['f2a_tombola']), fenTexte(FEN.tombola), TB.billet ? `${pieces(TB.billet)} le billet` : '', TB.max ? `${plur(TB.max, 'billet', 'billets')} au plus` : '',
        `<div class="figrow">${figK('prop:stand_tombola', 90)}</div><p>${TB.tirage !== undefined ? `Tirage à ${hours(TB.tirage)}. ` : ''}${(TB.lots || []).length}${sur ? ` numéros sortent sur ${sur}` : ' lots'} ; chaque numéro sorti gagne son lot.${val && sur && TB.billet ? ` Un billet rend en moyenne ${nfmt(Math.round(val / sur * 10) / 10)} pièces de lots, ${pct0(val / sur / TB.billet)} de son prix.` : ''}</p><table class="t"><tr><th>Lot</th><th>Valeur</th></tr>${(TB.lots || []).map(([id, n, t]) => `<tr><td>${IL(id, n > 1 ? n : undefined)} <small>${esc(t || '')}</small></td><td>${ITEMS[id] && ITEMS[id].price ? pieces(ITEMS[id].price * n) : '—'}</td></tr>`).join('')}</table>`);
    }
    // les concours
    {
      const TI = RG.tir || {}, PE = RG.peche || {};
      const rangs = (L) => `<table class="t"><tr><th>Rang</th><th>Prix</th></tr>${(L || []).map(([r, g]) => `<tr><td>${r === 1 ? '1ᵉʳ' : r + 'ᵉ'}</td><td>${g.length ? fxTexte(g) : 'rien'}</td></tr>`).join('')}</table>`;
      A('tir', 'Le concours de tir du Chassedi', '⌖', ou(['f2a_tir']), fenTexte(FEN.tir), TI.inscription ? `${pieces(TI.inscription)} l’inscription` : '', 'une fois par jour de concours',
        `<div class="figrow">${figK('prop:cible', 80)}</div><p>Trois coups à quinze pas sur la cible de paille${RE.cibleScore ? ` : ${RE.cibleScore[0]} points au centre, un de moins par dixième du rayon` : ''}. Le guidon danse : ${(TI.amp || []).filter(([, a]) => a).map(([t, a]) => `${t === 'main' ? 'sans arme à soi' : 'avec ' + (t === 'arc' ? 'un arc' : 'un fusil')} ${nfmt(a)}`).join(', ')} (l’amplitude ; plus ivre ou apeuré, plus elle grandit).</p>${rangs(TI.prix)}${(TI.noms || []).length ? `<p>Les habitués : ${TI.noms.map(([id, a, b]) => `${nomNPC(id)} <small>${a}–${b}</small>`).join(', ')}.</p>` : ''}${Object.values(TIR).length ? quotes(Object.values(TIR), 'chasseur') : ''}`);
      A('peche', 'Le concours de pêche du Pêchedi', '🐟', ou(['f2a_peche']), `inscriptions ${fenTexte(FEN.peche)}${fenTexte(FEN.peche_jury) && fenTexte(FEN.peche_jury) !== 'jamais' ? ` ; présentation ${fenTexte(FEN.peche_jury)}` : RE.pecheJury ? ` ; présentation ${(FEN.peche || []).some((L) => L.length) ? leJ((FEN.peche || []).findIndex((L) => L.length)) + ', ' : ''}de ${hours(RE.pecheJury[0])} à ${hours(RE.pecheJury[1])}` : ''}`, PE.inscription ? `${pieces(PE.inscription)} l’inscription` : '', '',
        `<p>Ce qu’on tire du lac jusqu’à l’heure de la présentation compte ; on présente sa plus belle prise, et le jury classe par la valeur des poissons. Les habitants pêchent dans le même lac.</p>${rangs(PE.prix)}${(PE.noms || []).length ? `<p>Les concurrents : ${PE.noms.map(([id, n]) => `${nomNPC(id)} <small>${plur(n, 'prise', 'prises')}</small>`).join(', ')}.</p>` : ''}${Object.values(PEC).length ? quotes(Object.values(PEC), 'pecheur') : ''}`);
    }
    // sur la carte : l'endroit de chaque activité (le premier, s'il y en a plusieurs)
    const POS = { des: 'f2a_des', cartes: 'f2a_cartes', veillee: 'f2a_veillee', travaux: 'f2a_travaux', voeu: 'f2a_voeu', diseuse: 'f2a_diseuse', clocher: 'f2a_clocher', cierges: 'f2a_cierge', tombes: 'f2a_tombe', quilles: 'f2a_quilles', four: 'f2a_four', tombola: 'f2a_tombola', tir: 'f2a_tir', peche: 'f2a_peche', crieur: '@crieur', violon: '@violon', etals: '@vendeurs' };
    for (const d of D) {
      const q = POS[d.k]; if (!q) continue;
      let X = null;
      if (q[0] === '@') { const S = act[q.slice(1)]; X = Array.isArray(S) ? S[0] : S; } else X = at(q)[0];
      if (X && isFinite(X.x)) VIE_MAP.act.push([d.k, d.t, Math.round(X.x * 10) / 10, Math.round(X.z * 10) / 10, d.i, d.quand ? cap(d.quand) : '']);
    }
    // la fiche d'ensemble et celles de chaque activité
    let h = intro(FV.activites);
    h += `<p>${mapBtn('couche:activites', 'Les activités sur la carte')}</p><table class="t"><tr><th>Activité</th><th>Où</th><th>Quand</th><th>Combien</th><th>Par jour</th></tr>${D.map((d) => `<tr><td>${lk('act:' + d.k, d.t)}</td><td><small>${d.ou}</small></td><td><small>${esc(d.quand)}</small></td><td><small>${esc(d.prix)}</small></td><td><small>${esc(d.limite)}</small></td></tr>`).join('')}</table><p class="note">Les heures sont mesurées dans le jeu, quart d’heure par quart d’heure, sur les ${SEM.length} jours de la semaine.</p>`;
    SP('sys:activites', { t: 'Les activités des villes et villages', s: 'Jeux, concours, veillée, petits travaux, puits, diseuse…', c: ['activites'], i: '🎲', h, g: 'Ensemble' }, FV.activites);
    for (const d of D) SP('act:' + d.k, { t: d.t, s: d.quand ? cap(d.quand) : 'Activité', c: ['activites'], i: d.i, g: 'Les activités', h: `<dl class="kv">${d.ou ? `<dt>Où</dt><dd>${d.ou}</dd>` : ''}${d.quand ? `<dt>Quand</dt><dd>${esc(d.quand)}</dd>` : ''}${d.prix ? `<dt>Combien</dt><dd>${esc(d.prix)}</dd>` : ''}${d.limite ? `<dt>Par jour</dt><dd>${esc(d.limite)}</dd>` : ''}</dl>${d.body}<p>${lk('sys:activites', 'Toutes les activités')}</p>` });
  }

  // ---- l'équilibrage : la section du README, et les chiffres du jeu aujourd'hui
  if (DB.derived.equilibrage) {
    const md = DB.derived.equilibrage;
    const inl = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/(^|[\s(])\*([^*\s][^*]*?)\*(?=[\s).,;:]|$)/g, '$1<i>$2</i>');
    const out = [], L = md.split('\n');
    let i = 0;
    while (i < L.length) {
      const l = L[i];
      if (/^```/.test(l)) { const a = []; i++; while (i < L.length && !/^```/.test(L[i])) a.push(L[i++]); i++; out.push(`<pre class="code">${esc(a.join('\n'))}</pre>`); continue; }
      const m = l.match(/^(#{2,4})\s+(.*)$/);
      if (m) { if (m[1].length > 2) out.push(`<h${m[1].length}>${inl(m[2])}</h${m[1].length}>`); i++; continue; }
      if (/^\|/.test(l)) { const rows = []; while (i < L.length && /^\|/.test(L[i])) rows.push(L[i++]); const cells = (r) => r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim()); const hd = cells(rows[0]), body = rows.slice(2).map(cells); out.push(`<div class="scrollx"><table class="t"><tr>${hd.map((c) => `<th>${inl(c)}</th>`).join('')}</tr>${body.map((r) => `<tr>${r.map((c) => `<td>${inl(c)}</td>`).join('')}</tr>`).join('')}</table></div>`); continue; }
      if (/^\s*- /.test(l)) { const it = []; while (i < L.length && (/^\s*- /.test(L[i]) || (/^\s{2,}\S/.test(L[i]) && it.length))) { if (/^\s*- /.test(L[i])) it.push(L[i].replace(/^\s*- /, '')); else it[it.length - 1] += ' ' + L[i].trim(); i++; } out.push(`<ul>${it.map((t) => `<li>${inl(t)}</li>`).join('')}</ul>`); continue; }
      if (!l.trim()) { i++; continue; }
      const p = []; while (i < L.length && L[i].trim() && !/^(#|\||```|\s*- )/.test(L[i])) p.push(L[i++]);
      out.push(`<p>${inl(p.join(' '))}</p>`);
    }
    // les chiffres du jeu, aujourd'hui (les tables telles qu'elles sont)
    const vivant = [];
    if (Object.keys(LOC).length) vivant.push(['Loyers en ville (semaine de ' + SEM.length + ' jours)', Object.entries(LOC).map(([k, M]) => `${esc(M.court || M.nom)} ${pieces(M.loyer)}`).join(' · '), 'sys:location']);
    if ((VIE.achat || []).length) vivant.push(['Maisons à acheter', VIE.achat.map(([k, a]) => `${esc((LOC[k] && LOC[k].court) || k)} ${pieces(a)}`).join(' · '), 'sys:meubles']);
    if (RE.aubergeSoir) vivant.push(['La chambre de l’auberge', pieces(RE.aubergeSoir[0]) + ' la nuit', 'sys:sommeil']);
    const cr = Object.entries(CRIMES).filter(([, d]) => d.prime);
    if (cr.length) vivant.push(['Primes', cr.map(([k, d]) => `${esc(humanKey(k))} ${d.prime}`).join(' · '), 'sys:crimes']);
    const pr = (ids) => ids.filter((id) => ITEMS[id]).map((id) => `${esc(iname(id))} ${nfmt(ITEMS[id].price)}`).join(' · ');
    vivant.push(['Récoltes', pr(['radis', 'carotte', 'chou', 'citrouille', 'tomate']), 'cat:cultures']);
    vivant.push(['Poissons', pr(['carpe', 'brochet', 'silure', 'reine_lac', 'poisson_aveugle']), 'cat:poissons']);
    const bet = Object.keys(ITEMS).filter((id) => ITEMS[id].animal && ['hen', 'cow', 'horse', 'pig', 'sheep'].includes(ITEMS[id].animal));
    if (bet.length) vivant.push(['Bêtes', pr(bet), '']);
    const TBL = (VIE.act && VIE.act.regles && VIE.act.regles.tombola) || null, sur = RE.tirageSur ? RE.tirageSur[0] : null;
    if (TBL && TBL.billet && sur) { const v = (TBL.lots || []).reduce((a, [id, n]) => a + ((ITEMS[id] && ITEMS[id].price) || 0) * n, 0); vivant.push(['Tombola', `billet ${TBL.billet} ; rend ${pct0(v / sur / TBL.billet)}`, 'act:tombola']); }
    if (CAL && CAL.ev) vivant.push(['Fréquences', Object.entries(CAL.ev).map(([k, e]) => `${esc(humanKey(k))} : ${esc(freq(e.n, CAL.jours))}`).join(' · '), 'sys:journee']);
    const PLU = VIE.pluie;
    if (PLU) vivant.push(['Pluie', `${pct0(PLU.pluie / PLU.jours)} des jours, une heure sur ${nfmt(Math.round(1 / (PLU.heures || 1)))}`, 'sys:terre']);
    let h = `<p class="lead">Comment le jeu a été équilibré : la section « Équilibrage » du README, telle qu’elle est, et en tête les chiffres que le jeu porte aujourd’hui.</p><h3>Les chiffres du jeu, aujourd’hui</h3><table class="t">${vivant.filter(([, v]) => v).map(([k, v, id]) => `<tr><th>${id ? lk(id, k) : esc(k)}</th><td>${v}</td></tr>`).join('')}</table><p class="note">Lus dans les tables du jeu (LOC_MAISONS, CRIME_DEF, ITEMS…) et mesurés (fréquences, pluie) au moment où ce wiki a été construit.</p>`;
    h += `<div class="md">${out.join('')}</div>`;
    SP('sys:equilibrage', { t: 'L’équilibrage', s: 'Commerce, risques, survie, hasard : les mesures et les réglages', c: ['equilibrage'], i: '⚖', h });
  }

  // ==== PRISON, VOL À LA TIRE ET SENTIMENTS (modules à venir : leurs fiches se font d'elles-mêmes) ====
  // et, plus généralement, tout module de nouveautés qu'aucune fiche ne couvre encore
  const genericPage = (file, cat, g) => {
    const M = MF[file], HP = headParts(file);
    if (!M) return null;
    const id = 'mod:' + file.replace(/\.js$/, '');
    let h = intro(file);
    const looks = Object.keys(M.tables).filter((n) => /_LOOK$/.test(n) && FIG['look:' + n]);
    if (looks.length) h = `<div class="figrow">${looks.map((n) => figInline(figRect('look:' + n), 110, esc(cap(humanKey(n.replace(/_LOOK$/, '').toLowerCase()))))).join('')}</div>` + h;
    for (const o of M.objs) {
      const S2 = SYS.objs && SYS.objs[o];
      if (!S2 || S2.file !== file) continue;
      for (const [k, v] of Object.entries(S2.props)) { const st = proseStats(v); if (!st.code && st.prose >= 40) h += `<h3>${esc(cap(humanKey(k.toLowerCase())))}</h3>${plainTree(v, 1)}`; }
    }
    // les réglages simples (constantes et propriétés en majuscules), avec le commentaire qui les accompagne
    const reg = Object.entries(M.scal || {}).filter(([k, o]) => !TECH_TABLES.test(k) && (typeof o.v === 'number' || (typeof o.v === 'string' && o.v.length < 80))).map(([k, o]) => [k, o.v, o.doc]);
    for (const o of M.objs) { const S2 = SYS.objs && SYS.objs[o]; if (S2 && S2.file === file) for (const [k, v] of Object.entries(S2.props)) if (typeof v === 'number' || (typeof v === 'string' && v.length < 80)) reg.push([k, v, '']); }
    if (reg.length) h += `<h3>Quelques chiffres</h3><dl class="kv">${reg.map(([k, v, d]) => `<dt>${esc(cap(humanKey(k.toLowerCase())))}</dt><dd>${esc(typeof v === 'number' ? nfmt(v) : v)}${d ? ` <small>— ${esc(cleanText(d))}</small>` : ''}</dd>`).join('')}</dl>`;
    const its = M.items.filter((i) => ITEMS[i]);
    if (its.length) h += `<h3>Objets</h3><p>${ILs(its)}</p>`;
    // (les petites tables de nombres ou de mots comptent aussi ; pas les couleurs ni les modèles)
    const leafs = (v, acc = []) => { if (v === null || typeof v !== 'object') { acc.push(v); return acc; } for (const k in v) leafs(v[k], acc); return acc; };
    const simple = (v) => { const s = JSON.stringify(v); if (!s || s.length > 3000 || s === '{}' || s === '[]') return false; const L = leafs(v); return L.length > 0 && !(/\[/.test(s) && L.every((x) => typeof x === 'number')); };
    const names = Object.keys(M.tables).filter((n) => DB.tables[n] && !used.has(n) && !TECH_TABLES.test(n) && !/_LOOKS?$/.test(n) && DB.tables[n].file === file && !proseStats(DB.tables[n].v).code && (proseStats(DB.tables[n].v).prose >= 40 || simple(DB.tables[n].v)));
    for (const n of names) { used.add(n); h += `<h3>${esc(tableTitle(n, M.tables[n].doc))}</h3>${M.tables[n].doc ? `<p class="note">${esc(cap(cleanText(M.tables[n].doc)))}</p>` : ''}${plainTree(DB.tables[n].v, 1)}`; }
    if (!h.replace(/<[^>]+>/g, '').trim()) return null;
    SP(id, { t: HP.title || cap(humanKey(file.replace(/^\d\d-zzz\w?\d*-?|\.js$/g, ''))), s: HP.sub || '', c: [cat], g, i: '✦', h }, file);
    return id;
  };
  for (const f of [FILE.vol, FILE.prison, FILE.sentiments]) if (f) genericPage(f, 'prison', 'Prison, vol et sentiments');
  for (const f of Object.keys(MF)) if (!MODPAGE[f] && !/^07-/.test(f)) genericPage(f, 'nouveautes-autres', 'Autres nouveautés');
  // ce qui reste des tables de chaque module : en bas de sa fiche principale
  for (const f of Object.keys(MF)) { const pid = MODPAGE[f]; if (!pid) continue; const x = restTables(f); if (x) P(pid).h += x; }
  // les liens différés, et les fiches qui renvoient aux nouveautés
  const resolveLk = (s) => s.replace(/\u0002([^\u0003]*)\u0003([^\u0004]*)\u0004/g, (m, id, t) => {
    const text = t ? decodeURIComponent(t) : undefined;
    if (id.startsWith('@mod:')) { const pid = MODPAGE[id.slice(5)]; return pid ? link(pid) : ''; }
    return pages.has(id) ? link(id, text) : esc(text || id);
  });
  for (const p of pages.values()) if (p.h && p.h.includes('\u0002')) p.h = resolveLk(p.h);
  {
    const BACK = {};
    const add = (t, id) => { if (t === id || SYSP.includes(t) || !pages.has(t)) return; (BACK[t] || (BACK[t] = new Set())).add(id); };
    for (const id of SYSP) { const p = pages.get(id); if (!p) continue; for (const m of p.h.matchAll(/href="#\/p\/([^"]+)"/g)) { const t = decodeURIComponent(m[1]); if (/^(it|an|pnj|li|pl|lg|mil|sem|foi|div|my):/.test(t)) add(t, id); } }
    for (const [f, M] of Object.entries(MF)) { const pid = MODPAGE[f]; if (pid) for (const i of M.items) add('it:' + i, pid); }
    for (const [t, set] of Object.entries(BACK)) {
      const p = pages.get(t), ids = [...set].filter((i) => pages.has(i));
      if (!p || !ids.length) continue;
      p.h += `<h3 class="seealso">Dans les nouveautés</h3><ul class="cards">${ids.slice(0, 18).map((i) => `<li${isSec(i) && !p.x ? ' class="sec"' : ''}>${link(i)}</li>`).join('')}${ids.length > 18 ? `<li><small>et ${ids.length - 18} autres</small></li>` : ''}</ul>`;
    }
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
  const isSys = (id) => SYSP.includes(id);
  const sysGroup = (cat, t) => { const ids = byCat(cat).filter(isSys); return ids.length ? [{ t, ids }] : []; };
  const cats = [
    { id: 'nouveautes', t: 'Nouveautés', d: 'Tout ce qui est arrivé dans la vallée : le corps et l’esprit, les maisons et les serrures, fouiller et casser, les activités des villes, la chasse, la société, les événements, les Trois, les autres mondes, les merveilles…', page: true, nouveau: true },
    { id: 'commandes', t: 'Commandes et mécaniques', d: 'Les touches du jeu, et ce que les nouveautés y ajoutent.', page: true, nouveau: true },
    { id: 'habitants', t: 'Habitants', d: 'Les gens de la vallée : leurs journées, leurs boutiques, leurs quêtes, leurs histoires.', groups: groupBy(byCat('habitants'), (p) => p.g || 'Autres') },
    { id: 'lieux', t: 'Lieux', d: 'Villes, hameaux, lieux-dits, bâtiments, et ce qu’on y trouve.', groups: groupBy(byCat('lieux'), (p) => p.g) },
    { id: 'objets', t: 'Objets', d: 'Tout ce qui se ramasse, s’achète, se fabrique.', groups: groupBy(byCat('objets'), itemGroup) },
    { id: 'recettes', t: 'Recettes', d: 'Ce qui se fabrique, où, et avec quoi.', page: true, groups: sysGroup('recettes', 'Fabriquer') },
    { id: 'cultures', t: 'Cultures', d: 'Ce qui se sème au potager : temps de pousse, récolte, variétés ; la terre et l’arrosage.', page: true, groups: sysGroup('cultures', 'La terre') },
    { id: 'plantes', t: 'Plantes sauvages', d: 'Fleurs, herbes et champignons de chaque milieu.', groups: groupBy(byCat('plantes'), (p) => { const f = floraInfo[p.id.slice(3)]; return f && f.rar !== null && f.rar !== undefined ? cap(RAR[f.rar] || '') : 'Sans rareté connue'; }) },
    { id: 'arbres', t: 'Arbres', d: 'Les essences de la vallée.', groups: [{ t: 'Arbres', ids: sortT(byCat('arbres')) }] },
    { id: 'betes', t: 'Bêtes', d: 'Gibier, bêtes des bois, des eaux et des montagnes, et bêtes de ferme.', groups: groupBy(byCat('betes'), (p) => p.g) },
    { id: 'poissons', t: 'Poissons', d: 'Toutes les eaux, toutes les heures, du gardon à la Reine du lac.', groups: groupBy(byCat('poissons'), (p) => cap(RAR[FR[p.id.slice(3)]] || 'Autres')) },
    { id: 'milieux', t: 'Milieux', d: 'Chaque milieu a ses plantes et ses bêtes.', groups: [{ t: 'Milieux', ids: byCat('milieux') }] },
    { id: 'alchimie', t: 'Alchimie', d: 'Les potions, les plantes à faire nommer, la table d’alchimiste, et (en secret) les essences et les combinaisons.', groups: [{ t: 'Règles', ids: ['alch:regles', ...byCat('alchimie').filter(isSys)] }, { t: 'Potions', ids: sortT(byCat('alchimie').filter((i) => i !== 'alch:regles' && !isSys(i))) }] },
    { id: 'livres', t: 'Livres', d: 'Ceux des marchands et ceux de la grande bibliothèque.', groups: [...sysGroup('livres', 'Lire, emprunter'), ...groupBy(byCat('livres').filter((i) => !isSys(i)), (p) => { const b = p.id.replace(/^it:livre_/, ''); return LIVRES[b] && LIVRES[b].biblio ? 'La grande bibliothèque' : 'Chez les marchands'; })] },
    { id: 'langues', t: 'Langues perdues', d: 'L’aëlin et le gorrain : lexiques, écritures, inscriptions.', groups: [...sysGroup('langues', 'Apprendre'), { t: 'Langues', ids: byCat('langues').filter((i) => i.startsWith('lg:')) }, { t: 'Inscriptions', ids: byCat('langues').filter((i) => i.startsWith('ins:')) }] },
    { id: 'semaine', t: 'La semaine', d: `${SEM.length} jours, chacun avec son nom et ses habitudes.`, groups: [...sysGroup('semaine', 'Le temps'), { t: 'Les jours', ids: byCat('semaine').filter((i) => i.startsWith('sem:')) }] },
    { id: 'legendes', t: 'Légendes et lore', d: 'Légendes, fois, divinités, signes, textes du monde.', groups: groupBy(byCat('legendes'), (p) => (p.id.startsWith('my:') ? 'Légendes' : p.id.startsWith('foi:') ? 'Les fois' : p.id.startsWith('div:') ? 'Les divinités' : 'Textes')) },
    { id: 'cartes', t: 'Cartes des régions', d: 'Les cartes qu’on achète : jamais toute la vallée.', groups: [...sysGroup('cartes', 'Comment on les dessine'), { t: 'Cartes', ids: sortT(byCat('cartes').filter((i) => !isSys(i))) }] },
    { id: 'etrange', t: 'L’étrange', d: 'Apparitions, manifestations, lettres… (secrets).', groups: [{ t: 'L’étrange', ids: byCat('etrange') }] },
    { id: 'corps', t: 'Corps et esprit', d: 'Chutes, blessures, mentalité, le sommeil et la fatigue, ce qu’on mange, le chien, l’alcool.', nouveau: true, groups: groupBy(byCat('corps'), (p) => p.g || 'Le corps et l’esprit') },
    { id: 'maisons', t: 'Maisons, lits et serrures', d: 'Dormir et la fatigue, louer une maison, l’acheter et la meubler, les portes, crocheter une serrure, la poterne.', nouveau: true, groups: groupBy(byCat('maisons'), (p) => p.g || 'Se loger') },
    { id: 'fouilles', t: 'Fouiller, ramasser, casser', d: 'Les armoires et les tiroirs-caisses, le menu de butin, ce qui se casse et à qui c’était, les morts qui restent au sol.', nouveau: true, groups: groupBy(byCat('fouilles'), (p) => p.g || 'Fouiller') },
    { id: 'activites', t: 'Activités des villes et villages', d: 'Les dés, le vingt-et-un, la veillée, les petits travaux, le puits, la diseuse, les quilles, la tombola, les concours, les étals du Marchedi…', nouveau: true, groups: groupBy(byCat('activites'), (p) => p.g || 'Les activités') },
    { id: 'chasse', t: 'Chasse et attelage', d: 'Le fusil, les pièges, les bêtes dangereuses, les chasseurs, la charrette.', nouveau: true, groups: groupBy(byCat('chasse'), (p) => p.g || 'La chasse') },
    { id: 'societe', t: 'Société', d: 'La mort des habitants, les crimes et les primes, les Sources, les nains, les géants, les colporteurs.', nouveau: true, groups: groupBy(byCat('societe'), (p) => p.g || 'La vie de la vallée') },
    { id: 'evenements', t: 'Événements et divinités', d: 'Nuits noires, neige, soleil, tornades, prodiges, les Trois, les malédictions, le temple, les cinématiques.', nouveau: true, groups: groupBy(byCat('evenements'), (p) => p.g || 'Ce qui arrive') },
    { id: 'mondes', t: 'Autres mondes', d: 'Le pays des bonbons, les Ténèbres, le cauchemar, les Enfers.', nouveau: true, groups: groupBy(byCat('mondes'), (p) => p.g || 'Les mondes') },
    { id: 'merveilles', t: 'Merveilles et mystères', d: 'Objets légendaires et mythiques, l’Homme long, la Fondation.', nouveau: true, groups: groupBy(byCat('merveilles'), (p) => p.g || 'Merveilles') },
    { id: 'prison', t: 'Prison, vol à la tire et sentiments', d: 'Voler, être pris, le cachot ; ce que les gens ressentent.', nouveau: true, groups: groupBy(byCat('prison'), (p) => p.g || 'Fiches') },
    { id: 'nouveautes-autres', t: 'Autres nouveautés', d: 'Les modules nouveaux qui n’ont pas encore de section à eux.', nouveau: true, groups: groupBy(byCat('nouveautes-autres'), (p) => p.g || 'Fiches') },
    { id: 'equilibrage', t: 'Équilibrage', d: 'Comment le jeu a été réglé, et les chiffres qu’il porte aujourd’hui.', nouveau: true, groups: [{ t: 'Équilibrage', ids: byCat('equilibrage') }] },
    { id: 'butins', t: 'Butins', d: 'Ce qu’on trouve en fouillant les coffres et les caches (secrets).', groups: [{ t: 'Tables de butin', ids: sortT(byCat('butins')) }] },
    { id: 'autres', t: 'Autres tables', d: 'Les tables du jeu qui n’ont pas de section à elles, affichées telles quelles.', groups: [{ t: 'Tables', ids: sortT(byCat('autres')) }] },
  ].map((c) => (c.groups ? Object.assign(c, { groups: c.groups.filter((g) => g.ids.length) }) : c)).filter((c) => c.page || c.groups.some((g) => g.ids.length));

  // pages de catégorie à contenu propre : recettes, cultures
  {
    const bySt = {};
    RECIPES.forEach((r) => { (bySt[r.st || ''] || (bySt[r.st || ''] = [])).push(r); });
    let h = `<p class="lead">${RECIPES.length} recettes. Seules les recettes de base sont connues au départ ; les autres s’apprennent (quêtes, livres, habitants) ou se découvrent en assemblant les bons ingrédients.</p>`;
    for (const [st, rs] of Object.entries(bySt)) h += `<h3>${esc(cap(stationName(st || null)))}</h3><table class="t"><tr><th>Donne</th><th>Il faut</th><th>Connue</th></tr>${rs.map((r) => `<tr><td>${IL(r.out)}${r.n > 1 ? ` <small>×${r.n}</small>` : ''}</td><td>${needList(r.need)}</td><td><small>${CRAFT_BASE.has(r.out) ? 'dès le départ' : (teach[r.out] || []).length ? 'à apprendre' : 'à découvrir'}</small></td></tr>`).join('')}</table>`;
    if (Object.keys(MACHINES).length) h += `<h3>Les machines</h3><table class="t"><tr><th>Machine</th><th>On y met</th><th>On obtient</th><th>Temps</th></tr>${Object.entries(MACHINES).flatMap(([m, L]) => (L || []).map((e) => `<tr><td>${esc(machName(m))}</td><td>${needList(e.in)}</td><td>${IL(e.out[0], e.out[1])}</td><td>${nfmt(e.h)} h</td></tr>`)).join('')}</table>` + (Object.keys(MACHINE_HINT).length ? `<p class="note">${Object.values(MACHINE_HINT).map(esc).join(' ')}</p>` : '');
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
      cats.splice(cats.findIndex((c) => c.id === 'habitants') + 1, 0, { id: 'quetes', t: 'Quêtes', d: 'Toutes les quêtes des habitants.', page: true });
    }
  }
  // semaine : page d'ensemble
  if (SEM.length) P('cat:semaine', { t: 'La semaine', s: `${SEM.length} jours`, c: [], i: '📅', h: `<p class="lead">Dans la vallée, la semaine compte ${SEM.length} jours${DB.derived.jour ? `, et une journée dure ${Math.round(DB.derived.jour / 60)} minutes` : ''}.</p><table class="t">${SEM.map((J, k) => `<tr><th>${link('sem:' + k)}</th><td>${esc((J.annonce || '').replace(/^\(|\)$/g, ''))}</td></tr>`).join('')}</table>` });

  // les nouveautés : toutes les sections nouvelles, et les fiches des systèmes dans les sections anciennes
  {
    const SUBF = /^(eff|pr|scp|an:m|geant|mal|dieu|act):/;
    let h = `<p class="lead">Ce qui est arrivé dans la vallée, section par section. Chaque fiche est tirée du jeu lui-même : l’en-tête de ses modules, leurs tables, ce qu’ils calculent.</p>`;
    let n = 0;
    for (const c of [...cats.filter((q) => q.nouveau), ...cats.filter((q) => !q.nouveau)]) {
      const ids = SYSP.filter((id) => { const p = pages.get(id); return p && p.c.includes(c.id) && (!p.c.length || cats.findIndex((q) => p.c.includes(q.id)) === cats.indexOf(c)); });
      if (!ids.length) continue;
      const main = ids.filter((id) => !SUBF.test(id)), subs = ids.filter((id) => SUBF.test(id));
      n += ids.length;
      h += `<h2><a href="#/cat/${esc(c.id)}">${esc(c.t)}</a></h2>${c.nouveau ? '' : '<p class="note">(une section d’avant, qui s’est enrichie)</p>'}<ul class="nv">${main.map((id) => { const p = pages.get(id); return `<li${p.x ? ' class="sec"' : ''}>${link(id)}${p.s ? ` <small>— ${esc(p.s)}</small>` : ''}</li>`; }).join('')}</ul>${subs.length ? `<p class="note">Et ${subs.length} fiches : ${subs.slice(0, 40).map((id) => (isSec(id) ? secS(link(id)) : link(id))).join(' · ')}${subs.length > 40 ? '…' : ''}.</p>` : ''}`;
    }
    const newItems = uniq([...Object.values(MF).flatMap((M) => M.items), ...Object.keys(T('LEGENDAIRES', {}))]).filter((i) => pages.has('it:' + i));
    if (newItems.length) h += `<h2>Les objets nouveaux</h2><p class="note">Chacun a sa fiche, reliée aux sections qui en parlent (« Dans les nouveautés »).</p><p>${newItems.map((i) => IL(i)).join(', ')}</p>`;
    P('cat:nouveautes', { t: 'Nouveautés', s: `${n} fiches`, c: [], i: '✦', h });
  }
  // les commandes (menu du jeu), et les gestes que les nouveautés décrivent
  {
    let h = `<p class="lead">Les touches du jeu telles que les donne son menu « Commandes », puis les gestes que les nouveautés ajoutent.</p>`;
    const kb = (s) => String(s).replace(/<(?!\/?kbd>)[^>]*>/g, '');
    for (const g of SYS.commandes || []) h += `<h3>${esc(cap(g.t.toLowerCase()))}</h3><table class="t keys">${g.rows.map(([k, d]) => `<tr><th>${kb(k)}</th><td>${esc(d.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, '’'))}</td></tr>`).join('')}</table>`;
    const KEYRE = /(?:^|[\s(«])(E|G|F|R|Maj|Espace|Échap|Tab)(?=[\s),.;:»]|$)|\bclic\b|bouton (?:droit|gauche)|molette|flèches|←|→/i;
    const rows = [];
    // (seulement ce qu'une fiche publique dit déjà : rien des lieux cachés ni des secrets)
    const nrm = (x) => String(x).toLowerCase().replace(/&[a-z]+;/g, ' ').replace(/[^a-zà-ÿœ0-9]+/g, ' ').trim();
    const pubText = nrm(SYSP.filter((id) => !isSec(id)).map((id) => pages.get(id).h.replace(/<(li|p|span)\b[^>]*class="sec[^"]*"[^>]*>[\s\S]*?<\/\1>/g, ' ').replace(/<div class="sec">[\s\S]*?<\/div>/g, ' ').replace(/<[^>]+>/g, ' ')).join(' '));
    for (const f of Object.keys(MF)) {
      const pid = MODPAGE[f];
      if (!pid || isSec(pid)) continue;
      for (const q of headParts(f).parts) for (const s of clauses(q.t).map((c) => c.trim().replace(/\s*;$/, '.'))) if (KEYRE.test(s) && s.length < 360 && pubText.includes(nrm(s).slice(0, 80))) rows.push([pid, cap(s)]);
    }
    const wrapKeys = (s) => esc(s).replace(/(^|[\s(«])(E|G|F|R|Maj|Espace|Échap|Tab)(?=[\s),.;:»]|$)/g, '$1<kbd>$2</kbd>');
    if (rows.length) {
      const by = {}; for (const [pid, s] of rows) (by[pid] || (by[pid] = [])).push(s);
      h += `<h3>Dans les nouveautés</h3><table class="t">${Object.entries(by).map(([pid, a]) => `<tr><th>${link(pid)}</th><td>${uniq(a).map((s) => `<p>${wrapKeys(s)}</p>`).join('')}</td></tr>`).join('')}</table>`;
    }
    const mech = SYSP.filter((id) => { const p = pages.get(id); return p && !p.x && /^(corps|semaine|recettes|lieux|chasse)$/.test(p.c[0] || '') && !/^(eff):/.test(id); });
    if (mech.length) h += `<h3>Les mécaniques</h3><ul class="nv">${mech.map((id) => `<li>${link(id)}${pages.get(id).s ? ` <small>— ${esc(pages.get(id).s)}</small>` : ''}</li>`).join('')}</ul>`;
    P('cat:commandes', { t: 'Commandes et mécaniques', s: 'Touches et gestes', c: [], i: '⌨', h });
  }

  return { pages: [...pages.values()], cats, other, used: [...used], SAFE_INTER, safeInter, VIE_MAP };
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
  const poi = (W.inter || []).map((it) => [it.kind, it.name || it.kind, it.x, it.z, (wiki.safeInter ? wiki.safeInter(it) : SAFE.has(it.kind)) ? 0 : 1, it.data ? String(it.data.table || it.data.ins || it.data.kind || it.data.sigle || it.data.faith || it.data.key || '') : '']);
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
    vie: wiki.VIE_MAP || null,
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
    layers: Object.assign({ relief: 1, eaux: 1, roches: 1, forets: 1, chemins: 1, courbes: 0, milieux: 0, batiments: 1, lieux: 1, habitants: 1, peche: 0, panneaux: 0, details: 1, zones: 0, louer: 1, activites: 1, fouilles: 0, secrets: 1, souterrains: 1, cachettes: 0, tresors: 1, rares: 0 }, store.get('layers', {})),
    sel: null, hl: null, hover: null, G: null,
    LAYERS: [
      ['Fond', [['relief', 'Relief ombré'], ['eaux', 'Eaux'], ['roches', 'Neige et roches'], ['forets', 'Forêts'], ['courbes', 'Courbes de niveau (10 m)'], ['milieux', 'Milieux (couleurs)']]],
      ['Tracés', [['chemins', 'Chemins'], ['batiments', 'Bâtiments'], ['details', 'Détails (ponts, croix, pierres…)'], ['zones', 'Zones où l’on ne bâtit pas'], ['peche', 'Zones de pêche'], ['panneaux', 'Panneaux et poteaux']]],
      ['Noms', [['lieux', 'Lieux-dits'], ['habitants', 'Maisons des habitants']]],
      ['La vie des villes', [['louer', 'Maisons à louer, la poterne'], ['activites', 'Activités (jeux, concours, veillée…)'], ['fouilles', 'Où fouiller (de près)']]],
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
        const V = M.vie;
        if (V) {
          for (const q of V.louer) f.push({ t: q[1], s: 'maison à louer', go: () => { this.layers.louer = 1; this.go('xy:' + q[2] + ',' + q[3]); } });
          if (V.poterne) f.push({ t: V.poterne[2], s: 'porte du rempart', go: () => { this.layers.louer = 1; this.go('xy:' + V.poterne[0] + ',' + V.poterne[1]); } });
          for (const q of V.act) f.push({ t: q[1], s: 'activité', go: () => { this.layers.activites = 1; this.go('xy:' + q[2] + ',' + q[3]); } });
        }
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
        const V = M.vie, pts = !V ? null : v === 'louer' ? V.louer.map((q) => [q[2], q[3]]).concat(V.poterne ? [V.poterne] : []) : v === 'activites' ? V.act.map((q) => [q[2], q[3]]) : v === 'fouilles' ? V.f2.filter((q) => !q[4] && (!q[3] || reveal)).map((q) => [q[0], q[1]]) : null;
        if (pts && pts.length) {
          // le coin le plus fourni (la ville), pas toute la vallée
          const c0 = pts.reduce((b, p) => { const n = pts.filter((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 90).length; return n > b[0] ? [n, p] : b; }, [0, pts[0]])[1];
          const near = pts.filter((q) => Math.hypot(q[0] - c0[0], q[1] - c0[1]) < 140);
          const xs = near.map((q) => q[0]), zs = near.map((q) => q[1]);
          this.fit((Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...zs) + Math.max(...zs)) / 2, Math.max(v === 'fouilles' ? 60 : 110, (Math.max(...xs) - Math.min(...xs)) / 2 + 20, (Math.max(...zs) - Math.min(...zs)) / 2 + 20));
        }
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
      const labels = [];
      // la vie des villes : endroits à fouiller, maisons à louer, poterne, activités
      const V = M.vie;
      if (V && L.fouilles && k > 0.6) for (const q of V.f2) {
        if ((q[3] && !reveal) || (q[4] && !(reveal && L.souterrains)) || !inV(q[0], q[1])) continue;
        const [sx, sy] = T(q[0], q[1]); c.fillStyle = q[3] ? 'rgba(140,30,30,.9)' : 'rgba(96,64,30,.9)'; c.fillRect(sx - 2.5, sy - 2.5, 5, 5); c.strokeStyle = '#f6e8d0'; c.lineWidth = 1; c.strokeRect(sx - 2.5, sy - 2.5, 5, 5);
        marks.push({ x: sx, y: sy, r: 6, f: { kind: 'pt', t: q[2], x: q[0], z: q[1], sub: q[5] ? 'À fouiller, ' + q[5] : 'À fouiller', page: 'sys:fouilles' } });
      }
      if (V && L.louer) {
        for (const q of V.louer) { if (!inV(q[2], q[3], 40)) continue; const [sx, sy] = dot(q[2], q[3], 5.5, '#3c6e3a', '#fbf2dc'); c.fillStyle = '#fbf2dc'; c.font = 'bold 9px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('⌂', sx, sy + 0.5); marks.push({ x: sx, y: sy, r: 9, f: { kind: 'pt', t: q[1], x: q[2], z: q[3], sub: q[4], page: q[5] } }); if (k > 0.8) labels.push({ x: sx + 8, y: sy, t: q[1], pr: 4.5, cls: 'rent', left: true }); }
        if (V.poterne && inV(V.poterne[0], V.poterne[1], 40)) { const [sx, sy] = dot(V.poterne[0], V.poterne[1], 4.5, '#4a3a2a', '#fbf2dc'); marks.push({ x: sx, y: sy, r: 8, f: { kind: 'pt', t: V.poterne[2], x: V.poterne[0], z: V.poterne[1], sub: 'Une porte basse dans le rempart : on sort, on ne rentre pas.', page: V.poterne[3] } }); if (k > 0.8) labels.push({ x: sx + 7, y: sy, t: V.poterne[2], pr: 4, cls: 'rent', left: true }); }
      }
      if (V && L.activites && k > 0.25) for (const q of V.act) {
        if (!inV(q[2], q[3], 40)) continue;
        const [sx, sy] = dot(q[2], q[3], 7.5, 'rgba(251,242,220,.95)', '#7a3a14');
        c.font = '10px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#5a2a10'; c.fillText(q[4] || '•', sx, sy + 0.5);
        marks.push({ x: sx, y: sy, r: 10, f: { kind: 'pt', t: q[1], x: q[2], z: q[3], sub: q[5], page: 'act:' + q[0] } });
        if (k > 1.4) labels.push({ x: sx + 10, y: sy, t: q[1], pr: 3.5, cls: 'act', left: true });
      }
      // maisons des habitants
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
        c.fillStyle = l.cls === 'secret' ? '#8a1e14' : l.cls === 'rent' ? '#2c5a2a' : l.cls === 'act' ? '#6a2e10' : l.cls === 'under' ? '#4a2a6a' : l.cls === 'water' ? '#1e4a6a' : l.cls === 'region' ? 'rgba(60,44,28,.78)' : l.cls === 'npc' ? '#7a2414' : l.cls === 'bld' ? '#4a3826' : '#2a1d12';
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
        if (f.sub) h += `<p>${esc(f.sub)}</p>`;
        if (f.page) h += pgLink(f.page);
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
ul.sysl { padding-left: 1.2em; } ul.sysl li { margin: .35em 0; }
ul.nv { padding-left: 1.1em; columns: 2 300px; } ul.nv li { margin: .2em 0; break-inside: avoid; }
.figrow { display: flex; flex-wrap: wrap; gap: 10px 18px; align-items: flex-end; margin: .6em 0 1em; }
figure.sysfig { display: inline-flex; flex-direction: column; align-items: center; margin: 0 14px 8px 0; vertical-align: bottom; }
.figrow figure.sysfig { margin: 0; }
figure.sysfig figcaption { font-size: .85em; color: var(--ink2); text-align: center; margin-top: 3px; line-height: 1.2; }
.scrollx { overflow-x: auto; max-width: 100%; }
pre.code { font-family: Consolas, "Courier New", monospace; font-size: .82em; background: rgba(120,90,50,.08); border: 1px solid var(--line); border-radius: 4px; padding: 8px 10px; overflow-x: auto; max-width: 100%; white-space: pre; }
.md h3 { margin-top: 1.4em; } .md h4 { margin: 1em 0 .3em; font-variant: small-caps; letter-spacing: .03em; }
.md table.t td, .md table.t th { font-size: .95em; }
table.week-grid { font-size: .8em; }
table.week-grid th, table.week-grid td { padding: 3px 5px; min-width: 64px; }
table.keys th { white-space: nowrap; }
kbd { display: inline-block; font: .82em/1.2 ui-monospace, Menlo, Consolas, monospace; padding: 0 .35em; border: 1px solid var(--line); border-bottom-width: 2px; border-radius: 3px; background: rgba(255,250,235,.9); color: var(--ink); margin: 0 .1em; }
.tag.leg { font-weight: 600; background: rgba(255,250,235,.95); }
.inscr p { margin: .2em 0 .6em; }
.say { display: flex; gap: 14px; align-items: center; margin: .35em 0 .7em; }
.say canvas { flex: 0 0 auto; background: #d8ccb0; padding: 3px 6px; border-radius: 3px; box-shadow: inset 0 0 8px rgba(60,40,20,.2); }
.say p { margin: 0; }
p.licence { border-top: 1px solid var(--line); padding-top: .4em; }
h3.seealso { font-size: 1em; }
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
