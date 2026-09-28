// ============================================================================
//  GÉNÉRATEUR (suite) : nouveaux lieux, secrets, grottes cachées, sanctuaires,
//  panneaux, faune. Tout est ajouté APRÈS le reste avec son propre hasard :
//  les parties déjà commencées gardent leurs objets et leurs index.
// ============================================================================
// Salles souterraines supplémentaires (sous le relief du bord de la vallée)
const UNDER_SLOTS = { grotte_cristaux: [190, 60], scriptorium: [270, 60], frappeurs: [350, 60], cercle: [430, 60], antre: [60, 230], grotte_contrebandiers: [60, 310], grotte_peinte: [60, 390] };

function addWonders(w, B, seed, ctx) {
  const rnd = mulberry32(seed * 131 + 29);
  B.rnd = rnd;
  const lm = w.lm, WL = w.waterLevel, F = ctx.farm, T = ctx.town, FF = w.farm.f;
  w.secrets = []; w.signs = []; w.mapBoards = []; w.caves = {}; w.shrines = [];
  const mine = [];
  const inter = (kind, id, x, y, z, name, data) => B.inter(kind, id, x, y, z, name, data);
  const H = (x, z) => w.heightAt(x, z);
  const dry = (x, z, m = 0.8) => w.inside(x, z, 40) && H(x, z) > WL + m;
  const road = (x, z) => w.matAt(x, z) === M_DIRT || w.matAt(x, z) === M_COBBLE;
  const busy = (x, z, r) => {
    for (const k in lm) { const L = lm[k]; if (Math.hypot(L.x - x, L.z - z) < (L.r || 10) + r + 6) return true; }
    for (const q of mine) if (Math.hypot(q.x - x, q.z - z) < q.r + r + 6) return true;
    if (Math.max(Math.abs(x - T.x), Math.abs(z - T.z)) < 100 + r) return true;
    if (Math.hypot(x - F.x, z - F.z) < 60 + r) return true;
    for (const k in w.bld || {}) { const b = w.bld[k]; if (Math.hypot(b.x - x, b.z - z) < 14 + r) return true; }
    return false;
  };
  const spreadAt = (x, z, r) => { let mn = 1e9, mx = -1e9; for (let a = 0; a < 8; a++) { const h = H(x + Math.cos(a * 0.785) * r, z + Math.sin(a * 0.785) * r); mn = Math.min(mn, h); mx = Math.max(mx, h); } return mx - mn; };
  const DSG = ctx.design ? ctx.design.wonders : null;
  const find = (r, test, from, dMin, dMax, tries = 700, key) => {
    if (key && DSG && DSG[key]) { const [x, z] = DSG[key]; return { x, z, y: H(x, z) }; }
    for (let k = 0; k < tries; k++) {
      const a = rnd() * TAU, d = lerp(dMin, dMax, Math.sqrt(rnd()));
      const x = from.x + Math.cos(a) * d, z = from.z + Math.sin(a) * d;
      if (!dry(x, z, 1.2) || busy(x, z, r) || road(x, z)) continue;
      if (test && !test(x, z)) continue;
      return { x, z, y: H(x, z) };
    }
    return null;
  };
  const take = (s, r, key, extra) => { mine.push({ x: s.x, z: s.z, r }); if (key) B.landmark(key, s.x, s.z, r, extra); return s; };
  const clear = (x, z, r) => { w.grid = null; w.query(x, z, r, (o) => { if (o && !OBJ_TYPES[o.t].animal && Math.hypot(o.x - x, o.z - z) < r) { o.gone = true; o.cleared = true; } }, null); w.grid = null; };
  const shrine = (faith, key, x, y, z, name, extra) => { const it = inter('pray', 'pri_' + key, x, y, z, name || 'Prier', Object.assign({ faith, shrine: key }, extra || {})); w.shrines.push(it); return it; };
  const under = (key, W, D, Hh, mat, floor) => { const [ux, uz] = UNDER_SLOTS[key]; return B.underRoom(ux, uz, W, D, Hh, 28, mat, floor); };
  const ladder = (cf, lx, lz, to, name, id) => { B.propRel(cf, 'echelle', lx, 0, lz, 0, { h: 3.2 }); const [x, z] = B.toWorld(cf, lx, lz); inter('ladder', id, x, cf.y + 1.0, z, name || 'Remonter', { to }); };
  const box = (id, x, y, z, table, lid, ver) => { const p = B.prop(id, x, y, z, rnd() * TAU, id === 'coffre_vieux' ? { vide: false } : null, 1, ver); inter('loot', lid, x, y + 0.6, z, 'Fouiller', { table, prop: w.props.length - 1 }); return p; };
  const pickup = (id, item, x, y, z, propId, name) => { const p = B.prop(propId || 'relique_sol', x, y, z, 0); inter(ITEMS[item] && ITEMS[item].cat === 'relique' ? 'relic' : 'pickup', id, x, y + 0.4, z, name || 'Ramasser', { item, prop: w.props.length - 1 }); return p; };
  // flanc de colline : un endroit où le relief monte fort dans une direction (entrée de grotte)
  const hillside = (test, from, dMin, dMax, key) => {
    if (key && DSG && DSG[key]) { const [x, z, dir] = DSG[key]; return { x, z, y: H(x, z), dir }; }
    for (let k = 0; k < 900; k++) {
      const a = rnd() * TAU, d = lerp(dMin, dMax, Math.sqrt(rnd()));
      const x = from.x + Math.cos(a) * d, z = from.z + Math.sin(a) * d;
      if (!dry(x, z, 2) || busy(x, z, 6) || road(x, z) || (test && !test(x, z))) continue;
      const h0 = H(x, z);
      for (let q = 0; q < 8; q++) {
        const ang = q / 8 * TAU, dx = Math.sin(ang), dz = Math.cos(ang);
        const rise = H(x + dx * 10, z + dz * 10) - h0, back = H(x - dx * 6, z - dz * 6) - h0;
        if (rise > 4.5 && back < 1.5 && back > -3) return { x, z, y: h0, dir: ang };
      }
    }
    return null;
  };
  // nom d'un point cardinal
  const card = (a) => ['le nord', 'le nord-est', 'l’est', 'le sud-est', 'le sud', 'le sud-ouest', 'l’ouest', 'le nord-ouest'][Math.round(((Math.PI - a) / TAU) * 8 + 8) % 8];
  w.cardinal = card;

  // ------------------------------------------------------------ l'église : bénitier, autel, bancs
  const E = w.bld.eglise;
  if (E) {
    const cf = E.f;
    B.propRel(cf, 'benitier', 2.1, 0.15, -7.9, 0);
    const [bx, bz] = B.toWorld(cf, 2.1, -7.9);
    inter('benitier', 'benitier', bx, cf.y + 1.1, bz, 'Tremper la main dans le bénitier');
    const [ax, az] = B.toWorld(cf, 0, 5.4);
    shrine('eglise', 'eglise', ax, cf.y + 1.0, az, 'S’agenouiller et prier');
    let i = 0;
    for (let k = 0; k < 5; k++) for (const sd of [-1, 1]) for (const dx of [-0.8, 0.8]) {
      const [x, z] = B.toWorld(cf, sd * 2.4 + dx, -4 + k * 2.2);
      E.spots['banc' + i++] = { x, y: cf.y + 0.24, z, r: cf.r };
    }
    E.pews = i;
  }
  // chapelle abandonnée, crypte : on peut y prier aussi (pas toujours la même chose)
  if (lm.chapelle && lm.chapelle.altar) { const [x, y, z] = lm.chapelle.altar; shrine('eglise', 'chapelle', x - 0.6, y, z - 0.6, 'Prier dans la chapelle'); }
  if (w.crypt) shrine('dessous', 'crypte', w.crypt.x, w.crypt.y + 1.0, w.crypt.z - 1.8, 'S’agenouiller devant l’autel noir');

  // ------------------------------------------------------------ la pierre aux offrandes (Mère des Moissons), au bord du champ
  {
    const [x, z] = B.toWorld(FF, 34.5, -18);
    if (dry(x, z, 0.3)) {
      B.prop('pierre_offrandes', x, H(x, z), z, FF.r + Math.PI / 2, { offer: null });
      shrine('anciens', 'mere', x, H(x, z) + 0.9, z, 'Déposer une offrande', { prop: w.props.length - 1 });
      B.landmark('pierre_offrandes', x, z, 4);
    }
  }
  // ------------------------------------------------------------ la pierre de la Dame, sur la rive du grand lac
  {
    const L = ctx.mainLake;
    for (let k = 0; k < 120; k++) {
      const a = rnd() * TAU, d = L.r * (0.95 + rnd() * 0.4), x = L.x + Math.cos(a) * d, z = L.z + Math.sin(a) * d;
      const h = H(x, z);
      if (h < WL + 0.35 || h > WL + 2.2 || busy(x, z, 3)) continue;
      const r = Math.atan2(L.x - x, L.z - z);
      B.prop('pierre_dame', x, h, z, r, { offer: false });
      shrine('anciens', 'dame', x + Math.sin(r) * 1.2, h + 1.0, z + Math.cos(r) * 1.2, 'Parler à la Dame', { prop: w.props.length - 1 });
      take({ x, z }, 4, 'pierre_dame');
      break;
    }
  }
  // ------------------------------------------------------------ la clairière du Cerf (cachée dans le bois de bouleaux)
  {
    const s = find(13, (x, z) => ctx.forestAt(x, z) > 0.22 && ctx.birchAt(x, z) && spreadAt(x, z, 10) < 3.5, F, 280, 950, 700, 'clairiere')
      || find(13, (x, z) => ctx.forestAt(x, z) > 0.2 && spreadAt(x, z, 10) < 4, F, 280, 950);
    if (s) {
      clear(s.x, s.z, 12);
      B.flatten(s.x, s.z, 9, s.y, 5);
      B.paintDisk(s.x, s.z, 10, M_FLOWERS, 2, true);
      for (let k = 0; k < 13; k++) { const a = k / 13 * TAU; B.obj('birch', s.x + Math.cos(a) * 10.5, s.z + Math.sin(a) * 10.5, 11 + rnd() * 2); }
      for (let k = 0; k < 10; k++) { const a = rnd() * TAU, d = 2 + rnd() * 6; B.obj(rnd() < 0.5 ? 'daisies' : 'lavender', s.x + Math.cos(a) * d, s.z + Math.sin(a) * d); }
      B.prop('pierre_cerf', s.x, s.y, s.z, rnd() * TAU);
      shrine('anciens', 'cerf', s.x + 1.2, s.y + 1.0, s.z, 'Prier le Cerf Blanc');
      take(s, 12, 'clairiere', { secret: true });
    }
  }
  // ------------------------------------------------------------ la source aux rubans
  {
    const s = find(6, (x, z) => ctx.forestAt(x, z) > 0.1 && ctx.forestAt(x, z) < 0.35 && spreadAt(x, z, 4) < 2, F, 200, 700, 700, 'source');
    if (s) {
      clear(s.x, s.z, 5);
      const f = { x: s.x, y: s.y, z: s.z, r: rnd() * TAU };
      B.block(f, 0, -0.35, 0, 2.6, 0.55, 0.3, M_MOSSY); B.block(f, 0, -0.35, 1.5, 2.6, 0.55, 0.3, M_MOSSY);
      B.block(f, -1.15, -0.35, 0.75, 0.3, 0.55, 1.2, M_MOSSY); B.block(f, 1.15, -0.35, 0.75, 0.3, 0.55, 1.2, M_MOSSY);
      B.block(f, 0, 0.0, 0.75, 2.0, 0.06, 1.2, M_WATERB);
      B.propRel(f, 'rubans', 0, 0, -1.2, 0);
      B.objRel(f, 'birch', 2.2, -1.6, 9);
      shrine('anciens', 'source', f.x, s.y + 0.6, f.z, 'Boire à la source et prier');
      take(s, 6, 'source');
    }
  }
  // ------------------------------------------------------------ le rond des fées
  {
    const s = find(5, (x, z) => ctx.forestAt(x, z) > 0.3, F, 250, 900, 700, 'cercle_fees');
    if (s) { clear(s.x, s.z, 3.5); B.prop('champi_fees', s.x, s.y, s.z, 0); inter('fees', 'rond_fees', s.x, s.y + 0.5, s.z, 'Entrer dans la ronde'); take(s, 5, 'cercle_fees', { secret: true }); }
  }
  // ------------------------------------------------------------ la Table des Géants (dolmen) et les Demoiselles (menhirs), sur la lande
  {
    const s = find(8, (x, z) => ctx.moistAt(x, z) < -0.2 && spreadAt(x, z, 6) < 2.5, F, 380, 950, 700, 'dolmen') || find(8, (x, z) => spreadAt(x, z, 6) < 2.5, F, 380, 950);
    if (s) {
      clear(s.x, s.z, 7);
      B.prop('dolmen', s.x, s.y, s.z, rnd() * TAU);
      for (let k = 0; k < 4; k++) B.obj('bones', s.x + (rnd() - 0.5) * 6, s.z + (rnd() - 0.5) * 6);
      shrine('dessous', 'dolmen', s.x, s.y + 0.9, s.z + 1.6, 'S’agenouiller sous la table');
      take(s, 8, 'dolmen');
    }
    const m = find(22, (x, z) => ctx.moistAt(x, z) < -0.15 && spreadAt(x, z, 16) < 4, F, 300, 950, 700, 'menhirs');
    if (m) {
      const a = rnd() * TAU;
      for (let k = 0; k < 7; k++) { const d = (k - 3) * 6, x = m.x + Math.cos(a) * d + (rnd() - 0.5), z = m.z + Math.sin(a) * d + (rnd() - 0.5); clear(x, z, 1.2); B.prop('pierre_dressee', x, H(x, z) - 0.1, z, a + (rnd() - 0.5) * 0.4, null, 0.6 + rnd() * 0.35); }
      take(m, 22, 'menhirs');
    }
  }
  // ------------------------------------------------------------ l'abbaye de Montrevel (hauteurs) et son scriptorium caché
  {
    const s = find(16, (x, z) => H(x, z) > WL + 16 && spreadAt(x, z, 12) < 5, F, 350, 1000, 700, 'abbaye') || find(16, (x, z) => spreadAt(x, z, 12) < 4, F, 350, 1000);
    if (s) {
      clear(s.x, s.z, 18);
      B.flatten(s.x, s.z, 14, s.y, 8);
      B.paintDisk(s.x, s.z, 16, M_DIRT, 3, true);
      const f = { x: s.x, y: s.y, z: s.z, r: rnd() * TAU }, W = 9, D = 20;
      B.block(f, 0, -0.9, 0, W + 0.6, 1.0, D + 0.6, M_MOSSY);
      B.block(f, 0, 0.05, 0, W - 0.4, 0.1, D - 0.4, M_COBBLE);
      // murs en ruine : hauteurs inégales, fenêtres béantes
      for (let k = 0; k < 5; k++) { const z0 = -D / 2 + 2 + k * 4, hL = [6, 4.5, 6.5, 3, 5.5][k], hR = [5, 6, 2.5, 6, 4][k]; B.block(f, -W / 2 + 0.3, 0, z0, 0.6, hL, 2.4, M_MOSSY); B.block(f, W / 2 - 0.3, 0, z0, 0.6, hR, 2.4, M_MOSSY); }
      B.block(f, -2.6, 0, -D / 2 + 0.3, 3.4, 7, 0.6, M_MOSSY); B.block(f, 2.6, 0, -D / 2 + 0.3, 3.4, 5.5, 0.6, M_MOSSY); B.block(f, 0, 3.3, -D / 2 + 0.3, 1.8, 3.7, 0.6, M_MOSSY);
      B.block(f, 0, 0, D / 2 - 0.3, W, 7.5, 0.6, M_MOSSY);
      B.block(f, 0, 3.0, D / 2 + 0.02, 2.2, 3.4, 0.12, M_GLASS);
      // poutres effondrées, pierres tombées
      B.block(f, 1.5, 0.3, -2, 0.3, 0.3, 7, M_LOGS, 0.5); B.block(f, -1.2, 0.2, 3, 0.3, 0.3, 6, M_LOGS, -0.3); B.block(f, 0.3, 4.5, 6, W + 0.4, 0.3, 0.3, M_LOGS);
      for (let k = 0; k < 6; k++) B.block(f, (rnd() - 0.5) * 6, 0.1, (rnd() - 0.5) * 14, 0.6 + rnd() * 0.6, 0.4 + rnd() * 0.4, 0.6 + rnd() * 0.5, M_MOSSY, rnd());
      // cloître : colonnes
      for (let k = 0; k < 6; k++) { B.block(f, W / 2 + 4, 0, -D / 2 + 3 + k * 3, 0.5, 3.2, 0.5, M_STONE); B.block(f, W / 2 + 9, 0, -D / 2 + 3 + k * 3, 0.5, 2.2 + (k % 2) * 1.5, 0.5, M_STONE); }
      B.block(f, W / 2 + 4, 3.2, -D / 2 + 10.5, 0.7, 0.4, 16, M_STONE);
      B.propRel(f, 'autel', 0, 0.15, D / 2 - 2.2, 0);
      B.propRel(f, 'croix', 0, 1.15, D / 2 - 2.0, 0, null, 0.6);
      for (let k = 0; k < 3; k++) B.propRel(f, 'banc', (k % 2 ? 1.6 : -1.6), 0.15, -3 + k * 3, (rnd() - 0.5) * 0.8);
      const [ax, az] = B.toWorld(f, 0, D / 2 - 3.3);
      shrine('eglise', 'abbaye', ax, s.y + 1.0, az, 'Prier devant l’autel en ruine');
      const [px, pz] = B.toWorld(f, 1.6, D / 2 - 0.9);
      // la salle secrète
      const cf = under('scriptorium', 10, 8, 3.2, M_MOSSY, M_STONE);
      for (const [x, z] of [[-3, -2], [0, -2], [3, -2]]) { B.propRel(cf, 'table', x, 0, z, 0); B.propRel(cf, 'chaise', x, 0, z - 0.75, Math.PI); B.propRel(cf, 'livre', x + 0.3, 0.79, z, 0.4); B.propRel(cf, 'bougie', x - 0.4, 0.79, z + 0.1, 0); }
      for (const x of [-3.5, -1.2, 1.2, 3.5]) B.propRel(cf, 'etagere', x, 0, 3.6, Math.PI, { kind: 'livres' });
      B.propRel(cf, 'autel', 0, 0, 1.4, Math.PI);
      const [gx, gz] = B.toWorld(cf, -0.3, 1.4); B.prop('livre', gx, cf.y + 1.0, gz, 0.2); inter('pickup', 'grimoire', gx, cf.y + 1.2, gz, 'Prendre le grimoire', { item: 'grimoire', prop: w.props.length - 1, grimoire: true });
      const [rx, rz] = B.toWorld(cf, 0.6, 1.4); pickup('relique_croix', 'relique_croix', rx, cf.y + 1.0, rz, 'relique_sol', 'Prendre la croix');
      const [lx, lz] = B.toWorld(cf, 3.8, -2.8); box('coffre_vieux', lx, cf.y, lz, 'scriptorium', 'scriptorium_coffre');
      const [bx, bz] = B.toWorld(cf, -3.6, -2.6);
      inter('abbey_stone', 'abbaye_pierre', px, s.y + 1.1, pz, 'Examiner le mur derrière l’autel', { to: [bx, cf.y + 0.05, bz] });
      ladder(cf, -4.3, -3.4, [px - Math.sin(f.r) * 1.2, s.y + 0.2, pz - Math.cos(f.r) * 1.2], 'Remonter par le passage', 'scriptorium_haut');
      w.scriptorium = { x: cf.x, y: cf.y, z: cf.z };
      take(s, 18, 'abbaye');
      w.abbey = { x: s.x, y: s.y, z: s.z, f };
    }
  }
  // ------------------------------------------------------------ le château de Valmont, les quatre bornes, l'or
  {
    let s = DSG && DSG.chateau ? find(18, null, F, 0, 0, 1, 'chateau') : null;
    for (let k = 0; k < (s ? 0 : 500); k++) {
      const c = find(18, (x, z) => spreadAt(x, z, 10) < 5, F, 320, 950, 20);
      if (!c) continue;
      const around = (H(c.x + 45, c.z) + H(c.x - 45, c.z) + H(c.x, c.z + 45) + H(c.x, c.z - 45)) / 4;
      const score = c.y - around - spreadAt(c.x, c.z, 10) * 1.2;
      if (!s || score > s.score) s = Object.assign(c, { score });
      if (k > 60 && s.score > 4) break;
    }
    if (s) {
      clear(s.x, s.z, 20);
      B.flatten(s.x, s.z, 15, s.y, 8);
      B.paintDisk(s.x, s.z, 16, M_DIRT, 4, true);
      const f = { x: s.x, y: s.y, z: s.z, r: rnd() * TAU };
      // donjon éventré
      B.block(f, 0, -1, 0, 11, 1.1, 11, M_STONE);
      B.block(f, 0, 0, -5, 10, 9, 1.2, M_STONE); B.block(f, -5, 0, 0, 1.2, 6, 8.8, M_STONE); B.block(f, 5, 0, 1.5, 1.2, 10, 5.8, M_STONEWIN);
      B.block(f, 1.5, 0, 5, 7, 4, 1.2, M_STONE); B.block(f, 0, 0.05, 0, 9.6, 0.1, 9.6, M_COBBLE);
      for (let k = 0; k < 8; k++) B.block(f, (rnd() - 0.5) * 18, 0, (rnd() - 0.5) * 18, 1 + rnd() * 1.5, 0.5 + rnd(), 1 + rnd() * 1.2, M_MOSSY, rnd());
      // tour ronde en moignon et courtine
      B.block(f, 10, -0.5, 10, 4.5, 5, 4.5, M_MOSSY); B.block(f, 10, -0.5, 10, 3.2, 5.5, 4.6, M_MOSSY, Math.PI / 4);
      B.block(f, 0, -0.5, 13, 16, 2.5, 1.0, M_MOSSY); B.block(f, -13, -0.5, 2, 1.0, 3.2, 14, M_MOSSY);
      B.well({ x: B.toWorld(f, -9, -9)[0], y: s.y, z: B.toWorld(f, -9, -9)[1], r: f.r });
      take(s, 20, 'chateau');
      // l'or : ni trop près ni trop loin des ruines
      let tr = null;
      for (let k = 0; k < 80 && !tr; k++) { const a = rnd() * TAU, d = 26 + rnd() * 16, x = s.x + Math.cos(a) * d, z = s.z + Math.sin(a) * d; if (dry(x, z, 1) && !road(x, z)) tr = { x, z }; }
      if (tr) {
        w.secrets.push({ id: 'valmont', kind: 'tresor', x: tr.x, z: tr.z, r: 2.2, loot: 'valmont', relic: 'relique_sceau', myth: 'tresor_valmont', depth: 4 });
        // quatre bornes gravées : leurs flèches se croisent sur l'or
        for (let q = 0; q < 4; q++) {
          for (let k = 0; k < 120; k++) {
            const a = q * Math.PI / 2 + (rnd() - 0.5) * 0.9, d = 110 + rnd() * 260, x = tr.x + Math.cos(a) * d, z = tr.z + Math.sin(a) * d;
            if (!dry(x, z, 1) || busy(x, z, 2) || road(x, z)) continue;
            const dir = Math.atan2(tr.x - x, tr.z - z);
            B.prop('borne', x, H(x, z), z, rnd() * TAU, { dir, i: q });
            inter('borne', 'borne' + q, x, H(x, z) + 0.9, z, 'Lire la borne', { i: q, dir });
            mine.push({ x, z, r: 2 });
            break;
          }
        }
      }
    }
  }
  // ------------------------------------------------------------ la charbonnière (forêt)
  {
    const s = find(10, (x, z) => ctx.forestAt(x, z) > 0.3 && spreadAt(x, z, 6) < 2.5, F, 250, 900, 700, 'charbonniere');
    if (s) {
      clear(s.x, s.z, 9);
      B.flatten(s.x, s.z, 7, s.y, 4);
      B.paintDisk(s.x, s.z, 8, M_DIRT, 3, true);
      const f = { x: s.x, y: s.y, z: s.z, r: rnd() * TAU };
      B.propRel(f, 'charbonniere', 0, 0, 0, 0);
      for (const [x, z] of [[4, 2], [4, -1]]) B.block(f, x, -0.2, z, 0.2, 2.2, 0.2, M_LOGS);
      B.block(f, 5.2, -0.2, 0.5, 0.2, 1.4, 0.2, M_LOGS); B.block(f, 5.2, -0.2, -1.5, 0.2, 1.4, 0.2, M_LOGS);
      B.block(f, 4.6, 1.6, 0.5, 1.8, 0.12, 3.6, M_PLANKS, 0, 0); B.objRel(f, 'woodpile', -4, 3); B.objRel(f, 'woodpile', -4.5, -2);
      box('caisse', B.toWorld(f, 4.6, -1)[0], s.y, B.toWorld(f, 4.6, -1)[1], 'campement', 'charbon_caisse');
      w.charcoal = { x: s.x, y: s.y, z: s.z };
      take(s, 10, 'charbonniere');
    }
  }
  // ------------------------------------------------------------ la bergerie des Combes (hauteurs)
  {
    const s = find(12, (x, z) => H(x, z) > WL + 12 && spreadAt(x, z, 8) < 3.5, F, 350, 1000, 700, 'bergerie') || find(12, (x, z) => spreadAt(x, z, 8) < 3, F, 350, 1000);
    if (s) {
      clear(s.x, s.z, 12);
      B.flatten(s.x, s.z, 9, s.y, 5);
      const f = { x: s.x, y: s.y, z: s.z, r: rnd() * TAU };
      B.house({ x: B.toWorld(f, -4, 0)[0], y: s.y, z: B.toWorld(f, -4, 0)[1], r: f.r }, 5, 4, { wall: M_STONE, win: M_STONE, roof: M_THATCH, floor: M_DIRT, found: M_STONE });
      const pen = { x: B.toWorld(f, 5, 0)[0], y: s.y, z: B.toWorld(f, 5, 0)[1], r: f.r };
      for (let k = -2; k <= 2; k++) { B.propRel(pen, 'cloture_pierre', k * 2, 0, -4, 0); B.propRel(pen, 'cloture_pierre', k * 2, 0, 4, 0); }
      for (let k = -1; k <= 1; k++) B.propRel(pen, 'cloture_pierre', 5, 0, k * 2, Math.PI / 2);
      B.propRel(pen, 'abreuvoir', 0, 0, 0, 0);
      box('tonneau_vieux', B.toWorld(f, -4, 0.8)[0], s.y + 0.15, B.toWorld(f, -4, 0.8)[1], 'hameau', 'bergerie_tonneau');
      take(s, 12, 'bergerie');
    }
  }
  // ------------------------------------------------------------ le lavoir, près de la porte sud
  {
    let s = null;
    const g = { x: T.gS[0], z: T.gS[1] };
    for (let k = 0; k < 200 && !s; k++) {
      const a = rnd() * TAU, d = 22 + rnd() * 30, x = g.x + Math.cos(a) * d, z = g.z + Math.sin(a) * d;
      if (!dry(x, z, 0.5) || road(x, z) || Math.max(Math.abs(x - T.x), Math.abs(z - T.z)) < 62 || spreadAt(x, z, 4) > 1.5 || !pointFree(w, x, z, 4)) continue;
      s = { x, z, y: H(x, z) };
    }
    if (s) {
      B.flatten(s.x, s.z, 5, s.y, 3);
      const f = { x: s.x, y: s.y, z: s.z, r: Math.atan2(T.x - s.x, T.z - s.z) };
      B.block(f, 0, -0.3, 0, 5.2, 0.6, 0.3, M_STONE); B.block(f, 0, -0.3, 2.6, 5.2, 0.6, 0.3, M_STONE);
      B.block(f, -2.45, -0.3, 1.3, 0.3, 0.6, 2.3, M_STONE); B.block(f, 2.45, -0.3, 1.3, 0.3, 0.6, 2.3, M_STONE);
      B.block(f, 0, 0.1, 1.3, 4.6, 0.06, 2.3, M_WATERB);
      B.block(f, 0, 0.3, -0.35, 5.2, 0.12, 0.5, M_STONE, 0, 0);
      for (const [x, z] of [[-2.6, -0.8], [2.6, -0.8], [-2.6, 3.2], [2.6, 3.2]]) B.block(f, x, 0, z, 0.25, 2.6, 0.25, M_LOGS);
      B.block(f, 0, 2.6, 1.2, 6.2, 1.4, 4.8, M_ROOF, Math.PI / 2, 1);
      take(s, 8, 'lavoir');
      const [lx, lz] = B.toWorld(f, 0, -1.6);
      w.lavoir = { x: lx, z: lz, f };
    }
  }
  // ------------------------------------------------------------ calvaires aux carrefours
  {
    const N = w.nav, cand = [];
    N.nodes.forEach((n, i) => { if (n.tag === 'chemin' && !n.iso && N.adj[i] && N.adj[i].length >= 3) cand.push(n); });
    cand.sort((a, b) => Math.hypot(a.x - F.x, a.z - F.z) - Math.hypot(b.x - F.x, b.z - F.z));
    let k = 0;
    const pts = [];
    for (const n of cand) {
      if (k >= 5 || pts.some((p) => Math.hypot(p.x - n.x, p.z - n.z) < 140)) continue;
      for (let t = 0; t < 12; t++) {
        const a = t / 12 * TAU, x = n.x + Math.cos(a) * 3.5, z = n.z + Math.sin(a) * 3.5;
        if (!dry(x, z, 0.5) || road(x, z) || !pointFree(w, x, z, 1)) continue;
        B.prop('calvaire', x, H(x, z), z, Math.atan2(n.x - x, n.z - z), { v: k });
        shrine('eglise', 'calvaire' + k, x + Math.cos(a) * -1.2, H(x, z) + 1.0, z + Math.sin(a) * -1.2, 'Prier au calvaire', { i: k, prop: w.props.length - 1 });
        LIEU_NAMES['calvaire' + k] = 'le calvaire du carrefour';
        B.landmark('calvaire' + k, x, z, 4);
        pts.push({ x, z }); k++;
        break;
      }
    }
  }
  // ------------------------------------------------------------ le clocher englouti, au fond du grand lac
  {
    const L = ctx.mainLake;
    let best = null;
    for (let k = 0; k < 60; k++) { const a = rnd() * TAU, d = rnd() * L.r * 0.35, x = L.x + Math.cos(a) * d, z = L.z + Math.sin(a) * d, h = H(x, z); if (!best || h < best.h) best = { x, z, h }; }
    if (best && best.h < WL - 2.2) {
      const f = { x: best.x, y: best.h, z: best.z, r: rnd() * TAU };
      B.block(f, 0, -1, 0, 3.2, 4.2, 3.2, M_MOSSY); B.block(f, 0, 3.2, 0, 3.6, 0.3, 3.6, M_MOSSY);
      B.block(f, 0, 3.5, 0, 3.2, 3.2, 3.2, M_SLATE, 0.3, 3);
      B.block(f, 1.1, -0.4, 1.7, 0.9, 1.6, 0.12, M_DARK);
      B.propRel(f, 'cloche_noyee', -2.4, 0, 1.2, 0.5);
      const [cx, cz] = B.toWorld(f, 2.3, -1.4);
      box('coffre_vieux', cx, H(cx, cz), cz, 'clocher', 'clocher_coffre');
      const [rx, rz] = B.toWorld(f, -1.6, -2.2);
      pickup('relique_calice', 'relique_calice', rx, H(rx, rz), rz, 'relique_sol', 'Prendre le calice');
      B.landmark('clocher_noye', best.x, best.z, 8, { under: true });
      w.drowned = { x: best.x, z: best.z, y: best.h };
    }
  }
  // ------------------------------------------------------------ l'îlot des noyés (marais) : là où les follets se rassemblent
  {
    const sw = ctx.swamp;
    let s = null;
    for (let k = 0; k < 300 && !s; k++) { const a = rnd() * TAU, d = rnd() * 50, x = sw.x + Math.cos(a) * d, z = sw.z + Math.sin(a) * d, h = H(x, z); if (h > WL + 0.25 && h < WL + 1.4 && !busy(x, z, 2)) s = { x, z, y: h }; }
    if (s) {
      for (let k = 0; k < 3; k++) B.obj('deadtree', s.x + (rnd() - 0.5) * 8, s.z + (rnd() - 0.5) * 8);
      B.obj('bones', s.x + 1.5, s.z - 1);
      w.secrets.push({ id: 'noyes', kind: 'tresor', x: s.x, z: s.z, r: 1.8, loot: 'noyes', relic: 'relique_medaillon', myth: 'feux_follets', depth: 3 });
      take(s, 5, 'ilot');
      w.islet = { x: s.x, z: s.z, y: s.y };
    }
  }
  // ------------------------------------------------------------ la tombe de Lise, oubliée dans le bois
  if (lm.hameau_abandonne) {
    const G = lm.hameau_abandonne;
    const s = find(3, (x, z) => ctx.forestAt(x, z) > 0.05 || true, G, 45, 110, 700, 'tombe_lise');
    if (s) {
      B.prop('tombe_lise', s.x, s.y, s.z, rnd() * TAU, { fleurs: false });
      inter('lise', 'tombe_lise', s.x, s.y + 0.7, s.z, 'Se recueillir sur la petite tombe', { prop: w.props.length - 1 });
      for (let k = 0; k < 4; k++) B.obj('birch', s.x + (rnd() - 0.5) * 10, s.z + (rnd() - 0.5) * 10);
      take(s, 4, 'tombe_lise', { secret: true });
    }
  }
  // ------------------------------------------------------------ grottes ensevelies (on dégage l'entrée à la pelle)
  const cave = (id, test, from, dMin, dMax, roomW, roomD, roomH, fill) => {
    const s = hillside(test, from, dMin, dMax, id);
    if (!s) return;
    const r = s.dir + Math.PI; // l'entrée regarde vers l'aval
    const x = s.x + Math.sin(s.dir) * 1.2, z = s.z + Math.cos(s.dir) * 1.2;
    B.prop('eboulis', x, H(x, z) - 0.1, z, r, { p: 0, cave: id });
    const cf = under(id, roomW, roomD, roomH, M_ROCK, M_ROCK);
    const [ix, iz] = B.toWorld(cf, -roomW / 2 + 1.4, 0);
    inter('eboulis', 'eboulis_' + id, x - Math.sin(s.dir) * 0.6, H(x, z) + 0.8, z - Math.cos(s.dir) * 0.6, 'Examiner les éboulis', { cave: id, prop: w.props.length - 1 });
    inter('cave', 'grotte_' + id, x - Math.sin(s.dir) * 0.8, H(x, z) + 1.0, z - Math.cos(s.dir) * 0.8, 'Entrer dans la grotte', { cave: id, to: [ix, cf.y + 0.05, iz] });
    ladder(cf, -roomW / 2 + 0.8, 0.6, [x - Math.sin(s.dir) * 2.2, H(x, z) + 0.3, z - Math.cos(s.dir) * 2.2], 'Ressortir au jour', 'grotte_' + id + '_haut');
    w.caves[id] = { x, z, y: H(x, z), r, room: { x: cf.x, y: cf.y, z: cf.z, W: roomW, D: roomD }, prop: w.props.length - 1 };
    for (let k = 0; k < 5; k++) { const [sx, sz] = B.toWorld(cf, (rnd() - 0.5) * (roomW - 2), (rnd() - 0.5) * (roomD - 2)); B.prop('stalagmite', sx, cf.y, sz, rnd() * TAU); }
    take(s, 6, id, { secret: true });
    if (fill) fill(cf, roomW, roomD);
  };
  cave('grotte_cristaux', (x, z) => H(x, z) > WL + 10, F, 300, 1000, 16, 12, 4.2, (cf, W, D) => {
    for (let k = 0; k < 7; k++) { const [x, z] = B.toWorld(cf, -5 + (k % 4) * 3.4, k < 4 ? -4 : 4); w.objects.push({ t: OBJ_INDEX.crystal, x, z, h: 1.0 + rnd() * 0.6, f: 0, v: 0, y: cf.y }); }
    B.block(cf, 2, -0.05, 0, 4.5, 0.12, 3.5, M_WATERB);
    for (let k = 0; k < 6; k++) { const [x, z] = B.toWorld(cf, (rnd() - 0.5) * (W - 3), (rnd() - 0.5) * (D - 3)); B.prop('champi_fees', x, cf.y, z, 0, null, 0.25); inter('forage', 'champi_grotte' + k, x, cf.y + 0.3, z, 'Cueillir le champignon lumineux', { item: 'champi_lumineux', every: 2 }); }
    const [lx, lz] = B.toWorld(cf, 5.5, -3.5); box('caisse', lx, cf.y, lz, 'cristaux', 'cristaux_caisse');
    w.caves.grotte_cristaux && (w.caves.grotte_cristaux.bats = true);
  });
  cave('antre', (x, z) => H(x, z) > WL + 14, F, 450, 1050, 14, 10, 3.6, (cf, W, D) => {
    for (let k = 0; k < 8; k++) { const [x, z] = B.toWorld(cf, (rnd() - 0.5) * (W - 2), (rnd() - 0.5) * (D - 2)); w.objects.push({ t: OBJ_INDEX.bones, x, z, h: 0.45, f: 0, v: 0, y: cf.y }); }
    const [sx, sz] = B.toWorld(cf, 4, 3); B.prop('squelette', sx, cf.y, sz, 0.6, { arme: true });
    inter('note', 'X0', sx, cf.y + 0.4, sz, 'Lire le carnet', { note: 'X0' });
    const [bx, bz] = B.toWorld(cf, 3, -1.5); w.beteLair = { x: bx, z: bz, y: cf.y };
    const [lx, lz] = B.toWorld(cf, 5.5, -3.5); box('coffre_vieux', lx, cf.y, lz, 'bete', 'antre_coffre');
  });
  cave('grotte_contrebandiers', (x, z) => ctx.forestAt(x, z) > 0.05, ctx.mainLake, 120, 500, 12, 9, 3.2, (cf, W, D) => {
    for (const [x, z, id] of [[-3, 3, 'caisse'], [-2, 3.4, 'caisse'], [3, 3, 'tonneau_vieux'], [4, 2.2, 'tonneau_vieux']]) { const [px, pz] = B.toWorld(cf, x, z); box(id, px, cf.y, pz, 'contrebandiers', 'contre_' + x + '_' + z); }
    B.propRel(cf, 'table', 0, 0, -1, 0.2); B.propRel(cf, 'chaise', 0.5, 0, -1.8, 2.8); B.propRel(cf, 'bougie', 0.2, 0.79, -1, 0); B.propRel(cf, 'lanterne_sol', -4, 0, -3, 0);
    const [nx, nz] = B.toWorld(cf, -0.3, -1); B.prop('lettre', nx, cf.y + 0.8, nz, 0.3); inter('note', 'X1', nx, cf.y + 0.9, nz, 'Lire', { note: 'X1' });
  });
  cave('grotte_peinte', (x, z) => ctx.forestAt(x, z) > 0.15, F, 300, 1000, 14, 10, 3.8, (cf, W, D) => {
    for (let k = 0; k < 4; k++) {
      const lx = -4.5 + k * 3, lz = D / 2 - 0.3;
      B.propRel(cf, 'peinture', lx, 0.6, lz - 0.05, Math.PI, { v: k });
      const [px, pz] = B.toWorld(cf, lx, lz - 0.8);
      inter('painting', 'peinture' + k, px, cf.y + 1.4, pz, 'Regarder la peinture', { i: k });
    }
    const [lx, lz] = B.toWorld(cf, 5, -3.2); box('sac', lx, cf.y, lz, 'grotte_peinte', 'peinte_sac');
    for (let k = 0; k < 4; k++) { const [x, z] = B.toWorld(cf, (rnd() - 0.5) * (W - 3), -2 + (rnd() - 0.5) * 3); w.objects.push({ t: OBJ_INDEX.bones, x, z, h: 0.4, f: 0, v: 0, y: cf.y }); }
  });
  // ------------------------------------------------------------ sous le cercle de pierres : la chambre des Treize
  if (lm.cercle) {
    const cf = under('cercle', 11, 11, 3.6, M_MOSSY, M_STONE);
    for (let k = 0; k < 13; k++) { const a = k / 13 * TAU; B.propRel(cf, 'pierre_dressee', Math.cos(a) * 4.2, 0, Math.sin(a) * 4.2, -a, null, 0.32); }
    B.propRel(cf, 'autel', 0, 0, 0, 0);
    const [rx, rz] = B.toWorld(cf, 0, 0); pickup('relique_tablette', 'relique_tablette', rx, cf.y + 1.0, rz, 'relique_sol', 'Prendre la tablette');
    for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; B.propRel(cf, 'bougie', Math.cos(a) * 2.2, 0, Math.sin(a) * 2.2, 0); }
    const [bx, bz] = B.toWorld(cf, 4.2, -4.2); box('coffre_vieux', bx, cf.y, bz, 'cercle_cache', 'cercle_coffre');
    const L = lm.cercle;
    ladder(cf, -4.6, 4.4, [L.x + 1.5, L.y + 0.3, L.z + 1.5], 'Remonter vers les pierres', 'cercle_haut');
    const [ix, iz] = B.toWorld(cf, -3.8, 3.6);
    w.circleRoom = { to: [ix, cf.y + 0.05, iz] };
    // fleurs de lune autour du cercle (la nuit seulement)
    for (let k = 0; k < 7; k++) { const a = rnd() * TAU, d = 2.5 + rnd() * 5, x = L.x + Math.cos(a) * d, z = L.z + Math.sin(a) * d; B.prop('fleur_lune', x, H(x, z), z, rnd() * TAU); inter('moonflower', 'lune' + k, x, H(x, z) + 0.4, z, 'Cueillir la fleur de lune', { item: 'fleur_lune', prop: w.props.length - 1 }); }
  }
  // ------------------------------------------------------------ la mine profonde : la niche des Frappeurs, la paroi fendue, la galerie
  if (w.deepMine) {
    const D0 = w.deepMine, df = { x: D0.x, y: D0.y, z: D0.z, r: 0 };
    B.propRel(df, 'niche_frappeurs', 8.7, 0, -3, -Math.PI / 2, { offer: false });
    const [nx, nz] = B.toWorld(df, 8.1, -3);
    inter('frappeurs', 'niche_frappeurs', nx, D0.y + 0.8, nz, 'La niche des Frappeurs', { prop: w.props.length - 1 });
    B.propRel(df, 'paroi_fendue', -2, 0, -6.7, 0, { ouvert: false });
    const pi = w.props.length - 1;
    const gf = under('frappeurs', 16, 8, 3.4, M_ROCK, M_ROCK);
    for (let k = 0; k < 8; k++) { const [x, z] = B.toWorld(gf, -6 + k * 1.7, k % 2 ? -3.2 : 3.2); w.objects.push({ t: OBJ_INDEX.vein, x, z, h: 1.1, f: 0, v: k % 3 ? 2 : 3, y: gf.y }); }
    for (const [x, z] of [[-3, 0], [4, 1]]) { const [ox, oz] = B.toWorld(gf, x, z); w.objects.push({ t: OBJ_INDEX.crystal, x: ox, z: oz, h: 1.3, f: 0, v: 0, y: gf.y }); }
    const [rx, rz] = B.toWorld(gf, 6.5, 0); pickup('relique_lampe', 'relique_lampe', rx, gf.y + 0.1, rz, 'relique_sol', 'Prendre la vieille lampe');
    const [lx, lz] = B.toWorld(gf, 6.5, -2.8); box('coffre_vieux', lx, gf.y, lz, 'frappeurs', 'frappeurs_coffre');
    const [px, pz] = B.toWorld(df, -2, -5.9), [gx, gz] = B.toWorld(gf, -6.8, 0);
    inter('paroi', 'paroi_fendue', px, D0.y + 1.2, pz, 'Examiner la paroi fendue', { prop: pi, to: [gx, gf.y + 0.05, gz] });
    ladder(gf, -7.4, 1.2, [px, D0.y + 0.1, pz + 1.2], 'Revenir dans la mine', 'galerie_haut');
  }
  // ------------------------------------------------------------ le chêne des Ancêtres : on peut y dormir
  if (lm.chene) inter('dream', 'reve_chene', lm.chene.x + 3, lm.chene.y + 0.8, lm.chene.z + 2, 'S’allonger au pied du chêne', {});
  if (lm.cercle) shrine('anciens', 'cercle', lm.cercle.x + 0.8, lm.cercle.y + 1.0, lm.cercle.z, 'Prier les Anciens');
  if (lm.chene) shrine('anciens', 'chene', lm.chene.x - 3, lm.chene.y + 1.0, lm.chene.z - 2, 'Poser la main sur l’écorce');

  // ------------------------------------------------------------ poteaux indicateurs et panneaux-cartes
  const DEST = [];
  const addDest = (name, x, z) => { if (isFinite(x)) DEST.push({ name, x, z }); };
  addDest('{ville}', T.x, T.z);
  addDest('La vieille ferme', F.x, F.z);
  if (lm.hameau) addDest('{hameau}', lm.hameau.x, lm.hameau.z);
  if (lm.ponton) addDest('Le lac', lm.ponton.x, lm.ponton.z);
  if (lm.mine) addDest('La mine', lm.mine.x, lm.mine.z);
  if (lm.moulin) addDest('Le vieux moulin', lm.moulin.x, lm.moulin.z);
  if (lm.cimetiere) addDest('Le cimetière', lm.cimetiere.x, lm.cimetiere.z);
  if (lm.hutte_ermite) addDest('La hutte', lm.hutte_ermite.x, lm.hutte_ermite.z);
  if (lm.tour) addDest('La tour de guet', lm.tour.x, lm.tour.z);
  if (lm.chateau) addDest('Ruines de Valmont', lm.chateau.x, lm.chateau.z);
  if (lm.abbaye) addDest('Abbaye de Montrevel', lm.abbaye.x, lm.abbaye.z);
  if (lm.lavoir) addDest('Le lavoir', lm.lavoir.x, lm.lavoir.z);
  const signAt = (x, z, max) => {
    const ds = DEST.map((d) => ({ d, dist: Math.hypot(d.x - x, d.z - z) })).filter((q) => q.dist > 45).sort((a, b) => a.dist - b.dist).slice(0, max || 4);
    const dirs = ds.map((q) => Math.atan2(q.d.x - x, q.d.z - z));
    B.prop('poteau_dir', x, H(x, z), z, 0, { dirs });
    const it = inter('sign', 'poteau' + w.signs.length, x, H(x, z) + 1.8, z, 'Lire le poteau', { dests: ds.map((q, i) => [q.d.name, Math.round(q.dist / 50) * 50, dirs[i]]) });
    w.signs.push({ x, z, it });
  };
  {
    const N = w.nav, pts = [];
    const tryNode = (n) => {
      if (pts.some((p) => Math.hypot(p.x - n.x, p.z - n.z) < 110)) return;
      for (let t = 0; t < 10; t++) { const a = t / 10 * TAU, x = n.x + Math.cos(a) * 2.6, z = n.z + Math.sin(a) * 2.6; if (dry(x, z, 0.4) && !road(x, z) && pointFree(w, x, z, 0.6)) { signAt(x, z); pts.push({ x, z }); return; } }
    };
    N.nodes.forEach((n, i) => { if (n.tag === 'chemin' && !n.iso && N.adj[i] && N.adj[i].length >= 3) tryNode(n); });
    const [rx, rz] = w.farm.gate; tryNode({ x: rx, z: rz });
    for (const g of [T.gN, T.gS]) tryNode({ x: g[0] + 4, z: g[1] });
    if (lm.hameau) tryNode({ x: lm.hameau.x + 8, z: lm.hameau.z + 8 });
    N.nodes.forEach((n) => { if (n.tag === 'chemin' && !n.iso && pts.length < 14 && rnd() < 0.08) tryNode(n); });
  }
  const board = (key, x, z, face, old) => {
    if (!isFinite(x) || !dry(x, z, 0.3)) return;
    B.prop('panneau_carte', x, H(x, z), z, face, { old: !!old });
    inter('mapboard', 'carte_' + key, x + Math.sin(face) * 0.9, H(x, z) + 1.4, z + Math.cos(face) * 0.9, 'Regarder la carte', { key, old: !!old, x, z });
    w.mapBoards.push({ key, x, z });
  };
  {
    const [rx, rz] = w.farm.gate;
    board('ferme', rx + 5, rz + 2, Math.atan2(F.x - rx, F.z - rz) + Math.PI);
    board('ville', T.x + 5.5, T.z + 9.5, Math.PI);
    if (lm.hameau) board('hameau', lm.hameau.x + 6, lm.hameau.z - 4, rnd() * TAU);
    if (lm.ponton && lm.cabane_pecheur) board('lac', lm.cabane_pecheur.x + 4, lm.cabane_pecheur.z + 4, Math.atan2(lm.ponton.x - lm.cabane_pecheur.x, lm.ponton.z - lm.cabane_pecheur.z) + Math.PI);
    if (lm.mine) board('mine', lm.mine.x + 7, lm.mine.z + 5, rnd() * TAU);
    if (w.abbey) board('abbaye', w.abbey.x + 14, w.abbey.z + 6, rnd() * TAU, true);
  }
  // ------------------------------------------------------------ nouvelles notes
  if (typeof LORE_TEXT !== 'undefined' && LORE_TEXT.notes) LORE_TEXT.notes.forEach((n, i) => {
    const L = lm[n.lieu] || lm.foret || lm.ferme;
    if (L.under) return;
    for (let k = 0; k < 40; k++) {
      const a = rnd() * TAU, d = Math.min(L.r || 8, 14) * (0.3 + rnd() * 0.6), x = L.x + Math.cos(a) * d, z = L.z + Math.sin(a) * d;
      if (dry(x, z, 0.4)) { B.placeNote({ x, z, y: null, r: 0 }, 'M' + i); break; }
    }
  });
  // ------------------------------------------------------------ l'alambic de la guérisseuse ; le recueil de légendes de la mairie
  const hut = w.bld.hutte_ermite;
  if (hut) { B.propRel(hut.f, 'alambic', -2.1, 0.15, -0.4, Math.PI / 2); const [ax, az] = B.toWorld(hut.f, -1.3, -0.4); inter('alambic', 'alambic_hutte', ax, hut.f.y + 1.0, az, 'Utiliser l’alambic de la guérisseuse'); }
  const mairie = w.bld.mairie;
  if (mairie) { const [bx, bz] = B.toWorld(mairie.f, 0.3, 1.1); inter('book_legends', 'livre_legendes', bx, mairie.f.y + 1.1, bz, 'Feuilleter le recueil de légendes'); }
  // ------------------------------------------------------------ faune en plus
  const S = w.size;
  const wild = (id, count, test) => {
    for (let k = 0, t = 0; k < count && t < count * 90; t++) {
      const x = S * (0.08 + rnd() * 0.84), z = S * (0.08 + rnd() * 0.84);
      if (!dry(x, z, 0.3) || Math.hypot(x - F.x, z - F.z) < 70 || Math.max(Math.abs(x - T.x), Math.abs(z - T.z)) < 70) continue;
      if (test(x, z, H(x, z))) { B.obj(id, x, z); k++; }
    }
  };
  const fA = ctx.forestAt, mA = ctx.moistAt;
  wild('squirrels', 30, (x, z) => fA(x, z) > 0.2);
  wild('hedgehogs', 14, (x, z) => fA(x, z) < 0.25 && fA(x, z) > -0.1);
  wild('badgers', 10, (x, z) => fA(x, z) > 0.25);
  wild('roes', 18, (x, z) => { const f = fA(x, z); return f > 0.05 && f < 0.3; });
  wild('ibexes', 12, (x, z, h) => h > WL + 22);
  wild('marmots', 14, (x, z, h) => h > WL + 16 && fA(x, z) < 0.2);
  wild('bears', 2, (x, z) => fA(x, z) > 0.38 && Math.hypot(x - F.x, z - F.z) > 500);
  wild('lynxes', 3, (x, z, h) => fA(x, z) > 0.3 && h > WL + 10);
  wild('snakes', 14, (x, z) => mA(x, z) < -0.2 || (mA(x, z) > 0.25));
  wild('pheasants', 16, (x, z) => fA(x, z) < 0.12 && mA(x, z) > -0.25);
  wild('partridges', 12, (x, z) => fA(x, z) < 0.1);
  wild('magpies', 10, (x, z) => fA(x, z) < 0.15);
  wild('owls', 10, (x, z) => fA(x, z) > 0.2);
  wild('bats', 5, (x, z) => fA(x, z) > 0.2);
  for (const L of w.lakes || []) {
    for (let k = 0, t = 0; k < (L.kind ? 2 : 4) && t < 60; t++) { const a = rnd() * TAU, d = L.r * (1.02 + rnd() * 0.25), x = L.x + Math.cos(a) * d, z = L.z + Math.sin(a) * d, h = H(x, z); if (h > WL + 0.05 && h < WL + 1.2) { B.obj(rnd() < 0.5 ? 'frogs' : rnd() < 0.5 ? 'herons' : 'otters', x, z); k++; } }
    if (!L.kind) for (let k = 0, t = 0; k < 2 && t < 40; t++) { const a = rnd() * TAU, d = rnd() * L.r * 0.6, x = L.x + Math.cos(a) * d, z = L.z + Math.sin(a) * d; if (H(x, z) < WL - 0.5) { B.obj('swans', x, z); k++; } }
  }
  wild('storks', 6, (x, z) => mA(x, z) > 0.15 && fA(x, z) < 0.15);
  if (w.abbey) B.obj('bats', w.abbey.x, w.abbey.z);
  if (w.charcoal) B.obj('owls', w.charcoal.x + 10, w.charcoal.z + 6);
  w.grid = null;
}
// Notes supplémentaires (carnet du chasseur, note des contrebandiers)
const EXTRA_NOTES = [
  { titre: 'Carnet du chasseur', get texte() { return (typeof LORE_TEXT !== 'undefined' && LORE_TEXT.antre && LORE_TEXT.antre.chasseur) || 'Des pages collées par l’humidité. On lit encore : « Elle dort, mais elle écoute. »'; } },
  { titre: 'Note des contrebandiers', get texte() { return (typeof LORE_TEXT !== 'undefined' && LORE_TEXT.grotte_contrebandiers && LORE_TEXT.grotte_contrebandiers[0]) || 'Des comptes, des noms, et une croix sur une carte.'; } },
];
