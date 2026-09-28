// ============================================================================
//  LIEUX NOUVEAUX (vallée dessinée) — ajoutés APRÈS tout le reste, avec leur
//  propre tirage : les numéros des objets et des objets posés des parties déjà
//  commencées ne bougent pas.
//  - la grande bibliothèque (plateau), sa salle des archives secrètes ;
//  - les Sources : un hameau de naturistes autour de bassins d'eau chaude ;
//  - le relais de chasse (vieille forêt) ; les roulottes des colporteurs ;
//  - l'échoppe de l'alchimiste (une maison vide de la ville) ;
//  - les halles des nains, sous la montagne (on y entre par une fente de la
//    falaise, au bord de la Combe, en frappant comme eux) ;
//  - le camp des géants, sur les hauteurs de l'est ;
//  - le temple secret, immense, sous les Monts : on y entre derrière une
//    cascade, là où la rivière naît de la montagne ;
//  - des échelles dans les douves de la ville ;
//  - les zones où l'on ne bâtit pas (villes, villages, lieux saints) ;
//  - chaque milieu reçoit ses plantes et ses bêtes (communes ou rares).
// ============================================================================
Object.assign(LIEU_NAMES, {
  bibliotheque: 'la grande bibliothèque', sources: 'les Sources', relais_chasse: 'le relais de chasse', roulottes: 'le campement des colporteurs',
  roulotte_a: 'la roulotte de Jouvet', roulotte_b: 'la roulotte de Carrez', vide6: 'l’échoppe de l’alchimiste', source_a: 'la maison aux volets verts', source_b: 'la maison du docteur',
  source_c: 'la maison des bains', nains: 'les halles d’en bas', nain_a: 'la maison de l’ancien', nain_b: 'la forge d’en bas', fente_nains: 'la falaise fendue',
  geants: 'le camp des géants', temple: 'le temple sous la montagne', cascade: 'la cascade de la source', archives: 'la salle des archives',
});
const PROTECTED = []; // zones où l'on ne construit pas : { x, z, r, why }

