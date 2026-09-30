// ============================================================================
//  LE CAUCHEMAR : très, très rarement, le sommeil tourne mal
//  On se réveille dans sa maison… qui n'est pas tout à fait sa maison : le
//  plafond est trop haut, une chaise est posée au plafond, le portrait n'a pas
//  de visage. La porte donne sur un couloir qui ne finit pas. Un homme au sac
//  sur la tête vous suit en traînant un crochet sur le plancher ; il respire
//  fort, il crie. S'il vous rattrape, vous vous réveillez en hurlant ; si vous
//  trouvez l'issue, vous vous réveillez en sueur. On n'y meurt pas : c'est un
//  rêve. (Mais un objet, parfois, vous suit jusqu'au matin.)
//  Probabilité par nuit : 2,2 % × bizarrerie() × (pilules, meurtres…), jamais
//  deux cauchemars en trois nuits : une nuit sur quarante environ pour un esprit
//  ordinaire (tools/equilibrage/hasard.js), bien plus à l'esprit sombre.
//  mondes.entrer('cauchemar') : rêver tout de suite (essais).
// ============================================================================
defItem('dessin_reve', 'Dessin d’enfant', 'ailleurs', 30, ['md_dessin', '#2a2020'], { desc: 'Un dessin au crayon : un homme avec un sac sur la tête, qui tient la main d’un enfant. Vous l’avez rapporté d’un rêve. Au dos, votre nom, d’une écriture que vous ne connaissez pas.' });

const cauchemar = {
  C() { const M = mondes.S(); return M.cauchemar || (M.cauchemar = { nuits: 0, dernier: -99, pris: 0 }); },
  forcer: false,
  // chance de cauchemar pour une nuit
  chance(where) {
    if (where === 'chene') return 0;
    const C = this.C(), s = farm.s;
    const pil = typeof pilules !== 'undefined' ? pilules.risqueCauchemar() : 1;
    if ((s.day - C.dernier < 3 || s.day < 4) && pil < 5) return 0; // (les pilules, elles, n'attendent pas)
    const meurtres = typeof meurtresDuJoueur === 'function' ? meurtresDuJoueur() : 0;
    return clamp(0.022 * bizarrerie() * pil * (1 + meurtres * 0.08) * (strange.killerActive() ? 1.5 : 1), 0, 0.6);
  },
  // le rêve : de l'endormissement au réveil (puis la nuit continue normalement)
  async rever(where, suite) {
    const p = game.player;
    game.sleeping = true;
    ui.close(true);
    await ui.fade(true, '', 1100);
    $('#fade-text').textContent = 'Vous vous endormez…';
    await new Promise((r) => setTimeout(r, 1500));
    this.C().nuits++; this.C().dernier = farm.s.day;
    mondes.entrer('cauchemar', { where });
    $('#fade-text').textContent = '';
    this.finP = new Promise((r) => { this.finR = r; });
    await ui.fade(false, '', 1800);
    game.sleeping = false;
    const issue = await this.finP;
    if (issue === 'reel') { if (mondes.cur === 'cauchemar') mondes.sortir(); return; } // on meurt pour de bon (voir HOOKS.death)
    // réveil
    game.sleeping = true;
    if (issue === 'attrape') {
      $('#fade').style.background = '#000';
      await ui.fade(true, 'Vous vous réveillez en hurlant.', 60);
      $('#fade').style.background = '';
    } else await ui.fade(true, 'Vous vous réveillez en sueur.', 1400);
    if (mondes.cur === 'cauchemar') mondes.sortir();
    await new Promise((r) => setTimeout(r, 2200));
    game.sleeping = false;
    await suite(where);
    if (issue === 'attrape') {
      p.hp = Math.max(10, p.hp - 25);
      ui.subtitle('', '(Vous n’avez pas pu vous rendormir.)', 4);
      if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-14, 'cauchemar');
    } else {
      if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-5, 'cauchemar');
    }
    if (farm.count('dessin_reve') && !this.C().ditDessin) { this.C().ditDessin = 1; setTimeout(() => ui.subtitle('', '(Dans votre main, le dessin du rêve.)', 5), 6500); }
  },
  finir(issue) {
    if (!this.finR) { if (mondes.cur === 'cauchemar') mondes.sortir(); return; }
    const r = this.finR; this.finR = null;
    r(issue);
  },
};

