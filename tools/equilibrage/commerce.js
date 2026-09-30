// Équilibrage du commerce : points d'achat et de vente, boucles d'argent, transformations, rendements, coûts.
//   node tools/equilibrage.js commerce
// Tout se lit dans le jeu chargé (tables et formules réelles : ui.shopPrice, routines.hotte, alchimie.calculer…).
'use strict';

// ---------------------------------------------------------------- côté jeu : catalogue des achats et des ventes
// (évalué dans la machine virtuelle : les const du jeu y sont visibles)
const CATALOGUE = String.raw`(() => {
  const NIV = [0, 3, 6, 10];
  npcs.level = (n) => n.__niv || 0;                          // amitié simulée (0 à 10)
  const pnj = (d, niv) => ({ id: d.id, d, name: d.name, st: { alive: true, amitie: niv * 100 }, __niv: niv });
  const achats = [], ventes = [];
  const prixPNJ = (d, id, p, achat) => NIV.map((v) => ui.shopPrice(pnj(d, v), id, p, achat));
  // brut : le prix écrit dans la table ; pnj : vendu par un habitant (remise d'amitié)
  const ACH = (ou, id, prix, note, brut) => { if (ITEMS[id]) achats.push({ ou, id, prix: Array.isArray(prix) ? prix : [prix, prix, prix, prix], note: note || '', brut: brut || 0, pnj: Array.isArray(prix) }); };
  const VEN = (ou, id, prix, note) => { if (ITEMS[id] && ITEMS[id].price > 0) ventes.push({ ou, id, prix: Array.isArray(prix) ? prix : [prix, prix, prix, prix], note: note || '' }); };
  // les colporteurs, le maire et l'aubergiste recèlent les petites choses (ajouté au chargement d'une partie : 11-zzz90-vol.js)
  { const h = HOOKS.load.find((f) => String(f).includes('mouchoir_brode')); if (h) { const S0 = vol.S, h0 = vol.hooked; vol.S = () => ({}); vol.hooked = true; try { h(); } finally { vol.S = S0; vol.hooked = h0; } } }
  for (const d of NPC_DATA) {
    const S = d.shop;
    if (!S) continue;
    // ce qu'on achète : l'étal fixe, la graineterie du jour, la hotte des colporteurs, les reprises
    let sells = (S.sells || []).slice();
    if (d.id === 'grainetiere') sells = (S.base || sells.filter(([id]) => !id.startsWith('graines_'))).concat(SEED_BASE.concat(SEED_ROTATE).filter((c) => ITEMS['graines_' + c]).map((c) => ['graines_' + c, SEED_PRICE[c]]));
    if (typeof HOTTES !== 'undefined' && HOTTES[d.id]) {
      const H = HOTTES[d.id], base = sells, prix = (id) => { const e = base.find(([k]) => k === id); return e && e[1] > 0 ? e[1] : Math.max(1, (ITEMS[id] && ITEMS[id].price) || 10); };
      sells = H.fonds.map((id) => [id, prix(id)]);
      for (const k in H.ici) for (const e of H.ici[k]) sells.push([e[0], e[1], 'hotte, ' + k]);
      for (const e of H.rares) sells.push([e[0], e[1], 'hotte, rare']);
    }
    for (const [id, p, note] of sells) { if (ITEMS[id] && !ITEMS[id].animal) ACH(d.id, id, prixPNJ(d, id, p, true), note, p); }
    // les reprises : quand un marchand meurt, un autre reprend une part de son étal (prix de base × 1,2)
    for (const mort in SOC_REPRISE) for (const [qui, L] of SOC_REPRISE[mort]) if (qui === d.id) for (const id of L) if (ITEMS[id] && !ITEMS[id].animal) { const p = Math.round(societe.prixBase(id) * 1.2); ACH(d.id, id, prixPNJ(d, id, p, true), 'reprise de ' + mort, p); }
    // ce qu'on vend
    const buys = (S.buys || []).slice();
    if (buys.includes('poisson')) for (const f in FISH) if (!buys.includes(f)) buys.push(f);
    for (const id of buys) if (ITEMS[id] && ITEMS[id].price > 0) VEN(d.id, id, prixPNJ(d, id, ITEMS[id].price, false));
  }
  // les étals du Marchedi (prix fixes) et le brocanteur (trésors, 60 %)
  for (const R of ACT_ETALS) {
    for (const [id, p] of R.vend) ACH('étal ' + R.id, id, p, '', p);
    if (R.achete) for (const id in ITEMS) if (ITEMS[id].cat === 'tresor' && ITEMS[id].price > 0) VEN('étal ' + R.id, id, Math.max(1, Math.round(ITEMS[id].price * 0.6)));
  }
  // le marchand de joie : les pilules, et il rachète les souvenirs du monde des bonbons (× 1,2)
  ACH('marchand de joie', 'pilule_joie', 20, 'trois pour 60', 20);
  { const src = String(pilules.boutique); const m = /\[([^\]]*)\]\.filter\(\(id\) => ITEMS\[id\] && farm\.count/.exec(src); if (m) for (const id of eval('[' + m[1] + ']')) VEN('marchand de joie', id, Math.round(ITEMS[id].price * 1.2)); }
  // la caisse d'expédition : le prix de base, pour tout ce qui n'est pas un outil
  for (const id in ITEMS) if (ITEMS[id].price > 0 && ITEMS[id].cat !== 'outil') VEN('caisse', id, ITEMS[id].price);
  // (pour mémoire) ce qu'un marchand rachète sans que l'objet ait de prix : il en donne 1 pièce (plancher de shopPrice)
  const sansPrix = [];
  for (const d of NPC_DATA) if (d.shop && d.shop.buys) for (const id of d.shop.buys) if (ITEMS[id] && !(ITEMS[id].price > 0)) sansPrix.push(d.id + ' : ' + id);
  return JSON.stringify({ niv: NIV, achats, ventes, sansPrix });
})()`;

