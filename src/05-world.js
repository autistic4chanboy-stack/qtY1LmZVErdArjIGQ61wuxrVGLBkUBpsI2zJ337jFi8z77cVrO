// ============================================================================
//  MONDE : données, requêtes, collisions, lancer de rayons, sérialisation
// ============================================================================

const GRID_CELL = 8; // cellule de la grille spatiale (m)

class World {
  constructor(N, cell) {
    this.N = N; this.cell = cell; this.W = N + 1;
    this.heights = new Float32Array(this.W * this.W);
    this.mats = new Uint8Array(this.W * this.W);
    this.shade = new Uint8Array(this.W * this.W);
    this.objects = []; // {t, x, z, h, f, v, y?}
    this.blocks = [];  // {x, y, z, sx, sy, sz, r, m}
    this.name = 'Prairie';
    this.seed = 0;
    this.waterLevel = 0;
    this.spawn = { x: 0, y: 0, z: 0, yaw: 0 };
    this.time = 0.32;
    this.dayLength = 600;
    this.weather = 'auto';
    this.pois = [];        // lieux nommés {name, kind, x, z, r}
    this.genVersion = 1;
    this.cover = null;     // carte des abris (1 m) : hauteur du plafond au-dessus du sol
    this.coverW = 0;
    this.coverDirty = true;
    this.dirtyHeights = null; // [i0, j0, i1, j1]
    this.dirtyMats = null;
    this.objectsDirty = true;
    this.blocksDirty = true;
    this.shadeDirty = true;
    this.grid = null;
    this.lights = [];
    this.props = [];       // objets 3D posés {id, x, y, z, r, s?, v?, data?}
    this.doors = [];       // portes {x, y, z, r, w, h, a, open, locked, owner, bld}
    this.bridges = [];     // ponts-levis {x, y, z, r, w, L, a, up}
    this.curVer = 1;       // version du monde affichée (bit) : objets/blocs avec « ver » filtrés
    this.propsVer = 0;
  }
  // Élément visible dans la version courante du monde
  live(o) { return !o.gone && (!o.ver || (o.ver & this.curVer) !== 0); }
  get size() { return this.N * this.cell; }

  h(i, j) {
    const N = this.N;
    i = i < 0 ? 0 : i > N ? N : i;
    j = j < 0 ? 0 : j > N ? N : j;
    return this.heights[j * this.W + i];
  }
  // Interpolation exacte (même triangulation que le maillage)
  heightAt(x, z) {
    const gx = clamp(x / this.cell, 0, this.N - 1e-4), gz = clamp(z / this.cell, 0, this.N - 1e-4);
    const i = Math.floor(gx), j = Math.floor(gz), fx = gx - i, fz = gz - j;
    const ha = this.h(i, j), hb = this.h(i + 1, j), hc = this.h(i, j + 1), hd = this.h(i + 1, j + 1);
    if (fx + fz <= 1) return ha + (hb - ha) * fx + (hc - ha) * fz;
    return hd + (hc - hd) * (1 - fx) + (hb - hd) * (1 - fz);
  }
  normalAt(x, z) {
    const e = this.cell * 0.5;
    const dx = this.heightAt(x - e, z) - this.heightAt(x + e, z);
    const dz = this.heightAt(x, z - e) - this.heightAt(x, z + e);
    return v3.norm([dx, 2 * e, dz]);
  }
  slopeAt(i, j) {
    const c = this.cell;
    const dx = (this.h(i + 1, j) - this.h(i - 1, j)) / (2 * c);
    const dz = (this.h(i, j + 1) - this.h(i, j - 1)) / (2 * c);
    return Math.hypot(dx, dz);
  }
  matAt(x, z) {
    const i = clamp(Math.round(x / this.cell), 0, this.N), j = clamp(Math.round(z / this.cell), 0, this.N);
    return this.mats[j * this.W + i];
  }
  inside(x, z, margin = 0) {
    return x >= margin && z >= margin && x <= this.size - margin && z <= this.size - margin;
  }
  markHeights(i0, j0, i1, j1) {
    const d = this.dirtyHeights;
    i0 = clamp(i0, 0, this.N); j0 = clamp(j0, 0, this.N); i1 = clamp(i1, 0, this.N); j1 = clamp(j1, 0, this.N);
    this.dirtyHeights = d ? [Math.min(d[0], i0), Math.min(d[1], j0), Math.max(d[2], i1), Math.max(d[3], j1)] : [i0, j0, i1, j1];
    this.objectsDirty = true;
  }
  markMats(i0, j0, i1, j1) {
    const d = this.dirtyMats;
    i0 = clamp(i0, 0, this.N); j0 = clamp(j0, 0, this.N); i1 = clamp(i1, 0, this.N); j1 = clamp(j1, 0, this.N);
    this.dirtyMats = d ? [Math.min(d[0], i0), Math.min(d[1], j0), Math.max(d[2], i1), Math.max(d[3], j1)] : [i0, j0, i1, j1];
  }

