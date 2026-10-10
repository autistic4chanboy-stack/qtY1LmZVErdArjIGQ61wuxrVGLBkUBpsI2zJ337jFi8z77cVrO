// ============================================================================
//  CLINS D'ŒIL (agent E16, seizième vague) — 2. LES RENCONTRES
//  Des rencontres rares, jamais annoncées : toutes les 12 s on tente sa chance
//  (une rencontre à la fois, deux au plus), chacune a ses heures, ses lieux, et
//  ne revient pas avant quelques jours. Rien n'est dit, ou presque.
//   sonic    — un hérisson bleu, dans les prés, le jour : il se roule en boule,
//              file comme le vent et sème des anneaux d'or (Sonic the Hedgehog)
//   luigi    — un grand homme timide, en vert, moustache, un soufflet dans le
//              dos, la nuit au hameau abandonné (Luigi's Mansion)
//   boo      — un petit fantôme blanc qui se cache le visage quand on le regarde
//              (Super Mario : Boo), la nuit, cimetière, hameau abandonné, chapelle
//   pacman   — quatre feux follets de couleur dans le labyrinthe des Galeries
//   creeper  — une chose verte et carrée qui siffle derrière vous, la nuit,
//              près de la ferme, et crève en fumée, sans mal (Minecraft)
//   mouton   — un mouton parfaitement cubique (Minecraft)
//   fee      — une petite lueur bleue : « Hé ! Écoute ! » (The Legend of Zelda)
//   chocobo  — un grand oiseau jaune qui court, à l'estive (Final Fantasy)
//   rayman   — un bonhomme sans bras ni jambes, mains et pieds qui flottent
//   esprits  — de petits esprits ronds, au crépuscule (Stardew Valley : Junimos)
//   gman     — un homme en costume, une mallette, à l'aube sur un pont (Half-Life)
//   sorcier  — un homme aux cheveux blancs, deux épées dans le dos, la nuit
//              devant l'auberge : « Le vent hurle. » (The Witcher)
//   soleil   — un chevalier, bras levés vers le soleil, près des ruines (Dark Souls)
//   ombre    — un enfant noir aux yeux blancs, dans la brume du matin (Limbo)
//   voyageur — une silhouette en robe rouge, longue écharpe, en montagne (Journey)
//   masque   — un tout petit être au masque blanc à cornes, sous terre (Hollow Knight)
//   tonneau  — un tonneau qui dévale la pente vers vous (Donkey Kong)
//   caisse   — une caisse qui bouge quand on ne la regarde pas, près des gardes ;
//              « ! » (Metal Gear Solid)
//  et, hors des rencontres : le losange vert au-dessus d'un habitant (Les Sims).
//  État : farm.s.e16 = { v, der: { sorte: jour }, vus: { sorte: n }, dit: {}, fait: {},
//         anneaux, luigi, … } (créé au besoin : les vieilles parties se chargent).
//  API : e16 (S, liste, cond(k), forcer(k), anneaux…)
// ============================================================================
const e16 = {
  liste: [], anneaux: [], rollT: 8, plumbob: null, C: null,
  S() {
    const s = farm.s;
    if (!s) return { der: {}, vus: {}, dit: {}, fait: {}, anneaux: 0 };
    const S = s.e16 && typeof s.e16 === 'object' ? s.e16 : (s.e16 = { v: 1 });
    S.der = S.der || {}; S.vus = S.vus || {}; S.dit = S.dit || {}; S.fait = S.fait || {}; S.anneaux = S.anneaux || 0;
    return S;
  },
  // dans la vallée (pas dans les Terres d'Avant, ni dans un autre monde)
  ici() {
    try { return !!(farm.s && game.kind === 'farm' && game.world && game.world === farm.w && game.player && !(typeof zone !== 'undefined' && zone.dedans)); } catch (e) { return false; }
  },
  jour() { return (farm.s && farm.s.day) || 1; },
  lm(k) { const w = farm.w; return w && w.lm ? w.lm[k] : null; },
  loinDe(k, x, z) { const L = this.lm(k); return L ? Math.hypot(L.x - x, L.z - z) : 1e9; },
  sec(w, x, z) { return w.inside ? w.inside(x, z, 20) && w.heightAt(x, z) > w.waterLevel + 0.3 : w.heightAt(x, z) > w.waterLevel + 0.3; },
  // le contexte d'une image (les conditions des rencontres)
  contexte(eye, basis, sky, milieu) {
    const w = farm.w, p = game.player, x = p.pos[0], z = p.pos[2], h = npcs.hour();
    const f = basis && basis.f ? basis.f : [-Math.sin(p.yaw || 0), 0, -Math.cos(p.yaw || 0)];
    const fl = Math.hypot(f[0], f[2]) || 1;
    const sous = !!p.underground || p.pos[1] < w.heightAt(x, z) - 3;
    const M = w.maze, dansLab = !!(sous && M && x > M.x0 && z > M.z0 && x < M.x0 + M.G * M.R && z < M.z0 + M.G * M.R && Math.abs(p.pos[1] - M.y) < 4);
    return {
      w, p, x, z, y: p.pos[1], h, f: [f[0] / fl, 0, f[2] / fl], eye: eye || p.pos, sous, dansLab,
      nuit: h >= 21 || h < 4.5, jourPlein: h >= 8 && h < 18.5,
      mi: sous ? 'souterrain' : milieu && typeof milieuAt === 'function' ? milieuAt(w, x, z) : '',
      wet: game.sky ? game.sky.wet || 0 : 0, fog: typeof weather !== 'undefined' && weather.cur ? weather.cur.fog || 0 : 0,
      alt: p.pos[1] - w.waterLevel,
    };
  },
  // un point au sec, à d mètres, à l'angle a (radians) de la direction du regard
  autour(C, d, a) {
    const ang = Math.atan2(C.f[0], C.f[2]) + a, x = C.x + Math.sin(ang) * d, z = C.z + Math.cos(ang) * d;
    if (!this.sec(C.w, x, z)) return null;
    return { x, z, y: C.w.heightAt(x, z) };
  },
  chercher(C, d0, d1, a0, a1, essais) {
    for (let i = 0; i < (essais || 12); i++) {
      const P = this.autour(C, d0 + Math.random() * (d1 - d0), a0 + Math.random() * (a1 - a0));
      if (P && (typeof pointFree !== 'function' || pointFree(C.w, P.x, P.z, 0.4))) return P;
    }
    return null;
  },
  // le labyrinthe des Galeries : une case ouverte ?
  labOuvert(w, x, z) {
    const M = w.maze;
    if (!M) return false;
    const i = Math.floor((x - M.x0) / M.R), j = Math.floor((z - M.z0) / M.R);
    return i >= 0 && j >= 0 && i < M.G && j < M.G && M.open[j * M.G + i] === 1;
  },
  // le long d'un couloir : jusqu'où c'est ouvert (en m) depuis (x, z) dans la direction (dx, dz)
  labPortee(w, x, z, dx, dz, max) { let d = 0; while (d < max && this.labOuvert(w, x + dx * (d + 0.75), z + dz * (d + 0.75))) d += 0.75; return d; },
  // regarde-t-on vers A ?
  vu(A, C, cos, R) {
    const dx = A.x - C.x, dz = A.z - C.z, d = Math.hypot(dx, dz);
    if (d > (R || 60)) return false;
    if (d < 1) return true;
    return (dx * C.f[0] + dz * C.f[2]) / d > (cos || 0.6);
  },
  dist(A, C) { return Math.hypot(A.x - C.x, A.z - C.z); },
  cap(A, x, z) { return Math.atan2(x - A.x, z - A.z); },
  dire(qui, texte, dur, voix) {
    ui.subtitle(qui || '', texte, dur || Math.min(7, 2 + texte.length * 0.045));
    if (voix && sound.mumble) sound.mumble(voix, texte.length, 0);
  },
  son(nom, A, k) { try { sound.e16 && sound.e16(nom, A ? [A.x, (A.y || 0) + 1, A.z] : null, k); } catch (e) { /* rien */ } },
  noter(k) { const S = this.S(); S.der[k] = this.jour(); S.vus[k] = (S.vus[k] || 0) + 1; },

  // ------------------------------------------------------------- les sortes (cond, p, attente en jours, poser, maj, dessin, cible)
  sortes: {},

  cond(k, C) { const D = this.sortes[k]; if (!D || !C) return false; try { return !!D.cond(C, this); } catch (e) { return false; } },
  essayer(C) {
    if (this.liste.length >= 2) return;
    if (!C.mi && typeof milieuAt === 'function') C.mi = milieuAt(C.w, C.x, C.z);
    const S = this.S(), j = this.jour();
    for (const k in this.sortes) {
      const D = this.sortes[k];
      if (this.liste.some((A) => A.k === k)) continue;
      if (S.der[k] !== undefined && j - S.der[k] < D.attente) continue;
      if (Math.random() >= D.p) continue;
      if (!this.cond(k, C)) continue;
      if (this.poser(k, C)) return;
    }
  },
  poser(k, C) {
    const D = this.sortes[k];
    let A = null;
    try { A = D.poser(C, this); } catch (e) { console.error('e16', k, e); A = null; }
    if (!A) return null;
    A.k = k; A.t = 0; A.vie = A.vie || 120;
    this.liste.push(A);
    this.noter(k);
    return A;
  },
  // pour les essais : faire venir une rencontre tout de suite (si le lieu et l'heure s'y prêtent)
  forcer(k) {
    if (!this.ici() || !this.sortes[k]) return null;
    const C = this.contexte(null, null, game.sky, true);
    this.liste = this.liste.filter((A) => A.k !== k);
    if (!this.cond(k, C)) return null;
    return this.poser(k, C);
  },
  maj(dt, eye, basis, sky, playing) {
    if (!this.ici()) { if (this.liste.length) this.liste = []; return; }
    const C = this.C = this.contexte(eye, basis, sky);
    this.majAnneaux(dt, C);
    this.majPlumbob(dt, C);
    if (!playing) return;
    for (let i = this.liste.length - 1; i >= 0; i--) {
      const A = this.liste[i];
      A.t += dt;
      let garder = A.t < A.vie;
      try { if (garder) garder = this.sortes[A.k].maj(A, dt, C, this) !== false; } catch (e) { console.error('e16', A.k, e); garder = false; }
      if (!garder || this.dist(A, C) > 160) this.liste.splice(i, 1);
    }
    this.rollT -= dt;
    if (this.rollT <= 0) { this.rollT = e16Regl.roll * (0.8 + Math.random() * 0.4); if (!game.sleeping && !ui.panel) this.essayer(C); }
  },

  // ------------------------------------------------------------- les anneaux du hérisson
  semer(x, z) {
    const w = farm.w;
    if (!this.sec(w, x, z)) return;
    this.anneaux.push({ x, z, y: w.heightAt(x, z) + 0.75, t: 0, ph: Math.random() * 6 });
  },
  majAnneaux(dt, C) {
    if (!this.anneaux.length) return;
    for (let i = this.anneaux.length - 1; i >= 0; i--) {
      const R = this.anneaux[i];
      R.t += dt;
      if (R.t > e16Regl.anneauVie) { this.anneaux.splice(i, 1); continue; }
      if (Math.hypot(R.x - C.x, R.z - C.z) < 1.15 && Math.abs(R.y - 0.75 - C.y) < 2) {
        this.anneaux.splice(i, 1);
        this.son('anneau', R);
        farm.earn(e16Regl.anneauSous);
        const S = this.S();
        S.anneaux++;
        if (S.anneaux >= 100 && typeof penser !== 'undefined') penser.une('e16_cent', '(Cent anneaux. Quelque part, quelqu’un vient de gagner une vie.)', 4);
        try { particles.spawn(R.x, R.y, R.z, 0, 1.5, 0, [1, 0.85, 0.3, 1], 0.06, 0.4, 12, true); } catch (e) { /* rien */ }
      }
    }
  },
  // ------------------------------------------------------------- le losange vert (Les Sims)
  majPlumbob(dt, C) {
    const P = this.plumbob;
    if (P) { P.t += dt; if (P.t > 9 || !P.n || P.n.removed || (P.n.st && !P.n.st.alive)) this.plumbob = null; return; }
    this._pbT = (this._pbT || 30) - dt;
    if (this._pbT > 0) return;
    this._pbT = 30;
    const S = this.S(), j = this.jour();
    if (S.der.plumbob !== undefined && j - S.der.plumbob < 6) return;
    if (C.sous || Math.random() > 0.04 || typeof npcs === 'undefined') return;
    const n = npcs.list.find((m) => m.st && m.st.alive && !m.vanished && m.state !== 'sleep' && Math.hypot(m.x - C.x, m.z - C.z) < 22 && this.vu(m, C, 0.7, 22));
    if (!n) return;
    this.plumbob = { n, t: 0 };
    S.der.plumbob = j;
  },

  // ------------------------------------------------------------- le dessin
  dessiner(buf, cam, t) {
    if (!this.ici()) return;
    PE.buf = buf; PE.fl = 0;
    for (const A of this.liste) {
      if (Math.hypot(A.x - cam[0], A.z - cam[2]) > 140) continue;
      try { this.sortes[A.k].dessin(A, t, buf, this); } catch (e) { console.error('e16 dessin', A.k, e); }
      PE.fl = 0;
    }
    for (const R of this.anneaux) {
      if (Math.hypot(R.x - cam[0], R.z - cam[2]) > 70) continue;
      PE.frame(R.x, R.y + Math.sin(t * 2 + R.ph) * 0.04, R.z, t * 2.6 + R.ph, 1);
      PE.fl = FX_EMIT;
      for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; PE.box(Math.cos(a) * 0.2, Math.sin(a) * 0.2, 0, 0.08, 0.08, 0.05, [1.15, 0.85, 0.2], TL.gold, 0, 0, a); }
      PE.fl = 0;
    }
    const P = this.plumbob;
    if (P && P.n) {
      const n = P.n, b = Math.sin(t * 2) * 0.05, y = (n.y || 0) + 2.25 + b;
      PE.frame(n.x, y, n.z, t * 1.6, 1);
      PE.fl = FX_EMIT;
      PE.box(0, 0.09, 0, 0.13, 0.13, 0.13, [0.35, 1.2, 0.35], TL.glass, Math.PI / 4, Math.PI / 4, 0);
      PE.box(0, -0.07, 0, 0.1, 0.18, 0.1, [0.3, 1.1, 0.3], TL.glass, Math.PI / 4, 0, 0);
      PE.fl = 0;
    }
  },
  lumieres(eye) {
    const L = [];
    if (!this.ici()) return L;
    for (const A of this.liste) {
      const D = this.sortes[A.k];
      if (!D.lum) continue;
      const l = D.lum(A);
      if (l) { l.d = Math.hypot(l.x - eye[0], l.y - eye[1], l.z - eye[2]); if (l.d < 40) L.push(l); }
    }
    return L;
  },
  cibles(eye, f, cand) {
    if (!this.ici()) return;
    for (const A of this.liste) {
      const D = this.sortes[A.k];
      if (!D.parler) continue;
      const dx = A.x - eye[0], dy = (A.y || 0) + 1.2 - eye[1], dz = A.z - eye[2], d = Math.hypot(dx, dy, dz);
      if (d > 2.8 || (dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1) < 0.6) continue;
      cand({ kind: 'hook', f2lab: D.nom || '…', use: () => { try { D.parler(A, this); } catch (e) { console.error('e16', e); } } }, d);
    }
  },
};