// ---------------------------------------------------------------- l'homme au sac
BETES_MONDE.tueur_reve = {
  rig: () => MONDES_RIGS.tueur(), h: 2.0, r: 0.35, hp: 999, vitesse: [4.9, 6.4], intouchable: true, actif: 400, echelle: 1.12,
  touche(e) { e.recul = 0.7; MSON.cri(0.7, 0.55, 0.8); },
  ia(e, dt) {
    const p = game.player, M = MONDES.cauchemar;
    if (M.fini) { e.move = 0; return true; }
    e.recul = Math.max(0, (e.recul || 0) - dt);
    const eye = p.eyePos(), f = cameraBasis(p.yaw, p.pitch).f, dx = e.x - eye[0], dz = e.z - eye[2], d = Math.hypot(dx, dz) || 1;
    const vu = (dx * f[0] + dz * f[2]) / d > 0.55;
    e.nonVuT = vu ? 0 : (e.nonVuT || 0) + dt;
    // quand on ne le regarde pas, il se rapproche d'un coup (comme dans les rêves)
    if (e.nonVuT > 4 && e.dist > 12) { e.nonVuT = 0; const k = Math.min(6, e.dist - 9) / e.dist; e.x += (p.pos[0] - e.x) * k; e.z += (p.pos[2] - e.z) * k; MSON.metal(0.8, 0.4); }
    const sp = (e.dist < 6 ? e.d.vitesse[1] : e.d.vitesse[0]) + M.boucle * 0.25;
    if (e.recul <= 0) {
      const dir = Math.atan2(p.pos[0] - e.x, p.pos[2] - e.z);
      e.heading = turnToward(e.heading, dir, dt * 6);
      let nx = e.x + Math.sin(e.heading) * sp * dt, nz = e.z + Math.cos(e.heading) * sp * dt;
      [nx, nz] = game.world.collideCircle(nx, nz, e.y, e.y + 2, 0.32, 0.5, true);
      e.x = nx; e.z = nz; e.y = mondes.solY(nx, nz, e.y); e.move = 1; e.run = e.dist < 6; e.phase += dt * sp * 1.9;
    } else e.move = 0;
    // bruits : le crochet sur le plancher, le souffle, les pas, les cris
    const k = clamp(1 - e.dist / 45, 0.08, 1), pan = clamp(((e.x - p.pos[0]) * Math.cos(p.yaw) - (e.z - p.pos[2]) * Math.sin(p.yaw)) / 10, -0.9, 0.9);
    e.mT = (e.mT || 0) - dt; if (e.mT <= 0 && e.move) { e.mT = 1.1 + Math.random() * 0.5; MSON.metal(0.55 * k, 1.2, pan); }
    e.sT = (e.sT || 0) - dt; if (e.sT <= 0) { e.sT = 2.2 + Math.random(); MSON.souffle(0.9 * k, pan); }
    e.pT = (e.pT || 0) - dt; if (e.pT <= 0 && e.move) { e.pT = e.run ? 0.34 : 0.5; sound.steps1 && sound.steps1(0.8 * k, pan * 15); }
    e.cT = (e.cT || 6) - dt; if (e.cT <= 0) { e.cT = 7 + Math.random() * 7; MSON.cri(0.55 * k + 0.1, 0.7 + Math.random() * 0.4, 1.3, pan); }
    strange.fear = Math.max(strange.fear, clamp(1 - e.dist / 25, 0.15, 1));
    // attrapé
    if (e.dist < 1.25 && Math.abs(e.dy) < 2) M.attrape(e);
    return true;
  },
};

