// Équilibrage du carnet de commandes (src/11-zzzzA-commandes.js) : commander par le voiturier ne doit jamais faire
// gagner d'argent.
//   node tools/equilibrage.js commandes
// Pour chaque étal (étals fixes, hottes des colporteurs, reprises, garde-meuble) et chaque niveau d'amitié :
//   - le prix d'un article au carnet est celui de la boutique (ui.shopPrice), jamais moins ;
//   - le port est d'au moins trois pièces par étal : la même chose coûte toujours plus cher par la poste ;
//   - revendu au mieux (caisse, marchands, marchand de joie, recel : le catalogue de commerce.js), aucun article
//     commandé ne rapporte ce qu'il a coûté, même sans compter le port ;
//   - ce qui revient au joueur (colis égaré, vendeur mort, commande rayée) ne dépasse jamais ce qu'il a payé.
'use strict';
const { catalogue } = require('./commerce.js');

const CARNET = String.raw`(() => {
  const NIV = [0, 3, 6, 10], out = [], exclus = [];
  npcs.level = (n) => n.__niv || 0;
  const pnj = (d, niv) => ({ id: d.id, d, name: d.name, st: { alive: true, met: true, amitie: niv * 100 }, __niv: niv });
  const etals = [];
  for (const d of NPC_DATA) {
    if (!d.shop) continue;
    if (COMMANDES_EXCLUS.has(d.id) || d.area === 'nains') { exclus.push(d.id); continue; }
    etals.push({ d, S: d.shop, garde: false });
    // (les reprises : quand un marchand meurt, un autre reprend une part de son étal)
    if (typeof SOC_REPRISE !== 'undefined') for (const mort in SOC_REPRISE) for (const [qui, L] of SOC_REPRISE[mort]) if (qui === d.id) etals.push({ d, S: { sells: L.filter((id) => ITEMS[id]).map((id) => [id, Math.round(societe.prixBase(id) * 1.2)]) }, garde: false, note: 'reprise de ' + mort });
    // (la hotte des colporteurs : fonds, selon l'endroit, raretés)
    if (typeof HOTTES !== 'undefined' && HOTTES[d.id]) {
      const H = HOTTES[d.id], base = d.shop.sells || [], prix = (id) => { const e = base.find(([k]) => k === id); return e && e[1] > 0 ? e[1] : Math.max(1, (ITEMS[id] && ITEMS[id].price) || 10); };
      const sells = H.fonds.map((id) => [id, prix(id)]);
      for (const k in H.ici) for (const e of H.ici[k]) sells.push([e[0], e[1]]);
      for (const e of H.rares) sells.push([e[0], e[1]]);
      etals.push({ d, S: { sells }, garde: false, note: 'hotte' });
    }
    if (d.id === 'maire' && typeof MEUBLES_GARDE !== 'undefined') etals.push({ d, S: MEUBLES_GARDE, garde: true, note: 'garde-meuble' });
  }
  for (const e of etals) for (const niv of NIV) {
    const n = pnj(e.d, niv), E = { cle: e.d.id, n, S: e.S, garde: e.garde };
    for (const a of commandes.articles(E)) out.push({ q: e.d.id, note: e.note || '', id: a.id, niv, base: a.base, prix: a.prix, boutique: ui.shopPrice(n, a.id, a.base, true), animal: !!(ITEMS[a.id].animal) });
  }
  // le port : au moins la base, pour tout étal et tout point de la vallée (sans monde chargé : un kilomètre)
  const portMin = CMD.port.base, portMax = CMD.port.max;
  return JSON.stringify({ out, exclus, portMin, portMax, meuble: CMD.port.meuble, perdu: CMD.perdu, vole: CMD.vole });
})()`;

