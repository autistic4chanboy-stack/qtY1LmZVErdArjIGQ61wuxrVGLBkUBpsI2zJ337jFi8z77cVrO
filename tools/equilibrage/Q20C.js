// Équilibrage — les scènes des autres quêtes (agent Q20C, vingtième vague, lot 3)
//  - LE RECENSEMENT : chaque quête retenue (les premières quêtes des habitants ajoutés, les quêtes hors de `quests`
//    et de `q16`, les quêtes T) a ses scènes, inscrites sous le bon habitant (ou sous un donneur de Q20C_QUI) ; les
//    moments attendus sont là ; aucune passe de génération dans les fichiers Q20 ;
//  - LES DÉCLENCHEURS (sans monde, puis dans une vallée) : ce que fait le jeu (proposer une tournée, emprunter un
//    livre, accepter une quête T…) met le bon moment en file, une seule fois ; l'option Aucune n'en joue aucune ;
//    une ancienne partie (sans farm.s.q20) n'en rejoue aucune ;
//  - LES SCÈNES (graines 1234 et 77, de jour et de nuit, en entier et en court) : chaque moment se construit sans
//    erreur, aux positions finies ; caméras ni dans un mur, ni sous le sol, ni sous un toit dehors ; pas de cadrage de
//    repli ; la personne qu'on montre se voit ; durées dans les bornes ; une réplique au moins (sauf un tournant).
// Pour aller vite pendant la mise au point : Q20C_IDS=id1,id2 Q20C_GRAINES=1234 node tools/equilibrage.js Q20C
'use strict';
const fs = require('fs');
const path = require('path');
const { vallee } = require('./vm.js');

// les quêtes retenues (le recensement : $SP/agentQ20C/RECENSEMENT.md)
const HABITANTS = ['alchimiste_1', 'alchimiste_2', 'libraire_1', 'colporteur_1', 'colporteuse_1', 'chasseur_1', 'chasseur_2', 'naturiste_b_1',
  'nain_ancien_1', 'nain_ancien_2', 'planches_doyenne_1', 'planches_passeur_1', 'planches_vanniere_1', 'estive_baile_1', 'estive_baile_2',
  'estive_fromagere_1', 'estive_patre_1'];
const AUTRES = ['q20c_tournee', 'q20c_pli', 'q20c_banc', 'q20c_parvis', 'q20c_depot', 'q20c_emprunt', 'q20c_cle_porte', 'q20c_lavandiere', 'q20c_petits',
  'q20c_baron', 'q20c_loge', 'q20c_avis', 'q20c_masque', 'q20c_malediction', 'q20c_commande', 'q20c_tresor', 'q20c_reliques', 'q20c_caveau'];
