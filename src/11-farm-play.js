// ============================================================================
//  FERME : actions du joueur (outils, cultures, pêche, arc, cheval, objets
//  posés, repas, fabrication), santé et faim, rendu des objets 3D
// ============================================================================

CROPS.pommier = { name: 'Pommier', h: 24, regrow: 8, yield: [2, 4], frost: false, col: '#c82828', tree: true, fruit: 'pomme' };
const HAND_GROUPS = [
  ['main'],
  ['hache_acier', 'hache_fer', 'hache_cuivre', 'hache_pierre'],
  ['pioche_acier', 'pioche_fer', 'pioche_cuivre', 'pioche_pierre'],
  ['houe_fer', 'houe', 'arrosoir_fer', 'arrosoir_cuivre', 'arrosoir', 'faux', 'fourche', 'marteau', 'cisailles', 'seau'],
  ['canne_fer', 'canne', 'arc_long', 'arc'],
  null, // graines
  null, // objets à poser
  null, // nourriture
  ['lanterne', 'montre', 'boussole', 'miroir_poche'],
];
const TOOL_DMG = { main: 4, hache: [14, 20, 28, 38], pioche: [10, 15, 22, 30], houe: 8, faux: 16, fourche: 24, marteau: 9, canne: 2, arc: 2, cisailles: 5, seau: 3, arrosoir: 3, miroir: 2 };
// Le corps au rythme des journées : valeurs par journée de jeu (24 h), mesurées par tools/equilibrage/survie.js.
// Trois repas par jour (≈ 70 de faim, nuit comprise) ; la vie remonte de 60 par journée debout et deux fois plus
// vite en dormant ; le ventre vide, elle s'en va en une demi-journée (ni d'un coup, ni sans conséquence).
const CORPS_JOUR = {
  faim: 70, faimCourse: 110, // la faim, debout : en marchant, en courant
  faimNuit: 54,              // en dormant : 2,25 par heure (18 pour une nuit de huit heures)
  soin: 60,                  // la vie qui remonte debout, le ventre plein (faim > 25) : 2,5 PV par heure
  soinNuit: 120,             // en dormant, tant qu'il reste à manger : 5 PV par heure (40 pour une nuit)
  famine: 200,               // le ventre vide : 100 PV en 12 heures, debout comme endormi
};

