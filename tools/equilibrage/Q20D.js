// Équilibrage — les scènes des quêtes d'ailleurs (agent Q20D, vingtième vague, lot 4)
//  - LES QUÊTES : chaque quête retenue hors de la vallée (Hautguet, le Dessous, la cité, les Terres d'Avant, les
//    Galeries) a ses scènes : les moments attendus, rangées sous qui les donne (un habitant de Q16_PNJ ou un donneur de
//    Q20D_QUI / Q20C_QUI) ; aucune passe de génération dans les fichiers du lot ;
//  - LES DÉCLENCHEURS (sans monde) : ce que fait le jeu (une clé prise, le pont baissé, la Dame qui répond, un pain
//    rompu, le Cœur allumé…) met le bon moment en file, une fois ; il attend que le joueur soit dans son monde ; l'option
//    Aucune n'en joue aucune ; une ancienne partie (sans farm.s.q20) n'en rejoue aucune ;
//  - LES SCÈNES (graines 1234 et 77, de jour et de nuit, en entier et en court), chacune dans son monde (la vallée, les
//    Galeries, le Dessous, la cité ; Hautguet et le reste de la Zone) : construites sans erreur, aux positions finies ;
//    caméras libres (dehors : ni dans un mur, ni sous le sol, ni sous un toit, sauf dans une salle close ; sous terre :
//    ni dans un bloc, un sol dessous, une voûte dessus ; au Dessous : entre son sol et sa voûte) ; pas de cadrage de
//    repli ; la personne qu'on montre se voit, et dans le cadre ; une réplique au moins (sauf un tournant) ; durées
//    dans les bornes ; une lumière dans chaque plan sous terre ou la nuit dans une salle (jamais l'écran noir).
// Pour aller vite pendant la mise au point : Q20D_IDS=id1,id2 Q20D_GRAINES=1234 Q20D_ZONE=0 node tools/equilibrage.js Q20D
'use strict';
const fs = require('fs');
const path = require('path');
const { vallee } = require('./vm.js');

// les quêtes du lot et leurs moments attendus
const ATTENDU = {
  q20d_hg_chateau: ['demande', 'fin'],
  q20d_hg_cles: ['demande', 'tournant', 'fin'],
  q20d_hg_guet: ['demande', 'fin'],
  q20d_hg_pont: ['demande', 'tournant', 'fin'],
  q20d_hg_dame: ['demande', 'tournant', 'fin:0', 'fin:1'],
  q20d_so_appel: ['demande', 'tournant', 'fin:0', 'fin:1', 'fin:2'],
  q20d_so_onze: ['demande', 'tournant', 'fin:0', 'fin:1'],
  q20d_so_onzieme: ['demande', 'fin'],
  q20d_so_perle: ['demande', 'fin'],
  q20d_so_aelim: ['demande', 'tournant', 'fin'],
  q20d_r15_niche: ['demande', 'tournant', 'fin'],
  q20d_vg_seuil: ['demande', 'tournant', 'fin:0', 'fin:1'],
  q20d_vg_coeur: ['demande', 'tournant', 'fin:0', 'fin:1'],
  q20d_z_tertres: ['demande', 'tournant', 'fin'],
  q20d_r15_tertre: ['demande', 'tournant', 'fin'],
};

