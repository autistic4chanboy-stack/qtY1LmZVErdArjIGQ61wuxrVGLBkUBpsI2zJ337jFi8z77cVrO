// ============================================================================
//  LE HASARD DE LA VALLÉE (2) : LES BÊTES — dix événements.
//  - cigognes : un couple niche six jours sur le clocher (ou sur la grange, chez
//    qui n'a rien à se reprocher) ; elles claquent du bec ;
//  - loups_choeur : la nuit, loin des maisons, une meute chante, puis passe ;
//  - brame : au crépuscule, en forêt, deux cerfs s'affrontent ;
//  - crapauds : un soir de pluie, les crapauds traversent le chemin (on peut
//    les aider) ;
//  - etourneaux : au soir, au-dessus du lac ou du marais, un nuage d'oiseaux ;
//  - hirondelles_basses : une heure avant l'averse, elles rasent l'herbe ;
//  - chauves_souris : au crépuscule, une grotte se vide de ses chauves-souris ;
//  - chevreuil_pris : un chevreuil dans un collet, en forêt (le libérer ?) ;
//  - essaim : un essaim pend à une branche (l'enfumoir le recueille) ;
//  - renardeaux : à l'aube, une renarde et ses petits jouent devant le terrier.
//  Les bêtes de ces scènes sont des figurants (on ne les chasse pas).
// ============================================================================

// le haut d'un toit (blocs) au-dessus de (x, z), ou null
function hfToit(x, z) {
  const w = game.world, y0 = w.heightAt(x, z) + 60;
  try { const h = w.raycastBlocks([x, y0, z], [0, -1, 0], 80); if (h && h.t < 60) return y0 - h.t; } catch (e) { /* rien */ }
  return null;
}
// une bête qui vole en rond (F.vol) : centre, rayon, hauteur, vitesse angulaire
function hfTourne(F, cx, cy, cz, r, w, dt) {
  F.ang = (F.ang ?? Math.random() * TAU) + w * dt;
  F.x = cx + Math.sin(F.ang) * r; F.z = cz + Math.cos(F.ang) * r; F.y = cy + Math.sin(F.ang * 2.3) * 0.6;
  F.h = F.ang + (w > 0 ? Math.PI / 2 : -Math.PI / 2);
}

// deux yeux qui renvoient la lumière (les bêtes de la nuit)
function hfYeux(F, buf) {
  const sky = game.sky;
  if (!sky || sky.night < 0.5) return;
  PE.buf = buf; PE.fl = FX_EMIT; PE.frame(F.x, F.y, F.z, F.h, F.s || 1);
  for (const s of [-0.075, 0.075]) PE.box(s, 0.72, 0.62, 0.06, 0.045, 0.02, [1.6, 1.4, 0.55], TL.plain);
  PE.fl = 0;
}

// ---------------------------------------------------------------- 1. les cigognes (six jours)
hfDef('cigognes', {
  cat: 'betes', poids: 0.7, premier: 5, ecart: 36, fois: 3, public: true, fenetre: 6,
  peut: (c) => !c.pluieA(9, 14),
  heure: (c, r) => 9 + r * 4,
  pret: () => true,
  lancer(E) {
    const w = game.world, s = farm.s, S = hasardF.S();
    let P = null, ou = 'eglise';
    // sur la grange, chez qui n'a rien à se reprocher (une fois sur deux)
    const propre = !(s.rep && s.rep.crimes && s.rep.crimes.length);
    const G = w.farm && w.farm.barn;
    if (propre && G && Math.random() < 0.5) { const y = hfToit(G.x, G.z); if (y !== null) { P = { x: G.x, y, z: G.z }; ou = 'ferme'; } }
    if (!P) {
      const it = w.inter.find((i) => i.kind === 'bell'), B = w.bld.eglise;
      const x = B ? B.x : it ? it.x : w.townInfo.x, z = B ? B.z : it ? it.z : w.townInfo.z;
      const y = hfToit(x, z);
      P = { x, y: y !== null ? y : (B ? B.y + (B.H || 7) + 3 : w.heightAt(x, z) + 12), z };
    }
    E.long = true;
    E.L = S.long.cigognes = { d0: s.day, ou, x: P.x, y: P.y, z: P.z };
    hfCigognesInit(E);
    if (ou === 'ferme') setTimeout(() => hfPense('(Des cigognes, sur le toit de la grange. Les anciens disent que ça porte bonheur à la maison.)', 4.5), 2500);
  },
  restaurer(L) { const E = { L, long: true }; hfCigognesInit(E); return E; },
  chaqueJour(L, d, E) {
    if (d - L.d0 >= 6) { delete hasardF.S().long.cigognes; if (E) hasardF.arreter(E, 'fin'); return; }
    hasardF.retenir('cigognes');
  },
  fin(E) { const S = hasardF.S(); if (S.long.cigognes === E.L) delete S.long.cigognes; },
  maj(E, dt, eye) {
    const L = E.L, h = npcs.hour(), nuit = h < 6.5 || h > 20.5, [A, B] = E.oiseaux;
    // l'une couve, l'autre tourne au-dessus du village et revient
    A.x = L.x + 0.25; A.z = L.z; A.y = L.y + 0.5; A.h += Math.sin(game.time * 0.3) * dt * 0.2;
    if (nuit || E.retourT > 0) { B.vol = false; B.x = L.x - 0.55; B.z = L.z + 0.15; B.y = L.y + 0.5; B.pose = {}; if (!nuit) E.retourT -= dt; else E.retourT = 0; }
    else {
      B.vol = true; B.pose = { fly: 1, seed: 1 };
      hfTourne(B, L.x, L.y + 10, L.z, 18, 0.32, dt);
      E.volT -= dt;
      if (E.volT <= 0) { E.volT = 40 + Math.random() * 50; E.retourT = 25 + Math.random() * 30; }
    }
    // le claquement du bec, quand on est assez près
    E.sonT -= dt;
    const d = Math.hypot(L.x - eye[0], L.z - eye[2]);
    if (E.sonT <= 0 && !nuit) {
      E.sonT = 18 + Math.random() * 25;
      if (d < 90) { hfSon([L.x, L.y + 0.6, L.z], () => sound.hfClaquement && sound.hfClaquement(1)); A.pose = { lookP: -0.6 }; setTimeout(() => { A.pose = {}; }, 2200); }
    }
    if (!E.note && d < 80 && hfRegarde(L.x, L.y + 1, L.z, 0.85)) { hasardF.noter(E); if (L.ou !== 'ferme') hfPense('(Des cigognes, sur le clocher.)', 3); }
  },
  dessin(E, buf, sbuf, cam, t) {
    const L = E.L;
    if (Math.hypot(L.x - cam[0], L.z - cam[2]) > 160) return;
    // le nid : une couronne de branchages
    PE.buf = buf; PE.fl = 0; PE.frame(L.x, L.y, L.z, 0.3, 1.8);
    for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; PE.box(Math.cos(a) * 0.55, 0.14, Math.sin(a) * 0.55, 0.5, 0.16, 0.16, [0.36, 0.28, 0.2], TL.wood, -a + Math.PI / 2, (i % 2) * 0.2); }
    PE.box(0, 0.08, 0, 1.1, 0.12, 1.1, [0.3, 0.24, 0.17], TL.hay);
    for (const F of E.oiseaux) hfDessine(F, buf, null, cam, t);
  },
  txt: {
    journal: 'Un couple de cigognes a niché six jours sur un toit. Elles claquaient du bec comme des crécelles.',
    apres: ['Les cigognes sont revenues ! Sur le clocher, comme du temps de mon père.', 'Une cigogne sur le toit, c’est un enfant dans l’année, ou un bonheur. Au choix.', 'Elles claquent du bec le matin, on dirait le curé qui compte ses sous.', 'Les cigognes sont reparties. Elles ne restent jamais longtemps, chez nous. Quelque chose les dérange.'],
  },
});
function hfCigognesInit(E) {
  const L = E.L;
  const A = hfBete('stork', L.x, L.z, { vol: true, y: L.y + 0.5, loin: 170, ombre0: true, s: 2.1 });
  const B = hfBete('stork', L.x, L.z, { vol: true, y: L.y + 0.5, loin: 170, ombre0: true, s: 2.1 });
  A.h = Math.random() * TAU; B.h = A.h + 2;
  E.oiseaux = [A, B]; E.volT = 5 + Math.random() * 10; E.retourT = 0; E.sonT = 4;
}

