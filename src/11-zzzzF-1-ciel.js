// ============================================================================
//  LE HASARD DE LA VALLÉE (1) : LE CIEL ET LE TEMPS — dix événements.
//  - arc_en_ciel : un arc double, après une averse de l'après-midi ;
//  - halo_lune : la lune cerclée, la veille d'un jour de pluie ;
//  - parhelie : les faux soleils d'un matin de gel ou de grand clair ;
//  - eclairs_chaleur : un soir lourd, des éclairs au loin, sans un bruit ;
//  - foudre_boule : pendant l'orage, une boule de lumière qui flotte, puis éclate ;
//  - rayon_vert : au bord du lac, par temps clair, au coucher du soleil ;
//  - saint_elme : pendant l'orage, des flammes bleues aux pointes ;
//  - linge_envole : un Lavedi, le vent emporte les draps (on les rapporte) ;
//  - pluie_soleil : la pluie tombe en plein soleil (« le diable bat sa femme ») ;
//  - comete : une comète, sept nuits durant (la bibliothèque écrit).
// ============================================================================

// ---------------------------------------------------------------- outils du ciel
const hfCross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
// la direction d'un vecteur : azimut (atan2(x, z)) et hauteur
const hfAz = (d) => Math.atan2(d[0], d[2]);
const hfEl = (d) => Math.asin(clamp(d[1], -1, 1));
// des points sur un cercle du ciel de rayon angulaire th autour de la direction A (vecteur unité) ; fn(dir, phi)
function hfCercle(A, th, n, fn, phi0, phi1) {
  const up = Math.abs(A[1]) > 0.95 ? [1, 0, 0] : [0, 1, 0];
  const u = v3.norm(hfCross(A, up)), v = hfCross(u, A), c = Math.cos(th), s = Math.sin(th);
  const a0 = phi0 ?? 0, a1 = phi1 ?? TAU;
  for (let i = 0; i < n; i++) {
    const ph = a0 + (a1 - a0) * (i + Math.random() * 0.6) / n;
    fn([A[0] * c + (u[0] * Math.cos(ph) + v[0] * Math.sin(ph)) * s, A[1] * c + (u[1] * Math.cos(ph) + v[1] * Math.sin(ph)) * s, A[2] * c + (u[2] * Math.cos(ph) + v[2] * Math.sin(ph)) * s], ph);
  }
}
// une particule fixe du ciel (lumineuse, transparente) à R pas dans la direction d
function hfEtoile(cam, d, R, col, size, life) { particles.spawn(cam[0] + d[0] * R, cam[1] + d[1] * R, cam[2] + d[2] * R, 0, 0, 0, col, size, life, 0, true); }
// un arc-en-ciel autour du point antisolaire (k : intensité ; double : l'arc secondaire). Seule la partie au-dessus de
// l'horizon est semée (une quarantaine de taches par bande, qui se recouvrent) ; quatre bandes, renouvelées par moitié
const HF_ARC = [[42.1, [1.0, 0.28, 0.22]], [41.2, [1.0, 0.85, 0.3]], [40.3, [0.35, 1.0, 0.4]], [39.5, [0.4, 0.45, 1.0]]];
function hfArc(cam, sunDir, k, double, dt, E) {
  E.arcT = (E.arcT || 0) - dt;
  if (E.arcT > 0 || k < 0.02) return;
  E.arcT = 0.4;
  const A = v3.norm([-sunDir[0], -sunDir[1], -sunDir[2]]), R = 88;
  // la portion visible du cercle (hauteur > 0) : on la cherche une fois par tirage
  const vis = [];
  hfCercle(A, 41 * Math.PI / 180, 90, (d, ph) => { if (d[1] > 0.004) vis.push(ph); });
  if (!vis.length) return;
  const p0 = Math.min(...vis), p1 = Math.max(...vis), plein = p1 - p0 > 6;
  const sem = (deg, n, col, a, sz) => hfCercle(A, deg * Math.PI / 180, n, (d) => { if (d[1] > 0.004) hfEtoile(cam, d, R, [col[0], col[1], col[2], a], sz, 1.0); }, plein ? 0 : p0, plein ? TAU : p1);
  for (const [deg, c] of HF_ARC) sem(deg, 30, c, 0.18 * k, 3.4);
  if (double) for (const [deg, c] of HF_ARC) sem(92 - deg, 22, c, 0.06 * k, 3.6);
}
// le ciel s'ouvre : le soleil perce, les nuages s'éclaircissent (k : 0..1)
function hfEclaircie(sky, k) {
  if (k <= 0.01) return;
  const w = game.world, wc = weather.cur;
  const R = computeSky(w.time, settings.viewDist, { cloud: 0.3, rain: wc.rain * 0.4, storm: 0, fog: 0, frost: 0, heat: 0 });
  for (const f of ['sunCol', 'zen', 'hor', 'amb', 'haze', 'glow', 'cloudLit', 'cloudDark']) sky[f] = v3.lerp(sky[f], R[f], k);
  for (const f of ['sunVis', 'shadowK', 'cloudCover']) sky[f] = lerp(sky[f], R[f], k);
  sky.fog = [lerp(sky.fog[0], R.fog[0], k), lerp(sky.fog[1], R.fog[1], k)];
  sky.sunCol = v3.scale(sky.sunCol, 1 + 0.15 * k);
}
const hfDehorsVrai = () => { const p = game.player; return !p.underground && !hfAilleurs() && !game.world.covered(...p.eyePos()); };
// la fin d'une averse entre 15 h et 17 h 40 (ou entre 7 h et 8 h 30) : l'heure, ou null
function hfFinAverse(P) {
  const L = P.plan;
  for (let i = 0; i + 1 < L.length; i++) {
    const h = L[i + 1][0], mouille = (x) => x === 'rain' || x === 'storm';
    if (mouille(L[i][1]) && !mouille(L[i + 1][1]) && L[i + 1][1] !== 'fog' && ((h >= 15 && h <= 17.6) || (h >= 7 && h <= 8.5))) return h;
  }
  return null;
}

