// ============================================================================
//  LA VALLÉE VIVANTE
//  - crues : quand il pleut longtemps, l'eau monte (prés du bas, berges, marais),
//    noie les cultures trop basses, fait flotter les barques, puis se retire ;
//  - orages : la foudre frappe les grands arbres (ils restent foudroyés) ; les
//    jours de canicule, un « orage sec » peut éclater en fin d'après-midi ;
//  - incendies : le feu prend dans un arbre frappé, gagne ses voisins (le vent le
//    pousse), s'arrête aux prés, aux chemins, à l'eau, sous la pluie ou sous
//    l'arrosoir ; il reste des troncs noircis ;
//  - montagne : il y neige ; il y fait froid (la faim vient plus vite ; la nuit ou
//    sous la neige, sans feu ni toit, le froid tue) ; on tombe dans les crevasses ;
//  - les signes à relever (carnet dans l'onglet Légendes), le refuge du col, la
//    pêche dans le trou de glace, les textes laissés çà et là, les fruits des
//    nouveaux arbres, les restes au fond des crevasses (une seule fouille).
// ============================================================================
WEATHER_PRESETS.dry = { cloud: 0.85, rain: 0.03, storm: 1, fog: 0.04, frost: 0, heat: 0.4 };
WEATHER_NAMES.dry = 'Orage sec'; WEATHER_ICONS.dry = '⚡'; DAY_KIND.dry = 'orage';
{
  const _plan = weather.dayPlan.bind(weather);
  // les jours de canicule, parfois, un orage sec (tirage à part : le reste du programme ne change pas)
  weather.dayPlan = function (seed, day) {
    const P = _plan(seed, day);
    if (P.heat && day > 2) {
      const r = mulberry32(seed * 17 + day * 31);
      if (r() < 0.4) { const h = 15 + r() * 3; P.plan.push([h, 'dry'], [h + 1.5 + r() * 1.5, 'cloudy']); P.plan.sort((a, b) => a[0] - b[0]); P.storm = true; P.dry = true; }
    }
    return P;
  };
}
// ce qui brûle (le chêne millénaire, lui, ne brûle pas)
const FLAMMABLE = new Set(['oak', 'pine', 'birch', 'apple', 'deadtree', 'bush', 'berry', 'fern', 'tallgrass', 'heather', 'lavender', 'hetre', 'chataignier', 'noyer', 'saule', 'peuplier',
  'sapin', 'meleze', 'if', 'tilleul', 'erable', 'cerisier', 'poirier', 'prunier', 'aulne', 'houx', 'foudroye', 'eglantier', 'sureau']);
const STRIKE_TREES = new Set(['oak', 'pine', 'birch', 'apple', 'hetre', 'chataignier', 'noyer', 'peuplier', 'sapin', 'meleze', 'tilleul', 'erable', 'saule', 'aulne', 'sapin_neige', 'deadtree']);

