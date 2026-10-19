// Équilibrage P21 : la pêche à QTE (src/11-zzzzzzzzzzzP21-*.js). Trois joueurs simulés (maladroit, moyen, adroit)
// jouent le VRAI moteur du combat (p21Moteur) et le vrai tirage (p21Tirage, copie de play.catchFish) : le lancer, l'attente
// et ses frémissements, le ferrage dans sa fenêtre, le combat (tension, invites, épuisette), la prise montrée.
// On compare à la pêche d'avant (11-farm-play.js, lue comme le fait commerce.js : un clic, 8 à 28 s, une seconde pour
// cliquer) : les prises par heure et le revenu restent proches pour le joueur moyen, raisonnables pour le maladroit, un
// peu meilleurs pour l'adroit ; les raretés ne bougent pas en espérance (le poisson qui s'échappe revient) ; le concours
// (au poids) reste gagnable ; mêmes poissons, mêmes prix ; les appâts aident sans casser l'économie.
'use strict';
const fs = require('fs');
const path = require('path');
const { donnees, valeurs } = require('./commerce.js');

// les prix des poissons au moment de la vague 21 (mêmes poissons, mêmes prix)
const PRIX_V21 = { carpe: 8, perche: 6, truite: 11, brochet: 18, anguille: 14, silure: 27, poisson_lune: 90, poisson_aveugle: 25, gardon: 3,
  rotengle: 3, tanche: 8, breme: 6, sandre: 21, chevesne: 5, barbeau: 9, vandoise: 4, vairon: 1, loche: 2, chabot: 2, saumon: 49, esturgeon: 105,
  ecrevisse: 5, ablette: 2, carassin: 15, poisson_chat: 6, lavaret: 18, reine_lac: 200, poisson_roche: 20, goujon: 3, ombre: 13, omble: 24,
  lotte: 18, vieux_silure: 140, carpe_miroir: 11, brochet_douves: 85, truite_arc: 15, poisson_source: 9, anguille_argent: 30,
  ecrevisse_aveugle: 12, truite_pierre: 18, poisson_ancien: 200, lamproie: 10, gremille: 4, blennie: 6 };

// les joueurs : temps de réaction (moyenne, écart) au ferrage et aux invites, part des frémissements pris pour la
// touche, part des mauvaises directions, seuils de tension (on lâche au-dessus de « haut », on reprend sous « bas »)
// vus avec un retard « lag », temps de lancer (maintien de la jauge), part du temps passé sur un coin à poissons
const JOUEURS = {
  maladroit: { distrait: 0.25, react: [0.55, 0.2], leurre: 0.2, qte: [0.62, 0.22], faux: 0.14, haut: 0.95, bas: 0.5, lag: 0.25, lancer: 1.3, coin: 0, montre: 1.6 },
  moyen: { distrait: 0.1, react: [0.4, 0.12], leurre: 0.07, qte: [0.45, 0.14], faux: 0.05, haut: 0.86, bas: 0.55, lag: 0.15, lancer: 1.0, coin: 0.3, montre: 1.3 },
  adroit: { distrait: 0.02, react: [0.27, 0.07], leurre: 0.02, qte: [0.3, 0.08], faux: 0.01, haut: 0.82, bas: 0.6, lag: 0.08, lancer: 0.85, coin: 0.6, montre: 0.9 },
};

