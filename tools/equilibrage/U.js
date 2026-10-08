// Équilibrage — U : la compétence de crochetage et le cambriolage de nuit (agent U, vague 14).
//   node tools/equilibrage.js U
// Mesure, avec les tables et le modèle du jeu (05-zzzzzU-crochetage.js : U_PALIERS, U_SERRURES, U_BRUITS, U_REVEIL,
// U_MODELE) : la main à chaque palier (la goupille, la casse, ce qu'il faut de serrures pour monter), le cambriolage
// d'une maison la nuit (Monte-Carlo : la chance de réveiller quelqu'un selon la façon de faire, l'heure, la main, le
// temps passé), ce qu'il rapporte et ce qu'il coûte quand on est pris — en jours de revenus honnêtes (l'échelle de
// tools/equilibrage/risques.js). Exporte aussi `outils(J)` : « risques » y lit la maison la nuit simulée (sa ligne « une
// maison la nuit » remplace l'ancienne règle « le dormeur se réveille une fois sur cinq »).
'use strict';

const ECHELLE = { debut: 300, milieu: 1200, tard: 3000, debitDebut: 0.4 };
const r0 = (v) => Math.round(v);
const r1 = (v) => Math.round(v * 10) / 10;
const pc = (v) => (Math.round(v * 1000) / 10).toFixed(1) + ' %';
const pad = (s, n) => String(s).padEnd(n);
const lpad = (s, n) => String(s).padStart(n);
function mulberry(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const erf = (x) => { const t = 1 / (1 + 0.3275911 * Math.abs(x)), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; };

// ---------------------------------------------------------------- les outils de mesure (le domaine ci-dessous, et risques.js)
function outils(J) {
  const P = J.ev('U_PALIERS'), SER = J.ev('U_SERRURES'), B = J.ev('U_BRUITS'), RV = J.ev('U_REVEIL'), M = J.ev('U_MODELE'), G = J.ev('U_GAINS'), FINS = J.ev('U_FINS'), RET = J.ev('U_RETOMBE');
  const CP = J.ev('CROC_PINS'), CZ = J.ev('CROC_ZONE'), CV = J.ev('CROC_VIT'), CC = J.ev('CROC_CASSE'), ITEMS = J.ev('ITEMS'), LOOT = J.ev('LOOT');
  const serrure = (d) => (d <= 5 ? { pins: CP[d - 1], zone: CZ[d - 1], vit: CV[d - 1], casse: CC[d - 1], retombe: RET[d - 1] } : { pins: SER[d].pins, zone: SER[d].zone, vit: SER[d].vit, casse: SER[d].casse, retombe: SER[d].retombe });
  // une nuit de cambriolage (Monte-Carlo, le modèle du jeu). La maison : la porte à 6 m du lit (de l'autre côté du mur),
  // quelques meubles à 2-5 m du dormeur ; on crochète la porte (une serrure ordinaire : ratés selon la main), on entre, on
  // traverse, on fouille, on ressort.
  const fouilleF = B.fouille;
  const scenario = (o) => {
    const rnd = mulberry(o.graine || 1234);
    const L = o.L || 0, p = P[L], N = o.N || 4000, h = o.h ?? 2, sens = o.sens ?? 1, heure = M.heure(h, o.coucher ?? 20.6, o.lever ?? 6);
    const sigma = 55, Sd = serrure(o.serrure || 2), zone = Sd.zone * p.zone, vit = Sd.vit * p.vit, q = erf(zone / (2 * vit) * 1000 / (sigma * Math.SQRT2));
    let reveils = 0, remues = 0, chutes = 0;
    for (let k = 0; k < N; k++) {
      let t = 0, agit = 0, remue = -1, dort = true;
      const bruit = (f0, dist, mur, dt) => {
        if (!dort) return;
        const d0 = dt || 0.5;
        t += d0;
        agit = Math.max(0, agit - RV.calme * d0);
        // le sommeil s'use, même sans bruit, quand on s'attarde
        if (o.dedans && rnd() < 1 - Math.exp(-M.presence(t - o.dedans0, sens, heure) * d0)) { dort = false; return; }
        const f = M.force(f0, dist, mur, false);
        const c = M.chances({ f, sens, heure, traine: o.dedans ? M.traine(t - o.dedans0) : 1, agit, remue: t < remue, garde: !!o.garde });
        agit = Math.min(1, agit + f * RV.agit);
        const r = rnd();
        if (r < c.reveil) { dort = false; return; }
        if (r < c.remue) { remue = t + 5.5; remues++; }
      };
      o.dedans = false; o.dedans0 = 0;
      // la porte (dehors, de l'autre côté du mur)
      let cales = 0;
      for (let g = 0; g < 60 && cales < Sd.pins; g++) { if (rnd() < q) { cales++; bruit(B.goupille * p.bruit, 6, true, 0.6); } else bruit(B.rate * p.bruit, 6, true, 0.8); }
      bruit(B.ouvre * p.bruit, 6, true, 0.3);
      bruit(B.porte * (0.6 + 0.4 * p.bruit) * (o.mode === 'accroupi' ? 0.8 : 1), 6, false, 1);
      o.dedans = true; o.dedans0 = t;
      // les pas jusqu'aux meubles, et entre eux ; les lattes
      const pas = (n, dist) => {
        const pasL = o.mode === 'court' ? 1.3 : o.mode === 'accroupi' ? 0.7 : 0.95, v = o.mode === 'court' ? 8 : o.mode === 'accroupi' ? 2.1 : 4.4;
        for (let i = 0; i < n; i++) {
          bruit(M.pas(o.mode, L, o.chaussons), dist, false, pasL / v);
          if (rnd() < M.grince(o.mode, L, o.chaussons)) bruit(B.grince, dist, false, 0.05);
        }
      };
      const nPas = (m) => Math.round(m / (o.mode === 'court' ? 1.3 : o.mode === 'accroupi' ? 0.7 : 0.95));
      pas(nPas(4), 4);
      for (let f = 0; f < (o.fouilles || 2); f++) {
        const dist = [2.5, 3.5, 4.5][f % 3], son = (o.sons || ['bois', 'bois', 'vaisselle'])[f % 3];
        bruit((fouilleF[son] ?? 0.2) * p.bruit * (o.mode === 'accroupi' ? 0.85 : 1), dist, false, 1.4);
        if (rnd() < p.maladresse) { chutes++; bruit(B.chute, dist, false, 0.5); }
        // le menu du butin : prendre trois choses, une à une (le temps de choisir)
        for (let i = 0; i < 3; i++) bruit(B.prendre * p.bruit, dist, false, (o.lent || 3) / 3);
        pas(nPas(2.5), dist);
      }
      if (o.poche) bruit(B.poche, 0.6, false, 2);
      o.dedans = true;
      pas(nPas(5), 4);
      bruit(B.claque * (0.6 + 0.4 * p.bruit), 6, false, 0.8);
      if (!dort) reveils++;
    }
    return { reveil: reveils / N, remue: remues / N, chutes: chutes / N };
  };
  // le butin
  const val = (id) => (id === 'argent' ? 1 : (ITEMS[id] && ITEMS[id].price) || 0);
  const esp = (key) => { const T0 = LOOT[key]; if (!T0) return 0; const it = T0.items.filter((e) => e[3] > 0), W = it.reduce((a, e) => a + e[3], 0) || 1, nr = (T0.rolls[0] + T0.rolls[1]) / 2; return it.reduce((a, e) => a + nr * e[3] / W * (e[1] + e[2]) / 2 * val(e[0]), 0); };
  const tables = ['f2_armoire', 'f2_commode', 'f2_buffet', 'f2_malle', 'bu_tiroir', 'bu_etagere'], parFouille = tables.map(esp).reduce((a, v) => a + v, 0) / tables.length;
  const df = esp('u_double_fond'), dfR = esp('u_double_fond_riche');
  // la maison entière : quatre meubles, les poches du dormeur ; les doubles fonds à partir d'« une main sûre » (deux meubles
  // sur cinq en ont un, senti une fois sur deux environ)
  const pocheButin = 40, poche = (L) => Math.min(0.92, 0.28 + 0.36 + 0.06 + 0.1 + P[L].poche);
  const nuit = (L) => 4 * parFouille + poche(L) * pocheButin + (L >= 2 ? 4 * 0.4 * 0.5 * 0.5 * df : 0);
  // pris : effraction et vol (deux primes, avec la récidive), l'amitié de la victime (−150 : trois cadeaux, comme « risques »)
  const CD = J.ev('CRIME_DEF');
  const amende = Math.round((CD.effraction.prime + CD.vol.prime) * 1.25 / 5) * 5, amitie = 120;
  // réveillé, il vous voit trois fois sur cinq ; il vous reconnaît une fois sur deux (sans lanterne) ; sinon le garde de nuit, une fois sur trois
  const pVu = 0.6, pReco = 0.5, pFlag = 0.33, pPris = (r) => r * pVu * (pReco + (1 - pReco) * pFlag);
  const DUREE = 180; // secondes réelles : aller à la maison, crocheter, fouiller, ressortir
  // une maison entière la nuit, à 2 h (o : { L, mode, chaussons, graine… }) → { reveil, gain, pp (pris), ev (risque compté), duree }
  const maison = (o) => {
    const q = scenario(Object.assign({ h: 2, fouilles: 4, poche: true, graine: 1234 }, o)), gain = nuit(o.L || 0), pp = pPris(q.reveil);
    return { reveil: q.reveil, gain, pp, ev: gain - pp * (amende + amitie), duree: DUREE };
  };
  return { P, SER, B, RV, M, G, FINS, RET, CP, CZ, CV, CC, ITEMS, LOOT, serrure, scenario, esp, tables, parFouille, df, dfR, poche, nuit, CD, amende, amitie, pPris, DUREE, maison };
}

module.exports = {
  titre: 'U : la compétence de crochetage et le cambriolage de nuit',
  outils,
  async verifier(J, log) {
    let echecs = 0;
    const verif = (ok, msg) => { if (!ok) echecs++; log(`  ${ok ? 'ok ' : 'ÉCHEC'} ${msg}`); };
    const { P, SER, B, M, G, FINS, CP, ITEMS, serrure, scenario, tables, parFouille, df, dfR, nuit, amende, amitie, pPris, DUREE } = outils(J);
    const E = ECHELLE;

    // ============================================================ 1. les paliers
    log('\n--- Les paliers de la main');
    log(`${pad('palier', 34)}${lpad('points', 7)}${lpad('ligne', 7)}${lpad('vitesse', 8)}${lpad('casse', 7)}${lpad('bruit', 7)}${lpad('pas', 6)}${lpad('maladr.', 9)}`);
    P.forEach((p, i) => log(`${pad(i + ' ' + p.nom, 34)}${lpad(p.pts, 7)}${lpad('×' + p.zone, 7)}${lpad('×' + p.vit, 8)}${lpad('×' + p.casse, 7)}${lpad('×' + p.bruit, 7)}${lpad('×' + p.pas, 6)}${lpad(pc(p.maladresse), 9)}`));
    const mono = (k, sens) => P.every((p, i) => !i || (sens > 0 ? p[k] > P[i - 1][k] : p[k] < P[i - 1][k]));
    verif(mono('pts', 1) && mono('zone', 1) && mono('vit', -1) && mono('casse', -1) && mono('retombe', -1) && mono('bruit', -1) && mono('pas', -1) && mono('maladresse', -1), 'chaque palier rend la main meilleure en tout (ligne, vitesse, casse, retombée, bruit, pas, maladresse)');
    verif(['zone', 'vit', 'casse', 'retombe', 'bruit', 'pas', 'grince'].every((k) => P[0][k] === 1) && P[0].pts === 0, 'au palier 0, le petit jeu est celui d’avant (les mesures de « risques » restent justes)');
    verif(G.exerciceMax === P[2].pts, `le vieux cadenas apprend jusqu’à « ${P[2].nom} » et pas au-delà (${G.exerciceMax} points)`);

    // ============================================================ 2. le petit jeu, à chaque palier
    // (comme risques.js : un joueur vise le passage de la goupille sur la ligne avec une erreur de temps σ ; la goupille court à 2·v par seconde)
    const jeu = (d, L, fins, sigma) => {
      const S = serrure(d), p = P[L], zone = S.zone * p.zone * (fins ? FINS.zone : 1), vit = S.vit * p.vit;
      const fen = zone / (2 * vit) * 1000, q = erf(fen / (sigma * Math.SQRT2));
      const casse = S.casse * p.casse * (fins ? FINS.casse : 1), ret = (d >= 3 ? S.retombe : 0) * p.retombe;
      const rnd = mulberry(d * 131 + L * 17 + sigma + (fins ? 7 : 0));
      let ouverts = 0, rates = 0, casses = 0;
      const N = 3000;
      for (let k = 0; k < N; k++) {
        let pos = 0, e = 0;
        while (pos < S.pins && e < 200) { e++; if (rnd() < q) pos++; else { rates++; if (rnd() < casse) casses++; if (pos > 0 && rnd() < ret) pos--; } }
        if (pos >= S.pins) ouverts++;
      }
      return { fen, q, rates: rates / N, casses: casses / N, ouvre: ouverts / N };
    };
    log('\n--- Le petit jeu : réussite par goupille pour σ 50 ms (ratés et crochets cassés par serrure), selon la main');
    log(`${pad('serrure', 10)}` + P.map((p, i) => lpad('palier ' + i, 16)).join(''));
    const T = {};
    for (let d = 1; d <= 7; d++) {
      T[d] = P.map((p, L) => jeu(d, L, d >= 6, 50));
      log(`${pad(d + (d >= 6 ? ' (fins)' : ''), 10)}` + T[d].map((q) => lpad(`${pc(q.q)} ${r1(q.rates)}/${r1(q.casses)}`, 16)).join(''));
    }
    // (la casse est tirée au sort : on tolère le bruit de la mesure, un centième de crochet)
    verif([1, 2, 3, 4, 5, 6, 7].every((d) => T[d].every((q, L) => !L || q.q > T[d][L - 1].q || q.q >= 0.999) && T[d].every((q, L) => !L || q.casses <= T[d][L - 1].casses + 0.01)), 'à chaque serrure, chaque palier cale mieux et casse moins (jusqu’à ne plus rater du tout)');
    verif(T[5][0].q <= 0.6 && T[5][5].q >= 0.8, `la serrure de maître : rebelle aux doigts gourds (${pc(T[5][0].q)}), docile à une main de velours (${pc(T[5][5].q)})`);
    const q6 = T[6][SER[6].palier].q, q7 = T[7][SER[7].palier].q;
    verif(q6 >= 0.45 && q6 <= 0.85, `la serrure à secret, au palier où on peut la tenter (${SER[6].palier}, crochets fins) : dure mais faisable (${pc(q6)} par goupille)`);
    verif(q7 >= 0.4 && q7 <= 0.82, `la serrure de coffre, au palier ${SER[7].palier} avec des crochets fins : dure mais faisable (${pc(q7)} par goupille)`);
    const tenable = (d, L, fins) => J.avec({ d, L, fins }, 'U_MODELE.tenable(__v.d, __v.L, __v.fins)');
    verif(tenable(6, 2, true) && !tenable(6, 3, true) && tenable(6, 3, false) && !tenable(6, 4, false) && tenable(7, 5, false) === 'fins' && !tenable(7, 4, true) && tenable(7, 3, true), 'qui peut tenter quoi : le secret (palier 3 et crochets fins, ou palier 4), le coffre (palier 4 et crochets fins)');

    // ============================================================ 3. monter en main
    const parSerrure = (d, pins) => G.goupille * d * pins + G.ouverte * d;
    log('\n--- Ce qu’il faut pour monter (serrures ouvertes, sans compter les échecs ni les lectures)');
    const ord = parSerrure(2, CP[1]), bonne = parSerrure(3, CP[2]), solide = parSerrure(4, CP[3]);
    log(`  une porte ordinaire (2) : ${r1(ord)} points ; une bonne serrure (3) : ${r1(bonne)} ; une serrure solide (4) : ${r1(solide)} ; un cambriolage mené sans être vu : +${G.nuit}`);
    for (let i = 1; i < P.length; i++) log(`  « ${P[i].nom} » (${P[i].pts} points) : ${Math.ceil(P[i].pts / ord)} portes ordinaires, ou ${Math.ceil(P[i].pts / bonne)} bonnes serrures, ou ${Math.ceil(P[i].pts / solide)} serrures solides`);
    verif(P[1].pts / ord >= 3 && P[1].pts / ord <= 8, `le premier palier vient vite (${r1(P[1].pts / ord)} portes ordinaires)`);
    verif(P[5].pts / bonne >= 40, `le dernier se mérite (${r1(P[5].pts / bonne)} bonnes serrures)`);

    // ============================================================ 4. une nuit de cambriolage (Monte-Carlo, le modèle du jeu : outils.scenario)
    const SC = {
      'novice, accroupi, 2 h': { L: 0, mode: 'accroupi', h: 2 },
      'novice, debout, 2 h': { L: 0, mode: 'marche', h: 2 },
      'novice, en courant, 2 h': { L: 0, mode: 'court', h: 2 },
      'novice, accroupi, 21 h': { L: 0, mode: 'accroupi', h: 21 },
      'novice, accroupi, 5 h 30': { L: 0, mode: 'accroupi', h: 5.5 },
      'novice, accroupi, 4 fouilles': { L: 0, mode: 'accroupi', h: 2, fouilles: 4 },
      'novice, accroupi, s’attarde': { L: 0, mode: 'accroupi', h: 2, lent: 15 },
      'novice, sommeil léger': { L: 0, mode: 'accroupi', h: 2, sens: 1.35 * 1.25 },
      'novice, maison sur ses gardes': { L: 0, mode: 'accroupi', h: 2, garde: true },
      'main sûre, accroupi': { L: 2, mode: 'accroupi', h: 2 },
      'main de velours, accroupi': { L: 5, mode: 'accroupi', h: 2 },
      'main de velours, chaussons': { L: 5, mode: 'accroupi', h: 2, chaussons: true },
      'novice, debout, chaussons': { L: 0, mode: 'marche', h: 2, chaussons: true },
    };
    log('\n--- Une maison la nuit (porte crochetée, deux fouilles, trois choses prises à chacune, on ressort) : la chance de réveiller le dormeur');
    const R = {};
    for (const k in SC) { R[k] = scenario(Object.assign({ graine: k.length * 977 }, SC[k])); log(`  ${pad(k, 34)} réveil ${lpad(pc(R[k].reveil), 7)}   remue ${lpad(r1(R[k].remue), 4)} fois   objet tombé ${pc(R[k].chutes / (SC[k].fouilles || 2))} par fouille`); }
    const base = R['novice, accroupi, 2 h'].reveil;
    verif(base >= 0.05 && base <= 0.3, `le risque est réel mais petit pour qui fait attention (${pc(base)} : novice, accroupi, au plein de la nuit)`);
    verif(R['novice, debout, 2 h'].reveil >= 1.4 * base, `marcher debout réveille plus (${pc(R['novice, debout, 2 h'].reveil)})`);
    verif(R['novice, en courant, 2 h'].reveil >= 2 * R['novice, debout, 2 h'].reveil, `courir dans une maison réveille bien plus (${pc(R['novice, en courant, 2 h'].reveil)})`);
    verif(R['novice, accroupi, 21 h'].reveil >= 1.5 * base && R['novice, accroupi, 5 h 30'].reveil >= 1.5 * base, `l’heure compte : on dort mal en se couchant (${pc(R['novice, accroupi, 21 h'].reveil)}) et au petit matin (${pc(R['novice, accroupi, 5 h 30'].reveil)})`);
    verif(R['novice, accroupi, s’attarde'].reveil >= 1.3 * base, `s’attarder use le sommeil des autres (${pc(R['novice, accroupi, s’attarde'].reveil)})`);
    verif(R['novice, sommeil léger'].reveil >= 1.3 * base && R['novice, maison sur ses gardes'].reveil >= 1.25 * base, `les dormeurs légers, les maisons sur leurs gardes (${pc(R['novice, sommeil léger'].reveil)}, ${pc(R['novice, maison sur ses gardes'].reveil)})`);
    verif(R['main de velours, accroupi'].reveil <= 0.5 * base && R['main de velours, accroupi'].reveil >= 0.01, `la compétence rend le cambriolage plus silencieux (${pc(R['main de velours, accroupi'].reveil)} au dernier palier), sans le rendre sûr`);
    verif(R['novice, debout, chaussons'].reveil < R['novice, debout, 2 h'].reveil, `les chaussons de lisière étouffent les pas (${pc(R['novice, debout, chaussons'].reveil)})`);

    // ============================================================ 5. ce que ça rapporte, ce que ça coûte (outils : esp, nuit, pPris, amende)
    log(`\n--- Le butin : un meuble de maison ${r0(parFouille)} pièces en moyenne (${tables.join(', ')}) ; un double fond ${r0(df)}, celui d’un secrétaire ${r0(dfR)}`);
    verif(df > 2 * parFouille && df <= 120 && dfR <= 200, `un double fond vaut le risque sans être un trésor (${r0(df)} ; secrétaire ${r0(dfR)} ; fouilles d'origine : ≤ 200)`);
    // la maison entière : quatre meubles, les poches du dormeur ; pris : effraction et vol, l'amitié de la victime
    const SCM = { 'novice, accroupi': { L: 0, mode: 'accroupi' }, 'novice, debout': { L: 0, mode: 'marche' }, 'main sûre, accroupi': { L: 2, mode: 'accroupi' }, 'main de velours, accroupi': { L: 5, mode: 'accroupi' } };
    log(`  la maison entière (quatre meubles, les poches du dormeur), à 2 h ; pris : amende ${amende} (effraction et vol, récidive), amitié −150 (${amitie})`);
    const honnete = E.milieu / (650 / 60);
    let maxMin = 0;
    const MM = {};
    for (const k in SCM) {
      const o = SCM[k], q = scenario(Object.assign({ h: 2, fouilles: 4, poche: true, graine: k.length * 31 }, o));
      const gain = nuit(o.L), pp = pPris(q.reveil), ev = gain - pp * (amende + amitie), parMin = ev / DUREE * 60;
      MM[k] = { gain, pp, ev, reveil: q.reveil };
      maxMin = Math.max(maxMin, parMin);
      log(`  ${pad(k, 28)} réveil ${lpad(pc(q.reveil), 7)}  butin ${lpad(r0(gain), 4)}  pris ${lpad(pc(pp), 7)}  espérance ${lpad(r0(ev), 4)} (${r1(ev / E.debut)} j du début)  ${lpad(r0(parMin), 4)} /min (travail : ${r0(E.debitDebut * 60)} /min au début, ${r0(honnete)} au milieu)`);
    }
    const nov = MM['novice, accroupi'];
    verif(nov.ev > 0 && nov.pp >= 0.04, `voler la nuit rapporte (espérance ${r0(nov.ev)} par maison, avec prudence), mais le risque est réel (${pc(nov.pp)} d’être pris)`);
    verif(MM['novice, debout'].ev < nov.ev, `l’imprudence se paie (${r0(MM['novice, debout'].ev)} en marchant debout)`);
    verif(maxMin <= honnete, `même à la meilleure main, le cambriolage ne rapporte pas à la minute plus que le travail du milieu de partie (${r0(maxMin)} / ${r0(honnete)})`);
    const pire = nuit(0) - (amende + amitie);
    verif(pire < 0 && -pire >= 0.4 * E.debut, `pris, on perd plus que la nuit ne rapporte (${r0(pire)} : plus d’une demi-journée des débuts)`);

    // ============================================================ 6. les objets
    log('\n--- Les objets');
    for (const id of ['cadenas_exercice', 'crochets_fins', 'chaussons_lisiere']) log(`  ${pad(id, 20)} prix ${ITEMS[id] && ITEMS[id].price}`);
    const vend = J.ev(`JSON.stringify(Object.fromEntries(NPC_DATA.filter((d) => d.shop).map((d) => [d.id, (d.shop.sells || []).filter((e) => ['cadenas_exercice', 'chaussons_lisiere', 'crochets_fins'].includes(e[0]))]).filter((e) => e[1].length)))`);
    log('  où : ' + vend + ' (les crochets fins : le colporteur, à qui a « une main de serrurier »)');
    verif(ITEMS.crochets_fins.price >= 2 * ITEMS.crochets.price && ITEMS.crochets_fins.price <= E.debut, `les crochets fins : un outil cher, pas une fortune (${ITEMS.crochets_fins.price})`);
    verif(ITEMS.chaussons_lisiere.price <= 0.25 * E.debut && ITEMS.cadenas_exercice.price <= 0.1 * E.debut, 'les chaussons et le vieux cadenas restent à la portée des débuts');
    verif(!J.ev('NPC_DATA.some((d) => d.shop && (d.shop.sells || []).some((e) => e[0] === "crochets_fins"))'), 'les crochets fins ne sont pas à l’étal d’entrée de jeu (ils viennent avec la main)');
    return { echecs };
  },
};
