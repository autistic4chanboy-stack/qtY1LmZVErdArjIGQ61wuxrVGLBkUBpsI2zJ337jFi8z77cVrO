// Équilibrage — la CARTE : un lieu tous les deux cents mètres (agent C1).
//   node tools/equilibrage.js carte          (ou : node tools/equilibrage/carte.js)
// La vallée (3 072 m) est découpée en carrés de 200 m (16 × 16, les derniers rognés par le bord). Un carré est
// « accessible » s'il a au moins 4 000 m² de terre ferme joignable à pied depuis la ferme (pentes de 46° au plus,
// davantage sur un chemin ; l'eau se traverse à la nage) : ni eau profonde, ni paroi. Il est « pourvu » s'il porte au
// moins un lieu : lieu-dit de surface (pas une grande étendue comme le lac ou la forêt), bâtiment, ou interaction qui
// n'est pas une simple commodité (échelle, poteau indicateur, eau du puits…). Les lieux du catalogue (11-zzzz7-carte.js)
// comblent les carrés vides.
// Vérifie : aucun carré accessible vide ; les objets d'avant intacts (empreinte de la graine 1234) ; la variété du
// catalogue ; ce que rapportent les butins des lieux nouveaux (trésors d'une fois, et ce qui se regarnit), avec ceux
// d'avant (la « tournée » des coffres, comme tools/equilibrage/risques.js) ; ce que la génération ajoute (fluidité) ;
// les deux peuples (11-zzzz7-carte3-peuples.js) : leurs villages, les maisons reliées, leurs parlers qui ne se donnent pas.
'use strict';
const { vallee, empreinte, EMPREINTE_1234 } = require('./vm.js');

const ECHELLE = { debut: 300, milieu: 1200, tard: 3000 };
const r0 = (v) => Math.round(v);