  objectY(o) {
    return o.y !== undefined ? o.y : this.heightAt(o.x, o.z);
  }

  // ------------------------------------------------------------------ grille spatiale
  rebuildGrid() {
    const gw = Math.ceil(this.size / GRID_CELL) + 1;
    const cells = new Array(gw * gw);
    for (let k = 0; k < cells.length; k++) cells[k] = null;
    const push = (gx, gz, item) => {
      if (gx < 0 || gz < 0 || gx >= gw || gz >= gw) return;
      const k = gz * gw + gx;
      (cells[k] || (cells[k] = [])).push(item);
    };
    this.objects.forEach((o, idx) => {
      const t = OBJ_TYPES[o.t];
      if ((!t.col && !t.colK) || !this.live(o)) return;
      push(Math.floor(o.x / GRID_CELL), Math.floor(o.z / GRID_CELL), idx);
    });
    this.blocks.forEach((b, idx) => {
      if (b.ver && !(b.ver & this.curVer)) return;
      const r = Math.hypot(b.sx, b.sz) / 2;
      const gx0 = Math.floor((b.x - r) / GRID_CELL), gx1 = Math.floor((b.x + r) / GRID_CELL);
      const gz0 = Math.floor((b.z - r) / GRID_CELL), gz1 = Math.floor((b.z + r) / GRID_CELL);
      for (let gz = gz0; gz <= gz1; gz++) for (let gx = gx0; gx <= gx1; gx++) push(gx, gz, -1 - idx);
    });
    this.grid = { gw, cells };
    this.allGrid = null;
  }
  // Grille de tous les objets (pour les rayons courts : visée, outils, fioles)
  objectsGrid() {
    if (!this.grid) this.rebuildGrid();
    if (this.allGrid) return this.allGrid;
    const C = 8, gw = Math.ceil(this.size / C) + 1, cells = new Array(gw * gw);
    this.objects.forEach((o, i) => {
      if (!this.live(o)) return;
      const k = clamp(Math.floor(o.z / C), 0, gw - 1) * gw + clamp(Math.floor(o.x / C), 0, gw - 1);
      (cells[k] || (cells[k] = [])).push(i);
    });
    return (this.allGrid = { C, gw, cells });
  }
  forObjectsNearRay(o, d, maxDist, fn) {
    if (maxDist > 40) { this.objects.forEach(fn); return; }
    const G = this.objectsGrid(), C = G.C, m = 8;
    const ex = o[0] + d[0] * maxDist, ez = o[2] + d[2] * maxDist;
    const gx0 = clamp(Math.floor((Math.min(o[0], ex) - m) / C), 0, G.gw - 1), gx1 = clamp(Math.floor((Math.max(o[0], ex) + m) / C), 0, G.gw - 1);
    const gz0 = clamp(Math.floor((Math.min(o[2], ez) - m) / C), 0, G.gw - 1), gz1 = clamp(Math.floor((Math.max(o[2], ez) + m) / C), 0, G.gw - 1);
    for (let gz = gz0; gz <= gz1; gz++) for (let gx = gx0; gx <= gx1; gx++) {
      const c = G.cells[gz * G.gw + gx];
      if (c) for (const i of c) fn(this.objects[i], i);
    }
  }
  // Appelle cb(obj, idx) pour objets solides et cbB(block, idx) pour blocs proches
  query(x, z, r, cbO, cbB) {
    if (!this.grid) this.rebuildGrid();
    const { gw, cells } = this.grid;
    const gx0 = Math.floor((x - r) / GRID_CELL), gx1 = Math.floor((x + r) / GRID_CELL);
    const gz0 = Math.floor((z - r) / GRID_CELL), gz1 = Math.floor((z + r) / GRID_CELL);
    const seenB = cbB ? new Set() : null;
    for (let gz = Math.max(0, gz0); gz <= Math.min(gw - 1, gz1); gz++) {
      for (let gx = Math.max(0, gx0); gx <= Math.min(gw - 1, gx1); gx++) {
        const c = cells[gz * gw + gx];
        if (!c) continue;
        for (const it of c) {
          if (it >= 0) { if (cbO) cbO(this.objects[it], it); }
          else if (cbB) { const bi = -1 - it; if (!seenB.has(bi)) { seenB.add(bi); cbB(this.blocks[bi], bi); } }
        }
      }
    }
  }

