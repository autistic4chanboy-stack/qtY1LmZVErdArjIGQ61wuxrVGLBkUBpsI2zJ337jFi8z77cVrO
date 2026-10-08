// ============================================================================
//  LES QUÊTES PRINCIPALES À LIEUX PRÉCIS (agent T) : les scènes (moteur cine).
//  - etape(id, i) : le lieu de l'étape i, montré d'abord en entier (plan large,
//    un lent travelling), puis l'endroit précis où chercher (plan rapproché),
//    à la lumière de l'heure qui lui convient ; le nom du lieu dans le noir du
//    début. DEHORS : une caméra libre (ni dans un mur, ni sous un toit, ni dans
//    l'herbe), qui voit le lieu (relief, murs, troncs) et l'éclaire de côté.
//    DEDANS : une caméra DANS la pièce (sous le toit, à hauteur d'homme, entre
//    les murs, hors des meubles), qui voit l'endroit ; deux lumières de scène
//    (une sur l'endroit, une douce derrière la caméra) : on y voit clair.
//  - epilogue(id, k) : un dernier plan du dernier lieu, la fin choisie.
//  Le ciel de la scène est calculé pour son heure (le jeu, lui, ne change pas
//  d'heure) ; rien ne bouge dans la partie pendant une scène.
// ============================================================================
const qtScenes = {
  mem: null,             // la scène en cours : { sky, lum: [lumières] }
  montre: null,          // l'étape montrée ('t1:0'…) : son objet est dessiné pendant la scène, même hors quête
  cadres: {},            // cadrages déjà calculés : { 'id:i': { w, … } }
  // ---------------------------------------------------------------- la lumière de la scène
  lumiere(o) {
    if (!o) {
      this.mem = null; this.montre = null;
      if (typeof document !== 'undefined' && document.body) document.body.classList.remove('t-scene');
      return;
    }
    const fog = clamp((typeof settings !== 'undefined' && settings.fogDist) || 1, 0.5, 2);
    this.mem = { sky: computeSky(o.h / 24, settings.viewDist, { cloud: o.dedans ? 0.25 : 0.1 }, fog), lum: o.lum || [] };
    this.style();
    document.body.classList.add('t-scene');
  },
  style() {
    if (typeof document === 'undefined' || document.getElementById('t-voile')) return;
    const st = document.createElement('style');
    st.id = 't-scene-css';
    st.textContent = `#t-voile{position:fixed;inset:0;pointer-events:none;z-index:39;opacity:0;transition:opacity 1s;background:radial-gradient(ellipse at 50% 48%,rgba(0,0,0,0) 58%,rgba(12,10,8,.5) 100%)}
body.t-scene #t-voile{opacity:1}`;
    document.head.appendChild(st);
    const d = document.createElement('div');
    d.id = 't-voile';
    document.body.appendChild(d);
  },
  vueJoueur() { const p = game.player; return { pos: p.eyePos(), yaw: p.yaw, pitch: p.pitch }; },

  // ---------------------------------------------------------------- dehors
  // A voit B (relief, blocs, troncs) ; on s'arrête à « stop » mètres de B
  voit(w, L, A, B, stop) {
    const dx = B[0] - A[0], dy = B[1] - A[1], dz = B[2] - A[2], D = Math.hypot(dx, dy, dz);
    const Lm = Math.min(60, D - (stop || 0));
    if (Lm <= 0.4) return true;
    const n = Math.ceil(Lm / 1.0);
    for (let k = 1; k <= n; k++) { const t = (k / n) * Lm / D; if (w.heightAt(A[0] + dx * t, A[2] + dz * t) > A[1] + dy * t - 0.12) return false; }
    const dir = [dx / D, dy / D, dz / D];
    if (qtRayon(w, L, A, dir, Lm)) return false;
    return !this.arbre(w, A, dir, Lm);
  },
  ign: null,             // un arbre qu'on montre (le chêne) : il ne cache pas ce qui pend à son tronc
  arbre(w, A, dir, Lm) {
    let hit = false;
    const dh2 = dir[0] * dir[0] + dir[2] * dir[2] || 1e-9, I = this.ign;
    w.forObjectsNearRay(A, dir, Lm, (ob) => {
      if (hit || !ob) return;
      const T = OBJ_TYPES[ob.t];
      if (!T || T.animal || !w.live(ob) || ob.h < 0.9 || T.cat === 'Fleurs' || T.cat === 'Champignons') return;
      if (I && Math.hypot(ob.x - I[0], ob.z - I[1]) < 0.6) return;
      const cx = ob.x - A[0], cz = ob.z - A[2], tc = (cx * dir[0] + cz * dir[2]) / dh2;
      if (tc < 0 || tc > Lm) return;
      const y = A[1] + dir[1] * tc, oy = w.objectY(ob);
      if (y < oy - 0.2 || y > oy + ob.h * 0.95) return;
      const col = objRadius(T, ob);
      let r = Math.max(0.25, col || 0.3) + 0.12;
      if (!col) r = Math.max(r, ob.h * 0.42);
      else if (T.cat === 'Arbres' && y > oy + ob.h * 0.35) r = Math.max(r, ob.h * 0.22);
      const px = dir[0] * tc - cx, pz = dir[2] * tc - cz;
      if (px * px + pz * pz < r * r) hit = true;
    });
    return hit;
  },
  // un point de caméra dehors : dans la vallée, au-dessus du sol, ni dans un mur ni sous un toit
  libreDehors(w, L, P) {
    if (!w.inside(P[0], P[2], 6)) return false;
    const g = w.heightAt(P[0], P[2]);
    if (P[1] < g + 0.9 || P[1] < w.waterLevel + 0.9) return false;
    if (qtDansBloc(L, P, 0.35)) return false;
    if (qtSousToit(w, L, P)) return false;
    return true;
  },
  cadrerDehors(w, S, h) {
    this.ign = S.lieu.arbre || null;
    try { return this.cadrerDehors0(w, S, h); } finally { this.ign = null; }
  },
  // devant l'objectif, sur les trois premiers mètres, rien de massif : ni bloc (un pan de mur, une poutre), ni objet posé
  // à moins de 2,6 m dans le champ (un poteau, une charrette)
  degage(w, L, P, T, props) {
    const dx = T[0] - P[0], dz = T[2] - P[2], D = Math.hypot(dx, dz) || 1, yaw = Math.atan2(dx, dz), pente = (T[1] - P[1]) / D;
    const Lc = L.filter((b) => Math.hypot(b.x - P[0], b.z - P[2]) < 4.6 + Math.hypot(b.sx, b.sz) / 2);
    if (Lc.length) for (const d of [1.0, 2.0, 3.0, 4.0]) for (const da of [-0.7, -0.45, -0.22, 0, 0.22, 0.45, 0.7]) {
      const x = P[0] + Math.sin(yaw + da) * d, z = P[2] + Math.cos(yaw + da) * d;
      for (const e of [-1.1, -0.5, 0, 0.6]) if (qtDansBloc(Lc, [x, P[1] + pente * d + e, z], 0.05)) return false;
    }
    const devant = (x, z, y, loin) => {
      const qx = x - P[0], qz = z - P[2], d = Math.hypot(qx, qz);
      return d < loin && d > 0.01 && Math.abs(y - P[1]) < 3 && Math.abs(angDiff(Math.atan2(qx, qz), yaw)) < (d < 3 ? 0.8 : 0.6);
    };
    // (un objet posé, un panneau, une borne : jusqu'à 8 m, il prend encore un bord de l'image)
    for (const q of props) if (devant(q.x, q.z, q.y, 8)) return false;
    // (et les choses du monde : un buisson, une charrette, un tronc)
    const G = w.objectsGrid(), K = G.C;
    for (let gz = Math.floor((P[2] - 5) / K); gz <= Math.floor((P[2] + 5) / K); gz++) for (let gx = Math.floor((P[0] - 5) / K); gx <= Math.floor((P[0] + 5) / K); gx++) {
      const c = gx >= 0 && gz >= 0 && gx < G.gw && gz < G.gw ? G.cells[gz * G.gw + gx] : null;
      if (c) for (const i of c) {
        const o = w.objects[i], Tt = o && OBJ_TYPES[o.t];
        if (!Tt || Tt.animal || !w.live(o) || o.h < 0.9 || Tt.cat === 'Fleurs' || Tt.cat === 'Champignons') continue;
        if (this.ign && Math.hypot(o.x - this.ign[0], o.z - this.ign[1]) < 0.6) continue;
        if (devant(o.x, o.z, w.objectY ? w.objectY(o) : P[1], 5)) return false;
      }
    }
    return true;
  },
  // le segment A→B (au sol) passe-t-il contre un objet posé (un poteau, une stèle) ? (hors de ceux qui portent l'endroit)
  bute(props, A, B) {
    const dx = B[0] - A[0], dz = B[2] - A[2], L2 = dx * dx + dz * dz || 1e-9;
    for (const q of props) {
      if (Math.hypot(q.x - B[0], q.z - B[2]) < 0.7) continue;
      const t = ((q.x - A[0]) * dx + (q.z - A[2]) * dz) / L2;
      if (t < 0.02 || t > 0.98) continue;
      if (Math.hypot(A[0] + dx * t - q.x, A[2] + dz * t - q.z) < 0.4) return true;
    }
    return false;
  },
  cadrerDehors0(w, S, h) {
    const lieu = S.lieu, C = lieu.c, H = S.p;
    const L = qtBlocs(w, (C[0] + H[0]) / 2, (C[2] + H[2]) / 2, (lieu.loin ? 60 : 40) + Math.hypot(C[0] - H[0], C[2] - H[2]) / 2);
    const sky = computeSky(h / 24, 300, {}), sun = [sky.sunDir[0], sky.sunDir[2]], sn = Math.hypot(sun[0], sun[1]) || 1;
    const DS = lieu.loin ? [30, 36, 24, 42] : lieu.hc > 2 ? [17, 21, 14, 25] : [11, 14, 9, 17];
    const haut = [C[0], C[1], C[2]];
    let best = null;
    // des vues données par le lieu (la cascade : en face de la chute, à sa hauteur), si elles sont libres
    for (const V of lieu.vues || []) {
      const P0 = V.pos, P1 = [P0[0] + (C[0] - P0[0]) * 0.15, P0[1], P0[2] + (C[2] - P0[2]) * 0.15];
      if (!this.libreDehors(w, L, P0) || !this.voit(w, L, P0, haut, 1.0) || !this.libreDehors(w, L, P1)) continue;
      best = { a: Math.atan2(P0[0] - C[0], P0[2] - C[2]), P0, P1 };
      break;
    }
    const fixe = !!best, propsL = fixe ? [] : qtProps(w, C[0], C[2], DS[3] + 4);
    let pis = null;
    for (let k = 0; k < 32 && !fixe; k++) {
      const a = (k / 32) * TAU;
      for (const d of DS) {
        const x = C[0] + Math.sin(a) * d, z = C[2] + Math.cos(a) * d, g = Math.max(w.heightAt(x, z), w.waterLevel);
        const P0 = [x, g + (lieu.loin ? 2.0 : 1.7), z];
        if (!this.libreDehors(w, L, P0) || !this.voit(w, L, P0, haut, lieu.hc > 2 ? 2 : 1.2)) continue;
        // (pas par une porte ni entre deux murs : on voit aussi de part et d'autre du lieu, et son sommet)
        const px = Math.cos(a), pz = -Math.sin(a), e = Math.max(2.5, lieu.hc * 0.8);
        let vus = 0;
        for (const Q of [[C[0] + px * e, C[1], C[2] + pz * e], [C[0] - px * e, C[1], C[2] - pz * e], [C[0], C[1] + lieu.hc * 0.6, C[2]]]) if (this.voit(w, L, P0, Q, 1.0)) vus++;
        if (vus < 2) continue;
        const x1 = C[0] + Math.sin(a) * (d - 3.5), z1 = C[2] + Math.cos(a) * (d - 3.5);
        const P1 = [x1, Math.max(w.heightAt(x1, z1), w.waterLevel) + (lieu.loin ? 2.0 : 1.7), z1];
        if (!this.libreDehors(w, L, P1) || !this.voit(w, L, P1, haut, lieu.hc > 2 ? 2 : 1.2)) continue;
        // la lumière de côté (un peu de face, plutôt que dans le dos) ; l'endroit précis visible aussi, si possible
        const s = (-Math.sin(a) * sun[0] - Math.cos(a) * sun[1]) / sn;
        const sc = -Math.abs(s - 0.2) + (this.voit(w, L, P1, H, 0.3) ? 0.6 : 0) - (d === DS[3] ? 0.15 : 0) + (d === DS[0] ? 0.1 : 0) - k * 0.0005;
        // (rien de planté juste devant l'objectif : un pan de mur, un poteau ; sinon, une autre distance)
        if (!this.degage(w, L, P0, haut, propsL)) { if (!pis || sc > pis.sc) pis = { sc, a, P0, P1 }; continue; }
        if (!best || sc > best.sc) best = { sc, a, P0, P1 };
        break;
      }
    }
    if (!best) best = pis;
    if (!best) { const a = 0.6, P0 = [C[0] + Math.sin(a) * 12, C[1] + 6, C[2] + Math.cos(a) * 12]; best = { a, P0, P1: [P0[0] * 0.9 + C[0] * 0.1, P0[1], P0[2] * 0.9 + C[2] * 0.1] }; }
    // le plan rapproché : l'endroit précis, de près, au-dessus de l'herbe (du côté donné par le lieu, s'il en donne un ;
    // ni poteau ni stèle entre la caméra et lui)
    let Cl = null;
    const cible = [H[0], H[1], H[2]], props = qtProps(w, H[0], H[2], 7);
    const a0 = lieu.face !== undefined ? lieu.face : Math.atan2(best.P1[0] - H[0], best.P1[2] - H[2]);
    const DAS = lieu.face !== undefined ? [0, 0.3, -0.3, 0.6, -0.6, 1.0, -1.0, 1.5, -1.5] : [0, 0.45, -0.45, 0.9, -0.9, 1.4, -1.4, 2.0, -2.0, Math.PI];
    const p0 = lieu.pres || 3.2;
    for (const dd of [p0, p0 - 0.6, p0 + 0.8, p0 + 1.6]) {
      for (const da of DAS) {
        const a = a0 + da;
        const x = H[0] + Math.sin(a) * dd, z = H[2] + Math.cos(a) * dd;
        const Q0 = [x, Math.max(w.heightAt(x, z), H[1] - 0.3, w.waterLevel) + 1.35, z];
        if (!this.libreDehors(w, L, Q0) || !this.voit(w, L, Q0, cible, 0.25) || this.bute(props, Q0, cible)) continue;
        const x1 = H[0] + Math.sin(a) * (dd - 0.8), z1 = H[2] + Math.cos(a) * (dd - 0.8);
        const Q1 = [x1, Math.max(w.heightAt(x1, z1), H[1] - 0.3, w.waterLevel) + 1.25, z1];
        if (!this.libreDehors(w, L, Q1) || !this.voit(w, L, Q1, cible, 0.25) || this.bute(props, Q1, cible)) continue;
        Cl = { de: { pos: Q0, look: cible }, a: { pos: Q1, look: cible } };
        break;
      }
      if (Cl) break;
    }
    if (!Cl) Cl = { de: { pos: best.P1, look: cible }, a: { pos: best.P1, look: cible } };
    return { B: { de: { pos: best.P0, look: haut }, a: { pos: best.P1, look: haut } }, C: Cl, a: best.a };
  },

  // ---------------------------------------------------------------- dedans
  // dans l'emprise du bâtiment (ou de la tour ronde du phare), à 0,3 m des murs
  dansPiece(w, lieu, P) {
    if (lieu.phare !== undefined) {
      const F = w.b2 && w.b2.phare;
      if (!F) return false;
      return Math.hypot(P[0] - F.x, P[2] - F.z) < (F.R[Math.min(lieu.phare, F.R.length - 1)] || 1.3) - 0.22;
    }
    const B = w.bld[lieu.bld];
    if (!B || !B.f) return true;
    const [lx, lz] = qtL(B.f, P[0], P[2]);
    return Math.abs(lx) < B.W / 2 - 0.3 && Math.abs(lz) < B.D / 2 - 0.3;
  },
  // pas dans un meuble (lit, armoire, table…) de cet étage
  horsMeubles(w, P, y0, props) { for (const q of props) if (Math.abs(q.y - y0) < 1.2 && Math.hypot(q.x - P[0], q.z - P[2]) < 0.55) return false; return true; },
  cadrerDedans(w, S) {
    const lieu = S.lieu, H = S.p, C = lieu.c, y0 = lieu.sol;
    const L = qtBlocs(w, H[0], H[2], 16), props = qtProps(w, H[0], H[2], 12);
    const he = lieu.phare !== undefined ? 1.45 : 1.6;
    const essai = (dmin, dmax, dpref, vise, pref, kp) => {
      const O = [H[0], y0 + he, H[2]];
      let best = null;
      for (let k = 0; k < 36; k++) {
        const a = k / 36 * TAU, dir = [Math.sin(a), 0, Math.cos(a)];
        const hit = qtRayon(w, L, O, dir, dmax + 0.6);
        const d = Math.min((hit ? hit.t : dmax + 0.6) - 0.4, dmax);
        if (d < dmin) continue;
        for (const dd of [d, (d + dmin) / 2]) {
          const P = [O[0] + dir[0] * dd, O[1], O[2] + dir[2] * dd];
          if (!this.dansPiece(w, lieu, P) || qtDansBloc(L, P, 0.25) || !qtSousToit(w, L, P) || !this.horsMeubles(w, P, y0, props)) continue;
          const v = [vise[0] - P[0], vise[1] - P[1], vise[2] - P[2]], dv = Math.hypot(v[0], v[1], v[2]) || 1;
          if (qtRayon(w, L, P, [v[0] / dv, v[1] / dv, v[2] / dv], dv - 0.3)) continue;
          const v2 = [H[0] - P[0], H[1] - P[1], H[2] - P[2]], d2 = Math.hypot(v2[0], v2[1], v2[2]) || 1;
          const voitH = !qtRayon(w, L, P, [v2[0] / d2, v2[1] / d2, v2[2] / d2], d2 - 0.2);
          const sc = -Math.abs(dd - dpref) + (voitH ? 1 : 0) - (pref !== undefined ? Math.abs(angDiff(a, pref)) * (kp || 0.25) : 0) - k * 0.0003;
          if (!best || sc > best.sc) best = { sc, P, a };
          break;
        }
      }
      return best;
    };
    let large = null;
    if (lieu.vue) {
      const P = lieu.vue.pos, T = lieu.vue.look, v = [T[0] - P[0], T[1] - P[1], T[2] - P[2]], dv = Math.hypot(v[0], v[1], v[2]) || 1;
      if (this.dansPiece(w, lieu, P) && !qtDansBloc(L, P, 0.25) && qtSousToit(w, L, P) && !qtRayon(w, L, P, [v[0] / dv, v[1] / dv, v[2] / dv], dv - 0.4)) large = { P, a: Math.atan2(P[0] - H[0], P[2] - H[2]), look: T };
    }
    if (!large) large = essai(1.6, 7.5, lieu.phare !== undefined ? 2.2 : 4.2, C) || essai(0.9, 4, 1.6, C);
    const pres = (lieu.face !== undefined ? essai(0.9, 2.4, 1.6, H, lieu.face, 1.2) : null) || essai(0.8, 2.4, 1.5, H, large ? large.a : undefined) || large;
    if (!large) return null;
    const CL = large.look || C;
    const vers = (P, T, k) => [P[0] + (T[0] - P[0]) * k, P[1] + (T[1] - P[1]) * k * 0.3, P[2] + (T[2] - P[2]) * k];
    const libre = (P) => this.dansPiece(w, lieu, P) && !qtDansBloc(L, P, 0.22) && this.horsMeubles(w, P, y0, props);
    const P1 = vers(large.P, CL, large.look ? 0.12 : 0.18), Q1 = vers(pres.P, H, 0.15);
    return {
      B: { de: { pos: large.P, look: CL }, a: { pos: libre(P1) ? P1 : large.P, look: CL } },
      C: { de: { pos: pres.P, look: H }, a: { pos: libre(Q1) ? Q1 : pres.P, look: H } },
      a: large.a,
    };
  },
  // les lumières d'une scène : sur l'endroit, et une douce derrière la caméra (dedans) ; de la lune, la nuit (dehors)
  lumieres(S, cad, h) {
    const H = S.p, nuit = h >= 20.2 || h < 5.6, out = [];
    // le feu du phare, « déjà allumé » : devant la chambre de verre, du côté de la caméra
    const lp = S.lieu.lampe;
    if (lp && !S.lieu.dedans) {
      const P = cad.B.de.pos, dx = P[0] - lp[0], dz = P[2] - lp[2], d = Math.hypot(dx, dz) || 1;
      out.push({ x: lp[0] + dx / d * 2.2, y: lp[1] + 0.2, z: lp[2] + dz / d * 2.2, r: 6.5, c: [1.5, 1.0, 0.5], d: 0 });
    }
    if (S.lieu.dedans) {
      // (la nuit, une chandelle : plus sourd, plus orangé)
      out.push(nuit ? { x: H[0], y: H[1] + 0.7, z: H[2], r: 4.6, c: [0.82, 0.52, 0.26], d: 0 } : { x: H[0], y: H[1] + 0.9, z: H[2], r: 5.5, c: [0.95, 0.76, 0.5], d: 0 });
      const P = cad.B.de.pos;
      out.push({ x: P[0], y: P[1] + 0.3, z: P[2], r: nuit ? 4.5 : 6.5, c: nuit ? [0.26, 0.2, 0.14] : [0.45, 0.44, 0.42], d: 0 });
      const C = S.lieu.c;
      if (Math.hypot(C[0] - H[0], C[2] - H[2]) > 2) out.push({ x: C[0], y: C[1] + 0.8, z: C[2], r: 5, c: nuit ? [0.7, 0.42, 0.2] : [0.6, 0.5, 0.36], d: 0 });
    } else if (nuit) {
      out.push({ x: H[0], y: H[1] + 2.4, z: H[2], r: 11, c: [0.22, 0.25, 0.34], d: 0 });
      const C = S.lieu.c;
      out.push({ x: C[0], y: C[1] + 3, z: C[2], r: S.lieu.loin ? 28 : 18, c: [0.15, 0.17, 0.23], d: 0 });
    } else if (h >= 17.6) {
      // (au crépuscule, l'endroit précis garde un peu de jour, du côté d'où on le regarde)
      out.push({ x: H[0], y: H[1] + 2.6, z: H[2], r: 9, c: [0.3, 0.27, 0.25], d: 0 });
      const Q = cad.C.de.pos, dq = Math.hypot(Q[0] - H[0], Q[2] - H[2]);
      out.push({ x: (Q[0] + H[0]) / 2, y: Q[1] + 0.6, z: (Q[2] + H[2]) / 2, r: dq + 2.5, c: [0.36, 0.32, 0.28], d: 0 });
    }
    return out;
  },
  cadrer(id, i) {
    const w = qtMonde(), k = id + ':' + i, S = quetes.spec(k);
    if (!w || !S || !S.lieu) return null;
    const c = this.cadres[k];
    if (c && c.w === w) return c;
    const E = QT_QUETES[id].etapes[i];
    let cad = null;
    try { cad = S.lieu.dedans ? this.cadrerDedans(w, S) : this.cadrerDehors(w, S, E.heure); } catch (e) { console.error('quetes : cadrage ' + k, e); }
    if (!cad) return null;
    return (this.cadres[k] = Object.assign({ w, S, h: E.heure }, cad));
  },

  // ---------------------------------------------------------------- l'étape i : le lieu, puis l'endroit
  etape(id, i, apresIndice) {
    const E = QT_QUETES[id] && QT_QUETES[id].etapes[i];
    if (!E || cine.on) return Promise.resolve(false);
    const M = [{ dur: 5.8, texte: E.plans[0] }, { dur: 5.4, texte: E.plans[1] }, { dur: 1.2, fondu: 'noir' }, { dur: 0.5, fondu: 'noir' }];
    let pret = false, ok = false;
    const off = () => this.lumiere(null);
    // (le cadrage se calcule une fois l'écran noir : quelques dizaines de millisecondes)
    const preparer = () => {
      if (pret) return;
      pret = true;
      const V = this.cadrer(id, i);
      if (!V) { for (const m of M) { m.dur = 0.01; m.texte = ''; } return; }
      ok = true;
      const on = () => { this.lumiere({ h: E.heure, dedans: !!E.dedans, lum: this.lumieres(V.S, V, E.heure) }); this.montre = id + ':' + i; farm.dirtyProps = true; }, retour = this.vueJoueur();
      Object.assign(M[0], { de: V.B.de, a: V.B.a, debut: on });
      Object.assign(M[1], { de: V.C.de, a: V.C.a, debut: on });
      Object.assign(M[2], { de: V.C.a });
      Object.assign(M[3], { de: retour, debut: off, fin: off });
    };
    const d0 = apresIndice ? 1.8 : 1.4;
    return cine.jouer([
      { dur: d0, de: this.vueJoueur(), fondu: 'noir', texte: E.nom + '.', chaque: (t) => { if (t > d0 - 0.15) preparer(); }, fin: preparer },
      ...M,
    ], { apres: off }).then(() => ok);
  },
  // le dernier plan : le dernier lieu, la fin choisie (le matin d'après, ou le soir même)
  epilogue(id, k) {
    const D = QT_QUETES[id], n = D.etapes.length - 1, C = D.fin.choix.find((c) => c.k === k);
    const V = this.cadrer(id, n);
    if (!V || !C || cine.on) return null;
    const h = { t1: k === 'a' ? 8.2 : 23.8, t2: 1.5, t3: 16.5, t4: 18.2, t5: 5.6 }[id] || 12;
    const lum = this.lumieres(V.S, V, h);
    if (id === 't2' && k === 'a') lum.length = 0;                          // la lanterne éteinte
    const off = () => this.lumiere(null), on = () => { this.lumiere({ h, dedans: !!D.etapes[n].dedans, lum }); this.montre = id + ':' + n; }, retour = this.vueJoueur();
    return cine.jouer([
      { dur: 1.0, de: this.vueJoueur(), fondu: 'noir' },
      { dur: 7.2, de: V.B.a, a: V.B.de, texte: C.texte, debut: on },
      { dur: 1.2, de: V.B.de, fondu: 'noir' },
      { dur: 0.5, de: retour, fondu: 'noir', debut: off, fin: off },
    ], { apres: off });
  },
};

