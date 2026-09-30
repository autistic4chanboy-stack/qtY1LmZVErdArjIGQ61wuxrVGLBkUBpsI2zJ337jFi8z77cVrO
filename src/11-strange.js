// ============================================================================
//  L'ÉTRANGE : événements aléatoires (du presque imperceptible au flagrant),
//  le tueur masqué, les nuits rouges, l'Envers, les versions du monde
// ============================================================================

// Silhouettes
const KILLER_LOOK = { skin: '#d8cfc0', hair: '#1a1614', hairStyle: 'court', hat: 'capuche', hatCol: '#1e1c1a', top: '#262422', bottom: '#1e1c1a', shoe: '#141210', coat: true, face: TL.mask, held: 'couperet', height: 1.02, build: 'normal' };
const FIGURE_LOOK = { skin: '#101012', hair: '#101012', hairStyle: 'court', hat: 'chapeau', hatCol: '#0c0c0e', top: '#141416', bottom: '#101012', shoe: '#0a0a0a', coat: true, face: TL.blankF, height: 1.08, build: 'mince' };
const EVENT_DEFS = [
  // niveau 0 : presque imperceptible
  { id: 'epouvantail', lvl: 0, when: 'matin' }, { id: 'cloche13', lvl: 0, when: 'nuit' }, { id: 'porte', lvl: 0, when: 'matin' },
  { id: 'arbre', lvl: 0, when: 'matin' }, { id: 'oiseaux', lvl: 0, when: 'jour' }, { id: 'regards', lvl: 0, when: 'jour' },
  { id: 'echo', lvl: 0, when: 'nuit' }, { id: 'murmure', lvl: 0, when: 'nuit' }, { id: 'nuages', lvl: 0, when: 'jour' },
  { id: 'lampes', lvl: 0, when: 'nuit' }, { id: 'oubli', lvl: 0, when: 'jour' },
  // niveau 1 : discret
  { id: 'silhouette', lvl: 1, when: 'nuit' }, { id: 'toctoc', lvl: 1, when: 'nuit' }, { id: 'traces', lvl: 1, when: 'matin' },
  { id: 'chapelle', lvl: 1, when: 'nuit' }, { id: 'cercle', lvl: 1, when: 'matin' }, { id: 'lettre', lvl: 1, when: 'matin' },
  { id: 'corbeaux', lvl: 1, when: 'jour' }, { id: 'follets', lvl: 1, when: 'nuit' }, { id: 'cerf', lvl: 1, when: 'aube' },
  { id: 'bete', lvl: 1, when: 'matin' },
  // niveau 2 : visible
  { id: 'double', lvl: 2, when: 'jour' }, { id: 'visiteur', lvl: 2, when: 'nuit' }, { id: 'marche', lvl: 2, when: 'matin' },
  { id: 'glissement', lvl: 2, when: 'matin' }, { id: 'carcasse', lvl: 2, when: 'matin' }, { id: 'main', lvl: 2, when: 'matin' },
  { id: 'arret', lvl: 2, when: 'nuit' }, { id: 'voix', lvl: 2, when: 'jour' },
  // niveau 3 : flagrant
  { id: 'masque', lvl: 3, when: 'nuit' }, { id: 'faille', lvl: 3, when: 'nuit' }, { id: 'deuxlunes', lvl: 3, when: 'nuit' },
];
const WHEN_H = { matin: [6.2, 8.5], jour: [9, 17.5], nuit: [21.5, 27.5], aube: [4.8, 6.8] };
const STRANGE_LETTERS = [
  'Il y a quelqu’un dans ta maison. Pas maintenant. Mais il y était.',
  'Tu as oublié de fermer. Nous sommes entrés. Nous n’avons rien pris. Nous avons seulement regardé.',
  'Ne réponds pas quand on frappe trois fois.',
  'Le blé est beau cette année. Il pousse mieux quand on l’arrose avec ce qu’il faut.',
  'Nous étions là avant la ferme. Nous serons là après toi. Comme pour les autres.',
  'Compte les pierres du cercle. Recompte-les la nuit.',
  'Ta fenêtre est restée allumée toute la nuit. Nous aimons la regarder.',
  'Pourquoi as-tu déplacé l’épouvantail ? Il était bien, face à la maison.',
];

