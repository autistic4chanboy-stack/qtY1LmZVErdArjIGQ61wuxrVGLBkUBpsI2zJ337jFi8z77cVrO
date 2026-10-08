// Équilibrage — les BÊTES de la lande, des hauteurs et du bord du lac (agent E2, douzième vague) :
//   node tools/equilibrage.js E2
// 1. les trente espèces sont complètes : conduite, modèle (« e2_… »), butin, notice, place au livre des bêtes, nom à la
//    chasse, cri ; dix par milieu ; les dangereuses restent rares et lisibles ;
// 2. les objets nouveaux : un nom, une notice, une icône, un prix raisonnable, des essences, quelqu'un qui les achète, et
//    personne qui les vend (pas d'achat-revente) ;
// 3. les territoires, tirés de la graine sur la vraie vallée : chaque espèce en a, au plus près de ce que dit sa rareté,
//    et aucun objet n'est ajouté au monde (les sauvegardes retrouvent les leurs).
'use strict';
const { vallee } = require('./vm.js');

const GRAINE = +(process.env.E2_GRAINE || 1234);

module.exports = {
  titre: 'Bêtes de la lande, des hauteurs et du lac (E2) : espèces, objets, territoires',
  async verifier(J, log) {
    let echecs = 0;
    const verif = (ok, texte) => { if (!ok) echecs++; log(`  ${ok ? 'ok   ' : 'ÉCHEC'} ${texte}`); };

    log('\n1. Les espèces');
    const E = JSON.parse(J.ev(`(() => {
      const R = { n: E2_BETES.length, parBiome: {}, manques: [], rigs: [], dangers: [], rares: [] };
      const cris = String(SoundEngine.prototype.e2Cri);
      for (const B of E2_BETES) {
        R.parBiome[B.biome] = (R.parBiome[B.biome] || 0) + 1;
        const m = [], C = CREATURES[B.id];
        if (!C) m.push('conduite');
        else if (!(C.fly ? E2_VOL[C.e2] : E2_COMPORTE[C.e2])) m.push('conduite propre');
        let rig = null; try { rig = C && ANIMAL_RIGS[C.rig] && ANIMAL_RIGS[C.rig](0); } catch (e) { rig = null; }
        if (!rig || !rig.parts || !rig.parts.length) m.push('modèle');
        else R.rigs.push(C.rig + ':' + rig.parts.length);
        if (C && !/^e2_/.test(C.rig)) m.push('modèle sans « e2_ »');
        if (!PREY[B.id]) m.push('butin');
        if (!NOTICE_ANIMAUX[B.id] || NOTICE_ANIMAUX[B.id].length < 80) m.push('notice');
        if (!ESPECES_ANIMAUX.some((e) => e[0] === B.id)) m.push('livre des bêtes');
        if (!CHASSE_NOMS[B.id]) m.push('nom à la chasse');
        if (!B.hab.every((h) => HABITATS[h])) m.push('milieux');
        if (!['jour', 'nuit', 'crepuscule', 'toujours'].includes(B.h)) m.push('heure');
        if (m.length) R.manques.push(B.id + ' : ' + m.join(', '));
        if (B.d >= 1) R.dangers.push({ id: B.id, d: B.d, r: B.r, bite: !!(C && C.bite) });
      }
      // un cri pour chaque sorte appelée dans les conduites
      const src = String(Object.values(E2_COMPORTE).map(String).join('\\n') + Object.values(E2_VOL).map(String).join('\\n'));
      const sortes = new Set([...src.matchAll(/E2C\\.cri\\(\\w+, '(\\w+)'/g)].map((x) => x[1]));
      R.sortes = [...sortes];
      R.sansCri = R.sortes.filter((k) => !cris.includes("case '" + k + "'"));
      return JSON.stringify(R);
    })()`));
    log(`  ${E.n} espèces : ${Object.entries(E.parBiome).map(([k, n]) => k + ' ' + n).join(', ')} ; modèles : ${E.rigs.length} (${E.rigs.slice(0, 6).join(', ')}…)`);
    verif(E.n === 30 && E.parBiome.lande === 10 && E.parBiome.hauteurs === 10 && E.parBiome.lac === 10, 'trente espèces, dix par milieu (lande, hauteurs, bord du lac)');
    verif(!E.manques.length, 'chacune sa conduite, son modèle « e2_… », son butin, sa notice, sa place au livre des bêtes, son nom à la chasse, ses milieux, son heure' + (E.manques.length ? ' — manque : ' + E.manques.join(' ; ') : ''));
    verif(!E.sansCri.length && E.sortes.length >= 20, `${E.sortes.length} cris différents, tous synthétisés` + (E.sansCri.length ? ' — sans son : ' + E.sansCri.join(', ') : ''));
    const D = E.dangers;
    log(`  dangereuses : ${D.map((x) => x.id + ' (danger ' + x.d + ', rareté ' + x.r + ')').join(', ')}`);
    verif(D.every((x) => x.r >= 1) && D.filter((x) => x.d >= 2).every((x) => x.bite), 'les dangereuses ne sont pas communes, et la vipère siffle avant de mordre (beasts.snake)');

    log('\n2. Les objets');
    const O = JSON.parse(J.ev(`(() => {
      const ids = ['plume_huppe', 'peau_genette', 'minotaure', 'sphinx_tete_mort', 'apollon', 'plume_gypaete', 'plume_tichodrome', 'plume_lyre', 'peau_vison', 'plume_balbuzard', 'plume_cormoran', 'os_gypaete'];
      const R = { objets: [], manques: [], vendus: [], sansAcheteur: [] };
      for (const id of ids) {
        const I = ITEMS[id], m = [];
        if (!I) { R.manques.push(id + ' : absent'); continue; }
        if (!I.name || !I.desc || !Array.isArray(I.ic)) m.push('nom, notice ou icône');
        if (!(I.price >= 1 && I.price <= 40)) m.push('prix ' + I.price);
        if (!ESSENCES[id]) m.push('essences');
        let acheteur = I.cat === 'tresor' && typeof ACT_ETALS !== 'undefined' && ACT_ETALS.some((r) => r.achete);
        for (const d of NPC_DATA) if (d.shop) {
          if ((d.shop.buys || []).includes(id)) acheteur = true;
          if ((d.shop.sells || []).some((x) => x[0] === id)) R.vendus.push(id + ' (' + d.id + ')');
        }
        if (!acheteur) R.sansAcheteur.push(id);
        if (m.length) R.manques.push(id + ' : ' + m.join(', '));
        R.objets.push(id + ' ' + I.price);
      }
      R.prises = Object.keys(nature2.PRISES).filter((k) => ['sphinx_tete_mort', 'apollon', 'minotaure'].includes(k));
      return JSON.stringify(R);
    })()`));
    log(`  ${O.objets.join(', ')}`);
    verif(!O.manques.length, 'douze objets, chacun son nom, sa notice, son icône, un prix de 1 à 40, ses essences' + (O.manques.length ? ' — ' + O.manques.join(' ; ') : ''));
    verif(!O.sansAcheteur.length && !O.vendus.length, 'chacun a un acheteur (chasseur, alchimiste, maire, brocanteur), personne ne les vend' + (O.sansAcheteur.length ? ' — sans acheteur : ' + O.sansAcheteur.join(', ') : '') + (O.vendus.length ? ' — vendus : ' + O.vendus.join(', ') : ''));
    verif(O.prises.length === 3, 'le filet prend le sphinx, l’apollon et le minotaure');

    log(`\n3. Les territoires (graine ${GRAINE}, la vraie vallée)`);
    const t0 = Date.now();
    const nObj0 = J.ev('OBJ_TYPES.length');
    const w = await vallee(J, GRAINE);
    J.ctx.__w = w;
    const T = JSON.parse(J.ev(`(() => {
      const T = e2betes.calculer(__w), par = {};
      for (const q of T.liste) par[q.B.id] = (par[q.B.id] || 0) + 1;
      const R = { ms: T.ms, n: T.liste.length, par, attendu: {}, rar: {}, e2Types: OBJ_TYPES.filter((t) => /^e2_/.test(t.id)).length };
      for (const B of E2_BETES) { R.attendu[B.id] = B.T; R.rar[B.id] = B.r; }
      return JSON.stringify(R);
    })()`));
    log(`  vallée générée en ${((Date.now() - t0) / 1000).toFixed(0)} s ; ${T.n} territoires calculés en ${T.ms} ms`);
    const ligne = Object.keys(T.attendu).map((k) => `${k} ${T.par[k] || 0}/${T.attendu[k]}`);
    for (let i = 0; i < ligne.length; i += 6) log('  ' + ligne.slice(i, i + 6).join(', '));
    const sans = Object.keys(T.attendu).filter((k) => !T.par[k]);
    const loin = Object.keys(T.attendu).filter((k) => (T.par[k] || 0) < Math.ceil(T.attendu[k] * 0.6));
    verif(!sans.length, 'chaque espèce a au moins un territoire' + (sans.length ? ' — aucune place pour : ' + sans.join(', ') : ''));
    verif(!loin.length, 'chaque espèce trouve au moins 60 % des territoires voulus' + (loin.length ? ' — trop peu : ' + loin.join(', ') : ''));
    const tresRares = Object.keys(T.rar).filter((k) => T.rar[k] >= 3), communes = Object.keys(T.rar).filter((k) => T.rar[k] === 0);
    verif(tresRares.every((k) => (T.par[k] || 0) <= 2) && communes.every((k) => (T.par[k] || 0) >= 3), `les très rares ont un ou deux territoires (${tresRares.map((k) => k + ' ' + (T.par[k] || 0)).join(', ')}), les communes au moins trois`);
    verif(T.e2Types === 0 && J.ev('OBJ_TYPES.length') === nObj0, 'aucun type d’objet ni objet nouveau dans le monde : les territoires ne sont que des points');
    verif(T.ms < 400, `le calcul des territoires reste court au chargement (${T.ms} ms)`);
    return { echecs };
  },
};