function catalogue(J) {
  const c = JSON.parse(J.ev(CATALOGUE));
  const parId = (L) => { const m = {}; for (const e of L) (m[e.id] = m[e.id] || []).push(e); return m; };
  c.A = parId(c.achats); c.V = parId(c.ventes);
  // le moins cher à l'achat (toute amitié), le mieux payé à la vente (toute amitié)
  c.minAchat = (id) => { let b = null; for (const e of c.A[id] || []) for (let i = 0; i < c.niv.length; i++) if (!b || e.prix[i] < b.p) b = { p: e.prix[i], ou: e.ou, niv: c.niv[i], note: e.note }; return b; };
  c.maxVente = (id) => { let b = null; for (const e of c.V[id] || []) for (let i = 0; i < c.niv.length; i++) if (!b || e.prix[i] > b.p) b = { p: e.prix[i], ou: e.ou, niv: c.niv[i] }; return b; };
  return c;
}

// ---------------------------------------------------------------- 1. achat-revente
function boucles(J, c, log) {
  const out = [];
  for (const id in c.A) {
    const a = c.minAchat(id), v = c.maxVente(id);
    if (a && v && v.p >= a.p) out.push({ id, a, v, gain: v.p - a.p });
  }
  out.sort((x, y) => y.gain - x.gain);
  log(`Points d'achat : ${c.achats.length} (objets : ${Object.keys(c.A).length}) ; points de vente : ${c.ventes.length} (objets : ${Object.keys(c.V).length}).`);
  if (c.sansPrix && c.sansPrix.length) log(`(Rachetés 1 pièce faute de prix, sans boucle possible : ${c.sansPrix.join(', ')}.)`);
  if (!out.length) log('Aucun achat-revente gagnant (ni même à prix égal), à toute amitié.');
  else {
    log(`${out.length} achat(s)-revente sans perte :`);
    for (const b of out) log(`  ${b.id.padEnd(22)} acheté ${String(b.a.p).padStart(4)} (${b.a.ou}${b.a.note ? ', ' + b.a.note : ''}, amitié ${b.a.niv})  revendu ${String(b.v.p).padStart(4)} (${b.v.ou}, amitié ${b.v.niv})  gain ${b.gain}`);
  }
  return out;
}

// ---------------------------------------------------------------- 1 bis. les étals eux-mêmes (sans le garde-fou de ui.shopPrice)
// Le garde-fou empêche toute boucle chez les habitants ; on vérifie en plus que les tables le rendent inutile : au
// mieux de l'amitié, un prix d'étal doit rester au-dessus de la meilleure revente (sinon, c'est la table qu'il faut revoir).
function etalsSolides(J, c, log) {
  const kA = J.ev(`typeof ui.shopK === 'function' ? ui.shopK(10, true) : 0.88`);
  const out = [];
  for (const e of c.achats) {
    if (!e.brut) continue;
    const p = e.pnj ? Math.max(1, Math.round(e.brut * kA)) : e.brut, v = c.maxVente(e.id);
    if (v && p <= v.p) out.push({ e, p, v });
  }
  if (!out.length) log(`Tous les prix d'étal (${c.achats.filter((e) => e.brut).length}), remise d'amitié comprise, restent au-dessus de la meilleure revente.`);
  else for (const { e, p, v } of out) log(`  table trop basse : ${e.id} à ${e.brut} chez ${e.ou}${e.note ? ' (' + e.note + ')' : ''} → ${p} au mieux de l'amitié, revendu ${v.p} (${v.ou})`);
  return out;
}