// ---------------------------------------------------------------- décors (boîtes)
const CM = {
  bois: [0.42, 0.3, 0.2], sombre: [0.2, 0.15, 0.12],
  lit(E) { E.bx(0, 0, 0, 1.9, 0.55, 2.6, CM.bois, TL.wood); E.bx(0, 0.55, 0.2, 1.8, 0.22, 2.2, [0.8, 0.78, 0.74], TL.blanket); E.bx(0, 0.55, -1.0, 1.4, 0.2, 0.5, [0.9, 0.88, 0.84], TL.pillow); E.bx(0, 0, -1.3, 1.9, 1.6, 0.12, CM.sombre, TL.darkwood); },
  table(E) { E.bx(0, 0.78, 0, 1.5, 0.08, 0.9, CM.bois, TL.wood); for (const [x, z] of [[-0.66, -0.38], [0.66, -0.38], [-0.66, 0.38], [0.66, 0.38]]) E.bx(x, 0, z, 0.08, 0.78, 0.08, CM.sombre, TL.darkwood); E.bx(0.3, 0.86, 0.1, 0.3, 0.01, 0.42, [0.92, 0.9, 0.82], TL.paper); },
  chaiseEnvers(E) { E.box(0, -0.43, 0, 0.44, 0.05, 0.44, CM.bois, TL.wood); for (const [x, z] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) E.box(x, -0.21, z, 0.05, 0.43, 0.05, CM.sombre, TL.darkwood); E.box(0, -0.7, -0.2, 0.44, 0.5, 0.05, CM.bois, TL.wood); },
  berceuse(E, c, t) { const a = Math.sin(t * 1.6) * 0.18; E.box(0, 0.45, 0, 0.5, 0.06, 0.5, CM.bois, TL.wood, 0, a); E.box(0, 0.85, -0.25, 0.5, 0.8, 0.06, CM.bois, TL.wood, 0, a - 0.15); for (const s of [-0.22, 0.22]) E.box(s, 0.08, 0, 0.05, 0.1, 0.9, CM.sombre, TL.darkwood, 0, a); },
  portrait(E) { E.bx(0, 0, 0, 0.9, 1.1, 0.06, [0.35, 0.25, 0.12], TL.gold); E.bx(0, 0.1, 0.04, 0.7, 0.9, 0.02, [0.85, 0.78, 0.7], tx(TL.plain, TL.blankF)); },
  cheminee(E) { E.bx(0, 0, 0, 1.8, 1.4, 0.6, [0.5, 0.46, 0.42], TL.stone); E.bx(0, 0.1, 0.05, 1.1, 0.9, 0.55, [0.05, 0.05, 0.05], TL.coal); E.bx(0, 1.4, 0, 2.0, 0.12, 0.7, CM.sombre, TL.darkwood); },
  fenetre(E, c, t) { E.fl = FX_EMIT; E.bx(0, 0, 0, 1.0, 1.3, 0.05, [0.7 + Math.sin(t * 0.5) * 0.1, 0.05, 0.03], TL.glass); E.fl = 0; E.bx(0, 0.62, 0.03, 1.0, 0.06, 0.06, CM.sombre, TL.darkwood); E.bx(0, 0, 0.03, 0.06, 1.3, 0.06, CM.sombre, TL.darkwood); },
  poupee(E) { E.bx(0, 0, 0, 0.16, 0.22, 0.1, [0.7, 0.4, 0.4], TL.cloth); E.bx(0, 0.22, 0, 0.13, 0.13, 0.12, [1, 1, 1], tx(TL.plain, TL.doll)); },
  armoire(E, c, t) { E.bx(0, 0, 0, 1.3, 2.4, 0.6, CM.bois, TL.wood); const o = Math.min(1.2, Math.max(0, (MONDES.cauchemar.t - 20) * 0.02)); E.box(-0.62 + Math.cos(o) * 0.31, 1.2, 0.31 + Math.sin(o) * 0.31, 0.62, 2.3, 0.04, CM.sombre, TL.darkwood, -o); E.bx(0.31, 0.05, 0.31, 0.62, 2.3, 0.04, CM.sombre, TL.darkwood); E.fl = FX_EMIT; if (o > 0.2) E.bx(-0.2, 1.6, 0.25, 0.06, 0.03, 0.02, [1.4, 1.4, 1.2], TL.plain); E.fl = 0; },
  applique(E, c, t) { const k = MONDES.cauchemar.clignote(c); E.bx(0, 0, 0, 0.16, 0.3, 0.1, [0.3, 0.28, 0.24], TL.iron); E.fl = FX_EMIT; E.bx(0, 0.3, 0.05, 0.1, 0.16, 0.08, MONDES.cauchemar.couleur(k), TL.glass); E.fl = 0; },
  porte(E, c, t) { E.bx(0, 0, 0, 1.0, 2.1, 0.08, c.v % 3 === 0 ? [0.3, 0.14, 0.1] : CM.sombre, mt(M_PLANKS)); E.bx(0.38, 1.0, 0.06, 0.06, 0.06, 0.05, [0.6, 0.55, 0.3], TL.gold); if (MONDES.cauchemar.boucle >= 2 && c.v % 4 === 1) { E.fl = 0; E.bx(-0.4, 0, 0.05, 0.2, 2.1, 0.02, [0.02, 0.02, 0.02], TL.plain); } },
  tableau(E, c) { E.bx(0, 0, 0, 0.8, 0.6, 0.05, [0.3, 0.22, 0.12], TL.gold); E.bx(0, 0.06, 0.03, 0.64, 0.46, 0.02, [[0.4, 0.5, 0.3], [0.5, 0.4, 0.3], [0.3, 0.3, 0.4]][c.v % 3], TL.flowers); },
  dessin(E) { E.bx(0, 0, 0, 0.42, 0.32, 0.02, [0.92, 0.88, 0.78], TL.paper); E.bx(-0.02, 0.06, 0.012, 0.08, 0.16, 0.01, [0.1, 0.08, 0.08], TL.plain); E.bx(0.08, 0.08, 0.012, 0.05, 0.1, 0.01, [0.1, 0.08, 0.08], TL.plain); E.bx(-0.02, 0.2, 0.012, 0.06, 0.05, 0.01, [0.75, 0.62, 0.4], TL.sack); },
  sang(E, c) { E.bx(0, 0.005, 0, 0.5 + (c.v % 3) * 0.2, 0.01, 0.35, [0.3, 0.02, 0.02], TL.blood, c.v); },
  issue(E, c, t) { E.fl = FX_EMIT; const k = 1.2 + Math.sin(t * 2) * 0.1; E.bx(0, 0, 0, 1.4, 2.3, 0.06, [k, k, k * 0.95], TL.plain); E.fl = 0; E.bx(0, 2.3, 0, 1.6, 0.12, 0.12, CM.sombre, TL.darkwood); for (const s of [-0.76, 0.76]) E.bx(s, 0, 0, 0.12, 2.3, 0.12, CM.sombre, TL.darkwood); },
};

