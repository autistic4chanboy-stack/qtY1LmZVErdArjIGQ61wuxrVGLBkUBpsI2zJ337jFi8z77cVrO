// ============================================================================
//  LES TÉNÈBRES : la retombée d'une pilule de joie
//  La vallée morte, rouge et noire : arbres morts, ronces, des mains à la place
//  des fleurs, plus un habitant, un ciel de sang séché. Une cathédrale noire
//  se dresse, avec au fond un cœur qui bat ; des cages pendent à des gibets ;
//  des choses rampent vers vous quand vous ne les regardez pas, un chien sans
//  peau vous flaire, une grande ombre vous observe de loin. Les blessures de
//  la vision sont celles que l'on se fait soi-même : on n'en meurt pas… sauf
//  quand on a trop abusé des pilules.
//  mondes.entrer('tenebres', { duree (heures), durete (0..1.5) })
// ============================================================================
defItem('cendre', 'Cendre', 'materiau', 0, ['tas', '#8a8680'], { desc: 'Une poignée de cendre grise, légère, qui ne sent rien.' });
defItem('coeur_noir', 'Cœur noir', 'ailleurs', 190, ['md_coeur', '#1a1418', '#a01818'], { desc: 'Un cœur de pierre noire pris sur l’autel d’une cathédrale qui n’existe pas. Parfois, il bat.' });
defItem('oeil_verre', 'Œil de verre', 'ailleurs', 45, ['md_oeil', '#6a8a9a'], { desc: 'Un œil de verre, donné par un enfant dans une cage. Il regarde toujours quelque chose derrière vous.' });
defItem('plume_ombre', 'Plume d’ombre', 'ailleurs', 0, ['plume', '#101014'], { desc: 'Une plume si noire qu’on n’en voit pas les bords.' });
defItem('ronce_noire', 'Ronce noire', 'ailleurs', 0, ['md_ronce', '#1a1214', '#a01414'], { desc: 'Une tige de ronce noire. Les épines sont rouges au bout.' });
defItem('lys_cendre', 'Lys de cendre', 'ailleurs', 0, ['md_lys', '#b8b4ac'], { desc: 'Un lys gris, sec, qui s’effrite sous les doigts.' });
defItem('cle_cage', 'Clé des cages', 'ailleurs', 0, ['md_cle', '#6a3a24'], { desc: 'Une grosse clé rouillée, pendue au gibet.' });
const TENEBRES_RETOUR = { plume_ombre: 'plume_noire', ronce_noire: 'fibre', lys_cendre: 'cendre', cle_cage: null, coeur_noir: 'coeur_noir', oeil_verre: 'oeil_verre' };