function addLieux3(w, seed) {
  if (!w.designed) return;
  const rnd = mulberry32(seed * 101 + 77), WL = w.waterLevel;
  const B = new Builder(w, rnd, new Uint8Array(w.W * w.W));
  const H = (x, z) => w.heightAt(x, z);
  w.pools = w.pools || [];
  const nObj0 = w.objects.length;
  // ------------------------------------------------------------ outils
  // l'endroit le plus plat et le plus libre près de (x0, z0)
  const busy = (x, z, r) => {
    for (const k in w.bld) { const b = w.bld[k]; if (Math.hypot(b.x - x, b.z - z) < r + Math.max(b.W || 8, b.D || 8) * 0.7 + 4) return true; }
    for (const k in w.lm) { const L = w.lm[k]; if (!L.under && Math.hypot(L.x - x, L.z - z) < r + Math.min(L.r || 8, 30) * 0.6) return true; }
    if (w.townInfo && Math.max(Math.abs(x - w.townInfo.x), Math.abs(z - w.townInfo.z)) < 62 + r) return true;
    return false;
  };
  const spread = (x, z, r) => { let mn = 1e9, mx = -1e9; for (let a = 0; a < 8; a++) for (const k of [0.5, 1]) { const h = H(x + Math.cos(a * 0.785) * r * k, z + Math.sin(a * 0.785) * r * k); mn = Math.min(mn, h); mx = Math.max(mx, h); } return [mx - mn, mn]; };
  const siteNear = (x0, z0, R, r, o = {}) => {
    let best = null;
    for (let k = 0; k < 400; k++) {
      const a = rnd() * TAU, d = Math.sqrt(rnd()) * R, x = x0 + Math.cos(a) * d, z = z0 + Math.sin(a) * d;
      if (!w.inside(x, z, r + 30)) continue;
      const [sp, mn] = spread(x, z, r);
      if (mn < WL + (o.dry ?? 1.5)) continue;
      if (o.minH !== undefined && mn < WL + o.minH) continue;
      if (o.maxH !== undefined && mn > WL + o.maxH) continue;
      if (busy(x, z, r)) continue;
      const score = sp + d * (o.pull ?? 0.01) + rnd() * 0.3;
      if (!best || score < best.score) best = { x, z, y: H(x, z), score };
    }
    return best || { x: x0, z: z0, y: H(x0, z0), score: 99 };
  };
  const clearAround = (x, z, r, keepAnimals) => {
    for (let i = 0; i < nObj0; i++) { const o = w.objects[i]; if (o.gone || Math.hypot(o.x - x, o.z - z) > r) continue; const t = OBJ_TYPES[o.t]; if (keepAnimals && t.animal) continue; o.gone = true; o.cleared = true; }
    w.objectsDirty = true;
  };
  const road = (a, b, width, tag) => { // chemin + nœuds de navigation
    const L = Math.hypot(b.x - a.x, b.z - a.z), n = Math.max(2, Math.ceil(L / 10));
    let prev = null, last = -1, acc = 0;
    for (let k = 0; k <= n; k++) {
      const t = k / n, off = Math.sin(t * Math.PI) * Math.sin(a.x * 0.013 + k * 0.7) * Math.min(12, L * 0.05);
      const nx = -(b.z - a.z) / (L || 1), nz = (b.x - a.x) / (L || 1);
      const p = { x: lerp(a.x, b.x, t) + nx * off, z: lerp(a.z, b.z, t) + nz * off };
      if (prev && width > 0) B.paintLine(prev.x, prev.z, p.x, p.z, width, M_DIRT);
      if (prev) acc += Math.hypot(p.x - prev.x, p.z - prev.z);
      if (k === 0 || k === n || acc > 18) { const ni = B.navNode(p.x, p.z, tag || 'chemin'); if (last >= 0) B.navLink(last, ni, 'road'); last = ni; acc = 0; }
      prev = p;
    }
  };
  // nœud de chemin le plus proche d'un point (pour raccorder un lieu au réseau)
  const nearestRoadNode = (x, z) => { let best = null, bd = 1e9; for (const n of w.nav.nodes) { if (n.iso || !/chemin|route|rue|hameau|place|pont/.test(n.tag)) continue; const d = Math.hypot(n.x - x, n.z - z); if (d < bd) { bd = d; best = n; } } return best; };
  const protect = (x, z, r, why) => PROTECTED.push({ x, z, r, why });
  const landmark = (key, x, z, r, extra) => B.landmark(key, x, z, r, extra);

  // ================================================================ la grande bibliothèque
  {
    const s = siteNear(2060, 1400, 110, 16, { pull: 0.02, minH: 8 });
    const f = { x: Math.round(s.x), y: s.y, z: Math.round(s.z), r: 0 };
    const rn = nearestRoadNode(f.x, f.z);
    if (rn) f.r = Math.round(Math.atan2(-(rn.x - f.x), -(rn.z - f.z)) / (Math.PI / 2)) * Math.PI / 2; // la façade regarde le chemin
    clearAround(f.x, f.z, 22);
    B.flattenRect(f, 14, 11, f.y, 10);
    f.y = H(f.x, f.z);
    const W = 22, D = 16;
    const Bl = B.building('bibliotheque', f, W, D, { floors: 3, wall: M_STONE, win: M_STONEWIN, roof: M_SLATE, chimney: true, roofH: 4.2, dw: 2.2, dh: 3.0 }, function (bf, W, D, B2) {
      // rayonnages : trois rangées, et contre les murs
      for (const lz of [-2.5, 1.0, 4.5]) for (const lx of [-7.5, -4.5, 4.5, 7.5]) this.propRel(bf, 'etagere', lx, 0.15, lz, lz > 0 ? Math.PI : 0, { kind: 'livres' });
      for (let lx = -9.5; lx <= 9.5; lx += 1.6) this.propRel(bf, 'etagere', lx, 0.15, D / 2 - 0.45, Math.PI, { kind: 'livres' });
      this.propRel(bf, 'comptoir', 0, 0.15, -3.6, 0);
      this.spot(bf, B2, 'work', 0, -2.6, Math.PI);
      for (const [lx, lz] of [[-2.8, 2.6], [2.8, 2.6]]) { this.propRel(bf, 'table', lx, 0.15, lz, 0); this.propRel(bf, 'chaise', lx, 0.15, lz - 0.8, Math.PI); this.propRel(bf, 'chaise', lx, 0.15, lz + 0.8, 0); this.propRel(bf, 'bougie', lx, 0.95, lz, 0); }
      this.propRel(bf, 'vitrine', -W / 2 + 1.2, 0.15, -D / 2 + 1.6, Math.PI / 2);
      this.propRel(bf, 'lit', W / 2 - 1.2, 0.15, -D / 2 + 2.2, Math.PI / 2, { col: '#2a2a3a' });
      this.spot(bf, B2, 'bed', W / 2 - 1.2, -D / 2 + 2.2, Math.PI / 2);
      this.spot(bf, B2, 'sit', 2.8, 1.8, Math.PI);
      this.propRel(bf, 'cheminee', -W / 2 + 0.62, 0.15, 3.0, Math.PI / 2, { lit: true });
      this.interRel(bf, 'biblio', 'biblio_comptoir', 0, 1.2, -4.3, 'Parler de livres (comptoir)');
      this.interRel(bf, 'biblio_rayon', 'biblio_rayon', -6, 1.2, 0.2, 'Parcourir les rayonnages');
      this.interRel(bf, 'biblio_vitrine', 'biblio_vitrine', -W / 2 + 1.9, 1.1, -D / 2 + 1.6, 'Regarder la vitrine');
      this.interRel(bf, 'biblio_secret', 'biblio_secret', 7.5, 1.2, D / 2 - 1.2, 'Examiner le rayonnage du fond');
    });
    landmark('bibliotheque', Bl.out[0], Bl.out[1], 18);
    if (rn) road({ x: Bl.out[0], z: Bl.out[1] }, rn, 1.2);
    protect(f.x, f.z, 30, 'la bibliothèque');
    // la salle des archives secrètes (sous terre, loin : on y descend par le rayonnage)
    const af = B.underRoom(2920, 2940, 12, 10, 3.6, 30, M_STONE, M_PLANKS);
    for (let lx = -5; lx <= 5; lx += 1.7) B.propRel(af, 'etagere', lx, 0, 4.6, Math.PI, { kind: 'livres' });
    B.propRel(af, 'table', 0, 0, 0, 0); B.propRel(af, 'bougie', 0, 0.8, 0, 0); B.propRel(af, 'lanterne_sol', -4, 0, -3, 0); B.propRel(af, 'lanterne_sol', 4, 0, -3, 0);
    B.propRel(af, 'coffre_vieux', 4.5, 0, 3, Math.PI, { vide: false });
    const [cx, cz] = B.toWorld(af, 4.5, 3); B.inter('loot', 'archives_coffre', cx, af.y + 0.6, cz, 'Fouiller', { table: 'archives', prop: w.props.length - 1 });
    const [bx, bz] = B.toWorld(af, 0, 0.4); B.inter('archives_livre', 'archives_livre', bx, af.y + 1, bz, 'Lire le registre ouvert');
    const [ex, ez] = B.toWorld(af, 0, -4.2); B.propRel(af, 'echelle', 0, 0, -4.7, 0, { h: 3.6 });
    const [rx, rz] = B.toWorld(f, 7.5, D / 2 - 2.2);
    B.inter('ladder', 'archives_sortie', ex, af.y + 1, ez, 'Remonter', { to: [rx, f.y + 0.2, rz] });
    w.archives = { to: [ex, af.y + 0.1, ez] };
    landmark('archives', af.x, af.z, 8, { under: true, secret: true });
  }

  // ================================================================ les Sources (naturistes)
  {
    const s = siteNear(2320, 2380, 170, 24, { pull: 0.01 });
    const f = { x: Math.round(s.x), y: s.y, z: Math.round(s.z), r: rnd() * TAU };
    clearAround(f.x, f.z, 34);
    B.flatten(f.x, f.z, 26, f.y, 14);
    f.y = H(f.x, f.z);
    B.paintDisk(f.x, f.z, 30, M_LUSH, 2, true);
    B.paintDisk(f.x, f.z, 5, M_DIRT, 1, true);
    const sub = (lx, lz, rr) => { const [x, z] = B.toWorld(f, lx, lz); return { x, y: f.y, z, r: f.r + rr }; };
    const houses = [['source_a', -16, -8, Math.PI / 2, '#6a9a5a'], ['source_b', 16, -8, -Math.PI / 2, '#8a6a4a'], ['source_c', 0, 18, Math.PI, '#5a7a9a']];
    for (const [key, lx, lz, rr, col] of houses) {
      B.building(key, sub(lx, lz, rr), 7, 6, { wall: M_TIMBER, win: M_TIMBERWIN, roof: M_THATCH, chimney: key === 'source_b' }, function (bf, W, D, B2) { this.furnishHome(bf, W, D, B2, { bedCol: col }); });
    }
    // les bassins d'eau chaude (dalles de pierre, eau fumante)
    const pools = [[0, -2, 7, 5], [-7, 9, 4.5, 3.5], [8, 9, 4, 4]];
    pools.forEach(([lx, lz, pw, pd], i) => {
      const [x, z] = B.toWorld(f, lx, lz), pf = { x, y: f.y, z, r: f.r };
      B.block(pf, 0, -0.55, 0, pw + 0.8, 0.5, pd + 0.8, M_STONE);
      for (const [a, b, sx, sz] of [[0, pd / 2 + 0.2, pw + 0.8, 0.4], [0, -pd / 2 - 0.2, pw + 0.8, 0.4], [pw / 2 + 0.2, 0, 0.4, pd], [-pw / 2 - 0.2, 0, 0.4, pd]]) B.block(pf, a, -0.05, b, sx, 0.35, sz, M_STONE);
      B.block(pf, 0, -0.12, 0, pw, 0.1, pd, M_WATERB);
      w.pools.push({ x, z, y: f.y - 0.02, w: pw, d: pd, r: f.r, kind: 'bains', hot: true });
      if (i === 0) B.inter('bain', 'bain_grand', x, f.y + 0.2, z, 'Se baigner');
    });
    const [sx, sz] = B.toWorld(f, 11, -2); B.prop('stele', sx, H(sx, sz), sz, f.r, { ins: 'a_nains' }); B.inter('inscription', 'ins_sources', sx, H(sx, sz) + 1.1, sz, 'Lire la pierre gravée', { ins: 'a_nains' });
    for (let k = 0; k < 6; k++) { const a = k / 6 * TAU, [x, z] = B.toWorld(f, Math.cos(a) * 12, Math.sin(a) * 12 + 3); B.prop('lanterne_sol', x, H(x, z), z, 0); }
    landmark('sources', f.x, f.z, 30, { fish: 'bains' });
    const c = B.navNode(f.x + 1, f.z + 1, 'bains');
    const [lx2, lz2] = B.toWorld(f, 0, -8); B.navNode(lx2, lz2, 'bains');
    const rn = nearestRoadNode(f.x, f.z);
    if (rn) road({ x: f.x, z: f.z }, rn, 0.9);
    w.sources = { x: f.x, z: f.z, y: f.y, r: 30, node: c };
    protect(f.x, f.z, 40, 'les Sources');
  }

  // ================================================================ le relais de chasse
  {
    const s = siteNear(1190, 1390, 120, 10, { pull: 0.02 });
    const f = { x: Math.round(s.x), y: s.y, z: Math.round(s.z), r: Math.floor(rnd() * 4) * Math.PI / 2 };
    clearAround(f.x, f.z, 12);
    B.flattenRect(f, 7, 6, f.y, 8); f.y = H(f.x, f.z);
    const Bl = B.building('relais_chasse', f, 9, 7, { wall: M_LOGS, win: M_TIMBERWIN, roof: M_ROOF, chimney: true }, function (bf, W, D, B2) {
      this.furnishHome(bf, W, D, B2, { bedCol: '#5a4a2a' });
      this.propRel(bf, 'trophee', 0, 1.8, D / 2 - 0.35, Math.PI);
      this.spot(bf, B2, 'work', 1.5, 1.0, 0);
    });
    B.propRel(f, 'tonneau', 5.2, 0, -2.5, 0); B.propRel(f, 'sechoir_peaux', -6, 0, -2, 0.3);
    landmark('relais_chasse', Bl.out[0], Bl.out[1], 14);
    const rn = nearestRoadNode(f.x, f.z);
    if (rn) road({ x: Bl.out[0], z: Bl.out[1] }, rn, 0.8);
    B.navNode(f.x + 18, f.z + 12, 'chasse'); B.navNode(f.x - 16, f.z + 20, 'chasse'); B.navNode(f.x + 6, f.z + 32, 'chasse');
    w.relais = { x: f.x, z: f.z };
  }

  // ================================================================ les roulottes des colporteurs (près de la porte sud)
  if (w.townInfo) {
    const T = w.townInfo, g = T.gS || [T.x, T.z + 60];
    let k = 0;
    for (const key of ['roulotte_a', 'roulotte_b']) {
      const s = siteNear(g[0] + (k ? 40 : -40), g[1] + 30, 40, 5, { pull: 0.05 });
      const f = { x: Math.round(s.x), y: s.y, z: Math.round(s.z), r: Math.round(rnd() * 4) * Math.PI / 2 };
      clearAround(f.x, f.z, 7);
      B.flattenRect(f, 3, 4, f.y, 5); f.y = H(f.x, f.z);
      const Bl = B.building(key, f, 2.8, 5, { wall: M_PLANKS, win: M_PLANKS, roof: M_ROOF, roofH: 1.1, dw: 1.0, dh: 1.9, found: M_PLANKS }, function (bf, W, D, B2) {
        this.bed(bf, B2, 0, D / 2 - 1.3, k ? '#8a2a3a' : '#3a5a2a');
        this.spot(bf, B2, 'sit', 0, 0, 0);
      });
      for (const [lx, lz] of [[-1.55, -1.6], [1.55, -1.6], [-1.55, 1.6], [1.55, 1.6]]) B.propRel(f, 'roue_deco', lx, -0.2, lz, Math.PI / 2);
      landmark(key, Bl.out[0], Bl.out[1], 6);
      k++;
    }
    landmark('roulottes', g[0], g[1] + 30, 40);
  }

  // ================================================================ l'échoppe de l'alchimiste (une maison vide de la ville)
  const alch = w.bld.vide6;
  if (alch) {
    B.propRel(alch.f, 'table_alchimie', 1.5, 0.15, 1.4, Math.PI);
    B.interRel(alch.f, 'alch_table', 'alch_table_ville', 1.5, 1.0, 0.7, 'Utiliser la table d’alchimiste');
    B.propRel(alch.f, 'etagere', -2.5, 0.15, -1.5, Math.PI / 2, { kind: 'bocaux' });
    const [x, z] = B.toWorld(alch.f, 1.5, -alch.D / 2);
    B.prop('enseigne', x, alch.f.y, z, alch.f.r, { k: 'alchimiste' });
    const [ix, iz] = B.toWorld(alch.f, 1.5, -alch.D / 2 - 0.75);
    B.inter('lire', 'ens_alchimie', ix, alch.f.y + 2.0, iz, 'Lire l’enseigne', { text: ['Alchimiste', 'Identification des plantes, remèdes, potions.\nTables d’alchimiste sur commande.'] });
    alch.spots.work = { x: B.toWorld(alch.f, 1.5, 0.3)[0], y: alch.f.y + 0.15, z: B.toWorld(alch.f, 1.5, 0.3)[1], r: alch.f.r + Math.PI };
    landmark('echoppe', alch.out[0], alch.out[1], 6);
    LIEU_NAMES.echoppe = 'l’échoppe de l’alchimiste';
  }

  // ================================================================ les halles des nains (sous la montagne : un coin éloigné de la carte)
  {
    const cx = 330, cz = 2780, Wd = 44, Dd = 32, Hh = 7;
    const hall = B.underRoom(cx, cz, Wd, Dd, Hh, 34, M_ROCK, M_COBBLE);
    const y0 = hall.y;
    // piliers, maisons creusées, forge, lac
    for (const [lx, lz] of [[-12, -8], [0, -8], [12, -8], [-12, 8], [0, 8], [12, 8]]) B.block(hall, lx, 0, lz, 1.4, Hh, 1.4, M_STONE);
    const room = (key, lx, lz, W, D, bedCol, furnish) => { // pièce ouverte (sans porte) contre le mur du fond
      const f = { x: B.toWorld(hall, lx, lz)[0], y: y0, z: B.toWorld(hall, lx, lz)[1], r: 0 };
      B.block(f, 0, 0, D / 2, W, Hh - 0.5, 0.4, M_STONE); B.block(f, -W / 2, 0, 0, 0.4, Hh - 0.5, D, M_STONE); B.block(f, W / 2, 0, 0, 0.4, Hh - 0.5, D, M_STONE);
      const inn = B.toWorld(f, 0, -D / 2 + 1.2), mid = B.toWorld(f, 0, 0.3), out = B.toWorld(f, 0, -D / 2 - 1.5);
      const nOut = B.navNode(out[0], out[1], key + ':out'), nIn = B.navNode(inn[0], inn[1], key + ':in'), nMid = B.navNode(mid[0], mid[1], key + ':mid');
      B.navLink(nOut, nIn); B.navLink(nIn, nMid);
      const Bk = { key, name: LIEU_NAMES[key], x: f.x, z: f.z, y: y0 + 0.02, f, W, D, H: Hh, door: -1, nOut, nIn, nMid, spots: {}, out, under: true };
      w.bld[key] = Bk;
      B.bed(f, Bk, -W / 2 + 0.9, D / 2 - 1.3, bedCol);
      furnish(f, Bk, W, D);
      return Bk;
    };
    room('nain_a', -14, 10, 8, 7, '#6a4a2a', (f, Bk) => { B.propRel(f, 'table', 1.5, 0, 0.5, 0); B.propRel(f, 'chaise', 1.5, 0, -0.3, Math.PI); B.spot(f, Bk, 'work', 1.5, -0.3, Math.PI); B.spot(f, Bk, 'sit', 1.5, -0.3, Math.PI); B.propRel(f, 'etagere', 3.2, 0, 2.5, -Math.PI / 2, { kind: 'livres' }); });
    room('nain_b', 14, 10, 9, 7, '#8a3a2a', (f, Bk) => { B.propRel(f, 'enclume', 0.5, 0, -0.5, 0); B.propRel(f, 'four', 3, 0, 2.2, Math.PI, { lit: true }); B.spot(f, Bk, 'work', 0.5, -1.4, 0); B.spot(f, Bk, 'sit', 0.5, -1.4, 0); });
    // lac des nains
    const [px, pz] = B.toWorld(hall, 0, -11); B.block({ x: px, y: y0, z: pz, r: 0 }, 0, -0.08, 0, 9, 0.12, 5, M_WATERB); w.blocks[w.blocks.length - 1].under = true;
    w.pools.push({ x: px, z: pz, y: y0 + 0.05, w: 9, d: 5, r: 0, kind: 'souterrain' });
    // lumières : cristaux, forge, lanternes ; mousse dorée
    for (const [lx, lz] of [[-18, -12], [18, -12], [-6, 0], [6, 0], [-18, 2], [18, 2]]) B.propRel(hall, 'cristal_lumineux', lx, 0, lz, rnd() * TAU);
    for (let k = 0; k < 14; k++) { const [x, z] = B.toWorld(hall, (rnd() - 0.5) * (Wd - 4), (rnd() - 0.5) * (Dd - 4)); B.obj('mousse_nains', x, z, 0.12, { y: y0 }); }
    // l'écriture sur le mur
    const [ix, iz] = B.toWorld(hall, 0, Dd / 2 - 0.6); B.prop('stele', ix, y0, iz, Math.PI, { ins: 'g_dwerr' }); B.inter('inscription', 'ins_nains', ix, y0 + 1.2, iz, 'Lire l’inscription', { ins: 'g_dwerr' });
    const [ix2, iz2] = B.toWorld(hall, -8, Dd / 2 - 0.6); B.prop('stele', ix2, y0, iz2, Math.PI, { ins: 'a_nains' }); B.inter('inscription', 'ins_nains2', ix2, y0 + 1.2, iz2, 'Lire l’inscription', { ins: 'a_nains' });
    // navigation : un maillage dans la halle
    // (liens posés à la main : sous terre, le calcul automatique ne voit que le relief de surface)
    const grid = {};
    for (let lz = -10; lz <= 4; lz += 7) for (let lx = -18; lx <= 18; lx += 9) { const [x, z] = B.toWorld(hall, lx, lz); grid[lx + ',' + lz] = B.navNode(x, z, lx === 0 && lz === -3 ? 'village:nains' : 'halle:' + lx + ',' + lz); }
    for (const k in grid) { const [lx, lz] = k.split(',').map(Number); if (grid[(lx + 9) + ',' + lz] !== undefined) B.navLink(grid[k], grid[(lx + 9) + ',' + lz]); if (grid[lx + ',' + (lz + 7)] !== undefined) B.navLink(grid[k], grid[lx + ',' + (lz + 7)]); }
    for (const key of ['nain_a', 'nain_b']) { const Bk = w.bld[key], O = w.nav.nodes[Bk.nOut]; let bi = -1, bd = 1e9; for (const k in grid) { const q = w.nav.nodes[grid[k]], d = Math.hypot(q.x - O.x, q.z - O.z); if (d < bd) { bd = d; bi = grid[k]; } } B.navLink(Bk.nOut, bi); }
    // sortie : un escalier taillé, qui remonte à la falaise
    const [sx, sz] = B.toWorld(hall, -Wd / 2 + 2, -Dd / 2 + 2);
    B.propRel(hall, 'echelle', -Wd / 2 + 1.2, 0, -Dd / 2 + 2, Math.PI / 2, { h: Hh });
    w.nains = { hall: { x: hall.x, z: hall.z, y: y0 }, inside: [sx, y0 + 0.05, sz] };
    landmark('nains', hall.x, hall.z, 24, { under: true, secret: true });
    // la fente de la falaise : au nord-est de la Combe Perdue, dans une paroi
    let fx = 1470, fz = 790, bestS = -1;
    const trail = VALLEY_DESIGN.wild.trail;
    for (let k = 0; k < 400; k++) {
      const x = 1380 + rnd() * 200, z = 700 + rnd() * 160, n = w.normalAt(x, z), h = H(x, z);
      if (h < WL + 6 || n[1] > 0.8) continue;
      if (trail.some(([tx, tz]) => Math.hypot(tx - x, tz - z) < 40)) continue; // loin de la piste : on ne la voit pas en passant
      const steep = 1 - n[1] + rnd() * 0.05;
      if (steep > bestS) { bestS = steep; fx = x; fz = z; }
    }
    const nrm = w.normalAt(fx, fz), face = Math.atan2(nrm[0], nrm[2]);
    const fy = H(fx, fz);
    B.prop('fente_falaise', fx, fy - 0.3, fz, face);
    B.inter('fente_nains', 'fente_nains', fx + Math.sin(face) * 0.9, fy + 1.2, fz + Math.cos(face) * 0.9, 'Examiner la fente', {});
    B.inter('ladder', 'nains_sortie', sx, y0 + 1, sz, 'Remonter à la falaise', { to: [fx + Math.sin(face) * 2.2, fy + 0.1, fz + Math.cos(face) * 2.2] });
    w.nains.door = [fx, fy, fz, face];
    landmark('fente_nains', fx, fz, 6, { secret: true });
  }

  // ================================================================ le camp des géants (hauteurs de l'est)
  {
    const s = siteNear(2170, 930, 170, 18, { pull: 0.004, minH: 34, dry: 30 });
    const f = { x: Math.round(s.x), y: s.y, z: Math.round(s.z), r: rnd() * TAU };
    clearAround(f.x, f.z, 26);
    B.flatten(f.x, f.z, 18, f.y, 16); f.y = H(f.x, f.z);
    B.paintDisk(f.x, f.z, 16, M_DRY, 3, true);
    B.block(f, 0, 0, 0, 9, 3.6, 5, M_STONE); B.block(f, 0, 3.6, 0, 11, 0.8, 6.5, M_MOSSY); // la table
    for (let k = 0; k < 7; k++) { const a = k / 7 * TAU + 0.3, [x, z] = B.toWorld(f, Math.cos(a) * 13, Math.sin(a) * 13); B.prop('pierre_dressee', x, H(x, z), z, a, null, 1.8 + rnd() * 0.8); }
    const [hx, hz] = B.toWorld(f, 9, 7); B.prop('feu_geant', hx, H(hx, hz), hz, 0);
    for (let k = 0; k < 3; k++) { const [x, z] = B.toWorld(f, -8 + k * 3, -9 - k); B.prop('os_geant', x, H(x, z), z, rnd() * TAU); }
    const [bx, bz] = B.toWorld(f, -10, 6); B.prop('lit_geant', bx, H(bx, bz), bz, f.r);
    const [ix, iz] = B.toWorld(f, 0, 5.5); B.prop('stele', ix, H(ix, iz), iz, f.r, { ins: 'g_mor' }, 1.6); B.inter('inscription', 'ins_geants', ix, H(ix, iz) + 1.6, iz, 'Lire les cupules', { ins: 'g_mor' });
    landmark('geants', f.x, f.z, 40, { secret: true });
    w.geants = { x: f.x, z: f.z, y: f.y };
  }

  // ================================================================ le temple sous la montagne (immense)
  {
    // l'entrée : derrière une cascade, là où naît la rivière (au pied des contreforts)
    const src = (VALLEY_DESIGN.core.rivers[0].pts[0]), ox = DESIGN_OFF[0], oz = DESIGN_OFF[1];
    let ex = src[0] + ox, ez = src[1] + oz - 14;
    // la paroi la plus raide juste au nord de la source
    let best = -1;
    for (let k = 0; k < 200; k++) {
      const x = src[0] + ox + (rnd() - 0.5) * 60, z = src[1] + oz - 8 - rnd() * 50, n = w.normalAt(x, z);
      const st = (1 - n[1]) + (H(x, z) - WL) * 0.002;
      if (st > best && H(x, z) > WL + 1) { best = st; ex = x; ez = z; }
    }
    const nrm = w.normalAt(ex, ez), face = Math.atan2(nrm[0], nrm[2]), ey = H(ex, ez);
    const ef = { x: ex, y: ey, z: ez, r: face };
    clearAround(ex, ez, 8);
    B.prop('cascade', ex, ey, ez, face);
    B.prop('grotte_bouche', ex, ey - 0.2, ez, face);
    const [ix, iz] = B.toWorld(ef, 0, 1.4);
    B.inter('temple_entree', 'temple_entree', ix, ey + 1.3, iz, 'Passer derrière la cascade', {});
    landmark('cascade', ex, ez, 10);
    // le temple lui-même : coin nord-est de la carte, profondément sous les Monts
    const TX = 2760, TZ = 330, D0 = 40;
    let minH = 1e9; for (let dz = -80; dz <= 80; dz += 8) for (let dx = -70; dx <= 70; dx += 8) minH = Math.min(minH, H(TX + dx, TZ + dz));
    const ty = minH - D0, T = { x: TX, y: ty, z: TZ, r: 0 };
    const under = (fn) => { const n0 = w.blocks.length; fn(); for (let k = n0; k < w.blocks.length; k++) w.blocks[k].under = true; };
    const hall = (lx, lz, W, D, Hh, mat, floor, gaps) => under(() => { // salle avec ouvertures : gaps = { n: largeur, s: …, e: …, w: … }
      B.block(T, lx, -0.6, lz, W + 1, 0.6, D + 1, floor);
      B.block(T, lx, Hh, lz, W + 1, 0.9, D + 1, mat); w.blocks[w.blocks.length - 1].ceil = true;
      const wall = (cx, cz, len, alongX, gap) => {
        if (!gap) { B.block(T, cx, 0, cz, alongX ? len : 0.8, Hh, alongX ? 0.8 : len, mat); return; }
        const seg = (len - gap) / 2;
        for (const s of [-1, 1]) B.block(T, cx + (alongX ? s * (gap / 2 + seg / 2) : 0), 0, cz + (alongX ? 0 : s * (gap / 2 + seg / 2)), alongX ? seg : 0.8, Hh, alongX ? 0.8 : seg, mat);
        B.block(T, cx, Math.min(Hh, 4.2), cz, alongX ? gap : 0.8, Hh - Math.min(Hh, 4.2), alongX ? 0.8 : gap, mat);
      };
      wall(lx, lz - D / 2 - 0.4, W + 1.6, true, gaps.n); wall(lx, lz + D / 2 + 0.4, W + 1.6, true, gaps.s);
      wall(lx - W / 2 - 0.4, lz, D, false, gaps.w); wall(lx + W / 2 + 0.4, lz, D, false, gaps.e);
    });
    // vestibule (on arrive ici) -> couloir -> porte des Trois -> grande salle -> chapelles, bassin, tombeau
    hall(0, 70, 14, 10, 5, M_STONE, M_COBBLE, { n: 4 });
    hall(0, 52, 5, 26, 5, M_STONE, M_COBBLE, { n: 4, s: 4 });
    hall(0, 34, 18, 10, 7, M_STONE, M_STONE, { n: 5, s: 4 });            // l'antichambre de la porte
    hall(0, 26.5, 5, 5, 6, M_STONE, M_STONE, { n: 4.5, s: 4.5 });         // le passage de la porte
    hall(0, -4, 64, 56, 16, M_STONE, M_STONE, { s: 5, w: 5, e: 5, n: 6 }); // la grande salle
    hall(-44, -4, 22, 18, 8, M_MOSSY, M_STONE, { e: 5 });                 // chapelle d'Aëla
    hall(44, -4, 22, 18, 8, M_DARK, M_STONE, { w: 5 });                   // chapelle de Vesh
    hall(0, -44, 30, 24, 10, M_STONE, M_STONE, { s: 6 });                 // la salle du Dormeur
    // la porte des Trois : un mur qui s'ouvre (bloc masqué quand elle est ouverte)
    const nD = w.blocks.length;
    B.block(T, 0, 0, 28.6, 5.2, 4.3, 0.8, M_SLATE);
    w.blocks[nD].under = true; w.blocks[nD].templeDoor = true;
    w.temple = { x: TX, y: ty, z: TZ, arrive: [TX, ty + 0.1, TZ + 72], door: nD, exit: [ex + Math.sin(face) * 3, ey + 0.1, ez + Math.cos(face) * 3] };
    // les trois pierres de la porte (à toucher dans l'ordre)
    [['aela', -6], ['durn', 0], ['vesh', 6]].forEach(([k, lx], i) => {
      const [x, z] = B.toWorld(T, lx, 36);
      B.prop('pierre_trois', x, ty, z, Math.PI, { k });
      B.inter('pierre_trois', 'pierre_' + k, x, ty + 1.1, z, 'Toucher la pierre', { k, i });
    });
    const insc = (id, lx, lz, r) => { const [x, z] = B.toWorld(T, lx, lz); B.prop('stele', x, ty, z, r, { ins: id }, 1.3); B.inter('inscription', 'ins_' + id, x, ty + 1.4, z, 'Lire l’inscription', { ins: id }); };
    insc('a_seuil', -7, 65.5, 0); insc('a_porte', 7, 38.5, Math.PI); insc('g_rag', 7, 65.5, 0);
    insc('a_trois', 0, 20, Math.PI); insc('a_chant', -40, 4, Math.PI); insc('a_lune', 20, -26, 0);
    // grande salle : deux rangées de piliers, les statues des Trois, le bassin sacré
    under(() => { for (let lz = -26; lz <= 18; lz += 11) for (const lx of [-18, 18]) B.block(T, lx, 0, lz, 2.4, 16, 2.4, M_STONE); });
    [['aela', -10], ['durn', 0], ['vesh', 10]].forEach(([k, lx]) => { const [x, z] = B.toWorld(T, lx, -24); B.prop('statue_dieu', x, ty, z, 0, { k }, 1); });
    const [px, pz] = B.toWorld(T, 0, 2); under(() => { B.block(T, 0, -0.35, 2, 14, 0.3, 10, M_STONE); B.block(T, 0, -0.08, 2, 12, 0.12, 8, M_WATERB); });
    w.pools.push({ x: px, z: pz, y: ty + 0.05, w: 12, d: 8, r: 0, kind: 'temple' });
    // chapelles : autel d'Aëla (bénédiction), autel de Vesh (pacte), trésors
    { const [x, z] = B.toWorld(T, -50, -4); B.prop('autel', x, ty, z, Math.PI / 2); B.inter('autel_aela', 'autel_aela', x + 1.2, ty + 1, z, 'S’agenouiller devant l’autel d’Aëla'); }
    { const [x, z] = B.toWorld(T, 50, -4); B.prop('autel', x, ty, z, -Math.PI / 2); B.inter('autel_vesh', 'autel_vesh', x - 1.2, ty + 1, z, 'Poser la main sur l’autel noir'); }
    for (const [lx, lz, tab] of [[-50, 4, 'temple'], [50, 4, 'temple'], [-36, -10, 'temple'], [10, -52, 'temple_or']]) {
      const [x, z] = B.toWorld(T, lx, lz); const p = B.prop('coffre_vieux', x, ty, z, rnd() * TAU, { vide: false });
      B.inter('loot', 'temple_' + lx + '_' + lz, x, ty + 0.6, z, 'Fouiller', { table: tab, prop: w.props.length - 1, temple: true });
    }
    // le Dormeur : une statue couchée, immense
    { const [x, z] = B.toWorld(T, 0, -47); B.prop('dormeur', x, ty, z, 0); B.inter('dormeur', 'dormeur', x, ty + 2, z + 7, 'Regarder le Dormeur'); }
    { const [x, z] = B.toWorld(T, -10, -53); B.inter('tombeau', 'tombeau_aelim', x, ty + 1, z + 0.9, 'Lire le tombeau'); B.prop('tombe', x, ty, z, 0); }
    for (let k = 0; k < 10; k++) { const [x, z] = B.toWorld(T, (rnd() - 0.5) * 56, (rnd() - 0.5) * 48 - 4); B.obj('fleur_temple', x, z, 0.35, { y: ty }); }
    // lumières : cristaux et braseros
    for (const [lx, lz] of [[-26, -24], [26, -24], [-26, 16], [26, 16], [0, 33], [0, 68], [-44, -10], [44, -10], [-10, -38], [10, -38], [0, 52], [0, 44]]) B.propRel(T, 'cristal_lumineux', lx, 0, lz, rnd() * TAU);
    // retour : l'échelle du vestibule remonte à la cascade
    const [lx0, lz0] = B.toWorld(T, 0, 74.4); B.propRel(T, 'echelle', 0, 0, 74.6, Math.PI, { h: 5 });
    B.inter('ladder', 'temple_sortie', lx0, ty + 1, lz0, 'Ressortir par la cascade', { to: w.temple.exit });
    landmark('temple', TX, TZ, 60, { under: true, secret: true });
  }

  // ================================================================ les douves : des échelles pour en ressortir
  if (w.townInfo) {
    const T = w.townInfo, half = 46;
    const spots = [[-30, -1], [30, -1], [-30, 1], [30, 1], [-1, -25], [1, 25], [-1, 25], [1, -25]];
    let k = 0;
    for (const [a, b] of spots) {
      const side = Math.abs(a) > Math.abs(b) ? 'z' : 'x';
      for (const inner of [true, false]) {
        const d = inner ? 47.9 : 54.2, sgn = side === 'z' ? Math.sign(b) : Math.sign(a);
        const x = T.x + (side === 'z' ? a : sgn * d), z = T.z + (side === 'z' ? sgn * d : b);
        const r = side === 'z' ? (sgn > 0 ? (inner ? 0 : Math.PI) : (inner ? Math.PI : 0)) : (sgn > 0 ? (inner ? Math.PI / 2 : -Math.PI / 2) : (inner ? -Math.PI / 2 : Math.PI / 2));
        const top = inner ? H(T.x, T.z) : H(x + (side === 'x' ? sgn * 3 : 0), z + (side === 'z' ? sgn * 3 : 0));
        const bot = WL - 1.7, h = Math.max(1.5, top - bot + 0.6);
        B.prop('echelle', x, bot, z, r, { h });
        const to = inner ? [x - (side === 'x' ? sgn * 1.6 : 0), top + 0.1, z - (side === 'z' ? sgn * 1.6 : 0)] : [x + (side === 'x' ? sgn * 1.8 : 0), top + 0.1, z + (side === 'z' ? sgn * 1.8 : 0)];
        B.inter('grimper', 'douve_echelle' + k++, x, WL + 0.4, z, 'Grimper à l’échelle', { to });
      }
    }
    w.moat = { x: T.x, z: T.z, inner: 47.4, outer: 55.5 };
    w.fishZones = w.fishZones || [];
    w.fishZones.unshift({ x: T.x, z: T.z, r: 60, kind: 'douves' });
  }

  // ================================================================ où l'on ne bâtit pas
  if (w.townInfo) protect(w.townInfo.x, w.townInfo.z, 72, 'la ville');
  const lm = w.lm;
  for (const [k, r, why] of [['hameau', 48, 'le hameau'], ['hameau_abandonne', 36, 'le hameau abandonné'], ['cimetiere', 22, 'le cimetière'], ['eglise', 20, 'l’église'], ['abbaye', 34, 'l’abbaye'],
    ['chateau', 34, 'le château'], ['cercle', 22, 'le cercle de pierres'], ['dolmen', 16, 'la Table des Géants'], ['chapelle', 16, 'la chapelle'], ['refuge', 14, 'le refuge'], ['relais_chasse', 14, 'le relais de chasse'],
    ['roulottes', 30, 'le campement des colporteurs'], ['geants', 34, 'le camp des géants'], ['cascade', 12, 'la cascade'], ['ferme', 0, '']])
    if (lm[k] && r) protect(lm[k].x, lm[k].z, r, why);
  w.noBuild = PROTECTED.slice();

  // ================================================================ chaque milieu, ses plantes et ses bêtes
  populateMilieux(w, B, rnd);

  // navigation : les nouveaux nœuds rejoignent le réseau ; les halles des nains forment leur propre îlot habité
  // (finalizeNav marque les îlots mais ne les « démarque » jamais : on repart de zéro à chaque passe)
  const renav = () => { for (const q of w.nav.nodes) delete q.iso; finalizeNav(w); };
  renav();
  // les maisons nouvelles restées à l'écart du réseau : un lien vers le nœud habité le plus proche
  let relink = false;
  // (sans traverser les douves : dehors on se raccorde dehors, dedans dedans)
  const TI = w.townInfo, horsVille = (x, z) => !TI || Math.max(Math.abs(x - TI.x), Math.abs(z - TI.z)) > 57;
  for (const key of ['bibliotheque', 'roulotte_a', 'roulotte_b', 'relais_chasse', 'source_a', 'source_b', 'source_c']) {
    const Bk = w.bld[key]; if (!Bk) continue;
    const O = w.nav.nodes[Bk.nOut];
    if (!O.iso) continue;
    let bi = -1, bd = 1e9;
    w.nav.nodes.forEach((q, i) => { if (q.iso || /:(in|mid|out)$/.test(q.tag) || q.tag.startsWith('halle') || q.tag.startsWith('village:') || /^pont_/.test(q.tag) || horsVille(q.x, q.z) !== horsVille(O.x, O.z)) return; const d = Math.hypot(q.x - O.x, q.z - O.z); if (d < bd) { bd = d; bi = i; } });
    if (bi >= 0) { B.navLink(Bk.nOut, bi, 'road'); relink = true; }
  }
  if (w.sources) for (const key of ['source_a', 'source_b', 'source_c']) if (w.bld[key]) { B.navLink(w.bld[key].nOut, w.sources.node); relink = true; }
  if (relink) renav();
  const N = w.nav, seen = new Set();
  for (let i = 0; i < N.nodes.length; i++) {
    if (!/^village:/.test(N.nodes[i].tag)) continue;
    const q = [i]; seen.add(i);
    while (q.length) { const c = q.shift(); N.nodes[c].iso = false; for (const e of N.adj[c]) if (!seen.has(e.to)) { seen.add(e.to); q.push(e.to); } }
  }
  w.objectsDirty = true; w.grid = null; w.blocksDirty = true; w.coverDirty = true; w.shadeDirty = true;
}

