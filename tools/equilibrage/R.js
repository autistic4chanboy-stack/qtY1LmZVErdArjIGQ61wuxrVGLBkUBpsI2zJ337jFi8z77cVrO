// Équilibrage des trouvailles (agent R, vague 13 : des objets à ramasser un peu partout)
//   node tools/equilibrage.js R
// - La pose (graine 1234) : combien, où (milieux), combien de sortes (quarante au moins) ; rien dans l'eau, dans un mur
//   ni sous un meuble, rien devant une interaction ; rien dans w.objects, w.props, w.inter (l'empreinte des anciennes
//   parties ne bouge pas) ; le temps de la passe.
// - La valeur (les prix du jeu, comme le domaine commerce : caisse, contenu moyen de ce qui s'ouvre) : tout ce qui se
//   ramasse une fois ; ce qui revient (fruits en saison, bois mort, œufs…), par jour ; et surtout une JOURNÉE DE
//   PROMENADE (on marche sur les chemins, les rues, les sentiers, au hasard des carrefours, et l'on fait un petit détour
//   pour ce qu'on aperçoit) et une journée de RAMASSAGE ACHARNÉ (on va toujours à la trouvaille la plus proche, en sachant
//   où tout est), comparées à la journée de travail du début (300 à 450 pièces : voir le domaine commerce).
// - La sauvegarde : la taille de farm.s.ramasse quand tout a été pris (un bit par trouvaille).
'use strict';
const { vallee, empreinte, EMPREINTE_1234 } = require('./vm.js');
const commerce = require('./commerce.js');

const CIBLES = {
  trouvailles: [600, 2500],     // dans toute la vallée
  sortes: 40,                   // sortes présentes (au moins)
  promenadeMoy: 0.35,           // une journée de promenade, en moyenne : au plus 35 % d'une journée de travail du début
  promenadeMax: 0.6,            // la meilleure des promenades tirées : au plus 60 %
  acharne: 0.85,                // le ramassage acharné du premier jour (tout savoir, tout courir) : moins qu'une journée de travail
  rente: 0.25,                  // ce qui revient, ramassé chaque jour au plus près de la ferme (régime établi) : au plus 25 %
  passeMs: 3000,                // la passe de génération (machine virtuelle)
  sauvegarde: 600,              // octets de farm.s.ramasse, tout étant pris (hors ce qui revient)
};
const JOURNEE_DEBUT = 375;      // pièces : une journée de travail honnête au début (échelle du domaine commerce)
const VU = [4, 9, 14];          // m : on aperçoit en marchant une toute petite chose, une moyenne, une grande

