// ============================================================================
//  LES SCÈNES DES QUÊTES (agent Q20B, vingtième vague) — 2a. LES OUTILS DU LOT 2
//  Les quêtes de Q16 (05-zzzzzzQ16-quetes.js) : les secondes quêtes des
//  habitants, celles des autres (la diseuse, le violoneux… les bêtes qui
//  parlent, ceux du Dessous), les gens de Basse-Fosse. Beaucoup se jouent
//  ailleurs que sous le ciel de la vallée : sous terre (les halles des nains,
//  la Gobelinière, la cave des Murés), au Dessous, dans la Zone (Basse-Fosse,
//  Hautguet), au pays des bonbons, dans la cité. Ce fichier apprend au cadre
//  (11-zzzzzzzzzzQ20-0-cadre.js, qu'il ne touche pas) :
//  - LES MONDES : def.monde (une clé, ou { demande: 'dessous', tournant:
//    'vallee', … }, ou fn(moment)) dit où se joue chaque moment ; une scène
//    attend que le joueur y soit, au premier moment calme, ou saute aux
//    souvenirs comme les autres (trop vieille, la quête a changé) ; celles
//    qu'on peut jouer là où l'on est passent devant dans la file ; dans la
//    Zone, la file avance et les acteurs se dessinent (zone.sur) ; une scène
//    d'ailleurs ne se revoit (Souvenirs) que là-bas ;
//  - LA LUMIÈRE d'ailleurs : le ciel du monde où l'on est (la nuit d'une
//    cave, le rose des bonbons), pas celui de la vallée à l'heure dite ;
//  - LES CAMÉRAS SOUS TERRE : le cadre cherche ses caméras au-dessus du
//    relief ; sous terre (deux mètres sous le relief, ou au Dessous, entre son
//    sol et sa voûte), elles se cherchent entre les blocs : ni dans un mur, un
//    sol dessous, une voûte dessus, rien entre elles et ce qu'elles visent ;
//  - DES ACTEURS EN PLUS : une silhouette à squelette propre (le roi Sucre),
//    une figure posée à sa façon (une bête qui parle, la vieille des
//    gobelins), une réplique au nom de qui parle (les autres ne sont pas des
//    habitants) ; et les vrais (bêtes, gens d'en bas, figures de la place)
//    cachés le temps de la scène.
//  API (contrat $SP/eq/contrat-v20.md, section Q20B) : q20B (ici(), mondeDe(id, m),
//  masque), q20.horsVallee(id, m) ; Q20Scene.prototype : parole, figure, rigActeur,
//  masquer, sous, solSous ; Q20B (outils des scènes du lot).
// ============================================================================

// ---------------------------------------------------------------- les lieux sous terre de la vallée (une clé de monde chacun)
const Q20B_SOUS = { nains: { lm: 'nains', r: 70 }, cave: { lm: 'sout_cave', r: 26 } };

