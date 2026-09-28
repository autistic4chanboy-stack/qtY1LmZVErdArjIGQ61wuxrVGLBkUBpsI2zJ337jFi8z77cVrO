// ============================================================================
//  CONSTRUCTIONS : maisons, villages, ville fortifiée, mine
// ============================================================================

const NAME_A = ['Beau', 'Clair', 'Mont', 'Val', 'Roche', 'Bois', 'Haute', 'Fonte', 'Gris', 'Blanc', 'Vieux', 'Saule', 'Chêne', 'Mer'];
const NAME_B = ['pré', 'fleuri', 'combe', 'vallon', 'mont', 'lac', 'bourg', 'ville', 'fort', 'brume', 'val', 'roche', 'fontaine', 'lieu'];

class Builder {
  constructor(w, rnd, reserved) {
    this.w = w; this.rnd = rnd; this.reserved = reserved;
    this.pois = []; this.names = new Set();
  }
  name() {
    for (let k = 0; k < 30; k++) {
      const a = NAME_A[(this.rnd() * NAME_A.length) | 0], b = NAME_B[(this.rnd() * NAME_B.length) | 0];
      const n = a + b;
      if (a.toLowerCase() === b || a.toLowerCase().startsWith(b.slice(0, 3))) continue;
      if (!this.names.has(n) && n.length > 5) { this.names.add(n); return n; }
    }
    return 'Lieu-dit';
  }
  toWorld(f, lx, lz) { const c = Math.cos(f.r), s = Math.sin(f.r); return [f.x + lx * c + lz * s, f.z - lx * s + lz * c]; }
  toLocal(f, x, z) { const c = Math.cos(f.r), s = Math.sin(f.r), dx = x - f.x, dz = z - f.z; return [dx * c - dz * s, dx * s + dz * c]; }
  block(f, lx, ly, lz, sx, sy, sz, m, er = 0, sh = 0) {
    const [x, z] = this.toWorld(f, lx, lz);
    this.w.blocks.push({ x, y: f.y + ly, z, sx, sy, sz, r: f.r + er, m, sh });
  }
  obj(id, x, z, h, extra) {
    const t = OBJ_INDEX[id], T = OBJ_TYPES[t];
    const o = { t, x, z, h: h || lerp(T.h[0], T.h[1], this.rnd()), f: this.rnd() < 0.5 ? 1 : 0, v: (this.rnd() * T.spr.length) | 0 };
    if (extra) Object.assign(o, extra);
    this.w.objects.push(o);
    return o;
  }
  objRel(f, id, lx, lz, h, extra) { const [x, z] = this.toWorld(f, lx, lz); return this.obj(id, x, z, h, extra); }

  // --------------------------------------------------------------- terrain
  forVerts(cx, cz, R, fn) {
    const w = this.w, c = w.cell, N = w.N;
    for (let j = Math.max(0, Math.floor((cz - R) / c)); j <= Math.min(N, Math.ceil((cz + R) / c)); j++)
      for (let i = Math.max(0, Math.floor((cx - R) / c)); i <= Math.min(N, Math.ceil((cx + R) / c)); i++) fn(i, j, j * w.W + i, i * c, j * c);
  }
  flatten(cx, cz, r, target, fall) {
    const H = this.w.heights;
    this.forVerts(cx, cz, r + fall, (i, j, k, x, z) => {
      const t = 1 - smoothstep(r, r + fall, Math.hypot(x - cx, z - cz));
      if (t > 0) H[k] = lerp(H[k], target, t);
    });
  }
  flattenRect(f, hw, hd, target, fall) {
    const H = this.w.heights;
    this.forVerts(f.x, f.z, Math.hypot(hw, hd) + fall, (i, j, k, x, z) => {
      const [lx, lz] = this.toLocal(f, x, z);
      const d = Math.max(Math.abs(lx) - hw, Math.abs(lz) - hd, 0);
      const t = 1 - smoothstep(0, fall, d);
      if (t > 0) H[k] = lerp(H[k], target, t);
    });
  }
  paintDisk(cx, cz, r, mat, ragged, reserve) {
    this.forVerts(cx, cz, r + 3, (i, j, k, x, z) => {
      const d = Math.hypot(x - cx, z - cz) + (ragged ? (hash2i(i, j, 7) - 0.5) * ragged : 0);
      if (d < r) { if (mat >= 0) this.w.mats[k] = mat; if (reserve) this.reserved[k] = 1; }
    });
  }
  paintRect(f, lx0, lz0, hw, hd, mat, reserve) {
    const [cx, cz] = this.toWorld(f, lx0, lz0);
    this.forVerts(cx, cz, Math.hypot(hw, hd) + 2, (i, j, k, x, z) => {
      const [lx, lz] = this.toLocal(f, x, z);
      if (Math.abs(lx - lx0) <= hw && Math.abs(lz - lz0) <= hd) { if (mat >= 0) this.w.mats[k] = mat; if (reserve) this.reserved[k] = 1; }
    });
  }
  paintLine(x0, z0, x1, z1, width, mat) {
    const dx = x1 - x0, dz = z1 - z0, L2 = dx * dx + dz * dz || 1;
    this.forVerts((x0 + x1) / 2, (z0 + z1) / 2, Math.sqrt(L2) / 2 + width + 2, (i, j, k, x, z) => {
      const t = clamp(((x - x0) * dx + (z - z0) * dz) / L2, 0, 1);
      if (Math.hypot(x - (x0 + dx * t), z - (z0 + dz * t)) < width && this.w.heights[k] > this.w.waterLevel + 0.2) { this.w.mats[k] = mat; this.reserved[k] = 1; }
    });
  }

