// ============================================================================
//  LES TERRES D'AVANT (agent V1, quatorzième vague) — la Zone, second monde
//  - Un World à part (V1_ZONE_N × V1_ZONE_N cases de 2 m : deux fois la surface
//    de la vallée), généré une fois par partie (graine de la partie), à la
//    première entrée, derrière un écran d'attente ; gardé en mémoire.
//  - Entrer (zone.entrer) : la vallée « s'endort » — on range ce qui lui est
//    propre (bêtes, flèches, cartes de ce qu'on a coupé ou pris : farm.s.removed,
//    forage, objHp, shaken, gone, propData), game.world devient la Zone. Le temps
//    continue (la Zone partage le jour et la nuit de la vallée), la ferme pousse,
//    mais les habitants, l'étrange, les événements et tous les crochets de la
//    vallée (HOOKS.update, draw, lights, target, sky, fx) sont suspendus : seuls
//    tournent, dans la Zone, ceux du personnage (corps, faim, effets, lanterne,
//    cinématiques…) et ceux qui sont marqués pour elle (zone.sur, fn.zone).
//  - Sortir (zone.sortir) : tout revient ; les habitants sont remis à leur place
//    de l'heure ; les bêtes de la ferme reprennent où on les avait laissées.
//  - Sauvegarde : farm.s.zone (dedans, position, cartes de la Zone, ce qu'on y a
//    pris, ouvert, découvert) ; la position enregistrée de la partie reste celle
//    de la vallée (devant la Porte) ; une partie enregistrée dans la Zone y
//    revient au chargement.
//  API (contrat : $SP/eq/contrat-v14.md) : zone.entrer(o), zone.sortir(o),
//  zone.dedans, zone.monde(), zone.site(id), zone.sites(agent), zone.passe(nom,
//  fn), zone.sur(type, fn), zone.region(x, z), zone.aller(id), zone.S().
// ============================================================================
const V1_CARTES = ['removed', 'forage', 'objHp', 'shaken', 'gone', 'propData'];
Object.assign(LIEU_NAMES, V1_LIEUX);