// ---------------------------------------------------------------- les milieux
// milieu d'un point : pres, foret, bouleaux, marais, lande, berges, riviere, alpage, neiges, sapiniere, combe, rochers, ville
function milieuAt(w, x, z) {
  const WL = w.waterLevel, h = w.heightAt(x, z), sl = (w.snowLine || 1e4) - WL, b = w.biome ? BIOMES[w.biome[clamp(Math.floor(z / 8), 0, w.biomeW - 1) * w.biomeW + clamp(Math.floor(x / 8), 0, w.biomeW - 1)]] : 'plaine';
  const alt = h - WL, n = w.normalAt(x, z), m = w.matAt(x, z);
  if (b === 'ville') return 'ville';
  if (alt < 1.2 && alt > -0.3) { for (const Z of w.fishZones || []) if (Math.hypot(Z.x - x, Z.z - z) < Z.r * 1.25) return Z.kind === 'riviere' ? 'riviere' : Z.kind === 'marais' ? 'marais' : 'berges'; return 'berges'; }
  if (m === M_SNOW || m === M_ICE || alt > sl - 6) return 'neiges';
  if (n[1] < 0.75 || m === M_ROCK) return alt > 20 ? 'rochers' : 'rochers';
  if (Math.hypot((x - 1320) / 250, (z - 880) / 140) < 1) return 'combe';
  if (b === 'marais') return 'marais';
  if (b === 'foret' || b === 'bouleaux') return alt > 18 ? 'sapiniere' : b;
  if (alt > 26) return 'alpage';
  if (b === 'lande') return 'lande';
  if (b === 'ferme') return 'pres';
  return 'pres';
}
function populateMilieux(w, B, rnd) {
  const S = w.size, WL = w.waterLevel;
  const PER = [60, 32, 14, 5, 2]; // nombre de touffes par rareté (commune … légendaire)
  // index des milieux (échantillonnage grossier : 24 m)
  const pts = {};
  for (let z = 40; z < S - 40; z += 24) for (let x = 40; x < S - 40; x += 24) {
    const jx = x + (rnd() - 0.5) * 20, jz = z + (rnd() - 0.5) * 20;
    if (w.heightAt(jx, jz) < WL - 0.2) continue;
    const k = milieuAt(w, jx, jz);
    (pts[k] || (pts[k] = [])).push([jx, jz]);
  }
  const free = (x, z) => { let ok = true; w.query(x, z, 1.5, (o) => { if (ok && Math.hypot(o.x - x, o.z - z) < 1.2) ok = false; }, (b) => { if (!ok || b.under) return; const [lx, lz] = World.blockLocal(b, x, z); if (Math.abs(lx) < b.sx / 2 + 0.5 && Math.abs(lz) < b.sz / 2 + 0.5) ok = false; }); return ok; };
  // les plantes des milieux (touffes de 2 à 5 pieds)
  for (const [id, , , , , hab, rar] of PLANTES2) {
    if (!OBJ_INDEX[id] || hab.every((h) => h === 'souterrain')) continue;
    const cand = hab.flatMap((h) => pts[h] || []);
    if (!cand.length) continue;
    const n = PER[rar] || 2;
    for (let k = 0; k < n; k++) {
      const [cx, cz] = cand[(rnd() * cand.length) | 0], m = 2 + ((rnd() * 4) | 0);
      for (let j = 0; j < m; j++) {
        const x = cx + (rnd() - 0.5) * 6, z = cz + (rnd() - 0.5) * 6;
        if (w.heightAt(x, z) < WL + 0.05 || !free(x, z)) continue;
        B.obj(id, x, z);
      }
    }
  }
  // plantes souterraines : dans les grottes (mousse des nains aussi dans les Galeries)
  for (const blk of w.blocks) {
    if (!blk.under || blk.sy > 0.7 || blk.sx < 6 || blk.sz < 6 || blk.ceil || rnd() > 0.25) continue;
    const x = blk.x + (rnd() - 0.5) * (blk.sx - 2), z = blk.z + (rnd() - 0.5) * (blk.sz - 2);
    B.obj('mousse_nains', x, z, undefined, { y: blk.y + blk.sy });
  }
  // les bêtes des milieux (points d'apparition) : les nouvelles espèces, selon leur rareté
  const BEASTS = { chamois: 'chamoix', lievre_blanc: 'lievres_blancs', lagopede: 'lagopedes', castor: 'castors', salamandre: 'salamandres', cistude: 'cistudes', martre: 'martres', couleuvre: 'couleuvres', martin: 'martins', tetras: 'tetras_', aigle: 'aigles', chocard: 'chocards' };
  const NB = [22, 12, 6, 3, 1];
  for (const [kind, , hab, rar] of ESPECES_ANIMAUX) {
    const oid = BEASTS[kind];
    if (!oid || OBJ_INDEX[oid] === undefined) continue;
    const cand = hab.flatMap((h) => pts[h] || []);
    if (!cand.length) continue;
    for (let k = 0; k < (NB[rar] || 1); k++) {
      const [x, z] = cand[(rnd() * cand.length) | 0];
      if (w.heightAt(x, z) < WL + 0.2 && !CREATURES[kind].water) continue;
      B.obj(oid, x + (rnd() - 0.5) * 8, z + (rnd() - 0.5) * 8);
    }
  }
  // les ours : quelques-uns en plus dans les sapinières (rares) ; des chevreuils et des sangliers dans les bois de bouleaux
  for (const [oid, hab, n] of [['bears', 'sapiniere', 2], ['roes', 'bouleaux', 6], ['boar', 'bouleaux', 3], ['ibexes', 'rochers', 4], ['marmots', 'alpage', 6], ['snakes', 'lande', 4], ['herons', 'berges', 4]]) {
    const cand = pts[hab] || [];
    if (!cand.length || OBJ_INDEX[oid] === undefined) continue;
    for (let k = 0; k < n; k++) { const [x, z] = cand[(rnd() * cand.length) | 0]; B.obj(oid, x, z); }
  }
}
// branchement : après tout le reste de la vallée
{
  const _gv = generateValley;
  generateValley = async function (seed, progress, gen) {
    const w = await _gv(seed, progress, gen);
    if (w.designed) { if (progress) progress('Les lieux oubliés…'); addLieux3(w, w.seed || seed); }
    return w;
  };
}
