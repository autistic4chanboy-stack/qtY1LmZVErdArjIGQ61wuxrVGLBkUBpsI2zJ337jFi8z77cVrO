// Équilibrage — les RISQUES : l'argent du crime et du hasard, et ses peines (agent Q2).
//   node tools/equilibrage.js risques
// Mesure : butins et trésors (espérance de chaque table, coffres de la vallée, épuisement des trésors), fouilles et
// cachettes, vol à la tire, crochetage, primes et amendes, prison (peine, rançon), bibliothèque, jeux d'argent et
// concours. Toutes les sommes sont aussi exprimées en JOURS de revenus honnêtes (échelle de l'agent Q1, journée de
// 1200 s : dix minutes de jour, dix minutes de nuit). Les objets d'un butin valent leur prix (ce qu'on en tire à la
// caisse d'expédition), un objet qui s'ouvre (coffre englouti, géode…) vaut ce qu'il contient, une carte au trésor
// vaut son trésor.
'use strict';
const { vallee } = require('./vm.js');

// ---------------------------------------------------------------- l'échelle des revenus honnêtes (pièces par jour de jeu)
// (scratchpad/eq/echelle.md, agent Q1 : cibles après son réglage) : début = jours 1-3 (250-400), milieu = semaines 2-3
// (1000-1500), tard = ensuite (2000-4000) ; débit d'une activité à plein : début 0,3-0,5 pièce par seconde réelle.
const ECHELLE = { debut: 300, milieu: 1200, tard: 3000, debitDebut: 0.4 };
const JOUR_REEL_MIN = 20; // une journée de jeu : vingt minutes réelles