// ---------------------------------------------------------------- le relief prévu (sans la génération : sert aux sites)
// Le relief de la Zone se calcule en trois temps : une fonction « grossière » d'un point (bruits + régions + rebord +
// pic), lue aussi pour la hauteur des sites ; puis, sur une grille de 8 m, les chemins et les ravines ; puis, aux 2 m,
// le détail fin et l'aplanissement exact des sites.
const V1Relief = {
  graine: null, nA: null, nB: null, nC: null, nD: null,
  preparer(seed) {
    if (this.graine === seed) return;
    this.graine = seed;
    const g = (seed ^ 0x5A0E1A11) >>> 0;
    this.nA = makeNoise2D(g); this.nB = makeNoise2D(g + 17); this.nC = makeNoise2D(g + 31); this.nD = makeNoise2D(g + 47);
  },
  S() { return V1_ZONE_N * V1_ZONE_CELL; },
  // hauteur grossière (m, au-dessus de 0 ; l'eau est à V1_ZONE_EAU) en (x, z) mètres
  point(x, z) {
    const S = this.S(), u = x / S, v = z / S, WL = V1_ZONE_EAU;
    const nA = this.nA, nB = this.nB, nC = this.nC;
    let h = WL + 30 + fbm(nA, u * 6, v * 6, 4) * 24 + fbm(nB, u * 19, v * 19, 3) * 7;
    for (const k in V1_REGIONS) {
      const R = V1_REGIONS[k], d = Math.hypot(u - R.x, v - R.z) / R.r;
      if (d >= 1) continue;
      const w = smoothstep(1, 0.35, d) * R.k;
      h = lerp(h, WL + R.h + fbm(nC, u * 30 + 3, v * 30, 2) * (k === 'cendrieres' ? 3.2 : 3), w);
    }
    // les Degrés : du replat de la Ville Basse (+26) aux Hauts (+120), par paliers taillés en falaises
    {
      const t = smoothstep(0.58, 0.27, v) * smoothstep(0.30, 0.42, u) * (1 - smoothstep(0.62, 0.70, u));
      if (t > 0) {
        const raw = smoothstep(0.56, 0.24, v), steps = 6, s = raw * steps, f = s - Math.floor(s);
        const terr = (Math.floor(s) + smoothstep(0.8, 0.93, f)) / steps; // paliers : plats, puis une marche à pic
        h = lerp(h, WL + 26 + (122 - 26) * terr + fbm(nC, u * 40, v * 40, 2) * 2, t);
      }
    }
    // les Hauts, à l'est des Degrés : un grand replat haut (le château), bordé de falaises
    { const d = Math.hypot((u - 0.745) / 0.15, (v - 0.20) / 0.11); if (d < 1.3) h = lerp(h, WL + 120 + fbm(nC, u * 25, v * 25, 2) * 2.5, smoothstep(1.3, 0.85, d)); }
    // le Pic : un cône de roche au nord-ouest (l'aire du dragon au sommet)
    { const d = Math.hypot(u - 0.18, v - 0.13) / 0.11; if (d < 1) h += Math.pow(1 - d, 1.6) * 215 * (0.85 + 0.15 * fbm(nB, u * 12, v * 12, 2)); }
    // l'aiguille des Cendrières, la butte du Bois Mort, la falaise de l'Étang (perchoirs)
    { const d = Math.hypot(u - 0.285, v - 0.42) / 0.012; if (d < 1) h += Math.pow(1 - d, 0.7) * 48; }
    { const d = Math.hypot(u - 0.33, v - 0.69) / 0.03; if (d < 1) h += Math.pow(1 - d, 1.2) * 26; }
    { const d = Math.hypot(u - 0.885, v - 0.36) / 0.035; if (d < 1) h += Math.pow(1 - d, 0.9) * 55; }
    // le rebord : de hautes montagnes tout autour (on ne sort que par la Porte)
    // (sauf devant la Porte : le Seuil est une cour au pied de la paroi, pas un replat sur la montagne)
    const e = Math.min(u, v, 1 - u, 1 - v), seuil = smoothstep(0.075, 0.04, Math.hypot((u - 0.5) * 0.8, v - 0.925));
    let rim = smoothstep(0.085, 0.0, e) * (1 - seuil);
    if (rim > 0) h += Math.pow(rim, 1.25) * (230 + fbm(nA, u * 9 + 5, v * 9, 3) * 70);
    // la paroi du sud, où s'ouvre la Porte : une falaise droite derrière le Seuil
    { const d = Math.abs(u - 0.5); if (v > 0.945 && d < 0.075) h = Math.max(h, lerp(h, WL + 22 + (v - 0.945) / 0.055 * 280, smoothstep(0.075, 0.045, d))); }
    return h;
  },
};

// ---------------------------------------------------------------- crochets : ce qui tourne dans la Zone
// Les listes HOOKS.update, draw, lights, target, sky, fx, camera deviennent des listes qui, dans la Zone, ne rendent
// (pour for…of) que les fonctions permises : marquées fn.zone (les deux mondes) ou fn.zoneSeule (la Zone seulement,
// voir zone.sur), et quelques crochets du personnage (V1_PERMIS, reconnus une fois au premier chargement).
class V1Crochets extends Array {
  *[Symbol.iterator]() {
    const z = zone.dedans;
    for (let i = 0; i < this.length; i++) {
      const fn = this[i];
      if (typeof fn !== 'function') continue;
      if (z ? (fn.zone || fn.zoneSeule || V1_PERMIS.has(fn)) : !fn.zoneSeule) yield fn;
    }
  }
}
const V1_PERMIS = new Set();
const V1_TYPES_CROCHETS = ['update', 'draw', 'lights', 'target', 'sky', 'fx', 'camera'];
for (const k of V1_TYPES_CROCHETS) { const L = new V1Crochets(); for (const fn of HOOKS[k]) L.push(fn); HOOKS[k] = L; }
// crochets de la vallée qui continuent dans la Zone (ceux du personnage) : reconnus par leur texte
const V1_PERMIS_MOTIFS = {
  update: ["BUFF.on('celerite')", 'alchimie.majPoison', 'corps.update(', 'cine.update(', 'effets.update(', 'alcool.update(', 'lanterne.update(', 'bar.update(', 'feed.update(', 'son3d.update(', 'butin.clore(', 'mondes.update('],
  draw: ['cine.rigJoueur', 'mondes.dessiner('],
  lights: ['mondes.lumieres('],
  target: ['mondes.cibles('],
  sky: ["BUFF.on('nyctalopie')", "BUFF.on('soleil')", 'effets.ciel(', 'MONDES_IDX'],
  fx: ['alchemy.flashT > 0) {', "BUFF.on('morts')", 'effets.fx(', 'alcool.fx(', 'mondes.aPart()', 'faim.pulse'],
  camera: ['cine.camera()', 'alcool.camera('],
};
function v1Permettre() {
  V1_PERMIS.clear();
  const trouves = {};
  for (const k in V1_PERMIS_MOTIFS) for (const fn of Array.prototype.slice.call(HOOKS[k])) {
    if (typeof fn !== 'function') continue;
    const src = String(fn);
    for (const m of V1_PERMIS_MOTIFS[k]) if (src.includes(m)) { V1_PERMIS.add(fn); trouves[k + ':' + m] = (trouves[k + ':' + m] || 0) + 1; }
  }
  return trouves;
}

