// ============================================================================
//  ÉDITEUR DE MONDE : relief, peinture, objets, blocs, annulation
// ============================================================================

const editor = {
  tool: 'sculpt',
  size: 6, strength: 0.5,
  paintMat: M_DIRT,
  objType: OBJ_INDEX.oak,
  scatter: true, density: 0.5, eraseFilter: false,
  block: { sx: 1, sy: 1, sz: 1, m: M_STONE, r: 0, sh: 0 }, snap: true,
  flattenH: null,
  undo: [],
  hit: null, ghost: null,
  stroke: 0, strokeT: 0, changed: false,
  lastPanelTool: null,

  // -------------------------------------------------------------- ciblage
  target(w, eye, dir) {
    const th = w.raycastTerrain(eye, dir, 400);
    const bh = w.raycastBlocks(eye, dir, th ? th.t : 400);
    this.hit = null; this.ghost = null;
    if (bh && (!th || bh.t < th.t)) {
      const p = [eye[0] + dir[0] * bh.t, eye[1] + dir[1] * bh.t, eye[2] + dir[2] * bh.t];
      this.hit = { kind: 'block', x: p[0], y: p[1], z: p[2], block: bh.block, idx: bh.idx, n: bh.n, ln: bh.ln, t: bh.t };
    } else if (th) {
      this.hit = { kind: 'terrain', x: th.x, y: th.y, z: th.z, t: th.t };
    }
    if (this.tool === 'block' && this.hit) this.ghost = this.computeGhost(w, this.hit);
  },

  computeGhost(w, h) {
    const B = this.block, snap = (v, s) => (this.snap ? Math.round(v / s) * s : v);
    if (h.kind === 'terrain') {
      const x = snap(h.x, 0.5), z = snap(h.z, 0.5);
      return { x, y: w.heightAt(x, z) - 0.05, z, sx: B.sx, sy: B.sy, sz: B.sz, r: B.r, m: B.m, sh: B.sh | 0 };
    }
    const b = h.block, ln = h.ln;
    const [lx, lz] = World.blockLocal(b, h.x, h.z);
    let cx, cz, cy;
    if (ln[1] > 0.5) { cx = snap(lx, 0.5); cz = snap(lz, 0.5); cy = b.y + b.sy; }
    else if (ln[1] < -0.5) { cx = snap(lx, 0.5); cz = snap(lz, 0.5); cy = b.y - B.sy; }
    else {
      cy = b.y + snap(h.y - b.y - B.sy / 2, 0.25);
      if (Math.abs(ln[0]) > 0.5) { cx = ln[0] * (b.sx / 2 + B.sx / 2); cz = snap(lz, 0.5); }
      else { cz = ln[2] * (b.sz / 2 + B.sz / 2); cx = snap(lx, 0.5); }
    }
    const [wx, wz] = World.blockToWorldDir(b, cx, cz);
    return { x: b.x + wx, y: cy, z: b.z + wz, sx: B.sx, sy: B.sy, sz: B.sz, r: b.r, m: B.m, sh: B.sh | 0 };
  },

  // -------------------------------------------------------------- annulation
  pushUndo(w, kind) {
    const snap = { kind };
    if (kind === 'heights') snap.data = w.heights.slice();
    else if (kind === 'mats') snap.data = w.mats.slice();
    else if (kind === 'objects') snap.data = w.objects.map((o) => ({ ...o }));
    else if (kind === 'blocks') snap.data = w.blocks.map((b) => ({ ...b }));
    this.undo.push(snap);
    if (this.undo.length > 30) this.undo.shift();
  },
  doUndo(w) {
    const s = this.undo.pop();
    if (!s) { ui.toast('Rien à annuler'); return; }
    if (s.kind === 'heights') { w.heights.set(s.data); w.markHeights(0, 0, w.N, w.N); }
    else if (s.kind === 'mats') { w.mats.set(s.data); w.markMats(0, 0, w.N, w.N); }
    else if (s.kind === 'objects') { w.objects = s.data; this.objectsChanged(w); }
    else if (s.kind === 'blocks') { w.blocks = s.data; this.blocksChanged(w); }
    game.worldChanged = true;
    ui.toast('Annulé');
  },
  objectsChanged(w) { w.objectsDirty = true; w.shadeDirty = true; w.grid = null; game.worldChanged = true; },
  blocksChanged(w) { w.blocksDirty = true; w.shadeDirty = true; w.coverDirty = true; w.grid = null; game.worldChanged = true; },

  // -------------------------------------------------------------- application
  begin(w, btn) {
    if (!this.hit) return;
    this.stroke = btn; this.strokeT = 0; this.changed = false;
    const t = this.tool, h = this.hit;
    if (t === 'sculpt' || t === 'smooth' || t === 'flatten') {
      if (t === 'flatten' && btn === 2) { this.flattenH = h.y; ui.toast('Hauteur prélevée : ' + h.y.toFixed(1) + ' m'); this.stroke = 0; return; }
      if (t === 'flatten') this.flattenH = this.flattenH ?? h.y;
      this.pushUndo(w, 'heights');
    } else if (t === 'paint') {
      if (btn === 2) { this.paintMat = w.matAt(h.x, h.z); ui.refreshEditor(); ui.toast('Pipette : ' + MATERIALS[this.paintMat].name); this.stroke = 0; return; }
      this.pushUndo(w, 'mats');
    } else if (t === 'place') {
      this.pushUndo(w, 'objects');
      if (btn === 2) { this.removeNearest(w, h); this.stroke = 0; return; }
      this.placeOne(w, h.x, h.z, h);
      if (!this.scatter) this.stroke = 0;
    } else if (t === 'erase') {
      this.pushUndo(w, 'objects');
    } else if (t === 'block') {
      if (btn === 4 && h.kind === 'block') {
        const b = h.block;
        Object.assign(this.block, { sx: b.sx, sy: b.sy, sz: b.sz, m: b.m, r: b.r, sh: b.sh | 0 });
        ui.refreshEditor(); ui.toast('Bloc copié'); this.stroke = 0; return;
      }
      this.pushUndo(w, 'blocks');
      if (btn === 2) {
        if (h.kind === 'block') { w.blocks.splice(h.idx, 1); this.blocksChanged(w); sound.remove(); }
      } else if (this.ghost) {
        w.blocks.push({ ...this.ghost }); this.blocksChanged(w); sound.pop();
      }
      this.stroke = 0;
    }
    this.apply(w, 0);
  },
  end(w) {
    if (!this.stroke) return;
    if (this.tool === 'place' || this.tool === 'erase') { w.shadeDirty = true; }
    this.stroke = 0;
  },

  apply(w, dt) {
    const h = this.hit;
    if (!this.stroke || !h) return;
    const t = this.tool, r = this.size, S = this.strength;
    if (t === 'sculpt' || t === 'smooth' || t === 'flatten') {
      const sign = this.stroke === 2 ? -1 : 1;
      const src = t === 'smooth' ? w.heights.slice() : null;
      this.forVerts(w, h.x, h.z, r, (k, f, i, j) => {
        if (t === 'sculpt') w.heights[k] += sign * f * S * dt * 7;
        else if (t === 'flatten') w.heights[k] = lerp(w.heights[k], this.flattenH, Math.min(1, f * S * dt * 8));
        else {
          let s = 0;
          for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) s += src[clamp(j + dj, 0, w.N) * w.W + clamp(i + di, 0, w.N)];
          w.heights[k] = lerp(w.heights[k], s / 9, Math.min(1, f * S * dt * 10));
        }
        w.heights[k] = clamp(w.heights[k], -120, 300);
      }, true);
      game.worldChanged = true;
    } else if (t === 'paint') {
      this.forVerts(w, h.x, h.z, r, (k, f, i, j) => {
        if (f > 0.12 || hash2i(i, j, (performance.now() / 50) | 0) < f * 6) w.mats[k] = this.paintMat;
      }, false);
      game.worldChanged = true;
    } else if (t === 'place' && this.scatter) {
      this.strokeT += dt;
      if (this.strokeT > 0.07) {
        this.strokeT = 0;
        const n = Math.max(1, Math.round(this.density * r * 0.35));
        for (let k = 0; k < n; k++) {
          const a = Math.random() * TAU, d = Math.sqrt(Math.random()) * r;
          this.placeOne(w, h.x + Math.cos(a) * d, h.z + Math.sin(a) * d, null, true);
        }
      }
    } else if (t === 'erase') {
      const before = w.objects.length;
      w.objects = w.objects.filter((o) => Math.hypot(o.x - h.x, o.z - h.z) > r || (this.eraseFilter && o.t !== this.objType));
      if (w.objects.length !== before) { this.objectsChanged(w); w.shadeDirty = false; }
    }
  },

  forVerts(w, cx, cz, r, fn, heights) {
    const c = w.cell;
    const i0 = Math.max(0, Math.floor((cx - r) / c)), i1 = Math.min(w.N, Math.ceil((cx + r) / c));
    const j0 = Math.max(0, Math.floor((cz - r) / c)), j1 = Math.min(w.N, Math.ceil((cz + r) / c));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const d = Math.hypot(i * c - cx, j * c - cz) / r;
      if (d >= 1) continue;
      const f = (1 - d * d) * (1 - d * d);
      fn(j * w.W + i, f, i, j);
    }
    if (heights) w.markHeights(i0 - 1, j0 - 1, i1 + 1, j1 + 1);
    else w.markMats(i0, j0, i1, j1);
  },

  placeOne(w, x, z, h, scatter) {
    if (!w.inside(x, z, 1)) return;
    const T = OBJ_TYPES[this.objType];
    let y;
    if (h && h.kind === 'block' && h.n[1] > 0.5) y = h.block.y + h.block.sy;
    if (scatter) {
      if (w.heightAt(x, z) < w.waterLevel - 0.3 && T.id !== 'reeds') return;
      const sp = T.spacing * 0.85;
      for (const o of w.objects) if (Math.abs(o.x - x) < sp && Math.abs(o.z - z) < sp && Math.hypot(o.x - x, o.z - z) < sp) return;
    }
    const o = { t: this.objType, x, z, h: lerp(T.h[0], T.h[1], Math.random()), f: Math.random() < 0.5 ? 1 : 0, v: (Math.random() * T.spr.length) | 0 };
    if (y !== undefined) o.y = y;
    w.objects.push(o);
    w.objectsDirty = true; w.grid = null; game.worldChanged = true;
    if (!scatter) { w.shadeDirty = true; sound.pop(); }
  },

  removeNearest(w, h) {
    let best = -1, bd = Math.max(2, this.size * 0.5);
    w.objects.forEach((o, i) => { const d = Math.hypot(o.x - h.x, o.z - h.z); if (d < bd) { bd = d; best = i; } });
    if (best >= 0) { w.objects.splice(best, 1); this.objectsChanged(w); sound.remove(); }
  },

  rotate(step) {
    this.block.r = ((this.block.r + step) % TAU + TAU) % TAU;
    ui.refreshEditor();
  },

  brushUniform() {
    const h = this.hit;
    if (!h || this.tool === 'block') return null;
    const r = this.tool === 'place' && !this.scatter ? 0.6 : this.size;
    return [h.x, h.z, r, 1];
  },
  brushColor() {
    switch (this.tool) {
      case 'sculpt': return this.stroke === 2 ? [1, 0.55, 0.2] : [1, 0.9, 0.3];
      case 'smooth': return [0.4, 0.8, 1];
      case 'flatten': return [0.8, 0.6, 1];
      case 'paint': { const c = MATERIALS[this.paintMat].avg; return [Math.min(1, c[0] / 160), Math.min(1, c[1] / 160), Math.min(1, c[2] / 160)]; }
      case 'place': return [0.4, 1, 0.45];
      case 'erase': return [1, 0.3, 0.25];
    }
    return [1, 1, 1];
  },
};
