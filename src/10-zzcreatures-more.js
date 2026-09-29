// ============================================================================
//  BÊTES EN PLUS : faune sauvage (écureuils, hérissons, blaireaux, chevreuils,
//  bouquetins, marmottes, ours, lynx, loutres, grenouilles, vipères, hérons,
//  cigognes, cygnes, faisans, perdrix, hiboux, chauves-souris, pies), la Bête
//  des Combes, et les bêtes de la ferme en plus (chèvre, âne, oie, cane, lapin)
// ============================================================================
Object.assign(CREATURES, {
  goat: { walk: 0.8, run: 3.6, range: 10, flee: 0, radius: 0.35, idle: [2, 7], call: 'goat', solid: true, graze: true, rig: 'goat', h: 1.0 },
  donkey: { walk: 0.9, run: 4.5, range: 10, flee: 0, radius: 0.5, idle: [3, 9], call: 'donkey', solid: true, graze: true, rig: 'donkey', h: 1.7 },
  goose: { walk: 0.7, run: 2.8, range: 8, flee: 0, radius: 0.2, idle: [2, 6], call: 'goose', rig: 'goose', h: 0.7, peck: true, guard: true },
  farmduck: { walk: 0.6, run: 2.2, range: 7, flee: 1.8, radius: 0.18, idle: [2, 6], call: 'duck', rig: 'farmduck', h: 0.45, peck: true },
  farmrabbit: { walk: 0.8, run: 4, range: 6, flee: 0, radius: 0.15, idle: [1, 5], hop: true, rig: 'farmrabbit', h: 0.4 },
  squirrel: { walk: 1.1, run: 6.5, range: 14, flee: 9, radius: 0.1, idle: [1, 4], hop: true, rig: 'squirrel', h: 0.3, wild: true, arbre: true },
  hedgehog: { walk: 0.35, run: 0.6, range: 8, flee: 0, radius: 0.12, idle: [2, 6], rig: 'hedgehog', h: 0.2, wild: true, curl: true, nuit: true },
  badger: { walk: 0.7, run: 4.5, range: 16, flee: 8, radius: 0.25, idle: [2, 6], rig: 'badger', h: 0.45, wild: true, nuit: true },
  roe: { walk: 1.0, run: 8.0, range: 26, flee: 20, radius: 0.3, idle: [2, 7], solid: true, graze: true, rig: 'roe', h: 1.4, wild: true, shy: true },
  ibex: { walk: 0.8, run: 6.0, range: 22, flee: 16, radius: 0.35, idle: [3, 8], solid: true, graze: true, rig: 'ibex', h: 1.2, wild: true },
  marmot: { walk: 0.6, run: 4.0, range: 10, flee: 12, radius: 0.15, idle: [2, 8], rig: 'marmot', h: 0.3, wild: true, terrier: true },
  bear: { walk: 0.9, run: 7.0, range: 30, flee: 0, radius: 0.7, idle: [3, 10], solid: true, rig: 'bear', h: 1.6, wild: true, charge: 9, dmg: 32 },
  lynx: { walk: 1.1, run: 8.0, range: 30, flee: 14, radius: 0.25, idle: [2, 6], rig: 'lynx', h: 0.8, wild: true, nuit: true },
  otter: { walk: 0.8, run: 3.5, range: 12, flee: 9, radius: 0.15, idle: [2, 6], rig: 'otter', h: 0.3, wild: true },
  frog: { walk: 0.3, run: 2.5, range: 5, flee: 3, radius: 0.06, idle: [1, 5], hop: true, rig: 'frog', h: 0.12, wild: true, call: 'frog' },
  snake: { walk: 0.35, run: 1.4, range: 6, flee: 0, radius: 0.1, idle: [3, 10], rig: 'snake', h: 0.1, wild: true, bite: 1.2 },
  heron: { walk: 0.4, run: 1.5, range: 8, flee: 12, radius: 0.2, idle: [4, 12], rig: 'heron', h: 1.1, wild: true, oiseau: true, call: 'heron' },
  stork: { walk: 0.5, run: 1.6, range: 12, flee: 12, radius: 0.2, idle: [3, 10], rig: 'stork', h: 1.2, wild: true, oiseau: true },
  swan: { walk: 0.5, run: 1.5, range: 12, flee: 5, radius: 0.3, idle: [2, 6], water: true, rig: 'swan', h: 0.8, sacre: 'dame' },
  pheasant: { walk: 0.6, run: 3.0, range: 12, flee: 5, radius: 0.12, idle: [2, 6], rig: 'pheasant', h: 0.4, wild: true, oiseau: true, flush: true, call: 'pheasant' },
  partridge: { walk: 0.6, run: 3.0, range: 10, flee: 6, radius: 0.1, idle: [1, 4], rig: 'partridge', h: 0.25, wild: true, oiseau: true, flush: true },
  magpie: { walk: 0.7, run: 2.5, range: 12, flee: 6, radius: 0.1, idle: [1, 4], rig: 'magpie', h: 0.3, wild: true, oiseau: true, call: 'magpie' },
  owl: { walk: 0, run: 0, range: 30, flee: 7, radius: 0.15, idle: [4, 10], rig: 'owl', h: 0.5, wild: true, perch: true },
  bat: { fly: true, rig: 'bat', flock: 5, nightFly: true },
  bete: { walk: 1.2, run: 7.8, range: 4, flee: 0, radius: 0.9, idle: [5, 12], solid: true, rig: 'bete', h: 2.1, dmg: 38, boss: true },
});
Object.assign(PREY, {
  goat: { hp: 30, drop: [['viande', 2, 3], ['cuir', 1, 1]] }, donkey: { hp: 70, drop: [['viande', 3, 4], ['cuir', 2, 2]] },
  goose: { hp: 10, drop: [['viande', 1, 2], ['plume', 2, 3]] }, farmduck: { hp: 8, drop: [['viande', 1, 1], ['plume', 1, 2]] },
  farmrabbit: { hp: 8, drop: [['viande', 1, 1], ['poil_lapin', 0, 1]] },
  squirrel: { hp: 5, drop: [['cuir', 0, 1]] }, hedgehog: { hp: 5, drop: [] }, badger: { hp: 25, drop: [['fourrure', 1, 1], ['cuir', 0, 1]] },
  roe: { hp: 30, drop: [['viande', 2, 3], ['cuir', 1, 1]] }, ibex: { hp: 45, drop: [['viande', 3, 4], ['cuir', 1, 2], ['bois_de_cerf', 0, 1, 0.4]] },
  marmot: { hp: 8, drop: [['viande', 1, 1], ['fourrure', 0, 1]] }, bear: { hp: 260, drop: [['viande', 6, 8], ['fourrure', 2, 3], ['croc', 2, 3], ['cuir', 2, 3]] },
  lynx: { hp: 45, drop: [['fourrure', 1, 2], ['croc', 1, 1]] }, otter: { hp: 15, drop: [['fourrure', 1, 1]] }, frog: { hp: 2, drop: [['viande', 0, 1, 0.5]] },
  snake: { hp: 6, drop: [['venin', 1, 1], ['mue_serpent', 0, 1]] }, heron: { hp: 10, drop: [['plume', 2, 3]] }, stork: { hp: 10, drop: [['plume', 2, 3]] },
  swan: { hp: 14, drop: [['plume', 3, 4], ['viande', 1, 2]] }, pheasant: { hp: 6, drop: [['viande', 1, 2], ['plume', 2, 3]] }, partridge: { hp: 5, drop: [['viande', 1, 1], ['plume', 1, 1]] },
  magpie: { hp: 4, drop: [['plume_noire', 1, 1], ['vieille_piece', 1, 1, 0.3]] }, owl: { hp: 6, drop: [['plume_hibou', 1, 2]] }, bat: { hp: 3, drop: [['aile_chauve_souris', 1, 2]] },
  bete: { hp: 420, drop: [['relique_croc', 1, 1], ['croc', 3, 4], ['fourrure', 3, 4], ['viande', 4, 6]] },
});
// points d'apparition (objets du monde « animaux »)
OBJ_TYPES.push(
  { id: 'squirrels', name: 'Écureuil', cat: 'Animaux', spr: ['a_rabbit'], h: [0.3, 0.3], animal: 'squirrel', col: 0, sway: 0, spacing: 3, sink: 0 },
  { id: 'hedgehogs', name: 'Hérisson', cat: 'Animaux', spr: ['a_rabbit'], h: [0.2, 0.2], animal: 'hedgehog', col: 0, sway: 0, spacing: 3, sink: 0 },
  { id: 'badgers', name: 'Blaireau', cat: 'Animaux', spr: ['a_rabbit'], h: [0.45, 0.45], animal: 'badger', col: 0, sway: 0, spacing: 3, sink: 0 },
  { id: 'roes', name: 'Chevreuil', cat: 'Animaux', spr: ['a_deer'], h: [1.4, 1.4], animal: 'roe', col: 0, sway: 0, spacing: 3, sink: 0 },
  { id: 'ibexes', name: 'Bouquetin', cat: 'Animaux', spr: ['a_deer'], h: [1.2, 1.2], animal: 'ibex', col: 0, sway: 0, spacing: 3, sink: 0 },
  { id: 'marmots', name: 'Marmotte', cat: 'Animaux', spr: ['a_rabbit'], h: [0.3, 0.3], animal: 'marmot', col: 0, sway: 0, spacing: 3, sink: 0 },
  { id: 'bears', name: 'Ours', cat: 'Animaux', spr: ['a_pig'], h: [1.6, 1.6], animal: 'bear', col: 0, sway: 0, spacing: 5, sink: 0 },
  { id: 'lynxes', name: 'Lynx', cat: 'Animaux', spr: ['a_deer'], h: [0.8, 0.8], animal: 'lynx', col: 0, sway: 0, spacing: 3, sink: 0 },
  { id: 'otters', name: 'Loutre', cat: 'Animaux', spr: ['a_rabbit'], h: [0.3, 0.3], animal: 'otter', col: 0, sway: 0, spacing: 3, sink: 0 },
  { id: 'frogs', name: 'Grenouille', cat: 'Animaux', spr: ['a_rabbit'], h: [0.12, 0.12], animal: 'frog', col: 0, sway: 0, spacing: 2, sink: 0 },
  { id: 'snakes', name: 'Vipère', cat: 'Animaux', spr: ['a_rabbit'], h: [0.1, 0.1], animal: 'snake', col: 0, sway: 0, spacing: 3, sink: 0 },
  { id: 'herons', name: 'Héron', cat: 'Animaux', spr: ['a_duck'], h: [1.1, 1.1], animal: 'heron', col: 0, sway: 0, spacing: 3, sink: 0 },
  { id: 'storks', name: 'Cigogne', cat: 'Animaux', spr: ['a_duck'], h: [1.2, 1.2], animal: 'stork', col: 0, sway: 0, spacing: 3, sink: 0 },
  { id: 'swans', name: 'Cygne', cat: 'Animaux', spr: ['a_duck'], h: [0.8, 0.8], animal: 'swan', col: 0, sway: 0, spacing: 3, sink: 0 },
  { id: 'pheasants', name: 'Faisan', cat: 'Animaux', spr: ['a_hen0'], h: [0.4, 0.4], animal: 'pheasant', col: 0, sway: 0, spacing: 3, sink: 0 },
  { id: 'partridges', name: 'Perdrix', cat: 'Animaux', spr: ['a_hen0'], h: [0.25, 0.25], animal: 'partridge', col: 0, sway: 0, spacing: 3, sink: 0 },
  { id: 'magpies', name: 'Pie', cat: 'Animaux', spr: ['a_bird'], h: [0.3, 0.3], animal: 'magpie', col: 0, sway: 0, spacing: 3, sink: 0 },
  { id: 'owls', name: 'Hibou', cat: 'Animaux', spr: ['a_bird'], h: [0.5, 0.5], animal: 'owl', col: 0, sway: 0, spacing: 5, sink: 0 },
  { id: 'bats', name: 'Chauves-souris', cat: 'Animaux', spr: ['a_bird'], h: [0.2, 0.2], animal: 'bat', col: 0, sway: 0, spacing: 10, sink: 0 },
);
OBJ_TYPES.forEach((t, i) => { OBJ_INDEX[t.id] = i; });