// ---------------------------------------------------------------- les bêtes des Ténèbres
const TN = {
  // ne bouge que lorsqu'on ne le regarde pas (comme les Pâles), se jette sur vous quand il est tout près
  rampant(e, dt) {
    const p = game.player, eye = p.eyePos(), f = cameraBasis(p.yaw, p.pitch).f;
    const dx = e.x - eye[0], dy = e.y + 0.5 - eye[1], dz = e.z - eye[2], d = Math.hypot(dx, dy, dz) || 1;
    let vu = (dx * f[0] + dy * f[1] + dz * f[2]) / d > Math.cos(settings.fov * DEG * 0.55);
    e.murT = (e.murT || 0) - dt;
    if (vu && e.murT <= 0) { e.murT = 0.2; e.mur = !!game.world.raycastBlocks(eye, [dx / d, dy / d, dz / d], d - 0.5); }
    if (e.mur) vu = false;
    e.heading = turnToward(e.heading, Math.atan2(p.pos[0] - e.x, p.pos[2] - e.z), dt * 3);
    if (vu && e.dist > 2.2) { e.move = 0; e.vuT = (e.vuT || 0) + dt; if (e.vuT > 0.4 && !e.gemi) { e.gemi = true; MSON.gemissement(clamp(1 - e.dist / 40, 0.2, 1), 0); } return true; }
    e.vuT = 0; e.gemi = false;
    if (e.dist > 70) { // trop loin : il revient derrière vous
      const a = p.yaw + (Math.random() - 0.5) * 1.6, r = 30 + Math.random() * 15, x = p.pos[0] + Math.sin(a) * r, z = p.pos[2] + Math.cos(a) * r;
      if (game.world.inside(x, z, 10) && game.world.heightAt(x, z) > game.world.waterLevel) { e.x = x; e.z = z; e.y = mondes.solY(x, z); }
      return true;
    }
    if (e.dist > 1.3) { this.marcher(e, dt, Math.atan2(p.pos[0] - e.x, p.pos[2] - e.z), e.d.vitesse[e.dist < 8 ? 1 : 0] * (1 + MONDES.tenebres.durete * 0.4)); e.run = e.dist < 8; }
    else if (e.atkT <= 0) { e.atkT = 1.8; e.attaque = 0.4; MSON.cri(0.55, 0.7, 0.9, 0); this.blesser(e.d.degats, e, e.d.cause); strange.glitchT = Math.max(strange.glitchT, 0.4); }
    return true;
  },
  // la grande ombre : toujours loin, toujours tournée vers vous ; s'efface quand on approche
  ombre(e, dt) {
    const p = game.player;
    e.heading = Math.atan2(p.pos[0] - e.x, p.pos[2] - e.z); e.move = 0;
    if (e.dist < 28 || e.dist > 140) {
      if (e.dist < 28) { strange.glitchT = Math.max(strange.glitchT, 0.5); sound.glitchSnd && sound.glitchSnd(0.6); }
      for (let t = 0; t < 12; t++) { const a = Math.random() * TAU, r = 55 + Math.random() * 30, x = p.pos[0] + Math.sin(a) * r, z = p.pos[2] + Math.cos(a) * r; if (game.world.inside(x, z, 10) && game.world.heightAt(x, z) > game.world.waterLevel) { e.x = x; e.z = z; e.y = mondes.solY(x, z); break; } }
    }
    strange.fear = Math.max(strange.fear, clamp(1 - e.dist / 70, 0, 0.6));
    return true;
  },
  // le chien sans peau : chasse, mais la lumière de la lanterne le tient à distance
  chien(e, dt) {
    const p = game.player;
    if (game.lantern && farm.count('lanterne') && e.dist < 9) {
      e.state = 'fuite'; e.timer = 2.5; e.fuiteDir = Math.atan2(e.x - p.pos[0], e.z - p.pos[2]);
      if (!e.grogne) { e.grogne = true; sound.growl && sound.growl(0.8); }
    } else e.grogne = false;
    if (e.state === 'fuite') { e.timer -= dt; this.marcher(e, dt, e.fuiteDir, e.d.vitesse[1]); e.run = true; if (e.timer <= 0) e.state = 'chasse'; return true; }
    return IA_MONDE.chasseur.call(this, e, dt);
  },
};
Object.assign(BETES_MONDE, {
  rampant: { rig: () => MONDES_RIGS.rampant(), h: 0.9, r: 0.35, hp: 30, vitesse: [1.4, 3.8], ia: TN.rampant, degats: 7, cause: 'Mort de terreur, pendant une vision, les ongles plantés dans ses propres bras', actif: 200,
    pose(e, r, t, st) {
      poseHuman(r, { move: e.move, phase: e.phase, t, pale: true });
      r.part('hips').p[1] = 0.42;
      r.set('torso', 1.35, 0, Math.sin(e.phase) * 0.1);
      const s = Math.sin(e.phase * 1.3) * 0.5 * e.move;
      r.set('armL', -1.45 + s, 0, 0.1); r.set('armR', -1.45 - s, 0, -0.1);
      r.set('legL', 1.25 - s * 0.5, 0, 0); r.set('legR', 1.25 + s * 0.5, 0, 0);
      r.set('head', -1.1, 0, Math.sin(t * 3 + e.id) * 0.3);
    },
    meurt(e) { MSON.cri(0.8, 0.6, 1.2); puffAt(e.x, e.y + 0.5, e.z, [30, 10, 10], 14, 1.6, false); } },
  chien_ecorche: { rig: () => MONDES_RIGS.chien_ecorche(), h: 1.0, r: 0.35, hp: 26, vitesse: [1.4, 7.0], ia: TN.chien, vue: 34, perd: 80, portee: 1.3, degats: 9, cadence: 1.4, cause: 'Dévoré par une bête qui n’existait pas', actif: 200,
    alerte(e) { sound.growl && sound.growl(1); }, bruit(e) { sound.howl && sound.howl(e.dist); }, bruitT: 7, meurt(e) { MSON.cri(0.6, 0.5, 0.9); puffAt(e.x, e.y + 0.5, e.z, [120, 12, 10], 14, 1.6, false); } },
  ombre: { rig: () => MONDES_RIGS.ombre(), h: 4.4, r: 0.5, hp: 1, vitesse: [0, 0], ia: TN.ombre, fantome: true, sansOmbre: true, actif: 400, pale: true, echelle: 1.2 },
  pendu: { rig: () => MONDES_RIGS.pendu(), h: 1.8, r: 0.3, hp: 999, vitesse: [0, 0], intouchable: true, sansOmbre: true, actif: 200,
    ia(e, dt) { const p = game.player; e.heading = turnToward(e.heading, Math.atan2(p.pos[0] - e.x, p.pos[2] - e.z), dt * (e.dist < 12 ? 0.8 : 0.1)); e.move = 0; return true; },
    pose(e, r, t) { poseHuman(r, { move: 0, t, pale: true, tilt: 0.35 + Math.sin(t * 0.7) * 0.05 }); r.set('head', 0.5, 0, 0.6); r.set('legL', 0.05, 0, 0.03); r.set('legR', -0.03, 0, -0.03); },
    touche(e) { MSON.grince(1); ui.subtitle('', '(Le corps se balance. Il ne pèse rien.)', 3); } },
  enfant_cage: { rig: () => MONDES_RIGS.ame(0), h: 1.2, r: 0.25, hp: 999, vitesse: [0, 0], ia: 'immobile', regard: 20, echelle: 0.72, intouchable: true, sansOmbre: true,
    proche(e) { MSON.sanglot(0.8); }, parler(e) { MONDES.tenebres.cageEnfant(e); } },
});