// l'état de chaque quête d'ici au moment montré (m) ; k : une variante (n variantes : les deux sortes d'une demande)
const PREP = `globalThis.q20cTPrep = function (id, m) { const S = quetes.S(); S.Q[id] = Object.assign({}, S.Q[id] || {}, { st: m.startsWith('fin') ? 'fini' : 'actif', fin: m.startsWith('fin:') ? m.slice(4) : null, e: 0, tr: {}, vu: {}, j0: farm.s.day }); };
globalThis.__q20cPrep = {
  q20c_tournee: { f(m) { farm.s.deliveries = { day: farm.s.day, list: [{ to: 'boulangere', pay: 25, done: m !== 'demande' }, { to: 'pecheur', pay: 55, done: m !== 'demande' }] }; q20c.S().colis = 'pecheur'; } },
  q20c_pli: { f(m) { q20c.S().trav = { livrer: { j: farm.s.day, i: 1, to: 'grainetiere', fait: m.startsWith('fin') ? farm.s.day : 0 } }; } },
  q20c_banc: { f(m) { const w = game.world, T = w.townInfo, b = w.props.find((q) => q.id === 'banc' && T && Math.abs(q.x - T.x) < 46 && Math.abs(q.z - T.z) < 46); q20c.S().trav = { reparer: { j: farm.s.day, i: 2, x: b ? b.x : NaN, y: b ? b.y : 0, z: b ? b.z : NaN, fait: m.startsWith('fin') ? farm.s.day : 0 } }; } },
  q20c_parvis: { f(m) { q20c.S().trav = { balayer: { j: farm.s.day, i: 2, fait: m.startsWith('fin') ? farm.s.day : 0 } }; } },
  q20c_depot: { f(m) { q20c.S().trav = { apporter: { j: farm.s.day, i: 0, need: 'bois', n: 6, txt: 'Six bûches pour la mairie, avant l’hiver.', fait: m.startsWith('fin') ? farm.s.day : 0 } }; } },
  q20c_emprunt: { f(m) { q20c.S().emprunt = { j: farm.s.day, id: 'livre_almanach', titre: 'Almanach de la vallée', due: (farm.s.hours || 100) + 48, rendu: m.startsWith('fin') ? farm.s.day : 0, retard: m === 'fin:1' ? 1 : 0 }; } },
  q20c_cle_porte: { n: 2, f(m, k) { q20c.S().cle = { j: farm.s.day, mode: m === 'fin:vol' || (m === 'demande' && k) ? 'vol' : 'pret', rendu: m.startsWith('fin') ? farm.s.day : 0 }; } },
  q20c_lavandiere: { f(m) { const S = lavandiere.S(); S.n = 1; S.apaise = m.startsWith('fin') ? farm.s.day : 0; q20c.S().lav = { j: farm.s.day, qui: 'boulangere', drap: m === 'tournant' ? farm.s.day : 0 }; } },
  q20c_petits: { f(m) { const S = gobelins.S(); S.connu.signe = farm.s.day; S.connu.village = m !== 'demande' ? farm.s.day : 0; S.pacte = m === 'fin:pacte' ? farm.s.day : 0; S.pacteRompu = 0; S.partis = m === 'fin:partis' ? farm.s.day : 0; } },
  q20c_baron: { f(m) { c18.S().quete = { e: m === 'demande' ? 1 : m === 'tournant' ? 4 : 5 }; } },
  q20c_loge: { f(m) { q20c.S().loge = { j: farm.s.day, fini: m.startsWith('fin') ? farm.s.day : 0, entier: m === 'fin:1' ? 0 : 1 }; try { hotel18.S().service = { jour: farm.s.day, fini: false }; } catch (e) { /* rien */ } } },
  q20c_avis: { f(m) { q20c.S().avis = { j: farm.s.day, prime: 80, fin: m.startsWith('fin:') ? m.slice(4) : m === 'fin' ? 'autre' : 0 }; } },
  q20c_masque: { f(m) { strange.s = Object.assign({}, strange.s || {}, { victims: ['boulangere'], killer: 'forgeron', kCaught: m === 'fin:pris', kDead: m === 'fin:mort' }); if (m === 'tournant') farm.give('masque', 1); } },
  q20c_malediction: { n: 2, f(m, k) { q20c.S().mal = { j: farm.s.day, qui: (m === 'demande' || m === 'fin') && k ? 'guerisseuse' : 'cure', leve: m.startsWith('fin') ? farm.s.day : 0 }; malediction.S().liste = m.startsWith('fin') ? {} : { malchance: { j: farm.s.day, cause: 'cygne' } }; } },
  q20c_commande: { f(m) { q20c.S().cmd = { j: farm.s.day, id: 'c1', livre: m.startsWith('fin') ? farm.s.day : 0 }; commandes.S().cmds = [{ id: 'c1', j: farm.s.day, st: m.startsWith('fin') ? 'livre' : 'attente', L: [] }]; } },
  q20c_tresor: { f(m) { farm.s.maps = []; const mp = dig.newMap(); if (mp) mp.found = m.startsWith('fin'); } },
  q20c_reliques: { f(m) { farm.s.flags.got_relique_calice = 1; farm.s.flags.apaisee = m.startsWith('fin') ? farm.s.day : 0; } },
  t1: { f(m) { q20cTPrep('t1', m); } }, t2: { f(m) { q20cTPrep('t2', m); } }, t3: { f(m) { q20cTPrep('t3', m); } }, t4: { f(m) { q20cTPrep('t4', m); } }, t5: { f(m) { q20cTPrep('t5', m); } },
  q20c_caveau: { f(m) { q20c.S().caveau = { j: farm.s.day }; const R = runes.S(); R.p.caveau = m !== 'demande' ? farm.s.day : 0; R.c.caveau = m.startsWith('fin') ? 1 : 0; } },
};`;
const T = ['t1', 't2', 't3', 't4', 't5'];

