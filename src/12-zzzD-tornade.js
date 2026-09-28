// ============================================================================
//  LES TORNADES (très rares : un jour d'orage ou de canicule, voir
//  evenements.tornade(jour)). Le ciel verdit, le vent tourne ; un entonnoir de
//  poussière descend des nuages (courte cinématique), touche terre, avance une
//  à trois minutes en grondant, puis remonte. Il soulève et projette le joueur
//  (les dégâts de chute du socle font le reste), arrache les cultures, blesse
//  les habitants trop proches. Essais : tornade.lancer({ dist, duree, ciel }).
// ============================================================================
const tornade = {
  E: null, son: null, lanceT: 0,
  // ------------------------------------------------------------ naissance
  lancer(opts) {
    if (this.E || !farm.s || !game.world) return false;
    opts = opts || {};
    const w = game.world, p = game.player.pos;
    let pt = null;
    if (opts.x !== undefined) pt = { x: opts.x, z: opts.z, y: w.heightAt(opts.x, opts.z) };
    else pt = evPointLibre(opts.dist || 150, (opts.dist || 150) + 70, { libre: false });
    if (!pt) return false;
    // elle marche vers un point près du joueur, puis continue
    const tx = p[0] + (Math.random() - 0.5) * 30, tz = p[2] + (Math.random() - 0.5) * 30, a = Math.atan2(tx - pt.x, tz - pt.z);
    this.E = { x: pt.x, z: pt.z, y: pt.y, dir: a, v: 4.5 + Math.random() * 2, t: 0, phase: 'ciel', cielT: opts.ciel ?? 14, descT: 0, vie: opts.duree ?? (60 + Math.random() * 120), finT: 0, vert: 0, touches: new Set(), cropT: 0, debrisT: 0, seed: Math.random() * 100, bas: 90 };
    evenements.S().tornade.dernier = farm.s.day;
    return true;
  },
  // ------------------------------------------------------------ chaque image
  update(dt, eye, basis) {
    const s = farm.s;
    if (!s || game.mode === 'menu' || game.dying || !game.world) { this.sonMaj(0); return; }
    const w = game.world, p = game.player, hh = evHH(), d = s.day;
    this.lanceT = Math.max(0, this.lanceT - dt);
    // le programme : l'heure du jour, s'il y en a une
    if (!this.E && !strange.inEnvers()) {
      if (this.jourCalc !== d || this.seedCalc !== s.seed) { this.jourCalc = d; this.seedCalc = s.seed; this.h0 = evenements.tornade(d); }
      const h0 = this.h0, S = evenements.S();
      if (h0 !== null && S.tornade.jour !== d && hh >= h0 - 0.6 && hh < h0 + 1) { S.tornade.jour = d; this.lancer({}); }
    }
    const E = this.E;
    if (!E) { this.sonMaj(0); return; }
    E.t += dt;
    // le temps : orage forcé, vent
    weather.cur.storm = Math.max(weather.cur.storm, 0.7); weather.cur.cloud = Math.max(weather.cur.cloud, 0.95); weather.cur.rain = Math.max(weather.cur.rain, 0.5);
    const dist = Math.hypot(E.x - p.pos[0], E.z - p.pos[2]);
    if (E.phase === 'ciel') {
      E.vert = Math.min(1, E.vert + dt / 6);
      if (!E.dit && E.t > 2) { E.dit = true; if (!p.underground) ui.subtitle('', '(Le ciel est devenu vert. Le vent tourne en rond, et les oiseaux se sont tus.)', 4.5); evenements.reagir('tornade'); }
      if (E.t >= E.cielT) {
        E.phase = 'descente'; E.descT = 0;
        evenements.retenir('tornade');
        if (evenements.dehors() && !cine.on && !ui.panel && !game.sleeping && dist < 700 && typeof cinematiques !== 'undefined') cinematiques.tornade(E);
      }
    } else if (E.phase === 'descente') {
      E.descT += dt; E.bas = Math.max(0, 90 * (1 - E.descT / 5));
      if (E.descT >= 5) { E.phase = 'sol'; E.solT = 0; E.bas = 0; }
    } else if (E.phase === 'sol') {
      E.solT += dt;
      // elle avance, en zigzag
      E.dir += Math.sin(E.t * 0.35 + E.seed) * dt * 0.25;
      E.x += Math.sin(E.dir) * E.v * dt; E.z += Math.cos(E.dir) * E.v * dt;
      if (!w.inside(E.x, E.z, 30)) E.solT = E.vie;
      E.y = Math.max(w.heightAt(E.x, E.z), w.waterLevel);
      this.effets(dt, eye, dist);
      if (E.solT >= E.vie) { E.phase = 'fin'; E.finT = 0; if (dist < 400 && !p.underground) ui.subtitle('', '(La trombe remonte dans les nuages, d’un coup. Le silence qui suit est pire que le vent.)', 5); }
    } else if (E.phase === 'fin') {
      E.finT += dt; E.bas = Math.min(95, E.finT / 5 * 95); E.vert = Math.max(0, 1 - E.finT / 8);
      if (E.finT >= 8) { this.E = null; this.sonMaj(0); return; }
    }
    // la poussière à la base
    if (E.phase === 'sol' && dist < 260) {
      for (let i = 0; i < Math.min(12, dt * 220); i++) {
        const a = Math.random() * TAU, r = 2 + Math.random() * 7, t = a + Math.PI / 2;
        particles.spawn(E.x + Math.cos(a) * r, E.y + Math.random() * 3, E.z + Math.sin(a) * r, Math.cos(t) * 9 + Math.cos(a) * 2, 2 + Math.random() * 5, Math.sin(t) * 9 + Math.sin(a) * 2, [0.42, 0.36, 0.28, 0.7], 0.5 + Math.random() * 1.2, 1.2 + Math.random(), -0.2, false);
      }
    }
    // le grondement
    const k = E.phase === 'ciel' ? E.vert * 0.25 : E.phase === 'fin' ? Math.max(0, 1 - E.finT / 5) : 1;
    this.sonMaj(k * clamp(1.25 - dist / 320, 0, 1) * (p.underground ? 0.2 : 1));
  },
  // ce qu'elle fait autour d'elle
  effets(dt, eye, dist) {
    const E = this.E, p = game.player, w = game.world, s = farm.s;
    // le joueur : attiré, frappé par les débris, soulevé et projeté
    if (!p.underground && !cine.on && !game.sleeping) {
      if (dist < 30 && dist > 0.5) {
        const k = (1 - dist / 30) * 2.8 * dt, dx = (E.x - p.pos[0]) / dist, dz = (E.z - p.pos[2]) / dist;
        const [nx, nz] = p.collide(w, p.pos[0] + dx * k - dz * k * 0.6, p.pos[2] + dz * k + dx * k * 0.6, 0.3);
        p.pos[0] = nx; p.pos[2] = nz;
        game.shakeT = Math.max(game.shakeT || 0, (1 - dist / 30) * 0.6);
      }
      if (dist < 18) { E.debrisT -= dt; if (E.debrisT <= 0) { E.debrisT = 0.9; if (Math.random() < 0.35) { play.hurt(3 + Math.random() * 3, E, 'Emporté par une tornade'); ui.subtitle('', pick(['(Une branche vous frappe au visage.)', '(Des pierres, des tuiles, de la terre : tout vole.)', '(Quelque chose de lourd vous heurte l’épaule.)']), 2); } } }
      if (dist < 6.5 && this.lanceT <= 0) {
        if (p.riding) game.dismount();
        this.lanceT = 5;
        const dx = (p.pos[0] - E.x) / (dist || 1), dz = (p.pos[2] - E.z) / (dist || 1), up = 14 + Math.random() * 4;
        p.vel = [-dz * 9 + dx * 4, up, dx * 9 + dz * 4]; p.onGround = false; p.pos[1] += 0.3;
        game.shakeT = 1; sound.hurt && sound.hurt(10);
        ui.subtitle('', '(Le vent vous arrache du sol. Le ciel, la terre, le ciel.)', 3);
      }
    }
    // les cultures arrachées
    E.cropT -= dt;
    if (E.cropT <= 0) {
      E.cropT = 0.3;
      let n = 0;
      for (const k in s.crops) {
        const c = s.crops[k];
        if (!c.c && !c.tree) continue;
        const i = k.indexOf(','), x = +k.slice(0, i) + 0.5, z = +k.slice(i + 1) + 0.5;
        if (Math.abs(x - E.x) > 8 || Math.abs(z - E.z) > 8 || Math.hypot(x - E.x, z - E.z) > 7.5) continue;
        if (c.tree && Math.random() < 0.7) continue;
        c.c = null; c.g = 0; c.dead = false; c.tree = false; n++;
        particles.spawn(x, w.heightAt(x, z) + 0.3, z, (Math.random() - 0.5) * 6, 6 + Math.random() * 8, (Math.random() - 0.5) * 6, [0.35, 0.5, 0.2, 1], 0.12, 2.5, 4, false);
      }
      if (n) { farm.dirtyProps = true; E.arrache = (E.arrache || 0) + n; }
      // les habitants trop près
      for (const m of npcs.list) {
        if (!m.st.alive || m.vanished || m.hunting || m.state === 'gone' || m.state === 'dead' || E.touches.has(m.id) || m.inside) continue;
        if (Math.hypot(m.x - E.x, m.z - E.z) > 12) continue;
        E.touches.add(m.id);
        npcs.hurt(m, 30 + Math.random() * 15, 'tornade');
        if (m.st.alive) { m.fleeT = 5; npcs.say(m, pick(['Au secours ! Le vent !', 'Aidez-moi !', 'Mon Dieu, mon Dieu…']), 2.5); }
      }
      // les bêtes s'enfuient
      entities.scare(E.x, E.z, 40);
    }
  },
  // ------------------------------------------------------------ le ciel verdit
  sky(sky) {
    const E = this.E;
    if (!E) return;
    const k = E.vert * 0.8 * (1 - sky.night * 0.6);
    if (k > 0) {
      sky.zen = v3.lerp(sky.zen, v3.scale([0.24, 0.34, 0.24], Math.max(0.3, sky.day)), 0.55 * k); sky.hor = v3.lerp(sky.hor, v3.scale([0.4, 0.5, 0.32], Math.max(0.3, sky.day)), 0.55 * k);
      sky.amb = v3.lerp(sky.amb, v3.scale([0.26, 0.32, 0.22], Math.max(0.35, sky.day)), 0.35 * k); sky.haze = v3.lerp(sky.haze, v3.scale([0.36, 0.44, 0.3], Math.max(0.3, sky.day)), 0.45 * k);
      sky.cloudLit = v3.lerp(sky.cloudLit, [0.42, 0.52, 0.36], 0.5 * k); sky.cloudDark = v3.lerp(sky.cloudDark, [0.18, 0.24, 0.16], 0.5 * k);
    }
    if (E.phase !== 'ciel') sky.fog = [Math.max(sky.fog[0], 50), Math.max(sky.fog[1], 330)];
  },
  // ------------------------------------------------------------ l'entonnoir : des anneaux de poussière qui tournent
  draw(buf, sbuf, cam, t) {
    const E = this.E;
    if (!E || E.phase === 'ciel') return;
    if (Math.hypot(E.x - cam[0], E.z - cam[2]) > 520) return;
    PE.buf = buf; PE.fl = 0;
    const H = 95, N = 22;
    for (let i = 0; i < N; i++) {
      const u = i / (N - 1), h = u * H;
      if (h < E.bas) continue;
      const r = 1.3 + Math.pow(u, 1.7) * 21, ox = Math.sin(t * 0.7 + u * 2.4 + E.seed) * u * 7, oz = Math.cos(t * 0.5 + u * 2 + E.seed) * u * 7;
      const m = 5 + Math.floor(u * 6), g = lerp(0.3, 0.5, u), col = [g * 1.02, g, g * 0.95];
      PE.frame(E.x + ox, E.y + h, E.z + oz, 0, 1);
      for (let j = 0; j < m; j++) {
        const a = j / m * TAU + t * (3.6 - u * 2) + i * 0.45;
        PE.box(Math.cos(a) * r, 0, Math.sin(a) * r, r * 0.95 + 0.6, H / N * 1.45, 0.9 + u * 1.2, col, TL.wool, -a + Math.PI / 2);
      }
    }
    // des débris qui tournent
    if (E.phase === 'sol') {
      PE.frame(E.x, E.y, E.z, 0, 1);
      for (let k = 0; k < 12; k++) {
        const a = t * (2.2 + (k % 3) * 0.4) + k * 1.7, r = 3 + (k % 4) * 2.5, h = 2 + ((k * 7) % 11) * 2.2 + Math.sin(t * 2 + k) * 1.5;
        PE.box(Math.cos(a) * r, h, Math.sin(a) * r, 0.25 + (k % 2) * 0.4, 0.12, 0.9 + (k % 3) * 0.5, k % 3 ? [0.4, 0.3, 0.2] : [0.3, 0.42, 0.2], k % 3 ? TL.wood : TL.leaves, a * 2, a, a * 0.7);
      }
    }
  },
  // ------------------------------------------------------------ le son : un grondement grave, continu (seulement pendant la tornade)
  sonMaj(k) {
    if (!sound.ctx || !sound.brown) return;
    if (k <= 0.001 && !this.son) return;
    const c = sound.ctx;
    if (!this.son) {
      try {
        const src = c.createBufferSource(); src.buffer = sound.brown; src.loop = true;
        const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 240;
        const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 520; bp.Q.value = 1.4;
        const g = c.createGain(); g.gain.value = 0; const g2 = c.createGain(); g2.gain.value = 0;
        src.connect(lp).connect(g).connect(sound.amb); src.connect(bp).connect(g2).connect(sound.amb);
        src.start();
        this.son = { src, g, g2, bp };
      } catch (e) { this.son = null; return; }
    }
    const S = this.son, t = c.currentTime;
    S.g.gain.setTargetAtTime(k * 0.9, t, 0.3);
    S.g2.gain.setTargetAtTime(k * 0.08 * (0.7 + 0.3 * Math.sin(t * 1.3)), t, 0.3);
    S.bp.frequency.setTargetAtTime(420 + Math.sin(t * 0.7) * 160, t, 0.5);
    if (k <= 0.001) { try { S.src.stop(t + 1); } catch (e) { /* déjà arrêté */ } this.son = null; }
  },
};
// les chutes qui suivent une tornade ont une autre cause
{
  const _hurt = play.hurt.bind(play);
  play.hurt = function (dmg, src, cause) { if (tornade.lanceT > 0 && typeof cause === 'string' && /chute/i.test(cause)) cause = 'Projeté par une tornade'; return _hurt(dmg, src, cause); };
}
HOOKS.load.push(() => { tornade.E = null; tornade.lanceT = 0; tornade.sonMaj(0); });
HOOKS.update.push((dt, eye, basis) => tornade.update(dt, eye, basis));
HOOKS.sky.push((sky) => tornade.sky(sky));
HOOKS.draw.push((buf, sbuf, cam, t) => tornade.draw(buf, sbuf, cam, t));