// ---------------------------------------------------------------- comportements
const TREE_IDS = new Set(['oak', 'pine', 'birch', 'apple', 'deadtree']);
const beasts = {
  // oiseaux au sol : s'envolent quand on approche, se reposent plus loin
  groundBird(e, dt, w, c) {
    const cfg = e.cfg;
    if (e.flyT > 0) {
      e.flyT -= dt;
      e.fly = 1;
      const up = e.flyT > 2 ? 1 : -1;
      e.y = Math.max(w.heightAt(e.x, e.z), e.baseY0 ?? -1e9) + clamp((e.flyH0 || 0) + up * dt * 3, 0, cfg.flush ? 3 : 9);
      e.flyH0 = e.y - w.heightAt(e.x, e.z);
      e.x += Math.sin(e.heading) * dt * (cfg.flush ? 7 : 5); e.z += Math.cos(e.heading) * dt * (cfg.flush ? 7 : 5);
      if (!w.inside(e.x, e.z, 10)) e.heading += Math.PI;
      if (e.flyT <= 0) { e.fly = 0; e.flyH0 = 0; e.y = w.heightAt(e.x, e.z); if (w.heightAt(e.x, e.z) < w.waterLevel + 0.1 && cfg.oiseau && e.kind !== 'heron') { e.flyT = 2; } e.state = 'idle'; e.timer = 2; }
      e.phase += dt * 6;
      return true;
    }
    e.fly = 0;
    const alert = cfg.flee * (c.crouch ? 0.5 : 1) * (c.sprint ? 1.4 : 1);
    if (e.dist < alert) {
      e.flyT = cfg.flush ? 2.8 + Math.random() : 5 + Math.random() * 4; e.flyH0 = 0.2;
      e.heading = Math.atan2(e.x - c.px, e.z - c.pz) + (Math.random() - 0.5) * 0.8;
      sound.flutter && sound.flutter(cfg.flush ? 1 : 0.6, (e.x - c.px) * c.right[0] + (e.z - c.pz) * c.right[2]);
      if (cfg.call && Math.random() < 0.6) sound.animal(cfg.call, 0, 0.6);
      return true;
    }
    return false;
  },
  // hibou : perché la nuit dans un arbre, s'envole vers un autre ; invisible le jour
  owl(e, dt, w, c) {
    if (c.night < 0.45) { e.hidden = true; return; }
    e.hidden = false;
    if (!e.perch || e.relocate) {
      const trees = [];
      w.query(e.hx, e.hz, 36, (o) => { if (o && !o.gone && TREE_IDS.has(OBJ_TYPES[o.t].id) && (!e.perch || Math.hypot(o.x - e.perch.x, o.z - e.perch.z) > 4)) trees.push(o); }, null);
      const o = trees.length ? trees[(Math.random() * trees.length) | 0] : null;
      const tx = o ? o.x : e.hx + (Math.random() - 0.5) * 20, tz = o ? o.z : e.hz + (Math.random() - 0.5) * 20;
      const ty = (o ? w.objectY(o) + o.h * 0.55 : w.heightAt(tx, tz) + 4);
      if (!e.perch) { e.x = tx; e.z = tz; e.y = ty; }
      e.perch = { x: tx, z: tz, y: ty }; e.relocate = false; e.flying = !!e.perchDone; e.perchDone = true;
    }
    const P = e.perch;
    if (e.flying) {
      const dx = P.x - e.x, dz = P.z - e.z, d = Math.hypot(dx, dz);
      e.heading = Math.atan2(dx, dz); e.fly = 1; e.phase += dt * 5;
      const sp = Math.min(d, dt * 7);
      e.x += dx / (d || 1) * sp; e.z += dz / (d || 1) * sp; e.y = lerp(e.y, P.y + Math.min(4, d * 0.3), Math.min(1, dt * 2));
      if (d < 0.3) { e.flying = false; e.y = P.y; }
      return;
    }
    e.fly = 0;
    if (e.dist < e.cfg.flee * (c.crouch ? 0.5 : 1)) { e.relocate = true; sound.flutter && sound.flutter(0.5, 0); return; }
    e.hootT = (e.hootT ?? 10 + Math.random() * 30) - dt;
    if (e.hootT <= 0 && e.dist < 60) { e.hootT = 25 + Math.random() * 40; sound.owl && sound.owl(); }
    e.lookY = clamp(angDiff(e.heading, Math.atan2(c.px - e.x, c.pz - e.z)), -1.4, 1.4);
  },
  // chauves-souris : la nuit, en cercles serrés ; dans les grottes, tout le temps
  bat(e, dt, w, c) {
    const cave = e.cave;
    e.hidden = !cave && (c.night < 0.5 || c.rain > 0.6);
    if (e.hidden) return;
    e.fly = 1;
    e.flyA += (e.flyS || 1.4) * dt * (cave ? 1.6 : 1.2);
    const R = cave ? cave.r : 6 + Math.sin(c.t * 0.3 + e.seed) * 3;
    const cx = cave ? cave.x : e.hx + Math.sin(c.t * 0.07 + e.seed) * 12, cz = cave ? cave.z : e.hz + Math.cos(c.t * 0.06 + e.seed) * 12;
    const nx = cx + Math.cos(e.flyA) * R + Math.sin(c.t * 3.1 + e.seed) * 0.6, nz = cz + Math.sin(e.flyA) * R + Math.cos(c.t * 2.7 + e.seed) * 0.6;
    e.heading = Math.atan2(nx - e.x, nz - e.z); e.x = nx; e.z = nz;
    e.y = cave ? cave.y + 1.4 + Math.sin(c.t * 2 + e.seed) * 0.6 : Math.max(w.heightAt(e.x, e.z), w.waterLevel) + 5 + Math.sin(c.t * 1.7 + e.seed) * 2;
    if (Math.random() < dt * 0.05 && Math.hypot(e.x - c.px, e.z - c.pz) < 20) sound.squeak && sound.squeak();
  },
  // vipère : mord si l'on passe trop près sans prudence
  snake(e, dt, w, c) {
    e.biteT = Math.max(0, (e.biteT || 0) - dt);
    e.raise = e.dist < 3;
    if (e.dist < e.cfg.bite && !c.crouch && e.biteT <= 0 && c.alive) {
      e.biteT = 3; sound.hiss && sound.hiss();
      c.hurt(7, e, 'Mordu par une vipère');
      if (!BUFF.on('antidote')) play.poisonT = Math.max(play.poisonT || 0, 45);
    } else if (e.dist < 4 && !e.hissT) { e.hissT = 1; sound.hiss && sound.hiss(); }
    if (e.dist > 6) e.hissT = 0;
  },
  // écureuil : file vers l'arbre le plus proche et y disparaît un moment
  squirrel(e, dt, w, c) {
    if (e.inTree > 0) { e.inTree -= dt; e.hidden = true; if (e.inTree <= 0) { e.hidden = false; e.state = 'idle'; } return true; }
    if (e.state === 'flee' && !e.treeT) {
      const oh = w.raycastObjects([e.x, e.y + 1, e.z], [Math.sin(e.fleeDir), 0, Math.cos(e.fleeDir)], 12, true);
      if (oh) { e.treeT = { x: oh.obj.x, z: oh.obj.z }; }
    }
    if (e.treeT) {
      const dx = e.treeT.x - e.x, dz = e.treeT.z - e.z, d = Math.hypot(dx, dz);
      if (d < 0.6) { e.inTree = 12 + Math.random() * 10; e.treeT = null; sound.scratch && Math.random() < 0.5 && sound.scratch(); return true; }
      e.heading = Math.atan2(dx, dz); entities.stepMove(e, dt, w, e.cfg.run); e.move = 1; e.run = true; e.phase += dt * 20;
      return true;
    }
    return false;
  },
  // hérisson : se roule en boule
  hedgehog(e, dt, w, c) {
    if (e.dist < 3) { e.curled = 4; }
    if (e.curled > 0) { e.curled -= dt; e.move = 0; e.state = 'idle'; e.curledNow = true; return true; }
    e.curledNow = false;
    return false;
  },
  // marmotte : siffle et file au terrier
  marmot(e, dt, w, c) {
    if (e.burrow > 0) { e.burrow -= dt; e.hidden = true; if (e.burrow <= 0) e.hidden = false; return true; }
    if (e.dist < e.cfg.flee * (c.crouch ? 0.5 : 1)) { e.burrow = 15 + Math.random() * 10; sound.whistleMarmot && sound.whistleMarmot(); return true; }
    return false;
  },
  // la Bête : dort dans son antre ; le bruit ou l'approche la réveillent
  bete(e, dt, w, c) {
    e.attackT = Math.max(0, (e.attackT || 0) - dt);
    if (e.dead) return true;
    if (!e.awake) {
      e.move = 0; e.state = 'sheltered';
      e.wakeK = (e.wakeK || 0) + dt * ((e.dist < 5 && !c.crouch) ? 1 : (c.sprint && e.dist < 14) ? 1.5 : e.dist < 2.5 ? 0.6 : -0.3);
      e.wakeK = Math.max(0, e.wakeK);
      if (e.wakeK > 1.2 || e.hurtT > 0) { e.awake = true; e.state = 'charge'; sound.growl && sound.growl(1); game.shakeT = 0.6; }
      if (Math.random() < dt * 0.3 && e.dist < 20) sound.breath && sound.breath(0.6);
      return true;
    }
    e.state = 'charge';
    const tx = c.px, tz = c.pz;
    e.heading = turnToward(e.heading, Math.atan2(tx - e.x, tz - e.z), dt * 3.5);
    if (e.dist > 2.0) { entities.stepMove(e, dt, w, e.cfg.run); e.move = 1; e.run = true; e.phase += dt * 8; }
    else if (e.attackT <= 0 && c.alive) { e.attackT = 1.8; c.hurt(e.cfg.dmg, e, 'Déchiré par la Bête des Combes'); sound.growl && sound.growl(1); }
    if (Math.random() < dt * 0.4) sound.growl && sound.growl(0.7);
    return true;
  },
};
const _updateWalker = entities.updateWalker.bind(entities);
entities.updateWalker = function (e, dt, w, c) {
  const cfg = e.cfg;
  if (cfg.perch) { beasts.owl(e, dt, w, c); return; }
  if (cfg.boss && beasts.bete(e, dt, w, c)) return;
  if (cfg.nuit && c.night < 0.35 && e.dist > 30 && !e.owner) { e.hidden = true; return; }
  if (cfg.oiseau && beasts.groundBird(e, dt, w, c)) return;
  if (cfg.arbre && beasts.squirrel(e, dt, w, c)) return;
  if (cfg.curl && beasts.hedgehog(e, dt, w, c)) return;
  if (cfg.terrier && beasts.marmot(e, dt, w, c)) return;
  if (cfg.bite) beasts.snake(e, dt, w, c);
  _updateWalker(e, dt, w, c);
};
const _updateBird = entities.updateBird.bind(entities);
entities.updateBird = function (e, dt, w, c) { if (e.cfg.nightFly) return beasts.bat(e, dt, w, c); _updateBird(e, dt, w, c); };
// ---------------------------------------------------------------- branchements sur la ferme (installés au premier chargement)
let beastHooksOn = false;
function installBeastHooks() {
  if (beastHooksOn) return;
  beastHooksOn = true;
  // l'oie monte la garde comme le chien
  const _dogAlarm = game.dogAlarm.bind(game);
  game.dogAlarm = function (src) {
    _dogAlarm(src);
    for (const e of entities.list) if (e.kind === 'goose' && e.owner && Math.hypot(e.x - src.x, e.z - src.z) < 40 && !(e.honkT > 0)) { e.honkT = 2 + Math.random() * 2; sound.animal('goose', 0, 1); e.heading = Math.atan2(src.x - e.x, src.z - e.z); }
  };

  // ---------------------------------------------------------------- venin : la vie s'en va doucement
  play.poisonT = 0;
  HOOKS.update.push((dt, eye, basis, sky, playing) => {
    if (!(play.poisonT > 0) || !playing) return;
    if (BUFF.on('antidote')) { play.poisonT = 0; return; }
    play.poisonT -= dt;
    const p = game.player;
    p.hp -= dt * 0.35;
    play.nausea = Math.max(play.nausea || 0, play.poisonT > 35 ? 1.2 : 0.4);
    if (p.hp <= 0) game.die('Empoisonné par une vipère');
  });

  // ---------------------------------------------------------------- bêtes de la ferme en plus : production, soins
  const FARM_SMALL = new Set(['hen', 'goose', 'farmduck', 'farmrabbit']);
  const _tick = farm.tick.bind(farm);
  farm.tick = function (dtH, ctx) {
    _tick(dtH, ctx);
    const s = this.s;
    for (const a of s.animals) {
      if (a.dead || !['goat', 'goose', 'farmduck', 'farmrabbit'].includes(a.kind)) continue;
      const fedK = a.fedUntil > s.hours ? 1.5 : this.raining ? 0.6 : 1;
      a.prodT = (a.prodT || 0) + dtH * fedK;
      const P = { goat: 12, goose: 24, farmduck: 20, farmrabbit: 36 }[a.kind];
      if (a.prodT < P) continue;
      a.prodT = 0;
      if (a.kind === 'goat') a.milk = Math.min(2, (a.milk || 0) + 1);
      if (a.kind === 'goose' || a.kind === 'farmduck') a.egg = Math.min(2, (a.egg || 0) + 1);
      if (a.kind === 'farmrabbit') a.wool = Math.min(1, (a.wool || 0) + 1);
    }
  };
  const _useAnimal = game.useAnimal.bind(game);
  game.useAnimal = function (e) {
    const s = farm.s, a = s.animals.find((q) => q.id === e.aid), hand = s.hand;
    if (e.kind === 'donkey' && e.owner) return this.mount(e);
    if (a && a.kind === 'goat' && a.milk && hand === 'seau') { a.milk = 0; farm.give('lait_chevre', 1); play.flyer('lait_chevre', [e.x, e.y + 0.6, e.z], 1); sound.pour(); return; }
    if (a && (a.kind === 'goose' || a.kind === 'farmduck') && a.egg) { const it = a.kind === 'goose' ? 'oeuf_oie' : 'oeuf_cane'; farm.give(it, a.egg); play.flyer(it, [e.x, e.y + 0.3, e.z], a.egg); a.egg = 0; sound.pop(); return; }
    if (a && a.kind === 'farmrabbit' && (a.wool || 0) >= 1 && (hand === 'cisailles' || hand === 'main')) { a.wool = 0; farm.give('poil_lapin', 1); play.flyer('poil_lapin', [e.x, e.y + 0.3, e.z], 1); sound.scythe && sound.scythe(); return; }
    if (!a && e.cfg.wild && !e.cfg.charge) { sound.animal(e.cfg.call || 'hen', 0, 0.4); return; }
    return _useAnimal(e);
  };
  // les petites bêtes dorment au poulailler, les autres à la grange
  const _syncAnimals = game.syncAnimals.bind(game);
  game.syncAnimals = function () {
    _syncAnimals();
    const w = this.world;
    if (!w || !w.farm || !w.farm.coop) return;
    const coop = w.farm.coop;
    for (const e of entities.extra) {
      if (!e.owner || !FARM_SMALL.has(e.kind) || e.kind === 'hen' || e.coopSet) continue;
      e.coopSet = true;
      e.shelter = { x: coop.x, z: coop.z }; e.hx = coop.x; e.hz = coop.z - 4;
      if (e.kind === 'donkey') { const sd = e.rig.part('saddle'); if (sd) sd.hide = false; }
    }
    for (const e of entities.extra) if (e.owner && e.kind === 'donkey' && !e.saddled) { e.saddled = true; const sd = e.rig.part('saddle'); if (sd) sd.hide = false; const bl = e.rig.part('blanketS'); if (bl) bl.hide = false; }
  };
  // à dos d'âne, on va moins vite qu'à cheval
  HOOKS.update.push(() => { const p = game.player; if (p.riding && p.riding.kind === 'donkey') p.mods.speed *= 0.72; });

}
HOOKS.load.unshift(() => { if (!beastHooksOn) { installBeastHooks(); game.syncAnimals(); } });
HOOKS.update.push((dt) => { for (const e of entities.list) if (e.honkT > 0) e.honkT -= dt; });

