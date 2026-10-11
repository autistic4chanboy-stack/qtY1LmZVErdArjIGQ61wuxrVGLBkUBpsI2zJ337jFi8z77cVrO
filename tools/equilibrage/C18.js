// Équilibrage — LE GRAND CERCLE (agent C18) : le casino de la ville, ses jeux, la suite Impériale.
//   node tools/equilibrage.js C18          (≈ 5 min : trois vallées générées)
//  - LES JEUX (les règles du jeu, C18_REGLES, rejouées ici) : chaque mise a une espérance négative mais honnête,
//    entre −2 % et −8 % de la mise — la roulette (calcul exact), le vingt-et-un (le meilleur jeu possible, calculé
//    exactement pour ces règles, puis vérifié en jouant 300 000 mains avec les fonctions du jeu), le baccara (calcul
//    exact, pour chaque mise permise : la cagnotte arrondit en faveur de la maison), le passe-dix (exact) et le bandit
//    manchot (exact) ;
//  - PAS D'ARGENT SANS FIN : un jeton s'achète et se rechange au même prix ; aucune mise n'est gagnante en moyenne ;
//    les limites de table existent ; la caisse ne vend pas plus d'un plafond par soirée ; la seule récompense (la
//    chevalière) se gagne une fois et n'est vendue nulle part ;
//  - LA SUITE : très chère au regard du commerce (la nuit : dix fois et plus la chambre de l'auberge, à peu près
//    une journée de travail des débuts ; l'achat : plusieurs fois la maison la plus chère de la ville, des jours de
//    travail de fin de partie) ;
//  - LA PLACE (graines 1234 et 77) : le Cercle est bâti ; rien de ce qui était là avant (blocs, objets posés,
//    interactions, portes) n'est dans son emprise ni sur son parvis ; la porte donne sur les rues (chemins) ; on entre
//    à chaque niveau (la vérification des bâtiments) ; les herbes déplacées ne tombent ni dans l'eau ni devant une
//    porte ; et sur la graine 1234, la vallée d'avant le Cercle est la même, objet pour objet (empreinte complète).
'use strict';
const { vallee, empreinte, EMPREINTE_1234, charger } = require('./vm.js');