const q20B = {
  masque: new Set(),   // les vrais (bêtes, gens d'en bas, figures) cachés pendant la scène : 'bete:chat', 'v5:gardien_5'…
  voulu: null,         // le monde d'une scène qu'on revoit (Souvenirs)
  ctx: null,           // le contexte de la dernière scène construite

  // ------------------------------------------------------------- où est le joueur
  // 'vallee' | 'nains' | 'cave' | 'gobeliniere' | 'dessous' | 'basse_fosse' | 'hautguet' | 'zone' | 'bonbons' | 'vaisseau' | 'ailleurs'
  ici() {
    const p = game.player, w = game.world;
    if (!p || !w || !farm.s) return 'ailleurs';
    try {
      if (typeof zone !== 'undefined' && zone.dedans) {
        if (typeof catacombesV5 !== 'undefined' && catacombesV5.enVille && (catacombesV5.enVille(p.pos) || (catacombesV5.auDegre && catacombesV5.auDegre(p.pos)))) return 'basse_fosse';
        if (zone.chateau && chateauV4.Z && (zone.chateau.dedans(p.pos) || Math.hypot(p.pos[0] - chateauV4.Z.cx, p.pos[2] - chateauV4.Z.cz) < V4_RAYON)) return 'hautguet';
        return 'zone';
      }
      const cur = typeof mondes !== 'undefined' && (mondes.cur || (mondes.actuel && mondes.actuel()));
      if (cur) return cur === 'bonbons' || cur === 'vaisseau' ? cur : 'ailleurs';
      if (typeof strange !== 'undefined' && strange.inEnvers && strange.inEnvers()) return 'ailleurs';
      if (typeof souterrain !== 'undefined' && souterrain.actif) return 'dessous';
      if (p.underground) {
        if (typeof gobelins !== 'undefined' && (gobelins.dans || (gobelins.dansLeVillage && gobelins.dansLeVillage()))) return 'gobeliniere';
        for (const k in Q20B_SOUS) { const L = w.lm && w.lm[Q20B_SOUS[k].lm]; if (L && Math.hypot(p.pos[0] - L.x, p.pos[2] - L.z) < Q20B_SOUS[k].r) return k; }
        return 'ailleurs';
      }
    } catch (e) { return 'ailleurs'; }
    return 'vallee';
  },
  // le monde d'un moment d'une quête ('fin:1' : sinon celui de 'fin')
  mondeDe(id, m) {
    const D = q20.defs[id], M = D && D.monde;
    if (!M) return 'vallee';
    if (typeof M === 'string') return M;
    if (typeof M === 'function') { try { return M(m) || 'vallee'; } catch (e) { return 'vallee'; } }
    return M[m] || M[String(m).split(':')[0]] || M.tout || 'vallee';
  },
  // un monde sous terre (les caméras s'y cherchent autrement) ; le Dessous a son relief à lui
  sousTerre(M) { return M !== 'vallee' && M !== 'bonbons' && M !== 'hautguet'; },
  // la première scène que la file regarde (celle dont le cadre demande si l'on est au calme)
  entree() {
    const S = q20.S();
    if (!S) return null;
    for (const e of S.file) if (!(e.d > 0)) return e;
    return null;
  },
  // les vrais qu'on montre en acteurs : cachés le temps de la scène
  cache(k) { return !!(q20.joue && cine.on && this.masque.has(k)); },
};
if (typeof window !== 'undefined') window.prairieQ20B = q20B;

// ---------------------------------------------------------------- le cadre, sans le toucher : les mondes
{
  // un moment d'ailleurs : seulement quand le joueur y est (le reste du calme, le cadre le demande comme toujours)
  const _dv = q20.dansVallee.bind(q20);
  q20.dansVallee = function () {
    let M = q20B.voulu;
    if (!M) { const e = q20B.entree(); M = e ? q20B.mondeDe(e.id, this.resoudre(e.id, e.m)) : 'vallee'; }
    if (M === 'vallee') return _dv();
    return q20B.ici() === M;
  };
  // celles qu'on peut jouer là où l'on est passent devant (l'ordre de la file, sinon, ne change pas)
  const _av = q20.avancer.bind(q20);
  q20.avancer = function (dt) {
    const S = this.S();
    if (S && S.file.length > 1) {
      const ici = q20B.ici(), A = [], B = [];
      for (const e of S.file) (q20B.mondeDe(e.id, this.resoudre(e.id, e.m)) === ici ? A : B).push(e);
      if (A.length && B.length && S.file[0] !== A[0]) { S.file.length = 0; S.file.push(...A, ...B); }
    }
    return _av(dt);
  };
  // revoir (Souvenirs) une scène d'ailleurs : seulement là-bas
  const _rj = q20.rejouer.bind(q20);
  q20.rejouer = function (id, m) {
    const M = q20B.mondeDe(id, m);
    q20B.voulu = M;
    try { return _rj(id, m); } finally { q20B.voulu = null; }
  };
  // le contexte de la scène qu'on va jouer (ses vrais à cacher)
  const _co = q20.construire.bind(q20);
  q20.construire = function (id, m, o) {
    const r = _co(id, m, o);
    q20B.ctx = (r && r.ctx) || null;
    return r;
  };
  const _ca = q20.cacher.bind(q20), _mo = q20.montrer.bind(q20);
  q20.cacher = function (ids) {
    _ca(ids);
    q20B.masque.clear();
    const c = q20B.ctx;
    if (c && c._masque) for (const k of c._masque) q20B.masque.add(k);
  };
  q20.montrer = function () { _mo(); q20B.masque.clear(); };
  // un squelette propre (A.fabrique : le roi Sucre, un pâle au bandeau) : fait une fois par scène
  const _rig = q20.rig.bind(q20);
  q20.rig = function (A) {
    if (A && A.fabrique) {
      const R = this._rigs || (this._rigs = {}), k = 'f:' + (A.cle || 'x') + (A.main ? ':' + A.main : '');
      if (!R[k]) { try { R[k] = A.fabrique(); } catch (e) { console.error(e); R[k] = humanRig(A.look || {}); } }
      return R[k];
    }
    return _rig(A);
  };
  // pour l'équilibrage (Q20.js ne vérifie dans la vallée que ce qui s'y joue ; Q20B.js, le reste, dans son monde)
  q20.horsVallee = (id, m) => q20B.mondeDe(id, m) !== 'vallee';
}

