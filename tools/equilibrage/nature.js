// Équilibrage — la NATURE (05-zzzz-nature.js, 11-zzzz8-nature.js) :
//   node tools/equilibrage.js nature
// 1. chaque plante donne son propre objet, qui a un effet (mangé cru ou cuit) et une place en alchimie ; les plantes
//    à faire nommer par l'alchimiste le restent ;
// 2. chaque essence d'arbre donne son bois, et tous les bois servent là où une recette demande « du bois » ;
// 3. les bêtes nouvelles ont chacune leur conduite, leur modèle, leurs points d'apparition et leur notice ;
// 4. le PAPILLON D'OR : sa fréquence, mesurée avec les règles du jeu (nature2.papillonPossible, nature2.chanceHeure)
//    sur le vrai programme météo (weather.dayPlan, avec les retouches des événements), pour des centaines de parties,
//    et ce qu'il rapporte, comparé au revenu d'une journée (commerce.js : début ≈ 375, milieu ≈ 1 500 pièces).
'use strict';

const SEEDS = +(process.env.NATURE_GRAINES || 300); // parties simulées par joueur
const JOURS = 240;                                   // vingt semaines de douze jours
const JOURNEE = { debut: 375, milieu: 1500 };        // revenu d'une journée (tools/equilibrage/commerce.js, couts)
// Les joueurs, de 9 h à 17 h (les heures du papillon) : la part des heures passées dehors (et pas sous un toit), et,
// dehors, la part passée dans ses milieux (les prés — la ferme en est —, la lande, les alpages ; pas la forêt, les
// berges, la ville ni les rochers). Une fois qu'il paraît (à quinze ou trente pas) : la chance de le prendre. Il faut
// un filet ; accroupi, un coup sur quatre manque, et il fuit qui s'approche debout ou vite ; après quatre frayeurs il
// s'en va pour de bon ; il vit trois à cinq minutes. Le joueur typique ne le voit pas toujours, ou n'a pas son filet.
const JOUEURS = [
  { nom: 'typique', dehors: 0.65, milieu: 0.7, prise: 0.45 },
  { nom: 'casanier', dehors: 0.35, milieu: 0.6, prise: 0.35 },
  { nom: 'chasseur de papillons', dehors: 0.95, milieu: 0.95, prise: 0.8 },
];

