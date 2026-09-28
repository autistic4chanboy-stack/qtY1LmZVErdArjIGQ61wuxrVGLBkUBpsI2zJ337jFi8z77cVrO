// ============================================================================
//  CHEVAUX SAUVAGES : une harde vit dans un grand pré, loin de tout. On
//  l'approche accroupi, sans courir, une pomme ou une carotte à la main ; les
//  bêtes curieuses viennent d'elles-mêmes. Chaque repas donne un peu de
//  confiance (trois par jour). Quand un cheval se laisse approcher, on tente
//  de le monter : il se cabre, se jette de côté — gardez les yeux droit devant
//  vous jusqu'à ce qu'il s'apaise. Il devient alors le vôtre.
// ============================================================================
const HORSE_FOOD = { pomme: 15, carotte: 15, avoine: 10, friandise: 35, foin: 5, betterave: 8, navet: 6 };
const HORSE_NAMES_WILD = ['Tempête', 'Orage', 'Farouche', 'Bise', 'Galopin', 'Comète', 'Frisson', 'Fougère', 'Rafale', 'Sauvage', 'Brindille', 'Grêle'];
const horses = {
  rodeo: null, hooked: false,
  st() { const s = farm.s; s.wildH = s.wildH || {}; return s; },
  // un grand pré dégagé, loin de la ferme, de la ville et du hameau (choisi une fois)
  findHerd() {
    const s = this.st(), w = game.world, lm = w.lm || {}, WL = w.waterLevel, rnd = mulberry32(s.seed * 17 + 5), F = w.farm.f;
    if (w.herdSpot) return { x: w.herdSpot.x, z: w.herdSpot.z }; // la vallée dessinée : les grands prés du sud-est
    const far = (x, z) => Math.hypot(x - F.x, z - F.z) > 260 && (!w.townInfo || Math.hypot(x - w.townInfo.x, z - w.townInfo.z) > 220) && (!lm.hameau || Math.hypot(x - lm.hameau.x, z - lm.hameau.z) > 160);
    const flat = (x, z) => w.heightAt(x, z) > WL + 1.2 && w.normalAt(x, z)[1] > 0.93 && w.matAt(x, z) <= M_DIRT;
    const biome = (x, z) => (w.biome ? w.biome[Math.floor(z / 8) * w.biomeW + Math.floor(x / 8)] : 0);
    for (let pass = 0; pass < 2; pass++) for (let k = 0; k < 500; k++) {
      const x = 120 + rnd() * (w.size - 240), z = 120 + rnd() * (w.size - 240);
      if (!far(x, z) || !flat(x, z) || (pass === 0 && ![0, 3].includes(biome(x, z)))) continue;
      if (Object.values(lm).some((L) => Math.hypot(L.x - x, L.z - z) < 50)) continue;
      let good = 0;
      for (let a = 0; a < 12; a++) { const r = 12 + (a % 3) * 10, px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r; if (flat(px, pz) && pointFree(w, px, pz, 1)) good++; }
      if (good >= 9) return { x: Math.round(x), z: Math.round(z) };
    }
    return { x: Math.round(F.x + 300), z: Math.round(F.z) };
  },
  init() {
    const s = this.st();
    if (!s.herd) {
      s.herd = this.findHerd();
      const rnd = mulberry32(s.seed * 29 + 3);
      for (let k = 0; k < 4; k++) s.wildH['wh' + k] = { v: (rnd() * 5) | 0, trust: 0 };
      s.wildH.wh4 = { v: (rnd() * 5) | 0, trust: 0, foal: s.day };
      s.wildN = 5;
    }
    this.spawn();
  },
  spawn() {
    const s = this.st(), w = game.world, H0 = s.herd;
    if (!H0 || strange.inEnvers()) return;
    for (const id in s.wildH) {
      if (entities.extra.some((e) => e.wildH === id && !e.removed)) continue;
      const H = s.wildH[id], a = Math.random() * TAU, d = Math.random() * 16;
      const e = entities.add(w, 'horse', H0.x + Math.cos(a) * d, H0.z + Math.sin(a) * d, { v: H.v, wildH: id, scale: H.foal ? 0.62 : 1 });
      e.cfg = CREATURES.wildhorse; e.hx = H0.x; e.hz = H0.z;
    }
  },
  herdFlee(e, px, pz) {
    let first = true;
    for (const h of entities.extra) {
      if (!h.wildH || h.dead || h.ridden || Math.hypot(h.x - e.x, h.z - e.z) > 32) continue;
      entities.startFlee(h, px, pz); h.timer = 3 + Math.random() * 3;
      if (first) { first = false; sound.animal('horse', 0, clamp(1 - e.dist / 40, 0.2, 0.9)); }
    }
  },
  // comportement : fuite (selon la façon dont on approche et la confiance), curiosité
  ai(e, dt, w, c) {
    const s = farm.s, H = s.wildH && s.wildH[e.wildH];
    if (!H) { entities.remove(e); return true; }
    if (s.herd) { e.hx = s.herd.x; e.hz = s.herd.z; }
    if (this.rodeo) return false;
    const p = game.player, spd = Math.hypot(p.vel[0], p.vel[2]), trust = H.trust || 0;
    let alert = c.sprint ? 34 : c.crouch ? (spd > 0.4 ? 6 : 0) : spd > 0.6 ? 15 : 9; // accroupi et immobile : ils viennent d'eux-mêmes
    if (c.riding) alert = 20;
    alert *= 1 - Math.min(0.88, trust / 100);
    if (e.dist < alert && e.state !== 'flee') { this.herdFlee(e, c.px, c.pz); return false; }
    const food = HORSE_FOOD[s.hand] !== undefined;
    if (food && c.crouch && spd < 0.3 && e.dist < 16 && e.state !== 'flee' && !H.foal) {
      e.curious = (e.curious || 0) + dt * (0.35 + trust / 45);
      // la bête curieuse vient jusqu'à vous, puis attend
      if (e.curious > 4 && e.dist > 2.4 && (!e.lure || e.state !== 'walk')) { const k = 1.9 / e.dist; entities.goTo(e, c.px + (e.x - c.px) * k, c.pz + (e.z - c.pz) * k, 'walk'); e.lure = true; }
      if (e.lure && e.dist <= 2.4) { e.state = 'idle'; e.timer = 6; e.heading = turnToward(e.heading, Math.atan2(c.px - e.x, c.pz - e.z), dt * 3); }
    } else { e.curious = Math.max(0, (e.curious || 0) - dt * 0.5); if (e.curious < 2) e.lure = false; }
    return false;
  },
  // touche E sur un cheval sauvage : nourrir, ou tenter de monter
  use(e) {
    const s = farm.s, H = s.wildH[e.wildH];
    if (!H) return;
    if (HORSE_FOOD[s.hand] !== undefined) return this.feed(e, H);
    if (H.foal) { ui.subtitle('', '(Un poulain. Il se serre contre sa mère et vous regarde de travers.)', 3); return; }
    if ((H.trust || 0) < 60) { ui.subtitle('', (H.trust || 0) < 25 ? '(Il recule, les oreilles couchées. Il faudrait l’amadouer : une pomme, une carotte, de l’avoine…)' : '(Il se laisse toucher l’encolure, puis s’écarte. Pas encore.)', 3.5); e.state = 'idle'; e.timer = 1; return; }
    if (H.cool && s.hours < H.cool) { ui.subtitle('', '(Il est encore nerveux. Laissez-le se calmer un peu.)', 2.5); return; }
    this.startRodeo(e, H);
  },
  feed(e, H) {
    const s = farm.s, id = s.hand;
    if (H.fedDay !== s.day) { H.fedDay = s.day; H.fedN = 0; }
    if (H.fedN >= 3) { ui.subtitle('', '(Il détourne la tête : il a assez mangé pour aujourd’hui.)', 2.5); return; }
    if (!farm.take(id, 1)) return;
    H.fedN++;
    const before = H.trust || 0;
    H.trust = Math.min(100, before + HORSE_FOOD[id] * (H.foal ? 0.5 : 1));
    H.seen = s.day;
    e.state = 'idle'; e.timer = 5; e.heading = Math.atan2(game.player.pos[0] - e.x, game.player.pos[2] - e.z);
    sound.animal('horse', 0, 0.45); sound.eat && sound.eat();
    for (let k = 0; k < 5; k++) particles.spawn(e.x + (Math.random() - 0.5) * 0.4, e.y + 1.7, e.z + (Math.random() - 0.5) * 0.4, 0, 0.8, 0, [1, 0.85, 0.6, 1], 0.05, 0.9, 0.5, false);
    const t = H.trust;
    const msg = before < 25 && t >= 25 ? '(Il mange dans votre main, prudemment. Il vous observe.)'
      : before < 45 && t >= 45 ? '(Il ne recule plus quand vous approchez. Il vous cherche du regard.)'
        : before < 60 && t >= 60 ? '(Il pose la tête contre votre épaule. Il se laisserait peut-être monter.)'
          : '(Il mâche lentement, les yeux mi-clos.)';
    ui.subtitle('', msg, 3);
  },
  // ---------------------------------------------------------------- le dressage
  startRodeo(e, H) {
    const p = game.player;
    this.rodeo = { e, H, t: 0, dur: 6.8 - H.trust / 40, next: 0.7, jerk: 0, jerkT: 0, bad: 0, target: p.yaw, run: false, runT: 1.2 };
    p.riding = e; e.ridden = true; e.follow = false;
    p.pos = [e.x, e.y, e.z]; e.heading = p.yaw + Math.PI;
    game.horseE = e;
    sound.animal('horse', 0, 1); game.shakeT = 0.6;
    ui.subtitle('', '(Il se cabre ! Tenez bon — gardez les yeux droit devant vous.)', 3.5);
  },
  updateRodeo(dt) {
    const R = this.rodeo, p = game.player;
    if (!R) return;
    if (p.riding !== R.e) { this.rodeo = null; return; }
    R.t += dt;
    const str = 1.25 - (R.H.trust || 60) / 160;
    R.next -= dt;
    if (R.next <= 0) {
      R.next = 0.5 + Math.random() * 0.55;
      R.jerk = (Math.random() < 0.5 ? -1 : 1) * (0.8 + Math.random() * 0.7) * str; R.jerkT = 0.25;
      game.shakeT = Math.max(game.shakeT, 0.35); p.eyeOffset += 0.22; p.kickPitch = (p.kickPitch || 0) + 0.1;
      sound.hoof && sound.hoof('grass', 1);
      if (Math.random() < 0.4) sound.animal('horse', 0, 0.9);
    }
    if (R.jerkT > 0) { p.yaw += R.jerk * Math.min(dt, R.jerkT) / 0.25; R.jerkT -= dt; }
    R.runT -= dt; if (R.runT <= 0) { R.run = !R.run; R.runT = 0.7 + Math.random() * 1.2; }
    const off = Math.abs(angDiff(p.yaw, R.target));
    R.bad = off > 1.05 ? R.bad + dt : Math.max(0, R.bad - dt * 0.6);
    if (R.bad > 0.65) return this.throwOff(false);
    if (R.t >= R.dur) return this.tame();
  },
  throwOff(letGo) {
    const R = this.rodeo;
    if (!R) return;
    this.rodeo = null;
    const p = game.player, e = R.e, H = R.H;
    this._dismount.call(game);
    if (!letGo) { play.hurt(7 + Math.random() * 8, null, 'Désarçonné par un cheval sauvage'); p.vel[1] = 3.5; }
    H.trust = Math.max(0, (H.trust || 0) - (letGo ? 4 : 10)); H.cool = farm.s.hours + 0.75;
    entities.startFlee(e, p.pos[0], p.pos[2]); e.timer = 5;
    sound.animal('horse', 0, 1);
    ui.subtitle('', letGo ? '(Vous lâchez prise et sautez à terre.)' : pick(['(Il vous jette à terre et part au galop.)', '(Le ciel, l’herbe, le ciel : vous voilà par terre.)', '(Une ruade, et vous mordez la poussière.)']), 3);
  },
  tame() {
    const R = this.rodeo;
    this.rodeo = null;
    const s = farm.s, e = R.e, w = game.world;
    delete s.wildH[e.wildH];
    const a = farm.newAnimal('horse');
    a.v = e.v; a.wild = 1; a.mood = 0.6; a.name = HORSE_NAMES_WILD[(Math.random() * HORSE_NAMES_WILD.length) | 0];
    s.animals.push(a);
    e.owner = 'joueur'; e.aid = a.id; e.wildH = null; e.cfg = CREATURES.horse;
    const fm = w.farm, home = fm.barn || fm.yard || { x: fm.f.x, z: fm.f.z, door: [fm.f.x, fm.f.z] };
    e.shelter = { x: home.x, z: home.z };
    s.stats.tamed = (s.stats.tamed || 0) + 1;
    if (farm.count('selle')) { const sd = e.rig.part('saddle'); if (sd) sd.hide = false; }
    sound.animal('horse', 0, 0.6);
    ui.subtitle('', `(Il cesse de se débattre. Son souffle ralentit sous vous. Vous l’appelez « ${a.name} ».)`, 5);
    game.shakeT = 0;
  },
  // ---------------------------------------------------------------- jours
  day() {
    const s = this.st(), w = game.world;
    if (!s.herd) return;
    // la harde se déplace un peu
    const rnd = Math.random;
    for (let k = 0; k < 20; k++) {
      const a = rnd() * TAU, d = 20 + rnd() * 50, x = s.herd.x + Math.cos(a) * d, z = s.herd.z + Math.sin(a) * d;
      const F = w.farm.f;
      if (w.inside(x, z, 80) && w.heightAt(x, z) > w.waterLevel + 1.2 && w.normalAt(x, z)[1] > 0.93 && Math.hypot(x - F.x, z - F.z) > 220 && (!w.herdSpot || Math.hypot(x - w.herdSpot.x, z - w.herdSpot.z) < 260)) { s.herd = { x: Math.round(x), z: Math.round(z) }; break; }
    }
    for (const id in s.wildH) {
      const H = s.wildH[id];
      if (H.foal && s.day - H.foal >= 6) { delete H.foal; const e = entities.extra.find((q) => q.wildH === id); if (e) e.scale = 1; }
      if ((H.trust || 0) > 0 && (H.seen || 0) < s.day - 1) H.trust = Math.max(0, H.trust - 3); // oublié s'il ne vous voit plus
    }
    const n = Object.keys(s.wildH).length;
    if (n < 5 && Math.random() < (n < 3 ? 0.5 : 0.2)) { s.wildH['wh' + (s.wildN = (s.wildN || 5) + 1)] = { v: (Math.random() * 5) | 0, trust: 0, foal: s.day }; }
    this.spawn();
  },
};