  // Coordonnées locales d'un point dans le repère d'un bloc
  static blockLocal(b, x, z) {
    const c = Math.cos(b.r), s = Math.sin(b.r), dx = x - b.x, dz = z - b.z;
    return [dx * c - dz * s, dx * s + dz * c];
  }
  static blockToWorldDir(b, lx, lz) {
    const c = Math.cos(b.r), s = Math.sin(b.r);
    return [lx * c + lz * s, -lx * s + lz * c];
  }
  // Hauteur du dessus d'un bloc (selon sa forme) au point local (lx, lz)
  static blockTop(b, lx, lz) {
    const hx = b.sx / 2, hz = b.sz / 2;
    switch (b.sh | 0) {
      case 1: return b.sy * clamp(1 - Math.abs(lz) / hz, 0, 1);
      case 2: return b.sy * clamp((lz + hz) / b.sz, 0, 1);
      case 3: return b.sy * clamp(1 - Math.max(Math.abs(lx) / hx, Math.abs(lz) / hz), 0, 1);
    }
    return b.sy;
  }

  // Pont-levis : bloc virtuel selon son état (tablier baissé ou pont dressé devant la porte)
  bridgeBox(b) {
    const dx = Math.sin(b.r), dz = Math.cos(b.r);
    if (b.a < 0.3) return { x: b.x + dx * b.L / 2, y: b.y - 0.25, z: b.z + dz * b.L / 2, sx: b.w, sy: 0.25, sz: b.L, r: b.r, deck: true };
    return { x: b.x + dx * 0.3, y: b.y - 0.3, z: b.z + dz * 0.3, sx: b.w + 0.4, sy: b.L + 0.3, sz: 0.5, r: b.r };
  }
  doorBox(d) { return { x: d.x, y: d.y, z: d.z, sx: d.w, sy: d.h, sz: 0.12, r: d.r }; }