// ---------------------------------------------------------------- 2. les loups chantent
hfDef('loups_choeur', {
  cat: 'betes', tirage: 'heure', parHeure: 0.2, ecart: 10, duree: 0.6,
  ici: (X) => X.nuit && X.dehors && !X.ville && !X.hameau && !X.ferme && ['lande', 'hauteurs', 'foret', 'bouleaux'].includes(X.biome) && !X.pluie,
  lancer(E) {
    const p = game.player.pos;
    E.az = Math.random() * TAU; E.t0 = 0; E.cris = [];
    for (const t of [0.5, 2.2, 3.4, 4.1, 5.6, 7.5, 9.8, 13]) E.cris.push({ t: t + Math.random() * 0.6, a: E.az + (Math.random() - 0.5) * 0.7, r: 110 + Math.random() * 50 });
    // la meute passe, plus tard, entre les arbres : de gauche à droite, à soixante pas
    const a = E.az + (Math.random() < 0.5 ? 0.4 : -0.4), r = 55 + Math.random() * 25, cx = p[0] + Math.sin(a) * r, cz = p[2] + Math.cos(a) * r, perp = a + Math.PI / 2;
    E.meute = [];
    for (let i = 0; i < 4 + (Math.random() < 0.5 ? 1 : 0); i++) {
      const F = hfBete('wolf', cx - Math.sin(perp) * (40 + i * 2.2), cz - Math.cos(perp) * (40 + i * 2.2), { loin: 120, vit: 5.5, cache: true, acc: hfYeux });
      hfAller(F, [[cx + Math.sin(perp) * 60, cz + Math.cos(perp) * 60]], 5.5);
      E.meute.push(F);
    }
  },
  maj(E, dt, eye) {
    E.t0 += dt;
    for (const C of E.cris) if (!C.fait && E.t0 >= C.t) {
      C.fait = true;
      const x = eye[0] + Math.sin(C.a) * C.r, z = eye[2] + Math.cos(C.a) * C.r;
      hfSon([x, hfSol(x, z) + 1, z], () => sound.howl && sound.howl(C.r * 0.75));
      if (!E.note) { hasardF.noter(E); hasardF.retenir('loups_choeur'); }
    }
    if (E.t0 > 16) for (const F of E.meute) { F.cache = false; hfMarche(F, dt); F.run = true; }
    if (E.t0 > 34) E.fini = 'fin';
  },
  dessin(E, buf, sbuf, cam, t) { if (E.t0 > 16) for (const F of E.meute) hfDessine(F, buf, sbuf, cam, t); },
  txt: {
    journal: 'Une nuit, loin des maisons, une meute a chanté. Plus tard, j’ai vu passer des ombres basses, très vite.',
    apres: ['Les loups ont chanté, cette nuit, du côté des landes. Gardez vos brebis dedans.', 'Quand les loups chantent tous ensemble, c’est qu’ils ont mangé. Il faut espérer qu’ils ont mangé.', 'Mon grand-père disait que les loups ne chantent pas pour eux. Ils chantent pour qu’on les entende.'],
  },
});