// ---------------------------------------------------------------- modèles (boîtes)
const TNM = {
  noir: [0.1, 0.09, 0.1], os: [0.86, 0.82, 0.72], rouille: [0.42, 0.22, 0.14], sang: [0.5, 0.04, 0.03],
  cage(E, c, t) {
    const sw = Math.sin(t * 0.8 + c.id) * 0.06;
    if (c.suspendu) E.bx(0.3 + sw, 3.1, 0, 0.03, 6, 0.03, TNM.rouille, TL.iron);
    else { E.bx(-1.3, 0, 0, 0.22, 4.2, 0.22, [0.3, 0.26, 0.22], TL.darkwood); E.bx(-0.5, 4.0, 0, 1.9, 0.2, 0.22, [0.3, 0.26, 0.22], TL.darkwood); E.bx(0.3, 3.1, 0, 0.03, 0.9, 0.03, TNM.rouille, TL.iron); }
    const y0 = 1.3;
    for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; E.box(0.3 + Math.cos(a) * 0.5 + sw, y0 + 0.9, Math.sin(a) * 0.5, 0.05, 1.8, 0.05, TNM.rouille, TL.iron); }
    E.box(0.3 + sw, y0, 0, 1.1, 0.08, 1.1, TNM.rouille, TL.iron); E.box(0.3 + sw, y0 + 1.8, 0, 1.1, 0.08, 1.1, TNM.rouille, TL.iron);
    if (c.os) { E.box(0.3 + sw, y0 + 0.2, 0, 0.3, 0.3, 0.26, TNM.os, TL.bone); E.box(0.4 + sw, y0 + 0.1, 0.1, 0.5, 0.08, 0.08, TNM.os, TL.bone, 0.5); E.box(0.15 + sw, y0 + 0.12, -0.1, 0.45, 0.07, 0.07, TNM.os, TL.bone, -0.8); }
  },
  gibet(E) {
    E.bx(0, 0, 0, 0.3, 5.2, 0.3, [0.26, 0.22, 0.18], TL.darkwood); E.bx(1.2, 5.0, 0, 2.7, 0.28, 0.3, [0.26, 0.22, 0.18], TL.darkwood);
    E.box(0.4, 4.4, 0, 0.12, 1.4, 0.12, [0.26, 0.22, 0.18], TL.darkwood, 0, 0, -0.8);
    E.bx(2.2, 3.1, 0, 0.04, 1.9, 0.04, [0.5, 0.42, 0.3], TL.rope);
    E.bx(-0.9, 0, -0.9, 2.2, 0.3, 2.2, [0.24, 0.2, 0.16], TL.darkwood);
  },
  cle(E, c, t) { E.bx(0, 0, 0, 0.03, 0.4, 0.03, [0.5, 0.42, 0.3], TL.rope); E.box(0, -0.05, 0, 0.1, 0.1, 0.03, TNM.rouille, TL.iron); E.box(0, -0.22, 0, 0.03, 0.25, 0.03, TNM.rouille, TL.iron); E.box(0.04, -0.32, 0, 0.06, 0.04, 0.03, TNM.rouille, TL.iron); },
  coeur(E, c, t) {
    const b = 1 + Math.max(0, Math.sin(t * 5)) * 0.12;
    E.fl = FX_EMIT; E.box(0, 0.25, 0, 0.36 * b, 0.34 * b, 0.26 * b, [0.5 + Math.max(0, Math.sin(t * 5)) * 0.4, 0.04, 0.04], TL.blood); E.fl = 0;
    E.box(0.08, 0.46, 0, 0.08, 0.14, 0.08, [0.3, 0.02, 0.02], TL.blood, 0, 0.3); E.box(-0.08, 0.45, 0.02, 0.07, 0.12, 0.07, [0.3, 0.02, 0.02], TL.blood, 0, -0.3);
  },
  autel(E) { E.bx(0, 0, 0, 3.2, 1.1, 1.6, [1, 1, 1], mt(M_OBSIDIENNE)); E.bx(0, 1.1, 0, 3.4, 0.14, 1.8, [0.16, 0.14, 0.16], TL.stone); E.bx(-1.2, 1.24, 0.3, 0.5, 0.05, 0.5, TNM.sang, TL.blood); },
  banc(E, c) { const k = c.v % 3; E.box(0, 0.45, 0, 3.4 - k * 0.8, 0.08, 0.5, [0.22, 0.18, 0.15], TL.darkwood, 0, 0, k === 2 ? 0.25 : 0); for (const s of [-1.3, 1.3]) if (k !== 1 || s < 0) E.bx(s, 0, 0, 0.1, 0.45, 0.45, [0.2, 0.16, 0.14], TL.darkwood); E.bx(0, 0.5, 0.22, 3.4 - k * 0.8, 0.5, 0.06, [0.22, 0.18, 0.15], TL.darkwood); },
  vitrail(E, c, t) { E.fl = FX_EMIT; const k = 0.75 + Math.sin(t * 0.9 + c.id) * 0.15; E.bx(0, 0, 0, 1.2, 5.5, 0.08, [0.75 * k, 0.05, 0.05], TL.glass); E.box(0, 5.8, 0, 0.84, 0.84, 0.08, [0.75 * k, 0.05, 0.05], TL.glass, 0, 0, Math.PI / 4); E.fl = 0; },
  cierge(E, c, t) { E.bx(0, 0, 0, 0.12, 0.7 + (c.v % 3) * 0.2, 0.12, [0.9, 0.86, 0.78], TL.plain); E.fl = FX_EMIT; E.bx(0, 0.72 + (c.v % 3) * 0.2, 0, 0.05, 0.1 + Math.sin(t * 13 + c.id) * 0.02, 0.05, [1.3, 0.6, 0.2], TL.flame); E.fl = 0; },
  lys(E, c) { E.bx(0, 0, 0, 0.03, 0.55, 0.03, [0.4, 0.4, 0.38], TL.plain); for (let k = 0; k < 5; k++) E.box(Math.cos(k * 1.26) * 0.08, 0.6, Math.sin(k * 1.26) * 0.08, 0.1, 0.03, 0.05, [0.72, 0.7, 0.66], TL.plain, k * 1.26, 0.4); },
  ronce(E, c) { for (let k = 0; k < 6; k++) E.box(Math.cos(k * 2.1) * 0.25, 0.3 + (k % 3) * 0.18, Math.sin(k * 2.1) * 0.25, 0.05, 0.7, 0.05, [0.08, 0.05, 0.06], TL.bark, k, 0.4 + (k % 2) * 0.5, 0.3); E.bx(0, 0.5, 0, 0.06, 0.06, 0.06, TNM.sang, TL.plain); },
  plume(E, c, t) { E.box(0, 0.03, 0, 0.05, 0.02, 0.4, [0.03, 0.03, 0.04], TL.plain, c.v); },
  croix(E, c) { E.box(0, 0.6, 0, 0.12, 1.3, 0.12, [0.2, 0.17, 0.15], TL.darkwood, 0, 0, (c.v % 3 - 1) * 0.3); E.box(0, 0.95, 0, 0.6, 0.1, 0.1, [0.2, 0.17, 0.15], TL.darkwood, 0, 0, (c.v % 3 - 1) * 0.3); },
};

