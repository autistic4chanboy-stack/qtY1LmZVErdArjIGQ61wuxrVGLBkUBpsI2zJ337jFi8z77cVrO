// Équilibrage — LES BÊTES DES BOIS ET DU MARAIS (agent E3 : 05-zzzzzE3-betes.js, 10-zzzzE3-betes.js, 11-zzzzE3-betes.js) :
//   node tools/equilibrage.js E3
// 1. trente bêtes (dix par milieu : la forêt, le bois de bouleaux, le marais), chacune sa notice, sa rareté, sa
//    conduite, son modèle, ses heures et son lieu, et ce qu'elle laisse (des objets qui existent) ;
// 2. les objets nouveaux : un prix raisonnable, une essence (alchimie), quelqu'un qui les achète ;
// 3. les TERRITOIRES, sur la vallée dessinée (graine 12345, celle des parties neuves) : chaque bête en a au moins un,
//    d'autant moins qu'elle est rare ; ceux du marais sont bien dans le marais (que la carte des biomes ignore) ; la
//    chance qu'un territoire soit habité un jour donné baisse avec la rareté, la place d'une bête tuée reste vide
//    plus longtemps ; peu de bêtes à la fois (E3_MAX) ;
// 4. ce que rapportent les bêtes, comparé au revenu d'une journée (commerce.js : début ≈ 375 pièces).
'use strict';
const { vallee } = require('./vm.js');
module.exports = {
  titre: 'Les bêtes des bois et du marais (E3) : espèces, objets, territoires',
  async verifier(J, log) {
    let echecs = 0;
    const verif = (ok, txt) => { log((ok ? '  ok   ' : '  ÉCHEC ') + txt); if (!ok) echecs++; };
    const R = J.ev(`(() => {
      const out = { n: E3_BETES.length, parMilieu: {}, manques: [], objets: [], sansAcheteur: [], prix: [], max: E3_MAX, presence: E3_PRESENCE, vide: E3_VIDE };
      const ACH = {};
      for (const d of NPC_DATA) if (d.shop && d.shop.buys) for (const k of d.shop.buys) (ACH[k] || (ACH[k] = [])).push(d.id);
      for (const [k, nom, hab, rar, dang] of E3_BETES) {
        const V = E3_VIE[k], C = CREATURES[k], P = PREY[k];
        const m = V && V.mil[0];
        out.parMilieu[m] = (out.parMilieu[m] || 0) + 1;
        const pb = [];
        if (!V) pb.push('heures et lieu'); else { if (!V.h.length || V.h.some(([a, b]) => !(a >= 0 && b <= 24 && a < b))) pb.push('heures'); if (!E3_PORTEE[V.lieu]) pb.push('lieu'); }
        if (!C || !C.e3 || !E3_COMPORTE[C.e3]) pb.push('conduite');
        if (!C || !ANIMAL_RIGS[C.rig] || !/^e3_/.test(C.rig)) pb.push('modèle');
        else { try { const r = ANIMAL_RIGS[C.rig](0); if (!r || !r.parts.length) pb.push('modèle vide'); } catch (e) { pb.push('modèle : ' + e.message); } }
        if (!NOTICE_ANIMAUX[k] || NOTICE_ANIMAUX[k].length < 80) pb.push('notice');
        if (!hab.length || hab.some((h) => !HABITATS[h])) pb.push('milieux du livre');
        if (!(rar >= 0 && rar <= 3) || !(dang >= 0 && dang <= 1)) pb.push('rareté ou danger');
        if (!P) pb.push('butin'); else for (const d of P.drop) if (!ITEMS[d[0]]) pb.push('objet ' + d[0]);
        if (!CHASSE_NOMS[k]) pb.push('nom de chasse');
        if (pb.length) out.manques.push(k + ' (' + pb.join(', ') + ')');
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

    log('\n3. Les territoires (vallée dessinée, graine 12345)');
    const t0 = Date.now(), w = await vallee(J, 12345);
    J.ctx.__w = w;
    const T = JSON.parse(J.ev(`(() => {
      const w = __w, T = e3.territoires(w), M = e3.marais(w), par = {}, horsMilieu = [], marais = [];
      for (const t of T) {
        par[t.k] = (par[t.k] || 0) + 1;
        const m = e3.milieu(w, t.x, t.z);
        if (!E3_VIE[t.k].mil.includes(m)) horsMilieu.push(t.id + '@' + m);
        if (E3_VIE[t.k].mil[0] === 'marais' && M && Math.hypot(t.x - M.x, t.z - M.z) > M.r) marais.push(t.id);
      }
      const rar = {}; for (const [k, , , r] of E3_BETES) rar[k] = r;
      return JSON.stringify({ n: T.length, par, rar, horsMilieu, marais, M });
    })()`));
    log(`  (vallée en ${((Date.now() - t0) / 1000).toFixed(0)} s) ${T.n} territoires ; le marais : centre ${T.M ? Math.round(T.M.x) + ', ' + Math.round(T.M.z) + ', rayon ' + Math.round(T.M.r) + ' m' : 'introuvable'}`);
    const sans = Object.keys(T.rar).filter((k) => !T.par[k]);
    verif(!sans.length, 'chaque bête a au moins un territoire' + (sans.length ? ' — sans territoire : ' + sans.join(', ') : ''));
    const parRar = [0, 1, 2, 3].map((r) => { const L = Object.keys(T.rar).filter((k) => T.rar[k] === r).map((k) => T.par[k] || 0); return L.length ? L.reduce((a, b) => a + b, 0) / L.length : null; });
    log('  territoires par bête, en moyenne : ' + parRar.map((v, r) => v === null ? '' : ['commune', 'peu commune', 'rare', 'très rare'][r] + ' ' + v.toFixed(1)).filter(Boolean).join(' ; '));
    log('  ' + Object.entries(T.par).map(([k, n]) => `${k} ${n}`).join(', '));
    verif(parRar[0] > parRar[1] && parRar[1] > parRar[2] && parRar[2] >= parRar[3], 'les bêtes rares ont moins de territoires que les communes');
    verif(!T.horsMilieu.length && !T.marais.length, 'chaque territoire est dans son milieu, ceux du marais dans le marais' + (T.horsMilieu.length || T.marais.length ? ' — ' + T.horsMilieu.concat(T.marais).join(', ') : ''));
    verif(E.presence.every((p, i) => !i || p < E.presence[i - 1]) && E.vide.every((v, i) => !i || v > E.vide[i - 1]), `habité un jour donné : ${E.presence.map((p) => Math.round(p * 100) + ' %').join(', ')} ; vide après une mort : ${E.vide.join(', ')} jour(s) (de commune à très rare)`);
    verif(E.max <= 6, `peu de bêtes à la fois : ${E.max} groupes au plus (une harde de daims compte pour un)`);

    log('\n4. Ce qu’elles rapportent');
    const P = Object.fromEntries(E.prix);
    const aigrette = P.plume_aigrette * 1.5, daim = 2.5 * 5 + 6 + 0.85 * 0.5 * P.bois_daim;
    log(`  une aigrette ≈ ${aigrette.toFixed(0)} pièces (plumes) ; un daim ≈ ${daim.toFixed(0)} (viande, cuir, parfois le bois) ; un grand mars ${P.grand_mars}`);
    verif(aigrette < 375 * 0.2 && daim < 375 * 0.2 && P.grand_mars < 375 * 0.1, 'aucune ne vaut plus d’un cinquième d’une journée de travail du début (≈ 375 pièces)');
    return { echecs };
  },
};