// ---------------------------------------------------------------- dans la Zone : la file avance, les acteurs se dessinent
if (typeof zone !== 'undefined' && zone.sur) {
  zone.sur('update', (dt) => q20.update(dt));
  zone.sur('draw', (buf, sbuf, cam, t) => { if (q20.joue && cine.on) q20.dessiner(buf, sbuf, cam, t); });
  zone.sur('lights', () => (qtScenes.mem && cine.on && q20.joue ? qtScenes.mem.lum : []));
}

// ---------------------------------------------------------------- la lumière d'ailleurs : le ciel du monde où l'on est
{
  const _lum = qtScenes.lumiere.bind(qtScenes);
  qtScenes.lumiere = function (o) {
    const r = _lum(o);
    if (o && this.mem && q20.joue && q20B.mondeDe(q20.joue.id, q20.joue.m) !== 'vallee') this.mem.vivant = true;
    return r;
  };
  HOOKS.load.push(() => {
    if (!game.renderer || game.renderer._q20B) return;
    game.renderer._q20B = true;
    const _r = game.renderer.render.bind(game.renderer);
    game.renderer.render = function (o) {
      const M = qtScenes.mem;
      if (M && M.vivant && cine.on && o && o.sky) M.sky = o.sky;
      return _r(o);
    };
  });
}

// ---------------------------------------------------------------- les vrais, cachés pendant leur scène
HOOKS.load.push(() => {
  if (q20B._branche) return;
  q20B._branche = true;
  // une bête qui parle (entité de betesParlantes)
  if (typeof betesParlantes !== 'undefined' && betesParlantes.dessiner) {
    const _d = betesParlantes.dessiner.bind(betesParlantes);
    betesParlantes.dessiner = function (buf, sbuf, cam, maxD, t, flags) {
      if (!q20B.masque.size || !q20.joue) return _d(buf, sbuf, cam, maxD, t, flags);
      const L = this.vivantes.filter((e) => q20B.cache('bete:' + e.bp) && !e.hidden);
      for (const e of L) e.hidden = true;
      try { return _d(buf, sbuf, cam, maxD, t, flags); } finally { for (const e of L) e.hidden = false; }
    };
  }
  // les gens d'en bas (Basse-Fosse)
  if (typeof habitantsV5 !== 'undefined' && habitantsV5.draw) {
    const _d = habitantsV5.draw.bind(habitantsV5);
    habitantsV5.draw = function (buf, sbuf, cam, t) {
      if (!q20B.masque.size || !q20.joue) return _d(buf, sbuf, cam, t);
      const L0 = this.L;
      this.L = L0.filter((e) => !q20B.cache('v5:' + e.id));
      try { return _d(buf, sbuf, cam, t); } finally { this.L = L0; }
    };
  }
  // ceux du Dessous
  if (typeof soutTerres !== 'undefined') {
    for (const nom of ['dessiner', 'draw']) {
      if (typeof soutTerres[nom] !== 'function') continue;
      const _d = soutTerres[nom].bind(soutTerres);
      soutTerres[nom] = function (...a) {
        if (!q20B.masque.size || !q20.joue) return _d(...a);
        const L0 = this.list;
        this.list = L0.filter((e) => !q20B.cache('sout:' + e.k));
        try { return _d(...a); } finally { this.list = L0; }
      };
    }
  }
  // les figures de la place (le crieur, le violoneux, la diseuse)
  if (typeof activites !== 'undefined' && activites.figure) {
    const _f = activites.figure.bind(activites);
    const K = { crieur: 'crieur', violon: 'violoneux', diseuse: 'diseuse' };
    activites.figure = function (buf, sbuf, k, ...a) { if (K[k] && q20B.cache(K[k])) return; return _f(buf, sbuf, k, ...a); };
  }
  // le marchand de joie
  if (typeof pilules !== 'undefined' && pilules.dessinerMarchand) {
    const _d = pilules.dessinerMarchand.bind(pilules);
    pilules.dessinerMarchand = function (...a) { if (q20B.cache('marchand_joie')) return; return _d(...a); };
  }
  // le voiturier, sa charrette, sa jument (sa tournée du matin) : la scène les montre elle-même
  if (typeof commandes !== 'undefined' && commandes.dessiner) {
    const _d = commandes.dessiner.bind(commandes);
    commandes.dessiner = function (...a) {
      if (!q20B.cache('voiturier') || !this.tour) return _d(...a);
      const T = this.tour;
      this.tour = null;
      try { return _d(...a); } finally { this.tour = T; }
    };
  }
  // Thibaud, au treuil
  if (typeof chateauV4 !== 'undefined' && chateauV4.dessiner) {
    const _d = chateauV4.dessiner.bind(chateauV4);
    chateauV4.dessiner = function (...a) { if (q20B.cache('thibaud')) return; return _d(...a); };
  }
});
// ceux qu'on remplace par un acteur et qui se cachent d'un drapeau (la vieille des gobelins, le roi Sucre) : le
// drapeau posé quand la scène commence, ôté quand elle finit
q20B.cacheurs = {
  aieule: () => { const e = typeof gobelins !== 'undefined' && gobelins.aieuleE; if (!e || e.hidden) return null; e.hidden = true; return () => { e.hidden = false; }; },
  roi_sucre: () => {
    const L = typeof mondes !== 'undefined' && Array.isArray(mondes.betes) ? mondes.betes.filter((e) => e.kind === 'roi_sucre' && !e.cache) : [];
    for (const e of L) e.cache = true;
    return L.length ? () => { for (const e of L) e.cache = false; } : null;
  },
  // Mère Ysaure : sa tente ouverte le temps de la scène (elle y est assise), même si la scène se joue après sept heures
  // du soir ; refermée après, si elle doit l'être
  diseuse: () => {
    if (typeof b1 === 'undefined' || !b1.tente || typeof activites === 'undefined' || !activites.diseusePresente || activites.diseusePresente()) return null;
    q20B.tente = true;
    b1.tente(true);
    return () => { q20B.tente = false; b1.tente(true); };
  },
};
if (typeof activites !== 'undefined' && activites.diseusePresente) {
  const _dp = activites.diseusePresente;
  activites.diseusePresente = function () { return !!q20B.tente || _dp.apply(this, arguments); };
}
q20B.rendre = [];
{
  const _ca = q20.cacher, _mo = q20.montrer;
  q20.cacher = function (ids) {
    _ca.call(this, ids);
    for (const k of q20B.masque) { const f = q20B.cacheurs[k]; if (f) { try { const r = f(); if (r) q20B.rendre.push(r); } catch (e) { console.error(e); } } }
  };
  q20.montrer = function () {
    for (const r of q20B.rendre.splice(0)) { try { r(); } catch (e) { console.error(e); } }
    _mo.call(this);
  };
}

