// ============================================================================
//  CLINS D'ŒIL (agent E16, seizième vague) — 3. LES CHOSES POSÉES
//  Des choses à trouver, posées au chargement de la partie (tirées de la graine :
//  les mêmes à chaque fois, nulle part sur w.objects ni w.props ; les
//  interactions s'ajoutent au bout de w.inter, comme les pages de l'homme long) :
//   tuyau0/1  — deux tuyaux verts : l'un près de la ferme, l'autre au hameau
//               abandonné ; on descend dans l'un, on sort de l'autre (Super Mario Bros.)
//   epee      — une épée plantée dans un rocher, dans une clairière ; elle ne
//               vient qu'à qui est en pleine santé (The Legend of Zelda)
//   feu       — un cercle de pierres, des cendres, une épée tordue plantée au
//               milieu ; on l'allume, on s'y repose (Dark Souls)
//   craie0..2 — des mots tracés à la craie, qui luisent un peu (Dark Souls, Elden Ring)
//   gateau    — des mots griffés dans la roche des Galeries (Portal)
//   cube      — une caisse au cœur peint, dans les Galeries (Portal)
//   cerises   — des cerises, au fond du labyrinthe (Pac-Man)
//   levier    — un pied-de-biche rouge, près de la mine (Half-Life)
//   machine   — une machine à écrire, devant la bibliothèque : elle enregistre
//               la partie (Resident Evil)
//   bouteille — une lettre dans une bouteille, au bord du lac (Silent Hill 2)
//   fraise    — une fraise qui a des ailes, au plus haut du col (Celeste)
//   crane     — un crâne qui plaisante, au cimetière (Undertale)
//   etoile    — une petite étoile qui remplit de détermination, à la source (Undertale)
//   guimauve  — une guimauve au bout d'un bâton, près d'un feu de campement (Outer Wilds)
//   livre     — un livre ouvert sur l'îlot ; l'image bouge (Myst)
//  w.e16 = { lieux: { k: { x, y, z, r, … } } } ; farm.s.e16.fait : ce qu'on a pris.
//  API : e16Lieux (placer(w, graine) — pur ; installer() ; dessiner…)
// ============================================================================
const e16Lieux = {
  graine: 0x45313631,
  // ------------------------------------------------------------- un coin au sec, libre (pas d'arbre, pas de mur)
  libre(w, x, z, r) {
    if (typeof pointFree === 'function' && !pointFree(w, x, z, r)) return false;
    let ok = true;
    w.query(x, z, r + 2, (o) => { if (!ok || o.gone) return; const T = OBJ_TYPES[o.t]; const rr = T ? objRadius(T, o) : 0; if (rr && Math.hypot(o.x - x, o.z - z) < rr + r) ok = false; }, null);
    return ok;
  },
  coin(w, rnd, cx, cz, r0, r1, o) {
    o = o || {};
    const WL = w.waterLevel;
    for (let i = 0; i < (o.essais || 400); i++) {
      const a = rnd() * TAU, d = r0 + Math.sqrt(rnd()) * (r1 - r0), x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
      if (!w.inside(x, z, 30)) continue;
      const h = w.heightAt(x, z);
      if (h < WL + (o.eau !== undefined ? o.eau : 0.5)) continue;
      if (o.haut !== undefined && h > WL + o.haut) continue;
      if (w.normalAt(x, z)[1] < (o.pente || 0.86)) continue;
      if (!this.libre(w, x, z, o.libre || 1)) continue;
      if (o.test && !o.test(x, z, h)) continue;
      return { x: +x.toFixed(2), y: +h.toFixed(3), z: +z.toFixed(2), r: +(rnd() * TAU).toFixed(3) };
    }
    return null;
  },
  // ------------------------------------------------------------- les cases du labyrinthe des Galeries
  cases(w, rnd, n) {
    const M = w.maze;
    if (!M || !M.open) return [];
    const { x0, z0, G, R, open, y } = M, ok = (i, j) => i >= 0 && j >= 0 && i < G && j < G && open[j * G + i] === 1;
    const E = M.exit ? (Array.isArray(M.exit) ? { x: M.exit[0], z: M.exit[2] !== undefined ? M.exit[2] : M.exit[1] } : M.exit) : { x: x0 + 1.5 * R, z: z0 + 7.5 * R };
    const L = [];
    for (let j = 1; j < G - 1; j++) for (let i = 1; i < G - 1; i++) {
      if (!ok(i, j)) continue;
      const x = x0 + (i + 0.5) * R, z = z0 + (j + 0.5) * R;
      if (Math.hypot(x - E.x, z - E.z) < 25) continue;
      // un mur d'un côté (pour les griffures), ouvert de l'autre
      const murs = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([a, b]) => !ok(i + a, j + b));
      if (murs.length < 1 || murs.length > 2) continue;
      L.push({ x, z, y, mur: murs[0] });
    }
    for (let k = L.length - 1; k > 0; k--) { const q = (rnd() * (k + 1)) | 0; [L[k], L[q]] = [L[q], L[k]]; }
    const out = [];
    for (const c of L) { if (out.some((q) => Math.hypot(q.x - c.x, q.z - c.z) < 12)) continue; out.push(c); if (out.length >= n) break; }
    return out;
  },

  // ------------------------------------------------------------- la pose (pure : ne touche à rien du monde)
  placer(w, seed) {
    if (!w || !w.lm || !w.heightAt) return {};
    const rnd = mulberry32(((seed | 0) ^ this.graine) >>> 0), L = {}, lm = w.lm;
    const F = lm.ferme || { x: w.size / 2, z: w.size / 2 };
    const pres = (k, r0, r1, o, repli) => { const A = lm[k] || (repli && lm[repli]); return A ? this.coin(w, rnd, A.x, A.z, r0, r1, o) : null; };
    L.tuyau0 = pres('ferme', 70, 170, { libre: 1.4 });
    L.tuyau1 = pres('hameau_abandonne', 30, 70, { libre: 1.4 }, 'ruines');
    // l'épée : une clairière de la forêt (pas d'arbre à 3,5 m, mais des arbres autour)
    L.epee = this.coin(w, rnd, F.x, F.z, 250, 900, { libre: 3.5, essais: 3000, test: (x, z) => {
      const m = typeof milieuAt === 'function' ? milieuAt(w, x, z) : 'foret';
      if (m !== 'foret' && m !== 'bouleaux') return false;
      let n = 0; w.query(x, z, 12, (o) => { const T = OBJ_TYPES[o.t]; if (T && T.cat === 'Arbres' && !o.gone) n++; }, null);
      return n >= 5;
    } }) || pres('foret', 20, 110, { libre: 2.5 });
    L.feu = pres('ruines', 18, 40, { libre: 1.6 }, 'tour');
    L.craie0 = pres('cascade', 6, 20, { libre: 0.6 });
    L.craie1 = lm.lac_noir ? this.coin(w, rnd, lm.lac_noir.x, lm.lac_noir.z, lm.lac_noir.r * 0.8, lm.lac_noir.r * 1.4, { libre: 0.6 }) : null;
    L.craie2 = pres('col', 5, 40, { libre: 0.6 }, 'refuge');
    const C = this.cases(w, rnd, 3);
    if (C[0]) L.gateau = Object.assign({ r: 0 }, C[0]);
    if (C[1]) L.cube = Object.assign({ r: +(rnd() * TAU).toFixed(3) }, C[1]);
    if (C[2]) L.cerises = Object.assign({ r: 0 }, C[2]);
    L.levier = pres('mine', 26, 42, { libre: 0.8 });
    L.machine = pres('bibliotheque', 20, 32, { libre: 1.0 });
    // la bouteille : sur la grève du lac
    if (lm.lac) L.bouteille = this.coin(w, rnd, lm.lac.x, lm.lac.z, lm.lac.r * 0.7, lm.lac.r * 1.5, { eau: 0.1, haut: 1.2, pente: 0.8, libre: 0.5, essais: 1500 });
    // la fraise : le plus haut d'une centaine de coins autour du col
    {
      const A = lm.col || lm.refuge;
      let best = null;
      if (A) for (let i = 0; i < 80; i++) { const P = this.coin(w, rnd, A.x, A.z, 0, 180, { libre: 0.6, pente: 0.82, essais: 8 }); if (P && (!best || P.y > best.y)) best = P; }
      L.fraise = best;
    }
    L.crane = pres('cimetiere', 3, 13, { libre: 0.4 });
    L.etoile = pres('source', 5, 14, { libre: 0.6 });
    // la guimauve : au bord d'un feu de campement
    for (let k = 0; k < 5 && !L.guimauve; k++) {
      const A = lm['campement' + k];
      if (!A) continue;
      const q = w.props.find((p) => p && p.id === 'feu_camp' && Math.hypot(p.x - A.x, p.z - A.z) < 15);
      if (!q) continue;
      for (let i = 0; i < 12 && !L.guimauve; i++) {
        const a = i / 12 * TAU, x = q.x + Math.cos(a) * 1.25, z = q.z + Math.sin(a) * 1.25;
        if (w.heightAt(x, z) > w.waterLevel + 0.3) L.guimauve = { x: +x.toFixed(2), y: +w.heightAt(x, z).toFixed(3), z: +z.toFixed(2), r: +Math.atan2(q.x - x, q.z - z).toFixed(3), feu: [q.x, q.z] };
      }
    }
    L.livre = pres('ilot', 0, 6, { eau: 0.2, libre: 0.5, pente: 0.75 }) || pres('phare', 6, 18, { libre: 0.8 });
    for (const k in L) if (!L[k]) delete L[k];
    return L;
  },

  noms: {
    tuyau0: 'Un tuyau vert', tuyau1: 'Un tuyau vert', epee: 'Une épée dans la pierre', feu: 'Un feu de camp', craie0: 'Des mots à la craie', craie1: 'Des mots à la craie', craie2: 'Des mots à la craie',
    gateau: 'Des griffures', cube: 'Une caisse au cœur peint', cerises: 'Des cerises', levier: 'Un pied-de-biche', machine: 'Une machine à écrire', bouteille: 'Une bouteille',
    fraise: 'Une fraise', crane: 'Un crâne', etoile: 'Une petite lueur', guimauve: 'Une guimauve', livre: 'Un livre ouvert',
  },
  // ------------------------------------------------------------- au chargement : les interactions
  installer() {
    const w = farm.w;
    if (!w || !w.inter || !farm.s) return;
    for (let i = w.inter.length - 1; i >= 0; i--) if (/^e16_/.test(w.inter[i].kind)) w.inter.splice(i, 1);
    if (!w.e16) w.e16 = { lieux: this.placer(w, farm.s.seed) };
    const L = w.e16.lieux;
    for (const k in L) {
      const P = L[k], kind = 'e16_' + k.replace(/\d+$/, '');
      w.inter.push({ kind, id: 'e16_' + k, x: P.x, y: P.y + 0.6, z: P.z, name: this.noms[k] || '…', data: { k } });
    }
  },
  S() { return e16.S(); },
  pris(k) { return !!this.S().fait[k]; },
  ou(k) { const w = farm.w; return w && w.e16 ? w.e16.lieux[k] : null; },
  // aller ailleurs (un fondu ; on arrive debout, à côté)
  aller(x, z, cap) {
    const w = farm.w, p = game.player;
    let X = x, Z = z;
    for (let i = 0; i < 16; i++) { const a = (cap || 0) + i * TAU / 16, xx = x + Math.sin(a) * 1.7, zz = z + Math.cos(a) * 1.7; if (w.heightAt(xx, zz) > w.waterLevel + 0.3 && (typeof pointFree !== 'function' || pointFree(w, xx, zz, 0.4))) { X = xx; Z = zz; break; } }
    return ui.fade(true, '', 350).then(() => {
      p.pos = [X, w.groundAt ? w.groundAt(X, Z, w.heightAt(X, Z) + 1, 0.6) + 0.05 : w.heightAt(X, Z) + 0.05, Z]; p.vel = [0, 0, 0];
      p.yaw = Math.atan2(x - X, z - Z);
      try { if (game.renderer && game.renderer.uploadCover) game.renderer.uploadCover(X, Z); } catch (e) { /* rien */ }
      return ui.fade(false, '', 500);
    });
  },

  // ------------------------------------------------------------- ce qu'on en fait (touche E)
  utiliser(it) {
    const k = it.data.k, S = this.S(), s = farm.s, p = game.player, P = this.ou(k) || it, j = s.day;
    const son = (n, kk) => { try { sound.e16 && sound.e16(n, [P.x, P.y + 0.6, P.z], kk); } catch (e) { /* rien */ } };
    switch (it.kind) {
      case 'e16_tuyau': {
        const B = this.ou(k === 'tuyau0' ? 'tuyau1' : 'tuyau0');
        if (!B) return;
        son('tuyau');
        S.fait.tuyau = S.fait.tuyau || j;
        return this.aller(B.x, B.z, B.r);
      }
      case 'e16_epee': {
        if (S.fait.epee) return;
        if (p.hp >= 99.5) {
          S.fait.epee = j; farm.give('e16_epee', 1);
          try { play.flyer('e16_epee', [P.x, P.y + 1, P.z], 1); } catch (e) { /* rien */ }
          son('fanfare');
          puffAt(P.x, P.y + 0.8, P.z, [200, 200, 230], 14, 1.6, false);
        } else { sound.impact && sound.impact('hard'); if (typeof penser !== 'undefined') penser.pas('e16_epee', 40, '(Elle ne bouge pas. Pas dans cet état.)', 3); }
        return;
      }
      case 'e16_feu': {
        if (!S.feu) { S.feu = j; son('feu'); ui.fadeMsg('FEU RAVIVÉ', 1.4); return; }
        if (S.repos === j) { if (typeof penser !== 'undefined') penser.pas('e16_feu', 30, '(Le feu ne vous donnera rien de plus aujourd’hui.)', 3); return; }
        S.repos = j;
        son('feu', 0.6);
        ui.fadeMsg('', 1.2).then(() => { p.hp = Math.min(100, p.hp + e16Regl.feuSoin); });
        return;
      }
      case 'e16_craie': {
        const i = +k.slice(5) || 0, T = e16Textes.craie[i] || e16Textes.craie[0];
        ui.subtitle('', '« ' + T + ' »', 3.5);
        if (!S.fait['craie' + i]) { S.fait['craie' + i] = j; if (typeof penser !== 'undefined') penser.une('e16_craie', '(Dessous, sept petits traits : quelqu’un a trouvé ça juste.)', 3.5); }
        return;
      }
      case 'e16_gateau': { const T = e16Textes.gateau; ui.read(T[0], T[1]); return; }
      case 'e16_cube': {
        if (S.fait.cube) return;
        S.fait.cube = j; farm.give('e16_caisse_coeur', 1);
        try { play.flyer('e16_caisse_coeur', [P.x, P.y + 0.5, P.z], 1); } catch (e) { /* rien */ }
        sound.pop && sound.pop();
        return;
      }
      case 'e16_cerises': {
        if (S.fait.cerises) return;
        S.fait.cerises = j; farm.give('cerise', e16Regl.cerises);
        try { play.flyer('cerise', [P.x, P.y + 0.5, P.z], e16Regl.cerises); } catch (e) { /* rien */ }
        son('waka');
        return;
      }
      case 'e16_levier': {
        if (S.fait.levier) return;
        S.fait.levier = j; farm.give('e16_pied_de_biche', 1);
        try { play.flyer('e16_pied_de_biche', [P.x, P.y + 0.5, P.z], 1); } catch (e) { /* rien */ }
        sound.equip && sound.equip();
        return;
      }
      case 'e16_machine': {
        son('frappe');
        S.fait.machine = S.fait.machine || j;
        setTimeout(() => { try { farm.save(); } catch (e) { console.error(e); } }, 1500);
        return;
      }
      case 'e16_bouteille': { const T = e16Textes.lettre; S.fait.lettre = S.fait.lettre || j; ui.read(T[0], T[1], T[2]); return; }
      case 'e16_fraise': {
        if (S.fait.fraise) return;
        S.fait.fraise = j; farm.give('fraise_bois', e16Regl.fraises);
        try { play.flyer('fraise_bois', [P.x, P.y + 1, P.z], e16Regl.fraises); } catch (e) { /* rien */ }
        son('fraise');
        return;
      }
      case 'e16_crane': {
        const D = ['(Un crâne posé sur une pierre. On jurerait qu’il vous dit : « Je ferais bien un effort, mais je n’ai plus de tripes pour ça. »)', '(Le crâne sourit. Il n’a pas tellement le choix.)', '(« Toc toc. » Vous n’avez pas frappé. Vous en êtes presque sûr.)'];
        const n = S.crane = (S.crane || 0) + 1;
        ui.subtitle('', D[(n - 1) % D.length], 4);
        return;
      }
      case 'e16_etoile': {
        son('etoile');
        if (S.etoile === j) return;
        S.etoile = j; p.hp = Math.min(100, p.hp + e16Regl.etoileSoin);
        ui.subtitle('', '(La petite lueur, dans tout ce silence. Elle vous remplit de détermination.)', 4);
        return;
      }
      case 'e16_guimauve': {
        if (S.guimauve === j) return;
        S.guimauve = j; p.food = Math.min(100, p.food + e16Regl.guimauve);
        sound.eat && sound.eat();
        ui.subtitle('', '(Dorée à point. Très loin, quelque part, une étoile s’éteint.)', 4);
        setTimeout(() => son('harmonica', 0.7), 1200);
        return;
      }
      case 'e16_livre': {
        const A = farm.w.lm.phare;
        son('livre');
        S.fait.livre = S.fait.livre || j;
        if (!A) return;
        return this.aller(A.x + 8, A.z + 8, 0);
      }
    }
  },
  visible(it) {
    const k = it.data.k;
    if (k === 'epee' || k === 'cube' || k === 'cerises' || k === 'levier' || k === 'fraise') return !this.pris(k);
    return true;
  },

  // ------------------------------------------------------------- le dessin
  dessiner(buf, cam, t) {
    const w = farm.w;
    if (!w || !w.e16 || game.world !== w || (typeof zone !== 'undefined' && zone.dedans)) return;
    const L = w.e16.lieux, S = this.S(), nuit = game.sky ? game.sky.night || 0 : 0;
    PE.buf = buf; PE.fl = 0;
    for (const k in L) {
      const P = L[k];
      if (Math.abs(P.x - cam[0]) > 70 || Math.abs(P.z - cam[2]) > 70 || Math.abs(P.y - cam[1]) > 40) continue;
      const f = this.modeles[k.replace(/\d+$/, '')];
      if (f) { try { f.call(this, P, t, S, nuit, k); } catch (e) { console.error('e16 lieu', k, e); } }
      PE.fl = 0;
    }
  },
  modeles: {
    tuyau(P) {
      const v = [0.16, 0.62, 0.2], c = [0.22, 0.72, 0.26];
      PE.frame(P.x, P.y - 0.2, P.z, P.r, 1);
      PE.bx(0, 0, 0, 0.95, 1.05, 0.95, v, TL.plain, 0); PE.bx(0, 0, 0, 0.95, 1.05, 0.95, v, TL.plain, Math.PI / 4);
      PE.bx(0, 1.05, 0, 1.25, 0.35, 1.25, c, TL.plain, 0); PE.bx(0, 1.05, 0, 1.25, 0.35, 1.25, c, TL.plain, Math.PI / 4);
      PE.bx(0, 1.38, 0, 0.92, 0.03, 0.92, [0.02, 0.04, 0.02], TL.plain, Math.PI / 8);
      PE.bx(0.3, 0.2, 0.45, 0.12, 0.8, 0.05, [0.45, 0.9, 0.45], TL.plain, 0);
    },
    epee(P, t, S) {
      PE.frame(P.x, P.y - 0.1, P.z, P.r, 1);
      PE.bx(0, 0, 0, 1.4, 0.75, 1.1, [0.62, 0.6, 0.56], TL.stone, 0); PE.bx(0.1, 0, 0.05, 1.1, 0.95, 0.9, [0.58, 0.57, 0.54], TL.stone, 0.6);
      if (S.fait.epee) return;
      PE.box(0, 1.35, 0, 0.07, 0.95, 0.02, [0.78, 0.8, 0.85], TL.iron, 0, 0, 0);
      PE.box(0, 1.84, 0, 0.36, 0.06, 0.08, [0.25, 0.35, 0.8], TL.metal, 0, 0, 0);
      PE.box(0, 1.97, 0, 0.05, 0.22, 0.05, [0.3, 0.25, 0.6], TL.leather, 0, 0, 0);
      PE.box(0, 2.1, 0, 0.08, 0.06, 0.08, [0.85, 0.75, 0.3], TL.gold, 0, 0, 0);
    },
    feu(P, t, S) {
      PE.frame(P.x, P.y, P.z, P.r, 1);
      for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; PE.bx(Math.cos(a) * 0.62, 0, Math.sin(a) * 0.62, 0.24, 0.16, 0.22, [0.5, 0.48, 0.45], TL.stone, a); }
      PE.bx(0, 0, 0, 0.8, 0.08, 0.8, [0.25, 0.24, 0.24], TL.coal, 0.3);
      PE.box(0, 0.6, 0, 0.06, 1.0, 0.025, [0.4, 0.38, 0.36], TL.iron, 0.2, 0.1, 0.08);
      PE.box(0, 1.08, 0, 0.26, 0.05, 0.06, [0.3, 0.28, 0.26], TL.iron, 0.2, 0, 0);
      for (let i = 0; i < 4; i++) PE.box(Math.cos(i * 1.6) * 0.18, 0.1, Math.sin(i * 1.6) * 0.18, 0.5, 0.06, 0.06, [0.15, 0.13, 0.12], TL.bark, i * 0.8, 0, 0.2);
      if (!S.feu) return;
      const f = 1 + Math.sin(t * 11) * 0.12;
      PE.fl = FX_EMIT;
      PE.bx(0, 0.06, 0, 0.42, 0.55 * f, 0.42, [1.3, 0.75, 0.25], TL.flame, t * 2);
      PE.bx(0, 0.06, 0, 0.24, 0.85 * f, 0.24, [1.4, 1.05, 0.45], TL.flame, 0.7 - t);
      PE.bx(0.1, 0.06, -0.05, 0.16, 0.4 * f, 0.16, [1.5, 0.6, 0.2], TL.ember, t * 3);
      PE.fl = 0;
    },
    craie(P, t, S, nuit) {
      PE.frame(P.x, P.y + 0.02, P.z, P.r, 1);
      PE.fl = nuit > 0.3 ? FX_EMIT : 0;
      const c = nuit > 0.3 ? [1.2, 0.7, 0.3] : [0.95, 0.92, 0.85];
      for (let i = 0; i < 6; i++) PE.box(-0.4 + i * 0.16, 0, Math.sin(i * 2.3) * 0.08, 0.12, 0.012, 0.03, c, TL.plain, 0.4 + Math.sin(i * 3.1) * 0.5, 0, 0);
      PE.box(0, 0, -0.22, 0.9, 0.012, 0.025, c, TL.plain, 0, 0, 0);
      PE.fl = 0;
    },
    gateau(P) {
      const [a, b] = P.mur, M = farm.w.maze, d = M.R / 2 - 0.02;
      PE.frame(P.x + a * d, P.y, P.z + b * d, Math.atan2(-a, -b), 1);
      for (let i = 0; i < 6; i++) PE.box(-0.05 + Math.sin(i * 1.7) * 0.05, 1.7 - i * 0.18, 0.01, 0.95 - (i > 3 ? 0.3 : 0), 0.035, 0.01, [0.86, 0.82, 0.74], TL.plain, 0, 0, Math.sin(i * 2.1) * 0.05);
    },
    cube(P, t, S) {
      if (S.fait.cube) return;
      PE.frame(P.x, P.y, P.z, P.r, 1);
      PE.bx(0, 0, 0, 0.55, 0.55, 0.55, [0.74, 0.72, 0.7], TL.plain, 0);
      for (const [x, z, r] of [[0, 0.28, 0], [0, -0.28, Math.PI], [0.28, 0, Math.PI / 2], [-0.28, 0, -Math.PI / 2]]) {
        PE.box(x * 1.0, 0.3, z * 1.0, 0.1, 0.1, 0.012, [0.95, 0.45, 0.65], TL.plain, r, 0, Math.PI / 4);
        PE.box(x * 1.0 + (r === 0 || r === Math.PI ? 0.045 : 0), 0.33, z * 1.0 + (r === 0 || r === Math.PI ? 0 : 0.045), 0.07, 0.07, 0.012, [0.95, 0.45, 0.65], TL.plain, r, 0, 0);
      }
    },
    cerises(P, t, S) {
      if (S.fait.cerises) return;
      PE.frame(P.x, P.y, P.z, t * 0.6, 1);
      PE.fl = FX_EMIT;
      PE.box(-0.08, 0.1, 0, 0.13, 0.13, 0.13, [1.2, 0.1, 0.1], TL.plain, 0, 0, 0);
      PE.box(0.09, 0.08, 0.02, 0.13, 0.13, 0.13, [1.2, 0.1, 0.1], TL.plain, 0, 0, 0);
      PE.fl = 0;
      PE.box(-0.03, 0.26, 0, 0.02, 0.22, 0.02, [0.5, 0.35, 0.15], TL.plain, 0, 0, -0.4);
      PE.box(0.06, 0.25, 0.01, 0.02, 0.22, 0.02, [0.5, 0.35, 0.15], TL.plain, 0, 0, 0.4);
    },
    levier(P, t, S) {
      PE.frame(P.x, P.y, P.z, P.r, 1);
      PE.bx(0, 0, 0, 0.6, 0.5, 0.6, [0.6, 0.45, 0.28], TL.wood, 0);
      if (S.fait.levier) return;
      PE.box(0.38, 0.35, 0.05, 0.04, 0.75, 0.04, [0.7, 0.12, 0.08], TL.metal, 0, 0, -0.35);
      PE.box(0.52, 0.72, 0.05, 0.04, 0.12, 0.04, [0.7, 0.12, 0.08], TL.metal, 0, 0, 0.9);
    },
    machine(P) {
      PE.frame(P.x, P.y, P.z, P.r, 1);
      PE.bx(0, 0.72, 0, 0.9, 0.06, 0.6, [0.6, 0.45, 0.3], TL.wood, 0);
      for (const [x, z] of [[-0.4, -0.25], [0.4, -0.25], [-0.4, 0.25], [0.4, 0.25]]) PE.bx(x, 0, z, 0.05, 0.72, 0.05, [0.4, 0.3, 0.2], TL.darkwood, 0);
      PE.bx(0, 0.78, 0, 0.42, 0.14, 0.32, [0.1, 0.1, 0.11], TL.metal, 0);
      PE.box(0, 0.9, 0.09, 0.4, 0.04, 0.1, [0.85, 0.82, 0.75], TL.plain, 0, -0.5, 0);
      PE.box(0, 0.98, -0.1, 0.46, 0.06, 0.06, [0.12, 0.12, 0.13], TL.metal, 0, 0, 0);
      PE.box(0, 1.08, -0.1, 0.3, 0.22, 0.01, [0.95, 0.94, 0.9], TL.paper, 0, -0.2, 0);
    },
    bouteille(P) {
      PE.frame(P.x, P.y + 0.06, P.z, P.r, 1);
      PE.box(0, 0, 0, 0.1, 0.1, 0.28, [0.35, 0.55, 0.4], TL.glass, 0, 0, 0);
      PE.box(0, 0, 0.18, 0.05, 0.05, 0.1, [0.35, 0.55, 0.4], TL.glass, 0, 0, 0);
      PE.box(0, 0, 0.24, 0.04, 0.04, 0.03, [0.5, 0.35, 0.2], TL.wood, 0, 0, 0);
      PE.box(0, 0, -0.02, 0.05, 0.05, 0.2, [0.9, 0.86, 0.75], TL.paper, 0, 0, 0);
    },
    fraise(P, t, S) {
      if (S.fait.fraise) return;
      PE.frame(P.x, P.y + 0.7 + Math.sin(t * 2) * 0.12, P.z, t * 0.8, 1);
      PE.fl = FX_EMIT;
      PE.box(0, 0, 0, 0.2, 0.22, 0.2, [1.1, 0.12, 0.15], TL.plain, 0, 0, 0);
      PE.box(0, -0.1, 0, 0.12, 0.08, 0.12, [1.1, 0.12, 0.15], TL.plain, Math.PI / 4, 0, 0);
      PE.fl = 0;
      PE.box(0, 0.13, 0, 0.16, 0.04, 0.16, [0.25, 0.65, 0.2], TL.leaves, Math.PI / 4, 0, 0);
      const b = Math.sin(t * 18) * 0.6;
      for (const s of [-1, 1]) PE.box(s * 0.2, 0.04, 0, 0.22, 0.015, 0.1, [1, 1, 1], TL.plain, 0, 0, s * b);
    },
    crane(P) {
      PE.frame(P.x, P.y, P.z, P.r, 1);
      PE.bx(0, 0, 0, 0.5, 0.3, 0.4, [0.55, 0.53, 0.5], TL.stone, 0);
      PE.bx(0, 0.3, 0, 0.2, 0.2, 0.22, [0.92, 0.9, 0.82], TL.bone, 0);
      PE.bx(0, 0.25, 0.04, 0.14, 0.06, 0.16, [0.88, 0.86, 0.78], TL.bone, 0);
      for (const sx of [-0.05, 0.05]) PE.box(sx, 0.42, 0.111, 0.05, 0.05, 0.01, [0.05, 0.05, 0.05], TL.plain, 0, 0, 0);
      PE.box(0, 0.32, 0.111, 0.11, 0.015, 0.01, [0.05, 0.05, 0.05], TL.plain, 0, 0, 0);
    },
    etoile(P, t) {
      PE.frame(P.x, P.y + 0.6 + Math.sin(t * 1.7) * 0.05, P.z, t * 1.2, 1);
      PE.fl = FX_EMIT;
      PE.box(0, 0, 0, 0.16, 0.16, 0.04, [1.5, 1.35, 0.3], TL.plain, 0, 0, 0);
      PE.box(0, 0, 0, 0.16, 0.16, 0.04, [1.5, 1.35, 0.3], TL.plain, 0, 0, Math.PI / 4);
      PE.fl = 0;
    },
    guimauve(P, t) {
      PE.frame(P.x, P.y, P.z, P.r, 1);
      PE.box(0, 0.35, 0.35, 0.03, 0.03, 1.0, [0.45, 0.32, 0.18], TL.wood, 0, -0.45, 0);
      PE.box(0, 0.58, 0.82, 0.1, 0.1, 0.12, [0.98, 0.95, 0.88], TL.plain, 0, -0.45, 0);
    },
    livre(P, t, S, nuit) {
      PE.frame(P.x, P.y, P.z, P.r, 1);
      PE.bx(0, 0, 0, 0.3, 0.9, 0.3, [0.45, 0.32, 0.2], TL.darkwood, 0);
      PE.box(0, 0.98, 0, 0.5, 0.04, 0.36, [0.3, 0.2, 0.12], TL.leather, 0, -0.35, 0);
      PE.box(-0.12, 1.0, 0, 0.22, 0.02, 0.32, [0.92, 0.88, 0.78], TL.paper, 0, -0.35, 0);
      PE.fl = FX_EMIT;
      PE.box(0.12, 1.01, 0, 0.18, 0.02, 0.14, [0.35 + Math.sin(t) * 0.1, 0.55, 0.9 + Math.sin(t * 1.3) * 0.15], TL.plain, 0, -0.35, 0);
      PE.fl = 0;
    },
  },
};

