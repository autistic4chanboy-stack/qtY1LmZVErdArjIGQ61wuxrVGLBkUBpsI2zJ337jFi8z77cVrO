// Équilibrage — LES BÊTES DES BOIS ET DU MARAIS (agent E3 : 05-zzzzzE3-betes.js, 10-zzzzE3-betes.js, 11-zzzzE3-betes.js) :
//   node tools/equilibrage.js E3
// 1. trente bêtes (dix par milieu : la forêt, le bois de bouleaux, le marais), chacune sa notice, sa rareté, sa
//    conduite, son modèle, ses heures et son lieu, et ce qu'elle laisse (des objets qui existent) ;
// 2. les objets nouveaux : un prix raisonnable, une essence (alchimie), quelqu'un qui les achète ;
// 3. la fréquence des apparitions (E3_POIDS, E3_ESSAI) : l'attente, quand tout convient (milieu, heure, temps, une
//    place libre), croît avec la rareté — commune en moins d'une minute, très rare en plusieurs minutes — et peu de
//    bêtes à la fois (E3_MAX) ;
// 4. ce que rapportent les bêtes, comparé au revenu d'une journée (commerce.js : début ≈ 375 pièces).
'use strict';
module.exports = {
  titre: 'Les bêtes des bois et du marais (E3) : espèces, objets, apparitions',
  async verifier(J, log) {
    let echecs = 0;
    const verif = (ok, txt) => { log((ok ? '  ok   ' : '  ÉCHEC ') + txt); if (!ok) echecs++; };
    const R = J.ev(`(() => {
      const out = { n: E3_BETES.length, parMilieu: {}, manques: [], objets: [], sansAcheteur: [], prix: [], attente: [], max: E3_MAX, essai: E3_ESSAI };
      const ACH = {};
      for (const d of NPC_DATA) if (d.shop && d.shop.buys) for (const k of d.shop.buys) (ACH[k] || (ACH[k] = [])).push(d.id);
      for (const [k, nom, hab, rar, dang] of E3_BETES) {
        const V = E3_VIE[k], C = CREATURES[k], P = PREY[k];
        const m = V && V.mil[0];
        out.parMilieu[m] = (out.parMilieu[m] || 0) + 1;
        const pb = [];
        if (!V) pb.push('heures et lieu'); else { if (!V.h.length || V.h.some(([a, b]) => !(a >= 0 && b <= 24 && a < b))) pb.push('heures'); if (!['sol', 'ciel', 'arbre', 'chene', 'bouleau', 'rive', 'eau', 'humide'].includes(V.lieu)) pb.push('lieu'); }
        if (!C || !C.e3 || !E3_COMPORTE[C.e3]) pb.push('conduite');
        if (!C || !ANIMAL_RIGS[C.rig] || !/^e3_/.test(C.rig)) pb.push('modèle');
        else { try { const r = ANIMAL_RIGS[C.rig](0); if (!r || !r.parts.length) pb.push('modèle vide'); } catch (e) { pb.push('modèle : ' + e.message); } }
        if (!NOTICE_ANIMAUX[k] || NOTICE_ANIMAUX[k].length < 80) pb.push('notice');
        if (!hab.length || hab.some((h) => !HABITATS[h])) pb.push('milieux du livre');
        if (!(rar >= 0 && rar <= 3) || !(dang >= 0 && dang <= 1)) pb.push('rareté ou danger');
        if (!P) pb.push('butin'); else for (const d of P.drop) if (!ITEMS[d[0]]) pb.push('objet ' + d[0]);
        if (!CHASSE_NOMS[k]) pb.push('nom de chasse');
        if (pb.length) out.manques.push(k + ' (' + pb.join(', ') + ')');
        // l'attente moyenne avant qu'elle paraisse, quand tout convient (une place libre, le bon milieu, la bonne heure)
        out.attente.push([k, rar, E3_ESSAI / E3_POIDS[rar]]);
      }
      for (const id of ['bois_daim', 'plume_peintre', 'plume_aigrette', 'sangsue', 'capricorne', 'cicindele', 'grand_mars', 'morio', 'cuivre_marais']) {
        const I = ITEMS[id];
        out.objets.push(id);
        if (!I || !I.name || !I.desc) { out.manques.push('objet ' + id); continue; }
        out.prix.push([id, I.price]);
        if (!ACH[id]) out.sansAcheteur.push(id);
        if (I.cat !== 'tresor' && !ESSENCES[id]) out.manques.push('essence ' + id);
      }
      return JSON.stringify(out);
    })()`);
    const E = JSON.parse(R);
    log('\n1. Les bêtes');
    verif(E.n === 30 && E.parMilieu.foret === 10 && E.parMilieu.bouleaux === 10 && E.parMilieu.marais === 10, `${E.n} bêtes : ${E.parMilieu.foret} de la forêt, ${E.parMilieu.bouleaux} du bois de bouleaux, ${E.parMilieu.marais} du marais`);
    verif(!E.manques.length, 'chacune sa notice, ses milieux, sa rareté, sa conduite, son modèle, ses heures, son lieu, son butin, son nom' + (E.manques.length ? ' — manque : ' + E.manques.join(' ; ') : ''));
    log('\n2. Les objets');
    verif(E.prix.every(([, p]) => p >= 2 && p <= 30), 'prix entre 2 et 30 pièces : ' + E.prix.map(([i, p]) => `${i} ${p}`).join(', '));
    verif(!E.sansAcheteur.length, 'chacun trouve preneur' + (E.sansAcheteur.length ? ' — sans acheteur : ' + E.sansAcheteur.join(', ') : ''));
    log('\n3. Les apparitions');
    const moy = [0, 1, 2, 3].map((r) => { const L = E.attente.filter((a) => a[1] === r).map((a) => a[2]); return L.length ? L.reduce((s, v) => s + v, 0) / L.length : null; });
    log(`  attente moyenne, quand tout convient : ${moy.map((v, r) => v === null ? '' : ['commune', 'peu commune', 'rare', 'très rare'][r] + ' ' + (v / 60).toFixed(1) + ' min').filter(Boolean).join(' ; ')}`);
    verif(moy[0] < 60 && moy[1] < 120 && moy[2] >= 60 && moy[2] < 600 && moy[3] >= 240, 'l’attente croît avec la rareté (commune < 1 min, peu commune < 2 min, rare de 1 à 10 min, très rare ≥ 4 min)');
    verif(E.max <= 6, `peu de bêtes à la fois : ${E.max} groupes au plus (une harde de daims compte pour un)`);
    log('\n4. Ce qu’elles rapportent');
    const P = Object.fromEntries(E.prix);
    const aigrette = P.plume_aigrette * 1.5, daim = 2.5 * 5 + 6 + 0.85 * 0.5 * P.bois_daim;
    log(`  une aigrette ≈ ${aigrette.toFixed(0)} pièces (plumes) ; un daim ≈ ${daim.toFixed(0)} (viande, cuir, parfois le bois) ; un grand mars ${P.grand_mars}`);
    verif(aigrette < 375 * 0.2 && daim < 375 * 0.2 && P.grand_mars < 375 * 0.1, 'aucune ne vaut plus d’un cinquième d’une journée de travail du début (≈ 375 pièces)');
    return { echecs };
  },
};
