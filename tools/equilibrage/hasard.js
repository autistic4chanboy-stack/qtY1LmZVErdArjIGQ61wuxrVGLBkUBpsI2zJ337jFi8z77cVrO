// Équilibrage — le HASARD : la fréquence de tout ce qui arrive par hasard pendant la partie.
//   node tools/equilibrage.js hasard
// Les fréquences sont exprimées par semaine de douze jours de jeu (une journée : JOUR_SECONDES réelles). Tout ce qui
// peut l'être est mesuré en appelant les fonctions du jeu dans la machine virtuelle (calendrier des événements,
// strange.newDay, chances exposées par les modules : lavandiere.taux, divins.chanceReve, cauchemar.chance,
// pilules.chanceMarchand…), sur des centaines de parties simulées (graines 1…N). Ce qui dépend de la façon de jouer
// (veiller la nuit, dehors ou dedans, près du lavoir) suit un joueur « typique », décrit plus bas (HABITUDES).
// Quatre esprits : mentalité haute (95), ordinaire (70), basse (35), très basse (5), constante sur toute la partie.
'use strict';

const SEEDS = +(process.env.HASARD_GRAINES || 200); // parties simulées par profil
const JOURS = 288;                                   // vingt-quatre semaines de douze jours
const MENTALITES = [['haute', 95], ['ordinaire', 70], ['basse', 35], ['très basse', 5]];
// Le joueur « typique », chaque nuit : 15 % au lit à 21 h 30, 55 % à 23 h, 25 % à 2 h, 5 % de nuits blanches (sans
// sommeil). Éveillé la nuit : dehors 60 % du temps (dont un vingtième à moins de soixante pas du lavoir), dedans 40 %
// (la moitié sans lanterne, dans le noir). Heures éveillées entre 22 h et 4 h : 0, 1, 4 ou 6 (1,85 en moyenne).
const HABITUDES = [
  { nom: 'au lit à 21 h 30', p: 0.15, heures: 0, vesh: false, aube: false, dort: true },
  { nom: 'au lit à 23 h', p: 0.55, heures: 1, vesh: false, aube: false, dort: true },
  { nom: 'au lit à 2 h', p: 0.25, heures: 4, vesh: true, aube: false, dort: true },
  { nom: 'nuit blanche', p: 0.05, heures: 6, vesh: true, aube: true, dort: false },
];
const DEHORS = 0.6, LAVOIR = 0.05, NOIR = 0.5;