  // Hauteur du sol (terrain + dessus de blocs accessibles)
  groundAt(x, z, feetY, stepUp, margin = 0.2) {
    let g = this.heightAt(x, z);
    if (feetY < g - 2) g = -1e9; // sous terre : seuls les blocs portent
    for (const br of this.bridges) {
      if (Math.abs(br.x - x) > br.L + 3 || Math.abs(br.z - z) > br.L + 3) continue;
      const b = this.bridgeBox(br);
      if (!b.deck) continue;
      const [lx, lz] = World.blockLocal(b, x, z);
      if (Math.abs(lx) > b.sx / 2 + margin || Math.abs(lz) > b.sz / 2 + margin) continue;
      const top = b.y + b.sy;
      if (top > g && top <= feetY + stepUp) g = top;
    }
    this.query(x, z, 1, null, (b) => {
      const [lx, lz] = World.blockLocal(b, x, z);
      const hx = b.sx / 2, hz = b.sz / 2;
      if (Math.abs(lx) > hx + margin || Math.abs(lz) > hz + margin) return;
      const top = b.y + World.blockTop(b, clamp(lx, -hx, hx), clamp(lz, -hz, hz));
      if (top > g && top <= feetY + stepUp) g = top;
    });
    return g;
  }

  // Repousse un cercle hors d'une boîte orientée (bloc, porte, pont) ; renvoie [x, z]
  static pushOut(b, x, z, feet, head, radius, stepUp) {
    if (b.y >= head - 0.05) return null;
    const [lx, lz] = World.blockLocal(b, x, z);
    const hx = b.sx / 2, hz = b.sz / 2;
    const cx = clamp(lx, -hx, hx), cz = clamp(lz, -hz, hz);
    if (b.y + World.blockTop(b, cx, cz) <= feet + stepUp) return null;
    const px = lx - cx, pz = lz - cz, d = Math.hypot(px, pz);
    if (d >= radius) return null;
    let nlx, nlz;
    if (d > 1e-6) { nlx = cx + px / d * radius; nlz = cz + pz / d * radius; }
    else {
      const ex = hx - Math.abs(lx), ez = hz - Math.abs(lz);
      if (ex < ez) { nlx = Math.sign(lx || 1) * (hx + radius); nlz = lz; } else { nlx = lx; nlz = Math.sign(lz || 1) * (hz + radius); }
    }
    const [wx, wz] = World.blockToWorldDir(b, nlx, nlz);
    return [b.x + wx, b.z + wz];
  }

  // Collision d'un cylindre (joueur, animal) contre objets solides et blocs
  collideCircle(x, z, feet, head, radius, stepUp, withObjects = true, ignoreDoors = false) {
    for (let it = 0; it < 3; it++) {
      if (!ignoreDoors) for (const d of this.doors) {
        if (d.a > 0.4 || Math.abs(d.x - x) > 3 || Math.abs(d.z - z) > 3) continue;
        const r = World.pushOut(this.doorBox(d), x, z, feet, head, radius, stepUp);
        if (r) { x = r[0]; z = r[1]; }
      }
      for (const br of this.bridges) {
        if (Math.abs(br.x - x) > br.L + 3 || Math.abs(br.z - z) > br.L + 3) continue;
        const b = this.bridgeBox(br);
        if (b.deck) continue;
        const r = World.pushOut(b, x, z, feet, head, radius, stepUp);
        if (r) { x = r[0]; z = r[1]; }
      }
      this.query(x, z, 2.5 + radius, withObjects ? (o) => {
        const t = OBJ_TYPES[o.t];
        const r = objRadius(t, o);
        if (!r) return;
        const oy = this.objectY(o);
        if (feet > oy + o.h * 0.8 || head < oy) return;
        const dx = x - o.x, dz = z - o.z, d = Math.hypot(dx, dz), min = r + radius;
        if (d < min && d > 1e-5) { x = o.x + dx / d * min; z = o.z + dz / d * min; }
      } : null, (b) => {
        const r = World.pushOut(b, x, z, feet, head, radius, stepUp);
        if (r) { x = r[0]; z = r[1]; }
      });
    }
    return [x, z];
  }

