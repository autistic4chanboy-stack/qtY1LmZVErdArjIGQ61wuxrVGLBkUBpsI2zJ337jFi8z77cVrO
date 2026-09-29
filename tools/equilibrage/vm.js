// Équilibrage : charge le jeu (les modules src/NN-*.js, assemblés comme par build.js) dans une machine virtuelle
// node, sans navigateur ni rendu, pour lire les tables et faire tourner les formules du jeu.
//   const { charger, vallee } = require('./vm.js');
//   const J = charger();                 // un jeu neuf (tables, fonctions, objets globaux)
//   J.ev('ITEMS.pain.price')             // évalue une expression dans le jeu (les const de haut niveau y sont visibles)
//   J.avec({ id: 'pain' }, 'ITEMS[__v.id].food')  // idem, avec des valeurs passées dans __v
//   const w = await vallee(J, 1234);     // génère la vallée (~45 s) : w.inter, w.props, w.bld, w.lm…
// Les parties « vivantes » (farm.s, game, le joueur) n'existent pas ici : pour elles, un test dans le navigateur.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..', '..');

function contexte() {
  const stub = () => new Proxy(function () {}, {
    get: (t, k) => (k === Symbol.toPrimitive ? () => 0 : k === 'length' ? 0 : k === 'then' ? undefined : stub()),
    apply: () => stub(), construct: () => stub(), set: () => true,
  });
  const noop = () => {};
  const store = new Map();
  const ctx = {
    console: { log: noop, info: noop, debug: noop, warn: noop, error: (...a) => process.env.EQ_DEBUG && console.error('[jeu]', ...a) },
    Math, JSON, Date, Object, Array, String, Number, Boolean, Set, Map, WeakMap, WeakSet, Float32Array, Uint8Array, Uint16Array, Int32Array,
    Uint32Array, Uint8ClampedArray, Float64Array, Int8Array, Int16Array, ArrayBuffer, DataView, Promise,
    // les minuteries du jeu sont raccourcies (la génération en attend quelques-unes)
    setTimeout: (f, ms, ...a) => { setTimeout(() => { try { f(...a); } catch (e) { /* ignoré */ } }, Math.min(ms || 0, 20)); return 0; },
    clearTimeout: noop, setInterval: () => 0, clearInterval: noop,
    parseInt, parseFloat, isNaN, isFinite, Symbol, Proxy, Reflect, Error, RegExp, TypeError, RangeError, encodeURIComponent, decodeURIComponent, Intl,
    Image: function () { return stub(); }, Audio: function () { return stub(); }, AudioContext: function () { return stub(); }, ImageData: function () { return stub(); },
    navigator: { userAgent: 'node', language: 'fr' }, location: { href: 'file:///equilibrage', hash: '', search: '' },
    localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) },
    performance: { now: () => Date.now() }, requestAnimationFrame: () => 0, cancelAnimationFrame: noop,
    btoa: (s) => Buffer.from(String(s), 'binary').toString('base64'), atob: (s) => Buffer.from(String(s), 'base64').toString('binary'),
    MutationObserver: function () { return { observe: noop, disconnect: noop }; }, ResizeObserver: function () { return { observe: noop, disconnect: noop }; },
    fetch: () => Promise.reject(new Error('hors ligne')), queueMicrotask: (f) => Promise.resolve().then(f),
  };
  ctx.document = {
    querySelector: () => null, querySelectorAll: () => [], getElementById: () => null, getElementsByTagName: () => [], getElementsByClassName: () => [],
    addEventListener: noop, removeEventListener: noop, createElement: () => stub(), createElementNS: () => stub(), createTextNode: () => stub(),
    body: stub(), head: stub(), documentElement: stub(), fonts: { ready: Promise.resolve() }, hidden: false, visibilityState: 'visible', readyState: 'complete',
  };
  Object.assign(ctx, { addEventListener: noop, removeEventListener: noop, dispatchEvent: noop, devicePixelRatio: 1, innerWidth: 1280, innerHeight: 800,
    getComputedStyle: () => stub(), matchMedia: () => ({ matches: false, addEventListener: noop, removeEventListener: noop }), open: noop, alert: noop, confirm: () => false, prompt: () => null });
  ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
  vm.createContext(ctx);
  return ctx;
}

function charger() {
  const src = path.join(ROOT, 'src');
  const files = fs.readdirSync(src).filter((f) => /^\d\d-.*\.js$/.test(f)).sort();
  const js = files.map((f) => `// ---- ${f}\n` + fs.readFileSync(path.join(src, f), 'utf8')).join('\n');
  const ctx = contexte();
  vm.runInContext(js, ctx, { filename: 'prairie.js' });
  const ev = (code) => vm.runInContext(code, ctx);
  const avec = (v, code) => { ctx.__v = v; try { return ev(code); } finally { ctx.__v = null; } };
  return { ctx, ev, avec, files };
}

// génère la vallée d'une graine (comme une partie neuve) ; renvoie le monde
function vallee(J, graine = 1234) { return J.ev(`generateValley(${graine | 0}, () => {}, 3)`); }

// empreinte d'une vallée générée : les anciennes sauvegardes retrouvent leurs objets par leur rang dans w.objects /
// w.props (le monde est régénéré à chaque chargement). Un réglage d'équilibrage ne doit JAMAIS la changer.
// (n = [objets, props, interactions] : l'empreinte des seuls premiers, ceux des anciennes versions ; une génération
// ajoutée APRÈS tout le reste allonge les listes sans toucher à ces premiers)
function empreinte(w, n) {
  const crypto = require('crypto');
  const h = crypto.createHash('sha1');
  const r = (v) => Math.round(v * 100);
  const [no, np, ni] = n || [w.objects.length, w.props.length, w.inter.length];
  for (const o of w.objects.slice(0, no)) h.update(`${o.t},${r(o.x)},${r(o.z)};`);
  for (const q of w.props.slice(0, np)) h.update(`${q.id},${r(q.x)},${r(q.z)};`);
  for (const i of w.inter.slice(0, ni)) h.update(`${i.kind},${i.id || ''},${r(i.x)},${r(i.z)};`);
  return `${no}/${np}/${ni}/${h.digest('hex').slice(0, 12)}`;
}
// l'empreinte de référence de la graine 1234 avant l'équilibrage (98896 objets, 1308 props, 516 interactions)
const EMPREINTE_1234 = '98896/1308/516/666d7edf598a';

module.exports = { charger, vallee, empreinte, EMPREINTE_1234, ROOT };