// ---------------------------------------------------------------- ce qui tourne DANS le jeu (machine virtuelle)
function installerDansLeJeu() {
  const N = {
    neuf(seed) {
      farm.s = farm.blank(seed);
      farm.s.esprit = 70; farm.s.hours = 6.5;
      evenements._plans.clear();
      const av = strange.applyVersion; strange.applyVersion = () => {};
      try { strange.init(farm.s); } finally { strange.applyVersion = av; }
    },
    // les plantes : ce que donne chaque plante sauvage, et ce que vaut l'objet
    plantes() {
      const drops = (L) => (L || []).map((d) => (Array.isArray(d) ? d[0] : d));
      const HORS = (i) => /^graines_|^sac_graines$|^fibre$|^foin$|^bois|^charbon$|^plume_noire$|^figurine$|^coeur_chene$/.test(i);
      const R = { objets: [], sansEffet: [], sansEssence: [], fleurGenerique: [], nouvelles: NAT_PLANTES.length, malFaites: [], allures: 0, alluresSans: [], vrai: 0 };
      const vus = new Set();
      for (const t of OBJ_TYPES) {
        const H = HARVEST[t.id];
        if (!H || !['Fleurs', 'Végétation', 'Champignons', 'Arbres'].includes(t.cat)) continue;
        const L = drops(H.drop).concat(H.fruit && typeof H.fruit[0] === 'string' ? [H.fruit[0]] : drops(H.fruit));
        if (L.includes('fleur')) R.fleurGenerique.push(t.id);
        for (const i of L) {
          if (!i || HORS(i) || vus.has(i) || !ITEMS[i]) continue;
          vus.add(i); R.objets.push(i);
          const I = ITEMS[i];
          if (!(ALIMENTS_EFFETS[i] || I.food || I.heal || I.panse)) R.sansEffet.push(i);
          if (!ESSENCES[i]) R.sansEssence.push(i);
        }
      }
      for (const P of NAT_PLANTES) {
        const H = HARVEST[P.o], I = ITEMS[P.it], t = OBJ_TYPES[OBJ_INDEX[P.o]];
        const ok = t && !t.hidden && H && drops(H.drop).includes(P.it) && I && I.name && I.desc && I.price >= 1 && I.price <= 30 && P.hab && P.hab.length;
        if (!ok) R.malFaites.push(P.o);
      }
      for (const k in PLANT_LOOK) { R.allures++; if (!ITEMS[k] || !ESSENCES[k]) R.alluresSans.push(k); }
      R.vrai = Object.keys(alchimie.VRAI || {}).length;
      R.nouvellesAllure = NAT_PLANTES.filter((P) => P.look).length;
      R.nouvellesNommables = NAT_PLANTES.filter((P) => P.look && alchimie.VRAI[P.it]).length;
      R.groupeFleur = (ITEM_GROUPS.fleur || []).length;
      return JSON.stringify(R);
    },
    // les bois : chaque arbre abattu donne le bois de son essence ; le groupe « bois » les accepte tous
    bois() {
      const R = { arbres: [], generique: [], sansBois: [], groupe: ITEM_GROUPS.bois.slice(), recettesBois: 0, recettes: {} };
      for (const t of OBJ_TYPES) {
        const H = HARVEST[t.id];
        if (!H || t.cat !== 'Arbres' || H.tool !== 'hache') continue;
        const L = (H.drop || []).map((d) => (Array.isArray(d) ? d[0] : d));
        R.arbres.push(t.id);
        if (L.includes('bois')) R.generique.push(t.id);
        if (!NAT_BOIS_DE[t.id] || !L.includes(NAT_BOIS_DE[t.id])) R.sansBois.push(t.id);
      }
      R.recettesBois = RECIPES.filter((r) => r.need && r.need.bois).length;
      for (const id of ['manche', 'arc_if', 'baton_houx', 'commode_noyer', 'armoire_chene', 'table_merisier', 'lit_noyer']) R.recettes[id] = RECIPES.some((r) => r.out === id);
      // une recette qui demande « du bois », avec seulement du bois d'if et de noyer dans la sacoche
      this.neuf(7);
      farm.s.inv = { bois_if: 3, bois_noyer: 4 };
      R.compte = farm.count('bois');
      R.pris = farm.take('bois', 5);
      R.reste = JSON.stringify(farm.s.inv);
      R.resteN = Object.values(farm.s.inv).reduce((a, b) => a + b, 0);
      return JSON.stringify(R);
    },
    // les bêtes nouvelles
    betes() {
      const R = { n: 0, manques: [] };
      for (const [k] of NAT_BETES) {
        if (k === 'papillon_or') continue;
        R.n++;
        const m = [];
        if (!CREATURES[k]) m.push('conduite');
        let rig = null; try { rig = ANIMAL_RIGS[CREATURES[k] && CREATURES[k].rig || k](); } catch (e) { rig = null; }
        if (!rig || !rig.parts || !rig.parts.length) m.push('modèle');
        if (OBJ_INDEX['nat_' + k] === undefined) m.push('apparition');
        if (!NOTICE_ANIMAUX[k]) m.push('notice');
        if (m.length) R.manques.push(k + ' : ' + m.join(', '));
      }
      return JSON.stringify(R);
    },
    // le papillon d'or : heure par heure, de 9 h à 17 h, sur le programme météo de chaque partie
    papillon(seeds, jours, J0) {
      const R = { jours: 0, vus: 0, ecarts: [], premiers: [], avant5: 0, ecartMin: 999, sans48: 0, parties: 0, heures: 0, heuresOk: 0, ciel: {} };
      for (let seed = 1; seed <= seeds; seed++) {
        this.neuf(seed);
        const rnd = mulberry32(seed * 7717 + 3);
        let dernier = -99, premier = 0;
        R.parties++;
        for (let d = 1; d <= jours; d++) {
          farm.s.day = d; R.jours++;
          const P = weather.dayPlan(seed, d);
          for (let h = 9; h < 17; h++) {
            const hm = h + 0.5;
            let st = P.plan[0][1];
            for (const [hr, x] of P.plan) if (hm >= hr) st = x;
            R.heures++; R.ciel[st] = (R.ciel[st] || 0) + 1;
            const m = rnd() < J0.dehors && rnd() < J0.milieu ? 'pres' : 'foret';
            if (!nature2.papillonPossible(d, hm, st, m, dernier)) continue;
            R.heuresOk++;
            if (rnd() >= nature2.chanceHeure()) continue;
            R.vus++;
            if (d < 5) R.avant5++;
            if (dernier > 0) { R.ecarts.push(d - dernier); R.ecartMin = Math.min(R.ecartMin, d - dernier); }
            if (!premier) { premier = d; R.premiers.push(d); }
            dernier = d;
            break; // (une fois vu, pas deux fois le même jour : six jours d'écart)
          }
        }
        if (!premier || premier > 48) R.sans48++;
      }
      return JSON.stringify(R);
    },
    marche() {
      const vend = [], achete = [];
      for (const d of NPC_DATA) if (d.shop) {
        for (const [k, p] of d.shop.sells || []) if (k === 'papillon_or' && p > 0) vend.push(d.id);
        for (const x of d.shop.buys || []) if ((Array.isArray(x) ? x[0] : x) === 'papillon_or') achete.push(d.id);
      }
      return JSON.stringify({ prix: ITEMS.papillon_or.price, cat: ITEMS.papillon_or.cat, vend, achete, filetColporteuse: typeof HOTTES !== 'undefined' && HOTTES.colporteuse.fonds.includes('filet_papillons'),
        filetRecettes: RECIPES.filter((r) => r.out === 'filet_papillons').length, prixFilet: ITEMS.filet_papillons.price, regles: PAPILLON });
    },
  };
  globalThis.__nature = N;
}