// ---------------------------------------------------------------- 1. l'arc-en-ciel double, après l'averse
hfDef('arc_en_ciel', {
  cat: 'ciel', poids: 1.6, ecart: 6, public: true, duree: 1.1, fenetre: 1,
  // une averse qui finit en fin d'après-midi : le soleil assez bas (moins de 42°) pour que l'arc soit au-dessus de l'horizon
  peut: (c) => hfFinAverse(c.P) !== null,
  heure: (c) => { const h = hfFinAverse(c.P); return h === null ? null : h + 0.1; },
  pret: (X) => X.dehors && game.sky && game.sky.e > 0.08 && game.sky.e < 0.62,
  sansNous: () => true,
  lancer(E) { E.double = Math.random() < 0.6; E.vuT = 0; },
  ciel(E, sky) { hfEclaircie(sky, hfK(E, 0.1, 0.3) * 0.8); },
  maj(E, dt, eye) {
    const sky = game.sky;
    if (!sky || game.player.underground) return;
    const k = hfK(E, 0.12, 0.35) * smoothstep(0.03, 0.1, sky.e) * (1 - weather.cur.rain * 0.8);
    hfArc(eye, sky.sunDir, k, E.double, dt, E);
    // le regarder : le sommet de l'arc, à l'opposé du soleil
    if (!E.note && k > 0.4 && hfDehorsVrai()) {
      const A = v3.norm([-sky.sunDir[0], 0, -sky.sunDir[2]]);
      if (hfRegarde(eye[0] + A[0] * 80, eye[1] + 40, eye[2] + A[2] * 80, 0.7)) {
        E.vuT += dt;
        if (E.vuT > 1.5) { hasardF.noter(E); hasardF.reagir('arc_en_ciel', 'pendant'); if (Math.random() < 0.5) setTimeout(() => sound.oiseau && sound.oiseau('merle', null, 0.6), 1800); }
      }
    }
  },
  txt: {
    journal: 'Après l’averse, un arc-en-ciel double au-dessus de la vallée.',
    pendant: ['Regardez ! Il y en a deux, l’un sur l’autre !', 'L’arc boit à la rivière. Mon père le disait.', 'Arc-en-ciel du soir, beau temps pour l’espoir.'],
    apres: ['Vous avez vu l’arc-en-ciel, hier ? Deux, l’un sur l’autre. Les couleurs à l’envers, dans celui du haut.', 'Ma fille a couru au pied de l’arc-en-ciel pour y chercher de l’or. Elle est revenue trempée et contente.', 'Quand l’arc-en-ciel boit à la rivière, disait ma mère, il ne faut pas boire après lui.'],
  },
});

// ---------------------------------------------------------------- 2. la lune cerclée : il pleuvra demain
hfDef('halo_lune', {
  cat: 'ciel', poids: 1, ecart: 8, public: true, duree: 1.6, fenetre: 2.5,
  peut: (c) => c.demain.rain && !c.noire && ['cloudy', 'clear', 'frost'].includes(c.etat(22.5)),
  heure: (c, r) => 21.8 + r * 2.4,
  pret: (X) => X.dehors && game.sky && game.sky.moonDir[1] > 0.12 && game.sky.night > 0.6,
  sansNous: () => true,
  lancer(E) { E.vuT = 0; },
  maj(E, dt, eye) {
    const sky = game.sky;
    if (!sky || game.player.underground) return;
    const k = hfK(E, 0.25, 0.4) * sky.night * clamp(sky.moonDir[1] * 4, 0, 1);
    E.anT = (E.anT || 0) - dt;
    if (E.anT <= 0 && k > 0.02) {
      E.anT = 0.5;
      const M = sky.moonDir;
      hfCercle(M, 22 * Math.PI / 180, 80, (d) => hfEtoile(eye, d, 86, [0.85, 0.88, 0.98, 0.12 * k], 2.8, 1.2));
      hfCercle(M, 21.2 * Math.PI / 180, 40, (d) => hfEtoile(eye, d, 86, [0.95, 0.6, 0.5, 0.08 * k], 2.2, 1.2));
    }
    if (!E.note && k > 0.4 && hfDehorsVrai()) {
      const M = sky.moonDir;
      if (hfRegarde(eye[0] + M[0] * 50, eye[1] + M[1] * 50, eye[2] + M[2] * 50, 0.8)) { E.vuT += dt; if (E.vuT > 2) { hasardF.noter(E); } }
    }
  },
  txt: {
    journal: 'La lune avait un grand cercle pâle autour d’elle. Le lendemain, il a plu.',
    apres: ['La lune avait son cerceau, hier soir. Je l’avais dit : la pluie.', 'Lune cerclée, chemin mouillé. Ça ne rate jamais.', 'Ce cercle autour de la lune, ma grand-mère l’appelait la couronne des noyés. Elle exagérait un peu.'],
  },
});