// ---------------------------------------------------------------- la Zone
const zone = {
  dedans: false, enCours: false, Z: null, graineZ: null, vallee: null, prete: false,
  passes: [], ecoute: { update: [], draw: [], lights: [], target: [], sky: [], fx: [], camera: [], entrer: [], sortir: [], repos: [], charger: [] },
  armes: [], mesures: {},

  // ------------------------------------------------------------- l'état sauvegardé (farm.s.zone)
  S() {
    const s = typeof farm !== 'undefined' && farm.s;
    if (!s) return { v: 1, dedans: false, cartes: {}, pris: {}, ouverts: {}, decouverts: {}, feux: {}, raccourcis: {} };
    const Z = s.zone || (s.zone = { v: 1 });
    if (Z.dedans === undefined) Z.dedans = false;
    if (!Z.cartes || typeof Z.cartes !== 'object') Z.cartes = {};
    for (const k of V1_CARTES) if (!Z.cartes[k] || typeof Z.cartes[k] !== 'object') Z.cartes[k] = {};
    for (const k of ['pris', 'ouverts', 'decouverts', 'feux', 'raccourcis', 'lus']) if (!Z[k] || typeof Z[k] !== 'object') Z[k] = {};
    if (!Z.entrees) Z.entrees = 0;
    return Z;
  },
  monde() { return this.Z; },
  taille() { return V1_ZONE_N * V1_ZONE_CELL; },
  graine() { return ((farm.s ? farm.s.seed : 1234) ^ 0x2B1E5EED) >>> 0; },

  // ------------------------------------------------------------- les sites réservés
  site(id) {
    const D = V1_SITES[id];
    if (!D) return null;
    V1Relief.preparer(this.graine());
    const S = this.taille(), x = D.x * S, z = D.z * S;
    const y = V1Relief.point(x, z);
    return { id, x, z, y: D.sous ? y - D.sous : y, r: D.r, sol: y, sous: D.sous || 0, agent: D.agent, nom: D.nom };
  },
  sites(agent) { return Object.keys(V1_SITES).filter((k) => !agent || V1_SITES[k].agent === agent).map((k) => this.site(k)); },
  region(x, z) {
    const S = this.taille(), u = x / S, v = z / S;
    let best = null, bd = 1e9;
    for (const k in V1_REGIONS) { const R = V1_REGIONS[k], d = Math.hypot(u - R.x, v - R.z) / R.r; if (d < bd) { bd = d; best = k; } }
    return bd < 1.6 ? best : null;
  },
  lieu(p) { const r = p ? this.region(p[0], p[2]) : null; return r ? V1_REGIONS[r].nom : V1_ZONE_NOM; },

  // ------------------------------------------------------------- les autres agents s'y accrochent
  // passe de génération : fn(Z, outils) après celle de V1, dans l'ordre d'inscription (les fichiers V2…V5)
  passe(nom, fn) { this.passes.push({ nom, fn }); },
  // type : update | draw | lights | target | sky | fx | camera (comme HOOKS, mais seulement dans la Zone) ;
  //        entrer | sortir | repos (au feu de veille) | charger (partie chargée)
  sur(type, fn) {
    if (V1_TYPES_CROCHETS.includes(type)) { fn.zoneSeule = true; HOOKS[type].push(fn); return fn; }
    if (!this.ecoute[type]) this.ecoute[type] = [];
    this.ecoute[type].push(fn);
    return fn;
  },
  annoncer(type, ...a) { for (const fn of this.ecoute[type] || []) try { fn(...a); } catch (e) { console.error('zone.' + type, e); } },

  // ------------------------------------------------------------- génération (une fois, à la première entrée)
  async preparer(progress) {
    const g = this.graine();
    if (this.Z && this.graineZ === g) return this.Z;
    const t0 = performance.now();
    this.prete = false;
    const Z = await zoneGen.generer(g, progress || (() => {}));
    this.Z = Z; this.graineZ = g; this.prete = true;
    this.mesures.generation = Math.round(performance.now() - t0);
    return Z;
  },

  // ------------------------------------------------------------- entrer
  // o : { vite (sans fondus), pos, yaw, pitch (sinon : l'arrivée du Seuil), reprise }
  async entrer(o) {
    o = o || {};
    await this.attendre();
    if (this.dedans || this.enCours || !farm.s || game.kind !== 'farm' || !farm.w) return false;
    if (typeof mondes !== 'undefined' && mondes.cur) return false;
    if (strange.inEnvers && strange.inEnvers()) return false;
    const p = game.player;
    if (p.riding) { ui.subtitle('', V1_TEXTES.chevalRefuse, 3); return false; }
    this.enCours = true;
    const sleeping0 = game.sleeping;
    game.sleeping = true;
    try {
      if (!o.vite) await ui.fade(true, '', 900);
      if (!this.Z || this.graineZ !== this.graine()) {
        $('#loading').classList.add('open');
        ui.setLoading(V1_TEXTES.generation);
        await new Promise((r) => setTimeout(r, 30));
        await this.preparer((m) => ui.setLoading(m));
        $('#loading').classList.remove('open');
      }
      this.basculer(true);
      const Z = this.Z, S = this.S(), A = Z.v1.arrivee;
      if (o.pos) { p.pos = o.pos.slice(); p.yaw = o.yaw ?? p.yaw; p.pitch = o.pitch ?? 0; }
      else { p.pos = [A.x, Z.groundAt(A.x, A.z, A.y + 1, 0.8) + 0.02, A.z]; p.yaw = A.yaw; p.pitch = -0.05; }
      p.vel = [0, 0, 0];
      game.renderer.uploadCover(p.pos[0], p.pos[2]);
      if (!o.reprise) { S.entrees++; S.derniere = farm.s.day; }
      this.annoncer('entrer', o);
      if (!o.vite) { await ui.fade(false, '', 1400); if (!o.reprise && S.entrees === 1) ui.subtitle('', '(' + V1_TEXTES.arrivee + ')', 4); }
      if (!o.reprise) farm.save();
    } catch (e) { console.error('zone.entrer', e); $('#loading').classList.remove('open'); if (!o.vite) ui.fade(false, '', 300); }
    game.sleeping = sleeping0 && o.vite ? sleeping0 : false;
    this.enCours = false;
    return this.dedans;
  },
  // ------------------------------------------------------------- sortir (par la Porte, ou par un passage : o.pos dans la vallée)
  async sortir(o) {
    o = o || {};
    await this.attendre();
    if (!this.dedans || this.enCours) return false;
    this.enCours = true;
    const sleeping0 = game.sleeping;
    game.sleeping = true;
    try {
      if (!o.vite) await ui.fade(true, '', 900);
      this.annoncer('sortir', o);
      this.basculer(false);
      const p = game.player, R = o.pos ? { pos: o.pos, yaw: o.yaw ?? p.yaw } : this.retour();
      p.pos = R.pos.slice(); p.yaw = R.yaw; p.pitch = 0; p.vel = [0, 0, 0];
      game.renderer.uploadCover(p.pos[0], p.pos[2]);
      if (!o.vite) await ui.fade(false, '', 1200);
      farm.save();
    } catch (e) { console.error('zone.sortir', e); if (!o.vite) ui.fade(false, '', 300); }
    game.sleeping = sleeping0 && o.vite ? sleeping0 : false;
    this.enCours = false;
    return !this.dedans;
  },
  // un passage en cours (une entrée qui finit son fondu…) : on l'attend (dix secondes au plus)
  async attendre() { for (let k = 0; k < 100 && this.enCours; k++) await new Promise((r) => setTimeout(r, 100)); },
  // où l'on se retrouve dans la vallée en sortant : devant la Porte
  retour() {
    const P = farm.w && farm.w.v1porte;
    if (!P) { const w = farm.w; return { pos: [w.spawn.x, w.heightAt(w.spawn.x, w.spawn.z), w.spawn.z], yaw: 0 }; }
    return { pos: [P.sortie.x, P.sortie.y, P.sortie.z], yaw: P.sortie.yaw };
  },

  // ------------------------------------------------------------- le basculement d'un monde à l'autre
  basculer(dedans) {
    const s = farm.s, S = this.S();
    if (dedans) {
      if (this.dedans) return;
      const Z = this.Z;
      this.vallee = {
        ents: { list: entities.list, byObj: entities.byObj, extra: entities.extra, version: entities.version },
        arrows: play.arrows, genProps: farm.genProps, cartes: {},
      };
      for (const k of V1_CARTES) { this.vallee.cartes[k] = s[k]; s[k] = S.cartes[k]; }
      entities.list = []; entities.byObj = new Map(); entities.extra = []; entities.version = -1;
      play.arrows = []; play.fish = null; play.bow = 0; play.ghost = null; particles.list.length = 0;
      farm.genProps = Z.v1.genProps;
      this.dedans = true; S.dedans = true;
      game.world = Z;
      game.renderer.setWorld(Z);
      farm.dirtyProps = true; play.propCenter = null;
      game.target = null; game.hiProp = null;
      if (typeof vallee !== 'undefined') { this.pluie0 = [vallee.rainK, vallee.snowK]; }
      return;
    }
    if (!this.dedans) return;
    const V = this.vallee;
    for (const k of V1_CARTES) { S.cartes[k] = s[k]; s[k] = V.cartes[k]; }
    entities.list = V.ents.list; entities.byObj = V.ents.byObj; entities.extra = V.ents.extra; entities.version = -1;
    play.arrows = V.arrows; play.fish = null; play.bow = 0; play.ghost = null; particles.list.length = 0;
    farm.genProps = V.genProps;
    this.dedans = false; S.dedans = false; S.pos = null;
    this.vallee = null;
    game.world = farm.w;
    game.renderer.setWorld(farm.w);
    farm.dirtyProps = true; play.propCenter = null;
    game.target = null; game.hiProp = null;
    // la vallée a vécu sans nous : chacun à sa place de l'heure, les bêtes de la ferme comme on les a laissées
    try { npcs.snap(farm.w); } catch (e) { console.error(e); }
    try { game.syncAnimals(); } catch (e) { console.error(e); }
  },
  // une fonction de la vallée appelée pendant qu'on est dans la Zone (le jour qui change…) : on lui rend son monde
  avecVallee(fn) {
    if (!this.dedans || !this.vallee) return fn();
    const s = farm.s, S = this.S(), V = this.vallee;
    const ents = { list: entities.list, byObj: entities.byObj, extra: entities.extra, version: entities.version };
    for (const k of V1_CARTES) s[k] = V.cartes[k];
    entities.list = V.ents.list; entities.byObj = V.ents.byObj; entities.extra = V.ents.extra;
    const gp = farm.genProps; farm.genProps = V.genProps;
    game.world = farm.w;
    this.dedans = false;
    try { return fn(); } finally {
      this.dedans = true;
      game.world = this.Z;
      farm.genProps = gp;
      V.ents = { list: entities.list, byObj: entities.byObj, extra: entities.extra, version: entities.version };
      entities.list = ents.list; entities.byObj = ents.byObj; entities.extra = ents.extra; entities.version = ents.version;
      for (const k of V1_CARTES) s[k] = S.cartes[k];
    }
  },

  // ------------------------------------------------------------- essais : aller à un site, à une région
  aller(id) {
    if (!this.dedans) return false;
    const Z = this.Z, p = game.player;
    let x, z;
    const st = V1_SITES[id] ? this.site(id) : null, R = V1_REGIONS[id];
    if (st) { x = st.x; z = st.z; } else if (R) { x = R.x * this.taille(); z = R.z * this.taille(); } else return false;
    p.pos = [x, Z.groundAt(x, z, Z.heightAt(x, z) + 1, 0.8) + 0.05, z]; p.vel = [0, 0, 0];
    game.renderer.uploadCover(x, z);
    return true;
  },

  // ------------------------------------------------------------- chargement d'une partie
  reinit(saved) {
    this.dedans = false; this.enCours = false; this.vallee = null;
    // le monde généré d'une autre partie (ou d'une partie rechargée) ne sert plus : on le refera à l'entrée
    this.Z = null; this.graineZ = null; this.prete = false;
    const S = this.S();
    if (!saved) { farm.s.zone = { v: 1, dedans: false }; this.S(); return; }
    this.annoncer('charger', S);
    if (S.dedans && S.pos) { S.dedans = false; const pos = S.pos.slice(), yaw = S.yaw || 0; setTimeout(() => this.entrer({ pos, yaw, pitch: 0, reprise: true }), 50); }
    else S.dedans = false;
  },

  // ------------------------------------------------------------- dans la Zone, chaque image
  update(dt, eye, basis, sky, playing) {
    if (!this.dedans) return;
    const Z = this.Z;
    // la météo de la Zone : de la brume, souvent ; de la cendre qui tombe sur les Cendrières
    const r = this.region(eye[0], eye[2]);
    this.meteoT = (this.meteoT || 0) - dt;
    if (this.meteoT <= 0) { this.meteoT = 4; Z.weather = this.meteo(r); }
    const cendre = r === 'cendrieres' ? 0.55 : r === 'bois_mort' ? 0.12 : 0.05;
    this.cendreK = lerp(this.cendreK || 0, cendre, Math.min(1, dt * 0.3));
    if (typeof vallee !== 'undefined') { vallee.rainK = weather.cur.rain; vallee.snowK = this.cendreK; }
  },
  meteo(r) {
    const s = farm.s, h = farm.w ? farm.w.time * 24 : 12;
    const rnd = mulberry32((this.graine() + s.day * 7919 + Math.floor(h / 3) * 131) >>> 0)();
    if (r === 'cendrieres' || r === 'etang') return rnd < 0.7 ? 'fog' : 'cloudy';
    if (r === 'hauts' || r === 'pic') return rnd < 0.25 ? 'fog' : rnd < 0.4 ? 'rain' : 'cloudy';
    return rnd < 0.45 ? 'fog' : rnd < 0.55 ? 'rain' : 'cloudy';
  },
  // le ciel de la Zone : plus sombre, plus gris, le soleil voilé
  ciel(sky) {
    if (!this.dedans) return;
    const g = (c, k) => { const l = c[0] * 0.3 + c[1] * 0.55 + c[2] * 0.15; return v3.lerp(c, [l * 1.02, l, l * 0.96], k); };
    sky.zen = v3.scale(g(sky.zen, 0.6), 0.72); sky.hor = v3.scale(g(sky.hor, 0.55), 0.78);
    sky.amb = v3.scale(g(sky.amb, 0.45), 0.8); sky.sunCol = v3.scale(g(sky.sunCol, 0.5), 0.7);
    sky.glow = v3.scale(sky.glow, 0.5); sky.haze = v3.scale(g(sky.haze, 0.6), 0.8);
    sky.moonCol = v3.scale(sky.moonCol, 0.75); sky.stars *= 0.5;
    sky.fog = [sky.fog[0] * 0.8, Math.min(sky.fog[1], 300)];
  },
  // les données d'un objet posé de la Zone (gardées dans farm.s.zone.cartes.propData, comme farm.setPropData pour la vallée)
  setPropData(q, data) {
    q.data = Object.assign({}, q.data || {}, data);
    const Z = this.Z, i = Z ? Z.props.indexOf(q) : -1;
    if (i < 0) return;
    const P = this.S().cartes.propData;
    P[i] = Object.assign({}, P[i] || {}, data);
    farm.dirtyProps = true;
  },
  installer() {
    if (this.installe) return;
    this.installe = true;
    v1Installer();
  },
};