// ---------------------------------------------------------------- 3. le brame : deux cerfs s'affrontent
hfDef('brame', {
  cat: 'betes', tirage: 'heure', parHeure: 0.25, ecart: 10, duree: 0.7,
  ici: (X) => X.foret && X.dehors && (X.soir || X.nuit || X.aube) && !X.pluie,
  lancer(E) {
    const e = game.player.eyePos(), f = cameraBasis(game.player.yaw, 0).f;
    const P = hfPoint(e[0], e[2], 28, 45, { a: Math.atan2(f[0], f[2]), ouv: 2.4, r: 2.5 });
    if (!P) return false;
    const a = Math.random() * TAU;
    E.cx = P.x; E.cz = P.z;
    E.cerfs = [0, 1].map((i) => { const s = i ? 1 : -1; const F = hfBete('deer', P.x + Math.sin(a) * 1.6 * s, P.z + Math.cos(a) * 1.6 * s, { v: 0, loin: 110, vit: 0 }); F.h = a + (i ? Math.PI : 0); F.base = [F.x, F.z]; return F; });
    E.choc = 3; E.brameT = 0.5; E.fuite = false;
  },
  maj(E, dt, eye) {
    const [A, B] = E.cerfs, d = Math.hypot(E.cx - eye[0], E.cz - eye[2]);
    if (!E.fuite) {
      // ils se poussent, front contre front ; un choc de temps en temps
      E.choc -= dt;
      const k = E.choc < 0.5 ? Math.sin(Math.max(0, E.choc) / 0.5 * Math.PI) : 0;
      for (const [F, s] of [[A, 1], [B, -1]]) {
        const ax = Math.sin(F.h), az = Math.cos(F.h);
        F.x = F.base[0] + ax * k * 0.45; F.z = F.base[1] + az * k * 0.45; F.y = hfY(F.x, F.z);
        F.pose = { lookP: 0.55 + k * 0.2, move: Math.abs(Math.sin(game.time * 2 + s)) * 0.15 };
      }
      if (E.choc <= 0) { E.choc = 2.5 + Math.random() * 4; if (d < 70) hfSon([E.cx, hfSol(E.cx, E.cz) + 1.4, E.cz], () => sound.hfBois && sound.hfBois(1)); }
      E.brameT -= dt;
      if (E.brameT <= 0) { E.brameT = 5 + Math.random() * 6; const F = Math.random() < 0.5 ? A : B; if (d < 140) hfSon([F.x, F.y + 1.6, F.z], () => sound.hfBrame && sound.hfBrame(1)); F.pose.lookP = -0.4; if (!E.note && d < 120) { hasardF.noter(E); hasardF.retenir('brame'); } }
      // trop près : ils s'enfuient chacun de son côté
      if (d < 16 || E.age > 0.55) {
        E.fuite = true;
        for (const F of E.cerfs) { const a = Math.atan2(F.x - eye[0], F.z - eye[2]) + (Math.random() - 0.5); hfAller(F, [[F.x + Math.sin(a) * 60, F.z + Math.cos(a) * 60]], 7); F.pose = {}; }
      }
    } else {
      let fin = true;
      for (const F of E.cerfs) { if (!hfMarche(F, dt)) fin = false; F.run = true; }
      if (fin) E.fini = 'fin';
    }
  },
  dessin(E, buf, sbuf, cam, t) { for (const F of E.cerfs) hfDessine(F, buf, sbuf, cam, t); },
  txt: {
    journal: 'Au crépuscule, dans les bois, deux cerfs se sont battus front contre front. Le brame faisait trembler les feuilles.',
    apres: ['Les cerfs brament, dans les bois. Ça fait un bruit de bête qu’on égorge. Ce n’en est pas une.', 'Deux grands cerfs se battaient près de la clairière, hier soir. On entendait les bois claquer jusqu’au chemin.', 'Le brame, c’est leur noce à eux. Ils n’invitent personne.'],
  },
});