// ---------------------------------------------------------------- les figures (boîtes)
const e16Fig = {
  rig: {},
  // un humain du jeu, gardé une fois fait
  humain(k, look) { return this.rig[k] || (this.rig[k] = humanRig(look)); },
  // le hérisson bleu (debout, ou roulé en boule)
  herisson(A, t) {
    const bleu = [0.12, 0.28, 0.85], peau = [0.95, 0.78, 0.58], rouge = [0.85, 0.1, 0.1], blanc = [0.95, 0.95, 0.95];
    PE.frame(A.x, A.y, A.z, A.cap, 1);
    if (A.boule) {
      const r = t * 30;
      PE.box(0, 0.3, 0, 0.5, 0.5, 0.5, bleu, TL.plain, 0, r, 0);
      PE.box(0, 0.3, 0, 0.46, 0.46, 0.46, [0.15, 0.32, 0.9], TL.plain, Math.PI / 4, r, Math.PI / 4);
      return;
    }
    const ph = A.t * 40, s = Math.sin(ph) * 0.9;
    for (const [sx, k] of [[-0.1, 1], [0.1, -1]]) {
      PE.box(sx, 0.2, 0, 0.07, 0.22, 0.07, bleu, TL.plain, 0, s * k, 0);
      PE.box(sx, 0.06, 0.04 + Math.sin(ph) * 0.12 * k, 0.12, 0.1, 0.24, rouge, TL.leather, 0, 0, 0);
    }
    PE.box(0, 0.48, 0, 0.36, 0.34, 0.3, bleu, TL.plain, 0, 0.35, 0);
    PE.box(0, 0.47, 0.13, 0.22, 0.24, 0.04, peau, TL.skin, 0, 0.35, 0);
    PE.box(0, 0.82, 0.06, 0.42, 0.4, 0.38, bleu, TL.plain, 0, 0.2, 0);
    PE.box(0, 0.75, 0.26, 0.24, 0.13, 0.1, peau, TL.skin, 0, 0.2, 0);
    PE.box(0, 0.88, 0.25, 0.22, 0.12, 0.02, blanc, TL.plain, 0, 0.2, 0);
    PE.box(-0.05, 0.88, 0.265, 0.04, 0.07, 0.01, [0.1, 0.5, 0.15], TL.plain, 0, 0.2, 0);
    PE.box(0.05, 0.88, 0.265, 0.04, 0.07, 0.01, [0.1, 0.5, 0.15], TL.plain, 0, 0.2, 0);
    PE.box(0, 0.79, 0.33, 0.06, 0.05, 0.05, [0.05, 0.05, 0.05], TL.plain, 0, 0, 0);
    for (const [x, y, a] of [[0, 0.95, -0.9], [-0.13, 0.82, -1.1], [0.13, 0.82, -1.1], [0, 0.7, -1.3]]) PE.box(x, y, -0.25, 0.12, 0.12, 0.36, bleu, TL.plain, 0, a + 1.2, 0);
    for (const sx of [-0.23, 0.23]) { PE.box(sx, 0.48, -0.05, 0.06, 0.24, 0.06, peau, TL.skin, 0, -s * 0.8, 0); PE.box(sx, 0.36, -0.05 - s * 0.08, 0.1, 0.1, 0.1, blanc, TL.cloth, 0, 0, 0); }
  },
  // un fantôme timide : il se cache le visage quand on le regarde
  boo(A, t) {
    const bl = [1.05, 1.05, 1.1], y = A.y + Math.sin(t * 2.3) * 0.08;
    PE.frame(A.x, y, A.z, A.cap, 1);
    PE.fl = FX_EMIT * 0;
    PE.box(0, 0, 0, 0.62, 0.6, 0.62, bl, TL.plain, 0, 0, 0);
    PE.box(0, 0, 0, 0.58, 0.56, 0.58, bl, TL.plain, Math.PI / 4, 0, 0);
    PE.box(0, 0.25, 0, 0.44, 0.12, 0.44, bl, TL.plain, Math.PI / 4, 0, 0);
    PE.box(0.12, -0.3, -0.2, 0.18, 0.12, 0.16, bl, TL.plain, 0, 0.4, 0);
    if (A.cache) {
      for (const sx of [-0.12, 0.12]) PE.box(sx, 0.08, 0.33, 0.16, 0.14, 0.06, bl, TL.plain, 0, 0, 0);
      for (const sx of [-0.2, 0.2]) PE.box(sx, -0.08, 0.31, 0.1, 0.05, 0.02, [1, 0.55, 0.6], TL.plain, 0, 0, 0);
    } else {
      for (const sx of [-0.1, 0.1]) PE.box(sx, 0.07, 0.31, 0.06, 0.14, 0.02, [0.05, 0.05, 0.05], TL.plain, 0, 0, 0);
      PE.box(0, -0.1, 0.31, 0.26, 0.12, 0.02, [0.7, 0.08, 0.1], TL.plain, 0, 0, 0);
      PE.box(0, -0.13, 0.32, 0.08, 0.05, 0.02, [1, 0.5, 0.6], TL.plain, 0, 0, 0);
      for (const sx of [-0.34, 0.34]) PE.box(sx, -0.05, 0.08, 0.1, 0.14, 0.12, bl, TL.plain, 0, 0, 0);
    }
  },
  // un feu follet de couleur (le labyrinthe)
  follet(x, y, z, cap, col, dir, t, i) {
    PE.frame(x, y + Math.sin(t * 5 + i) * 0.04, z, cap, 1);
    PE.fl = FX_EMIT;
    PE.box(0, 0.42, 0, 0.56, 0.42, 0.56, col, TL.plain, 0, 0, 0);
    PE.box(0, 0.7, 0, 0.42, 0.16, 0.42, col, TL.plain, 0, 0, 0);
    for (let k = 0; k < 3; k++) PE.box(-0.19 + k * 0.19, 0.15 + Math.sin(t * 12 + k * 2) * 0.03, 0, 0.17, 0.14, 0.56, col, TL.plain, 0, 0, 0);
    for (const sx of [-0.12, 0.12]) {
      PE.box(sx, 0.55, 0.285, 0.15, 0.17, 0.02, [1.3, 1.3, 1.3], TL.plain, 0, 0, 0);
      PE.box(sx + dir * 0.03, 0.53, 0.3, 0.07, 0.08, 0.02, [0.1, 0.2, 1.1], TL.plain, 0, 0, 0);
    }
    PE.fl = 0;
  },
  creeper(A, t) {
    const k = A.enfle || 0, g = (c) => (A.blanc ? [0.9, 0.95, 0.9] : c), s = 1 + k * 0.12;
    PE.frame(A.x, A.y, A.z, A.cap, s);
    const V = [[0.32, 0.62, 0.28], [0.26, 0.55, 0.22], [0.36, 0.68, 0.3], [0.28, 0.5, 0.25]];
    for (let i = 0; i < 4; i++) PE.box(i % 2 ? 0.11 : -0.11, 0.13, i < 2 ? 0.12 : -0.12, 0.2, 0.26, 0.2, g(V[i]), TL.plain, 0, 0, 0);
    PE.box(0, 0.64, 0, 0.36, 0.76, 0.22, g(V[0]), TL.leaves, 0, 0, 0);
    PE.box(0, 1.24, 0, 0.44, 0.44, 0.44, g(V[2]), TL.leaves, 0, 0, 0);
    const n = [0.03, 0.04, 0.03];
    for (const sx of [-0.1, 0.1]) PE.box(sx, 1.3, 0.222, 0.1, 0.1, 0.01, n, TL.plain, 0, 0, 0);
    PE.box(0, 1.19, 0.222, 0.08, 0.12, 0.01, n, TL.plain, 0, 0, 0);
    for (const sx of [-0.06, 0.06]) PE.box(sx, 1.12, 0.222, 0.05, 0.1, 0.01, n, TL.plain, 0, 0, 0);
  },
  mouton(A, t) {
    PE.frame(A.x, A.y, A.z, A.cap, 1);
    const ph = A.marche ? Math.sin(A.t * 6) * 0.4 : 0, gris = [0.55, 0.5, 0.46];
    for (const [x, z, k] of [[-0.28, 0.42, 1], [0.28, 0.42, -1], [-0.28, -0.42, -1], [0.28, -0.42, 1]]) PE.box(x, 0.2, z, 0.2, 0.4, 0.2, gris, TL.plain, 0, ph * k, 0);
    PE.box(0, 0.74, 0, 0.9, 0.7, 1.2, [0.95, 0.95, 0.93], TL.wool, 0, 0, 0);
    PE.box(0, 0.95, 0.78, 0.5, 0.5, 0.42, [0.86, 0.76, 0.7], TL.plain, 0, (A.broute ? 0.5 : 0), 0);
    for (const sx of [-0.14, 0.14]) PE.box(sx, 1.02, 0.995, 0.09, 0.07, 0.01, [0.05, 0.05, 0.05], TL.plain, 0, (A.broute ? 0.5 : 0), 0);
  },
  fee(A, t) {
    PE.frame(A.x, A.y, A.z, A.cap, 1);
    PE.fl = FX_EMIT;
    PE.box(0, 0, 0, 0.13, 0.13, 0.13, [0.7, 0.95, 1.6], TL.plain, t * 3, t * 2, 0);
    const b = Math.sin(t * 40) * 0.6;
    for (const sx of [-1, 1]) { PE.box(sx * 0.1, 0.05, -0.02, 0.16, 0.01, 0.08, [0.85, 0.95, 1.2], TL.glass, 0, 0, sx * b); PE.box(sx * 0.08, -0.04, -0.02, 0.11, 0.01, 0.06, [0.85, 0.95, 1.2], TL.glass, 0, 0, -sx * b); }
    PE.fl = 0;
  },
  oiseau(A, t) {
    const j = [0.98, 0.82, 0.2], o = [0.95, 0.5, 0.12], ph = A.t * 12, s = Math.sin(ph) * 0.7;
    PE.frame(A.x, A.y, A.z, A.cap, 1);
    for (const [sx, k] of [[-0.15, 1], [0.15, -1]]) { PE.box(sx, 0.4, 0, 0.07, 0.75, 0.07, o, TL.plain, 0, s * k, 0); PE.box(sx, 0.03, 0.08 + Math.sin(ph) * 0.15 * k, 0.12, 0.05, 0.22, o, TL.plain, 0, 0, 0); }
    PE.box(0, 1.0, 0, 0.62, 0.6, 0.9, j, TL.wool, 0, 0, 0);
    PE.box(0, 1.45, 0.38, 0.24, 0.65, 0.24, j, TL.wool, 0, -0.25, 0);
    PE.box(0, 1.82, 0.48, 0.3, 0.3, 0.38, j, TL.wool, 0, 0, 0);
    PE.box(0, 1.79, 0.73, 0.12, 0.1, 0.2, o, TL.plain, 0, 0.15, 0);
    for (const sx of [-0.15, 0.15]) PE.box(sx, 1.88, 0.58, 0.02, 0.07, 0.07, [0.05, 0.05, 0.05], TL.plain, 0, 0, 0);
    PE.box(0, 1.98, 0.42, 0.06, 0.18, 0.2, j, TL.wool, 0, -0.6, 0);
    for (let k = 0; k < 3; k++) PE.box(-0.12 + k * 0.12, 1.15, -0.55, 0.1, 0.1, 0.35, j, TL.wool, 0, -0.5 - k * 0.1, 0);
    for (const sx of [-0.34, 0.34]) PE.box(sx, 1.05, -0.05, 0.06, 0.35, 0.55, j, TL.wool, 0, 0, sx * Math.sin(ph * 0.5) * 0.4);
  },
  sansBras(A, t) {
    const y = A.y + Math.abs(Math.sin(t * 4)) * 0.25 * (A.vol ? 0 : 1);
    PE.frame(A.x, y, A.z, A.cap, 1);
    const g = Math.sin(t * 3) * 0.06;
    PE.box(0, 0.85, 0, 0.36, 0.42, 0.28, [0.5, 0.14, 0.58], TL.cloth, 0, 0, 0);
    PE.box(0, 1.1, 0, 0.4, 0.08, 0.32, [0.85, 0.12, 0.1], TL.cloth, 0, 0, 0);
    PE.box(0, 1.32, 0, 0.32, 0.32, 0.3, [0.98, 0.82, 0.66], TL.skin, 0, 0, 0);
    PE.box(0, 1.3, 0.2, 0.14, 0.12, 0.14, [1, 0.78, 0.66], TL.skin, 0, 0, 0);
    for (const sx of [-0.07, 0.07]) PE.box(sx, 1.4, 0.155, 0.07, 0.1, 0.01, [1, 1, 1], TL.plain, 0, 0, 0);
    const hr = A.vol ? t * 25 : t * 2;
    for (let k = 0; k < 3; k++) PE.box(Math.sin(hr + k * 2.1) * 0.1, 1.55, Math.cos(hr + k * 2.1) * 0.1, 0.1, 0.18, 0.28, [1, 0.85, 0.2], TL.hair, hr + k * 2.1, 0.3, 0);
    for (const sx of [-1, 1]) {
      PE.box(sx * 0.38, 0.88 + Math.sin(t * 5 + sx) * 0.06 + g, 0.12, 0.15, 0.15, 0.15, [1, 1, 1], TL.cloth, 0, 0, 0);
      PE.box(sx * 0.14, 0.18 + Math.sin(t * 5 + sx * 2) * 0.04, 0.03, 0.17, 0.13, 0.28, [1, 0.85, 0.15], TL.leather, 0, 0, 0);
    }
  },
  esprit(x, y, z, cap, col, t, i) {
    const b = Math.abs(Math.sin(t * 6 + i * 1.7)) * 0.28;
    PE.frame(x, y + b, z, cap, 1);
    PE.box(0, 0.16, 0, 0.3, 0.28, 0.3, col, TL.plain, 0, 0, 0);
    PE.box(0, 0.16, 0, 0.27, 0.25, 0.27, col, TL.plain, Math.PI / 4, 0, 0);
    for (const sx of [-0.06, 0.06]) PE.box(sx, 0.2, 0.152, 0.04, 0.06, 0.01, [0.05, 0.05, 0.05], TL.plain, 0, 0, 0);
    PE.box(0, 0.36, 0, 0.03, 0.1, 0.03, [0.3, 0.6, 0.2], TL.plain, 0, 0, 0);
    PE.box(0.05, 0.42, 0, 0.12, 0.02, 0.07, [0.4, 0.75, 0.25], TL.leaves, 0, 0, 0.4);
  },
  voyageur(A, t) {
    const r = [0.62, 0.1, 0.08], y = A.y + 0.25 + Math.sin(t * 1.5) * 0.08;
    PE.frame(A.x, y, A.z, A.cap, 1);
    PE.box(0, 0.42, 0, 0.56, 0.84, 0.5, r, TL.cloth, 0, 0, 0);
    PE.box(0, 1.05, 0, 0.36, 0.5, 0.3, r, TL.cloth, 0, 0, 0);
    PE.box(0, 1.45, 0, 0.3, 0.32, 0.3, [0.5, 0.08, 0.06], TL.cloth, 0, 0, 0);
    PE.box(0, 1.43, 0.13, 0.2, 0.2, 0.06, [0.03, 0.02, 0.02], TL.plain, 0, 0, 0);
    PE.fl = FX_EMIT;
    for (const sx of [-0.05, 0.05]) PE.box(sx, 1.46, 0.165, 0.035, 0.035, 0.01, [1.4, 1.3, 1.1], TL.plain, 0, 0, 0);
    PE.fl = 0;
    for (let k = 0; k < 7; k++) PE.box(Math.sin(t * 2.2 + k * 0.7) * 0.08 * k, 1.25 + Math.sin(t * 3 + k) * 0.06, -0.2 - k * 0.24, 0.12, 0.03, 0.26, [0.95, 0.75, 0.25], TL.cloth, 0, 0, 0);
  },
  masque(A, t) {
    PE.frame(A.x, A.y, A.z, A.cap, 1);
    const pas = A.part ? Math.sin(A.t * 10) * 0.03 : 0;
    PE.box(0, 0.24 + pas, 0, 0.3, 0.36, 0.26, [0.1, 0.11, 0.16], TL.cloth, 0, 0, 0);
    PE.box(0, 0.58 + pas, 0, 0.26, 0.26, 0.24, [0.94, 0.94, 0.92], TL.plain, 0, 0, 0);
    for (const sx of [-1, 1]) PE.box(sx * 0.09, 0.78 + pas, 0, 0.05, 0.2, 0.05, [0.94, 0.94, 0.92], TL.plain, 0, 0, -sx * 0.3);
    for (const sx of [-0.055, 0.055]) PE.box(sx, 0.56 + pas, 0.121, 0.06, 0.09, 0.01, [0.02, 0.02, 0.03], TL.plain, 0, 0, 0);
    PE.box(0.2, 0.25, 0.02, 0.03, 0.34, 0.03, [0.7, 0.72, 0.75], TL.iron, 0, 0, -0.2);
  },
  tonneau(A, t) {
    PE.frame(A.x, A.y + 0.32, A.z, A.cap, 1);
    PE.box(0, 0, 0, 0.88, 0.6, 0.6, [0.62, 0.42, 0.24], TL.darkwood, 0, A.roule, 0);
    for (const sx of [-0.32, 0, 0.32]) PE.box(sx, 0, 0, 0.05, 0.64, 0.64, [0.3, 0.3, 0.33], TL.iron, 0, A.roule, 0);
  },
  caisse(A, t) {
    const up = A.leve || 0;
    PE.frame(A.x, A.y, A.z, A.cap, 1);
    PE.box(0, 0.4 + up * 0.45, 0, 0.95, 0.78, 0.72, [0.72, 0.58, 0.4], TL.plain, 0, 0, 0);
    PE.box(0, 0.79 + up * 0.45, 0, 0.12, 0.012, 0.73, [0.86, 0.78, 0.6], TL.paper, 0, 0, 0);
    PE.box(0, 0.5 + up * 0.45, 0.362, 0.4, 0.12, 0.005, [0.35, 0.3, 0.22], TL.plain, 0, 0, 0);
    if (up > 0.2) for (const sx of [-0.15, 0.15]) PE.box(sx, 0.12, 0.05, 0.14, 0.24, 0.28, [0.12, 0.12, 0.1], TL.leather, 0, Math.sin(A.t * 18) * 0.4 * Math.sign(sx), 0);
    if (A.alerte > 0) {
      PE.fl = FX_EMIT;
      PE.box(0, 1.85 + up * 0.45, 0, 0.1, 0.38, 0.06, [1.4, 0.15, 0.1], TL.plain, 0, 0, 0);
      PE.box(0, 1.55 + up * 0.45, 0, 0.1, 0.1, 0.06, [1.4, 0.15, 0.1], TL.plain, 0, 0, 0);
      PE.fl = 0;
    }
  },
};

