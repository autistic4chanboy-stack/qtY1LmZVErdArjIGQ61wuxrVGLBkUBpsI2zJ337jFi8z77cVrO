// ============================================================================
//  CONSTRUCTIONS (FERME) : bâtiments habités avec portes et intérieurs,
//  ville à douves et ponts-levis, ferme, hameau, lieux-dits et secrets
// ============================================================================

const LIEU_NAMES = {
  ferme: 'la vieille ferme', place: 'la place', mairie: 'la mairie', boulangerie: 'la boulangerie', forge: 'la forge',
  graineterie: 'la graineterie', auberge: "l'auberge", poste: 'la poste', eglise: "l'église", garde: 'la maison du garde',
  pont_nord: 'le pont nord', pont_sud: 'le pont sud', marche: 'le marché', cimetiere: 'le cimetière', ranch: 'le ranch',
  hameau: 'le hameau', lac: 'le grand lac', ponton: 'le ponton', cabane_pecheur: 'la cabane du pêcheur', foret: 'la forêt',
  hutte_ermite: 'la hutte de la guérisseuse', moulin: 'le vieux moulin', mine: 'la mine', cercle: 'le cercle de pierres',
  chapelle: 'la chapelle abandonnée', vieux_puits: 'le vieux puits', hameau_abandonne: 'le hameau abandonné',
  tour: 'la tour de guet', marais: 'le marais', ruines: 'les ruines', chene: 'le chêne millénaire', phare: 'le phare',
  maison_a: 'la maison aux volets bleus', maison_b: 'la maison du tisserand', maison_c: 'la maison Rivière', maison_d: 'la maison aux lilas',
  maison_hameau_a: 'la maison Morel', maison_hameau_b: 'la maison Bastien', puits_ville: 'le puits de la place',
};
// Lumières des objets 3D posés
const PROP_LIGHTS = {
  lampadaire: { c: [1.0, 0.78, 0.45], r: 13, y: 2.9, night: true }, lanterne_sol: { c: [1.0, 0.75, 0.42], r: 7, y: 0.25, night: true },
  feu_camp: { c: [1.0, 0.52, 0.18], r: 12, y: 0.6, flicker: true }, cheminee: { c: [1.0, 0.55, 0.22], r: 8, y: 0.5, flicker: true },
  citrouille: { c: [1.0, 0.6, 0.25], r: 6, y: 0.3, night: true }, bougie: { c: [1.0, 0.7, 0.35], r: 5, y: 0.2, flicker: true },
  four: { c: [1.0, 0.5, 0.2], r: 6, y: 0.5, flicker: true, lit: true },
};
const VER_ALL = 0x0f, VER_ENVERS = 0x100;

function addPropCollider(w, p) {
  const c = PROP_COLL[p.id];
  if (!c) return;
  const s = p.s || 1;
  const b = { x: p.x, y: p.y, z: p.z, sx: c[0] * 2 * s, sy: c[2] * s, sz: c[1] * 2 * s, r: p.r, m: 0, sh: 0, hidden: true };
  if (p.ver) b.ver = p.ver;
  p.blk = b;
  w.blocks.push(b);
}
function removePropCollider(w, p) {
  if (!p.blk) return;
  const i = w.blocks.indexOf(p.blk);
  if (i >= 0) w.blocks.splice(i, 1);
  p.blk = null; w.grid = null;
}

