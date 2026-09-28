// ============================================================================
//  INTERFACE : menus, options, panneau de l'éditeur, HUD, fichiers
// ============================================================================

const DEFAULT_SETTINGS = { sens: 1.0, fov: 90, pixel: 270, dither: true, bands: true, volume: 0.6, ambVolume: 0.5, invertY: false, viewDist: 340, showFps: false, gamma: 1.0 };
const settings = Object.assign({}, DEFAULT_SETTINGS, store.get('prairie.settings', {}));

function thumbFromCanvas(cv, crop) {
  if (!crop) return cv.toDataURL();
  const c = document.createElement('canvas');
  c.width = crop; c.height = crop;
  c.getContext('2d').drawImage(cv, 0, 0, crop, crop, 0, 0, crop, crop);
  return c.toDataURL();
}
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const ui = {
  fpsAcc: 0, fpsN: 0, fps: 0,

  init() {
    // menu principal
    $('#m-play').onclick = () => game.enter('play');
    $('#m-edit').onclick = () => game.enter('edit');
    $('#m-newadv').onclick = () => game.newAdventure();
    $('#m-creative').onclick = () => game.enterCreative();
    $('#m-adventure').onclick = () => game.backToAdventure();
    $('#m-new').onclick = () => this.openDialog('#dlg-new');
    $('#m-import').onclick = () => $('#file-import').click();
    $('#m-export').onclick = () => this.exportWorld();
    $('#m-options').onclick = () => this.openDialog('#dlg-options');
    $('#m-help').onclick = () => this.openDialog('#dlg-help');
    $$('.dlg-close').forEach((b) => (b.onclick = () => this.closeDialogs()));
    $('#file-import').onchange = (e) => this.importFile(e.target.files[0]);

    // nouveau monde
    $('#nw-seed-rand').onclick = () => { $('#nw-seed').value = String((Math.random() * 1e6) | 0); };
    $('#nw-create').onclick = () => {
      const seedTxt = $('#nw-seed').value.trim();
      const seed = /^\d+$/.test(seedTxt) ? parseInt(seedTxt, 10) : hashString(seedTxt || String(Date.now()));
      const opts = {
        name: $('#nw-name').value.trim() || 'Prairie', seed, size: parseInt($('#nw-size').value, 10),
        trees: +$('#nw-trees').value, flowers: +$('#nw-flowers').value, ponds: +$('#nw-ponds').value,
        villages: +$('#nw-villages').value, animals: +$('#nw-animals').value,
        town: $('#nw-town').checked, mine: $('#nw-mine').checked,
        ruins: $('#nw-ruins').checked, camp: $('#nw-camp').checked,
      };
      const mode = $('#nw-mode').value;
      this.closeDialogs();
      this.loading('Génération du monde…', () => { game.newWorld(opts); game.enter(mode); });
    };
    ['trees', 'flowers', 'ponds', 'villages', 'animals'].forEach((k) => {
      const inp = $('#nw-' + k), out = $('#nw-' + k + '-v');
      const upd = () => { out.textContent = k === 'ponds' || k === 'villages' ? inp.value : Math.round(inp.value * 100) + ' %'; };
      inp.oninput = upd; upd();
    });
    // mise à jour d'une ancienne sauvegarde
    $('#up-export').onclick = () => this.exportWorld();
    $('#up-keep').onclick = () => { game.world.genVersion = GEN_VERSION; addWildlife(game.world); game.setWorld(game.world, false); game.save(true); this.closeDialogs(); this.showMenu(true); };
    $('#up-new').onclick = () => { this.closeDialogs(); this.loading('Génération du nouveau monde…', () => { game.newWorld({ seed: 20260927, size: 512, name: 'Grande Prairie' }); this.showMenu(true); }); };

    // options
    const bindOpt = (id, key, fmt, parse) => {
      const el = $(id), out = $(id + '-v');
      const isCheck = el.type === 'checkbox';
      if (isCheck) el.checked = !!settings[key]; else el.value = settings[key];
      const upd = () => {
        settings[key] = isCheck ? el.checked : (parse ? parse(el.value) : +el.value);
        if (out) out.textContent = fmt ? fmt(settings[key]) : settings[key];
        store.set('prairie.settings', settings);
        game.applySettings();
      };
      el.oninput = upd; el.onchange = upd;
      if (out) out.textContent = fmt ? fmt(settings[key]) : settings[key];
    };
    bindOpt('#o-sens', 'sens', (v) => v.toFixed(2));
    bindOpt('#o-fov', 'fov', (v) => v + '°');
    bindOpt('#o-pixel', 'pixel', null, (v) => parseInt(v, 10));
    bindOpt('#o-view', 'viewDist', null, (v) => parseInt(v, 10));
    bindOpt('#o-gamma', 'gamma', (v) => v.toFixed(2));
    bindOpt('#o-volume', 'volume', (v) => Math.round(v * 100) + ' %');
    bindOpt('#o-amb', 'ambVolume', (v) => Math.round(v * 100) + ' %');
    bindOpt('#o-dither', 'dither');
    bindOpt('#o-bands', 'bands');
    bindOpt('#o-invert', 'invertY');
    bindOpt('#o-fps', 'showFps');
    $('#o-reset').onclick = () => {
      Object.assign(settings, DEFAULT_SETTINGS);
      store.set('prairie.settings', settings);
      location.reload();
    };

    this.buildEditor();
    this.buildHotbar();
  },

  // ------------------------------------------------------------- écrans
  openDialog(id) {
    this.closeDialogs();
    $(id).classList.add('open');
    sound.click();
  },
  closeDialogs() { $$('.dialog').forEach((d) => d.classList.remove('open')); },
  showMenu(show) {
    $('#menu').classList.toggle('open', show);
    $('#menu').dataset.kind = game.kind;
    if (!show) this.closeDialogs();
    const A = game.kind === 'adventure';
    $('#m-play').textContent = game.started ? 'Reprendre' : A ? (adv.s && (adv.s.day > 1 || adv.s.player) ? 'Continuer l’aventure' : 'Commencer l’aventure') : 'Jouer (création)';
    $('#menu .sub').textContent = A ? 'Station de recherche Prairie-7' + (adv.s ? ' · Jour ' + adv.s.day : '') : 'Mode création — un monde à bâtir';
    const w = game.world;
    if (w) $('#m-world').innerHTML = A
      ? `<b>La Vallée</b> · ${Math.round(w.size)} × ${Math.round(w.size)} m · aucune carte · graine ${adv.s ? adv.s.seed : ''}`
      : `<b>${esc(w.name)}</b> · ${Math.round(w.size)} × ${Math.round(w.size)} m · ${w.objects.length} objets · ${w.blocks.length} blocs`;
  },
  loading(text, fn) {
    $('#loading-text').textContent = text;
    $('#loading').classList.add('open');
    setTimeout(() => {
      try { fn(); } catch (e) { console.error(e); this.toast('Erreur : ' + e.message, 'err'); }
      $('#loading').classList.remove('open');
    }, 60);
  },
  toast(msg, kind) {
    const last = $('#toasts').lastElementChild;
    let t = last && last.textContent === msg && !last.classList.contains('out') ? last : null;
    if (t) { clearTimeout(t._a); clearTimeout(t._b); }
    else {
      t = document.createElement('div');
      t.className = 'toast' + (kind ? ' ' + kind : '');
      t.textContent = msg;
      $('#toasts').appendChild(t);
    }
    t._a = setTimeout(() => t.classList.add('out'), 2200);
    t._b = setTimeout(() => t.remove(), 2700);
  },

  // ------------------------------------------------------------- fichiers
  exportWorld() {
    try {
      const json = JSON.stringify(worldToJSON(game.world));
      const blob = new Blob([json], { type: 'application/json' });
      const a = document.createElement('a');
      const slug = game.world.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'monde';
      a.href = URL.createObjectURL(blob);
      a.download = slug + '.prairie.json';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      this.toast('Monde exporté : ' + a.download + ' (' + Math.round(json.length / 1024) + ' Ko)');
    } catch (e) { this.toast("Échec de l'export : " + e.message, 'err'); }
  },
  importFile(file) {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      this.loading('Chargement du monde…', () => {
        try {
          const w = worldFromJSON(JSON.parse(r.result));
          game.setWorld(w, true);
          this.toast('Monde « ' + w.name + ' » importé');
          this.showMenu(true);
        } catch (e) { this.toast('Import impossible : ' + e.message, 'err'); }
      });
      $('#file-import').value = '';
    };
    r.readAsText(file);
  },

  // ------------------------------------------------------------- éditeur
  buildEditor() {
    const p = $('#editor-panel');
    const tools = TOOLS.map((t, i) => `<button class="tool" data-tool="${t.id}" title="${esc(t.hint)}"><span class="ic">${t.icon}</span><span>${t.name}</span><kbd>${i + 1}</kbd></button>`).join('');
    const mats = TERRAIN_MATS.map((i) => `<button class="sw" data-mat="${i}" title="${esc(MATERIALS[i].name)}"><img src="${thumbFromCanvas(MATERIALS[i].canvas, 40)}" alt=""><span>${esc(MATERIALS[i].name)}</span></button>`).join('');
    const cats = {};
    OBJ_TYPES.forEach((t, i) => { if (!t.hidden) (cats[t.cat] = cats[t.cat] || []).push(i); });
    const objs = Object.keys(cats).map((c) => `<div class="cat">${esc(c)}</div><div class="grid objs">` + cats[c].map((i) => {
      const s = ATLAS.sprites[OBJ_TYPES[i].spr[0]];
      return `<button class="ob" data-obj="${i}" title="${esc(OBJ_TYPES[i].name)}"><img src="${s.canvas.toDataURL()}" alt=""><span>${esc(OBJ_TYPES[i].name)}</span></button>`;
    }).join('') + '</div>').join('');
    const bmats = BLOCK_MATS.map((i) => `<button class="sw" data-bmat="${i}" title="${esc(MATERIALS[i].name)}"><img src="${thumbFromCanvas(MATERIALS[i].canvas, 40)}" alt=""><span>${esc(MATERIALS[i].name)}</span></button>`).join('');
    const presets = BLOCK_PRESETS.map((b, i) => `<button class="chip" data-preset="${i}">${esc(b.name)}</button>`).join('');
    const shapes = SHAPES.map((s, i) => `<button class="chip" data-shape="${i}">${esc(s)}</button>`).join('');
    const weathers = Object.keys(WEATHER_NAMES).map((k) => `<option value="${k}">${esc(WEATHER_NAMES[k])}</option>`).join('');
    p.innerHTML = `
      <div class="ph"><span>ÉDITEUR</span><button class="mini" id="ed-hide" title="Tab">Viser ⌖</button></div>
      <section><h3>Outils</h3><div class="tools">${tools}</div><p class="hint" id="ed-hint"></p></section>
      <section id="sec-brush"><h3>Pinceau</h3>
        <label>Taille <output id="ed-size-v"></output><input type="range" id="ed-size" min="1" max="40" step="0.5"></label>
        <label>Force <output id="ed-str-v"></output><input type="range" id="ed-str" min="0.05" max="1" step="0.05"></label>
      </section>
      <section id="sec-paint"><h3>Matériau du sol</h3><div class="grid mats">${mats}</div></section>
      <section id="sec-objs"><h3>Objets</h3>
        <label class="row"><input type="checkbox" id="ed-scatter"> Semer en maintenant le clic</label>
        <label id="ed-density-l">Densité <output id="ed-density-v"></output><input type="range" id="ed-density" min="0.1" max="1" step="0.05"></label>
        <label class="row" id="ed-filter-l"><input type="checkbox" id="ed-filter"> Gomme : seulement le type choisi</label>
        ${objs}
      </section>
      <section id="sec-block"><h3>Blocs</h3>
        <div class="chips">${presets}</div>
        <div class="cat">Forme</div>
        <div class="chips">${shapes}</div>
        <label>Largeur <output id="ed-bx-v"></output><input type="range" id="ed-bx" min="0.25" max="12" step="0.25"></label>
        <label>Hauteur <output id="ed-by-v"></output><input type="range" id="ed-by" min="0.25" max="12" step="0.25"></label>
        <label>Profondeur <output id="ed-bz-v"></output><input type="range" id="ed-bz" min="0.25" max="12" step="0.25"></label>
        <div class="row2"><span>Rotation : <b id="ed-rot">0°</b></span><button class="mini" id="ed-rotl">⟲ 15°</button><button class="mini" id="ed-rotr">⟳ 15°</button></div>
        <label class="row"><input type="checkbox" id="ed-snap"> Aligner sur la grille (0,5 m)</label>
        <div class="grid mats">${bmats}</div>
      </section>
      <section><h3>Monde</h3>
        <label>Nom <input type="text" id="ed-name" maxlength="40"></label>
        <label>Heure <output id="ed-time-v"></output><input type="range" id="ed-time" min="0" max="1" step="0.001"></label>
        <label>Écoulement du temps <select id="ed-speed"><option value="0">Figé</option><option value="1">Normal</option><option value="10">× 10</option><option value="60">× 60</option></select></label>
        <label>Météo <select id="ed-weather">${weathers}</select></label>
        <label>Durée d'une journée <select id="ed-daylen"><option value="120">2 min</option><option value="300">5 min</option><option value="600">10 min</option><option value="1200">20 min</option><option value="2400">40 min</option></select></label>
        <label>Niveau de l'eau <output id="ed-water-v"></output><input type="range" id="ed-water" min="-40" max="60" step="0.1"></label>
        <button class="wide" id="ed-spawn">📍 Point de départ ici</button>
      </section>
      <section><h3>Fichier</h3>
        <div class="btns">
          <button id="ed-undo">↶ Annuler</button>
          <button id="ed-export">⬇ Exporter</button>
          <button id="ed-import">⬆ Importer</button>
          <button id="ed-play">▶ Jouer</button>
          <button id="ed-menu">☰ Menu</button>
        </div>
        <p class="hint" id="ed-stats"></p>
      </section>`;
    p.addEventListener('mousedown', (e) => e.stopPropagation());
    p.addEventListener('wheel', (e) => e.stopPropagation());
    $$('#editor-panel [data-tool]').forEach((b) => (b.onclick = () => this.setTool(b.dataset.tool)));
    $$('#editor-panel [data-mat]').forEach((b) => (b.onclick = () => { editor.paintMat = +b.dataset.mat; this.setTool('paint'); }));
    $$('#editor-panel [data-obj]').forEach((b) => (b.onclick = () => { editor.objType = +b.dataset.obj; if (editor.tool !== 'erase') this.setTool('place'); else this.refreshEditor(); }));
    $$('#editor-panel [data-bmat]').forEach((b) => (b.onclick = () => { editor.block.m = +b.dataset.bmat; this.setTool('block'); }));
    $$('#editor-panel [data-preset]').forEach((b) => (b.onclick = () => {
      const pr = BLOCK_PRESETS[+b.dataset.preset];
      Object.assign(editor.block, { sx: pr.s[0], sy: pr.s[1], sz: pr.s[2], m: pr.m, sh: pr.sh || 0 });
      this.setTool('block');
    }));
    $$('#editor-panel [data-shape]').forEach((b) => (b.onclick = () => { editor.block.sh = +b.dataset.shape; this.setTool('block'); }));
    $('#ed-weather').onchange = (e) => { game.world.weather = e.target.value; game.worldChanged = true; this.toast('Météo : ' + WEATHER_NAMES[e.target.value]); };
    const slider = (id, get, set, fmt) => {
      const el = $(id);
      el.oninput = () => { set(+el.value); this.refreshEditor(); };
      el._get = get; el._fmt = fmt;
    };
    slider('#ed-size', () => editor.size, (v) => (editor.size = v), (v) => v + ' m');
    slider('#ed-str', () => editor.strength, (v) => (editor.strength = v), (v) => Math.round(v * 100) + ' %');
    slider('#ed-density', () => editor.density, (v) => (editor.density = v), (v) => Math.round(v * 100) + ' %');
    slider('#ed-bx', () => editor.block.sx, (v) => (editor.block.sx = v), (v) => v + ' m');
    slider('#ed-by', () => editor.block.sy, (v) => (editor.block.sy = v), (v) => v + ' m');
    slider('#ed-bz', () => editor.block.sz, (v) => (editor.block.sz = v), (v) => v + ' m');
    slider('#ed-time', () => game.world.time, (v) => { game.world.time = v; }, (v) => clockText(v));
    slider('#ed-water', () => game.world.waterLevel, (v) => { game.world.waterLevel = v; game.worldChanged = true; }, (v) => v.toFixed(1) + ' m');
    $('#ed-scatter').onchange = (e) => { editor.scatter = e.target.checked; this.refreshEditor(); };
    $('#ed-filter').onchange = (e) => { editor.eraseFilter = e.target.checked; };
    $('#ed-snap').onchange = (e) => { editor.snap = e.target.checked; };
    $('#ed-rotl').onclick = () => editor.rotate(-15 * DEG);
    $('#ed-rotr').onclick = () => editor.rotate(15 * DEG);
    $('#ed-name').oninput = (e) => { game.world.name = e.target.value || 'Sans nom'; game.worldChanged = true; };
    $('#ed-speed').onchange = (e) => { game.timeScale = +e.target.value; };
    $('#ed-daylen').onchange = (e) => { game.world.dayLength = +e.target.value; game.worldChanged = true; };
    $('#ed-spawn').onclick = () => {
      const p = game.player;
      game.world.spawn = { x: p.pos[0], y: p.pos[1], z: p.pos[2], yaw: p.yaw };
      game.worldChanged = true;
      this.toast('Point de départ enregistré');
    };
    $('#ed-undo').onclick = () => editor.doUndo(game.world);
    $('#ed-export').onclick = () => this.exportWorld();
    $('#ed-import').onclick = () => $('#file-import').click();
    $('#ed-play').onclick = () => game.enter('play');
    $('#ed-menu').onclick = () => game.pause();
    $('#ed-hide').onclick = () => game.lock();
  },

  buildHotbar() {
    $('#hotbar').innerHTML = TOOLS.map((t, i) => `<div class="slot" data-tool="${t.id}"><kbd>${i + 1}</kbd><span class="ic">${t.icon}</span><span class="nm">${t.name}</span></div>`).join('');
  },

  setTool(id) {
    editor.tool = id;
    editor.stroke = 0;
    sound.click();
    this.refreshEditor();
  },

  refreshEditor() {
    const t = editor.tool, T = TOOLS.find((x) => x.id === t);
    $$('#editor-panel [data-tool], #hotbar [data-tool]').forEach((b) => b.classList.toggle('on', b.dataset.tool === t));
    $$('#editor-panel [data-mat]').forEach((b) => b.classList.toggle('on', +b.dataset.mat === editor.paintMat));
    $$('#editor-panel [data-obj]').forEach((b) => b.classList.toggle('on', +b.dataset.obj === editor.objType));
    $$('#editor-panel [data-bmat]').forEach((b) => b.classList.toggle('on', +b.dataset.bmat === editor.block.m));
    $$('#editor-panel [data-shape]').forEach((b) => b.classList.toggle('on', +b.dataset.shape === (editor.block.sh | 0)));
    $('#ed-hint').textContent = T ? T.hint : '';
    $('#sec-brush').style.display = t === 'block' || (t === 'place' && !editor.scatter) ? 'none' : '';
    $('#sec-paint').style.display = t === 'paint' ? '' : 'none';
    $('#sec-objs').style.display = t === 'place' || t === 'erase' ? '' : 'none';
    $('#ed-density-l').style.display = t === 'place' && editor.scatter ? '' : 'none';
    $('#ed-filter-l').style.display = t === 'erase' ? '' : 'none';
    $('#sec-block').style.display = t === 'block' ? '' : 'none';
    $$('#editor-panel input[type=range]').forEach((el) => {
      if (!el._get) return;
      const v = el._get();
      if (document.activeElement !== el) el.value = v;
      const out = $('#' + el.id + '-v');
      if (out) out.textContent = el._fmt(v);
    });
    $('#ed-scatter').checked = editor.scatter;
    $('#ed-filter').checked = editor.eraseFilter;
    $('#ed-snap').checked = editor.snap;
    $('#ed-rot').textContent = Math.round(editor.block.r / DEG) + '°';
    if (game.world) {
      if (document.activeElement !== $('#ed-name')) $('#ed-name').value = game.world.name;
      $('#ed-speed').value = String(game.timeScale);
      $('#ed-daylen').value = String(game.world.dayLength);
      $('#ed-weather').value = game.world.weather || 'auto';
      $('#ed-stats').textContent = `${game.world.objects.length} objets · ${game.world.blocks.length} blocs · ${editor.undo.length} annulation(s)`;
    }
  },

  editorLabel() {
    const t = editor.tool;
    let extra = '';
    if (t === 'paint') extra = MATERIALS[editor.paintMat].name;
    else if (t === 'place' || t === 'erase') extra = OBJ_TYPES[editor.objType].name;
    else if (t === 'block') extra = `${MATERIALS[editor.block.m].name} ${editor.block.sx}×${editor.block.sy}×${editor.block.sz} m`;
    else if (t === 'flatten' && editor.flattenH != null) extra = 'à ' + editor.flattenH.toFixed(1) + ' m';
    const brush = t === 'block' || (t === 'place' && !editor.scatter) ? '' : ` · Ø ${editor.size} m`;
    return `${TOOLS.find((x) => x.id === t).name}${extra ? ' — ' + extra : ''}${brush}`;
  },

  // Titre du lieu (façon titres de chapitre de Half-Life 2)
  showTitle(t1, t2) {
    const el = $('#hud-title');
    el.querySelector('.t1').textContent = t1.toUpperCase();
    el.querySelector('.t2').textContent = t2 || '';
    el.classList.add('show');
    clearTimeout(this.titleT);
    this.titleT = setTimeout(() => el.classList.remove('show'), 3800);
  },

  // ------------------------------------------------------------- HUD
  updateHUD() {
    const w = game.world, mode = game.mode, now = performance.now();
    this.fpsN++;
    if (!this.fpsT0) this.fpsT0 = now;
    if (now - this.fpsT0 > 500) { this.fps = Math.round(this.fpsN * 1000 / (now - this.fpsT0)); this.fpsT0 = now; this.fpsN = 0; }
    const hudOn = mode !== 'menu';
    $('#hud').classList.toggle('on', hudOn);
    if (!hudOn) return;
    const night = game.sky.night > 0.5, ws = weather.state4;
    const icon = ws === 'clear' ? (night ? '☾' : '☀') : WEATHER_ICONS[ws];
    $('#hud-clock').textContent = clockText(w.time);
    $('#hud-day').textContent = icon + ' Jour ' + (game.dayCount + 1) + (game.fastTime ? ' · ⏩ ×60' : game.timeScale === 0 ? ' · figé' : game.timeScale !== 1 ? ' · ×' + game.timeScale : '');
    $('#hud-ammo').style.display = mode === 'play' ? '' : 'none';
    $('#hud-mag').textContent = game.weapon.reloadT > 0 ? '…' : game.weapon.ammo;
    $('#hud-mag').classList.toggle('low', game.weapon.ammo <= 3);
    $('#hud-flash').classList.toggle('on', game.flashlight);
    $('#hud-fps').textContent = settings.showFps ? this.fps + ' i/s · ' + game.renderer.res[0] + '×' + game.renderer.res[1] : '';
    const ed = mode === 'edit', panel = ed && !input.locked;
    $('#hotbar').classList.toggle('on', ed && !panel);
    $('#editor-panel').classList.toggle('open', panel);
    $('#hud-time').style.display = panel ? 'none' : '';
    $('#hud-flash').style.display = panel ? 'none' : '';
    let badge = ed ? 'ÉDITEUR' + (game.player.fly ? ' · VOL' : ' · À PIED') : '';
    if (!ed && game.player.fly) badge = 'VOL LIBRE';
    $('#hud-mode').textContent = badge;
    $('#hud-mode').style.display = badge ? '' : 'none';
    $('#hud-hint').textContent = ed ? this.editorLabel() : '';
    $('#crosshair').style.display = !ed || input.locked ? '' : 'none';
    $('#gl').style.cursor = ed && !input.locked ? 'crosshair' : 'default';
  },
};

function clockText(t) {
  const m = Math.floor(((t % 1) + 1) % 1 * 1440);
  return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
}
