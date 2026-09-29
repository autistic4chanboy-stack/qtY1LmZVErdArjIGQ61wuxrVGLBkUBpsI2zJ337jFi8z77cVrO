// ============================================================================
//  ICÔNES 3D (rendu des modèles en boîtes en petites images) et BARRE D'OUTILS
//  personnalisable (1 à 9, molette) : discrète, elle s'efface d'elle-même
// ============================================================================

// ---------------------------------------------------------------- icônes 3D
const ICON3D = {
  cache: {}, cvCache: {}, tiles: null, S: 32,
  // couleur moyenne d'une tuile du « skin » (0..255)
  tileAvg(idx) {
    if (!this.tiles) {
      this.tiles = [];
      const cv = SKIN.canvas;
      if (!cv) return [180, 180, 180];
      const d = SKIN.pb && SKIN.pb.w === cv.width ? SKIN.pb.d : cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
      for (let t = 0; t < 256; t++) {
        const ox = (t % 16) * 16, oy = Math.floor(t / 16) * 16;
        let r = 0, g = 0, b = 0, n = 0;
        for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const k = ((oy + y) * cv.width + ox + x) * 4; if (d[k + 3] < 10) continue; r += d[k]; g += d[k + 1]; b += d[k + 2]; n++; }
        this.tiles[t] = n ? [r / n, g / n, b / n] : [200, 200, 200];
      }
    }
    return this.tiles[idx] || [200, 200, 200];
  },
  faceColor(col, code, front) {
    let base, emit = false;
    if (code < 0) { const c = -code - 1, m = c & 127; emit = !!((c >> 7) & FX_EMIT); base = (MATERIALS[m] && MATERIALS[m].avg) || [150, 150, 150]; }
    else { const side = code & 255, fr = (code >> 8) & 255; emit = !!((code >> 16) & FX_EMIT); base = this.tileAvg(front && fr ? fr : side); }
    return { c: [col[0] * base[0], col[1] * base[1], col[2] * base[2]], emit };
  },
  // capture des boîtes émises par un modèle
  capture(fn) {
    const boxes = [];
    const cap = {
      box(W, ox, oy, oz, sx, sy, sz, col, code) {
        const M = new Float32Array(12);
        for (let r = 0; r < 3; r++) {
          const a0 = W[r * 4], a1 = W[r * 4 + 1], a2 = W[r * 4 + 2];
          M[r * 4] = a0 * sx; M[r * 4 + 1] = a1 * sy; M[r * 4 + 2] = a2 * sz;
          M[r * 4 + 3] = a0 * ox + a1 * oy + a2 * oz + W[r * 4 + 3];
        }
        boxes.push({ M, col: col.slice ? col.slice() : [1, 1, 1], code });
      },
    };
    fn(cap);
    return boxes;
  },
  // rendu isométrique : faces triées de l'arrière vers l'avant, remplissage par lignes, contour sombre
  render(boxes, S) {
    S = S || this.S;
    const a = 0.72, b = 0.52;
    const cam = [Math.sin(a) * Math.cos(b), Math.sin(b), Math.cos(a) * Math.cos(b)];
    const R = [Math.cos(a), 0, -Math.sin(a)], U = [-Math.sin(a) * Math.sin(b), Math.cos(b), -Math.cos(a) * Math.sin(b)];
    const Ld = v3.norm([0.45, 0.85, 0.35]);
    const faces = [];
    let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    const FACES = [[0, 1], [0, -1], [1, 1], [1, -1], [2, 1], [2, -1]];
    for (const bx of boxes) {
      const M = bx.M;
      const col = (i) => [M[i], M[4 + i], M[8 + i]];
      const T = [M[3], M[7], M[11]], A = [col(0), col(1), col(2)];
      const corner = (u, v, w) => [T[0] + A[0][0] * u + A[1][0] * v + A[2][0] * w, T[1] + A[0][1] * u + A[1][1] * v + A[2][1] * w, T[2] + A[0][2] * u + A[1][2] * v + A[2][2] * w];
      for (const [ax, sg] of FACES) {
        const n = v3.norm(v3.scale(A[ax], sg));
        if (!isFinite(n[0])) continue;
        if (n[0] * cam[0] + n[1] * cam[1] + n[2] * cam[2] <= 0.02) continue;
        const o1 = (ax + 1) % 3, o2 = (ax + 2) % 3;
        const pts = [];
        for (const [p, q] of [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]]) {
          const u = [0, 0, 0]; u[ax] = sg * 0.5; u[o1] = p; u[o2] = q;
          pts.push(corner(u[0], u[1], u[2]));
        }
        const cx = (pts[0][0] + pts[2][0]) / 2, cy = (pts[0][1] + pts[2][1]) / 2, cz = (pts[0][2] + pts[2][2]) / 2;
        const depth = cx * cam[0] + cy * cam[1] + cz * cam[2];
        const scr = pts.map((P) => [P[0] * R[0] + P[1] * R[1] + P[2] * R[2], P[0] * U[0] + P[1] * U[1] + P[2] * U[2]]);
        for (const [x, y] of scr) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
        const fc = this.faceColor(bx.col, bx.code, ax === 2 && sg > 0);
        const sh = fc.emit ? 1.25 : 0.52 + 0.55 * Math.max(0, n[0] * Ld[0] + n[1] * Ld[1] + n[2] * Ld[2]);
        faces.push({ scr, depth, rgb: fc.c.map((v) => clamp(Math.round(v * sh), 0, 255)) });
      }
    }
    if (!faces.length) return null;
    faces.sort((p, q) => p.depth - q.depth);
    const span = Math.max(maxX - minX, maxY - minY) || 1, k = (S - 4) / span;
    const offX = (S - (maxX - minX) * k) / 2, offY = (S - (maxY - minY) * k) / 2;
    const px = new Uint8ClampedArray(S * S * 4);
    for (const f of faces) {
      const P = f.scr.map(([x, y]) => [offX + (x - minX) * k, S - (offY + (y - minY) * k)]);
      let y0 = Math.max(0, Math.floor(Math.min(...P.map((p) => p[1])))), y1 = Math.min(S - 1, Math.ceil(Math.max(...P.map((p) => p[1]))));
      for (let y = y0; y <= y1; y++) {
        const yc = y + 0.5, xs = [];
        for (let i = 0; i < 4; i++) {
          const [ax2, ay] = P[i], [bx2, by] = P[(i + 1) % 4];
          if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax2 + (yc - ay) / (by - ay) * (bx2 - ax2));
        }
        if (xs.length < 2) continue;
        xs.sort((p, q) => p - q);
        const xa = Math.max(0, Math.round(xs[0])), xb = Math.min(S - 1, Math.round(xs[xs.length - 1]) - 1);
        for (let x = xa; x <= xb; x++) { const o = (y * S + x) * 4; px[o] = f.rgb[0]; px[o + 1] = f.rgb[1]; px[o + 2] = f.rgb[2]; px[o + 3] = 255; }
      }
    }
    // contour
    const out = new Uint8ClampedArray(px);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const o = (y * S + x) * 4;
      if (px[o + 3]) continue;
      let edge = false;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < S && Y < S && px[(Y * S + X) * 4 + 3]) edge = true; }
      if (edge) { out[o] = 34; out[o + 1] = 26; out[o + 2] = 18; out[o + 3] = 230; }
    }
    const cv = document.createElement('canvas'); cv.width = S; cv.height = S;
    cv.getContext('2d').putImageData(new ImageData(out, S, S), 0, 0);
    return cv;
  },
  // modèle 3D d'un objet d'inventaire (objets à poser, bêtes) ou null
  boxesFor(id) {
    const it = ITEMS[id];
    if (!it) return null;
    if (it.place && PROP_MODELS[it.place]) {
      const o = { id: it.place, x: 0, y: 0, z: 0, r: 0, s: 1, data: { lit: true, fill: 1, open: false, m: null, vide: false, items: {} } };
      const T = { t: 1.3, hour: 12, night: 0, day: 1, wind: 0.3, rain: 0 };
      return this.capture((cap) => { PE.buf = cap; PE.fl = 0; PE.frame(0, 0, 0, 0, 1); PROP_MODELS[it.place](PE, o, T); });
    }
    if (id === 'jeune_pommier' && typeof CROP_MODELS !== 'undefined' && CROP_MODELS.pommier) return this.capture((cap) => { PE.buf = cap; PE.fl = 0; PE.frame(0, 0, 0, 0, 1); CROP_MODELS.pommier(PE, 0.7, true); });
    if (it.animal) {
      const cfg = CREATURES[it.animal];
      const fn = cfg && ANIMAL_RIGS[cfg.rig];
      if (!fn) return null;
      const rig = fn(1);
      if (rig.kind === 'bird') poseBird(rig, { t: 0, move: 0 }); else poseQuad(rig, { t: 0, move: 0 });
      return this.capture((cap) => { const M = new Float32Array(12); m34Root(M, 0, 0, 0, 0, 1); rig.emit(cap, M, 0); });
    }
    return null;
  },
  canvas(id) {
    if (id in this.cvCache) return this.cvCache[id];
    let cv = null;
    try { const b = this.boxesFor(id); if (b && b.length) cv = this.render(b); } catch (e) { console.warn('icône 3D', id, e); cv = null; }
    return (this.cvCache[id] = cv);
  },
  url(id) {
    if (id in this.cache) return this.cache[id];
    const cv = this.canvas(id);
    return (this.cache[id] = cv ? cv.toDataURL() : null);
  },
};

