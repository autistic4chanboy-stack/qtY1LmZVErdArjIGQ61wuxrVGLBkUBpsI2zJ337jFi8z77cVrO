// Équilibrage des trajets des habitants (agent Z, vague 14 : « refait aussi tout le math travel des PNJ »)
//   node tools/equilibrage.js Z
// Hors navigateur, sur la vallée de la graine 1234 (la vallée est dessinée : elle change peu d'une graine à l'autre) :
// - La carte des pas (src/11-zzzzZ-1-grille.js) : le temps d'un carreau de 16 m (ville, hameau, forêt) ;
// - Les places de chacun : de la porte de sa maison à SON LIT, à sa chaise ; de la porte de son ouvroir à son poste —
//   pour chaque habitant (05-npc-data.js et les habitants ajoutés), sur la carte des pas : tout doit se rejoindre ;
// - Le graphe des routes : chaque arête vue sur la carte des pas (ligne droite, détour, impossible) ; les nœuds tombés
//   dans un recoin (la margelle de la fontaine, une table) — le jeu les pose à côté, à la première occasion ;
// - La passe de génération (src/11-zzzzZ-0-passe.js) : plus aucune clôture dans une maison ; les objets, objets posés
//   et interactions des anciennes parties ne bougent pas (empreinte de la graine 1234).
// Les mesures « en marche » (une semaine simulée : coincés, murs traversés, eau, lits, temps, coût par image) se font
// dans le navigateur ($SP/agentZ/mesure.js) : voir README-Z / wiki-Z.
'use strict';
const { vallee, empreinte, EMPREINTE_1234 } = require('./vm.js');

const CIBLES = {
  carreauMs: 60,          // ms par carreau de 16 m (moyenne ; machine virtuelle chargée — le navigateur va bien plus vite : ~2 à 4 ms)
  placesKo: 0,            // lits, chaises, postes qu'on ne rejoint pas de sa porte
  aretesImpossibles: 80,  // arêtes du graphe qu'aucun détour ne permet (sur ~2 900) — le jeu les évite
  clotures: 0,            // blocs de clôture dans une maison, après la passe
  casesParChemin: 4000,   // cases ouvertes par A* (moyenne, de la porte au lit) : la mesure qui ne dépend pas de la machine
};