// ============================================================================
//  LE CONTEXTE D'UNE SCÈNE : ce qu'il faut en plus (Q20Scene.prototype)
// ============================================================================
Object.defineProperty(Q20Scene.prototype, 'monde', { get() { return q20B.mondeDe(this.id, this.moment); }, configurable: true });
// sous terre ? (les caméras se cherchent entre les blocs) ; au Dessous : son relief (sol, voûte)
Object.defineProperty(Q20Scene.prototype, 'sous', { get() { return q20B.sousTerre(this.monde); }, configurable: true });
Object.assign(Q20Scene.prototype, {
  // une réplique au nom de qui parle (un des autres : ce n'est pas un habitant) ; voix : le ton du marmonnement
  parole(texte, nom, voix) {
    let t = String(texte || '');
    try { t = fmtLine(t, null); } catch (e) { /* (hors partie) */ }
    return { texte: t, qui: nom || '', voix: voix || null };
  },
  // un vrai à cacher le temps de la scène ('bete:chat', 'v5:gardien_5', 'sout:un', 'crieur', 'aieule'…)
  masquer(k) { (this._masque || (this._masque = new Set())).add(k); return this; },
  // une silhouette à squelette propre : fabrique() rend le squelette (posé comme un homme : poseHuman)
  rigActeur(cle, fabrique, P, o) {
    if (!P) return null;
    return this.acteur(Object.assign({ k: 'h', cle, fabrique, look: {}, s: 1, P }, o));
  },
  // une figure qui se pose à sa façon (une bête qui parle, la vieille des gobelins) : fabrique() rend le squelette,
  // pose(r, st, t) le pose ; o.dy : un décalage en hauteur ; o.cap, o.face comme les acteurs
  figure(fabrique, pose, P, o) {
    if (!P) return null;
    o = o || {};
    const A = this.acteur(Object.assign({ k: 'c', P, r: 0, vu: false }, o));
    let rig = null;
    A.dessin = (PE, tp, t) => {
      if (!rig) rig = fabrique();
      if (!rig) return;
      const st = Object.assign({ move: 0, phase: 0, t, lookY: 0 }, typeof o.st === 'function' ? o.st(tp) : o.st || {});
      const dy = pose(rig, st, t) || 0;
      drawRig(PE.buf, rig, A.P[0], A.P[1] + dy + (o.dy || 0), A.P[2], A.cap || 0, o.s || 1, A.lueur ? FX_HI : 0);
    };
    return A;
  },
  // le sol sous (x, z) là où se joue la scène : au Dessous, son sol ; sous terre, le bloc sous y ; sinon le cadre
  solSous(x, z, y) {
    const w = this.w;
    if (this.monde === 'dessous' && typeof souterrain !== 'undefined') return souterrain.floorAt(x, z);
    // (le plus haut dessus de bloc à moins de 0,6 m au-dessus de y : le sol d'une cave basse, pas sa voûte)
    if (y !== undefined && this.sous && y < w.heightAt(x, z) - 2) { const g = w.groundAt(x, z, y + 0.3, 0.3); return g > -1e8 ? g : y; }
    return this.sol(x, z, y);
  },
  ptSous(x, z, y) { return [x, this.solSous(x, z, y), z]; },
  // ---------------------------------------------------------------- sous terre : un point libre, une vue
  // libre : ni dans un bloc, un sol sous lui (0,7 à 6 m), une voûte au-dessus ; au Dessous : entre son sol et sa voûte
  libreSous(L, P) {
    const w = this.w;
    if (this.monde === 'dessous' && typeof souterrain !== 'undefined' && souterrain.dansRegion(P[0], P[2])) {
      const f = souterrain.floorAt(P[0], P[2]), v = souterrain.vaultAt(P[0], P[2]);
      if (f > SOUT_ROCK - 1 || P[1] < f + 0.75 || P[1] > v - 0.45 || P[1] < SOUT_WL + 0.5) return false;
      return !qtDansBloc(L, P, 0.3);
    }
    // à l'air libre (une cour, un chemin de la Zone) : comme dehors
    if (P[1] > w.heightAt(P[0], P[2]) - 2) return qtScenes.libreDehors(w, L, P);
    if (qtDansBloc(L, P, 0.3)) return false;
    const g = w.groundAt(P[0], P[2], P[1], 0);
    if (!(g > -1e8) || P[1] - g < 0.7 || P[1] - g > 7) return false;
    return !!qtRayon(w, L, P, [0, 1, 0], 40);
  },
  // A voit B (blocs ; au Dessous : le relief aussi ; à l'air libre : comme dehors) ; on s'arrête à stop mètres de B
  voitSous(L, A, B, stop) {
    const w = this.w;
    if (A[1] > w.heightAt(A[0], A[2]) - 2 && B[1] > w.heightAt(B[0], B[2]) - 2 && this.monde !== 'dessous') return qtScenes.voit(w, L, A, B, stop);
    const dx = B[0] - A[0], dy = B[1] - A[1], dz = B[2] - A[2], D = Math.hypot(dx, dy, dz), Lm = D - (stop || 0);
    if (Lm <= 0.4) return true;
    if (this.monde === 'dessous' && typeof souterrain !== 'undefined') {
      const n = Math.ceil(Lm / 0.8);
      for (let k = 1; k < n; k++) {
        const t = (k / n) * Lm / D, x = A[0] + dx * t, y = A[1] + dy * t, z = A[2] + dz * t;
        if (y < souterrain.floorAt(x, z) + 0.05 || y > souterrain.vaultAt(x, z) - 0.05) return false;
      }
    }
    return !qtRayon(w, L, A, [dx / D, dy / D, dz / D], Lm);
  },
});
{
  // les caméras du cadre, sous terre : la même recherche (autour de la cible, plus près, plus loin), d'autres règles
  const _ch = Q20Scene.prototype.cherche0, _gl = Q20Scene.prototype.glisse, _rg = Q20Scene.prototype.camRegard, _cc = Q20Scene.prototype.camChemin;
  Q20Scene.prototype.cherche0 = function (T, d, haut, a0, o) {
    if (!this.sous) return _ch.call(this, T, d, haut, a0, o);
    o = o || {};
    const L = this.blocs(T, d * 1.6 + 12), n = o.n || 36, pas = o.pas || TAU / 36;
    const Ds = o.ds || [d, d * 0.82, d * 1.22, d * 0.66, d * 1.5, d * 0.5];
    // (le sol sous la cible, puis, autour, le sol à hauteur de pas de celui-là)
    const f0 = this.solSous(T[0], T[2], T[1]);
    for (const hh of [haut, Math.max(1.1, haut * 0.7), haut * 1.35]) {
      for (let k = 0; k < n; k++) {
        const a = a0 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * pas;
        for (const dd of Ds) {
          const x = T[0] + Math.sin(a) * dd, z = T[2] + Math.cos(a) * dd;
          const P = [x, this.solSous(x, z, f0 + 0.5) + hh, z];
          try {
            if (!this.libreSous(L, P) || !this.voitSous(L, P, T, o.stop ?? 0.35)) continue;
            if (o.aussi && !o.aussi.every((Q) => this.voitSous(L, P, Q, 0.35))) continue;
          } catch (e) { continue; }
          return { P, a, d: dd, toit: true };
        }
      }
    }
    this.repli++;
    return { P: [T[0] + Math.sin(a0) * 1.2, T[1] + 0.4, T[2] + Math.cos(a0) * 1.2], a: a0, d, repli: true };
  };
  Q20Scene.prototype.glisse = function (P, T, o) {
    if (!this.sous || (o && o.dedans)) return _gl.call(this, P, T, o);
    o = o || {};
    const k = o.recul !== undefined ? o.recul : 0.12, g = o.glisse || 0, m = o.monte || 0;
    if (!k && !g && !m) return P;
    const dx = T[0] - P[0], dz = T[2] - P[2], D = Math.hypot(dx, dz) || 1, rx = dz / D, rz = -dx / D;
    const Q = [P[0] + dx * k + rx * g, P[1] + (T[1] - P[1]) * k * 0.3 + m, P[2] + dz * k + rz * g];
    const L = this.blocs(T, D + 12);
    try { if (!this.libreSous(L, Q) || !this.voitSous(L, Q, T, o.stop ?? 0.35)) return P; } catch (e) { return P; }
    return Q;
  };
  Q20Scene.prototype.camRegard = function (P, T, o) {
    if (!this.sous) return _rg.call(this, P, T, o);
    o = o || {};
    const Q = [P[0], this.solSous(P[0], P[2], P[1] + 0.3) + (o.haut ?? 1.6), P[2]];
    const L = this.blocs(Q, 14);
    let ok = true;
    try { ok = this.libreSous(L, Q) && this.voitSous(L, Q, T, 0.4); } catch (e) { ok = false; }
    if (!ok) return this.camLieu(T, { d: o.d || 8, haut: 1.6 });
    const Q2 = this.glisse(Q, T, { recul: o.recul ?? 0.06, monte: o.monte });
    return { de: { pos: Q, look: T }, a: { pos: Q2, look: o.vise2 || T }, dedans: null, vise: [], toit: true };
  };
  // les lumières d'un plan sous terre : pas de lune ; une lueur sur ce qu'on montre (la chandelle, la pierre qui luit,
  // le feu de la forge : la couleur du monde) et une douce derrière la caméra ; les lanternes tenues, et le reste
  const _lu = Q20Scene.prototype.lumieres;
  const Q20B_TEINTES = { dessous: [[0.34, 0.56, 0.44], [0.14, 0.2, 0.17]], vaisseau: [[0.42, 0.56, 0.86], [0.16, 0.2, 0.28]], gobeliniere: [[0.82, 0.56, 0.3], [0.22, 0.17, 0.12]], nains: [[0.62, 0.66, 0.82], [0.2, 0.2, 0.24]] };
  Q20Scene.prototype.lumieres = function (h, cam, acteurs, extra) {
    if (!this.sous || cam.dedans) return _lu.call(this, h, cam, acteurs, extra);
    const T = (cam.vise && cam.vise[0]) || (cam.de && cam.de.look) || (cam.chemin && cam.chemin[0].look);
    const Pc = (cam.de && cam.de.pos) || (cam.chemin && cam.chemin[0].pos);
    const [cA, cB] = Q20B_TEINTES[this.monde] || [[0.86, 0.6, 0.34], [0.24, 0.19, 0.14]];
    const out = [];
    if (T) out.push({ x: T[0], y: T[1] + 0.7, z: T[2], r: 4.6, c: cA, d: 0 });
    if (Pc) out.push({ x: Pc[0], y: Pc[1] + 0.3, z: Pc[2], r: 5, c: cB, d: 0 });
    for (const A of acteurs || []) if (A.lanterne || A.main === 'lanterne' || (A.look && A.look.held === 'lanterne' && A.tient !== false)) {
      const P = A.vers || A.P;
      out.push({ x: P[0], y: P[1] + 1.25, z: P[2], r: 7, c: [1.0, 0.72, 0.38], d: 0 });
    }
    return out.concat((extra || []).filter(Boolean));
  };
  Q20Scene.prototype.camChemin = function (cles, o) {
    if (!this.sous) return _cc.call(this, cles, o);
    const ok = cles.filter((c) => { try { return this.libreSous(this.blocs(c.look, Math.hypot(c.look[0] - c.pos[0], c.look[2] - c.pos[2]) + 10), c.pos); } catch (e) { return false; } });
    if (ok.length >= 2) return { chemin: ok, dedans: null, vise: [ok[ok.length - 1].look], toit: true };
    this.repli++;
    const c = ok[0] || cles[0];
    return { de: c, a: c, dedans: null, vise: [c.look], repli: true };
  };
}

