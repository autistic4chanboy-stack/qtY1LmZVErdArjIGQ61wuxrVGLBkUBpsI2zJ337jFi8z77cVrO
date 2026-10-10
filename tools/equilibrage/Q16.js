// Équilibrage — des quêtes pour tout le monde (Q16)
//  - TOUT LE MONDE : chaque personne à qui l'on parle a au moins une quête (les habitants ; les bêtes qui parlent,
//    leur service compté ; la diseuse, le violoneux, le crieur, le voiturier, le marchand de joie, le roi Sucre, la
//    vieille des gobelins, Thibaud, la Dame, la veilleuse ; les dix du Dessous ; les vingt-quatre de Basse-Fosse) ;
//    environ un tiers en a deux ou plus ;
//  - LES RÉFÉRENCES : chaque objet demandé, donné ou cherché existe (les objets de quête : catégorie « quete », prix
//    0) ; chaque destinataire existe ; chaque lieu existe dans deux vallées (graines 1234 et 77) ; les ids sont uniques ;
//  - LES TEXTES : proposition, acceptation, attente, fin ; ce que dit le destinataire (remettre, message) ; ce qu'on
//    voit en arrivant (aller) ; chaque choix a son texte ;
//  - LES RÉCOMPENSES (les vraies fonctions, q16.finir, pour les autres ; les données pour les habitants) : chaque fin
//    donne quelque chose, au plus 250 pièces et 160 pièces d'objets ; toutes les nouvelles quêtes ensemble, la fin la
//    mieux payée de chacune, au plus 4000 pièces (en moyenne 100 au plus par quête) ;
//  - LES MODÈLES de Basse-Fosse : le même tirage pour une même partie, et chacun valable, sur cinquante graines.
'use strict';
const { vallee } = require('./vm.js');
module.exports = {
  titre: 'Des quêtes pour tout le monde (Q16)',
  async verifier(J, log) {
    let echecs = 0;
    const ko = (m) => { echecs++; log('ÉCHEC : ' + m); };
    J.ev('farm.s = farm.blank(1234)');

    // ---------------------------------------------------------------- tout le monde
    const T = JSON.parse(J.ev(`(() => {
      const st = q16.stats(), gens = [];
      // ceux qui doivent y être : les habitants, les bêtes, ceux du Dessous, les gens de Basse-Fosse (ids comme dans habitantsV5)
      for (const d of NPC_DATA) gens.push(d.id);
      for (const id of BP_ORDRE) gens.push('bete:' + id);
      for (const g of SOUT_GENS) gens.push('sout:' + g.k);
      const roles = V5_ROLES.map((R) => R.role).concat(Array.from({ length: V5_GENS }, () => 'habitant'), Array.from({ length: V5_ENFANTS }, () => 'enfant'));
      roles.forEach((r, k) => gens.push('v5:' + (r === 'greffier' ? 'greffier' : r + '_' + k)));
      for (const k of ['diseuse', 'violoneux', 'crieur', 'voiturier', 'marchand_joie', 'roi_sucre', 'aieule', 'thibaud', 'dame', 'veilleuse']) gens.push(k);
      const nouv = [];
      for (const id in Q16_HABITANTS) for (const q of Q16_HABITANTS[id]) nouv.push(q.id);
      for (const k of q16.cles()) for (const q of q16.P(k).quetes) nouv.push(q.id);
      return JSON.stringify({ st, gens, inconnus: Object.keys(st).filter((k) => !gens.includes(k)), nouv });
    })()`));
    const sans = T.gens.filter((g) => !(T.st[g] >= 1)), deux = T.gens.filter((g) => T.st[g] >= 2);
    log(`${T.gens.length} personnes, ${T.gens.length - sans.length} avec au moins une quête, ${deux.length} avec deux ou plus (${Math.round(deux.length / T.gens.length * 100)} %) ; ${T.nouv.length} quêtes nouvelles`);
    for (const g of sans) ko(`${g} n’a pas de quête`);
    for (const g of T.inconnus) ko(`des quêtes pour « ${g} », qui n’est personne`);
    if (deux.length < T.gens.length * 0.25) ko(`trop peu de gens avec deux quêtes (${deux.length})`);

    // ---------------------------------------------------------------- les références et les textes
    const R = JSON.parse(J.ev(`(() => {
      const out = [], ids = {}, vide = (s) => typeof s !== 'string' || !s.trim();
      const objet = (k) => ITEMS[k] || (typeof ITEM_GROUPS !== 'undefined' && ITEM_GROUPS[k]);
      const toutes = [];
      for (const id in Q16_HABITANTS) for (const q of Q16_HABITANTS[id]) toutes.push([id, q, true]);
      for (const k of q16.cles()) for (const q of q16.P(k).quetes) toutes.push([k, q, false]);
      for (const d of NPC_DATA) for (const q of d.quests) ids[q.id] = (ids[q.id] || 0) + 1;
      for (const k of q16.cles()) for (const q of q16.P(k).quetes) ids[q.id] = (ids[q.id] || 0) + 1;
      for (const [qui, q, hab] of toutes) {
        const e = [], lieux = [];
        if (!NPC_BY_ID[qui] && !q16.P(qui)) e.push('donneur inconnu');
        if (vide(q.id) || vide(q.title)) e.push('id, titre');
        if (ids[q.id] > 1) e.push('id en double');
        if (!['apporter', 'livrer', 'parler', 'trouver', 'enquete', 'aller', 'chasse'].includes(q.type)) e.push('sorte ' + q.type);
        if (hab && (q.type === 'livrer' || q.type === 'parler') && !NPC_BY_ID[q.a]) e.push('un habitant ne peut envoyer qu’à un habitant');
        const X = q.texte || {};
        for (const k of ['offre', 'accepte', 'attente', 'fin']) if (vide(X[k])) e.push('texte.' + k);
        if ((q.type === 'livrer' || q.type === 'parler') && vide(X.recu)) e.push('texte.recu');
        if (q.type === 'aller' && vide(X.vu)) e.push('texte.vu');
        if (q.type === 'apporter') { if (!q.need || !Object.keys(q.need).length) e.push('rien à apporter'); else for (const k in q.need) if (!objet(k) || !(q.need[k] > 0)) e.push('objet ' + k); }
        if (q.type === 'livrer' || q.type === 'trouver') { if (!ITEMS[q.objet]) e.push('objet ' + q.objet); else if (ITEMS[q.objet].cat !== 'quete' || ITEMS[q.objet].price) e.push('l’objet ' + q.objet + ' se vendrait'); }
        if (q.type === 'livrer' || q.type === 'parler') { if (!NPC_BY_ID[q.a] && !q16.P(q.a)) e.push('destinataire ' + q.a); if (q.a === qui) e.push('à soi-même'); }
        if (q.type === 'trouver' || q.type === 'aller' || q.type === 'enquete') { if (!LIEU_NAMES[q.lieu]) e.push('lieu sans nom ' + q.lieu); lieux.push(q.lieu); }
        if ((q.type === 'aller' || q.type === 'enquete') && q.moment && !['nuit', 'aube', 'soir'].includes(q.moment)) e.push('moment ' + q.moment);
        if (q.type === 'enquete' && hab && !['nuit', 'aube'].includes(q.moment)) e.push('enquête d’habitant : la nuit ou l’aube');
        if (q.type === 'chasse' && (!CHASSE_NOMS[q.bete] || !(q.n >= 1))) e.push('bête ' + q.bete);
        if (q.apres && !q16.def(q.apres)) e.push('après ' + q.apres);
        const fins = q.choix && q.choix.length ? q.choix.map((c) => { if (vide(c.label) || vide(c.texte)) e.push('choix sans texte'); return c; }) : [{ reward: q.reward }];
        const recs = fins.map((c) => {
          const Rw = c.reward || {};
          let val = 0;
          for (const k in Rw.objets || {}) { if (!ITEMS[k]) e.push('récompense ' + k); else val += (ITEMS[k].price || 0) * Rw.objets[k]; }
          if (Rw.recette && !ITEMS[Rw.recette]) e.push('recette ' + Rw.recette);
          const quoi = (Rw.argent > 0) || (Rw.amitie > 0) || Object.keys(Rw.objets || {}).length > 0 || !!Rw.recette || !!c.garde;
          return { argent: Rw.argent || 0, val, quoi };
        });
        out.push({ qui, id: q.id, titre: q.title, type: q.type, hab, lieux, e, recs });
      }
      return JSON.stringify(out);
    })()`));
    const parSorte = {};
    for (const q of R) {
      parSorte[q.type] = (parSorte[q.type] || 0) + 1;
      if (q.e.length) ko(`${q.id} (${q.qui}) : ${q.e.join(' ; ')}`);
      for (const r of q.recs) {
        if (!r.quoi) ko(`${q.id} : une fin qui ne donne rien`);
        if (r.argent < 0 || r.argent > 250) ko(`${q.id} : ${r.argent} pièces (hors 0-250)`);
        if (r.val > 160) ko(`${q.id} : ${r.val} pièces d’objets`);
      }
    }
    log(`sortes : ${Object.entries(parSorte).map(([k, v]) => k + ' ' + v).join(', ')}`);

    // ---------------------------------------------------------------- les récompenses des autres, avec les vraies fonctions
    const F = JSON.parse(J.ev(`(() => {
      const su0 = ui.subtitle; ui.subtitle = () => {};
      const out = [];
      for (const k of q16.cles()) for (const q of q16.P(k).quetes) {
        const n = q.choix && q.choix.length ? q.choix.length : 1;
        for (let ci = 0; ci < n; ci++) {
          farm.s = farm.blank(1234); farm.s.day = 10;
          if (q.need) for (const it in q.need) { const id = ITEMS[it] ? it : (ITEM_GROUPS[it] || [])[0]; farm.give(id, q.need[it]); }
          if (q.type === 'trouver') farm.give(q.objet, 1);
          const S = q16.S();
          S.Q[q.id] = { st: 'actif', day: 10, step: 1, base: 0 };
          if (q.type === 'chasse') { chasse.S().tableau[q.bete] = q.n || 1; }
          const m0 = farm.s.money, inv0 = Object.assign({}, farm.s.inv);
          let err = null, ok = false;
          try { ok = q16.finir(q.id, ci); } catch (e) { err = String(e && e.message || e); }
          const gagne = Object.keys(farm.s.inv).filter((x) => (farm.s.inv[x] || 0) > (inv0[x] || 0));
          const val = gagne.reduce((a, x) => a + (ITEMS[x].price || 0) * ((farm.s.inv[x] || 0) - (inv0[x] || 0)), 0);
          const garde = q.type === 'trouver' && farm.count(q.objet) > 0;
          out.push({ id: q.id, ci, ok, err, st: S.Q[q.id].st, argent: farm.s.money - m0, gagne, val, garde });
        }
      }
      ui.subtitle = su0; farm.s = null;
      return JSON.stringify(out);
    })()`));
    const parQuete = {};
    for (const r of F) {
      if (r.err) ko(`${r.id} (fin ${r.ci}) : erreur ${r.err}`);
      if (!r.ok || r.st !== 'fait') ko(`${r.id} (fin ${r.ci}) : la quête ne finit pas`);
      if (!r.argent && !r.gagne.length && !r.garde) ko(`${r.id} (fin ${r.ci}) : rien gagné`);
      if (r.argent > 250 || r.val > 160) ko(`${r.id} (fin ${r.ci}) : ${r.argent} pièces, ${r.val} d’objets`);
    }
    for (const q of R) parQuete[q.id] = Math.max(...q.recs.map((r) => r.argent));
    const tot = Object.values(parQuete).reduce((a, b) => a + b, 0), moy = tot / Math.max(1, R.length);
    log(`argent, la fin la mieux payée de chaque nouvelle quête : ${tot} pièces en tout (${moy.toFixed(0)} en moyenne, ${(tot / 375).toFixed(1)} journées du début), ${F.length} fins essayées`);
    if (tot > 4000 || moy > 100) ko(`les nouvelles quêtes rapportent trop (${tot} pièces)`);

    // ---------------------------------------------------------------- les modèles de Basse-Fosse
    const M = JSON.parse(J.ev(`(() => {
      const out = { diff: 0, mauvais: [], titres: {} };
      for (let g = 1; g <= 50; g++) for (const A of Q16_V5_ANONYMES) {
        const a = q16Modele(g * 7919, A), b = q16Modele(g * 7919, A);
        if (a !== b) out.diff++;
        if (!a || !(Q16_V5_MODELES[A.role] || []).includes(a)) out.mauvais.push(A.id);
        out.titres[a.title] = 1;
      }
      return JSON.stringify(out);
    })()`));
    if (M.diff) ko(`les modèles de Basse-Fosse changent d’un tirage à l’autre (${M.diff})`);
    if (M.mauvais.length) ko(`modèles invalides : ${M.mauvais.slice(0, 5).join(', ')}`);
    log(`Basse-Fosse : ${Object.keys(M.titres).length} modèles tirés sur cinquante parties`);

    // ---------------------------------------------------------------- les lieux, dans deux vallées
    const lieux = [...new Set(R.flatMap((q) => q.lieux))];
    for (const graine of [1234, 77]) {
      const w = await vallee(J, graine);
      const manque = lieux.filter((k) => !w.lm[k]);
      for (const k of manque) ko(`vallée ${graine} : pas de lieu « ${k} »`);
      log(`vallée ${graine} : ${lieux.length - manque.length} / ${lieux.length} lieux trouvés`);
    }
    return { echecs };
  },
};