// ---------------------------------------------------------------- les signes
const SIGIL_TEXT = {
  mere: { titre: 'Le signe de la Mère', faith: 'anciens', texte: 'Un cercle posé sur une croix. On le trouve au bord des champs, sur les linteaux des granges, au fond des pétrins. C’est la Mère qui donne et qui reprend : on lui laisse la première gerbe, et on ne lui prend jamais la dernière.' },
  dame: { titre: 'Le croissant de la Dame', faith: 'anciens', texte: 'Une lune couchée au-dessus de deux vagues. La Dame du lac garde ce qui tombe dans l’eau : les bagues, les serments, les noyés. Les nuits où la lune a cette forme-là, on ne se baigne pas.' },
  cerf: { titre: 'Les bois du Cerf', faith: 'anciens', texte: 'Des bois de cerf, et entre eux une petite lumière. Le Cerf blanc marche entre les mondes. Ceux qui l’ont vu ne chassent plus jamais ; on ne sait pas s’ils ne veulent plus, ou s’ils ne peuvent plus.' },
  dessous: { titre: 'Le signe de ceux d’en dessous', faith: 'dessous', texte: 'Une ligne, et sous la ligne un triangle renversé qui prend racine. Ce qui est sous la terre n’est pas mort, dit ce signe : cela attend. On le grave là où l’on a creusé trop profond.' },
  croix: { titre: 'La croix cerclée', faith: 'eglise', texte: 'Une croix dans un anneau, comme on en taillait avant les églises de pierre. Le curé dit que c’est une croix comme les autres. L’anneau, lui, est bien plus vieux que la croix.' },
  treize: { titre: 'Les Treize', faith: 'dessous', texte: 'Treize traits autour d’un cercle, et une pierre au milieu. Ils étaient treize à monter au col, une nuit d’hiver ; il en est redescendu douze. Le treizième est resté là-haut, pour garder le passage. On ne sait plus de quoi.' },
  soleil: { titre: 'Le soleil des moissons', faith: 'anciens', texte: 'Un soleil à huit rayons. On le traçait au seuil des maisons à la Saint-Jean, pour que la lumière ne s’en aille pas. Les jours raccourcissent quand même, mais on n’y pense plus.' },
  spirale: { titre: 'La spirale', faith: 'dessous', texte: 'Une spirale de trois tours, qui ne commence nulle part. Personne ne se souvient de la religion qui la traçait. Sur le glacier, quelqu’un la refait chaque hiver, et personne ne l’a jamais vu faire.' },
  main: { titre: 'La main ouverte', faith: null, texte: 'Une main aux doigts serrés, peinte à l’ocre. Les mineurs la peignaient pour dire « par ici, la sortie » : les doigts montrent le chemin. Les plus vieilles, dit-on, sont plus anciennes que la mine elle-même.' },
  corne: { titre: 'Les cornes', faith: 'anciens', texte: 'Un croissant de cornes posé sur un cercle. Le Cornu des bois, le maître des bêtes : on lui doit une bête sur dix, et le silence en forêt.' },
  noeud: { titre: 'Le nœud sans fin', faith: 'dessous', texte: 'Trois boucles prises dans un cercle, sans début ni fin. Ceux qui le gravent se disent « liés » : liés entre eux, liés à la vallée, liés même après la mort. On ne sait pas s’il faut s’en réjouir.' },
  oeil: { titre: 'L’œil', faith: 'dessous', texte: 'Un œil ouvert, qui pleure trois larmes. Il ne dort jamais, disent ceux qui le tracent. Quand on le trouve dans un endroit désert, on a pourtant l’impression d’être regardé.' },
};