// ---------------------------------------------------------------- petites vies : papillons, lucioles, libellules, abeilles
HOOKS.update.push((dt, eye, basis, sky, playing) => {
  const w = game.world, p = game.player, R = Math.random;
  if (!playing || p.underground || strange.inEnvers() || strange.redNight()) return;
  const b = game.biomeAt(p.pos), rain = weather.cur.rain > 0.3;
  const around = (r) => { const a = R() * TAU, d = 2 + R() * r; return [eye[0] + Math.cos(a) * d, eye[2] + Math.sin(a) * d]; };
  // papillons : le jour, dans les prés fleuris
  if (sky.day > 0.6 && !rain && (b === 'plaine' || b === 'ferme' || b === 'lande') && R() < dt * 0.8) {
    const [x, z] = around(12), y = w.heightAt(x, z) + 0.5 + R() * 1.2;
    const cols = [[1, 0.95, 0.4, 1], [1, 1, 1, 1], [0.95, 0.55, 0.2, 1], [0.55, 0.65, 1, 1]];
    for (let k = 0; k < 2; k++) { particles.spawn(x + k * 0.05, y, z, (R() - 0.5) * 0.8, (R() - 0.3) * 0.4, (R() - 0.5) * 0.8, cols[(R() * 4) | 0], 0.045, 6 + R() * 4, -0.02, false); const q = particles.list[particles.list.length - 1]; q.flutter = 1; }
  }
  // lucioles : la nuit, au-dessus des herbes et du marais
  if (sky.night > 0.6 && !rain && (b === 'plaine' || b === 'marais' || b === 'ferme' || b === 'foret') && R() < dt * 2.5) {
    const [x, z] = around(18), y = Math.max(w.heightAt(x, z), w.waterLevel) + 0.4 + R() * 1.5;
    particles.spawn(x, y, z, (R() - 0.5) * 0.3, (R() - 0.5) * 0.15, (R() - 0.5) * 0.3, [0.75, 1.0, 0.35, 1], 0.03, 3 + R() * 3, 0, true);
    particles.list[particles.list.length - 1].blink = 1;
  }
  // libellules : le jour, au bord de l'eau
  if (sky.day > 0.6 && !rain && (b === 'lac' || b === 'marais') && R() < dt * 0.9) {
    const [x, z] = around(10), y = Math.max(w.heightAt(x, z), w.waterLevel) + 0.4 + R() * 0.8;
    particles.spawn(x, y, z, (R() - 0.5) * 3, 0, (R() - 0.5) * 3, [0.3, 0.55, 0.95, 1], 0.04, 2 + R() * 2, 0, false);
    particles.list[particles.list.length - 1].dart = 1;
  }
  // abeilles : autour des ruches
  game.beeT = (game.beeT || 0) - dt;
  if (game.beeT <= 0 && sky.day > 0.5 && !rain) {
    game.beeT = 0.25;
    for (const q of w.props) if (q.id === 'ruche' && !q.gone && Math.abs(q.x - eye[0]) < 25 && Math.abs(q.z - eye[2]) < 25) {
      particles.spawn(q.x + (R() - 0.5) * 1.2, q.y + 0.6 + R() * 0.8, q.z + (R() - 0.5) * 1.2, (R() - 0.5) * 1.5, (R() - 0.5) * 0.6, (R() - 0.5) * 1.5, [0.95, 0.8, 0.2, 1], 0.03, 1.5, 0, false);
      particles.list[particles.list.length - 1].dart = 1;
    }
  }
});
// mouvement propre de ces petites bêtes (battement d'ailes, clignotement, zigzags)
const _pUpdate = particles.update.bind(particles);
particles.update = function (dt, light) {
  for (const q of this.list) {
    if (q.flutter) { q.vy = Math.sin((q.life + q.x) * 9) * 0.6; if (Math.random() < dt * 1.5) { q.vx += (Math.random() - 0.5) * 1.2; q.vz += (Math.random() - 0.5) * 1.2; } q.vx *= 0.99; q.vz *= 0.99; }
    if (q.dart && Math.random() < dt * 2) { q.vx = (Math.random() - 0.5) * 4; q.vz = (Math.random() - 0.5) * 4; q.vy = (Math.random() - 0.5) * 0.6; }
    if (q.blink) q.col[3] = 0.25 + 0.75 * Math.max(0, Math.sin(q.life * 4 + q.x * 3));
  }
  _pUpdate(dt, light);
};
