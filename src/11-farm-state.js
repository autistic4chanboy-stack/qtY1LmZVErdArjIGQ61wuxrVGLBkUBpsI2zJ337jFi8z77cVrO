// ============================================================================
//  FERME : état de la partie (inventaire, argent, jours, cultures, bêtes,
//  mémoire des habitants), sauvegarde (graine + modifications), mort définitive
// ============================================================================

const FARM_KEY = 'prairie.ferme', FARM_V = 2, HISTORY_KEY = 'prairie.versions';
// La terre (mesurée par tools/equilibrage/ferme.js) : une case arrosée, ou mouillée par la pluie, reste humide deux
// jours de jeu (humide) ; sèche, sa culture tient encore deux jours (seche) avant de mourir, et une case labourée vide
// redevient de l'herbe au même rythme ; la canicule presse l'un et l'autre de moitié (chaleur). Une case s'épuise : au-delà
// de cinq récoltes sans engrais, la culture y pousse deux fois moins vite, au-delà de dix quatre fois (fatigue, lenteur) ;
// l'engrais remet le compte à zéro, et deux jours sous l'herbe en effacent une récolte (jachere). Compte : farm.s.sol.
const TERRE = { humide: 48, seche: 48, chaleur: 1.5, fatigue: [5, 10], lenteur: [1, 0.5, 0.25], jachere: 48 };
// recettes connues dès le départ (les autres s'apprennent auprès des habitants)
const LOCKED_RECIPES = new Set(['statue', 'lampadaire', 'girouette', 'brouette', 'hache_acier', 'pioche_acier', 'puits_deco', 'arche_fleurie', 'parterre', 'ruche', 'tonneau', 'nichoir', 'lanterne', 'panneau', 'banc', 'table', 'citrouille_sculptee', 'meule', 'boussole', 'montre']);
// Objets de quête : ajoutés au catalogue des objets
for (const id in (typeof QUEST_ITEMS !== 'undefined' ? QUEST_ITEMS : {})) {
  if (!ITEMS[id]) defItem(id, QUEST_ITEMS[id].name, 'quete', 0, ['objet', '#c8b88a'], { desc: QUEST_ITEMS[id].desc, questItem: true });
  else if (!ITEMS[id].desc) ITEMS[id].desc = QUEST_ITEMS[id].desc;
}
ITEMS.panier_pain && (ITEMS.panier_pain.ic = ['pain', '#c48846']);
ITEMS.alliance && (ITEMS.alliance.ic = ['rond', '#e8c040']);
ITEMS.bague_sceau && (ITEMS.bague_sceau.ic = ['rond', '#d8b040']);
ITEMS.lettre_scellee && (ITEMS.lettre_scellee.ic = ['lettre', '#e8e0c8']);
ITEMS.lettre_parfumee && (ITEMS.lettre_parfumee.ic = ['lettre', '#d8b0e8']);
ITEMS.faire_part && (ITEMS.faire_part.ic = ['lettre', '#707070']);
ITEMS.cle_rouillee && (ITEMS.cle_rouillee.ic = ['cle', '#8a5a34']);
ITEMS.poupee_chiffon && (ITEMS.poupee_chiffon.ic = ['figurine', '#c8a0a0']);
ITEMS.dent_de_loup && (ITEMS.dent_de_loup.ic = ['plume', '#e8e0c0']);
ITEMS.pipe && (ITEMS.pipe.ic = ['cle', '#6a4a2a']);
ITEMS.chapelet && (ITEMS.chapelet.ic = ['cle', '#a08050']);
ITEMS.clochette && (ITEMS.clochette.ic = ['pot', '#c8a040']);
ITEMS.fer_a_cheval && (ITEMS.fer_a_cheval.ic = ['cle', '#8a8a90']);
ITEMS.sac_avoine && (ITEMS.sac_avoine.ic = ['sac', '#c8b070']);