const play = {
  swingT: 0, swingHit: false, cool: 0, fish: null, bow: 0, arrows: [], flyers: [], ghost: null, rotY: 0, eatT: 0,
  hurtFlash: 0, heartT: 0, breathT: 0, faintT: 0, lastHurtBy: '', drops: [], propBuf: new InstBuf(4096), dynBuf: new InstBuf(4096), shadowBuf: new InstBuf(512),
  propCenter: null, propNight: -1, vm: { id: '', frame: -1 }, targetInfo: null, hitCD: 0,

  reset() { this.fish = null; this.bow = 0; this.arrows = []; this.flyers = []; this.ghost = null; this.swingT = 0; this.propCenter = null; farm.dirtyProps = true; },
  get hand() { return farm.s.hand; },
  item() { return ITEMS[farm.s.hand] || null; },

  // ------------------------------------------------------------- objet en main
  groupItems(g) {
    const inv = farm.s.inv;
    if (g === 0) return ['main'];
    if (g === 5) return Object.keys(inv).filter((k) => ITEMS[k] && (ITEMS[k].crop || ITEMS[k].fert));
    if (g === 6) return Object.keys(inv).filter((k) => ITEMS[k] && (ITEMS[k].place || k === 'jeune_pommier'));
    if (g === 7) return Object.keys(inv).filter((k) => ITEMS[k] && (((ITEMS[k].food || ITEMS[k].heal) && ITEMS[k].cat !== 'graine') || ITEMS[k].open));
    const L = HAND_GROUPS[g] || [];
    if (g === 1 || g === 2) { const b = farm.bestTool(g === 1 ? 'hache' : 'pioche'); return b ? [b, ...L.filter((k) => k !== b && inv[k])] : []; }
    return L.filter((k) => inv[k]);
  },
  allHands() { const out = []; for (let g = 0; g < 9; g++) for (const k of this.groupItems(g)) if (!out.includes(k)) out.push(k); return out; },
  select(id) {
    if (id !== 'main' && !farm.count(id)) return;
    if (farm.s.hand === id) return;
    farm.s.hand = id; this.fishCancel(); this.bow = 0; this.swingT = 0;
    sound.equip && sound.equip();
  },
  group(g) {
    const L = this.groupItems(g);
    if (!L.length) { sound.click(); return; }
    const i = L.indexOf(farm.s.hand);
    this.select(L[(i + 1) % L.length] || L[0]);
  },
  cycle(d) {
    const L = this.allHands(), i = L.indexOf(farm.s.hand);
    this.select(L[((i < 0 ? 0 : i) + d + L.length) % L.length]);
  },

  // ------------------------------------------------------------- visée
  ray(eye, f, dist) {
    const w = game.world;
    let best = null;
    const th = w.raycastTerrain(eye, f, dist);
    if (th) best = { t: th.t, kind: 'terrain', p: [th.x, th.y, th.z] };
    const bh = w.raycastBlocks(eye, f, best ? best.t : dist);
    if (bh && (!best || bh.t < best.t)) best = { t: bh.t, kind: 'block', b: bh.block, n: bh.n, p: [eye[0] + f[0] * bh.t, eye[1] + f[1] * bh.t, eye[2] + f[2] * bh.t] };
    const oh = w.raycastObjects(eye, f, best ? best.t : dist, true);
    if (oh && (!best || oh.t < best.t)) best = { t: oh.t, kind: 'object', o: oh.obj, idx: oh.idx, p: [oh.x, oh.y, oh.z] };
    const eh = entities.raycast(eye, f, best ? best.t : dist);
    if (eh && (!best || eh.t < best.t)) best = { t: eh.t, kind: 'creature', e: eh.e, p: eh.p };
    const nh = npcs.raycast(eye, f, best ? best.t : dist);
    if (nh && (!best || nh.t < best.t)) best = { t: nh.t, kind: 'npc', n: nh.n, p: nh.p };
    const sh = strange.raycast(eye, f, best ? best.t : dist);
    if (sh && (!best || sh.t < best.t)) best = { t: sh.t, kind: 'strange', s: sh.s, p: sh.p };
    return best;
  },
  // Case de culture visée (sol devant soi)
  cellAt(eye, f) {
    const w = game.world;
    const th = w.raycastTerrain(eye, f, 4.2);
    if (!th) return null;
    const bh = w.raycastBlocks(eye, f, th.t);
    if (bh && !bh.block.hidden) return null;
    return { x: Math.floor(th.x) + 0.5, z: Math.floor(th.z) + 0.5, y: th.y, t: th.t };
  },

  // ------------------------------------------------------------- clic gauche
  // held : bouton maintenu (on sème, arrose, laboure et récolte en balayant le champ)
  primary(eye, basis, held) {
    const it = this.item(), id = farm.s.hand;
    if (this.cool > 0) return;
    for (const fn of HOOKS.primary) if (fn(eye, basis, held, it, id)) return;
    if (id === 'canne' || (it && it.tool === 'canne')) { if (!held) this.fishClick(eye, basis.f); return; }
    if (it && it.tool === 'arc') return; // géré par maintien / relâchement
    if (it && it.place) { if (!held || (PLACEABLES[it.place] && PLACEABLES[it.place].snap)) this.place(held); return; }
    if (it && it.crop) { this.plantAt(eye, basis.f); return; }
    if (it && it.fert) { this.fertAt(eye, basis.f); return; }
    if (it && it.open) { if (!held) this.openItem(id); return; }
    if (it && (it.food || it.heal) && !it.tool) { if (!held) this.eat(id); return; }
    if (it && it.tool === 'arrosoir') { this.waterAt(eye, basis.f, held); return; }
    if (it && it.tool === 'houe') { this.hoeAt(eye, basis.f, held); return; }
    if (id === 'lanterne') { if (!held) game.toggleLantern(); return; }
    if (it && it.tool === 'miroir') { if (!held) { if (strange.inEnvers()) game.leaveEnvers(); else { sound.click(); ui.subtitle('', '(Le miroir ne montre que vous. Pour l’instant.)', 2.5); } } return; }
    if (id === 'montre' || id === 'boussole') return;
    // mains nues sur une culture mûre : on récolte (en continu si l'on reste sur le clic)
    if (id === 'main') { const c = this.cellAt(eye, basis.f); const cr = c && farm.crop(c.x, c.z); if (cr && cr.c && farm.ripe(cr)) { this.harvestCrop(c.x, c.z, cr); this.cool = 0.12; return; } }
    if (held && id === 'main') return;
    this.swing(eye, basis);
  },
  // Cases visées : une seule, ou 3 × 3 avec un outil amélioré
  cellsAt(eye, f, area) {
    const c = this.cellAt(eye, f);
    if (!c) return [];
    if (!area) return [c];
    const out = [];
    for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) out.push({ x: c.x + dx, z: c.z + dz, y: game.world.heightAt(c.x + dx, c.z + dz), t: c.t });
    return out;
  },
  fertAt(eye, f) {
    const id = farm.s.hand, it = ITEMS[id];
    const c = this.cellAt(eye, f);
    this.cool = 0.15;
    if (!c || !farm.crop(c.x, c.z)) return;
    if (!farm.fertilize(c.x, c.z, it.fert)) return;
    farm.take(id, 1);
    sound.plant && sound.plant();
    puffAt(c.x, c.y + 0.1, c.z, [70, 55, 35], 6, 1, false);
  },
  // Coffre englouti, géode, sac de graines… : on l'ouvre en main
  openItem(id) {
    const it = ITEMS[id];
    if (!farm.take(id, 1)) return;
    const p = game.player, pos = [p.pos[0], p.pos[1] + 1.2, p.pos[2]];
    for (const [k, n] of rollLoot(it.open)) {
      if (k === 'argent') { farm.earn(n); sound.coin && sound.coin(); continue; }
      farm.give(k, n); this.flyer(k, pos, n);
    }
    this.cool = 0.5;
    sound.lootOpen && sound.lootOpen();
    if (it.open === 'geode') puffAt(pos[0], pos[1], pos[2], [150, 150, 170], 10, 2, true);
  },
  secondary(eye, basis) {
    const it = this.item();
    for (const fn of HOOKS.secondary) if (fn(eye, basis, it, farm.s.hand)) return;
    if (farm.s.hand === 'arc' && this.bow > 0) { this.bow = 0; sound.click(); return; }
    if (it && it.place) { this.rotY += Math.PI / 4; sound.click(); return; }
    if (it && (it.food || it.heal) && !it.tool) this.eat(farm.s.hand);
  },

  // Coup d'outil (hache, pioche, faux, marteau, poing…)
  swing(eye, basis) {
    const id = farm.s.hand, it = ITEMS[id], kind = it ? it.tool : 'main';
    this.swingT = 0.42; this.swingHit = false; this.cool = kind === 'faux' ? 0.5 : 0.48;
    this.pendingHit = { eye, f: basis.f, kind, tier: it && it.tier !== undefined ? it.tier : -1, id };
    sound.swish && sound.swish(kind === 'faux' ? 1.2 : 1);
  },
  resolveHit() {
    const h = this.pendingHit; this.pendingHit = null;
    if (!h) return;
    const w = game.world, { eye, f, kind, tier } = h;
    const reach = kind === 'faux' ? 3.0 : 2.7;
    const hit = this.ray(eye, f, reach);
    const dmgBase = (Array.isArray(TOOL_DMG[kind]) ? TOOL_DMG[kind][Math.max(0, tier)] : (TOOL_DMG[kind] || 4)) * (BUFF.on('force') ? 2 : 1);
    if (kind === 'faux') this.scythe(eye, f);
    if (!hit) return;
    const [x, y, z] = hit.p;
    if (hit.kind === 'creature') { this.hurtCreature(hit.e, dmgBase, eye); puffAt(x, y, z, [150, 30, 30], 6, 1.5, false); return; }
    if (hit.kind === 'npc') { npcs.hurt(hit.n, dmgBase, 'joueur'); puffAt(x, y, z, [150, 30, 30], 6, 1.5, false); return; }
    if (hit.kind === 'strange') { strange.hit(hit.s, dmgBase, eye); return; }
    if (hit.kind === 'object') {
      const t = OBJ_TYPES[hit.o.t], H = HARVEST[t.id];
      if (H && H.tool === kind && kind !== 'main') {
        if ((H.tier || 0) > tier) { sound.impact('hard'); puffAt(x, y, z, [200, 200, 200], 4, 1.5, true); this.clank = (this.clank || 0) + 1; return; }
        this.harvest(hit.o, hit.idx, H, kind === 'hache' ? [1, 1.5, 2.2, 3][tier] : [1, 1.6, 2.4, 3.2][tier], [x, y, z]);
        return;
      }
      const col = t.cat === 'Arbres' ? (y - w.objectY(hit.o) > 2.5 ? [70, 120, 50] : [90, 64, 40]) : [120, 120, 125];
      puffAt(x, y, z, col, 6, 1.8, t.id === 'rock'); sound.impact(t.id === 'rock' || t.id === 'vein' ? 'hard' : 'soft');
      if (t.id === 'giantoak' && kind === 'hache' && tier < 3) sound.impact('hard');
      return;
    }
    if (hit.kind === 'block') {
      const p = hit.b.prop ? null : null;
      if (kind === 'marteau') { const q = this.propAt(hit.p); if (q) { this.dismantle(q); return; } }
      puffAt(x + hit.n[0] * 0.05, y + hit.n[1] * 0.05, z + hit.n[2] * 0.05, MATERIALS[hit.b.m] ? MATERIALS[hit.b.m].avg : [150, 150, 150], 6, 2, true);
      sound.impact('hard');
      return;
    }
    if (hit.kind === 'terrain') { puffAt(x, y + 0.05, z, MATERIALS[w.matAt(x, z)].avg, 8, 2, false); sound.impact('soft'); }
  },
  harvest(o, idx, H, dmg, p) {
    const w = game.world, s = farm.s;
    const left = (s.objHp[idx] ?? H.hp) - dmg;
    const t = OBJ_TYPES[o.t];
    const tree = t.cat === 'Arbres';
    puffAt(p[0], p[1], p[2], tree ? [120, 90, 50] : [130, 130, 135], 8, 2, !tree);
    sound.impact(tree || t.id === 'stump' || t.id === 'bush' ? 'wood' : 'hard');
    if (left > 0) { s.objHp[idx] = left; if (tree) this.shakeT = 0.15; return; }
    delete s.objHp[idx];
    this.collect(o, idx, H, p);
    if (tree) { sound.treeFall && sound.treeFall(); }
    if (H.omen) strange.omen('chene');
  },
  // Récolte d'un objet du monde : butin + disparition (souche pour les arbres)
  collect(o, idx, H, p) {
    const w = game.world, s = farm.s;
    let drops = H.drop || [];
    if (H.veins) { const V = VEINS[o.v % VEINS.length]; if ((V.tier || 0) > this.toolTier('pioche')) { sound.impact('hard'); return false; } drops = [[V.item, V.n[0], V.n[1]], ['pierre', 1, 2]]; }
    for (const [item, a, b, pr] of drops) {
      if (pr !== undefined && Math.random() > pr) continue;
      const n = a + Math.floor(Math.random() * (b - a + 1));
      if (n > 0) { farm.give(item, n); this.flyer(item, p, n); }
    }
    if (H.regrow) { s.forage[idx] = s.hours; o.gone = true; }
    else { o.gone = true; s.removed[idx] = H.stump ? 'stump' : 1; if (H.stump) w.objects.push({ t: OBJ_INDEX.stump, x: o.x, z: o.z, h: 0.8, f: 0, v: 0, fromStump: idx }); }
    if (o.fromStump !== undefined) { s.removed[o.fromStump] = 1; const i = w.objects.indexOf(o); if (i >= 0) w.objects.splice(i, 1); }
    w.objectsDirty = true; w.shadeDirty = true; w.shadeRegion = [o.x - 12, o.z - 12, o.x + 12, o.z + 12]; w.grid = null;
    sound.pop();
    return true;
  },
  toolTier(kind) { const b = farm.bestTool(kind); return b ? ITEMS[b].tier : -1; },
  hurtCreature(e, dmg, eye) {
    const died = entities.damage(e, dmg, eye[0], eye[2]);
    sound.hurtAnimal && sound.hurtAnimal(e.kind);
    if (e.owner && !died) { const a = farm.s.animals.find((q) => q.id === e.aid); if (a) a.mood = Math.max(0, a.mood - 0.3); }
    if (!died) return;
    const P = PREY[e.kind];
    if (P) for (const [item, a, b, pr] of P.drop) { if (pr !== undefined && Math.random() > pr) continue; const n = a + Math.floor(Math.random() * (b - a + 1)); if (n > 0) { farm.give(item, n); this.flyer(item, [e.x, e.y + 0.5, e.z], n); } }
    if (e.owner) { const a = farm.s.animals.find((q) => q.id === e.aid); if (a) a.dead = true; farm.s.animals = farm.s.animals.filter((q) => !q.dead); game.syncAnimals(); }
    if (e.kind === 'dog') { farm.s.dog.alive = false; }
    entities.scare(e.x, e.z, 20);
  },
  // Faux : fauche l'herbe haute et le blé mûr dans un arc devant soi
  scythe(eye, f) {
    const w = game.world, s = farm.s;
    let n = 0;
    const fx = f[0], fz = f[2], fl = Math.hypot(fx, fz) || 1;
    w.forObjectsNearRay(eye, f, 3.2, (o, idx) => {
      if (!w.live(o)) return;
      const t = OBJ_TYPES[o.t];
      if (!['tallgrass', 'wheat', 'reeds', 'fern', 'heather'].includes(t.id)) return;
      const dx = o.x - eye[0], dz = o.z - eye[2], d = Math.hypot(dx, dz);
      if (d > 3.2 || (dx * fx + dz * fz) / (d * fl) < 0.45) return;
      const H = HARVEST[t.id];
      o.gone = true; n++;
      if (H && H.regrow) s.forage[idx] = s.hours; else s.removed[idx] = 1;
      farm.give(t.id === 'wheat' ? 'ble' : 'foin', 1);
      if (Math.random() < 0.3) farm.give('fibre', 1);
      if (Math.random() < 0.04) { farm.give('sac_graines', 1); this.flyer('sac_graines', [o.x, eye[1] - 0.8, o.z], 1); }
    });
    for (let a = -0.6; a <= 0.6; a += 0.3) for (let d = 1; d <= 2.6; d += 0.8) {
      const cx = eye[0] + (fx * Math.cos(a) - fz * Math.sin(a)) / fl * d, cz = eye[2] + (fz * Math.cos(a) + fx * Math.sin(a)) / fl * d;
      const c = farm.crop(cx, cz);
      if (c && c.c && !c.tree && farm.ripe(c)) { this.harvestCrop(Math.floor(cx) + 0.5, Math.floor(cz) + 0.5, c, true); n++; }
    }
    if (n) { w.objectsDirty = true; w.grid = null; sound.scythe && sound.scythe(); for (let k = 0; k < 10; k++) particles.spawn(eye[0] + fx / fl * 2, eye[1] - 1.2, eye[2] + fz / fl * 2, (Math.random() - 0.5) * 3, Math.random() * 2, (Math.random() - 0.5) * 3, [0.5, 0.7, 0.3, 1], 0.06, 0.8, 6, false); }
  },

  // ------------------------------------------------------------- cultures
  hoeAt(eye, f, held) {
    const area = (this.item() || {}).area;
    this.swingT = held ? 0.3 : 0.4; this.cool = held ? 0.22 : 0.4;
    const hit = this.ray(eye, f, 3.2);
    if (hit && hit.kind !== 'terrain' && hit.kind !== 'block') { if (!held) this.pendingHit = { eye, f, kind: 'houe', tier: 0, id: 'houe' }; return; }
    const c = this.cellAt(eye, f);
    if (!c) return;
    if (area) { // houe de fer : 3 × 3
      let n = 0;
      for (const q of this.cellsAt(eye, f, 1)) {
        const cr = farm.crop(q.x, q.z);
        if (cr && cr.dead) { delete farm.s.crops[farm.cellKey(q.x, q.z)]; }
        if (!farm.crop(q.x, q.z) && !interditDeBatir(q.x, q.z) && farm.canTill(q.x, q.z)) { farm.till(q.x, q.z); n++; }
      }
      if (n) { sound.dig && sound.dig(1); puffAt(c.x, c.y + 0.05, c.z, [96, 68, 44], 12, 2, false); }
      const dig0 = (game.world.inter || []).find((it) => it.kind === 'dig' && !farm.s.flags['dug_' + it.id] && Math.hypot(it.x - c.x, it.z - c.z) < 1.5 && (!it.data.envers || strange.inEnvers()));
      if (dig0) this.digUp(dig0);
      return;
    }
    // coffre enterré ?
    const dig = (game.world.inter || []).find((it) => it.kind === 'dig' && !farm.s.flags['dug_' + it.id] && Math.hypot(it.x - c.x, it.z - c.z) < 1.3 && (!it.data.envers || strange.inEnvers()));
    if (dig) { this.digUp(dig); return; }
    const cr = farm.crop(c.x, c.z);
    if (cr && cr.dead) { delete farm.s.crops[farm.cellKey(c.x, c.z)]; farm.till(c.x, c.z); farm.dirtyProps = true; sound.dig && sound.dig(); return; }
    if (cr) { sound.dig && sound.dig(0.5); return; }
    { const P = interditDeBatir(c.x, c.z); if (P) { sound.dig && sound.dig(0.4); if (!this.noTillT || performance.now() > this.noTillT) { this.noTillT = performance.now() + 4000; ui.subtitle('', '(On ne laboure pas ici : ' + (P.why || 'ce n’est pas à vous') + '.)', 2.5); } return; } }
    if (!farm.canTill(c.x, c.z)) { sound.impact('soft'); return; }
    farm.till(c.x, c.z);
    sound.dig && sound.dig(1);
    puffAt(c.x, c.y + 0.05, c.z, [96, 68, 44], 8, 1.6, false);
  },
  digUp(it) {
    const s = farm.s;
    if (!it.data.daily) s.flags['dug_' + it.id] = 1;
    sound.dig && sound.dig(1);
    const loot = it.data.loot;
    if (LOOT[loot]) { // points de fouille et caches : table de butin
      for (const [k, n] of rollLoot(loot)) { if (k === 'argent') { farm.earn(n); sound.coin && sound.coin(); } else { farm.give(k, n); this.flyer(k, [it.x, it.y, it.z], n); } }
      if (it.data.daily) { s.fouilles = s.fouilles.filter((f) => f.id !== it.id); const q = game.world.props.find((p) => p.fouille === it.id); if (q) { const i = game.world.props.indexOf(q); game.world.props.splice(i, 1); } game.world.inter.splice(game.world.inter.indexOf(it), 1); farm.dirtyProps = true; }
      puffAt(it.x, it.y, it.z, [96, 68, 44], 14, 2.5, false);
      return;
    }
    const table = { cercle: [['cle_crypte', 1]], tour: [['lingot_or', 1], ['gemme', 1]], ruines: [['argent', 220], ['figurine', 1]], phare: [['argent', 160], ['boussole', 1]], chene: [['lingot_or', 2]], cache: [['argent', 60 + ((Math.random() * 90) | 0)], ['graines_citrouille', 3]], cimetiere: [['bougie', 3], ['argent', 40]] };
    const L = table[loot] || [['argent', 80], [['gemme', 'lingot_fer', 'graines_fraise', 'miel'][(Math.random() * 4) | 0], 1]];
    for (const [id, n] of L) { if (id === 'argent') { farm.earn(n); sound.coin && sound.coin(); } else { farm.give(id, n); this.flyer(id, [it.x, it.y, it.z], n); } }
    const p = farm.propByKind('coffre_enterre', [it.x, it.z], 2);
    if (p) farm.removeProp(p);
    puffAt(it.x, it.y, it.z, [96, 68, 44], 14, 2.5, false);
  },
  plantAt(eye, f) {
    const id = farm.s.hand, it = ITEMS[id];
    this.cool = 0.08;
    let n = 0;
    for (const c of this.cellsAt(eye, f, farm.count('semoir') ? 1 : 0)) {
      const cr = farm.crop(c.x, c.z);
      if (!cr || cr.c) continue;
      if (!farm.take(id, 1)) break;
      farm.plant(c.x, c.z, it.crop);
      puffAt(c.x, c.y + 0.1, c.z, [110, 80, 50], 3, 1, false);
      n++;
    }
    if (n) { sound.plant && sound.plant(); this.cool = 0.14; }
  },
  canCap() { let it = this.item(); if (!it || it.tool !== 'arrosoir') it = ITEMS[farm.bestTool('arrosoir')]; return (it && it.cap) || 20; },
  waterAt(eye, f, held) {
    this.cool = held ? 0.1 : 0.25;
    const w = game.world, s = farm.s, it = this.item() || {};
    // remplir : viser l'eau ou un puits
    const th = w.raycastTerrain(eye, f, 5);
    if (th && th.y < w.waterLevel - 0.1) { if (!held || s.water < this.canCap()) { s.water = this.canCap(); sound.splash(); splashAt(th.x, w.waterLevel, th.z); } this.canTilt = 0.5; this.cool = 0.4; return; }
    if (s.water <= 0) { if (!held) sound.click(); this.canTilt = 0.2; return; }
    const cells = this.cellsAt(eye, f, it.area);
    if (!cells.length) return;
    let n = 0;
    for (const c of cells) if (farm.water(c.x, c.z)) { n++; for (let k = 0; k < 4; k++) particles.spawn(c.x + (Math.random() - 0.5) * 0.6, c.y + 0.6, c.z + (Math.random() - 0.5) * 0.6, 0, -2, 0, [0.6, 0.75, 0.95, 0.9], 0.05, 0.4, 6, false); }
    if (!n) return;
    this.canTilt = 0.5;
    sound.pour && sound.pour();
    s.water = Math.max(0, s.water - 1);
    this.cool = held ? 0.12 : 0.25;
  },
  harvestCrop(x, z, c, silent) {
    const C = CROPS[c.c];
    let n = C.yield[0] + Math.floor(Math.random() * (C.yield[1] - C.yield[0] + 1));
    const V = C.vars && C.vars.length > 1 ? C.vars[c.vr || 0] : null;
    if (c.big) n *= 4; // spécimen géant
    else if (cropVarRare(c.c, c.vr || 0)) n += 1; // variété rare : un peu plus
    const item = C.fruit || c.c;
    this.feedNote = c.big ? 'spécimen géant !' : V ? V.n : '';
    farm.give(item, n);
    this.feedNote = '';
    this.flyer(item, [x, game.world.heightAt(x, z) + 0.5, z], n);
    if (C.seedBack) farm.give('graines_' + c.c, C.seedBack[0] + Math.floor(Math.random() * (C.seedBack[1] - C.seedBack[0] + 1)));
    else if (ITEMS['graines_' + c.c] && Math.random() < (C.regrow ? 0.05 : 0.12)) farm.give('graines_' + c.c, 1); // quelques graines reviennent
    if (item === 'mandragore') { sound.scream2 && sound.scream2(); ui.subtitle('', '(La racine hurle en sortant de terre. Puis plus rien.)', 3.5); strange.glitchT = Math.max(strange.glitchT || 0, 0.3); }
    farm.s.stats.crops += n;
    if (C.regrow) c.g = C.h - C.regrow;
    else { c.c = null; c.g = 0; c.fert = 0; delete c.vr; delete c.big; }
    c.st = -1;
    farm.dirtyProps = true;
    if (!silent) sound.pop();
  },

  // ------------------------------------------------------------- manger
  eat(id) {
    const it = ITEMS[id], p = game.player;
    if (!it || !farm.count(id)) return;
    if (p.food > 96 && !(it.heal > 10 && p.hp < 90) && !it.stamina) { sound.click(); return; }
    farm.take(id, 1);
    p.food = Math.min(100, p.food + (it.food || 0));
    p.hp = Math.min(100, p.hp + (it.heal || 0));
    if (it.stamina) p.stamina = 1;
    if (it.raw && Math.random() < 0.3) { p.food = Math.max(0, p.food - 8); this.nausea = 10; }
    this.eatT = 0.8; this.cool = 0.9;
    sound.eat && sound.eat();
  },

  // ------------------------------------------------------------- pêche
  fishClick(eye, f) {
    const w = game.world;
    if (this.fish) {
      const F = this.fish;
      if (F.state === 'bite') this.catchFish(F);
      else { sound.reel && sound.reel(); }
      this.fish = null; this.cool = 0.6;
      return;
    }
    // lancer : le bouchon tombe où l'on vise (sur l'eau)
    const d = [f[0], Math.max(-0.6, f[1]), f[2]], L = Math.hypot(...d);
    const dir = [d[0] / L, d[1] / L, d[2] / L];
    const th = w.raycastTerrain(eye, dir, 18) || { x: eye[0] + dir[0] * 14, y: w.heightAt(eye[0] + dir[0] * 14, eye[2] + dir[2] * 14), z: eye[2] + dir[2] * 14 };
    let wx = th.x, wz = th.z, wy = w.waterLevel;
    let zone = null;
    if (w.heightAt(wx, wz) < w.waterLevel - 0.25) zone = this.fishZone(wx, wz);
    const deep = strange.fishingSpot(eye, dir);
    if (deep) { wx = deep.x; wz = deep.z; wy = deep.y; zone = deep.kind; }
    this.cool = 0.8; this.castT = 0.5;
    sound.cast && sound.cast();
    if (!zone) { this.fish = { x: wx, y: w.heightAt(wx, wz) + 0.05, z: wz, state: 'ground', t: 0 }; return; }
    const fast = (this.item() || {}).fast || 1;
    this.fish = { x: wx, y: wy, z: wz, zone, state: 'wait', t: (3 + Math.random() * 8) * fast, bob: 0 };
  },
  fishZone(x, z) {
    const w = game.world;
    for (const Z of w.fishZones || []) if (Math.hypot(Z.x - x, Z.z - z) < Z.r * 1.3) return Z.kind;
    return 'lac';
  },
  fishCancel() { this.fish = null; },
  updateFish(dt) {
    const F = this.fish;
    if (!F) return;
    const p = game.player;
    if (Math.hypot(F.x - p.pos[0], F.z - p.pos[2]) > 24 || farm.s.hand !== 'canne') { this.fish = null; return; }
    if (F.state === 'ground') { F.t += dt; if (F.t > 1.5) this.fish = null; return; }
    F.t -= dt;
    F.bob = Math.sin(performance.now() / 300) * 0.02;
    if (F.state === 'wait' && F.t <= 0) { F.state = 'bite'; F.t = 0.95; sound.bite && sound.bite(); splashAt(F.x, F.y, F.z); }
    else if (F.state === 'bite') { F.bob = -0.12; if (F.t <= 0) { F.state = 'wait'; F.t = 4 + Math.random() * 8; sound.reel && sound.reel(0.4); } }
  },
  catchFish(F) {
    const h = game.world.time * 24, night = h < 5.5 || h > 20.5;
    const cand = Object.keys(FISH).filter((k) => {
      const q = FISH[k];
      if (!q.where.includes(F.zone)) return false;
      if (q.time === 'jour' && night) return false;
      if (q.time === 'nuit' && !night) return false;
      if (q.moon && !(strange.redNight() || (farm.s.day % 7 === 0))) return false;
      return true;
    });
    if (!cand.length) { sound.reel && sound.reel(0.3); return; }
    let tot = 0; for (const k of cand) tot += FISH[k].w * (FISH[k].rain && game.sky.wet > 0.3 ? 3 : 1);
    let r = Math.random() * tot, pick = cand[0];
    for (const k of cand) { r -= FISH[k].w * (FISH[k].rain && game.sky.wet > 0.3 ? 3 : 1); if (r <= 0) { pick = k; break; } }
    const r0 = Math.random();
    if (r0 < 0.05) { farm.give('fibre', 1); this.flyer('fibre', [F.x, F.y + 0.3, F.z], 1); sound.reel && sound.reel(0.5); return; }
    if (r0 < 0.09) { farm.give('coffre_peche', 1); this.flyer('coffre_peche', [F.x, F.y + 0.3, F.z], 1); splashAt(F.x, F.y, F.z); sound.catchFish && sound.catchFish(); return; }
    if (r0 < 0.105 && F.zone === 'lac') { farm.give('perle', 1); this.flyer('perle', [F.x, F.y + 0.3, F.z], 1); sound.catchFish && sound.catchFish(); return; }
    farm.give(pick, 1);
    farm.s.stats.fish++;
    this.flyer(pick, [F.x, F.y + 0.3, F.z], 1);
    splashAt(F.x, F.y, F.z);
    sound.catchFish && sound.catchFish();
  },

  // ------------------------------------------------------------- arc et flèches
  bowHold(dt, held) {
    if (!ITEMS[farm.s.hand] || ITEMS[farm.s.hand].tool !== 'arc') { this.bow = 0; return; }
    if (held && (farm.count('fleche') > 0 || farm.count('fleche_fer') > 0)) { if (this.bow === 0) sound.bowDraw && sound.bowDraw(); this.bow = Math.min(1, this.bow + dt / 0.8); }
    else if (!held && this.bow > 0) { if (this.bow > 0.25) this.shoot(this.bow); this.bow = 0; }
  },
  shoot(k) {
    const p = game.player, eye = p.eyePos(), b = cameraBasis(p.yaw, p.pitch);
    const fer = farm.count('fleche_fer') > 0;
    farm.take(fer ? 'fleche_fer' : 'fleche', 1);
    const pw = (this.item() || {}).power || 1;
    const sp = (18 + k * 30) * (pw > 1 ? 1.2 : 1);
    this.arrows.push({ x: eye[0] + b.f[0] * 0.5, y: eye[1] + b.f[1] * 0.5 - 0.05, z: eye[2] + b.f[2] * 0.5, vx: b.f[0] * sp, vy: b.f[1] * sp, vz: b.f[2] * sp, dmg: (10 + k * 32) * pw * (fer ? 1.5 : 1), life: 6, fer });
    sound.bowShot && sound.bowShot();
    entities.scare(eye[0], eye[2], 10);
  },
  updateArrows(dt) {
    const w = game.world;
    for (let i = this.arrows.length - 1; i >= 0; i--) {
      const a = this.arrows[i];
      if (a.stuck) { a.life -= dt; if (a.life <= 0) this.arrows.splice(i, 1); continue; }
      a.life -= dt;
      a.vy -= 9.8 * dt;
      const o = [a.x, a.y, a.z], v = [a.vx * dt, a.vy * dt, a.vz * dt], L = Math.hypot(...v);
      const d = [v[0] / L, v[1] / L, v[2] / L];
      let hit = null;
      const eh = entities.raycast(o, d, L);
      if (eh) hit = { t: eh.t, e: eh.e };
      const nh = npcs.raycast(o, d, L);
      if (nh && (!hit || nh.t < hit.t)) hit = { t: nh.t, n: nh.n };
      const sh = strange.raycast(o, d, L);
      if (sh && (!hit || sh.t < hit.t)) hit = { t: sh.t, s: sh.s };
      const bh = w.raycastBlocks(o, d, L);
      if (bh && (!hit || bh.t < hit.t)) hit = { t: bh.t, block: true };
      const oh = w.raycastObjects(o, d, L, false);
      if (oh && (!hit || oh.t < hit.t)) hit = { t: oh.t, obj: true };
      const gy = w.heightAt(a.x + v[0], a.z + v[2]);
      if (!hit && a.y + v[1] < gy) hit = { t: L * clamp((a.y - gy) / Math.max(1e-4, a.y - (a.y + v[1])), 0, 1), ground: true };
      if (hit) {
        a.x += d[0] * hit.t; a.y += d[1] * hit.t; a.z += d[2] * hit.t;
        if (hit.e) { this.hurtCreature(hit.e, a.dmg, [a.x - a.vx, 0, a.z - a.vz]); puffAt(a.x, a.y, a.z, [150, 30, 30], 6, 1.5, false); this.arrows.splice(i, 1); continue; }
        if (hit.n) { npcs.hurt(hit.n, a.dmg, 'joueur'); this.arrows.splice(i, 1); continue; }
        if (hit.s) { strange.hit(hit.s, a.dmg, [a.x - a.vx, 0, a.z - a.vz]); this.arrows.splice(i, 1); continue; }
        a.stuck = true; a.life = 20; sound.impact(hit.block ? 'hard' : 'soft');
        if (a.y < w.waterLevel) { splashAt(a.x, w.waterLevel, a.z); this.arrows.splice(i, 1); }
        else if (a.fer) a.pickable = true;
        else if (Math.random() < 0.5 && hit.ground) { a.pickable = true; }
        continue;
      }
      a.x += v[0]; a.y += v[1]; a.z += v[2];
      if (a.life <= 0) this.arrows.splice(i, 1);
    }
  },

  // ------------------------------------------------------------- objets à poser
  updateGhost(eye, f) {
    const id = farm.s.hand, it = ITEMS[id];
    this.ghost = null;
    if (!it || !it.place) return;
    const w = game.world, P = PLACEABLES[it.place] || {};
    const th = w.raycastTerrain(eye, f, 6);
    let x, y, z;
    const bh = w.raycastBlocks(eye, f, th ? th.t : 6);
    if (bh && bh.n[1] > 0.7 && (!th || bh.t < th.t)) { const t = bh.t; x = eye[0] + f[0] * t; z = eye[2] + f[2] * t; y = eye[1] + f[1] * t; }
    else if (th) { x = th.x; y = th.y; z = th.z; }
    else return;
    let r = this.rotY + Math.round(game.player.yaw / (Math.PI / 2)) * Math.PI / 2 + Math.PI;
    if (P.snap) { const s = P.snap; if (s === 1) { x = Math.floor(x) + 0.5; z = Math.floor(z) + 0.5; } else { x = Math.round(x / s * 2) * s / 2; z = Math.round(z / s * 2) * s / 2; } r = Math.round(r / (Math.PI / 2)) * Math.PI / 2; }
    if (!(bh && bh.n[1] > 0.7)) y = w.groundAt(x, z, y + 0.3, 0.4);
    let ok = y > w.waterLevel + 0.05 && !interditDeBatir(x, z) && !(game.player.underground && !P.sousTerre);
    const c = PROP_COLL[it.place];
    if (ok && c) {
      const probe = { x, y, z, sx: c[0] * 2, sy: c[2], sz: c[1] * 2, r };
      w.query(x, z, 3, null, (b) => {
        if (!ok || b.y >= y + c[2] - 0.05 || b.y + b.sy <= y + 0.05) return;
        const [lx, lz] = World.blockLocal(b, x, z);
        if (Math.abs(lx) < b.sx / 2 + Math.max(c[0], c[1]) * 0.8 && Math.abs(lz) < b.sz / 2 + Math.max(c[0], c[1]) * 0.8) ok = false;
      });
      const p = game.player; if (Math.hypot(p.pos[0] - x, p.pos[2] - z) < Math.max(c[0], c[1]) + 0.5) ok = false;
      void probe;
    }
    if (ok && farm.crop(x, z) && !P.flat) ok = false;
    this.ghost = { id: it.place, item: id, x, y, z, r, ok };
  },
  place(held) {
    const g = this.ghost;
    if (!g || !g.ok) { if (!held) sound.click(); return; }
    if (held && this.lastPlace && Math.hypot(this.lastPlace[0] - g.x, this.lastPlace[1] - g.z) < 0.4) return;
    this.lastPlace = [g.x, g.z];
    if (!farm.take(g.item, 1)) return;
    if (g.item === 'jeune_pommier') {
      const k = farm.cellKey(g.x, g.z);
      farm.s.crops[k] = { c: 'pommier', g: 0, wet: 0, dryH: 0, t: farm.s.hours, tree: 1 };
      farm.dirtyProps = true;
    } else {
      const data = g.id === 'mangeoire' ? { fill: 0 } : g.id === 'portillon' ? { open: false } : g.id === 'four' ? { lit: false } : g.id === 'caisse_expedition' ? {} : MACHINES[g.id] ? { m: null } : null;
      farm.addProp({ id: g.id, x: g.x, y: g.y, z: g.z, r: g.r, data });
      if (PROP_LIGHTS[g.id]) game.world.collectLights();
    }
    this.cool = 0.3;
    sound.place && sound.place();
    puffAt(g.x, g.y + 0.1, g.z, [150, 130, 100], 6, 1.2, false);
  },
  propAt(p, r = 1.6) {
    let best = null, bd = r;
    for (const q of game.world.props) { if (q.gone) continue; const d = Math.hypot(q.x - p[0], q.z - p[2]); if (d < bd && Math.abs(q.y - p[1]) < 3) { bd = d; best = q; } }
    return best;
  },
  // Marteau : démonte un objet posé par le joueur (le rend à l'inventaire)
  dismantle(q) {
    const i = game.world.props.indexOf(q);
    if (i < farm.genProps) { sound.impact('hard'); return; }
    const itemId = q.id === 'citrouille' ? 'citrouille_sculptee' : q.id;
    if (!ITEMS[itemId]) return;
    if (q.id === 'coffre' && q.data && q.data.items && Object.keys(q.data.items).length) { sound.impact('wood'); return; }
    farm.removeProp(q);
    farm.give(itemId, 1);
    this.flyer(itemId, [q.x, q.y + 0.5, q.z], 1);
    sound.remove();
    game.world.collectLights();
  },

  // ------------------------------------------------------------- petites icônes qui volent vers soi (récolte)
  flyer(item, p, n) {
    if (this.flyers.length > 24) this.flyers.shift();
    for (let k = 0; k < Math.min(n || 1, 3); k++) this.flyers.push({ item, x: p[0] + (Math.random() - 0.5) * 0.3, y: p[1] + k * 0.15, z: p[2] + (Math.random() - 0.5) * 0.3, t: -k * 0.08 });
  },
  updateFlyers(dt, eye) {
    for (let i = this.flyers.length - 1; i >= 0; i--) {
      const f = this.flyers[i];
      f.t += dt;
      if (f.t < 0) continue;
      const k = Math.min(1, f.t / 0.55), tx = eye[0], ty = eye[1] - 0.45, tz = eye[2];
      f.x = lerp(f.x, tx, k * 0.35); f.y = lerp(f.y, ty, k * 0.35) + (1 - k) * dt * 2; f.z = lerp(f.z, tz, k * 0.35);
      if (f.t > 0.6 || Math.hypot(f.x - tx, f.y - ty, f.z - tz) < 0.35) { this.flyers.splice(i, 1); sound.tick && sound.tick(); }
    }
  },
  appendFlyers(D, n) {
    for (const f of this.flyers) {
      if (f.t < 0 || n >= 2047) continue;
      const s = ATLAS.sprites['it_' + f.item];
      if (!s) continue;
      const o = n * 13, size = 0.28;
      D[o] = f.x; D[o + 1] = f.y - size / 2; D[o + 2] = f.z; D[o + 3] = size; D[o + 4] = size;
      D[o + 5] = s.u0; D[o + 6] = s.v0; D[o + 7] = s.u1; D[o + 8] = s.v1; D[o + 9] = 0; D[o + 10] = 1; D[o + 11] = 0; D[o + 12] = 0;
      n++;
    }
    return n;
  },

  // ------------------------------------------------------------- santé, faim, souffle
  hurt(dmg, src, cause) {
    const p = game.player;
    if (farm.s.over || game.dying) return;
    p.hp -= dmg;
    this.hurtFlash = Math.min(1, this.hurtFlash + 0.35 + dmg / 60);
    this.lastHurtBy = cause || 'Mort de ses blessures';
    game.shakeT = 0.3;
    sound.hurt && sound.hurt(dmg);
    if (src && src.x !== undefined) { const dx = p.pos[0] - src.x, dz = p.pos[2] - src.z, d = Math.hypot(dx, dz) || 1; p.vel[0] += dx / d * 4; p.vel[2] += dz / d * 4; }
    if (p.hp <= 0) game.die(this.lastHurtBy);
  },
  updateBody(dt) {
    const p = game.player, s = farm.s;
    const dayK = dt / game.world.dayLength; // fraction de journée
    p.food = Math.max(0, p.food - dayK * (p.sprinting ? CORPS_JOUR.faimCourse : CORPS_JOUR.faim));
    if (p.food <= 0) { p.hp -= dayK * CORPS_JOUR.famine; if (p.hp <= 0) game.die('Mort de faim'); }
    else if (p.food > 25 && p.hp < 100) p.hp = Math.min(100, p.hp + dayK * CORPS_JOUR.soin);
    this.hurtFlash = Math.max(0, this.hurtFlash - dt * 1.4);
    this.nausea = Math.max(0, (this.nausea || 0) - dt);
    // cœur qui bat quand on est blessé ou effrayé
    const fear = strange.fear || 0;
    if (p.hp < 35 || fear > 0.3) { this.heartT -= dt; if (this.heartT <= 0) { this.heartT = p.hp < 20 || fear > 0.7 ? 0.55 : 0.85; sound.heartbeat(Math.max(1 - p.hp / 40, fear) * 0.8); } }
    // souffle court après une course
    if (p.stamina < 0.3 && !p.riding) { this.breathT -= dt; if (this.breathT <= 0) { this.breathT = 0.7; sound.breath && sound.breath(1 - p.stamina / 0.3); } }
    // noyade
    const eye = p.eyePos(), w = game.world;
    if (eye[1] < w.waterLevel - 0.05 && w.heightAt(eye[0], eye[2]) < w.waterLevel) { p.breath -= dt / 25; if (p.breath <= 0) { p.hp -= dt * 12; this.lastHurtBy = 'Noyé'; if (p.hp <= 0) game.die('Noyé dans ' + (strange.placeName(p.pos) || 'l’eau froide')); } }
    else p.breath = Math.min(1, p.breath + dt / 3);
  },
  // le corps pendant une nuit de h heures de jeu (game.sleep) : la faim creuse moins qu'en veillant, la vie remonte
  // tant qu'il reste à manger ; le ventre vide, on ne guérit plus et la faim ronge, mais on se réveille (5 PV au
  // moins) : dormir ne sauve pas de la faim, et la mort vient debout. Une égratignure se referme pendant la nuit ;
  // une vraie plaie, non : tant qu'elle saigne, la nuit ne soigne pas (il faut un bandage)
  nuit(h) {
    const p = game.player, K = CORPS_JOUR, C = typeof corps !== 'undefined' && farm.s ? corps.C() : null;
    h = Math.max(0, +h || 0);
    if (C && C.saigne > 0 && C.saigne < 0.25) C.saigne = 0;
    const plaie = !!(C && C.saigne > 0);
    const repu = Math.min(h, p.food / (K.faimNuit / 24)); // heures dormies avant que le ventre soit vide
    p.food = Math.max(0, p.food - h * K.faimNuit / 24);
    if (!plaie) p.hp = Math.min(100, p.hp + repu * K.soinNuit / 24);
    if (h > repu) p.hp = Math.max(Math.min(p.hp, 5), p.hp - (h - repu) * K.famine / 24);
    p.stamina = 1;
  },

  // ------------------------------------------------------------- rendu des objets 3D posés et des cultures
  buildProps(cam, sky) {
    const w = game.world, buf = this.propBuf, R = sky.fog[1] + 40;
    const night = sky.nightLit ? 1 : 0;
    if (!farm.dirtyProps && this.propCenter && Math.hypot(cam[0] - this.propCenter[0], cam[2] - this.propCenter[1]) < 30 && this.propNight === night && this.propR === R) return;
    this.propCenter = [cam[0], cam[2]]; this.propNight = night; this.propR = R;
    farm.dirtyProps = false;
    buf.reset();
    PE.buf = buf;
    const T = { night: !!night, t: 0, wind: 0 };
    const R2 = R * R;
    for (const p of w.props) {
      if (!w.live(p) || DYN_PROPS.has(p.id)) continue;
      const dx = p.x - cam[0], dz = p.z - cam[2];
      if (dx * dx + dz * dz > R2) continue;
      if (p.id === 'epouvantail' || p.id === 'statue') { this.drawRigProp(buf, p); if (p.id === 'epouvantail') continue; }
      const fn = PROP_MODELS[p.id];
      if (!fn) continue;
      PE.frame(p.x, p.y, p.z, p.r, p.s || 1);
      fn(PE, p, T);
    }
    // cultures et terre labourée
    const s = farm.s;
    for (const k in s.crops) {
      const c = s.crops[k], i = k.indexOf(',');
      const x = +k.slice(0, i) + 0.5, z = +k.slice(i + 1) + 0.5;
      const dx = x - cam[0], dz = z - cam[2];
      if (dx * dx + dz * dz > R2) continue;
      const y = w.heightAt(x, z);
      if (!c.tree) {
        PE.frame(x, y, z, 0, 1);
        PE.box(0, 0.02, 0, 0.96, 0.08, 0.96, c.fert ? [0.92, 0.88, 0.8] : WHITE, tx(farm.wet(c) ? TL.soilWet : TL.soil));
      }
      if (c.c) {
        PE.frame(x, y + (c.tree ? 0 : 0.06), z, hash2i(x | 0, z | 0, 3) * 0.6, cropScale(c, x, z));
        cropDraw(PE, c, farm.growth(c), farm.ripe(c));
      }
    }
    buf.ver = (buf.ver || 0) + 1;
  },
  drawRigProp(buf, p) {
    let r = p.id === 'statue' ? (p.rig || (p.rig = humanRig({ skin: '#a8a49c', hair: '#8a867e', top: '#a8a49c', bottom: '#9a968e', shoe: '#8a867e', hairStyle: 'court', build: 'normal' }))) : (p.rig || (p.rig = scarecrowRig(p.data && p.data.v)));
    if (p.id === 'statue') { poseHuman(r, { move: 0, t: 0, lookY: 0 }); for (const q of r.parts) { if (q.s) { q.col = [0.66, 0.65, 0.62]; q.tex = TL.stone | (TL.stone << 8); } } drawRig(buf, r, p.x, p.y + 0.8, p.z, p.r, 1); return; }
    const a = p.data && p.data.arm;
    r.set('armL', 0, 0, a ? 0.4 : 0.08); r.set('armR', 0, 0, a ? -0.4 : -0.08); r.set('head', 0, 0, (p.data && p.data.tilt) || 0.12);
    drawRig(buf, r, p.x, p.y, p.z, p.r, 1);
  },
  // Objets animés + portes + ponts + fantôme de placement + bouchon + flèches (chaque image)
  buildDynamic(cam, sky, t) {
    const w = game.world, buf = this.dynBuf;
    buf.reset(); this.shadowBuf.reset();
    PE.buf = buf;
    const T = { night: !!sky.nightLit, t, wind: t * 0.07 + Math.sin(t * 0.13) * 1.2, hour: w.time * 24 };
    for (const p of w.props) {
      if (!DYN_PROPS.has(p.id) || !w.live(p)) continue;
      if (Math.abs(p.x - cam[0]) > 160 || Math.abs(p.z - cam[2]) > 160) continue;
      PE.frame(p.x, p.y, p.z, p.r, p.s || 1);
      PROP_MODELS[p.id](PE, p, T);
    }
    for (const d of w.doors) if (Math.abs(d.x - cam[0]) < 110 && Math.abs(d.z - cam[2]) < 110) emitDoor(buf, d, d.hi ? FX_HI : 0);
    for (const b of w.bridges) if (Math.abs(b.x - cam[0]) < 220 && Math.abs(b.z - cam[2]) < 220) emitBridge(buf, b);
    // objet visé : légère lueur (aucun texte à l'écran)
    const hp = game.hiProp;
    if (hp && PROP_MODELS[hp.id] && !DYN_PROPS.has(hp.id)) { PE.fl = FX_HI; PE.frame(hp.x, hp.y, hp.z, hp.r, hp.s || 1); PROP_MODELS[hp.id](PE, hp, T); PE.fl = 0; }
    const hc = game.hiCrop;
    if (hc && hc.c && hc.c.c && CROP_MODELS[hc.c.c]) { const y = w.heightAt(hc.x, hc.z); PE.fl = FX_HI; PE.frame(hc.x, y + (hc.c.tree ? 0 : 0.06), hc.z, hash2i(hc.x | 0, hc.z | 0, 3) * 0.6, cropScale(hc.c, hc.x, hc.z)); cropDraw(PE, hc.c, farm.growth(hc.c), farm.ripe(hc.c)); PE.fl = 0; }
    const g = this.ghost;
    if (g) {
      PE.fl = FX_HI; PE.tint = g.ok ? [0.8, 1.15, 0.8] : [1.4, 0.45, 0.4];
      PE.frame(g.x, g.y, g.z, g.r, 1);
      if (g.item === 'jeune_pommier') PROP_MODELS.sapling(PE, g, T);
      else if (g.id === 'epouvantail') { PE.bx(0, 0, 0, 0.1, 2.1, 0.1, WHITE, TL.wood); PE.bx(0, 1.6, 0, 1.3, 0.1, 0.1, WHITE, TL.wood); }
      else if (PROP_MODELS[g.id]) PROP_MODELS[g.id](PE, g, T);
      PE.fl = 0; PE.tint = null;
    }
    const F = this.fish;
    if (F && F.state !== 'ground') { PE.frame(F.x, F.y + F.bob, F.z, 0, 1); PE.bx(0, -0.03, 0, 0.07, 0.06, 0.07, [1, 1, 1], 0); PE.bx(0, 0.03, 0, 0.06, 0.07, 0.06, [0.85, 0.15, 0.1], 0); }
    for (const a of this.arrows) {
      const L = Math.hypot(a.vx, a.vy, a.vz) || 1, yaw = Math.atan2(a.vx, a.vz), pit = -Math.asin(a.vy / L);
      PE.frame(a.x, a.y, a.z, 0, 1);
      PE.box(0, 0, 0, 0.025, 0.025, 0.7, [0.7, 0.55, 0.35], TL.wood, yaw, a.stuck ? a.pit || pit : (a.pit = pit));
    }
  },
};
const DYN_PROPS = new Set(['moulin_ailes', 'girouette', 'feu_camp', 'bougie', 'portillon', 'horloge', 'arroseur', 'arroseur_fer', 'moulin_a_bras', 'fontaine_jardin']);

// Teinte optionnelle des boîtes de l'émetteur (fantôme de placement)
{
  const box0 = PE.box;
  PE.box = function (cx, cy, cz, sx, sy, sz, col, code, ry, rx, rz) {
    if (this.tint) col = [col[0] * this.tint[0], col[1] * this.tint[1], col[2] * this.tint[2]];
    box0.call(this, cx, cy, cz, sx, sy, sz, col, code, ry, rx, rz);
  };
}