const vallee = {
  rainK: 0, snowK: 0, burning: new Map(), fire: null, bolts: [], boltCD: 0, prevFlash: 0, spreadT: 0, burnAcc: 0, coldAcc: 0, coldMsg: 0,
  fish: null, fireNear: 0, firePan: 0, floaters: [], lastFloat: null, hooked: false,
  st() { const s = farm.s; if (!s.vallee) s.vallee = { char: {}, sigils: {}, flood: 0, peak: 0 }; return s.vallee; },
  base(w) { return w.baseWater ?? w.waterLevel; },

  // ------------------------------------------------------------ partie chargée
  load() {
    const w = game.world, V = this.st();
    w.baseWater = w.waterLevel;
    this.burning.clear(); this.fire = null; this.bolts.length = 0; this.fish = null; this.lastFloat = null;
    for (const k in V.char) { const o = w.objects[+k]; if (o && !o.gone) o.t = OBJ_INDEX.foudroye; }
    this.floaters = w.props.filter((p) => p.id === 'barque' && Math.abs(p.y - w.waterLevel) < 0.4).map((p) => ({ p, dy: p.y - w.waterLevel }));
    this.applyWater();
    w.objectsDirty = true;
    this.hookOnce();
  },
  applyWater() {
    const w = game.world, lvl = this.base(w) + this.st().flood;
    w.waterLevel = lvl;
    if (this.lastFloat === null || Math.abs(lvl - this.lastFloat) > 0.04) {
      this.lastFloat = lvl;
      for (const f of this.floaters) { f.p.y = lvl + f.dy; if (f.p.blk) f.p.blk.y = f.p.y; }
      if (this.floaters.length) farm.dirtyProps = true;
    }
  },

  // ------------------------------------------------------------ crues (au fil des heures)
  floodTick(dtH) {
    const V = this.st(), w = game.world, c = weather.cur, prev = V.flood;
    if (!w || strange.inEnvers()) return;
    const tgt = c.rain > 0.5 ? (c.storm > 0.5 ? 1.1 : 0.55) : 0;
    // l'eau déborde après quatre heures de pluie, ou une heure et demie d'orage (une averse ne suffit plus)
    if (V.flood < tgt) V.flood = Math.min(tgt, V.flood + dtH * (c.storm > 0.5 ? 0.2 : 0.08));
    else if (V.flood > tgt) V.flood = Math.max(tgt, V.flood - dtH * (c.rain > 0.3 ? 0.03 : 0.1));
    if (V.flood > 0.05) { // cultures noyées
      const lvl = this.base(w) + V.flood;
      for (const k in farm.s.crops) {
        const cr = farm.s.crops[k];
        if (!cr.c || cr.dead || cr.tree) continue;
        const i = k.indexOf(','), x = +k.slice(0, i) + 0.5, z = +k.slice(i + 1) + 0.5;
        if (w.heightAt(x, z) < lvl - 0.05) { cr.drown = (cr.drown || 0) + dtH; if (cr.drown > 3) { cr.dead = true; farm.dirtyProps = true; } }
      }
    }
    if (prev < 0.3 && V.flood >= 0.3 && !game.player.underground) ui.subtitle('', '(L’eau monte : la rivière et les lacs débordent sur les prés du bas.)', 4.5);
    if (prev > 0.12 && V.flood <= 0.12 && V.peak > 0.3 && !game.player.underground) ui.subtitle('', '(La crue se retire des prés. Il reste de la boue et des herbes couchées.)', 4.5);
    V.peak = V.flood > 0.12 ? Math.max(V.peak || 0, V.flood) : 0;
  },

  // ------------------------------------------------------------ chaque image
  update(dt, eye, basis, sky) {
    const w = game.world, p = game.player, c = weather.cur, s = farm.s;
    this.applyWater();
    // pluie ou neige (en altitude, dans la grande vallée)
    const alt = eye[1] - this.base(w), sl = (w.snowLine || 1e4) - this.base(w);
    const a = w.designed && !p.underground ? smoothstep(sl - 26, sl - 2, alt) : 0;
    this.snowK = Math.max(c.rain * a, a * (0.42 * clamp((c.cloud - 0.55) * 2.5, 0, 1) + c.fog * 0.3));
    this.rainK = c.rain * (1 - a);
    // la foudre
    this.boltCD -= dt;
    if (weather.flash > this.prevFlash + 0.3 && c.storm > 0.5 && this.boltCD <= 0) { this.boltCD = 1.5; this.onBolt(); }
    this.prevFlash = weather.flash;
    for (const b of this.bolts) b.t -= dt;
    this.bolts = this.bolts.filter((b) => b.t > 0);
    // le feu
    this.fireUpdate(dt, eye, basis);
    // le froid, là-haut
    if (w.designed && alt > sl - 4 && !p.underground && !strange.inEnvers()) {
      p.food = Math.max(0, p.food - dt / w.dayLength * CORPS_JOUR.faim); // la faim vient deux fois plus vite
      const inside = w.covered(eye[0], eye[1], eye[2]), warm = inside || game.nearFire(p.pos) || this.fireNear > 0.6;
      if ((sky.night > 0.5 || (this.snowK > 0.35 && alt > sl + 25)) && !warm) {
        this.coldAcc += dt;
        if (!this.coldMsg) { this.coldMsg = 1; ui.subtitle('', '(Le froid vous mord les doigts. Il faudrait du feu, ou un toit.)', 4.5); }
        // 2 PV toutes les 4 s : 25 PV par heure de jeu, quatre heures sans feu ni toit pour en mourir
        if (this.coldAcc > 4) { this.coldAcc = 0; const pn = strange.placeName(p.pos); play.hurt(2, null, 'Mort de froid' + (pn ? ' — ' + pn : ' en montagne')); }
      } else this.coldAcc = 0;
    } else { this.coldMsg = 0; this.coldAcc = 0; }
    // pêche sous la glace
    const F = this.fish;
    if (F) {
      if (Math.hypot(F.it.x - p.pos[0], F.it.z - p.pos[2]) > 6) this.fish = null;
      else if (F.bite > 0) { F.bite -= dt; if (F.bite <= 0) { this.fish = null; ui.subtitle('', '(Il s’est décroché.)', 2); } }
      else { F.t -= dt; if (F.t <= 0) { F.bite = 1.4; sound.bite && sound.bite(); ui.subtitle('', '(Ça mord ! Vite !)', 1.4); } }
    }
  },

  // ------------------------------------------------------------ foudre
  onBolt() {
    const w = game.world, p = game.player;
    if (p.underground || strange.inEnvers() || Math.random() > (weather.state === 'dry' ? 0.35 : 0.13)) return;
    let best = null, bs = -1;
    w.query(p.pos[0], p.pos[2], 170, (o, i) => {
      if (!o || o.gone || o.cleared || this.burning.has(i)) return;
      const T = OBJ_TYPES[o.t];
      if (!T || !STRIKE_TREES.has(T.id) || o.h < 7) return;
      const d = Math.hypot(o.x - p.pos[0], o.z - p.pos[2]);
      if (d < 14 || d > 170) return;
      const sc = (w.heightAt(o.x, o.z) + o.h) * (0.6 + Math.random() * 0.8);
      if (sc > bs) { bs = sc; best = [o, i]; }
    }, null);
    if (best) this.strike(best[0], best[1]);
  },
  strike(o, i) {
    const w = game.world, V = this.st(), top = w.objectY(o) + o.h, p = game.player, d = Math.hypot(o.x - p.pos[0], o.z - p.pos[2]);
    this.bolts.push({ x: o.x, z: o.z, y0: top, t: 0.42, seed: (Math.random() * 1e6) | 0 });
    weather.flash = 1.5;
    sound.thunder(clamp(1.2 - d / 200, 0.5, 1));
    game.shakeT = Math.max(game.shakeT || 0, d < 60 ? 0.6 : 0.25);
    V.char[i] = 1; o.t = OBJ_INDEX.foudroye; w.objectsDirty = true;
    entities.scare(o.x, o.z, 70);
    for (let k = 0; k < 26; k++) particles.spawn(o.x, top - Math.random() * o.h * 0.5, o.z, (Math.random() - 0.5) * 7, Math.random() * 5, (Math.random() - 0.5) * 7, [1, 0.85, 0.45, 1], 0.08, 0.5 + Math.random() * 0.5, 7, true);
    if (Math.random() < (weather.cur.rain < 0.3 ? 0.7 : 0.25)) this.ignite(o, i, true);
  },

  // ------------------------------------------------------------ incendie
  ignite(o, i, first) {
    if (this.burning.has(i) || o.gone) return;
    const T = OBJ_TYPES[o.t], tree = T.cat === 'Arbres';
    const w = game.world, b = { o, i, t: 0, life: tree ? 38 + Math.random() * 34 : 7 + Math.random() * 7, tree, x: o.x, z: o.z, y: w.objectY(o), h: Math.max(0.6, o.h) };
    this.burning.set(i, b);
    game.renderer.objFlag(i, 8);
    if (!this.fire) {
      this.fire = { n: 0, x: o.x, z: o.z };
      const p = game.player;
      if (Math.hypot(o.x - p.pos[0], o.z - p.pos[2]) < 260) setTimeout(() => ui.subtitle('', '(Le feu a pris dans les arbres !)', 3.5), first ? 900 : 0);
    }
    this.fire.n++;
  },
  burnOut(b, doused) {
    const w = game.world, V = this.st(), o = b.o;
    this.burning.delete(b.i);
    game.renderer.objFlag(b.i, 0);
    if (doused && b.t < b.life * 0.35) return; // éteint à temps : l'arbre s'en remettra
    if (b.tree || OBJ_TYPES[o.t].id === 'foudroye') { V.char[b.i] = 1; o.t = OBJ_INDEX.foudroye; }
    else { o.gone = true; o.cleared = true; farm.s.removed[b.i] = 1; }
    this.needRebuild = true; // regroupé : on ne reconstruit pas tous les objets à chaque arbre
  },
  fireUpdate(dt, eye, basis) {
    this.fireNear = 0;
    if (!this.burning.size) {
      if (this.needRebuild) { this.needRebuild = false; game.world.objectsDirty = true; }
      if (this.fire) {
        const p = game.player;
        if (Math.hypot(this.fire.x - p.pos[0], this.fire.z - p.pos[2]) < 450) ui.subtitle('', '(L’incendie s’est éteint. Des troncs noircis fument encore.)', 4.5);
        this.fire = null;
      }
      return;
    }
    const w = game.world, p = game.player, rain = weather.cur.rain, [wx, wz] = weather.rainWind(), wl = Math.hypot(wx, wz);
    if (this.needRebuild && performance.now() - (this.lastRebuild || 0) > 1500) { this.needRebuild = false; this.lastRebuild = performance.now(); w.objectsDirty = true; }
    this.spreadT -= dt;
    const spread = this.spreadT <= 0;
    if (spread) this.spreadT = 0.5;
    const add = [], done = [];
    let nearD = 1e9, nearB = null, hot = false;
    for (const b of this.burning.values()) {
      b.t += dt * (1 + rain * 3);
      if (spread && b.t > 3 && this.fire.n < 120) {
        const pr = 0.17 * (1 - rain * 0.95) * (this.fire.n > 70 ? 0.45 : 1);
        if (pr > 0.004) w.query(b.x, b.z, 7.5, (o, j) => {
          if (!o || o.gone || this.burning.has(j) || this.st().char[j]) return;
          const T = OBJ_TYPES[o.t];
          if (!T || !FLAMMABLE.has(T.id)) return;
          const dx = o.x - b.x, dz = o.z - b.z, d = Math.hypot(dx, dz);
          if (d > 7.5 || d < 0.01) return;
          const wind = wl > 0.3 ? 1 + 0.9 * (dx * wx + dz * wz) / (d * wl) : 1;
          if (Math.random() < pr * wind * (1 - d / 8.5)) add.push([o, j]);
        }, null);
      }
      if (b.t >= b.life) done.push(b);
      const d = Math.hypot(b.x - p.pos[0], b.z - p.pos[2]);
      if (d < nearD) { nearD = d; nearB = b; }
      if (d < (b.tree ? 2.4 : 1.3) && p.pos[1] < b.y + b.h && p.pos[1] > b.y - 1.5) hot = true;
    }
    for (const [o, j] of add) this.ignite(o, j);
    for (const b of done) this.burnOut(b);
    // ça brûle
    this.burnAcc = hot ? this.burnAcc + dt : 0;
    if (this.burnAcc > 0.5) { this.burnAcc = 0; const pn = strange.placeName(p.pos); play.hurt(8, nearB, 'Brûlé vif dans l’incendie' + (pn ? ' — ' + pn : '')); }
    // les bêtes s'enfuient
    if (Math.random() < dt * 0.5 && nearB) entities.scare(nearB.x, nearB.z, 45);
    // bruit du feu
    if (nearB) {
      this.fireNear = clamp(1 - nearD / 50, 0, 1);
      const ang = Math.atan2(nearB.x - eye[0], nearB.z - eye[2]);
      this.firePan = Math.sin(ang - Math.atan2(basis.r[0], basis.r[2]) + Math.PI / 2);
    }
    // flammèches et fumée (les plus proches)
    let n = 0;
    for (const b of this.burning.values()) {
      if (Math.abs(b.x - eye[0]) > 130 || Math.abs(b.z - eye[2]) > 130 || ++n > 30) continue;
      const R = Math.random;
      if (R() < dt * (b.tree ? 11 : 4)) particles.spawn(b.x + (R() - 0.5) * (b.tree ? 2.4 : 0.8), b.y + b.h * (0.25 + R() * 0.7), b.z + (R() - 0.5) * (b.tree ? 2.4 : 0.8), (R() - 0.5) * 0.8 + wx * 0.1, 2 + R() * 2.5, (R() - 0.5) * 0.8 + wz * 0.1, [1, 0.5 + R() * 0.35, 0.12, 1], 0.07, 0.6 + R() * 0.6, -0.6, true);
      if (R() < dt * (b.tree ? 2.2 : 0.8)) { particles.spawn(b.x + (R() - 0.5) * 2, b.y + b.h * 0.9, b.z + (R() - 0.5) * 2, wx * 0.25 + (R() - 0.5) * 0.5, 1.6 + R(), wz * 0.25 + (R() - 0.5) * 0.5, [0.2, 0.19, 0.18, 0.42], 0.6, 5 + R() * 3, -0.04, false); particles.list[particles.list.length - 1].grow = 4; }
    }
  },
  // l'arrosoir sur un arbre qui brûle
  douse(eye, f) {
    if (!this.burning.size) return false;
    const s = farm.s, px = eye[0] + f[0] * 2.4, pz = eye[2] + f[2] * 2.4;
    let best = null, bd = 4.2;
    for (const b of this.burning.values()) { const d = Math.hypot(b.x - px, b.z - pz); if (d < bd) { bd = d; best = b; } }
    if (!best) return false;
    if (s.water <= 0) { sound.click(); ui.subtitle('', '(L’arrosoir est vide. Vite, à l’eau !)', 2.5); play.cool = 0.4; return true; }
    s.water = Math.max(0, s.water - 1);
    play.canTilt = 0.5; play.cool = 0.45;
    sound.pour && sound.pour();
    for (let k = 0; k < 16; k++) particles.spawn(best.x + (Math.random() - 0.5), best.y + 1 + Math.random() * 2, best.z + (Math.random() - 0.5), (Math.random() - 0.5), 1.5 + Math.random(), (Math.random() - 0.5), [0.8, 0.82, 0.85, 0.5], 0.25, 1.2 + Math.random(), -0.3, false);
    best.water = (best.water || 0) + 1;
    if (best.water >= (best.tree ? 2 : 1)) this.burnOut(best, true);
    return true;
  },
  // quand on dort ou s'évanouit : l'incendie finit sans nous
  endFire() { for (const b of [...this.burning.values()]) this.burnOut(b); this.fire = null; },

  // ------------------------------------------------------------ dessin : éclairs et flammes
  draw(buf, cam, t) {
    if (!this.bolts.length && !this.burning.size) return;
    PE.buf = buf;
    PE.fl = FX_EMIT;
    for (const b of this.bolts) {
      if (Math.floor(b.t * 20) % 3 === 1) continue; // l'éclair vacille
      const rnd = mulberry32(b.seed), segs = 16, H = 110;
      PE.frame(0, 0, 0, 0, 1);
      let px = b.x + (rnd() - 0.5) * 34, pz = b.z + (rnd() - 0.5) * 34, py = b.y0 + H;
      for (let k = 1; k <= segs; k++) {
        const f = k / segs, j = (1 - f) * 8;
        const nx = k === segs ? b.x : lerp(px, b.x, 1 / (segs - k + 1)) + (rnd() - 0.5) * j, nz = k === segs ? b.z : lerp(pz, b.z, 1 / (segs - k + 1)) + (rnd() - 0.5) * j, ny = b.y0 + H * (1 - f);
        const dx = nx - px, dy = ny - py, dz = nz - pz, L = Math.hypot(dx, dy, dz);
        PE.box((px + nx) / 2, (py + ny) / 2, (pz + nz) / 2, 0.32, 0.32, L + 0.2, [2.4, 2.4, 2.8], TL.plain, Math.atan2(dx, dz), -Math.atan2(dy, Math.hypot(dx, dz)));
        if (k > 3 && k < segs - 2 && rnd() < 0.25) { const L2 = 4 + rnd() * 6, a = rnd() * TAU; PE.box(nx + Math.sin(a) * L2 / 2, ny - L2 * 0.3, nz + Math.cos(a) * L2 / 2, 0.18, 0.18, L2, [2, 2, 2.4], TL.plain, a, 0.5); }
        px = nx; py = ny; pz = nz;
      }
    }
    const L = [];
    for (const b of this.burning.values()) { const d = Math.hypot(b.x - cam[0], b.z - cam[2]); if (d < 170) L.push([d, b]); }
    L.sort((a, b) => a[0] - b[0]);
    // langues de feu : chacune monte en rétrécissant, jaune puis orange puis rouge, et recommence
    for (let q = 0; q < Math.min(45, L.length); q++) {
      const b = L[q][1], k = clamp(b.t / 4, 0.25, 1) * clamp((b.life - b.t) / 6, 0.2, 1), n = b.tree ? 12 : 4, R = b.tree ? 1.6 : 0.45;
      // du côté de la caméra : devant le feuillage (les arbres sont des images plates)
      const dd = L[q][0] || 1, off = b.tree ? Math.min(b.h * 0.28, dd * 0.5) : 0;
      PE.frame(b.x + (cam[0] - b.x) / dd * off, b.y, b.z + (cam[2] - b.z) / dd * off, 0, 1);
      for (let m = 0; m < n; m++) {
        const hs = hash2i(b.i, m, 7), hs2 = hash2i(m, b.i, 11), u = (t * (0.8 + hs * 0.6) + hs2) % 1;
        const a = hs * TAU + t * 0.4, rr = R * (0.35 + hs2 * 0.65) * (1 - u * 0.45);
        const y0 = b.tree ? b.h * (0.18 + hs2 * 0.45) : 0.05, fy = y0 + u * (b.tree ? b.h * 0.45 : 0.9);
        const sz = (b.tree ? 0.95 : 0.4) * k * (1 - u) * (0.6 + hs * 0.5);
        if (sz < 0.05) continue;
        const col = u < 0.3 ? [1.45, 1.05, 0.38] : u < 0.65 ? [1.4, 0.66, 0.18] : [1.05, 0.3, 0.08];
        PE.box(Math.cos(a) * rr, fy, Math.sin(a) * rr, sz * 0.7, sz * 1.6, sz * 0.7, col, TL.plain, a + u);
      }
    }
    PE.fl = 0;
  },
  lights(eye) {
    const out = [];
    if (this.burning.size) {
      const arr = [];
      for (const b of this.burning.values()) arr.push([Math.hypot(b.x - eye[0], b.z - eye[2]), b]);
      arr.sort((a, b) => a[0] - b[0]);
      for (let q = 0; q < Math.min(4, arr.length); q++) { const [d, b] = arr[q], f = 1 + Math.sin(performance.now() / 70 + b.i) * 0.15; out.push({ x: b.x, y: b.y + b.h * 0.5, z: b.z, r: b.tree ? 18 : 8, c: [1.5 * f, 0.7 * f, 0.22 * f], d }); }
    }
    for (const b of this.bolts) out.push({ x: b.x, y: b.y0 + 3, z: b.z, r: 70, c: [2.4, 2.4, 2.8], d: Math.hypot(b.x - eye[0], b.z - eye[2]) });
    return out;
  },
  inCrevasse() {
    const w = game.world, p = game.player;
    if (!w.crevasses) return false;
    for (const [[ax, az], [bx, bz]] of w.crevasses) if (segDist(p.pos[0], p.pos[2], ax, az, bx, bz) < 4.5) return true;
    return false;
  },

  // ------------------------------------------------------------ branchements (une fois, quand tout est chargé)
  hookOnce() {
    if (this.hooked) return;
    this.hooked = true;
    // secouer un arbre fruitier : ses fruits
    const _shake = game.shakeTree.bind(game);
    game.shakeTree = function (t) {
      const s = farm.s, o = t.o, H = HARVEST[OBJ_TYPES[o.t].id];
      if (!H || !H.fruit || s.shaken[t.idx] === s.day) return _shake(t);
      s.shaken[t.idx] = s.day;
      const y = this.world.objectY(o);
      for (let i = 0; i < 14; i++) particles.spawn(o.x + (Math.random() - 0.5) * 3, y + o.h * (0.5 + Math.random() * 0.4), o.z + (Math.random() - 0.5) * 3, (Math.random() - 0.5), -1, (Math.random() - 0.5), [0.35, 0.55, 0.2, 1], 0.06, 2 + Math.random(), 1.5, false);
      sound.shake && sound.shake();
      const [item, a, b] = H.fruit, n = a + Math.floor(Math.random() * (b - a + 1));
      if (n > 0) { farm.give(item, n); play.flyer(item, [o.x, y + 1.5, o.z], n); }
    };
    // dormir ou s'évanouir pendant un incendie : il finit sans nous
    const _skip = game.skipHours.bind(game);
    game.skipHours = function (h) { if (h > 0.5) vallee.endFire(); return _skip(h); };
    // le carnet des signes, dans l'onglet Légendes
    const _lb = ui.legendsBody.bind(ui);
    ui.legendsBody = function () {
      let body = _lb();
      const V = vallee.st(), ks = SIGIL_KINDS.filter((k) => V.sigils[k]);
      body += `<h4>Les signes relevés (${ks.length} / ${SIGIL_KINDS.length})</h4>`;
      body += ks.length ? ks.map((k) => `<button class="note" data-sigil="${k}">${esc(SIGIL_TEXT[k].titre)}</button>`).join('') : '<p class="hint">Aucun encore. On en trouve gravés sur des stèles, tracés en pierres dans l’herbe, dans la neige, sur la glace… et peints dans les galeries.</p>';
      setTimeout(() => $$('#satchel [data-sigil]').forEach((b) => (b.onclick = () => { const G = SIGIL_TEXT[b.dataset.sigil]; this.read(G.titre, G.texte, ''); })), 0);
      return body;
    };
  },
};