// ---------------------------------------------------------------- 2. transformations (acheter, fabriquer, revendre)
// Toute recette (établi, four, feu, machines, alambic, table d'alchimiste) dont TOUS les ingrédients s'achètent :
// ce qu'elle rend, revendu au mieux, doit valoir moins que ses ingrédients achetés au mieux. Les chaînes comptent
// (un objet fabriqué avec des achats sert d'ingrédient à un autre) : coût minimal par point fixe.
function transformations(J, c, log) {
  const D = JSON.parse(J.ev(`JSON.stringify({ R: RECIPES, M: MACHINES, G: ITEM_GROUPS, POT: Object.fromEntries(Object.keys(POTIONS).filter((k) => POTIONS[k].need).map((k) => [k, POTIONS[k].need])) })`));
  const recettes = [];
  for (const r of D.R) recettes.push({ ou: 'recette' + (r.st ? ' (' + r.st + ')' : ''), need: r.need, out: r.out, n: r.n });
  for (const m in D.M) for (const r of D.M[m]) recettes.push({ ou: 'machine ' + m, need: r.in, out: r.out[0], n: r.out[1] });
  for (const id in D.POT) { const need = { fiole: 1 }; for (const k of D.POT[id]) need[k] = (need[k] || 0) + 1; recettes.push({ ou: 'alambic', need, out: id, n: 1 }); }
  const cout = {};
  for (const id in c.A) cout[id] = c.minAchat(id).p;
  const cIng = (k) => (D.G[k] ? Math.min(...D.G[k].map((x) => (cout[x] === undefined ? Infinity : cout[x]))) : (cout[k] === undefined ? Infinity : cout[k]));
  for (let it = 0; it < 8; it++) for (const r of recettes) {
    let s = 0;
    for (const k in r.need) s += r.need[k] * cIng(k);
    if (s / r.n < (cout[r.out] === undefined ? Infinity : cout[r.out])) cout[r.out] = s / r.n;
  }
  const out = [];
  for (const r of recettes) {
    let s = 0;
    for (const k in r.need) s += r.need[k] * cIng(k);
    const v = c.maxVente(r.out);
    if (s < Infinity && v && v.p * r.n > s) out.push({ r, s, v: v.p * r.n });
  }
  // la table d'alchimiste : deux à quatre ingrédients achetables et une fiole (deux, si le mélange est fort)
  const ing = JSON.parse(J.ev('JSON.stringify(Object.keys(ESSENCES))')).filter((k) => cout[k] !== undefined && cout[k] < Infinity);
  const fiole = cout.fiole === undefined ? Infinity : cout.fiole;
  let essais = 0;
  const combo = (start, pris) => {
    if (pris.length >= 2) {
      essais++;
      const R = J.avec(pris, 'alchimie.calculer(__v)'), doses = R.fort && R.res !== 'bouillie' ? 2 : 1;
      const rendues = pris.filter((k) => ['rosee', 'eau_benite', 'venin'].includes(k)).length;
      const s = pris.reduce((a, k) => a + cout[k], 0) + (doses - rendues) * fiole, v = c.maxVente(R.res);
      if (v && v.p * doses > s) out.push({ r: { ou: 'table d’alchimiste', need: pris, out: R.res, n: doses }, s, v: v.p * doses });
    }
    if (pris.length === 4) return;
    for (let i = start; i < ing.length; i++) combo(i, pris.concat(ing[i]));
  };
  if (fiole < Infinity) combo(0, []);
  // ce qu'on achète et qu'on ouvre (géode, coffre…) : en moyenne, le contenu doit valoir moins que le prix payé
  const D2 = donnees(J), v2 = valeurs(D2);
  let ouvrables = 0;
  for (const id in c.A) {
    const it = D2.items[id];
    if (!it || !it.open) continue;
    ouvrables++;
    const ev = esperance(D2, it.open, v2), a = c.minAchat(id);
    if (ev >= a.p) out.push({ r: { ou: 'ouvert (' + it.open + ')', need: [id], out: 'contenu moyen', n: 1 }, s: a.p, v: Math.round(ev) });
    else log(`${id} : acheté au mieux ${a.p} (${a.ou}), contenu moyen ${ev.toFixed(1)}`);
  }
  log(`${recettes.length} recettes et transformations (+ ${essais} mélanges de la table d'alchimiste avec ${ing.length} ingrédients achetables ; ${ouvrables} objet(s) achetable(s) qu'on ouvre).`);
  if (!out.length) log('Aucune transformation gagnante à partir d’achats seulement.');
  else for (const { r, s, v } of out.slice(0, 40)) log(`  ${r.out} ×${r.n} (${r.ou}) : ingrédients achetés ${Math.round(s)} → revendu ${v}  ← ${Array.isArray(r.need) ? r.need.join(' + ') : Object.entries(r.need).map(([k, n]) => n + ' ' + k).join(' + ')}`);
  return out;
}

// ---------------------------------------------------------------- 3. rendements de la production honnête (modèle)
// Les gestes et délais sont ceux du jeu (lus dans les tables et le source) ; ce qui dépend du joueur est une hypothèse,
// écrite ici : la marche (4,4 m/s), le temps de ramasser (E), les deux passages par jour au champ, la journée active.
const fs = require('fs');
const path = require('path');
const HYP = {
  jourActif: 13,        // heures de jeu actives (6 h → 19 h, puis on dort)
  marche: 4.4,          // m/s (10-player.js)
  ramasser: 0.8,        // s pour viser et cueillir (E), en plus de la marche
  voisinMax: 30,        // m : au-delà, on va d'une plante à l'autre en mêlant les espèces
  coup: 0.48,           // s entre deux coups d'outil (11-farm-play.js, swing)
  passages: [7, 18],    // heures des passages au champ (arrosage à chaque passage)
  ratePeche: 0.1,       // part des touches manquées (il faut cliquer dans la seconde)
  reaction: 0.5,        // s pour cliquer quand le bouchon plonge
};
const lireSource = (J, f) => fs.readFileSync(path.join(require('./vm.js').ROOT, 'src', f), 'utf8');

function donnees(J) {
  return JSON.parse(J.ev(`JSON.stringify({
    J: JOUR_SECONDES, CROPS, SEED_PRICE, SEED_BASE, SEED_ROTATE, FISH, HARVEST, PREY, LOOT, VEINS, TERRE,
    // l'engrais le moins cher en boutique (amitié 0) : on en use un sac toutes les cinq récoltes (fatigue du sol)
    ENGRAIS: (() => { let m = 0; for (const d of NPC_DATA) if (d.shop) for (const [k, p] of d.shop.sells || []) if (k === 'engrais' && p > 0 && (!m || p < m)) m = p; return m; })(),
    CHASSE_BONUS: typeof CHASSE_BONUS !== 'undefined' ? CHASSE_BONUS : {},
    items: Object.fromEntries(Object.keys(ITEMS).map((k) => [k, { p: ITEMS[k].price, cat: ITEMS[k].cat, open: ITEMS[k].open || null, fast: ITEMS[k].fast || 0, animal: ITEMS[k].animal || null }])),
    recettes: RECIPES, machines: MACHINES, groupes: ITEM_GROUPS,
  })`));
}

// valeur d'un objet pour qui le vend (caisse ou marchand, amitié 0) ; ce qui s'ouvre vaut ce qu'il contient
function valeurs(D) {
  const memo = {};
  const v = (id, prof = 0) => {
    if (id === 'argent') return 1;
    if (memo[id] !== undefined) return memo[id];
    const it = D.items[id];
    if (!it) return 0;
    let x = it.cat === 'outil' ? 0 : Math.max(0, it.p || 0);
    if (it.open && prof < 3) x = Math.max(x, esperance(D, it.open, (k) => v(k, prof + 1)));
    return (memo[id] = x);
  };
  return v;
}
// espérance d'un tirage de butin (voir rollLoot, 05-zfarm-content.js)
function esperance(D, cle, v) {
  const T = D.LOOT[cle] || D.LOOT.fouille;
  const items = T.items.filter((e) => e[3] > 0 && (e[0] === 'argent' || D.items[e[0]]));
  const tot = items.reduce((a, e) => a + e[3], 0);
  if (!tot) return 0;
  const n = (T.rolls[0] + T.rolls[1]) / 2;
  let s = 0;
  for (const [id, a, b, w] of items) { let q = 0; for (let k = a; k <= b; k++) if (k > 0) q += k; q /= (b - a + 1); s += w / tot * q * v(id); }
  return n * s;
}
const moyenne = (drop, v) => drop.reduce((a, [id, m, M, p]) => a + (p === undefined ? 1 : p) * (m + M) / 2 * v(id), 0);