// ---------------------------------------------------------------- 3. les faux soleils
hfDef('parhelie', {
  cat: 'ciel', poids: 0.8, ecart: 10, public: true, duree: 0.9, fenetre: 1.2,
  peut: (c) => c.P.frost || (c.etat(8) === 'clear' && !c.pluieA(6, 11)),
  heure: (c, r) => 7.2 + r * 1.4,
  pret: (X) => X.dehors && game.sky && game.sky.e > 0.04 && game.sky.e < 0.45,
  sansNous: () => true,
  lancer(E) { E.vuT = 0; },
  maj(E, dt, eye) {
    const sky = game.sky;
    if (!sky || game.player.underground) return;
    const k = hfK(E, 0.15, 0.3) * sky.day * (1 - weather.cur.cloud * 0.7);
    E.anT = (E.anT || 0) - dt;
    if (E.anT <= 0 && k > 0.02) {
      E.anT = 0.35;
      const S = sky.sunDir, az = hfAz(S), el = hfEl(S), dA = 22 * Math.PI / 180 / Math.max(0.6, Math.cos(el));
      for (const s of [-1, 1]) {
        const c = Math.cos(el), d0 = (a, e) => [Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e)];
        void c;
        // le faux soleil : rouge du côté du vrai, blanc au-dehors, une traîne pâle
        for (let i = 0; i < 4; i++) hfEtoile(eye, d0(az + s * (dA + i * 0.006), el + (Math.random() - 0.5) * 0.01), 86, i === 0 ? [1, 0.5, 0.3, 0.55 * k] : [1.15, 1.1, 1.0, 0.7 * k], 3.2 - i * 0.4, 0.8);
        for (let i = 1; i < 6; i++) hfEtoile(eye, d0(az + s * (dA + 0.03 + i * 0.035), el), 86, [1, 1, 1, 0.12 * k * (1 - i / 7)], 2.2, 0.8);
      }
      // l'anneau, à peine
      hfCercle(S, 22 * Math.PI / 180, 44, (d) => { if (d[1] > 0) hfEtoile(eye, d, 86, [1, 0.95, 0.9, 0.07 * k], 2.4, 0.8); });
    }
    if (!E.note && k > 0.4 && hfDehorsVrai() && hfRegarde(eye[0] + sky.sunDir[0] * 50, eye[1] + sky.sunDir[1] * 50, eye[2] + sky.sunDir[2] * 50, 0.82)) {
      E.vuT += dt;
      if (E.vuT > 1.5) { hasardF.noter(E); }
    }
  },
  txt: {
    journal: 'Un matin de grand froid, trois soleils se sont levés : le vrai, et deux faux de chaque côté.',
    apres: ['Trois soleils, hier matin ! Le curé dit que c’est la glace dans l’air. Ma mère disait que c’était un deuil dans l’année.', 'Les faux soleils, on les appelle des parhélies, à la ville. Ici, on appelle ça un mauvais matin.', 'J’ai vu les trois soleils en allant traire. Les vaches n’ont pas aimé ça.'],
  },
});

// ---------------------------------------------------------------- 4. les éclairs de chaleur
hfDef('eclairs_chaleur', {
  cat: 'ciel', poids: 1, ecart: 7, public: true, duree: 0.9, fenetre: 1.4,
  peut: (c) => !c.pluieA(17, 24) && (c.P.heat || (c.etat(15) === 'clear' && c.etat(21) !== 'fog')) && !c.noire,
  heure: (c, r) => 20.7 + r * 1.5,
  pret: (X) => X.dehors && game.sky && game.sky.e < 0.0,
  sansNous: () => true,
  lancer(E) { E.az = Math.random() * TAU; E.flT = 3; E.fl = 0; E.n = 0; },
  maj(E, dt, eye) {
    if (game.player.underground) return;
    E.flT -= dt;
    E.fl = Math.max(0, E.fl - dt * 6);
    if (E.flT <= 0 && E.age < E.D.duree - 0.1) {
      E.flT = 1.8 + Math.random() * 4.5;
      E.fl = 0.6 + Math.random() * 0.4; E.n++;
      // la lueur, basse sur l'horizon, dans les nuages lointains
      const a = E.az + (Math.random() - 0.5) * 0.7;
      for (let i = 0; i < 26; i++) { const b = a + (Math.random() - 0.5) * 0.5, d = [Math.sin(b), 0.02 + Math.random() * 0.09, Math.cos(b)]; hfEtoile(eye, v3.norm(d), 92, [0.8, 0.78, 1, 0.1 * E.fl], 2.5 + Math.random() * 2.5, 0.16); }
      if (E.n === 2 && hfDehorsVrai()) { hasardF.noter(E); hfPense('(Pas un bruit.)', 2.5); }
    }
  },
  ciel(E, sky) {
    if (E.fl <= 0) return;
    const f = E.fl * 0.14 * sky.night;
    sky.hor = v3.add(sky.hor, [f * 0.8, f * 0.75, f]); sky.haze = v3.add(sky.haze, [f * 0.5, f * 0.5, f * 0.6]); sky.amb = v3.add(sky.amb, [f * 0.1, f * 0.1, f * 0.14]);
    sky.cloudLit = v3.add(sky.cloudLit, [f * 2.2, f * 2.1, f * 2.6]); sky.cloudDark = v3.add(sky.cloudDark, [f * 1.2, f * 1.1, f * 1.5]);
  },
  txt: {
    journal: 'Un soir lourd, des éclairs au loin, sans le moindre tonnerre.',
    apres: ['Des éclairs sans tonnerre, hier soir. Ça mûrit les blés, qu’on dit.', 'Des éclairs de chaleur toute la soirée. Je n’ai pas dormi, il faisait trop lourd.', 'Le ciel clignait, cette nuit, comme quelqu’un qui cherche à voir.'],
  },
});