// ---------------------------------------------------------------- accroches
{
  const _uw = entities.updateWalker.bind(entities);
  entities.updateWalker = function (e, dt, w, c) {
    if (e.wildH && horses.ai(e, dt, w, c)) return;
    return _uw(e, dt, w, c);
  };
  // pendant le dressage, le cheval décide : il galope, se jette de côté
  const _pu = Player.prototype.update;
  Player.prototype.update = function (dt, w, c) {
    const R = horses.rodeo;
    if (R && this.riding === R.e) c = Object.assign({}, c, { fwd: 1, right: 0, sprint: R.run, up: Math.random() < dt * 0.6, down: false });
    return _pu.call(this, dt, w, c);
  };
}
HOOKS.load.push(() => {
  if (!horses.hooked) {
    horses.hooked = true;
    horses._dismount = game.dismount;
    game.dismount = function () { if (horses.rodeo) return horses.throwOff(true); return horses._dismount.call(this); };
    const _use = game.useAnimal.bind(game);
    game.useAnimal = function (e) { if (e.wildH) return horses.use(e); return _use(e); };
  }
  horses.rodeo = null;
  horses.init();
});
HOOKS.day.push(() => horses.day());
HOOKS.update.push((dt, eye, basis, sky, playing) => {
  if (playing) horses.updateRodeo(dt);
  const p = game.player;
  if (p.riding && p.riding.kind === 'horse' && farm.count('selle') && !horses.rodeo) p.mods.speed *= 1.1;
});
// abreuvoirs de la ville : le cheval boit, il repart plein d'allant
HOOKS.inter.abreuvoir = () => {
  const p = game.player;
  if (p.riding) { p.stamina = 1; sound.splash && sound.splash(); ui.subtitle('', '(Votre monture boit longuement. Elle souffle, puis relève la tête.)', 3); }
  else ui.subtitle('', '(L’eau est fraîche. Pour les chevaux, surtout.)', 2.5);
};