// ---- cultures : marge par case et par jour, régime établi sur 24 jours (passages et arrosages fixes)
// La terre (TERRE, 11-farm-state.js) : l'arrosage tient TERRE.humide heures ; la case s'épuise (au-delà de cinq récoltes
// sans engrais, la pousse est divisée par deux, au-delà de dix par quatre). Le fermier « honnête » met un sac d'engrais
// dès la cinquième récolte (acheté D.ENGRAIS pièces, ou le prix donné) : la culture pousse une fois et demie plus vite
// jusqu'à la récolte suivante, et la terre repart de zéro. engrais === false : jamais d'engrais (pour mémoire).
function culture(D, id, v, passages = HYP.passages, engrais = D.ENGRAIS) {
  const C = D.CROPS[id], s = D.SEED_PRICE[id] || 0, fruit = C.fruit || id, T = D.TERRE;
  const h = C.h, r = C.regrow || 0, y = (C.yield[0] + C.yield[1]) / 2 * (C.giant ? 1.15 : 1);
  const lenteur = (n) => (n >= T.fatigue[1] ? T.lenteur[2] : n >= T.fatigue[0] ? T.lenteur[1] : T.lenteur[0]);
  let g = 0, wet = -1, planted = false, rec = 0, sem = 0, n = 0, fert = 0, sacs = 0;
  const jours = 24;
  for (let t = 0; t < jours * 24; t++) {
    const hh = t % 24;
    if (passages.includes(hh)) {
      if (planted && g >= h) { rec++; n++; fert = 0; if (r) g = h - r; else { planted = false; g = 0; } }
      if (engrais !== false && n >= T.fatigue[0]) { sacs++; n = 0; fert = 1; }
      if (!planted) { planted = true; sem++; g = 0; }
      wet = t + T.humide;
    }
    const nuit = hh >= 20.5 || hh < 5.5;
    if (planted && t < wet && !(C.night && !nuit)) g = Math.min(h, g + (fert ? 1.5 : 1) * lenteur(n));
  }
  const retour = C.seedBack ? (C.seedBack[0] + C.seedBack[1]) / 2 : (r ? 0.05 : 0.12);
  const marge = (rec * y * v(fruit) - Math.max(0, sem - rec * retour) * s - sacs * (engrais || 0)) / jours;
  return { id, h, r, y, p: v(fruit), s, recJ: rec / jours, sacsJ: sacs / jours, marge, base: D.SEED_BASE.includes(id) };
}

// ---- pêche : durée d'une prise et valeur d'un lancer, par zone
function peche(J, D, v) {
  const src = lireSource(J, '11-farm-play.js');
  const [, a, b] = src.match(/t: \(([\d.]+) \+ Math\.random\(\) \* ([\d.]+)\) \* fast/);
  const lancer = +src.match(/this\.cool = ([\d.]+); this\.castT/)[1], ferrer = +src.match(/this\.fish = null; this\.cool = ([\d.]+);/)[1];
  const seuils = src.match(/r0 < ([\d.]+)/g).map((x) => +x.slice(5));   // fibre, coffre, perle (au lac)
  const attente = (+a + +b / 2);
  const duree = (fast) => lancer + attente * fast + HYP.reaction + ferrer + HYP.ratePeche * 8 * fast;
  const zones = {};
  for (const k in D.FISH) for (const z of D.FISH[k].where) (zones[z] = zones[z] || []).push(k);
  const out = [];
  for (const z in zones) for (const nuit of [false, true]) {
    const L = zones[z].filter((k) => !D.FISH[k].moon && (D.FISH[k].time === 'tout' || (D.FISH[k].time === 'nuit') === nuit));
    const tw = L.reduce((x, k) => x + D.FISH[k].w, 0);
    if (!tw) continue;
    const moyP = L.reduce((x, k) => x + D.FISH[k].w * v(k), 0) / tw;
    const pf = seuils[0], pc = seuils[1] - seuils[0], pp = z === 'lac' ? seuils[2] - seuils[1] : 0;
    const parLancer = pf * v('fibre') + pc * v('coffre_peche') + pp * v('perle') + (1 - pf - pc - pp) * moyP;
    for (const [canne, fast] of [['canne', 1], ['canne_fer', D.items.canne_fer ? D.items.canne_fer.fast : 1]]) {
      const t = duree(fast);
      out.push({ z, nuit, canne, moyP, parLancer, t, parS: parLancer / t, jour: parLancer / t * HYP.jourActif * D.J / 24 });
    }
  }
  return { out, attente: [+a, +a + +b], duree: duree(1), dureeFer: duree(D.items.canne_fer ? D.items.canne_fer.fast : 1) };
}

