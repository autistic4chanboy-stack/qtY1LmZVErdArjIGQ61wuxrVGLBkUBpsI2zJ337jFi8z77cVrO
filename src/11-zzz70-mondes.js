// ============================================================================
//  AUTRES MONDES — mécanique commune
//  Deux sortes de mondes :
//   - « en surimpression » : la vallée vue autrement (le pays des bonbons, les
//     Ténèbres). Le personnage y est vraiment : il marche dans la vallée, le
//     temps passe, mais tout y a changé d'aspect, et des choses qui n'existent
//     que là-bas se dressent autour de lui ;
//   - « à part » : un lieu construit très bas sous la lisière ouest de la vallée
//     au moment où l'on y entre, défait quand on en sort (le cauchemar, les
//     Enfers). La vallée s'y arrête : son temps est suspendu.
//  API : mondes.entrer(nom, opts), mondes.sortir(opts), mondes.actuel()
//  Sauvegarde : farm.s.mondes. La position enregistrée reste toujours celle de
//  la vallée (farm.save est emballé pour cela).
// ============================================================================
const MONDES = {};       // nom -> définition (11-zzz71 à 74)
const BETES_MONDE = {};  // espèce -> définition des bêtes propres aux mondes
const MONDES_IDX = { bonbons: 0, tenebres: 1, cauchemar: 2, enfers: 3 };
// lieux « à part » : très bas sous la lisière ouest (loin de tout lieu, de tout chemin, de toute salle souterraine)
const MONDES_FOND = { cauchemar: { x: 205, z: 1190, y: -520 }, enfers: { x: 250, z: 1430, y: -320 } };
const VER_MONDE_CACHE = 0x4000; // objets de la vallée masqués le temps d'une vision (jamais dans curVer)