  // Carte des abris (fenêtre de 256 m autour du joueur, 1 m par case) : bas du plafond le plus proche
  computeCover(cx, cz) {
    const S = 256;
    if (cx !== undefined) this.coverO = [Math.floor(cx - S / 2), Math.floor(cz - S / 2)];
    if (!this.coverO) this.coverO = [Math.floor(this.spawn.x - S / 2), Math.floor(this.spawn.z - S / 2)];
    const [ox, oz] = this.coverO;
    const cov = this.cover && this.cover.length === S * S ? this.cover : new Float32Array(S * S);
    cov.fill(-1e4); // -1e4 = pas de plafond (jamais « sous abri »)
    for (const b of this.blocks) {
      const hx = b.sx / 2 - 0.45, hz = b.sz / 2 - 0.45;
      if (hx <= 0 || hz <= 0 || b.m === M_FROSTED || b.hidden || (b.ver && !(b.ver & this.curVer))) continue;
      if (b.under && !b.ceil) continue;
      const R = Math.hypot(hx, hz);
      if (b.x + R < ox || b.z + R < oz || b.x - R > ox + S || b.z - R > oz + S) continue;
      if (!b.under && b.y - this.heightAt(b.x, b.z) < 1.2) continue;
      const i0 = Math.max(0, Math.floor(b.x - R - ox)), i1 = Math.min(S - 1, Math.ceil(b.x + R - ox));
      const j0 = Math.max(0, Math.floor(b.z - R - oz)), j1 = Math.min(S - 1, Math.ceil(b.z + R - oz));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const [lx, lz] = World.blockLocal(b, ox + i + 0.5, oz + j + 0.5);
        if (Math.abs(lx) > hx || Math.abs(lz) > hz) continue;
        const k = j * S + i;
        if (cov[k] < -9000 || b.y < cov[k]) cov[k] = b.y;
      }
    }
    this.cover = cov; this.coverW = S; this.coverDirty = false;
  }
  covered(x, y, z) {
    if (!this.cover) return false;
    const S = this.coverW, i = Math.floor(x) - this.coverO[0], j = Math.floor(z) - this.coverO[1];
    if (i < 0 || j < 0 || i >= S || j >= S) return false;
    return y < this.cover[j * S + i] - 0.05;
  }

  // ------------------------------------------------------------------ carte d'ombre
  // region = [x0, z0, x1, z1] (m) pour ne recalculer qu'une zone ; renvoie la zone en indices de sommets
  computeShade(region) {
    const W = this.W, N = this.N, cell = this.cell;
    const [rx0, rz0, rx1, rz1] = region || [0, 0, this.size, this.size];
    const i0r = clamp(Math.floor(rx0 / cell), 0, N), i1r = clamp(Math.ceil(rx1 / cell), 0, N);
    const j0r = clamp(Math.floor(rz0 / cell), 0, N), j1r = clamp(Math.ceil(rz1 / cell), 0, N);
    const rw = i1r - i0r + 1, rh = j1r - j0r + 1;
    const acc = new Float32Array(rw * rh);
    const stamp = (x, z, R, I) => {
      const i0 = Math.max(i0r, Math.floor((x - R) / cell)), i1 = Math.min(i1r, Math.ceil((x + R) / cell));
      const j0 = Math.max(j0r, Math.floor((z - R) / cell)), j1 = Math.min(j1r, Math.ceil((z + R) / cell));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const d = Math.hypot(i * cell - x, j * cell - z) / R;
        if (d >= 1) continue;
        const v = I * (1 - d * d);
        const k = (j - j0r) * rw + (i - i0r);
        acc[k] = 1 - (1 - acc[k]) * (1 - v);
      }
    };
    const inRegion = (x, z, R) => x + R >= rx0 && z + R >= rz0 && x - R <= rx1 && z - R <= rz1;
    for (const o of this.objects) {
      const t = OBJ_TYPES[o.t];
      if (!t.shade || !this.live(o)) continue;
      const R = t.shade[0] * (o.h / ((t.h[0] + t.h[1]) / 2));
      if (inRegion(o.x, o.z, R)) stamp(o.x, o.z, R, t.shade[1]);
    }
    for (const b of this.blocks) {
      if (b.sy < 0.2 || b.hidden || (b.ver && !(b.ver & this.curVer))) continue;
      const R = Math.hypot(b.sx, b.sz) / 2 + 1;
      if (inRegion(b.x, b.z, R)) stamp(b.x, b.z, R, Math.min(0.7, 0.25 + b.sy * 0.1));
    }
    for (let j = 0; j < rh; j++) for (let i = 0; i < rw; i++) this.shade[(j + j0r) * W + i + i0r] = Math.min(255, acc[j * rw + i] * 255) | 0;
    this.shadeDirty = false;
    return [i0r, j0r, i1r, j1r];
  }

  collectLights() {
    const L = [];
    this.objects.forEach((o, idx) => {
      const t = OBJ_TYPES[o.t];
      if (!t.light || !this.live(o)) return;
      const y = this.objectY(o);
      L.push({ x: o.x, y: y + t.light.y * (o.h / t.h[0]), z: o.z, r: t.light.r, c: t.light.c, night: !!t.light.night, flicker: !!t.light.flicker, power: !!t.light.power, seed: idx * 1.37 });
    });
    if (typeof PROP_LIGHTS !== 'undefined') this.props.forEach((p, idx) => {
      const pl = PROP_LIGHTS[p.id];
      if (!pl || !this.live(p)) return;
      if (pl.lit && !(p.data && p.data.lit)) return;
      if (p.data && p.data.lit === false) return;
      L.push({ x: p.x, y: p.y + pl.y, z: p.z, r: pl.r, c: pl.c, night: !!pl.night, flicker: !!pl.flicker, seed: idx * 2.71, prop: p });
    });
    this.lights = L;
  }

  // ------------------------------------------------------------------ rayons
  raycastTerrain(o, d, maxDist) {
    let step = 0.4, t = 0, prevT = 0;
    let prevAbove = o[1] - this.heightAt(o[0], o[2]);
    if (prevAbove < 0) return null;
    while (t < maxDist) {
      prevT = t;
      t += step;
      const x = o[0] + d[0] * t, y = o[1] + d[1] * t, z = o[2] + d[2] * t;
      if (!this.inside(x, z, -200)) return null;
      const above = y - this.heightAt(x, z);
      if (above < 0) {
        let a = prevT, b = t;
        for (let k = 0; k < 10; k++) {
          const m = (a + b) / 2;
          const yy = o[1] + d[1] * m;
          if (yy - this.heightAt(o[0] + d[0] * m, o[2] + d[2] * m) < 0) b = m; else a = m;
        }
        const tt = (a + b) / 2;
        return { t: tt, x: o[0] + d[0] * tt, y: o[1] + d[1] * tt, z: o[2] + d[2] * tt };
      }
      step = Math.min(2, 0.4 + t * 0.01);
      prevAbove = above;
    }
    return null;
  }

  raycastBlock(b, o, d) {
    const [lx, lz] = World.blockLocal(b, o[0], o[2]);
    const c = Math.cos(b.r), s = Math.sin(b.r);
    const ldx = d[0] * c - d[2] * s, ldz = d[0] * s + d[2] * c;
    const lo = [lx, o[1] - b.y, lz], ld = [ldx, d[1], ldz];
    const mn = [-b.sx / 2, 0, -b.sz / 2], mx = [b.sx / 2, b.sy, b.sz / 2];
    let tn = -Infinity, tf = Infinity, axis = -1, sign = 0;
    for (let a = 0; a < 3; a++) {
      if (Math.abs(ld[a]) < 1e-9) {
        if (lo[a] < mn[a] || lo[a] > mx[a]) return null;
        continue;
      }
      let t1 = (mn[a] - lo[a]) / ld[a], t2 = (mx[a] - lo[a]) / ld[a];
      let sg = -1;
      if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; sg = 1; }
      if (t1 > tn) { tn = t1; axis = a; sign = sg; }
      if (t2 < tf) tf = t2;
      if (tn > tf || tf < 0) return null;
    }
    if (tn < 0) return null;
    const ln = [0, 0, 0];
    ln[axis] = sign;
    const [wx, wz] = World.blockToWorldDir(b, ln[0], ln[2]);
    return { t: tn, n: [wx, ln[1], wz], ln };
  }

  raycastBlocks(o, d, maxDist) {
    let best = null;
    this.blocks.forEach((b, idx) => {
      if (b.ver && !(b.ver & this.curVer)) return;
      const r = Math.hypot(b.sx, b.sy, b.sz);
      const cx = b.x - o[0], cy = b.y + b.sy / 2 - o[1], cz = b.z - o[2];
      const tc = cx * d[0] + cy * d[1] + cz * d[2];
      if (tc < -r || tc > maxDist + r) return;
      const perp2 = cx * cx + cy * cy + cz * cz - tc * tc;
      if (perp2 > r * r) return;
      const h = this.raycastBlock(b, o, d);
      if (h && h.t <= maxDist && (!best || h.t < best.t)) best = { ...h, idx, block: b };
    });
    return best;
  }

  // Objets vus comme des cylindres verticaux (tronc / silhouette)
  raycastObjects(o, d, maxDist, wide) {
    let best = null;
    const dh = Math.hypot(d[0], d[2]) || 1e-6;
    this.forObjectsNearRay(o, d, maxDist, (ob, idx) => {
      const t = OBJ_TYPES[ob.t];
      if (t.animal || !this.live(ob)) return;
      const spr = ATLAS.sprites[t.spr[ob.v % t.spr.length]];
      const w = ob.h * spr.aspect;
      const r = wide ? Math.max(0.35, w * 0.3) : Math.max(0.2, objRadius(t, ob) || w * 0.2);
      const cx = ob.x - o[0], cz = ob.z - o[2];
      const tc = (cx * d[0] + cz * d[2]) / (dh * dh);
      if (tc < 0 || tc > maxDist) return;
      const px = d[0] * tc - cx, pz = d[2] * tc - cz;
      if (px * px + pz * pz > r * r) return;
      const y = o[1] + d[1] * tc, oy = this.objectY(ob);
      if (y < oy - 0.2 || y > oy + ob.h) return;
      if (!best || tc < best.t) best = { t: tc, idx, obj: ob, x: o[0] + d[0] * tc, y, z: o[2] + d[2] * tc };
    });
    return best;
  }
}

