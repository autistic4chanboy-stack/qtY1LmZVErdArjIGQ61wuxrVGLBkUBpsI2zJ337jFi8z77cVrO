// Équilibrage — les scènes des quêtes (agent Q20A, vingtième vague)
//  - LES QUÊTES : chacune des trente-neuf quêtes des habitants (05-npc-data.js) a ses scènes : la demande, le
//    dénouement, et le tournant sauf quand on apporte des choses ; inscrites sous le bon habitant ; aucune passe de
//    génération dans les fichiers Q20 (les sauvegardes ne bougent pas) ;
//  - LES SCÈNES (graines 1234 et 77, de jour et de nuit, en entier et en court) : chaque moment de chaque quête
//    inscrite (celles des autres lots comprises) se construit sans erreur, aux positions finies ; caméras : ni dans un
//    mur, ni sous le sol, ni sous un toit dehors (dedans : dans la pièce, sous le plafond) ; pas de cadrage de repli ;
//    l'habitant (ou la personne) qu'on montre se voit depuis la caméra, et aucun autre acteur du plan (le joueur, une
//    bête) ne se met devant ; la caméra n'est jamais contre un corps (0,75 m d'une personne, 1,15 m d'une bête) ;
//    durées dans les bornes (8 à 20 s ; 5 à 8 s en court) ;
//  - LA FILE : accepter, rendre, devenir rendable mettent le bon moment en file ; l'option Aucune n'en joue aucune
//    (et Courtes, aucun tournant) ; une scène vue ne revient pas ;
//  - UNE ANCIENNE PARTIE (sans farm.s.q20 : des quêtes finies, une en cours déjà rendable) se charge sans rien
//    mettre en file ni rien jouer ; le passé rejoint les souvenirs.
'use strict';
const fs = require('fs');
const path = require('path');
const { vallee } = require('./vm.js');
module.exports = {
  titre: 'Les scènes des quêtes (Q20)',
  async verifier(J, log) {
    let echecs = 0;
    const ko = (m) => { echecs++; log('ÉCHEC : ' + m); };
    // ---------------------------------------------------------------- pas de génération
    const dir = path.join(__dirname, '..', '..', 'src');
    const src = fs.readdirSync(dir).filter((f) => /Q20/.test(f));
    const gen = src.filter((f) => /generateValley|B\.prop\(|B\.inter\(/.test(fs.readFileSync(path.join(dir, f), 'utf8')));
    log(`fichiers Q20 : ${src.join(', ')} ; génération : ${gen.length ? gen.join(', ') : 'aucune'}`);
    if (gen.length) ko('une passe de génération dans les fichiers Q20');
    // les quêtes des habitants de 05-npc-data.js (avant que d'autres modules en ajoutent)
    const base = [...fs.readFileSync(path.join(dir, '05-npc-data.js'), 'utf8').matchAll(/id: '([a-z]+_\d+)', title:/g)].map((m) => m[1]);

    // ---------------------------------------------------------------- un banc : des habitants sans partie
    J.ev(`globalThis.__q20banc = function (graine, w) {
      farm.s = farm.blank(graine || 1234); farm.s.day = 3; farm.s.prenom = 'Jean'; farm.names = Object.assign({}, VALLEY_DESIGN.names);
      npcs.list = []; npcs.byId = {};
      for (const d of NPC_DATA) {
        const st = { name: d.names[0], amitie: 1000, met: true, talkDay: 0, giftDay: 0, mem: [], anger: 0, alive: true };
        farm.s.npcs[d.id] = st;
        const look = Object.assign({}, d.look);
        const n = { id: d.id, d, st, name: st.name, look, rig: null, x: 0, y: 0, z: 0, state: 'idle', voice: 1 };
        npcs.list.push(n); npcs.byId[d.id] = n;
      }
      ui.subtitle = () => {}; npcs.say = () => {}; sound.quest = () => {}; sound.coin = () => {};
      if (w) { game.world = w; farm.w = w; w.time = 0.45; const F = w.farm.f; game.player = { pos: [F.x, w.heightAt(F.x, F.z), F.z], yaw: 0.4, pitch: 0, hp: 100, food: 80, vel: [0, 0, 0], onGround: true, breath: 1, eyePos() { return [this.pos[0], this.pos[1] + 1.6, this.pos[2]]; } }; }
      q20.S();
    };`);

    // ---------------------------------------------------------------- les données : chaque quête a ses scènes
    const D = JSON.parse(J.avec({ base }, `(() => {
      const e = [], base = __v.base, out = { n: 0, moments: 0, ids: q20.ordre.slice() };
      for (const id of base) {
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
      for (const id of q20.ordre) { const D = q20.defs[id]; if (!q20.moments(id).length) e.push(id + ' : aucun moment'); if (D.qui && !NPC_BY_ID[D.qui] && !(typeof Q16_PNJ !== 'undefined' && Q16_PNJ[D.qui]) && !/^v5:/.test(D.qui)) e.push(id + ' : habitant inconnu ' + D.qui); }
      out.e = e;
      return JSON.stringify(out);
    })()`));
    log(`${base.length} quêtes des habitants ; ${D.n} avec leurs scènes (${D.moments} moments) ; quêtes inscrites en tout : ${D.ids.length}`);
    for (const m of D.e) ko(m);
    if (D.n < base.length) ko(`${base.length - D.n} quêtes des habitants sans scènes`);

    // ---------------------------------------------------------------- la file, l'option, une ancienne partie (sans monde)
    const F = JSON.parse(J.ev(`(() => {
      const e = [], joues = [];
      __q20banc(1234, null);
      game.world = { lm: {}, bld: {}, inter: [], props: [], heightAt: () => 10, waterLevel: 4 };
      const _jouer = q20.jouer, _emp = q20.empeche;
      q20.jouer = (id, m, o) => { joues.push(id + '|' + m + (o && o.court ? '|court' : '')); q20.souvenir(id, m, o && o.h); q20.S().vus[q20.cle(id, m)] = farm.s.day; return Promise.resolve(true); };
      q20.empeche = () => null;
      const tour = (n) => { for (let i = 0; i < (n || 20); i++) { q20.guetter(); q20.avancer(0.5); } };
      try {
        const id = q20.ordre.find((k) => { const q = quests.byId(k); return q && q.type === 'parler'; }) || q20.ordre[0];
        const q = quests.byId(id), n = npcs.byId[quests.giver(id)];
        // toutes : la demande à l'acceptation, le tournant quand le message est porté, la fin quand on rend
        settings.quetesCine = 'toutes';
        quests.accept(q, n);
        if (!q20.S().file.some((x) => x.id === id && x.m === 'demande')) e.push('accepter : pas de demande en file');
        tour(); if (!joues.includes(id + '|demande')) e.push('la demande ne se joue pas');
        farm.s.quests[id].step = 1; tour();
        if (!joues.includes(id + '|tournant')) e.push('le tournant ne se joue pas (message porté)');
        quests.complete(q, n); tour();
        if (!joues.includes(id + '|fin')) e.push('le dénouement ne se joue pas');
        if (q20.declencher(id, 'demande')) e.push('une demande vue revient en file');
        // aucune : rien ne se joue, tout rejoint les souvenirs
        const id2 = q20.ordre.find((k) => { const q = quests.byId(k); return q && q.type === 'trouver' && k !== id; });
        const q2 = quests.byId(id2), n2 = npcs.byId[quests.giver(id2)];
        settings.quetesCine = 'aucune'; const j0 = joues.length;
        farm.s.quests[id2] = { st: 'actif', day: 3, step: 0 }; q20.declencher(id2, 'demande'); tour();
        farm.give(q2.objet, 1); tour();
        quests.complete(q2, n2); tour();
        if (joues.length !== j0) e.push('option Aucune : ' + (joues.length - j0) + ' scène(s) jouée(s)');
        if (!q20.S().fait[id2 + '|demande'] || !q20.S().fait[id2 + '|fin'] || q20.S().vus[id2 + '|fin']) e.push('option Aucune : pas aux souvenirs');
        // courtes : la demande et la fin seulement, en court
        const id3 = q20.ordre.find((k) => { const q = quests.byId(k); return q && q.type === 'livrer'; });
        const q3 = quests.byId(id3), n3 = npcs.byId[quests.giver(id3)];
        settings.quetesCine = 'courtes'; const j1 = joues.length;
        quests.accept(q3, n3); tour(); farm.s.quests[id3].step = 1; tour(); quests.complete(q3, n3); tour();
        const J3 = joues.slice(j1);
        if (!J3.includes(id3 + '|demande|court') || !J3.includes(id3 + '|fin|court') || J3.some((x) => x.includes('|tournant'))) e.push('option Courtes : ' + J3.join(', '));
        settings.quetesCine = 'toutes';
        // une ancienne partie : sans farm.s.q20 ; une quête finie, une en cours déjà rendable, une en cours
        const ids = q20.ordre.filter((k) => quests.byId(k));
        const s = farm.blank(77); s.day = 9; s.npcs = farm.s.npcs;
        const fini = ids.find((k) => quests.byId(k).type === 'trouver'), rend = ids.find((k) => quests.byId(k).type === 'livrer' && k !== fini), cours = ids.find((k) => quests.byId(k).type === 'enquete');
        s.quests = { [fini]: { st: 'fait', day: 2, done: 3 }, [rend]: { st: 'actif', day: 4, step: 1 }, [cours]: { st: 'actif', day: 5, step: 0 } };
        farm.s = s;
        const j2 = joues.length;
        for (const fn of HOOKS.load) { try { fn(JSON.parse(JSON.stringify(s))); } catch (er) { /* d'autres modules veulent le monde */ } }
        const S = q20.S();
        if (!S.anc) e.push('ancienne partie : pas reconnue');
        if (S.file.length) e.push('ancienne partie : ' + S.file.length + ' scène(s) en file');
        for (const k of [fini + '|demande', fini + '|fin', rend + '|demande', rend + '|tournant', cours + '|demande']) if (!S.fait[k]) e.push('ancienne partie : ' + k + ' pas aux souvenirs');
        if (S.fait[cours + '|tournant'] || S.fait[rend + '|fin']) e.push('ancienne partie : un moment à venir marqué passé');
        tour(40);
        if (joues.length !== j2) e.push('ancienne partie : ' + (joues.length - j2) + ' scène(s) rejouée(s) : ' + joues.slice(j2).join(', '));
        // et ce qui vient ensuite se joue normalement : l'enquête veillée, puis rendue
        farm.s.quests[cours].step = 1; tour();
        if (!joues.includes(cours + '|tournant')) e.push('ancienne partie : le tournant d’une quête en cours ne se joue pas ensuite');
      } catch (er) { e.push('EXC ' + er.stack); }
      q20.jouer = _jouer; q20.empeche = _emp; farm.s = null;
      return JSON.stringify({ e, joues: joues.length });
    })()`));
    log(`la file : ${F.joues} scènes jouées dans l’essai (toutes, aucune, courtes, ancienne partie)`);
    for (const m of F.e) ko(m);

    // ---------------------------------------------------------------- les scènes, dans deux vallées, de jour et de nuit
    for (const graine of [1234, 77]) {
      const w = await vallee(J, graine);
      J.ctx.__w = w;
      const L = JSON.parse(J.ev(`(() => {
        const w = __w;
        __q20banc(${graine}, w);
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
        // (un tirage fixe : les cachettes des objets à trouver, posées au hasard dans leur lieu, sont les mêmes d'une fois
        // à l'autre ; et pour un tournant de quête 'trouver', cinq cachettes)
        const rnd0 = Math.random, rnd = mulberry32(${graine} ^ 0x2051);
        Math.random = rnd;
        try {
        for (const id of q20.ordre) {
          const q = quests.byId(id) || (typeof q16 !== 'undefined' && q16.def && q16.def(id));
          const essais = [];
          for (const m of q20.moments(id)) for (const h of [10.5, 22.6]) for (const court of [false, true]) {
            if (court && m === 'tournant') continue;
            for (let k = 0; k < (m === 'tournant' && q && q.type === 'trouver' ? 5 : 1); k++) essais.push([m, k ? (k % 2 ? 22.6 : 10.5) : h, court]);
          }
          for (const [m, h, court] of essais) {
            // l'état de la quête au moment : en cours (l'objet caché posé), ou finie
            farm.s.quests = {};
            if (q && quests.byId(id)) {
              try { quests.accept(q, npcs.byId[quests.giver(id)]); } catch (er) { e.push(id + ' : accepter ' + er.message); }
              const Q = farm.s.quests[id];
              if (Q && m !== 'demande') Q.step = 1;
              if (Q && m.startsWith('fin')) { Q.st = 'fait'; Q.done = 3; }
            }
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
            if (sc.repli) e.push(id + ' ' + m + ' (' + h + ' h) : ' + sc.repli + ' cadrage(s) de repli' + (farm.s.quests[id] && farm.s.quests[id].pos ? ' (cachette ' + farm.s.quests[id].pos.join(', ') + ')' : ''));
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
              for (const A of P._q20.acteurs) { const Q = A.vers || A.P; if (!fini(A.P) || (A.vers && !fini(A.vers)) || !Number.isFinite(A.cap || 0)) e.push(id + ' ' + m + ' : acteur aux positions non finies'); }
              // (la caméra jamais contre une personne ni une bête du plan : un bloc sombre qui mange l'image)
              for (const C of cams) { const X = fini(C) && sc.ctx.contre(C, P._q20.acteurs); if (X) { e.push(id + ' ' + m + ' (' + h + ' h) plan ' + sc.plans.indexOf(P) + ' : caméra contre ' + (X.id || (X.joueur ? 'le joueur' : X.rig || 'une silhouette')) + ' (' + Math.hypot(C[0] - (X.vers || X.P)[0], C[2] - (X.vers || X.P)[2]).toFixed(2) + ' m)'); break; } }
              for (const l of P._q20.lum) if (!fini([l.x, l.y, l.z]) || !(l.r > 0)) e.push(id + ' ' + m + ' : lumière');
              // la personne qu'on montre se voit (la première du plan qu'il faut voir)
              const A = P._q20.acteurs.find((x) => x.k === 'h' && x.vu !== false);
              if (A && cams.length && fini(cams[0])) {
                const s = A.s || 1, Q = A.vers || A.P;
                const tete = [Q[0], Q[1] + 1.45 * s * (JSON.stringify(A.geste || '').includes('assis') ? 0.72 : 1), Q[2]], buste = [Q[0], Q[1] + 1.0 * s, Q[2]];
                if (!voit(cams[0], tete, P._q20.dedans) && !voit(cams[0], buste, P._q20.dedans)) e.push(id + ' ' + m + ' (' + h + ' h) plan ' + sc.plans.indexOf(P) + ' : ' + (A.id || (A.joueur ? 'le joueur' : 'la personne')) + ' caché(e) de la caméra');
                // (et personne d'autre du plan devant elle : ni le joueur, ni une bête)
                const ev = P._q20.acteurs.filter((X) => X !== A && X.k !== 'c' && !(X.id && X.id === A.id && !X.joueur && !A.joueur));
                const dev = ev.find((X) => sc.ctx.cache(cams[0], tete, [X]));
                if (dev) e.push(id + ' ' + m + ' (' + h + ' h) plan ' + sc.plans.indexOf(P) + ' : ' + (dev.id || (dev.joueur ? 'le joueur' : dev.rig || 'une silhouette')) + ' devant ' + (A.id || (A.joueur ? 'le joueur' : 'la personne')));
              }
            }
          }
        }
        } finally { Math.random = rnd0; }
        farm.s = null;
        return JSON.stringify({ e, r });
      })()`));
      const R = L.r;
      log(`vallée ${graine} : ${R.n} scènes construites (${R.plans} plans : ${R.dedans} dedans, ${R.toit} sous un toit sans bâtiment) en ${(R.t / 1000).toFixed(1)} s (la plus lente ${R.tmax} ms : ${R.lent}) ; durées ${R.durees[0].toFixed(1)}–${R.durees[1].toFixed(1)} s, en court ${R.courtes[0].toFixed(1)}–${R.courtes[1].toFixed(1)} s`);
      const vus = new Set();
      for (const m of L.e) { const k = m.replace(/\\(\\d+(\\.\\d+)? h[^)]*\\)/, ''); if (vus.has(k)) continue; vus.add(k); ko(`vallée ${graine} : ${m}`); }
    }
    return { echecs };
  },
};