// les silhouettes humaines (looks en minuscules : hors des outils du wiki)
const e16Looks = {
  luigi: { skin: '#e8c0a0', hair: '#3a2616', hairStyle: 'court', beard: 'moustache', hat: 'casquette', hatCol: '#2f8a3a', top: '#2f8a3a', bottom: '#2a3a8a', shoe: '#4a2a1a', build: 'mince', height: 1.08 },
  gman: { skin: '#d8c0a8', hair: '#3a3026', hairStyle: 'court', top: '#2c3646', bottom: '#2a3242', shoe: '#141210', coat: true, build: 'mince', height: 1.04 },
  sorcier: { skin: '#d8c0a8', hair: '#e8e8e8', hairStyle: 'queue', top: '#24201c', bottom: '#1c1a18', shoe: '#141210', coat: true, build: 'normal', height: 1.06 },
  soleil: { skin: '#d8b090', hair: '#3a2a1c', hairStyle: 'court', beard: 'courte', hat: 'bonnet', hatCol: '#8a8a90', top: '#d8d0b4', bottom: '#5a5040', shoe: '#2a2420', build: 'normal' },
  ombre: { skin: '#060606', hair: '#060606', hairStyle: 'court', top: '#060606', bottom: '#060606', shoe: '#060606', face: TL.blankF, height: 0.7, build: 'mince' },
};

