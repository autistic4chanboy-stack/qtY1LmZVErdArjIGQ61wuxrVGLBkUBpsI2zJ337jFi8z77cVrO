// ============================================================================
//  CONSTRUCTIONS (AVENTURE) : laboratoire, relais, lieux étranges, caches
// ============================================================================

Object.assign(Builder.prototype, {
  // Point interactif (touche E)
  inter(kind, id, x, y, z, name, data) {
    const w = this.w;
    (w.inter || (w.inter = [])).push({ kind, id, x, y, z, name, data: data || {} });
  },
  interRel(f, kind, id, lx, ly, lz, name, data) { const [x, z] = this.toWorld(f, lx, lz); this.inter(kind, id, x, f.y + ly, z, name, data); },
  crate(f, lx, lz, ly = 0) {
    const id = 'caisse' + (this.crateN = (this.crateN || 0) + 1);
    this.block(f, lx, ly - 0.02, lz, 0.9, 0.9, 0.9, M_CRATE, this.rnd() * 0.5);
    this.interRel(f, 'crate', id, lx, ly + 0.5, lz, 'Fouiller la caisse');
  },
  note(f, lx, lz, text, ly) {
    const id = 'note' + (this.noteN = (this.noteN || 0) + 1);
    this.objRel(f, 'note', lx, lz, ly === undefined ? 1.0 : 0.6, ly === undefined ? undefined : { y: f.y + ly });
    this.interRel(f, 'note', id, lx, (ly ?? 0) + 0.6, lz, 'Lire la note', { text });
  },
  neon(f, lx, lz, H) { this.objRel(f, 'neon', lx, lz, 0.3, { y: f.y + H - 0.35 }); },

  // --------------------------------------------------------------- laboratoire Prairie-7
  lab(site) {
    const rnd = this.rnd, w = this.w, H = 4.6, t = 0.4;
    const f = { x: site.x, y: site.y, z: site.z, r: Math.floor(rnd() * 4) * Math.PI / 2 };
    this.flattenRect(f, 42, 32, f.y, 22);
    this.paintRect(f, 0, 0, 44, 34, M_COBBLE, true);
    this.paintRect(f, 0, 0, 60, 50, -1, true);
    const B = (lx, ly, lz, sx, sy, sz, m, er, sh) => this.block(f, lx, ly, lz, sx, sy, sz, m, er, sh);
    // sol et fondations
    B(0, -1.5, 0, 56.4, 1.55, 36.4, M_CONCRETE);
    B(0, 0.05, 0, 56, 0.1, 36, M_TILE);
    // murs extérieurs
    B(-14.7, 0, -18 + t / 2, 26.6, H, t, M_LABWIN); B(14.7, 0, -18 + t / 2, 26.6, H, t, M_LABWIN); B(0, 2.7, -18 + t / 2, 2.8, H - 2.7, t, M_CONCRETE);
    B(0, 0, 18 - t / 2, 56, H, t, M_LABWIN);
    B(-28 + t / 2, 0, 0, t, H, 36 - 2 * t, M_LABWIN);
    B(28 - t / 2, 0, -14.9, t, H, 5.4, M_CONCRETE); B(28 - t / 2, 0, 3.4, t, H, 28.4, M_LABWIN); B(28 - t / 2, 2.6, -11.3, t, H - 2.6, 1.8, M_CONCRETE);
    // cloisons intérieures (avec portes)
    const wallZ = (x, z0, z1, gaps) => { // mur le long de z en x, gaps = [[a,b],...]
      let c = z0;
      for (const [a, b] of gaps.concat([[z1, z1]])) { if (a - c > 0.05) B(x, 0, (c + a) / 2, 0.25, H, a - c, M_PLASTER); if (b > a) B(x, 2.5, (a + b) / 2, 0.25, H - 2.5, b - a, M_PLASTER); c = b; }
    };
    const wallX = (z, x0, x1, gaps) => {
      let c = x0;
      for (const [a, b] of gaps.concat([[x1, x1]])) { if (a - c > 0.05) B((c + a) / 2, 0, z, a - c, H, 0.25, M_PLASTER); if (b > a) B((a + b) / 2, 2.5, z, b - a, H - 2.5, 0.25, M_PLASTER); c = b; }
    };
    wallZ(-8, -17.6, 17.6, [[-12.4, -10.8], [0, 1.6]]);
    wallZ(8, -17.6, 17.6, [[-12.4, -10.8], [-1, 0.6], [12, 13.6]]);
    wallX(-6, -8, 8, [[-0.9, 0.9]]);
    wallX(8, -8, 8, [[-0.9, 0.9]]);
    wallX(-6, 8, 27.6, [[17, 18.6]]);
    wallX(6, 8, 27.6, [[17, 18.6]]);
    // toit (verrière au-dessus de la serre)
    B(-18, H, 0, 20.4, 0.5, 36.4, M_CONCRETE); B(18, H, 0, 20.4, 0.5, 36.4, M_CONCRETE);
    B(0, H, -5, 16, 0.5, 26.4, M_CONCRETE); B(0, H, 13.1, 16, 0.3, 9.8, M_FROSTED);
    B(0, H + 0.5, -18.2, 57, 0.4, 0.6, M_HAZARD);
    // --- hall
    this.neon(f, -3, -12, H); this.neon(f, 3, -12, H);
    B(-6.6, 0.15, -14, 1.2, 2, 3, M_METAL); B(6.6, 0.15, -14, 1.2, 2, 3, M_METAL);
    B(0, 0.15, -15.6, 1.4, 1.0, 0.8, M_PLANKS);
    this.note(f, 0, -15.6, 0, 1.15);
    // --- salle de contrôle : terminal
    this.neon(f, 0, -1, H); this.neon(f, 0, 4, H);
    B(0, 0.15, 5.6, 4, 0.85, 1.1, M_METAL);
    this.objRel(f, 'monitor', -0.8, 5.6, 0.8, { y: f.y + 1.0 }); this.objRel(f, 'monitor', 0.8, 5.6, 0.8, { y: f.y + 1.0 });
    this.interRel(f, 'terminal', 'terminal', 0, 1.3, 5.2, 'Utiliser le terminal');
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) B(s * 7.2, 0.15, -4 + k * 2.2, 1, 2.4, 0.9, M_METAL);
    this.objRel(f, 'panel', -6.6, 2.5, 0.9, { y: f.y + 1.2 });
    // --- laboratoire de chimie
    for (const lz of [-12, 0, 12]) this.neon(f, -18, lz, H), this.neon(f, -13, lz, H), this.neon(f, -23, lz, H);
    for (const lx of [-22, -14]) {
      B(lx, 0.15, 0, 1.3, 0.8, 22, M_PLASTER);
      for (let k = -9; k <= 9; k += 4.5) this.objRel(f, k % 9 === 0 ? 'alembic' : 'vialshelf', lx, k, k % 9 === 0 ? 1.1 : 0.9, { y: f.y + 0.95 });
    }
    B(-18, 0.15, -13, 3, 1, 2, M_METAL); B(-18, 1.15, -13, 3, 0.1, 2, M_HAZARD);
    this.objRel(f, 'alembic', -18, -13, 1.2, { y: f.y + 1.25 });
    this.interRel(f, 'mixer', 'melangeur', -18, 1.4, -11.9, 'Mélanger des réactifs');
    B(-26.8, 0.15, 12, 1.4, 1, 3, M_METAL);
    this.interRel(f, 'water', 'eau', -26.1, 1.3, 12, 'Remplir des fioles d’eau distillée');
    for (let k = 0; k < 5; k++) this.objRel(f, 'vialshelf', -27.3, -14 + k * 5, 1.9, { y: f.y + 0.15 });
    this.interRel(f, 'stock', 'stock', -26.8, 1.3, -4, 'Inventorier la réserve de réactifs');
    B(-12, 0.15, 16.4, 6, 2.2, 1.2, M_METAL); B(-12, 2.35, 16.4, 6, 0.3, 1.2, M_HAZARD);
    // --- serre
    for (const lx of [-5, 0, 5]) {
      B(lx, 0.15, 13, 1.4, 0.5, 8, M_DIRT);
      for (let k = -3; k <= 3; k += 1.5) this.objRel(f, (k + lx) % 3 === 0 ? 'mushroom' : ['poppies', 'daisies', 'lavender'][(Math.abs(k * 2 + lx) | 0) % 3], lx + (rnd() - 0.5) * 0.4, 13 + k, 0.8, { y: f.y + 0.65, greenhouse: true });
    }
    // --- générateur
    this.neon(f, 18, -12, H); this.neon(f, 24, -12, H);
    B(18, 0.15, -14, 4, 0.3, 3, M_HAZARD); B(18, 0.45, -14, 3.4, 2.3, 2.4, M_METAL);
    B(16.5, 2.75, -14, 0.5, 1.8, 0.5, M_METAL);
    this.objRel(f, 'panel', 18, -12.6, 0.9, { y: f.y + 1.3 });
    this.interRel(f, 'generator', 'generateur', 18, 1.3, -12.3, 'Alimenter le générateur');
    for (let k = 0; k < 3; k++) this.objRel(f, 'barrel', 24 + k * 1.2, -16.5, 1.2, { y: f.y + 0.15 });
    this.objRel(f, 'woodpile', 25, -8, 1.0, { y: f.y + 0.15 });
    // --- réserve
    this.neon(f, 14, 0, H); this.neon(f, 22, 0, H);
    for (let k = 0; k < 6; k++) B(10 + (k % 3) * 1.1, 0.15 + Math.floor(k / 3) * 1, 4.5, 1, 1, 1, M_CRATE);
    this.interRel(f, 'supply', 'fournitures', 11, 1.2, 3.6, 'Prendre le paquetage de départ');
    for (let k = 0; k < 4; k++) B(26.8, 0.15, -4 + k * 2.6, 1, 2.2, 2, M_METAL);
    // --- quartiers
    this.neon(f, 18, 12, H);
    B(24.5, 0.15, 15.5, 2.2, 0.55, 3.2, M_PLANKS); B(24.5, 0.7, 16.7, 2.0, 0.2, 0.7, M_PLASTER);
    this.interRel(f, 'bed', 'lit', 24.5, 0.9, 14.6, 'Dormir');
    B(12, 0.15, 15, 2, 0.8, 1.2, M_PLANKS); B(10, 0.15, 17, 1.2, 2.2, 0.8, M_METAL);
    this.objRel(f, 'lantern', 12, 15, 0.7, { y: f.y + 0.95 });
    // --- mât d'antenne sur le toit, balise rouge
    const mh = 20;
    for (const [lx, lz] of [[16.8, 3.8], [19.2, 3.8], [16.8, 6.2], [19.2, 6.2]]) B(lx, H + 0.5, lz, 0.22, mh, 0.22, M_METAL);
    for (let k = 1; k <= 5; k++) { const hy = H + 0.5 + k * mh / 5.5; B(18, hy, 3.8, 2.6, 0.15, 0.15, M_METAL); B(18, hy, 6.2, 2.6, 0.15, 0.15, M_METAL); B(16.8, hy, 5, 0.15, 0.15, 2.6, M_METAL); B(19.2, hy, 5, 0.15, 0.15, 2.6, M_METAL); }
    B(18, H + 0.5 + mh, 5, 3.6, 0.6, 3.6, M_METAL, 0, 3);
    this.objRel(f, 'beacon', 18, 5, 0.9, { y: f.y + H + mh + 1.3 });
    B(-18, H + 0.5, -6, 5, 0.4, 5, M_METAL); B(-18, H + 0.9, -6, 4, 1.4, 4, M_METAL, Math.PI / 4, 3);
    // --- enceinte, projecteurs, citernes
    const hw = 38, hd = 27;
    for (const [x0, z0, x1, z1] of [[-hw, -hd, -4, -hd], [4, -hd, hw, -hd], [hw, -hd, hw, hd], [hw, hd, -hw, hd], [-hw, hd, -hw, -hd]]) {
      const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L / 3)), ang = Math.atan2(x1 - x0, z1 - z0);
      for (let k = 0; k <= n; k++) B(lerp(x0, x1, k / n), -0.3, lerp(z0, z1, k / n), 0.15, 2.5, 0.15, M_METAL);
      B((x0 + x1) / 2, 1.1, (z0 + z1) / 2, 0.06, 0.08, L, M_METAL, ang); B((x0 + x1) / 2, 2.0, (z0 + z1) / 2, 0.06, 0.08, L, M_METAL, ang);
    }
    for (const [lx, lz] of [[-36, -25], [36, -25], [-36, 25], [36, 25], [-5, -26], [5, -26]]) this.objRel(f, 'lamp', lx, lz, 4.2);
    for (const lz of [-20, -16]) { B(34, 0, lz, 3, 2.6, 3, M_METAL, 0, 0); B(34, 2.6, lz, 3.4, 0.8, 3.4, M_METAL, 0, 3); }
    this.crate(f, 32, -5); this.crate(f, 33.2, -4.4);
    this.objRel(f, 'sign', 3.5, -29, 1.8);
    this.pois.push({ name: 'Laboratoire Prairie-7', kind: 'lab', x: f.x, z: f.z, r: 32 });
    const [bx, bz] = this.toWorld(f, 24.5, 13.5);
    const [ex, ez] = this.toWorld(f, 0, -21);
    return { x: f.x, z: f.z, r: 55, frame: f, bed: [bx, bz], entry: [ex, ez] };
  },

  // --------------------------------------------------------------- relais d'antenne (maintenance)
  relay(site, idx, name) {
    const rnd = this.rnd, w = this.w, y0 = w.heightAt(site.x, site.z);
    const f = { x: site.x, y: y0, z: site.z, r: rnd() * TAU };
    this.flatten(site.x, site.z, 5, y0, 5);
    this.paintDisk(site.x, site.z, 5, M_DIRT, 2, true);
    this.paintDisk(site.x, site.z, 9, -1, 0, true);
    const H = 15;
    this.block(f, 0, -0.5, 0, 4, 0.8, 4, M_CONCRETE);
    for (const [lx, lz] of [[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3]]) this.block(f, lx, 0, lz, 0.22, H, 0.22, M_METAL);
    for (let k = 1; k <= 5; k++) { const hy = k * H / 5.5; this.block(f, 0, hy, -1.3, 2.8, 0.14, 0.14, M_METAL); this.block(f, 0, hy, 1.3, 2.8, 0.14, 0.14, M_METAL); this.block(f, -1.3, hy, 0, 0.14, 0.14, 2.8, M_METAL); this.block(f, 1.3, hy, 0, 0.14, 0.14, 2.8, M_METAL); }
    this.block(f, 0, H, 0, 0.18, 3, 0.18, M_METAL);
    this.block(f, 0.6, H - 1.5, 0, 1.6, 1.6, 0.2, M_METAL, 0.3);
    this.objRel(f, 'beacon', 0, 0, 0.9, { y: y0 + H + 3.2 });
    this.block(f, 2.6, 0.3, 0, 0.9, 1.5, 0.6, M_METAL);
    this.block(f, 2.6, 1.8, 0, 1.1, 0.12, 0.8, M_HAZARD);
    this.block(f, -2.8, 0.3, 0.5, 1.8, 0.9, 1.2, M_METAL, 0, 2);
    this.interRel(f, 'relay', 'relais' + idx, 2.2, 1.2, 0, 'Réparer le relais', { idx });
    this.pois.push({ name: name, kind: 'relay', x: site.x, z: site.z, r: 10 });
    return { x: site.x, z: site.z, r: 12 };
  },

  // --------------------------------------------------------------- lieux étranges
  monolith(site, idx) {
    const w = this.w, y0 = w.heightAt(site.x, site.z), rnd = this.rnd;
    const f = { x: site.x, y: y0, z: site.z, r: rnd() * TAU };
    this.flatten(site.x, site.z, 6, y0, 6);
    this.paintDisk(site.x, site.z, 13, M_DIRT, 6, true);
    this.block(f, 0, -0.6, 0, 4.4, 0.9, 3.4, M_STONE);
    this.block(f, 0, 0.3, 0, 1.6, 9.5, 0.9, M_DARK);
    for (let k = 0; k < 6; k++) { const a = rnd() * TAU, r = 4 + rnd() * 7; this.obj(k % 2 ? 'bones' : 'deadtree', site.x + Math.cos(a) * r, site.z + Math.sin(a) * r); }
    this.interRel(f, 'sample', 'monolithe' + idx, 0, 1.2, -1.2, 'Prélever un échantillon', { idx });
    this.pois.push({ name: 'Le Monolithe', kind: 'monolith', x: site.x, z: site.z, r: 16 });
    return { x: site.x, z: site.z, r: 18, glitch: true };
  },
  henge(site) {
    const w = this.w, y0 = w.heightAt(site.x, site.z), rnd = this.rnd, f = { x: site.x, y: y0 - 0.3, z: site.z, r: rnd() * TAU };
    this.flatten(site.x, site.z, 11, y0, 8);
    this.paintDisk(site.x, site.z, 11, -1, 0, true);
    const n = 12;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * TAU;
      if (rnd() < 0.15) continue;
      this.block(f, Math.cos(a) * 9, 0, Math.sin(a) * 9, 1.4, 4.6, 0.9, rnd() < 0.5 ? M_MOSSY : M_ROCK, -a + Math.PI / 2);
      if (k % 2 === 0 && rnd() < 0.7) {
        const a2 = ((k + 1) / n) * TAU;
        this.block(f, (Math.cos(a) + Math.cos(a2)) * 4.5, 4.6, (Math.sin(a) + Math.sin(a2)) * 4.5, 1.1, 0.8, 5.3, M_ROCK, -((a + a2) / 2));
      }
    }
    this.block(f, 0, 0, 0, 3, 1, 1.6, M_ROCK);
    this.crate(f, 0.3, 2.5);
    this.pois.push({ name: 'Le Cercle de pierres', kind: 'henge', x: site.x, z: site.z, r: 13 });
    return { x: site.x, z: site.z, r: 16 };
  },
  plane(site) {
    const w = this.w, y0 = w.heightAt(site.x, site.z), rnd = this.rnd, f = { x: site.x, y: y0, z: site.z, r: rnd() * TAU };
    this.flatten(site.x, site.z, 10, y0 - 0.5, 8);
    this.paintDisk(site.x, site.z, 14, M_DIRT, 7, true);
    this.block(f, 0, -0.9, 0, 3, 2.7, 15, M_METAL);
    this.block(f, 0, -0.9, 8.6, 2.6, 2.2, 2.4, M_METAL, 0, 0);
    this.block(f, 0.1, 1.2, 8.8, 2.2, 0.5, 1.6, M_LABWIN);
    this.block(f, -5.5, 0.2, 1, 8, 0.25, 3.4, M_METAL, 0.12);
    this.block(f, 5.2, -0.4, 1.4, 6, 0.25, 3.2, M_METAL, -0.35);
    this.block(f, 0, 1.4, -6.8, 0.25, 3.2, 2.4, M_METAL);
    this.block(f, 0, 1.2, -6.9, 5, 0.2, 1.6, M_METAL);
    for (let k = 0; k < 7; k++) { const a = rnd() * TAU, r = 6 + rnd() * 8; this.block(f, Math.cos(a) * r, -0.2, Math.sin(a) * r, 0.5 + rnd() * 1.5, 0.3 + rnd() * 0.5, 0.5 + rnd() * 2, M_METAL, rnd() * 3); }
    this.crate(f, 3, -3); this.crate(f, -2.6, -5);
    this.note(f, 2.4, 5.5, 3);
    this.pois.push({ name: 'L’Épave', kind: 'plane', x: site.x, z: site.z, r: 16 });
    return { x: site.x, z: site.z, r: 20 };
  },
  lighthouse(site) {
    const w = this.w, y0 = w.heightAt(site.x, site.z), rnd = this.rnd, f = { x: site.x, y: y0, z: site.z, r: rnd() * TAU };
    this.flatten(site.x, site.z, 5, y0, 4);
    this.paintDisk(site.x, site.z, 6, M_ROCK, 2, true);
    this.block(f, 0, -1, 0, 6, 1.6, 6, M_STONE);
    let y = 0.6;
    for (let k = 0; k < 5; k++) {
      const s = 4.6 - k * 0.3, h = 3.2;
      this.block(f, 0, y, 0, s, h, s, k % 2 ? M_BRICK : M_PLASTER);
      this.block(f, 0, y, 0, s * 0.72, h, s * 1.02, k % 2 ? M_BRICK : M_PLASTER, Math.PI / 4);
      y += h;
    }
    this.block(f, 0, y, 0, 4.2, 0.3, 4.2, M_METAL);
    this.block(f, 0, y + 0.3, 0, 2.8, 2.2, 2.8, M_FROSTED);
    this.block(f, 0, y + 2.5, 0, 3.4, 2, 3.4, M_ROOF, 0, 3);
    this.objRel(f, 'orb', 0, 0, 0.9, { y: y0 + y + 0.9 });
    this.crate(f, 3.6, 0.5);
    this.pois.push({ name: 'Le Phare', kind: 'lighthouse', x: site.x, z: site.z, r: 10 });
    return { x: site.x, z: site.z, r: 12 };
  },
  cabin(site) {
    const w = this.w, y0 = w.heightAt(site.x, site.z), rnd = this.rnd, f = { x: site.x, y: y0, z: site.z, r: rnd() * TAU };
    this.flatten(site.x, site.z, 5, y0, 5);
    this.paintDisk(site.x, site.z, 8, -1, 0, true);
    this.house(f, 5, 4.5, { wall: M_LOGS, win: M_LOGS, roof: M_PLANKS, lantern: true, props: true, chimney: true });
    this.objRel(f, 'woodpile', 3.8, 0); this.objRel(f, 'bones', -3.5, -2.8);
    this.crate(f, -1.4, 1.2, 0.15);
    this.note(f, 1.2, 1.4, 5, 0.15);
    this.pois.push({ name: 'La Cabane du chasseur', kind: 'cabin', x: site.x, z: site.z, r: 9 });
    return { x: site.x, z: site.z, r: 12 };
  },
  camp(site) {
    const w = this.w, y0 = w.heightAt(site.x, site.z), rnd = this.rnd, f = { x: site.x, y: y0, z: site.z, r: rnd() * TAU };
    this.flatten(site.x, site.z, 6, y0, 5);
    this.paintDisk(site.x, site.z, 4, M_DIRT, 2, true);
    this.paintDisk(site.x, site.z, 9, -1, 0, true);
    this.block(f, -3, -0.1, 1, 2.6, 1.8, 3, M_CLOTH, Math.PI / 2, 1);
    for (let k = 0; k < 6; k++) { const a = (k / 6) * TAU; this.obj('stones', site.x + Math.cos(a) * 1.1, site.z + Math.sin(a) * 1.1, 0.4); }
    this.obj('stump', site.x + 2, site.z + 1.5, 0.7);
    this.crate(f, 2.8, -1.5);
    this.note(f, -1.2, 3, 10 + (this.campN = (this.campN || 0) + 1));
    this.pois.push({ name: 'Un campement abandonné', kind: 'camp', x: site.x, z: site.z, r: 9 });
    return { x: site.x, z: site.z, r: 12 };
  },
  graveyard(site) {
    const w = this.w, y0 = w.heightAt(site.x, site.z), rnd = this.rnd, f = { x: site.x, y: y0, z: site.z, r: rnd() * TAU };
    this.flatten(site.x, site.z, 9, y0, 6);
    this.paintDisk(site.x, site.z, 11, -1, 0, true);
    this.fence(f, 8, 6);
    for (let u = -6; u <= 6; u += 2.4) for (let v = -4; v <= 4; v += 2.6) if (rnd() < 0.8) this.objRel(f, 'tomb', u, v, 1);
    this.objRel(f, 'deadtree', 0, 0);
    this.note(f, 1.5, -5, 8);
    this.pois.push({ name: 'Le Vieux cimetière', kind: 'graveyard', x: site.x, z: site.z, r: 11 });
    return { x: site.x, z: site.z, r: 14 };
  },
  bunker(site) {
    const w = this.w, y0 = w.heightAt(site.x, site.z), rnd = this.rnd, f = { x: site.x, y: y0, z: site.z, r: rnd() * TAU };
    this.flatten(site.x, site.z, 6, y0, 5);
    this.paintDisk(site.x, site.z, 9, -1, 0, true);
    this.block(f, 0, -1, 0, 7.4, 1.05, 6.4, M_CONCRETE);
    this.block(f, 0, 0.05, 0, 7, 0.1, 6, M_TILE);
    this.block(f, 0, 0, 3 - 0.25, 7, 3, 0.5, M_CONCRETE);
    this.block(f, -3.25, 0, 0, 0.5, 3, 5, M_CONCRETE); this.block(f, 3.25, 0, 0, 0.5, 3, 5, M_CONCRETE);
    this.block(f, -2.15, 0, -3 + 0.25, 2.7, 3, 0.5, M_CONCRETE); this.block(f, 2.15, 0, -3 + 0.25, 2.7, 3, 0.5, M_CONCRETE);
    this.block(f, 0, 2.2, -3 + 0.25, 1.6, 0.8, 0.5, M_HAZARD);
    this.block(f, 0, 3, 0, 8, 0.8, 7, M_CONCRETE);
    this.objRel(f, 'lantern', 0, 0.5, 0.7, { y: y0 + 2.2 });
    this.crate(f, -2.2, 1.6, 0.15); this.crate(f, 2.2, 1.6, 0.15);
    this.note(f, 0, 2.2, 9, 0.15);
    this.pois.push({ name: 'Le Bunker', kind: 'bunker', x: site.x, z: site.z, r: 9 });
    return { x: site.x, z: site.z, r: 12 };
  },
});