// ---------------------------------------------------------------- branchements
HOOKS.load.push(() => vallee.load());
HOOKS.update.push((dt, eye, basis, sky) => vallee.update(dt, eye, basis, sky));
HOOKS.draw.push((dyn, sh, cam, t) => vallee.draw(dyn, cam, t));
HOOKS.lights.push((eye) => vallee.lights(eye));
HOOKS.primary.push((eye, basis, held, it) => (it && it.tool === 'arrosoir' ? vallee.douse(eye, basis.f) : false));
{
  const _tick = farm.tick.bind(farm);
  farm.tick = function (dtH, ctx) { _tick(dtH, ctx); if (game.world === this.w) vallee.floodTick(dtH); };
  const _su = sound.update.bind(sound);
  sound.update = function (dt, o) { if (vallee.fireNear > (o.fire || 0)) { o.fire = vallee.fireNear; o.firePan = vallee.firePan; } return _su(dt, o); };
  const _hurt = play.hurt.bind(play);
  play.hurt = function (dmg, src, cause) { if (cause === 'Une mauvaise chute' && vallee.inCrevasse()) cause = 'Tombé au fond d’une crevasse du glacier'; return _hurt(dmg, src, cause); };
  const _lire = HOOKS.inter.lire;
  HOOKS.inter.lire = (it) => { const d = it.data || {}; if (d.text) { ui.read(d.text[0], d.text[1], d.text[2] || ''); sound.page && sound.page(); return; } return _lire && _lire(it); };
  const _loot = HOOKS.interPre.loot;
  HOOKS.interPre.loot = (it) => {
    if (it.data && it.data.table === 'crevasse') { const f = 'fouille_' + it.id; if (farm.s.flags[f]) { ui.subtitle('', '(Il n’y a plus rien. La glace garde le reste.)', 3); return true; } farm.s.flags[f] = 1; }
    return _loot ? _loot(it) : false;
  };
}
// les signes
HOOKS.inter.sigle = (it) => {
  const k = it.data.k, G = SIGIL_TEXT[k];
  if (!G) return;
  const V = vallee.st(), first = !V.sigils[k];
  if (first) { V.sigils[k] = farm.s.day; if (G.faith) faith.add(G.faith, 1); }
  const n = Object.keys(V.sigils).length;
  ui.read(G.titre, G.texte + (first ? `\n\n(Vous recopiez le signe dans votre carnet : ${n} sur ${SIGIL_KINDS.length}.)` : ''), it.data.big ? 'Tracé à même le sol, en grand : on ne le voit bien que de loin.' : 'Gravé dans la pierre.');
  sound.page && sound.page();
  if (first && n === SIGIL_KINDS.length && !farm.s.flags.douzeSignes) { farm.s.flags.douzeSignes = farm.s.day; setTimeout(() => ui.subtitle('', '(Les douze signes. Le treizième ne se trace pas, dit-on : il se porte.)', 5), 1500); }
};
// le refuge : on y dort
HOOKS.inter.refuge = () => game.trySleep('refuge');
// le trou dans la glace
HOOKS.inter.peche_glace = (it) => {
  if (!farm.count('canne')) { ui.subtitle('', '(Un trou rond dans la glace, l’eau noire dessous. Il faudrait une canne à pêche.)', 3.5); return; }
  const F = vallee.fish;
  if (!F) { vallee.fish = { it, t: 8 + Math.random() * 20, bite: 0 }; /* comme au bord de l'eau : 8 à 28 s (équilibrage) */ sound.splash && sound.splash(); ui.subtitle('', '(Vous laissez filer la ligne dans l’eau noire, et vous attendez.)', 3); return; }
  if (F.bite > 0) { vallee.fish = null; play.catchFish({ zone: 'lac_gele', x: it.x, y: it.y, z: it.z }); return; }
  ui.subtitle('', '(Rien encore. La ligne ne bouge pas.)', 2);
};