// ---------------------------------------------------------------- le vingt-et-un : le meilleur jeu, calculé exactement (sabot sans fin)
// règles : le croupier tire jusqu'à 17 et sur 17 souple, sa seconde carte après le joueur (son vingt-et-un prend tout),
// le naturel du joueur paie 6 pour 5, doubler sur deux cartes, pas de séparation
function vingtEtUnExact() {
  const P = []; // probabilité de chaque valeur 1..10 (l'as vaut 1 ici)
  for (let v = 1; v <= 10; v++) P[v] = v === 10 ? 4 / 13 : 1 / 13;
  const ajoute = (t, s, v) => { let T = t + v, S = s || v === 1; return [T, S]; };
  const meilleur = (t, s) => (s && t + 10 <= 21 ? t + 10 : t);
  // la main du croupier, à partir de son unique carte visible : distribution de son total final (17..21, 22 = saute, 'N' = naturel)
  const memo = new Map();
  const croupier = (t, s, n) => {
    const k = t + ',' + s + ',' + n;
    if (memo.has(k)) return memo.get(k);
    const b = meilleur(t, s), out = {};
    if (n === 2 && b === 21) { out.N = 1; memo.set(k, out); return out; }
    if (b > 21) { out[22] = 1; memo.set(k, out); return out; }
    const tire = b < 17 || (b === 17 && s && t + 10 === 17);
    if (!tire) { out[b] = 1; memo.set(k, out); return out; }
    for (let v = 1; v <= 10; v++) { const [T, S] = ajoute(t, s, v), D = croupier(T, S, n + 1); for (const r in D) out[r] = (out[r] || 0) + P[v] * D[r]; }
    memo.set(k, out); return out;
  };
  const dist = []; for (let u = 1; u <= 10; u++) dist[u] = croupier(u, u === 1, 1);
  const rester = (t, D) => { let e = 0; for (const r in D) { const p = D[r]; if (r === 'N') e -= p; else if (+r === 22) e += p; else e += p * Math.sign(t - +r); } return e; };
  const memoJ = new Map();
  // meilleure espérance d'une main (total dur t, as compté souple s) contre la carte u, sans doubler
  const jouer = (t, s, u) => {
    const k = t + ',' + s + ',' + u;
    if (memoJ.has(k)) return memoJ.get(k);
    const b = meilleur(t, s);
    if (b > 21) { memoJ.set(k, -1); return -1; }
    const eR = rester(b, dist[u]);
    let eT = 0;
    for (let v = 1; v <= 10; v++) { const [T, S] = ajoute(t, s, v); eT += P[v] * (meilleur(T, S) > 21 ? -1 : jouer(T, S, u)); }
    const e = Math.max(eR, b >= 21 ? -9 : eT);
    memoJ.set(k, e); return e;
  };
  const doubler = (t, s, u) => { let e = 0; for (let v = 1; v <= 10; v++) { const [T, S] = ajoute(t, s, v), b = meilleur(T, S); e += P[v] * (b > 21 ? -2 : 2 * rester(b, dist[u])); } return e; };
  let E = 0, Enaif = 0;
  const politique = {};
  for (let u = 1; u <= 10; u++) for (let a = 1; a <= 10; a++) for (let c = 1; c <= 10; c++) {
    const p = P[u] * P[a] * P[c], t = a + c, s = a === 1 || c === 1, b = meilleur(t, s);
    let e, en;
    if (b === 21) { const pN = (dist[u].N || 0); e = en = (1 - pN) * 1.2; }
    else {
      const eR = rester(b, dist[u]), eD = doubler(t, s, u);
      let eT = 0; for (let v = 1; v <= 10; v++) { const [T, S] = ajoute(t, s, v); eT += P[v] * (meilleur(T, S) > 21 ? -1 : jouer(T, S, u)); }
      e = Math.max(eR, eT, eD);
      politique[[t, s, u].join(',')] = e === eD ? 'D' : e === eT ? 'T' : 'R';
      // le joueur naïf : il fait comme le croupier (tire jusqu'à 17), ne double jamais
      const naif = (tt, ss) => { const bb = meilleur(tt, ss); if (bb > 21) return -1; if (bb >= 17) return rester(bb, dist[u]); let q = 0; for (let v = 1; v <= 10; v++) { const [T, S] = ajoute(tt, ss, v); q += P[v] * naif(T, S); } return q; };
      en = naif(t, s);
    }
    E += p * e; Enaif += p * en;
  }
  // la politique, pour les mains de plus de deux cartes : tirer si jouer > rester
  const decide = (t, s, u, deux) => {
    const b = meilleur(t, s);
    if (b >= 21) return 'R';
    if (deux && politique[[t, s, u].join(',')]) return politique[[t, s, u].join(',')];
    let eT = 0; for (let v = 1; v <= 10; v++) { const [T, S] = ajoute(t, s, v); eT += P[v] * (meilleur(T, S) > 21 ? -1 : jouer(T, S, u)); }
    return eT > rester(b, dist[u]) ? 'T' : 'R';
  };
  return { E, Enaif, decide, pN: dist };
}

