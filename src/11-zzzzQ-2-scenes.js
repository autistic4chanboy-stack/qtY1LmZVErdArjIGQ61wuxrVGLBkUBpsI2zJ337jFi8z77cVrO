// ============================================================================
//  LE NONOS DU CHIEN (agent Q) : les scènes (moteur cine du socle).
//  - debut() : le chien tourne en rond, gratte, gémit ; puis le premier
//    souvenir ;
//  - souvenir(i) : le lieu i, vu comme un souvenir ou un regard de bête — à
//    hauteur de chien, à la lumière de l'heure où la bête est passée (l'aube ou
//    le soir), voile brun, sans jamais partir de là où l'on est (on y est
//    d'emblée, après un noir) : ni survol, ni chemin, ni direction ;
//  - terrier() : le cinquième lieu, le vieux renard, le nonos ;
//  - retour(e) : le chien reprend son os et l'emporte à sa niche.
//  Chaque scène fait ses effets dans debut()/fin() et opts.apres : passer une
//  scène (Espace) n'en saute pas les conséquences.
// ============================================================================
const nonosScenes = {
  mem: null, cadres: {}, renard: null,
  // -------------------------------------------------------------- le souvenir : la lumière d'une autre heure, le voile
  memoire(L) {
    if (!L) {
      if (this.mem) { this.mem = null; game.fovK = 1; }
      if (typeof document !== 'undefined' && document.body) document.body.classList.remove('q-souvenir');
      return;
    }
    const wx = { cloud: 0.12 }, fog = clamp((typeof settings !== 'undefined' && settings.fogDist) || 1, 0.5, 2);
    this.mem = { L, sky: computeSky(L.h / 24, settings.viewDist, wx, fog) };
    game.fovK = 1.1;
    this.style();
    document.body.classList.add('q-souvenir');
  },
  style() {
    if (typeof document === 'undefined' || document.getElementById('q-voile')) return;
    const st = document.createElement('style');
    st.id = 'q-nonos-css';
    st.textContent = `body.q-souvenir #gl{filter:sepia(.32) saturate(.8) contrast(1.06) brightness(1.04)}
#q-voile{position:fixed;inset:0;pointer-events:none;z-index:39;opacity:0;transition:opacity 1.2s;background:radial-gradient(ellipse at 50% 46%,rgba(0,0,0,0) 50%,rgba(26,16,8,.62) 100%)}
body.q-souvenir #q-voile{opacity:1}`;
    document.head.appendChild(st);
    const d = document.createElement('div');
    d.id = 'q-voile';
    document.body.appendChild(d);
  },
  // -------------------------------------------------------------- caméra : un point libre, une vue dégagée
  libre(w, P) {
    if (!w.inside(P[0], P[2], 6)) return false;
    if (P[1] < w.heightAt(P[0], P[2]) + 0.22) return false;
    let dedans = false;
    w.query(P[0], P[2], 1.2, null, (b) => {
      if (dedans || b.hidden || (b.ver && !(b.ver & w.curVer))) return;
      const [lx, lz] = World.blockLocal(b, P[0], P[2]);
      if (Math.abs(lx) < b.sx / 2 + 0.35 && Math.abs(lz) < b.sz / 2 + 0.35 && b.y < P[1] + 0.35 && b.y + b.sy > P[1] - 0.35) dedans = true;
    });
    if (dedans) return false;
    const [cx, cz] = w.collideCircle(P[0], P[2], P[1] - 0.4, P[1] + 0.3, 0.3, 0);
    return Math.hypot(cx - P[0], cz - P[2]) < 0.05;
  },
  // A voit B (on s'arrête à « stop » mètres de B : ce qu'on regarde peut être fait de blocs)
  voit(w, A, B, stop) {
    const dx = B[0] - A[0], dy = B[1] - A[1], dz = B[2] - A[2], D = Math.hypot(dx, dy, dz);
    const Lm = Math.min(38, D - (stop || 0));
    if (Lm <= 0.5) return true;
    const n = Math.ceil(Lm / 1.2);
    for (let k = 1; k <= n; k++) { const t = (k / n) * Lm / D; if (w.heightAt(A[0] + dx * t, A[2] + dz * t) > A[1] + dy * t - 0.1) return false; }
    const dir = [dx / D, dy / D, dz / D];
    if (w.raycastBlocks(A, dir, Lm)) return false;
    return !this.arbre(w, A, dir, Lm);
  },
  // un tronc, un buisson haut, un rocher entre les deux (les fleurs ne comptent pas)
  arbre(w, A, dir, Lm) {
    let hit = false;
    const dh2 = dir[0] * dir[0] + dir[2] * dir[2] || 1e-9;
    w.forObjectsNearRay(A, dir, Lm, (ob) => {
      if (hit || !ob) return;
      const T = OBJ_TYPES[ob.t];
      if (!T || T.animal || !w.live(ob) || ob.h < 1.5) return;
      const cx = ob.x - A[0], cz = ob.z - A[2], tc = (cx * dir[0] + cz * dir[2]) / dh2;
      if (tc < 0 || tc > Lm) return;
      const y = A[1] + dir[1] * tc, oy = w.objectY(ob);
      if (y < oy - 0.2 || y > oy + ob.h * 0.95) return;
      let r = Math.max(0.25, objRadius(T, ob) || 0.3) + 0.15;
      if (T.cat === 'Arbres' && y > oy + ob.h * 0.35) r = Math.max(r, ob.h * 0.22);
      const px = dir[0] * tc - cx, pz = dir[2] * tc - cz;
      if (px * px + pz * pz < r * r) hit = true;
    });
    return hit;
  },
  vueJoueur() { const p = game.player; return { pos: p.eyePos(), yaw: p.yaw, pitch: p.pitch }; },
  // un arc de caméra libre autour de c (rayon r, hauteur h au-dessus de c[1]) : { a0, a1 } ou null
  arc(w, c, r, h, ampl, pref) {
    const cible = [c[0], c[1] + 0.35, c[2]];
    const L = [];
    for (let k = 0; k < 16; k++) L.push(k / 16 * TAU);
    if (pref !== undefined) L.sort((a, b) => Math.abs(angDiff(a, pref)) - Math.abs(angDiff(b, pref)));
    for (const a0 of L) for (const sg of [1, -1]) {
      let ok = true;
      for (let k = 0; k <= 4 && ok; k++) {
        const a = a0 + sg * ampl * k / 4, P = [c[0] + Math.sin(a) * r, c[1] + h, c[2] + Math.cos(a) * r];
        ok = this.libre(w, P) && this.voit(w, P, cible, 0.6);
      }
      if (ok) return { a0, a1: a0 + sg * ampl };
    }
    return null;
  },
  // un point de vue libre autour de c, à la distance d et à la hauteur h, qui voit « cible »
  autour(w, c, d, h, cible, pref, stop) {
    const L = [];
    for (let k = 0; k < 16; k++) L.push(k / 16 * TAU);
    if (pref !== undefined) L.sort((a, b) => Math.abs(angDiff(a, pref)) - Math.abs(angDiff(b, pref)));
    for (const a of L) {
      const x = c[0] + Math.sin(a) * d, z = c[2] + Math.cos(a) * d, P = [x, Math.max(w.heightAt(x, z), w.waterLevel) + h, z];
      if (this.libre(w, P) && this.voit(w, P, cible, stop || 0.5)) return { P, a };
    }
    return null;
  },

  // -------------------------------------------------------------- le cadrage d'un lieu (souvenir i)
  cadrer(i) {
    const S = nonos.S(), L = S.L[i - 1], w = game.world, T = NONOS_TYPES[L.t] || { look: 1.5 };
    const key = i + ':' + L.k;
    if (this.cadres[key] && this.cadres[key].w === w) return this.cadres[key];
    const g = Math.max(w.heightAt(L.x, L.z), w.waterLevel);
    const haut = [L.x, g + T.look * 0.7, L.z], pied = [L.x, g + Math.min(0.6, T.look * 0.3), L.z], sommet = [L.x, g + T.look * 1.05, L.z];
    const sky = computeSky(L.h / 24, 300, {}), sun = [sky.sunDir[0], sky.sunDir[2]], sn = Math.hypot(sun[0], sun[1]) || 1;
    const rnd = mulberry32(((S.graine >>> 0) ^ Math.imul(i, 0x9E3779B1)) >>> 0);
    const stop = clamp((L.r || 5) * 0.6, 2.5, 7);
    let best = null;
    for (let k = 0; k < 28; k++) {
      const a = (k / 28) * TAU + rnd() * 0.15;
      for (const d of [18, 23, 14, 28]) {
        const x = L.x + Math.sin(a) * d, z = L.z + Math.cos(a) * d, h = w.heightAt(x, z);
        if (h < w.waterLevel + 0.1) continue;
        const P0 = [x, h + 0.55, z];
        if (!this.libre(w, P0) || !this.voit(w, P0, haut, stop)) continue;
        const x2 = L.x + Math.sin(a) * (d - 4), z2 = L.z + Math.cos(a) * (d - 4);
        const P1 = [x2, Math.max(w.heightAt(x2, z2), w.waterLevel) + 0.6, z2];
        if (!this.libre(w, P1) || !this.voit(w, P1, haut, stop)) continue;
        // la lumière : de côté ou un peu de face (contre-jour léger), plutôt que dans le dos
        const s = (-Math.sin(a) * sun[0] - Math.cos(a) * sun[1]) / sn;
        const sc = -Math.abs(s - 0.25) + rnd() * 0.35 + (d === 18 ? 0.12 : 0) - (d === 28 ? 0.15 : 0);
        if (!best || sc > best.sc) best = { sc, a, d, P0, P1 };
        break;
      }
    }
    if (!best) {
      const a = rnd() * TAU, P0 = [L.x + Math.sin(a) * 14, g + 5, L.z + Math.cos(a) * 14], P1 = [L.x + Math.sin(a) * 11, g + 4, L.z + Math.cos(a) * 11];
      best = { a, d: 14, P0, P1 };
    }
    let C = null;
    const dC = clamp((L.r || 5) * 0.7 + 4.5, 6, 11);
    for (const da of [0.55, -0.55, 0.9, -0.9, 0.3, -0.3, 1.3, -1.3]) {
      const a = best.a + da, x = L.x + Math.sin(a) * dC, z = L.z + Math.cos(a) * dC, h = w.heightAt(x, z);
      if (h < w.waterLevel + 0.1) continue;
      const Q0 = [x, h + 0.42, z];
      const a1 = a + da * 0.22, x1 = L.x + Math.sin(a1) * (dC - 1.4), z1 = L.z + Math.cos(a1) * (dC - 1.4);
      const Q1 = [x1, Math.max(w.heightAt(x1, z1), w.waterLevel) + 0.5, z1];
      if (!this.libre(w, Q0) || !this.libre(w, Q1) || !this.voit(w, Q0, haut, stop) || !this.voit(w, Q1, haut, stop)) continue;
      C = { de: { pos: Q0, look: pied }, a: { pos: Q1, look: sommet } };
      break;
    }
    if (!C) C = { de: { pos: best.P1, look: pied }, a: { pos: best.P1, look: sommet } };
    return (this.cadres[key] = { w, B: { de: { pos: best.P0, look: haut }, a: { pos: best.P1, look: haut } }, C });
  },
  // les plans d'un souvenir (cinq : noir, approche, détail, noir, retour) ; texteNoir : ce qu'on lit dans le noir
  plansSouvenir(i, texteNoir) {
    const S = nonos.S(), L = S.L[i - 1], V = this.cadrer(i);
    const ph = (NONOS_TYPES[L.t] && NONOS_TYPES[L.t].ph) || [['', '']], P = ph[(L.v | 0) % ph.length];
    const on = () => this.memoire(L), off = () => this.memoire(null), retour = this.vueJoueur();
    return [
      { dur: texteNoir ? 2.0 : 0.7, de: V.B.de, fondu: 'noir', texte: texteNoir || '', debut: on },
      { dur: 5.6, de: V.B.de, a: V.B.a, texte: P[0], debut: () => { on(); sound.flairer && sound.flairer(0.45); } },
      { dur: 5.0, de: V.C.de, a: V.C.a, texte: P[1] },
      { dur: 1.3, de: V.C.a, fondu: 'noir' },
      { dur: 0.5, de: retour, fondu: 'noir', debut: off, fin: off },
    ];
  },
  // un souvenir seul (après un indice, ou revu depuis le carnet)
  souvenir(i, apresIndice) {
    const S = nonos.S();
    if (!S || !S.L[i - 1] || cine.on) return Promise.resolve();
    const txt = apresIndice ? NONOS_TXT.avant[i - 1] : '';
    const plans = this.plansSouvenir(i, txt);
    plans.unshift({ dur: apresIndice ? 1.2 : 0.8, de: this.vueJoueur(), fondu: 'noir', texte: txt });
    return cine.jouer(plans, { apres: () => this.memoire(null) });
  },

  // -------------------------------------------------------------- le matin où il cherche
  debut() {
    const e = chien.entite(), w = game.world, p = game.player, nom = chien.nom();
    if (!e) { nonos.tirer(); return; }
    const c = [e.x, e.y, e.z], tete = [c[0], c[1] + 0.5, c[2]], sol = [c[0], c[1] + 0.12, c[2]];
    const versJoueur = Math.atan2(p.pos[0] - c[0], p.pos[2] - c[2]);
    const sc = { mode: 'tourne', a: Math.random() * TAU, h0: e.heading || 0, gT: 0, cam: null };
    const A = this.arc(w, c, 4.4, 1.5, 1.4, versJoueur);
    const p1 = A ? { orbite: { c: [c[0], c[1], c[2]], r: 4.4, h: 1.5, a0: A.a0, a1: A.a1, look: [c[0], c[1] + 0.3, c[2]] } } : { de: { pos: p.eyePos(), look: tete } };
    const bas = this.autour(w, c, 2.0, 0.5, sol, A ? A.a1 + 0.6 : versJoueur, 0.4);
    const p2 = bas ? { de: { pos: bas.P, look: sol }, a: { pos: [lerp(bas.P[0], c[0], 0.2), bas.P[1] - 0.05, lerp(bas.P[2], c[2], 0.2)], look: sol } } : { de: { pos: p.eyePos(), look: sol } };
    const face = this.autour(w, c, 2.4, 1.45, tete, versJoueur, 0.4);
    const pf = face ? face.P : p.eyePos();
    sc.cam = pf;
    nonos.scene = { chien: (e2, dt, w2) => this.chienDebut(sc, c, e2, dt, w2) };
    const M = [{ dur: 2.0, fondu: 'noir', texte: NONOS_TXT.avant[0] }, { dur: 5.6 }, { dur: 5.0 }, { dur: 1.3, fondu: 'noir' }, { dur: 0.5, fondu: 'noir' }];
    let pret = false;
    const preparer = () => {
      if (pret) return;
      pret = true;
      nonos.scene = null;
      if (!nonos.tirer()) { for (const m of M) { m.dur = 0.01; m.texte = ''; } return; }
      const P = this.plansSouvenir(1, NONOS_TXT.avant[0]);
      M.forEach((m, k) => Object.assign(m, P[k]));
    };
    sound.gemissement && sound.gemissement(0.8, 0);
    return cine.jouer([
      Object.assign({ dur: 5.6, texte: NONOS_TXT.debut[0](nom), debut: () => { sc.mode = 'tourne'; } }, p1),
      Object.assign({ dur: 5.0, texte: NONOS_TXT.debut[1](nom), debut: () => { sc.mode = 'gratte'; sc.h0 = e.heading || 0; sound.gemissement && sound.gemissement(0.7, 0); } }, p2),
      { dur: 4.2, de: { pos: pf, look: tete }, texte: NONOS_TXT.debut[2](nom), debut: () => { sc.mode = 'regarde'; }, chaque: (t) => { if (t > 2.4) sc.mode = 'nez'; } },
      { dur: 1.6, de: { pos: pf, look: tete }, fondu: 'noir', texte: NONOS_TXT.avant[0], chaque: (t) => { if (t > 1.2) preparer(); }, fin: preparer },
      ...M,
    ], { apres: () => { preparer(); nonos.scene = null; this.memoire(null); } });
  },
  chienDebut(sc, c, e, dt, w) {
    const t = game.time || 0;
    e.ronge = false; e.wag = false;
    if (sc.mode === 'tourne') {
      sc.a += dt * 1.15;
      chien.marcher(e, dt, w, c[0] + Math.sin(sc.a) * 1.0, c[2] + Math.cos(sc.a) * 1.0, false);
      e.move = 0.7; e.grazeT = 1; e.lookY = Math.sin(t * 2.1) * 0.3;
      return true;
    }
    if (sc.mode === 'gratte') {
      e.state = 'idle'; e.grazeT = 1;
      sc.gT = (sc.gT + dt) % 1.5;
      if (sc.gT < 0.55) { e.move = 0.45; e.phase += dt * 18; } else e.move = 0;
      e.heading = turnToward(e.heading, sc.h0 + Math.sin(t * 1.1) * 0.5, dt * 2);
      e.lookY = Math.sin(t * 3.3) * 0.25;
      return true;
    }
    e.state = 'idle'; e.move = 0; e.grazeT = 0;
    if (sc.cam) e.heading = turnToward(e.heading, Math.atan2(sc.cam[0] - e.x, sc.cam[2] - e.z), dt * 4);
    e.lookY = sc.mode === 'nez' ? Math.sin(t * 2.2) * 0.35 : 0;
    return true;
  },

  // -------------------------------------------------------------- le terrier
  terrier() {
    const S = nonos.S(), L = S && S.L[NONOS_N - 1], w = game.world, nom = chien.nom();
    if (!L || cine.on) return;
    const y = nonos.yIndice(NONOS_N), r = ((L.ix * 7.31 + L.iz * 3.17) % TAU);
    const fx = -Math.sin(r), fz = -Math.cos(r);   // l'entrée du terrier (vers -z local)
    const bouche = [L.ix + fx * 0.6, y + 0.22, L.iz + fz * 0.6], os = [L.ix + fx * 0.98, y + 0.05, L.iz + fz * 0.98];
    const a0 = Math.atan2(fx, fz);
    const v1 = this.autour(w, bouche, 3.4, 0.55, bouche, a0, 0.3) || { P: [bouche[0] + fx * 3.4, y + 0.9, bouche[2] + fz * 3.4] };
    const v2 = this.autour(w, os, 1.2, 0.38, os, a0 + 0.4, 0.2) || { P: [os[0] + fx * 1.2, y + 0.5, os[2] + fz * 1.2] };
    // le renard : à quelques mètres, là où on le voit
    let R = null;
    for (let k = 0; k < 24 && !R; k++) {
      const a = a0 + (k % 2 ? 1 : -1) * (0.6 + (k >> 1) * 0.25), d = 7 + (k % 3);
      const x = L.ix + Math.sin(a) * d, z = L.iz + Math.cos(a) * d, h = w.heightAt(x, z);
      if (h < w.waterLevel + 0.2 || !nonosSol(w, null, x, z, 0.3, null)) continue;
      const P = [x, h + 0.45, z], cam = this.autour(w, [L.ix, y, L.iz], 2.6, 0.7, P, a + Math.PI, 0.2);
      if (!cam) continue;
      R = { x, y: h, z, heading: Math.atan2(L.ix - x, L.iz - z), move: 0, phase: 0, vis: false, part: false, cam: cam.P, fuite: a };
    }
    if (!R) { const a = a0 + 0.9, x = L.ix + Math.sin(a) * 7, z = L.iz + Math.cos(a) * 7; R = { x, y: w.heightAt(x, z), z, heading: Math.atan2(L.ix - x, L.iz - z), move: 0, phase: 0, vis: false, part: false, cam: v1.P, fuite: a }; }
    const tete = () => [R.x, R.y + 0.45, R.z];
    this.renard = R;
    nonos.scene = { draw: (buf, sbuf, cam, t) => this.dessinerRenard(buf, sbuf, t) };
    const prendre = () => { nonos.prendreNonos(); R.vis = false; };
    return cine.jouer([
      { dur: 1.1, de: this.vueJoueur(), fondu: 'noir' },
      { dur: 6.6, de: { pos: v1.P, look: bouche }, a: { pos: [lerp(v1.P[0], bouche[0], 0.25), v1.P[1] - 0.1, lerp(v1.P[2], bouche[2], 0.25)], look: bouche }, texte: NONOS_TXT.terrier[0] },
      { dur: 4.6, de: { pos: v2.P, look: os }, texte: NONOS_TXT.terrier[1](nom) },
      { dur: 6.8, de: { pos: R.cam, look: tete() }, texte: NONOS_TXT.terrier[2], debut: () => { R.vis = true; },
        chaque: (t, dt) => {
          dt = Math.min(dt || 0.016, 0.1);
          if (t < 3.2) { R.move = 0; return; }
          const h = R.fuite;
          R.heading = turnToward(R.heading, h, dt * 3.5);
          const v = 1.6;
          R.x += Math.sin(R.heading) * v * dt; R.z += Math.cos(R.heading) * v * dt; R.y = w.heightAt(R.x, R.z);
          R.move = 1; R.phase += dt * v * 2.6 / 0.6;
        } },
      { dur: 1.3, de: { pos: R.cam, look: tete() }, fondu: 'noir', fin: prendre },
      { dur: 0.5, de: this.vueJoueur(), fondu: 'noir' },
    ], { apres: () => { prendre(); this.renard = null; nonos.scene = null; } });
  },
  renardRig() {
    if (this._rr) return this._rr;
    const r = ANIMAL_RIGS.fox();
    const h = r.part('head'); if (h) h.col = [0.66, 0.46, 0.34];
    const s = r.part('snout'); if (s) s.col = [0.72, 0.7, 0.66];
    const er = r.part('earR'); if (er && er.s) er.s = [er.s[0], er.s[1] * 0.5, er.s[2]];
    const b = r.part('body'); if (b) b.col = [0.68, 0.36, 0.17];
    return (this._rr = r);
  },
  dessinerRenard(buf, sbuf, t) {
    const R = this.renard;
    if (!R || !R.vis) return;
    const rig = this.renardRig();
    poseQuad(rig, { move: R.move, phase: R.phase, run: false, t, graze: 0, lookY: R.move ? 0 : Math.sin(t * 0.6) * 0.2, wag: false });
    drawRig(buf, rig, R.x, R.y, R.z, R.heading, 1.08, 0);
    if (sbuf) drawShadow(sbuf, R.x, R.y, R.z, 0.3);
  },

  // -------------------------------------------------------------- le retour
  retour(e) {
    const S = nonos.S(), w = game.world, p = game.player, nom = chien.nom();
    if (!S || S.rendu || cine.on || !e || e.removed || e.dead) return;
    ui.close(true);
    const n = chien.niche(), eye = p.eyePos();
    const sc = { mode: 'devant', os: false };
    const tete = () => [e.x, e.y + 0.5, e.z];
    const cote = this.autour(w, [e.x, e.y, e.z], 2.2, 0.55, [e.x, e.y + 0.4, e.z], Math.atan2(p.pos[0] - e.x, p.pos[2] - e.z) + 1.4, 0.3);
    const pc = cote ? cote.P : eye;
    const nc = [n[0], w.heightAt(n[0], n[1]), n[1]];
    const vn = this.autour(w, nc, 2.7, 0.8, [nc[0], nc[1] + 0.3, nc[2]], n[2] !== null ? n[2] : Math.atan2(p.pos[0] - n[0], p.pos[2] - n[1]), 0.4);
    const pn = vn ? vn.P : [nc[0] + 2.2, nc[1] + 1.2, nc[2] + 1.6];
    nonos.scene = {
      chien: (e2, dt, w2) => this.chienRetour(sc, n, e2, dt, w2),
      draw: () => { if (sc.os) { PE.fl = 0; nonosOsGueule(e); } },
    };
    const fin = () => { nonos.finRetour(); };
    return cine.jouer([
      { dur: 3.9, de: { pos: eye, look: tete() }, texte: NONOS_TXT.retour[0](nom), debut: () => { sc.mode = 'devant'; sound.bark && sound.bark(0.6); } },
      { dur: 4.6, de: { pos: pc, look: tete() }, a: { pos: pc, look: [lerp(e.x, n[0], 0.15), e.y + 0.4, lerp(e.z, n[1], 0.15)] }, texte: NONOS_TXT.retour[1](nom), debut: () => { sc.os = true; sc.mode = 'part'; } },
      { dur: 1.1, de: { pos: pc, look: tete() }, fondu: 'noir', fin: () => { this.poserANiche(e, n); sc.mode = 'ronge'; } },
      { dur: 6.0, de: { pos: pn, look: [nc[0], nc[1] + 0.3, nc[2]] }, a: { pos: [lerp(pn[0], nc[0], 0.12), pn[1] - 0.08, lerp(pn[2], nc[2], 0.12)], look: [nc[0], nc[1] + 0.25, nc[2]] }, texte: NONOS_TXT.retour[2](nom), debut: () => { this.poserANiche(e, n); sc.mode = 'ronge'; } },
      { dur: 1.3, de: { pos: pn, look: [nc[0], nc[1] + 0.3, nc[2]] }, fondu: 'noir', fin },
      { dur: 0.5, de: this.vueJoueur(), fondu: 'noir' },
    ], { apres: () => { fin(); nonos.scene = null; } });
  },
  poserANiche(e, n) {
    if (Math.hypot(e.x - n[0], e.z - n[1]) < 1.2) return;
    const w = game.world;
    e.x = n[0]; e.z = n[1]; e.y = entities.groundY(w, e, n[0], n[1]);
    if (n[2] !== null) e.heading = n[2];
  },
  chienRetour(sc, n, e, dt, w) {
    const t = game.time || 0, p = game.player;
    e.ronge = false;
    if (sc.mode === 'devant') {
      e.state = 'idle'; e.move = 0; e.grazeT = 0; e.wag = true; e.lookY = 0;
      e.heading = turnToward(e.heading, Math.atan2(p.pos[0] - e.x, p.pos[2] - e.z), dt * 5);
      return true;
    }
    if (sc.mode === 'part') {
      e.wag = true; e.grazeT = 0;
      const d = Math.hypot(n[0] - e.x, n[1] - e.z);
      if (d > 0.9) chien.marcher(e, dt, w, n[0], n[1], false); else { e.move = 0; e.state = 'idle'; }
      return true;
    }
    e.move = 0; e.state = 'sheltered'; e.wag = false;
    if (n[2] !== null) e.heading = turnToward(e.heading, n[2], dt * 3);
    e.grazeT = 0.55 + 0.35 * Math.max(0, Math.sin(t * 2.3));
    e.lookY = Math.sin(t * 0.7) * 0.25;
    return true;
  },
};

