// ============================================================================
//  LA PELLE : on creuse partout. Trous (qui se rebouchent), vers, silex, os,
//  sable au bord de l'eau, mandragore la nuit en forêt ; trésors enfouis
//  (légendes, cartes au trésor) ; grottes ensevelies qu'on dégage.
// ============================================================================
const dig = {
  // --------------------------------------------------------------- clic avec la pelle
  at(eye, f, held) {
    const w = game.world, s = farm.s;
    play.swingT = 0.32; play.cool = held ? 0.5 : 0.55;
    // 1) éboulis d'une grotte ensevelie
    const eb = (w.inter || []).find((it) => it.kind === 'eboulis' && !this.caveOpen(it.data.cave) && Math.hypot(it.x - eye[0], it.z - eye[2]) < 3.6 && this.facing(eye, f, it, 0.55));
    if (eb) return this.rubble(eb);
    const c = play.cellAt(eye, f);
    if (!c) { sound.impact && sound.impact('soft'); return; }
    // 2) un secret enfoui (légende), ou la croix d'une carte au trésor
    for (const q of w.secrets || []) {
      if (s.flags['secret_' + q.id]) continue;
      if (Math.hypot(q.x - c.x, q.z - c.z) < q.r) return this.secretDig(q, c);
    }
    for (const m of s.maps || []) {
      if (m.found || Math.hypot(m.x - c.x, m.z - c.z) > 2.6) continue;
      return this.mapDig(m, c);
    }
    // 3) terre remuée, coffres enterrés, caches (comme à la houe, en mieux)
    const d0 = (w.inter || []).find((it) => it.kind === 'dig' && !s.flags['dug_' + it.id] && Math.hypot(it.x - c.x, it.z - c.z) < 1.6 && (!it.data.envers || strange.inEnvers()));
    if (d0) { play.digUp(d0); if (Math.random() < 0.5) { const [[k, n]] = rollLoot('pelle'); if (k !== 'argent') { farm.give(k, n); play.flyer(k, [c.x, c.y + 0.4, c.z], n); } } return; }
    // 4) pas dans le champ ni dans la roche
    const cr = farm.crop(c.x, c.z), mat = w.matAt(c.x, c.z);
    if (cr) { ui.subtitle('', '(Pas dans la terre labourée : vous abîmeriez le champ.)', 2); sound.click(); return; }
    if (mat === M_ROCK || mat === M_COBBLE) { sound.shovelHit && sound.shovelHit(); play.cool = 0.6; return; }
    if (c.y < w.waterLevel - 0.1) { sound.splash(); return; }
    // 5) un trou
    if ((s.holes || []).some((h) => Math.hypot(h.x - c.x, h.z - c.z) < 0.9)) { sound.shovel && sound.shovel(0.5); return; }
    this.hole(c.x, c.z, true);
    sound.shovel && sound.shovel(1);
    puffAt(c.x, c.y + 0.1, c.z, [96, 68, 44], 10, 1.8, false);
    let got = null;
    const h = npcs.hour(), b = game.biomeAt([c.x, c.y, c.z]), night = h >= 21 || h < 4;
    if (mat === M_SAND) got = rollLoot('sable');
    else if (night && (b === 'foret' || b === 'bouleaux') && Math.random() < 0.05) { got = [['mandragore', 1]]; sound.scream2 && sound.scream2(); strange.glitchT = 0.3; }
    else if (Math.random() < 0.55) got = rollLoot('pelle');
    for (const [k, n] of got || []) { if (k === 'argent') { farm.earn(n); continue; } farm.give(k, n); play.flyer(k, [c.x, c.y + 0.4, c.z], n); }
    s.stats.holes = (s.stats.holes || 0) + 1;
  },
  facing(eye, f, it, k) { const dx = it.x - eye[0], dz = it.z - eye[2], d = Math.hypot(dx, dz) || 1; return (dx * f[0] + dz * f[2]) / d > k; },
  // trou : un objet posé qui disparaît à l'aube
  hole(x, z, save) {
    const w = game.world, s = farm.s;
    s.holes = s.holes || [];
    if (save) s.holes.push({ x: Math.round(x * 10) / 10, z: Math.round(z * 10) / 10, day: s.day });
    w.props.push({ id: 'trou', x, y: w.heightAt(x, z) + 0.01, z, r: (x * 13) % TAU, hole: true });
    farm.dirtyProps = true;
  },
  // --------------------------------------------------------------- secrets enfouis (Valmont, les noyés…)
  secretDig(q, c) {
    const s = farm.s, k = 'secretp_' + q.id;
    s.flags[k] = (s.flags[k] || 0) + 1;
    sound.shovel && sound.shovel(1); puffAt(c.x, c.y + 0.1, c.z, [96, 68, 44], 14, 2.2, false);
    if (s.flags[k] < (q.depth || 3)) { if (s.flags[k] === 1) ui.subtitle('', '(La pelle bute sur quelque chose de dur. Du bois ?)', 2.5); return; }
    s.flags['secret_' + q.id] = s.day;
    this.chestAt(q.x, q.z, false);
    for (const [it, n] of rollLoot(q.loot)) { if (it === 'argent') { farm.earn(n); continue; } farm.give(it, n); play.flyer(it, [q.x, c.y + 0.6, q.z], n); }
    if (q.relic && !farm.count(q.relic) && !s.flags['got_' + q.relic]) { s.flags['got_' + q.relic] = 1; farm.give(q.relic, 1); play.flyer(q.relic, [q.x, c.y + 0.8, q.z], 1); }
    sound.lootOpen && sound.lootOpen(); sound.coin && sound.coin();
    if (q.myth && typeof myths !== 'undefined') myths.found(q.myth);
  },
  chestAt(x, z, vide) { const w = game.world; w.props.push({ id: 'coffre_tresor', x, y: w.heightAt(x, z) - 0.15, z, r: (x * 7) % TAU, data: { vide }, hole: true }); farm.dirtyProps = true; },
  // --------------------------------------------------------------- cartes au trésor
  newMap() {
    const w = game.world, s = farm.s, F = w.farm.f;
    s.maps = s.maps || [];
    for (let k = 0; k < 400; k++) {
      const a = Math.random() * TAU, d = 150 + Math.random() * 650, x = F.x + Math.cos(a) * d, z = F.z + Math.sin(a) * d;
      if (!w.inside(x, z, 40) || w.heightAt(x, z) < w.waterLevel + 0.8 || w.matAt(x, z) === M_ROCK || !pointFree(w, x, z, 2)) continue;
      if (Object.values(w.bld).some((b) => Math.hypot(b.x - x, b.z - z) < 30)) continue;
      const m = { id: 'carte' + s.maps.length, x: Math.round(x), z: Math.round(z), found: false };
      s.maps.push(m);
      return m;
    }
    return null;
  },
  mapDig(m, c) {
    const s = farm.s, k = 'mapp_' + m.id;
    s.flags[k] = (s.flags[k] || 0) + 1;
    sound.shovel && sound.shovel(1); puffAt(c.x, c.y + 0.1, c.z, [96, 68, 44], 12, 2, false);
    if (s.flags[k] < 3) return;
    m.found = true;
    farm.take('carte_tresor', 1);
    this.chestAt(m.x, m.z, true);
    for (const [it, n] of rollLoot('tresor_carte')) { if (it === 'argent') { farm.earn(n); continue; } farm.give(it, n); play.flyer(it, [m.x, c.y + 0.6, m.z], n); }
    sound.lootOpen && sound.lootOpen(); sound.coin && sound.coin();
    ui.subtitle('', '(La croix ne mentait pas.)', 2.5);
    s.stats.treasures = (s.stats.treasures || 0) + 1;
  },
  // --------------------------------------------------------------- grottes ensevelies
  caveOpen(id) { return !!farm.s.flags['grotte_' + id]; },
  rubble(it) {
    const s = farm.s, w = game.world, id = it.data.cave, k = 'eboulisp_' + id;
    s.flags[k] = (s.flags[k] || 0) + 1;
    const q = w.props[it.data.prop];
    if (q) farm.setPropData(q, { p: s.flags[k] });
    sound.shovel && sound.shovel(1.2); puffAt(it.x, it.y, it.z, [120, 110, 100], 16, 2.5, false);
    if (s.flags[k] === 1) ui.subtitle('', '(Un courant d’air froid passe entre les pierres.)', 2.5);
    if (s.flags[k] >= 6) this.openCave(id, true);
  },
  openCave(id, fresh) {
    const s = farm.s, w = game.world, C = w.caves && w.caves[id];
    if (!C) return;
    s.flags['grotte_' + id] = s.flags['grotte_' + id] || s.day;
    const q = w.props[C.prop];
    if (q && q.id === 'eboulis') { q.data = Object.assign({}, q.data, { p: 6 }); removePropCollider(w, q); }
    if (!w.props.some((p) => p.caveMouth === id)) w.props.push({ id: 'entree_grotte', x: C.x, y: C.y - 0.1, z: C.z, r: C.r, caveMouth: id });
    farm.dirtyProps = true; w.grid = null;
    if (fresh) { sound.rumble && sound.rumble(); game.shakeT = 0.8; s.stats.caves = (s.stats.caves || 0) + 1; }
  },
  // --------------------------------------------------------------- restauration au chargement
  restore() {
    const w = game.world, s = farm.s;
    s.holes = (s.holes || []).filter((h) => h.day === s.day);
    for (const h of s.holes) this.hole(h.x, h.z, false);
    for (const q of w.secrets || []) if (s.flags['secret_' + q.id]) this.chestAt(q.x, q.z, true);
    for (const m of s.maps || []) if (m.found) this.chestAt(m.x, m.z, true);
    for (const id in w.caves || {}) if (this.caveOpen(id)) this.openCave(id, false); else { const C = w.caves[id], q = w.props[C.prop]; if (q && s.flags['eboulisp_' + id]) q.data = Object.assign({}, q.data, { p: s.flags['eboulisp_' + id] }); }
    this.spawnCaveLife();
  },
  // chauves-souris de la grotte aux cristaux, la Bête dans son antre
  spawnCaveLife() {
    const w = game.world, s = farm.s;
    const C = w.caves && w.caves.grotte_cristaux;
    if (C && !entities.extra.some((e) => e.cave)) for (let k = 0; k < 6; k++) {
      const R = C.room, e = entities.add(w, 'bat', R.x, R.z, { v: 0 });
      Object.assign(e, { cave: { x: R.x, z: R.z, y: R.y, r: 3 + Math.random() * 3 }, flyA: Math.random() * TAU, flyS: 1.2 + Math.random(), y: R.y + 1.5, baseY: R.y });
    }
    const L = w.beteLair;
    if (L && !s.flags.beteDead && !entities.extra.some((e) => e.kind === 'bete')) {
      const e = entities.add(w, 'bete', L.x, L.z, { v: 0 });
      e.y = L.y; e.under = true; e.hx = L.x; e.hz = L.z; e.heading = Math.random() * TAU; e.state = 'sheltered';
    }
  },
};

