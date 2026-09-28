// ============================================================================
//  L'HOMME AU LONG MANTEAU (le tueur errant ; rien à voir avec le tueur caché
//  parmi les habitants). Rare : pas avant le cinquième soir, au plus une fois
//  en vingt jours (evenements.tueur(jour)). Une nuit, un inconnu arrive, rôde,
//  tue UN habitant resté dehors — ou le joueur, s'il le rattrape (d'un coup) —
//  puis disparaît pour de bon. Signes : des pas, une silhouette au bord de la
//  lumière, les chiens qui aboient. On lui échappe en s'enfermant (porte
//  close), en courant, en restant dans la lumière d'un feu ou d'un réverbère ;
//  blessé (au fusil, à l'arc, à la hache…), il s'enfuit.
//  C'est une entité de strange.ents (kind 'errant') : les armes qui visent
//  « l'étrange » le touchent. Essais : tueur.lancer({ victime, dist }).
// ============================================================================
const TUEUR_LOOK = { skin: '#c4b4a2', hair: '#2a2420', hairStyle: 'court', hat: 'chapeau', hatCol: '#141210', top: '#1d1b18', bottom: '#181614', shoe: '#0e0c0a', coat: true, beard: 'courte', face: TL.faceMan, held: 'couperet', height: 1.08, build: 'mince' };
// où va l'habitant qui « sort » cette nuit-là (le lieu le plus proche de chez lui)
const TUEUR_LIEUX = ['lavoir', 'puits_ville', 'calvaire0', 'calvaire1', 'calvaire2', 'calvaire3', 'calvaire4', 'pont_sud', 'pont_nord', 'ponton', 'pierre_offrandes', 'chene', 'cimetiere', 'pont_riviere', 'clairiere', 'source'];