// ---------------------------------------------------------------- le monde
MONDES.tenebres = {
  nom: 'tenebres', titre: 'les Ténèbres', aPart: false, herbe: null, pnjCaches: true, durete: 0,
  sprite(t) {
    const id = t.id;
    if (t.cat === 'Arbres' || id === 'giantoak') return ['deadtree0', 'deadtree1'];
    if (id === 'bush' || id === 'berry' || id === 'reeds') return ['tn_ronce0'];
    if (id === 'poppies') return ['tn_mains0'];
    if (id === 'mushroom' || /cepe|girolle|amanite|morille|trompette|champ/.test(id)) return ['tn_yeux0'];
    if (id === 'tallgrass' || id === 'fern' || id === 'heather' || t.cat === 'Fleurs') return null;
    if (!t.col && !t.colK && t.h && t.h[1] < 1.3 && !t.light && t.cat !== 'Objets' && t.cat !== 'Village' && t.cat !== 'Mine' && t.cat !== 'Rochers') return null;
    return undefined;
  },
  plancher() { return this.durete >= 1 ? 0 : 10 - this.durete * 6; },
  ciel(sky, k) {
    mondes.melerCiel(sky, {
      zen: [0.02, 0.0, 0.0], hor: [0.14, 0.015, 0.01], amb: [0.16, 0.05, 0.045], glow: [0.35, 0.03, 0.01], haze: [0.07, 0.008, 0.006],
      cloudLit: [0.18, 0.03, 0.02], cloudDark: [0.03, 0.0, 0.0], cloudCover: 0.7, sunCol: v3.scale([0.45, 0.07, 0.04], sky.day), moonCol: [0.2, 0.03, 0.02],
      sunDisk: [0.9, 0.08, 0.04], moonTint: [1.4, 0.2, 0.15], stars: 0, fog: [8, 74], nightLit: 1,
    }, k);
  },
  peindreBete(e, q) { if (/leg|hoof/.test(q.name)) return [0.62, 0.58, 0.52]; if (q.name === 'head') return [0.3, 0.26, 0.24]; return [0.16, 0.13, 0.13]; },
  entrer(opts) {
    const S = mondes.S(), p = game.player;
    const T = S.tenebres && opts.restaurer ? S.tenebres : (S.tenebres = { graine: (Math.random() * 1e9) | 0, x: p.pos[0], z: p.pos[2], yaw: p.yaw, durete: opts.durete || 0, fin: opts.pilule ? 0 : farm.s.hours + (opts.duree || 2) });
    this.durete = T.durete || 0;
    const rnd = mulberry32(T.graine);
    if (!T.sites) {
      const fwd = Math.atan2(-Math.sin(p.yaw), -Math.cos(p.yaw));
      const ca = mondes.site(T.x, T.z, 50, 115, 18, rnd, fwd), cg = mondes.site(T.x, T.z, 18, 45, 9, rnd, fwd + (rnd() < 0.5 ? 1.5 : -1.5));
      T.sites = { cathedrale: ca ? { x: ca.x, z: ca.z, y: ca.y } : null, cages: cg && (!ca || Math.hypot(cg.x - ca.x, cg.z - ca.z) > 32) ? { x: cg.x, z: cg.z, y: cg.y } : null };
    }
    if (T.sites.cathedrale) this.cathedrale(T.sites.cathedrale, T.x, T.z);
    if (T.sites.cages) this.cages(T.sites.cages, T.x, T.z, rnd);
    this.semer(T, rnd);
    mondes.finConstruction([T.x - 150, T.z - 150, T.x + 150, T.z + 150]);
    MSON.drone('tenebres', [49, 51.3, 73.5], 0.07, 'sawtooth', 240);
    if (!opts.restaurer) {
      sound.enversShift && sound.enversShift(true); strange.glitchT = Math.max(strange.glitchT, 1.2); game.shakeT = 0.6;
      ui.subtitle('', pick(['(Le sucre tourne. Tout noircit d’un coup, comme un fruit qui pourrit en une seconde.)', '(Les couleurs s’en vont. Il ne reste que le rouge et le noir. Et quelque chose qui respire.)']), 5);
      if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-4 - this.durete * 4, 'les Ténèbres');
    }
  },
  // ------------------------------------------------------------- la cathédrale noire
  cathedrale(s, px, pz) {
    const f0 = { x: s.x, y: s.y, z: s.z, r: Math.atan2(-(px - s.x), -(pz - s.z)) };
    mondes.cacherObjets(f0, 11, 19);
    const [hn, hx] = mondes.relief(f0, 7.5, 16), f = Object.assign({}, f0, { y: hx + 0.2 }), Wn = 12, Ln = 30, H = 14, E = 1.2, bord = (Ln + 2 * E + 1) / 2, bas = hn - f.y - 1;
    mondes.bloc(f, 0, bas, 0, Wn + 2 * E + 1, -bas, Ln + 2 * E + 1, M_OBSIDIENNE); // parvis et sol
    mondes.mur(f, 0, -Ln / 2, Wn + 2 * E, true, H, E, M_OBSIDIENNE, 3.4, 6.2);
    mondes.mur(f, 0, Ln / 2, Wn + 2 * E, true, H, E, M_OBSIDIENNE);
    mondes.mur(f, -Wn / 2 - E / 2, 0, Ln - E, false, H, E, M_OBSIDIENNE);
    mondes.mur(f, Wn / 2 + E / 2, 0, Ln - E, false, H, E, M_OBSIDIENNE);
    mondes.bloc(f, 0, H, 0, Ln + 2.6, 8, Wn + 2 * E + 1.4, M_OBSIDIENNE, Math.PI / 2, 1);
    // deux tours de façade, flèches tordues
    for (const sx of [-1, 1]) { mondes.bloc(f, sx * (Wn / 2 + 1.6), bas, -Ln / 2 - 0.6, 4.4, 24 - bas, 4.4, M_OBSIDIENNE); mondes.bloc(f, sx * (Wn / 2 + 1.6), 24, -Ln / 2 - 0.6, 5.2, 11, 5.2, M_OBSIDIENNE, sx * 0.12, 3); }
    // piliers
    for (let z = -Ln / 2 + 5; z <= Ln / 2 - 5; z += 5) for (const sx of [-1, 1]) mondes.bloc(f, sx * 3.6, 0, z, 1.0, H, 1.0, M_OBSIDIENNE);
    const at = (lx, lz) => mondes.toWorld(f, lx, lz);
    { const [ex, ez] = at(0, -bord - 1.2); mondes.marches(f, 0, -bord, 3.4, f.y - game.world.heightAt(ex, ez), -1, M_OBSIDIENNE); }
    // vitraux rouges (dedans et dehors), bancs brisés, cierges, l'autel et le cœur
    for (let z = -Ln / 2 + 4; z <= Ln / 2 - 4; z += 5) for (const sx of [-1, 1]) for (const out of [0, 1]) { const [x, zz] = at(sx * (Wn / 2 + (out ? E + 0.05 : -0.05)), z); mondes.chose({ x, z: zz, y: f.y + 3.5, r: f.r + Math.PI / 2, modele: TNM.vitrail, loin: 110 }); }
    for (let k = 0; k < 10; k++) { const [x, z] = at((k % 2 ? 1 : -1) * 2.2, -Ln / 2 + 4 + Math.floor(k / 2) * 3.2); mondes.chose({ x, z, y: f.y, r: f.r + (Math.random() - 0.5) * 0.3, v: k, modele: TNM.banc }); }
    { const [x, z] = at(0, Ln / 2 - 3); mondes.chose({ x, z, y: f.y, r: f.r, modele: TNM.autel }); mondes.chose({ x, z, y: f.y + 1.24, item: 'coeur_noir', cle: 't_coeur', r: f.r, modele: TNM.coeur, rayon: 0.5, h: 0.5, lumiere: { c: [1.0, 0.1, 0.05], r: 9, y: 0.4 },
      prendre(c) {
        farm.give('coeur_noir', 1); play.flyer('coeur_noir', [c.x, c.y + 0.4, c.z], 1); sound.heartbeat(1.2);
        ui.subtitle('', '(Vous prenez le cœur. Il bat dans votre main, une fois, deux fois. Tout ce qui rampe, dehors, s’est retourné vers vous.)', 5);
        for (const e of mondes.betes) if (e.kind === 'chien_ecorche') e.state = 'chasse';
        MONDES.tenebres.renforts(3);
      } }); }
    for (let k = 0; k < 14; k++) { const [x, z] = at((k % 2 ? 1 : -1) * (1.3 + (k % 3) * 0.5), Ln / 2 - 1.5 - (k % 4) * 0.4); mondes.chose({ x, z, y: f.y, v: k, modele: TNM.cierge, lumiere: k % 4 === 0 ? { c: [1, 0.45, 0.2], r: 6, y: 1, vacille: true } : null }); }
    for (let k = 0; k < 3; k++) { const [x, z] = at(-3.6 + k * 3.6, -2 + k * 4); mondes.chose({ x, z, y: f.y + 5, v: k, os: true, suspendu: true, r: k, modele: TNM.cage }); }
    this.porteCathedrale = at(0, -Ln / 2 - 3);
  },
  // ------------------------------------------------------------- les cages et le gibet
  cages(s, px, pz, rnd) {
    const f = { x: s.x, y: s.y, z: s.z, r: Math.atan2(-(px - s.x), -(pz - s.z)) };
    mondes.cacherObjets(f, 8, 8);
    const at = (lx, lz) => mondes.toWorld(f, lx, lz);
    const T = mondes.S().tenebres;
    for (let k = 0; k < 6; k++) {
      const a = k / 6 * TAU, [x, z] = at(Math.cos(a) * 6, Math.sin(a) * 6), enfant = k === 2;
      mondes.chose({ x, z, r: a + Math.PI, v: k, os: !enfant && k % 2 === 0, modele: TNM.cage, loin: 90 });
      if (enfant && !(T && T.enfant)) { const [cx, cz] = mondes.toWorld({ x, z, r: a + Math.PI }, 0.3, 0); mondes.bete('enfant_cage', cx, cz, { y: mondes.solY(x, z) + 1.38, yRef: mondes.solY(x, z) + 1.38, heading: a }); }
    }
    // le gibet, le pendu, et la clé des cages
    const [gx, gz] = at(0, 0);
    mondes.chose({ x: gx, z: gz, r: f.r, modele: TNM.gibet, loin: 90 });
    const [hx, hz] = mondes.toWorld({ x: gx, z: gz, r: f.r }, 2.2, 0), gy = mondes.solY(gx, gz);
    mondes.bete('pendu', hx, hz, { y: gy + 1.25, yRef: gy + 1.25, heading: f.r });
    const [kx, kz] = mondes.toWorld({ x: gx, z: gz, r: f.r }, 1.0, 0.15);
    mondes.chose({ x: kx, z: kz, y: gy + 4.6, item: 'cle_cage', cle: 't_cle', modele: TNM.cle, rayon: 0.4, h: 0.4, dit: '(Une grosse clé rouillée pendait au gibet, à portée de main. Comme si on l’avait laissée pour vous.)' });
    for (let k = 0; k < 8; k++) { const [x, z] = at((rnd() - 0.5) * 18, (rnd() - 0.5) * 18); if (Math.hypot(x - gx, z - gz) > 3) mondes.chose({ x, z, v: k, r: rnd() * TAU, modele: TNM.croix }); }
  },
  cageEnfant(e) {
    const T = mondes.S().tenebres || {};
    if (!farm.count('cle_cage')) { MSON.sanglot(0.8); ui.subtitle('', '(Un enfant, dans la cage. Il pleure sans bruit. Le cadenas est rouillé, et fermé.)', 4.5); return; }
    farm.take('cle_cage', 1); T.enfant = 1; sound.lock && sound.lock(false); MSON.grince(1.2);
    ui.subtitle('L’enfant', 'Merci. N’en reprends pas, des pilules. Là où elles mènent, il y a pire que moi.', 5);
    setTimeout(() => { if (!e.mort) { e.mort = true; e.mortT = 0; puffAt(e.x, e.y + 0.6, e.z, [220, 220, 230], 16, 1.2, true); farm.give('oeil_verre', 1); play.flyer('oeil_verre', [e.x, e.y + 0.8, e.z], 1); ui.subtitle('', '(Il n’y a plus personne. Dans la cage ouverte, un œil de verre vous regarde.)', 4.5); } }, 4200);
  },
  // ------------------------------------------------------------- plantes, bêtes
  semer(T, rnd) {
    const w = game.world, cx = T.x, cz = T.z;
    const TYPES = [['ronce_noire', TNM.ronce, 0.9], ['lys_cendre', TNM.lys, 0.7], ['plume_ombre', TNM.plume, 0.1]];
    for (let k = 0; k < 30; k++) {
      const a = rnd() * TAU, d = 6 + Math.sqrt(rnd()) * 65, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
      if (!w.inside(x, z, 6) || w.heightAt(x, z) < w.waterLevel + 0.2) continue;
      const Ty = TYPES[k % 3];
      mondes.chose({ x, z, item: Ty[0], v: k, r: rnd() * TAU, cle: 't_pl' + k, modele: Ty[1], rayon: 0.5, h: Ty[2],
        prendre: Ty[0] === 'ronce_noire' ? function (c) { farm.give('ronce_noire', 1); play.flyer('ronce_noire', [c.x, c.y + 0.5, c.z], 1); corps.saigner(0.04, 'Les ronces noires'); ui.subtitle('', '(Les épines vous entaillent la paume. Le sang est très rouge, ici.)', 3); } : undefined });
    }
    const n = 3 + Math.round(this.durete * 3);
    for (let k = 0; k < n; k++) this.renfortPos(rnd, 'rampant', 35, 60);
    if (this.durete > 0.3 || rnd() < 0.5) this.renfortPos(rnd, 'chien_ecorche', 60, 90);
    if (this.durete > 0.9) this.renfortPos(rnd, 'chien_ecorche', 70, 95);
    this.renfortPos(rnd, 'ombre', 60, 80);
  },
  renfortPos(rnd, kind, r0, r1) {
    const w = game.world, p = game.player;
    for (let t = 0; t < 16; t++) {
      const a = rnd() * TAU, d = r0 + rnd() * (r1 - r0), x = p.pos[0] + Math.cos(a) * d, z = p.pos[2] + Math.sin(a) * d;
      if (w.inside(x, z, 10) && w.heightAt(x, z) > w.waterLevel + 0.3) return mondes.bete(kind, x, z);
    }
    return null;
  },
  renforts(n) { for (let k = 0; k < n; k++) this.renfortPos(Math.random, 'rampant', 30, 45); },
  update(dt, playing) {
    const T = mondes.S().tenebres;
    if (T && T.fin && !pilules.P().phase && farm.s.hours >= T.fin) { mondes.sortir(); return; }
    MSON.melodie(dt, 'tenebres');
    this.sonT = (this.sonT || 4) - dt;
    if (this.sonT <= 0) {
      this.sonT = 3 + Math.random() * 7 / (1 + this.durete);
      const r = Math.random(), pan = Math.random() * 2 - 1;
      if (r < 0.3) sound.whisper && sound.whisper(pan, 0.7);
      else if (r < 0.45) MSON.cri(0.18 + Math.random() * 0.15, 0.7 + Math.random() * 0.6, 1.6, pan);
      else if (r < 0.6) MSON.metal(0.4, 1.6, pan);
      else if (r < 0.72) sound.crow && sound.crow(0.6);
      else if (r < 0.82) MSON.rire(0.3, 0.6, pan);
      else if (r < 0.9) sound.heartbeat(0.5);
      else MSON.sanglot(0.4, pan);
    }
    // cendres qui tombent
    if (playing && Math.random() < dt * 10) { const p = game.player, a = Math.random() * TAU, d = 2 + Math.random() * 14; particles.spawn(p.pos[0] + Math.cos(a) * d, p.pos[1] + 5 + Math.random() * 3, p.pos[2] + Math.sin(a) * d, (Math.random() - 0.5) * 0.3, -0.5, (Math.random() - 0.5) * 0.3, [0.25, 0.22, 0.2, 1], 0.05, 7, 0.02, false); }
    // la peur fait battre le cœur
    let proche = 1e9;
    for (const e of mondes.betes) if (!e.mort && (e.kind === 'rampant' || e.kind === 'chien_ecorche')) proche = Math.min(proche, e.dist);
    strange.fear = Math.max(strange.fear, clamp(1 - proche / 30, 0, 1));
  },
  fx(v) { v[1] = Math.min(1, v[1] * (0.92 + Math.sin(game.time * 1.7) * 0.05 + strange.fear * 0.1)); return v; },
  sortir(opts) {
    MSON.stopDrone('tenebres');
    const chg = [];
    for (const id in TENEBRES_RETOUR) {
      const n = farm.count(id), to = TENEBRES_RETOUR[id];
      if (!n || to === id) continue;
      farm.take(id, n);
      if (to && ITEMS[to]) { farm.give(to, n); chg.push(id); }
    }
    if (!opts.vers) {
      sound.enversShift && sound.enversShift(false); strange.glitchT = Math.max(strange.glitchT, 0.8);
      ui.subtitle('', pick(['(Le monde revient. Les couleurs reviennent. Vous tremblez de tout votre corps.)', '(C’est fini. Il fait gris, il fait froid, c’est la vallée. Vous pleurez sans savoir pourquoi.)']), 5);
      if (chg.includes('plume_ombre')) setTimeout(() => ui.subtitle('', '(La plume d’ombre n’est qu’une plume de corbeau. Les lys, de la cendre.)', 4), 5500);
      if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-3 - this.durete * 5, 'retombée');
    }
  },
};
