// Équilibrage — les gobelins (agent X, quatorzième vague)
//   node tools/equilibrage.js X
// - LA PASSE (graine 1234) : la vieille souche, les terriers, les pierres griffées, la Gobelinière ; le temps de la passe ;
//   rien ne bouge de ce qui était posé avant (empreintes d'origine et d'après la huitième vague) ; rien contre une
//   trouvaille de R (w.ramasse) ni dans un de ses blocs ; tout ce qui est posé dehors est au sec, hors des murs ;
//   la Gobelinière est sous la roche (le plafond bien sous le terrain), aucun bâtiment au-dessus (la carte des abris ne
//   garde qu'un plafond par case), ses boyaux ne se passent qu'accroupi (plus de 1,15 m, moins de 1,75 m sous la voûte).
// - LES MAISONS : celles qu'ils peuvent visiter (un meuble à fouiller, un terrier à moins de 330 m) ; il en faut assez.
// - LE TRÉSOR : l'espérance d'une poignée (petit tas, grand tas) aux prix du jeu (caisse : voir le domaine commerce), et
//   tout le trésor de la Gobelinière, comparé à la journée de travail du début (375 pièces) ; ce qu'ils reprennent
//   ensuite dans les coffres de la ferme (la rancune).
// - LA SAUVEGARDE : farm.s.gobelins, plein (étal, objets à rendre, marques, corps…).
// - LES TEXTES : chaque plainte et chaque rumeur va à un habitant qui existe ; les rumeurs sont dans ses répliques.
'use strict';
const { vallee, empreinte, EMPREINTE_1234 } = require('./vm.js');
const commerce = require('./commerce.js');

const EMPREINTE_C3 = '103331/3384/931/48142f0b97c7', N_C3 = [103331, 3384, 931];
const CIBLES = {
  passeMs: 2500,            // la passe de génération (machine virtuelle ; ~0,4 s d'ordinaire, plus quand la machine est chargée)
  terriers: 6, marques: 8,  // au moins
  maisons: 15,              // maisons qu'ils peuvent visiter, au moins
  poigneeTas: [20, 90],     // pièces : une poignée d'un petit tas
  poigneeGrand: [60, 220],  // pièces : une poignée du grand tas
  tresor: [1.5, 6],         // tout le trésor de la Gobelinière, en journées de travail du début
  sauvegarde: 6000,         // octets de farm.s.gobelins, plein (au pire : l'étal plein, tout à rendre, des marques, des corps)
};
const JOURNEE_DEBUT = 375;

