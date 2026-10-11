// Équilibrage — les récits des proches (agent K18, dix-huitième vague)
//  - LES DONNÉES : onze récits au moins, chacun de six étapes ou plus, avec titres, indices, répliques, fins (titre et
//    résumé) ; chaque objet demandé ou donné existe ; chaque personne nommée existe ; les choix ont un texte ; chaque
//    scène a son lieu, ses répliques ; les voix, les suites des quêtes d'avant, les portraits renvoient à des habitants
//    et à des quêtes qui existent ; aucune passe de génération (les sauvegardes ne bougent pas) ;
//  - LES LIEUX (graines 1234 et 77) : chaque lieu d'étape est dans la vallée, chaque scène s'y construit (des plans aux
//    positions finies, moins d'une minute et demie) ;
//  - LA PARTIE JOUÉE (les vraies fonctions, dans la machine virtuelle) : chaque récit, joué seul, va au bout par
//    TOUS ses chemins de choix (et chacun de ses chemins finit sur une fin qui existe) ; tous ensemble, sur plusieurs
//    tirages, chacun va au bout ; les récits croisés (la boulangère et le forgeron, l'aubergiste et le pêcheur…)
//    donnent leurs fins jointes ;
//  - PAS D'IMPASSE : à chaque étape de chaque récit, l'habitant meurt (le récit s'achève en « deuil »), est emmené
//    (« parti »), ou la personne à qui il fallait parler meurt (le récit va quand même au bout) ;
//  - LES RÉCOMPENSES : par récit et par chemin, au plus 300 pièces et 220 pièces d'objets (les souvenirs des récits ne se
//    vendent pas) ; au plus 2000 pièces pour tous les récits ;
//  - UNE ANCIENNE PARTIE (sans farm.s.k18) se charge : les récits commencent au début, rien ne se rejoue.
'use strict';
const fs = require('fs');
const path = require('path');
const { vallee } = require('./vm.js');
module.exports = {
  titre: 'Les récits des proches (K18)',
  async verifier(J, log) {
    let echecs = 0;
    const ko = (m) => { echecs++; log('ÉCHEC : ' + m); };
    // ---------------------------------------------------------------- pas de génération
    const dir = path.join(__dirname, '..', '..', 'src');
    const src = fs.readdirSync(dir).filter((f) => /K18/.test(f));
    const gen = src.filter((f) => /generateValley|B\.prop\(|B\.inter\(|zone\.passe\(/.test(fs.readFileSync(path.join(dir, f), 'utf8')));
    log(`fichiers K18 : ${src.join(', ')} ; génération : ${gen.length ? gen.join(', ') : 'aucune'}`);
    if (gen.length) ko('une passe de génération dans les fichiers K18');

    // ---------------------------------------------------------------- un banc : des habitants sans monde
    J.ev(`globalThis.__k18banc = function (graine) {
      farm.s = farm.blank(graine || 1234); farm.s.day = 1; farm.s.notes = {}; farm.s.prenom = 'Jean';
      npcs.list = []; npcs.byId = {};
      for (const d of NPC_DATA) {
        const st = { name: d.names[0], amitie: 0, met: true, talkDay: 0, giftDay: 0, mem: [], anger: 0, alive: true };
        farm.s.npcs[d.id] = st;
        const n = { id: d.id, d, st, name: st.name, look: Object.assign({}, d.look), x: 0, y: 0, z: 0, state: 'idle' };
        npcs.list.push(n); npcs.byId[d.id] = n;
      }
      ui.subtitle = () => {}; npcs.say = () => {};
      k18.installer(); k18.S(); k18.appliquer();
    };`);

    // ---------------------------------------------------------------- les données
    const D = JSON.parse(J.ev(`(() => {
      const e = [], vide = (s) => typeof s !== 'string' || !s.trim();
      __k18banc(1234);
      const k = k18.ctx();
      const ids = new Set(), scenes = new Set(), lieux = new Set(), objets = new Set();
      const ok = (id) => !!NPC_BY_ID[id];
      const verifObj = (o, ou) => { if (!o) return; if (typeof o !== 'object') { e.push(ou + ' : objets'); return; } for (const it in o) { objets.add(it); if (!ITEMS[it]) e.push(ou + ' : objet inconnu ' + it); else if (!(o[it] > 0)) e.push(ou + ' : quantité ' + it); } };
      const textes = (L, ou) => { if (!Array.isArray(L) || !L.length) { e.push(ou + ' : pas de répliques'); return; } for (const x of L) { const t = Array.isArray(x) ? x[0] : x; if (vide(t)) e.push(ou + ' : réplique vide'); } };
      // les variantes d'une valeur qui dépend du contexte : on essaie quelques contextes
      const ctxs = [];
      for (const [vivant, fin, coeur, ch] of [[true, 'veuve', 0, null], [false, null, 0, 'x'], [true, 'chanson', 1, 'dire'], [true, null, 0, 'ecrire']]) {
        ctxs.push(Object.assign({}, k, { vivant: () => vivant, fin: () => fin, coeur: () => coeur, ch: () => ch, fait: () => vivant }));
      }
      const variantes = (v) => (typeof v === 'function' ? ctxs.map((c) => { try { return v(c); } catch (er) { e.push('fonction : ' + er.message); return null; } }) : [v]);
      for (const A of K18_ARCS) {
        if (vide(A.id) || ids.has(A.id)) e.push('récit sans id ou en double : ' + A.id);
        ids.add(A.id);
        if (!ok(A.npc)) e.push(A.id + ' : habitant inconnu ' + A.npc);
        if (vide(A.titre) || vide(A.accroche)) e.push(A.id + ' : titre, accroche');
        if (!Array.isArray(A.etapes) || A.etapes.length < 6) e.push(A.id + ' : ' + (A.etapes || []).length + ' étapes (six au moins)');
        const eids = new Set();
        for (const E of A.etapes || []) {
          const ou = A.id + '.' + E.id;
          if (vide(E.id) || eids.has(E.id)) e.push(ou + ' : id en double');
          eids.add(E.id);
          if (vide(E.titre) || vide(E.carnet)) e.push(ou + ' : titre, carnet');
          if (E.qui && !ok(E.qui)) e.push(ou + ' : personne inconnue ' + E.qui);
          if (E.lieu) lieux.add(E.lieu);
          if (E.aller && !E.lieu) e.push(ou + ' : aller sans lieu');
          if (E.aller && vide(E.vu)) e.push(ou + ' : aller sans « vu »');
          if (E.moment && !K18_HEURES[E.moment]) e.push(ou + ' : moment ' + E.moment);
          for (const v of variantes(E.need)) verifObj(v, ou + ' (need)');
          for (const v of variantes(E.don)) verifObj(v, ou + ' (don)');
          if (!E.aller) { for (const L of variantes(E.dlg)) textes(L, ou); for (const l of variantes(E.label || E.titre)) if (vide(l)) e.push(ou + ' : label'); }
          if (E.need && !E.aller && vide(E.attente)) e.push(ou + ' : pas de texte d’attente');
          for (const L of variantes(E.choix)) if (L) for (const C of L) {
            if (!C) continue;
            if (vide(C.k) || vide(C.label)) e.push(ou + ' : choix sans clé ou sans texte');
            textes(typeof C.dlg === 'function' ? C.dlg(k) : C.dlg, ou + ' (choix ' + C.k + ')');
            verifObj(C.don, ou + ' (choix ' + C.k + ', don)');
            if (C.fin && !A.fins[C.fin]) e.push(ou + ' : fin inconnue ' + C.fin);
            if (C.cine && !(A.scenes && A.scenes[C.cine])) e.push(ou + ' : scène inconnue ' + C.cine);
          }
          for (const f of variantes(E.fin)) if (f && !A.fins[f]) e.push(ou + ' : fin inconnue ' + f);
          if (E.finSaut && !A.fins[E.finSaut]) e.push(ou + ' : fin inconnue ' + E.finSaut);
          for (const c of variantes(E.cine)) if (c && !(A.scenes && A.scenes[c])) e.push(ou + ' : scène inconnue ' + c);
          if (E.voyage && (!ok(E.voyage[0]) || !(E.voyage[1] > 0))) e.push(ou + ' : voyage');
        }
        if (!A.fins || Object.keys(A.fins).length < 2) e.push(A.id + ' : moins de deux fins');
        for (const f in A.fins || {}) { const F = A.fins[f]; if (vide(F.titre) || vide(F.resume)) e.push(A.id + ' : fin ' + f + ' sans titre ou résumé'); if (F.lettre && (vide(F.lettre.texte) || vide(F.lettre.titre))) e.push(A.id + ' : lettre de fin ' + f); }
        for (const f of variantes(A.finDefaut)) if (f && !A.fins[f]) e.push(A.id + ' : fin par défaut inconnue ' + f);
        if (A.rituel) { verifObj(A.rituel.don, A.id + ' (rituel)'); if (!(A.rituel.tous >= 3)) e.push(A.id + ' : rituel trop fréquent'); }
        for (const f in A.monde || {}) { if (!A.fins[f]) e.push(A.id + ' : monde pour une fin inconnue ' + f); const M = A.monde[f]; if (M.boutique) { if (!NPC_BY_ID[M.boutique.npc] || !NPC_BY_ID[M.boutique.npc].shop) e.push(A.id + ' : boutique de ' + M.boutique.npc); for (const [it, p] of M.boutique.vend) { if (!ITEMS[it]) e.push(A.id + ' : objet en vente ' + it); else if (p <= (ITEMS[it].price || 0)) e.push(A.id + ' : ' + it + ' vendu à perte (' + p + ')'); } } for (const x of M.discussions || []) if (!ok(x.a) || !ok(x.b) || !x.lignes.length) e.push(A.id + ' : discussion'); }
        for (const c in A.scenes || {}) {
          const S = A.scenes[c];
          if (scenes.has(c)) e.push('scène en double ' + c);
          scenes.add(c);
          if (vide(S.titre)) e.push('scène ' + c + ' : titre');
          if (S.musique && !MUSIQUE.morceaux[S.musique]) e.push('scène ' + c + ' : musique inconnue ' + S.musique);
          if (typeof S.lieu === 'string') lieux.add(S.lieu);
          if (S.repli) lieux.add(S.repli);
          for (const P of variantes(S.paroles)) for (const x of P || []) { const p = typeof x === 'function' ? x(k) : x; if (!Array.isArray(p) || vide(p[1])) e.push('scène ' + c + ' : réplique vide'); else if (p[0] && p[0][0] === '@' && !ok(p[0].slice(1))) e.push('scène ' + c + ' : ' + p[0]); else if (p[2] && !K18_SONS[p[2]]) e.push('scène ' + c + ' : son ' + p[2]); }
          for (const G of variantes(S.gens)) for (const g of G || []) { if (g.id && !ok(g.id)) e.push('scène ' + c + ' : ' + g.id); if (typeof g.look === 'string' && !K18_LOOKS[g.look]) e.push('scène ' + c + ' : silhouette ' + g.look); }
        }
      }
      for (const id in K18_VOIX) { if (!ok(id)) e.push('voix de ' + id + ' : personne'); const V = K18_VOIX[id]; for (const c of ['ami', 'proche', 'visite']) if (!Array.isArray(V[c]) || !V[c].length) e.push('voix de ' + id + ' : ' + c); if (vide(V.absent) || vide(V.cadeau) || vide(V.quete)) e.push('voix de ' + id); if (!V.cadeau.includes('{objet}') || !V.quete.includes('{quete}')) e.push('voix de ' + id + ' : {objet} ou {quete}'); verifObj(V.don, 'visite de ' + id); }
      for (const q in K18_APRES) if (!quests.byId(q)) e.push('suite de la quête inconnue ' + q);
      for (const id in K18_PORTRAITS) if (!ok(id)) e.push('portrait de ' + id);
      for (const it of objets) if (/^k18_/.test(it) && (ITEMS[it].cat !== 'quete' || ITEMS[it].price)) e.push('l’objet ' + it + ' se vendrait');
      const nApres = Object.keys(K18_APRES).length, nQ = NPC_DATA.filter((d) => K18_VOIX[d.id] || d.id === 'cure').reduce((a, d) => a + (d.quests || []).filter((q) => /^[a-z]+_[0-9]+$/.test(q.id)).length, 0);
      return JSON.stringify({ e, n: K18_ARCS.length, etapes: K18_ARCS.reduce((a, A) => a + A.etapes.length, 0), scenes: [...scenes], lieux: [...lieux], nApres, nQ,
        titres: K18_ARCS.map((A) => A.npc + ' — « ' + A.titre + ' » (' + A.etapes.length + ' étapes, fins : ' + Object.keys(A.fins).join(', ') + ')') });
    })()`));
    for (const t of D.titres) log('  ' + t);
    log(`${D.n} récits, ${D.etapes} étapes, ${D.scenes.length} scènes ; suites de quêtes d’avant : ${D.nApres} (pour ${D.nQ} quêtes des habitants)`);
    for (const m of D.e) ko(m);
    if (D.n < 8) ko(`${D.n} récits (huit au moins)`);
    if (D.nApres < D.nQ) ko(`des quêtes d’avant sans suite (${D.nApres} / ${D.nQ})`);

    // ---------------------------------------------------------------- jouer un récit (les vraies fonctions)
    J.ev(`globalThis.__k18jouer = function (ids, pol, o) {
      o = o || {};
      const trace = [], gains = {};
      for (const id of ids) gains[id] = { argent: 0, val: 0, choix: [] };
      for (let j = 0; j < (o.jours || 160); j++) {
        if (ids.every((id) => k18.A(id).fin)) break;
        farm.s.day++;
        for (const n of npcs.list) if (n.st.alive) n.st.amitie = o.amitie ?? 1000;
        if (o.coeur) o.coeur();
        k18.tick();
        for (const id of ids) {
          for (let essai = 0; essai < 3; essai++) {
            const E = k18.courante(id);
            if (!E) break;
            if (o.avant && o.avant(id, E) === 'stop') return { trace, gains, stop: true };
            const need = k18.val(E.need);
            const m0 = farm.s.money, inv0 = Object.assign({}, farm.s.inv);
            if (need) for (const it in need) farm.give(it, need[it]);
            const inv1 = Object.assign({}, farm.s.inv);
            let ok;
            if (E.aller) ok = k18.lieuVu(id);
            else {
              if (E.lieu) k18.A(id).l[E.id] = 1;
              const L = k18.liste(E.choix);
              const ci = L.length ? pol(id, E, L) : 0;
              if (L.length) gains[id].choix.push(E.id + '=' + L[ci].k);
              ok = k18.faire(id, ci, { sansScene: true, silence: true });
            }
            if (!ok) { trace.push(id + '.' + E.id + ' : ne se fait pas'); break; }
            gains[id].argent += farm.s.money - m0;
            for (const it in farm.s.inv) { const d = (farm.s.inv[it] || 0) - (inv1[it] || 0); if (d > 0 && ITEMS[it]) gains[id].val += (ITEMS[it].price || 0) * d; }
            trace.push(id + '.' + E.id);
          }
        }
      }
      return { trace, gains, fins: Object.fromEntries(ids.map((id) => [id, k18.A(id).fin])) };
    };`);

    // chaque récit seul, par tous ses chemins de choix
    const P = JSON.parse(J.ev(`(() => {
      const out = { e: [], chemins: {}, tot: 0 };
      for (const A of K18_ARCS) {
        const pile = [[]], vus = new Set(), fins = new Set();
        let max = 0, n = 0;
        while (pile.length && n < 60) {
          const plan = pile.pop(); n++;
          __k18banc(1234);
          let pas = 0;
          const pris = [];
          const pol = (id, E, L) => { const i = Math.min(plan[pas] ?? 0, L.length - 1); if (plan[pas] === undefined) for (let c = 1; c < L.length; c++) pile.push(pris.concat([c])); pris.push(i); pas++; return i; };
          const r = __k18jouer([A.id], pol);
          const f = r.fins[A.id];
          const cle = r.gains[A.id].choix.join(',');
          if (vus.has(cle)) continue;
          vus.add(cle);
          if (!f) out.e.push(A.id + ' : ne finit pas (' + cle + ') ' + r.trace.slice(-3).join(' ; '));
          else if (!A.fins[f]) out.e.push(A.id + ' : fin inconnue ' + f);
          else fins.add(f);
          const g = r.gains[A.id];
          if (g.argent > 300 || g.val > 220) out.e.push(A.id + ' (' + cle + ') : ' + g.argent + ' pièces, ' + g.val + ' d’objets');
          max = Math.max(max, g.argent);
          for (const x of r.trace) if (/ne se fait pas/.test(x)) out.e.push(x);
        }
        out.tot += max;
        out.chemins[A.id] = vus.size + ' chemins → ' + [...fins].join(', ');
      }
      return JSON.stringify(out);
    })()`));
    for (const id in P.chemins) log(`  ${id} : ${P.chemins[id]}`);
    for (const m of P.e) ko(m);
    log(`argent, le chemin le mieux payé de chaque récit : ${P.tot} pièces en tout`);
    if (P.tot > 2000) ko(`les récits rapportent trop (${P.tot} pièces)`);

    // tous ensemble, sur plusieurs tirages ; et les fins jointes des récits croisés
    const T = JSON.parse(J.ev(`(() => {
      const out = { e: [], tirages: [], croises: [] };
      const ids = K18_ARCS.map((A) => A.id);
      for (const g of [1, 2, 3, 7, 11, 42]) {
        __k18banc(1234 + g);
        const rnd = mulberry32(g * 7919);
        const r = __k18jouer(ids, (id, E, L) => (rnd() * L.length) | 0, { jours: 220 });
        const pas = ids.filter((id) => !r.fins[id]);
        if (pas.length) out.e.push('tirage ' + g + ' : pas finis ' + pas.map((id) => id + '@' + (k18.etape(id) || {}).id).join(', '));
        for (const x of r.trace) if (/ne se fait pas/.test(x)) out.e.push('tirage ' + g + ' : ' + x);
        out.tirages.push(g + ' : ' + ids.map((id) => r.fins[id]).join(' '));
      }
      // la boulangère veuve, puis le forgeron demande : les noces
      __k18banc(1234);
      let r = __k18jouer(['boulangere', 'forgeron'], (id, E, L) => Math.max(0, L.findIndex((c) => c.k === 'anneau' || c.k === 'demande')));
      out.croises.push('boulangère anneau + forgeron demande → ' + r.fins.boulangere + ' / ' + r.fins.forgeron);
      if (r.fins.forgeron !== 'noces') out.e.push('les noces n’ont pas lieu (' + r.fins.forgeron + ')');
      if (NPC_BY_ID.boulangere.liens.forgeron !== 'époux') out.e.push('les liens ne changent pas après les noces');
      if (!NPC_LIFE.forgeron.discussions.some((x) => x.avec === 'boulangere' && x.lignes.length === 3)) out.e.push('pas de conversation des mariés');
      if (sentiments.candidat(npcs.byId.boulangere)) out.e.push('la boulangère mariée se courtise encore');
      // une partie neuve : les liens d'origine reviennent
      __k18banc(1234);
      if (NPC_BY_ID.boulangere.liens.forgeron !== 'soupirant') out.e.push('les liens d’une partie précédente restent (' + NPC_BY_ID.boulangere.liens.forgeron + ')');
      if (NPC_LIFE.forgeron.discussions.some((x) => x.avec === 'boulangere' && x.lignes.length === 3)) out.e.push('la conversation des mariés reste');
      // la boulangère gardant l'anneau : « pas encore »
      __k18banc(1234);
      r = __k18jouer(['boulangere', 'forgeron'], (id, E, L) => Math.max(0, L.findIndex((c) => c.k === 'chanson' || c.k === 'demande')));
      out.croises.push('boulangère chanson + forgeron demande → ' + r.fins.boulangere + ' / ' + r.fins.forgeron);
      if (r.fins.forgeron !== 'pasencore') out.e.push('forgeron : « pas encore » attendu (' + r.fins.forgeron + ')');
      // courtisée par le joueur : la bague donnée
      __k18banc(1234);
      sentiments.S().c.boulangere = { e: 2, p: 0 };
      r = __k18jouer(['forgeron'], () => 0);
      out.croises.push('boulangère courtisée → forgeron ' + r.fins.forgeron + ', bague ' + farm.count('k18_bague_fer'));
      if (r.fins.forgeron !== 'temoin' || !farm.count('k18_bague_fer')) out.e.push('la bague n’est pas donnée au joueur');
      // l'aubergiste dit, le pêcheur poste : réconciliés, Rose au phare, la lumière
      __k18banc(1234);
      r = __k18jouer(['aubergiste', 'pecheur'], (id, E, L) => Math.max(0, L.findIndex((c) => c.k === 'dire' || c.k === 'poster')));
      out.croises.push('aubergiste dire + pêcheur poster → ' + r.fins.aubergiste + ' / ' + r.fins.pecheur + ', phare ' + k18.phare);
      if (r.fins.aubergiste !== 'reconcilies' || r.fins.pecheur !== 'rose' || !k18.phare) out.e.push('aubergiste / pêcheur : fins jointes');
      if (!farm.s.mail.some((m) => /Rose/.test(m.from))) out.e.push('pas de lettre de Rose');
      // l'éleveuse va trouver le garde : ensemble
      __k18banc(1234);
      r = __k18jouer(['eleveuse', 'garde'], (id, E, L) => Math.max(0, L.findIndex((c) => c.k === 'aller' || c.k === 'yves' || c.k === 'repondre')));
      out.croises.push('éleveuse aller + garde yves → ' + r.fins.eleveuse + ' / ' + r.fins.garde);
      if (r.fins.eleveuse !== 'ensemble' || r.fins.garde !== 'adieu') out.e.push('éleveuse / garde : fins jointes');
      // la lettre d'Hélène donnée au maire
      __k18banc(1234);
      r = __k18jouer(['maire'], (id, E, L) => Math.max(0, L.findIndex((c) => c.k === 'donner' || c.k === 'signer')));
      out.croises.push('maire donner + signer → ' + r.fins.maire + ', médaille ' + farm.count('k18_medaille'));
      if (r.fins.maire !== 'signe' || !k18.ctx().fait('maire.puits')) out.e.push('maire : la lettre d’Hélène, le puits, la signature');
      return JSON.stringify(out);
    })()`));
    for (const t of T.tirages) log('  tirage ' + t);
    for (const t of T.croises) log('  ' + t);
    for (const m of T.e) ko(m);

    // ---------------------------------------------------------------- pas d'impasse : les morts, à chaque étape
    const M = JSON.parse(J.ev(`(() => {
      const out = { e: [], n: 0 };
      for (const A of K18_ARCS) {
        for (let i = 0; i < A.etapes.length; i++) {
          for (const mode of ['deuil', 'parti', 'qui']) {
            __k18banc(1234);
            let cible = null;
            const r = __k18jouer([A.id], () => 0, { avant: (id, E) => (A.etapes.indexOf(E) >= i ? 'stop' : null) });
            const E = k18.etape(A.id);
            if (!E || k18.A(A.id).fin) continue;
            if (mode === 'qui') { cible = E.qui && E.qui !== A.npc ? E.qui : null; if (!cible) continue; }
            else cible = A.npc;
            const n = npcs.byId[cible];
            n.st.alive = false; if (mode === 'parti') n.st.gone = 'prison';
            out.n++;
            const r2 = __k18jouer([A.id], () => 0, { jours: 120 });
            const f = r2.fins[A.id];
            if (mode === 'deuil' && f !== 'deuil') out.e.push(A.id + '.' + E.id + ' : l’habitant meurt, fin ' + f);
            if (mode === 'parti' && f !== 'parti') out.e.push(A.id + '.' + E.id + ' : l’habitant est emmené, fin ' + f);
            if (mode === 'qui' && (!f || !A.fins[f])) out.e.push(A.id + '.' + E.id + ' : ' + cible + ' meurt, le récit ne finit pas (' + f + ', à ' + (k18.etape(A.id) || {}).id + ')');
            for (const x of r2.trace) if (/ne se fait pas/.test(x)) out.e.push(x + ' (après la mort de ' + cible + ')');
          }
        }
      }
      // les habitants de toutes les étapes, morts avant même le début : rien ne commence, rien ne casse
      __k18banc(1234);
      for (const n of npcs.list) n.st.alive = false;
      const r = __k18jouer(K18_ARCS.map((A) => A.id), () => 0, { jours: 5 });
      for (const A of K18_ARCS) if (k18.commence(A.id)) out.e.push(A.id + ' : commence sans personne');
      return JSON.stringify(out);
    })()`));
    log(`morts en chemin : ${M.n} cas essayés`);
    for (const m of M.e) ko(m);

    // ---------------------------------------------------------------- une ancienne partie ; une sauvegarde en cours
    const O = JSON.parse(J.ev(`(() => {
      const out = { e: [] };
      __k18banc(1234);
      farm.s.day = 30;
      delete farm.s.k18;
      for (const fn of HOOKS.load) { try { fn(JSON.parse(JSON.stringify(farm.s))); } catch (e) { /* d'autres modules veulent le monde */ } }
      const S = k18.S();
      if (!S || S.file.length || S.courrier.length) out.e.push('ancienne partie : des scènes ou des lettres à rejouer');
      if (K18_ARCS.some((A) => k18.A(A.id).fin)) out.e.push('ancienne partie : un récit fini sans avoir été joué');
      // au milieu d'un récit, la sauvegarde relue
      __k18banc(1234);
      __k18jouer(['pecheur'], (id, E, L) => Math.max(0, L.findIndex((c) => c.k === 'poster')), { avant: (id, E) => (E.id === 'retour' ? 'stop' : null), jours: 60 });
      const txt = JSON.stringify(farm.s);
      farm.s = JSON.parse(txt);
      for (const n of npcs.list) n.st = farm.s.npcs[n.id];
      for (const fn of HOOKS.load) { try { fn(JSON.parse(txt)); } catch (e) { /* idem */ } }
      const V = k18.S().voyage.pecheur;
      if (!V && farm.s.day < 0) out.e.push('voyage perdu');
      const r = __k18jouer(['pecheur'], () => 0, { jours: 30 });
      if (r.fins.pecheur !== 'rose') out.e.push('sauvegarde relue : le pêcheur ne revient pas avec Rose (' + r.fins.pecheur + ')');
      farm.s = null;
      return JSON.stringify(out);
    })()`));
    for (const m of O.e) ko(m);

    // ---------------------------------------------------------------- les lieux et les scènes, dans deux vallées
    for (const graine of [1234, 77]) {
      const w = await vallee(J, graine);
      J.ctx.__w = w;
      const L = JSON.parse(J.ev(`(() => {
        const w = __w, w0 = game.world, p0 = game.player;
        __k18banc(${graine});
        game.world = w; farm.w = w;
        const F = w.farm.f;
        game.player = { pos: [F.x, w.heightAt(F.x, F.z), F.z], yaw: 0.4, pitch: 0, hp: 100, food: 80, vel: [0, 0, 0], eyePos() { return [this.pos[0], this.pos[1] + 1.6, this.pos[2]]; } };
        const out = { e: [], lieux: 0, scenes: [] };
        const lieux = ${JSON.stringify(D.lieux)};
        for (const k of lieux) { if (!w.lm[k] && !(w.bld && w.bld[k])) out.e.push('lieu ' + k + ' absent'); else out.lieux++; }
        const fini = (v) => Array.isArray(v) && v.length === 3 && v.every(Number.isFinite);
        const k = k18.ctx();
        for (const A of K18_ARCS) for (const c in A.scenes || {}) {
          const S = A.scenes[c];
          if (typeof S.lieu === 'object' && S.lieu.bld && !(w.bld[S.lieu.bld] && w.bld[S.lieu.bld].out) && !(S.repli && w.lm[S.repli])) out.e.push('scène ' + c + ' : ni maison ni repli');
          let sc = null;
          try { sc = k18Scenes.construire(c, k); } catch (er) { out.e.push('scène ' + c + ' : ' + er.message); continue; }
          if (!sc) { out.e.push('scène ' + c + ' : rien à montrer'); continue; }
          let mauvais = 0;
          for (const P of sc.plans) {
            const cams = [];
            if (P.de) cams.push(P.de.pos, P.de.look); if (P.a) cams.push(P.a.pos, P.a.look);
            if (P.chemin) for (const q of P.chemin) cams.push(q.pos, q.look);
            for (const q of cams) if (!fini(q)) mauvais++;
          }
          for (const g of sc.gens) { if (!fini(g.P) || !Number.isFinite(g.cap)) mauvais++; if (g.ch && (!fini(g.ch.de) || !fini(g.ch.a))) mauvais++; }
          for (const l of sc.opts.lum || []) if (!fini([l.x, l.y, l.z]) || !(l.r > 0)) mauvais++;
          if (mauvais) out.e.push('scène ' + c + ' : ' + mauvais + ' positions non finies');
          if (sc.duree > 90) out.e.push('scène ' + c + ' : ' + sc.duree.toFixed(0) + ' s (trop longue)');
          if (sc.gens.length < 1) out.e.push('scène ' + c + ' : personne');
          out.scenes.push(c + ' ' + sc.plans.length + 'p ' + sc.duree.toFixed(0) + 's ' + sc.gens.length + 'g');
        }
        game.world = w0; game.player = p0; farm.s = null;
        return JSON.stringify(out);
      })()`));
      log(`vallée ${graine} : ${L.lieux} / ${D.lieux.length} lieux ; scènes : ${L.scenes.join(' ; ')}`);
      for (const m of L.e) ko(`vallée ${graine} : ${m}`);
    }
    return { echecs };
  },
};