  // --------------------------------------------------------------- bâtiments
  // Maison : largeur W (x local), profondeur D (z local), porte côté -z
  house(f, W, D, o = {}) {
    const H = o.floors === 3 ? 8.4 : o.floors === 2 ? 5.6 : 2.9, t = 0.3;
    const wall = o.wall ?? M_TIMBER, win = o.win ?? M_TIMBERWIN, roof = o.roof ?? M_THATCH;
    this.paintRect(f, 0, 0, W / 2 + 0.4, D / 2 + 0.4, M_DIRT, true);
    this.block(f, 0, -1.2, 0, W + 0.2, 1.25, D + 0.2, o.found ?? M_STONE);
    this.block(f, 0, 0.05, 0, W - 0.3, 0.1, D - 0.3, o.floor ?? M_PLANKS);
    this.block(f, 0, 0, D / 2 - t / 2, W, H, t, win);
    this.block(f, -W / 2 + t / 2, 0, 0, t, H, D - 2 * t, D >= 4.5 ? win : wall);
    this.block(f, W / 2 - t / 2, 0, 0, t, H, D - 2 * t, D >= 4.5 ? win : wall);
    const dw = o.dw || 1.3, dh = o.dh || 2.25, dx = o.doorX || 0;
    const lw = W / 2 + dx - dw / 2, rw = W / 2 - dx - dw / 2;
    if (lw > 0.05) this.block(f, -W / 2 + lw / 2, 0, -D / 2 + t / 2, lw, H, t, lw >= 2.5 ? win : wall);
    if (rw > 0.05) this.block(f, W / 2 - rw / 2, 0, -D / 2 + t / 2, rw, H, t, rw >= 2.5 ? win : wall);
    this.block(f, dx, dh, -D / 2 + t / 2, dw, H - dh, t, wall);
    if (H > 3.2 && o.ceiling !== false) this.block(f, 0, 2.95, 0, W - 2 * t + 0.02, 0.16, D - 2 * t + 0.02, o.floor ?? M_PLANKS); // plafond du rez-de-chaussée
    const rh = o.roofH ?? Math.min(3.2, D * 0.5);
    this.block(f, 0, H, 0, W + 0.9, rh, D + 1.0, roof, 0, 1);
    this.block(f, 0, H, 0, W - 0.1, rh * D / (D + 1.0) - 0.08, D - 0.02, wall, 0, 1);
    if (o.chimney) this.block(f, W / 2 - 1.1, H - 0.2, D / 5, 0.7, rh + 0.9, 0.7, M_BRICK);
    if (o.lantern) this.objRel(f, 'lantern', 0, 0.3, 0.7, { y: f.y + Math.min(H, 2.9) - 0.9 });
    if (o.props) {
      this.block(f, -W / 2 + 1.1, 0.15, D / 2 - 1.0, 1.4, 0.8, 0.9, M_PLANKS);
      this.objRel(f, 'barrel', W / 2 - 0.8, D / 2 - 0.8, 1.2, { y: f.y + 0.15 });
    }
    return { door: this.toWorld(f, dx, -D / 2 - 1.0), f, W, D, dx, dw, dh, H, t };
  }
  well(f) {
    const s = 1.8, t = 0.3, h = 0.9;
    this.block(f, 0, -0.4, -s / 2 + t / 2, s, h + 0.4, t, M_STONE);
    this.block(f, 0, -0.4, s / 2 - t / 2, s, h + 0.4, t, M_STONE);
    this.block(f, -s / 2 + t / 2, -0.4, 0, t, h + 0.4, s - 2 * t, M_STONE);
    this.block(f, s / 2 - t / 2, -0.4, 0, t, h + 0.4, s - 2 * t, M_STONE);
    this.block(f, 0, 0.2, 0, s - 2 * t, 0.05, s - 2 * t, M_WATERB);
    this.block(f, -s / 2 + 0.12, h, 0, 0.18, 1.6, 0.18, M_LOGS);
    this.block(f, s / 2 - 0.12, h, 0, 0.18, 1.6, 0.18, M_LOGS);
    this.block(f, 0, h + 1.45, 0, s + 0.3, 0.15, 0.15, M_LOGS);
    this.block(f, 0, h + 1.6, 0, s + 0.7, 0.75, 1.5, M_THATCH, 0, 1);
  }
  fence(f, hw, hd) {
    const sides = [[-hw, -hd, hw, -hd], [hw, -hd, hw, hd], [hw, hd, -hw, hd], [-hw, hd, -hw, -hd]];
    for (const [x0, z0, x1, z1] of sides) {
      const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L / 2.4)), ang = Math.atan2(x1 - x0, z1 - z0);
      for (let k = 0; k < n; k++) this.block(f, lerp(x0, x1, k / n), -0.3, lerp(z0, z1, k / n), 0.18, 1.5, 0.18, M_LOGS);
      this.block(f, (x0 + x1) / 2, 0.5, (z0 + z1) / 2, 0.08, 0.12, L, M_PLANKS, ang);
      this.block(f, (x0 + x1) / 2, 1.0, (z0 + z1) / 2, 0.08, 0.12, L, M_PLANKS, ang);
    }
  }
  stall(f) {
    for (const [lx, lz] of [[-1.4, -0.9], [1.4, -0.9], [-1.4, 0.9], [1.4, 0.9]]) this.block(f, lx, 0, lz, 0.14, 2.4, 0.14, M_LOGS);
    this.block(f, 0, 2.4, 0, 3.4, 0.55, 2.5, M_CLOTH, 0, 1);
    this.block(f, 0, 0, -0.55, 2.8, 0.9, 0.7, M_PLANKS);
    this.objRel(f, 'produce', -0.7, -0.55, 0.7, { y: f.y + 0.9 });
    this.objRel(f, 'produce', 0.7, -0.55, 0.7, { y: f.y + 0.9 });
  }
  fountain(f) {
    const s = 5, t = 0.45, h = 0.7;
    this.block(f, 0, -0.4, -s / 2 + t / 2, s, h + 0.4, t, M_STONE);
    this.block(f, 0, -0.4, s / 2 - t / 2, s, h + 0.4, t, M_STONE);
    this.block(f, -s / 2 + t / 2, -0.4, 0, t, h + 0.4, s - 2 * t, M_STONE);
    this.block(f, s / 2 - t / 2, -0.4, 0, t, h + 0.4, s - 2 * t, M_STONE);
    this.block(f, 0, 0.3, 0, s - 2 * t, 0.06, s - 2 * t, M_WATERB);
    this.block(f, 0, 0, 0, 0.8, 1.9, 0.8, M_STONE);
    this.block(f, 0, 1.9, 0, 1.9, 0.35, 1.9, M_STONE);
    this.block(f, 0, 2.25, 0, 1.5, 0.05, 1.5, M_WATERB);
  }
  // Église : nef le long de z local, clocher côté porte (-z)
  church(f) {
    const W = 10, D = 18, H = 7, t = 0.5;
    this.block(f, 0, -1.5, 0, W + 0.4, 1.55, D + 0.4, M_STONE);
    this.block(f, 0, 0.05, 0, W - 0.6, 0.1, D - 0.6, M_COBBLE);
    this.block(f, 0, 0, D / 2 - t / 2, W, H, t, M_STONE);
    this.block(f, -W / 2 + t / 2, 0, 0, t, H, D - 2 * t, M_STONEWIN);
    this.block(f, W / 2 - t / 2, 0, 0, t, H, D - 2 * t, M_STONEWIN);
    this.block(f, -3.05, 0, -D / 2 + t / 2, 3.9, H, t, M_STONE);
    this.block(f, 3.05, 0, -D / 2 + t / 2, 3.9, H, t, M_STONE);
    this.block(f, 0, 3.6, -D / 2 + t / 2, 2.2, H - 3.6, t, M_STONE);
    this.block(f, 0, 2.2, D / 2 + 0.03, 3.2, 4.2, 0.12, M_GLASS);
    this.block(f, 0, H, 0, D + 1.0, 4.6, W + 1.2, M_SLATE, Math.PI / 2, 1);
    this.block(f, 0, H, 0, D - 0.05, 4.6 * W / (W + 1.2) - 0.1, W - 0.05, M_STONE, Math.PI / 2, 1);
    // clocher
    const tz = -D / 2 - 2.6, T = 5.2, TH = 16;
    this.block(f, 0, -1.5, tz, T + 0.3, 1.55, T + 0.3, M_STONE);
    this.block(f, -1.8, 0, tz - T / 2 + 0.3, 1.6, TH, 0.6, M_STONE);
    this.block(f, 1.8, 0, tz - T / 2 + 0.3, 1.6, TH, 0.6, M_STONE);
    this.block(f, -T / 2 + 0.3, 0, tz, 0.6, TH, T - 1.2, M_STONEWIN);
    this.block(f, T / 2 - 0.3, 0, tz, 0.6, TH, T - 1.2, M_STONEWIN);
    this.block(f, 0, 3.2, tz - T / 2 + 0.3, 2.0, TH - 3.2, 0.6, M_STONE);
    this.block(f, 0, 7.5, tz - T / 2 - 0.05, 1.8, 2.8, 0.12, M_GLASS);
    this.block(f, 0, TH, tz, T + 0.6, 0.4, T + 0.6, M_STONE);
    this.block(f, 0, TH + 0.4, tz, T + 0.2, 8, T + 0.2, M_SLATE, 0, 3);
    // bancs + autel + lanternes
    for (let k = 0; k < 5; k++) for (const s of [-1, 1]) this.block(f, s * 2.4, 0.15, -4 + k * 2.2, 3, 0.5, 0.5, M_PLANKS);
    this.block(f, 0, 0.15, D / 2 - 2, 2.4, 1.0, 1.0, M_STONE);
    this.objRel(f, 'lantern', -3, 2, 0.7, { y: f.y + 4.5 });
    this.objRel(f, 'lantern', 3, 2, 0.7, { y: f.y + 4.5 });
    return { door: this.toWorld(f, 0, tz - T / 2 - 1.5) };
  }

  // --------------------------------------------------------------- village
  village(site) {
    const B = this, rnd = this.rnd, w = this.w, { x, z } = site, y0 = site.y, name = this.name();
    this.flatten(x, z, 24, y0, 16);
    this.paintDisk(x, z, 7.5, M_DIRT, 2.5, true);
    this.paintDisk(x, z, 38, -1, 0, true);
    this.well({ x, y: w.heightAt(x, z), z, r: rnd() * TAU });
    this.obj('lamp', x + 4.5, z + 3, 4.2); this.obj('lamp', x - 4.5, z - 3, 4.2);
    const n = 6 + ((rnd() * 3) | 0), a0 = rnd() * TAU;
    for (let k = 0; k < n; k++) {
      const a = a0 + (k / n) * TAU + (rnd() - 0.5) * 0.25, dist = 16 + rnd() * 4;
      const hx = x + Math.cos(a) * dist, hz = z + Math.sin(a) * dist;
      const W = 5 + ((rnd() * 5) | 0) * 0.5, D = 4.5 + ((rnd() * 3) | 0) * 0.5, hy = w.heightAt(hx, hz);
      this.flatten(hx, hz, Math.max(W, D) * 0.6 + 1, hy, 4);
      const f = { x: hx, y: hy, z: hz, r: Math.atan2(-(x - hx), -(z - hz)) };
      const res = this.house(f, W, D, { floors: rnd() < 0.25 ? 2 : 1, chimney: rnd() < 0.6, lantern: rnd() < 0.75, props: rnd() < 0.6, roof: rnd() < 0.7 ? M_THATCH : M_ROOF });
      this.paintLine(res.door[0], res.door[1], x, z, 1.1, M_DIRT);
      if (this.onHouse) this.onHouse(f, W, D, res);
      const pr = ['woodpile', 'hay', 'cart', 'barrel', 'woodpile'][(rnd() * 5) | 0];
      this.objRel(f, pr, (W / 2 + 1.4) * (rnd() < 0.5 ? -1 : 1), (rnd() - 0.5) * D);
    }
    for (let k = 0; k < 6; k++) this.obj('hen', x + (rnd() - 0.5) * 12, z + (rnd() - 0.5) * 12);
    // enclos avec moutons ou vaches
    const ea = a0 + Math.PI / n, ex = x + Math.cos(ea) * 33, ez = z + Math.sin(ea) * 33;
    const ef = { x: ex, y: w.heightAt(ex, ez), z: ez, r: ea };
    this.flatten(ex, ez, 10, ef.y, 6);
    this.paintDisk(ex, ez, 12, -1, 0, true);
    this.fence(ef, 8, 6);
    const sheep = rnd() < 0.6;
    for (let k = 0; k < (sheep ? 5 : 3); k++) this.objRel(ef, sheep ? 'sheep' : 'cow', (rnd() - 0.5) * 11, (rnd() - 0.5) * 7);
    this.objRel(ef, 'hay', 6, 4, 1.1);
    // porcherie
    const pa = ea + 0.55, px = x + Math.cos(pa) * 30, pz = z + Math.sin(pa) * 30;
    const pf = { x: px, y: w.heightAt(px, pz), z: pz, r: pa };
    this.flatten(px, pz, 5, pf.y, 4);
    this.paintDisk(px, pz, 5, M_DIRT, 2, true);
    this.fence(pf, 3, 2.4);
    this.objRel(pf, 'pig', -1, 0); this.objRel(pf, 'pig', 1, 0.5);
    // champ de blé et épouvantail
    const fa = ea + Math.PI * (0.8 + rnd() * 0.5), fx = x + Math.cos(fa) * 36, fz = z + Math.sin(fa) * 36;
    const ff = { x: fx, y: w.heightAt(fx, fz), z: fz, r: fa };
    this.flatten(fx, fz, 10, ff.y, 8);
    this.paintRect(ff, 0, 0, 8.5, 5.5, M_DIRT, true);
    this.paintDisk(fx, fz, 12, -1, 0, true);
    for (let u = -7.6; u <= 7.6; u += 0.8) for (let v = -4.6; v <= 4.6; v += 0.72) {
      if (Math.abs(u) < 0.8 && Math.abs(v) < 0.8) continue;
      this.objRel(ff, 'wheat', u + (rnd() - 0.5) * 0.25, v + (rnd() - 0.5) * 0.2);
    }
    this.objRel(ff, 'scarecrow', 0, 0);
    this.pois.push({ name: 'Village de ' + name, kind: 'village', x, z, r: 36 });
    return { x, z, r: 48 };
  }

  // --------------------------------------------------------------- ville fortifiée
  townWalls(f, half) {
    const H = 5.5, T = 1.2, gate = 7, y0 = -3;
    for (let s = 0; s < 4; s++) {
      const sf = { x: f.x, y: f.y, z: f.z, r: f.r + s * Math.PI / 2 };
      for (const [u0, u1] of [[-half, -gate / 2 - 3.2], [gate / 2 + 3.2, half]]) {
        const L = u1 - u0, n = Math.ceil(L / 12);
        for (let k = 0; k < n; k++) {
          const a = u0 + (L * k) / n, b = u0 + (L * (k + 1)) / n;
          this.block(sf, (a + b) / 2, y0, half, b - a + 0.02, H - y0, T, M_STONE);
          this.block(sf, (a + b) / 2, H, half, b - a + 0.02, 0.4, T + 0.3, M_STONE);
        }
      }
      this.block(sf, 0, 4.4, half, gate + 0.2, H - 4.4 + 0.8, T + 0.3, M_STONE);
      for (const u of [-gate / 2 - 1.6, gate / 2 + 1.6]) {
        this.block(sf, u, y0, half, 3.2, 7.8 - y0, 3.2, M_STONE);
        this.block(sf, u, 7.8, half, 3.8, 3, 3.8, M_SLATE, 0, 3);
      }
      this.block(sf, half, y0, half, 5, 9.5 - y0, 5, M_STONE);
      this.block(sf, half, 9.5, half, 5.8, 4.5, 5.8, M_SLATE, 0, 3);
    }
  }
  town(site) {
    const rnd = this.rnd, w = this.w, half = 56, name = this.name();
    const f = { x: site.x, y: site.y, z: site.z, r: rnd() * TAU };
    this.flattenRect(f, half + 4, half + 4, f.y, 24);
    this.paintRect(f, 0, 0, half + 16, half + 16, -1, true);
    this.paintRect(f, 0, 0, half + 5, 3.6, M_COBBLE);
    this.paintRect(f, 0, 0, 3.6, half + 5, M_COBBLE);
    const ring = half - 7;
    for (const s of [-1, 1]) { this.paintRect(f, 0, s * ring, ring + 2.6, 2.6, M_COBBLE); this.paintRect(f, s * ring, 0, 2.6, ring + 2.6, M_COBBLE); }
    this.paintRect(f, 0, 0, 13, 13, M_COBBLE);
    this.townWalls(f, half);
    this.fountain({ x: f.x, y: f.y, z: f.z, r: f.r });
    for (const [lx, lz, a] of [[-9, -9, 0], [9, -9, 0], [-9, 9, Math.PI], [9, 9, Math.PI], [-10.5, 0, Math.PI / 2], [10.5, 0, -Math.PI / 2]]) {
      const [sx, sz] = this.toWorld(f, lx, lz);
      this.stall({ x: sx, y: f.y, z: sz, r: f.r + a + (lz === 0 ? 0 : Math.PI) });
    }
    const doors = [];
    const cq = [(rnd() < 0.5 ? -1 : 1), (rnd() < 0.5 ? -1 : 1)];
    // église dans un quartier
    {
      const [cx, cz] = this.toWorld(f, cq[0] * 30, cq[1] * 29);
      const res = this.church({ x: cx, y: f.y, z: cz, r: f.r + Math.atan2(cq[0], 0) });
      doors.push(res.door);
      for (let k = 0; k < 7; k++) this.objRel(f, 'tomb', cq[0] * (22 + k * 2.6), cq[1] * (39 + (k % 2) * 2.2), 1.0);
    }
    const styles = [
      { wall: M_TIMBER, win: M_TIMBERWIN, roof: M_ROOF }, { wall: M_STONE, win: M_STONEWIN, roof: M_SLATE },
      { wall: M_BRICK, win: M_STONEWIN, roof: M_SLATE }, { wall: M_PLASTER, win: M_TIMBERWIN, roof: M_ROOF },
      { wall: M_TIMBER, win: M_TIMBERWIN, roof: M_SLATE },
    ];
    for (const qx of [-1, 1]) for (const qz of [-1, 1]) {
      for (const u of [9.5, 22.5, 36]) for (const v of [9.5, 22.5, 36]) {
        if (u < 14 && v < 14) continue;
        if (qx === cq[0] && qz === cq[1] && u > 14 && v > 14) continue;
        if (rnd() < 0.08) continue;
        const cands = [[v - 3.6, 0, -qz], [u - 3.6, -qx, 0], [ring - 2.6 - v, 0, qz], [ring - 2.6 - u, qx, 0]];
        cands.sort((a, b) => a[0] - b[0]);
        const [, ddx, ddz] = cands[0];
        const W = 8 + rnd() * 2, D = 8 + rnd() * 1.8;
        const [bx, bz] = this.toWorld(f, qx * u, qz * v);
        const bf = { x: bx, y: f.y, z: bz, r: f.r + Math.atan2(-ddx, -ddz) };
        const st = styles[(rnd() * styles.length) | 0];
        const res = this.house(bf, W, D, { floors: rnd() < 0.55 ? 2 : 3, wall: st.wall, win: st.win, roof: st.roof, chimney: rnd() < 0.5, lantern: rnd() < 0.6, props: rnd() < 0.5, roofH: 3 });
        doors.push(res.door);
        if (this.onHouse) this.onHouse(bf, W, D, res);
        if (rnd() < 0.4) this.obj(rnd() < 0.5 ? 'barrel' : 'produce', res.door[0] + (rnd() - 0.5) * 3, res.door[1] + (rnd() - 0.5) * 1.5);
      }
    }
    // lampadaires le long des rues principales
    for (let u = -half + 10; u <= half - 10; u += 14) {
      if (Math.abs(u) < 15) continue;
      for (const s of [-1, 1]) { this.objRel(f, 'lamp', u, s * 4.4, 4.2); this.objRel(f, 'lamp', s * 4.4, u, 4.2); }
    }
    for (let k = 0; k < 4; k++) this.objRel(f, 'hen', (rnd() - 0.5) * 20, (rnd() - 0.5) * 20);
    // enclos des chevaux devant la porte est
    const [hx, hz] = this.toWorld(f, half + 16, 12);
    const hf = { x: hx, y: w.heightAt(hx, hz), z: hz, r: f.r };
    this.flatten(hx, hz, 10, hf.y, 6);
    this.paintDisk(hx, hz, 11, -1, 0, true);
    this.fence(hf, 7, 5.5);
    for (let k = 0; k < 3; k++) this.objRel(hf, 'horse', (rnd() - 0.5) * 9, (rnd() - 0.5) * 6);
    this.objRel(hf, 'hay', -5, 3.5, 1.1); this.objRel(hf, 'hay', -3.6, 3.8, 1.05);
    this.pois.push({ name: 'Ville de ' + name, kind: 'town', x: f.x, z: f.z, r: half + 6 });
    const gates = [[half + 8, 0], [-half - 8, 0], [0, half + 8], [0, -half - 8]].map(([a, b]) => this.toWorld(f, a, b));
    return { x: f.x, z: f.z, r: half * 1.45 + 12, gates };
  }

  // --------------------------------------------------------------- mine
  mine(site) {
    const rnd = this.rnd, w = this.w, name = this.name();
    const f = { x: site.x, y: site.y, z: site.z, r: site.dir }; // +z local = vers la colline
    const L = 26, W = 4, Ht = 3.2, CH = 10;
    const [yx, yz] = this.toWorld(f, 0, -9);
    this.flatten(yx, yz, 11, f.y, 7);
    // relief au-dessus du tunnel (après la cour, avant creusement) : moyenne le long de chaque tronçon
    const segTop = [];
    for (let z0 = -1; z0 < L + CH; z0 += 4) {
      let sum = 0, n = 0;
      for (let dz = 0; dz <= 4; dz += 1) for (let dx = -3; dx <= 3; dx += 1.5) { const [px, pz] = this.toWorld(f, dx, z0 + dz); sum += w.heightAt(px, pz); n++; }
      segTop.push(sum / n);
    }
    // creusement du tunnel et de la salle
    this.forVerts(f.x, f.z, L + CH + 8, (i, j, k, x, z) => {
      const [lx, lz] = this.toLocal(f, x, z);
      const inT = Math.abs(lx) < W / 2 + 2.1 && lz > -3 && lz < L + 1, inC = Math.abs(lx) < CH / 2 + 1.4 && lz >= L && lz < L + CH + 1.2;
      if (inT || inC) { w.heights[k] = Math.min(w.heights[k], f.y - 0.05); w.mats[k] = M_DIRT; this.reserved[k] = 1; }
    });
    this.paintRect(f, 0, -9, 11, 11, M_DIRT, true);
    this.paintDisk(yx, yz, 24, -1, 0, true);
    // galerie : parois, voûte (segments qui se chevauchent), étais, lanternes
    let si = 0;
    for (let z0 = -1; z0 < L + 1; z0 += 4, si++) {
      const zc = z0 + 2, top = segTop[si];
      this.block(f, -W / 2 - 0.5, -0.6, zc, 1, Ht + 0.6, 4.05, rnd() < 0.35 ? M_ORE : M_ROCK);
      this.block(f, W / 2 + 0.5, -0.6, zc, 1, Ht + 0.6, 4.05, rnd() < 0.35 ? M_ORE : M_ROCK);
      const th = Math.max(1.3, top - (f.y + Ht) + 0.25) + si * 0.03;
      this.block(f, 0, Ht + (si % 2) * 0.02, zc + 1, W + 4.4 + (si % 2) * 0.06, th, 6, M_ROCK);
      this.block(f, -W / 2 + 0.2, 0, zc - 1.8, 0.3, Ht, 0.3, M_LOGS);
      this.block(f, W / 2 - 0.2, 0, zc - 1.8, 0.3, Ht, 0.3, M_LOGS);
      this.block(f, 0, Ht - 0.35, zc - 1.8, W, 0.35, 0.35, M_LOGS);
      if (si % 2 === 0) this.objRel(f, 'lantern', W / 2 - 0.55, zc - 1.5, 0.7, { y: f.y + Ht - 1.05 });
    }
    // salle aux cristaux
    const cz = L + CH / 2, topC = Math.max(...segTop.slice(-3));
    this.block(f, -CH / 2 - 0.5, -0.6, cz, 1, Ht + 1.6, CH + 1, M_ORE);
    this.block(f, CH / 2 + 0.5, -0.6, cz, 1, Ht + 1.6, CH + 1, M_ORE);
    this.block(f, 0, -0.6, L + CH + 0.5, CH + 2, Ht + 1.6, 1, M_ORE);
    this.block(f, -CH / 4 - 1.2, -0.6, L - 0.45, CH / 2 - 2.4, Ht + 1.6, 0.9, M_ROCK);
    this.block(f, CH / 4 + 1.2, -0.6, L - 0.45, CH / 2 - 2.4, Ht + 1.6, 0.9, M_ROCK);
    this.block(f, 0, Ht + 1, cz + 0.5, CH + 3, Math.max(1.4, topC - (f.y + Ht + 1) + 0.3), CH + 2, M_ROCK);
    for (const [lx, lz] of [[-3.8, 2.5], [3.6, 4.5], [-2.6, 8.5], [3.2, 8.8], [0.5, 9.3]]) this.objRel(f, 'crystal', lx, L + lz);
    this.objRel(f, 'orepile', -3, L + 6); this.objRel(f, 'orepile', 2.5, L + 2);
    this.objRel(f, 'minecart', 0, L + 3.5, 1.1, { y: f.y + 0.04 });
    // rails + wagonnets
    this.block(f, 0, -0.03, (L - 16) / 2, 1.2, 0.06, L + 16, M_RAILS);
    this.objRel(f, 'minecart', 0, -12, 1.1, { y: f.y + 0.03 });
    this.objRel(f, 'minecart', 0, 10, 1.1, { y: f.y + 0.03 });
    // entrée
    this.block(f, -W / 2 - 0.3, 0, -1.4, 0.6, Ht + 0.6, 0.6, M_LOGS);
    this.block(f, W / 2 + 0.3, 0, -1.4, 0.6, Ht + 0.6, 0.6, M_LOGS);
    this.block(f, 0, Ht + 0.2, -1.4, W + 1.8, 0.65, 0.7, M_LOGS);
    this.objRel(f, 'sign', W / 2 + 2.2, -3.5);
    this.objRel(f, 'lantern', -W / 2 - 0.3, -2.2, 0.7, { y: f.y + Ht - 0.2 });
    // cour : cabane, caisses, minerai, bois, lampadaires
    const hf = { x: 0, y: 0, z: 0, r: 0 };
    [hf.x, hf.z] = this.toWorld(f, -8.5, -12);
    hf.y = w.heightAt(hf.x, hf.z); hf.r = f.r + Math.PI / 2;
    this.house(hf, 4.6, 4, { wall: M_PLANKS, win: M_PLANKS, roof: M_SLATE, lantern: true, props: true });
    for (const [lx, lz, s] of [[5, -5, 1], [6.1, -5.2, 1], [5.5, -5.1, 0.8]]) this.block(f, lx, s === 0.8 ? 1 : 0, lz, s, s, s, M_CRATE, rnd());
    this.objRel(f, 'orepile', 6, -9); this.objRel(f, 'orepile', 4.5, -11); this.objRel(f, 'woodpile', -4.5, -4.5); this.objRel(f, 'barrel', 7.4, -7);
    this.objRel(f, 'lamp', -3.5, -16, 4.2); this.objRel(f, 'lamp', 4, -16, 4.2);
    // chevalement au-dessus d'un puits
    const [gx, gz] = this.toWorld(f, 7.5, -14.5);
    const gf = { x: gx, y: w.heightAt(gx, gz), z: gz, r: f.r };
    for (const [lx, lz] of [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]]) this.block(gf, lx, -0.3, lz, 0.4, 11.3, 0.4, M_LOGS);
    for (const hy of [5, 10.4]) { this.block(gf, 0, hy, -1.6, 3.6, 0.35, 0.35, M_LOGS); this.block(gf, 0, hy, 1.6, 3.6, 0.35, 0.35, M_LOGS); this.block(gf, -1.6, hy, 0, 0.35, 0.35, 3.6, M_LOGS); this.block(gf, 1.6, hy, 0, 0.35, 0.35, 3.6, M_LOGS); }
    this.block(gf, 0, 11, 0, 4.4, 1.6, 4.4, M_PLANKS, 0, 1);
    this.block(gf, 0, 0.02, 0, 2.8, 0.05, 2.8, M_DARK);
    this.block(gf, 0, 0.9, -1.5, 3, 0.1, 0.1, M_LOGS); this.block(gf, 0, 0.9, 1.5, 3, 0.1, 0.1, M_LOGS);
    this.pois.push({ name: 'Mine de ' + name, kind: 'mine', x: yx, z: yz, r: 24 });
    return { x: yx, z: yz, r: 30, entry: this.toWorld(f, 0, -20) };
  }
}