// les créatures souterraines restent sur le sol de leur salle
const _groundY = entities.groundY.bind(entities);
entities.groundY = function (w, e, x, z) { if (e.under) return w.groundAt(x, z, e.y + 0.6, 0.6); return _groundY(w, e, x, z); };

// ---------------------------------------------------------------- accroches
HOOKS.primary.push((eye, basis, held, it, id) => {
  if (!it) return false;
  if (it.tool === 'pelle') { dig.at(eye, basis.f, held); return true; }
  if (it.use === 'tresor') { if (!held) signs.treasureMap(); play.cool = 0.5; return true; }
  if (it.use === 'carte') { if (!held) signs.valleyMap(); play.cool = 0.5; return true; }
  return false;
});
// la pelle creuse aussi la terre remuée ; la houe reste valable
HOOKS.interPre.dig = (it) => { if (farm.bestTool('pelle')) { play.digUp(it); return true; } return false; };
HOOKS.inter.eboulis = (it) => {
  if (dig.caveOpen(it.data.cave)) return;
  ui.subtitle('', farm.bestTool('pelle') ? '(Un courant d’air froid sort des pierres.)' : '(Un courant d’air froid sort des pierres. Il faudrait une pelle.)', 3);
};
HOOKS.interVis.eboulis = (it) => !dig.caveOpen(it.data.cave);
HOOKS.interVis.cave = (it) => dig.caveOpen(it.data.cave);
HOOKS.inter.cave = (it) => {
  const id = it.data.cave;
  const txt = { grotte_cristaux: 'Tout au fond, quelque chose luit.', antre: 'L’odeur vous prend à la gorge : une bête, vieille, énorme.', grotte_contrebandiers: 'Des marches taillées, une corde usée, des caisses empilées.', grotte_peinte: 'La lanterne tremble sur des murs couverts de figures rouges.' }[id] || 'Vous descendez sous la terre.';
  farm.s.flags['vu_' + id] = 1;
  game.teleport(it.data.to, txt);
  if (id === 'grotte_cristaux' && typeof LORE_TEXT !== 'undefined') setTimeout(() => ui.subtitle('', LORE_TEXT.grotte_cristaux || '', 5), 1400);
  if (id === 'antre' && typeof LORE_TEXT !== 'undefined' && LORE_TEXT.antre) setTimeout(() => ui.subtitle('', LORE_TEXT.antre.entree || '', 5), 1400);
};
// cueillettes souterraines qui repoussent
HOOKS.interVis.forage = (it) => { const t = farm.s.flags['forage_' + it.id]; return !t || farm.s.day - t >= (it.data.every || 2); };
HOOKS.inter.forage = (it) => { farm.s.flags['forage_' + it.id] = farm.s.day; farm.give(it.data.item, 1); play.flyer(it.data.item, [it.x, it.y, it.z], 1); sound.pop(); };
// fleurs de lune : la nuit seulement
HOOKS.interVis.moonflower = (it) => { const h = npcs.hour(), t = farm.s.flags['lune_' + it.id]; return (h > 20 || h < 5) && (!t || farm.s.day - t >= 3); };
HOOKS.inter.moonflower = (it) => { farm.s.flags['lune_' + it.id] = farm.s.day; farm.give('fleur_lune', 1); play.flyer('fleur_lune', [it.x, it.y, it.z], 1); sound.pop(); };
// une carte au trésor trouvée = une croix quelque part
HOOKS.load.push(() => {
  const s = farm.s;
  s.maps = s.maps || []; s.holes = s.holes || [];
  if (!s.flags.pelleDonnee) { // la pelle d'Anselme, retrouvée pour les parties déjà commencées aussi
    s.flags.pelleDonnee = 1;
    if (!farm.bestTool('pelle')) farm.give('pelle', 1);
    if (s.day > 1) farm.mail('Maître Delorme, notaire', 'Un outil oublié', 'Madame, Monsieur,\n\nEn achevant l’inventaire de la succession Varenne, mon clerc a retrouvé dans la remise une pelle portant les initiales d’Anselme. Je vous la fais porter : elle vous revient de droit.\n\nVotre dévoué,\nDelorme');
  }
  dig.restore();
});
HOOKS.day.push(() => {
  const w = game.world, s = farm.s;
  s.holes = [];
  w.props = w.props.filter((q) => !(q.hole && q.id === 'trou'));
  farm.dirtyProps = true;
  dig.spawnCaveLife();
});
{
  const _give = farm.give.bind(farm);
  farm.give = function (id, n = 1) {
    _give(id, n);
    if (id === 'carte_tresor' && n > 0 && game.world && this.s) {
      const unfound = (this.s.maps || []).filter((m) => !m.found).length;
      for (let k = unfound; k < this.count('carte_tresor'); k++) dig.newMap();
    }
  };
}
// la Bête tuée : on ne la reverra plus
HOOKS.update.push(() => {
  const s = farm.s;
  if (s.flags.beteDead) return;
  const e = entities.extra.find((q) => q.kind === 'bete');
  if (e && e.dead) { s.flags.beteDead = s.day; sound.scream && sound.scream(0.5); if (typeof myths !== 'undefined') myths.found('bete_des_combes'); }
});
DYN_PROPS.add('fleur_lune'); DYN_PROPS.add('champi_fees'); DYN_PROPS.add('relique_sol'); DYN_PROPS.add('alambic'); DYN_PROPS.add('eboulis');