// ---- bêtes : production par jour (nourries : ×1,5), valeur, retour sur le prix d'achat
function betes(J, D, v) {
  const P1 = eval('(' + lireSource(J, '11-farm-state.js').match(/const P = (\{[^}]*\})/)[1] + ')');
  const P2 = eval('(' + lireSource(J, '10-zzcreatures-more.js').match(/const P = (\{[^}]*\})/)[1] + ')');
  const P = Object.assign({}, P1, P2);
  // ce que donne une récolte (13-main.js useAnimal, 10-zzcreatures-more.js) ; le cochon ne trouve rien sous la pluie
  const PROD = { hen: ['oeuf', 1], cow: ['lait', 1], sheep: ['laine', 2], pig: ['truffe', 0.7 * 0.8], goat: ['lait_chevre', 1], goose: ['oeuf_oie', 1], farmduck: ['oeuf_cane', 1], farmrabbit: ['poil_lapin', 1] };
  const out = [];
  for (const id in D.items) {
    const a = D.items[id].animal;
    if (!a || !P[a] || !PROD[a]) continue;
    const [prod, k] = PROD[a], nJ = 24 / (P[a] / 1.5) * k, nJ0 = 24 / P[a] * k;
    const foin = a === 'hen' ? 0 : 24 / 14 * 2;   // la mangeoire : deux bottes de foin par bête (hors poules) pour 14 h
    out.push({ id, a, prod, P: P[a], nJ, val: nJ * v(prod), val0: nJ0 * v(prod), foin, prix: D.items[id].p, retour: D.items[id].p / (nJ * v(prod)) });
  }
  return out;
}

// ---- cueillette, bois, pierre : d'après la densité réelle de la vallée (graine 1234, voir densite())
function temps(nn) { return HYP.ramasser + Math.min(nn || HYP.voisinMax, HYP.voisinMax) / HYP.marche; }

async function vallee1234(J) {
  const { vallee } = require('./vm.js');
  const w = await vallee(J, 1234);
  const OT = J.ev('OBJ_TYPES'), H = J.ev('HARVEST'), F = w.lm.ferme;
  const by = {};
  w.objects.forEach((o) => { const t = OT[o.t]; if (t && H[t.id]) (by[t.id] = by[t.id] || []).push(o); });
  const dens = {};
  for (const id in by) {
    const L = by[id], G = new Map(), C = 30, key = (x, z) => ((x / C) | 0) + ',' + ((z / C) | 0);
    for (const o of L) { const k = key(o.x, o.z); if (!G.has(k)) G.set(k, []); G.get(k).push(o); }
    const nn = [];
    const pas = Math.max(1, Math.ceil(L.length / 2000));
    for (let i = 0; i < L.length; i += pas) {
      const o = L[i], cx = (o.x / C) | 0, cz = (o.z / C) | 0;
      let best = 1e9;
      for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) for (const q of G.get((cx + dx) + ',' + (cz + dz)) || []) { if (q !== o) best = Math.min(best, Math.hypot(q.x - o.x, q.z - o.z)); }
      nn.push(best);
    }
    nn.sort((a, b) => a - b);
    const d = L.map((o) => Math.hypot(o.x - F.x, o.z - F.z));
    dens[id] = { n: L.length, nn: nn[nn.length >> 1], pres: d.filter((x) => x < 600).length };
  }
  return { w, dens };
}

function cueillette(D, v, dens) {
  const out = [];
  for (const id in dens) {
    const H = D.HARVEST[id];
    if (!H || H.tool !== 'main' || !H.drop) continue;
    const val = moyenne(H.drop, v), t = temps(dens[id].nn);
    out.push({ id, val, t, parS: val / t, n: dens[id].n, pres: dens[id].pres, repousse: H.regrow || 0 });
  }
  return out;
}
function secouer(J, D, v, dens) {
  // 13-main.js shakeTree : des pommes au pommier ; ailleurs, parfois un nid, une plume, une graine (butin « arbre »)
  const src = lireSource(J, '13-main.js');
  const [, pa, pb] = src.match(/got = \[\['pomme', (\d+) \+ Math\.floor\(Math\.random\(\) \* (\d+)\)\]\]/);
  const pArbre = +src.match(/else if \(Math\.random\(\) < ([\d.]+)\) got = rollLoot\('arbre'\)/)[1];
  const pommes = +pa + (+pb - 1) / 2;
  const out = [];
  for (const id in dens) {
    const H = D.HARVEST[id];
    if (!H || H.tool !== 'hache') continue;
    let val = 0;
    if (id === 'apple') val = pommes * v('pomme');
    else if (H.fruit) val = moyenne([H.fruit], v);                   // 11-zzvallee.js : les fruitiers
    else if (['oak', 'birch', 'pine'].includes(id)) val = pArbre * esperance(D, 'arbre', v);
    else continue;
    const t = temps(dens[id].nn);
    out.push({ id, val, t, parS: val / t, n: dens[id].n, pres: dens[id].pres });
  }
  return out;
}
function bucheron(D, v, dens) {
  const bois = v('bois'), rec = D.recettes.find((r) => r.out === 'charbon' && r.need.bois && Object.keys(r.need).length === 1);
  const parBois = Math.max(bois, rec ? v('charbon') * rec.n / rec.need.bois : 0);
  const out = [];
  for (const [tier, dmg] of [[0, 1], [2, 2.2]]) {
    const H = D.HARVEST.oak, S = D.HARVEST.stump, coups = Math.ceil(H.hp / dmg) + Math.ceil(S.hp / dmg);
    const t = coups * HYP.coup + temps(dens.oak ? dens.oak.nn : 5) - HYP.ramasser;
    const nb = moyenne(H.drop, () => 1) + moyenne(S.drop, () => 1);
    out.push({ tier, t, val: nb * parBois, parS: nb * parBois / t, parBois });
  }
  return out;
}
function carrier(D, v, dens) {
  const out = [];
  for (const [tier, dmg] of [[0, 1], [2, 2.4]]) {
    const H = D.HARVEST.rock, coups = Math.ceil(H.hp / dmg);
    const t = coups * HYP.coup + temps(dens.rock ? dens.rock.nn : 14) - HYP.ramasser;
    const val = moyenne(H.drop, v);
    out.push({ tier, t, val, parS: val / t });
  }
  return out;
}
function chasse(D, v) {
  const out = [];
  for (const k of ['rabbit', 'duck', 'deer', 'roe', 'boar', 'fox', 'wolf', 'bear', 'pheasant', 'partridge', 'chamois', 'ibex', 'lievre_blanc', 'badger', 'otter', 'martre']) {
    const P = D.PREY[k];
    if (!P) continue;
    const val = moyenne(P.drop || [], v) + moyenne(D.CHASSE_BONUS[k] || [], v);
    out.push({ k, val });
  }
  return out;
}