// ---------------------------------------------------------------- 4. les crapauds traversent le chemin
hfDef('crapauds', {
  cat: 'betes', poids: 1.2, ecart: 7, duree: 1.3, fenetre: 2,
  peut: (c) => c.pluieA(17, 22) && !c.P.storm,
  heure: (c, r) => 21 + r * 1.5,
  pret: (X) => X.dehors && X.route && !X.ville,
  sansNous: () => false,
  lancer(E) {
    const p = game.player.pos, R = hfRoute(p[0], p[2], 4, 40);
    if (!R && !E.force) return false;
    const x0 = R ? R.x : p[0] + 5, z0 = R ? R.z : p[2], dir = R ? R.dir : 0, perp = dir + Math.PI / 2;
    E.x = x0; E.z = z0; E.perp = perp;
    E.crap = [];
    for (let i = 0; i < 18 + ((Math.random() * 8) | 0); i++) {
      const along = (Math.random() - 0.5) * 22, s = (Math.random() - 0.5) * 9;
      const x = x0 + Math.sin(dir) * along + Math.sin(perp) * s, z = z0 + Math.cos(dir) * along + Math.cos(perp) * s;
      const F = hfBete('crapaud', x, z, { loin: 40, vit: 0.12 + Math.random() * 0.12, s: 1.5 + Math.random() * 0.6 });
      F.h = perp + (Math.random() - 0.5) * 0.4; F.att = Math.random() * 3; F.fin = [x + Math.sin(perp) * (6 - s), z + Math.cos(perp) * (6 - s)];
      hfAller(F, [F.fin], F.vit);
      E.crap.push(F);
    }
    E.aides = 0; E.sonT = 1;
    hasardF.cible(E, {
      pos: () => { const F = hfCrapaudProche(E, 2.4); return F ? [F.x, F.y + 0.15, F.z] : null; }, r: 2.4, cos: 0.6, lab: 'Faire traverser le crapaud',
      use() {
        const F = hfCrapaudProche(E, 2.4);
        if (!F) return;
        F.x = F.fin[0]; F.z = F.fin[1]; F.y = hfY(F.x, F.z); F.chemin = null; F.passe = true; E.aides++;
        sound.animal && sound.animal('crapaud', 0, 0.6);
        if (E.aides === 1) hfPense('(Froid, et étonnamment lourd dans la main.)', 2.5);
        if (E.aides === 6) { hasardF.bienfait('crapauds'); hfPense('(Ils ne disent pas merci. Ils n’en pensent pas moins, peut-être.)', 3.5); }
      },
    });
  },
  maj(E, dt, eye) {
    for (const F of E.crap) {
      if (F.passe) continue;
      // de petits bonds, puis une pause
      F.att -= dt;
      if (F.att > 0) { F.move = 0; continue; }
      if (F.att < -0.6) F.att = 0.8 + Math.random() * 2.5;
      if (hfMarche(F, dt)) F.passe = true;
      F.dy = Math.abs(Math.sin(F.att * 5)) * 0.06;
    }
    E.sonT -= dt;
    if (E.sonT <= 0) { E.sonT = 1.5 + Math.random() * 2.5; const F = pick(E.crap); hfSon([F.x, F.y + 0.1, F.z], () => sound.animal && sound.animal('crapaud', 0, 0.8)); }
    if (!E.note && Math.hypot(E.x - eye[0], E.z - eye[2]) < 18) { hasardF.noter(E); hasardF.retenir('crapauds'); }
    if (E.crap.every((F) => F.passe) && E.age > 0.2) E.fini = 'fin';
  },
  dessin(E, buf, sbuf, cam, t) { for (const F of E.crap) hfDessine(F, buf, null, cam, t); },
  fin(E) { if (E.aides >= 6) hasardF.noter('crapauds', 'Un soir de pluie, j’ai aidé des crapauds à traverser le chemin. Une bonne douzaine.'); },
  txt: {
    journal: 'Un soir de pluie, des dizaines de crapauds traversaient le chemin, tous dans le même sens, vers l’eau.',
    apres: ['Les crapauds ont traversé le chemin, cette nuit. Il y en avait tant que la charrette du meunier a dû s’arrêter.', 'Quand les crapauds vont à l’eau tous ensemble, c’est que l’hiver est fini pour eux. Pour nous, on verra.'],
  },
});
function hfCrapaudProche(E, r) {
  const p = game.player.pos;
  let best = null, bd = r;
  for (const F of E.crap) { if (F.passe) continue; const d = Math.hypot(F.x - p[0], F.z - p[2]); if (d < bd) { bd = d; best = F; } }
  return best;
}

// ---------------------------------------------------------------- 5. le nuage d'étourneaux
hfDef('etourneaux', {
  cat: 'betes', tirage: 'heure', parHeure: 0.5, ecart: 8, duree: 0.6,
  ici: (X) => (X.lac || X.biome === 'marais' || X.biome === 'lac') && X.dehors && X.h >= 17.1 && X.h <= 18.7 && !X.pluie,
  lancer(E) {
    const e = game.player.eyePos(), f = cameraBasis(game.player.yaw, 0).f, a = Math.atan2(f[0], f[2]) + (Math.random() - 0.5) * 1.2, r = 50 + Math.random() * 25;
    E.cx = e[0] + Math.sin(a) * r; E.cz = e[2] + Math.cos(a) * r; E.cy = Math.max(hfSol(E.cx, E.cz), e[1]) + 18 + Math.random() * 8;
    E.n = 240;
    E.pts = [];
    for (let i = 0; i < E.n; i++) { let x, y, z; do { x = Math.random() * 2 - 1; y = Math.random() * 2 - 1; z = Math.random() * 2 - 1; } while (x * x + y * y + z * z > 1); E.pts.push([x, y, z, Math.random() * TAU]); }
    E.sonT = 0.5; E.t0 = 0;
  },
  maj(E, dt, eye) {
    E.t0 += dt;
    E.sonT -= dt;
    const d = Math.hypot(E.cx - eye[0], E.cz - eye[2]);
    if (E.sonT <= 0) { E.sonT = 2 + Math.random(); if (d < 140) hfSon([E.cx, E.cy, E.cz], () => sound.hfNuee && sound.hfNuee(clamp(1.3 - d / 120, 0.3, 1))); }
    if (!E.note && hfRegarde(E.cx, E.cy, E.cz, 0.8)) { hasardF.noter(E); hasardF.retenir('etourneaux'); }
    if (E.t0 > 28) E.fini = 'fin';
  },
  dessin(E, buf, sbuf, cam) {
    if (Math.hypot(E.cx - cam[0], E.cz - cam[2]) > 170) return;
    const t = E.t0, k = Math.min(1, t / 3, (30 - t) / 4);
    // le nuage se déforme : il s'étire, se replie, tourne ; il glisse au-dessus de l'eau
    const sx = 9 + Math.sin(t * 0.5) * 5, sy = 3.5 + Math.sin(t * 0.7 + 1) * 2.5, sz = 6 + Math.cos(t * 0.43) * 4, rot = t * 0.35;
    const cx = E.cx + Math.sin(t * 0.21) * 14, cz = E.cz + Math.cos(t * 0.17) * 10, cy = E.cy + Math.sin(t * 0.3) * 4 - (1 - k) * 20;
    PE.buf = buf; PE.fl = 0;
    const c = Math.cos(rot), s = Math.sin(rot);
    for (const [x, y, z, ph] of E.pts) {
      const w = Math.sin(t * 1.3 + x * 3 + ph) * 0.15, X = x * sx * (1 + w), Z = z * sz, Y = y * sy + Math.sin(t * 0.9 + x * 2.5) * 2.2;
      PE.frame(cx + X * c - Z * s, cy + Y, cz + X * s + Z * c, ph + t, 1);
      PE.box(0, 0, 0, 0.42, 0.1, 0.2, [0.05, 0.05, 0.06], TL.plain, 0, 0, Math.sin(t * 25 + ph) * 0.6);
    }
  },
  txt: {
    journal: 'Au soir, au-dessus de l’eau, un nuage d’étourneaux se pliait et se dépliait comme un drap noir.',
    apres: ['Vous avez vu les étourneaux, hier soir, au-dessus du marais ? On aurait dit de la fumée qui pense.', 'Des milliers d’étourneaux. Ils se posent dans les roseaux à la nuit, et au matin il n’en reste pas un.'],
  },
});