const farm = {
  on: false, s: null, w: null, dirtyProps: true, raining: false,

  // ------------------------------------------------------------- nouvelle partie
  blank(seed) {
    const hist = store.get(HISTORY_KEY, []);
    return {
      v: FARM_V, gen: [2, VALLEY_GEN].includes(store.get('prairie.gen', VALLEY_GEN)) ? store.get('prairie.gen', VALLEY_GEN) : VALLEY_GEN, seed, run: (hist.length || 0) + 1, day: 1, time: 0.27, hours: 6.5, money: 300,
      inv: { houe: 1, arrosoir: 1, hache_pierre: 1, pioche_pierre: 1, graines_radis: 5, graines_ble: 3, pain: 3, lanterne: 1, bougie: 2 },
      looted: {}, fouilles: [], shaken: {},
      hand: 'main', water: 0, known: {}, player: null,
      removed: {}, objHp: {}, forage: {}, crops: {}, sol: {}, props: [], propData: {}, gone: {},
      chests: { coffre_ferme: {} }, ship: {}, animals: [], pending: [], dog: { name: 'Filou', alive: true },
      npcs: {}, quests: {}, notes: {}, mail: [], flags: {}, rep: { crimes: [], infamy: 0, hero: 0 },
      strange: null, deliveries: null, weather: null, stats: { crops: 0, fish: 0, sold: 0, earned: 0 }, dead: [],
      farmerName: null,
    };
  },

  async start(saved, seed, progress) {
    this.on = true;
    const s = saved || this.blank(seed ?? ((Math.random() * 1e9) | 0));
    this.s = s;
    this.migrate(s);
    const w = await generateValley(s.seed, progress || (() => {}), s.gen || 1);
    this.w = w;
    this.names = s.gen >= 3 && typeof VALLEY_DESIGN !== 'undefined' ? Object.assign({}, VALLEY_DESIGN.names) : { ville: B_name(s.seed, 1), hameau: B_name(s.seed, 2) };
    this.applyDeltas(w);
    if (!saved) this.pretill(w);
    return w;
  },
  // Anciennes sauvegardes (cultures comptées en jours) -> heures
  migrate(s) {
    const OLD = { ble: 4, carotte: 3, patate: 5, chou: 6, tomate: 7, citrouille: 9, mais: 7, fraise: 5, tournesol: 6, pommier: 10 };
    if (s.hours === undefined) {
      s.hours = (s.day - 1) * 24 + (s.time || 0.27) * 24;
      for (const k in s.crops) {
        const c = s.crops[k];
        if (c.c && OLD[c.c] && CROPS[c.c]) c.g = c.g / OLD[c.c] * CROPS[c.c].h;
        c.wet = c.w ? s.hours + 6 : 0;
        c.t = s.hours; c.dryH = 0;
      }
      for (const k in s.forage) s.forage[k] = s.hours - 12;
    }
    s.looted = s.looted || {}; s.fouilles = s.fouilles || []; s.shaken = s.shaken || {};
    if (!s.sol || typeof s.sol !== 'object') s.sol = {}; // fatigue du sol (une ancienne partie : toutes les cases reposées)
    s.v = FARM_V;
  },
  // Nouvelle partie : quelques rangs déjà labourés près de l'épouvantail
  pretill(w) {
    const fd = w.farm && w.farm.field;
    if (!fd) return;
    const cx = Math.floor((fd.x0 + fd.x1) / 2), cz = Math.floor((fd.z0 + fd.z1) / 2);
    for (let dz = -3; dz <= 3; dz++) for (let dx = -4; dx <= 4; dx++) {
      if (Math.abs(dx) <= 1 && Math.abs(dz) <= 1) continue;
      const x = cx + dx + 0.5, z = cz + dz + 0.5;
      if (this.canTill(x, z)) this.till(x, z);
    }
  },

  // Rejoue les modifications sauvegardées sur le monde régénéré
  applyDeltas(w) {
    const s = this.s;
    for (const k in s.removed) {
      const o = w.objects[+k];
      if (!o) continue;
      o.gone = true;
      if (s.removed[k] === 'stump') w.objects.push({ t: OBJ_INDEX.stump, x: o.x, z: o.z, h: 0.8, f: 0, v: 0, fromStump: +k });
    }
    for (const k in s.forage) { const o = w.objects[+k]; if (o) o.gone = true; }
    for (const k in s.gone) { const p = w.props[+k]; if (p) { p.gone = true; removePropCollider(w, p); } }
    for (const k in s.propData) { const p = w.props[+k]; if (p) p.data = Object.assign({}, p.data || {}, s.propData[k]); }
    this.genProps = w.props.length;
    for (const p of s.props) { const q = Object.assign({}, p); w.props.push(q); addPropCollider(w, q); }
    w.objectsDirty = true; w.shadeDirty = true; w.grid = null; w.blocksDirty = true;
    this.dirtyProps = true;
  },

  // ------------------------------------------------------------- inventaire
  count(id) {
    if (ITEM_GROUPS[id]) return ITEM_GROUPS[id].reduce((a, k) => a + (this.s.inv[k] || 0), 0);
    return this.s.inv[id] || 0;
  },
  give(id, n = 1) {
    if (!ITEMS[id]) { console.warn('objet inconnu', id); return; }
    this.s.inv[id] = (this.s.inv[id] || 0) + n;
    if (this.s.inv[id] <= 0) delete this.s.inv[id];
  },
  take(id, n = 1) {
    if (ITEM_GROUPS[id]) { // ingrédient générique : prend dans les objets possédés
      let left = n;
      for (const k of ITEM_GROUPS[id]) { const c = Math.min(left, this.s.inv[k] || 0); if (c) { this.take(k, c); left -= c; } if (!left) break; }
      return left === 0;
    }
    if ((this.s.inv[id] || 0) < n) return false;
    this.s.inv[id] -= n;
    if (this.s.inv[id] <= 0) { delete this.s.inv[id]; if (this.s.hand === id) this.s.hand = 'main'; }
    return true;
  },
  has(need) { for (const k in need) if (this.count(k) < need[k]) return false; return true; },
  pay(n) { if (this.s.money < n) return false; this.s.money -= n; return true; },
  earn(n) { this.s.money += n; this.s.stats.earned += n; },
  bestTool(kind) {
    let best = null;
    for (const id in this.s.inv) { const it = ITEMS[id]; if (it && it.tool === kind && (best === null || (it.tier || 0) > (ITEMS[best].tier || 0))) best = id; }
    return best;
  },
  knows(recipeOut) { return !LOCKED_RECIPES.has(recipeOut) || !!this.s.known[recipeOut]; },

  // ------------------------------------------------------------- objets posés
  addProp(p) {
    const w = this.w;
    const q = { id: p.id, x: p.x, y: p.y, z: p.z, r: p.r || 0 };
    if (p.data) q.data = p.data;
    if (p.s) q.s = p.s;
    w.props.push(q); addPropCollider(w, q);
    this.s.props.push({ id: q.id, x: q.x, y: q.y, z: q.z, r: q.r, data: q.data, s: q.s });
    this.dirtyProps = true; w.grid = null; w.coverDirty = true;
    return q;
  },
  removeProp(q) {
    const w = this.w, i = w.props.indexOf(q);
    if (i < 0) return;
    removePropCollider(w, q);
    if (i < this.genProps) { q.gone = true; this.s.gone[i] = 1; }
    else {
      w.props.splice(i, 1);
      const k = this.s.props.findIndex((p) => p.id === q.id && Math.abs(p.x - q.x) < 0.01 && Math.abs(p.z - q.z) < 0.01);
      if (k >= 0) this.s.props.splice(k, 1);
    }
    this.dirtyProps = true;
  },
  setPropData(q, data) {
    q.data = Object.assign({}, q.data || {}, data);
    const w = this.w, i = w.props.indexOf(q);
    if (i < 0) return;
    if (i < this.genProps) this.s.propData[i] = Object.assign({}, this.s.propData[i] || {}, data);
    else { const p = this.s.props.find((p) => p.id === q.id && Math.abs(p.x - q.x) < 0.01 && Math.abs(p.z - q.z) < 0.01); if (p) p.data = q.data; }
    this.dirtyProps = true;
  },
  propByKind(id, near, r) {
    let best = null, bd = r || 1e9;
    for (const p of this.w.props) { if (p.gone || p.id !== id) continue; const d = Math.hypot(p.x - near[0], p.z - near[1]); if (d < bd) { bd = d; best = p; } }
    return best;
  },

  // ------------------------------------------------------------- cultures (cases de 1 m)
  cellKey(x, z) { return Math.floor(x) + ',' + Math.floor(z); },
  crop(x, z) { return this.s.crops[this.cellKey(x, z)] || null; },
  // Une case peut être labourée si le sol est de la terre ou de l'herbe, plat et hors des bâtiments
  canTill(x, z) {
    const w = this.w, cx = Math.floor(x) + 0.5, cz = Math.floor(z) + 0.5;
    if (!w.inside(cx, cz, 5)) return false;
    const m = w.matAt(cx, cz);
    if (m > M_DIRT) return false;
    const h = w.heightAt(cx, cz);
    if (h < w.waterLevel + 0.3) return false;
    const n = w.normalAt(cx, cz);
    if (n[1] < 0.93) return false;
    if (w.covered(cx, h + 0.5, cz)) return false;
    let blocked = false;
    w.query(cx, cz, 1, null, (b) => { const [lx, lz] = World.blockLocal(b, cx, cz); if (Math.abs(lx) < b.sx / 2 + 0.3 && Math.abs(lz) < b.sz / 2 + 0.3 && b.y < h + 1.5 && b.y + b.sy > h - 0.2) blocked = true; });
    return !blocked;
  },
  till(x, z) {
    const k = this.cellKey(x, z);
    if (this.s.crops[k]) return false;
    this.s.crops[k] = { c: null, g: 0, wet: 0, dryH: 0, t: this.s.hours };
    this.jachere(k);
    this.dirtyProps = true;
    return true;
  },
  plant(x, z, cropId) {
    const c = this.crop(x, z);
    if (!c || c.c) return false;
    Object.assign(c, { c: cropId, g: 0, dryH: 0, dead: false, st: 0, vr: pickCropVar(cropId) });
    delete c.big;
    this.dirtyProps = true;
    return true;
  },
  wet(c) { return c && (c.wet > this.s.hours || this.raining); },
  isNight() { const h = (this.w ? this.w.time : 0.5) * 24; return h >= 20.5 || h < 5.5; },
  // Arroser : la terre reste humide deux jours ; on peut y revenir une fois la demi-journée passée
  water(x, z) {
    const c = this.crop(x, z);
    if (!c || c.wet > this.s.hours + TERRE.humide - 12) return false;
    c.wet = this.s.hours + TERRE.humide; this.dirtyProps = true;
    return true;
  },
  // L'engrais : son coup de pouce à la culture (fert 1 : une fois et demie plus vite, 2 : deux fois), et la terre
  // fatiguée repart de zéro. Une case déjà nourrie ne le reprend que si elle a donné depuis.
  fertilize(x, z, k) {
    const c = this.crop(x, z);
    if (!c) return false;
    const key = this.cellKey(x, z);
    if ((c.fert || 0) >= k && !this.usure(key)) return false;
    c.fert = Math.max(c.fert || 0, k);
    if (this.s.sol) delete this.s.sol[key];
    this.dirtyProps = true;
    return true;
  },
  // ------------------------------------------------------------- fatigue du sol (farm.s.sol[case] = { n : récoltes depuis
  // le dernier engrais, r : heure où la case est retournée à l'herbe }) ; les arbres n'épuisent pas la terre
  usure(k) { const u = this.s.sol && this.s.sol[k]; return u ? u.n : 0; },
  lenteur(n) { return n >= TERRE.fatigue[1] ? TERRE.lenteur[2] : n >= TERRE.fatigue[0] ? TERRE.lenteur[1] : TERRE.lenteur[0]; },
  // une récolte de plus sur la case (play.harvestCrop) : renvoie le compte
  recolte(x, z, c) {
    if (!c || c.tree) return 0;
    const k = this.cellKey(x, z), S = this.s.sol || (this.s.sol = {}), u = S[k] || (S[k] = { n: 0 });
    u.n++; delete u.r;
    if (u.n === TERRE.fatigue[0] || u.n === TERRE.fatigue[1]) this.dirtyProps = true; // la terre pâlit
    return u.n;
  },
  // la case est de nouveau labourée : les jours passés sous l'herbe ont reposé la terre
  jachere(k) {
    const S = this.s.sol, u = S && S[k];
    if (!u || u.r === undefined) return;
    u.n -= Math.floor(Math.max(0, this.s.hours - u.r) / TERRE.jachere);
    delete u.r;
    if (u.n <= 0) delete S[k];
  },
  // chaque matin : les cases retournées à l'herbe (quelle qu'en soit la raison) commencent leur repos
  jachereJour() {
    const S = this.s.sol;
    if (!S) return;
    for (const k in S) {
      const u = S[k];
      if (this.s.crops[k]) { if (u.r !== undefined) this.jachere(k); }
      else if (u.r === undefined) u.r = this.s.hours;
      else if (u.n <= Math.floor((this.s.hours - u.r) / TERRE.jachere)) delete S[k];
    }
  },
  ripe(c) { return c && c.c && !c.dead && c.g >= CROPS[c.c].h; },
  growth(c) { return c && c.c ? clamp(c.g / CROPS[c.c].h, 0, 1) : 0; },

  // ------------------------------------------------------------- pousse continue (heures de jeu), arroseurs, bêtes, cueillette
  // dtH : heures écoulées ; ctx : { rain (0..1), heat, storm }
  tick(dtH, ctx) {
    const s = this.s, w = this.w;
    if (dtH <= 0) return;
    const pluie = ctx.rain > 0.35 && !strange.inEnvers(), HUM = TERRE.humide, hot = ctx.heat ? TERRE.chaleur : 1;
    if (pluie !== this.raining) this.dirtyProps = true; // la terre fonce (ou s'éclaircit) d'un coup
    this.raining = pluie;
    // arroseurs : toutes les demi-heures, les cases à portée restent humides (deux jours, comme à l'arrosoir)
    this.sprT = (this.sprT || 0) + dtH;
    if (this.sprT >= 0.5) {
      this.sprT = 0;
      for (const q of w.props) {
        if (q.gone || !PLACEABLES[q.id] || !PLACEABLES[q.id].sprinkler) continue;
        const R = PLACEABLES[q.id].sprinkler, x0 = Math.floor(q.x), z0 = Math.floor(q.z);
        for (let dz = -R; dz <= R; dz++) for (let dx = -R; dx <= R; dx++) {
          const c = s.crops[(x0 + dx) + ',' + (z0 + dz)];
          if (c) { if (!(c.wet > s.hours)) this.dirtyProps = true; c.wet = s.hours + HUM; }
        }
      }
    }
    for (const k in s.crops) {
      const c = s.crops[k];
      // la pluie mouille toute la terre pour deux jours ; la canicule la sèche une fois et demie plus vite
      if (pluie) c.wet = s.hours + HUM;
      else if (hot > 1 && c.wet > s.hours) c.wet -= dtH * (hot - 1);
      const wet = c.tree || c.wet > s.hours || pluie;
      if (!c.c) {
        // terre labourée vide : humide ou fraîchement retournée, elle tient ; puis deux jours secs, et l'herbe revient
        // (un peu plus ou un peu moins selon la case : tout un champ ne reverdit pas d'un seul coup)
        if (wet !== !!c.wv) { c.wv = wet; this.dirtyProps = true; }
        if (wet || s.hours - (c.t || 0) < HUM) c.dryH = 0;
        else if ((c.dryH = (c.dryH || 0) + dtH * hot) > TERRE.seche && c.dryH > TERRE.seche + hash2i(parseInt(k, 10), +k.slice(k.indexOf(',') + 1), 7) * 3) {
          delete s.crops[k]; this.dirtyProps = true;
          const u = s.sol && s.sol[k]; if (u) u.r = s.hours; // la jachère commence
        }
        continue;
      }
      if (c.dead) continue;
      const C = CROPS[c.c];
      const wasRipe = c.g >= C.h;
      if (wet && C.night && !this.isNight()) { c.dryH = 0; continue; } // la mandragore ne pousse que la nuit
      if (wet) {
        const k2 = (c.fert === 2 ? 2 : c.fert === 1 ? 1.5 : 1) * (ctx.heat && !c.wet ? 0.6 : 1) * (c.tree ? 1 : this.lenteur(this.usure(k)));
        c.g = Math.min(C.h, c.g + dtH * k2); c.dryH = 0;
      } else {
        c.dryH = (c.dryH || 0) + dtH * hot;
        if (c.dryH > TERRE.seche && c.g < C.h) { c.dead = true; this.dirtyProps = true; }
      }
      // la plante jaunit pendant son dernier jour sans eau (play.buildProps)
      const fl = !wet && c.dryH > TERRE.seche / 2 ? 1 : 0;
      const st = c.g >= C.h ? 5 : Math.floor(c.g / C.h * 5);
      if (st !== c.st || (wet !== !!c.wv) || fl !== (c.fl || 0)) { c.st = st; c.wv = wet; c.fl = fl; this.dirtyProps = true; }
      if (!wasRipe && c.g >= C.h) { this.dirtyProps = true; if (C.giant && c.big === undefined) c.big = Math.random() < 0.05 ? 1 : 0; }
      if (ctx.storm && wasRipe && Math.random() < dtH * 0.01) { c.dead = true; this.dirtyProps = true; }
    }
    // cueillette qui repousse
    for (const k in s.forage) {
      const o = w.objects[+k];
      const H = o && HARVEST[OBJ_TYPES[o.t].id];
      if (!o || !H || s.hours - s.forage[k] >= (H.regrow || 24)) { if (o && !o.cleared) { o.gone = false; w.objectsDirty = true; w.grid = null; } delete s.forage[k]; }
    }
    // bêtes : production au fil des heures
    for (const a of s.animals) {
      if (a.dead) continue;
      const fedK = a.fedUntil > s.hours ? 1.5 : this.raining ? 0.6 : 1;
      a.prodT = (a.prodT || 0) + dtH * fedK;
      // heures entre deux produits (équilibrage : deux œufs, trois traites par jour ; nourries, × 1,5)
      const P = { hen: 16, cow: 12, sheep: 36, pig: 20 }[a.kind];
      if (!P || a.prodT < P) continue;
      a.prodT = 0;
      if (a.kind === 'hen') a.egg = Math.min(3, (a.egg || 0) + 1);
      if (a.kind === 'cow') a.milk = Math.min(2, (a.milk || 0) + 1);
      if (a.kind === 'sheep') a.wool = Math.min(1, (a.wool || 0) + 1);
      if (a.kind === 'pig' && !this.raining && Math.random() < 0.55 + (a.mood || 0.5) * 0.3) a.truffle = Math.min(2, (a.truffle || 0) + 1);
    }
  },

  // ------------------------------------------------------------- nouveau jour
  // w : monde, wx : météo de la veille { rain, storm, frost, heat } (0/1)
  newDay(wx) {
    const s = this.s, rnd = mulberry32(s.seed * 31 + s.day * 977);
    s.day++;
    const report = { lost: 0, frost: 0 };
    // gel de l'aube : les jeunes pousses sensibles n'y survivent pas
    for (const k in s.crops) {
      const c = s.crops[k];
      if (!c.c || c.dead) continue;
      const C = CROPS[c.c];
      if (wx.frost && C.frost && c.g < C.h * 0.5) { c.dead = true; report.frost++; }
    }
    // la terre qui se repose sous l'herbe (fatigue du sol)
    this.jachereJour();
    // bêtes : humeur
    for (const a of s.animals) {
      if (a.dead) continue;
      a.age = (a.age || 0) + 1;
      a.mood = clamp((a.mood || 0.5) + (a.pet ? 0.06 : -0.02), 0, 1);
      a.pet = false;
    }
    // livraison des bêtes achetées la veille
    for (const p of s.pending) s.animals.push(this.newAnimal(p.kind));
    s.pending = [];
    // caisse d'expédition : vendue pendant la nuit
    let sold = 0;
    for (const id in s.ship) { sold += (ITEMS[id].price || 0) * s.ship[id]; s.stats.sold += s.ship[id]; }
    if (sold) { this.earn(sold); this.mail('La coopérative', 'Relevé de la coopérative', `Votre caisse a été relevée à l’aube. Montant versé : ${sold} pièces.`); }
    s.ship = {};
    this.dirtyProps = true;
    return report;
  },
  newAnimal(kind) {
    const names = { hen: ['Cocotte', 'Rousse', 'Plume', 'Noisette', 'Paquerette', 'Grisette'], cow: ['Marguerite', 'Blanchette', 'Violette', 'Caramel'], sheep: ['Laine', 'Nuage', 'Frisette', 'Coton'], pig: ['Truffe', 'Groin', 'Rosette'], horse: ['Éclair', 'Tonnerre', 'Brume', 'Cannelle'] };
    const L = names[kind] || ['Bête'];
    return { kind, name: L[(Math.random() * L.length) | 0], mood: 0.5, v: (Math.random() * 4) | 0, age: 0, id: 'a' + Date.now().toString(36) + ((Math.random() * 1e4) | 0) };
  },
  mail(from, title, text, extra) {
    this.s.mail.push(Object.assign({ from, title, text, day: this.s.day, read: false }, extra || {}));
    const mb = this.w && this.w.farm && this.w.farm.mailbox;
    if (mb) this.setPropData(mb, { mail: true });
  },

  // ------------------------------------------------------------- sauvegarde
  save() {
    if (!this.on || !this.s || this.s.over) return;
    const p = game.player;
    this.s.player = { pos: p.pos.map((v) => Math.round(v * 100) / 100), yaw: p.yaw, pitch: p.pitch, hp: p.hp, food: p.food };
    this.s.time = this.w.time;
    this.s.animalsPos = null;
    if (typeof npcs !== 'undefined') npcs.saveState(this.s);
    store.set(FARM_KEY, this.s);
  },
  wipe() { store.remove(FARM_KEY); },

  // ------------------------------------------------------------- mort définitive
  recordDeath(cause, place) {
    const s = this.s;
    const hist = store.get(HISTORY_KEY, []);
    hist.push({ run: s.run, seed: s.seed, day: s.day, cause, place, date: new Date().toISOString().slice(0, 10), name: s.farmerName || null });
    store.set(HISTORY_KEY, hist.slice(-30));
    s.over = true;
    this.wipe();
  },
  history() { return store.get(HISTORY_KEY, []); },
};

// Nom de lieu déterministe (ville, hameau) : sans article, commençant par une consonne
function B_name(seed, k) {
  const rnd = mulberry32(seed * 7 + k * 101);
  for (let t = 0; t < 40; t++) {
    const a = NAME_A[(rnd() * NAME_A.length) | 0], b = NAME_B[(rnd() * NAME_B.length) | 0];
    if (a.toLowerCase() === b || a.toLowerCase().startsWith(b.slice(0, 3)) || b.startsWith(a.toLowerCase().slice(0, 3))) continue;
    const n = a + b;
    if (k === 2 && n === B_name(seed, 1)) continue;
    return n;
  }
  return k === 1 ? 'Valbrume' : 'Clairpré';
}