// ---------------------------------------------------------------- sons synthétisés (bus propre, branché sur le volume général)
const MSON = {
  bus: null, drones: {}, dist: null, mel: null,
  get ok() { return !!(sound.ok && sound.ctx); },
  sortie() {
    if (!this.bus && sound.ctx) { this.bus = sound.ctx.createGain(); this.bus.gain.value = 0.9; this.bus.connect(sound.master); }
    return this.bus;
  },
  at(d) { return sound.ctx.currentTime + (d || 0) + 0.02; },
  pan(p) { return sound.pan(clamp(p || 0, -1, 1), this.sortie()); },
  courbe() { // distorsion douce (cris, grognements)
    if (this.dist) return this.dist;
    const n = 1024, c = new Float32Array(n);
    for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; c[i] = Math.tanh(x * 4) * 0.9; }
    return (this.dist = c);
  },
  // une note de boîte à musique (faux : désaccord, k : volume)
  note(f, t, dur, k, faux, pan) {
    const c = sound.ctx, out = this.pan(pan || 0);
    for (const [m, a] of [[1, 1], [2.003, 0.32], [3.01, 0.12], [4.2, 0.05]]) {
      const o = c.createOscillator(), g = c.createGain();
      o.type = m === 1 ? 'triangle' : 'sine';
      const ff = f * m * (faux ? Math.pow(2, (Math.random() - 0.5) * faux / 12) : 1);
      o.frequency.setValueAtTime(ff, t);
      if (faux > 0.6 && Math.random() < 0.35) o.frequency.exponentialRampToValueAtTime(ff * (0.9 + Math.random() * 0.05), t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.05 * k * a, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(out); o.start(t); o.stop(t + dur + 0.05);
    }
  },
  // mélodie qui tourne (« Au clair de la lune »), déformée selon le monde
  melodie(dt, mode) {
    if (!this.ok) return;
    const c = sound.ctx;
    const NOTES = [[0, 1], [0, 1], [0, 1], [2, 1], [4, 2], [2, 2], [0, 1], [4, 1], [2, 1], [2, 1], [0, 4]];
    const M = this.mel || (this.mel = { i: 0, next: c.currentTime + 0.3, mode });
    if (M.mode !== mode) { M.mode = mode; M.next = c.currentTime + 0.4; M.i = 0; }
    const P = mode === 'bonbons' ? { base: 523.25, beat: 0.42, faux: 0.35, k: 0.55, dur: 1.4, mineur: false }
      : mode === 'tenebres' ? { base: 261.63, beat: 0.9, faux: 1.2, k: 0.45, dur: 2.2, mineur: true }
        : { base: 523.25, beat: 0.62, faux: 0.8, k: 0.22, dur: 1.6, mineur: true }; // cauchemar : lointaine
    while (M.next < c.currentTime + 0.25) {
      const [deg, len] = NOTES[M.i % NOTES.length];
      const semi = deg === 4 && P.mineur ? 3 : deg;
      const f = P.base * Math.pow(2, semi / 12) * (mode === 'bonbons' ? 1 + Math.sin(c.currentTime * 0.7) * 0.012 : 1);
      if (!(mode === 'tenebres' && Math.random() < 0.12)) this.note(f, Math.max(M.next, c.currentTime + 0.01), P.dur * (len > 1 ? 1.3 : 1), P.k, P.faux, Math.sin(M.i * 0.9) * 0.3);
      M.next += P.beat * len * (mode === 'tenebres' ? 0.85 + Math.random() * 0.4 : 1);
      M.i++;
      if (M.i % NOTES.length === 0) M.next += P.beat * (mode === 'bonbons' ? 2 : 4);
    }
  },
  // bourdon tenu (plusieurs oscillateurs), coupé en fondu
  drone(nom, freqs, vol, type, lp) {
    if (!this.ok || this.drones[nom]) return;
    const c = sound.ctx, g = c.createGain(), f = c.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = lp || 400;
    g.gain.setValueAtTime(0.0001, c.currentTime); g.gain.linearRampToValueAtTime(vol, c.currentTime + 3);
    f.connect(g).connect(this.sortie());
    const oscs = freqs.map((fr) => { const o = c.createOscillator(); o.type = type || 'sine'; o.frequency.value = fr; o.connect(f); o.start(); return o; });
    this.drones[nom] = { g, oscs };
  },
  stopDrone(nom) {
    const D = this.drones[nom];
    if (!D) return;
    delete this.drones[nom];
    if (!sound.ctx) return;
    const t = sound.ctx.currentTime;
    try { D.g.gain.cancelScheduledValues(t); D.g.gain.setValueAtTime(D.g.gain.value, t); D.g.gain.linearRampToValueAtTime(0.0001, t + 1.5); for (const o of D.oscs) o.stop(t + 1.6); } catch (e) { /* déjà arrêté */ }
  },
  stopTout() { for (const k of Object.keys(this.drones)) this.stopDrone(k); this.mel = null; },
  // cri déformé (voix humaine qui se brise), k : volume, h : hauteur
  cri(k = 1, h = 1, dur = 1.4, pan = 0) {
    if (!this.ok) return;
    const c = sound.ctx, t = this.at(), ws = c.createWaveShaper(), out = this.pan(pan), bp = c.createBiquadFilter(), g = c.createGain();
    ws.curve = this.courbe(); bp.type = 'bandpass'; bp.frequency.value = 1100 * h; bp.Q.value = 0.9;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.11 * k, t + 0.08); g.gain.setValueAtTime(0.1 * k, t + dur * 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    ws.connect(bp).connect(g).connect(out);
    for (const [ty, m] of [['sawtooth', 1], ['square', 1.49], ['sawtooth', 0.51]]) {
      const o = c.createOscillator(), l = c.createOscillator(), lg = c.createGain();
      o.type = ty; o.frequency.setValueAtTime(520 * h * m, t); o.frequency.linearRampToValueAtTime(900 * h * m, t + dur * 0.3); o.frequency.exponentialRampToValueAtTime(180 * h * m, t + dur);
      l.frequency.value = 23 + Math.random() * 12; lg.gain.value = 90 * h * m;
      l.connect(lg).connect(o.frequency); o.connect(ws);
      o.start(t); o.stop(t + dur + 0.05); l.start(t); l.stop(t + dur + 0.05);
    }
  },
  // souffle rauque (inspiration / expiration), k : proximité
  souffle(k = 1, pan = 0) {
    if (!this.ok) return;
    const t = this.at(), out = this.pan(pan);
    sound.noiseHit(t, 0.7, 'bandpass', 420, 1.8, 0.07 * k, out, 700);
    sound.noiseHit(t + 0.85, 0.9, 'bandpass', 620, 1.6, 0.06 * k, out, 260);
    sound.voice(t + 0.85, 'sawtooth', 70, 52, 0.8, 0.02 * k, out, { lp: 260 });
  },
  // grincement (bois, porte, plancher)
  grince(k = 1, pan = 0) {
    if (!this.ok) return;
    const t = this.at(), out = this.pan(pan);
    sound.voice(t, 'sawtooth', 160 + Math.random() * 80, 110 + Math.random() * 60, 0.6 + Math.random() * 0.6, 0.03 * k, out, { vib: 7, vibDepth: 25, lp: 900, lp2: 500 });
  },
  // métal traîné sur la pierre
  metal(k = 1, dur = 1.2, pan = 0) {
    if (!this.ok) return;
    const t = this.at(), out = this.pan(pan);
    for (let i = 0; i < 3; i++) sound.noiseHit(t + i * dur / 3, dur / 2.5, 'bandpass', 2600 + Math.random() * 1400, 12, 0.05 * k, out, 1800 + Math.random() * 900);
    for (let i = 0; i < 8; i++) sound.tone(t + Math.random() * dur, 'square', 3000 + Math.random() * 2000, 2400, 0.02, 0.008 * k, out, 0.002);
  },
  // rire étouffé, déformé
  rire(k = 1, h = 1, pan = 0) {
    if (!this.ok) return;
    const t = this.at(), out = this.pan(pan);
    for (let i = 0; i < 6; i++) sound.voice(t + i * 0.16, 'sawtooth', (330 - i * 18) * h, (250 - i * 16) * h, 0.12, 0.03 * k, out, { bp: 900 * h, q: 2 });
  },
  sanglot(k = 1, pan = 0) {
    if (!this.ok) return;
    const t = this.at(), out = this.pan(pan);
    for (let i = 0; i < 3; i++) sound.voice(t + i * 0.5, 'triangle', 420 + i * 20, 300, 0.35, 0.025 * k, out, { vib: 9, vibDepth: 30, bp: 1100, q: 1.5 });
  },
  gemissement(k = 1, pan = 0) {
    if (!this.ok) return;
    sound.voice(this.at(), 'sawtooth', 190 + Math.random() * 60, 150, 1.8 + Math.random(), 0.02 * k, this.pan(pan), { vib: 4, vibDepth: 14, lp: 700 });
  },
  scintille(k = 1) { // éclat de sucre
    if (!this.ok) return;
    const t = this.at(), out = this.pan(Math.random() * 2 - 1);
    for (let i = 0; i < 4; i++) sound.tone(t + i * 0.06, 'sine', 1900 + i * 420 + Math.random() * 200, 2600, 0.12, 0.012 * k, out, 0.003);
  },
  crepite(k = 1) {
    if (!this.ok) return;
    const t = this.at();
    for (let i = 0; i < 6; i++) sound.noiseHit(t + Math.random() * 0.8, 0.02, 'bandpass', 1200 + Math.random() * 1800, 1.4, 0.04 * k, this.pan(Math.random() * 2 - 1));
  },
};