async function rendements(J, log, opts = {}) {
  const D = donnees(J), v = valeurs(D), echecs = [];
  const h = D.J / 24, jourS = HYP.jourActif * h;
  const f1 = (x) => (Math.round(x * 10) / 10).toFixed(1), f2 = (x) => x.toFixed(2);
  log(`Base de temps : une journée = ${D.J} s réelles, une heure de jeu = ${h} s ; journée active ${HYP.jourActif} h = ${jourS} s.`);
  // cultures
  const C = Object.keys(D.CROPS).filter((id) => id !== 'pommier' && D.SEED_PRICE[id]).map((id) => Object.assign(culture(D, id, v), { sans: culture(D, id, v, HYP.passages, false).marge }));
  C.sort((a, b) => b.marge - a.marge);
  log(`\n## Cultures (passages à ${HYP.passages.join(' h et ')} h ; l'arrosage tient ${D.TERRE.humide} h ; un sac d'engrais à ${D.ENGRAIS} pièces dès la ${D.TERRE.fatigue[0]}e récolte, sinon la terre s'épuise ; marge = récoltes − graines − engrais, par case et par jour)`);
  log('culture       pousse repousse  prix grain. récolte/j engrais/j  marge/case/j  (sans engrais)');
  for (const c of C) log(`${c.id.padEnd(13)} ${String(c.h).padStart(5)} ${String(c.r).padStart(7)} ${String(c.p).padStart(6)} ${String(c.s).padStart(5)} ${f2(c.recJ).padStart(8)} ${f2(c.sacsJ).padStart(8)} ${f1(c.marge).padStart(10)} ${('(' + f1(c.sans) + ')').padStart(12)}${c.base ? '  (toujours en rayon)' : ''}`);
  const base = C.filter((c) => c.base), meilleureBase = base[0], med = C[C.length >> 1];
  const champ = 54;
  log(`Champ de départ (${champ} cases labourées) avec la meilleure graine toujours en rayon (${meilleureBase.id}) : ${Math.round(champ * meilleureBase.marge)} /jour (${Math.round(champ * meilleureBase.sacsJ)} sacs d'engrais) ; culture médiane (${med.id}) sur 200 cases : ${Math.round(200 * med.marge)} /jour.`);
  const diligent = Object.keys(D.CROPS).filter((id) => id !== 'pommier' && D.SEED_PRICE[id]).map((id) => culture(D, id, v, [7, 11, 14, 18]));
  diligent.sort((a, b) => b.marge - a.marge);
  log(`Passages à 7, 11, 14 et 18 h (joueur assidu) : marge maximale ${f1(diligent[0].marge)} /case/jour (${diligent[0].id}).`);
  // pêche
  const Pe = peche(J, D, v);
  log(`\n## Pêche (touche au bout de ${Pe.attente[0]} à ${Pe.attente[1]} s × vitesse de la canne ; une prise toutes les ${f1(Pe.duree)} s, canne de fer ${f1(Pe.dureeFer)} s ; ${Math.round(HYP.ratePeche * 100)} % de touches manquées)`);
  log('zone          moment  canne       poisson moy.  par lancer  pièces/s   /jour actif');
  for (const p of Pe.out) log(`${p.z.padEnd(13)} ${(p.nuit ? 'nuit' : 'jour').padEnd(6)}  ${p.canne.padEnd(10)} ${f1(p.moyP).padStart(10)} ${f1(p.parLancer).padStart(10)} ${f2(p.parS).padStart(9)} ${String(Math.round(p.jour)).padStart(10)}`);
  log(`(un coffre englouti vaut en moyenne ${f1(v('coffre_peche'))} ; une perle ${v('perle')})`);
  // bêtes
  const B = betes(J, D, v);
  log('\n## Bêtes (nourries : production × 1,5 ; foin : deux bottes par bête et par 14 h, hors poules)');
  log('bête        prix  produit        par jour  valeur/j (sans foin)  retour (jours)');
  for (const b of B) log(`${b.id.padEnd(10)} ${String(b.prix).padStart(5)}  ${b.prod.padEnd(12)} ${f1(b.nJ).padStart(8)} ${f1(b.val).padStart(9)} (${f1(b.val0)})  ${f1(b.retour).padStart(8)}`);
  // la vallée (densités)
  let dens = opts.dens;
  if (!dens && !opts.sansVallee) { log('\n(génération de la vallée 1234 pour les densités…)'); dens = (await vallee1234(J)).dens; }
  const R = { C, meilleureBase, champ, Pe, B, diligent, D, v };
  if (dens) {
    const Q = cueillette(D, v, dens).filter((q) => q.val > 0).sort((a, b) => b.parS - a.parS);
    log(`\n## Cueillette (E ; ${HYP.ramasser} s par plante + la marche jusqu'à la suivante du même type, ${HYP.voisinMax} m au plus)`);
    log('plante          valeur  s/plante  pièces/s  repousse  (vallée, à moins de 600 m de la ferme)');
    for (const q of Q.slice(0, 40)) log(`${q.id.padEnd(15)} ${f1(q.val).padStart(6)} ${f1(q.t).padStart(8)} ${f2(q.parS).padStart(9)} ${String(q.repousse).padStart(6)} h   ${q.n} (${q.pres})`);
    const pres = Q.filter((q) => q.pres > 0), totV = pres.reduce((a, q) => a + q.pres * q.val, 0), totT = pres.reduce((a, q) => a + q.pres * q.t, 0);
    const melange = totV / totT;
    log(`Cueillette mêlée près de la ferme (tout ce qui pousse à moins de 600 m, au prorata) : ${f2(melange)} pièce/s, ${Math.round(melange * jourS)} /jour.`);
    const S = secouer(J, D, v, dens).sort((a, b) => b.parS - a.parS);
    log('\n## Arbres secoués (une fois par jour et par arbre)');
    for (const s of S) log(`${s.id.padEnd(12)} ${f1(s.val).padStart(6)} par arbre, ${f1(s.t)} s  → ${f2(s.parS)} pièce/s   (${s.n} arbres, ${s.pres} à moins de 600 m)`);
    const Bu = bucheron(D, v, dens), Ca = carrier(D, v, dens);
    log('\n## Bois (chêne + souche) et pierre (rocher)');
    for (const b of Bu) log(`bûcheron, hache ${b.tier ? 'de fer' : 'de pierre'} : ${f1(b.t)} s par chêne, ${f1(b.val)} pièces (bûche ≈ ${f2(b.parBois)}) → ${f2(b.parS)} pièce/s`);
    for (const c of Ca) log(`carrier, pioche ${c.tier ? 'de fer' : 'de pierre'} : ${f1(c.t)} s par rocher, ${f1(c.val)} pièces → ${f2(c.parS)} pièce/s`);
    Object.assign(R, { Q, melange, S, Bu, Ca });
  }
  const Ch = chasse(D, v);
  log('\n## Chasse (ce que rapporte une bête dépecée)');
  log(Ch.map((c) => `${c.k} ${f1(c.val)}`).join(' · '));
  const fouille = esperance(D, 'fouille', v);
  log(`\n## Terre remuée (9 trous par jour, butin « fouille ») : ${f1(fouille)} par trou, ${Math.round(9 * fouille)} /jour.`);
  Object.assign(R, { Ch, fouille });
  return R;
}