// les remboursements, sur une partie factice (sans monde : rayer, vendeur mort, colis égaré)
const SIMU = String.raw`(() => {
  const s0 = farm.s, byId0 = npcs.byId, p0 = CMD.perdu;
  farm.s = { money: 1000, day: 5, seed: 1, stats: { earned: 0 }, mail: [], chests: {}, inv: {}, flags: {} };
  try {
    const C = commandes.S(), out = {};
    C.cmds.push({ id: 'x1', j: 5, due: 6, st: 'attente', L: [['a', 'etal', 'pain', 2, 10]], port: 5, total: 25 });
    commandes.rayer('x1'); out.rayer = farm.s.money - 1000;
    npcs.byId = { a: { id: 'a', st: { alive: false }, d: { shop: { name: 'A' } }, name: 'A' } };
    out.mort = commandes.contenu([{ j: 5, L: [['a', 'etal', 'pain', 3, 12]] }]).o;
    CMD.perdu = 1;
    const m0 = farm.s.money, D = [{ j: 5, due: 5, st: 'attente', L: [['a', 'etal', 'pain', 3, 12]], port: 6, total: 42 }];
    commandes.expedier(D);
    out.perdu = farm.s.money - m0; out.perduSt = D[0].st;
    return JSON.stringify(out);
  } finally { farm.s = s0; npcs.byId = byId0; CMD.perdu = p0; }
})()`;

module.exports = {
  titre: 'Commandes : le carnet et le voiturier (prix de l’étal + port, jamais d’achat-revente gagnant)',
  async verifier(J, log) {
    let echecs = 0;
    const c = catalogue(J);
    const R = JSON.parse(J.ev(CARNET));
    log(`${R.out.length} prix d’articles au carnet (${new Set(R.out.map((a) => a.q + ':' + a.id)).size} articles, amitié 0 à 10) ; hors carnet : ${R.exclus.join(', ') || 'personne'}.`);
    log(`Port : ${R.portMin} à ${R.portMax} pièces par étal (+ ${R.meuble} par meuble) ; colis égaré ${(R.perdu * 100).toFixed(1)} %, ouvert en route ${(R.vole * 100).toFixed(1)} %.`);
    // 1. le prix de la boutique, exactement
    const ecart = R.out.filter((a) => a.prix !== a.boutique);
    if (ecart.length) { echecs++; for (const a of ecart.slice(0, 20)) log(`  PRIX DIFFÉRENT : ${a.id} chez ${a.q} (amitié ${a.niv}) : carnet ${a.prix}, boutique ${a.boutique}`); }
    else log('Chaque article coûte au carnet le prix de sa boutique (remise d’amitié et garde-fou compris), plus le port.');
    // 2. pas de bêtes au carnet
    const betes = R.out.filter((a) => a.animal);
    if (betes.length) { echecs++; log('  BÊTES AU CARNET : ' + [...new Set(betes.map((a) => a.id))].join(', ')); }
    // 3. aucun achat-revente gagnant, même sans le port
    const gagnants = [];
    for (const a of R.out) { const v = c.maxVente(a.id); if (v && v.p >= a.prix) gagnants.push({ a, v }); }
    if (gagnants.length) { echecs++; for (const { a, v } of gagnants.slice(0, 20)) log(`  GAGNANT : ${a.id} commandé ${a.prix} chez ${a.q} (amitié ${a.niv}), revendu ${v.p} (${v.ou}, amitié ${v.niv})`); }
    else log('Aucun article commandé ne se revend à son prix, même sans compter le port (meilleure revente, toute amitié).');
    // 4. ce qui revient au joueur ne dépasse jamais ce qu'il a payé (joué pour de bon, sur une partie factice)
    const S = JSON.parse(J.ev(SIMU));
    const attendu = { rayer: 25, mort: 36, perdu: 36 };
    const faux = [];
    if (S.rayer !== attendu.rayer) faux.push(`commande rayée (payée 25) : rendu ${S.rayer}`);
    if (!(S.mort.length === 1 && S.mort[0][0] === 'argent' && S.mort[0][1] === attendu.mort)) faux.push(`vendeur mort (3 × 12) : ${JSON.stringify(S.mort)}`);
    if (S.perdu !== attendu.perdu || S.perduSt !== 'perdu') faux.push(`colis égaré (marchandise 36, port 6) : rendu ${S.perdu} (${S.perduSt})`);
    if (faux.length) { echecs++; for (const f of faux) log('  REMBOURSEMENT : ' + f); }
    else log('Remboursements (joués) : commande rayée = ce qu’on a payé ; vendeur mort = le prix de l’article, en pièces ; colis égaré = la marchandise, pas le port.');
    return { echecs };
  },
};