// ---------------------------------------------------------------- comportements des bêtes des mondes
const IA_MONDE = {
  errant(e, dt) {
    const d = e.d, p = game.player;
    const alerte = (d.fuite || 0) * (p.crouch > 0.5 ? 0.5 : 1) * (p.sprinting ? 1.4 : 1);
    if (alerte && e.dist < alerte && e.state !== 'fuite') { e.state = 'fuite'; e.timer = 2 + Math.random() * 2; e.fuiteDir = Math.atan2(e.x - p.pos[0], e.z - p.pos[2]) + (Math.random() - 0.5) * 0.6; }
    e.timer -= dt;
    if (e.state === 'fuite') { if (!this.marcher(e, dt, e.fuiteDir, d.vitesse[1])) e.fuiteDir += 1.2; if (e.timer <= 0) { e.state = 'idle'; e.timer = 1 + Math.random() * 3; } }
    else if (e.state === 'marche') { const dd = Math.hypot(e.tx - e.x, e.tz - e.z); if (dd < 0.8 || e.timer <= 0 || !this.marcher(e, dt, Math.atan2(e.tx - e.x, e.tz - e.z), d.vitesse[0])) { e.state = 'idle'; e.timer = 1 + Math.random() * 4; } }
    else { e.move = Math.max(0, e.move - dt * 4); if (e.timer <= 0) { const a = Math.random() * TAU, r = Math.random() * (d.rayon || 12); e.tx = e.hx + Math.cos(a) * r; e.tz = e.hz + Math.sin(a) * r; e.state = 'marche'; e.timer = 12; } }
    e.run = e.state === 'fuite';
    return true;
  },
  chasseur(e, dt) {
    const d = e.d, p = game.player;
    const vue = (d.vue || 28) * (p.crouch > 0.5 ? 0.6 : 1) * (game.lantern && d.lumiere ? 1.6 : 1);
    if (e.state !== 'chasse' && e.dist < vue && Math.abs(e.dy) < 5) { e.state = 'chasse'; if (d.alerte) d.alerte.call(this, e); }
    if (e.state === 'chasse') {
      if (e.dist > (d.perd || 70) || Math.abs(e.dy) > 8) { e.state = 'idle'; e.timer = 2; return true; }
      const dir = Math.atan2(p.pos[0] - e.x, p.pos[2] - e.z);
      if (e.dist > (d.portee || 1.3)) { if (!this.marcher(e, dt, dir, d.vitesse[1])) e.heading += (Math.random() - 0.5) * 0.8; e.run = true; }
      else {
        e.move = Math.max(0, e.move - dt * 5); e.heading = turnToward(e.heading, dir, dt * 8);
        if (e.atkT <= 0) { e.atkT = d.cadence || 1.6; e.attaque = 0.4; this.blesser(d.degats || 8, e, d.cause || 'Mort de peur'); if (d.mord) d.mord.call(this, e); }
      }
      if (d.bruit) { e.bruitT = (e.bruitT || 0) - dt; if (e.bruitT <= 0) { e.bruitT = d.bruitT || 4; d.bruit.call(this, e); } }
      return true;
    }
    return IA_MONDE.errant.call(this, e, dt);
  },
  // reste là, se tourne vers le personnage ; parle quand on s'approche
  immobile(e, dt) {
    const p = game.player;
    e.move = 0;
    if (e.dist < (e.d.regard || 25)) e.heading = turnToward(e.heading, Math.atan2(p.pos[0] - e.x, p.pos[2] - e.z), dt * 2);
    if (e.d.proche && e.dist < (e.d.procheD || 4) && !e.ditProche) { e.ditProche = true; e.d.proche.call(this, e); }
    if (e.dist > (e.d.procheD || 4) + 6) e.ditProche = false;
    return true;
  },
};

