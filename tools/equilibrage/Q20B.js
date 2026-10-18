// Équilibrage — les scènes des quêtes de Q16 (agent Q20B, vingtième vague, lot 2)
//  - LES QUÊTES : chaque quête de Q16 (les secondes des habitants, celles des autres, les gens de Basse-Fosse — chaque
//    modèle de Q16_V5_MODELES) a ses scènes : la demande, le dénouement (un par choix pour les fins à choix), le
//    tournant sauf quand on apporte ; rangées sous qui a donné la quête ; aucune passe de génération ;
//  - LES MONDES : chaque moment dit où il se joue (la vallée, sous terre, le Dessous, Basse-Fosse, Hautguet, le pays des
//    bonbons, la cité) ; dans son monde, chaque moment se construit sans erreur (graines 1234 et 77, de jour et de nuit,
//    en entier et en court) : caméras libres (dehors : ni dans un mur, ni sous le sol, ni sous un toit ; dedans : dans
//    la pièce ; sous terre : ni dans un bloc, un sol dessous, une voûte dessus ; au Dessous : entre son sol et sa voûte),
//    pas de cadrage de repli, la personne qu'on montre se voit, une réplique au moins, durées dans les bornes ;
//  - LA FILE : une scène d'ailleurs attend que le joueur y soit, et se joue là ; celles qu'on peut jouer ici passent
//    devant ; on ne la revoit (Souvenirs) que là-bas ; l'option Aucune n'en joue aucune ; une ancienne partie ne rejoue
//    rien (ce qui est passé rejoint les souvenirs).
// Pour essayer quelques quêtes : Q20B_IDS=id1,id2 node tools/equilibrage.js Q20B (Q20B_GRAINES=1234 : une seule vallée).
'use strict';
const fs = require('fs');
const path = require('path');
const { vallee } = require('./vm.js');