// ---------------------------------------------------------------- barre d'outils
const BAR_TOKENS = {
  main: { name: 'Mains nues', icon: 'main' },
  '@hache': { name: 'Hache (la meilleure)', tool: 'hache' }, '@pioche': { name: 'Pioche (la meilleure)', tool: 'pioche' },
  '@houe': { name: 'Houe', tool: 'houe' }, '@arrosoir': { name: 'Arrosoir', tool: 'arrosoir' }, '@pelle': { name: 'Pelle', tool: 'pelle' },
  '@canne': { name: 'Canne à pêche', tool: 'canne' }, '@arc': { name: 'Arc', tool: 'arc' }, '@faux': { name: 'Faux', tool: 'faux' },
  '@graines': { name: 'Graines et engrais', group: 5 }, '@objets': { name: 'Objets à poser', group: 6 }, '@nourriture': { name: 'Nourriture et potions', group: 7 },
};
const BAR_DEFAULT = ['main', '@hache', '@pioche', '@houe', '@arrosoir', '@pelle', '@graines', '@canne', '@nourriture'];
const bar = {
  showT: 0, el: null, lastSig: '',
  init() {
    const s = farm.s;
    if (!Array.isArray(s.bar) || s.bar.length !== 9) s.bar = BAR_DEFAULT.slice();
    if (!settings.hotbar) settings.hotbar = 'auto';
  },
  // objets disponibles pour une case (dans l'ordre où on les fait défiler)
  list(tok) {
    if (!tok) return [];
    if (tok === 'main') return ['main'];
    const T = BAR_TOKENS[tok], inv = farm.s.inv;
    if (T && T.tool) {
      const own = Object.keys(inv).filter((k) => ITEMS[k] && ITEMS[k].tool === T.tool && inv[k] > 0);
      own.sort((a, b) => (ITEMS[b].tier || 0) - (ITEMS[a].tier || 0));
      return own;
    }
    if (T && T.group !== undefined) {
      const L = play.groupItems(T.group);
      if (T.group === 7) for (const k of Object.keys(inv)) if (ITEMS[k] && ITEMS[k].potion && !L.includes(k)) L.push(k);
      return L;
    }
    return farm.count(tok) > 0 ? [tok] : [];
  },
  slotOf(id) { const B = farm.s.bar; for (let i = 0; i < 9; i++) if (this.list(B[i]).includes(id)) return i; return -1; },
  select(g) {
    const L = this.list(farm.s.bar[g]);
    if (!L.length) { sound.click(); this.show(g); return; }
    const i = L.indexOf(farm.s.hand);
    play.select(L[i < 0 ? 0 : (i + 1) % L.length]);
    this.show(g);
  },
  cycle(d) {
    const B = farm.s.bar, cur = this.slotOf(farm.s.hand);
    for (let k = 1; k <= 9; k++) {
      const j = (((cur < 0 ? 0 : cur) + d * k) % 9 + 9) % 9;
      const L = this.list(B[j]);
      if (L.length) { play.select(L[0]); this.show(j); return; }
    }
  },
  // icône d'une case : l'objet en main s'il y est, sinon le premier disponible
  slotItem(i) {
    const tok = farm.s.bar[i], L = this.list(tok);
    if (L.includes(farm.s.hand)) return farm.s.hand;
    return L[0] || null;
  },
  tokenIcon(tok) {
    if (!tok) return '';
    if (tok === 'main') return HAND_ICON();
    if (ITEMS[tok]) return iconURL(tok);
    const T = BAR_TOKENS[tok];
    if (T && T.tool) { const it = Object.keys(ITEMS).find((k) => ITEMS[k].tool === T.tool); return it ? iconURL(it) : ''; }
    if (tok === '@graines') return iconURL('graines_ble');
    if (tok === '@objets') return iconURL('cloture');
    if (tok === '@nourriture') return iconURL('pain');
    return '';
  },
  tokenName(tok) { return !tok ? 'Vide' : BAR_TOKENS[tok] ? BAR_TOKENS[tok].name : itemName(tok); },
  // un objet déposé sur une case : les outils deviennent « le meilleur de leur sorte »
  tokenFor(id) {
    if (id === 'main' || id.startsWith('@')) return id;
    const it = ITEMS[id];
    if (it && it.tool && BAR_TOKENS['@' + it.tool]) return '@' + it.tool;
    return id;
  },
  assign(i, id) { farm.s.bar[i] = id ? this.tokenFor(id) : null; sound.click(); this.lastSig = ''; this.show(-1); },
  show(slot) { this.showT = 3; this.flash = slot; this.render(true); },
  render(force) {
    const el = this.el || (this.el = $('#hotbar'));
    if (!el || !farm.s) return;
    const s = farm.s, sig = s.bar.join(',') + '|' + s.hand + '|' + s.bar.map((t, i) => this.list(t).reduce((a, k) => a + (k === 'main' ? 0 : farm.count(k)), 0)).join(',');
    if (!force && sig === this.lastSig) return;
    this.lastSig = sig;
    const cur = this.slotOf(s.hand);
    el.innerHTML = `<div class="hb-name">${esc(s.hand === 'main' ? 'Mains nues' : itemName(s.hand))}</div><div class="hb-row">` + s.bar.map((tok, i) => {
      const id = this.slotItem(i), n = id && id !== 'main' ? farm.count(id) : 0;
      const src = id ? (id === 'main' ? HAND_ICON() : iconURL(id)) : this.tokenIcon(tok);
      const empty = !id;
      return `<div class="hb-slot ${i === cur ? 'on' : ''} ${empty ? 'empty' : ''}"><b>${i + 1}</b>${src ? `<img src="${src}" alt="">` : ''}${n > 1 ? `<i>${n}</i>` : ''}</div>`;
    }).join('') + '</div>';
  },
  update(dt) {
    const el = this.el || (this.el = $('#hotbar'));
    if (!el) return;
    const mode = settings.hotbar || 'auto', playing = game.mode === 'play' && !ui.panel && !game.dying && !game.sleeping;
    this.showT = Math.max(0, this.showT - dt);
    const vis = playing && (mode === 'toujours' || (mode === 'auto' && this.showT > 0));
    el.classList.toggle('on', vis);
    el.classList.toggle('named', this.showT > 1.2);
    this.rT = (this.rT || 0) - dt;
    if (vis && this.rT <= 0) { this.rT = 0.4; this.render(false); }
  },
};
// icône des mains nues
const HAND_ICON = (() => { let u = null; return () => { if (u) return u; const pb = new PixelBuf(16, 16), sk = rampOf('#e0b896'); for (let y = 5; y < 14; y++) for (let x = 4; x < 12; x++) if (!(y < 8 && (x === 5 || x === 7 || x === 9)) && !(y > 12 && x > 9)) pb.set(x, y, rampPick(sk, 0.85 - (x - 4) * 0.04, x, y)); for (const x of [4, 6, 8, 10]) for (let y = 2; y < 6; y++) pb.set(x, y, rampPick(sk, 0.8, x, y)); for (let y = 7; y < 11; y++) pb.set(12, y, rampPick(sk, 0.7, 12, y)); const c = pb.canvas(); return (u = c.toDataURL()); }; })();