module.exports = {
  titre: 'Trouvailles (agent R) : pose, valeur d’une promenade, sauvegarde',
  CIBLES,
  async verifier(J, log) {
    const E = [];
    const t0 = Date.now();
    const w = await vallee(J, 1234);
    log(`(vallée 1234 générée en ${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    const R = w.ramasse;
    if (!R || !Array.isArray(R.L)) { log('  ÉCHEC : pas de liste de trouvailles (w.ramasse).'); return { echecs: 1 }; }
    const L = R.L, WL = w.waterLevel;
    const D = commerce.donnees(J), V = commerce.valeurs(D), H = commerce.HYP;
    const S = JSON.parse(J.ev(`JSON.stringify(Object.fromEntries(Object.keys(RAM_SORTES).map((k) => [k, Object.assign({}, RAM_SORTES[k], { taille: (() => { const b = ramBoite(RAM_SORTES[k].mod); return b.r * 2 < 0.075 ? 0 : b.r * 2 < 0.25 ? 1 : 2; })() })])))`));
    const saison = (k, d) => J.avec({ k, d }, 'ramEnSaison(__v.k, __v.d)');
    const SAI = {};
    for (const k in S) if (S[k].saison) { SAI[k] = []; for (let d = 1; d <= 24; d++) SAI[k][d] = saison(S[k].saison, d); }
    const nombre = (o) => { const s = S[o.k]; return s.nv ? s.n[0] + Math.min(s.n[1] - s.n[0], Math.floor((o.v || 0) * (s.n[1] - s.n[0] + 1))) : (s.n[0] + s.n[1]) / 2; };
    const val = (o) => { const s = S[o.k]; return (s.it === 'argent' ? 1 : V(s.it)) * nombre(o); };
    const enSaison = (o, d) => { const s = S[o.k]; return !s.saison || SAI[o.k][((d - 1) % 24) + 1]; };

    // ---------------------------------------------------------------- 1. la pose
    log('\n# 1. La pose (graine 1234)');
    const ks = {};
    for (const o of L) ks[o.k] = (ks[o.k] || 0) + 1;
    const nS = Object.keys(ks).length, nT = Object.keys(S).length;
    log(`${L.length} trouvailles en ${R.ms} ms ; ${nS} sortes présentes sur ${nT} (absentes : ${Object.keys(S).filter((k) => !ks[k]).join(', ') || 'aucune'}).`);
    log('Par milieu : ' + Object.entries(R.par).sort((a, b) => b[1] - a[1]).map(([m, n]) => `${m} ${n}`).join(', ') + '.');
    log('Les plus fréquentes : ' + Object.entries(ks).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, n]) => `${k} ${n}`).join(', ') + '.');
    if (L.length < CIBLES.trouvailles[0] || L.length > CIBLES.trouvailles[1]) E.push(`${L.length} trouvailles, hors ${CIBLES.trouvailles.join('-')}`);
    if (nS < CIBLES.sortes) E.push(`${nS} sortes présentes seulement (${CIBLES.sortes} au moins)`);
    if (R.ms > CIBLES.passeMs) E.push(`la passe prend ${R.ms} ms (> ${CIBLES.passeMs})`);
    for (const m of ['chemin', 'verger', 'rue', 'eau', 'foret', 'saint', 'ruine', 'maison', 'sol', 'seuil', 'champ']) if (!R.par[m]) E.push(`aucune trouvaille dans le milieu « ${m} »`);
    // rien dans l'eau, dans un mur, devant une interaction ; les toutes petites choses jamais dans l'herbe haute
    const RG = J.ev('ramGen'), World = J.ev('World');
    let eau = 0, mur = 0, inter = 0, herbe = 0;
    for (const o of L) {
      if (!o.b && w.heightAt(o.x, o.z) < WL + 0.02) eau++;
      w.query(o.x, o.z, 1, null, (b) => {
        if (b.hidden) return;
        const [lx, lz] = World.blockLocal(b, o.x, o.z);
        if (Math.abs(lx) < b.sx / 2 - 0.02 && Math.abs(lz) < b.sz / 2 - 0.02 && o.y + 0.01 > b.y + 0.01 && o.y + 0.01 < b.y + b.sy - 0.01) mur++;
      });
      for (const it of w.inter) if (Math.abs(it.x - o.x) < 0.6 && Math.abs(it.z - o.z) < 0.6 && Math.abs((it.y || 0) - o.y) < 1.5) { inter++; break; }
      if (!o.b && o.m !== 'verger' && S[o.k].taille === 0 && RG.herbe(w, o.x, o.z)) herbe++;
    }
    log(`Dans l'eau : ${eau} ; dans un bloc : ${mur} ; à moins de 60 cm d'une interaction : ${inter} ; toutes petites choses dans l'herbe haute : ${herbe}.`);
    if (eau) E.push(`${eau} trouvaille(s) dans l'eau`);
    if (mur) E.push(`${mur} trouvaille(s) dans un mur ou un plancher`);
    if (inter) E.push(`${inter} trouvaille(s) contre une interaction`);
    if (herbe) E.push(`${herbe} toute(s) petite(s) chose(s) dans l'herbe haute`);
    const pr = w.props.filter((q) => q.id === 'r_objet').length + w.inter.filter((i) => /^ram/.test(i.kind || '')).length;
    const emp = empreinte(w, [98896, 1308, 516]);
    log(`Dans w.props / w.inter : ${pr} ; empreinte des anciennes parties : ${emp === EMPREINTE_1234 ? 'inchangée' : 'CHANGÉE (' + emp + ')'}.`);
    if (pr) E.push('des trouvailles dans w.props ou w.inter');
    if (emp !== EMPREINTE_1234) E.push('empreinte des anciennes parties changée');
    // dedans, la ville
    const T = w.townInfo, dedans = L.filter((o) => o.b && o.b[0] !== '_'), blds = new Set(dedans.map((o) => o.b));
    const ville = T ? L.filter((o) => Math.hypot(o.x - T.x, o.z - T.z) < 60).length : 0;
    log(`Dans les maisons : ${dedans.length} trouvailles, dans ${blds.size} bâtiments sur ${Object.keys(w.bld).length} ; en ville (60 m autour de la place) : ${ville}.`);

    // ---------------------------------------------------------------- 2. la valeur
    log('\n# 2. La valeur (prix du jeu, ramassé puis vendu à la caisse)');
    let uneFois = 0, revient = 0;
    for (const o of L) { const s = S[o.k]; if (s.rev > 0) { const part = s.saison ? SAI[o.k].filter(Boolean).length / 24 : 1; revient += val(o) * part / s.rev; } else uneFois += val(o); }
    log(`Tout ce qui se ramasse une fois : ${Math.round(uneFois)} pièces (${(uneFois / JOURNEE_DEBUT).toFixed(1)} journées de travail du début, pour toute la vallée).`);
    log(`Ce qui revient (fruits en saison, bois mort, œufs, plumes, bois flotté, coquilles), toute la vallée : ${revient.toFixed(1)} pièces par jour.`);
    const F = w.farm.spawn ? { x: w.farm.spawn[0], z: w.farm.spawn[1] } : w.lm.ferme;
    const jourS = H.jourActif * D.J / 24, vit = H.marche, geste = H.ramasser;
    // la grille des trouvailles (cases de 16 m)
    const C = 16, G = new Map();
    L.forEach((o, i) => { const k = ((o.x / C) | 0) * 8192 + ((o.z / C) | 0); let A = G.get(k); if (!A) G.set(k, (A = [])); A.push(i); });
    // ---- la promenade : sur le graphe des chemins (hors des maisons), au hasard des carrefours
    const N = w.nav, okNoeud = N.nodes.map((n) => !/:(in|mid)$/.test(n.tag || '') && !/^halle|^village:nains|^sout/.test(n.tag || ''));
    const rnd0 = J.ev('mulberry32')(9177);
    let depart = -1, bd = 1e9;
    N.nodes.forEach((n, i) => { if (!okNoeud[i]) return; const d = Math.hypot(n.x - F.x, n.z - F.z); if (d < bd) { bd = d; depart = i; } });
    const promenade = (jour, rnd) => {
      const pris = new Set();
      let t = 0, gain = 0, n = 0, cur = depart, prev = -1, marche = 0;
      while (t < jourS) {
        const vois = N.adj[cur].filter((e) => okNoeud[e.to] && !/^door/.test(e.flag || '') && e.to !== prev);
        const choix = vois.length ? vois : N.adj[cur].filter((e) => okNoeud[e.to]);
        if (!choix.length) break;
        const e = choix[(rnd() * choix.length) | 0], A = N.nodes[cur], B = N.nodes[e.to], lg = Math.hypot(B.x - A.x, B.z - A.z);
        t += lg / vit; marche += lg;
        // ce qu'on aperçoit le long de ce bout de chemin
        const x0 = Math.min(A.x, B.x) - 14, x1 = Math.max(A.x, B.x) + 14, z0 = Math.min(A.z, B.z) - 14, z1 = Math.max(A.z, B.z) + 14;
        for (let gx = (x0 / C) | 0; gx <= (x1 / C) | 0; gx++) for (let gz = (z0 / C) | 0; gz <= (z1 / C) | 0; gz++) {
          const Ai = G.get(gx * 8192 + gz);
          if (!Ai) continue;
          for (const i of Ai) {
            const o = L[i], s = S[o.k];
            if (o.b || pris.has(i) || !enSaison(o, jour)) continue;
            const ux = B.x - A.x, uz = B.z - A.z, L2 = ux * ux + uz * uz || 1, tt = Math.max(0, Math.min(1, ((o.x - A.x) * ux + (o.z - A.z) * uz) / L2));
            const d = Math.hypot(o.x - (A.x + ux * tt), o.z - (A.z + uz * tt));
            if (d > VU[s.taille]) continue;
            pris.add(i); gain += val(o); n++; t += 2 * d / vit + geste;
          }
        }
        prev = cur; cur = e.to;
      }
      return { gain, n, marche };
    };
    const P = [];
    for (const jour of [1, 7, 13, 19]) for (let k = 0; k < 60; k++) P.push(promenade(jour, rnd0));
    P.sort((a, b) => a.gain - b.gain);
    const moy = P.reduce((a, p) => a + p.gain, 0) / P.length, med = P[P.length >> 1].gain, max = P[P.length - 1].gain;
    const nMoy = P.reduce((a, p) => a + p.n, 0) / P.length, mMoy = P.reduce((a, p) => a + p.marche, 0) / P.length;
    log(`Une journée de promenade (${H.jourActif} h actives = ${Math.round(jourS)} s, ${vit} m/s, depuis la ferme, ${P.length} promenades tirées sur quatre jours de saisons différentes) :`);
    log(`  ${Math.round(mMoy)} m parcourus, ${nMoy.toFixed(1)} trouvailles aperçues et ramassées ; ${Math.round(moy)} pièces en moyenne (médiane ${Math.round(med)}, meilleure ${Math.round(max)}) = ${Math.round(moy / JOURNEE_DEBUT * 100)} % d’une journée de travail du début (meilleure ${Math.round(max / JOURNEE_DEBUT * 100)} %).`);
    if (moy > CIBLES.promenadeMoy * JOURNEE_DEBUT) E.push(`promenade : ${Math.round(moy)} pièces en moyenne > ${Math.round(CIBLES.promenadeMoy * JOURNEE_DEBUT)}`);
    if (max > CIBLES.promenadeMax * JOURNEE_DEBUT) E.push(`promenade : ${Math.round(max)} pièces au mieux > ${Math.round(CIBLES.promenadeMax * JOURNEE_DEBUT)}`);
    if (nMoy < 4) E.push(`promenade : ${nMoy.toFixed(1)} trouvailles par jour seulement (la promenade n'est pas récompensée)`);
    // ---- le ramassage acharné : toujours la plus proche (à vol d'oiseau), jusqu'au soir
    const acharne = (jour, pris, filtre, budget) => {
      let t = 0, gain = 0, n = 0, x = F.x, z = F.z;
      while (t < budget) {
        let best = -1, bd2 = 1e18;
        for (let r = 1; r <= 40 && best < 0; r += 3) {
          const cx = (x / C) | 0, cz = (z / C) | 0;
          for (let gx = cx - r; gx <= cx + r; gx++) for (let gz = cz - r; gz <= cz + r; gz++) {
            const Ai = G.get(gx * 8192 + gz);
            if (!Ai) continue;
            for (const i of Ai) { const o = L[i]; if (pris.has(i) || !enSaison(o, jour) || (filtre && !filtre(o))) continue; const d = (o.x - x) ** 2 + (o.z - z) ** 2; if (d < bd2) { bd2 = d; best = i; } }
          }
        }
        if (best < 0) break;
        const o = L[best], d = Math.sqrt(bd2);
        t += d / vit + geste; if (t > budget) break;
        pris.add(best); gain += val(o); n++; x = o.x; z = o.z;
      }
      return { gain, n };
    };
    const A1 = acharne(1, new Set(), null, jourS);
    log(`Le ramassage acharné du premier jour (toujours au plus proche, en sachant où tout est) : ${A1.n} trouvailles, ${Math.round(A1.gain)} pièces = ${Math.round(A1.gain / JOURNEE_DEBUT * 100)} % d’une journée de travail du début.`);
    if (A1.gain > CIBLES.acharne * JOURNEE_DEBUT) E.push(`ramassage acharné : ${Math.round(A1.gain)} pièces le premier jour > ${Math.round(CIBLES.acharne * JOURNEE_DEBUT)}`);
    // ---- la rente : ce qui revient, ramassé chaque jour au plus près de la ferme, sur deux cycles de saisons
    const quand = new Map(); // rang -> jour où il a été pris
    let rente = 0, jours = 0;
    for (let jour = 1; jour <= 48; jour++) {
      const pris = new Set();
      for (const [i, j] of quand) { const s = S[L[i].k]; if (jour - j < s.rev) pris.add(i); else quand.delete(i); }
      const avant = new Set(pris);
      const r = acharne(jour, pris, (o) => S[o.k].rev > 0, jourS * 0.5);
      for (const i of pris) if (!avant.has(i)) quand.set(i, jour);
      if (jour > 24) { rente += r.gain; jours++; }
    }
    rente /= jours || 1;
    log(`Ce qui revient, ramassé chaque jour au plus près pendant une demi-journée (régime établi) : ${rente.toFixed(1)} pièces par jour = ${Math.round(rente / JOURNEE_DEBUT * 100)} % d’une journée de travail du début.`);
    if (rente > CIBLES.rente * JOURNEE_DEBUT) E.push(`ce qui revient : ${rente.toFixed(0)} pièces par jour > ${Math.round(CIBLES.rente * JOURNEE_DEBUT)}`);

    // ---------------------------------------------------------------- 3. la sauvegarde
    log('\n# 3. La sauvegarde');
    const bits = Math.ceil(L.length / 8), b64 = Math.ceil(bits / 3) * 4;
    const nRev = L.filter((o) => S[o.k].rev > 0).length;
    const taille = 60 + b64 + 6 * 16 + J.ev('RAM_LETTRES.length') * 3;
    log(`Un bit par trouvaille : ${bits} octets, ${b64} caractères en base64 ; avec les pensées venues et les lettres lues, au plus ≈ ${taille} octets quand tout est pris. Ce qui revient (${nRev} trouvailles) n'y reste que le temps de revenir (quelques jours).`);
    if (taille > CIBLES.sauvegarde) E.push(`farm.s.ramasse : ≈ ${taille} octets (> ${CIBLES.sauvegarde})`);

    if (!E.length) log('\nToutes les mesures des trouvailles sont dans leurs bornes.');
    for (const e of E) log('  HORS BORNES : ' + e);
    return { echecs: E.length };
  },
};