// ============================================================================
//  LES OUTILS DES SCÈNES DU LOT (Q20B) : ceux qui parlent sans être des habitants
// ============================================================================
// leurs silhouettes (celles de leurs modules, quand ils en ont une)
Object.assign(Q20_LOOKS, {
  // le voiturier du roulage Bardin (11-zzzzA-commandes.js)
  voiturier: typeof CMD_LOOK !== 'undefined' ? CMD_LOOK : { skin: '#d2a882', hair: '#4a3a2c', hairStyle: 'court', beard: 'moustache', hat: 'chapeau', hatCol: '#2e2822', top: '#3e5a86', bottom: '#3a3228', shoe: '#1e1812', height: 1 },
  // le marchand de joie (11-zzz71-bonbons.js) : redingote verte, lanterne
  marchand_joie: { skin: '#ece2d8', hair: '#2a1a14', hairStyle: 'court', hat: 'chapeau', hatCol: '#1e3a26', top: '#2a5a3a', bottom: '#1e2a22', shoe: '#141414', coat: true, face: 'face', height: 1.08, build: 'mince', held: 'lanterne' },
  // Thibaud, au treuil de Hautguet (11-zzzzV4-2-jeu.js), sa couverture sur les épaules
  thibaud: { skin: '#c8b49c', hair: '#c8c4bc', top: '#4a4238', bottom: '#3a342c', shoe: '#2a2018', beard: 'longue', old: true, build: 'mince', hat: 'capuche', hatCol: '#3e3226' },
  // un enfant perdu, sur l'avis (le crieur) ; un homme du sixième d'août (le chevalier)
  enfant_perdu: { skin: '#e8d8c8', hair: '#6a5a4a', hairStyle: 'court', top: '#8a8478', bottom: '#5a554c', shoe: '#2a2420', hat: 'casquette', height: 0.68, build: 'mince', face: 'paleF' },
  cuirassier: { skin: '#c8ccc8', hair: '#4a4a48', hairStyle: 'court', beard: 'moustache', top: '#2a3048', bottom: '#8a2a2a', shoe: '#1a1a1a', coat: true, hat: 'casquette', hatCol: '#b8b0a0', face: 'paleF', build: 'normal' },
  // l'homme qui marche sur l'eau (le garde champêtre) ; la bête de trop (le pâtre) ; une baigneuse dans la vapeur
  sur_leau: { skin: '#cfcfd2', hair: '#2a2a2c', hairStyle: 'court', top: '#2e3034', bottom: '#26282a', shoe: '#1a1a1a', coat: true, hat: 'chapeau', hatCol: '#1a1a1c', face: 'blankF', height: 1.04, build: 'mince' },
  // les invités des quatre bols (le colporteur) : personne. La morte du cimetière (la diseuse) : une silhouette pâle
  morte: { skin: '#e2e0da', hair: '#cfcac0', hairStyle: 'long', top: '#d8d4ca', bottom: '#cfcac0', shoe: '#8a8680', dress: true, face: 'paleF', build: 'mince' },
});
// les figures de la place : celles du module des activités
if (typeof ACT_LOOKS !== 'undefined') Object.assign(Q20_LOOKS, { crieur: ACT_LOOKS.crieur, violoneux: ACT_LOOKS.violon, diseuse: ACT_LOOKS.diseuse });