// ---------------------------------------------------------------- branchements
// la lumière d'une scène : son ciel, ses lumières ; ni pluie ni effets d'écran (le rendu seul)
HOOKS.load.push(() => {
  if (!game.renderer || game.renderer._qtScenes) return;
  game.renderer._qtScenes = true;
  const _r = game.renderer.render.bind(game.renderer);
  game.renderer.render = function (o) {
    const M = qtScenes.mem;
    if (M && cine.on && o) {
      o.sky = M.sky; o.fx = [0, 0, 0, 0]; o.tint = [0, 0, 0, 0]; o.glitch = [0, 0, 0, 0];
      o.rain = 0; o.snow = 0; o.moon2 = 0; o.shadowA = 0.32 * (0.35 + M.sky.day * 0.65);
    }
    return _r(o);
  };
});
HOOKS.lights.push(() => (qtScenes.mem && cine.on ? qtScenes.mem.lum : []));
// un habitant planté devant la caméra (ou sur l'endroit montré) : effacé le temps du plan, il revient après
{
  const _d = npcs.draw.bind(npcs);
  npcs.draw = function (buf, sbuf, cam, t, maxD) {
    const P = qtScenes.mem && cine.on && cine.plans && cine.plans[cine.i];
    const V = P && ((P.a && P.a.look) || (P.de && P.de.look));
    if (!V || !cam) return _d(buf, sbuf, cam, t, maxD);
    const caches = [], dx = V[0] - cam[0], dy = V[1] - cam[1], dz = V[2] - cam[2], L2 = dx * dx + dz * dz || 1e-9;
    for (const n of this.list) {
      if (n.vanished || n.state === 'gone' || !isFinite(n.x)) continue;
      const t0 = clamp(((n.x - cam[0]) * dx + (n.z - cam[2]) * dz) / L2, 0, 1.1);
      const px = cam[0] + dx * t0 - n.x, pz = cam[2] + dz * t0 - n.z, y = cam[1] + dy * Math.min(t0, 1);
      if (Math.hypot(px, pz) < 0.85 && y > n.y - 0.4 && y < n.y + 2.2) { n.vanished = true; caches.push(n); }
    }
    try { return _d(buf, sbuf, cam, t, maxD); } finally { for (const n of caches) n.vanished = false; }
  };
}
HOOKS.load.push(() => { qtScenes.lumiere(null); qtScenes.cadres = {}; });
HOOKS.update.push(() => { if (qtScenes.mem && !cine.on) qtScenes.lumiere(null); });