const strange = {
  s: null, ents: [], fear: 0, glitchT: 0, freezeT: 0, echoT: 0, twoMoons: 0, cloudStop: 0, flickerT: 0, killerE: null, redK: 0, enversK: 0,

  init(s) {
    if (!s.strange) {
      const rnd = mulberry32(s.seed * 17 + 5);
      const elig = NPC_DATA.filter((d) => d.killer && d.id !== 'fillette');
      s.strange = {
        killer: elig[(rnd() * elig.length) | 0].id, kDay: 8 + Math.floor(rnd() * 5), redMin: 5 + Math.floor(rnd() * 3),
        red: false, redTonight: false, lastRed: -9, redCount: 0, ver: 1, victims: [], kDead: false, kCaught: false,
        events: [], seen: {}, t0: rnd() * 0.06, envers: false, scare: 0, clue: false,
      };
    }
    this.s = s.strange;
    this.ents = []; this.killerE = null;
    this.applyVersion();
    if (this.s.envers) this.setEnvers(false, true);
  },
  tension() {
    const S = this.s, d = farm.s.day;
    if (!S) return 0;
    let t = clamp((d - 1) / 13, 0, 1) * 0.92 + S.t0;
    if (this.killerActive()) t = Math.max(t, 0.85);
    return clamp(t, 0, 1);
  },
  maxLevel() { const t = this.tension(); return t < 0.14 ? 0 : t < 0.38 ? 1 : t < 0.6 ? 2 : 3; },
  // les chances du jour, pour un esprit ordinaire (11-zzz60-esprit.js les module par bizarrerie() ; mesure :
  // tools/equilibrage/hasard.js) : une nuit rouge une nuit sur douze quand la tension est pleine (jamais deux de suite) ;
  // quelques événements étranges par semaine (le carnet des 44 étrangetés, trois fois chacune, dure ainsi des mois)
  chanceRouge() { return 0.055 + this.tension() * 0.045; },
  chanceEvenements() { return 0.12 + this.tension() * 0.13; },
  isKiller(id) { return this.s && this.s.killer === id; },
  killerPhase() { const S = this.s; if (!S || S.kDead || S.kCaught) return 0; const d = farm.s.day; return d >= S.kDay ? 2 : d >= S.kDay - 3 ? 1 : 0; },
  killerActive() { return this.killerPhase() === 2; },
  redNight() { return !!(this.s && this.s.red); },
  wasRedNight() { return this.s && this.s.lastRed === farm.s.day - 1 && npcs.hour() < 20; },
  inEnvers() { return !!(this.s && this.s.envers); },
  placeName(p) {
    const lm = game.world.lm;
    let best = null, bd = 1e9;
    for (const k in lm) { const d = Math.hypot(lm[k].x - p[0], lm[k].z - p[2]); if (d < bd && d < lm[k].r * 2 + 40) { bd = d; best = LIEU_NAMES[k]; } }
    return best;
  },

  // ------------------------------------------------------------- versions du monde
  applyVersion() {
    const w = game.world;
    w.curVer = this.s.envers ? VER_ENVERS : (1 << ((this.s.ver || 1) - 1));
    w.objectsDirty = true; w.blocksDirty = true; w.grid = null; w.coverDirty = true; w.shadeDirty = true; w.shadeRegion = null;
    farm.dirtyProps = true;
  },
  shift() {
    const S = this.s, cur = S.ver || 1;
    let v = cur;
    while (v === cur) v = 1 + Math.floor(Math.random() * 4);
    S.ver = v; this.applyVersion();
  },

  // ------------------------------------------------------------- nouveau jour
  newDay(nightInfo) {
    const S = this.s, s = farm.s, d = s.day, rnd = Math.random;
    const report = [];
    // fin de nuit rouge
    if (S.red) { S.red = false; S.lastRed = d - 1; npcs.vanishAll(false); }
    // meurtre de la nuit
    if (nightInfo && nightInfo.killerNight && !S.kDead && !S.kCaught) {
      const pM = 0.28 + this.tension() * 0.15 + (S.victims.length === 0 && d >= S.kDay + 1 ? 0.35 : 0);
      if (rnd() < pM && S.victims.length < 4) this.murder();
    }
    // décide de la nuit rouge à venir
    S.redTonight = d >= S.redMin && S.lastRed < d - 1 && (rnd() < this.chanceRouge() || (S.redCount === 0 && d >= S.redMin + 3));
    // glissement de version (rare, toujours un matin)
    // événements du jour : le plus souvent un seul, parfois deux quand la tension monte
    S.events = [];
    const n = rnd() < this.chanceEvenements() ? 1 + (rnd() < this.tension() * 0.15 ? 1 : 0) : 0;
    const maxL = this.maxLevel();
    const pool = EVENT_DEFS.filter((e) => e.lvl <= maxL && (S.seen[e.id] || 0) < 3);
    for (let k = 0; k < n && pool.length; k++) {
      // les niveaux élevés sont plus rares
      let e = null;
      for (let t = 0; t < 8 && !e; t++) { const c = pool[(rnd() * pool.length) | 0]; if (rnd() < (c.lvl === maxL ? 0.45 : 1)) e = c; }
      if (!e) continue;
      pool.splice(pool.indexOf(e), 1);
      const [a, b] = WHEN_H[e.when];
      S.events.push({ id: e.id, h: a + rnd() * (b - a), done: false });
    }
    if (d === 2) S.events.push({ id: 'epouvantail', h: 6.5, done: false });
    // indice chez le tueur quelques jours avant
    if (this.killerPhase() >= 1 && !S.clue) this.placeClue();
    return report;
  },
  // Le tueur a frappé cette nuit
  murder() {
    const S = this.s, w = game.world;
    const cand = npcs.list.filter((n) => n.st.alive && n.id !== S.killer && n.id !== 'fillette' && !n.vanished);
    if (!cand.length) return;
    // les habitants isolés sont plus exposés
    cand.sort((a, b) => (['ranch', 'cabane_pecheur', 'hutte_ermite'].includes(b.d.home) ? 1 : 0) - (['ranch', 'cabane_pecheur', 'hutte_ermite'].includes(a.d.home) ? 1 : 0) + (Math.random() - 0.5) * 1.5);
    const v = cand[0];
    const B = w.bld[v.d.home];
    const x = B.out[0] + (Math.random() - 0.5) * 3, z = B.out[1] + (Math.random() - 0.5) * 3;
    v.x = x; v.z = z; v.y = w.heightAt(x, z); v.heading = Math.random() * TAU;
    npcs.kill(v, 'tueur', []);
    S.victims.push(v.id);
    const dr = w.doors[B.door];
    if (dr) { dr.forced = true; dr.open = 1; dr.locked = false; dr.a = 1.2; }
    farm.addProp({ id: 'sang', x: x + 0.5, y: v.y + 0.01, z: z, r: Math.random() * TAU });
  },
  bury(n) {
    const g = game.world.townInfo && game.world.townInfo.cemGrave;
    if (!g) return;
    const k = farm.s.dead.findIndex((d) => d.id === n.id);
    const x = g[0] + (k % 5) * 1.6 - 3.2, z = g[1] - Math.floor(k / 5) * 2.2;
    if (!farm.propByKind('tombe_neuve', [x, z], 0.5)) {
      farm.addProp({ id: 'tombe_neuve', x, y: game.world.heightAt(x, z), z, r: Math.PI, data: { who: n.name + ' ' + n.d.surname, day: farm.s.day - 1 } });
      game.world.inter.push({ kind: 'grave', id: 'tombe_' + n.id, x, y: game.world.heightAt(x, z) + 0.9, z, name: 'Lire l’inscription', data: { who: n.id } });
    }
  },
  placeClue() {
    const S = this.s, w = game.world, n = npcs.byId[S.killer];
    if (!n) return;
    const B = w.bld[n.d.home];
    if (!B) return;
    S.clue = true;
    const [x, z] = B.f ? new Builder(w, Math.random, new Uint8Array(1)).toWorld(B.f, -B.W / 2 + 1.0, -0.4) : [B.x, B.z];
    w.inter.push({ kind: 'clue', id: 'indice', x, y: B.y + 0.5, z, name: 'Fouiller', data: { npc: n.id } });
  },

  // ------------------------------------------------------------- chaque image
  update(dt, c) {
    const S = this.s, s = farm.s, w = game.world, p = game.player, h = npcs.hour(), eye = c.eye;
    if (!S) return;
    // nuit rouge : à la tombée du jour
    if (S.redTonight && !S.red && h >= 19.6 && h < 23) { S.red = true; S.redCount++; npcs.vanishAll(true); sound.redNight && sound.redNight(); }
    if (S.red && h >= 6 && h < 12) { S.red = false; S.lastRed = s.day; S.redTonight = false; npcs.vanishAll(false); }
    this.redK += ((S.red ? 1 : 0) - this.redK) * Math.min(1, dt * 0.3);
    this.enversK += ((S.envers ? 1 : 0) - this.enversK) * Math.min(1, dt * 1.5);
    // événements programmés
    let hh = h < 6 ? h + 24 : h;
    for (const e of S.events) if (!e.done && hh >= e.h && hh < e.h + 3) { e.done = true; S.seen[e.id] = (S.seen[e.id] || 0) + 1; this.run(e.id, c); }
    // petits frissons aléatoires la nuit (minuterie en heures de jeu : au moins 1,6 heure entre deux, trois en moyenne
    // quand la tension est pleine)
    this.ambT = (this.ambT ?? 0.8) - heuresDeJeu(dt);
    if (this.ambT <= 0) {
      this.ambT = 1.6 + Math.random() * 3.6 / (0.3 + this.tension());
      if (c.night > 0.5 && Math.random() < this.tension()) { const pool = ['murmure', 'echo', 'lampes']; if (this.maxLevel() >= 1) pool.push('toctoc', 'silhouette'); this.run(pool[(Math.random() * pool.length) | 0], c); }
    }
    // tueur
    this.updateKiller(dt, c);
    // pâles et veilleur (nuits rouges, Envers)
    if ((S.red && (h >= 21.5 || h < 5)) || S.envers) this.ensurePales(c, dt);
    this.fear = 0;
    this.glitchT = Math.max(0, this.glitchT - dt);
    this.freezeT = Math.max(0, this.freezeT - dt);
    this.twoMoons = Math.max(0, this.twoMoons - dt);
    this.cloudStop = Math.max(0, this.cloudStop - dt);
    this.flickerT = Math.max(0, this.flickerT - dt);
    for (let i = this.ents.length - 1; i >= 0; i--) {
      const e = this.ents[i];
      e.t += dt;
      const fn = this['E_' + e.kind];
      if (fn && fn.call(this, e, dt, c) === false) { this.ents.splice(i, 1); if (e === this.killerE) this.killerE = null; }
    }
    // l'aube chasse de l'Envers
    if (S.envers && h >= 6 && h < 7) { this.setEnvers(false); ui.fadeMsg('Vous vous réveillez près du vieux puits, trempé.', 3); const L = w.lm.vieux_puits; if (L) { p.pos = [L.x + 2, w.heightAt(L.x + 2, L.z) + 0.1, L.z]; p.vel = [0, 0, 0]; } }
  },
  run(id, c) {
    const w = game.world, p = game.player, s = farm.s, S = this.s, rnd = Math.random;
    const fm = w.farm, fx = fm.f.x, fz = fm.f.z;
    switch (id) {
      case 'epouvantail': { const q = farm.propByKind('epouvantail', [fx, fz], 120); if (q) { const B = w.bld.ferme; q.r = Math.atan2(B.x - q.x, B.z - q.z); farm.setPropData(q, { tilt: 0.3 }); farm.dirtyProps = true; } break; }
      case 'cloche13': this.bells(13); break;
      case 'porte': { const d = w.doors[w.bld.ferme.door]; if (d && !npcs.someoneInDoor(d)) { d.open = 1; d.locked = false; } break; }
      case 'arbre': { const o = w.objects.find((o) => !o.gone && ['oak', 'apple', 'birch'].includes(OBJ_TYPES[o.t].id) && Math.hypot(o.x - fx, o.z - fz) < 90 && Math.hypot(o.x - fx, o.z - fz) > 40); if (o) { o.x += (rnd() - 0.5) * 6; o.z += (rnd() - 0.5) * 6; w.objectsDirty = true; w.grid = null; } break; }
      case 'oiseaux': for (const e of entities.list) if (e.cfg.fly && !e.hidden) e.frozenT = 4; this.birdFreeze = 4; break;
      case 'regards': for (const e of entities.list) if (!e.cfg.fly && !e.hidden && e.dist < 40) e.stareAll = true; setTimeout(() => { for (const e of entities.list) e.stareAll = false; }, 7000); break;
      case 'echo': this.echoT = 12; break;
      case 'murmure': sound.whisper && sound.whisper(rnd() * 2 - 1, 0.5); break;
      case 'nuages': this.cloudStop = 40; break;
      case 'lampes': this.flickerT = 6; break;
      case 'oubli': { const n = npcs.list.find((m) => m.st.alive && m.st.met && m.dist < 60 && !m.vanished); if (n) { npcs.say(n, 'Bonjour ! Vous êtes nouveau par ici, non ? On ne s’est jamais vus, je crois.', 4); setTimeout(() => npcs.say(n, 'Oh… pardon. Je ne sais pas ce que j’ai dit. Bonjour, bien sûr.', 3.5), 6500); } break; }
      case 'silhouette': this.spawnFigure('champ', c); break;
      case 'toctoc': if (c.insideFarm) { sound.knock && sound.knock(3); setTimeout(() => { const d = w.doors[w.bld.ferme.door]; if (d && d.open && !d.locked) sound.whisper && sound.whisper(0, 0.4); }, 3000); } break;
      case 'traces': { const B = w.bld.ferme; for (let k = 0; k < 4; k++) { const t = k / 4; const x = lerp(fm.field.x0, B.out[0], t), z = lerp(fm.field.z0, B.out[1], t); farm.addProp({ id: 'traces', x, y: w.heightAt(x, z) + 0.01, z, r: Math.atan2(B.out[0] - fm.field.x0, B.out[1] - fm.field.z0) }); } break; }
      case 'chapelle': { const L = w.lm.chapelle; if (L) { this.ents.push({ kind: 'light', x: L.x, y: L.y + 1.5, z: L.z, t: 0, life: 200, c: [1, 0.6, 0.3], r: 8 }); } break; }
      case 'cercle': { const cx = fx + (rnd() - 0.5) * 30, cz = fz + 40; for (let k = 0; k < 16; k++) { const a = k / 16 * TAU; farm.addProp({ id: 'traces', x: cx + Math.cos(a) * 5, y: w.heightAt(cx + Math.cos(a) * 5, cz + Math.sin(a) * 5) + 0.01, z: cz + Math.sin(a) * 5, r: a + Math.PI / 2 }); } break; }
      case 'lettre': farm.mail('?', 'Une lettre sans timbre', STRANGE_LETTERS[(rnd() * STRANGE_LETTERS.length) | 0], { strange: true }); break;
      case 'corbeaux': { const cx = (fm.field.x0 + fm.field.x1) / 2, cz = (fm.field.z0 + fm.field.z1) / 2; for (let k = 0; k < 9; k++) { const a = k / 9 * TAU; const e = entities.add(w, 'crow', cx + Math.cos(a) * 3, cz + Math.sin(a) * 3, { still: true }); e.heading = a + Math.PI; e.baseY = w.heightAt(e.x, e.z); e.y = e.baseY; e.circle = 60; } break; }
      case 'follets': { const L = w.lm.marais; if (L) for (let k = 0; k < 5; k++) this.ents.push({ kind: 'wisp', x: L.x + (rnd() - 0.5) * 40, y: w.waterLevel + 0.8, z: L.z + (rnd() - 0.5) * 40, t: rnd() * 10, life: 600 }); break; }
      case 'cerf': this.spawnStag(c); break;
      case 'boite': break; // ancienne boîte à musique (retirée) : parties déjà en cours
      case 'bete': { const a = farm.s.animals.find((q) => !q.dead && q.kind !== 'horse'); if (a) { a.lost = 1; game.syncAnimals(); } break; }
      case 'double': this.spawnDouble(c); break;
      case 'visiteur': this.spawnFigure('visiteur', c); break;
      case 'marche': { const q = farm.propByKind('epouvantail', [fx, fz], 150); if (q) { const B = w.bld.ferme; const k = 0.25; q.x = lerp(q.x, B.out[0], k); q.z = lerp(q.z, B.out[1], k); q.y = w.heightAt(q.x, q.z); q.r = Math.atan2(B.x - q.x, B.z - q.z); removePropCollider(w, q); addPropCollider(w, q); farm.dirtyProps = true; } break; }
      case 'glissement': this.shift(); break;
      case 'carcasse': { const a = rnd() * TAU, x = fx + Math.cos(a) * 28, z = fz + Math.sin(a) * 28; const e = entities.add(w, 'deer', x, z, { corpse: true }); e.dead = true; e.corpse = true; e.state = 'sheltered'; farm.addProp({ id: 'sang', x, y: w.heightAt(x, z) + 0.01, z, r: a }); for (let k = 0; k < 6; k++) { const b = k / 6 * TAU; const cr = entities.add(w, 'crow', x + Math.cos(b) * 2, z + Math.sin(b) * 2, {}); cr.baseY = w.heightAt(cr.x, cr.z); cr.y = cr.baseY; cr.still = true; cr.circle = 120; cr.heading = b + Math.PI; } break; }
      case 'main': { const d = w.doors[w.bld.ferme.door]; if (d) farm.addProp({ id: 'sang', x: d.x - Math.sin(d.r) * 0.3, y: w.heightAt(d.x, d.z) + 0.01, z: d.z - Math.cos(d.r) * 0.3, r: d.r }); break; }
      case 'arret': this.freezeT = 9; sound.silence && sound.silence(9); break;
      case 'voix': if (game.sky.mist > 0.2 || weather.cur.fog > 0.4 || rnd() < 0.5) { sound.whisper && sound.whisper(rnd() * 2 - 1, 0.7); setTimeout(() => ui.subtitle('???', pick(['… par ici…', '… fermier…', '… ne reste pas là…', '… tu nous entends ?…']), 2.5), 1200); } break;
      case 'masque': this.spawnFigure('masque', c); break;
      case 'faille': this.glitchT = 2.2; sound.glitchSnd && sound.glitchSnd(1); break;
      case 'deuxlunes': this.twoMoons = 60; break;
    }
  },
  bells(n) {
    const w = game.world, p = game.player, T = w.townInfo;
    const d = T ? Math.hypot(p.pos[0] - T.x, p.pos[2] - T.z) : 0;
    const k = clamp(1 - d / 900, 0.05, 1);
    for (let i = 0; i < n; i++) setTimeout(() => sound.bell && sound.bell(k), i * 1700);
  },
  omen(what) { if (what === 'chene') { this.s.t0 += 0.08; this.run('faille', {}); this.s.events.push({ id: 'silhouette', h: 22, done: false }); } },
  // Mise en scène des enquêtes des habitants
  stage(lieu, moment) {
    const w = game.world, p = game.player;
    const map = { moulin: 'flour', ferme: 'wall', eglise: 'bell', pont_sud: 'feet', hameau_abandonne: 'window', lac: 'steeple', vieux_puits: 'name' };
    const k = map[lieu];
    if (k === 'bell') this.bells(13);
    else if (k === 'name') { sound.whisper && sound.whisper(0, 0.9); ui.subtitle('???', (farm.s.fem ? 'Fermière…' : 'Fermier…') + ' Tu es revenu.', 3); }
    else if (k === 'window') { const L = w.lm.hameau_abandonne; this.ents.push({ kind: 'light', x: L.x + 8, y: L.y + 1.5, z: L.z + 5, t: 0, life: 25, c: [1, 0.7, 0.4], r: 6 }); this.spawnFigure('fenetre', {}); }
    else if (k === 'steeple') { const L = w.lm.lac; this.ents.push({ kind: 'steeple', x: L.x, z: L.z, t: 0, life: 40 }); }
    else if (k === 'feet') { for (let i = 0; i < 6; i++) { const x = p.pos[0] + i * 0.8, z = p.pos[2] + 2; farm.addProp({ id: 'traces', x, y: w.heightAt(x, z) + 0.26, z, r: Math.PI / 2 }); } }
    else if (k === 'flour') { for (let i = 0; i < 12; i++) particles.spawn(p.pos[0], p.pos[1] + 0.05, p.pos[2], (Math.random() - 0.5), 0.5, (Math.random() - 0.5), [0.95, 0.93, 0.88, 1], 0.05, 3, 0.5, false); }
    else if (k === 'wall') { sound.knock && sound.knock(3); }
    else this.run('murmure', {});
    this.glitchT = Math.max(this.glitchT, 0.6);
  },

  // ------------------------------------------------------------- entités étranges
  spawnFigure(mode, c) {
    const w = game.world, p = game.player, fm = w.farm;
    let x, z;
    if (mode === 'champ') { x = (fm.field.x0 + fm.field.x1) / 2 + (Math.random() - 0.5) * 10; z = (fm.field.z0 + fm.field.z1) / 2 + (Math.random() - 0.5) * 6; if (Math.hypot(p.pos[0] - x, p.pos[2] - z) > 220) return; }
    else if (mode === 'fenetre') { const L = w.lm.hameau_abandonne; x = L.x + 8; z = L.z + 5; }
    else { const a = Math.random() * TAU, d = mode === 'masque' ? 38 : 20; x = p.pos[0] + Math.sin(a) * d; z = p.pos[2] + Math.cos(a) * d; }
    const look = mode === 'masque' ? KILLER_LOOK : FIGURE_LOOK;
    this.ents.push({ kind: 'figure', mode, x, z, y: w.heightAt(x, z), rig: humanRig(look), t: 0, seenT: 0, life: mode === 'fenetre' ? 25 : 240, heading: 0 });
  },
  spawnDouble(c) {
    const w = game.world, p = game.player;
    const n = npcs.list.find((m) => m.st.alive && m.st.met && !m.vanished && m.dist > 60);
    if (!n) return;
    const a = Math.random() * TAU, x = p.pos[0] + Math.sin(a) * 30, z = p.pos[2] + Math.cos(a) * 30;
    if (w.heightAt(x, z) < w.waterLevel + 0.3) return;
    const look = Object.assign({}, n.look, { face: TL.blankF, held: null });
    this.ents.push({ kind: 'double', x, z, y: w.heightAt(x, z), rig: humanRig(look), t: 0, heading: a, life: 90, of: n, phase: 0, s: n.look.height || 1 });
  },
  spawnStag(c) {
    const w = game.world, p = game.player;
    const tgt = (w.inter || []).find((it) => it.kind === 'dig' && !farm.s.flags['dug_' + it.id] && !it.data.envers && Math.hypot(it.x - p.pos[0], it.z - p.pos[2]) < 500);
    const a = Math.random() * TAU, x = p.pos[0] + Math.sin(a) * 45, z = p.pos[2] + Math.cos(a) * 45;
    const rig = ANIMAL_RIGS.deer(0, true);
    this.ents.push({ kind: 'stag', x, z, y: w.heightAt(x, z), rig, t: 0, heading: 0, life: 300, tgt, phase: 0 });
  },
  ensurePales(c, dt) {
    const S = this.s, p = game.player, w = game.world;
    const n = this.ents.filter((e) => e.kind === 'pale').length, want = S.envers ? 6 : 3;
    // 1,2 fois par seconde (c'était 2 % par image : deux fois moins à 30 images/s qu'à 60)
    if (n < want && Math.random() < (dt ?? 1 / 60) * 1.2) {
      const a = Math.random() * TAU, d = 45 + Math.random() * 30, x = p.pos[0] + Math.sin(a) * d, z = p.pos[2] + Math.cos(a) * d;
      if (w.inside(x, z, 20) && w.heightAt(x, z) > w.waterLevel) this.ents.push({ kind: 'pale', x, z, y: w.heightAt(x, z), rig: paleRig(false), t: 0, heading: 0, life: 1e9 });
    }
    if (!this.ents.some((e) => e.kind === 'veilleur')) {
      const a = Math.random() * TAU, x = p.pos[0] + Math.sin(a) * 200, z = p.pos[2] + Math.cos(a) * 200;
      if (w.inside(x, z, 30)) this.ents.push({ kind: 'veilleur', x, z, y: w.heightAt(x, z), rig: paleRig(true), t: 0, heading: 0, life: 1e9 });
    }
  },
  seen(e, c, y) { // la chose est-elle dans le champ de vision (et non cachée) ?
    const eye = c.eye, f = c.fwd, dx = e.x - eye[0], dy = (y ?? e.y + 1.2) - eye[1], dz = e.z - eye[2], d = Math.hypot(dx, dy, dz) || 1;
    if ((dx * f[0] + dy * f[1] + dz * f[2]) / d < Math.cos(Math.min(1.2, c.fovX * 0.55))) return false;
    if (d > c.fogEnd) return false;
    const w = game.world, bh = w.raycastBlocks(eye, [dx / d, dy / d, dz / d], d);
    return !bh;
  },
  E_light(e, dt) { return e.t < e.life; },
  E_steeple(e, dt) { return e.t < e.life; },
  E_wisp(e, dt, c) {
    const p = game.player, d = Math.hypot(e.x - p.pos[0], e.z - p.pos[2]);
    e.y = game.world.waterLevel + 0.8 + Math.sin(e.t * 1.3) * 0.3;
    if (d < 12) { const a = Math.atan2(e.x - p.pos[0], e.z - p.pos[2]); e.x += Math.sin(a) * dt * 2.5; e.z += Math.cos(a) * dt * 2.5; }
    else { e.x += Math.sin(e.t * 0.3) * dt * 0.6; e.z += Math.cos(e.t * 0.23) * dt * 0.6; }
    return e.t < e.life && c.night > 0.4;
  },
  E_figure(e, dt, c) {
    const p = game.player, d = Math.hypot(e.x - p.pos[0], e.z - p.pos[2]);
    e.heading = Math.atan2(p.pos[0] - e.x, p.pos[2] - e.z);
    const vis = this.seen(e, c);
    if (vis) { e.seenT += dt; this.fear = Math.max(this.fear, clamp(1 - d / 60, 0, 1) * 0.5); }
    // ne bouge que lorsqu'on ne le regarde pas
    if (!vis && e.mode !== 'fenetre' && e.t > 3 && e.lastVis) { const k = Math.min(0.35, 8 / Math.max(d, 1)); e.x = lerp(e.x, p.pos[0], k); e.z = lerp(e.z, p.pos[2], k); e.y = game.world.heightAt(e.x, e.z); }
    e.lastVis = vis;
    if (e.mode === 'masque') { if (d < 20 || e.seenT > 5) { sound.whisper && sound.whisper(0, 0.3); return false; } }
    else if (d < 11 || (vis && e.seenT > 6)) { sound.glitchSnd && sound.glitchSnd(0.3); this.glitchT = 0.25; return false; }
    game.dogAlarm(e);
    return e.t < e.life && (c.night > 0.3 || e.mode === 'fenetre');
  },
  E_double(e, dt, c) {
    const p = game.player, d = Math.hypot(e.x - p.pos[0], e.z - p.pos[2]);
    const w = game.world;
    e.heading = turnToward(e.heading, Math.atan2(e.x - p.pos[0], e.z - p.pos[2]), dt * 2);
    let nx = e.x + Math.sin(e.heading) * 1.3 * dt, nz = e.z + Math.cos(e.heading) * 1.3 * dt;
    [nx, nz] = w.collideCircle(nx, nz, e.y, e.y + 1.7, 0.28, 0.5, true);
    e.x = nx; e.z = nz; e.y = w.groundAt(nx, nz, e.y + 0.6, 0.6); e.phase += dt * 3.2;
    const vis = this.seen(e, c);
    e.unseen = vis ? 0 : (e.unseen || 0) + dt;
    if (d < 9 || e.unseen > 5) return false;
    return e.t < e.life;
  },
  E_stag(e, dt, c) {
    const p = game.player, w = game.world, d = Math.hypot(e.x - p.pos[0], e.z - p.pos[2]);
    let tx, tz;
    if (e.tgt) { tx = e.tgt.x; tz = e.tgt.z; } else { tx = e.x + Math.sin(e.heading) * 10; tz = e.z + Math.cos(e.heading) * 10; }
    const speed = d < 25 ? 2.4 : d > 40 ? 0 : 1.2;
    e.heading = turnToward(e.heading, speed ? Math.atan2(tx - e.x, tz - e.z) : Math.atan2(p.pos[0] - e.x, p.pos[2] - e.z), dt * 2);
    e.x += Math.sin(e.heading) * speed * dt; e.z += Math.cos(e.heading) * speed * dt; e.y = w.heightAt(e.x, e.z);
    e.move = speed ? 1 : 0; e.phase += dt * speed * 2.2;
    if (e.tgt && Math.hypot(e.x - tx, e.z - tz) < 3 && d < 25) { this.glitchT = 0.3; return false; }
    return e.t < e.life && d < 160;
  },
  E_pale(e, dt, c) {
    const p = game.player, w = game.world, d = Math.hypot(e.x - p.pos[0], e.z - p.pos[2]);
    e.heading = Math.atan2(p.pos[0] - e.x, p.pos[2] - e.z);
    const vis = this.seen(e, c);
    if (!vis && !c.insideAny) { const sp = (this.s.envers ? 3.4 : 2.6) * (farm.s.inv.amulette ? 0.6 : 1) * (BUFF.on('silence') || BUFF.on('cierge') || BUFF.on('grace') ? 0.45 : 1); e.x += Math.sin(e.heading) * sp * dt; e.z += Math.cos(e.heading) * sp * dt; e.y = w.heightAt(e.x, e.z); }
    this.fear = Math.max(this.fear, clamp(1 - d / 25, 0, 1));
    if (d < 1.3 && !c.insideAny) { play.hurt(dt * 60, e, 'Emporté par les Pâles'); }
    if (!this.redNight() && !this.s.envers) return false;
    return d < 140;
  },
  E_veilleur(e, dt, c) {
    const p = game.player, d = Math.hypot(e.x - p.pos[0], e.z - p.pos[2]);
    e.heading = Math.atan2(p.pos[0] - e.x, p.pos[2] - e.z);
    if (d < 70) { const a = Math.random() * TAU; e.x = p.pos[0] + Math.sin(a) * 210; e.z = p.pos[2] + Math.cos(a) * 210; e.y = game.world.heightAt(e.x, e.z); }
    return this.redNight() || this.s.envers;
  },

  // ------------------------------------------------------------- le tueur masqué
  updateKiller(dt, c) {
    const S = this.s, h = npcs.hour(), w = game.world, p = game.player;
    const active = this.killerActive() && !S.red && !S.envers && (h >= 22.8 || h < 4.4);
    const n = npcs.byId[S.killer];
    if (!n || !n.st.alive) return;
    if (active && !this.killerE && !n.hunting) {
      n.hunting = true;
      const B = w.bld[n.d.home];
      const dr = w.doors[B.door];
      if (dr) { dr.locked = false; dr.open = 1; }
      this.killerE = { kind: 'killer', x: B.out[0], z: B.out[1], y: w.heightAt(B.out[0], B.out[1]), rig: humanRig(KILLER_LOOK), t: 0, heading: 0, hp: 120, state: 'roam', tgt: null, lostT: 0, atkT: 0, phase: 0, life: 1e9, n,
        hunt: Math.random() < 0.55 + this.tension() * 0.3, lastWarp: -20 };
      this.ents.push(this.killerE);
      this.killerNight = true;
    }
    if (!active && this.killerE && (h >= 4.4 && h < 12)) { // l'aube : il rentre
      const E = this.killerE; this.ents.splice(this.ents.indexOf(E), 1); this.killerE = null;
      n.hunting = false; npcs.snap(w);
    }
  },
  E_killer(e, dt, c) {
    const w = game.world, p = game.player, S = this.s;
    const dx = p.pos[0] - e.x, dz = p.pos[2] - e.z, d = Math.hypot(dx, dz);
    e.atkT = Math.max(0, e.atkT - dt); e.stagger = Math.max(0, (e.stagger || 0) - dt);
    // il rôde : loin des yeux, il se rapproche sans qu'on le voie
    if (e.hunt && d > 130 && e.state !== 'chase' && e.t - e.lastWarp > 18) {
      e.lastWarp = e.t;
      for (let k = 0; k < 20; k++) {
        const a = p.yaw + (Math.random() < 0.5 ? 1 : -1) * (1.4 + Math.random() * 1.6), r = 70 + Math.random() * 35;
        const x = p.pos[0] - Math.sin(a) * r, z = p.pos[2] - Math.cos(a) * r;
        if (!w.inside(x, z, 20) || w.heightAt(x, z) < w.waterLevel + 0.3) continue;
        e.x = x; e.z = z; e.y = w.heightAt(x, z); e.tgt = null; break;
      }
    }
    if (!e.hunt && d > 60) return true;
    game.dogAlarm(e);
    // perception : la lanterne attire l'œil, s'accroupir rend discret, l'intérieur protège
    const hidden = c.insideAny && c.doorsShut;
    let sight = c.night > 0.5 ? 26 : 45;
    if (c.lantern) sight *= 1.9;
    if (p.crouch > 0.5) sight *= 0.5;
    let hear = p.sprinting ? 20 : 6;
    if (BUFF.on('silence') || BUFF.on('pacte_nuit')) { sight *= 0.25; hear *= 0.3; }
    const canSee = !hidden && d < sight && this.los(e, p) || (!hidden && d < hear);
    if (canSee) { e.state = 'chase'; e.lastX = p.pos[0]; e.lastZ = p.pos[2]; e.lostT = 0; }
    else if (e.state === 'chase') { e.lostT += dt; if (e.lostT > 7) { e.state = 'search'; e.tgt = [e.lastX, e.lastZ]; } }
    let tx, tz, sp = 1.5;
    if (e.state === 'chase') { tx = p.pos[0]; tz = p.pos[2]; sp = 7.0; this.fear = Math.max(this.fear, clamp(1 - d / 30, 0.3, 1)); }
    else if (e.state === 'search') { [tx, tz] = e.tgt; sp = 2.6; if (Math.hypot(tx - e.x, tz - e.z) < 2) { e.state = 'roam'; e.tgt = null; } }
    else {
      if (!e.tgt || Math.hypot(e.tgt[0] - e.x, e.tgt[1] - e.z) < 3) {
        const fm = w.farm, B = w.bld.ferme;
        const opts = [[B.out[0], B.out[1]], [(fm.field.x0 + fm.field.x1) / 2, (fm.field.z0 + fm.field.z1) / 2], [p.pos[0] + (Math.random() - 0.5) * 60, p.pos[2] + (Math.random() - 0.5) * 60]];
        e.tgt = opts[(Math.random() * opts.length) | 0];
      }
      [tx, tz] = e.tgt;
      if (d < 50) this.fear = Math.max(this.fear, 0.25);
    }
    // à la porte de la ferme : essaie d'entrer
    const fdoor = w.doors[w.bld.ferme.door];
    if (fdoor && Math.hypot(fdoor.x - e.x, fdoor.z - e.z) < 2.2 && c.insideFarm) {
      if (fdoor.locked || BUFF.on('grace')) { e.doorT = (e.doorT || 0) + dt; if (e.doorT > 1.5) { e.doorT = -4 - Math.random() * 4; sound.knock && sound.knock(Math.random() < 0.5 ? 3 : 1); if (Math.random() < 0.3) sound.scratch && sound.scratch(); } if (Math.random() < dt * 0.05) { e.state = 'roam'; e.tgt = null; } }
      else { fdoor.open = 1; }
    }
    if (e.stagger > 0) sp = 0;
    const dd = Math.hypot(tx - e.x, tz - e.z);
    if (dd > 0.8 && sp > 0) {
      e.heading = turnToward(e.heading, Math.atan2(tx - e.x, tz - e.z), dt * 6);
      let nx = e.x + Math.sin(e.heading) * sp * dt, nz = e.z + Math.cos(e.heading) * sp * dt;
      [nx, nz] = w.collideCircle(nx, nz, e.y, e.y + 1.8, 0.3, 0.55, true);
      if (Math.hypot(nx - e.x, nz - e.z) < sp * dt * 0.2 && e.state === 'chase') e.stuckT = (e.stuckT || 0) + dt;
      e.x = nx; e.z = nz; e.y = w.groundAt(nx, nz, e.y + 0.6, 0.6);
      e.move = 1; e.run = sp > 3; e.phase += dt * sp * 2.2;
    } else e.move = 0;
    if (e.state === 'chase') { e.stepT = (e.stepT || 0) - dt; if (e.stepT <= 0) { e.stepT = 0.36; sound.steps1 && sound.steps1(clamp(1 - d / 30, 0, 1), (e.x - p.pos[0]) * c.right[0] + (e.z - p.pos[2]) * c.right[2]); } }
    if (d < 1.5 && e.atkT <= 0 && !hidden && e.stagger <= 0) { e.atkT = 1.3; e.attackAnim = 0.5; sound.stab && sound.stab(); play.hurt(52, e, 'Assassiné par l’homme au masque'); }
    e.attackAnim = Math.max(0, (e.attackAnim || 0) - dt);
    return true;
  },
  los(e, p) {
    const w = game.world, eye = p.eyePos(), o = [e.x, e.y + 1.6, e.z];
    const dx = eye[0] - o[0], dy = eye[1] - o[1], dz = eye[2] - o[2], d = Math.hypot(dx, dy, dz) || 1;
    return !w.raycastBlocks(o, [dx / d, dy / d, dz / d], d);
  },
  hit(e, dmg, from) {
    if (e.kind === 'killer') {
      e.hp -= dmg; e.stagger = 0.6; sound.hurtHuman && sound.hurtHuman(0.8);
      puffAt(e.x, e.y + 1.2, e.z, [140, 20, 20], 8, 1.5, false);
      if (e.hp <= 0) { this.killerDead(e.n, false, e); return; }
      if (e.hp < 60 && Math.random() < 0.5) { e.state = 'search'; e.tgt = [e.x + (e.x - game.player.pos[0]) * 5, e.z + (e.z - game.player.pos[2]) * 5]; }
      return;
    }
    if (e.kind === 'pale' || e.kind === 'figure' || e.kind === 'double' || e.kind === 'stag') {
      this.glitchT = 0.4; sound.glitchSnd && sound.glitchSnd(0.5); e.life = 0; e.t = 1e9;
      if (e.kind === 'pale' && !e.dropped && Math.random() < 0.5) { e.dropped = true; farm.give('eclat', 1); play.flyer('eclat', [e.x, e.y + 1, e.z], 1); }
    }
  },
  // Mort du tueur (tué masqué la nuit : légitime défense ; ou démasqué autrement)
  killerDead(n, byPlayerAsNpc, ent) {
    const S = this.s, w = game.world;
    if (S.kDead) return;
    S.kDead = true;
    if (ent) {
      this.ents.splice(this.ents.indexOf(ent), 1); this.killerE = null;
      n.hunting = false;
      n.x = ent.x; n.z = ent.z; n.y = ent.y;
      npcs.kill(n, 'masque', []);
      n.look = Object.assign({}, n.look, {}); n.rig = humanRig(Object.assign({}, KILLER_LOOK, { face: n.look.face }));
      farm.s.rep.hero += 3;
      farm.s.flags.killerRevealed = n.id;
      sound.scream && sound.scream(0.8);
    }
    for (const m of npcs.list) if (m.st.alive) npcs.addAmitie(m, 60);
  },
  accuse(id, n) {
    const S = this.s, m = npcs.byId[id];
    if (!m) return '…';
    if (id === S.killer) {
      if (farm.count('masque') || S.victims.length >= 2 && npcs.level(n) >= 3) {
        S.kCaught = true; m.st.alive = false; m.st.gone = 'prison'; m.state = 'gone';
        farm.take('masque', 1); farm.s.rep.hero += 4; farm.s.flags.killerRevealed = id;
        for (const q of npcs.list) if (q.st.alive) npcs.addAmitie(q, 80);
        return fmtLine(`${m.name}… Mon Dieu. Avec ce que vous m’apportez, je n’ai plus le choix. Je le fais emmener à la préfecture ce soir même. La vallée vous doit une fière chandelle.`, n);
      }
      npcs.addAmitie(n, -10);
      return 'Ce sont de graves accusations. Sans preuve, je ne peux rien faire. Revenez quand vous aurez quelque chose de concret.';
    }
    npcs.addAmitie(n, -60); npcs.addAmitie(m, -150); npcs.remember(m, 'accuse');
    return fmtLine(`Vous accusez ${m.name} ? Sans la moindre preuve ? Faites attention à ce que vous dites : ici, tout finit par se savoir.`, n);
  },

  // ------------------------------------------------------------- l'Envers
  setEnvers(on, silent) {
    const S = this.s, w = game.world;
    S.envers = on; w.envers = on;
    this.applyVersion();
    npcs.vanishAll(on || S.red);
    this.ents = this.ents.filter((e) => e.kind !== 'pale' && e.kind !== 'veilleur');
    game.syncAnimals();
    if (!silent) { sound.enversShift && sound.enversShift(on); this.glitchT = 1.2; }
  },
  fishingSpot(eye, dir) {
    if (this.s && this.s.envers) { const w = game.world, th = w.raycastTerrain(eye, dir, 16); if (th && th.y < w.waterLevel) return { x: th.x, y: w.waterLevel, z: th.z, kind: 'envers' }; }
    const pool = game.world.minePool;
    if (pool && Math.hypot(eye[0] - pool.x, eye[2] - pool.z) < 14) {
      const t = (pool.y - eye[1]) / (dir[1] || -1e-3);
      if (t > 0 && t < 14) { const x = eye[0] + dir[0] * t, z = eye[2] + dir[2] * t; if (Math.abs(x - pool.x) < pool.w / 2 && Math.abs(z - pool.z) < pool.d / 2) return { x, y: pool.y, z, kind: 'mine' }; }
    }
    return null;
  },

  // ------------------------------------------------------------- rendu et visée
  draw(buf, sbuf, cam, t) {
    for (const e of this.ents) {
      if (!e.rig) {
        if (e.kind === 'wisp') { PE.buf = buf; PE.frame(e.x, e.y, e.z, e.t, 1); PE.fl = FX_EMIT; PE.box(0, 0, 0, 0.18, 0.18, 0.18, [0.6, 1.2, 1.5], 0, t * 2, t); PE.fl = 0; }
        if (e.kind === 'steeple') { PE.buf = buf; const w = game.world; PE.frame(e.x, w.waterLevel - 6, e.z, 0, 1); PE.bx(0, 0, 0, 3, 9, 3, WHITE, mt(M_MOSSY)); PE.bx(0, 9, 0, 3.4, 5, 3.4, WHITE, mt(M_SLATE), 0.78); PE.fl = FX_EMIT; PE.bx(0, 6, 1.52, 0.8, 1.2, 0.05, [1.2, 0.9, 0.5], 0); PE.fl = 0; }
        continue;
      }
      const r = e.rig;
      if (r.kind === 'quad') poseQuad(r, { move: e.move || 0, phase: e.phase || 0, t, lookY: 0 });
      else if (e.kind === 'pale' || e.kind === 'veilleur') poseHuman(r, { move: 0, t, pale: true, lookY: 0, tilt: Math.sin(e.t * 0.7) * 0.15 });
      else poseHuman(r, { move: e.move ?? (e.kind === 'double' ? 1 : 0), phase: e.phase || 0, run: e.run, t, attack: e.attackAnim > 0 ? e.attackAnim / 0.5 : 0, lookY: 0 });
      drawRig(buf, r, e.x, e.y, e.z, e.heading, e.s || 1, e.stagger > 0 ? FX_HI : 0);
      if (sbuf && e.kind !== 'veilleur') drawShadow(sbuf, e.x, e.y, e.z, 0.32);
    }
  },
  lights(eye) {
    const L = [];
    for (const e of this.ents) {
      if (e.kind === 'light') L.push({ x: e.x, y: e.y, z: e.z, r: e.r, c: v3.scale(e.c, 1 + Math.sin(e.t * 9) * 0.15), d: Math.hypot(e.x - eye[0], e.z - eye[2]) });
      if (e.kind === 'wisp') L.push({ x: e.x, y: e.y, z: e.z, r: 7, c: [0.3, 0.8, 1.0], d: Math.hypot(e.x - eye[0], e.z - eye[2]) });
    }
    return L;
  },
  raycast(o, d, maxDist) {
    let best = null;
    const dh = Math.hypot(d[0], d[2]) || 1e-6;
    for (const e of this.ents) {
      if (!e.rig || e.kind === 'veilleur') continue;
      const cx = e.x - o[0], cz = e.z - o[2];
      const tc = (cx * d[0] + cz * d[2]) / (dh * dh);
      if (tc < 0 || tc > maxDist) continue;
      const px = d[0] * tc - cx, pz = d[2] * tc - cz;
      if (px * px + pz * pz > 0.4 * 0.4) continue;
      const y = o[1] + d[1] * tc;
      if (y < e.y - 0.1 || y > e.y + 2.2) continue;
      if (!best || tc < best.t) best = { t: tc, s: e, p: [o[0] + d[0] * tc, y, o[2] + d[2] * tc] };
    }
    return best;
  },
  // effets d'écran
  fx() {
    const S = this.s, g = this.glitchT > 0 ? Math.min(1, this.glitchT) : 0;
    return {
      glitch: g ? [g * 0.8, g, g * 0.6, g > 0.9 ? 0.2 : 0] : [0, 0, 0, 0],
      red: this.redK, envers: this.enversK,
    };
  },
};