module.exports = {
  titre: 'Trajets des habitants (agent Z) : la carte des pas, les places de chacun, le graphe, la passe',
  CIBLES,
  async verifier(J, log) {
    const E = [];
    const t0 = Date.now();
    const w = await vallee(J, 1234);
    log(`(vallée 1234 générée en ${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    J.ctx.__w = w;
    const R = JSON.parse(J.ev(`(() => {
      const w = __w, G = zgrille, N = w.nav.nodes, out = {};
      G.reset(w);
      // 1. la carte des pas : le temps d'un carreau
      const zones = { ville: w.townInfo, hameau: w.lm.hameau, ferme: w.bld.ferme, foret: w.lm.hutte_ermite };
      out.carreaux = {};
      for (const k in zones) {
        const P = zones[k]; if (!P) continue;
        const tx0 = Math.floor(P.x / 16) - 2, tz0 = Math.floor(P.z / 16) - 2, t = Date.now();
        let n = 0; for (let a = 0; a < 5; a++) for (let b = 0; b < 5; b++) { G.construire(tx0 + a, tz0 + b, 0); n++; }
        out.carreaux[k] = (Date.now() - t) / n;
      }
      G.reset(w);
      // 2. les places de chacun
      out.places = []; out.placesKo = []; let nA = 0, msA = 0;
      for (const d of NPC_DATA) {
        const qui = { id: d.id, d }, B = w.bld[d.home], W = w.bld[d.work] || B;
        if (!B) { out.placesKo.push(d.id + ' : pas de maison (' + d.home + ')'); continue; }
        const lit = (B.spots && (B.spots['lit_' + d.id] || (d.id === 'fillette' && B.spots.bed2) || B.spots.bed));
        const pl = [['lit', B, lit], ['chaise', B, B.spots && (B.spots['assis_' + d.id] || B.spots.sit)], ['poste', W, W.spots && W.spots.work]];
        for (const [nom, BB, s] of pl) {
          if (!s) { if (nom === 'lit') out.placesKo.push(d.id + ' : pas de lit'); continue; }
          const O = N[BB.nOut], c = G.couche(s.x, s.y, s.z), t = Date.now();
          const p = G.chemin(O.x, O.z, s.x, s.z, c, { qui, marge: 12, max: 30000, yBut: s.y - 0.6, yDep: O.y });
          msA += Date.now() - t; nA++;
          const fin = p && p.length ? p[p.length - 1] : null, reste = fin ? Math.hypot(fin.x - s.x, fin.z - s.z) : -1;
          const appro = G.approche ? G.approche.d : 0;
          if (!p || reste > Math.max(1.3, appro + 0.3)) out.placesKo.push(d.id + ' : ' + nom + ' (' + BB.key + ') ' + (p ? 'au plus près à ' + reste.toFixed(1) + ' m' : 'pas de chemin'));
          else out.places.push([d.id, nom, p.length, appro]);
        }
      }
      out.astarMs = msA / Math.max(1, nA); out.nA = nA; out.expPlaces = G.stat.exp / Math.max(1, G.stat.astar);
      // 3. le graphe
      let vues = 0, droites = 0, detours = 0, impossibles = 0; const ko = [];
      for (const [a, b] of w.nav.edges) {
        const A = N[a], B = N[b];
        if (A.iso || B.iso || /:(in|mid)$/.test(A.tag) && /:(in|mid)$/.test(B.tag)) continue;
        if (Math.hypot(A.x - B.x, A.z - B.z) > 60 || /^(halle|village:)/.test(A.tag)) continue;
        vues++;
        if (G.vue(A.x, A.z, B.x, B.z, 0, { portes: true, depart: true })) { droites++; continue; }
        const p = G.chemin(A.x, A.z, B.x, B.z, 0, { portes: true, marge: 10, max: 30000 });
        if (p) detours++; else { impossibles++; if (ko.length < 12) ko.push(A.tag + ' → ' + B.tag + ' (' + Math.round(A.x) + ', ' + Math.round(A.z) + ')'); }
      }
      out.graphe = { vues, droites, detours, impossibles, ko };
      // les nœuds dans un recoin (posés à côté par le jeu)
      let recoins = 0; const rk = [];
      N.forEach((q, i) => { if (q.iso || /^(halle|village:)/.test(q.tag)) return; const gx = Math.floor(q.x / ZG_C), gz = Math.floor(q.z / ZG_C), k = G.lire(gx, gz, 0); if ((G.T.f[k] & ZG_BLOQ) || G.poche(gx, gz, 0)) { recoins++; if (rk.length < 10) rk.push(q.tag + ' (' + Math.round(q.x) + ', ' + Math.round(q.z) + ')'); } });
      out.recoins = { n: recoins, rk };
      // 4. la passe : plus de clôture dans une maison
      let cl = 0;
      for (const k in w.bld) {
        const B = w.bld[k]; if (!B.f || B.under || !B.W) continue;
        const f = B.f, hw = B.W / 2 - 0.35, hd = B.D / 2 - 0.35;
        for (const b of w.blocks) {
          if (Math.abs(b.x - f.x) > 30 || Math.abs(b.z - f.z) > 30 || b.hidden || b.y > f.y + 2.2 || b.y + b.sy < f.y + 0.3) continue;
          if ((b.m !== M_PLANKS && b.m !== M_LOGS) || Math.min(b.sx, b.sz) > 0.2) continue;
          const L = Math.max(b.sx, b.sz), al = b.sx >= b.sz ? [Math.cos(b.r), -Math.sin(b.r)] : [Math.sin(b.r), Math.cos(b.r)];
          for (let t = -0.5; t <= 0.5; t += 0.02) { const [lx, lz] = World.blockLocal({ x: f.x, z: f.z, r: f.r }, b.x + al[0] * L * t, b.z + al[1] * L * t); if (Math.abs(lx) < hw && Math.abs(lz) < hd) { cl++; break; } }
        }
      }
      out.clotures = cl; out.coupes = w.zClotures || 0;
      out.stat = G.stat;
      return JSON.stringify(out);
    })()`));
    log('\n# 1. La carte des pas (grille de 0,25 m, carreaux de 16 m)');
    log('Temps d’un carreau (ms, machine virtuelle) : ' + Object.entries(R.carreaux).map(([k, v]) => `${k} ${v.toFixed(1)}`).join(', ') + '.');
    const moyC = Object.values(R.carreaux).reduce((a, b) => a + b, 0) / Math.max(1, Object.keys(R.carreaux).length);
    if (moyC > CIBLES.carreauMs) E.push(`un carreau prend ${moyC.toFixed(1)} ms en moyenne (> ${CIBLES.carreauMs})`);
    log('\n# 2. Les places de chacun (de la porte au lit, à la chaise, au poste)');
    log(`${R.places.length} places rejointes sur ${R.places.length + R.placesKo.length} ; ${R.nA} chemins, ${R.astarMs.toFixed(1)} ms et ${Math.round(R.expPlaces)} cases ouvertes en moyenne.`);
    const lits = R.places.filter((p) => p[1] === 'lit');
    log(`Lits : ${lits.length} rejoints ; point d’approche (le côté libre) à ${(lits.reduce((a, p) => a + p[3], 0) / Math.max(1, lits.length)).toFixed(2)} m du lit en moyenne.`);
    for (const k of R.placesKo) log('  hors d’atteinte : ' + k);
    if (R.placesKo.length > CIBLES.placesKo) E.push(`${R.placesKo.length} places hors d’atteinte`);
    if (R.expPlaces > CIBLES.casesParChemin) E.push(`un chemin de la porte au lit ouvre ${Math.round(R.expPlaces)} cases (> ${CIBLES.casesParChemin})`);
    log('\n# 3. Le graphe des routes, vu sur la carte des pas');
    const Gr = R.graphe;
    log(`${Gr.vues} arêtes : ${Gr.droites} en ligne droite, ${Gr.detours} avec un détour (arbre, meuble, muret), ${Gr.impossibles} impossibles (le jeu les évite et passe par un autre nœud).`);
    if (Gr.ko.length) log('  Impossibles (extrait) : ' + Gr.ko.join(' ; '));
    if (Gr.impossibles > CIBLES.aretesImpossibles) E.push(`${Gr.impossibles} arêtes impossibles (> ${CIBLES.aretesImpossibles})`);
    log(`Nœuds tombés dans un recoin (margelle, table, enclos) : ${R.recoins.n} — le jeu les pose à côté.` + (R.recoins.rk.length ? ' ' + R.recoins.rk.join(', ') + '.' : ''));
    log('\n# 4. La passe de génération');
    log(`Clôtures raccourcies dans les maisons : ${R.coupes} bloc(s) ; il en reste ${R.clotures} dans une maison.`);
    if (R.clotures > CIBLES.clotures) E.push(`${R.clotures} blocs de clôture encore dans une maison`);
    const emp = empreinte(w, [98896, 1308, 516]);
    log(`Empreinte des anciennes parties (graine 1234) : ${emp === EMPREINTE_1234 ? 'inchangée' : 'CHANGÉE (' + emp + ')'}.`);
    if (emp !== EMPREINTE_1234) E.push('empreinte 1234 changée');
    log(`(A* : ${R.stat.astar} recherches, ${R.stat.exp} cases ouvertes, ${R.stat.echec} échecs)`);
    if (!E.length) log('\nToutes les mesures des trajets sont dans leurs bornes.');
    for (const e of E) log('  HORS BORNES : ' + e);
    return { echecs: E.length };
  },
};