// ---------------------------------------------------------------- 3 bis. les cibles (voir scratchpad/eq/echelle.md et le README)
// Début : 300-450 pièces pour une journée de travail honnête ; milieu : 1 000-2 000 ; plus tard : 3 000-5 000.
// Une activité pratiquée à plein rapporte ≈ 0,3-0,5 pièce/s au début, ≈ 1 au milieu, 1,5-2,5 plus tard.
const CIBLES = {
  margeCase: [1.5, 8],        // marge d'une culture, par case et par jour (deux passages)
  champDepart: [120, 350],    // champ de départ (54 cases), meilleure graine toujours en rayon
  assiduMax: 12,              // marge par case et par jour avec quatre passages
  pecheDebut: [0.2, 0.6],     // grand lac, rivière, étang, de jour, canne de base (pièces/s)
  pecheMax: 2.6,              // n'importe où, canne de fer
  retourBete: [5, 20],        // jours pour rembourser une bête (nourrie)
  cueilletteMelee: 0.6,       // près de la ferme (pièces/s)
  valeurPlante: 30,           // ce que rapporte une plante cueillie, au plus
  secouerCommun: 0.5,         // pommiers, chênes, bouleaux, pins (pièces/s)
  bois: 0.5,                  // bûcheron + charbon, hache de pierre
  pierre: 1.0,                // rochers (qui ne repoussent pas)
};
function bornes(R, log) {
  const E = [], hors = (x, [a, b]) => !(x >= a && x <= b);
  for (const c of R.C) if (c.id !== 'mandragore' && hors(c.marge, CIBLES.margeCase)) E.push(`culture ${c.id} : marge ${c.marge.toFixed(1)} /case/jour, hors ${CIBLES.margeCase.join('-')}`);
  const champ = R.champ * R.meilleureBase.marge;
  if (hors(champ, CIBLES.champDepart)) E.push(`champ de départ : ${Math.round(champ)} /jour, hors ${CIBLES.champDepart.join('-')}`);
  if (R.diligent[0].marge > CIBLES.assiduMax) E.push(`joueur assidu : ${R.diligent[0].marge.toFixed(1)} /case/jour (${R.diligent[0].id}) > ${CIBLES.assiduMax}`);
  for (const p of R.Pe.out) {
    if (['lac', 'riviere', 'etang'].includes(p.z) && !p.nuit && p.canne === 'canne' && hors(p.parS, CIBLES.pecheDebut)) E.push(`pêche ${p.z} (canne de base, jour) : ${p.parS.toFixed(2)} /s, hors ${CIBLES.pecheDebut.join('-')}`);
    if (p.parS > CIBLES.pecheMax) E.push(`pêche ${p.z} ${p.nuit ? 'nuit' : 'jour'} (${p.canne}) : ${p.parS.toFixed(2)} /s > ${CIBLES.pecheMax}`);
  }
  for (const b of R.B) if (hors(b.retour, CIBLES.retourBete)) E.push(`${b.id} : remboursée en ${b.retour.toFixed(1)} jours, hors ${CIBLES.retourBete.join('-')}`);
  if (R.Q) {
    if (R.melange > CIBLES.cueilletteMelee) E.push(`cueillette mêlée : ${R.melange.toFixed(2)} /s > ${CIBLES.cueilletteMelee}`);
    for (const q of R.Q) if (q.val > CIBLES.valeurPlante) E.push(`cueillette ${q.id} : ${q.val} par plante > ${CIBLES.valeurPlante}`);
    for (const s of R.S) if (['apple', 'oak', 'birch', 'pine'].includes(s.id) && s.parS > CIBLES.secouerCommun) E.push(`arbres secoués (${s.id}) : ${s.parS.toFixed(2)} /s > ${CIBLES.secouerCommun}`);
    if (R.Bu[0].parS > CIBLES.bois) E.push(`bois : ${R.Bu[0].parS.toFixed(2)} /s > ${CIBLES.bois}`);
    for (const c of R.Ca) if (c.parS > CIBLES.pierre) E.push(`pierre : ${c.parS.toFixed(2)} /s > ${CIBLES.pierre}`);
  }
  if (!E.length) log('Tous les rendements sont dans leurs bornes (' + Object.keys(CIBLES).join(', ') + ').');
  for (const e of E) log('  HORS BORNES : ' + e);
  return E;
}