// ---------------------------------------------------------------- 5. la foudre en boule
hfDef('foudre_boule', {
  cat: 'ciel', poids: 1.1, ecart: 10, public: true, duree: 0.5, fenetre: 2.5,
  peut: (c) => !!hfPeriode(c.P, ['storm', 'dry'], 8, 23),
  heure: (c, r) => { const p = hfPeriode(c.P, ['storm', 'dry'], 8, 23); return p ? p[0] + 0.2 + r * Math.max(0.2, Math.min(1.5, p[1] - p[0] - 0.4)) : null; },
  pret: (X) => (X.dehors || X.ferme || X.ville || X.hameau) && weather.cur.storm > 0.4 && !game.player.underground,
  sansNous: () => true,
  lancer(E) {
    const p = game.player, e = p.eyePos(), f = cameraBasis(p.yaw, 0).f;
    // elle vient de devant, un peu de côté, à hauteur d'homme
    const a = Math.atan2(f[0], f[2]) + (Math.random() - 0.5) * 1.6, r = 14 + Math.random() * 8;
    const P = hfPoint(e[0], e[2], r * 0.8, r * 1.2, { a, ouv: 0.8, r: 0.3, arbres: false }) || { x: e[0] + Math.sin(a) * r, z: e[2] + Math.cos(a) * r };
    E.x = P.x; E.z = P.z; E.y = hfSol(P.x, P.z) + 1.4 + Math.random() * 0.8;
    E.vie = 7 + Math.random() * 6; E.t0 = 0; E.ph = Math.random() * 6; E.sonT = 0;
    E.eclate = Math.random() < 0.55; E.fin0 = false; E.vu = false;
    E.dir = Math.atan2(e[0] - E.x, e[2] - E.z) + (Math.random() - 0.5) * 0.9;
  },
  maj(E, dt, eye) {
    if (E.fin0) { E.fini = 'fin'; return; }
    E.t0 += dt;
    const w = game.world;
    // elle flotte, lentement, en hésitant ; elle suit le sol à hauteur d'homme
    E.dir += Math.sin(E.t0 * 0.9 + E.ph) * dt * 0.8;
    const v = 0.9 + Math.sin(E.t0 * 0.5) * 0.4;
    E.x += Math.sin(E.dir) * v * dt; E.z += Math.cos(E.dir) * v * dt;
    E.y = lerp(E.y, w.groundAt(E.x, E.z, E.y, 1.5) + 1.3 + Math.sin(E.t0 * 1.3) * 0.25, Math.min(1, dt * 1.5));
    if (Math.random() < dt * 10) particles.spawn(E.x, E.y, E.z, 0, 0, 0, [0.75, 0.8, 1.3, 0.3], 0.5 + Math.random() * 0.25, 0.2, 0, true);
    if (Math.random() < dt * 14) particles.spawn(E.x + (Math.random() - 0.5) * 0.2, E.y + (Math.random() - 0.5) * 0.2, E.z + (Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8, [0.8, 0.85, 1.4, 0.8], 0.04, 0.3, 0, true);
    E.sonT -= dt;
    if (E.sonT <= 0) { E.sonT = 0.9 + Math.random() * 0.5; hfSon([E.x, E.y, E.z], () => sound.hfGresille && sound.hfGresille(0.7)); }
    const d = Math.hypot(E.x - eye[0], E.y - eye[1], E.z - eye[2]);
    if (!E.vu && d < 30 && hfRegarde(E.x, E.y, E.z, 0.8)) { E.vu = true; hasardF.noter(E); }
    if (E.t0 >= E.vie) {
      E.fin0 = true;
      if (E.eclate) {
        weather.flash = Math.max(weather.flash, 0.9);
        hfSon([E.x, E.y, E.z], () => sound.hfFoudre && sound.hfFoudre(clamp(1.2 - d / 60, 0.3, 1)), HF_FORT);
        for (let k = 0; k < 36; k++) particles.spawn(E.x, E.y, E.z, (Math.random() - 0.5) * 9, (Math.random() - 0.5) * 9, (Math.random() - 0.5) * 9, [1.3, 1.2, 1.5, 1], 0.06, 0.4 + Math.random() * 0.4, 4, true);
        entities.scare(E.x, E.z, 40);
        if (d < 2.2 && !game.sleeping) { play.hurt(8, null, 'Brûlé par la foudre en boule'); hfPense('(Une odeur de soufre. Vos cils ont roussi.)', 3.5); }
        else if (E.vu) hfPense('(L’air sent le soufre.)', 3);
      }
    }
  },
  dessin(E, buf) {
    if (E.fin0) return;
    PE.buf = buf; PE.fl = FX_EMIT;
    const t = game.time, s = 0.3 + Math.sin(t * 23) * 0.03;
    PE.frame(E.x, E.y, E.z, t * 3, 1);
    PE.box(0, 0, 0, s, s, s, [1.6, 1.7, 2.4], TL.plain, t * 3, t * 2);
    PE.box(0, 0, 0, s * 0.8, s * 1.15, s * 0.8, [1.4, 1.3, 2.0], TL.plain, -t * 2, t);
    PE.box(0, 0, 0, s * 1.15, s * 0.8, s * 0.8, [1.8, 1.4, 1.2], TL.plain, t, -t * 3);
    PE.fl = 0;
  },
  lum(E, eye) { return E.fin0 ? [] : [{ x: E.x, y: E.y, z: E.z, r: 7, c: [0.7, 0.75, 1.3], d: Math.hypot(E.x - eye[0], E.z - eye[2]) }]; },
  txt: {
    journal: 'Pendant l’orage, une boule de lumière a flotté dans l’air, à hauteur d’homme, en grésillant. Puis elle a disparu.',
    apres: ['Une boule de feu, pendant l’orage ! Elle est entrée par une cheminée, elle a fait le tour de la cuisine, et elle est ressortie par la fenêtre. Personne n’a rien eu. Le chat, si.', 'La foudre en boule, ça existe. Mon père l’a vue rouler sur la table, entre les assiettes. Il n’a jamais voulu qu’on en parle à table.', 'Hier, pendant l’orage, il y avait comme une lanterne qui flottait toute seule au-dessus du chemin.'],
  },
});

// ---------------------------------------------------------------- 6. le rayon vert, au bord du lac
hfDef('rayon_vert', {
  cat: 'ciel', tirage: 'heure', parHeure: 0.9, ecart: 9, duree: 0.6,
  ici: (X) => X.lac && X.dehors && (X.meteo === 'clear' || X.meteo === 'heat' || X.meteo === 'frost') && X.h > 17.2 && X.h < 18.6 && game.sky && game.sky.e > 0.012 && game.sky.e < 0.07,
  lancer(E) { E.ph = 0; E.flashT = 0; },
  maj(E, dt, eye) {
    const sky = game.sky;
    if (!sky) return;
    // le dernier éclat du soleil, quand il touche l'horizon : vert, deux ou trois secondes
    E.voitT = (E.voitT || 0) - dt;
    if (E.ph === 0 && E.voitT <= 0) {
      E.voitT = 0.15;
      // le haut du soleil touche ce qui borne la vue : la ligne de l'eau, ou la rive d'en face
      const S = sky.sunDir, haut = v3.norm([S[0], S[1] + 0.012, S[2]]), w = game.world;
      const h = w.raycastTerrain(eye, haut, 500);
      if (sky.e < 0.006 || h) { E.ph = 1; E.flashT = 2.6; E.R = h ? Math.max(20, Math.min(88, h.t ? h.t * 0.92 : 88)) : 88; E.dirF = haut; }
    }
    if (E.ph === 1) {
      E.flashT -= dt;
      const S = E.dirF || sky.sunDir, az = hfAz(S), el = hfEl(S), R = E.R || 88, sz = R / 88;
      if (Math.random() < dt * 40) for (let i = -2; i <= 2; i++) hfEtoile(eye, [Math.sin(az + i * 0.0045) * Math.cos(el), Math.sin(el - 0.004 + Math.random() * 0.002), Math.cos(az + i * 0.0045) * Math.cos(el)], R, [0.25, 1.5, 0.6, 0.55 - Math.abs(i) * 0.12], 0.55 * sz, 0.25);
      if (!E.note && hfRegarde(eye[0] + S[0] * 60, eye[1] + S[1] * 60, eye[2] + S[2] * 60, 0.9)) { hasardF.noter(E); hasardF.retenir('rayon_vert'); hfPense('(Vert. Un instant.)', 2.5); }
      if (E.flashT <= 0) E.fini = 'fin';
    }
    if (sky.e < -0.03) E.fini = 'fin';
  },
  ciel(E, sky) {
    if (E.ph !== 1 || E.flashT <= 0) return;
    const k = Math.min(1, E.flashT * 1.5, (2.6 - E.flashT) * 4);
    sky.sunDisk = v3.lerp(sky.sunDisk, [0.35, 1.9, 0.6], k);
    sky.glow = v3.lerp(sky.glow, v3.scale([0.2, 0.9, 0.4], Math.max(0.2, sky.glow[1])), 0.5 * k);
  },
  txt: {
    journal: 'Au bord du lac, le soleil s’est couché sur un éclat vert. Une seconde, pas plus.',
    apres: ['Le rayon vert ? Je l’ai vu deux fois dans ma vie, au bord du lac. On dit qu’après, on ne se trompe plus sur les gens.', 'Vous l’avez vu, le rayon vert ? Moi, jamais. J’étais toujours en train de cligner.'],
  },
});

// ---------------------------------------------------------------- 7. le feu Saint-Elme
const HF_POINTES = ['croix', 'calvaire', 'lampadaire', 'mat_drapeau', 'epouvantail', 'poteau_dir', 'croix_bois', 'c2_croix_pierre', 'panneau', 'statue_saint', 'c2_signal', 'menhir', 'c2_menhir', 'pierre_dressee'];
const HF_POINTE_H = { croix: 2.4, calvaire: 3.6, lampadaire: 3.3, mat_drapeau: 6, epouvantail: 2.3, poteau_dir: 2.1, croix_bois: 1.9, c2_croix_pierre: 2.3, panneau: 1.6, statue_saint: 2.4, c2_signal: 2.6, menhir: 3, c2_menhir: 3, pierre_dressee: 2.6 };
hfDef('saint_elme', {
  cat: 'ciel', tirage: 'heure', parHeure: 0.55, ecart: 10, duree: 0.45,
  ici: (X) => X.dehors && weather.cur.storm > 0.55 && (X.soir || X.nuit || (game.sky && game.sky.e < 0.25)),
  lancer(E) {
    const p = game.player.pos;
    E.pts = hfProps(HF_POINTES, p[0], p[2], 26).slice(0, 5).map((q) => ({ x: q.x, y: q.y + (HF_POINTE_H[q.id] || 2) * (q.s || 1), z: q.z }));
    E.tete = !E.pts.length || Math.random() < 0.4;
    E.sonT = 0.5;
    if (E.tete) hfPense('(Vos cheveux se dressent sur votre tête.)', 3.5);
  },
  maj(E, dt, eye) {
    const k = hfK(E, 0.05, 0.12), p = game.player;
    const pts = E.tete ? E.pts.concat([{ x: eye[0], y: eye[1] + 0.45, z: eye[2], tete: true }]) : E.pts;
    for (const P of pts) {
      if (Math.random() < dt * 22 * k) {
        const x = P.tete ? eye[0] + (Math.random() - 0.5) * 0.5 : P.x, z = P.tete ? eye[2] + (Math.random() - 0.5) * 0.5 : P.z;
        particles.spawn(x + (Math.random() - 0.5) * 0.15, P.y + Math.random() * 0.2, z + (Math.random() - 0.5) * 0.15, (Math.random() - 0.5) * 0.3, 0.5 + Math.random() * 0.6, (Math.random() - 0.5) * 0.3, [0.45, 0.6, 1.3, 0.75], 0.09 + Math.random() * 0.08, 0.35 + Math.random() * 0.3, -0.3, true);
      }
    }
    E.sonT -= dt;
    if (E.sonT <= 0 && k > 0.2) {
      E.sonT = 1.4 + Math.random() * 1.6;
      const P = pts[(Math.random() * pts.length) | 0];
      if (P) hfSon([P.x, P.y, P.z], () => sound.hfGresille && sound.hfGresille(0.8 * k));
    }
    if (!E.note && E.age > 0.05) { hasardF.noter(E); hasardF.retenir('saint_elme'); }
    void p;
  },
  lum(E, eye) {
    const k = hfK(E, 0.05, 0.12);
    return E.pts.slice(0, 3).map((P) => ({ x: P.x, y: P.y, z: P.z, r: 4 * k, c: [0.35, 0.5, 1.2], d: Math.hypot(P.x - eye[0], P.z - eye[2]) }));
  },
  txt: {
    journal: 'Pendant l’orage, des flammes bleues sont venues au bout des croix et des piquets. Elles ne brûlaient pas.',
    apres: ['Des feux bleus sur la croix du calvaire, pendant l’orage. Saint Elme veillait, qu’on dit. Ou bien il cherchait quelqu’un.', 'Mon oncle, qui a été marin, les a vus en haut des mâts. Il disait que c’était bon signe. Il s’est noyé l’année d’après.'],
  },
});

// ---------------------------------------------------------------- 8. le linge envolé, un Lavedi de grand vent
hfDef('linge_envole', {
  cat: 'ciel', poids: 1.6, ecart: 6, public: true, duree: 1.6, fenetre: 3,
  peut: (c) => c.dow === 'lessive' && !c.pluieA(9, 16),
  heure: (c, r) => 10.2 + r * 4,
  pret: (X) => X.dehors && hfProps(['corde_linge'], X.pos[0], X.pos[2], 70).length > 0,
  sansNous: () => true,
  lancer(E) {
    const p = game.player.pos, C = hfProps(['corde_linge'], p[0], p[2], 70)[0];
    if (!C) { if (!E.force) return false; }
    const cx = C ? C.x : p[0] + 8, cz = C ? C.z : p[2] + 8;
    E.cx = cx; E.cz = cz;
    E.vent = Math.random() * TAU;
    E.draps = [];
    for (let i = 0; i < 2 + (Math.random() < 0.5 ? 1 : 0); i++) E.draps.push({ x: cx + (Math.random() - 0.5) * 2, y: hfSol(cx, cz) + 1.7, z: cz + (Math.random() - 0.5) * 2, vy: 1.5 + Math.random() * 1.5, v: 4 + Math.random() * 2.5, a: E.vent + (Math.random() - 0.5) * 0.7, r: [0, Math.random() * TAU, 0], st: 'vol', t: 0, tvol: 7 + Math.random() * 7, col: pick([[1.35, 1.33, 1.28], [1.3, 1.27, 1.18], [1.15, 1.2, 1.3]]) });
    // la lavandière court après
    const P = hfPoint(cx, cz, 1.5, 3, { r: 0.4 }) || { x: cx + 1.5, z: cz };
    E.lav = hfPerso(hfLook('paysanne', { top: '#5a6a8a', hat: 'bonnet' }), P.x, P.z, { nom: 'La lavandière', voix: 1.3, vit: 2.6 });
    sound.wind1 && sound.wind1();
    hfSon([cx, hfSol(cx, cz) + 1.7, cz], () => sound.hfDrap && sound.hfDrap(1));
    setTimeout(() => { if (hasardF.actifs.linge_envole === E) hfDit(E.lav, pick(['Mes draps ! Rattrapez-les, pour l’amour du ciel !', 'Oh non, non, non… mes draps !']), 3); }, 900);
    E.porte = -1; E.rendus = 0;
    hasardF.cible(E, { pos: () => { const D = E.draps.find((d) => d.st === 'sol'); return D ? [D.x, D.y + 0.2, D.z] : null; }, r: 2.8, lab: 'Ramasser le drap', vis: () => E.porte < 0 && E.draps.some((d) => d.st === 'sol' && hfDistJ(d.x, d.z) < 3.2), use() { const i = E.draps.findIndex((d) => d.st === 'sol' && hfDistJ(d.x, d.z) < 3.2); if (i >= 0) { E.draps[i].st = 'porte'; E.porte = i; sound.hfDrap && sound.hfDrap(0.5); } } });
    hasardF.cible(E, { pos: () => [E.lav.x, E.lav.y + 1.2, E.lav.z], r: 3, lab: 'Rendre le drap', vis: () => E.porte >= 0, use() { const D = E.draps[E.porte]; if (D) D.st = 'rendu'; E.porte = -1; E.rendus++; farm.earn(2); sound.coin && sound.coin(); hfDit(E.lav, pick(['Merci ! Sans vous, il finissait dans la rivière.', 'Que Dieu vous le rende. Tenez, pour la peine.', 'Il est tout vert, mais il est là. Merci.']), 3.5); if (E.rendus === 1) hasardF.bienfait('lavandiere'); } });
  },
  maj(E, dt) {
    const w = game.world;
    for (const D of E.draps) {
      if (D.st !== 'vol') continue;
      D.t += dt;
      const g = Math.sin(D.t * 1.7) * 0.6;
      D.x += Math.sin(D.a) * D.v * dt; D.z += Math.cos(D.a) * D.v * dt;
      D.vy -= (D.t > D.tvol * 0.5 ? 1.2 : 0.2) * dt; D.y += (D.vy + g) * dt;
      D.r[0] += dt * 2.3; D.r[2] += dt * 1.6;
      const sol = w.groundAt(D.x, D.z, D.y + 1, 1) + 0.04;
      if (D.y <= sol || D.t > D.tvol + 6) { D.y = Math.max(sol, w.waterLevel + 0.02); D.st = w.heightAt(D.x, D.z) < w.waterLevel ? 'perdu' : 'sol'; D.r = [0, D.r[1], 0]; }
    }
    // la lavandière va vers le drap tombé le plus proche, le ramasse si on la devance pas
    const L = E.lav;
    if (L) {
      const cible = E.draps.filter((d) => d.st === 'sol').sort((a, b) => Math.hypot(a.x - L.x, a.z - L.z) - Math.hypot(b.x - L.x, b.z - L.z))[0];
      if (cible) {
        if (!L.chemin || L.cible !== cible) { L.cible = cible; hfAller(L, [[cible.x, cible.z]], 1.9); }
        hfMarche(L, dt);
        if (Math.hypot(cible.x - L.x, cible.z - L.z) < 0.8) { cible.st = 'repris'; L.chemin = null; }
      } else if (E.porte < 0) {
        if (!L.retour) { L.retour = true; hfAller(L, [[E.cx + 1.2, E.cz]], 1.3); }
        hfMarche(L, dt);
      } else { L.move = lerp(L.move, 0, Math.min(1, dt * 5)); hfFace(L, game.player.pos[0], game.player.pos[2], dt); }
    }
    if (!E.note && E.draps.some((d) => hfDistJ(d.x, d.z) < 25)) { hasardF.noter(E); hasardF.reagir('linge_envole', 'pendant', E.cx, E.cz); }
    if (E.draps.every((d) => d.st === 'rendu' || d.st === 'repris' || d.st === 'perdu') && E.porte < 0 && E.age > 0.3 && L && L.arrive) E.fini = 'fin';
  },
  dessin(E, buf, sbuf, cam, t) {
    PE.buf = buf; PE.fl = 0;
    for (const D of E.draps) {
      if (D.st === 'vol' || D.st === 'sol') {
        PE.frame(D.x, D.y, D.z, D.r[1], 1);
        PE.box(0, 0, 0, 1.1, 0.03, 1.4, D.col, TL.cloth, 0, D.r[0], D.r[2]);
      }
    }
    if (E.lav) hfDessine(E.lav, buf, sbuf, cam, t);
  },
  txt: {
    journal: 'Un Lavedi de grand vent, les draps d’une lavandière se sont envolés à travers les prés.',
    pendant: ['Au voleur ! C’est le vent, le voleur !', 'Courez, courez, il va jusqu’à la rivière !'],
    apres: ['Hier, le vent a pris le linge. On a couru après les draps jusqu’au soir.', 'Un drap dans le pommier, un autre dans la mare. Ma lessive est à refaire.', 'Le vent de Lavedi, c’est une vieille histoire. Il n’aime pas qu’on lave.'],
  },
});

// ---------------------------------------------------------------- 9. la pluie au soleil
hfDef('pluie_soleil', {
  cat: 'ciel', poids: 1, ecart: 6, public: true, duree: 0.8, fenetre: 1.2,
  peut: (c) => !c.P.storm && !!hfPeriode(c.P, ['rain'], 9, 17),
  heure: (c, r) => { const p = hfPeriode(c.P, ['rain'], 9, 17); return p ? p[0] + 0.25 + r * Math.max(0.1, Math.min(1.5, p[1] - p[0] - 0.9)) : null; },
  pret: (X) => X.dehors && weather.cur.rain > 0.25 && game.sky && game.sky.e > 0.18,
  sansNous: () => true,
  lancer(E) { E.dit = false; },
  maj(E, dt, eye) {
    const sky = game.sky;
    if (!sky) return;
    const k = hfK(E, 0.12, 0.25);
    hfArc(eye, sky.sunDir, k * 0.55, false, dt, E);
    if (!E.dit && k > 0.6 && hfDehorsVrai()) { E.dit = true; hasardF.noter(E); hasardF.reagir('pluie_soleil', 'pendant'); }
  },
  ciel(E, sky) { hfEclaircie(sky, hfK(E, 0.12, 0.25) * sky.day); sky.hor = v3.lerp(sky.hor, [0.95, 0.85, 0.62], 0.2 * hfK(E, 0.12, 0.25) * sky.day); },
  txt: {
    journal: 'Il a plu en plein soleil : des gouttes dorées, et la lumière comme un soir d’été.',
    pendant: ['Le diable bat sa femme et marie sa fille !', 'De la pluie au soleil ! Regardez comme ça brille !'],
    apres: ['Hier, il pleuvait au soleil. Le diable battait sa femme, comme on dit.', 'Pluie au soleil, le loup se marie. C’est ce qu’on dit dans les Combes.'],
  },
});

// ---------------------------------------------------------------- 10. la comète (sept nuits)
const HF_COMETE_K = [0.45, 0.75, 1, 0.95, 0.75, 0.5, 0.28];
hfDef('comete', {
  cat: 'ciel', poids: 0.45, premier: 10, fois: 1, public: true, fenetre: 3, annonce: false,
  peut: (c) => c.d >= 10,
  heure: (c, r) => 20 + r * 1.5,
  pret: () => true,
  lancer(E) {
    E.long = true;
    const S = hasardF.S();
    E.L = S.long.comete = { d0: farm.s.day, az: Math.PI * (0.55 + Math.random() * 0.9), el: 0.32 + Math.random() * 0.12, tail: (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random() * 0.4), mail: false, h0: farm.s.hours };
  },
  restaurer(L) { return { L, long: true }; },
  // arrêtée (fin des sept nuits, ou essai) : elle ne revient pas au chargement
  fin(E) { const S = hasardF.S(); if (S.long.comete === E.L) delete S.long.comete; },
  chaqueJour(L, d, E) {
    const i = d - L.d0;
    if (i >= HF_COMETE_K.length) { delete hasardF.S().long.comete; if (E) hasardF.arreter(E, 'fin'); return; }
    hasardF.retenir('comete');
    // la bibliothèque écrit, le deuxième matin
    if (i === 1 && !L.mail && npcs.alive && npcs.alive('libraire')) {
      L.mail = true;
      farm.mail('La grande bibliothèque', 'Note sur la comète', 'Madame, Monsieur,\n\nLa comète que chacun peut voir au couchant n’a rien d’un présage. Elle est déjà passée, en 1811, d’après nos registres : elle avait alors une queue si longue qu’on la voyait de jour, et l’on fit cette année-là un vin si bon qu’on l’appelle encore le vin de la comète.\n\nNos registres disent aussi qu’en 1811, dans cette vallée, on cessa de sonner les cloches pendant les sept nuits où elle fut visible. Ils ne disent pas pourquoi.\n\nJe vous serais obligé de ne pas répéter cette dernière phrase au curé.\n\nLe bibliothécaire.');
    }
  },
  maj(E, dt, eye) {
    const L = E.L, sky = game.sky;
    if (!L || !sky || game.player.underground) return;
    const i = farm.s.day - L.d0 + (npcs.hour() < 6 ? -1 : 0);
    const k = (HF_COMETE_K[clamp(i, 0, HF_COMETE_K.length - 1)] || 0) * smoothstep(0.35, 0.8, sky.night) * (1 - weather.cur.cloud * 0.85) * (1 - weather.cur.fog * 0.8);
    E.anT = (E.anT || 0) - dt;
    if (E.anT <= 0 && k > 0.03) {
      E.anT = 0.3;
      const tete = [Math.sin(L.az) * Math.cos(L.el), Math.sin(L.el), Math.cos(L.az) * Math.cos(L.el)];
      for (let j = 0; j < 4; j++) hfEtoile(eye, tete, 90, [1.1, 1.15, 1.25, (j ? 0.3 : 0.8) * k], 1.0 + j * 0.9, 0.75);
      // la queue : une longue traînée pâle, qui s'élargit
      for (let j = 1; j <= 22; j++) {
        const f = j / 22, a = L.az + L.tail * f * 0.42 + (Math.random() - 0.5) * 0.02 * (1 + f * 3), e = L.el + f * 0.26 + (Math.random() - 0.5) * 0.02 * (1 + f * 3);
        hfEtoile(eye, [Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e)], 90, [0.75, 0.85, 1.05, 0.26 * k * (1 - f * 0.8)], 1.4 + f * 3, 0.75);
      }
    }
    if (k > 0.3 && !E.vuJ && hfDehorsVrai()) {
      const d = [Math.sin(L.az), Math.sin(L.el), Math.cos(L.az)];
      if (hfRegarde(eye[0] + d[0] * 50, eye[1] + d[1] * 50, eye[2] + d[2] * 50, 0.85)) { E.vuJ = farm.s.day; if (!E.note) hasardF.noter(E); }
    }
  },
  txt: {
    journal: 'Une comète, sept nuits durant, au-dessus des collines. Sa queue s’allongeait chaque soir, puis elle a pâli.',
    apres: ['Vous l’avez vue, la comète ? Le curé dit qu’il ne faut pas la montrer du doigt.', 'Une étoile chevelue, comme en 1811. Mon grand-père disait que ce vin-là guérissait tout.', 'La comète annonce la guerre, ou une bonne vendange. On verra bien laquelle.', 'Mes poules ne pondent plus depuis que la comète est là. C’est peut-être une coïncidence.'],
  },
});