const f1 = (x) => (Math.round(x * 10) / 10).toLocaleString('fr-FR');
const f2 = (x) => (Math.round(x * 100) / 100).toLocaleString('fr-FR');
const pc = (a, b) => (b ? Math.round((100 * a) / b) : 0) + ' %';
const med = (L) => { if (!L.length) return 0; const s = L.slice().sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };

module.exports = {
  titre: 'Nature : plantes, bois, bêtes nouvelles, papillon d’or (fréquence et rapport)',
  JOUEURS,
  async verifier(J, log) {
    let echecs = 0;
    const verif = (ok, texte) => { if (!ok) echecs++; log(`  ${ok ? 'ok   ' : 'ÉCHEC'} ${texte}`); };
    J.ev(`(${installerDansLeJeu.toString()})()`);

    log('\n1. Les plantes');
    const P = JSON.parse(J.ev('__nature.plantes()'));
    log(`  ${P.objets.length} objets de plantes sauvages (fleurs, herbes, champignons, baies, fruits des arbres) ; ${P.nouvelles} plantes nouvelles`);
    verif(P.nouvelles >= 30 && !P.malFaites.length, `plantes nouvelles : ${P.nouvelles} (au moins 30), chacune son objet, son nom, sa notice, son prix (1 à 30), ses milieux` + (P.malFaites.length ? ' — mal faites : ' + P.malFaites.join(', ') : ''));
    verif(!P.fleurGenerique.length && P.groupeFleur > 20, `aucune plante ne donne plus la « fleur » d’avant ; le groupe « fleur (au choix) » en compte ${P.groupeFleur}` + (P.fleurGenerique.length ? ' — encore : ' + P.fleurGenerique.join(', ') : ''));
    verif(!P.sansEffet.length, 'chaque objet de plante a un effet, mangé cru ou cuit' + (P.sansEffet.length ? ' — sans : ' + P.sansEffet.join(', ') : ''));
    verif(!P.sansEssence.length, 'chaque objet de plante a sa place en alchimie (ses essences)' + (P.sansEssence.length ? ' — sans : ' + P.sansEssence.join(', ') : ''));
    verif(!P.alluresSans.length && P.vrai === P.allures && P.nouvellesNommables === P.nouvellesAllure, `l’alchimiste nomme les plantes inconnues : ${P.allures} allures, dont ${P.nouvellesAllure} des plantes nouvelles`);

    log('\n2. Les bois');
    const B = JSON.parse(J.ev('__nature.bois()'));
    verif(!B.generique.length && !B.sansBois.length, `${B.arbres.length} arbres, chacun donne le bois de son essence (${B.groupe.length - 1} bois)` + (B.generique.length ? ' — encore du « bois » : ' + B.generique.join(', ') : '') + (B.sansBois.length ? ' — sans bois : ' + B.sansBois.join(', ') : ''));
    verif(B.groupe[0] === 'bois' && B.compte === 7 && B.pris && B.resteN === 2, `« bois (au choix) » : ${B.recettesBois} recettes le demandent ; avec 3 bois d’if et 4 de noyer, on en compte ${B.compte}, on en prend 5, il reste ${B.reste}`);
    verif(Object.values(B.recettes).every(Boolean), 'les bois ont leurs recettes : ' + Object.keys(B.recettes).join(', '));

    log('\n3. Les bêtes nouvelles');
    const E = JSON.parse(J.ev('__nature.betes()'));
    verif(E.n >= 15 && !E.manques.length, `${E.n} bêtes nouvelles (au moins 15), chacune sa conduite, son modèle, ses points d’apparition, sa notice` + (E.manques.length ? ' — manque : ' + E.manques.join(' ; ') : ''));

    log('\n4. Le papillon d’or');
    const M = JSON.parse(J.ev('__nature.marche()'));
    const R0 = M.regles;
    log(`  règles (11-zzzz8-nature.js, PAPILLON) : de ${R0.h0} h à ${R0.h1} h, ${R0.milieux.join(', ')}, par beau temps (ni pluie, ni brouillard, ni gel, ni orage), jamais avant le jour ${R0.jour0} ni moins de ${R0.ecart} jours après le précédent ; ${f1(R0.heure * 100)} % par heure passée dehors dans ses milieux`);
    verif(M.prix === 2000 && !M.vend.length, `il se vend ${M.prix} pièces (${f1(M.prix / JOURNEE.debut)} journées du début, ${f1(M.prix / JOURNEE.milieu)} du milieu) ; personne n’en vend`);
    verif(M.filetColporteuse && M.filetRecettes >= 1 && M.prixFilet <= 80, `le filet : ${M.filetRecettes} recettes, et la colporteuse en vend (${M.prixFilet} pièces)`);
    log(`  ${SEEDS} parties de ${JOURS} jours par joueur ; heures de 9 h à 17 h :`);
    log('  joueur                     jours par papillon  premier (médiane)  sans papillon avant le jour 48  pièces par jour  part du revenu (milieu)');
    const RES = {};
    for (const J0 of JOUEURS) {
      const R = JSON.parse(J.ev(`__nature.papillon(${SEEDS}, ${JOURS}, ${JSON.stringify(J0)})`));
      RES[J0.nom] = R;
      const jpp = R.vus ? R.jours / R.vus : Infinity, gain = (R.vus / R.jours) * J0.prise * M.prix;
      R.jpp = jpp; R.gain = gain;
      log(`  ${J0.nom.padEnd(26)} ${f1(jpp).padStart(18)}  ${String(med(R.premiers)).padStart(17)}  ${pc(R.sans48, R.parties).padStart(30)}  ${f1(gain).padStart(15)}  ${pc(gain, JOURNEE.milieu).padStart(22)}`);
    }
    const T = RES.typique, C = RES['chasseur de papillons'], K = RES.casanier;
    log(`  (le ciel entre 9 h et 17 h : ${Object.entries(T.ciel).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${pc(n, T.heures)}`).join(', ')} ; heures où il peut paraître, joueur typique : ${pc(T.heuresOk, T.heures)})`);
    verif(T.avant5 === 0 && C.avant5 === 0 && T.ecartMin >= R0.ecart && C.ecartMin >= R0.ecart, `jamais avant le jour ${R0.jour0}, jamais deux fois en moins de ${R0.ecart} jours (écart le plus court : ${C.ecartMin} jours)`);
    verif(T.jpp >= 25 && T.jpp <= 90, `très rare : le joueur typique le voit une fois tous les ${f1(T.jpp)} jours (cible 25 à 90) ; ${pc(T.sans48, T.parties)} des parties sans papillon avant le jour 48`);
    verif(K.jpp > T.jpp && C.jpp < T.jpp && C.jpp >= 12, `qui le cherche le trouve plus souvent : ${f1(C.jpp)} jours (chasseur), ${f1(T.jpp)} (typique), ${f1(K.jpp)} (casanier)`);
    verif(T.gain <= 0.03 * JOURNEE.milieu && C.gain <= 0.1 * JOURNEE.milieu, `il ne fait pas une fortune : ${f1(T.gain)} pièces par jour pour le joueur typique (≤ 3 % d’une journée du milieu), ${f1(C.gain)} pour le chasseur (≤ 10 %)`);
    return { echecs };
  },
};