// ---------------------------------------------------------------- ce qui tourne DANS le jeu (machine virtuelle)
// (le texte de cette fonction est évalué dans la VM : farm, evenements, strange… y sont ceux du jeu)
function installerDansLeJeu(HABITUDES, DEHORS, LAVOIR, NOIR) {
  const H = {
    // une partie neuve, sans monde : graine, mentalité fixée, fatigue nulle
    neuf(seed, v) {
      farm.s = farm.blank(seed);
      farm.s.esprit = v; farm.s.hours = 6.5; farm.s.sommeil = { debout: 6.5, nuits: 0, veilleMax: 0 };
      evenements._plans.clear();
      const av = strange.applyVersion; strange.applyVersion = () => {};
      try { strange.init(farm.s); } finally { strange.applyVersion = av; }
      return farm.s;
    },
    // le calendrier des événements (11-zzz40-evenements.js), jour après jour
    calendrier(seeds, v, D) {
      const R = { jours: 0, nn: 0, nnImp: 0, nnPrem: 999, nnSuite: 0, sol: 0, neige: 0, torn: 0, tornPrem: 999, tornEcart: [], tu: 0, tuPrem: 999, tuEcart: [], prod: {}, prodEtrangeAvant4: 0, durn: 0, durn12: 0, avant4: 0 };
      for (let seed = 1; seed <= seeds; seed++) {
        this.neuf(seed, v);
        const S = evenements.S(), rnd = mulberry32(seed * 977 + 13);
        let lastN = -9, lastT = -1, lastU = -1;
        for (let d = 1; d <= D; d++) {
          farm.s.day = d; S.prodige = null; R.jours++;
          let nn = evenements.nuitNoire(d);
          if (!nn && rnd() < evenements.chanceImprevue(d)) { S.nuit.imprevue = d; nn = true; R.nnImp++; }
          if (nn) { R.nn++; R.nnPrem = Math.min(R.nnPrem, d); if (d - lastN === 1) R.nnSuite++; lastN = d; if (d < 4) R.avant4++; }
          if (evenements.soleil(d)) R.sol++;
          if (evenements.neige(d)) R.neige++;
          if (evenements.tornade(d) !== null) { R.torn++; R.tornPrem = Math.min(R.tornPrem, d); if (lastT > 0) R.tornEcart.push(d - lastT); lastT = d; }
          if (evenements.tueur(d)) { S.tueur.dernier = d; R.tu++; R.tuPrem = Math.min(R.tuPrem, d); if (lastU > 0) R.tuEcart.push(d - lastU); lastU = d; }
          const P = evenements.prodige(d);
          if (P) {
            R.prod[P.id] = (R.prod[P.id] || 0) + 1;
            if (d < 4 && PRODIGES[P.id].etrange) R.prodEtrangeAvant4++;
            // la terre tremble : parfois, Durn se lève (une fois dans une vie)
            if (P.id === 'seisme' && rnd() < divins.chanceDurn()) { divins.S().durn.vu = d; R.durn++; if (d <= 144) R.durn12++; }
          }
        }
      }
      return JSON.stringify(R);
    },
    // l'étrange (11-strange.js, 11-zzstrange-more.js, 11-zzz60-esprit.js) : strange.newDay, tel quel
    etrange(seeds, v, D) {
      const _vanish = npcs.vanishAll, _murder = strange.murder, _clue = strange.placeClue;
      npcs.vanishAll = () => {}; strange.placeClue = function () { this.s.clue = true; };
      strange.murder = function () { this.s.victims.push('v' + this.s.victims.length); };
      const LV = {}; for (const e of EVENT_DEFS) LV[e.id] = e.lvl;
      const total = EVENT_DEFS.length * 3;
      const R = { rouges: 0, nuitsApres: 0, rougePrem: 999, rougeNoire: 0, ev: 0, joursEv: 0, lvl: [0, 0, 0, 0], lvl2Prem: 999, lvl3Prem: 999, victimes: 0, victimeJour: [], epuise: [], total };
      try {
        for (let seed = 1; seed <= seeds; seed++) {
          this.neuf(seed, v);
          const S = strange.s;
          let vus = 0, epuise = 0;
          for (let d = 1; d <= D; d++) {
            farm.s.day = d;
            const v0 = S.victims.length;
            strange.newDay({ killerNight: strange.killerActive() });
            if (S.victims.length > v0 && S.victims.length === 1) R.victimeJour.push(d);
            for (const e of S.events) {
              S.seen[e.id] = (S.seen[e.id] || 0) + 1; vus++;
              R.lvl[LV[e.id]]++;
              if (LV[e.id] >= 2) R.lvl2Prem = Math.min(R.lvl2Prem, d);
              if (LV[e.id] >= 3) R.lvl3Prem = Math.min(R.lvl3Prem, d);
              if (d >= 13 && d <= 84) R.ev++;
            }
            if (d >= 13 && d <= 84) R.joursEv++;
            if (!epuise && vus >= total * 0.9) epuise = d;
            if (S.redTonight) {
              S.red = true; S.redCount++; R.rougePrem = Math.min(R.rougePrem, d);
              if (evenements.nuitNoire(d)) R.rougeNoire++;
              if (d >= 13) R.rouges++;
            }
            if (d >= 13) R.nuitsApres++;
          }
          R.victimes += S.victims.length;
          R.epuise.push(epuise || 999);
        }
      } finally { npcs.vanishAll = _vanish; strange.murder = _murder; strange.placeClue = _clue; }
      return JSON.stringify(R);
    },
    // les nuits du joueur « typique » : lavandière, rêves et venues des Trois, cauchemars, marchand de joie
    nuits(seeds, v, D, tueurMasque) {
      const R = { jours: 0, lav: 0, lavEcart: [], lavMin: 999, reves: { aela: 0, durn: 0, vesh: 0 }, reves12: { aela: 0, durn: 0, vesh: 0 }, aela: 0, aela12: 0, vesh: 0, vesh12: 0, sommeils: 0, cauch: 0, cauchEcartMin: 999, marchand: 0, marchandAvant4: 0, lavandiereAvant: 0 };
      for (let seed = 1; seed <= seeds; seed++) {
        this.neuf(seed, v);
        const st = strange.s;
        if (tueurMasque) st.kDay = 1; else st.kDead = true;
        const rnd = mulberry32(seed * 7919 + 5), L = lavandiere, E = evenements.S(), Dv = divins.S(), C = cauchemar.C();
        let lastLav = -1, lastC = -99;
        for (let d = 1; d <= D; d++) {
          farm.s.day = d; R.jours++;
          // l'habitude de la nuit
          let u = rnd(), hab = HABITUDES[HABITUDES.length - 1];
          for (const h of HABITUDES) { if (u < h.p) { hab = h; break; } u -= h.p; }
          // une nuit noire ? (prévue, ou imprévue)
          let noire = evenements.nuitNoire(d);
          if (!noire && rnd() < evenements.chanceImprevue(d)) { E.nuit.imprevue = d; noire = true; }
          // la lavandière (12-zzzD-esprit.js) : fois par heure de jeu éveillée entre 22 h et 4 h, selon l'endroit
          if (hab.heures > 0 && d - E.esprit.dernier >= L.ecart) {
            const tx = hab.heures * (DEHORS * (1 - LAVOIR) * L.taux(false, false) + DEHORS * LAVOIR * L.taux(true, false) + (1 - DEHORS) * NOIR * L.taux(false, true) + (1 - DEHORS) * (1 - NOIR) * L.taux(false, false));
            if (rnd() < 1 - Math.exp(-tx)) { E.esprit.dernier = d; R.lav++; if (lastLav > 0) { R.lavEcart.push(d - lastLav); R.lavMin = Math.min(R.lavMin, d - lastLav); } lastLav = d; }
          }
          // Vesh, une nuit noire, à qui veille dehors vers 23 h ; Aëla, à l'aube, à qui a veillé toute la nuit dehors
          if (noire && hab.vesh && rnd() < DEHORS && rnd() < divins.chanceVesh(d)) { Dv.vesh.vu = d; R.vesh++; if (d <= 144) R.vesh12++; }
          if (hab.aube && rnd() < DEHORS && rnd() < divins.chanceAela(d)) { Dv.aela.vu = d; R.aela++; if (d <= 144) R.aela12++; }
          // le sommeil : un rêve des Trois (11-zzz41-divins.js), un cauchemar (11-zzz73-cauchemar.js)
          if (hab.dort) {
            R.sommeils++;
            const reste = DIV_REVES.filter((X) => !(Dv.reves || {})[DIV_REVES.indexOf(X)]);
            if (reste.length && rnd() < divins.chanceReve()) {
              const X = reste[(rnd() * reste.length) | 0];
              Dv.reves = Dv.reves || {}; Dv.reves[DIV_REVES.indexOf(X)] = d;
              R.reves[X.qui]++; if (d <= 144) R.reves12[X.qui]++;
            }
            if (rnd() < cauchemar.chance('ferme')) { C.dernier = d; C.nuits++; R.cauch++; if (lastC > 0) R.cauchEcartMin = Math.min(R.cauchEcartMin, d - lastC); lastC = d; }
          }
          // le marchand de joie (11-zzz71-bonbons.js), certains soirs
          if (rnd() < pilules.chanceMarchand(d)) { R.marchand++; if (d < 4) R.marchandAvant4++; }
        }
      }
      return JSON.stringify(R);
    },
    // les pilules tombées au bord des chemins (pilules.nouveauJour, avec un monde de poche : des chemins, rien d'autre)
    pilulesSol(seeds, D) {
      const w0 = game.world;
      const nodes = []; for (let k = 0; k < 400; k++) nodes.push({ x: 100 + (k % 20) * 40, z: 100 + Math.floor(k / 20) * 40, tag: 'chemin' });
      game.world = { nav: { nodes }, heightAt: () => 5, waterLevel: 0, covered: () => false };
      let n = 0, jours = 0;
      try {
        for (let seed = 1; seed <= seeds; seed++) {
          this.neuf(seed, 70);
          const P = pilules.P();
          for (let d = 1; d <= D; d++) {
            farm.s.day = d; jours++;
            const avant = P.sol.map((q) => q.id);
            pilules.nouveauJour();
            for (const q of P.sol) if (!avant.includes(q.id)) n += q.n || 1;
            P.sol = []; // ramassées
          }
        }
      } finally { game.world = w0; }
      return JSON.stringify({ n, jours });
    },
  };
  globalThis.__hasard = H;
}

