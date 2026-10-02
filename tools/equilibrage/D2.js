// Équilibrage — les plantes de la forêt, du bois de bouleaux, du marais et du bord du lac (agent D2) :
//   node tools/equilibrage.js D2
// 1. quarante espèces, dix par biome, chacune complète : objet, type du décor (après tous les autres), sprite, icône,
//    cueillette, effet quand on la mange, essences d'alchimie, notice de l'herbier, allure et remarque de l'alchimiste
//    (sauf les plus connues), au moins un acheteur, un prix selon la rareté ;
// 2. les recettes ne fabriquent pas d'argent (ce qu'on fait vaut au plus ce qu'on y met, au prix de la caisse) ;
// 3. la passe de génération sur la graine 1234 : chaque espèce posée, dans son milieu, jamais sur un chemin, dans une
//    zone protégée ni dans l'eau (sauf les plantes d'eau, qui y sont toutes), les rares moins nombreuses que les
//    communes, un total raisonnable.
'use strict';

const BIOMES_D2 = ['foret', 'bouleaux', 'marais', 'lac'];
const MAX_TOTAL = 1400; // pieds au plus dans toute la vallée (« quelques milliers d'objets au plus » pour D1 et D2)

module.exports = {
  titre: 'D2 : dix plantes nouvelles par biome (forêt, bouleaux, marais, lac)',
  async verifier(J, log) {
    let echecs = 0;
    const verif = (ok, texte) => { if (!ok) echecs++; log(`  ${ok ? 'ok   ' : 'ÉCHEC'} ${texte}`); };

    log('\n1. Les espèces');
    const T = JSON.parse(J.ev(`(() => {
      const R = { n: D2_PLANTES.length, parBiome: {}, manques: [], anciens: 0, ordre: true, prix: [], sansAllure: [], sprites: [], icones: [], noms: new Set() };
      const premier = OBJ_INDEX[D2_PLANTES[0].o];
      D2_PLANTES.forEach((P, k) => {
        R.parBiome[P.mil] = (R.parBiome[P.mil] || 0) + 1;
        const I = ITEMS[P.it], t = OBJ_TYPES[OBJ_INDEX[P.o]], H = HARVEST[P.o], m = [];
        if (OBJ_INDEX[P.o] !== premier + k) R.ordre = false;
        if (!I || !I.name || !I.desc) m.push('objet');
        if (!t || t.spr[0] !== 'd2_' + P.o) m.push('type');
        if (!H || !H.drop.some((d) => d[0] === P.it)) m.push('cueillette');
        if (I && !(ALIMENTS_EFFETS[P.it] || I.food || I.heal || I.panse)) m.push('effet');
        if (ALIMENTS_EFFETS[P.it]) for (const r of ALIMENTS_EFFETS[P.it].r) if (!EFFETS[r[0]]) m.push('effet inconnu ' + r[0]);
        if (!ESSENCES[P.it]) m.push('essences');
        if (!NOTICE_PLANTES[P.o] || !ESPECES_PLANTES.some((e) => e[0] === P.o)) m.push('herbier');
        if (P.look && !(alchimie.VRAI[P.it] && alchimie.REM[P.it] && PLANT_LOOK[P.it])) m.push('alchimiste');
        if (!P.look) R.sansAllure.push(P.o);
        if (!NPC_DATA.some((d) => d.shop && (d.shop.buys || []).includes(P.it))) m.push('acheteur');
        if (!(I && I.price >= 1 && I.price <= 30)) m.push('prix');
        R.prix.push([P.r, I ? I.price : 0]);
        if (R.noms.has(P.nom)) m.push('nom en double'); R.noms.add(P.nom);
        // le sprite et l'icône se dessinent (des pixels opaques)
        try { const pb = spriteD2(P.o, 8111 + k * 31); let n = 0; for (let i = 3; i < pb.d.length; i += 4) if (pb.d[i]) n++; if (n < 20) R.sprites.push(P.o + ' (' + n + ')'); } catch (e) { R.sprites.push(P.o + ' : ' + e.message); }
        try { const pb = iconPaint(I.ic[0], I.ic[1], I.ic[2]); let n = 0; for (let i = 3; i < pb.d.length; i += 4) if (pb.d[i]) n++; if (n < 15) R.icones.push(P.it + ' (' + n + ')'); } catch (e) { R.icones.push(P.it + ' : ' + e.message); }
        if (m.length) R.manques.push(P.o + ' : ' + m.join(', '));
      });
      // les types d'avant ne bougent pas : les nôtres sont les derniers ajoutés par les modules d'avant 11-zzzzD2
      R.premier = premier; R.types = OBJ_TYPES.length;
      R.noms = R.noms.size;
      return JSON.stringify(R);
    })()`));
    verif(T.n === 40 && BIOMES_D2.every((b) => T.parBiome[b] === 10), `40 espèces, dix par biome : ${BIOMES_D2.map((b) => b + ' ' + (T.parBiome[b] || 0)).join(', ')}`);
    verif(!T.manques.length, 'chacune complète (objet, type, cueillette, effet, essences, herbier, alchimiste, acheteur, prix 1 à 30)' + (T.manques.length ? ' — ' + T.manques.join(' ; ') : ''));
    verif(T.ordre, `types du décor à la suite, du n° ${T.premier} (après les types d'avant)`);
    verif(!T.sprites.length && !T.icones.length, 'chaque sprite et chaque icône se dessinent' + (T.sprites.length ? ' — sprites : ' + T.sprites.join(', ') : '') + (T.icones.length ? ' — icônes : ' + T.icones.join(', ') : ''));
    const moy = (r) => { const L = T.prix.filter((p) => p[0] === r).map((p) => p[1]); return L.length ? L.reduce((a, b) => a + b, 0) / L.length : 0; };
    verif([0, 1, 2, 3].every((r) => moy(r) <= moy(r + 1)), `le prix suit la rareté (moyennes : ${[0, 1, 2, 3, 4].map((r) => moy(r).toFixed(1)).join(', ')})`);
    log(`  (sans allure à faire nommer, trop connues : ${T.sansAllure.join(', ')})`);

    log('\n2. Les recettes');
    const Rc = JSON.parse(J.ev(`(() => {
      const v = (id) => (ITEMS[id] && ITEMS[id].price) || 0;
      return JSON.stringify(RECIPES.filter((r) => ['pate_guimauve', 'lait_caille'].includes(r.out) || (r.need && r.need.jonc)).map((r) => ({ out: r.out, n: r.n, val: r.n * v(r.out), cout: Object.keys(r.need).reduce((a, k) => a + r.need[k] * v(k), 0) })));
    })()`));
    verif(Rc.length === 3 && Rc.every((r) => r.val <= r.cout + 1), 'pâte de guimauve, chandelles de jonc, lait caillé : ' + Rc.map((r) => `${r.out} ×${r.n} vaut ${r.val} pour ${r.cout}`).join(' ; '));

    log('\n3. La passe de génération (graine 1234)');
    const { vallee } = require('./vm.js');
    const w = await vallee(J, 1234);
    J.ctx.__w = w;
    const G = JSON.parse(J.ev(`(() => {
      const w = __w, WL = w.waterLevel, BW = w.biomeW, R = { n: {}, dans: {}, total: 0, chemins: [], zones: [], eau: [], hors: [], flottent: 0, flottantes: 0 };
      const bAt = (x, z) => BIOMES[w.biome[clamp(Math.floor(z / 8), 0, BW - 1) * BW + clamp(Math.floor(x / 8), 0, BW - 1)]];
      const mares = (w.fishZones || []).filter((Z) => Z.kind === 'marais');
      const lacs = (w.lakes || []).filter((L) => !L.kind);
      const P = {}; for (const Q of D2_PLANTES) P[Q.o] = Q;
      for (const o of w.objects) {
        const t = OBJ_TYPES[o.t], Q = t && P[t.id];
        if (!Q) continue;
        R.total++; R.n[Q.o] = (R.n[Q.o] || 0) + 1;
        const b = bAt(o.x, o.z), h = w.heightAt(o.x, o.z) - WL;
        let ok;
        if (Q.mil === 'marais') ok = mares.some((Z) => Math.hypot(Z.x - o.x, Z.z - o.z) < Z.r * 2.2);
        else if (Q.mil === 'lac') ok = b === 'lac' || lacs.some((L) => Math.hypot(L.x - o.x, L.z - o.z) < L.r * 1.6);
        else ok = b === Q.mil || (Q.mil === 'bouleaux' && b === 'foret') || (Q.mil === 'foret' && b === 'bouleaux');
        if (ok) R.dans[Q.o] = (R.dans[Q.o] || 0) + 1; else if (R.hors.length < 8) R.hors.push(Q.o + '@' + Math.round(o.x) + ',' + Math.round(o.z) + ' ' + b);
        const i = Math.round(o.x / w.cell), j = Math.round(o.z / w.cell), m = w.mats[j * w.W + i];
        if (m === M_DIRT || m === M_COBBLE) R.chemins.push(Q.o);
        for (const Z of w.noBuild || []) if (Math.hypot(Z.x - o.x, Z.z - o.z) < Z.r) { R.zones.push(Q.o); break; }
        const deau = Q.pl === 'eau' || Q.pl === 'bord_eau';
        if (!deau && h < 0.04) R.eau.push(Q.o);
        if (Q.pl === 'eau') { R.flottantes++; if (o.y !== undefined && Math.abs(o.y - WL - 0.02) < 0.01 && h < -0.3) R.flottent++; }
      }
      return JSON.stringify(R);
    })()`));
    const P = JSON.parse(J.ev('JSON.stringify(D2_PLANTES.map((P) => [P.o, P.r, P.mil]))'));
    const absentes = P.filter(([o]) => !G.n[o]).map(([o]) => o);
    verif(!absentes.length, `chaque espèce est posée (${G.total} pieds en tout)` + (absentes.length ? ' — absentes : ' + absentes.join(', ') : ''));
    verif(G.total <= MAX_TOTAL, `un total raisonnable : ${G.total} pieds (au plus ${MAX_TOTAL})`);
    const parR = [0, 1, 2, 3, 4].map((r) => { const L = P.filter((p) => p[1] === r).map(([o]) => G.n[o] || 0); return L.length ? L.reduce((a, b) => a + b, 0) / L.length : 0; });
    verif(parR.every((x, r) => r === 0 || x <= parR[r - 1]), `les rares sont moins nombreuses : pieds par espèce selon la rareté ${parR.map((x) => x.toFixed(1)).join(', ')}`);
    for (const b of BIOMES_D2) log(`  ${b.padEnd(9)} ${P.filter((p) => p[2] === b).map(([o, r]) => `${o} ${G.n[o] || 0}`).join(', ')}`);
    const dans = P.reduce((a, [o]) => a + (G.dans[o] || 0), 0);
    verif(dans >= G.total * 0.97, `dans leur milieu : ${dans} sur ${G.total}` + (G.hors.length ? ' (hors : ' + G.hors.join(', ') + ')' : ''));
    verif(!G.chemins.length && !G.zones.length, 'jamais sur un chemin ni dans une zone protégée' + (G.chemins.length ? ' — chemins : ' + G.chemins.slice(0, 6).join(', ') : '') + (G.zones.length ? ' — zones : ' + G.zones.slice(0, 6).join(', ') : ''));
    verif(!G.eau.length && G.flottent === G.flottantes && G.flottantes > 0, `les plantes de terre au sec, les plantes d'eau dans l'eau (${G.flottent} flottent sur ${G.flottantes})` + (G.eau.length ? ' — dans l’eau : ' + G.eau.slice(0, 6).join(', ') : ''));
    return { echecs };
  },
};