// ---------------------------------------------------------------------------
//  Sérialisation JSON (export / import)
// ---------------------------------------------------------------------------
const WORLD_FORMAT = 'prairie-world';

function worldToJSON(w) {
  const h16 = new Int16Array(w.heights.length);
  for (let k = 0; k < h16.length; k++) h16[k] = clamp(Math.round(w.heights[k] * 100), -32768, 32767);
  const r2 = (v) => Math.round(v * 100) / 100;
  return {
    format: WORLD_FORMAT,
    version: 1,
    genVersion: w.genVersion || 1,
    weather: w.weather || 'auto',
    pois: w.pois.map((p) => ({ name: p.name, kind: p.kind, x: r2(p.x), z: r2(p.z), r: r2(p.r) })),
    name: w.name,
    seed: w.seed,
    size: w.N,
    cellSize: w.cell,
    waterLevel: r2(w.waterLevel),
    time: r2(w.time),
    dayLength: w.dayLength,
    spawn: { x: r2(w.spawn.x), y: r2(w.spawn.y), z: r2(w.spawn.z), yaw: r2(w.spawn.yaw) },
    materials: MATERIALS.map((m) => m.id),
    heights: bytesToB64(new Uint8Array(h16.buffer)),
    terrain: bytesToB64(w.mats),
    objects: w.objects.map((o) => {
      const a = [OBJ_TYPES[o.t].id, r2(o.x), r2(o.z), r2(o.h), o.f ? 1 : 0, o.v | 0];
      if (o.y !== undefined) a.push(r2(o.y));
      return a;
    }),
    blocks: w.blocks.map((b) => {
      const a = [r2(b.x), r2(b.y), r2(b.z), r2(b.sx), r2(b.sy), r2(b.sz), Math.round(b.r * 1000) / 1000, MATERIALS[b.m].id];
      if (b.sh) a.push(b.sh);
      return a;
    }),
  };
}