// ---------------------------------------------------------------- 4. valeur ajoutée par la cuisine, l'établi et les machines (à partir de la récolte)
// Au prix de base des ingrédients (le moins cher d'un groupe) : ce que rapporte une recette de plus que ses ingrédients.
// Une recette instantanée ne doit pas créer de valeur de rien (sinon : récolter, fabriquer, revendre à l'infini).
function valeurAjoutee(J, R, log) {
  const D = R.D, v = R.v;
  const vIng = (k) => (D.groupes[k] ? Math.min(...D.groupes[k].filter((x) => D.items[x]).map((x) => v(x))) : v(k));
  const lignes = [];
  for (const r of D.recettes) { if (!D.items[r.out] || D.items[r.out].cat === 'outil') continue; let s = 0; for (const k in r.need) s += r.need[k] * vIng(k); lignes.push({ ou: r.st || 'main', out: r.out, n: r.n, s, o: r.n * v(r.out), h: 0 }); }
  for (const m in D.machines) for (const r of D.machines[m]) { let s = 0; for (const k in r.in) s += r.in[k] * vIng(k); lignes.push({ ou: m, out: r.out[0], n: r.out[1], s, o: r.out[1] * v(r.out[0]), h: r.h }); }
  const E = [];
  for (const l of lignes) {
    const gain = l.o - l.s, borne = l.h ? Math.max(8, 0.5 * l.s) : Math.max(5, 0.4 * l.s);
    if (gain > borne) E.push(l);
  }
  lignes.sort((a, b) => (b.o - b.s) - (a.o - a.s));
  log(`${lignes.length} recettes et machines ; les plus rémunératrices (gain au prix de base des ingrédients) :`);
  for (const l of lignes.slice(0, 12)) log(`  ${l.out} ×${l.n} (${l.ou}${l.h ? ', ' + l.h + ' h' : ''}) : ingrédients ${l.s.toFixed(0)} → ${l.o} (${l.o - l.s >= 0 ? '+' : ''}${(l.o - l.s).toFixed(0)})`);
  for (const l of E) log(`  TROP RÉMUNÉRATRICE : ${l.out} (${l.ou}) : ${l.s.toFixed(0)} → ${l.o}`);
  return E;
}

// ---------------------------------------------------------------- 5. coûts : en journées de revenu du moment
function couts(J, R, log) {
  const P = JSON.parse(J.ev(`JSON.stringify({ items: Object.fromEntries(['poule', 'vache', 'mouton', 'cochon', 'cheval', 'plan_poulailler', 'plan_grange', 'hache_fer', 'hache_acier', 'fusil', 'arrosoir_cuivre', 'houe_fer', 'livre_bestiaire', 'table_alchimie'].map((id) => [id, (() => { let m = 0; for (const d of NPC_DATA) if (d.shop) for (const [k, p] of d.shop.sells || []) if (k === id && p > 0 && (!m || p < m)) m = p; return m; })()])),
    loyers: typeof LOC_MAISONS !== 'undefined' ? Object.fromEntries(Object.entries(LOC_MAISONS).map(([k, M]) => [M.court, M.loyer])) : {} })`));
  const debut = 375, milieu = 1500, E = [];
  log(`Journée de revenu : début ≈ ${debut}, milieu ≈ ${milieu} (voir l'échelle).`);
  log('coût                    prix   jours (début)  jours (milieu)');
  for (const id in P.items) if (P.items[id]) log(`${id.padEnd(22)} ${String(P.items[id]).padStart(6)} ${(P.items[id] / debut).toFixed(1).padStart(10)} ${(P.items[id] / milieu).toFixed(1).padStart(12)}`);
  const auberge = 20 * 12;
  for (const k in P.loyers) {
    const l = P.loyers[k];
    log(`loyer ${k} : ${l} la semaine (${(l / 12).toFixed(1)} la nuit ; chambre de l'auberge 20) = ${(l / debut).toFixed(2)} journée du début`);
    if (l >= auberge) E.push(`loyer ${k} (${l}) plus cher que douze nuits à l'auberge (${auberge})`);
    if (l < 0.3 * debut) E.push(`loyer ${k} (${l}) dérisoire (moins d'un tiers de journée du début par semaine)`);
  }
  for (const e of E) log('  HORS BORNES : ' + e);
  return E;
}

module.exports = {
  titre: 'Commerce : prix, étals, boucles d’argent, rendements, coûts',
  catalogue, boucles, rendements, donnees, valeurs, esperance, HYP, CIBLES,
  async verifier(J, log) {
    let echecs = 0;
    const c = catalogue(J);
    log('\n# 1. Achat-revente (tous les points d’achat et de vente, amitié 0 à 10)');
    const B = boucles(J, c, log);
    if (B.length) echecs++;
    log('\n# 1 bis. Les tables d’étal, sans le garde-fou');
    if (etalsSolides(J, c, log).length) echecs++;
    log('\n# 2. Transformations : acheter, fabriquer, revendre');
    if (transformations(J, c, log).length) echecs++;
    log('\n# 3. Rendements (modèle)');
    const R = await rendements(J, log, { sansVallee: !!process.env.EQ_RAPIDE });   // EQ_RAPIDE=1 : sans générer la vallée (densités)
    log('\n# 3 bis. Rendements : les bornes');
    if (bornes(R, log).length) echecs++;
    log('\n# 4. Valeur ajoutée (cuisine, établi, machines), au prix de base des ingrédients');
    if (valeurAjoutee(J, R, log).length) echecs++;
    log('\n# 5. Coûts, en journées de revenu');
    if (couts(J, R, log).length) echecs++;
    return { echecs };
  },
};