const Q20B = {
  // le nom de qui parle, pour les sous-titres (le même que ses panneaux)
  nom(key) {
    try { const t = q16.titre(key); if (t) return t; } catch (e) { /* rien */ }
    const P = typeof Q16_PNJ !== 'undefined' && Q16_PNJ[key];
    return P ? q16.cap(P.nom) : key;
  },
  // le premier point libre (sol, pas dans un bloc) sur des anneaux autour de P ; sinon P
  libre(c, P, r0, r1, rad) {
    if (!P) return null;
    if (!c.sous) return Q20H.libre(c, P, r0, r1, rad);
    const L = c.blocs(P, (r1 || 6) + 4);
    try {
      for (const [x, z] of qtAnneaux(P[0], P[2], r0 || 0, r1 || 6, 0, 12)) {
        const Q = c.ptSous(x, z, P[1] + 0.5);
        if (Math.abs(Q[1] - P[1]) > 1.2 || qtDansBloc(L, c.haut(Q, 0.6), rad || 0.35) || qtDansBloc(L, c.haut(Q, 1.5), rad || 0.35)) continue;
        return Q;
      }
    } catch (e) { /* rien */ }
    return P;
  },
  // devant P (cap, d mètres, lat de côté), posé sur le sol du monde de la scène
  devant(c, P, cap, d, lat) {
    const Q = c.devant(P, cap, d, lat, true);
    Q[1] = c.solSous(Q[0], Q[2], P[1] + 0.5);
    if (!(Q[1] > -1e8) || Math.abs(Q[1] - P[1]) > 2.5) Q[1] = P[1];
    return Q;
  },
  // le joueur en face d'un acteur (au sol du monde)
  face(c, A, d, lat, o) {
    if (!A) return null;
    const P = Q20B.devant(c, A.P, A.cap, d || 1.4, lat || 0.2);
    return c.joueur(P, Object.assign({ face: A.P }, o));
  },
  // le joueur là où il est, s'il est près de L (une scène jouée sur place) ; sinon un point libre devant L
  ici(c, L, d, a) {
    const p = game.player;
    if (!L) return null;
    const P = L.P || L;
    if (!c.rejeu && p && Math.hypot(p.pos[0] - P[0], p.pos[2] - P[2]) < Math.max(30, (L.r || 10) * 1.6) && Math.abs(p.pos[1] - P[1]) < 8) return c.ptSous(p.pos[0], p.pos[2], p.pos[1] + 0.3);
    return Q20B.libre(c, Q20B.devant(c, P, a ?? 0.4, d || 9), 0, 6, 0.6);
  },
  // une bête qui parle (son squelette, sa pose à elle) : id de BP_BETES ; o.parle (elle parle), o.dort
  bete(c, id, P, o) {
    o = o || {};
    const D = typeof BP_BETES !== 'undefined' && BP_BETES[id];
    if (!D || !P) return null;
    const rig = (CREATURES[D.kind] && CREATURES[D.kind].rig) || D.kind;
    if (!ANIMAL_RIGS[rig]) return null;
    c.masquer('bete:' + id);
    const e = { bp: id, bpEtat: o.dort ? 'dort' : 'eveil', parleT: 0, dead: false, move: 0, lookY: 0, scale: D.echelle || 1 };
    return c.figure(() => ANIMAL_RIGS[rig](0), (r, st, t) => {
      e.parleT = o.parle ? 1 : 0;
      if (r.kind === 'bird') poseBird(r, st); else poseQuad(r, st);
      try { return (typeof bpPose === 'function' ? bpPose(r, e, st, t) : 0) * (D.echelle || 1); } catch (er) { return 0; }
    }, P, Object.assign({ s: D.echelle || 1 }, o));
  },
  // la place d'une bête qui parle (là où elle se tient), ou null
  lieuBete(id) { try { return betesParlantes.lieu(id); } catch (e) { return null; } },
  // les figures de la place (activités) : { x, y, z, h } ou null
  act(k) { const w = game.world; return (w && w.act && w.act[k]) || null; },
  // les chandelles, une lueur chaude
  flamme(c, P, r, dy) { return c.lueur(P, r || 4, [1.0, 0.66, 0.32], dy ?? 0.4); },
  // la lune sur un lieu montré de loin, la nuit (un cimetière, une crête) : L (un lieu, ou un point)
  lune(c, L) { const P = Array.isArray(L) ? L : L && (L.P || [L.x, L.y, L.z]); return P ? c.lueur(P, 26, [0.34, 0.38, 0.5], 7) : null; },
  // une lueur froide (pierre qui luit, lune dans l'eau)
  froide(c, P, r, dy) { return c.lueur(P, r || 4, [0.42, 0.7, 0.55], dy ?? 0.3); },
};