module.exports = {
  titre: 'Les gobelins (agent X) : la passe, la Gobelinière, les maisons visitées, le trésor, la sauvegarde',
  CIBLES,
  async verifier(J, log) {
    const E = [];
    const t0 = Date.now();
    const w = await vallee(J, 1234);
    log(`(vallée 1234 générée en ${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    const G = w.gobelins;
    if (!G || !G.souche) { log('  ÉCHEC : pas de w.gobelins'); return { echecs: 1 }; }
    const WL = w.waterLevel, World = J.ev('World'), r1 = (v) => Math.round(v * 10) / 10;

    // ---------------------------------------------------------------- 1. la passe
    log('\n# 1. La passe (graine 1234)');
    log(`${G.ms} ms ; la souche en ${r1(G.souche.x)}, ${r1(G.souche.z)} (${r1(G.souche.y - WL)} m au-dessus de l'eau) ; ${G.terriers.length} terriers (${G.terriers.map((t) => t.cle + (t.raccourci ? '*' : '')).join(', ')}) ; ${G.marques.length} pierres griffées.`);
    if (G.ms > CIBLES.passeMs) E.push(`la passe prend ${G.ms} ms (> ${CIBLES.passeMs})`);
    if (G.terriers.length < CIBLES.terriers) E.push(`${G.terriers.length} terriers seulement`);
    if (G.marques.length < CIBLES.marques) E.push(`${G.marques.length} pierres griffées seulement`);
    if (!G.terriers.some((t) => t.raccourci)) E.push('pas de terrier au bout du raccourci');
    const e1 = empreinte(w, [98896, 1308, 516]), e3 = empreinte(w, N_C3);
    log(`empreinte d'origine : ${e1 === EMPREINTE_1234 ? 'inchangée' : 'CHANGÉE ' + e1} ; après la huitième vague : ${e3 === EMPREINTE_C3 ? 'inchangée' : 'CHANGÉE ' + e3}.`);
    if (e1 !== EMPREINTE_1234) E.push('empreinte d’origine changée');
    if (e3 !== EMPREINTE_C3) E.push('empreinte C3 changée');
    // dehors : au sec, hors des murs (blocs visibles), loin des trouvailles de R
    const dehors = [G.souche, G.racine, G.trappe, ...G.terriers, ...G.marques];
    let mouille = 0, muré = 0;
    for (const o of dehors) {
      if (w.heightAt(o.x, o.z) < WL + 0.3) mouille++;
      w.query(o.x, o.z, 1, null, (b) => {
        if (b.hidden || b.under) return;
        const [lx, lz] = World.blockLocal(b, o.x, o.z);
        if (Math.abs(lx) < b.sx / 2 && Math.abs(lz) < b.sz / 2 && o.y + 0.1 > b.y && o.y + 0.1 < b.y + b.sy) muré++;
      });
    }
    const RL = (w.ramasse && w.ramasse.L) || [];
    const miennes = w.inter.filter((i) => /^gob_/.test(i.kind || ''));
    let pres = 0;
    for (const o of RL) for (const it of miennes) if (Math.abs(it.x - o.x) < 0.6 && Math.abs(it.z - o.z) < 0.6 && Math.abs((it.y || 0) - o.y) < 1.5) pres++;
    log(`dehors : ${dehors.length} choses posées ; dans l'eau ${mouille} ; dans un mur ${muré} ; ${miennes.length} interactions, dont ${pres} à moins de 60 cm d'une des ${RL.length} trouvailles de R.`);
    if (mouille) E.push(`${mouille} chose(s) posée(s) dans l'eau`);
    if (muré) E.push(`${muré} chose(s) posée(s) dans un mur`);
    if (pres) E.push(`${pres} interaction(s) contre une trouvaille de R`);

    // ---------------------------------------------------------------- 2. la Gobelinière
    log('\n# 2. La Gobelinière');
    const V = G.village;
    if (!V) E.push('pas de Gobelinière');
    else {
      const xa = V.x - V.W / 2 - 14, xb = V.x + V.W / 2 + 11, za = V.z - V.D / 2 - 2, zb = V.z + V.D / 2 + 2;
      let hmin = 1e9;
      for (let x = xa; x <= xb; x += 2) for (let z = za; z <= zb; z += 2) hmin = Math.min(hmin, w.heightAt(x, z));
      const roche = hmin - (V.y + V.H + 0.8);
      log(`en ${r1(V.x)}, ${r1(V.z)}, à ${r1(Math.hypot(V.x - G.souche.x, V.z - G.souche.z))} m de la souche ; le sol à ${r1(V.y)} m, le terrain le plus bas au-dessus à ${r1(hmin)} m : ${r1(roche)} m de roche au-dessus de la voûte.`);
      if (roche < 3) E.push(`seulement ${r1(roche)} m de roche au-dessus de la Gobelinière`);
      // rien au-dessus (sauf ses propres blocs)
      const dessus = w.blocks.filter((b) => !b.under && !b.hidden && b.x > xa - 10 && b.x < xb + 10 && b.z > za - 10 && b.z < zb + 10);
      log(`blocs de surface au-dessus (à 10 m près) : ${dessus.length}.`);
      if (dessus.length) E.push(`${dessus.length} bloc(s) de surface au-dessus de la Gobelinière (la carte des abris)`);
      const autres = w.blocks.filter((b) => b.under && (b.y < V.y - 3 || b.y > V.y + V.H + 3) && b.x > xa && b.x < xb && b.z > za && b.z < zb);
      if (autres.length) E.push(`${autres.length} bloc(s) d'une autre salle sous la Gobelinière`);
      // les boyaux : hauteur sous la voûte
      const voute = (x, z) => { let h = 1e9; w.query(x, z, 1, null, (b) => { if (!b.under || b.hidden) return; const [lx, lz] = World.blockLocal(b, x, z); if (Math.abs(lx) < b.sx / 2 && Math.abs(lz) < b.sz / 2 && b.y > V.y + 0.2 && b.y < h) h = b.y; }); return h - V.y; };
      const [bax, baz] = V.boyau.a, [bbx, bbz] = V.boyau.b;
      const hb = voute((bax + bbx) / 2, (baz + bbz) / 2), hs = voute(V.x, V.z), ha = voute(V.arrivee[0], V.arrivee[2]);
      log(`hauteur sous la voûte : la grande salle ${r1(hs)} m, la chambre des racines ${r1(ha)} m, le boyau ${r1(hb)} m (accroupi : 1,10 m ; debout : 1,80 m).`);
      if (!(hb > 1.15 && hb < 1.75)) E.push(`le boyau fait ${r1(hb)} m sous la voûte (il faut qu'on n'y passe qu'accroupi)`);
      if (!(ha > 1.9)) E.push(`la chambre des racines est trop basse (${r1(ha)} m)`);
      // l'arrivée et les points où vont les gobelins : libres
      const libre = (x, z, y) => { let ok = true; w.query(x, z, 1.5, null, (b) => { if (!ok) return; const [lx, lz] = World.blockLocal(b, x, z); if (Math.abs(lx) < b.sx / 2 + 0.25 && Math.abs(lz) < b.sz / 2 + 0.25 && b.y < y + 1.0 && b.y + b.sy > y + 0.3) ok = false; }); return ok; };
      const pts = [V.arrivee, V.raccourciArrivee, ...V.lieux.map((L) => [L.x, V.y, L.z]), ...V.nids.map((N) => [N.x, V.y, N.z])];
      const bloques = pts.filter((P) => !libre(P[0], P[2], P[1]));
      log(`${pts.length} points (arrivées, lieux, nids) ; dans un mur : ${bloques.length}.`);
      if (bloques.length) E.push(`${bloques.length} point(s) de la Gobelinière dans un mur`);
      log(`${V.tas.length} tas, le grand tas, ${V.nids.length} nids, ${V.chandelles.length} chandelles, ${V.lire.length} choses à lire, ${V.murs.length} points de paroi.`);
    }

    // ---------------------------------------------------------------- 3. les maisons qu'ils visitent
    log('\n# 3. Les maisons visitées');
    const parBld = {};
    for (const it of w.inter) {
      const d = it.data || {};
      if (it.kind !== 'f2' || !d.bld || d.cache || d.t === 'cache' || ['rebut', 'public', 'libre'].includes(d.lieu)) continue;
      const B = w.bld[d.bld];
      if (!B || B.under) continue;
      let dmin = 1e9, cle = '';
      for (const t of G.terriers) { const dd = Math.hypot(t.x - B.x, t.z - B.z); if (dd < dmin) { dmin = dd; cle = t.cle; } }
      parBld[d.bld] = { n: (parBld[d.bld] ? parBld[d.bld].n : 0) + 1, d: dmin, cle };
    }
    const ok = Object.entries(parBld).filter(([, v]) => v.d <= 330), loin = Object.entries(parBld).filter(([, v]) => v.d > 330);
    log(`${ok.length} maisons à leur portée : ` + ok.map(([k, v]) => `${k} (${v.cle}, ${Math.round(v.d)} m)`).join(', ') + '.');
    log(`hors de portée : ${loin.map(([k, v]) => `${k} (${Math.round(v.d)} m)`).join(', ') || 'aucune'}.`);
    if (ok.length < CIBLES.maisons) E.push(`${ok.length} maisons seulement à portée des terriers`);

    // ---------------------------------------------------------------- 4. le trésor
    log('\n# 4. Le trésor de la Gobelinière');
    const D = commerce.donnees(J), v = commerce.valeurs(D);
    const P = J.ev('GOB_REGL.poignees'), Pt = commerce.esperance(D, 'gob_tas', v), Pg = commerce.esperance(D, 'gob_grand_tas', v);
    const nTas = V ? V.tas.length : 6, tout = nTas * P * Pt + P * Pg;
    log(`une poignée d'un petit tas : ${r1(Pt)} pièces ; du grand tas : ${r1(Pg)} pièces ; ${P} poignées par tas.`);
    log(`tout le trésor (${nTas} tas et le grand) : ${Math.round(tout)} pièces = ${r1(tout / JOURNEE_DEBUT)} journées de travail du début.`);
    if (Pt < CIBLES.poigneeTas[0] || Pt > CIBLES.poigneeTas[1]) E.push(`une poignée d'un petit tas vaut ${r1(Pt)} (hors ${CIBLES.poigneeTas.join('-')})`);
    if (Pg < CIBLES.poigneeGrand[0] || Pg > CIBLES.poigneeGrand[1]) E.push(`une poignée du grand tas vaut ${r1(Pg)} (hors ${CIBLES.poigneeGrand.join('-')})`);
    if (tout / JOURNEE_DEBUT < CIBLES.tresor[0] || tout / JOURNEE_DEBUT > CIBLES.tresor[1]) E.push(`le trésor vaut ${r1(tout / JOURNEE_DEBUT)} journées (hors ${CIBLES.tresor.join('-')})`);
    // ce qu'ils reprennent ensuite : la rancune (une par poignée, deux au grand tas, au plus GOB_REGL.rancuneMax) ; chaque
    // nuit où ils vous en veulent, 85 % de chances qu'ils viennent à la ferme prendre un ou deux objets d'au plus 40 pièces
    // (chacun ôte prix / 25 de rancune, une demie au moins) ; la rancune s'use d'un tiers chaque matin.
    const Rmax = J.ev('GOB_REGL.rancuneMax'), R0 = Math.min(Rmax, nTas * P + 2 * P);
    let R = R0, nuits = 0, pris = 0;
    const objMoy = 18; // pièces : ce qu'ils prennent en moyenne dans un coffre (au plus 40)
    while (R > 0.01 && nuits < 60) { nuits++; if (R >= 1) { const n = 1.5 * 0.85; pris += n * objMoy; R = Math.max(0, R - n * Math.max(0.5, objMoy / 25)); } R = Math.max(0, R - 0.34); }
    log(`après avoir tout pris : rancune ${R0} ; ils viennent se payer dans vos coffres pendant ${nuits} nuits environ, et y reprennent quelque ${Math.round(pris)} pièces (s'il y a de quoi) — ${Math.round(pris / tout * 100)} % du trésor.`);

    // ---------------------------------------------------------------- 5. la sauvegarde
    log('\n# 5. La sauvegarde');
    const taille = J.ev(`(() => {
      farm.s = farm.blank(1234);
      const S = gobelins.S();
      for (let i = 0; i < GOB_REGL.etal; i++) S.prises.push({ k: 'cuillere_argent', n: 2, de: 'boulangere', bld: 'boulangerie', j: 12 });
      for (let i = 0; i < 24; i++) S.rendre.push({ k: 'de_coudre', n: 1, de: 'boulangere', j: 12 });
      for (let i = 0; i < 8; i++) S.meubles.push({ it: 'f2:boulangerie:petrin', j: 12 });
      for (let i = 0; i < 8; i++) S.lache.push({ x: 1512.3, y: 12.5, z: 2153.8, k: 'ruban', n: 1, de: 'maire', j: 12 });
      for (let i = 0; i < 6; i++) S.corps.push({ x: 1512.3, y: 12.5, z: 2153.8, j: 12, chiffons: true, dent: true });
      S.nuit = { n: 12, raids: [0, 1, 2].map((g) => ({ g, bld: 'boulangerie', it: 'f2:boulangerie:petrin', ter: 0, hd: 1.2, ha: 2.3, hf: 2.65, hr: 3.75, etat: 'prevu', vole: false })) };
      Object.assign(S.connu, { signe: 3, souche: 4, racine: 4, entre: 5, village: 5, raccourci: 6 });
      S.morts = [1, 4]; S.tues = 2; S.rancune = 4.2; S.tas = { 0: 3, 1: 2, 2: 1 }; S.grand = 2;
      for (const k of ['boulangerie', 'mairie', 'poste', 'forge', 'ranch']) S.recents[k] = 11;
      for (const k of ['boulangere', 'maire', 'postiere']) S.plaintes[k] = 12;
      const n = JSON.stringify(farm.s.gobelins).length;
      farm.s = null;
      return n;
    })()`);
    log(`farm.s.gobelins plein : ${taille} octets.`);
    if (taille > CIBLES.sauvegarde) E.push(`farm.s.gobelins pèse ${taille} octets (> ${CIBLES.sauvegarde})`);

    // ---------------------------------------------------------------- 6. les textes
    log('\n# 6. Les textes');
    const T = JSON.parse(J.ev(`JSON.stringify((() => {
      const tous = NPC_DATA.concat(typeof C2_HABITANTS !== 'undefined' ? C2_HABITANTS.filter((d) => !NPC_DATA.includes(d)) : []);
      const ids = new Set(tous.map((d) => d.id));
      const plaintes = Object.keys(GOB_T.plaintes).filter((k) => k !== '_' && !ids.has(k));
      const rumeurs = Object.keys(GOB_T.rumeurs).filter((k) => !ids.has(k));
      const nonDites = Object.entries(GOB_T.rumeurs).filter(([k, t]) => { const d = tous.find((x) => x.id === k); return d && !(d.lines && d.lines.rumeurs && d.lines.rumeurs.includes(t)); }).map(([k]) => k);
      const vides = [];
      const voir = (o, ch) => { for (const k in o) { const x = o[k]; if (typeof x === 'string') { if (!x.trim()) vides.push(ch + k); } else if (Array.isArray(x)) x.forEach((y, i) => { if (typeof y === 'string' && !y.trim()) vides.push(ch + k + i); }); else if (x && typeof x === 'object') voir(x, ch + k + '.'); } };
      voir(GOB_T, '');
      return { plaintes, rumeurs, nonDites, vides, nP: Object.keys(GOB_T.plaintes).length - 1, nR: Object.keys(GOB_T.rumeurs).length };
    })())`));
    log(`${T.nP} plaintes propres à un habitant (et trois pour les autres), ${T.nR} rumeurs.`);
    if (T.plaintes.length) E.push('plaintes pour des habitants qui n’existent pas : ' + T.plaintes.join(', '));
    if (T.rumeurs.length) E.push('rumeurs pour des habitants qui n’existent pas : ' + T.rumeurs.join(', '));
    if (T.nonDites.length) E.push('rumeurs absentes des répliques : ' + T.nonDites.join(', '));
    if (T.vides.length) E.push('textes vides : ' + T.vides.join(', '));

    if (E.length) for (const e of E) log('  ÉCHEC : ' + e);
    return { echecs: E.length };
  },
};