// la simulation, jouée DANS la machine du jeu (une seule évaluation : rapide)
function simu(P) {
  /* global p21Moteur, p21Tirage, P21_REGL, FISH, ITEMS, mulberry32, fishRarete */
  const rnd = mulberry32(P.graine >>> 0);
  const norm = (m, s) => { let u = 0, v = 0; while (u === 0) u = rnd(); while (v === 0) v = rnd(); return m + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const R = P21_REGL, J = P.joueur, aide = P.aide || 'complete', V = P.valeurs;
  const fast = P.fast || 1;
  const val = (id) => (V[id] !== undefined ? V[id] : (ITEMS[id] && ITEMS[id].price) || 0);
  // un combat joué par ce joueur ; renvoie le moteur à la fin
  const combat = (id, mes, D) => {
    const C = p21Moteur.creer({ id, kg: mes.kg, s: mes.s, aide, canne: P.canne, D, rnd });
    const dt = 1 / 30, hist = [];
    let moul = true, repond = null, distraitT = 0;
    for (let n = 0; n < 30 * 240 && !C.fin; n++) {
      hist.push(C.T);
      const lagN = Math.round((J.lag + (C.t < distraitT ? 0.5 : 0)) / dt), Tv = hist[Math.max(0, hist.length - 1 - lagN)];
      if (moul && Tv > J.haut) moul = false;
      else if (!moul && Tv < J.bas) moul = true;
      let dir = null;
      for (const e of C.evts) {
        if (e.e === 'coup' && rnd() < J.distrait) distraitT = C.t + 0.8;
        if (e.e === 'invite') {
          const bon = rnd() >= J.faux, autres = ['g', 'd', 'h', 'b'].filter((d) => d !== e.dir);
          repond = { t: C.t + Math.max(0.12, norm(J.qte[0], J.qte[1])), dir: e.dir === 'e' || bon ? e.dir : autres[Math.floor(rnd() * 3)] };
        }
      }
      C.evts.length = 0;
      if (repond && C.t >= repond.t) { dir = repond.dir; repond = null; }
      if (!C.invite && !C.epuisette) repond = null;
      p21Moteur.pas(C, dt, { mouline: moul, dir });
    }
    if (!C.fin) C.fin = 'decroche';
    return C;
  };
  const out = { t: 0, prises: 0, valeur: 0, tot: 0, tard: 0, pertes: { casse: 0, decroche: 0, loin: 0 }, durees: 0, nComb: 0, inv: 0, ok: 0, appats: 0,
    especes: {}, base: {}, leg: { n: 0, pris: 0 } };
  let revenant = null;
  const o = { zone: P.zone, nuit: !!P.nuit, lune: false, pluie: false, appat: P.appat || null, dame: false };
  for (let b = 0; b < P.n; b++) {
    // le lancer, le vol
    out.t += J.lancer * (0.85 + rnd() * 0.3) + 0.5;
    // l'attente et ses frémissements
    const coin = rnd() < J.coin ? R.coin : 1;
    let tAtt = (R.attente[0] + rnd() * R.attente[1]) * fast * coin * (o.appat ? R.appat : 1);
    let pris = false;
    for (let essai = 0; essai < 6 && !pris; essai++) {
      out.t += tAtt;
      const nl = R.leurres[0] + Math.floor(rnd() * (R.leurres[1] - R.leurres[0] + 1));
      let tot = false;
      for (let i = 0; i <= nl; i++) if (rnd() < J.leurre) { tot = true; break; } // (l'annonce compte comme un frémissement)
      if (tot) { out.tot++; tAtt = R.reprise[0] + rnd() * (R.reprise[1] - R.reprise[0]); continue; }
      const r = Math.max(0.12, norm(J.react[0], J.react[1]));
      if (aide === 'auto' || r <= R.fenetre[aide]) { out.t += r; pris = true; }
      else { out.tard++; out.t += R.fenetre[aide]; tAtt = R.reprise[0] + rnd() * (R.reprise[1] - R.reprise[0]); }
    }
    if (!pris) continue;
    // ferré : le tirage (le poisson qui s'est échappé revient d'abord)
    let u0 = rnd(), u1 = rnd();
    const base = p21Tirage.predire(o, u0, u1);
    out.base[base] = (out.base[base] || 0) + 1;
    let retour = 0;
    if (revenant && u1 >= 0.075) { const v = p21Tirage.viser(o, revenant.id); if (v !== null) { u0 = v; retour = revenant.n; } revenant = null; }
    const id = p21Tirage.predire(o, u0, u1);
    if (!id) continue;
    const mes = p21Tirage.mesure(id, rnd), D = R.lancer.min + rnd() * (R.lancer.max - R.lancer.min);
    const C = combat(id, mes, D);
    out.t += C.t; out.durees += C.t; out.nComb++; out.inv += C.nInv; out.ok += C.nOk;
    const leg = FISH[id] && FISH[id].w < 0.2;
    if (leg) out.leg.n++;
    if (C.fin === 'prise') {
      out.prises++; out.valeur += val(id); out.t += J.montre;
      out.especes[id] = (out.especes[id] || 0) + 1;
      if (leg) out.leg.pris++;
      if (o.appat) out.appats++;
    } else {
      out.pertes[C.fin]++; out.t += 0.8;
      if (FISH[id]) revenant = { id, n: retour + 1 };
      if (o.appat && C.fin !== 'decroche') out.appats++;
    }
  }
  return out;
}

// la pêche d'avant, lue dans le source comme commerce.js (une prise par cycle ; touches manquées 10 %)
function avant(J, D, v, zone, nuit, fast) {
  const src = fs.readFileSync(path.join(require('./vm.js').ROOT, 'src', '11-farm-play.js'), 'utf8');
  const [, a, b] = src.match(/t: \(([\d.]+) \+ Math\.random\(\) \* ([\d.]+)\) \* fast/);
  const lancer = +src.match(/this\.cool = ([\d.]+); this\.castT/)[1], ferrer = +src.match(/this\.fish = null; this\.cool = ([\d.]+);/)[1];
  const seuils = src.match(/r0 < ([\d.]+)/g).map((x) => +x.slice(5));
  const duree = lancer + (+a + +b / 2) * fast + 0.5 + ferrer + 0.1 * 8 * fast;
  const L = Object.keys(D.FISH).filter((k) => D.FISH[k].where.includes(zone) && !D.FISH[k].moon && (D.FISH[k].time === 'tout' || (D.FISH[k].time === 'nuit') === nuit));
  const tw = L.reduce((x, k) => x + D.FISH[k].w, 0), moyP = L.reduce((x, k) => x + D.FISH[k].w * v(k), 0) / tw;
  const pf = seuils[0], pc = seuils[1] - seuils[0], pp = zone === 'lac' ? seuils[2] - seuils[1] : 0;
  const parLancer = pf * v('fibre') + pc * v('coffre_peche') + pp * v('perle') + (1 - pf - pc - pp) * moyP;
  return { parH: 3600 / duree, revH: 3600 / duree * parLancer, duree };
}

module.exports = {
  titre: 'P21 — la pêche à QTE (trois joueurs simulés, raretés, concours, appâts)',
  async verifier(J, log) {
    let echecs = 0;
    const verif = (ok, txt) => { log(`${ok ? '  ok ' : 'ÉCHEC'} ${txt}`); if (!ok) echecs++; };
    const D = donnees(J), v = valeurs(D);
    const V = {};
    for (const k of Object.keys(D.FISH).concat(['fibre', 'coffre_peche', 'perle'])) V[k] = v(k);
    const jouer = (p) => JSON.parse(J.ev(`JSON.stringify((${simu.toString()})(${JSON.stringify(Object.assign({ valeurs: V }, p))}))`));
    const r0 = (x) => String(Math.round(x)), pc = (x) => Math.round(x * 100) + ' %', r1 = (x) => (Math.round(x * 10) / 10).toFixed(1);
    const N = +(process.env.P21_N || 2500);

    // ------------------------------------------------ 1. mêmes poissons, mêmes prix
    log('\n1. Les poissons et leurs prix');
    const FISH = D.FISH, ids = Object.keys(FISH);
    const changes = Object.keys(PRIX_V21).filter((k) => !FISH[k] || D.items[k].p !== PRIX_V21[k]);
    verif(!changes.length, `les ${Object.keys(PRIX_V21).length} poissons de la vague 21 sont là, au même prix${changes.length ? ' (changés : ' + changes.join(', ') + ')' : ''}`);
    const sansStyle = J.ev('JSON.stringify(Object.keys(FISH).filter((k) => !P21_ESPECES[k]))');
    verif(JSON.parse(sansStyle).length === 0, `chaque poisson a sa façon de se battre et sa taille (P21_ESPECES)${JSON.parse(sansStyle).length ? ' : manquent ' + sansStyle : ''}`);
    const tailles = JSON.parse(J.ev(`JSON.stringify(Object.keys(FISH).map((k) => { const r = mulberry32(7); let a = 1e9, b = 0, m = 0; for (let i = 0; i < 400; i++) { const x = p21Tirage.mesure(k, r); a = Math.min(a, x.kg); b = Math.max(b, x.kg); m += x.kg / 400; } return [k, a, m, b]; }))`));
    verif(tailles.every(([, a, m, b]) => a > 0 && m >= a && b >= m), 'les poids tirés sont positifs et ordonnés (min ≤ moyenne ≤ max)');
    log('   quelques poids (min / moyenne / max, kg) : ' + tailles.filter(([k]) => ['gardon', 'perche', 'carpe', 'brochet', 'truite', 'silure', 'reine_lac'].includes(k)).map(([k, a, m, b]) => `${k} ${a.toFixed(2)}/${m.toFixed(2)}/${b.toFixed(1)}`).join(' ; '));

    // ------------------------------------------------ 2. prises et revenu par heure, avant / après
    log(`\n2. Prises et revenu par heure de pêche (le grand lac, de jour, canne ordinaire, sans appât ; ${N} lancers par joueur)`);
    const A = avant(J, D, v, 'lac', false, 1);
    log(`   avant : une prise toutes les ${r1(A.duree)} s → ${r0(A.parH)} prises/h, ${r0(A.revH)} pièces/h`);
    log('   joueur      aide         prises/h  revenu/h   (avant)   perdus  ferrage raté  combat moy.  invites réussies');
    const R = {};
    for (const [nom, Jo] of Object.entries(JOUEURS)) {
      const S = jouer({ joueur: Jo, zone: 'lac', nuit: false, n: N, graine: 21 + nom.length, canne: 'canne' });
      const parH = S.prises / S.t * 3600, revH = S.valeur / S.t * 3600, perdus = (S.pertes.casse + S.pertes.decroche + S.pertes.loin) / Math.max(1, S.nComb);
      R[nom] = { parH, revH, perdus, S };
      log(`   ${nom.padEnd(11)} complète  ${r0(parH).padStart(8)} ${r0(revH).padStart(9)}   (${pc(parH / A.parH)} / ${pc(revH / A.revH)})  ${pc(perdus).padStart(5)}  ${pc((S.tot + S.tard) / N).padStart(6)}  ${r1(S.durees / Math.max(1, S.nComb)).padStart(6)} s   ${pc(S.ok / Math.max(1, S.inv))}`);
    }
    for (const aide of ['simplifiee', 'auto']) {
      const S = jouer({ joueur: JOUEURS.moyen, zone: 'lac', nuit: false, n: N, graine: 77, canne: 'canne', aide });
      const parH = S.prises / S.t * 3600, revH = S.valeur / S.t * 3600;
      R['moyen_' + aide] = { parH, revH };
      log(`   ${'moyen'.padEnd(11)} ${aide.padEnd(9)} ${r0(parH).padStart(8)} ${r0(revH).padStart(9)}   (${pc(parH / A.parH)} / ${pc(revH / A.revH)})  ${pc((S.pertes.casse + S.pertes.decroche + S.pertes.loin) / Math.max(1, S.nComb)).padStart(5)}  ${pc((S.tot + S.tard) / N).padStart(6)}  ${r1(S.durees / Math.max(1, S.nComb)).padStart(6)} s`);
    }
    // la canne de fer
    const fastFer = D.items.canne_fer ? D.items.canne_fer.fast : 1, AF = avant(J, D, v, 'lac', false, fastFer);
    const SF = jouer({ joueur: JOUEURS.moyen, zone: 'lac', nuit: false, n: N, graine: 91, canne: 'canne_fer', fast: fastFer });
    const ferH = SF.prises / SF.t * 3600;
    log(`   moyen, canne de fer : ${r0(ferH)} prises/h (avant ${r0(AF.parH)} : ${pc(ferH / AF.parH)}), ${r0(SF.valeur / SF.t * 3600)} pièces/h ; casses ${pc(SF.pertes.casse / Math.max(1, SF.nComb))} (canne ordinaire ${pc(R.moyen.S.pertes.casse / Math.max(1, R.moyen.S.nComb))})`);
    verif(Math.abs(R.moyen.parH / A.parH - 1) <= 0.15 && Math.abs(R.moyen.revH / A.revH - 1) <= 0.15, `joueur moyen : prises et revenu à ±15 % d'avant (${pc(R.moyen.parH / A.parH)}, ${pc(R.moyen.revH / A.revH)})`);
    verif(R.maladroit.parH / A.parH >= 0.6 && R.maladroit.revH / A.revH >= 0.55, `joueur maladroit : raisonnable (au moins 60 % des prises d'avant : ${pc(R.maladroit.parH / A.parH)})`);
    verif(R.adroit.parH > R.moyen.parH && R.adroit.parH / A.parH <= 1.35 && R.adroit.revH / A.revH <= 1.4, `joueur adroit : un peu meilleur, sans casser l'économie (${pc(R.adroit.parH / A.parH)} des prises, ${pc(R.adroit.revH / A.revH)} du revenu)`);
    verif(R.moyen_simplifiee.parH / A.parH >= 0.8 && R.moyen_simplifiee.parH / A.parH <= 1.2 && R.moyen_auto.parH / A.parH >= 0.8 && R.moyen_auto.parH / A.parH <= 1.2, `aides simplifiée et automatique : à ±20 % d'avant (${pc(R.moyen_simplifiee.parH / A.parH)}, ${pc(R.moyen_auto.parH / A.parH)})`);
    verif(SF.pertes.casse / Math.max(1, SF.nComb) < R.moyen.S.pertes.casse / Math.max(1, R.moyen.S.nComb) + 0.005, 'la canne de fer tient mieux la tension (moins de casses)');
    verif(ferH / AF.parH >= 0.75 && ferH > R.moyen.parH, `la canne de fer reste meilleure que l'ordinaire, et proche d'avant (${pc(ferH / AF.parH)})`);
    verif(R.maladroit.perdus <= 0.35 && R.moyen.perdus <= 0.15, `rien de punitif à l'excès : le maladroit perd ${pc(R.maladroit.perdus)} des combats, le moyen ${pc(R.moyen.perdus)}`);

    // ------------------------------------------------ 2b. les combats, façon par façon
    log('\n2b. Les combats, façon par façon (300 combats par joueur ; perdus : maladroit / moyen / adroit ; durée moyenne du moyen)');
    const FACONS = { perche: 'perche', carpe: 'carpe', truite: 'truite', saumon: 'saumon', brochet: 'brochet', anguille: 'anguille', silure: 'silure', esturgeon: 'esturgeon', reine: 'reine_lac', vieux: 'vieux_silure', notaire: 'brochet_douves', ancien: 'poisson_ancien', lune: 'poisson_lune' };
    const parFacon = {};
    for (const [nom, Jo] of Object.entries(JOUEURS)) parFacon[nom] = JSON.parse(J.ev(`JSON.stringify((() => { const rnd = mulberry32(${nom.length * 31}); const J = ${JSON.stringify(Jo)}; const res = {};
      const norm = (m, s) => { let u = 0, v = 0; while (u === 0) u = rnd(); while (v === 0) v = rnd(); return m + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
      for (const [f, id] of Object.entries(${JSON.stringify(FACONS)})) { let perdu = 0, t = 0, inv = 0, ok = 0; const n = 300;
        for (let i = 0; i < n; i++) { const m = p21Tirage.mesure(id, rnd), C = p21Moteur.creer({ id, kg: m.kg, s: m.s, canne: 'canne', D: 6 + rnd() * 10, rnd }); const hist = []; let moul = true, rep = null, distraitT = 0;
          for (let s = 0; s < 30 * 300 && !C.fin; s++) { hist.push(C.T); const Tv = hist[Math.max(0, hist.length - 1 - Math.round((J.lag + (C.t < distraitT ? 0.5 : 0)) * 30))]; if (moul && Tv > J.haut) moul = false; else if (!moul && Tv < J.bas) moul = true;
            for (const e of C.evts) { if (e.e === 'coup' && rnd() < J.distrait) distraitT = C.t + 0.8; if (e.e === 'invite') rep = { t: C.t + Math.max(0.12, norm(J.qte[0], J.qte[1])), dir: e.dir === 'e' || rnd() >= J.faux ? e.dir : 'x' }; }
            C.evts.length = 0; let dir = null; if (rep && C.t >= rep.t) { dir = rep.dir; rep = null; } p21Moteur.pas(C, 1 / 30, { mouline: moul, dir }); }
          if (C.fin !== 'prise') perdu++; t += C.t; inv += C.nInv; ok += C.nOk; }
        res[f] = { perdu: perdu / n, t: t / n, inv: inv / n, ok: ok / Math.max(1, inv) }; }
      return res; })())`));
    for (const f of Object.keys(FACONS)) log(`   ${f.padEnd(10)} ${Object.keys(JOUEURS).map((n) => pc(parFacon[n][f].perdu).padStart(5)).join(' /')}   ${r1(parFacon.moyen[f].t).padStart(5)} s, ${r1(parFacon.moyen[f].inv)} invites`);
    const ord = Object.keys(FACONS).filter((f) => !['reine', 'vieux', 'notaire', 'ancien'].includes(f));
    const moy = (n, L) => L.reduce((a, f) => a + parFacon[n][f].perdu, 0) / L.length;
    verif(moy('maladroit', ord) > moy('moyen', ord) && moy('moyen', ord) > moy('adroit', ord), `l'adresse compte : perdus en moyenne ${pc(moy('maladroit', ord))} / ${pc(moy('moyen', ord))} / ${pc(moy('adroit', ord))}`);
    verif(moy('maladroit', ord) <= 0.3 && moy('moyen', ord) <= 0.15 && moy('adroit', ord) <= 0.08, 'rien de punitif à l\'excès (poissons ordinaires : au plus 30 % / 15 % / 8 % de perdus)');
    const legs2 = ['reine', 'vieux', 'notaire', 'ancien'];
    verif(legs2.every((f) => parFacon.maladroit[f].perdu <= 0.8 && parFacon.adroit[f].perdu <= 0.4), `les légendaires : durs, pas impossibles (maladroit ≤ 80 % de perdus, adroit ≤ 40 %)`);

    // ------------------------------------------------ 3. les raretés en espérance
    log('\n3. Les raretés : la part de chaque rang parmi les prises, comparée au tirage (le poisson échappé revient mordre)');
    const RANGS = ['commun', 'courant', 'peu commun', 'rare', 'légendaire'];
    const rangDe = JSON.parse(J.ev('JSON.stringify(Object.fromEntries(Object.keys(FISH).map((k) => [k, fishRarete(k)])))'));
    for (const [zone, nuit] of [['lac', true], ['lac_noir', true], ['riviere', false]]) {
      for (const nom of ['maladroit', 'adroit']) {
        const S = jouer({ joueur: JOUEURS[nom], zone, nuit, n: Math.round(N * 2.4), graine: 300 + nom.length + zone.length, canne: 'canne' });
        const parts = (M) => { const r = [0, 0, 0, 0, 0]; let t = 0; for (const [k, n] of Object.entries(M)) if (rangDe[k] !== undefined) { r[rangDe[k]] += n; t += n; } return r.map((x) => x / Math.max(1, t)); };
        const a = parts(S.base), b = parts(S.especes);
        const ecarts = a.map((x, i) => (x > 0.004 ? (b[i] - x) / x : 0));
        const pire = Math.max(...ecarts.map(Math.abs));
        log(`   ${zone} ${nuit ? 'nuit' : 'jour'}, ${nom} : ` + RANGS.map((n, i) => `${n} ${pc(a[i])}→${pc(b[i])}`).join(', '));
        verif(pire <= 0.12, `${zone} ${nuit ? 'nuit' : 'jour'}, ${nom} : chaque rang à ±12 % de sa part (pire ${pc(pire)})`);
      }
    }
    // ------------------------------------------------ 4. le concours du Pêchedi (au poids)
    log('\n4. Le concours du Pêchedi, au poids (les habitants : p21.pesee ; le joueur : ses prises du lac, de jour)');
    const conc = JSON.parse(J.ev(`JSON.stringify((() => {
      const s0 = farm.s, al = npcs.alive; farm.s = farm.blank(1234); npcs.alive = () => true;
      const o = { zone: 'lac', nuit: false, lune: false, pluie: false, appat: null, dame: false }, rnd = mulberry32(99);
      const res = { 12: [0, 0], 25: [0, 0] }, N = 1200; let pe = 0;
      for (let d = 1; d <= N; d++) {
        farm.s.day = d;
        const P = p21Concours.pesee().map((q) => q[1]).sort((a, b) => b - a);
        pe += P[0];
        for (const n of [12, 25]) { let b = 0; for (let i = 0; i < n; i++) { const id = p21Tirage.predire(o, rnd(), 0.5); b = Math.max(b, p21Tirage.mesure(id, rnd).kg); } if (b > P[0]) res[n][0]++; else if (b > P[1]) res[n][1]++; }
      }
      farm.s = s0; npcs.alive = al;
      return { p12: res[12][0] / N, p12b: res[12][1] / N, p25: res[25][0] / N, meilleur: pe / N };
    })())`));
    log(`   le meilleur des habitants pèse en moyenne ${conc.meilleur.toFixed(2)} kg ; le joueur gagne ${pc(conc.p12)} (12 prises) ou ${pc(conc.p25)} (25 prises), 2e ${pc(conc.p12b)}`);
    verif(conc.p12 >= 0.1 && conc.p12 <= 0.6, `concours de pêche (au poids) : on peut le gagner, pas à tous les coups (${pc(conc.p12)} avec 12 prises)`);

    // ------------------------------------------------ 5. les appâts
    log('\n5. Les appâts (joueur moyen, grand lac de jour ; le prix de l\'appât est compté)');
    const base = R.moyen;
    let pire = 0;
    for (const ap of ['vers', 'pain', 'mais', 'viande', 'sauterelle', 'vairon']) {
      const S = jouer({ joueur: JOUEURS.moyen, zone: 'lac', nuit: false, n: N, graine: 500 + ap.length, canne: 'canne', appat: ap });
      const cout = S.appats * (D.items[ap] ? D.items[ap].p : 0);
      const revH = (S.valeur - cout) / S.t * 3600, parH = S.prises / S.t * 3600;
      pire = Math.max(pire, revH / base.revH);
      log(`   ${ap.padEnd(11)} ${r0(parH).padStart(5)} prises/h, ${r0(revH).padStart(5)} pièces/h net (${pc(revH / base.revH)} du sans-appât)`);
    }
    verif(pire <= 1.3, `aucun appât ne rapporte plus de 30 % de plus que la pêche sans appât (au mieux ${pc(pire)})`);
    return { echecs };
  },
};