// ---------------------------------------------------------------- 6. les hirondelles volent bas
hfDef('hirondelles_basses', {
  cat: 'betes', poids: 1.2, ecart: 5, duree: 0.7, fenetre: 1,
  peut: (c) => !!hfPeriode(c.P, ['rain', 'storm'], 13, 19.5) && !c.pluieA(8, 12.5),
  heure: (c, r) => { const p = hfPeriode(c.P, ['rain', 'storm'], 13, 19.5); return p ? Math.max(11, p[0] - 1.6 + r * 0.7) : null; },
  pret: (X) => X.dehors && !X.pluie && (X.ferme || ['plaine', 'ferme', 'lande', 'lac'].includes(X.biome)),
  sansNous: () => false,
  lancer(E) {
    const p = game.player.pos;
    E.cx = p[0]; E.cz = p[2]; E.sonT = 0.5;
    E.ois = [];
    for (let i = 0; i < 9; i++) { const F = hfBete('songbird', p[0], p[2], { v: 1, vol: true, y: 0, s: 0.75, loin: 60, ombre0: true }); F.r = 6 + Math.random() * 16; F.w = (Math.random() < 0.5 ? -1 : 1) * (0.8 + Math.random() * 0.7); F.ang = Math.random() * TAU; F.hb = 0.5 + Math.random() * 1.2; F.pose = { fly: 1, seed: i }; E.ois.push(F); }
    setTimeout(() => { if (hasardF.actifs.hirondelles_basses === E) { hasardF.noter(E); hasardF.reagir('hirondelles_basses', 'pendant'); } }, 5000);
  },
  maj(E, dt, eye) {
    // elles suivent le joueur de loin, en rasant l'herbe
    E.cx = lerp(E.cx, eye[0], Math.min(1, dt * 0.3)); E.cz = lerp(E.cz, eye[2], Math.min(1, dt * 0.3));
    for (const F of E.ois) {
      hfTourne(F, E.cx, 0, E.cz, F.r + Math.sin(game.time * 0.7 + F.hb) * 4, F.w, dt);
      F.y = hfSol(F.x, F.z) + F.hb + Math.sin(game.time * 2 + F.ang) * 0.4;
    }
    E.sonT -= dt;
    if (E.sonT <= 0) { E.sonT = 2 + Math.random() * 3; const F = pick(E.ois); hfSon([F.x, F.y, F.z], () => sound.hfHirondelle && sound.hfHirondelle(1)); }
  },
  dessin(E, buf, sbuf, cam, t) { const k = hfK(E, 0.05, 0.1); if (k < 0.3) return; for (const F of E.ois) hfDessine(F, buf, null, cam, t); },
  txt: {
    journal: 'Les hirondelles rasaient l’herbe autour de moi. Une heure plus tard, il pleuvait.',
    pendant: ['Les hirondelles volent bas : la pluie avant ce soir.', 'Regardez-les raser l’herbe. Rentrez votre linge.'],
    apres: ['Les hirondelles l’avaient dit, hier : elles volaient au ras des blés. Une heure après, l’averse.', 'Quand l’hirondelle rase la terre, c’est la pluie qui la suit. Elle ne se trompe jamais. Les almanachs, si.'],
  },
});

