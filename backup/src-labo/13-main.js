// ============================================================================
//  JEU : modes (aventure / création), boucle principale, événements
// ============================================================================

const game = {
  world: null, renderer: null, player: new Player(), weapon: new Weapon(),
  kind: 'adventure', mode: 'menu', started: false, flashlight: false, timeScale: 1, fastTime: false, dayCount: 0,
  sky: null, worldChanged: false, saveT: 0, time: 0, attractA: 0, last: 0, lockErrors: 0,
  mmb: null, saveWarned: false, target: null,
  lightPos: new Float32Array(MAX_LIGHTS * 4), lightCol: new Float32Array(MAX_LIGHTS * 3),
  poiIn: new Set(), poiT: 0,

  async init() {
    const canvas = $('#gl');
    if (!glInit(canvas)) throw new Error("WebGL 2 n'est pas disponible sur ce navigateur / cette carte graphique.");
    buildMaterialTextures();
    buildSpriteAtlas();
    this.renderer = new Renderer(canvas);
    this.renderer.init();
    ui.init();
    this.applySettings();
    this.bindEvents();
    const saved = store.get('prairie.adv', null);
    await this.startAdventure(saved && saved.gen === ADV_GEN ? saved : null);
    $('#loading').classList.remove('open');
    requestAnimationFrame((t) => { this.last = t; this.loop(t); });
  },

  // ------------------------------------------------------------- modes
  async startAdventure(saved, seed) {
    $('#loading').classList.add('open');
    ui.setLoading('Préparation de la vallée…');
    this.kind = 'adventure'; this.mode = 'menu'; this.started = false;
    this.player.fly = false;
    await adv.start(saved, seed);
    this.dayCount = adv.s.day - 1;
    this.timeScale = 1;
    $('#loading').classList.remove('open');
    ui.showMenu(true);
  },
  async newAdventure() {
    if (adv.on && adv.s && adv.s.day > 1 && !confirm('Commencer une nouvelle aventure ? La partie en cours sera perdue.')) return;
    store.remove('prairie.adv');
    await this.startAdventure(null);
    ui.toast('Nouvelle aventure : bienvenue à la Station Prairie-7.');
  },
  enterCreative() {
    if (adv.on) adv.save();
    adv.on = false;
    ui.loading('Chargement du mode création…', () => {
      let w = null;
      const saved = store.getRaw('prairie.world');
      if (saved) { try { w = worldFromJSON(JSON.parse(saved)); } catch (e) { console.warn('Sauvegarde illisible', e); } }
      const old = !!w && (w.genVersion | 0) < GEN_VERSION;
      if (!w) w = generateWorld({ seed: 20260927, size: 512, name: 'Grande Prairie' });
      this.kind = 'creative'; this.mode = 'menu'; this.started = false;
      this.setWorld(w, true);
      const pp = saved ? store.get('prairie.player', null) : null;
      if (pp && Array.isArray(pp.pos)) { this.player.pos = pp.pos.slice(0, 3); this.player.yaw = +pp.yaw || 0; this.player.pitch = +pp.pitch || 0; }
      this.worldChanged = false;
      this.dayCount = 0;
      ui.showMenu(true);
      if (old) ui.openDialog('#dlg-upgrade');
    });
  },
  async backToAdventure() {
    if (this.kind === 'creative' && this.worldChanged) this.save(true);
    const saved = store.get('prairie.adv', null);
    await this.startAdventure(saved && saved.gen === ADV_GEN ? saved : null);
  },

  setWorld(w, respawn) {
    this.world = w;
    this.renderer.setWorld(w);
    entities.reset();
    weather.reset(w);
    advPlay.reset();
    if (adv.on) monster.reset();
    this.poiIn = new Set();
    editor.undo = []; editor.hit = null; editor.flattenH = null;
    if (respawn) { this.player.spawnAt(w); this.player.fly = this.mode === 'edit'; }
    this.player.mods = { speed: 1, jump: 1, grav: 1, scale: 1 };
    this.worldChanged = true;
    ui.refreshEditor();
  },
  newWorld(opts) {
    this.setWorld(generateWorld(opts), true);
    this.dayCount = 0;
    this.save(true);
  },

  enter(mode) {
    sound.init();
    if (this.kind === 'adventure') mode = 'play';
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
    if (!seen[key]) {
      seen[key] = true;
      setTimeout(() => ui.toast(this.kind === 'adventure'
        ? 'E : utiliser · 1-5 : outils · Tab : inventaire · F : lampe · H : aide'
        : mode === 'play' ? 'E : éditeur · F : lampe torche · T : accélérer le temps · H : aide' : 'Tab : viser ⇄ curseur · 1-7 : outils · V : vol · E : jouer'), 400);
    }
  },
  pause() {
    if (this.mode === 'menu') return;
    ui.advClose();
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
    try {
      const p = c.requestPointerLock();
      if (p && p.catch) p.catch(() => this.onLockError());
    } catch (e) { this.onLockError(); }
  },
  unlock() { if (document.pointerLockElement) document.exitPointerLock(); },
  onLockError() {
    this.lockErrors++;
    ui.toast(this.lockErrors > 2 ? 'Souris non capturable : maintenez un clic et glissez pour regarder' : "Cliquez dans l'écran pour capturer la souris");
  },
  applySettings() { sound.setVolume(settings.volume); sound.setAmbient(settings.ambVolume); },

  save(silent) {
    if (!this.world) return;
    if (this.kind === 'adventure') { adv.save(); return; }
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
      if (input.locked) this.lockErrors = 0;
      if (!input.locked && this.mode === 'play' && !ui.panel) this.pause();
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
      const k = e.key.toLowerCase(), A = this.kind === 'adventure';
      if (e.key === 'Escape') {
        if (ui.panel) { ui.advClose(); return; }
        if ($('.dialog.open')) { ui.closeDialogs(); return; }
        if (this.mode === 'menu') { if (this.started) this.enter(this.prevMode || 'play'); }
        else this.pause();
        return;
      }
      if (this.mode === 'menu') return;
      if (A) {
        if (e.code === 'Tab') { if (ui.panel === '#invp') ui.advClose(); else ui.openInventory(); return; }
        if (ui.panel) { if (k === 'e' && ui.panel === '#notep') ui.advClose(); return; }
        if (k === 'e') { this.interact(); return; }
        if (/^Digit[1-5]$/.test(e.code)) { advPlay.selectTool(ADV_TOOLS[+e.code.slice(5) - 1].id); return; }
      }
      if ((e.ctrlKey || e.metaKey) && k === 'z') { e.preventDefault(); if (this.mode === 'edit') editor.doUndo(this.world); return; }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.code === 'Tab' && this.mode === 'edit') { if (input.locked) this.unlock(); else this.lock(); return; }
      if (k === 'e' && !A) { this.enter(this.mode === 'edit' ? 'play' : 'edit'); if (this.mode === 'edit' && !input.locked) this.lock(); return; }
      if (k === 'f') { this.flashlight = !this.flashlight; sound.click(); return; }
      if (k === 'v' && !A) { this.player.fly = !this.player.fly; this.player.vel = [0, 0, 0]; ui.toast(this.player.fly ? 'Vol libre activé' : 'Vol libre désactivé'); return; }
      if (k === 't' && !A) { this.fastTime = true; return; }
      if (k === 'm') {
        if (settings.volume > 0) { this.prevVolume = settings.volume; settings.volume = 0; } else settings.volume = this.prevVolume || DEFAULT_SETTINGS.volume;
        store.set('prairie.settings', settings); this.applySettings();
        const el = $('#o-volume'); if (el) { el.value = settings.volume; $('#o-volume-v').textContent = Math.round(settings.volume * 100) + ' %'; }
        ui.toast(settings.volume ? 'Son activé' : 'Son coupé'); return;
      }
      if (k === 'h') { $('#hud-help').classList.toggle('open'); return; }
      if (k === 'r') {
        if (this.mode === 'play' && (!A || adv.s.tool === 'revolver')) this.weapon.reload();
        else if (editor.tool === 'block') editor.rotate(e.shiftKey ? 90 * DEG : 15 * DEG);
        return;
      }
      if (this.mode === 'edit' && /^Digit[1-7]$/.test(e.code)) ui.setTool(TOOLS[+e.code.slice(5) - 1].id);
    });
    window.addEventListener('keyup', (e) => {
      input.keys.delete(e.code);
      if (e.key.toLowerCase() === 't') this.fastTime = false;
    });
    window.addEventListener('blur', () => { input.keys.clear(); input.buttons = 0; this.fastTime = false; editor.end(this.world); });

    c.addEventListener('contextmenu', (e) => e.preventDefault());
    c.addEventListener('mousedown', (e) => {
      e.preventDefault();
      sound.init();
      if (this.mode === 'menu') return;
      const bit = e.button === 0 ? 1 : e.button === 2 ? 2 : e.button === 1 ? 4 : 0;
      input.buttons |= bit; input.clicked |= bit;
      if (this.mode === 'play' && !input.locked) { this.lock(); return; }
      if (this.kind === 'adventure' && bit === 2) { advPlay.secondary(); return; }
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
      if (input.locked) { input.dx += e.movementX; input.dy += e.movementY; return; }
      if (this.mmb) {
        if (Math.abs(e.clientX - this.mmb.x) + Math.abs(e.clientY - this.mmb.y) > 4) this.mmb.moved = true;
        if (this.mmb.moved) { input.dx += e.movementX; input.dy += e.movementY; }
        return;
      }
      if (this.mode === 'play' && input.buttons && e.target === c) { input.dx += e.movementX; input.dy += e.movementY; }
    });
    c.addEventListener('wheel', (e) => {
      e.preventDefault();
      const d = Math.sign(e.deltaY);
      if (this.kind === 'adventure' && this.mode === 'play') {
        const i = ADV_TOOLS.findIndex((t) => t.id === adv.s.tool);
        adv.s.tool = ADV_TOOLS[(i + d + ADV_TOOLS.length) % ADV_TOOLS.length].id;
        sound.click();
        return;
      }
      if (this.mode !== 'edit') return;
      if (editor.tool === 'block') editor.rotate(-d * 15 * DEG);
      else if (e.shiftKey) editor.strength = clamp(Math.round((editor.strength - d * 0.05) * 100) / 100, 0.05, 1);
      else editor.size = clamp(editor.size * (d > 0 ? 1 / 1.15 : 1.15), 1, 40), editor.size = Math.round(editor.size * 2) / 2;
      ui.refreshEditor();
    }, { passive: false });
    window.addEventListener('beforeunload', () => { if (this.kind === 'adventure') adv.save(); else if (this.worldChanged) this.save(true); });
    window.addEventListener('resize', () => ui.refreshEditor());
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

  // ------------------------------------------------------------- aventure : cible de la touche E
  findTarget(eye, f) {
    const w = this.world;
    let best = null, bd = 1e9;
    for (const it of w.inter || []) {
      const dx = it.x - eye[0], dy = it.y - eye[1], dz = it.z - eye[2], d = Math.hypot(dx, dy, dz);
      if (d > 2.7) continue;
      const cos = (dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1);
      if (cos < 0.72) continue;
      const score = d * (2 - cos);
      if (score < bd) { bd = score; best = { kind: 'inter', it }; }
    }
    const oh = w.raycastObjects(eye, f, 2.4, true);
    if (oh && oh.t < bd) {
      const H = HARVEST[OBJ_TYPES[oh.obj.t].id];
      if (H && H.tool === 'hands') best = { kind: 'pick', o: oh.obj };
    }
    return best;
  },
  interact() {
    const t = this.target;
    if (!t) return;
    if (t.kind === 'pick') advPlay.pickByHand(t.o);
    else adv.interact(t.it);
  },

  // ------------------------------------------------------------- lumières dynamiques
  gatherLights(eye, basis) {
    const w = this.world, sky = this.sky, L = [];
    const power = this.kind !== 'adventure' || adv.power;
    for (const l of w.lights) {
      let k = 1.1; // lanternes, cristaux : toujours allumés
      if (l.night) k = sky.nightLit ? 1.3 : 0;
      else if (l.flicker) k = 1.25 + Math.sin(this.time * 13 + l.seed) * 0.12 + Math.sin(this.time * 31 + l.seed * 3) * 0.08;
      else if (l.power) k = power ? 1.25 : 0;
      if (!k) continue;
      const d = Math.hypot(l.x - eye[0], l.y - eye[1], l.z - eye[2]);
      if (d > sky.fog[1] + l.r) continue;
      L.push({ x: l.x, y: l.y, z: l.z, r: l.r, c: v3.scale(l.c, k), d });
    }
    if (this.kind === 'adventure') for (const l of advPlay.lights(eye)) L.push(l);
    L.sort((a, b) => a.d - b.d);
    if (L.length > MAX_LIGHTS - 1) L.length = MAX_LIGHTS - 1;
    if (this.weapon.flashT > 0) L.unshift({ x: eye[0] + basis.f[0], y: eye[1] + basis.f[1], z: eye[2] + basis.f[2], r: 20, c: [2.2, 1.5, 0.8], d: 0 });
    const n = Math.min(MAX_LIGHTS, L.length);
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

  // ------------------------------------------------------------- boucle
  loop(now) {
    requestAnimationFrame((t) => this.loop(t));
    let dt = (now - this.last) / 1000;
    this.last = now;
    if (!(dt > 0)) dt = 0.016;
    dt = Math.min(dt, 0.05);
    this.time += dt;
    const w = this.world, p = this.player, A = this.kind === 'adventure' && adv.on;

    // temps qui passe
    let speed = this.mode === 'menu' ? 1 : this.timeScale * (this.fastTime ? 60 : 1);
    if (A && advPlay.has('chronos')) speed *= 30;
    w.time += dt * speed / w.dayLength;
    if (w.time >= 1) { w.time -= 1; this.dayCount++; }
    if (A) this.dayCount = adv.s.day - 1;

    // regard + déplacements (bloqués quand un panneau est ouvert)
    const frozen = !!ui.panel;
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
    };
    if (this.mode !== 'menu') p.update(dt, w, ctl);

    // caméra
    let camPos, yaw, pitch;
    if (this.mode === 'menu' && !this.started) {
      this.attractA += dt * 0.04;
      const cx = A ? w.adv.lab.x : w.spawn.x, cz = A ? w.adv.lab.z : w.spawn.z, r = A ? 70 : 34;
      const x = cx + Math.cos(this.attractA) * r, z = cz + Math.sin(this.attractA) * r;
      const y = Math.max(w.heightAt(x, z), w.waterLevel) + (A ? 16 : 9);
      camPos = [x, y, z];
      const ty = w.heightAt(cx, cz) + 3;
      yaw = Math.atan2(-(cx - x), -(cz - z));
      pitch = Math.atan2(ty - y, Math.hypot(cx - x, cz - z));
    } else {
      camPos = p.eyePos(); yaw = p.yaw; pitch = p.pitch + p.kickPitch;
      if (A && advPlay.shakeT > 0) { const k = advPlay.shakeT * 0.05; camPos = [camPos[0] + (Math.random() - 0.5) * k, camPos[1] + (Math.random() - 0.5) * k, camPos[2] + (Math.random() - 0.5) * k]; pitch += (Math.random() - 0.5) * k; }
    }
    weather.update(dt, w);
    const wc = weather.cur;
    const sky = this.sky = computeSky(w.time, settings.viewDist, { cloud: wc.cloud, rain: wc.rain, storm: wc.storm, flash: weather.flash });
    const basis = cameraBasis(yaw, pitch);
    const eye = p.eyePos();

    // arme et outils
    this.weapon.update(dt);
    const playing = this.mode === 'play' && !frozen;
    if (playing && (!A || adv.s.tool === 'revolver') && input.locked && (input.buttons & 1) && this.weapon.tryFire()) {
      fireHitscan(w, eye, p.yaw, p.pitch + p.kickPitch);
      p.kickPitch += 0.025;
    }
    let prompt = '';
    if (A) {
      if (playing && input.locked && (input.buttons & 1) && adv.s.tool !== 'revolver') advPlay.primary(eye, cameraBasis(p.yaw, p.pitch));
      advPlay.update(dt, eye, cameraBasis(p.yaw, p.pitch));
      adv.update(dt, playing && input.down('KeyE'));
      this.target = playing ? this.findTarget(eye, cameraBasis(p.yaw, p.pitch).f) : null;
      if (this.target) prompt = '<b>E</b> — ' + (this.target.kind === 'pick' ? 'Cueillir / ramasser' : esc(this.target.it.name));
      const slow = advPlay.has('ralenti') ? 0.35 : 1;
      monster.update(dt * slow, { night: sky.night, eye, fwd: basis.f, flashlight: this.flashlight, invisible: advPlay.has('voile'), repulsif: advPlay.has('repulsif') });
      glitch.update(dt, { night: sky.night });
    }

    // éditeur (création)
    if (this.mode === 'edit') { this.editorRay(); editor.apply(w, dt); } else editor.hit = null;

    const lights = this.gatherLights(camPos, basis);

    // créatures
    if (entities.version !== w.objVersion) entities.sync(w);
    const slowE = A && advPlay.has('ralenti') ? 0.35 : 1;
    entities.update(dt * slowE, w, { px: p.pos[0], pz: p.pos[2], night: sky.night, rain: wc.rain, frozen: this.mode === 'edit', t: this.time, right: basis.r });
    if (this.mode === 'play' && !p.fly) entities.pushPlayer(p);

    // titres des lieux traversés
    this.poiT -= dt;
    if (this.poiT <= 0 && this.mode !== 'menu') {
      this.poiT = 0.5;
      for (const poi of w.pois) {
        const inside = Math.hypot(poi.x - p.pos[0], poi.z - p.pos[2]) < poi.r;
        if (inside && !this.poiIn.has(poi)) { this.poiIn.add(poi); if (this.mode === 'play') ui.showTitle(poi.name, 'JOUR ' + (this.dayCount + 1) + ' · ' + clockText(w.time)); }
        else if (!inside && Math.hypot(poi.x - p.pos[0], poi.z - p.pos[2]) > poi.r + 15) this.poiIn.delete(poi);
      }
    }

    // feux de camp : étincelles + fumée ; audio
    let fire = 0, firePan = 0;
    for (const l of w.lights) {
      if (!l.flicker) continue;
      const d = Math.hypot(l.x - camPos[0], l.z - camPos[2]);
      if (d < 45) {
        if (Math.random() < dt * 9) particles.spawn(l.x + (Math.random() - 0.5) * 0.6, l.y - 0.2, l.z + (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6, 1.5 + Math.random() * 1.8, (Math.random() - 0.5) * 0.6, [1, 0.62, 0.22, 1], 0.05, 0.8 + Math.random() * 0.8, -0.4, true);
        if (Math.random() < dt * 4) { particles.spawn(l.x, l.y + 0.3, l.z, (Math.random() - 0.5) * 0.3 + 0.25, 0.9 + Math.random() * 0.4, (Math.random() - 0.5) * 0.3, [0.35, 0.34, 0.33, 0.4], 0.35, 2.5 + Math.random(), -0.05, false); particles.list[particles.list.length - 1].grow = 3; }
      }
      const k = clamp(1 - d / 28, 0, 1);
      if (k > fire) {
        fire = k;
        const ang = Math.atan2(l.x - camPos[0], l.z - camPos[2]);
        firePan = Math.sin(ang - Math.atan2(basis.r[0], basis.r[2]) + Math.PI / 2);
      }
    }
    const pl = v3.add(v3.add(sky.amb, v3.scale(sky.sunCol, 0.8)), v3.scale(sky.moonCol, 0.7)).map((v) => Math.min(v, 1.2));
    particles.update(dt, pl);
    sound.update(dt, { day: sky.day, night: sky.night, fire, firePan, height: camPos[1] - w.waterLevel, inside: w.covered(camPos[0], camPos[1], camPos[2]), rain: wc.rain, storm: wc.storm });

    // arme / outil à l'écran
    let gun = null;
    if (this.mode === 'play') {
      const wp = this.weapon, vm = A ? advPlay.viewModel(p) : null;
      const bobX = Math.cos(p.bobPhase) * 0.035 * p.bobAmp, bobY = -Math.abs(Math.sin(p.bobPhase)) * 0.035 * p.bobAmp + (p.swimming ? -0.15 : 0);
      if (vm && vm.hide) gun = null;
      else if (vm) gun = { spr: vm.spr, frame: vm.frame, ox: bobX + vm.ox, oy: bobY + vm.oy, light: lights.gunLight, tint: vm.tint };
      else gun = { ox: bobX, oy: bobY - wp.kick * 0.035 - wp.lower * 0.3, frame: wp.flashT > 0 ? 1 : 0, light: lights.gunLight };
    }

    // effets d'écran (aventure)
    let fx = [0, 0, 0, 0], tint = [0, 0, 0, 0], gl = null;
    if (A) {
      const e = advPlay.effects;
      fx = [advPlay.has('vision') ? 1 : 0, advPlay.has('chaos') ? 1 : 0, advPlay.has('poison') || advPlay.has('boue') ? 1 : 0, advPlay.has('voile') ? 1 : 0];
      if (advPlay.flashT > 0) tint = [1, 1, 1, Math.min(1, advPlay.flashT)];
      else if (e.brulure > 0) tint = [1, 0.4, 0.1, 0.25];
      else if (e.givre > 0) tint = [0.6, 0.85, 1, 0.22];
      gl = glitch.uniforms();
    }

    this.renderer.resize(settings.pixel);
    const ghost = this.mode === 'edit' && editor.ghost ? { b: editor.ghost, col: [0.35, 1, 0.45, 0.55] } : null;
    const ents = entities.buildInstances(camPos, basis.r, sky.fog[1] + 20);
    if (A) { ents.n = adv.appendPickups(ents.data, ents.n); ents.n = monster.appendInstance(ents.data, ents.n, camPos, basis.r); }
    this.renderer.render({
      cam: { pos: camPos, yaw, pitch, fovX: settings.fov * DEG },
      sky, time: this.time, lights, flash: this.flashlight ? (A && adv.s.upgrades.lampe ? 1.6 : 1) : 0,
      bands: settings.bands ? 14 : 0, levels: settings.dither ? 28 : 0, gamma: 1 / settings.gamma,
      grass: { n: 150, spacing: 0.56, radius: 40 },
      particles, brush: this.mode === 'edit' ? editor.brushUniform() : null, brushCol: editor.brushColor(), ghost, gun,
      underwater: camPos[1] < w.waterLevel && w.heightAt(camPos[0], camPos[2]) < w.waterLevel,
      ents, rain: wc.rain, rainWind: weather.rainWind(),
      rainCol: v3.add(v3.scale([0.62, 0.66, 0.74], Math.min(1, sky.amb[1] * 1.3 + 0.12)), [weather.flash, weather.flash, weather.flash]),
      power: A ? adv.power : 1, fx, tint, glitch: gl && gl.glitch, seed: gl && gl.seed,
    });

    ui.updateHUD(dt);
    ui.updateAdvHUD(prompt);
    if (!A) $('#hud-time').style.left = '';
    if (this.kind === 'creative' && this.worldChanged) {
      this.saveT += dt;
      if (this.saveT > 20 && !editor.stroke) this.save();
    }
    input.consume();
  },
};

window.addEventListener('DOMContentLoaded', () => {
  game.init().catch((e) => {
    console.error(e);
    $('#loading').classList.remove('open');
    const el = $('#fatal');
    el.querySelector('p').textContent = e.message;
    el.classList.add('open');
  });
});