function mulberry(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

module.exports = {
  titre: 'Le Grand Cercle : les jeux, la caisse, la suite Impériale, la place du casino (C18)',
  async verifier(J, log) {
    let echecs = 0;
    const verif = (ok, msg) => { if (!ok) echecs++; log(`  ${ok ? 'ok ' : 'ÉCHEC'} ${msg}`); };
    const pc = (x) => (x * 100).toFixed(2) + ' %';
    const dans = (e) => e <= -0.02 && e >= -0.08;
    const R = J.ev('C18_REGLES'), MIN = J.ev('C18_MIN'), MAX = J.ev('C18_MAX'), ROUGES = J.ev('C18_ROUGES');
    void ROUGES;

    // ================================================================ la roulette (exact)
    log('La roulette (un zéro) :');
    const paris = R.rouletteParis();
    let pire = 0, meilleure = -1;
    for (const k of paris) { let e = 0; for (let n = 0; n <= 36; n++) e += R.rouletteRend(k, n) / 37; e -= 1; pire = Math.min(pire, e); meilleure = Math.max(meilleure, e); }
    log(`    ${paris.length} mises : espérance de ${pc(pire)} à ${pc(meilleure)}`);
    verif(dans(pire) && dans(meilleure), 'chaque mise de la roulette : entre −2 % et −8 %');

    // ================================================================ le vingt-et-un (exact, puis joué)
    log('Le vingt-et-un :');
    const VE = vingtEtUnExact();
    log(`    le meilleur jeu : ${pc(VE.E)} ; un joueur qui fait comme le croupier (tire jusqu'à 17, ne double jamais) : ${pc(VE.Enaif)}`);
    verif(dans(VE.E), 'contre le meilleur jeu, la maison garde entre 2 % et 8 %');
    verif(VE.Enaif < 0 && VE.Enaif > -0.12, `le joueur ordinaire perd un peu plus, sans être volé (${pc(VE.Enaif)})`);
    {
      const rnd = mulberry(1818), N = 300000;
      let gain = 0, mise = 0;
      for (let i = 0; i < N; i++) {
        const j = [R.carte(rnd), R.carte(rnd)], c = [R.carte(rnd)];
        const u = Math.min(10, c[0].r);
        let m = 10, deux = true;
        if (!R.naturel21(j)) {
          for (;;) {
            const T = j.reduce((s, k) => s + Math.min(10, k.r), 0), S = j.some((k) => k.r === 1);
            const d = VE.decide(T, S, u, deux);
            if (d === 'R') break;
            j.push(R.carte(rnd));
            if (d === 'D') { m = 20; break; }
            deux = false;
            if (R.total21(j).t >= 21) break;
          }
        }
        const tj = R.total21(j).t, nj = R.naturel21(j);
        while (c.length < 2 || (tj <= 21 && !nj && R.doitTirer21(c))) c.push(R.carte(rnd));
        gain += R.rend21(j, c, m) - m; mise += 10;
      }
      const e = gain / mise;
      log(`    300 000 mains jouées avec les fonctions du jeu (la même stratégie) : ${pc(e)}`);
      verif(Math.abs(e - VE.E) < 0.012, 'le jeu joué donne ce que dit le calcul (à 1,2 point près)');
    }

    // ================================================================ le baccara (exact, chaque mise permise)
    log('Le baccara (punto banco) :');
    {
      // les valeurs 0..9 (le 0 : dix, valets, dames, rois) ; on rejoue le tableau du jeu
      const W = [4 / 13, 1 / 13, 1 / 13, 1 / 13, 1 / 13, 1 / 13, 1 / 13, 1 / 13, 1 / 13, 1 / 13], K = (v) => ({ r: v === 0 ? 10 : v, c: 0 });
      let pP = 0, pB = 0, pT = 0;
      for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) for (let c = 0; c < 10; c++) for (let d = 0; d < 10; d++) {
        const p0 = W[a] * W[b] * W[c] * W[d], P0 = [K(a), K(c)], B0 = [K(b), K(d)], tp0 = R.tb(P0), tb0 = R.tb(B0);
        if (tp0 >= 8 || tb0 >= 8) { if (tp0 > tb0) pP += p0; else if (tb0 > tp0) pB += p0; else pT += p0; continue; }
        for (let e = 0; e < 10; e++) {
          const pe = tp0 <= 5 ? W[e] : (e === 0 ? 1 : 0);
          if (!pe) continue;
          const Pm = tp0 <= 5 ? [...P0, K(e)] : P0, p3 = tp0 <= 5 ? e : null, tp = R.tb(Pm);
          const tire = R.banqueTire(tb0, p3);
          for (let f = 0; f < 10; f++) {
            const pf = tire ? W[f] : (f === 0 ? 1 : 0);
            if (!pf) continue;
            const tb = tire ? R.tb([...B0, K(f)]) : tb0, p = p0 * pe * pf;
            if (tp > tb) pP += p; else if (tb > tp) pB += p; else pT += p;
          }
        }
      }
      log(`    punto ${pc(pP)}, banque ${pc(pB)}, égalité ${pc(pT)} (somme ${pc(pP + pB + pT)})`);
      verif(Math.abs(pP - 0.4462) < 0.001 && Math.abs(pB - 0.4586) < 0.001 && Math.abs(pT - 0.0952) < 0.001, 'le tableau du jeu donne les probabilités connues du punto banco');
      const ev = (cote, m) => (pP * R.rendBaccara(cote, m, 5, 3) + pB * R.rendBaccara(cote, m, 3, 5) + pT * R.rendBaccara(cote, m, 4, 4)) / m - 1;
      const E = { punto: [], banco: [], egalite: [] };
      for (let m = MIN.baccara; m <= MAX.baccara; m += 5) for (const k in E) E[k].push(ev(k, m));
      for (const k in E) log(`    ${k} : de ${pc(Math.min(...E[k]))} à ${pc(Math.max(...E[k]))} selon la mise (${MIN.baccara} à ${MAX.baccara})`);
      verif(Object.values(E).every((L) => L.every(dans)), 'chaque mise du baccara, à chaque montant : entre −2 % et −8 %');
    }

    // ================================================================ le passe-dix (exact)
    log('Le passe-dix (trois dés, à la banque) :');
    {
      const pr = ['passe', 'manque', 'brelan', 'point:1', 'point:2', 'point:3', 'point:4', 'point:5', 'point:6'], E = {};
      for (const k of pr) { let s = 0; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) for (let c = 1; c <= 6; c++) s += R.rendDes(k, 10, [a, b, c]); E[k] = s / 216 / 10 - 1; }
      log('    ' + Object.entries(E).map(([k, e]) => `${k} ${pc(e)}`).join(', '));
      verif(Object.values(E).every(dans), 'chaque mise du passe-dix : entre −2 % et −8 %');
    }

    // ================================================================ le bandit manchot (exact)
    log('Le bandit manchot :');
    {
      const RO = J.ev('C18_ROULEAUX');
      let s = 0, n = 0, gros = 0;
      for (const a of RO[0]) for (const b of RO[1]) for (const c of RO[2]) { const g = R.gainBandit(a, b, c); s += g; n++; if (g >= 20) gros++; }
      const e = s / n - 1;
      log(`    il rend ${pc(s / n)} de ce qu'on y met (${n} combinaisons ; un gros lot, vingt fois la mise ou plus, une fois sur ${Math.round(n / gros)})`);
      verif(dans(e), 'le bandit manchot : entre −2 % et −8 %');
    }

    // ================================================================ pas d'argent sans fin
    log('L’argent :');
    {
      const D = JSON.parse(J.ev(`JSON.stringify({ min: C18_MIN, max: C18_MAX, plafond: C18_PLAFOND_NUIT, jetons: C18_JETONS, entree: C18_ENTREE, carte: C18_CARTE, suite: C18_SUITE,
        chev: ITEMS.c18_chevaliere && ITEMS.c18_chevaliere.price, items: Object.keys(ITEMS).filter((k) => k.startsWith('c18_')).map((k) => [k, ITEMS[k].price || 0, ITEMS[k].buy || 0]),
        vendu: (() => { const L = []; for (const d of NPC_DATA) for (const e of ((d.shop && d.shop.sells) || [])) if (String(e[0]).startsWith('c18_')) L.push(d.id + ':' + e[0]); return L; })(),
        loyers: Object.keys(LOC_MAISONS).map((k) => LOC_MAISONS[k].loyer * MEU_SEMAINES), boissons: C18_BOISSONS.map((b) => b.prix) })`));
      for (const k of ['roulette', 'vingt', 'baccara', 'des']) verif(D.min[k] > 0 && D.max[k] >= D.min[k] && D.max[k] <= 200, `${k} : mises de ${D.min[k]} à ${D.max[k]}`);
      verif(D.min.bandit === 5, 'le bandit prend un jeton de cinq');
      verif(D.plafond > 0 && D.plafond <= 2000, `la caisse vend au plus ${D.plafond} jetons par soirée`);
      verif(D.vendu.length === 0 && D.items.every(([k, p, b]) => !b), 'aucun objet du Cercle ne s’achète dans une boutique');
      verif(D.chev > 0 && D.chev <= 200, `la chevalière du baron (une fois, au bout de la quête) vaut ${D.chev} pièces`);
      // un jeton s'achète et se rechange au même prix : on rejoue la caisse (les fonctions du jeu, une partie simulée)
      const r = JSON.parse(J.ev(`(() => {
        const s = { money: 1000, stats: { earned: 0 }, casino: null, day: 3 }, f0 = farm.s; farm.s = s;
        const h0 = npcs.hour; npcs.hour = () => 21;
        try {
          c18Jeux.caisse = () => {}; ui.close = () => {}; ui.subtitle = () => {}; c18.dire = () => {};
          c18Jeux.acheterJetons(500); const j = c18.S().jetons, m1 = s.money;
          c18Jeux.changer(); const m2 = s.money, j2 = c18.S().jetons;
          s.money = 5000; for (let k = 0; k < 10; k++) c18Jeux.acheterJetons(500);
          return JSON.stringify({ j, m1, m2, j2, achete: c18.S().jetons, money: s.money });
        } finally { farm.s = f0; npcs.hour = h0; }
      })()`));
      log(`    acheter 500 jetons : ${r.m1} pièces et ${r.j} jetons ; les rechanger : ${r.m2} pièces ; puis, avec 5 000 pièces, dix achats de 500 dans la soirée : ${r.achete} jetons en tout (il reste ${r.money} pièces)`);
      verif(r.j === 500 && r.m1 === 500 && r.m2 === 1000 && r.j2 === 0, 'un jeton s’achète et se rechange au même prix');
      verif(r.achete <= D.plafond, 'le plafond de la soirée tient');
      // la suite, au regard du commerce
      const maison = Math.max(...D.loyers);
      log(`    la suite : ${D.suite.nuit} la nuit (la chambre de l'auberge : 20 ; une journée de travail : 300 à 450 au début, 1 000 à 2 000 au milieu), ${D.suite.achat} à l'achat (la maison la plus chère de la ville : ${maison} ; 3 000 à 5 000 par jour en fin de partie)`);
      verif(D.suite.nuit >= 10 * 20 && D.suite.nuit <= 600, 'la nuit dans la suite : au moins dix fois l’auberge, pas plus d’une grosse journée des débuts');
      verif(D.suite.achat >= 5 * maison && D.suite.achat >= 5 * 5000 && D.suite.achat <= 60000, 'l’achat de la suite : plus de cinq fois la maison la plus chère, plusieurs jours de fin de partie');
      verif(D.entree > 0 && D.entree <= 20 && D.carte >= 10 * D.entree, `le droit de cercle (${D.entree}) et la carte de membre (${D.carte})`);
      verif(D.boissons.every((p) => p > 0), 'les boissons du bar se paient');
    }

    // ================================================================ la place du Cercle (graines 1234 et 77)
    for (const g of [1234, 77]) {
      const t0 = Date.now();
      const Jg = g === 1234 ? J : charger();
      const w = await vallee(Jg, g);
      log(`La place du Cercle, graine ${g} (${((Date.now() - t0) / 1000).toFixed(0)} s) :`);
      const C = w.c18, B = w.bld && w.bld.casino;
      verif(!!(C && B), 'le Grand Cercle est bâti dans la ville');
      if (!C || !B) continue;
      const World = Jg.ev('World'), f = C.f, HX = C.W / 2, HZ = C.D / 2;
      const T = w.townInfo;
      log(`    au sud-est de la place (${(f.x - T.x).toFixed(1)}, ${(f.z - T.z).toFixed(1)} m), façade à l'ouest sur la grand-rue ; ${w.blocks.length - C.blocs0} blocs, ${w.props.length - C.props0} objets posés, ${w.inter.length - C.inter0} interactions, ${w.doors.length - C.portes0} portes ; ${C.deplaces.length} herbes replantées dehors, ${C.arraches.length} arrachées`);
      const loc = (x, z) => World.blockLocal({ x: f.x, z: f.z, r: f.r }, x, z);
      const emprise = (x, z, m) => { const [lx, lz] = loc(x, z); return (Math.abs(lx) < HX + m && Math.abs(lz) < HZ + m) || (Math.abs(lx) < 2.4 + m && lz < -HZ && lz > -HZ - 1.8 - m); };
      const avant = [];
      for (let i = 0; i < C.blocs0; i++) {
        const b = w.blocks[i];
        if (b.under || b.y > f.y + 6 || b.y + b.sy < f.y - 0.2 || Math.hypot(b.x - f.x, b.z - f.z) > 30) continue;
        const c = Math.cos(b.r), s = Math.sin(b.r);
        for (let u = -b.sx / 2; u <= b.sx / 2 + 1e-6; u += Math.max(0.1, Math.min(0.4, b.sx / 2))) for (let v = -b.sz / 2; v <= b.sz / 2 + 1e-6; v += Math.max(0.1, Math.min(0.4, b.sz / 2))) if (emprise(b.x + u * c + v * s, b.z - u * s + v * c, 0.1)) { avant.push('bloc ' + i); u = 1e9; break; }
      }
      for (let i = 0; i < C.props0; i++) { const p = w.props[i]; if (Math.abs(p.y - f.y) < 4 && emprise(p.x, p.z, 0.3)) avant.push('objet posé ' + i + ' ' + p.id); }
      for (let i = 0; i < C.inter0; i++) { const it = w.inter[i]; if (Math.abs(it.y - f.y) < 4 && emprise(it.x, it.z, 0.3)) avant.push('interaction ' + i + ' ' + it.kind); }
      for (let i = 0; i < C.portes0; i++) { const d = w.doors[i]; if (Math.abs(d.y - f.y) < 4 && emprise(d.x, d.z, 0.8)) avant.push('porte ' + i); }
      let vivants = 0; for (let i = 0; i < C.objets0; i++) { const o = w.objects[i]; if (!o.gone && emprise(o.x, o.z, 0.2)) vivants++; }
      verif(!avant.length, 'rien de ce qui était là avant n’est dans l’emprise ni sur le parvis' + (avant.length ? ' — ' + avant.slice(0, 8).join(', ') : ''));
      verif(!vivants, 'plus une herbe, plus un objet sous le plancher (' + vivants + ')');
      // les herbes replantées : ni dans l'eau, ni devant une porte ou une interaction
      const mal = C.deplaces.filter((i) => { const o = w.objects[i]; return w.heightAt(o.x, o.z) < w.waterLevel || w.inter.some((it) => Math.abs(it.x - o.x) < 1.2 && Math.abs(it.z - o.z) < 1.2) || w.doors.some((d) => Math.abs(d.x - o.x) < 1.2 && Math.abs(d.z - o.z) < 1.2); });
      verif(!mal.length, `les herbes replantées ont une bonne place (${C.deplaces.length})`);
      // la porte donne sur les rues : du nœud de la porte, on rejoint la place par les chemins
      const N = w.nav, start = N.nodes.findIndex((n) => n.tag === 'place'), seen = new Set([start]), q = [start];
      while (q.length) { const c = q.shift(); for (const e of N.adj[c]) if (!seen.has(e.to)) { seen.add(e.to); q.push(e.to); } }
      verif(seen.has(B.nOut) && seen.has(B.nMid), 'de la place, les chemins mènent à la porte du Cercle, et dedans');
      verif(!N.nodes.some((n, i) => !n.iso && !/^casino:/.test(n.tag) && (() => { const [lx, lz] = loc(n.x, n.z); return Math.abs(lx) < HX && Math.abs(lz) < HZ; })()), 'aucun nœud de rue vivant dans le bâtiment');
      // on entre à chaque niveau (la vérification des bâtiments)
      const { examiner } = require('./batiments.js');
      const toits = examiner(Jg, w).filter((Tt) => Math.hypot(Tt.R.x - f.x, Tt.R.z - f.z) < 2.5);
      const niv = toits.length ? toits[0].niveaux : [];
      log(`    niveaux : ${niv.map((n) => `${(n.plancher - f.y).toFixed(1)} m ${n.etat}${n.par ? ' (' + n.par + ')' : ''}`).join(', ')}`);
      verif(niv.length === 2 && niv.every((n) => n.etat === 'ouvert' || n.etat === 'échelle'), 'la grande salle et l’étage de la suite ont chacun leur accès');
      // la grande porte : dégagée devant et derrière
      const libre = (lx, lz) => { Jg.ctx.__w = w; const [x, z] = Jg.avec({ f, lx, lz }, 'b1W(__v.f, __v.lx, __v.lz)'); return Jg.avec({ x, z }, 'pointFree(__w, __v.x, __v.z, 0.35)'); };
      verif([[0, -HZ - 2.2], [0, -HZ - 1.2], [0, -HZ + 1.2], [0, -HZ + 2.4]].every(([a, b]) => libre(a, b)), 'devant et derrière la grande porte, la place est libre');
      if (g === 1234) {
        verif(empreinte(w, [98896, 1308, 516]) === EMPREINTE_1234, `les objets d'avant la grande mise à jour ne bougent pas (${empreinte(w, [98896, 1308, 516])})`);
        // la vallée d'avant le Cercle, objet pour objet : une vallée générée sans la passe du Cercle
        const J0 = charger();
        J0.ev('c18Generer = function () {};');
        const w0 = await vallee(J0, g);
        const n0 = [w0.objects.length, w0.props.length, w0.inter.length];
        verif(n0[0] === C.objets0 && n0[1] === C.props0 && n0[2] === C.inter0, `le Cercle ne fait qu’ajouter au bout des listes (${n0.join(' / ')})`);
        // (les herbes replantées ont changé de place : on compare la vallée en remettant les leurs)
        const dep = new Set(C.deplaces);
        const objets = w.objects.map((o, i) => (dep.has(i) ? w0.objects[i] : o));
        const e0 = empreinte(w0), e1 = empreinte({ objects: objets, props: w.props, inter: w.inter }, n0);
        verif(e0 === e1, `le reste de la vallée est le même, objet pour objet (${e0})`);
      }
    }
    return { echecs };
  },
};

if (require.main === module) {
  module.exports.verifier(charger(), (...a) => console.log(...a)).then((r) => { console.log(r.echecs ? `${r.echecs} échec(s)` : 'ok'); process.exit(r.echecs ? 1 : 0); });
}