const mondes = {
  cur: null, t: 0, seq: 0, k: [0, 0, 0, 0], fx2: [0, 0, 0, 0], voile: [0, 0, 0, 0], voileK: [0, 0, 0, 0], flashTenebres: 0, installe: false,
  blocs: [], choses: [], betes: [], caches: [], sprMaps: {}, gUV: null, gSize: null, vise: null,
  // ---------------------------------------------------------------- état sauvegardé
  S() {
    const s = farm.s;
    if (!s) return { vus: {}, pris: {} };
    const M = s.mondes || (s.mondes = {});
    if (!M.vus) M.vus = {};
    if (!M.pris) M.pris = {};
    if (M.cur === undefined) M.cur = null;
    return M;
  },
  actuel() { return this.cur; },
  def(nom) { return MONDES[nom || this.cur] || null; },
  aPart(nom) { const D = MONDES[nom || this.cur]; return !!(D && D.aPart); },
  fond(nom) { return MONDES_FOND[nom || this.cur]; },

  // ---------------------------------------------------------------- entrer, sortir
  entrer(nom, opts) {
    opts = opts || {};
    const D = MONDES[nom];
    if (!D || !farm.s || game.kind !== 'farm' || !game.world) return false;
    if (this.cur === nom && !opts.restaurer) { if (D.prolonger) D.prolonger(opts); return true; }
    if (this.cur) this.sortir({ vers: nom, silencieux: true });
    const S = this.S(), p = game.player;
    if (D.aPart && !S.retour && !opts.restaurer) S.retour = { pos: p.pos.slice(), yaw: p.yaw, pitch: p.pitch };
    this.cur = nom; this.t = 0; this.vise = null;
    S.cur = nom;
    if (!opts.restaurer) { S.depuis = farm.s.hours; S.vus[nom] = (S.vus[nom] || 0) + 1; S.pris = {}; }
    if (D.aPart) { this.timeScale0 = game.timeScale; game.timeScale = 0; this.k = [0, 0, 0, 0]; this.k[MONDES_IDX[nom]] = 1; }
    try { D.entrer(opts); } catch (e) { console.error(e); }
    this.appliquer();
    return true;
  },
  sortir(opts) {
    opts = opts || {};
    const nom = this.cur;
    if (!nom) return false;
    const D = MONDES[nom], S = this.S(), p = game.player;
    try { D.sortir(opts); } catch (e) { console.error(e); }
    this.nettoyer();
    this.cur = null;
    S.cur = null;
    if (D.aPart) {
      game.timeScale = this.timeScale0 || 1;
      this.k[MONDES_IDX[nom]] = 0;
      if (S.retour && !opts.garderPos) { const R = S.retour; p.pos = R.pos.slice(); p.yaw = R.yaw; p.pitch = R.pitch || 0; p.vel = [0, 0, 0]; if (game.renderer) game.renderer.uploadCover(p.pos[0], p.pos[2]); }
      S.retour = null;
    }
    if (!opts.vers) MSON.stopTout();
    this.appliquer();
    return true;
  },
  // rendu, habitants, bêtes de la ferme : selon le monde actuel
  appliquer() {
    const w = game.world, D = this.def();
    if (!w) return;
    const map = D && D.sprite ? this.sprMap(this.cur) : null;
    if (w.sprMap !== map) { w.sprMap = map; w.objectsDirty = true; }
    const cacher = !!(D && D.pnjCaches);
    if (cacher !== !!this.pnjCaches) { this.pnjCaches = cacher; npcs.vanishAll(cacher || strange.redNight() || strange.inEnvers()); }
  },
  // retire tout ce qu'un monde a posé dans la vallée
  nettoyer() {
    const w = game.world;
    if (this.blocs.length && w) {
      const set = new Set(this.blocs), B = w.blocks;
      let j = 0, x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9, surf = false;
      for (let i = 0; i < B.length; i++) { const b = B[i]; if (set.has(b)) { if (!b.under) { surf = true; x0 = Math.min(x0, b.x); z0 = Math.min(z0, b.z); x1 = Math.max(x1, b.x); z1 = Math.max(z1, b.z); } continue; } B[j++] = b; }
      B.length = j;
      w.grid = null; w.blocksDirty = true; w.coverDirty = true;
      if (surf) { w.shadeDirty = true; w.shadeRegion = [x0 - 20, z0 - 20, x1 + 20, z1 + 20]; }
    }
    this.blocs = [];
    this.montrer();
    this.choses = []; this.betes = []; this.vise = null;
  },

  // ---------------------------------------------------------------- constructions
  // bloc dans un repère f = { x, y, z, r } ; o : { under, ceil, hidden }
  bloc(f, lx, ly, lz, sx, sy, sz, m, er, sh, o) {
    const c = Math.cos(f.r || 0), s = Math.sin(f.r || 0);
    const b = { x: f.x + lx * c + lz * s, y: f.y + ly, z: f.z - lx * s + lz * c, sx, sy, sz, r: (f.r || 0) + (er || 0), m, sh: sh || 0, monde: this.cur };
    if (o) Object.assign(b, o);
    if (this.aPart()) b.under = true;
    game.world.blocks.push(b); this.blocs.push(b);
    return b;
  },
  // mur (le long de x si alongX) du niveau y0 au niveau H, percé au centre d'une porte de largeur g et de hauteur gh
  mur(f, cx, cz, len, alongX, H, ep, m, g, gh, o, y0) {
    y0 = y0 || 0;
    if (!g) return this.bloc(f, cx, y0, cz, alongX ? len : ep, H - y0, alongX ? ep : len, m, 0, 0, o);
    const seg = (len - g) / 2;
    for (const sg of [-1, 1]) this.bloc(f, cx + (alongX ? sg * (g / 2 + seg / 2) : 0), y0, cz + (alongX ? 0 : sg * (g / 2 + seg / 2)), alongX ? seg : ep, H - y0, alongX ? ep : seg, m, 0, 0, o);
    if (H > gh) this.bloc(f, cx, gh, cz, alongX ? g : ep, H - gh, alongX ? ep : g, m, 0, 0, o);
  },
  // hauteurs extrêmes du relief sous un rectangle local
  relief(f, hw, hd) {
    const w = game.world;
    let mn = 1e9, mx = -1e9;
    for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) { const [x, z] = this.toWorld(f, hw * i / 2, hd * j / 2), h = w.heightAt(x, z); mn = Math.min(mn, h); mx = Math.max(mx, h); }
    return [mn, mx];
  },
  // marches devant une porte (du sol jusqu'au plancher)
  marches(f, lx, lz, larg, haut, dir, m) {
    if (haut < 0.3) return;
    const n = Math.ceil(haut / 0.35), d = dir || -1, bot = -haut - 0.4;
    for (let k = 1; k <= n; k++) { const top = -haut * k / (n + 1); this.bloc(f, lx, bot, lz + d * (k * 0.5 - 0.1), larg, top - bot, 0.5, m ?? M_CHOCOLAT); }
  },
  finConstruction(region) {
    const w = game.world;
    w.grid = null; w.blocksDirty = true; w.coverDirty = true;
    if (region && !this.aPart()) { w.shadeDirty = true; w.shadeRegion = region; }
  },
  toWorld(f, lx, lz) { const c = Math.cos(f.r || 0), s = Math.sin(f.r || 0); return [f.x + lx * c + lz * s, f.z - lx * s + lz * c]; },
  // masque les objets de la vallée (arbres, fleurs…) dans un rectangle local (le temps de la vision)
  cacherObjets(f, hw, hd) {
    const w = game.world, G = w.objectsGrid(), C = G.C, R = Math.hypot(hw, hd);
    const gx0 = clamp(Math.floor((f.x - R) / C), 0, G.gw - 1), gx1 = clamp(Math.floor((f.x + R) / C), 0, G.gw - 1);
    const gz0 = clamp(Math.floor((f.z - R) / C), 0, G.gw - 1), gz1 = clamp(Math.floor((f.z + R) / C), 0, G.gw - 1);
    const c = Math.cos(f.r || 0), s = Math.sin(f.r || 0);
    let n = 0;
    for (let gz = gz0; gz <= gz1; gz++) for (let gx = gx0; gx <= gx1; gx++) {
      const cell = G.cells[gz * G.gw + gx];
      if (!cell) continue;
      for (const i of cell) {
        const o = w.objects[i];
        if (!o || OBJ_TYPES[o.t].animal || o.ver === VER_MONDE_CACHE) continue;
        const dx = o.x - f.x, dz = o.z - f.z, lx = dx * c - dz * s, lz = dx * s + dz * c;
        if (Math.abs(lx) > hw || Math.abs(lz) > hd) continue;
        this.caches.push([o, o.ver]); o.ver = VER_MONDE_CACHE; n++;
      }
    }
    if (n) { w.objectsDirty = true; w.grid = null; w.allGrid = null; }
    return n;
  },
  montrer() {
    if (!this.caches.length) return;
    for (const [o, v] of this.caches) { if (v === undefined) delete o.ver; else o.ver = v; }
    this.caches = [];
    const w = game.world;
    if (w) { w.objectsDirty = true; w.grid = null; w.allGrid = null; }
  },
  // un endroit pour une construction de la vision : assez plat, au sec, loin des maisons, des chemins et des champs
  site(cx, cz, dMin, dMax, rayon, rnd, pref) {
    const w = game.world, WL = w.waterLevel, fm = w.farm;
    rnd = rnd || Math.random;
    let best = null;
    for (let k = 0; k < 160; k++) {
      const a = pref !== undefined && k < 80 ? pref + (rnd() - 0.5) * 2.2 : rnd() * TAU, d = dMin + rnd() * (dMax - dMin);
      const x = cx + Math.sin(a) * d, z = cz + Math.cos(a) * d;
      if (!w.inside(x, z, rayon + 20)) continue;
      let mn = 1e9, mx = -1e9;
      for (let i = 0; i < 12; i++) { const b = i / 12 * TAU, r = i % 2 ? rayon : rayon * 0.5, h = w.heightAt(x + Math.cos(b) * r, z + Math.sin(b) * r); mn = Math.min(mn, h); mx = Math.max(mx, h); }
      if (mn < WL + 0.8 || mx - mn > 2.2 + rayon * 0.1) continue;
      if (this.occupe(x, z, rayon)) continue;
      if (fm && fm.field && x > fm.field.x0 - rayon - 6 && x < fm.field.x1 + rayon + 6 && z > fm.field.z0 - rayon - 6 && z < fm.field.z1 + rayon + 6) continue;
      const score = (mx - mn) + Math.abs(d - (dMin + dMax) / 2) * 0.02 + rnd() * 0.5;
      if (!best || score < best.score) best = { x, z, y: mn, score, pente: mx - mn };
    }
    return best;
  },
  occupe(x, z, r) {
    const w = game.world;
    for (const k in w.bld) { const b = w.bld[k]; if (!b.under && Math.hypot(b.x - x, b.z - z) < r + Math.max(b.W || 8, b.D || 8) * 0.7 + 6) return true; }
    for (const n of w.nav.nodes) if (Math.abs(n.x - x) < r + 14 && Math.abs(n.z - z) < r + 14 && Math.hypot(n.x - x, n.z - z) < r + 12) return true;
    if (w.townInfo && Math.max(Math.abs(x - w.townInfo.x), Math.abs(z - w.townInfo.z)) < 70 + r) return true;
    let bloque = false;
    w.query(x, z, r + 2, null, (b) => { if (!bloque && !b.hidden && !b.under && Math.hypot(b.x - x, b.z - z) < r + Math.max(b.sx, b.sz) / 2 + 2 && b.y < w.heightAt(b.x, b.z) + 6) bloque = true; });
    if (bloque) return true;
    for (const q of w.props) if (!q.gone && Math.abs(q.x - x) < r + 3 && Math.abs(q.z - z) < r + 3) return true;
    for (const k in farm.s.crops) { const i = k.indexOf(','), cx = +k.slice(0, i), cz = +k.slice(i + 1); if (Math.abs(cx - x) < r + 4 && Math.abs(cz - z) < r + 4) return true; }
    return false;
  },

  // ---------------------------------------------------------------- choses (plantes, objets à ramasser, décors)
  // c : { x, y, z, r, s, modele(PE, c, t), rayon, h, item, n, nom, cle, prendre(c), lumiere: { c, r, y } }
  chose(o) {
    const S = this.S();
    if (o.cle && S.pris[o.cle]) return null;
    const c = Object.assign({ id: ++this.seq, monde: this.cur, r: 0, s: 1, rayon: 0.6, h: 0.8 }, o);
    if (c.y === undefined) c.y = this.solY(c.x, c.z, c.yRef);
    this.choses.push(c);
    return c;
  },
  prendre(c) {
    if (!c || c.pris) return;
    if (c.prendre) { if (c.prendre.call(this, c) === false) return; }
    else if (c.item) { farm.give(c.item, c.n || 1); play.flyer(c.item, [c.x, c.y + 0.5, c.z], c.n || 1); sound.pop(); if (c.dit) ui.subtitle('', c.dit, 3); }
    if (c.reste) return;
    c.pris = true;
    if (c.cle) this.S().pris[c.cle] = 1;
    const i = this.choses.indexOf(c);
    if (i >= 0) this.choses.splice(i, 1);
  },
  solY(x, z, yRef) {
    const w = game.world;
    if (yRef === undefined) return w.groundAt(x, z, w.heightAt(x, z) + 0.6, 0.6);
    const g = w.groundAt(x, z, yRef + 0.6, 0.9);
    return g < yRef - 6 ? yRef - 50 : g; // pas de sol : un trou
  },

  // ---------------------------------------------------------------- bêtes
  bete(kind, x, z, o) {
    const d = BETES_MONDE[kind];
    if (!d) return null;
    const e = Object.assign({ id: ++this.seq, monde: this.cur, kind, d, x, z, hx: x, hz: z, heading: Math.random() * TAU, hp: d.hp || 10, state: 'idle', timer: Math.random() * 3, t: 0, phase: Math.random() * 6, move: 0, v: (Math.random() * 6) | 0, s: d.echelle || 1, atkT: 0, dist: 1e9, dy: 0 }, o || {});
    e.rig = d.rig(e.v, e);
    e.y = e.y !== undefined ? e.y : this.solY(e.x, e.z, e.yRef);
    this.betes.push(e);
    return e;
  },
  marcher(e, dt, dir, speed) {
    const w = game.world, d = e.d;
    e.heading = turnToward(e.heading, dir, dt * (d.tourne || 5));
    let nx = e.x + Math.sin(e.heading) * speed * dt, nz = e.z + Math.cos(e.heading) * speed * dt;
    if (!w.inside(nx, nz, 4)) return false;
    [nx, nz] = w.collideCircle(nx, nz, e.y, e.y + (d.h || 1) * e.s, (d.r || 0.3) * e.s, 0.5, true);
    const y = this.solY(nx, nz, e.y);
    if (y < e.y - 1.2 || y > e.y + 0.7) return false;
    if (!this.aPart() && w.heightAt(nx, nz) < w.waterLevel + 0.1) return false;
    if (d.enclos && Math.hypot(nx - e.hx, nz - e.hz) > d.enclos) return false;
    const moved = Math.hypot(nx - e.x, nz - e.z);
    e.x = nx; e.z = nz; e.y = y;
    e.move = Math.min(1, e.move + dt * 6); e.phase += dt * speed * 2.4 / Math.max(0.5, (d.h || 1) * e.s);
    return moved > speed * dt * 0.2;
  },
  updateBetes(dt) {
    const p = game.player;
    for (let i = this.betes.length - 1; i >= 0; i--) {
      const e = this.betes[i];
      if (e.mort) { e.mortT += dt; if (e.mortT > 1.4) this.betes.splice(i, 1); continue; }
      e.t += dt; e.atkT = Math.max(0, e.atkT - dt); e.hurtT = Math.max(0, (e.hurtT || 0) - dt); e.attaque = Math.max(0, (e.attaque || 0) - dt);
      e.dist = Math.hypot(p.pos[0] - e.x, p.pos[2] - e.z); e.dy = p.pos[1] - e.y;
      if (e.dist > (e.d.actif || 150)) continue;
      const ia = typeof e.d.ia === 'function' ? e.d.ia : IA_MONDE[e.d.ia || 'errant'];
      let r = true;
      try { r = ia.call(this, e, dt); } catch (err) { console.error(err); }
      if (r === false) this.betes.splice(i, 1);
    }
  },
  // coup reçu (armes, flèches, fusil : par la visée de l'étrange)
  frapper(e, dmg) {
    if (!e || e.mort) return;
    const d = e.d;
    if (d.intouchable) { if (d.touche) d.touche.call(this, e, dmg); return; }
    e.hp -= dmg; e.hurtT = 0.3;
    if (d.touche) d.touche.call(this, e, dmg);
    if (e.hp <= 0) {
      e.mort = true; e.mortT = 0;
      if (d.meurt) d.meurt.call(this, e);
      for (const [item, a, b, pr] of d.butin || []) { if (pr !== undefined && Math.random() > pr) continue; const n = a + Math.floor(Math.random() * (b - a + 1)); if (n > 0) { farm.give(item, n); play.flyer(item, [e.x, e.y + 0.5, e.z], n); } }
      return;
    }
    if (d.ia === 'chasseur') e.state = 'chasse';
    else if (d.fuite !== undefined) { e.state = 'fuite'; e.timer = 3; const p = game.player; e.fuiteDir = Math.atan2(e.x - p.pos[0], e.z - p.pos[2]); }
  },
  // blessure infligée par une bête d'un monde (dans les visions, le corps paie aussi — sans descendre sous un seuil)
  blesser(dmg, src, cause) {
    const p = game.player, D = this.def();
    const plancher = D && D.plancher !== undefined ? (typeof D.plancher === 'function' ? D.plancher() : D.plancher) : 0;
    if (plancher > 0) dmg = Math.min(dmg, Math.max(0, p.hp - plancher));
    if (dmg <= 0) { play.hurtFlash = Math.min(1, play.hurtFlash + 0.4); game.shakeT = 0.3; sound.hurt && sound.hurt(4); return; }
    play.hurt(dmg, src, cause);
  },
  raycast(o, d, maxDist) {
    let best = null;
    const dh = Math.hypot(d[0], d[2]) || 1e-6;
    for (const e of this.betes) {
      if (e.mort || e.d.fantome) continue;
      const r = Math.max(0.3, (e.d.r || 0.3) * 1.3 * e.s), cx = e.x - o[0], cz = e.z - o[2];
      const tc = (cx * d[0] + cz * d[2]) / (dh * dh);
      if (tc < 0 || tc > maxDist) continue;
      const px = d[0] * tc - cx, pz = d[2] * tc - cz;
      if (px * px + pz * pz > r * r) continue;
      const y = o[1] + d[1] * tc;
      if (y < e.y - 0.1 || y > e.y + (e.d.h || 1) * e.s + 0.15) continue;
      if (!best || tc < best.t) best = { t: tc, s: e, p: [o[0] + d[0] * tc, y, o[2] + d[2] * tc] };
    }
    return best;
  },

  // ---------------------------------------------------------------- rendu
  sprMap(nom) {
    if (this.sprMaps[nom]) return this.sprMaps[nom];
    const D = MONDES[nom], M = {};
    for (const t of OBJ_TYPES) {
      if (t.animal) continue;
      let r;
      try { r = D.sprite(t); } catch (e) { r = undefined; }
      if (r === null) M[t.id] = null;
      else if (r && r.every((id) => ATLAS.sprites[id])) M[t.id] = r;
    }
    return (this.sprMaps[nom] = M);
  },
  herbeBonbons() {
    if (this.gUV) return true;
    const ids = ['bbg_0', 'bbg_1', 'bbg_2', 'bbg_3', 'bbg_4', 'bbg_5', 'bbg_f0', 'bbg_f1', 'bbg_f2', 'bbg_f3', 'bbg_f4', 'bbg_f5'];
    if (!ids.every((id) => ATLAS.sprites[id])) return false;
    const uv = new Float32Array(48), sz = new Float32Array(24);
    GRASS_VARIANTS.forEach(([, h], i) => { const s = ATLAS.sprites[ids[i]]; uv.set([s.u0, s.v0, s.u1, s.v1], i * 4); sz.set([h * s.aspect * 1.1, h * 1.1], i * 2); });
    this.gUV = uv; this.gSize = sz;
    return true;
  },
  // mélange le ciel vers les couleurs d'un monde (T : champs du ciel ; k : 0..1)
  melerCiel(sky, T, k) {
    if (k <= 0) return;
    for (const f of ['zen', 'hor', 'amb', 'glow', 'haze', 'cloudLit', 'cloudDark', 'sunCol', 'moonCol', 'sunDisk', 'moonTint']) if (T[f] && sky[f]) sky[f] = v3.lerp(sky[f], T[f], k);
    for (const f of ['stars', 'sunVis', 'moonVis', 'cloudCover', 'mist', 'shadowK']) if (T[f] !== undefined && sky[f] !== undefined) sky[f] = lerp(sky[f], T[f], k);
    if (T.fog) sky.fog = [lerp(sky.fog[0], T.fog[0], k), lerp(sky.fog[1], T.fog[1], k)];
    if (T.sunDir && k > 0.5) sky.sunDir = T.sunDir;
    if (T.nightLit !== undefined && k > 0.5) sky.nightLit = T.nightLit;
  },

  // ---------------------------------------------------------------- chaque image
  update(dt, eye, basis, sky, playing) {
    const D = this.def();
    // intensités lissées (effets d'écran, ciel)
    for (const nom in MONDES_IDX) {
      const i = MONDES_IDX[nom], Dn = MONDES[nom];
      const tgt = this.cur === nom ? (Dn && Dn.intensite ? Dn.intensite() : 1) : 0;
      this.k[i] += (tgt - this.k[i]) * Math.min(1, dt * (Dn && Dn.aPart ? 6 : 0.9));
      if (Math.abs(tgt - this.k[i]) < 0.002) this.k[i] = tgt;
    }
    this.fx2 = this.k.slice();
    // voiles venus d'ailleurs (montée d'une pilule, éclairs du manque)
    for (let i = 0; i < 4; i++) { this.voileK[i] += (this.voile[i] - this.voileK[i]) * Math.min(1, dt * 1.5); this.fx2[i] = Math.max(this.fx2[i], this.voileK[i]); }
    this.voile = [0, 0, 0, 0];
    if (this.flashTenebres > 0) { this.flashTenebres -= dt; this.fx2[1] = Math.max(this.fx2[1], Math.min(1, this.flashTenebres) * 0.55); }
    if (!D) return;
    if (D.aPart) strange.fear = 0; // (l'étrange de la vallée est suspendu : chaque monde à part règle la peur lui-même)
    this.t += dt;
    if (D.update) try { D.update(dt, playing); } catch (e) { console.error(e); }
    if (!this.cur) return;
    if (playing) this.updateBetes(dt);
    if (D.fx) this.fx2 = D.fx(this.fx2) || this.fx2;
    // sécurité : on ne tombe pas hors d'un monde à part
    if (D.aPart && D.depart) { const p = game.player; if (p.pos[1] < this.fond().y - 40) { p.pos = D.depart.slice(); p.vel = [0, 0, 0]; } }
  },
  dessiner(buf, sbuf, cam, t) {
    if (!this.cur) return;
    const D = this.def(), tg = game.target;
    PE.buf = buf;
    for (const c of this.choses) {
      if (!c.modele) continue;
      const dx = c.x - cam[0], dz = c.z - cam[2];
      if (dx * dx + dz * dz > (c.loin || 70) * (c.loin || 70)) continue;
      PE.frame(c.x, c.y, c.z, c.r, c.s);
      PE.fl = tg && tg.chose === c ? FX_HI : 0;
      try { c.modele(PE, c, t); } catch (e) { console.error(e); c.modele = null; }
      PE.fl = 0;
    }
    for (const e of this.betes) {
      const dx = e.x - cam[0], dz = e.z - cam[2];
      if (dx * dx + dz * dz > 95 * 95 || e.cache) continue;
      const r = e.rig, st = { move: e.move, phase: e.phase, run: e.run, t, lookY: 0, attack: e.attaque > 0 ? e.attaque / 0.4 : 0, pale: e.d.pale };
      if (e.d.pose) e.d.pose(e, r, t, st);
      else if (r.kind === 'quad') poseQuad(r, st);
      else if (r.kind === 'bird') poseBird(r, st);
      else poseHuman(r, st);
      const fl = (e.hurtT > 0 || (tg && tg.bete === e)) ? FX_HI : 0;
      const y = e.mort ? e.y - Math.min(1, e.mortT) * (e.d.h || 1) * 0.6 : e.y + (e.d.flotte ? Math.sin(t * 1.4 + e.id) * e.d.flotte : 0);
      drawRig(buf, r, e.x, y, e.z, e.heading, e.s, fl);
      if (sbuf && !e.d.sansOmbre && !e.mort) drawShadow(sbuf, e.x, e.y, e.z, Math.max(0.2, (e.d.r || 0.3) * e.s));
    }
    if (D.dessiner) try { D.dessiner(buf, sbuf, cam, t); } catch (e) { console.error(e); }
  },
  lumieres(eye) {
    if (!this.cur) return [];
    const D = this.def(), L = [];
    for (const c of this.choses) {
      if (!c.lumiere) continue;
      const d = Math.hypot(c.x - eye[0], c.z - eye[2]);
      if (d > 70) continue;
      const fl = c.lumiere.vacille ? 1 + Math.sin(game.time * 11 + c.id) * 0.08 + Math.sin(game.time * 23 + c.id * 3) * 0.05 : 1;
      L.push({ x: c.x, y: c.y + (c.lumiere.y || 0.5), z: c.z, r: c.lumiere.r || 6, c: v3.scale(c.lumiere.c, fl), d });
    }
    if (D.lumieres) try { for (const l of D.lumieres(eye)) L.push(l); } catch (e) { console.error(e); }
    return L;
  },
  // cibles de la touche E : choses à ramasser, bêtes à qui parler
  cibles(eye, f, cand) {
    if (!this.cur) return;
    const w = game.world;
    const vis = (x, y, z, rayon) => {
      const dx = x - eye[0], dy = y - eye[1], dz = z - eye[2], d = Math.hypot(dx, dy, dz);
      if (d > 2.9 + rayon) return -1;
      const cos = (dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1);
      if (cos < 0.72 - rayon * 0.1) return -1;
      const bh = w.raycastBlocks(eye, [dx / d, dy / d, dz / d], Math.max(0, d - 0.4 - rayon));
      if (bh && !bh.block.hidden) return -1;
      return d * (1.6 - cos * 0.6);
    };
    for (const c of this.choses) {
      if (c.pris || (!c.item && !c.prendre)) continue;
      const d = vis(c.x, c.y + (c.h || 0.6) * 0.5, c.z, c.rayon || 0.5);
      if (d >= 0) cand({ kind: 'hook', chose: c, use: () => this.prendre(c) }, d);
    }
    for (const e of this.betes) {
      if (e.mort || !e.d.parler) continue;
      const d = vis(e.x, e.y + (e.d.h || 1.6) * e.s * 0.7, e.z, (e.d.r || 0.3) * e.s + 0.3);
      if (d >= 0) cand({ kind: 'hook', bete: e, use: () => e.d.parler.call(this, e) }, d);
    }
  },

  // ---------------------------------------------------------------- chargement d'une partie
  reinit(saved) {
    this.cur = null; this.t = 0; this.blocs = []; this.choses = []; this.betes = []; this.caches = []; this.vise = null;
    this.k = [0, 0, 0, 0]; this.fx2 = [0, 0, 0, 0]; this.voile = [0, 0, 0, 0]; this.voileK = [0, 0, 0, 0]; this.flashTenebres = 0; this.pnjCaches = false;
    if (game.timeScale === 0) game.timeScale = 1;
    MSON.stopTout();
    const S = this.S();
    if (!saved) { farm.s.mondes = { cur: null, retour: null, vus: {}, pris: {} }; return; }
    const nom = S.cur;
    if (!nom || !MONDES[nom]) { S.cur = null; S.retour = null; return; }
    const D = MONDES[nom];
    if (D.reprendre) { try { D.reprendre(S); } catch (e) { console.error(e); S.cur = null; } return; }
    this.entrer(nom, { restaurer: true });
  },
  // position « réelle » à enregistrer (celle de la vallée) quand on est dans un monde à part
  posReelle() {
    const D = this.def();
    if (!D || !D.aPart) return null;
    if (D.posReelle) return D.posReelle();
    return this.S().retour || null;
  },
  installer() {
    if (this.installe) return;
    this.installe = true;
    // rendu : effets d'écran des mondes, herbe de sucre (ou pas d'herbe du tout), pas de pluie dans un monde à part
    const R = game.renderer, _render = R.render.bind(R);
    R.render = function (F) {
      if (game.kind !== 'farm' || !mondes.cur) { F.fx2 = mondes.fx2; return _render(F); }
      F.fx2 = mondes.fx2;
      const D = mondes.def();
      if (D.aPart) { F.grass = null; F.rain = 0; F.snow = 0; F.moon2 = 0; F.underwater = false; }
      else if (D.herbe === null) F.grass = null;
      if (D.herbe === 'bonbons' && F.grass && mondes.k[0] > 0.45 && mondes.herbeBonbons()) {
        const g = R.gUV, s = R.gSize;
        R.gUV = mondes.gUV; R.gSize = mondes.gSize;
        try { return _render(F); } finally { R.gUV = g; R.gSize = s; }
      }
      return _render(F);
    };
    // sommeil : pas dans un monde à part ; une vision se dissipe au réveil
    const _sleep = game.sleep.bind(game);
    game.sleep = async function (where) {
      if (mondes.aPart()) { ui.subtitle('', '(On ne dort pas ici.)', 3); return; }
      return _sleep(where);
    };
    // l'épuisement de trois heures du matin ne rattrape pas un monde à part (le temps de la vallée y est suspendu)
    const _faint = game.faint.bind(game);
    game.faint = function () { if (mondes.aPart()) return; return _faint(); };
    for (const fn of mondes.apresInstall) try { fn(); } catch (e) { console.error(e); }
  },
  apresInstall: [],
};