// ---------------------------------------------------------------- outils d'affichage
const f1 = (x) => (Number.isFinite(x) ? x.toFixed(1) : '—');
const f2 = (x) => (Number.isFinite(x) ? x.toFixed(2) : '—');
const unSur = (n, jours) => (n ? '1/' + f1(jours / n) : 'jamais');
const parSem = (n, jours) => f2(n / jours * 12);
const moy = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN);
function tableau(log, titres, lignes) {
  const L = [titres, ...lignes].map((r) => r.map(String));
  const w = titres.map((_, i) => Math.max(...L.map((r) => (r[i] || '').length)));
  for (const r of L) log('  ' + r.map((c, i) => (i ? c.padStart(w[i]) : c.padEnd(w[i]))).join('   '));
}

// mulberry32, recopié de 00-util.js (vérifié contre slender.tirage et fondation.tirage avant usage)
function mul32(a) { let t = (a + 0x6D2B79F5) | 0; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }

module.exports = {
  titre: 'Hasard : événements, étrange, Trois, cauchemars, pilules, raretés — fréquences par semaine de douze jours',
  async verifier(J, log) {
    let echecs = 0;
    const verif = (ok, texte) => { if (!ok) echecs++; log(`  ${ok ? 'ok   ' : 'ÉCHEC'} ${texte}`); };
    J.ev(`(${installerDansLeJeu.toString()})(${JSON.stringify(HABITUDES)}, ${DEHORS}, ${LAVOIR}, ${NOIR})`);
    const JS = J.ev('JOUR_SECONDES');
    log(`Une journée : ${JS} s réelles (une heure de jeu : ${JS / 24} s) ; semaine de 12 jours ; ${SEEDS} parties simulées par profil, ${JOURS} jours chacune.`);

    // ============================================================ 1. bizarrerie()
    log('\n1. bizarrerie() : le multiplicateur de l\'étrange selon la mentalité (11-zzz60-esprit.js ; fatigue : 11-zzz95-sommeil.js)');
    J.ev('__hasard.neuf(1, 70)');
    const biz = (v, veille) => J.avec({ v, veille: veille || 0 }, 'farm.s.esprit = __v.v; farm.s.sommeil.debout = farm.s.hours - __v.veille; bizarrerie()');
    const vs = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0];
    tableau(log, ['mentalité', ...vs], [['reposé', ...vs.map((v) => f2(biz(v)))], ['40 h debout', ...vs.map((v) => f2(biz(v, 40)))]]);
    const bmax = Math.max(...vs.map((v) => Math.max(biz(v), biz(v, 20), biz(v, 30), biz(v, 40))));
    verif(Math.abs(biz(100) - 0.6) < 0.05 && Math.abs(biz(70) - 1) < 0.01 && Math.abs(biz(0) - 2.5) < 0.1, `de ≈ 0,6 (esprit clair) à ≈ 2,5 (esprit en ruine), 1 à 70 : ${f2(biz(100))} / ${f2(biz(70))} / ${f2(biz(0))}`);
    verif(bmax <= 2.5 + 1e-9, `jamais au-delà de 2,5, même épuisé : ${f2(bmax)} au plus`);
    verif(vs.every((v, i) => i === 0 || biz(v) >= biz(vs[i - 1]) - 1e-9), 'plus l\'esprit s\'assombrit, plus l\'étrange se montre (monotone)');
    const B = {};
    for (const [nom, v] of MENTALITES) B[nom] = biz(v);
    log('  profils : ' + MENTALITES.map(([nom, v]) => `${nom} (${v}) → ${f2(B[nom])}`).join(' ; '));

    // ============================================================ 2. le calendrier
    log(`\n2. Le calendrier (11-zzz40-evenements.js, 12-zzzD-tornade.js, 12-zzzD-tueur.js) : evenements.nuitNoire, chanceImprevue, soleil, neige, tornade, tueur, prodige`);
    const CAL = {};
    for (const [nom, v] of MENTALITES) CAL[nom] = JSON.parse(J.avec({ S: SEEDS, v, D: JOURS }, '__hasard.calendrier(__v.S, __v.v, __v.D)'));
    const col = MENTALITES.map(([n]) => n);
    const ligne = (titre, fn, cible) => [titre, ...col.map((n) => fn(CAL[n])), cible];
    tableau(log, ['(1 jour sur N)', ...col, 'cible'], [
      ligne('nuit noire (avec imprévues)', (R) => unSur(R.nn, R.jours), '1/8 à 1/12'),
      ligne('  dont imprévues', (R) => unSur(R.nnImp, R.jours), ''),
      ligne('soleil écrasant', (R) => unSur(R.sol, R.jours), '1/20 à 1/30'),
      ligne('neige partout', (R) => unSur(R.neige, R.jours), '1/25 à 1/45'),
      ligne('tornade', (R) => unSur(R.torn, R.jours), '1/36 à 1/60'),
      ligne('tueur errant', (R) => unSur(R.tu, R.jours), '1/24 à 1/48'),
      ligne('prodiges (par semaine)', (R) => parSem(Object.values(R.prod).reduce((a, b) => a + b, 0), R.jours), 'quelques'),
      ligne('Durn se lève (séisme)', (R) => unSur(R.durn, R.jours), 'une fois dans une vie'),
    ]);
    const O = CAL.ordinaire, TB = CAL['très basse'], HA = CAL.haute;
    log(`  tornade : écart moyen ${f1(moy(O.tornEcart))} j, au moins ${Math.min(...O.tornEcart)} ; première le jour ${O.tornPrem} au plus tôt`);
    log(`  tueur : écart moyen ${f1(moy(O.tuEcart))} j (esprit haut ${f1(moy(HA.tuEcart))}, très bas ${f1(moy(TB.tuEcart))}), au moins ${Math.min(...O.tuEcart, ...TB.tuEcart)} ; premier passage le jour ${Math.min(O.tuPrem, TB.tuPrem)} au plus tôt`);
    const prodTot = Object.values(O.prod).reduce((a, b) => a + b, 0);
    log('  prodiges (esprit ordinaire, par semaine) : ' + Object.entries(O.prod).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${parSem(n, O.jours)}`).join(', '));
    verif(O.nn / O.jours >= 1 / 12 && O.nn / O.jours <= 1 / 8, `nuit noire, esprit ordinaire : ${unSur(O.nn, O.jours)} nuits (cible 1/8 à 1/12)`);
    verif(MENTALITES.every(([n]) => CAL[n].nnPrem >= 4 && CAL[n].avant4 === 0 && CAL[n].nnSuite === 0), 'pas de nuit noire avant le quatrième soir, jamais deux de suite (prévues ou imprévues)');
    verif(O.sol / O.jours >= 1 / 30 && O.sol / O.jours <= 1 / 20, `soleil écrasant : ${unSur(O.sol, O.jours)} jours (cible 1/20 à 1/30)`);
    verif(O.torn / O.jours >= 1 / 60 && O.torn / O.jours <= 1 / 36 && Math.min(...O.tornEcart) >= 12 && O.tornPrem >= 6, `tornade : ${unSur(O.torn, O.jours)} jours, jamais deux en douze jours, pas avant le sixième (cible : une toutes les 3 à 5 semaines)`);
    verif(O.tu / O.jours >= 1 / 48 && O.tu / O.jours <= 1 / 24, `tueur errant, esprit ordinaire : ${unSur(O.tu, O.jours)} jours (cible : un passage toutes les 2 à 4 semaines)`);
    verif(MENTALITES.every(([n]) => CAL[n].tuPrem >= 13 && (!CAL[n].tuEcart.length || Math.min(...CAL[n].tuEcart) >= 20)), 'tueur errant : jamais la première semaine (jour 13 au plus tôt), jamais deux passages en vingt jours');
    verif(TB.tu >= O.tu && O.tu >= HA.tu, `tueur errant : plus fréquent quand l'esprit s'assombrit (très bas ${unSur(TB.tu, TB.jours)}, ordinaire ${unSur(O.tu, O.jours)}, haut ${unSur(HA.tu, HA.jours)})`);
    verif(prodTot / O.jours * 12 >= 1.5 && prodTot / O.jours * 12 <= 4 && MENTALITES.every(([n]) => CAL[n].prodEtrangeAvant4 === 0), `prodiges : ${parSem(prodTot, O.jours)} par semaine (esprit ordinaire, cible 1,5 à 4), aucun prodige étrange avant le quatrième jour`);
    verif(TB.durn <= SEEDS && O.durn <= SEEDS, `Durn ne se lève qu'une fois dans une vie (${TB.durn} fois en ${SEEDS} parties, esprit très bas)`);

    // ============================================================ 3. la météo de base
    {
      const cnt = J.avec({ S: SEEDS }, `(() => { const c = { orage: 0, canicule: 0, pluie: 0, gel: 0, brouillard: 0, n: 0 }; for (let s = 1; s <= __v.S; s++) for (let d = 2; d <= 145; d++) { const P = EV_PLAN0(s, d); c.n++; if (P.storm) c.orage++; if (P.heat) c.canicule++; if (P.rain) c.pluie++; if (P.frost) c.gel++; if (P.kind === 'brouillard') c.brouillard++; } return JSON.stringify(c); })()`);
      const C = JSON.parse(cnt);
      log(`\n3. La météo (10-weather.js, dayPlan, avant neige et soleil écrasant) : pluie ${f1(C.pluie / C.n * 100)} % des jours, orage ${f1(C.orage / C.n * 100)} %, canicule ${f1(C.canicule / C.n * 100)} %, gel au matin ${f1(C.gel / C.n * 100)} %, brouillard ${f1(C.brouillard / C.n * 100)} % ; en montagne, la pluie tombe en neige (11-zzvallee.js)`);
    }

    // ============================================================ 4. l'étrange
    log('\n4. L\'étrange (11-strange.js, 11-zzstrange-more.js ; l\'esprit : 11-zzz60-esprit.js) : strange.newDay, tel quel');
    const ET = {};
    for (const [nom, v] of MENTALITES) ET[nom] = JSON.parse(J.avec({ S: SEEDS, v, D: JOURS }, '__hasard.etrange(__v.S, __v.v, __v.D)'));
    const med = (a) => { const b = a.slice().sort((x, y) => x - y); return b[b.length >> 1]; };
    tableau(log, ['', ...col, 'cible'], [
      ['nuit rouge (après la 1re semaine)', ...col.map((n) => unSur(ET[n].rouges, ET[n].nuitsApres)), '1/9 à 1/16 (ordinaire)'],
      ['première nuit rouge, au plus tôt', ...col.map((n) => 'jour ' + ET[n].rougePrem), 'jour 5'],
      ['événements étranges / semaine (sem. 2 à 7)', ...col.map((n) => parSem(ET[n].ev, ET[n].joursEv)), '2 à 6 (ordinaire)'],
      ['niveau 2, au plus tôt', ...col.map((n) => 'jour ' + ET[n].lvl2Prem), 'jour 4 et après'],
      ['niveau 3, au plus tôt', ...col.map((n) => 'jour ' + ET[n].lvl3Prem), ''],
      ['carnet des étrangetés vu à 90 % (médiane)', ...col.map((n) => { const m = med(ET[n].epuise); return m >= 999 ? `> ${JOURS / 12} sem.` : f1(m / 12) + ' sem.'; }), 'des mois'],
      ['victimes du tueur masqué (sans enquête)', ...col.map((n) => f2(ET[n].victimes / SEEDS)), ''],
      ['  sa première, jour (médiane)', ...col.map((n) => String(med(ET[n].victimeJour))), ''],
    ]);
    const EO = ET.ordinaire, ETB = ET['très basse'];
    verif(EO.rouges / EO.nuitsApres <= 1 / 9 && EO.rouges / EO.nuitsApres >= 1 / 16, `nuits rouges, esprit ordinaire : ${unSur(EO.rouges, EO.nuitsApres)} nuits (cible 1/9 à 1/16)`);
    verif(ETB.rouges / ETB.nuitsApres <= 1 / 3 && ETB.rouges > EO.rouges && EO.rouges > ET.haute.rouges, `nuits rouges : plus fréquentes à l'esprit sombre, jamais plus d'une nuit sur trois (très bas ${unSur(ETB.rouges, ETB.nuitsApres)})`);
    verif(MENTALITES.every(([n]) => ET[n].rougePrem >= 5 && ET[n].rougeNoire === 0), 'pas de nuit rouge avant le cinquième soir, jamais une nuit noire');
    verif(EO.ev / EO.joursEv * 12 >= 2 && EO.ev / EO.joursEv * 12 <= 6 && ETB.ev / ETB.joursEv * 12 <= 12, `événements étranges : ${parSem(EO.ev, EO.joursEv)} par semaine (esprit ordinaire, cible 2 à 6), ${parSem(ETB.ev, ETB.joursEv)} au plus bas (≤ 12)`);
    verif(MENTALITES.every(([n]) => ET[n].lvl2Prem >= 4), 'pas de grande bizarrerie (niveau 2 ou 3) les trois premiers jours');

    // ============================================================ 5. les nuits du joueur typique
    log('\n5. Les nuits du joueur « typique » (' + HABITUDES.map((h) => `${Math.round(h.p * 100)} % ${h.nom}`).join(', ') + ` ; dehors ${DEHORS * 100} %, près du lavoir ${LAVOIR * 100} % du temps dehors)`);
    const NU = {}, NUsans = {};
    for (const [nom, v] of MENTALITES) {
      NU[nom] = JSON.parse(J.avec({ S: SEEDS, v, D: JOURS }, '__hasard.nuits(__v.S, __v.v, __v.D, true)'));
      NUsans[nom] = JSON.parse(J.avec({ S: SEEDS, v, D: JOURS }, '__hasard.nuits(__v.S, __v.v, __v.D, false)'));
    }
    // contacts d'un dieu sur les douze premières semaines : ses rêves, et ses venues (Durn : au séisme, voir 2.)
    const contacts12 = (n, q) => NU[n].reves12[q] + (q === 'aela' ? NU[n].aela12 : q === 'vesh' ? NU[n].vesh12 : CAL[n].durn12);
    tableau(log, ['(1 nuit sur N)', ...col, 'cible'], [
      ['lavandière', ...col.map((n) => unSur(NU[n].lav, NU[n].jours)), '1/24 à 1/42 (ordinaire)'],
      ['cauchemar (tueur masqué en liberté)', ...col.map((n) => unSur(NU[n].cauch, NU[n].sommeils)), ''],
      ['cauchemar (tueur masqué pris)', ...col.map((n) => unSur(NUsans[n].cauch, NUsans[n].sommeils)), ''],
      ['cauchemar (moyenne des deux)', ...col.map((n) => unSur(NU[n].cauch + NUsans[n].cauch, NU[n].sommeils + NUsans[n].sommeils)), '1/25 à 1/45 (ordinaire)'],
      ['marchand de joie (par semaine)', ...col.map((n) => parSem(NU[n].marchand, NU[n].jours)), '≈ 1 (ordinaire)'],
    ]);
    log('  Les Trois, contacts sur les douze premières semaines (rêves + venues), par dieu :');
    tableau(log, ['', ...col, 'cible'], ['aela', 'durn', 'vesh'].map((q) => [q, ...col.map((n) => f2(contacts12(n, q) / SEEDS)), '1 à 2 (ordinaire)']));
    log(`  venues sur le monde en ${JOURS / 12} semaines (parties sur ${SEEDS}) : Aëla à l'aube ${MENTALITES.map(([n]) => NU[n].aela).join('/')}, Vesh les nuits noires ${MENTALITES.map(([n]) => NU[n].vesh).join('/')}, Durn au séisme ${MENTALITES.map(([n]) => CAL[n].durn).join('/')}`);
    const NO = NU.ordinaire, NTB = NU['très basse'];
    const lavO = NO.lav / NO.jours;
    verif(lavO >= 1 / 42 && lavO <= 1 / 24, `lavandière, esprit ordinaire : ${unSur(NO.lav, NO.jours)} nuits (cible : une fois toutes les 2 à 3,5 semaines)`);
    verif(NTB.lav > NO.lav && NO.lav > NU.haute.lav && Math.min(NTB.lavMin, NO.lavMin) >= 4, `lavandière : plus souvent à l'esprit sombre (${unSur(NTB.lav, NTB.jours)}), jamais deux fois en moins de quatre jours`);
    const cO = (NO.cauch + NUsans.ordinaire.cauch) / (NO.sommeils + NUsans.ordinaire.sommeils);
    verif(cO >= 1 / 45 && cO <= 1 / 25, `cauchemar, esprit ordinaire : 1 nuit sur ${f1(1 / cO)} (cible 1/25 à 1/45 ; tueur masqué en liberté : ${unSur(NO.cauch, NO.sommeils)}, pris : ${unSur(NUsans.ordinaire.cauch, NUsans.ordinaire.sommeils)})`);
    verif(NTB.cauch / NTB.sommeils > cO && NTB.cauch / NTB.sommeils <= 1 / 4 && Math.min(NTB.cauchEcartMin, NO.cauchEcartMin) >= 3, `cauchemar : plus fréquent à l'esprit sombre (${unSur(NTB.cauch, NTB.sommeils)}), jamais deux en trois nuits`);
    const contacts = ['aela', 'durn', 'vesh'].map((q) => contacts12('ordinaire', q) / SEEDS);
    verif(contacts.every((c) => c >= 0.9 && c <= 2.1), `les Trois, esprit ordinaire : ${contacts.map(f2).join(' / ')} contacts chacun en douze semaines (cible : un toutes les 6 à 12 semaines)`);
    verif(NTB.aela <= SEEDS && NTB.vesh <= SEEDS, 'Aëla et Vesh ne viennent sur le monde qu\'une fois dans une vie');
    const venues = [NO.aela, NO.vesh, CAL.ordinaire.durn].map((n) => n / SEEDS);
    verif(venues.every((x) => x <= 0.4), `venues sur le monde, très très rares : en ${JOURS / 12} semaines, Aëla / Vesh / Durn dans ${venues.map((x) => Math.round(x * 100) + ' %').join(' / ')} des parties (esprit ordinaire, au plus 40 %)`);
    const mO = NO.marchand / NO.jours * 12;
    verif(mO >= 0.5 && mO <= 1.8 && MENTALITES.every(([n]) => NU[n].marchandAvant4 === 0), `marchand de joie : ${f2(mO)} soir par semaine (esprit ordinaire), jamais avant le quatrième jour`);
    const PS = JSON.parse(J.avec({ S: Math.min(SEEDS, 100), D: 120 }, '__hasard.pilulesSol(__v.S, __v.D)'));
    log(`  pilules tombées au bord des chemins : ${f2(PS.n / PS.jours * 12)} par semaine dans la vallée (pilules.nouveauJour ; plus les fouilles, caisses et coffres)`);

    // ============================================================ 6. colporteurs
    {
      const T = JSON.parse(J.ev(`JSON.stringify({ cles: SEMAINE.map((j) => j.cle), t: TOURNEES })`));
      const ferme = Object.keys(T.t).map((id) => [id, T.cles.filter((k) => T.t[id][k] === 'lieu:ferme').length]);
      log(`\n6. Les marchands ambulants (11-zzz52-routines.js, TOURNEES) : ${ferme.map(([id, n]) => `${id} ${n} jour(s) par semaine à la ferme`).join(', ')} ; ailleurs, un village ou un lieu-dit chaque jour`);
      const tot = ferme.reduce((a, [, n]) => a + n, 0);
      verif(tot >= 1 && tot <= 2 && T.cles.length === 12, `${tot} passages de colporteurs par semaine à la ferme (cible 1 à 2)`);
    }

    // ============================================================ 7. Slender et Fondation : sur toutes les graines d'une partie neuve
    {
      const t0 = Date.now();
      for (const s of [0, 1, 2, 12345, 424242, 999999999]) {
        if ((mul32(((s | 0) ^ 0x51e4d) >>> 0) < 1 / 500) !== J.avec({ s }, 'slender.tirage(__v.s)')) throw new Error('slender.tirage a changé : mettre à jour la recopie');
        if ((mul32(((s | 0) ^ 0x5cf0) >>> 0) < 1 / 120) !== J.avec({ s }, 'fondation.tirage(__v.s)')) throw new Error('fondation.tirage a changé : mettre à jour la recopie');
      }
      const N = 1e9; // farm.start : graine = (Math.random() * 1e9) | 0
      let a = 0, b = 0;
      for (let s = 0; s < N; s++) { if (mul32((s ^ 0x51e4d) >>> 0) < 0.002) a++; if (mul32((s ^ 0x5cf0) >>> 0) < 1 / 120) b++; }
      log(`\n7. Slender et Fondation, sur les ${N.toExponential(0)} graines possibles d'une partie neuve (${((Date.now() - t0) / 1000).toFixed(1)} s) : Slender ${a} → 1 partie sur ${f2(N / a)} ; Fondation ${b} → 1 partie sur ${f2(N / b)}`);
      log('  (le tirage ne dépend que de la graine : ni l\'esprit ni le jour n\'y changent rien ; l\'écart résiduel vient du premier nombre de mulberry32. La Fondation est décidée à la génération de la vallée : changer le tirage déplacerait des objets de parties sauvegardées)');
      verif(Math.abs(N / a / 500 - 1) < 0.005 && Math.abs(N / b / 120 - 1) < 0.005, 'une partie sur 500 pour le Slender, une sur 120 pour la Fondation (à 0,5 % près)');
      const pur = J.ev(`(() => { const a = slender.tirage(4242), b = fondation.tirage(4242); farm.s = farm.blank(4242); farm.s.esprit = 0; return a === slender.tirage(4242) && b === fondation.tirage(4242); })()`);
      verif(pur, 'le tirage du Slender et de la Fondation ne dépend que de la graine');
    }

    // ============================================================ 8. les poissons
    {
      const FISH = JSON.parse(J.ev('JSON.stringify(FISH)'));
      // tirage d'une prise (11-farm-play.js, play.catchFish) : parmi les poissons de l'eau et de l'heure, au poids w
      // (×3 pour les poissons de pluie par temps mouillé) ; 5 % de fibre, 4 % de coffre, 1,5 % de perle au grand lac
      const zones = [...new Set(Object.values(FISH).flatMap((q) => q.where))];
      const meilleure = {};
      for (const z of zones) for (const nuit of [false, true]) {
        const cand = Object.keys(FISH).filter((k) => FISH[k].where.includes(z) && !(FISH[k].time === 'jour' && nuit) && !(FISH[k].time === 'nuit' && !nuit));
        const tot = cand.reduce((a, k) => a + FISH[k].w, 0), pf = 1 - 0.05 - 0.04 - (z === 'lac' ? 0.015 : 0);
        for (const k of cand) { const p = FISH[k].w / tot * pf; if (!meilleure[k] || p > meilleure[k].p) meilleure[k] = { p, z, nuit }; }
      }
      const rang = (w) => (w >= 4 ? 'commun' : w >= 2 ? 'courant' : w >= 0.5 ? 'rare' : w >= 0.1 ? 'très rare' : 'légende');
      const rares = Object.keys(FISH).filter((k) => FISH[k].w < 0.5).sort((a, b) => meilleure[a].p - meilleure[b].p);
      log('\n8. Les poissons (FISH…w, 05-*.js ; tirage : play.catchFish) : au mieux (bonne eau, bonne heure, canne ordinaire), une prise sur N');
      tableau(log, ['poisson', 'w', 'rang', 'au mieux', 'où, quand'], rares.map((k) => [k, FISH[k].w, rang(FISH[k].w), '1/' + Math.round(1 / meilleure[k].p), `${meilleure[k].z}, ${meilleure[k].nuit ? 'nuit' : 'jour'}${FISH[k].moon ? ' (nuit rouge ou jour multiple de 7)' : ''}`]));
      verif(Object.keys(FISH).every((k) => meilleure[k]), 'chaque poisson se pêche quelque part, à une heure au moins');
      const leg = Object.keys(FISH).filter((k) => FISH[k].w < 0.1);
      verif(leg.every((k) => meilleure[k].p <= 1 / 60 && meilleure[k].p >= 1 / 800), `poissons de légende (w < 0,1) : une prise sur 60 à 800 au mieux (${leg.map((k) => k + ' 1/' + Math.round(1 / meilleure[k].p)).join(', ')})`);
      verif(rares.every((k) => meilleure[k].p <= 1 / 40), 'poissons très rares (w < 0,5) : jamais mieux qu\'une prise sur quarante');
    }

    // ============================================================ 8 bis. les merveilles trouvées au hasard (11-zzz80-legendaires.js)
    {
      const fs = require('fs'), path = require('path');
      const T = fs.readFileSync(path.join(__dirname, '..', '..', 'src', '11-zzz80-legendaires.js'), 'utf8');
      const nb = (re, i = 1) => { const m = T.match(re); return m ? +m[i] : NaN; };
      const canne = [nb(/known \? ([\d.]+) : ([\d.]+)\) \* bizarrerie/, 2), nb(/known \? ([\d.]+) : ([\d.]+)\) \* bizarrerie/, 1)];
      const cle = [nb(/mot \? ([\d.]+) : ([\d.]+)\) \* bizarrerie/, 2), nb(/mot \? ([\d.]+) : ([\d.]+)\) \* bizarrerie/, 1)];
      const livre = nb(/'livre_sans_fin', ([\d.]+)/), bourse = nb(/'bourse_vesh', ([\d.]+)/), arc = nb(/donArc[^\n]*Math\.random\(\) < ([\d.]+) \* bizarrerie/);
      const b1 = B.ordinaire, b5 = B['très basse'];
      log('\n8 bis. Les merveilles trouvées au hasard (11-zzz80-legendaires.js ; les autres attendent à leur place, ou au bout d\'une quête)');
      log(`  canne de la Dame : une prise de nuit au grand lac sur ${Math.round(1 / (canne[0] * b1))} (sur ${Math.round(1 / (canne[1] * b1))} si l'on connaît la légende ; esprit très bas : ${Math.round(1 / (canne[0] * b5))} / ${Math.round(1 / (canne[1] * b5))})`);
      log(`  Kel, la clé des Aëlim : une touche sous la glace sur ${Math.round(1 / (cle[0] * b1))} (sur ${Math.round(1 / (cle[1] * b1))} avec les mots) ; Livre sans fin : ${Math.round(livre * 100)} % du coffre des archives ; bourse de Vesh : ${Math.round(bourse * b1 * 100)} % d'un butin de l'Envers (${Math.round(bourse * b5 * 100)} % esprit très bas) ; arc du Cerf blanc : ${Math.round(arc * b1 * 100)} % par matin, une fois honoré le Cerf`);
      verif([...canne, ...cle, livre, bourse, arc].every((x) => Number.isFinite(x) && x > 0 && x <= 1) && canne[0] * b5 < 0.05 && cle[0] * b5 < 0.1, 'merveilles : la canne et la clé restent rares, même à l\'esprit sombre (moins d\'une prise sur vingt, d\'une touche sur dix)');
      log('  Bêtes : leur nombre et leurs milieux sont tirés à la génération de la vallée (on n\'y touche pas : sauvegardes). En cours de partie n\'apparaissent que celles des événements mesurés ici (grenouilles tombées du ciel, corbeaux de l\'étrange), les poulains des chevaux sauvages, les proies des pièges, et les bêtes des autres mondes à chaque visite.');
    }

    // ============================================================ 9. les malédictions : jamais par accident
    {
      log('\n9. Les malédictions (11-zzz42-maledictions.js) : ce qui les déclenche');
      const fs = require('fs'), path = require('path');
      const src = path.join(__dirname, '..', '..', 'src');
      const sites = [];
      for (const fn of fs.readdirSync(src).filter((x) => /^\d\d-.*\.js$/.test(x) && !x.startsWith('14-'))) {
        fs.readFileSync(path.join(src, fn), 'utf8').split('\n').forEach((l, i) => { if (/malediction\.frapper\(/.test(l) && !/^\s*\/\//.test(l)) sites.push({ fn, i: i + 1, l }); });
      }
      for (const S of sites) log(`  ${S.fn}:${S.i}  ${S.l.trim().slice(0, 150)}`);
      verif(sites.length > 0 && sites.every((S) => !/Math\.random\(\)|rnd\(\)/.test(S.l)), `${sites.length} déclencheurs, tous au bout d'un acte du joueur (aucun tirage au sort)`);
      // un cygne de la Dame tué par le fusil d'un habitant, tout près : pas de malédiction ; de notre main : oui
      const r = J.ev(`(() => {
        __hasard.neuf(77, 70);
        const p0 = game.player; game.player = { pos: [0, 0, 0] };
        const cygne = () => ({ kind: 'swan', cfg: CREATURES.swan, hp: 1, x: 6, z: 0, dead: false });
        try {
          chasse._src = { id: 'chasseur' };
          entities.damage(cygne(), 50, 10, 0);
          chasse._src = null;
          const parHabitant = malediction.a();
          entities.damage(cygne(), 50, 0, 0);
          return JSON.stringify({ parHabitant, parJoueur: malediction.a('malchance') });
        } finally { chasse._src = null; game.player = p0; }
      })()`);
      const M = JSON.parse(r);
      verif(!M.parHabitant && M.parJoueur, `un cygne de la Dame abattu par un chasseur ne maudit pas le joueur (${M.parHabitant ? 'maudit' : 'rien'}) ; de sa main, si (${M.parJoueur ? 'maudit' : 'rien'})`);
    }

    // ============================================================ 10. le temps : tirages par heure de jeu, pas par image
    {
      log('\n10. Tirages au fil du temps : par heure de jeu (hasardHeure), jamais par image');
      const h = J.ev(`(() => { const w0 = game.world, m0 = game.mode; game.world = { dayLength: JOUR_SECONDES }; game.mode = 'play'; try { return JSON.stringify({ une: hasardHeure(1, JOUR_SECONDES / 24), pause: (game.mode = 'menu', hasardHeure(1, 50)) }); } finally { game.mode = m0; game.world = w0; } })()`);
      const H = JSON.parse(h);
      verif(Math.abs(H.une - (1 - Math.exp(-1))) < 1e-9 && H.pause === 0, `hasardHeure(1 par heure, ${JS / 24} s) = ${f2(H.une)} (1 − e⁻¹ : une heure de jeu) ; en pause : ${H.pause}`);
      const usages = J.ev(`JSON.stringify({ lav: lavandiere.update.toString().includes('hasardHeure'), sl: slender.update.toString().includes('hasardHeure'), fo: fondation.update.toString().includes('hasardHeure'), pales: /dt/.test(strange.ensurePales.toString()) })`);
      const U = JSON.parse(usages);
      verif(U.lav && U.sl && U.fo && U.pales, 'lavandière, Slender, chercheurs de la Fondation : tirages par heure de jeu ; Pâles des nuits rouges : par seconde (dt)');
    }
    return { echecs };
  },
};