// ---------------------------------------------------------------- les sortes
Object.assign(e16.sortes, {
  // Sonic the Hedgehog
  sonic: {
    p: 0.004, attente: 1,
    cond: (C) => !C.sous && C.jourPlein && C.wet < 0.3 && (C.mi === 'pres' || C.mi === 'alpage'),
    poser(C, E) {
      const P = E.chercher(C, 18, 26, 0.8, 1.6) || E.chercher(C, 18, 26, -1.6, -0.8);
      if (!P) return null;
      // il traverse devant vous, à une dizaine de mètres
      const ang = Math.atan2(C.f[0], C.f[2]), tx = C.x + Math.sin(ang) * 10, tz = C.z + Math.cos(ang) * 10;
      const dx = tx - P.x, dz = tz - P.z, L = Math.hypot(dx, dz) || 1;
      E.son('toupie', P);
      return { x: P.x, y: P.y, z: P.z, dx: dx / L, dz: dz / L, cap: Math.atan2(dx, dz), boule: true, phase: 'boule', vie: 8, seme: 0, n: 0 };
    },
    maj(A, dt, C, E) {
      if (A.phase === 'boule') {
        if (Math.random() < dt * 8) puffAt(A.x - A.dx * 0.3, A.y + 0.1, A.z - A.dz * 0.3, [150, 130, 100], 2, 1.2, false);
        if (A.t > 1.0) { A.phase = 'course'; A.t0 = A.t; E.son('fuite', A); }
        return true;
      }
      A.boule = A.t - A.t0 < 0.35;
      const v = 30, w = C.w;
      A.x += A.dx * v * dt; A.z += A.dz * v * dt;
      if (!E.sec(w, A.x, A.z)) return false;
      A.y = w.heightAt(A.x, A.z);
      A.seme += v * dt;
      if (A.seme > 3.5 && A.n < e16Regl.anneaux) { A.seme = 0; A.n++; E.semer(A.x, A.z); }
      return A.t - A.t0 < 2.4;
    },
    dessin(A, t) { e16Fig.herisson(A, t); },
  },
  // Luigi's Mansion
  luigi: {
    p: 0.3, attente: 2, nom: 'L’homme en vert',
    cond: (C, E) => !C.sous && C.nuit && E.loinDe('hameau_abandonne', C.x, C.z) < 80,
    poser(C, E) {
      const L = E.lm('hameau_abandonne');
      for (let i = 0; i < 30; i++) {
        const a = Math.random() * TAU, d = 8 + Math.random() * 14, x = L.x + Math.cos(a) * d, z = L.z + Math.sin(a) * d;
        if (!E.sec(C.w, x, z) || !pointFree(C.w, x, z, 0.5) || Math.hypot(x - C.x, z - C.z) < 10) continue;
        return { x, z, y: C.w.heightAt(x, z), cap: E.cap({ x, z }, C.x, C.z), vie: 600, dit: false };
      }
      return null;
    },
    maj(A, dt, C, E) {
      const d = E.dist(A, C);
      if (d < 14) A.cap = turnToward(A.cap, E.cap(A, C.x, C.z), dt * 2);
      if (!A.dit && d < 9) { A.dit = true; E.dire('???', 'Mamma mia…', 2.5, 1.25); }
      if (A.part) { A.x += Math.sin(A.cap) * dt * 1.6; A.z += Math.cos(A.cap) * dt * 1.6; A.y = C.w.heightAt(A.x, A.z); if (!E.vu(A, C, 0.5, 70) || A.t - A.part > 12) return false; }
      return !(C.h >= 4.5 && C.h < 20);
    },
    parler(A, E) {
      const S = E.S(), n = S.luigi || 0;
      const L = [
        'Oh ! Vous m’avez fait peur. Vous n’auriez pas vu mon frère ? Un plombier. Moustache, casquette rouge. Il est parti pour un autre château.',
        'Ça ? C’est un soufflet qui marche à l’envers. Il aspire. Les fantômes, la poussière, les rideaux… Surtout les rideaux.',
        'Tenez. Un champignon vert. Mon frère dit que ça donne une vie de plus. Moi, je n’ose pas en manger.',
      ];
      const D = ['Si vous voyez une petite boule blanche qui se cache le visage, ne la regardez pas trop. Ou alors, regardez-la tout le temps.', 'Moi aussi, j’aurais voulu sauver une princesse, un jour. Mais il y a toujours quelqu’un pour le faire avant moi.', 'Mamma mia…'];
      const t = n < L.length ? L[n] : pick(D);
      E.dire('???', t, 0, 1.25);
      if (n === 2 && !S.fait.champi) { S.fait.champi = E.jour(); farm.give('e16_champi_vert', 1); try { play.flyer('e16_champi_vert', [A.x, A.y + 1, A.z], 1); } catch (e) { /* rien */ } }
      S.luigi = n + 1;
      if (n >= 3 && !A.part) A.part = A.t;
    },
    dessin(A, t, buf) {
      const R = e16Fig.humain('luigi', e16Looks.luigi), tr = Math.sin(t * 31) * 0.012;
      poseHuman(R, { move: A.part ? 1 : 0, phase: A.t * 7, t, cower: !A.part && !A.dit, lookP: 0.1 });
      drawRig(buf, R, A.x + tr, A.y, A.z, A.cap, 1);
      PE.frame(A.x + tr, A.y, A.z, A.cap, 1);
      PE.box(0, 1.25, -0.24, 0.34, 0.42, 0.18, [0.55, 0.52, 0.48], TL.metal, 0, 0, 0);
      PE.box(0, 1.5, -0.24, 0.18, 0.1, 0.12, [0.4, 0.38, 0.36], TL.iron, 0, 0, 0);
      PE.box(0.2, 1.0, -0.05, 0.06, 0.06, 0.55, [0.25, 0.25, 0.25], TL.leather, 0, 0.7, 0);
      PE.fl = FX_EMIT; PE.box(0.3, 0.72, 0.18, 0.1, 0.16, 0.1, [1.5, 1.2, 0.6], TL.glass, 0, 0, 0); PE.fl = 0;
    },
    lum: (A) => ({ x: A.x, y: A.y + 0.8, z: A.z, r: 5, c: [0.9, 0.7, 0.4] }),
  },
  // Super Mario (Boo)
  boo: {
    p: 0.02, attente: 2,
    cond: (C, E) => !C.sous && C.nuit && (E.loinDe('cimetiere', C.x, C.z) < 60 || E.loinDe('hameau_abandonne', C.x, C.z) < 80 || E.loinDe('chapelle', C.x, C.z) < 60),
    poser(C, E) {
      const P = E.chercher(C, 12, 18, Math.PI * 0.8, Math.PI * 1.2);
      if (!P) return null;
      return { x: P.x, z: P.z, y: P.y + 1.5, cap: E.cap(P, C.x, C.z), vie: 75 };
    },
    maj(A, dt, C, E) {
      A.cap = E.cap(A, C.x, C.z);
      A.cache = E.vu(A, C, 0.75, 40);
      const d = E.dist(A, C);
      if (!A.cache) { const v = 1.7 * dt; A.x += Math.sin(A.cap) * v; A.z += Math.cos(A.cap) * v; A.y += ((C.y + 1.4) - A.y) * Math.min(1, dt); }
      if (d < 1.1) { E.son('froid', A); E.son('rire', A, 0.6); return false; }
      return true;
    },
    dessin(A, t) { e16Fig.boo(A, t); },
    lum: (A) => ({ x: A.x, y: A.y, z: A.z, r: 3, c: [0.5, 0.5, 0.6] }),
  },
  // Pac-Man
  pacman: {
    p: 0.04, attente: 1,
    cond: (C) => C.dansLab,
    poser(C, E) {
      const w = C.w, dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]].sort(() => Math.random() - 0.5);
      for (const [dx, dz] of dirs) {
        const d = E.labPortee(w, C.x, C.z, dx, dz, 14);
        if (d < 8) continue;
        const x = C.x + dx * d, z = C.z + dz * d;
        E.son('fantomes', { x, y: C.y, z });
        return { x, z, y: C.y, dx: -dx, dz: -dz, cap: Math.atan2(-dx, -dz), vie: 14, sonT: 0.8, fin: d + 12 };
      }
      return null;
    },
    maj(A, dt, C, E) {
      A.x += A.dx * 3.6 * dt; A.z += A.dz * 3.6 * dt;
      A.sonT -= dt;
      if (A.sonT <= 0) { A.sonT = 0.8; E.son('fantomes', A, 0.8); }
      if (!A.froid && E.dist(A, C) < 0.8) { A.froid = true; E.son('froid', A, 0.6); }
      return A.t * 3.6 < A.fin + 4;
    },
    dessin(A, t) {
      const COL = [[1.3, 0.12, 0.1], [1.3, 0.6, 0.8], [0.2, 1.1, 1.3], [1.3, 0.65, 0.15]];
      for (let i = 0; i < 4; i++) e16Fig.follet(A.x - A.dx * i * 1.3, A.y, A.z - A.dz * i * 1.3, A.cap, COL[i], 0, t, i);
    },
    lum: (A) => ({ x: A.x, y: A.y + 0.6, z: A.z, r: 4, c: [0.6, 0.4, 0.6] }),
  },
  // Minecraft (le Creeper)
  creeper: {
    p: 0.012, attente: 3,
    cond: (C, E) => !C.sous && C.nuit && E.loinDe('ferme', C.x, C.z) < 170 && (C.mi === 'pres' || C.mi === 'ferme'),
    poser(C, E) {
      const P = E.chercher(C, 10, 15, Math.PI * 0.75, Math.PI * 1.25);
      return P ? { x: P.x, z: P.z, y: P.y, cap: E.cap(P, C.x, C.z), vie: 90, siffle: 0 } : null;
    },
    maj(A, dt, C, E) {
      const d = E.dist(A, C);
      A.cap = E.cap(A, C.x, C.z);
      if (A.siffle > 0) {
        A.siffle += dt; A.enfle = Math.min(1, A.siffle / 1.5); A.blanc = Math.floor(A.siffle * 8) % 2 === 1;
        if (d > 5) { A.siffle = 0; A.enfle = 0; A.blanc = false; return true; }
        if (A.siffle > 1.5) {
          E.son('pouf', A);
          puffAt(A.x, A.y + 0.9, A.z, [110, 160, 100], 30, 3, false);
          game.shakeT = Math.max(game.shakeT || 0, 0.35);
          return false;
        }
        return true;
      }
      if (d < 2.6) { A.siffle = 0.001; E.son('siffle', A); return true; }
      const v = 1.8 * dt;
      A.x += Math.sin(A.cap) * v; A.z += Math.cos(A.cap) * v;
      if (!E.sec(C.w, A.x, A.z)) return false;
      A.y = C.w.heightAt(A.x, A.z);
      return true;
    },
    dessin(A, t) { e16Fig.creeper(A, t); },
  },
  // Minecraft (le mouton)
  mouton: {
    p: 0.004, attente: 2,
    cond: (C) => !C.sous && C.jourPlein && (C.mi === 'pres' || C.mi === 'alpage'),
    poser(C, E) {
      const P = E.chercher(C, 22, 32, -0.6, 0.6);
      return P ? { x: P.x, z: P.z, y: P.y, cap: Math.random() * TAU, vie: 150, beT: 2 } : null;
    },
    maj(A, dt, C, E) {
      A.beT -= dt;
      if (A.beT <= 0) { A.beT = 5 + Math.random() * 8; A.marche = Math.random() < 0.5; A.broute = !A.marche; if (A.marche) A.cap += (Math.random() - 0.5) * 2; if (E.dist(A, C) < 30 && sound.animal) sound.ici([A.x, A.y + 1, A.z], () => sound.animal('sheep', 0, 0.7)); }
      if (A.marche) { const x = A.x + Math.sin(A.cap) * 0.6 * dt, z = A.z + Math.cos(A.cap) * 0.6 * dt; if (E.sec(C.w, x, z)) { A.x = x; A.z = z; A.y = C.w.heightAt(x, z); } else A.marche = false; }
      return E.dist(A, C) < 90;
    },
    dessin(A, t) { e16Fig.mouton(A, t); },
  },
  // The Legend of Zelda (la fée)
  fee: {
    p: 0.012, attente: 2,
    cond: (C) => !C.sous && C.nuit && (C.mi === 'foret' || C.mi === 'bouleaux' || C.mi === 'sapiniere'),
    poser(C, E) {
      const P = E.chercher(C, 10, 14, -0.5, 0.5);
      return P ? { x: P.x, z: P.z, y: P.y + 1.4, cap: 0, vie: 30, etat: 'vient' } : null;
    },
    maj(A, dt, C, E) {
      const tx = C.x + C.f[2] * 0.6, tz = C.z - C.f[0] * 0.6, ty = C.y + 1.75;
      if (A.etat === 'vient') {
        const dx = tx - A.x, dz = tz - A.z, d = Math.hypot(dx, dz);
        const v = Math.min(d, 5 * dt);
        A.x += dx / (d || 1) * v; A.z += dz / (d || 1) * v; A.y += (ty - A.y) * Math.min(1, dt * 2);
        if (d < 0.5) { A.etat = 'dit'; A.t1 = A.t; E.son('fee', A); E.dire('???', 'Hé ! Écoute !', 2.4); }
      } else if (A.etat === 'dit') {
        A.x = tx + Math.sin(A.t * 3) * 0.15; A.z = tz; A.y = ty + Math.sin(A.t * 5) * 0.1;
        if (A.t - A.t1 > 2.6) { A.etat = 'part'; E.son('fee', A, 0.5); }
      } else { A.y += dt * 4; A.x += dt * 3; if (A.t - A.t1 > 7) return false; }
      return true;
    },
    dessin(A, t) { e16Fig.fee(A, t); },
    lum: (A) => ({ x: A.x, y: A.y, z: A.z, r: 3.2, c: [0.4, 0.6, 1] }),
  },
  // Final Fantasy (le grand oiseau jaune)
  chocobo: {
    p: 0.02, attente: 2,
    cond: (C, E) => !C.sous && C.jourPlein && (C.mi === 'alpage' || E.loinDe('estive', C.x, C.z) < 220),
    poser(C, E) {
      const P = E.chercher(C, 24, 34, 0.9, 1.5) || E.chercher(C, 24, 34, -1.5, -0.9);
      if (!P) return null;
      const ang = Math.atan2(C.f[0], C.f[2]), tx = C.x + Math.sin(ang) * 12, tz = C.z + Math.cos(ang) * 12, dx = tx - P.x, dz = tz - P.z, L = Math.hypot(dx, dz) || 1;
      E.son('coin', P);
      return { x: P.x, z: P.z, y: P.y, dx: dx / L, dz: dz / L, cap: Math.atan2(dx, dz), vie: 14, cri: false };
    },
    maj(A, dt, C, E) {
      A.x += A.dx * 9 * dt; A.z += A.dz * 9 * dt;
      if (!E.sec(C.w, A.x, A.z)) return false;
      A.y = C.w.heightAt(A.x, A.z);
      if (!A.cri && E.dist(A, C) < 14) { A.cri = true; E.son('coin', A); }
      if (Math.random() < dt * 5) puffAt(A.x, A.y + 0.05, A.z, [150, 140, 110], 1, 0.8, false);
      return true;
    },
    dessin(A, t) { e16Fig.oiseau(A, t); },
  },
  // Rayman
  rayman: {
    p: 0.006, attente: 3,
    cond: (C) => !C.sous && C.jourPlein && (C.mi === 'foret' || C.mi === 'bouleaux'),
    poser(C, E) {
      const P = E.chercher(C, 16, 24, -0.7, 0.7);
      return P ? { x: P.x, z: P.z, y: P.y, cap: E.cap(P, C.x, C.z), vie: 60 } : null;
    },
    maj(A, dt, C, E) {
      if (!A.vol) { A.cap = E.cap(A, C.x, C.z); if (E.dist(A, C) < 10) { A.vol = A.t; E.son('helice', A); } return true; }
      A.y += dt * 3.2; A.x -= Math.sin(A.cap) * dt * 2; A.z -= Math.cos(A.cap) * dt * 2;
      return A.t - A.vol < 6;
    },
    dessin(A, t) { e16Fig.sansBras(A, t); },
  },
  // Stardew Valley (les Junimos)
  esprits: {
    p: 0.03, attente: 4,
    cond: (C, E) => !C.sous && C.h >= 18 && C.h < 21 && (E.loinDe('ferme', C.x, C.z) < 100 || E.loinDe('hameau_abandonne', C.x, C.z) < 80),
    poser(C, E) {
      const P = E.chercher(C, 8, 12, -0.5, 0.5);
      if (!P) return null;
      const COL = [[0.45, 0.8, 0.35], [0.4, 0.6, 0.95], [0.8, 0.45, 0.85], [0.95, 0.55, 0.3], [0.95, 0.85, 0.3], [0.9, 0.35, 0.35]];
      const L = [];
      for (let i = 0; i < 3; i++) { const x = P.x + (Math.random() - 0.5) * 2.4, z = P.z + (Math.random() - 0.5) * 2.4; if (E.sec(C.w, x, z)) L.push({ x, z, y: C.w.heightAt(x, z), col: COL[(Math.random() * COL.length) | 0], parti: false }); }
      if (!L.length) return null;
      E.son('esprits', P, 0.7);
      return { x: P.x, z: P.z, y: P.y, cap: 0, L, vie: 60, chT: 2 };
    },
    maj(A, dt, C, E) {
      A.chT -= dt;
      if (A.chT <= 0) { A.chT = 2 + Math.random() * 3; E.son('esprits', A, 0.5); }
      if (!A.fuite && E.dist(A, C) < 5) A.fuite = A.t;
      if (A.fuite) {
        const k = Math.floor((A.t - A.fuite) / 0.5);
        A.L.forEach((q, i) => { if (!q.parti && i <= k) { q.parti = true; puffAt(q.x, q.y + 0.2, q.z, [180, 230, 160], 8, 1, false); } });
        if (A.L.every((q) => q.parti)) {
          const S = E.S();
          if (!S.fait.esprits) {
            S.fait.esprits = E.jour();
            const G = ['graines_navet', 'graines_panais', 'graines_radis', 'graines_carotte'].filter((g) => ITEMS[g]);
            if (G.length) { const g = pick(G); farm.give(g, e16Regl.graines); try { play.flyer(g, [A.x, A.y + 0.5, A.z], e16Regl.graines); } catch (e) { /* rien */ } }
          }
          return false;
        }
      }
      return true;
    },
    dessin(A, t) { A.L.forEach((q, i) => { if (!q.parti) e16Fig.esprit(q.x, q.y, q.z, Math.atan2(e16.C ? e16.C.x - q.x : 0, e16.C ? e16.C.z - q.z : 1), q.col, t, i); }); },
  },
  // Half-Life (l'homme à la mallette)
  gman: {
    p: 0.06, attente: 5,
    cond: (C, E) => !C.sous && C.h >= 5 && C.h < 7.5 && ['pont_riviere', 'pont_riviere1', 'pont_nord', 'pont_sud'].some((k) => E.loinDe(k, C.x, C.z) < 90),
    poser(C, E) {
      const k = ['pont_riviere', 'pont_riviere1', 'pont_nord', 'pont_sud'].map((q) => [q, E.loinDe(q, C.x, C.z)]).sort((a, b) => a[1] - b[1])[0][0];
      const L = E.lm(k);
      if (!L || Math.hypot(L.x - C.x, L.z - C.z) < 20) return null;
      const y = C.w.groundAt ? C.w.groundAt(L.x, L.z, C.w.heightAt(L.x, L.z) + 4, 6) : C.w.heightAt(L.x, L.z);
      return { x: L.x, z: L.z, y: Math.max(y, C.w.waterLevel + 0.2), cap: E.cap(L, C.x, C.z), vie: 120, vuT: 0 };
    },
    maj(A, dt, C, E) {
      A.cap = E.cap(A, C.x, C.z);
      const d = E.dist(A, C), vu = E.vu(A, C, 0.85, 26);
      if (!A.dit) {
        A.vuT = vu ? A.vuT + dt : 0;
        if (A.vuT > 1) {
          A.dit = A.t;
          const S = E.S();
          E.dire('???', S.fait.gman ? 'Le bon homme… au mauvais endroit… peut faire toute la différence… dans le monde.' : 'Réveillez-vous, monsieur… Réveillez-vous… et sentez… la cendre.', 6, 0.85);
          S.fait.gman = S.fait.gman || E.jour();
        }
        return true;
      }
      return (A.t - A.dit < 7) && (vu || A.t - A.dit < 2) && d > 3;
    },
    dessin(A, t, buf) {
      const R = e16Fig.humain('gman', e16Looks.gman);
      poseHuman(R, { move: 0, t, talk: !!A.dit && A.t - A.dit < 5 });
      drawRig(buf, R, A.x, A.y, A.z, A.cap, 1);
      PE.frame(A.x, A.y, A.z, A.cap, 1);
      PE.box(0.33, 0.55, 0.02, 0.1, 0.3, 0.42, [0.16, 0.12, 0.1], TL.leather, 0, 0, 0);
    },
  },
  // The Witcher
  sorcier: {
    p: 0.05, attente: 4, nom: 'L’homme aux cheveux blancs',
    cond: (C, E) => !C.sous && (C.h >= 20 || C.h < 2) && E.loinDe('auberge', C.x, C.z) < 60,
    poser(C, E) {
      const L = E.lm('auberge');
      for (let i = 0; i < 30; i++) {
        const a = Math.random() * TAU, d = 6 + Math.random() * 6, x = L.x + Math.cos(a) * d, z = L.z + Math.sin(a) * d;
        if (!E.sec(C.w, x, z) || !pointFree(C.w, x, z, 0.5) || Math.hypot(x - C.x, z - C.z) < 8) continue;
        return { x, z, y: C.w.heightAt(x, z), cap: a + Math.PI, vie: 300 };
      }
      return null;
    },
    maj(A, dt, C, E) {
      const d = E.dist(A, C);
      if (d < 9) A.cap = turnToward(A.cap, E.cap(A, C.x, C.z), dt * 1.5);
      if (!A.dit && d < 7) { A.dit = true; E.dire('???', 'Le vent hurle.', 3, 0.8); }
      if (A.part) { A.x += Math.sin(A.cap) * dt * 1.4; A.z += Math.cos(A.cap) * dt * 1.4; A.y = C.w.heightAt(A.x, A.z); return A.t - A.part < 25 && (E.vu(A, C, 0.4, 60) || A.t - A.part < 4); }
      return true;
    },
    parler(A, E) {
      A.n = (A.n || 0) + 1;
      E.dire('???', A.n === 1 ? 'Hm.' : 'Une partie de cartes ? … Non. Pas ce soir.', 0, 0.8);
      if (A.n >= 2 && !A.part) { A.part = A.t; A.cap += Math.PI * 0.8; }
    },
    dessin(A, t, buf) {
      const R = e16Fig.humain('sorcier', e16Looks.sorcier);
      poseHuman(R, { move: A.part ? 1 : 0, phase: A.t * 6, t, cross: !A.part });
      drawRig(buf, R, A.x, A.y, A.z, A.cap, 1);
      PE.frame(A.x, A.y, A.z, A.cap, 1);
      for (const s of [-1, 1]) { PE.box(s * 0.05, 1.12, -0.18, 0.04, 1.05, 0.03, [0.7, 0.72, 0.76], TL.iron, 0, 0, s * 0.32); PE.box(s * 0.22, 1.62, -0.18, 0.05, 0.24, 0.05, [0.2, 0.15, 0.12], TL.leather, 0, 0, s * 0.32); }
    },
  },
  // Dark Souls (le chevalier du soleil)
  soleil: {
    p: 0.04, attente: 5, nom: 'Le chevalier',
    cond: (C, E) => !C.sous && C.h >= 10 && C.h < 16 && C.wet < 0.2 && ['ruines', 'tour', 'chapelle', 'abbaye'].some((k) => E.loinDe(k, C.x, C.z) < 70),
    poser(C, E) {
      const k = ['ruines', 'tour', 'chapelle', 'abbaye'].map((q) => [q, E.loinDe(q, C.x, C.z)]).sort((a, b) => a[1] - b[1])[0][0], L = E.lm(k);
      for (let i = 0; i < 30; i++) {
        const a = Math.random() * TAU, d = (L.r || 12) + 4 + Math.random() * 10, x = L.x + Math.cos(a) * d, z = L.z + Math.sin(a) * d;
        if (!E.sec(C.w, x, z) || !pointFree(C.w, x, z, 0.5) || Math.hypot(x - C.x, z - C.z) < 10) continue;
        return { x, z, y: C.w.heightAt(x, z), cap: Math.random() * TAU, vie: 240 };
      }
      return null;
    },
    maj(A, dt, C, E) {
      if (!A.dit && E.dist(A, C) < 10) { A.dit = true; E.dire('???', 'Louez le soleil !', 3, 1.0); }
      return E.dist(A, C) < 80;
    },
    parler(A, E) {
      A.n = (A.n || 0) + 1;
      E.dire('???', A.n === 1 ? 'Ah ! Si seulement je pouvais être aussi… incandescent !' : 'Le soleil, mon ami ! Il nous regarde tous, vous savez. Même ici.', 0, 1.0);
    },
    dessin(A, t, buf) {
      const R = e16Fig.humain('soleil', e16Looks.soleil);
      poseHuman(R, { move: 0, t });
      R.set('armL', -2.75, 0, -0.5); R.set('armR', -2.75, 0, 0.5);
      drawRig(buf, R, A.x, A.y, A.z, A.cap, 1);
      PE.frame(A.x, A.y, A.z, A.cap, 1);
      PE.fl = FX_EMIT * 0;
      PE.box(0, 1.2, 0.125, 0.2, 0.2, 0.01, [1, 0.6, 0.1], TL.plain, 0, 0, 0);
      for (let k = 0; k < 4; k++) PE.box(0, 1.2, 0.128, 0.32, 0.03, 0.01, [0.95, 0.55, 0.1], TL.plain, 0, 0, k * Math.PI / 4);
    },
  },
  // Limbo, Inside
  ombre: {
    p: 0.008, attente: 6,
    cond: (C) => !C.sous && ((C.h >= 4.5 && C.h < 7) || C.fog > 0.4) && (C.mi === 'foret' || C.mi === 'bouleaux' || C.mi === 'pres'),
    poser(C, E) {
      const P = E.chercher(C, 24, 32, 0.9, 1.3) || E.chercher(C, 24, 32, -1.3, -0.9);
      if (!P) return null;
      // il marche de gauche à droite de ce qu'on voit
      const dx = C.f[2], dz = -C.f[0];
      return { x: P.x, z: P.z, y: P.y, dx, dz, cap: Math.atan2(dx, dz), vie: 45, vuT: 0 };
    },
    maj(A, dt, C, E) {
      A.x += A.dx * 1.1 * dt; A.z += A.dz * 1.1 * dt;
      if (!E.sec(C.w, A.x, A.z)) return false;
      A.y = C.w.heightAt(A.x, A.z);
      if (E.vu(A, C, 0.8, 50)) A.vuT += dt; else if (A.vuT > 1.5) return false;
      return E.dist(A, C) > 14;
    },
    dessin(A, t, buf) {
      const R = e16Fig.humain('ombre', e16Looks.ombre);
      poseHuman(R, { move: 1, phase: A.t * 6, t });
      drawRig(buf, R, A.x, A.y, A.z, A.cap, 0.72);
      PE.frame(A.x, A.y, A.z, A.cap, 1);
      PE.fl = FX_EMIT;
      for (const sx of [-0.045, 0.045]) PE.box(sx, 1.25, 0.12, 0.035, 0.035, 0.01, [1.6, 1.6, 1.6], TL.plain, 0, 0, 0);
      PE.fl = 0;
    },
  },
  // Journey
  voyageur: {
    p: 0.015, attente: 4,
    cond: (C) => !C.sous && C.jourPlein && (C.mi === 'alpage' || C.mi === 'neiges' || C.mi === 'rochers' || C.alt > 40),
    poser(C, E) {
      const P = E.chercher(C, 22, 30, -0.8, 0.8);
      return P ? { x: P.x, z: P.z, y: P.y, cap: E.cap(P, C.x, C.z) + Math.PI, vie: 50 } : null;
    },
    maj(A, dt, C, E) {
      const d = E.dist(A, C);
      if (!A.chante && d < 18) { A.chante = A.t; E.son('chant', A); A.cap = E.cap(A, C.x, C.z) + Math.PI; }
      const v = (A.chante ? 4 : 0.6) * dt, x = A.x + Math.sin(A.cap) * v, z = A.z + Math.cos(A.cap) * v;
      if (E.sec(C.w, x, z)) { A.x = x; A.z = z; A.y += (C.w.heightAt(x, z) - A.y) * Math.min(1, dt * 3); }
      return !A.chante || A.t - A.chante < 9;
    },
    dessin(A, t) { e16Fig.voyageur(A, t); },
  },
  // Hollow Knight
  masque: {
    p: 0.03, attente: 4,
    cond: (C) => C.dansLab,
    poser(C, E) {
      const w = C.w;
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]].sort(() => Math.random() - 0.5)) {
        const d = E.labPortee(w, C.x, C.z, dx, dz, 14);
        if (d < 7) continue;
        const x = C.x + dx * d, z = C.z + dz * d;
        E.son('melancolie', { x, y: C.y, z }, 0.8);
        return { x, z, y: C.y, cap: Math.atan2(-dx, -dz), dx, dz, vie: 90 };
      }
      return null;
    },
    maj(A, dt, C, E) {
      if (!A.part && E.dist(A, C) < 6) { A.part = A.t; A.cap = Math.atan2(A.dx, A.dz); }
      if (A.part) {
        const x = A.x + A.dx * 2 * dt, z = A.z + A.dz * 2 * dt;
        if (E.labOuvert(C.w, x, z)) { A.x = x; A.z = z; } else return false;
        return A.t - A.part < 6;
      }
      return true;
    },
    dessin(A, t) { e16Fig.masque(A, t); },
  },
  // Donkey Kong
  tonneau: {
    p: 0.006, attente: 3,
    cond: (C, E) => {
      if (C.sous || C.mi === 'ville' || C.p.riding) return false;
      const w = C.w, n = w.normalAt(C.x, C.z);
      return n[1] < 0.95 && n[1] > 0.7;
    },
    poser(C, E) {
      const w = C.w, n = w.normalAt(C.x, C.z), L = Math.hypot(n[0], n[2]) || 1, ux = -n[0] / L, uz = -n[2] / L; // vers le haut de la pente
      const x = C.x + ux * 22, z = C.z + uz * 22;
      if (!E.sec(w, x, z) || w.heightAt(x, z) < C.y + 2.5) return null;
      E.son('roule', { x, y: w.heightAt(x, z), z });
      return { x, z, y: w.heightAt(x, z), vx: -ux * 2, vz: -uz * 2, cap: Math.atan2(-ux, -uz), roule: 0, vie: 12, sonT: 0 };
    },
    maj(A, dt, C, E) {
      const w = C.w, n = w.normalAt(A.x, A.z);
      A.vx += n[0] * 9 * dt; A.vz += n[2] * 9 * dt;
      const v = Math.hypot(A.vx, A.vz);
      if (v > 8) { A.vx *= 8 / v; A.vz *= 8 / v; }
      A.x += A.vx * dt; A.z += A.vz * dt;
      if (!E.sec(w, A.x, A.z)) return false;
      A.y = w.heightAt(A.x, A.z);
      A.cap = Math.atan2(A.vx, A.vz);
      A.roule += v * dt / 0.3;
      A.sonT -= dt;
      if (A.sonT <= 0) { A.sonT = 0.35; E.son('roule', A, 0.8); }
      const p = C.p;
      if (!A.choc && Math.hypot(A.x - p.pos[0], A.z - p.pos[2]) < 0.9) {
        A.choc = true;
        if (p.pos[1] > A.y + 0.75) { E.son('fanfare', A, 0.4); return true; }
        p.vel[0] += A.vx * 0.7; p.vel[2] += A.vz * 0.7; p.vel[1] = Math.max(p.vel[1], 3.5);
        sound.impact && sound.impact('soft');
      }
      return A.t < 3 || v > 0.6;
    },
    dessin(A, t) { e16Fig.tonneau(A, t); },
  },
  // Metal Gear Solid
  caisse: {
    p: 0.04, attente: 3,
    cond: (C, E) => !C.sous && (C.nuit || C.h >= 19) && (E.loinDe('g1_corps_garde', C.x, C.z) < 80 || E.loinDe('garde', C.x, C.z) < 80 || E.loinDe('g1_cabane_hameau', C.x, C.z) < 60),
    poser(C, E) {
      const P = E.chercher(C, 12, 18, -1.2, 1.2);
      return P ? { x: P.x, z: P.z, y: P.y, cap: Math.random() * TAU, vie: 120, alerte: 0, leve: 0 } : null;
    },
    maj(A, dt, C, E) {
      const d = E.dist(A, C);
      if (A.fuit) {
        A.leve = Math.min(1, A.leve + dt * 4); A.alerte -= dt;
        if (A.t - A.fuit > 0.6) { A.x += Math.sin(A.cap) * 6 * dt; A.z += Math.cos(A.cap) * 6 * dt; if (!E.sec(C.w, A.x, A.z)) return false; A.y = C.w.heightAt(A.x, A.z); }
        return A.t - A.fuit < 4;
      }
      if (d < 3.2) { A.fuit = A.t; A.alerte = 1.6; A.cap = E.cap(C, A.x, A.z); E.son('alerte', A); return true; }
      if (!E.vu(A, C, 0.5, 60)) {
        // elle avance de côté, par petits bonds, quand on ne la regarde pas
        const a = E.cap(A, C.x, C.z) + 1.3, x = A.x + Math.sin(a) * 0.8 * dt, z = A.z + Math.cos(a) * 0.8 * dt;
        if (E.sec(C.w, x, z)) { A.x = x; A.z = z; A.y = C.w.heightAt(x, z); }
      }
      return true;
    },
    dessin(A, t) { e16Fig.caisse(A, t); },
  },
});

// ---------------------------------------------------------------- branchements
HOOKS.update.push((dt, eye, basis, sky, playing) => { try { e16.maj(dt, eye, basis, sky, playing); } catch (e) { console.error('e16', e); } });
HOOKS.draw.push((buf, sbuf, cam, t) => { try { e16.dessiner(buf, cam, t); } catch (e) { console.error('e16 dessin', e); } });
HOOKS.lights.push((eye) => { try { return e16.lumieres(eye); } catch (e) { return []; } });
HOOKS.target.push((eye, f, cand) => { try { e16.cibles(eye, f, cand); } catch (e) { console.error('e16', e); } });
HOOKS.load.push(() => { e16.liste = []; e16.anneaux = []; e16.plumbob = null; e16.rollT = 8; try { e16.S(); } catch (e) { console.error('e16', e); } });