// le banc (des habitants sans partie) et les contrôles des caméras, pour chaque monde
const BANC = `
globalThis.__q20Bbanc = function (graine, w) {
  farm.s = farm.blank(graine || 1234); farm.s.day = 3; farm.s.prenom = 'Jean'; farm.names = Object.assign({}, VALLEY_DESIGN.names);
  npcs.list = []; npcs.byId = {};
  for (const d of NPC_DATA) {
    const st = { name: d.names[0], amitie: 1000, met: true, talkDay: 0, giftDay: 0, mem: [], anger: 0, alive: true };
    farm.s.npcs[d.id] = st;
    const n = { id: d.id, d, st, name: st.name, look: Object.assign({}, d.look), rig: null, x: 0, y: 0, z: 0, state: 'idle', voice: 1 };
    npcs.list.push(n); npcs.byId[d.id] = n;
  }
  ui.subtitle = () => {}; npcs.say = () => {}; sound.quest = () => {}; sound.coin = () => {};
  q16._gen = null; q16._idx = null;
  if (w) { game.world = w; farm.w = w; w.time = 0.45; const F = w.farm.f; game.player = { pos: [F.x, w.heightAt(F.x, F.z), F.z], yaw: 0.4, pitch: 0, hp: 100, food: 80, vel: [0, 0, 0], onGround: true, breath: 1, eyePos() { return [this.pos[0], this.pos[1] + 1.6, this.pos[2]]; } }; }
  q20.S();
};
// la quête au point voulu du moment : en cours (l'objet trouvé, le message porté…), ou finie (le choix retenu)
globalThis.__q20Betat = function (id, m) {
  farm.s.quests = {}; const S = q16.S(); S.Q = {};
  const q = quests.byId(id), q2 = !q && q16.def(id);
  if (q) {
    quests.accept(q, npcs.byId[quests.giver(id)]);
    const Q = farm.s.quests[id];
    if (Q && m !== 'demande') Q.step = 1;
    if (Q && m.startsWith('fin')) { Q.st = 'fait'; Q.done = 3; if (m.includes(':')) Q.choix = +m.split(':')[1]; }
  } else if (q2) {
    const Q = S.Q[id] = { st: 'actif', day: 3, step: m === 'demande' ? 0 : 1 };
    if (q2.type === 'trouver') q16.placer(q2, Q);
    if (m.startsWith('fin')) { Q.st = 'fait'; Q.done = 3; if (m.includes(':')) Q.choix = +m.split(':')[1]; }
  }
};
// une caméra : libre là où elle est (la vallée et la Zone : dehors ou dedans ; sous terre ; au Dessous)
globalThis.__q20Bcam = function (w, P, D) {
  const L = qtBlocs(w, P[0], P[2], 8), g = w.heightAt(P[0], P[2]);
  if (D.dedans) { const B = w.bld[D.dedans]; return !!B && qtScenes.dansPiece(w, { bld: D.dedans }, P) && !qtDansBloc(L, P, 0.2) && qtSousToit(w, L, P) && P[1] > B.y + 0.7 && P[1] < B.y + 2.6 ? '' : 'dedans hors de la pièce'; }
  if (D.monde === 'dessous') {
    const f = souterrain.floorAt(P[0], P[2]), v = souterrain.vaultAt(P[0], P[2]);
    if (P[1] < f + 0.5) return 'sous le sol du Dessous';
    if (P[1] > v - 0.3) return 'dans la voûte du Dessous';
    if (qtDansBloc(L, P, 0.2)) return 'dans un bloc';
    return '';
  }
  if (D.sous && P[1] < g - 2) {
    if (qtDansBloc(L, P, 0.2)) return 'dans un mur (sous terre)';
    const s = w.groundAt(P[0], P[2], P[1], 0);
    if (!(s > -1e8) || P[1] - s < 0.5) return 'sans sol (sous terre)';
    if (P[1] - s > 9) return 'en l’air (sous terre)';
    if (!qtRayon(w, L, P, [0, 1, 0], 40)) return 'sans voûte (sous terre)';
    return '';
  }
  if (P[1] < Math.max(g, w.waterLevel) + 0.5) return 'sous le sol ou dans l’eau';
  if (qtDansBloc(L, P, 0.2)) return 'dans un mur';
  if (!D.toit && qtSousToit(w, L, P)) return 'sous un toit';
  return '';
};
// A voit T (les blocs ; au Dessous, son relief ; dehors, le relief et les troncs)
globalThis.__q20Bvoit = function (w, A, T, D) {
  const L = qtBlocs(w, (A[0] + T[0]) / 2, (A[2] + T[2]) / 2, Math.hypot(A[0] - T[0], A[2] - T[2]) / 2 + 6);
  const v = [T[0] - A[0], T[1] - A[1], T[2] - A[2]], d = Math.hypot(v[0], v[1], v[2]) || 1, dir = [v[0] / d, v[1] / d, v[2] / d];
  if (D.dedans) return !qtRayon(w, L, A, dir, d - 0.3);
  if (D.monde === 'dessous') {
    for (let k = 1; k < 20; k++) { const t = k / 20 * (d - 0.3), x = A[0] + dir[0] * t, y = A[1] + dir[1] * t, z = A[2] + dir[2] * t; if (y < souterrain.floorAt(x, z) || y > souterrain.vaultAt(x, z)) return false; }
    return !qtRayon(w, L, A, dir, d - 0.3);
  }
  if (D.sous && (A[1] < w.heightAt(A[0], A[2]) - 2 || T[1] < w.heightAt(T[0], T[2]) - 2)) return !qtRayon(w, L, A, dir, d - 0.3);
  return qtScenes.voit(w, L, A, T, 0.35);
};
// construire et contrôler chaque moment de chaque quête de la liste ; rend { e, r }
globalThis.__q20Bscenes = function (w, ids, mondes) {
  const e = [], r = { n: 0, plans: 0, t: 0, tmax: 0, lent: '', durees: [Infinity, 0], courtes: [Infinity, 0], dedans: 0, sous: 0, mondes: {} };
  const fini = (v) => Array.isArray(v) && v.length === 3 && v.every(Number.isFinite);
  for (const id of ids) {
    const q = quests.byId(id) || q16.def(id);
    for (const m of q20.moments(id)) {
      const M = q20B.mondeDe(id, m);
      if (!mondes.includes(M)) continue;
      r.mondes[M] = (r.mondes[M] || 0) + 1;
      for (const h of [10.5, 22.6]) for (const court of [false, true]) {
        if (court && m === 'tournant') continue;
        for (let k = 0; k < (m === 'tournant' && q && q.type === 'trouver' ? 3 : 1); k++) {
          __q20Betat(id, m);
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
          if (sc.repli) e.push(id + ' ' + m + ' (' + h + ' h) : ' + sc.repli + ' cadrage(s) de repli (plans ' + sc.plans.map((P, i) => (P._q20 && P._q20.repli ? i : -1)).filter((i) => i >= 0).join(', ') + ')' + (q16.def(id) && q16.def(id).title ? ' — ' + q16.def(id).title : ''));
          const vrais = sc.plans.filter((P) => P._q20);
          if (!court && vrais.length < 2) e.push(id + ' ' + m + ' : ' + vrais.length + ' plan');
          if (vrais.length && !vrais.some((P) => P.texte) && m !== 'tournant') e.push(id + ' ' + m + ' : pas une réplique');
          const D0 = { monde: M, sous: q20B.sousTerre(M) };
          for (const P of sc.plans) {
            const cams = [], looks = [];
            if (P.de) cams.push(P.de.pos); if (P.a) cams.push(P.a.pos); if (P.chemin) for (const c of P.chemin) cams.push(c.pos);
            if (P.de && P.de.look) looks.push(P.de.look); if (P.a && P.a.look) looks.push(P.a.look); if (P.chemin) for (const c of P.chemin) looks.push(c.look);
            for (const v of cams.concat(looks)) if (!fini(v)) { e.push(id + ' ' + m + ' : position non finie'); break; }
            if (!P._q20) continue;
            r.plans++;
            if (P._q20.dedans) r.dedans++;
            const D = Object.assign({}, D0, { dedans: P._q20.dedans, toit: P._q20.toit });
            if (D.sous) r.sous++;
            for (const C of cams) { const why = fini(C) ? __q20Bcam(w, C, D) : 'non finie'; if (why) { e.push(id + ' ' + m + ' (' + h + ' h) plan ' + sc.plans.indexOf(P) + ' : caméra ' + why + ' ' + C.map((x) => x.toFixed(1)).join(',')); break; } }
            for (const A of P._q20.acteurs) if (!fini(A.P) || (A.vers && !fini(A.vers)) || !Number.isFinite(A.cap || 0)) e.push(id + ' ' + m + ' : acteur aux positions non finies');
            for (const l of P._q20.lum) if (!fini([l.x, l.y, l.z]) || !(l.r > 0)) e.push(id + ' ' + m + ' : lumière');
            const A = P._q20.acteurs.find((x) => x.k === 'h' && x.vu !== false);
            if (A && cams.length && fini(cams[0])) {
              const s = A.s || 1, Q = A.vers || A.P;
              const tete = [Q[0], Q[1] + 1.45 * s * (String(JSON.stringify(A.geste || '') || '').includes('assis') ? 0.72 : 1), Q[2]], buste = [Q[0], Q[1] + 1.0 * s, Q[2]];
              if (!__q20Bvoit(w, cams[0], tete, D) && !__q20Bvoit(w, cams[0], buste, D)) e.push(id + ' ' + m + ' (' + h + ' h) plan ' + sc.plans.indexOf(P) + ' : ' + (A.id || A.cle || (A.joueur ? 'le joueur' : 'la personne')) + ' caché(e) de la caméra');
            }
          }
        }
      }
    }
  }
  return { e, r };
};
`;