// le banc : des habitants sans partie (et, w donné, le monde et un joueur à la ferme)
const BANC = `globalThis.__q20cBanc = function (graine, w) {
  farm.s = farm.blank(graine || 1234); farm.s.day = 6; farm.s.prenom = 'Jean'; farm.names = Object.assign({}, VALLEY_DESIGN.names);
  npcs.list = []; npcs.byId = {};
  for (const d of NPC_DATA) {
    const st = { name: d.names[0], amitie: 1000, met: true, talkDay: 0, giftDay: 0, mem: [], anger: 0, alive: true };
    farm.s.npcs[d.id] = st;
    const n = { id: d.id, d, st, name: st.name, look: Object.assign({}, d.look), rig: null, x: 0, y: 0, z: 0, state: 'idle', voice: 1 };
    npcs.list.push(n); npcs.byId[d.id] = n;
  }
  ui.subtitle = () => {}; npcs.say = () => {}; sound.quest = () => {}; sound.coin = () => {};
  if (w) { game.world = w; farm.w = w; w.time = 0.45; const F = w.farm.f; game.player = { pos: [F.x, w.heightAt(F.x, F.z), F.z], yaw: 0.4, pitch: 0, hp: 100, food: 80, vel: [0, 0, 0], onGround: true, breath: 1, eyePos() { return [this.pos[0], this.pos[1] + 1.6, this.pos[2]]; } }; }
  q20.S();
    };`;