// le banc (des habitants sans partie), l'état de chaque quête au moment montré, et les contrôles des caméras
const BANC = `
globalThis.__q20Dbanc = function (graine, w) {
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
  // (la caméra d'un plan sur quelqu'un retient sur qui elle est : on vérifie qu'il est dans le cadre)
  if (!Q20Scene.prototype.camActeur.__q20D) {
    const f0 = Q20Scene.prototype.camActeur;
    Q20Scene.prototype.camActeur = function (A, o) { const R = f0.call(this, A, o); if (R && R.de && A) R.de.sur = A; return R; };
    Q20Scene.prototype.camActeur.__q20D = true;
    const f1 = Q20D.pieceActeur;
    Q20D.pieceActeur = function (c, A, o) { const R = f1.call(this, c, A, o); if (R && R.de && A) R.de.sur = A; return R; };
  }
};
// l'état d'une quête au moment montré (k : une variante)
globalThis.__q20Dprep = function (id, m, k) {
  const fin = m.startsWith('fin'), ch = m.includes(':') ? m.split(':')[1] : null, s = farm.s, d = s.day;
  farm.s.q20d = { v: 1 };
  const N = q20d.S();
  const V4 = () => chateauV4.S(), VGs = () => VG.S(), T = () => soutTerres.S(), X = () => soutSecrets.X(), R = () => runes.S(), Z = () => zone.S();
  switch (id) {
    case 'q20d_hg_chateau': V4().vus.arrivee = 1; V4().fin = fin ? d : 0; if (fin) { V4().guet = true; V4().leviers.pont = d; } break;
    case 'q20d_hg_cles': N.cle1 = k ? 'chapelle' : 'poterne'; V4().pris['o:cle_' + N.cle1] = d; if (m !== 'demande') V4().pris['o:cle_donjon'] = d; if (fin) { V4().portes.donjon = 'ouverte'; N.terrasse = { j: d }; } break;
    case 'q20d_hg_guet': V4().parle.t_guet = 1; V4().guet = fin; break;
    case 'q20d_hg_pont': V4().parle.t_treuil = 1; if (m !== 'demande') { V4().leviers.pont = d; V4().thibaud = { n: 2, etat: fin ? 'bout' : 'baisse', jour: d - (fin ? 1 : 0) }; } if (fin) N.bout = { j: d }; break;
    case 'q20d_hg_dame': V4().dame = { n: 2, fin: fin ? 1 : 0 }; if (m === 'tournant') N.dameCle = { j: d }; if (fin) { N.dame = { j: d, pont: ch === '0' ? 1 : 0 }; V4().leviers.pont = ch === '0' ? d : 0; } break;
    case 'q20d_so_appel': souterrain.S().vu.hameau = d; T().appelVu = 1; if (m === 'tournant') T().refus = d; if (fin) { T().admis = d; N.appel = { j: d, c: +ch }; } break;
    case 'q20d_so_onze': T().admis = 1; T().dons = 1; if (m !== 'demande') T().liste = 1; if (fin) { N.pest = { j: d, c: +ch }; if (ch === '0') T().pest = d; } break;
    case 'q20d_so_onzieme': souterrain.S().carnet = d; if (fin) N.bottes = { j: d }; break;
    case 'q20d_so_perle': T().admis = 1; T().profane = fin ? 0 : d; T().rendue = fin ? d : 0; break;
    case 'q20d_so_aelim': N.aelim = { j: d }; X().vuePorte = 1; X().porte = m !== 'demande' ? d : 0; X().coffre = fin ? d : 0; break;
    case 'q20d_r15_niche': N.niche = { j: d }; R().p.niche = m !== 'demande' ? d : 0; R().c.niche = fin ? 1 : 0; break;
    case 'q20d_r15_tertre': N.tertre = { j: d }; R().p.tertre = m !== 'demande' ? d : 0; R().c.tertre = fin ? 1 : 0; break;
    case 'q20d_z_tertres': Z().lus.inscr_tertres = d; if (m !== 'demande') Z().ouverts.tertre_0 = d; if (fin) for (let i = 0; i < 3; i++) Z().pris['tertre_' + i + '_roi'] = d; break;
    case 'q20d_vg_seuil': VGs().lus.anselme = 1; VGs().etat = m === 'demande' ? 0 : m === 'tournant' ? 1 : 2; VGs().nommee = m !== 'demande' ? 1 : 0; VGs().mort = ch === '1' ? 1 : 0; break;
    case 'q20d_vg_coeur': VGs().dits.machinerie = 1; if (m !== 'demande') { N.coeur = { j: d, on: 1 }; VGs().dits.coeur_on = 1; } if (fin) N.coeur.off = ch === '1' ? 'veilleuse' : 'joueur'; VGs().m.coeur = m === 'tournant' ? 1 : 0; break;
  }
};
// une caméra libre là où elle est (le monde de la scène : dehors, dans une salle close, sous terre, au Dessous)
globalThis.__q20Dcam = function (w, P, D) {
  const L = qtBlocs(w, P[0], P[2], 8), g = w.heightAt(P[0], P[2]);
  if (D.dedans) { const B = w.bld[D.dedans]; return !!B && qtScenes.dansPiece(w, { bld: D.dedans }, P) && !qtDansBloc(L, P, 0.2) && qtSousToit(w, L, P) && P[1] > B.y + 0.7 && P[1] < B.y + 2.6 ? '' : 'dedans hors de la pièce'; }
  if (D.monde === 'dessous') {
    const f = souterrain.floorAt(P[0], P[2]), v = souterrain.vaultAt(P[0], P[2]);
    if (P[1] < f + 0.5) return 'sous le sol du Dessous';
    if (P[1] > v - 0.3) return 'dans la voûte du Dessous';
    if (qtDansBloc(L, P, 0.2)) return 'dans un bloc';
    return '';
  }
  if (P[1] < g - 2) {
    if (qtDansBloc(L, P, 0.2)) return 'dans un mur (sous terre)';
    const s = w.groundAt(P[0], P[2], P[1], 0);
    if (!(s > -1e8) || P[1] - s < 0.5) return 'sans sol (sous terre)';
    if (P[1] - s > 9) return 'en l’air (sous terre)';
    if (!qtRayon(w, L, P, [0, 1, 0], 40)) return 'sans voûte (sous terre)';
    return '';
  }
  if (P[1] < Math.max(g, w.waterLevel) + 0.5) return 'sous le sol ou dans l’eau';
  if (qtDansBloc(L, P, 0.2)) return 'dans un mur';
  if (D.toit) { const s = w.groundAt(P[0], P[2], P[1], 0); if (!(s > -1e8) || P[1] - s < 0.6) return 'sans plancher (salle)'; return ''; }
  if (qtSousToit(w, L, P)) return 'sous un toit';
  return '';
};
// A voit T (les blocs ; au Dessous, son relief ; dehors, le relief et les troncs)
globalThis.__q20Dvoit = function (w, A, T, D) {
  const L = qtBlocs(w, (A[0] + T[0]) / 2, (A[2] + T[2]) / 2, Math.hypot(A[0] - T[0], A[2] - T[2]) / 2 + 6);
  const v = [T[0] - A[0], T[1] - A[1], T[2] - A[2]], d = Math.hypot(v[0], v[1], v[2]) || 1, dir = [v[0] / d, v[1] / d, v[2] / d];
  if (D.dedans) return !qtRayon(w, L, A, dir, d - 0.3);
  if (D.monde === 'dessous') {
    for (let k = 1; k < 20; k++) { const t = k / 20 * (d - 0.3), x = A[0] + dir[0] * t, y = A[1] + dir[1] * t, z = A[2] + dir[2] * t; if (y < souterrain.floorAt(x, z) || y > souterrain.vaultAt(x, z)) return false; }
    return !qtRayon(w, L, A, dir, d - 0.3);
  }
  if (A[1] < w.heightAt(A[0], A[2]) - 2 || T[1] < w.heightAt(T[0], T[2]) - 2 || D.toit) return !qtRayon(w, L, A, dir, d - 0.3);
  return qtScenes.voit(w, L, A, T, 0.35);
};
// le point Q est-il dans le champ d'une caméra en C qui regarde L ? (75° de large ; 16/9 : ±23° en hauteur ; un peu de marge)
globalThis.__q20Dcadre = function (C, L, Q) {
  const f = [L[0] - C[0], L[1] - C[1], L[2] - C[2]], v = [Q[0] - C[0], Q[1] - C[1], Q[2] - C[2]];
  if (Math.hypot(v[0], v[1], v[2]) < 0.3) return false;
  let da = Math.atan2(v[0], v[2]) - Math.atan2(f[0], f[2]);
  while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
  const dp = Math.atan2(v[1], Math.hypot(v[0], v[2])) - Math.atan2(f[1], Math.hypot(f[0], f[2]));
  return Math.abs(da) < 0.6 && Math.abs(dp) < 0.38;
};
// construire et contrôler chaque moment de chaque quête de la liste, dans les mondes donnés ; rend { e, r }
globalThis.__q20Dscenes = function (w, ids, mondes, variantes) {
  const e = [], r = { n: 0, plans: 0, t: 0, tmax: 0, lent: '', durees: [Infinity, 0], courtes: [Infinity, 0], toit: 0, sous: 0, mondes: {} };
  const fini = (v) => Array.isArray(v) && v.length === 3 && v.every(Number.isFinite);
  for (const id of ids) {
    for (const m of q20.moments(id)) {
      const M = q20B.mondeDe(id, m);
      if (!mondes.includes(M)) continue;
      r.mondes[M] = (r.mondes[M] || 0) + 1;
      const nv = (variantes && variantes[id + '|' + m]) || 1;
      for (let k = 0; k < nv; k++) for (const h of [10.5, 22.6]) for (const court of [false, true]) {
        if (court && m === 'tournant') continue;
        __q20Dprep(id, m, k);
        const t0 = Date.now();
        let sc = null;
        try { sc = q20.construire(id, m, { h, court }); } catch (er) { e.push(id + ' ' + m + ' : ' + er.message); continue; }
        const dt = Date.now() - t0;
        r.t += dt; if (dt > r.tmax) { r.tmax = dt; r.lent = id + ' ' + m; }
        const nom = id + ' ' + m + (nv > 1 ? ' [' + k + ']' : '');
        if (!sc) { e.push(nom + ' (' + h + ' h' + (court ? ', court' : '') + ') : rien à montrer'); continue; }
        r.n++;
        const B = court ? r.courtes : r.durees;
        B[0] = Math.min(B[0], sc.duree); B[1] = Math.max(B[1], sc.duree);
        const [d0, d1] = court ? Q20_REGL.court : Q20_REGL.duree;
        if (sc.duree < d0 - 0.01 || sc.duree > d1 + 0.01) e.push(nom + (court ? ' (court)' : '') + ' : ' + sc.duree.toFixed(1) + ' s');
        if (sc.repli) e.push(nom + ' (' + h + ' h) : ' + sc.repli + ' cadrage(s) de repli (plans ' + sc.plans.map((P, i) => (P._q20 && P._q20.repli ? i : -1)).filter((i) => i >= 0).join(', ') + ')');
        const vrais = sc.plans.filter((P) => P._q20);
        if (!court && vrais.length < 2) e.push(nom + ' : ' + vrais.length + ' plan');
        if (vrais.length && !vrais.some((P) => P.texte) && m !== 'tournant') e.push(nom + ' : pas une réplique');
        for (const P of sc.plans) {
          const cams = [], looks = [];
          if (P.de) cams.push(P.de.pos); if (P.a) cams.push(P.a.pos); if (P.chemin) for (const c of P.chemin) cams.push(c.pos);
          if (P.de && P.de.look) looks.push(P.de.look); if (P.a && P.a.look) looks.push(P.a.look); if (P.chemin) for (const c of P.chemin) looks.push(c.look);
          for (const v of cams.concat(looks)) if (!fini(v)) { e.push(nom + ' : position non finie'); break; }
          if (!P._q20) continue;
          r.plans++;
          if (P._q20.toit) r.toit++;
          const D = { monde: M, dedans: P._q20.dedans, toit: P._q20.toit };
          for (const C of cams) { const why = fini(C) ? __q20Dcam(w, C, D) : 'non finie'; if (why) { e.push(nom + ' (' + h + ' h) plan ' + sc.plans.indexOf(P) + ' : caméra ' + why + ' ' + C.map((x) => x.toFixed(1)).join(',')); break; } }
          const sousT = cams.length && fini(cams[0]) && (M === 'dessous' || cams[0][1] < w.heightAt(cams[0][0], cams[0][2]) - 2);
          if (sousT) r.sous++;
          // (sous terre, ou la nuit dans une salle close : une lumière au moins, jamais le noir)
          if ((sousT || (P._q20.toit && (h >= 20.2 || h < 5.6))) && !P._q20.lum.some((l) => l && l.r >= 2.5)) e.push(nom + ' (' + h + ' h) plan ' + sc.plans.indexOf(P) + ' : pas de lumière (sous terre ou dans une salle, la nuit)');
          for (const A of P._q20.acteurs) if (!fini(A.P) || (A.vers && !fini(A.vers)) || !Number.isFinite(A.cap || 0)) e.push(nom + ' : acteur aux positions non finies');
          for (const l of P._q20.lum) if (!fini([l.x, l.y, l.z]) || !(l.r > 0)) e.push(nom + ' : lumière');
          const A = P._q20.acteurs.find((x) => x.k === 'h' && x.vu !== false);
          if (A && cams.length && fini(cams[0])) {
            const s = A.s || 1, Q = A.vers || A.P;
            const tete = [Q[0], Q[1] + 1.45 * s * (String(JSON.stringify(A.geste || '') || '').includes('assis') ? 0.72 : 1), Q[2]], buste = [Q[0], Q[1] + 1.0 * s, Q[2]];
            if (!__q20Dvoit(w, cams[0], tete, D) && !__q20Dvoit(w, cams[0], buste, D)) e.push(nom + ' (' + h + ' h) plan ' + sc.plans.indexOf(P) + ' : ' + (A.id || A.cle || (A.joueur ? 'le joueur' : 'la personne')) + ' caché(e) de la caméra');
          }
          const S = P.de && P.de.sur;
          if (S) for (const [K, Q2] of [[P.de, S.P], [P.a, S.vers || S.P]]) {
            if (!K || !fini(K.pos) || !fini(K.look) || !fini(Q2)) continue;
            const s = S.s || 1, dans = (y) => __q20Dcadre(K.pos, K.look, [Q2[0], Q2[1] + y * s, Q2[2]]);
            if (!dans(1.45) && !dans(1.0) && !dans(0.6)) { e.push(nom + ' (' + h + ' h) plan ' + sc.plans.indexOf(P) + ' : ' + (S.id || S.cle || (S.joueur ? 'le joueur' : 'la personne')) + ' hors du cadre' + (K === P.a ? ' (à la fin)' : '')); break; }
          }
        }
      }
    }
  }
  return { e, r };
};
globalThis.__q20Djoindre = function (a, b) {
  a.e.push(...b.e); for (const k of ['n', 'plans', 't', 'toit', 'sous']) a.r[k] += b.r[k];
  for (const k in b.r.mondes) a.r.mondes[k] = (a.r.mondes[k] || 0) + b.r.mondes[k];
  if (b.r.tmax > a.r.tmax) { a.r.tmax = b.r.tmax; a.r.lent = b.r.lent; }
  a.r.durees = [Math.min(a.r.durees[0], b.r.durees[0]), Math.max(a.r.durees[1], b.r.durees[1])];
  a.r.courtes = [Math.min(a.r.courtes[0], b.r.courtes[0]), Math.max(a.r.courtes[1], b.r.courtes[1])];
  return a;
};
`;
// les variantes d'un moment (deux sortes de demande) : 'id|moment' → n
const VARIANTES = { 'q20d_hg_cles|demande': 2 };