// ---------------------------------------------------------------- 7. la grotte se vide de ses chauves-souris
const HF_GROTTES = ['grotte_cristaux', 'grotte_contrebandiers', 'grotte_peinte', 'bouche_galerie', 'faille', 'grotte_bouche'];
function hfGrotteProche(x, z, r) {
  const w = game.world;
  let best = null, bd = r;
  for (const k of HF_GROTTES) { const L = w.lm[k]; if (!L) continue; const d = Math.hypot(L.x - x, L.z - z); if (d < bd) { bd = d; best = L; } }
  return best;
}
hfDef('chauves_souris', {
  cat: 'betes', tirage: 'heure', parHeure: 1.3, ecart: 6, duree: 0.6,
  ici: (X) => X.dehors && X.h >= 18.2 && X.h <= 19.5 && !X.pluie && !!hfGrotteProche(X.pos[0], X.pos[2], 75),
  lancer(E) {
    const p = game.player.pos, G = hfGrotteProche(p[0], p[2], 75) || { x: p[0] + 20, z: p[2] + 20 };
    E.gx = G.x; E.gz = G.z; E.gy = hfSol(G.x, G.z) + 1.2;
    E.dir = Math.random() * TAU; E.t0 = 0; E.sonT = 0.2;
    E.bats = [];
    for (let i = 0; i < 70; i++) E.bats.push({ t0: Math.random() * 14, ph: Math.random() * TAU, off: [(Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2], sp: 6 + Math.random() * 4 });
    E.rig = ANIMAL_RIGS.bat ? ANIMAL_RIGS.bat() : null;
  },
  maj(E, dt, eye) {
    E.t0 += dt;
    E.sonT -= dt;
    const d = Math.hypot(E.gx - eye[0], E.gz - eye[2]);
    if (E.sonT <= 0 && E.t0 < 16) { E.sonT = 0.6 + Math.random() * 0.8; hfSon([E.gx, E.gy + 2, E.gz], () => { sound.squeak && sound.squeak(); if (Math.random() < 0.4) sound.hfNuee && sound.hfNuee(0.4); }); }
    if (!E.note && d < 60 && E.t0 > 2 && hfRegarde(E.gx, E.gy + 4, E.gz, 0.7)) { hasardF.noter(E); hasardF.retenir('chauves_souris'); }
    if (E.t0 > 26) E.fini = 'fin';
  },
  dessin(E, buf, sbuf, cam, t) {
    if (Math.hypot(E.gx - cam[0], E.gz - cam[2]) > 120) return;
    PE.buf = buf; PE.fl = 0;
    for (const B of E.bats) {
      const u = E.t0 - B.t0;
      if (u < 0 || u > 9) continue;
      // un ruban qui sort de la grotte, monte en tournoyant, puis se défait
      const L = u * B.sp, a = E.dir + Math.sin(u * 0.8 + B.ph) * 0.5 * Math.min(1, u / 3);
      const x = E.gx + Math.sin(a) * L + B.off[0] * (1 + u), z = E.gz + Math.cos(a) * L + B.off[1] * (1 + u), y = E.gy + u * 2.2 + Math.sin(u * 6 + B.ph) * 0.6;
      PE.frame(x, y, z, a, 1);
      const fl = Math.sin(t * 30 + B.ph) * 0.9;
      PE.box(0, 0, 0, 0.11, 0.09, 0.18, [0.1, 0.08, 0.07], TL.fur);
      PE.box(-0.19, 0.01, 0, 0.32, 0.015, 0.16, [0.08, 0.06, 0.06], TL.skin, 0, 0, fl);
      PE.box(0.19, 0.01, 0, 0.32, 0.015, 0.16, [0.08, 0.06, 0.06], TL.skin, 0, 0, -fl);
    }
  },
  txt: {
    journal: 'Au crépuscule, une grotte s’est vidée de ses chauves-souris : un ruban noir qui sortait de la roche sans finir.',
    apres: ['Les chauves-souris sortent de la grotte tous les soirs. Mais pas comme hier : on aurait dit une fumée.', 'Il y a plus de chauves-souris dans cette grotte que de gens dans la vallée. Je les ai vues sortir. Je ne compte plus.'],
  },
});

// ---------------------------------------------------------------- 8. un chevreuil pris dans un collet
hfDef('chevreuil_pris', {
  cat: 'betes', poids: 1, premier: 4, ecart: 10, duree: 1.8, fenetre: 3,
  peut: (c) => !c.P.storm,
  heure: (c, r) => 9 + r * 7,
  pret: (X) => X.dehors && X.foret,
  sansNous: () => false,
  lancer(E) {
    const e = game.player.eyePos(), f = cameraBasis(game.player.yaw, 0).f;
    const P = hfPoint(e[0], e[2], 18, 32, { a: Math.atan2(f[0], f[2]), ouv: 2.6, r: 1 });
    if (!P) return false;
    E.x = P.x; E.z = P.z;
    E.roe = hfBete('roe', P.x, P.z, { v: 1, loin: 90, vit: 7 });
    E.roe.h = Math.random() * TAU;
    E.criT = 1; E.etat = 'pris';
    hasardF.cible(E, { pos: () => [E.roe.x, E.roe.y + 0.6, E.roe.z], r: 2.6, lab: 'S’approcher du chevreuil', vis: () => E.etat === 'pris', use: () => hfChevreuilChoix(E) });
  },
  maj(E, dt, eye) {
    const F = E.roe;
    if (E.etat === 'pris') {
      // il se débat, couché, la patte prise ; il crie de temps en temps
      F.pose = { lie: 1, lookP: Math.sin(game.time * 3) * 0.3 };
      F.dy = -0.35;
      if (Math.random() < dt * 0.6) { F.pose.lie = 0; F.dy = -0.1; }
      E.criT -= dt;
      const d = Math.hypot(E.x - eye[0], E.z - eye[2]);
      if (E.criT <= 0) { E.criT = 4 + Math.random() * 4; if (d < 80) hfSon([F.x, F.y + 0.6, F.z], () => sound.hfChevreuil && sound.hfChevreuil(1)); }
      if (!E.note && d < 30 && hfRegarde(F.x, F.y + 0.5, F.z, 0.75)) { hasardF.noter(E); hfPense('(Un chevreuil, couché. Une patte prise dans un fil de laiton.)', 3.5); }
    } else if (E.etat === 'libre') {
      F.dy = 0; F.run = true;
      if (hfMarche(F, dt)) E.fini = 'fin';
    } else if (E.etat === 'mort') { F.pose = { lie: 1 }; F.dy = -0.4; }
  },
  dessin(E, buf, sbuf, cam, t) {
    if (E.etat === 'parti') return;
    hfDessine(E.roe, buf, sbuf, cam, t);
    if (E.etat === 'pris' || E.etat === 'mort') { PE.buf = buf; PE.fl = 0; PE.frame(E.x + 0.5, hfSol(E.x + 0.5, E.z), E.z, 0, 1); PE.box(0, 0.15, 0, 0.05, 0.3, 0.05, [0.4, 0.3, 0.2], TL.wood); PE.box(-0.25, 0.1, 0, 0.5, 0.012, 0.012, [0.75, 0.6, 0.3], TL.metal); }
  },
  fin(E) { if (E.etat === 'pris' && E.age > 1) hasardF.noter('chevreuil_pris', 'Un chevreuil pris dans un collet. Je l’ai laissé. Le lendemain, il n’y avait plus que le fil.'); },
  txt: {
    journal: 'Dans les bois, un chevreuil pris dans un collet de braconnier.',
    apres: ['Quelqu’un pose des collets dans les bois. Le garde champêtre en a trouvé trois. Il a dit des mots que je ne répéterai pas.', 'Un chevreuil qui crie, ça ressemble à un enfant. Ne restez pas à l’écouter.'],
  },
});
function hfChevreuilChoix(E) {
  const F = E.roe, p = game.player.pos;
  const libre = () => {
    ui.close(true);
    E.etat = 'libre';
    const a = Math.atan2(F.x - p[0], F.z - p[2]) + (Math.random() - 0.5) * 0.6;
    hfAller(F, [[F.x + Math.sin(a) * 70, F.z + Math.cos(a) * 70]], 7);
    F.pose = {};
    farm.give('corde', 1); play.flyer && play.flyer('corde', [F.x, F.y + 0.3, F.z], 1);
    hasardF.bienfait('chevreuil');
    hasardF.noter('chevreuil_pris', 'Un chevreuil pris dans un collet. Je l’ai délivré ; il est parti sans se retourner, en boitant à peine.');
    hfPense('(Il a bondi avant que vous ayez fini de défaire le nœud.)', 3);
  };
  const tuer = () => {
    ui.close(true);
    E.etat = 'mort';
    sound.hurtAnimal && sound.hurtAnimal('deer');
    farm.give('viande', 2); farm.give('cuir', 1);
    play.flyer && play.flyer('viande', [F.x, F.y + 0.3, F.z], 2);
    hasardF.noter('chevreuil_pris', 'Un chevreuil pris dans un collet. Je l’ai achevé, et j’ai pris ce que le braconnier n’aurait pas.');
    setTimeout(() => { if (hasardF.actifs.chevreuil_pris === E) E.fini = 'fin'; }, 4000);
  };
  ui.choice('Un chevreuil pris au collet', 'Le fil de laiton lui scie la patte. Il vous regarde, les yeux blancs, et ne bouge plus.', [
    { label: 'Défaire le collet', fn: libre },
    { label: 'L’achever', fn: tuer },
    { label: 'Le laisser', fn: () => ui.close() },
  ]);
}

// ---------------------------------------------------------------- 9. un essaim pend à une branche
hfDef('essaim', {
  cat: 'betes', poids: 1, premier: 4, ecart: 9, duree: 2.2, fenetre: 2.5,
  peut: (c) => !c.pluieA(10, 16),
  heure: (c, r) => 10.5 + r * 4.5,
  pret: (X) => X.dehors && (X.ferme || X.ville || X.hameau || ['plaine', 'ferme', 'bouleaux'].includes(X.biome)) && !!hfArbre(X.pos[0], X.pos[2], 8, 40),
  sansNous: () => false,
  lancer(E) {
    const p = game.player.pos, A = hfArbre(p[0], p[2], 8, 40);
    if (!A && !E.force) return false;
    const x = A ? A.x : p[0] + 8, z = A ? A.z : p[2] + 3, a = Math.random() * TAU;
    E.x = x + Math.sin(a) * 1.1; E.z = z + Math.cos(a) * 1.1; E.y = hfSol(x, z) + 2.6;
    E.sonT = 0; E.etat = 'pend'; E.pique = 0;
    hasardF.cible(E, { pos: () => [E.x, E.y - 0.3, E.z], r: 3.2, cos: 0.6, lab: 'Recueillir l’essaim', vis: () => E.etat === 'pend', use: () => hfEssaimPrendre(E) });
  },
  maj(E, dt, eye) {
    const d = Math.hypot(E.x - eye[0], E.y - eye[1], E.z - eye[2]);
    if (E.etat === 'pend') {
      if (Math.random() < dt * 25) particles.spawn(E.x + (Math.random() - 0.5) * 1.4, E.y - 0.3 + (Math.random() - 0.5) * 1.2, E.z + (Math.random() - 0.5) * 1.4, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1, (Math.random() - 0.5) * 1.5, [0.25, 0.18, 0.05, 1], 0.03, 0.6, 0, false);
      E.sonT -= dt;
      if (E.sonT <= 0 && d < 35) { E.sonT = 2.3; hfSon([E.x, E.y, E.z], () => sound.hfEssaim && sound.hfEssaim(clamp(1.2 - d / 30, 0.2, 1))); }
      if (!E.note && d < 25 && hfRegarde(E.x, E.y - 0.3, E.z, 0.8)) { hasardF.noter(E); hfPense('(Une grappe d’abeilles, grosse comme un pain de quatre livres, pend à la branche.)', 4); }
      // trop près, sans fumée : elles piquent
      E.pique -= dt;
      if (d < 1.8 && E.pique <= 0 && !farm.count('enfumoir')) { E.pique = 3; play.hurt(2, null, 'Piqué par un essaim'); if (!E.dit) { E.dit = true; hfPense('(Elles n’aiment pas qu’on les approche sans fumée.)', 3); } }
      if (E.age > 2) { E.etat = 'part'; E.t1 = 0; }
    } else if (E.etat === 'part') {
      E.t1 += dt;
      for (let i = 0; i < 4; i++) if (Math.random() < dt * 30) particles.spawn(E.x + E.t1 * 3 + (Math.random() - 0.5) * 3, E.y + E.t1 * 1.5 + (Math.random() - 0.5) * 2, E.z + (Math.random() - 0.5) * 3, 3, 1.5, 0, [0.25, 0.18, 0.05, 1], 0.03, 0.8, 0, false);
      if (E.t1 > 6) E.fini = 'fin';
    }
  },
  dessin(E, buf) {
    if (E.etat !== 'pend') return;
    PE.buf = buf; PE.fl = 0;
    const t = game.time;
    PE.frame(E.x, E.y, E.z, 0, 1);
    PE.box(0, 0.2, 0, 0.05, 0.3, 0.05, [0.35, 0.26, 0.18], TL.bark);
    for (let i = 0; i < 7; i++) { const a = i * 0.9 + Math.sin(t * 3 + i) * 0.05; PE.box(Math.cos(a) * 0.12, -0.25 - (i % 3) * 0.18, Math.sin(a) * 0.12, 0.42 - (i % 3) * 0.08, 0.3, 0.38 - (i % 3) * 0.07, [0.36, 0.26, 0.08], TL.fur, a); }
  },
  txt: {
    journal: 'Un essaim d’abeilles pendait à une branche, en grappe, bourdonnant comme une marmite.',
    apres: ['Un essaim s’est posé sur un arbre, hier. Personne n’a osé y toucher. Il est reparti au soir.', 'Un essaim qui se pose chez vous, c’est de l’argent qui arrive, disait ma mère. Elle n’en a jamais vu la couleur.'],
  },
});
function hfEssaimPrendre(E) {
  if (!farm.count('enfumoir')) { play.hurt(3, null, 'Piqué par un essaim'); hfPense('(Aïe ! Sans fumée, elles ne se laissent pas faire.)', 3); return; }
  E.etat = 'pris';
  for (let k = 0; k < 30; k++) particles.spawn(E.x, E.y - 0.3, E.z, (Math.random() - 0.5) * 2, Math.random() * 1.5, (Math.random() - 0.5) * 2, [0.65, 0.62, 0.6, 0.6], 0.25, 1.5, -0.2, false);
  farm.give('ruche', 1); play.flyer && play.flyer('ruche', [E.x, E.y, E.z], 1);
  sound.pop && sound.pop();
  hasardF.noter('essaim', 'Un essaim pendait à une branche. Je l’ai enfumé et recueilli ; il a fait une ruche.');
  hfPense('(La fumée les endort. La grappe tombe d’un bloc, toute chaude.)', 3.5);
  setTimeout(() => { if (hasardF.actifs.essaim === E) E.fini = 'fin'; }, 3000);
}

// ---------------------------------------------------------------- 10. les renardeaux, à l'aube
hfDef('renardeaux', {
  cat: 'betes', tirage: 'heure', parHeure: 0.3, ecart: 10, duree: 0.7,
  ici: (X) => X.dehors && X.h >= 5.2 && X.h <= 7.6 && (X.foret || X.biome === 'plaine' || X.biome === 'lande') && !X.ville && !X.ferme && !X.pluie,
  lancer(E) {
    const e = game.player.eyePos(), f = cameraBasis(game.player.yaw, 0).f;
    const P = hfPoint(e[0], e[2], 22, 34, { a: Math.atan2(f[0], f[2]), ouv: 2, r: 2 });
    if (!P) return false;
    E.x = P.x; E.z = P.z; E.y = P.y;
    E.mere = hfBete('fox', P.x + 1.2, P.z + 0.6, { loin: 80, vit: 3, s: 1.15 });
    E.mere.h = Math.atan2(e[0] - P.x, e[2] - P.z);
    E.petits = [0, 1, 2].map((i) => { const F = hfBete('fox', P.x + (Math.random() - 0.5) * 3, P.z + (Math.random() - 0.5) * 3, { s: 0.65, loin: 70, vit: 2.2 }); F.jeu = Math.random() * 3; return F; });
    E.sonT = 2; E.fuite = false;
  },
  maj(E, dt, eye) {
    const d = Math.hypot(E.x - eye[0], E.z - eye[2]);
    if (!E.fuite) {
      for (const F of E.petits) {
        F.jeu -= dt;
        if (F.jeu <= 0 || !F.chemin) { F.jeu = 0.8 + Math.random() * 1.6; const a = Math.random() * TAU, r = Math.random() * 2.5; hfAller(F, [[E.x + Math.sin(a) * r, E.z + Math.cos(a) * r]], 1.5 + Math.random() * 2); }
        hfMarche(F, dt); F.run = F.vit > 2.5;
      }
      E.mere.pose = { lookY: Math.sin(game.time * 0.5) * 0.4 };
      E.sonT -= dt;
      if (E.sonT <= 0) { E.sonT = 3 + Math.random() * 4; if (d < 60) hfSon([E.x, E.y + 0.4, E.z], () => sound.hfGlapir && sound.hfGlapir(1)); }
      if (!E.note && d < 40 && hfRegarde(E.x, E.y + 0.3, E.z, 0.8)) { hasardF.noter(E); hasardF.retenir('renardeaux'); }
      if (d < 13 || E.age > 0.6) { E.fuite = true; for (const F of [E.mere, ...E.petits]) hfAller(F, [[E.x, E.z]], 3.5); }
    } else {
      let fin = true;
      for (const F of [E.mere, ...E.petits]) { if (hfMarche(F, dt)) F.cache = true; else fin = false; }
      if (fin) E.fini = 'fin';
    }
  },
  dessin(E, buf, sbuf, cam, t) {
    // le terrier : une bouche sombre dans le talus
    PE.buf = buf; PE.fl = 0; PE.frame(E.x, E.y, E.z, 0, 1);
    PE.box(0, 0.25, 0, 1.6, 0.55, 1.4, [0.36, 0.28, 0.2], TL.soil); PE.box(0, 0.3, 0.62, 0.5, 0.36, 0.2, [0.04, 0.03, 0.03], TL.plain);
    hfDessine(E.mere, buf, sbuf, cam, t);
    for (const F of E.petits) hfDessine(F, buf, sbuf, cam, t);
  },
  txt: {
    journal: 'À l’aube, devant un terrier, une renarde regardait jouer ses trois petits. Ils ont disparu d’un coup.',
    apres: ['Il y a une renarde et ses petits près du bois. Si vous avez des poules, fermez bien.', 'Les renardeaux jouent à l’aube comme des chiots. Après, ils mangent vos poules comme des renards.'],
  },
});