const tueur = {
  E: null, sortie: null,
  S() { return evenements.S().tueur; },
  // la victime : un habitant resté dehors ; sinon, quelqu'un qui « sort » cette nuit
  choisir(id) {
    const w = game.world, d = farm.s.day;
    const ok = (n) => n && n.st.alive && !n.vanished && !n.hunting && n.state !== 'gone' && n.state !== 'dead' && n.d.id !== 'fillette' && !strange.isKiller(n.id) && (n.d.age || 30) >= 16;
    let v = id ? npcs.byId[id] : null;
    if (!ok(v)) v = null;
    if (!v) { const dehors = npcs.list.filter((n) => ok(n) && !n.inside && n.state !== 'sleep'); if (dehors.length) v = pick(dehors); }
    if (!v) { const tous = npcs.list.filter(ok); if (tous.length) v = tous[(hashString('tueur' + d) + (farm.s.seed >>> 0)) % tous.length]; }
    if (!v) return { v: null, lieu: null };
    const B = w.bld[v.d.home];
    let best = null, bd = 450;
    if (B) for (const k of TUEUR_LIEUX) { const L = w.lm[k]; if (!L || L.under) continue; const dd = Math.hypot(L.x - B.x, L.z - B.z); if (dd < bd) { bd = dd; best = k; } }
    return { v, lieu: best };
  },
  // ------------------------------------------------------------ il arrive
  lancer(opts) {
    opts = opts || {};
    if (this.E || !farm.s || !game.world) return false;
    const w = game.world, p = game.player, S = this.S(), d = farm.s.day;
    let { v, lieu } = this.choisir(opts.victime);
    this.sortie = null;
    if (v && (v.inside || v.state === 'sleep')) {
      if (lieu) { this.sortie = { id: v.id, lieu }; v.goal = null; v.place = null; } else v = null;
    }
    // il arrive de loin, dans le dos
    let x = 0, z = 0, y = 0, found = false;
    for (let k = 0; k < 30 && !found; k++) {
      const a = p.yaw + (Math.random() - 0.5) * 1.6, r = (opts.dist || 85) + Math.random() * 20;
      x = p.pos[0] + Math.sin(a) * r; z = p.pos[2] + Math.cos(a) * r;
      if (!w.inside(x, z, 25) || w.heightAt(x, z) < w.waterLevel + 0.3) continue;
      y = w.heightAt(x, z); found = true;
    }
    if (!found) return false;
    const rig = humanRig(TUEUR_LOOK);
    this.E = { kind: 'errant', x, z, y, rig, t: 0, heading: 0, life: 1e9, etat: 'rode', cible: v ? v.id : 'joueur', vu: 0, stepT: 0, barkT: 0, porteT: 0, coups: 0, guetT: 0, phase: 0, s: 1.02, fuiteT: 0, cineFaite: false };
    this.arme(this.E, false);
    strange.ents.push(this.E);
    S.nuit = d; S.en = d; S.victime = null; S.fui = 0; S.annonce = null;
    return true;
  },
  // il s'en va (pour de bon) ; dansAgir : c'est strange.update qui le retire de la liste
  partir(raison, dansAgir) {
    const E = this.E, S = this.S();
    if (E && !dansAgir) { const i = strange.ents.indexOf(E); if (i >= 0) strange.ents.splice(i, 1); }
    this.E = null; this.sortie = null;
    S.dernier = farm.s.day; S.fin = raison || 'aube';
    if (typeof evenements !== 'undefined') evenements.retenir('tueur');
  },
  // ------------------------------------------------------------ le programme : les nuits où il passe
  programme(dt) {
    const s = farm.s, S = this.S(), hh = evHH(), d = s.day;
    if (this.E || strange.inEnvers() || strange.redNight() || game.sleeping) return;
    if (hh >= 22.3 && hh < 27 && S.tirage !== d) { S.tirage = d; if (evenements.tueur(d)) this.lancer({}); }
  },
  // la nuit a passé sans nous (sommeil, évanouissement) : il est venu quand même
  nuitSansNous() {
    const s = farm.s, S = this.S(), d0 = s.day - 1;
    if (S.tirage === d0 || S.dernier === d0 || !evenements.tueur(d0)) return;
    S.tirage = d0;
    const { v, lieu } = this.choisir(null);
    if (!v) return;
    const w = game.world, L = lieu && w.lm[lieu];
    if (L) { v.x = L.x + (Math.random() - 0.5) * 4; v.z = L.z + (Math.random() - 0.5) * 4; v.y = w.heightAt(v.x, v.z); v.inside = null; }
    const sc = sound.scream; sound.scream = () => {};
    try { npcs.kill(v, 'errant', []); } finally { sound.scream = sc; }
    farm.addProp({ id: 'sang', x: v.x + 0.4, y: w.heightAt(v.x, v.z) + 0.01, z: v.z, r: Math.random() * TAU });
    S.victime = v.id; S.dernier = d0; S.fin = 'meurtre';
    evenements.retenir('tueur');
  },
  // ------------------------------------------------------------ son comportement (appelé par strange.update)
  agir(e, dt, c) {
    const w = game.world, p = game.player, hh = evHH();
    const dx = p.pos[0] - e.x, dz = p.pos[2] - e.z, d = Math.hypot(dx, dz);
    // l'aube : il s'en va
    if (hh >= 29.5 || (hh > 6 && hh < 12 && e.nuit)) { this.partir('aube', true); return false; }
    if (hh >= 20) e.nuit = true;
    const cache = c.insideAny && c.doorsShut;
    const dehors = !p.underground && !c.insideAny;
    let tx = e.x, tz = e.z, sp = 0, run = false, collide = true;
    const v = e.cible !== 'joueur' ? npcs.byId[e.cible] : null;
    if (v && (!v.st.alive || v.state === 'dead' || v.state === 'gone')) e.cible = 'joueur';
    if (e.etat === 'tue') { e.move = 0; e.heading = Math.atan2(dx, dz); return true; }
    if (e.etat === 'fuite') {
      // --- blessé, il fuit
      e.fuiteT -= dt; sp = 7.5; run = true; collide = false;
      tx = e.x - dx / (d || 1) * 20; tz = e.z - dz / (d || 1) * 20;
      if (Math.random() < dt * 8) particles.spawn(e.x, e.y + 0.9, e.z, 0, -0.5, 0, [0.4, 0.02, 0.02, 1], 0.05, 1.5, 9, false);
      if (e.fuiteT <= 0 || d > 60) { this.partir('fui', true); return false; }
    } else {
      const repere = dehors && !cache && ((c.lantern && d < 34) || (p.sprinting && d < 22) || d < 11);
      if (repere && e.etat === 'rode' && !(e.renonce && e.cible === 'joueur')) { e.etat = 'guet'; e.guetT = 0; }
      const lum = this.lumiere(p.pos);
      if (e.etat === 'guet') {
        // au bord de la lumière, immobile ; si on le regarde, il se montre ; puis il approche
        e.guetT += dt;
        const R = c.lantern ? 11 : 8;
        if (d > R + 1) { tx = p.pos[0] - dx / d * R; tz = p.pos[2] - dz / d * R; sp = 2.2; }
        e.heading = Math.atan2(dx, dz);
        if (strange.seen(e, c)) { e.vu += dt; if (!e.cineFaite && e.vu > 0.6 && !cine.on && !ui.panel && typeof cinematiques !== 'undefined') { e.cineFaite = true; cinematiques.tueur(e); } }
        if ((e.vu > 2.5 || e.guetT > 14) && !cine.on) { e.etat = 'chasse'; e.chasseT = 0; this.arme(e, true); }
        if (!dehors || cache) e.etat = 'rode';
      } else if (e.etat === 'chasse') {
        e.chasseT = (e.chasseT || 0) + dt;
        if (cache || (!dehors && p.underground)) { e.etat = 'porte'; e.porteT = 0; }
        else if (lum) {
          // la lumière le tient au bord
          const ld = Math.hypot(e.x - lum.x, e.z - lum.z) || 1;
          if (ld < lum.r) { tx = lum.x + (e.x - lum.x) / ld * (lum.r + 1); tz = lum.z + (e.z - lum.z) / ld * (lum.r + 1); sp = 1.8; }
          else { sp = 0; e.heading = Math.atan2(dx, dz); }
          if (!e.ditLum) { e.ditLum = true; ui.subtitle('', '(Il s’arrête au bord de la lumière. Il n’entre pas. Il attend.)', 4); }
        } else { tx = p.pos[0]; tz = p.pos[2]; sp = 6.2; run = true; }
        strange.fear = Math.max(strange.fear || 0, clamp(1 - d / 30, 0.35, 1));
        // semé
        if (d > 42 || e.chasseT > 28) { e.etat = 'rode'; e.renonce = true; this.arme(e, false); if (d > 42) ui.subtitle('', '(Plus de pas derrière vous. Vous l’avez semé. Pour l’instant.)', 3.5); }
        // rattrapé : un seul coup
        if (d < 1.3 && !cache && !cine.on && !game.dying) {
          e.etat = 'tue'; e.attackAnim = 0.5;
          const fin = () => { if (!game.dying) play.hurt(999, null, 'Égorgé par l’homme au long manteau'); };
          if (typeof cinematiques !== 'undefined') cinematiques.tueurMort(e, fin); else fin();
          return true;
        }
      } else if (e.etat === 'porte') {
        // à la porte : il essaie, il frappe, puis il renonce
        e.porteT += dt; e.heading = Math.atan2(dx, dz);
        if (d > 5) { tx = p.pos[0]; tz = p.pos[2]; sp = 1.6; }
        if (!cache && dehors) { e.etat = 'chasse'; e.chasseT = 0; }
        else if (e.porteT > 4 && e.coups < 3) { e.porteT = -3 - Math.random() * 3; e.coups++; sound.knock && sound.knock(3); if (e.coups === 1) setTimeout(() => ui.subtitle('', '(Trois coups à la porte. Puis on essaie la poignée, doucement.)', 4), 900); if (Math.random() < 0.4) sound.scratch && sound.scratch(); }
        else if (e.coups >= 3 && e.porteT > 6) { e.etat = 'rode'; e.renonce = true; }
      } else {
        // --- il rôde : vers sa victime ; sinon autour du joueur ; loin des yeux, il fait du chemin sans qu'on le voie
        if (v) { tx = v.x; tz = v.z; }
        else if (!e.renonce) { tx = p.pos[0] + Math.sin(e.t * 0.1) * 25; tz = p.pos[2] + Math.cos(e.t * 0.1) * 25; }
        else { tx = e.x + Math.sin(e.t * 0.05) * 30; tz = e.z + Math.cos(e.t * 0.05) * 30; }
        sp = 1.7;
        if (d > 70 && !strange.seen(e, c)) { sp = d > 150 ? 14 : 9; collide = false; }
        if (!v && cache && d < 30 && !e.renonce) { e.etat = 'porte'; e.porteT = 0; }
        if (v && Math.hypot(v.x - e.x, v.z - e.z) < 1.4 && !v.inside) { this.meurtre(e, v); return false; }
      }
    }
    // --- déplacement
    const dd = Math.hypot(tx - e.x, tz - e.z);
    if (dd > 0.6 && sp > 0) {
      e.heading = turnToward(e.heading, Math.atan2(tx - e.x, tz - e.z), dt * 5);
      let nx = e.x + Math.sin(e.heading) * sp * dt, nz = e.z + Math.cos(e.heading) * sp * dt;
      if (collide) [nx, nz] = w.collideCircle(nx, nz, e.y, e.y + 1.8, 0.3, 0.55, true);
      e.x = nx; e.z = nz; e.y = collide ? w.groundAt(nx, nz, e.y + 0.6, 0.6) : Math.max(w.heightAt(nx, nz), w.waterLevel - 0.6);
      e.move = 1; e.run = run; e.phase = (e.phase || 0) + dt * sp * 2.2;
    } else e.move = 0;
    e.attackAnim = Math.max(0, (e.attackAnim || 0) - dt);
    // --- les signes : des pas dans le noir, les chiens qui aboient
    if (d < 45 && e.move && sp < 8) {
      e.stepT -= dt;
      if (e.stepT <= 0) { e.stepT = run ? 0.34 : 0.6; sound.steps1 && sound.steps1(clamp(1 - d / 45, 0.05, 1) * (c.insideAny ? 0.5 : 1), (e.x - p.pos[0]) * c.right[0] + (e.z - p.pos[2]) * c.right[2]); }
    }
    e.barkT -= dt;
    if (e.barkT <= 0) {
      e.barkT = 2 + Math.random() * 3;
      for (const g of entities.list) if (g.kind === 'dog' && !g.dead && Math.hypot(g.x - e.x, g.z - e.z) < 50) { sound.bark && sound.bark(clamp(1 - Math.hypot(g.x - p.pos[0], g.z - p.pos[2]) / 120, 0.1, 1), g.x - p.pos[0]); if (g.owner) game.dogAlarm(e); break; }
    }
    if (d < 60 && !cache) strange.fear = Math.max(strange.fear || 0, 0.2);
    return true;
  },
  arme(e, on) { for (const nm of ['it0', 'it1', 'it2']) { const q = e.rig.part(nm); if (q) q.hide = !on; } },
  // un feu, un réverbère : il n'entre pas dans la lumière
  lumiere(pos) {
    this.lumT = (this.lumT || 0) - 1;
    if (this.lumT > 0) return this.lum;
    this.lumT = 20;
    const w = game.world, sky = game.sky;
    let best = null;
    for (const l of w.lights) {
      if (!(l.flicker || (l.night && sky && sky.nightLit) || l.power)) continue;
      const d = Math.hypot(l.x - pos[0], l.z - pos[2]);
      if (d < l.r * 0.75 && (!best || d < best.d)) best = { x: l.x, z: l.z, r: Math.max(4, l.r * 0.85), d };
    }
    return (this.lum = best);
  },
  // il a rejoint l'habitant (appelé depuis agir)
  meurtre(e, v) {
    const w = game.world, p = game.player;
    e.attackAnim = 0.5;
    npcs.kill(v, 'errant', []);
    this.S().victime = v.id;
    farm.addProp({ id: 'sang', x: v.x + 0.4, y: w.heightAt(v.x, v.z) + 0.01, z: v.z, r: Math.random() * TAU });
    if (Math.hypot(v.x - p.pos[0], v.z - p.pos[2]) < 140) setTimeout(() => ui.subtitle('', '(Un cri, dans la nuit. Un seul. Puis des pas qui s’éloignent, sans se presser.)', 5), 600);
    this.partir('meurtre', true);
  },
  // blessé : il s'enfuit
  blesser(e, dmg) {
    if (!e || e.etat === 'fuite' || e.etat === 'tue') return;
    e.etat = 'fuite'; e.fuiteT = 6; this.arme(e, false);
    sound.hurtHuman && sound.hurtHuman(0.7);
    puffAt(e.x, e.y + 1.2, e.z, [140, 20, 20], 8, 1.5, false);
    this.S().fui = farm.s.day;
    ui.subtitle('', '(Il porte la main à son flanc. Il ne crie pas. Il recule, puis il s’enfuit dans le noir.)', 4.5);
    void dmg;
  },
};
strange.E_errant = function (e, dt, c) { return tueur.E === e ? tueur.agir(e, dt, c) : false; };
// les coups (hache, arc, flèches, fusil…) : ce qui touche l'étrange le touche
{
  const _hit = strange.hit.bind(strange);
  strange.hit = function (e, dmg, from) { if (e && e.kind === 'errant') { tueur.blesser(e, dmg); return; } return _hit(e, dmg, from); };
  // le fusil : un coup de feu qui le vise (même si le module de chasse ne le touche pas lui-même), ou tout près de lui
  const _shot = sound.shot.bind(sound);
  sound.shot = function () {
    const r = _shot();
    const E = tueur.E;
    if (E && E.etat !== 'fuite' && farm.s && game.player) {
      const eye = game.player.eyePos(), f = cameraBasis(game.player.yaw, game.player.pitch).f;
      const dx = E.x - eye[0], dy = E.y + 1.2 - eye[1], dz = E.z - eye[2], d = Math.hypot(dx, dy, dz) || 1;
      const vise = (dx * f[0] + dy * f[1] + dz * f[2]) / d > Math.cos(Math.min(0.12, 1.2 / d + 0.02)) && d < 180 && !game.world.raycastBlocks(eye, [dx / d, dy / d, dz / d], d);
      if (vise || (d < 25 && Math.random() < 0.5)) tueur.blesser(E, 50);
    }
    return r;
  };
}
// l'habitant qui sort cette nuit-là (il ne dormait pas, il est allé marcher)
HOOKS.load.push(() => {
  tueur.E = null; tueur.sortie = null;
  if (game._tueurHooks) return;
  game._tueurHooks = true;
  const _sp = npcs.schedulePlace.bind(npcs);
  npcs.schedulePlace = function (n, h) {
    const So = tueur.sortie;
    if (So && So.id === n.id && tueur.E && (h >= 22 || h < 5)) return { place: 'lieu:' + So.lieu, sleep: false };
    return _sp(n, h);
  };
});
// le matin : le corps retrouvé, le deuil, les rumeurs
HOOKS.day.push(() => {
  const S = tueur.S(), s = farm.s;
  tueur.nuitSansNous();
  if (S.victime && S.dernier >= s.day - 1 && S.annonce !== S.victime) {
    S.annonce = S.victime;
    const n = npcs.byId[S.victime];
    if (n) setTimeout(() => {
      if (!farm.s) return;
      farm.mail('La mairie de ' + farm.names.ville, 'Avis à la population', `On a retrouvé ce matin ${n.name} ${n.d.surname}, mort, dehors. Un homme en long manteau a été vu rôder cette nuit ; personne ne le connaît.\n\nIl est demandé à chacun de fermer sa porte à clé, et de ne pas sortir seul la nuit.\n\nLe maire.`);
      ui.subtitle('', `(Au village, on sonne le glas. On a retrouvé ${n.name}, ce matin.)`, 5);
      sound.bell && sound.bell(0.3);
    }, 5500);
  }
});
HOOKS.update.push((dt) => { if (farm.s && game.mode !== 'menu' && !game.dying) tueur.programme(dt); });