// Les touches 1 à 9 et la molette passent par la barre
play.group = function (g) { bar.select(g); };
play.cycle = function (d) { bar.cycle(d); };
const _playSelect = play.select.bind(play);
play.select = function (id) { const before = farm.s.hand; _playSelect(id); if (farm.s.hand !== before) bar.show(bar.slotOf(farm.s.hand)); };

HOOKS.load.push(() => { bar.init(); bar.lastSig = ''; });
HOOKS.update.push((dt) => bar.update(dt));

// ---------------------------------------------------------------- sacoche : personnaliser la barre
const _renderSatchel = ui.renderSatchel.bind(ui);
ui.renderSatchel = function () {
  _renderSatchel();
  if (this.satTab !== 'sac') return;
  const s = farm.s, body = $('#satchel .body');
  if (!body) return;
  const wrap = document.createElement('div');
  wrap.className = 'barcfg';
  wrap.innerHTML = `<h4>Barre d’outils <span>— glissez un objet sur une case, ou survolez-le et tapez 1 à 9 · clic droit : vider</span></h4>
    <div class="hb-row cfg">${s.bar.map((tok, i) => `<div class="hb-slot" data-slot="${i}" title="${esc(bar.tokenName(tok))}"><b>${i + 1}</b>${tok ? `<img src="${bar.tokenIcon(tok)}" alt="">` : ''}</div>`).join('')}</div>
    <div class="tokens">${['main', '@graines', '@nourriture', '@objets'].map((t) => `<span class="tok" draggable="true" data-tok="${t}"><img src="${bar.tokenIcon(t)}" alt="">${esc(BAR_TOKENS[t].name)}</span>`).join('')}</div>`;
  body.insertBefore(wrap, body.firstChild);
  const drag = (el, id) => { el.draggable = true; el.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', id); e.dataTransfer.effectAllowed = 'copy'; }); };
  $$('#satchel [data-it]').forEach((b) => { drag(b, b.dataset.it); b.addEventListener('mouseenter', () => { ui.satHover = b.dataset.it; }); b.addEventListener('mouseleave', () => { if (ui.satHover === b.dataset.it) ui.satHover = null; }); });
  $$('#satchel [data-tok]').forEach((b) => { drag(b, b.dataset.tok); b.addEventListener('mouseenter', () => { ui.satHover = b.dataset.tok; }); b.addEventListener('mouseleave', () => { ui.satHover = null; }); });
  $$('#satchel [data-slot]').forEach((el) => {
    const i = +el.dataset.slot;
    el.addEventListener('dragover', (e) => { e.preventDefault(); el.classList.add('over'); });
    el.addEventListener('dragleave', () => el.classList.remove('over'));
    el.addEventListener('drop', (e) => { e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); if (id) { bar.assign(i, id); ui.renderSatchel(); } });
    el.addEventListener('contextmenu', (e) => { e.preventDefault(); bar.assign(i, null); ui.renderSatchel(); });
    el.addEventListener('click', () => bar.select(i));
  });
};
ui.satKey = function (k) { if (this.satHover) { bar.assign(k - 1, this.satHover); this.renderSatchel(); } else bar.select(k - 1); };

// ---------------------------------------------------------------- option : barre d'outils
HOOKS.load.push(() => {
  const el = $('#o-hotbar');
  if (!el || el.bound) return;
  el.bound = true;
  el.value = settings.hotbar || 'auto';
  el.onchange = () => { settings.hotbar = el.value; store.set('prairie.settings', settings); bar.show(-1); };
});