module.exports = {
  titre: 'Les scènes des quêtes de Q16 (Q20B)',
  async verifier(J, log) {
    let echecs = 0;
    const ko = (m) => { echecs++; log('ÉCHEC : ' + m); };
    const filtre = process.env.Q20B_IDS ? process.env.Q20B_IDS.split(',') : null;
    const graines = process.env.Q20B_GRAINES ? process.env.Q20B_GRAINES.split(',').map(Number) : [1234, 77];
    // ---------------------------------------------------------------- pas de génération
    const dir = path.join(__dirname, '..', '..', 'src');
    const src = fs.readdirSync(dir).filter((f) => /Q20-2/.test(f));
    const gen = src.filter((f) => /generateValley|B\.prop\(|B\.inter\(|zone\.passe\(/.test(fs.readFileSync(path.join(dir, f), 'utf8')));
    log(`fichiers du lot : ${src.join(', ')} ; génération : ${gen.length ? gen.join(', ') : 'aucune'}`);
    if (gen.length) ko('une passe de génération dans les fichiers du lot');
    J.ev(BANC);

    // ---------------------------------------------------------------- chaque quête de Q16 a ses scènes
    const D = JSON.parse(J.ev(`(() => {
      const e = [], out = { quetes: 0, moments: 0, mondes: {}, modeles: 0, ids: [] };
      __q20Bbanc(1234, null);
      const voir = (id, q, qui) => {
        const D = q20.defs[id];
        out.ids.push(id);
        if (!D) { e.push(id + ' : pas de scènes'); return; }
        out.quetes++;
        if (D.qui !== qui) e.push(id + ' : rangée sous ' + D.qui + ' (donnée par ' + qui + ')');
        if (typeof D.demande !== 'function') e.push(id + ' : pas de demande');
        if (q.choix && q.choix.length) { for (let k = 0; k < q.choix.length; k++) if (!(D.fins && typeof D.fins[k] === 'function')) e.push(id + ' : pas de dénouement pour le choix ' + k); }
        else if (typeof D.fin !== 'function') e.push(id + ' : pas de dénouement');
        if (q.type !== 'apporter' && typeof D.tournant !== 'function') e.push(id + ' : pas de tournant (' + q.type + ')');
        for (const m of q20.moments(id)) { out.moments++; const M = q20B.mondeDe(id, m); out.mondes[M] = (out.mondes[M] || 0) + 1; }
      };
      for (const k in Q16_HABITANTS) for (const q of Q16_HABITANTS[k]) voir(q.id, q, k);
      for (const k in Q16_PNJ) for (const q of Q16_PNJ[k].quetes) voir(q.id, q, k);
      // les gens de Basse-Fosse : chacun sa quête, d'un modèle tiré pour la partie ; chaque modèle a sa scène
      for (const A of Q16_V5_ANONYMES) voir('q16_v5_' + A.id, q16.P('v5:' + A.id).quetes[0], 'v5:' + A.id);
      for (const role in Q16_V5_MODELES) Q16_V5_MODELES[role].forEach((M, i) => { out.modeles++; if (!(typeof q20BV5 !== 'undefined' && q20BV5.scene(role, i))) e.push('modèle ' + role + ' ' + i + ' (' + M.title + ') : pas de scènes'); });
      out.e = e;
      return JSON.stringify(out);
    })()`));
    log(`${D.ids.length} quêtes de Q16, ${D.quetes} avec leurs scènes (${D.moments} moments : ${Object.entries(D.mondes).map(([k, n]) => k + ' ' + n).join(', ')}) ; ${D.modeles} modèles de Basse-Fosse`);
    for (const m of D.e) ko(m);
    const ids = D.ids.filter((id) => !filtre || filtre.includes(id));

    // ---------------------------------------------------------------- les mondes, chacun construit comme en jeu
    const rapport = (titre, L) => {
      const R = L.r;
      log(`${titre} : ${R.n} scènes construites (${R.plans} plans : ${R.dedans} dedans, ${R.sous} sous terre ; moments ${Object.entries(R.mondes).map(([k, n]) => k + ' ' + n).join(', ') || 'aucun'}) en ${(R.t / 1000).toFixed(1)} s (la plus lente ${R.tmax} ms : ${R.lent}) ; durées ${R.n ? R.durees[0].toFixed(1) + '–' + R.durees[1].toFixed(1) : '-'} s, en court ${R.n ? R.courtes[0].toFixed(1) + '–' + R.courtes[1].toFixed(1) : '-'} s`);
      const vus = new Set();
      for (const m of L.e) { const k = m.replace(/\(\d+(\.\d+)? h[^)]*\)/, ''); if (vus.has(k)) continue; vus.add(k); ko(`${titre} : ${m}`); }
    };
    // (deux résultats en un)
    J.ev(`globalThis.__q20Bjoindre = function (a, b) {
      a.e.push(...b.e); for (const k of ['n', 'plans', 't', 'dedans', 'sous']) a.r[k] += b.r[k];
      for (const k in b.r.mondes) a.r.mondes[k] = (a.r.mondes[k] || 0) + b.r.mondes[k];
      if (b.r.tmax > a.r.tmax) { a.r.tmax = b.r.tmax; a.r.lent = b.r.lent; }
      a.r.durees = [Math.min(a.r.durees[0], b.r.durees[0]), Math.max(a.r.durees[1], b.r.durees[1])];
      a.r.courtes = [Math.min(a.r.courtes[0], b.r.courtes[0]), Math.max(a.r.courtes[1], b.r.courtes[1])];
      return a;
    };`);
    for (const graine of graines) {
      const w = await vallee(J, graine);
      J.ctx.__w = w;
      // la vallée : dehors, sous terre (les nains, la cave des Murés, la Gobelinière), le Dessous ; puis la cité, les bonbons
      const L = JSON.parse(J.avec({ ids }, `(() => {
        const w = __w;
        __q20Bbanc(${graine}, w);
        const rnd0 = Math.random; Math.random = mulberry32(${graine} ^ 0x2052);
        const ver0 = w.curVer;
        try {
          const a = __q20Bscenes(w, __v.ids, ['vallee', 'nains', 'cave', 'gobeliniere']);
          // (au Dessous : ce qui n'existe que dessous existe, et ceux d'en bas sont à leur place)
          w.curVer |= VER_SOUS;
          try { soutTerres.construire(); } catch (er) { a.e.push('le Dessous : ' + er.message); }
          __q20Bjoindre(a, __q20Bscenes(w, __v.ids, ['dessous']));
          w.curVer = ver0;
          // la cité (bâtie très bas sous la lisière est, comme quand on y entre)
          try { vgCite.maisons = []; vgCite.machines = {}; vgCite.choses = {}; vgCite.batir(); vgCite.peupler(); mondes.cur = 'vaisseau'; __q20Bjoindre(a, __q20Bscenes(w, __v.ids, ['vaisseau'])); }
          catch (er) { a.e.push('la cité : ' + er.message); }
          // le pays des bonbons (dressé autour du joueur, à la ferme)
          try { mondes.cur = null; MONDES.bonbons.entrer({ pilule: true }); mondes.cur = 'bonbons'; __q20Bjoindre(a, __q20Bscenes(w, __v.ids, ['bonbons'])); }
          catch (er) { a.e.push('les bonbons : ' + er.message); }
          return JSON.stringify(a);
        } finally { Math.random = rnd0; w.curVer = ver0; mondes.cur = null; farm.s = null; }
      })()`));
      rapport(`vallée ${graine}`, L);
      // la Zone : Basse-Fosse et Hautguet ; chaque modèle de Basse-Fosse, joué par une personne tirée
      J.ev(`__q20Bbanc(${graine}, __w);`);
      const Z = await J.ev('zoneGen.generer(zone.graine(), () => {})');
      J.ctx.__Z = Z;
      const LZ = JSON.parse(J.avec({ ids }, `(() => {
        const Z = __Z;
        const rnd0 = Math.random; Math.random = mulberry32(${graine} ^ 0x2053);
        try {
          zone.Z = Z; game.world = Z; habitantsV5.cle = null; habitantsV5.creer();
          const T = Z.v5 && Z.v5.temple;
          if (T) game.player.pos = [T.f.x, Z.v5.F, T.f.z];
          const a = __q20Bscenes(Z, __v.ids, ['basse_fosse', 'hautguet']);
          a.modeles = 0;
          for (const role in Q16_V5_MODELES) Q16_V5_MODELES[role].forEach((M, i) => {
            const A = Q16_V5_ANONYMES.find((q) => q.role === role);
            const G = q16.generer(), k = 'v5:' + A.id;
            G[k].quetes[0] = Object.assign({}, M, { id: 'q16_v5_' + A.id });
            q16._idx = null; q20BV5.majDefs();
            a.modeles++;
            __q20Bjoindre(a, __q20Bscenes(Z, ['q16_v5_' + A.id], ['basse_fosse']));
          });
          q16._gen = null; q16._idx = null;
          return JSON.stringify(a);
        } finally { Math.random = rnd0; zone.Z = null; game.world = __w; farm.s = null; }
      })()`));
      rapport(`Zone ${graine} (${LZ.modeles} modèles de Basse-Fosse)`, LZ);
    }
    return { echecs };
  },
};
