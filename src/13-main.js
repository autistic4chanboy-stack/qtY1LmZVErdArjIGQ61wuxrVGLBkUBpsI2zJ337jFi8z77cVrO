// ============================================================================
//  JEU : modes (ferme / création), boucle principale, interactions, journées
// ============================================================================

const game = {
  world: null, renderer: null, player: new Player(),
  kind: 'farm', mode: 'menu', started: false, flashlight: false, lantern: false, timeScale: 1, fastTime: false, dayCount: 0,
  sky: null, worldChanged: false, saveT: 0, time: 0, cloudT: 0, attractA: 0, last: 0, lockErrors: 0,
  mmb: null, saveWarned: false, target: null, holdE: 0, holdDone: false, shakeT: 0, dying: false, sleeping: false,
  lightPos: new Float32Array(MAX_LIGHTS * 4), lightCol: new Float32Array(MAX_LIGHTS * 3),
  poiIn: new Set(), poiT: 0, crowDay: 0, autoT: 0,
  vmCanvas: null, vmKey: '', vmDial: 0, horseE: null,

  async init() {
    const canvas = $('#gl');
    if (!glInit(canvas)) throw new Error("WebGL 2 n'est pas disponible sur ce navigateur / cette carte graphique.");
    buildMaterialTextures();
    buildSpriteAtlas();
    buildSkinAtlas();
    this.renderer = new Renderer(canvas);
    this.renderer.init();
    this.vmCanvas = document.createElement('canvas'); this.vmCanvas.width = VM_W; this.vmCanvas.height = VM_H;
    ui.init();
    this.applySettings();
    this.bindEvents();
    const saved = store.get(FARM_KEY, null);
    await this.startFarm(saved && saved.gen >= 1 && saved.gen <= VALLEY_GEN && saved.v <= FARM_V && !saved.over ? saved : null);
    $('#loading').classList.remove('open');
    requestAnimationFrame((t) => { this.last = t; this.loop(t); });
  },

  // ------------------------------------------------------------- modes
  async startFarm(saved, seed, fem) {
    $('#loading').classList.add('open');
    ui.setLoading('La vallée se réveille…');
    this.kind = 'farm'; this.mode = 'menu'; this.started = false; this.dying = false;
    $('#death').classList.remove('open');
    this.player = new Player();
    const w = await farm.start(saved, seed, (m) => ui.setLoading(m));
    if (!saved) { farm.s.fem = !!fem; farm.s.notes = {}; farm.s.prenom = (this.pendingName || '').slice(0, 20) || randomFirstName(!!fem); this.pendingName = ''; }
    this.setWorld(w, true);
    npcs.init(w, farm.s);
    strange.init(farm.s);
    quests.restore(w);
    this.spawnFouilles(farm.s.fouillesDay !== farm.s.day);
    this.syncAnimals();
    const s = farm.s, p = this.player;
    w.time = s.time;
    if (s.player && s.player.pos) { p.pos = s.player.pos.slice(); p.yaw = s.player.yaw; p.pitch = s.player.pitch || 0; p.hp = s.player.hp ?? 100; p.food = s.player.food ?? 80; }
    else { // on se réveille dans la maison, la lettre du notaire sur la table
      const B = w.bld.ferme, bed = B.spots.bed;
      p.pos = [bed.x + Math.sin(bed.r) * 0.4 + 1.2 * Math.cos(bed.r), B.y, bed.z + Math.cos(bed.r) * 0.4 - 1.2 * Math.sin(bed.r)];
      const mid = w.nav.nodes[B.nMid];
      p.pos = [mid.x, B.y + 0.02, mid.z];
      p.yaw = B.f.r + Math.PI; p.pitch = -0.15;
    }
    npcs.snap(w, true);
    for (const fn of HOOKS.load) fn(saved);
    this.lastT = w.time;
    $('#loading').classList.remove('open');
    ui.showMenu(true);
  },
  async newFarm(seed, fem) {
    if (farm.s && !farm.s.over && farm.s.day > 1 && !confirm('Commencer une nouvelle partie ? La partie en cours sera perdue (la vallée s’en souviendra).')) return;
    if (farm.s && !farm.s.over && farm.s.day > 1) farm.recordDeath('A quitté la vallée', 'la route');
    farm.wipe();
    await this.startFarm(null, seed ?? undefined, fem);
    this.enter('play');
    ui.fadeMsg('Jour 1. La vieille ferme.', 2.2);
  },
  enterCreative() {
    if (farm.on) farm.save();
    farm.on = false;
    ui.close(true);
    ui.loading('Chargement du mode création…', () => {
      let w = null;
      const saved = store.getRaw('prairie.world');
      if (saved) { try { w = worldFromJSON(JSON.parse(saved)); } catch (e) { console.warn('Sauvegarde illisible', e); } }
      const old = !!w && (w.genVersion | 0) < GEN_VERSION;
      if (!w) w = generateWorld({ seed: 20260927, size: 512, name: 'Grande Prairie' });
      this.kind = 'creative'; this.mode = 'menu'; this.started = false;
      this.player = new Player();
      this.setWorld(w, true);
      const pp = saved ? store.get('prairie.player', null) : null;
      if (pp && Array.isArray(pp.pos)) { this.player.pos = pp.pos.slice(0, 3); this.player.yaw = +pp.yaw || 0; this.player.pitch = +pp.pitch || 0; }
      this.worldChanged = false;
      this.dayCount = 0;
      ui.showMenu(true);
      if (old) ui.openDialog('#dlg-upgrade');
    });
  },
  async backToFarm() {
    if (this.kind === 'creative' && this.worldChanged) this.save(true);
    const saved = store.get(FARM_KEY, null);
    await this.startFarm(saved && saved.gen >= 1 && saved.gen <= VALLEY_GEN && !saved.over ? saved : null);
  },

  setWorld(w, respawn) {
    this.world = w;
    this.renderer.setWorld(w);
    entities.reset();
    weather.reset(w);
    play.reset();
    this.poiIn = new Set();
    editor.undo = []; editor.hit = null; editor.flattenH = null;
    if (respawn) { this.player.spawnAt(w); this.player.fly = this.mode === 'edit'; }
    this.worldChanged = true;
    this.horseE = null;
    ui.refreshEditor();
  },
  newWorld(opts) {
    this.setWorld(generateWorld(opts), true);
    this.dayCount = 0;
    this.save(true);
  },

  enter(mode) {
    sound.init();
    if (this.kind === 'farm') mode = 'play';
    const from = this.mode === 'menu' ? this.prevMode : this.mode;
    if (mode === 'edit' && from !== 'edit') this.player.fly = true;
    if (mode === 'play' && from !== 'play') this.player.fly = false;
    this.mode = mode;
    this.started = true;
    ui.showMenu(false);
    if (mode === 'play') this.lock();
    ui.refreshEditor();
    const seen = (this.hintsSeen = this.hintsSeen || {});
    const key = this.kind + mode;
    if (!seen[key] && this.kind === 'creative') {
      seen[key] = true;
      setTimeout(() => ui.toast(mode === 'play' ? 'E : éditeur · F : lampe torche · T : accélérer le temps · H : aide' : 'Tab : viser ⇄ curseur · 1-7 : outils · V : vol · E : jouer'), 400);
    }
  },
  pause() {
    if (this.mode === 'menu') return;
    ui.close(true);
    this.prevMode = this.mode;
    this.mode = 'menu';
    this.unlock();
    editor.end(this.world);
    ui.showMenu(true);
    this.save();
  },
  lock() {
    const c = $('#gl');
    if (document.pointerLockElement === c) return;
    // entrée brute (sans accélération Windows) : c'est elle qui supprime les « retours en arrière » de la vue ;
    // si le navigateur ne la connaît pas, capture ordinaire
    const plain = () => { try { const p2 = c.requestPointerLock(); if (p2 && p2.catch) p2.catch(() => this.onLockError()); } catch (e) { this.onLockError(); } };
    if (this.rawMouse === false) return plain();
    try {
      const p = c.requestPointerLock({ unadjustedMovement: true });
      if (p && p.catch) p.catch((err) => { if (err && err.name === 'NotSupportedError') { this.rawMouse = false; plain(); } else this.onLockError(); });
      else if (!p) this.rawMouse = this.rawMouse ?? true;
    } catch (e) { this.rawMouse = false; plain(); }
  },
  unlock() { if (document.pointerLockElement) document.exitPointerLock(); },
  onLockError() {
    this.lockErrors++;
    if (this.kind === 'creative') ui.toast(this.lockErrors > 2 ? 'Souris non capturable : maintenez un clic et glissez pour regarder' : "Cliquez dans l'écran pour capturer la souris");
  },
  applySettings() { sound.setVolume(settings.volume); sound.setAmbient(settings.ambVolume); },

  save(silent) {
    if (!this.world) return;
    if (this.kind === 'farm') { if (!this.dying) farm.save(); return; }
    const ok = store.setRaw('prairie.world', JSON.stringify(worldToJSON(this.world)));
    store.set('prairie.player', { pos: this.player.pos, yaw: this.player.yaw, pitch: this.player.pitch });
    if (ok) this.worldChanged = false;
    else if (!this.saveWarned) { this.saveWarned = true; ui.toast('Sauvegarde automatique impossible : pensez à exporter votre monde', 'err'); }
    this.saveT = 0;
    if (ok && !silent) $('#save-dot').classList.add('blink'), setTimeout(() => $('#save-dot').classList.remove('blink'), 900);
  },

  // ------------------------------------------------------------- événements
  bindEvents() {
    const c = $('#gl');
    const typing = () => {
      const a = document.activeElement;
      return a && (a.tagName === 'TEXTAREA' || (a.tagName === 'INPUT' && a.type === 'text'));
    };
    document.addEventListener('pointerlockchange', () => {
      input.locked = document.pointerLockElement === c;
      if (input.locked) { this.lockErrors = 0; this.mouseSkipUntil = performance.now() + 90; this.mouseAvg = 0; }
      if (!input.locked && this.mode === 'play' && !ui.panel && !this.dying && !this.sleeping) this.pause();
      editor.end(this.world);
      input.buttons = 0;
    });
    document.addEventListener('pointerlockerror', () => this.onLockError());
    window.addEventListener('keydown', (e) => {
      if (typing()) { if (e.key === 'Escape') document.activeElement.blur(); return; }
      if (e.code === 'Tab') e.preventDefault();
      if (e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault();
      if (e.repeat) { input.keys.add(e.code); return; }
      input.keys.add(e.code);
      const k = e.key.toLowerCase(), F = this.kind === 'farm';
      if (e.key === 'Escape') {
        if (ui.panel) { ui.close(); return; }
        if ($('.dialog.open')) { ui.closeDialogs(); return; }
        if (this.dying) return;
        if (this.mode === 'menu') { if (this.started) this.enter(this.prevMode || 'play'); }
        else this.pause();
        return;
      }
      if (this.mode === 'menu' || this.dying) return;
      if (F) {
        if (ui.panel === '#talk' && /^Digit[1-9]$/.test(e.code)) { ui.talkKey(+e.code.slice(5)); return; }
        if (ui.panel === '#satchel' && /^Digit[1-9]$/.test(e.code)) { ui.satKey(+e.code.slice(5)); return; }
        if (ui.panel === '#choice' && /^Digit[1-9]$/.test(e.code)) { ui.choiceKey(+e.code.slice(5)); return; }
        if (e.code === 'Tab') { if (ui.panel === '#satchel') ui.close(); else if (!ui.panel) ui.openSatchel(); return; }
        if (ui.panel) { if (k === 'e' && ui.panel === '#reader') ui.close(); return; }
        if (k === 'e') { this.holdE = 0; this.holdDone = false; return; }
        if (/^Digit[1-9]$/.test(e.code)) { play.group(+e.code.slice(5) - 1); return; }
        if (k === 'f') { this.toggleLantern(); return; }
        if (k === 'g') { this.whistle(); return; }
        if (k === 'r') { play.rotY += Math.PI / 4; sound.click(); return; }
        if (k === 'q' && e.code === 'KeyQ' && false) return;
      }
      if ((e.ctrlKey || e.metaKey) && k === 'z') { e.preventDefault(); if (this.mode === 'edit') editor.doUndo(this.world); return; }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (k === 'm') {
        if (settings.volume > 0) { this.prevVolume = settings.volume; settings.volume = 0; } else settings.volume = this.prevVolume || DEFAULT_SETTINGS.volume;
        store.set('prairie.settings', settings); this.applySettings();
        const el = $('#o-volume'); if (el) { el.value = settings.volume; $('#o-volume-v').textContent = Math.round(settings.volume * 100) + ' %'; }
        return;
      }
      if (F) return;
      if (e.code === 'Tab' && this.mode === 'edit') { if (input.locked) this.unlock(); else this.lock(); return; }
      if (k === 'e') { this.enter(this.mode === 'edit' ? 'play' : 'edit'); if (this.mode === 'edit' && !input.locked) this.lock(); return; }
      if (k === 'f') { this.flashlight = !this.flashlight; sound.click(); return; }
      if (k === 'v') { this.player.fly = !this.player.fly; this.player.vel = [0, 0, 0]; ui.toast(this.player.fly ? 'Vol libre activé' : 'Vol libre désactivé'); return; }
      if (k === 't') { this.fastTime = true; return; }
      if (k === 'h') { $('#hud-help').classList.toggle('open'); return; }
      if (k === 'r' && editor.tool === 'block') { editor.rotate(e.shiftKey ? 90 * DEG : 15 * DEG); return; }
      if (this.mode === 'edit' && /^Digit[1-7]$/.test(e.code)) ui.setTool(TOOLS[+e.code.slice(5) - 1].id);
    });
    window.addEventListener('keyup', (e) => {
      input.keys.delete(e.code);
      if (e.key.toLowerCase() === 't') this.fastTime = false;
      if (e.code === 'KeyE' && this.kind === 'farm' && this.mode === 'play' && !ui.panel && !this.dying) { if (!this.holdDone) this.interact(); this.holdE = 0; }
    });
    window.addEventListener('blur', () => { input.keys.clear(); input.buttons = 0; this.fastTime = false; editor.end(this.world); });

    c.addEventListener('contextmenu', (e) => e.preventDefault());
    c.addEventListener('mousedown', (e) => {
      e.preventDefault();
      sound.init();
      if (this.mode === 'menu' || this.dying) return;
      const bit = e.button === 0 ? 1 : e.button === 2 ? 2 : e.button === 1 ? 4 : 0;
      input.buttons |= bit; input.clicked |= bit;
      if (this.mode === 'play' && !input.locked) { if (!ui.panel) this.lock(); return; }
      if (this.kind === 'farm' && bit === 2 && !ui.panel) { const p = this.player; play.secondary(p.eyePos(), cameraBasis(p.yaw, p.pitch)); return; }
      if (this.mode === 'edit') {
        if (!input.locked && bit === 4) { this.mmb = { x: e.clientX, y: e.clientY, moved: false }; return; }
        this.editorRay();
        editor.begin(this.world, bit);
      }
    });
    window.addEventListener('mouseup', (e) => {
      const bit = e.button === 0 ? 1 : e.button === 2 ? 2 : e.button === 1 ? 4 : 0;
      input.buttons &= ~bit;
      if (bit === 4 && this.mmb) {
        if (!this.mmb.moved && this.mode === 'edit') { this.editorRay(); editor.begin(this.world, 4); }
        this.mmb = null;
      }
      if (this.mode === 'edit' && editor.stroke === bit) editor.end(this.world);
    });
    window.addEventListener('mousemove', (e) => {
      input.mx = e.clientX; input.my = e.clientY;
      if (input.locked) {
        const mx = e.movementX || 0, my = e.movementY || 0, m = Math.abs(mx) + Math.abs(my);
        if (performance.now() < (this.mouseSkipUntil || 0)) return;
        // un saut isolé, énorme et soudain (bogue connu des navigateurs sous Windows) : on l'ignore
        const avg = this.mouseAvg || 0;
        if (m > 220 && m > avg * 5 + 90) return;
        this.mouseAvg = avg * 0.75 + m * 0.25;
        input.dx += mx; input.dy += my;
        return;
      }
      if (this.mmb) {
        if (Math.abs(e.clientX - this.mmb.x) + Math.abs(e.clientY - this.mmb.y) > 4) this.mmb.moved = true;
        if (this.mmb.moved) { input.dx += e.movementX; input.dy += e.movementY; }
        return;
      }
      if (this.mode === 'play' && input.buttons && e.target === c && !ui.panel) { input.dx += e.movementX; input.dy += e.movementY; }
    });
    c.addEventListener('wheel', (e) => {
      e.preventDefault();
      const d = Math.sign(e.deltaY);
      if (this.kind === 'farm' && this.mode === 'play') { if (!ui.panel) play.cycle(d); return; }
      if (this.mode !== 'edit') return;
      if (editor.tool === 'block') editor.rotate(-d * 15 * DEG);
      else if (e.shiftKey) editor.strength = clamp(Math.round((editor.strength - d * 0.05) * 100) / 100, 0.05, 1);
      else editor.size = clamp(editor.size * (d > 0 ? 1 / 1.15 : 1.15), 1, 40), editor.size = Math.round(editor.size * 2) / 2;
      ui.refreshEditor();
    }, { passive: false });
    window.addEventListener('beforeunload', () => { if (this.kind === 'farm') { if (!this.dying) farm.save(); } else if (this.worldChanged) this.save(true); });
    window.addEventListener('resize', () => { if (this.world) ui.refreshEditor(); });
  },

  editorRay() {
    const eye = this.player.eyePos();
    let dir;
    if (input.locked || !this.renderer.lastBasis) dir = cameraBasis(this.player.yaw, this.player.pitch).f;
    else {
      const r = $('#gl').getBoundingClientRect();
      dir = this.renderer.screenRay(((input.mx - r.left) / r.width) * 2 - 1, 1 - ((input.my - r.top) / r.height) * 2);
    }
    editor.target(this.world, eye, dir);
  },

  // ------------------------------------------------------------- ferme : cible de la touche E
  findTarget(eye, f) {
    const w = this.world, s = farm.s;
    let best = null, bd = 3.0;
    const cand = (t, d) => { if (d < bd) { bd = d; best = t; } };
    const nh = npcs.raycast(eye, f, 2.9);
    if (nh && npcs.byId[nh.n.id]) cand({ kind: 'npc', n: nh.n }, nh.t);
    const eh = entities.raycast(eye, f, 2.8);
    if (eh && (eh.e.owner || eh.e.kind === 'horse' || eh.e.kind === 'cat')) cand({ kind: 'animal', e: eh.e }, eh.t);
    const envers = strange.inEnvers();
    for (const it of w.inter || []) {
      const dx = it.x - eye[0], dy = it.y - eye[1], dz = it.z - eye[2], d = Math.hypot(dx, dy, dz);
      if (d > 2.7) continue;
      const cos = (dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1);
      if (cos < 0.75) continue;
      if (it.data.envers && !envers) continue;
      if (it.kind === 'mirror' && !envers) continue;
      if ((it.kind === 'pickup' && s.flags['got_' + it.id]) || (it.kind === 'dig' && s.flags['dug_' + it.id])) continue;
      if (HOOKS.interVis[it.kind] && !HOOKS.interVis[it.kind](it)) continue;
      const bh = w.raycastBlocks(eye, [dx / d, dy / d, dz / d], d - 0.3);
      if (bh && !bh.block.hidden) continue;
      cand({ kind: 'inter', it }, d * (1.6 - cos * 0.6));
    }
    for (let i = 0; i < w.doors.length; i++) {
      const dr = w.doors[i];
      const dx = dr.x - eye[0], dy = dr.y + 1.1 - eye[1], dz = dr.z - eye[2], d = Math.hypot(dx, dy, dz);
      if (d > 2.4) continue;
      if ((dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1) < 0.55) continue;
      cand({ kind: 'door', d: dr }, d + 0.25);
    }
    // objets posés interactifs
    for (let qi = 0; qi < w.props.length; qi++) {
      const q = w.props[qi];
      if (!w.live(q) || !PROP_USE[q.id]) continue;
      if (PROP_USE[q.id] === 'm' && qi < farm.genProps) continue;
      const dx = q.x - eye[0], dy = q.y + 0.6 - eye[1], dz = q.z - eye[2], d = Math.hypot(dx, dy, dz);
      if (d > 2.6) continue;
      if ((dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1) < 0.7) continue;
      cand({ kind: 'prop', q }, d + 0.1);
    }
    // cultures mûres, flèches, cueillette
    const c = play.cellAt(eye, f);
    if (c && c.t < 3.2) { const cr = farm.crop(c.x, c.z); if (cr && cr.c && (farm.ripe(cr) || cr.dead)) cand({ kind: 'crop', x: c.x, z: c.z, c: cr }, c.t); }
    for (const a of play.arrows) if (a.stuck && Math.hypot(a.x - eye[0], a.y - eye[1], a.z - eye[2]) < 2.2) cand({ kind: 'arrow', a }, Math.hypot(a.x - eye[0], a.y - eye[1], a.z - eye[2]));
    for (const fn of HOOKS.target) fn(eye, f, cand);
    const oh = w.raycastObjects(eye, f, 2.6, true);
    if (oh) {
      const tid = OBJ_TYPES[oh.obj.t].id, H = HARVEST[tid];
      if (H && H.tool === 'main') cand({ kind: 'pick', o: oh.obj, idx: oh.idx, p: [oh.x, oh.y, oh.z] }, oh.t);
      else if ((['oak', 'apple', 'birch', 'pine'].includes(tid) || (H && H.fruit)) && oh.t < 2.4) cand({ kind: 'tree', o: oh.obj, idx: oh.idx }, oh.t + 0.4);
    }
    return best;
  },

  interact() {
    const t = this.target, w = this.world, s = farm.s, p = this.player;
    if (p.riding) { this.dismount(); return; }
    if (!t) return;
    if (t.kind === 'npc') { if (t.n.state === 'sleep') { npcs.say(t.n, pick(['Mmh… laissez-moi dormir…', '… qui est là ?…']), 2); return; } ui.openTalk(t.n); return; }
    if (t.kind === 'animal') return this.useAnimal(t.e);
    if (t.kind === 'door') return this.useDoor(t.d);
    if (t.kind === 'prop') return this.useProp(t.q);
    if (t.kind === 'crop') { if (t.c.dead) { t.c.c = null; t.c.dead = false; t.c.g = 0; farm.dirtyProps = true; sound.dig(0.4); } else play.harvestCrop(t.x, t.z, t.c); return; }
    if (t.kind === 'arrow') { play.arrows.splice(play.arrows.indexOf(t.a), 1); farm.give(t.a.fer ? 'fleche_fer' : 'fleche', 1); sound.tick(); return; }
    if (t.kind === 'tree') return this.shakeTree(t);
    if (t.kind === 'hook') return t.use();
    if (t.kind === 'pick') { const H = HARVEST[OBJ_TYPES[t.o.t].id]; play.collect(t.o, t.idx, H, t.p); return; }
    if (t.kind === 'inter') return this.useInter(t.it);
  },
  useInter(it) {
    const w = this.world, s = farm.s, p = this.player, d = it.data || {};
    if (HOOKS.interPre[it.kind] && HOOKS.interPre[it.kind](it)) return;
    if (HOOKS.inter[it.kind]) return HOOKS.inter[it.kind](it);
    switch (it.kind) {
      case 'note': { const n = noteText(d.note); if (!n) return; s.notes[d.note] = 1; ui.read(n.titre, n.texte); return; }
      case 'bed': return this.trySleep('ferme');
      case 'rentbed': if (s.flags.rented === s.day || (s.flags.rented === s.day - 1 && npcs.hour() < 6)) return this.trySleep('auberge'); ui.subtitle('', '(Il faut d’abord louer la chambre à l’aubergiste.)', 2.5); return;
      case 'chest': return ui.openStore('Coffre', s.chests[it.id] || (s.chests[it.id] = {}), 'chest');
      case 'ship': return ui.openStore("Caisse d'expédition", s.ship, 'ship');
      case 'station': return ui.openSatchel('fab');
      case 'cook': { const q = farm.propByKind('cheminee', [it.x, it.z], 3); if (q && (!q.data || !q.data.lit)) { if (farm.take('bois', 1)) { farm.setPropData(q, { lit: true }); w.collectLights(); sound.place(); } else { ui.subtitle('', '(Il faut une bûche pour allumer le feu.)', 2.5); return; } } return ui.openSatchel('fab'); }
      case 'water': if (farm.bestTool('arrosoir')) { s.water = play.canCap(); sound.splash(); } else sound.click(); return;
      case 'mailbox': { const mb = w.farm.mailbox; if (mb) farm.setPropData(mb, { mail: false }); ui.openSatchel('lettres'); return; }
      case 'feeder': {
        const q = farm.propByKind('mangeoire', [it.x, it.z], 3);
        const n = Math.max(1, s.animals.filter((a) => a.kind !== 'hen').length);
        const k = Math.min(farm.count('foin'), n * 2);
        if (!k) { ui.subtitle('', '(Il faudrait du foin : la faux en donne dans les hautes herbes.)', 3); return; }
        farm.take('foin', k); if (q) farm.setPropData(q, { fill: 1 });
        for (const a of s.animals) a.fedUntil = s.hours + 14;
        sound.place(); return;
      }
      case 'dig': if (farm.bestTool('houe')) play.digUp(it); else ui.subtitle('', '(La terre a été remuée ici. Il faudrait une houe.)', 3); return;
      case 'loot': return this.lootBox(it);
      case 'pickup': {
        s.flags['got_' + it.id] = 1;
        if (d.item === 'registre' && strange.inEnvers()) { s.flags.registre = 1; }
        farm.give(d.item, 1); play.flyer(d.item, [it.x, it.y, it.z], 1); sound.pop();
        if (d.quest) { const Q = s.quests[d.quest]; if (Q) Q.found = true; }
        const pi = w.props.findIndex((q) => (d.prop !== undefined && w.props.indexOf(q) === d.prop) || (q.questFind && q.questFind === d.quest));
        if (pi >= 0) { if (pi < farm.genProps) { w.props[pi].gone = true; s.gone[pi] = 1; } else w.props.splice(pi, 1); farm.dirtyProps = true; }
        w.inter.splice(w.inter.indexOf(it), 1);
        return;
      }
      case 'ladder': case 'cellar': case 'deep': return this.teleport(d.to, it.kind === 'ladder' ? 'Vous grimpez à l’échelle…' : 'Vous descendez…');
      case 'crypt':
        if (!s.flags.crypte) { if (!farm.count('cle_crypte')) { ui.subtitle('', '(La trappe est fermée par une serrure d’os. Aucune clé d’ici n’y entre.)', 3.5); return; } s.flags.crypte = 1; sound.lock(false); }
        return this.teleport(d.to, 'La clé d’os tourne toute seule…');
      case 'oldwell':
        if (strange.redNight() && !strange.inEnvers()) { this.goEnvers(); return; }
        sound.whisper(0, 0.4); ui.subtitle('', '(Tout au fond, l’eau ne reflète rien. Pas même le ciel.)', 3); return;
      case 'mirror': if (strange.inEnvers()) this.leaveEnvers(); return;
      case 'bell': strange.bells(1); for (const n of npcs.list) if (n.dist < 80 && n.st.alive) npcs.addAmitie(n, npcs.hour() > 21 || npcs.hour() < 6 ? -30 : -5); return;
      case 'altar': ui.subtitle('', strange.inEnvers() ? '(Treize pierres. Toutes tournées vers vous.)' : '(La pierre est tiède, comme si quelqu’un venait de s’y asseoir.)', 3.5); return;
      case 'grave': return this.readGrave(it);
      case 'registry': return this.readRegistry();
      case 'clue': {
        const n = npcs.byId[d.npc];
        if (!n) return;
        ui.read('Ce que vous trouvez', fmtLine(n.d.lines.indice, n));
        if (!s.flags.clueTaken) { s.flags.clueTaken = 1; farm.give('masque', 1); }
        const wit = npcs.witnesses(it.x, it.z);
        if (wit.includes(n)) { npcs.addAmitie(n, -200); npcs.say(n, 'Qu’est-ce que vous faites chez moi ?! Sortez !', 3); }
        return;
      }
    }
  },
  useDoor(dr) {
    const p = this.player, s = farm.s;
    const mine = dr.bld === 'ferme' || dr.bld === 'poulailler';
    if (dr.locked) {
      if (mine) { dr.locked = false; sound.lock(false); dr.open = 1; sound.door(true); return; }
      npcs.knock(dr);
      return;
    }
    dr.open = dr.open ? 0 : 1;
    dr.playerClosed = !dr.open;
    sound.door(!!dr.open);
    // entrer chez quelqu'un
    if (!mine && dr.open) {
      const owner = npcs.list.find((n) => n.d.home === dr.bld && n.st.alive && n.inside === dr.bld && !SHOP_DOORS.has(dr.bld));
      if (owner && npcs.level(owner) < 4) { npcs.remember(owner, 'intrus'); npcs.addAmitie(owner, -8); npcs.say(owner, pick(['Oui ? On frappe, d’habitude.', 'Vous cherchez quelque chose ?', 'Entrez… si vous y tenez.']), 2.5); }
    }
  },
  useProp(q) {
    const s = farm.s, w = this.world;
    if (HOOKS.propPre[q.id] && HOOKS.propPre[q.id](q)) return;
    switch (q.id) {
      case 'coffre': { q.data = q.data || {}; q.data.items = q.data.items || {}; ui.openStore('Coffre', q.data.items, 'chest'); farm.setPropData(q, { items: q.data.items }); return; }
      case 'caisse_expedition': return ui.openStore("Caisse d'expédition", s.ship, 'ship');
      case 'portillon': farm.setPropData(q, { open: !(q.data && q.data.open) }); sound.door(!!q.data.open); q.blkOff = !!q.data.open; return;
      case 'piege': if (q.data && q.data.prise) { farm.setPropData(q, { prise: 0 }); farm.give('viande', 1); if (Math.random() < 0.6) farm.give('cuir', 1); play.flyer('viande', [q.x, q.y + 0.3, q.z], 1); sound.pop(); } return;
      case 'ruche': if (q.data && q.data.miel) { farm.setPropData(q, { miel: 0 }); farm.give('miel', q.data.miel || 1); play.flyer('miel', [q.x, q.y + 0.8, q.z], 1); sound.pop(); } else ui.subtitle('', '(Les abeilles bourdonnent. Le miel n’est pas encore prêt.)', 2.5); return;
      case 'feu_camp': case 'four': case 'etabli': if (q.id === 'four' && !(q.data && q.data.lit)) { if (farm.take('charbon', 1) || farm.take('bois', 2)) { farm.setPropData(q, { lit: true }); w.collectLights(); } } return ui.openSatchel('fab');
      case 'puits_deco': case 'bassin': case 'fontaine_jardin': if (farm.bestTool('arrosoir')) { s.water = play.canCap(); sound.splash(); } return;
      case 'mangeoire': return this.useInter({ kind: 'feeder', x: q.x, z: q.z, data: {} });
      case 'horloge': { const h = w.time * 24; ui.subtitle('', `(Il est ${Math.floor(h)} h ${String(Math.floor((h % 1) * 60)).padStart(2, '0')}.)`, 2.5); return; }
    }
    if (MACHINES[q.id]) return this.useMachine(q);
  },
  // Contenants à fouiller : ils se remplissent de nouveau au bout de quelques jours
  lootBox(it) {
    const s = farm.s, d = it.data, w = this.world;
    const last = s.looted[it.id];
    if (last !== undefined && s.day - last < 3) { sound.click(); ui.subtitle('', pick(['(Vide. Quelqu’un est passé avant vous… ou c’était vous.)', '(Il n’y a plus rien.)', '(Rien. Revenez dans quelques jours.)']), 2.5); return; }
    s.looted[it.id] = s.day;
    const pos = [it.x, it.y + 0.3, it.z];
    for (const [k, n] of rollLoot(d.table)) {
      if (k === 'argent') { farm.earn(n); sound.coin && sound.coin(); continue; }
      farm.give(k, n); play.flyer(k, pos, n);
    }
    sound.lootOpen && sound.lootOpen();
    const q = w.props[d.prop];
    if (q && q.id === 'coffre_vieux') farm.setPropData(q, { vide: true });
    puffAt(it.x, it.y, it.z, [120, 100, 80], 8, 1.5, false);
  },
  refillLoot() {
    const s = farm.s, w = this.world;
    for (const id in s.looted) if (s.day - s.looted[id] >= 3) {
      delete s.looted[id];
      const it = w.inter.find((i) => i.id === id);
      const q = it && w.props[it.data.prop];
      if (q && q.id === 'coffre_vieux') farm.setPropData(q, { vide: false });
    }
  },
  // Machines : on y dépose des produits, on revient plus tard chercher le résultat
  useMachine(q) {
    const s = farm.s, M = MACHINES[q.id], st = (q.data && q.data.m) || null;
    if (st) {
      if (s.hours >= st.ready) {
        farm.give(st.out[0], st.out[1]); play.flyer(st.out[0], [q.x, q.y + 1, q.z], st.out[1]);
        farm.setPropData(q, { m: null }); sound.coin && sound.coin(); sound.pop();
        return;
      }
      ui.subtitle('', pick(['(Ça travaille encore.)', '(Encore un peu de patience.)', '(Pas tout à fait prêt.)']), 2); return;
    }
    const hand = s.hand;
    const ok = (r) => farm.has(r.in);
    // d'abord ce qu'on tient en main ; sinon une recette qui ne puise pas dans les récoltes « en vrac »
    let r = M.find((x) => ok(x) && (x.in[hand] || Object.keys(x.in).some((k) => ITEM_GROUPS[k] && ITEM_GROUPS[k].includes(hand)))) || M.find((x) => ok(x) && !x.in.legume && !x.in.fruit);
    if (!r) { ui.subtitle('', '(' + MACHINE_HINT[q.id] + ')', 3); sound.click(); return; }
    for (const k in r.in) farm.take(k, r.in[k]);
    farm.setPropData(q, { m: { ready: s.hours + r.h, out: r.out } });
    sound.place();
  },
  // Secouer un arbre : fruits, nids, graines… une fois par jour
  shakeTree(t) {
    const s = farm.s, o = t.o, id = OBJ_TYPES[o.t].id;
    const k = t.idx;
    if (s.shaken[k] === s.day) { sound.impact('soft'); return; }
    s.shaken[k] = s.day;
    for (let i = 0; i < 14; i++) particles.spawn(o.x + (Math.random() - 0.5) * 3, this.world.objectY(o) + o.h * (0.5 + Math.random() * 0.4), o.z + (Math.random() - 0.5) * 3, (Math.random() - 0.5), -1, (Math.random() - 0.5), [0.35, 0.55, 0.2, 1], 0.06, 2 + Math.random(), 1.5, false);
    sound.shake && sound.shake();
    const pos = [o.x, this.world.objectY(o) + 1.5, o.z];
    let got = [];
    if (id === 'apple') got = [['pomme', 0 + Math.floor(Math.random() * 3)]];
    else if (Math.random() < 0.15) got = rollLoot('arbre');
    for (const [it, n] of got) { if (it === 'argent') { farm.earn(n); continue; } farm.give(it, n); play.flyer(it, pos, n); }
  },
  useAnimal(e) {
    const s = farm.s, a = s.animals.find((q) => q.id === e.aid), hand = s.hand;
    if (e.kind === 'dog') { sound.bark(0.6); e.wag = true; s.dog.love = (s.dog.love || 0) + 1; return; }
    if (e.kind === 'cat') { sound.mumble(2.2, 8, 0, 0.4); return; }
    if (e.kind === 'horse' && (e.owner || !e.o)) return this.mount(e);
    if (!a) return;
    if (a.kind === 'hen' && a.egg) { farm.give('oeuf', a.egg); play.flyer('oeuf', [e.x, e.y + 0.4, e.z], a.egg); a.egg = 0; sound.pop(); }
    else if (a.kind === 'cow' && a.milk && hand === 'seau') { a.milk = 0; farm.give('lait', 1); play.flyer('lait', [e.x, e.y + 0.8, e.z], 1); sound.pour(); }
    else if (a.kind === 'sheep' && (a.wool || 0) >= 1 && hand === 'cisailles') { a.wool = 0; farm.give('laine', 2); play.flyer('laine', [e.x, e.y + 0.8, e.z], 2); sound.scythe(); }
    else if (a.kind === 'pig' && a.truffle) { a.truffle = 0; farm.give('truffe', 1); play.flyer('truffe', [e.x, e.y + 0.3, e.z], 1); sound.pop(); }
    else if (!a.pet) { a.pet = true; a.mood = Math.min(1, (a.mood || 0.5) + 0.1); sound.animal(e.cfg.call || 'hen', 0, 0.7); }
    else sound.animal(e.cfg.call || 'hen', 0, 0.5);
  },
  readGrave(it) {
    const H = farm.history(), d = it.data || {};
    if (d.who) { const n = npcs.byId[d.who]; if (n) { ui.read('Une tombe fraîche', `${n.name} ${n.d.surname}\n${n.d.role}\n† jour ${n.st.dead ? n.st.dead.day : ''}`); return; } }
    const i = d.i ?? 0;
    if (i < H.length) { const h = H[H.length - 1 - i]; ui.read('Ci-gît', `${h.name ? h.name + ',\n' : ''}fermier de la vieille ferme\n— version n° ${h.run} —\n\nIl a tenu ${h.day} jour${h.day > 1 ? 's' : ''}.\n${h.cause}.\n\n« ${['Il avait pourtant fermé sa porte.', 'La vallée l’a gardé.', 'Il reviendra, comme les autres.', 'Il n’a pas compté les pierres.'][h.run % 4]} »`); return; }
    const rnd = mulberry32(i * 77 + 3), first = ['Jean', 'Marie', 'Louis', 'Jeanne', 'Pierre', 'Anne', 'Joseph', 'Catherine', 'Étienne', 'Madeleine'], last = ['Varenne', 'Morel', 'Bastien', 'Lefèvre', 'Garnier', 'Roux', 'Mauduit', 'Perrin'];
    const y0 = 1780 + Math.floor(rnd() * 100);
    ui.read('Une vieille tombe', `${first[(rnd() * first.length) | 0]} ${last[(rnd() * last.length) | 0]}\n${y0} – ${y0 + 20 + Math.floor(rnd() * 60)}\n\n${rnd() < 0.3 ? '« Descendu au puits. Jamais remonté. »' : 'Priez pour lui.'}`);
  },
  readRegistry() {
    const H = farm.history();
    const lines = H.length ? H.map((h) => `Version n° ${h.run} — ${h.day} jour${h.day > 1 ? 's' : ''} — ${h.cause.toLowerCase()} (${h.place || 'la vallée'})`).join('\n') : 'Les pages sont vides. Sauf la dernière, où votre écriture a commencé une ligne que vous n’avez pas encore vécue.';
    ui.read('Registre des versions', `Chaque fermier a reçu la même lettre. Chaque fermier a cru être le premier.\n\n${lines}\n\nVersion n° ${farm.s.run} — en cours.`);
    farm.s.flags.registryRead = 1;
  },
  async teleport(to, text) {
    if (!to || this.sleeping) return;
    this.sleeping = true;
    await ui.fade(true, text || '', 500);
    const p = this.player;
    p.pos = [to[0], to[1] + 0.05, to[2]]; p.vel = [0, 0, 0];
    this.renderer.uploadCover(p.pos[0], p.pos[2]);
    await ui.fade(false, '', 500);
    this.sleeping = false;
  },
  async goEnvers() {
    this.sleeping = true;
    await ui.fade(true, 'Vous descendez dans le vieux puits. L’eau se referme au-dessus de vous, et vous respirez.', 1400);
    await new Promise((r) => setTimeout(r, 1800));
    strange.setEnvers(true);
    farm.s.flags.envers = (farm.s.flags.envers || 0) + 1;
    const L = this.world.lm.vieux_puits, p = this.player;
    p.pos = [L.x + 2.5, this.world.heightAt(L.x + 2.5, L.z), L.z]; p.vel = [0, 0, 0];
    await ui.fade(false, '', 1400);
    this.sleeping = false;
  },
  async leaveEnvers() {
    this.sleeping = true;
    await ui.fade(true, 'Le miroir vous laisse passer. Il fait froid, puis plus rien.', 1200);
    strange.setEnvers(false);
    await ui.fade(false, '', 1200);
    this.sleeping = false;
  },

  // ------------------------------------------------------------- lanterne, sifflet, cheval
  toggleLantern() {
    if (!farm.count('lanterne')) { sound.click(); return; }
    this.lantern = !this.lantern; sound.click();
  },
  whistle() {
    sound.whistle();
    const p = this.player;
    for (const e of entities.list) if (e.owner && (e.kind === 'horse' || e.kind === 'dog') && Math.hypot(e.x - p.pos[0], e.z - p.pos[2]) < 180) { e.follow = e.kind === 'horse'; if (e.kind === 'dog') { e.hx = p.pos[0]; e.hz = p.pos[2]; } }
  },
  mount(e) {
    const p = this.player;
    if (!e.owner) { ui.subtitle('', '(Ce cheval n’est pas à vous.)', 2); return; }
    p.riding = e; e.ridden = true; e.follow = false;
    p.pos = [e.x, e.y, e.z]; e.heading = p.yaw + Math.PI;
    sound.animal('horse', 0, 0.7);
    this.horseE = e;
  },
  dismount() {
    const p = this.player, e = p.riding;
    if (!e) return;
    e.ridden = false; p.riding = null;
    e.x = p.pos[0]; e.z = p.pos[2]; e.y = entities.groundY(this.world, e, e.x, e.z); e.heading = p.yaw + Math.PI; e.hx = e.x; e.hz = e.z; e.state = 'idle'; e.timer = 5;
    const rx = Math.cos(p.yaw), rz = -Math.sin(p.yaw);
    const [nx, nz] = this.world.collideCircle(p.pos[0] + rx * 1.1, p.pos[2] + rz * 1.1, p.pos[1], p.pos[1] + 1.8, P_RADIUS, 0.5);
    p.pos[0] = nx; p.pos[2] = nz; p.pos[1] = this.world.groundAt(nx, nz, p.pos[1] + 0.8, 0.8);
    const a = farm.s.animals.find((q) => q.id === e.aid);
    if (a) { a.x = e.x; a.z = e.z; }
  },
  dogAlarm(src) {
    for (const e of entities.list) if (e.kind === 'dog' && e.owner && Math.hypot(e.x - src.x, e.z - src.z) < 45) e.alarm = src;
  },

  // Bêtes du joueur : une créature par animal possédé (plus le chien)
  syncAnimals() {
    const w = this.world, s = farm.s;
    if (!w || !w.farm) return;
    const fm = w.farm, hidden = strange.inEnvers();
    const want = new Map();
    for (const a of s.animals) if (!a.dead && !a.lost && !hidden) want.set(a.id, a);
    for (const e of entities.extra.slice()) if (e.owner && e.kind !== 'dog' && (!want.has(e.aid) || hidden)) { if (!e.ridden) entities.remove(e); }
    const have = new Set(entities.extra.filter((e) => e.owner).map((e) => e.aid));
    for (const [id, a] of want) {
      if (have.has(id)) continue;
      // sans grange ni poulailler (nouvelle ferme), les bêtes restent dans la cour
      const hen = a.kind === 'hen' && !!fm.coop;
      const home = hen ? fm.coop : fm.barn || fm.yard || { x: fm.f.x, z: fm.f.z, door: [fm.f.x, fm.f.z] };
      const sx = hen ? home.x + (Math.random() - 0.5) * 6 : home.door[0] + (Math.random() - 0.5) * 8, sz = hen ? home.z + (Math.random() - 0.5) * 6 : home.door[1] + (Math.random() - 0.5) * 8;
      const e = entities.add(w, a.kind, a.x ?? sx, a.z ?? sz, { owner: 'joueur', aid: id, v: a.v || 0 });
      e.shelter = { x: home.x, z: home.z };
      e.hx = hen ? home.x : home.door[0]; e.hz = hen ? home.z - 4 : home.door[1];
      if (a.kind === 'horse' && (!a.wild || farm.count('selle'))) { const sd = e.rig.part('saddle'); if (sd) sd.hide = false; const bl = e.rig.part('blanketS'); if (bl) bl.hide = false; }
    }
    if (s.dog && s.dog.alive && !hidden && !entities.extra.some((e) => e.kind === 'dog' && e.owner)) {
      const [nx, nz] = fm.niche;
      const e = entities.add(w, 'dog', nx, nz, { owner: 'joueur', aid: 'chien', v: 0 });
      e.shelter = { x: nx, z: nz };
    }
    if (hidden) for (const e of entities.extra.slice()) if (e.kind === 'dog' && e.owner) entities.remove(e);
  },

  nearStation(st) {
    const w = this.world, p = this.player.pos;
    const ids = st === 'etabli' ? ['etabli'] : st === 'four' ? ['four'] : ['feu_camp', 'cheminee', 'four'];
    for (const q of w.props) if (w.live(q) && ids.includes(q.id) && Math.hypot(q.x - p[0], q.z - p[2]) < 4.5 && Math.abs(q.y - p[1]) < 3) return true;
    return false;
  },
  craft(r) {
    if (!farm.has(r.need) || (r.st && !this.nearStation(r.st))) return;
    for (const k in r.need) farm.take(k, r.need[k]);
    farm.give(r.out, r.n);
    sound.place();
  },

  // ------------------------------------------------------------- journées
  trySleep(where) {
    const h = npcs.hour();
    if (h > 5.5 && h < 18.5 && this.player.hp > 40) { ui.subtitle('', '(Pas encore sommeil. Il reste du jour.)', 2.5); return; }
    this.sleep(where);
  },
  async sleep(where) {
    if (this.sleeping || this.dying) return;
    this.sleeping = true;
    ui.close(true);
    const w = this.world, s = farm.s, p = this.player;
    await ui.fade(true, '', 1100);
    // porte de la ferme ouverte une nuit où le tueur rôde…
    if (where === 'ferme' && strange.killerActive() && !strange.s.red) {
      const d = w.doors[w.bld.ferme.door];
      if (d && !d.locked && Math.random() < 0.6) {
        $('#fade-text').textContent = 'Dans la nuit, la porte grince. Des pas s’approchent du lit.';
        sound.steps1(1, 0);
        await new Promise((r) => setTimeout(r, 2600));
        this.sleeping = false;
        this.die('Assassiné dans son sommeil, porte ouverte');
        return;
      }
    }
    // dormir dehors (somnifère) une nuit où il rôde…
    if (where === 'dehors' && !w.covered(...p.eyePos()) && strange.killerActive() && !BUFF.on('pacte_nuit') && Math.random() < 0.5) { this.sleeping = false; this.die('Endormi dehors, une nuit où l’on ne dort pas dehors'); return; }
    const hBefore = npcs.hour();
    this.killerNight = this.killerNight || (strange.killerActive() && !strange.s.red);
    this.skipHours(((0.25 - w.time + 1) % 1) * 24);
    w.time = 0.25; this.dayStart();
    this.lastT = w.time;
    p.hp = Math.min(100, p.hp + 40); p.food = Math.max(0, p.food - 18); p.stamina = 1;
    if (where === 'auberge') s.flags.rented = 0;
    npcs.snap(w);
    for (const e of entities.list) if (e.owner && e.shelter) { e.x = e.shelter.x + (Math.random() - 0.5) * 3; e.z = e.shelter.z + (Math.random() - 0.5) * 3; e.y = entities.groundY(w, e, e.x, e.z); e.state = 'idle'; }
    farm.save();
    $('#fade-text').textContent = 'Jour ' + s.day;
    await new Promise((r) => setTimeout(r, 1300));
    await ui.fade(false, '', 1200);
    this.sleeping = false;
  },
  // Temps sauté (nuit, évanouissement) : les cultures poussent pendant ce temps
  skipHours(h) {
    if (!(h > 0)) return;
    farm.s.hours += h;
    const step = 0.5;
    for (let t = 0; t < h; t += step) farm.tick(Math.min(step, h - t), { rain: weather.cur.rain, heat: false, storm: false });
    farm.dirtyProps = true;
  },
  dayStart() {
    const s = farm.s, w = this.world;
    const prev = weather.dayPlan(s.seed, s.day), next = weather.dayPlan(s.seed, s.day + 1);
    farm.newDay({ rain: prev.rain, storm: prev.storm, heat: prev.heat, frost: next.frost });
    strange.newDay({ killerNight: this.killerNight || strange.killerNight });
    this.killerNight = false; strange.killerNight = false;
    npcs.morning(w);
    this.refillLoot();
    // pièges et ruches
    for (const q of w.props) {
      if (q.gone) continue;
      if (q.id === 'piege' && !(q.data && q.data.prise) && Math.random() < 0.4) farm.setPropData(q, { prise: 1 });
      if (q.id === 'ruche' && s.day % 3 === 0) farm.setPropData(q, { miel: 1 + (Math.random() < 0.4 ? 1 : 0) });
    }
    // petites lettres des amis
    for (const n of npcs.list) if (n.st.alive && npcs.level(n) >= 5 && Math.random() < 0.08) {
      const L = n.d.lines;
      farm.mail(n.name + ' ' + n.d.surname, 'Un mot de ' + n.name, fmtLine(pick(L.greet.ami), n) + '\n\n' + fmtLine(pick(L.adieu), n));
    }
    if (s.day === 2) farm.mail('La mairie de ' + farm.names.ville, 'Avis aux habitants', 'Il est rappelé que les ponts-levis de la ville sont relevés chaque soir à neuf heures et abaissés à six heures. Nul ne pourra entrer ni sortir entre ces heures.\n\nLe maire.');
    // les bêtes reviennent (ou non)
    for (const a of s.animals) if (a.lost) a.lost = Math.random() < 0.6 ? 0 : a.lost + 1;
    this.syncAnimals();
    this.crowDay = 0;
    this.spawnFouilles(true);
    for (const fn of HOOKS.day) fn();
  },
  // Terre remuée çà et là : on y creuse à la houe
  spawnFouilles(fresh) {
    const w = this.world, s = farm.s, F = w.farm.f;
    if (fresh) {
      for (const f of s.fouilles) { const it = w.inter.find((i) => i.id === f.id); if (it) w.inter.splice(w.inter.indexOf(it), 1); }
      w.props = w.props.filter((q) => !q.fouille);
      s.fouilles = []; s.fouillesDay = s.day;
      const rnd = mulberry32(s.seed * 7 + s.day * 131);
      for (let k = 0, t = 0; k < 9 && t < 200; t++) {
        const a = rnd() * TAU, d = 25 + rnd() * 420, x = F.x + Math.cos(a) * d, z = F.z + Math.sin(a) * d;
        if (!w.inside(x, z, 20) || w.heightAt(x, z) < w.waterLevel + 0.4 || w.matAt(x, z) > M_DIRT || w.normalAt(x, z)[1] < 0.9 || !pointFree(w, x, z, 0.8)) continue;
        s.fouilles.push({ x: Math.round(x * 10) / 10, z: Math.round(z * 10) / 10, id: 'fouille' + s.day + '_' + k });
        k++;
      }
    }
    for (const f of s.fouilles) {
      if (w.props.some((q) => q.fouille === f.id)) continue;
      const y = w.heightAt(f.x, f.z);
      w.props.push({ id: 'fouille', x: f.x, y, z: f.z, r: (f.x * 7) % TAU, fouille: f.id });
      w.inter.push({ kind: 'dig', id: f.id, x: f.x, y: y + 0.3, z: f.z, name: 'Creuser', data: { loot: 'fouille', daily: true } });
    }
    farm.dirtyProps = true;
  },
  // Corbeaux : par beau temps, le matin, ils s'attaquent aux semis non protégés
  crowRaid() {
    const w = this.world, s = farm.s, h = npcs.hour();
    if (this.crowDay === s.day || h < 7 || h > 10) return;
    const st = weather.state;
    if (!['clear', 'cloudy', 'heat', 'frost'].includes(st)) { this.crowDay = s.day; return; }
    this.crowDay = s.day;
    const scare = w.props.filter((q) => !q.gone && PLACEABLES[q.id] && PLACEABLES[q.id].scare);
    const nests = w.props.filter((q) => !q.gone && q.id === 'nichoir');
    const cells = [];
    for (const k in s.crops) {
      const c = s.crops[k];
      if (!c.c || c.dead || c.tree) continue;
      const i = k.indexOf(','), x = +k.slice(0, i) + 0.5, z = +k.slice(i + 1) + 0.5;
      if (scare.some((q) => Math.hypot(q.x - x, q.z - z) < PLACEABLES[q.id].scare)) continue;
      if (nests.some((q) => Math.hypot(q.x - x, q.z - z) < 12) && Math.random() < 0.6) continue;
      cells.push({ x, z, c });
    }
    if (!cells.length || Math.random() < 0.3) return;
    const n = Math.min(cells.length, 3 + Math.floor(Math.random() * 4));
    for (let k = 0; k < n; k++) {
      const cell = cells.splice((Math.random() * cells.length) | 0, 1)[0];
      const e = entities.add(w, 'crow', cell.x + (Math.random() - 0.5) * 40, cell.z + (Math.random() - 0.5) * 40, {});
      e.baseY = w.heightAt(e.x, e.z); e.y = e.baseY + 22; e.flyA = Math.random() * TAU; e.flyR = 10; e.flyH = 20; e.flyS = 0.3; e.scaredT = 0;
      e.land = { x: cell.x, z: cell.z, y: w.heightAt(cell.x, cell.z) + 0.08, onLand: () => { if (cell.c.g < 1.5) { cell.c.c = null; cell.c.g = 0; } else cell.c.g = Math.max(0, cell.c.g - 1); farm.dirtyProps = true; } };
      e.landT = 14;
      e.lifeT = 60;
    }
  },

  // ------------------------------------------------------------- mort : une seule vie
  async die(cause) {
    if (this.dying) return;
    for (const fn of HOOKS.death) if (fn(cause)) return;
    this.dying = true;
    const p = this.player, s = farm.s;
    const place = strange.placeName(p.pos) || 'la vallée';
    farm.recordDeath(cause, place);
    sound.heartbeat(1);
    this.unlock();
    ui.close(true);
    $('#fade').style.background = '#1a0000';
    await ui.fade(true, '', 1400);
    $('#fade').style.background = '';
    ui.showDeath(cause, s.day, s.run);
    await ui.fade(false, '', 10);
  },
  async afterDeath() {
    $('#death').classList.remove('open');
    await this.startFarm(null);
  },

  // ------------------------------------------------------------- lumières dynamiques
  gatherLights(eye, basis) {
    const w = this.world, sky = this.sky, L = [], flick = strange.flickerT > 0;
    for (const l of w.lights) {
      let k = 1.1;
      if (l.night) k = sky.nightLit ? 1.3 : 0;
      else if (l.flicker) k = 1.25 + Math.sin(this.time * 13 + l.seed) * 0.12 + Math.sin(this.time * 31 + l.seed * 3) * 0.08;
      else if (l.power) k = 1.25;
      if (flick && l.night) k *= Math.random() < 0.5 ? 0.1 : 1;
      if (!k) continue;
      const d = Math.hypot(l.x - eye[0], l.y - eye[1], l.z - eye[2]);
      if (d > sky.fog[1] + l.r) continue;
      L.push({ x: l.x, y: l.y, z: l.z, r: l.r, c: v3.scale(l.c, k), d });
    }
    if (this.kind === 'farm') { for (const l of strange.lights(eye)) L.push(l); for (const fn of HOOKS.lights) for (const l of fn(eye)) L.push(l); }
    L.sort((a, b) => a.d - b.d);
    if (L.length > MAX_LIGHTS - 1) L.length = MAX_LIGHTS - 1;
    if (this.kind === 'farm' && this.lantern && farm.count('lanterne')) {
      const fl = 1 + Math.sin(this.time * 11) * 0.05 + Math.sin(this.time * 23) * 0.03;
      L.unshift({ x: eye[0] - basis.r[0] * 0.3, y: eye[1] - 0.35, z: eye[2] - basis.r[2] * 0.3, r: 12, c: [1.05 * fl, 0.78 * fl, 0.46 * fl], d: 0 });
    }
    if (L.length > MAX_LIGHTS) L.length = MAX_LIGHTS;
    const n = L.length;
    for (let i = 0; i < n; i++) {
      this.lightPos.set([L[i].x, L[i].y, L[i].z, L[i].r], i * 4);
      this.lightCol.set(L[i].c, i * 3);
    }
    let gl3 = v3.add(v3.add(sky.amb, v3.scale(sky.sunCol, 0.6)), v3.scale(sky.moonCol, 0.8));
    if (w.covered(eye[0], eye[1], eye[2])) gl3 = v3.scale(gl3, 0.4);
    for (let i = 0; i < n; i++) {
      const a = clamp(1 - L[i].d / L[i].r, 0, 1);
      gl3 = v3.add(gl3, v3.scale(L[i].c, a * a));
    }
    if (this.flashlight) gl3 = v3.add(gl3, [0.25, 0.24, 0.2]);
    return { pos: this.lightPos, col: this.lightCol, n, gunLight: gl3.map((v) => Math.min(v, 1.6)) };
  },

  // ------------------------------------------------------------- objet en main (dessiné sur un petit canevas)
  viewModel(p, dt) {
    const s = farm.s, id = s.hand, it = ITEMS[id];
    let key, frame = 0, kind = 'vm';
    const swing = play.swingT > 0 ? 1 - play.swingT / 0.42 : 0;
    if (id === 'main' || !it) { key = swing > 0 ? 'main' : 'rien'; frame = 1; }
    else if (VM[id]) { key = id; frame = swing > 0.15 && swing < 0.7 ? 1 : 0; }
    else if (it.tool && VM[it.tool]) { key = it.tool; frame = swing > 0.15 && swing < 0.7 ? 1 : 0; }
    else if (id === 'montre' || id === 'boussole') { key = 'cadran'; kind = 'dial'; }
    else { key = 'tenir'; kind = 'item'; }
    if (id === 'arrosoir') frame = play.canTilt > 0 ? 1 : 0;
    if (id === 'canne') frame = play.fish ? 1 : 0;
    if (id === 'arc') frame = play.bow <= 0 ? 0 : play.bow < 0.6 ? 1 : 2;
    if (id === 'seau') frame = 0;
    if (id === 'lanterne') frame = this.lantern ? 1 : 0;
    if (id === 'cisailles') frame = swing > 0 ? 1 : 0;
    const lanternL = false;
    const dialK = kind === 'dial' ? Math.floor(this.time * 4) : 0;
    const sig = key + ':' + frame + ':' + (kind === 'item' ? id : '') + ':' + (lanternL ? 1 : 0) + ':' + dialK;
    const cv = this.vmCanvas;
    let dirty = false;
    if (sig !== this.vmKey) {
      this.vmKey = sig; dirty = true;
      const ctx = cv.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, VM_W, VM_H);
      const pbCanvas = (pb) => pb._cv || (pb._cv = pb.canvas());
      if (lanternL) ctx.drawImage(pbCanvas(VM.lanterne[1]), -6, 4);
      const L = VM[key];
      if (L) ctx.drawImage(pbCanvas(L[Math.min(frame, L.length - 1)]), 0, 0);
      if (kind === 'item') { const c3 = it && (it.place || it.animal || id === 'jeune_pommier') ? ICON3D.canvas(id) : null; const sp = ATLAS.sprites['it_' + id]; if (c3) ctx.drawImage(c3, 54, 42, 48, 48); else if (sp) ctx.drawImage(sp.canvas, 58, 46, 40, 40); }
      if (kind === 'dial') {
        ctx.strokeStyle = '#1a1612'; ctx.lineWidth = 2;
        const cx = 70, cy = 66;
        if (id === 'montre') {
          const hrs = this.world.time * 24, a1 = (hrs % 12) / 12 * TAU, a2 = (hrs % 1) * TAU;
          for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; ctx.fillStyle = '#3a3026'; ctx.fillRect(Math.round(cx + Math.sin(a) * 15) - 1, Math.round(cy - Math.cos(a) * 15) - 1, 2, 2); }
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(a1) * 9, cy - Math.cos(a1) * 9); ctx.stroke();
          ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(a2) * 14, cy - Math.cos(a2) * 14); ctx.stroke();
        } else {
          const a = p.yaw + (strange.inEnvers() ? this.time * 2 : 0);
          ctx.fillStyle = '#b02a1a'; ctx.strokeStyle = '#b02a1a';
          ctx.beginPath(); ctx.moveTo(cx - Math.sin(a) * 15, cy - Math.cos(a) * 15); ctx.lineTo(cx + Math.cos(a) * 3, cy - Math.sin(a) * 3); ctx.lineTo(cx - Math.cos(a) * 3, cy + Math.sin(a) * 3); ctx.fill();
          ctx.fillStyle = '#2a2a30'; ctx.beginPath(); ctx.moveTo(cx + Math.sin(a) * 15, cy + Math.cos(a) * 15); ctx.lineTo(cx + Math.cos(a) * 3, cy - Math.sin(a) * 3); ctx.lineTo(cx - Math.cos(a) * 3, cy + Math.sin(a) * 3); ctx.fill();
        }
      }
    }
    const bobX = Math.cos(p.bobPhase) * 0.035 * p.bobAmp, bobY = -Math.abs(Math.sin(p.bobPhase)) * 0.035 * p.bobAmp + (p.swimming ? -0.2 : 0);
    const eat = play.eatT > 0 ? -Math.sin(play.eatT / 0.8 * Math.PI) * 0.12 : 0;
    return { vm: true, canvas: cv, dirty, ox: bobX + (kind === 'item' ? -0.05 : 0), oy: bobY + eat + (p.riding ? -0.06 : 0), light: null, scale: 1 };
  },

  // ------------------------------------------------------------- boucle
  loop(now) {
    requestAnimationFrame((t) => this.loop(t));
    let dt = (now - this.last) / 1000;
    this.last = now;
    if (!(dt > 0)) dt = 0.016;
    dt = Math.min(dt, 0.05);
    this.time += dt;
    const w = this.world, p = this.player, F = this.kind === 'farm' && farm.on;
    if (!w) return;
    const frozen = !!ui.panel || this.dying || this.sleeping;
    const playing = this.mode === 'play' && !frozen;

    // temps qui passe (le temps s'écoule aussi quand on parle : la vallée ne s'arrête pas)
    let speed = this.mode === 'menu' ? (F && this.started ? 0 : 1) : this.timeScale * (this.fastTime ? 60 : 1);
    if (F && (this.dying || this.sleeping)) speed = 0;
    if (F && strange.freezeT > 0) speed = 0;
    const prevT = w.time;
    w.time += dt * speed / w.dayLength;
    if (F && this.started && !strange.inEnvers()) {
      const dH = dt * speed * 24 / w.dayLength;
      farm.s.hours += dH;
      this.tickAcc = (this.tickAcc || 0) + dH;
      if (this.tickAcc > 0.04) { farm.tick(this.tickAcc, { rain: weather.cur.rain, heat: weather.cur.heat > 0.5, storm: weather.cur.storm > 0.5 }); this.tickAcc = 0; }
    }
    if (w.time >= 1) { w.time -= 1; this.dayCount++; }
    if (!(F && strange.cloudStop > 0)) this.cloudT += dt;
    if (F) {
      // l'aube sans avoir dormi : nouvelle journée
      if (prevT < 0.25 && w.time >= 0.25 && this.started) { this.dayStart(); }
      this.dayCount = farm.s.day - 1;
      // épuisement : à 3 h du matin, on s'effondre
      const h = w.time * 24;
      if (playing && h >= 3 && h < 5 && !p.riding && !BUFF.on('vigueur')) this.faint();
    }

    // regard + déplacements
    if (this.mode !== 'menu' && !frozen) {
      const s = settings.sens * 0.0022;
      p.yaw -= input.dx * s;
      p.pitch = clamp(p.pitch - input.dy * s * (settings.invertY ? -1 : 1), -1.55, 1.55);
    }
    const K = (a, b) => (!frozen && (input.down(a) || input.down(b)) ? 1 : 0);
    const ctl = {
      fwd: K('KeyW', 'ArrowUp') - K('KeyS', 'ArrowDown'),
      right: K('KeyD', 'ArrowRight') - K('KeyA', 'ArrowLeft'),
      up: K('Space', 'Space') === 1, down: K('KeyC', 'KeyC') === 1,
      sprint: K('ShiftLeft', 'ShiftRight') === 1,
      onFall: F ? (v) => { if (v > 13 && !BUFF.on('legerete')) play.hurt((v - 13) * 9, null, 'Une mauvaise chute'); } : null,
      onStep: F && strange.echoT > 0 ? () => setTimeout(() => sound.step('hard', 3), 380) : null,
    };
    if (this.mode !== 'menu' && !(F && (this.dying || this.sleeping))) p.update(dt, w, ctl);
    if (F) strange.echoT = Math.max(0, strange.echoT - dt);

    // caméra
    let camPos, yaw, pitch;
    if (this.mode === 'menu' && !this.started) {
      this.attractA += dt * 0.04;
      const fm = F && w.farm ? w.farm.f : null;
      const cx = fm ? fm.x : w.spawn.x, cz = fm ? fm.z : w.spawn.z, r = fm ? 60 : 34;
      const x = cx + Math.cos(this.attractA) * r, z = cz + Math.sin(this.attractA) * r;
      const y = Math.max(w.heightAt(x, z), w.waterLevel) + (fm ? 14 : 9);
      camPos = [x, y, z];
      const ty = w.heightAt(cx, cz) + 3;
      yaw = Math.atan2(-(cx - x), -(cz - z));
      pitch = Math.atan2(ty - y, Math.hypot(cx - x, cz - z));
    } else {
      camPos = p.eyePos(); yaw = p.yaw; pitch = p.pitch + p.kickPitch;
      if (this.shakeT > 0) { this.shakeT = Math.min(this.shakeT, 1) - dt; const k = Math.max(0, this.shakeT) * 0.05, t = this.time; camPos = [camPos[0] + Math.sin(t * 37) * k, camPos[1] + Math.sin(t * 43 + 1) * k, camPos[2] + Math.sin(t * 31 + 2) * k]; }
      if (F && play.nausea > 0) yaw += Math.sin(this.time * 1.3) * Math.min(0.025, 0.004 * play.nausea);
      if (F) for (const fn of HOOKS.camera) { const c = fn(dt, camPos, yaw, pitch); if (c) { camPos = c.pos; yaw = c.yaw; pitch = c.pitch; } }
    }
    weather.update(dt, w);
    const wc = weather.cur;
    // ambiance propre au biome (brume du marais, sous-bois…)
    const bNow = F ? this.biomeAt(p.pos) : 'plaine';
    const bFogT = F && !p.underground ? (BIOME_FOG[bNow] || 0) : 0;
    this.bFog = (this.bFog || 0) + (bFogT - (this.bFog || 0)) * Math.min(1, dt * 0.4);
    const sky = this.sky = computeSky(w.time, settings.viewDist, {
      cloud: wc.cloud, rain: wc.rain, storm: wc.storm, flash: weather.flash, fog: Math.min(1, wc.fog + this.bFog), frost: wc.frost, heat: wc.heat,
      red: F ? strange.redK : 0, envers: F ? strange.enversK : 0,
    });
    if (F && p.underground) { sky.wet = 0; }
    if (F) for (const fn of HOOKS.sky) fn(sky);
    const basis = cameraBasis(yaw, pitch);
    const eye = p.eyePos();

    // ---------------------------------------------------------- ferme
    if (F) this.farmUpdate(dt, eye, basis, sky, playing);

    // éditeur (création)
    if (this.mode === 'edit') { this.editorRay(); editor.apply(w, dt); } else editor.hit = null;

    const lights = this.gatherLights(camPos, basis);

    // créatures
    if (entities.version !== w.objVersion) entities.sync(w);
    const inside = w.covered(eye[0], eye[1], eye[2]);
    entities.update(dt, w, {
      px: p.pos[0], pz: p.pos[2], night: sky.night, rain: wc.rain, storm: wc.storm, frozen: this.mode === 'edit', t: this.time, right: basis.r,
      crouch: p.crouch > 0.5, sprint: p.sprinting, alive: !this.dying, inside, riding: !!p.riding, lantern: F && this.lantern,
      fire: F && lights.n > 0 && this.nearFire(p.pos), nearFarm: F && w.farm && Math.hypot(p.pos[0] - w.farm.f.x, p.pos[2] - w.farm.f.z) < 150,
      hurt: (d, src, cause) => { if (F) play.hurt(d, src, cause); }, silent: F && (strange.redNight() || strange.inEnvers()),
    });
    if (this.mode === 'play' && !p.fly) entities.pushPlayer(p);

    // titres des lieux (création seulement : pas d'affichage en mode ferme)
    if (!F) {
      this.poiT -= dt;
      if (this.poiT <= 0 && this.mode !== 'menu') {
        this.poiT = 0.5;
        for (const poi of w.pois) {
          const ins = Math.hypot(poi.x - p.pos[0], poi.z - p.pos[2]) < poi.r;
          if (ins && !this.poiIn.has(poi)) { this.poiIn.add(poi); if (this.mode === 'play') ui.showTitle(poi.name, 'JOUR ' + (this.dayCount + 1) + ' · ' + clockText(w.time)); }
          else if (!ins && Math.hypot(poi.x - p.pos[0], poi.z - p.pos[2]) > poi.r + 15) this.poiIn.delete(poi);
        }
      }
    }

    // feux : étincelles + fumée ; audio
    let fire = 0, firePan = 0;
    for (const l of w.lights) {
      if (!l.flicker) continue;
      const d = Math.hypot(l.x - camPos[0], l.z - camPos[2]);
      if (d < 45 && (!l.prop || l.prop.id === 'feu_camp')) {
        if (Math.random() < dt * 9) particles.spawn(l.x + (Math.random() - 0.5) * 0.6, l.y - 0.2, l.z + (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6, 1.5 + Math.random() * 1.8, (Math.random() - 0.5) * 0.6, [1, 0.62, 0.22, 1], 0.05, 0.8 + Math.random() * 0.8, -0.4, true);
        if (Math.random() < dt * 4) { particles.spawn(l.x, l.y + 0.3, l.z, (Math.random() - 0.5) * 0.3 + 0.25, 0.9 + Math.random() * 0.4, (Math.random() - 0.5) * 0.3, [0.35, 0.34, 0.33, 0.4], 0.35, 2.5 + Math.random(), -0.05, false); particles.list[particles.list.length - 1].grow = 3; }
      }
      const k = clamp(1 - d / 28, 0, 1);
      if (k > fire) { fire = k; const ang = Math.atan2(l.x - camPos[0], l.z - camPos[2]); firePan = Math.sin(ang - Math.atan2(basis.r[0], basis.r[2]) + Math.PI / 2); }
    }
    if (F && this.mode === 'play' && !p.underground && !strange.inEnvers()) this.biomeParticles(dt, bNow, camPos, sky);
    const pl = v3.add(v3.add(sky.amb, v3.scale(sky.sunCol, 0.8)), v3.scale(sky.moonCol, 0.7)).map((v) => Math.min(v, 1.2));
    if (!(F && strange.freezeT > 0)) particles.update(dt, pl);
    const biome = F ? this.biomeAt(p.pos) : 'plaine';
    const quiet = F && (strange.redNight() || strange.inEnvers() || strange.freezeT > 0);
    sound.update(dt, { day: quiet ? 0 : sky.day, night: quiet ? 0 : sky.night, fire, firePan, height: camPos[1] - w.waterLevel, inside, rain: p.underground ? 0 : F ? vallee.rainK : wc.rain, storm: p.underground ? 0 : wc.storm });
    if (F) sound.biomeAmb(dt, { biome, day: sky.day, night: sky.night, rain: wc.rain, inside, under: p.underground, envers: strange.inEnvers(), red: strange.redNight(), forge: Math.hypot(p.pos[0] - (w.bld.forge ? w.bld.forge.x : 0), p.pos[2] - (w.bld.forge ? w.bld.forge.z : 0)) < 60 });

    // objet en main
    let gun = null, gunL = null;
    if (this.mode === 'play' && F && !this.dying && !this.noHand) {
      gun = this.viewModel(p, dt); gun.light = lights.gunLight;
      if (this.lantern && farm.s.hand !== 'lanterne' && farm.count('lanterne')) gunL = { spr: 'vm_lantern', frame: 1, ox: gun.ox * 0.6 + 0.02, oy: gun.oy * 0.8 - 0.02, light: lights.gunLight };
    }

    // effets d'écran
    let fx = [0, 0, 0, 0], tint = [0, 0, 0, 0], glitch = [0, 0, 0, 0];
    if (F) {
      const h = w.time * 24, fat = h >= 1.5 && h < 3 ? (h - 1.5) / 1.5 : 0;
      const sfx = strange.fx();
      fx = [Math.max(fat * 0.8, p.hp < 30 ? (30 - p.hp) / 60 : 0, p.food < 5 ? 0.25 : 0), sfx.red, play.nausea > 0 ? Math.min(1, play.nausea / 5) : 0, sfx.envers];
      if (play.hurtFlash > 0) tint = [0.55, 0, 0, Math.min(0.55, play.hurtFlash * 0.6)];
      glitch = sfx.glitch;
      for (const fn of HOOKS.fx) fn(fx, tint, sky);
    }

    this.renderer.resize(settings.pixel);
    const ghost = this.mode === 'edit' && editor.ghost ? { b: editor.ghost, col: [0.35, 1, 0.45, 0.55] } : null;
    // modèles 3D : objets posés (statiques), créatures, habitants, portes, ponts
    let props = null, dyn = null, shadows = null;
    if (F) {
      play.buildProps(camPos, sky);
      play.buildDynamic(camPos, sky, this.time);
      entities.draw(play.dynBuf, play.shadowBuf, camPos, Math.min(90, sky.fog[1] + 10), this.time, 0);
      npcs.draw(play.dynBuf, play.shadowBuf, camPos, this.time, Math.min(110, sky.fog[1] + 20));
      strange.draw(play.dynBuf, play.shadowBuf, camPos, this.time);
      for (const fn of HOOKS.draw) fn(play.dynBuf, play.shadowBuf, camPos, this.time);
      if (p.riding) { const e = p.riding; poseQuad(e.rig, { move: Math.min(1, Math.hypot(p.vel[0], p.vel[2]) / 4), phase: (e.phase += dt * Math.hypot(p.vel[0], p.vel[2]) * 0.9), run: p.sprinting, t: this.time, lookP: 0.55 }); drawRig(play.dynBuf, e.rig, p.pos[0], p.pos[1], p.pos[2], p.yaw + Math.PI, 1, 0); e.x = p.pos[0]; e.z = p.pos[2]; e.y = p.pos[1]; }
      props = play.propBuf; dyn = play.dynBuf; shadows = play.shadowBuf;
    } else {
      play.dynBuf.reset(); play.shadowBuf.reset();
      entities.draw(play.dynBuf, play.shadowBuf, camPos, Math.min(90, sky.fog[1] + 10), this.time, 0);
      dyn = play.dynBuf; shadows = play.shadowBuf;
    }
    const ents = { data: this.flyData || (this.flyData = new Float32Array(64 * 13)), n: 0 };
    if (F) ents.n = play.appendFlyers(ents.data, 0);
    this.renderer.render({
      cam: { pos: camPos, yaw, pitch, fovX: settings.fov * DEG * (this.fovK || 1) },
      sky, time: this.time, cloudT: this.cloudT, lights, flash: this.flashlight && !F ? 1 : 0,
      bands: settings.bands ? 14 : 0, levels: settings.dither ? 28 : 0, gamma: 1 / settings.gamma,
      grass: strange.inEnvers() && F ? null : { n: 150, spacing: 0.56, radius: 40 },
      particles, brush: this.mode === 'edit' ? editor.brushUniform() : null, brushCol: editor.brushColor(), ghost, gun, gunL,
      underwater: camPos[1] < w.waterLevel && w.heightAt(camPos[0], camPos[2]) < w.waterLevel,
      ents, rain: p.underground ? 0 : F ? vallee.rainK : wc.rain, rainWind: weather.rainWind(), snow: F && !p.underground ? vallee.snowK : 0,
      snowCol: v3.scale([0.92, 0.94, 0.97], Math.min(1.05, sky.amb[1] * 1.4 + 0.25 + weather.flash)),
      rainCol: v3.add(v3.scale([0.62, 0.66, 0.74], Math.min(1, sky.amb[1] * 1.3 + 0.12)), [weather.flash, weather.flash, weather.flash]),
      fx, tint, glitch, seed: Math.random() * 100, props, dyn, shadows, shadowA: 0.32 * (0.35 + sky.day * 0.65), moon2: F ? Math.min(1, strange.twoMoons) : 0,
    });

    ui.updateHUD(dt);
    if (this.kind === 'creative' && this.worldChanged) {
      this.saveT += dt;
      if (this.saveT > 20 && !editor.stroke) this.save();
    }
    if (F && this.started && !this.dying) { this.autoT += dt; if (this.autoT > 45) { this.autoT = 0; farm.save(); } }
    input.consume();
  },

  // ------------------------------------------------------------- ferme : mise à jour de la partie
  farmUpdate(dt, eye, basis, sky, playing) {
    this.player.mods.speed = farm.s.inv.bottes ? 1.12 : 1;
    const w = this.world, p = this.player, s = farm.s, h = w.time * 24;
    const f = cameraBasis(p.yaw, p.pitch);
    // ponts-levis : relevés de 21 h à 6 h (sauf s'il n'y a plus de garde… ils le sont quand même)
    for (const b of w.bridges) {
      const up = h >= 21 || h < 6;
      const tgt = up ? Math.PI / 2 * 0.98 : 0;
      if ((b.a < 0.05 && up) || (b.a > 1.4 && !up)) { if (!b.moving) { b.moving = true; if (Math.hypot(b.x - p.pos[0], b.z - p.pos[2]) < 200) sound.chain && sound.chain(); } }
      b.a += clamp(tgt - b.a, -dt * 0.22, dt * 0.22);
      if (Math.abs(tgt - b.a) < 0.01) b.moving = false;
    }
    // cible de E, maintien sur une porte (verrou)
    this.target = playing ? this.findTarget(eye, f.f) : null;
    for (const d of w.doors) d.hi = false;
    for (const n of npcs.list) n.hi = false;
    for (const e of entities.list) e.highlight = false;
    this.hiProp = null; this.hiCrop = null;
    if (this.target) {
      const t = this.target;
      if (t.kind === 'door') t.d.hi = true; else if (t.kind === 'npc') t.n.hi = true; else if (t.kind === 'animal') t.e.highlight = true;
      else if (t.kind === 'prop') this.hiProp = t.q;
      else if (t.kind === 'crop') this.hiCrop = t;
      else if (t.kind === 'inter') {
        let best = null, bd = 1.4;
        for (const q of w.props) { if (!w.live(q) || !PROP_MODELS[q.id] || q.id === 'epouvantail') continue; const d = Math.hypot(q.x - t.it.x, q.z - t.it.z); if (d < bd && Math.abs(q.y - t.it.y) < 2.5) { bd = d; best = q; } }
        this.hiProp = best;
      }
    }
    if (playing && input.down('KeyE')) {
      this.holdE += dt;
      const t = this.target;
      this.eHarvestT = (this.eHarvestT || 0) - dt;
      if (t && t.kind === 'crop' && this.holdE > 0.15 && this.eHarvestT <= 0 && !t.c.dead && farm.ripe(t.c)) { play.harvestCrop(t.x, t.z, t.c); this.eHarvestT = 0.12; this.holdDone = true; }
      if (!this.holdDone && this.holdE > 0.55 && t && t.kind === 'door' && (t.d.bld === 'ferme' || t.d.bld === 'poulailler')) {
        this.holdDone = true;
        if (t.d.open) { t.d.open = 0; sound.door(false); }
        t.d.locked = !t.d.locked; sound.lock(t.d.locked);
      }
    }
    // outils
    play.cool = Math.max(0, play.cool - dt);
    play.canTilt = Math.max(0, (play.canTilt || 0) - dt);
    play.eatT = Math.max(0, play.eatT - dt);
    if (play.swingT > 0) { const before = play.swingT; play.swingT = Math.max(0, play.swingT - dt); if (before > 0.2 && play.swingT <= 0.2) play.resolveHit(); }
    const held = playing && input.locked && (input.buttons & 1);
    if (playing && input.locked && (input.clicked & 1)) play.primary(eye, f, false);
    else if (held && play.cool <= 0) {
      // clic maintenu : on enchaîne (labourer, semer, arroser, engrais, clôtures, récolte à la main)
      const hi = play.item() || {};
      if (farm.s.hand === 'main' || ['hache', 'pioche', 'faux', 'houe', 'arrosoir'].includes(hi.tool) || hi.crop || hi.fert || (hi.place && PLACEABLES[hi.place] && PLACEABLES[hi.place].snap)) play.primary(eye, f, true);
    }
    play.bowHold(dt, held);
    play.updateGhost(eye, f.f);
    play.updateFish(dt);
    play.updateArrows(dt);
    play.updateFlyers(dt, eye);
    if (!this.dying && !this.sleeping) play.updateBody(dt);
    // monture
    if (p.riding) { const e = p.riding; e.hx = p.pos[0]; e.hz = p.pos[2]; }
    // habitants, l'étrange, quêtes, livraisons, corbeaux
    const visible = (n) => {
      const dx = n.x - eye[0], dz = n.z - eye[2], d = Math.hypot(dx, dz) || 1;
      if (d > sky.fog[1]) return false;
      return (dx * basis.f[0] + dz * basis.f[2]) / d > 0.35;
    };
    npcs.update(dt, w, { px: p.pos[0], pz: p.pos[2], visible });
    const insideFarm = this.insideBuilding('ferme');
    const insideAny = w.covered(eye[0], eye[1], eye[2]);
    const doorsShut = insideAny && this.doorsShutAround(p.pos);
    strange.update(dt, { eye, fwd: basis.f, right: basis.r, night: sky.night, fovX: settings.fov * DEG, fogEnd: sky.fog[1], insideFarm, insideAny, doorsShut, lantern: this.lantern });
    quests.update(dt);
    deliveries.update();
    this.crowRaid();
    this.machineFx(dt);
    for (const fn of HOOKS.update) fn(dt, eye, basis, sky, playing);
    for (const e of entities.list) if (e.lifeT !== undefined) { e.lifeT -= dt; if (e.lifeT <= 0 && !e.land) entities.remove(e); }
  },
  // Petites particules d'ambiance : feuilles en forêt, brume au marais, pollen dans les prés, neige de cendre dans l'Envers
  biomeParticles(dt, b, cam, sky) {
    const w = this.world, R = Math.random;
    const around = (r) => { const a = R() * TAU, d = 3 + R() * r; return [cam[0] + Math.cos(a) * d, cam[2] + Math.sin(a) * d]; };
    if ((b === 'foret' || b === 'bouleaux') && R() < dt * 5) {
      const [x, z] = around(14), y = w.heightAt(x, z) + 5 + R() * 5;
      const c = b === 'bouleaux' ? [0.85, 0.72, 0.25, 1] : R() < 0.5 ? [0.55, 0.42, 0.15, 1] : [0.35, 0.5, 0.18, 1];
      particles.spawn(x, y, z, (R() - 0.5) * 0.8, -0.6, (R() - 0.5) * 0.8, c, 0.06, 7, 0.02, false);
    }
    if (b === 'marais' && R() < dt * 9) {
      const [x, z] = around(20), y = Math.max(w.heightAt(x, z), w.waterLevel) + 0.15 + R() * 0.5;
      particles.spawn(x, y, z, (R() - 0.5) * 0.25, 0.01, (R() - 0.5) * 0.25, [0.72, 0.78, 0.76, 0.1], 0.32, 5 + R() * 3, 0, false);
      particles.list[particles.list.length - 1].grow = 0.8;
    }
    if ((b === 'plaine' || b === 'lande' || b === 'ferme') && sky.day > 0.6 && weather.cur.rain < 0.2 && R() < dt * 3) {
      const [x, z] = around(10), y = w.heightAt(x, z) + 0.8 + R() * 2;
      particles.spawn(x, y, z, 0.25 + R() * 0.2, 0.05, (R() - 0.5) * 0.2, [1, 0.98, 0.85, 0.8], 0.025, 5, -0.02, true);
    }
  },
  machineFx(dt) {
    this.mfxT = (this.mfxT || 0) - dt;
    if (this.mfxT > 0) return;
    this.mfxT = 0.35;
    const w = this.world, s = farm.s, p = this.player.pos;
    for (let i = farm.genProps; i < w.props.length; i++) {
      const q = w.props[i], m = q.data && q.data.m;
      if (!m || Math.abs(q.x - p[0]) > 50 || Math.abs(q.z - p[2]) > 50) continue;
      if (s.hours >= m.ready) particles.spawn(q.x + (Math.random() - 0.5) * 0.4, q.y + 1.1 + Math.random() * 0.3, q.z + (Math.random() - 0.5) * 0.4, 0, 0.4, 0, [1, 0.95, 0.6, 1], 0.05, 0.8, -0.1, true);
      else { particles.spawn(q.x, q.y + 1.0, q.z, (Math.random() - 0.5) * 0.2, 0.6, (Math.random() - 0.5) * 0.2, [0.8, 0.8, 0.8, 0.35], 0.18, 1.6, -0.05, false); particles.list[particles.list.length - 1].grow = 1.5; }
    }
  },
  insideBuilding(key) {
    const B = this.world.bld[key], p = this.player.pos;
    if (!B) return false;
    const [lx, lz] = World.blockLocal({ x: B.f.x, z: B.f.z, r: B.f.r }, p[0], p[2]);
    return Math.abs(lx) < B.W / 2 && Math.abs(lz) < B.D / 2 && Math.abs(p[1] - B.y) < 2.5;
  },
  doorsShutAround(pos) {
    for (const d of this.world.doors) if (Math.hypot(d.x - pos[0], d.z - pos[2]) < 9 && d.open) return false;
    return true;
  },
  nearFire(pos) { for (const l of this.world.lights) if (l.flicker && Math.hypot(l.x - pos[0], l.z - pos[2]) < 10) return true; return false; },
  biomeAt(pos) {
    const w = this.world;
    if (!w.biome) return 'plaine';
    const i = clamp(Math.floor(pos[0] / 8), 0, w.biomeW - 1), j = clamp(Math.floor(pos[2] / 8), 0, w.biomeW - 1);
    return BIOMES[w.biome[j * w.biomeW + i]] || 'plaine';
  },
  async faint() {
    if (this.sleeping || this.dying) return;
    this.sleeping = true;
    await ui.fade(true, 'Vos jambes se dérobent. Le sol est froid.', 1800);
    const w = this.world, p = this.player, outdoors = !w.covered(...p.eyePos());
    if (outdoors && strange.killerActive() && Math.random() < 0.5) { this.sleeping = false; this.die('Endormi dehors, une nuit où l’on ne dort pas dehors'); return; }
    this.killerNight = strange.killerActive() && !strange.s.red;
    this.skipHours(((0.3 - w.time + 1) % 1) * 24);
    w.time = 0.25; this.dayStart(); w.time = 0.3;
    const B = w.bld.ferme, bed = B.spots.bed;
    p.pos = [bed.x + Math.cos(bed.r) * 1.0, B.y + 0.02, bed.z - Math.sin(bed.r) * 1.0]; p.vel = [0, 0, 0];
    const lost = Math.floor(farm.s.money * 0.1); farm.s.money -= lost;
    npcs.snap(w);
    farm.mail('?', 'Sans signature', 'Nous vous avons ramené. Vous étiez tout près du chemin. La prochaine fois, nous vous laisserons peut-être où vous êtes.' + (lost ? `\n\nNous avons pris ${lost} pièces pour la peine.` : ''), { strange: true });
    farm.save();
    await ui.fade(false, '', 1500);
    this.sleeping = false;
  },
};

// Brume supplémentaire par biome (0..1)
const BIOME_FOG = { marais: 0.42, foret: 0.2, bouleaux: 0.12, lac: 0.08, lande: 0.05 };
// Objets posés qu'on peut utiliser (touche E)
const PROP_USE = Object.assign({ coffre: 1, caisse_expedition: 1, portillon: 1, piege: 1, ruche: 1, feu_camp: 1, four: 1, etabli: 1, puits_deco: 1, mangeoire: 1, bassin: 1, fontaine_jardin: 1, horloge: 1,
  tonneau: 'm', baratte: 'm', fumoir: 'm', presse: 'm', moulin_a_bras: 'm', composteur: 'm' }, PROP_USE_MORE);

window.addEventListener('DOMContentLoaded', () => {
  game.init().catch((e) => {
    console.error(e);
    $('#loading').classList.remove('open');
    const el = $('#fatal');
    el.querySelector('p').textContent = e.message;
    el.classList.add('open');
  });
});