// ---------------------------------------------------------------- branchements
// le souvenir : la lumière d'une autre heure, sans effets d'écran (le rendu seul ; rien ne change dans le jeu)
HOOKS.load.push(() => {
  if (!game.renderer || game.renderer._nonos) return;
  game.renderer._nonos = true;
  const _r = game.renderer.render.bind(game.renderer);
  game.renderer.render = function (o) {
    const M = nonosScenes.mem;
    if (M && cine.on && o) {
      o.sky = M.sky; o.fx = [0, 0, 0, 0]; o.tint = [0, 0, 0, 0]; o.glitch = [0, 0, 0, 0];
      o.rain = 0; o.snow = 0; o.moon2 = 0; o.shadowA = 0.32 * (0.35 + M.sky.day * 0.65);
    }
    return _r(o);
  };
});
HOOKS.load.push(() => { nonosScenes.memoire(null); nonosScenes.cadres = {}; nonosScenes.renard = null; });
// un regard de bête : la tête qui bouge un peu
HOOKS.camera.push((dt, pos, yaw, pitch) => {
  if (!nonosScenes.mem || !cine.on) return null;
  const t = game.time || 0;
  return { pos: [pos[0], pos[1] + Math.sin(t * 6.3) * 0.016, pos[2]], yaw: yaw + Math.sin(t * 0.9) * 0.012, pitch: pitch + Math.sin(t * 6.3 + 1.1) * 0.005 };
});
// la scène finie ou interrompue : plus de voile
HOOKS.update.push(() => { if (nonosScenes.mem && !cine.on) nonosScenes.memoire(null); });

// ---------------------------------------------------------------- le bruit d'une bête qui flaire
Object.assign(SoundEngine.prototype, {
  flairer(k = 1) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random;
    for (let i = 0; i < 4; i++) this.noiseHit(t + i * 0.12 + R() * 0.025, 0.07, 'bandpass', 2400 + R() * 700, 1.3, 0.03 * k, null, 1700, 0.012);
    this.noiseHit(t + 0.6, 0.2, 'bandpass', 1100, 0.8, 0.018 * k, null, 650, 0.04);
  },
});