module.exports = {
  BANC, PREP,
  titre: 'Les scènes des autres quêtes (Q20C)',
  HABITANTS, AUTRES, T,
  async verifier(J, log) {
    let echecs = 0;
    const ko = (m) => { echecs++; log('ÉCHEC : ' + m); };
    const filtre = process.env.Q20C_IDS ? process.env.Q20C_IDS.split(',') : null;
    const graines = process.env.Q20C_GRAINES ? process.env.Q20C_GRAINES.split(',').map(Number) : [1234, 77];
    const tous = HABITANTS.concat(AUTRES, T);
    const ids = filtre ? tous.filter((id) => filtre.includes(id)) : tous;
    // ---------------------------------------------------------------- pas de génération
    const dir = path.join(__dirname, '..', '..', 'src');
    const src = fs.readdirSync(dir).filter((f) => /Q20-3/.test(f));
    const gen = src.filter((f) => /generateValley|B\.prop\(|B\.inter\(|w\.props\.push|w\.inter\.push/.test(fs.readFileSync(path.join(dir, f), 'utf8')));
    log(`fichiers Q20C : ${src.join(', ')} ; génération : ${gen.length ? gen.join(', ') : 'aucune'}`);
    if (gen.length) ko('une passe de génération (ou un objet posé) dans les fichiers Q20C');

    // ---------------------------------------------------------------- un banc : des habitants sans partie
    J.ev(BANC);

    // ---------------------------------------------------------------- les données : chaque quête retenue a ses scènes
    const D = JSON.parse(J.avec({ habitants: HABITANTS, autres: AUTRES, t: T }, `(() => {
      const e = [], out = { n: 0, moments: 0 };
      for (const id of __v.habitants) {
        const q = quests.byId(id), D = q20.defs[id];
        if (!q) { e.push('quête inconnue ' + id); continue; }
        if (!D) { e.push(id + ' : pas de scènes'); continue; }
        out.n++;
        if (D.qui !== quests.giver(id)) e.push(id + ' : rangée sous ' + D.qui + ' (donnée par ' + quests.giver(id) + ')');
        if (typeof D.demande !== 'function') e.push(id + ' : pas de demande');
        if (typeof D.fin !== 'function' && !(D.fins && Object.keys(D.fins).length)) e.push(id + ' : pas de dénouement');
        if (q.type !== 'apporter' && typeof D.tournant !== 'function') e.push(id + ' : pas de tournant (' + q.type + ')');
        out.moments += q20.moments(id).length;
      }
      for (const id of __v.autres.concat(__v.t)) {
        const D = q20.defs[id];
        if (!D) { e.push(id + ' : pas de scènes'); continue; }
        out.n++;
        if (typeof D.etat !== 'function') e.push(id + ' : pas d’état (etat())');
        if (D.qui && !NPC_BY_ID[D.qui] && !(typeof Q16_PNJ !== 'undefined' && Q16_PNJ[D.qui])) e.push(id + ' : habitant inconnu ' + D.qui);
        if (!D.qui && !(D.souv && Q20C_QUI[D.souv])) e.push(id + ' : rangée sous personne');
        if (!q20.moments(id).length) e.push(id + ' : aucun moment');
        out.moments += q20.moments(id).length;
      }
      out.e = e;
      return JSON.stringify(out);
    })()`));
    log(`${tous.length} quêtes retenues ; ${D.n} avec leurs scènes (${D.moments} moments)`);
    for (const m of D.e) ko(m);

    // ---------------------------------------------------------------- les scènes, dans deux vallées, de jour et de nuit
    J.ev(PREP);
    for (const graine of graines) {
      const w = await vallee(J, graine);
      J.ctx.__w = w;
      const L = JSON.parse(J.avec({ ids }, `(() => {
        const w = __w;
        __q20cBanc(${graine}, w);
        const e = [], r = { n: 0, plans: 0, t: 0, tmax: 0, lent: '', durees: [Infinity, 0], courtes: [Infinity, 0], dedans: 0, toit: 0 };
        const fini = (v) => Array.isArray(v) && v.length === 3 && v.every(Number.isFinite);
        const voit = (P, T, B) => {
          const L = qtBlocs(w, (P[0] + T[0]) / 2, (P[2] + T[2]) / 2, Math.hypot(P[0] - T[0], P[2] - T[2]) / 2 + 6);
          if (B) { const v = [T[0] - P[0], T[1] - P[1], T[2] - P[2]], d = Math.hypot(v[0], v[1], v[2]) || 1; return !qtRayon(w, L, P, [v[0] / d, v[1] / d, v[2] / d], d - 0.3); }
          return qtScenes.voit(w, L, P, T, 0.35);
        };
        const camOk = (P, D) => {
          const L = qtBlocs(w, P[0], P[2], 8), g = w.heightAt(P[0], P[2]);
          if (D.dedans) { const B = w.bld[D.dedans]; return !!B && qtScenes.dansPiece(w, { bld: D.dedans }, P) && !qtDansBloc(L, P, 0.2) && qtSousToit(w, L, P) && P[1] > B.y + 0.7 && P[1] < B.y + 2.6 ? '' : 'dedans hors de la pièce'; }
          if (P[1] < Math.max(g, w.waterLevel) + 0.5) return 'sous le sol ou dans l’eau';
          if (qtDansBloc(L, P, 0.2)) return 'dans un mur';
          if (!D.toit && qtSousToit(w, L, P)) return 'sous un toit';
          return '';
        };
        const prep = (typeof __q20cPrep !== 'undefined' && __q20cPrep) || {};
        const strange0 = strange.s;
        const rnd0 = Math.random, rnd = mulberry32(${graine} ^ 0x20c);
        Math.random = rnd;
        try {
        for (const id of __v.ids) {
          const q = quests.byId(id);
          const essais = [];
          for (const m of q20.moments(id)) for (const h of [10.5, 22.6]) for (const court of [false, true]) {
            if (court && m === 'tournant') continue;
            for (let k = 0; k < (m === 'tournant' && q && q.type === 'trouver' ? 4 : 1); k++) essais.push([m, k ? (k % 2 ? 22.6 : 10.5) : h, court, 0]);
            if (prep[id] && prep[id].n > 1) for (let v = 1; v < prep[id].n; v++) essais.push([m, h, court, v]);
          }
          for (const [m, h, court, v] of essais) {
            if (!q) { farm.s.q20c = { v: 1 }; strange.s = strange0; }
            farm.s.quests = {};
            if (q) {
              try { quests.accept(q, npcs.byId[quests.giver(id)]); } catch (er) { e.push(id + ' : accepter ' + er.message); }
              const Q = farm.s.quests[id];
              if (Q && m !== 'demande') Q.step = 1;
              if (Q && m.startsWith('fin')) { Q.st = 'fait'; Q.done = 3; }
            } else if (prep[id]) { try { prep[id].f(m, v); } catch (er) { e.push(id + ' ' + m + ' : préparer ' + er.message); } }
            const t0 = Date.now();
            let sc = null;
            try { sc = q20.construire(id, m, { h, court }); } catch (er) { e.push(id + ' ' + m + ' : ' + er.message); continue; }
            const dt = Date.now() - t0;
            r.t += dt; if (dt > r.tmax) { r.tmax = dt; r.lent = id + ' ' + m; }
            if (!sc) { e.push(id + ' ' + m + ' (' + h + ' h' + (court ? ', court' : '') + ') : rien à montrer'); continue; }
            r.n++;
            const B = court ? r.courtes : r.durees;
            B[0] = Math.min(B[0], sc.duree); B[1] = Math.max(B[1], sc.duree);
            const [d0, d1] = court ? Q20_REGL.court : Q20_REGL.duree;
            if (sc.duree < d0 - 0.01 || sc.duree > d1 + 0.01) e.push(id + ' ' + m + (court ? ' (court)' : '') + ' : ' + sc.duree.toFixed(1) + ' s');
            if (sc.repli) e.push(id + ' ' + m + ' (' + h + ' h) : ' + sc.repli + ' cadrage(s) de repli');
            const vrais = sc.plans.filter((P) => P._q20);
            if (!court && vrais.length < 2) e.push(id + ' ' + m + ' : ' + vrais.length + ' plan');
            if (vrais.length && !vrais.some((P) => P.texte) && m !== 'tournant') e.push(id + ' ' + m + ' : pas une réplique');
            for (const P of sc.plans) {
              const cams = [];
              if (P.de) cams.push(P.de.pos); if (P.a) cams.push(P.a.pos); if (P.chemin) for (const k of P.chemin) cams.push(k.pos);
              const looks = [];
              if (P.de && P.de.look) looks.push(P.de.look); if (P.a && P.a.look) looks.push(P.a.look); if (P.chemin) for (const k of P.chemin) looks.push(k.look);
              for (const v of cams.concat(looks)) if (!fini(v)) { e.push(id + ' ' + m + ' : position non finie'); break; }
              if (!P._q20) continue;
              r.plans++;
              if (P._q20.dedans) r.dedans++; if (P._q20.toit) r.toit++;
              for (const C of cams) { const why = fini(C) ? camOk(C, P._q20) : 'non finie'; if (why) { e.push(id + ' ' + m + ' (' + h + ' h) plan ' + sc.plans.indexOf(P) + ' : caméra ' + why + ' ' + C.map((x) => x.toFixed(1)).join(',')); break; } }
              for (const A of P._q20.acteurs) { if (!fini(A.P) || (A.vers && !fini(A.vers)) || !Number.isFinite(A.cap || 0)) e.push(id + ' ' + m + ' : acteur aux positions non finies'); }
              for (const l of P._q20.lum) if (!fini([l.x, l.y, l.z]) || !(l.r > 0)) e.push(id + ' ' + m + ' : lumière');
              const A = P._q20.acteurs.find((x) => x.k === 'h' && x.vu !== false);
              if (A && cams.length && fini(cams[0])) {
                const s = A.s || 1, Q = A.vers || A.P;
                const tete = [Q[0], Q[1] + 1.45 * s * (JSON.stringify(A.geste || '').includes('assis') ? 0.72 : 1), Q[2]], buste = [Q[0], Q[1] + 1.0 * s, Q[2]];
                if (!voit(cams[0], tete, P._q20.dedans) && !voit(cams[0], buste, P._q20.dedans)) e.push(id + ' ' + m + ' (' + h + ' h) plan ' + sc.plans.indexOf(P) + ' : ' + (A.id || (A.joueur ? 'le joueur' : 'la personne')) + ' caché(e) de la caméra');
              }
            }
          }
        }
        } finally { Math.random = rnd0; strange.s = strange0; }
        farm.s = null;
        return JSON.stringify({ e, r });
      })()`));
      const R = L.r;
      // les déclencheurs, une fois par essai (dans la première vallée) : ce que fait le jeu met le bon moment en file
      if (graine === graines[0] && !filtre) {
        const T = JSON.parse(J.ev(`(() => {
          const w = __w, e = [], vu = [];
          __q20cBanc(${graine}, w);
          farm.s.money = 5000; farm.s.hours = (farm.s.day - 1) * 24 + 10;
          settings.quetesCine = 'toutes';
          const enFile = (id, m) => q20.S().file.some((x) => x.id === id && x.m === m);
          const guet = () => { for (const G of q20c.guets) { try { const m = G.f(); if (m) q20.declencher(G.id, m); } catch (er) { e.push('guet ' + G.id + ' : ' + er.message); } } };
          const vider = () => { q20.S().file = []; };
          const essai = (nom, f) => { try { vider(); f(); vu.push(nom); } catch (er) { e.push(nom + ' : ' + er.message); } };
          // la tournée : la postière la propose ; tout remis : le dénouement
          essai('tournée', () => {
            deliveries.offer(npcs.byId.postiere); guet();
            if (!enFile('q20c_tournee', 'demande')) e.push('tournée : pas de demande en file');
            for (const p of farm.s.deliveries.list) p.done = true;
            guet();
            if (!enFile('q20c_tournee', 'fin')) e.push('tournée : pas de dénouement en file');
            q20.souvenir('q20c_tournee', 'fin'); vider(); guet();
            if (q20.S().file.length) e.push('tournée : un moment passé revient en file');
          });
          // les petits travaux : prendre le pli, le remettre
          essai('travaux', () => {
            const J0 = activites.travauxDuJour(), jl = J0.find((j) => j.t === 'livrer') || J0[0];
            activites.accepter(jl);
            const id = Q20C_TRAVAUX[jl.t];
            if (!enFile(id, 'demande')) e.push('travaux : pas de demande en file (' + jl.t + ')');
            activites.payer(jl);
            if (!enFile(id, 'fin')) e.push('travaux : pas de dénouement en file (' + jl.t + ')');
          });
          // la bibliothèque : emprunter, rendre
          essai('emprunt', () => {
            const E0 = biblio.catalogue()[0];
            const r = biblio.emprunter(E0, 3);
            if (r !== 'ok') e.push('emprunt : ' + r);
            if (!enFile('q20c_emprunt', 'demande')) e.push('emprunt : pas de demande en file');
            biblio.rendre(biblio.S().prets.findIndex((p) => p.id === E0.item));
            if (!enFile('q20c_emprunt', 'fin')) e.push('emprunt : pas de dénouement en file');
            if (q20.resoudre('q20c_emprunt', 'fin') !== 'fin:0') e.push('emprunt : rendu à l’heure, mais la fin est ' + q20.resoudre('q20c_emprunt', 'fin'));
          });
          // la clé de la Grande Porte : prêtée, rendue
          essai('clé', () => {
            bibliotheque2.sortir('pret', { jours: 3, caution: 150 });
            if (!enFile('q20c_cle_porte', 'demande')) e.push('clé : pas de demande en file');
            bibliotheque2.rendre({});
            if (!enFile('q20c_cle_porte', 'fin') || q20.resoudre('q20c_cle_porte', 'fin') !== 'fin:pret') e.push('clé : le dénouement du prêt n’est pas en file');
          });
          // une quête T : accepter, finir
          essai('T', () => {
            const S = quetes.S(); S.Q.t1 = Object.assign({}, S.Q.t1, { st: 'propose' });
            quetes.accepter('t1');
            if (!enFile('t1', 'demande')) e.push('T : pas de demande en file');
            if (quetes.aJouer && quetes.aJouer.id === 't1' && quetes.aJouer.t < 3) e.push('T : la scène de la première étape passe avant la demande');
            quetes.finir('t1', 'b');
            if (!enFile('t1', 'fin') || q20.resoudre('t1', 'fin') !== 'fin:b') e.push('T : le dénouement de la fin b n’est pas en file');
          });
          // l'option Aucune : rien ne se joue, tout rejoint les souvenirs
          essai('aucune', () => {
            const _j = q20.jouer, _e = q20.empeche; let n = 0;
            q20.jouer = () => { n++; return Promise.resolve(true); }; q20.empeche = () => null;
            settings.quetesCine = 'aucune';
            farm.s.q20c = { v: 1 }; delete q20.S().fait['q20c_tresor|demande'];
            farm.s.maps = []; dig.newMap(); guet();
            for (let i = 0; i < 12; i++) q20.avancer(0.5);
            q20.jouer = _j; q20.empeche = _e; settings.quetesCine = 'toutes';
            if (n) e.push('aucune : ' + n + ' scène(s) jouée(s)');
            if (!q20.S().fait['q20c_tresor|demande']) e.push('aucune : la demande n’a pas rejoint les souvenirs');
          });
          // une partie d'avant : rien ne se rejoue (une tournée en cours, une quête T finie, les Petits connus jusqu'à leur village)
          essai('ancienne', () => {
            const s = farm.blank(${graine}); s.day = 9; s.npcs = farm.s.npcs; s.money = 100; s.hours = 8 * 24 + 10;
            s.deliveries = { day: 9, list: [{ to: 'boulangere', pay: 25, done: true }, { to: 'pecheur', pay: 55, done: false }] };
            s.quetes = { v: 1, Q: { t2: { st: 'fini', fin: 'a', e: 3, tr: {}, vu: {} } } };
            farm.s = s;
            const G = gobelins.S(); G.connu.signe = 3; G.connu.village = 5;
            const sauve = JSON.parse(JSON.stringify(s));
            const L0 = q20.S().file.length;
            for (const fn of HOOKS.load) { try { fn(sauve); } catch (er) { /* d'autres modules veulent l'écran */ } }
            guet(); q20.guetter();
            const F = q20.S().file.map((x) => x.id + '|' + x.m);
            if (F.length) e.push('ancienne partie : en file ' + F.join(', '));
            for (const k of ['q20c_tournee|demande', 't2|demande', 't2|fin:a', 'q20c_petits|demande', 'q20c_petits|tournant']) if (!q20.S().fait[k]) e.push('ancienne partie : ' + k + ' pas aux souvenirs');
            // et ce qui vient ensuite se joue : la tournée finie
            s.deliveries.list[1].done = true; guet();
            if (!enFile('q20c_tournee', 'fin')) e.push('ancienne partie : la fin de la tournée ne vient pas');
          });
          farm.s = null;
          return JSON.stringify({ e, vu });
        })()`));
        log(`déclencheurs essayés : ${T.vu.join(', ')}`);
        for (const m of T.e) ko(m);
      }
      log(`vallée ${graine} : ${R.n} scènes construites (${R.plans} plans : ${R.dedans} dedans, ${R.toit} sous un toit sans bâtiment) en ${(R.t / 1000).toFixed(1)} s (la plus lente ${R.tmax} ms : ${R.lent}) ; durées ${R.durees[0].toFixed(1)}–${R.durees[1].toFixed(1)} s, en court ${R.courtes[0].toFixed(1)}–${R.courtes[1].toFixed(1)} s`);
      const vus = new Set();
      for (const m of L.e) { const k = m.replace(/\(\d+(\.\d+)? h[^)]*\)/, ''); if (vus.has(k)) continue; vus.add(k); ko(`vallée ${graine} : ${m}`); }
    }
    return { echecs };
  },
};