// ---------------------------------------------------------------- le monde du cauchemar
MONDES.cauchemar = {
  nom: 'cauchemar', titre: 'le cauchemar', aPart: true, lieu: 'un cauchemar', boucle: 0, t: 0, fini: false,
  // plan (repère local, z vers l'avant) : maison-souvenir 0..7, couloir 7..116 (qui boucle), l'issue 116..126
  L: { maison: [0, 7], couloir: [7, 116], fin: 126, boucleDe: 86, boucleA: 38, pas: 48, tours: 3 },
  ciel(sky, k) {
    mondes.melerCiel(sky, { zen: [0.01, 0.012, 0.01], hor: [0.02, 0.025, 0.02], amb: [0.07, 0.075, 0.068], glow: [0, 0, 0], haze: [0.012, 0.015, 0.012], cloudLit: [0.02, 0.02, 0.02], cloudDark: [0.01, 0.01, 0.01], sunCol: [0, 0, 0], moonCol: [0, 0, 0], stars: 0, sunVis: 0, moonVis: 0, cloudCover: 1, fog: [2, 24], nightLit: 1, shadowK: 0 }, k);
  },
  fx(v) { v[2] = Math.min(1, 0.75 + strange.fear * 0.35); return v; },
  clignote(c) { if (this.boucle >= 1 && ((c.id * 7 + Math.floor(game.time * 9)) % 23 === 0)) return 0.15; return 1; },
  couleur(k) { const b = this.boucle; return b >= 2 ? [1.3 * k, 0.25 * k, 0.12 * k] : b >= 1 ? [1.3 * k, 0.7 * k, 0.3 * k] : [1.25 * k, 1.05 * k, 0.6 * k]; },
  f() { const F = MONDES_FOND.cauchemar; return { x: F.x, y: F.y, z: F.z, r: 0 }; },
  at(lx, lz) { return mondes.toWorld(this.f(), lx, lz); },
  entrer(opts) {
    const f = this.f(), L = this.L, M = mondes;
    this.boucle = 0; this.t = 0; this.fini = false; this.tueur = null; this.dansCouloir = 0; this.porteOuverte = false;
    const PL = M_PLANKS, PP = M_PAPIER_PEINT;
    // la maison-souvenir : trop haute, trop grande
    M.bloc(f, 0, -0.5, 3.5, 8.8, 0.5, 7.8, PL);
    M.mur(f, 0, -0.2, 8.8, true, 6, 0.4, PP);
    M.mur(f, 0, 7.2, 8.8, true, 6, 0.4, PP, 1.5, 2.5);
    M.mur(f, -4.2, 3.5, 7.0, false, 6, 0.4, PP);
    M.mur(f, 4.2, 3.5, 7.0, false, 6, 0.4, PP);
    M.bloc(f, 0, 6, 3.5, 8.8, 0.4, 7.8, PL, 0, 0, { ceil: true });
    // le couloir qui ne finit pas
    const [c0, c1] = L.couloir, cm = (c0 + c1) / 2, cl = c1 - c0;
    M.bloc(f, 0, -0.5, cm, 2.8, 0.5, cl, PL);
    M.bloc(f, -1.45, 0, cm, 0.3, 3.2, cl, PP); M.bloc(f, 1.45, 0, cm, 0.3, 3.2, cl, PP);
    M.bloc(f, 0, 3.2, cm, 3.2, 0.4, cl, M_PLASTER, 0, 0, { ceil: true });
    this.porteFin = M.bloc(f, 0, 0, c1 + 0.15, 2.6, 3.2, 0.3, PP);
    // l'issue
    M.bloc(f, 0, -0.5, (c1 + L.fin) / 2, 6.4, 0.5, L.fin - c1 + 0.4, PL);
    M.mur(f, -3.1, (c1 + L.fin) / 2, L.fin - c1, false, 3.6, 0.3, PP); M.mur(f, 3.1, (c1 + L.fin) / 2, L.fin - c1, false, 3.6, 0.3, PP);
    M.mur(f, 0, L.fin + 0.15, 6.5, true, 3.6, 0.3, PP);
    M.mur(f, -2.1, c1 + 0.3, 2.0, true, 3.6, 0.3, PP); M.mur(f, 2.1, c1 + 0.3, 2.0, true, 3.6, 0.3, PP);
    M.bloc(f, 0, 3.6, (c1 + L.fin) / 2, 6.6, 0.4, L.fin - c1 + 0.4, M_PLASTER, 0, 0, { ceil: true });
    M.finConstruction();
    // meubles de la maison
    const ch = (lx, lz, o) => { const [x, z] = this.at(lx, lz); return M.chose(Object.assign({ x, z, y: f.y, yRef: f.y }, o)); };
    ch(-2.4, 1.2, { r: 0, modele: CM.lit });
    ch(1.8, 3.2, { r: 0.3, modele: CM.table });
    { const c = ch(1.8, 3.2, { modele: null, rayon: 0.4, h: 1.0, reste: true, prendre: () => ui.read('Lettre de Maître Delorme, notaire', 'Madame, Monsieur,\n\nConformément aux dernières volontés de feu vous-même, dont vous êtes l’unique héritier connu, je vous remets les clés de la vieille ferme.\n\nVous trouverez dans la maison de quoi finir.\n\nLe couloir est au bout. Il faut courir.\n\nVeuillez agréer, etc.') }); c.y = f.y + 0.8; }
    ch(0.6, 5.2, { y: f.y + 6, r: 0.7, modele: CM.chaiseEnvers });
    ch(-2.8, 5.4, { r: 2.4, modele: CM.berceuse });
    ch(3.6, 1.0, { y: f.y + 1.6, r: -Math.PI / 2, modele: CM.portrait });
    ch(0, 0.25, { r: 0, modele: CM.cheminee });
    ch(-3.97, 3.4, { y: f.y + 1.4, r: Math.PI / 2, modele: CM.fenetre, lumiere: { c: [0.9, 0.08, 0.05], r: 7, y: 0.6 } });
    ch(-1.9, 0.9, { y: f.y + 0.77, r: 0.4, modele: CM.poupee });
    ch(3.4, 6.4, { r: Math.PI, modele: CM.armoire });
    ch(1.2, 2.2, { y: f.y + 2.6, modele: null, lumiere: { c: [0.9, 0.75, 0.45], r: 8, y: 0, vacille: true } });
    // le couloir : appliques tous les 6 m, portes et tableaux tous les 12 m (tout se répète), un dessin d'enfant
    for (let z = c0 + 4; z < c1 - 1; z += 6) { ch(z % 12 < 6 ? -1.28 : 1.28, z, { y: f.y + 2.1, r: z % 12 < 6 ? Math.PI / 2 : -Math.PI / 2, modele: CM.applique, lumiere: { c: [1.0, 0.8, 0.45], r: 7, y: 0.35, vacille: true } }); }
    for (let z = c0 + 7; z < c1 - 2; z += 12) { ch(-1.27, z, { r: Math.PI / 2, v: Math.round(z), modele: CM.porte }); ch(1.27, z + 6, { r: -Math.PI / 2, v: Math.round(z) + 1, modele: CM.porte }); ch(1.28, z, { y: f.y + 1.5, r: -Math.PI / 2, v: Math.round(z), modele: CM.tableau }); }
    for (let z = c0 + 20; z < c1 - 6; z += 12) ch(0.2, z, { v: Math.round(z), modele: (E, c) => { if (MONDES.cauchemar.boucle >= 1) CM.sang(E, c); } });
    if (!this.C().dessin) { const c = ch(-1.28, 50, { y: f.y + 1.45, r: Math.PI / 2, modele: CM.dessin, rayon: 0.35, h: 0.3, cle: 'reve_dessin', prendre: (cc) => { this.C().dessin = 1; farm.give('dessin_reve', 1); play.flyer('dessin_reve', [cc.x, cc.y, cc.z], 1); sound.page && sound.page(); ui.subtitle('', '(Un dessin d’enfant : un homme avec un sac sur la tête. Il tient la main de quelqu’un. De vous.)', 5); } }); c.y = f.y + 1.45; }
    // l'issue : une porte de lumière blanche
    ch(0, L.fin - 0.6, { r: Math.PI, modele: CM.issue, lumiere: { c: [1.2, 1.2, 1.1], r: 10, y: 1.2 }, loin: 90 });
    // on se réveille à côté du lit
    const p = game.player, [sx, sz] = this.at(-0.8, 1.6);
    p.pos = [sx, f.y + 0.05, sz]; p.vel = [0, 0, 0]; p.yaw = Math.PI; p.pitch = -0.1;
    this.depart = p.pos.slice();
    if (game.renderer) game.renderer.uploadCover(p.pos[0], p.pos[2]);
    MSON.drone('reve', [41, 43.5], 0.06, 'sine', 180);
  },
  C() { return cauchemar.C(); },
  get depart() { return this._dep; }, set depart(v) { this._dep = v; },
  update(dt, playing) {
    const p = game.player, f = this.f(), L = this.L;
    if (this.fini) return;
    this.t += dt;
    MSON.melodie(dt, 'cauchemar');
    const [lx, lz] = [p.pos[0] - f.x, p.pos[2] - f.z];
    // dans le couloir : au bout d'un moment, la porte de la maison claque, et il est là
    if (lz > L.couloir[0] + 1) this.dansCouloir += dt;
    if (!this.tueur && (this.dansCouloir > 5 || this.t > 50)) {
      // il sort de la maison derrière vous… ou de l'armoire, si vous y traînez
      const dansMaison = lz < L.couloir[0], pres = Math.hypot(lx - 3.4, lz - 6.4) < 4;
      const [tx, tz] = dansMaison ? (pres ? this.at(-3, 1.5) : this.at(3.2, 5.6)) : this.at(0, Math.max(3.5, Math.min(lz - 16, 5.5)));
      this.tueur = mondes.bete('tueur_reve', tx, tz, { y: f.y, yRef: f.y, heading: 0 });
      sound.door && sound.door(false); MSON.grince(1.2); strange.glitchT = Math.max(strange.glitchT, 0.4);
      setTimeout(() => MSON.cri(0.9, 0.8, 1.6, 0), 900);
    }
    // le couloir qui ne finit pas : au bout, on est déjà revenu en arrière (lui aussi)
    if (lz > L.boucleDe && this.boucle < L.tours) {
      this.boucle++;
      p.pos[2] -= L.pas;
      const e = this.tueur;
      if (e) { let nz = e.z - f.z - L.pas; if (nz < L.couloir[0] + 1) nz = Math.max(L.couloir[0] + 1, p.pos[2] - f.z - 18); e.z = f.z + nz; e.x = f.x + clamp(e.x - f.x, -1, 1); e.y = f.y; }
      if (game.renderer) game.renderer.uploadCover(p.pos[0], p.pos[2]);
      if (this.boucle === 2) sound.knock && sound.knock(3);
      if (this.boucle === L.tours) { this.porteFin.y = -9999; game.world.grid = null; game.world.blocksDirty = true; }
    }
    // l'issue
    const [ix, iz] = this.at(0, L.fin - 1.2);
    if (Math.hypot(p.pos[0] - ix, p.pos[2] - iz) < 1.6) { this.fini = true; MSON.stopTout(); cauchemar.finir('issue'); return; }
    // trop long : on finit par se réveiller
    if (this.t > 300) { this.fini = true; cauchemar.finir('issue'); return; }
    // frappes derrière les portes
    this.frT = (this.frT || 6) - dt;
    if (this.frT <= 0) { this.frT = 5 + Math.random() * 8; if (lz > L.couloir[0]) { const r = Math.random(); if (r < 0.4) sound.knock && sound.knock(1 + (Math.random() * 3 | 0)); else if (r < 0.6) MSON.grince(0.6, Math.random() * 2 - 1); else if (r < 0.8) sound.whisper && sound.whisper(Math.random() * 2 - 1, 0.6); } }
    if (!this.tueur) strange.fear = Math.max(0, strange.fear - dt * 0.2);
  },
  attrape(e) {
    if (this.fini) return;
    this.fini = true;
    game.shakeT = 1.2; strange.glitchT = 2; play.hurtFlash = 1;
    MSON.cri(1.4, 1.1, 1.3, 0); sound.scream && sound.scream(1.3); sound.stab && sound.stab();
    setTimeout(() => cauchemar.finir('attrape'), 450);
  },
  sortir() { MSON.stopTout(); strange.fear = 0; this.tueur = null; this.fini = true; },
  // partie rechargée pendant le rêve : on se réveille dans son lit
  reprendre(S) {
    S.cur = null;
    const R = S.retour;
    if (R) { const p = game.player; p.pos = R.pos.slice(); p.yaw = R.yaw; p.pitch = R.pitch || 0; }
    S.retour = null;
    setTimeout(() => ui.subtitle('', '(Vous vous réveillez en sursaut. Il fait encore nuit.)', 5), 1500);
  },
};