// ---------------------------------------------------------------- branchements (au premier chargement : game existe)
function v1Installer() {
  const dans = () => zone.dedans;
  // la sauvegarde : la vallée telle qu'on l'a laissée, la Zone dans farm.s.zone
  {
    const _save = farm.save.bind(farm);
    farm.save = function () {
      if (!zone.dedans || !zone.vallee || !game.player) return _save.apply(this, arguments);
      const s = this.s, S = zone.S(), p = game.player;
      S.pos = p.pos.map((v) => Math.round(v * 100) / 100); S.yaw = p.yaw; S.pitch = p.pitch; S.dedans = true;
      const pos = p.pos, yaw = p.yaw, pitch = p.pitch, R = zone.retour(), C = {};
      p.pos = R.pos.slice(); p.yaw = R.yaw; p.pitch = 0;
      for (const k of V1_CARTES) { C[k] = s[k]; s[k] = zone.vallee.cartes[k]; }
      try { return _save.apply(this, arguments); } finally { for (const k of V1_CARTES) s[k] = C[k]; p.pos = pos; p.yaw = yaw; p.pitch = pitch; }
    };
  }
  // les habitants, l'étrange, les quêtes, les livraisons, les corbeaux : la vallée dort
  const pause = (obj, nom, val) => { if (!obj || typeof obj[nom] !== 'function') return; const f = obj[nom].bind(obj); obj[nom] = function (...a) { return dans() ? (typeof val === 'function' ? val(...a) : val) : f(...a); }; };
  pause(npcs, 'update'); pause(npcs, 'draw'); pause(npcs, 'raycast', null); pause(npcs, 'witnesses', () => []);
  pause(strange, 'update'); pause(strange, 'draw'); pause(strange, 'lights', () => []);
  if (typeof quests !== 'undefined') pause(quests, 'update');
  if (typeof deliveries !== 'undefined') pause(deliveries, 'update');
  pause(game, 'crowRaid'); pause(game, 'machineFx'); pause(game, 'syncAnimals'); pause(game, 'spawnFouilles');
  // pas de cultures dans la Zone (les cases de la ferme ont des coordonnées de la vallée)
  pause(farm, 'crop', null); pause(farm, 'canTill', false);
  {
    const _bp = play.buildProps.bind(play);
    play.buildProps = function (cam, sky) {
      if (!dans()) return _bp(cam, sky);
      const c = farm.s.crops; farm.s.crops = {};
      try { return _bp(cam, sky); } finally { farm.s.crops = c; }
    };
  }
  // le jour qui change pendant qu'on est dans la Zone : la vallée fait sa journée de son côté
  { const _ds = game.dayStart.bind(game); game.dayStart = function () { return zone.avecVallee(() => _ds()); }; }
  // dormir : pas dans la Zone (sauf aux feux de veille, qui ont leur repos) ; l'épuisement de trois heures
  { const _sl = game.sleep.bind(game); game.sleep = async function (where) { if (dans()) { ui.subtitle('', '(Pas ici. Pas sans feu.)', 3); return; } return _sl(where); }; }
  { const _fa = game.faint.bind(game); game.faint = function () { if (dans()) return zone.evanoui(); return _fa(); }; }
  // le nom du lieu (la mort, les pensées)
  { const _pn = strange.placeName.bind(strange); strange.placeName = function (p) { if (dans()) return zone.lieu(p); return _pn(p); }; }
  { const _fs = strange.fishingSpot.bind(strange); strange.fishingSpot = function (eye, dir) { if (dans()) return null; return _fs(eye, dir); }; }
  // les armes : dans la Zone, les créatures inscrites (zone.armes) sont touchées par la visée de l'étrange
  {
    const _ray = strange.raycast.bind(strange), _hit = strange.hit.bind(strange);
    strange.raycast = function (o, d, maxDist) {
      if (!dans()) return _ray(o, d, maxDist);
      let best = null;
      for (const A of zone.armes) { try { const h = A.raycast(o, d, best ? best.t : maxDist); if (h && (!best || h.t < best.t)) { h.s = h.s || {}; h.s.__v1arme = A; best = h; } } catch (e) { console.error(e); } }
      return best;
    };
    strange.hit = function (e, dmg, from) { if (e && e.__v1arme) { try { return e.__v1arme.frapper(e, dmg, from); } catch (err) { console.error(err); return; } } return _hit(e, dmg, from); };
  }
  // pas de visions ni d'autres mondes depuis la Zone
  if (typeof mondes !== 'undefined') { const _me = mondes.entrer.bind(mondes); mondes.entrer = function (...a) { if (dans()) return false; return _me(...a); }; }
  // les sons : ni oiseaux, ni grillons, ni ambiances des milieux de la vallée
  {
    const _su = sound.update.bind(sound);
    sound.update = function (dt, E) { if (dans()) E = Object.assign({}, E, { day: 0, night: 0 }); return _su(dt, E); };
    const _ba = sound.biomeAmb.bind(sound);
    sound.biomeAmb = function (dt, E) { if (dans()) { if (typeof sonV1 !== 'undefined') sonV1.ambiance(dt, E); return; } return _ba(dt, E); };
  }
  // le biome (brume, particules) : celui de la région
  { const _bi = game.biomeAt.bind(game); game.biomeAt = function (pos) { if (!dans()) return _bi(pos); const r = zone.region(pos[0], pos[2]); return r === 'cendrieres' || r === 'etang' ? 'marais' : r === 'bois_mort' ? 'foret' : 'hauteurs'; }; }
  // le rendu : la cendre tombe grise ; ni seconde lune ni herbe de bonbons
  {
    const R = game.renderer, _render = R.render.bind(R);
    R.render = function (F) {
      if (dans()) { F.snowCol = v3.scale([0.55, 0.53, 0.5], Math.min(1, (game.sky ? game.sky.amb[1] : 0.3) * 1.6 + 0.25)); F.moon2 = 0; }
      return _render(F);
    };
  }
  // poser des objets, bâtir : pas dans la Zone (elle n'est à personne)
  if (typeof builds !== 'undefined') for (const k of ['place', 'poser', 'build']) if (typeof builds[k] === 'function') pause(builds, k, false);
  // monter à cheval : il refuse la Porte (géré à l'entrée) ; pas de sifflet qui ferait venir le cheval de la vallée
  pause(game, 'whistle');
  // la mort dans la Zone : d'abord les feux de veille (11-zzzzV1-4-lieux.js), puis la règle commune
  const trouves = v1Permettre();
  zone.permisTrouves = trouves;
}