module.exports = {
  titre: 'Les scènes des quêtes d’ailleurs (Q20D)',
  ATTENDU,
  async verifier(J, log) {
    let echecs = 0;
    const ko = (m) => { echecs++; log('ÉCHEC : ' + m); };
    const filtre = process.env.Q20D_IDS ? process.env.Q20D_IDS.split(',') : null;
    const graines = process.env.Q20D_GRAINES ? process.env.Q20D_GRAINES.split(',').map(Number) : [1234, 77];
    const avecZone = process.env.Q20D_ZONE !== '0';
    // ---------------------------------------------------------------- pas de génération
    const dir = path.join(__dirname, '..', '..', 'src');
    const src = fs.readdirSync(dir).filter((f) => /Q20-4/.test(f));
    const gen = src.filter((f) => /generateValley|B\.prop\(|B\.inter\(|zone\.passe\(|w\.props\.push|w\.inter\.push|blocks\.push/.test(fs.readFileSync(path.join(dir, f), 'utf8')));
    log(`fichiers du lot : ${src.join(', ')} ; génération : ${gen.length ? gen.join(', ') : 'aucune'}`);
    if (gen.length) ko('une passe de génération dans les fichiers du lot');
    J.ev(BANC);

    // ---------------------------------------------------------------- chaque quête a ses scènes
    const D = JSON.parse(J.avec({ A: ATTENDU }, `(() => {
      const e = [], out = { quetes: 0, moments: 0, mondes: {} };
      for (const id in __v.A) {
        const D = q20.defs[id];
        if (!D) { e.push(id + ' : pas de scènes'); continue; }
        out.quetes++;
        const M = q20.moments(id);
        for (const m of __v.A[id]) if (!M.includes(m)) e.push(id + ' : pas de moment ' + m);
        for (const m of M) { out.moments++; const W = q20B.mondeDe(id, m); out.mondes[W] = (out.mondes[W] || 0) + 1; }
        if (typeof D.etat !== 'function') e.push(id + ' : pas d’état');
        if (D.qui && !NPC_BY_ID[D.qui] && !Q16_PNJ[D.qui]) e.push(id + ' : rangée sous un inconnu (' + D.qui + ')');
        if (!D.qui && !(D.souv && (Q20D_QUI[D.souv] || (typeof Q20C_QUI !== 'undefined' && Q20C_QUI[D.souv])))) e.push(id + ' : ni habitant ni donneur pour les Souvenirs');
        if (!D.titre) e.push(id + ' : pas de titre');
      }
      out.e = e;
      return JSON.stringify(out);
    })()`));
    log(`${Object.keys(ATTENDU).length} quêtes d’ailleurs, ${D.quetes} avec leurs scènes (${D.moments} moments : ${Object.entries(D.mondes).map(([k, n]) => k + ' ' + n).join(', ')})`);
    for (const m of D.e) ko(m);
    const ids = Object.keys(ATTENDU).filter((id) => !filtre || filtre.includes(id));

    // ---------------------------------------------------------------- les déclencheurs et la file (sans monde)
    const F = JSON.parse(J.ev(`(() => {
      const e = [], joues = [];
      __q20Dbanc(1234, null);
      game.world = { lm: {}, bld: { auberge: {}, eglise: {} }, inter: [], props: [], heightAt: () => 10, waterLevel: 4 };
      game.player = { pos: [0, 10, 0], underground: false, vel: [0, 0, 0], eyePos() { return [0, 11.6, 0]; } };
      game.started = true;
      const _jouer = q20.jouer, _emp = q20.empeche, _ici = q20B.ici, _sub = ui.subtitle;
      let ici = 'vallee';
      q20B.ici = () => ici;
      q20.jouer = (id, m, o) => { joues.push(id + '|' + m + (o && o.court ? '|court' : '') + (o && o.rejeu ? '|rejeu' : '')); if (!(o && o.rejeu)) { q20.souvenir(id, m, o && o.h); q20.S().vus[q20.cle(id, m)] = farm.s.day; } return Promise.resolve(true); };
      q20.empeche = function () { return this.dansVallee() ? null : 'ailleurs'; };
      const tour = (n) => { for (let i = 0; i < (n || 14); i++) { q20d.t = 0; q20d.update(0.5); q20.guetter(); q20.avancer(0.5); } };
      const a = (id) => joues.filter((x) => x.startsWith(id + '|'));
      try {
        settings.quetesCine = 'toutes';
        const V4 = chateauV4.S();
        // Hautguet : le château vu de loin — dans la vallée, rien ; à Hautguet, la demande
        V4.vus.arrivee = 1; tour();
        if (a('q20d_hg_chateau').length) e.push('Hautguet : une scène jouée dans la vallée');
        ici = 'hautguet'; tour();
        if (!a('q20d_hg_chateau').includes('q20d_hg_chateau|demande')) e.push('Hautguet : la demande du château ne se joue pas là-bas (' + a('q20d_hg_chateau').join(', ') + ')');
        // les clés : la première (celle de la sacristie), la grande clé (le tournant), la terrasse (la fin)
        V4.pris['o:cle_chapelle'] = 3; tour();
        if (!a('q20d_hg_cles').includes('q20d_hg_cles|demande') || q20d.S().cle1 !== 'chapelle') e.push('les clés : la demande (' + a('q20d_hg_cles').join(', ') + ', ' + q20d.S().cle1 + ')');
        V4.pris['o:cle_donjon'] = 3; tour();
        if (!a('q20d_hg_cles').includes('q20d_hg_cles|tournant')) e.push('les clés : le tournant ne se joue pas');
        q20d.note('terrasse'); tour();
        if (!a('q20d_hg_cles').includes('q20d_hg_cles|fin')) e.push('les clés : la fin ne se joue pas');
        // la Dame : elle répond (la demande), elle entend la clé (le tournant), la porte ouverte pont levé (fin:1)
        V4.dame.n = 1; tour();
        q20d.note('dameCle'); tour();
        q20d.note('dame', { pont: 0 }); V4.dame.fin = true; tour();
        if (a('q20d_hg_dame').join() !== 'q20d_hg_dame|demande,q20d_hg_dame|tournant,q20d_hg_dame|fin:1') e.push('la Dame : ' + a('q20d_hg_dame').join(', '));
        // le pont : Thibaud en parle, on le baisse ; le lendemain, au bout du pont (seulement à Hautguet)
        V4.parle.t_treuil = 1; tour(); V4.leviers.pont = 3; V4.thibaud = { n: 3, etat: 'baisse', jour: 3 }; tour(30);
        if (a('q20d_hg_pont').join() !== 'q20d_hg_pont|demande,q20d_hg_pont|tournant') e.push('le pont : ' + a('q20d_hg_pont').join(', '));
        // (dans le banc sans monde, zone.dedans n'est pas vrai : la fin vient de la note, comme le guet la pose là-bas)
        farm.s.day = 4; q20d.note('bout'); tour();
        if (!a('q20d_hg_pont').includes('q20d_hg_pont|fin')) e.push('le pont : la fin ne se joue pas');
        farm.s.day = 3;
        // le Guet : la fin seule (on l'allume sans avoir demandé à Thibaud) ; Courtes : en court
        settings.quetesCine = 'courtes'; V4.guet = true; tour();
        if (!a('q20d_hg_guet').includes('q20d_hg_guet|fin|court')) e.push('le Guet, en court : ' + a('q20d_hg_guet').join(', '));
        settings.quetesCine = 'toutes';
        // la cité : la demande dans la vallée (le papier d'Anselme) ; le tournant attend la cité ; la fin, revenu
        ici = 'vallee'; VG.S().lus.anselme = 1; tour();
        if (!a('q20d_vg_seuil').includes('q20d_vg_seuil|demande')) e.push('la pierre ronde : la demande ne se joue pas dans la vallée');
        VG.S().etat = 1; VG.S().nommee = 1; tour();
        if (a('q20d_vg_seuil').includes('q20d_vg_seuil|tournant')) e.push('la pierre ronde : le tournant joué hors de la cité');
        ici = 'vaisseau'; tour();
        if (!a('q20d_vg_seuil').includes('q20d_vg_seuil|tournant')) e.push('la pierre ronde : le tournant ne se joue pas dans la cité');
        // le Cœur : allumé, puis éteint par la veilleuse (fin:1)
        VG.S().dits.machinerie = 1; tour(); VG.S().m.coeur = 1; VG.S().dits.coeur_on = 1; tour(); VG.S().m.coeur = 0; tour();
        if (a('q20d_vg_coeur').join() !== 'q20d_vg_coeur|demande,q20d_vg_coeur|tournant,q20d_vg_coeur|fin:1') e.push('le Cœur : ' + a('q20d_vg_coeur').join(', '));
        ici = 'vallee'; VG.S().etat = 2; VG.S().mort = 0; tour(20);
        if (!a('q20d_vg_seuil').includes('q20d_vg_seuil|fin:0')) e.push('la pierre ronde : le retour ne se joue pas (' + a('q20d_vg_seuil').join(', ') + ')');
        // le Dessous : le hameau vu, refusé, admis en disant « onz » (fin:2) ; au Dessous seulement
        souterrain.S().vu.hameau = 3; tour();
        if (a('q20d_so_appel').length) e.push('le hameau : une scène jouée dans la vallée');
        ici = 'dessous'; tour();
        const T = soutTerres.S(); T.refus = 3; tour(); q20d.note('appel', { c: 2 }); T.admis = 3; tour(30);
        if (a('q20d_so_appel').join() !== 'q20d_so_appel|demande,q20d_so_appel|tournant,q20d_so_appel|fin:2') e.push('le hameau : ' + a('q20d_so_appel').join(', '));
        // les onze : le pain, la peau, « ouï » (fin:1)
        T.dons = 1; tour(); T.liste = 1; tour(); q20d.note('pest', { c: 1 }); tour();
        if (a('q20d_so_onze').join() !== 'q20d_so_onze|demande,q20d_so_onze|tournant,q20d_so_onze|fin:1') e.push('les onze : ' + a('q20d_so_onze').join(', '));
        // revoir une scène du Dessous depuis la vallée : non
        ici = 'vallee';
        let dit = ''; ui.subtitle = (q, t) => { dit = t; };
        const nR = joues.length; q20.rejouer('q20d_so_onze', 'demande');
        if (joues.length !== nR || dit !== Q20_TEXTES.pasIci) e.push('revoir d’ailleurs depuis la vallée : ' + (joues.length - nR) + ' scène(s), « ' + dit + ' »');
        ui.subtitle = () => {};
        // l'option Aucune : rien ne se joue, tout rejoint les souvenirs (la niche des Galeries)
        settings.quetesCine = 'aucune'; ici = 'galeries';
        const nA = joues.length;
        q20d.note('niche'); tour(); runes.S().p.niche = 3; tour(); runes.S().c.niche = 1; tour();
        if (joues.length !== nA) e.push('option Aucune : ' + (joues.length - nA) + ' scène(s) jouée(s)');
        if (!q20.S().fait['q20d_r15_niche|demande'] || !q20.S().fait['q20d_r15_niche|fin']) e.push('option Aucune : pas aux souvenirs');
        settings.quetesCine = 'toutes';
        // une ancienne partie : Hautguet fini, le hameau admis, la cité visitée et revenue ; rien en file, rien de rejoué
        const s = farm.blank(77); s.day = 9; s.npcs = farm.s.npcs;
        s.v4 = { v: 1, vus: { arrivee: 1 }, parle: { t_guet: 1, t_treuil: 1 }, pris: { 'o:cle_poterne': 2, 'o:cle_donjon': 3 }, portes: { donjon: 'ouverte', tour_dame: 'ouverte' }, leviers: { pont: 3 }, guet: true, fin: 4, dame: { n: 3, fin: true }, thibaud: { n: 4, etat: 'bout', jour: 3 } };
        s.souterrain = { vu: { hameau: 2, dormeurs: 3 }, t: { admis: 2, dons: 2, liste: 1, pest: 3 }, carnet: 3 };
        s.vaisseau = { etat: 2, lus: { anselme: 1 }, dits: { machinerie: 1, coeur_on: 1, coeur_off: 1 }, m: {}, nommee: 1 };
        s.runes = { v: 1, t: {}, p: { niche: 4 }, c: { niche: 1 }, e: {}, vus: {} };
        farm.s = s;
        const j2 = joues.length;
        for (const fn of HOOKS.load) { try { fn(JSON.parse(JSON.stringify(s))); } catch (er) { /* d'autres modules veulent le monde */ } }
        const S = q20.S();
        if (!S.anc) e.push('ancienne partie : pas reconnue');
        if (S.file.length) e.push('ancienne partie : ' + S.file.length + ' scène(s) en file');
        for (const k of ['q20d_hg_chateau|fin', 'q20d_hg_cles|demande', 'q20d_hg_guet|fin', 'q20d_hg_dame|fin:0', 'q20d_so_appel|fin:0', 'q20d_so_onze|fin:0', 'q20d_vg_seuil|fin:0', 'q20d_vg_coeur|fin:0', 'q20d_r15_niche|fin']) if (!S.fait[k]) e.push('ancienne partie : ' + k + ' pas aux souvenirs');
        for (const M of ['vallee', 'hautguet', 'dessous', 'vaisseau', 'galeries', 'zone']) { ici = M; tour(16); }
        if (joues.length !== j2) e.push('ancienne partie : ' + (joues.length - j2) + ' scène(s) rejouée(s) : ' + joues.slice(j2).join(', '));
      } catch (er) { e.push('EXC ' + er.stack); }
      q20.jouer = _jouer; q20.empeche = _emp; q20B.ici = _ici; ui.subtitle = _sub; farm.s = null; game.started = false;
      return JSON.stringify({ e, joues: joues.length });
    })()`));
    log(`la file : ${F.joues} scènes jouées dans l’essai (Hautguet, la cité, le Dessous, revoir, Courtes, Aucune, une ancienne partie)`);
    for (const m of F.e) ko(m);

    // ---------------------------------------------------------------- les mondes, chacun construit comme en jeu
    const rapport = (titre, L) => {
      const R = L.r;
      log(`${titre} : ${R.n} scènes construites (${R.plans} plans : ${R.toit} dans une salle close, ${R.sous} sous terre ; moments ${Object.entries(R.mondes).map(([k, n]) => k + ' ' + n).join(', ') || 'aucun'}) en ${(R.t / 1000).toFixed(1)} s (la plus lente ${R.tmax} ms : ${R.lent}) ; durées ${R.n ? R.durees[0].toFixed(1) + '–' + R.durees[1].toFixed(1) : '-'} s, en court ${R.n ? R.courtes[0].toFixed(1) + '–' + R.courtes[1].toFixed(1) : '-'} s`);
      const vus = new Set();
      for (const m of L.e) { const k = m.replace(/\(\d+(\.\d+)? h[^)]*\)/, ''); if (vus.has(k)) continue; vus.add(k); ko(`${titre} : ${m}`); }
    };
    for (const graine of graines) {
      const w = await vallee(J, graine);
      J.ctx.__w = w;
      // la vallée (la pierre ronde), les Galeries ; le Dessous ; la cité
      const L = JSON.parse(J.avec({ ids, V: VARIANTES }, `(() => {
        const w = __w;
        __q20Dbanc(${graine}, w);
        const rnd0 = Math.random; Math.random = mulberry32(${graine} ^ 0x2054);
        const ver0 = w.curVer;
        try {
          const a = __q20Dscenes(w, __v.ids, ['vallee', 'galeries'], __v.V);
          w.curVer |= VER_SOUS;
          try { soutTerres.construire(); } catch (er) { a.e.push('le Dessous : ' + er.message); }
          __q20Djoindre(a, __q20Dscenes(w, __v.ids, ['dessous'], __v.V));
          w.curVer = ver0;
          try { vgCite.maisons = []; vgCite.machines = {}; vgCite.choses = {}; vgCite.batir(); vgCite.peupler(); mondes.cur = 'vaisseau'; __q20Djoindre(a, __q20Dscenes(w, __v.ids, ['vaisseau'], __v.V)); }
          catch (er) { a.e.push('la cité : ' + er.message); }
          return JSON.stringify(a);
        } finally { Math.random = rnd0; w.curVer = ver0; mondes.cur = null; farm.s = null; }
      })()`));
      rapport(`vallée ${graine}`, L);
      if (!avecZone) continue;
      // la Zone : Hautguet et les Tertres
      J.ev(`__q20Dbanc(${graine}, __w);`);
      const Z = await J.ev('zoneGen.generer(zone.graine(), () => {})');
      J.ctx.__Z = Z;
      const LZ = JSON.parse(J.avec({ ids, V: VARIANTES }, `(() => {
        const Z = __Z;
        const rnd0 = Math.random; Math.random = mulberry32(${graine} ^ 0x2055);
        try {
          zone.Z = Z; game.world = Z;
          const V = chateauV4.Z;
          if (V) game.player.pos = [V.cx, V.y0, V.cz];
          return JSON.stringify(__q20Dscenes(Z, __v.ids, ['hautguet', 'zone'], __v.V));
        } finally { Math.random = rnd0; zone.Z = null; game.world = __w; farm.s = null; }
      })()`));
      rapport(`Zone ${graine}`, LZ);
    }
    return { echecs };
  },
};