Object.assign(Builder.prototype, {
  // --------------------------------------------------------------- points d'intérêt, objets, portes, navigation
  inter(kind, id, x, y, z, name, data) {
    const it = { kind, id, x, y, z, name, data: data || {} };
    (this.w.inter || (this.w.inter = [])).push(it);
    return it;
  },
  interRel(f, kind, id, lx, ly, lz, name, data) { const [x, z] = this.toWorld(f, lx, lz); return this.inter(kind, id, x, f.y + ly, z, name, data); },
  // Emplacement de note (rempli ensuite par le générateur selon le lieu de chaque note)
  lore(f, lx, lz, key, ly) {
    const [x, z] = this.toWorld(f, lx, lz);
    const S = this.w.noteSlots || (this.w.noteSlots = {});
    (S[key] || (S[key] = [])).push({ x, z, y: ly === undefined ? null : f.y + ly, r: f.r + this.rnd() * 0.6 });
  },
  placeNote(slot, id) {
    const w = this.w;
    if (slot.y === null) { this.obj('note', slot.x, slot.z, 1.0); this.inter('note', id, slot.x, w.heightAt(slot.x, slot.z) + 0.8, slot.z, 'Lire', { note: id }); }
    else { this.prop('lettre', slot.x, slot.y, slot.z, slot.r); this.inter('note', id, slot.x, slot.y + 0.1, slot.z, 'Lire', { note: id }); }
  },
  prop(id, x, y, z, r, data, s, ver) {
    const p = { id, x, y, z, r: r || 0 };
    if (s) p.s = s;
    if (data) p.data = data;
    if (ver) p.ver = ver;
    this.w.props.push(p);
    addPropCollider(this.w, p);
    return p;
  },
  propRel(f, id, lx, ly, lz, rr, data, s, ver) { const [x, z] = this.toWorld(f, lx, lz); return this.prop(id, x, f.y + ly, z, f.r + (rr || 0), data, s, ver); },
  navNode(x, z, tag) {
    const N = this.w.nav || (this.w.nav = { nodes: [], edges: [] });
    N.nodes.push({ x, z, tag: tag || '' });
    return N.nodes.length - 1;
  },
  navLink(a, b, flag) { this.w.nav.edges.push([a, b, flag || '']); },
  landmark(key, x, z, r, extra) {
    const w = this.w, L = w.lm || (w.lm = {});
    L[key] = Object.assign({ key, name: LIEU_NAMES[key] || key, x, z, y: w.heightAt(x, z), r: r || 20 }, extra || {});
    return L[key];
  },
  door(f, res, bld, o) {
    const t = res.t || 0.3;
    const [x, z] = this.toWorld(f, res.dx, -res.D / 2 + t / 2);
    const d = { x, y: f.y + 0.02, z, r: f.r, w: res.dw - 0.06, h: res.dh - 0.05, a: 0, open: 0, locked: false, bld, m: o && o.doorM };
    this.w.doors.push(d);
    return this.w.doors.length - 1;
  },
  // Bâtiment habité : maison + porte + nœuds de navigation + aménagement
  building(key, f, W, D, o, furnish) {
    const res = this.house(f, W, D, o);
    const di = o.noDoor ? -1 : this.door(f, res, key, o);
    const out = this.toWorld(f, res.dx, -D / 2 - 1.5), inn = this.toWorld(f, res.dx, -D / 2 + 1.1), mid = this.toWorld(f, res.dx * 0.5, 0.3);
    const nOut = this.navNode(out[0], out[1], key + ':out'), nIn = this.navNode(inn[0], inn[1], key + ':in'), nMid = this.navNode(mid[0], mid[1], key + ':mid');
    this.navLink(nOut, nIn, di >= 0 ? 'door:' + di : ''); this.navLink(nIn, nMid);
    const B = { key, name: LIEU_NAMES[key] || key, x: f.x, z: f.z, y: f.y + 0.15, f, W, D, H: res.H, door: di, nOut, nIn, nMid, spots: {}, out };
    (this.w.bld || (this.w.bld = {}))[key] = B;
    if (!o.noLight) this.objRel(f, 'lantern', res.dx * 0.3, 0.6, 0.7, { y: f.y + Math.min(res.H, 2.9) - 0.75 });
    if (furnish) furnish.call(this, f, W, D, B, res);
    return B;
  },
  // Lit (avec point de sommeil) contre le mur du fond
  bed(f, B, lx, lz, col, name) {
    this.propRel(f, 'lit', lx, 0.15, lz, Math.PI, { col });
    const [x, z] = this.toWorld(f, lx, lz);
    const s = { x, y: f.y + 0.65, z, r: f.r + Math.PI };
    B.spots[name || 'bed'] = s;
    return s;
  },
  spot(f, B, name, lx, lz, rr) { const [x, z] = this.toWorld(f, lx, lz); B.spots[name] = { x, y: f.y + 0.15, z, r: f.r + (rr || 0) }; },
  furnishHome(f, W, D, B, o = {}) {
    const bx = -W / 2 + 0.85, bz = D / 2 - 1.3;
    this.bed(f, B, bx, bz, o.bedCol || '#6a8ab0');
    if (o.bed2) this.bed(f, B, bx + 1.4, bz, o.bed2, 'bed2');
    this.propRel(f, 'table', W / 4 - 0.3, 0.15, 0.2, 0);
    this.propRel(f, 'chaise', W / 4 - 0.3, 0.15, -0.55, Math.PI);
    this.propRel(f, 'chaise', W / 4 - 0.3, 0.15, 0.95, 0);
    this.propRel(f, 'cheminee', W / 2 - 0.62, 0.15, D / 2 - 1.6, -Math.PI / 2, { lit: true });
    this.propRel(f, 'etagere', -W / 2 + 0.25, 0.15, 0.2, Math.PI / 2, { kind: o.shelf || 'bocaux' });
    this.spot(f, B, 'sit', W / 4 - 0.3, -0.55, Math.PI);
  },
  furnishShop(f, W, D, B, kind) {
    this.propRel(f, 'comptoir', 0, 0.15, 0.6, 0);
    this.propRel(f, 'etagere', -1.4, 0.15, D / 2 - 0.45, Math.PI, { kind });
    this.propRel(f, 'etagere', 1.4, 0.15, D / 2 - 0.45, Math.PI, { kind: kind === 'pain' ? 'pain' : 'bocaux' });
    this.spot(f, B, 'work', 0, 1.6, Math.PI);
    B.spots.counter = { x: this.toWorld(f, 0, -0.4)[0], z: this.toWorld(f, 0, -0.4)[1] };
  },

  // --------------------------------------------------------------- pièces souterraines (cave, crypte, galerie profonde)
  // Salle close sous le relief ; on y descend par une trappe (téléportation)
  // (placée loin de tout bâtiment : la carte des abris ne gère qu'un plafond par case)
  underRoom(x, z, W, D, H, depth, mat, floor) {
    const w = this.w, y = Math.min(w.heightAt(x, z), w.heightAt(x - W, z - D), w.heightAt(x + W, z + D)) - depth;
    const f = { x, y, z, r: 0 };
    const n0 = w.blocks.length;
    this.block(f, 0, -0.6, 0, W + 1, 0.6, D + 1, floor ?? mat);
    this.block(f, 0, H, 0, W + 1, 0.8, D + 1, mat);
    w.blocks[w.blocks.length - 1].ceil = true;
    this.block(f, 0, 0, -D / 2 - 0.25, W + 1, H, 0.5, mat);
    this.block(f, 0, 0, D / 2 + 0.25, W + 1, H, 0.5, mat);
    this.block(f, -W / 2 - 0.25, 0, 0, 0.5, H, D, mat);
    this.block(f, W / 2 + 0.25, 0, 0, 0.5, H, D, mat);
    for (let k = n0; k < w.blocks.length; k++) w.blocks[k].under = true;
    return f;
  },

  // --------------------------------------------------------------- la ville fortifiée (douves + 2 ponts-levis)
  townMoat(site) {
    const w = this.w, WL = w.waterLevel, half = 46, T = 1.2, H = 5.8, gate = 4.4;
    const f = { x: site.x, y: site.y, z: site.z, r: 0 };
    const y0 = f.y;
    // relief : intérieur plat, douves, talus
    this.forVerts(f.x, f.z, half + 40, (i, j, k, x, z) => {
      const d = Math.max(Math.abs(x - f.x), Math.abs(z - f.z));
      let h = w.heights[k];
      if (d < 47.4) h = y0;
      else if (d < 55.5) { const t = Math.min(smoothstep(47.4, 49.2, d), 1 - smoothstep(53.6, 55.5, d)); h = lerp(y0 - 0.2, WL - 1.7, t); }
      else h = lerp(y0, h, smoothstep(55.5, 80, d));
      w.heights[k] = h;
      if (d < 58) this.reserved[k] = 1;
      if (d > 47.2 && d < 55.8) w.mats[k] = d < 48.2 || d > 54.8 ? M_DIRT : M_SAND;
      else if (d <= 47.2) w.mats[k] = M_GRASS;
    });
    // rues
    this.paintRect(f, 0, 0, 3.6, half + 11, M_COBBLE);
    this.paintRect(f, 0, 0, 10.5, 10.5, M_COBBLE);
    for (const z of [-20, -3, 17]) this.paintRect(f, 0, z, 13, 2.6, M_COBBLE);
    this.paintRect(f, 22, -12, 10, 2.2, M_COBBLE);
    this.paintRect(f, -22, 10, 10, 2.2, M_COBBLE);
    // remparts (portes nord et sud uniquement)
    const seg = (sf, u0, u1) => {
      const L = u1 - u0, n = Math.ceil(L / 12);
      for (let k = 0; k < n; k++) {
        const a = u0 + (L * k) / n, b = u0 + (L * (k + 1)) / n;
        this.block(sf, (a + b) / 2, -2.5, half, b - a + 0.02, H + 2.5, T, M_STONE);
        this.block(sf, (a + b) / 2, H, half, b - a + 0.02, 0.45, T + 0.35, M_STONE);
        for (let c = a + 1; c < b - 0.5; c += 2.4) this.block(sf, c, H + 0.45, half + T / 2, 1.1, 0.7, 0.35, M_STONE);
      }
    };
    for (let s = 0; s < 4; s++) {
      const sf = { x: f.x, y: y0, z: f.z, r: s * Math.PI / 2 };
      const hasGate = s === 0 || s === 2;
      if (hasGate) {
        seg(sf, -half, -gate / 2); seg(sf, gate / 2, half);
        this.block(sf, 0, 4.2, half, gate + 0.4, H - 4.2 + 0.45, T + 0.3, M_STONE);
        for (const u of [-gate / 2 - 1.7, gate / 2 + 1.7]) {
          this.block(sf, u, -2.5, half, 3.4, 8.6 + 2.5, 3.4, M_STONE);
          this.block(sf, u, 8.6, half, 4.0, 3.2, 4.0, M_SLATE, 0, 3);
        }
        this.block(sf, 0, 4.0, half - 0.9, gate + 0.2, 0.25, 0.25, M_LOGS);
      } else seg(sf, -half, half);
      this.block(sf, half, -2.5, half, 5.2, 10 + 2.5, 5.2, M_STONE);
      this.block(sf, half, 10, half, 6, 4.6, 6, M_SLATE, 0, 3);
    }
    // ponts-levis (baissés le jour)
    const bw = gate + 0.5, L = 9.8;
    w.bridges.push({ key: 'pont_sud', x: f.x, y: y0 + 0.25, z: f.z + half + T / 2 + 0.05, r: 0, w: bw, L, a: 0, up: false, chainY: 4.0 });
    w.bridges.push({ key: 'pont_nord', x: f.x, y: y0 + 0.25, z: f.z - half - T / 2 - 0.05, r: Math.PI, w: bw, L, a: 0, up: false, chainY: 4.0 });
    // navigation : portes intérieures / extérieures, reliées par les ponts
    const gN_in = this.navNode(f.x, f.z - half + 4, 'pont_nord:porte'), gN_out = this.navNode(f.x, f.z - half - L - 2.5, 'pont_nord:pont');
    const gS_in = this.navNode(f.x, f.z + half - 4, 'pont_sud:porte'), gS_out = this.navNode(f.x, f.z + half + L + 2.5, 'pont_sud:pont');
    this.navLink(gN_in, gN_out, 'bridge:1'); this.navLink(gS_in, gS_out, 'bridge:0');
    // rue principale (nœuds) + places
    for (let z = -38; z <= 38; z += 6.5) this.navNode(f.x + (z % 13 === 0 ? 0.8 : -0.8), f.z + z, 'rue');
    for (const [x, z] of [[-7, -7], [7, -7], [-7, 7], [7, 7], [-9, -20], [9, -20], [-9, 17], [9, 17], [-9, -3], [9, -3], [14, -12], [26, -12], [-14, 10], [-26, 10]]) this.navNode(f.x + x, f.z + z, 'rue');
    const place = this.navNode(f.x + 2, f.z + 2, 'place');
    this.fountain({ x: f.x, y: y0, z: f.z, r: 0 });
    this.landmark('place', f.x, f.z, 12);
    // marché
    for (const [lx, lz, a] of [[-7.5, 6.5, Math.PI], [7.5, 6.5, Math.PI], [7.5, -6.5, 0]]) this.stall({ x: f.x + lx, y: y0, z: f.z + lz, r: a });
    this.landmark('marche', f.x + 7, f.z + 6, 6);
    // puits de la place
    this.well({ x: f.x - 7.5, y: y0, z: f.z - 7, r: 0 });
    this.landmark('puits_ville', f.x - 7.5, f.z - 7, 3);
    this.inter('water', 'puits_ville', f.x - 7.5, y0 + 1, f.z - 7, "Puiser de l'eau");
    // bâtiments (porte vers la rue)
    const E = -Math.PI / 2, Wd = Math.PI / 2; // porte vers +x / vers -x
    const mk = (key, lx, lz, W, D, r, o, fn) => this.building(key, { x: f.x + lx, y: y0, z: f.z + lz, r }, W, D, o, fn);
    mk('mairie', -18.5, -3, 12, 9, E, { floors: 2, wall: M_STONE, win: M_STONEWIN, roof: M_SLATE, chimney: true, roofH: 3 }, function (bf, W, D, B) {
      this.propRel(bf, 'table', 0, 0.15, 1.2, 0); this.propRel(bf, 'chaise', 0, 0.15, 2.0, Math.PI);
      this.propRel(bf, 'etagere', -2.2, 0.15, D / 2 - 0.45, Math.PI, { kind: 'livres' }); this.propRel(bf, 'etagere', 2.2, 0.15, D / 2 - 0.45, Math.PI, { kind: 'livres' });
      this.propRel(bf, 'livre', 0.3, 0.9, 1.1, 0.3);
      this.spot(bf, B, 'work', 0, 2.0, Math.PI);
      this.bed(bf, B, -W / 2 + 0.85, D / 2 - 1.3, '#7a3040');
      this.propRel(bf, 'cheminee', W / 2 - 0.62, 0.15, 1.2, -Math.PI / 2, { lit: true });
    });
    mk('auberge', 18.5, -3, 12, 10, Wd, { floors: 2, wall: M_TIMBER, win: M_TIMBERWIN, roof: M_ROOF, chimney: true, roofH: 3 }, function (bf, W, D, B) {
      this.propRel(bf, 'comptoir', 3, 0.15, 3.3, 0); this.spot(bf, B, 'work', 3, 4.2, Math.PI);
      for (const [x, z] of [[-3, -1.8], [-3, 1.2], [0.5, -0.3]]) { this.propRel(bf, 'table', x, 0.15, z, 0); this.propRel(bf, 'chaise', x - 0.4, 0.15, z - 0.75, Math.PI); this.propRel(bf, 'chaise', x + 0.4, 0.15, z + 0.75, 0); }
      this.propRel(bf, 'tonneau', 5.2, 0.15, 4.4, 0); this.propRel(bf, 'tonneau', 4.4, 0.15, 4.5, 0);
      this.propRel(bf, 'cheminee', -W / 2 + 0.62, 0.15, 3.0, Math.PI / 2, { lit: true });
      this.bed(bf, B, -W / 2 + 0.85, D / 2 - 1.3, '#8a5a30');
      this.bed(bf, B, -W / 2 + 2.3, D / 2 - 1.3, '#4a6a3a', 'guest');
      this.interRel(bf, 'rentbed', 'auberge', -W / 2 + 2.3, 0.8, D / 2 - 1.3, 'Dormir (chambre louée)');
      this.spot(bf, B, 'sit', -3.4, -2.55, Math.PI);
    });
    mk('boulangerie', -17.5, -20, 9, 8, E, { floors: 2, wall: M_PLASTER, win: M_TIMBERWIN, roof: M_ROOF, chimney: true }, function (bf, W, D, B) {
      this.furnishShop(bf, W, D, B, 'pain');
      this.propRel(bf, 'four', W / 2 - 0.9, 0.15, D / 2 - 1.0, Math.PI, { lit: true });
      this.bed(bf, B, -W / 2 + 0.85, D / 2 - 1.3, '#b05050'); this.bed(bf, B, -W / 2 + 0.85, -D / 2 + 1.4, '#e0a0b0', 'bed2');
      this.propRel(bf, 'pain_etal', 0.4, 1.21, 0.5, 0); this.propRel(bf, 'pain_etal', -0.6, 1.21, 0.6, 0.3);
      this.propRel(bf, 'poupee', -W / 2 + 1.6, 0.15, -D / 2 + 1.0, 0.8);
    });
    mk('poste', 17.5, -20, 9, 8, Wd, { floors: 2, wall: M_BRICK, win: M_STONEWIN, roof: M_SLATE }, function (bf, W, D, B) {
      this.furnishShop(bf, W, D, B, 'bocaux');
      for (const [x, z] of [[2.8, 2.4], [3.2, 1.6], [2.6, 1.0]]) this.propRel(bf, 'caisse', x, 0.15, z, 0.3, null, 0.6);
      this.bed(bf, B, -W / 2 + 0.85, D / 2 - 1.3, '#4a5a8a');
      this.propRel(bf, 'cheminee', -W / 2 + 0.62, 0.15, -1.0, Math.PI / 2, { lit: true });
    });
    mk('forge', -17.5, 17, 10, 8, E, { wall: M_STONE, win: M_STONEWIN, roof: M_SLATE, chimney: true }, function (bf, W, D, B) {
      this.propRel(bf, 'enclume', 0.5, 0.15, 1.0, 0); this.propRel(bf, 'four', 2.6, 0.15, D / 2 - 1.0, Math.PI, { lit: true });
      this.propRel(bf, 'tonneau', 3.8, 0.15, 0.3, 0); this.propRel(bf, 'etabli', -1.2, 0.15, D / 2 - 0.8, Math.PI);
      this.spot(bf, B, 'work', 0.5, 0.1, 0);
      this.bed(bf, B, -W / 2 + 0.85, D / 2 - 1.3, '#5a4a3a');
    });
    mk('graineterie', 17.5, 17, 9, 8, Wd, { wall: M_TIMBER, win: M_TIMBERWIN, roof: M_THATCH }, function (bf, W, D, B) {
      this.furnishShop(bf, W, D, B, 'bocaux');
      for (const [x, z] of [[-3.2, 1.8], [-3.4, 1.0], [-2.8, 2.4], [3.2, 2.2]]) this.propRel(bf, 'sac', x, 0.15, z, z);
      this.bed(bf, B, -W / 2 + 0.85, D / 2 - 1.3, '#6a7a3a');
      this.propRel(bf, 'pot_fleurs', 2.5, 1.21, 0.5, 0);
    });
    mk('garde', 10.5, -38.5, 6.5, 5.5, Wd, { wall: M_STONE, win: M_STONEWIN, roof: M_SLATE }, function (bf, W, D, B) {
      this.bed(bf, B, -W / 2 + 0.85, D / 2 - 1.3, '#3a3a3a');
      this.propRel(bf, 'table', 1.2, 0.15, 0.3, 0); this.propRel(bf, 'chaise', 1.2, 0.15, -0.5, Math.PI);
      this.spot(bf, B, 'work', 1.2, -0.5, Math.PI);
    });
    // église (porte vers la rue, à l'est) + petit cimetière
    {
      const cf = { x: f.x - 25, y: y0, z: f.z - 33, r: E };
      const res = this.church(cf);
      // la porte de l'église est ouverte (pas de battant)
      const out = res.door, inn = this.toWorld(cf, 0, -9.2 - 5.5 + 3), mid = this.toWorld(cf, 0, 2);
      const nOut = this.navNode(out[0], out[1], 'eglise:out'), nIn = this.navNode(inn[0], inn[1], 'eglise:in'), nMid = this.navNode(mid[0], mid[1], 'eglise:mid');
      this.navLink(nOut, nIn); this.navLink(nIn, nMid);
      const B = { key: 'eglise', name: LIEU_NAMES.eglise, x: cf.x, z: cf.z, y: y0 + 0.15, f: cf, W: 10, D: 18, H: 7, door: -1, nOut, nIn, nMid, spots: {}, out };
      w.bld.eglise = B;
      this.spot(cf, B, 'work', 0, 6.5, Math.PI);
      this.bed(cf, B, 3.4, 7.3, '#2a2a3a');
      this.propRel(cf, 'bougie', -0.6, 1.15, 7.0, 0); this.propRel(cf, 'bougie', 0.6, 1.15, 7.0, 0);
      this.interRel(cf, 'bell', 'cloche', 0, 1.2, -11.6, 'Tirer la corde de la cloche');
      this.landmark('eglise', cf.x, cf.z, 14);
      for (let k = 0; k < 6; k++) this.propRel({ x: f.x - 41, y: y0, z: f.z - 38, r: 0 }, 'tombe', (k % 3) * 1.6, 0.05, Math.floor(k / 3) * 2.4, Math.PI);
    }
    // maisons d'habitation
    const homes = [['maison_a', 34.5, -30, Wd], ['maison_b', 34.5, -6, Wd], ['maison_c', 34.5, 14, Wd], ['maison_d', -34.5, 10, E], [null, -34.5, 30, E], [null, 34.5, 33, Wd], [null, -33.5, -12, E]];
    const styles = [{ wall: M_TIMBER, win: M_TIMBERWIN, roof: M_ROOF }, { wall: M_STONE, win: M_STONEWIN, roof: M_SLATE }, { wall: M_PLASTER, win: M_TIMBERWIN, roof: M_ROOF }, { wall: M_BRICK, win: M_STONEWIN, roof: M_SLATE }];
    homes.forEach(([key, lx, lz, r], i) => {
      const st = styles[i % styles.length];
      mk(key || 'vide' + i, lx, lz, 8, 7, r, { floors: 2, wall: st.wall, win: st.win, roof: st.roof, chimney: i % 2 === 0, roofH: 3 }, function (bf, W, D, B) { this.furnishHome(bf, W, D, B, { bedCol: ['#6a8ab0', '#8a3a40', '#5a7a4a', '#9a7a3a'][i % 4] }); });
    });
    // lampadaires
    for (let z = -36; z <= 36; z += 12) { if (Math.abs(z) < 10) continue; this.prop('lampadaire', f.x + 3.9, y0, f.z + z, 0); this.prop('lampadaire', f.x - 3.9, y0, f.z + z + 6, 0); }
    for (const [x, z] of [[-10, -10], [10, -10], [-10, 10], [10, 10]]) this.prop('lampadaire', f.x + x, y0, f.z + z, 0);
    for (const [x, z] of [[-3, -44], [3, -44], [-3, 44], [3, 44]]) this.prop('lanterne_sol', f.x + x, y0 + 3.2, f.z + z, 0);
    this.landmark('pont_nord', f.x, f.z - half - 5, 6);
    this.landmark('pont_sud', f.x, f.z + half + 5, 6);
    for (const k of ['mairie', 'auberge', 'boulangerie', 'poste', 'forge', 'graineterie', 'garde']) { const b = w.bld[k]; this.landmark(k, b.out[0], b.out[1], 6); }
    this.pois.push({ name: 'La ville', kind: 'town', x: f.x, z: f.z, r: half + 6 });
    return { x: f.x, z: f.z, r: half + 30, gN: [f.x, f.z - half - L - 3], gS: [f.x, f.z + half + L + 3], place };
  },

  // --------------------------------------------------------------- la vieille ferme du joueur
  farm(site) {
    const w = this.w, f = { x: site.x, y: site.y, z: site.z, r: site.r };
    this.flattenRect(f, 36, 36, f.y, 18);
    this.paintRect(f, 0, 0, 38, 38, -1, true);
    this.paintRect(f, 0, -8, 30, 26, M_GRASS, false);
    const R = (lx, lz) => this.toWorld(f, lx, lz);
    const mini = (this.gen || 1) >= 2; // nouvelles parties : une maison et un champ, rien d'autre
    // maison
    const B = this.building('ferme', { x: R(0, 2)[0], y: f.y, z: R(0, 2)[1], r: f.r }, 9, 7, { wall: M_TIMBER, win: M_TIMBERWIN, roof: M_THATCH, chimney: true }, function (bf, W, D, B) {
      this.bed(bf, B, -W / 2 + 0.9, D / 2 - 1.3, '#7a6a9a');
      this.interRel(bf, 'bed', 'lit_ferme', -W / 2 + 0.9, 0.8, D / 2 - 1.3, 'Dormir');
      this.propRel(bf, 'coffre', -W / 2 + 2.3, 0.15, D / 2 - 0.55, Math.PI);
      this.interRel(bf, 'chest', 'coffre_ferme', -W / 2 + 2.3, 0.7, D / 2 - 0.55, 'Ouvrir le coffre');
      this.propRel(bf, 'table', 1.0, 0.15, 0.6, 0); this.propRel(bf, 'chaise', 1.0, 0.15, -0.2, Math.PI); this.propRel(bf, 'chaise', 1.0, 0.15, 1.4, 0);
      this.propRel(bf, 'cheminee', W / 2 - 0.62, 0.15, 1.6, -Math.PI / 2, { lit: false });
      this.interRel(bf, 'cook', 'cheminee_ferme', W / 2 - 1.2, 0.8, 1.6, 'Cuisiner / allumer le feu');
      this.propRel(bf, 'etagere', 2.3, 0.15, D / 2 - 0.45, Math.PI, { kind: 'bocaux' });
      this.propRel(bf, 'trappe', -2.6, 0.16, -1.9, 0, { open: false });
      this.interRel(bf, 'cellar', 'cave', -2.6, 0.4, -1.9, 'Descendre à la cave');
      this.lore(bf, 1.2, 0.5, 'notaire', 0.95);
      if (mini) this.lore(bf, 0.55, 0.85, 'ferme', 0.95);
    });
    this.landmark('ferme', B.out[0], B.out[1], 30);
    if (mini) return this.farmMini(f, R, B);
    // grange (ouverte, les bêtes y dorment)
    const barn = { x: R(-16, 4)[0], y: f.y, z: R(-16, 4)[1], r: f.r };
    const bres = this.house(barn, 12, 9, { wall: M_PLANKS, win: M_PLANKS, roof: M_ROOF, dw: 3.6, dh: 3.2, found: M_STONE, floor: M_DIRT });
    this.propRel(barn, 'mangeoire', -3, 0.15, 3.6, 0, { fill: 1 });
    this.interRel(barn, 'feeder', 'mangeoire_grange', -3, 0.6, 3.1, 'Mettre du foin');
    this.propRel(barn, 'abreuvoir', 2.5, 0.15, 3.6, 0);
    this.propRel(barn, 'botte_foin', 4.6, 0.15, 1.5, 0.3); this.propRel(barn, 'botte_foin', 4.8, 0.75, 1.3, 0.1); this.propRel(barn, 'botte_foin', -4.6, 0.15, -2.8, 1.5);
    this.objRel(barn, 'lantern', 0, 0.5, 0.7, { y: f.y + 2.4 });
    w.farm = { f, barn: { x: barn.x, z: barn.z, y: f.y + 0.15, f: barn, W: 12, D: 9, door: this.toWorld(barn, 0, -4.5 - 2) } };
    w.farm.yard = { x: w.farm.barn.door[0], z: w.farm.barn.door[1], door: w.farm.barn.door };
    // poulailler (petite porte)
    const coop = { x: R(-15, -9)[0], y: f.y, z: R(-15, -9)[1], r: f.r };
    const cres = this.house(coop, 4.2, 3.6, { wall: M_PLANKS, win: M_PLANKS, roof: M_ROOF, dw: 1.0, dh: 1.5, roofH: 1.4, floors: 1, found: M_STONE, floor: M_DIRT });
    const cd = this.door(coop, cres, 'poulailler', {});
    this.propRel(coop, 'botte_foin', 1.2, 0.15, 1.0, 0, null, 0.8);
    w.farm.coop = { x: coop.x, z: coop.z, y: f.y + 0.15, f: coop, door: cd, nest: this.toWorld(coop, -1.2, 1.0) };
    // atelier (ouvert) : établi + four
    const shed = { x: R(14, 4)[0], y: f.y, z: R(14, 4)[1], r: f.r };
    this.block(shed, 0, -0.3, 0, 6.4, 0.45, 5.4, M_STONE);
    this.block(shed, 0, 0, 2.55, 6.2, 2.8, 0.3, M_PLANKS); this.block(shed, -3.05, 0, 0, 0.3, 2.8, 5.2, M_PLANKS); this.block(shed, 3.05, 0, 0, 0.3, 2.8, 5.2, M_PLANKS);
    this.block(shed, -3.0, 0, -2.5, 0.25, 2.8, 0.25, M_LOGS); this.block(shed, 3.0, 0, -2.5, 0.25, 2.8, 0.25, M_LOGS);
    this.block(shed, 0, 2.8, 0.2, 7.0, 0.3, 6.2, M_ROOF, 0, 2);
    this.propRel(shed, 'etabli', -1.2, 0.15, 1.7, Math.PI); this.interRel(shed, 'station', 'etabli_ferme', -1.2, 1.0, 1.1, "Travailler à l'établi", { st: 'etabli' });
    this.propRel(shed, 'four', 1.8, 0.15, 1.6, Math.PI, { lit: false }); this.interRel(shed, 'station', 'four_ferme', 1.8, 0.8, 0.9, 'Utiliser le four', { st: 'four' });
    this.propRel(shed, 'tonneau', -2.3, 0.15, -1.5, 0);
    this.lore(shed, -0.75, 1.75, 'ferme', 1.06);
    // puits, chien, caisse d'expédition, boîte aux lettres
    const [wx, wz] = R(7, -6);
    this.well({ x: wx, y: f.y, z: wz, r: f.r });
    this.inter('water', 'puits_ferme', wx, f.y + 1, wz, "Puiser de l'eau");
    this.propRel(f, 'niche', 6.5, 0, 0.8, Math.PI / 2);
    w.farm.niche = R(6.5, -0.4);
    this.propRel(f, 'caisse_expedition', 3.4, 0, -2.6, 0);
    this.interRel(f, 'ship', 'caisse_ferme', 3.4, 0.8, -2.6, "Caisse d'expédition");
    // champ (cases de 1 m alignées sur la grille du monde) + épouvantail
    const [fx0, fz0] = R(9, -24), [fx1, fz1] = R(27, -11);
    const field = { x0: Math.floor(Math.min(fx0, fx1)), z0: Math.floor(Math.min(fz0, fz1)), x1: Math.floor(Math.max(fx0, fx1)), z1: Math.floor(Math.max(fz0, fz1)) };
    this.forVerts((field.x0 + field.x1) / 2, (field.z0 + field.z1) / 2, 18, (i, j, k, x, z) => {
      if (x >= field.x0 - 1 && x <= field.x1 + 1 && z >= field.z0 - 1 && z <= field.z1 + 1) { w.mats[k] = M_DIRT; w.heights[k] = f.y; }
    });
    w.farm.field = field;
    const [scx, scz] = [(field.x0 + field.x1) / 2, (field.z0 + field.z1) / 2];
    this.prop('epouvantail', scx, f.y, scz, f.r + Math.PI, { v: 0 });
    // chemins
    const [rx, rz] = R(0, -36);
    this.paintLine(B.out[0], B.out[1], rx, rz, 1.4, M_DIRT);
    this.paintLine(B.out[0], B.out[1], barn.x, barn.z - 5, 1.2, M_DIRT);
    // boîte aux lettres, portillon, clôture avant
    const mb = this.propRel(f, 'boite_lettres', 2.2, 0, -33, Math.PI / 2, { mail: false });
    this.interRel(f, 'mailbox', 'boite_ferme', 2.2, 1.1, -33, 'Ouvrir la boîte aux lettres');
    w.farm.mailbox = mb;
    this.propRel(f, 'portillon', 0, 0, -32, 0, { open: true });
    for (let x = -30; x <= 30; x += 2) { if (Math.abs(x) < 2.5) continue; this.propRel(f, 'cloture', x, 0, -32, 0); }
    for (let z = -30; z <= 12; z += 2) { this.propRel(f, 'cloture', -31, 0, z, Math.PI / 2); this.propRel(f, 'cloture', 31, 0, z, Math.PI / 2); }
    this.propRel(f, 'panneau', 4, 0, -34, Math.PI);
    // tas de bois, charrette
    this.objRel(f, 'woodpile', -5.5, -1.2); this.objRel(f, 'cart', 9, 8);
    // nœuds de navigation
    this.navNode(rx, rz, 'ferme:route');
    w.farm.spawn = R(0, -4.5);
    w.farm.gate = [rx, rz];
    this.pois.push({ name: 'La vieille ferme', kind: 'farm', x: f.x, z: f.z, r: 34 });
    return { x: f.x, z: f.z, r: 44, road: [rx, rz] };
  },

  // La ferme des nouvelles parties : la maison (boîte aux lettres, tonneau de pluie) et le champ avec son épouvantail.
  // Grange, poulailler, atelier et puits se construisent ensuite (chantiers).
  farmMini(f, R, B) {
    const w = this.w, bf = B.f, W = B.W, D = B.D;
    const [tx, tz] = this.toWorld(bf, W / 2 + 0.5, -D / 2 + 1.0);
    this.prop('tonneau_pluie', tx, f.y, tz, bf.r);
    this.inter('water', 'tonneau_ferme', tx, f.y + 1.0, tz, "Puiser l'eau de pluie");
    const mb = this.propRel(bf, 'boite_lettres', 1.9, 0, -D / 2 - 1.3, Math.PI / 2, { mail: false });
    this.interRel(bf, 'mailbox', 'boite_ferme', 1.9, 1.1, -D / 2 - 1.3, 'Ouvrir la boîte aux lettres');
    w.farm = { f, barn: null, coop: null, mailbox: mb, mini: true };
    w.farm.niche = this.toWorld(bf, -1.5, -D / 2 - 1.1); // le chien dort sur le seuil
    w.farm.yard = { x: R(-6, -12)[0], z: R(-6, -12)[1], door: R(-6, -12) };
    // champ (cases de 1 m alignées sur la grille du monde) + épouvantail
    const [fx0, fz0] = R(9, -24), [fx1, fz1] = R(27, -11);
    const field = { x0: Math.floor(Math.min(fx0, fx1)), z0: Math.floor(Math.min(fz0, fz1)), x1: Math.floor(Math.max(fx0, fx1)), z1: Math.floor(Math.max(fz0, fz1)) };
    this.forVerts((field.x0 + field.x1) / 2, (field.z0 + field.z1) / 2, 18, (i, j, k, x, z) => {
      if (x >= field.x0 - 1 && x <= field.x1 + 1 && z >= field.z0 - 1 && z <= field.z1 + 1) { w.mats[k] = M_DIRT; w.heights[k] = f.y; }
    });
    w.farm.field = field;
    this.prop('epouvantail', (field.x0 + field.x1) / 2, f.y, (field.z0 + field.z1) / 2, f.r + Math.PI, { v: 0 });
    // chemin jusqu'à la route
    const [rx, rz] = R(0, -36);
    this.paintLine(B.out[0], B.out[1], rx, rz, 1.4, M_DIRT);
    this.navNode(rx, rz, 'ferme:route');
    w.farm.spawn = R(0, -4.5);
    w.farm.gate = [rx, rz];
    this.pois.push({ name: 'La vieille ferme', kind: 'farm', x: f.x, z: f.z, r: 34 });
    // même tirage et mêmes zones réservées que la ferme d'origine : le reste de la vallée ne change pas
    for (let k = 0; k < 8; k++) this.rnd();
    const barnF = { x: R(-16, 4)[0], y: f.y, z: R(-16, 4)[1], r: f.r }, coopF = { x: R(-15, -9)[0], y: f.y, z: R(-15, -9)[1], r: f.r };
    this.paintRect(barnF, 0, 0, 12 / 2 + 0.4, 9 / 2 + 0.4, -1, true);
    this.paintRect(coopF, 0, 0, 4.2 / 2 + 0.4, 3.6 / 2 + 0.4, -1, true);
    const [ax, az, bx, bz] = [B.out[0], B.out[1], barnF.x, barnF.z - 5], dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1;
    this.forVerts((ax + bx) / 2, (az + bz) / 2, Math.sqrt(L2) / 2 + 1.2 + 2, (i, j, k, x, z) => {
      const t = clamp(((x - ax) * dx + (z - az) * dz) / L2, 0, 1);
      if (Math.hypot(x - (ax + dx * t), z - (az + dz * t)) < 1.2 && w.heights[k] > w.waterLevel + 0.2) this.reserved[k] = 1;
    });
    return { x: f.x, z: f.z, r: 44, road: [rx, rz] };
  },

  // --------------------------------------------------------------- le hameau et le ranch
  hamlet(site) {
    const w = this.w, rnd = this.rnd, f = { x: site.x, y: site.y, z: site.z, r: Math.floor(rnd() * 4) * Math.PI / 2 };
    this.flatten(f.x, f.z, 30, f.y, 18);
    this.paintDisk(f.x, f.z, 6, M_DIRT, 2, true);
    this.paintDisk(f.x, f.z, 44, -1, 0, true);
    const R = (lx, lz) => this.toWorld(f, lx, lz);
    this.well({ x: f.x, y: f.y, z: f.z, r: 0 });
    this.inter('water', 'puits_hameau', f.x, f.y + 1, f.z, "Puiser de l'eau");
    const sub = (lx, lz, rr) => ({ x: R(lx, lz)[0], y: f.y, z: R(lx, lz)[1], r: f.r + rr });
    this.building('ranch', sub(0, 16, 0), 10, 8, { floors: 2, wall: M_TIMBER, win: M_TIMBERWIN, roof: M_ROOF, chimney: true }, function (bf, W, D, B) {
      this.furnishHome(bf, W, D, B, { bedCol: '#8a4a2a', shelf: 'bocaux' });
      this.spot(bf, B, 'work', 0, 0, 0);
    });
    this.building('maison_hameau_a', sub(-15, -4, -Math.PI / 2), 7, 6, { wall: M_STONE, win: M_STONEWIN, roof: M_THATCH }, function (bf, W, D, B) { this.furnishHome(bf, W, D, B, {}); });
    this.building('maison_hameau_b', sub(15, -4, Math.PI / 2), 7, 6, { wall: M_TIMBER, win: M_TIMBERWIN, roof: M_THATCH, chimney: true }, function (bf, W, D, B) { this.furnishHome(bf, W, D, B, {}); });
    // grande grange + enclos du ranch
    const barn = sub(18, 20, 0);
    this.house(barn, 12, 9, { wall: M_PLANKS, win: M_PLANKS, roof: M_ROOF, dw: 3.6, dh: 3.2, found: M_STONE, floor: M_DIRT });
    const pen = sub(-14, 22, 0);
    this.fence(pen, 11, 7);
    this.objRel(pen, 'hay', 8, 5, 1.1);
    this.propRel(pen, 'abreuvoir', -6, 0, 4.5, 0);
    for (let k = 0; k < 2; k++) this.objRel(pen, 'horse', -4 + k * 5, 0);
    this.objRel(pen, 'cow', 3, -3); this.objRel(pen, 'sheep', -2, 3); this.objRel(pen, 'sheep', 0, 4);
    for (let k = 0; k < 5; k++) this.obj('hen', f.x + (rnd() - 0.5) * 14, f.z + (rnd() - 0.5) * 14);
    this.landmark('hameau', f.x, f.z, 30);
    this.landmark('ranch', pen.x, pen.z, 14);
    w.ranch = { pen: { x: pen.x, z: pen.z }, deliver: R(0, 6) };
    const c = this.navNode(f.x + 3, f.z + 3, 'hameau');
    this.navNode(pen.x, pen.z - 9, 'ranch');
    this.pois.push({ name: 'Le hameau', kind: 'village', x: f.x, z: f.z, r: 30 });
    return { x: f.x, z: f.z, r: 46 };
  },

  // --------------------------------------------------------------- lac : cabane du pêcheur, ponton, phare
  fisherHut(site, lake) {
    const w = this.w, f = { x: site.x, y: site.y, z: site.z, r: Math.atan2(-(lake.x - site.x), -(lake.z - site.z)) + Math.PI };
    // la porte fait face au lac
    const dx = lake.x - site.x, dz = lake.z - site.z, dl = Math.hypot(dx, dz);
    f.r = Math.atan2(-dx / dl, -dz / dl);
    this.flatten(f.x, f.z, 7, f.y, 5);
    this.paintDisk(f.x, f.z, 9, -1, 0, true);
    this.building('cabane_pecheur', f, 6, 5, { wall: M_LOGS, win: M_LOGS, roof: M_PLANKS, chimney: true }, function (bf, W, D, B) {
      this.bed(bf, B, -W / 2 + 0.85, D / 2 - 1.3, '#4a5a6a');
      this.propRel(bf, 'table', 1.2, 0.15, 0.2, 0); this.propRel(bf, 'tonneau', 2.2, 0.15, 1.5, 0);
      this.propRel(bf, 'cheminee', W / 2 - 0.62, 0.15, D / 2 - 1.3, -Math.PI / 2, { lit: true });
      this.spot(bf, B, 'work', 1.2, -0.6, Math.PI);
    });
    // ponton vers le lac
    const px = site.x + dx / dl * 5, pz = site.z + dz / dl * 5;
    const pr = Math.atan2(dx / dl, dz / dl);
    this.prop('ponton', px, w.waterLevel + 0.45, pz, pr, { L: 12 });
    const ex = px + dx / dl * 11, ez = pz + dz / dl * 11;
    for (let k = 1; k <= 12; k += 1) {
      const qx = px + dx / dl * k, qz = pz + dz / dl * k;
      this.w.blocks.push({ x: qx, y: w.waterLevel + 0.3, z: qz, sx: 1.8, sy: 0.14, sz: 1.05, r: pr, m: M_PLANKS, sh: 0, hidden: true });
    }
    this.prop('barque', ex + dz / dl * 2.5, w.waterLevel - 0.05, ez - dx / dl * 2.5, pr + 0.4);
    this.landmark('ponton', ex, ez, 6, { fish: 'lac' });
    this.landmark('cabane_pecheur', f.x, f.z, 8);
    this.navNode(px - dx / dl * 1.5, pz - dz / dl * 1.5, 'ponton');
    return { x: site.x, z: site.z, r: 14 };
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
    this.prop('lanterne_sol', site.x, y0 + y + 0.4, site.z, 0);
    this.lore(f, 3.6, 0.5, 'phare');
    this.landmark('phare', site.x, site.z, 10);
    this.pois.push({ name: 'Le phare', kind: 'lighthouse', x: site.x, z: site.z, r: 10 });
    return { x: site.x, z: site.z, r: 12 };
  },

  // --------------------------------------------------------------- forêt : hutte de la guérisseuse
  healerHut(site) {
    const w = this.w, f = { x: site.x, y: site.y, z: site.z, r: this.rnd() * TAU };
    this.flatten(f.x, f.z, 9, f.y, 6);
    this.paintDisk(f.x, f.z, 7, M_DIRT, 3, true);
    this.paintDisk(f.x, f.z, 16, -1, 0, true);
    this.building('hutte_ermite', f, 6, 6, { wall: M_LOGS, win: M_LOGS, roof: M_THATCH, chimney: true, roofH: 2.6 }, function (bf, W, D, B) {
      this.bed(bf, B, -W / 2 + 0.85, D / 2 - 1.3, '#5a3a5a');
      this.propRel(bf, 'etagere', 2.6, 0.15, D / 2 - 0.45, Math.PI, { kind: 'bocaux' });
      this.propRel(bf, 'table', 1.0, 0.15, 0.0, 0.3); this.propRel(bf, 'jarre', -2.4, 0.15, -1.8, 0);
      this.propRel(bf, 'bougie', 0.8, 0.9, 0.1, 0); this.propRel(bf, 'bougie', 1.3, 0.9, -0.2, 0);
      this.spot(bf, B, 'work', 1.0, -0.8, Math.PI);
    });
    this.propRel(f, 'feu_camp', 4.5, 0, -4, 0);
    for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; this.obj('herbs', f.x + Math.cos(a) * 6.5, f.z + Math.sin(a) * 6.5); }
    this.obj('bones', f.x - 5, f.z + 3);
    this.landmark('hutte_ermite', f.x, f.z, 12);
    this.pois.push({ name: 'La hutte', kind: 'hut', x: f.x, z: f.z, r: 12 });
    return { x: f.x, z: f.z, r: 18 };
  },

  // --------------------------------------------------------------- lieux-dits
  windmill(site) {
    const w = this.w, f = { x: site.x, y: site.y, z: site.z, r: this.rnd() * TAU };
    this.flatten(f.x, f.z, 7, f.y, 6);
    this.paintDisk(f.x, f.z, 9, M_DIRT, 3, true);
    let y = -0.5;
    for (let k = 0; k < 4; k++) { const s = 6 - k * 0.6; this.block(f, 0, y, 0, s, 3.2, s, M_STONE); this.block(f, 0, y, 0, s * 0.7, 3.2, s * 1.02, M_STONE, Math.PI / 4); y += 3.2; }
    this.block(f, 0, y, 0, 4.4, 3, 4.4, M_THATCH, 0, 3);
    this.block(f, 0, 0, -3.02, 1.4, 2.2, 0.1, M_PLANKS);
    // ailes : version 1 = elles tournent ; autres versions : arrêtées ou absentes
    const [ax, az] = this.toWorld(f, 0, -3.4);
    this.prop('moulin_ailes', ax, f.y + y - 1.2, az, f.r + Math.PI, { stop: false }, 1, 0x1 | 0x4);
    this.prop('moulin_ailes', ax, f.y + y - 1.2, az, f.r + Math.PI, { stop: true, phase: 0.4 }, 1, 0x2 | VER_ENVERS);
    this.lore(f, 2.5, -4.5, 'moulin');
    this.landmark('moulin', f.x, f.z, 12);
    this.pois.push({ name: 'Le vieux moulin', kind: 'mill', x: f.x, z: f.z, r: 12 });
    return { x: f.x, z: f.z, r: 14 };
  },
  stoneCircle(site) {
    const w = this.w, rnd = this.rnd, f = { x: site.x, y: site.y - 0.2, z: site.z, r: rnd() * TAU };
    this.flatten(site.x, site.z, 12, site.y, 8);
    this.paintDisk(site.x, site.z, 12, -1, 0, true);
    const n = 11;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * TAU;
      this.propRel(f, 'pierre_dressee', Math.cos(a) * 9, 0, Math.sin(a) * 9, -a, null, 0.85 + rnd() * 0.4);
    }
    // une douzième pierre qui n'existe que dans certaines versions
    this.propRel(f, 'pierre_dressee', Math.cos(TAU * 11.5 / n) * 9, 0, Math.sin(TAU * 11.5 / n) * 9, 0, null, 1.2, 0x4 | 0x8 | VER_ENVERS);
    this.propRel(f, 'autel', 0, 0, 0, 0);
    this.interRel(f, 'altar', 'autel_cercle', 0, 1.1, 0, "Examiner l'autel");
    this.landmark('cercle', site.x, site.z, 13);
    this.pois.push({ name: 'Le cercle de pierres', kind: 'henge', x: site.x, z: site.z, r: 13 });
    return { x: site.x, z: site.z, r: 16 };
  },
  chapel(site) {
    const w = this.w, rnd = this.rnd, f = { x: site.x, y: site.y, z: site.z, r: rnd() * TAU };
    this.flatten(f.x, f.z, 12, f.y, 8);
    this.paintDisk(f.x, f.z, 14, -1, 0, true);
    const W = 7, D = 11, H = 5, t = 0.45;
    this.block(f, 0, -1, 0, W + 0.4, 1.05, D + 0.4, M_MOSSY);
    this.block(f, 0, 0.05, 0, W - 0.5, 0.1, D - 0.5, M_COBBLE);
    this.block(f, 0, 0, D / 2 - t / 2, W, H, t, M_MOSSY);
    this.block(f, -W / 2 + t / 2, 0, 0, t, H * 0.8, D - 2 * t, M_MOSSY);
    this.block(f, W / 2 - t / 2, 0, -1, t, H, D - 2 * t - 2, M_MOSSY);
    this.block(f, -2.3, 0, -D / 2 + t / 2, 2.4, H, t, M_MOSSY); this.block(f, 2.3, 0, -D / 2 + t / 2, 2.4, H, t, M_MOSSY);
    this.block(f, 0, 2.8, -D / 2 + t / 2, 2.2, H - 2.8, t, M_MOSSY);
    this.block(f, 1.2, H, 1.5, W * 0.6, 0.35, D * 0.5, M_SLATE, 0.2);
    // flèche : présente dans certaines versions seulement
    this.block(f, 0, H, -D / 2 + 1, 2, 5, 2, M_SLATE, 0, 3); w.blocks[w.blocks.length - 1].ver = 0x1 | 0x2;
    this.propRel(f, 'autel', 0, 0.15, D / 2 - 1.3, 0);
    this.propRel(f, 'croix', 0, 1.15, D / 2 - 0.9, 0, null, 0.5);
    this.propRel(f, 'bougie', -0.5, 1.15, D / 2 - 1.3, 0); this.propRel(f, 'figurine', 0.6, 1.15, D / 2 - 1.2, 0.5);
    this.propRel(f, 'trappe', -1.8, 0.16, 2.5, 0, { open: false });
    this.interRel(f, 'crypt', 'crypte', -1.8, 0.4, 2.5, 'Examiner la trappe');
    for (let k = 0; k < 3; k++) this.propRel(f, 'banc', (k % 2 ? 1.4 : -1.4), 0.15, -2 + k * 1.6, (rnd() - 0.5) * 0.4);
    this.lore(f, 1.4, -1.0, 'chapelle', 0.66);
    for (let k = 0; k < 5; k++) { const a = rnd() * TAU, r = 8 + rnd() * 4; this.propRel(f, 'tombe', Math.cos(a) * r, 0, Math.sin(a) * r, rnd() * TAU); }
    const [alx, alz] = this.toWorld(f, 0.3, D / 2 - 1.3);
    this.landmark('chapelle', f.x, f.z, 14, { altar: [alx, f.y + 1.17, alz] });
    this.pois.push({ name: 'La chapelle', kind: 'chapel', x: f.x, z: f.z, r: 14 });
    return { x: f.x, z: f.z, r: 18 };
  },
  ghostHamlet(site) {
    const w = this.w, rnd = this.rnd, f = { x: site.x, y: site.y, z: site.z, r: rnd() * TAU };
    this.flatten(f.x, f.z, 24, f.y, 14);
    this.paintDisk(f.x, f.z, 5, M_DIRT, 2, true);
    this.paintDisk(f.x, f.z, 32, -1, 0, true);
    // le vieux puits, sans eau
    const wf = { x: f.x, y: f.y, z: f.z, r: f.r };
    this.well(wf);
    this.inter('oldwell', 'vieux_puits', f.x, f.y + 1, f.z, 'Se pencher au-dessus du puits');
    // maisons en ruine (toits effondrés)
    for (let k = 0; k < 4; k++) {
      const a = f.r + k * TAU / 4 + 0.3, d = 14;
      const hf = { x: f.x + Math.cos(a) * d, y: f.y, z: f.z + Math.sin(a) * d, r: Math.atan2(-(f.x - (f.x + Math.cos(a) * d)), -(f.z - (f.z + Math.sin(a) * d))) };
      const W = 6, D = 5, t = 0.3, H = 2.6 - k * 0.3;
      this.block(hf, 0, -0.8, 0, W + 0.2, 0.85, D + 0.2, M_MOSSY);
      this.block(hf, 0, 0, D / 2 - t / 2, W, H, t, M_MOSSY);
      this.block(hf, -W / 2 + t / 2, 0, 0, t, H * 0.7, D - 2 * t, M_MOSSY);
      if (k !== 1) this.block(hf, W / 2 - t / 2, 0, 0, t, H, D - 2 * t, M_MOSSY);
      this.block(hf, -1.8, 0, -D / 2 + t / 2, 2.4, H * 0.6, t, M_MOSSY);
      this.block(hf, 1.2, H * 0.6, 0.5, W * 0.5, 0.25, D * 0.4, M_PLANKS, 0.4);
      if (k === 2) this.propRel(hf, 'poupee', 0.5, 0.05, 1.2, 2.4);
      if (k === 0) this.lore(hf, -1.2, 1.2, 'hameau_abandonne', 0.05);
      // une maison intacte qui n'apparaît que dans certaines versions du monde
      if (k === 3) {
        this.block(hf, 0, 0, -D / 2 + t / 2, W, H, t, M_TIMBERWIN); w.blocks[w.blocks.length - 1].ver = 0x8 | VER_ENVERS;
        this.block(hf, 0, H, 0, W + 0.6, 2.2, D + 0.6, M_THATCH, 0, 1); w.blocks[w.blocks.length - 1].ver = 0x8 | VER_ENVERS;
      }
    }
    for (let k = 0; k < 6; k++) this.obj('deadtree', f.x + (rnd() - 0.5) * 50, f.z + (rnd() - 0.5) * 50);
    this.landmark('hameau_abandonne', f.x, f.z, 24);
    this.landmark('vieux_puits', f.x, f.z, 4);
    this.pois.push({ name: 'Le hameau abandonné', kind: 'ghost', x: f.x, z: f.z, r: 24 });
    return { x: f.x, z: f.z, r: 34 };
  },
  cemetery(site) {
    const w = this.w, rnd = this.rnd, f = { x: site.x, y: site.y, z: site.z, r: rnd() * TAU };
    this.flatten(f.x, f.z, 13, f.y, 8);
    this.paintDisk(f.x, f.z, 15, -1, 0, true);
    for (const [x0, z0, x1, z1] of [[-11, -9, 11, -9], [-11, 9, 11, 9], [-11, -9, -11, 9], [11, -9, 11, 9]]) {
      const L = Math.hypot(x1 - x0, z1 - z0), n = Math.round(L / 2), a = Math.atan2(x1 - x0, z1 - z0);
      for (let k = 0; k < n; k++) { if (z0 === -9 && z1 === -9 && Math.abs(lerp(x0, x1, (k + 0.5) / n)) < 2) continue; this.propRel(f, 'cloture_pierre', lerp(x0, x1, (k + 0.5) / n), 0, lerp(z0, z1, (k + 0.5) / n), a + Math.PI / 2); }
    }
    const graves = [];
    for (let u = -8; u <= 8; u += 2.2) for (let v = -6; v <= 6; v += 3) {
      if (Math.abs(u) < 1.5) continue;
      if (rnd() < 0.8) { this.propRel(f, 'tombe', u, 0, v, Math.PI + (rnd() - 0.5) * 0.15); graves.push(this.toWorld(f, u, v)); }
      else { this.propRel(f, 'croix', u, 0, v, Math.PI); graves.push(this.toWorld(f, u, v)); }
    }
    this.obj('deadtree', f.x + 6, f.z - 2);
    this.lore(f, -3, -7, 'cimetiere');
    // tombes des versions précédentes (inscriptions lues à la volée)
    w.graves = graves.map(([x, z], i) => ({ x, z, i }));
    for (const g of w.graves) this.inter('grave', 'tombe' + g.i, g.x, f.y + 0.9, g.z, 'Lire l’inscription', { i: g.i });
    this.landmark('cimetiere', f.x, f.z, 13);
    this.navNode(f.x, f.z - 11, 'cimetiere');
    this.pois.push({ name: 'Le cimetière', kind: 'graveyard', x: f.x, z: f.z, r: 13 });
    return { x: f.x, z: f.z, r: 16, newGrave: this.toWorld(f, 0, 7.5) };
  },
  watchtower(site) {
    const w = this.w, f = { x: site.x, y: site.y, z: site.z, r: this.rnd() * TAU };
    this.flatten(f.x, f.z, 6, f.y, 5);
    this.paintDisk(f.x, f.z, 8, -1, 0, true);
    const S = 5, H = 14;
    for (const [lx, lz] of [[-S / 2, -S / 2], [S / 2, -S / 2], [-S / 2, S / 2], [S / 2, S / 2]]) this.block(f, lx, -0.5, lz, 0.5, H + 0.5, 0.5, M_LOGS);
    for (let y = 3; y < H; y += 3.5) { this.block(f, 0, y, -S / 2, S, 0.25, 0.25, M_LOGS); this.block(f, 0, y, S / 2, S, 0.25, 0.25, M_LOGS); this.block(f, -S / 2, y, 0, 0.25, 0.25, S, M_LOGS); this.block(f, S / 2, y, 0, 0.25, 0.25, S, M_LOGS); }
    this.block(f, 0, H, 0.6, S + 1, 0.3, S - 0.2, M_PLANKS);
    this.block(f, -1.4, H, -2.4, S - 1.8, 0.3, 1.2, M_PLANKS);
    for (const s of [-1, 1]) { this.block(f, s * (S / 2 + 0.4), H + 0.3, 0, 0.15, 1.0, S + 1, M_PLANKS); this.block(f, 0, H + 0.3, s * (S / 2 + 0.4), S + 1, 1.0, 0.15, M_PLANKS); }
    this.block(f, 0, H + 2.6, 0, S + 1.6, 2, S + 1.6, M_THATCH, 0, 3);
    for (const [lx, lz] of [[-S / 2, -S / 2], [S / 2, -S / 2], [-S / 2, S / 2], [S / 2, S / 2]]) this.block(f, lx, H + 0.3, lz, 0.25, 2.3, 0.25, M_LOGS);
    // échelle : on grimpe (téléportation) entre le pied et la plate-forme
    this.propRel(f, 'echelle', 1.6, -0.1, -2.2, 0, { h: H + 0.6 });
    const [bx, bz] = this.toWorld(f, 1.6, -1.6), [tx0, tz0] = this.toWorld(f, 0.4, 0.6);
    this.inter('ladder', 'tour_bas', bx, f.y + 1.0, bz, 'Grimper à l’échelle', { to: [tx0, f.y + H + 0.3, tz0] });
    this.inter('ladder', 'tour_haut', tx0 + (bx - tx0) * 0.35, f.y + H + 1.0, tz0 + (bz - tz0) * 0.35, 'Descendre l’échelle', { to: [bx, f.y, bz] });
    this.lore(f, 1.4, 1.4, 'tour', H + 0.3);
    this.landmark('tour', f.x, f.z, 8);
    this.pois.push({ name: 'La tour de guet', kind: 'tower', x: f.x, z: f.z, r: 8 });
    return { x: f.x, z: f.z, r: 10 };
  },
  swampShack(site) {
    const w = this.w, f = { x: site.x, y: Math.max(site.y, w.waterLevel) + 0.9, z: site.z, r: this.rnd() * TAU };
    this.paintDisk(site.x, site.z, 10, -1, 0, true);
    for (const [lx, lz] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) this.block(f, lx, -3, lz, 0.3, 3.1, 0.3, M_LOGS);
    this.block(f, 0, 0, 0, 5, 0.2, 5, M_PLANKS);
    this.block(f, 0, 0.2, 2.35, 5, 2.4, 0.3, M_PLANKS); this.block(f, -2.35, 0.2, 0, 0.3, 2.4, 4.4, M_PLANKS); this.block(f, 2.35, 0.2, 0.6, 0.3, 2.4, 3.2, M_PLANKS);
    this.block(f, -1.4, 0.2, -2.35, 2.2, 2.4, 0.3, M_PLANKS);
    this.block(f, 0, 2.6, 0, 5.6, 1.6, 5.6, M_THATCH, 0.2, 1);
    this.block(f, 0, -0.9, -4, 1.2, 0.2, 3.5, M_PLANKS, 0, 2);
    this.propRel(f, 'lit', -1.2, 0.2, 1.2, Math.PI, { col: '#3a3a2a' });
    this.propRel(f, 'ossements', -1.0, 0.95, 1.2, 0);
    this.propRel(f, 'bougie', 1.5, 0.2, 1.8, 0);
    this.lore(f, 1.0, 0.5, 'marais', 0.2);
    this.landmark('marais', site.x, site.z, 30, { fish: 'marais' });
    this.pois.push({ name: 'Le marais', kind: 'swamp', x: site.x, z: site.z, r: 20 });
    return { x: site.x, z: site.z, r: 12 };
  },
  ruins(site) {
    const w = this.w, rnd = this.rnd, f = { x: site.x, y: site.y, z: site.z, r: rnd() * TAU };
    this.flatten(f.x, f.z, 12, f.y, 8);
    this.paintDisk(f.x, f.z, 14, -1, 0, true);
    for (let k = 0; k < 9; k++) {
      const a = k / 9 * TAU, r = 7 + rnd() * 2;
      const h = 1 + rnd() * 4;
      this.block(f, Math.cos(a) * r, -0.5, Math.sin(a) * r, 1.4, h, 1.4, M_MOSSY, rnd());
      if (k % 3 === 0 && h > 3) this.block(f, Math.cos(a) * r + 1.2, h - 0.5, Math.sin(a) * r, 3, 0.7, 1.2, M_MOSSY, a);
    }
    this.block(f, 0, -0.4, 0, 6, 0.5, 6, M_COBBLE);
    this.propRel(f, 'coffre_enterre', 2.2, 0.12, 1.5, 0.3);
    this.interRel(f, 'dig', 'tresor_ruines', 2.2, 0.3, 1.5, 'Creuser ici', { loot: 'ruines' });
    this.lore(f, -1.5, -1.5, 'ruines');
    this.landmark('ruines', f.x, f.z, 14);
    this.pois.push({ name: 'Les ruines', kind: 'ruins', x: f.x, z: f.z, r: 14 });
    return { x: f.x, z: f.z, r: 16 };
  },
  giantOak(site) {
    this.obj('giantoak', site.x, site.z, 26);
    this.paintDisk(site.x, site.z, 14, -1, 0, true);
    this.lore({ x: site.x, y: site.y, z: site.z, r: 0 }, 3.5, 2.5, 'chene');
    this.landmark('chene', site.x, site.z, 16);
    this.pois.push({ name: 'Le chêne millénaire', kind: 'oak', x: site.x, z: site.z, r: 16 });
    return { x: site.x, z: site.z, r: 20 };
  },
});