// ---------------------------------------------------------------- petits outils
const r0 = (v) => Math.round(v);
const r1 = (v) => Math.round(v * 10) / 10;
const pc = (v) => (Math.round(v * 1000) / 10).toFixed(1) + ' %';
const pad = (s, n) => String(s).padEnd(n);
const lpad = (s, n) => String(s).padStart(n);
const jours = (v, ref) => r1(v / ref) + ' j';
function mulberry(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

module.exports = {
  titre: 'Risques : vol à la tire, fouilles, crochetage, primes, prison, bibliothèque, jeux, trésors',
  async verifier(J, log) {
    let echecs = 0;
    const verif = (ok, msg) => { if (!ok) echecs++; log(`  ${ok ? 'ok ' : 'ÉCHEC'} ${msg}`); };
    const ITEMS = J.ev('ITEMS'), LOOT = J.ev('LOOT'), RESTE = J.ev('typeof LOOT_RESTE !== "undefined" ? LOOT_RESTE : {}');
    const E = ECHELLE;
    log(`Échelle des revenus honnêtes (pièces / jour de jeu de ${JOUR_REEL_MIN} min) : début ${E.debut}, milieu ${E.milieu}, tard ${E.tard}.`);

    // ============================================================ 1. la valeur des butins
    const memo = {};
    const valeur = (id, pile) => {
      if (id === 'argent') return 1;
      const it = ITEMS[id];
      if (!it) return 0;
      let v = it.price || 0;
      if (it.open && LOOT[it.open] && !(pile || []).includes(it.open)) v = Math.max(v, esperance(it.open, (pile || []).concat(it.open)).tot);
      if (id === 'carte_tresor' && LOOT.tresor_carte && !(pile || []).includes('tresor_carte')) v = Math.max(v, esperance('tresor_carte', (pile || []).concat('tresor_carte')).tot);
      return v;
    };
    // espérance d'un tirage de table (sans l'épuisement : la table elle-même)
    function esperance(key, pile) {
      if (!pile && memo[key]) return memo[key];
      const T = LOOT[key];
      if (!T) return { tot: 0, pieces: 0, objets: 0, top: [] };
      const items = T.items.filter((e) => e[3] > 0 && (e[0] === 'argent' || ITEMS[e[0]]));
      const W = items.reduce((a, e) => a + e[3], 0) || 1, nr = (T.rolls[0] + T.rolls[1]) / 2;
      let pieces = 0, objets = 0;
      const top = [];
      for (const e of items) {
        const q = (e[1] + e[2]) / 2, v = nr * e[3] / W * q * valeur(e[0], pile || [key]);
        if (e[0] === 'argent') pieces += v; else objets += v;
        top.push([e[0], v]);
      }
      top.sort((a, b) => b[1] - a[1]);
      const R = { tot: pieces + objets, pieces, objets, top: top.slice(0, 3).map(([k, v]) => `${k} ${r0(v)}`) };
      if (!pile) memo[key] = R;
      return R;
    }
    J.ev('farm.s = null');
    // défauts de données : objets absents (hors poids nul), quantités ou poids invalides
    const defauts = [];
    for (const k in LOOT) {
      const T = LOOT[k];
      if (!Array.isArray(T.rolls) || !(T.rolls[0] >= 0) || T.rolls[1] < T.rolls[0]) defauts.push(`${k}: tirages ${T.rolls}`);
      for (const e of T.items) {
        if (!(e[3] >= 0) || !isFinite(e[3])) defauts.push(`${k}: poids ${e}`);
        if (e[3] > 0 && e[0] !== 'argent' && !ITEMS[e[0]]) defauts.push(`${k}: objet absent ${e[0]}`);
        if (e[3] > 0 && !(e[1] >= 1 && e[2] >= e[1])) defauts.push(`${k}: quantités ${e}`);
      }
      if (!isFinite(esperance(k).tot)) defauts.push(`${k}: espérance NaN`);
    }
    for (const k in RESTE) if (!LOOT[k] || !LOOT[RESTE[k]]) defauts.push(`reste de ${k} : table absente (${RESTE[k]})`);

    // ============================================================ 2. la vallée : coffres, fouilles, points à creuser
    const w = await vallee(J, 1234);
    const coffres = {}, creuser = {}, f2 = [];
    for (const it of w.inter) {
      const d = it.data || {};
      if (it.kind === 'loot') (coffres[d.table] = coffres[d.table] || []).push(it);
      else if (it.kind === 'dig' && d.loot) (creuser[d.loot] = creuser[d.loot] || []).push(it);
      else if (it.kind === 'f2') f2.push(it);
    }
    for (const s of w.secrets || []) if (s.loot) (creuser[s.loot] = creuser[s.loot] || []).push(s);
    const pleins = (k) => (coffres[k] || []).length + (creuser[k] || []).length;

    log('\n--- Coffres des lieux (se remplissent tous les 3 jours) : espérance à la première ouverture, puis aux suivantes');
    log(`${pad('table', 16)}${lpad('n', 3)}${lpad('1re', 7)}${lpad('ensuite', 9)}${lpad('/jour', 7)}  (ensuite : la table du reste, une fois les n coffres pleins ouverts)`);
    let totPremier = 0, totJour = 0, totJourTemple = 0;
    const lignesCoffres = Object.keys(coffres).map((k) => {
      const n = coffres[k].length, ev = esperance(k).tot, ens = RESTE[k] ? esperance(RESTE[k]).tot : ev;
      return { k, n, ev, ens, jour: n * ens / 3, temple: coffres[k].some((it) => it.data.temple), envers: coffres[k].some((it) => it.data.envers) };
    }).sort((a, b) => b.n * b.ev - a.n * a.ev);
    for (const L of lignesCoffres) {
      totPremier += L.n * L.ev;
      if (L.temple) totJourTemple += L.jour; else if (!L.envers) totJour += L.jour;
      log(`${pad(L.k + (L.temple ? '*' : L.envers ? '°' : ''), 16)}${lpad(L.n, 3)}${lpad(r0(L.ev), 7)}${lpad(r0(L.ens), 9)}${lpad(r0(L.jour), 7)}  ${esperance(L.k).top.join(', ')}`);
    }
    log(`(* le temple : chaque prise maudit ; ° l'Envers, les nuits rouges seulement)`);
    log(`Tous les coffres à la première ouverture : ${r0(totPremier)} pièces (${jours(totPremier, E.milieu)} de revenus du milieu de partie).`);
    log(`Tournée de TOUS les coffres ordinaires tous les 3 jours, ensuite : ${r0(totJour)} pièces / jour (${pc(totJour / E.milieu)} des revenus du milieu) ; le temple : ${r0(totJourTemple)} / jour.`);

    log('\n--- Trésors enfouis (une seule fois) : points à creuser, secrets, carte au trésor');
    for (const k of Object.keys(creuser)) log(`  ${pad(k, 16)} ×${creuser[k].length}  ${r0(esperance(k).tot)} pièces  (${esperance(k).top.join(', ')})`);
    log(`  ${pad('tresor_carte', 16)} par carte  ${r0(esperance('tresor_carte').tot)} pièces  (${esperance('tresor_carte').top.join(', ')})`);

    log('\n--- Objets qu\'on ouvre (espérance du contenu)');
    for (const id of Object.keys(ITEMS).filter((i) => ITEMS[i].open)) log(`  ${pad(id, 16)} prix ${lpad(ITEMS[id].price || 0, 4)}  contenu ${r0(esperance(ITEMS[id].open).tot)}  (${esperance(ITEMS[id].open).top.join(', ')})`);

    // ============================================================ 3. les fouilles (11-zzz98) et les cachettes
    const F2_TYPES = J.ev('F2_TYPES'), F2_CACHES = J.ev('F2_CACHES');
    const groupes = {};
    for (const it of f2) {
      const d = it.data, T = F2_TYPES[d.t] || F2_TYPES.malle;
      if (d.cache) continue;
      const table = d.table || T.table, lieu = d.lieu || 'maison', r = J.avec({ it }, 'fouilles.refill(__v.it)');
      const g = groupes[table + '|' + lieu + '|' + d.t] || (groupes[table + '|' + lieu + '|' + d.t] = { table, lieu, t: d.t, n: 0, r, lock: 0 });
      g.n++; g.lock = Math.max(g.lock, d.lock || 0);
    }
    log('\n--- Fouilles (tables, lieux) : espérance par fouille et par jour (tout fouillé dès que plein)');
    log(`${pad('table', 24)}${pad('lieu', 9)}${lpad('n', 3)}${lpad('serr.', 6)}${lpad('fouille', 8)}${lpad('rempl.', 7)}${lpad('/jour', 7)}`);
    const parLieu = {};
    const G = Object.values(groupes).sort((a, b) => esperance(b.table).tot - esperance(a.table).tot);
    for (const g of G) {
      const ev = esperance(g.table).tot, j = g.n * ev / g.r;
      parLieu[g.lieu] = (parLieu[g.lieu] || 0) + j;
      log(`${pad(g.table, 24)}${pad(g.lieu, 9)}${lpad(g.n, 3)}${lpad(g.lock || '', 6)}${lpad(r0(ev), 8)}${lpad(g.r, 7)}${lpad(r0(j), 7)}`);
    }
    log('Par lieu, pièces par jour si l\'on vide tout : ' + Object.keys(parLieu).map((k) => `${k} ${r0(parLieu[k])}`).join(', ') + ' (maison, église : vol ; public : vol s\'il y a un témoin ; abandon, rebut : pas un crime).');
    log('Cachettes (révélées par un papier, une seule fois) :');
    let totCaches = 0;
    for (const c in F2_CACHES) { const v = F2_CACHES[c].lots.reduce((a, [id, n]) => a + n * valeur(id), 0); totCaches += v; log(`  ${pad(c, 10)} ${lpad(r0(v), 5)}  ${F2_CACHES[c].lots.map(([id, n]) => (n > 1 ? n + ' ' : '') + id).join(', ')}${F2_CACHES[c].own ? ' (chez ' + F2_CACHES[c].own + ')' : ''}`); }
    log(`  toutes : ${r0(totCaches)} pièces (${jours(totCaches, E.debut)} de revenus du début).`);

    // ============================================================ 4. le vol à la tire
    const VP = J.ev('VOL_POCHES');
    J.ev('farm.s = farm.blank(1234); game.world = { time: 0.5 }; game.player = { pos: [0, 0, -1], crouch: 1, vel: [0, 0, 0] }; game.lantern = false;');
    const chance = (id, o) => J.avec({ id, o }, `(function () {
      const o = __v.o, d = NPC_BY_ID[__v.id];
      game.world.time = o.h / 24; game.player.crouch = o.accroupi ? 1 : 0;
      const n = { id: __v.id, d, st: { amitie: o.amitie || 0, alive: true }, state: o.state || 'idle', heading: 0, x: 0, z: 0, goal: o.pose ? { pose: o.pose } : null, chatT: o.parle ? 2 : 0, bubbleT: 0 };
      npcs.list = []; for (let i = 0; i < (o.foule || 0); i++) npcs.list.push({ id: 'f' + i, st: { alive: true }, x: 1, z: 1, state: 'idle' });
      const k = vol.chance(n); npcs.list = []; return k; })()`);
    const butinPoche = (id, marche) => {
      const P = VP[id] || { b: [2, 10], m: [], p: [] };
      const have = (L) => (L || []).filter((k) => ITEMS[k]), R = have(P.r), M = have(P.m), Pp = have(P.p);
      const moy = (L) => (L.length ? L.reduce((a, k) => a + valeur(k), 0) / L.length : 0);
      let pieces = 0.85 * (P.b[0] + P.b[1]) / 2 * (marche && NPC_BY_SHOP(id) ? 1.5 : 1);
      // (tirage de l'objet : r < 0,06 rare ; r < 0,6 métier ; r < 0,9 personnel)
      let obj = 0;
      if (R.length) { obj += 0.06 * moy(R); if (M.length) obj += 0.54 * moy(M); if (Pp.length) obj += (M.length ? 0.3 : 0.84) * moy(Pp); }
      else { if (M.length) obj += 0.6 * moy(M); if (Pp.length) obj += (M.length ? 0.3 : 0.9) * moy(Pp); }
      return { pieces, obj, tot: pieces + obj };
    };
    const shops = J.ev('Object.fromEntries(NPC_DATA.map((d) => [d.id, !!d.shop]))');
    function NPC_BY_SHOP(id) { return shops[id]; }
    const SC = {
      'dos, marche': { h: 11, accroupi: true, state: 'walk' },
      'dos, ouvrage': { h: 11, accroupi: true, pose: 'work' },
      'dos, bavarde': { h: 11, accroupi: true, parle: true },
      'marché (foule)': { h: 10, accroupi: true, foule: 3 },
      'endormi (nuit)': { h: 2, accroupi: true, state: 'sleep' },
    };
    log('\n--- Vol à la tire : butin moyen d\'une poche réussie, et chance de réussite selon la situation');
    log(`${pad('habitant', 16)}${lpad('butin', 6)}  ` + Object.keys(SC).map((k) => lpad(k, 16)).join(''));
    const volLignes = [];
    for (const id of Object.keys(VP)) {
      if (!J.ev(`!!NPC_BY_ID[${JSON.stringify(id)}]`)) continue;
      const b = butinPoche(id, false), ch = Object.keys(SC).map((k) => chance(id, SC[k]));
      volLignes.push({ id, b, ch });
      log(`${pad(id, 16)}${lpad(r0(b.tot), 6)}  ` + ch.map((k) => lpad(pc(k), 16)).join(''));
    }
    const moyB = volLignes.reduce((a, L) => a + L.b.tot, 0) / volLignes.length;
    const moyCh = (i) => volLignes.reduce((a, L) => a + L.ch[i], 0) / volLignes.length;
    log(`moyenne : butin ${r0(moyB)} ; chances ${Object.keys(SC).map((k, i) => k + ' ' + pc(moyCh(i))).join(', ')}`);

    // ============================================================ 5. primes, amendes, prison
    const CD = J.ev('CRIME_DEF'), PP = J.ev('PRISON_PEINE');
    log('\n--- Primes (amendes) et oubli');
    log(`${pad('crime', 13)}${lpad('prime', 6)}${lpad('début', 8)}${lpad('milieu', 8)}${lpad('oubli', 7)}${lpad('(réel)', 9)}${lpad('peine', 7)}`);
    for (const k of Object.keys(CD).sort((a, b) => CD[b].prime - CD[a].prime)) log(`${pad(k, 13)}${lpad(CD[k].prime, 6)}${lpad(jours(CD[k].prime, E.debut), 8)}${lpad(jours(CD[k].prime, E.milieu), 8)}${lpad(CD[k].oubli + ' j', 7)}${lpad(r1(CD[k].oubli * JOUR_REEL_MIN / 60) + ' h', 9)}${lpad((PP[k] || 1) + ' j', 7)}`);
    const prime = (type, avant) => Math.round(CD[type].prime * Math.min(2, 1 + avant * 0.25) / 5) * 5;
    log(`Récidive : la prime d'un vol passe de ${prime('vol', 0)} à ${prime('vol', 2)} (2 crimes avant) et ${prime('vol', 4)} (4 et plus).`);
    // prison : scénarios
    const peine = (crimes, fois) => J.avec({ crimes, fois }, `(function () { const P = prison.S(); P.fois = __v.fois; const A = __v.crimes.map((t) => ({ type: t })); const pr = __v.crimes.reduce((a, t) => a + CRIME_DEF[t].prime, 0); const j = prison.peine(A, pr); return [pr, j, prison.prixRancon(pr, j)]; })()`);
    const SCP = [['un vol (première fois)', ['vol'], 0], ['un vol (troisième séjour)', ['vol'], 2], ['vol et effraction', ['vol', 'effraction'], 0], ['une agression', ['agression'], 0], ['une profanation', ['profanation'], 0], ['un meurtre', ['meurtre'], 0], ['deux meurtres', ['meurtre', 'meurtre'], 1], ['trois meurtres, récidive', ['meurtre', 'meurtre', 'meurtre'], 3]];
    log('\n--- Prison : peine et rançon (prime additionnée des crimes connus)');
    log(`${pad('cas', 26)}${lpad('prime', 6)}${lpad('peine', 7)}${lpad('rançon', 8)}${lpad('début', 8)}${lpad('milieu', 8)}${lpad('dormir', 8)}${lpad('vivre', 8)}${lpad('carrière', 10)}`);
    const prisonLignes = [];
    for (const [nom, cr, fois] of SCP) {
      const [pr, j, ra] = peine(cr, fois);
      prisonLignes.push({ nom, cr, pr, j, ra });
      // réel : dormir sur la paille mène au matin (≈ 5 s par jour) ; vivre ses jours : 20 min chacun ; la carrière compte double (un matin de travail ≈ 2 min)
      log(`${pad(nom, 26)}${lpad(pr, 6)}${lpad(j + ' j', 7)}${lpad(ra, 8)}${lpad(jours(ra, E.debut), 8)}${lpad(jours(ra, E.milieu), 8)}${lpad(r1(j * 5 / 60) + ' m', 8)}${lpad(r0(j * JOUR_REEL_MIN) + ' m', 8)}${lpad(Math.ceil(j / 2) + ' j', 10)}`);
    }

    // ============================================================ 6. le crochetage
    const CP = J.ev('CROC_PINS'), CZ = J.ev('CROC_ZONE'), CV = J.ev('CROC_VIT'), CC = J.ev('CROC_CASSE');
    const erf = (x) => { const t = 1 / (1 + 0.3275911 * Math.abs(x)), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; };
    // un joueur vise le passage de la goupille sur la ligne, avec une erreur de temps σ (ms) ; la goupille court à 2·v par seconde
    const crocheter = (d, sigma) => {
      const i = d - 1, fen = CZ[i] / (2 * CV[i]) * 1000, p = erf(fen / (sigma * Math.SQRT2));
      const retombe = [0, 0, 0.5, 0.65, 0.8][i];
      // marche aléatoire : +1 (réussi), -1 (raté et la goupille d'avant retombe), 0 (raté) ; on simule
      const rnd = mulberry(d * 97 + sigma);
      let rates = 0, essais = 0, N = 4000, ouverts = 0;
      for (let k = 0; k < N; k++) {
        let pos = 0, e = 0, m = 0;
        while (pos < CP[i] && e < 200) { e++; if (rnd() < p) pos++; else { m++; if (pos > 0 && rnd() < retombe) pos--; } }
        if (pos >= CP[i]) ouverts++;
        rates += m; essais += e;
      }
      return { fen, p, rates: rates / N, casses: rates / N * CC[i], ouvre: ouverts / N };
    };
    log('\n--- Crochetage : fenêtre de chaque passage, et pour un joueur d\'adresse σ (erreur de temps)');
    log(`${pad('serrure', 9)}${lpad('goup.', 6)}${lpad('fenêtre', 9)}` + [30, 50, 80].map((s) => lpad(`σ${s}: réussi/ratés/casse`, 26)).join(''));
    const crocs = {};
    for (let d = 1; d <= 5; d++) {
      const L = [30, 50, 80].map((s) => crocheter(d, s));
      crocs[d] = L;
      log(`${pad(d, 9)}${lpad(CP[d - 1], 6)}${lpad('±' + r0(L[0].fen) + ' ms', 9)}` + L.map((q) => lpad(`${pc(q.p)} / ${r1(q.rates)} / ${r1(q.casses)}`, 26)).join(''));
    }
    log('Bruit : chaque raté réveille le propriétaire endormi avec 11 % (porte : bruit 1), un voisin endormi 4 %, un passant à moins de 9 m 50 % ; un passant qui voit la porte, 12 % par demi-seconde le jour (3 % la nuit).');

    // ============================================================ 7. la bibliothèque
    const CAT = J.ev('biblio.catalogue()');
    log('\n--- Bibliothèque : prix de l\'emprunt (1, 3, 7 jours) ; les cartes s\'achètent aussi chez les marchands');
    const biblioLignes = [];
    for (const e of CAT) {
      const p = [1, 3, 7].map((j) => J.avec({ e, j }, 'biblio.prix(__v.e, __v.j)'));
      const achat = e.carte ? ITEMS[e.item].price : 0;
      biblioLignes.push({ e, p, achat });
      log(`  ${pad(e.item, 24)}${lpad(p.join(' / '), 14)}${achat ? `   achat ${achat} : 7 jours = ${pc(p[2] / achat)}` : ''}`);
    }

    // ============================================================ 8. les jeux d'argent et les concours
    log('\n--- Jeux d\'argent (espérance pour une mise de 1)');
    // le passe-dix : trois dés chacun, le plus gros total gagne ; égalité relancée jusqu'à 4 fois, puis chacun reprend sa mise
    const dist = (pipe) => { const one = [0, 0, 0, 0, 0, 0, 0]; for (let k = 1; k <= 6; k++) one[k] = pipe ? (2 * k - 1) / 36 : 1 / 6; let D = { 0: 1 }; for (let n = 0; n < 3; n++) { const N = {}; for (const s in D) for (let k = 1; k <= 6; k++) N[+s + k] = (N[+s + k] || 0) + D[s] * one[k]; D = N; } return D; };
    const passeDix = (pipe) => { const A = dist(pipe), B = dist(false); let g = 0, p = 0, t = 0; for (const a in A) for (const b in B) { const q = A[a] * B[b]; if (+a > +b) g += q; else if (+a < +b) p += q; else t += q; } const k = (1 - t ** 4) / (1 - t); return { g: g * k, p: p * k, t: t ** 4 }; };
    const PD = passeDix(false), PDp = passeDix(true);
    const evPipe = PDp.g * 0.8 - PDp.p; // pris une fois sur cinq : le gain est repris
    log(`  passe-dix, dés honnêtes : gagné ${pc(PD.g)}, perdu ${pc(PD.p)} → espérance ${pc(PD.g - PD.p)}`);
    log(`  passe-dix, dés pipés : gagné ${pc(PDp.g)}, perdu ${pc(PDp.p)}, pris 20 % → espérance ${pc(evPipe)} par partie (puis 3 jours d'interdiction, amitié −80)`);
    // le vingt-et-un (paquet infini, le banquier tire jusqu'à 17, le vingt-et-un servi paie 3 contre 2, sans doubler ni séparer)
    const C13 = [['A', 11, 1 / 13]].concat([2, 3, 4, 5, 6, 7, 8, 9].map((v) => [String(v), v, 1 / 13]), [['10', 10, 4 / 13]]);
    const add = (t, s, v) => { t += v; if (v === 11) s++; while (t > 21 && s) { t -= 10; s--; } return [t, s]; };
    const memoD = new Map();
    const banque = (t, s, n) => { // distribution finale du banquier depuis (total, as souples, nombre de cartes)
      const key = t + ',' + s + ',' + Math.min(n, 2);
      if (memoD.has(key)) return memoD.get(key);
      let R;
      if (n >= 2 && t >= 17) R = { [t > 21 ? 22 : t]: 1 };
      else { R = {}; for (const [, v, q] of C13) { const [t2, s2] = add(t, s, v); const S = banque(t2, s2, n + 1); for (const k in S) R[k] = (R[k] || 0) + q * S[k]; } }
      memoD.set(key, R); return R;
    };
    const issue = (t, D) => { if (t > 21) return -1; let e = 0; for (const k in D) { const u = +k; e += D[k] * (u > 21 || t > u ? 1 : t === u ? 0 : -1); } return e; };
    const memoJ = new Map();
    const joueur = (t, s, up, D, strat) => { // espérance optimale (strat 'opt') ou naïve (tirer sous 17)
      const key = t + ',' + s + ',' + up + ',' + strat;
      if (memoJ.has(key)) return memoJ.get(key);
      const rester = issue(t, D);
      let R = rester;
      if (t < 21 && (strat === 'opt' || t < 17)) { let tirer = 0; for (const [, v, q] of C13) { const [t2, s2] = add(t, s, v); tirer += q * (t2 > 21 ? -1 : joueur(t2, s2, up, D, strat)); } R = strat === 'opt' ? Math.max(rester, tirer) : tirer; }
      memoJ.set(key, R); return R;
    };
    const vingtEtUn = (strat) => {
      let ev = 0;
      for (const [, u, qu] of C13) {
        const [tu, su] = add(0, 0, u), D = banque(tu, su, 1);
        for (const [, a, qa] of C13) for (const [, b, qb] of C13) {
          let [t, s] = add(0, 0, a); [t, s] = add(t, s, b);
          const q = qu * qa * qb;
          if (t === 21) { const p21 = D[21] || 0; ev += q * (1 - p21) * 1.5; continue; }
          ev += q * joueur(t, s, u, D, strat);
        }
      }
      return ev;
    };
    const V21 = vingtEtUn('opt'), V21n = vingtEtUn('naif');
    log(`  vingt-et-un : espérance ${pc(V21)} au mieux, ${pc(V21n)} en tirant jusqu'à 17 comme le banquier`);
    // la tombola : 50 numéros, 8 tirés, un lot par numéro sorti
    const LOTS = J.ev('activites.LOTS'), valLots = LOTS.reduce((a, [id, n]) => a + n * valeur(id), 0);
    const billet = J.ev('activites.BILLET || 5');
    const src99 = require('fs').readFileSync(require('path').join(__dirname, '..', '..', 'src', '11-zzz99-activites.js'), 'utf8');
    const mB = /Acheter un billet \((\d+) pièces\)/.exec(src99), billetTexte = mB ? +mB[1] : null;
    log(`  tombola : lots ${r0(valLots)} pièces pour 50 billets à ${billet} → un billet rapporte ${r1(valLots / 50)} (${pc(valLots / 50 / billet)} de son prix)`);
    // les quilles : la cagnotte (10 pièces) pour les neuf d'un coup, en visant le milieu
    let pStrike = 0;
    for (let k = 0; k < 400; k++) { const f = 0.8 + 0.35 * (k + 0.5) / 400; pStrike += Math.min(1, 0.85 * f) ** 3 * Math.min(1, 0.55 * f) ** 6 / 400; }
    log(`  quilles : les neuf d'un coup ${pc(pStrike)} → ${r1(10 * pStrike)} pièce par partie (gratuit, 3 parties par jour)`);
    // concours (une fois par semaine de 12 jours)
    const cartouche = valeur('cartouche'), coffreP = valeur('coffre_peche');
    log(`  concours de tir : 1er ${60 + 6 * cartouche} (60 + 6 cartouches), 2e 25, 3e ${3 * cartouche} ; inscription 5 ; le chasseur tire 21 à 28 points sur 30`);
    // le concours de pêche : les habitants présentent la plus belle de leurs prises du lac (activites.prisesPNJ) ; le
    // joueur, la plus belle des siennes (mêmes poissons, mêmes poids) : on joue 1200 Pêchedi
    const peche = J.ev(`(function () {
      const s0 = farm.s, al = npcs.alive; farm.s = farm.blank(1234); npcs.alive = () => true;
      const L = Object.keys(FISH).filter((id) => ITEMS[id] && FISH[id].where.includes('lac') && FISH[id].time !== 'nuit' && !FISH[id].moon);
      const tot = L.reduce((a, id) => a + FISH[id].w, 0), rnd = mulberry32(99);
      const prise = () => { let r = rnd() * tot; for (const id of L) { r -= FISH[id].w; if (r <= 0) return id; } return L[L.length - 1]; };
      const res = { 12: [0, 0], 25: [0, 0] }, N = 1200;
      let pe = 0;
      for (let d = 1; d <= N; d++) {
        farm.s.day = d;
        const P = activites.prisesPNJ(2, [['pecheur', 6], ['maire', 2], ['aubergiste', 3], ['fillette', 1], ['colporteur', 2]]).map((q) => q[1]).sort((a, b) => b - a);
        pe += P[0];
        for (const n of [12, 25]) { let b = 0; for (let i = 0; i < n; i++) b = Math.max(b, ITEMS[prise()].price); if (b > P[0]) res[n][0]++; else if (b > P[1]) res[n][1]++; }
      }
      farm.s = s0; npcs.alive = al;
      return { p12: res[12][0] / N, p12b: res[12][1] / N, p25: res[25][0] / N, p25b: res[25][1] / N, meilleur: pe / N };
    })()`);
    log(`  concours de pêche : 1er 50 + un coffre englouti (${r0(coffreP)}) = ${r0(50 + coffreP)}, 2e 25 ; le meilleur des habitants présente en moyenne ${r0(peche.meilleur)} ; le joueur gagne ${pc(peche.p12)} (12 prises) ou ${pc(peche.p25)} (25 prises), 2e ${pc(peche.p12b)} / ${pc(peche.p25b)}`);

    // ============================================================ 9. le crime comparé au travail honnête
    log('\n--- Le crime rapporte-t-il plus que le travail ? (risque compté)');
    const amende = prime('vol', 1); // (une prime de vol, avec un crime déjà sur le dos)
    const amitieVal = 3 * 40; // −150 points d'amitié : trois cadeaux « aimés », une quarantaine de pièces chacun
    const evPoche = (p, b, ami) => p * b - (1 - p) * (amende + (ami ? amitieVal : 0));
    const DUREE = 30; // secondes réelles pour approcher un habitant, s'accroupir, attendre le bon moment
    const volSc = Object.keys(SC).map((k, i) => ({ k, p: moyCh(i), ev: evPoche(moyCh(i), moyB, false), evA: evPoche(moyCh(i), moyB, true) }));
    for (const v of volSc) log(`  une poche, ${pad(v.k, 16)} : chance ${pc(v.p)}, butin ${r0(moyB)} ; raté : amende ${amende} (+ amitié ${amitieVal}) → ${r1(v.ev)} (${r1(v.evA)}) par tentative, ${r1(v.ev / DUREE)} pièce/s (honnête au début : ${E.debitDebut})`);
    const cave = ['f2_cave_casier', 'f2_cave_tonneaux', 'f2_cave_jambons', 'f2_cave_caisse', 'f2_caisse_auberge', 'f2_tonneaux'].reduce((a, k) => a + esperance(k).tot, 0);
    log(`  une nuit à l'auberge (cave et comptoir vidés) : ${r0(cave)} pièces ; pris : amende ${prime('vol', 0)} à ${prime('vol', 4)}, amitié de l'aubergiste −150`);

    // ============================================================ 10. les invariants
    log('\n--- Vérifications');
    // les butins
    verif(!defauts.length, `tables de butin sans défaut (objets, poids, quantités, espérances)${defauts.length ? ' : ' + defauts.slice(0, 8).join(' ; ') : ''}`);
    const restes = Object.keys(RESTE).map((k) => [k, esperance(k).tot, esperance(RESTE[k]).tot]);
    verif(restes.length && restes.every(([, a, b]) => b <= 60 && b <= 0.15 * a), `trésors scellés : une fois ouverts, il n'y revient presque rien (${restes.map(([k, a, b]) => `${k} ${r0(a)}→${r0(b)}`).join(', ')})`);
    verif(['temple', 'temple_or', 'crypte', 'clocher'].every((k) => RESTE[k]), 'le temple, la crypte et le clocher englouti ne se remplissent pas');
    // un « lieu » : les coffres à moins de 40 m les uns des autres (la grotte des contrebandiers, la crypte…)
    const ord = [];
    for (const k in coffres) for (const it of coffres[k]) if (!it.data.temple && !it.data.envers) ord.push({ it, v: (RESTE[k] ? esperance(RESTE[k]).tot : esperance(k).tot) / 3, k });
    const lieux = [];
    for (const c of ord) {
      const L = lieux.find((q) => q.m.some((o) => Math.hypot(o.it.x - c.it.x, o.it.z - c.it.z) < 40));
      if (L) { L.m.push(c); L.v += c.v; } else lieux.push({ m: [c], v: c.v });
    }
    lieux.sort((a, b) => b.v - a.v);
    log(`Les lieux à coffres les plus riches, une fois les trésors pris (pièces par jour, visités tous les 3 jours) : ${lieux.slice(0, 5).map((L) => `${[...new Set(L.m.map((c) => c.k))].join('+')} ×${L.m.length} ${r0(L.v)}`).join(', ')}`);
    const lourds = lieux.filter((L) => L.v > 0.15 * E.milieu);
    verif(!lourds.length, `aucun lieu à coffres qui se regarnissent ne rapporte plus de 15 % d'une journée du milieu par jour (max ${r0(lieux[0].v)})`);
    verif(totJour <= E.milieu, `la tournée de TOUS les coffres ordinaires tous les 3 jours rapporte moins qu'une journée de travail du milieu (${r0(totJour)} / jour)`);
    const carte = esperance('tresor_carte').tot;
    verif(carte >= 0.5 * E.debut && carte <= 1.5 * E.debut, `une carte au trésor : un beau jour de chance, pas une fortune (${r0(carte)} pièces)`);
    verif(coffreP >= 60 && coffreP <= 200, `le coffre englouti : quelques poissons, pas un tiers de la pêche (${r0(coffreP)} pièces)`);
    const etalOk = J.ev(`(function () { const s0 = farm.s; farm.s = farm.blank(1234); farm.s.day = 30; const R = { id: 'curiosites' }; const a = activites.piece(R, 'carte_tresor'); activites.piece(R, 'carte_tresor', true); const b = activites.piece(R, 'carte_tresor'); farm.s.day = 42; const c = activites.piece(R, 'carte_tresor'); const f = activites.piece({ id: 'fromagere' }, 'fromage', true) || activites.piece({ id: 'fromagere' }, 'fromage'); farm.s = s0; return !a && b && !c && !f; })()`);
    verif(etalOk, 'les curiosités et la brocante n\'ont qu\'une pièce de chaque par semaine (pas de cartes au trésor ni de géodes à la chaîne)');
    // les fouilles
    const f2max = G.reduce((m, g) => Math.max(m, esperance(g.table).tot), 0);
    verif(f2max <= 200, `aucune fouille ne rapporte plus d'un beau butin, 200 pièces (max ${r0(f2max)})`);
    const libres = G.filter((g) => g.lieu === 'abandon' || g.lieu === 'rebut');
    verif(libres.every((g) => esperance(g.table).tot <= 70), `fouiller chez les disparus et dans les poubelles reste modeste (≤ 70 par fouille : ${libres.map((g) => g.table + ' ' + r0(esperance(g.table).tot)).join(', ')})`);
    const libresJour = (parLieu.abandon || 0) + (parLieu.rebut || 0);
    verif(libresJour <= 0.25 * E.debut, `sans crime (maisons vides, poubelles), tout vider chaque fois que c'est plein rapporte moins du quart d'une journée des débuts (${r0(libresJour)} / jour)`);
    const etals = G.filter((g) => g.t === 'etal' || (g.t === 'caisses' && g.lieu === 'public'));
    verif(etals.every((g) => esperance(g.table).tot <= 70), `on chaparde une chose à un étal, pas l'étal (${etals.map((g) => g.table + ' ' + r0(esperance(g.table).tot)).join(', ')})`);
    verif(totCaches >= 2 * E.debut && totCaches <= 10 * E.debut, `les cachettes récompensent l'enquête (${r0(totCaches)} pièces pour les sept)`);
    // le vol à la tire
    verif(moyB >= 20 && moyB <= 70, `une poche réussie : quelques dizaines de pièces (${r0(moyB)} en moyenne)`);
    const pire = volSc.reduce((m, v) => Math.max(m, v.ev), -1e9);
    verif(pire / DUREE <= E.debitDebut, `faire les poches ne rapporte pas plus que le travail des débuts, même dans le meilleur cas (${r1(pire / DUREE)} pièce/s)`);
    // les primes, la prison
    verif(CD.vol.prime >= 0.3 * E.debut && CD.vol.prime <= 0.7 * E.debut, `l'amende d'un vol : une demi-journée des débuts (${CD.vol.prime})`);
    verif(CD.meurtre.prime >= 2 * E.debut && CD.meurtre.prime <= 5 * E.debut, `la prime d'un meurtre : quelques jours de travail (${CD.meurtre.prime})`);
    const ordre = ['meurtre', 'profanation', 'evasion', 'agression', 'vol', 'braconnage', 'intrusion'];
    verif(ordre.every((k, i) => !i || CD[ordre[i - 1]].prime > CD[k].prime) && CD.effraction.prime <= CD.agression.prime && CD.effraction.prime >= CD.braconnage.prime, `les primes suivent la gravité (${ordre.map((k) => k + ' ' + CD[k].prime).join(' > ')})`);
    verif(CD.vol.oubli * JOUR_REEL_MIN / 60 <= 3, `un vol impayé s'oublie en moins de trois heures de jeu (${CD.vol.oubli} jours)`);
    const pv = prisonLignes[0], pm = prisonLignes.find((q) => q.nom === 'un meurtre'), maxJ = Math.max(...prisonLignes.map((q) => q.j));
    verif(pv.j <= 2 && pv.ra >= 0.7 * E.debut && pv.ra <= 2 * E.debut, `un premier vol : ${pv.j} jour de cachot, rançon ${pv.ra} (lourde mais payable)`);
    verif(pm.ra >= 3 * E.debut && pm.ra <= 3 * E.milieu, `un meurtre : ${pm.j} jours, rançon ${pm.ra} (plusieurs jours de travail)`);
    verif(maxJ <= 20 && maxJ * 5 / 60 < 3, `la plus longue peine (${maxJ} jours) se fait en moins de trois minutes réelles en dormant sur la paille`);
    const rj = J.ev(`(function () { const s0 = farm.s; farm.s = farm.blank(1234); const P = prison.S(); Object.assign(P, { actif: true, prime: 150, jours: 3, bourse: 300 }); prison.majRancon(); const a = P.rancon; P.jours = 1; prison.majRancon(); const b = P.rancon; farm.s = s0; return [a, b]; })()`);
    verif(rj[1] < rj[0], `la rançon baisse avec la peine qui reste (${rj[0]} pour 3 jours, ${rj[1]} pour le dernier)`);
    // le crochetage
    const c50 = [1, 2, 3, 4, 5].map((d) => crocs[d][1].p);
    verif(c50.every((p, i) => !i || p < c50[i - 1]) && c50[0] >= 0.9 && c50[1] >= 0.9 && c50[4] <= 0.6, `crochetage : une serrure simple s'ouvre, une serrure de maître résiste (${c50.map(pc).join(', ')} par goupille pour σ 50 ms)`);
    // la bibliothèque
    const livres1 = biblioLignes.filter((b) => !b.e.carte && !/^Langues/.test(b.e.genre)).map((b) => b.p[0]);
    verif(Math.max(...livres1) <= 0.1 * E.debut, `emprunter un livre un jour ne décourage pas (≤ ${r0(0.1 * E.debut)} pièces : ${Math.max(...livres1)} au plus)`);
    verif(biblioLignes.every((b) => b.p[0] <= 0.25 * E.debut), 'aucun emprunt d\'un jour ne coûte plus du quart d\'une journée des débuts');
    const cartesB = biblioLignes.filter((b) => b.achat > 0);
    verif(cartesB.every((b) => b.p[2] <= 0.55 * b.achat), `emprunter une carte sept jours coûte moins de la moitié de son prix (${cartesB.map((b) => b.e.carte + ' ' + pc(b.p[2] / b.achat)).join(', ')})`);
    // les jeux
    verif(PD.g - PD.p <= 0.0001 && PD.g - PD.p > -0.08, `passe-dix entre habitués : personne ne gagne à la longue (${pc(PD.g - PD.p)})`);
    verif(V21 < 0 && V21 > -0.08, `vingt-et-un : la maison gagne, modérément (${pc(V21)} au mieux)`);
    verif(valLots / 50 < 0.9 * billet && valLots / 50 > 0.5 * billet, `tombola : la maison gagne, modérément (un billet rend ${pc(valLots / 50 / billet)})`);
    verif(billetTexte === billet, `le prix du billet écrit dans le jeu est bien celui qu'on paie (${billetTexte} / ${billet})`);
    verif(peche.p12 >= 0.1 && peche.p12 <= 0.6, `concours de pêche : on peut le gagner, pas à tous les coups (${pc(peche.p12)} avec 12 prises)`);
    return { echecs };
  },
};