// ---------------------------------------------------------------- branchements
for (const k of ['tuyau', 'epee', 'feu', 'craie', 'gateau', 'cube', 'cerises', 'levier', 'machine', 'bouteille', 'fraise', 'crane', 'etoile', 'guimauve', 'livre']) {
  HOOKS.inter['e16_' + k] = (it) => { try { return e16Lieux.utiliser(it); } catch (e) { console.error('e16', e); } };
  HOOKS.interVis['e16_' + k] = (it) => !(typeof zone !== 'undefined' && zone.dedans) && e16Lieux.visible(it);
}
HOOKS.load.push(() => { try { e16Lieux.installer(); } catch (e) { console.error('e16 lieux', e); } });
HOOKS.draw.push((buf, sbuf, cam, t) => { try { e16Lieux.dessiner(buf, cam, t); } catch (e) { console.error('e16 lieux', e); } });
HOOKS.lights.push((eye) => {
  const w = farm.w, L = [];
  if (!w || !w.e16 || game.world !== w || !farm.s) return L;
  const P = w.e16.lieux, S = e16.S();
  const add = (Q, r, c, dy) => { if (!Q) return; const d = Math.hypot(Q.x - eye[0], Q.y - eye[1], Q.z - eye[2]); if (d < 40) L.push({ x: Q.x, y: Q.y + (dy || 0.6), z: Q.z, r, c, d }); };
  if (S.feu) add(P.feu, 7, [1, 0.6, 0.25], 0.6);
  add(P.etoile, 2.5, [0.9, 0.8, 0.3], 0.6);
  if (!S.fait.fraise) add(P.fraise, 1.6, [0.9, 0.3, 0.3], 0.7);
  return L;
});