module.exports = {
  titre: 'Carte : un lieu qui mérite le détour dans chaque carré de 200 m',
  async verifier(J, log) {
    let echecs = 0;
    const verif = (ok, msg) => { if (!ok) echecs++; log(`  ${ok ? 'ok ' : 'ÉCHEC'} ${msg}`); };
    const t0 = Date.now();
    const w = await vallee(J, 1234);
    log(`Vallée générée en ${((Date.now() - t0) / 1000).toFixed(1)} s : ${w.objects.length} objets, ${w.props.length} objets posés, ${w.inter.length} interactions, ${w.blocks.length} blocs, ${Object.keys(w.lm).length} lieux-dits.`);
    J.ctx.__w = w;
    const R = J.ev('carte2Carres(__w)');
    const C2 = w.carte2 || { lieux: [], n: {} };
    // ---------------------------------------------------------------- la grille
    const G = R.G, lignes = [];
    for (let gj = 0; gj < G; gj++) {
      let row = '';
      for (let gi = 0; gi < G; gi++) {
        const c = R.carres[gj * G + gi];
        const neuf = C2.lieux.some((L) => L.gi === gi && L.gj === gj);
        row += !c.acc ? ' ·' : !c.lieux.length ? ' _' : neuf ? ' ◆' : c.lieux.length > 9 ? ' #' : ' ' + c.lieux.length;
      }
      lignes.push(row);
    }
    log('\nLes carrés (· : inaccessible ; _ : VIDE ; ◆ : un lieu nouveau ; chiffre : les lieux d\'avant, # : dix et plus) :');
    for (const l of lignes) log('   ' + l);
    log(`${R.accessibles} carrés accessibles sur ${G * G} ; ${R.vides} vides${R.vides ? ' : ' + R.listeVides.map(([a, b]) => `(${a},${b})`).join(' ') : ''}.`);
    // ---------------------------------------------------------------- le catalogue
    const par = {};
    for (const L of C2.lieux) par[L.t] = (par[L.t] || 0) + 1;
    const types = J.ev('Object.keys(C2_TYPES)');
    log(`\n${C2.lieux.length} lieux nouveaux, ${Object.keys(par).length} sortes sur ${types.length} au catalogue :`);
    log('  ' + Object.keys(par).sort((a, b) => par[b] - par[a]).map((k) => `${k} ${par[k]}`).join(', '));
    const absents = types.filter((k) => !par[k]);
    if (absents.length) log(`  jamais posés : ${absents.join(', ')}`);
    const inter = w.inter.filter((it) => it.kind === 'c2');
    const sortes = {};
    for (const it of inter) sortes[it.data.a] = (sortes[it.data.a] || 0) + 1;
    const avecQuelqueChose = new Set(inter.filter((it) => ['butin', 'lettre', 'lire', 'cache', 'cloche', 'puits', 'pousser', 'cadran', 'registre', 'souffle', 'marques', 'lanterne', 'nouer', 'piece', 'boire', 'prier', 'creuser', 'dame'].includes(it.data.a) || it.data.pap).map((it) => it.data.l));
    for (const it of w.inter) if (it.kind === 'inscription' && /^ins_c2_/.test(it.id)) { const L = C2.lieux.find((q) => Math.hypot(q.x - it.x, q.z - it.z) < 12); if (L) avecQuelqueChose.add(L.i); }
    log(`  interactions : ${Object.keys(sortes).map((k) => `${k} ${sortes[k]}`).join(', ')} ; inscriptions nouvelles ${w.inter.filter((it) => it.kind === 'inscription' && /^ins_[ag]_c2/.test(it.id)).length}`);
    log(`  lettres posées : ${inter.filter((it) => it.data.pap).length} ; lieux qui portent quelque chose (butin, texte, lettre, mécanisme, secret) : ${avecQuelqueChose.size} / ${C2.lieux.length}`);
    // ---------------------------------------------------------------- les butins
    const ITEMS = J.ev('ITEMS'), LOOT = J.ev('LOOT'), RESTE = J.ev('typeof LOOT_RESTE !== "undefined" ? LOOT_RESTE : {}');
    const valeur = (id) => (id === 'argent' ? 1 : (ITEMS[id] && ITEMS[id].price) || 0);
    const esp = (key) => {
      const T = LOOT[key];
      if (!T) return 0;
      const it = T.items.filter((e) => e[3] > 0 && (e[0] === 'argent' || ITEMS[e[0]]));
      const W = it.reduce((a, e) => a + e[3], 0) || 1, nr = (T.rolls[0] + T.rolls[1]) / 2;
      return it.reduce((a, e) => a + nr * e[3] / W * (e[1] + e[2]) / 2 * valeur(e[0]), 0);
    };
    const butins = inter.filter((it) => it.data.a === 'butin' || it.data.a === 'cache' || it.data.a === 'creuser');
    let tresors = 0, jour = 0;
    const parTable = {};
    for (const it of butins) {
      const d = it.data, v = esp(d.table), P = parTable[d.table] || (parTable[d.table] = { n: 0, v, rf: d.rf || 0, un: !d.rf });
      P.n++;
      if (d.rf) jour += v / d.rf; else tresors += v;
    }
    log('\nButins des lieux nouveaux (espérance par ouverture) :');
    for (const k of Object.keys(parTable).sort()) { const P = parTable[k]; log(`  ${k.padEnd(18)} ×${String(P.n).padStart(3)}  ${String(r0(P.v)).padStart(4)} pièces  ${P.rf ? `se regarnit en ${P.rf} jours` : 'une seule fois'}`); }
    log(`Trésors d'une fois, tous : ${r0(tresors)} pièces (${(tresors / ECHELLE.milieu).toFixed(1)} jours de revenus du milieu de partie) ; ce qui se regarnit, en passant partout : ${r0(jour)} pièces par jour.`);
    // la tournée de tous les coffres d'avant (même calcul que risques.js) et des nôtres
    let avant = 0;
    for (const it of w.inter) {
      const d = it.data || {};
      if (it.kind !== 'loot' || d.temple || d.envers) continue;
      avant += (RESTE[d.table] ? esp(RESTE[d.table]) : esp(d.table)) / 3;
    }
    log(`Tournée de TOUS les coffres qui se regarnissent (ceux d'avant ${r0(avant)} + les nôtres ${r0(jour)}) : ${r0(avant + jour)} pièces par jour.`);
    // les lieux les plus riches (à moins de 40 m)
    const riches = [];
    for (const it of butins) if (it.data.rf) { const v = esp(it.data.table) / it.data.rf; const L = riches.find((q) => Math.hypot(q.x - it.x, q.z - it.z) < 40); if (L) L.v += v; else riches.push({ x: it.x, z: it.z, v }); }
    riches.sort((a, b) => b.v - a.v);
    // ---------------------------------------------------------------- les deux peuples (11-zzzz7-carte3-peuples.js)
    const PE = w.peuples || {}, NV = w.nav, habitants = J.ev('C2_HABITANTS.map((d) => [d.id, d.home, d.area])');
    const joint = (a, tag) => { const b = NV.nodes.findIndex((q) => q.tag === tag); if (a < 0 || b < 0) return false; const vu = new Set([a]), Q = [a]; while (Q.length) { const c = Q.shift(); if (c === b) return true; for (const e of NV.adj[c] || []) if (!vu.has(e.to)) { vu.add(e.to); Q.push(e.to); } } return false; };
    const logis = habitants.filter(([, home, area]) => w.bld[home] && joint(w.bld[home].nMid, 'village:' + area));
    const pn = PE.n || {};
    log(`\nLes deux peuples : les Planches ${PE.planches ? 'bâties' : 'ABSENTES'}, l'estive ${PE.estive ? 'bâtie' : 'ABSENTE'} ; ${logis.length} habitants sur ${habitants.length} ont leur maison reliée à leur village ; ${pn.blocs || 0} blocs, ${pn.props || 0} objets posés, ${pn.inter || 0} interactions, ${pn.objets || 0} objets.`);
    const PARL = J.ev('Object.fromEntries(Object.entries(C2_PARLERS).map(([k, v]) => [k, [Object.keys(v.mots).length, v.max]]))');
    const EXPL = J.ev('Object.entries(C2_EXPLIQUE).map(([id, c]) => [NPC_BY_ID[id].area, c[1]])');
    for (const k in PARL) log(`  ${k} : ${PARL[k][0]} mots ; au plus ${PARL[k][1]} expliqués (par ${EXPL.filter(([a]) => a === k).map(([, m]) => m).join(' + ')})`);
    // ---------------------------------------------------------------- ce que la génération ajoute
    const n0 = C2.n || {}, n = { blocs: (n0.blocs || 0) + (pn.blocs || 0), props: (n0.props || 0) + (pn.props || 0), inter: (n0.inter || 0) + (pn.inter || 0), objets: (n0.objets || 0) + (pn.objets || 0) };
    log(`\nCe que la génération ajoute (lieux et villages) : ${n.blocs} blocs, ${n.props} objets posés, ${n.inter} interactions, ${n.objets} objets (sprites), ${C2.lieux.length} lieux-dits.`);
    log(`  (une image : les blocs sont tous dessinés — ${w.blocks.length} ; les objets posés sont triés par distance quand on a fait trente pas — ${w.props.length} en tout ; les interactions sont parcourues pour la cible de la touche E — ${w.inter.length})`);
    // ---------------------------------------------------------------- les vérifications
    log('\n--- Vérifications');
    verif(empreinte(w, [98896, 1308, 516]) === EMPREINTE_1234, `les objets, objets posés et interactions d'avant ne bougent pas (empreinte ${empreinte(w, [98896, 1308, 516])})`);
    verif(R.vides === 0, `aucun carré accessible sans lieu (${R.vides} vide(s) sur ${R.accessibles})`);
    verif(!C2.reste, `chaque carré vide a trouvé sa place du premier coup ou au second (${C2.reste || 0} au second)`);
    verif(Object.keys(par).length >= 0.8 * types.length, `le catalogue est varié : ${Object.keys(par).length} sortes de lieux posées sur ${types.length}`);
    const maxPar = Math.max(...Object.values(par));
    verif(maxPar <= Math.max(12, 0.12 * C2.lieux.length), `aucune sorte ne domine (au plus ${maxPar} de la même)`);
    verif(avecQuelqueChose.size >= 0.7 * C2.lieux.length, `la plupart des lieux portent quelque chose (${avecQuelqueChose.size} sur ${C2.lieux.length})`);
    verif(tresors <= 8 * ECHELLE.milieu, `les trésors d'une fois récompensent l'exploration sans enrichir (${r0(tresors)} pièces pour toute la vallée, ≤ ${8 * ECHELLE.milieu})`);
    verif(jour <= 0.25 * ECHELLE.milieu, `ce qui se regarnit dans les lieux nouveaux rapporte moins du quart d'une journée du milieu (${r0(jour)} / jour)`);
    verif(avant + jour <= ECHELLE.milieu, `la tournée de tous les coffres reste sous une journée de travail du milieu (${r0(avant + jour)} / jour)`);
    verif(!riches.length || riches[0].v <= 0.15 * ECHELLE.milieu, `aucun lieu nouveau ne rapporte plus de 15 % d'une journée du milieu par jour (max ${riches.length ? r0(riches[0].v) : 0})`);
    verif(n.blocs <= 4500 && n.props <= 2500 && n.inter <= 1600, `la génération reste légère (${n.blocs} blocs ≤ 4 500, ${n.props} objets posés ≤ 2 500, ${n.inter} interactions ≤ 1 600)`);
    verif(!!(PE.planches && PE.estive) && logis.length === habitants.length, `les deux peuples ont leur village, et chaque habitant sa maison reliée aux chemins du village (${logis.length} / ${habitants.length})`);
    verif(Object.keys(PARL).every((k) => PARL[k][0] >= 8 && PARL[k][1] <= PARL[k][0] / 2 && EXPL.filter(([a]) => a === k).reduce((t, [, m]) => t + m, 0) >= PARL[k][1]), 'leurs parlers ne se donnent pas : la moitié des mots au plus se fait expliquer');
    return { echecs };
  },
};

// lancé seul : node tools/equilibrage/carte.js
if (require.main === module) {
  const { charger } = require('./vm.js');
  module.exports.verifier(charger(), (...a) => console.log(...a)).then((r) => { console.log(r.echecs ? `${r.echecs} échec(s)` : 'ok'); process.exit(r.echecs ? 1 : 0); });
}