// l'épuisement (trois heures du matin) dans la Zone : on s'effondre, on se réveille au matin, au dernier feu
zone.evanoui = async function () {
  if (game.sleeping || game.dying) return;
  game.sleeping = true;
  await ui.fade(true, 'Vos jambes se dérobent. La cendre est froide.', 1800);
  const w = farm.w, p = game.player;
  game.skipHours(((0.3 - w.time + 1) % 1) * 24);
  w.time = 0.25; game.dayStart(); w.time = 0.3;
  const F = typeof feuxV1 !== 'undefined' ? feuxV1.dernier() : null, A = this.Z.v1.arrivee;
  const x = F ? F.x + 1.4 : A.x, z = F ? F.z + 1.4 : A.z;
  p.pos = [x, this.Z.groundAt(x, z, this.Z.heightAt(x, z) + 1, 0.8) + 0.02, z]; p.vel = [0, 0, 0];
  p.hp = Math.max(20, p.hp - 15);
  farm.save();
  await ui.fade(false, '', 1500);
  game.sleeping = false;
};

// ---------------------------------------------------------------- crochets de la Zone (V1)
HOOKS.update.push(Object.assign((dt, eye, basis, sky, playing) => { if (farm.s) zone.update(dt, eye, basis, sky, playing); }, { zoneSeule: true }));
HOOKS.sky.push(Object.assign((sky) => zone.ciel(sky), { zoneSeule: true }));
HOOKS.update.push(Object.assign((dt) => { if (typeof sonV1 !== 'undefined') sonV1.update(dt); }, { zone: true }));
HOOKS.load.push((saved) => { zone.installer(); zone.reinit(saved); });
DYN_PROPS.add('v1_vantail'); DYN_PROPS.add('v1_barre'); DYN_PROPS.add('v1_brasier'); DYN_PROPS.add('v1_feu');