// ---------------------------------------------------------------- branchements
mondes.apresInstall.push(() => {
  // le sommeil : très rarement, un cauchemar
  const _sleep = game.sleep.bind(game);
  game.sleep = async function (where) {
    if (mondes.aPart() || this.sleeping || this.dying) return _sleep(where);
    const ch = cauchemar.forcer ? 1 : cauchemar.chance(where);
    if (Math.random() < ch) { cauchemar.forcer = false; return cauchemar.rever(where, _sleep); }
    return _sleep(where);
  };
});
// mourir pendant le rêve (de ses vraies blessures, de faim) : on quitte le rêve avant
HOOKS.death.push((cause) => { if (mondes.cur === 'cauchemar') { MONDES.cauchemar.fini = true; cauchemar.finir('reel'); if (mondes.cur === 'cauchemar') mondes.sortir(); } return false; });
// essai direct : mondes.entrer('cauchemar') hors du sommeil (on se réveille là où l'on était)
{
  const _e = mondes.entrer.bind(mondes);
  mondes.entrer = function (nom, opts) {
    if (nom === 'cauchemar' && !(opts && (opts.where || opts.restaurer)) && !cauchemar.finR) {
      const ok = _e(nom, Object.assign({}, opts, { where: 'essai' }));
      if (ok) cauchemar.finP = new Promise((r) => { cauchemar.finR = (issue) => { r(issue); if (mondes.cur === 'cauchemar') mondes.sortir(); ui.subtitle('', issue === 'attrape' ? '(Vous vous réveillez en hurlant.)' : '(Vous vous réveillez en sueur.)', 4); }; });
      return ok;
    }
    return _e(nom, opts);
  };
}
