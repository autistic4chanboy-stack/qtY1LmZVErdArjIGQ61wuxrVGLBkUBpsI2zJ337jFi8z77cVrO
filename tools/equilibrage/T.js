// Équilibrage — les quêtes principales à lieux précis (agent T, treizième vague)
//  - LES OBJETS : de quête (catégorie « quete », prix 0 : ils ne se vendent pas) ;
//  - LES TEXTES : chaque quête a sa proposition (habitant, lettre, avis, objet trouvé) et ses trois réponses, trois à
//    cinq étapes (un lieu nommé, deux plans de scène, une phrase de carnet, ce qu'on y trouve), une fin à deux choix ;
//    chaque quête a des scènes DEDANS et des scènes DEHORS ;
//  - LES RÉCOMPENSES, mesurées avec les vraies fonctions (quetes.finir, puis le courrier qui suit) : chaque fin donne
//    quelque chose (argent, objet, recette, avantage durable), aucune ne paie plus de 250 pièces, et toutes les quêtes
//    ensemble (la fin la mieux payée de chacune) moins de deux journées et demie de revenu du début (≈ 375 la journée) ;
//  - LES LIEUX, dans deux vallées (graines 1234 et 77) : chaque étape a son lieu et sa scène (un cadrage trouvé, en
//    moins de 400 ms) ; dedans, l'endroit est dans l'emprise du bâtiment ; dehors, l'objet posé est hors de l'eau ; et
//    les lieux sont LES MÊMES d'une vallée à l'autre (à 0,5 m près).
'use strict';
const { vallee } = require('./vm.js');
module.exports = {
  titre: 'Les quêtes principales à lieux précis (T)',
  async verifier(J, log) {
    let echecs = 0;
    const ko = (m) => { echecs++; log('ÉCHEC : ' + m); };
    // ---------------------------------------------------------------- les objets
    const I = JSON.parse(J.ev(`JSON.stringify(['t_plaque_roulier', 't_lettre_leonie', 't_longue_vue', 't_crecelle', 't_registre_menard'].map((id) => ITEMS[id] ? { id, cat: ITEMS[id].cat, price: ITEMS[id].price, name: ITEMS[id].name } : { id, manque: true }))`));
    for (const it of I) {
      if (it.manque) ko(`pas d’objet « ${it.id} »`);
      else if (it.cat !== 'quete' || it.price) ko(`l’objet « ${it.id} » se vendrait (${it.cat}, ${it.price})`);
    }
    log(`objets de quête : ${I.filter((i) => !i.manque).map((i) => i.name).join(', ')} (prix 0)`);

    // ---------------------------------------------------------------- les textes
    const T = JSON.parse(J.ev(`(() => {
      const out = [], vide = (s) => typeof s !== 'string' || !s.trim();
      for (const id of QT_ORDRE) {
        const D = QT_QUETES[id], P = D.propose || {}, e = [];
        if (vide(D.titre) || vide(D.quiNom) || !['pnj', 'lettre', 'avis', 'objet'].includes(D.qui)) e.push('titre, qui');
        for (const k of ['texte', 'oui', 'plusTard', 'non', 'resume']) if (vide(P[k])) e.push('propose.' + k);
        if (D.qui === 'pnj') for (const k of ['label', 'repOui', 'repPlusTard', 'repNon', 'rappel']) if (vide(P[k])) e.push('propose.' + k);
        if (D.qui === 'pnj' && (typeof D.pnj !== 'string' || !NPC_DATA.some((d) => d.id === D.pnj))) e.push('habitant inconnu ' + D.pnj);
        if (D.qui === 'lettre' && (vide(P.de) || vide(P.titreLettre))) e.push('propose.de / titreLettre');
        if (D.qui === 'objet' && vide(P.titre)) e.push('propose.titre');
        const n = D.etapes.length;
        if (n < 3 || n > 5) e.push(n + ' étapes');
        D.etapes.forEach((E, i) => {
          if (vide(E.nom) || vide(E.carnet) || !Array.isArray(E.plans) || E.plans.length !== 2 || E.plans.some(vide)) e.push('étape ' + (i + 1) + ' : nom, carnet, plans');
          if (!(E.heure >= 0 && E.heure < 24)) e.push('étape ' + (i + 1) + ' : heure');
          if (E.quand && !QT_HEURES[E.quand]) e.push('étape ' + (i + 1) + ' : quand ' + E.quand);
          if (i < n - 1 && !E.trouve && !E.feuillet) e.push('étape ' + (i + 1) + ' : rien à trouver');
          if (E.trouve && typeof E.trouve === 'object' && (vide(E.trouve.titre) || (vide(E.trouve.texte) && !E.trouve.registre))) e.push('étape ' + (i + 1) + ' : trouvé sans texte');
        });
        const F = D.fin || {};
        if (vide(F.titre) || vide(F.desc) || !Array.isArray(F.choix) || F.choix.length < 2) e.push('fin');
        else for (const c of F.choix) if (vide(c.k) || vide(c.label) || vide(c.texte) || (vide(c.apres) && !(c.lettre && !vide(c.lettre.texte) && !vide(c.lettre.de))) || vide(c.carnet)) e.push('fin ' + c.k);
        out.push({ id, titre: D.titre, qui: D.qui, n, dedans: D.etapes.filter((E) => E.dedans).length, dehors: D.etapes.filter((E) => !E.dedans).length, e });
      }
      return JSON.stringify(out);
    })()`));
    let nd = 0, nh = 0;
    for (const q of T) {
      log(`  ${q.id} « ${q.titre} » (${q.qui}) : ${q.n} étapes, ${q.dedans} dedans, ${q.dehors} dehors`);
      nd += q.dedans; nh += q.dehors;
      if (q.e.length) ko(`${q.id} : textes incomplets (${q.e.join(' ; ')})`);
      if (!q.dedans || !q.dehors) ko(`${q.id} : toutes ses scènes au même endroit (dedans ou dehors)`);
    }
    if (T.length < 5) ko(`${T.length} quêtes seulement`);
    log(`${T.length} quêtes, ${nd + nh} étapes : ${nd} scènes dedans, ${nh} dehors`);

    // ---------------------------------------------------------------- les récompenses (les vraies fonctions)
    const R = JSON.parse(J.ev(`(() => {
      const ch0 = esprit.changer, al0 = npcs.alive, su0 = ui.subtitle; esprit.changer = () => {}; npcs.alive = () => true; ui.subtitle = () => {};   // (les habitants vivants ; pas d'écran)
      const w0 = game.world, p0 = game.player; game.world = null; game.player = { hp: 40, pos: [0, 0, 0] };
      const out = [];
      for (const id of QT_ORDRE) for (const C of QT_QUETES[id].fin.choix) {
        farm.s = farm.blank(1234); farm.s.day = 10;
        for (const it of ['t_lettre_leonie', 't_plaque_roulier', 't_crecelle', 't_registre_menard']) farm.give(it, 1);
        const S = quetes.S(); S.Q[id].st = 'actif'; S.Q[id].e = QT_QUETES[id].etapes.length - 1;
        const m0 = farm.s.money, inv0 = Object.assign({}, farm.s.inv), rec0 = savoir.recetteConnue('appeau');
        let err = null;
        try { quetes.finir(id, C.k); farm.s.day += 3; quetes.tick(); } catch (e) { err = String(e && e.message || e); }
        const objets = Object.keys(farm.s.inv).filter((k) => (farm.s.inv[k] || 0) > (inv0[k] || 0));
        out.push({ id, k: C.k, label: C.label, argent: farm.s.money - m0, objets, recette: !rec0 && savoir.recetteConnue('appeau'), av: Object.keys(S.av).filter((k) => S.av[k]), st: S.Q[id].st, fin: S.Q[id].fin, err });
      }
      esprit.changer = ch0; npcs.alive = al0; ui.subtitle = su0; game.world = w0; game.player = p0; farm.s = null;
      return JSON.stringify(out);
    })()`));
    const parQuete = {};
    for (const r of R) {
      const quoi = [r.argent ? r.argent + ' pièces' : '', ...r.objets, r.recette ? 'recette : appeau' : '', ...r.av.map((a) => 'avantage ' + a)].filter(Boolean);
      log(`  ${r.id} ${r.k} « ${r.label} » : ${quoi.join(', ') || 'rien'}`);
      if (r.err) ko(`${r.id} ${r.k} : erreur ${r.err}`);
      if (r.st !== 'fini' || r.fin !== r.k) ko(`${r.id} ${r.k} : la quête ne finit pas (${r.st})`);
      if (!quoi.length) ko(`${r.id} ${r.k} : cette fin ne donne rien`);
      if (r.argent < 0 || r.argent > 250) ko(`${r.id} ${r.k} : ${r.argent} pièces (hors 0-250)`);
      parQuete[r.id] = Math.max(parQuete[r.id] || 0, r.argent);
    }
    const tot = Object.values(parQuete).reduce((a, b) => a + b, 0);
    log(`argent, la fin la mieux payée de chaque quête : ${Object.entries(parQuete).map(([k, v]) => k + ' ' + v).join(', ')} ; en tout ${tot} pièces = ${(tot / 375).toFixed(2)} journées du début`);
    if (tot > 2.5 * 375) ko(`les quêtes rapportent trop (${tot} pièces)`);

    // ---------------------------------------------------------------- les lieux et les scènes, dans deux vallées
    const vus = {};
    for (const graine of [1234, 77]) {
      const w = await vallee(J, graine);
      J.ctx.__w = w;
      const L = JSON.parse(J.ev(`(() => {
        const w = __w, w0 = game.world; game.world = w;
        quetes.cache = null; qtScenes.cadres = {};
        const out = [], WL = w.waterLevel, r2 = (v) => Math.round(v * 100) / 100;
        for (const k in QT_LIEUX) {
          const o = { k };
          let S = null;
          try { S = quetes.spec(k); } catch (e) { o.err = String(e && e.message || e); }
          if (!S) { out.push(o); continue; }
          o.p = S.p.map(r2);
          const m = /^(t\\d):(\\d)$/.exec(k);
          if (m) {
            const E = QT_QUETES[m[1]].etapes[+m[2]];
            o.dedans = !!E.dedans;
            if (!!S.lieu.dedans !== !!E.dedans) o.err = 'dedans / dehors ne correspond pas';
            const t0 = Date.now();
            let V = null;
            try { V = qtScenes.cadrer(m[1], +m[2]); } catch (e) { o.err = 'cadrage : ' + String(e && e.message || e); }
            o.ms = Date.now() - t0; o.cadre = !!V;
            if (E.dedans && S.lieu.bld) {
              const B = w.bld[S.lieu.bld], [lx, lz] = qtL(B.f, S.p[0], S.p[2]);
              if (Math.abs(lx) > B.W / 2 || Math.abs(lz) > B.D / 2) o.err = 'hors du bâtiment ' + S.lieu.bld;
            }
          }
          if (S.dessin && !(S.lieu && S.lieu.dedans) && S.p[1] < WL + 0.15) o.err = 'dans l’eau';
          out.push(o);
        }
        game.world = w0;
        return JSON.stringify(out);
      })()`));
      let n = 0, nc = 0, ms = 0;
      for (const o of L) {
        if (!o.p) { ko(`vallée ${graine} : pas de lieu pour ${o.k}${o.err ? ' (' + o.err + ')' : ''}`); continue; }
        n++;
        if (o.err) ko(`vallée ${graine}, ${o.k} : ${o.err}`);
        if (o.cadre === false) ko(`vallée ${graine}, ${o.k} : pas de cadrage pour la scène`);
        if (o.cadre) { nc++; ms = Math.max(ms, o.ms); if (o.ms > 400) ko(`vallée ${graine}, ${o.k} : cadrage en ${o.ms} ms`); }
        if (vus[o.k]) { const d = Math.hypot(o.p[0] - vus[o.k][0], o.p[2] - vus[o.k][2]); if (d > 0.5) ko(`${o.k} : le lieu change d’une vallée à l’autre (${d.toFixed(1)} m)`); }
        else vus[o.k] = o.p;
      }
      log(`vallée ${graine} : ${n} / ${L.length} lieux trouvés, ${nc} scènes cadrées (la plus lente : ${ms} ms)`);
    }
    return { echecs };
  },
};