// ---------------------------------------------------------------- branchements
// la position enregistrée reste celle de la vallée
{
  const _save = farm.save.bind(farm);
  farm.save = function () {
    const R = typeof mondes !== 'undefined' && game.player ? mondes.posReelle() : null;
    if (mondes.cur && mondes.def() && mondes.def().avantSauvegarde) try { mondes.def().avantSauvegarde(); } catch (e) { console.error(e); }
    if (!R) return _save.apply(this, arguments);
    const p = game.player, pos = p.pos, yaw = p.yaw, pitch = p.pitch;
    p.pos = R.pos.slice(); p.yaw = R.yaw; p.pitch = R.pitch || 0;
    try { return _save.apply(this, arguments); } finally { p.pos = pos; p.yaw = yaw; p.pitch = pitch; }
  };
}
// dans un monde à part, ce qui rôde là-haut dans la vallée ne peut pas vous atteindre
{
  const _hurt = play.hurt.bind(play);
  play.hurt = function (dmg, src, cause) {
    if (mondes.cur && mondes.aPart() && src && !src.monde) {
      const p = game.player;
      if (src.y === undefined || Math.abs(src.y - p.pos[1]) > 6) return;
    }
    return _hurt(dmg, src, cause);
  };
}
// visée et coups : les bêtes des mondes passent par l'étrange (armes, flèches, fusil)
{
  const _ray = strange.raycast.bind(strange), _hit = strange.hit.bind(strange);
  strange.raycast = function (o, d, maxDist) {
    const a = _ray(o, d, maxDist);
    if (!mondes.cur || !mondes.betes.length) return a;
    const b = mondes.raycast(o, d, a ? a.t : maxDist);
    return b && (!a || b.t < a.t) ? b : a;
  };
  strange.hit = function (e, dmg, from) { if (e && e.monde) return mondes.frapper(e, dmg); return _hit(e, dmg, from); };
  const _upd = strange.update.bind(strange);
  strange.update = function (dt, c) { if (mondes.aPart()) return; return _upd(dt, c); };
  const _pn = strange.placeName.bind(strange);
  strange.placeName = function (p) { const D = mondes.def(); if (D && D.lieu) return D.lieu; return _pn(p); };
  const _fish = strange.fishingSpot.bind(strange);
  strange.fishingSpot = function (eye, dir) { if (mondes.aPart()) return null; return _fish(eye, dir); };
}
// ambiances sonores : les oiseaux, grillons et bruits des milieux se taisent dans les autres mondes
{
  const _su = sound.update.bind(sound);
  sound.update = function (dt, E) { if (game.kind === 'farm' && mondes.cur) E = Object.assign({}, E, { day: 0, night: 0, rain: mondes.aPart() ? 0 : E.rain, storm: mondes.aPart() ? 0 : E.storm, fire: mondes.aPart() ? 0 : E.fire }); return _su(dt, E); };
  const _ba = sound.biomeAmb.bind(sound);
  sound.biomeAmb = function (dt, E) { if (game.kind === 'farm' && mondes.cur) return; return _ba(dt, E); };
}
// les bêtes de la vallée, et les habitants, changent d'aspect dans une vision (couleurs échangées le temps du dessin)
{
  const peindre = (rigs, fn) => { const pile = []; for (const [r, e] of rigs) for (const q of r.parts) { if (!q.s) continue; const c = fn(e, q, r); if (c) { pile.push(q, q.col); q.col = c; } } return pile; };
  const rendre = (pile) => { for (let i = 0; i < pile.length; i += 2) pile[i].col = pile[i + 1]; };
  const _ed = entities.draw.bind(entities);
  entities.draw = function (buf, sbuf, cam, maxD, t, flags) {
    const D = mondes.def();
    if (!D || !D.peindreBete || game.kind !== 'farm') return _ed(buf, sbuf, cam, maxD, t, flags);
    const L = [], m2 = maxD * maxD;
    for (const e of this.list) { if (!e.rig || e.hidden || e.far || e.dead) continue; const dx = e.x - cam[0], dz = e.z - cam[2]; if (dx * dx + dz * dz <= m2) L.push([e.rig, e]); }
    const pile = peindre(L, D.peindreBete);
    try { return _ed(buf, sbuf, cam, maxD, t, flags); } finally { rendre(pile); }
  };
  const _nd = npcs.draw.bind(npcs);
  npcs.draw = function (buf, sbuf, cam, t, maxD) {
    const D = mondes.def();
    if (!D || !D.peindreHabitant || game.kind !== 'farm') return _nd(buf, sbuf, cam, t, maxD);
    const L = [], m2 = maxD * maxD;
    for (const n of this.list) { if (!n.rig || n.vanished) continue; const dx = n.x - cam[0], dz = n.z - cam[2]; if (dx * dx + dz * dz <= m2) L.push([n.rig, n]); }
    const pile = peindre(L, D.peindreHabitant);
    try { return _nd(buf, sbuf, cam, t, maxD); } finally { rendre(pile); }
  };
}
HOOKS.update.push((dt, eye, basis, sky, playing) => { if (farm.s) mondes.update(dt, eye, basis, sky, playing); });
HOOKS.draw.push((buf, sbuf, cam, t) => mondes.dessiner(buf, sbuf, cam, t));
HOOKS.lights.push((eye) => mondes.lumieres(eye));
HOOKS.target.push((eye, f, cand) => mondes.cibles(eye, f, cand));
HOOKS.sky.push((sky) => {
  for (const nom in MONDES_IDX) {
    const k = mondes.k[MONDES_IDX[nom]], D = MONDES[nom];
    if (k > 0.001 && D && D.ciel) try { D.ciel(sky, k); } catch (e) { console.error(e); }
  }
});
HOOKS.fx.push((fx, tint, sky) => { if (mondes.aPart()) { fx[1] = 0; fx[3] = 0; } else if (mondes.k[1] > 0.3) fx[3] = 0; });
HOOKS.load.push((saved) => { mondes.installer(); mondes.reinit(saved); });
