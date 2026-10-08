// Équilibrage — des bêtes à qui l'on peut parler (agent P, treizième vague)
//  - huit bêtes, chacune avec tous ses textes (rien de vide, pas de gabarit oublié, les autres bêtes qu'elle nomme existent) ;
//  - ce qu'elles demandent existe (objets, groupes) et ce qu'elles rendent, une fois, ne vaut pas une fortune ;
//  - leurs endroits (graines 1234 et 77) : huit, chacune son milieu, loin les unes des autres, pas toutes près de la ferme,
//    à la bonne hauteur (sol, tonneau, chicot, margelle, Table ; la carpe dans l'eau, au bout du ponton), et l'on y va à
//    pied depuis la ferme (pentes douces, pas d'eau) ;
//  - la passe de génération ne pose rien (les listes ne s'allongent pas ; les empreintes : domaine « batiments »).
'use strict';
const { vallee } = require('./vm.js');
module.exports = {
  titre: 'Des bêtes à qui l’on peut parler (P)',
  async verifier(J, log) {
    let echecs = 0;
    const ko = (m) => { echecs++; log('ÉCHEC : ' + m); };
    // ---------------------------------------------------------------- les textes
    const T = JSON.parse(J.ev(`JSON.stringify((() => {
      const R = { ids: BP_ORDRE, manques: [], gabarits: [], autres: [], n: 0, mots: 0 };
      const vide = (v) => v === undefined || v === null || (typeof v === 'string' && !v.trim()) || (Array.isArray(v) && !v.length);
      const parcourir = (v, ch) => { if (typeof v === 'string') { R.n++; R.mots += v.split(/\\s+/).length; const g = (v.match(/\\{[a-z]+\\}/g) || []).filter((x) => !['{nom}', '{n}', '{qui}', '{jours}'].includes(x)); if (g.length || /undefined|NaN/.test(v)) R.gabarits.push(ch + ' : ' + v.slice(0, 60)); } else if (Array.isArray(v)) v.forEach((x, i) => parcourir(x, ch + '[' + i + ']')); else if (v && typeof v === 'object') for (const k in v) parcourir(v[k], ch + '.' + k); };
      for (const id of BP_ORDRE) {
        const D = BP_BETES[id], X = BP_TEXTES[id];
        if (!D || !X) { R.manques.push(id + ' : bête ou textes absents'); continue; }
        for (const k of ['approche', 'intro', 'retour', 'qui', 'pourquoi', 'rumeurs', 'menace', 'blesse', 'peur', 'muet', 'adieu', 'autres']) if (vide(X[k])) R.manques.push(id + '.' + k);
        if (!X.salut || !Object.values(X.salut).some((L) => L && L.length && L[0] !== '…')) R.manques.push(id + '.salut');
        if (!X.pourquoi || X.pourquoi.length < 2) R.manques.push(id + '.pourquoi (deux niveaux)');
        if (!X.sujet || vide(X.sujet.label) || !X.sujet.lignes || X.sujet.lignes.length < BP_SEUILS.length) R.manques.push(id + '.sujet');
        if (!X.rumeurs || X.rumeurs.length < 6) R.manques.push(id + '.rumeurs (au moins six)');
        if (!X.question || vide(X.question.texte) || !X.question.reponses || X.question.reponses.length < 2 || X.question.reponses.some((r) => vide(r.label) || vide(r.reaction) || vide(r.rappel))) R.manques.push(id + '.question');
        const S = X.service || {};
        for (const k of ['label', 'demande', 'attente', 'merci']) if (vide(S[k])) R.manques.push(id + '.service.' + k);
        if (D.service.objets) for (const k of ['donner', 'cadeau']) if (vide(S[k])) R.manques.push(id + '.service.' + k);
        if (D.service.promesse) for (const k of ['promettre', 'refuser', 'refus', 'accepte', 'rompu']) if (vide(S[k])) R.manques.push(id + '.service.' + k);
        if (D.dort && vide(X.dort)) R.manques.push(id + '.dort');
        if (!/\\{nom\\}/.test(X.peur || '')) R.manques.push(id + '.peur sans {nom}');
        for (const k of Object.keys(X.autres || {})) if (!BP_BETES[k] || k === id) R.autres.push(id + ' → ' + k);
        parcourir(X, id);
      }
      parcourir(BP_MOTS, 'BP_MOTS'); parcourir(BP_RUMEURS, 'BP_RUMEURS'); parcourir(BP_INCREDULES, 'BP_INCREDULES'); parcourir(BP_VERSIONS, 'BP_VERSIONS');
      return R;
    })())`));
    log(`${T.ids.length} bêtes ; ${T.n} répliques et mots du jeu, ${T.mots} mots en tout`);
    if (T.ids.length < 6 || T.ids.length > 8) ko(`${T.ids.length} bêtes (il en faut de six à huit)`);
    for (const m of T.manques) ko('texte manquant : ' + m);
    for (const m of T.gabarits) ko('gabarit oublié : ' + m);
    for (const m of T.autres) ko('une bête nomme une bête qui n’existe pas : ' + m);
    // ---------------------------------------------------------------- ce qu'elles demandent, ce qu'elles rendent
    const E = JSON.parse(J.ev(`JSON.stringify((() => {
      const R = { demandes: [], groupes: {}, prix: {}, manquants: [] };
      for (const id of BP_ORDRE) {
        const S = BP_BETES[id].service || {};
        for (const [k, n] of S.objets || []) {
          if (BP_GROUPES[k]) { const L = Object.keys(ITEMS).filter((x) => BP_GROUPES[k].ok(x)); R.groupes[k] = L.length; R.demandes.push(id + ' : ' + n + ' × ' + k + ' (' + L.slice(0, 5).join(', ') + '…)'); if (!L.length) R.manquants.push(k); }
          else { R.demandes.push(id + ' : ' + n + ' × ' + k + ' (' + (ITEMS[k] ? ITEMS[k].price : '?') + ' pièces)'); if (!ITEMS[k]) R.manquants.push(k); }
        }
        if (S.promesse) R.demandes.push(id + ' : ' + S.promesse + ' jours sans pêcher ' + S.poissons.join(', '));
        if (S.veille) R.demandes.push(id + ' : ' + S.veille + ' heures de veille, sans lumière');
      }
      for (const k of ['crapaudine', 'pierre_terne', 'plume_hulotte', 'bijou', 'vieille_piece']) R.prix[k] = ITEMS[k] ? ITEMS[k].price : null;
      return R;
    })())`));
    for (const d of E.demandes) log('  demande — ' + d);
    for (const k of E.manquants) ko('objet demandé inconnu : ' + k);
    for (const k in E.groupes) if (E.groupes[k] < 2) ko(`groupe « ${k} » : trop peu d’objets qui conviennent (${E.groupes[k]})`);
    for (const k in E.prix) if (E.prix[k] === null) ko('objet inconnu : ' + k);
    // ce qu'on reçoit une fois pour toutes, vendu : la crapaudine, la plume, la bague de la carpe, les sous de la grand-mère Chabert
    const une = (E.prix.crapaudine || 0) + (E.prix.plume_hulotte || 0) + (E.prix.bijou || 0) + 42 + 2 * (E.prix.vieille_piece || 0);
    log(`ce que rendent les services, une fois, vendu : ${une} pièces (le reste : des renseignements, des endroits)`);
    if (une > 400) ko('les bêtes rapportent une fortune');
    if ((E.prix.pierre_terne || 0) > 2) ko('la pierre du crapaud mort vaut quelque chose');
    // ---------------------------------------------------------------- les endroits
    for (const graine of [1234, 77]) {
      const w = await vallee(J, graine);
      J.ctx.__w = w;
      const r = JSON.parse(J.ev(`(() => { const w = __w, P = w.betesP || {}, WL = w.waterLevel, F = w.lm.ferme;
        const biomeAt = (x, z) => BIOMES[w.biome[clamp(Math.floor(z / 8), 0, w.biomeW - 1) * w.biomeW + clamp(Math.floor(x / 8), 0, w.biomeW - 1)]];
        const n0 = [w.objects.length, w.props.length, w.inter.length];
        bpLieux(w, ${graine});
        const n1 = [w.objects.length, w.props.length, w.inter.length];
        // à pied depuis la ferme : cases de 4 m, pentes douces, pas d'eau (mais les ponts et le ponton portent)
        const C = 4, N = Math.floor(w.size / C), acc = new Uint8Array(N * N), Q = [], HC = new Float32Array(N * N).fill(NaN);
        const H = (i, j) => { const k = j * N + i; if (!isNaN(HC[k])) return HC[k]; const x = (i + 0.5) * C, z = (j + 0.5) * C; let h = w.heightAt(x, z); if (h < WL + 0.5) { const g = w.groundAt(x, z, WL + 4, 0.6); if (g > WL + 0.3) h = Math.max(g, WL + 0.5); } return (HC[k] = h); };
        const s0 = Math.floor(F.z / C) * N + Math.floor(F.x / C); acc[s0] = 1; Q.push(s0);
        for (let h = 0; h < Q.length; h++) { const k = Q[h], i = k % N, j = (k / N) | 0; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ii = i + di, jj = j + dj; if (ii < 1 || jj < 1 || ii >= N - 1 || jj >= N - 1) continue; const k2 = jj * N + ii; if (acc[k2]) continue; const h2 = H(ii, jj); if (h2 < WL + 0.5 || Math.abs(h2 - H(i, j)) > C * 1.0) continue; acc[k2] = 1; Q.push(k2); } }
        const atteint = (x, z, rr) => { const i0 = Math.floor(x / C), j0 = Math.floor(z / C), R = Math.ceil(rr / C); for (let j = j0 - R; j <= j0 + R; j++) for (let i = i0 - R; i <= i0 + R; i++) if (i >= 0 && j >= 0 && i < N && j < N && acc[j * N + i]) return true; return false; };
        const L = BP_ORDRE.map((id) => { const p = P[id]; if (!p) return { id, absent: true }; const g = w.heightAt(p.x, p.z);
          return { id, x: Math.round(p.x), z: Math.round(p.z), haut: +(p.y - g).toFixed(2), eau: +(WL - g).toFixed(2), y: +p.y.toFixed(2), wl: WL, biome: biomeAt(p.x, p.z), voulu: BP_BETES[id].biome || null, milieu: BP_BETES[id].milieu,
            ferme: Math.round(Math.hypot(p.x - F.x, p.z - F.z)), pied: atteint(p.x, p.z, id === 'carpe' ? 14 : 6), sur: p.sur || null }; });
        return JSON.stringify({ L, n0, n1 }); })()`));
      const L = r.L;
      if (JSON.stringify(r.n0) !== JSON.stringify(r.n1)) ko(`graine ${graine} : la passe a posé quelque chose (${r.n0} → ${r.n1})`);
      const pres = L.filter((q) => !q.absent);
      log(`graine ${graine} : ${pres.length} bêtes placées`);
      for (const q of L) {
        if (q.absent) { ko(`graine ${graine} : ${q.id} n’a pas d’endroit`); continue; }
        log(`  ${q.id.padEnd(8)} ${q.x}, ${q.z} — ${q.milieu} (${q.biome}) — à ${q.ferme} m de la ferme — à ${q.haut} m du sol — à pied : ${q.pied ? 'oui' : 'NON'}`);
        if (q.voulu && q.voulu !== q.biome) ko(`graine ${graine} : ${q.id} n’est pas dans son milieu (${q.biome}, voulu ${q.voulu})`);
        if (!q.pied) ko(`graine ${graine} : on n’atteint pas ${q.id} à pied`);
        const H = { chat: [0.6, 1.1], hulotte: [1.5, 2.4], crapaud: [0.5, 1.5], corbeau: [0.8, 3.2], carpe: null }[q.id];
        if (q.id === 'carpe') { if (q.eau < 0.8 || q.y > q.wl) ko(`graine ${graine} : la carpe n’est pas dans l’eau profonde`); }
        else if (H) { if (q.haut < H[0] || q.haut > H[1]) ko(`graine ${graine} : ${q.id} à ${q.haut} m du sol`); }
        else if (Math.abs(q.haut) > 0.3) ko(`graine ${graine} : ${q.id} flotte ou s’enfonce (${q.haut} m)`);
      }
      const mil = new Set(pres.map((q) => q.milieu));
      if (mil.size !== pres.length) ko(`graine ${graine} : deux bêtes dans le même milieu`);
      let mn = 1e9, pr = '';
      for (let i = 0; i < pres.length; i++) for (let j = i + 1; j < pres.length; j++) { const d = Math.hypot(pres[i].x - pres[j].x, pres[i].z - pres[j].z); if (d < mn) { mn = d; pr = pres[i].id + ' et ' + pres[j].id; } }
      log(`  les plus proches : ${pr}, ${Math.round(mn)} m ; à plus de 500 m de la ferme : ${pres.filter((q) => q.ferme > 500).length}`);
      if (mn < 150) ko(`graine ${graine} : ${pr} trop près l’une de l’autre`);
      if (pres.filter((q) => q.ferme > 500).length < 3) ko(`graine ${graine} : presque toutes près de la ferme`);
    }
    return { echecs };
  },
};