function worldFromJSON(data) {
  if (!data || data.format !== WORLD_FORMAT) throw new Error("Ce fichier n'est pas un monde Prairie.");
  const N = data.size | 0, cell = +data.cellSize || 2;
  if (N < 16 || N > 1024) throw new Error('Taille de monde invalide.');
  const w = new World(N, cell);
  w.name = String(data.name || 'Monde importé').slice(0, 60);
  w.seed = data.seed | 0;
  w.waterLevel = +data.waterLevel || 0;
  w.time = clamp(+data.time || 0.32, 0, 1);
  w.dayLength = clamp(+data.dayLength || 600, 30, 7200);
  const hb = b64ToBytes(data.heights);
  if (hb.length !== w.W * w.W * 2) throw new Error('Données de relief corrompues.');
  const h16 = new Int16Array(hb.buffer, hb.byteOffset, w.W * w.W);
  for (let k = 0; k < h16.length; k++) w.heights[k] = h16[k] / 100;
  const tb = b64ToBytes(data.terrain);
  if (tb.length !== w.W * w.W) throw new Error('Données de terrain corrompues.');
  const matIds = Array.isArray(data.materials) ? data.materials : MATERIALS.map((m) => m.id);
  const remap = matIds.map((id) => { const k = MATERIALS.findIndex((m) => m.id === id); return k < 0 ? 0 : k; });
  for (let k = 0; k < tb.length; k++) w.mats[k] = remap[tb[k]] ?? 0;
  for (const a of data.objects || []) {
    const t = OBJ_INDEX[a[0]];
    if (t === undefined) continue;
    const o = { t, x: +a[1], z: +a[2], h: +a[3], f: a[4] ? 1 : 0, v: a[5] | 0 };
    if (a.length > 6 && a[6] !== null) o.y = +a[6];
    if (!isFinite(o.x) || !isFinite(o.z) || !isFinite(o.h)) continue;
    w.objects.push(o);
  }
  for (const a of data.blocks || []) {
    const m = MATERIALS.findIndex((mm) => mm.id === a[7]);
    const b = { x: +a[0], y: +a[1], z: +a[2], sx: +a[3], sy: +a[4], sz: +a[5], r: +a[6] || 0, m: m < 0 ? M_STONE : m, sh: clamp(a[8] | 0, 0, SHAPES.length - 1) };
    if ([b.x, b.y, b.z, b.sx, b.sy, b.sz].every(isFinite)) w.blocks.push(b);
  }
  w.genVersion = data.genVersion | 0 || 1;
  w.weather = ['auto', 'clear', 'cloudy', 'rain', 'storm'].includes(data.weather) ? data.weather : 'auto';
  w.pois = (Array.isArray(data.pois) ? data.pois : []).filter((p) => p && isFinite(p.x) && isFinite(p.z))
    .map((p) => ({ name: String(p.name || '').slice(0, 60), kind: String(p.kind || ''), x: +p.x, z: +p.z, r: +p.r || 20 }));
  const s = data.spawn || {};
  w.spawn = { x: +s.x || w.size / 2, y: +s.y || 0, z: +s.z || w.size / 2, yaw: +s.yaw || 0 };
  return w;
}
